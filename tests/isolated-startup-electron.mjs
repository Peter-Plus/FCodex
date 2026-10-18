import {createTestArea,retireTestArea} from './work-area.mjs';
// Real Electron smoke test in a disposable runtime. Never runs the native app or touches its profile.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {isolatedStartupPage} from '../startup/isolated-startup-page.mjs';
const build=JSON.parse(await fs.readFile('.fade-runtime-isolated/build.json','utf8'));
const root=await createTestArea('startup-electron');
let child;
try {
const hash=b=>createHash('sha256').update(b).digest('hex');
await fs.cp(build.source,root,{recursive:true,filter:p=>p!==path.join(build.source,'resources')});
await fs.mkdir(path.join(root,'resources'));
const preset=JSON.parse(await fs.readFile('startup/preset.json'));
const baked=JSON.parse(await fs.readFile('Arts/startup-loop.json'));
const page=isolatedStartupPage(await fs.readFile('design-previews/startup.html','utf8'),preset,baked);
const resultFile=path.join(root,'result.json');
const nativeHTML=`<html><body><script>
window.cover=[];window.__fadeCodex={setStartupCovered(v){cover.push(v)},prepareStartupHome(){return {x:.5,y:.4,size:94,width:innerWidth}}};
</script></body></html>`;
const main=`const fs=require('fs'),path=require('path'),assert=require('assert/strict');
${await fs.readFile('startup/isolated-startup-early.cjs','utf8')}
// The minimal harness has no native bootstrap: register the native local scheme here.
require('electron').protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
const {app,BrowserWindow}=require('electron');app.on('window-all-closed',()=>{});
// Model the native bootstrap's not-yet-ready network policy for EVERY new session.
// Local app resources are allowed; an unknown custom scheme must be rejected.
const allowsStartupURL=url=>['app:','codex-sandbox:','data:','blob:','file:','about:'].includes(new URL(url).protocol);
assert.equal(allowsStartupURL('fade-startup://animation/fade-startup.html'),false);
assert.equal(allowsStartupURL('app://-/fade-startup.html'),true);
app.on('session-created',session=>session.webRequest.onBeforeRequest((request,done)=>done({cancel:!allowsStartupURL(request.url)})));
app.setPath('userData',${JSON.stringify(path.join(root,'profile'))});
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');app.commandLine.appendSwitch('disable-renderer-backgrounding');app.commandLine.appendSwitch('disable-features','CalculateNativeWinOcclusion');app.commandLine.appendSwitch('disable-background-timer-throttling');app.commandLine.appendSwitch('disable-frame-rate-limit');
process.env.FADE_STARTUP_VIEW='1';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let w;const report={};
const fail=error=>{fs.writeFileSync(${JSON.stringify(resultFile)},JSON.stringify({error:error.stack,...report}));app.exit(1)};
process.on('uncaughtException',fail);process.on('unhandledRejection',fail);
app.whenReady().then(async()=>{
try{
 assert(app.isReady());report.lateMainInitialization=true;report.startupNetworkRestrictions=true;
 ${await fs.readFile('startup/custom-window-main.cjs','utf8')}
 ${await fs.readFile('startup/isolated-startup-main.cjs','utf8')}
 w=new BrowserWindow({show:false,x:-10000,y:-10000,width:1334,height:751,skipTaskbar:true,webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false,backgroundThrottling:false}});
 report.nativeFile=fs.existsSync(path.join(__dirname,'../../webview/native.html'));report.nativeText=fs.readFileSync(path.join(__dirname,'../../webview/native.html'),'utf8').slice(0,60);fadeRegisterWindow(w);w.showInactive();await w.loadURL('data:text/html,'+encodeURIComponent(fs.readFileSync(path.join(__dirname,'../../webview/native.html'),'utf8')));
 const state=fadeStartupViews.get(w),wc=state.view.webContents;
 for(let i=0;i<150;i++){if(state.animationPid)break;if(state.error)throw Error(state.error);await sleep(100)}
 assert(state.active);assert(state.animationPid);assert.notEqual(state.animationPid,state.mainPid);
 report.pids={main:state.mainPid,animation:state.animationPid};
 for(let i=0;i<150;i++){if(await wc.executeJavaScript("document.body.dataset.phase==='waiting'"))break;await sleep(100)}
 assert.equal(await wc.executeJavaScript('document.body.dataset.phase'),'waiting');
 assert.equal(await wc.executeJavaScript('window.__fadeStartupHost.ready'),true);
 // Native initialization can add/reorder content after the startup view exists.
 const lateView=new fadeWindowElectron.View();lateView.setBounds({x:0,y:0,width:1334,height:751});w.contentView.addChildView(lateView);
 assert.equal(w.contentView.children.at(-1),lateView);
 await sleep(350);assert.equal(w.contentView.children.at(-1),state.view);assert(state.view.getVisible());
 w.contentView.removeChildView(lateView);report.lateViewOcclusionRecovery=true;
 await wc.executeJavaScript('window.frameTimes=[];window.recording=true;requestAnimationFrame(function record(t){frameTimes.push(t);if(recording)requestAnimationFrame(record)})');
 await sleep(1500);report.baselineFrames=await wc.executeJavaScript('frameTimes.length');await wc.executeJavaScript('frameTimes=[]');
 // A synchronous busy loop in the native renderer must not stop the animation renderer.
 await w.webContents.executeJavaScript('(()=>{const end=performance.now()+1500;while(performance.now()<end){}return true})()');
 const frames=await wc.executeJavaScript('window.recording=false;frameTimes');
 report.framesDuringNativeBlock=frames.length;
 report.animationSpanMs=frames.at(-1)-frames[0];
 assert(frames.length>20,'animation stopped during native renderer block');
 assert(report.animationSpanMs>1000,'animation frames did not span the native block');
 w.setContentSize(1000,700);await sleep(200);assert.equal(state.view.getBounds().width,w.getContentSize()[0]);assert.equal(state.view.getBounds().height,w.getContentSize()[1]);
 await wc.executeJavaScript("document.getElementById('core').click()");
 for(let i=0;i<100&&state.active;i++)await sleep(100);
 assert.equal(state.active,false);assert(wc.isDestroyed());assert.equal(await w.webContents.executeJavaScript('cover.at(-1)'),false);
 report.handoff=true;
 fadeAttachStartupView(w);let second=fadeStartupViews.get(w);await sleep(1500);
 second.view.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});
 for(let i=0;i<40&&second.active;i++)await sleep(100);
 assert.equal(second.active,false);report.escape=true;
 fadeAttachStartupView(w);const third=fadeStartupViews.get(w),thirdContents=third.view.webContents;w.destroy();await sleep(100);assert(thirdContents.isDestroyed());report.windowClose=true;
 fs.writeFileSync(${JSON.stringify(resultFile)},JSON.stringify(report,null,2));app.exit(0);
}catch(error){fail(error)}});
setTimeout(()=>fail(Error('Electron smoke test timeout')),45000);
`;
const files=new Map([
 ['package.json',Buffer.from(JSON.stringify({name:'fade-startup-test',main:'.vite/build/main.cjs'}))],
 ['.vite/build/main.cjs',Buffer.from(main)],
 ['.vite/build/fade-codex-icon.png',await fs.readFile('Arts/fade-codex-icon.png')],
 ['.vite/build/fade-startup-preload.cjs',await fs.readFile('startup/isolated-startup-preload.cjs')],
 ['webview/native.html',Buffer.from(nativeHTML)],['webview/fade-startup.html',Buffer.from(page.html)],['webview/fade-startup.js',Buffer.from(page.script)],
 ['webview/fade-intro.mp4',await fs.readFile('Arts/MilkDragon1.mp4')],['webview/fade-loop.mp4',await fs.readFile('Arts/startup-loop.mp4')]
]);
const tree={files:{}};let offset=0;
for(const [name,data]of files){let dir=tree;const parts=name.split('/');for(const part of parts.slice(0,-1))dir=dir.files[part]??= {files:{}};
 const blockSize=4194304,blocks=[];for(let i=0;i<data.length;i+=blockSize)blocks.push(hash(data.subarray(i,i+blockSize)));
 dir.files[parts.at(-1)]={size:data.length,offset:String(offset),integrity:{algorithm:'SHA256',hash:hash(data),blockSize,blocks}};offset+=data.length;
}
const header=Buffer.from(JSON.stringify(tree)),padded=Math.ceil(header.length/4)*4,prefix=Buffer.alloc(16+padded);
prefix.writeUInt32LE(4,0);prefix.writeUInt32LE(8+padded,4);prefix.writeUInt32LE(4+padded,8);prefix.writeUInt32LE(header.length,12);header.copy(prefix,16);
await fs.writeFile(path.join(root,'resources/app.asar'),Buffer.concat([prefix,...files.values()]));
const exe=await fs.readFile(path.join(root,'ChatGPT.exe')),index=exe.indexOf(build.oldHash);assert(index>=0);exe.write(hash(header),index,'ascii');await fs.writeFile(path.join(root,'ChatGPT.exe'),exe);
child=spawn(path.join(root,'ChatGPT.exe'),[],{windowsHide:true,stdio:'ignore',env:{...process.env,ELECTRON_RUN_AS_NODE:''}});
const timeout=setTimeout(()=>child.kill(),60000);
const code=await new Promise(resolve=>child.once('exit',resolve));clearTimeout(timeout);
const result=JSON.parse(await fs.readFile(resultFile,'utf8'));console.log(JSON.stringify({code,root,...result},null,2));assert.equal(code,0);assert(!result.error);

} finally { await retireTestArea(root,child); }
