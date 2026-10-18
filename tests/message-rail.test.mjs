import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const c=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../src/message-rail.js',import.meta.url),'utf8'),c);
test('rail tracks the file left edge even if its native parent still spans the window',()=>{
 assert.equal(c.fadeMessageRailInset(1400,undefined),18);
 const inset=c.fadeMessageRailInset(1400,820);assert.equal(1400-inset,802);
 assert.equal(1400-c.fadeMessageRailInset(1400,640),622);
 assert.equal(c.fadeMessageRailInset(800,820),18);
});
test('preview is left of the rail and clamped below titlebar and above viewport bottom',()=>{
 const pos=c.fadeMessagePreviewPosition({left:808,top:300,height:10},320,180,900);
 assert.equal(pos.left+320,800);assert.equal(pos.top,215);
 assert.equal(c.fadeMessagePreviewPosition({left:808,top:0,height:10},320,180,900).top,48);
 assert.equal(c.fadeMessagePreviewPosition({left:808,top:890,height:10},320,180,900).top,708);
});
