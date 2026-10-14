# nuages4 — session GAMEPLAY (2026-10-14)

Copie : `sensations/wt/nuages4` (branche `travail`). Ordre suivi après le message de 6 h 10 : défis (T2) → auto-école (T3) → NUAGES 4 (T1).

## T2 — Les défis de la toute première partie (commit 85aa1ea)
- CAUSE : l'auto-école et la 1re course sont UNE seule partie (`tutoArme` → la même run continue après `tutoFin`). `runxReset` n'est
  appelé qu'au départ de la partie : `RUNX.coins` / `RUNX.fruits` comptaient tout ce que la leçon avait ramassé, et `misTick` cochait
  les défis PENDANT la leçon — leurs cartes, retenues par `hautPasse` tant que `TUTO.on`, tombaient juste après le permis (« DÉFI RÉUSSI ·
  CROQUE 4 FRUITS » 2 s après le départ).
- CORRECTIF (à la source) : `MIS0` (à côté de `RUNX`) = ce que la partie avait déjà au permis (`misBaseTuto()`, en tête de `tutoFin`,
  quitter ou passer compris). `misVal` le retranche (pièces, fruits, poses, temps, nitro, argent, figures, gaps ; km/h et chaîne ne
  comptent que battus APRÈS la leçon) et rend 0 pendant la leçon ; `misTick` ne coche rien pendant la leçon ni dans les 20 premières
  secondes qui suivent le permis. `runxReset` remet MIS0 à zéro (`misBaseRaz`) : hors auto-école, rien ne change. RUNX lui-même et
  l'écran de fin comptent toujours toute la partie.
- Risque : la jauge « meilleur essai » (`SAVE.d.mis.best`) d'une partie qui commence par la leçon ne garde que l'après-permis — voulu.

## T3 — La leçon 1/5 TOURNE (commit 9e843bd)
- CAUSE : la carte TOURNE paraît 1,9 s après le départ (fin du logo), ~256 km/h, à ~100 m de la fin des 300 m de droite ; le 1er virage
  (70°, R 190) sort de la route ~1,4 s après son entrée sans un geste.
- CORRECTIF : `TUTO_DOUX` (juste avant `genTuto`) : le DÉBUT seulement — 520 m de droite puis le même 70° en R 380. Le reste du tracé
  est identique, translaté d'un bloc (même cap). Banc géométrique `outils/tuto-trace.cjs` : écart horizontal mini entre deux bouts de
  piste éloignés = 275 m, comme avant (aucun croisement). Les étapes NITRO / DÉCOLLE / VOLE / POSE-TOI ne dépendent d'aucune abscisse.
- Ni la vitesse, ni le volant, ni le gaz auto ne changent. Le niveau 1 AURORE de la carrière roule la même piste (plus longue de ~450 m).

## T1 — NUAGES 4 « MATIN FRAIS » = SAUTE LES MOUTONS (commit 8f7cd64)
- L'IDÉE : le matin, de petits moutons de nuage dorment couchés sur la route (aux repères des anciennes portes : 3 séries de 3 sur des
  droites à plat ; 1re au milieu, 2e décalée, 3e = des TROUPEAUX de trois en travers). On les saute au double-tap NITRO (le SAUT NITRO
  de Léo, figure comprise). Au-dessus sans toucher = « SAUTE-MOUTON » (pluck `pad.neon` qui monte, gerbe d'or, chaîne d'aura 30, FLOW
  +6) ; pris de face = le mouton éclate (le banc défoncé existant) et la plaque bêle « BEEE ! » en rouge 1,4 s. 9 / 9 = « BERGER D'OR ! »
  (slam, `vPaie(30)`, demi-nitro, FLOW +15, `victoire`). Rien ne fait perdre : ni vie, ni vitesse.
- Différent des 9 autres : c'est le seul niveau dont le geste est le SAUT VOULU (le 3 perce un nuage, le 6 coupe en volant, le 8 roule
  à l'aveugle) ; il précède la POURSUITE, qui n'a rien à sauter.
- LE SAUT EST OFFERT au pied d'un mouton (8-170 m avant, `campMoutonLibre` dans le `libre` de `veqSaut`) : à 20 % de jauge par saut,
  trois sauts en 7 s vidaient le réservoir. Ailleurs, le saut coûte comme avant.
- Hauteur : crête de l'ellipsoïde à `MOUTON_H` 2,6 m ; saut nitro ≈ 3,8 m d'apogée en 1,27 s → fenêtre ~20-80 % du saut.
- Code : `MOUTONS_ON` (près de `PLOTS_ON`), `pr` 'SAUTE LES MOUTONS' (+ I18N fr/en/zh), `moutonsPose` (dans `campNuages`, nuages
  `mkCloud` cumulus sur `cr`, aucun `rnd` de piste), `campMoutonsTick` (dans `campTick`, zéro allocation : la plaque ne se réécrit que
  sur changement d'une clé numérique), `campMoutonLibre`, `dbgMoutons()`. `campDebut` remet le troupeau à zéro. PLOTS_ON=true rend les
  portes (les moutons ne se posent plus).
- Plus : 15 petits nuages (6 seuls + 3 troupeaux de 3) dans ce niveau, matière CLOUD_MAT existante.

## Vérifications au navigateur
(voir plus bas)
