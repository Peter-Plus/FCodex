import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../startup/custom-window-main.cjs',import.meta.url),'utf8');
for(const mode of ['missing','supported','throws']){
 test(`window initialization survives ${mode} taskbar metadata API`,()=>{
  const calls={};
  const electron={app:{setAppUserModelId:id=>calls.id=id},ipcMain:{handle(){}}};
  const w={setIcon:p=>calls.icon=p,on(){},webContents:{on(){}}};
  if(mode==='supported')w.setAppDetails=d=>calls.details=d;
  if(mode==='throws')w.setAppDetails=()=>{throw Error('unsupported')};
  const context={require:n=>n==='electron'?electron:requirePath(n),process:{platform:'win32',env:{FADE_LAUNCHER_PATH:'G:\\Toy\\FCodex\\Fade Codex.exe',FADE_ICON_PATH:'G:\\Toy\\FCodex\\Arts\\fade-codex.ico'}},__dirname:'bundle',console:{warn:()=>calls.warn=true},fadeAttachStartupView:()=>calls.attached=true};
  vm.createContext(context);vm.runInContext(source,context);
  assert.doesNotThrow(()=>context.fadeRegisterWindow(w));
  assert.equal(calls.id,'FCodex.Purple.Desktop');
  assert.ok(calls.icon.endsWith('fade-codex-icon.png'));
  assert.equal(calls.attached,true);
  if(mode==='supported')assert.equal(calls.details.relaunchCommand,'"G:\\Toy\\FCodex\\Fade Codex.exe"');
  if(mode==='throws')assert.equal(calls.warn,true);
 });
}
import path from 'node:path';
function requirePath(name){assert.equal(name,'node:path');return path}
