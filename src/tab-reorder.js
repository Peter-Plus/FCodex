function installFadeTabReorder(list,tabs,keyOf,refresh){
 let dragging=null,indicator=null,suppressClickUntil=0;
 function clearIndicator(){indicator?.removeAttribute('data-fade-drop');indicator=null}
 function reset(){clearIndicator();dragging=null;list.removeAttribute('data-fade-dragging')}
 function position(item,event){const rect=item.getBoundingClientRect();return event.clientX<rect.left+rect.width/2?'before':'after'}
 function bind(item,tab){
  item.draggable=true;
  item.ondragstart=event=>{
   if(event.target.closest?.('.fade-gpt-close')){event.preventDefault();return}
   dragging=keyOf(tab);list.setAttribute('data-fade-dragging','');
   event.stopPropagation();event.dataTransfer.effectAllowed='move';
   event.dataTransfer.setData('text/plain',dragging);
  };
  item.ondragover=event=>{
   if(dragging===null)return;
   event.preventDefault();event.stopPropagation();event.dataTransfer.dropEffect='move';
   clearIndicator();if(keyOf(tab)!==dragging){indicator=item;item.setAttribute('data-fade-drop',position(item,event))}
   const viewport=list.closest?.('.fade-tabs-scroll');
   if(viewport){const rect=viewport.getBoundingClientRect();if(event.clientX<rect.left+28)viewport.scrollLeft-=18;else if(event.clientX>rect.right-28)viewport.scrollLeft+=18}
  };
  item.ondragleave=event=>{if(!item.contains(event.relatedTarget)&&indicator===item)clearIndicator()};
  item.ondrop=event=>{
   if(dragging===null)return;
   event.preventDefault();event.stopPropagation();
   const from=tabs.findIndex(t=>keyOf(t)===dragging),target=tabs.indexOf(tab),after=position(item,event)==='after';
   suppressClickUntil=Date.now()+350;reset();
   if(from<0||target<0||from===target)return;
   const [moving]=tabs.splice(from,1),destination=tabs.indexOf(tab)+(after?1:0);tabs.splice(destination,0,moving);refresh();
  };
  item.ondragend=()=>{suppressClickUntil=Date.now()+350;reset()};
 }
 const blockClick=event=>{if(dragging!==null||Date.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation()}};
 list.addEventListener('click',blockClick,true);
 return {bind,destroy(){reset();list.removeEventListener('click',blockClick,true)}};
}
