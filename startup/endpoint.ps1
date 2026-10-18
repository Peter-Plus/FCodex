function Get-FadePortState([int]$Port,[string]$AppDir) {
 $connections=@(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue)
 if(-not $connections.Count){return 'free'}
 $stale=$false
 foreach($connection in $connections){
  if($connection.LocalAddress -notin @('127.0.0.1','::1')){return 'foreign'}
  $owner=Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
  if(-not $owner){$stale=$true;continue}
  if(-not $owner.Path -or -not $owner.Path.StartsWith($AppDir.TrimEnd('\')+'\',[StringComparison]::OrdinalIgnoreCase)){return 'foreign'}
 }
 if($stale){return 'stale'}
 return 'live'
}
function Select-FadePort([string]$AppDir,[int]$Preferred=19222) {
 $ports=@(@($Preferred,19222)+@(19225..19234) | Select-Object -Unique)
 $available=$null
 foreach($candidate in $ports){
  $state=Get-FadePortState $candidate $AppDir
  if($state -eq 'live'){return [pscustomobject]@{Port=$candidate;Running=$true}}
  if($state -eq 'free' -and $null -eq $available){$available=$candidate}
  if($state -eq 'stale'){Write-Host "Skipping stale debug listener on port $candidate (owner exited)."}
 }
 if($null -ne $available){return [pscustomobject]@{Port=$available;Running=$false}}
 throw 'No free Fade debug port is available.'
}
