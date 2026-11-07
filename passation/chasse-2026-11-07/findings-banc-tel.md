# Chasse — banc téléphone (headless 390×844, tactile) — agent Opus, 2026-11-07

Bilan : 0 bloquant, 2 majeurs, 5 mineurs. ~2 h de jeu headless, 0 exception JS, 0 erreur console du jeu, 0 warning three.js. Journaux et 135+ captures : chasse/banc-tel/ (journal.md, log*.txt, resB-tout.json, shots/). Sauvegarde pré-semée sfx/mus/vox:false (clés lues par sauvegarde.js ; la langue est `localStorage.ccLang`). Chargé avec `?garde=1&tel=1&intro=ancien&attente=0`.

## A. Scénarios
| Scénario | Résultat | Erreurs | Capture |
|---|---|---|---|
| A état | `__gameReady` 3,2-4,2 s (chaud), menu présent | 0 | A-menu-1.png (ouroboros sur le titre, TEL-N06) |
| B 10 maps × 2 météos (`dbgClassique(c,m)`, `dbgJouer`, `dbgAuto` nitro 60 s, REJOUER, 2e course) | carte/météo appliquées ; mort, `#mDead`, REJOUER repart ; nuages, ville:orage, jade matin/nuit, forêt midi/pluie, banquise midi/neige, crypto matin/soir, espace, grotte midi/glace, canyon soir/orage, dunes matin/orage | 0 | B-<carte>-<meteo>-*.png |
| C portail (`dbgPortail(400)` ×3) | 3/3 : forêt → ville → jade → dunes ; caméra et route OK | 0 | C-passage{1,2,3}-4s.png |
| D écrans FR/EN, portrait/paysage | réglages, offres, garage (5 onglets), boutique (achat voiture, aile, traînée), équiper, inventaire, coffre, missions ; aucun mot FR en EN ; paysage : JOUER/PLAY dépasse de 4 px à droite (invisible) | 0 | D-*.png (34 par langue) |
| D pause + mort FR portrait / EN paysage | ⏸, RÉGLAGES depuis la pause, REPRENDRE, RECOMMENCER (confirmation), QUITTER, ⌂, REJOUER, GARAGE ; seconde chance vue | 0 | P-*.png |
| E sauvegarde | banque, caisse, possessions, missions, runs revenus après rechargement (`best` 13,49 → 13 arrondi) | 0 | E-apres-rechargement.png |
| E setItem qui jette / E2 quota 5,24 Mo | aucune exception ; `SAVE.flush` écrit par `localStorage[K]=s` ; écriture toujours passée | 0 | |
| F tas 3 courses | voir C | 0 | F-c*.png |
| G `?fps=15/30` | `dbgCadence().on=false` : ne bride pas | 0 | |
| G gel du cycle de vie (`setWebLifecycleState`) | course en PAUSE, panneau ouvert : correct | 0 | |
| G rotation en course | recadrage OK ; pause au retour portrait (TEL-N05) | 0 | G-*.png |
| H caisses `dbgEquipe` 3, 6, 1, 2, 28 | 3 retirée (refusée) ; 6 OK ; 1 ELDORADO (non possédée, forcée) morte < 2 s sans `#mDead` ; 2 et 28 refusés « en course ». Incomplet | 0 | H-c*.png |
| M mort forcée 6× `dbgChance('mort')` | 6/6 boom puis gameOver 1,5-2 s | 0 | |

## B. Défauts

### TEL-N01 · MAJEUR · La boutique montre une figure dans le rayon Voitures
- Reproduire (FR/EN, portrait/paysage, 4/4) : menu → GARAGE → onglet FIGURES → BOUTIQUE (`#gShopBas`) → rayon VOITURES allumé.
- Quoi : carte du haut « COMMUNE · TAIL WHIP » au-dessus de la caisse ; gros bouton « ÉQUIPER — REMPLACE TONNEAU » dans le rayon des caisses. Toucher VOITURES ou PEINTURES ne corrige pas ; il faut toucher une vitrine.
- Preuve : D-fr-390x844-15-boutique-rayon-voiture.png ; sonde `{nom:"TAIL WHIP", btn:"EQUIPERREMPLACE TONNEAU", on:"voiture* …"}`.
- Piste : boutique-scene-1.js:312 : le clic de rayon ne fait `bqTourne(c)` que si `c!==GBQ.cat||GBQ.ong!=='cat'` ; `GBQ.cat` vaut déjà « voiture » alors que `SHOP.tab` est resté « figure » ; `gModeVa('shop')` (boutique-du-jour.js:115) ne resynchronise pas la vedette.
- Confiance : haute, pas propre au headless.

