# ALLÈGEMENT — LOT G « musique » (18/10/2026) — branche `al-musique`, base 024675ba

Gagné : **≈ 88,2 Mo** dans `assets/audio/` + sons-banque.js ; index.html −25,5 Ko, bibliothèque.html −3,6 Ko. Le jeu par défaut ne change pas.

## Ce qui est parti
- **46 · GLISSE v2 / JMUS** : le bloc `JMUS` (≈ 50 lignes), `jadeMus*`, `MUSJ`, `JMUS_TON`, les 3 appels (`jadeTick`, `jadeJouer`, `classiqueJouer`,
  boucle principale : le `else{jadeMusTick()}` seul), `assets/audio/music/musique-glisse-v2.js`, `direct/musique-glisse-v2.js` (le simulateur garde sa copie).
  `direct/musique-glisse.js` (v1) reste : la bibliothèque la joue. Pouce bleu joue SEUL en course : `pbjRegne()` = `POUCE_JEU` chargé ET pas d'auto-école.
- **Tables de radio** : `MUSIC_LIEU`, `MUSIC_CIEL(_TOUT)`, `MUSIC_VILLE`, `MUSIC_LOBBY`/`MUSIC`, `?ecole=` (ECOLE_MUS fixé sur PREMIER MATIN),
  `MENU_MUS.on`, `PBJ_ON` (`?musique=niveaux`). `MUSIC_TRACKS` GARDÉ = `[ECOLE_MUS]` : `musicStartRun` sort sans pool et l'auto-école ne partirait pas.
  `MUS_SONIE`, `SON_TON`, `musique-bus.js` (PRESETS) et `musicLieuVoulu` réduits aux morceaux qui jouent encore.
- **56** `lobby-chris/` (12,7 Mo) ; sa bibliothèque pointe sur `lobby/` (`lobby/chris-donnees.js`, PREMIER MATIN seul).
- **57** `rendus/penthouse-v2/` (2,9) · **58** `rendus/{ciel,siffleur,aura}/` à 8 paliers (12,4 ; entrées retirées de `rendus/index.js` ; rien d'autre ne les lisait :
  Pouce bleu ne prend que neon-noir, nuit-de-velours + 3 pages HTML) · **59** `musique-trente-{trio,v5-0,v4-0,v3-11}.js` (1,0 ; la section « Nouveaux » de la bibliothèque,
  qui construisait `v:'trio'`, part avec).
- **60** (58,2 Mo) : lvl1, lvl2, addictive-loop, noite, swag, glassy-plucks (19,8), `ciel/` (14,8), `ville/` (10,9), `lobby/chris-{dimanche,nuit,polaroid,ciel,siffleur}` (12,7),
  + leurs listes dans la bibliothèque (CIEL, VILLE_N, Anciens, pm-siffleur) et `harmonie.js` (20 Ko : toutes ses fiches étaient celles de ces morceaux ; INSTRU est coupé).
- **17+62** banque : −20 sons (394 687 o) → fig.dauphin, fig.dauphinRoyal, jeu.dauphin, singe.troupe, fig.snake, verdict.meteor, verdict.mega, fig.meteore, plot, porte,
  vitesse.pure, mallette.chaude, monde.fin, panne.gresille, rival.devant, rival.passe, radar, trafic.accroche, abri, pad.neon. Ajoutés à `RETIRES` de cuire.js (recettes gardées
  en archive). Banque réécrite avec cuire.js en GARDANT l'étalon MP3 existant (un ffmpeg récent le réencode autrement) : les 241 autres sons sont identiques au bit près.
  `sons-banque.js?v=31`. SON_DUCK/SON_PENTA, `rewardSfx`, `figSnd`, sons.html (démo NITROOO) nettoyés.

