import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../design-previews/f-event-horizon.html',import.meta.url),'utf8');
const logic=source.slice(source.indexOf('function envelope('),source.indexOf('let savedTheme;'));
function setup(covered=true){
 let now=1000,draws=0,id=0;const frames=new Map(),events={},reduced={matches:false,addEventListener(_,fn){this.change=fn}};
 const ctx=new Proxy({clearRect(){draws++}},{get:(obj,key)=>obj[key]||(()=>{})});
 const context=vm.createContext({window:{__fadeInPageState:covered?{done:false}:undefined},document:{hidden:false,documentElement:{dataset:{theme:'dark'}},addEventListener:(name,fn)=>events[name]=fn},performance:{now:()=>now},reduceMotion:reduced,ctx,canvas:{width:146,height:146},devicePixelRatio:1,canvasSize:146,burstTime:-10000,raf:0,lastDraw:0,orbClock:0,orbState:{trigger:-100,baseScale:1,currentScale:1,currentBoost:0,coreAngle:.3,config:{core:29,boost:22.95,gain:2.08,spikes:[]},particles:[{angle:.7,speed:.4,r:50,opacity:.5,size:1}]},clamp:x=>Math.max(0,Math.min(1,x)),ease:x=>x*x*(3-2*x),requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:id=>frames.delete(id)});
 vm.runInContext(logic,context);
 return {context,frames,events,reduced,get draws(){return draws},at(value){now=value},run:code=>vm.runInContext(code,context)};
}
test('covered startup owns no frames or draws, including resize and theme wakes; reveal catches up once',()=>{
 const s=setup();s.run('resizeCanvas();wakeParticles();paint(1000);tick(1000)');
 assert.equal(s.draws,0);assert.equal(s.frames.size,0);
 s.at(11000);assert.equal(s.context.orbClock,0);
 s.run('setStartupCovered(false)');
 assert.equal(s.context.orbClock,10);assert.equal(s.draws,1);assert.equal(s.frames.size,1);
 assert.ok(Math.abs(s.context.orbState.particles[0].angle-4.7)<1e-12);
 s.run('setStartupCovered(false)');assert.equal(s.draws,1);assert.equal(s.frames.size,1);
});
test('spin begun under the cover preserves its elapsed motion without frame-by-frame catch-up',()=>{
 const s=setup();s.at(2000);s.run('startSpin()');s.at(2300);s.run('setStartupCovered(false)');
 let integral=0;const step=.000001;
 for(let t=step;t<=.3000001;t+=step){const smooth=x=>x*x*(3-2*x),clamp=x=>Math.max(0,Math.min(1,x));integral+=22.95*smooth(clamp((t-step/2)/.09))*(1-smooth(clamp((t-step/2-.28)/.5)))*step}
 assert.ok(Math.abs(s.context.orbState.particles[0].angle-(.7+.4*(1.3+integral)))<1e-7);
 assert.ok(s.context.orbState.currentScale>1);assert.equal(s.draws,1);
});
test('backgrounded page and reduced motion do not accrue hidden animation time',()=>{
 const s=setup();s.at(2000);s.context.document.hidden=true;s.events.visibilitychange();
 s.at(20000);s.context.document.hidden=false;s.events.visibilitychange();
 s.at(21000);s.reduced.matches=true;s.reduced.change();
 s.at(31000);s.run('setStartupCovered(false)');assert.equal(s.context.orbClock,2);assert.equal(s.frames.size,0);assert.equal(s.context.orbState.currentScale,1);
});
test('covering an already active runtime cancels its pending frame',()=>{
 const s=setup(false);s.run('wakeParticles()');assert.equal(s.frames.size,1);
 s.run('setStartupCovered(true);resizeCanvas();wakeParticles()');assert.equal(s.frames.size,0);assert.equal(s.draws,0);
});
