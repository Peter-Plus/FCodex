function fadeHistoryDirection(button){
 const key=Object.keys(button).find(k=>k.startsWith('__reactFiber$'));
 for(let fiber=key?button[key]:null,depth=0;fiber&&depth<12;fiber=fiber.return,depth++){
  const id=fiber.memoizedProps?.tooltipContent?.props?.id;
  if(id==='codex.command.navigateBack')return 'back';
  if(id==='codex.command.navigateForward')return 'forward';
 }
 return null;
}
function installRailHistory(doc){
 let row=null,account=null,dead=false;const originals=new Map(),controls={};
 function sources(){
  const result={};
  for(const b of doc.querySelectorAll('button')){
   if(b.closest('.fade-rail-history,[data-app-shell-active-page="false"]'))continue;
   const direction=fadeHistoryDirection(b);if(direction&&!result[direction])result[direction]=b;
  }
  return result;
 }
 function sync(){
  if(dead)return;
  const rail=doc.querySelector('[data-app-navigation-rail]');
  const next=rail&&[...rail.querySelectorAll('button')].find(b=>/open profile menu|打开个人资料菜单|打开个人资料|打开个人信息菜单|打开设置|open settings/i.test(b.getAttribute('aria-label')||''));
  if(!next){row?.remove();row=null;account=null;for(const[b,value]of originals){if(value===null)b.removeAttribute('data-fade-history-source');else b.setAttribute('data-fade-history-source',value)}originals.clear();return}
  if(next!==account||!row?.isConnected){
   row?.remove();account=next;row=doc.createElement('div');row.className='fade-rail-history';
   for(const direction of ['back','forward']){
    const b=doc.createElement('button');b.type='button';b.title=direction==='back'?'后退':'前进';b.setAttribute('aria-label',b.title);
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="'+(direction==='back'?'m14 5-7 7 7 7':'m10 5 7 7-7 7')+'"/></svg>';
    b.addEventListener('click',()=>{const native=sources()[direction];if(native&&!native.disabled&&native.getAttribute('aria-disabled')!=='true')native.click()});
    controls[direction]=b;row.append(b);
   }
   // Keep navigation outside the profile's wrappers: their hover/hit surfaces
   // must remain limited to the avatar, and their width is only 36px.
   let footer=account;
   while(footer.parentElement!==rail)footer=footer.parentElement;
   rail.insertBefore(row,footer);
  }
  const native=sources();
  for(const direction of ['back','forward']){
   const b=native[direction];controls[direction].disabled=!b||b.disabled||b.getAttribute('aria-disabled')==='true';
   if(b&&!originals.has(b)){originals.set(b,b.getAttribute('data-fade-history-source'));b.setAttribute('data-fade-history-source','')}
  }
 }
 const observer=new MutationObserver(records=>{if(!records.every(r=>r.target.closest?.('.fade-rail-history')))sync()});
 observer.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','aria-disabled','aria-label']});sync();
 return ()=>{dead=true;observer.disconnect();row?.remove();for(const[b,value]of originals){if(value===null)b.removeAttribute('data-fade-history-source');else b.setAttribute('data-fade-history-source',value)}};
}
