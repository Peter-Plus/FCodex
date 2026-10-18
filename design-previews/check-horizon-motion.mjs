import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('f-event-horizon.html',import.meta.url),'utf8');
const section=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
const spin=vm.createContext({Math});
vm.runInContext(section('const orbState=','function drawSpikes('),spin);
const selected=vm.runInContext('orbState',spin);
assert.equal(selected.particles.length,360);
assert.equal(selected.config.min,46);
assert.equal(selected.config.core,29);
assert.equal(selected.config.spikes.length,16);
assert(Math.abs(vm.runInContext('envelope(.42,orbState.config).scale*29/101',spin)-.6)<1e-10);
assert.equal(vm.runInContext('envelope(.78,orbState.config).scale',spin),1);
assert.equal(vm.runInContext('envelope(.78,orbState.config).boost',spin),0);
assert(!source.includes('createRadialGradient'));
assert(source.includes('burstTime=performance.now();startSpin();shakeCore();'));

const styles=()=>({setProperty(name,value){this[name]=value;}});
const rows=[110,185,230,300,375].map(offsetTop=>({offsetTop,offsetHeight:60,dataset:{},style:styles()}));
const view={clientHeight:520,scrollTop:0,style:styles()};
let now=0,nextId=0;const frames=new Map();
const arc=vm.createContext({Math,Number,String,getComputedStyle:()=>({paddingTop:'0px',paddingBottom:'0px'}),innerWidth:1400,navOpen:true,reduceMotion:{matches:false},performance:{now:()=>now},$:selector=>selector==='#chatGuides'?null:view,$$:()=>rows,requestAnimationFrame:cb=>{frames.set(++nextId,cb);return nextId;},cancelAnimationFrame:id=>frames.delete(id)});
vm.runInContext(section('function layoutArc(', "$('#arcViewport').addEventListener"),arc);
vm.runInContext('layoutArc()',arc);
assert.equal(rows[2].style['--arc-angle'],'0.00deg');
assert(parseFloat(rows[0].style['--arc-angle'])<0);
assert(parseFloat(rows[4].style['--arc-angle'])>0);
const angleBefore=rows[2].style['--arc-angle'];view.scrollTop=40;vm.runInContext('layoutArc()',arc);
assert.notEqual(rows[2].style['--arc-angle'],angleBefore);
view.scrollTop=0;vm.runInContext('revealCards($$("rows"))',arc);
for(const row of rows){assert.equal(row.style.opacity,'0');assert(row.offsetTop+Number(row.dataset.revealOffset)>view.clientHeight);}
for(now=0;now<1800;now+=16){const batch=[...frames.values()];frames.clear();batch.forEach(cb=>cb(now));}
assert.equal(frames.size,0);
for(const row of rows){assert.equal(row.style.translate,'');assert.equal(row.dataset.revealOffset,undefined);}
vm.runInContext('revealCards($$("rows")); cancelReveal()',arc);assert.equal(frames.size,0);
console.log('PASS: 05 pulse restores and spin settles; card angle follows position; bottom-edge reveal completes; interruption cancels pending frames.');
