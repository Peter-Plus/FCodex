// One delegated handler also covers tab strips recreated by window-mode renders.
function installFadeTabWheel(scope,win){
 const states=new Map(),reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(value,el)=>Math.max(0,Math.min(el.scrollWidth-el.clientWidth,value));
 function stop(el){const state=states.get(el);if(state){win.cancelAnimationFrame(state.frame);states.delete(el)}}
 function wheel(event){
  const el=event.target.closest?.('.fade-tabs-scroll');
  if(!el||event.ctrlKey||el.scrollWidth<=el.clientWidth)return;
  const raw=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
  const delta=raw*(event.deltaMode===1?20:event.deltaMode===2?el.clientWidth:1);
  if(!delta)return;
  event.preventDefault();event.stopPropagation();
  let state=states.get(el);
  if(state&&Math.abs(el.scrollLeft-state.last)>2){stop(el);state=null}
  if(reduced.matches){stop(el);el.scrollLeft=clamp(el.scrollLeft+delta,el);return}
  if(state){
   // Reversing the wheel should reverse immediately, not drain an old backlog.
   state.target=clamp((Math.sign(delta)===Math.sign(state.target-el.scrollLeft)?state.target:el.scrollLeft)+delta,el);return;
  }
  state={target:clamp(el.scrollLeft+delta,el),last:el.scrollLeft,time:win.performance.now(),frame:0};states.set(el,state);
  function tick(time){
   if(!el.isConnected||Math.abs(el.scrollLeft-state.last)>2){stop(el);return}
   state.target=clamp(state.target,el);
   const distance=state.target-el.scrollLeft,dt=Math.min(64,Math.max(1,time-state.time));state.time=time;
   if(Math.abs(distance)<.5){el.scrollLeft=state.target;states.delete(el);return}
   el.scrollLeft+=distance*(1-Math.exp(-dt/65));
   if(el.scrollLeft===state.last){el.scrollLeft=state.target;states.delete(el);return}
   state.last=el.scrollLeft;
   state.frame=win.requestAnimationFrame(tick);
  }
  state.frame=win.requestAnimationFrame(tick);
 }
 const interrupt=event=>{const el=event.target.closest?.('.fade-tabs-scroll');if(el)stop(el)};
 scope.addEventListener('wheel',wheel,{passive:false});scope.addEventListener('pointerdown',interrupt,{capture:true});
 return ()=>{scope.removeEventListener('wheel',wheel);scope.removeEventListener('pointerdown',interrupt,true);for(const el of states.keys())stop(el)};
}
