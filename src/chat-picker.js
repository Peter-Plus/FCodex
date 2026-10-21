function filterFadeChats(data,query){
 const q=query.trim().toLocaleLowerCase(),matches=s=>s.toLocaleLowerCase().includes(q);
 return {pinned:(data.pinned??[]).filter(c=>!q||matches(c.title)),groups:data.groups.map(g=>({...g,chats:q&&!matches(g.title)?g.chats.filter(c=>matches(c.title)):g.chats})).filter(g=>!q||matches(g.title)||g.chats.length),recent:data.recent.filter(c=>!q||matches(c.title))};
}
function installChatPicker(adapter){
 const trigger=$('#compactTitle'),panel=$('#chatPicker'),search=$('#chatSearch'),liveList=$('#chatPickerList');
 let list=liveList;
 const gptTrigger=$('#gptDirectory');let mode='codex',customAnchor=null,customRect=null;
 const pinnedExpanded={codex:true,gpt:true},projectsExpanded={codex:true,gpt:true},recentExpanded={codex:true,gpt:true};
 function sectionHeading(title,key,state){const button=document.createElement('button');button.type='button';button.className='chat-picker-section chat-picker-section-toggle';button.dataset.pickerKey=key+':'+mode;button.textContent=title;button.setAttribute('aria-expanded',String(state[mode]));button.setAttribute('aria-label',(state[mode]?'收起':'展开')+title);button.onclick=()=>{state[mode]=!state[mode];render();list.querySelector('[data-picker-key="'+key+':'+mode+'"]')?.focus({preventScroll:true})};if(key==='projects'&&mode==='codex'){const group=document.createElement('div');group.className='chat-picker-section-actions';const add=document.createElement('button');add.type='button';add.className='chat-picker-add-project';add.dataset.pickerKey='add-project';add.title='创建新项目';add.setAttribute('aria-label','创建新项目');add.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';add.onclick=()=>{adapter.ensureSidebar();const native=[...document.querySelectorAll('[data-app-action-sidebar-section-heading="Projects"] button')].find(b=>/^(添加新项目|创建新项目|Add new project|New project|Create project)$/i.test(b.getAttribute('aria-label')||''));if(!native||native.disabled){announce('创建项目入口尚未就绪');return}preserveForContextMenu(add);native.click()};group.append(button,add);list.append(group)}else list.append(button)}
 function pinnedHeading(){sectionHeading('置顶','pinned',pinnedExpanded)}

 const searchExpanded=new Set();let opened=false,contextMenuFocus=false;
 function position(){
  if(!opened)return;
  const anchor=customAnchor?(customAnchor.isConnected?customAnchor.getBoundingClientRect():customRect):(mode==='gpt'?gptTrigger:trigger).getBoundingClientRect();
  const bounds=panel.offsetParent?.getBoundingClientRect()??{left:0,top:0};
  const width=panel.getBoundingClientRect().width,viewport=document.documentElement;
  const left=Math.max(8,Math.min(anchor.left,viewport.clientWidth-width-8)),top=anchor.bottom+10;
  panel.style.left=(left-bounds.left)+'px';panel.style.top=(top-bounds.top)+'px';
  panel.style.maxHeight=Math.max(0,viewport.clientHeight-top-12)+'px';
 }
 function restoreSearch(){for(const id of searchExpanded)adapter.toggle(id,false);searchExpanded.clear()}
 function close(focus=false){if(!opened)return;opened=false;contextMenuFocus=false;document.documentElement.removeAttribute('data-fade-picker-open');panel.hidden=true;trigger.setAttribute('aria-expanded','false');gptTrigger.setAttribute('aria-expanded','false');restoreSearch();if(focus)(mode==='gpt'?gptTrigger:trigger).focus({preventScroll:true})}
 function preserveForContextMenu(row){if(opened&&panel.contains(row))contextMenuFocus=true}
 function row(title,kind,action,key){
  const b=document.createElement('button');b.type='button';b.className='chat-picker-row '+kind;b.dataset.pickerKey=key;
  const icon=document.createElement('span');icon.className='chat-picker-icon';icon.setAttribute('aria-hidden','true');
  icon.innerHTML=kind==='project'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7V5h6l2 2h10v13H3Z"/></svg>':kind==='new'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4H5v15h15v-7M11 13l2-5 6-6 3 3-6 6Z"/></svg>':'';
  const label=document.createElement('span');label.className='chat-picker-label';label.textContent=title;b.append(icon,label);b.onclick=action;return b;
 }
 function render(){
  if(!opened)return;
  position();
  const focus=shadow.activeElement,focusKey=focus?.dataset?.pickerKey,scroll=liveList.scrollTop;
  const draft=document.createElement('div');
  list=draft;
  try{buildList()}finally{list=liveList}
  // Background updates must leave unchanged hovered/focused rows mounted.
  const key=node=>node.dataset.pickerKey||node.querySelector('[data-picker-key]')?.dataset.pickerKey;
  // Keys identify each section occurrence, since a chat can also appear in Recents.
  const previous=new Map([...liveList.children].map(node=>[key(node),node]));
  let index=0;
  for(const fresh of [...draft.children]){
   const old=previous.get(key(fresh)),node=old&&old.isEqualNode(fresh)?old:fresh;
   if(liveList.children[index]!==node)liveList.insertBefore(node,liveList.children[index]||null);
   index++;
  }
  while(liveList.children.length>index)liveList.lastElementChild.remove();
  liveList.scrollTop=scroll;
  if(focusKey&&!liveList.contains(focus))[...liveList.querySelectorAll('button')].find(b=>b.dataset.pickerKey===focusKey)?.focus({preventScroll:true});
 }
 function buildList(){
  if(mode==='gpt'){const data=disposeGptTabs.history(),query=search.value.trim().toLocaleLowerCase();list.replaceChildren();const matches=data.items.filter(c=>c.title.toLocaleLowerCase().includes(query));if(matches.some(c=>c.pinned))pinnedHeading();let recentHeading=false;for(const chat of matches){if(chat.pinned&&!pinnedExpanded.gpt)continue;if(!chat.pinned&&!recentHeading){recentHeading=true;sectionHeading('最近','recent',recentExpanded)}if(!chat.pinned&&!recentExpanded.gpt)continue;const b=row(chat.title,'chat',()=>{close();disposeGptTabs.openHistory(chat)},'gpt:'+chat.id);bindChatContextMenu(b,chat.id,(id,x,y)=>disposeGptTabs.contextMenu(id,x,y));const item=document.createElement('div');item.className='chat-picker-chat';item.append(b);appendFadeChatActions(item,chat,disposeGptTabs,'gpt');list.append(item)}if(!data.items.length)list.append(row(data.loading?'正在加载…':'暂无聊天记录','more',()=>loadGpt(),'empty'));if(data.more&&recentExpanded.gpt)list.append(row(data.loading?'加载中…':'更多','more',()=>loadGpt(true),'more'));return}
 const data=adapter.snapshot(),query=search.value.trim();
  // Mount collapsed native groups for search; restore their state when search ends.
  if(query){for(const g of data.groups)if(!g.expanded&&!searchExpanded.has(g.id)){searchExpanded.add(g.id);adapter.toggle(g.id,true)}}
  else restoreSearch();
  const filtered=filterFadeChats(data,query);list.replaceChildren();
  list.append(row('新聊天','new',()=>{close();createChat()},'new'));
  function chat(c,scope=''){const b=row(c.title,'chat',()=>{close();switchChat(c.id)},'chat:'+scope+c.id);bindChatContextMenu(b,c.id);if(c.active)b.setAttribute('aria-current','page');appendFadeChatStatus(b,c);const item=document.createElement('div');item.className='chat-picker-chat';item.append(b);appendFadeChatActions(item,c,adapter);list.append(item)}
  if(filtered.pinned.length){pinnedHeading();if(pinnedExpanded.codex)filtered.pinned.forEach(c=>chat(c,'pinned:'))}
  if(!query||filtered.groups.length)sectionHeading('项目','projects',projectsExpanded);
  for(const g of projectsExpanded.codex?filtered.groups:[]){
   const b=row(g.title,'project',()=>{if(query)return;adapter.toggle(g.id,!g.expanded);adapter.refresh();render()},'project:'+g.id);
   b.setAttribute('aria-expanded',String(!!query||g.expanded));
   const project=document.createElement('div');project.className='chat-picker-project';project.append(b);
   const menu=document.createElement('button');menu.type='button';menu.className='project-menu';menu.dataset.projectMenu=g.id;menu.dataset.pickerKey='menu:'+g.id;
   menu.title=g.title+' 的项目操作';menu.setAttribute('aria-label',menu.title);menu.setAttribute('aria-haspopup','menu');menu.setAttribute('aria-expanded','false');
   menu.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
   menu.onclick=()=>{preserveForContextMenu(menu);openProjectMenu(g.id,menu)};
   const add=document.createElement('button');add.type='button';add.className='project-new-chat';add.dataset.pickerKey='new:'+g.id;
   add.title='在 '+g.title+' 中新建聊天';add.setAttribute('aria-label',add.title);add.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
   add.onclick=()=>{close();createChat(g.id)};project.append(menu,add);list.append(project);
   if(query||g.expanded){g.chats.forEach(c=>chat(c,'project:'+g.id+':'));
    if(g.moreLabel)list.append(row(g.moreLabel,'more',()=>{adapter.more(g.id);adapter.refresh();render()},'more:'+g.id));
   }
  }
  if(filtered.recent.length){sectionHeading('最近','recent',recentExpanded);if(recentExpanded.codex)filtered.recent.forEach(c=>chat(c))}
  if(query&&!filtered.pinned.length&&!filtered.groups.length&&!filtered.recent.length){const empty=document.createElement('div');empty.className='chat-picker-empty';empty.textContent='无匹配聊天';list.append(empty)}
 }
 async function loadGpt(more=false){try{await disposeGptTabs.loadHistory(more);render()}catch(e){announce('聊天记录加载失败：'+e.message)}}
 function open(nextMode='codex'){
 close();mode=nextMode;
  closeNav();adapter.ensureSidebar();adapter.refresh();opened=true;document.documentElement.setAttribute('data-fade-picker-open','');search.value='';panel.hidden=false;
  (mode==='gpt'?gptTrigger:trigger).setAttribute('aria-expanded','true');panel.setAttribute('aria-label',mode==='gpt'?'GPT 聊天目录':'Codex 聊天目录');if(mode==='gpt')loadGpt();render();search.focus({preventScroll:true});
 }
 on(trigger,'click',()=>{customAnchor=null;opened&&mode==='codex'?close():open()});
 on(gptTrigger,'click',()=>{customAnchor=null;opened&&mode==='gpt'?close():open('gpt')});
 on(window,'resize',position);
 const header=$('#headerTabsScroll');
 if(header)on(header,'scroll',position);
 const layoutObserver=new ResizeObserver(position);
 if(header){layoutObserver.observe(header);for(const area of header.children)layoutObserver.observe(area)}
 const unsubscribe=disposeGptTabs.subscribe(render);
 on(search,'input',render);
 on(document,'pointerdown',e=>{if(contextMenuFocus&&e.target?.closest?.('[role="dialog"],[role="alertdialog"],.codex-dialog-overlay,[data-radix-popper-content-wrapper]'))return;if(opened&&!e.composedPath().includes(panel)&&!e.composedPath().includes(trigger)&&!e.composedPath().includes(gptTrigger))close()});
 on(panel,'keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);return}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   const items=[search,...list.querySelectorAll('button')],index=items.indexOf(shadow.activeElement);
   e.preventDefault();items[(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();
  }
 });
 // Native menus take focus outside the shadow root and may return it to their
 // hidden sidebar row. Keep the directory until its normal explicit dismissal.
 on(panel,'focusout',()=>setTimeout(()=>{if(opened&&!contextMenuFocus&&!panel.contains(shadow.activeElement)&&shadow.activeElement!==trigger&&shadow.activeElement!==gptTrigger)close()},0));
 return {refresh:render,close,openFor(type,anchor){customAnchor=anchor;customRect=anchor.getBoundingClientRect();open(type)},preserveForContextMenu,destroy(){layoutObserver.disconnect();unsubscribe();close()}};
}
