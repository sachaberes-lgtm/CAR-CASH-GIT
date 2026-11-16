# LE GOUVERNEUR DOUX : rapport (14/11, soir)

Branche `qa/doux` (partie de `qualite-appareil` c95e1e3c0), worktree `~/cash-car/qualite-doux`. Interrupteur : `?sans=gouvdoux` = le gouverneur d'avant.
Constat de départ (build 116, 13 Pro de Sacha, branché + économie d'énergie, « serious » toute la séance) : à serious l'image était coupée (DPR 0,85-1,0, halo coupé → QUAL_LOW,
ombre 512, loupe coupée) alors que le coût d'une image ne dépend presque pas de ces coupes (13-15 ms contre 16-17 ms, 30 i/s tenues dans les deux cas) et que la chaleur vient de la charge.

## Fichiers touchés
- `code/moteur/gouverneur-paliers.js` : section « LE GOUVERNEUR DOUX » (`GDX_ON`, `gdxOn()`, `gdxCrit()`, tables `MOB_PDX` (capteur) / `MOB_PPDX` (dose)) ; `mobPalTable`, `mobPalCible`,
  `mobPalVoulu` (branche relative au départ du niveau, N1 compris), `mobPalApplique` (desserrage du plancher fair → serious) ; `dbgGouvPaliers()` rend `doux`, `long`, `branche` ;
  `dbgGouvLong(s)` (banc : secondes de serious cumulées).
- `code/moteur/gouverneur-thermique.js` : le cran QL de plus du critique (`mobThermo`) n'est plus rejoué sous le doux ; `dbgGouv().doux`.
- `code/moteur/cadence.js` : `gdxGel` (le gel de l'échelle QL, calé) ; banc `dbgGouvLent(ms)` (un téléphone lent dont le coût suit les pixels : ms × (DPR/DPR de départ)²).
- `code/rendu/loupe-caisse.js` : `loupeChaud()` seulement — sous le doux, coupée à critical (ou palier critical de la dose) et à l'effondrement de l'échelle, plus à serious.
- `code/rendu/nettete-qualite.js` : `qlDoux` (appelé en tête de `qlPose`), `qlOmbN1`, `QL.dT` (heure du dernier changement de résolution), `QL.kT` (du dernier changement de cran),
  borne HAUTE (`hauteK`) tenue jusqu'à critical sous le doux.
- `outils/banc-doux/doux.cjs` (nouveau banc), `passation/qualite/photos/doux/`.

## La règle (téléphone profilé `PRF.on`, N1-N4, gouverneur actif)
| état | image |
|---|---|
| nominal | comme avant |
| fair | comme avant (un étage de halo, un cran d'ombre, plancher QL 3) — jamais de résolution |
| serious, serious 150 s, serious + branché (IDENTIQUES) | résolution du niveau gardée · halo allumé, entrée ½ résolution, un étage de moins · ombre un cran de moins · ciel 1/4 · traits/traînées pleins (ni `stries` ni `ventK/emiK` ×½) · loupe gardée · plancher QL au cran 2, échelle libre |
| critical | 80 % du plafond du niveau · halo ½ à 2 étages (éteint seulement au dernier cran de l'échelle) · ombre 512 · ciel 1/8 · traits ×½ · loupe coupée · 20 i/s |
| sans capteur (dose 60/100/140) | les mêmes recettes fair / serious / critical, SANS aucun `dk` : la dose ne baisse jamais la résolution |
Cadence inchangée. Le régime chaud `mobhChaud()` (vent ×0,7 redessiné 1/2, éclair NITRO, carte moteur) et la polyphonie réduite restent à serious (coûts processeur ; le feu du nitro
garde sa densité : `GFX_PLEIN` + QUAL_LOW faux).

L'échelle QL sous le doux (en course) :
- un pas de la règle (boucle-1.js, non touché) ne change la résolution que d'UN cran, en descente comme en remontée ; les crans d'effets (0-5) restent libres ;
- la résolution ne change pas plus d'une fois toutes les 10 s (`QL_DOUX.res`) ; un pas refusé garde ses crans d'effets et oublie son essai (sinon l'essai raté poserait un plafond de 45 s) ;
  passent toujours : le retour d'un essai qui n'a rien rapporté et `qlReprise` (choix du joueur) ;
- calé, la remontée n'est plus gelée pour la session : `CAD.gel` = moins de 20 s (`QL_DOUX.tenu`) depuis le dernier changement de cran OU depuis la dernière image qui tirait
  (p75 > `imgQlP75`). Puis la règle d'avant (3 pas de marge) remonte d'un cran.
- Je l'applique à tous les états sous le doux (pas seulement à serious) : à nominal, l'échelle d'un profil à 30 i/s pouvait jusqu'ici seulement descendre (MOB_FROID30 ⇒ gel).

## VÉRIFIÉ (banc `outils/banc-doux/doux.cjs`, UN Chrome sans fenêtre et muet, ports 9971/9972, sans verrou (0 Chrome de banc au lancement), fermé ; iPhone émulé 844×390 DPR 3, TEL_NATIF vrai)
`node code/assembler.cjs --depuis-morceaux` : 330 morceaux d'accord ; `garde-demarrage` OK ; `garde-allege` OK. 0 exception, 0 console.error sur tous les essais.

### Tableau (course réelle au pilote auto, `dbgThermique`, `dbgGouvLong(150)`, `__ccBranche=2`, lecture 3 s après chaque état)
Format : DPR scène · halo (résolution/étages) · QUAL_LOW · ombre · loupe · cran QL (plancher) · cadence. AVANT = même build avec `?sans=gouvdoux`.

| | état | AVANT | APRÈS (doux) |
|---|---|---|---|
| N1 iPhone14,2 BASSE | nominal | 1,25 · ½/3 · non · 768 · oui · 1 · 30 | identique |
| | fair | 1,25 · ⅜/2 · non · 768 · oui · 3(≥3) · 30 | identique |
| | serious | **1,0 · COUPÉ · OUI · 512 · non · 10** · 30 | **1,25 · ½/2 · non · 512 · oui · 2(≥2)** · 30 |
| | serious 150 s | 1,0 · COUPÉ · OUI · 512 · non · 10 · 30 | 1,25 · ½/2 · non · 512 · oui · 2 · 30 |
| | serious + branché | **0,85** · COUPÉ · OUI · 512 · non · 8 · 30 | 1,25 · ½/2 · non · 512 · oui · 2 · 30 |
| | critical | 0,85 · COUPÉ · OUI · 512 · non · 8 · 20 | 1,0 · ½/2 · non · 512 · non · 2 · 20 |
| N2 iPhone14,2 HAUTE | nominal | 1,5 · 1/4 · non · 1280 · oui · 1 · 30 | identique |
| | fair | 1,5 · 1/3 · non · 1024 · oui · 2 · 30 | identique |
| | serious | 1,2 · COUPÉ · OUI · 512 · non · 5 · 30 | 1,5 · ½/3 · non · 1024 · oui · 2 · 30 |
| | serious 150 s | 1,2 · COUPÉ · OUI · 512 · non · 5 · 30 | idem serious |
| | serious + branché | 1,02 · COUPÉ · OUI · 512 · non · 5 · 30 | idem serious |
| | critical | 1,02 · COUPÉ · OUI · 512 · non · 5 · 20 | 1,2 · ½/2 · non · 512 · non · 2 · 20 |
| N3 iPhone15,4 HAUTE | nominal | 2,0 · 1/5 · non · 1280 · oui · 0 · 30 | identique |
| | fair | 2,0 · 1/4 · non · 1024 · oui · 2 · 30 | identique |
| | serious | 1,6 · COUPÉ · OUI · 512 · non · 5 · 30 | 2,0 · ½/4 · non · 1024 · oui · 2 · 30 |
| | serious 150 s | 1,6 · COUPÉ · OUI · 512 · non · 5 · 30 | idem serious |
| | serious + branché | 1,36 · COUPÉ · OUI · 512 · non · 5 · 30 | idem serious |
| | critical | 1,36 · COUPÉ · OUI · 512 · non · 5 · 20 | 1,6 · ½/2 · non · 512 · non · 2 · 20 |
| N4 iPhone18,1 HAUTE | nominal | 3,0 · 1/5 · non · 1280 · non* · 0 · 60 | identique |
| | fair | 3,0 · 1/4 · non · 1024 · non* · 2 · 60 | identique |
| | serious | 2,1 · COUPÉ · OUI · 512 · non · 5 · 30 | 3,0 · ½/4 · non · 1024 · non* · 2 · 30 |
| | serious 150 s | 2,1 · COUPÉ · OUI · 512 · non · 5 · 30 | idem serious |
| | serious + branché | 2,04 · COUPÉ · OUI · 512 · non · 5 · 30 | idem serious |
| | critical | 2,04 · COUPÉ · OUI · 512 · non · 5 · 20 | 2,4 · ½/2 · non · 512 · non · 2 · 20 |
\* N4 : la loupe se retire d'elle-même à DPR 3 (`horsDpr`, rien à agrandir), avant comme après. Toile réelle : 2532×1170 partout où la loupe est posée.

### L'échelle QL descend puis remonte, à serious + branché (`dbgGouvLent(40)` 70 s puis 0 pendant 130 s, relevé chaque seconde)
- **N2 (iPhone15,4 BASSE, DPR 1,5)** : descente 1,5 → 1,44 (4 s) → 1,38 (15 s) → 1,31 (24 s) → 1,25 (45 s) ; remontée déjà à 68 s (le coût suit les pixels) ;
  lenteur arrêtée : 1,38 (+19 s) → 1,44 (+42 s) → 1,5 (+65 s), puis effets (cran 4, 3) toutes les ~22 s. Un cran à la fois, ≥ 10 s entre deux résolutions, ~22 s entre deux remontées.
  **Loupe posée : 0 écriture de la toile pendant tout l'essai** (seulement à la fin de partie, 181 s).
- **N3 (iPhone18,1 BASSE, DPR 2)** : 2 → 1,75 (4 s) → 1,5 (17 s) → 1,75 (39 s, l'image tenait) ; lenteur arrêtée : 2,0 (+4 s), puis effets cran 4/3/2 toutes les ~22 s. 0 écriture de la toile.
- **N1 (iPhone14,2 BASSE)** : effets 2 → 4 → 5, puis effondrement (11 s) : la loupe se retire, résolution 1,25 → 1,19 (12 s) → 1,13 (22 s) → 1,06 (65 s) ; lenteur arrêtée :
  1,13 (+17 s) → 1,19 (+39 s) → loupe revenue + 1,25 (+59-62 s) → effets jusqu'au cran 2 (+130 s, halo ½ revenu).
  Écritures de la toile (loupe retirée) : 7 groupes, espacés de ≥ 10 s **sauf un** : la loupe qui se retire à l'effondrement (23 s) puis le premier cran (25 s) — voir NON vérifié.

### Photo de la même image à serious + branché (N1)
`passation/qualite/photos/doux/N1-avant-*.png` (DPR 0,85, halo coupé, toile 717×331) et `N1-apres-*.png` (DPR 1,25, halo ½, loupe, toile 2532×1170) ; boucle menée à la main
(300 pas de 33 ms, même graine) : la caisse au même endroit à 5 cm près. Après : arêtes nettes, plaque lisible, halo des feux et des pots revenu.

## NON vérifié
- Rien sur un vrai iPhone : ni la chaleur réelle à serious avec l'image pleine (l'hypothèse du pilote : la charge chauffe, pas le rendu), ni le coût réel d'une image (13-15 ms mesurés à DPR 0,85-1,0 :
  à 1,25 + halo ½ + loupe, on attend ~16-17 ms comme à fair), ni le vrai `__ccBranche`, ni l'économie d'énergie (`loop._r30` : en éco l'échelle ne descend pas, règle d'avant).
- La loupe qui se retire à l'effondrement de l'échelle (N1, loupe-caisse.js, hors de `loupeChaud`) n'est pas comptée dans les 10 s : deux réallocations de la toile à 2 s d'écart une fois.
- HAUTE à serious : la borne `hauteK` (2) tient jusqu'à critical, donc en HAUTE l'échelle ne baisse pas la résolution à serious (comme à nominal). Choix « comme en nominal » ; à trancher.
- `?sans=gouvdoux` = l'avant : vérifié champ par champ contre le tableau du lot juge (N1 : 1,0/coupé/512/ciel 4 → 0,85 ; N4 serious 2,1) ; pas rejoué sur le témoin `qualite-appareil`.
  Hors profil et ordinateur : tout est gardé par `gdxOn()` (= `PRF.on` et `MOB_PALS`), lu, non rejoué.

## Questions pour le pilote
1. À N1, fair (halo ⅜, ombre 768 à l'échelle) est maintenant MOINS beau que serious (halo ½, ombre 512) : la lettre demandait « fair comme aujourd'hui ». Aligner fair sur serious (plancher QL 2) ?
2. HAUTE à serious : garder la borne de deux crans (aucune baisse de résolution par la mesure) ou la lever ?
