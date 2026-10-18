function installConversationSurface(doc,accountButton){
 const assistantIcon=__FADE_AVATAR__;
 const owned=new Set(),marked=new Map(),menuStyles=new Map(),speakers=new WeakMap(),listeners=new AbortController();let frame=0,dead=false,activePlus=null;
 const label=el=>[el.getAttribute('aria-label'),el.getAttribute('title'),el.textContent].filter(Boolean).join(' ').trim();
 function mark(el,key,value=''){if(!el)return;if(!marked.has(el))marked.set(el,new Map());const attrs=marked.get(el);if(!attrs.has(key))attrs.set(key,el.getAttribute(key));if(el.getAttribute(key)!==value)el.setAttribute(key,value)}
 function account(){return [...doc.querySelectorAll('.app-shell-left-panel button')].find(el=>/open profile menu|打开个人资料菜单|打开个人资料|打开个人信息菜单|打开设置|open settings/i.test(el.getAttribute('aria-label')||''))}
 function positionAccountMenu(source){
  if(source.getAttribute('aria-expanded')!=='true')return;
  const id=source.getAttribute('aria-controls');
  let menu=id?doc.getElementById(id):null;
  if(!menu){
   const menus=[...doc.querySelectorAll('[role=menu]')].filter(el=>el.getClientRects().length&&!el.closest('[hidden]'));
   menu=menus.find(el=>source.id&&el.getAttribute('aria-labelledby')===source.id)||(menus.length===1?menus[0]:null);
  }
  if(!menu)return;
  const wrapper=menu.closest('[data-radix-popper-content-wrapper]');
  if(!wrapper)return;
  mark(menu,'data-fade-account-menu');mark(wrapper,'data-fade-account-popup');
  const anchor=source.getBoundingClientRect(),viewport=doc.documentElement.clientWidth;
  const width=Math.min(280,viewport-24),left=Math.max(12,Math.min(viewport-width-12,anchor.left+(anchor.width-width)/2));
  for(const[key,value]of Object.entries({'--fc-menu-left':left+'px','--fc-menu-width':width+'px','--fc-menu-anchor-top':anchor.top+'px'})){
   if(!menuStyles.has(wrapper))menuStyles.set(wrapper,new Map());
   const saved=menuStyles.get(wrapper);if(!saved.has(key))saved.set(key,[wrapper.style.getPropertyValue(key),wrapper.style.getPropertyPriority(key)]);
   wrapper.style.setProperty(key,value);
  }
 }
 function avatar(user=false){const el=doc.createElement('span');el.className='fc-avatar';el.setAttribute('aria-hidden','true');const image=user?account()?.querySelector('img'):null;if(image){const copy=doc.createElement('img');copy.src=image.currentSrc||image.src;copy.alt='';el.append(copy)}else if(user)el.setAttribute('data-fade-person','');else{const copy=doc.createElement('img');copy.src=assistantIcon;copy.alt='';el.append(copy)}return el}
 function isUser(el){return el.getAttribute('data-fade-speaker')==='user'||el.hasAttribute('data-local-conversation-user-anchor')||el.hasAttribute('data-user-message-bubble')||!!el.querySelector('[data-user-message-bubble],[data-local-conversation-user-anchor]')}
 function speakerRow(user){const row=doc.createElement('div');row.setAttribute('data-fade-speaker',user?'user':'assistant');row.setAttribute('data-markdown-copy','exclude');row.append(avatar(user));if(!user){const name=doc.createElement('span');name.textContent='FCodex';row.append(name)}owned.add(row);return row}
 function syncSpeakers(){
  const groups=new Map(),keep=new Set();
  for(const el of doc.querySelectorAll('[data-content-search-unit-key]')){
   if(el.closest('[data-fade-native-tools],.app-shell-left-panel'))continue;
   if(isUser(el)){
    let row=speakers.get(el);if(!row||!row.isConnected){row=speakerRow(true);speakers.set(el,row)}
    if(row.parentElement!==el)el.prepend(row);keep.add(row);continue;
   }
   // A response contains many searchable units. Use their shared native turn,
   // not the individual unit, as the identity owner.
   let turn=null;
   for(let p=el;p&&p!==doc.body;p=p.parentElement){
    if(p.hasAttribute('data-content-search-turn-key'))turn=p;
    if(p.hasAttribute('data-turn-key')){turn=p;break}
   }
   const owner=turn||el;
   if(!groups.has(owner))groups.set(owner,{first:el,turn});
  }
  for(const[owner,{first,turn}]of groups){
   let row=speakers.get(owner);if(!row||!row.isConnected){row=speakerRow(false);speakers.set(owner,row)}
   if(first===turn){if(first.firstElementChild!==row)first.prepend(row);keep.add(row);continue}
   let anchor=first;
   // Stop below any wrapper containing the user's message so the assistant
   // header cannot jump above it. Include work/elapsed blocks before the answer.
   while(turn&&anchor.parentElement&&anchor.parentElement!==doc.body&&anchor.parentElement!==turn&&!isUser(anchor.parentElement))anchor=anchor.parentElement;
   for(let prev=anchor.previousElementSibling;prev;prev=prev.previousElementSibling){
    if(isUser(prev))break;
    if(!prev.hasAttribute('data-fade-speaker'))anchor=prev;
   }
   if(anchor.parentElement){if(anchor.previousElementSibling!==row)anchor.parentElement.insertBefore(row,anchor)}
   else if(row.parentElement!==first)first.prepend(row);
   keep.add(row);
  }
  // React may replace searchable wrappers while leaving our moved headers alive.
  // Reconcile all owned headers, including leftovers from those old wrappers.
  for(const el of [...owned])if(el.hasAttribute('data-fade-speaker')&&!keep.has(el)){el.remove();owned.delete(el)}
 }
 function classify(button){const target=button.getAttribute('data-composer-navigation-target'),text=label(button);
  if(target==='add-context')return 'add';if(target==='permissions')return 'permissions';
  if(target==='reasoning'||target==='model'||/^(GPT-|模型|选择模型|Select model)/i.test(text))return 'model';
  if(/^(Send|发送|发送消息|Submit|提交|Steer|Queue|引导|排队)(\s|$)/i.test(text))return 'send';
  if(/^(Stop|停止)(\s|$)/i.test(text))return 'stop';
  if(/dictat|voice|语音输入|语音聊天|语音模式|听写/i.test(text))return 'voice';
  if(/context window|上下文|用量|usage|\d+%/i.test(text))return 'usage';
  return null;
 }
 function refresh(){
  frame=0;if(dead)return;observer.disconnect();
  for(const [el]of marked)if(!el.isConnected)marked.delete(el);
  for(const el of owned)if(!el.isConnected)owned.delete(el);
  for(const permission of doc.querySelectorAll('[data-codex-composer-root] [data-composer-navigation-target=permissions]')){mark(permission,'data-fade-control','permissions');mark(permission,'tabindex','-1')}
  for(const surface of doc.querySelectorAll('[data-codex-composer-root] [data-composer-surface-variant]')){
   if(['inline','document'].includes(surface.getAttribute('data-composer-surface-variant')))continue;
   mark(surface,'data-fade-composer');
   const body=surface.querySelector('[class*="_ComposerLayoutBody_"]')||surface;
   mark(body,'data-fade-composer-body');
   for(const input of surface.querySelectorAll('[class*="_ComposerLayoutInput_"]'))mark(input,'data-fade-composer-input');
   for(const footer of surface.querySelectorAll('[class*="_ComposerLayoutFooter_"]')){
    mark(footer,'data-fade-footer');
    for(const button of footer.querySelectorAll('button,[role=img][aria-label]')){
     if(button.hasAttribute('data-fade-idle-send'))continue;
     const kind=classify(button);if(kind)mark(button,'data-fade-control',kind);else if(button.hasAttribute('data-fade-control')){button.removeAttribute('data-fade-control')}
     if(!kind)continue;
     // Flatten only layout wrappers, leaving native buttons and event handlers intact.
     for(let parent=button.parentElement;parent&&parent!==footer;parent=parent.parentElement){if(parent.matches('button,[role=button]'))break;mark(parent,'data-fade-flatten')}
    }
    const nativeSend=[...footer.querySelectorAll('[data-fade-control=send],[data-fade-control=stop]')].some(el=>!el.hasAttribute('data-fade-idle-send'));
    let idle=footer.querySelector('[data-fade-idle-send]');
    if(!nativeSend&&!idle){idle=doc.createElement('button');idle.type='button';idle.disabled=true;idle.setAttribute('aria-label','发送');idle.setAttribute('data-fade-control','send');idle.setAttribute('data-fade-idle-send','');owned.add(idle);footer.append(idle)}
    if(idle)idle.hidden=nativeSend;
   }
  }
  syncSpeakers();
  if(accountButton){
  const source=account();
  if(source){mark(source,'data-fade-account-source');
   for(let parent=source.parentElement;parent&&parent!==doc.body;parent=parent.parentElement){mark(parent,'data-fade-account-ancestor');if(parent.matches('.app-shell-left-panel'))break}
   if(doc.documentElement?.hasAttribute('data-fade-account-access')){
    const box=accountButton.getBoundingClientRect();
    for(const [key,value]of Object.entries({left:box.left,top:box.top,width:box.width,height:box.height}))source.style.setProperty('--fc-account-'+key,value+'px');
    accountButton.style.setProperty('visibility','hidden');accountButton.setAttribute('aria-hidden','true');accountButton.setAttribute('tabindex','-1');
   }else{accountButton.style.removeProperty('visibility');accountButton.removeAttribute('aria-hidden');accountButton.removeAttribute('tabindex')}
positionAccountMenu(source);
const text=source.textContent.trim()||'账户';if(accountButton.dataset.identity!==text){accountButton.dataset.identity=text;accountButton.replaceChildren(avatar(true));const name=doc.createElement('span');name.textContent=text;accountButton.append(name)}accountButton.hidden=false}
  else accountButton.hidden=true;
  }
  observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','aria-expanded','aria-controls','data-composer-navigation-target','src']});
 }
 function schedule(){if(!frame&&!dead)frame=window.requestAnimationFrame(refresh)}
 const observer=new MutationObserver(schedule);
 doc.addEventListener('click',event=>{const plus=event.target.closest?.('[data-composer-navigation-target=add-context]');if(plus){activePlus=plus;schedule()}},{capture:true,signal:listeners.signal});
 doc.addEventListener('input',schedule,{capture:true,signal:listeners.signal});
 window.addEventListener('resize',schedule,{signal:listeners.signal});
 refresh();
 const dispose=()=>{dead=true;observer.disconnect();listeners.abort();if(frame)window.cancelAnimationFrame(frame);for(const el of owned)el.remove();for(const[el,styles]of menuStyles)for(const[key,[value,priority]]of styles){if(value)el.style.setProperty(key,value,priority);else el.style.removeProperty(key)}for(const[el,attrs]of marked)for(const[key,value]of attrs){if(value===null)el.removeAttribute(key);else el.setAttribute(key,value)}for(const el of doc.querySelectorAll('[data-composer-navigation-target=permissions]')){el.style.removeProperty('--fc-permission-x');el.style.removeProperty('--fc-permission-y')}const source=account();if(source)for(const key of ['left','top','width','height'])source.style.removeProperty('--fc-account-'+key);if(accountButton){accountButton.style.removeProperty('visibility');accountButton.removeAttribute('aria-hidden');accountButton.removeAttribute('tabindex')}};
 dispose.refresh=schedule;return dispose;
}
