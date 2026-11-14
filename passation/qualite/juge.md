# LOT JUGE — le juge corrigé et le plafond de niveau : rapport (14/11)

Branche `qa/juge` (partie de `qualite-appareil` 1ffdadda0), worktree `~/cash-car/qualite-juge`. Fichiers touchés : `code/moteur/profil-juge.js`,
`code/moteur/gouverneur-thermique.js`, `code/moteur/gouverneur-paliers.js`, `code/rendu/soleil-planete.js` (bloc PRF seulement), `code/rendu/nettete-qualite.js`
(prfP0 retiré, prfRegle, qlPose, dbgPrf), `code/rendu/palier-appareil.js` (la ligne `profil` du journal seulement), `outils/banc-juge/juge.cjs`.
`cadence.js` n'a pas eu besoin d'être touché. `VERSION PRINCIPALE/index.html` et `sw.js` ne sont PAS commités : l'intégrateur fait `node code/assembler.cjs --depuis-morceaux`.

## Ce qui est fait

### (1) Les défauts du contrôle adverse du lot 4 (`moteur/profil-juge.js`)
- **D1, le témoin « page tuée »** : il est retiré par `pjgQuitte` sur `pause` (Capacitor), `ccInactif`, `ccSortieSon`, `pagehide`, `visibilitychange` caché, et à la pause
  de la course (le bouton ou la pause automatique). Il n'est posé qu'en course, hors pause, avec la page visible et l'app au premier plan (`PJG.inactif` faux).
  Après un départ du premier plan, il n'est reposé qu'à la REPRISE effective de la course : on doit avoir vu la course en pause puis repartir, et `ccActif` / `resume` /
  page visible ne suffisent pas. Résultat : un appel entrant ou une app fermée par le joueur ne fait jamais baisser, puisque `ccInactif` part avant toute mort de l'app.
- **D2, la perte de contexte** (`pjgCtx`) : elle ne compte qu'en course, hors pause, au premier plan, et plus de 5 s après un retour (`ccActif`, `resume`, page visible).
  Il en faut DEUX dans la séance. Le compteur est `sessionStorage.ccPjgCtx`, qui survit au rechargement que le jeu fait après une perte.
  Au menu ou dans la grâce, seule une ligne « ne compte pas » est écrite.
- **D3** : l'économie d'énergie (`mobEco()`) n'est jamais jugée, quel que soit le profil.
- **D4** : rien n'est écrit sous un paramètre d'essai (`PJG.force`) : `classe`, `prfniv`, `prffps`, `prfdpr`, `cadfps`, `thermo`, `palier`, `poste`, `img`, `imgsans`,
  `imgplus`, `sobre`, `tel`, `eco`, `cad30`, `cad_e30`, `ql`, `qldepart`, `dpr`, tout `mob_…=` et tout `sans=…` (liste revue au 2e tour).
  Restent jugés comme un vrai : `?appareil=` et les leviers du banc `?jugelent=` / `?jugeech=`.
- **Les doutes tranchés** :
  - le compteur de courses lentes porte sa date (`lT`) et expire après 48 h (`PJG.T.lH`) ;
  - une course calée par la cadence réactive n'est comptée lente que sur ses secondes vraiment lentes : un profil à 60 calé « réactif », ou tenu à 30 réguliers sans être calé
    (`loop._r30`), est jugé sur le VRAI coût de la sonde (`QLR.vrai`, moins de 20 s). Le juge réarme la sonde au plus toutes les 10 s (`?sans=jugesonde` = jamais).
    Sans sonde fraîche, la seconde n'est pas jugée (`murNonJuge` dans `dbgJuge`), donc le mur de sortie ne compte plus ;
    **⚠ REMPLACÉ au 2e tour (voir « 2e tour ») : plus de sonde réarmée, plus de `?sans=jugesonde`, plus de `murNonJuge`.**
  - pendant la séance où le mur se termine, le retour est effectif dès ce lancement (voir (2)). Une page tuée descend alors d'un cran sous la valeur RETENTÉE, et plus deux crans sous le modèle.

