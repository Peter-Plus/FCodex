import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/file-panel.js',import.meta.url),'utf8');
const setup=()=>{const c=vm.createContext({URL});vm.runInContext(source,c);return c};
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('only local Windows HTML URLs are converted, with one decoding pass',()=>{
 const c=setup();
 assert.equal(c.fadeExternalHtmlPath('file:///S:/Life/%E5%A4%A7%E5%9B%9B%E4%B8%8A/a%20%23%25.html'),'S:/Life/大四上/a #%.html');
 assert.equal(c.fadeExternalHtmlPath('file:///C:/100%2520.htm'),'C:/100%20.htm');
 for(const value of ['https://example.com/a.html','file://server/share/a.html','file:///C:/a.exe','file:///C:/a.html.lnk','file:///tmp/a.html','file:///C:/a%00.html','file:///C:/a%5cb.html','file:///C:/a.html#section','file:///C:/a.html?query','file:///C:/bad%XX.html','C:/a.html'])assert.equal(c.fadeExternalHtmlPath(value),null,value);
});

test('toolbar uses current owning URL; ordinary URLs and address edits stay native',async()=>{
 const c=setup(),listeners=new Map(),calls=[],errors=[];
 const doc={addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name,fn)=>{assert.equal(listeners.get(name),fn);listeners.delete(name)}};
 const props={currentUrl:'file:///C:/one.html',isAddressEditing:false};
 const button={closest:()=>true,__reactFiber$test:{memoizedProps:props}};
 let intercepted=0;
 const event=()=>({target:{closest:()=>button},preventDefault(){intercepted++},stopImmediatePropagation(){}});
 const dispose=c.installExternalHtmlOpen(doc,async()=>({openIn:{open:async request=>{calls.push({...request});return {success:true}}}}),message=>errors.push(message));
 const click=listeners.get('click');click(event());click(event());await tick();
 assert.equal(intercepted,2);assert.deepEqual(calls,[{hostId:'local',path:'C:/one.html',target:'systemDefault'}]);
 props.currentUrl='file:///C:/two.html';click(event());await tick();assert.equal(calls.at(-1).path,'C:/two.html');
 props.isAddressEditing=true;click(event());await tick();assert.equal(calls.length,2);
 props.isAddressEditing=false;props.currentUrl='https://example.com';click(event());await tick();assert.equal(calls.length,2);
 assert.deepEqual(errors,[]);dispose();assert.equal(listeners.size,0);
});

test('failed opens are reported; disposal cancels work awaiting the platform',async()=>{
 const c=setup(),errors=[];let click,resolvePlatform,opens=0;
 const button={closest:()=>true,__reactFiber$test:{memoizedProps:{currentUrl:'file:///C:/a.html',isAddressEditing:false}}};
 const doc={addEventListener:(_n,fn)=>click=fn,removeEventListener(){}};
 const event={target:{closest:()=>button},preventDefault(){},stopImmediatePropagation(){}};
 const dispose=c.installExternalHtmlOpen(doc,async()=>({openIn:{open:async()=>({success:false})}}),m=>errors.push(m));
 click(event);await tick();assert.equal(errors.length,1);dispose();
 const stop=c.installExternalHtmlOpen(doc,()=>new Promise(r=>resolvePlatform=r),m=>errors.push(m));
 click(event);await tick();stop();resolvePlatform({openIn:{open:async()=>{opens++;return {success:true}}}});await tick();assert.equal(opens,0);
});
