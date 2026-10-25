import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareRuntime} from '../startup/prepare-runtime.mjs';

test('compatible clients are checked before building, without fallback',async()=>{
 const calls=[];
 assert.equal(await prepareRuntime('new-client',{run:args=>{calls.push(args);return 0},verify:()=>assert.fail('unexpected fallback')}),'built');
 assert.deepEqual(calls,[['new-client','--verify-only'],['new-client']]);
});
test('failed compatibility checks recover only a verified previous copy without writes',async()=>{
 const calls=[],logs=[];
 assert.equal(await prepareRuntime('new-client',{run:args=>{calls.push(args);return 1},verify:async root=>{assert.equal(root,'.fade-runtime-isolated');return {source:'old-client',files:42}},log:line=>logs.push(line)}),'fallback');
 assert.deepEqual(calls,[['new-client','--verify-only']]);
 assert.ok(logs.some(line=>line.includes('previous Codex version')));
});
test('corrupt or missing recovery copies still fail',async()=>{
 await assert.rejects(prepareRuntime('new-client',{run:()=>1,verify:async()=>{throw Error('integrity mismatch')},log:()=>{}}),/recovery is unavailable: integrity mismatch/);
});
test('diagnostic and verify-only calls never silently recover',async()=>{
 for(const mode of [{diagnostic:true},{verifyOnly:true}])await assert.rejects(prepareRuntime('new-client',{...mode,run:()=>1,verify:()=>assert.fail('unexpected fallback')}),/runtime checks failed/);
});
test('failure after writes begin cannot fall back to potentially mixed files',async()=>{
 let calls=0;
 await assert.rejects(prepareRuntime('new-client',{run:()=>calls++===0?0:1,verify:()=>assert.fail('unexpected fallback')}),/files may have changed/);
 assert.equal(calls,2);
});
