// Native row presentation props are read-only; status/count semantics match 26.1007.9446.0.
function fadeReadChatStatus(row){
 const key=Object.keys(row).find(k=>k.startsWith('__reactFiber$'));let fiber=key?row[key]:null;
 if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
 let state=null,pending=null;
 for(let i=0;fiber&&i<24;i++,fiber=fiber.return){
  const p=fiber.memoizedProps;if(!p)continue;
  if(!state&&p.statusState&&['loading','idle'].includes(p.statusState.type))state=p.statusState;
  if(Array.isArray(p.chips)){
   if(p.chips.some(c=>c.id==='needs-input'))pending='reply';
   else if(!pending&&p.chips.some(c=>c.id==='awaiting-approval'))pending='approval';
  }
  if(p.statusPill?.label?.props?.id==='codex.localTaskRow.needsInput')pending='reply';
  if(state)break; // The nearest row owns these values, never a parent list.
 }
 const labels=[...(row.querySelectorAll?.('[role="status"][aria-label]')||[])].map(e=>e.getAttribute('aria-label')||'');
 const working=state?.type==='loading'||labels.some(s=>/^(Working|正在工作|工作中|处理中)$/i.test(s));
 const count=Number.isSafeInteger(state?.unreadCount)&&state.unreadCount>0?state.unreadCount:null;
 return {kind:pending||(working?'working':state?.type==='idle'?'idle':'unknown'),unread:state?.unread===true||!!count,count};
}
function fadeChatStatusLabel(status){
 if(!status)return '';
 if(status.acknowledged&&['completed','reply'].includes(status.kind))return '';
 if(status.kind==='reply')return '待回复';
 if(status.kind==='approval')return '待批准';
 if(status.kind==='working')return '正在工作';
 if(status.unread)return status.count?'新消息 '+(status.count>99?'99+':status.count):'新消息';
 return status.kind==='completed'?'工作完成':'';
}
function appendFadeChatStatus(button,chat){
 if(chat.status?.completionPending)button.dataset.completionPending='true';
 const label=fadeChatStatusLabel(chat.status);if(!label)return;
 const badge=document.createElement('span');badge.className='fade-chat-status';badge.dataset.status=chat.status.kind;
 badge.textContent=label;badge.title=chat.status.unread&&chat.status.kind==='completed'?'工作完成 · '+label:label;
 button.append(badge);
}
function fadeProjectMoreButton(container){
 return container?.querySelector('[data-app-action-sidebar-project-show-all-toggle]')||[...(container?.querySelectorAll('button')||[])].find(b=>!b.closest('[data-app-action-sidebar-thread-row],[data-app-action-sidebar-project-row]')&&/^(展开显示|收起显示|显示更多|显示更少|Show more|Show less)$/i.test(b.textContent.trim()));
}
function createNativeAdapter(doc, changed) {
 const prefix='data-app-action-sidebar-', attr=(el,key)=>el?.getAttribute(prefix+key);
 const all=selector=>[...doc.querySelectorAll(selector)];
 const projectSelector=`[${prefix}project-row]`, threadSelector=`[${prefix}thread-row]`;
 const key=el=>[attr(el,'thread-kind'),attr(el,'thread-host-id'),attr(el,'thread-id')].join(':');
 let observer=null,timer=0,signature='',disposed=false;const lastStatus=new Map(),completionPending=new Set(),completionEvents=new Set(),lastActive=new Map(),acknowledged=new Set();
 const projectContainer=row=>row.closest('[data-sidebar-project-container-id]:not([data-sidebar-project-drop-zone])')||row.closest(`[${prefix}section]`)||row.parentElement;
 function snapshot(){
  const projects=all(projectSelector).map(row=>({id:attr(row,'project-id'),title:attr(row,'project-label')||row.getAttribute('aria-label')||row.textContent.trim(),expanded:attr(row,'project-collapsed')==='false',chats:[],row,container:projectContainer(row)})).filter(p=>p.id);
  const pinned=[],recent=[],seen=new Set();
  for(const row of all(threadSelector)){
   const id=key(row);if(!attr(row,'thread-id'))continue;
   const status=fadeReadChatStatus(row),previous=lastStatus.get(id);
   if(status.kind==='idle'&&(status.unread||['working','completed'].includes(previous?.kind)))status.kind='completed';
   const active=attr(row,'thread-active')==='true';
   // Keep the real status for transition detection; acknowledgement only hides its badge.
   if(previous&&(status.kind!==previous.kind||(status.count||0)>(previous.count||0)||(status.unread&&!previous.unread)))acknowledged.delete(id);
   if(previous?.kind==='working'&&status.kind==='completed'){completionEvents.add(id);completionPending.add(id)}
   if(active&&lastActive.get(id)===false&&['completed','reply'].includes(status.kind))acknowledged.add(id);
   if(status.kind==='working'||acknowledged.has(id))completionPending.delete(id);
   status.acknowledged=acknowledged.has(id);
   lastActive.set(id,active);status.completionPending=completionPending.has(id);
   lastStatus.set(id,status);
   const chat={id,title:attr(row,'thread-title')||row.textContent.trim(),active:attr(row,'thread-active')==='true',pinned:attr(row,'thread-pinned')==='true',status,row};
   const group=projects.find(p=>p.container?.contains(row));
   const occurrence=(chat.pinned?'pinned':group?.id||'recent')+':'+id;if(seen.has(occurrence))continue;seen.add(occurrence);
   (chat.pinned?pinned:group?group.chats:recent).push(chat);
  }
  for(const p of projects){const more=fadeProjectMoreButton(p.container);p.moreLabel=more?(/收起|更少|less/i.test(more.textContent)?'收起更多':'展开更多'):null}
  return {groups:projects,pinned,recent,ready:projects.length>0||pinned.length>0||recent.length>0};
 }
 function refresh(){
  if(disposed)return;const data=snapshot();
  const next=JSON.stringify([data.pinned.map(c=>[c.id,c.title,c.active,c.pinned,c.status]),data.groups.map(g=>[g.id,g.title,g.expanded,g.moreLabel,g.chats.map(c=>[c.id,c.title,c.active,c.pinned,c.status])]),data.recent.map(c=>[c.id,c.title,c.active,c.pinned,c.status])]);
  if(next!==signature||completionEvents.size){signature=next;data.completedIds=[...completionEvents];completionEvents.clear();changed(data)}
 }
 function click(el){if(!el?.isConnected||el.disabled||el.getAttribute('aria-disabled')==='true')return false;el.click();return true}
 function toggle(id,open){const p=snapshot().groups.find(p=>p.id===id);if(!p)return false;if(p.expanded===open)return true;return click(p.row)}
 function select(id){
  snapshot();
  const ok=click(all(threadSelector).find(row=>key(row)===id));
  if(ok){if(['completed','reply'].includes(lastStatus.get(id)?.kind))acknowledged.add(id);completionPending.delete(id);refresh()}
  return ok;
 }
 function newChat(projectId){
  if(projectId){
   const project=snapshot().groups.find(p=>p.id===projectId);
   const buttons=project?.row.querySelectorAll('button')||[];
   return click([...buttons].find(el=>/^(?:在 .+ 中(?:开始|新建)新?聊天|(?:Start|New|Create).* (?:in|for) .+)$/i.test(el.getAttribute('aria-label')||'')));
  }
  const scope=doc.querySelector('.app-shell-left-panel')||doc;
  const candidates=[...scope.querySelectorAll('button,a,[role="button"]')];
  const names=/^(?:新聊天|新建聊天|新任务|新建任务|New chat|New thread|New task)(?:\s|$)/i;
  return click(candidates.find(el=>names.test((el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').trim())));
 }
 function ensureSidebar(){const frame=doc.querySelector('[data-app-shell-sidebar-open="false"]');const ok=frame?click(frame.querySelector('[data-app-shell-sidebar-trigger]')):true;for(const heading of ['Pinned','Projects']){const section=doc.querySelector('[data-app-action-sidebar-section-heading="'+heading+'"][data-app-action-sidebar-section-collapsed="true"]');if(section)click(section.querySelector('[data-app-action-sidebar-section-toggle]'))}return ok}
 function contextMenu(id,x,y){
  const row=all(threadSelector).find(row=>key(row)===id);
  if(!row?.isConnected)return false;
  row.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2,clientX:x,clientY:y,view:doc.defaultView}));
  return true;
 }
 function more(id){const p=snapshot().groups.find(p=>p.id===id);return click(fadeProjectMoreButton(p?.container))}
 function chatAction(id,action){
  const row=all(threadSelector).find(row=>key(row)===id);
  const labels=action==='pin'?/^(置顶聊天|取消置顶聊天|取消置顶|Pin chat|Unpin chat|Pin thread|Unpin thread)$/i:action==='archive'?/^(归档聊天|Archive chat|Archive thread)$/i:null;
  if(!row||!labels)return false;
  return click([...row.querySelectorAll('button')].find(b=>labels.test(b.getAttribute('aria-label')||'')));
 }
 function start(){
  refresh();observer=new MutationObserver(records=>{
   if(!records.some(r=>(r.target.nodeType===1?r.target:r.target.parentElement)?.closest('.app-shell-left-panel,[data-slate-sidebar-content]')||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.matches?.('.app-shell-left-panel,[data-slate-sidebar-content]')||n.querySelector?.(projectSelector+','+threadSelector)))))return;
   clearTimeout(timer);timer=setTimeout(refresh,100);
  });
  observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-app-action-sidebar-thread-pinned','data-app-action-sidebar-project-collapsed','data-app-action-sidebar-project-label','data-app-action-sidebar-thread-title','data-app-action-sidebar-thread-active','aria-label','class','title']});
 }
 return {snapshot,refresh,start,toggle,select,newChat,contextMenu,chatAction,ensureSidebar,more,destroy(){disposed=true;observer?.disconnect();clearTimeout(timer)}};
}
