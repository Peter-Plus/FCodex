import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/gpt-tabs.js',import.meta.url),'utf8');
const method=source.slice(source.indexOf(' function contextMenu('),source.indexOf(' function history(){'));

test('GPT menu keeps native actions, separators and submenus and runs only the selected action',async()=>{
 let selected=0,captured;
 const scope={get:key=>key==='intl'?{formatMessage:m=>m.defaultMessage}:null};
 const module={oIr:'intl',mW:()=>true,Don:{},$U:()=>[
  {id:'rename',message:{defaultMessage:'重命名'},onSelect:()=>selected++},
  {id:'sep',type:'separator'},
  {id:'project',message:{defaultMessage:'移至项目'},submenu:[{id:'target',message:{defaultMessage:'项目'},onSelect:()=>selected++}]}
 ]};
 const c=vm.createContext({pinnedConversations:()=>[],module,scope,ready:true,disposed:false,query:()=>({state:{data:{pages:[{items:[{id:'saved',title:'Chat'}]}]}}}),window:{electronBridge:{showContextMenu:async(items,point)=>{captured={items,point};return {id:'target'}}}},report:e=>{throw Error(e)}});
 vm.runInContext(method,c);assert.equal(c.contextMenu('saved',100,200),true);
 await new Promise(r=>setImmediate(r));
 assert.equal(captured.items.length,3);assert.equal(captured.items[0].label,'重命名');assert.equal(captured.items[1].type,'separator');assert.equal(captured.items[2].submenu[0].id,'target');assert.equal(captured.point.x,100);assert.equal(selected,1);
});

test('rename-only opens the native rename dialog without opening a menu and respects edit permission',()=>{
 for(const editable of [true,false]){
  let dialogs=0,menus=0;
  const scope={get:()=>null};
  const module={mW:()=>editable,Don:{},J4n:()=>dialogs++};
  const c=vm.createContext({pinnedConversations:()=>[],module,scope,ready:true,disposed:false,query:()=>({state:{data:{pages:[{items:[{id:'saved',title:'Chat'}]}]}}}),window:{electronBridge:{showContextMenu:()=>menus++}},report:e=>{throw Error(e)}});
  vm.runInContext(method,c);assert.equal(c.contextMenu('saved',0,0,true),editable);assert.equal(dialogs,editable?1:0);assert.equal(menus,0);
 }
});
