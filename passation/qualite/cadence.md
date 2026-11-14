# LOT 4 — LA CADENCE ET LE JUGE DU PROFIL : rapport (14/11)

Branche `qa/cadence` (partie de `qualite-appareil`), worktree `~/cash-car/qualite-cadence`. Fichiers touchés : `code/moteur/cadence.js`,
`code/moteur/gouverneur-thermique.js`, `code/moteur/gouverneur-paliers.js`, nouveau `code/moteur/profil-juge.js` (inscrit dans `ORDRE.txt` après
`moteur/mobh-regime-chaud.js`), un banc à moi `outils/banc-juge/juge.cjs`. Rien d'autre dans `code/`. `VERSION PRINCIPALE/index.html` et `sw.js` ne sont PAS
commités : l'intégrateur fait `node code/assembler.cjs --depuis-morceaux`.

## Ce qui est fait

### (1) La cadence suit le profil — `gouverneur-thermique.js:69-81` (section « LA CADENCE SUIT LE PROFIL »), `?sans=prffps`
- `prf60()` = `PRF.on && PRF.fps === 60` (classe 3 en HAUTE = N4, classe 4 dans les deux réglages, ou `?prffps=60`).
- `mobChaud()` : sous `prf60()` → `MOB_GOUV && (thermo ≥ 2 || MOB_S.actif || mobEco())`. Donc 60 i/s en course à nominal et fair ; 30 dès serious ;
  30 en économie d'énergie (`mobEco()` = `__ccEco === 1`, `?eco=1`, ou `CAD.eco`) ; si 60 ne tient pas, la cadence RÉACTIVE d'aujourd'hui (`cadFin` :
  p75 > 19 ms tenu 2 s → 30 ; 5 s de travail < 10 ms → essai de 60 ; mur) reprend la main. Après serious (ou un calage réactif à fair), le 60 ne revient
  qu'au retour à nominal : c'est la retenue existante `MOB_S.actif` (hystérésis, pas de va-et-vient 30/60 à la frontière fair/serious).
  Plus de `MOB_FROID30` ni de `g30` pour ces profils. Sinon (profil à 30, hors profil, ordinateur) : la ligne d'avant, mot pour mot.
- `cadence.js:77` `cadPose(v, now, pq)` retient POURQUOI on est calé (`CAD.pq` : `'chaud'`, `'reactif'`, `'depart'`, `'force'`) ; les 4 appels le donnent (`:89, :90, :96, :159`).
- `dbgGouv()` rend en plus `vise` (30/60), `eco`, `retenue`.

### (2) Le gouverneur part du niveau — `gouverneur-paliers.js:36-62` (section « LE GOUVERNEUR PART DU NIVEAU DU PROFIL »), `?sans=prfgouv`
- `mobNiv()` = `PRF.n` si profil N2-N4, sinon 1. Au N1 et hors profil : les tables d'avant (`MOB_PN`, `MOB_PP`), au bit près.
- `MOB_P0` n'est plus un objet recopié : c'est une VUE en lecture (accesseurs, écritures sans effet) du départ du niveau courant : N1 = `{halo:'demi', mips:3,
  ombre:768}` ; N2+ = halo du levier a (`PAL.bT('imgBloomRes')`, plein), `bloomNM()`, `ombreTel()`. Le `prfP0` du lot 1 écrit toujours dedans : sans effet.
- Tables relatives `MOB_PNK` (capteur) / `MOB_PPK` (dose) : `mips:-1` / `ombre:-1` = un étage / un cran d'ombre en moins ; `dk` = part du plafond du niveau ;
  `ql:5` (= `QL.N_EFF` : tous les effets de l'échelle coupés, la résolution encore libre de descendre jusqu'aux planchers du niveau).
- `mobPalVoulu` (`:80-89`) : sous profil, les écarts relatifs ; `mobPalApplique(t, repose)` (`:91`) : la descente desserre l'échelle au cran de départ du
  niveau (ou au plancher du palier) ; `repose` = même palier sur un autre niveau, sans relancer la minute de descente.
- `mobPalTick:111` : le niveau a changé à chaud (BASSE ⇄ HAUTE) → le palier en cours se repose sur le nouveau niveau (un appel à `imgRegle`).
- `mobPalCapPlein` (`:79`) : sous profil = le plafond du niveau ; la remontée `MOB_R` (`?mob_raise=1`, éteinte) ne joue pas sous profil (`:112-113`).
- `gouverneur-thermique.js:104` : le cran QL de plus du critique (`qlPose(QL.k+1)`) n'est pas rejoué sous profil N2-N4 (au N1 il est sans effet : l'échelle
  est déjà au cran maximal ; sous profil il ôtait un cran de résolution de plus que la part du N1 — mesuré, voir plus bas).
