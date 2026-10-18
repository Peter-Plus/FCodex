function fadeMessageRailInset(parentRight,fileLeft){return Math.max(18,Number.isFinite(fileLeft)?parentRight-fileLeft+18:18)}
function fadeMessagePreviewPosition(anchor,width,height,viewportHeight){return {left:Math.max(8,anchor.left-width-8),top:Math.max(48,Math.min(anchor.top+anchor.height/2-height/2,viewportHeight-height-12))}}
function installMessageRail(doc){
 const saved=new Map(),attrs=new Map(),observed=new Set();let pending=0,dead=false;
 function style(el,key,value){if(!saved.has(el))saved.set(el,new Map());const values=saved.get(el);if(!values.has(key))values.set(key,[el.style.getPropertyValue(key),el.style.getPropertyPriority(key)]);if(el.style.getPropertyValue(key)!==value)el.style.setProperty(key,value)}
 function mark(el,key){if(!attrs.has(el))attrs.set(el,new Set());attrs.get(el).add(key);if(!el.hasAttribute(key))el.setAttribute(key,'')}
 function watch(el){if(el&&!observed.has(el)){observed.add(el);resize?.observe(el)}}
 function sync(){
  pending=0;if(dead)return;
  const panels=[...doc.querySelectorAll('[data-fade-file-panel]')].map(p=>{watch(p);return p.getBoundingClientRect()}).filter(r=>r.width>0&&r.height>0);
  const rails=[...doc.querySelectorAll('[data-thread-user-message-navigation-rail-list]')];
  for(const list of rails){
   const nav=list.closest('nav');if(!nav)continue;
   const parent=nav.parentElement;if(!parent)continue;watch(parent);watch(nav);
   const rect=parent.getBoundingClientRect(),file=panels.find(r=>r.left>rect.left&&r.top<rect.bottom&&r.bottom>rect.top);
   mark(nav,'data-fade-message-rail');style(nav,'--fade-rail-inset',fadeMessageRailInset(rect.right,file?.left)+'px');
  }
  for(const preview of doc.querySelectorAll('[data-thread-user-message-navigation-tooltip-preview]')){
   const tooltip=preview.closest('[role=tooltip],[role=dialog]');if(!tooltip||tooltip.hidden||tooltip.getAttribute('aria-hidden')==='true')continue;
   const anchor=rails.flatMap(l=>[...l.querySelectorAll('[aria-describedby]')]).find(b=>(b.getAttribute('aria-describedby')||'').split(/\s+/).includes(tooltip.id));
   if(!anchor)continue;
   watch(tooltip);mark(tooltip,'data-fade-message-preview');
   // Native zoomed tooltips can have a separate positioning plane.
   const plane=tooltip.parentElement;
   if(plane&&plane!==doc.body&&plane.hasAttribute('data-overlay-owner')&&plane.style.transform)mark(plane,'data-fade-message-preview-plane');
   const a=anchor.getBoundingClientRect();style(tooltip,'--fade-preview-width',Math.max(80,Math.min(320,a.left-16))+'px');
   const box=tooltip.getBoundingClientRect(),pos=fadeMessagePreviewPosition(a,box.width,box.height,doc.documentElement.clientHeight);
   style(tooltip,'--fade-preview-left',pos.left+'px');style(tooltip,'--fade-preview-top',pos.top+'px');
  }
  for(const el of observed)if(!el.isConnected){resize?.unobserve(el);observed.delete(el);saved.delete(el);attrs.delete(el)}
 }
 function schedule(){if(!pending&&!dead)pending=window.requestAnimationFrame(sync)}
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;
 const observer=new MutationObserver(schedule);observer.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-describedby','aria-hidden','hidden','data-fade-file-panel','data-side']});
 const abort=new AbortController();for(const event of ['resize','scroll'])window.addEventListener(event,schedule,{capture:true,passive:true,signal:abort.signal});
 doc.addEventListener('pointerover',schedule,{passive:true,signal:abort.signal});doc.addEventListener('focusin',schedule,{signal:abort.signal});sync();
 return ()=>{dead=true;observer.disconnect();resize?.disconnect();abort.abort();if(pending)window.cancelAnimationFrame(pending);for(const[el,values]of saved)for(const[key,[value,priority]]of values){if(value)el.style.setProperty(key,value,priority);else el.style.removeProperty(key)}for(const[el,keys]of attrs)for(const key of keys)el.removeAttribute(key)};
}
