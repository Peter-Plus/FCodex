import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const code=fs.readFileSync(new URL('../src/conversation.js',import.meta.url),'utf8').replace('__FADE_AVATAR__',JSON.stringify('data:image/png;base64,'+fs.readFileSync(new URL('../Arts/fcodex-avatar.png',import.meta.url)).toString('base64')));
function fixture(){
 class El{
  constructor(attrs={},text=''){this.attrs=new Map(Object.entries(attrs));this.textContent=text;this.children=[];this.dataset={};this.queries=new Map();this.events={};this.isConnected=true;const styles=new Map();this.style={setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k),getPropertyValue:k=>styles.get(k)||'',getPropertyPriority:()=>''}}
  getAttribute(k){return this.attrs.get(k)??null}setAttribute(k,v){this.attrs.set(k,v)}hasAttribute(k){return this.attrs.has(k)}removeAttribute(k){this.attrs.delete(k)}
  querySelectorAll(q){const descendants=this.children.flatMap(e=>[e,...e.querySelectorAll('*')]);if(q==='*')return descendants;if(q==='[data-user-message-bubble],[data-local-conversation-user-anchor]')return descendants.filter(e=>e.hasAttribute('data-user-message-bubble')||e.hasAttribute('data-local-conversation-user-anchor'));if(q==='[data-fade-control=send],[data-fade-control=stop]')return descendants.filter(e=>['send','stop'].includes(e.getAttribute('data-fade-control')));if(q==='[data-fade-idle-send]'||q==='[data-fade-followup-send]')return descendants.filter(e=>e.hasAttribute(q.slice(1,-1)));return this.queries.get(q)||[]}querySelector(q){if(q===':scope > [data-fade-speaker]')return this.children.find(e=>e.hasAttribute('data-fade-speaker'));if(q==='[data-fade-permission-item]')return this.children.find(e=>e.hasAttribute('data-fade-permission-item'));return this.querySelectorAll(q)[0]||null}
  append(...els){for(const el of els){el.parentElement=this;this.children.push(el)}}prepend(el){el.parentElement=this;this.children.unshift(el)}replaceChildren(...els){this.children=[];this.append(...els)}
  remove(){this.isConnected=false;this.parentElement.children=this.parentElement.children.filter(e=>e!==this)}
  addEventListener(k,fn,{signal}={}){this.events[k]=fn;signal?.addEventListener('abort',()=>delete this.events[k])}
  closest(q){if(this.closestMap?.has(q))return this.closestMap.get(q);return q==='[data-codex-composer-root]'?root:null}matches(){return false}click(){this.clicks=(this.clicks||0)+1;this.events.click?.({})}dispatchEvent(e){this.events[e.type]?.(e)}
  get previousElementSibling(){const siblings=this.parentElement?.children||[];return siblings[siblings.indexOf(this)-1]||null}
  insertBefore(el,before){if(el.parentElement)el.parentElement.children=el.parentElement.children.filter(e=>e!==el);el.parentElement=this;this.children.splice(this.children.indexOf(before),0,el)}
  getBoundingClientRect(){return {left:30,top:500,width:200,height:40}}getClientRects(){return [{}]}
 }
 let cb,scheduled;const root=new El(),footer=new El(),surface=new El(),account=new El({'aria-label':'打开个人资料菜单'},'Ada'),accountButton=new El();
 const controls=[new El({'data-composer-navigation-target':'add-context','aria-expanded':'true'}),new El({'data-composer-navigation-target':'reasoning'},'GPT-6 Astra'),new El({'aria-label':'上下文用量：23%','role':'img'}),new El({'aria-label':'发送'}),new El({'aria-label':'听写'}),new El({'data-composer-navigation-target':'permissions'},'帮我批准')];
 const group=new El();footer.append(group);group.append(...controls);footer.queries.set('button,[role=img][aria-label]',controls);surface.queries.set('[class*="_ComposerLayoutFooter_"]',[footer]);root.queries.set('[data-composer-navigation-target=permissions]',[controls[5]]);
 const user=new El({'data-local-conversation-user-anchor':'true'}),assistant=new El(),overlay=new El();
 const doc=new El();doc.body=new El();doc.documentElement=new El();doc.createElement=()=>new El();doc.getElementById=()=>null;
 doc.queries.set('.app-shell-left-panel button',[account]);doc.queries.set('[data-codex-composer-root] [data-composer-surface-variant]',[surface]);doc.queries.set('[data-codex-composer-root] [data-composer-navigation-target=permissions]',[controls[5]]);doc.queries.set('[data-content-search-unit-key]',[user,assistant]);doc.queries.set('[data-composer-overlay-floating-ui]',[overlay]);doc.queries.set('[data-composer-navigation-target=permissions]',[controls[5]]);
 const context=vm.createContext({AbortController,KeyboardEvent:class{},PointerEvent:class{constructor(type,props){this.type=type;Object.assign(this,props)}},window:{addEventListener(){},requestAnimationFrame:fn=>(scheduled=fn,1),cancelAnimationFrame:()=>{scheduled=null},setTimeout:fn=>fn()},MutationObserver:class{constructor(fn){cb=fn}observe(){}disconnect(){}}});vm.runInContext(code,context);
 const dispose=context.installConversationSurface(doc,accountButton);
 return {El,footer,flush(){scheduled()},controls,group,surface,doc,user,assistant,account,accountButton,overlay,dispose,refresh(){cb();scheduled()},openPlus(){doc.events.click({target:{closest:()=>controls[0]}});scheduled()}};
}
test('composer retains native controls, moves model/usage, and distinguishes send from stop',()=>{
 const f=fixture();assert.deepEqual(f.controls.map(e=>e.getAttribute('data-fade-control')),['add','model','usage','send','voice','permissions']);
 assert(f.group.hasAttribute('data-fade-flatten'));f.controls[3].setAttribute('aria-label','停止');f.refresh();assert.equal(f.controls[3].getAttribute('data-fade-control'),'stop');
 f.dispose();assert.equal(f.controls[5].getAttribute('tabindex'),null);assert(!f.group.hasAttribute('data-fade-flatten'));
});
test('speaker identities are idempotent and account action reaches the original control',()=>{
 const f=fixture();f.refresh();assert.equal(f.user.children.length,1);assert.equal(f.user.children[0].getAttribute('data-fade-speaker'),'user');assert.equal(f.assistant.children[0].getAttribute('data-fade-speaker'),'assistant');f.account.click();assert.equal(f.account.clicks,1);f.dispose();assert.equal(f.user.children.length,0);assert.equal(f.assistant.children.length,0);
});
test('plus overlay no longer includes the permission selector',()=>{
 const f=fixture();f.openPlus();assert.equal(f.overlay.children.length,0);assert.equal(f.controls[5].clicks,undefined);f.dispose();
});

