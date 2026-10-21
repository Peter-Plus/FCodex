import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import {patchWindowPreview,patchPreviewScope} from '../startup/window-preview-patch.mjs';

test('native preview patch preserves native renderer and refuses unknown versions',()=>{
 const build=JSON.parse(fs.readFileSync(new URL('../.fade-runtime-isolated/build.json',import.meta.url)));
 const archive=fs.readFileSync(path.join(build.source,'resources/app.asar')),tree=JSON.parse(archive.subarray(16,16+archive.readUInt32LE(12))),offset=8+archive.readUInt32LE(4);
 const [name,e]=Object.entries(tree.files.webview.files.assets.files).find(([n])=>/^app-initial-.*\.js$/.test(n));
 const source=archive.subarray(offset+Number(e.offset),offset+Number(e.offset)+e.size).toString(),patched=patchWindowPreview(source);
 const check=spawnSync(process.execPath,['--input-type=module','--check'],{input:patched,encoding:'utf8',windowsHide:true});assert.equal(check.status,0,check.stderr);
 assert.throws(()=>patchWindowPreview(patched),/Unsupported/);assert.throws(()=>patchWindowPreview(''),/Unsupported/);
 assert(patched.includes('fadeOriginalNativeTab=(0,dYi.memo)'));assert(name);
});

test('retained scope group renders original tabs and reconciles with its source scope',()=>{
 const appended=patchWindowPreview('mYi=(0,dYi.memo)(function(e){let t=(0,uYi.c)(69);function oYi(e){let t=(0,uYi.c)(84);children:[rr,ir]}),t[251]').split('\nvar fadeOriginalNativeTab;')[1];
 const calls=[],effects=[],scope={project:'one'},mount={},tab={tabId:'file:host:/one/readme',title:'readme',isPreview:true};
 const bridge={revision:0,active:'scope:file',key:(s,id)=>{assert.equal(s,scope);assert.equal(id,tab.tabId);return 'scope:file'},mount:()=>mount,reconcile:(...args)=>calls.push(args)};
 const controller={panelId:'right',tabs$:'tabs',activeTab$:'active'};
 const context=vm.createContext({window:{__fadeWindowModeEnabled:true,__fadePreviewBridge:bridge},hi:()=>scope,Qy:{},Lk:{Provider:'layout'},q:key=>key==='tabs'?[tab]:tab,dYi:{useSyncExternalStore:(_s,get)=>get(),useLayoutEffect:fn=>effects.push(fn)},dV:{jsx:(type,props)=>({type,props})},fYi:{createPortal:(node,target)=>({node,target})},fadeOriginalNativeTab:'native'});
 vm.runInContext(appended,context);assert.equal(context.fadeNativePreviewTab({controller,tab,isActive:true}),null);
 const result=context.fadePreviewScopeGroup({scope,controller,layoutContext:{},bridge})[0];
 effects.forEach(fn=>fn());assert.equal(result.target,mount);assert.equal(result.node.props.children.type,'native');assert.equal(result.node.props.children.props.tab,tab);assert.equal(result.node.props.children.props.hidden,false);
 assert.equal(calls[0][0],scope);assert.equal(calls[0][2],controller);
 context.window.__fadeWindowModeEnabled=false;assert.equal(context.fadeNativePreviewTab({controller,tab}).type,'native');
});

test('snapshot captures ambient descendants and replays native scope lifetimes in ancestry order',()=>{
 const code=patchPreviewScope('function mW(e){let t=vW.get(e); function OXe({children:e,scope:t,value:n})').split('\nfunction fadeCapturePreviewScope')[1];
 const app={id:'app'},thread={id:'thread',parent:app},route={id:'route',parent:thread},composer={id:'composer',parent:route};
 const chain=new Map([composer,route,app,thread].map(token=>[token.id,{token,value:{id:token.id}}])),queryClient={};
 const gW={Provider:'chain'},_W={Provider:'query'};
 const c=vm.createContext({window:{},CW:{useContext:t=>t===gW?chain:queryClient,useMemo:fn=>fn()},wW:{jsx:(type,props)=>({type,props})},OXe:'native-scope',mW:t=>({Provider:t.id}),_W,gW});
 vm.runInContext('function fadeCapturePreviewScope'+code,c);
 const snapshot=c.fadeCapturePreviewScope();assert.equal(snapshot.chain,chain);
 const result=c.fadeNativeScopeSnapshot({snapshot,children:'editor'});
 assert.equal(result.props.value,queryClient);
 let child=result.props.children.props.children;assert.equal(child.type,'app');assert.equal(child.props.value,chain);
 for(const token of [thread,route,composer]){child=child.props.children;assert.equal(child.type,'native-scope');assert.equal(child.props.scope,token);assert.equal(child.props.value,chain.get(token.id).value)}
 assert.equal(child.props.children,'editor');
});
