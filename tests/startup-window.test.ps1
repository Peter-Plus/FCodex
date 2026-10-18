$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot '..\startup\window.ps1')
Initialize-FadeWindowApi
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class FadeWindowProbe {
 [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left,Top,Right,Bottom; }
 [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd,out Rect rect);
 [DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr hwnd,int index);
 [DllImport("user32.dll")] public static extern bool GetLayeredWindowAttributes(IntPtr hwnd,out uint color,out byte alpha,out uint flags);
}
'@
$probeForm = New-Object System.Windows.Forms.Form
try {
 $handle=$probeForm.Handle
 $originalStyle=[FadeWindowProbe]::GetWindowLong($handle,-20)
 $initialForeground=[FadeStartupWindow]::GetForegroundWindow()
 for ($iteration=0;$iteration -lt 2;$iteration++) {
  if ($iteration -eq 1) { $probeForm.Opacity=0.75; $originalStyle=[FadeWindowProbe]::GetWindowLong($handle,-20) }
  if (-not [FadeStartupWindow]::ConcealApp($handle)) { throw 'Conceal failed' }
  [uint32]$color=0; [byte]$alpha=255; [uint32]$flags=0
  if (-not [FadeWindowProbe]::GetLayeredWindowAttributes($handle,[ref]$color,[ref]$alpha,[ref]$flags) -or $alpha -ne 0) { throw 'Window is not transparent' }
  if (-not [FadeStartupWindow]::MaximizeApp($handle)) { throw 'Destination did not maximize' }
  if ([FadeStartupWindow]::GetForegroundWindow() -ne $initialForeground) { throw 'Background destination stole focus' }
  [FadeStartupWindow]::ShowWindow($handle,0) | Out-Null
  [FadeStartupWindow]::ConcealApp($handle) | Out-Null
  [FadeStartupWindow]::RevealApp($handle)
  [FadeStartupWindow]::RevealApp($handle)
  if ([FadeWindowProbe]::GetWindowLong($handle,-20) -ne $originalStyle) { throw 'Window style was not restored' }
  if ($iteration -eq 1) {
   [FadeWindowProbe]::GetLayeredWindowAttributes($handle,[ref]$color,[ref]$alpha,[ref]$flags) | Out-Null
   if ($alpha -ne [byte](255*0.75)) { throw 'Original opacity was not restored' }
  }
 }
} finally { [FadeStartupWindow]::RevealApp($probeForm.Handle); $probeForm.Dispose() }
$surfaceForm=New-Object System.Windows.Forms.Form
try {
 $surfaceHandle=$surfaceForm.Handle
 [FadeStartupWindow]::Opacity($surfaceHandle,0) | Out-Null
 $foreground=[FadeStartupWindow]::GetForegroundWindow()
 if (-not [FadeStartupWindow]::ConfigureSurface($surfaceHandle,[IntPtr]::Zero)) { throw 'Surface configuration failed' }
 $surfaceStyle=[FadeWindowProbe]::GetWindowLong($surfaceHandle,-20)
 if (($surfaceStyle -band 0x80) -eq 0 -or ($surfaceStyle -band 0x40000) -ne 0) { throw 'Surface still advertises a taskbar window' }
 if (([FadeWindowProbe]::GetWindowLong($surfaceHandle,-16) -band 0x00CF0000) -ne 0) { throw 'Browser frame remains visible' }
 $area=[System.Windows.Forms.Screen]::FromHandle($surfaceHandle).WorkingArea
 $rect=New-Object FadeWindowProbe+Rect
 [FadeWindowProbe]::GetWindowRect($surfaceHandle,[ref]$rect) | Out-Null
 if ($rect.Left -ne $area.Left -or $rect.Top -ne $area.Top -or $rect.Right -ne $area.Right -or $rect.Bottom -ne $area.Bottom) { throw 'Surface does not respect the taskbar work area' }
 if ([FadeStartupWindow]::GetForegroundWindow() -ne $foreground) { throw 'Surface stole focus' }
} finally { $surfaceForm.Dispose() }
if ([FadeStartupWindow]::FindAppWindow(-1) -ne [IntPtr]::Zero) { throw 'Unexpected window match for nonexistent process' }
Get-Process -Name ChatGPT,Codex -ErrorAction SilentlyContinue | ForEach-Object {
 $handle = [FadeStartupWindow]::FindAppWindow($_.Id)
 if ($handle -ne [IntPtr]::Zero) {
  [uint32]$ownerId = 0
  [FadeStartupWindow]::GetWindowThreadProcessId($handle,[ref]$ownerId) | Out-Null
  if ($ownerId -ne $_.Id) { throw 'Window owner mismatch' }
  Write-Output "Verified window owner: $ownerId (handle $handle)"
 }
}
$parseErrors = $null
[System.Management.Automation.Language.Parser]::ParseFile((Join-Path $PSScriptRoot '..\launcher.ps1'),[ref]$null,[ref]$parseErrors) | Out-Null
if ($parseErrors) { throw $parseErrors }
Write-Output 'Window API compilation, owner checks and launcher syntax passed'