test('empty composer has one disabled pale send placeholder, removed when native send returns',()=>{
 const f=fixture(),send=f.controls[3];send.remove();f.footer.queries.set('button,[role=img][aria-label]',f.controls.filter(e=>e!==send));f.refresh();
 const idle=f.footer.querySelector('[data-fade-idle-send]');assert(idle);assert.equal(idle.disabled,true);assert.equal(idle.hidden,false);
 f.refresh();assert.equal(f.footer.querySelectorAll('[data-fade-idle-send]').length,1);
 send.isConnected=true;f.group.append(send);f.footer.queries.set('button,[role=img][aria-label]',f.controls);f.refresh();assert.equal(idle.hidden,true);f.dispose();
});
test('account slot exposes the original trigger instead of synthesizing input',()=>{
 const f=fixture();f.doc.documentElement.setAttribute('data-fade-account-access','');f.refresh();
 assert(f.account.hasAttribute('data-fade-account-source'));assert.equal(f.accountButton.getAttribute('aria-hidden'),'true');assert.equal(f.accountButton.getAttribute('tabindex'),'-1');
 assert.equal(f.accountButton.events.click,undefined);assert.equal(f.account.clicks,undefined);
 f.doc.documentElement.removeAttribute('data-fade-account-access');f.refresh();assert.equal(f.accountButton.getAttribute('aria-hidden'),null);f.dispose();
});
test('Codex identity moves before elapsed-work summary and stays unique',()=>{
 const f=fixture(),turn=new f.El({'data-turn-key':'one'}),summary=new f.El({},'用时 6m 40s');turn.append(summary,f.assistant);f.refresh();
 assert.equal(turn.children[0].getAttribute('data-fade-speaker'),'assistant');assert.equal(turn.children[1],summary);assert.equal(f.assistant.children.length,0);
 f.refresh();assert.equal(turn.children.length,3);f.dispose();assert.equal(turn.children.length,2);
});
test('streaming fragments, tool content and final reply share one header above elapsed work',()=>{
 const f=fixture(),turn=new f.El({'data-turn-key':'turn-1'}),summary=new f.El({},'用时 1 分钟'),work=new f.El(),a=new f.El(),b=new f.El();
 work.append(a,b);turn.append(f.user,summary,work,f.assistant);
 const units=[f.user,a,b,f.assistant];f.doc.queries.set('[data-content-search-unit-key]',units);
 const headers=()=>turn.querySelectorAll('*').filter(e=>e.getAttribute('data-fade-speaker')==='assistant');
 f.refresh();assert.equal(headers().length,1);const identity=headers()[0];
 assert.equal(turn.children[0],f.user);assert.equal(turn.children[1],identity);assert.equal(turn.children[2],summary);
 for(let i=0;i<8;i++){const chunk=new f.El();work.append(chunk);units.splice(units.length-1,0,chunk);f.refresh();assert.equal(headers().length,1);assert.equal(headers()[0],identity)}
 // Native collapse removes work fragments and replaces the final response wrapper.
 const final=new f.El();turn.append(final);f.assistant.remove();work.remove();f.doc.queries.set('[data-content-search-unit-key]',[f.user,final]);
 f.refresh();assert.equal(headers().length,1);assert.equal(headers()[0],identity);assert.equal(turn.children[1],identity);
 f.dispose();assert.equal(headers().length,0);
});
test('two native turns keep separate avatars and remounting does not leave an orphan',()=>{
 const f=fixture(),one=new f.El({'data-turn-key':'1'}),two=new f.El({'data-turn-key':'2'}),second=new f.El();
 one.append(f.assistant);two.append(second);f.doc.queries.set('[data-content-search-unit-key]',[f.assistant,second]);f.refresh();
 assert.equal(one.children[0].getAttribute('data-fade-speaker'),'assistant');assert.equal(two.children[0].getAttribute('data-fade-speaker'),'assistant');
 f.doc.queries.set('[data-content-search-unit-key]',[second]);f.refresh();assert.equal(one.children.length,1);assert.equal(two.children.length,2);f.dispose();
});

