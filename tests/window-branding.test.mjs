import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../startup/custom-window-main.cjs',import.meta.url),'utf8');
for(const mode of ['missing','supported','throws']){
 test(`window initialization survives ${mode} taskbar metadata API`,()=>{
  const calls={};
  const electron={app:{on(){},setAppUserModelId:id=>calls.id=id},ipcMain:{handle(){},on(){}}};
  const w={setIcon:p=>calls.icon=p,on(){},webContents:{on(){}}};
  if(mode==='supported')w.setAppDetails=d=>calls.details=d;
  if(mode==='throws')w.setAppDetails=()=>{throw Error('unsupported')};
  const context={require:n=>n==='electron'?electron:requirePath(n),process:{on(){},versions:{electron:'test'},platform:'win32',env:{FADE_LAUNCHER_PATH:'G:\\Toy\\FCodex\\Fade Codex.exe',FADE_ICON_PATH:'G:\\Toy\\FCodex\\Arts\\fade-codex.ico'}},__dirname:'bundle',console:{warn:()=>calls.warn=true},fadeAttachStartupView:()=>calls.attached=true};
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
function requirePath(name){if(name==='./fade-error-log.cjs')return {createErrorLog:()=>({report(){},flush(){}})};if(name==='./fade-build-info.json')return {};if(name==='node:os')return {release:()=> 'test'};assert.equal(name,'node:path');return path}

test('preload exposes narrow diagnostics and window controls and preserves their IPC',async()=>{
 const exposed={},calls=[];
 const ipcRenderer={send:(...args)=>calls.push(args),invoke:async(...args)=>{calls.push(args);return {custom:true}},on(){},removeListener(){}};
 const context=vm.createContext({require:name=>{assert.equal(name,'electron');return {contextBridge:{exposeInMainWorld:(name,api)=>exposed[name]=api},ipcRenderer}}});
 vm.runInContext(fs.readFileSync(new URL('../startup/custom-window-preload.cjs',import.meta.url),'utf8'),context);
 assert.deepEqual(Object.keys(exposed),['fadeDiagnostics','fadeWindowControls']);
 for(const action of ['state','minimize','maximize','fullscreen','close'])await exposed.fadeWindowControls.action(action);
 assert.deepEqual(calls.map(args=>args[0]),Array(5).fill('fade:window-action'));
 await assert.rejects(exposed.fadeWindowControls.action('detach'),/Unsupported/);
 exposed.fadeDiagnostics.report({operation:'preview.save',message:'x'.repeat(10000),body:'must not be sent'});
 assert.equal(calls.at(-1)[0],'fade:report-error');assert.equal(calls.at(-1)[1].message.length,4000);assert.equal(calls.at(-1)[1].body,undefined);
 await exposed.fadeDiagnostics.openFolder('ignored-path');assert.deepEqual(calls.at(-1),['fade:open-error-log-folder']);
});

test('opening error logs creates and opens only the fixed directory; rejects foreign frames and shell errors',async()=>{
 const handlers={},calls=[],frame={url:'app://-/index.html'},sender={mainFrame:null};sender.mainFrame=frame;let shellError='';
 const w={setIcon(){},on(){},webContents:{on(){}}};
 const electron={app:{on(){},getPath:()=>'/profile'},ipcMain:{handle:(name,fn)=>handlers[name]=fn,on(){}},BrowserWindow:{fromWebContents:()=>w},shell:{openPath:async p=>{calls.push(['open',p]);return shellError}}};
 const c=vm.createContext({require:name=>name==='electron'?electron:name==='node:fs/promises'?{mkdir:async(p,options)=>calls.push(['mkdir',p,options.recursive])}:requirePath(name),process:{env:{},versions:{},on(){}},__dirname:'.',fadeAttachStartupView(){}});
 vm.runInContext(source,c);const open=handlers['fade:open-error-log-folder'];
 await assert.rejects(open({sender,senderFrame:frame}),/Unsupported/);assert.equal(calls.length,0);
 c.fadeRegisterWindow(w);await assert.rejects(open({sender,senderFrame:{url:frame.url}}),/Unsupported/);assert.equal(calls.length,0);
 await open({sender,senderFrame:frame},'unexpected.txt');const directory=path.join('/profile','.fade-logs');assert.deepEqual(calls,[['mkdir',directory,true],['open',directory]]);
 shellError='Explorer unavailable';await assert.rejects(open({sender,senderFrame:frame}),/Explorer unavailable/);
});

test('diagnostic IPC accepts only registered primary app frames',()=>{
 const handlers={},records=[],frame={url:'app://-/index.html'},sender={mainFrame:null};sender.mainFrame=frame;
 const w={setIcon(){},on(){},webContents:{on(){}}};
 const electron={app:{on(){},getPath:()=>'.'},ipcMain:{handle(){},on:(name,fn)=>handlers[name]=fn},BrowserWindow:{fromWebContents:()=>w}};
 const c=vm.createContext({require:name=>name==='electron'?electron:name==='./fade-error-log.cjs'?{createErrorLog:()=>({report:(...args)=>records.push(args),flush(){}})}:requirePath(name),process:{env:{},versions:{},on(){}},__dirname:'.',fadeAttachStartupView(){}});
 vm.runInContext(source,c);const report=handlers['fade:report-error'],record={operation:'preview.save',message:'failed'};
 report({sender,senderFrame:frame},record);assert.equal(records.length,0);
 c.fadeRegisterWindow(w);report({sender,senderFrame:{url:frame.url}},record);assert.equal(records.length,0);
 frame.url='https://example.com';report({sender,senderFrame:frame},record);assert.equal(records.length,0);
 frame.url='app://-/index.html';report({sender,senderFrame:frame},record);assert.equal(records.length,1);
});
