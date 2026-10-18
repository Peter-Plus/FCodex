// Capture the actual startup composition without opening a user session.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createTestArea, retireTestArea} from '../tests/work-area.mjs';
import {isolatedStartupPage} from '../startup/isolated-startup-page.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const area = await createTestArea('readme-startup');
const video = await fs.readFile(path.join(root, 'Arts/MilkDragon1.mp4'));
const loop = await fs.readFile(path.join(root, 'Arts/startup-loop.mp4'));
const preset = JSON.parse(await fs.readFile(path.join(root, 'startup/preset.json'), 'utf8'));
const page = isolatedStartupPage(
  await fs.readFile(path.join(root, 'design-previews/startup.html'), 'utf8'),
  preset,
  JSON.parse(await fs.readFile(path.join(root, 'Arts/startup-loop.json'), 'utf8'))
);
const server = http.createServer((req, res) => {
  if (req.url === '/fade-intro.mp4' || req.url === '/fade-loop.mp4') {
    const media = req.url === '/fade-intro.mp4' ? video : loop;
    res.writeHead(200, {'Content-Type': 'video/mp4', 'Content-Length': media.length});
    res.end(media);
  } else if (req.url === '/fade-startup.js') {
    res.setHeader('Content-Type', 'text/javascript');
    res.end('window.fadeStartup={onTarget(){},complete(){}};\n' + page.script);
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.end(page.html);
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--no-first-run', '--autoplay-policy=no-user-gesture-required', '--remote-debugging-port=0', '--user-data-dir=' + area, 'about:blank'
], {stdio: 'ignore', windowsHide: true});
let socket, call;
try {
  let port;
  for (let i = 0; i < 100; i++) {
    try { port = Number((await fs.readFile(path.join(area, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; }
    catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  if (!port) throw Error('Headless Chrome did not start');
  const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, {once:true}));
  let seq = 0;
  const pending = new Map();
  socket.addEventListener('message', e => {
    const message = JSON.parse(e.data), request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    message.error || message.result?.exceptionDetails ? request.reject(Error(JSON.stringify(message))) : request.resolve(message.result);
  });
  call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq; pending.set(id, {resolve,reject}); socket.send(JSON.stringify({id,method,params}));
  });
  await call('Emulation.setDeviceMetricsOverride', {width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate', {url:`http://127.0.0.1:${server.address().port}/`});
  let ready = false;
  for (let i = 0; i < 100; i++) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const result = await call('Runtime.evaluate', {returnByValue:true, expression:`document.body.dataset.phase==='waiting' && Number(getComputedStyle(document.querySelector('.signature')).opacity)>.99`});
    if (result.result.value) { ready = true; break; }
  }
  if (!ready) throw Error('Startup title and orb did not become ready');
  await call('Input.dispatchMouseEvent', {type:'mouseMoved',x:1440*preset.x/100,y:900*preset.y/100});
  await new Promise(resolve => setTimeout(resolve, 500));
  const capture = await call('Page.captureScreenshot', {format:'png'});
  const output = path.join(root, 'Arts/screenshots/startup.png');
  await fs.mkdir(path.dirname(output), {recursive:true});
  await fs.writeFile(output, Buffer.from(capture.data, 'base64'));
  console.log(output);
} finally {
  if (call) { try { await call('Browser.close'); } catch {} }
  socket?.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  await retireTestArea(area, browser);
}
