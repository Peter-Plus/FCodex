// Included only in the isolated Windows prototype's main bundle.
const fadeWindowElectron=require('electron');
const fadeCustomWindows=new WeakSet();
const fadeLogDirectory=require('node:path').join(process.env.FADE_LAUNCHER_PATH?require('node:path').dirname(process.env.FADE_LAUNCHER_PATH):fadeWindowElectron.app.getPath('userData'),'.fade-logs');
const fadeErrorLog=require('./fade-error-log.cjs').createErrorLog({
 directory:fadeLogDirectory,
 metadata:{...require('./fade-build-info.json'),electron:process.versions.electron,platform:process.platform,osRelease:require('node:os').release(),arch:process.arch,pid:process.pid}
});
fadeWindowElectron.ipcMain.handle('fade:open-error-log-folder',async event=>{
 const w=fadeWindowElectron.BrowserWindow.fromWebContents(event.sender);
 if(!w||!fadeCustomWindows.has(w)||event.senderFrame!==event.sender.mainFrame||!/^app:\/\/-\/index\.html(?:[?#]|$)/.test(event.senderFrame.url))throw Error('Unsupported window');
 // Only this fixed directory is exposed; never open a renderer-provided path.
 await require('node:fs/promises').mkdir(fadeLogDirectory,{recursive:true});
 const error=await fadeWindowElectron.shell.openPath(fadeLogDirectory);
 if(error)throw Error(error);
});
fadeWindowElectron.ipcMain.on('fade:report-error',(event,record)=>{
 try{
  const w=fadeWindowElectron.BrowserWindow.fromWebContents(event.sender);
  if(!w||!fadeCustomWindows.has(w)||event.senderFrame!==event.sender.mainFrame||!/^app:\/\/-\/index\.html(?:[?#]|$)/.test(event.senderFrame.url))return;
  if(!record||typeof record.operation!=='string'||typeof record.message!=='string')return;
  fadeErrorLog.report(record.operation,record);
 }catch{}
});
// Monitor rather than handle: preserve Electron/native fatal-error semantics.
process.on('uncaughtExceptionMonitor',error=>fadeErrorLog.report('main.uncaught-exception',error));
fadeWindowElectron.app.on('before-quit',()=>{void fadeErrorLog.flush()});
const fadeWindowState=w=>({custom:true,fullscreen:w.isFullScreen(),maximized:w.isMaximized(),minimized:w.isMinimized()});
function fadeRegisterWindow(w){
 fadeCustomWindows.add(w);
 w.webContents.on('render-process-gone',(_event,details)=>{if(details.reason!=='clean-exit')fadeErrorLog.report('renderer.process-gone',`reason=${details.reason}; exitCode=${details.exitCode}`)});
 w.webContents.on('unresponsive',()=>fadeErrorLog.report('renderer.unresponsive','Renderer became unresponsive'));
 // The native bootstrap sets the official AUMID. Override the window's shell
 // identity too: setIcon alone does not override a grouped taskbar icon.
 if(process.platform==='win32'&&process.env.FADE_LAUNCHER_PATH&&process.env.FADE_ICON_PATH){
  const appId='FCodex.Purple.Desktop';
  fadeWindowElectron.app.setAppUserModelId(appId);
  // Some bundled Electron builds omit this API. Shell metadata must never
  // prevent the native window and startup view from being initialized.
  if(typeof w.setAppDetails==='function'){
   try{w.setAppDetails({appId,relaunchCommand:'"'+process.env.FADE_LAUNCHER_PATH+'"',relaunchDisplayName:'Fade Codex',relaunchIcon:process.env.FADE_ICON_PATH})}
   catch(error){console.warn('[Fade] Optional taskbar metadata unavailable:',error.message)}
  }
 }
 w.setIcon(require('node:path').join(__dirname,'fade-codex-icon.png'));
 const refreshFadeIcon=()=>{if(!w.isDestroyed())w.setIcon(require('node:path').join(__dirname,'fade-codex-icon.png'))};
 w.on('show',refreshFadeIcon);
 w.webContents.on('did-finish-load',refreshFadeIcon);
 fadeAttachStartupView(w);
 // Theme/backdrop refreshes must not re-enable the OS caption overlay.
 w.setTitleBarOverlay=()=>{};
 const publish=()=>{if(!w.isDestroyed()&&!w.webContents.isDestroyed())w.webContents.send('fade:window-state',fadeWindowState(w))};
 for(const event of ['maximize','unmaximize','minimize','restore','enter-full-screen','leave-full-screen'])w.on(event,publish);
 w.webContents.on('did-finish-load',publish);
}
fadeWindowElectron.ipcMain.handle('fade:window-action',(event,action)=>{
 const w=fadeWindowElectron.BrowserWindow.fromWebContents(event.sender);
 if(!w||!fadeCustomWindows.has(w)||event.senderFrame!==event.sender.mainFrame||!/^app:\/\/-\/index\.html(?:[?#]|$)/.test(event.senderFrame.url))throw Error('Unsupported window');
 switch(action){
  case 'state':break;
  case 'minimize':w.minimize();break;
  case 'maximize':if(w.isFullScreen())w.setFullScreen(false);else if(w.isMaximized())w.unmaximize();else w.maximize();break;
  case 'fullscreen':w.setFullScreen(!w.isFullScreen());break;
  case 'close':fadeCloseWindow(w);return;
  default:throw Error('Unsupported window action');
 }
 return w.isDestroyed()?null:fadeWindowState(w);
});
