$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot '..\startup\endpoint.ps1')
$script:listeners=@{}
$script:owners=@{}
function Get-NetTCPConnection {param($State,$LocalPort,$ErrorAction) if($script:listeners.ContainsKey([int]$LocalPort)){$script:listeners[[int]$LocalPort]}}
function Get-Process {param($Id,$ErrorAction) if($script:owners.ContainsKey([int]$Id)){$script:owners[[int]$Id]}}
$dir='C:\Apps\Codex'
$script:listeners[19222]=[pscustomobject]@{LocalAddress='127.0.0.1';OwningProcess=27188}
if((Get-FadePortState 19222 $dir) -ne 'stale'){throw 'Exited process was not classified stale'}
$chosen=Select-FadePort $dir
if($chosen.Port -ne 19225 -or $chosen.Running){throw 'Did not bypass stale listener'}
$script:listeners[19226]=[pscustomobject]@{LocalAddress='127.0.0.1';OwningProcess=123}
$script:owners[123]=[pscustomobject]@{Path='C:\Apps\Codex\ChatGPT.exe'}
$chosen=Select-FadePort $dir
if($chosen.Port -ne 19226 -or -not $chosen.Running){throw 'Failed to reuse live official session'}
$script:owners[123]=[pscustomobject]@{Path='C:\Apps\Codex-other\ChatGPT.exe'}
if((Get-FadePortState 19226 $dir) -ne 'foreign'){throw 'Path prefix escape accepted'}
$script:listeners[19227]=[pscustomobject]@{LocalAddress='0.0.0.0';OwningProcess=123}
if((Get-FadePortState 19227 $dir) -ne 'foreign'){throw 'Non-loopback listener accepted'}
Write-Output 'PASS: stale PID, free fallback, live reuse, foreign path and non-loopback listener.'
