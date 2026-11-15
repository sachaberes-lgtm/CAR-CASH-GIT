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

**Classe `PRF.c` et FAMILLE `PRF.fam`** (plafond matériel, par modèle EXACT — 15/11 : `prfFam`, rendu/soleil-planete.js) :
| c | nom | famille | modèles | puce |
|---|---|---|---|---|
| 0 | hors profil | — | ordinateur, paliers 0-1, iPhone sans modèle connu (Safari), iPhone ≤ 12,x | — : RIEN ne change |
| 1 | RÉCENT | A | iPhone13,x (12, 12 mini, 12 Pro, 12 Pro Max) · iPhone14,4 / 14,5 / 14,6 (13 mini, 13, SE 3) | A14 · A15 à 4 cœurs GPU |
| 1 | RÉCENT | B | iPhone14,2 / 14,3 / 14,7 / 14,8 (13 Pro, 13 Pro Max, 14, 14 Plus) | A15 à 5 cœurs GPU (le téléphone MESURÉ) |
| 2 | FORT | C | iPhone15,x (14 Pro, 15, 15 Plus) · **iPhone17,5 (16e : A18 à 4 cœurs GPU)** | A16 |
| 2 | FORT | D | iPhone16,x (15 Pro, 15 Pro Max) | A17 Pro |
| 3 | TRÈS FORT | E | iPhone17,x sauf 17,5 (16, 16 Plus, 16 Pro, 16 Pro Max) | A18 / A18 Pro |
| 4 | MAX | F | iPhone18,x et tout numéro au-dessus (17, Air, 17 Pro…) | A19 et après |
`?classe=1..4` force (banc, CC_QS ; la famille devient celle de la classe : 1 B · 2 C · 3 E · 4 F) ; `?famille=A..F` force la famille ; `?appareil=iPhone17,1` simule le modèle (jugé comme un vrai).
Le JUGE n'abaisse plus la classe : il pose un PLAFOND DE NIVEAU (`localStorage.cashcarProfil`). `?sans=familles` = la classe par le premier numéro et les DPR fixes d'avant.

**Réglage du joueur** : `SAVE.d.q` ne vaut plus que `'fast'` (affiché BASSE) ou `'haute'` (HAUTE) sur téléphone. `PRF.q` = lu brut au chargement,
puis suivi à chaud.

