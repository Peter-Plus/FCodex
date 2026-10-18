// Used only by the separately built diagnostic runtime.
export function installDiagnosticGate(win, holdMs=5000, fallbackMs=30000){
 let resolve,holdTimer;
 const ready=new Promise(r=>{resolve=r});
 const state={status:'held',heldAt:win.performance.now(),openingAt:null,releasedAt:null,reason:null};
 function release(reason='manual'){
  if(state.status==='released')return;
  win.clearTimeout(fallbackTimer);win.clearTimeout(holdTimer);
  Object.assign(state,{status:'released',releasedAt:win.performance.now(),reason});
  resolve();
 }
 function opening(){
  if(state.status!=='held'||state.openingAt!==null)return;
  state.openingAt=win.performance.now();
  holdTimer=win.setTimeout(()=>release('opening-plus-5s'),holdMs);
 }
 const fallbackTimer=win.setTimeout(()=>release('fallback-timeout'),fallbackMs);
 win.__fadeDiagnosticGate={state,opening,release};
 return ready;
}

export function patchDiagnosticIndex(html){
 const entries=[...html.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)];
 if(entries.length!==1)throw Error('Expected one native module entry');
 const entry=entries[0][1];
 if(!/^\.\/assets\/[\w.-]+\.js$/.test(entry))throw Error('Unexpected native module path');
 return {html:html.replace(entries[0][0],'<script type="module" src="./fade-diagnostic-entry.js"></script>')
  .replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g,''),
  script:`await (${installDiagnosticGate.toString()})(window);\nawait import(${JSON.stringify(entry)});\n`};
}
