@echo off
REM ENREGISTRER MES PARTIES - clonage comportemental.
REM Lance le serveur qui SERT le jeu et RECOIT les demos, puis ouvre le jeu en ?rec=1.
REM On joue normalement ; E (ou le bouton en bas a gauche) demarre et arrete l'enregistrement.
REM Chaque arret ecrit results\demos\demo-<horodatage>.json
cd /d "%~dp0"
netstat -ano | findstr ":8766" | findstr LISTENING >nul 2>&1
if %errorlevel%==0 (
  echo Serveur d'enregistrement deja actif sur http://localhost:8766
) else (
  echo Demarrage du serveur d'enregistrement sur http://localhost:8766 ...
  start "CASH CAR - enregistrement" /min node rec-server.js
  timeout /t 2 /nobreak >nul
)
echo.
echo   E = demarrer / arreter l'enregistrement. Chaque arret ecrit une demo.
echo   Les demos vont dans  ml\train\results\demos\
echo   Quand tu as 3-4 minutes de jeu au total : lance VERIFIER.bat, il entraine le cerveau.
echo.
start "" "http://localhost:8766/train.html?rec=1&v=%RANDOM%%RANDOM%"
