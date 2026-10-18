function installFadeWindowMode(){
 let resetStartup=false;try{resetStartup=!window.__fadeWindowModeBooted&&localStorage.getItem('fade-window-mode')==='true'}catch{}window.__fadeWindowModeBooted=true;
 const layout=createFadeWindowLayout(),homes=new Map(),api={codex:disposeCodexTabs,gpt:disposeGptTabs};
 const row=document.createElement('div'),menu=document.createElement('div'),button=document.createElement('button'),pageStyle=document.createElement('style');
 row.className='fade-window-row';menu.className='fade-window-menu';menu.hidden=true;menu.setAttribute('role','menu');
 button.className='fade-window-add';button.type='button';button.textContent='＋';button.title='新建窗口';button.setAttribute('aria-label','新建窗口');button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');
 $('.compact-head').append(button);shadow.append(row,menu);document.head.append(pageStyle);
 let interval=0,enabled=false,focus=null,dead=false,signature='',drag=null,cancelled=false,pendingPane=null,lastRoute='',pendingTransfer=false;
 const entries=()=>[...api.codex.tabs().map(tab=>({key:tab.path,type:'codex',tab})),...api.gpt.tabs().map(tab=>({key:tab.id,type:'gpt',tab})),...homes.values()];
 const entry=key=>entries().find(e=>e.key===key);
 const pageKey=e=>e.home?e.key:e.type==='codex'?e.tab.location?.state?.fadePaneHome||e.tab.nativePath||e.tab.path:e.tab.location?.state?.fadeDraftKey||e.tab.location?.pathname||e.tab.id;
 function navigateHome(e){const r=fadeNativeRouter(document);r?.navigator.push({pathname:'/',search:''},{sidebarProductMode:'codex',fadePaneHome:e.key,homeDraftKey:e.key})}
 function activate(pane,key){const e=entry(key);if(!e)return;focus=pane;pane.active=key;if(e.home)navigateHome(e);else api[e.type].activate(e.tab);render()}
 function blank(pane){focus=pane;pendingPane=pane;if(pane.type==='gpt'){api.gpt.newChat();sync();return}const key='fade-home-'+crypto.randomUUID();api.codex.addHome(key);sync();layout.place(key,pane);activate(pane,key)}
 function add(type){if(!enabled)return;if((layout.panes.length+1)*320>window.innerWidth){announce('窗口宽度不足，请先扩大窗口');return}try{const pane=layout.add(type);blank(pane);render()}catch(error){announce(error.message)}closeMenu()}
 function closeTab(pane,key){const e=entry(key);if(!e)return;layout.forget(key);if(e.home)homes.delete(key);else api[e.type].close(e.type==='gpt'?e.tab.id:e.tab);if(!pane.tabs.length){layout.remove(pane);if(focus===pane)focus=layout.panes[0]??null}if(!layout.panes.length){const p=layout.add('codex');blank(p)}else if(focus?.active)activate(focus,focus.active);signature='';sync()}
 function closePane(pane){for(const key of [...pane.tabs]){const e=entry(key);layout.forget(key);if(e?.home)homes.delete(key);else if(e)api[e.type].close(e.type==='gpt'?e.tab.id:e.tab)}layout.remove(pane);focus=layout.panes[0]??layout.add('codex');if(focus.active)activate(focus,focus.active);else blank(focus);signature='';sync()}
 function publish(){
  const slots={},rules=[],total=layout.panes.reduce((n,p)=>n+p.weight,0),available=window.innerWidth-Math.max(0,layout.panes.length-1)*5;let left=0;
  for(const p of layout.panes){const width=p.weight/total*available;
   for(const key of p.tabs){const e=entry(key);if(!e)continue;const id=pageKey(e);slots[id]=key===p.active?p.id:'hidden';
    if(key===p.active)rules.push(`[data-fade-page-key=${JSON.stringify(id)}]{display:flex!important;position:fixed!important;left:${left}px!important;top:85px!important;width:${width}px!important;height:calc(100dvh - 85px)!important;min-width:0!important;flex-direction:column;overflow:hidden;z-index:2;background:var(--fc-bg,var(--color-surface))}[data-fade-page-key=${JSON.stringify(id)}]>div{min-width:0;max-width:100%}`);else rules.push(`[data-fade-page-key=${JSON.stringify(id)}]{display:none!important}`);
   }left+=width+5;
  }
  const next=enabled?slots:{};if((enabled||window.__fadePaneSlots)&&JSON.stringify(window.__fadePaneSlots)!==JSON.stringify(next)){window.__fadePaneSlots=next;window.__fadePaneRevision=(window.__fadePaneRevision||0)+1;window.dispatchEvent(new Event('fade-pane-layout'))}
  pageStyle.textContent=enabled?rules.join('\n'):'';
 }
 function sync(){if(dead||!enabled)return;if(resetStartup&&api.gpt.ready){resetStartup=false;for(const e of entries())api[e.type].close(e.type==='gpt'?e.tab.id:e.tab);layout.panes.splice(0);focus=layout.add('codex');blank(focus);return}const all=entries(),keys=new Set(all.map(e=>e.key));
  for(const p of [...layout.panes])for(const key of [...p.tabs])if(!keys.has(key))layout.forget(key);
  for(const e of all)if(!layout.owner(e.key)){let p=pendingPane?.type===e.type?pendingPane:focus?.type===e.type?focus:layout.panes.find(p=>p.type===e.type);if(!p){if(layout.panes.length>=4){announce('请先关闭一个分栏');continue}p=layout.add(e.type)}layout.place(e.key,p);pendingPane=null}
  const loc=fadeNativeRouter(document)?.location,route=loc?JSON.stringify([loc.pathname,loc.key]):'';
  if(route&&route!==lastRoute){lastRoute=route;const current=all.find(e=>pageKey(e)===(loc.state?.fadeDraftKey||loc.state?.fadePaneHome||loc.pathname));if(current){const p=layout.owner(current.key);if(p){p.active=current.key;focus=p}}}
  for(const p of [...layout.panes])if(!p.tabs.length&&p!==pendingPane&&layout.panes.length>1)layout.remove(p);
  render();
 }
 function makeButton(text,label,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.title=label;b.setAttribute('aria-label',label);b.onclick=fn;return b}
 function render(){publish();const key=JSON.stringify([enabled,focus?.id,layout.panes,entries().map(e=>[e.key,e.tab.title,e.tab.status])]);if(key===signature)return;signature=key;row.replaceChildren();button.hidden=!enabled;row.hidden=!enabled;if(!enabled)return;
  layout.panes.forEach((p,index)=>{
   const pane=document.createElement('section');pane.className='fade-window-pane';pane.dataset.pane=p.id;pane.style.flex=String(p.weight);pane.toggleAttribute('data-focused',p===focus);
   const directory=makeButton(p.type==='codex'?'Codex':'GPT','打开聊天目录',()=>{focus=p;chatPicker.openFor(p.type,directory)});directory.className='fade-window-directory';pane.append(directory);
   const tabs=document.createElement('div');tabs.className='fade-window-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',p.type+' 聊天标签');tabs.onwheel=event=>{if(!event.ctrlKey&&tabs.scrollWidth>tabs.clientWidth){event.preventDefault();tabs.scrollLeft+=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY}};pane.append(tabs);
   for(const id of p.tabs){const e=entry(id);if(!e)continue;const item=document.createElement('div');item.className='fade-gpt-tab';item.draggable=true;
    const select=makeButton(e.tab.title||'新聊天',e.tab.title||'新聊天',()=>activate(p,id));select.className='fade-gpt-select';select.setAttribute('role','tab');select.setAttribute('aria-selected',String(p.active===id));item.append(select,makeButton('×','关闭标签',()=>closeTab(p,id)));
    item.ondragstart=event=>{drag={key:id,type:p.type,token:crypto.randomUUID(),pane:p};cancelled=false;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('application/x-fade-tab',JSON.stringify({token:drag.token,type:p.type}));event.dataTransfer.setData('text/plain',e.tab.title||'新聊天');void window.fadeWindowWorkspace?.request('offer',{token:drag.token,type:p.type,key:id}).catch(error=>announce(error.message))};
    item.ondragend=event=>{const moving=drag;drag=null;if(!moving||cancelled||event.dataTransfer.dropEffect!=='none')return;void window.fadeWindowWorkspace?.request('detach',{token:moving.token}).catch(error=>announce(error.message))};
    item.ondragover=event=>{if(drag?.type===p.type){event.preventDefault();event.dataTransfer.dropEffect='move'}};
    item.ondrop=event=>drop(event,p,id);tabs.append(item);
   }
   pane.append(makeButton('＋','新建聊天',()=>blank(p)),makeButton('×','关闭分栏中的所有标签页',()=>closePane(p)));
   pane.ondragover=event=>{if(event.dataTransfer.types.includes('application/x-fade-tab')&&(!drag||drag.type===p.type)){event.preventDefault();event.dataTransfer.dropEffect='move'}};pane.ondrop=event=>drop(event,p);
   row.append(pane);
   if(index<layout.panes.length-1){const separator=document.createElement('div');separator.className='fade-window-divider';separator.tabIndex=0;separator.setAttribute('role','separator');separator.setAttribute('aria-orientation','vertical');separator.setAttribute('aria-label','调整分栏宽度');separator.setAttribute('aria-valuenow',String(Math.round(p.weight/layout.panes.reduce((n,q)=>n+q.weight,0)*100)));separator.onpointerdown=event=>resize(event,p,layout.panes[index+1],separator);separator.onkeydown=event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const q=layout.panes[index+1],delta=event.key==='ArrowLeft'?-.08:.08;if(p.weight+delta>.2&&q.weight-delta>.2){p.weight+=delta;q.weight-=delta;signature='';render()}};row.append(separator)}
  });
 }
 async function drop(event,p,before){event.preventDefault();event.stopPropagation();let data;try{data=JSON.parse(event.dataTransfer.getData('application/x-fade-tab'))}catch{return}if(data.type!==p.type){announce('只能移动到同类型窗口');return}if(drag){const from=layout.place(drag.key,p,before?p.tabs.indexOf(before):p.tabs.length);if(from!==p&&!from.tabs.length)layout.remove(from);activate(p,drag.key);drag=null}else{pendingPane=p;try{await window.fadeWindowWorkspace?.request('claim',{token:data.token,type:p.type})}catch(error){announce(error.message)}finally{pendingPane=null}}signature='';sync()}
 function resize(event,p,q,separator){event.preventDefault();separator.setPointerCapture(event.pointerId);const x=event.clientX,a=p.weight,b=q.weight,total=layout.panes.reduce((n,v)=>n+v.weight,0),min=Math.min(240,innerWidth/layout.panes.length)/innerWidth*total;const move=e=>{const d=(e.clientX-x)/innerWidth*total;p.weight=Math.max(min,Math.min(a+b-min,a+d));q.weight=a+b-p.weight;publish();const panels=[...row.querySelectorAll('.fade-window-pane')];for(const panel of panels)panel.style.flex=String(layout.panes.find(v=>v.id===panel.dataset.pane).weight)};const finish=()=>{separator.removeEventListener('pointermove',move);separator.removeEventListener('pointerup',finish);separator.removeEventListener('lostpointercapture',finish);signature='';render()};separator.addEventListener('pointermove',move);separator.addEventListener('pointerup',finish);separator.addEventListener('lostpointercapture',finish)}
 function closeMenu(){menu.hidden=true;button.setAttribute('aria-expanded','false')}
 for(const [type,label]of [['codex','新建 Codex 窗口'],['gpt','新建 GPT 窗口']])menu.append(makeButton(label,label,()=>add(type)));
 const openMenu=()=>{if(!enabled)return;for(const item of menu.children){item.disabled=layout.panes.length>=4||(layout.panes.length+1)*320>window.innerWidth;item.setAttribute('role','menuitem')}menu.hidden=false;button.setAttribute('aria-expanded','true');const r=button.getBoundingClientRect();menu.style.left=r.left+'px'};on(button,'click',openMenu);on(button,'pointerenter',openMenu);on(menu,'pointerleave',closeMenu);
 on(document,'pointerdown',event=>{if(!event.composedPath().includes(menu)&&!event.composedPath().includes(button))closeMenu()});on(window,'keydown',event=>{if(event.key==='Escape'){cancelled=true;closeMenu()}});
 on(document,'pointerdown',event=>{const el=event.target.closest?.('[data-fade-page-key]');if(!enabled||!el)return;const e=entries().find(e=>pageKey(e)===el.dataset.fadePageKey),p=e&&layout.owner(e.key);if(p&&p!==focus)activate(p,e.key)},{capture:true});
 function set(value,persist=true){if(value&&!window.__fadePaneHostSupported){announce('窗口模式需要更新运行时，请完整退出后重新启动 FCodex');return false}enabled=!!value;if(enabled&&!interval)interval=globalThis.setInterval(sync,180);if(!enabled&&interval){globalThis.clearInterval(interval);interval=0}host.toggleAttribute('data-window-mode',enabled);root.toggleAttribute('data-fade-window-mode',enabled);if(persist)try{localStorage.setItem('fade-window-mode',''+enabled)}catch{}
  if(enabled&&!layout.panes.length){focus=layout.add('codex');sync();if(!focus.tabs.length)blank(focus)}
  if(!enabled){closeMenu();for(const p of layout.panes)for(const key of p.tabs){const e=entry(key);if(e?.home)homes.delete(key)}layout.panes.splice(0);focus=null}
  signature='';render();return true;
 }
 // Cross-window transfer is acknowledged by the destination before source ownership is removed.
 async function transfer(action,data){if(action==='export'){const e=entry(data.key);if(!e)throw Error('标签已关闭');const pages=[...document.querySelectorAll('[data-fade-page-key]')].filter(p=>p.dataset.fadePageKey===pageKey(e));if(!pages.length)throw Error('请先打开此标签，再拖到独立窗口');if(pages.some(p=>[...p.querySelectorAll('[contenteditable=true],textarea')].some(el=>(el.value??el.textContent??'').trim())||p.querySelector('[data-composer-attachment],[data-visible-attachments],[data-fade-control=stop],button[aria-label*="停止"],button[aria-label*="Stop"]'))||e.tab.status==='working')throw Error('此标签有未发送内容或正在生成，请完成后再拖到独立窗口');if(e.type==='gpt'&&!api.gpt.canTransfer(e.tab))throw Error('聊天仍在生成或状态尚未就绪，请稍后再移动');if(e.home||e.tab.location?.pathname==='/')return {type:e.type,home:true};const location=e.tab.location;if(!location||!/^\/(local|c)\//.test(location.pathname))throw Error('请先保存这条聊天，再拖到独立窗口');return {type:e.type,title:e.tab.title,path:location.pathname}}
  if(action==='import'){
   if(pendingTransfer)throw Error('正在接收另一个标签');pendingTransfer=true;const previousPending=pendingPane;
   try{
    if(!enabled&&!set(true))throw Error('窗口模式尚未就绪');
    if(data.fresh){for(const p of layout.panes)for(const key of [...p.tabs]){const e=entry(key);if(e)api[e.type].close(e.type==='gpt'?e.tab.id:e.tab)}layout.panes.splice(0);focus=null;pendingPane=null}
    const p=pendingPane?.type===data.type?pendingPane:layout.panes.find(p=>p.type===data.type)??layout.add(data.type);focus=p;pendingPane=p;
    if(data.home)blank(p);
    else if(data.type==='gpt'){if(!api.gpt.ready)throw Error('GPT 尚未就绪');api.gpt.openHistory({id:decodeURIComponent(data.path.slice(3)),title:data.title})}
    else{const r=fadeNativeRouter(document);if(!r)throw Error('聊天尚未就绪');r.navigator.push({pathname:data.path,search:''},{sidebarProductMode:'codex'})}
    for(let i=0;i<100;i++){
     api.codex.sync();sync();const received=entries().find(e=>e.type===data.type&&(data.home?p.tabs.includes(e.key):e.tab.location?.pathname===data.path));
     if(received&&[...document.querySelectorAll('[data-fade-page-key]')].some(el=>el.dataset.fadePageKey===pageKey(received)))return true;
     await new Promise(resolve=>globalThis.setTimeout(resolve,100));if(dead)throw Error('窗口已关闭');
    }
    throw Error('目标聊天尚未加载，原标签仍保留');
   }finally{pendingTransfer=false;pendingPane=previousPending}
  }
  if(action==='commit'){await transfer('export',data);const p=layout.owner(data.key);if(p)closeTab(p,data.key);return true}throw Error('未知标签操作');
 }
 on(window,'resize',()=>{publish();closeMenu()});on(window,'storage',event=>{if(event.key==='fade-window-mode')set(event.newValue==='true',false)});
 let unsubscribe=window.fadeWindowWorkspace?.subscribe(async message=>{try{const result=await transfer(message.action,message.data);await window.fadeWindowWorkspace.request('reply',{id:message.id,result})}catch(error){await window.fadeWindowWorkspace.request('reply',{id:message.id,error:error.message})}});
 try{if(localStorage.getItem('fade-window-mode')==='true')set(true,false)}catch{}render();
 return {get enabled(){return enabled},set,transfer,destroy(){dead=true;globalThis.clearInterval(interval);unsubscribe?.();enabled=false;publish();host.removeAttribute('data-window-mode');root.removeAttribute('data-fade-window-mode');row.remove();menu.remove();button.remove();pageStyle.remove()}};
}
