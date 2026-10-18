// A continuous tangent at the fan edges avoids the old hard angle clamp.
function fadeArcAngle(y,half){return 20*Math.tanh(y/Math.max(1,half))}
function fadeAutoScrollSpeed(distance){const d=Math.max(0,Math.abs(distance)-10);return Math.sign(distance)*Math.min(1800,d*4+d*d*.025)}
function installFanAutoscroll(areas){
 let active=null,frame=0,last=0,target=0,origin=0,pointer=0;
 let wheelArea=null,wheelFrame=0,wheelTarget=0,wheelPosition=0,wheelLast=0,wheelDirection=0;
 function stopWheel(){if(wheelFrame)cancelAnimationFrame(wheelFrame);wheelFrame=0;wheelArea=null;wheelDirection=0}
 function wheelTick(now){
  wheelFrame=0;if(!wheelArea||!navOpen){stopWheel();return}
  const dt=Math.min(40,Math.max(0,now-wheelLast));wheelLast=now;
  wheelTarget=Math.max(0,Math.min(wheelArea.view.scrollHeight-wheelArea.view.clientHeight,wheelTarget));
  wheelPosition+=(wheelTarget-wheelPosition)*(1-Math.exp(-dt/55));
  const done=Math.abs(wheelTarget-wheelPosition)<.4;if(done)wheelPosition=wheelTarget;
  wheelArea.view.scrollTo({top:wheelPosition,behavior:'instant'});wheelArea.layout();
  if(done)stopWheel();else wheelFrame=requestAnimationFrame(wheelTick);
 }
 const marker=document.createElement('div');marker.className='fade-scroll-origin';marker.hidden=true;marker.textContent='↕';marker.setAttribute('aria-hidden','true');shadow.append(marker);
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0;active=null;marker.hidden=true;host.removeAttribute('data-fan-scrolling')}
 function tick(now){
  frame=0;if(!active||!navOpen){stop();return}
  const dt=Math.min(32,Math.max(0,now-last));last=now;
  target=Math.max(0,Math.min(active.view.scrollHeight-active.view.clientHeight,target+fadeAutoScrollSpeed(pointer-origin)*dt/1000));
  active.view.scrollTo({top:target,behavior:'instant'});
  // Read the actual scroll position and render the arc before this frame paints.
  active.layout();frame=requestAnimationFrame(tick);
 }
 for(const area of areas){
  on(area.view,'wheel',event=>{
   if(event.ctrlKey||!navOpen)return;
   const delta=event.deltaY*(event.deltaMode===1?20:event.deltaMode===2?area.view.clientHeight:1);if(!delta)return;
   event.preventDefault();event.stopPropagation();stop();
   if(wheelArea!==area){stopWheel();wheelArea=area;wheelTarget=wheelPosition=area.view.scrollTop}
   const direction=Math.sign(delta);if(wheelDirection&&direction!==wheelDirection)wheelTarget=wheelPosition=area.view.scrollTop;wheelDirection=direction;
   wheelTarget=Math.max(0,Math.min(area.view.scrollHeight-area.view.clientHeight,wheelTarget+delta));
   if(reduceMotion.matches){area.view.scrollTo({top:wheelTarget,behavior:'instant'});area.layout();stopWheel();return}
   if(!wheelFrame){wheelLast=performance.now();wheelFrame=requestAnimationFrame(wheelTick)}
  },{passive:false});
  on(area.view,'mousedown',event=>{
   stopWheel();
   if(event.button!==1)return;event.preventDefault();event.stopPropagation();if(active){stop();return}
   active=area;origin=pointer=event.clientY;target=area.view.scrollTop;last=performance.now();marker.style.left=event.clientX+'px';marker.style.top=origin+'px';marker.hidden=false;host.setAttribute('data-fan-scrolling','');frame=requestAnimationFrame(tick);
  });
  on(area.view,'auxclick',event=>{if(event.button===1)event.preventDefault()});
 }
 on(window,'mousemove',event=>{pointer=event.clientY},{passive:true});
 on(window,'mousedown',event=>{if(active&&!areas.some(a=>event.button===1&&event.composedPath().includes(a.view))){event.preventDefault();event.stopPropagation();stop()}},{capture:true});
 on(window,'keydown',event=>{stopWheel();if(active){if(event.key==='Escape'){event.preventDefault();event.stopPropagation()}stop()}},{capture:true});
 on(window,'wheel',()=>{if(active)stop()},{passive:true});on(window,'blur',()=>{stop();stopWheel()});
 return ()=>{stop();stopWheel();marker.remove()};
}
