import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {createTestArea,retireTestArea} from './work-area.mjs';
const base=await createTestArea('wsl-image-paths');
const profile=path.join(base,'browser');
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));let target;
let socket,sequence=0;
function command(target,method,params={}){return new Promise((resolve,reject)=>{const id=++sequence;const receive=e=>{const reply=JSON.parse(e.data);if(reply.id!==id)return;socket.removeEventListener('message',receive);reply.error?reject(Error(JSON.stringify(reply.error))):resolve(reply.result)};socket.addEventListener('message',receive);socket.send(JSON.stringify({id,method,params}))})}
try{
 let port;for(let i=0;i<80;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await wait(100)}}assert.ok(port);
 target=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
 await command(target,'Page.bringToFront');
 await command(target,'Emulation.setDeviceMetricsOverride',{width:1100,height:800,deviceScaleFactor:1,mobile:false});
 await command(target,'Emulation.setFocusEmulationEnabled',{enabled:true});
 const evaluate=async expression=>{const r=await command(target,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};

 const source=await fs.readFile('src/wsl-image-paths.js','utf8');
 const result=await evaluate(source+'\n'+"(async()=>{\n const calls=[];window.fixtureProvider={forHost(host){return {startTurn(...args){calls.push({host,args});return 'ok'},dup(){return this}}}};\n const commonHref='data:text/javascript,'+encodeURIComponent('export const Cot=Symbol.for(\"fc008-scope\");');\n const initialHref='data:text/javascript,'+encodeURIComponent('export const JPr={};export function YPr(scope,host){return scope.get(JPr).forHost(host)}');\n const moduleLinks=[{href:initialHref+'#app-initial-test.js'},{href:commonHref+'#app-shared-test.js'}];\n const scope={scope:Symbol.for('fc008-scope'),get:()=>window.fixtureProvider,watch(fn){window.fixtureWatch=fn;return ()=>window.fixtureWatch=null}};\n const button=document.createElement('button');button.__reactFiber$fixture={memoizedState:{memoizedState:{current:scope}}};document.body.append(button);\n const doc={querySelectorAll:s=>s==='link[href]'?moduleLinks:[button]};\n const image=document.createElement('img');image.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';document.body.append(image);\n const src=image.src,originalProvider=window.fixtureProvider,originalForHost=originalProvider.forHost;\n const feature=installWslImagePaths(doc,window);\n for(let i=0;i<50&&!feature.ready;i++)await new Promise(r=>setTimeout(r,10));\n if(!feature.ready)throw Error('hook did not initialize');\n const args={context:{imageAttachments:[{src,localPath:'C:\\\\Temp\\\\截图.png'}]},prompt:'C:\\\\Temp\\\\text.png'};\n window.fixtureProvider.forHost('local').startTurn('thread',args);\n if(calls.at(-1).args[1]!==args)throw Error('disabled hook changed request');\n feature.set(true);window.fixtureProvider.forHost('local').startTurn('thread',args);\n if(calls.at(-1).args[1].context.imageAttachments[0].localPath!=='/mnt/c/Temp/截图.png')throw Error('image path not converted: '+JSON.stringify({enabled:feature.enabled,last:calls.at(-1),direct:fadeWslAttachmentArguments([args]),hook:window.fixtureProvider.forHost('local').__fadeWslAttachmentBridge}));\n if(args.context.imageAttachments[0].localPath!=='C:\\\\Temp\\\\截图.png'||image.src!==src)throw Error('preview mutated');\n window.fixtureProvider.forHost('remote').startTurn('thread',args);\n if(calls.at(-1).args[1]!==args)throw Error('remote request converted');\n window.fixtureProvider={forHost:originalForHost};window.fixtureWatch({get:()=>window.fixtureProvider});\n window.fixtureProvider.forHost('local').startTurn('thread',args);\n if(calls.at(-1).args[1].context.imageAttachments[0].localPath!=='/mnt/c/Temp/截图.png')throw Error('reconnect lost hook');\n feature.set(false);feature.destroy();\n if(originalProvider.forHost!==originalForHost||window.fixtureProvider.forHost!==originalForHost||window.fixtureWatch!==null)throw Error('hook not released');\n button.remove();image.remove();delete window.fixtureProvider;\n return {ready:true,converted:true,previewUnchanged:true,remoteUntouched:true,reconnected:true,released:true};\n})()\n\r\n\r\n");
 assert.deepEqual(result,{ready:true,converted:true,previewUnchanged:true,remoteUntouched:true,reconnected:true,released:true});
 await fs.writeFile(path.join(base,'results.json'),JSON.stringify(result,null,2));
 console.log('Attachment RPC browser lifecycle passed: local conversion, preview, remote bypass, reconnect, teardown.');
}finally{
 if(target)try{await command(target,'Browser.close')}catch{}
 socket?.close();
 if(browser.exitCode===null)await Promise.race([new Promise(r=>browser.once('exit',r)),wait(3000)]);
 await retireTestArea(base,browser);
}



