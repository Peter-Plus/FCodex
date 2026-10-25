import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../src/preview-freshness.js',import.meta.url),'utf8');
const {fadeRefreshPreviewEditor:refresh,fadePreviewController:find}=vm.runInNewContext(source+';({fadeRefreshPreviewEditor,fadePreviewController})');
const own=vm.runInNewContext(source+';fadeOwnPreviewEditor');
function editor(){
 return {options:{filePath:'C:/a.js',hostId:'local'},state:{file:{contents:'old'}},savedContent:'old',baseMtimeMs:1,diskReadRevision:0,emits:0,
  getDocument(){return this.reviewDiskSnapshot?{kind:'conflict',baseContent:this.savedContent}:{kind:'ready',baseContent:this.savedContent}},
  async readFile(){return {content:'new',mtimeMs:2,sizeBytes:3}},
  applyDiskSnapshot(snapshot){this.reviewDiskSnapshot=snapshot},
  resolveExternalChange(action){assert.equal(action,'accept');this.state.file.contents=this.savedContent=this.reviewDiskSnapshot.content;this.baseMtimeMs=this.reviewDiskSnapshot.mtimeMs;this.reviewDiskSnapshot=null;this.emitState()},
  emitState(){this.emits++}
 };
}
test('manual refresh accepts native disk snapshot without saving or reopening',async()=>{
 const e=editor();await refresh(e,()=>true);assert.equal(e.state.file.contents,'new');assert.equal(e.baseMtimeMs,2);assert.equal(e.emits,1);
});
test('native external conflict with no local edits can be refreshed',async()=>{
 const e=editor();e.reviewDiskSnapshot={content:'new',mtimeMs:2};e.hasUnsavedChanges=true;await refresh(e,()=>true);assert.equal(e.state.file.contents,'new');
});
for(const reason of ['dirty','saving','selection','pending','closed'])test('protects '+reason+' editor state',async()=>{
 const e=editor();if(reason==='dirty')e.state.file.contents='local edit';if(reason==='saving')e.savePromise={};if(reason==='selection')e.selectionEdit={};if(reason==='pending')e.pendingEditorChange={};if(reason==='closed')e.isClosing=true;
 e.readFile=()=>{throw Error('must not read')};await assert.rejects(refresh(e,()=>true),/未保存/);assert.equal(e.emits,0);
});
for(const race of ['edit','save','switch','selection'])test('does not apply an obsolete disk read after '+race,async()=>{
 const e=editor();let complete;e.readFile=()=>new Promise(resolve=>complete=resolve);const job=refresh(e,()=>race!=='switch');
 if(race==='edit')e.state.file.contents='local edit';if(race==='save')e.diskReadRevision++;if(race==='selection')e.selectionEdit={};
 complete({content:'new',mtimeMs:2,sizeBytes:3});await assert.rejects(job);assert.equal(e.emits,0);assert.equal(e.savedContent,'old');
});
test('read failure leaves existing contents intact',async()=>{
 const e=editor();e.readFile=async()=>{throw Error('deleted')};await assert.rejects(refresh(e,()=>true),/deleted/);assert.equal(e.state.file.contents,'old');assert.equal(e.emits,0);
});
test('controller lookup is scoped by file and host',()=>{
 const e=editor(),pane={querySelectorAll:()=>[],querySelector:()=>null,__reactFiber$test:{memoizedState:{memoizedState:{current:e}}}};
 assert.equal(find(pane,{path:'C:/a.js',hostId:'local'}).editor,e);
 assert.equal(find(pane,{path:'C:/other.js',hostId:'local'}),null);
 assert.equal(find(pane,{path:'C:/a.js',hostId:'remote'}),null);
});
test('read-only query lookup parses exact native params and never refetches unknown editable content',()=>{
 const query={queryKey:['fetch','read-file',JSON.stringify({path:'C:/a.js',hostId:'local'})],options:{queryFn(){}},state:{data:{contents:'old'}}};
 const client={getQueryCache:()=>({getAll:()=>[query]})};const pane={querySelectorAll:()=>[],querySelector:()=>null,__reactFiber$test:{dependencies:{firstContext:{memoizedValue:client}}}};
 assert.equal(find(pane,{path:'C:/a.js',hostId:'local'}).query,query);
 pane.querySelector=()=>({});assert.equal(find(pane,{path:'C:/a.js',hostId:'local'}),null);
});

