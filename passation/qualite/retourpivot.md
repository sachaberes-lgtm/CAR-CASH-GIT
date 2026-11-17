# Lot RETOURPIVOT — les gels « hors boucle » après un retour d'arrière-plan + pivot (17/11)

Branche `qa/retourpivot` (worktree clairsemé `~/cash-car/qualite-retourpivot`, base `qualite-appareil`).

## Le constat de départ (boîtes de vol 117-119)
Gels « hors boucle » : l'image d'écran (rAF) n'arrive pas pendant 2-3 battements, la boucle fait ≈ 8 ms, la sentinelle est normale.
Ils commencent après un retour d'arrière-plan LONG suivi d'un pivot, et durent jusqu'à la fin de la séance.
Dans le vol 119 : `images de loop 30 · autres rAF 60` par seconde AVANT comme APRÈS le retour. Le rapport reste 2 : pas de chaîne rAF en plus.

## Ce que le banc montre (Chrome, iPhone émulé 390×844 ×3, course au pilote)
Banc : `node outils/banc-perf/retour-pivot.cjs --out <dossier> --n 3 --bg 90 --bgn 60 --gel 150 --q perfrec=2`.
L'arrière-plan est simulé par `Debugger.pause` (le JS s'arrête net, comme iOS). `setWebLifecycleState frozen` ne convient pas : Chrome sans fenêtre ne rend plus aucune image après le dégel.
La reprise passe par REPRENDRE (3-2-1), comme le joueur.

**Aucun état ne diverge** après 1, 2, 3 (et 5) retours + pivots :
- écouteurs (dédoublonnés comme le DOM, par pile) : 398 → 400 → 401 → 402. +1 par retour = l'écouteur `release` d'un nouveau `WakeLockSentinel` (wakeAsk). La cible meurt avec lui : ce n'est pas une fuite.
- appels bruts à addEventListener : même pente (+1). Compteur du mouchard : 384 → 388, même chose.
- rAF en attente : 2 (loop + `rf`), stable. loop par image d'écran : 1. Aucune chaîne en double.
- minuteries 2-5, intervalles 16 : stables.
- toile 3D et tampon : justes dans les deux sens (voir la loupe ci-dessous). 6 couches composées, une seule grande (la toile).
- aucune animation CSS ni classe plein écran qui reste (`rotA`/`rotB` partent ; le voile aussi).

Donc les +45 écouteurs du téléphone ne viennent PAS du code commun joué au banc. Restent les chemins propres à l'app (natif.js, Capacitor, son allumé : le banc est muet par règle).
⚠ Le compteur du mouchard compte chaque APPEL (y compris les doublons ignorés par le DOM et les cibles mortes) : +45 n'est pas forcément une fuite.

## Un fait important pour lire les vols : LA LOUPE
En course, téléphone froid, `rendu/loupe-caisse.js` pose la toile 3D à l'ÉCRAN ×3 : 1170×2532 (2,96 Mpx), soit 900 % de la fenêtre.
La scène reste calculée à DPR 1,25 ; une dernière passe agrandit. C'est voulu (netteté de la caisse).
Mais `canvas.width` est redéfini par la loupe : il rend la taille de la SCÈNE (487). Seuls les accesseurs natifs donnent la vraie taille.
C'est l'hypothèse « toile à DPR 3 » de la consigne : elle est vraie en permanence quand la loupe est posée, pas seulement après un retour.
La loupe se retire à chaud (critical, ou serious hors gouverneur doux) et revient après 20 s au frais.
⚠ (contrôle adverse) La loupe N'EST PAS un suspect des gels après retour + pivot : CONTREDIT par le vol 119.
Course de 23:44 (build 119) : critical pendant les 229 s, donc loupe retirée, et pourtant 65 gels (51 « hors boucle, non attribué »).

## LE FACTEUR CONFONDANT : LA CHALEUR
Dans les vols 118-119, le retour + pivot arrive quand le téléphone est déjà chaud. « Après » = presque tout serious/critical ; « avant » = presque tout nominal/fair.
Un « avant / après » seul ne prouve donc rien. `analyse-vol.py` donne le tableau croisé « GELS × CHALEUR × RETOUR+PIVOT » (gels par minute, et hors boucle par minute).
Vols du build 119 (`vol-1117-0049.json --v e044730`, retour long ≥ 30 s) :

| thermique | AVANT | APRÈS |
|---|---|---|
| nominal | 114 s · 4,2 gels/min (hors boucle 0,0) | — |
| fair | 204 s · 4,4 (0,9) | 49 s · 12,2 (8,6) |
| serious | 9 s · 26,7 (6,7) | 435 s · 21,1 (14,2) |
| critical | — | 255 s · 19,1 (14,6) |

