// One presentation area per OS window. Native controllers retain tab state and scope.
function installWindowPreview({changed}){
 const records=new Map(),scopeIds=new WeakMap(),scopeTabs=new Map(),renderers=new Set();let serial=0,active=null,revision=0,disposed=false;
 const body=document.createElement('aside');body.dataset.fadeUnifiedPreview='';body.hidden=true;body.setAttribute('aria-label','预览器');document.body.append(body);
 const notify=()=>{revision++;window.dispatchEvent(new Event('fade-preview-state'));changed()};
 const identity=scope=>scope.node??scope;
 const key=(scope,id)=>{const owner=identity(scope);if(!scopeIds.has(owner))scopeIds.set(owner,++serial);return scopeIds.get(owner)+':'+id};
 function select(id,invoke=true){const item=records.get(id);if(!item)return;if(active!==id){active=id;for(const [key,item] of records)item.mount.hidden=key!==active;notify()}if(invoke)item.activate()}
 const bridge={
  get revision(){return revision},get active(){return active},key,
  // Keep one renderer even during StrictMode registration and mode transitions.
  ownsRenderer(token){return !disposed&&renderers.values().next().value===token},
  registerRenderer(token){if(disposed)return()=>{};const previous=renderers.values().next().value;renderers.add(token);if(previous!==renderers.values().next().value)notify();return()=>{const owned=this.ownsRenderer(token);renderers.delete(token);if(!disposed&&owned)notify()}},
  retainsPath(path){return [...scopeTabs.values()].some(({scope,ids})=>ids.size&&scope.value?.pathname===path)},
  get groups(){return [...scopeTabs.values()].filter(({ids})=>ids.size).map(({scope,snapshot,ids})=>({scope,snapshot,items:[...ids].map(id=>records.get(id)).filter(Boolean)}))},
  mount(id){let item=records.get(id);if(item)return item.mount;const mount=document.createElement('div');mount.className='fade-preview-native-host';mount.hidden=true;body.append(mount);records.set(id,{id,mount,title:'预览',activate(){},close(){}});return mount},
  update(id,data){if(disposed)return;const item=records.get(id);if(!item)return;const different=item.title!==data.title||item.tab!==data.tab||!item.ready;Object.assign(item,data,{ready:true});if(active===null||data.reveal)select(id,false);else if(different)notify()},
  remove(id){const item=records.get(id);if(!item)return;item.mount.remove();records.delete(id);if(active===id){active=null;const next=[...records.values()].find(v=>v.ready);if(next)select(next.id,false)}notify()},
  select,
  reconcile(scope,tabs,controller,activeId,layoutContext,snapshot){const owner=identity(scope),saved=scopeTabs.get(owner),previous=saved?.ids??new Set(),contextChanged=snapshot&&snapshot!==saved?.snapshot;scope=saved?.scope??scope;const next=new Set(tabs.filter(t=>!t.isWorkspaceHome).map(t=>key(scope,t.tabId)));scopeTabs.set(owner,{scope,snapshot:snapshot??saved?.snapshot,ids:next});for(const tab of tabs){if(tab.isWorkspaceHome)continue;const id=key(scope,tab.tabId);this.mount(id);const old=records.get(id),selected=tab.tabId===activeId;this.update(id,{tab,controller,layoutContext,title:typeof tab.title==='string'?tab.title:tab.tabId,reveal:selected&&!old.nativeActive,nativeActive:selected,activate:()=>controller.activateTab(scope,tab.tabId),close:()=>controller.closeTab(scope,tab.tabId)});if(tab.isPreview)controller.pinTab(scope,tab.tabId)}for(const id of previous)if(!next.has(id))this.remove(id);if(!next.size)scopeTabs.delete(owner);else if(contextChanged)notify()},
  release(scope){const owner=identity(scope),ids=scopeTabs.get(owner)?.ids;scopeTabs.delete(owner);for(const id of ids??[])this.remove(id)},
 };
 window.__fadePreviewBridge=bridge;
 return {
  get tabs(){return [...records.values()].filter(v=>v.ready)},get active(){return active},body,
  select,close(id){records.get(id)?.close()},closeAll(){for(const item of [...records.values()])if(item.ready)item.close()},
  reset(){records.clear();scopeTabs.clear();active=null;body.replaceChildren();notify()},
  layout(enabled,left,width){const hidden=!enabled||!this.tabs.length;if(body.hidden!==hidden)body.hidden=hidden;if(!hidden){if(body.style.left!==left+'px')body.style.left=left+'px';if(body.style.width!==width+'px')body.style.width=width+'px'}},
  destroy(){disposed=true;renderers.clear();if(window.__fadePreviewBridge===bridge)delete window.__fadePreviewBridge;window.dispatchEvent(new Event('fade-preview-state'));body.remove();records.clear();scopeTabs.clear()}
 };
}
