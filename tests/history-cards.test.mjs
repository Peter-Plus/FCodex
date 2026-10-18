import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/history-cards.js',import.meta.url),'utf8');
function fixture(){
 const nodes=[],timers=new Map();let clock=1000,seq=0,listener;
 class El{
  constructor(){nodes.push(this);this.children=[];this.dataset={};this.style={setProperty(){}};this.scrollTop=0;this.clientHeight=200}
  append(...items){this.children.push(...items)}prepend(...items){this.children.unshift(...items)}replaceChildren(){this.children=[]}setAttribute(){}querySelectorAll(){return []}remove(){}
 }
 const data={ready:false,items:[],updatedAt:0},tabs={ready:true,history:()=>data,loadHistory:async()=>({waiting:true}),subscribe:fn=>{listener=fn;return()=>{}}};
 const context=vm.createContext({document:{createElement:()=>new El(),createElementNS:()=>new El()},window:{},innerWidth:1000,navOpen:true,layoutArc(){},installFanAutoscroll:()=>()=>{},$:()=>new El(),fadeNativeRouter:()=>null,centerArcEnds(){},arcLayoutHeight:()=>200,updateChatGuides(){},updateFanMask(){},addCardSurface:x=>x,on(){},console:{warn(){}},Date:{now:()=>clock},setTimeout:fn=>{timers.set(++seq,fn);return seq},clearTimeout:id=>timers.delete(id)});
 vm.runInContext(source,context);const api=context.installHistoryCards(tabs);
 return {tabs,data,api,timers,refresh:()=>listener(),label:()=>nodes.find(n=>n.id==='historyList').children.at(-1)?.textContent,async flush(){await new Promise(r=>setImmediate(r))},async tick(ms=300){clock+=ms;const callbacks=[...timers.values()];timers.clear();callbacks.forEach(fn=>fn());await this.flush()}};
}
test('missing native query stays loading, times out visibly, and retry resumes waiting',async()=>{
 const f=fixture();f.api.open();await f.flush();assert.match(f.label(),/正在加载/);
 await f.tick(30001);assert.match(f.label(),/尚未就绪/);
 f.api.open();await f.flush();assert.match(f.label(),/正在加载/);
 f.api.destroy();assert.equal(f.timers.size,0);
});
test('later native success clears a prior request error, including empty history',async()=>{
 const f=fixture();f.tabs.loadHistory=async()=>{throw Error('offline')};f.api.open();await f.flush();assert.match(f.label(),/无法加载/);
 Object.assign(f.data,{ready:true,loaded:true,updatedAt:42,error:null});f.refresh();assert.equal(f.label(),'暂无聊天记录');f.api.destroy();
});
