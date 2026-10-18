param([switch]$InspectOnly)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
if (-not ('FadeTaskbarProperties' -as [type])) {
 $compileTemp=Join-Path $root '.work\active\icon-compiler'
 New-Item -ItemType Directory -Path $compileTemp -Force | Out-Null
 $previousTemp=$env:TEMP;$previousTmp=$env:TMP
 try{$env:TEMP=$compileTemp;$env:TMP=$compileTemp;Add-Type -Path (Join-Path $PSScriptRoot 'taskbar-properties.cs')}
 finally{$env:TEMP=$previousTemp;$env:TMP=$previousTmp}
}
$appDir=[IO.Path]::GetFullPath((Join-Path $root '.fade-runtime-isolated\app'))+'\'
$icon=Join-Path $root 'Arts\fade-codex.ico'
$hash=(Get-FileHash -LiteralPath $icon).Hash.Substring(0,12).ToLowerInvariant()
$versioned=Join-Path $root "Arts\fade-codex-$hash.ico"
if (-not $InspectOnly) { Copy-Item -LiteralPath $icon -Destination $versioned -Force }
foreach($p in (Get-Process -Name ChatGPT,Codex -ErrorAction SilentlyContinue)) {
 if(-not $p.Path -or -not $p.Path.StartsWith($appDir,[StringComparison]::OrdinalIgnoreCase) -or $p.MainWindowHandle -eq 0){continue}
 $w=$p.MainWindowHandle
 foreach($id in @(2,3,4,5)){Write-Output "Before PID=$($p.Id) property=$id value=$([FadeTaskbarProperties]::Read($w,$id))"}
 if($InspectOnly){continue}
 # Set relaunch properties before the explicit window identity, per Shell API contract.
 $values=@{2='"'+(Join-Path $root 'Fade Codex.exe')+'"';3=$versioned+',0';4='FCodex';5='FCodex.Purple.Desktop'}
 foreach($id in @(2,3,4,5)){
  [FadeTaskbarProperties]::Write($w,$id,$values[$id])
  $actual=[FadeTaskbarProperties]::Read($w,$id)
  if($actual -ne $values[$id]){throw "Taskbar property $id did not persist"}
  Write-Output "After property=$id value=$actual"
 }
}
