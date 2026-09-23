@echo off
cd /d "%~dp0"
rem Serveur d'abord (fenetre minimisee), PUIS le navigateur sur une URL UNIQUE a chaque
rem lancement (?v=aleatoire) : ca CONTOURNE le cache du navigateur, qui resservait une
rem vieille copie d'index.html -> les correctifs n'apparaissaient jamais.
start "CASH CAR serveur" /min python -m http.server 8000
ping -n 2 127.0.0.1 >nul
start "" "http://localhost:8000/?v=%RANDOM%%RANDOM%"
