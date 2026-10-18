import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {createTestArea,retireTestArea} from './work-area.mjs';
const base=await createTestArea('window-mode'),profile=path.join(base,'browser'),wait=ms=>new Promise(r=>setTimeout(r,ms));
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
let socket,serial=0;
function command(method,params={}){return new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{socket.removeEventListener('message',receive);reject(Error('CDP timeout'))},10000),receive=e=>{const r=JSON.parse(e.data);if(r.id!==id)return;clearTimeout(timer);socket.removeEventListener('message',receive);r.error?reject(Error(JSON.stringify(r.error))):resolve(r.result)};socket.addEventListener('message',receive);socket.send(JSON.stringify({id,method,params}))})}
try{
 let port;for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await wait(100)}}assert(port);
 const target=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});
 const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 await command('Emulation.setDeviceMetricsOverride',{width:1200,height:800,deviceScaleFactor:1,mobile:false});
 const css=await fs.readFile('src/window-mode.css','utf8'),model=await fs.readFile('src/window-layout.js','utf8'),source=await fs.readFile('src/window-mode.js','utf8');
 await evaluate(`
 const root=document.documentElement,host=document.createElement('div');document.body.append(host);const shadow=host.attachShadow({mode:'open'}),abort=new AbortController();
 shadow.innerHTML='<style>:host{position:fixed;inset:0;z-index:30;pointer-events:none;--ink:#eee;--bg:#181818;--edge:#383838;--line:#303030;--purple:#B8A0E0;font:13px Segoe UI}.compact-head{position:absolute;left:20px;top:0;height:43px;display:flex;align-items:center;pointer-events:auto}.fade-gpt-tab{display:flex}.compact-head span{color:#B8A0E0;font-weight:600}'+${JSON.stringify(css)}+'</style><header class="compact-head"><span>FCodex</span><div id="headerTabsScroll">普通标签行</div></header>';
 const $=s=>shadow.querySelector(s),on=(el,event,fn,opts={})=>el.addEventListener(event,fn,{...opts,signal:abort.signal}),messages=[];function announce(s){messages.push(s)}
 let seq=0;crypto.randomUUID=()=>String(++seq);const loc={pathname:'/',state:{},key:'0'};function go(path,state){Object.assign(loc,path,{state,key:String(++seq)});const key=state?.fadePaneHome||state?.fadeDraftKey||path.pathname;let page=[...document.querySelectorAll('[data-fade-page-key]')].find(el=>el.dataset.fadePageKey===key);if(!page){page=document.createElement('div');page.dataset.fadePageKey=key;page.innerHTML='<h2>'+key+'</h2><textarea placeholder="写下消息"></textarea>';page.style.background='#202020';page.style.color='#eee';document.body.append(page)}}
 function fadeNativeRouter(){return {location:loc,navigator:{push:go}}}const codex=[],gpt=[];
 function make(type,tabs){return {tabs:()=>tabs,ready:true,activate:t=>go(t.location,t.location.state),close:t=>{const key=typeof t==='string'?t:t.path;const i=tabs.findIndex(t=>(t.path||t.id)===key);if(i>=0)tabs.splice(i,1)},sync(){},addHome(key){const tab={path:key,title:'新聊天',location:{pathname:'/',state:{fadePaneHome:key}}};tabs.push(tab);this.activate(tab);return tab},newChat(){const id='gpt-'+ ++seq,t={id,title:'新聊天',location:{pathname:'/',state:{fadeDraftKey:id,fadeChat:true}}};tabs.push(t);this.activate(t)},openHistory(t){const tab={id:t.id,title:t.title,location:{pathname:'/c/'+t.id,state:{}}};tabs.push(tab);this.activate(tab)}}}
 const disposeCodexTabs=make('codex',codex),disposeGptTabs=make('gpt',gpt),chatPicker={openFor(){}};window.__fadePaneHostSupported=true;
 ${model}\n${source}\nconst mode=installFadeWindowMode();mode.set(true);
 `);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),1);
 // Create same-type panes, move a tab, and reject a different type without changing ownership.
 await evaluate(`shadow.querySelector('.fade-window-menu button').click()`);await wait(250);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),2);
 await evaluate(`shadow.querySelectorAll('.fade-window-menu button')[1].click()`);await wait(250);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),3);
 const before=await evaluate(`JSON.stringify(window.__fadePaneSlots)`);
 await evaluate(`(()=>{const item=shadow.querySelector('.fade-gpt-tab'),data=new DataTransfer();item.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:data}));shadow.querySelectorAll('.fade-window-pane')[2].dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}))})()`);
 assert.equal(await evaluate(`JSON.stringify(window.__fadePaneSlots)`),before);
 await evaluate(`(()=>{const item=shadow.querySelector('.fade-gpt-tab'),data=new DataTransfer();item.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:data}));shadow.querySelectorAll('.fade-window-pane')[1].dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}))})()`);await wait(250);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),2);
 // Native page identity and typed draft survive an in-app move.
 await evaluate(`window.savedPage=document.querySelector('[data-fade-page-key]');savedPage.querySelector('textarea').value='draft kept';`);
 await evaluate(`shadow.querySelector('[role=separator]').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))`);
 assert.equal(await evaluate(`savedPage.isConnected&&savedPage.querySelector('textarea').value==='draft kept'`),true);
 const screenshot=await command('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(base,'window-mode.png'),Buffer.from(screenshot.data,'base64'));
 await evaluate(`mode.set(false)`);assert.equal(await evaluate(`shadow.querySelector('.fade-window-row').hidden`),true);
 assert.equal(await evaluate(`codex.length`),2,'mode off preserves every Codex home draft tab');
 await evaluate(`mode.set(true)`);
 assert.equal(await evaluate(`mode.transfer('export',{key:codex[0].path}).then(()=>false,error=>error.message.includes('未发送'))`),true);
 await evaluate(`mode.transfer('import',{type:'gpt',path:'/c/imported',title:'接收的聊天',fresh:true})`);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),1);
 assert.equal(await evaluate(`shadow.querySelector('.fade-window-directory').textContent`),'GPT');
 assert.equal(await evaluate(`gpt.length`),1);
 await evaluate(`shadow.querySelector('.fade-window-pane').lastElementChild.click()`);
 assert.equal(await evaluate(`gpt.length`),0,'close pane closes all its tabs');
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),1,'last pane returns to one start page');
 await evaluate(`mode.destroy();abort.abort()`);assert.equal(await evaluate(`document.querySelectorAll('style').length`),0);
 console.log('Window mode browser checks passed. Screenshot: '+path.join(base,'window-mode.png'));
}finally{if(socket)try{await command('Browser.close')}catch{}socket?.close();if(browser.exitCode===null)await Promise.race([new Promise(r=>browser.once('exit',r)),wait(3000)]);await retireTestArea(base,browser)}
