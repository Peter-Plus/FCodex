import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/wsl-image-paths.js',import.meta.url),'utf8');
function run(code){const c=vm.createContext({assert});vm.runInContext(source+'\n'+code,c)}
test('attachment submission copies paths and keeps source preview, prompt, callbacks and unrelated files unchanged',()=>run(String.raw`
 const callback=()=>{},image={src:'data:image/png;base64,AA==',localPath:'C:\\Users\\截图 目录\\a.PNG',filename:'a.PNG'};
 const request={context:{prompt:'C:\\Users\\截图 目录\\a.PNG',imageAttachments:[image],fileAttachments:[{path:'C:\\notes.txt',fsPath:'C:\\notes.txt'}]},callback};
 const args=[request],next=fadeWslAttachmentArguments(args);
 assert.notEqual(next,args);assert.equal(next[0].context.imageAttachments[0].localPath,'/mnt/c/Users/截图 目录/a.PNG');
 assert.equal(image.localPath,'C:\\Users\\截图 目录\\a.PNG');assert.equal(next[0].context.imageAttachments[0].src,image.src);
 assert.equal(next[0].context.prompt,request.context.prompt);assert.equal(next[0].callback,callback);assert.equal(next[0].context.fileAttachments,request.context.fileAttachments);
`));
test('serialized image input and generated image list agree, ordinary text and already Linux paths remain unchanged',()=>run(String.raw`
 const image={type:'localImage',path:'D:\\Screens\\a.png'};
 const text={type:'text',text:'# Files mentioned by the user:\n## a.png: D:\\Screens\\a.png\nImage attachment: true\n\nMy request: D:\\Screens\\a.png'.replaceAll('\\n','\n')};
 text.text='# Files mentioned by the user:\n## a.png: D:\\Screens\\a.png\nImage attachment: true\n\nMy request: D:\\Screens\\a.png';
 const input=[image,text],out=fadeWslAttachmentArguments([input])[0];
 assert.equal(out[0].path,'/mnt/d/Screens/a.png');assert(out[1].text.includes('## a.png: /mnt/d/Screens/a.png'));assert(out[1].text.endsWith('My request: D:\\Screens\\a.png'));
 for(const path of ['/mnt/c/a.png','/home/user/a.png','\\\\server\\share\\a.png'])assert.equal(fadeWslAttachmentPath(path),path);
`));
test('service hook handles all submit variants and duplicates, preserves return values and bypasses when off',()=>run(String.raw`
 let enabled=false;const calls=[],service={};for(const method of ['startConversation','startTurn','startTurnWithOutcome','sendFollowUpMessage','steerTurn','editLastUserTurn','startEmptyTurn','readThread'])service[method]=function(...args){assert.equal(this,service);calls.push({method,args});return 'sentinel'};
 service.dup=()=>service;const wrapped=fadeWrapWslAttachmentService(service,()=>enabled),args={context:{imageAttachments:[{src:'data:image/png;base64,A',localPath:'C:\\shot.png'}]}};
 assert.equal(wrapped.startTurn('id',args),'sentinel');assert.equal(calls.at(-1).args[1],args);enabled=true;
 for(const method of ['startConversation','startTurn','startTurnWithOutcome','sendFollowUpMessage','steerTurn','editLastUserTurn','startEmptyTurn']){wrapped[method]('id',args);assert.equal(calls.at(-1).args[1].context.imageAttachments[0].localPath,'/mnt/c/shot.png')}
 wrapped.readThread('id',args);assert.equal(calls.at(-1).args[1],args);assert.equal(wrapped.dup(),wrapped);assert.equal(args.context.imageAttachments[0].localPath,'C:\\shot.png');
`));
test('native localImage serialization receives converted attachment while original preview stays Windows-backed',()=>run(String.raw`
 function nativeSerialize(src,{localPath,isRemoteHost=false}={}){if(!isRemoteHost&&localPath)return {type:'localImage',path:localPath};if(/^data:image\//i.test(src))return {type:'image',url:src};return {type:'localImage',path:src}}
 const original={imageAttachments:[{src:'data:image/png;base64,AA==',localPath:'C:\\Temp\\codex-clipboard.png'}]};
 const converted=fadeWslAttachmentArguments([original])[0].imageAttachments[0];
 assert.equal(nativeSerialize(converted.src,converted).path,'/mnt/c/Temp/codex-clipboard.png');assert.equal(original.imageAttachments[0].localPath,'C:\\Temp\\codex-clipboard.png');
`));

test('native composer coordinator converts prepared start/steer and run-now payloads, retaining queue previews',async()=>{
 const c=vm.createContext({assert});
 await vm.runInContext(source+String.raw`
 (async()=>{
 let enabled=true,prepared,seenMessage,prepareLater;
 const original={executionHostId:'local',start:{request:{input:[{type:'localImage',path:'C:\\Temp\\a.png'},{type:'text',text:'## a.png: C:/Temp/a.png\nImage attachment: true\n'}]}},steer:{input:[{type:'localImage',path:'C:\\Temp\\a.png'}],attachments:[{path:'C:/Temp/a.png',fsPath:'C:/Temp/a.png',isImageAttachment:true}]}};
 const coordinator={async sendMessage(message,prepare){seenMessage=message;prepareLater=prepare;prepared=await prepare(message,'start');return 'sent'},async sendQueuedMessageNow(id,messageId,options,prepare){prepared=await prepare({},'steer');return 'sent'},dup(){return this},[Symbol.dispose](){this.disposed=true}};
 const service={getTurnCoordinator(){return Promise.resolve(coordinator)}};
 const wrapped=fadeWrapWslAttachmentService(service,()=>enabled),returned=await wrapped.getTurnCoordinator();
 const message={context:{imageAttachments:[{src:'data:image/png;base64,A',localPath:'C:\\Temp\\a.png'}]}};
 const prepare=async(value,mode)=>{assert(['start','steer'].includes(mode));return original};
 assert.equal(await returned.sendMessage(message,prepare),'sent');assert.equal(seenMessage,message);
 assert.equal(prepared.start.request.input[0].path,'/mnt/c/Temp/a.png');assert(prepared.start.request.input[1].text.includes('## a.png: /mnt/c/Temp/a.png'));
 assert.equal(prepared.steer.input[0].path,'/mnt/c/Temp/a.png');assert.equal(prepared.steer.attachments[0].fsPath,'/mnt/c/Temp/a.png');
 assert.equal(message.context.imageAttachments[0].localPath,'C:\\Temp\\a.png');assert.equal(original.steer.input[0].path,'C:\\Temp\\a.png');
 await returned.sendQueuedMessageNow('id','message',{},prepare);assert.equal(prepared.steer.input[0].path,'/mnt/c/Temp/a.png');
 enabled=false;assert.equal(await prepareLater(message,'start'),original);
 enabled=true;for(const host of ['remote',undefined]){const remote={...original,executionHostId:host};await returned.sendMessage(message,async()=>remote);assert.equal(prepared,remote)}
 const error=new Error('preparation failed');await assert.rejects(returned.sendMessage(message,async()=>{throw error}),e=>e===error);
 returned[Symbol.dispose]();assert.equal(coordinator.disposed,true);
 })()
 `,c);
});
