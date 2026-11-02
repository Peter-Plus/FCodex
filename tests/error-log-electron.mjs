// Hidden, isolated Electron test; never opens the user's profile or native UI.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {createTestArea,retireTestArea} from './work-area.mjs';
const source=process.argv[2];if(!source)throw Error('Pass installed app directory');
const area=await createTestArea('error-log-electron');let child;
try{
 const hash=data=>createHash('sha256').update(data).digest('hex');
 const archive=await fs.open(path.join(source,'resources/app.asar'),'r');
 const prefix=Buffer.alloc(16);await archive.read(prefix,0,16,0);
 const oldHeader=Buffer.alloc(prefix.readUInt32LE(12));await archive.read(oldHeader,0,oldHeader.length,16);await archive.close();
 await fs.cp(source,area,{recursive:true,filter:p=>p!==path.join(source,'resources')});
 await fs.mkdir(path.join(area,'resources'));
 const main=`const {app,protocol,BrowserWindow}=require('electron');
 const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
 app.setPath('userData',${JSON.stringify(path.join(area,'profile'))});
 protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
 const fadeAttachStartupView=()=>{};const fadeCloseWindow=w=>w.close();
 ${await fs.readFile('startup/custom-window-main.cjs','utf8')}
 app.whenReady().then(async()=>{
  protocol.handle('app',()=>new Response('<html><body>test</body></html>',{headers:{'content-type':'text/html'}}));
  const w=new BrowserWindow({show:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,sandbox:true}});
  fadeRegisterWindow(w);await w.loadURL('app://-/index.html');
  await assert.rejects(fs.stat(${JSON.stringify(path.join(area,'.fade-logs'))}),{code:'ENOENT'});
  await w.webContents.executeJavaScript(${JSON.stringify(await fs.readFile('src/error-reporting.js','utf8'))});
  await w.webContents.executeJavaScript("for(let i=0;i<1000;i++)globalThis.__fadeReportError('preview.save',new Error('injected failure token=private'));setTimeout(()=>{throw Error('global failure')},0);void Promise.reject(Error('promise failure'));true");
  await new Promise(resolve=>setTimeout(resolve,500));await fadeErrorLog.flush();
  const lines=(await fs.readFile(${JSON.stringify(path.join(area,'.fade-logs/errors.jsonl'))},'utf8')).trim().split('\\n').map(JSON.parse);
  assert.equal(lines.length,3);assert.equal(lines.filter(x=>x.operation==='preview.save').length,1);
  assert.ok(lines.some(x=>x.operation==='renderer.unhandled-error'));assert.ok(lines.some(x=>x.operation==='renderer.unhandled-rejection'));
  assert.ok(lines.every(x=>x.viewRevision==='electron-test'&&x.stack));assert.ok(!JSON.stringify(lines).includes('token=private'));
  await fs.writeFile(${JSON.stringify(path.join(area,'result.json'))},JSON.stringify({ok:true,records:lines.length,electron:process.versions.electron}));w.destroy();app.exit(0);
 }).catch(async error=>{await fs.writeFile(${JSON.stringify(path.join(area,'result.json'))},JSON.stringify({error:error.stack}));app.exit(1)});
 `;
 const files=new Map([
  ['package.json',Buffer.from(JSON.stringify({name:'fcodex-diagnostics-test',main:'.vite/build/main.cjs'}))],
  ['.vite/build/main.cjs',Buffer.from(main)],
  ['.vite/build/preload.cjs',await fs.readFile('startup/custom-window-preload.cjs')],
  ['.vite/build/fade-error-log.cjs',await fs.readFile('startup/error-log.cjs')],
  ['.vite/build/fade-build-info.json',Buffer.from('{"viewRevision":"electron-test"}')],
  ['.vite/build/fade-codex-icon.png',await fs.readFile('Arts/fade-codex-icon.png')]
 ]);
 const tree={files:{}};let offset=0;
 for(const [name,data]of files){let dir=tree;const parts=name.split('/');for(const part of parts.slice(0,-1))dir=dir.files[part]??={files:{}};const blocks=[];for(let i=0;i<data.length;i+=4194304)blocks.push(hash(data.subarray(i,i+4194304)));dir.files[parts.at(-1)]={size:data.length,offset:String(offset),integrity:{algorithm:'SHA256',hash:hash(data),blockSize:4194304,blocks}};offset+=data.length}
 const header=Buffer.from(JSON.stringify(tree)),padded=Math.ceil(header.length/4)*4,pre=Buffer.alloc(16+padded);
 pre.writeUInt32LE(4,0);pre.writeUInt32LE(8+padded,4);pre.writeUInt32LE(4+padded,8);pre.writeUInt32LE(header.length,12);header.copy(pre,16);
 await fs.writeFile(path.join(area,'resources/app.asar'),Buffer.concat([pre,...files.values()]));
 const executable=path.join(area,'ChatGPT.exe'),exe=await fs.readFile(executable),index=exe.indexOf(hash(oldHeader));assert.ok(index>=0);exe.write(hash(header),index,'ascii');await fs.writeFile(executable,exe);
 child=spawn(executable,[],{windowsHide:true,stdio:'ignore',env:{...process.env,ELECTRON_RUN_AS_NODE:'',FADE_LAUNCHER_PATH:path.join(area,'test.exe'),FADE_ICON_PATH:''}});
 const timer=setTimeout(()=>child.kill(),30000);
 let code;try{code=await new Promise((resolve,reject)=>{child.once('exit',resolve);child.once('error',reject)})}finally{clearTimeout(timer)}
 const result=JSON.parse(await fs.readFile(path.join(area,'result.json'),'utf8'));console.log(JSON.stringify(result));assert.equal(code,0);assert.equal(result.ok,true);
}finally{await retireTestArea(area,child)}
