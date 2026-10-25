import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

export const supportedArchiveHash='beb6d4c814d5ab5691135d8c6c1ba77834de0476cf049f2bb7b3e182928c822c';
const digest=data=>createHash('sha256').update(data).digest('hex');

// Recovery accepts only a completed, previously supported build with intact files.
export async function verifyRuntimeFallback(runtimeRoot){
 const destination=path.resolve(runtimeRoot,'app');
 const build=JSON.parse(await fs.readFile(path.join(runtimeRoot,'build.json'),'utf8'));
 if(build.revision!==6||build.oldHash!==supportedArchiveHash||build.diagnosticRevision||path.resolve(build.destination)!==destination||!Array.isArray(build.files)||!build.files.length)throw Error('No supported completed runtime is available');
 const archive=await fs.open(path.join(destination,'resources/app.asar'),'r');
 try{
  const prefix=Buffer.alloc(16);await archive.read(prefix,0,16,0);
  const length=prefix.readUInt32LE(12),offset=8+prefix.readUInt32LE(4),size=(await archive.stat()).size;
  if(!length||length>64*1024*1024||offset<16+length||offset>size)throw Error('Invalid cached ASAR header');
  const header=Buffer.alloc(length);await archive.read(header,0,length,16);
  if(digest(header)!==build.newHash)throw Error('Cached ASAR header integrity mismatch');
  const exe=await fs.readFile(path.join(destination,'ChatGPT.exe'));
  const position=exe.indexOf(build.newHash);
  if(position<0||exe.indexOf(build.newHash,position+1)!==-1)throw Error('Cached executable ASAR digest mismatch');
  const seen=new Set(),signedFiles=[],buffer=Buffer.alloc(4*1024*1024);
  async function walk(tree,parents=[]){
   for(const [name,entry]of Object.entries(tree.files)){
    if(!name||name==='.'||name==='..'||/[\\/:]/.test(name))throw Error('Invalid cached archive path');
    const parts=[...parents,name];
    if(entry.files){await walk(entry,parts);continue}
    if(entry.link||entry.integrity?.algorithm!=='SHA256'||!Number.isSafeInteger(entry.size)||entry.size<0)throw Error('Unsupported cached archive entry');
    const start=entry.unpacked?0:offset+Number(entry.offset);
    if(!Number.isSafeInteger(start)||start<0||(!entry.unpacked&&(start<offset||start+entry.size>size)))throw Error('Invalid cached archive bounds');
    const unpackedPath=path.join(destination,'resources/app.asar.unpacked',...parts);
    const file=entry.unpacked?await fs.open(unpackedPath,'r'):archive;
    try{
     const hash=createHash('sha256');
     const actualSize=entry.unpacked?(await file.stat()).size:entry.size;
     let pe=false;
     for(let at=0;at<actualSize;){const wanted=Math.min(buffer.length,actualSize-at),{bytesRead}=await file.read(buffer,0,wanted,start+at);if(!bytesRead)throw Error('Truncated cached file');if(at===0)pe=buffer[0]===77&&buffer[1]===90;hash.update(buffer.subarray(0,bytesRead));at+=bytesRead}
     if(hash.digest('hex')!==entry.integrity.hash){
      // Store signing happens after ASAR packing: native PE files have a
      // certificate appended, so their pre-signing ASAR hashes no longer match.
      if(entry.unpacked&&pe&&/\.(node|dll|exe)$/i.test(name))signedFiles.push(unpackedPath);
      else throw Error('Cached file integrity mismatch: '+parts.join('/'));
     }
    }finally{if(entry.unpacked)await file.close()}
    seen.add(parts.join('/'));
   }
  }
  await walk(JSON.parse(header));
  if(signedFiles.length){
   execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',
    '$ErrorActionPreference="Stop"; Import-Module "$PSHOME/Modules/Microsoft.PowerShell.Security/Microsoft.PowerShell.Security.psd1" -ErrorAction Stop; foreach ($file in ($env:FADE_VERIFY_SIGNED_FILES | ConvertFrom-Json)) { $signature=Get-AuthenticodeSignature -LiteralPath $file; if ($signature.Status -ne "Valid" -or $signature.SignerCertificate.Subject -notmatch \'^CN="?OpenAI OpCo, LLC"?,\') { throw "Invalid OpenAI signature: $file" } }'
   ],{env:{...process.env,FADE_VERIFY_SIGNED_FILES:JSON.stringify(signedFiles)},windowsHide:true,stdio:'pipe'});
  }
  if(build.files.some(name=>!seen.has(name)))throw Error('Cached patched asset missing');
  return {source:build.source,files:seen.size};
 }finally{await archive.close()}
}
