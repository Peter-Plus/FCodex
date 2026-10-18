import fs from 'node:fs';import vm from 'node:vm';import test from 'node:test';import assert from 'node:assert/strict';
test('chat action buttons reflect pin state, stop navigation and prevent duplicate operations',async()=>{
 class El{constructor(){this.children=[];this.dataset={};this.attrs={}}append(e){this.children.push(e)}setAttribute(k,v){this.attrs[k]=v}}
 const messages=[],calls=[];let finish;const provider={chatAction:async(id,action)=>{calls.push([id,action]);await new Promise(r=>finish=r);return true}};
 const c=vm.createContext({document:{createElement:()=>new El()},announce:m=>messages.push(m)});vm.runInContext(fs.readFileSync(new URL('../src/chat-actions.js',import.meta.url),'utf8'),c);
 const row=new El();c.appendFadeChatActions(row,{id:'a',title:'Chat',pinned:true},provider);
 const [pin,archive]=row.children[0].children;assert.equal(pin.attrs['aria-pressed'],'true');assert.match(pin.title,/取消置顶/);
 let stopped=0;const event={preventDefault(){},stopPropagation(){stopped++}};const pending=pin.onclick(event);await archive.onclick(event);assert.deepEqual(calls,[['a','pin']]);finish();await pending;
 const archived=archive.onclick(event);finish();await archived;assert.deepEqual(calls,[['a','pin'],['a','archive']]);assert.equal(stopped,3);assert.deepEqual(messages,[]);
});
test('GPT quick actions use native pin/archive functions and enforce edit permission',async()=>{
 const s=fs.readFileSync(new URL('../src/gpt-tabs.js',import.meta.url),'utf8'),method=s.slice(s.indexOf(' async function chatAction('),s.indexOf(' function history(){'));
 const calls=[],conversation={id:'a',is_starred:true};let editable=true;
 const module={mW:()=>editable,hon:async args=>calls.push(['pin',args.isPinned]),vW:async(_,id)=>calls.push(['archive',id])};
 const c=vm.createContext({pinnedConversations:()=>[],ready:true,disposed:false,module,scope:{get:()=>undefined},query:()=>({state:{data:{pages:[{items:[conversation]}]}}}),schedule(){}});vm.runInContext(method,c);
 assert.equal(await c.chatAction('a','pin'),true);assert.equal(await c.chatAction('a','archive'),true);editable=false;assert.equal(await c.chatAction('a','archive'),false);assert.deepEqual(calls,[['pin',false],['archive','a']]);
});
