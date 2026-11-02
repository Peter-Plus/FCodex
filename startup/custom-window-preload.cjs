// Narrow renderer bridge: no Node or generic IPC exposed to the page.
(()=>{const {contextBridge,ipcRenderer}=require('electron');
 contextBridge.exposeInMainWorld('fadeDiagnostics',{
  openFolder:()=>ipcRenderer.invoke('fade:open-error-log-folder'),
  report:record=>{try{if(record&&typeof record.operation==='string'&&typeof record.message==='string')ipcRenderer.send('fade:report-error',{uiRevision:typeof record.uiRevision==='string'?record.uiRevision.slice(0,64):'',operation:record.operation.slice(0,120),message:record.message.slice(0,4000),name:typeof record.name==='string'?record.name.slice(0,80):'',stack:typeof record.stack==='string'?record.stack.slice(0,6000):''})}catch{}}
 });
 contextBridge.exposeInMainWorld('fadeWindowControls',{
  closeToQuitSupported:true,
  startupStatus:()=>ipcRenderer.invoke('fade:startup-status'),
  action:action=>{if(!['state','minimize','maximize','fullscreen','close'].includes(action))return Promise.reject(Error('Unsupported action'));return ipcRenderer.invoke('fade:window-action',action)},
  subscribe:callback=>{const listener=(_event,state)=>callback(state);ipcRenderer.on('fade:window-state',listener);return ()=>ipcRenderer.removeListener('fade:window-state',listener)}
 });
})();
