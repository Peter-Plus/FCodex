import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
function fixture(){
 let handler;const commands=[],timers=new Map();let serial=0;
 const make=(id)=>{const w={id,isDestroyed:()=>false,isVisible:()=>true,getBounds:()=>({x:0,y:0,width:100,height:100})};w.webContents={id,mainFrame:{url:'app://-/index.html'},send(_name,message){commands.push({w,message})}};return w};
 const a=make(1),b=make(2),bad=make(3),windows=[a,b];
 const c=vm.createContext({fadeCustomWindows:new WeakSet(windows),fadeWindowElectron:{BrowserWindow:{fromWebContents:wc=>[a,b,bad].find(w=>w.webContents===wc),getAllWindows:()=>windows},screen:{getCursorScreenPoint:()=>({x:50,y:50})},ipcMain:{handle(_name,fn){handler=fn}}},setTimeout:fn=>{timers.set(++serial,fn);return serial},clearTimeout:id=>timers.delete(id),Date,Error,Map,WeakMap});
 vm.runInContext(fs.readFileSync(new URL('../startup/window-workspace-main.cjs',import.meta.url),'utf8'),c);
 const request=(w,action,data)=>handler({sender:w.webContents,senderFrame:w.webContents.mainFrame},action,data);
 return {a,b,bad,request,commands,timers,async reply(command,result,error){return request(command.w,'reply',{id:command.message.id,result,error})}};
}
const token='12345678-abcd-abcd-abcd-123456789012';
test('registered sender and main frame validation rejects foreign windows',async()=>{const f=fixture();await assert.rejects(f.request(f.bad,'offer',{token,type:'codex',key:'/local/a'}),/Unsupported/)});
test('cross-window transfer imports before commit; different types cannot claim',async()=>{
 const f=fixture();await f.request(f.a,'offer',{token,type:'codex',key:'/local/a'});
 await assert.rejects(f.request(f.b,'claim',{token,type:'gpt'}),/同类型/);
 const claim=f.request(f.b,'claim',{token,type:'codex'});assert.equal(f.commands[0].message.action,'export');
 await f.reply(f.commands[0],{type:'codex',path:'/local/a',title:'A'});await new Promise(r=>setImmediate(r));assert.equal(f.commands[1].message.action,'import');assert.equal(f.commands.length,2);
 await f.reply(f.commands[1],true);await new Promise(r=>setImmediate(r));assert.equal(f.commands[2].message.action,'commit');await f.reply(f.commands[2],true);assert.equal(await claim,true);assert.equal(f.timers.size,0);
});
test('destination rejection never commits source; failed inside-window drop never detaches',async()=>{
 const f=fixture();await f.request(f.a,'offer',{token,type:'gpt',key:'gpt-1'});assert.equal(await f.request(f.a,'detach',{token}),false);assert.equal(f.commands.length,0);
 const claim=f.request(f.b,'claim',{token,type:'gpt'});const rejected=assert.rejects(claim,/not ready/);await f.reply(f.commands[0],{type:'gpt',path:'/c/a'});await new Promise(r=>setImmediate(r));await f.reply(f.commands[1],null,'not ready');await rejected;assert.equal(f.commands.length,2);assert.equal(f.timers.size,0);
});
test('a reply from another renderer cannot satisfy a pending transfer',async()=>{const f=fixture();await f.request(f.a,'offer',{token,type:'codex',key:'/local/a'});const pending=f.request(f.b,'claim',{token,type:'codex'}),rejected=assert.rejects(pending,/cancel/);await assert.rejects(f.request(f.b,'reply',{id:f.commands[0].message.id,result:{type:'codex',path:'/local/a'}}),/Invalid reply/);await f.reply(f.commands[0],null,'cancel');await rejected});
