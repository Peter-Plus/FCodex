import {createTestArea,retireTestArea} from './work-area.mjs';
// Uses captured native headers, including the actual browser toolbar and the
// nested file-header structure. No connection to the active app is made here.
// node tests/file-panel-layout.browser.mjs <fixture-directory>
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {command} from '../startup/session.mjs';
const fixtures=path.resolve(process.argv[2]||'tests/fixtures/file-panel');
const record=process.argv.includes('--record-fixtures');
const base=await createTestArea('file-panel-layout');
const profile=await fs.mkdtemp(path.join(base,'browser-'));
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));let target;
try{
 let port;for(let i=0;i<80;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await wait(100)}}assert.ok(port);
 target=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');
 const evaluate=async expression=>{const r=await command(target,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 await command(target,'Emulation.setDeviceMetricsOverride',{width:1100,height:700,deviceScaleFactor:1,mobile:false});
 const source=await fs.readFile('src/file-panel.js','utf8'),css=await fs.readFile('theme.css','utf8')+'\n'+await fs.readFile('src/file-panel.css','utf8'),results=[];
 for(const mode of ['review','file','code','image','browser']){
  const fixture=JSON.parse(await fs.readFile(path.join(fixtures,mode+'-fixture.json'),'utf8'));
  for(const container of ['card','column'])for(const polarity of ['light','dark'])for(const width of [320,470,760]){
   await command(target,'Page.navigate',{url:'about:blank'});
   await evaluate(`(()=>{document.documentElement.setAttribute('data-fade-codex','');document.documentElement.setAttribute('data-fade-polarity',${JSON.stringify(polarity)});document.documentElement.setAttribute('data-theme',${JSON.stringify(polarity)});document.documentElement.toggleAttribute('data-fade-window-mode',${container==='column'});document.body.innerHTML='<button data-app-shell-workspace-layout-toggle="main" aria-pressed="true" style="display:none"></button><aside ${container==='column'?'data-fade-unified-preview':'data-app-shell-focus-area="right-panel"'}><div data-app-shell-pane-frame><div class="native-container" data-app-shell-tab-panel-controller="right"></div></div></aside>';document.querySelector('[data-tab-id]')?.removeAttribute('data-tab-id');const tab=document.querySelector('[data-app-shell-tab-panel-controller]');tab.setAttribute('data-tab-id',${JSON.stringify(fixture.tabId)});tab.innerHTML=${JSON.stringify(fixture.header)};const s=document.createElement('style');s.textContent=${JSON.stringify(fixture.css+'\n'+css)};document.head.append(s);const sizing=document.createElement('style');sizing.textContent='html{font-size:16px!important}body{margin:20px!important}html[data-fade-codex] aside{position:relative!important;inset:auto!important;width:${width}px!important;height:400px!important;margin:0!important}.native-container{container:review-header / inline-size}';document.head.append(sizing)})()`);
   if(record&&container==='card'&&polarity==='light'&&width===320){
    const nativeCss=await evaluate(`(()=>{const nodes=[document.documentElement,document.body,...document.querySelectorAll('aside,aside *')];function keep(r){if(r.selectorText){if(r.selectorText.includes('data-fade-')||r.selectorText.includes('.fade-')||r.selectorText.includes('#fade-'))return '';const selector=r.selectorText.replace(/:(hover|focus-visible|focus-within|focus|active)\\b/g,'');try{return nodes.some(e=>e.matches(selector))?r.cssText:''}catch{return ''}}if(r.cssRules){const child=[...r.cssRules].map(keep).filter(Boolean).join('\\n');return child?r.cssText.slice(0,r.cssText.indexOf('{')+1)+child+'}':''}return r.cssText.startsWith('@property')?r.cssText:''}return [...document.styleSheets[0].cssRules].map(keep).filter(Boolean).join('\\n')})()`);
    await fs.mkdir('tests/fixtures/file-panel',{recursive:true});
    await fs.writeFile(`tests/fixtures/file-panel/${mode}-fixture.json`,JSON.stringify({nativeAssets:['app-shared-bbfeca5e5737.js','app-shared-dc7535e633d7.css'],header:fixture.header,tabId:mode==='browser'?'fixture-browser':fixture.tabId,css:nativeCss}));
   }
   await evaluate(source+'\nwindow.disposePanel=installFilePanel(document,()=>{});');await wait(160);
   const report=await evaluate(`(()=>{const panel=document.querySelector('aside'),h=panel.querySelector('[data-fade-viewer-header]'),close=panel.querySelector('.fade-panel-chrome button');if(!h)return {missing:true};const r=h.getBoundingClientRect(),p=panel.getBoundingClientRect();const buttons=[...h.querySelectorAll('button,input')].filter(e=>e.getBoundingClientRect().width>0&&!e.closest('nav'));const bounds=buttons.map(e=>{const r=e.getBoundingClientRect();const row=e.closest('[data-fade-header-trailing]');const scrollable=row&&getComputedStyle(row).overflowX==='auto';return {scrollable,label:e.getAttribute('aria-label')||e.textContent.trim(),x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height}});return {width:panel.clientWidth,height:r.height,layout:h.getAttribute('data-fade-header-layout'),kind:h.getAttribute('data-fade-viewer-header'),closeTop:close?close.getBoundingClientRect().top-r.top:null,chromeCount:panel.querySelectorAll('.fade-panel-chrome').length,background:getComputedStyle(h).backgroundColor,panelBackground:getComputedStyle(panel).backgroundColor,borderRadius:getComputedStyle(panel).borderRadius,overflow:bounds.filter(b=>(!b.scrollable&&(b.x<p.x-1||b.right>p.right+1))||b.bottom>r.bottom+1),overlap:bounds.flatMap((a,i)=>bounds.slice(i+1).filter(b=>Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1).map(b=>[a.label,b.label])),trailing:[...h.querySelectorAll("[data-fade-header-trailing],[data-fade-header-trailing]>div")].map(e=>({width:e.getBoundingClientRect().width,scroll:e.scrollWidth,cls:e.className,flex:getComputedStyle(e).flex})),fileActions:h.querySelectorAll('.fade-file-heading button').length,buttons:bounds}})()`);
   if(mode!=='browser'){
    const scrolling=await evaluate(`(()=>{const h=document.querySelector('[data-fade-viewer-header]'),row=h.querySelector('[data-fade-header-trailing]');const overflowing=row.scrollWidth>row.clientWidth;const before=row.scrollLeft;row.dispatchEvent(new WheelEvent('wheel',{deltaY:120,bubbles:true,cancelable:true}));const moved=row.scrollLeft>before;row.scrollLeft=row.scrollWidth;const last=row.querySelector('button:last-child')?.getBoundingClientRect();row.scrollLeft=0;return {overflowing,moved,height:row.clientHeight,layout:h.dataset.fadeHeaderLayout,wrap:getComputedStyle(row).flexWrap}})()`);
    if(scrolling.layout==='stacked'){
     assert.equal(scrolling.wrap,'nowrap','action row never wraps');
     assert.ok(scrolling.height<=44,'single action row plus scrollbar');
     if(scrolling.overflowing)assert.ok(scrolling.moved,'wheel reaches overflow actions');
    }
   }
   results.push({container,mode,polarity,width,...report});
   await fs.writeFile(path.join(base,'layout-results.json'),JSON.stringify(results,null,2));
   const shot=await command(target,'Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(base,`${container}-${mode}-${polarity}-${width}.png`),Buffer.from(shot.data,'base64'));
   assert.ok(!report.missing,`${mode} header recognized`);assert.deepEqual(report.overflow,[],`${mode} ${width} clipped controls`);assert.deepEqual(report.overlap,[],`${mode} ${width} overlapping controls`);assert.equal(report.chromeCount,container==='column'?0:1,'column uses its existing tab-row close');if(container==='card')assert.ok(report.closeTop<=12,'close shares first row');if(container==='column'){assert.equal(report.borderRadius,'0px');assert.equal(report.panelBackground,polarity==='light'?'rgb(252, 252, 253)':'rgb(36, 36, 36)');}assert.equal(report.background,polarity==='light'?'rgb(247, 248, 250)':'rgb(43, 43, 43)','toolbar follows FCodex palette');assert.ok(report.height<=94,`${mode} ${width} excessive header height ${report.height}`);
   assert.equal(report.fileActions,['file','code','image'].includes(mode)?2:0,'file actions belong only to a file');
   if(width===320){
    await evaluate(`document.querySelector('aside').style.setProperty('width','760px','important')`);await wait(100);
    assert.equal(await evaluate(`document.querySelector('[data-fade-viewer-header]').getAttribute('data-fade-header-layout')`),'inline',`${mode} expands back to one row`);
    await evaluate(`document.querySelector('aside').style.setProperty('width','320px','important')`);await wait(100);
    assert.equal(await evaluate(`document.querySelector('[data-fade-viewer-header]').getAttribute('data-fade-header-layout')`),report.layout,`${mode} contracts consistently`);
   }
   if(container==='column'&&width===320){
    await evaluate(`window.keptControl=document.querySelector('[data-fade-viewer-header] button');const source=document.createElement('aside');source.setAttribute('data-app-shell-focus-area','right-panel');source.hidden=true;source.id='hidden-source';document.body.append(source);document.querySelector('aside').hidden=true`);await wait(80);
    assert.equal(await evaluate(`document.querySelector('[data-fade-viewer-header]')===null`),true,'hidden preview releases header decorations');
    assert.equal(await evaluate(`document.getElementById('hidden-source').hasAttribute('data-fade-file-panel')`),false,'hidden native source is not restyled as a visible card');
    await evaluate(`document.querySelector('aside').hidden=false`);await wait(100);
    assert.equal(await evaluate(`document.querySelector('[data-fade-viewer-header] button')===keptControl`),true,'showing preview preserves native control identity');
    assert.equal(await evaluate(`document.querySelectorAll('.fade-panel-chrome').length`),0,'showing preview never adds another close button');
    assert.equal(await evaluate(`document.querySelector('[data-fade-viewer-header]').querySelectorAll('.fade-file-heading button').length`),report.fileActions,'file actions are not duplicated on tab visibility changes');
   }
   await evaluate('disposePanel()');
  }
 }
 console.log(`Passed ${results.length} native-header layouts (5 modes × 2 containers × 3 widths × 2 themes).`);
}finally{
 if(target)try{await command(target,'Browser.close')}catch{}
 if(browser.exitCode===null)await Promise.race([new Promise(r=>browser.once('exit',r)),wait(3000)]);
 if(browser.exitCode===null){browser.kill();await new Promise(r=>browser.once('exit',r))}
 const resolved=path.resolve(profile);assert.ok(resolved.startsWith(base+path.sep));const stat=await fs.lstat(resolved);assert.ok(!stat.isSymbolicLink());await fs.rm(resolved,{recursive:true,force:true});
 await retireTestArea(base,browser);
}

