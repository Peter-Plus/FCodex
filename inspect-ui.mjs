import {fadePort} from './startup/endpoint.mjs';
import fs from 'node:fs/promises';
const targets=await(await fetch(`http://127.0.0.1:${await fadePort()}/json/list`)).json();
const t=targets.find(t=>t.type==='page'&&t.url==='app://-/index.html');if(!t)throw Error('Main target not found');
const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});let id=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}};
function send(method,params){return new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject,timer:setTimeout(()=>reject(Error('CDP timeout')),8000)});ws.send(JSON.stringify({id:key,method,params}))})}
try{if(process.argv[2]==='--screenshot'){const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(process.argv[3],Buffer.from(r.data,'base64'))}else{const expression=await fs.readFile(process.argv[2],'utf8');const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));console.log(JSON.stringify(r.result.value,null,2))}}finally{ws.close()}
