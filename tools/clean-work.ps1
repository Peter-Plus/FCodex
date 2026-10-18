param([switch]$Apply)
$ErrorActionPreference='Stop'
$projectRoot=[IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$workPath=Join-Path $projectRoot '.work'
$cleanupPath=Join-Path $workPath 'disposable'
if(-not (Test-Path -LiteralPath $cleanupPath)){Write-Output 'No disposable files.';return}
foreach($p in @($workPath,$cleanupPath)){
 if((Get-Item -LiteralPath $p -Force).Attributes -band [IO.FileAttributes]::ReparsePoint){throw "Refusing linked directory: $p"}
}
$entries=@(Get-ChildItem -LiteralPath $cleanupPath -Force)
foreach($entry in $entries){
 $target=[IO.Path]::GetFullPath($entry.FullName)
 if((Split-Path -Parent $target) -ne $cleanupPath){throw "Outside disposable directory: $target"}
 if($entry.Attributes -band [IO.FileAttributes]::ReparsePoint){throw "Refusing link: $target"}
 if($entry.PSIsContainer){
  if(@(Get-ChildItem -LiteralPath $target -Force -Recurse | Where-Object {$_.Attributes -band [IO.FileAttributes]::ReparsePoint}).Count){throw "Refusing nested links: $target"}
 }
}
foreach($entry in $entries){
 if($Apply){Remove-Item -LiteralPath $entry.FullName -Recurse -Force;Write-Output "Deleted: $($entry.Name)"}
 else{Write-Output "Would delete: $($entry.FullName)"}
}
if(-not $Apply){Write-Output 'Preview only. Add -Apply to delete disposable contents. active/ and review/ are never touched.'}
