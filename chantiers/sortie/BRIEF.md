# CASH CAR — PASSE DE SORTIE (2026-10-13, 2e lancement) — RÈGLES COMMUNES À TOUS LES AGENTS

Sacha (créateur du jeu, avec Léo) : « le jeu sort demain. Prends des initiatives, refontes totales permises, tout doit être parfait :
chaque bouton à la bonne place, à la bonne taille, aligné, dans un ordre logique ; les animations de chaque bouton, les transitions
entre chaque écran ; fais des captures de CHAQUE écran et demande-toi à chaque fois si chaque chose est à sa place, à la bonne
taille, parfaitement alignée. Optimisation mobile parfaite (doit tourner sur un iPhone 7). Pousse les graphismes, shaders,
particules ; débogue les interactions particules/véhicules. Chaque ambiance de chaque niveau, chaque heure, chaque météo : des
couleurs belles, une UNITÉ GLOBALE de colorimétrie, une harmonie visuelle d'espace en espace. Pas de travail bâclé cette fois. »

Tu fais partie d'une équipe de 10 agents qui travaillent EN MÊME TEMPS sur le même jeu, chacun dans SA copie git.

## ⚠ LEÇON DU 1er LANCEMENT : COMMITE SOUVENT
Au 1er lancement, la limite d'usage a coupé tous les agents au bout d'une heure et leur dossier temporaire a été effacé : TOUT ce qui
n'était pas commité a été perdu. Donc : **un commit après CHAQUE correctif qui marche** (et au minimum toutes les 20 minutes, un commit
« (en cours) » si besoin). Tes notes `$R/notes/<ton-nom>.md` : mets-les à jour au fil de l'eau, pas à la fin. Tes scripts de banc :
range-les dans `$R/banc/<ton-nom>/` (permanent), pas dans /tmp.

## Le jeu
- Un seul fichier : `<ta copie>/VERSION PRINCIPALE/index.html` — 5 Mo, ~51 000 lignes, Three.js, tout dans une IIFE.
  ⚠ quelques lignes font > 5 000 caractères : ne JAMAIS `cat` le fichier ; utiliser `grep -n … | cut -c1-300`, `sed -n 'A,Bp' | cut -c1-400`,
  ou Read avec offset/limit. Chercher par nom de fonction / id / commentaire daté.
- Le guide : `VERSION PRINCIPALE/CLAUDE.md` (800 Ko, l'historique de toutes les décisions, sections datées avec les citations de
  Sacha et Léo, les plus récentes en haut). NE PAS le lire en entier : `grep -n '^## ' CLAUDE.md` puis lire les sections de ta zone.
  Les choix qui y sont tranchés par Sacha/Léo comptent ; tu peux améliorer, pas trahir l'intention.
- Les fonctions du jeu sont privées ; seules les `window.dbg*` sont accessibles depuis le banc (dbgState, dbgTouch, dbgPerf, dbgQual,
  dbgDPR, dbgGfx, dbgHeure, dbgAmb, dbgDA, dbgNiveau, dbgLvl, dbgSaut, dbgPortail, dbgDeathNow, dbgFin, dbgGarage, dbgCarriere,
  dbgMissions, dbgJade, dbgPart, dbgFx, dbgTuto, dbgFacile, dbgAuto, dbgRoule… — `grep -o 'window\.dbg[A-Za-z0-9_]*' index.html | sort -u`).
  Tu peux AJOUTER des `window.dbgXxx` pour tes bancs (préfixe dbg, une ligne, commentaire « banc »).
