@echo off
REM ===== INSTALLER-TACHE.CMD : LE LANCEMENT AUTOMATIQUE (27/11/2026) =====
REM A LANCER PAR SACHA SEULEMENT : il change des reglages de Windows (taches planifiees, mise en veille).
REM Il explique d'abord ce qu'il va faire et demande O (oui) ou N (non). "installer-tache.cmd enlever" retire les trois taches.
REM Ecart a la specification (par. 8, qui disait /sc onstart) : une tache "au demarrage" tourne hors de toute session, donc sous le compte
REM SYSTEM ou avec le mot de passe enregistre dans Windows. Ici : a l'ouverture de la session de Sacha (/sc onlogon), sous son compte,
REM sans mot de passe stocke, plus une relance toutes les heures. Le PC doit donc ouvrir la session de Sacha apres un redemarrage.
REM (27/11/2026, l'integrateur) une troisieme tache, "CashCarEvolution-traces" : toutes les heures, sauver-traces.cmd auto (notes\traces.md par. 5.1).
REM Elle ENVOIE des fichiers sur Internet (le depot GitHub, branche evolution-...) : le texte le dit avant le O / N, avec l'adresse et la branche.
REM Une tache a part (et non un appel dans lancer.cmd auto) : quand la selection tourne, lancer.cmd auto ne rend la main qu'a son arret.
setlocal EnableExtensions
set "LANCER=%~dp0lancer.cmd"
set "TACHE=CashCarEvolution"
set "RELANCE=CashCarEvolution-relance"
set "TRACES=%~dp0sauver-traces.cmd"
set "TACHE_TRACES=CashCarEvolution-traces"
if /i "%~1"=="enlever" goto enlever

REM ----- ce que la tache 4 enverrait, et ou : la branche de ce dossier et l'adresse du depot (sans mot de passe ni jeton) -----
set "PC=pc"
for /f "delims=" %%p in ('node "%~dp0histoire.js" --pc 2^>nul') do set "PC=%%p"
set "BRANCHE=?"
for /f "delims=" %%b in ('git -C "%~dp0..\.." rev-parse --abbrev-ref HEAD 2^>nul') do set "BRANCHE=%%b"
set "ORIGINE=(aucune : rien ne pourra partir)"
for /f "delims=" %%u in ('git -C "%~dp0..\.." remote get-url origin 2^>nul') do set "ORIGINE=%%u"
for /f "delims=" %%u in ('node -e "let u=process.argv[1];try{const x=new URL(u);x.username='';x.password='';u=x.toString();}catch(e){}console.log(u)" "%ORIGINE%" 2^>nul') do set "ORIGINE=%%u"

echo.
echo   LANCEMENT AUTOMATIQUE DE LA SELECTION DES BOTS
echo   ==============================================
echo   Ce fichier va changer quatre reglages de Windows, pour ton compte (%USERNAME%) :
echo.
echo   1. Une tache planifiee "%TACHE%" : 5 minutes apres l'ouverture de ta session,
echo      elle lance :  "%LANCER%" auto
echo   2. Une tache planifiee "%RELANCE%" : toutes les heures, elle relance la meme chose.
echo      Si la selection tourne deja, elle ne fait rien (une petite fenetre noire peut apparaitre une seconde).
echo      Si tu as arrete avec arreter.cmd, elle ne relance pas tant que tu n'as pas relance lancer.cmd a la main.
echo   3. La mise en veille quand le PC est sur secteur est coupee  (powercfg /change standby-timeout-ac 0),
echo      sinon le PC s'endort la nuit et rien ne tourne. L'ecran, lui, peut toujours s'eteindre.
echo   4. Une tache planifiee "%TACHE_TRACES%" : toutes les heures, elle lance :  "%TRACES%" auto
echo      Elle refait l'arbre des pilotes, le recit et le tableau, et les range dans un commit git de ce dossier.
echo      Puis elle les ENVOIE SUR INTERNET, vers ton depot GitHub :
echo         adresse :  %ORIGINE%
echo         branche :  %BRANCHE%   (une branche a part ; jamais main : le site du jeu ne change pas)
echo      Si ce depot GitHub est public, tout le monde peut lire ce qui y est envoye.
echo      Ce qui part : les journaux legers de la selection (pilotes vivants, generations, validations, renvoyes,
echo      coffre, machine.json), le tableau, l'arbre, le recit, resume.txt et les champions. Rien d'autre :
echo      ni les courses, ni sortie.log, ni aucun fichier hors de ml\evolution.
echo      Pour garder les commits sur ce PC sans rien envoyer : cree un fichier vide nomme PAS-D-ENVOI dans ml\evolution\etat\
echo      Une petite fenetre noire peut apparaitre quelques secondes, une fois par heure.
echo.
echo   La selection elle-meme n'envoie rien sur Internet ; seule la tache 4 envoie ses traces vers GitHub. Rien n'est paye.
echo   Pour tout retirer :  installer-tache.cmd enlever
echo   (la mise en veille se remet dans Parametres, Systeme, Alimentation).
echo   La tache 1 peut demander les droits d'administrateur : si elle echoue, fais clic droit sur ce fichier,
echo   "Executer en tant qu'administrateur". La tache 2 suffit de toute facon a relancer dans l'heure.
if /i not "%BRANCHE:~0,10%"=="evolution-" echo.
if /i not "%BRANCHE:~0,10%"=="evolution-" echo   ATTENTION : ce dossier est sur la branche %BRANCHE%, pas sur une branche evolution-%PC%.
if /i not "%BRANCHE:~0,10%"=="evolution-" echo   La tache 4 y refusera de sauver (sans rien envoyer). Installe plutot depuis le dossier de la selection (README, INSTALLER SUR UN NOUVEAU PC).
echo.
choice /c ON /n /m "  Installer ? Tape O pour oui, N pour non : "
if errorlevel 2 goto refus

echo.
schtasks /create /tn "%TACHE%" /sc onlogon /delay 0005:00 /tr "\"%LANCER%\" auto" /it /f
if errorlevel 1 (echo   La tache "%TACHE%" n'a pas pu etre creee : voir le message ci-dessus.) else (echo   Tache "%TACHE%" : posee.)
schtasks /create /tn "%RELANCE%" /sc hourly /mo 1 /tr "\"%LANCER%\" auto" /it /f
if errorlevel 1 (echo   La tache "%RELANCE%" n'a pas pu etre creee : voir le message ci-dessus.) else (echo   Tache "%RELANCE%" : posee.)
schtasks /create /tn "%TACHE_TRACES%" /sc hourly /mo 1 /tr "\"%TRACES%\" auto" /it /f
if errorlevel 1 (echo   La tache "%TACHE_TRACES%" n'a pas pu etre creee : voir le message ci-dessus.) else (echo   Tache "%TACHE_TRACES%" : posee.)
powercfg /change standby-timeout-ac 0
if errorlevel 1 (echo   La mise en veille n'a pas pu etre coupee.) else (echo   Mise en veille sur secteur : coupee.)
echo.
echo   Fini. Pour lancer tout de suite sans attendre : double-clic sur lancer.cmd.
echo   Fais aussi une fois un double-clic sur sauver-traces.cmd : si GitHub demande de te connecter, fais-le une fois.
echo   Sinon la tache 4 (qui ne pose jamais de question) dira "envoi rate" chaque heure dans etat\traces.log.
echo.
pause
exit /b 0

:enlever
echo.
echo   Ce fichier va retirer les taches planifiees "%TACHE%", "%RELANCE%" et "%TACHE_TRACES%".
echo   La selection en cours (s'il y en a une) continue : pour l'arreter, arreter.cmd.
choice /c ON /n /m "  Retirer ? Tape O pour oui, N pour non : "
if errorlevel 2 goto refus
schtasks /delete /tn "%TACHE%" /f
schtasks /delete /tn "%RELANCE%" /f
schtasks /delete /tn "%TACHE_TRACES%" /f
echo   Fait. La mise en veille n'est pas remise : Parametres, Systeme, Alimentation.
echo.
pause
exit /b 0

:refus
echo   Rien n'a ete change.
echo.
pause
exit /b 0
