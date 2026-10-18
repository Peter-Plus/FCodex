function createFadeBackgroundStore(win){
 let database=null,stopped=false;
 const ready=new Promise((resolve,reject)=>{
  const request=win.indexedDB.open('fcodex-backgrounds',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('themes');
  request.onerror=()=>reject(request.error);
  request.onblocked=()=>reject(Error('请关闭其他旧版 FCodex 窗口后重试'));
  request.onsuccess=()=>{if(stopped){request.result.close();reject(Error('设置已关闭'));return}database=request.result;database.onversionchange=()=>database.close();resolve(database)};
 });
 async function transact(mode,value){
  const db=await ready;if(stopped)throw Error('设置已关闭');
  return new Promise((resolve,reject)=>{const tx=db.transaction('themes',value===undefined?'readonly':'readwrite'),store=tx.objectStore('themes');const request=value===undefined?store.get(mode):store.put(value,mode);tx.oncomplete=()=>resolve(request.result);tx.onabort=tx.onerror=()=>reject(tx.error||Error('本机存储不可用'));});
 }
 return {read:mode=>transact(mode),write:(mode,value)=>transact(mode,value),close(){stopped=true;database?.close()}};
}
function normalizeFadeBackground(value){
 const v=value&&typeof value==='object'?value:{};
 const image=typeof v.image==='string'&&v.image.length<14000000&&/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v.image)?v.image:'';
 const bound=(k,a,b,d)=>Number.isFinite(v[k])?Math.max(a,Math.min(b,v[k])):d;
 return {rotation:bound('rotation',-180,180,0),x:bound('x',-100,100,0),y:bound('y',-100,100,0),zoom:bound('zoom',25,300,100),blur:bound('blur',0,30,0),kind:['solid','paper','custom'].includes(v.kind)&&!(v.kind==='custom'&&!image)?v.kind:'paper',image,name:typeof v.name==='string'?v.name.slice(0,160):'',strength:Number.isFinite(v.strength)?Math.max(0,Math.min(100,v.strength)):35,fit:v.fit==='tile'?'tile':'cover'};
}
async function prepareFadeBackground(file,win){
 if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('请选择 PNG、JPG 或 WebP 图片');
 if(file.size>10*1024*1024)throw Error('图片需小于 10 MB');
 const url=win.URL.createObjectURL(file),image=new win.Image();
 try{
  image.src=url;await image.decode();
  if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>40000000)throw Error('图片尺寸过大，请选择不超过 4000 万像素的图片');
  const scale=Math.min(1,2560/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=win.document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  return {image:canvas.toDataURL('image/webp',.86),name:file.name};
 }catch(error){throw Error(error.message.includes('像素')?error.message:'图片无法读取，请换一张有效的 PNG、JPG 或 WebP 图片')}
 finally{win.URL.revokeObjectURL(url)}
}
function installBackgroundSettings({doc=document,shadow,announce=()=>{}}){
 const win=doc.defaultView,root=doc.documentElement,store=createFadeBackgroundStore(win),controller=new win.AbortController();
 const on=(el,event,fn)=>el.addEventListener(event,fn,{signal:controller.signal});
 const state={light:normalizeFadeBackground(),dark:normalizeFadeBackground()};let presets=[];let dead=false,loaded=false,busy=false,returnFocus=null;
 const original=root.getAttribute('data-fade-background');
 const keys=['--fc-custom-background','--fc-custom-wash','--fc-custom-size','--fc-custom-repeat','--fc-custom-transform','--fc-custom-blur','--fc-custom-opacity'];
 const originalStyles=keys.map(key=>[key,root.style.getPropertyValue(key),root.style.getPropertyPriority(key)]);
 const overlay=doc.createElement('div');overlay.className='fade-background-overlay';overlay.hidden=true;
 overlay.innerHTML='<section class="fade-background-dialog" role="dialog" aria-modal="true" aria-labelledby="fadeBackgroundTitle"><header><div><h2 id="fadeBackgroundTitle">正文背景</h2><p>亮色与暗色分别设置，切换主题时自动应用。</p></div><button type="button" class="background-close" aria-label="关闭背景设置">×</button></header><div class="background-themes"></div><p class="background-status" role="status" aria-live="polite">正在读取设置…</p><p class="background-note">自定义图片仅保存在本机。支持 PNG、JPG、WebP，最大 10 MB。</p></section>';
 shadow.append(overlay);const status=overlay.querySelector('.background-status'),sections=new Map();
 for(const mode of ['light','dark']){
  const section=doc.createElement('section');section.className='background-theme';section.dataset.mode=mode;
  section.innerHTML=`<h3>${mode==='light'?'亮色背景':'暗色背景'}</h3><div class="background-choices" role="group" aria-label="${mode==='light'?'亮色':'暗色'}背景"><button type="button" data-kind="solid" aria-pressed="false"><span class="background-swatch solid" aria-hidden="true"></span><span>极简</span></button><button type="button" data-kind="paper" aria-pressed="false"><span class="background-swatch paper" aria-hidden="true"></span><span>牛皮纸</span></button><button type="button" data-kind="custom" aria-pressed="false"><span class="background-swatch custom" aria-hidden="true">＋</span><span>自定义</span></button></div><div class="background-presets"></div><div class="background-custom" hidden><div class="background-file-row"><span class="background-filename"></span><button type="button" data-action="upload">更换图片</button><button type="button" data-action="remove">移除</button></div><label class="background-strength">图片强度 <output>35%</output><input type="range" min="0" max="100" step="1" aria-label="${mode==='light'?'亮色':'暗色'}背景图片强度"></label><label class="background-fit">显示方式<select aria-label="${mode==='light'?'亮色':'暗色'}背景显示方式"><option value="cover">填充</option><option value="tile">平铺</option></select></label><div class="background-transforms"></div><div class="background-save"><input type="text" maxlength="40" aria-label="预设名称" placeholder="为这个背景命名"><button type="button" data-action="save">保存预设</button></div></div><input class="background-file" type="file" accept="image/png,image/jpeg,image/webp" hidden>`;
  overlay.querySelector('.background-themes').append(section);sections.set(mode,section);
  for(const [key,label,min,max,unit]of [['rotation','旋转',-180,180,'°'],['x','水平位置',-100,100,'%'],['y','垂直位置',-100,100,'%'],['zoom','缩放',25,300,'%'],['blur','模糊',0,30,'px']]){
   const el=doc.createElement('label');el.className='background-strength';el.innerHTML=`${label} <output></output><input type="range" data-adjust="${key}" min="${min}" max="${max}" step="1" aria-label="${mode==='light'?'亮色':'暗色'}背景${label}">`;section.querySelector('.background-transforms').append(el);
   const input=el.querySelector('input');input.dataset.unit=unit;
   on(input,'input',()=>{el.querySelector('output').textContent=input.value+unit;apply({...state[mode],[key]:Number(input.value)},mode)});
   on(input,'change',()=>void commit(mode,{...state[mode],[key]:Number(input.value)}));
  }
  on(section.querySelector('[data-action=save]'),'click',()=>{
   const input=section.querySelector('.background-save input'),name=input.value.trim();
   if(!name){status.textContent='请先填写预设名称';input.focus();return}
   void savePresets([...presets,{id:win.crypto.randomUUID(),title:name,value:{...state[mode]}}]).then(ok=>{if(ok)input.value=''})
  });
  on(section.querySelector('.background-presets'),'click',event=>{
   const button=event.target.closest('button[data-preset]');if(!button)return;
   const preset=presets.find(p=>p.id===button.dataset.preset);if(!preset)return;
   if(button.dataset.action==='delete')void savePresets(presets.filter(p=>p.id!==preset.id));else void commit(mode,preset.value);
  });
  const file=section.querySelector('input[type=file]');
  for(const button of section.querySelectorAll('[data-kind]'))on(button,'click',()=>{const kind=button.dataset.kind;if(kind==='custom'&&!state[mode].image){file.click();return}void commit(mode,{...state[mode],kind})});
  on(section.querySelector('[data-action=upload]'),'click',()=>file.click());
  on(section.querySelector('[data-action=remove]'),'click',()=>void commit(mode,{...state[mode],image:'',name:'',kind:'paper'}));
  on(file,'change',()=>{const chosen=file.files[0];file.value='';if(chosen)void commit(mode,async()=>({...state[mode],...await prepareFadeBackground(chosen,win),kind:'custom'}))});
  const range=section.querySelector('input[type=range]');on(range,'input',()=>{section.querySelector('output').textContent=range.value+'%'});
  on(range,'change',()=>void commit(mode,{...state[mode],strength:Number(range.value)}));
  on(section.querySelector('select'),'change',event=>void commit(mode,{...state[mode],fit:event.target.value}));
 }
 function apply(preview,previewMode){
  if(dead)return;const mode=root.dataset.fadePolarity==='light'?'light':'dark',value=previewMode===mode?preview:state[mode];
  root.setAttribute('data-fade-background',value.kind);
  if(value.kind==='custom'){
   root.style.setProperty('--fc-custom-transform',`translate(${value.x}%,${value.y}%) rotate(${value.rotation}deg) scale(${value.zoom/100})`);
   root.style.setProperty('--fc-custom-blur',value.blur+'px');root.style.setProperty('--fc-custom-opacity',String(value.strength/100));
   root.style.setProperty('--fc-custom-background',`url("${value.image}")`);
   root.style.setProperty('--fc-custom-wash',`rgb(${mode==='light'?'245 245 244':'36 36 36'} / ${100-value.strength}%)`);
   root.style.setProperty('--fc-custom-size',value.fit==='tile'?'720px auto':'cover');root.style.setProperty('--fc-custom-repeat',value.fit==='tile'?'repeat':'no-repeat');
  }else for(const key of keys)root.style.removeProperty(key);
 }
 function render(){
  if(dead)return;
  for(const [mode,section]of sections){const value=state[mode];for(const button of section.querySelectorAll('[data-kind]'))button.setAttribute('aria-pressed',String(button.dataset.kind===value.kind));
   section.querySelector('.background-custom').hidden=value.kind!=='custom';
   const swatch=section.querySelector('.custom');swatch.style.backgroundImage=value.image?`url("${value.image}")`:'';swatch.textContent=value.image?'':'＋';
   section.querySelector('.background-filename').textContent=value.name||'尚未选择图片';section.querySelector('.background-filename').title=value.name;
   section.querySelector('input[type=range]').value=value.strength;section.querySelector('output').textContent=value.strength+'%';section.querySelector('select').value=value.fit;
   for(const input of section.querySelectorAll('[data-adjust]')){input.value=value[input.dataset.adjust];input.previousElementSibling.textContent=input.value+input.dataset.unit}
   const list=section.querySelector('.background-presets');list.replaceChildren();
   for(const preset of presets){
    const row=doc.createElement('div');row.className='background-preset-row';
    const choose=doc.createElement('button');choose.type='button';choose.dataset.preset=preset.id;choose.textContent=preset.title;choose.title=preset.title;choose.setAttribute('aria-pressed',String(JSON.stringify(value)===JSON.stringify(preset.value)));
    const remove=doc.createElement('button');remove.type='button';remove.dataset.preset=preset.id;remove.dataset.action='delete';remove.textContent='删除';remove.setAttribute('aria-label','删除预设 '+preset.title);row.append(choose,remove);list.append(row);
   }
   for(const control of section.querySelectorAll('button,input,select'))control.disabled=busy||!loaded;
  }
 }
 async function savePresets(next){
  if(dead||busy||!loaded)return false;busy=true;render();
  try{await store.write('presets',next);if(dead)return false;presets=next;status.textContent='预设已保存。删除预设不改变当前背景';channel?.postMessage('changed');return true}
  catch(error){if(!dead)status.textContent='保存失败：'+error.message;return false}
  finally{busy=false;render()}
 }
 async function commit(mode,next){
  if(dead||busy||!loaded)return;busy=true;render();status.textContent='正在保存…';
  try{const value=normalizeFadeBackground(typeof next==='function'?await next():next);if(dead)return;await store.write(mode,value);if(dead)return;state[mode]=value;apply();status.textContent=(mode==='light'?'亮色':'暗色')+'背景已保存';channel?.postMessage('changed')}
  catch(error){if(!dead){status.textContent='保存失败：'+error.message;announce(status.textContent)}}
  finally{busy=false;apply();render()}
 }
 async function load(){
  try{const values=await Promise.all(['light','dark','presets'].map(mode=>store.read(mode)));if(dead)return;state.light=normalizeFadeBackground(values[0]);state.dark=normalizeFadeBackground(values[1]);presets=Array.isArray(values[2])?values[2].filter(p=>p&&typeof p.id==='string'&&typeof p.title==='string'&&p.value?.kind==='custom').map(p=>({id:p.id,title:p.title.slice(0,40),value:normalizeFadeBackground(p.value)})):[];loaded=true;apply();render();status.textContent='更改会自动保存'}
  catch(error){if(!dead){status.textContent='背景设置读取失败：'+error.message;render()}}
 }
 const channel=win.BroadcastChannel?new win.BroadcastChannel('fcodex-backgrounds'):null;
 if(channel)channel.onmessage=()=>{if(!busy)void load()};
 const themeObserver=new win.MutationObserver(apply);themeObserver.observe(root,{attributes:true,attributeFilter:['data-fade-polarity']});
 function close(){overlay.hidden=true;if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true})}
 on(overlay.querySelector('.background-close'),'click',close);
 on(overlay,'pointerdown',event=>{if(event.target===overlay)close()});
 on(overlay,'keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close()}else if(event.key==='Tab'){const items=[...overlay.querySelectorAll('button,input,select')].filter(e=>!e.disabled&&e.getClientRects().length);const first=items[0],last=items.at(-1),active=shadow.activeElement;if(event.shiftKey&&active===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&active===last){event.preventDefault();first?.focus()}}});
 apply();render();const ready=load();
 return {ready,open(){if(dead)return;returnFocus=shadow.querySelector('#fadeSettingsToggle')||shadow.activeElement;overlay.hidden=false;overlay.querySelector('.background-close').focus()},close,get:mode=>({...state[mode]}),destroy(){dead=true;controller.abort();themeObserver.disconnect();channel?.close();store.close();overlay.remove();if(original===null)root.removeAttribute('data-fade-background');else root.setAttribute('data-fade-background',original);for(const[key,value,priority]of originalStyles){if(value)root.style.setProperty(key,value,priority);else root.style.removeProperty(key)}}};
}
