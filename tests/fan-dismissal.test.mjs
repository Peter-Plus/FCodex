import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/runtime.js',import.meta.url),'utf8');
test('chat context menu preserves the fan and forwards pointer and keyboard anchors',()=>{
 const calls=[],preserved=[];const context=vm.createContext({adapter:{contextMenu:(...args)=>{calls.push(args);return true}},chatPicker:{close(){throw Error('context menu must not close the directory')},preserveForContextMenu:row=>preserved.push(row)},actionFailed(){throw Error('missing target')}});
 vm.runInContext(source.slice(source.indexOf(' function bindChatContextMenu('),source.indexOf(' let projectMenu=')),context);
 const row={getBoundingClientRect:()=>({left:100,top:200,width:300,height:60})};context.bindChatContextMenu(row,'local:host:chat');
 const event={preventDefault(){},stopPropagation(){},type:'contextmenu',clientX:150,clientY:220};row.oncontextmenu(event);
 row.onkeydown({...event,type:'keydown',key:'F10',shiftKey:true});
 assert.deepEqual(calls,[['local:host:chat',150,220],['local:host:chat',124,230]]);
 assert.deepEqual(preserved,[row,row]);
});
test('only empty fan surfaces dismiss; cards and their controls do not',()=>{
 let handler,closed=0;const context=vm.createContext({on:(_,__,fn)=>handler=fn,$:()=>({}),navOpen:true,closeNav:()=>closed++});
 const start=source.indexOf(" on($('#navigation'),'click'");vm.runInContext(source.slice(start,source.indexOf(" on($('#arcViewport'),'scroll'",start)),context);
 for(const surface of ['left gap','right gap','veil'])handler({button:0,composedPath:()=>[{matches:()=>false}]});
 assert.equal(closed,3);
 handler({button:0,composedPath:()=>[{matches:()=>true},{matches:()=>false}]});
 handler({button:2,composedPath:()=>[{matches:()=>false}]});
 assert.equal(closed,3);
});
