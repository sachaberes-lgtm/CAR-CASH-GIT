@echo off
REM ===== LANCER.CMD : LANCE LA SELECTION NATURELLE DES BOTS (27/11/2026) =====
REM A la main : double-clic. Il efface d'abord etat\ARRETE et etat\STOP (tu veux que ca tourne), puis lance ml\evolution\evoluer.js.
REM Par la tache planifiee : "lancer.cmd auto". Si arreter.cmd a ete utilise (fichier etat\ARRETE), il ne lance RIEN :
REM   un arret voulu par Sacha tient jusqu'au prochain lancement a la main.
REM Si l'evolution tourne deja, evoluer.js le voit (etat\verrou.json) et sort tout de suite (code 2) : on peut le lancer deux fois sans risque.
REM Toute la console de evoluer.js va dans etat\sortie.log. Les autres options sont passees a evoluer.js (ex. --travailleurs 6).
REM (27/11, "machine") seul le PREMIER mot peut etre "auto" : "--etat auto" garde son "auto" ; un argument vide "" est saute.
REM   evoluer.js controle toutes les options : un mot de travers ne lance rien (code 2, l'erreur est dans sortie.log).
REM   Sans etat\machine.json (premier lancement sur ce PC), la fenetre dit que les premieres minutes servent a mesurer le PC (le banc).
REM Le depot peut etre n'importe ou : tous les chemins partent de ce fichier (%~dp0).
REM ===== LE NODE FIXE DE CE PC (28/11/2026, les lanceurs : "Il faudrait que lancer.cmd utilise un chemin de Node fixe") =====
REM Sur le Ryzen, C:\Program Files\nodejs passait devant dans le PATH : un simple "node" lancait v24.22.1 au lieu de v24.22.3. Or la version
REM de Node entre dans l'epoque des courses : une autre version = une nouvelle epoque, toutes les notes repartent de zero.
REM Le Node de la selection est donc celui de etat\node.txt (une ligne : le chemin complet de node.exe ; propre a ce PC, jamais committe).
REM Sans ce fichier, node-fixe.js cherche le Node de la version de l'epoque en cours (population.json) et l'y ecrit.
REM Un Node qui n'est pas celui de l'epoque, ou un node.txt qui pointe sur un fichier absent : RIEN n'est lance (code 2). Le texte dit
REM lequel il attend, lequel il a trouve et comment corriger ; il va dans sortie.log ET dans etat\NODE-REFUSE.txt (efface au lancement suivant
REM qui passe). Le Node "d'amorce", qui fait tourner node-fixe.js, peut etre n'importe lequel : node-fixe.js ne joue aucune course.
setlocal EnableExtensions
set "ICI=%~dp0"
set "ETAT=%ICI%etat"
set "JOURNAL=%ETAT%\sortie.log"
set "MODE=main"
set "ARGS="
if /i "%~1"=="auto" (
  set "MODE=auto"
  shift
)
:options
if [%1]==[] goto options_finies
if not "%~1"=="" set ARGS=%ARGS% %1
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

if not exist "%ICI%evoluer.js" goto sans_evoluer
if not exist "%ICI%node-fixe.js" goto sans_node_fixe

REM ----- le Node d'amorce : celui de etat\node.txt s'il existe, sinon le premier du PATH, sinon les deux dossiers usuels -----
set "AMORCE="
if exist "%ETAT%\node.txt" for /f "usebackq delims=" %%n in ("%ETAT%\node.txt") do if not defined AMORCE set "AMORCE=%%~n"
if defined AMORCE if not exist "%AMORCE%" set "AMORCE="
if not defined AMORCE for /f "delims=" %%n in ('where node.exe 2^>nul') do if not defined AMORCE set "AMORCE=%%n"
if not defined AMORCE if exist "%ProgramFiles%\nodejs\node.exe" set "AMORCE=%ProgramFiles%\nodejs\node.exe"
if not defined AMORCE if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "AMORCE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined AMORCE goto sans_node

REM ----- le Node de la selection : node-fixe.js le choisit (ligne 1 de sa sortie) ou refuse (code 2) -----
set "CHOIX=%ETAT%\node-choix-%RANDOM%%RANDOM%.tmp"
"%AMORCE%" "%ICI%node-fixe.js" choisir --etat "%ETAT%" >"%CHOIX%" 2>&1
set "CODEN=%ERRORLEVEL%"
if not "%CODEN%"=="0" goto node_refuse
set "NODE="
for /f "usebackq delims=" %%n in ("%CHOIX%") do if not defined NODE set "NODE=%%n"
if not defined NODE goto node_refuse
if not exist "%NODE%" goto node_refuse
if exist "%ETAT%\NODE-REFUSE.txt" del /q "%ETAT%\NODE-REFUSE.txt" >nul 2>&1

title CASH CAR - selection des bots - ne pas fermer, arreter.cmd pour arreter
cd /d "%ICI%..\.."
if "%MODE%"=="main" (
  echo.
  echo   La selection naturelle des bots demarre.
  echo   Laisse cette fenetre ouverte : elle ne montre rien, tout va dans ml\evolution\etat\sortie.log.
  echo   Pour suivre : ouvre ml\evolution\etat\tableau.html, ou tape  node ml\evolution\etat.js
  echo   Pour arreter proprement : double-clic sur ml\evolution\arreter.cmd
  if not exist "%ETAT%\machine.json" echo   Premier lancement sur ce PC : les premieres minutes ^(jusqu'a une heure^) servent a mesurer combien de courses il joue a la fois.
  echo.
)
>>"%JOURNAL%" echo [%date% %time%] ===== lancement (%MODE%)%ARGS% =====
>>"%JOURNAL%" type "%CHOIX%"
del /q "%CHOIX%" >nul 2>&1
REM (28/11, l'integrateur) evoluer.js refuse seul un Node d'une autre version que l'epoque ; ici node-fixe.js a deja choisi (marqueur compris) :
REM CASHCAR_NODE_FIXE le lui dit, pour qu'il ne refuse pas un changement que CHANGER-DE-NODE vient d'accepter.
set "CASHCAR_NODE_FIXE=%NODE%"
"%NODE%" "%ICI%evoluer.js"%ARGS% >>"%JOURNAL%" 2>&1
set "CODE=%ERRORLEVEL%"
>>"%JOURNAL%" echo [%date% %time%] ===== fin, code %CODE% =====

if "%MODE%"=="main" (
  if "%CODE%"=="0" echo   Arrete proprement.
  if "%CODE%"=="1" echo   Arrete sur une erreur : regarde la fin de ml\evolution\etat\sortie.log
  if "%CODE%"=="2" echo   Pas lance : il tourne deja, un autre travail l'en empeche, ou une option est mal ecrite. Le detail est a la fin de ml\evolution\etat\sortie.log
  pause
)
exit /b %CODE%

:node_refuse
if "%CODEN%"=="0" set "CODEN=1"
copy /y "%CHOIX%" "%ETAT%\NODE-REFUSE.txt" >nul 2>&1
>>"%JOURNAL%" echo [%date% %time%] ===== lancement (%MODE%) refuse : Node pas pret, rien n'est lance (code %CODEN%) ; le meme texte est dans etat\NODE-REFUSE.txt =====
>>"%JOURNAL%" type "%CHOIX%"
echo.
type "%CHOIX%"
echo.
echo   Ce texte est aussi dans ml\evolution\etat\NODE-REFUSE.txt
del /q "%CHOIX%" >nul 2>&1
if "%MODE%"=="main" pause
if "%CODEN%"=="2" exit /b 2
exit /b 1

:sans_node
>>"%JOURNAL%" echo [%date% %time%] node introuvable : installer Node.js 24, ou ecrire son chemin dans etat\node.txt, puis relancer
echo Node.js est introuvable sur ce PC : il faut l'installer, ou ecrire le chemin complet de node.exe dans ml\evolution\etat\node.txt, puis relancer lancer.cmd.
if "%MODE%"=="main" pause
exit /b 1

:sans_evoluer
>>"%JOURNAL%" echo [%date% %time%] evoluer.js manque dans "%ICI%"
echo evoluer.js manque dans "%ICI%" : rien a lancer.
if "%MODE%"=="main" pause
exit /b 1

:sans_node_fixe
>>"%JOURNAL%" echo [%date% %time%] node-fixe.js manque dans "%ICI%"
echo node-fixe.js manque dans "%ICI%" : rien a lancer.
if "%MODE%"=="main" pause
exit /b 1
