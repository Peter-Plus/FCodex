function installHistoryCards(tabs){
 const view=document.createElement('div');view.id='historyViewport';view.className='arc-viewport history-viewport';view.tabIndex=0;view.setAttribute('aria-label','ChatGPT 历史聊天，可上下滚动');
 const guide=document.createElementNS('http://www.w3.org/2000/svg','svg');guide.id='historyGuides';guide.setAttribute('aria-hidden','true');
 const list=document.createElement('div');list.className='arc-list';list.id='historyList';view.append(guide,list);$('#navContent').prepend(view);
 let pinnedExpanded=true;
 let previous='',busy=false,error='',retryTimer=0,waitingSince=0,disposed=false,errorUpdatedAt=0;
 function layout(){
  if(!navOpen)return;const rows=[...list.querySelectorAll('.nav-row')],first=rows[0],last=rows.at(-1);
  centerArcEnds(view,list,rows);
  const spread=first&&last?(last.offsetTop+last.offsetHeight/2-first.offsetTop-first.offsetHeight/2)/2:1;
  const mid=view.scrollTop+view.clientHeight/2,half=Math.min(arcLayoutHeight(view)*.40,Math.max(1,spread)),radius=innerWidth<560?150:350;
  for(const row of rows){const y=row.offsetTop+row.offsetHeight/2-mid,angle=fadeArcAngle(y,half);row.style.setProperty('--arc-x',(radius*(Math.cos(angle*Math.PI/180)-1)).toFixed(2)+'px');row.style.setProperty('--arc-angle',angle.toFixed(2)+'deg')}
  updateChatGuides(rows,view,guide,list);updateFanMask(view);
 }
 function render(){
  if(!navOpen)return;const data=tabs.history(),loc=fadeNativeRouter(document)?.location;
  if(error&&data.loaded&&!data.error&&data.updatedAt>errorUpdatedAt)error='';
  const key=JSON.stringify([pinnedExpanded,data.items,loc?.pathname,busy,error,data.ready,data.loading,data.more]);if(key===previous){layout();return}previous=key;
  const top=view.scrollTop;list.replaceChildren();
  if(data.items.some(c=>c.pinned)){
   const row=document.createElement('div');row.className='nav-row project project-actions';
   const toggle=document.createElement('button');toggle.type='button';toggle.className='project-main history-pinned-toggle';toggle.innerHTML='<span class="row-title">置顶</span><span class="row-meta"></span>';toggle.querySelector('.row-meta').textContent=pinnedExpanded?data.items.filter(c=>c.pinned).length:'';toggle.setAttribute('aria-expanded',String(pinnedExpanded));toggle.setAttribute('aria-label',(pinnedExpanded?'收起':'展开')+'置顶聊天');row.onclick=()=>{pinnedExpanded=!pinnedExpanded;render();list.querySelector('.history-pinned-toggle')?.focus({preventScroll:true})};row.append(toggle);list.append(addCardSurface(row));
  }
  for(const chat of data.items){
   if(chat.pinned&&!pinnedExpanded)continue;
   const row=document.createElement('div');row.className='nav-row chat'+(loc?.pathname==='/c/'+encodeURIComponent(chat.id)?' selected':'');row.dataset.historyId=chat.id;
   const button=document.createElement('button');button.className='row-main';button.innerHTML='<span class="chat-dot"></span><span class="row-title"></span>';button.querySelector('.row-title').textContent=chat.title;button.title=chat.title;
   if(row.classList.contains('selected'))button.setAttribute('aria-current','page');button.onclick=()=>{if(!tabs.openHistory(chat))announce('聊天入口仍在加载')};
   row.append(button);appendFadeChatActions(row,chat,tabs,'gpt');bindChatContextMenu(row,chat.id,(id,x,y)=>tabs.contextMenu(id,x,y));list.append(addCardSurface(row));
  }
  if(!data.items.length||error){const note=document.createElement('button');note.className='nav-row project history-message';note.textContent=error||(!data.ready||busy||waitingSince||data.loading?'正在加载聊天记录…':'暂无聊天记录');note.dataset.label=note.textContent;note.disabled=!error;note.onclick=()=>load();list.append(addCardSurface(note))}
  if(data.more){const more=document.createElement('button');more.className='nav-row project history-message';more.textContent=busy?'加载中…':'更多';more.dataset.label=more.textContent;more.disabled=busy;more.onclick=()=>load(true);list.append(addCardSurface(more))}
  view.scrollTop=top;layout();
 }
 async function load(more=false){
  if(busy||disposed)return;clearTimeout(retryTimer);
  busy=true;error='';render();
  try{
   const result=tabs.ready?await tabs.loadHistory(more):{waiting:true};
   if(disposed)return;
   if(result?.waiting){
    waitingSince ||= Date.now();
    if(Date.now()-waitingSince>=30000){waitingSince=0;error='聊天服务尚未就绪，点击重试';errorUpdatedAt=tabs.history().updatedAt}
    else retryTimer=setTimeout(()=>{if(navOpen&&!disposed)load(more)},300);
   }else waitingSince=0;
  }catch(cause){waitingSince=0;errorUpdatedAt=tabs.history().updatedAt;error='无法加载，点击重试';console.warn('[Fade history] 加载失败',cause)}finally{busy=false;if(!disposed)render()}
 }
 const unsubscribe=tabs.subscribe(render);
 on(view,'scroll',()=>{layout();const data=tabs.history();if(navOpen&&data.more&&!busy&&view.scrollTop+view.clientHeight>=view.scrollHeight-100)load(true)},{passive:true});
 const disposeAutoscroll=installFanAutoscroll([{view,layout},{view:$('#arcViewport'),layout:layoutArc}]);
 on(window,'resize',layout);
 return {open(){waitingSince=0;render();load()},refresh:render,destroy(){disposeAutoscroll();disposed=true;unsubscribe();clearTimeout(retryTimer);view.remove()}};
}
