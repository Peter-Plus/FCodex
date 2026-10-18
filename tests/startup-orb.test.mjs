import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source=await fs.readFile(new URL('../design-previews/startup.html',import.meta.url),'utf8');

test('moving the orb clears its previous bounds, not the new destination, and idle clears stop',()=>{
 const calls=[];
 const context=vm.createContext({w:1920,h:1080,el:{},ctx:{clearRect(...args){calls.push(args)}}});
 vm.runInContext(source.slice(source.indexOf(' const surfaces=new Map();'),source.indexOf(' const particlePaint=')),context);
 vm.runInContext('placeSurface(el,ctx,1,400,400,100);markSurface(el);placeSurface(el,ctx,1,800,500,100);clearSurface(el,ctx);clearSurface(el,ctx)',context);
 assert.deepEqual(calls,[[296,296,208,208]]);
 vm.runInContext('markSurface(el);clearSurface(el,ctx)',context);
 assert.deepEqual(calls[1],[696,396,208,208]);
 vm.runInContext('placeSurface(el,ctx,1,0,0,0,true);markSurface(el);clearSurface(el,ctx)',context);
 assert.deepEqual(calls[2],[0,0,1920,1080]);
});

test('glitch pixels and CSS offsets are cleared once after a burst',()=>{
 let clears=0;const signature={style:{translate:'2px',textShadow:'2px 0 purple'}},film={style:{translate:'-2px'}};
 const context=vm.createContext({w:100,h:100,film,$:()=>signature,glitchCtx:{clearRect(){clears++}}});
 vm.runInContext(source.slice(source.indexOf(' let glitchDirty=false;'),source.indexOf(' function paintPageGlitch(')),context);
 vm.runInContext('clearPageGlitch()',context);assert.equal(clears,0);
 vm.runInContext('glitchDirty=true;clearPageGlitch();clearPageGlitch()',context);
 assert.equal(clears,1);assert.equal(film.style.translate,'');assert.equal(signature.style.translate,'');assert.equal(signature.style.textShadow,'');
});
