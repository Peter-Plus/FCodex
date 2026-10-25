import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyRuntimeFallback} from './runtime-fallback.mjs';

// Check all patches before touching a usable runtime. Never fall back after a
// failed write: the existing files may already have been partially replaced.
export async function prepareRuntime(source,{diagnostic=false,verifyOnly=false,run,verify=verifyRuntimeFallback,log=console.log}={}){
 if(!source)throw Error('Pass the official app directory');
 const args=[source,...(diagnostic?['--diagnostic-hold']:[])];
 const execute=run??(flags=>{
  const result=spawnSync(process.execPath,[fileURLToPath(new URL('./build-runtime.mjs',import.meta.url)),...flags],{stdio:'inherit',windowsHide:true});
  if(result.error)throw result.error;
  return result.status??1;
 });
 const checked=await execute([...args,'--verify-only']);
 if(checked!==0){
  if(diagnostic||verifyOnly)throw Error('Installed Codex runtime checks failed; see the specific error above. No runtime files changed.');
  log('Installed Codex runtime checks failed. Checking the previous Fade runtime before recovery...');
  let cached;
  try{cached=await verify('.fade-runtime-isolated')}
  catch(error){throw Error('Installed Codex runtime checks failed and recovery is unavailable: '+error.message+'. No runtime files changed. Launch the official app or update Fade.')}
  log('Using the verified previous Fade runtime: '+cached.source);
  log('Verified '+cached.files+' archive entries and executable integrity. This session uses the previous Codex version; newer native features need a Fade update.');
  return 'fallback';
 }
 if(verifyOnly)return 'verified';
 if(await execute(args)!==0)throw Error('Fade runtime build failed after validation. Recovery was not attempted because runtime files may have changed.');
 return 'built';
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{await prepareRuntime(process.argv[2],{diagnostic:process.argv.includes('--diagnostic-hold'),verifyOnly:process.argv.includes('--verify-only')})}
 catch(error){console.error(error.message);process.exitCode=1}
}
