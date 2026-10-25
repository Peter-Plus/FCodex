import {createTestArea,retireTestArea} from './work-area.mjs';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const area=await createTestArea('notification-registration');
const root=process.cwd();
const quote=s=>"'"+s.replaceAll("'","''")+"'";
try{
 const exe=path.join(root,'.fade-runtime-isolated/app/ChatGPT.exe');
 const script=path.join(root,'startup/register-notifications.ps1');
 const probe=path.join(area,'verify.ps1');
 await fs.writeFile(probe,`$ErrorActionPreference='Stop'
& ${quote(script)} -Executable ${quote(exe)} -ProgramsDirectory ${quote(area)} | Out-Null
& ${quote(script)} -Executable ${quote(exe)} -ProgramsDirectory ${quote(area)} | Out-Null
$link=${quote(path.join(area,'FCodex.lnk'))}
$shell=New-Object -ComObject WScript.Shell
$shortcut=$shell.CreateShortcut($link)
try { @{target=$shortcut.TargetPath;arguments=$shortcut.Arguments;appId=[FadeTaskbarProperties]::ReadShortcutId($link);count=@(Get-ChildItem -LiteralPath ${quote(area)} -Filter '*.lnk').Count} | ConvertTo-Json -Compress }
finally { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($shortcut);[void][Runtime.InteropServices.Marshal]::ReleaseComObject($shell) }
`);
 const output=execFileSync('powershell.exe',['-NoProfile','-File',probe],{encoding:'utf8',windowsHide:true});
 const result=JSON.parse(output.trim().split(/\r?\n/).at(-1));
 assert.equal(path.resolve(result.target).toLowerCase(),path.resolve(exe).toLowerCase());
 assert.equal(result.arguments,'');assert.equal(result.appId,'FCodex.Purple.Desktop');assert.equal(result.count,1);
 await fs.writeFile(path.join(area,'result.json'),JSON.stringify(result,null,2));
 console.log('Passed notification shortcut identity, direct Electron target, and repeat registration.');
}finally{await retireTestArea(area)}
