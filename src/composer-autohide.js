function installComposerAutohide(){
 const key='fade-composer-autohide',marked=new Set();
 let enabled=false,dead=false,frame=0,timer=0,mouse=null,composing=false;
 try{enabled=localStorage.getItem(key)==='true'}catch{}
 function mark(el,name,value){if(el.getAttribute(name)!==value)el.setAttribute(name,value)}
 function clear(){for(const el of marked){el.removeAttribute('data-fade-autohide-footer');el.removeAttribute('data-fade-composer-visible')}marked.clear()}
 function refresh(){
  frame=0;if(dead)return;
  root.toggleAttribute('data-fade-composer-autohide',enabled);
  if(!enabled){clear();return}
  const footers=[...document.querySelectorAll('[data-thread-scroll-footer]')].filter(el=>el.querySelector('[data-codex-composer-root]'));
  for(const composer of document.querySelectorAll('[data-codex-composer-root][data-composer-placement=home]')){const footer=composer.closest('.z-20');if(footer&&!footers.includes(footer))footers.push(footer)}
  for(const el of [...marked])if(!footers.includes(el)){el.removeAttribute('data-fade-autohide-footer');el.removeAttribute('data-fade-composer-visible');marked.delete(el)}
  for(const footer of footers){
   marked.add(footer);mark(footer,'data-fade-autohide-footer','');
   const box=footer.getBoundingClientRect(),area=footer.closest('.thread-scroll-container')?.getBoundingClientRect();
   const bottom=area?.bottom??window.innerHeight;
   const near=mouse&&mouse.x>=box.left&&mouse.x<=box.right&&mouse.y>=bottom-40&&mouse.y<=bottom;
   const over=mouse&&footer.getAttribute('data-fade-composer-visible')==='true'&&(footer.matches(':hover')||(mouse.x>=box.left&&mouse.x<=box.right&&mouse.y>=box.top&&mouse.y<=bottom));
   const focus=footer.contains(document.activeElement);
   const popup=[...footer.querySelectorAll('[aria-expanded=true],[data-state=open]')].some(el=>el.getClientRects().length);
   const portal=[...document.querySelectorAll('[role=menu],[role=listbox],[role=dialog],[data-radix-popper-content-wrapper]')].some(el=>el.getClientRects().length&&!el.closest('[hidden],[data-state=closed]'));
   const keep=near||over||focus||popup||(footer.getAttribute('data-fade-composer-visible')==='true'&&(portal||composing));
   mark(footer,'data-fade-composer-visible',String(!!keep));
  }
 }
 function schedule(){if(!dead&&!frame)frame=requestAnimationFrame(refresh)}
 function move(event){mouse={x:event.clientX,y:event.clientY};clearTimeout(timer);timer=setTimeout(schedule,180);if(event.clientY>=window.innerHeight-48)schedule();else if([...marked].some(el=>el.getAttribute('data-fade-composer-visible')!=='true'))schedule()}
 on(document,'pointermove',move,{passive:true});
 on(document,'pointerleave',()=>{mouse=null;clearTimeout(timer);timer=setTimeout(schedule,350)});
 on(document,'focusin',schedule);on(document,'focusout',schedule);
 on(document,'pointerdown',event=>{if(!enabled)return;const active=document.activeElement;if([...marked].some(el=>el.contains(active))&&!event.target.closest('[data-fade-autohide-footer],[role=menu],[role=listbox],[role=dialog],[data-radix-popper-content-wrapper]')){active.blur();schedule()}},{capture:true});
 on(document,'compositionstart',()=>{composing=true;schedule()});on(document,'compositionend',()=>{composing=false;schedule()});
 on(window,'blur',()=>{mouse=null;schedule()});on(window,'resize',schedule);
 const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-expanded','data-state','data-app-shell-active-page','hidden']});
 refresh();
 return {get enabled(){return enabled},set(value,persist=true){enabled=!!value;if(persist)try{localStorage.setItem(key,String(enabled))}catch{}refresh()},destroy(){dead=true;observer.disconnect();clearTimeout(timer);if(frame)cancelAnimationFrame(frame);clear();root.removeAttribute('data-fade-composer-autohide')}};
}
