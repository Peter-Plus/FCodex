param(
 [Parameter(Mandatory=$true)][string]$Executable,
 [string]$ProgramsDirectory = [Environment]::GetFolderPath('Programs')
)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$runtimeExe = (Resolve-Path -LiteralPath $Executable).Path
if ([IO.Path]::GetExtension($runtimeExe) -ne '.exe') { throw 'Expected an Electron executable.' }
if (-not $ProgramsDirectory) { throw 'Windows Programs directory is unavailable.' }
New-Item -ItemType Directory -Path $ProgramsDirectory -Force | Out-Null
$shortcutPath = Join-Path $ProgramsDirectory 'FCodex.lnk'
# Windows toast activation needs a Start-menu identity matching Electron's AUMID.
# Target Electron directly: the launcher wrapper does not forward activation args.
$shell = New-Object -ComObject WScript.Shell
try {
 $shortcut = $shell.CreateShortcut($shortcutPath)
 $shortcut.TargetPath = $runtimeExe
 $shortcut.Arguments = ''
 $shortcut.WorkingDirectory = $taskRoot
 $shortcut.IconLocation = (Join-Path $taskRoot 'Arts\fade-codex.ico') + ',0'
 $shortcut.Description = 'FCodex desktop notifications'
 $shortcut.Save()
} finally {
 if ($shortcut) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($shortcut) }
 [void][Runtime.InteropServices.Marshal]::ReleaseComObject($shell)
}
if (-not ('FadeTaskbarProperties' -as [type])) { Add-Type -Path (Join-Path $PSScriptRoot 'taskbar-properties.cs') }
[FadeTaskbarProperties]::WriteShortcutId($shortcutPath,'FCodex.Purple.Desktop')
Write-Host "Registered FCodex notification identity: $shortcutPath"
