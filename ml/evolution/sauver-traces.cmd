@echo off
REM ===== SAUVER-TRACES.CMD : LA MISE A L'ABRI DES TRACES DE LA SELECTION (27/11/2026) =====
REM Sacha : "il faut qu'on garde des traces de tous les process, pour un portfolio". Lecon du chantier : un dossier de resultats hors git
REM a ete efface une fois. Ce fichier tourne dans le dossier git de la selection (un worktree sur sa branche a elle, evolution-NOMDUPC (le nom du PC en minuscules)) :
REM   1. il refait etat\tableau.html, etat\resume.txt, etat\arbre.html et etat\histoire.md (node ml\evolution\tableau.js) ;
REM   2. "git add" de ce qui est leger : population.json, generations.jsonl, validations.jsonl, morts.jsonl, coffre.jsonl, machine.json,
REM      les trois pages, resume.txt, et champions\. JAMAIS les courses ni les pilotes generes (ml\evolution\.gitignore les tient dehors) ;
REM   3. un commit local "BOTS-ML evolution NOMDUPC : generation N, ..." seulement s'il y a du nouveau DANS LES JOURNAUX (les pages portent l'heure :
REM      sans cette regle, une selection arretee faisait un commit par heure), et de ces fichiers-la seulement (commit --only) ;
REM   4. "git push origin HEAD:refs/heads/<la branche courante>" : il ENVOIE sur Internet, vers le depot GitHub, sur cette branche a part.
REM      Jamais vers main, jamais de force. Rien n'est envoye si le fichier etat\PAS-D-ENVOI existe.
REM      Un echec d'envoi (pas de reseau, pas de droits) n'est PAS une erreur : le commit local protege deja ; on reessaie la fois suivante.
REM Il refuse de tourner (code 2) sur main, sur bots-ecurie, sur une branche dont le nom ne commence pas par "evolution-", hors d'une branche
REM (rebase en cours), et pendant une fusion, un cherry-pick ou un revert pas finis (un "git add" y marquerait un conflit comme regle).
REM Double-clic : une ligne dit ce qui a ete fait. "sauver-traces.cmd auto" (la tache planifiee) : rien a l'ecran, aucune question
REM (ni mot de passe, ni fenetre de connexion, ni cle SSH), un envoi qui traine est coupe.
REM Le detail (les sorties de git et de node) va dans etat\traces.log (garde a ~1 Mo : l'ancien devient traces.log.ancien) ; la ligne de bilan
REM dans etat\sortie.log, ou dans etat\traces.log quand la selection en marche tient sortie.log ouvert (Windows refuse alors un second ecrivain).
REM (27/11/2026, le relecteur) : la regle "du nouveau dans les journaux", la garde des fusions, la branche "evolution-", l'envoi vers la branche
REM courante, l'identite git de repli, SSH sans question, l'envoi coupe s'il traine, champions\ vide, traces.log borne.
setlocal EnableExtensions EnableDelayedExpansion
set "ICI=%~dp0"
set "ETAT=%ICI%etat"
set "JOURNAL=%ETAT%\sortie.log"
set "DETAIL=%ETAT%\traces.log"
set "MODE=main"
if /i "%~1"=="auto" set "MODE=auto"
if not exist "%ETAT%" mkdir "%ETAT%"
if exist "%DETAIL%" for %%A in ("%DETAIL%") do if %%~zA GTR 1000000 move /y "%DETAIL%" "%DETAIL%.ancien" >nul 2>&1
cd /d "%ICI%..\.."
>>"%DETAIL%" echo [%date% %time%] ===== sauver-traces (%MODE%) =====
if "%MODE%"=="auto" (
  set "GIT_TERMINAL_PROMPT=0"
  set "GCM_INTERACTIVE=never"
  if not defined GIT_SSH_COMMAND set "GIT_SSH_COMMAND=ssh -o BatchMode=yes -o ConnectTimeout=30"
)

where git >nul 2>&1
if errorlevel 1 (
  set "LIGNE=git est introuvable sur ce PC : rien n'est sauve"
  goto echec
)
where node >nul 2>&1
if errorlevel 1 (
  set "LIGNE=node est introuvable sur ce PC : rien n'est sauve"
  goto echec
)

REM ----- la branche : jamais main, jamais bots-ecurie, seulement une branche "evolution-..." -----
set "BRANCHE="
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "BRANCHE=%%b"
if not defined BRANCHE (
  set "LIGNE=ce dossier n'est pas un depot git : rien n'est sauve"
  goto refus
)
if /i "!BRANCHE!"=="main" (
  set "LIGNE=refuse : la branche courante est main. Les traces ne se sauvent que sur la branche de la selection, evolution-NOMDUPC"
  goto refus
)
if /i "!BRANCHE!"=="bots-ecurie" (
  set "LIGNE=refuse : la branche courante est bots-ecurie. Les traces ne se sauvent que sur la branche de la selection, evolution-NOMDUPC"
  goto refus
)
if /i not "!BRANCHE:~0,10!"=="evolution-" (
  set "LIGNE=refuse : la branche courante est !BRANCHE!, pas une branche evolution-NOMDUPC"
  goto refus
)
REM ----- une fusion, un cherry-pick ou un revert pas finis : on n'y touche pas -----
set "ENCOURS="
for %%r in (MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD) do (
  git rev-parse -q --verify %%r >nul 2>&1
  if not errorlevel 1 set "ENCOURS=%%r"
)
for /f "delims=" %%u in ('git ls-files -u 2^>nul') do set "ENCOURS=conflits"
if defined ENCOURS (
  set "LIGNE=refuse : une operation git n'est pas finie dans ce dossier (!ENCOURS!) ; rien n'est touche"
  goto refus
)
REM (27/11/2026, Fable) le nom du PC dans les commits = la fin du nom de la branche (evolution-ryzen donne ryzen), un nom choisi par Sacha :
REM le nom Windows du PC ne part pas sur GitHub (le depot est public).
set "PC=!BRANCHE:~10!"
if not defined PC set "PC=pc"

REM ----- 1. les pages, refaites a partir des journaux -----
node "%ICI%tableau.js" >>"%DETAIL%" 2>&1
if errorlevel 1 (
  node "%ICI%arbre.js" >>"%DETAIL%" 2>&1
  node "%ICI%histoire.js" >>"%DETAIL%" 2>&1
)

REM ----- 2. ce qui est leger, et seulement cela : les journaux d'abord (ils disent s'il y a du nouveau), puis les pages -----
set "JOURNAUX="
for %%f in (population.json generations.jsonl validations.jsonl morts.jsonl coffre.jsonl machine.json) do (
  if exist "%ETAT%\%%f" set "JOURNAUX=!JOURNAUX! ml/evolution/etat/%%f"
)
REM champions\ seulement s'il porte un champion (un dossier vide ou de seuls .tmp ferait echouer le commit)
set "CHAMP="
if exist "%ICI%champions\*.js" set "CHAMP=1"
if exist "%ICI%champions\*.json" set "CHAMP=1"
if defined CHAMP set "JOURNAUX=!JOURNAUX! ml/evolution/champions"
set "PAGES="
for %%f in (arbre.html histoire.md tableau.html resume.txt) do (
  if exist "%ETAT%\%%f" set "PAGES=!PAGES! ml/evolution/etat/%%f"
)
if not defined JOURNAUX (
  set "FAIT=rien a sauver (aucun journal dans ml\evolution\etat)"
  goto envoi
)
git add -- !JOURNAUX! >>"%DETAIL%" 2>&1
if errorlevel 1 (
  set "LIGNE=git add a echoue : voir ml\evolution\etat\traces.log"
  goto echec
)
set "NOUVEAU="
git diff --cached --quiet -- !JOURNAUX!
if errorlevel 1 set "NOUVEAU=1"
REM une page encore jamais sauvee compte comme du nouveau
for %%f in (!PAGES!) do (
  git ls-files --error-unmatch -- %%f >nul 2>&1
  if errorlevel 1 set "NOUVEAU=1"
)
if not defined NOUVEAU (
  set "FAIT=rien de nouveau depuis la derniere sauvegarde"
  goto envoi
)
if defined PAGES (
  git add -- !PAGES! >>"%DETAIL%" 2>&1
  if errorlevel 1 (
    set "LIGNE=git add a echoue : voir ml\evolution\etat\traces.log"
    goto echec
  )
)

