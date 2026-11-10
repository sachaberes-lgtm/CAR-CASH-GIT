# Audit du 10/11, lot A : ce qui a été poussé sur main aujourd'hui (pièces, missions, route, portails, boule de feu NITRO, nitro physique, réanimation de la machine à sous)

Relecture de code seule, sans navigateur ni commit, avec `code/` et `VERSION PRINCIPALE/` en lecture seule. Branche `debug-gameplay` (main v1424 + correctifs).
Les numéros de ligne renvoient à l'état actuel de la branche. `node code/assembler.cjs --verifier` donne : « index.html et les 305 morceaux sont d'accord ».

## 1. Verdict par commit

| commit | sujet | verdict | ce qui a été vérifié |
|---|---|---|---|
| 79808483 | les pièces ramassées entrent dans la caisse (CVOL) | **SAIN** | L'argent reste payé à la même image, une seule fois : `coinVolLance` ne fait que l'animation, et `combo` et `addCoins` restent après. La remise à zéro de `CVOL.n` passe par `spawnPickups` (REJOUER, portail, nouvelle piste). `coinVolTick` vide la réserve hors `drive`/`fall` (mort, menu). Durées en secondes, donc rien ne change à 30 i/s. La réserve pleine (128 pièces) ou « réduire les animations » retombent sur l'ancienne gerbe. Une 2 € reste dessinée en 2 € (`F[o+9]` lit `COIN_DEUX`). Pas d'allocation. Pas de dépassement de `COIN_CAP`. |
| 2ca207a2 | l'aimant vise la caisse de l'image courante (portage, `RAM.Bp`, `RAM.dC`) | **SAIN** | `RAM.dC` est remis à zéro à la 1re image, après un saut de plus de 150 m et pour tout pas de plus de 80 m. `magSpirale` et `magPorte` ne sont appelés qu'après l'init de `RAM`. La capture à `RAM.Bp` est réservée aux pièces sous aimant, au sol, sur la face de la caisse (filtres de branche), et `p.taken` empêche de payer deux fois. En vol `Bp` = la pose déjà à jour. Avec `?pvol=0` ou sans aimant, l'ancien chemin est inchangé. À 30 i/s : le portage se fait en déplacement par image (indépendant de la cadence), la spirale est en `dt`, et le lerp est borné à 1 comme avant. Seul reste théorique : une téléportation de moins de 80 m (reprise) fausse `Bp` pendant une image, sous aimant seulement (négligeable). |
| 5186dd13 | séries plus courtes, la 2 € paie double, prime de série recalée | **DÉFAUT** (JA-01) | Les motifs gardent le même nombre de tirages `rc()` par appel (seules les boucles `LMAX` changent le flux, ce qui est voulu). `coinSerie` exige toujours n ≥ 4. Aucune mission ne dépend de la longueur d'une série. **Mais** le facteur 1,5 / 0,75 s'applique aussi quand `COIN_DEUX` est faux (Jade ¥, crypto ₿) : JA-01. |
| 3f767c2a | missions du début plus longues et plus dures | **DÉFAUT léger** (JA-04, JA-05) | Les id sont gardés, les missions déjà réussies (`s.ok`) le restent, le texte « 8 MIN » correspond à `v:480`, et les seuils montent dans l'ordre (aura 20k < 40k < 50k, eng 14 < 25 < 30). Le Pass est éteint (`pass-table.js` garde les anciennes estimations, sans effet). **Mais** `air5` (8 s en l'air puis parfait) dépasse le chrono de vol de 6 s (5 s en orbite) : JA-04. |
| a1d9a785 | une figure de route remet le compteur « par saut » à zéro | **SAIN** (note JA-05) | `m2Saut()` est appelé après `C.lance` et avant le paiement (`frPaye` → `figPaye` → `m2Fig`) : la figure de route compte bien pour 1 dans son « saut ». Une figure de route qui décolle (`frDecolle` dans `startFall`) est remise à zéro par `startFall` puis payée en vol, donc elle compte dans le saut. `m2Saut` remet aussi `volT` et `tourV` au sol, sans effet (ils ne montent qu'en vol). Les records `r.fig` gonflés par l'ancien défaut ne sont pas purgés : la barre de progression peut mentir, mais il n'y a pas de faux gain (JA-05). |
| 8c17e917 | plus de traits blancs (`TRAITS_NEUFS`, `?traits=0`) | **SAIN** | `TRAITS_NEUFS` est déclaré dans `rendu/stries-vent.js:28` (même IIFE, lu seulement en boucle, donc pas de zone morte). Les blocs sautés n'ont pas d'autre effet de bord que `emiVit` (état de report propre aux traits) et `tmp` en vol, recalculé plus bas (`boucle-3-physique.js:418`). Pas de différence portrait / paysage. |
| c50e1272 | la fenêtre du portail se voit des deux sens | **SAIN** | Diff limité à `side:DoubleSide` et `l.z=-abs(l.z)`. Le diviseur garde `max(.05,-l.z)`, donc pas de division par zéro. Le franchissement (`pcubeFranchi`, `s>L-24`) n'est pas touché. `dbgVuePortail(…,dos)` ne sert qu'au banc. NB : le message de commit parle de « plus transparente à l'envers », ce qui n'est pas dans le code (rien de plus que la double face). |
| c007ed4b, 769b745d, 277a9737, f749cadb, fffcaaba, 4b6535bf, ba4c596a | boule de feu NITRO (dessin, glissé de 58 px, explosion au double-tap) | **SAIN côté jeu** | Le glissé (`nx3Pouce`) n'a que des écouteurs passifs, à part : `bindHold` (`mobile-tactile.js:24-35`) garde seul `keys.Space`, et ses `preventDefault` / `stopPropagation` n'empêchent pas les autres écouteurs du même élément. Multi-touch : un seul identifiant suivi, `touchend` filtré par identifiant, `touchcancel` / `blur` / `visibilitychange` lâchent. `nx3Souffle` décroche si `appui` retombe (pause, mort, doigt levé ailleurs). Hors `body.play`, `nxfRepos` remet tout au repos. `nxfBoum()` (appelé par `veqDoigt`, `vol-equilibre.js:162`) est protégé (`NX3.flame`, `NX3.el`, `NX3.J`, `NX3.repos`, mouvement réduit), et `VEQ.dReq` est posé avant : la figure du double-tap part même si le décor échoue. `nx3Tick` est dans un `try` (`boucle-6-hud.js:79`). Zone tactile : la boîte passe de 21×29 cases × 3,6 px (75×104) à 30×48 × 3,3 px (99×158 debout) et × 2,6 px (78×125 couché, `max-height:430px`), donc elle grandit dans les deux orientations. `#tNitroZone` (46vw × 190 px, à gauche en gaucher) n'a pas bougé. La toile (198×218 px) est en `pointer-events:none`. |
| 4276b5af | nitro physique (`?nitro=physique`) | **SAIN : le chemin par défaut est inchangé** | `NPHY.on` vient du seul drapeau. Sans lui, `build` sort tout de suite, `ok` reste faux, et `ev`, `drive` et `coupe` sortent sur `!NPHY.ok`. Le mélange voit `(NPHY.ok?NPHY.lit:1)` = 1. `blowOff` et la pétarade sont gardées par `!NPHY.ok` (vrai par défaut). Tous les appels sans `try` (`startFall`, `tryLand`, `driftTick`, `boucle-1`, `boucle-2`, `boucle-5`) s'exécutent en course, après la déclaration de `NPHY` (morceau 222). Le moteur moderne de l'appli (`MB`) n'appelle que `NPHY.ev('rate')`, qui ne fait rien. `ORDRE.txt` et index.html sont d'accord (`--verifier`). |
| fa506821 (+ 120cc7e7 = cache seul) | machine à sous : le cœur gagné réanime tout de suite | **DÉFAUT** (JA-02, JA-03) | Endroit de la reprise : `chanceSafe()` + `respawn()`, comme pour la pub. Bouclier de 3 s. États remis par `chanceRepart` (nitro, chaîne, airtime, moteur −1, `M2R.vie`). Pas de « départ boosté » au retour (`spinDepart` est gardé par `CHANCE.used`). Comptes de la fin suivante : déplacer `lb`, `v1` et `a0` avant la porte est **correct** et corrige un double versement d'aura lors d'une 2e reprise (la fin suivante ne verse que le surplus). Double réanimation dans une partie : voulue (le commentaire le dit) ; `m0`, `rs`, `a0` et `v1` sont reposés à chaque reprise, donc rien n'est payé deux fois. Pas de course avec `chanceAuto`, qui n'a lieu que si l'écran de mort ne s'ouvre pas. **Mais** la promesse « TU REPARS TOUT DE SUITE » tombe si la machine se ferme dans les 1,5 s (JA-02), et un 4e bon est perdu au plafond (JA-03). |

## 2. Défauts, triés par gravité

### JA-01 : sur Jade et la crypto, toutes les pièces paient 25 % de moins (régression du revenu)
- **Commit** : 5186dd13.
- **Où** : `code/gameplay/ramassage.js:169`.
- **Scénario** : on joue la map Jade (pièces ¥) ou une map crypto (pièces ₿). `coinSymbole('Y'|'B')` met `COIN_DEUX=false` (`pickups-fruits.js:109`), donc il n'y a plus de 2 € sur ces maps. Chaque pièce paie alors `denom()*2.2*0,75` au lieu de `×1` : le revenu en pièces y baisse de 25 %. Le commit annonce pourtant « la moyenne reste ≈ ×1, le revenu ne bouge pas ».
- **Cause** : `((p.deux&&COIN_DEUX)?1.5:.75)`. La moyenne 0,32×1,5 + 0,68×0,75 ≈ 1 ne tient que si des 2 € existent. Sans elles, toutes les pièces tombent à 0,75.
- **Correctif minimal** :
  ```diff
  -        const g=denom()*2.2*((p.deux&&COIN_DEUX)?1.5:.75)*mult*(fever>0?2:1)*flowMult();
  +        const g=denom()*2.2*(COIN_DEUX?(p.deux?1.5:.75):1)*mult*(fever>0?2:1)*flowMult(); /* sans 2 € (¥, ₿) : la pièce garde sa valeur d'avant */
  ```
- **Confiance** : **SÛR** sur le mécanisme. Le montant relève de l'économie : à confirmer par Sacha, mais le message du commit dit que le revenu ne devait pas bouger.

### JA-02 : la machine annonce « TU REPARS TOUT DE SUITE », mais la reprise est annulée si l'on touche TIRER (ou ESPACE / ENTRÉE) dans les 1,5 s sans jeton
- **Commit** : fa506821.
- **Où** : `code/economie/final-spin.js:427` (la condition `!SPIN.ouvert` de `spinRevit`) et `final-spin.js:280` (`spinTirer` sans jeton, qui appelle `spinFerme()`). Le clavier passe par `final-spin.js:465`.
- **Scénario** : mort par explosion, la machine s'ouvre, on joue son dernier jeton. Le nouveau jeu de taps (« TAPE POUR BLOQUER… TAPE VITE ») pousse à taper encore : un tap de plus sur le bouton TIRER une fois les rouleaux posés (ou ESPACE au PC) appelle `spinTirer`. Il n'y a plus de jeton, donc `spinFerme()` ferme la machine. 1,5 s plus tard, `va()` trouve `!SPIN.ouvert` et sort : pas de reprise, et le joueur reste sur l'écran de mort après « TU REPARS TOUT DE SUITE ». Le bon n'est pas perdu (il servira à la chute suivante), mais la promesse du commit ne tient pas. S'il reste des jetons, le même tap lance au contraire un nouveau tirage (un jeton dépensé sans le vouloir) et la reprise attend la fin des rouleaux.
- **Cause** : `spinRevit` exige que la machine soit encore ouverte. Or rien d'autre que la fin de partie (déjà testée par `started&&gameOver` et `garageOn`) ne justifie d'abandonner.
- **Correctif minimal** :
  ```diff
  -    if(!SPIN.ouvert||!(started&&gameOver)||garageOn||!CHANCE.eligible)return;
  +    if(!(started&&gameOver)||garageOn||!CHANCE.eligible||CHANCE.auto)return;
       if(ecranWipe._on||PUBR.on||M2REV.on||SPIN.roule){SPIN.tmRevit=setTimeout(va,150);return;}
  -    CHANCE.gratuit=true;spinFerme();chancePrend();};
  +    if((SAVE.d.chanceG|0)<=0)return; /* le bon a déjà servi ailleurs */
  +    CHANCE.gratuit=true;if(SPIN.ouvert)spinFerme();chancePrend();};
  ```
  En option, pour éviter de brûler un jeton : dans `spinTirer`, `if(SPIN.tmRevit&&…)return;` pendant la fenêtre de 1,5 s. Il faudrait alors remettre `SPIN.tmRevit=0` dans `va`.
- **Confiance** : **PROBABLE**. Le chemin est sûr à la lecture ; la fréquence dépend de la vitesse des taps du joueur.

### JA-03 : un cœur gagné avec déjà 3 bons en réserve coûte un bon
- **Commit** : fa506821.
- **Où** : `code/economie/final-spin.js:396` (`Math.min(3,…)`) avec `final-spin.js:420` et `seconde-chance.js:158`.
- **Scénario** : on a 3 bons de seconde chance en réserve et la reprise de la partie est déjà prise (`CHANCE.used`), donc `chanceAuto` ne sert pas. On meurt, on tire et on gagne le cœur. `spinDonne` plafonne à 3 (le cœur est perdu), puis `spinRevit` → `chancePrend` dépense un bon. On repart avec 2 bons alors qu'on venait d'en gagner un.
- **Cause** : la reprise immédiate dépense un bon de la réserve, alors que le lot n'a pas pu y entrer.
- **Correctif minimal** : dans `spinPaye`, avant `spinRevit`, mémoriser que le lot n'est pas entré (`R.plein=(SAVE.d.chanceG|0)>=3` avant `spinDonne`). Le plus simple : dans `spinDonne`, `if(L.bon){const a9=SAVE.d[L.bon]|0;SAVE.d[L.bon]=Math.min(3,a9+1);R.bonEntre=SAVE.d[L.bon]>a9;}`, puis dans `spinRevit` → `va`, quand le bon n'est pas entré, faire `SAVE.d.chanceG++` avant `chancePrend()` (le plafond est dépassé un instant puis aussitôt redescendu).
- **Confiance** : **SÛR** sur le mécanisme ; cas rare (3 bons en réserve et reprise déjà prise).

### JA-04 : « RESTE 8 S EN L'AIR, PUIS POSE-TOI EN PARFAIT » est impossible sans aide, car le chrono de vol tue à 6 s
- **Commit** : 3f767c2a.
- **Où** : `code/missions/table.js:16` (`air5`, `v:8`). Chrono : `son/curseurs.js:270` (`AIR_MAX=6`), `gravite-orbite.js:7` (orbite 5 s), `boucle-3-physique.js:587` (`airDepasse` → `explode('air')`). Compteur : `missions/defis-moteur.js:258` (`M2R.volT+=dt` en vol).
- **Scénario** : nouveau joueur, mission du début. L'airtime réel est plafonné par la jauge de 6 s, visible à l'écran. 8 s ne s'atteignent qu'avec le pouvoir AIRTIME (14 s), le raisin (2e jauge), un demi-tour (demi-jauge rendue) ou l'eau de Jade. Avant le commit, 5 s tenaient dans une jauge de 6 s. La mission « du début » dépend maintenant d'un pouvoir, et la jauge à l'écran contredit l'objectif.
- **Cause** : le seuil a été relevé sans regarder `AIR_MAX`.
- **Correctif minimal** : `{id:'air5',…,v:5.5,…}` (dur mais faisable, sous les 6 s), ou garder 8 en ajoutant au texte « AVEC LE POUVOIR AIR MAX ». Décision de Sacha.
- **Confiance** : **SÛR** sur la borne de 6 s ; **DOUTEUX** que ce soit voulu ou non (réglage).

### JA-05 (note, faible) : les records « figures en un saut » gonflés par l'ancien défaut restent en sauvegarde
- **Commits** : a1d9a785 avec 3f767c2a.
- **Où** : `code/missions/defis-moteur.js:108` (`case 'fig':return r.fig|0`), `defis-moteur.js:283`.
- **Scénario** : de v1401 à v1421, `M2R.figV` cumulait les figures de route. Avec les seuils relevés le même jour (4 / 8), quelques figures de route isolées ont pu valider `fig2` / `fig5` (LE SCARABÉE) sur cette période. C'est du passé : ces missions sont acquises. Aujourd'hui `r.fig` reste gonflé (par exemple 7). La barre affiche « 7 / 8 », mais aucun faux gain futur n'est possible : `r.fig` ne monte que si `figV` le dépasse vraiment.
- **Correctif** (facultatif) : aucun dans le code de jeu. Si l'on veut une barre honnête, une migration une fois : `if(!s.c.figFix){s.c.figFix=1;if(s.ok.indexOf('fig5')<0)r.fig=Math.min(r.fig|0,3);}`. C'est discutable, car cela retire un record à des joueurs honnêtes.
- **Confiance** : **DOUTEUX** (impact seulement visuel).

## 3. Résultats négatifs utiles (vérifiés, ne pas rouvrir)
- **Pièces volantes** : aucun gain déplacé ni doublé. Remise à zéro de CVOL : `spawnPickups` (REJOUER, portail, piste) et `coinVolTick` hors course. 30 i/s : tout est en `dt`. L'étincelle à l'arrivée est plafonnée à 3 gerbes par image (réserve de 140).
- **Aimant** : le tire-bouchon ne pousse plus la pièce le long de la trajectoire. Le portage suit la vitesse (seuils `0,03v` / `0,15v`). `RAM.dC` est nul à la 1re image et après les sauts. Rien ne change sans aimant.
- **Missions** : la figure de route n'est pas comptée avant sa remise à zéro (l'ordre `m2Saut` → paiement est bon).
- **Traits d'air** et **portail double face** : rien dans le jeu.
- **NITRO** : les deux orientations et les gauchers sont vérifiés par lecture du CSS (`max-height:430px`, `--hudD` / `--hudG`, `#tNitroZone` miroir). Rien ne reste collé après une pause ou une mort (`nx3Souffle`, `nxfRepos`, `lache`). Le toucher de la nitro et du double-tap reste celui de `bindHold`.
- **Nitro physique** : le chemin par défaut est strictement inchangé (toutes les nouvelles branches passent par `NPHY.ok`, faux sans `?nitro=physique`).
- **Réanimation du cœur** : bonne position et bon bouclier, comptes de la fin suivante justes (le commit corrige même un double versement d'aura lors d'une 2e reprise), pas de « départ boosté » au retour, pas de course avec `chanceAuto`.
