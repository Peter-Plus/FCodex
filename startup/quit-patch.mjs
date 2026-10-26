export function patchQuitGuard(source){
 if(source.includes('O.app.on(`before-quit`,i=>{if(Dse())')){
  const hook='O.app.on(`before-quit`,i=>{if(Dse())';
  if(source.split(hook).length!==2||!source.includes('let a=gue(),o=f()?.some(e=>e.phase!==`failed`&&e.conversationStartResult?.status!==`created`)??!1,c=s.tr().some(e=>e.status===`ACTIVE`)'))throw Error('Unsupported native quit state');
  return source.replace(hook,'O.app.on(`before-quit`,i=>{if(fadeQuitFromClose&&!fadeConfirmQuit(()=>({running:gue(),automations:s.tr().some(e=>e.status===`ACTIVE`),pending:f()?.some(e=>e.phase!==`failed`&&e.conversationStartResult?.status!==`created`)??false}))){i.preventDefault();return}if(Dse())');
 }
 const hook='D.app.on(`before-quit`,i=>{if(hie())';
 if(source.split(hook).length!==2)throw Error('Unsupported native quit hook');
 return source.replace(hook,'D.app.on(`before-quit`,i=>{if(fadeQuitFromClose&&!fadeConfirmQuit(()=>({running:Dse(),automations:a.zn().some(e=>e.status===`ACTIVE`),pending:f()?.some(e=>e.phase!==`failed`&&e.conversationStartResult?.status!==`created`)??false}))){i.preventDefault();return}if(hie())');
}
