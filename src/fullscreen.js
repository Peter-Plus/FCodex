function installFullscreenControls(){
 const button=$('#headerFullscreenToggle'),controls=$('#fullscreenWindowControls');
 let nativeFullscreen=false,menuPromise,busy=false,customWindow=false,maximized=false,unsubscribe;
 const windowApi=window.fadeWindowControls;
 const restoreButton=$('#fullscreenRestore');
 function applyWindowState(state){if(!state?.custom)return;customWindow=true;nativeFullscreen=state.fullscreen;maximized=state.maximized;sync()}
 async function windowAction(action){try{applyWindowState(await windowApi.action(action))}catch{announce('窗口操作失败，请重试')}}
 const isFullscreen=()=>nativeFullscreen||!!document.fullscreenElement;
 function sync(){const full=isFullscreen();full?host.setAttribute('data-fullscreen',''):host.removeAttribute('data-fullscreen');button.setAttribute('aria-pressed',String(full));button.title=full?'退出全屏':'全屏';button.setAttribute('aria-label',button.title);controls.hidden=!(full||customWindow);restoreButton.title=full?'退出全屏':maximized?'还原窗口':'最大化';restoreButton.setAttribute('aria-label',restoreButton.title);restoreButton.setAttribute('data-maximized',String(maximized&&!full))}
 async function nativeMenu(){
  if(!menuPromise)menuPromise=(async()=>{
   const url=[...document.querySelectorAll('link[href]')].map(e=>e.href).find(u=>/\/app-shared-[^/]+\.js$/.test(u));
   if(!url)throw Error('Native module unavailable');
   const module=await import(url),api=Object.values(module).find(v=>v&&typeof v==='object'&&v.applicationMenu)?.applicationMenu;
   if(!api)throw Error('Native menu unavailable');return api;
  })().catch(error=>{menuPromise=null;throw error});return menuPromise;
 }
 async function toggle(){
  if(busy)return;busy=true;
  try{
   if(customWindow)await windowAction('fullscreen');
   else if(document.fullscreenElement)await document.exitFullscreen();
   else if(window.electronBridge){const api=await nativeMenu(),snapshot=await api.getSnapshot();const item=snapshot['view-menu']?.find(i=>i.accelerator==='F11');if(!item?.enabled)throw Error('Fullscreen action unavailable');await api.invokeItem(item.nativeCommandId)}
   else await document.documentElement.requestFullscreen();
  }catch{announce('全屏切换失败，请使用 F11 重试')}finally{busy=false;sync()}
 }
 on(button,'click',toggle);
 on($('#fullscreenRestore'),'click',()=>{if(customWindow)void windowAction('maximize');else if(isFullscreen())void toggle()});
 for(const action of ['minimize','close'])on($('#fullscreen'+(action==='minimize'?'Minimize':'Close')),'click',()=>{
  if(customWindow)void windowAction(action);else if(typeof window.__fadeWindowAction==='function')window.__fadeWindowAction(JSON.stringify({action,title:document.title}));else announce('窗口控制尚未连接，请重新运行 Fade 启动器');
 });
 on(window,'message',event=>{if(event.data?.type==='window-fullscreen-changed'){nativeFullscreen=event.data.isFullScreen===true;window.__fadeNativeFullscreen=nativeFullscreen;sync()}});
 on(document,'fullscreenchange',sync);
 on(window,'fade-window-action-error',()=>announce('窗口操作失败，请使用系统窗口菜单重试'));
 on(window,'keydown',event=>{if(event.key==='Escape'&&nativeFullscreen&&!event.defaultPrevented){event.preventDefault();void toggle()}});
 // Native fullscreen can already be active when the theme is reinjected.
 nativeFullscreen=window.__fadeNativeFullscreen??(!!window.screen&&Math.abs(window.outerHeight-window.screen.height)<2&&Math.abs(window.outerWidth-window.screen.width)<2);
 if(windowApi){unsubscribe=windowApi.subscribe(applyWindowState);void windowApi.action('state').then(applyWindowState).catch(()=>{})}
 sync();return ()=>{unsubscribe?.();host.removeAttribute('data-fullscreen')};
}



