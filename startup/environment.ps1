# Set process-local temp paths before starting the app and its tool servers.
# Do not inherit a system TEMP from the process that launched Fade.
$fadeTempPath = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'Temp'
[IO.Directory]::CreateDirectory($fadeTempPath) | Out-Null
$fadeTempProbe = Join-Path $fadeTempPath ('fade-probe-' + [guid]::NewGuid().ToString('N'))
try {
 [IO.File]::WriteAllText($fadeTempProbe, 'probe')
} finally {
 if ([IO.File]::Exists($fadeTempProbe)) { [IO.File]::Delete($fadeTempProbe) }
}
$env:TEMP = $fadeTempPath
$env:TMP = $fadeTempPath