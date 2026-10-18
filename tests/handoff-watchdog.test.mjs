import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {installHandoffWatchdog} from '../startup/handoff-watchdog.mjs';
test('click and Enter never bypass real readiness; Escape is an explicit exit',()=>{let finished=0;const events={};const watch=installHandoffWatchdog({addEventListener:(n,f)=>events[n]=f,removeEventListener:n=>delete events[n],setTimeout(){throw Error('Automatic fallback forbidden')}},()=>finished++);watch.arm();events.keydown({key:'Enter'});assert.equal(finished,0);events.keydown({key:'Escape'});watch.complete();assert.equal(finished,1);watch.dispose();assert.deepEqual(events,{})});
test('handoff waits indefinitely without an actual home target, then completes normal readiness',async()=>{
 const source=fs.readFileSync(new URL('../startup/in-page.mjs',import.meta.url),'utf8'),start=source.indexOf('  let ready=false;'),end=source.indexOf('\n }catch(error)',start);let target=null,probes=0;
 const page={window:{__fadeInPageState:{done:false},__fadeCodex:{prepareStartupHome(){probes++;return target}},__fadeStartupHost:{ready:false}},document:{documentElement:{dataset:{theme:'light'}},getElementById:()=>({shadowRoot:{querySelector:()=>({style:{}})}})}};
 const context=vm.createContext({evaluate:async code=>vm.runInNewContext(code,page),executionContextId:1,console:{log(){}},ws:{close(){}}});
 const controller=vm.runInContext('(function(){'+source.slice(start,end)+'})()',context);
 for(let i=0;i<30;i++)await controller.tick();assert.equal(controller.ready,false);
 target={x:.5,y:.4,size:94,width:1000,height:800};await controller.tick();assert.equal(controller.ready,true);await controller.tick();assert.equal(probes,31);page.window.__fadeInPageState.done=true;assert.equal(await controller.tick(),true);
});
