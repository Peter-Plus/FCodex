import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {createTestArea,retireTestArea} from './work-area.mjs';
const {createErrorLog,clean}=createRequire(import.meta.url)('../startup/error-log.cjs');

test('idle produces no files; real errors persist with context, deduplication and rotation',async()=>{
 const area=await createTestArea('error-log');
 try{
  let now=Date.now();const directory=path.join(area,'logs');
  const log=createErrorLog({directory,metadata:{viewRevision:'test-build'},now:()=>now,maxBytes:14000});
  await log.flush();await assert.rejects(fs.stat(directory),{code:'ENOENT'});
  const error=new Error('save failed token=secret');
  log.report('preview.save',error);for(let i=0;i<1000;i++)log.report('preview.save',error);
  await log.flush();
  let lines=(await fs.readFile(path.join(directory,'errors.jsonl'),'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(lines.length,1);assert.equal(lines[0].viewRevision,'test-build');assert.match(lines[0].stack,/error-log.test.mjs/);assert.ok(!lines[0].message.includes('secret'));
  now+=60001;log.report('preview.save',error);await log.flush();
  lines=(await fs.readFile(path.join(directory,'errors.jsonl'),'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(lines[1].suppressedRepeats,1000);
  for(let i=0;i<8;i++){now+=60001;log.report('large-'+i,{message:'x'.repeat(4000),stack:'s'.repeat(6000)});await log.flush()}
  for(const name of ['errors.jsonl','errors.jsonl.1'])assert.ok((await fs.stat(path.join(directory,name))).size<=14000);
  assert.equal((await fs.readdir(directory)).length,2);
 }finally{await retireTestArea(area)}
});

test('write failures are isolated and backed off; idle and bursts are bounded',async()=>{
 let calls=0,now=Date.now();const io={mkdir:async()=>{calls++;throw Error('disk full')}};
 const log=createErrorLog({directory:'unused',io,now:()=>now});
 await log.flush();assert.equal(calls,0);
 for(let i=0;i<10000;i++)log.report('error-'+i,new Error('failure'));
 await log.flush();assert.equal(calls,1);
 log.report('later','failure');await log.flush();assert.equal(calls,1);
 now+=60001;log.report('retry','failure');await log.flush();assert.equal(calls,2);
 assert.doesNotThrow(()=>log.report('hostile',{get message(){throw Error('getter')}}));
});

test('renderer is idle until failure, caps IPC, catches global errors and installs only once',async()=>{
 const source=await fs.readFile(new URL('../src/error-reporting.js',import.meta.url),'utf8');
 const events={},records=[];let listeners=0,now=Date.now();
 const context=vm.createContext({Date:{now:()=>now},window:{addEventListener:(name,fn)=>{listeners++;events[name]=fn},fadeDiagnostics:{report:record=>records.push(record)}}});
 vm.runInContext(source,context);vm.runInContext(source,context);assert.equal(listeners,2);assert.equal(records.length,0);
 for(let i=0;i<1000;i++)events.error({error:new Error('broken')});
 assert.equal(records.length,1);assert.match(records[0].stack,/broken/);
 events.unhandledrejection({reason:new Error('rejected')});assert.equal(records[1].operation,'renderer.unhandled-rejection');
 for(let i=0;i<1000;i++)context.__fadeReportError('unique-'+i,'failure');assert.equal(records.length,60);
 now+=60001;context.__fadeReportError('next','failure');assert.equal(records.length,61);
 context.window.fadeDiagnostics.report=()=>{throw Error('closed bridge')};assert.doesNotThrow(()=>context.__fadeReportError('disconnect','failure'));
});

test('diagnostics sanitize credentials and do not stringify arbitrary payloads',()=>{
 const text=clean('Bearer abc123 token=private https://host/path?secret=123 C:\\Users\\Alice\\file sk-secret');
 for(const secret of ['abc123','private','secret=123','Alice','sk-secret'])assert.ok(!text.includes(secret));
 assert.equal(clean({body:'chat text'}),'');
});
