// Used only for the explicit Fade close-to-quit action.
let fadeQuitFromClose=false;
function fadeConfirmQuit(readActivity){
 try{
  const state=readActivity();
  if(typeof state.running!=='boolean'||typeof state.automations!=='boolean'||typeof state.pending!=='boolean')throw Error('Unknown activity state');
  if(!state.running&&!state.automations&&!state.pending)return true;
  const details=[];
  if(state.running)details.push('有本地任务正在运行，退出可能中断任务。');
  if(state.pending)details.push('有工作区聊天正在创建，退出可能中断创建。');
  if(state.automations)details.push('已启用本地自动任务，退出后可能无法按时运行。');
  return fadeWindowElectron.dialog.showMessageBoxSync({type:'warning',title:'退出 Fade Codex',message:'确定退出 Fade Codex？',detail:details.join('\n'),buttons:['取消','退出'],defaultId:0,cancelId:0,noLink:true})===1;
 }catch(error){
  fadeWindowElectron.dialog.showErrorBox('暂未退出','无法确认任务状态，请稍后重试。');
  console.warn('[Fade] Quit check failed:',error.message);return false;
 }
}
function fadeCloseWindow(w){
 let enabled=false;
 try{
  const file=require('node:path').join(require('node:path').dirname(process.env.FADE_LAUNCHER_PATH),'.fade-preferences.json');
  try{enabled=JSON.parse(require('node:fs').readFileSync(file,'utf8')).closeToQuit===true}catch(error){if(error.code!=='ENOENT')throw error}
 }catch(error){fadeWindowElectron.dialog.showErrorBox('关闭设置读取失败','未关闭窗口，请稍后重试。');return}
 if(!enabled){w.close();return}
 if(fadeQuitFromClose)return;
 fadeQuitFromClose=true;
 try{fadeWindowElectron.app.quit()}finally{fadeQuitFromClose=false}
}
