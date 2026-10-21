import {createTestArea,retireTestArea} from './work-area.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {command} from '../startup/session.mjs';

const area=await createTestArea('native-overlay-layers');
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--remote-debugging-port=0','--user-data-dir='+area,'about:blank'],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));let target,port;
try{
 for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(area,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await delay(100)}}
 assert.ok(port,'Browser started');
 target=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');
 const evaluate=async expression=>{const result=await command(target,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value};
 const css=await fs.readFile('src/shell.css','utf8');
 const tabs=await fs.readFile('src/window-mode.css','utf8');
 const settings=await fs.readFile('src/fade-settings.js','utf8');
 const position=settings.slice(settings.indexOf(' function positionOptions(){'),settings.indexOf(' function source(){'));
 await command(target,'Emulation.setDeviceMetricsOverride',{width:1000,height:700,deviceScaleFactor:1,mobile:false});
 await evaluate(`(()=>{
  document.documentElement.setAttribute('data-fade-codex','');
  document.documentElement.setAttribute('data-fade-window-mode','');
  const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);
  document.body.innerHTML='<div id="fade-codex-layer" style="position:fixed;inset:0;z-index:2147483000;pointer-events:none"></div><div data-radix-popper-content-wrapper style="position:fixed;left:40px;top:60px;z-index:50"><div id="tip" role="tooltip" style="width:240px;height:60px;background:black;color:white">Preview tooltip</div></div>';
  const shadow=document.querySelector('#fade-codex-layer').attachShadow({mode:'open'});
  shadow.innerHTML='<style>'+${JSON.stringify(tabs)}+'</style><div class="fade-window-row"><div class="fade-window-pane">Chat and preview tabs</div></div>';
 })()`);
 assert.equal(await evaluate("document.elementFromPoint(80,70)?.id"),'tip','Preview tooltip paints and receives input above window tabs');
 for(const windowMode of [true,false]){
  const result=await evaluate(`(()=>{
   document.documentElement.toggleAttribute('data-fade-window-mode',${windowMode});
   const wrapper=document.querySelector('[data-radix-popper-content-wrapper]');wrapper.style.zIndex='50';
   const native=document.createElement('button');native.setAttribute('aria-expanded','true');native.setAttribute('aria-controls','tip');
   const popupNode=document.querySelector('#tip');popupNode.setAttribute('role','menu');
   const shadow=document.querySelector('#fade-codex-layer').shadowRoot;
   const menu=document.createElement('section');menu.style.cssText='position:fixed;left:600px;top:44px;width:280px;height:400px';shadow.append(menu);
   const item=document.createElement('button'),activeNative=native,positioned=new Map();let popup;
   ${position}
   positionOptions();const r=popupNode.getBoundingClientRect();
   const hit=document.elementFromPoint(r.left+20,r.top+20)?.id;
   const saved=positioned.get(wrapper);menu.remove();
   return {hit,saved,z:wrapper.style.zIndex};
  })()`);
  assert.equal(result.hit,'tip',`Permission menu clears tabs in window mode=${windowMode}`);
  assert.equal(result.z,'2147483004');assert.ok(result.saved.includes('50'),'Original style is retained for disposal');
 }
 console.log('Passed: preview tooltip and settings permission menu stacking and hit testing.');
}finally{
 if(port){try{const info=await(await fetch(`http://127.0.0.1:${port}/json/version`)).json();await command({webSocketDebuggerUrl:info.webSocketDebuggerUrl},'Browser.close')}catch{}}
 await retireTestArea(area,browser);
}
