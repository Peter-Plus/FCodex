import fs from 'node:fs';import vm from 'node:vm';import test from 'node:test';import assert from 'node:assert/strict';
test('full-window viewer hides the chat title hit area and restores it on close',()=>{
 const source=fs.readFileSync(new URL('../src/conversation-title.js',import.meta.url),'utf8');const sync=source.slice(source.indexOf(' function sync(){'),source.indexOf(' let renaming='));
 let open=true;const scroll={querySelector:()=>({}),getBoundingClientRect:()=>({width:800,left:10,top:83}),setAttribute(){},removeAttribute(){},parentElement:{setAttribute(){},removeAttribute(){}}};const title={style:{}},editor={};
 const c=vm.createContext({frame:0,dead:false,visible:()=>true,document:{querySelectorAll:q=>q==='.thread-scroll-container'?[scroll]:q.startsWith('.codex-dialog')?(open?[{}]:[]):[]},fadeNativeRouter:()=>null,root:{hasAttribute:()=>false},title,editor,marked:new Set(),resize:{observe(){}},shadow:{querySelector:()=>null},window:{innerWidth:1000}});
 vm.runInContext(sync,c);c.sync();assert.equal(title.hidden,true);assert.equal(editor.hidden,true);open=false;c.sync();assert.equal(title.hidden,false);assert.equal(editor.hidden,false);
});
