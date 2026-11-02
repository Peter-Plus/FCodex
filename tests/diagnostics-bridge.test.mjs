import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {installDiagnosticsBridge} from '../startup/diagnostics-bridge.mjs';
import {createTestArea,retireTestArea} from './work-area.mjs';
test('legacy bridge accepts only main app context, persists errors and opens fixed directory',async()=>{
 const area=await createTestArea('diagnostics-bridge');let bridge;
 try{
  const directory=path.join(area,'logs'),opened=[],messages=[];
  class Socket extends EventTarget{
   emit(value){this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify(value)}))}
   send(text){const m=JSON.parse(text);messages.push(m);queueMicrotask(()=>{
    if(m.method==='Runtime.enable')for(const context of [{id:7,origin:'app://-',auxData:{isDefault:true,frameId:'main'}},{id:8,origin:'https://example.com',auxData:{isDefault:true,frameId:'main'}},{id:9,origin:'app://-',auxData:{isDefault:true,frameId:'child'}}])this.emit({method:'Runtime.executionContextCreated',params:{context}});
    this.emit({id:m.id,result:m.method==='Page.getFrameTree'?{frameTree:{frame:{id:'main'}}}:m.method==='Runtime.evaluate'?{result:{value:true}}:{}});
   })}
  }
  const ws=new Socket();bridge=await installDiagnosticsBridge(ws,{directory,openFolder:async folder=>opened.push(folder),metadata:{test:true}});
  await assert.rejects(fs.stat(directory),{code:'ENOENT'});
  const call=(context,request)=>ws.emit({method:'Runtime.bindingCalled',params:{name:'__fadeDiagnosticsRequestV2',executionContextId:context,payload:JSON.stringify(request)}});
  const record={operation:'preview.save',message:'failed',stack:'test-stack'};
  for(const context of [8,9,10]){call(context,{action:'report',record});call(context,{action:'open-folder',id:1,path:'foreign'})}
  await bridge.flush();await assert.rejects(fs.stat(directory),{code:'ENOENT'});assert.deepEqual(opened,[]);
  call(7,{action:'report',record});await bridge.flush();const lines=(await fs.readFile(path.join(directory,'errors.jsonl'),'utf8')).trim().split('\n').map(JSON.parse);assert.equal(lines.length,1);assert.equal(lines[0].stack,'test-stack');
  call(7,{action:'open-folder',id:2,path:'foreign'});
  for(let i=0;i<40&&!opened.length;i++)await new Promise(r=>setTimeout(r,5));
  assert.deepEqual(opened,[directory]);assert.ok(messages.some(m=>m.params?.expression?.includes('__fadeDiagnosticsReply')));
  ws.emit({method:'Runtime.executionContextsCleared',params:{}});call(7,{action:'report',record:{...record,message:'ignored'}});await bridge.flush();assert.equal((await fs.readFile(path.join(directory,'errors.jsonl'),'utf8')).trim().split('\n').length,1);
 }finally{await bridge?.close();await retireTestArea(area)}
});