### (2) Le juge baisse un PLAFOND DE NIVEAU, pas la classe
- `cashcarProfil` passe en **v2** : `{v:2, m, t, plaf, mur:{n,j,fin}, l, lT, vol}`. L'ancien v1 (classe apprise, jamais publié hors de la branche) est ignoré.
- `soleil-planete.js` (PRF) :
  - `PRF.c` reste la classe du modèle (ou celle forcée) ;
  - nouveaux `PRF.plaf` (1-4, 4 = aucun plafond) et `PRF.essai` ;
  - `prfNivT(T,c,q,plaf)` donne n = min(niveau de (classe, réglage), plafond), jamais sous N1 ;
  - `PRF.nMax` = min(niveau HAUTE de la classe, plafond), au lancement. `PRF.pc` et `mapsSobres()` le suivent sans retouche ;
  - `prfFpsT` : la classe 4 en BASSE garde ses 60 i/s au N3. Sous un plafond plus bas, on prend la cadence du niveau, soit 30 au N3 en HAUTE et 30 au N2 (2e tour : la HAUTE aussi à 60 au N3) ;
  - `?classe=` / `?prfniv=` forcent, et le plafond ne joue alors pas ;
  - mur fini sans témoin en vol : le plafond est ignoré DÈS CE LANCEMENT (`PRF.essai`).
- `prfApprend(plaf, plus)` écrit le plafond. C'est le seul point d'écriture du profil, avec `pjgPose` et le témoin.
- Le juge, sur une course lente :
  - le plafond devient le niveau jugé moins un (`PRF.n − 1`) ;
  - en retentative, UNE course lente au-dessus de l'ancien plafond suffit ;
  - une course tenue au-dessus de l'ancien plafond l'efface (`plaf: null`) ;
  - le mur suit 1, 2, 4, 8 jours.
