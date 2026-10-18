$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$output = Join-Path $taskRoot 'Fade Codex.exe'
$iconPath = Join-Path $taskRoot 'Arts\fade-codex.ico'
$runtimeExe = Join-Path $taskRoot '.fade-runtime-isolated\app\Codex.exe'
if (-not (Test-Path -LiteralPath $runtimeExe)) { $runtimeExe = Join-Path $taskRoot '.fade-runtime-isolated\app\ChatGPT.exe' }
$compilerArgs = @('/nologo', '/target:winexe', '/reference:System.Windows.Forms.dll', "/out:$output")
if (Test-Path -LiteralPath $iconPath) {
    $compilerArgs += "/win32icon:$iconPath"
} elseif (Test-Path -LiteralPath $runtimeExe) {
    $iconPath = Join-Path $PSScriptRoot 'launcher.ico'
    Add-Type -AssemblyName System.Drawing
    $icon = [Drawing.Icon]::ExtractAssociatedIcon($runtimeExe)
    if ($icon) {
        $stream = [IO.File]::Create($iconPath)
        try { $icon.Save($stream) } finally { $stream.Dispose(); $icon.Dispose() }
        $compilerArgs += "/win32icon:$iconPath"
    }
}
& $compiler @compilerArgs (Join-Path $PSScriptRoot 'shortcut-launcher.cs')
if ($LASTEXITCODE -ne 0) { throw 'Launcher compilation failed.' }
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut((Join-Path $taskRoot 'Fade Codex.lnk'))
$shortcut.TargetPath = $output
$shortcut.WorkingDirectory = $taskRoot
$iconHash = (Get-FileHash -LiteralPath $iconPath -Algorithm SHA256).Hash.Substring(0,12).ToLowerInvariant()
$shellIconPath = Join-Path $taskRoot "Arts\fade-codex-$iconHash.ico"
Copy-Item -LiteralPath $iconPath -Destination $shellIconPath -Force
$shortcut.IconLocation = "$shellIconPath,0"
$shortcut.Description = 'Start Fade Codex'
$shortcut.Save()
if (-not ('FadeTaskbarProperties' -as [type])) { Add-Type -Path (Join-Path $PSScriptRoot 'taskbar-properties.cs') }
[FadeTaskbarProperties]::WriteShortcutId((Join-Path $taskRoot 'Fade Codex.lnk'),'FCodex.Purple.Desktop')
Write-Host "Created $output and Fade Codex.lnk"
