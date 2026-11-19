# L'ESPACE — CRIBLE NODE DE LA GÉNÉRATION (2026-11-18, rôle « generation »)

Code mesuré : le worktree `espace-debug-ed5d53` (base a42e9ec50, build 121), aucun fichier suivi modifié.
Outils : `outils/banc-espace/generation-*.cjs` ; données brutes : `passation/espace-debug/data/*.jsonl`.

## Ce qui est mesuré, et comment
- **Les vrais générateurs** chargés dans un vm Node (`generation-charge.cjs`, copie de `charge.cjs`) : `genCtrl` puis `pisteTordPropre`, comme `pisteRoute`.
- **La dalle JOUÉE**, refaite comme `pisteRoute` (depart-avance.js:108-209) : `courbeCR`, pts équidistants (N 3000-9000), T,
  Nn interpolée par `getUtoTmapping`, puis LA DALLE LISSE (σ = clamp(0,3·vC9, 20, 80) m). Les modules passent par `sDe` (MODS), comme le jeu.
  Tout est mesuré sur cette dalle-là, pas sur les points de contrôle.
- **Les séries** (`generation-crible.cjs`) : par palier, un vm, 30 routes de rodage puis 300 routes **de suite**. Le sac RU, ORB_PIOCHE, OU et
  OU_FORMES gardent leur mémoire d'une route à l'autre, comme dans une partie. Graines `(rand·1e9)|0`, base 20261118.
  Paliers 0 / 10 / 20 / 27. Vitesse v = vPalier × élan : 140 / 234 / 396 / 439 m/s. rayonPalier = 63 / 87 / 142 / 172 m.
- **Neuf** (1200 routes) contre **`?sans=uniques`** (1200 routes).
- **Tirages forcés** : `?orbcx=` roue, lune, asteroide, nebuleuse, torsade, sret, failleEnvers (45 routes × 4 paliers chacun),
  `?orbouv=` mur, bosse, plongeon, `?orbfin=` lacet, module, desorb, `?orbrel=` raide, paliers (40 × 4), vagues (30 au p0). Au total 2568 routes.