- Témoin et contexte : le plafond devient le statique moins un (`PRF.nMax − 1`), seulement si `PRF.nMax ≥ 3`, comme au plan (2e tour : dès N2, et jamais au-dessus de l'ancien plafond).
- `prfRegle` (bascule BASSE ⇄ HAUTE à chaud) passe `PRF.plaf`, donc HAUTE sous un plafond N3 donne N3.
- `dbgPrf()` montre `plafNiveau` et `essai` ; `plafond` reste le plafond de DPR, que les bancs existants lisent.
  `dbgJuge()` montre `plafond`, `essai`, `seuil`, `inactif`, `retour`, `ctxSeance` et `murNonJuge`.
  La ligne `profil` du journal dit « classe 4 · plafond N3 » et « retentative du niveau après le mur ».

### (3) Le nettoyage demandé par le lot 4 (`nettete-qualite.js`)
- `prfP0`, son appel dans `prfRegle`, la microtâche et la fin du commentaire sont retirés. `MOB_P0` reste la vue du lot 4 ; `dbgPrf().mobP0` la lit toujours.
- `qlPose` : sous profil N2-N4, l'ombre de l'échelle QL est relative au NIVEAU.
  - Le cran 2 retire un cran à l'ombre du niveau (`PRF.T.n[n].ombre`), le cran 4 en retire deux. Les tailles disponibles sont 512 · 768 · 1024 · 1280 ; toutes sont gardées en réserve par `QL.ombres`, donc rien n'est réalloué.
  - Le résultat ne dépasse jamais ce que le gouverneur a posé (`min(QL.ombre0, …)`).
  - N1 et hors profil gardent le 768 / 512 absolu, au bit près.
  - `?sans=qlombre` rend l'absolu partout.

### (4) La table `PRF.T`, décisions du pilote
- `T.n[2].ombre = 1280` : N2 prend l'ombre 1280, mais garde son filtre PCF, puisque le filtre suit `PRF.pc`.
- `T.fair60 = 1` (`gouverneur-thermique.js`, `mobThermo`) : pour un profil à 60, la retenue posée par serious tombe au retour à fair. Un calage réactif à fair la repose quand même (`mobReactif`).
- `T.n[4].dkS = .7` (`gouverneur-paliers.js`, `mobPalVoulu`) : à serious et à serious qui dure, avec le capteur, le N4 descend à 70 % de son plafond, soit 2,1 de DPR au lieu de 2,4.
  Critical reste à 68 %. Les autres niveaux restent à 80 %. La table de la dose, sans capteur, n'est pas touchée.
- `T.jugeH = 1.3` : en HAUTE, une seconde n'est lente qu'au-dessus de la période × 1,3, contre × 1,15 en BASSE. Le seuil de tenue reste × 1,05.

## VÉRIFIÉ (et comment)
Le banc est `outils/banc-juge/juge.cjs`, étendu ; je l'ai lancé par un petit script qui prend le verrou et le rend seulement s'il est encore à moi.
- Les conditions : UN Chrome sans fenêtre et muet, ports 9891/9892, fermé à chaque passage, sous `verrou-banc.sh` ; iPhone émulé 844×390 DPR 3, avec `TEL_NATIF` vrai sans `?tel=1` ; même mémoire d'un pas à l'autre.
- Les pas ajoutés au banc : `quitte:<ev>[:crash|reprise]`, `ctxcourse:<s>[:retour]`, `lance:<s>`, `fige`/`cmp`. `vieillir` recule aussi `lT`. `charge` pose le réglage APRÈS avoir quitté la page (la page quittée réécrivait la sauvegarde à son pagehide, ce qui faussait un `fast` après un `haute`) et rend `q` = « réglage Nx y i/s ».
- `node code/assembler.cjs --depuis-morceaux` répond « 330 morceaux d'accord » ; `node outils/garde-demarrage.cjs` OK ; `sh garde-allege.sh` OK. Pas de CSS touché, donc pas de garde-charte.
- 0 exception et 0 console.error sur tous les pas. Seule panne vue : « rendu · Cannot read properties of null (reading 'trim') » juste après une perte de contexte provoquée (le rendu sur un contexte perdu), avec la ligne `contexte` du jeu.

### D1 (iPhone18,1 HAUTE = N4, `jugeech=0.25`)
- `quitte:ccInactif:crash` (l'appel entrant), `ccSortieSon`, `pause` (Capacitor), `pagehide` et `pausejeu` (le bouton), chacun suivi de `Page.crash` :
  - avant l'événement, le témoin est posé (`plaf:3, vol:{de:4}`) ;
  - après, le témoin est retiré, `cashcarProfil` vaut `null` et la course est en pause ;
  - au lancement suivant : **N4, 60 i/s, plafond 4, aucune ligne du juge**. Les cinq cas donnent tous ce résultat.
- `quitte:ccInactif:reprise` :
  - après `ccActif`, en pause, le témoin reste retiré (`inactif` faux) ;
  - après la reprise de la course, il est reposé ;
  - à la fin de la course, il est retiré.
- La vraie page tuée en course (`crash`) donne, au lancement suivant : « page tuée en pleine course (témoin retrouvé) : plafond N4 → N3 dès ce lancement · 1 j ».
  On a alors N3 HAUTE à **30 i/s**, DPR 2, toile 1688×780.
- Page tuée pendant la retentative (plafond N2 enregistré, mur fini, N4 retenté) : le plafond devient **N3** et le mur 4 j (n = 3), pas N1.
- Classe 1 HAUTE (N2, statique < 3) tuée en course : rien n'est écrit.

### Le plafond (iPhone18,1, `jugelent=25`)
- HAUTE, deux courses lentes (p50 44-51 ms contre 21,7, seuil HAUTE × 1,3) donnent « plafond N4 → N3, mur 1 j ».
  Relancé, on a N3 / statique N3 / PC vrai / **maps sobres** / 30 i/s / PCFSoft / DPR 2.
- BASSE avec un plafond N3 donne **N3 à 60 i/s**, comme aujourd'hui. HAUTE avec le même plafond donne N3 à 30.
- Mur vieilli de 2 j : au lancement, « mur fini : le plafond N3 est levé dès ce lancement » donne N4, 60 i/s, `essai` vrai (**effectif dès ce lancement**).
  UNE course lente donne alors « au retour, une course lente » : N4 → N3, mur **2 j** (n = 2).
- Mur vieilli encore : une course tenue au retour (p50 16,7, 23 s tenues) donne « le plafond N3 est levé » (`plaf:null`). Relancé, on est en N4 sans plafond.
- BASSE classe 4 (N3 à 60, seuil 19,2) : une course lente, puis le compteur vieilli de 3 j, puis une course lente redonnent « course lente **1/2** » (l'expiration de 48 h joue).
  La course lente suivante donne N3 → N2. Les deux réglages passent alors en N2 à 30 i/s, statique N2, PCF, maps sobres, DPR 1,5.

### D2 (iPhone15,4 HAUTE = N3)
- Au menu : « contexte 3D perdu hors course : ne compte pas » (0 dans la séance).
- En course, juste après un `ccActif` : la perte ne compte pas (`ctxSeance` 0 après le rechargement).
- En course : 1/2, puis, après le rechargement, la deuxième perte donne « plafond N3 → N2 : 2 pertes du contexte 3D en course dans la séance ». Relancé : N2, PCF.

### D3 et D4 (iPhone15,4 BASSE = N2 à 30, `jugelent=45`)
- `window.__ccEco = 1` : 16 s comptées `eco`, 0 seconde jugée, rien n'est écrit.
- `?cadfps=20` et `?mob_gouv=0` : le verdict est calculé (« lente », p50 50 contre 38,3) mais rien n'est écrit, même après deux courses.

### N1 et hors profil = le témoin, à chaque état thermique
Le témoin est `qualite-appareil` 1ffdadda0, assemblé dans le scratchpad. Le même banc a tourné sur le témoin et sur la branche, avec `dbgThermique(0,1,2,3)` en course.
Trois appareils : iPhone14,2 BASSE (N1), un iPhone sans modèle (hors profil), iPhone14,2 `?sans=profil`.
Ils sont **identiques champ par champ** (palier, cran, plafond, toile, cadence, halo, étages, ombre, ciel, traits, cran QL) :
- N1 : 1055×487 / ½ / 3 ét. / 768 → fair 0,375 / 2 ét. / cran 3 → serious 844×390 / 512 / ciel 4 → critical 717×331 / ciel 8.
- `dbgQual(2|4|0)` en course, N1 et hors profil, sur les deux jeux : ombre **768 / 512 / 768**.

### N2-N4, ombre et gouverneur
- `dbgQual(2|4|0)` en course, sous profil : ombre **1024 / 768 / 1280**. Mesuré sur N2 (iPhone14,2 HAUTE), N3 (iPhone15,4 HAUTE) et N4 (iPhone17,1 HAUTE) ; avant ce lot, c'était 768 / 512.
- N2 nominal : ombre 1280. N2 fair : 1024, 3 étages.
- N4 serious : DPR **2,1** (toile 1772×818).
- iPhone18,1 HAUTE, états 0 → 2 → 1 : à serious, calé sur 30 ; revenu à fair, **décalé, de retour à 60** (8 s plus tard). L'image reste au palier 2 pendant la minute de descente, comme avant.

### L'ordinateur (`outils/banc-profil/profil.cjs --pc 1`, sauvegarde neuve, NETTE, RAPIDE et HAUTE, 14 s de course)
- Avec `?poste=max` : branche et témoin sont **identiques champ par champ**, sauf les deux champs ajoutés à `dbgPrf` (`plafNiveau`, `essai`) et la ligne `fluide` (carte tirée, timing).
- Sans `?poste=max` : seul le cran QL du régime de l'ordinateur différait, 0 contre 1-2. Le témoin passait en second sur la machine chargée (sonde 36 ms). Aucune ligne de PC n'est touchée : tout est gardé par `PRF.on`, qui est faux.

## NON vérifié
- Rien sur un vrai iPhone : le vrai `ccInactif` et `ccActif` de Swift, l'ordre réel `ccInactif` → mort, le vrai jetsam, ni le vrai capteur thermique.
- Une écriture de localStorage faite à `ccInactif` peut être perdue si iOS tue le processus dans la foulée. WebKit écrit sur disque avec un délai : un balayage dans le sélecteur d'apps laisse normalement plus d'une seconde.
- La sonde réarmée par le juge, sur un profil à 60 coincé à 30 : sur iPhone, c'est la lecture synchrone (5 images qui attendent la puce), soit au plus un petit à-coup toutes les 10 s, sur un téléphone qui est déjà à 30. Non mesuré.
- Le serious qui dure (palier 3) à 70 % pour le N4 : lu (même table que serious), non joué.
- Bascule BASSE ⇄ HAUTE en course sous un plafond : lue (`prfRegle` passe le plafond), non jouée.

## À juger sur le vrai iPhone
1. Sur le 13 Pro, classe 1, en BASSE comme en HAUTE : appeler le téléphone en pleine course, ou fermer l'app depuis le sélecteur d'apps, puis relancer. Le jeu ne doit pas être plus bas : `dbgJuge()` dans la boîte noire, aucune ligne « page tuée ». Pour la classe 1, le témoin ne se pose de toute façon jamais (statique N2).
2. `&appareil=iPhone18,1` (jugé comme un vrai), HAUTE : refaire 1. Puis vérifier qu'une course normale ne laisse aucune ligne `profil` « juge : … ».
3. N4 à serious à 2,1 de DPR : tient-il, et la chaleur redescend-elle ?
4. Après un serious, le 60 i/s qui revient à fair : la chaleur repart-elle aussitôt (va-et-vient 30 / 60) ?

## Pour les autres lots
- `rendu/triptyque-bloom.js:14` (le fichier n'est pas à moi) : le commentaire « N2 1024 » est périmé, c'est désormais 1280. Le code lit la table, rien à changer.
- `passation/qualite/PLAN.md` décrit encore « la classe effective baisse » : c'est maintenant un plafond de niveau (ce rapport).

## Questions ouvertes (TRANCHÉES par le pilote, faites au 2e tour ci-dessous)
1. Une course lente baisse le plafond au **niveau jugé − 1**. Une classe 4 en BASSE (N3 à 60) qui rame passe donc en N2 à 30, sans essayer N3 à 30 : le plafond ne sait pas dire « N3 mais à 30 ». Faut-il ce cran intermédiaire ?
2. Après un mur fini, on retente le niveau du MODÈLE, pas un cran au-dessus du plafond. Un téléphone tombé à N2 repasse donc par N4, puis N3. Garder ce choix, ou remonter cran par cran ?
3. Le témoin et la perte de contexte ne jouent qu'à partir du statique N3, comme au plan. Une classe 1 en HAUTE (N2) tuée par la mémoire ne descend jamais. Est-ce voulu ?
4. `dkS` à 0,7 ne s'applique qu'avec le capteur. Sans capteur, la dose garde 80 %.

## 2e tour (14/11) : les défauts du contrôle adverse corrigés
Fichiers : `code/moteur/profil-juge.js`, `code/rendu/soleil-planete.js` (bloc PRF), `code/moteur/gouverneur-paliers.js` (une condition, pour 7d),
le commentaire de `code/rendu/triptyque-bloom.js:14` (N2-N4 1280), `passation/qualite/PLAN.md` (plafond de niveau au lieu de « classe effective »).
1. **La sonde n'est plus réarmée** (elle figeait la cadence à 30 par cadence.js:98). Profil à 60 calé « réactif » ou à 30 réguliers : la seconde est jugée sur
   l'intervalle médian VRAI des images (`QLR.p50` + `CAD.per − CAD.ecran` quand c'est calé, le même calcul que pour les autres), contre la période visée × seuil.
   Viser 60 et tourner à 30 = lente. Un calage par la chaleur ou la retenue reste non jugé (`cale`). `?sans=jugesonde`, `PJG.sonde`, `murNonJuge` : supprimés.
2. **`prfFpsT`** : à niveau égal la HAUTE vise au moins la cadence de la BASSE. Classe 4 sous plafond N3 : HAUTE et BASSE à 60.
3. **Contexte perdu** : `sessionStorage.ccPjgCtx` = les DATES des pertes ; seules celles de moins de 2 min comptent (`PJG.T.ctxAge`) ; remis à zéro après une baisse.
4. **Toute baisse** (course lente, témoin, contexte) : nouveau cran = min(ancien plafond, cible) (`pjgNouv`). Jamais au-dessus de l'ancien plafond.
5. **Référence d'une course lente** : le cran le plus haut tenu pendant au moins la moitié des secondes jugées (`PJG.kS`, `PJG.T.pRef`). Réglage changé pendant
   la course (`PJG.chg`) : verdict « réglage changé : pas jugée », rien n'est écrit.
6. **`PJG.force`** : la liste précise `classe`, `prf…`, `cadfps`, `gouv`, `fps`, `bloom`, `memoire`, `sonde`, `thermo`, `chaleur`, `palier`, `banc`, `poste`,
   `img`, `imgsans`, `imgplus`, `sobre`, `tel`, `eco`, `cad30`, `cad_e30`, `ql`, `qldepart`, `dpr`, `mob_…` (avec ou sans valeur). `sans=…` et `perfrec` ne
   forcent plus ; `sans=prfjuge` coupe le juge.
7. Les questions ouvertes :
   - (a) **le plafond porte une cadence** : `cashcarProfil.pf` (30 ou rien), `PRF.plafFps`. Échelle des crans (`prfK`, `prfKPlaf`, `prfDeK`) :
     1 N1 · 2 N2 · 3 N3 à 30 · 4 N3 (cadence de la table) · 5 N4 (aucun plafond). Classe 4 BASSE N3 à 60 lente → N3 à 30, puis N2.
     Classe 4 HAUTE N4 lente → N3 (à 60, point 2), puis N3 à 30, puis N2.
   - (b) **mur fini → UN cran au-dessus** du plafond (`PRF.essai`). Course tenue au-dessus : le plafond monte d'un cran (le suivant se retente au lancement d'après,
     le mur étant fini) ; au cran 5 il disparaît.
   - (c) **témoin et contexte dès N2** : la référence est le statique `PRF.nMax` s'il est ≥ 3, sinon le niveau `PRF.n` ; cible = le niveau d'en dessous
     (N4 → N3, N3 → N2, N2 → N1). Classe 1 HAUTE (N2) tuée en course → plafond N1. Classe 1 BASSE (N1) : jamais de témoin, rien ne change.
   - (d) **dkS 0,7 aussi sans capteur** : au palier 2 de la dose (`gouverneur-paliers.js`, `(t===2||(t===3&&capteur&&long))`). Le palier 3 sans capteur
     (critical, dk 0,64) n'est pas touché.
- `dbgJuge()` montre `plafFps`, `course.crans` (secondes par cran) et `reglageChange` ; `dernier.cran` = la référence.
