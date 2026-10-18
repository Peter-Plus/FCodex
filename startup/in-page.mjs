import {installHandoffWatchdog} from './handoff-watchdog.mjs';
import fs from 'node:fs/promises';
import {randomBytes} from 'node:crypto';

export async function installInPage(target,media={intro:'app://-/fade-intro.mp4',loop:'app://-/fade-loop.mp4'}){
 const source=await fs.readFile(new URL('../design-previews/startup.html',import.meta.url),'utf8');
 const scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 const html=source.replace(/<script>[\s\S]*?<\/script>/g,'').replace('src="../Arts/MilkDragon1.mp4"','')
  .replace('</head>','<style>.tuning,.tools,.bottom,.workspace,.caption{display:none!important}html,body{background:transparent!important}body[data-phase=settling] .signature,body[data-phase=live] .signature{display:none!important}</style></head>');
 const token=randomBytes(16).toString('hex'),ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
 let seq=0;const pending=new Map();
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error||m.result?.exceptionDetails?p.reject(Error(JSON.stringify(m.error||m.result.exceptionDetails))):p.resolve(m.result)}});
 ws.addEventListener('close',()=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Startup debugger closed'))}pending.clear()});
 function call(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timeout'))},15000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}))})}
 const evaluate=(expression,contextId)=>call('Runtime.evaluate',{expression,contextId,returnByValue:true,awaitPromise:true}).then(r=>r.result?.value);
 try{
  const diagnostic=await evaluate('!!window.__fadeDiagnosticGate');
  const animationScript=scripts.join('\n');
  if(diagnostic&&!animationScript.includes('function state(next){'))throw Error('Diagnostic opening hook missing');
  const baked=JSON.parse(await fs.readFile(new URL('../Arts/startup-loop.json',import.meta.url),'utf8'));
  const preset=JSON.parse(await fs.readFile(new URL('preset.json',import.meta.url),'utf8'));
  if(baked.from!==preset.loopFrom||baked.to!==preset.loopTo)throw Error('Startup loop preset changed; run startup/bake-loop.mjs first');
  await evaluate(`(()=>{
   window.__fadeInPageFinish?.();
   const frame=document.createElement('iframe');frame.id='fade-startup-frame';frame.name=${JSON.stringify('fade-startup-'+token)};frame.title='FCodex 启动动画';frame.allow='autoplay';
   frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483647;background:#191919;-webkit-app-region:no-drag';
   frame.srcdoc=${JSON.stringify(html)};document.documentElement.append(frame);
   window.__fadeInPageState={done:false,started:performance.now()};
   window.__fadeCodex?.setStartupCovered?.(true);
   let timer,finished=false;const key=e=>{if(e.key==='Escape')finish()};
   const message=e=>{if(e.source!==frame.contentWindow||e.data?.fadeStartup!==${JSON.stringify(token)})return;if(e.data.phase==='opening'){window.__fadeDiagnosticGate?.opening();return}finish()};
   function finish(){if(finished)return;finished=true;clearTimeout(timer);window.__fadeDiagnosticGate?.release('animation-finished-or-skipped');window.__fadeCodex?.setStartupCovered?.(false);frame.remove();window.removeEventListener('message',message);window.removeEventListener('keydown',key);const orb=document.getElementById('fade-codex-layer')?.shadowRoot?.querySelector('#orbButton');if(orb)orb.style.visibility='';window.__fadeInPageState.done=true;}
   window.__fadeInPageFinish=finish;window.addEventListener('message',message);window.addEventListener('keydown',key);
  })()`);
  let frameId;
  for(let i=0;i<50&&!frameId;i++){
   const {frameTree}=await call('Page.getFrameTree');
   frameId=frameTree.childFrames?.find(f=>f.frame.name==='fade-startup-'+token)?.frame.id;
   if(!frameId)await new Promise(r=>setTimeout(r,50));
  }
  if(!frameId)throw Error('Animation frame did not mount');
  const {executionContextId}=await call('Page.createIsolatedWorld',{frameId,worldName:'fade-startup'});
  await evaluate(`new Promise((resolve,reject)=>{let tries=0;function check(){if(document.getElementById('filmVideo'))resolve(true);else if(++tries>100)reject(Error('Animation document not ready'));else setTimeout(check,30)}check()})`,executionContextId);
  await evaluate(`document.getElementById('filmVideo').crossOrigin='anonymous';document.getElementById('filmVideo').src=${JSON.stringify(media.intro)};
   const handoffWatchdog=(${installHandoffWatchdog.toString()})(window,()=>parent.postMessage({fadeStartup:${JSON.stringify(token)}},'*'));
   window.__fadeStartupHost={preset:${JSON.stringify(preset)},bakedLoop:${JSON.stringify({...baked,url:media.loop})},ready:false,theme:matchMedia('(prefers-color-scheme:light)').matches?'light':'dark',requestEnter(){this.enterRequested=true;handoffWatchdog.arm()},complete(){requestAnimationFrame(()=>requestAnimationFrame(()=>handoffWatchdog.complete()))}};
   window.addEventListener('keydown',e=>{if(e.key==='Escape')parent.postMessage({fadeStartup:${JSON.stringify(token)}},'*')});
   ${diagnostic?animationScript.replace("function state(next){",`function state(next){if(next==='opening')parent.postMessage({fadeStartup:${JSON.stringify(token)},phase:'opening'},'*');`):animationScript}`,executionContextId);
  await evaluate(`document.getElementById('fade-startup-frame').style.background='transparent'`);
  let ready=false;
  return {
   async tick(){
    const state=await evaluate(`(()=>{
     if(!window.__fadeInPageState||window.__fadeInPageState.done)return {done:true};
     if(${ready})return {done:false};
     const runtime=window.__fadeCodex;
     let target=runtime?.prepareStartupHome?.();
     if(target){const orb=document.getElementById('fade-codex-layer')?.shadowRoot?.querySelector('#orbButton');if(orb)orb.style.visibility='hidden'}
     return {done:false,target,theme:document.documentElement.dataset.theme};
    })()`);
    if(state.done)return true;
    if(!ready&&state.target){await evaluate(`Object.assign(window.__fadeStartupHost,{target:${JSON.stringify(state.target)},theme:${JSON.stringify(state.theme||'dark')},ready:true})`,executionContextId);ready=true;console.log('[Startup handoff] '+'Welcome target ready.')}
    return false;
   },
   async dispose(){try{await evaluate('window.__fadeInPageFinish?.()')}finally{ws.close()}},
   get ready(){return ready}
  };
 }catch(error){try{await evaluate('window.__fadeInPageFinish?.()')}catch{}ws.close();throw error}
}
