// Opaque drag offers are scoped to registered application windows and expire quickly.
const fadeWorkspaceFactories=new WeakMap(),fadeWorkspaceOffers=new Map(),fadeWorkspaceReplies=new Map();
let fadeWorkspaceSerial=0,fadeCreatingWorkspaceWindow=false;
function fadeWorkspaceWindow(event){
 const w=fadeWindowElectron.BrowserWindow.fromWebContents(event.sender);
 if(!w||!fadeCustomWindows.has(w)||event.senderFrame!==event.sender.mainFrame||!/^app:\/\/-\/index\.html(?:[?#]|$)/.test(event.senderFrame.url))throw Error('Unsupported workspace sender');
 return w;
}
function fadeWorkspaceWatch(w){
 w.webContents.on('before-input-event',(_event,input)=>{if(input.key==='Escape')for(const [token,offer]of fadeWorkspaceOffers)if(offer.source===w&&!offer.busy)fadeWorkspaceOffers.delete(token)});
 w.once('closed',()=>{for(const [token,offer]of fadeWorkspaceOffers)if(offer.source===w)fadeWorkspaceOffers.delete(token);for(const [id,pending]of fadeWorkspaceReplies)if(pending.sender===w.webContents){clearTimeout(pending.timer);fadeWorkspaceReplies.delete(id);pending.reject(Error('窗口已关闭，迁移已取消'))}});
}
function fadeWorkspaceCall(w,action,data){return new Promise((resolve,reject)=>{
 if(w.isDestroyed())return reject(Error('窗口已关闭'));
 const id=++fadeWorkspaceSerial,timer=setTimeout(()=>{fadeWorkspaceReplies.delete(id);reject(Error('窗口响应超时，原标签仍保留'))},15000);
 fadeWorkspaceReplies.set(id,{sender:w.webContents,resolve,reject,timer});w.webContents.send('fade:workspace-command',{id,action,data});
})}
async function fadeWorkspaceCreate(source){
 const factory=fadeWorkspaceFactories.get(source);if(!factory)throw Error('当前运行时不支持新建窗口');
 let w;fadeCreatingWorkspaceWindow=true;
 try{w=await factory({initialRoute:'/',show:false})}finally{fadeCreatingWorkspaceWindow=false}
 try{
  const fs=require('node:fs/promises'),path=require('node:path');
  const css=await fs.readFile(path.join(__dirname,'fade-workspace-theme.css'),'utf8'),js=await fs.readFile(path.join(__dirname,'fade-workspace-ui.js'),'utf8');
  for(let i=0;i<150;i++){if(w.isDestroyed())throw Error('新窗口已关闭');if(await w.webContents.executeJavaScript('!!document.querySelector("[data-app-shell-frame]")'))break;await new Promise(r=>setTimeout(r,100))}
  await w.webContents.executeJavaScript(`(()=>{const s=document.createElement('style');s.id='fade-codex-style';s.textContent=${JSON.stringify(css)};document.head.append(s)})()`);
  await w.webContents.executeJavaScript(js);
  for(let i=0;i<100;i++){if(await w.webContents.executeJavaScript('!!window.__fadeCodex?.windowModeReady?.()'))return w;await new Promise(r=>setTimeout(r,100))}
  throw Error('新窗口加载超时，原标签仍保留');
 }catch(error){if(!w.isDestroyed())w.destroy();throw error}
}
fadeWindowElectron.ipcMain.handle('fade:workspace',async(event,action,data={})=>{
 const w=fadeWorkspaceWindow(event);
 if(action==='reply'){const pending=fadeWorkspaceReplies.get(data.id);if(!pending||pending.sender!==event.sender)throw Error('Invalid reply');fadeWorkspaceReplies.delete(data.id);clearTimeout(pending.timer);data.error?pending.reject(Error(String(data.error).slice(0,300))):pending.resolve(data.result);return true}
 if(action==='offer'){
  if(!/^[a-f\d-]{36}$/i.test(data.token)||!['codex','gpt'].includes(data.type)||typeof data.key!=='string'||data.key.length>1000)throw Error('Invalid drag');
  for(const [key,offer]of fadeWorkspaceOffers)if(offer.expires<Date.now()||offer.source===w)fadeWorkspaceOffers.delete(key);
  fadeWorkspaceOffers.set(data.token,{source:w,key:data.key,type:data.type,expires:Date.now()+60000,busy:false});return true;
 }
 if(!['claim','detach'].includes(action))throw Error('Unsupported workspace action');
 const offer=fadeWorkspaceOffers.get(data.token);if(!offer||offer.expires<Date.now()||offer.source.isDestroyed()||offer.busy)throw Error('标签拖动已结束');
 if(action==='detach'&&offer.source!==w)throw Error('Invalid drag owner');
 if(action==='claim'&&(data.type!==offer.type||offer.source===w))throw Error('只能移动到另一个同类型窗口');
 if(action==='detach'){
  const point=fadeWindowElectron.screen.getCursorScreenPoint();
  // A failed drop inside any app window is a cancellation, not a detach.
  if(fadeWindowElectron.BrowserWindow.getAllWindows().some(other=>{if(!other.isVisible())return false;const b=other.getBounds();return point.x>=b.x&&point.y>=b.y&&point.x<b.x+b.width&&point.y<b.y+b.height}))return false;
 }
 offer.busy=true;let destination=w,created=false,imported=false;
 try{
  const payload=await fadeWorkspaceCall(offer.source,'export',{key:offer.key});
  if(!payload||payload.type!==offer.type||!payload.home&&(typeof payload.path!=='string'||!(payload.type==='codex'?/^\/local\/[^/?#]+$/:/^\/c\/[^/?#]+$/).test(payload.path)))throw Error('Invalid tab destination');
  if(action==='detach'){destination=await fadeWorkspaceCreate(offer.source);created=true}
  await fadeWorkspaceCall(destination,'import',{...payload,fresh:created});
  imported=true;
  if(created){const point=fadeWindowElectron.screen.getCursorScreenPoint(),area=fadeWindowElectron.screen.getDisplayNearestPoint(point).workArea,b=destination.getBounds();destination.setPosition(Math.max(area.x,Math.min(point.x-100,area.x+area.width-b.width)),Math.max(area.y,Math.min(point.y-20,area.y+area.height-b.height)));destination.show()}
  await fadeWorkspaceCall(offer.source,'commit',{key:offer.key});fadeWorkspaceOffers.delete(data.token);return true;
 }catch(error){if(created&&!imported&&!destination.isDestroyed())destination.destroy();offer.busy=false;throw error}
});
