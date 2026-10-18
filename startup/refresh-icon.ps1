$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$iconPath = Join-Path $root 'Arts\fade-codex.ico'
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class FadeIconRefresh {
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern IntPtr LoadImage(IntPtr h,string name,uint type,int x,int y,uint flags);
 [DllImport("user32.dll")] public static extern IntPtr SendMessageTimeout(IntPtr w,uint m,IntPtr p,IntPtr l,uint flags,uint timeout,out IntPtr result);
 [DllImport("shell32.dll")] public static extern void SHChangeNotify(uint e,uint f,IntPtr a,IntPtr b);
}
'@
$appDir = [IO.Path]::GetFullPath((Join-Path $root '.fade-runtime-isolated\app')) + '\'
$updatedProcesses=@()
foreach ($process in (Get-Process -Name ChatGPT,Codex -ErrorAction SilentlyContinue)) {
 if (-not $process.Path -or -not $process.Path.StartsWith($appDir,[StringComparison]::OrdinalIgnoreCase) -or $process.MainWindowHandle -eq 0) { continue }
 foreach ($item in @(@(0,32),@(1,256))) {
  # LR_LOADFROMFILE. Handles must stay alive while the window uses them.
  $icon = [FadeIconRefresh]::LoadImage([IntPtr]::Zero,$iconPath,1,$item[1],$item[1],16)
  if ($icon -eq [IntPtr]::Zero) { throw 'Could not load application icon' }
  $result=[IntPtr]::Zero
  $ok=[FadeIconRefresh]::SendMessageTimeout($process.MainWindowHandle,128,[IntPtr]$item[0],$icon,2,2000,[ref]$result)
  if ($ok -eq [IntPtr]::Zero) { throw 'Window icon update timed out' }
  $actual=[IntPtr]::Zero
  [void][FadeIconRefresh]::SendMessageTimeout($process.MainWindowHandle,127,[IntPtr]$item[0],[IntPtr]::Zero,2,2000,[ref]$actual)
  if ($actual -ne $icon) { throw 'Window did not retain the requested icon' }
 }
 Write-Output "Updated Fade window icon: $($process.Id)"
 $updatedProcesses+=$process
}
[FadeIconRefresh]::SHChangeNotify(0x08000000,0,[IntPtr]::Zero,[IntPtr]::Zero)
# HICONs belong to this process. Keep the helper alive until the target exits.
foreach($target in $updatedProcesses){try{$target.WaitForExit()}catch{}}
