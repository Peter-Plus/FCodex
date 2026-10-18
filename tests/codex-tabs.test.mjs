import fs from 'node:fs';import vm from 'node:vm';import test from 'node:test';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/codex-tabs.js',import.meta.url),'utf8');
test('release waits for grace period, known idle state, hidden pages and absence of drafts',()=>{
 const c=vm.createContext({});vm.runInContext(source,c);const job={path:'/local/a',after:15000},page={active:false,expire(){}},chat={active:false,status:{kind:'idle'}};
 const ready=(opts={})=>c.fadeCodexReleaseReady(job,opts.now??15000,opts.path??'/local/b',opts.tabs??[],opts.chat??chat,opts.pages??[page]);
 assert(ready());assert(!ready({now:14999}));assert(!ready({path:job.path}));assert(!ready({tabs:[{path:job.path}]}));
 for(const kind of ['working','approval','reply','unknown'])assert(!ready({chat:{status:{kind}}}));
 assert(!ready({chat:{active:true,status:{kind:'idle'}}}));assert(!ready({pages:[{...page,active:true}]}));assert(!ready({pages:[{...page,hasDraft:true}]}));assert(!ready({pages:[{active:false}]}));assert(!ready({pages:[]}));
});
function fixture(deferred=false){
 let pending,arrivals=0;
 const location={pathname:'/local/a',state:{},search:''};let tick;const state={listeners:{},addEventListener(k,f){this.listeners[k]=f},removeEventListener(k){delete this.listeners[k]}};
 class El{constructor(){this.children=[];this.attrs={}}append(...items){this.children.push(...items)}replaceChildren(){this.children=[]}setAttribute(k,v){this.attrs[k]=v}removeAttribute(k){delete this.attrs[k]}addEventListener(){}removeEventListener(){}}
 const doc={body:{},querySelectorAll:()=>[],createElement:()=>new El()};
 const rows=['a','b'].map(id=>({id:'local:local:local:'+id,title:id,status:{kind:'idle'},row:{getAttribute:()=> 'local:'+id}}));
 const context=vm.createContext({window:state,Date,setTimeout:()=>1,clearTimeout(){},setInterval:f=>(tick=f,1),clearInterval(){},MutationObserver:class{observe(){}disconnect(){}},fadeNativeRouter:()=>({location,navigator:{push(path,s){if(deferred)pending=()=>Object.assign(location,path,{state:s});else Object.assign(location,path,{state:s})}}})});vm.runInContext(fs.readFileSync(new URL('../src/tab-reorder.js',import.meta.url),'utf8')+'\n'+source,context);
 const list=new El(),dispose=context.installCodexTabs(doc,list,new El(),{snapshot:()=>({recent:rows,groups:[]})},e=>{throw Error(e)},()=>{},{bindContextMenu:(row,id)=>row.menuId=id,onArrival(){arrivals++}});
 return {rows,arrivals:()=>arrivals,notify:path=>state.listeners.message({data:{type:'navigate-to-route',path}}),commit(){pending?.();pending=null},location,list,state:state.__fadeCodexTabs,dispose,tick:()=>tick()};
}
test('Codex navigation deduplicates tabs, GPT route leaves none selected, close and reopen cancel release',()=>{
 const f=fixture();assert.equal(f.state.tabs[0].title,'a');f.location.pathname='/local/b';f.tick();assert.equal(f.state.tabs.length,2);
 f.location.pathname='/local/a';f.tick();assert.equal(f.state.tabs.length,2);
 f.location.pathname='/c/gpt';f.tick();assert(f.list.children.every(e=>e.children[0].attrs['aria-selected']==='false'));
 f.list.children[0].children[1].onclick();assert.equal(f.location.pathname,'/c/gpt');assert.equal(f.state.jobs.length,1);
 f.location.pathname='/local/a';f.tick();assert.equal(f.state.jobs.length,0);assert.equal(f.state.tabs.length,2);
 f.list.children[1].children[1].onclick();assert.equal(f.location.pathname,'/local/b');f.list.children[0].children[1].onclick();assert.equal(f.location.pathname,'/');f.dispose();
});

test('closing waits for asynchronous native navigation without resurrecting the removed tab',()=>{const f=fixture(true);f.location.pathname='/local/b';f.tick();f.list.children[1].children[1].onclick();assert.equal(f.state.tabs.length,1);f.tick();assert.equal(f.state.tabs.length,1);assert.equal(f.state.jobs.length,1);f.commit();f.tick();assert.equal(f.location.pathname,'/local/a');f.location.pathname='/local/b';f.tick();assert.equal(f.state.tabs.length,2);assert.equal(f.state.jobs.length,0);f.dispose()});

