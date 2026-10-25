import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createTestArea,retireTestArea} from './work-area.mjs';

test('unknown builds proceed to actual structure checks in normal and diagnostic modes',async()=>{
 const area=await createTestArea('runtime-unknown-build');
 try{
  const manifestPath=path.join(area,'manifest.json');
  const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
  await fs.writeFile(manifestPath,JSON.stringify({...manifest,rebuildCommand:'node --test tests/runtime-unknown-build.test.mjs'},null,2));
  const source=path.join(area,'official'),resources=path.join(source,'resources');
  await fs.mkdir(resources,{recursive:true});
  const header=Buffer.from(JSON.stringify({files:{}})),padded=Math.ceil(header.length/4)*4;
  const archive=Buffer.alloc(16+padded);
  archive.writeUInt32LE(4,0);archive.writeUInt32LE(8+padded,4);archive.writeUInt32LE(4+padded,8);archive.writeUInt32LE(header.length,12);header.copy(archive,16);
  const archivePath=path.join(resources,'app.asar');
  await fs.writeFile(archivePath,archive);
  for(const flags of [[],['--diagnostic-hold']]){
   const result=spawnSync(process.execPath,['startup/build-runtime.mjs',source,'--verify-only',...flags],{cwd:fileURLToPath(new URL('../',import.meta.url)),encoding:'utf8',windowsHide:true,timeout:30000});
   assert.ifError(result.error);
   assert.equal(result.status,1);
   assert.match(result.stdout,/Attempting to build Fade against the installed client/);
   assert.match(result.stderr,/Missing Codex archive entry: \.vite\/build/);
   assert.doesNotMatch(result.stderr,/not been validated|unsupported and the previous/);
   assert.deepEqual(await fs.readFile(archivePath),archive);
  }
 }finally{await retireTestArea(area)}
});
