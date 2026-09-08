@echo off
REM ================================================================================
REM  VERIFIER — tout ce qui doit etre vrai avant de se fier au mode entrainement.
REM  Double-clic. Si une etape echoue, ca s'arrete et ca le dit.
REM ================================================================================
cd /d "%~dp0"
setlocal
set ECHEC=0

echo.
echo ================ 1/4  SYNTAXE ================
node check-syntax.js
if errorlevel 1 set ECHEC=1 & goto :fin

echo.
echo ================ 2/4  ISOMORPHISME ================
echo  (le joueur et les bots executent-ils LA MEME physique ? l'ecart doit etre nul)
node check-iso.js
if errorlevel 1 set ECHEC=1 & goto :fin

echo.
echo ================ 3/4  SIMULATION ================
node sim-train.js
if errorlevel 1 set ECHEC=1 & goto :fin

echo.
echo ================ 4/4  CLONAGE COMPORTEMENTAL ================
echo  (entraine un cerveau sur les parties de results\demos\ — passe son tour s'il n'y en a pas)
node clone.js
if errorlevel 1 set ECHEC=1 & goto :fin

:fin
echo.
if "%ECHEC%"=="1" (
  echo ******************  UNE ETAPE A ECHOUE  ******************
) else (
  echo ******************  TOUT EST VERT  ******************
  echo.
  echo  Pour mesurer si l'amorcage sert a quelque chose :
  echo     node bench-clone.js --gens 30
)
echo.
pause
