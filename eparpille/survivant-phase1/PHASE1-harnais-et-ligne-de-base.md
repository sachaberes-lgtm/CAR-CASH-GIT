# CAR CRASH — Phase 1 : module SURVIVANT autonome + harnais de mesure + ligne de base

**Base** : `index.html` md5 `936d3675e86b47cce1e8869870fa7982` (10 806 lignes).
**`index.html` n'a pas été modifié.** Tout est en fichiers séparés.

## Livrables

| Fichier | Rôle |
|---|---|
| `survivant.js` | Le mode SURVIVANT extrait (lignes 8483-8981 + 8984-8989), **verbatim**, plus le harnais de mesure. 719 lignes. |
| `bench/world.js` | Le monde factice : piste, joueur scripté, toutes les globales du contrat. **Calibré sur le vrai jeu.** |
| `bench/stub-three.js` | three.js minimal — seul le calcul vectoriel est réel. |
| `bench/run.js` | Pilote Node : `node bench/run.js 10 180` → 10 runs de 180 s en ~2 s. |
| `bench/probe-*.js` | Les sondes Playwright qui ont servi à calibrer sur le vrai jeu. |
| `out/baseline.json`, `out/baseline.txt` | La ligne de base. |
| `out/real-tracks.json` | Les 14 pistes réelles relevées. |

L'instrumentation est marquée `/*M*/` : **13 lignes**. Les retirer restaure le bloc d'origine.
Elles ne lisent que l'état et n'écrivent que dans `SURV_M`. Aucun gameplay touché.

---

## ⚠ 1. LE BLOCAGE — le jeu est enfermé dans une IIFE

Découvert en instrumentant : ligne 647, tout `index.html` est enveloppé dans

```js
(function(){
'use strict';
…tout le jeu…
})();
```

**Conséquence : un `<script src="survivant.js">` séparé ne voit RIEN.** Les `const`/`let`/`function` d'une IIFE ne sont pas partagés entre scripts. `SPD`, `mode`, `pts[]`, `frameAt`, `T[]` — tout est invisible de l'extérieur. Vérifié dans un vrai Chromium : sur `buildTrack`, `SURV`, `NP`, `L`, `survStart`, `pts`, `HOLES`, `typeof` renvoie `undefined` depuis la console. Seules les 32 sondes `window.dbg*` sont accessibles, parce qu'elles sont explicitement posées sur `window`.

Le plan « un fichier séparé, six lignes d'accroche » **ne marche pas tel quel**. Trois sorties possibles :

**A — Le pont (`HOST`).** `survivant.js` définit `window.SURVIVANT=function(H){…}`. Dans l'IIFE, un seul bloc nouveau (~25 lignes) construit `H` avec des getters/setters pour les globales mutables (`mode`, `s`, `lat`, `vA`, `gameOver`, `shake`, `duckT`, `pts`, `T`, `Nn`, `B`, `L`, `NP`, `CONES`, `OILS`, `PADS`, `HOLES`), puis `const M=window.SURVIVANT(H);`. Les six accroches deviennent `M.survTick(dt)`, etc.
*Coût* : réécrire chaque référence du bloc en `H.x`. Diff **interne** au bloc SURVIVANT (donc sans conflit), + un bloc neuf de 25 lignes dans `index.html`. Surcoût perf : une indirection de propriété par accès — négligeable devant les 1 550 meshes de la scène, mais à mesurer.

**B — Concaténation.** `survivant.js` reste le fichier de travail et de versionnage ; on le colle dans l'IIFE au moment de fusionner. Zéro changement de code, zéro surcoût. Mais ce n'est plus « un fichier qu'on charge », c'est un copier-coller discipliné.

**C — Sortir le jeu de l'IIFE.** Écarté : gros diff, et l'IIFE sert (capteur d'erreurs d'init, repli si le CDN three.js tombe).

**Je m'arrête là-dessus : c'est ta décision, elle engage ton équipe.** Ma préférence est **B pour tout de suite** (on avance sur l'IA sans rien risquer) et **A quand le mode sera stabilisé** (la vraie modularité, une fois qu'on sait ce que le module doit exposer). Le banc, lui, fonctionne dans les deux cas — il charge les fichiers dans une portée unique.

