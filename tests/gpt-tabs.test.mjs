import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/gpt-tabs.js',import.meta.url),'utf8')
 .replace('module=await import(initial.href);const common=await import(shared.href);','module=await Promise.resolve(nativeModule);const common=await Promise.resolve(nativeCommon);');
async function fixture({supported=true,releaseSupported=false}={}){
 let seq=0,observe;const timers=new Map(),mapping=new Map(),records=[],messages=[];
 class El{constructor(){this.children=[];this.attrs={};this.dataset={};this.listeners={}}append(...x){this.children.push(...x)}replaceChildren(...x){this.children=x}setAttribute(k,v){this.attrs[k]=v}removeAttribute(k){delete this.attrs[k]}getAttribute(k){return this.attrs[k]}addEventListener(k,f){this.listeners[k]=f}removeEventListener(k){delete this.listeners[k]}getBoundingClientRect(){return {width:100}}click(){if(!this.disabled)(this.onclick??this.listeners.click)?.()}}
 const location={pathname:'/local/codex-1',search:'',state:{},key:'initial'},navigator={createHref:x=>x,push(path,state){Object.assign(location,typeof path==='string'?{pathname:path,search:''}:path,{state,key:String(++seq)})}};
 const common={Cot:{}},scope={get(){},queryClient:{getQueryCache:()=>({getAll:()=>records,subscribe:()=>()=>{}})}};
 scope.scope=common.Cot;
 const frame={__reactFiber$x:{memoizedProps:{value:{navigator}},return:{memoizedProps:{value:{location}}}}};
 const button=new El();button.__reactFiber$x={memoizedState:{memoizedState:{current:scope}}};
 const native={fadeStudyChat:supported?{}:null,fadeStudyProduct:{},YQn:(_,id)=>mapping.get(id)??id,ZQn:()=> 'local-chatgpt:'+ ++seq,zYt:(_,opts)=>navigator.push('/',opts)};
 const released=[];let busy=false;
 if(releaseSupported){Object.assign(native,{DYn:(_,id)=>released.push(id),VZn:'status',mZn:'async',VQn:'pending'});scope.get=key=>key==='status'?(busy?'streaming':'idle'):null;scope.queryClient.removeQueries=()=>{}}
 const doc={body:{},querySelector:()=>frame,querySelectorAll:q=>q==='link[href]'?[{href:'app://-/assets/app-initial-a.js'},{href:'app://-/assets/app-shared-b.js'}]:q==='button'?[button]:[],createElement:()=>new El()};
 const win={},context=vm.createContext({window:win,nativeModule:native,nativeCommon:common,crypto:{randomUUID:()=>String(++seq)},setTimeout:f=>{timers.set(++seq,f);return seq},clearTimeout:id=>timers.delete(id),MutationObserver:class{constructor(f){observe=f}observe(){}disconnect(){}}});
 vm.runInContext(fs.readFileSync(new URL('../src/tab-reorder.js',import.meta.url),'utf8')+'\n'+source,context);const list=new El(),add=new El(),api=context.installGptTabs(doc,list,add,m=>messages.push(m),{bindContextMenu:(row,id)=>row.menuId=id});
 const initialReady=api.ready;
 await new Promise(r=>setImmediate(r));
 return {initialReady,state:win.__fadeChatSession,location,api,list,add,mapping,records,messages,released,setBusy(v){busy=v},timerCount:()=>timers.size,async tick(){for(const [id,f]of [...timers]){timers.delete(id);await f()}},sync(){observe();for(const [id,f]of [...timers]){timers.delete(id);f()}},close(i){list.children[i+1].children[1].click()},activate(i){list.children[i+1].children[0].click()}};
}

test('classic mode closes all tabs, restores Codex and drains busy chats after UI disposal',async()=>{
 const f=await fixture({releaseSupported:true});f.add.click();f.add.click();const ids=f.state.tabs.map(t=>t.conversationId);f.setBusy(true);
 f.api.closeAllForClassic();assert.equal(f.state.tabs.length,0);assert.equal(f.state.active,null);assert.equal(f.location.pathname,'/local/codex-1');
 f.api();await f.tick();assert.equal(f.released.length,0);assert(f.timerCount()>0);
 f.setBusy(false);await f.tick();assert.deepEqual(f.released,[...ids]);assert.equal(f.state.pendingCacheRelease.length,0);assert.equal(f.timerCount(),0);
});

test('classic mode refuses to clear tabs before native readiness',async()=>{
 const f=await fixture({supported:false});assert.throws(()=>f.api.closeAllForClassic(),/加载/);assert.equal(f.location.pathname,'/local/codex-1');f.api();
});

