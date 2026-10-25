import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

test('runtime resume retains live CSS updates across repeated destroy/resume cycles',()=>{
 const source=fs.readFileSync(new URL('../src/runtime.js',import.meta.url),'utf8');
 const boot=source.slice(0,source.indexOf(' window.__fadeClassicChrome'));
 const save=source.match(/  styleText=document\.getElementById\('fade-codex-style'\).*;/)[0];
 let sheet={id:'fade-codex-style',textContent:'old styles'};
 const document={getElementById:()=>sheet,createElement:()=>({}),head:{append:s=>sheet=s}};
 const window={};
 const lifecycle=boot+`window.__fadeCodex={destroy(){${save}sheetRemove();delete window.__fadeCodex}};})();`;
 const context=vm.createContext({document,window,sheetRemove:()=>sheet=null});
 vm.runInContext(lifecycle,context);
 const css=fs.readFileSync(new URL('../theme.css',import.meta.url),'utf8');sheet.textContent=css;
 for(let i=0;i<3;i++){
  window.__fadeCodex.destroy();assert.equal(sheet,null);window.__fadeResume();
  assert.equal(sheet.textContent,css,'current styles survive reinitialization');
  assert.ok(sheet.textContent.includes('[data-browser-host-root]{clip-path:none!important}'));
 }
});
