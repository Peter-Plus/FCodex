// Build-time only: node startup/bake-loop.mjs <path-to-ffmpeg>
import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const preset=JSON.parse(await fs.readFile(new URL('preset.json',import.meta.url)));
const input=new URL('../Arts/MilkDragon1.mp4',import.meta.url);
const {fileURLToPath}=await import('node:url');
const duration=preset.loopTo-preset.loopFrom;
// Match the old 30 fps cache and its resolution budget. Reverse first, then forward.
const width=Math.round(1280/Math.sqrt(Math.max(1,duration)));
const height=Math.round(720/Math.sqrt(Math.max(1,duration))/2)*2;
const filter=`[0:v]trim=start=${preset.loopFrom}:end=${preset.loopTo},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=0.1,fps=30,trim=duration=${duration},scale=${width}:${height},setdar=16/9,split[a][b];[a]reverse[r];[r][b]concat=n=2:v=1:a=0[out]`;
const output=new URL('../Arts/startup-loop.mp4',import.meta.url);
const result=spawnSync(process.argv[2]||'ffmpeg',['-hide_banner','-loglevel','error','-y','-i',fileURLToPath(input),'-filter_complex',filter,'-map','[out]','-an','-c:v','libx264','-crf','12','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart',fileURLToPath(output)],{stdio:'inherit'});
if(result.error)throw result.error;if(result.status!==0)throw Error('Loop bake failed');
const sha=b=>createHash('sha256').update(b).digest('hex');
await fs.writeFile(new URL('../Arts/startup-loop.json',import.meta.url),JSON.stringify({from:preset.loopFrom,to:preset.loopTo,duration:duration*2,fps:30,width,height,sourceHash:sha(await fs.readFile(input)),loopHash:sha(await fs.readFile(output))},null,2)+'\n');
console.log('Baked startup loop; ordinary launches do not run ffmpeg.');
