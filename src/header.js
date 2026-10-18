// Mirror the native title; keep native controls mounted for the tools drawer.
function installCompactHeader(){
 const hidden=new Set();let pending=0;
 function sync(){
  pending=0;
  const titles=[...document.querySelectorAll('[data-thread-title]')].filter(el=>!el.closest('.app-shell-left-panel,[data-slate-sidebar-content]'));
  const nativeTitle=titles[0];
  const active=document.querySelector('[data-app-action-sidebar-thread-active="true"]');
  const text=nativeTitle?.textContent?.trim()||active?.getAttribute('data-app-action-sidebar-thread-title')||'';
  const label=$('#compactTitle'),display='Codex';if(label.textContent!==display)label.textContent=display;
  label.hidden=false;
  const titlebar=nativeTitle?.closest('[data-app-shell-titlebar],[data-app-shell-tab-row],header,[data-app-shell-header-layout]');
  const bars=titlebar?[titlebar]:[...document.querySelectorAll('[data-app-shell-titlebar]:not([data-app-shell-tab-row="true"])')];
  for(const bar of bars){if(!hidden.has(bar)&&!bar.hasAttribute('data-fade-header-hidden')){hidden.add(bar);bar.setAttribute('data-fade-header-hidden','')}}
 }
 const observer=new MutationObserver(records=>{
  if(!records.some(r=>!host.contains(r.target)))return;
  if(!pending)pending=setTimeout(sync,80);
 });
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-app-action-sidebar-thread-active','data-app-action-sidebar-thread-title']});
 sync();
 return ()=>{observer.disconnect();clearTimeout(pending);for(const el of hidden)el.removeAttribute('data-fade-header-hidden')};
}
