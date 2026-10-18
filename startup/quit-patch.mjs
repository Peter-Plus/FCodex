export function patchQuitGuard(source){
 const hook='D.app.on(`before-quit`,i=>{if(hie())';
 if(source.split(hook).length!==2)throw Error('Unsupported native quit hook');
 return source.replace(hook,'D.app.on(`before-quit`,i=>{if(fadeQuitFromClose&&!fadeConfirmQuit(()=>({running:Dse(),automations:a.zn().some(e=>e.status===`ACTIVE`),pending:f()?.some(e=>e.phase!==`failed`&&e.conversationStartResult?.status!==`created`)??false}))){i.preventDefault();return}if(hie())');
}
