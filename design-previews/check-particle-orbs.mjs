import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('h-particle-orbs.html',import.meta.url),'utf8');
const ctx=vm.createContext({Math});
vm.runInContext(source.slice(source.indexOf('const configs='),source.indexOf('let seed=')),ctx);
vm.runInContext(source.slice(source.indexOf('const ease='),source.indexOf('function trigger(')),ctx);
const configs=vm.runInContext('configs',ctx);
assert.equal(configs.length,5);
for(let index=0;index<configs.length;index++){
 let previous=1;
 for(let age=0;age<=.42;age+=.01){const m=vm.runInContext(`envelope(${age},configs[${index}])`,ctx);assert(m.scale>=previous-1e-8);previous=m.scale;}
 previous=configs[index].gain;
 for(let age=.42;age<=.78;age+=.01){const m=vm.runInContext(`envelope(${age},configs[${index}])`,ctx);assert(m.scale<=previous+1e-8);previous=m.scale;}
 const end=vm.runInContext(`envelope(.9,configs[${index}])`,ctx);assert.equal(end.scale,1);assert.equal(end.boost,0);
 const c=configs[index];assert(Math.abs(c.core*c.gain/c.max-.60)<1e-10,'Peak core must cover 60% of the particle field');
 assert(new Set(c.spikes.map(p=>p.length.toFixed(2))).size>5);
 const angles=c.spikes.map(p=>p.angle).sort((a,b)=>a-b),gaps=angles.slice(1).map((a,i)=>a-angles[i]);assert(Math.max(...gaps)/Math.min(...gaps)>2);
 let lastSize=Infinity,lastOpacity=Infinity;for(let radial=0;radial<=1;radial+=.01){const p=vm.runInContext(`particleAppearance(${radial},configs[${index}])`,ctx);assert(p.size<=lastSize);assert(p.opacity<=lastOpacity);lastSize=p.size;lastOpacity=p.opacity;}
 assert(c.boost>20);
}
assert(!source.includes('createRadialGradient'));
assert(source.includes('ctx.rotate(state.coreAngle)'));
assert(source.includes('state.coreAngle+dt*(reduced.matches?0:.12+motion.boost*.55)'));
assert(source.includes('drawSpikes(ctx,state,cx,cy,k,color)'));
console.log('PASS: five configurations; growth then restoration; acceleration ends; 60% peak coverage; inward size/opacity gradient; faster rotation; irregular spikes, idle and interaction rotation.');

vm.runInContext(source.slice(source.indexOf('function particleRadius('),source.indexOf('function draw(surface)')),ctx);
for(let i=0;i<5;i++){
 assert.equal(configs[i].touchCore,undefined);
 const c=configs[i];
 for(const scale of [1,c.gain]){
  const radius=vm.runInContext(`particleRadius({r:46,size:1,radial:0},{config:configs[${i}],currentScale:${scale}})`,ctx);
  assert.equal(radius,46);
 }
}
console.log('PASS: fixed orbital radii restored, including the original gap in 05.');
