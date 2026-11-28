@echo off
REM ===== INSTALLER-TACHE.CMD : LE LANCEMENT AUTOMATIQUE (27/11/2026) =====
REM A LANCER PAR SACHA SEULEMENT : il change des reglages de Windows (taches planifiees, mise en veille).
REM Il explique d'abord ce qu'il va faire et demande O (oui) ou N (non). "installer-tache.cmd enlever" retire les trois taches.
REM Ecart a la specification (par. 8, qui disait /sc onstart) : une tache "au demarrage" tourne hors de toute session, donc sous le compte
REM SYSTEM ou avec le mot de passe enregistre dans Windows. Ici : a l'ouverture de la session de Sacha, sous son compte,
REM sans mot de passe stocke, plus une relance toutes les heures. Le PC doit donc ouvrir la session de Sacha apres un redemarrage.
REM (27/11/2026, l'integrateur) une troisieme tache, "CashCarEvolution-traces" : toutes les heures, sauver-traces.cmd auto (notes\traces.md par. 5.1).
REM Elle ENVOIE des fichiers sur Internet (le depot GitHub, branche evolution-...) : le texte le dit avant le O / N, avec l'adresse et la branche.
REM Une tache a part (et non un appel dans lancer.cmd auto) : quand la selection tourne, lancer.cmd auto ne rend la main qu'a son arret.
REM ===== LES TACHES SANS LIMITE DE 72 H, LE NODE FIXE, LE MODE D'ESSAI (28/11/2026, les lanceurs : installation sur le Ryzen) =====
REM Sur le Ryzen, ce fichier n'a pas pu servir tel quel : "schtasks /create /sc ..." pose une tache que Windows TUE au bout de 72 heures
REM (la limite par defaut), et un simple "node" lancait la mauvaise version. Les trois taches y ont ete posees a la main, sous les memes noms.
REM Maintenant : node-fixe.js ecrit les trois taches en XML (ExecutionTimeLimit PT0S = sans limite ; sur batterie aussi ; rattrape une heure
REM manquee ; une seule instance a la fois, IgnoreNew ; sous le compte de la session, sans mot de passe stocke ; par wscript + cache.vbs :
REM pas de fenetre noire), puis "schtasks /create /tn NOM /xml FICHIER /f" les pose. /f REMPLACE une tache du meme nom (celles posees a la main).
REM Les taches lancent lancer.cmd et sauver-traces.cmd, qui prennent le Node de etat\node.txt (ecrit ici, apres le O, s'il n'existe pas).
REM "installer-tache.cmd essai DOSSIER" : affiche le meme texte, ecrit dans DOSSIER les trois .xml et commandes.txt, et NE POSE RIEN
REM (ni schtasks /create, ni powercfg, ni etat\node.txt, aucune question). Pour les tests (tests\lanceurs.test.js) et pour relire avant d'installer.
setlocal EnableExtensions
set "ICI=%~dp0"
set "ETAT=%ICI%etat"
set "LANCER=%~dp0lancer.cmd"
set "TACHE=CashCarEvolution"
set "RELANCE=CashCarEvolution-relance"
set "TRACES=%~dp0sauver-traces.cmd"
set "TACHE_TRACES=CashCarEvolution-traces"
set "MODE=pose"
if /i "%~1"=="enlever" goto enlever
if /i "%~1"=="essai" set "MODE=essai"
if "%MODE%"=="essai" if "%~2"=="" goto essai_sans_dossier
if "%MODE%"=="essai" set "SORTIE=%~f2"
if not exist "%ICI%node-fixe.js" goto sans_node_fixe
if not exist "%ICI%cache.vbs" goto sans_cache

REM ----- le Node : celui de etat\node.txt, ou celui que node-fixe.js trouve (sans rien ecrire avant le O) -----
set "AMORCE="
if exist "%ETAT%\node.txt" for /f "usebackq delims=" %%n in ("%ETAT%\node.txt") do if not defined AMORCE set "AMORCE=%%~n"
if defined AMORCE if not exist "%AMORCE%" set "AMORCE="
if not defined AMORCE for /f "delims=" %%n in ('where node.exe 2^>nul') do if not defined AMORCE set "AMORCE=%%n"
if not defined AMORCE if exist "%ProgramFiles%\nodejs\node.exe" set "AMORCE=%ProgramFiles%\nodejs\node.exe"
if not defined AMORCE if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "AMORCE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined AMORCE goto sans_node
set "CHOIX=%TEMP%\cashcar-node-choix-%RANDOM%%RANDOM%.txt"
"%AMORCE%" "%ICI%node-fixe.js" choisir --etat "%ETAT%" --sans-ecrire >"%CHOIX%" 2>&1
set "CODEN=%ERRORLEVEL%"
if not "%CODEN%"=="0" goto node_refuse
set "NODE="
for /f "usebackq delims=" %%n in ("%CHOIX%") do if not defined NODE set "NODE=%%n"
if not defined NODE goto node_refuse
if not exist "%NODE%" goto node_refuse
del /q "%CHOIX%" >nul 2>&1
set "NODEV=?"
for /f "delims=" %%v in ('call "%NODE%" --version 2^>nul') do set "NODEV=%%v"

REM ----- ce que la tache 4 enverrait, et ou : la branche de ce dossier et l'adresse du depot (sans mot de passe ni jeton) -----
set "PC=pc"
for /f "delims=" %%p in ('call "%NODE%" "%~dp0histoire.js" --pc 2^>nul') do set "PC=%%p"
set "BRANCHE=?"
for /f "delims=" %%b in ('git -C "%~dp0..\.." rev-parse --abbrev-ref HEAD 2^>nul') do set "BRANCHE=%%b"
set "ORIGINE=(aucune : rien ne pourra partir)"
for /f "delims=" %%u in ('git -C "%~dp0..\.." remote get-url origin 2^>nul') do set "ORIGINE=%%u"
for /f "delims=" %%u in ('call "%NODE%" -e "let u=process.argv[1];try{const x=new URL(u);x.username='';x.password='';u=x.toString();}catch(e){}console.log(u)" "%ORIGINE%" 2^>nul') do set "ORIGINE=%%u"

echo.
echo   LANCEMENT AUTOMATIQUE DE LA SELECTION DES BOTS
echo   ==============================================
echo   Ce fichier va changer quatre reglages de Windows, pour ton compte (%USERNAME%) :
echo.
echo   1. Une tache planifiee "%TACHE%" : 5 minutes apres l'ouverture de ta session,
echo      elle lance :  "%LANCER%" auto
echo   2. Une tache planifiee "%RELANCE%" : toutes les heures, elle relance la meme chose.
echo      Si la selection tourne deja, elle ne fait rien.
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
echo      ni les courses, ni sortie.log, ni etat\node.txt, ni aucun fichier hors de ml\evolution.
echo      Pour garder les commits sur ce PC sans rien envoyer : cree un fichier vide nomme PAS-D-ENVOI dans ml\evolution\etat\
echo.
echo   Les trois taches tournent sous ton compte, sans mot de passe enregistre et sans droits d'administrateur.
echo   Elles n'ont PAS de limite de duree (Windows arrete sinon une tache au bout de 72 heures), elles tournent aussi
echo   sur batterie, partent des que possible apres une heure manquee (PC eteint ou en veille), et jamais deux fois a la fois.
echo   Elles passent par wscript et cache.vbs (dans ce dossier) : aucune fenetre noire n'apparait.
echo   Le Node de la selection est fixe pour ce PC, dans ml\evolution\etat\node.txt :
echo         %NODE%   (%NODEV%)
echo   Si des taches de ces trois noms existent deja (par exemple posees a la main), elles sont REMPLACEES par celles-ci.
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
if "%MODE%"=="essai" goto essai

choice /c ON /n /m "  Installer ? Tape O pour oui, N pour non : "
if errorlevel 2 goto refus

echo.
REM ----- le Node, cette fois en ecrivant etat\node.txt s'il n'existe pas encore -----
set "CHOIX=%ETAT%\node-choix-%RANDOM%%RANDOM%.tmp"
if not exist "%ETAT%" mkdir "%ETAT%"
REM (28/11/2026, le relecteur) --garder-marqueur : un etat\CHANGER-DE-NODE reste pour le lancer.cmd suivant, le seul qui change l'epoque.
"%AMORCE%" "%ICI%node-fixe.js" choisir --etat "%ETAT%" --garder-marqueur >"%CHOIX%" 2>&1
set "CODEN=%ERRORLEVEL%"
if not "%CODEN%"=="0" goto node_refuse
del /q "%CHOIX%" >nul 2>&1
echo   Node de ce PC : etat\node.txt est pret.

REM ----- les trois taches, ecrites en XML dans un dossier temporaire, puis posees (/f remplace celles du meme nom) -----
set "XML=%TEMP%\cashcar-taches-%RANDOM%%RANDOM%"
"%NODE%" "%ICI%node-fixe.js" taches --ici "%ICI%." --sortie "%XML%" --node "%NODE%" >nul 2>&1
if errorlevel 1 goto xml_rate
set "RATE="
schtasks /create /tn "%TACHE%" /xml "%XML%\%TACHE%.xml" /f
if errorlevel 1 (set "RATE=1" & echo   La tache "%TACHE%" n'a pas pu etre posee : voir le message ci-dessus.) else (echo   Tache "%TACHE%" : posee.)
schtasks /create /tn "%RELANCE%" /xml "%XML%\%RELANCE%.xml" /f
if errorlevel 1 (set "RATE=1" & echo   La tache "%RELANCE%" n'a pas pu etre posee : voir le message ci-dessus.) else (echo   Tache "%RELANCE%" : posee.)
schtasks /create /tn "%TACHE_TRACES%" /xml "%XML%\%TACHE_TRACES%.xml" /f
if errorlevel 1 (set "RATE=1" & echo   La tache "%TACHE_TRACES%" n'a pas pu etre posee : voir le message ci-dessus.) else (echo   Tache "%TACHE_TRACES%" : posee.)
rmdir /s /q "%XML%" >nul 2>&1
if defined RATE echo   Une tache deja posee a la main en administrateur ne se remplace qu'en administrateur : clic droit sur ce fichier,
if defined RATE echo   "Executer en tant qu'administrateur" ; ou retire-la dans le Planificateur de taches, puis relance ce fichier.
powercfg /change standby-timeout-ac 0
if errorlevel 1 (echo   La mise en veille n'a pas pu etre coupee.) else (echo   Mise en veille sur secteur : coupee.)
echo.
echo   Fini. Pour lancer tout de suite sans attendre : double-clic sur lancer.cmd.
echo   Fais aussi une fois un double-clic sur sauver-traces.cmd : si GitHub demande de te connecter, fais-le une fois.
echo   Sinon la tache 4 (qui ne pose jamais de question) dira "envoi rate" chaque heure dans etat\traces.log.
echo.
pause
exit /b 0

:essai
echo   ESSAI : rien n'est pose (ni tache, ni mise en veille, ni etat\node.txt). Les fichiers sont dans :
echo         %SORTIE%
"%NODE%" "%ICI%node-fixe.js" taches --ici "%ICI%." --sortie "%SORTIE%" --node "%NODE%"
if errorlevel 1 goto xml_rate
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
echo   etat\node.txt reste : il ne change aucun reglage de Windows (il dit seulement quel Node lancer).
echo.
pause
exit /b 0

:refus
echo   Rien n'a ete change.
echo.
pause
exit /b 0

:node_refuse
echo.
echo   RIEN N'A ETE POSE : le Node de ce PC n'est pas pret.
if exist "%CHOIX%" type "%CHOIX%"
if exist "%CHOIX%" del /q "%CHOIX%" >nul 2>&1
echo.
if not "%MODE%"=="essai" pause
if "%CODEN%"=="2" exit /b 2
exit /b 1

:xml_rate
echo   RIEN N'A ETE POSE : les fichiers des taches n'ont pas pu etre ecrits (node-fixe.js taches).
if not "%MODE%"=="essai" pause
exit /b 1

:sans_node
echo   RIEN N'A ETE POSE : Node.js est introuvable sur ce PC. Installe-le, ou ecris le chemin complet de node.exe
echo   dans ml\evolution\etat\node.txt, puis relance ce fichier.
if not "%MODE%"=="essai" pause
exit /b 1

:sans_node_fixe
echo   RIEN N'A ETE POSE : node-fixe.js manque dans ce dossier.
if not "%MODE%"=="essai" pause
exit /b 1

:sans_cache
echo   RIEN N'A ETE POSE : cache.vbs manque dans ce dossier.
if not "%MODE%"=="essai" pause
exit /b 1

:essai_sans_dossier
echo   installer-tache.cmd essai DOSSIER : il manque le dossier ou ecrire les fichiers des taches.
exit /b 1