---

## 2. Calibration du banc sur le vrai jeu

Je n'ai pas voulu d'un banc « à peu près ». J'ai fait tourner le **vrai `index.html`** dans un Chromium headless (three.js servi en local, sondes injectées dans une copie jetable `probe.html`, `index.html` intact) et relevé 14 pistes réelles.

**Ce que la mesure a dit — et j'avais tort deux fois :**

> v1 de mon générateur : pentes jusqu'à 0,5. J'ai vu 5,7 morts sur 7 en 60 s, j'ai accusé mon relief et je l'ai « corrigé » à 0,12.
> **La vraie piste est à 0,44 de pente médiane et 0,97 au maximum.** Mon relief v1, que je jugeais déjà excessif, était encore trop sage. La piste de CAR CRASH est un grand huit vertical.

Générateur recalibré, écart final au jeu réel :

| Métrique | Banc | Réel | Écart |
|---|---|---|---|
| Longueur `L` | 9 193 | 9 194 | 0 % |
| `NP` | 8 840 | 8 828 | 0 % |
| Courbure κ médiane | 6,76e-3 | 6,10e-3 | +11 % |
| Courbure κ p90 | 1,58e-2 | 1,55e-2 | +2 % |
| Pente \|T.y\| médiane | 0,443 | 0,441 | +1 % |
| Pente p90 | 0,696 | 0,724 | −4 % |
| Trous / piste | 0,357 | 0,360 | −1 % |
| Pistes **sans aucun trou** | 9/14 | 9/14 | 0 |
| Pads | 21 | 21,1 | +1 % |
| Plots | 96 | 98 | −2 % |

**La géométrie du banc est fidèle.** Le comportement, non — voir §4.

---

## 3. Ce que la mesure ajoute au diagnostic de la phase 0

### 3.1 — 64 % des pistes n'ont AUCUN trou (mesuré, 9 pistes sur 14)

C'est le fait le plus lourd de tout ce que j'ai mesuré, et il n'était dans aucun diagnostic.

Pas de trou ⇒ pas de `HOLES` ⇒ pas de `RAMPS` ⇒ **pas de catapulte pour toi non plus**. Sur ces pistes-là :

- un bot n'a **aucun** décollage « trou » possible ;
- son seul décollage volontaire est la `jumpZone`, qui n'existe que si **toi** tu as volé ;
- son seul autre décollage est le **bord**, c'est-à-dire une faute.

Autrement dit : **la majorité du temps, le mode SURVIVANT tourne sans le moindre vol**, sauf accidents. Ça ne dit pas seulement que « voler ne rapporte rien » (phase 0, point 1) — ça dit qu'il n'y a **rien à voler**. Le levier 2 du classement (lecture de piste) ne peut donc pas se contenter de lire les trous : il faudra lire **le relief**, qui lui est partout (pente médiane 0,44, crêtes à 0,97).

### 3.2 — La ligne de base (10 runs × 180 s de sim, banc)

```
zones enregistrées / run ......... 0.20      ← 8 runs sur 10 : AUCUNE zone
1re zone (s) ..................... 48.7      (quand il y en a une)
zones PROPOSÉES à un bot / run ... 0.10
zones CONSOMMÉES / run .......... 0.10
décollages / run ................ 6.20      (bord 6.10 · trou 0.00 · zone 0.10)
morts de bot / run .............. 7.00      dont couperet 1.40
part de distance faite EN VOL ... 0.681 %
survie 0s=7.0 10s=7.0 20s=5.7 30s=4.5 40s=4.1 50s=3.6 60s=3.1
```

