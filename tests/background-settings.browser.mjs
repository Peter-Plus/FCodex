import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {createTestArea,retireTestArea} from './work-area.mjs';
import {command as oneShotCommand} from '../startup/session.mjs';
const base=await createTestArea('background-settings');let target,child,socket;let command=oneShotCommand;
const source=await fs.readFile(new URL('../src/background-settings.js',import.meta.url),'utf8');
const dialogCss=await fs.readFile(new URL('../src/background-settings.css',import.meta.url),'utf8');
const production=await fs.readFile(new URL('../fade.js',import.meta.url),'utf8');
const shadowMarkup=JSON.parse(production.match(/shadow\.innerHTML=("(?:\\.|[^"\\])*");/)[1]);
const productionCss=shadowMarkup.match(/<style>([\s\S]*?)<\/style>/)[1];
const texture='data:image/jpeg;base64,'+(await fs.readFile(new URL('../Arts/paper-surface.jpg',import.meta.url))).toString('base64');
const surfaceCss=(await fs.readFile(new URL('../src/paper-surface.css',import.meta.url),'utf8')).replace('__FADE_PAPER_TEXTURE__',texture);
const html=`<!doctype html><html data-fade-codex data-fade-shell="orb" data-fade-polarity="light"><meta charset="utf-8"><style>${surfaceCss}body{margin:0;font:14px Segoe UI}#host{--paper:#fafafa;--ink:#282828;--muted:#666;--line:#ededed;--edge:#d7d7d7;--purple:#8057b0;--shadow:0 12px 40px #0002}main>div{height:100vh}</style><main data-app-shell-main-surface><div data-app-shell-focus-area="main">FCodex 背景设置验证</div></main><div id="host"></div><script>${source};window.sh=document.getElementById('host').attachShadow({mode:'open'});sh.innerHTML=${JSON.stringify('<style>button{border:0}'+dialogCss+'</style><button id="fadeSettingsToggle">Fade 设置</button>')};window.start=()=>{window.bg=installBackgroundSettings({doc:document,shadow:sh});return bg.ready};start();</script>`;
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const address=`http://127.0.0.1:${server.address().port}`;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 const profile=path.join(base,'browser');child=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,address],{stdio:'ignore',windowsHide:true});
 let port;for(let i=0;i<80;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await wait(100)}}assert.ok(port);
 target=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');
 // Emulation is scoped to a debugger session; keep it open for viewport checks.
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});
 let serial=0;const pending=new Map();socket.onmessage=event=>{const m=JSON.parse(event.data),p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error||m.result?.exceptionDetails?p.reject(Error(JSON.stringify(m.error||m.result.exceptionDetails))):p.resolve(m.result)}};
 command=(_,method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject,timer:setTimeout(()=>{pending.delete(id);reject(Error('Debugger timeout'))},8000)});socket.send(JSON.stringify({id,method,params}))});
 const evaluate=async expression=>(await command(target,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
 for(let i=0;i<80;i++){if(await evaluate('!!window.bg'))break;await wait(50)}
 await evaluate(`bg.ready`);assert.equal(await evaluate(`document.documentElement.dataset.fadeBackground`),'paper');
 await evaluate(`bg.open();const s=document.createElement('style');s.textContent=${JSON.stringify(productionCss)};sh.prepend(s)`);
 assert.ok(await evaluate(`[...sh.querySelectorAll('.background-swatch')].every(e=>e.getBoundingClientRect().width>45)`));
 const select=async(mode,kind)=>{await evaluate(`sh.querySelector('[data-mode=${mode}] [data-kind=${kind}]').click()`);await settled()};
 async function settled(){for(let i=0;i<60;i++){if(!await evaluate(`sh.querySelector('[data-kind=solid]').disabled`)){await wait(20);return}await wait(40)}throw Error('Settings did not settle')}
 await select('dark','solid');assert.equal(await evaluate(`document.documentElement.dataset.fadeBackground`),'paper');
 await evaluate(`document.documentElement.dataset.fadePolarity='dark'`);await wait(30);assert.equal(await evaluate(`document.documentElement.dataset.fadeBackground`),'solid');
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('main>div')).backgroundImage`),'none');
 await select('dark','paper');await select('light','solid');assert.equal(await evaluate(`document.documentElement.dataset.fadeBackground`),'paper');
 // Exercise the file input path, normalization, local persistence and invalid files.
 await evaluate(`(async()=>{const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;canvas.getContext('2d').fillRect(0,0,16,16);const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));const dt=new DataTransfer();dt.items.add(new File([blob],'自定义纹理.png',{type:'image/png'}));const input=sh.querySelector('[data-mode=light] input[type=file]');input.files=dt.files;input.dispatchEvent(new Event('change'))})()`);await settled();
 assert.equal(await evaluate(`bg.get('light').kind`),'custom');assert.equal(await evaluate(`bg.get('dark').kind`),'paper');
 await evaluate(`document.documentElement.dataset.fadePolarity='light'`);await wait(30);assert.equal(await evaluate(`document.documentElement.dataset.fadeBackground`),'custom');assert.ok(await evaluate(`getComputedStyle(document.querySelector('main>div'),'::before').backgroundImage.includes('data:image/webp')`));
 await evaluate(`(()=>{const range=sh.querySelector('[data-mode=light] input[type=range]');range.value='63';range.dispatchEvent(new Event('change'))})()`);await settled();
 await evaluate(`(()=>{const fit=sh.querySelector('[data-mode=light] select');fit.value='tile';fit.dispatchEvent(new Event('change'))})()`);await settled();
 assert.equal(await evaluate(`bg.get('light').strength`),63);assert.equal(await evaluate(`getComputedStyle(document.querySelector('main>div'),'::before').backgroundRepeat`),'repeat');
 for(const [key,value]of Object.entries({rotation:32,x:15,y:-20,zoom:140,blur:8})){
  await evaluate(`(()=>{const input=sh.querySelector('[data-mode=light] [data-adjust=${key}]');input.value='${value}';input.dispatchEvent(new Event('input'));input.dispatchEvent(new Event('change'))})()`);await settled();assert.equal(await evaluate(`bg.get('light').${key}`),value);
 }
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('main>div')).filter`),'none');
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('main>div'),'::before').filter`),'blur(8px)');
 await evaluate(`sh.querySelector('[data-mode=light] .background-save input').value='我的纸纹';sh.querySelector('[data-mode=light] [data-action=save]').click()`);await settled();
 assert.equal(await evaluate(`sh.querySelectorAll('[data-mode=light] [data-action=delete]').length`),1);
 assert.equal(await evaluate(`sh.querySelectorAll('[data-kind] [data-action=delete]').length`),0);
 await evaluate(`bg.destroy();start()`);
 assert.equal(await evaluate(`sh.querySelector('[data-mode=dark] .background-preset-row button').textContent`),'我的纸纹');
 await evaluate(`sh.querySelector('[data-mode=dark] .background-preset-row button').click()`);await settled();
 assert.equal(await evaluate(`bg.get('dark').rotation`),32);
 await select('dark','paper');
 await evaluate(`sh.querySelector('[data-mode=light] [data-action=delete]').click()`);await settled();
 assert.equal(await evaluate(`sh.querySelectorAll('[data-action=delete]').length`),0);
 assert.equal(await evaluate(`bg.get('light').rotation`),32);
 const stored=await evaluate(`bg.get('light')`);
 await evaluate(`window.originalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){throw Error('simulated storage failure')}`);
 await select('light','solid');assert.deepEqual(await evaluate(`bg.get('light')`),stored);
 await evaluate(`IDBObjectStore.prototype.put=window.originalPut`);
 await evaluate(`(()=>{const dt=new DataTransfer();dt.items.add(new File(['broken'],'坏图.png',{type:'image/png'}));const input=sh.querySelector('[data-mode=light] input[type=file]');input.files=dt.files;input.dispatchEvent(new Event('change'))})()`);await settled();assert.deepEqual(await evaluate(`bg.get('light')`),stored);assert.ok((await evaluate(`sh.querySelector('.background-status').textContent`)).startsWith('保存失败'));
 await evaluate(`bg.destroy();start()`);assert.deepEqual(await evaluate(`bg.get('light')`),stored);assert.equal(await evaluate(`bg.get('dark').kind`),'paper');
 await evaluate(`bg.open()`);await command(target,'Emulation.setDeviceMetricsOverride',{width:1000,height:760,deviceScaleFactor:1,mobile:false});await wait(60);
 assert.equal(await evaluate(`innerWidth`),1000);
 await fs.writeFile(path.join(base,'settings-wide.png'),Buffer.from((await command(target,'Page.captureScreenshot',{format:'png'})).data,'base64'));
 await command(target,'Emulation.setDeviceMetricsOverride',{width:360,height:740,deviceScaleFactor:1,mobile:false});await wait(40);
 assert.equal(await evaluate(`innerWidth`),360);
 assert.ok(await evaluate(`(()=>{const r=sh.querySelector('.fade-background-dialog').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})()`));
 await fs.writeFile(path.join(base,'settings-narrow.png'),Buffer.from((await command(target,'Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate(`sh.querySelector('[data-mode=light] [data-action=remove]').click()`);await settled();assert.equal(await evaluate(`bg.get('light').kind`),'paper');assert.equal(await evaluate(`bg.get('light').image`),'');
 await evaluate(`bg.destroy()`);assert.equal(await evaluate(`sh.querySelectorAll('.fade-background-overlay').length`),0);assert.equal(await evaluate(`document.documentElement.hasAttribute('data-fade-background')`),false);
 console.log('PASS: independent themes; presets; custom file import; strength/tiling; invalid-file rollback; persistence; responsive dialog; removal/disposal.');
}finally{if(target)await command(target,'Browser.close').catch(()=>{});socket?.close();server.close();await retireTestArea(base,child)}
