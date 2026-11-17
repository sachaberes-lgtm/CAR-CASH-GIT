# Lot LENTEUR (17/11) — branche `qa/lenteur`, partie d'`origin/qualite-appareil`

Source : l'analyse du vol du build 120 (juge adverse). En économie d'énergie + téléphone tiède/chaud (pire branché),
des RAFALES de 3 à 34 s : une image sur 3-4 pèse ~115 ms. 18,9 gels par minute dans cette case, ~1 à froid.
À critical (20 i/s, loupe retirée), presque plus. Mécanisme non tranché (attente sur la puce, travail périodique, ramasse-miettes).

## Ce qui change

| | quoi | par défaut ? | interrupteur |
|---|---|---|---|
| A | L'HORLOGE DU CALAGE (`cadence.js`, cadSaute) | OUI (aucune perte d'image) | `?sans=cadhorloge` |
| B | LE SON DE LA CARTE MOTEUR AMORCÉ AU MENU (`sfx.js` amorce, `console-son.js`) | OUI (même son) | `?sans=swapchaud` |
| C | LE GOUVERNEUR DE LENTEUR (`gouverneur-thermique.js`, GVL) | NON | `?plus=gouvlent` (et `?sans=gouvlent`) |
| D | LA LOUPE AU CHAUD (`loupe-caisse.js`, LCH) | NON | `?plus=loupechaud` (et `?sans=loupechaud`) |

### A — l'horloge du calage
- Avant : une image d'écran était calculée dès qu'elle arrivait 25 ms après la précédente, puis `CAD.der=now`.
  Des images d'écran de travers (26-30 ms) faisaient 34 à 44 images calculées par seconde au lieu de 30 (prouvé dans le vol).
- Après : deux conditions. La règle d'avant (jamais deux images plus proches qu'avant). ET une horloge `CAD.clk` qui avance d'une période par image calculée.
- L'horloge ne traîne jamais plus d'une période derrière l'image : pas de rafale de rattrapage après un gel, une pause ou l'arrière-plan.
- Elle repart au calage et au changement de cadence (30 ⇄ 20).
- Elle ne juge pas quand l'écran ne livre pas plus vite que la cadence visée (médiane d'écran > 0,9 période) : un écran à 30 qui tremble ne perd pas d'image.

### B — l'amorce du son de la carte moteur
- Vol : gel de 332 ms à 0,8 s de course, dont 157 ms dans le rappel `engSwapArme` → `engSwapSnd` → `moteur.palier` (et 69 ms dans un autre vol du jour).
- Le son était déjà décodé d'avance (SONS_FIXES). Désormais il est JOUÉ une fois en silence au menu (gain 0, 30 ms, même chemin : tampon, source, gain, bus).
- Un son par tranche (minuteur). Attend le contexte réveillé (relancé au premier son du menu) et le décodage.
- Ni polyphonie, ni chef d'orchestre, ni délai minimal ne le voient. Résultat sonore identique.
- Compteur : `CCSON.etat().amorces`.

### C — le gouverneur de lenteur (option)
- Signe, en course, hors des 2,5 s d'une construction :
  - deux images dont le travail (début de loop → cadFin, rendu compris) dépasse 80 ms en moins d'une seconde ;
    dans un build de mesure (`?perfrec=2`), en plus au moins 4 tranches à ×3 leur référence ;
  - OU la sentinelle : 85 × 1024 additions (~0,15 ms au frais), deux fois par seconde (~0,3 ms/s) ;
    les deux dernières mesures à ≥ 3× sa base (moitié basse de la dernière minute).
    Sur une horloge grossière (pas de performance.now ≥ 0,3 ms), elle exige en plus une image ≥ 60 ms dans les 2 s.
- Aussitôt : 20 i/s par le chemin du critical (`cadPer`), loupe retirée, vent et émission ×½ (le plus bas gagne),
  polyphonie des bruitages allégée (`__ccLent` dans sfx.js, comme le palier 2). Ni résolution, ni halo, ni ombre.
- Tenu 9 s après le dernier signe. Une rentrée moins de 3 s après une sortie double la tenue (60 s au plus).
- Une note `lenteur` dans la boîte de vol à chaque entrée et sortie. `dbgLenteur()` au banc, `dbgRafale({ms,k})` simule.
- Pilote de qualité (qa/pilote) et gouverneur thermique : il ne relève jamais ce qu'ils baissent. Cadence : 50 ms si GVL, sinon leur règle.
  ⚠ Au merge avec qa/pilote : `cadPer` et `emiN` sont touchés des deux côtés, garder les deux lignes.

### D — la loupe au chaud (option)
- Retire la loupe dès « économie + fair + branché » (`__ccBranche` ≥ 2) ou « serious », au lieu de critical seulement.
- Seulement à un moment caché : la décision n'est relue qu'hors de la course vivante (départ, pause, mort, menu).
- Toile 2,96 → 0,51 Mpx composés. La caisse redevient celle du navigateur (agrandie en bilinéaire).
- Photos (iPhone 13 Pro émulé, nuages, même image) : `outils/banc-lenteur/photos/`
  `debout-…-avec-loupe.png` / `debout-…-sans-loupe.png`, `couche-…-avec-loupe.png` / `couche-…-sans-loupe.png`. **À juger par Sacha.**

## Preuves au banc (Chrome, iPhone 13 Pro émulé, `?tel=1`)