test('normalizes native slash-prefixed Windows paths and walks imperative DOM ancestors',()=>{
 const e=editor();e.options.filePath='/C:/a.js';
 const ancestor={__reactFiber$test:{memoizedState:{memoizedState:{current:e}}}},host={parentElement:ancestor};
 const pane={querySelectorAll:()=>[host],querySelector:()=>null};ancestor.parentElement=pane;
 assert.equal(find(pane,{path:'c:\\a.js',hostId:'local'}).editor,e);
});
test('native watcher only marks stale; manual refresh applies and release restores methods',async()=>{
 const e=editor();let nativeCalls=0;e.syncExternalChange=async()=>{nativeCalls++;e.applyDiskSnapshot(await e.readFile());e.emitState()};
 const original=e.syncExternalChange,apply=e.applyDiskSnapshot;const owner=own(e,()=>{});
 await e.syncExternalChange();assert.equal(nativeCalls,0);assert.equal(owner.state.stale,true);assert.equal(e.state.file.contents,'old');assert.equal(e.reviewDiskSnapshot,undefined);
 await owner.refresh(()=>true,()=>false);assert.equal(e.state.file.contents,'new');assert.equal(owner.state.stale,false);
 owner.release();assert.equal(e.syncExternalChange,original);assert.equal(e.applyDiskSnapshot,apply);
});
test('takes over an already visible external review without rejecting or saving local content',()=>{
 const e=editor();e.state.file.contents='local edit';e.reviewDiskSnapshot={content:'disk edit',mtimeMs:2};let saves=0;e.save=async()=>{saves++;return true};
 const owner=own(e,()=>{});assert.equal(e.reviewDiskSnapshot,null);assert.equal(e.state.file.contents,'local edit');assert.equal(e.savedContent,'old');assert.equal(owner.state.stale,true);assert.equal(saves,0);owner.release();
});
test('external disk snapshot from an in-flight native read cannot start native review',()=>{
 const e=editor(),owner=own(e,()=>{});e.applyDiskSnapshot({content:'disk',mtimeMs:2});e.emitState();assert.equal(e.reviewDiskSnapshot,undefined);assert.equal(owner.state.stale,true);assert.equal(e.state.file.contents,'old');owner.release();
});
test('missed watcher and same timestamp replacement are detected by content check',async()=>{
 const e=editor();e.readFile=async()=>({content:'new',mtimeMs:1,sizeBytes:3});const owner=own(e,()=>{});
 await owner.check();assert.equal(owner.state.stale,true);assert.equal(e.state.file.contents,'old');owner.release();
});
test('cannot save local edits over an external disk version',async()=>{
 const e=editor();e.state.file.contents='local';let saved=0;e.save=async()=>{saved++;return true};const owner=own(e,()=>{});
 assert.equal(await e.save(),false);assert.equal(saved,0);assert.equal(owner.state.stale,true);owner.release();
});
test('unchanged content with a new timestamp updates native save precondition',async()=>{
 const e=editor();e.state.file.contents='local';e.readFile=async()=>({content:'old',mtimeMs:9,sizeBytes:3});e.save=async()=>{assert.equal(e.baseMtimeMs,9);return true};const owner=own(e,()=>{});
 assert.equal(await e.save(),true);assert.equal(owner.state.stale,false);owner.release();
});
test('dirty refresh requires explicit confirmation and cancellation changes nothing',async()=>{
 const e=editor();e.state.file.contents='local';const owner=own(e,()=>{});let confirmations=0;
 assert.equal(await owner.refresh(()=>true,()=>{confirmations++;return false}),false);assert.equal(e.state.file.contents,'local');assert.equal(confirmations,1);
 assert.equal(await owner.refresh(()=>true,()=>true),true);assert.equal(e.state.file.contents,'new');owner.release();
});
test('new local edits during a confirmed refresh are not overwritten',async()=>{
 const e=editor();e.state.file.contents='local';let complete;e.readFile=()=>new Promise(resolve=>complete=resolve);const owner=own(e,()=>{});
 const job=owner.refresh(()=>true,()=>true);e.state.file.contents='new local edit';complete({content:'disk',mtimeMs:2});await assert.rejects(job,/发生变化/);assert.equal(e.state.file.contents,'new local edit');owner.release();
});
test('unreadable disk keeps stale notice and blocks saves until read succeeds',async()=>{
 const e=editor();e.save=async()=>true;e.readFile=async()=>{throw Error('deleted')};const owner=own(e,()=>{});
 await owner.check();assert.match(owner.state.error.message,/deleted/);assert.equal(await e.save(),false);
 e.readFile=async()=>({content:'old',mtimeMs:3});await owner.check();assert.equal(owner.state.error,null);assert.equal(await e.save(),true);owner.release();
});
test('disposal during an asynchronous read makes its result inert',async()=>{
 const e=editor();let complete;e.readFile=()=>new Promise(resolve=>complete=resolve);let calls=0;const owner=own(e,()=>calls++);
 const job=owner.check();owner.release();complete({content:'new',mtimeMs:2});await job;assert.equal(calls,0);assert.equal(e.state.file.contents,'old');
});
