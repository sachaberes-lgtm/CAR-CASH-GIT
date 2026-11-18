# Lot « voituredabord » — la map baisse d'abord, la voiture reste nette (nuit du 18/11)

Branche `qa/voituredabord`, partie d'`origin/qualite-appareil` (a42e9ec50, le build 121). Pas de `qa/pilote` dedans. 2e tour : `origin/qualite-appareil` fusionnée (201a7e172, qui contient 256816cdf : sondecalme, musiquecalme, flushtot, portv), sans conflit.
Demande de Sacha : « je préférais que ça soit la map qui baisse en qualité en priorité et que la voiture soit toujours le plus nette ; d'abord les textures, ensuite la voiture ».

## Ce qui change
Où : téléphone profilé sous le gouverneur doux (`gdxOn()`, le cas de Sacha : N1 BASSE). Quand : à serious (capteur 2, ou palier 2 de la dose), tant qu'on n'est pas critical.
- **La résolution ne bouge plus.** Au-delà du cran 5, `qlDpr` rend le plafond (DPR 1,25 chez Sacha). Pas de réallocation de la toile, pas d'« essai » de résolution.
- **Les crans 6 et 7 retirent du décor** : cran 6 = ciel lisse 1 image sur 8 ; cran 7 = halo un étage de moins. Les crans 8 et 9 n'ajoutent rien (résolution tenue, rien de plus à retirer sans risque). Le cran 10 (kMax) coupe le halo, comme avant. Rien n'est réalloué ni recompilé : un compteur d'images (ciel), un nombre de passes (halo). **2e tour (contrôle du 18/11)** : les « traits d'air ×0,7 / ×0,5 » des crans 7 et 9 sont RETIRÉS, voir « Les crans morts » plus bas.
- **L'effondrement ne retire plus la loupe de la caisse** (sous le doux, à tout état). Seul critical la retire.
- **Un cran de décor au plus toutes les 10 s** (`qlDoux`, `VDA.pT`), comme un cran de résolution sous le doux : de 5 à 10, il faut 44 s au lieu de 6 (le 1er tour n'avait pas de frein). La remontée n'est pas freinée.
- **L'état suit sans attendre un pas de l'échelle** : `vdaVeille` (boucle-1, une fois par seconde, en course) repose le cran quand `vdaTient()` change (serious ⇄ critical ou nominal). Avant, `IMG_DYN.vda*` et la résolution n'étaient recalculés qu'au prochain `qlPose`.
- Critical, nominal, fair, hors profil, ordinateur : l'échelle d'avant. Exception voulue : `gdxLourd()` (N2+ seulement, la sonde a vu une image trop chère à serious) garde l'échelle d'avant.
- Boîte de vol : nouvelle colonne `VD` (par seconde, alignée sur `S`).

Fichiers : `code/rendu/nettete-qualite.js` (VDA, vdaTient, vdaDecor, qlDpr, qlPose), `loupe-caisse.js` (loupeChaud), `ciel2.js`, `stries-vent.js`, `triptyque-bloom.js`, `palier-appareil.js` (IMG_DYN), `moteur/enregistreur-perf.js` (VD).

## La fiche contre le code
- Fiche juste sur l'essentiel : `loupe-caisse.js:77` avait bien `if(QL.effondre)c=true` ; l'effondrement est décidé dans `boucle-1.js:82` ; le plancher et la descente dans `qlPose`/`qlDoux`/`boucle-1.js:136-143`. Je n'ai pas touché à `boucle-1.js` : il suffit que `qlDpr` rende le plafond.
- « Ne descend plus sous le cran 5 » : je n'ai PAS bloqué le cran à 5. Chez Sacha, le cran 5 = kNet = le plancher net (DPR 1,25 = plafond, nA = 0) : la résolution ne baissait que par l'effondrement. J'ai gardé les crans 6-10, mais ils ne retirent plus que du décor. C'est la consigne « quand il faut baisser, c'est le décor qui baisse ».
- Halo et ombre : déjà dans les crans 0-5 (halo ¾ au 3, ombre 512 au 4). Les leviers neufs sont donc ciel 1/8 et un étage de halo (les traits d'air du 1er tour étaient morts, voir plus bas).
- « Aucune réallocation de la toile en course à serious » : tenu pour l'échelle et la loupe. Restent deux réallocations hors lot : le N3/N4 (`dkDoux`, une fois par course, pas Sacha) et la bascule serious ⇄ critical (la résolution revient ou part).

## L'interrupteur
`?sans=voituredabord` : `VDA_ON` faux. `qlDpr` reprend son calcul, `vdaDecor` rend 0 (ciel +0, densité ×1, étages −0 : les expressions d'avant au bit près), `loupeChaud` retire la loupe à l'effondrement comme avant. Vérifié au banc (essais « sans » ci-dessous).

## Preuves sur le Mac
### 1. L'échelle cran par cran (Node, les vraies fonctions du jeu)
`node outils/banc-voituredabord/echelle.cjs` découpe `qlBornes`, `qlDpr`, `vdaTient`, `vdaDecor`, `qlOmbN1`, `loupeChaud`, `qlDoux` dans `code/rendu/` et les rejoue avec l'état du 13 Pro (N1 BASSE, plafond 1,25, planchers 1,25 / 1,0, kNet 5, kMax 10, doux, capteur). Serious :

| cran | AVANT : DPR | AVANT : loupe | LOT : DPR | LOT : décor retiré (en plus des crans 0-5) | LOT : loupe |
|---|---|---|---|---|---|
| 0-4 | 1,25 | posée | 1,25 | — (ombre 768/512, halo ¾ : inchangés) | posée |
| 5 (kNet) | 1,25 | posée | 1,25 | — (plus de flou radial : inchangé) | posée |
| 6 | 1,188 | RETIRÉE | 1,25 | ciel 1/8 | posée |
| 7 | 1,125 | RETIRÉE | 1,25 | + halo un étage de moins | posée |
| 8 | 1,063 | RETIRÉE | 1,25 | rien de plus | posée |
| 9 | 1,000 | RETIRÉE | 1,25 | rien de plus | posée |
| 10 (kMax) | 1,000, halo coupé | RETIRÉE | 1,25, halo coupé | halo coupé | posée |

Le frein (même banc, la règle demande un cran de plus toutes les 1,1 s à partir du cran 5, effondrement posé) : serious AVEC le lot, crans 6 / 7 / 8 / 9 / 10 atteints à 0 / 11 / 22 / 33 / 44 s ; SANS (avant, ou tout autre état) : 0 / 11 / 22 / 33 / 34 s (là, c'est le frein de résolution du doux qui joue). Au 1er tour, sans frein, la descente sous VDA allait de 5 à 10 en ≈ 6 s.

Nominal : avec le lot, résolution d'avant (1,188 → 1,0) mais loupe posée ; sans, loupe retirée dès le cran 6. Critical : identique avant/après (loupe retirée, résolution d'avant).

### 2. Le vrai jeu dans Chrome (iPhone 13 Pro émulé, N1 BASSE, serious + branché simulés)
`outils/banc-voituredabord/vda.cjs` sous le verrou commun (`passe.sh`). Trois passes, chacune avec et sans le lot.
- **Effondrement posé en pleine course, téléphone lent simulé (45 ms par image)** :
  - avec le lot : 65 s suivies, loupe posée 65 s sur 65, toile 2532×1170 tenue, 0 réallocation ;
  - sans : la loupe part à l'instant de l'effondrement, toile 2532 → 1055×487 (1 réallocation), loupe absente 58 s sur 65.
- ⚠ **Passe 3 ci-dessous = 1er tour**. Ses colonnes « traits d'air » ne lisaient que la variable `IMG_DYN.vdaDens` : aucun pixel ne changeait (voir « Les crans morts »). Elle reste pour la résolution, la toile et la loupe, qui n'ont pas changé.
- **Crans menés un par un dans la boucle vivante (passe 3 : `--mode crans`, dbgQual 0 → 10, 2,5 s par cran, lent 45 ms + effondrement posés)**. Relevé du jeu, pas une simulation :

| cran | LOT : DPR / tampon | LOT : retiré | LOT : loupe | AVANT : DPR / tampon | AVANT : loupe |
|---|---|---|---|---|---|
| 0-2 | 1,25 / 2532×1170 | halo ½ 2 étages, ombre 512, ciel 1/4 (gouverneur serious) | posée | 1,25 / 1055×487 | retirée (effondré) |
| 3-5 | 1,25 / 2532×1170 | + halo ¾ | posée | 1,25 / 1055×487 | retirée |
| 6 | 1,25 / 2532×1170 | + ciel 1/8 | posée | 1,19 / 1002×463 | retirée |
| 7 | 1,25 / 2532×1170 | (1er tour : « traits d'air ×0,7 », sans effet ; 2e tour : halo 1 étage) | posée | 1,13 / 949×438 | retirée |
| 8 | 1,25 / 2532×1170 | (1er tour : halo 1 étage ; 2e tour : rien de plus) | posée | 1,06 / 896×414 | retirée |
| 9 | 1,25 / 2532×1170 | (1er tour : « traits d'air ×0,5 », sans effet ; 2e tour : rien de plus) | posée | 1,00 / 844×390 | retirée |
| 10 | 1,25 / 2532×1170 | halo coupé | posée | 1,00 / 844×390, halo coupé | retirée |

  Réallocations de la toile sur la descente : **0 avec le lot, 4 sans** (une par cran 6-9 ; plus celle du retrait de la loupe juste avant). Dans « sans », la loupe est déjà partie au cran 0 parce que l'effondrement est posé avant la descente (c'est le comportement d'avant).
- **Planches** (1er tour, sorties du dépôt au 2e tour : 500 Ko de JPG ; gardées hors dépôt dans `~/cash-car/lots-nuit/planches-voituredabord/`, refaites par `planche.py`, boucle figée, crans 0 / 5 / effondré) :
  - `planche-caisse.jpg` : la caisse en pixels réels de l'écran (×3 par rapport aux points CSS), agrandie ×1,5 au plus proche voisin. Ligne LOT : la caisse est aussi nette effondrée qu'au cran 0. Ligne AVANT : effondrée, elle devient floue (DPR 1,0, pas de loupe, tampon 844×390).
  - `planche-decor.jpg` : l'image entière. LOT effondré : halo coupé, ciel réduit, caisse intacte (les traits d'air n'y étaient pas réduits, contrairement à ce que disait le 1er tour).
  - ⚠ Les lignes LOT et AVANT viennent de deux chargements : ce n'est pas le même endroit de la piste. On compare à l'intérieur d'une ligne, pas d'une ligne à l'autre.
- **Non reproduit sur le Mac** : la descente NATURELLE de l'échelle sous le cran 5. Avec le téléphone lent simulé, l'échelle s'arrête au cran 4-5 en 4 s et y reste (60 s, avec ET sans le lot), même avec l'effondrement posé à la main, alors que la sonde lit 57-58 ms. Ce n'est donc pas le lot qui la bloque (cause non cherchée : piste, la cadence calée à 30 qui rend la boucle « pas calme » ou ramène l'intervalle). Le chemin de décision (`boucle-1.js`) n'est pas modifié : seul `qlDpr` change.
- Aucune exception, aucune panne (`dbgErreurs`) dans les 6 essais. Gardes : démarrage, allègement, charte OK ; `assembler --verifier` d'accord.

### 3. Les crans morts (2e tour, après le refus du contrôle)
Le contrôle a refusé le 1er tour : les crans 7 et 9 (« traits d'air ×0,7 / ×0,5 ») baissaient `IMG_DYN.vdaDens` dans `emiVit` (`rendu/stries-vent.js`), mais `emiVit` n'est appelée que sous `!TRAITS_NEUFS` (`moteur/boucle-3-physique.js:82` et `:407`), et `TRAITS_NEUFS` est vrai sauf avec `?traits=0`. Aucun pixel ne changeait ; le banc ne lisait que la variable. **Confirmé à la relecture.** J'ai cherché un levier vivant du décor pour les remplacer :
- **les filets de vitesse du shader final** (`triptyque-bloom.js`, `filets()`, `uTL`) : morts eux aussi à ces crans. Ils ne se dessinent que si `uSpeed` > 0,12, or dès le cran 5 `FLOU_OK` est faux, donc la boucle (`boucle-6-hud.js`, `sfxT`) pose `uSpeed` à 0. Les baisser au cran 7 ou 9 ne changerait rien ;
- **la taille du halo** (`BLOOM_RES`) : un changement appelle `bloomPass.setSize`, ce qui réalloue les cibles. Refusé ;
- **la taille ou la cadence de l'ombre** : 512 → 256 alloue une carte neuve et floute l'ombre de la caisse ; une ombre sur deux images la ferait trembler sous la caisse. Refusé (cela touche la caisse) ;
- **la distance de vue** (`camera.far`, 9800) : rien ne la règle en course aujourd'hui, et le dôme du ciel comme les tours lointaines en dépendent (risque de trous dans le ciel ou d'apparitions). Pas sûr sans le juger à l'œil sur chaque map ;
- **les particules du décor** (fumée, vent) : déjà réduites par le gouverneur de chaleur (`emiK`), et leur coût est faible.
**Décision : les deux crans sont retirés.** Il ne reste que les leviers qui font quelque chose : cran 6 = ciel 1/8, cran 7 = halo un étage de moins (avancé depuis le cran 8). Les crans 8 et 9 ne retirent plus rien ; la résolution reste tenue et le cran 10 coupe le halo, comme avant. `vdaDens` et sa ligne dans `emiVit` sont enlevés (`stries-vent.js` revient au code d'avant le lot).

**Preuve de l'EFFET** (`node outils/banc-voituredabord/vda.cjs --mode effet`, sous le verrou, `passe.sh`, relevés `releves/passe4-effet-*.json`). Vrai jeu, iPhone 13 Pro émulé, N1 BASSE, serious + branché simulés, carte nuages. La boucle est menée à la main (rAF coupé, `dbgStep`), avec l'effondrement posé. Pour chaque cran : on pose le cran sur 8 images, puis on compte les appels WebGL 2 sur 48 images (dessins `draw*` et bascules de cible `bindFramebuffer`, en enveloppant le contexte) :

| cran | AVEC : décor | AVEC : bascules de cible / 48 im. | AVEC : appels de dessin / 48 im. | SANS (avant) : DPR / tampon | SANS : bascules / 48 im. |
|---|---|---|---|---|---|
| 5 | — | 504 | 7260 | 1,25 / 1055×487 (loupe partie) | 456 |
| 6 | ciel 1/8 | **492** (−12 : la passe lisse du ciel, 1 image sur 8 au lieu de 1 sur 4) | 7254 | 1,19 / 1002×463 | 456 |
| 7 | + halo un étage de moins | **396** (−96 = 2 par image : un étage, une passe horizontale et une verticale) | 7158 (−96) | 1,13 / 949×438 | 456 |
| 8 | rien de plus | 396 | 7124 | 1,06 / 896×414 | 456 |
| 9 | rien de plus | 396 | 7062 | 1,00 / 844×390 | 456 |
| 10 | halo coupé | 252 | 6940 | 1,00 / 844×390, halo coupé | 216 |

Tampon AVEC : 2532×1170 (DPR 1,25) et loupe posée à tous les crans. Les bascules de cible ne dépendent que des passes, et elles sont stables d'un cran à l'autre quand rien ne change (8 et 9 : 396). Les appels de dessin, eux, bougent aussi avec la scène, parce que la piste avance d'1 ms par image. SANS : 48 bascules de moins au départ, parce que la loupe est déjà partie (effondrement posé). Aucune exception, aucune panne dans les deux essais.
Pas de preuve en pixels : j'ai pris une photo par cran, mais entre deux photos la piste et les animations avancent. 50 à 69 % des pixels changent d'une photo à l'autre, avec ou sans le lot, donc ces photos ne permettent pas d'isoler l'effet d'un cran. Elles ne sont pas gardées.

## Ce qu'il faudra lire dans la boîte de vol du téléphone
Même séance que celle du 18/11 (branché, économie, chaud). Course par course :
- **VD** (par seconde, aligné sur S) = cran du décor (0-2 depuis le 2e tour : 1 ciel 1/8, 2 + halo un étage de moins) + 10 si la résolution est tenue + 100 si la loupe est posée + 1000 si l'échelle est effondrée. À serious : la centaine doit être là TOUTE la course (≥ 100). La dizaine (10) doit être là partout où le capteur dit serious.
- **S** (cran QL) : il peut encore monter à 10. Ce n'est plus un défaut : vérifier dans VD que la résolution est tenue.
- **G[38] / M[16]** (toile / fenêtre) : 900 % du début à la fin à serious. Avant : 900 % puis 100 % dès la course 6.
- **ql / dpr** (enregistreur) : DPR 1,25 constant à serious. Aucune ligne 1,19 / 1,13 / 1,06 / 1,0.
- **Gels par minute** et **vrai coût R[2]** : pas pires que le 18/11 (vrai coût médian 21-24 ms, p90 34-37 ; gels 39-113/min). Le lot ne promet AUCUN gain de fluidité, seulement la voiture nette et quelques gels de réallocation (270-300 ms) en moins.
- Seuil d'alerte : si, à serious, VD ≥ 1112 (effondré, tout le décor retiré) et que le vrai coût dépasse 30 ms en médiane pendant plus d'une minute, la résolution aurait peut-être servi. À comparer avec une course `?sans=voituredabord`.

## Pour le pilote (`origin/qa/pilote`, à rebâtir dessus)
- Fusion d'essai (`git merge-tree`) : un seul conflit, `nettete-qualite.js`, la ligne `FLOU_OK=k<5;` de `qlPose`. Résolution : prendre le côté du pilote (verrou `vr9`, `PILO.dBloom`) et y remettre `vdaDecor(k,b);` après `FLOU_OK=k<5;`. `loupe-caisse.js` et `enregistreur-perf.js` fusionnent seuls.
- Sous le pilote, `loupeChaud` rend `PILO.lpOff` avant ma ligne : il faudra vérifier que le pilote ne coupe pas la loupe pour un effondrement à serious.
- Le verrou de résolution du pilote (`vr9`) et `qlDpr` plat ne se gênent pas : à serious la résolution voulue ne change plus, le verrou n'a rien à retenir.

## Non vérifié
- Rien sur le téléphone (consigne : ne pas y toucher). Aucun chiffre d'iPhone ici.
- La descente naturelle jusqu'au cran 10 dans le jeu vivant (voir plus haut) : prouvée seulement par les fonctions rejouées en Node et par les crans forcés.
- Le coût des crans de décor sur la puce (ciel 1/8, un étage de halo) : jamais mesuré en millisecondes. Au banc on a compté leurs appels de dessin et leurs bascules de cible (voir « Les crans morts »), pas leur temps sur l'A15.
- Le coût de la loupe gardée effondrée, sans mode économie : jamais mesuré (risque déjà noté dans le plan).
- `gdxLourd` (N2+) et `dkDoux` (N3/N4) : seulement relus, pas passés au banc avec le lot.
