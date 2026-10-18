import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
test('compact header keeps directory label and releases native header on teardown',()=>{
 const attrs=new Set(),bar={hasAttribute:k=>attrs.has(k),setAttribute:k=>attrs.add(k),removeAttribute:k=>attrs.delete(k)};
 const title={textContent:'查找 Frontend Design skill',closest:q=>q.includes('left-panel')?null:bar};
 const label={textContent:'',hidden:true};let callback,scheduled,disconnected=false;
 const doc={body:{},querySelectorAll:q=>q==='[data-thread-title]'?[title]:[],querySelector:()=>null};
 const c=vm.createContext({document:doc,host:{contains:()=>false},$:()=>label,setTimeout:fn=>(scheduled=fn,1),clearTimeout:()=>{scheduled=null},MutationObserver:class{constructor(fn){callback=fn}observe(){}disconnect(){disconnected=true}}});
 vm.runInContext(fs.readFileSync(new URL('../src/header.js',import.meta.url),'utf8'),c);
 const dispose=c.installCompactHeader();assert.equal(label.textContent,'Codex');assert.equal(label.hidden,false);assert(attrs.has('data-fade-header-hidden'));
 title.textContent='新的聊天标题';callback([{target:title}]);scheduled();assert.equal(label.textContent,'Codex');
 title.textContent='';callback([{target:title}]);scheduled();assert.equal(label.hidden,false);assert.equal(label.textContent,'Codex');
 dispose();assert(disconnected);assert.equal(attrs.size,0);
});
