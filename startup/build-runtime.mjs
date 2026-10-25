import fs from 'node:fs/promises';
import {createReadStream,createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {patchDiagnosticIndex} from './diagnostic-gate.mjs';
import {isolatedStartupPage} from './isolated-startup-page.mjs';
import {patchMainBranding,patchBootstrapBranding} from './branding-patch.mjs';
import {patchQuitGuard} from './quit-patch.mjs';
import {patchWindowPreview,patchPreviewScope} from './window-preview-patch.mjs';
import {patchWindowModePages,assertWindowModeAsset} from './window-mode-patch.mjs';
import {patchWindowComposerFocus} from './window-focus-patch.mjs';
import {patchPageHomeHooks,patchPageHomeConsumers} from './window-home-patch.mjs';
import {supportedArchiveHash} from './runtime-fallback.mjs';
const source=process.argv[2];if(!source)throw Error('Pass the official app directory');
const verifyOnly=process.argv.includes('--verify-only');
const diagnostic=process.argv.includes('--diagnostic-hold');
const runtimeRoot=diagnostic?'.work/active/diagnostic-runtime':'.fade-runtime-isolated';
const buildPath=path.join(runtimeRoot,'build.json');
const destination=path.resolve(runtimeRoot,'app');
if(path.resolve(source)===destination)throw Error('Source must be separate');
const archive=path.join(source,'resources/app.asar'),fd=await fs.open(archive,'r');
const prefix=Buffer.alloc(16);await fd.read(prefix,0,16,0);const header=Buffer.alloc(prefix.readUInt32LE(12));await fd.read(header,0,header.length,16);
const tree=JSON.parse(header),offset=8+prefix.readUInt32LE(4),size=(await fd.stat()).size;
const hash=b=>createHash('sha256').update(b).digest('hex');
if(hash(header)!==supportedArchiveHash){
 console.log('This Codex build has not been validated. Attempting to build Fade against the installed client; compatibility is not guaranteed.');
 console.log('Installed ASAR header SHA-256: '+hash(header)+'. Official files will not be modified.');
}
let existing;try{existing=JSON.parse(await fs.readFile(buildPath,'utf8'))}catch{}
// Asset identity participates in build caching; launching never transcodes media.
const mediaManifest=await fs.readFile('Arts/startup-loop.json','utf8');
const mediaRevision=hash(Buffer.concat([Buffer.from(mediaManifest),await fs.readFile('Arts/fade-codex-icon.png'),await fs.readFile('startup/branding-patch.mjs')]));
const diagnosticRevision=diagnostic?hash(await fs.readFile('startup/diagnostic-gate.mjs')):undefined;
const viewRevision=hash(Buffer.concat(await Promise.all(['startup/window-home-patch.mjs','startup/window-focus-patch.mjs','startup/window-preview-patch.mjs','startup/build-runtime.mjs','startup/window-mode-patch.mjs','fade.js','theme.css','startup/quit-patch.mjs','startup/quit-policy.cjs','startup/custom-window-main.cjs','startup/custom-window-preload.cjs','startup/isolated-startup-early.cjs','startup/isolated-startup-main.cjs','startup/isolated-startup-preload.cjs','startup/isolated-startup-page.mjs','design-previews/startup.html','startup/preset.json'].map(p=>fs.readFile(p)))));
let cacheValid=false;
if(existing?.oldHash===hash(header)&&existing?.revision===6&&existing?.viewRevision===viewRevision&&existing?.mediaRevision===mediaRevision&&existing?.diagnosticRevision===diagnosticRevision){
 let cached;
 try{
  await fs.access(path.join(destination,'ChatGPT.exe'));
  cached=await fs.open(path.join(destination,'resources/app.asar'),'r');
  const p=Buffer.alloc(16);await cached.read(p,0,16,0);
  const length=p.readUInt32LE(12);
  if(length>0&&length<64*1024*1024){const h=Buffer.alloc(length);const result=await cached.read(h,0,length,16);cacheValid=result.bytesRead===length&&hash(h)===existing.newHash}
 }catch{}finally{await cached?.close()}
}
if(cacheValid&&!verifyOnly){console.log('Fade runtime already matches installed client');await fd.close();process.exit(0)}
function entry(p){let n=tree;for(const k of p.split('/')){n=n.files?.[k];if(!n)throw Error('Missing Codex archive entry: '+p)}return n}
async function read(p){const n=entry(p),b=Buffer.alloc(n.size);await fd.read(b,0,b.length,offset+Number(n.offset));return b.toString()}
const mainName=Object.keys(entry('.vite/build').files).find(n=>/^main-.*\.js$/.test(n));
let main=await read('.vite/build/'+mainName);
main=patchQuitGuard(patchMainBranding(main));
const needle='z=new D.BrowserWindow(R);';
if(main.split(needle).length!==2)throw Error('Unsupported window constructor: refusing patch');
main=main.replace(needle,'z=new D.BrowserWindow(d===`primary`?{...R,frame:!1,titleBarOverlay:!1,fullscreen:process.env.FADE_START_FULLSCREEN===`1`}:R);if(d===`primary`)fadeRegisterWindow(z);');
// Restoring maximization after construction overrides the fullscreen geometry on Windows.
// Keep the saved bounds, but let explicit startup fullscreen take precedence.
const restoreMaximized='k=C?.isMaximized===!0';
if(main.split(restoreMaximized).length!==2)throw Error('Unsupported maximization restore: refusing patch');
main=main.replace(restoreMaximized,'k=C?.isMaximized===!0&&!(d===`primary`&&process.env.FADE_START_FULLSCREEN===`1`)');
main=(await fs.readFile('startup/quit-policy.cjs','utf8'))+'\n'+(await fs.readFile('startup/custom-window-main.cjs','utf8'))+'\n'+(await fs.readFile('startup/isolated-startup-main.cjs','utf8'))+'\n'+main;
const preload=await read('.vite/build/preload.js')+'\n'+await fs.readFile('startup/custom-window-preload.cjs','utf8');
const files=new Map([['.vite/build/'+mainName,Buffer.from(main)],['.vite/build/preload.js',Buffer.from(preload)]]);
const bootstrapName=Object.keys(entry('.vite/build').files).find(n=>/^bootstrap-.*\.js$/.test(n));
if(!bootstrapName)throw Error('Missing native branding bootstrap');
files.set('.vite/build/'+bootstrapName,Buffer.from(patchBootstrapBranding(await read('.vite/build/'+bootstrapName))));
files.set('.vite/build/fade-codex-icon.png',await fs.readFile('Arts/fade-codex-icon.png'));
const packageEntry=JSON.parse(await read('package.json')).main;
if(packageEntry!=='.vite/build/early-bootstrap.js')throw Error('Unvalidated early entry; refusing late protocol registration');
files.set(packageEntry,Buffer.from((await fs.readFile('startup/isolated-startup-early.cjs','utf8'))+'\n'+await read(packageEntry)));
if(diagnostic){
 const patched=patchDiagnosticIndex(await read('webview/index.html'));
 files.set('webview/index.html',Buffer.from(patched.html));
 files.set('webview/fade-diagnostic-entry.js',Buffer.from(patched.script));
}
const mediaInfo=JSON.parse(mediaManifest);
const preset=JSON.parse(await fs.readFile('startup/preset.json','utf8'));
if(mediaInfo.from!==preset.loopFrom||mediaInfo.to!==preset.loopTo)throw Error('Startup loop preset mismatch');
const startupPage=isolatedStartupPage(await fs.readFile('design-previews/startup.html','utf8'),preset,mediaInfo);
files.set('webview/fade-startup.html',Buffer.from(startupPage.html));
files.set('webview/fade-startup.js',Buffer.from(startupPage.script));
files.set('.vite/build/fade-startup-preload.cjs',await fs.readFile('startup/isolated-startup-preload.cjs'));
for(const [name,local,digest]of [['fade-intro.mp4','Arts/MilkDragon1.mp4',mediaInfo.sourceHash],['fade-loop.mp4','Arts/startup-loop.mp4',mediaInfo.loopHash]]){
 const data=await fs.readFile(local);if(hash(data)!==digest)throw Error('Startup media changed; run startup/bake-loop.mjs before rebuilding');
 files.set('webview/'+name,data);
}
function replaceOnce(s,a,b){if(s.split(a).length!==2)throw Error('Patch mismatch: '+a.slice(0,80));return s.replace(a,b)}
const assets=entry('webview/assets').files;
const sharedName=Object.keys(assets).find(n=>/^app-shared-.*\.js$/.test(n));
files.set('webview/assets/'+sharedName,Buffer.from(patchPreviewScope(await read('webview/assets/'+sharedName))));
const primaryName=Object.keys(assets).find(n=>/^app-primary-.*\.js$/.test(n));
const initialName=Object.keys(assets).find(n=>/^app-initial-.*\.js$/.test(n));
let initial=await read('webview/assets/'+initialName);
initial=replaceOnce(initial,'function gqt(e,t){t!==`codex`&&oy(e,t),XKt(e,t===`codex`?hKt:$v)}','function gqt(e,t){}');
initial=replaceOnce(initial,'var yqt,bqt,xqt,','var fadeStudyChat,fadeStudyProduct,yqt,bqt,xqt,');
initial=replaceOnce(initial,'yqt=`home-composer-mode-v1`,','fadeStudyChat=Y(U,({get:e})=>{let t=e(ch);return t?.state?.fadeChat===!0||t!=null&&Zy(t).routeKind===`chatgpt-thread`}),fadeStudyProduct=Y(U,({get:e})=>e(fadeStudyChat)?`work`:`codex`),yqt=`home-composer-mode-v1`,');
initial=replaceOnce(initial,'sy=Y(U,({get:e})=>e(Tqt,void 0))','sy=Y(U,({get:e})=>e(fadeStudyChat)?`chat`:e(Tqt,void 0))');
initial=replaceOnce(initial,'homeDraftKey:o?`locked-project:${i.accountId}:${i.userId}:${i.projectId}`:void 0','homeDraftKey:s.state?.fadeDraftKey??s.state?.fadePaneHome??(o?`locked-project:${i.accountId}:${i.userId}:${i.projectId}`:void 0)');
initial=replaceOnce(initial,'gKt=cs(U,()=>null)','gKt=cs(U,()=>({detailLevel:`STEPS_COMMANDS`}))');
const start=initial.indexOf('_L=Y(U,');const end=initial.indexOf('})})))()}',start);if(start<0||end<0)throw Error('global atom missing');initial=initial.slice(0,start)+'_L=Y(U,()=>`codex`)'+initial.slice(end+2);
const preferenceStart=initial.indexOf('function XKt(e,t){'),preferenceEnd=initial.indexOf('function ZKt()',preferenceStart);if(preferenceStart<0||preferenceEnd<0)throw Error('Unsupported product preference action');initial=initial.slice(0,preferenceStart)+'function XKt(e,t){return Promise.resolve()}'+initial.slice(preferenceEnd);
const ex=initial.lastIndexOf('export{');initial=initial.slice(0,ex)+initial.slice(ex).replace('export{','export{gKt as fadeStudyPreference,fadeStudyProduct as fadeStudyProduct,fadeStudyChat as fadeStudyChat,');
const previewAsset=patchWindowPreview(patchWindowComposerFocus(patchPageHomeHooks(initial)));
if(!previewAsset.includes('window.__fadePreviewHostVersion=3')||!previewAsset.includes('bridge.ownsRenderer(renderer)'))throw Error('Final asset lost single-renderer preview patch');
files.set('webview/assets/'+initialName,Buffer.from(previewAsset));
let homeName;for(const n of Object.keys(assets)){if(!n.endsWith('.js')||assets[n].size<1000000||n===initialName)continue;const candidate=await read('webview/assets/'+n);if(candidate.includes('function MQ(e)')&&candidate.includes('RTn as Yy')&&candidate.includes('homeDraftKey')){if(homeName)throw Error('Ambiguous home module');homeName=n}}
if(!homeName)throw Error('home bundle missing');
let home=await read('webview/assets/'+homeName);home=patchPageHomeConsumers(replaceOnce(home,'RTn as Yy','fadeStudyProduct as Yy'));files.set('webview/assets/'+homeName,Buffer.from(home));
// Home and primary are the same bundle in the supported client. Compose on the
// already patched bytes; rereading the original here would discard the GPT patch.
const primaryPath='webview/assets/'+primaryName;
files.set(primaryPath,Buffer.from(patchWindowModePages(files.get(primaryPath)?.toString()??await read(primaryPath))));
assertWindowModeAsset(files.get(primaryPath).toString());
if(!files.get('webview/assets/'+homeName).toString().includes('fadeStudyProduct as Yy'))throw Error('Final asset lost GPT home patch');
if(verifyOnly){
 const {spawnSync}=await import('node:child_process');
 for(const [name,data]of files){if(!/\.(?:js|cjs)$/.test(name))continue;const checked=spawnSync(process.execPath,['--input-type=module','--check'],{input:data,encoding:'utf8',windowsHide:true,maxBuffer:1024*1024});if(checked.status!==0)throw Error('Patched syntax check failed: '+name+'\n'+checked.stderr)}
 await fd.close();console.log('Verified runtime patches and JavaScript syntax for '+files.size+' assets; no runtime files changed.');process.exit(0);
}
let cursor=size-offset;
for(const [name,data]of files){const keys=name.split('/');let n=tree;for(const k of keys.slice(0,-1))n=n.files[k];const blockSize=4194304,blocks=[];for(let i=0;i<data.length;i+=blockSize)blocks.push(hash(data.subarray(i,i+blockSize)));n.files[keys.at(-1)]={size:data.length,offset:String(cursor),integrity:{algorithm:'SHA256',hash:hash(data),blockSize,blocks}};cursor+=data.length}
await fs.mkdir(destination,{recursive:true});
console.log('Copying isolated runtime...');
await fs.cp(source,destination,{recursive:true,filter:p=>p!==archive,force:true});
const json=Buffer.from(JSON.stringify(tree)),padded=Math.ceil(json.length/4)*4,pre=Buffer.alloc(16+padded);pre.writeUInt32LE(4,0);pre.writeUInt32LE(8+padded,4);pre.writeUInt32LE(4+padded,8);pre.writeUInt32LE(json.length,12);json.copy(pre,16);
const output=path.join(destination,'resources/app.asar');await fs.writeFile(output,pre);await pipeline(createReadStream(archive,{start:offset}),createWriteStream(output,{flags:'a'}));for(const data of files.values())await fs.appendFile(output,data);await fd.close();
// Update the copied EXE's exact ASAR-header digest; keep integrity validation on.
const exe=await fs.readFile(path.join(source,'ChatGPT.exe')),oldHash=hash(header),newHash=hash(json),position=exe.indexOf(oldHash);
if(position<0||exe.indexOf(oldHash,position+1)!==-1)throw Error('Expected unique embedded ASAR digest');
exe.write(newHash,position,'ascii');await fs.writeFile(path.join(destination,'ChatGPT.exe'),exe);
await fs.writeFile(buildPath,JSON.stringify({revision:6,viewRevision,mediaRevision,diagnosticRevision,source,destination,oldHash,newHash,files:[...files.keys()]},null,2));
console.log('Fade runtime built:',destination);