- **Les mesures** (`generation-mesure.cjs`), attribuées au module dont la marque couvre l'abscisse, sinon à « liaison » ; les raccords sur ±0,5 s
  autour de chaque début et fin de module :
  - roulis de la dalle (dN·B × v, en °/s) : max, temps > 60 / 90 / 120 °/s ;
  - demi-tour de Nn en 0,5 s ;
  - envers (Nn.y < 0) : durée par module ; au départ (0-300 m) et à l'arrivée (200 derniers m) ;
  - rayon vertical (crête / creux, dalle debout) et rayon dans le plan de la dalle, contre rayonPalier ;
  - pentes, et montée tenue sur 100 m ;
  - frôlements de la dalle avec elle-même : le critère de `tordContacts` (|d·N| < 16, |d·B| < 62, plus de 250 m d'écart), vu depuis les DEUX
    dalles, plus un « plafond » (une autre dalle 0-30 m au-dessus de la caisse) ;
  - marques : i0 ≥ i1, chevauchement, hors route, longueur nulle, climax absent ou double ;
  - zones refusées par `pisteTord` (`info.zones`), NaN, pas du contrôle, coudes, exceptions, essai de `pisteTordPropre` gardé, contacts restants ;
  - géants des voyages refaits comme `voyRoue` / `voyLune` / `voyAsteroide` sur la dalle jouée :
    - roue : cercle, « face », écart de la route au cercle, coque de la jante contre la route d'approche, filtre `ok` compris ;
    - lune : ajustement, écart, route ou saut (10-70 m au-dessus de la dalle) dans la sphère ;
    - astéroïde : Ra, route dans la roche pleine hors du trou du tunnel.

## Résultat d'ensemble : la GÉOMÉTRIE des routes de l'espace est saine
Sur 4968 routes, aucun défaut de géométrie de la dalle que le joueur verrait comme « route cassée ».
- 0 exception, 0 NaN, 0 marque incohérente. Exactement 1 climax par route en neuf (3-4 en `sans=uniques`, c'est le tirage d'avant).
- `pisteTordPropre` garde l'essai 0 sur toutes les routes, 0 contact restant.
- **0 frôlement.** Aucune paire de points à moins de 75 m l'une de l'autre avec plus de 250 m de route entre elles, sur toutes les routes, neuf comme
  avant : la route descend de 30-45° en moyenne et ne repasse jamais près d'elle-même. Rien au-dessus de la tête, aucun recoupement.
- Départ : Nn.y min sur 0-300 m ≥ 0,385, jamais à l'envers. Arrivée : Nn.y ≥ 0,995 sur toutes les routes, à tous les paliers et tous les tirages forcés.
- Aucun demi-tour de la normale en 0,5 s (Nn·Nn(+0,5 s) ≥ 0,6 partout). Aucun passage au-dessus de 90 °/s de roulis, nulle part (0 / 4968).
- Envers seulement dans les modules qui le veulent : failleEnvers ~9 s, torsade 7-10 s, sret ~6 s, géants 4-6 s, fronde, surbaisse, plongeant,
  stengel, rentrée 1-3 s. Les 7 petits modules neufs (mur, esse, marche, bosse, quart, chicane, plongeon) : 0 s d'envers.
- Géants à p0 / p10 : 100 % posés, repères = marques (décalage 0 m).
  - Roue : jante toujours posée (face 0,93-1), écart route/cercle médian 1-2 m (max 31 m), la coque n'entre jamais dans la route d'approche.
  - Lune : écart médian 6-11 m, ni la route ni un saut de 70 m n'entrent dans la lune.
  - Astéroïde : jamais de route dans la roche pleine.
- Rayon vertical sous rayonPalier : seulement la CASCADE à p0 (voir D3), neuf comme avant.

Tableau par module × palier (N vus, roulis max, % de routes > 60 °/s, envers moyen, Rv min, demi-tour min) :
`node outils/banc-espace/generation-tableau.cjs passation/espace-debug/data/neuf.jsonl quoi=mods` (idem `sans.jsonl`, `force-*.jsonl`).
Extrait (neuf ; « > 60 » = part des routes qui jouent ce module) :

| module | p0 N / roulis max / >60 | p10 | p20 | p27 | sans=uniques (même palier) |
|---|---|---|---|---|---|
| liaison | 300 / 62,5 / 8 % | 300 / 66,4 / 21 % | 300 / 63 / 6 % | 300 / 64,7 / 6 % | p0 68,4 / 50 % · p10 66,1 / 21 % · p20-27 40 / 0 % |
| esse (neuf) | 54 / 55 / 0 % | 61 / 53 / 0 % | 62 / 64,1 / **23 %** | 83 / 64,6 / **48 %** | — |
| mur (neuf) | 75 / 52 / 0 % | 64 / 52 / 0 % | 76 / 62,2 / **18 %** | 95 / 63,1 / **42 %** | — |
| plongee | 146 / 63,9 / 2 % | 138 / 62,3 / 3 % | 22 / 62,5 / 9 % | — | p10 20 % · p20 43 % (66,4) |
| cascade | 33, Rv 52 m < 63 (crête) | 15, Rv 99 m | — | — | p0 110, Rv 52 m (100 %) |
| tous les autres | ≤ 57,6 / 0 % | ≤ 57,9 / 0 % | ≤ 54,5 / 0 % | ≤ 56 / 0 % | ≤ 57 / 0 % |

## DÉFAUTS PROUVÉS (par gravité vue par le joueur)

### D1 (moyen) — LA ROUTE DÉPEND DE L'HORLOGE : même graine, même histoire, route différente selon la vitesse de la machine
- **Mesure.**
  - Deux processus Node rejouent la MÊME série (palier 20, mêmes graines, même code) : à partir de la route n° 46-76, ils divergent ;
    173 routes sur 280 diffèrent. Exemple : g548507298 (rang 244) est « fronde > lune » dans le crible, « plongeant > esse > stengel » au rejeu.
  - Même test, horloge figée (`performance.now` → 0) : 0 différence sur 180 routes.
  - La cause est donc l'horloge et elle seule.
- **Cause.** `code/maps/ville-entree.js:704`, la boucle des reprises d'unicité : `t7<150&&(t7<3||!t09||performance.now()-t09<50)`.
  Le nombre de reprises dépend du temps écoulé, et chaque reprise change le plan, le sac (RU.V) et OU_FORMES : toutes les routes suivantes changent.
- **Effet joueur.**
  - Sur un téléphone plus lent, le budget de 50 ms coupe les reprises plus tôt. Horloge ×8 (`lent=8`) contre ×1, 200 routes de suite :
    suites de modules redites **42 / 200 au p27** (contre 1) et **20 / 200 au p20** (contre 2). La promesse « chaque route unique » tient
    beaucoup moins sur l'iPhone.
  - Une route n'est pas reproductible d'une machine à l'autre, ni d'un passage à l'autre quand la machine est chargée. Une route vue sur
    l'iPhone ne se rejoue pas au banc à l'identique, sauf avec `?pistegraine=` (sac figé, sans reprise).
  - La qualité des routes refaites est la même que celle des autres (roulis max moy 51-54 contre 53-56, Rv min moy égal) : pas de dalle cassée.
- **Origine.** Routes uniques : `?sans=uniques` n'a pas de reprises, donc pas d'effet d'horloge.
- **Commandes.**
  - `node outils/banc-espace/generation-rejeu-serie.cjs 20 250 a.json & node outils/banc-espace/generation-rejeu-serie.cjs 20 250 b.json` puis comparer.
  - Le même avec un `0` final (horloge figée) : 0 différence.
  - `node outils/banc-espace/generation-crible.cjs paliers=20,27 n=200 lent=8 sortie=…/lent8.jsonl` puis
    `node outils/banc-espace/generation-lent.cjs …/lent1.jsonl …/lent8.jsonl`.
- **Piste.** Borner les reprises par un COMPTE (déterministe) et non par le temps. Ou mesurer le coût une fois au chargement et en déduire un
  compte fixe pour la partie.

### D2 (faible) — mur et esse au-dessus de la charte de roulis aux paliers rapides
- **Mesure.**
  - Roulis de la dalle jouée > 60 °/s (charte R3 : 60 au pire) au p20 : esse 23 %, mur 18 % des routes qui les jouent. Au p27 : esse 48 %, mur 42 %.
  - Pic 64,6 °/s (esse g112029248 p27 @1505 m), durée cumulée ≤ 0,54 s par route.
  - Jamais au-dessus de 90 °/s.
  - Les autres modules restent sous 57 °/s à ces paliers ; les liaisons et la plongée font 62-66 °/s, comme avant.
- **Origine.** Routes uniques (petits modules neufs). `?sans=uniques` : liaisons à 40 °/s au p20-27 ; avant, seule la plongée y dépassait 60 °/s (43 % au p20).
- **Seuil.** 60 °/s est la charte du projet. À 64 °/s on reste loin d'un roulis qui « s'emballe » : c'est un dépassement de charte, pas un bug visible.
- **Planche.** `generation-p27-g112029248-esse.png`.

### D3 (faible, existait avant) — la crête de la CASCADE sous le rayon tenable au palier 0
- **Mesure.**
  - Rayon vertical 52-60 m, crête dans 27 routes sur 33, contre rayonPalier 63 m. 100 % des routes avec cascade au p0, neuf comme `sans=uniques`.
  - Juste après la crête : pente −72°, Nn·Nn(+0,5 s) = 0,6, Nn.y min 0,14.
  - Au p10 : Rv 98-104 m pour rayonPalier 87 m, sans dépassement.
- **Origine.** Ancienne : même valeur avec `?sans=uniques`.
- **Planche.** `generation-p0-g657647728-cascade.png` (marque magenta @1132 m).

## SOUPÇONS (non prouvés)
- **Lune mal ajustée aux paliers rapides.**
  - Au p20, 3 lunes vues (1 en neuf, 2 en séries forcées) : écart route/sphère 120 / 135 / 177 m. Le rayon cherché (`voyLune` : Rm de 140 à 720 m)
    bute sur 720 : la lune ne colle plus à la route, qui flotte jusqu'à ~100 m au-dessus.
  - La lune n'apparaît que dans ~0,3 % des routes au p20 : rare.
  - Non reproductible à volonté : la route dépend de l'horloge (D1). `?orbcx=lune` ne la force pas au p20 (0 / 45).
- **Une tâche longue pendant le pré-bâti.** Pour l'espace, `genCtrl` tourne d'un trait (`genCtrlG`, ville-entree.js:708).
  - Sur ce Mac en Node, sac vivant : médiane 23-29 ms, p95 41-52 ms, pire 72-151 ms (`generation-temps.cjs`).
  - Sur l'iPhone, plusieurs fois plus long, dans une seule image, pendant la course. Ce n'est pas mesuré sur le téléphone.
- **`?routeverif=1` contre une route bâtie à un autre moment.** À cause de D1, la route de référence bâtie d'un trait peut différer de la route
  pré-bâtie. Il faudrait que l'horloge soit la même pour les deux. Non vérifié en jeu.
- **Peu de modules au p27** : 2,8-3,3 modules par route, et les géants disparaissent dès le p20. C'est voulu (`OU_CX2`), mais le forçage
  `?orbcx=` est sans effet au p20-27 (0 / 45 pour roue, lune, torsade, sret, failleEnvers ; astéroïde 20 / 45 et nébuleuse 18 / 45 au p20).
  Les géants ne sont donc pas vérifiables au p20-27.

## VÉRIFIÉ SANS DÉFAUT
- Même graine deux fois dans un vm neuf : 30 / 30 identiques.
- La course espace p0 → nuages p5 → espace p10 → nuages p15 → espace p20, mémoire déclarée remise à zéro avant la 3e route : 30 / 30 identiques
  à la même route bâtie seule. Aucune mémoire NON déclarée ne fuit (ORB5.prof est remis à chaque genCtrl1, ville-entree.js:412). Sans remise à zéro,
  1 / 30 identique : c'est le sac, voulu.
- Une route des nuages après une route d'espace = la même que seule : 30 / 30.
- Pré-bâti ANNULÉ (`rmPrend`, route fantôme au p10, `rmRemet`, puis la vraie route au p20) = la même histoire sans fantôme : 30 / 30
  (`generation-fantome.cjs`). La photo de route-memoire.js est complète pour la génération.
- Les repères des géants (`nu[].j`) restent sur leurs marques après `pisteTordPropre` (décalage 0 m sur toutes les routes).

## PAS VÉRIFIÉ
- Rien dans Chrome ni en jeu : physique de la caisse (vol, gravité « de côté », collision avec la lune en vol), caméra, pièces, décor réellement
  construit (seule sa géométrie est refaite ici), arrivée par portail réelle (tranches entrelacées avec la course, échange d'état `prebEchange`),
  troisième passage dans une vraie partie.
- Le sac réel de Sacha (localStorage `cashcarRU`, longue histoire) : approché ici par 30 routes de rodage puis 300 de suite.
- Paliers intermédiaires (5, 15, 21-26) et vitesse réelle à 30 i/s (pas de 14,6 m par image au p27) : la génération n'en dépend pas, la physique si.
- Les géants au p20-27, presque absents et non forçables (voir soupçons).
- Le décor de la nébuleuse, toujours posé, n'est pas mesuré géométriquement.

## Planches (dessus · profil avec les modules en bandes · roulis en blanc, lignes grises 60 / 90 / 120 °/s · Nn.y en cyan)
- `generation-p0-g657647728-cascade.png` : la crête de la cascade (D3).
- `generation-p27-g112029248-esse.png` : l'esse à 64,6 °/s (D2).
- `generation-p10-g829320219-liaison-plongee.png` : le pire roulis de liaison au p10, 66,4 °/s @8510 m, avant la plongée.
Commande : `node outils/banc-espace/generation-planche.cjs <graine> <palier> <sortie.png> '' <s> rang=<rang dans la série>`.
D1 s'applique aussi au rejeu : avec une autre horloge, la route au rang voulu peut changer.
