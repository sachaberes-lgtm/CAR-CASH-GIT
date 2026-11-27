@echo off
REM ===== LANCER.CMD : LANCE LA SELECTION NATURELLE DES BOTS (27/11/2026) =====
REM A la main : double-clic. Il efface d'abord etat\ARRETE et etat\STOP (tu veux que ca tourne), puis lance ml\evolution\evoluer.js.
REM Par la tache planifiee : "lancer.cmd auto". Si arreter.cmd a ete utilise (fichier etat\ARRETE), il ne lance RIEN :
REM   un arret voulu par Sacha tient jusqu'au prochain lancement a la main.
REM Si l'evolution tourne deja, evoluer.js le voit (etat\verrou.json) et sort tout de suite (code 2) : on peut le lancer deux fois sans risque.
REM Toute la console de evoluer.js va dans etat\sortie.log. Les autres options sont passees a evoluer.js (ex. --travailleurs 6).
REM Le depot peut etre n'importe ou : tous les chemins partent de ce fichier (%~dp0).
setlocal EnableExtensions
set "ICI=%~dp0"
set "ETAT=%ICI%etat"
set "JOURNAL=%ETAT%\sortie.log"
set "MODE=main"
set "ARGS="
:options
if "%~1"=="" goto options_finies
if /i "%~1"=="auto" (set "MODE=auto") else (set ARGS=%ARGS% %1)
shift
goto options
:options_finies

if not exist "%ETAT%" mkdir "%ETAT%"

if "%MODE%"=="auto" if exist "%ETAT%\ARRETE" (
  >>"%JOURNAL%" echo [%date% %time%] relance automatique sautee : arreter.cmd a ete utilise, lancer.cmd a la main pour reprendre
  exit /b 0
)
if "%MODE%"=="main" (
  if exist "%ETAT%\ARRETE" del /q "%ETAT%\ARRETE"
  if exist "%ETAT%\STOP" del /q "%ETAT%\STOP"
)

where node >nul 2>&1
if errorlevel 1 (
  >>"%JOURNAL%" echo [%date% %time%] node introuvable : installer Node.js 24, puis relancer
  echo Node.js est introuvable sur ce PC : il faut l'installer, puis relancer lancer.cmd.
  if "%MODE%"=="main" pause
  exit /b 1
)
if not exist "%ICI%evoluer.js" (
  >>"%JOURNAL%" echo [%date% %time%] evoluer.js manque dans %ICI%
  echo evoluer.js manque dans %ICI% : rien a lancer.
  if "%MODE%"=="main" pause
  exit /b 1
)

title CASH CAR - selection des bots - ne pas fermer, arreter.cmd pour arreter
cd /d "%ICI%..\.."
if "%MODE%"=="main" (
  echo.
  echo   La selection naturelle des bots demarre.
  echo   Laisse cette fenetre ouverte : elle ne montre rien, tout va dans ml\evolution\etat\sortie.log.
  echo   Pour suivre : ouvre ml\evolution\etat\tableau.html, ou tape  node ml\evolution\etat.js
  echo   Pour arreter proprement : double-clic sur ml\evolution\arreter.cmd
  echo.
)
>>"%JOURNAL%" echo [%date% %time%] ===== lancement (%MODE%)%ARGS% =====
node "%ICI%evoluer.js"%ARGS% >>"%JOURNAL%" 2>&1
set "CODE=%ERRORLEVEL%"
>>"%JOURNAL%" echo [%date% %time%] ===== fin, code %CODE% =====

if "%MODE%"=="main" (
  if "%CODE%"=="0" echo   Arrete proprement.
  if "%CODE%"=="1" echo   Arrete sur une erreur : regarde la fin de ml\evolution\etat\sortie.log
  if "%CODE%"=="2" echo   Pas lance : il tourne deja, ou un autre travail l'en empeche. Le detail est a la fin de ml\evolution\etat\sortie.log
  pause
)
exit /b %CODE%
