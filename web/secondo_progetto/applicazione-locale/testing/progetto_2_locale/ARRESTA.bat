@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Progetto 2 - Arresto
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0bootstrap.ps1" -Action stop
set "EXIT_CODE=%ERRORLEVEL%"
echo.
pause
exit /b %EXIT_CODE%
