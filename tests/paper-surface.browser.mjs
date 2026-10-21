import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {createTestArea,retireTestArea} from './work-area.mjs';
import {command} from '../startup/session.mjs';
const base=await createTestArea('paper-continuity-test');
const profile=path.join(base,'browser');
const child=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));let target;
try{
 let port;for(let i=0;i<80;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await wait(100)}}assert.ok(port);
 target=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');
 const evaluate=async expression=>(await command(target,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
 const source=await fs.readFile(new URL('../src/paper-surface.js',import.meta.url),'utf8');
 const texture='data:image/jpeg;base64,'+(await fs.readFile(new URL('../Arts/paper-surface.jpg',import.meta.url))).toString('base64');
 const css=(await fs.readFile(new URL('../src/paper-surface.css',import.meta.url),'utf8')).replace('__FADE_PAPER_TEXTURE__',texture);
 const html=`<html data-fade-codex data-fade-shell="orb" data-fade-polarity="light"><style>body{margin:0;font:16px sans-serif}.pane{height:600px;position:relative;width:800px}.thread-scroll-container{height:100%;overflow:auto;scrollbar-gutter:stable both-edges}.thread-content{height:1400px}.footer{position:absolute;bottom:0;left:0;right:0;height:140px;pointer-events:none}.composer{margin:auto;width:500px;height:100%;pointer-events:auto;background:var(--fc-panel)}.old{position:absolute;inset:0;background:white}p{margin:0;padding:20px}button{height:32px}${css}</style><main data-app-shell-main-surface><div class="pane" data-app-shell-focus-area="main"><div class="thread-scroll-container"><div class="thread-content">${'<p>纸纹连续，消息在输入框上方淡出。</p>'.repeat(24)}<div class="_background_x _fade_x old"></div></div><div class="footer" data-thread-scroll-footer><div class="_background_x _surface_x old"></div><div class="composer" data-fade-composer data-composer-surface-variant="default" style="position:relative"><textarea aria-label="消息">保留草稿</textarea><button>发送</button></div></div></div></div></main><aside>侧栏</aside></html>`;
 await evaluate(`document.open();document.write(${JSON.stringify(html)});document.close()`);
 const before=await evaluate(`(()=>{const e=document.querySelector('.thread-scroll-container');return [e.clientWidth,e.clientHeight,e.scrollHeight]})()`);
 await evaluate(`${source};window.disposePaper=installPaperSurface(document);window.settle=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));`);
 const check=async()=>evaluate(`(async()=>{await settle();const e=document.querySelector('.thread-scroll-container'),c=e.firstElementChild,f=e.querySelector('[data-thread-scroll-footer]'),r=c.getBoundingClientRect();return {geometry:[e.clientWidth,e.clientHeight,e.scrollHeight],end:r.top+parseFloat(c.style.getPropertyValue('--fc-paper-end')),footer:f.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,bg:getComputedStyle(e).backgroundImage,ready:e.hasAttribute('data-fade-paper-ready'),covers:[...e.querySelectorAll('[class*="_background_"]')].map(x=>getComputedStyle(x).display),draft:document.querySelector('textarea').value}})()`);
 let result=await check();assert.deepEqual(result.geometry,before);assert.ok(result.ready);assert.equal(result.bg,'none');assert.deepEqual(result.covers,['none','none']);assert.ok(Math.abs(result.end-result.footer)<1);
 await evaluate(`document.querySelector('.thread-scroll-container').scrollTop=330`);result=await check();assert.ok(Math.abs(result.end-result.footer)<1);assert.equal(result.draft,'保留草稿');
 // Native GPT restoration changes content height/scroll inside an animation
 // frame. ResizeObserver runs before paint; deferring its mask update to the
 // next frame leaves the restored viewport entirely transparent for one paint.
 const restoration=await evaluate(`new Promise(resolve=>{const s=document.querySelector('.thread-scroll-container'),c=s.firstElementChild;let armed=false;const probe=new ResizeObserver(()=>{if(!armed)return;probe.disconnect();const body=c.getBoundingClientRect(),view=s.getBoundingClientRect();resolve({actual:parseFloat(c.style.getPropertyValue('--fc-paper-top')),expected:Math.max(0,view.top-body.top)})});probe.observe(c);requestAnimationFrame(()=>{armed=true;c.style.height='4200px';s.scrollTop=3500})})`);
 assert.ok(Math.abs(restoration.actual-restoration.expected)<1,JSON.stringify(restoration));
 await evaluate(`document.querySelector('.footer').style.height='270px'`);result=await check();assert.ok(Math.abs(result.end-result.footer)<1);
 await evaluate(`document.querySelector('.footer').setAttribute('data-fade-composer-visible','false')`);result=await check();assert.ok(Math.abs(result.end-result.bottom)<1);
 await evaluate(`document.querySelector('.footer').removeAttribute('data-fade-composer-visible');document.querySelector('.pane').style.height='520px'`);result=await check();assert.ok(Math.abs(result.end-result.footer)<1);
 // GPT retained virtual lists must never receive the large transcript mask,
 // including their first commit before observer callbacks run. Codex keeps it.
 assert.match(await evaluate(`getComputedStyle(document.querySelector('.thread-content')).maskImage`),/linear-gradient/);
 const gptStyle=await evaluate(`(()=>{const c=document.querySelector('.thread-content'),g=document.createElement('div');g.setAttribute('data-chatgpt-conversation-selection-target','true');c.append(g);window.gptMarker=g;const s=getComputedStyle(c);return {mask:s.maskImage,clip:s.clipPath}})()`);
 assert.deepEqual(gptStyle,{mask:'none',clip:'none'});
 await evaluate(`document.querySelector('.thread-content').style.height='1800px';document.querySelector('.thread-scroll-container').scrollTop=1200`);
 await check();assert.equal(await evaluate(`getComputedStyle(document.querySelector('.thread-content')).maskImage`),'none');
 await evaluate(`gptMarker.remove()`);await check();assert.match(await evaluate(`getComputedStyle(document.querySelector('.thread-content')).maskImage`),/linear-gradient/);
 for(const theme of ['light','dark']){
  await evaluate(`document.documentElement.dataset.fadePolarity=${JSON.stringify(theme)};`);await check();
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('aside')).backgroundImage`),'none');
  await fs.writeFile(path.join(base,theme+'.png'),Buffer.from((await command(target,'Page.captureScreenshot',{format:'png'})).data,'base64'));
 }
 await evaluate(`disposePaper()`);assert.equal(await evaluate(`document.querySelectorAll('[data-fade-paper-ready],[data-fade-paper-transcript]').length`),0);
 console.log('PASS: unchanged geometry/draft; scroll, growing composer, autohide, resize, light/dark, side panel, disposal.');
}finally{
 if(target)await command(target,'Browser.close').catch(()=>{});
 await retireTestArea(base,child);
}
