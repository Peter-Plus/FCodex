import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {createTestArea,retireTestArea} from './work-area.mjs';
const base=await createTestArea('chat-picker-hover');
const profile=path.join(base,'browser');
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));let target;
let socket,sequence=0;
function command(target,method,params={}){return new Promise((resolve,reject)=>{const id=++sequence;const receive=e=>{const reply=JSON.parse(e.data);if(reply.id!==id)return;socket.removeEventListener('message',receive);reply.error?reject(Error(JSON.stringify(reply.error))):resolve(reply.result)};socket.addEventListener('message',receive);socket.send(JSON.stringify({id,method,params}))})}
try{
 let port;for(let i=0;i<80;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await wait(100)}}assert.ok(port);
 target=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
 await command(target,'Page.bringToFront');
 await command(target,'Emulation.setDeviceMetricsOverride',{width:1100,height:800,deviceScaleFactor:1,mobile:false});
 await command(target,'Emulation.setFocusEmulationEnabled',{enabled:true});
 const evaluate=async expression=>{const r=await command(target,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 const source=await fs.readFile('src/chat-picker.js','utf8'),css=await fs.readFile('src/chat-picker.css','utf8');
 await evaluate(`
 const host=document.createElement('div');document.body.append(host);const shadow=host.attachShadow({mode:'open'});
 shadow.innerHTML='<style>:host{--line:#ddd;--ink:#222;--glass:white}button{border:0;background:transparent}[hidden]{display:none!important}'+${JSON.stringify(css)}+'</style><button id="compactTitle">Codex</button><button id="gptDirectory">GPT</button><section id="chatPicker" class="chat-picker" hidden><input id="chatSearch"><div id="chatPickerList" class="chat-picker-list"></div></section>';
 const $=s=>shadow.querySelector(s),on=(el,event,fn)=>el.addEventListener(event,fn);
 const chats=Array.from({length:40},(_,i)=>({id:String(i),title:'Chat '+i}));
 const adapter={snapshot:()=>({groups:[{id:'a',title:'Project A',expanded:true,chats:chats.slice(0,5),moreLabel:'展开更多'}],recent:chats}),ensureSidebar(){},refresh(){}};
 let notify;const disposeGptTabs={history:()=>({items:chats}),subscribe:fn=>{notify=fn;return()=>{}},loadHistory:async()=>{}};
 function closeNav(){}function bindChatContextMenu(){}function appendFadeChatStatus(){}function appendFadeChatActions(){}
 ${source}
 const picker=installChatPicker(adapter);
 `);
 const results=[];
 for(const mode of ['codex','gpt']){
  await evaluate(`$('#${mode==='codex'?'compactTitle':'gptDirectory'}').click()`);await wait(30);
  const point=await evaluate(`(()=>{const list=$('#chatPickerList');list.scrollTop=140;window.row=list.querySelector('[data-picker-key="${mode==='codex'?'chat':'gpt'}:8"]');row.focus({preventScroll:true});row.scrollIntoView({block:'center'});window.savedScroll=list.scrollTop;const r=row.getBoundingClientRect();return {x:r.x+100,y:r.y+r.height/2}})()`);
  // Force the CSS hover state: headless Windows does not reliably retain a pointer.
  await command(target,'DOM.getDocument',{depth:-1,pierce:true});
  const object=await command(target,'Runtime.evaluate',{expression:'row'});
  const {nodeId}=await command(target,'DOM.requestNode',{objectId:object.result.objectId});
  await command(target,'CSS.enable');
  await command(target,'CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['hover']});
  await wait(100);
  const result=await evaluate(`(async()=>{const list=$('#chatPickerList');let removals=0;const observer=new MutationObserver(records=>{removals+=records.reduce((n,r)=>n+r.removedNodes.length,0)});observer.observe(list,{childList:true,subtree:true});let hover=true;for(let i=0;i<30;i++){notify();await new Promise(requestAnimationFrame);hover&&=getComputedStyle(row).backgroundColor==='rgb(221, 221, 221)'}observer.disconnect();return {connected:row.isConnected,hover,removals,focus:shadow.activeElement===row,scroll:list.scrollTop===savedScroll}})()`);
  if(mode==='codex')assert.equal(await evaluate(`$('#chatPickerList').querySelectorAll('[data-picker-key^="chat:project:a:"]').length`),5,'project copies survive repeated refreshes alongside Recents');
  assert.deepEqual(result,{connected:true,hover:true,removals:0,focus:true,scroll:true});results.push({mode,...result});
 }

 const nativeSource=await fs.readFile('src/native-adapter.js','utf8');
 await evaluate(`
 ${nativeSource}
 window.nativeRoot=document.createElement('aside');nativeRoot.className='app-shell-left-panel';document.body.append(nativeRoot);
 const thread=(id,title)=>'<button data-app-action-sidebar-thread-row data-app-action-sidebar-thread-kind="local" data-app-action-sidebar-thread-host-id="local" data-app-action-sidebar-thread-id="'+id+'" data-app-action-sidebar-thread-title="'+title+'">'+title+'</button>';
 nativeRoot.innerHTML='<section id="customA" data-app-action-sidebar-section data-app-action-sidebar-section-heading="Same" data-app-action-sidebar-section-collapsed="false"><button data-app-action-sidebar-section-toggle>Toggle</button><button aria-haspopup="menu" id="sectionMenu">Menu</button>'+thread('direct','Direct')+'<div data-sidebar-project-container-id="project"><button data-app-action-sidebar-project-row data-app-action-sidebar-project-id="p" data-app-action-sidebar-project-label="Nested" data-app-action-sidebar-project-collapsed="false">Project</button>'+thread('nested','Nested chat')+'</div>'+thread('last','Last')+'</section><section id="customB" data-app-action-sidebar-section data-app-action-sidebar-section-heading="Same" data-app-action-sidebar-section-collapsed="true"><button data-app-action-sidebar-section-toggle>Toggle</button></section>';
 for(const [index,section]of [...nativeRoot.children].entries()){section.__reactFiber$fixture={memoizedProps:{sectionKey:'custom:'+index}};section.querySelector('[data-app-action-sidebar-section-toggle]').onclick=()=>section.setAttribute('data-app-action-sidebar-section-collapsed',String(section.getAttribute('data-app-action-sidebar-section-collapsed')!=='true'))}
 window.changes=[];window.nativeAdapter=createNativeAdapter(document,d=>changes.push(d));nativeAdapter.start();
 `);
 assert.deepEqual(await evaluate(`(()=>{const d=nativeAdapter.snapshot();return {ids:d.sections.map(s=>s.id),titles:d.sections.map(s=>s.title),order:d.sections[0].items.map(i=>i.kind==='chat'?i.chat.id:i.project.id),nested:d.groups[0].chats.length,recent:d.recent.length,menu:nativeAdapter.sectionMenu('custom:0').id}})()`),{ids:['custom:0','custom:1'],titles:['Same','Same'],order:['local:local:direct','p','local:local:last'],nested:1,recent:0,menu:'sectionMenu'});
 assert.equal(await evaluate(`nativeAdapter.toggleSection('custom:1',true)&&nativeAdapter.snapshot().sections[1].expanded`),true);
 assert.equal(await evaluate(`nativeAdapter.toggleSection('custom:1',true)&&nativeAdapter.snapshot().sections[1].expanded`),true,'opening twice must not collapse');
 await evaluate(`document.getElementById('customA').setAttribute('data-app-action-sidebar-section-heading','Renamed');nativeRoot.prepend(document.getElementById('customB'))`);
 await wait(160);
 assert.deepEqual(await evaluate(`changes.at(-1).sections.map(s=>[s.id,s.title])`),[['custom:1','Same'],['custom:0','Renamed']]);
 assert.deepEqual(await evaluate(`filterFadeChats(nativeAdapter.snapshot(),'nested chat').sections.map(s=>[s.id,s.items.length,s.items[0].project.chats.length])`),[['custom:0',1,1]]);
 await evaluate(`picker.destroy();adapter.snapshot=()=>nativeAdapter.snapshot();adapter.toggleSection=(...args)=>nativeAdapter.toggleSection(...args);adapter.sectionMenu=(...args)=>nativeAdapter.sectionMenu(...args);adapter.refresh=()=>{};window.sectionPicker=installChatPicker(adapter);sectionPicker.openFor('codex',$('#compactTitle'))`);
 assert.equal(await evaluate(`$('#chatPickerList').querySelectorAll('[data-picker-key^="section:custom:"]').length`),2);
 assert.equal(await evaluate(`$('#chatPickerList').querySelectorAll('[data-picker-key="chat:custom:0:local:local:direct"]').length`),1);
 assert.equal(await evaluate(`$('#chatPickerList').querySelectorAll('[data-picker-key="project:p"]').length`),1,'nested project must appear only inside its section');
 await evaluate(`$('#chatPickerList').querySelector('[data-picker-key="section:custom:0"]').click()`);
 assert.equal(await evaluate(`$('#chatPickerList').querySelectorAll('[data-picker-key="chat:custom:0:local:local:direct"]').length`),0);
 await evaluate(`sectionPicker.destroy();nativeAdapter.destroy();nativeRoot.remove()`);
 results.push({sections:'duplicate names, native order, project nesting, toggle, mutation refresh, search and directory rendering passed'});
 await fs.writeFile(path.join(base,'results.json'),JSON.stringify(results,null,2));
 console.log('Codex and GPT: stable hover, DOM identity, focus and scroll across 30 background refreshes each.');
}finally{
 if(target)try{await command(target,'Browser.close')}catch{}
 socket?.close();
 if(browser.exitCode===null)await Promise.race([new Promise(r=>browser.once('exit',r)),wait(3000)]);
 await retireTestArea(base,browser);
}



