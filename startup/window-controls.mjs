import {spawn,execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ensurePreferences} from './preferences.mjs';
import {installDiagnosticsBridge} from './diagnostics-bridge.mjs';
const script=fileURLToPath(new URL('./window-action.ps1',import.meta.url));
export async function ensureWindowControls(target){
 await ensurePreferences(target);
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
 const exists=await new Promise(resolve=>{ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id===1)resolve(m.result?.result?.value)};ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression:'({windowReady:!!window.__fadeWindowBridgeReady,diagnosticsReady:typeof window.fadeDiagnostics?.report==="function"&&typeof window.fadeDiagnostics?.openFolder==="function"&&(!window.__fadeDiagnosticsRequest||window.fadeDiagnostics.bridgeVersion===2)})',returnByValue:true}}))});ws.close();
 if(!exists?.windowReady||!exists?.diagnosticsReady){
  const child=spawn(process.execPath,[fileURLToPath(import.meta.url),target.webSocketDebuggerUrl,...(exists?.windowReady?['--diagnostics-only']:[])],{detached:true,stdio:['ignore','ignore','ignore','ipc'],windowsHide:true});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{child.kill();reject(Error('Window bridge startup timeout'))},10000);child.once('error',error=>{clearTimeout(timer);reject(error)});child.once('exit',code=>{clearTimeout(timer);reject(Error('Window bridge exited: '+code))});child.once('message',message=>{clearTimeout(timer);child.disconnect();message.ready?resolve():reject(Error(message.error||'Window bridge failed'))})});child.unref();
 }
}
if(process.argv[2]?.startsWith('ws://127.0.0.1:')){
 const ws=new WebSocket(process.argv[2]);let id=0,diagnostics;
 const send=(method,params)=>ws.send(JSON.stringify({id:++id,method,params}));
 ws.onopen=async()=>{try{
  diagnostics=await installDiagnosticsBridge(ws);
  if(!process.argv.includes('--diagnostics-only')){send('Runtime.addBinding',{name:'__fadeWindowAction'});send('Runtime.evaluate',{expression:'window.__fadeWindowBridgeReady=true'})}
  process.send?.({ready:true});
 }catch(error){process.send?.({error:error.message});ws.close();process.exitCode=1}};
 ws.onmessage=e=>{if(process.argv.includes('--diagnostics-only'))return;const m=JSON.parse(e.data);if(m.method!=='Runtime.bindingCalled'||m.params.name!=='__fadeWindowAction')return;
 let data;try{data=JSON.parse(m.params.payload)}catch{return}if(!['minimize','close'].includes(data.action)||typeof data.title!=='string')return;
 execFile('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',script,'-Action',data.action,'-Port',new URL(process.argv[2]).port],{windowsHide:true},error=>{if(error)send('Runtime.evaluate',{expression:`window.dispatchEvent(new Event('fade-window-action-error'))`})});
 };ws.onclose=async()=>{await diagnostics?.close();process.exit()};ws.onerror=()=>ws.close();
}

