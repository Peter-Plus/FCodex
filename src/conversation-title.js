// A mounted sidebar row can keep its creation key after its conversation is saved.
function fadeConversationRenameRow(doc,routeId){
 if(!routeId)return null;
 const id=decodeURIComponent(routeId);
 return [...doc.querySelectorAll('[data-app-action-sidebar-thread-row]')].find(row=>
  [id,'local:'+id].includes(row.getAttribute('data-app-action-sidebar-thread-id'))||fadeCodexConversationId(row)===id
 )||null;
}
function installConversationTitle(){
 const title=document.createElement('div');title.className='fade-conversation-title';title.setAttribute('role','heading');title.setAttribute('aria-level','1');title.hidden=true;shadow.append(title);
 let frame=0,dead=false;const marked=new Set();
 const visible=el=>!el.closest('[hidden],[data-app-shell-active-page="false"]')&&el.getBoundingClientRect().width>0;
 function sync(){
  frame=0;if(dead)return;
  const composer=[...document.querySelectorAll('[data-codex-composer-root]')].find(visible);
  const scroll=[...document.querySelectorAll('.thread-scroll-container')].find(visible);
  const page=scroll||composer;
  const path=fadeNativeRouter(document)?.location?.pathname||'';
  const hasMessages=!!scroll?.querySelector('[data-content-search-unit-key],[data-turn-key],[data-message-id]');
  const viewer=[...document.querySelectorAll('.codex-dialog.inset-0:has([data-testid="viewer-header"])')].some(visible);
  title.hidden=viewer||!page||!hasMessages||root.hasAttribute('data-fade-settings');
  if(editor)editor.hidden=viewer;
  for(const el of [...marked])if(el!==scroll||title.hidden){el.removeAttribute('data-fade-title-space');el.parentElement?.removeAttribute('data-fade-title-layout');marked.delete(el)}
  if(title.hidden)return;
  if(scroll&&!marked.has(scroll)){scroll.setAttribute('data-fade-title-space','');scroll.parentElement?.setAttribute('data-fade-title-layout','');marked.add(scroll)}
  const selected=shadow.querySelector('#gptTabs [aria-selected=true]')||shadow.querySelector('#codexTabs [aria-selected=true]');
  const native=[...document.querySelectorAll('[data-thread-title]')].find(el=>!el.closest('[data-app-shell-active-page="false"],.app-shell-left-panel'));
  const text=selected?.getAttribute('title')||native?.textContent?.trim()||'新聊天';
  if(title.textContent!==text)title.textContent=text;

  if(scroll)resize.observe(scroll);if(composer)resize.observe(composer);
  const box=scroll?.getBoundingClientRect(),anchor=composer?.getBoundingClientRect();
  const width=box?.width||anchor?.width||Math.min(736,window.innerWidth-48);
  const left=box?.left??anchor?.left??(window.innerWidth-width)/2;
  title.style.left=left+'px';title.style.width=width+'px';title.style.top=(box?box.top-40:43)+'px';
 }
 let renaming=false,editor=null;
 async function openRename(){

  if(renaming)return;renaming=true;
  try{
   if(shadow.querySelector('#gptTabs [aria-selected=true]')){if(!disposeGptTabs.renameCurrent())announce('当前聊天暂时无法重命名');return}
   const path=fadeNativeRouter(document)?.location?.pathname;
   const id=path?.match(/^\/local\/([^/?#]+)$/)?.[1];
   const row=fadeConversationRenameRow(document,id);
   if(!row){announce('当前聊天暂时无法重命名');return}
   let fiber=row[Object.keys(row).find(k=>k.startsWith('__reactFiber'))];
   if(fiber?.alternate){let top=fiber;while(top.return)top=top.return;if(top.stateNode?.current&&top.stateNode.current!==top)fiber=fiber.alternate}
   for(let i=0;fiber&&i<20;i++,fiber=fiber.return){
    if(typeof fiber.memoizedProps?.getItems!=='function')continue;
    const items=await fiber.memoizedProps.getItems();
    if(path!==fadeNativeRouter(document)?.location?.pathname)return;
    const action=items.find(item=>item.id==='rename-thread');
    if(action?.enabled!==false&&typeof action?.onSelect==='function'){await action.onSelect();return}break;
   }
   announce('当前聊天暂时无法重命名');
  }catch{announce('打开重命名失败，请重试')}finally{renaming=false}
 }
 function finishEdit(){editor?.remove();editor=null;title.style.visibility='';}
 async function saveEdit(){
  const value=editor?.value.trim();if(!value){editor?.focus();return}if(value===title.textContent){finishEdit();return}
  editor.disabled=true;
  const mask=document.createElement('style');mask.textContent='html[data-fade-inline-saving] [role=dialog],html[data-fade-inline-saving] [data-state=open][class*="fixed"]{opacity:0!important;pointer-events:none!important}';document.head.append(mask);root.setAttribute('data-fade-inline-saving','');
  try{
   await openRename();
   let dialog,input;for(let i=0;i<30;i++){dialog=[...document.querySelectorAll('[role=dialog]')].find(el=>el.querySelector('input'));input=dialog?.querySelector('input');if(input)break;await new Promise(resolve=>setTimeout(resolve,30))}
   if(!input)throw Error('重命名入口不可用');
   const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
   await new Promise(resolve=>setTimeout(resolve,0));
   const save=[...dialog.querySelectorAll('button')].find(el=>/^(保存|Save)$/.test(el.textContent.trim()));if(!save||save.disabled)throw Error('无法保存此标题');save.click();
   for(let i=0;i<60&&dialog.isConnected;i++)await new Promise(resolve=>setTimeout(resolve,50));
   if(dialog.isConnected){[...dialog.querySelectorAll('button')].find(el=>/^(取消|Cancel)$/.test(el.textContent.trim()))?.click();throw Error('保存未完成，请重试')}
   finishEdit();schedule();
  }catch(error){announce(error.message);if(editor){editor.disabled=false;editor.focus()}}
  finally{root.removeAttribute('data-fade-inline-saving');mask.remove()}
 }
 function rename(){
  if(editor||renaming)return;
  editor=document.createElement('input');editor.className='fade-title-editor';editor.value=title.textContent;editor.setAttribute('aria-label','聊天标题');const box=title.getBoundingClientRect();const width=Math.min(480,box.width-48);Object.assign(editor.style,{left:(box.left+(box.width-width)/2)+'px',top:(box.top+5)+'px',width:width+'px'});shadow.append(editor);title.style.visibility='hidden';editor.focus();editor.select();
  on(editor,'keydown',event=>{if(event.isComposing)return;if(event.key==='Enter'){event.preventDefault();void saveEdit()}else if(event.key==='Escape'){event.preventDefault();finishEdit();title.focus()}});
 }
 on(document,'pointerdown',event=>{if(editor&&!editor.disabled&&!event.composedPath().includes(editor))finishEdit()},{capture:true});
 on(title,'dblclick',event=>{event.preventDefault();rename()});
 on(title,'keydown',event=>{if(event.key==='F2'){event.preventDefault();void rename()}});title.tabIndex=0;title.setAttribute('aria-label','聊天标题，双击或按 F2 重命名');
 function schedule(){if(!dead&&!frame)frame=requestAnimationFrame(sync)}
 const observer=new MutationObserver(schedule);
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-app-shell-active-page','data-app-action-sidebar-thread-title','data-fade-settings']});
 observer.observe(shadow,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-selected','title']});
 const resize=new ResizeObserver(schedule);resize.observe(document.documentElement);
 on(window,'resize',schedule);on(document,'transitionend',schedule);
 sync();return ()=>{dead=true;finishEdit();observer.disconnect();resize.disconnect();if(frame)cancelAnimationFrame(frame);for(const el of marked){el.removeAttribute('data-fade-title-space');el.parentElement?.removeAttribute('data-fade-title-layout')}title.remove()};
}


