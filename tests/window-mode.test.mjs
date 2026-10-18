import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import {patchWindowModePages} from '../startup/window-mode-patch.mjs';
function model(){const c=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../src/window-layout.js',import.meta.url),'utf8'),c);return c.createFadeWindowLayout()}
test('same-type transfer keeps one owner, selection follows transfer, different types rejected',()=>{const m=model(),a=m.add('codex'),b=m.add('codex'),g=m.add('gpt');m.place('a',a);m.place('b',a);m.place('a',b);assert.equal(m.owner('a'),b);assert.deepEqual([...a.tabs],['b']);assert.equal(b.active,'a');assert.throws(()=>m.place('a',g),/同类型/);assert.equal(m.owner('a'),b);m.forget('b');assert.equal(a.active,null)});
test('four-pane cap and independent same-type ordering',()=>{const m=model(),a=m.add('gpt');m.place('a',a);m.place('b',a);m.place('b',a,0);assert.deepEqual([...a.tabs],['b','a']);for(let i=0;i<3;i++)m.add('codex');assert.throws(()=>m.add('codex'),/4/);m.remove(a);assert.equal(m.panes.length,3);assert.throws(()=>m.add('unknown'),/类型/)});
test('native patch validates installed client and keeps hidden panes mounted through cache expiry',()=>{
 const build=JSON.parse(fs.readFileSync(new URL('../.fade-runtime-isolated/build.json',import.meta.url)));
 const archive=fs.readFileSync(path.join(build.source,'resources/app.asar')),tree=JSON.parse(archive.subarray(16,16+archive.readUInt32LE(12))),offset=8+archive.readUInt32LE(4);
 const assets=tree.files.webview.files.assets.files,name=Object.keys(assets).find(n=>/^app-primary-.*\.js$/.test(n)),e=assets[name];
 const source=archive.subarray(offset+Number(e.offset),offset+Number(e.offset)+e.size).toString(),patched=patchWindowModePages(source);
 const syntax=spawnSync(process.execPath,['--input-type=module','--check'],{input:patched,encoding:'utf8',windowsHide:true});assert.equal(syntax.status,0,syntax.stderr);
 assert(patched.includes('useSyncExternalStore)(fadePaneSubscribe'));
 assert(patched.includes('t.current.key===e.key||fadePaneRetain(e)?t:'));
 assert(patched.includes('p=d.filter(e=>fadePaneRetain(e)||'));
 assert.throws(()=>patchWindowModePages(patched),/Unsupported/);
 // Exercise the actual patched retained-page component with React hook shims.
 const start=patched.indexOf('function qgt('),end=patched.indexOf('function Zgt(',start);
 const c=vm.createContext({window:{__fadePaneSlots:{'/local/one':'pane-1'},addEventListener(){},removeEventListener(){}},r$:{c:n=>Array(n)},a$:{useSyncExternalStore:(_s,get)=>get()},o$:{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},Hgt:'meta',vl:{Provider:'matches'},Io:{Provider:'location'},obe:'activity',RNe:'lease',Ide:'route',Xu:{Provider:'router'} });
 vm.runInContext(patched.slice(start,end)+patched.slice(patched.lastIndexOf('\nfunction fadePaneKey')),c);
 const view={location:{location:{pathname:'/local/one',state:{}}},navigationLocation:{location:{}},route:{},element:'content'};
 const result=c.Xgt({view,active:false});const text=JSON.stringify(result);assert(text.includes('"mode":"visible"'));assert(text.includes('"data-app-shell-active-page":false'));
 c.window.__fadePaneSlots['/local/one']='hidden';assert(JSON.stringify(c.Xgt({view,active:true})).includes('"mode":"hidden"'));
});
