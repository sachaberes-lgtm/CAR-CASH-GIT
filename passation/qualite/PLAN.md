# QUALITÉ PAR APPAREIL — le plan (14/11, Sacha)

Demande : « l'optimisation est fluide mais les graphismes ne sont pas au maximum, et ça ne change pas selon le téléphone : mon pote en iPhone 15
a la même image que mon 13 Pro. Un iPhone 17/18 doit avoir la version Vercel ; mon 13 Pro la meilleure version possible. Réglages : plus de
MOYENNE, seulement HAUTE (le mieux que le téléphone sait afficher, quelques accrocs acceptés) et BASSE (fluidité optimale). Priorité fluidité,
puis qualité max. On ne touche pas aux maps. Travaille la voiture et les traînées de lumière (floues). »

Chantier : `~/cash-car/qualite`, branche `qualite-appareil` (partie de main v1596). Carte de l'existant : `passation/qualite/carte/*.md` (8 rapports).
INTERDIT : `code/maps/*` (autre session). L'ORDINATEUR (Vercel, `!TEL_NATIF`) ne change PAS d'un pixel. iOS d'abord.

## Cause
`PAL` range tout iPhone ≥ 12 au palier 2, et sur tout palier 2 `TEL_NATIF` les mêmes leviers a-f, i (DPR 1,25, halo ½ 3 étages, ombre 768,
ciel 1/2, traînées ½), la cadence 30 dès le départ et le même gouverneur. HAUTE = même plafond que NETTE.

## Le PROFIL (`PRF`) — un axe à part, PAL.n ne bouge pas (jamais de palier 3 : les tables PAL.B ont 3 colonnes)
Calculé dans `rendu/soleil-planete.js` juste avant `POSTE` (le modèle `window.__ccAppareil` et la sauvegarde brute y sont lisibles), seulement si
`TEL_NATIF`. `ALLEGE` reste « tourne sur téléphone » (ne PAS le basculer : il porte ~20 optimisations sans perte).

**Classe `PRF.c`** (plafond matériel, par modèle) :
| c | nom | modèles | puces |
|---|---|---|---|
| 0 | hors profil | ordinateur, paliers 0-1, iPhone sans modèle connu (Safari) | — : RIEN ne change |
| 1 | RÉCENT | iPhone13,x · iPhone14,x (12, 13, 13 Pro, 14, SE 3) | A14, A15 |
| 2 | FORT | iPhone15,x · iPhone16,x (14 Pro, 15, 15 Pro) | A16, A17 Pro |
| 3 | TRÈS FORT | iPhone17,x (16, 16 Pro, 16e) | A18 |
| 4 | MAX | iPhone18,x et tout numéro au-dessus (17, Air, 18…) | A19 et après |
`?classe=1..4` force (banc, CC_QS) ; `?appareil=iPhone17,1` aussi. La classe est rabattue par ce que le JUGE a appris (`localStorage.cashcarProfil`).

**Réglage du joueur** : `SAVE.d.q` ne vaut plus que `'fast'` (affiché BASSE) ou `'haute'` (HAUTE) sur téléphone. `PRF.q` = lu brut au chargement,
puis suivi à chaud.

**Niveau d'image `PRF.n`** = fonction de (classe, réglage) :
| niveau | contenu |
|---|---|
| N1 | l'image d'aujourd'hui (leviers a-f, i ; DPR 1,25 ; loupe) + les traînées nettes et la loupe allongée du lot 3 (intégration 14/11 : Sacha veut la voiture et les traînées parfaites sur son 13 Pro) |
| N2 | DPR 1,5 · halo en pleine résolution · ombre 1024 · ciel lissé à chaque image · traînées/traits pleins à toute vitesse (leviers a, b, d, e éteints) |
| N3 | N2 + DPR 2,0 + l'IMAGE PC statique : ombre 1280 PCFSoft, halo 5 étages, anisotropie 8/4, livrées pleine résolution, photos du ciel 4096, autoroute pleine, vitrine 640, VHD comme l'ordi dans un budget |
| N4 | N3 + pixels réels dans le budget 3,2 Mpx (DPR ≈ 2,7-3) + `mapsSobres()` faux + 60 i/s = la version Vercel |

