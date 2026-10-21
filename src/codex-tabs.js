// Native sidebar keys can remain temporary after the conversation receives its server ID.
function fadeCodexConversationId(row){
 if(!row)return null;
 let fiber=row[Object.keys(row).find(k=>k.startsWith('__reactFiber'))];
 if(fiber?.alternate){let top=fiber;while(top.return)top=top.return;if(top.stateNode?.current&&top.stateNode.current!==top)fiber=fiber.alternate}
 for(let depth=0;fiber&&depth<24;depth++,fiber=fiber.return){const id=fiber.memoizedProps?.conversationId;if(typeof id==='string'&&id&&!id.includes('client-new-thread:'))return id}
 return null;
}
// Only expire hidden native pages. Task stores, processes and query caches stay native-owned.
function fadeCodexPages(doc){
 const pages=[];
 for(const element of doc.querySelectorAll('[data-app-shell-active-page]')){
  let fiber=element[Object.keys(element).find(k=>k.startsWith('__reactFiber$'))];
  if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
  for(let depth=0;fiber&&depth<80;depth++,fiber=fiber.return){
   const props=fiber.memoizedProps,view=props?.view;if(!view?.route)continue;
   if(view.route.routeKind==='local-thread'){
    let expire;for(let sibling=fiber.return?.child;sibling;sibling=sibling.sibling){const p=sibling.memoizedProps;if(typeof p?.onExpire==='function'&&typeof p.ttlSeconds==='number'&&p.active===props.active){expire=p.onExpire;break}}
    const hasDraft=[...element.querySelectorAll('[contenteditable="true"],textarea')].some(e=>(e.value??e.textContent??'').trim());
    pages.push({hasDraft,location:view.location?.location,active:props.active!==false||element.getAttribute('data-app-shell-active-page')!=='false',expire});
   }break;
  }
 }return pages;
}
function fadeCodexReleaseReady(job,now,pathname,tabs,chat,pages){
 return now>=job.after&&pathname!==job.path&&!tabs.some(t=>t.path===job.path)&&['idle','completed'].includes(chat?.status?.kind)&&!chat?.active&&pages.length>0&&pages.every(p=>!p.active&&!p.hasDraft&&typeof p.expire==='function');
}
function appendCodexTabStatus(doc,button,status){
 const kind=status==='approval'?'reply':status;
 const labels={working:'工作中',completed:'已完成',reply:status==='approval'?'待批准':'待回复'};
 if(!labels[kind])return;
 const icon=doc.createElement('span');icon.className='fade-tab-status fade-tab-status-'+kind;icon.title=labels[kind];icon.setAttribute('role','img');icon.setAttribute('aria-label',labels[kind]);
 const paths={working:'<circle cx="12" cy="12" r="9" opacity=".2"/><path d="M12 3a9 9 0 0 1 9 9"/>',completed:'<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="m7.5 12 3 3 6-6" stroke="#fff" stroke-width="2"/>',reply:'<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M8 7.5h8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-5l-3 2v-2a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z" stroke="#fff" stroke-width="1.5"/><path d="M10 11.5h4" stroke="#fff" stroke-width="1.5"/>'};
 icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[kind]+'</svg>';button.append(icon);
}
function installCodexTabs(doc,list,add,adapter,report,newChat,options={}){
 const state=window.__fadeCodexTabs??={tabs:[],jobs:[]};let timer=0,dead=false,renderKey='',closingPath=null,closingKey=null,lastPath=null,pendingNativePath=null;
 const reorder=installFadeTabReorder(list,state.tabs,tab=>tab.path,sync);
 const router=()=>fadeNativeRouter(doc);
 const chats=()=>{const data=adapter.snapshot();return [...(data.pinned??[]),...data.recent,...data.groups.flatMap(g=>g.chats)]};
 function go(location){const r=router();if(!r)throw Error('未找到原生导航');r.navigator.push({pathname:location.pathname,search:location.search||''},location.state)}
 function activate(tab){try{closingPath=null;state.jobs=state.jobs.filter(j=>j.path!==tab.path);go(tab.location);sync()}catch(e){report(e.message)}}
 function close(tab){
  const index=state.tabs.indexOf(tab);if(index<0)return;
  if([tab.path,tab.nativePath].includes(router()?.location.state?.fadePaneHome||router()?.location.pathname)){try{const next=state.tabs[index+1]||state.tabs[index-1];go(next?.location||{pathname:'/',state:{sidebarProductMode:'codex'}})}catch(e){report(e.message);return}}
  closingPath=tab.path;closingKey=router()?.location.key;state.tabs.splice(index,1);state.jobs.push({path:tab.path,id:tab.id,after:Date.now()+15000});sync();
 }
 function sync(){
  if(dead)return;
  const loc=router()?.location;if(!loc)return;const rows=chats();
  const aliases=new Map();
  for(const row of rows){const raw=row.row?.getAttribute('data-app-action-sidebar-thread-id');const id=fadeCodexConversationId(row.row);if(raw&&id){const key=raw.startsWith('local:')?raw.slice(6):raw;aliases.set('/local/'+key,'/local/'+id);aliases.set('/local/'+encodeURIComponent(key),'/local/'+id)}}
  const canonical=path=>aliases.get(path)||path;
  const activePath=loc.pathname==='/'&&loc.state?.fadePaneHome||canonical(loc.pathname);
  const seen=new Map();
  for(let i=0;i<state.tabs.length;){const tab=state.tabs[i],path=canonical(tab.path);tab.path=path;if(tab.location&&path.startsWith('/local/'))tab.location.pathname=path;if(seen.has(path)){state.tabs.splice(i,1);continue}seen.set(path,tab);i++}
  // Route is authoritative: the sidebar may still mark the last Codex task active on GPT pages.
  if(closingPath&&(loc.pathname!==closingPath||loc.key!==closingKey))closingPath=null;
  const previousPath=lastPath;
  const arrived=lastPath!==null&&lastPath!==loc.pathname||pendingNativePath===loc.pathname;lastPath=loc.pathname;
  const routeId=decodeURIComponent(activePath.slice('/local/'.length));
  const matching=rows.find(c=>[routeId,'local:'+routeId].includes(c.row?.getAttribute('data-app-action-sidebar-thread-id'))||fadeCodexConversationId(c.row)===routeId);
  const draft=routeId.includes('client-new-thread:')||matching?.id?.includes('client-new-thread:');
  if(loc.pathname!==closingPath&&/^\/local\/[^/?#]+$/.test(loc.pathname)){
   let tab=state.tabs.find(t=>t.path===activePath);
   if(!tab){tab={path:activePath,title:'新聊天',location:{}};state.tabs.push(tab)}
   tab.pendingCreation=!!draft;tab.nativePath=loc.pathname;
   tab.location={pathname:activePath,search:loc.search,state:loc.state};
   if(matching){tab.id=matching.id;if(matching.title?.trim())tab.title=matching.title}
   state.jobs=state.jobs.filter(j=>j.path!==tab.path);
  }
  for(const tab of state.tabs){
   const row=rows.find(c=>c.id===tab.id);
   if(row){
    if(row.title?.trim())tab.title=row.title;
    if(row.status?.kind==='working'||row.status?.kind==='completed'&&tab.status!=='completed')tab.completionSeen=false;
    tab.status=row.status?.kind;
   }
   if(tab.status==='completed'&&activePath===tab.path)tab.completionSeen=true;
  }
  const key=JSON.stringify([loc.pathname,state.tabs.map(t=>[t.path,t.id,t.title,t.status,t.completionSeen])]);
  if(key!==renderKey){renderKey=key;list.replaceChildren();for(const tab of state.tabs){
   const item=doc.createElement('div');item.className='fade-gpt-tab';
   const button=doc.createElement('button');button.className='fade-gpt-select fade-codex-select';const label=doc.createElement('span');label.className='fade-tab-title';label.textContent=tab.title;button.append(label);appendCodexTabStatus(doc,button,tab.status==='completed'&&tab.completionSeen?null:tab.status);button.title=tab.title;button.setAttribute('role','tab');button.setAttribute('aria-selected',String(activePath===tab.path));button.onclick=()=>activate(tab);
   const x=doc.createElement('button');x.className='fade-gpt-close';x.textContent='×';x.setAttribute('aria-label','关闭标签 '+tab.title);x.onclick=()=>close(tab);item.append(button,x);reorder.bind(item,tab);if(tab.id&&!tab.id.includes('client-new-thread:'))options.bindContextMenu?.(item,tab.id);list.append(item);
  }}
  if(arrived&&state.tabs.some(t=>t.path===loc.pathname)){
   pendingNativePath=null;options.onArrival?.();
   const selected=list.querySelector?.('[aria-selected="true"]'),viewport=options.viewport;
   if(selected&&viewport){const a=selected.getBoundingClientRect(),b=viewport.getBoundingClientRect();if(a.left<b.left)viewport.scrollLeft-=b.left-a.left+8;else if(a.right>b.right)viewport.scrollLeft+=a.right-b.right+8}
  }
  const pages=state.jobs.length?fadeCodexPages(doc):[];
  for(const job of [...state.jobs]){const matching=pages.filter(p=>p.location?.pathname===job.path);const chat=rows.find(c=>c.id===job.id);
   if(window.__fadePreviewBridge?.retainsPath(job.path))continue;
   if(fadeCodexReleaseReady(job,Date.now(),loc.pathname,state.tabs,chat,matching)){try{matching.forEach(p=>p.expire());state.jobs.splice(state.jobs.indexOf(job),1)}catch{/* Unsupported native lifecycle: leave to native expiry. */}}
   else if(Date.now()-job.after>600000)state.jobs.splice(state.jobs.indexOf(job),1);
  }
 }
 function schedule(){if(!timer&&!dead)timer=setTimeout(()=>{timer=0;sync()},100)}
 const observer=new MutationObserver(schedule);observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-app-shell-active-page','data-app-action-sidebar-thread-active','data-app-action-sidebar-thread-title']});
 // Native notification navigation remains owned by the client; reconcile only after it arrives.
 function nativeNavigation(event){const message=event.data;if(message?.type!=='navigate-to-route'||typeof message.path!=='string')return;const path=message.path.split(/[?#]/)[0];if(!/^\/local\/[^/]+$/.test(path))return;pendingNativePath=path;schedule()}
 window.addEventListener?.('message',nativeNavigation);
 const interval=globalThis.setInterval(sync,1000);add.addEventListener('click',newChat);sync();
 const dispose=()=>{dead=true;reorder.destroy();window.removeEventListener?.('message',nativeNavigation);observer.disconnect();clearTimeout(timer);globalThis.clearInterval(interval);add.removeEventListener('click',newChat);list.replaceChildren()};
 Object.assign(dispose,{activate,close,sync,tabs:()=>state.tabs,addHome(key,homeState={}){const tab={path:key,title:'新聊天',location:{pathname:'/',search:'',state:{...homeState,sidebarProductMode:'codex',fadePaneHome:key}}};state.tabs.push(tab);activate(tab);return tab}});return dispose;
}



