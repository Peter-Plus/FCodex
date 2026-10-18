import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
const page=new URL('./startup.html',import.meta.url);
http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path==='/Arts/MilkDragon1.mp4'){
  try{
   const file=new URL('../Arts/MilkDragon1.mp4',import.meta.url),{size}=await stat(file);
   const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
   const start=range?Number(range[1]):0,end=range&&range[2]?Math.min(Number(range[2]),size-1):size-1;
   if(start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return}
   res.writeHead(range?206:200,{'Content-Type':'video/mp4','Accept-Ranges':'bytes','Content-Length':end-start+1,...(range?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})});
   if(req.method==='HEAD'){res.end();return}
   createReadStream(file,{start,end}).pipe(res);
  }catch{res.writeHead(500);res.end('Video unavailable')}
  return;
 }
 if(!['/','/startup.html'].includes(path)){res.writeHead(404);res.end();return}
 try{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(await readFile(page))}catch{res.writeHead(500);res.end('Preview unavailable')}
}).listen(19227,'127.0.0.1',()=>console.log('Startup preview: http://127.0.0.1:19227'));
