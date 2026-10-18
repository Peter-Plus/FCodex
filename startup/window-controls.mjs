import {spawn,execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ensurePreferences} from './preferences.mjs';
const script=fileURLToPath(new URL('./window-action.ps1',import.meta.url));
export async function ensureWindowControls(target){
 await ensurePreferences(target);
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
 const exists=await new Promise(resolve=>{ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id===1)resolve(m.result?.result?.value)};ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression:'!!window.__fadeWindowBridgeReady',returnByValue:true}}))});ws.close();
 if(!exists){const child=spawn(process.execPath,[fileURLToPath(import.meta.url),target.webSocketDebuggerUrl],{detached:true,stdio:'ignore',windowsHide:true});child.unref()}
}
if(process.argv[2]?.startsWith('ws://127.0.0.1:')){
 const ws=new WebSocket(process.argv[2]);let id=0;
 const send=(method,params)=>ws.send(JSON.stringify({id:++id,method,params}));
 ws.onopen=()=>{send('Runtime.enable',{});send('Runtime.addBinding',{name:'__fadeWindowAction'});send('Runtime.evaluate',{expression:'window.__fadeWindowBridgeReady=true'})};
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method!=='Runtime.bindingCalled'||m.params.name!=='__fadeWindowAction')return;
 let data;try{data=JSON.parse(m.params.payload)}catch{return}if(!['minimize','close'].includes(data.action)||typeof data.title!=='string')return;
 execFile('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',script,'-Action',data.action,'-Port',new URL(process.argv[2]).port],{windowsHide:true},error=>{if(error)send('Runtime.evaluate',{expression:`window.dispatchEvent(new Event('fade-window-action-error'))`})});
 };ws.onclose=()=>process.exit();ws.onerror=()=>process.exit(1);
}

