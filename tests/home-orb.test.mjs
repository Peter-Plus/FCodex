import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

test('new chat targets home immediately, corrects to the mounted anchor and reuses its measured position',()=>{
 const attrs=new Set(),styles=new Map(),timers=new Map();let seq=0,anchor=null,impactCancelled=false;
 const host={contains:()=>false,setAttribute:k=>attrs.add(k),removeAttribute:k=>attrs.delete(k),toggleAttribute:(k,v)=>v?attrs.add(k):attrs.delete(k),style:{setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)}};
 let orbRect={left:-47,top:403,width:94,height:94};
 const button={getAnimations:()=>[{id:'core-impact',cancel:()=>{impactCancelled=true}}],getBoundingClientRect:()=>orbRect};
 const context=vm.createContext({host,$:()=>button,document:{body:{},querySelector:()=>({getBoundingClientRect:()=>anchor?{left:0,top:0,width:1400,height:900}:{left:60,top:70,width:1100,height:700}}),querySelectorAll:()=>anchor?[anchor]:[]},window:{},innerWidth:1400,innerHeight:900,on:()=>{},getComputedStyle:()=>({transform:'matrix(1, 0, 0, 1, 230, 350)',display:'block'}),setTimeout:fn=>{timers.set(++seq,fn);return seq},clearTimeout:id=>timers.delete(id),MutationObserver:class{observe(){}disconnect(){}}});
 vm.runInContext(fs.readFileSync(new URL('../src/home-orb.js',import.meta.url),'utf8'),context);
 const controller=context.installHomeOrb();controller.beginArrival();controller.refresh();
 assert.equal(controller.startupTarget(),null,'No handoff before the welcome anchor mounts');
 assert(attrs.has('data-orb-arriving-home'),'Home movement remains active before the page mounts');
 assert.equal(styles.get('--fade-home-x'),'700px');assert.equal(styles.get('--fade-home-y'),'351px');assert(!styles.has('--orb-held-transform'));assert(impactCancelled);
 anchor={setAttribute(){},removeAttribute(){},getBoundingClientRect:()=>({left:620,top:220,width:60,height:60})};
 controller.refresh();assert(attrs.has('data-home-orb'));assert(!attrs.has('data-orb-arriving-home'));
 assert.equal(styles.get('--fade-home-x'),'650px');assert.equal(styles.get('--fade-home-y'),'250px');assert.equal(timers.size,0);
 assert.equal(controller.startupTarget(),null,'Left-edge orb is not the home destination');
 orbRect={left:300,top:203,width:94,height:94};
 assert.equal(controller.startupTarget(),null,'Do not capture an interpolated position');
 orbRect={left:603,top:203,width:94,height:94};
 assert.equal(controller.startupTarget().x,650/1400);
 assert.equal(controller.startupTarget().y,250/900);
 anchor=null;controller.refresh();controller.beginArrival();assert.equal(styles.get('--fade-home-x'),'650px');assert.equal(styles.get('--fade-home-y'),'250px');controller.cancelArrival();assert(!attrs.has('data-orb-arriving-home'));assert.equal(timers.size,0);
 controller.beginArrival();controller();assert.equal(timers.size,0);assert(!styles.has('--orb-held-transform'));
});

test('new chat presents movement before native navigation and suppresses duplicate creation',()=>{
 const source=fs.readFileSync(new URL('../src/runtime.js',import.meta.url),'utf8');
 const code=source.slice(source.indexOf(' let creatingChat=false;'),source.indexOf(' __CARD_SURFACE__'));
 const calls=[],frames=[],tasks=[];
 const context=vm.createContext({singleTimer:null,clearTimeout(){},disposeHomeOrb:{beginArrival:()=>calls.push('move'),refresh:()=>calls.push('refresh'),cancelArrival:()=>calls.push('cancel')},performance:{now:()=>0},startSpin(){},requestAnimationFrame:fn=>frames.push(fn),setTimeout:fn=>tasks.push(fn),closeNav:restore=>calls.push(['close',restore]),adapter:{newChat:()=>{calls.push('native');return true}},actionFailed:()=>calls.push('failed')});
 vm.runInContext(code,context);context.createChat();context.createChat();assert.deepEqual(calls,['move']);
 frames.shift()();assert.deepEqual(calls,['move']);frames.shift()();assert.deepEqual(calls,['move']);
 tasks.shift()();assert.deepEqual(calls,['move',['close',false],'native','refresh']);
 context.adapter.newChat=()=>false;context.createChat();frames.shift()();frames.shift()();tasks.shift()();assert.deepEqual(calls.slice(-2),['cancel','failed']);
});
