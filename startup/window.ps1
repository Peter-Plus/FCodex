# Standalone startup surface. Never terminates Codex or the user's browser.
function Initialize-FadeWindowApi {
 if ('FadeStartupWindow' -as [type]) { return }
 # Windows PowerShell compiles C# through temporary files. Avoid the inherited
 # system TEMP directory, which may be inaccessible to the compiler process.
 $compileDir = Join-Path (Join-Path (Split-Path $PSScriptRoot -Parent) '.work\active\compiler') ('compile-' + [guid]::NewGuid().ToString('N'))
 [System.IO.Directory]::CreateDirectory($compileDir) | Out-Null
 $compiler = New-Object System.CodeDom.Compiler.CompilerParameters
 $compiler.GenerateInMemory = $true
 $compiler.TempFiles = New-Object System.CodeDom.Compiler.TempFileCollection($compileDir, $false)
 try {
 Add-Type -CompilerParameters $compiler -TypeDefinition @'
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public static class FadeStartupWindow {
 public delegate bool Visitor(IntPtr hwnd, IntPtr data);
 [DllImport("user32.dll")] public static extern bool EnumWindows(Visitor visitor, IntPtr data);
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd, StringBuilder text, int count);
 [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
 [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr hwnd);
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern int GetClassName(IntPtr hwnd, StringBuilder text, int count);
 [DllImport("user32.dll")] static extern IntPtr GetWindow(IntPtr hwnd, uint command);
 [StructLayout(LayoutKind.Sequential)] struct Rect { public int Left, Top, Right, Bottom; }
 [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hwnd, out Rect rect);
 [StructLayout(LayoutKind.Sequential)] struct Point { public int X,Y; }
 [StructLayout(LayoutKind.Sequential)] struct MonitorInfo { public int Size; public Rect Monitor,Work; public uint Flags; }
 [DllImport("user32.dll")] static extern IntPtr MonitorFromWindow(IntPtr hwnd,uint flags);
 [DllImport("user32.dll")] static extern bool GetMonitorInfo(IntPtr monitor,ref MonitorInfo info);
 [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr hwnd,out Rect rect);
 [DllImport("user32.dll")] static extern bool ClientToScreen(IntPtr hwnd,ref Point point);
 [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hwnd, int command);
 [DllImport("user32.dll")] public static extern bool IsZoomed(IntPtr hwnd);
 public static bool MaximizeApp(IntPtr hwnd) {
  if(!IsWindow(hwnd))return false;
  // The app remains WS_EX_NOACTIVATE while concealed.
  ShowWindow(hwnd,3);
  return IsZoomed(hwnd);
 }
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hwnd);
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] static extern int GetWindowLong(IntPtr hwnd, int index);
 [DllImport("user32.dll")] static extern int SetWindowLong(IntPtr hwnd, int index, int value);
 [DllImport("user32.dll")] static extern bool SetLayeredWindowAttributes(IntPtr hwnd, uint color, byte alpha, uint flags);
 [DllImport("user32.dll")] static extern bool GetLayeredWindowAttributes(IntPtr hwnd, out uint color, out byte alpha, out uint flags);
 class SavedWindow { public int Style; public uint Pid, Color, Flags; public byte Alpha; }
 static Dictionary<IntPtr,SavedWindow> concealed=new Dictionary<IntPtr,SavedWindow>();
 public static bool ConcealApp(IntPtr hwnd) {
  if(!IsWindow(hwnd))return false;
  if(concealed.ContainsKey(hwnd))return true;
  var saved=new SavedWindow();saved.Style=GetWindowLong(hwnd,-20);
  GetWindowThreadProcessId(hwnd,out saved.Pid);
  if((saved.Style&0x80000)!=0 && !GetLayeredWindowAttributes(hwnd,out saved.Color,out saved.Alpha,out saved.Flags))return false;
  concealed[hwnd]=saved;
  // Transparent layered windows pass pointer input through while loading.
  SetWindowLong(hwnd,-20,saved.Style|0x80000|0x20|0x08000000);
  if(SetLayeredWindowAttributes(hwnd,0,0,2))return true;
  RevealApp(hwnd);return false;
 }
 public static void RevealApp(IntPtr hwnd) {
  SavedWindow saved;if(!concealed.TryGetValue(hwnd,out saved))return;
  concealed.Remove(hwnd);uint pid;GetWindowThreadProcessId(hwnd,out pid);
  if(!IsWindow(hwnd)||pid!=saved.Pid)return;
  SetLayeredWindowAttributes(hwnd,0,255,2);
  int style=GetWindowLong(hwnd,-20);
  SetWindowLong(hwnd,-20,(style&~(0x80000|0x20|0x08000000))|(saved.Style&(0x80000|0x20|0x08000000)));
  if((saved.Style&0x80000)!=0)SetLayeredWindowAttributes(hwnd,saved.Color,saved.Alpha,saved.Flags);
 }
 [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hwnd, IntPtr after, int x, int y, int cx, int cy, uint flags);
 [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr hwnd, uint msg, IntPtr w, IntPtr l);
 public static IntPtr Find(string title) {
  IntPtr found=IntPtr.Zero;
  EnumWindows((hwnd,data)=>{var text=new StringBuilder(1024);GetWindowText(hwnd,text,1024);if(text.ToString().Contains(title)){found=hwnd;return false;}return true;},IntPtr.Zero);
  return found;
 }
 public static bool ConfigureSurface(IntPtr hwnd,IntPtr destination) {
  if(!IsWindow(hwnd))return false;
  // Remove Edge's caption/borders and its taskbar / Alt+Tab entry before show.
  int ex=GetWindowLong(hwnd,-20),style=GetWindowLong(hwnd,-16);
  if((ex&0x80)==0 || (ex&0x40000)!=0 || (style&0x00C40000)!=0){
   ShowWindow(hwnd,0);
   SetWindowLong(hwnd,-20,(ex|0x80)&~0x40000);
   SetWindowLong(hwnd,-16,(style&~0x00CF0000)|unchecked((int)0x80000000));
  }
  Rect area;
  if(IsWindow(destination)){
   if(!GetClientRect(destination,out area))return false;
   var origin=new Point();if(!ClientToScreen(destination,ref origin))return false;
   area.Right+=origin.X;area.Bottom+=origin.Y;area.Left=origin.X;area.Top=origin.Y;
  }else{
   var info=new MonitorInfo();info.Size=Marshal.SizeOf(typeof(MonitorInfo));
   if(!GetMonitorInfo(MonitorFromWindow(hwnd,2),ref info))return false;
   area=info.Work;
  }
  // Work area/client bounds, never monitor fullscreen. Do not activate.
  return SetWindowPos(hwnd,new IntPtr(-1),area.Left,area.Top,area.Right-area.Left,area.Bottom-area.Top,0x70);
 }
 // Process.MainWindowHandle skips hidden windows. Enumerate the owned Electron
 // application window instead, excluding tool windows and owned popups.
 public static IntPtr FindAppWindow(int processId) {
  IntPtr found=IntPtr.Zero;long largest=0;
  EnumWindows((hwnd,data)=>{
   uint pid;GetWindowThreadProcessId(hwnd,out pid);
   if(pid!=(uint)processId || GetWindow(hwnd,4)!=IntPtr.Zero || (GetWindowLong(hwnd,-20)&0x80)!=0)return true;
   var name=new StringBuilder(256);GetClassName(hwnd,name,256);
   if(name.ToString()!="Chrome_WidgetWin_1")return true;
   Rect r;if(!GetWindowRect(hwnd,out r))return true;
   int width=r.Right-r.Left,height=r.Bottom-r.Top;
   long area=(long)width*height;
   if(width>=500 && height>=350 && area>largest){found=hwnd;largest=area;}
   return true;
  },IntPtr.Zero);
  return found;
 }
 public static bool Opacity(IntPtr hwnd, byte alpha) {
  if(!IsWindow(hwnd)) return false;
  SetWindowLong(hwnd,-20,GetWindowLong(hwnd,-20)|0x80000);
  return SetLayeredWindowAttributes(hwnd,0,alpha,2);
 }
 public static void Close(IntPtr hwnd) { if(IsWindow(hwnd)) PostMessage(hwnd,0x10,IntPtr.Zero,IntPtr.Zero); }
}
'@
 } finally {
  try {
   $compiler.TempFiles.Delete()
   # Non-recursive cleanup: never remove unexpected files.
   [System.IO.Directory]::Delete($compileDir, $false)
  } catch { Write-Warning "Could not clean compiler temporary directory: $compileDir" }
 }
}

