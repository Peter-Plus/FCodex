// Compatibility for already-built runtimes. Shares the existing window helper.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const {createErrorLog}=createRequire(import.meta.url)('./error-log.cjs');
const root=fileURLToPath(new URL('../',import.meta.url));
export async function installDiagnosticsBridge(ws,{directory=path.join(root,'.fade-logs'),openFolder=folder=>new Promise((resolve,reject)=>{
 execFile('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',fileURLToPath(new URL('./open-log-folder.ps1',import.meta.url)),'-Directory',folder],{windowsHide:true,timeout:6000},error=>error?reject(Error('无法显示日志目录窗口：'+error.message)):resolve());
}),metadata}={}){
 const log=createErrorLog({directory,metadata:metadata??{transport:'local-window-bridge',uiBundle:createHash('sha256').update(await fs.readFile(path.join(root,'fade.js'))).digest('hex'),platform:process.platform,arch:process.arch}});
 let serial=1000000000,mainFrame,closed=false;const pending=new Map(),contexts=new Set();
 function send(method,params){return new Promise((resolve,reject)=>{
  const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error('Diagnostics bridge timeout'))},5000);
  pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));
 })}
 const reply=(context,id,error)=>{if(!closed)void send('Runtime.evaluate',{contextId:context,expression:`window.__fadeDiagnosticsReply?.(${id},${JSON.stringify(error||'')})`}).catch(()=>{})};
 let opening=false;
 function receive(event){
  let message;try{message=JSON.parse(event.data)}catch{return}
  const waiter=pending.get(message.id);if(waiter){pending.delete(message.id);clearTimeout(waiter.timer);message.error?waiter.reject(Error(message.error.message)):waiter.resolve(message.result);return}
  const p=message.params;
  if(message.method==='Runtime.executionContextCreated'){const c=p.context;if(c.auxData?.isDefault&&c.auxData.frameId===mainFrame&&c.origin==='app://-')contexts.add(c.id);return}
  if(message.method==='Runtime.executionContextDestroyed'){contexts.delete(p.executionContextId);return}
  if(message.method==='Runtime.executionContextsCleared'){contexts.clear();return}
  if(message.method!=='Runtime.bindingCalled'||p.name!=='__fadeDiagnosticsRequestV2'||!contexts.has(p.executionContextId)||typeof p.payload!=='string'||p.payload.length>16000)return;
  let request;try{request=JSON.parse(p.payload)}catch{return}
  if(request.action==='report'){
   const r=request.record;if(r&&typeof r.operation==='string'&&typeof r.message==='string')log.report(r.operation,r);
  }else if(request.action==='open-folder'&&Number.isSafeInteger(request.id)){
   if(opening){reply(p.executionContextId,request.id,'日志目录正在打开，请稍后重试');return}opening=true;
   void (async()=>{let error='';try{await fs.mkdir(directory,{recursive:true});await openFolder(directory)}catch(cause){error=cause.message;log.report('diagnostics.open-folder',cause)}finally{opening=false;reply(p.executionContextId,request.id,error)}})();
  }
 }
 ws.addEventListener('message',receive);
 const close=async()=>{closed=true;ws.removeEventListener('message',receive);for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Diagnostics bridge closed'))}pending.clear();await log.flush()};
 try{
  mainFrame=(await send('Page.getFrameTree',{})).frameTree.frame.id;
  // Runtime.enable replays default contexts on a fresh helper connection.
  await send('Runtime.enable',{});
  await send('Runtime.addBinding',{name:'__fadeDiagnosticsRequestV2'});
  const expression=`(()=>{
   if(typeof window.fadeDiagnostics?.report==='function'&&typeof window.fadeDiagnostics?.openFolder==='function'&&(!window.__fadeDiagnosticsRequest||window.fadeDiagnostics.bridgeVersion===2))return true;
   if(location.origin!=='app://-'||location.pathname!=='/index.html'||window!==window.top)return false;
   const pending=new Map();let serial=0;
   window.__fadeDiagnosticsReply=(id,error)=>{const entry=pending.get(id);if(!entry)return;pending.delete(id);clearTimeout(entry.timer);error?entry.reject(Error(error)):entry.resolve()};
   window.fadeDiagnostics={bridgeVersion:2,report:record=>{try{window.__fadeDiagnosticsRequestV2(JSON.stringify({action:'report',record}))}catch{}},openFolder:()=>new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error('打开日志目录超时'))},7000);pending.set(id,{resolve,reject,timer});try{window.__fadeDiagnosticsRequestV2(JSON.stringify({action:'open-folder',id}))}catch(error){window.__fadeDiagnosticsReply(id,error.message)}})};
   return true;
  })()`;
  const result=await send('Runtime.evaluate',{expression,returnByValue:true});
  if(result.exceptionDetails||result.result?.value!==true)throw Error('Diagnostics bridge installation failed');
  return {close,flush:()=>log.flush()};
 }catch(error){await close();throw error}
}
