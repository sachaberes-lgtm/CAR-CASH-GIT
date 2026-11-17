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
  → (contrôle) c'est un choix de mise en page : la vraie marge est ÉTEINTE par défaut, derrière `?plus=tjmarges` (voir plus bas).
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

## Contrôle adverse (17/11, 2e tour)

### DÉFAUT 1 — la vue VP restait fausse (la cause probable du « tout petit » durable)
VP n'était relue qu'à `resize`. WKWebView livre ce resize en retard ou avec l'ancienne taille : VP restait couchée sur un écran debout.
Alors la borne de l'argent valait 58 % de 844 = 490 px sur un écran de 390 : aucune place, police à 7 px, jusqu'au resize suivant.
Correctif (`?sans=vpfrais` = avant) :
- `rendu/palier-appareil.js` : `vpFrais()` relit innerWidth/innerHeight au retour visible, après `orientationchange` (+60 ms et +400 ms),
  au changement de `matchMedia('(orientation: landscape)')` et 400 ms après chaque resize. Si la taille a changé, un `resize` est envoyé
  à la fenêtre (le même chemin : VP, caméra, toiles, ROTA, menuCadre, boule de l'intro). Rien n'a changé : rien n'est fait.
- `interface/passe-textes.js` : `cashReprise()` remesure l'argent à l'image suivante puis 450 ms plus tard : au départ de chaque course (`cc:jeu`),
  à la reprise (togglePause), au retour visible, et à chaque resize en course (la remesure « vue changée » de cashEcrit ne passe pas quand la course est en pause).
- `dbgVp(w,h)` pose une VP fausse (banc).

### DÉFAUT 2 — tjMarges derrière un drapeau éteint
`?plus=tjmarges` allume la vraie marge gauche. Défaut : l'ancienne borne (552 px en 844 × 390). `?sans=cashfit2` ne garde que le correctif de la frappe.

### Mineur
L'entrée glissée de l'aura (debout) lit `cashAx()` et non `HUDCOL.ax0` brut.

### Banc (`outils/banc-hud/compteur.cjs`, 390 × 844 et 844 × 390, marges du 13 Pro)
Vrai froid (b1/b2 retirés, aucune animation en cours sur `.chV` : `anim 0` relevé), HUD calme par défaut ET `sans=hudcalme`.
Prises : `~/cash-car/qualite/passation/qualite/photos/compteur-controle/` (4 variantes) et `compteur-controle2/` (avant / après, la course qui roule).

| Cas (55 555 €, debout) | Avant (`sans=cashfit2,vpfrais`) | Après (défaut) |
|---|---|---|
| VP restée couchée, puis `orientationchange` | 7 px, 1,5 s sur 1,5 s | 11 px dès la 2e lecture (≤ 0,2 s) |
| Cran faussé à 7 px, pause puis REPRENDRE | 7 px, 4 s sur 4 s | 11 px à la fin du 3-2-1 (~1 s) |
| Cran faussé à 7 px, départ de course (`cc:jeu`) | 7 px, 1 s sur 1 s | 11 px en ≤ 0,1-0,2 s |
| Pivot couché → debout en course | 11 px | 11 px |

Tailles au repos (les mêmes avec et sans HUD calme) :

| Montant | debout avant / après | couché avant / après | couché `?plus=tjmarges` |
|---|---|---|---|
| 999 | 20 / 20 | 16 / 16 | 16 |
| 9 999 | 12,5 / 12,5 | 16 / 16 | 16 |
| 99 999 | 11 / 11 | 16 / 16 | 16 |
| 999 999 | 9,5 / 9,5 | 16 / 16 | 13 |
| 9 999 999 | 7 / 7 | 16 / 16 | 10 |

Pendant la frappe (le correctif cashfit2) : avant 99 999 → 9,5 et 999 999 → 8 debout, 9 999 999 → 14,5 couché ; après = la taille au repos.

### Ce qui attend le choix de Sacha
- `?plus=tjmarges` : l'argent couché ne mord plus DARK TRIAD en frénésie, mais rétrécit (13 et 10 px au-delà de 6 chiffres).
- `?cashplace=a|b|c` : les trois pistes de place (voir plus haut). Debout, 9 999 999 € reste à 7 px sans elles.

### Non prouvé
- Rien n'a été vu sur le 13 Pro (pas touché au téléphone). Le retard réel du resize de WKWebView n'est pas mesuré.
- Le banc pivot-planete.cjs et pivot.cjs --encoche n'ont pas été relancés : le resize envoyé ne part que si la taille a VRAIMENT changé
  (ROTA, menuCadre et la boule le traitent comme un pivot), mais ce n'est pas mesuré.
- Le départ de course est simulé par l'événement `cc:jeu` (celui que start/resetGame envoient), pas par une vraie mort + REJOUER.
