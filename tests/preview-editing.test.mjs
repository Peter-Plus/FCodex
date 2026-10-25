import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const own=vm.runInNewContext(fs.readFileSync(new URL('../src/preview-freshness.js',import.meta.url),'utf8')+';fadeOwnPreviewEditor');
function setup(readOnly=false){
 let disk={content:'old',mtimeMs:1},writes=0,autosaves=0,view;
 const e={options:{onStateChange(value){view=value}},state:{file:{contents:'old'},isReadOnly:readOnly},savedContent:'old',baseMtimeMs:1,
  getDocument(){return {kind:'ready',baseContent:this.savedContent}},
  readFile:async()=>({...disk}),applyDiskSnapshot(){},resolveExternalChange(){},
  emitState(){this.options.onStateChange(this.state)},clearAutosaveTimeout(){},
  scheduleAutosave(){autosaves++},async saveUntilClean(){return this.save()},
  updateContent(value){if(this.state.isReadOnly)return;this.state.file.contents=value;this.scheduleAutosave();this.emitState()},
  completeEdit(value){this.updateContent(value.contents);return 'accept'},
  async save(){if(this.baseMtimeMs!==disk.mtimeMs)return false;writes++;disk={content:this.state.file.contents,mtimeMs:disk.mtimeMs+1};this.savedContent=disk.content;this.baseMtimeMs=disk.mtimeMs;this.emitState();return true},
 };
 return {e,get disk(){return disk},set disk(value){disk=value},get writes(){return writes},get autosaves(){return autosaves},get view(){return view},own:()=>own(e,()=>{},true)};
}
test('defaults to true read-only UI and rejects native editing callbacks until unlocked',async()=>{
 const x=setup(),o=x.own();assert.equal(x.view.isReadOnly,true);x.e.updateContent('blocked');assert.equal(x.e.completeEdit({contents:'blocked'}),'reject');assert.equal(x.e.state.file.contents,'old');
 await o.setLocked(false);assert.equal(x.view.isReadOnly,false);x.e.updateContent('local');assert.equal(o.dirty,true);assert.equal(x.autosaves,0);
 assert.equal(await x.e.save(),false);assert.equal(await x.e.saveUntilClean(),false);assert.equal(x.writes,0);
 await o.setLocked(true);assert.equal(x.view.isReadOnly,true);assert.equal(await o.saveNow(),true);assert.equal(x.disk.content,'local');assert.equal(o.dirty,false);o.release();
});
test('manual save refuses external changes and unreadable disk, preserving local content',async()=>{
 const x=setup(),o=x.own();await o.setLocked(false);x.e.updateContent('local');x.disk={content:'external',mtimeMs:2};
 assert.equal(await o.saveNow(),false);assert.equal(o.state.stale,true);assert.equal(x.writes,0);assert.equal(x.e.state.file.contents,'local');
 x.e.readFile=async()=>{throw Error('missing')};assert.equal(await o.saveNow(),false);assert.equal(x.writes,0);o.release();
});
test('native CAS still rejects a disk change between checking and writing',async()=>{
 const x=setup(),o=x.own();await o.setLocked(false);x.e.updateContent('local');x.e.readFile=async()=>{const old={...x.disk};x.disk={content:'raced',mtimeMs:2};return old};
 assert.equal(await o.saveNow(),false);assert.equal(x.writes,0);assert.equal(x.disk.content,'raced');o.release();
});
test('cleanup cannot re-enable close-time autosave; reattachment retains native manual save',async()=>{
 const x=setup();let o=x.own();await o.setLocked(false);x.e.updateContent('local');o.release();
 assert.equal(await x.e.saveUntilClean(),false);assert.equal(await x.e.save(),false);assert.equal(x.writes,0);
 o=x.own();assert.equal(o.state.locked,true);assert.equal(await o.saveNow(),true);assert.equal(x.writes,1);o.release();
});
test('native read-only restrictions are not lifted by unlocking',async()=>{
 const x=setup(true),o=x.own();assert.equal(o.editable,false);await o.setLocked(false);assert.equal(x.view.isReadOnly,true);x.e.updateContent('blocked');assert.equal(x.e.state.file.contents,'old');o.release();
});
test('pending edits finish before relocking and save waits for native buffer',async()=>{
 const x=setup(),o=x.own();await o.setLocked(false);let finish;x.e.waitForPendingEditorChange=()=>new Promise(r=>finish=r);
 const lock=o.setLocked(true);assert.equal(o.state.locked,false);x.e.updateContent('pending edit');finish();await lock;assert.equal(o.state.locked,true);
 const save=o.saveNow();assert.equal(x.writes,0);finish();assert.equal(await save,true);assert.equal(x.disk.content,'pending edit');o.release();
});