**MESURÉ (13 Pro de Sacha, branché, économie d'énergie, 30 i/s visés, budget 33 ms)** : N1 (DPR 1,25 · 0,51 Mpx) 15-16 ms ; N2 (1,5 · 0,74 Mpx) 18-21 ms, tient 9 min
à serious ; N3 (2,0 · 1,32 Mpx, statique PC) 29 ms puis critical en 3 min ; N4 (3,0) critical, 20 i/s. Ce qui tient, c'est une PART DU BUDGET (≈ 55-64 %), pas un DPR.

**Niveau d'image `PRF.n`** = fonction de (classe, réglage) ; le CONTENU d'un niveau est le même pour toutes les familles, seule la RÉSOLUTION suit la famille :
| niveau | contenu |
|---|---|
| N1 | l'image d'aujourd'hui (leviers a-f, i ; DPR 1,25 sur un 13 Pro ; loupe) + les traînées nettes et la loupe allongée du lot 3 |
| N2 | halo en pleine résolution à 4 étages · ombre 1280 · ciel lissé à chaque image · traînées/traits pleins à toute vitesse (leviers a, b, d, e éteints) |
| N3 | N2 + l'IMAGE PC statique : ombre 1280 PCFSoft, halo 5 étages, anisotropie 8/4, livrées pleine résolution, photos du ciel 4096, autoroute pleine, vitrine 640, VHD comme l'ordi dans un budget |
| N4 | N3 + `mapsSobres()` faux (« la version Vercel » en image) — à 30 i/s, le 60 se mérite |

**LE BUDGET DE PIXELS DE SCÈNE (15/11, `PRF.T.px`, Mpx)** — remplace le DPR fixe : `prfDprDe` le convertit en DPR pour l'écran réel (arrondi à 0,05 ; jamais au-dessus des pixels
de l'écran, jamais sous le plancher du niveau : N1 1 · N2 1,25 · N3 1,5 · N4 2). Un Pro Max ne calcule plus 20 % de pixels de plus qu'un 13 Pro à niveau égal.
| famille | N1 | N2 | N3 | N4 |
|---|---|---|---|---|
| A (A14, A15 4 cœurs) | **0,45** | **0,55** | 0,74 r | 0,9 r |
| B (A15 5 cœurs : 13 Pro) | **0,51** (= 1,25 sur 390×844, MESURÉ) | **0,74** (= 1,5, MESURÉ) | 1,32 r (= 2,0, le N3 mesuré) | 2,0 r |
| C (A16, 16e) | 0,51 r | **0,90** | **1,05** | 1,32 r |
| D (A17 Pro) | 0,51 r | **1,0** | **1,25** | 1,6 r |
| E (A18) | 0,51 r | 1,0 r | **1,32** | **2,0** |
| F (A19+) | 0,51 r | 1,2 r | **1,6** | **2,6** |
En gras : la table du pilote ; « r » : un REPLI (un niveau que la famille n'atteint que forcée, plafonnée par le juge ou la séance brûlante). ⚠ Hors B N1-N2, ce sont des ESTIMATIONS
(écarts de puce publics) que le juge et le juge de chaleur corrigent. N1 : le budget ne joue que si le levier c est actif (`?img=max` garde sa NETTE 1,5).
Exemples (banc, course) : 13 Pro BASSE 1055×487 (identique à avant) ; 13 Pro Max BASSE DPR 1,15 au lieu de 1,25 ; 15 BASSE DPR 1,65 au lieu de 1,5 ; 16 Pro HAUTE DPR 2,4 au lieu de 3 — voir `passation/qualite/profils2.md`.

| classe | BASSE | HAUTE | défaut |
|---|---|---|---|
| 1 | N1 | N2 | BASSE |
| 2 | N2 | N3 | BASSE |
| 3 | N3 | N4 | **BASSE** (15/11 ; HAUTE avant) |
| 4 | N3 | N4 | HAUTE (N4 à 30 = « la version Vercel » en image) |
Toutes les classes partent à **30 i/s** (15/11) ; le 60 se MÉRITE (ci-dessous).
Tout chiffre du profil vit dans UNE table (`PRF.T`) et se surcharge par l'URL pour les essais : `?prfpx=0.9` (budget en Mpx, tous niveaux), `?famille=C`, `?prfdpr=1.75`, `?prfniv=3`, `?prffps=60`.

**LE 60 SE MÉRITE (15/11, moteur/profil-juge.js)** — à 60 i/s une course du 13 Pro passe de nominal à serious en ~61 s (contre ~257 s à 30) ; 60 à pleine résolution est hors de portée probable
d'un A18, incertain sur A19. Familles E et F seulement (classes 3-4 du MODÈLE ; le 16e en est exclu ; jamais sous `?classe=` ni un paramètre d'essai) :
- CANDIDAT : une course entière (≥ 60 s jugées, aucune seconde à serious+ ni en économie d'énergie, réglage inchangé, pas lente) dont le TRAVAIL d'une image (`CAD.w`, le processeur) a une
  médiane < 11 ms. C'est la seule mesure fiable calée sur 30 sans réarmer de sonde : l'intervalle `QLR.p50` y est ramené à une image d'écran, la sonde `QLR.vrai` ne parle que si l'échelle la
  réveille. Le travail ne dit rien de la puce graphique, d'où :
- L'ESSAI : la course suivante (`cashcarProfil.e60`) part à 60 ; après 3 s, 10 s au calme : l'intervalle médian vrai ≤ 17,5 ms pendant 80 % d'entre elles et aucun calage réactif → **DÉBLOQUÉ**
  (`f60 = {n}` : jusqu'à ce niveau ; un niveau plus haut se mérite à son tour). Raté → retour à 30 tout de suite, mur de 1, 2, 4, 8 jours (`m60`). Interrompu (chaleur, économie) → rien, il attend.
- LE RETRAIT : deux courses lentes à 60 (le juge ordinaire) en 48 h → retour à 30 tout de suite, avec le mur ; une course tenue à 60 efface le compteur. Le 60 est rendu AVANT tout plafond de niveau.
- `fair60` = 0 : après un serious, le 60 ne revient qu'au retour à nominal. `?sans=merite60` = la cadence d'avant (N4 et classe 4 à 60 d'office, classe 3 en HAUTE, fair60 = 1).

**Statique / à chaud.** Ce qui est figé à la construction (type d'ombre, nombre d'étages du halo, textures, anisotropie, livrées, maps) suit la
CLASSE (le plus haut niveau que la classe peut atteindre, soit son niveau HAUTE). Ce qui se règle à chaud (DPR, résolution du halo, taille de
l'ombre, cadence du ciel, densités, cadence d'image) suit le RÉGLAGE : passer de BASSE à HAUTE s'applique tout de suite, sans rechargement.

**HAUTE** : l'échelle QL ne baisse que d'un cran ou deux (accrocs acceptés), le gouverneur de chaleur garde la main à `serious`/`critical` — sauf l'IMAGE LOURDE à serious (lot chaleur).
**BASSE** : l'échelle QL et le gouverneur d'aujourd'hui, partant du niveau BASSE de la classe.

**LE GOUVERNEUR DE CHALEUR DOUX (lot doux, 14/11 ; recalé 15/11)** — téléphone profilé, avec le capteur d'iOS : nominal et fair (un étage de halo, un cran d'ombre, plancher QL 2) ne touchent
jamais la résolution ; serious garde le halo (½, un étage de moins), l'ombre un cran plus bas, le ciel 1/4, et :
- N1 et N2 gardent leur résolution à serious (mesuré : le N2 tient 9 min à serious) ;
- **N3 × 0,75 et N4 × 0,7 à serious** (15/11, `PRF.T.n[n].dkDoux`, `?sans=douxn3`) : DPR 2 → 1,5 sur un 13 Pro = les pixels du N2 avec la statique du N3 ; le N3 à 29 ms menait à critical en
  172 s. Gain estimé : 21-24 ms au lieu de 29 (à mesurer) ;
- critical : 80 % du plafond (N3 / N4 : le plus bas de 0,8 et de dkDoux), 20 i/s.
L'échelle QL décide sur la MESURE (un cran à la fois, la toile au plus toutes les 10 s, remontée après 20 s tenues). Détail : `passation/qualite/doux.md`.

**LE JUGE DE CHALEUR (lot chaleur, 14/11)** — une course qui passe de serious (ou moins) à critical à N2+ : le niveau baisse d'un cran pour la séance ; deux séances brûlantes en 7 jours (trois
branchées) → plafond un cran plus bas, avec le mur. Détail : `passation/qualite/chaleur.md`.

**API (figée, les lots s'y fient)** — tout dans la portée du grand script :
- `PRF.on` (bool : téléphone profilé, classe ≥ 1) · `PRF.c` (classe du modèle, ou forcée par `?classe=` ; le juge ne la touche plus) · `PRF.c0` (classe du modèle) · `PRF.plaf` / `PRF.plafFps` (le plafond de niveau appris par le juge, et sa cadence : 30 ou 0) · `PRF.q` ('fast'|'haute') · `PRF.n` (niveau 1-4 courant) · `PRF.nMax` (niveau HAUTE de la classe, pour le statique) · `PRF.pc` (bool : image PC statique = nMax ≥ 3) · `PRF.fps` (30|60 visé) · `PRF.dpr` (plafond courant) · `PRF.src` (texte).
- `prfRegle(q)` : change le réglage à chaud (appelé par les boutons) ; rend le niveau.
- `PRF.haute()` = `PRF.q==='haute'`.
- Journal : une ligne `profil` dans la boîte noire (`window.__ccNote('profil', …)`) au chargement et à chaque changement, sur téléphone profilé seulement ; `window.dbgPrf()` (intégration 14/11 : `dbgProfil` reste l'écran PROFIL du joueur, voitures/plaque.js).
- Hors profil (`PRF.on` faux) : toutes les valeurs rendent celles d'avant.

## Le JUGE du profil (lot 4, après le lot 1)
En course, états thermiques nominal/fair seulement : si l'image ne tient pas sa cadence visée (p50 > période × 1,15 pendant ≥ 40 % d'une course
≥ 45 s), deux courses de suite → un PLAFOND DE NIVEAU descend d'un cran (lot juge, 14/11 : la classe ne bouge plus ; crans N4 → N3 → N3 à 30 → N2 → N1,
`cashcarProfil` v2 `plaf`/`pf`, appliqué au lancement suivant ; l'échelle QL protège la course en cours). Mur de 1, 2, 4, 8 jours, puis on retente UN cran
au-dessus du plafond. Deux pertes du contexte 3D en 2 min, ou une page tuée en course, à partir de N2 → un cran sous le statique (ou le niveau).
Jamais au-dessus de l'ancien plafond ni du niveau du modèle. Détail : `passation/qualite/juge.md`.
- **Page tuée en course (15/11)** : UNE seule ne baisse plus rien (batterie vide, redémarrage forcé, Xcode ▶/■ sur le téléphone de dev) ; il en faut DEUX en 7 jours (`cashcarProfil.tv`,
  `?sans=temoin2` = un seul). ⚠ Deux arrêts Xcode en pleine course dans la même semaine rabattent encore d'un cran (le mur le rend après 1 jour).
- **Le miroir natif (15/11)** : `cashcarProfil` est doublé dans Capacitor Preferences (clé `cashcarProfil`, jamais dans SAVE.d : il circulerait dans les codes d'export et vers un autre iPhone).
  Après une purge de la vue web il est rendu à localStorage au lancement, et appliqué au lancement SUIVANT (lecture asynchrone). `?sans=prfmiroir` = sans. Le témoin en vol n'est pas doublé.
- Stockage refusé : un plafond non écrit n'est plus annoncé comme écrit, et le juge peut rejuger (relecture n5).

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
