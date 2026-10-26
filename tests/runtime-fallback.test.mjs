import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createTestArea,retireTestArea} from './work-area.mjs';
import {supportedArchiveHash,supportedArchiveHashes,verifyRuntimeFallback} from '../startup/runtime-fallback.mjs';
import {currentArchiveHash} from '../startup/client-261021-patch.mjs';
const hash=data=>createHash('sha256').update(data).digest('hex');

test('fallback accepts a complete old build and rejects damaged or unsupported copies',async()=>{
 const root=await createTestArea('runtime-fallback');
 try{
  const manifestPath=path.join(root,'manifest.json'),manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
  await fs.writeFile(manifestPath,JSON.stringify({...manifest,rebuildCommand:'node --test tests/runtime-fallback.test.mjs'},null,2));
  const app=path.join(root,'app'),resources=path.join(app,'resources');
  await fs.mkdir(path.join(resources,'app.asar.unpacked'),{recursive:true});
  const data=Buffer.from('working native code'),native=Buffer.from('native library');
  const header=Buffer.from(JSON.stringify({files:{'main.js':{size:data.length,offset:'0',integrity:{algorithm:'SHA256',hash:hash(data)}},'native.node':{size:native.length,unpacked:true,integrity:{algorithm:'SHA256',hash:hash(native)}}}}));
  const padded=Math.ceil(header.length/4)*4,prefix=Buffer.alloc(16+padded);
  prefix.writeUInt32LE(4,0);prefix.writeUInt32LE(8+padded,4);prefix.writeUInt32LE(4+padded,8);prefix.writeUInt32LE(header.length,12);header.copy(prefix,16);
  const archive=Buffer.concat([prefix,data]),exe=Buffer.from('exe:'+hash(header));
  const build={revision:6,oldHash:supportedArchiveHash,newHash:hash(header),destination:app,source:'supported-client',files:['main.js']};
  async function reset(){await fs.writeFile(path.join(root,'build.json'),JSON.stringify(build));await fs.writeFile(path.join(resources,'app.asar'),archive);await fs.writeFile(path.join(resources,'app.asar.unpacked/native.node'),native);await fs.writeFile(path.join(app,'ChatGPT.exe'),exe)}
  await reset();assert.equal((await verifyRuntimeFallback(root)).files,2);
  assert.ok(supportedArchiveHashes.has(currentArchiveHash));
  await fs.writeFile(path.join(root,'build.json'),JSON.stringify({...build,oldHash:currentArchiveHash}));
  assert.equal((await verifyRuntimeFallback(root)).files,2);
  const corrupt=Buffer.from(archive);corrupt[corrupt.length-1]^=1;await fs.writeFile(path.join(resources,'app.asar'),corrupt);await assert.rejects(verifyRuntimeFallback(root),/file integrity mismatch/);
  await reset();await fs.writeFile(path.join(resources,'app.asar.unpacked/native.node'),Buffer.alloc(native.length));await assert.rejects(verifyRuntimeFallback(root),/file integrity mismatch/);
  await reset();await fs.writeFile(path.join(app,'ChatGPT.exe'),'wrong executable');await assert.rejects(verifyRuntimeFallback(root),/executable ASAR digest mismatch/);
  await reset();await fs.writeFile(path.join(root,'build.json'),JSON.stringify({...build,oldHash:'unknown'}));await assert.rejects(verifyRuntimeFallback(root),/No supported completed runtime/);
  await reset();await fs.writeFile(path.join(root,'build.json'),JSON.stringify({...build,files:['missing.js']}));await assert.rejects(verifyRuntimeFallback(root),/patched asset missing/);
  await reset();await fs.writeFile(path.join(root,'build.json'),JSON.stringify({...build,diagnosticRevision:'diagnostic'}));await assert.rejects(verifyRuntimeFallback(root),/No supported completed runtime/);
  await reset();await fs.unlink(path.join(root,'build.json'));await assert.rejects(verifyRuntimeFallback(root),/ENOENT/);
 }finally{await retireTestArea(root)}
});
