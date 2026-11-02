// Use the installed app's appearance setting so Windows caption symbols follow
// the same polarity as the renderer. This preference persists with Fade's theme.
function createNativeThemeSync(win,report,{loadSettings}={}){
 const bridge=win.electronBridge;
 if(!bridge?.sendMessageFromView)return {set(){return Promise.resolve(false)},settled(){return Promise.resolve()},destroy(){}};
 let stopped=false,flight=null,desired=null,applied=null;
 let settingsPromise;
 async function settings(){
  if(!settingsPromise)settingsPromise=(async()=>{
   if(loadSettings)return loadSettings();
   const url=[...(win.document?.querySelectorAll('link[href]')||[])].map(link=>link.href).find(url=>/\/assets\/app-shared-[\w-]+\.js(?:\?|$)/.test(url));
   if(!url)return null;
   const module=await import(url);
   return Object.values(module).find(value=>value&&typeof value==='object'&&typeof value.settings?.read==='function'&&typeof value.settings?.write==='function')?.settings||null;
  })().catch(error=>{settingsPromise=null;throw error});
  return settingsPromise;
 }
 const pending=new Map();
 function receive(event){
  const data=event.data;
  if(data?.type!=='fetch-response')return;
  const entry=pending.get(data.requestId);if(!entry)return;
  if(data.responseType==='success'&&(!data.status||data.status<400))entry.finish(null,data);
  else {
   const detail=typeof data.error==='string'?data.error.slice(0,1000):'';
   entry.finish(new Error('Native appearance setting failed ('+entry.method+'; status '+(data.status??'unknown')+')'+(detail?': '+detail:'')));
  }
 }
 win.addEventListener('message',receive);
 function legacyRequest(method,params){return new Promise((resolve,reject)=>{
  const requestId=win.crypto.randomUUID();
  const finish=(error,data)=>{const entry=pending.get(requestId);if(!entry)return;win.clearTimeout(entry.timer);pending.delete(requestId);error?reject(error):resolve(data)};
  const timer=win.setTimeout(()=>finish(new Error('Native appearance setting timed out')),5000);
  pending.set(requestId,{timer,finish,method});
  Promise.resolve().then(()=>bridge.sendMessageFromView({type:'fetch',requestId,method:'POST',url:'vscode://codex/'+method,body:JSON.stringify(params)})).catch(finish);
 })}
 async function request(method,params){
  const api=await settings();if(stopped)throw Error('Disposed');
  if(!api)return legacyRequest(method,params);
  // Current Codex uses disposable platform calls, not vscode fetch handlers.
  const call=method==='get-setting'?api.read(params.key):api.write(params.key,params.value);
  return new Promise((resolve,reject)=>{
   const id=win.crypto.randomUUID();
   const finish=(error,value)=>{const entry=pending.get(id);if(!entry)return;pending.delete(id);win.clearTimeout(entry.timer);try{call?.[Symbol.dispose]?.()}catch{}error?reject(error):resolve(method==='get-setting'?{bodyJsonString:JSON.stringify({value:value?.effective})}:{} )};
   const timer=win.setTimeout(()=>finish(Error('Native appearance setting timed out ('+method+')')),5000);
   pending.set(id,{timer,finish,method});Promise.resolve(call).then(value=>finish(null,value),finish);
  });
 }
 const write=value=>request('set-setting',{key:'appearanceTheme',value});
 // Electron's native theme settings default to undefined. Match its renderer
 // defaults before persisting a complete theme (the set-setting schema requires it).
 const defaultThemes={
  light:{contrast:45,ink:'#1a1c1f',surface:'#ffffff',semanticColors:{diffAdded:'#00a240',diffRemoved:'#ba2623',skill:'#924ff7'}},
  dark:{contrast:60,ink:'#ffffff',surface:'#181818',semanticColors:{diffAdded:'#40c977',diffRemoved:'#fa423e',skill:'#ad7bf9'}}
 };
 // Seeds from the bundled native Catppuccin Latte/Mocha themes, using the
 // same color selection as the native preset picker. The code theme ID loads
 // native syntax highlighting; fonts, contrast and opacity remain user choices.
 const catppuccin={
  light:{accent:'#8839ef',surface:'#eff1f5',ink:'#4c4f69',semanticColors:{diffAdded:'#40a02b',diffRemoved:'#d20f39',skill:'#8839ef'}},
  dark:{accent:'#cba6f7',surface:'#1e1e2e',ink:'#cdd6f4',semanticColors:{diffAdded:'#a6e3a1',diffRemoved:'#f38ba8',skill:'#cba6f7'}}
 };
 async function applyCatppuccinTheme(){
  const read=async key=>{const response=await request('get-setting',{key});return JSON.parse(response.bodyJsonString).value};
  const matches=(actual,expected)=>expected!==null&&typeof expected==='object'?actual!==null&&typeof actual==='object'&&Object.entries(expected).every(([key,value])=>matches(actual[key],value)):actual===expected;
  const updates=[];
  for(const mode of ['light','dark']){
   const key=mode==='light'?'appearanceLightChromeTheme':'appearanceDarkChromeTheme',before=await read(key);
   if(before!=null&&(typeof before!=='object'||Array.isArray(before)))throw Error('当前原生主题配置格式无效');
   const defaults=defaultThemes[mode];
   updates.push({key:mode==='light'?'appearanceLightCodeThemeId':'appearanceDarkCodeThemeId',value:'catppuccin'});
   updates.push({key,value:{opaqueWindows:false,...defaults,...before,fonts:{code:null,ui:null,...before?.fonts},...catppuccin[mode],accentSource:'custom'}});
  }
  for(const update of updates){
   await request('set-setting',{key:update.key,value:update.value});
   const actual=await read(update.key);
   if(!matches(actual,update.value))throw Error('Catppuccin 主题保存未生效');
  }
 }
 function flush(){
  if(stopped)return Promise.reject(new Error('Disposed'));
  if(flight)return flight;
  flight=(async()=>{while(!stopped&&desired!==applied){const value=desired;await write(value);applied=value}})().finally(()=>{flight=null});
  return flight;
 }
 return {applyCatppuccinTheme,set(value){desired=value;return flush().then(()=>true,error=>{if(!stopped){globalThis.__fadeReportError?.('native-theme.apply',error);report(error)};return false})},settled:flush,destroy(){stopped=true;win.removeEventListener('message',receive);for(const entry of pending.values())entry.finish(new Error('Disposed'))}};
}
