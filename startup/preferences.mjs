import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const settingsFile=new URL('../.fade-preferences.json',import.meta.url);
export async function readPreferences(file=settingsFile){
 try{const prefs=JSON.parse(await fs.readFile(file,'utf8'));return {...prefs,startupFullscreen:prefs.startupFullscreen===true,closeToQuit:prefs.closeToQuit===true}}
 catch(error){if(error.code==='ENOENT')return {startupFullscreen:false,closeToQuit:false};throw error}
}
export async function writePreferences(value,file=settingsFile){
 const patch=typeof value==='boolean'?{startupFullscreen:value}:value;
 if(!patch||typeof patch!=='object'||Array.isArray(patch)||!Object.keys(patch).length||Object.entries(patch).some(([key,value])=>!['startupFullscreen','closeToQuit'].includes(key)||typeof value!=='boolean'))throw Error('Invalid preference');
 const next={...await readPreferences(file),...patch},temporary=new URL(file.href+'.tmp');
 await fs.writeFile(temporary,JSON.stringify(next,null,2)+'\n');await fs.rename(temporary,file);return next;
}
export async function ensurePreferences(target){
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
 const exists=await new Promise(resolve=>{ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id===1)resolve(m.result?.result?.value)};ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression:'!!window.fadeStartupPreferences',returnByValue:true}}))});ws.close();
 if(!exists){const child=spawn(process.execPath,[fileURLToPath(import.meta.url),target.webSocketDebuggerUrl],{detached:true,stdio:'ignore',windowsHide:true});child.unref()}
}
if(process.argv[1]===fileURLToPath(import.meta.url)&&process.argv[2]?.startsWith('ws://127.0.0.1:')){
 const ws=new WebSocket(process.argv[2]);let serial=0,queue=Promise.resolve();
 const send=(method,params)=>ws.send(JSON.stringify({id:++serial,method,params}));
 ws.onopen=()=>{
  send('Runtime.enable',{});send('Runtime.addBinding',{name:'__fadeStartupPreferenceRequest'});
  send('Runtime.evaluate',{expression:`(()=>{const pending=new Map();let serial=0;window.__fadeStartupPreferenceReply=(id,value,error)=>{const p=pending.get(id);if(!p)return;pending.delete(id);clearTimeout(p.timer);error?p.reject(Error(error)):p.resolve(value)};const request=(action,value)=>new Promise((resolve,reject)=>{const id=++serial;const timer=setTimeout(()=>{pending.delete(id);reject(Error('设置保存超时'))},5000);pending.set(id,{resolve,reject,timer});window.__fadeStartupPreferenceRequest(JSON.stringify({id,action,value}))});window.fadeStartupPreferences={get:()=>request('get'),set:value=>request('set',value)};window.dispatchEvent(new Event('fade-startup-preferences-ready'))})()`});
 };
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method!=='Runtime.bindingCalled'||m.params.name!=='__fadeStartupPreferenceRequest')return;
  queue=queue.then(async()=>{let request;try{request=JSON.parse(m.params.payload);if(!Number.isSafeInteger(request.id)||!['get','set'].includes(request.action))return;
   const value=request.action==='get'?await readPreferences():await writePreferences(request.value);
   send('Runtime.evaluate',{expression:`window.__fadeStartupPreferenceReply?.(${request.id},${JSON.stringify(value)})`});
  }catch(error){if(Number.isSafeInteger(request?.id))send('Runtime.evaluate',{expression:`window.__fadeStartupPreferenceReply?.(${request.id},null,${JSON.stringify(error.message)})`})}});
 };
 ws.onclose=()=>process.exit();ws.onerror=()=>process.exit(1);
}
