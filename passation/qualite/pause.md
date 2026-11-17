# La pause sûre (17/11)

Sacha, build 119, 13 Pro : « Le bouton pause quand on est en jeu ne marche plus systématiquement. »
Branche `qa/pause` (worktree `~/cash-car/qualite-pause`, partie de `qualite-appareil`). Interrupteur : `?sans=pausesure`.

## La cause prouvée

`code/moteur/mobile-tactile.js:464`, l'écouteur `touchend` du ⏸ :

```js
if(!e.touches.length)return; // dernier doigt levé : le click suit, c'est lui qui ouvre
```

Le ⏸ agissait au LEVER du doigt. Doigt seul : par le `click`. Un autre doigt posé : par ce `touchend`.
Le trou : le pouce du volant tient, le doigt droit se pose sur ⏸, puis le pouce se lève AVANT le doigt droit.
Au lever du doigt droit, il ne reste aucun doigt : le code attend le `click`.
Mais le navigateur ne fabrique pas de `click` pour un toucher né pendant qu'un autre doigt était posé. Rien ne se passe.
C'est le geste naturel : on lâche le volant pour s'arrêter.

Banc Chrome (trace des événements sur le bouton) : `pointerdown, touchstart 2 doigts, pointerup, touchend 0 doigt` puis aucun `click`.

## Le correctif

`code/moteur/mobile-tactile.js:468-481` (LA PAUSE SÛRE) et `code/css/hud-da.css:513-516`.


- En course, le ⏸ agit AU CONTACT : `touchstart` sur le bouton, quel que soit le nombre de doigts posés.
  `preventDefault` (pas de `click` derrière), `gearTt` (ni `touchend` ni `click` ne rejouent).
- Un doigt qui GLISSE sur le bouton depuis ailleurs ne fait pas de `touchstart` sur lui : pas de pause fantôme (mesuré : 0/50).
- Zone tactile : le bouton dessiné fait 48 × 48. Un `::after` invisible le prolonge de 10 px vers le haut et 18 px vers la droite (le coin de l'écran) : 58 × 66 touchables. Rien vers le bas ni vers la gauche. Dessin inchangé (`opacity:0`). `code/css/hud-da.css`.
- Au menu (engrenage), à l'écran de mort : rien ne change (le `touchstart` ne fait rien hors course).
- Pendant l'explosion : le ⏸ passe à l'écran de fin, comme avant, mais au contact.

## Le banc

`node outils/banc-pause/pause.cjs [--n 50] [--q sans=pausesure] [--cas ...] [--w 390 --h 844] [--trace 1]`
Course réelle `?tel=1`, muette, toucher CDP. Reprise de la partie à la main entre deux appuis (attente de 380 ms : le verrou du double-tap).
CDP : `touchEnd` porte les points QUI SE LÈVENT (un `touchMove` sans un point ne le lève pas).

Résultats, 50 appuis par cas, debout 390 × 844 (fin : couché 844 × 390) :

| cas | avant (`?sans=pausesure`) | après |
|---|---|---|
| doigt seul | 50/50 | 50/50 |
| volant tenu pendant tout l'appui | 50/50 | 50/50 |
| **volant lâché avant le doigt de ⏸** | **0/50** | **50/50** |
| NITRO tenue | 50/50 | 50/50 |
| HUD calme | 50/50 | 50/50 |
| saut / vol | 50/50 | 50/50 |
| gros montant d'argent | 50/50 | 50/50 |
| après 3 retours d'arrière-plan + pivots | 50/50 | 50/50 (49/50 au 1er passage : la partie a fini sous l'appui) |
| doigt qui roule de 9 px | 45/50 puis 47/50 | 50/50 (48/50 au 1er passage, les 2 appuis juste après une relance de partie) |
| appui long 650 ms | 50/50 | 50/50 |
| couché, doigt seul | 50/50 | 50/50 |
| couché, volant tenu | 50/50 | 50/50 |
| fantôme (posé à 6-14 px dessous/à gauche, glissé sur ⏸) | 0/50 | 0/50 |

Ce qui est sous le doigt (`elementFromPoint`) : centre et coins = le bouton, dans tous les cas.
400 relevés en course (sauts, argent, annonces) : jamais rien par-dessus le ⏸. Couché, deux coins de la boîte tombent hors de la plaque penchée (normal).
À côté du bouton, partout : `#tSteer` (la zone du volant couvre l'écran). Après : 6 px au-dessus et à droite = le ⏸.
Écouteurs sur le bouton : 4 avant, 5 après (le `touchstart` neuf) ; identiques après 3 retours + pivots. Pas de fuite sur le ⏸.

## Écartés (vérifiés dans le code ou au banc)

- Rien ne recouvre le bouton (voile, flash, toile du moteur vif, annonces, argent) : 0 sur 400 relevés.
- HUD calme et HUD endormi : ni l'un ni l'autre ne touchent `#tSet` / `#tGear`.
- Lot jsimage (`stSet`) : n'écrit que le style du volant.
- `togglePause` ne refuse que pendant l'explosion (et `gearOpenHandler` y fait passer l'écran de fin).

## NON prouvé

- Sur iOS, le `click` d'un doigt SEUL peut aussi se perdre (doigt qui roule, contenu qui change sous le doigt, WebKit qui hésite). Chrome ne le reproduit pas. Le correctif le contourne quand même (plus de `click` en course).
- Le doigt qui roule de 9 px ratait 3 à 10 % dans Chrome avant ; WebKit a peut-être un seuil plus bas.
- Le verrou du double-tap (`uiGarde`, 320 ms, `aura-banque-contrats.js`) avale tout `click` après une feuille : en course, je n'ai trouvé aucun chemin qui l'arme. Le correctif ne passe plus par le `click`.
- Rien n'a été mesuré sur le téléphone.
- Même trou, non corrigé : la feuille de pause (`mobile-tactile.js:500`, REPRENDRE, SON…). Un pouce resté posé qui se lève avant le doigt de REPRENDRE : rien. Moins grave (on peut retaper), hors de cette demande.

## À tester sur le 13 Pro

1. Pouce gauche sur le volant, tap ⏸ du droit, lever le pouce gauche EN PREMIER : pause à chaque fois.
2. Tap ⏸ d'un seul doigt, vite, 20 fois : pause à chaque fois.
3. Tap un peu au-dessus et un peu à droite du ⏸ (vers le coin) : pause.
4. Tap juste sous le ⏸ ou à sa gauche : pas de pause (le volant).
5. Pouce du volant qui glisse jusque sur le ⏸ : pas de pause.
6. Pendant un saut, en HUD calme, couché : pause.
7. Pendant l'explosion : ⏸ passe à l'écran de fin.
8. Au menu : l'engrenage ouvre les réglages comme avant.
9. Avec `?sans=pausesure` (Safari) : l'ancien comportement, pour comparer.
