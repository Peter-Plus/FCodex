param([Parameter(Mandatory=$true)][string]$Directory)
$ErrorActionPreference = 'Stop'
$target = [IO.Path]::GetFullPath($Directory).TrimEnd('\')
if (-not (Test-Path -LiteralPath $target -PathType Container)) { throw 'Log directory does not exist' }
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class FadeLogFolderWindow {
 [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int command);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
 [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
}
'@
$shellApp = New-Object -ComObject Shell.Application
function Find-LogWindow {
 foreach ($window in @($shellApp.Windows())) {
  try {
   $url = [Uri]$window.LocationURL
   if ($url.IsFile -and [IO.Path]::GetFullPath($url.LocalPath).TrimEnd('\') -eq $target) { return $window }
  } catch { }
 }
}
$found = Find-LogWindow
if (-not $found) { $shellApp.Explore($target) }
for ($attempt=0; $attempt -lt 25; $attempt++) {
 if (-not $found) { $found = Find-LogWindow }
 if ($found) {
  $handle = [IntPtr]([long]$found.HWND)
  [FadeLogFolderWindow]::ShowWindowAsync($handle,9) | Out-Null
  [FadeLogFolderWindow]::SetForegroundWindow($handle) | Out-Null
  Start-Sleep -Milliseconds 100
  if ([FadeLogFolderWindow]::IsWindowVisible($handle)) { exit 0 }
 }
 Start-Sleep -Milliseconds 100
}
throw 'File Explorer did not display the log directory'
