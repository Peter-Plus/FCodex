function fadeWslAttachmentPath(path){
 if(typeof path!=='string')return path;
 const match=/^([a-z]):[\\/](.*)$/i.exec(path);
 return match?'/mnt/'+match[1].toLowerCase()+'/'+match[2].replace(/\\/g,'/'):path;
}
// Copy submission data only: never modify the composer attachments or preview src.
function fadeWslAttachmentArguments(args){
 const paths=new Map(),seen=new WeakMap();
 function visit(value,key='',depth=0){
  if(!value||typeof value!=='object'||depth>24)return value;
  if(seen.has(value))return seen.get(value);
  if(!Array.isArray(value)&&Object.getPrototypeOf(value)!==Object.prototype)return value;
  const copy=Array.isArray(value)?[]:{...value};seen.set(value,copy);
  let changed=false;
  for(const [k,v]of Object.entries(value)){
   let next=v;
   if((k==='localPath'&&key==='imageAttachments')||(k==='path'&&value.type==='localImage')||(['path','fsPath'].includes(k)&&value.isImageAttachment===true)){
    next=fadeWslAttachmentPath(v);if(next!==v){paths.set(v,next);paths.set(v.replace(/\\/g,'/'),next)}
   }else if(k!=='src'&&k!=='prompt'&&k!=='text')next=visit(v,Array.isArray(value)?key:k,depth+1);
   copy[k]=next;if(next!==v)changed=true;
  }
  const result=changed?copy:value;seen.set(value,result);return result;
 }
 const result=visit(args);
 // Native already-serialized follow-ups can include a generated image file list.
 // Change only the path on image-attachment headings, never user prose.
 function metadata(value,depth=0){
  if(!value||typeof value!=='object'||depth>24)return value;
  if(!Array.isArray(value)&&Object.getPrototypeOf(value)!==Object.prototype)return value;
  if(value.type==='text'&&typeof value.text==='string'){
   const text=value.text.replace(/(^## [^\r\n]*: )([^\r\n]+)(\r?\nImage attachment: true(?:\r?\n|$))/gm,(all,prefix,path,suffix)=>paths.has(path)?prefix+paths.get(path)+suffix:all);
   return text===value.text?value:{...value,text};
  }
  let changed=false;const copy=Array.isArray(value)?[]:{...value};
  for(const [k,v]of Object.entries(value)){const next=metadata(v,depth+1);copy[k]=next;if(next!==v)changed=true}
  return changed?copy:value;
 }
 return paths.size?metadata(result):result;
}
// The native composer submits through a returned coordinator. Convert the prepared
// execution payload, not the queued message or its Windows-backed preview context.
function fadeWrapWslTurnCoordinator(service,enabled){
 const functions=new Map();
 return new Proxy(service,{get(target,key){
  if(key==='__fadeWslTurnCoordinator')return true;
  const value=Reflect.get(target,key,target);
  if(typeof value!=='function')return value;
  if(functions.has(key))return functions.get(key);
  const wrapped=(...args)=>{
   const index=key==='sendMessage'?1:key==='sendQueuedMessageNow'?3:-1;
   if(index>=0&&typeof args[index]==='function'){
    const prepare=args[index];
    args[index]=async function(...input){
     const result=await Reflect.apply(prepare,this,input);
     // Execution host can differ from the manager host (for example remote work).
     return enabled()&&result?.executionHostId==='local'?fadeWslAttachmentArguments(result):result;
    };
   }
   const result=Reflect.apply(value,target,args);
   return key==='dup'?fadeWrapWslTurnCoordinator(result,enabled):result;
  };
  functions.set(key,wrapped);return wrapped;
 }});
}
function fadeWrapWslAttachmentService(service,enabled,cache=new WeakMap()){
 if(cache.has(service))return cache.get(service);
 const methods=new Set(['startConversation','startTurn','startTurnWithOutcome','sendFollowUpMessage','steerTurn','editLastUserTurn','startEmptyTurn']);
 const functions=new Map();
 const proxy=new Proxy(service,{get(target,key){
  if(key==='__fadeWslAttachmentBridge')return true;
  const value=Reflect.get(target,key,target);
  if(typeof value!=='function')return value;
  if(functions.has(key))return functions.get(key);
  const wrapped=(...args)=>{const result=Reflect.apply(value,target,methods.has(key)&&enabled()?fadeWslAttachmentArguments(args):args);return key==='getTurnCoordinator'?Promise.resolve(result).then(coordinator=>fadeWrapWslTurnCoordinator(coordinator,enabled)):key==='dup'?fadeWrapWslAttachmentService(result,enabled,cache):result};
  functions.set(key,wrapped);return wrapped;
 }});cache.set(service,proxy);return proxy;
}
function installWslImagePaths(doc=document,win=window){
 const key='fade-wsl-image-attachments';let enabled=false,dead=false,ready=false,timer=0,unwatch=null;
 const installed=new Map(),cache=new WeakMap();
 try{enabled=win.localStorage.getItem(key)==='true';win.localStorage.removeItem('fade-wsl-image-paths')}catch{}
 function hook(provider){
  if(!provider||typeof provider.forHost!=='function')return;
  if(installed.has(provider)){ready=provider.forHost===installed.get(provider).wrapper;return}
  const original=provider.forHost;
  function wrapper(host,...args){const service=Reflect.apply(original,this,[host,...args]);return host==='local'?fadeWrapWslAttachmentService(service,()=>!dead&&enabled,cache):service}
  try{provider.forHost=wrapper;if(provider.forHost!==wrapper)return;installed.set(provider,{original,wrapper});ready=true}catch{}
 }
 async function init(){
  try{
   const links=[...doc.querySelectorAll('link[href]')],initial=links.find(l=>/app-initial-.*\.js$/.test(l.href)),shared=links.find(l=>/app-shared-.*\.js$/.test(l.href));
   if(!initial||!shared)throw Error('native modules unavailable');
   const [module,common]=await Promise.all([import(initial.href),import(shared.href)]);if(dead)return;
   if(!module.JPr||typeof module.YPr!=='function')throw Error('unsupported attachment RPC');
   let scope;
   for(const button of doc.querySelectorAll('button')){let fiber=button[Object.keys(button).find(k=>k.startsWith('__reactFiber$'))];for(let d=0;fiber&&d<40;d++,fiber=fiber.return)for(let h=fiber.memoizedState;h&&typeof h==='object';h=h.next){const candidate=h.memoizedState?.current;if(candidate?.scope===common.Cot&&typeof candidate.get==='function'){scope=candidate;break}}if(scope)break}
   if(!scope)throw Error('native scope unavailable');
   const sync=()=>{ready=false;hook(scope.get(module.JPr))};sync();
   if(typeof scope.watch==='function')unwatch=scope.watch(({get})=>{const provider=get(module.JPr);if(!dead){ready=false;hook(provider)}});
  }catch(error){if(!dead)timer=win.setTimeout(init,2000)}
 }
 function storage(event){if(event.key===key||event.key===null)try{enabled=win.localStorage.getItem(key)==='true'}catch{enabled=false}}
 win.addEventListener('storage',storage);void init();
 return {get enabled(){return enabled},get ready(){return ready},set(value){if(value&&!ready)throw Error('原生附件接口尚未就绪，请稍后重试');enabled=!!value;try{win.localStorage.setItem(key,String(enabled))}catch{}},destroy(){dead=true;ready=false;win.clearTimeout(timer);unwatch?.();win.removeEventListener('storage',storage);for(const [provider,{original,wrapper}]of installed)if(provider.forHost===wrapper)provider.forHost=original;installed.clear()}};
}
