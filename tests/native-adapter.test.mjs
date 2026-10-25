import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
const code=fs.readFileSync(new URL('../src/native-adapter.js',import.meta.url),'utf8');
function fixture(){
 const p='data-app-action-sidebar-';let projects=[],threads=[],actions=[],changes=[],callback,disconnected=false;
 const row=(attrs,container)=>({isConnected:true,disabled:false,textContent:'',getAttribute:k=>attrs[k]??null,closest:q=>q.includes('active-page')?null:container,click(){actions.push(this);if(p+'project-collapsed'in attrs)attrs[p+'project-collapsed']=attrs[p+'project-collapsed']==='true'?'false':'true'}});
 const container={querySelector:()=>null,querySelectorAll:()=>[],contains:r=>r.container===container};
 const project=row({[p+'project-id']:'project:A',[p+'project-label']:'A <img src=x>',[p+'project-collapsed']:'true'},container);projects.push(project);
 const makeThread=(host,id,parent=container)=>{const r=row({[p+'thread-id']:id,[p+'thread-host-id']:host,[p+'thread-kind']:'local',[p+'thread-title']:'Chat '+id,[p+'thread-active']:'true'},parent);r.container=parent;return r};
 threads=[makeThread('local','1'),makeThread('remote','1'),makeThread('local','2',null)];
 const newButton=row({'aria-label':'新聊天 Ctrl+N'});const doc={body:{},querySelector:()=>({querySelectorAll:()=>[newButton]}),querySelectorAll:q=>q.includes('project-row')?projects:threads};
 const c=vm.createContext({setTimeout,clearTimeout,MutationObserver:class{constructor(cb){callback=cb}observe(){}disconnect(){disconnected=true}}});vm.runInContext(code,c);const adapter=c.createNativeAdapter(doc,x=>changes.push(x));
 return {container,adapter,actions,changes,threads,project,newButton,makeThread,replaceThread(r){threads[0]=r},get disconnected(){return disconnected}};
}
test('project association, recent entries, host-qualified identities and literal titles',()=>{const f=fixture(),s=f.adapter.snapshot();assert.equal(s.groups[0].chats.length,2);assert.equal(s.recent.length,1);assert.notEqual(s.groups[0].chats[0].id,s.groups[0].chats[1].id);assert.equal(s.groups[0].title,'A <img src=x>')});
test('project toggle delegates once; selecting a chat resolves the latest native node',()=>{const f=fixture();assert(f.adapter.toggle('project:A',true));assert.equal(f.actions.length,1);assert(f.adapter.toggle('project:A',true));assert.equal(f.actions.length,1);const fresh=f.makeThread('local','1');f.replaceThread(fresh);assert(f.adapter.select('local:local:1'));assert.equal(f.actions.at(-1),fresh);fresh.isConnected=false;assert.equal(f.adapter.select('local:local:1'),false)});
test('new chat delegates to the native control; observer stops on destroy',()=>{const f=fixture();f.adapter.start();assert.equal(f.changes.length,1);f.adapter.refresh();assert.equal(f.changes.length,1);assert(f.adapter.newChat());assert.equal(f.actions.at(-1),f.newButton);f.adapter.destroy();assert(f.disconnected);f.adapter.toggle('project:A',true);f.adapter.refresh();assert.equal(f.changes.length,1)});
test('working, input requests, approvals and completion update without changing the title',()=>{
 const f=fixture(),props={statusState:{type:'loading'},chips:[]};
 f.threads[0].__reactFiber$test={memoizedProps:props};
 f.adapter.refresh();assert.equal(f.changes.at(-1).groups[0].chats[0].status.kind,'working');
 props.chips=[{id:'needs-input'}];f.adapter.refresh();assert.equal(f.changes.at(-1).groups[0].chats[0].status.kind,'reply');
 props.chips=[{id:'awaiting-approval'}];f.adapter.refresh();assert.equal(f.changes.at(-1).groups[0].chats[0].status.kind,'approval');
 props.chips=[];f.adapter.refresh();props.statusState={type:'idle',unread:true,unreadCount:3};f.adapter.refresh();
 const status=f.changes.at(-1).groups[0].chats[0].status;assert.equal(status.kind,'completed');assert.equal(status.count,3);
 props.statusState={type:'idle',unread:false};f.adapter.refresh();assert.equal(f.changes.at(-1).groups[0].chats[0].status.kind,'completed');
});
test('unknown/idle chats are not reported complete and unread count is never called pending replies',()=>{
 const c=vm.createContext({});vm.runInContext(code,c);
 assert.equal(c.fadeChatStatusLabel({kind:'idle'}),'');assert.equal(c.fadeChatStatusLabel({kind:'unknown'}),'');
 assert.equal(c.fadeChatStatusLabel({kind:'reply',unread:true,count:5}),'待回复');
 assert.equal(c.fadeChatStatusLabel({kind:'completed',unread:true,count:5}),'新消息 5');
 const status=c.fadeReadChatStatus({__reactFiber$test:{memoizedProps:{statusState:{type:'idle',unreadCount:-1}}}});
 assert.equal(status.count,null);assert.equal(status.unread,false);
});
test('completion notifies once per observed run, survives snapshots and clears only after successful selection',()=>{
 const f=fixture(),props={statusState:{type:'idle',unread:true},chips:[]};
 f.threads[0].__reactFiber$test={memoizedProps:props};
 f.adapter.refresh();assert.equal(f.changes.at(-1).completedIds.length,0,'old unread results must not shake');
 props.statusState={type:'loading'};f.adapter.refresh();
 props.chips=[{id:'needs-input'}];f.adapter.refresh();assert.equal(f.changes.at(-1).completedIds.length,0);
 props.chips=[];f.adapter.refresh();
 props.statusState={type:'idle'};f.adapter.snapshot();f.adapter.snapshot();f.adapter.refresh();
 assert.deepEqual([...f.changes.at(-1).completedIds],['local:local:1']);
 assert(f.changes.at(-1).groups[0].chats[0].status.completionPending);
 const count=f.changes.length;f.adapter.refresh();assert.equal(f.changes.length,count);
 f.threads[0].disabled=true;assert.equal(f.adapter.select('local:local:1'),false);assert(f.adapter.snapshot().groups[0].chats[0].status.completionPending);
 f.threads[0].disabled=false;assert(f.adapter.select('local:local:1'));assert.equal(f.changes.at(-1).groups[0].chats[0].status.completionPending,false);
 props.statusState={type:'loading'};f.adapter.refresh();props.statusState={type:'idle'};f.adapter.refresh();assert.equal(f.changes.at(-1).completedIds.length,1,'another run can notify again');
});
test('opening clears completed/reply badges but never hides ongoing work or a new status event',()=>{
 const f=fixture(),props={statusState:{type:'loading'},chips:[]};
 const c=vm.createContext({});vm.runInContext(code,c);
 f.threads[0].__reactFiber$test={memoizedProps:props};
 const status=()=>f.adapter.snapshot().groups[0].chats[0].status;
 f.adapter.refresh();f.adapter.select('local:local:1');assert.equal(c.fadeChatStatusLabel(status()),'正在工作');
 props.statusState={type:'idle',unread:true};f.adapter.refresh();assert.equal(status().kind,'completed');
 f.adapter.select('local:local:1');assert.equal(c.fadeChatStatusLabel(status()),'');assert.equal(status().completionPending,false);
 f.adapter.refresh();assert.equal(c.fadeChatStatusLabel(status()),'','native unread flag must not resurrect the same badge');
 props.chips=[{id:'needs-input'}];f.adapter.refresh();assert.equal(c.fadeChatStatusLabel(status()),'待回复');
 f.adapter.select('local:local:1');assert.equal(c.fadeChatStatusLabel(status()),'');
 props.statusState={type:'loading'};props.chips=[];f.adapter.refresh();assert.equal(c.fadeChatStatusLabel(status()),'正在工作');
 props.statusState={type:'idle'};f.adapter.refresh();assert.equal(c.fadeChatStatusLabel(status()),'工作完成');
 f.threads[0].disabled=true;f.adapter.select('local:local:1');assert.equal(c.fadeChatStatusLabel(status()),'工作完成');
});

