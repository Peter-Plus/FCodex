import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('../src/runtime.js',import.meta.url),'utf8');
const handoff=source.slice(source.indexOf(' let startupHomeRequested=false;'),source.indexOf(" on(window,'resize',()=>{updateFanMask()"));

test('startup normalizes an already mounted ChatGPT home before allowing animation handoff',()=>{
 let ready=false,homeCalls=0,targetCalls=0,target=null;
 const ctx=vm.createContext({
  host:{hasAttribute:()=>true},
  disposeGptTabs:{get ready(){return ready},home(){homeCalls++;return true}},
  disposeHomeOrb:{refresh(){},startupTarget(){targetCalls++;return target}},
  navOpen:false,closeNav(){},
  windowMode:{enabled:false},
 });
 vm.runInContext(handoff,ctx);
 assert.equal(ctx.prepareStartupHome(),null);assert.equal(homeCalls,0);
 ready=true;
 assert.equal(ctx.prepareStartupHome(),null);assert.equal(homeCalls,1);assert.equal(targetCalls,0);
 assert.equal(ctx.prepareStartupHome(),null);assert.equal(homeCalls,1);
 target={x:.5,y:.4,size:94};
 assert.equal(ctx.prepareStartupHome(),target);assert.equal(homeCalls,1);
});
