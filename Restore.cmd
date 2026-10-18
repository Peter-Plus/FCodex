@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0launcher.ps1" -Restore
if errorlevel 1 pause
