// Use the installed app's appearance setting so Windows caption symbols follow
// the same polarity as the renderer. This preference persists with Fade's theme.
function createNativeThemeSync(win,report){
 const bridge=win.electronBridge;
 if(!bridge?.sendMessageFromView)return {set(){},settled(){return Promise.resolve()},destroy(){}};
 let stopped=false,flight=null,desired=null,applied=null;
 const pending=new Map();
 function receive(event){
  const data=event.data;
  if(data?.type!=='fetch-response')return;
  const entry=pending.get(data.requestId);if(!entry)return;
  if(data.responseType==='success'&&(!data.status||data.status<400))entry.finish(null,data);
  else entry.finish(new Error('Native appearance setting failed'));
 }
 win.addEventListener('message',receive);
 function request(method,params){return new Promise((resolve,reject)=>{
  const requestId=win.crypto.randomUUID();
  const finish=(error,data)=>{const entry=pending.get(requestId);if(!entry)return;win.clearTimeout(entry.timer);pending.delete(requestId);error?reject(error):resolve(data)};
  const timer=win.setTimeout(()=>finish(new Error('Native appearance setting timed out')),5000);
  pending.set(requestId,{timer,finish});
  Promise.resolve().then(()=>bridge.sendMessageFromView({type:'fetch',requestId,method:'POST',url:'vscode://codex/'+method,body:JSON.stringify(params)})).catch(finish);
 })}
 const write=value=>request('set-setting',{key:'appearanceTheme',value});
 async function applyRecommendedAccent(palette){
  const read=async key=>{const response=await request('get-setting',{key});return JSON.parse(response.bodyJsonString).value};
  const updates=[];
  for(const mode of ['light','dark']){
   const key=mode==='light'?'appearanceLightChromeTheme':'appearanceDarkChromeTheme',before=await read(key);
   if(!before||typeof before!=='object'||!before.fonts)throw Error('当前原生主题配置不可用，请先在外观设置中选择主题');
   updates.push({key,before,value:{...before,accent:palette[mode],accentSource:'custom'}});
  }
  for(const update of updates){
   await request('set-setting',{key:update.key,value:update.value});
   const actual=await read(update.key);
   if(actual?.accent!==update.value.accent||actual?.accentSource!=='custom')throw Error('推荐强调色保存未生效');
  }
 }
 function flush(){
  if(stopped)return Promise.reject(new Error('Disposed'));
  if(flight)return flight;
  flight=(async()=>{while(!stopped&&desired!==applied){const value=desired;await write(value);applied=value}})().finally(()=>{flight=null});
  return flight;
 }
 return {applyRecommendedAccent,set(value){desired=value;void flush().catch(error=>{if(!stopped)report(error)})},settled:flush,destroy(){stopped=true;win.removeEventListener('message',receive);for(const entry of pending.values())entry.finish(new Error('Disposed'))}};
}
