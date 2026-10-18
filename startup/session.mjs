import http from 'node:http';
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
export function productionHTML(source,{token,theme,preset,bridge}){
 const settings=JSON.stringify({base:`/${token}`,theme,preset}).replaceAll('<','\\u003c');
 return source.replace('<head>',`<head><script>window.__fadeStartupSettings=${settings};</script><script>${bridge}</script>`)
  .replace('<title>FCodex · 启动动画预览</title>',`<title>Fade Startup ${token.slice(0,12)}</title>`)
  .replace('src="../Arts/MilkDragon1.mp4"',`src="/${token}/video"`)
  .replace('</head>',`<style>.tuning,.tools,.bottom,.workspace,.caption{display:none!important}body[data-phase=live] .tools{display:none!important}#realWorkspace{position:fixed;inset:0;width:100%;height:100%;z-index:1;opacity:0;object-fit:fill;pointer-events:none}body[data-phase=leaving] #realWorkspace,body[data-phase=settling] #realWorkspace,body[data-phase=live] #realWorkspace{opacity:1}body[data-phase=settling] .signature,body[data-phase=live] .signature{display:none!important}#startupError{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:30;max-width:80vw;background:#242424;color:white;border:1px solid #ffffff30;border-radius:12px;padding:15px 20px;font:14px/1.6 "Segoe UI",sans-serif}</style></head>`);
}
export async function command(target,method,params={}){
 const url=new URL(target.webSocketDebuggerUrl);
 if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname))throw Error('Non-local debugger rejected');
 return new Promise((resolve,reject)=>{
  const ws=new WebSocket(url),timer=setTimeout(()=>done(Error('Debugger timeout')),8000);let ended=false;
  function done(err,value){if(ended)return;ended=true;clearTimeout(timer);ws.close();err?reject(err):resolve(value)}
  ws.addEventListener('open',()=>ws.send(JSON.stringify({id:1,method,params})));
  ws.addEventListener('error',()=>done(Error('Debugger connection failed')));
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id===1)m.error||m.result?.exceptionDetails?done(Error(JSON.stringify(m.error||m.result.exceptionDetails))):done(null,m.result)});
 });
}
export function allowedTarget(t){try{const u=new URL(t.url);return t.type==='page'&&!!t.webSocketDebuggerUrl&&u.protocol==='app:'&&u.hostname==='-'&&u.pathname==='/index.html'&&!/avatar-overlay|detached-window|prewarm|%2Fspace%2F/i.test(u.search)}catch{return false}}

export async function createSession({statusFile,theme='dark',debugPort=19222}){
 const token=randomBytes(24).toString('hex'),base=`/${token}`;
 const preset=JSON.parse(await fs.readFile(path.join(root,'startup/preset.json'),'utf8'));
 const bridge=await fs.readFile(path.join(root,'startup/bridge.js'),'utf8');
 const page=productionHTML(await fs.readFile(path.join(root,'design-previews/startup.html'),'utf8'),{token,theme,preset,bridge});
 let picture=null,ready=false,shown=false,complete=false,error='',targetInfo=null,capturing=false;
 const evaluate=(target,expression)=>command(target,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}).then(r=>r.result?.value);
 async function capture(){
  if(capturing||ready)return;capturing=true;
  try{
   const list=await(await fetch(`http://127.0.0.1:${debugPort}/json/list`,{signal:AbortSignal.timeout(2000)})).json();
   const target=list.find(allowedTarget);if(!target)throw Error('Main application target unavailable');
   const info=await evaluate(target,`(()=>{const position=window.__fadeCodex?.prepareStartupHome?.();return position?{...position,theme:document.documentElement.dataset.theme}:null})()`);
   if(!info)throw Error('Welcome page and centered orb are not ready');
   try{
    await evaluate(target,`(()=>{const el=document.getElementById('fade-codex-layer').shadowRoot.querySelector('#orbButton');window.__fadeStartupOrbVisibility=el.style.visibility;el.style.visibility='hidden';return true})()`);
    await new Promise(resolve=>setTimeout(resolve,80));
    const shot=await command(target,'Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    picture=Buffer.from(shot.data,'base64');
   }finally{
    await evaluate(target,`(()=>{const el=document.getElementById('fade-codex-layer')?.shadowRoot?.querySelector('#orbButton');if(el)el.style.visibility=window.__fadeStartupOrbVisibility||'';delete window.__fadeStartupOrbVisibility;return true})()`);
   }
   targetInfo=info;ready=true;
  }catch(e){error=e.message}finally{capturing=false}
 }
 const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  if(!url.pathname.startsWith(base+'/')){res.writeHead(404);res.end();return}
  const route=url.pathname.slice(base.length);
  if(req.method==='POST'&&req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`){res.writeHead(403);res.end();return}
  const json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value))};
  if(route==='/'&&req.method==='GET'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(page);return}
  if(route==='/state'&&req.method==='GET'){json({ready,shown,complete,error,target:targetInfo});return}
  if(route==='/shown'&&req.method==='POST'){shown=true;json({ok:true});return}
  if(route==='/ready'&&req.method==='POST'){await capture();json({ready,error});return}
  if(route==='/complete'&&req.method==='POST'){if(!ready){res.writeHead(409);res.end();return}complete=true;json({ok:true});return}
  if(route==='/picture'&&req.method==='GET'&&picture){res.setHeader('Content-Type','image/png');res.end(picture);return}
  if(route==='/video'&&['GET','HEAD'].includes(req.method)){
   try{
    const file=path.join(root,'Arts/MilkDragon1.mp4'),{size}=await fs.stat(file),range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    const start=range?Number(range[1]):0,end=range?.[2]?Math.min(Number(range[2]),size-1):size-1;
    if(start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return}
    res.writeHead(range?206:200,{'Content-Type':'video/mp4','Accept-Ranges':'bytes','Content-Length':end-start+1,...(range?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})});
    if(req.method==='HEAD'){res.end();return}const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());req.on('close',()=>stream.destroy());stream.pipe(res);
   }catch{res.writeHead(500);res.end('Video unavailable')}
   return;
  }
  res.writeHead(404);res.end();
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const address=`http://127.0.0.1:${server.address().port}${base}`;
 const details={url:address+'/',control:address,title:`Fade Startup ${token.slice(0,12)}`,pid:process.pid};
 if(statusFile){await fs.writeFile(statusFile+'.tmp',JSON.stringify(details));await fs.rename(statusFile+'.tmp',statusFile)}
 const expiry=setTimeout(()=>server.close(),30*60*1000);expiry.unref();
 return {server,details};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const statusFile=process.argv[2];if(!statusFile)throw Error('Session status path required');
 await createSession({statusFile,theme:process.argv[3]==='light'?'light':'dark',debugPort:Number(process.env.FADE_PORT||19222)});
}
