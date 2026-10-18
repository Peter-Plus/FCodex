import {createTestArea,retireTestArea} from './work-area.mjs';
// Isolated headless browser integration; never touches the user's active window.
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {installInPage} from '../startup/in-page.mjs';
import {command} from '../startup/session.mjs';
import {createMediaServer} from './startup-media-server.mjs';
const profile=await createTestArea('startup-media-browser');
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--disable-background-timer-throttling','--autoplay-policy=no-user-gesture-required','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let startup,port,media;
try{
 for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await delay(100)}}
 assert.ok(port,'browser started');
 const targets=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();
 const target=targets.find(t=>t.type==='page');
 const evaluate=async expression=>(await command(target,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
 await evaluate(`window.coverEvents=[];window.__fadeCodex={prepareStartupHome:()=>({x:.5,y:.4,size:94,width:1280}),setStartupCovered(value){coverEvents.push({value,overlay:!!document.getElementById('fade-startup-frame')})}}`);
 media=await createMediaServer();startup=await installInPage(target,media);await startup.tick();
 let state;
 for(let i=0;i<120;i++){
  state=await evaluate(`(()=>{const d=document.getElementById('fade-startup-frame').contentDocument;return {phase:d.body.dataset.phase,videos:[...d.querySelectorAll('video')].map(v=>({src:v.src,time:v.currentTime,error:v.error?.message,paused:v.paused,rate:v.playbackRate,visible:getComputedStyle(v).display!=='none'&&getComputedStyle(v).visibility!=='hidden'})),canvases:d.querySelectorAll('canvas').length}})()`);
  if(state.phase==='waiting'&&state.videos[1]?.time>.15)break;
  await delay(100);
 }
 assert.equal(state.phase,'waiting');assert.equal(state.videos.length,2);
 assert.ok(state.videos.every(v=>v.src.startsWith('http://127.0.0.1:')&&!v.error));
 assert.equal(state.videos[0].paused,true);assert.equal(state.videos[1].visible,true);assert.equal(state.videos[1].rate,.7);
 assert.ok(state.videos[1].time>.15);console.log('Loop playback:',JSON.stringify(state));
 assert.deepEqual(await evaluate(`['scene','orbLight'].map(id=>document.getElementById('fade-startup-frame').contentDocument.getElementById(id).style.willChange)`),['contents','contents']);
 // Observe a complete wrap at the approved playback speed before departure.
 await delay(3700);
 assert.equal(await evaluate(`(()=>{const v=document.getElementById('fade-startup-frame').contentDocument.querySelectorAll('video')[1];return !v.paused&&!v.ended&&v.currentTime<v.duration})()`),true);
 await evaluate(`document.getElementById('fade-startup-frame').contentDocument.getElementById('core').click()`);
 for(let i=0;i<60;i++){if(await startup.tick())break;await delay(100)}
 assert.equal(await evaluate('window.__fadeInPageState.done'),true);
 assert.deepEqual(await evaluate('coverEvents'),[{value:true,overlay:true},{value:false,overlay:true}]);
 console.log('Departure, glitch sampling and handoff completed.');
 await startup.dispose();
 await evaluate('coverEvents=[]');
 startup=await installInPage(target,media);
 await evaluate(`document.getElementById('fade-startup-frame').contentWindow.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))`);
 for(let i=0;i<30;i++){if(await startup.tick())break;await delay(50)}
 assert.equal(await evaluate('window.__fadeInPageState.done'),true);
 assert.deepEqual(await evaluate('coverEvents'),[{value:true,overlay:true},{value:false,overlay:true}]);
 await startup.dispose();await evaluate('coverEvents=[]');
 startup=await installInPage(target,media);await startup.dispose();startup=null;
 assert.deepEqual(await evaluate('coverEvents'),[{value:true,overlay:true},{value:false,overlay:true}]);
 console.log('Escape and explicit cleanup restore orb drawing before removing the cover.');
}finally{
 await startup?.dispose();
 media?.close();
 if(port){try{const info=await(await fetch(`http://127.0.0.1:${port}/json/version`)).json();await command({webSocketDebuggerUrl:info.webSocketDebuggerUrl},'Browser.close')}catch{}}
 await retireTestArea(profile,browser);
}
