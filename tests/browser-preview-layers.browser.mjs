import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {command} from '../startup/session.mjs';
import {createTestArea,retireTestArea} from './work-area.mjs';

const area=await createTestArea('browser-preview-layers');
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--remote-debugging-port=0','--user-data-dir='+area,'about:blank'],{stdio:'ignore',windowsHide:true});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));let target;
try{
 let port;for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(area,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await wait(100)}}assert.ok(port);
 target=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');
 const evaluate=async expression=>{const result=await command(target,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value};
 const css=await fs.readFile('src/file-panel.css','utf8');
 await command(target,'Emulation.setDeviceMetricsOverride',{width:1000,height:700,deviceScaleFactor:1,mobile:false});
 await evaluate(`(()=>{
  document.documentElement.setAttribute('data-fade-codex','');document.documentElement.setAttribute('data-fade-window-mode','');
  const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);
  document.body.innerHTML='<aside data-fade-unified-preview style="left:600px;width:400px;background:#242424"></aside><div data-embedded-frame-host-root style="position:fixed;inset:0;pointer-events:none"><div data-browser-host-root style="position:fixed;inset:0;contain:paint;pointer-events:none;clip-path:inset(85px 400px 0px 0px)"><div data-browser-sidebar-webview data-app-shell-focus-area="right-panel" style="position:fixed;left:600px;top:130px;width:400px;height:570px;clip-path:inset(0px 0px 10px);visibility:visible;pointer-events:auto"><iframe id="page" title="Local HTML preview" style="width:100%;height:100%;border:0" srcdoc="<h1>Local HTML</h1><button>Click</button>"></iframe></div></div></div><div id="menu" style="position:fixed;left:750px;top:180px;width:100px;height:100px;z-index:50;background:white"></div>';
  window.hit=(x=650,y=200)=>document.elementFromPoint(x,y)?.id;
  window.host=document.querySelector('[data-browser-host-root]');window.portal=document.querySelector('[data-embedded-frame-host-root]');window.view=document.querySelector('[data-browser-sidebar-webview]');
 })()`);
 assert.equal(await evaluate('hit()'),'page','HTML receives input above the opaque preview');
 await evaluate("host.style.setProperty('clip-path','inset(85px 400px 0px 0px)','important')");
 assert.notEqual(await evaluate('hit()'),'page','old chat-only clip reproduces blank preview');
 await evaluate("host.style.removeProperty('clip-path');portal.style.zIndex='auto'");
 assert.notEqual(await evaluate('hit()'),'page','old portal layer is covered by preview background');
 await evaluate("portal.style.removeProperty('z-index')");
 assert.equal(await evaluate('hit()'),'page');
 assert.equal(await evaluate('hit(780,200)'),'menu','native menus remain above HTML');
 assert.notEqual(await evaluate('hit(650,695)'),'page','per-webview clip remains effective');
 await evaluate("view.style.visibility='hidden'");assert.notEqual(await evaluate('hit()'),'page','inactive browser stays hidden');
 await evaluate("view.style.visibility='visible';host.style.clipPath='inset(85px 400px 0px 0px)';document.documentElement.removeAttribute('data-fade-window-mode')");
 assert.equal(await evaluate('getComputedStyle(portal).zIndex'),'auto','native mode keeps native stacking');
 assert.notEqual(await evaluate('getComputedStyle(host).clipPath'),'none','native mode keeps main surface clipping');
 console.log('PASS: reproduced both blank-preview causes; HTML hit testing, native menu stacking, per-view clipping, hidden tabs and native mode.');
}finally{if(target)await command(target,'Browser.close').catch(()=>{});await retireTestArea(area,browser)}
