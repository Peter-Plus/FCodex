// Completion is driven by actual page readiness; user Escape remains explicit.
export function installHandoffWatchdog(win,finish){
 let finished=false;
 const complete=()=>{if(finished)return;finished=true;finish()};
 const key=event=>{if(event.key==='Escape')complete()};
 win.addEventListener('keydown',key);
 return {arm(){},complete,dispose(){finished=true;win.removeEventListener('keydown',key)}};
}
