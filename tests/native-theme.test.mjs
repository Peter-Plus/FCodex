import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../src/native-theme.js',import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(){
 const messages=[],listeners=new Map(),timers=new Map(),errors=[];let seq=0;
 const win={crypto:{randomUUID:()=>String(++seq)},electronBridge:{sendMessageFromView:async m=>messages.push(m)},addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k),setTimeout:f=>{timers.set(++seq,f);return seq},clearTimeout:id=>timers.delete(id)};
 const sync=vm.runInNewContext(source+';createNativeThemeSync',{})(win,e=>errors.push(e));
 const reply=m=>listeners.get('message')?.({data:{type:'fetch-response',requestId:m.requestId,responseType:'success',status:200,body:{success:true}}});
 return {sync,messages,listeners,timers,errors,reply};
}
test('native theme uses the appearance setting and serializes rapid changes',async()=>{
 const s=setup();s.sync.set('light');await tick();s.sync.set('dark');
 assert.equal(s.messages.length,1);
 assert.equal(s.messages[0].url,'vscode://codex/set-setting');
 assert.deepEqual(JSON.parse(s.messages[0].body),{key:'appearanceTheme',value:'light'});
 s.reply(s.messages[0]);await tick();assert.equal(s.messages.length,2);
 assert.equal(JSON.parse(s.messages[1].body).value,'dark');
 s.reply(s.messages[1]);await tick();s.sync.set('dark');await tick();
 assert.equal(s.messages.length,2);s.sync.destroy();assert.equal(s.listeners.size,0);assert.equal(s.timers.size,0);
});
test('dispose releases pending responses without displaying a failure',async()=>{
 const s=setup();s.sync.set('light');await tick();s.sync.destroy();await tick();
 assert.equal(s.timers.size,0);assert.equal(s.listeners.size,0);assert.equal(s.errors.length,0);
});
test('a timeout reports failure and a subsequent toggle can retry',async()=>{
 const s=setup();s.sync.set('light');await tick();[...s.timers.values()][0]();await tick();
 assert.equal(s.errors.length,1);s.sync.set('dark');await tick();assert.equal(s.messages.length,2);s.sync.destroy();
});

test('classic handoff waits for the last queued native appearance write',async()=>{
 const s=setup();s.sync.set('light');await tick();s.sync.set('dark');
 let completed=false;const settled=s.sync.settled().then(()=>{completed=true});
 s.reply(s.messages[0]);await tick();assert.equal(completed,false);
 assert.equal(JSON.parse(s.messages[1].body).value,'dark');
 s.reply(s.messages[1]);await settled;assert.equal(completed,true);s.sync.destroy();
});

test('classic handoff surfaces sync failure instead of disposing early',async()=>{
 const s=setup();s.sync.set('dark');await tick();const rejected=assert.rejects(s.sync.settled(),/timed out/);
 [...s.timers.values()][0]();await rejected;s.sync.destroy();
});
test('recommended accent preserves theme fields and only writes after explicit application',async()=>{
 const state={appearanceLightChromeTheme:{accent:'#aa0000',fonts:{ui:null},surface:'#fff',semanticColors:{diffAdded:'#00ff00'}},appearanceDarkChromeTheme:{accent:'#aa0000',fonts:{ui:null},surface:'#222',contrast:60}};
 const original=structuredClone(state),writes=[];let listener,seq=0;
 const win={crypto:{randomUUID:()=>String(++seq)},setTimeout,clearTimeout,addEventListener:(k,f)=>listener=f,removeEventListener:()=>listener=null,electronBridge:{sendMessageFromView(m){const p=JSON.parse(m.body);if(m.url.endsWith('set-setting')){writes.push(p.key);state[p.key]=p.value}queueMicrotask(()=>listener?.({data:{type:'fetch-response',requestId:m.requestId,responseType:'success',status:200,bodyJsonString:JSON.stringify({value:state[p.key]})}}))}}};
 const sync=vm.runInNewContext(source+';createNativeThemeSync',{})(win,()=>{});
 assert.equal(writes.length,0);
 await sync.applyRecommendedAccent({light:'#7847ae',dark:'#c3a4ef'});
 assert.equal(writes.length,2);
 for(const [key,previous] of Object.entries(original)){assert.deepEqual({...state[key],accent:previous.accent,accentSource:undefined},{...previous,accentSource:undefined})}
 assert.equal(state.appearanceLightChromeTheme.accent,'#7847ae');assert.equal(state.appearanceDarkChromeTheme.accent,'#c3a4ef');sync.destroy();
});