test('window-mode home tabs retain distinct native draft keys through switching and close',()=>{const f=fixture();const a=f.dispose.addHome('fade-home-a'),b=f.dispose.addHome('fade-home-b');f.tick();assert.equal(a.location.pathname,'/');assert.equal(b.location.pathname,'/');f.dispose.activate(a);assert.equal(f.location.state.fadePaneHome,'fade-home-a');f.dispose.close(a);assert.equal(f.location.state.fadePaneHome,'fade-home-b');assert(f.state.tabs.includes(b));f.dispose()});

test('completed badge is acknowledged on entering the chat and returns after the next background completion',()=>{
 const f=fixture();f.location.pathname='/local/b';f.tick();f.rows[0].status.kind='working';f.tick();f.rows[0].status.kind='completed';f.tick();
 const icon=()=>f.list.children[0].children[0].children[1];assert(icon());
 f.location.pathname='/local/a';f.tick();assert.equal(icon(),undefined);
 f.location.pathname='/local/b';f.tick();assert.equal(icon(),undefined);
 f.rows[0].status.kind='working';f.tick();f.rows[0].status.kind='completed';f.tick();assert(icon());
 f.rows[0].status.kind='reply';f.location.pathname='/local/a';f.tick();assert(icon());f.dispose();
});

test('native navigation opens missing and closed tabs and handles same-path fresh navigation after closing',()=>{
 const f=fixture(true);f.notify('/local/b');assert.equal(f.state.tabs.length,1);f.location.pathname='/local/b';f.location.key='notification-1';f.tick();assert.equal(f.state.tabs.length,2);assert.equal(f.arrivals(),1);
 f.list.children[1].children[1].onclick();assert.equal(f.state.tabs.length,1);
 f.notify('/local/b');f.location.key='notification-2';f.tick();assert.equal(f.state.tabs.length,2);assert.equal(f.state.jobs.length,0);assert.equal(f.arrivals(),2);
 f.location.pathname='/c/gpt';f.tick();f.notify('/local/b');f.location.pathname='/local/b';f.tick();assert.equal(f.state.tabs.length,2);assert.equal(f.arrivals(),3);f.dispose();
});

test('Codex menus bind saved tabs and skip native empty-chat placeholders',()=>{const f=fixture();assert.equal(f.list.children[0].menuId,f.rows[0].id);f.rows[1].id='local:local:local:client-new-thread:blank';f.location.pathname='/local/b';f.tick();assert.equal(f.list.children.length,2);assert.equal(f.state.tabs[1].title,'b');f.rows[1].id='local:local:local:b';f.tick();assert.equal(f.list.children.length,2);f.tick();assert.equal(f.list.children.length,2);f.dispose()});

test('first submission opens immediately without sidebar data, then updates title in place',()=>{const f=fixture();f.location.pathname='/local/fresh';f.tick();assert.equal(f.state.tabs.length,2);const tab=f.state.tabs[1];assert.equal(tab.title,'新聊天');f.rows.push({id:'local:local:local:fresh',title:'自动命名',row:{getAttribute:()=> 'local:fresh'}});f.tick();assert.equal(f.state.tabs.length,2);assert.equal(f.state.tabs[1],tab);assert.equal(tab.title,'自动命名');f.dispose()});
test('temporary submission route upgrades the same tab to its permanent route',()=>{const f=fixture();f.location.pathname='/local/client-new-thread%3Adraft';f.tick();const tab=f.state.tabs[1];assert.equal(tab.title,'新聊天');f.rows.push({id:'local:local:local:client-new-thread:draft',title:'原生命名',row:{getAttribute:()=> 'local:client-new-thread:draft',__reactFiber$test:{memoizedProps:{conversationId:'fresh'}}}});f.location.pathname='/local/fresh';f.tick();assert.equal(f.state.tabs.length,2);assert.equal(f.state.tabs[1],tab);assert.equal(tab.path,'/local/fresh');f.dispose()});

test('persistent native temporary key and canonical route share one tab and follow native naming',()=>{const f=fixture();const row={id:'local:local:local:client-new-thread:draft',title:'',row:{getAttribute:()=> 'local:client-new-thread:draft'}};f.rows.push(row);f.location.pathname='/local/client-new-thread:draft';f.tick();assert.equal(f.state.tabs[1].title,'新聊天');row.row.__reactFiber$test={memoizedProps:{conversationId:'server-id'}};row.title='自动标题';f.location.pathname='/local/server-id';f.tick();assert.equal(f.state.tabs.length,2);assert.equal(f.state.tabs[1].title,'自动标题');f.location.pathname='/local/client-new-thread:draft';f.tick();assert.equal(f.state.tabs.length,2);assert.equal(f.state.tabs[1].path,'/local/server-id');assert.equal(f.list.children[1].children[0].attrs['aria-selected'],'true');f.dispose()});