test('voice chat and dictation buttons both leave the footer layout',()=>{
 const f=fixture();for(const label of ['开始新的语音聊天','Start a new voice chat','听写']){
  f.controls[4].setAttribute('aria-label',label);f.refresh();assert.equal(f.controls[4].getAttribute('data-fade-control'),'voice');
 }assert(f.group.hasAttribute('data-fade-flatten'));f.dispose();
});
test('account popup is anchored above its original trigger and restores owned styles',()=>{
 const f=fixture(),menu=new f.El(),wrapper=new f.El();
 f.doc.documentElement.clientWidth=1000;menu.closestMap=new Map([['[data-radix-popper-content-wrapper]',wrapper]]);
 f.doc.getElementById=id=>id==='account-menu'?menu:null;
 f.account.setAttribute('aria-controls','account-menu');f.account.setAttribute('aria-expanded','true');f.refresh();
 assert(menu.hasAttribute('data-fade-account-menu'));assert(wrapper.hasAttribute('data-fade-account-popup'));
 assert.equal(wrapper.style.getPropertyValue('--fc-menu-anchor-top'),'500px');assert.equal(wrapper.style.getPropertyValue('--fc-menu-left'),'12px');
 f.dispose();assert(!menu.hasAttribute('data-fade-account-menu'));assert.equal(wrapper.style.getPropertyValue('--fc-menu-left'),'');
});


test('native Steer and Queue buttons use normal send styling and suppress the disabled placeholder',()=>{
 const f=fixture(),send=f.controls[3];send.remove();f.footer.queries.set('button,[role=img][aria-label]',f.controls.filter(e=>e!==send));f.refresh();
 const idle=f.footer.querySelector('[data-fade-idle-send]');assert.equal(idle.hidden,false);
 send.isConnected=true;f.group.append(send);f.footer.queries.set('button,[role=img][aria-label]',f.controls);let clicks=0;send.onclick=()=>clicks++;
 for(const label of ['引导','排队','Steer','Queue']){send.setAttribute('aria-label',label);f.refresh();assert.equal(send.getAttribute('data-fade-control'),'send');assert.equal(idle.hidden,true);assert(!send.disabled);send.onclick()}
 assert.equal(clicks,4);send.setAttribute('aria-label','停止');f.refresh();assert.equal(send.getAttribute('data-fade-control'),'stop');assert.equal(idle.hidden,true);f.dispose();
});
