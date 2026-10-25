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
function accentSetup(state){
 const writes=[];let listener,seq=0;
 const win={crypto:{randomUUID:()=>String(++seq)},setTimeout,clearTimeout,addEventListener:(k,f)=>listener=f,removeEventListener:()=>listener=null,electronBridge:{sendMessageFromView(m){const p=JSON.parse(m.body);if(m.url.endsWith('set-setting')){writes.push(p.key);state[p.key]=p.value}queueMicrotask(()=>listener?.({data:{type:'fetch-response',requestId:m.requestId,responseType:'success',status:200,bodyJsonString:JSON.stringify({value:state[p.key]})}}))}}};
 const sync=vm.runInNewContext(source+';createNativeThemeSync',{})(win,()=>{});
 return {sync,writes};
}

function assertCatppuccin(state){
 for(const [mode,accent,surface,ink,added,removed] of [
  ['Light','#8839ef','#eff1f5','#4c4f69','#40a02b','#d20f39'],
  ['Dark','#cba6f7','#1e1e2e','#cdd6f4','#a6e3a1','#f38ba8']
 ]){
  assert.equal(state['appearance'+mode+'CodeThemeId'],'catppuccin');
  const theme=state['appearance'+mode+'ChromeTheme'];
  assert.equal(theme.accent,accent);assert.equal(theme.accentSource,'custom');
  assert.equal(theme.surface,surface);assert.equal(theme.ink,ink);
  assert.deepEqual(theme.semanticColors,{diffAdded:added,diffRemoved:removed,skill:accent});
 }
}

test('Catppuccin switches native UI and code themes while preserving user typography and contrast',async()=>{
 const state={appearanceLightChromeTheme:{accent:'#aa0000',fonts:{ui:'Custom UI',code:null,uiFace:{family:'Custom UI',fullName:'Custom UI',postscriptName:'CustomUI'}},ink:'#123456',opaqueWindows:true,contrast:23,surface:'#ffffff',semanticColors:{diffAdded:'#00ff00'}},appearanceDarkChromeTheme:{fonts:{ui:null,code:'Custom Code'},opaqueWindows:false,contrast:0},appearanceTheme:'system'};
 const original=structuredClone(state),{sync,writes}=accentSetup(state);
 try{
  assert.equal(writes.length,0);
  await sync.applyCatppuccinTheme();
  assert.equal(writes.length,4);assertCatppuccin(state);
  for(const mode of ['Light','Dark']){
   const key='appearance'+mode+'ChromeTheme';
   for(const field of ['fonts','contrast','opaqueWindows'])assert.deepEqual(state[key][field],original[key][field]);
  }
  assert.equal(state.appearanceTheme,'system');
 }finally{sync.destroy()}
});

for(const missing of [undefined,null])test('Catppuccin initializes unsaved themes ('+missing+')',async()=>{
 const state={appearanceLightChromeTheme:missing,appearanceDarkChromeTheme:missing};
 const {sync,writes}=accentSetup(state);
 try{
  await sync.applyCatppuccinTheme();assert.equal(writes.length,4);assertCatppuccin(state);
  for(const mode of ['Light','Dark']){
   const theme=state['appearance'+mode+'ChromeTheme'];
   assert.equal(theme.contrast,mode==='Light'?45:60);
   assert.equal(theme.opaqueWindows,false);assert.deepEqual(theme.fonts,{code:null,ui:null});
  }
 }finally{sync.destroy()}
});

test('Catppuccin fills missing fonts when only one mode has settings',async()=>{
 const state={appearanceLightChromeTheme:{fonts:{ui:'My Font'},contrast:0,opaqueWindows:true}};
 const {sync}=accentSetup(state);
 try{
  await sync.applyCatppuccinTheme();assertCatppuccin(state);
  assert.deepEqual(state.appearanceLightChromeTheme.fonts,{code:null,ui:'My Font'});
  assert.equal(state.appearanceLightChromeTheme.contrast,0);
  assert.equal(state.appearanceLightChromeTheme.opaqueWindows,true);
 }finally{sync.destroy()}
});

test('invalid theme data fails before writing either mode',async()=>{
 const state={appearanceDarkChromeTheme:[]},{sync,writes}=accentSetup(state);
 try{await assert.rejects(sync.applyCatppuccinTheme(),/格式无效/);assert.equal(writes.length,0)}finally{sync.destroy()}
});
