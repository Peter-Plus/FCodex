// Keep the native tab renderer beneath its original providers. Only React portals
// cross the visual boundary; no React-owned DOM is manually reparented.
export function patchWindowPreview(source,bindings={},cacheSize=69,useMountedTabs=false){
 const native=text=>text.replace(/[A-Za-z_$][\w$]*/g,name=>bindings[name]??name);
 const needle=native(`mYi=(0,dYi.memo)(function(e){let t=(0,uYi.c)(${cacheSize})`);
 if(source.split(needle).length!==2)throw Error('Unsupported native preview tab renderer');
 source=source.replace(needle,native(`mYi=fadeNativePreviewTab,fadeOriginalNativeTab=(0,dYi.memo)(function(e){let t=(0,uYi.c)(${cacheSize})`));
 const host=native('function oYi(e){let t=(0,uYi.c)(84)');
 if(source.split(host).length!==2)throw Error('Unsupported native preview tab controller');
 source=source.replace(host,native('function oYi(e){fadeObservePreviewController(e.controller);let t=(0,uYi.c)(84)'));
 return source+native(`\nvar fadeOriginalNativeTab;
function fadePreviewSubscribe(fn){window.addEventListener('fade-window-mode',fn);window.addEventListener('fade-preview-state',fn);return()=>{window.removeEventListener('fade-window-mode',fn);window.removeEventListener('fade-preview-state',fn)}}
function fadeObservePreviewController(controller){
 const scope=hi(Qy),snapshot=window.__fadeCapturePreviewScope(),tabs=q(controller.tabs$),active=q(controller.activeTab$),bridge=window.__fadePreviewBridge,layoutContext=(0,dYi.useContext)(Lk);
 const mode=(0,dYi.useSyncExternalStore)(fadePreviewSubscribe,()=>!!window.__fadeWindowModeEnabled);
 const enabled=mode&&!!bridge&&controller.panelId==='right';
 (0,dYi.useLayoutEffect)(()=>{if(enabled)bridge.reconcile(scope,tabs,controller,active?.tabId,layoutContext,snapshot)},[enabled,bridge,scope,tabs,controller,active?.tabId,layoutContext,snapshot]);
}
function fadeNativePreviewTab(props){
 const enabled=(0,dYi.useSyncExternalStore)(fadePreviewSubscribe,()=>!!window.__fadeWindowModeEnabled&&!!window.__fadePreviewBridge);
 return enabled&&props.controller.panelId==='right'&&!props.tab.isWorkspaceHome${useMountedTabs?'':'&&!props.preparing'}?null:(0,dV.jsx)(fadeOriginalNativeTab,props);
}
 function fadePreviewScopeGroup({scope,controller,layoutContext,snapshot,bridge}){
 const tabs=q(controller.tabs$),active=q(controller.activeTab$);
 ${useMountedTabs?'const mounted=q(controller.mountedTabs$),prepared=q(controller.preparedReplacement$),preparedKey=q(controller.preparedReplacementReactKey$);':''}
 (0,dYi.useLayoutEffect)(()=>bridge.reconcile(scope,tabs,controller,active?.tabId,layoutContext,snapshot),[scope,tabs,controller,active?.tabId,layoutContext,snapshot,bridge]);
 return ${useMountedTabs?'[...mounted,...(prepared?[{tab:prepared,reactKey:preparedKey,preparing:true}]:[])].filter(({tab})=>!tab.isWorkspaceHome).map(({tab,reactKey,preparing})':'tabs.filter(tab=>!tab.isWorkspaceHome).map(tab'}=>{const id=bridge.key(scope,tab.tabId),selected=bridge.active===id;
 return (0,fYi.createPortal)((0,dV.jsx)(Lk.Provider,{value:layoutContext,children:(0,dV.jsx)(fadeOriginalNativeTab,{controller,tab,${useMountedTabs?'preparing,':''}hidden:!selected,isActive:selected,isVisible:selected,isSplit:true,primary:false,hasExternalTab:false,divider:null,widthRatio:1})}),bridge.mount(id),${useMountedTabs?'reactKey':'id'})});
}
function fadePreviewRoot(){
 hYi();const bridge=window.__fadePreviewBridge,renderer=(0,dYi.useRef)({}).current,enabled=!!window.__fadeWindowModeEnabled&&!!bridge&&!!window.__fadeNativeScopeSnapshot;
 (0,dYi.useSyncExternalStore)(fadePreviewSubscribe,()=>String(!!window.__fadeWindowModeEnabled)+':'+(window.__fadePreviewBridge?.revision??0));
 (0,dYi.useLayoutEffect)(()=>{if(enabled)return bridge.registerRenderer(renderer)},[enabled,bridge,renderer]);
 if(!enabled||!bridge.ownsRenderer(renderer))return null;
 return bridge.groups.map(group=>(0,dV.jsx)(window.__fadeNativeScopeSnapshot,{snapshot:group.snapshot,children:(0,dV.jsx)(fadePreviewScopeGroup,{scope:group.scope,controller:group.items[0].controller,layoutContext:group.items[0].layoutContext,snapshot:group.snapshot,bridge})},bridge.key(group.scope,'scope')));
}
window.__fadePreviewRoot=fadePreviewRoot;
window.__fadePreviewHostSupported=true;window.__fadePreviewHostVersion=3;\n`);
}

export function patchPreviewScope(source,bindings={}){
 const native=text=>text.replace(/[A-Za-z_$][\w$]*/g,name=>bindings[name]??name);
 const anchor=native('function mW(e){let t=vW.get(e);');
 if(source.split(anchor).length!==2||!source.includes(native('function OXe({children:e,scope:t,value:n})')))throw Error('Unsupported native scope provider');
 return source+native(`\nfunction fadeCapturePreviewScope(){
  const chain=(0,CW.useContext)(gW),queryClient=(0,CW.useContext)(_W);
  return (0,CW.useMemo)(()=>({chain,queryClient}),[chain,queryClient]);
 }
 function fadeNativeScopeSnapshot({snapshot,children}){
  // RouteScope's own context omits descendants such as ComposerScope. Capture
  // the complete ambient chain, and replay native providers in ancestry order
  // so their retained entries stay alive while the source Activity is hidden.
  const {chain,queryClient}=snapshot;
  const depth=node=>{let n=0;for(let p=node.token.parent;p;p=p.parent)n++;return n};
  const nodes=[...chain.values()].sort((a,b)=>depth(a)-depth(b));
  let child=children;
  for(const node of nodes.reverse())if(node.token.parent)child=(0,wW.jsx)(OXe,{scope:node.token,value:node.value,children:child});
  for(const node of chain.values())if(!node.token.parent)child=(0,wW.jsx)(mW(node.token).Provider,{value:chain,children:child});
  return (0,wW.jsx)(_W.Provider,{value:queryClient,children:(0,wW.jsx)(gW.Provider,{value:chain,children:child})});
 }
 window.__fadeCapturePreviewScope=fadeCapturePreviewScope;
 window.__fadeNativeScopeSnapshot=fadeNativeScopeSnapshot;\n`);
}
