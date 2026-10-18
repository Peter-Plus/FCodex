import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';
import {readPreferences,writePreferences} from '../startup/preferences.mjs';
import {patchQuitGuard} from '../startup/quit-patch.mjs';
const policy=fs.readFileSync(new URL('../startup/quit-policy.cjs',import.meta.url),'utf8');
function harness({prefs={},response=0,activity={running:false,automations:false,pending:false},broken=false}={}){
 const calls={quit:0,close:0,dialogs:[],errors:0};
 const context=vm.createContext({console,process:{env:{FADE_LAUNCHER_PATH:'G:/Fade/Fade.exe'}},require:name=>name==='node:path'?path:{readFileSync:()=>{if(broken)throw Error('read failure');return JSON.stringify(prefs)}},fadeWindowElectron:{dialog:{showMessageBoxSync:options=>{calls.dialogs.push(options);return response},showErrorBox:()=>calls.errors++},app:{quit:()=>{if(vm.runInContext('fadeConfirmQuit',context)(()=>activity))calls.quit++}}}});
 vm.runInContext(policy,context);return {calls,context,close:()=>vm.runInContext('fadeCloseWindow',context)({close:()=>calls.close++})};
}
test('default close retains native window behavior',()=>{const h=harness();h.close();assert.equal(h.calls.close,1);assert.equal(h.calls.quit,0)});
test('enabled idle close requests normal quit without a dialog',()=>{const h=harness({prefs:{closeToQuit:true}});h.close();assert.equal(h.calls.quit,1);assert.equal(h.calls.dialogs.length,0)});
for(const reason of ['running','automations','pending'])test(reason+' prompts, cancel retains window, confirmation permits quit',()=>{
 for(const response of [0,1]){const h=harness({prefs:{closeToQuit:true},response,activity:{running:false,automations:false,pending:false,[reason]:true}});h.close();assert.equal(h.calls.quit,response);assert.equal(h.calls.close,0);assert.equal(h.calls.dialogs[0].defaultId,0);assert.equal(vm.runInContext('fadeQuitFromClose',h.context),false)}
});
test('unreadable preferences or unknown task state never exit',()=>{for(const options of [{broken:true},{prefs:{closeToQuit:true},activity:{}}]){const h=harness(options);h.close();assert.equal(h.calls.quit,0);assert.equal(h.calls.close,0);assert.equal(h.calls.errors,1)}});
test('preferences retain other options and survive reload',async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fade-quit-'));try{const file=pathToFileURL(path.join(dir,'prefs.json'));assert.equal((await readPreferences(file)).closeToQuit,false);await writePreferences({closeToQuit:true},file);await writePreferences(true,file);assert.deepEqual(await readPreferences(file),{startupFullscreen:true,closeToQuit:true});await writePreferences({closeToQuit:false},file);assert.equal((await readPreferences(file)).startupFullscreen,true);await assert.rejects(writePreferences({closeToQuit:'true'},file));}finally{fs.rmSync(dir,{recursive:true,force:true})}});
test('current native bundle accepts exactly one guard and retains native quit cleanup',()=>{
 const build=JSON.parse(fs.readFileSync(new URL('../.fade-runtime-isolated/build.json',import.meta.url)));const archive=fs.readFileSync(path.join(build.source,'resources/app.asar'));const tree=JSON.parse(archive.subarray(16,16+archive.readUInt32LE(12)));const entries=tree.files['.vite'].files.build.files;const entry=entries[Object.keys(entries).find(n=>/^main-.*\.js$/.test(n))];const offset=8+archive.readUInt32LE(4)+Number(entry.offset);const source=archive.subarray(offset,offset+entry.size).toString();const result=patchQuitGuard(source);assert.ok(result.includes('fadeQuitFromClose&&!fadeConfirmQuit'));assert.ok(result.includes('flushAndDisposeContext'));assert.throws(()=>patchQuitGuard(''),/Unsupported/);new vm.Script(policy+result);
});
