import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {patchMainBranding,patchBootstrapBranding} from '../startup/branding-patch.mjs';
import {patchQuitGuard} from '../startup/quit-patch.mjs';
import {patchPreviewScope,patchWindowPreview} from '../startup/window-preview-patch.mjs';
import {patchWindowComposerFocus} from '../startup/window-focus-patch.mjs';
import {currentArchiveHash,scopeBindings,patchInitial261021,patchPrimary261021,patchEditor261021} from '../startup/client-261021-patch.mjs';

test('branding tolerates renamed minified bindings but rejects missing/ambiguous hooks',()=>{
 for(const [electron,icon,pathModule,tray] of [['D','ab','S','F3e'],['O','$T','C','RSt']]){
  const input=`N=()=>h?${icon}(r,{localIconsDirectory:(0,${pathModule}.join)(p,\`electron\`,\`.generated\`,\`windows-app-icons\`)}):null;new ${electron}.Tray(r.defaultIcon,process.platform===\`win32\`&&${electron}.app.isPackaged?${tray}(t):void 0);n!=null&&i.setImage(n)`;
  const output=patchMainBranding(input);
  assert.equal(output.split('fade-codex-icon.png').length-1,3);
  assert.throws(()=>patchMainBranding(input+input),/Unsupported branding/);
  assert.throws(()=>patchMainBranding(output),/Unsupported branding/);
 }
 assert.equal(patchBootstrapBranding('y.app.setAppUserModelId(n.r(vI))'),'y.app.setAppUserModelId(`FCodex.Purple.Desktop`)');
});

