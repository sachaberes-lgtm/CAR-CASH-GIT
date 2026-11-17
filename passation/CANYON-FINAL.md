# CANYON — LA VERSION FINALE (2026-11-17) : journal

Demande de Sacha (17/11) : « Il y a encore des bugs de génération dans la map Canyon. […] gérer les problèmes de génération, les bugs visuels sur les parois,
retravailler les graphismes de la map et faire tout ça en respectant l'optimisation. […] les couleurs et le rendu général. Faire la version finale du Canyon. »

Branche `canyon-final` (worktree `~/cash-car/canyon-final`), partie d'`origin/main` 492ac0970 (v1616). **Rien sur `main`, aucun build installé.**
iOS seulement : tout est mesuré en `?tel=1`, formats 844×390 (paysage) et 390×844 (portrait), ×2.

## Les bancs de cette passe (`outils/banc-routes/canyon-final/`)
| banc | ce qu'il fait | Chrome |
|---|---|---|
| `pilote.mjs <scénario>` | le vrai jeu sans fenêtre (CDP, muet), format iPhone ; prend et rend le verrou commun lui-même | oui |
| `lot.mjs` + `audit-page.js` | **le test de génération** : par graine, la collision du vol (`dbgCanyon('heurt')`) dans le couloir de conduite, à l'œil du joueur, sur chaque pièce ; les décors dans le couloir (`dbgCanyonAudit`) ; les raccords de la dalle ; les murs ; les lames ; les ouvrages. Code de sortie 1 au moindre défaut | oui |
| `devers-ouvrages.cjs` | le roulis de la dalle dans chaque ouvrage bâti d'aplomb (galerie, pont, mine, tunnel d'arrivée) | non (Node) |
| `pas-courts.cjs` | les points de contrôle presque confondus et la cassure qu'ils font | non (Node) |
| `course.mjs` | la course pas à pas (30 i/s exactes, `dbgStep`) : morts, décor qui apparaît d'un coup, appels et triangles à chaque image | oui |
| `cout.mjs` | appels de dessin et triangles sur 12 vues fixes, mémoire du renderer, pièces du canyon | oui |
| `photos.mjs`, `pistes.mjs`, `essai.mjs`, `atelier.mjs` | photos aux mêmes points de vue ; pistes de couleurs posées à chaud ; un Chrome gardé ouvert pour régler | oui |

Crochets ajoutés au jeu (lecture seule) : `dbgCanyon('h', x, z)`, `dbgCanyon('heurt', x, y, z)`, `dbgCanyon('objets')`. `dbgCanyonAudit()` plantait depuis le 15/11
(le tube libère sa copie JS après l'envoi au GPU) : il saute maintenant ce maillage.

⚠ Le verrou des bancs est très disputé (4 à 5 sessions en file le 17/11) : une prise de verrou = 10 à 25 min d'attente. Tout ce qui peut se mesurer en Node l'est.

## Volet 1 — bugs de génération

État de départ (lot de 40 graines, matin, `?tel=1`, origin/main) : **40 graines sur 40 en défaut.**

### G1 — Les ouvrages d'aplomb sous une dalle penchée (40/40) — CORRIGÉ (`?sans=cyplat`)
- **Constat** : depuis « le dévers partout » de la V3 (13/11), la dalle penche dans chaque virage. Or la galerie, la mine, le pont naturel et le tunnel d'arrivée sont
  bâtis d'aplomb. `devers-ouvrages.cjs`, 40 graines : roulis de la dalle **21 à 28°** dans le tunnel d'arrivée (40/40), la galerie (10/10) et la mine (4/4),
  **60 à 62°** au bout du pont (8/8 : la rampe du dévers de la corniche suivante).
- **Dans le jeu** : 28 à 35 sommets du tunnel d'arrivée dans le couloir de conduite sur CHAQUE graine ; 105 à 132 sommets de la galerie (graines 6, 13, 18, 24, 26, 30, 32, 40)
  dont 3 à 6 dans le bitume ; ~1000 sommets de la mine dans le couloir et ~160 dans le bitume, les rails déportés de 24 m (graines 25, 36, 37) ; la culée du pont
  (graines 1, 7, 12, 22, 28, 31, 33). La collision du vol touchait le bord de route sur 19 à 83 points (galerie, pont).
- **Correctif** : `cyPlatOuvrages` (canyon-murs.js) ajoute un gabarit `plat` par ouvrage avant `cyMurPose` (le masque lissé existant, avant la borne de vitesse du roulis) ;
  rampe 150 m, 340 m autour du pont (sinon la borne de roulis fait refluer le dévers de la corniche sur le pont : 35° à 150 m, 9° à 260 m, 0° à 340 m).
- **Après** : 0,0° dans les quatre ouvrages sur 60 graines ; dans le jeu, 0 point de collision dans le couloir sur 40 graines.
- **Prix** (canyon-charte.cjs, 40 routes × 3 paliers) : à plat 42,5 → 46,5 % (cible 35-55 %), > 60° 21,0 → 20,7 % (≥ 15 %), envers inchangé (min 6,4 %) ;
  **le plus long passage à plat monte de 8 s à 12-14 s** sur les routes à galerie (elle fait ~800 m). Voir « À dire à Sacha ».
- Photos : `photos/gen-galerie-g6-…`, `gen-tunnel-arrivee-g3-…`, `gen-mine-g25-…`, `gen-pont-g1-…` (avant | après, paysage et portrait).
- Test : `node outils/banc-routes/canyon-final/devers-ouvrages.cjs` (Node) et `lot.mjs` (jeu).

### G2 — La dalle qui casse avant la finale (3 routes sur 120) — CORRIGÉ (`?sans=cycourt`)
- **Constat** : graines 25 et 40 (palier 0), 8 (palier 10) : à 351 m de l'arrivée la dalle plie de 5°/m (le reste du canyon : ≤ 1,3°/m). Cause : `large()` pose le reste
  d'un arc comme une droite, même de 2 m → deux points de contrôle à 2 m l'un de l'autre, juste avant la plongée à −75 % de la finale ; la spline y plie de 15°.
- **Correctif** : un reste de moins de 12 m n'est pas posé (canyon-route.js, `CY_COURT`). Aucun tirage ne change (une droite ne tire rien).
- **Après** : `pas-courts.cjs` 120 canyons : 0 pas sous 8 m (4 avant), 0 cassure ; dans le jeu, 0 raccord en défaut sur 40 graines.
- Photos : `photos/gen-cassure-finale-g25-…`. Test : `node outils/banc-routes/canyon-final/pas-courts.cjs`.

## Volet 2 — bugs visuels des parois
(en cours)

## Volet 3 — couleurs et rendu
(en cours — pistes dans `passation/canyon-final/pistes.json`, posées à chaud par `pistes.mjs`)

## Coût avant / après
(en cours)

## À dire à Sacha
- La galerie, la mine et le tunnel d'arrivée se roulent maintenant à plat (c'était la cause des piliers dans la route). Sur une route à galerie cela fait un passage
  de 12 à 14 s sans dévers. L'autre solution — pencher l'ouvrage avec la route — est possible mais c'est un chantier (géométrie et collision) : à faire si le plat gêne.
