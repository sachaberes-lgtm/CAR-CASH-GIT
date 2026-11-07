# PASSE 3 « au max » — branche `perf3-main` (base origin/main c9d9895d, cache v1237), état au 7/11/2026
Règle : sur vrai téléphone (TEL_NATIF) le palier 2 peut perdre de l'image ; l'ordinateur garde le maximum. Plan : `~/cash-car/perf3/2026-11-07-passe-3-max.md`.

## Fusionné (dans cet ordre)
1. `vitesse-fluide` 93352b50 (contient perf3/P2 : imgRegle et budgets) — gouverneur thermique à paliers par imgRegle (dose 60/100/140), remontée de l'image (`?mob_raise=0`), 30 calé dès le départ (`?mob_g30=0`), régime chaud à dose ≥ 100 (`?gouv=max` = avant), sonde « fluide » (dose) dans la boîte noire.
2. `perf3/P5` 11abb669 — menus froids : photos jamais pendant un défilement, vitrine plafonnée, 30 i/s au repos, banc `menus.py` (mesures non prouvées : la garde iPhone jugera).
3. `perf3/P4` e6933993 — outillage : `preparer-www.js --jeu-fichier` (script du jeu en fichier) + relevé `[natif] CHARGEMENT` ; sans effet tant que l'option n'est pas passée.
`sw.js` v1237 (commit à part). Incident : l'`index.html` de la fusion de P5 a été commité avec des marqueurs de conflit puis régénéré depuis les morceaux (`c18d0a2f`) — vérifier qu'aucun marqueur ne reste (`grep -c '^<<<<<<<' "VERSION PRINCIPALE/index.html"` = 0, fait).
Pas encore fusionnés : P1 (mémoire), P3 (appels/programmes), P6 (gels en course), serpent-fluide (6595747c).

## Compteurs (banc à instant fixe, machine CHARGÉE 40-190 : compteurs seulement, positions bruitées)
Palier 2 (avant c9d9895d → après) : nuages 140 → 121 appels, 558 k → 422 k triangles (−24 %) ; ville 52 → 47, 144 k → 116 k (−19 %) ; jade 78 → 77, 315 k → 314 k (≈ 0). Programmes 210 = 210. Le palier 2 BOUGE sur nuages/ville : attendu (image adaptée sur TEL_NATIF, règle de la passe 3) ; `?tel=0`/ordinateur NON vérifié identique au pixel. Palier 0 : voir `~/cash-car/perf3/mesures/` (avant-p0 / main-p0).

## À faire avant main
Garde iPhone (`outils/banc-perf/garde-iphone.cjs` sur la boîte noire du 13 Pro), capture A/B `?tel=0` identique, fumée couché/debout, fusion de P1/P3/P6 et serpent-fluide.