function Start-FadeStartup([string]$Node,[string]$Root,[string]$AppDir) {
 Initialize-FadeWindowApi
 $edge = Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'
 if (-not (Test-Path -LiteralPath $edge)) { $edge = Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe' }
 if (-not (Test-Path -LiteralPath $edge)) { throw 'STARTUP_HOST_UNAVAILABLE: Microsoft Edge is required for the video startup window. Use -NoStartup to launch without it.' }
 $theme = 'dark'
 try { if ((Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize').AppsUseLightTheme -eq 1) { $theme = 'light' } } catch {}
 $stateRoot = Join-Path $Root '.work\active\standalone-startup'
 [IO.Directory]::CreateDirectory($stateRoot) | Out-Null
 $stateFile = Join-Path $stateRoot ('state-' + [guid]::NewGuid().ToString('N') + '.json')
 $session = [pscustomobject]@{ Process=$null; StateFile=$stateFile; Window=[IntPtr]::Zero; Control=''; Title=''; AppWindow=[IntPtr]::Zero; AppDir=$AppDir }
 try {
  Hide-FadeDestination $session
  $scriptPath = Join-Path $Root 'startup\session.mjs'
  $session.Process = Start-Process -FilePath $Node -ArgumentList @(('"'+$scriptPath+'"'),('"'+$stateFile+'"'),$theme) -WindowStyle Hidden -PassThru
  $deadline = [DateTime]::UtcNow.AddSeconds(15)
  while (-not (Test-Path -LiteralPath $stateFile)) {
   Hide-FadeDestination $session
   if ($session.Process.HasExited -or [DateTime]::UtcNow -gt $deadline) { throw 'STARTUP_SERVER_FAILED: The animation service could not start.' }
   Start-Sleep -Milliseconds 100
  }
  $details = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
  $session.Control=$details.control; $session.Title=$details.title
  $profile = Join-Path $stateRoot 'profile'
  Start-Process -FilePath $edge -ArgumentList @(('--app='+$details.url),('--user-data-dir="'+$profile+'"'),'--no-first-run','--no-default-browser-check','--disable-background-mode','--disable-session-crashed-bubble','--autoplay-policy=no-user-gesture-required') -WindowStyle Hidden | Out-Null
  $deadline=[DateTime]::UtcNow.AddSeconds(30)
  do {
   Hide-FadeDestination $session
   $session.Window=[FadeStartupWindow]::Find($session.Title)
   if ($session.Window -ne [IntPtr]::Zero) {
    [uint32]$ownerPid=0
    [FadeStartupWindow]::GetWindowThreadProcessId($session.Window,[ref]$ownerPid) | Out-Null
    $owner=Get-Process -Id $ownerPid -ErrorAction Stop
    if (-not $owner.Path -or -not [string]::Equals($owner.Path,$edge,[StringComparison]::OrdinalIgnoreCase)) { throw 'Unexpected startup window owner.' }
    if (-not [FadeStartupWindow]::ConfigureSurface($session.Window,[IntPtr]::Zero)) { throw 'STARTUP_SURFACE_FAILED: Could not configure the windowed animation.' }
    $state=Invoke-RestMethod -Uri ($session.Control+'/state') -TimeoutSec 2
    if ($state.shown) { return $session }
   }
   if ([DateTime]::UtcNow -gt $deadline) { throw 'STARTUP_VIDEO_TIMEOUT: Video did not begin. The official app continues running.' }
   Start-Sleep -Milliseconds 100
  } while ($true)
 } catch { Stop-FadeStartup $session; throw }
}

function Hide-FadeDestination($Session) {
 if (-not $Session.AppDir) { return }
 if ($Session.AppWindow -eq [IntPtr]::Zero) { $Session.AppWindow=Find-FadeAppWindow $Session.AppDir }
 if ($Session.AppWindow -ne [IntPtr]::Zero) {
  if (-not [FadeStartupWindow]::ConcealApp($Session.AppWindow)) { throw 'STARTUP_TRANSPARENCY_FAILED: Could not make the application window transparent.' }
 }
}

function Find-FadeAppWindow([string]$AppDir) {
 $apps = Get-Process -Name ChatGPT,Codex -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path.StartsWith($AppDir+'\',[StringComparison]::OrdinalIgnoreCase) }
 foreach ($app in $apps) {
  $handle=[FadeStartupWindow]::FindAppWindow($app.Id)
  if ($handle -ne [IntPtr]::Zero) { return $handle }
 }
 return [IntPtr]::Zero
}

function Initialize-FadeDestination($Session,[string]$AppDir) {
 # Match the destination geometry behind the video before capturing it.
 $deadline=[DateTime]::UtcNow.AddSeconds(8)
 do {
  $Session.AppWindow=Find-FadeAppWindow $AppDir
  if ($Session.AppWindow -ne [IntPtr]::Zero) { break }
  Start-Sleep -Milliseconds 100
 } while ([DateTime]::UtcNow -lt $deadline)
 if ($Session.AppWindow -eq [IntPtr]::Zero) { throw 'STARTUP_APP_WINDOW_UNAVAILABLE: The official application window did not appear within 8 seconds.' }
 Hide-FadeDestination $Session
 if (-not [FadeStartupWindow]::MaximizeApp($Session.AppWindow)) { throw 'STARTUP_LAYOUT_FAILED: Could not maximize the application.' }
 if (Get-Command Write-StartupTiming -ErrorAction SilentlyContinue) { Write-StartupTiming 'Official window maximized without activation' }
}

function Wait-FadeStartup($Session,[string]$AppDir) {
 if (-not [FadeStartupWindow]::IsWindow($Session.AppWindow)) { Initialize-FadeDestination $Session $AppDir }
 for ($i=0;$i -lt 8;$i++) {
  if (-not [FadeStartupWindow]::IsZoomed($Session.AppWindow)) { Initialize-FadeDestination $Session $AppDir }
  if (-not [FadeStartupWindow]::ConfigureSurface($Session.Window,$Session.AppWindow)) { throw 'STARTUP_SURFACE_FAILED: Could not align the animation to the application client area.' }
  $result=Invoke-RestMethod -Method Post -Uri ($Session.Control+'/ready') -TimeoutSec 25
  if ($result.ready) { break }
  Start-Sleep -Milliseconds 400
 }
 if (-not $result -or -not $result.ready) { throw ('STARTUP_HANDOFF_FAILED: '+$result.error) }
 if (Get-Command Write-StartupTiming -ErrorAction SilentlyContinue) { Write-StartupTiming 'Workspace screenshot ready' }
 $deadline=[DateTime]::UtcNow.AddMinutes(29)
 while ([FadeStartupWindow]::IsWindow($Session.Window)) {
  # Edge can rewrite its window styles; keep only our owned surface off the taskbar.
  [FadeStartupWindow]::ConfigureSurface($Session.Window,$Session.AppWindow) | Out-Null
  $state=Invoke-RestMethod -Uri ($Session.Control+'/state') -TimeoutSec 3
  if ($state.complete) { break }
  if ([DateTime]::UtcNow -gt $deadline) { break }
  Start-Sleep -Milliseconds 100
 }
 [FadeStartupWindow]::RevealApp($Session.AppWindow)
 [FadeStartupWindow]::ShowWindow($Session.AppWindow,3) | Out-Null
 [FadeStartupWindow]::SetForegroundWindow($Session.AppWindow) | Out-Null
 # Keep the final painted frame topmost until the destination has focus.
 for ($i=0;$i -lt 10;$i++) {
  if (-not [FadeStartupWindow]::IsWindow($Session.AppWindow)) { throw 'STARTUP_DESTINATION_CLOSED: The application window closed before handoff.' }
  if ([FadeStartupWindow]::GetForegroundWindow() -eq $Session.AppWindow) { break }
  [FadeStartupWindow]::SetForegroundWindow($Session.AppWindow) | Out-Null
  Start-Sleep -Milliseconds 50
 }
 Start-Sleep -Milliseconds 150
 if ([FadeStartupWindow]::IsWindow($Session.Window)) {
  # Fade only our owned startup surface; never modify the official window.
  $fadeClock=[Diagnostics.Stopwatch]::StartNew()
  do {
   $progress=[Math]::Min(1,$fadeClock.Elapsed.TotalMilliseconds/280)
   if (-not [FadeStartupWindow]::Opacity($Session.Window,[byte][Math]::Round(255*(1-$progress)))) { break }
   Start-Sleep -Milliseconds 16
  } while ($progress -lt 1)
 }
}

function Stop-FadeStartup($Session) {
 if (-not $Session) { return }
 if ($Session.AppWindow -eq [IntPtr]::Zero -and $Session.AppDir) {
  $Session.AppWindow=Find-FadeAppWindow $Session.AppDir
 }
 if ($Session.AppWindow -ne [IntPtr]::Zero) { [FadeStartupWindow]::RevealApp($Session.AppWindow); [FadeStartupWindow]::ShowWindow($Session.AppWindow,3) | Out-Null }
 if ($Session.Window -ne [IntPtr]::Zero) { [FadeStartupWindow]::Close($Session.Window) }
 if ($Session.Process -and -not $Session.Process.HasExited) { Stop-Process -Id $Session.Process.Id -ErrorAction SilentlyContinue }
 if (Test-Path -LiteralPath $Session.StateFile) { Remove-Item -LiteralPath $Session.StateFile -Force -ErrorAction SilentlyContinue }
}
