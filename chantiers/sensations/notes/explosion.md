# Notes de l'agent `explosion` (passe SENSATIONS, 2026-10-14)

## Inventaire (ce qui EXISTE déjà — laissé tel quel)
- MAIN : `hap([55,45,160])` dans `explode` (coup lourd + retombée) → rien ajouté de concurrent sur l'instant de la mort.
- Pièces arrachées : jusqu'à 9 clones de `CAR_PIECES` (roues, capot…) + 8 éclats incandescents, gravité 22, rebond sur `BOOM_SOL`
  (restitution .22, tout ×.55), braises traînées par chaque éclat (`boomEmbO`). MAIS : vitesses en étoile depuis un point fixe.
- Suite : 3 foyers secondaires (180/410/640 ms), gerbes `BOOMV.rings`, colonne de fumée + braises qui s'échappent jusqu'à 2,4 s.
  `boomEmbO`/`boomEmbY` retombent en arc (acc 13/16) mais TRAVERSENT la dalle.
- Cause : seul le SON change (`mort.vide`, `mort.air`, `mort.arret`, `mort.police`, `mort.feu`, `mort.foudre`). 'pic' et 'tour' : aucun son de cause ('tour' a `villeImpact`).

## Détails
### 1. L'épave garde son élan — `sensBoomElan()` appelée dans `explode` (après les éclats)
- Le joueur meurt en roulant vite / en tombant : les pièces héritent de 22 % de la vraie vitesse de la caisse (`PT_U.uVc`), 12 m/s
  au plus (éclats : moitié). Au sol la roue file devant ; dans le vide la tôle continue de tomber.
- Pas pour 'tour' / 'facade' / 'pic' (un mur). `debrisLoin` repassé : jamais vers l'objectif.
- Provoquer : mourir à l'arrêt (6 s, 'arret' : étoile comme avant) vs chuter dans le vide ('vide') ou `dbgFacile('mort')` lancé.
- Risque : à très haute vitesse les pièces sortent un peu plus vite du plan de la mort (plafond 12 m/s ≈ 20 m en 1,8 s).
### 2. Le rebond se sent — `sensBoomRebond(d,vn)` appelée dans la boucle, branche `mode==='boom'` (2 lignes insérées autour du rebond existant)
- Mort AU SOL (`BOOM_SOL.ok`) : une pièce qui tape la dalle à > 3 m/s → 2 à 5 étincelles `sparkGold` qui courent au ras du bitume ;
  vraie pièce → `debris.tole` (vol −12…0 dB selon le choc) ; les 2 premiers rebonds → `sensHap(10,1)` (après boomT > .35 s, donc
  après le motif de la mort). 10 rebonds comptés par mort.
- La ROUE (clone avec `userData.R`) : garde l'élan le long de la dalle (×.83 au lieu de ×.55), rebond ×1,6, rotation = v/R (≤ 18 rad/s).
- Provoquer : mourir au sol (roule-ou-crève 6 s à l'arrêt, police, feu) et regarder / écouter 0,5-1,5 s après la boule.
- Risque : `debris.tole` par-dessus l'explosion + le son de mort (cd .08, max 3 voix, ≤ 10 par mort) ; à baisser si ça charge.
  L'axe de rotation de la roue reste l'Euler existant (elle tournoie, elle ne roule pas « droit »).
### 3. La pluie de braises rebondit — `sensBoomBraises(pool)` sur `boomEmbO` et `boomEmbY`, boucle, branche `mode==='boom'`
- Mort au sol : les braises qui retombent (acc 13/16) ne traversent plus la dalle ; elles sautillent (restitution .45, frottement .7)
  dans la largeur de la route, jusqu'à la fin de leur vie (≤ 1,8 s).
- Coût : ≤ 100 cases parcourues par image pendant le mode boom, rien quand la réserve dort ; zéro allocation.
- Provoquer : toute mort au sol ; regarder le bitume autour du foyer entre 0,6 et 1,8 s.
- Risque : faible (lecture seule de `BOOM_SOL`, écriture dans pos/vel des deux réserves de braises de l'explosion).
### 4. Contre un pic de jade, on s'écrase — `sensBoomRoc()` appelée dans `explode` (juste après `sensBoomElan`)
- Mort 'pic' seulement : la composante de vitesse des pièces qui fonçait dans la roche repart en arrière (25 % rendus), 12 étincelles
  `sparkGold` giclent à rebours du choc (dosées à la vitesse, plein à 60 m/s), `sfx('cratere',{vol:-7})` (pas à l'auto-école).
- Provoquer : monde des PICS DE JADE, voler dans un pilier / la muraille / l'arche.
- Risque : `cratere` (onde + sol qui se fend + gravats, il creuse la musique via SON_DUCK — déjà coupée à la mort) par-dessus
  `explosion` : à l'oreille, peut-être trop ; se retire en supprimant une ligne. Quelques pièces repartent vers la caméra (≤ ~4 m/s ;
  le masquage à 3,4 m de l'objectif existant s'applique).

## Rangement
- Aucun état durable : `SENS_BOOM` = un vecteur de travail + un compteur de rebonds remis à zéro tout seul quand `boomT` repart de 0.
  Les pièces, braises et étincelles sont celles des réserves / du tableau `debris` existants : `clearBoom` / `clearBoomArt` /
  `resetGame` les rangent comme avant. Avec `?sens=0` : aucune ligne ne s'exécute (`sv9` vaut 0).

## Écarté
- Vibration de la mort : `hap([55,45,160])` existe déjà dans `explode` → rien ajouté sur l'instant (seulement 2 taps légers aux rebonds).
- 2e détonation « réservoir » : il y a déjà 3 foyers secondaires (180/410/640 ms) + les gerbes `BOOMV.rings`.
- Traînée de braises AVANT d'éclater dans le vide, tôle qui se tord : il faudrait un délai ou toucher la caisse avant la mort (interdit).
- Vraie roue qui roule droit sur son axe : les débris tournent par Euler (rx, ry) ; refaire leur rotation = réécrire des lignes existantes.
- Poussière de roche (`dust`) pour 'pic' : sprite mou lavande près de l'objectif → risque de voile ; des étincelles à la place.

## Sons à faire
- `mort.pic` : la caisse qui s'écrase contre la ROCHE (craquement de pierre sec + éboulis court) — `cratere` baissé le remplace.
- `mort.tour` n'existe pas non plus dans la table de `explode` (c'est `villeImpact` / `impact.immeuble` qui porte la tour).
- `debris.roue` : un pneu qui rebondit (« boing » de caoutchouc mat) — aujourd'hui la roue sonne en tôle (`debris.tole`).
- Un grésillement de braises qui retombent (pluie fine, 1 s) pour la fin de l'explosion.