- Tout frais (13/10) et à respecter :
  · le MODE CLASSIQUE AU HASARD (Sacha) : JOUER tire une map ET une météo au hasard (`classiqueJouer`, `SF`, `sfTire`, `sfPlayOk`),
    chaque portail en tire d'autres ; le SOLEIL DE JADE ne se lance plus au JOUER que par `?play=jade` ;
  · CRYPTOCITY (Léo, `?niveau=crypto`, `cryptoJouer`, `NIV_CRYPTO`) : la ville en BULL RUN ;
  · le GARAGE ÉPURÉ et la BOUTIQUE SANS ONGLET OFFRES (Sacha, `<style id="garageEpure">`), la maison de HOME détourée ;
  · la boutique 3D de Léo (rotonde, bras d'atelier, la prise au doigt), les voitures « vrais modèles » de Léo ;
  · la CARTE DE JADE GARDÉE d'une partie à l'autre (`jadeRange`, `jadeEtatVide` — passe perf d'une autre session).

## Ta copie, ton serveur, ton banc
- `R=/Users/sachaberes/cash-car/sortie` (dossier permanent). Copie git : `$R/wt/<ton-nom>` (branche `sortie2/<ton-nom>`).
- Ton serveur tourne déjà : `http://localhost:<ton-port>/index.html` (il sert TA copie ; voir `$R/ports.txt`). S'il est tombé :
  `cd "$R/wt/<nom>/VERSION PRINCIPALE" && python3 -m http.server <port> --bind 0.0.0.0` (Bash en arrière-plan).
- Banc commun (Chrome sans fenêtre, GPU Metal, vrais doigts tactiles) : `$R/banc/lib.cjs` — LIS-LE (130 lignes). Exemple :
  ```js
  const B=require('/Users/sachaberes/cash-car/sortie/banc/lib.cjs');
  (async()=>{ const s=await B.ouvre({port:8201, vp:'couche', marges:true, dir:'/Users/sachaberes/cash-car/sortie/shots/<nom>', lang:'fr'});
    await s.shot('accueil'); const a=await s.boutons(); console.log(a.problemes.join('\n'));
    await s.jouer(); await s.attendCourse(); await s.shot('course');
    console.log(s.errs.join('\n')||'0 erreur'); await s.ferme(); process.exit(0); })();
  ```
  - écrans : `couche` 844×390 (référence : iPhone 12-15 couché), `debout` 390×844, `i7couche` 667×375 / `i7debout` 375×667
    (iPhone 7/8/SE), `maxcouche` 932×430, `ipad`. `marges:true` = les zones sûres de l'iPhone (encoche 47 px couché, barre 21/34 px).
  - `save:{…}` fusionné avec `{tuto:1,permis:1,ast:3,shopVu:1,facile:0}` ; `save:null` = joueur NEUF (auto-école, choix FACILE…).
    Champs utiles : `bank` (argent), `aura`, `owned:[…]`, `equipped`… (voir `def()` : `grep -n "K:'cashcarSave'" index.html`).
  - `q:'?niveau=crypto'` / `q:'?play=jade'` pour lancer ces niveaux au JOUER.
  - `cpu:4` (ou 6) = processeur ralenti façon vieux téléphone (CDP). `s.perf()` = dbgPerf(). `s.boutons()` = audit automatique de
    chaque élément touchable visible (PETIT < 44 px, HORS ÉCRAN, DANS LA MARGE, MASQUÉ, TEXTE COUPÉ, CHEVAUCHE) — un outil, pas une
    vérité : regarde aussi les captures.
  - La machine est TRÈS chargée (d'autres sessions tournent aussi) : le chargement prend 20-60 s, et au plus 4 navigateurs tournent à la
    fois (sémaphore : tu attends ton tour). ⇒ fais BEAUCOUP de vérifications par ouverture. Toujours `await s.ferme(); process.exit(0)`.
    Lance les longs scripts avec Bash en arrière-plan (`run_in_background`) et un fichier de log.
  - `B.planche([{f:'a.png',t:'légende'},…], 'sortie.png', {cols:3})` assemble des captures en planche contact.
- REGARDE tes captures (outil Read sur le .png). C'est l'œil qui juge : alignement, tailles, marges, lisibilité, harmonie.
- Vérif syntaxe après chaque modif : `node $R/banc/syntaxe.cjs "$R/wt/<nom>/VERSION PRINCIPALE/index.html"` → 0 erreur.

## Règles git (ABSOLUES)
- Tu travailles UNIQUEMENT dans ta copie `$R/wt/<ton-nom>`. Jamais dans `/Users/sachaberes/cash-car/game`, ni `ios-capacitor`, ni ailleurs.
- Commits fréquents, message en français, style du dépôt : « Zone : ce qui change (passe de sortie) », terminé par la ligne
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- JAMAIS : push, merge d'une autre branche, rebase, reset --hard, `git stash` (pile partagée entre sessions), toucher à `main`, supprimer une branche.
- Ne touche PAS : `sw.js` (l'intégrateur l'incrémente), les `CLAUDE.md` (tes notes vont dans `$R/notes/<ton-nom>.md`),
  `ROBLOX/`, `AUTRE VERSION/`, `version-leolei-2026/`, `app-ios/`, `simulateur*`, `maps-ciel*`, `salle-blanche*`, `boite-*`.

## Ce qui est INTOUCHABLE
- Le BURN-OUT du garage = travail de Léo (`BURN`, `DON`, `burnPart`, `burnGeste`, `burnDerape`, `burnCubes`, `BURN_TENU`, `BURN_FS_FUM`,
  tout ce qui commence par burn/don) : on ne le modifie pas, on ne le supprime pas. Une garde bloque la publication sans lui
  (`sh garde-burnout.sh` à la racine de ta copie doit dire OK).
- La construction de la carte du SOLEIL DE JADE (`buildJade`, `voxMesh`, `jadePorte`, `jadeGabarits`, `jadeRange`, `jadeEtatVide`,
  `jadeJette`) : une AUTRE session l'optimise. N'y touche pas (le gameplay/l'éclairage du niveau jade ailleurs reste permis).
- Ne supprime pas une fonctionnalité ni une création signée de Léo (boutique 3D, bras d'atelier, rotonde, dauphins, vitrail, singes,
  Soleil de Jade et son eau, CRYPTOCITY, burn-out, dragon de NITROOO, voitures). Tu peux la polir ; pour la retirer/remplacer : PROPOSITION dans tes notes.

## Travailler à 10 sur le même fichier
- Chaque agent a une ZONE. Hors de ta zone : tu notes dans `$R/notes/<ton-nom>.md`, section « POUR LES AUTRES », sans modifier
  (sauf correctif d'une ligne évidemment sans risque). Lis de temps en temps les notes des autres (`ls $R/notes`).
- Modifs CHIRURGICALES : pas de reformatage, pas de réindentation, pas de déplacement de gros blocs, pas de renommage global.
  Ajoute plutôt que réécrire. Une règle CSS nouvelle peut aller dans un `<style id="sortie-<ton-nom>">` à toi, posé juste avant
  `</head>` (zéro conflit avec les autres), si l'ordre de cascade le permet.
- Style du code : commentaires en français, datés « (2026-10-13, passe de sortie) », qui disent POURQUOI. Mesure avant/après.

## Qualité exigée
- 0 erreur JS (pageerror / console.error / 404 autre que dark-triad.mp3) au banc, sur chaque parcours que tu touches.
- Avant de rendre : menu → JOUER → course doit marcher COUCHÉ et DEBOUT (et iPhone 7 si tu touches au rendu/à l'interface).
- Ne JAMAIS dégrader l'iPhone 7 pour embellir l'iPhone 15 : tout surcoût graphique passe par les crans de qualité (QUAL_LOW / QUAL_MED /
  FULL, `qlPose`, `qlBornes`, DPR adaptatif — voir dbgQual / dbgPerf).
- Captures AVANT (au début) et APRÈS (à la fin) dans `$R/shots/<ton-nom>/`, + planches `planche-avant.png` / `planche-apres.png`.

## À rendre
1. Commits sur ta branche `sortie2/<ton-nom>` (`git status` propre à la fin).
2. `$R/notes/<ton-nom>.md` : ce que tu as changé (fonctions/sélecteurs, pourquoi, mesures), les planches, ce qui reste, les
   questions à trancher par Sacha/Léo, et « POUR LES AUTRES ». Écrit pour être versé dans le guide du jeu.
3. Ton dernier message : un rapport court en français (≤ 40 lignes) : fait / mesuré / reste / risques de fusion (zones du fichier touchées).
