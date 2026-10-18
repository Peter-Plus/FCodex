import {createTestArea,retireTestArea} from './work-area.mjs';
// Verify neutral screen-blend warmup and cleanup using actual composited screenshots.
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {command} from '../startup/session.mjs';
const after=await fs.readFile('design-previews/startup.html','utf8');
const preset=JSON.parse(await fs.readFile('startup/preset.json','utf8'));
const profile=await createTestArea('startup-prewarm-browser');
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let port,socket;
try{
 for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await delay(100)}}
 assert.ok(port);
 const target=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
 let seq=0;const pending=new Map();socket.addEventListener('message',event=>{const m=JSON.parse(event.data),p=pending.get(m.id);if(p){pending.delete(m.id);m.error||m.result?.exceptionDetails?p.reject(Error(JSON.stringify(m))):p.resolve(m.result)}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
 const evaluate=async expression=>(await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
 const hook=`size();let warmTime=.3;Object.defineProperty(video,'readyState',{get:()=>2});Object.defineProperty(video,'currentTime',{get:()=>warmTime});activeCreateAt=1.8;phase='video';window.stepWarm=()=>{clearSurface(canvas,ctx);clearSurface(lightCanvas,lightCtx);warmStartupFrame();warmTime=.6;return prewarm.stage};window.clearWarm=()=>{clearSurface(canvas,ctx);clearSurface(lightCanvas,lightCtx);releaseStartupWarmup()};`;
 const html=after.replace(/<script>[\s\S]*?<\/script>/g,'').replace('src="../Arts/MilkDragon1.mp4"','').replace('</head>',`<style>.film{background:linear-gradient(37deg,#000,#e9af6b 23%,#19465b 56%,#fff)!important}.film video,.signature,.intro,.tools,.tuning,.workspace,.bottom,.caption{display:none!important}</style></head>`);
 const script=[...after.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1].replace('size();restart();',hook);
 for(const dpr of [1,1.92]){
  await call('Emulation.setDeviceMetricsOverride',{width:1334,height:751,deviceScaleFactor:dpr,mobile:false});
  await evaluate(`(async()=>{document.querySelector('iframe')?.remove();const f=document.createElement('iframe');f.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0';document.body.append(f);await new Promise(r=>{f.onload=r;f.srcdoc=${JSON.stringify(html)}});f.contentWindow.__fadeStartupHost={preset:${JSON.stringify(preset)}};f.contentWindow.eval(${JSON.stringify(script)});return true})()`);
  await delay(100);
  const baseline=(await call('Page.captureScreenshot',{format:'png'})).data;
  for(let stage=0;stage<3;stage++){
   await evaluate(`document.querySelector('iframe').contentWindow.${stage<2?'stepWarm':'clearWarm'}()`);await delay(80);
   const shot=(await call('Page.captureScreenshot',{format:'png'})).data;
   const delta=await evaluate(`(async()=>{const pixels=[];for(const s of ${JSON.stringify([baseline,shot])}){const bytes=Uint8Array.from(atob(s),c=>c.charCodeAt(0));const bitmap=await createImageBitmap(new Blob([bytes],{type:'image/png'}));const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const ctx=c.getContext('2d');ctx.drawImage(bitmap,0,0);pixels.push(ctx.getImageData(0,0,c.width,c.height).data);bitmap.close()}let changed=0,max=0;for(let i=0;i<pixels[0].length;i++){const d=Math.abs(pixels[0][i]-pixels[1][i]);if(d){changed++;max=Math.max(max,d)}}return {changed,max}})()`);
   console.log(JSON.stringify({dpr,stage,...delta}));assert.equal(delta.max,0,'Warmup changed visible pixels');
  }
 }
}finally{socket?.close();if(port){try{const info=await(await fetch(`http://127.0.0.1:${port}/json/version`)).json();await command({webSocketDebuggerUrl:info.webSocketDebuggerUrl},'Browser.close')}catch{}}await retireTestArea(profile,browser)}