| pilote | décol | bord | trou | zone | posé/total | taux | %vol | écart méd | morts (bord/trou/coup) |
|---|---|---|---|---|---|---|---|---|---|
| RICO | 0,90 | 0,90 | 0 | 0 | 2/9 | 22,2 % | 0,67 % | −428 | 10 (7/0/3) |
| JADE | 1,20 | 1,20 | 0 | 0 | 2/12 | 16,7 % | 0,71 % | −184 | 10 (10/0/0) |
| MOMO | 0,90 | 0,90 | 0 | 0 | 0/9 | 0 % | 0,53 % | −220 | 10 (9/0/1) |
| ZAZA | 0,80 | 0,80 | 0 | 0 | 0/7 | 0 % | 0,33 % | −411 | 10 (7/0/3) |
| LULU | 1,00 | 1,00 | 0 | 0 | 1/10 | 10 % | 0,46 % | −332 | 10 (9/0/1) |
| KIKI | 0,90 | 0,90 | 0 | 0 | 0/9 | 0 % | 0,41 % | −212 | 10 (9/0/1) |
| BOB | 0,50 | 0,40 | 0 | 0,10 | 0/5 | 0 % | 0,17 % | −502 | 10 (4/1/5) |

**Trois chiffres à retenir comme cible à battre :**

1. **98 % des décollages sont des fautes** (6,10 bord sur 6,20). Le vol n'est pas une décision, c'est une sortie de route.
2. **Taux d'atterrissage réussi ≈ 10 %** toutes unités confondues (5 poses sur 61 vols). Un décollage de bot est presque toujours une condamnation.
3. **0,68 % de la distance est faite en vol.** Le vol est numériquement invisible dans le classement — confirmation chiffrée du point 1 de la phase 0.

Et le point 4 de la phase 0 est confirmé au-delà de ce que je pensais : **avec un joueur qui ne saute pas volontairement, la meute ne reçoit jamais aucune zone** (8 runs sur 10 à zéro), et quand elle en reçoit une, c'est à 48,7 s — soit après le premier couperet.

---

## 4. ⚠ Ce en quoi il ne faut PAS encore avoir confiance

**Le banc est calibré sur la GÉOMÉTRIE, pas sur le COMPORTEMENT.** Contrôle croisé contre le vrai jeu (joueur scripté rendu immortel pour isoler le sort de la meute) :

| | Banc | Jeu réel |
|---|---|---|
| bots vivants à 30 s | 4,5 / 7 | 6,0 / 7 (n=2) |

**Le banc tue environ 2× trop vite.** Je ne sais pas encore pourquoi. Deux pistes, aucune vérifiée :

- **le joueur scripté du banc** est un pilote différent de celui de la sonde du vrai jeu — or c'est lui qui fixe le classement, donc qui meurt au couperet (`if(low&&low.totD<pTot)` : le couperet n'exécute le dernier bot **que s'il est derrière toi**) ;
- **le repère `Nn`/`B` du banc** est construit par reprojection alors que le jeu utilise un transport par quaternion. Si le signe diffère, la rétroaction de lacet (8809-8813) pousse les bots **dans** le virage au lieu de les redresser — ce qui produirait exactement le surplus de sorties par le bord observé.

**Donc :** les chiffres du §3.2 sont utilisables en **comparaison avant/après sur le même banc** (c'est leur usage prévu), mais **pas** comme vérité absolue sur le jeu. Les faits structurels (98 % de décollages fautifs, 0,68 % de distance en vol, l'absence de zones) sont robustes parce qu'ils ne dépendent pas du taux de mortalité — mais je ne les présente pas comme définitifs tant que le §4 n'est pas résolu.

---

## 5. Ce que je propose ensuite

1. **Trancher le §1** (pont / concaténation) — c'est toi.
2. **Résoudre l'écart de mortalité** avant toute modification de comportement : injecter le harnais `/*M*/` dans `probe.html` pour obtenir les mêmes 13 métriques côté vrai jeu, et comparer ligne à ligne. Sans ça, la règle cardinale n'est pas honorée : je pourrais « améliorer » un chiffre du banc qui n'existe pas dans le jeu.
3. Puis seulement : **levier 2** (lecture du relief et des trous) et **levier 4** (coordination de meute), tous deux entièrement dans le bloc SURVIVANT.

## 6. Ce qui reste incertain

- La cause de l'écart de mortalité banc/jeu (§4). C'est le point bloquant.
- `n=2` sur la référence du jeu réel : trop peu. Il en faut 10.
- Mon joueur scripté (banc **et** sonde) est un pilote médiocre. Un vrai joueur va plus vite, saute plus, crée plus de zones — toutes les métriques liées au joueur en dépendent.
- Le coût perf du pont `HOST` (§1 option A) n'est pas mesuré.
