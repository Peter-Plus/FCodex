$ErrorActionPreference = 'Stop'
$parseErrors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile((Join-Path $PSScriptRoot '..\launcher.ps1'),[ref]$null,[ref]$parseErrors)
if ($parseErrors) { throw ($parseErrors | Out-String) }
# Execute the launcher's actual initial decision and pre-launch safety/build block.
# Native process discovery and the build itself are replaced; no client is launched.
$initial = $ast.Find({param($node) $node -is [System.Management.Automation.Language.IfStatementAst] -and $node.Clauses[0].Item1.Extent.Text -eq '$activeRuntime'},$true)
$fresh = $ast.Find({param($node) $node -is [System.Management.Automation.Language.IfStatementAst] -and $node.Clauses[0].Item1.Extent.Text -eq '-not $endpoint.Running -and -not $Restore'},$true)
if (-not $initial -or -not $fresh) { throw 'Launcher build/launch decisions not found' }
$preLaunch = $fresh.Clauses[0].Item2.Statements
$deferred = @($preLaunch | Where-Object { $_ -is [System.Management.Automation.Language.IfStatementAst] -and $_.Clauses[0].Item1.Extent.Text -eq '$runtimeBuildDeferred' })
if ($deferred.Count -ne 1) { throw 'Missing fresh-launch deferred build' }
$buildIndex = [Array]::IndexOf($preLaunch,$deferred[0])
$beforeStart = [scriptblock]::Create(($preLaunch[0..$buildIndex] | ForEach-Object { $_.Extent.Text }) -join "`n")
$firstCheck = [scriptblock]::Create($initial.Extent.Text)
function Build-FadeRuntime { $script:builds++ }
function Get-Process { if ($script:stillLive) { [pscustomobject]@{ Path='G:\test-runtime\ChatGPT.exe' } } }
function Assert-Equal($actual,$expected,$message) { if ($actual -ne $expected) { throw "$message : expected $expected, got $actual" } }
$appDir='G:\test-runtime';$officialAppDir='G:\official'

$script:builds=0;$script:stillLive=$false;$activeRuntime=$null;$runtimeBuildDeferred=$false
. $firstCheck
. $beforeStart
Assert-Equal $script:builds 1 'Idle startup builds exactly once'

$script:builds=0;$script:stillLive=$true;$activeRuntime=@([pscustomobject]@{Path='G:\test-runtime\ChatGPT.exe'});$runtimeBuildDeferred=$false
. $firstCheck
Assert-Equal $script:builds 0 'Running runtime is not overwritten'
Assert-Equal $runtimeBuildDeferred $true 'Build remains deferred while reusing a runtime'
$blocked=$false
try { . $beforeStart } catch { if ($_.Exception.Message -notlike 'Codex is already open.*') { throw };$blocked=$true }
Assert-Equal $blocked $true 'A still-running process blocks a fresh launch'
Assert-Equal $script:builds 0 'Blocked launch does not build'

$script:stillLive=$false
. $beforeStart
Assert-Equal $script:builds 1 'Process exits between checks: build before fresh launch'
Assert-Equal $runtimeBuildDeferred $false 'Deferred build is consumed'
Write-Host 'Launcher runtime lifecycle regression passed.'
