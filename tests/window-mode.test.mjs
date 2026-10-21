import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import {patchWindowModePages,assertWindowModeAsset} from '../startup/window-mode-patch.mjs';
function model(){const c=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../src/window-layout.js',import.meta.url),'utf8'),c);return c.createFadeWindowLayout()}
test('same-type transfer keeps one owner, selection follows transfer, different types rejected',()=>{const m=model(),a=m.add('codex'),b=m.add('codex'),g=m.add('gpt');m.place('a',a);m.place('b',a);m.place('a',b);assert.equal(m.owner('a'),b);assert.deepEqual([...a.tabs],['b']);assert.equal(b.active,'a');assert.throws(()=>m.place('a',g),/同类型/);assert.equal(m.owner('a'),b);m.forget('b');assert.equal(a.active,null)});
test('four-pane cap and independent same-type ordering',()=>{const m=model(),a=m.add('gpt');m.place('a',a);m.place('b',a);m.place('b',a,0);assert.deepEqual([...a.tabs],['b','a']);for(let i=0;i<3;i++)m.add('codex');assert.throws(()=>m.add('codex'),/4/);m.remove(a);assert.equal(m.panes.length,3);assert.throws(()=>m.add('unknown'),/类型/)});
test('native patch validates installed client and keeps hidden panes mounted through cache expiry',()=>{
 const build=JSON.parse(fs.readFileSync(new URL('../.fade-runtime-isolated/build.json',import.meta.url)));
 const archive=fs.readFileSync(path.join(build.source,'resources/app.asar')),tree=JSON.parse(archive.subarray(16,16+archive.readUInt32LE(12))),offset=8+archive.readUInt32LE(4);
 const assets=tree.files.webview.files.assets.files,name=Object.keys(assets).find(n=>/^app-primary-.*\.js$/.test(n)),e=assets[name];
 const source=archive.subarray(offset+Number(e.offset),offset+Number(e.offset)+e.size).toString();
 // The GPT home module is this same primary asset. Both patches must survive.
 assert(source.includes('function MQ(e)')&&source.includes('RTn as Yy')&&source.includes('homeDraftKey'));
 const patched=patchWindowModePages(source.replace('RTn as Yy','fadeStudyProduct as Yy'));
 assertWindowModeAsset(patched);assert(patched.includes('fadeStudyProduct as Yy'));
 assert.throws(()=>assertWindowModeAsset(source.replace('RTn as Yy','fadeStudyProduct as Yy')),/Final asset lost window-mode patch/);
 const syntax=spawnSync(process.execPath,['--input-type=module','--check'],{input:patched,encoding:'utf8',windowsHide:true});assert.equal(syntax.status,0,syntax.stderr);
 assert(patched.includes('useSyncExternalStore)(fadePaneSubscribe'));
 assert(patched.includes('t.current.key===e.key||fadePaneRetain(e)?t:'));
 assert(patched.includes('p=d.filter(e=>fadePaneRetain(e)||'));
 assert.throws(()=>patchWindowModePages(patched),/Unsupported/);
 // Exercise the actual patched retained-page component with React hook shims.
 const start=patched.indexOf('function qgt('),end=patched.indexOf('function Zgt(',start);
 const c=vm.createContext({window:{__fadePaneSlots:{'/local/one':'pane-1'},addEventListener(){},removeEventListener(){}},r$:{c:n=>Array(n)},a$:{useSyncExternalStore:(_s,get)=>get()},o$:{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},Hgt:'meta',vl:{Provider:'matches'},Io:{Provider:'location'},obe:'activity',RNe:'lease',Ide:'route',Xu:{Provider:'router'} });
 vm.runInContext(patched.slice(start,end)+patched.slice(patched.lastIndexOf('\nfunction fadePaneDraft')),c);
 const view={location:{location:{pathname:'/local/one',state:{}}},navigationLocation:{location:{}},route:{},element:'content'};
 const result=c.Xgt({view,active:false});const text=JSON.stringify(result);assert(text.includes('"mode":"visible"'));assert(text.includes('"data-app-shell-active-page":false'));
 c.window.__fadePaneSlots['/local/one']='hidden';assert(JSON.stringify(c.Xgt({view,active:true})).includes('"mode":"hidden"'));
});

test('draft identity overrides both native home destination and route cache keys, including memo hits',()=>{
 const build=JSON.parse(fs.readFileSync(new URL('../.fade-runtime-isolated/build.json',import.meta.url)));
 const archive=fs.readFileSync(path.join(build.source,'resources/app.asar')),tree=JSON.parse(archive.subarray(16,16+archive.readUInt32LE(12))),offset=8+archive.readUInt32LE(4);
 const e=Object.entries(tree.files.webview.files.assets.files).find(([n])=>/^app-primary-.*\.js$/.test(n))[1];
 const patched=patchWindowModePages(archive.subarray(offset+Number(e.offset),offset+Number(e.offset)+e.size).toString());
 const code=patched.slice(patched.indexOf('function fadeOriginalRetainedPages('),patched.indexOf('function qgt('))+patched.slice(patched.lastIndexOf('\nfunction fadePaneDraft'));
 for(const destination of [undefined,{id:'builtin:home',key:'native-home'}]){
  const cache=Array(71).fill(Symbol.for('react.memo_cache_sentinel')),auth={isLoading:false,authMethod:'chatgpt',accountId:'account',userId:'user'};
  const contexts={auth,location:{location:{state:{fadePaneHome:'one'}}},matches:{},router:{}};
  const c=vm.createContext({window:{},r$:{c:()=>cache},a$:{useContext:key=>contexts[key]},Ire:'auth',Io:'location',vl:'matches',Xu:'router',gO:'conversation',Hg:'thread',$:key=>key==='thread'?'same-native-thread':null,Yse:()=>null,XOe:()=>null,Dxe:()=>'',qgt:'cache',o$:{jsx:(type,props)=>({type,props})}});
  vm.runInContext(code,c);
  const props={route:{routeKind:'home',pathname:'/',search:''},enabled:true,maxPages:10,destination,retainedDestinationIds:new Set(['builtin:home']),children:()=>null};
  const first=c.fadeOriginalRetainedPages(props).props.current;
  // Keep the route, destination, and every existing memo dependency identical.
  // Only the location's draft identity changes, just as on two blank home tabs.
  contexts.location={location:{state:{fadePaneHome:'two'}}};
  const second=c.fadeOriginalRetainedPages(props).props.current;
  assert.notEqual(first.key,second.key);assert.deepEqual(JSON.parse(first.key),['fade-draft','one']);assert.deepEqual(JSON.parse(second.key),['fade-draft','two']);
  contexts.location={location:{state:{fadeDraftKey:'gpt-one'}}};
  assert.deepEqual(JSON.parse(c.fadeOriginalRetainedPages(props).props.current.key),['fade-draft','gpt-one']);
 }
});
