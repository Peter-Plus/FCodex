// Codex 26.1021 moved the preview renderer from app-initial to app-primary.
// Every edit still requires exactly one matching semantic anchor.
import {patchWindowPreview} from './window-preview-patch.mjs';
export const currentArchiveHash='5bd1f1afeb64772e9dd2bb20c1d7aee48591e8b5ea15e626c936abcfda7cb785';
export const scopeBindings={mW:'QK',vW:'o1e',OXe:'d1e',CW:'$K',gW:'i1e',_W:'a1e',wW:'rq'};
function once(source,from,to){if(source.split(from).length!==2)throw Error('Codex 26.1021 patch mismatch: '+from.slice(0,120));return source.replace(from,to)}
export function patchEditor261021(source){
 source=once(source,'let[Ft,It]=(0,Q.useState)(Pt)','fadeRefreshEditorView(F,M,L.fileRevision,L.file!=null);let[Ft,It]=(0,Q.useState)(Pt)');
 // Portals can reveal the native virtual editor after its first measurement.
 // Wait for native effects and layout, then redraw the same editor instance.
 return source+`\nfunction fadeRefreshEditorView(ref,active,revision,ready){
 (0,Q.useLayoutEffect)(()=>{
  if(!active||!ready||!window.__fadeWindowModeEnabled)return;
  let frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{const view=ref.current?.getInstance(),container=view?.getContainerElement();if(container?.isConnected&&container.getClientRects().length)view.render(true)})});
  return()=>cancelAnimationFrame(frame);
 },[active,revision,ready]);
 }\n`;
}
export function patchInitial261021(source){
 const replace=(a,b)=>{source=once(source,a,b)};
 replace('function ZBt(e,t){t!==`codex`&&qBt(e,t),TBt(e,t===`codex`?Wzt:Uzt)}','function ZBt(e,t){}');
 replace('var eVt,tVt,nVt,','var fadeStudyChat,fadeStudyProduct,eVt,tVt,nVt,');
 replace('eVt=`home-composer-mode-v1`,','fadeStudyChat=W(V,({get:e})=>{let t=e(Ak);return t?.state?.fadeChat===!0||t!=null&&Hx(t).routeKind===`chatgpt-thread`}),fadeStudyProduct=W(V,({get:e})=>e(fadeStudyChat)?`work`:`codex`),eVt=`home-composer-mode-v1`,');
 replace('sVt=W(V,({get:e})=>e(oVt,void 0))','sVt=W(V,({get:e})=>e(fadeStudyChat)?`chat`:e(oVt,void 0))');
 replace('homeDraftKey:s?`locked-project:${a.accountId}:${a.userId}:${a.projectId}`:void 0','homeDraftKey:c.state?.fadeDraftKey??c.state?.fadePaneHome??(s?`locked-project:${a.accountId}:${a.userId}:${a.projectId}`:void 0)');
 replace('fx=Br(V,()=>null)','fx=Br(V,()=>({detailLevel:`STEPS_COMMANDS`}))');
 replace('JV=W(V,({get:e})=>{let t=Rne(e,zi.conversationDetailMode),n=e(sai)?.roles;return t==null&&n!=null&&fai({backendRole:n.length===0?e(Nii).data?.role??null:null,localRoles:n})===`non_coding`||e(jBt)===`STEPS_PROSE`?`work`:`codex`})','JV=W(V,()=>`codex`)');
 const start=source.indexOf('function TBt(e,t){'),end=source.indexOf('function EBt()',start);
 if(start<0||end<0)throw Error('Codex 26.1021 product preference action missing');
 source=source.slice(0,start)+'function TBt(e,t){return Promise.resolve()}'+source.slice(end);
 const at=source.lastIndexOf('export{');if(at<0)throw Error('Missing native exports');
 return source.slice(0,at)+`
function fadePageIsChat(location){return location?.state?.fadeChat===true||location!=null&&Hx(location).routeKind==='chatgpt-thread'}
function fadeUsePageProduct(){return fadePageIsChat(Gn())?'work':'codex'}
function fadeUsePageComposerMode(){const location=Gn(),fallback=Ua(oVt,void 0);return fadePageIsChat(location)?'chat':fallback}
window.__fadePaneHomeVersion=1;
var fadeNativeCompat={get DYn(){return tgr},get VZn(){return RP},get mZn(){return NP},get VQn(){return zN},get GMr(){return q_},get YMr(){return Av},get YQn(){return IN},get SZn(){return AP},get kZn(){return IP},get zYt(){return F4a},get ZQn(){return jN},get Jan(){return sea},get qMr(){return Nv},get KMr(){return Pv},get Don(){return _K},get J4n(){return mM},get mon(){return K7i},get U4n(){return hM},get aon(){return J7i},get hon(){return $7i},get oIr(){return iy}};
`+source.slice(at).replace('export{','export{fadeNativeCompat,V as fadeNativeAppScope,fx as fadeStudyPreference,fadeStudyProduct,fadeStudyChat,fadeUsePageProduct,fadeUsePageComposerMode,');
}

