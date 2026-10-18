import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

test('history controls identify app navigation rather than browser navigation',()=>{
 const ctx=vm.createContext({});
 vm.runInContext(fs.readFileSync(new URL('../src/rail-history.js',import.meta.url),'utf8'),ctx);
 const button=id=>({'__reactFiber$test':{return:{memoizedProps:{tooltipContent:{props:{id}}}}}});
 assert.equal(ctx.fadeHistoryDirection(button('codex.command.navigateBack')),'back');
 assert.equal(ctx.fadeHistoryDirection(button('codex.command.navigateForward')),'forward');
 assert.equal(ctx.fadeHistoryDirection(button('browser.back')),null);
 assert.equal(ctx.fadeHistoryDirection({}),null);
});
