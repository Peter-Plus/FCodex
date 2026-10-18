// Anchor the existing interactive orb to the native empty-chat emblem.
function installHomeOrb(){
 let anchor=null,pending=0,arrivalTimer=0,awaitingHome=false,homePosition=null;
 // The chat surface and welcome surface have different bounds. Store viewport
 // coordinates so switching surfaces cannot shift a previously measured target.
 function bounds(){return {left:0,top:0,width:innerWidth,height:innerHeight}}
 let targetX=null,targetY=null;
 function setTarget(x,y){
  if(targetX!==null&&Math.abs(x-targetX)<.5&&Math.abs(y-targetY)<.5)return;
  targetX=x;targetY=y;
  host.style.setProperty('--fade-home-x',`${x}px`);
  host.style.setProperty('--fade-home-y',`${y}px`);
 }
 function cancelArrival(){
  awaitingHome=false;clearTimeout(arrivalTimer);arrivalTimer=0;
  host.removeAttribute('data-orb-arriving-home');
 }
 function beginArrival(){
  const button=$('#orbButton');
  button.getAnimations().filter(a=>a.id==='core-impact').forEach(a=>a.cancel());
  const r=bounds();
  // Start now using the last measured home position, scaled to this viewport.
  // On first use, estimate the native welcome emblem above the composer.
  setTarget(r.left+r.width*(homePosition?.x??.5),r.top+r.height*(homePosition?.y??.39));
  awaitingHome=true;
  host.setAttribute('data-orb-arriving-home','');
  clearTimeout(arrivalTimer);arrivalTimer=setTimeout(cancelArrival,3000);
 }
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;
 function sync(){
  pending=0;
  const next=[...document.querySelectorAll('[data-testid="home-icon"]')].find(el=>{
   const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).display!=='none';
  })||null;
  if(next!==anchor){
   if(anchor){anchor.removeAttribute('data-fade-home-anchor');resize?.unobserve(anchor)}
   anchor=next;
   if(anchor){anchor.setAttribute('data-fade-home-anchor','');resize?.observe(anchor)}
  }
  if(anchor){
   const r=anchor.getBoundingClientRect();
   const x=r.left+r.width/2,y=r.top+r.height/2,area=bounds();
   homePosition={x:(x-area.left)/area.width,y:(y-area.top)/area.height};
   setTarget(x,y);
  }
  host.toggleAttribute('data-home-orb',!!anchor);
  if(anchor&&awaitingHome)cancelArrival();
 }
 function schedule(){if(!pending)pending=setTimeout(sync,awaitingHome?0:60)}
 const observer=new MutationObserver(records=>{if(records.some(r=>!host.contains(r.target)))schedule()});
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden']});
 on(window,'resize',schedule);on(document,'scroll',schedule,{capture:true,passive:true});
 sync();
 const dispose=()=>{observer.disconnect();resize?.disconnect();clearTimeout(pending);cancelArrival();anchor?.removeAttribute('data-fade-home-anchor')};
 dispose.beginArrival=beginArrival;dispose.cancelArrival=cancelArrival;
 dispose.refresh=()=>{clearTimeout(pending);sync()};
 dispose.startupTarget=()=>{
  dispose.refresh();
  if(!anchor||awaitingHome)return null;
  const r=$('#orbButton').getBoundingClientRect();
  // The element exists at the left edge before the welcome anchor mounts,
  // and CSS then interpolates toward home. Neither is a handoff destination.
  if(Math.abs(r.left+r.width/2-targetX)>1||Math.abs(r.top+r.height/2-targetY)>1||Math.abs(r.width-94)>1)return null;
  return {x:targetX/innerWidth,y:targetY/innerHeight,size:r.width,width:innerWidth,height:innerHeight};
 };
 return dispose;
}
