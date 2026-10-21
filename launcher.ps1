param([switch]$Restore,[switch]$Preview,[switch]$NoStartup,[switch]$DiagnosticHold)
$ErrorActionPreference = 'Stop'
$taskRoot = $PSScriptRoot
. (Join-Path $taskRoot 'startup\environment.ps1')
$logPath = Join-Path $taskRoot 'launch.log'
if ($DiagnosticHold) { $diagnosticRoot=Join-Path $taskRoot '.work\active\diagnostic-runtime'; New-Item -ItemType Directory -Path $diagnosticRoot -Force | Out-Null; $logPath = Join-Path $diagnosticRoot 'launch.log' }
$playNativeStartup = $false
Start-Transcript -Path $logPath -Force | Out-Null
$startupClock = [Diagnostics.Stopwatch]::StartNew()
function Write-StartupTiming([string]$Stage) { Write-Host ('[Startup +{0:N2}s] {1}' -f $startupClock.Elapsed.TotalSeconds,$Stage) }
try {
$node = 'C:\Program Files\nodejs\node.exe'
if (-not (Test-Path -LiteralPath $node)) { $node = (Get-Command node -ErrorAction Stop).Source }
if ($Preview) { & $node (Join-Path $taskRoot 'preview-server.mjs'); exit $LASTEXITCODE }

$package = Get-AppxPackage -Name OpenAI.Codex | Select-Object -First 1
if (-not $package) { throw 'Microsoft Store Codex installation not found.' }
$officialAppDir = Join-Path $package.InstallLocation 'app'
$appDir = Join-Path $taskRoot '.fade-runtime-isolated\app'
$runtimeBuildDeferred = $false
function Build-FadeRuntime {
 Push-Location $taskRoot
 try { $buildArgs=@($officialAppDir); if ($DiagnosticHold) { $buildArgs+= '--diagnostic-hold' }; & $node (Join-Path $taskRoot 'startup\build-runtime.mjs') @buildArgs; if ($LASTEXITCODE -ne 0) { throw 'Installed Codex version is not supported by the Fade runtime. Official files were not modified.' } } finally { Pop-Location }
}
if ($DiagnosticHold) {
 if ($Restore -or $NoStartup -or $Preview) { throw 'DiagnosticHold requires a fresh animated startup.' }
 $appDir = Join-Path $taskRoot '.work\active\diagnostic-runtime\app'
 # Never rebuild a runtime that is currently running or attach this experiment to an existing app.
 if (Get-Process -Name ChatGPT,Codex -ErrorAction SilentlyContinue) { throw 'Save work and fully quit Codex before the diagnostic launch. No processes were stopped.' }
 Write-Host 'DIAGNOSTIC: native frontend entry held until orb opening + 5 seconds; 30-second fallback.'
}
if ($Restore) {
 try { $restoreSession=Get-Content -LiteralPath (Join-Path $taskRoot '.fade-session.json') -Raw | ConvertFrom-Json; if ($restoreSession.appDir) { $appDir=$restoreSession.appDir } } catch {}
} else {
$activeRuntime = Get-Process -Name ChatGPT,Codex -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path.StartsWith($appDir.TrimEnd('\')+'\',[StringComparison]::OrdinalIgnoreCase) }
if ($activeRuntime) { $runtimeBuildDeferred = $true; Write-Host 'Using the running runtime; packaged updates apply after a full exit and restart.' } else { Build-FadeRuntime }
}
$exe = Join-Path $appDir 'ChatGPT.exe'
if (-not (Test-Path -LiteralPath $exe)) { $exe = Join-Path $appDir 'Codex.exe' }
if (-not (Test-Path -LiteralPath $exe)) { throw 'Codex launcher not found.' }
Write-Host "Fade launcher: $exe"
. (Join-Path $taskRoot 'startup\endpoint.ps1')
$sessionPath=Join-Path $taskRoot '.fade-session.json'
$preferred=19222
try{$saved=Get-Content -LiteralPath $sessionPath -Raw -ErrorAction Stop | ConvertFrom-Json;if($saved.port -ge 1024 -and $saved.port -le 65535){$preferred=[int]$saved.port}}catch{}
$endpoint=Select-FadePort $appDir $preferred
$port=$endpoint.Port
$env:FADE_PORT="$port"
Write-Host "Local debug endpoint: 127.0.0.1:$port"
if (-not $endpoint.Running -and -not $Restore) {
 $existing = Get-Process -Name ChatGPT,Codex -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path.StartsWith($appDir,[StringComparison]::OrdinalIgnoreCase) }
 $officialRunning = Get-Process -Name ChatGPT,Codex -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path.StartsWith($officialAppDir,[StringComparison]::OrdinalIgnoreCase) }
 if ($existing -or $officialRunning) { throw 'Codex is already open. Save work and fully quit Codex, then launch Fade Codex.cmd. No processes were stopped.' }
 # A previous process may have exited after the initial build check. A fresh
 # launch must apply the deferred build once it is safe to replace runtime files.
 if ($runtimeBuildDeferred) { Build-FadeRuntime; $runtimeBuildDeferred = $false }
 # One native window: animation is injected into its renderer while it loads.
 $startupFullscreen = $false
 $preferencesPath = Join-Path $taskRoot '.fade-preferences.json'
 if (Test-Path -LiteralPath $preferencesPath) {
  $preferences = Get-Content -LiteralPath $preferencesPath -Raw | ConvertFrom-Json
  $startupFullscreen = $preferences.startupFullscreen -is [bool] -and $preferences.startupFullscreen
 }
 $env:FADE_START_FULLSCREEN = if ($startupFullscreen) { '1' } else { '0' }
 $env:FADE_STARTUP_VIEW = if (-not $NoStartup -and -not $DiagnosticHold) { '1' } else { '0' }
 $env:FADE_LAUNCHER_PATH = Join-Path $taskRoot 'Fade Codex.exe'
 $env:FADE_ICON_PATH = Join-Path $taskRoot 'Arts\fade-codex.ico'
 $appArguments = @('--remote-debugging-address=127.0.0.1',"--remote-debugging-port=$port")
 if (-not $NoStartup) { $appArguments += @('--autoplay-policy=no-user-gesture-required') }
 $launchWindowStyle = if ($startupFullscreen) { 'Normal' } else { 'Maximized' }
 Start-Process -FilePath $exe -ArgumentList $appArguments -WindowStyle $launchWindowStyle
 Write-StartupTiming 'Fade runtime launched'
 $playNativeStartup = -not $NoStartup
} elseif (-not $endpoint.Running) { throw 'No Fade session is running.' }
$endpointReady = $false
for ($attempt = 0; $attempt -lt 40; $attempt++) {
 $state=Get-FadePortState $port $appDir
 if($state -eq 'foreign'){throw 'Debug endpoint is owned by another application.'}
 if ($state -eq 'live') {
  try {
   $version = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/version" -TimeoutSec 2
   Write-Host "CDP connected: $($version.Browser)"
   Write-StartupTiming 'Debug endpoint ready'
   $endpointReady = $true
   break
  } catch { }
 }
 Start-Sleep -Milliseconds 500
}
if (-not $endpointReady) { throw 'STARTUP_PORT_UNAVAILABLE: Official app did not expose the debug port. See launch.log. Theme injection was not attempted.' }
@{port=$port;appDir=$appDir} | ConvertTo-Json | Set-Content -LiteralPath $sessionPath -Encoding UTF8
if ($Restore) { & $node (Join-Path $taskRoot 'inject.mjs') --restore } elseif ($playNativeStartup) { $injectArgs=@('--native-startup');if ($DiagnosticHold) { $injectArgs+='--diagnostic-hold' }; & $node (Join-Path $taskRoot 'inject.mjs') @injectArgs } else { & $node (Join-Path $taskRoot 'inject.mjs') }
$result = $LASTEXITCODE
Write-StartupTiming 'Fade initialization finished'
if ($result -ne 0) { throw 'THEME_TARGET_UNAVAILABLE: Debug port works, but theme injection failed. See launch.log for details.' }
if (-not $Restore -and -not $DiagnosticHold) {
 try { & (Join-Path $taskRoot 'startup\set-taskbar-icon.ps1') }
 catch { Write-Warning "Taskbar branding could not be applied: $($_.Exception.Message)" }
}
} catch {
 Write-Host $_.Exception.Message -ForegroundColor Red
 Write-Host "Diagnostic log: $logPath"
 exit 1
} finally { Stop-Transcript | Out-Null }
