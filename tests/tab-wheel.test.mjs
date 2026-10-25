import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/tab-wheel.js',import.meta.url),'utf8');
function setup(){
 let time=0,id=0;const frames=new Map(),listeners=new Map(),motion={matches:false};
 const scope={addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
 const win={matchMedia:()=>motion,performance:{now:()=>time},requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:id=>frames.delete(id)};
 const el={scrollLeft:0,scrollWidth:1200,clientWidth:300,isConnected:true,closest:()=>el};
 const c=vm.createContext({});vm.runInContext(source,c);const dispose=c.installFadeTabWheel(scope,win);
 const step=()=>{time+=16;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time))};
 const wheel=(delta,options={})=>{let handled=false;listeners.get('wheel')({target:el,deltaX:0,deltaY:delta,deltaMode:0,preventDefault:()=>handled=true,stopPropagation(){},...options});return handled};
 return {el,frames,motion,step,wheel,dispose,listeners};
}
test('wheel eases across frames, accumulates input and reverses immediately',()=>{
 const t=setup();t.wheel(120);assert.equal(t.el.scrollLeft,0);t.step();assert(t.el.scrollLeft>0&&t.el.scrollLeft<120);
 t.wheel(120);for(let i=0;i<50;i++)t.step();assert.equal(t.el.scrollLeft,240);assert.equal(t.frames.size,0);
 t.wheel(200);t.step();const before=t.el.scrollLeft;t.wheel(-60);t.step();assert(t.el.scrollLeft<before);
 t.dispose();assert.equal(t.frames.size,0);
});
test('bounds, delta units, reduced motion and external position changes',()=>{
 const t=setup();assert.equal(t.wheel(50,{ctrlKey:true}),false);t.motion.matches=true;
 t.wheel(3,{deltaMode:1});assert.equal(t.el.scrollLeft,60);t.wheel(1,{deltaMode:2});assert.equal(t.el.scrollLeft,360);
 t.wheel(5000);assert.equal(t.el.scrollLeft,900);t.wheel(-5000);assert.equal(t.el.scrollLeft,0);
 t.motion.matches=false;t.wheel(100);t.step();t.el.scrollLeft=500;t.step();assert.equal(t.el.scrollLeft,500);assert.equal(t.frames.size,0);
 t.wheel(100);t.el.isConnected=false;t.step();assert.equal(t.frames.size,0);t.dispose();assert.equal(t.listeners.size,0);
});