| classe | BASSE | HAUTE | défaut |
|---|---|---|---|
| 1 | N1 | N2 | BASSE |
| 2 | N2 | N3 | BASSE |
| 3 | N3 | N4 | HAUTE |
| 4 | N3 à 60 i/s | N4 | HAUTE |
Ces chiffres sont un POINT DE DÉPART à caler sur le 13 Pro de Sacha (classe 1 réelle ; les autres classes s'essaient dessus par `?classe=`).
Tout chiffre du profil vit dans UNE table (`PRF.T`) et se surcharge par l'URL pour les essais : `?prfdpr=1.75`, `?prfniv=3`, `?prffps=60`.

**Statique / à chaud.** Ce qui est figé à la construction (type d'ombre, nombre d'étages du halo, textures, anisotropie, livrées, maps) suit la
CLASSE (le plus haut niveau que la classe peut atteindre, soit son niveau HAUTE). Ce qui se règle à chaud (DPR, résolution du halo, taille de
l'ombre, cadence du ciel, densités, cadence d'image) suit le RÉGLAGE : passer de BASSE à HAUTE s'applique tout de suite, sans rechargement.

**HAUTE** : l'échelle QL ne baisse que d'un cran ou deux (accrocs acceptés), le gouverneur de chaleur garde la main à `serious`/`critical`.
**BASSE** : l'échelle QL et le gouverneur d'aujourd'hui, partant du niveau BASSE de la classe.

**API (figée, les lots s'y fient)** — tout dans la portée du grand script :
- `PRF.on` (bool : téléphone profilé, classe ≥ 1) · `PRF.c` (classe effective) · `PRF.c0` (classe du modèle) · `PRF.q` ('fast'|'haute') · `PRF.n` (niveau 1-4 courant) · `PRF.nMax` (niveau HAUTE de la classe, pour le statique) · `PRF.pc` (bool : image PC statique = nMax ≥ 3) · `PRF.fps` (30|60 visé) · `PRF.dpr` (plafond courant) · `PRF.src` (texte).
- `prfRegle(q)` : change le réglage à chaud (appelé par les boutons) ; rend le niveau.
- `PRF.haute()` = `PRF.q==='haute'`.
- Journal : une ligne `profil` dans la boîte noire (`window.__ccNote('profil', …)`) au chargement et à chaque changement, sur téléphone profilé seulement ; `window.dbgPrf()` (intégration 14/11 : `dbgProfil` reste l'écran PROFIL du joueur, voitures/plaque.js).
- Hors profil (`PRF.on` faux) : toutes les valeurs rendent celles d'avant.

## Le JUGE du profil (lot 4, après le lot 1)
En course, états thermiques nominal/fair seulement : si l'image ne tient pas sa cadence visée (p50 > période × 1,15 pendant ≥ 40 % d'une course
≥ 45 s), deux courses de suite → la classe effective baisse d'un cran (`cashcarProfil`, appliquée au lancement suivant ; l'échelle QL protège la
course en cours). Mur de 1, 2, 4, 8 jours avant de réessayer la classe du modèle. Contexte 3D perdu ou page tuée à N3-N4 → baisse immédiate.
Jamais au-dessus de la classe du modèle.

## Les lots
| lot | qui | fichiers (propriété exclusive) |
|---|---|---|
| 1 PROFIL | agent | `rendu/soleil-planete.js`, `rendu/palier-appareil.js`, `rendu/nettete-qualite.js`, `rendu/triptyque-bloom.js` (ombre, étages SEULEMENT), `rendu/ciel2.js`, `rendu/stries-vent.js`, `interface/chute-menu.js`, `economie/livrees.js`, `rendu/autoroute.js`, `rendu/bitume-beton.js`, `interface/vitrine-miniature.js` |
| 2 RÉGLAGES | agent | `sauvegarde.js`, `interface/passe-textes.js`, `moteur/mobile-tactile.js`, `page/ecrans-menus.html`, `css/*` |
| 3 TRAÎNÉES | agent | `voitures/atchoum-feu.js`, `rendu/loupe-caisse.js`, `rendu/triptyque-bloom.js` (flou radial / NET_NITRO SEULEMENT), un nouveau morceau `rendu/rubans-nets.js` |
| 4 CADENCE + JUGE | agent, après fusion du lot 1 | `moteur/cadence.js`, `moteur/gouverneur-*.js`, `moteur/mobh-*.js`, nouveau `moteur/profil-juge.js` |
| 5 BANC + PHOTOS | agent | `outils/banc-qualite/` |

Règles des agents : un worktree par agent (`~/cash-car/qualite-<lot>`, branche `qa/<lot>` partie de `qualite-appareil`) ; committer `code/`
SANS `VERSION PRINCIPALE/index.html` ni `sw.js` (l'intégrateur réassemble par `node code/assembler.cjs --depuis-morceaux`) ; ne committer que
du vérifié (un crochet pousse chaque commit sur origin) ; chaque nouveauté a son interrupteur `?sans=…` ; rapport `passation/qualite/<LOT>.md` ;
un seul Chrome de banc par agent, fermé à la fin (`~/cash-car/verrou-banc.sh`) ; jamais de son ; jamais le simulateur iOS ; pas de build.
