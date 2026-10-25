function installFadeWindowMode(){
 let resetStartup=false;try{resetStartup=!window.__fadeWindowModeBooted&&localStorage.getItem('fade-window-mode')==='true'}catch{}window.__fadeWindowModeBooted=true;
 const layout=createFadeWindowLayout(),homes=new Map(),api={codex:disposeCodexTabs,gpt:disposeGptTabs};
 const row=document.createElement('div'),menu=document.createElement('div'),button=document.createElement('button'),pageStyle=document.createElement('style');
 row.className='fade-window-row';menu.className='fade-window-menu';menu.hidden=true;menu.setAttribute('role','menu');
 button.className='fade-window-add';button.type='button';button.textContent='＋';button.title='新建窗口';button.setAttribute('aria-label','新建窗口');button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');
 $('.compact-head').append(button);shadow.append(row,menu);document.head.append(pageStyle);
 const previewDirectory=document.createElement('div');previewDirectory.className='fade-preview-directory';previewDirectory.hidden=true;previewDirectory.setAttribute('role','menu');previewDirectory.setAttribute('aria-label','已打开的预览');shadow.append(previewDirectory);
 const paneNodes=new Map(),tabNodes=new Map(),recentPanes=new Map();let resizing=false,resizeCleanup=null,lastStructure='',lastGeometry='',geometryRules=[];
 let pendingProject=null;let interval=0,enabled=false,focus=null,dead=false,signature='',drag=null,pendingPane=null,lastRoute='';
 let previewWasOpen=false;const previewPane={id:'preview',weight:1},preview=installWindowPreview({changed:()=>{const open=preview.tabs.length>0;if(open&&!previewWasOpen)previewPane.weight=layout.panes.reduce((n,p)=>n+p.weight,0)/2||1;previewWasOpen=open;if(!dead&&enabled)render()}});
 const columns=()=>enabled&&preview.tabs.length?[...layout.panes,previewPane]:layout.panes;
 const entries=()=>[...api.codex.tabs().map(tab=>({key:tab.windowKey??tab.path,type:'codex',tab})),...api.gpt.tabs().map(tab=>({key:tab.id,type:'gpt',tab})),...homes.values()];
 const entry=key=>entries().find(e=>e.key===key);
 const pageKey=e=>e.home?e.key:e.type==='codex'?e.tab.location?.state?.fadePaneHome||e.tab.nativePath||e.tab.path:e.tab.location?.state?.fadeDraftKey||e.tab.location?.pathname||e.tab.id;
 function navigateHome(e){const r=fadeNativeRouter(document);r?.navigator.push({pathname:'/',search:''},{sidebarProductMode:'codex',fadePaneHome:e.key,homeDraftKey:e.key})}
 function remember(pane){if(!pane)return;focus=pane;recentPanes.set(pane.type,pane)}
 function destination(type){const recent=recentPanes.get(type);return layout.panes.includes(recent)?recent:layout.panes.find(p=>p.type===type)}
 function prepare(type,key){if(!enabled)return true;sync();const existing=key==null?null:entries().find(e=>e.type===type&&(e.key===key||e.tab.path===key||e.tab.id===key||e.tab.conversationId===key||e.tab.location?.pathname==='/c/'+key));const owner=existing&&layout.owner(existing.key);let p=destination(type);const current=p&&entry(p.active),home=current&&(current.tab.location?.pathname==='/'||type==='gpt'&&!current.tab.location&&current.tab.conversationId?.startsWith('local-chatgpt:'))?current:null;if(owner){activate(owner,existing.key);if(home&&home.key!==existing.key&&existing.tab.location?.pathname!=='/'){api[type].close(type==='gpt'?home.tab.id:home.tab);layout.forget(home.key);sync()}return false}if(!p){if(layout.panes.length>=4){announce('聊天窗口数量已满');return false}p=layout.add(type)}if(key!=null&&home)api[type].replaceHome?.(home.tab);remember(p);pendingPane=p;return true}
 function newChat(type=focus?.type||'codex'){if(!enabled)return false;if(prepare(type))blank(pendingPane);return true}
 function newProjectChat(projectId){if(!enabled)return false;if(!prepare('codex'))return true;pendingProject={key:fadeNativeRouter(document)?.location?.key,pane:pendingPane};if(!adapter.newChat(projectId)){pendingProject=null;announce('未找到项目的新聊天入口')}sync();return true}
 function activate(pane,key){const e=entry(key);if(!e)return;remember(pane);pane.active=key;if(e.home)navigateHome(e);else api[e.type].activate(e.tab);render()}
 function blank(pane){remember(pane);pendingPane=pane;if(pane.type==='gpt'){api.gpt.newChat(true);sync();return}const key='fade-home-'+crypto.randomUUID();api.codex.addHome(key);sync();layout.place(key,pane);activate(pane,key)}
 function add(type){if(!enabled)return;if(layout.panes.length>=4){announce('聊天窗口数量已满');return}try{const pane=layout.add(type);blank(pane);render()}catch(error){announce(error.message)}closeMenu()}
 function closeTab(pane,key){const e=entry(key);if(!e)return;layout.forget(key);if(e.home)homes.delete(key);else api[e.type].close(e.type==='gpt'?e.tab.id:e.tab);if(!pane.tabs.length){layout.remove(pane);if(focus===pane)focus=layout.panes[0]??null}if(!layout.panes.length){const p=layout.add('codex');blank(p)}else if(focus?.active)activate(focus,focus.active);signature='';sync()}
 function closePane(pane){for(const key of [...pane.tabs]){const e=entry(key);layout.forget(key);if(e?.home)homes.delete(key);else if(e)api[e.type].close(e.type==='gpt'?e.tab.id:e.tab)}layout.remove(pane);focus=layout.panes[0]??layout.add('codex');if(focus.active)activate(focus,focus.active);else blank(focus);signature='';sync()}
 function publish(byKey=new Map(entries().map(e=>[e.key,e]))){
  const panes=enabled?layout.panes:[],cols=columns();
  const pages=panes.map(p=>({pane:p,tabs:p.tabs.flatMap(key=>{const e=byKey.get(key);return e?[{id:pageKey(e),active:key===p.active}]:[]})}));
  const structure=JSON.stringify([enabled,pages.map(({pane,tabs})=>[pane.id,tabs])]);
  const geometry=JSON.stringify([enabled,window.innerWidth,cols.map(p=>[p.id,p.weight])]);
  if(structure===lastStructure&&geometry===lastGeometry)return;
  if(structure!==lastStructure){
   const slots={},rules=[],indices=[];
   for(const {pane,tabs} of pages)for(const {id,active} of tabs){
    slots[id]=active?pane.id:'hidden';const selector=`[data-fade-page-key=${JSON.stringify(id)}]`;
    if(active){indices.push({pane,index:rules.length});rules.push(`${selector}{display:flex!important;position:fixed!important;top:85px!important;height:calc(100dvh - 85px)!important;min-width:0!important;flex-direction:column;overflow:hidden;z-index:2;background:var(--fc-bg,var(--color-surface))}`,`${selector}>div{min-width:0;max-width:100%}`)}else rules.push(`${selector}{display:none!important}`);
   }
   pageStyle.textContent=rules.join('\n');geometryRules=indices.map(({pane,index})=>({pane,style:pageStyle.sheet.cssRules[index].style}));
   if((enabled||window.__fadePaneSlots)&&JSON.stringify(window.__fadePaneSlots)!==JSON.stringify(slots)){window.__fadePaneSlots=slots;window.__fadePaneRevision=(window.__fadePaneRevision||0)+1;window.dispatchEvent(new Event('fade-pane-layout'))}
   lastStructure=structure;
  }
  const total=cols.reduce((n,p)=>n+p.weight,0)||1,available=window.innerWidth-Math.max(0,cols.length-1)*5;let left=0;
  for(const p of panes){const width=p.weight/total*available;for(const rule of geometryRules)if(rule.pane===p){if(rule.style.left!==left+'px')rule.style.setProperty('left',left+'px','important');if(rule.style.width!==width+'px')rule.style.setProperty('width',width+'px','important')}left+=width+5}
  preview.layout(enabled,left,previewPane.weight/total*available);lastGeometry=geometry;
 }
 function sync(){if(dead||!enabled)return;if(resetStartup&&api.gpt.ready){resetStartup=false;for(const e of entries())api[e.type].close(e.type==='gpt'?e.tab.id:e.tab);layout.panes.splice(0);focus=layout.add('codex');blank(focus);return}const projectLocation=fadeNativeRouter(document)?.location;if(pendingProject&&projectLocation?.pathname==='/'&&projectLocation.key!==pendingProject.key){const p=pendingProject.pane;pendingProject=null;const key='fade-home-'+crypto.randomUUID();api.codex.addHome(key,projectLocation.state);sync();layout.place(key,p);activate(p,key);return}const all=entries(),keys=new Set(all.map(e=>e.key));
  for(const p of [...layout.panes])for(const key of [...p.tabs])if(!keys.has(key))layout.forget(key);
  for(const e of all)if(!layout.owner(e.key)){let p=pendingPane?.type===e.type?pendingPane:destination(e.type);if(!p){if(layout.panes.length>=4){announce('聊天窗口数量已满');continue}p=layout.add(e.type)}layout.place(e.key,p);pendingPane=null}
  const loc=fadeNativeRouter(document)?.location,route=loc?JSON.stringify([loc.pathname,loc.key]):'';
  if(route&&route!==lastRoute){lastRoute=route;const current=all.find(e=>pageKey(e)===(loc.state?.fadeDraftKey||loc.state?.fadePaneHome||loc.pathname));if(current){const p=layout.owner(current.key);if(p){p.active=current.key;remember(p)}}}
  for(const p of [...layout.panes])if(!p.tabs.length&&p!==pendingPane&&layout.panes.length>1)layout.remove(p);
  render();
 }
 function makeButton(text,label,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.title=label;b.setAttribute('aria-label',label);b.onclick=fn;return b}
 function updateChrome(byKey){
  const previewNode=paneNodes.get('preview');if(previewNode&&previewNode.style.flexGrow!==String(previewPane.weight))previewNode.style.flexGrow=String(previewPane.weight);
  const total=columns().reduce((n,p)=>n+p.weight,0);for(const [i,separator] of [...row.querySelectorAll('[role=separator]')].entries()){const value=String(Math.round(columns()[i].weight/total*100));if(separator.getAttribute('aria-valuenow')!==value)separator.setAttribute('aria-valuenow',value)}
  for(const p of layout.panes){const node=paneNodes.get(p.id);if(!node)continue;if(node.hasAttribute('data-focused')!==(p===focus))node.toggleAttribute('data-focused',p===focus);if(node.style.flexGrow!==String(p.weight))node.style.flexGrow=String(p.weight);
   for(const key of p.tabs){const e=byKey.get(key),ui=tabNodes.get(key);if(!e||!ui)continue;const title=e.tab.title||'新聊天';if(ui.label.textContent!==title){ui.label.textContent=title;ui.select.title=title;ui.select.setAttribute('aria-label',title)}const selected=String(p.active===key);if(ui.select.getAttribute('aria-selected')!==selected)ui.select.setAttribute('aria-selected',selected);
    const status=e.tab.status==='completed'&&e.tab.completionSeen?null:e.tab.status;if(ui.status!==status){ui.status=status;ui.select.querySelector('.fade-tab-status')?.remove();appendCodexTabStatus(document,ui.select,status)}
   }
  }
 }
 function render(){if(resizing)return;const byKey=new Map(entries().map(e=>[e.key,e]));publish(byKey);const key=JSON.stringify([enabled,layout.panes.map(p=>[p.id,p.type,p.tabs]),preview.tabs.map(t=>[t.id,t.title]),preview.active]);if(key===signature){updateChrome(byKey);return}signature=key;row.replaceChildren();paneNodes.clear();tabNodes.clear();button.hidden=!enabled;row.hidden=!enabled;if(!enabled)return;
  layout.panes.forEach((p,index)=>{
   const pane=document.createElement('section');pane.className='fade-window-pane';pane.dataset.pane=p.id;pane.style.flexGrow=String(p.weight);paneNodes.set(p.id,pane);pane.toggleAttribute('data-focused',p===focus);
   const directory=makeButton(p.type==='codex'?'Codex':'GPT','打开聊天目录',()=>{remember(p);chatPicker.openFor(p.type,directory)});directory.className='fade-directory fade-window-directory';pane.append(directory);
   const tabs=document.createElement('div');tabs.className='fade-tabs-scroll fade-window-tabs';const list=document.createElement('div');list.className='fade-gpt-tabs';list.setAttribute('role','tablist');list.setAttribute('aria-label',p.type+' 聊天标签');tabs.append(list);pane.append(tabs);
   for(const id of p.tabs){const e=byKey.get(id);if(!e)continue;const item=document.createElement('div');item.className='fade-gpt-tab';item.draggable=true;
    const select=makeButton('',e.tab.title||'新聊天',()=>activate(p,id));select.className='fade-gpt-select'+(p.type==='codex'?' fade-codex-select':'');select.setAttribute('role','tab');const label=document.createElement('span');label.className='fade-tab-title';select.append(label);const close=makeButton('×','关闭标签',()=>closeTab(p,id));close.className='fade-gpt-close';item.append(select,close);tabNodes.set(id,{label,select});
    item.ondragstart=event=>{drag={key:id,type:p.type,token:crypto.randomUUID()};event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('application/x-fade-tab',JSON.stringify({token:drag.token,type:p.type}));event.dataTransfer.setData('text/plain',e.tab.title||'新聊天')};
    item.ondragend=()=>{drag=null};
    item.ondragover=event=>{if(drag?.type===p.type){event.preventDefault();event.dataTransfer.dropEffect='move'}};
    item.ondrop=event=>drop(event,p,id);list.append(item);
   }
   const addTab=makeButton('+','新建聊天',()=>blank(p));addTab.className='fade-gpt-add';tabs.append(addTab);const closePaneButton=makeButton('×','关闭分栏中的所有标签页',()=>closePane(p));closePaneButton.className='fade-gpt-close fade-window-close-pane';pane.append(closePaneButton);
   pane.ondragover=event=>{if(event.dataTransfer.types.includes('application/x-fade-tab')&&drag?.type===p.type){event.preventDefault();event.dataTransfer.dropEffect='move'}};pane.ondrop=event=>drop(event,p);
   row.append(pane);
   if(index<columns().length-1){const separator=document.createElement('div');separator.className='fade-window-divider';separator.tabIndex=0;separator.setAttribute('role','separator');separator.setAttribute('aria-orientation','vertical');separator.setAttribute('aria-label','调整分栏宽度');separator.setAttribute('aria-valuenow',String(Math.round(p.weight/layout.panes.reduce((n,q)=>n+q.weight,0)*100)));separator.onpointerdown=event=>resize(event,p,columns()[index+1],separator);separator.onkeydown=event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const q=columns()[index+1],delta=event.key==='ArrowLeft'?-.08:.08;if(p.weight+delta>.2&&q.weight-delta>.2){p.weight+=delta;q.weight-=delta;render()}};row.append(separator)}
  });
  renderPreview();updateChrome(byKey);if(!previewDirectory.hidden)renderPreviewDirectory();
 }
 function closePreviewDirectory(restoreFocus=false){previewDirectory.hidden=true;const trigger=paneNodes.get('preview')?.querySelector('.fade-window-directory');trigger?.setAttribute('aria-expanded','false');if(restoreFocus)trigger?.focus()}
 function renderPreviewDirectory(){
  const trigger=paneNodes.get('preview')?.querySelector('.fade-window-directory');
  if(!enabled||!trigger||!preview.tabs.length){closePreviewDirectory();return}
  const focused=shadow.activeElement?.dataset.previewId,scroll=previewDirectory.scrollTop;
  previewDirectory.replaceChildren();trigger.setAttribute('aria-expanded','true');
  const heading=document.createElement('div');heading.className='fade-preview-directory-heading';heading.textContent='已打开的预览 · '+preview.tabs.length;heading.setAttribute('role','presentation');previewDirectory.append(heading);
  for(const tab of preview.tabs){
   const item=makeButton(tab.title,tab.title,()=>{closePreviewDirectory();preview.select(tab.id);paneNodes.get('preview')?.querySelector('.fade-window-directory')?.focus()});
   item.dataset.previewId=tab.id;item.setAttribute('role','menuitemradio');item.setAttribute('aria-checked',String(tab.id===preview.active));item.tabIndex=tab.id===preview.active?0:-1;previewDirectory.append(item);
  }
  const rect=trigger.getBoundingClientRect(),width=Math.min(360,window.innerWidth-16);previewDirectory.style.width=width+'px';previewDirectory.style.left=Math.max(8,Math.min(rect.left,window.innerWidth-width-8))+'px';previewDirectory.style.top=(rect.bottom+6)+'px';previewDirectory.style.maxHeight=Math.min(420,Math.max(80,window.innerHeight-rect.bottom-14))+'px';
  previewDirectory.scrollTop=scroll;
  if(focused)[...previewDirectory.querySelectorAll('button')].find(b=>b.dataset.previewId===focused)?.focus({preventScroll:true});
 }
 function togglePreviewDirectory(){
  if(!previewDirectory.hidden){closePreviewDirectory();return}
  previewDirectory.hidden=false;renderPreviewDirectory();const active=previewDirectory.querySelector('[aria-checked="true"]')||previewDirectory.querySelector('button');active?.focus({preventScroll:true});active?.scrollIntoView({block:'nearest'});
 }
 function renderPreview(){if(!preview.tabs.length)return;const pane=document.createElement('section');pane.className='fade-window-pane fade-preview-pane';pane.style.flexGrow=String(previewPane.weight);paneNodes.set('preview',pane);const label=makeButton('预览','打开预览目录',togglePreviewDirectory);label.className='fade-directory fade-window-directory';label.setAttribute('aria-haspopup','menu');label.setAttribute('aria-expanded',String(!previewDirectory.hidden));pane.append(label);const tabs=document.createElement('div');tabs.className='fade-tabs-scroll fade-window-tabs';const list=document.createElement('div');list.className='fade-gpt-tabs';list.setAttribute('role','tablist');tabs.append(list);for(const tab of preview.tabs){const item=document.createElement('div');item.className='fade-gpt-tab';item.dataset.fadePreviewPanel=tab.id;tab.mount.dataset.fadePreviewPanel=tab.id;const select=makeButton('',tab.title,()=>preview.select(tab.id));const title=document.createElement('span');title.className='fade-tab-title';title.textContent=tab.title;select.append(title);select.className='fade-gpt-select';select.setAttribute('role','tab');select.setAttribute('aria-selected',String(preview.active===tab.id));const close=makeButton('×','关闭预览',()=>preview.close(tab.id));close.className='fade-gpt-close';item.append(select,close);list.append(item)}pane.append(tabs);const close=makeButton('×','关闭所有预览',()=>preview.closeAll());close.className='fade-gpt-close fade-window-close-pane';pane.append(close);row.append(pane)}
 function drop(event,p,before){event.preventDefault();event.stopPropagation();let data;try{data=JSON.parse(event.dataTransfer.getData('application/x-fade-tab'))}catch{return}if(!drag||data?.token!==drag.token)return;if(drag.type!==p.type){announce('只能移动到同类型窗口');return}const key=drag.key;drag=null;const from=layout.place(key,p,before?p.tabs.indexOf(before):p.tabs.length);if(from!==p&&!from.tabs.length)layout.remove(from);activate(p,key);signature='';sync()}
 function resize(event,p,q,separator){
  if(event.button!==0)return;event.preventDefault();resizeCleanup?.();resizing=true;separator.setPointerCapture(event.pointerId);
  const x=event.clientX,a=p.weight,b=q.weight,total=columns().reduce((n,v)=>n+v.weight,0),width=innerWidth-Math.max(0,columns().length-1)*5,min=Math.min((a+b)/2,Math.min(240,width/columns().length)/width*total);
  let frame=0,lastX=x,finished=false;const byKey=new Map(entries().map(e=>[e.key,e]));
  const paint=()=>{frame=0;const d=(lastX-x)/width*total;p.weight=Math.max(min,Math.min(a+b-min,a+d));q.weight=a+b-p.weight;publish(byKey);for(const pane of [p,q]){const node=paneNodes.get(pane.id);if(node)node.style.flexGrow=String(pane.weight)}};
  const move=e=>{lastX=e.clientX;if(!frame)frame=globalThis.requestAnimationFrame(paint)};
  const finish=()=>{if(finished)return;finished=true;if(frame){globalThis.cancelAnimationFrame(frame);frame=0;if(!dead)paint()}separator.removeEventListener('pointermove',move);for(const name of ['pointerup','pointercancel','lostpointercapture'])separator.removeEventListener(name,finish);if(separator.hasPointerCapture(event.pointerId))separator.releasePointerCapture(event.pointerId);resizing=false;resizeCleanup=null;if(!dead)render()};
  resizeCleanup=finish;separator.addEventListener('pointermove',move);for(const name of ['pointerup','pointercancel','lostpointercapture'])separator.addEventListener(name,finish);
 }
 function closeMenu(){menu.hidden=true;button.setAttribute('aria-expanded','false')}
 for(const [type,label]of [['codex','新建 Codex 窗口'],['gpt','新建 GPT 窗口']])menu.append(makeButton(label,label,()=>add(type)));
 const openMenu=()=>{if(!enabled)return;for(const item of menu.children){item.disabled=layout.panes.length>=4;item.setAttribute('role','menuitem')}menu.hidden=false;button.setAttribute('aria-expanded','true');const r=button.getBoundingClientRect();menu.style.left=r.left+'px'};on(button,'click',openMenu);on(button,'pointerenter',openMenu);on(menu,'pointerleave',closeMenu);
 on(document,'pointerdown',event=>{if(!event.composedPath().includes(menu)&&!event.composedPath().includes(button))closeMenu()});on(window,'keydown',event=>{if(event.key==='Escape'){drag=null;closeMenu()}});
 on(document,'pointerdown',event=>{const path=event.composedPath();if(!path.includes(previewDirectory)&&!path.includes(paneNodes.get('preview')?.querySelector('.fade-window-directory')))closePreviewDirectory()});
 on(window,'resize',()=>{if(!previewDirectory.hidden)renderPreviewDirectory()});
 on(previewDirectory,'keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closePreviewDirectory(true);return}
  if(event.key==='Tab'){closePreviewDirectory();return}
  if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
  event.preventDefault();const items=[...previewDirectory.querySelectorAll('button')],index=items.indexOf(shadow.activeElement),next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
  items.forEach((item,i)=>item.tabIndex=i===next?0:-1);items[next]?.focus();
 });
 function enterPane(event){const el=event.target.closest?.('[data-fade-page-key]');if(!enabled||!el)return;const e=entries().find(e=>pageKey(e)===el.dataset.fadePageKey),p=e&&layout.owner(e.key);if(p&&p!==focus)activate(p,e.key)}
 // focusin alone cannot distinguish user focus from native editor autofocus.
 // Pointer entry is explicit; keyboard entry is allowed only during native Tab
 // traversal in this event turn, never by a later resize/effect callback.
 let keyboardPaneEntry=false,keyboardEntryTimer=0;
 const clearKeyboardEntry=()=>{keyboardPaneEntry=false;globalThis.clearTimeout(keyboardEntryTimer);keyboardEntryTimer=0};
 on(document,'keydown',event=>{clearKeyboardEntry();if(enabled&&event.isTrusted&&event.key==='Tab'&&!event.altKey&&!event.ctrlKey&&!event.metaKey){keyboardPaneEntry=true;keyboardEntryTimer=globalThis.setTimeout(clearKeyboardEntry,0)}},{capture:true});
 on(document,'pointerdown',event=>{clearKeyboardEntry();enterPane(event)},{capture:true});
 on(document,'focusin',event=>{if(keyboardPaneEntry){clearKeyboardEntry();enterPane(event)}},{capture:true});
 function set(value,persist=true){clearKeyboardEntry();drag=null;resizeCleanup?.();if(value&&(!window.__fadePaneHostSupported||!(window.__fadePaneHostVersion>=2)||!(window.__fadePaneFocusVersion>=1)||!(window.__fadePaneHomeVersion>=1)||!window.__fadePreviewHostSupported||!(window.__fadePreviewHostVersion>=3)||typeof window.__fadeNativeScopeSnapshot!=='function')){announce('窗口模式需要更新运行时，请完整退出后重新启动 FCodex');return false}enabled=!!value;if(enabled&&preview.tabs.length)previewPane.weight=layout.panes.reduce((n,p)=>n+p.weight,0)/2||1;if(enabled&&!interval)interval=globalThis.setInterval(sync,180);if(!enabled&&interval){globalThis.clearInterval(interval);interval=0}host.toggleAttribute('data-window-mode',enabled);root.toggleAttribute('data-fade-window-mode',enabled);if(persist)try{localStorage.setItem('fade-window-mode',''+enabled)}catch{}
  if(enabled&&!layout.panes.length){focus=layout.add('codex');sync();if(!focus.tabs.length)blank(focus)}
  if(!enabled){pendingProject=null;closeMenu();closePreviewDirectory();for(const p of layout.panes)for(const key of p.tabs){const e=entry(key);if(e?.home)homes.delete(key)}layout.panes.splice(0);focus=null}
  window.__fadeWindowModeEnabled=enabled;window.dispatchEvent(new Event('fade-window-mode'));if(!enabled)preview.reset();signature='';render();return true;
 }
 on(window,'resize',()=>{publish();closeMenu()});on(window,'storage',event=>{if(event.key==='fade-window-mode')set(event.newValue==='true',false)});
 try{if(localStorage.getItem('fade-window-mode')==='true')set(true,false)}catch{}render();
 return {get enabled(){return enabled},prepare,newChat,newProjectChat,set,destroy(){clearKeyboardEntry();dead=true;drag=null;resizeCleanup?.();globalThis.clearInterval(interval);enabled=false;window.__fadeWindowModeEnabled=false;window.dispatchEvent(new Event('fade-window-mode'));publish();host.removeAttribute('data-window-mode');root.removeAttribute('data-fade-window-mode');preview.destroy();previewDirectory.remove();row.remove();menu.remove();button.remove();pageStyle.remove()}};
}
