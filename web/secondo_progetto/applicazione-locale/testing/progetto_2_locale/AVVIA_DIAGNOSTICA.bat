@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Progetto 2 - Diagnostica
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0bootstrap.ps1" -Action diagnostics
set "EXIT_CODE=%ERRORLEVEL%"
echo.
pause
exit /b %EXIT_CODE%
