# PASSATION — session DEBUGGING (chasse aux bugs avant sortie App Store) — 14/10, 13 h 30, Mac → PC

Mission donnée par Sacha : le jeu doit être **irréprochable sur mobile** (iPhone : app WKWebView/Capacitor + Safari iOS, couché 844×390,
debout 390×844, 30/60/120 i/s) — aucun bug, aucune collision fausse. Depuis 6 h 10 : la **PROPRETÉ** (chaque accroc visible : clignotement,
apparition brutale, chevauchement, texte coupé/doublé, transition qui saute, son tiré deux fois, état bizarre après pause / rotation /
arrière-plan, incohérence entre écrans) + la **revue des poussées de Léo** à chaque train. « Tu tranches, réversible, sans question à Sacha. »
Ordres : PILOTAGE (voir `PROTOCOLE-PC.md` sur `origin/pilotage-notes`).

## Où
- Branche `debug-integration` (celle-ci) = `assemblage` T6 (`242da07`) + nos correctifs. Rien d'autre à intégrer : aucune autre branche à moi.
- `passation/preuves/` : les preuves node AUTONOMES (seul `fs`/`vm`), chacune extrait le VRAI code de `index.html` et l'exécute avec des bouchons.
  Toujours passer le chemin : `node passation/preuves/preuve-X.cjs "VERSION PRINCIPALE/index.html"` → `OK` / `PREUVE OK`.
  `preuve-ramasse.cjs` prend DEUX fichiers : `[corrigé] [ancien]`. `syntaxe.cjs <index.html>` → « erreurs de syntaxe: 0 ».
  `preuve-balayage.cjs` a des chemins Mac par défaut : passer le fichier en argument.

