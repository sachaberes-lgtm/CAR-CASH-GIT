@echo off
REM Lance le mode ENTRAINEMENT neuro-evolution de CASH CAR.
REM Ouvre le jeu en navigateur avec ?train=1 : 24 voitures qui apprennent en direct.
cd /d "%~dp0"
REM Si un serveur tourne deja sur 8765, on ne le relance pas.
netstat -ano | findstr ":8765" | findstr LISTENING >nul 2>&1
if %errorlevel%==0 (
  echo Serveur deja actif sur http://localhost:8765
) else (
  echo Demarrage du serveur local sur http://localhost:8765 ...
  start "CASH CAR - serveur train" /min python -m http.server 8765
  timeout /t 2 /nobreak >nul
)
echo Ouverture du mode train...
start "" "http://localhost:8765/train.html?train=1&v=%RANDOM%%RANDOM%"
