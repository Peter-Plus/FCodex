// Exact, version-gated changes to React's existing retained-page host. No DOM reparenting.
export function assertWindowModeAsset(source){
 for(const hook of ['window.__fadePaneHostSupported=true','window.__fadePaneHostVersion=2','useSyncExternalStore)(fadePaneSubscribe','"data-fade-page-key":fadePaneKey(n)','t.current.key===e.key||fadePaneRetain(e)?t:','children:[(0,o$.jsx)(fadeOriginalRetainedPages,e),(0,o$.jsx)(window.__fadePreviewRoot,{})]']){
  if(!source.includes(hook))throw Error('Final asset lost window-mode patch: '+hook);
 }
}
export function patchWindowModePages(source){
 const replace=(a,b)=>{if(source.split(a).length!==2)throw Error('Unsupported window-mode page host: '+a.slice(0,80));source=source.replace(a,b)};
 // The preview is a sibling of the entire page cache, never a child of a
 // focus-dependent workspace/Activity. Switching chats cannot transfer it.
 replace('function Kgt(e){let t=(0,r$.c)(70)',
  'function Kgt(e){return (0,o$.jsxs)(o$.Fragment,{children:[(0,o$.jsx)(fadeOriginalRetainedPages,e),(0,o$.jsx)(window.__fadePreviewRoot,{})]})}function fadeOriginalRetainedPages(e){let t=(0,r$.c)(71)');
 replace('function Xgt(e){let t=(0,r$.c)(35),{view:n,active:r}=e,i=r?`visible`:`hidden`,a;',
  'function Xgt(e){let t=(0,r$.c)(36),{view:n,active:r}=e;const fadeSlot=(0,a$.useSyncExternalStore)(fadePaneSubscribe,()=>fadePaneSlot(n));let i=(fadeSlot?fadeSlot!==`hidden`:r)?`visible`:`hidden`,a;');
 // Built-in home destinations use the OTHER native cache-key branch. Draft
 // identity must take precedence over both branches, and invalidate the compiler
 // memo even when pathname, route object and destination are otherwise unchanged.
 replace('JSON.stringify(S==null?[_,i.routeKind', 'JSON.stringify(fadePaneDraft(y)!=null?[`fade-draft`,fadePaneDraft(y)]:S==null?[_,i.routeKind');
 replace('t[31]!==w||t[32]!==d){let e=XOe(C)', 't[31]!==w||t[32]!==d||t[70]!==fadePaneDraft(y)){let e=XOe(C)');
 replace('t[41]=N,t[42]=P}else T=t[33]', 't[41]=N,t[42]=P,t[70]=fadePaneDraft(y)}else T=t[33]');
 replace('"data-app-shell-active-page":r,children:c','"data-app-shell-active-page":r,"data-fade-page-key":fadePaneKey(n),children:c');
 // The compiled memo cache must include the layout revision, not just native activity.
 replace('t[14]!==r||t[15]!==c?', 't[14]!==r||t[15]!==c||window.__fadePaneRevision!==t[35]?');
 replace('t[14]=r,t[15]=c,t[16]=l','t[14]=r,t[15]=c,t[16]=l,t[35]=window.__fadePaneRevision');
 replace('return(e.destinationId==null?t!=null||o&&e.retainAfterVisit:', 'return(fadePaneRetain(e)||e.destinationId==null?t!=null||o&&e.retainAfterVisit||fadePaneRetain(e):');
 replace('p=d.filter(e=>a==null&&!e.countsTowardConversationLimit||f.has(e.key))','p=d.filter(e=>fadePaneRetain(e)||a==null&&!e.countsTowardConversationLimit||f.has(e.key))');
 replace('onExpire:()=>l(t=>t.current.key===e.key?t:', 'onExpire:()=>l(t=>t.current.key===e.key||fadePaneRetain(e)?t:');
 return source+`\nfunction fadePaneDraft(location){return location?.location?.state?.fadeDraftKey??location?.location?.state?.fadePaneHome}
function fadePaneKey(view){const loc=view.location?.location;return fadePaneDraft(view.location)||loc?.pathname||''}
function fadePaneSubscribe(fn){window.addEventListener('fade-pane-layout',fn);return()=>window.removeEventListener('fade-pane-layout',fn)}
function fadePaneSlot(view){return window.__fadePaneSlots?.[fadePaneKey(view)]||''}
function fadePaneRetain(view){return !!window.__fadePaneSlots?.[fadePaneKey(view)]}
window.__fadePaneHostSupported=true;window.__fadePaneHostVersion=2;\n`;
}
