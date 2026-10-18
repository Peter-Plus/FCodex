import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../.work/',import.meta.url));

export async function createTestArea(name){
 if(!/^[a-z0-9-]+$/.test(name))throw Error('Invalid test area name');
 const parent=path.join(root,'active');await fs.mkdir(parent,{recursive:true});
 const dir=await fs.mkdtemp(path.join(parent,name+'-'));
 await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify({purpose:name,createdAt:new Date().toISOString(),status:'active',safeToDelete:false,rebuildCommand:'Rerun the corresponding tests/ browser or Electron script'},null,2));
 return dir;
}

// Only retire the directory after this task's direct child has exited. Browser
// descendants may outlive it, so retired runs require review, never blind cleanup.
export async function retireTestArea(dir,child){
 const resolved=path.resolve(dir);
 if(path.dirname(resolved)!==path.join(root,'active'))throw Error('Unexpected test area');
 if((await fs.lstat(resolved)).isSymbolicLink())throw Error('Linked test area');
 if(child?.pid&&child.exitCode===null&&child.signalCode===null){
  const waitForExit=()=>new Promise(resolve=>{if(child.exitCode!==null||child.signalCode!==null)return resolve();const timer=setTimeout(done,3000);function done(){clearTimeout(timer);child.off('exit',done);resolve()}child.once('exit',done)});
  await waitForExit();
  if(child.exitCode===null&&child.signalCode===null){child.kill();await waitForExit()}
  if(child.exitCode===null&&child.signalCode===null){console.warn('Test process still active; kept '+dir);return}
 }
 const manifest=JSON.parse(await fs.readFile(path.join(dir,'manifest.json'),'utf8'));
 Object.assign(manifest,{status:'completed',safeToDelete:false,cleanupNote:'Check remaining descendant processes before deleting browser/runtime files.'});
 await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
 const destination=path.join(root,'review','test-runs');await fs.mkdir(destination,{recursive:true});
 for(let attempt=0;attempt<12;attempt++){
  try{await fs.rename(resolved,path.join(destination,path.basename(resolved)));return}
  catch(error){
   if(!['EPERM','EBUSY','EACCES'].includes(error.code))throw error;
   await new Promise(resolve=>setTimeout(resolve,250));
  }
 }
 manifest.cleanupNote='Directory is still locked; retained in active for later process/lock inspection.';
 await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
 console.warn('Could not archive locked test directory; retained safely: '+dir);
}
