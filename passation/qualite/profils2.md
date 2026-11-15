# LOT PROFILS2 — la table des profils recalée sur la mesure : rapport (15/11)

Branche `qa/profils2` (partie de `qualite-appareil` 72266acc7), worktree `~/cash-car/qualite-profils2`. `VERSION PRINCIPALE/index.html` et `sw.js` ne sont PAS commités
(l'intégrateur : `node code/assembler.cjs --depuis-morceaux`). Demande : « aller au maximum du couple fluidité / qualité », décisions (1) à (5) du pilote.

Fichiers touchés :
- `code/rendu/soleil-planete.js` (bloc PRF) : section « LA TABLE DES PROFILS RECALÉE SUR LA MESURE » ; `T.px`, `T.n[n].pxMin`, `T.n[3|4].dkDoux`, `T.c` (classe 3 en BASSE, plus de `fpsFast`), `T.fair60 = 0`,
  `T.n[4].fps = 30` ; `prfFam`, `prfClasseFam` ; la classe par famille (16e en classe 2) ; `?famille=`, `?prfpx=`, `?sans=familles|merite60|temoin2` ; le témoin à deux pages tuées ; la lecture de `f60` / `e60` / `m60` ;
  `prfFpsT(…, G)` (le 60 mérité ou à l'essai).
- `code/rendu/palier-appareil.js` : `prfDprDe` (le budget de pixels de la famille → DPR), `prfDprPx` ; `prfNote` dit la famille, le 60 et les Mpx.
- `code/moteur/gouverneur-paliers.js` : section « N3 ET N4 RENDENT DE LA RÉSOLUTION À SERIOUS » (`GDX_N3`, `gdxDkDoux`), une ligne dans la branche doux de `mobPalVoulu`.
- `code/moteur/profil-juge.js` : section « LE 60 SE MÉRITE » (`pjg60Fin`, `pjg60Essai`, `pjg60Ok`, `pjg60Fps`, `pjgL6`, `pjgMed`, `PJG.wA`, `PJG.e6`, `?juge60w=`) ; section « LE PLAFOND DANS LE
  MIROIR NATIF » (`pjgMiroir`, `pjgMiroirLit`, `?sans=prfmiroir`, `dbgJuge('miroir')`) ; relecture n5, n7, n8 ; `dbgJuge().soixante`, `.miroir`.
- `code/moteur/cadence.js` : relecture n10 (une ligne dans `cadFin`).
- `code/rendu/nettete-qualite.js` (le strict nécessaire) : relecture n9 (une ligne dans `qlDoux`) ; `dbgPrf()` : `famille`, `budgetPx`, `scenePx`, `soixante`, `temoin`, `force.px`.
- `code/moteur/gouverneur-thermique.js` : deux commentaires (la cadence suit le 60 mérité ; fair60 = 0). Aucun code.
- `outils/banc-juge/` : `table.cjs` (nouveau : la table au banc, un écran par modèle), `photos.cjs` (nouveau : copie de `banc-qualite/niveaux.cjs` avec `--ecran` et `--mi`), `juge.cjs` (`--ecran`).
- `passation/qualite/PLAN.md` (table, 60 mérité, gouverneur doux, juge de chaleur, témoin, miroir), ce rapport, `passation/qualite/photos/profils2/`.

Banc : Chrome sans fenêtre et MUET (sfx, mus, vox coupés dans `cashcarSave`), iPhone émulé DPR 3 tactile, UA iPhone, `?appareil=` (TEL_NATIF vrai : `dbgPrf().on` vrai, `imgTel` vrai),
ports 9821/9822, un seul Chrome à moi, fermé à la fin de chaque passage. Au plus 3 Chrome sur le Mac : `pgrep -f remote-debugging-port` compte aussi les processus de rendu de chaque Chrome
(4 lignes par Chrome) — j'ai compté les Chrome eux-mêmes (`MacOS/Google Chrome --`) et attendu tant qu'il y en avait 3. « AVANT » = les morceaux de `qualite-appareil` (72266acc7) réassemblés à part.
Après chaque modif : `node code/assembler.cjs --depuis-morceaux` (330 morceaux d'accord), `node outils/garde-demarrage.cjs` OK, `sh garde-allege.sh` OK. 0 exception, 0 console.error sur tous les passages.

---

## (1) Le budget de pixels par famille de puce (`?sans=familles` = avant)

FAIT. `PRF.T.px[famille][niveau]` en Mpx de scène ; `prfDprDe` rend `DPR = √(px / points CSS)`, arrondi à 0,05, borné par la densité de l'écran et par le plancher du niveau
(N1 1 · N2 1,25 · N3 1,5 · N4 2). La table du pilote, telle quelle (B N1 0,51 et B N2 0,74 tombent pile sur 1,25 et 1,5 sur 390×844 grâce à l'arrondi) ; les cases hors table (un niveau qu'une
famille n'atteint que forcée ou plafonnée) sont des replis notés « r » dans PLAN.md (A N3 0,74 · A N4 0,9 · B N3 1,32 = le N3 mesuré · B N4 2 · C-F N1 0,51 · C N4 1,32 · D N4 1,6 · E N2 1 · F N2 1,2).
N1 : le budget ne joue que si le levier c est actif (`?img=max` garde sa NETTE 1,5). La classe suit la famille (16e = iPhone17,5 → C, classe 2). Ce sont des ESTIMATIONS, dites dans la table.

VÉRIFIÉ (`outils/banc-juge/table.cjs`, course au pilote auto, lecture `dbgPrf()` à 6 s de course ; toile = la toile réelle du rendu) :

| modèle (écran) | réglage | AVANT : classe, niveau, DPR, toile, Mpx, i/s | APRÈS : classe/famille, niveau, DPR, toile, Mpx, i/s |
|---|---|---|---|
| iPhone14,2 13 Pro (844×390) | BASSE | 1, N1, 1,25, **1055×487**, 0,51, 30 | 1/B, N1, 1,25, **1055×487**, 0,51, 30 — IDENTIQUE (ombre 768 PCF, halo ½ 3 étages) |
| iPhone14,2 (390×844 debout) | BASSE | 1, N1, 1,25, 487×1055 | 1/B, N1, 1,25, 487×1055 — identique |
| iPhone14,2 | HAUTE | 1, N2, 1,5, 1266×585, 0,74, 30 | 1/B, N2, 1,5, 1266×585, 0,74, 30 — identique |
| iPhone14,3 13 Pro Max (926×428) | BASSE | 1, N1, 1,25, 1157×535, 0,62 | 1/B, N1, **1,15**, 1064×492, **0,52** |
| iPhone14,3 | HAUTE | 1, N2, 1,5, 1389×642, 0,89 | 1/B, N2, **1,35**, 1250×577, **0,72** |
| iPhone13,2 12 (844×390) | BASSE | 1, N1, 1,25, 1055×487, 0,51 | 1/A, N1, 1,25, 1055×487, 0,51 — IDENTIQUE (tour 2, arbitrage (a) ; avant le tour 2 : 1,15) |
| iPhone14,5 13 (844×390) | HAUTE | 1, N2, 1,5, 1266×585, 0,74 | 1/A, N2, **1,3**, 1097×507, 0,56 |
| iPhone15,4 15 (852×393) | BASSE | 2, N2, 1,5, 1278×589, 0,75 | 2/C, N2, 1,5, 1278×589, 0,75 — IDENTIQUE (tour 2, arbitrage (b) ; avant le tour 2 : 1,65) |
| iPhone15,4 | HAUTE | 2, N3, 2,0, 1704×786, 1,34 | 2/C, N3, **1,75**, 1491×687, 1,02 |
| iPhone16,1 15 Pro (852×393) | HAUTE | 2, N3, 2,0, 1704×786, 1,34 | 2/D, N3, 1,95, 1661×766, 1,27 |
| iPhone17,1 16 Pro (874×402) | BASSE | 3, N3, 2,0, 1748×804, 1,41, 30 | 3/E, N3, 1,95, 1704×783, 1,33, 30 |
| iPhone17,1 | HAUTE | 3, N4, 3,0, 2622×1206, 3,16, **60** | 3/E, N4, **2,4**, 2097×964, **2,02**, **30** |
| iPhone17,5 16e (844×390) | défaut | **3**, N4 HAUTE, 3,0, 2532×1170, 2,96, **60** | **2/C**, N2 BASSE, 1,5 (tour 2 : borné au DPR d'avant ; 1,65 au tour 1), 30 |
| iPhone17,5 | HAUTE | 3, N4, 3,0, 2,96 Mpx, 60 | 2/C, N3, 1,8, 1519×702, 1,07, 30 |
| iPhone18,1 17 Pro (874×402) | BASSE | 4, N3, 2,0, 1,41, **60** | 4/F, N3, 2,0 (tour 2 : borné au DPR d'avant ; 2,15 au tour 1), **30** |
| iPhone18,1 | HAUTE / défaut | 4, N4, 3,0, 3,16 Mpx, 60 | 4/F, N4, **2,7**, 2359×1085, 2,56, 30 (défaut HAUTE gardé) |
| iPhone12,1 11 (hors profil) | défaut | 0, toile 896×414, ombre 1024 PCF, halo 4 | identique (`PRF.on` faux) |
| iPhone14,2 `?sans=profil` | BASSE | 0, toile 844×390, ombre 768 | identique |

L'ORDINATEUR : `--pc 1` (aucune émulation) donne `PRF.src = 'ordinateur'`, `on` faux dans les deux versions. Un premier passage montrait ombre 1024 / halo 4 / maps sobres APRÈS et 1280 / 5 / pleines AVANT :
c'est le RÉGIME DU POSTE (le petit banc du processeur au premier chargement, sur un Mac saturé), pas ce lot. Repassé avec le régime fixé (`?poste=3`, MAX) : AVANT et APRÈS identiques champ par champ
(toile 844×303 DPR 1, ombre 1280 PCFSoft, halo 5 étages, maps pleines, 30 i/s visés au menu-course du banc, `PRF.on` faux, 0 exception).

NON vérifié : le coût réel de chaque budget sur une puce autre que l'A15 à 5 cœurs (tout ce qui n'est pas B N1-N2 est estimé) ; la chaleur.

## (2) Le 60 se mérite (`?sans=merite60` = la cadence d'avant)

FAIT. Toutes les classes partent à 30 (N4 compris, plus de `fpsFast`). Défauts : classes 1-2-3 BASSE, classe 4 HAUTE. Familles E et F (classes 3-4 du MODÈLE ; jamais sous `?classe=`, `?prfniv=`, `?prffps=`) :
- **la mesure** : `CAD.w`, le TRAVAIL d'une image (processeur, de `QLR.t0` en tête de `loop` jusqu'à `cadFin`, lissé sur ~10 images), une fois par seconde jugée. C'est la seule mesure fiable calée sur 30 sans
  réarmer de sonde : `QLR.p50` y est l'intervalle RAMENÉ à une image d'écran (16,7 ms dès que l'image tient ses 33 ms, quel que soit son vrai coût) et `QLR.vrai` ne parle que si l'échelle réveille la
  sonde (images ratées) ou dans un build de mesure. Le travail ne dit rien de la puce graphique — d'où l'essai ;
- **candidat** : une course ≥ 60 s jugées, aucune seconde à serious+ ni en économie d'énergie, réglage inchangé, pas lente, travail médian < 11 ms → `cashcarProfil.e60 = {n, t, w}` ; la cadence passe à 60 tout
  de suite (hors course : les menus restent à 30, l'essai est la course suivante, même séance ou lancement suivant). Un téléphone E-F non candidat note « pas candidat au 60 : travail médian X ms » ;
- **l'essai** : la course part à 60 ; après 3 s, 10 secondes au calme : l'intervalle médian VRAI (non calé) ≤ 16,7 × 1,05 ms pendant 80 % d'entre elles, aucun calage réactif → `f60 = {n}` (débloqué jusqu'à ce
  niveau). Raté → 30 tout de suite, `m60` = mur 1, 2, 4, 8 j. Interrompu (serious, retenue, économie) → rien, il attend le lancement suivant ;
- **le retrait** : deux courses lentes à 60 (le juge ordinaire contre 16,7 ms) en 48 h → `f60` retiré, 30 tout de suite, mur. Le 60 est rendu AVANT tout plafond de niveau (la course n'est pas jugée pour le niveau) ;
- **fair60 = 0** : après un serious, 60 seulement au retour à nominal (la retenue `MOB_S.actif`).

VÉRIFIÉ (`outils/banc-juge/juge.cjs --ecran 874x402`, `?jugeech=0.25` : candidat 15 s, essai 0,75 s + 3 s) :
| scénario | résultat |
|---|---|
| iPhone17,1 BASSE, course de 30 s (`juge60w=5`) | « candidat au 60 i/s (N3, travail médian 5,0 ms sur 25 s) » ; `e60 {n:3}` ; cadence 30 → 60 |
| course suivante | « essai du 60 i/s : la course part à 60 » → « 60 i/s DÉBLOQUÉ (N3) : 3/3 s tenues, intervalle médian 16,7 ms » ; `f60 {n:3}` |
| relancé | `src` « 60 i/s mérité (jusqu'au N3) », `fps` 60 d'emblée |
| `dbgGouvLent(45)` (téléphone lent), 1re course | « course à 60 non tenue 1/2 (N3) » (`l6` = 1), plafond de niveau intact |
| 2e course (passage 1) | 22 s sur 24 comptées « calées par la chaleur » : sans capteur, la DOSE du banc avait dépassé son seuil (retenue) → non jugées, comme voulu. Repassé avec `dbgGouv(0)` : voir « retrait » plus bas |
| iPhone18,1, candidat puis `dbgGouvLent(45)` à l'essai | « essai du 60 raté (N3) : calé sur 30 par la cadence réactive après 2 s · retour à 30, nouvel essai dans 1 j » ; `m60 {n:1, j:1}` ; cadence 60 → 30 |
| iPhone17,1 SANS `juge60w` | le vrai travail du Chrome du banc : 4,3 ms → candidat aussi (le banc n'est pas une puce de téléphone : `juge60w` ne sert qu'à figer le chiffre) |
| iPhone17,5 (16e), `juge60w=5` | `soixante.ok` faux : jamais candidat, 30 |

| RETRAIT (passage 2, la dose remise à zéro par `dbgGouv(0)` avant chaque course) : 1re course lente à 60 | « course à 60 non tenue 1/2 (N3) » |
| 2e course lente à 60 | « 60 i/s retiré : deux courses à 60 non tenues (N3) · retour à 30, le 60 se remérite dans 1 j » ; `f60` null, `m60 {n:1, j:1}` ; cadence 30 ; plafond de niveau intact (4) |
| relancé | 30 i/s, pas d'essai (mur du 60) |

NON vérifié : que 11 ms de travail soit le bon seuil sur un vrai A18/A19 (aucun vrai chiffre de `CAD.w` d'iPhone récent n'existe ici ; le 13 Pro a 4-6 ms de JS par image d'après les vols — le seuil
laisse donc presque toujours passer à l'ESSAI, qui est le vrai juge) ; la tenue d'un essai de 10 s sur un vrai écran 120 Hz.

## (3) À serious, N3 × 0,75 et N4 × 0,7 (`?sans=douxn3` = avant)

FAIT. Branche doux de `mobPalVoulu` : avec le capteur, aux paliers serious, serious qui dure et critical, si le niveau est N3 ou N4, le plafond × `min(dk du palier, dkDoux)` (N3 0,75, N4 0,7 ;
critical : le plus bas de 0,8 et dkDoux). N1 et N2 : la règle d'avant au bit près.

VÉRIFIÉ (`juge.cjs --ecran 852x393`, pas `thermo:0,2,3,0:6`, course réelle) :
| | nominal | serious | critical |
|---|---|---|---|
| iPhone15,4 HAUTE (N3) APRÈS | DPR 1,75, toile 1491×687 | **1,31**, 1118×515 (halo ½, 4 étages, ombre 1024) | 1,31 (min 0,8 / 0,75), ombre 512, 2 étages |
| même, `?sans=douxn3` | 1,75 | 1,75 (résolution gardée) | 1,40 (0,8) |
| iPhone14,2 HAUTE (N2) APRÈS | 1,5 | **1,5** (inchangé) | — |
Photo : planche `serious-n3.jpg` (AVANT N3 à serious = DPR 2,0 gardé ; APRÈS = 1,31 : plus doux, voulu).

A MESURER SUR LE 13 PRO (la seule preuve qui compte : le coût et la chaleur).

## (4) Relecture : n4, n5, n7, n8, n9, n10

- **n4 (miroir natif)** FAIT : `verdict.correction_precise` relu — il déconseille SAVE.d (export/import, autre iPhone) et propose Preferences. Choisi : Preferences, clé `cashcarProfil`, écrit après chaque
  écriture DURABLE (`pjgPose`, `pjgBaisse`, `pjgDepart`), jamais le témoin en vol ; relu au lancement si localStorage n'en a pas (même modèle) → appliqué au lancement SUIVANT. Rien hors de l'app.
  VÉRIFIÉ au banc avec un faux `Capacitor.Plugins.Preferences` (iPhone18,1 HAUTE, `jugelent=45`) : après une course lente, le faux Preferences contient `cashcarProfil` (`{l:1,…}`, 1 écriture) ;
  localStorage vidé puis `dbgJuge('miroir')` → l'enregistrement revient dans localStorage. NON vérifié dans la vraie app (Preferences réel).
- **n5 (stockage refusé)** FAIT tel que `correction_precise` : `pjgBaisse` teste le retour de `prfApprend` (PJG.fait reste faux, note « plafond non écrit (stockage refusé) ») ; le compteur de `pjgFin` aussi.
  Le 60 aussi teste ses écritures. VÉRIFIÉ (iPhone18,1 HAUTE, `jugelent=45`, compteur `l:1` posé, puis `setItem('cashcarProfil')` qui lève) : 2e course lente → « plafond non écrit (stockage refusé) … »,
  `fait` reste FAUX ; la course suivante retente et renote (rien n'est écrit, la boîte noire ne ment plus).
- **n7 (ccSortieSon hors course)** FAIT tel que `correction_precise` : `PJG.inactif = false` au départ de chaque course. VÉRIFIÉ : `ccSortieSon` envoyé au menu, puis course de 6 s → témoin posé (`temoin` vrai, `inactif` faux).
- **n8 (témoin « page tuée »)** FAIT selon la décision du pilote (plutôt que la correction du relecteur) : il faut DEUX pages tuées en course en 7 jours (`tv` dans l'enregistrement d'avant). C'est PRF qui
  tranche au chargement (le premier témoin rend l'enregistrement d'avant DÈS CE LANCEMENT), `pjgDepart` écrit. `?sans=temoin2` = un seul. La « composition » (N4 → N3 → N2…) demande maintenant deux arrêts
  par cran ; je n'ai pas ajouté la garde du relecteur (« pas de témoin sous un plafond appris ») pour ne pas éteindre la mémoire des téléphones déjà plafonnés.
  VÉRIFIÉ (iPhone14,2 HAUTE = N2, `Page.crash` en course) : 1er crash → relancé N2, plafond 4, « page tuée … la 1re en 7 j : rien ne baisse », `tv` = [date] ; 2e crash → N1, plafond 1, mur 1 j,
  « la 2e en 7 j … plafond N2 → N1 ». AVANT : un seul crash → N1.
- **n9 (qlDoux / QL.roseT)** FAIT dans `qlDoux` (la correction préférée du relecteur est dans `moteur/boucle-1.js`, hors de mon lot) : une remontée REFUSÉE pose `QL.roseT = max(QL.plafT, maintenant − 6001)` :
  plus de faux « remonté puis retombé » (le test de boucle-1 est `< 6000`), et jamais sous `plafT` (sinon le retour d'un essai raté passerait outre le doux, le risque que le relecteur signalait).
  NON vérifié au banc (aucun pas ne provoque ce cas de façon reproductible) ; vérifié à la lecture : seuls boucle-1:117/119/123, qlDoux et qlReprise lisent `roseT`.
- **n10 (CAD.pq)** FAIT tel que `correction_precise`, borné à `PRF.on` (seul le juge du profil lit `pq`) : à chaque image calée, 'chaud' ⇄ 'reactif' suit `mobChaud()` ; 'depart' et 'force' restent.
  Vérifié à la lecture et indirectement (1er passage du retrait : les secondes calées par la dose sont restées « chaud », non jugées). NON vérifié : le cas (a) du relecteur (refroidi, calé réactif) sur téléphone.

## (5) PLAN.md
FAIT : classes et familles, budget de pixels (table complète, mesuré / estimé / repli), défauts, le 60 mérité, le gouverneur doux recalé, le juge de chaleur, le témoin à deux, le miroir natif.

---

## LES PLANCHES (`passation/qualite/photos/profils2/`, regardées)
`outils/banc-juge/photos.cjs` (copie du banc des niveaux), `--meteo nuit` pour avoir le même ciel, zoom ×1,5 en pixels d'écran (DPR 3) sur la caisse. ⚠ Le banc n'est PAS à l'image près :
d'un passage à l'autre la caisse est à quelques unités près (−323,9 contre −334,6 sur 13pro), le cadre bouge un peu ; la RÉSOLUTION, elle, se compare. Sans `--meteo` le ciel est tiré au hasard à
chaque chargement (jour, nuit, pluie) : mes premières planches comparaient des ciels différents, je les ai refaites.
- `13pro-basse-identique.jpg` : 13 Pro BASSE, AVANT / APRÈS, caisse et traînées. Même grain, même flou : 1055×487, ombre 768 PCF, halo ½ 3 étages, 171 programmes des deux côtés. La preuve d'identité
  est chiffrée (toile, ombre, halo, programmes) ; l'image ne l'est qu'à la position près.
- `iphone15-basse.jpg` : iPhone 15 BASSE, N2 à 1,5 contre 1,65 (budget C). Gain LÉGER à l'œil (la plaque un peu plus lisible) pour +23 % de pixels — estimé tenable sur A16, pas franchement « mieux »
  au banc. Gardé actif parce que c'est la décision (1) du pilote et un recalage de coût, pas un effet ; `?famille=B` rend l'image d'avant si le premier vrai 15 ne la tient pas.
- `promax-basse.jpg` : 13 Pro Max BASSE, 1,25 contre 1,15 : un peu plus doux (voulu : les pixels d'un 13 Pro). Aucun défaut.
- `16pro-n4.jpg` : 16 Pro. En haut HAUTE N4 DPR 3 contre 2,4 (⚠ ciels différents : premier passage) ; en bas le DÉFAUT, AVANT HAUTE N4 DPR 3 contre APRÈS BASSE N3 1,95 (même ciel) : la plaque
  « CC-161-RZ » se lit à DPR 3, moins à 1,95. C'est le prix de « tout part à 30 en BASSE » sur la classe 3 ; aucun défaut.
- `serious-n3.jpg` : iPhone 15 HAUTE N3 à serious (même ciel) : AVANT 2,0 gardé, APRÈS 1,31. Visiblement plus doux (la plaque) — c'est la baisse voulue pour la chaleur, sans défaut (pas d'escalier,
  halo et ombre identiques). À juger sur le téléphone : si c'est trop doux, `dkDoux` N3 à 0,85.

## A MESURER SUR LE 13 PRO
(Mis à jour au tour 2, après le contrôle adverse et les arbitrages du pilote.) Le 13 Pro est la famille B : en BASSE comme en HAUTE il ne change pas (toile 1055×487 / 1266×585). Tout le reste
s'essaie dessus par `CC_QS` (build Debug) ou `--qs`, boîte de vol, puis les lignes `profil` de la boîte noire. Sur le téléphone, `&classe=`, `&famille=` ET `&appareil=` sont des paramètres d'ESSAI :
le juge mesure, note, et N'ÉCRIT RIEN (ni localStorage ni miroir) — l'enregistrement du 14,2 reste intact. `&classe=` SEUL garde les DPR fixes d'avant (comparables au build 117).
1. **N3 à serious × 0,75, une fois par course** (le gain estimé : 29 ms → 21-24 ms, et plus de critical) — HAUTE, 9 min de course, branché + économie d'énergie comme d'habitude (c'est le cas de
   chaleur qu'on veut voir) :
   A = `classe=2` (N3 aux DPR d'avant = 2,0 comme la mesure du 14/11 ; à serious 1,5, une seule fois par course) · B = `classe=2&sans=douxn3` (le N3 d'avant : 2,0 gardé à serious).
   Lire : l'état thermique (passe-t-il critical ?), le vrai coût à serious, les i/s, et le nombre de changements de toile. Réussi si A reste ≤ serious 9 min avec un vrai coût ≤ 24 ms.
2. **Le budget HAUTE de la famille C sur une A15** (le N3 d'un iPhone 15 en HAUTE, en plus lourd pour la puce) — HAUTE, mêmes conditions que 1 :
   A = `classe=2&famille=C` (N3 au budget C : 1,05 Mpx, DPR 1,8 sur 844×390) · B = `classe=2` (N3 d'avant, DPR 2,0). Le vrai coût de A sur l'A15 donne un majorant pour l'A16.
   (En BASSE la famille C reste à 1,5 au N2, comme avant : plus rien à mesurer là.)
3. **Le mécanisme du 60 sur une puce réelle** — BASSE, DÉBRANCHÉ, HORS économie d'énergie, téléphone frais (nominal ou fair : sinon la course ne peut pas être candidate), deux courses de plus
   de 60 s dans la MÊME séance : `appareil=iPhone17,1` (simule un 16 Pro ; essai : jugé EN MÉMOIRE, rien d'écrit). Attendu : course 1 → « candidat au 60 i/s (travail médian X ms …) (essai : rien
   d'écrit) » ou « pas candidat au 60 i/s (raison) : travail médian X ms … » — ce X est le chiffre qui manque (le travail JS réel d'une image sur iPhone) et il se note désormais à CHAQUE course,
   chaude ou en économie comprises ; course 2 (si candidat) → « essai du 60 raté … (essai : rien d'écrit) » attendu (N3 E = DPR 2,0 à 60 sur une A15). Relancer sans le paramètre : le 14,2 n'a rien perdu.
4. **fair60 = 0** (après un serious, 60 seulement à nominal) — DÉBRANCHÉ, HORS économie d'énergie (l'économie compte comme « chaud » sous un profil à 60 : A et B resteraient à 30) :
   A = `prffps=60` · B = `prffps=60&sans=merite60` (fair60 = 1). Il faut un passage serious → fair pendant la course (jouer jusqu'à serious, puis laisser refroidir). Lire dans la boîte noire la
   cadence après le retour à fair : A reste 30 jusqu'à nominal, B repasse 60 dès fair.
5. **Le témoin** : un Xcode ■ en pleine course → au lancement suivant « page tuée … la 1re en 7 j : rien ne baisse » ; HAUTE inchangée.
6. **Le miroir natif** : après une course lente notée, Preferences doit contenir `cashcarProfil` (Xcode → l'app → NSUserDefaults `CapacitorStorage.cashcarProfil`).

## NON vérifié, en clair
- Tous les budgets hors B N1-N2 : des estimations ; le juge (courses lentes) et le juge de chaleur (critical) les corrigent sur le terrain, un cran à la fois.
- Le seuil de 11 ms de travail et la tenue d'un essai de 10 s : jamais vus sur un vrai A18/A19.
- Le miroir Preferences dans la vraie app ; n9 et n10 en situation.
- Les photos sont du Chrome du Mac, pas la puce de l'iPhone : elles montrent la RÉSOLUTION, pas le coût.
- Une panne de boîte noire « grotte | repli bâti d'un trait (sans tranches) » apparaît dans les deux passages LONGS (iPhone17,1, 5-6 courses : une grotte tirée) ; elle vient de code/maps / du pré-bâti,
  hors de ce lot. Je n'ai pas fait de passage aussi long sur l'AVANT : NON établi qu'elle existait avant. 0 exception, 0 console.error.

---

## TOUR 2 (15/11, après le contrôle adverse `tour2/controle-profils2.md` et les arbitrages du pilote)
Repris après une interruption (Mac redémarré) : le travail non commité de l'agent précédent relu, complété (la séance brûlante non écrite en essai), vérifié au banc, commité.

Corrections du contrôle :
- **1 (sérieux) protocole + chiffre** : le travail de l'image (`PJG.wA`) se relève à chaque seconde au calme, chaude ou en économie comprises ; à la fin de chaque course (familles E-F) la boîte noire
  dit « candidat » ou « pas candidat (raison) : travail médian X ms … ». Mesures 3 et 4 réécrites : DÉBRANCHÉ, hors économie d'énergie. VÉRIFIÉ : course en `__ccEco=1` → « pas candidat au 60 i/s
  (économie d'énergie) : travail médian 4,2 ms sur 25 s ».
- **2 (sérieux) escalade m60** : un essai réussi GARDE le compte du mur (`m60 {n, j:0, fin:0}`). VÉRIFIÉ : m60.n 2 → essai tenu → `{n:2,j:0,fin:0}` → deux courses lentes à 60 (`jugelent=40`,
  `dbgGouv(0)`) → « 60 i/s retiré … se remérite dans 4 j », `m60 {n:3, j:4}` (avant : toujours 1 j).
- **3 témoin** : deux pages tuées → l'enregistrement d'avant est rendu (f60, e60, m60, l6, br), seuls plaf/pf/mur viennent du témoin. VÉRIFIÉ : f60, m60, l6, br survivent, plafond N3 → N2.
- **4 `famille=`** dans `PJG.force`. VÉRIFIÉ (banc avec `__ccAppareil` simulé) : `famille=C` → force vrai, écrit faux.
- **5 f60 / e60** lus indépendamment. VÉRIFIÉ : f60 N3 + e60 N4 → « 60 i/s mérité (jusqu'au N3) · essai du 60 en attente (N4) ».
- **6** `.catch` sur Preferences.set/remove (miroir, `dbgJuge('oubli')`, `dbgPrf('oubli')`). Lu ; hors app, pas de Preferences au banc.
- **7** interrupteurs : `?sans=inactifcrs` (n7), `?sans=roset` (n9), `?sans=pqsuit` (n10). VÉRIFIÉ : la page charge avec les trois, 0 exception ; effet lu dans le code seulement.
- **8** `dbgPrf('oubli')` vide aussi le miroir. VÉRIFIÉ pour localStorage (null) ; le miroir non vérifiable hors app.

Arbitrages du pilote :
- **(a)** famille A sans budget au N1 (`px.A[1] = 0`) : 13 (14,5) BASSE 1,25 / 1055×487, 13 mini (14,4) 1,25 / 1015×468 = le plafond d'aujourd'hui ; HAUTE N2 1,3 (1097×507). VÉRIFIÉ au banc.
  ⚠ Reste une baisse en BASSE sur la famille B grand écran : 13 Pro Max 1,25 → 1,15 (les Mpx du 13 Pro mesuré, pas une nouvelle mesure) ; et 16 Pro BASSE N3 2,0 → 1,95 (estimé). Non arbitrés : à garder ou à borner.
- **(b)** en BASSE, jamais au-dessus du DPR d'avant (`prfDprAvant`) : iPhone 15 BASSE 1,5 (VÉRIFIÉ), 16e BASSE 1,5, 17 Pro BASSE 2,0. Les hausses (et baisses) par famille jouent en HAUTE : 15 HAUTE N3 1,75.
- **(c)** `?classe=N` seul : aucune famille, DPR d'avant. VÉRIFIÉ (modèle natif simulé 14,2) : `classe=2` HAUTE → N3 DPR 2,0 ; `classe=3` BASSE → N3 2,0. Au banc, `appareil=` passé avec `classe=` force la famille du modèle.
- **(d)** le juge n'écrit rien en essai : sur un vrai téléphone (`__ccAppareil` posé) `appareil=`, `classe=`, `famille=` → `force` ; le 60 se juge en mémoire (« essai : rien d'écrit ») ; la séance brûlante
  n'est plus écrite dans sessionStorage en essai. VÉRIFIÉ : 14,2 avec un enregistrement (plaf 3, br) puis `appareil=iPhone17,1` : candidat → essai → « 60 i/s DÉBLOQUÉ (N3) … (essai : rien d'écrit) »,
  l'enregistrement du 14,2 identique octet pour octet. Au banc (sans `__ccAppareil`), `appareil=` reste jugé comme un vrai (les bancs juge/table inchangés).
- **(e)** N3/N4 à serious : la part `dkDoux` au plus une fois par course dans chaque sens (`GDX_DK`) ; en-tête de gouverneur-paliers corrigé. VÉRIFIÉ (13 Pro `classe=2` HAUTE, capteur simulé
  serious/fair/serious/fair 70 s chacun) : 1688 → 1266 → 1688 → 1688 → 1688, 2 changements de toile (avant : 4). `?sans=douxn3` : 1688 tout du long. ⚠ le retour à fair prend ~60 s (la fenêtre de remontée), comme avant.
- **(f)** voir 7.

Ordinateur : `--pc 1` → `PRF.on` faux, toile 844×303 DPR 1, ombre 1280, halo 5, 0 exception. Assemblage `--depuis-morceaux` : 330 morceaux d'accord ; grand script : syntaxe bonne (le script 5 est en échec
dans la base aussi, hors lot). Pannes de banc vues : « grotte | repli bâti d'un trait » et une mort au pic de Jade (code/maps, hors lot).
