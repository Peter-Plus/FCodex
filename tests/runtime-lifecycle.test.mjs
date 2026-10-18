import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
for(const initialTheme of ['light','dark'])for(const covered of [false,true])test(`generated runtime starts ${covered?'under the startup cover':'normally'}, changes ${initialTheme} theme, and releases every owned resource`,()=>{
 let seq=0;const frames=new Map(),timers=new Map(),intervals=new Map(),ids=new Map();
 class Element{
  constructor(tag='div'){this.tagName=tag;this.nodeType=1;this.attributes=new Map();this.dataset={};this.children=[];this.inert=false;this.isConnected=true;this.listeners={};this.clientWidth=590;this.clientHeight=900;this.width=0;this.height=0;const props=new Map();this.style={setProperty:(k,v)=>props.set(k,v),getPropertyValue:k=>props.get(k)||'',getPropertyPriority:()=>'',removeProperty:k=>props.delete(k)};this.classList={add(){},remove(){},toggle(){}}}
  setAttribute(k,v){this.attributes.set(k,String(v))}getAttribute(k){return k==='data-theme'?this.dataset.theme??null:this.attributes.get(k)??null}hasAttribute(k){return this.attributes.has(k)}removeAttribute(k){this.attributes.delete(k)}
  toggleAttribute(k,force){const enabled=force??!this.hasAttribute(k);if(enabled)this.setAttribute(k,'');else this.removeAttribute(k);return enabled}
  append(...els){this.children.push(...els);for(const e of els)e.parent=this}remove(){this.isConnected=false;if(this.parent)this.parent.children=this.parent.children.filter(e=>e!==this)}
  prepend(...els){this.children.unshift(...els);for(const e of els)e.parent=this}
  replaceChildren(...els){this.children=[];this.append(...els)}
  removeEventListener(k){delete this.listeners[k]}
  attachShadow(){return this.shadowRoot=new Element('shadow')}
  set innerHTML(html){this.html=html;this.parsed=new Map();for(const m of html.matchAll(/id="([^"]+)"/g))ids.set(m[1],new Element())}
  querySelector(q){if(q.startsWith('#'))return ids.get(q.slice(1));if(this.html&&(q==='button'&&this.html.includes('<button')||q.startsWith('.')&&this.html.includes(q.slice(1)))){if(!this.parsed.has(q))this.parsed.set(q,new Element());return this.parsed.get(q)}return null}querySelectorAll(){return []}closest(){return null}
  addEventListener(k,fn,opts){this.listeners[k]=fn;opts?.signal?.addEventListener('abort',()=>delete this.listeners[k])}
  getContext(){return new Proxy({},{get:()=>()=>{},set:()=>true})}
 }
 const root=new Element('html');root.dataset.theme=initialTheme;root.setAttribute('data-theme',initialTheme);
 const body=new Element('body'),app=new Element();body.append(app);
 const document=new Element();Object.assign(document,{documentElement:root,body,styleSheets:[],head:new Element('head'),hidden:false,createElement:tag=>new Element(tag),createElementNS:(_,tag)=>new Element(tag),getElementById:id=>body.children.find(e=>e.id===id)||ids.get(id)});
 const reduced=new Element();reduced.matches=false;
 const window={setTimeout:(fn)=>{timers.set(++seq,fn);return seq},clearTimeout:id=>timers.delete(id),requestAnimationFrame:fn=>{frames.set(++seq,fn);return seq},cancelAnimationFrame:id=>frames.delete(id),addEventListener:Element.prototype.addEventListener,listeners:{}};
 const context=vm.createContext({window,document,AbortController,matchMedia:()=>reduced,MutationObserver:class{observe(){}disconnect(){}},ResizeObserver:class{observe(){}disconnect(){}},localStorage:{getItem:()=>null,setItem(){}},innerWidth:1400,innerHeight:900,devicePixelRatio:1,performance:{now:()=>100},setInterval:fn=>{intervals.set(++seq,fn);return seq},clearInterval:id=>intervals.delete(id),getComputedStyle:()=>({}),console});
 if(covered)window.__fadeInPageState={done:false};
 const code=fs.readFileSync(new URL('../fade.js',import.meta.url),'utf8');vm.runInContext(code,context);
 assert.equal(window.__fadeCodex.version,'2.0.0');assert.equal(window.__fadeCodex.status().phase,'live');assert.equal(window.__fadeCodex.status().adapterReady,false);
 assert.equal(body.children.length,2);assert.equal(frames.size,covered?0:1);assert.equal(intervals.size,3);
 window.__fadeCodex.setStartupCovered(false);assert.equal(frames.size,1);
 assert.equal(ids.get('fullscreenWindowControls').hidden,true);
 window.listeners.message({data:{type:'window-fullscreen-changed',isFullScreen:true}});
 assert.equal(ids.get('fullscreenWindowControls').hidden,false);
 assert.equal(ids.get('headerFullscreenToggle').getAttribute('aria-pressed'),'true');
 window.listeners.message({data:{type:'window-fullscreen-changed',isFullScreen:false}});
 assert.equal(ids.get('fullscreenWindowControls').hidden,true);
 ids.set('application-menu-trigger-file-menu',new Element('button'));
 ids.get('headerMenuToggle').listeners.click();assert.equal(root.hasAttribute('data-fade-menu-open'),true);assert.equal(ids.get('headerMenuToggle').getAttribute('aria-expanded'),'true');
 ids.get('headerMenuToggle').listeners.click();assert.equal(root.hasAttribute('data-fade-menu-open'),false);assert.equal(ids.get('headerMenuToggle').getAttribute('aria-expanded'),'false');
 ids.get('headerThemeToggle').listeners.click();assert.equal(window.__fadeCodex.status().theme,initialTheme==='dark'?'light':'dark');
 vm.runInContext(code,context);assert.equal(body.children.length,2,'Repeated injection is idempotent');
 window.__fadeCodex.destroy();assert.equal(body.children.length,1);assert.equal(frames.size,0);assert.equal(timers.size,0);assert.equal(intervals.size,0);assert.equal(window.__fadeCodex,undefined);assert.equal(root.getAttribute('data-theme'),initialTheme==='dark'?'light':'dark');assert.equal(root.hasAttribute('data-fade-codex'),false);assert.equal(app.inert,false);
 const lastTheme=root.dataset.theme;
 window.__fadeResume();assert.equal(window.__fadeCodex.status().theme,lastTheme);assert.equal(body.children.length,2);
 window.__fadeResume();assert.equal(body.children.length,2,'Repeated return does not create duplicate UI');
 window.__fadeCodex.destroy();assert.equal(body.children.length,1);assert.equal(frames.size,0);assert.equal(intervals.size,0);
});