A — `node outils/banc-lenteur/horloge.cjs` (la VRAIE cadSaute, suites d'écran simulées, 60 s, avant → après) :

| écran (visé 30) | i/s | pire seconde | σ intervalles | trous > 58 ms /min |
|---|---|---|---|---|
| 60 Hz régulier | 30,02 → 30,02 | 30 → 30 | 0,47 → 0,47 | 0 → 0 |
| 120 Hz régulier | 30,02 → 30,02 | 30 → 30 | 0,47 → 0,47 | 0 → 0 |
| 30 Hz régulier (économie) | 30,02 → 30,02 | 30 → 30 | 0,47 → 0,47 | 0 → 0 |
| 30 Hz tremblé 25-41 ms | 29,85 → 29,85 | 32 → 32 | 4,88 → 4,88 | 0 → 0 |
| 30 Hz irrégulier ~32/s (build 52) | 31,78 → 31,78 | 33 → 33 | 3,4 → 3,4 | 0 → 0 |
| 60 Hz + images en retard 26-30 ms (la fuite) | **37,25 → 29,9** | **43 → 31** | 10,12 → 11,75 | 0 → 0 |
| 36 Hz irrégulier 22-33 ms (hypothèse dure) | **36,3 → 30,01** | 38 → 31 | 3,22 → 10,93 | **0 → 55** |

Visé 20 : rien ne bouge sauf la fuite (22,39 → 20,01 ; σ 1,22 → 9,93, pas de trou > 87 ms).
- Le prix : quand l'écran livre VRAIMENT 36 images par seconde de travers, tenir 30 oblige à en sauter 6 (trous de 64 ms). Pas vu dans les vols, mais possible.
- Le cas « écran à 30 qui livre ~32/s » garde ses 31,8 (l'horloge ne juge pas) : 1,8 image de trop, au lieu d'un trou toutes les 8 s.
- En vraie course (verif.cjs) : 30,05 i/s par défaut, 30,0 avec `?sans=cadhorloge` (Chrome à 60 Hz régulier : identique, attendu).

C — `node outils/banc-lenteur/rafale.cjs` (5 min, 9 rafales de 3 à 34 s, une image sur 3 + 100 ms) :
- avec `?plus=gouvlent` : 9 entrées / 9 sorties, **0 pompage**, entrée 171-261 ms (une à 2,7 s : rafale de 3 s tombée dans une construction),
  sortie **9,6-9,7 s** après la fin, 0 exception, 0 erreur ;
- images par seconde pendant les rafales : sans 18,3, avec 14,4 (calage 20 + la même charge injectée par image) ; au calme 29,8 / 29,7.
  ⚠ La simulation ne peut pas montrer le gain : elle injecte la même charge PAR IMAGE. Le gain attendu (moins de charge → moins de rafales) est l'hypothèse du juge, à vérifier sur le téléphone.
- sentinelle seule (processeur ×5 par CDP, 2,5 min, 4 rafales) : 4 entrées sur 4, entrée 0,6-2,5 s, sortie 5-9 s, 0 pompage.
  Le bridage de Chrome est un découpage du temps (pas une fréquence plus basse) : la sentinelle y est moins nette qu'attendu sur le téléphone.
- coût de la sentinelle : 92,7 ms pour 613 mesures (0,15 ms chacune, 0,30 ms/s) sur le Mac.
- sans `?plus=` : `dbgLenteur().ok === false`, aucun tick, `__ccLent` jamais posé, `gvlMin` rend la valeur telle quelle.

D — verif.cjs : avec `?plus=loupechaud`, économie + fair + branché posés en course → la loupe RESTE ; à la pause → retirée (note `loupe au chaud retirée n°1`) ;
après la reprise → toujours retirée. `?plus=loupechaud&sans=loupechaud` et défaut : loupe posée.

Aucune exception sur toutes les variantes (défaut, sans=cadhorloge, sans=swapchaud, plus=gouvlent, plus=loupechaud).

## Non prouvé
- B : la cause des 157 ms n'est pas connue (Chrome ne la reproduit pas ; sauvegarde muette au banc, l'amorce y attend un contexte qui ne tourne pas). L'amorce retire ce qui est « première fois ». À vérifier dans la boîte de vol (Q : `engSwapArme`).
- C et D : le gain réel (rafales par minute) ne se mesure que sur le 13 Pro.
- C : les 20 i/s sur un écran à 30 Hz (économie) alternent 33/66 ms (connu du pilote). Sur l'écran à 60 de l'économie du build 120, 20 est régulier.

## Protocole A-B sur le téléphone (13 Pro, branché + économie + chaud : la condition de Sacha)
1. Build de mesure (`?perfrec=2`), même carte, 3 courses de 3 min par variante, dans le même quart d'heure, en alternant :
   - A0 : `?sans=cadhorloge&sans=swapchaud` · A1 : défaut ;
   - C0 : défaut · C1 : `?plus=gouvlent` · C2 : `?plus=gouvlent,loupechaud`.
2. Lire dans la boîte de vol, par case (économie, thermique, branché) :
   - S[1] (images calculées / s) : A1 ≤ 31 dans toutes les secondes calées ;
   - gels par minute et secondes « fil entier » ; images par seconde dans les rafales ; notes `lenteur` (entrées, sorties, durées) ;
   - Q `engSwapArme` (B) : plus de rappel > 8 ms au premier moteur ;
   - watts (banc-chaleur) loupe posée ou non.
3. Sacha juge : la fluidité pendant une rafale (C1 contre C0) et la netteté de la caisse (photos + C2 en main).