const app=process.env.FADE_TEST_CODEX_APP;
test('editor refresh waits for data and layout and cancels when hidden or unmounted',()=>{
 const code=patchEditor261021('let[Ft,It]=(0,Q.useState)(Pt)').split('\nfunction fadeRefreshEditorView')[1];
 let effect,frame,cancelled=false,renders=0,visible=true;
 const ref={current:{getInstance:()=>({getContainerElement:()=>({isConnected:true,getClientRects:()=>visible?[{}]:[]}),render:force=>{assert.equal(force,true);renders++}})}};
 const c=vm.createContext({window:{__fadeWindowModeEnabled:true},Q:{useLayoutEffect:fn=>{effect=fn}},requestAnimationFrame:fn=>{frame=fn;return 42},cancelAnimationFrame:id=>{assert.equal(id,42);cancelled=true}});
 vm.runInContext('function fadeRefreshEditorView'+code,c);
 c.fadeRefreshEditorView(ref,true,1,true);const cleanup=effect();assert.equal(renders,0);frame();assert.equal(renders,0);frame();assert.equal(renders,1);cleanup();assert.equal(cancelled,true);
 visible=false;c.fadeRefreshEditorView(ref,true,1,true);effect();frame();frame();assert.equal(renders,1);
 c.fadeRefreshEditorView(ref,false,1,true);assert.equal(effect(),undefined);
 c.fadeRefreshEditorView(ref,true,1,false);assert.equal(effect(),undefined);
});
test('shared native preview panels mount only the native instances across tab switches',()=>{
 const code=patchWindowPreview('mYi=(0,dYi.memo)(function(e){let t=(0,uYi.c)(61);function oYi(e){let t=(0,uYi.c)(84)',{},61,true).split('\nvar fadeOriginalNativeTab;')[1];
 const a={tabId:'text:a'},b={tabId:'text:b'},controller={panelId:'right',tabs$:'tabs',activeTab$:'active',mountedTabs$:'mounted',preparedReplacement$:'prepared',preparedReplacementReactKey$:'preparedKey'};
 let active=a,mounted=[{tab:a,reactKey:'native-editor-0'}],prepared=null;
 const bridge={active:a.tabId,key:(_s,id)=>id,mount:id=>id,reconcile(){}};
 const c=vm.createContext({window:{__fadeWindowModeEnabled:true,__fadePreviewBridge:bridge},q:key=>key==='tabs'?[a,b]:key==='mounted'?mounted:key==='active'?active:key==='prepared'?prepared:'native-prepared',dYi:{useLayoutEffect(){},useSyncExternalStore:(_s,get)=>get()},dV:{jsx:(type,props)=>({type,props})},Lk:{Provider:'layout'},fYi:{createPortal:(node,target,key)=>({node,target,key})},fadeOriginalNativeTab:'native'});
 vm.runInContext(code,c);
 assert.equal(c.fadeNativePreviewTab({controller,tab:a,preparing:true}),null);
 const render=()=>c.fadePreviewScopeGroup({scope:{},controller,bridge,layoutContext:{}});
 let panels=render();assert.equal(panels.length,1);assert.equal(panels[0].target,a.tabId);assert.equal(panels[0].key,'native-editor-0');
 active=b;mounted=[{tab:b,reactKey:'native-editor-1'}];bridge.active=b.tabId;
 panels=render();assert.equal(panels.length,1);assert.equal(panels[0].target,b.tabId);assert.equal(panels[0].key,'native-editor-1');
 prepared=a;panels=render();assert.equal(panels.length,2);assert.equal(panels[1].key,'native-prepared');assert.equal(panels[1].node.props.children.props.preparing,true);
});
test('26.1021 real archive: all patches, syntax, lazy bindings and pane draft identity',{skip:!app},()=>{
 const archive=fs.readFileSync(path.join(app,'resources/app.asar'));
 const header=archive.subarray(16,16+archive.readUInt32LE(12)),tree=JSON.parse(header),offset=8+archive.readUInt32LE(4);
 assert.equal(createHash('sha256').update(header).digest('hex'),currentArchiveHash);
 function read(dir,prefix){let node=tree;for(const part of dir.split('/'))node=node.files[part];const name=Object.keys(node.files).find(n=>prefix instanceof RegExp?prefix.test(n):n.startsWith(prefix)&&n.endsWith('.js'));assert.ok(name);const e=node.files[name];return archive.subarray(offset+Number(e.offset),offset+Number(e.offset)+e.size).toString()}
 const main=patchQuitGuard(patchMainBranding(read('.vite/build','main-')));
 assert.match(main,/running:gue\(\),automations:s\.tr\(\)/);
 const initial=patchWindowComposerFocus(patchInitial261021(read('webview/assets','app-initial-')));
 const primary=patchPrimary261021(read('webview/assets','app-primary-'));
 const shared=patchPreviewScope(read('webview/assets','app-shared-'),scopeBindings);
 const editor=patchEditor261021(read('webview/assets',/^pierre-file-editor-[a-f0-9]+\.js$/));
 for(const source of [main,initial,primary,shared,editor]){
  const checked=spawnSync(process.execPath,['--input-type=module','--check'],{input:source,encoding:'utf8',windowsHide:true});
  assert.ifError(checked.error);assert.equal(checked.status,0,checked.stderr);
 }
 assert.throws(()=>patchPrimary261021(primary),/patch mismatch/);
 assert.throws(()=>patchInitial261021(initial),/patch mismatch/);
 // Native atoms initialize after module evaluation. Compatibility must retain
 // live getters instead of permanently capturing undefined values at startup.
 const bindings=initial.match(/var fadeNativeCompat=\{[^;]+\};/)[0];
 const locals=[...bindings.matchAll(/return ([\w$]+)/g)].map(m=>m[1]);
 const context=vm.createContext({});
 vm.runInContext('var '+locals.join(',')+';'+bindings,context);
 for(const [index,name]of locals.entries())vm.runInContext(name+'={index:'+index+'}',context);
 assert.ok(Object.values(context.fadeNativeCompat).every(v=>typeof v==='object'));
 const page=primary.slice(primary.lastIndexOf('\nfunction fadePaneDraft'),primary.indexOf('\nvar fadeNativePrimaryCompat'));
 const pane=vm.createContext({window:{__fadePaneSlots:{'draft-a':'left','draft-b':'hidden'}}});
 vm.runInContext(page,pane);
 const a={location:{location:{pathname:'/',state:{fadeDraftKey:'draft-a'}}}},b={location:{location:{pathname:'/',state:{fadeDraftKey:'draft-b'}}}};
 assert.equal(pane.fadePaneKey(a),'draft-a');assert.equal(pane.fadePaneSlot(a),'left');
 assert.equal(pane.fadePaneKey(b),'draft-b');assert.equal(pane.fadePaneRetain(b),true);
});