REM ----- 3. le commit local (avec une identite de repli si git ne connait pas encore celle de ce PC) -----
set "MSG="
for /f "delims=" %%m in ('node "%ICI%histoire.js" --message 2^>nul') do set "MSG=%%m"
if not defined MSG set "MSG=traces"
set "QUI="
git config user.email >nul 2>&1
if errorlevel 1 set QUI=-c "user.name=selection CASH CAR (!PC!)" -c "user.email=selection@!PC!.invalid"
git !QUI! commit --only -m "BOTS-ML evolution !PC! : !MSG!" -- !JOURNAUX! !PAGES! >>"%DETAIL%" 2>&1
if errorlevel 1 (
  set "LIGNE=le commit a echoue : voir ml\evolution\etat\traces.log"
  goto echec
)
set "FAIT=commit fait (!MSG!)"
REM un depot qui recoit un commit par heure se range de temps en temps (les journaux qui grossissent se compriment entre eux)
git -c gc.auto=500 gc --auto --quiet >>"%DETAIL%" 2>&1

REM ----- 4. l'envoi, sur la branche courante (une branche evolution-..., verifiee plus haut) -----
:envoi
if exist "%ETAT%\PAS-D-ENVOI" (
  set "ENVOI=rien d'envoye (le fichier etat\PAS-D-ENVOI existe)"
  goto bilan
)
REM un envoi qui ne transmet plus rien pendant 2 minutes est coupe (la tache de l'heure suivante ne doit pas trouver celle-ci encore la)
git -c http.lowSpeedLimit=1 -c http.lowSpeedTime=120 push origin HEAD:refs/heads/!BRANCHE! >>"%DETAIL%" 2>&1
if errorlevel 1 (
  set "ENVOI=envoi rate (pas de reseau ou pas de droits ? detail dans etat\traces.log) : on reessaiera la prochaine fois, le commit local protege deja"
) else (
  set "ENVOI=envoye sur la branche !BRANCHE!"
)

:bilan
set "LIGNE=!FAIT! ; !ENVOI!"
call :dire
if "%MODE%"=="main" (
  echo.
  echo   Traces : !LIGNE!
  echo.
  pause
)
exit /b 0

:refus
call :dire
if "%MODE%"=="main" (
  echo.
  echo   Traces : !LIGNE!
  echo.
  pause
)
exit /b 2

:echec
call :dire
if "%MODE%"=="main" (
  echo.
  echo   Traces : !LIGNE!
  echo.
  pause
)
exit /b 1

REM la ligne de bilan : dans sortie.log si personne ne le tient, sinon dans traces.log
REM (27/11/2026, l'integrateur) traces.log peut etre encore tenu un instant par un enfant de git (ssh apres un envoi rate) : la ligne
REM s'y perdait parfois (vu dans tests/relecture-traces.test.js) ; on reessaie 5 fois, une seconde d'ecart.
:dire
set /a ESSAI=0
:dire_encore
set "ECRIT="
(>>"%DETAIL%" echo [%date% %time%] sauver-traces : !LIGNE!) 2>nul && set "ECRIT=1"
if not defined ECRIT if !ESSAI! LSS 5 (
  set /a ESSAI+=1
  ping -n 2 127.0.0.1 >nul
  goto dire_encore
)
(>>"%JOURNAL%" echo [%date% %time%] sauver-traces : !LIGNE!) 2>nul
exit /b 0
