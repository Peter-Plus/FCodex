import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/tab-reorder.js',import.meta.url),'utf8');
function fixture(){
 let refreshes=0;
 const context=vm.createContext({Date});vm.runInContext(source,context);
 const element=()=>({attrs:{},events:{},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},addEventListener(k,f){this.events[k]=f},removeEventListener(k){delete this.events[k]},getBoundingClientRect:()=>({left:100,width:100}),contains:()=>false});
 const list=element(),tabs=['a','b','c'].map(id=>({id})),api=context.installFadeTabReorder(list,tabs,t=>t.id,()=>refreshes++);
 const items=tabs.map(tab=>{const item=element();api.bind(item,tab);return item});
 const event=(x=120)=>({clientX:x,target:{closest:()=>null},dataTransfer:{setData(){}},preventDefault(){this.prevented=true},stopPropagation(){},stopImmediatePropagation(){this.stopped=true}});
 return {list,tabs,items,api,event,refreshes:()=>refreshes};
}
test('dragging inserts before or after the target without replacing tab identities',()=>{
 const f=fixture(),original=f.tabs[0];f.items[0].ondragstart(f.event());f.items[2].ondragover(f.event(180));
 assert.equal(f.items[2].attrs['data-fade-drop'],'after');f.items[2].ondrop(f.event(180));
 assert.deepEqual(f.tabs.map(t=>t.id),['b','c','a']);assert.equal(f.tabs[2],original);assert.equal(f.refreshes(),1);
 f.items[0].ondragstart(f.event());f.items[1].ondrop(f.event(120));assert.deepEqual(f.tabs.map(t=>t.id),['a','b','c']);
 const click=f.event();f.list.events.click(click);assert(click.stopped);f.api.destroy();assert.equal(f.list.events.click,undefined);
});
test('cancelled drags, close controls and drags from another group do not reorder tabs',()=>{
 const f=fixture(),other=fixture(),close=f.event();close.target.closest=()=>({});f.items[0].ondragstart(close);assert(close.prevented);
 f.items[0].ondragstart(f.event());other.items[1].ondrop(other.event());assert.equal(other.refreshes(),0);
 f.items[0].ondragend();f.items[2].ondrop(f.event());assert.deepEqual(f.tabs.map(t=>t.id),['a','b','c']);assert.equal(f.refreshes(),0);assert.equal(f.list.attrs['data-fade-dragging'],undefined);
});
