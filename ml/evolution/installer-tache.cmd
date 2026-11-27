@echo off
REM ===== INSTALLER-TACHE.CMD : LE LANCEMENT AUTOMATIQUE (27/11/2026) =====
REM A LANCER PAR SACHA SEULEMENT : il change des reglages de Windows (taches planifiees, mise en veille).
REM Il explique d'abord ce qu'il va faire et demande O (oui) ou N (non). "installer-tache.cmd enlever" retire les deux taches.
REM Ecart a la specification (par. 8, qui disait /sc onstart) : une tache "au demarrage" tourne hors de toute session, donc sous le compte
REM SYSTEM ou avec le mot de passe enregistre dans Windows. Ici : a l'ouverture de la session de Sacha (/sc onlogon), sous son compte,
REM sans mot de passe stocke, plus une relance toutes les heures. Le PC doit donc ouvrir la session de Sacha apres un redemarrage.
setlocal EnableExtensions
set "LANCER=%~dp0lancer.cmd"
set "TACHE=CashCarEvolution"
set "RELANCE=CashCarEvolution-relance"
if /i "%~1"=="enlever" goto enlever

echo.
echo   LANCEMENT AUTOMATIQUE DE LA SELECTION DES BOTS
echo   ==============================================
echo   Ce fichier va changer trois reglages de Windows, pour ton compte (%USERNAME%) :
echo.
echo   1. Une tache planifiee "%TACHE%" : 5 minutes apres l'ouverture de ta session,
echo      elle lance :  "%LANCER%" auto
echo   2. Une tache planifiee "%RELANCE%" : toutes les heures, elle relance la meme chose.
echo      Si la selection tourne deja, elle ne fait rien (une petite fenetre noire peut apparaitre une seconde).
echo      Si tu as arrete avec arreter.cmd, elle ne relance pas tant que tu n'as pas relance lancer.cmd a la main.
echo   3. La mise en veille quand le PC est sur secteur est coupee  (powercfg /change standby-timeout-ac 0),
echo      sinon le PC s'endort la nuit et rien ne tourne. L'ecran, lui, peut toujours s'eteindre.
echo.
echo   Rien n'est envoye sur Internet. Rien n'est paye. Pour tout retirer :  installer-tache.cmd enlever
echo   (la mise en veille se remet dans Parametres, Systeme, Alimentation).
echo   La tache 1 peut demander les droits d'administrateur : si elle echoue, fais clic droit sur ce fichier,
echo   "Executer en tant qu'administrateur". La tache 2 suffit de toute facon a relancer dans l'heure.
echo.
choice /c ON /n /m "  Installer ? Tape O pour oui, N pour non : "
if errorlevel 2 goto refus

echo.
schtasks /create /tn "%TACHE%" /sc onlogon /delay 0005:00 /tr "\"%LANCER%\" auto" /it /f
if errorlevel 1 (echo   La tache "%TACHE%" n'a pas pu etre creee : voir le message ci-dessus.) else (echo   Tache "%TACHE%" : posee.)
schtasks /create /tn "%RELANCE%" /sc hourly /mo 1 /tr "\"%LANCER%\" auto" /it /f
if errorlevel 1 (echo   La tache "%RELANCE%" n'a pas pu etre creee : voir le message ci-dessus.) else (echo   Tache "%RELANCE%" : posee.)
powercfg /change standby-timeout-ac 0
if errorlevel 1 (echo   La mise en veille n'a pas pu etre coupee.) else (echo   Mise en veille sur secteur : coupee.)
echo.
echo   Fini. Pour lancer tout de suite sans attendre : double-clic sur lancer.cmd.
echo.
pause
exit /b 0

:enlever
echo.
echo   Ce fichier va retirer les taches planifiees "%TACHE%" et "%RELANCE%".
echo   La selection en cours (s'il y en a une) continue : pour l'arreter, arreter.cmd.
choice /c ON /n /m "  Retirer ? Tape O pour oui, N pour non : "
if errorlevel 2 goto refus
schtasks /delete /tn "%TACHE%" /f
schtasks /delete /tn "%RELANCE%" /f
echo   Fait. La mise en veille n'est pas remise : Parametres, Systeme, Alimentation.
echo.
pause
exit /b 0

:refus
echo   Rien n'a ete change.
echo.
pause
exit /b 0
