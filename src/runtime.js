(function startFade(styleText=document.getElementById('fade-codex-style')?.textContent||'') {
 if(window.__fadeCodex)return;
 // Keep a fresh initializer, not the disposed runtime's listeners and state.
 window.__fadeResume=startFade.bind(null,styleText);
 if(!document.getElementById('fade-codex-style')){const style=document.createElement('style');style.id='fade-codex-style';style.textContent=styleText;document.head.append(style)}
 window.__fadeClassicChrome?.destroy();
 const root=document.documentElement,abort=new AbortController(),signal=abort.signal;
 const originalAttrs=['data-fade-codex','data-fade-polarity','data-fade-shell','data-fade-native-tools','data-fade-account-access','data-fade-rail-open','data-fade-menu-open','data-fade-settings'].map(n=>[n,root.getAttribute(n)]);
 const host=document.createElement('div');host.id='fade-codex-layer';document.body.append(host);
 const shadow=host.attachShadow({mode:'open'});shadow.innerHTML=__MARKUP__;
 const $=q=>shadow.querySelector(q),$$=q=>[...shadow.querySelectorAll(q)];
 const on=(el,event,fn,options={})=>el.addEventListener(event,fn,{...options,signal});
 let disposed=false;const timeouts=new Set(),frames=new Set();
 const setTimeout=(fn,ms)=>{const id=window.setTimeout(()=>{timeouts.delete(id);if(!disposed)fn()},ms);timeouts.add(id);return id};
 const clearTimeout=id=>{window.clearTimeout(id);timeouts.delete(id)};
 const requestAnimationFrame=fn=>{const id=window.requestAnimationFrame(t=>{frames.delete(id);if(!disposed)fn(t)});frames.add(id);return id};
 const cancelAnimationFrame=id=>{window.cancelAnimationFrame(id);frames.delete(id)};
 const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)');
 __NATIVE_THEME__
 const nativeTheme=createNativeThemeSync(window,()=>announce('窗口按钮主题同步失败，请重启 Codex 后重试'));
 __HEADER__
 const disposeHeader=installCompactHeader();
 let config={light:root.dataset.theme==='light'};try{Object.assign(config,JSON.parse(localStorage.getItem('fade-codex-v1')||'{}'))}catch{}
 // Native appearance is authoritative; saved Fade config is only a fallback.
 if(['light','dark'].includes(root.dataset.theme))config.light=root.dataset.theme==='light';
 root.setAttribute('data-fade-codex','');
 __THEME_BRIDGE__
 let navOpen=false,singleTimer=null,toastTimer,lastScroll=0,returnFocus=null,inerted=[],groups=[],recent=[],pinned=[],expanded={recent:false,pinned:true};
 const savedExpanded=(()=>{try{return JSON.parse(localStorage.getItem('fade-codex-orb-expanded-v2')||'{}')||{}}catch{return {}}})();
 expanded.recent=savedExpanded.recent===true;
 function persist(){try{localStorage.setItem('fade-codex-orb-expanded-v2',JSON.stringify(expanded))}catch{}}
 function announce(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
 function setTheme(light){nativeTheme.set(light?'light':'dark');config.light=light;root.dataset.theme=light?'light':'dark';root.dataset.fadePolarity=root.dataset.theme;host.dataset.theme=root.dataset.theme;for(const[n]of tokens)root.style.setProperty(n,`var(--fc-${tokens.get(n).kind})`);$('#headerThemeToggle').setAttribute('aria-label',light?'切换暗色':'切换亮色');$('#headerThemeToggle').setAttribute('title',light?'切换暗色':'切换亮色');try{localStorage.setItem('fade-codex-v1',JSON.stringify(config))}catch{}wakeParticles()}
 __RAIL_HISTORY__
 const disposeRailHistory=installRailHistory(document);
 __CONVERSATION__
 const disposeConversation=installConversationSurface(document);
 __FILE_PANEL__
 const disposeFilePanel=installFilePanel(document,announce);
 __MESSAGE_RAIL__
 const disposeMessageRail=installMessageRail(document);
 __ADAPTER__
 const restored=new Set(),nativeFocus=new Map();
 function syncNativeFocus(){for(const el of document.querySelectorAll('.app-shell-left-panel')){if(!nativeFocus.has(el))nativeFocus.set(el,{inert:el.inert,aria:el.getAttribute('aria-hidden')});const hidden=!root.hasAttribute('data-fade-settings')&&root.hasAttribute('data-fade-shell')&&!root.hasAttribute('data-fade-native-tools')&&!root.hasAttribute('data-fade-account-access')&&!root.hasAttribute('data-fade-rail-open');el.inert=hidden||nativeFocus.get(el).inert;if(hidden)el.setAttribute('aria-hidden','true');else if(nativeFocus.get(el).aria===null)el.removeAttribute('aria-hidden');else el.setAttribute('aria-hidden',nativeFocus.get(el).aria)}}
 let settingsPage=false;
 function syncSettingsNavigation(){
  const visible=[...document.querySelectorAll('[data-settings-panel-slug]')].some(el=>!el.closest('[hidden],[data-app-shell-active-page="false"]'));
  if(visible===settingsPage)return;settingsPage=visible;
  root.toggleAttribute('data-fade-settings',visible);syncNativeFocus();
 }
 const settingsObserver=new MutationObserver(syncSettingsNavigation);
 settingsObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','data-app-shell-active-page']});
 syncSettingsNavigation();
 let chatPicker=null;
 const adapter=createNativeAdapter(document,data=>{
  groups=data.groups;recent=data.recent;pinned=data.pinned??[];
  if(data.completedIds?.length){
   if(!reduceMotion.matches){shakeCore();wakeParticles()}
  }
  if(data.ready)root.setAttribute('data-fade-shell','orb');else root.removeAttribute('data-fade-shell');
  syncNativeFocus();
  for(const g of groups){expanded[g.id]=g.expanded;if(!restored.has(g.id)){restored.add(g.id);if(Object.hasOwn(savedExpanded,g.id)&&savedExpanded[g.id]!==g.expanded)setTimeout(()=>adapter.toggle(g.id,savedExpanded[g.id]),0)}}
  if(navOpen)renderRows();
  chatPicker?.refresh();
 });
 const headerTabsScroll=$('#headerTabsScroll');
 on(headerTabsScroll,'wheel',event=>{
  if(event.ctrlKey||headerTabsScroll.scrollWidth<=headerTabsScroll.clientWidth)return;
  const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
  if(!delta)return;
  event.preventDefault();event.stopPropagation();
  headerTabsScroll.scrollLeft+=delta*(event.deltaMode===1?20:event.deltaMode===2?headerTabsScroll.clientWidth:1);
 },{passive:false});
 __GPT_TABS__
 const disposeGptTabs=installGptTabs(document,$('#gptTabs'),$('#gptAdd'),announce,{split:true,bindContextMenu:(row,id)=>bindChatContextMenu(row,id,(id,x,y)=>disposeGptTabs.contextMenu(id,x,y))});
 const disposeCodexTabs=installCodexTabs(document,$('#codexTabs'),$('#codexAdd'),adapter,announce,()=>{const data=adapter.snapshot();const project=data.groups.find(g=>g.chats.some(c=>c.active));createChat(project?.id)},{bindContextMenu:bindChatContextMenu,viewport:headerTabsScroll,onArrival(){chatPicker?.close();closeNav(false)}});
 __HISTORY_CARDS__
 const historyCards=installHistoryCards(disposeGptTabs);
 __CHAT_PICKER__
 chatPicker=installChatPicker(adapter);
 const orbUsage=installOrbUsage(disposeGptTabs);
 const composerAutohide=installComposerAutohide();
 const disposeConversationTitle=installConversationTitle();
 const disposeFadeSettings=installFadeSettings();
 function actionFailed(){announce('未找到对应入口，请点击 fade 打开侧栏')}
 function switchChat(id){if(!adapter.select(id))actionFailed()}
 let creatingChat=false;
 function createChat(projectId){
  clearTimeout(singleTimer);singleTimer=null;
  if(creatingChat)return;
  creatingChat=true;disposeHomeOrb.beginArrival();burstTime=performance.now();startSpin();
  // Let the compositor present the movement before native navigation blocks
  // the main thread. Do not restore focus to the chat that is about to unmount.
  requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{
   closeNav(false);
   if(!adapter.newChat(projectId)){disposeHomeOrb.cancelArrival();actionFailed()}
   else disposeHomeOrb.refresh();
   creatingChat=false;
  },0)));
 }
 __CARD_SURFACE__
 function bindChatContextMenu(row,id,openMenu=null){
  function open(event){
   event.preventDefault();event.stopPropagation();
   const rect=row.getBoundingClientRect(),keyboard=event.type==='keydown';
   const x=keyboard?rect.left+Math.min(24,rect.width/2):event.clientX,y=keyboard?rect.top+rect.height/2:event.clientY;
   // Native menus and dialogs own their focus without collapsing the fan.
   chatPicker?.preserveForContextMenu(row);
   if(!(openMenu?openMenu(id,x,y):adapter.contextMenu(id,x,y)))actionFailed();
  }
  row.oncontextmenu=open;
  row.onkeydown=event=>{if(event.key==='ContextMenu'||event.key==='F10'&&event.shiftKey)open(event)};
 }
 let projectMenu=null;
 function finishProjectMenu(restoreFocus=false){
  const state=projectMenu;if(!state)return;projectMenu=null;
  cancelAnimationFrame(state.frame);
  for(const [el,style]of state.styles){if(style===null)el.removeAttribute('style');else el.setAttribute('style',style)}
  root.removeAttribute('data-fade-project-menu');
  if(navOpen)syncNativeFocus();
  const buttons=$('[data-project-menu]').filter(el=>el.dataset.projectMenu===state.id);buttons.forEach(button=>button.setAttribute('aria-expanded','false'));
  if(restoreFocus){const button=state.button.isConnected?state.button:buttons.find(b=>b.getBoundingClientRect().width);button?.focus({preventScroll:true})}
 }
 function dismissProjectMenu(){
  if(!projectMenu)return;
  document.getElementById(projectMenu.native.getAttribute('aria-controls'))?.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));
  finishProjectMenu();
 }
 function openProjectMenu(id,button){
  if(projectMenu){dismissProjectMenu();return}
  const native=adapter.snapshot().groups.find(g=>g.id===id)?.row.querySelector('button[aria-haspopup="menu"]');
  if(!native||native.disabled){actionFailed();return}
  const anchor=button.getBoundingClientRect();
  unlock();root.setAttribute('data-fade-project-menu','');
  projectMenu={id,native,anchor,button,styles:new Map(),frame:0};
  button.setAttribute('aria-expanded','true');
  native.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',code:'ArrowDown',bubbles:true,cancelable:true}));
  function position(){
   const state=projectMenu;if(!state)return;
   const popup=document.getElementById(native.getAttribute('aria-controls'));
   if(native.getAttribute('aria-expanded')!=='true'){finishProjectMenu(true);return}
   if(popup){
    const wrapper=popup.closest('[data-radix-popper-content-wrapper]')||popup;
    if(!state.styles.has(wrapper))state.styles.set(wrapper,wrapper.getAttribute('style'));
    const size=popup.getBoundingClientRect(),x=Math.max(8,Math.min(anchor.right-size.width,innerWidth-size.width-8)),y=Math.max(8,Math.min(anchor.bottom+6,innerHeight-size.height-8));
    wrapper.style.setProperty('position','fixed','important');wrapper.style.setProperty('left','0','important');wrapper.style.setProperty('top','0','important');wrapper.style.setProperty('transform',`translate(${x}px, ${y}px)`,'important');
   }
   state.frame=requestAnimationFrame(position);
  }
  projectMenu.frame=requestAnimationFrame(position);
 }
 on(document,'click',event=>{if(projectMenu&&event.target.closest?.('[role="menuitem"]:not([aria-haspopup="menu"]),[role="menuitemcheckbox"],[role="menuitemradio"]')){finishProjectMenu()}},{capture:true});
 on(window,'resize',dismissProjectMenu);
 function projectRow(g){
  const row=document.createElement('div');row.className='nav-row project project-actions';
  const main=document.createElement('button');main.type='button';main.className='project-main';main.dataset.group=g.id;
  main.setAttribute('aria-expanded',String(expanded[g.id]));main.setAttribute('aria-label',(expanded[g.id]?'收起':'展开')+g.title);
  main.innerHTML=(g.id==='recent'?'<span class="project-letter">◷</span>':'')+'<span class="row-title"></span><span class="row-meta"></span>';
  main.querySelector('.row-title').textContent=g.title;
  const completed=new Set(g.chats.filter(c=>c.status?.completionPending).map(c=>c.id)).size;
  main.querySelector('.row-meta').textContent=completed?'✓ '+completed:expanded[g.id]?g.chats.length:'';
  if(completed)row.dataset.completionPending='true';row.onclick=()=>toggleGroup(g.id);row.append(main);
  if(g.id!=='recent'&&g.id!=='pinned'){
   const menu=document.createElement('button');menu.type='button';menu.className='project-menu';menu.dataset.projectMenu=g.id;
   menu.title=g.title+' 的项目操作';menu.setAttribute('aria-label',menu.title);menu.setAttribute('aria-haspopup','menu');menu.setAttribute('aria-expanded',String(projectMenu?.id===g.id));
   menu.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
   menu.onclick=e=>{e.stopPropagation();openProjectMenu(g.id,menu)};row.append(menu);
   const add=document.createElement('button');add.type='button';add.className='project-new-chat';add.dataset.newProject=g.id;
   add.title='在 '+g.title+' 中新建聊天';add.setAttribute('aria-label',add.title);
   add.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
   add.onclick=e=>{e.stopPropagation();createChat(g.id)};row.append(add);
  }
  return addCardSurface(row);
 }
 function chatRow(chat){const row=document.createElement('div');row.className='nav-row chat'+(chat.active?' selected':'');row.innerHTML='<button class="row-main"><span class="chat-dot"></span><span class="row-title"></span></button>';row.querySelector('.row-title').textContent=chat.title;const b=row.querySelector('button');b.onclick=()=>switchChat(chat.id);if(chat.active)b.setAttribute('aria-current','page');b.dataset.chat=chat.id;appendFadeChatStatus(b,chat);appendFadeChatActions(row,chat,adapter);bindChatContextMenu(row,chat.id);return addCardSurface(row)}
 function renderRows(){
  cancelReveal();const list=$('#arcList'),scroll=$('#arcViewport').scrollTop,focused=shadow.activeElement,focusKey=focused?.dataset.group,chatKey=focused?.dataset.chat,newProjectKey=focused?.dataset.newProject;
  list.replaceChildren();for(const g of [...(pinned.length?[{id:'pinned',title:'置顶',chats:pinned}]:[]),...groups,{id:'recent',title:'最近',chats:recent}]){list.append(projectRow(g));if(expanded[g.id]){for(const chat of g.chats)list.append(chatRow(chat));if(g.moreLabel){const more=document.createElement('button');more.className='nav-row project';more.textContent=g.moreLabel;more.onclick=()=>adapter.more(g.id);list.append(addCardSurface(more))}}}
  $('#arcViewport').scrollTop=scroll;layoutArc();
  if(focusKey||chatKey||newProjectKey)$$('[data-group],[data-chat],[data-new-project]').find(el=>newProjectKey?el.dataset.newProject===newProjectKey:focusKey?el.dataset.group===focusKey:el.dataset.chat===chatKey)?.focus({preventScroll:true});
 }
 function toggleGroup(id){if(id==='recent'||id==='pinned'){expanded[id]=!expanded[id];persist();renderRows();return}const next=!expanded[id];if(adapter.toggle(id,next)){expanded[id]=next;persist();adapter.refresh()}else actionFailed()}
 __ARC__
 __MASK__
 function lock(){inerted=[...document.body.children].filter(el=>el!==host&&!el.inert);for(const el of inerted)el.inert=true}
 function unlock(){for(const el of inerted)if(el.isConnected)el.inert=false;inerted=[]}
 let cardEntranceVersion=0;
 function revealAfterOrbArrives(){
  const version=++cardEntranceVersion;
  requestAnimationFrame(async()=>{
   const orb=$('#orbButton');orb.getBoundingClientRect();
   const movement=orb.getAnimations().filter(animation=>animation.transitionProperty==='transform');
   await Promise.allSettled(movement.map(animation=>animation.finished));
   if(disposed||!navOpen||version!==cardEntranceVersion)return;
   $('#navigation').classList.add('cards-ready');$('#navContent').inert=false;
  });
 }
 function openNav(spin=true){if(navOpen)return;chatPicker?.close();clearTimeout(singleTimer);adapter.ensureSidebar();adapter.refresh();navOpen=true;returnFocus=document.activeElement;if(spin)startSpin();$('#navigation').classList.add('open');$('#navigation').setAttribute('role','dialog');root.setAttribute('data-fade-nav-open','');$('#navigation').setAttribute('aria-labelledby','navTitle');$('#navContent').inert=true;$('#orbButton').setAttribute('aria-expanded','true');renderRows();historyCards.open();$('#arcViewport').scrollTop=lastScroll;layoutArc();$('#orbButton').focus({preventScroll:true});revealAfterOrbArrives()}
 function closeNav(restoreFocus=true){if(!navOpen)return;cardEntranceVersion++;$('#navigation').classList.remove('cards-ready');dismissProjectMenu();cancelReveal();lastScroll=$('#arcViewport').scrollTop;navOpen=false;root.removeAttribute('data-fade-nav-open');$('#navigation').classList.remove('open');['role','aria-modal','aria-labelledby'].forEach(a=>$('#navigation').removeAttribute(a));$('#navContent').inert=true;$('#orbButton').setAttribute('aria-expanded','false');unlock();if(restoreFocus&&returnFocus?.isConnected&&!returnFocus.closest('[inert]'))returnFocus.focus({preventScroll:true})}
 let lastOrbClick=null;
 on(document,'click',e=>{if(!lastOrbClick||e.detail===0)return;const previous=lastOrbClick;lastOrbClick=null;if(performance.now()-previous.time<=500&&Math.hypot(e.clientX-previous.x,e.clientY-previous.y)<=32){e.preventDefault();e.stopImmediatePropagation();createChat()}},{capture:true});
 on($('#orbButton'),'click',e=>{if(e.detail)lastOrbClick={time:performance.now(),x:e.clientX,y:e.clientY};clearTimeout(singleTimer);startSpin();singleTimer=setTimeout(()=>{singleTimer=null;!navOpen&&openNav(false)},250)});
 on($('#orbButton'),'dblclick',e=>e.preventDefault());
 on($('#orbButton'),'pointerenter',()=>host.classList.add('near-orb'));
 on(document,'pointermove',e=>{if(!navOpen){const left=$('#navigation').getBoundingClientRect().left;host.classList.toggle('near-orb',e.clientX>=left&&e.clientX<left+135&&Math.abs(e.clientY-innerHeight/2)<145)}},{passive:true});
 on($('#navigation'),'click',event=>{
  if(!navOpen||event.button!==0)return;
  if(event.composedPath().some(el=>el.matches?.('.nav-row,button,input,textarea,select,a')))return;
  closeNav();
 });
 on($('#arcViewport'),'scroll',()=>{if(!arcFrame)arcFrame=requestAnimationFrame(()=>{arcFrame=0;layoutArc()})},{passive:true});
 on($('#fadeRailToggle'),'click',()=>{const visible=!root.hasAttribute('data-fade-rail-open');chatPicker.close();if(visible)adapter.ensureSidebar();if(visible)root.setAttribute('data-fade-rail-open','');else root.removeAttribute('data-fade-rail-open');$('#fadeRailToggle').setAttribute('aria-expanded',String(visible));const brandLabel='FCodex · '+(visible?'收起侧栏':'展开侧栏');$('#fadeRailToggle').setAttribute('aria-label',brandLabel);$('#fadeRailToggle').title=brandLabel;host.classList.remove('near-orb');syncNativeFocus();requestAnimationFrame(()=>{updateFanMask();layoutArc()})});

 on($('#headerMenuToggle'),'click',()=>{const open=!root.hasAttribute('data-fade-menu-open');if(open&&!document.getElementById('application-menu-trigger-file-menu')){announce('原生应用菜单尚未加载');return}root.toggleAttribute('data-fade-menu-open',open);host.toggleAttribute('data-menu-open',open);$('#headerMenuToggle').setAttribute('aria-expanded',String(open));$('#headerMenuToggle').setAttribute('aria-label',open?'收起应用菜单':'展开应用菜单');$('#headerMenuToggle').setAttribute('title',open?'收起应用菜单':'展开应用菜单')});
 const disposeFullscreen=installFullscreenControls();
 on($('#headerThemeToggle'),'click',()=>setTheme(!config.light));
 on(document,'keydown',e=>{
  if(projectMenu||!e.composedPath().includes(host))return;
  if(e.key==='Escape'&&!$('#chatPicker').hidden){e.preventDefault();e.stopPropagation();chatPicker.close(true);return}
  if(e.key==='Escape'){clearTimeout(singleTimer);lastOrbClick=null;if(navOpen){e.preventDefault();e.stopPropagation()}}
  if(navOpen&&e.key==='Tab'){const targets=[$('#orbButton'),...$('#navContent button,#arcViewport,#historyViewport')].filter(el=>!el.disabled),i=targets.indexOf(shadow.activeElement);e.preventDefault();targets[(i+(e.shiftKey?-1:1)+targets.length)%targets.length]?.focus({preventScroll:true})}
 },{capture:true});
 __ORB__
 __HOME_ORB__
 const disposeHomeOrb=installHomeOrb();
 let startupHomeRequested=false;
 function prepareStartupHome(){
  disposeHomeOrb.refresh();
  if(!disposeGptTabs.ready)return null;
  if(!startupHomeRequested){
   // Normalize the initial home route too: a visible emblem does not prove
   // that the restored home state is the Codex composer.
   if(!disposeGptTabs.home())return null;
   startupHomeRequested=true;
   return null;
  }
  if(navOpen)closeNav(false);
  return disposeHomeOrb.startupTarget();
 }
 on(window,'resize',()=>{updateFanMask();layoutArc();resizeCanvas()});
 window.__fadeCodex={version:'2.0.0',prepareStartupHome,setStartupCovered,status:()=>({phase:'live',navigation:navOpen,projects:groups.length,chats:groups.reduce((n,g)=>n+g.chats.length,recent.length+pinned.length),adapterReady:root.hasAttribute('data-fade-shell'),theme:config.light?'light':'dark'}),destroy(){
  if(disposed)return;dismissProjectMenu();disposed=true;abort.abort();settingsObserver.disconnect();nativeTheme.destroy();chatPicker.destroy();historyCards.destroy();disposeCodexTabs();disposeGptTabs();adapter.destroy();disposeHeader();disposeFullscreen();disposeFadeSettings();orbUsage.destroy();composerAutohide.destroy();disposeConversationTitle();disposeConversation();disposeRailHistory();disposeFilePanel();disposeMessageRail();timeouts.forEach(window.clearTimeout);frames.forEach(window.cancelAnimationFrame);clearInterval(editorStyleTimer);editorStyle.remove();unlock();
  for(const[n,t]of tokens){if(t.value)root.style.setProperty(n,t.value,t.priority);else root.style.removeProperty(n)}
  for(const[n,v]of originalAttrs){if(v===null)root.removeAttribute(n);else root.setAttribute(n,v)}
  for(const[el,state]of nativeFocus){el.inert=state.inert;if(state.aria===null)el.removeAttribute('aria-hidden');else el.setAttribute('aria-hidden',state.aria)}
  root.removeAttribute('data-fade-nav-open');disposeHomeOrb();host.remove();document.getElementById('fade-codex-style')?.remove();delete window.__fadeCodex;
 }};
 setTheme(config.light);updateFanMask();resizeCanvas();adapter.start();
})();
