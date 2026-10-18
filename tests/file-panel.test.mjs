import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/file-panel.js',import.meta.url),'utf8');
test('shell close uses native layout control, never a tab close button',()=>{
 const c=setup();let layoutClicks=0,tabClicks=0;
 const toggle={disabled:false,getAttribute:()=> 'true',closest:()=>null,click:()=>layoutClicks++};
 const tab={disabled:false,getAttribute:()=> 'Close a.js tab',closest:()=>null,click:()=>tabClicks++};
 const panel={ownerDocument:{querySelectorAll:()=>[toggle]},querySelectorAll:()=>[tab]};
 assert(c.fadeCloseFilePanel(panel));assert.equal(layoutClicks,1);assert.equal(tabClicks,0);
 toggle.disabled=true;assert.equal(c.fadeCloseFilePanel(panel),false);assert.equal(tabClicks,0);
});
function setup(){const c=vm.createContext({});vm.runInContext(source,c);return c}
test('review headers resolve their own diff path and host, not an unrelated editor tab',()=>{
 const c=setup();
 const props={reviewPath:'src/first.js',hostConfig:{id:'local'},cwd:'G:/project'};
 const header={matches:()=>true,__reactFiber$test:{memoizedProps:{},return:{memoizedProps:props}}};
 const panel={querySelectorAll:()=>[{closest:()=>null,getAttribute:()=> 'file:local:/G:/wrong.md'}]};
 assert.equal(c.fadeAbsoluteFile(c.fadePanelFileMetadata(panel,header)),'G:/project/src/first.js');
 props.openFilePathOverride='src/second.js';
 assert.equal(c.fadeAbsoluteFile(c.fadePanelFileMetadata(panel,header)),'G:/project/src/second.js');
 props.hostConfig={id:'remote'};props.cwd='/workspace';
 assert.equal(c.fadePanelFileMetadata(panel,header).hostId,'remote');
 assert.equal(c.fadeAbsoluteFile(c.fadePanelFileMetadata(panel,header)),'/workspace/src/second.js');
});
test('native file tab supplies metadata even when the header has no React path props',()=>{
 const c=setup();
 const tab={closest:()=>null,getAttribute:()=> 'text-editor:local:/G:/Toy/FCodex/README.md'};
 const panel={querySelectorAll:()=>[tab]};
 const meta=c.fadePanelFileMetadata(panel,{closest:()=>tab});
 assert.equal(meta.path,'G:/Toy/FCodex/README.md');assert.equal(meta.hostId,'local');
 assert.equal(c.fadeFileTabMetadata('browser:123'),null);
 assert.equal(c.fadeFileTabMetadata('file:remote:/work/a.md').hostId,'remote');
});
test('one stable shell survives file, review and browser switches, preserves native controls and cleans up',()=>{
 let callback,mode='file';
 class El{
  constructor(tag='div'){this.tag=tag;this.attrs=new Map();this.children=[];this.textContent='';this.isConnected=true;this.events={}}
  getAttribute(k){return this.attrs.get(k)??null}setAttribute(k,v){this.attrs.set(k,v)}hasAttribute(k){return this.attrs.has(k)}removeAttribute(k){this.attrs.delete(k)}
  append(...els){for(const e of els){e.parentElement=this;this.children.push(e)}}
  prepend(e){e.parentElement=this;this.children.unshift(e)}
  remove(){this.parentElement.children=this.parentElement.children.filter(e=>e!==this)}
  addEventListener(k,fn){this.events[k]=fn}closest(){return null}
  querySelectorAll(q){if(q==='button')return this.children.flatMap(c=>[...(c.tag==='button'?[c]:[]),...c.querySelectorAll(q)]);return []}
 }
 const panel=new El('aside'),native=new El(),header=new El(),open=new El('button'),review=new El();header.append(open);native.append(header,review);panel.append(native);
 const tab={closest:()=>null,getAttribute:()=>mode==='file'?'file:local:/G:/work/a.js':'browser:123'};
 header.closest=q=>q.includes('tab-panel-controller')?tab:null;
 panel.querySelectorAll=q=>q.startsWith('[data-testid="viewer-header"]')?(mode==='file'?[header]:[]):q.includes('tab-panel-controller')?[tab]:[];
 const doc={body:{},createElement:t=>new El(t),querySelectorAll:q=>q.startsWith('aside')?[panel]:[]};panel.ownerDocument=doc;
 const c=vm.createContext({clearTimeout(){},MutationObserver:class{constructor(fn){callback=fn}observe(){}disconnect(){}}});vm.runInContext(source,c);
 const dispose=c.installFilePanel(doc,()=>{}),shell=panel.children[0];
 assert.equal(shell.className,'fade-panel-chrome');assert(panel.hasAttribute('data-fade-file-panel'));assert.equal(header.children[0],open);assert(header.hasAttribute('data-fade-file-header'));
 mode='review';callback([{target:panel}]);assert.equal(panel.children[0],shell);assert.equal(header.children.length,1);assert(!review.hasAttribute('data-fade-file-header'));
 mode='browser';callback([{target:panel}]);assert.equal(panel.children[0],shell);assert.equal(panel.children.length,2);
 // Native reconciliation may remove injected chrome while retaining the aside.
 shell.remove();shell.parentElement=null;
 callback([{target:panel}]);assert.equal(panel.children[0],shell);assert.equal(panel.children.length,2);
 mode='file';callback([{target:panel}]);assert.equal(panel.children[0],shell);assert.equal(header.children.length,2);
 dispose();assert.equal(panel.children.length,1);assert.equal(panel.children[0],native);assert.equal(header.children.length,1);assert(!panel.hasAttribute('data-fade-file-panel'));
});
test('file metadata follows native props when the same header switches files',()=>{
 const c=setup(),fiber={memoizedProps:{path:'G:\\project\\first.ts',hostId:'local'}};
 const header={__reactFiber$test:{memoizedProps:{},return:fiber}};
 assert.equal(c.fadeFileMetadata(header).path,'G:\\project\\first.ts');
 fiber.memoizedProps={path:'/workspace/second.md',hostId:'remote',environmentId:'cloud'};
 const next=c.fadeFileMetadata(header);assert.equal(next.path,'/workspace/second.md');assert.equal(next.hostId,'remote');assert.equal(next.environmentId,'cloud');
 assert.equal(c.fadeFileMetadata({}),null);
});
test('copy and reveal never manufacture a local path from an unresolved filename',()=>{
 const c=setup();assert.equal(c.fadeAbsoluteFile(null),null);
 assert.equal(c.fadeAbsoluteFile({path:'report.md',cwd:null}),null);
 assert.equal(c.fadeAbsoluteFile({path:'report.md',cwd:'relative'}),null);
 assert.equal(c.fadeAbsoluteFile({path:'report.md',cwd:'G:\\work\\'}),'G:\\work\\report.md');
 assert.equal(c.fadeAbsoluteFile({path:'/tmp/file.md',cwd:'G:\\work'}),'/tmp/file.md');
 assert.equal(c.fadeAbsoluteFile({path:'\\\\server\\share\\file.md'}),'\\\\server\\share\\file.md');
 assert.equal(c.fadeAbsoluteFile({path:'/G:/work/a.js'}),'G:/work/a.js');
});
test('non-file panels stay untouched and observer is disposed',()=>{
 let disconnected=false,observed=false;
 const c=vm.createContext({setTimeout,clearTimeout,MutationObserver:class{observe(){observed=true}disconnect(){disconnected=true}}});
 vm.runInContext(source,c);
 const dispose=c.installFilePanel({body:{},querySelectorAll:()=>[]},()=>{throw Error('Unexpected action')});
 assert(observed);dispose();assert(disconnected);
});
test('browser and aggregate diff never inherit the path of a neighbouring file pane',()=>{
 const c=setup(),tab={getAttribute:()=> 'file:local:/G:/wrong.md',closest:()=>null};
 const panel={querySelectorAll:()=>[tab]};
 assert.equal(c.fadePanelFileMetadata(panel,{}),null);
 for(const id of ['browser:123','diff']){
  const header={closest:()=>({getAttribute:()=>id})};
  assert.equal(c.fadePanelFileMetadata(panel,header),null);
 }
});

