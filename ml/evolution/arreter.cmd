@echo off
REM ===== ARRETER.CMD : ARRETE PROPREMENT LA SELECTION NATURELLE DES BOTS (27/11/2026) =====
REM Cree etat\STOP : evoluer.js ne lance plus aucune course, attend celles en cours, ecrit ses journaux et son tableau, retire son verrou et
REM efface STOP. Cree aussi etat\ARRETE : la tache planifiee ne le relancera pas (seul lancer.cmd a la main l'efface).
REM Rien n'est perdu : au prochain lancement, la generation interrompue reprend la ou elle en etait.
REM Il attend la fin (au plus 20 minutes) pour pouvoir dire "c'est arrete" ; fermer la fenetre avant n'empeche pas l'arret.
setlocal EnableExtensions
set "ICI=%~dp0"
set "ETAT=%ICI%etat"
if not exist "%ETAT%" mkdir "%ETAT%"
type nul >"%ETAT%\ARRETE"
type nul >"%ETAT%\STOP"
echo.
echo   Arret demande.

set /a N=0
:attendre
if not exist "%ETAT%\verrou.json" goto fini
REM le verrou est-il tenu par un processus vivant ? 0 oui ; 1 non, il s'est arrete sans prevenir ; 2 le verrou vient de partir, l'arret est fini
node -e "try{const v=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));process.kill(v.pid,0);process.exit(0);}catch(e){process.exit(e&&e.code==='EPERM'?0:e&&e.code==='ENOENT'?2:1);}" "%ETAT%\verrou.json" >nul 2>&1
if errorlevel 2 goto fini
if errorlevel 1 goto mort
if %N%==0 echo   Il finit les courses en cours (quelques minutes). Tu peux fermer cette fenetre : l'arret se fera quand meme.
if %N% GEQ 240 goto long
ping -n 6 127.0.0.1 >nul
set /a N+=1
goto attendre

:fini
if exist "%ETAT%\STOP" del /q "%ETAT%\STOP"
echo   C'est arrete. Pour relancer : double-clic sur lancer.cmd.
goto fin

:mort
if exist "%ETAT%\STOP" del /q "%ETAT%\STOP"
echo   Rien ne tournait (la derniere fois, il s'est arrete sans prevenir). Les relances automatiques sont suspendues.
echo   Pour relancer : double-clic sur lancer.cmd.
goto fin

:long
echo   Toujours pas fini apres 20 minutes. Regarde la fin de ml\evolution\etat\sortie.log.
echo   L'arret reste demande : il se fera a la fin des courses en cours.

:fin
echo.
pause
exit /b 0
