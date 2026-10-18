import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createMediaServer} from './startup-media-server.mjs';

test('startup media streams original bytes, supports seeks and exposes only selected assets',async t=>{
 const media=await createMediaServer();t.after(()=>media.close());
 for(const [url,file] of [[media.intro,'MilkDragon1.mp4'],[media.loop,'startup-loop.mp4']]){
  const original=await fs.readFile(new URL('../Arts/'+file,import.meta.url));
  const response=await fetch(url,{headers:{Range:'bytes=17-48'}});
  assert.equal(response.status,206);assert.equal(response.headers.get('access-control-allow-origin'),'*');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),original.subarray(17,49));
  assert.equal((await fetch(url,{method:'HEAD'})).headers.get('content-length'),String(original.length));
  for(const range of ['bytes=999999999-','bytes=20-10','nonsense'])assert.equal((await fetch(url,{headers:{Range:range}})).status,416);
 }
 assert.equal((await fetch(new URL('/intro',media.intro))).status,404);
 assert.equal((await fetch(media.intro+'/other')).status,404);
 assert.equal((await fetch(media.intro,{method:'POST'})).status,405);
});

test('baked loop corresponds to the source and approved loop boundaries',async()=>{
 const manifest=JSON.parse(await fs.readFile(new URL('../Arts/startup-loop.json',import.meta.url)));
 const preset=JSON.parse(await fs.readFile(new URL('../startup/preset.json',import.meta.url)));
 assert.equal(manifest.from,preset.loopFrom);assert.equal(manifest.to,preset.loopTo);
 assert.equal(manifest.duration,2*(preset.loopTo-preset.loopFrom));
 for(const [file,key] of [['MilkDragon1.mp4','sourceHash'],['startup-loop.mp4','loopHash']]){
  const bytes=await fs.readFile(new URL('../Arts/'+file,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest[key]);
 }
});