test('project new chat uses only that project entry and never falls back globally',()=>{
 const f=fixture();let clicks=0;
 const button={isConnected:true,disabled:false,getAttribute:k=>k==='aria-label'?'在 A 中开始新聊天':null,click(){clicks++}};
 f.project.querySelectorAll=()=>[button];
 assert.equal(f.adapter.newChat('project:A'),true);assert.equal(clicks,1);assert.equal(f.actions.length,0);
 assert.equal(f.adapter.newChat('missing'),false);
 button.disabled=true;assert.equal(f.adapter.newChat('project:A'),false);assert.equal(clicks,1);
});

test('project more delegates to the current native toggle and tracks its label',()=>{
 const f=fixture();let expanded=false;const button={textContent:'展开显示',isConnected:true,disabled:false,closest:()=>null,getAttribute:()=>null,click(){expanded=!expanded;this.textContent=expanded?'收起显示':'展开显示'}};
 f.container.querySelectorAll=()=>[button];assert.equal(f.adapter.snapshot().groups[0].moreLabel,'展开更多');
 assert.equal(f.adapter.more('project:A'),true);assert.equal(f.adapter.snapshot().groups[0].moreLabel,'收起更多');
 assert.equal(f.adapter.more('project:A'),true);assert.equal(expanded,false);
 assert.equal(f.adapter.more('missing'),false);
});

test('chat quick actions resolve the exact latest native row without opening it',()=>{
 const f=fixture(),calls=[];const pin={isConnected:true,getAttribute:k=>k==='aria-label'?'取消置顶聊天':null,click:()=>calls.push('pin')},archive={isConnected:true,getAttribute:k=>k==='aria-label'?'归档聊天':null,click:()=>calls.push('archive')};
 f.threads[0].querySelectorAll=()=>[pin,archive];
 assert.equal(f.adapter.chatAction('local:local:1','pin'),true);assert.equal(f.adapter.chatAction('local:local:1','archive'),true);assert.equal(f.adapter.chatAction('missing','archive'),false);assert.deepEqual(calls,['pin','archive']);assert.equal(f.actions.length,0);
});

test('pinned chats have their own section and return to their project after unpinning',()=>{
 const f=fixture(),row=f.threads[0],get=row.getAttribute;let pinned=true;
 row.getAttribute=k=>k==='data-app-action-sidebar-thread-pinned'?String(pinned):get(k);
 let data=f.adapter.snapshot();assert.equal(data.pinned.length,1);assert.equal(data.pinned[0].id,'local:local:1');assert.equal(data.groups[0].chats.length,1);assert.equal(data.recent.length,1);
 f.adapter.refresh();const changes=f.changes.length;pinned=false;f.adapter.refresh();assert.equal(f.changes.length,changes+1);
 data=f.adapter.snapshot();assert.equal(data.pinned.length,0);assert.equal(data.groups[0].chats.length,2);
});