## Gardés malgré la liste (un appelant VIVANT les joue)
rival.boum, alerte.dernier (SURVIVANT : bouton, `survTick`/`botBoom`) · fantome.accroche, fantome.prise, defaite (la CAISSE-NUAGE, événement rare : `evtTick`→`fantomeTick`) ·
fourgon.porte (`gAtelier`, l'atelier du garage) · fourgon.billets (`richCoup`/`richEclate`, la pluie de richesse) · dauphin.banc (dauphins de Jade) · cratere, nitrooo.palier.
« Sons des moutons » : le seul exclusif des moutons/campagne est `pad.neon` (retiré) ; `nuage.defonce` et `victoire` servent ailleurs.

## 61 · échantillons vrais/ — preuve et limite
Rejeu hors navigateur (Node, `prepare()` de chaque générateur, son factice, chaque `fetch` noté) : les **15 musiques de Pouce bleu** (+ retouches `direct`) demandent **99 fichiers sur 385**
(déterministe : 2 rejeux identiques). MAIS un tirage libre (balayage des graines 0-99999 × v3-7, v3-9, v3-10, v6-0, actuelle × DA cashcar/dubstep/hybride) en demande **336**, donc
le générateur EN DIRECT de la bibliothèque (et tout futur 👍 de Léo) peut en avoir besoin. Preuve complète seulement pour **33 fichiers (20 instruments, 0,52 Mo)** : aucun nom nulle part dans le code
→ supprimés + index. Les 253 autres (50 instruments, 4,4 Mo) : commit prêt sur la branche **`al-musique-vrais-jeu`** (1e37be9e), à cherry-picker si Sacha accepte que le générateur en direct perde ces instruments.
Contrôle après suppression : mêmes 99 fichiers, 0 fichier absent, sur les 15 musiques ET sur 900 000 graines.

## À retirer par les autres lots (appels restés dans du code mort, sans effet : `sfx` d'un id inconnu rend null)
plot (`coneSnd`), porte (boucle, branche CONES) · monde.fin (`campFinale`, `espaceFinale`, `parisFinale`, `villeFinale`) · panne.gresille (`panneTick`) · rival.devant/passe (`banquierTick`) ·
radar (`radarSnd`) · trafic.accroche (`traficChoc`) · abri (`campBancSorti`, `foudreFrappe`, `debFrappe`) · pad.neon (`campPortesTick`, `campMoutonsTick`, `campPad`).

## Reste / à décider
- `maps-ciel.html` (outil de Léo) pointe encore ses aperçus sur ciel/, ville/, noite, swag… (déjà plusieurs liens morts) ; `ROBLOX/outils/preparer-sons.js` nomme des sons retirés (il écrit « absent » et continue) ;
  `atelier-son/gouts_mesures.py` lit `rendus/aura/p8.m4a` ; les scripts `lobby_chris.py` etc. réécriraient les dossiers partis.
- Non demandés mais candidats : `lobby/garage-{atelier,huile,cle}.m4a` (8,4 Mo, « ne jouent plus dans le jeu »), `rendus/penthouse/` (3 Mo), `INSTRU` (coupé) + `instruMusiqueOk`.
- `MUSIC_FREN` pointe vers `music/dark-triad.mp3`, absent (le morceau est `boucles/dark-triad.m4a`) : NON corrigé, comme demandé ; la frénésie ne change pas de morceau.
- Si Pouce bleu ne se charge pas (`POUCE_JEU` absent), la course joue maintenant PREMIER MATIN en boucle (avant : la radio lvl1…) au lieu de rien/radio.

## 2e passe (sur l'ensemble assemblé, branche al-musique2)
- **Banque −11 sons** (sons-banque.js 7,01 → 6,72 Mo, ?v=32) : fig.gap, dosdane, debris.esquive, banq.bris, flaque.sec, portail.ouvre, foudre.touche, aura.moyenne, ui.carnet,
  mort.feu, mort.foudre (aucune mort n'a la cause « feu » ni « sat »). foret.mousse n'était déjà plus dans la banque. Les `sfx` des sons retirés à la 1re passe ont disparu du code avec les lots B/D/E.
- **assets/audio/announcer, fx/wow.mp3, death/eww.m4a** : déjà absents du dépôt depuis 990b4ce5, aucun chemin ne les demande (rien à supprimer).
- **La bibliothèque n'est plus publiée** (ligne 63) : `vercel-build.sh` + `outils/publie-audio.cjs` (règle de Pouce bleu relue dans musique-moteur.json) + `outils/vrais-jeu.json`
  (preuve des échantillons, refaite par `node outils/preuve-vrais/rejoue.mjs` ; si l'empreinte ne colle plus, vrais/ reste entier). Copie en ligne : 94,7 → 36,3 Mo (621 → 235 fichiers).