### TEL-N02 · MAJEUR · Cadence qui s'effondre après trois portails enchaînés
- `dbgPerf().fps` 45 → 47/32 (ville) → 38/33 (jade) → 17/18 (dunes), contre 49 i/s pour dunes:orage lancées à neuf. Géométries montent aussi (F).
- Preuve : logC.txt, C-passage3-4s.png. Confiance : moyenne (GPU headless). À rejouer sur un vrai téléphone. (Rejoint MAP-N02 / PC-N03.)

### TEL-N03 · MINEUR · Argent réel et monnaie du jeu se confondent en anglais
- EN : solde « €870,000 » et peinture « BUY €1.00 » : même symbole, même place (FR : « € 25 000 » vs « 1 € »). Toucher BUY €1.00 ne fait rien de visible. Piste : `eurTxt` (atelier-ferme.js:697) préfixe « € » en EN comme `fmtC` ; `habPaye` muet hors app.
- Confiance : haute.

### TEL-N04 · MINEUR · Réglage IMAGE : deux crans affichent « HAUTE »
- Cycle `net` → `haute` → `fast` affiché HAUTE → HAUTE → BASSE. Piste : `qLbl()` rend « NETTE » (nettete-qualite.js:108) mais `I18N_FR` traduit `'NETTE':'HAUTE'` (passe-textes.js:6).
- Confiance : haute.

### TEL-N05 · MINEUR · La rotation vers le portrait met la course en pause
- Retour 844×390 → 390×844 : `paused:true`, panneau PAUSE ouvert. Piste : `visibilitychange` « retour » (mobile-tactile.js:527-535) → `panOpen(true)`. Confiance : basse (CDP ≠ vrai pivot).

### TEL-N06 · MINEUR · `?intro=ancien` : l'anneau `#spCharge` reste sur le titre (seul `chCl()` intro-161.js:253 le retire). Chemin de test seulement.

### TEL-N07 · MINEUR · Une écriture de sauvegarde ratée est avalée en silence (sauvegarde.js:234 `try{localStorage[this.K]=s;…}catch(e){}`). Non reproduit.

## C. Mesures
- Chargement : `__gameReady` 2,0-4,9 s, pointes à 12,5 s (charge machine).
- i/s moy/min par map (60 s, pilote auto + nitro) : nuages 56/44, nuages:orage 55/37, ville:orage 46/20, jade 57/41, jade:nuit 55/41, forêt 58/50, forêt:pluie 56/40, banquise 50/31, banquise:neige 39/23, crypto:matin 37/24, crypto:soir 50/30, espace 54/36, grotte:midi 36/22, grotte:glace 56/41, canyon 60/43, canyon:orage 44/29, dunes 49/32, dunes:orage 49/29. Les plus lourdes : grotte:midi, crypto:matin, banquise:neige, ville:orage.
- Tas 3 courses (gc forcé) : accueil 92,8 Mo / 0 géom ; mort 1 235,7 / 552 ; mort 2 261,1 (+25,4) / 657 ; mort 3 262,8 (+1,7) / 797. Le tas se stabilise ; les géométries montent (+105, +140).
- Warnings three.js : 0. Console : seulement `Blocked call to navigator.vibrate` (clics programmatiques). Gels (dbgErreurs) 2,1-4 s au menu/garage/départ (compilations GPU headless).

## D. Non fait
Intro 1.61 (GPU headless) ; onglet caché simulé invalide (le jeu écoute `window`, init.js:401) ; `?fps` sans effet ; H incomplet (ELDORADO forcée morte sans écran de mort : non interprétable) ; seconde chance non prise ; auto-école non jouée ; serveur mort une fois (code 127).
⚠ À l'arrêt, l'agent a tué tous les node « serveur.cjs »/« lance.cjs » (7 PID), potentiellement ceux d'autres bancs.