- HAUTE : rien à faire ici — `qlPose` (lot 1) borne HAUTE au cran 2 tant que `MOB_P.t < 2` ; à serious et plus le plancher du gouverneur garde la main (vérifié).

**La table** (DPR effectif mesuré au banc, écran 844×390 DPR 3 ; ombre et halo : voir le banc plus bas). Justification : au N1, l'état thermique retire une
PART fixe de la résolution — serious : le cran maximal de l'échelle pose le plancher BAS, 1,0 / 1,25 = **80 %** ; serious qui dure : le plafond 1,1 passe
sous ce plancher, la résolution effective reste 1,0 = **80 %** (+ ciel 1/8) ; critical : 0,85 / 1,25 = **68 %**. Sous profil, chaque niveau perd la même
part de SON plafond (donc la même part de pixels : 64 % / 46 %), et l'échelle QL reste libre en dessous : si 80 % ne tient pas, elle descend encore.

| état | N1 (aujourd'hui = témoin) | N2 (1,5) | N3 (2,0) | N4 (3,0) |
|---|---|---|---|---|
| nominal | 1,25 · halo ½ 3 ét. · ombre 768 | 1,5 · halo plein 4 ét. · 1024 | 2,0 · plein 5 ét. · 1280 | 3,0 · plein 5 ét. · 1280 |
| fair | 1,25 · halo 2 ét. · cran 3 | 1,5 · 3 ét. · cran 3 (HAUTE : 2) | 2,0 · 4 ét. | 3,0 · 4 ét. |
| serious | **1,0** · halo coupé · 512 · ciel 1/4 | **1,2** | **1,6** (avant : 1,25) | **2,4** (avant : 1,5) |
| serious qui dure (150 s) | 1,0 · ciel 1/8 | 1,2 | 1,6 | 2,4 |
| critical / serious branché | **0,85** | **1,02** | **1,36** | **2,04** |
| sans capteur (dose 60/100/140) | 1,1 · 1,0 · 0,8 | ×0,88 · ×0,8 · ×0,64 | idem | idem |

### (3) Le juge — `code/moteur/profil-juge.js` (nouveau), `?sans=prfjuge`
- Appelé par `cadFin` (`cadence.js:84`, `if(PJG.on)prfJuge(now)`), une fois par seconde. `PJG.on` = `PRF.on` (téléphone profilé) : l'ordinateur et tout
  appareil hors profil ne font qu'un test faux par image.
- Juge : en course, hors pause, après 10 s, « au calme » (`pjgCalme` : comme `CAD.calme`, sauf que calé sur 30 des images régulières de 50 ms — le
  détecteur `loop._r30` les prend pour un écran bridé — se jugent), états nominal/fair seulement ; profil à 60 : ni en économie d'énergie, ni pendant un
  calage décidé par la chaleur / la retenue (`CAD.pq !== 'reactif' || mobChaud()`). Mesure : `QLR.p50` rendu à sa durée vraie (`+ CAD.per − CAD.ecran`
  quand calé ou en éco) contre `1000 / PRF.fps` : lente > ×1,15, tenue < ×1,05.
- Course lente : ≥ 45 s jugées, ≥ 40 % lentes. Deux de suite → `prfApprend(classe − 1)` + mur. Course tenue : ≥ 60 s, ≥ 80 % tenues → compteur effacé.
  Mur `{n, j, fin}` : 1, 2, 4, 8 jours. Mur fini (lu au lancement) → la classe du modèle est réécrite avec `essai:1` ; à ce retour une course lente suffit ;
  une course tenue efface le sursis.
- Mémoire : `PRF.nMax ≥ 3` → au départ de chaque course un TÉMOIN est écrit dans `cashcarProfil` : c'est déjà la classe d'un cran plus bas (avec son mur),
  l'enregistrement d'avant rangé dedans (`vol.r`). Fin propre, page cachée, `pagehide` → l'enregistrement d'avant est remis. Page tuée en course → le
  lancement suivant part directement un cran plus bas (PRF lit le témoin comme une classe apprise, sans retouche du lot 1) ; `pjgDepart` en fait une
  classe apprise et le note. Contexte 3D perdu au premier plan (nMax ≥ 3) → la baisse est écrite tout de suite.
- Rien n'est écrit quand `?classe=` / `?prfniv=` / `?prffps=` / `?prfdpr=` forcent (on mesure seulement) ; `?appareil=` est jugé comme un vrai modèle.
- Journal : lignes `profil` « juge : … » (course lente 1/2, baisse, page tuée, contexte, mur fini, course tenue qui efface) ; `prfApprend` ajoute sa ligne « appris ».
- `window.dbgJuge()` décrit (classe, compteurs de la course, dernier verdict, décisions, témoin, `cashcarProfil`, cadence et sa raison) ;
  `dbgJuge('oubli')` efface `cashcarProfil` ; `dbgJuge('fin')` finit la course (banc). Banc : `?jugelent=N` (N ms de travail en plus par image), `?jugeech=0.25`.

## VÉRIFIÉ (et comment)
Banc `outils/banc-juge/juge.cjs` (UN Chrome sans fenêtre, muet, ports 9871/9872, sous `verrou-banc.sh`, fermé à la fin ; téléphone émulé 844×390 DPR 3,
tactile, `hover:none`, UA iPhone → TEL_NATIF vrai, sans `?tel=1` ; même mémoire d'un pas à l'autre ; pilote auto `dbgAuto`, rAF réel). Machine peu chargée (charge ~2,6).
- `node code/assembler.cjs --depuis-morceaux` → « 330 morceaux d'accord » ; `node outils/garde-demarrage.cjs` OK ; `sh garde-allege.sh` OK.
- **N1 = aujourd'hui, à chaque état** : iPhone14,2 BASSE sur la branche ET iPhone14,2 NETTE sur le témoin `~/cash-car/finition` (v1591), `dbgThermique(0,1,2,3)` en course :
  palier, cran, plafond, DPR, halo, étages, ombre, ciel, traits, cadence **identiques champ par champ** (0 : 1,25/½/3/768 · 1 : 1,25/0,375/2/768/cran 3 ·
  2 : 1,0/coupé/512/ciel 4/×½/cran 10 · 3 → palier 4 : 0,85/ciel 8), 30 i/s calées partout.
- **N2-N4** (iPhone14,2 HAUTE, iPhone15,4 HAUTE, iPhone17,1 BASSE, iPhone17,1 / 18,1 HAUTE) : la table ci-dessus, mesurée ; toiles 2532×1170 → 2025×936 (serious N4).
  `?sans=prfgouv` sur iPhone15,4 HAUTE : le comportement du lot 1 (serious → 1,25, critical → 0,85).
- **Cadence** : iPhone17,1 HAUTE (N4, 60) : nominal et fair à 60 (non calé), serious → 30 (`chaud`), retour fair → reste 30 (retenue), nominal → 60 en ~5 s ;
  iPhone18,1 BASSE (N3 à 60) : 60, critical → calé ; `?eco=1` → 30 dès le départ ; `?sans=prffps` → 30 ; iPhone17,1 BASSE (N3, 30) → 30 comme aujourd'hui.
- **Le juge** (`?jugelent=25|45&jugeech=0.25`, donc seuils 2,5 / 11 / 15 s) :
  - iPhone18,1 HAUTE ralenti : course 1 « lente 1/2 » (p50 33,3 contre 19,2) ; course 2 → « classe 4 → 3, mur 1 j » ; relancé : `PRF.c = 3` « appris en course ».
    Mur vieilli de 2 jours → au lancement « mur fini » (enregistrement c:4, essai:1, cette session suspendue) ; lancement suivant à la classe 4 ; UNE course lente → 4 → 3, mur **2 j**.
  - Course lente puis course tenue (sans ralenti, p50 16,7) → « compteur effacé » (l:0).
  - iPhone14,2 BASSE ralenti à 20 i/s : deux lentes (p50 50 contre 38,3) → « déjà à la classe 1 : rien de plus bas », aucune classe écrite.
  - iPhone15,4 BASSE ralenti : deux lentes → 2 → 1, mur 1 j.
  - serious pendant toute la course : 21 s comptées « chaud », 0 jugée, aucun verdict.
  - `?classe=4` forcé : verdict calculé (« lente »), rien écrit.
  - **Page tuée** : iPhone18,1 HAUTE, témoin posé en course (`cashcarProfil` = c:3, vol:{de:4}), `Page.crash` (pas de pagehide), onglet neuf : `PRF.c = 3`
    dès ce lancement, note « page tuée en pleine course (témoin retrouvé) : classe 4 → 3 dès ce lancement · 1 j ».
  - **Contexte perdu** (`WEBGL_lose_context`, iPhone15,4 HAUTE, au menu) : « classe 2 → 1 … contexte 3D perdu au premier plan », relancé à la classe 1 (N2).
  - 0 exception, 0 console.error dans tous ces essais (seule « panne » : la ligne `contexte` du jeu lui-même au test de perte).
- **L'ordinateur** (`profil.cjs --pc 1`, sauvegarde neuve et HAUTE, 14 s de course) : `dbgJuge().on` faux, `vise` 30, non calé, 0 exception.

## NON vérifié
- Rien sur un vrai iPhone : le vrai capteur `cc:thermique`, `__ccEco`, la vraie tenue de 60 i/s d'un A18/A19 (aucun au banc), le coût de 2,4 de DPR à serious sur N4.
- Le serious qui dure (palier 3, 150 s de serious cumulées) n'a pas été joué : même code que serious (même table), ciel 1/8 en plus.
- La bascule BASSE ⇄ HAUTE EN COURSE avec le gouverneur actif (`repose`) : lue, non jouée au banc.
- Le témoin face à un vrai « jetsam » iOS (le processus WebContent tué) : simulé par `Page.crash`. Que WKWebView n'envoie pas `visibilitychange`/`pagehide` dans ce cas est supposé.
- Une perte de contexte au premier plan qui ne vient PAS de la mémoire (relance du processus GPU de WebKit) baisse aussi la classe : accepté (le mur la rend en 1 jour).

## À juger sur le vrai iPhone 13 Pro (`CC_QS`)
1. Classe 1 (défaut) : la course reste calée sur 30, la chaleur comme avant ; à chaud (`dbgThermique` simulé seulement), l'image comme avant.
2. `&classe=4` (ou `&prffps=60`) : la course à 60 sur le 13 Pro — combien de temps avant fair / serious ? la retombée à 30 se voit-elle ? (le juge n'écrit rien quand c'est forcé).
3. Classe 1 HAUTE (N2) à serious : 1,2 de DPR au lieu de 1,0 — tient-il, ou la chaleur continue-t-elle de monter ?
4. Boîte noire : les lignes `profil` « juge : … » après quelques courses (sans `&classe=`, un 13 Pro BASSE ne doit RIEN noter s'il tient ses 30).

## Pour les autres lots (changements hors de mes fichiers)
- **`rendu/nettete-qualite.js` (l'agent en cours)** : le rattrapage `prfP0` est devenu inutile — à retirer : la fonction `prfP0` (`:255-256`), son appel dans `prfRegle`
  (`:264`, la ligne `  prfP0();`), la microtâche `:268` (`if(PRF.on)Promise.resolve().then(prfP0);`) et la fin du commentaire `:251-252` (« MOB_P0 … recopie … au lot 4 »).
  `dbgPrf().mobP0` (`:284`) peut rester : il lit la vue (le départ du niveau courant).
- **`rendu/nettete-qualite.js`, `qlPose`** : l'ombre de l'échelle est ABSOLUE (`k ≥ 2` → 768, `k ≥ 4` → 512), pas relative au niveau : en HAUTE N3/N4 le cran 2 (`hauteK`)
  pose déjà 768 au lieu de 1280, et à fair le « cran d'ombre en moins » du gouverneur est masqué (l'échelle est au cran 3). Proposer : `k ≥ 2` → un cran sous `QL.ombre0`.
- **`rendu/soleil-planete.js` (PRF)** : pour qu'un mur fini rende la classe du modèle DÈS ce lancement (aujourd'hui : au suivant, le juge réécrit l'enregistrement au
  lancement), une condition dans la lecture : ignorer `a` quand `a.mur && Date.now() >= a.mur.fin && !a.vol`. Le format est déjà écrit (`mur:{n,j,fin}`, `l`, `essai`, `vol`).
- **Note du profil** : `prfNote` écrit le DPR avec un point (« DPR 1.25 ») ; les lignes du juge ont la virgule.
- `?cad30=0` / `?mob_gouv=0` coupent `CAD.ok` ou le gouverneur : le juge n'est alors plus appelé (il vit dans `cadFin`).

## Questions ouvertes
1. **HAUTE et le juge** : HAUTE accepte « quelques accrocs » ; le juge utilise les mêmes seuils (p50 > ×1,15 — des accrocs isolés ne bougent pas une médiane). Faut-il
   un seuil plus large en HAUTE (lot 1 suggérait `PRF.haute()`), ou juger seulement en BASSE ?
2. **Après serious, 60 seulement au retour à nominal** (retenue `MOB_S.actif`) : choix de prudence thermique. La lettre de la demande permettrait 60 à fair après un serious.
3. **N4 à serious = 2,4 de DPR** (proportionnel) : 4,6 Mpx pour un A19 chaud. Si le premier vrai iPhone 17 chauffe trop, baisser `dk` serious (table `MOB_PNK`) de 0,8 à 0,7.
4. Le témoin compte une perte de contexte au premier plan comme un manque de mémoire, même au menu.
