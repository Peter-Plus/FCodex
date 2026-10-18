import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const context=vm.createContext({});
for(const file of ['codex-tabs','conversation-title'])vm.runInContext(fs.readFileSync(new URL(`../src/${file}.js`,import.meta.url),'utf8'),context);
const row=(key,id)=>({getAttribute:()=>key,__reactFiber$test:{memoizedProps:{conversationId:id}}});
test('rename resolves saved conversation behind a retained creation key, never a neighbouring chat',()=>{
 const neighbour=row('local:other','other'),saved=row('local:client-new-thread:draft','saved');
 const doc={querySelectorAll:()=>[neighbour,saved]};
 assert.equal(context.fadeConversationRenameRow(doc,'saved'),saved);
 assert.equal(context.fadeConversationRenameRow(doc,'client-new-thread%3Adraft'),saved);
 assert.equal(context.fadeConversationRenameRow(doc,'other'),neighbour);
 assert.equal(context.fadeConversationRenameRow(doc,'missing'),null);
 assert.equal(context.fadeConversationRenameRow(doc,undefined),null);
});
test('rename retains direct persisted ID support',()=>{
 const saved=row('local:saved');assert.equal(context.fadeConversationRenameRow({querySelectorAll:()=>[saved]},'saved'),saved);
});
