import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {patchWindowPreview,patchPreviewScope} from '../startup/window-preview-patch.mjs';
import {patchWindowModePages} from '../startup/window-mode-patch.mjs';
import {pageHomeHooks,patchPageHomeConsumers} from '../startup/window-home-patch.mjs';
import {createTestArea,retireTestArea} from './work-area.mjs';

// Exercise the actual patched hooks with the supported client's React/ReactDOM.
// Keep the native modules intact, without loading the app or its account/session code.
const build=JSON.parse(await fs.readFile('.fade-runtime-isolated/build.json','utf8'));
const archive=await fs.readFile(path.join(build.source,'resources/app.asar'));
const tree=JSON.parse(archive.subarray(16,16+archive.readUInt32LE(12))),offset=8+archive.readUInt32LE(4),assets=tree.files.webview.files.assets.files;
const read=name=>{const e=assets[name];return archive.subarray(offset+Number(e.offset),offset+Number(e.offset)+e.size).toString()};
const shared=read(Object.keys(assets).find(n=>/^app-shared-.*\.js$/.test(n)));
const runtimeName=Object.keys(assets).find(n=>/^rolldown-runtime-.*\.js$/.test(n));
const reactStart=shared.indexOf('var a=i((e=>'),reactEnd=shared.indexOf('function l(e){return typeof e'),domStart=shared.indexOf('goe=i(('),domEnd=shared.indexOf('function xoe(e)');
assert(reactStart>0&&reactEnd>reactStart&&domStart>reactEnd&&domEnd>domStart,'supported native React boundaries');
const react=`import {t as i} from '/${runtimeName}';\n${shared.slice(reactStart,reactEnd)}\nvar ${shared.slice(domStart,domEnd)}\nexport const React=o(),ReactDOM=s_(),ReactDOMClient=boe();`;
const native=read(Object.keys(assets).find(n=>/^app-initial-.*\.js$/.test(n)));
const hooks=patchWindowPreview(native).split('\nvar fadeOriginalNativeTab;')[1];assert(hooks);
const scopeHooks='function fadeCapturePreviewScope'+patchPreviewScope(shared).split('\nfunction fadeCapturePreviewScope')[1];
const scopeProvider=shared.slice(shared.indexOf('function OXe('),shared.indexOf('var SW,CW,wW,PXe,TW;'));
const pruneChain=shared.slice(shared.indexOf('function rU(e,t){let n=new Map'),shared.indexOf('function iU(e,t,n)'));
assert(scopeProvider.includes('Missing parent scope')&&pruneChain.includes('t.parent'));
const primary=patchWindowModePages(read(Object.keys(assets).find(n=>/^app-primary-.*\.js$/.test(n))));
const homePrimary=patchPageHomeConsumers(primary.replace('RTn as Yy','fadeStudyProduct as Yy'));
// Run the native home composer's actual mode-selection block; account/access
// services are fixture adapters, while router contexts and React are native.
function homeModeCode(source){const start=source.indexOf('function XVt(e)'),end=source.indexOf('if(UVt.length>0)',start);assert(start>=0&&end>start);return source.slice(start,end)+'return ie}'}
const stableHost=primary.slice(primary.indexOf('function Kgt('),primary.indexOf('function fadeOriginalRetainedPages('));
const pageCacheCode=primary.slice(primary.indexOf('function Kgt('),primary.indexOf('var r$,i$,a$,o$,s$;'))+primary.slice(primary.lastIndexOf('\nfunction fadePaneDraft'));
const model=await fs.readFile('src/window-preview.js','utf8'),css=await fs.readFile('src/file-panel.css','utf8');
const base=await createTestArea('window-preview'),profile=path.join(base,'browser');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/javascript');if(req.url==='/react.js')res.end(react);else if(req.url==='/'+runtimeName)res.end(read(runtimeName));else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><html data-fade-window-mode><body><div id="root"></div></body></html>')}});
let browser,socket,serial=0;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function command(method,params={}){return new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{socket.removeEventListener('message',receive);reject(Error('CDP timeout: '+method))},10000),receive=e=>{const r=JSON.parse(e.data);if(r.id!==id)return;clearTimeout(timer);socket.removeEventListener('message',receive);r.error?reject(Error(JSON.stringify(r.error))):resolve(r.result)};socket.addEventListener('message',receive);socket.send(JSON.stringify({id,method,params}))})}
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'http://127.0.0.1:'+server.address().port],{stdio:'ignore',windowsHide:true});
 let port;for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await wait(100)}}assert(port);
 const target=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});
 const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 for(let i=0;i<100;i++){if(await evaluate(`location.protocol==='http:'&&document.readyState==='complete'`))break;await wait(50)}
 assert.equal(await evaluate(`location.protocol==='http:'&&document.readyState==='complete'`),true,'fixture loaded');
 await evaluate(`(async()=>{const {React,ReactDOM,ReactDOMClient}=await import('/react.js');Object.assign(window,{React,ReactDOM,ReactDOMClient})})()`);
 await evaluate(`
 const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);
 const dYi=React,fYi=ReactDOM,dV={jsx:(type,props,key)=>React.createElement(type,{...props,key})},Lk=React.createContext(null),hYi=()=>{};
 dV.jsxs=dV.jsx;dV.Fragment=React.Fragment;const o$=dV;
 // Execute the supported client's actual scope provider, including its retained
 // entry bookkeeping. Only atom storage/disposal services are fixture adapters.
 const CW=React,wW=dV,SW={default:(a,b)=>JSON.stringify(a)===JSON.stringify(b)},PXe={};let TW=0;
 const gW=React.createContext(new Map),_W=React.createContext(null),yW=new Map,vW=new WeakMap;
 function mW(token){if(!vW.has(token))vW.set(token,React.createContext(yW));return vW.get(token)}
 const eV=init=>({init}),tV=()=>{const values=new Map;return {get:a=>values.has(a)?values.get(a):a.init,set(a,v){values.set(a,typeof v==='function'?v(this.get(a)):v)}}};
 class jqe{jobs=new Map;cancel(key){clearTimeout(this.jobs.get(key));this.jobs.delete(key)}schedule(key,delay,fn){this.cancel(key);this.jobs.set(key,setTimeout(fn,delay))}}
 const zqe=()=>{},cV=()=>{},RU=node=>{node.disposed=true},rV=()=>Infinity;
 ${pruneChain}
 ${scopeProvider}
 ${scopeHooks}
 const AppScope={id:Symbol('app')},ThreadScope={id:Symbol('thread'),parent:AppScope},Qy={id:Symbol('route'),parent:ThreadScope},ComposerScope={id:Symbol('composer'),parent:Qy},GitScope={id:Symbol('git'),parent:ComposerScope};
 const hi=token=>{const chain=React.useContext(mW(token)),node=chain.get(token.id);return React.useMemo(()=>({node,chain,scope:token,value:node.value}),[node,chain])};
 const appNode=kXe({scope:AppScope,providedValue:{},scopeKey:'app',queryClient:{}}),appChain=new Map([[AppScope.id,appNode]]);
 const q=store=>React.useSyncExternalStore(store.subscribe,store.get);
 function store(initial){let value=initial;const listeners=new Set();return {get:()=>value,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)},set(v){value=v;for(const fn of listeners)fn()}}}
 ${model}
 const preview=installWindowPreview({changed(){preview.layout(true,0,600)}}),bridge=window.__fadePreviewBridge;
 window.__fadeWindowModeEnabled=true;const errors=[];window.addEventListener('error',e=>errors.push(e.message));
 let panelMounts=0,panelCleanups=0;
 function PreviewContent({tab,hidden,isActive}){const [draft,setDraft]=React.useState('draft:'+tab.tabId),node=React.useContext(gW).get(ComposerScope.id);if(!node||node.disposed)throw Error('Missing or disposed composer');React.useLayoutEffect(()=>{panelMounts++;return()=>panelCleanups++},[]);return React.createElement('div',{role:'tabpanel',hidden,'data-tab':tab.tabId,'data-active':isActive},React.createElement('input',{value:draft,onChange:e=>setDraft(e.target.value)}),React.createElement('button',{onClick:()=>setDraft('edited:'+tab.tabId)},'Edit'))}
 function fadeOriginalNativeTab(props){return dV.jsx(OXe,{scope:GitScope,value:{tab:props.tab.tabId},children:dV.jsx(PreviewContent,props)})}
 ${hooks}
 const scopes=[],snapshots=[];
 const controllers=[0,1].map(i=>{const tabs=[{tabId:'file:'+i,title:'readme'},{tabId:'diff:'+i,title:'Changes'}];return {panelId:'right',tabs$:store(tabs),activeTab$:store(tabs[0]),activateTab(s,id){this.activeTab$.set(this.tabs$.get().find(t=>t.tabId===id))},closeTab(s,id){this.tabs$.set(this.tabs$.get().filter(t=>t.tabId!==id))},pinTab(){}}});
 const layoutContext={};
 function Source({index}){scopes[index]=hi(Qy);snapshots[index]=fadeCapturePreviewScope();fadeObservePreviewController(controllers[index]);return null}
 function fadeOriginalRetainedPages({focus=0,ids=[0,1]}){return ids.map(index=>dV.jsx(React.Activity,{mode:focus===index?'visible':'hidden',children:dV.jsx(OXe,{scope:ThreadScope,value:{index},children:dV.jsx(OXe,{scope:Qy,value:{pathname:'/local/'+index},children:dV.jsx(OXe,{scope:ComposerScope,value:{index},children:dV.jsx(Lk.Provider,{value:layoutContext,children:dV.jsx(Source,{index})})})})})},index))}
 ${stableHost}
 const app=ReactDOMClient.createRoot(document.getElementById('root'));
 function renderFocus(focus,ids=[0,1]){ReactDOM.flushSync(()=>app.render(dV.jsx(React.StrictMode,{children:dV.jsx(_W.Provider,{value:appNode.queryClient,children:dV.jsx(gW.Provider,{value:appChain,children:dV.jsx(mW(AppScope).Provider,{value:appChain,children:dV.jsx(Kgt,{focus,ids})})})})})))}
 function state(){const hosts=[...document.querySelectorAll('.fade-preview-native-host')],visible=hosts.filter(h=>getComputedStyle(h).display!=='none');return {hosts:hosts.length,panels:hosts.map(h=>h.querySelectorAll('[role=tabpanel]').length),visible:visible.length,visiblePanels:visible.reduce((n,h)=>n+h.querySelectorAll('[role=tabpanel]').length,0)}}
 renderFocus(0);renderFocus(1);
 `);
 const single={hosts:4,panels:[1,1,1,1],visible:1,visiblePanels:1};
 assert.deepEqual(await evaluate('state()'),single,'native scope providers render one card per tab');
 await evaluate(`document.querySelector('.fade-preview-native-host:not([hidden]) button').click()`);
 assert.equal(await evaluate(`document.querySelector('.fade-preview-native-host:not([hidden]) input').value`),'edited:file:1');
 await evaluate(`ReactDOM.flushSync(()=>preview.select(bridge.key(scopes[0],'diff:0')))`);
 assert.deepEqual(await evaluate('state()'),single,'switching sources shows one card');
 await evaluate(`ReactDOM.flushSync(()=>preview.select(bridge.key(scopes[1],'file:1')));window.keptPanel=document.querySelector('.fade-preview-native-host:not([hidden]) [role=tabpanel]');window.counts=[panelMounts,panelCleanups]`);
 for(let i=0;i<12;i++)await evaluate(`renderFocus(${i%2})`);
 assert.deepEqual(await evaluate('[panelMounts,panelCleanups]'),await evaluate('counts'),'focus switches must not remount or clean up previews');
 assert.equal(await evaluate(`keptPanel===document.querySelector('.fade-preview-native-host:not([hidden]) [role=tabpanel]')`),true,'focus keeps the same DOM card');
 assert.equal(await evaluate(`keptPanel.querySelector('input').value`),'edited:file:1','focus preserves edited preview state');
 await evaluate(`renderFocus(0,[0])`);
 assert.deepEqual(await evaluate('state()'),single,'closing source page preserves its open previews');
 assert.equal(await evaluate('keptPanel.isConnected'),true,'source page unmount does not transfer the renderer');
 await evaluate(`renderFocus(1)`);
 await evaluate(`ReactDOM.flushSync(()=>preview.close(bridge.active))`);
 assert.deepEqual(await evaluate('state()'),{hosts:3,panels:[1,1,1],visible:1,visiblePanels:1},'closing active preview selects a single remaining card');
 for(let cycle=0;cycle<3;cycle++){
  await evaluate(`ReactDOM.flushSync(()=>preview.closeAll())`);
  assert.deepEqual(await evaluate('state()'),{hosts:0,panels:[],visible:0,visiblePanels:0},'close all removes every card');
  await evaluate(`ReactDOM.flushSync(()=>{const tab={tabId:'file:1',title:'readme'};controllers[1].tabs$.set([tab]);controllers[1].activeTab$.set(tab)})`);
  assert.deepEqual(await evaluate('state()'),{hosts:1,panels:[1],visible:1,visiblePanels:1},'reopen same file after closing preview');
 }
 await evaluate(`ReactDOM.flushSync(()=>{window.__fadeWindowModeEnabled=false;window.dispatchEvent(new Event('fade-window-mode'))});preview.reset()`);
 assert.deepEqual(await evaluate('state()'),{hosts:0,panels:[],visible:0,visiblePanels:0});
 await evaluate(`ReactDOM.flushSync(()=>{window.__fadeWindowModeEnabled=true;window.dispatchEvent(new Event('fade-window-mode'))})`);
 assert.deepEqual(await evaluate('state()'),{hosts:1,panels:[1],visible:1,visiblePanels:1},'mode re-entry registers one renderer');
 assert.deepEqual(await evaluate('errors'),[],'no native scope/render errors');
 await evaluate(`ReactDOM.flushSync(()=>app.unmount());preview.destroy()`);
 assert.equal(await evaluate(`document.querySelectorAll('.fade-preview-native-host,[data-fade-unified-preview]').length`),0);
 // Exercise the actual native cache and compiled memo blocks, including the
 // builtin:home destination branch which simple DOM pane fixtures cannot model.
 await evaluate(`(()=>{
  const a$=React,o$=dV,r$={c:n=>React.useMemo(()=>Array(n).fill(Symbol.for('react.memo_cache_sentinel')),[])},i$={default:(a,b)=>JSON.stringify(a)===JSON.stringify(b)},s$={safeParse:data=>({success:true,data})};
  const auth={isLoading:false,authMethod:'chatgpt',accountId:'test',userId:'test'},Ire=React.createContext(auth),Io=React.createContext(null),vl=React.createContext({matches:[]}),Xu=React.createContext({}),HomeContext=React.createContext(null);
  const gO={},Hg={},Yse=()=>null,XOe=()=>null,Dxe=()=>'',obe=React.Activity,RNe=React.Fragment,Hgt=()=>null,INe=()=>null;
  const Ide=({navigationState,children})=>dV.jsx(HomeContext.Provider,{value:navigationState,children});
  let globalMode='work';const modeListeners=new Set;const subscribeMode=fn=>{modeListeners.add(fn);return()=>modeListeners.delete(fn)};const Z9=React,X9=r$,$V=React.createContext(null),WO={},sT={},cy={},QRe={},IA={},rA={},$ke={},kS={},Dk={},L2e={},GAe={},jm='work',mT={GO:'go',FREE:'free'},Tqt={};
  const qt=()=>({}),cf=()=>React.useContext(Io).location,ru=cf,Eu=()=> 'work',Zy=loc=>({routeKind:loc.pathname.startsWith('/c/')?'chatgpt-thread':'home'});
  const X=token=>token===sT?React.useSyncExternalStore(subscribeMode,()=>globalMode):token===QRe||token===IA?{status:'denied'}:null;
  const $=(token)=>token===cy?{isCapable:true,isLoading:false}:token===kS?{data:null}:null,kc=()=>true,zm=()=>null,ig=()=>null,ev=()=>null,Rze=()=>false,Bte=()=>null,Tv=()=> 'codex',Kd=(route,p)=>route===p?{}:null,KRe=()=>false,$d=()=>false,mE=()=>null;
  ${pageHomeHooks}
  const OriginalMode=(()=>{${homeModeCode(primary)};return XVt})(),PatchedMode=(()=>{${homeModeCode(homePrimary)};return XVt})();let usePatched=false;
  function Content(){const state=React.useContext(HomeContext),mode=(usePatched?PatchedMode:OriginalMode)({}),product=fadeUsePageProduct();return dV.jsx('input',{'data-fixture-page':state.fadePaneHome||state.fadeDraftKey,'data-mode':mode,'data-product':product,defaultValue:'draft'},mode)}
  ${pageCacheCode}
  const savedRoot=window.__fadePreviewRoot;window.__fadePreviewRoot=()=>null;
  let app=ReactDOMClient.createRoot(document.getElementById('root'));const route={routeKind:'home',pathname:'/',search:'',routeTemplate:'/'},destination={id:'builtin:home',key:'same-native-home'},retainedDestinationIds=new Set(['builtin:home']),children=()=>dV.jsx(Content,{});
  let serial=0;
  window.cacheFixture={patch(){ReactDOM.flushSync(()=>app.unmount());app=ReactDOMClient.createRoot(document.getElementById('root'));usePatched=true},navigate(id,gpt=false){ReactDOM.flushSync(()=>{globalMode=gpt?'chat':'work';modeListeners.forEach(fn=>fn())});window.__fadePaneSlots={one:'pane-1',two:'pane-2',three:'pane-3'};window.dispatchEvent(new Event('fade-pane-layout'));const state=gpt?{fadeChat:true,fadeDraftKey:id}:{fadePaneHome:id};const location={location:{pathname:'/',search:'',hash:'',key:String(++serial),state}};ReactDOM.flushSync(()=>app.render(dV.jsx(Io.Provider,{value:location,children:dV.jsx(Kgt,{route,enabled:true,maxPages:10,destination,retainedDestinationIds,children})})))},state(){return [...document.querySelectorAll('[data-fade-page-key]')].map(el=>({key:el.dataset.fadePageKey,inputs:[...el.querySelectorAll('input')].map(i=>({id:i.dataset.fixturePage,visible:i.getBoundingClientRect().width>0}))}))},modes(){return [...document.querySelectorAll('[data-fixture-page]')].map(el=>({id:el.dataset.fixturePage,mode:el.dataset.mode,product:el.dataset.product}))},destroy(){ReactDOM.flushSync(()=>app.unmount());window.__fadePreviewRoot=savedRoot;delete window.__fadePaneSlots}};
 })()`);
 await evaluate(`cacheFixture.navigate('one');cacheFixture.navigate('two');cacheFixture.navigate('three',true)`);
 // The fixture's external store models the native global atom subscription.
 assert.deepEqual(await evaluate('cacheFixture.modes().map(p=>p.mode)'),['chat','chat','chat'],'original global home mode reproduces all panes becoming GPT');
 await evaluate(`cacheFixture.navigate('one')`);
 assert.deepEqual(await evaluate('cacheFixture.modes().map(p=>p.mode)'),['work','work','work'],'original global home mode also makes all panes become Codex');
 await evaluate(`cacheFixture.patch();cacheFixture.navigate('one');cacheFixture.navigate('two');cacheFixture.navigate('three',true);cacheFixture.navigate('one')`);
 const expectedModes=[{id:'one',mode:'work',product:'codex'},{id:'two',mode:'work',product:'codex'},{id:'three',mode:'chat',product:'work'}];
 assert.deepEqual(await evaluate('cacheFixture.modes()'),expectedModes);
 await evaluate(`window.keptInputs=[...document.querySelectorAll('[data-fixture-page]')];keptInputs.forEach((input,i)=>input.value='unsent-'+i)`);
 const expectPages=['one','two','three'].map(id=>({key:id,inputs:[{id,visible:true}]}));
 assert.deepEqual(await evaluate('cacheFixture.state()'),expectPages,'three distinct new-chat pages survive a shared native home destination');
 for(const id of ['one','two','one','three','two']){
  await evaluate(`cacheFixture.navigate(${JSON.stringify(id)},${id==='three'})`);
  assert.deepEqual(await evaluate('cacheFixture.state()'),expectPages,'no pane disappears after home navigation: '+id);
  assert.deepEqual(await evaluate('cacheFixture.modes()'),expectedModes,'pane type follows retained local route: '+id);
  assert.equal(await evaluate(`keptInputs.every((input,i)=>input.isConnected&&input.value==='unsent-'+i)`),true,'switching panes preserves each input node and unsent draft');
 }
 await evaluate('cacheFixture.destroy()');
 await fs.writeFile(path.join(base,'result.json'),JSON.stringify({passed:true,checks:['native OXe providers including ComposerScope','stable native page-cache wrapper','12 Activity focus switches without remount','editor state','source unmount','close all and reopen same file 3 times','mode toggle','unmount','three new-chat pages with shared builtin:home destination','repeated home navigation keeps every pane visible','original native home mode reproduces both panes changing type','patched native home mode keeps per-page type, input identity and draft']},null,2));
 console.log('Native React preview regression passed: stable focus, complete scope, close/reopen.');
}finally{
 if(socket)try{await command('Browser.close')}catch{}socket?.close();
 if(browser?.exitCode===null)await Promise.race([new Promise(r=>browser.once('exit',r)),wait(3000)]);
 server.closeAllConnections();await new Promise(r=>server.close(r));await retireTestArea(base,browser);
}
