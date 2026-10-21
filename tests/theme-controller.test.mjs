import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const install=vm.runInNewContext(fs.readFileSync(new URL('../src/theme-controller.js',import.meta.url),'utf8')+';installFadeThemeController');
function setup(){
 const values=new Map(),attrs=new Map(),requests=[],writes=[];let observe;
 const root={dataset:{theme:'dark'},style:{getPropertyValue:k=>values.get(k)||'',setProperty:(k,v)=>{writes.push(k);values.set(k,v)}}},host={dataset:{}},config={light:false};
 const controller=install({root,host,config,button:{getAttribute:k=>attrs.get(k),setAttribute:(k,v)=>attrs.set(k,v)},tokens:new Map([['--color-text',{kind:'fg'}]]),nativeTheme:{set:mode=>new Promise(resolve=>requests.push({mode,resolve}))},wake(){},persist(){},Observer:class{constructor(fn){observe=fn}observe(){}disconnect(){}}});
 return {controller,root,host,config,requests,writes,values,observe:()=>observe()};
}
test('theme updates both surfaces immediately without rewriting unchanged mappings',async()=>{
 const s=setup(),pending=s.controller.set(true);
 assert.equal(s.root.dataset.theme,'light');assert.equal(s.host.dataset.theme,'light');
 s.root.dataset.theme='light';s.observe();s.requests[0].resolve(true);await pending;
 assert.equal(s.root.dataset.fadePolarity,'light');assert.equal(s.host.dataset.theme,'light');assert.equal(s.writes.length,1);
 s.observe();assert.equal(s.writes.length,1);
 s.values.set('--color-text','native override');s.observe();assert.equal(s.values.get('--color-text'),'var(--fc-fg)');
});
test('failed native requests preserve the latest local choice',async()=>{
 const s=setup(),first=s.controller.set(true),last=s.controller.set(false);
 s.requests[0].resolve(false);await first;assert.equal(s.root.dataset.theme,'dark');
 s.requests[1].resolve(true);await last;
 const fallback=s.controller.set(true);s.requests[2].resolve(false);await fallback;
 assert.equal(s.root.dataset.theme,'light');assert.equal(s.host.dataset.theme,'light');
});
test('external theme changes synchronize config; disposal prevents late changes',async()=>{
 const s=setup();s.root.dataset.theme='light';s.observe();assert.equal(s.config.light,true);
 const pending=s.controller.set(false);s.controller.destroy();s.requests[0].resolve(false);await pending;
 assert.equal(s.root.dataset.theme,'dark');
});
