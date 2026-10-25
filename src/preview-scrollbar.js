// A viewport-anchored control for the existing native horizontal scrollport.
// It never moves editor nodes or changes document/selection state.
function installPreviewScrollbar(doc){
 const win=doc.defaultView,scope=':is([data-tab-id^="text-editor:"],[data-tab-id^="file:"])';
 const bar=doc.createElement('div'),slider=doc.createElement('input');
 bar.className='fade-preview-scrollbar';bar.setAttribute('data-visible','false');
 slider.type='range';slider.min='0';slider.step='1';slider.setAttribute('aria-label','预览代码横向滚动');slider.title='拖动以横向滚动代码';bar.append(slider);doc.body.append(bar);
 let pointer=null,active=null,dragging=false,frame=0,dead=false;
 const abort=new win.AbortController(),options={signal:abort.signal};
 const on=(el,name,fn,extra={})=>el.addEventListener(name,fn,{...options,...extra});
 const parent=el=>el.parentElement||el.getRootNode()?.host;
 function bounds(el){
  const r=el.getBoundingClientRect();let left=Math.max(0,r.left),right=Math.min(win.innerWidth,r.right),top=Math.max(0,r.top),bottom=Math.min(win.innerHeight,r.bottom);
  for(let p=parent(el);p;p=parent(p)){
   const s=win.getComputedStyle(p),b=p.getBoundingClientRect();
   if(/auto|scroll|hidden|clip/.test(s.overflowX)){left=Math.max(left,b.left);right=Math.min(right,b.right)}
   if(/auto|scroll|hidden|clip/.test(s.overflowY)){top=Math.max(top,b.top);bottom=Math.min(bottom,b.bottom)}
  }
  return {left,right,top,bottom,width:right-left,height:bottom-top};
 }
 function candidates(){
  const nodes=[...doc.querySelectorAll(scope+' .cm-scroller')];
  for(const host of doc.querySelectorAll(scope+' diffs-container'))nodes.push(...(host.shadowRoot?.querySelectorAll('[data-code]')||[]));
  return nodes.filter(el=>el.isConnected&&el.clientWidth>0&&el.scrollWidth>el.clientWidth+1&&!el.closest('[hidden],[aria-hidden="true"]'));
 }
 function bind(el){
  if(active===el)return;
  active?.removeEventListener('scroll',schedule);resize.disconnect();contents.disconnect();active=el;
  if(el){el.addEventListener('scroll',schedule,{passive:true});resize.observe(el);if(parent(el))resize.observe(parent(el));contents.observe(el.getRootNode() instanceof win.ShadowRoot?el.getRootNode():el,{subtree:true,childList:true})}
 }
 function update(){
  frame=0;if(dead)return;
  let rect=active&&bounds(active);
  const control=bar.getBoundingClientRect(),overControl=pointer&&bar.getAttribute('data-visible')==='true'&&pointer.x>=control.left&&pointer.x<=control.right&&pointer.y>=control.top&&pointer.y<=control.bottom;
  if(!dragging&&!overControl){
   const match=pointer&&candidates().map(el=>({el,rect:bounds(el)})).find(({rect:r})=>r.width>64&&r.height>32&&pointer.x>=r.left&&pointer.x<=r.right&&pointer.y>=r.top&&pointer.y<=r.bottom&&(pointer.y<=r.top+r.height*.2||pointer.x>=r.right-r.width*.25));
   bind(match?.el||null);rect=match?.rect;
  }
  if(!active?.isConnected||!rect||rect.width<=64||rect.height<=32||active.scrollWidth<=active.clientWidth+1){bar.setAttribute('data-visible','false');return}
  const width=Math.min(140,rect.width-32);
  bar.style.left=rect.right-width-16+'px';bar.style.top=Math.min(rect.top+64,rect.bottom-32)+'px';bar.style.width=width+'px';
  slider.max=String(active.scrollWidth-active.clientWidth);slider.value=String(active.scrollLeft);
  slider.setAttribute('aria-valuetext',Math.round(active.scrollLeft/(active.scrollWidth-active.clientWidth)*100)+'%');bar.setAttribute('data-visible','true');
 }
 function schedule(){if(!dead&&!frame)frame=win.requestAnimationFrame(update)}
 const resize=new win.ResizeObserver(schedule),contents=new win.MutationObserver(schedule),mounts=new win.MutationObserver(schedule);
 mounts.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','aria-hidden','data-tab-id','data-app-shell-active-page']});
 on(doc,'pointermove',e=>{pointer={x:e.clientX,y:e.clientY};schedule()},{passive:true});
 on(doc,'pointerleave',()=>{pointer=null;schedule()});on(win,'resize',schedule);on(doc,'scroll',schedule,{capture:true,passive:true});
 on(slider,'pointerdown',e=>{if(e.button!==0)return;dragging=true;slider.setPointerCapture(e.pointerId)});
 const end=()=>{dragging=false;schedule()};on(slider,'pointerup',end);on(slider,'pointercancel',end);on(slider,'lostpointercapture',end);
 on(slider,'input',()=>{if(active){active.scrollLeft=Number(slider.value);schedule()}});
 on(win,'blur',()=>{pointer=null;dragging=false;schedule()});
 return ()=>{dead=true;abort.abort();if(frame)win.cancelAnimationFrame(frame);mounts.disconnect();resize.disconnect();contents.disconnect();active?.removeEventListener('scroll',schedule);bar.remove()};
}