test('drag visibility survives leaving the grip and clears on release, cancellation, blur and disposal',()=>{
 const listeners=new Map(),attrs=new Set();
 const win={addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
 const doc={defaultView:win,documentElement:{hasAttribute:()=>false}};
 const panel={setAttribute:name=>attrs.add(name),removeAttribute:name=>attrs.delete(name)};
 const event={button:0,pointerId:7,target:{closest:()=>({closest:()=>panel})}};
 const dispose=setup().fadeInstallPanelDragState(doc);
 const held=()=>attrs.has('data-fade-panel-dragging');
 listeners.get('pointerdown')(event);assert(held());
 listeners.get('pointerup')({pointerId:8});assert(held());
 listeners.get('pointerup')({pointerId:7});assert(!held());
 for(const type of ['pointercancel','blur']){listeners.get('pointerdown')(event);assert(held());listeners.get(type)({pointerId:7});assert(!held())}
 listeners.get('pointerdown')(event);dispose();assert(!held());assert.equal(listeners.size,0);
});

test('card drag clamps overflow without changing normal pointer movement or taking pointer capture',()=>{
 const listeners=new Map(),attrs=new Set();
 const target={addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n)};
 const panel={setAttribute:n=>attrs.add(n),removeAttribute:n=>attrs.delete(n),getBoundingClientRect:()=>({width:450})};
 const grip={closest:()=>panel,getAttribute:n=>({'aria-valuenow':'450','aria-valuemin':'320','aria-valuemax':'700'})[n]};
 const dispose=setup().fadeInstallPanelDragState({defaultView:target});
 listeners.get('pointerdown')({button:0,pointerId:2,clientX:850,target:{closest:()=>grip}});
 const normal={pointerId:2,clientX:800};listeners.get('pointermove')(normal);assert.equal(normal.clientX,800);
 const wide={pointerId:2,clientX:100};listeners.get('pointermove')(wide);assert.equal(wide.clientX,601);
 const narrow={pointerId:2,clientX:1500};listeners.get('pointermove')(narrow);assert.equal(narrow.clientX,980);
 const other={pointerId:3,clientX:100};listeners.get('pointermove')(other);assert.equal(other.clientX,100);
 const release={pointerId:2,clientX:100};listeners.get('pointerup')(release);assert.equal(release.clientX,601);assert.equal(attrs.size,0);
 dispose();assert.equal(listeners.size,0);
});
test('stacked action wheel scrolls horizontally without hijacking zoom or ordinary headers',()=>{
 const c=setup(),row={scrollWidth:600,clientWidth:300,scrollLeft:0};let prevented=0;
 const header={getAttribute:()=> 'stacked'};
 const event={deltaX:0,deltaY:3,deltaMode:1,preventDefault(){prevented++},stopPropagation(){}};
 c.fadeScrollHeaderActions(event,row,header);assert.equal(row.scrollLeft,48);assert.equal(prevented,1);
 c.fadeScrollHeaderActions({...event,ctrlKey:true},row,header);assert.equal(row.scrollLeft,48);
 c.fadeScrollHeaderActions(event,row,{getAttribute:()=> 'inline'});assert.equal(row.scrollLeft,48);
 row.scrollWidth=300;c.fadeScrollHeaderActions(event,row,header);assert.equal(prevented,1);
});
