(()=>{
 const {contextBridge,ipcRenderer}=require('electron');
 contextBridge.exposeInMainWorld('fadeStartup',{
  onTarget(callback){const listener=(_event,data)=>callback(data);ipcRenderer.on('fade:startup-target',listener);return ()=>ipcRenderer.removeListener('fade:startup-target',listener)},
  complete(){ipcRenderer.send('fade:startup-complete')}
 });
})();
