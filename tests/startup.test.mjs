import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {createSession,productionHTML,allowedTarget} from '../startup/session.mjs';

test('click starts departure immediately, holds peak speed, then completes the remaining animation',async()=>{
 const source=await fs.readFile(new URL('../design-previews/startup.html',import.meta.url),'utf8');
 const logic=source.slice(source.indexOf(' let departureClock=null;'),source.indexOf(' function finish()'));
 const context=vm.createContext({performance:{now:()=>0}});
 vm.runInContext(`let phase='waiting',started=0,theme='dark',spinDuration,activeFadeAt,finalPulseDone,finalPulseStart;
 const params={duration:2.3,fadeAt:83};
 const startupHost={ready:false,theme:'dark',requestEnter(){this.enterRequested=true}};
 function ui(){} function state(next){phase=next;started=performance.now()}
 ${logic}
 enter();`,context);
 assert.equal(vm.runInContext('phase',context),'leaving');
 assert.equal(vm.runInContext('startupHost.enterRequested',context),true);
 const step=(now,ready)=>vm.runInContext(`advanceDeparture(departureClock,${now},2300,${ready})`,context);
 assert.equal(step(100,false),100);
 assert.equal(step(805,false),805);
 assert.equal(step(15000,false),805);
 assert.equal(step(15016,true),821);
 assert.equal(step(16495,true),2300);
 // An already-ready destination retains the original duration without a hold.
 vm.runInContext('departureClock={time:0,elapsed:0}',context);
 assert.equal(step(1000,true),1000);
 assert.equal(step(2300,true),2300);
});

test('early clicks acknowledge immediately and a failed handoff image retries',async()=>{
 const elements=new Map(),timers=[];let mounted;
 const element=()=>({setAttribute(){},removeAttribute(){},addEventListener(){},remove(){elements.delete(this.id)}});
 elements.set('core',element());elements.set('filmVideo',element());
 const document={createElement:element,getElementById:id=>elements.get(id),body:{prepend(){},append(el){elements.set(el.id,el)}},addEventListener(name,fn){if(name==='DOMContentLoaded')mounted=fn}};
 let img;
 document.body.prepend=el=>{img=el};
 const context={window:{__fadeStartupSettings:{base:'/session'},addEventListener(){}},document,setTimeout:fn=>timers.push(fn),fetch:async()=>({json:async()=>({ready:true,target:{theme:'light'}})})};
 vm.runInNewContext(await fs.readFile(new URL('../startup/bridge.js',import.meta.url),'utf8'),context);
 const host=context.window.__fadeStartupHost;
 host.requestEnter();host.requestEnter();
 assert.equal(host.enterRequested,true);assert.equal(host.ready,false);
 assert.match(elements.get('startupError').textContent,/自动进入/);
 mounted();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(img.src,'/session/picture');
 img.onerror();img.src='';await timers.shift()();
 assert.equal(img.src,'/session/picture');assert.equal(host.ready,false);
 img.onload();assert.equal(host.ready,true);assert.equal(elements.has('startupError'),false);
});

test('completion waits for the final paint and hold, and is sent only once',async()=>{
 const frames=[],timers=[],requests=[];
 const context={window:{__fadeStartupSettings:{base:'/session'}},document:{addEventListener(){}},requestAnimationFrame:fn=>frames.push(fn),setTimeout:(fn,ms)=>timers.push({fn,ms}),fetch:url=>{requests.push(url);return Promise.resolve()}};
 vm.runInNewContext(await fs.readFile(new URL('../startup/bridge.js',import.meta.url),'utf8'),context);
 context.window.__fadeStartupHost.complete();context.window.__fadeStartupHost.complete();
 assert.equal(requests.length,0);assert.equal(frames.length,1);
 frames.shift()();assert.equal(requests.length,0);
 frames.shift()();assert.equal(requests.length,0);assert.equal(timers[0].ms,200);
 timers.shift().fn();assert.deepEqual(requests,['/session/complete']);
});

test('production uses the approved preset without inheriting preview controls or mock workspace',async()=>{
 const preset=JSON.parse(await fs.readFile(new URL('../startup/preset.json',import.meta.url)));
 assert.deepEqual(preset,{x:47,y:72,size:680,createAt:1.8,duration:2.3,fadeAt:83,spin:272,glow:195,titleGlitch:150,titleInterval:3,titleDuration:.6,pageGlitch:100,pageInterval:.4,finalGlitch:85,loopFrom:3.9,loopTo:5.1,loop:.7});
 const source=await fs.readFile(new URL('../design-previews/startup.html',import.meta.url),'utf8');
 const bridge=await fs.readFile(new URL('../startup/bridge.js',import.meta.url),'utf8');
 const html=productionHTML(source,{token:'abc123',theme:'dark',preset,bridge});
 assert.match(html,/src="\/abc123\/video"/);
 assert.match(html,/\.tuning,\.tools,\.bottom,\.workspace,\.caption\{display:none!important\}/);
 assert.match(html,/if\(startupHost\)Object.assign\(params,startupHost.preset\)/);
 for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
});

test('only the main official renderer can be used for handoff',()=>{
 const target={type:'page',url:'app://-/index.html',webSocketDebuggerUrl:'ws://127.0.0.1:19222/devtools/page/1'};
 assert.equal(allowedTarget(target),true);
 for(const url of ['https://example.com/index.html','app://-/index.html?prewarm','app://-/index.html?avatar-overlay','app://-/index.html?detached-window'])assert.equal(allowedTarget({...target,url}),false);
 assert.equal(allowedTarget({...target,type:'worker'}),false);
});

test('private loopback session supports video seeking and refuses premature or cross-origin completion',async t=>{
 const session=await createSession({debugPort:1});
 t.after(()=>{session.server.closeAllConnections();session.server.close()});
 const base=session.details.control,origin=new URL(base).origin;
 assert.equal((await fetch(origin+'/state')).status,404);
 assert.equal((await fetch(base+'/complete',{method:'POST'})).status,409);
 assert.equal((await fetch(base+'/shown',{method:'POST',headers:{Origin:'https://example.com'}})).status,403);
 assert.equal((await fetch(base+'/shown',{method:'POST'})).status,200);
 const state=await(await fetch(base+'/state')).json();assert.equal(state.shown,true);assert.equal(state.ready,false);
 const response=await fetch(base+'/video',{headers:{Range:'bytes=0-31'}});
 assert.equal(response.status,206);assert.match(response.headers.get('content-range'),/^bytes 0-31\//);
 const original=await fs.readFile(new URL('../Arts/MilkDragon1.mp4',import.meta.url));
 assert.deepEqual(Buffer.from(await response.arrayBuffer()),original.subarray(0,32));
 assert.equal((await fetch(base+'/video',{headers:{Range:'bytes=999999999-'}})).status,416);
 const page=await(await fetch(session.details.url)).text();assert.ok(page.includes('Fade Startup '));
});