test('startup readiness changes after async init and home clears restored ChatGPT route state',async()=>{
 const f=await fixture();assert.equal(f.initialReady,false);assert.equal(f.api.ready,true);
 Object.assign(f.location,{pathname:'/',search:'?temporary-chat=true',state:{sidebarProductMode:'work',fadeChat:true}});
 assert.equal(f.api.home(),true);assert.equal(f.location.pathname,'/');assert.equal(f.location.search,'');
 assert.equal(f.location.state.sidebarProductMode,'codex');assert.equal(f.location.state.fadeChat,undefined);
 f.api();assert.equal(f.api.ready,false);
});
test('new ChatGPT drafts use separate native identifiers without switching global mode',async()=>{const f=await fixture();f.add.click();const first=f.state.tabs[0];f.add.click();assert.equal(f.state.tabs.length,2);assert.notEqual(first.conversationId,f.state.tabs[1].conversationId);assert.equal(f.location.state.fadeChat,true);assert.equal(f.location.state.sidebarProductMode,'codex');f.api()});
test('sent conversation resolves to real route when returning, with no duplicate history tab',async()=>{const f=await fixture();f.add.click();const tab=f.state.tabs[0];f.mapping.set(tab.conversationId,'real-chat');f.add.click();f.activate(0);assert.equal(f.location.pathname,'/c/real-chat');f.api.openHistory({id:'real-chat',title:'Existing'});assert.equal(f.state.tabs.length,2);assert.equal(f.state.active,tab.id)});
test('closing an inactive tab keeps active chat; closing last tab returns Codex home',async()=>{const f=await fixture();f.add.click();f.add.click();const second=f.state.active;f.close(0);assert.equal(f.state.active,second);f.close(0);assert.equal(f.state.tabs.length,0);assert.equal(f.state.active,null);assert.equal(f.location.pathname,'/');assert.equal(f.location.state.sidebarProductMode,'codex')});
test('historical conversations open separately and preserve earlier tab',async()=>{const f=await fixture();f.add.click();const draft=f.state.tabs[0];f.api.openHistory({id:'history-1',title:'History'});assert.equal(f.state.tabs.length,2);assert.equal(f.state.tabs[0],draft);f.api.openHistory({id:'history-1',title:'History'});assert.equal(f.state.tabs.length,2);assert.equal(f.location.pathname,'/c/history-1')});
test('unsupported native version leaves plus disabled instead of silently switching mode',async()=>{const f=await fixture({supported:false});assert.equal(f.add.disabled,true);assert.equal(f.state.tabs.length,0);assert.match(f.messages[0],/不可用/);assert.equal(f.location.pathname,'/local/codex-1')});

test('history waits for native query and request options before fetching',async()=>{
 const f=await fixture();assert.equal((await f.api.loadHistory()).waiting,true);
 let calls=0;const q={queryKey:['chatgpt-conversations',20,false,true],state:{},fetch:async()=>{calls++}};
 f.records.push(q);assert.equal((await f.api.loadHistory()).waiting,true);assert.equal(calls,0);
 q.options={queryFn:()=>{}};assert.equal((await f.api.loadHistory()).waiting,false);assert.equal(calls,1);f.api();
});
test('history joins active requests, propagates failures, and can retry',async()=>{
 const f=await fixture();let fail=true,calls=0;
 f.records.push({queryKey:['chatgpt-conversations',20],options:{queryFn:()=>{}},state:{fetchStatus:'fetching'},fetch:async(_,options)=>{calls++;assert.equal(options.cancelRefetch,false);if(fail)throw Error('offline')}});
 await assert.rejects(f.api.loadHistory(),/offline/);fail=false;await f.api.loadHistory();assert.equal(calls,2);f.api();
});
test('history prefers executable query over hydrated cache entry and forwards pagination',async()=>{
 const f=await fixture();f.records.push({queryKey:['chatgpt-conversations',20],state:{}});
 let direction;f.records.push({queryKey:['chatgpt-conversations',20,false,true],options:{queryFn:()=>{}},state:{},fetch:async(_,options)=>{direction=options.meta.fetchMore.direction}});
 await f.api.loadHistory(true);assert.equal(direction,'forward');f.api();
});

test('GPT menus bind saved chats and become available when a draft receives its saved route',async()=>{const f=await fixture();f.add.click();assert.equal(f.list.children[1].menuId,undefined);const draft=f.state.tabs[0];f.mapping.set(draft.conversationId,'saved-id');f.add.click();f.activate(0);assert.equal(f.list.children[1].menuId,'saved-id');assert.equal(f.list.children[2].menuId,undefined);f.api()});

test('history loads separate pinned conversations, deduplicates and keeps normal pagination',async()=>{
 const f=await fixture();let pinFetches=0,historyFetches=0;
 const regular={queryKey:['chatgpt-conversations',20],options:{queryFn(){}},state:{data:{pages:[{items:[{id:'normal',title:'Normal'},{id:'pin',title:'Old pin'}],offset:0,total:4}]}},fetch:async()=>historyFetches++};
 const pins={queryKey:['chatgpt-pinned-conversations','v2'],options:{queryFn(){}},state:{},async fetch(){pinFetches++;this.state.data=[{item_type:'conversation',item:{id:'pin',title:'Pinned',is_starred:true}},{item_type:'project',item:{id:'project'}},{item_type:'conversation',item:{id:'archived',is_starred:true,is_archived:true}}]}};
 f.records.push(regular,pins);await f.api.loadHistory();let data=f.api.history();assert.deepEqual(Array.from(data.items,c=>c.id),['pin','normal']);assert.equal(data.items[0].pinned,true);assert.equal(data.items[0].title,'Pinned');assert.equal(data.more,true);
 await f.api.loadHistory(true);assert.equal(pinFetches,1);assert.equal(historyFetches,2);
 pins.state.data=[];data=f.api.history();assert.equal(data.items.find(c=>c.id==='pin').pinned,false);f.api();
});
