// Fade the transcript, never the paper or the composer. Native DOM and scroll
// geometry remain intact. Bounds follow footer resize, scroll and autohide.
function installPaperSurface(doc=document){
 const win=doc.defaultView,entries=new Map();let frame=0,dead=false;
 const schedule=()=>{if(!dead&&!frame)frame=win.requestAnimationFrame(update)};
 function clear(entry){entry.content.removeAttribute('data-fade-paper-transcript');for(const key of ['top','solid','end','cut'])entry.content.style.removeProperty('--fc-paper-'+key);entry.scroll.removeAttribute('data-fade-paper-ready');}
 const resize=new win.ResizeObserver(schedule);
 function update(){
  frame=0;if(dead)return;
  const scrolls=new Set(doc.querySelectorAll('.thread-scroll-container'));
  for(const [scroll,entry]of entries)if(!scrolls.has(scroll)||scroll.firstElementChild!==entry.content||scroll.querySelector('[data-thread-scroll-footer]')!==entry.footer){clear(entry);resize.unobserve(scroll);resize.unobserve(entry.content);if(entry.footer)resize.unobserve(entry.footer);scroll.removeEventListener('scroll',schedule);entries.delete(scroll)}
  for(const scroll of scrolls){
   const content=scroll.firstElementChild,footer=scroll.querySelector('[data-thread-scroll-footer]');
   if(!content||content===footer||!content.className.includes('thread-content'))continue;
   let entry=entries.get(scroll);
   if(!entry){entry={scroll,content,footer};entries.set(scroll,entry);resize.observe(scroll);resize.observe(content);if(footer)resize.observe(footer);scroll.addEventListener('scroll',schedule,{passive:true})}
   const viewport=scroll.getBoundingClientRect(),body=content.getBoundingClientRect();if(!viewport.height||!body.height)continue;
   const hidden=footer?.getAttribute('data-fade-composer-visible')==='false';
   const foot=footer?.getBoundingClientRect();
   const end=Math.max(0,Math.min(body.height,(foot&&!hidden&&foot.height?Math.min(foot.top,viewport.bottom):viewport.bottom)-body.top));
   const top=Math.max(0,viewport.top-body.top),solid=Math.max(top, end-24);
   for(const [key,value]of Object.entries({top,solid,end,cut:Math.max(0,body.height-end)}))content.style.setProperty('--fc-paper-'+key,value.toFixed(2)+'px');
   content.setAttribute('data-fade-paper-transcript','');scroll.setAttribute('data-fade-paper-ready','');
  }
 }
 const observer=new win.MutationObserver(schedule);
 observer.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-fade-composer-visible','hidden','data-app-shell-active-page']});
 win.addEventListener('resize',schedule);update();
 return ()=>{dead=true;if(frame)win.cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();win.removeEventListener('resize',schedule);for(const entry of entries.values()){entry.scroll.removeEventListener('scroll',schedule);clear(entry)}entries.clear()};
}
