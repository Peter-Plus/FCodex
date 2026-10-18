// Read the mounted native router; never reload the app or emulate a ChatGPT backend.
function fadeNativeRouter(doc){
 const el=doc.querySelector('[data-app-shell-frame]');
 const key=el&&Object.keys(el).find(k=>k.startsWith('__reactFiber$'));
 let fiber=key?el[key]:null,navigator=null,location=null;
 if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
 for(let depth=0;fiber&&depth<100;depth++,fiber=fiber.return){
  const values=[fiber.memoizedProps?.value];
  for(let context=fiber.dependencies?.firstContext;context;context=context.next)values.push(context.memoizedValue);
  for(const value of values){
   if(!navigator&&typeof value?.navigator?.push==='function'&&typeof value.navigator.createHref==='function')navigator=value.navigator;
   if(!location&&typeof value?.location?.pathname==='string')location=value.location;
  }
 }
 return navigator&&location?{navigator,location}:null;
}
function fadeGptPath(path){return /^\/c\/[^/?#]+$/.test(path||'')?path:null}
function fadeHasMessageId(value,id,depth=0){
 if(!value||depth>12)return false;
 if(Array.isArray(value))return value.some(v=>fadeHasMessageId(v,id,depth+1));
 return value.props?.id===id||fadeHasMessageId(value.props?.children,id,depth+1);
}
function fadeNativeChatMode(doc){
 return [...doc.querySelectorAll('button[aria-pressed]')].find(button=>{
  if(button.disabled||button.closest('[hidden],[aria-hidden="true"],[data-app-shell-active-page="false"]'))return false;
  const key=Object.keys(button).find(k=>k.startsWith('__reactProps$'));
  return key&&fadeHasMessageId(button[key]?.children,'composer.home.modeToggle.chat');
 })||null;
}
// The product selector (Codex / ChatGPT) is separate from Chat / Work.
function fadeNativeProductMode(doc){
 for(const button of doc.querySelectorAll('button[aria-haspopup="menu"]')){
  const key=Object.keys(button).find(k=>k.startsWith('__reactProps$'));
  if(!key||!['codex','chatGpt','chatGptWork.unavailable'].some(id=>fadeHasMessageId(button[key]?.children,'sidebarElectron.productMode.'+id)))continue;
  const fiberKey=Object.keys(button).find(k=>k.startsWith('__reactFiber$'));
  let fiber=button[fiberKey];
  if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
  for(let depth=0;fiber&&depth<30;depth++,fiber=fiber.return){
   const props=fiber.memoizedProps;
   if(typeof props?.onModeSelect==='function'&&['codex','work'].includes(props.mode))return props;
  }
 }
 return null;
}
// Request native expiry, so React releases the page and runs its own cleanups.
// Never remove native DOM manually or dispatch a conversation deletion action.
function fadeRetainedChatPages(doc,job){
 const result=[];
 for(const element of doc.querySelectorAll('[data-app-shell-active-page]')){
  let fiber=element[Object.keys(element).find(k=>k.startsWith('__reactFiber$'))];
  if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
  for(let depth=0;fiber&&depth<80;depth++,fiber=fiber.return){
   const props=fiber.memoizedProps,view=props?.view;if(!view?.route)continue;
   const loc=view.location?.location,route=view.route;
   const matches=route.routeKind==='chatgpt-thread'&&job.ids.includes(route.conversationId)||route.routeKind==='home'&&loc?.state?.fadeChat===true&&loc.state.fadeDraftKey===job.draftKey;
   if(matches){let expiry;for(let sibling=fiber.return?.child;sibling;sibling=sibling.sibling){const p=sibling.memoizedProps;if(typeof p?.onExpire==='function'&&typeof p.ttlSeconds==='number'&&p.active===props.active){expiry=p.onExpire;break}}
    result.push({active:props.active!==false||element.getAttribute('data-app-shell-active-page')!=='false',expire:expiry});
   }break;
  }
 }
 return result;
}
function fadeChatQueryMatches(query,ids){
 const [kind,key]=query.queryKey;
 return kind==='chatgpt-conversation'&&ids.includes(key)||kind==='chatgpt-conversation-details'&&ids.includes(key?.clientConversationId);
}
function installChatCacheRelease(doc,scope,module,state,isOpen,report){
 const jobs=state.pendingCacheRelease??=[];let timer=0,disposed=false,running=false,lastError='';
 const supported=typeof module.DYn==='function'&&module.VZn&&module.mZn&&module.VQn;
 const identity=()=>JSON.stringify([scope.get(module.GMr),scope.get(module.YMr)]);
 // Release jobs may outlive the Fade UI after returning to classic mode.
 const schedule=(ms=80)=>{if(!disposed&&!timer&&jobs.length)timer=globalThis.setTimeout(run,ms)};
 async function run(){
  timer=0;if(disposed||running)return;running=true;
  try{for(const job of [...jobs]){
   const remove=()=>{const i=jobs.indexOf(job);if(i>=0)jobs.splice(i,1)};
   if(isOpen(job)||identity()!==job.identity){remove();continue}
   if(!supported){if(!job.warned){job.warned=true;report('标签已关闭，当前客户端无法安全释放聊天缓存')}continue}
   // A local draft can acquire a server ID while its background reply finishes.
   for(const id of [...job.ids]){const resolved=module.YQn(scope.get,id);if(resolved&&!job.ids.includes(resolved))job.ids.push(resolved)}
   if(isOpen(job)){remove();continue}
   const busy=job.ids.some(id=>!['idle','error'].includes(scope.get(module.VZn,id))||[3,5,6,7].includes(scope.get(module.mZn,id))||scope.get(module.VQn,id));
   if(busy)continue;
   const loc=fadeNativeRouter(doc)?.location;
   if(loc?.state?.fadeDraftKey===job.draftKey||job.ids.some(id=>loc?.pathname==='/c/'+encodeURIComponent(id)))continue;
   const pages=fadeRetainedChatPages(doc,job);
   if(pages.length){if(pages.every(p=>!p.active&&p.expire))pages.forEach(p=>p.expire());continue}
   const cache=scope.queryClient.getQueryCache(),queries=cache.getAll().filter(q=>fadeChatQueryMatches(q,job.ids));
   // A different view still observing this chat owns its cache until it unmounts.
   if(queries.some(q=>q.getObserversCount()>0))continue;
   if(queries.some(q=>q.state.fetchStatus!=='idle')){
    await scope.queryClient.cancelQueries({predicate:q=>fadeChatQueryMatches(q,job.ids)});
    continue; // Recheck open tabs, generation and observers after the await.
   }
   for(const id of job.ids)module.DYn(scope,id);
   scope.queryClient.removeQueries({predicate:q=>fadeChatQueryMatches(q,job.ids)});
   remove();
  }lastError=''}catch(error){const message='聊天缓存释放暂未完成：'+error.message;if(message!==lastError){lastError=message;report(message)}}finally{running=false;schedule(500)}
 }
 schedule();
 return {enqueue(tab,id){jobs.push({draftKey:tab.id,ids:[...new Set([tab.conversationId,id].filter(Boolean))],identity:identity()});schedule()},destroy(){disposed=true;globalThis.clearTimeout(timer)}};
}
function installGptTabs(doc,list,add,report,options={}){
 const state=window.__fadeChatSession??={tabs:[],codex:{pathname:'/',search:'',state:{sidebarProductMode:'codex'}},active:null};
 let scope,module,cacheRelease,disposed=false,pending=0,signature='',lastRender='',ready=false,releaseAfterDispose=false;
 const reorder=installFadeTabReorder(list,state.tabs,tab=>tab.id,render);
 const listeners=new Set(),nativeSubscriptions=[];
 const router=()=>fadeNativeRouter(doc);
 const location=()=>router()?.location;
 const resolved=t=>t.conversationId&&module?module.YQn(scope.get,t.conversationId):t.conversationId;
 const pathFor=id=>'/c/'+encodeURIComponent(id);
 function save(){
  const loc=location();if(!loc)return;
  let tab=state.tabs.find(t=>t.id===loc.state?.fadeDraftKey);
  if(!tab&&fadeGptPath(loc.pathname))tab=state.tabs.find(t=>pathFor(resolved(t))===loc.pathname)||state.tabs.find(t=>t.id===state.active);
  if(tab&&((loc.pathname==='/'&&loc.state?.fadeChat)||fadeGptPath(loc.pathname)))tab.location={pathname:loc.pathname,search:loc.search,state:loc.state};
  else if(!fadeGptPath(loc.pathname)&&!loc.state?.fadeChat)state.codex={pathname:loc.pathname,search:loc.search,state:loc.state};
 }
 function upgrade(tab){
  const id=resolved(tab);
  if(id&&!id.startsWith('local-chatgpt:')&&(!tab.location||tab.location.pathname==='/'))tab.location={pathname:pathFor(id),search:tab.location?.search??'',state:{sidebarProductMode:'codex'}};
 }
 function go(target){const r=router();if(!r)throw Error('未找到原生导航');r.navigator.push({pathname:target.pathname,search:target.search??''},target.state)}
 function activate(tab){
  if(!ready){report('聊天入口仍在加载');return}
  try{save();if(!tab){state.active=null;go(state.codex);render();return}
   upgrade(tab);state.active=tab.id;
   if(tab.location)go(tab.location);else module.zYt(scope,{activeProject:null,fadeChat:true,fadeDraftKey:tab.id,initialChatGptConversationId:tab.conversationId,sidebarProductMode:'codex'});
   render();
  }catch(e){report('未能打开聊天：'+e.message)}
 }
 function newChat(){if(!ready)return;const tab={id:'fade-chat-'+crypto.randomUUID(),title:'新聊天',conversationId:module.ZQn()};state.tabs.push(tab);activate(tab)}
 function openHistory(chat){
  if(!ready)return false;
  let tab=state.tabs.find(t=>resolved(t)===chat.id||t.location?.pathname===pathFor(chat.id));
  if(!tab){tab={id:'fade-chat-'+crypto.randomUUID(),title:chat.title||'ChatGPT',conversationId:chat.id,location:{pathname:pathFor(chat.id),search:'',state:{sidebarProductMode:'codex'}}};state.tabs.push(tab)}
  activate(tab);return true;
 }
 function close(id){
  save();const index=state.tabs.findIndex(t=>t.id===id);if(index<0)return;
  const tab=state.tabs[index],conversationId=resolved(tab),wasActive=state.active===id;state.tabs.splice(index,1);
  if(wasActive){const next=state.tabs[Math.min(index,state.tabs.length-1)];if(next)activate(next);else{state.active=null;state.codex={pathname:'/',search:'',state:{sidebarProductMode:'codex'}};go(state.codex)}}
  cacheRelease?.enqueue(tab,conversationId);render();
 }
 function closeAllForClassic(){
  if(!ready)throw Error('聊天入口仍在加载，请稍后重试');
  save();
  // Navigate once, before clearing ownership. Never activate intermediate GPT tabs.
  go(state.codex);state.active=null;
  const tabs=state.tabs.splice(0);
  for(const tab of tabs)cacheRelease.enqueue(tab,resolved(tab));
  releaseAfterDispose=true;render();
 }
 function render(){
  const key=JSON.stringify([ready,state.active,state.tabs.map(t=>[t.id,t.title,resolved(t),t.location?.pathname])]);if(key===lastRender)return;lastRender=key;
  list.replaceChildren();const home=doc.createElement('button');home.className='fade-gpt-select fade-codex-tab';home.textContent='Codex';home.setAttribute('role','tab');home.setAttribute('aria-selected',String(state.active===null));home.onclick=()=>activate(null);if(!options.split)list.append(home);
  for(const tab of state.tabs){
   const item=doc.createElement('div');item.className='fade-gpt-tab';
   const button=doc.createElement('button');button.className='fade-gpt-select';button.textContent=tab.title;button.title=tab.title;button.setAttribute('role','tab');button.setAttribute('aria-selected',String(state.active===tab.id));button.onclick=()=>activate(tab);
   const x=doc.createElement('button');x.className='fade-gpt-close';x.textContent='×';x.setAttribute('aria-label','关闭标签 '+tab.title);x.title='关闭标签';x.onclick=()=>close(tab.id);
   item.append(button,x);reorder.bind(item,tab);const chatId=resolved(tab);if(chatId&&!chatId.startsWith('local-chatgpt:')&&fadeGptPath(tab.location?.pathname))options.bindContextMenu?.(item,chatId);list.append(item);
  }add.disabled=!ready;
 }
 function sync(){
  pending=0;if(disposed||!ready)return;const loc=location();if(!loc)return;
  const key=JSON.stringify([loc.pathname,loc.search,loc.key]);if(key!==signature){signature=key;save();
   const tab=state.tabs.find(t=>t.id===loc.state?.fadeDraftKey||t.location?.pathname===loc.pathname&&fadeGptPath(loc.pathname));
   state.active=tab?.id??null;
  }
  const cached=scope.queryClient.getQueryCache().getAll();
  const historyTitles=new Map(cached.filter(q=>q.queryKey[0]==='chatgpt-conversations').flatMap(q=>(q.state.data?.pages??[]).flatMap(p=>p.items??[])).map(c=>[c.id,c.title]));
  for(const tab of state.tabs){upgrade(tab);const id=resolved(tab),entry=cached.find(q=>q.queryKey[0]==='chatgpt-conversation'&&q.queryKey[1]===id)?.state.data;if(entry?.title||historyTitles.get(id))tab.title=entry?.title||historyTitles.get(id)}
  render();listeners.forEach(fn=>fn());
 }
 const schedule=()=>{if(!pending&&!disposed)pending=setTimeout(sync,80)};
 const observer=new MutationObserver(schedule);observer.observe(doc.body,{subtree:true,childList:true});
 async function init(){
  try{
   const links=[...doc.querySelectorAll('link[href]')],initial=links.find(l=>/app-initial-.*\.js$/.test(l.href)),shared=links.find(l=>/app-shared-.*\.js$/.test(l.href));
   if(!initial||!shared)throw Error('原生模块尚未加载');
   module=await import(initial.href);const common=await import(shared.href);
   if(!module.fadeStudyChat||!module.fadeStudyProduct)throw Error('请通过 Fade Codex 启动适配后的客户端');
   const candidates=[...doc.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width);
   for(const b of candidates){let f=b[Object.keys(b).find(k=>k.startsWith('__reactFiber$'))];for(let depth=0;f&&depth<40;depth++,f=f.return)for(let h=f.memoizedState;h&&typeof h==='object';h=h.next){const candidate=h.memoizedState?.current;if(candidate?.scope===common.Cot&&typeof candidate.get==='function'){scope=candidate;break}}if(scope)break}
   if(!scope)throw Error('未找到原生聊天作用域');
   if(disposed)return;
   cacheRelease=installChatCacheRelease(doc,scope,module,state,job=>state.tabs.some(t=>t.id===job.draftKey||job.ids.includes(resolved(t))),message=>{if(releaseAfterDispose)console.warn(message);else report(message)});
   ready=true;nativeSubscriptions.push(scope.queryClient.getQueryCache().subscribe(schedule));sync();
  }catch(e){if(!disposed){report('ChatGPT 入口不可用：'+e.message);render()}}
 }
 const query=()=>{const queries=scope?.queryClient.getQueryCache().getAll().filter(q=>q.queryKey[0]==='chatgpt-conversations'&&q.queryKey[1]===20)??[];return queries.find(q=>typeof q.options?.queryFn==='function')??queries[0]};
 const pinnedQuery=()=>scope?.queryClient.getQueryCache().getAll().find(q=>q.queryKey[0]==='chatgpt-pinned-conversations'&&q.queryKey[1]==='v2');
 const pinnedConversations=()=>{const data=pinnedQuery()?.state.data;return Array.isArray(data)?data.filter(entry=>entry.item_type==='conversation'&&entry.item?.id).map(entry=>entry.item):[]};
 function contextMenu(id,x,y,renameOnly=false){
  if(!ready||disposed||!window.electronBridge?.showContextMenu)return false;
  const conversation=query()?.state.data?.pages.flatMap(p=>p.items??[]).find(c=>c.id===id)
   ??pinnedConversations().find(c=>c.id===id)??scope.queryClient.getQueryData(['chatgpt-conversation',id]);
  if(!conversation)return false;
  const identity=JSON.stringify([scope.get(module.GMr),scope.get(module.YMr)]);
  const current=()=>!disposed&&identity===JSON.stringify([scope.get(module.GMr),scope.get(module.YMr)]);
  const fail=error=>report('聊天操作失败：'+error.message);
  const pinned=scope.get(module.Jan,id)??conversation.is_starred===true;
  const editable=module.mW(conversation,scope.get(module.qMr),scope.get(module.KMr));
  const title=conversation.title||'未命名聊天',messages=module.Don;
  const rename=()=>module.J4n(scope,module.cY,{initialValue:title,metadataThreadId:id,messages:{title:messages.renameDialogTitle,subtitle:messages.renameDialogSubtitle,placeholder:messages.renameDialogPlaceholder,ariaLabel:messages.renameDialogAriaLabel},requireNonEmpty:true,trimOnSave:true,onSave:value=>{if(current())return module.mon({scope,conversationId:id,previousTitle:title,title:value})}});
  if(renameOnly){if(!editable)return false;rename();return true}
  const remove=()=>{
   let deleting=false;
   const close=()=>module.U4n(scope,module.gW);
   const render=()=>module.J4n(scope,module.gW,{open:true,title,isDeleting:deleting,onOpenChange:open=>{if(!open&&!deleting)close()},onConfirm:async()=>{if(deleting||!current())return;deleting=true;render();try{await module.aon({scope,conversationId:id});close()}catch(error){deleting=false;render();fail(error)}}});
   render();
  };
  Promise.resolve().then(async()=>{
   const items=await module.$U(scope,{surface:'sidebar',conversation,conversationId:id,title,isPinned:pinned,projectId:conversation.gizmo_id?.startsWith('g-p-')?conversation.gizmo_id:null,onRename:editable?rename:undefined,onArchive:editable?()=>module.vW(scope,id):undefined,onDelete:editable?remove:undefined,onTogglePin:editable?()=>module.hon({scope,conversation,isPinned:!pinned}).catch(fail):undefined});
   if(!current())return;
   const actions=new Map(),intl=scope.get(module.oIr);
   const convert=items=>items.map(item=>{actions.set(item.id,item);return {id:item.id,type:['separator','radio'].includes(item.type)?item.type:undefined,checked:item.type==='radio'?item.checked===true:undefined,label:item.type==='separator'?'':(item.checked&&item.type!=='radio'?'✓ ':'')+(item.message?intl.formatMessage(item.message,item.messageValues):item.id),enabled:item.type==='label'?false:item.enabled??true,accelerator:item.accelerator,submenu:item.submenu?convert(item.submenu):undefined}});
   const result=await window.electronBridge.showContextMenu(convert(items),{x,y});
   const action=actions.get(result?.id);if(current()&&action?.enabled!==false)await action?.onSelect?.();
  }).catch(fail);
  return true;
 }

 async function chatAction(id,action){
  if(!ready||disposed)return false;
  const conversation=query()?.state.data?.pages.flatMap(p=>p.items??[]).find(c=>c.id===id)??scope.queryClient.getQueryData(['chatgpt-conversation',id]);
  if(!conversation||!module.mW(conversation,scope.get(module.qMr),scope.get(module.KMr)))return false;
  if(action==='pin')await module.hon({scope,conversation,isPinned:!(scope.get(module.Jan,id)??conversation.is_starred===true)});
  else if(action==='archive')await module.vW(scope,id);
  else return false;
  schedule();return true;
 }
 function history(){
  const q=query(),pq=pinnedQuery(),seen=new Set(),pages=q?.state.data?.pages??[],last=pages.at(-1);
  const items=[...pinnedConversations(),...pages.flatMap(p=>p.items??[])].filter(c=>!c.is_archived&&!c.is_temporary_chat&&!seen.has(c.id)&&seen.add(c.id)).map(c=>({id:c.id,title:c.title||'未命名聊天',pinned:scope.get(module.Jan,c.id)??c.is_starred===true})).sort((a,b)=>Number(b.pinned)-Number(a.pinned));
  return {ready:ready&&!!q,items,loading:q?.state.fetchStatus==='fetching'||pq?.state.fetchStatus==='fetching',loaded:!!q?.state.data,updatedAt:Math.max(q?.state.dataUpdatedAt??0,pq?.state.dataUpdatedAt??0),more:!!last&&last.offset+last.items.length<last.total,error:q?.state.error||pq?.state.error};
 }
 async function loadHistory(more=false){
  const q=query();
  // Native cache hydration can create a query before its request options exist.
  if(!ready||!q||typeof q.options?.queryFn!=='function')return {waiting:true};
  const pq=pinnedQuery();
  const requests=[q.fetch(undefined,more?{meta:{fetchMore:{direction:'forward'}},cancelRefetch:false}:{cancelRefetch:false})];
  if(pq?.options?.queryFn&&(!more||!pq.state.data))requests.push(pq.fetch(undefined,{cancelRefetch:false}));
  await Promise.all(requests);
  return {waiting:false};
 }
 const usageQuery=()=>scope?.queryClient.getQueryCache().getAll().find(q=>q.queryKey.length===1&&q.queryKey[0]==='rate-limit-status');
 function accountUsage(){const q=usageQuery();return q&&!q.state.error?q.state.data?.rate_limit:null}
 async function refreshAccountUsage(){const q=usageQuery();if(ready&&q?.options?.queryFn)await q.fetch(undefined,{cancelRefetch:false})}
 const create=()=>newChat();add.addEventListener('click',create);render();init();
 const dispose=()=>{disposed=true;reorder.destroy();if(!releaseAfterDispose)cacheRelease?.destroy();observer.disconnect();clearTimeout(pending);nativeSubscriptions.forEach(fn=>fn());add.removeEventListener('click',create);list.replaceChildren();listeners.clear()};
 Object.assign(dispose,{renameCurrent(){const tab=state.tabs.find(t=>t.id===state.active);return tab?contextMenu(resolved(tab),0,0,true):false},contextMenu,chatAction,accountUsage,refreshAccountUsage,closeAllForClassic,openHistory,history,loadHistory,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},home(){if(!ready)return false;state.active=null;go({pathname:'/',search:'',state:{sidebarProductMode:'codex'}});return true}});
 // Object.assign evaluates getters immediately: keep readiness live across async init.
 Object.assign(dispose,{activate,close,newChat,tabs:()=>state.tabs,canTransfer(tab){if(!ready||!module.VZn||!module.mZn||!module.VQn)return false;const id=resolved(tab);return ['idle','error'].includes(scope.get(module.VZn,id))&&![3,5,6,7].includes(scope.get(module.mZn,id))&&!scope.get(module.VQn,id)}});
 Object.defineProperty(dispose,'ready',{get:()=>ready&&!disposed});
 return dispose;
}