## Fait (tout est dans cette branche ; prouvé node = KO sur le train nu, OK ici)
- Collisions balayées (segment de l'image contre la boîte) : trafic (`traficTick`) et satellites (`satHard`) — partis aux trains T1/T2, prouvé + vu en jeu à 30 i/s.
- Ramassage balayé à 30 i/s (`pickupsTick`, `ramD`) : l'ancien code ratait une pièce sur la ligne dès 1 080 km/h à 30 i/s ; 60/120 inchangés. Node.
- Sauvegarde (`SAVE.load/flush`, `commitExploits`) : purge iOS + appli tuée au démarrage → plus d'écrasement du miroir natif Preferences (perte totale) ;
  localStorage plein → Preferences reçoit quand même ; money NaN ne vide plus la banque. Node (`preuve-sauvegarde`, 2000 sauvegardes mutées).
- Nitro : mourir NITRO tenue ne fait plus de PSSHT / pétarade / vibration fantômes au départ suivant (`resetGame`) ; plus de PSSHT sur la caisse qui explose. Node.
- Cycle de vie : arrière-plan pendant l'explosion → plus de PAUSE sur la caisse qui brûle (retour = `boomSkip`). Rafales + vu en jeu.
- Pause : QUITTER et RECOMMENCER passent par le volet sans dépauser (plus de musique abandonnée relancée, plus de « GO ! » sous l'écran de fin). Vu en jeu.
- Tactile : ⏸ répond au 2e doigt quand NITRO/volant est tenu ; verrous double-tap (pause → RÉGLAGES, OFFRES/ANNULER, `shopPopFerme`, MISSIONS). Vu en jeu.
- Portail + mort dans les 2 images d'attente → l'écran de mort arrive (`portPasseNiveau`). Couple annoncé par la vitrine invalidé quand REJOUER tire le sien
  (`lvlChoisir`). Compteur « $…5.100 » corrigé (`fmtGta`). VEQ (saut NITRO de la partie d'avant). `eauPTick` (Jade : ReferenceError). Rotation : canvas
  de l'écran titre et cadrage accueil/garage suivent la rotation. `parisFinale`, `hautVide`, `garMode`. Node et/ou banc.
- Vu PROPRE en rafales (couché + debout, 33 transitions) : garage, inventaire, réglages, missions, carrière, JOUER, pause ×4, rotations, arrière-plan,
  mort → menus, parcours debout 5 portails avec pause + rotation (caisse vivante, 0 erreur JS, DOM stable).
- Relus sans défaut : `loop` ligne à ligne (dt borné [0 ; 0,05], rAF ré-armé en tête, `cadSaute` 60-144 Hz, ressorts stables) ; tout le JS de T5 aux coutures
  entre sessions (aucun reste POKI/zh/crypto appelé ; aucun minuteur T5 en images).

## Non intégré / en cours au moment de la migration
- Vérification EN JEU avant/après des correctifs prouvés seulement en node : arrêtée par la migration, RIEN d'établi (ni OK ni KO).
  Ramassage : rendement en pièces/m indiscernable avant/après (≈ 0,020), car la piste change d'un essai à l'autre — il faut poser des pièces à la main
  pour un vrai A/B. Nitro : le PSSHT n'a pas été reproduit AVANT avec `dbgAuto` (nit:1) — il faut un vrai doigt sur `#tNitroZone` et compter `blowOff`
  lui-même (son synthétisé, peut-être hors `CCSON.play`). Rotation, portail + mort, localStorage qui jette : non faits. **À REFAIRE** (voir « Suite »).
- Rien d'autre : tous les commits vérifiés sont dans cette branche.

## Suite, par priorité
1. Après la fusion de `origin/main` (habillages POP `2289498`, train T7) : **carnets POP aux places 10-12** de la suite sans fin → un joueur à `s.n` 9-11
   voit des coches qu'il n'a pas faites (remettre `ok`/`best` à zéro une fois à la migration). Vérifier aussi que la fusion a suivi les consignes
   (sinon « CASH CAR a calé » au lancement : POKI/I18N_ZH, ou plantage à chaque image : TRX/AILES_POP manquants) — détail envoyé à PILOTAGE.
2. Voir EN JEU, à 30 i/s forcé (`dbgCadence(30)`) : ramassage à ≥ 1 100 km/h ; mourir NITRO tenue puis REJOUER (aucun PSSHT) ; tourner avant le 1er toucher.
3. Pas établi : `qNetDefaut` (sauvegarde neuve vs vieille, cohérence RÉGLAGES › IMAGE) ; nouvelles étapes de chauffe (WOW, dragon) dans `chauffeDivers`
   sous `try` ? ; clés « NOUVEAU MOTEUR », « MEILLEUR », « PALIER » en FR + EN ; ÉQUIPER → course → RETOUR (`__offGar`, porte OFFRES introuvable au banc).
4. S3 laissés : deux onglets web s'écrasent la sauvegarde ; JSON illisible → sauvegarde neuve sans consulter le miroir natif ; `best` non borné dans `san`.
5. Bug son signalé par Sacha « dans la boutique quand on appuie sur le nitro » : **NON reproduit** (instrumentation audio complète + lecture). Écarté :
   état nitro resté vrai au garage (aucun son hors porte de simulation), NITRO injoignable au doigt hors course. Questions posées à Sacha, sans réponse :
   quel son (continue / manque / craque / doublé) ? quel NITRO (bouton en course après la boutique, ou dans la boutique) ? quand ? quel appareil
   (app/Safari, silencieux, Bluetooth) ? Fragilité notée pour Léo (zone gelée) : `garMode('menu')` ne coupe pas `bqSon` ; `garageRender` sort vers
   `chuteRender` avant `garBqIndus`.

## Décisions de Sacha en attente (ne pas trancher seul)
- Satellites `o.fait` non ré-armé en FACILE ; `villeFinale` saute PARIS ; éléments traversables à 30 i/s (annexes des tours, mèches CRYPTO, rochers de jade —
  en faveur du joueur) ; chaîne d'aura ouverte en vol non encaissée à une fin de monde réussie (`endGame` exige mode drive — économie verrouillée) ;
  mort → MISSIONS → ◀ ramène à l'accueil, pas à l'écran de mort (`garMisRetour`).
- Tranché : collisions balayées AVANT la cadence 30 i/s (fait, 30 i/s rouverte à T5) ; plus de nom de rang d'aura à l'écran (chiffre seul).

## Notes pour les autres sessions (déjà transmises)
- SON : `ui.danger` doublé (13-76 ms) si on confirme QUITTER/RECOMMENCER < 0,7 s après la modale — `uiClic` diffère le clic en pause et relâche deux attentes ;
  `impactSnd` retombe sur `noiseBurst` si `sfx()` rend null (sourdine ?) ; `musTrim` relu toutes les 400 ms.
- GRAPHISME : carte MOTEUR de l'écran de mort chauffe comme sous nitro si mort NITRO tenue ; texture `plaBilletBtc` affiche encore « CRYPTOCITY ».
- INTERFACE : RETOUR en bas (OFFRES/MODES/MISSIONS) vs ◀ en haut ailleurs ; RÉGLAGES sans volet depuis la mort ; noms de rang d'aura réaffichés par main
  (`#auraSub`, `.aura` de `#gBank`, aria-label `#gAuraC`).
- OPTIMISATION : `dogeTete` ≈ 520 ms synchrone au 1er Doge ; crâne Doge renvoyé au GPU à chaque image ; TRX sans palier PAL ; ailes POP 30-68 maillages.
- GAMEPLAY : défis « ENCAISSE X » un peu plus durs sans la prime des plots.

## Règles
- INTOUCHABLES : burn-out de Léo (`BURN`, `DON`, tout `burn*`/`don*`), boutique 3D (`garBq*`, `bq*`, `GBQ`, `BQSON`), modèles des voitures, morceaux de
  musique de Léo. Gameplay / sensations / économie VERROUILLÉS (`TCTL`, braquage, `sens*`, prix, gains). On ne supprime aucune fonctionnalité.
- Plus de chinois (`I18N_ZH`, `LANG==='zh'`), de POKI (`POKI`, `pk(`, `html.poki`), de CRYPTOCITY : n'en réintroduire aucun.
  Contrôle : `grep -c "I18N_ZH\|LANG==='zh'\|html\.c6\.poki\|html\.poki" "VERSION PRINCIPALE/index.html"` = 0.
- JAMAIS `main` (main = publication Vercel, c'est Sacha qui décide), jamais `--force`. Ne pas toucher `sw.js` ni les `CLAUDE.md`.
- Un correctif = le plus petit changement, commentaire daté `// (2026-10-14, chasse aux bugs) …` qui dit pourquoi, un commit, preuve avant/après.
  Après chaque correctif : syntaxe 0, `sh garde-burnout.sh "VERSION PRINCIPALE/index.html"` → OK.

## Tester sans les bancs du Mac
- `cd "VERSION PRINCIPALE" && python3 -m http.server 8000` → http://localhost:8000/index.html (couché) ; `index.html?colonne=portrait` (debout).
- Paramètres utiles : `?colonne=portrait`, `?ui=5` (ancienne interface), `?voix=1` (annonceur, coupé par défaut).
- Crochets console `window.dbg*` (outils de banc, pas des bugs) : `dbgState()` (état), `dbgAuto(1)` (pilote auto, la caisse survit),
  `dbgCadence(30)` (force 30 i/s), `dbgStep(n)` (pas à pas), `dbgEco()`, `dbgNitro`, `dbgEau()` (plongeon Jade), `dbgSaut`, `dbgVol`, `dbgOrbite`.
- Fumée minimale à la main : accueil → JOUER → course → mort → REJOUER → mort → accueil, en couché ET debout, console sans erreur.
