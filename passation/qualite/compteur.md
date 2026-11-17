# LOT « compteur » (2026-11-17)

Sacha : « Le compteur d'argent est buggé, il est devenu tout petit. »
Branche `qa/compteur` (worktree clairsemé `~/cash-car/qualite-compteur`), base `qualite-appareil`.

## Ce qui rend l'argent petit (mesuré)
- Debout en 390 × 844, l'argent n'a que **82 px** : de 232 (fin de la barre NITRO 224 + 8) au bord droit 314 (le ⏸ et ses 62 px).
  Le plancher de 58 % (226 px) n'est PAS la borne qui serre : c'est la barre NITRO. Police : 20 px à 999 €, 12,5 à 9 999, 11 à 99 999, 9,5 à 999 999, 7 à 9 999 999.
- DÉFAUT corrigé — la FRAPPE : soldeFit lisait le rectangle de `.chV` pendant hfCashA/B (scale 1,07). Un chiffre qui change de longueur pendant
  la frappe se mesurait trop large et restait un cran plus petit jusqu'au chiffre suivant. Correctif : la boîte AU REPOS (offsetLeft/offsetWidth,
  que transform, scale et translate ne touchent pas). L'animation n'est pas touchée. `?sans=cashfit2` = avant.
- DÉFAUT corrigé — `tjMarges()` n'existait pas : couché, la marge gauche valait 0. Avec l'encoche (47 px) la borne DARK TRIAD était 47 px trop à
  gauche (552 au lieu de 599) : en frénésie l'argent passait sur l'emblème. Témoin invisible qui lit `--ccT/R/B/L` (sinon `env(safe-area-inset-*)`).
  ⚠ Conséquence : couché, 999 999 € passe de 16 à 13 px, 9 999 999 € de 16 à 10 px (il ne mord plus l'emblème).
- DÉFAUT corrigé — le bord H-15/H-16 (`HUDCOL.ax0`) mesuré sur un autre écran : au pivot couché → debout, l'argent se remesurait avec le bord couché.
  Mesuré une fois sur deux : à 55 555 €, 9,5 px pendant ~0,2 s puis 11 (le 2e passage n'a pas montré l'à-coup). Avec le correctif : 11 dès la 1re lecture, 3 passages sur 3. Désormais `ax0` porte la taille d'écran de sa mesure (`axVp`) et n'est utilisé que sur la même.
  « Minuscule pour de bon » après arrière-plan + pivot : NON reproduit au banc (l'écran revient correct en < 0,2 s après la reprise).

## Les maquettes (?cashplace=a|b|c, éteint par défaut)
Photos (0,7 à 1,5 Mo chacune, NON commitées) : `~/cash-car/qualite/passation/qualite/photos/compteur/` : `avant-*` (?sans=cashfit2), `etat-actuel-*` (correctifs), `piste-a|b|c-*`, + compteur.json et log.txt du banc.
- **a** — borne gauche = fin de la barre NITRO, sans plancher 58 % ni bord de l'emblème. Debout : AUCUN gain (la barre est déjà la borne).
  Couché : 16 px jusqu'à 9 999 999 € mais il passe sur la place de DARK TRIAD (en frénésie).
- **b** — l'argent reste à gauche du ⏸ tant qu'il y tient à 14 px ou plus ; sinon il descend SOUS le ⏸ sur toute la colonne de droite (la colonne
  des pouvoirs commence sous lui). Debout en 390 px il descend dès 9 999 € (12,5 px en haut) et garde 20 px jusqu'à 9 999 999 €. Couché : 16 px.
- **c** — plancher de police à 12 px. Debout, à 999 999 € et plus l'argent déborde sur la fin de la barre NITRO (gauche à 182-215 px pour une barre qui finit à 224).

## Banc
`outils/banc-hud/compteur.cjs` (sous verrou) : tailles posées (`dbgCash(v)`) et pendant la frappe (`dbgCash(v,true)`), lues dans la même évaluation
(déterministe), pivot à 100 ms près, photos à 9 999 999 €. `dbgCompteur()` rend les bornes (x0, xmin, marges, ax0).
