import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import {pageHomeHooks,patchPageHomeHooks,patchPageHomeConsumers} from '../startup/window-home-patch.mjs';

const build=JSON.parse(fs.readFileSync(new URL('../.fade-runtime-isolated/build.json',import.meta.url)));
const archive=fs.readFileSync(path.join(build.source,'resources/app.asar'));
const tree=JSON.parse(archive.subarray(16,16+archive.readUInt32LE(12))),offset=8+archive.readUInt32LE(4),assets=tree.files.webview.files.assets.files;
const read=prefix=>{const e=assets[Object.keys(assets).find(n=>n.startsWith(prefix)&&n.endsWith('.js'))];return archive.subarray(offset+Number(e.offset),offset+Number(e.offset)+e.size).toString()};
const native=read('app-primary-').replace('RTn as Yy','fadeStudyProduct as Yy'),patched=patchPageHomeConsumers(native);
function component(source,name,next){return source.slice(source.indexOf('function '+name+'('),source.indexOf('function '+next+'('))}

test('native home product gates stay tied to the local page while global focus changes',()=>{
 let location={pathname:'/',state:{}},globalProduct='codex',fallback='work';
 const c=vm.createContext({window:{},ru:()=>location,cf:()=>location,Zy:loc=>({routeKind:loc.pathname.startsWith('/c/')?'chatgpt-thread':'home'}),Eu:()=>fallback,Tqt:{},NQ:{c:n=>Array(n).fill(Symbol.for('react.memo_cache_sentinel'))},X:()=>globalProduct,Yy:{},cy:{},$:()=>({isLoading:false,isCapable:true}),FQ:{jsx:(type,props)=>({type,props})},Uht:'gpt-home',MQ:'home',jht:'wrapper',Ght:'codex-announcements',sgt:'gpt-announcements',Wht:'gpt-child'});
 vm.runInContext(pageHomeHooks,c);
 vm.runInContext(component(native,'Hht','Uht'),c);
 assert.equal(c.Hht({}).props.children.type,'home');globalProduct='work';assert.equal(c.Hht({}).props.children.type,'gpt-home','original follows global navigation');
 vm.runInContext(component(patched,'Hht','Uht')+component(patched,'MQ','Wht'),c);
 for(const product of ['work','codex','work']){
  globalProduct=product;
  for(const loc of [{pathname:'/',state:{fadePaneHome:'codex'}},{pathname:'/',state:{fadeChat:true,fadeDraftKey:'gpt'}},{pathname:'/c/existing',state:{}}]){
   location=loc;const chat=loc.state.fadeChat||loc.pathname.startsWith('/c/');
   assert.equal(c.fadeUsePageProduct(),chat?'work':'codex');
   assert.equal(c.fadeUsePageComposerMode(),chat?'chat':'work');
   assert.equal(c.Hht({}).props.children.type,chat?'gpt-home':c.MQ);
   assert.equal(c.MQ({}).type,chat?'gpt-announcements':'codex-announcements');
  }
 }
 location={pathname:'/',state:{}};fallback='native-preference';assert.equal(c.fadeUsePageComposerMode(),'native-preference','non-GPT retains native preference');
});

test('supported bundle hooks are exact and leave global shell state in place',()=>{
 const initial=patchPageHomeHooks(read('app-initial-'));
 assert(initial.includes('export{fadeUsePageProduct,fadeUsePageComposerMode,'));
 assert(patched.includes('ee??a;GVt'),'preloading uses the same per-page mode as rendering');
 assert(patched.includes('ee=X(Yy),te='),'global shell product subscription remains');
 assert.throws(()=>patchPageHomeHooks(initial),/already installed/);
 assert.throws(()=>patchPageHomeConsumers(patched),/Unsupported/);
});
