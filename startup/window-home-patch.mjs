// Home content must use the retained page's router context. The application
// atoms still describe the current navigation for global shell controls.
export const pageHomeHooks=`
function fadePageIsChat(location){return location?.state?.fadeChat===true||location!=null&&Zy(location).routeKind==='chatgpt-thread'}
function fadeUsePageProduct(){return fadePageIsChat(ru())?'work':'codex'}
function fadeUsePageComposerMode(){const location=ru(),fallback=Eu(Tqt,void 0);return fadePageIsChat(location)?'chat':fallback}
window.__fadePaneHomeVersion=1;
`;

export function patchPageHomeHooks(source){
 if(source.includes('function fadePageIsChat('))throw Error('Page home hooks already installed');
 const at=source.lastIndexOf('export{');if(at<0)throw Error('Missing native exports');
 return source.slice(0,at)+pageHomeHooks+source.slice(at).replace('export{','export{fadeUsePageProduct,fadeUsePageComposerMode,');
}

export function patchPageHomeConsumers(source){
 const replace=(from,to)=>{if(source.split(from).length!==2)throw Error('Unsupported page home hook: '+from);source=source.replace(from,to)};
 replace('fadeStudyProduct as Yy','fadeUsePageProduct,fadeUsePageComposerMode,fadeStudyProduct as Yy');
 replace('let r=$(cy,n),i=X(Yy);if(cf().pathname', 'let r=$(cy,n),i=fadeUsePageProduct();if(cf().pathname');
 replace('function MQ(e){let t=(0,NQ.c)(3),n=X(Yy),r;', 'function MQ(e){let t=(0,NQ.c)(3),n=fadeUsePageProduct(),r;');
 replace('s=qt(K),c=X(TF),l=X(sT),u=sO()', 's=qt(K),c=X(TF),l=fadeUsePageComposerMode(),u=sO()');
 replace('{routeProjectId:n,workspaceAgent:r}=e,i=qt(WO),a=X(sT),o;', '{routeProjectId:n,workspaceAgent:r}=e,i=qt(WO),a=fadeUsePageComposerMode(),o;');
 replace('let e=W?i.get(GAe)??`chat`:ee??i.get(sT);GVt', 'let e=W?i.get(GAe)??`chat`:ee??a;GVt');
 return source;
}
