// One page-lifetime collector, including classic mode and repeated injection.
// Only failures enter this path; no console interception, polling or action log.
(()=>{
 if(globalThis.__fadeReportError)return;
 const recent=new Map();let windowAt=0,count=0;
 globalThis.__fadeReportError=(operation,error)=>{
  try{
   if(typeof window.fadeDiagnostics?.report!=='function')return;
   const now=Date.now();if(now-windowAt>=60000){windowAt=now;count=0}
   if(count>=60)return;
   const message=typeof error==='string'?error:typeof error?.message==='string'?error.message:'Unknown error';
   const key=String(operation).slice(0,120)+'\n'+message.slice(0,4000);
   if(recent.has(key)&&now-recent.get(key)<60000)return;
   if(recent.size>=128)recent.delete(recent.keys().next().value);
   recent.set(key,now);count++;
   window.fadeDiagnostics.report({uiRevision:'__FADE_UI_REVISION__',operation:String(operation).slice(0,120),message:message.slice(0,4000),name:typeof error?.name==='string'?error.name.slice(0,80):'Error',stack:typeof error?.stack==='string'?error.stack.slice(0,6000):''});
  }catch{}
 };
 window.addEventListener('error',event=>{if(event.error||event.message)globalThis.__fadeReportError('renderer.unhandled-error',event.error||event.message)});
 window.addEventListener('unhandledrejection',event=>globalThis.__fadeReportError('renderer.unhandled-rejection',event.reason));
})();
