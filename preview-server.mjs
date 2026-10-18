import http from 'node:http';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const allowed=new Map([['/','preview.html'],['/fade.js','fade.js'],['/theme.css','theme.css']]);
http.createServer(async(req,res)=>{const name=allowed.get(new URL(req.url,'http://localhost').pathname);if(!name){res.writeHead(404);res.end();return}try{res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(await fs.readFile(fileURLToPath(new URL(name,import.meta.url))))}catch{res.writeHead(500);res.end('Read failed')}}).listen(19223,'127.0.0.1',()=>console.log('Fade preview: http://127.0.0.1:19223 — Ctrl+C to stop'));
