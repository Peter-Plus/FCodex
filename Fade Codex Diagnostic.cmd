@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0launcher.ps1" -DiagnosticHold
if errorlevel 1 pause
