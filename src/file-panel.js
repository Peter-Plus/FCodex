// Keep the preference separate from native editor state: changing display must
// not recreate the editor, its undo history, or an unsaved document.
function installPreviewCodeWrap(doc){
 const key='fade-preview-code-wrap',attr='data-fade-preview-code-nowrap',root=doc.documentElement,win=doc.defaultView;
 const original=root.getAttribute(attr);let enabled=true;
 try{enabled=win.localStorage.getItem(key)!=='false'}catch{}
 const viewers=new Map();
 function restore(state){state.observer?.disconnect();for(const [pre,value]of state.original)if(pre.getAttribute('data-overflow')==='scroll')pre.setAttribute('data-overflow',value)}
 function syncViewers(){
  const hosts=new Set(enabled?[]:[...(doc.querySelectorAll?.(':is([data-tab-id^="text-editor:"],[data-tab-id^="file:"]) diffs-container')||[])].filter(el=>el.shadowRoot));
  for(const [host,state]of viewers)if(!hosts.has(host)){restore(state);viewers.delete(host)}
  for(const host of hosts){
   if(viewers.has(host))continue;
   const state={original:new Map(),observer:null};
   const sync=()=>{
    const nodes=new Set(host.shadowRoot.querySelectorAll('pre:is([data-file],[data-diff])[data-overflow]'));
    for(const pre of state.original.keys())if(!nodes.has(pre))state.original.delete(pre);
    for(const pre of nodes){const value=pre.getAttribute('data-overflow');if(value!=='wrap'&&value!=='scroll')continue;if(!state.original.has(pre)||value!=='scroll')state.original.set(pre,value);if(value!=='scroll')pre.setAttribute('data-overflow','scroll')}
   };
   // The native renderer uses this attribute for its complete grid/scroll mode,
   // including sticky line numbers. Reapply when it replaces virtualized rows.
   state.observer=new win.MutationObserver(sync);state.observer.observe(host.shadowRoot,{subtree:true,childList:true,attributes:true,attributeFilter:['data-overflow']});viewers.set(host,state);sync();
  }
 }
 const mounts=win.MutationObserver?new win.MutationObserver(syncViewers):null;
 mounts?.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-tab-id']});
 function apply(){root.toggleAttribute(attr,!enabled);syncViewers()}
 function storage(event){if(event.key===key||event.key===null){try{enabled=win.localStorage.getItem(key)!=='false'}catch{}apply()}}
 win.addEventListener('storage',storage);apply();
 return {get enabled(){return enabled},set(value){enabled=!!value;try{win.localStorage.setItem(key,String(enabled))}catch{}apply()},destroy(){mounts?.disconnect();for(const state of viewers.values())restore(state);viewers.clear();win.removeEventListener('storage',storage);if(original===null)root.removeAttribute(attr);else root.setAttribute(attr,original)}};
}
// Native pointer capture can outlive :hover as the pane moves under the cursor.
// Keep native sizing/capture, but prevent pointer overflow from entering full view.
function fadeInstallPanelDragState(doc){
 let active=null;
 function constrain(event){
  if(!active?.bounds||event.pointerId!==active.id||!Number.isFinite(event.clientX))return;
  const {x,size,min,max,scale}=active.bounds;
  const desired=size+(x-event.clientX)/scale,bounded=Math.max(min,Math.min(max,desired));
  if(desired!==bounded)Object.defineProperty(event,'clientX',{configurable:true,value:x+(size-bounded)*scale});
 }
 function clear(event){
  if(event?.pointerId!=null&&active&&event.pointerId!==active.id)return;
  if(event)constrain(event);active?.panel.removeAttribute('data-fade-panel-dragging');active=null;
 }
 function start(event){
  if(event.button!==0)return;
  const grip=event.target?.closest?.('[class~="group/panel-resizer"][class~="left-0"] [role="separator"][aria-orientation="vertical"]');
  const panel=grip?.closest('aside[data-app-shell-focus-area="right-panel"]');
  if(!panel||doc.documentElement?.hasAttribute('data-fade-nav-open'))return;
    clear();active={panel,id:event.pointerId};
  const size=Number(grip.getAttribute?.('aria-valuenow')),min=Number(grip.getAttribute?.('aria-valuemin')),max=Number(grip.getAttribute?.('aria-valuemax'));
  if(size>0&&max>min&&Number.isFinite(event.clientX))active.bounds={x:event.clientX,size,min,max:max-1,scale:(panel.getBoundingClientRect().width||size)/size};
  panel.setAttribute('data-fade-panel-dragging','');
 }
 const target=doc.defaultView||doc;
 target.addEventListener?.('pointermove',constrain,true);
 target.addEventListener?.('pointerdown',start,true);
 target.addEventListener?.('pointerup',clear,true);
 target.addEventListener?.('pointercancel',clear,true);
 target.addEventListener?.('blur',clear);
 return ()=>{clear();target.removeEventListener?.('pointermove',constrain,true);target.removeEventListener?.('pointerdown',start,true);target.removeEventListener?.('pointerup',clear,true);target.removeEventListener?.('pointercancel',clear,true);target.removeEventListener?.('blur',clear)};
}
// Adapt the mounted native viewer; never move React-owned nodes or replace editors.
function fadeFileMetadata(element){
 const key=Object.keys(element).find(k=>k.startsWith('__reactFiber$'));
 let fiber=key?element[key]:null;
 for(let depth=0;fiber&&depth<60;depth++,fiber=fiber.return){
  const p=fiber.memoizedProps;
  const path=p?.path||p?.openFilePathOverride||p?.reviewPath;
  const hostId=p?.hostId||p?.hostConfig?.id;
  if(typeof path==='string'&&typeof hostId==='string'&&path&&path!=='/dev/null'){
   return {path,hostId,cwd:typeof p.cwd==='string'?p.cwd:null,environmentId:p.environmentId??null};
  }
 }
 return null;
}
function fadeAbsoluteFile(meta){
 if(!meta)return null;
 if(/^\/[a-z]:[\\/]/i.test(meta.path))return meta.path.slice(1);
 if(/^(?:[a-z]:[\\/]|\\\\|\/)/i.test(meta.path))return meta.path;
 if(!meta.cwd||! /^(?:[a-z]:[\\/]|\\\\|\/)/i.test(meta.cwd))return null;
 return meta.cwd.replace(/[\\/]$/,'')+(meta.cwd.includes('\\')?'\\':'/')+meta.path;
}
function fadeFileTabMetadata(tabId){
 // These IDs are emitted by the native text editor and review-file tab types.
 const match=/^(?:text-editor|file):([^:]+):(.+)$/.exec(tabId||'');
 if(!match)return null;
 const path=match[2].replace(/^\/([a-z]:[\\/])/i,'$1');
 return {hostId:match[1],path,cwd:null,environmentId:null};
}
function fadePanelFileMetadata(panel,header){
 if(header?.hasAttribute?.('data-browser-sidebar-toolbar'))return null;
 if(header?.matches?.('[class*="group/diff-header"]'))return fadeFileMetadata(header);
 const owner=header?.closest?.('[data-app-shell-tab-panel-controller="right"][data-tab-id]');
 if(owner){const id=owner.getAttribute('data-tab-id');if(id==='diff'||id?.startsWith('browser'))return null;return fadeFileTabMetadata(id)||fadeFileMetadata(header)}
 // A header belongs to its own pane. Never borrow a path from a neighbouring
 // split or from a mounted, inactive file tab when showing a browser/review.
 return header?fadeFileMetadata(header):null;
}
// Panel close is a layout action. Tab close buttons remain owned by native tabs.
function fadePanelCloseControl(panel){
 const doc=panel.ownerDocument;
 const toggles=[...(doc?.querySelectorAll('button[data-app-shell-workspace-layout-toggle="main"]')||[])];
 const toggle=toggles.find(b=>!b.disabled&&b.getAttribute('aria-pressed')==='true'&&!b.closest('[hidden],[aria-hidden="true"],[data-app-shell-active-page="false"]'));
 if(toggle)return toggle;
 return [...panel.querySelectorAll('button')].find(b=>!b.closest('.fade-panel-chrome')&&!b.disabled&&/^(?:Close panel|关闭面板|关闭侧面板)$/i.test(b.getAttribute('aria-label')||''))||null;
}
function fadeCloseFilePanel(panel){const control=fadePanelCloseControl(panel);if(!control)return false;control.click();return true}
function fadeScrollHeaderActions(event,row,header){
 if(event.ctrlKey||header.getAttribute('data-fade-header-layout')!=='stacked'||row.scrollWidth<=row.clientWidth)return;
 const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
 if(!delta)return;
 const unit=event.deltaMode===1?16:event.deltaMode===2?row.clientWidth:1;
 row.scrollLeft+=delta*unit;
 event.preventDefault();event.stopPropagation();
}
// Windows shell.openExternal(fileURL) can fail silently in the native toolbar.
// For an already loaded local HTML page, reuse the native system-default file
// opener (shell.openPath), without changing URL handlers or other file types.
function fadeExternalHtmlPath(value){
 try{
  const url=new URL(value);
  if(url.protocol!=='file:'||url.hostname||url.search||url.hash)return null;
  const path=decodeURIComponent(url.pathname).replace(/^\/([a-z]:\/)/i,'$1');
  if(!/^[a-z]:\//i.test(path)||! /\.html?$/i.test(path)||/[\x00-\x1f\\]/.test(path))return null;
  return path;
 }catch{return null}
}
function fadeExternalHtmlTarget(button){
 let fiber=button[Object.keys(button).find(k=>k.startsWith('__reactFiber$'))];
 if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
 for(let depth=0;fiber&&depth<24;depth++,fiber=fiber.return){
  const props=fiber.memoizedProps;
  if(typeof props?.currentUrl==='string')return props.isAddressEditing===false?fadeExternalHtmlPath(props.currentUrl):null;
 }
 return null;
}
function installExternalHtmlOpen(doc,platform,report){
 let stopped=false;const pending=new WeakSet();
 const click=event=>{
  const button=event.target?.closest?.('[data-browser-sidebar-open-external]');
  if(!button||button.disabled||!button.closest('[data-browser-sidebar-toolbar]'))return;
  const path=fadeExternalHtmlTarget(button);if(!path)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(pending.has(button))return;pending.add(button);
  Promise.resolve().then(platform).then(async api=>{
   if(stopped)return;
   const result=await api.openIn.open({hostId:'local',path,target:'systemDefault'});
   if(result?.success!==true)throw Error('Open failed');
  }).catch(()=>{if(!stopped)report('无法用系统默认应用打开此 HTML 文件，请检查文件是否存在及默认应用设置')}).finally(()=>pending.delete(button));
 };
 doc.addEventListener('click',click,true);
 return ()=>{stopped=true;doc.removeEventListener('click',click,true)};
}
function installFilePanel(doc,report){
 const states=new Map(),panels=new Map(),headers=new Map();let stopped=false,platformPromise,frame=0;
 const win=doc.defaultView;const disposeDragState=fadeInstallPanelDragState(doc);
 const visible=el=>!el.closest('[hidden],[aria-hidden="true"],[data-app-shell-active-page="false"]')&&(!el.getClientRects||el.getClientRects().length>0);
 const icons={copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',folder:'<path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11H3Z"/><path d="M3 10h18"/>',file:'<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v5h5"/>'};
 icons.close='<path d="m6 6 12 12M18 6 6 18"/>';
 icons.tree='<path d="M5 3v14h10M5 7h10M15 4h5v6h-5zM15 14h5v6h-5z"/>';
 const svg=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>';
 function platform(){
  // Follow the loaded asset URL; native builds change both hashes and exports.
  // Accept only an object exposing the two platform capabilities we use.
  if(!platformPromise){
   const url=[...doc.querySelectorAll('link[href]')].map(s=>s.href).find(s=>/\/assets\/app-shared-[\w-]+\.js(?:\?|$)/.test(s));
   if(!url)return Promise.reject(new Error('Native platform module unavailable'));
   platformPromise=import(url).then(m=>{
    const api=Object.values(m).find(v=>v&&typeof v==='object'&&v.openIn?.open&&v.clipboard?.writeText);
    if(!api)throw new Error('Unsupported native platform');return api;
   }).catch(error=>{platformPromise=null;throw error});
  }
  return platformPromise;
 }
 const disposeExternalHtml=installExternalHtmlOpen(doc,platform,report);
 function mark(state,el,name,value=''){
  if(!el)return;
  if(!state.attrs.some(a=>a[0]===el&&a[1]===name))state.attrs.push([el,name,el.getAttribute(name)]);
  if(el.getAttribute(name)!==value)el.setAttribute(name,value);
 }
 function restore(state){
  state.dispose?.();
  state.added?.remove();for(const[el,name,value]of state.attrs){if(value===null)el.removeAttribute(name);else el.setAttribute(name,value)}
 }
 function button(label,icon,fn){const b=doc.createElement('button');b.type='button';b.title=label;b.setAttribute('aria-label',label);b.innerHTML=svg(icon);b.addEventListener('click',e=>{e.stopPropagation();fn(e)});return b}
 function create(header,panel){
  const state={header,panel,attrs:[],added:doc.createElement('div')};
  state.added.className='fade-file-heading';
  const act=async kind=>{
   // Resolve again at click time, including after tab switches and native rerenders.
   const metadata=fadePanelFileMetadata(panel,header),path=fadeAbsoluteFile(metadata);
   if(!header.isConnected||!path){report('当前文件路径不可用');return}
   if(kind==='folder'&&(metadata.hostId!=='local'||metadata.environmentId)){report('此文件不在本机，无法在资源管理器中打开');return}
   try{
    const api=await platform();if(stopped)return;
    if(kind==='copy'){await api.clipboard.writeText(path);report('已复制路径')}
    else {const result=await api.openIn.open({...metadata,path,target:'fileManager'});if(result?.success===false)throw new Error('Reveal failed')}
   }catch{if(!stopped)report(kind==='copy'?'复制路径失败':'无法在资源管理器中打开')}
  };
  state.explorer=button('在资源管理器中打开','folder',()=>act('folder'));
  state.copy=button('复制路径','copy',()=>act('copy'));
  state.explorer.className='fade-file-explorer';state.copy.className='fade-file-copy';
  state.added.append(state.copy,state.explorer);header.append(state.added);
  mark(state,header,'data-fade-file-header');
  return state;
 }
 function layoutHeader(state){
  const {header,leading,trailing}=state;
  if(!header.clientWidth)return;
  // Measure the children, not the stretched second row. Using the row width
  // would make a stacked toolbar stay stacked forever after widening.
  const boxes=el=>[...(el?.children||[])].flatMap(e=>win?.getComputedStyle(e).display==='contents'?boxes(e):[e]);
  const actionItems=boxes(trailing).map(e=>({element:e,width:e.getBoundingClientRect().width})).filter(item=>item.width>0);
  const actions=actionItems.reduce((total,{element:e,width})=>{const s=win?.getComputedStyle(e);return total+Math.max(e.scrollWidth,width)+(parseFloat(s?.marginInlineStart)||0)+(parseFloat(s?.marginInlineEnd)||0)},0)+Math.max(0,actionItems.length-1)*(parseFloat(win?.getComputedStyle(trailing).columnGap)||0);
  const middle=(state.middle?.getBoundingClientRect().width||0)+(state.auxiliary?.getBoundingClientRect().width||0);
  const close=header.hasAttribute('data-fade-close-host')?40:0;
  // Reserve useful title space; native trailing actions remain an intact group.
  const minimum=state.kind==='review'?150:180;
  const needed=state.kind==='browser'?160+(leading.scrollWidth||90)+actions+close+32:minimum+actions+middle+close+32;
  mark(state,header,'data-fade-header-layout',header.clientWidth<needed?'stacked':'inline');
 }
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{const targets=new Set(entries.map(entry=>entry.target));for(const state of headers.values())if(targets.has(state.header)||targets.has(state.trailing))layoutHeader(state)}):null;
 function adaptHeader(header){
  let state=headers.get(header);
  const nativeChildren=el=>[...el.children].filter(e=>!e.classList?.contains('fade-file-heading')&&!e.classList?.contains('fade-panel-chrome')&&!e.classList?.contains('fade-preview-freshness'));
  let children=nativeChildren(header);
  const flow=children.length===1&&children[0].tagName==='DIV'?children[0]:null;
  if(flow)children=nativeChildren(flow);
  // Reconciliation may change only a middle slot or wrapper. Release stale
  // geometry before falling back for an unsupported native structure.
  if(state&&(state.flow!==flow||state.children.length!==children.length||children.some((child,index)=>child!==state.children[index]))){resize?.unobserve(header);resize?.unobserve(state.trailing);restore(state);headers.delete(header);state=null}
  if(children.length<2||children.length>4)return null; // Unknown layouts retain native geometry.
  if(!state){
   const owner=header.closest('[data-app-shell-tab-panel-controller="right"]');
   const id=owner?.getAttribute('data-tab-id')||'';
   state={header,flow,children,leading:children[0],trailing:children.at(-1),middle:children.length>=3?children.at(-2):null,auxiliary:children.length===4?children[1]:null,kind:header.hasAttribute('data-browser-sidebar-toolbar')?'browser':id==='diff'?'review':'file',attrs:[]};headers.set(header,state);
   mark(state,header,'data-fade-viewer-header',state.kind);mark(state,state.leading,'data-fade-header-leading');mark(state,state.trailing,'data-fade-header-trailing');
   if(flow)mark(state,flow,'data-fade-header-flow');
   if(state.middle){mark(state,state.middle,'data-fade-header-middle');mark(state,header,'data-fade-header-three')}
   if(state.auxiliary){mark(state,state.auxiliary,'data-fade-header-auxiliary');mark(state,header,'data-fade-header-four')}
   if(state.kind!=='browser'){
    const row=state.trailing;
    const wheel=e=>fadeScrollHeaderActions(e,row,header);
    row.addEventListener('wheel',wheel,{passive:false});
    state.dispose=()=>row.removeEventListener('wheel',wheel);
   }
   resize?.observe(header);resize?.observe(state.trailing);
  }
  return state;
 }
 function sync(){
  if(stopped)return;
  // Full right-pane layout has no resizer and is not yet supported by the card.
  // Recover persisted state and alternative native entries through its own toggle.
  const windowMode=doc.documentElement?.hasAttribute('data-fade-window-mode');
  const full=!windowMode&&[...doc.querySelectorAll('button[data-app-shell-workspace-layout-toggle="right-panel"][aria-pressed="true"]')].find(el=>!el.closest('[hidden],[data-app-shell-active-page="false"]')&&visible(el.parentElement||el));
  if(full&&!full.disabled){full.click();return}
  const active=new Set(),activePanels=new Set();
  for(const panel of doc.querySelectorAll('aside[data-app-shell-focus-area="right-panel"],aside[data-fade-unified-preview]')){
   const unified=panel.hasAttribute('data-fade-unified-preview');
   // Window-mode source panels are invisible. Adapt only the portaled viewer,
   // whose close/tab controls already live in the unified preview's tab row.
   if(windowMode&&!unified)continue;
   activePanels.add(panel);
   let shell=panels.get(panel);
   if(!shell&&unified){shell={attrs:[]};mark(shell,panel,'data-fade-file-panel');panels.set(panel,shell)}
   if(!shell){
    const chrome=doc.createElement('div');chrome.className='fade-panel-chrome';
    const close=button('关闭预览面板','close',()=>{if(!fadeCloseFilePanel(panel))report('当前布局没有可用的原生关闭入口')});
    const title=doc.createElement('span');title.className='fade-panel-fallback-title';title.textContent='预览';chrome.append(title,close);panel.prepend(chrome);
    shell={added:chrome,attrs:[],close,title,host:null};mark(shell,panel,'data-fade-file-panel');panels.set(panel,shell);
   }
   // React can replace the pane's children without replacing the aside itself.
   if(!unified)for(const child of panel.children){
    if(child===shell.added)continue;
    const position=doc.defaultView?.getComputedStyle(child).position;
    if(position==='absolute')mark(shell,child,'data-fade-panel-absolute');
   }
   if(!unified)shell.close.disabled=!fadePanelCloseControl(panel);
   // Hide only the native informational read-only banner, using its message ID
   // rather than localized text. Keep actual errors and editor restrictions.
   for(const banner of panel.querySelectorAll('div.shrink-0.px-4.pt-3')){
    const content=banner.firstElementChild;
    if(!content)continue;
    const props=content[Object.keys(content).find(key=>key.startsWith('__reactProps$'))];
    if(props?.children?.props?.id==='textFileEditor.largeFileReadOnly')mark(shell,banner,'data-fade-readonly-notice');
    else if(banner.hasAttribute('data-fade-readonly-notice'))banner.removeAttribute('data-fade-readonly-notice');
   }
   const viewers=[...panel.querySelectorAll('[data-testid="viewer-header"],[data-browser-sidebar-toolbar]')].filter(visible);
   for(const header of viewers)adaptHeader(header);
   // Use the native tab strip when present; otherwise share the first header.
   // Only our own close node moves. React-owned controls are never reparented.
   if(!unified){
   const tabRow=[...panel.querySelectorAll('[data-app-shell-tab-row]')].find(visible);
   const host=tabRow||viewers.filter(h=>headers.has(h)).sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top||b.getBoundingClientRect().right-a.getBoundingClientRect().right)[0]||null;
   if(shell.host!==host){if(shell.host)shell.host.removeAttribute('data-fade-close-host');shell.host=host}
   mark(shell,panel,'data-fade-panel-header',host?'integrated':'fallback');
   if(host){mark(shell,host,'data-fade-close-host');if(shell.added.parentElement!==host)host.append(shell.added)}
   else if(shell.added.parentElement!==panel)panel.prepend(shell.added);
   }
   for(const header of [...viewers,...panel.querySelectorAll('[class~="group/diff-header"]')]){
    if(!visible(header))continue;
    const meta=fadePanelFileMetadata(panel,header);if(!meta)continue;
    active.add(header);let state=states.get(header);
    if(!state){state=create(header,panel);states.set(header,state)}
    const trailing=headers.get(header)?.trailing||header;
    if(state.added.parentElement!==trailing)trailing.append(state.added);
    const path=fadeAbsoluteFile(meta);
    state.copy.disabled=!path;state.explorer.disabled=!path||meta.hostId!=='local'||!!meta.environmentId;
   }
  }
  for(const[h,state]of states)if(!active.has(h)){restore(state);states.delete(h)}
  for(const[h,state]of headers){if(!h.isConnected||!visible(h)||!activePanels.has(h.closest('aside'))){resize?.unobserve(h);resize?.unobserve(state.trailing);restore(state);headers.delete(h)}else layoutHeader(state)}
  for(const[panel,state]of panels)if(!activePanels.has(panel)){restore(state);panels.delete(panel)}
 }
 const observer=new MutationObserver(records=>{
  if(records.every(r=>r.target.closest?.('.fade-file-heading,.fade-panel-chrome')))return;
  if(!win?.requestAnimationFrame){sync();return}
  if(!frame)frame=win.requestAnimationFrame(()=>{frame=0;sync()});
 });
 observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','data-review-path','aria-hidden','hidden','data-tab-id','aria-pressed']});
 win?.addEventListener?.('fade-window-mode',sync);sync();
 return ()=>{stopped=true;disposeExternalHtml();win?.removeEventListener?.('fade-window-mode',sync);disposeDragState();observer.disconnect();resize?.disconnect();if(frame)win?.cancelAnimationFrame(frame);for(const state of states.values())restore(state);states.clear();for(const state of headers.values())restore(state);headers.clear();for(const state of panels.values())restore(state);panels.clear()};
}
