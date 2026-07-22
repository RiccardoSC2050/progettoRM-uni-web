@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Progetto 2 - Installazione e avvio locale

echo ============================================================
echo  PROGETTO 2 - INSTALLAZIONE E AVVIO AUTOMATICO
echo ============================================================
echo.
echo Non chiudere questa finestra.
echo Al primo avvio vengono preparati automaticamente i componenti mancanti.
echo Serve una connessione Internet.
echo.

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0bootstrap.ps1" -Action start
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if "%EXIT_CODE%"=="0" (
    echo ============================================================
    echo  APPLICAZIONE AVVIATA CORRETTAMENTE
    echo ============================================================
    echo Sito locale per importare:
    echo http://127.0.0.1:8080/migration-servlet/
    echo.
    echo Visualizzatore PostgreSQL locale:
    echo http://127.0.0.1:8000/api/migration/browser/?database=DATABASE1
    echo.
    echo Connessione PostgreSQL:
    echo Host: 127.0.0.1
    echo Porta: 55432
    echo Utente: postgres
    echo Password: nessuna
    echo Database amministrativo: postgres
) else (
    echo AVVIO NON RIUSCITO.
    echo Leggere il messaggio sopra e i file nella cartella:
    echo %~dp0.runtime\logs
)
echo.
echo Lasciare aperte le finestre dei servizi durante l'utilizzo.
echo Per arrestare tutto eseguire ARRESTA.bat.
echo.
pause
exit /b %EXIT_CODE%
