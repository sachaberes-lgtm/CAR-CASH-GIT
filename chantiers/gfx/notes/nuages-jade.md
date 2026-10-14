# nuages-jade — les Pics de Jade prennent le ciel de coton (2026-10-14, ordre de Sacha 3 h 25)

Branche `gfx/nuages-jade` — commits 5f2ce4a, dc6e28f. Fichier : `VERSION PRINCIPALE/index.html` seulement.

## Ce qui a changé
- `JADE_NUAGES_CUBES` (nouveau, à côté de `COTON`) : false ⇒ les volutes en cubes ne sont plus bâties (`jadeBatit` : `if(JADE_NUAGES_CUBES&&NU.length)`,
  un seul mot ajouté dans la construction ; les tirages `jr` de `NU` ont toujours lieu, la vallée est identique au cube près). `NUVOX.L` reste
  `null` ⇒ `nuvoxTri` n'est plus appelé (garde déjà en place). Plus de `jadeNuagesVox()` (32 `voxMesh`) ni de `jadeCumulusTex()` à la construction.
  Réversible : `?nucubes=1` (ou `=true` dans la ligne).
- `buildCoton` : sur `piste==='jade'` → `cotonJade(cr)` (nouveau) au lieu du retour à vide de `lvlNuageOk`. Mêmes instances, mêmes 25 gabarits ×
  4 finesses, même matière `nuage8Mat` (programme `nuage8inst` déjà compilé au menu par `nuageChauffe`). Aucun shader, texture, passe, géométrie.
- `cotonJade` : trois familles tirées sur `cr` — (a) bancs plats ENTRE les pics (r 80-200, 230-830 m du bord, du fleuve à la route),
  (b) masses DERRIÈRE les pics (r 240-520, 1-2,3 km), (c) cumulus AU-DESSUS des cimes (r 160-380, +330 à +830 m, ≥ 450 m de côté).
  Garde de la route = `cotonTouche` (inchangée). Jamais sous l'eau (`yMin-45+24`). Nuit : teinte par nuage ×(.56,.58,.68) ; orage ×(.8,.8,.86).
- `cotonTick` (3 retouches) : sur le jade, n'envoie que les `COTON_JADE.lim[palier]` premiers nuages, plafonne la finesse à `COTON_JADE.f[palier]`,
  et coupe ce qui est entièrement au-delà de la brume (comme à l'orage). Hors jade : strictement comme avant (`COTON.jd=null`).
- `cotonPalier()` : `PAL.n` s'il existe (il n'existe PAS dans cette copie : essai protégé), sinon `QUAL_LOW?0:QUAL_MED?1:2`.
- `dbgCotonJade({pal, n, f, rebati, balaie})` : hook de banc (palier forcé, pire cas en balayant toute la piste).

## Compteurs (nuages du jade seulement, pire cas sur toute la piste, caméra posée tous les 60 m)
| | avant (cubes, chiffre d'OPTIMISATION) | palier 0 | palier 1 | palier 2 |
|---|---|---|---|---|
| budget | — | 40 000 / 6 | 90 000 / 10 | 180 000 / 16 |
| midi (12,8 km) | 353 000 / 26 | 13 168 / 6 | 28 120 / 10 | 73 968 / 15 |
| soir | | 14 540 / 6 | 32 400 / 9 | 80 724 / 15 |
| Soleil de Jade | | 12 680 / 6 | 27 940 / 9 | 60 644 / 14 |
Moyenne palier 2 : ~40 000 triangles. Lots bornés PAR CONSTRUCTION : 3 gabarits × 2 finesses · 5 × 2 · 5 × 3.
Scène entière jade midi (renderer.info, une image) : 211 appels / 695 000 triangles avec le coton.
⚠ Le « avant » n'a pas été remesuré par moi (budget de 3 ouvertures) : `?nucubes=1` + `dbgJadePoste('cout')` le donne.

## Vu à l'image (shots/nuages-jade/)
midi, soir, nuit, orage (jeu + vues nettes), pluie et matin (une vue chacune), 0 erreur JS ; portail jade → NUAGES : la Mer retrouve son coton
(195 nuages, 202 000 triangles, comme avant) ; SOLEIL DE JADE (`?play=jade`) : fin de course → REJOUER, même vallée reprise, coton rebâti, 0 erreur.

## Pas vu / doutes
- Pas vu DEBOUT (390×844) ni sur un vrai téléphone ; paliers 0 et 1 vus seulement en vue nette (forcés), pas en course.
- La nuit, la ouate reste gris-lavande éclairée (la lune) : calmée par la teinte, pas noire. À trancher par Sacha (`cotonJade`, tableau `t`).
- `jadeChauffeNiveau` chauffe encore le programme des cubes (inutile, inoffensif) ; `JADE_NUVOX_M`, `nuvoxTri`, `jadeNuagesVox` restent, inertes.
- Le budget laisse ×2 de marge : `COTON_JADE.n` (nuages par km et par tranche) peut monter si Sacha veut un ciel plus chargé.

## POUR LES AUTRES
- OPTIMISATION : `cotonPalier()` lira `PAL.n` dès que le socle PAL sera fusionné (rien à faire). Mesure : `dbgCotonJade({balaie:60})`.
- Ambiances jade : la couleur du coton vient de `sun.color` / `hemi` (voir monde.md § 2, piège 2).
