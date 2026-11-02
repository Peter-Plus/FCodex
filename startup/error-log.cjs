// Error-only, bounded, asynchronous local diagnostics. No idle timer or I/O.
const fs=require('node:fs/promises');
const path=require('node:path');
function clean(value,limit=4000){
 return (typeof value==='string'?value:'').slice(0,limit)
  .replace(/\b(Bearer\s+)[\w.\-]+/gi,'$1[redacted]')
  .replace(/\b(sk-[\w-]+|eyJ[\w-]+\.[\w-]+\.[\w-]+)\b/g,'[redacted]')
  .replace(/((?:authorization|cookie|password|token|api[_-]?key)\s*[=:]\s*)[^\s,;]+/gi,'$1[redacted]')
  .replace(/(https?:\/\/[^\s?#]+)[?#][^\s)]+/g,'$1?[redacted]')
  .replace(/([A-Z]:\\Users\\)[^\\\s]+/gi,'$1[user]');
}
function createErrorLog({directory,metadata={},maxBytes=2*1024*1024,io=fs,now=Date.now}){
 const file=path.join(directory,'errors.jsonl'),queue=[],recent=new Map();
 let timer=null,flight=null,retryAt=0,windowAt=0,accepted=0,dropped=0;
 function report(operation,error){
  try{
   const time=now();if(time<retryAt)return;
   if(time-windowAt>=60000){windowAt=time;accepted=0}
   if(accepted>=60||queue.length>=32){dropped++;return}
   const item={operation:clean(operation,120),uiRevision:clean(error?.uiRevision,64),name:clean(error?.name,80),message:clean(typeof error==='string'?error:error?.message),stack:clean(error?.stack,6000)};
   const key=item.operation+'\n'+item.message,previous=recent.get(key);
   if(previous&&time-previous.at<60000){previous.count++;return}
   item.suppressedRepeats=previous?.count||0;
   if(recent.size>=128)recent.delete(recent.keys().next().value);
   recent.set(key,{at:time,count:0});accepted++;
   queue.push(JSON.stringify({time:new Date(time).toISOString(),...metadata,...item,droppedSinceLastRecord:dropped})+'\n');dropped=0;
   if(!timer&&!flight){timer=setTimeout(()=>{timer=null;void flush()},100);timer.unref?.()}
  }catch{/* Logging must never become an application failure. */}
 }
 async function flush(){
  if(timer){clearTimeout(timer);timer=null}
  if(flight)return flight;
  if(!queue.length)return;
  flight=(async()=>{
   try{
    await io.mkdir(directory,{recursive:true});
    while(queue.length){
     const batch=queue.splice(0).join('');
     let size=0;try{size=(await io.stat(file)).size}catch(error){if(error.code!=='ENOENT')throw error}
     if(size+Buffer.byteLength(batch)>maxBytes){
      await io.rm(file+'.1',{force:true});
      try{await io.rename(file,file+'.1')}catch(error){if(error.code!=='ENOENT')throw error}
     }
     await io.appendFile(file,batch,'utf8');
    }
   }catch{queue.length=0;retryAt=now()+30000}
   finally{flight=null}
  })();
  return flight;
 }
 return {report,flush};
}
module.exports={createErrorLog,clean};