export function patchPrimary261021(source){
 const replace=(a,b)=>{source=once(source,a,b)};
 replace('yWt as BD','fadeUsePageProduct,fadeUsePageComposerMode,fadeStudyProduct as BD');
 replace('let r=Z(bx,n),i=X(BD);if(_n().pathname','let r=Z(bx,n),i=fadeUsePageProduct();if(_n().pathname');
 replace('c=Jd(q),l=X(fI),u=X(bg)','c=Jd(q),l=X(fI),u=fadeUsePageComposerMode()');
 replace('{routeProjectId:n,workspaceAgent:r}=e,i=Jd(B_),a=X(bg),o;','{routeProjectId:n,workspaceAgent:r}=e,i=Jd(B_),a=fadeUsePageComposerMode(),o;');
 replace('let e=pe?i.get(qve)??`chat`:le??i.get(bg);i.get(xMe)&&(e=i.get(bg))','let e=pe?i.get(qve)??`chat`:le??a;i.get(xMe)&&(e=a)');
 replace('function VIr(e){let t=(0,qIr.c)(78)','function VIr(e){return (0,b3.jsxs)(b3.Fragment,{children:[(0,b3.jsx)(fadeOriginalRetainedPages,e),(0,b3.jsx)(window.__fadePreviewRoot,{})]})}function fadeOriginalRetainedPages(e){let t=(0,qIr.c)(79)');
 replace('function GIr(e){let t=(0,qIr.c)(35),{view:n,active:r}=e,i=r?`visible`:`hidden`,a;','function GIr(e){let t=(0,qIr.c)(36),{view:n,active:r}=e;const fadeSlot=(0,y3.useSyncExternalStore)(fadePaneSubscribe,()=>fadePaneSlot(n));let i=(fadeSlot?fadeSlot!==`hidden`:r)?`visible`:`hidden`,a;');
 replace('JSON.stringify(w==null?[y,i.routeKind','JSON.stringify(fadePaneDraft(x)!=null?[`fade-draft`,fadePaneDraft(x)]:w==null?[y,i.routeKind');
 replace('t[34]!==E||t[35]!==d){let e=RTe(T)','t[34]!==E||t[35]!==d||t[78]!==fadePaneDraft(x)){let e=RTe(T)');
 replace('t[45]=I,t[46]=L}else D=t[36]','t[45]=I,t[46]=L,t[78]=fadePaneDraft(x)}else D=t[36]');
 replace('"data-app-shell-active-page":r,children:c','"data-app-shell-active-page":r,"data-fade-page-key":fadePaneKey(n),children:c');
 replace('t[14]!==r||t[15]!==c?','t[14]!==r||t[15]!==c||window.__fadePaneRevision!==t[35]?');
 replace('t[14]=r,t[15]=c,t[16]=l','t[14]=r,t[15]=c,t[16]=l,t[35]=window.__fadePaneRevision');
 replace('return!(e.destinationId==null?t!=null||o&&e.retainAfterVisit:','return!(fadePaneRetain(e)||e.destinationId==null?t!=null||o&&e.retainAfterVisit||fadePaneRetain(e):');
 replace('h=d.filter(e=>e.key===n.key||u(e)||','h=d.filter(e=>fadePaneRetain(e)||e.key===n.key||u(e)||');
 replace('onExpire:()=>p(t=>t.current.key===e.key?t:','onExpire:()=>p(t=>t.current.key===e.key||fadePaneRetain(e)?t:');
 source+=`
function fadePaneDraft(location){return location?.location?.state?.fadeDraftKey??location?.location?.state?.fadePaneHome}
function fadePaneKey(view){const loc=view.location?.location;return fadePaneDraft(view.location)||loc?.pathname||''}
function fadePaneSubscribe(fn){window.addEventListener('fade-pane-layout',fn);return()=>window.removeEventListener('fade-pane-layout',fn)}
function fadePaneSlot(view){return window.__fadePaneSlots?.[fadePaneKey(view)]||''}
function fadePaneRetain(view){return !!window.__fadePaneSlots?.[fadePaneKey(view)]}
window.__fadePaneHostSupported=true;window.__fadePaneHostVersion=2;
`;
 source+='\nvar fadeNativePrimaryCompat={mW:W9n,cY:FX,gW:V9n,$U:ver,vW:E9n};export{fadeNativePrimaryCompat};\n';
 // New native editors share panel resources. Render only the native mounted
 // instances, with their keys; mounting every open tab destroys shared editors
 // when a background panel is suspended.
 return patchWindowPreview(source,{mYi:'lCt',dYi:'hM',uYi:'oCt',oYi:'nCt',hi:'Jd',Qy:'Jp',q:'X',Lk:'kx',dV:'gM',fYi:'sCt',hYi:'uCt'},61,true);
}
