// Exact, version-gated changes to React's existing retained-page host. No DOM reparenting.
export function patchWindowModePages(source){
 const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('Unsupported window-mode page host: '+a.slice(0,80));source=source.replace(a,b)};
 replace('function Xgt(e){let t=(0,r$.c)(35),{view:n,active:r}=e,i=r?`visible`:`hidden`,a;',
  'function Xgt(e){let t=(0,r$.c)(36),{view:n,active:r}=e;const fadeSlot=(0,a$.useSyncExternalStore)(fadePaneSubscribe,()=>fadePaneSlot(n));let i=(fadeSlot?fadeSlot!==`hidden`:r)?`visible`:`hidden`,a;');
 replace('JSON.stringify(S==null?[_,i.routeKind', 'JSON.stringify(S==null?[y.location.state?.fadePaneHome??y.location.state?.fadeDraftKey??_,i.routeKind');
 replace('"data-app-shell-active-page":r,children:c','"data-app-shell-active-page":r,"data-fade-page-key":fadePaneKey(n),children:c');
 // The compiled memo cache must include the layout revision, not just native activity.
 replace('t[14]!==r||t[15]!==c?', 't[14]!==r||t[15]!==c||window.__fadePaneRevision!==t[35]?');
 replace('t[14]=r,t[15]=c,t[16]=l','t[14]=r,t[15]=c,t[16]=l,t[35]=window.__fadePaneRevision');
 replace('return(e.destinationId==null?t!=null||o&&e.retainAfterVisit:', 'return(fadePaneRetain(e)||e.destinationId==null?t!=null||o&&e.retainAfterVisit||fadePaneRetain(e):');
 replace('p=d.filter(e=>a==null&&!e.countsTowardConversationLimit||f.has(e.key))','p=d.filter(e=>fadePaneRetain(e)||a==null&&!e.countsTowardConversationLimit||f.has(e.key))');
 replace('onExpire:()=>l(t=>t.current.key===e.key?t:', 'onExpire:()=>l(t=>t.current.key===e.key||fadePaneRetain(e)?t:');
 return source+`\nfunction fadePaneKey(view){const loc=view.location?.location;return loc?.state?.fadeDraftKey||loc?.state?.fadePaneHome||loc?.pathname||''}
function fadePaneSubscribe(fn){window.addEventListener('fade-pane-layout',fn);return()=>window.removeEventListener('fade-pane-layout',fn)}
function fadePaneSlot(view){return window.__fadePaneSlots?.[fadePaneKey(view)]||''}
function fadePaneRetain(view){return !!window.__fadePaneSlots?.[fadePaneKey(view)]}
window.__fadePaneHostSupported=true;\n`;
}
