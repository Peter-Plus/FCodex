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
 const css=(await fs.readFile('src/gpt-tabs.css','utf8'))+'\n'+(await fs.readFile('src/window-mode.css','utf8'))+'\n'+(await fs.readFile('src/surface-polish-shadow.css','utf8')),pageCss=await fs.readFile('src/file-panel.css','utf8'),model=(await fs.readFile('src/window-preview.js','utf8'))+'\n'+(await fs.readFile('src/window-layout.js','utf8')),source=await fs.readFile('src/window-mode.js','utf8'),codexSource=await fs.readFile('src/codex-tabs.js','utf8');
 await evaluate(`
 const root=document.documentElement,host=document.createElement('div');document.body.append(host);const shadow=host.attachShadow({mode:'open'}),abort=new AbortController();
 shadow.innerHTML='<style>*{box-sizing:border-box}button,textarea{font:inherit}button{display:inline-flex;justify-content:center;align-items:center;gap:8px;color:inherit;background:none;border:0;cursor:pointer}[hidden]{display:none!important}:host{position:fixed;inset:0;z-index:30;pointer-events:none;--ink:#eee;--bg:#181818;--edge:#383838;--line:#303030;--purple:#B8A0E0;font:13px Segoe UI}.compact-head{position:absolute;left:20px;top:0;height:43px;display:flex;align-items:center;pointer-events:auto}.fade-gpt-tab{display:flex}.compact-head span{color:#B8A0E0;font-weight:600}'+${JSON.stringify(css)}+'</style><header class="compact-head"><span>FCodex</span><div id="headerTabsScroll">普通标签行</div></header>';
 const $=s=>shadow.querySelector(s),on=(el,event,fn,opts={})=>el.addEventListener(event,fn,{...opts,signal:abort.signal}),messages=[];function announce(s){messages.push(s)}
 let seq=0;crypto.randomUUID=()=>String(++seq);const loc={pathname:'/',state:{},key:'0'};function go(path,state){Object.assign(loc,path,{state,key:String(++seq)});const key=state?.fadePaneHome||state?.fadeDraftKey||path.pathname;let page=[...document.querySelectorAll('[data-fade-page-key]')].find(el=>el.dataset.fadePageKey===key);if(!page){page=document.createElement('div');page.dataset.fadePageKey=key;page.innerHTML='<h2>'+key+'</h2><textarea placeholder="写下消息"></textarea>';page.style.background='#202020';page.style.color='#eee';document.body.append(page)}}
 function fadeNativeRouter(){return {location:loc,navigator:{push:go}}}const codex=[],gpt=[];
 function make(type,tabs){return {tabs:()=>tabs,ready:true,activate:t=>go(t.location,t.location.state),close:t=>{const key=typeof t==='string'?t:t.path;const i=tabs.findIndex(t=>(t.path||t.id)===key);if(i>=0)tabs.splice(i,1)},sync(){},addHome(key){const tab={path:key,title:'新聊天',location:{pathname:'/',state:{fadePaneHome:key}}};tabs.push(tab);this.activate(tab);return tab},newChat(){const id='gpt-'+ ++seq,t={id,title:'新聊天',location:{pathname:'/',state:{fadeDraftKey:id,fadeChat:true}}};tabs.push(t);this.activate(t)},openHistory(t){const tab={id:t.id,title:t.title,location:{pathname:'/c/'+t.id,state:{}}};tabs.push(tab);this.activate(tab)}}}
 const disposeCodexTabs=make('codex',codex),disposeGptTabs=make('gpt',gpt),chatPicker={openFor(){}};window.__fadePaneHostSupported=true;window.__fadePaneHostVersion=2;window.__fadePaneFocusVersion=1;window.__fadePaneHomeVersion=1;window.__fadePreviewHostSupported=true;window.__fadePreviewHostVersion=3;window.__fadeNativeScopeSnapshot=()=>{};
 window.legacyWorkspaceCalls=[];window.fadeWindowWorkspace={request(...args){legacyWorkspaceCalls.push(args);return Promise.resolve()},subscribe(...args){legacyWorkspaceCalls.push(args);return()=>{}}};
 ${codexSource}\n${model}\n${source}\nconst mode=installFadeWindowMode();mode.set(true);
 `);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),1);
 // Native right-aligned frame keeps its measured width when its containing pane shrinks.
 // Reproduce the crop first, then verify production CSS at narrow/normal widths.
 const frameFit=await evaluate(`(()=>{const sheet=document.createElement('style');sheet.textContent='._MainContentViewport_fixture{display:flex;flex-direction:column;width:100%;overflow:hidden}._MainContentFrame_fixture{display:flex;flex-direction:column;min-width:100%;align-self:flex-end}.frame-content,.frame-composer{box-sizing:border-box;width:100%}'+${JSON.stringify(pageCss)};document.head.append(sheet);const pane=document.createElement('div');pane.dataset.fadePageKey='layout-fixture';pane.style.cssText='position:fixed;left:0;top:85px;width:441px';pane.innerHTML='<div class="_MainContentViewport_fixture"><div class="_MainContentFrame_fixture" style="width:568px"><p class="frame-content">聊天正文</p><textarea class="frame-composer">未发送草稿</textarea></div></div>';document.body.append(pane);const frame=pane.querySelector('._MainContentFrame_fixture'),composer=pane.querySelector('textarea');root.removeAttribute('data-fade-window-mode');const reproduces=frame.getBoundingClientRect().left<0;root.setAttribute('data-fade-window-mode','');const checks=[240,441,643,960].map(width=>{pane.style.width=width+'px';composer.focus();const p=pane.getBoundingClientRect();return [frame,pane.querySelector('p'),composer].every(el=>{const r=el.getBoundingClientRect();return r.left>=p.left-.1&&r.right<=p.right+.1&&r.width>0})});const draft=composer.value;pane.remove();sheet.remove();return {reproduces,checks,draft}})()`);
 assert.deepEqual(frameFit,{reproduces:true,checks:[true,true,true,true],draft:'未发送草稿'});
 // Create same-type panes, move a tab, and reject a different type without changing ownership.
 await evaluate(`shadow.querySelector('.fade-window-menu button').click()`);await wait(250);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),2);
 // Native programmatic focus must not become a navigation request. Explicit
 // mouse entry and real browser Tab traversal still select the target pane.
 await evaluate(`window.focusPages=[...document.querySelectorAll('[data-fade-page-key]')].filter(p=>p.getBoundingClientRect().width);shadow.querySelector('.fade-window-pane .fade-gpt-select').click();window.focusRoute=loc.key;focusPages[1].querySelector('textarea').focus()`);
 assert.equal(await evaluate('loc.key===focusRoute'),true,'programmatic focus cannot switch native route');
 await evaluate(`focusPages[0].querySelector('textarea').focus()`);
 await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
 assert.equal(await evaluate(`loc.state.fadePaneHome===focusPages[1].dataset.fadePageKey`),true,'Tab enters the second pane');
 await evaluate(`window.focusRoute=loc.key;focusPages[0].querySelector('textarea').focus()`);
 assert.equal(await evaluate('loc.key===focusRoute'),true,'later autofocus is not mistaken for the preceding Tab');
 const focusPoint=await evaluate(`(()=>{const r=focusPages[0].querySelector('textarea').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 await command('Input.dispatchMouseEvent',{type:'mousePressed',...focusPoint,button:'left',clickCount:1});
 await command('Input.dispatchMouseEvent',{type:'mouseReleased',...focusPoint,button:'left',clickCount:1});
 assert.equal(await evaluate(`loc.state.fadePaneHome===focusPages[0].dataset.fadePageKey`),true,'pointer enters the first pane');
 // Full-window image viewers share the body with native portals, below Fade's
 // shadow host. Their controls must not be intercepted by the pane tab row.
 const viewerCss=(await fs.readFile('src/shell.css','utf8')).split('/* Full-window native viewers')[1];
 const viewerCheck=await evaluate(`(()=>{
  host.id='fade-codex-layer';host.style.zIndex='2147483000';root.setAttribute('data-fade-codex','');
  const style=document.createElement('style');style.textContent=${JSON.stringify('/* Full-window native viewers'+viewerCss)};document.head.append(style);
  const row=shadow.querySelector('.fade-window-row'),divider=shadow.querySelector('.fade-window-divider'),widths=()=>[...row.children].map(e=>e.getBoundingClientRect().width),before=widths();
  const dialog=document.createElement('div');dialog.className='codex-dialog inset-0';dialog.style.cssText='position:fixed;inset:0;z-index:50;background:#242424';dialog.innerHTML='<header data-testid="viewer-header"><button style="position:absolute;right:8px;top:8px;width:32px;height:32px">关闭</button></header>';document.body.append(dialog);
  const control=dialog.querySelector('button'),hit=()=>{const r=control.getBoundingClientRect();return document.elementFromPoint(r.x+16,r.y+16)===control};
  const open={visibility:getComputedStyle(row).visibility,divider:getComputedStyle(divider).visibility,hit:hit(),widths:widths(),top:dialog.getBoundingClientRect().top};
  dialog.hidden=true;const hidden=getComputedStyle(row).visibility;dialog.hidden=false;
  dialog.dataset.state='closed';const closed=getComputedStyle(row).visibility;delete dialog.dataset.state;
  const reopened=hit();dialog.remove();const restored={visibility:getComputedStyle(row).visibility,widths:widths()};
  const ordinary=document.createElement('div');ordinary.className='codex-dialog';ordinary.innerHTML='<header data-testid="viewer-header"></header>';document.body.append(ordinary);const ordinaryVisibility=getComputedStyle(row).visibility;ordinary.remove();
  style.remove();host.removeAttribute('id');host.style.removeProperty('z-index');root.removeAttribute('data-fade-codex');
  return {before,open,hidden,closed,reopened,restored,ordinaryVisibility};
 })()`);
 assert.equal(viewerCheck.open.visibility,'hidden');assert.equal(viewerCheck.open.divider,'hidden');assert.equal(viewerCheck.open.hit,true);assert.equal(viewerCheck.open.top,44);
 assert.deepEqual(viewerCheck.open.widths,viewerCheck.before);assert.deepEqual(viewerCheck.restored.widths,viewerCheck.before);
 assert.equal(viewerCheck.hidden,'visible');assert.equal(viewerCheck.closed,'visible');assert.equal(viewerCheck.reopened,true);assert.equal(viewerCheck.restored.visibility,'visible');assert.equal(viewerCheck.ordinaryVisibility,'visible');
 // Compare with normal-mode controls using the same production CSS.
 const styleCheck=await evaluate(`(()=>{const ref=document.createElement('div');ref.style.cssText='position:absolute;left:-5000px';ref.innerHTML='<button class="fade-directory">Codex</button><div class="fade-gpt-tab"><button class="fade-gpt-select fade-codex-select" aria-selected="true"><span class="fade-tab-title">新聊天</span></button><button class="fade-gpt-close">×</button></div><button class="fade-gpt-add">+</button>';shadow.append(ref);const properties=['fontSize','lineHeight','padding','borderRadius','borderColor','backgroundColor','color','height'];const matches=['.fade-directory','.fade-gpt-select','.fade-gpt-close','.fade-gpt-add'].every(selector=>{const a=getComputedStyle(ref.querySelector(selector)),b=getComputedStyle(shadow.querySelector('.fade-window-pane').querySelector(selector));return properties.every(p=>a[p]===b[p])});const strip=shadow.querySelector('.fade-window-tabs'),last=strip.querySelector('.fade-gpt-tab:last-child').getBoundingClientRect(),plus=strip.querySelector('.fade-gpt-add').getBoundingClientRect();ref.remove();return {matches,plusGap:plus.left-last.right}})()`);
 assert.equal(styleCheck.matches,true,'directory/tab/close/add share normal-mode styles');assert(styleCheck.plusGap>=0&&styleCheck.plusGap<=6,'plus follows last tab');
 const idle=await evaluate(`(async()=>{const style=document.head.querySelector('style'),row=shadow.querySelector('.fade-window-row'),tab=row.querySelector('.fade-gpt-tab');let styleWrites=0,rowWrites=0;const a=new MutationObserver(r=>styleWrites+=r.length),b=new MutationObserver(r=>rowWrites+=r.length);a.observe(style,{childList:true,subtree:true,characterData:true});b.observe(row,{childList:true,subtree:true});await new Promise(r=>setTimeout(r,950));a.disconnect();b.disconnect();return {styleWrites,rowWrites,sameTab:tab===row.querySelector('.fade-gpt-tab')}})()`);
 assert.deepEqual(idle,{styleWrites:0,rowWrites:0,sameTab:true});
 // Start a real mouse drag deep in the body, and hold across multiple sync ticks.
 const dragPoint=await evaluate(`(()=>{window.separator=shadow.querySelector('[role=separator]');const r=separator.getBoundingClientRect();window.widthBefore=shadow.querySelector('.fade-window-pane').getBoundingClientRect().width;return {x:r.x+r.width/2,y:550,height:r.height,hit:shadow.elementFromPoint(r.x+r.width/2,550)===separator}})()`);
 assert.equal(dragPoint.hit,true);assert.equal(dragPoint.height,757);
 await evaluate(`window.dragSheet=document.head.querySelector('style').sheet;window.dragRules=[...dragSheet.cssRules];window.dragRevision=window.__fadePaneRevision`);
 await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:dragPoint.x,y:dragPoint.y});
 await command('Input.dispatchMouseEvent',{type:'mousePressed',x:dragPoint.x,y:dragPoint.y,button:'left',clickCount:1});
 await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:dragPoint.x+90,y:dragPoint.y,button:'left',buttons:1});await wait(450);
 assert.equal(await evaluate(`separator.isConnected&&shadow.querySelector('.fade-window-pane').getBoundingClientRect().width>widthBefore+60`),true,'held body drag survives polling');
 await command('Input.dispatchMouseEvent',{type:'mouseReleased',x:dragPoint.x+90,y:dragPoint.y,button:'left',clickCount:1});
 assert.equal(await evaluate(`separator===shadow.querySelector('[role=separator]')`),true);
 assert.equal(await evaluate(`dragRules.length===dragSheet.cssRules.length&&dragRules.every((rule,i)=>rule===dragSheet.cssRules[i])&&dragRevision===window.__fadePaneRevision`),true,'resize keeps CSS rule objects and React layout revision stable');
 assert.equal(await evaluate(`Object.entries(window.__fadePaneSlots).filter(([,pane])=>pane!=='hidden').every(([key,pane])=>{const page=document.querySelector('[data-fade-page-key='+CSS.escape(key)+']'),header=shadow.querySelector('[data-pane='+CSS.escape(pane)+']');if(!page)return false;const a=page.getBoundingClientRect(),b=header.getBoundingClientRect();return Math.abs(a.left-b.left)<1&&Math.abs(a.width-b.width)<1})`),true,'resized page geometry matches its header');
 await evaluate(`shadow.querySelectorAll('.fade-window-menu button')[1].click()`);await wait(250);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),3);
 await evaluate(`window.gptStatusButton=shadow.querySelectorAll('.fade-window-pane')[2].querySelector('.fade-gpt-select');gpt[0].status='working'`);await wait(250);
 assert.equal(await evaluate(`gptStatusButton.querySelector('.fade-tab-status')?.getAttribute('aria-label')`),'工作中');
 assert.equal(await evaluate(`getComputedStyle(gptStatusButton.querySelector('.fade-tab-status')).width`),'13px');
 await evaluate(`gpt[0].status='completed';gpt[0].completionSeen=false`);await wait(250);
 assert.equal(await evaluate(`gptStatusButton.querySelector('.fade-tab-status')?.getAttribute('aria-label')`),'已完成');
 await evaluate(`gpt[0].completionSeen=true`);await wait(250);
 assert.equal(await evaluate(`gptStatusButton.isConnected&&!gptStatusButton.querySelector('.fade-tab-status')`),true,'acknowledgement removes badge without replacing tab');
 const before=await evaluate(`JSON.stringify(window.__fadePaneSlots)`);
 // Foreign drops, outside releases, Escape and stale tokens leave all local tabs intact.
 const rejectedDrops=await evaluate(`(()=>{const item=shadow.querySelector('.fade-gpt-tab'),pane=shadow.querySelectorAll('.fade-window-pane')[1],foreign=new DataTransfer();foreign.setData('application/x-fade-tab',JSON.stringify({type:'codex',token:'another-window'}));const over=new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:foreign});pane.dispatchEvent(over);pane.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:foreign}));const unchanged=()=>JSON.stringify(window.__fadePaneSlots)===${JSON.stringify(before)};const external=unchanged();let data=new DataTransfer();item.dispatchEvent(new DragEvent('dragstart',{dataTransfer:data}));pane.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:foreign}));const mismatch=unchanged();item.dispatchEvent(new DragEvent('dragend',{dataTransfer:data}));pane.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));const outside=unchanged();data=new DataTransfer();item.dispatchEvent(new DragEvent('dragstart',{dataTransfer:data}));window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));pane.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));return {external,mismatch,outside,cancelled:unchanged(),acceptsForeign:over.defaultPrevented,calls:legacyWorkspaceCalls.length}})()`);
 assert.deepEqual(rejectedDrops,{external:true,mismatch:true,outside:true,cancelled:true,acceptsForeign:false,calls:0});
 await evaluate(`window.savedPage=document.querySelector('[data-fade-page-key]');savedPage.querySelector('textarea').value='draft kept';`);
 await evaluate(`(()=>{const item=shadow.querySelector('.fade-gpt-tab'),data=new DataTransfer();item.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:data}));shadow.querySelectorAll('.fade-window-pane')[2].dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}))})()`);
 assert.equal(await evaluate(`JSON.stringify(window.__fadePaneSlots)`),before);
 await evaluate(`(()=>{const item=shadow.querySelector('.fade-gpt-tab'),data=new DataTransfer();item.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:data}));shadow.querySelectorAll('.fade-window-pane')[1].dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}))})()`);await wait(250);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),2);
 // Native page identity and typed draft survive an in-app move.
 await evaluate(`window.keyboardSeparator=shadow.querySelector('[role=separator]');keyboardSeparator.focus();keyboardSeparator.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))`);
 assert.equal(await evaluate(`keyboardSeparator===shadow.activeElement&&keyboardSeparator===shadow.querySelector('[role=separator]')`),true,'keyboard resize retains focus');
 assert.equal(await evaluate(`savedPage.isConnected&&savedPage.querySelector('textarea').value==='draft kept'`),true);
 const screenshot=await command('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(base,'window-mode.png'),Buffer.from(screenshot.data,'base64'));

 // Preview entries retain their origin, share one extra pane and survive chat switches.
 await evaluate(`window.sourceA={},window.sourceB={};window.bridge=window.__fadePreviewBridge;window.previewA=bridge.key(sourceA,'file:readme');window.previewB=bridge.key(sourceB,'file:readme');window.closedPreviews=[];for(const [id,title] of [[previewA,'项目 A/readme'],[previewB,'项目 B/readme']]){bridge.mount(id);bridge.update(id,{title,reveal:true,activate(){},close(){closedPreviews.push(id);bridge.remove(id)}})}`);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-preview-pane').length`),1);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-preview-pane [role=tab]').length`),2);
 assert.equal(await evaluate(`previewA!==previewB&&!document.querySelector('[data-fade-unified-preview]').hidden`),true);
 await evaluate(`shadow.querySelector('.fade-preview-pane .fade-window-directory').click()`);
 assert.equal(await evaluate(`shadow.querySelector('.fade-preview-directory').hidden`),false);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-preview-directory [role=menuitemradio]').length`),2);
 assert.equal(await evaluate(`shadow.querySelector('.fade-preview-directory [aria-checked=true]').dataset.previewId`),await evaluate('previewB'));
 await evaluate(`shadow.querySelector('.fade-preview-directory button').click()`);
 assert.equal(await evaluate('bridge.active'),await evaluate('previewA'));
 assert.equal(await evaluate(`shadow.querySelector('.fade-preview-directory').hidden`),true);
 await evaluate(`shadow.querySelector('.fade-preview-pane .fade-window-directory').click();window.extraPreviews=[];for(let i=0;i<35;i++){const id='directory-extra-'+i;extraPreviews.push(id);bridge.mount(id);bridge.update(id,{title:'同名文件 / 长路径 / '+i,activate(){},close(){bridge.remove(id)}})}`);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-preview-directory button').length`),37,'open directory follows added previews');
 assert.equal(await evaluate(`(()=>{const p=shadow.querySelector('.fade-preview-directory'),r=p.getBoundingClientRect();return p.scrollHeight>p.clientHeight&&r.right<=innerWidth&&r.bottom<=innerHeight})()`),true,'long directory scrolls within viewport');
 await evaluate(`shadow.querySelector('.fade-preview-directory button').focus()`);
 await command('Input.dispatchKeyEvent',{type:'keyDown',key:'End',code:'End'});
 assert.equal(await evaluate(`shadow.activeElement.dataset.previewId`),'directory-extra-34');
 await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
 assert.equal(await evaluate(`shadow.querySelector('.fade-preview-directory').hidden`),true);
 assert.equal(await evaluate(`shadow.activeElement===shadow.querySelector('.fade-preview-pane .fade-window-directory')`),true);
 await evaluate(`shadow.querySelector('.fade-preview-pane .fade-window-directory').click();document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,composed:true}));for(const id of extraPreviews)bridge.remove(id)`);
 assert.equal(await evaluate(`shadow.querySelector('.fade-preview-directory').hidden`),true,'outside click dismisses directory');
 await evaluate(`const previewStyle=document.createElement('style');previewStyle.textContent="[data-fade-unified-preview]{position:fixed;top:85px;height:calc(100vh - 85px);background:#24212b;color:#eee}[data-fade-unified-preview][hidden],.fade-preview-native-host[hidden]{display:none}.fade-preview-native-host{padding:20px}";document.head.append(previewStyle);bridge.mount(previewB).textContent='项目 B / readme · 原生内容挂载区域';`);
 const previewShot=await command('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(base,'preview.png'),Buffer.from(previewShot.data,'base64'));
 await evaluate(`previewStyle.remove()`);
 await evaluate(`shadow.querySelector('.fade-window-pane [role=tab]').click()`);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-preview-pane [role=tab]').length`),2);
 await evaluate(`shadow.querySelector('.fade-preview-pane .fade-window-close-pane').click()`);
 assert.equal(await evaluate(`closedPreviews.length===2&&shadow.querySelectorAll('.fade-preview-pane').length===0`),true);
 // Re-created hooks for the same native scope must not duplicate preview tabs.
 const scopeResult=await evaluate(`(()=>{const node={},scope={node,value:{pathname:'/local/source'}},same={node,value:scope.value},other={node:{},value:{pathname:'/local/other'}},tab={tabId:'file:host:/project/readme',title:'readme'},calls=[];const controller={activateTab(s,id){calls.push(['activate',s===scope,id])},pinTab(){},closeTab(s){bridge.reconcile(s,[],controller,null)}};bridge.reconcile(scope,[tab],controller,tab.tabId);bridge.reconcile(same,[tab],controller,tab.tabId);const stable=bridge.groups.length===1;bridge.reconcile(other,[tab],controller,tab.tabId);const separate=bridge.groups.length===2,retained=bridge.retainsPath('/local/source');bridge.select(bridge.key(same,tab.tabId));const origin=calls[0][1];controller.closeTab(scope);controller.closeTab(other);return {stable,separate,retained,origin,empty:bridge.groups.length===0}})()`);
 assert.deepEqual(scopeResult,{stable:true,separate:true,retained:true,origin:true,empty:true});
 // Most-recent pane routing and duplicate chat lookup do not create another copy.
 const routing=await evaluate(`(()=>{const panes=[...shadow.querySelectorAll('.fade-window-pane')];panes.find(p=>p.querySelector('.fade-directory').textContent==='GPT').querySelector('[role=tab]').click();const before=gpt.length;mode.newChat();const created=gpt.length===before+1;const id=codex[0].path,count=codex.length;const duplicate=mode.prepare('codex',id);return {created,duplicate,sameCount:codex.length===count}})()`);
 assert.deepEqual(routing,{created:true,duplicate:false,sameCount:true});
 await evaluate(`mode.set(false)`);assert.equal(await evaluate(`shadow.querySelector('.fade-window-row').hidden`),true);
 assert.equal(await evaluate(`codex.length`),2,'mode off preserves every Codex home draft tab');
 for(const version of ['undefined','1','2']){
  assert.equal(await evaluate(`window.__fadePreviewHostVersion=${version};mode.set(true)`),false,'old native preview must not silently mix with new UI');
  assert.equal(await evaluate(`mode.enabled`),false);
  assert.match(await evaluate(`messages.at(-1)`),/更新运行时/);
 }
 await evaluate(`window.__fadePreviewHostVersion=3`);
 await evaluate(`window.__fadePaneHostVersion=1`);
 assert.equal(await evaluate(`mode.set(true)`),false,'old home cache patch must not enable window mode');
 await evaluate(`window.__fadePaneHostVersion=2`);
 await evaluate(`mode.set(true)`);
 await evaluate(`shadow.querySelector('.fade-window-pane .fade-window-close-pane').click()`);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),1);
 assert.equal(await evaluate(`shadow.querySelector('.fade-window-directory').textContent`),'GPT');
 assert.equal(await evaluate(`gpt.length`),2);
 await evaluate(`shadow.querySelector('.fade-window-pane').lastElementChild.click()`);
 assert.equal(await evaluate(`gpt.length`),0,'close pane closes all its tabs');
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),1,'last pane returns to one start page');
 await evaluate(`for(let i=0;i<3;i++)shadow.querySelector('.fade-window-menu button').click()`);
 assert.equal(await evaluate(`shadow.querySelectorAll('.fade-window-pane').length`),4);
 assert.equal(await evaluate(`mode.prepare('gpt','not-open')`),false);
 assert.equal(await evaluate(`messages.at(-1)`),'聊天窗口数量已满');
 // Promotion keeps the same pane even if another pane receives focus before sync.
 await evaluate(`window.promoted=codex[0];window.homeKey=promoted.path;window.originalPane=window.__fadePaneSlots[homeKey];shadow.querySelectorAll('.fade-window-pane')[0].querySelector('[role=tab]').click();promoted.windowKey=homeKey;promoted.path='/local/submitted';promoted.location={pathname:'/local/submitted',state:{}};go(promoted.location,{});shadow.querySelectorAll('.fade-window-pane')[3].querySelector('[role=tab]').click()`);
 await wait(250);
 assert.equal(await evaluate(`window.__fadePaneSlots['/local/submitted']`),await evaluate('originalPane'),'submitted tab stays in its original pane');
 assert.equal(await evaluate(`codex.length`),4,'promotion does not manufacture an empty home');
 // Opening a saved task already owned by another pane retires only the selected home.
 await evaluate(`shadow.querySelectorAll('.fade-window-pane')[1].querySelector('[role=tab]').click();window.replacedHome=loc.state.fadePaneHome;window.otherHomes=codex.filter(t=>t.path!==replacedHome&&t!==promoted).map(t=>t.path);mode.prepare('codex','/local/submitted')`);
 assert.equal(await evaluate(`codex.some(t=>t.path===replacedHome)`),false);
 assert.equal(await evaluate(`otherHomes.every(key=>codex.some(t=>t.path===key))`),true,'unselected homes remain');
 await evaluate(`shadow.querySelectorAll('.fade-window-pane')[1].querySelector('[role=tab]').click();window.selectedHome=loc.state.fadePaneHome;disposeCodexTabs.replaceHome=t=>window.replacementRequested=t.path;mode.prepare('codex','new-directory-task')`);
 assert.equal(await evaluate('replacementRequested'),await evaluate('selectedHome'),'directory requests replacement of the active home in its destination pane');
 await evaluate(`mode.destroy();abort.abort()`);assert.equal(await evaluate(`document.querySelectorAll('style').length`),0);
 assert.equal(await evaluate(`legacyWorkspaceCalls.length`),0,'no legacy workspace requests or subscriptions, including teardown');
 // Use the generated shadow markup so the complete production cascade participates.
 const production=await fs.readFile('fade.js','utf8'),markup=JSON.parse(production.match(/shadow\.innerHTML=("(?:\\.|[^"\\])*");/)[1]);
 const proximity=(await fs.readFile('src/runtime.js','utf8')).split('\n').find(line=>line.includes("on(document,'pointermove',e=>{if(!navOpen)"));assert(proximity);
 await evaluate(`const orbHost=document.createElement('div');document.body.append(orbHost);const orbShadow=orbHost.attachShadow({mode:'open'});orbShadow.innerHTML=${JSON.stringify(markup)};const orb=orbShadow.querySelector('#orbButton'),navigation=orbShadow.querySelector('#navigation');async function orbRect(){await new Promise(requestAnimationFrame);orb.getBoundingClientRect();await Promise.allSettled(orb.getAnimations().map(a=>a.finished));const r=orb.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,size:r.width}}`);
 await evaluate(`const orbEvents=new AbortController();(()=>{const host=orbHost,$=s=>orbShadow.querySelector(s),navOpen=false,on=(el,type,fn,options)=>el.addEventListener(type,fn,{...options,signal:orbEvents.signal});${proximity}})()`);
 const near=(a,b)=>assert(Math.abs(a-b)<.1,`Expected ${a} near ${b}`);
 for(const width of [1200,760,500]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:false});
  const ordinary=await evaluate(`orbHost.removeAttribute('data-window-mode');orbHost.classList.remove('near-orb');orb.blur();navigation.classList.remove('open');orbRect()`);
  const ordinaryOpen=await evaluate(`navigation.classList.add('open');orbRect()`);
  const docked=await evaluate(`orbHost.setAttribute('data-window-mode','');navigation.classList.remove('open');orbRect()`);
  near(docked.size,ordinary.size);near(docked.x,width/2);near(docked.y,0);
  assert.equal(await evaluate(`orbShadow.elementFromPoint(innerWidth/2,${docked.size/4})===orb`),true,'visible half remains clickable');
  assert.equal(await evaluate(`orbShadow.elementFromPoint(innerWidth/2,${docked.size/2+5})===orb`),false,'hit target does not extend below the orb');
  await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:width/2,y:5});
  const hovered=await evaluate('orbRect()'),revealedY=21.5;
  near(hovered.x,docked.x);near(hovered.y,revealedY);near(hovered.size,docked.size);
  assert.equal(await evaluate(`orbShadow.elementFromPoint(innerWidth/2,21.5)===orb`),true,'revealed core remains clickable inside the title bar');
  assert.equal(await evaluate(`orbShadow.elementFromPoint(innerWidth/2,44)===orb`),false,'orb cannot intercept the tab row');
  await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:width/2+5,y:revealedY+5});
  near((await evaluate('orbRect()')).y,revealedY);
  await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:width/2,y:44});
  near((await evaluate('orbRect()')).y,0);
  await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:width/2+60,y:20});
  assert.equal(await evaluate(`orbHost.classList.contains('near-orb')`),false,'wide title-bar proximity no longer wakes the orb');
  await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:width-5,y:250});
  near((await evaluate('orbRect()')).y,0);
  const focused=await evaluate(`orb.focus({preventScroll:true});orbRect()`);
  near(focused.x,docked.x);near(focused.y,revealedY);near(focused.size,docked.size);
  const opened=await evaluate(`navigation.classList.add('open');orbRect()`);
  near(opened.x,width/2);near(opened.y,400);near(opened.size,ordinaryOpen.size);
  const closed=await evaluate(`orb.blur();orbHost.classList.remove('near-orb');navigation.classList.remove('open');orbRect()`);near(closed.y,0);near(closed.size,ordinary.size);
  const restored=await evaluate(`orbHost.removeAttribute('data-window-mode');orbHost.classList.remove('near-orb');orb.blur();orbRect()`);near(restored.x,ordinary.x);near(restored.y,ordinary.y);
 }
 await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await evaluate(`orbHost.setAttribute('data-window-mode','');navigation.classList.add('open')`);
 const reduced=await evaluate('orbRect()');near(reduced.x,250);near(reduced.y,400);
 assert.equal(await evaluate(`orb.getAnimations().length`),0,'reduced motion remains respected');
 await evaluate(`orbEvents.abort();orbHost.remove()`);
 console.log('Window mode browser checks passed. Screenshot: '+path.join(base,'window-mode.png'));
}finally{if(socket)try{await command('Browser.close')}catch{}socket?.close();if(browser.exitCode===null)await Promise.race([new Promise(r=>browser.once('exit',r)),wait(3000)]);await retireTestArea(base,browser)}
