param([ValidateSet('minimize','close','restore')][string]$Action,[ValidateRange(1024,65535)][int]$Port)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'window.ps1')
Initialize-FadeWindowApi
$connection=Get-NetTCPConnection -State Listen -LocalPort $Port | Where-Object LocalAddress -in @('127.0.0.1','::1') | Select-Object -First 1
if(-not $connection){throw 'Fade debug session not found'}
$owner=Get-Process -Id $connection.OwningProcess
if($owner.ProcessName -notin @('ChatGPT','Codex')){throw 'Unexpected window owner'}
$handle=$owner.MainWindowHandle
if($handle -eq [IntPtr]::Zero){throw 'Main window not found'}
if($Action -eq 'minimize'){[FadeStartupWindow]::ShowWindow($handle,6) | Out-Null}elseif($Action -eq 'restore'){[FadeStartupWindow]::ShowWindow($handle,9) | Out-Null}else{[FadeStartupWindow]::Close($handle)}
