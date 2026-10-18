import {createTestArea,retireTestArea} from './work-area.mjs';
// Compare deterministic frames against a pre-change HTML snapshot supplied as argv[2].
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {command} from '../startup/session.mjs';
const before=await fs.readFile(process.argv[2]||'tests/fixtures/startup-orb-before-optimization.html','utf8');
const after=await fs.readFile('design-previews/startup.html','utf8');
const preset=JSON.parse(await fs.readFile('startup/preset.json','utf8'));
const profile=await createTestArea('startup-orb-browser');
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
 const hook=`size();const originalClear=CanvasRenderingContext2D.prototype.clearRect;window.cleared={};CanvasRenderingContext2D.prototype.clearRect=function(x,y,width,height){window.cleared[this.canvas.id]=(window.cleared[this.canvas.id]||0)+Math.max(0,width)*Math.max(0,height);return originalClear.call(this,x,y,width,height)};window.renderTest=(s)=>{cancelAnimationFrame(raf);if(w!==innerWidth||h!==innerHeight||dpr!==Math.min(devicePixelRatio,2))size();window.cleared={};theme=s.theme;phase=s.phase;const now=20000;started=now-s.elapsed;openingAt=now-s.opening;lastFrame=now;orbClock=17;hoverLight=s.hover;lightAngle=.7;pointer={x:w*.47,y:h*.72};departureClock={time:now,elapsed:s.elapsed};spinDuration=params.duration;activeFadeAt=params.fadeAt/100;finalPulseDone=false;draw(now);cancelAnimationFrame(raf);return true};`;
 const fixture=source=>({html:source.replace(/<script>[\s\S]*?<\/script>/g,'').replace('src="../Arts/MilkDragon1.mp4"',''),script:[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1].replace('size();restart();',hook)});
 await evaluate(`(async()=>{window.fixtures=[];for(const data of ${JSON.stringify([fixture(before),fixture(after)])}){const f=document.createElement('iframe');f.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0';document.body.append(f);await new Promise(resolve=>{f.onload=resolve;f.srcdoc=data.html});f.contentWindow.__fadeStartupHost={preset:${JSON.stringify(preset)},ready:true,target:{x:.5,y:.39,size:94,width:1920},complete(){}};f.contentWindow.eval(data.script);fixtures.push(f)}return true})()`);
 const cases=[];
 for(const theme of ['dark','light'])for(const [phase,elapsed,opening,hover]of [['opening',0,0,0],['opening',0,500,0],['opening',0,1400,0],['waiting',0,2000,0],['waiting',0,2000,1],['leaving',350,2000,1],['leaving',805,2000,0],['settling',0,2000,0],['settling',300,2000,0],['settling',590,2000,0]])cases.push({theme,phase,elapsed,opening,hover});
 let worst=0,reduced=0;
 for(const [width,height,dpr]of [[1920,1080,1],[1920,1080,2],[1280,720,1.25],[800,600,1]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:false});
  await delay(80);
  for(const state of cases){
   const result=await evaluate(`(()=>{for(const f of fixtures)f.contentWindow.renderTest(${JSON.stringify(state)});let max=0,changed=0,pixels=0;const areas=[];for(const id of ['scene','orbLight']){const layers=fixtures.map(f=>{const el=f.contentDocument.getElementById(id),ratio=id==='scene'?Math.min(devicePixelRatio,2):1;const out=document.createElement('canvas');out.width=innerWidth*ratio;out.height=innerHeight*ratio;const ctx=out.getContext('2d');const rect=el.getBoundingClientRect();ctx.drawImage(el,rect.left*ratio,rect.top*ratio,rect.width*ratio,rect.height*ratio);areas.push(el.width*el.height);return ctx.getImageData(0,0,out.width,out.height).data});for(let i=0;i<layers[0].length;i++){const a=i-i%4+3;const delta=i%4===3?Math.abs(layers[0][i]-layers[1][i]):Math.abs(Math.round(layers[0][i]*layers[0][a]/255)-Math.round(layers[1][i]*layers[1][a]/255));if(delta){changed++;max=Math.max(max,delta)}}pixels+=layers[0].length}return {max,changed,pixels,areas,viewport:[innerWidth,innerHeight],frames:fixtures.map(f=>[f.contentWindow.innerWidth,f.contentWindow.innerHeight])}})()`);
   worst=Math.max(worst,result.max);
   assert.deepEqual(result.viewport,[width,height]);
   const clear=await evaluate('fixtures.map(f=>f.contentWindow.cleared)');
   if(state.phase==='waiting'&&state.hover===1)reduced=Math.max(reduced,1-Object.values(clear[1]).reduce((a,b)=>a+b,0)/Object.values(clear[0]).reduce((a,b)=>a+b,0));
   if(result.changed)console.log(JSON.stringify({width,height,dpr,...state,...result}));
   assert.equal(result.max,0,`Pixel mismatch: ${JSON.stringify({width,height,dpr,...state,...result})}`);
  }
 }
 console.log(JSON.stringify({frames:cases.length*4,worstChannelDifference:worst,maxWaitingClearAreaReduction:reduced}));
}finally{socket?.close();if(port){try{const info=await(await fetch(`http://127.0.0.1:${port}/json/version`)).json();await command({webSocketDebuggerUrl:info.webSocketDebuggerUrl},'Browser.close')}catch{}}await retireTestArea(profile,browser)}