Ce que ça montre : la chaleur sépare nettement (nominal/fair ≈ 4-6 /min, serious/critical ≈ 19-21 /min).
Une seule case compare à chaleur égale : fair, 0,9 → 8,6 hors boucle /min. Mais sur 49 s (7 gels) : un indice, pas une preuve.
Serious avant ne pèse que 9 s. Rien ne tranche entre chaleur et retour + pivot.
Avec `--long 60`, l'arrière-plan de 50 s ne compte plus comme long : tout passe « avant ».
Build 118 : M sans état thermique (pas de croisement) ; ses deux courses « après » sont PLAFONNÉES à 240 gels.
Pour trancher : un retour + pivot téléphone FROID (nominal), ou une longue course chaude sans arrière-plan.

## Ce qui a été corrigé
Rien dans le comportement du jeu : aucun défaut prouvé au banc. Pas d'interrupteur `?sans=retourpivot` (rien à couper).

## L'instrumentation (build de mesure `?perfrec=2` seulement)
- **G[37] le pouls** : quand l'image tarde (40 ms après la fin de loop), une minuterie puis un message MessageChannel battent toutes les ~5 ms.
  G[37] = le plus long silence pendant le trou. ≈ 5-15 ms : fil LIBRE (image retenue ailleurs : compositeur, puce, système). ≈ le trou : fil PRIS.
  Si le guet lui-même part en retard, l'image qui arrive compte ce retard : un trou sans battement se lit « pris », jamais « libre ». `?sans=pouls` le coupe.
  Vérifié au banc : gels provoqués de 150 ms → silence 119-140 ms, tous « fil PRIS ».
  Ne se lit que pour les gels HORS boucle (G[5] hors boucle ≥ ½ intervalle, ou loop d'avant G[3] < 40 ms) : un gel dans la boucle se lit toujours « pris ».
  L'analyse compte à part les gels dans la boucle.
  **G[37] = -1** : le pouls n'a pas battu. Soit il est coupé (`?sans=pouls`, pas de MessageChannel).
  Soit aucune image d'écran n'a tardé de plus de ~42 ms depuis la fin de la boucle : le trou est fait de plusieurs images rapprochées (loop sautés à 30 i/s), pas d'un seul silence.
  **Coût** : la minuterie du guet est réarmée à chaque fin de loop et se recale sur la dernière image : ~30 réveils/s en `perfrec=2`, même sans gel (lu dans le code, pas mesuré).
  Pour juger l'effet de la mesure sur la mesure : comparer les gels/min avec `?sans=pouls`.
- **G[38]** toile native / fenêtre en % (156 = DPR 1,25 ; 900 = loupe ×3) · **G[39]** `gl.drawingBufferWidth`.
- **M (17 colonnes)** : [12] le plus de rappels rAF dans une même image d'écran · [13] le plus de loop dans une même image · [14] s depuis le retour · [15] s depuis le pivot · [16] toile / fenêtre %.
- **Boîte noire, genre `toile`** : 1,5 s après chaque retour et chaque pivot, et à `webglcontextlost` / `webglcontextrestored` :
  toile, tampon, fenêtre, densité, DPR du jeu, loupe posée ou non, écouteurs, minuteries, intervalles, rAF par image.
- `outils/banc-perf/analyse-vol.py` : bloc « RETOUR + PIVOT » (pouls libre / pris des gels hors boucle, gels dans la boucle à part, toile aux gels).
  Avant / après = depuis le PREMIER retour LONG (`--long`, 30 s par défaut) + pivot de la SÉANCE (`c.ses`) : l'état reste acquis pour toutes les courses suivantes.
  ⚠ G et M n'ont pas la DURÉE de l'arrière-plan, seulement les secondes depuis le dernier retour / pivot. La durée vient de `c.mg[5]` (départ) ou `c.mg1[5]` (fin) : celle du DERNIER arrière-plan.
  Fin du rapport : tableau croisé « GELS × CHALEUR × RETOUR+PIVOT » (état thermique = chiffre des milliers de M[11]).
  Sentinelle : la base est la meilleure MOYENNE sur 10 s en ms absolues, plancher 0,1 ms ; les tranches de 10 s s'affichent en ms.

## Pièges notés
- `dbgDPR()` sans argument ÉCRIT `curDPR = NaN` et fige l'échelle (RESPIN). Ne jamais l'appeler pour LIRE : `dbgNette()`.
- `typeof LOUPE` / `VP` dans le mouchard : TDZ avant leur déclaration ; lus seulement plus tard, sous try.

## Pour trancher sur le 13 Pro (prochain build de mesure)
1. Jouer comme d'habitude : 5 min, arrière-plan > 60 s, revenir, tourner le téléphone, rejouer 5 min.
2. Lire `analyse-vol.py` → « POULS aux gels » :
   - **fil LIBRE** majoritaire : rien dans notre JS ne bloque. Le compositeur ou la puce retient l'image. Regarder « toile aux gels » (la loupe n'est PAS le premier suspect : gels aussi loupe retirée, vol 119).
   - Toujours lire le tableau croisé chaleur × retour+pivot avant de conclure : comparer à état thermique ÉGAL.
   - **fil PRIS** : un travail du moteur web sur notre fil (ramasse-miettes, tâche interne). Croiser avec le témoin du ramasse-miettes.
3. Notes `toile` de la boîte noire : la taille de la toile au retour et à chaque pivot ; écouteurs et rAF par image avant / après.
