import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {createTestArea,retireTestArea} from './work-area.mjs';
import {command} from '../startup/session.mjs';
const area=await createTestArea('preview-selection'),profile=path.join(area,'browser');
const child=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));let target;
try{
 let port;for(let i=0;i<80;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await wait(100)}}assert.ok(port);
 target=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');
 const evaluate=async expression=>(await command(target,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;

 const base=await fs.readFile(new URL('../src/base-theme.css',import.meta.url),'utf8');
 const css=await fs.readFile(new URL('../src/file-panel.css',import.meta.url),'utf8');
 await evaluate(`document.documentElement.setAttribute('data-fade-codex','');document.head.innerHTML='';const style=document.createElement('style');style.textContent=${JSON.stringify(base+'\n'+css)};document.head.append(style);document.body.innerHTML='<diffs-container></diffs-container><div class="cm-editor"><div class="cm-content"><span>selected code</span></div></div>';const shadow=document.querySelector('diffs-container').attachShadow({mode:'open'});shadow.innerHTML='<style>::selection{background-color:transparent}</style><pre><span>selected diff code</span></pre>';`);
 for(const [mode,fg,bg] of [['dark','rgb(238, 238, 238)','rgb(36, 36, 36)'],['light','rgb(32, 32, 32)','rgb(252, 252, 253)']]){
  const result=await evaluate(`(()=>{const root=document.documentElement;root.setAttribute('data-fade-polarity',${JSON.stringify(mode)});root.style.setProperty('--fc-fg',${JSON.stringify(fg)});root.style.setProperty('--fc-bg',${JSON.stringify(bg)});const span=document.querySelector('diffs-container').shadowRoot.querySelector('span');const range=document.createRange();range.selectNodeContents(span);getSelection().removeAllRanges();getSelection().addRange(range);return {diff:getComputedStyle(span,'::selection').color,background:getComputedStyle(span,'::selection').backgroundColor,editor:getComputedStyle(document.querySelector('.cm-content span'),'::selection').color}})()`);
  assert.equal(result.diff,fg,mode+' shadow selection must not inherit inverted text');
  assert.equal(result.editor,fg,mode+' CodeMirror selection must not invert text');
  assert.equal(result.background,'rgba(0, 0, 0, 0)','native selection paint stays transparent');
 }
 console.log('PASS: light/dark shadow diff and CodeMirror selection foreground, native selection paint preserved.');
}finally{if(target)await command(target,'Browser.close').catch(()=>{});await retireTestArea(area,child)}
