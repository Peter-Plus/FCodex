// Observe disk metadata without changing native editor state. Only an explicit
// refresh may apply a snapshot, through the editor's own conflict machinery.
function fadePreviewPath(path){
 if(typeof path!=='string')return null;
 const normalized=path.replace(/^\/([a-z]:[\\/])/i,'$1').replaceAll('\\','/');
 return /^[a-z]:\//i.test(normalized)?normalized.toLowerCase():normalized;
}
function fadePreviewController(pane,meta){
 const candidates=new Set([pane]);
 // Native editors create their inner DOM imperatively. Its nearest React-owned
 // ancestor, not the diffs-container itself, carries the editor's hook refs.
 for(const host of pane.querySelectorAll('diffs-container,.cm-editor,[contenteditable]'))for(let el=host;el;el=el.parentElement){candidates.add(el);if(el===pane)break}
 let client=null;
 for(const element of candidates){
  let fiber=element[Object.keys(element).find(k=>k.startsWith('__reactFiber$'))];
  if(fiber?.alternate){let root=fiber;while(root.return)root=root.return;if(root.stateNode?.current&&root.stateNode.current!==root)fiber=fiber.alternate}
  for(let depth=0;fiber&&depth<70;depth++,fiber=fiber.return){
   for(let hook=fiber.memoizedState,count=0;hook&&typeof hook==='object'&&count++<100;hook=hook.next){
    const value=hook.memoizedState?.current;
    if(value?.queryClient?.getQueryCache)client=value.queryClient;
    const path=value?.options?.filePath??value?.filePath;
    const host=value?.options?.hostId??value?.hostId;
    if(fadePreviewPath(path)===fadePreviewPath(meta.path)&&host===meta.hostId&&typeof value.readFile==='function'&&typeof value.applyDiskSnapshot==='function'&&typeof value.resolveExternalChange==='function'&&typeof value.emitState==='function')return {editor:value};
   }
   for(let context=fiber.dependencies?.firstContext;context;context=context.next){const value=context.memoizedValue;if(value?.getQueryCache)client=value;if(value?.queryClient?.getQueryCache)client=value.queryClient}
  }
 }
 // Never refetch underneath an editor whose dirty-state controller is unknown.
 if(pane.querySelector('.cm-editor,[contenteditable="true"]'))return null;
 const query=client?.getQueryCache().getAll().find(q=>{
  if(!q.queryKey.includes('read-file')||typeof q.options?.queryFn!=='function')return false;
  try{const params=JSON.parse(q.queryKey.at(-1));return fadePreviewPath(params.path)===fadePreviewPath(meta.path)&&params.hostId===meta.hostId&&typeof q.state.data?.contents==='string'}catch{return false}
 });
 return query?{query}:null;
}
function fadePreviewContent(editor){return typeof editor.getContent==='function'?editor.getContent():editor.state?.file?.contents}
function fadePreviewDirty(editor){
 const document=typeof editor.getDocument==='function'?editor.getDocument():editor.document;
 return editor.isClosing||editor.isDisposed||editor.abortController?.signal.aborted||(editor.hasUnsavedChanges&&document?.kind!=='conflict')||editor.savePromise!=null||editor.pendingEditorChange!=null||editor.selectionEdit!=null||!['ready','conflict'].includes(document?.kind)||fadePreviewContent(editor)!==document.baseContent;
}
function fadePreviewDocument(editor){return typeof editor.getDocument==='function'?editor.getDocument():editor.document}
// Own external changes at the native controller, not by hiding its review DOM.
// Reads remain native (including remote storage); writes retain native mtime CAS.
function fadeOwnPreviewEditor(editor,notify,manualOnly=false){
 const originals=new Map(),wrappers=new Map();let released=false,manual=false,checking=null,generation=0;
 const state={stale:false,hint:true,error:null,snapshot:null,lastCheck:0,locked:true,saving:false};
 const nativeSaveKey=Symbol.for('fcodex.preview.nativeSave');
 function observe(snapshot){
  if(typeof snapshot?.content!=='string')throw Error('文件内容读取失败');
  generation++;
  state.snapshot=snapshot;state.hint=false;state.error=null;state.lastCheck=Date.now();
  state.stale=snapshot.content!==fadePreviewDocument(editor)?.baseContent;
  if(state.stale)editor.clearAutosaveTimeout?.();
  else if(snapshot.mtimeMs!=null)editor.baseMtimeMs=snapshot.mtimeMs;
  notify();
 }
 async function check(){
  if(released)return;
  if(checking)return checking;
  const version=generation;
  checking=(async()=>{try{const snapshot=await editor.readFile();if(!released&&generation===version)observe(snapshot)}catch(error){if(!released&&generation===version){state.error=error;state.hint=true;notify()}}finally{checking=null}})();
  return checking;
 }
 function wrap(name,fn){if(typeof editor[name]!=='function')return;originals.set(name,{own:Object.hasOwn(editor,name),value:editor[name]});wrappers.set(name,fn);editor[name]=fn}
 const apply=editor.applyDiskSnapshot,save=editor[nativeSaveKey]??editor.save;
 wrap('syncExternalChange',async function(){if(released)return;state.hint=true;editor.hasPendingExternalChange=false;notify();await check()});
 wrap('applyDiskSnapshot',function(snapshot,...args){if(manual)return apply.call(this,snapshot,...args);observe(snapshot)});
 async function saveChecked(...args){
  // Even a missed watcher event or an atomic replace cannot silently save over
  // a known external version. Read before saving; the native CAS handles races.
  await check();
  if(released||state.stale||state.error||state.hint){notify();return false}
  if(editor.isClosing||editor.abortController?.signal.aborted)return false;
  return save.apply(editor,args);
 }
 if(save)wrap('save',manualOnly?async()=>false:saveChecked);
 const onStateChange=editor.options?.onStateChange;
 const projected=typeof onStateChange==='function'?function(value){return onStateChange.call(this,{...value,isReadOnly:state.locked||value.isReadOnly})}:null;
 if(manualOnly){
  if(save)editor[nativeSaveKey]=save;
  editor.clearAutosaveTimeout?.();
  wrap('scheduleAutosave',function(){editor.clearAutosaveTimeout?.()});
  wrap('saveUntilClean',async()=>false);
  for(const [name,rejected]of [['updateContent',undefined],['completeEdit','reject'],['markPotentiallyDirty',undefined],['requestSelectionEdit','failed'],['resolveSelectionEdit',null]]){
   const original=editor[name];wrap(name,function(...args){if(state.locked)return rejected;const result=original.apply(this,args);notify();return result});
  }
  const emit=editor.emitState;wrap('emitState',function(...args){const result=emit.apply(this,args);notify();return result});
  if(projected)editor.options.onStateChange=projected;
 }

 // Invalidate a watcher read that began before we took ownership.
 if(typeof editor.externalSyncRevision==='number')editor.externalSyncRevision++;
 const document=fadePreviewDocument(editor);
 if(document?.kind==='conflict'&&editor.reviewDiskSnapshot){
  observe(editor.reviewDiskSnapshot);
  // Preserve the local buffer and its original base. Rejecting through the
  // native action would turn it into a save candidate against the new disk.
  editor.reviewDiskSnapshot=null;
  if(typeof editor.getDocument!=='function'){editor.document={kind:'ready',baseContent:document.baseContent};editor.hasUnsavedChanges=fadePreviewContent(editor)!==document.baseContent}
  editor.clearAutosaveTimeout?.();editor.emitState();editor.flushDraftSnapshot?.();
 }
 if(manualOnly)editor.emitState();
 return {state,check,
  get editable(){return manualOnly&&!!projected&&typeof save==='function'&&typeof editor.updateContent==='function'&&!editor.state?.isReadOnly},
  get dirty(){return editor.pendingEditorChange!=null||fadePreviewContent(editor)!==fadePreviewDocument(editor)?.baseContent},
  async setLocked(locked){
   if(released)return;
   // Let the native pending edit commit to its buffer before switching read-only.
   if(locked)await editor.waitForPendingEditorChange?.();
   if(released||editor.isClosing)return;
   state.locked=locked;editor.emitState();notify();
  },
  async saveNow(){
   if(!manualOnly||released||!save||state.saving)return false;
   state.saving=true;notify();
   try{await editor.waitForPendingEditorChange?.();if(editor.savePromise)await editor.savePromise;if(released)return false;return await saveChecked()}
   finally{state.saving=false;notify()}
  },
  async refresh(isCurrent,confirmDiscard){
   if(editor.savePromise||editor.pendingEditorChange||editor.selectionEdit||editor.isClosing||editor.isDisposed)throw Error('编辑或保存尚未完成，请稍后刷新');
   const content=fadePreviewContent(editor),document=fadePreviewDocument(editor),revision=editor.diskReadRevision;
   if(!document||typeof content!=='string')throw Error('编辑器尚未就绪');
   const dirty=content!==document.baseContent;
   if(dirty&&!confirmDiscard())return false;
   const snapshot=await editor.readFile();
   if(released||editor.isClosing||editor.isDisposed||editor.abortController?.signal.aborted||!isCurrent())throw Error('预览已切换，请在当前文件中重试');
   if(editor.savePromise||editor.pendingEditorChange||editor.selectionEdit||fadePreviewContent(editor)!==content||editor.diskReadRevision!==revision||fadePreviewDocument(editor)?.baseContent!==document.baseContent)throw Error('读取期间编辑器发生变化，请重试');
   if(typeof snapshot?.content!=='string')throw Error('文件内容读取失败');
   editor.diskReadRevision++;manual=true;
   try{
    apply.call(editor,snapshot,content);
    // Refresh also supports explicitly discarding local edits when the disk
    // itself has not changed; native "accept" needs a conflict snapshot.
    if(fadePreviewContent(editor)!==snapshot.content&&fadePreviewDocument(editor)?.kind!=='conflict'){
     editor.reviewDiskSnapshot=snapshot;
     if(typeof editor.getDocument!=='function')editor.document={kind:'conflict',baseContent:document.baseContent,diskContent:snapshot.content};
    }
    if(fadePreviewDocument(editor)?.kind==='conflict')editor.resolveExternalChange('accept');
    else {editor.emitState();editor.flushDraftSnapshot?.()}
   }finally{manual=false}
   if(fadePreviewContent(editor)!==snapshot.content)throw Error('原生预览未完成更新');
   observe(snapshot);return true;
  },
  release(){if(released)return;released=true;editor.clearAutosaveTimeout?.();if(projected&&editor.options.onStateChange===projected)editor.options.onStateChange=onStateChange;for(const [name,original]of originals)if(editor[name]===wrappers.get(name)){if(original.own)editor[name]=original.value;else delete editor[name]}
   // A native unmount can save after our cleanup. Keep disk writes disabled
   // for this controller's remaining lifetime; a new owner uses nativeSaveKey.
   if(manualOnly){editor.save=async()=>false;editor.saveUntilClean=async()=>false;editor.emitState()}
  },
 };
}
async function fadeRefreshPreviewEditor(editor,isCurrent){
 if(fadePreviewDirty(editor))throw Error('有未保存编辑或待处理更改，请先保存或处理后再刷新');
 const content=fadePreviewContent(editor),revision=editor.diskReadRevision;
 const snapshot=await editor.readFile();
 if(!isCurrent())throw Error('预览已切换，请在当前文件中重试');
 if(fadePreviewDirty(editor)||fadePreviewContent(editor)!==content||editor.diskReadRevision!==revision)throw Error('读取期间编辑器内容发生变化，请重试');
 if(typeof snapshot?.content!=='string')throw Error('文件内容读取失败');
 // No asynchronous gap between the final dirty check and native application.
 editor.diskReadRevision++;
 editor.applyDiskSnapshot(snapshot,content);
 const document=typeof editor.getDocument==='function'?editor.getDocument():editor.document;
 if(document?.kind==='conflict')editor.resolveExternalChange('accept');
 else {editor.emitState();editor.flushDraftSnapshot?.()}
 if(fadePreviewContent(editor)!==snapshot.content)throw Error('原生预览未完成更新');
 return snapshot;
}
function installPreviewFreshness(doc,report){
 const win=doc.defaultView,states=new Map(),owned=new Map(),pending=new Map();let stopped=false,running=false,scanTimer=0,positionFrame=0;
 if(!win?.electronBridge?.sendMessageFromView)return ()=>{};
 win.__fadePreviewFreshnessDispose?.();
 const svg=path=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
 const lockedIcon=svg('<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>');
 const unlockedIcon=svg('<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2M12 14v3"/>');
 const staleIcon=svg('<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M12 7v6" stroke="#fff" stroke-width="2"/><circle cx="12" cy="16.5" r="1" fill="#fff" stroke="none"/>');
 const dirtyIcon=svg('<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="m8 14 6-6 2 2-6 6-3 1Z" stroke="#fff" stroke-width="1.5"/>');
 async function saveState(state){
  if(!current(state)||!state.owner)return;
  if(state.busy||state.owner.state.saving)return;
  try{const saved=await state.owner.saveNow();if(!current(state))return;
   if(!saved){if(state.owner.state.stale||state.owner.state.error)win.alert('文件已过期或无法确认磁盘版本，已阻止保存覆盖。请先复制并备份当前文档内容，再刷新文件并合并修改。');else report('文件未保存，请等待编辑完成后重试。')}
   else report('文件已保存');
  }catch(error){if(current(state))report('保存失败：'+error.message)}finally{if(current(state))render(state)}
 }
 function eventState(event){const path=event.composedPath();return [...states.values()].find(state=>current(state)&&visible(state.pane)&&(path.includes(state.pane)||state.pane.contains(doc.activeElement)||path.includes(state.bar.parentElement)))}
 function keydown(event){
  const state=eventState(event);if(!state)return;
  if((event.ctrlKey||event.metaKey)&&!event.altKey&&event.key.toLowerCase()==='s'){event.preventDefault();event.stopImmediatePropagation();void saveState(state);return}
  const close=(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='w'||event.key==='Delete'&&event.composedPath().some(el=>el?.getAttribute?.('role')==='tab');
  if(close&&!confirmClose([state])){event.preventDefault();event.stopImmediatePropagation()}
 }
 function confirmClose(list){return !list.some(state=>state.owner?.dirty)||win.confirm('文件有未保存的修改。关闭不会自动保存，请先按 Ctrl+S 保存，或复制备份内容。\n\n仍要关闭吗？')}
 function closeClick(event){
  const path=event.composedPath(),button=path.find(el=>el?.tagName==='BUTTON');if(!button)return;
  const tab=path.find(el=>el?.dataset?.fadePreviewPanel),native=path.find(el=>el?.dataset?.tabId);
  const all=button.classList.contains('fade-window-close-pane')&&button.title==='关闭所有预览';
  const closing=all||button.classList.contains('fade-gpt-close')&&tab||native&&/close|关闭/i.test(button.getAttribute('aria-label')||'');
  if(!closing)return;
  const list=[...states.values()].filter(state=>all||tab&&state.pane.closest('[data-fade-preview-panel]')?.dataset.fadePreviewPanel===tab.dataset.fadePreviewPanel||native&&state.tabId===native.dataset.tabId);
  if(!confirmClose(list)){event.preventDefault();event.stopImmediatePropagation()}
 }
 function beforeUnload(event){if([...states.values()].some(state=>state.owner?.dirty)){event.preventDefault();event.returnValue=''}}
 function receive(event){const data=event.data,entry=pending.get(data?.requestId);if(data?.type!=='fetch-response'||!entry)return;entry.finish(data.responseType==='success'&&(!data.status||data.status<400)?null:Error('文件可能已删除、移动或暂时无法读取'),data)}
 win.addEventListener('message',receive);
 function metadata(meta){return new Promise((resolve,reject)=>{
  const requestId=win.crypto.randomUUID();
  const finish=(error,data)=>{const entry=pending.get(requestId);if(!entry)return;win.clearTimeout(entry.timer);pending.delete(requestId);if(error)reject(error);else try{resolve(JSON.parse(data.bodyJsonString))}catch{reject(Error('文件状态返回格式无效'))}};
  const timer=win.setTimeout(()=>finish(Error('文件状态检查超时')),5000);pending.set(requestId,{finish,timer});
  Promise.resolve().then(()=>win.electronBridge.sendMessageFromView({type:'fetch',requestId,method:'POST',url:'vscode://codex/read-file-metadata',body:JSON.stringify({hostId:meta.hostId,path:meta.path})})).catch(finish);
 })}
 const visible=el=>el.isConnected&&!el.closest('[hidden],[aria-hidden="true"],[data-app-shell-active-page="false"]')&&el.getClientRects().length>0;
 const signature=data=>JSON.stringify([data.mtimeMs,data.sizeBytes]);
 function paint(state,message,stale=false){
  state.stale=stale;state.bar.title=message;state.bar.setAttribute('aria-label',message);state.bar.style.display=stale||state.owner?.dirty?'inline-flex':'none';
  const kind=stale?'stale':'dirty';if(state.bar.dataset.kind!==kind){state.bar.dataset.kind=kind;state.bar.innerHTML=kind==='stale'?staleIcon:dirtyIcon}const flag=String(stale);if(state.bar.dataset.stale!==flag)state.bar.dataset.stale=flag;
  state.button.disabled=state.busy||!state.target;
  state.button.title=state.busy?'正在刷新…':!state.target?'等待编辑器连接':'刷新文件预览';
  state.button.setAttribute('aria-busy',String(state.busy));state.button.dataset.stale=flag;schedulePosition();
 }
 function render(state){
  const locked=state.owner?.state.locked!==false;
  state.lock.disabled=!state.owner?.editable||state.busy||state.owner?.state.saving;
  state.lock.title=!state.owner?.editable?'当前文件只读，或编辑接口尚未就绪':locked?'已锁定 · 点击解锁编辑（Ctrl+S 保存）':'已解锁 · 点击锁定编辑（Ctrl+S 保存）';
  state.lock.setAttribute('aria-label',state.lock.title);state.lock.setAttribute('aria-pressed',String(locked));
  const lockFlag=String(locked);if(state.lock.dataset.locked!==lockFlag){state.lock.dataset.locked=lockFlag;state.lock.innerHTML=locked?lockedIcon:unlockedIcon}
  if(state.busy)return;
  const status=state.owner?.state;
  if(!state.target)paint(state,'等待原生编辑器连接…');
  else if(status?.error)paint(state,'无法读取文件 · 当前预览可能过期',true);
  else if(status?.stale)paint(state,fadePreviewDirty(state.target.editor)?'文件已更新 · 有本地编辑，刷新前需确认':'文件已更新 · 当前预览已过期',true);
  else if(state.owner?.dirty)paint(state,state.owner.state.saving?'正在保存…':'文件有未保存的修改 · Ctrl+S 保存');
  else if(status?.hint)paint(state,'正在检查文件内容…');
  else if(status)paint(state,'FCodex · 文件内容未变化');
 }
 function current(state){return !stopped&&state.pane.isConnected&&state.pane.getAttribute('data-tab-id')===state.tabId&&states.get(state.pane)===state}
 function positionButtons(){
  positionFrame=0;if(stopped)return;
  for(const state of states.values()){
   const rect=state.pane.getBoundingClientRect(),bottom=Math.min(rect.bottom,win.innerHeight),right=Math.min(rect.right,win.innerWidth);
   const show=(state.stale||state.busy)&&current(state)&&visible(state.pane)&&!doc.documentElement.hasAttribute('data-fade-nav-open')&&right-Math.max(0,rect.left)>80&&bottom-Math.max(0,rect.top)>110;
   if(state.button.hidden===show)state.button.hidden=!show;if(!show)continue;
   state.button.style.left=(right-60)+'px';state.button.style.top=(bottom-60)+'px';
  }
 }
 function schedulePosition(){if(!stopped&&!positionFrame)positionFrame=win.requestAnimationFrame(positionButtons)}
 function unbind(state){
  const editor=state.target?.editor,entry=owned.get(editor);
  if(entry){entry.users.delete(state);if(!entry.users.size){entry.owner.release();owned.delete(editor)}}
  state.target=null;state.owner=null;
 }
 function bind(state,target){
  if(state.target?.editor===target?.editor&&state.target?.query===target?.query)return;
  unbind(state);state.target=target;state.baseline=null;
  if(target?.editor){
   let entry=owned.get(target.editor);
   if(!entry){
    entry={users:new Set(),owner:null};owned.set(target.editor,entry);
    entry.owner=fadeOwnPreviewEditor(target.editor,()=>{if(!stopped){for(const user of entry.users)if(current(user))render(user)}},true);
   }
   entry.users.add(state);state.owner=entry.owner;
  }
  render(state);
 }
 async function refresh(state){
  if(state.busy||!current(state)||!visible(state.pane))return;
  bind(state,fadePreviewController(state.pane,state.meta));const target=state.target,owner=state.owner;
  if(!target){paint(state,'当前版本尚未连接安全刷新接口',true);return}
  const started=Date.now();state.busy=true;paint(state,'正在加载最新内容…',true);
  const roots=[state.pane,...[...state.pane.querySelectorAll('diffs-container')].map(el=>el.shadowRoot).filter(Boolean)];
  const scrolls=roots.flatMap(root=>[root,...root.querySelectorAll('*')]).filter(el=>el.scrollTop||el.scrollLeft).map(el=>[el,el.scrollTop,el.scrollLeft]);
  try{
   let applied=true;
   if(owner)applied=await owner.refresh(()=>current(state)&&visible(state.pane)&&fadePreviewController(state.pane,state.meta)?.editor===target.editor,()=>win.confirm('文件中有尚未保存的本地编辑。刷新会放弃这些编辑并加载磁盘上的内容。请先复制保留需要的内容。\n\n是否放弃本地编辑并刷新？'));
   else await target.query.fetch(undefined,{cancelRefetch:false});
   await new Promise(resolve=>win.setTimeout(resolve,Math.max(0,400-(Date.now()-started))));
   if(!current(state))return;
   state.busy=false;if(!applied){render(state);return}
   state.baseline=null;if(owner)render(state);else paint(state,'FCodex · 已刷新');
   win.requestAnimationFrame(()=>{if(current(state)&&visible(state.pane))for(const [el,top,left]of scrolls)if(el.isConnected){el.scrollTop=top;el.scrollLeft=left}});
  }catch(error){if(current(state)){state.busy=false;paint(state,error.message||'刷新失败，保留原有内容',true);report('预览刷新失败：'+(error.message||'请重试'))}}
  finally{state.busy=false}
 }
 function mount(pane,meta){
  const header=pane.querySelector('[data-fade-viewer-header],[data-testid="viewer-header"]');if(!header)return null;
  const bar=doc.createElement('span'),button=doc.createElement('button'),lock=doc.createElement('button'),lockGroup=doc.createElement('div');
  lock.type='button';lock.className='fade-preview-lock';lockGroup.className='fade-file-heading fade-preview-edit-actions';lockGroup.append(lock);
  bar.className='fade-preview-freshness fade-tab-status fade-tab-status-reply';bar.setAttribute('role','img');
  bar.style.display='none';
  // Same 24-unit circle, rounded white mark and 13px status slot as chat tabs.
  bar.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M12 7v6" stroke="#fff" stroke-width="2"/><circle cx="12" cy="16.5" r="1" fill="#fff" stroke="none"/></svg>';
  button.type='button';button.className='fade-preview-refresh';button.hidden=true;button.setAttribute('aria-label','刷新文件预览');
  button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 6.1A8 8 0 0 1 19.7 10M4.3 14A8 8 0 0 0 17.9 17.9"/></svg>';
  const state={pane,meta,header,bar,button,lock,lockGroup,tabId:pane.getAttribute('data-tab-id'),baseline:null,busy:false,target:null,owner:null};
  lock.addEventListener('click',event=>{event.stopPropagation();if(state.owner?.editable)void state.owner.setLocked(!state.owner.state.locked)});
  button.addEventListener('click',event=>{event.stopPropagation();void refresh(state)});doc.body.append(button);states.set(pane,state);resize?.observe(pane);render(state);return state;
 }
 function attachBadge(state){
  const key=state.pane.closest('[data-fade-preview-panel]')?.dataset.fadePreviewPanel;
  const tabRoot=doc.getElementById('fade-codex-layer')?.shadowRoot;
  // Native tabs remain mounted behind the unified strip. Prefer the visible
  // FCodex tab before considering the native aria-controls association.
  let tab=key&&[...(tabRoot?.querySelectorAll('.fade-gpt-tab[data-fade-preview-panel]')??[])].find(el=>el.dataset.fadePreviewPanel===key);
  if(!tab&&state.pane.id)tab=[...doc.querySelectorAll('[role="tab"][aria-controls]')].find(el=>el.getAttribute('aria-controls')===state.pane.id);
  const actions=state.header.querySelector('.fade-file-heading:not(.fade-preview-edit-actions)')??state.lockGroup;
  if(actions===state.lockGroup&&!state.lockGroup.isConnected)(state.header.querySelector('[data-fade-header-trailing]')??state.header).append(state.lockGroup);
  if(state.lock.parentNode!==actions)actions.append(state.lock);
  const slot=tab?.querySelector('.fade-gpt-select')??tab;
  if(slot&&state.bar.parentNode!==slot)slot.append(state.bar);
 }
 function scan(){
  if(stopped)return;
  for(const [pane,state]of states)if(!current(state)||!state.button.isConnected){unbind(state);resize?.unobserve(pane);state.bar.remove();state.button.remove();state.lock.remove();state.lockGroup.remove();states.delete(pane)}
  for(const pane of doc.querySelectorAll('[data-tab-id^="text-editor:"],[data-tab-id^="file:"]')){
   const meta=fadeFileTabMetadata(pane.getAttribute('data-tab-id'));if(!meta||!fadeAbsoluteFile(meta))continue;
   const state=states.get(pane)||mount(pane,meta);if(state&&!state.busy)bind(state,fadePreviewController(pane,meta));
  }
  for(const state of states.values())attachBadge(state);
  schedulePosition();
 }
 function scheduleScan(){if(!stopped&&!scanTimer)scanTimer=win.setTimeout(()=>{scanTimer=0;scan();void poll()},100)}
 async function poll(){
  if(stopped||running||doc.hidden)return;running=true;
  try{
   for(const state of states.values()){
    if(stopped)break;
    if(!current(state)||!visible(state.pane)||state.busy||!state.target)continue;
    const target=state.target,owner=state.owner;
    try{
     // Periodic content reads catch atomic replacements preserving timestamps.
     if(owner&&(owner.state.hint||Date.now()-owner.state.lastCheck>=12000))await owner.check();
     else {
      const data=await metadata(state.meta);if(!current(state)||state.busy||state.target!==target)continue;
      if(data.isFile===false||data.mtimeMs==null)throw Error('文件已移动、删除或状态不可用');
      if(owner){if(data.mtimeMs!==owner.state.snapshot?.mtimeMs||data.sizeBytes!==owner.state.snapshot?.sizeBytes)await owner.check()}
      else{
       const version=target.query.state.dataUpdatedAt;
       if(!state.baseline||state.baseline.version!==version)state.baseline={version,signature:signature(data)};
       const stale=state.baseline.signature!==signature(data)||(state.meta.hostId==='local'&&data.mtimeMs>version);
       paint(state,stale?'文件已更新 · 当前预览可能过期':'FCodex · 文件未检测到更新',stale);
      }
     }
     if(current(state)&&!state.busy&&state.owner===owner&&owner)render(state);
    }catch(error){if(current(state)&&!state.busy){if(owner){owner.state.error=error;owner.state.hint=true}paint(state,error.message,true)}}
   }
  }finally{running=false}
 }
 const resize=win.ResizeObserver?new win.ResizeObserver(schedulePosition):null;
 const observer=new win.MutationObserver(scheduleScan);observer.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-tab-id','hidden','data-app-shell-active-page']});
 const tabRoot=doc.getElementById('fade-codex-layer')?.shadowRoot;if(tabRoot)observer.observe(tabRoot,{subtree:true,childList:true});
 const rootObserver=new win.MutationObserver(schedulePosition);rootObserver.observe(doc.documentElement,{attributes:true,attributeFilter:['data-fade-nav-open']});
 win.addEventListener('keydown',keydown,true);win.addEventListener('click',closeClick,true);win.addEventListener('beforeunload',beforeUnload);
 win.addEventListener('resize',schedulePosition);doc.addEventListener('scroll',schedulePosition,true);
 const timer=win.setInterval(()=>{scan();void poll()},4000),wake=()=>{scan();void poll()};win.addEventListener('focus',wake);doc.addEventListener('visibilitychange',wake);scan();void poll();
 function dispose(){
  if(stopped)return;stopped=true;win.removeEventListener('keydown',keydown,true);win.removeEventListener('click',closeClick,true);win.removeEventListener('beforeunload',beforeUnload);observer.disconnect();rootObserver.disconnect();resize?.disconnect();win.cancelAnimationFrame(positionFrame);win.clearTimeout(scanTimer);win.clearInterval(timer);win.removeEventListener('focus',wake);doc.removeEventListener('visibilitychange',wake);win.removeEventListener('message',receive);win.removeEventListener('resize',schedulePosition);doc.removeEventListener('scroll',schedulePosition,true);
  for(const entry of [...pending.values()])entry.finish(Error('Disposed'));for(const state of states.values()){unbind(state);state.bar.remove();state.button.remove();state.lock.remove();state.lockGroup.remove()}states.clear();
  if(win.__fadePreviewFreshnessDispose===dispose)delete win.__fadePreviewFreshnessDispose;
 }
 win.__fadePreviewFreshnessDispose=dispose;return dispose;
}
