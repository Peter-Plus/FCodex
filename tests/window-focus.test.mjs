import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import {patchWindowComposerFocus} from '../startup/window-focus-patch.mjs';

const build=JSON.parse(fs.readFileSync(new URL('../.fade-runtime-isolated/build.json',import.meta.url)));
const archive=fs.readFileSync(path.join(build.source,'resources/app.asar'));
const tree=JSON.parse(archive.subarray(16,16+archive.readUInt32LE(12))),offset=8+archive.readUInt32LE(4);
const entry=Object.entries(tree.files.webview.files.assets.files).find(([name])=>/^app-initial-.*\.js$/.test(name))[1];
const native=archive.subarray(offset+Number(entry.offset),offset+Number(entry.offset)+entry.size).toString();
const patched=patchWindowComposerFocus(native),helper=patched.slice(patched.lastIndexOf('\nfunction fadeMayAutofocusComposer'));
const effectStart='(0,l7.useEffect)(()=>{let t=s!=null&&s!==O.current;',effectEnd='},[e,o,s,k,c])';
function harness(source,{mode=true,active=false,connected=true,outside=false,resize=true}={}){
 let callback,focuses=0,cleanup;
 const doc={body:{},activeElement:{getAttribute:()=>null}},page={getAttribute:()=>String(active)};
 const dom={isConnected:connected,ownerDocument:doc,closest:()=>outside?null:page,dataset:{}};
 const context=vm.createContext({window:{__fadeWindowModeEnabled:mode},l7:{useEffect:fn=>{cleanup=fn()}},e:{view:{dom},focus:()=>focuses++},o:false,s:'new',O:{current:'old'},k:null,c:false,ResizeObserver:resize?class{constructor(fn){callback=fn}observe(){}disconnect(){}}:undefined,requestAnimationFrame:fn=>{callback=fn;return 1},cancelAnimationFrame(){}});
 vm.runInContext(helper,context);
 const start=source.indexOf(effectStart),end=source.indexOf(effectEnd,start)+effectEnd.length;
 assert(start>=0&&end>start);vm.runInContext(source.slice(start,end),context);
 return {flush(){callback();cleanup?.();return focuses},setActive(value){active=value},mount(){context.k=true;const match=source.match(/k===!0&&(?:fadeMayAutofocusComposer\(e\.view\.dom\)&&)?e\.focus\(\),e\.view\.dom\.dataset\.virtualkeyboard/);assert(match);vm.runInContext(match[0]+'=`true`',context);return focuses}};
}

test('native delayed autofocus reproduces inactive-pane stealing; patched callback checks current ownership',()=>{
 assert.equal(harness(native).flush(),1,'original editor steals inactive pane focus');
 for(const resize of [true,false]){
  assert.equal(harness(patched,{resize}).flush(),0);
  const lost=harness(patched,{active:true,resize});lost.setActive(false);assert.equal(lost.flush(),0,'ownership checked when callback executes');
  assert.equal(harness(patched,{active:true,resize}).flush(),1);
 }
});
test('mount autofocus preserves ordinary mode and floating editors, excludes inactive and detached panes',()=>{
 assert.equal(harness(patched).mount(),0);
 assert.equal(harness(patched,{active:true}).mount(),1);
 assert.equal(harness(patched,{active:true,connected:false}).mount(),0);
 assert.equal(harness(patched,{mode:false}).mount(),1);
 assert.equal(harness(patched,{outside:true}).mount(),1);
 assert.equal(harness(patched,{mode:false}).flush(),1);
 assert.equal(harness(patched,{outside:true}).flush(),1);
 assert.throws(()=>patchWindowComposerFocus(patched),/Unsupported/,'unsupported or repeated patch fails closed');
});
