import {fadePort} from './startup/endpoint.mjs';
import fs from 'node:fs/promises';
import {ensureWindowControls} from './startup/window-controls.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {installInPage} from './startup/in-page.mjs';
const dir=path.dirname(fileURLToPath(import.meta.url));
const started=performance.now();
const timing=stage=>console.log(`[Inject +${((performance.now()-started)/1000).toFixed(2)}s] ${stage}`);
const port=await fadePort(),restore=process.argv.includes('--restore');
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid port');
const css=await fs.readFile(path.join(dir,'theme.css'),'utf8'),js=await fs.readFile(path.join(dir,'fade.js'),'utf8');
const expression=restore?'window.__fadeCodex?.destroy(); "restored"':`(() => {if(!document.body)throw Error('Page not ready');let s=document.getElementById('fade-codex-style');if(!s){s=document.createElement('style');s.id='fade-codex-style';document.head.append(s)}s.textContent=${JSON.stringify(css)};if(window.__fadeCodex)return window.__fadeCodex.status();${js}\nreturn window.__fadeCodex.status()})()`;
let seq=0;async function evaluate(target,code){
 const url=new URL(target.webSocketDebuggerUrl);if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname))throw Error('Non-local WebSocket rejected');
 return new Promise((resolve,reject)=>{const ws=new WebSocket(url),id=++seq;const timer=setTimeout(()=>{ws.close();reject(Error('CDP timeout'))},5000);const done=(err,val)=>{clearTimeout(timer);ws.close();err?reject(err):resolve(val)};
 ws.addEventListener('open',()=>ws.send(JSON.stringify({id,method:'Runtime.evaluate',params:{expression:code,returnByValue:true,awaitPromise:true}})));
 ws.addEventListener('error',()=>done(Error('CDP connection failed')));ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id!==id)return;if(m.error||m.result?.exceptionDetails)done(Error(JSON.stringify(m.error||m.result.exceptionDetails)));else done(null,m.result?.result?.value)})
 })
}
let success=false,connected=false,lastError='',startup=null,startupAttempted=false,diagnosticLog='';
for(let attempt=0;attempt<(process.argv.includes('--diagnostic-hold')?120:60)&&!success;attempt++){
 try{const response=await fetch(`http://127.0.0.1:${port}/json/list`,{signal:AbortSignal.timeout(1500)});const list=await response.json();connected=true;
 for(const t of list.filter(t=>t.type==='page'&&t.webSocketDebuggerUrl)){
 const u=new URL(t.url);const allowed=u.protocol==='app:'&&u.hostname==='-'&&u.pathname==='/index.html'&&!/avatar-overlay|detached-window|prewarm|%2Fspace%2F/i.test(u.search);if(!allowed)continue;
 const check=await evaluate(t,`({body:!!document.body,main:!!document.querySelector('main,textarea,[contenteditable="true"],[role="textbox"]'),width:innerWidth,height:innerHeight})`);
 if(process.argv.includes('--diagnostic-hold')){
  const gate=await evaluate(t,'window.__fadeDiagnosticGate?.state');
  if(!gate)continue;
  const stage=JSON.stringify(gate);
  if(stage!==diagnosticLog){diagnosticLog=stage;timing('Diagnostic native entry gate: '+stage)}
 }
 if(process.argv.includes('--native-startup')&&!startupAttempted&&check?.body){
  startupAttempted=true;
  try{
   const view=await evaluate(t,'window.fadeWindowControls?.startupStatus?.()');
   if(view){
    timing('Independent startup view: '+JSON.stringify(view));
    if(view.error)throw Error('Independent animation failed: '+view.error);
    if(view.active)await evaluate(t,'window.__fadeInPageState={done:false,isolated:true};window.__fadeCodex?.setStartupCovered?.(true)');
    let reportedIsolation=false;
    startup={async tick(){const state=await evaluate(t,'window.fadeWindowControls.startupStatus()');if(state.error)throw Error('Independent animation failed: '+state.error);if(state.mainPid&&state.animationPid){if(state.mainPid===state.animationPid)throw Error('Startup shares native renderer');if(!reportedIsolation){timing(`Renderer isolation verified: native PID ${state.mainPid}, animation PID ${state.animationPid}`);reportedIsolation=true}}return !state.active},async dispose(){}};
   }else{startup=await installInPage(t);timing('In-window animation installed')}
  }catch(e){timing('Animation skipped: '+e.message)}
 }
 if(!check?.body||!check.main||check.width<500||check.height<350)continue;
 timing(`Main UI ready (attempt ${attempt+1})`);
 const injectionStart=performance.now();
 if(!restore)await ensureWindowControls(t);
 const result=await evaluate(t,expression);
 timing(`Theme evaluation finished in ${((performance.now()-injectionStart)/1000).toFixed(2)}s`);
 console.log(JSON.stringify({target:t.id,path:u.pathname,result}));success=true;break;
 }
 }catch(e){lastError=e.cause?.code||e.message;timing(`Retry: ${lastError}`)}
 if(!success)await new Promise(r=>setTimeout(r,500));
}
if(!success){console.error(connected?'CDP_CONNECTED_BUT_MAIN_UI_NOT_READY: Main app target did not match, finish loading the main workspace and retry.':'CDP_UNREACHABLE: No debug endpoint. Launch with the updated launcher.');if(lastError)console.error(lastError);process.exitCode=1}
if(startup){
 try{if(success){while(!await startup.tick())await new Promise(r=>setTimeout(r,250));timing('In-window handoff finished')}}
 catch(error){timing('Animation handoff interrupted; keeping loaded UI: '+error.message)}
 finally{try{await startup.dispose()}catch(error){timing('Animation cleanup deferred to in-page watchdog: '+error.message)}}
}
