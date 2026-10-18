// A local, sandboxed renderer in a separate session; never load native app code here.
const fadeStartupViews=new WeakMap();
function fadeAttachStartupView(w){
 if(process.env.FADE_STARTUP_VIEW!=='1')return;
 const {WebContentsView}=fadeWindowElectron;
 const path=require('node:path');
 const view=new WebContentsView({webPreferences:{
  preload:path.join(__dirname,'fade-startup-preload.cjs'),
  partition:'fade-startup-'+w.id+'-'+Date.now(),sandbox:true,contextIsolation:true,nodeIntegration:false,
  backgroundThrottling:false
 }});
 const animationContents=view.webContents;
 view.setBackgroundColor('#00000000');
 const state={view,active:true,loaded:false,finishing:false,error:null,mainPid:0,animationPid:0};
 // This packaged Electron build does not serve ASAR files through file://.
 // Serve only our four local assets in the animation's private session.
 animationContents.session.protocol.handle('app',async request=>{
  const url=new URL(request.url),allowed=['fade-startup.html','fade-startup.js','fade-intro.mp4','fade-loop.mp4'];
  const name=url.pathname.slice(1);
  if(url.hostname!=='-'||!allowed.includes(name))return new Response(null,{status:404});
  try{
   const data=await require('node:fs/promises').readFile(path.join(__dirname,'../../webview',name));
   const type=name.endsWith('.mp4')?'video/mp4':name.endsWith('.js')?'text/javascript':'text/html';
   const headers={'Content-Type':type,'Accept-Ranges':'bytes','Cache-Control':'no-store'};
   const range=request.headers.get('range');
   if(range){
    const match=/^bytes=(\d+)-(\d*)$/.exec(range);
    const start=match?Number(match[1]):-1,end=match&&match[2]?Math.min(Number(match[2]),data.length-1):data.length-1;
    if(start<0||start>=data.length||end<start)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+data.length}});
    headers['Content-Range']=`bytes ${start}-${end}/${data.length}`;headers['Content-Length']=String(end-start+1);
    return new Response(data.subarray(start,end+1),{status:206,headers});
   }
   headers['Content-Length']=String(data.length);return new Response(data,{headers});
  }catch{return new Response(null,{status:404})}
 });
 fadeStartupViews.set(w,state);
 let polling,busy=false,lastTarget='',targetReady=false,timeout,resizeTimer;
 // BrowserWindow's native content can be attached/reordered after construction.
 // Keep the startup view last (topmost), including after load/show/resize.
 const surface=()=>{
  if(!state.active||state.finishing||w.isDestroyed())return;
  const parent=w.contentView;
  if(parent.children.at(-1)!==view)parent.addChildView(view);
  if(!view.getVisible())view.setVisible(true);
 };
 state.surface=surface;
 const fit=()=>{if(!state.active||w.isDestroyed())return;const [width,height]=w.getContentSize();view.setBounds({x:0,y:0,width,height});const zoom=w.webContents.getZoomFactor();if(animationContents.getZoomFactor()!==zoom)animationContents.setZoomFactor(zoom)};
 const resize=()=>{targetReady=false;fit();surface();clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{fit();surface()},50)};
 const destroy=()=>{
  if(!state.active)return;state.active=false;clearInterval(polling);clearTimeout(timeout);clearTimeout(resizeTimer);
  w.removeListener('resize',resize);w.removeListener('resized',resize);w.removeListener('closed',destroy);
  for(const event of ['show','ready-to-show','restore'])w.removeListener(event,surface);
  if(!w.isDestroyed()&&!w.webContents.isDestroyed())for(const event of ['did-start-loading','dom-ready','did-finish-load'])w.webContents.removeListener(event,surface);
  if(!w.isDestroyed())w.contentView.removeChildView(view);
  if(!animationContents.isDestroyed())animationContents.close();
 };
 state.finish=async()=>{
  if(!state.active||state.finishing)return;state.finishing=true;
  try{
   // Paint the home orb underneath the final animation frame before removing the view.
   await Promise.race([w.webContents.executeJavaScript(`new Promise(resolve=>{
    if(window.__fadeInPageState)window.__fadeInPageState.done=true;
    window.__fadeCodex?.setStartupCovered?.(false);
    const orb=document.getElementById('fade-codex-layer')?.shadowRoot?.querySelector('#orbButton');if(orb)orb.style.visibility='';
    requestAnimationFrame(()=>requestAnimationFrame(resolve));
   })`),new Promise(r=>setTimeout(r,2000))]);
  }catch{}finally{destroy();if(!w.isDestroyed())w.webContents.focus()}
 };
 w.contentView.addChildView(view);fit();w.on('resize',resize);w.on('resized',resize);w.once('closed',destroy);
 for(const event of ['show','ready-to-show','restore'])w.on(event,surface);
 for(const event of ['did-start-loading','dom-ready','did-finish-load'])w.webContents.on(event,surface);
 setImmediate(surface);
 animationContents.setWindowOpenHandler(()=>({action:'deny'}));
 animationContents.on('will-navigate',event=>event.preventDefault());
 animationContents.on('render-process-gone',(_event,details)=>{state.error='Animation renderer exited: '+details.reason;state.finish()});
 animationContents.on('before-input-event',(event,input)=>{if(input.type==='keyDown'&&input.key==='Escape'){event.preventDefault();state.finish()}});
 animationContents.once('did-finish-load',()=>{
  state.loaded=true;
  state.mainPid=w.webContents.getOSProcessId();state.animationPid=animationContents.getOSProcessId();
  if(state.mainPid&&state.animationPid&&state.mainPid===state.animationPid){state.error='Animation renderer is not isolated';state.finish();return}
  clearTimeout(timeout);animationContents.focus();
  fit();surface();
 });
 timeout=setTimeout(()=>{state.error='Animation page load timeout';state.finish()},15000);
 polling=setInterval(async()=>{
  surface();
  if(!state.active||!state.loaded||state.finishing||busy||w.isDestroyed())return;busy=true;
  try{
   state.mainPid=w.webContents.getOSProcessId();state.animationPid=animationContents.getOSProcessId();
   if(state.mainPid&&state.animationPid&&state.mainPid===state.animationPid){state.error='Animation renderer is not isolated';state.finish();return}
   const zoom=w.webContents.getZoomFactor();if(animationContents.getZoomFactor()!==zoom){animationContents.setZoomFactor(zoom);targetReady=false;}
   if(targetReady)return;
   const data=await w.webContents.executeJavaScript(`(()=>{
    if(window.__fadeInPageState?.done)return null;
    if(!window.__fadeInPageState)window.__fadeInPageState={done:false,isolated:true};
    const runtime=window.__fadeCodex;if(!runtime)return null;
    runtime.setStartupCovered?.(true);const target=runtime.prepareStartupHome?.();
    if(!target)return null;
    const orb=document.getElementById('fade-codex-layer')?.shadowRoot?.querySelector('#orbButton');if(orb)orb.style.visibility='hidden';
    return {target,theme:document.documentElement.dataset.theme};
   })()`);
   const key=JSON.stringify(data);
   if(data&&state.active&&!animationContents.isDestroyed()){
    if(key!==lastTarget){animationContents.send('fade:startup-target',data);lastTarget=key}
    targetReady=true;
   }
  }catch{}finally{busy=false}
 },250);
 animationContents.loadURL('app://-/fade-startup.html').catch(error=>{state.error=error.message;state.finish()});
}
fadeWindowElectron.ipcMain.handle('fade:startup-status',event=>{
 const w=fadeWindowElectron.BrowserWindow.fromWebContents(event.sender);
 if(!w||!fadeCustomWindows.has(w)||event.senderFrame!==event.sender.mainFrame)throw Error('Unsupported startup caller');
 const s=fadeStartupViews.get(w);
 return s?{active:s.active,mainPid:s.mainPid,animationPid:s.animationPid,error:s.error,topmost:s.active&&w.contentView.children.at(-1)===s.view,visible:s.active&&s.view.getVisible(),bounds:s.active?s.view.getBounds():null}:null;
});
fadeWindowElectron.ipcMain.on('fade:startup-complete',event=>{
 for(const w of fadeWindowElectron.BrowserWindow.getAllWindows()){
  const s=fadeStartupViews.get(w);
  if(s?.view.webContents===event.sender&&event.senderFrame===event.sender.mainFrame){s.finish();return}
 }
});
