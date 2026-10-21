// Narrow renderer bridge: no Node or generic IPC exposed to the page.
(()=>{const {contextBridge,ipcRenderer}=require('electron');
 contextBridge.exposeInMainWorld('fadeWindowControls',{
  closeToQuitSupported:true,
  startupStatus:()=>ipcRenderer.invoke('fade:startup-status'),
  action:action=>{if(!['state','minimize','maximize','fullscreen','close'].includes(action))return Promise.reject(Error('Unsupported action'));return ipcRenderer.invoke('fade:window-action',action)},
  subscribe:callback=>{const listener=(_event,state)=>callback(state);ipcRenderer.on('fade:window-state',listener);return ()=>ipcRenderer.removeListener('fade:window-state',listener)}
 });
})();
