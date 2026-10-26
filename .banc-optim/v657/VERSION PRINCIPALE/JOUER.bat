@echo off
title CAR CASH - serveur du jeu (fermer cette fenetre arrete le jeu)
cd /d "%~dp0"
rem Serveur deja lance (deuxieme double-clic) : on rouvre juste le jeu.
curl -s -o nul --max-time 2 http://localhost:8000/ && (start "" http://localhost:8000/ & exit /b)
rem Le navigateur s'ouvrait AVANT que le serveur reponde : page "site inaccessible".
rem On ouvre donc le jeu seulement quand le serveur repond (40 s max : un demarrage a froid de python a pris 10 s).
echo CAR CASH demarre... le jeu s'ouvre dans le navigateur des que le serveur est pret.
start "" /b powershell -NoProfile -Command "for($i=0;$i -lt 160;$i++){ curl.exe -s -o NUL --max-time 1 http://localhost:8000/; if($LASTEXITCODE -eq 0){ Start-Process 'http://localhost:8000/'; break }; Start-Sleep -Milliseconds 250 }"
python -m http.server 8000
