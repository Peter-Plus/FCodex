import http from 'node:http';
import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {randomBytes} from 'node:crypto';

// Browser-test fixture only. Production uses the client's app:// resource handler.
export async function createMediaServer(){
 const token=randomBytes(24).toString('hex');
 const files=new Map([['intro',new URL('../Arts/MilkDragon1.mp4',import.meta.url)],['loop',new URL('../Arts/startup-loop.mp4',import.meta.url)]]);
 const sizes=new Map(await Promise.all([...files].map(async([key,file])=>[key,(await stat(file)).size])));
 const server=http.createServer((req,res)=>{
  const key=req.url?.startsWith(`/${token}/`)?req.url.slice(token.length+2):'';
  if(!files.has(key)){res.writeHead(404);res.end();return}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  const size=sizes.get(key),range=req.headers.range;
  const match=range?.match(/^bytes=(\d+)-(\d*)$/);
  const start=match?Number(match[1]):0,end=match?.[2]?Math.min(Number(match[2]),size-1):size-1;
  if((range&&!match)||!Number.isSafeInteger(start)||start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return}
  res.writeHead(match?206:200,{'Content-Type':'video/mp4','Access-Control-Allow-Origin':'*','Cross-Origin-Resource-Policy':'cross-origin','Cache-Control':'private, max-age=3600','Accept-Ranges':'bytes','Content-Length':end-start+1,...(match?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})});
  if(req.method==='HEAD'){res.end();return}
  const stream=createReadStream(files.get(key),{start,end});
  stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 const base=`http://127.0.0.1:${server.address().port}/${token}`;
 return {intro:base+'/intro',loop:base+'/loop',close(){server.closeAllConnections();server.close()}};
}
