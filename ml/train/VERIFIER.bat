@echo off
REM ================================================================================
REM  VERIFIER — tout ce qui doit etre vrai avant de se fier au mode entrainement.
REM  Double-clic. Si une etape echoue, ca s'arrete et ca le dit.
REM  Se termine par LES TROIS CHIFFRES et par l'ouverture du jeu : aucun rapport
REM  ne peut dire "ca marche" sans que tu l'aies vu de tes yeux.
REM ================================================================================
cd /d "%~dp0"
setlocal
set ECHEC=0

echo.
echo ================ 1/5  SYNTAXE ================
node check-syntax.js
if errorlevel 1 set ECHEC=1 & goto :fin

echo.
echo ================ 2/5  ISOMORPHISME DE LA PHYSIQUE ================
echo  (le joueur et les bots executent-ils LA MEME physique ? l'ecart doit etre nul)
node check-iso.js
if errorlevel 1 set ECHEC=1 & goto :fin

echo.
echo ================ 3/5  CONFORMITE DES COMMANDES ================
echo  (le bot peut-il produire une commande qu'un humain ne peut pas ? doit finir en PASS)
node check-actions.js
if errorlevel 1 set ECHEC=1 & goto :fin

echo.
echo ================ 4/5  SIMULATION ================
node sim-train.js
if errorlevel 1 set ECHEC=1 & goto :fin

echo.
echo ================ 4bis/5  PROTOCOLE D'EVALUATION ================
echo  (chaque voiture est-elle notee sur plusieurs pistes DISTINCTES, et en moyenne ?)
node check-eval.js
if errorlevel 1 set ECHEC=1 & goto :fin

echo.
echo ================ 5/5  PERSISTANCE ================
echo  (un champion ecrit sur le disque est-il RELU au demarrage suivant ?)
node check-persist.js
if errorlevel 1 set ECHEC=1 & goto :fin

:fin
echo.
if "%ECHEC%"=="1" (
  echo ******************  UNE ETAPE A ECHOUE  ******************
  echo.
  pause
  exit /b 1
)
echo ******************  TOUT EST VERT  ******************

REM ---- LES TROIS CHIFFRES : vitesse, diversite, tenue de route ----
node check-live.js

REM ---- ET ON REGARDE : un chiffre ne remplace pas l'ecran ----
echo.
echo  Ouverture du mode entrainement dans ton navigateur...
netstat -ano | findstr ":8766" | findstr LISTENING >nul 2>&1
if %errorlevel%==0 (
  echo  serveur deja actif sur http://localhost:8766
) else (
  start "CASH CAR - serveur" /min node rec-server.js
  timeout /t 2 /nobreak >nul
)
start "" "http://localhost:8766/train.html?train=1&v=%RANDOM%%RANDOM%"
echo.
echo  ATTENTION : si tu changes d'onglet ou minimises, la simulation se met en PAUSE
echo  (garde document.hidden heritee du jeu). Laisse la fenetre visible pour la regarder.
echo.
pause
