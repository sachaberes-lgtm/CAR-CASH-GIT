# Carte — LE RÉGIME DU POSTE (ordinateur adaptatif) et le palier PAL

Lecture seule de `code/` (worktree qualite, = origin/main v1596). Rien modifié dans `code/`, aucun banc lancé.
« Vérifié » = lu dans le code ; « non vérifié » = dit comme tel.

## 1. Où vit quoi

| Élément | Fichier:ligne |
|---|---|
| `TACTILE_NATIF`, `TEL_NATIF`, `FORCE_TEL`, `IS_MOBILE` | `code/rendu/soleil-planete.js:417-420` |
| Commentaire « deux versions », `LOOK_TEL` | `soleil-planete.js:421-433` |
| `POSTE_BANC=[7,10]` (seuils du banc processeur, ms) | `soleil-planete.js:434` |
| Commentaire du régime (les 4 régimes) | `soleil-planete.js:435-449` |
| `posteLit()` / `posteEcrit(o)` (localStorage `cashcarPoste`, `v:1`) | `soleil-planete.js:450-451` |
| `const POSTE=(function(){…})()` | `soleil-planete.js:452-494` |
| `posteVu(r)` (appelé par `palPuce`) | `soleil-planete.js:495-496` |
| `const ALLEGE=…` | `soleil-planete.js:497` |
| `IS_LOW_END=ALLEGE` | `soleil-planete.js:535` |
| Le juge : `PJ`, `posteCadOk`, `posteChange`, `posteBaisse`, `posteJugeable`, `posteFin`, `posteJuge`, `window.dbgPoste` | `code/moteur/poste-juge.js:13`, `:14`, `:16`, `:22`, `:25`, `:26`, `:34`, `:47` |
| Appel du juge à chaque image (`if(POSTE.auto)posteJuge(now)`) | `code/moteur/cadence.js:83` |
| `CAD.ok` inclut `POSTE.auto` (la cadence stable 30 permise sur l'ordi) | `cadence.js:39`, `dbgCadence` `:158` |
| `posteCadOk` consulté avant de caler sur 30 | `cadence.js:93` |
| `PAL` (palier de l'appareil) | `code/rendu/palier-appareil.js:21-112` (IIFE) |
| `palPuce(gl)` (après création du contexte, appelle `posteVu`) | `palier-appareil.js:134-138`, appelé `:184` (ligne `palPuce(renderer.getContext())`) |
| `window.dbgPalier(n)` | `palier-appareil.js:139-140` |
| `DPR_CAP` initial | `palier-appareil.js:214` |
| `PC_PX` (budget de pixels de l'ordi : 3,2 Mpx, 2,0 en 4K, `?pcpx=`) | `palier-appareil.js:245` |
| `PAL.B.imgDprCap=[1.25,1.35,1.25]`, `PAL.B.imgQlDepart=[5,2,1]` | `palier-appareil.js:251` |
| `dprPlafond(fast)` | `palier-appareil.js:252-258` |
| `TOILE1_Q` (NETTE par défaut sur l'ordi à tout régime) | `palier-appareil.js:267` |
| Resize ordi : `DPR_CAP=dprPlafond(...)` à chaud (jamais sur ALLEGE/TEL_NATIF) | `palier-appareil.js:314` |
| `qlAuto()` = `(TEL_NATIF||POSTE.auto)&&!qHaute()&&started&&!gameOver` | `code/rendu/nettete-qualite.js:132` |
| `qlBornes()` (crans de résolution ; ordi = parts 72 % / 50 % du plafond ; Mac `POSTE.fixe` = aucun cran) | `nettete-qualite.js:135-147` |
| Départ au cran : `max(PAL.bT('imgQlDepart',PAL.b('qlDepart',0),'c'), POSTE.k0)` | `nettete-qualite.js:239` |
| `qHaute()` (`SAVE.d.q==='haute'`), `qlNet()` | `nettete-qualite.js:105`, `:98` env. |
| Banc ordis lents | `outils/banc-pc/lent.cjs` (+ `outils/banc-pc/LISEZMOI.txt`, `serveur.cjs`) |
| Modèle exact de l'iPhone injecté par le natif (`window.__ccAppareil`, `uname().machine`) | `app-ios/ios/App/App/JeuViewController.swift:12-14`, `:33`, `:413-417` |

## 2. Comment un ordinateur est classé (`POSTE`, `soleil-planete.js:452-494`)

État initial : `{pc:!TEL_NATIF, auto:false, r:3, pal:2, allege:false, src:'défaut', puce, logiciel, faible, coeurs:navigator.hardwareConcurrency, mem:navigator.deviceMemory, banc, appris, k0}`.

Sorties anticipées (POSTE.auto reste **faux**, r=3, pal=2, allege=false) :
1. `!P.pc` → **téléphone** (`TEL_NATIF`) : `src='téléphone'`, retour immédiat (`:455`). Le téléphone n'entre jamais dans le régime.
2. `?poste=max` → le jeu d'avant, rien ne s'adapte (`:456`).
3. `?tel=0|1`, `?mobile=0|1`, `?allege=0|1` → « essai à la main » (`:457`).

Sinon `P.auto=true`, puis :
- `P.fixe` (`:460`) : vrai sur Mac (platform/UA Mac) ou `?postefixe=1` ; `?postefixe=0` force faux. Effet : la résolution ne bouge JAMAIS en course (pas de réallocation de toile/cibles ; ombre et halo figés aussi, `nettete-qualite.js:137,145,147`). Raison : crash mémoire Mac du 11/11.
- Carte graphique : lue de `cashcarPoste.puce` si connue, sinon un contexte WebGL 1×1 jetable (`WEBGL_debug_renderer_info`, puis `loseContext`) (`:463-465`).
  - `logiciel` = `/SwiftShader|llvmpipe|softpipe|Software|Basic Render|WARP/` (`:467`).
  - `faible` = Intel HD/UHD, GMA, Mali, Adreno, PowerVR, VideoCore, vieilles Radeon/GeForce (`:468`).
- Banc processeur `banc()` (`:470-474`) : 4 tours de 120×4096 itérations arithmétiques, meilleur des 4 (ms). Même code que le banc de `PAL` (`palier-appareil.js:24-29`). Fait UNE fois par poste (résultat gardé dans `cashcarPoste.banc`).
- Ordre de décision (`:475-490`) :
  1. `?poste=0..3` → `r` imposé, `src='?poste'` (jamais jugé).
  2. Sauvegarde `localStorage.cashcarSave` lue **brute** : `q==='haute' && qChoisi!==0` → `r=3`, `src='IMAGE : HAUTE (choix du joueur)'` (jamais jugé, jamais baissé).
  3. `logiciel` → `r=0` (MINIMUM).
  4. Appris : `cashcarPoste.src==='mesure'` et `0≤r≤3` → `r` appris, `src='appris en course'`.
  5. Sinon heuristique : `r=3`, puis `faible`→≤2 ; `coeurs≤2`→≤1 ; `coeurs≤4 && mem≤4`→≤2 ; `banc≥10 ms`→≤1 ; `banc≥7 ms`→≤2. Écrit `{r, src:'depart', puce, banc}` (une ligne `src:'depart'` ne fige rien : la visite suivante refait l'heuristique, avec le banc retenu).
- Puis `P.pal=[0,1,2,2][r]`, `P.allege = r<=2` (`:491`), `P.k0` = cran QL moyen de la dernière course SI `kr===r` (`:492`), `html[data-poste=r]` (`:493`).
- `posteVu(r)` (`:495`) : si la puce du VRAI contexte (lue par `palPuce`) diffère de celle retenue, elle est notée pour la PROCHAINE visite (pas de reclassement à chaud).

## 3. Ce que change chaque régime

| r | Nom | `ALLEGE` | `PAL.n` | Budget de pixels `dprPlafond` | Autres |
|---|---|---|---|---|---|
| 3 | MAX | faux | 2 | `PC_PX` = 3,2 Mpx (2,0 en 4K ; `?pcpx=`) | image d'avant au pixel ; QL et cadence 30 restent possibles en course (sauf HAUTE / `?poste=max`) |
| 2 | ALLÉGÉ | **vrai** | 2 | min(PC_PX, 1,6 Mpx) | toutes les branches `ALLEGE` (maps sobres via `mapsSobres()`, ombres/halo du téléphone, VAO `__ccVao`, musique figée `__ccAllege`, `IS_LOW_END`…) |
| 1 | LÉGER | vrai | 1 (MOYEN) | min(PC_PX, 1,2 Mpx) | + budgets `PAL.b(...)` colonne MOYEN |
| 0 | MINIMUM | vrai | 0 (ANCIEN) | min(PC_PX, 0,9 Mpx) ; rendu logiciel = 1 px/point | + colonne ANCIEN (cadence 30 dès le départ `PAL.b('cadence30')`, halo coupé…) |

Détails vérifiés :
- `ALLEGE = !?allege=0 && (TEL_NATIF || POSTE.allege || ?tel|mobile|allege=1)` (`soleil-planete.js:497`).
- `PAL.n` sur l'ordi = `POSTE.auto ? POSTE.pal : 2` (`palier-appareil.js:68`), sauf `?palier=` ou palier appris (branche morte, voir §6).
- `dprPlafond` (`palier-appareil.js:252-258`) : la branche « téléphone » (`PAL.bT('imgDprCap', PAL.b('dprNetCap',1.5),'c')` = plafond 1,25-1,5) n'est prise que si `ALLEGE && !POSTE.auto` ; un ordi ALLÉGÉ (POSTE.auto vrai) garde un **budget de pixels** (image nette). Formule : `min(devicePixelRatio, max(PC_MIN, sqrt(px9/(innerWidth*innerHeight))), 4)`.
- Les leviers « image du téléphone récent » `PAL.imgOn(l)` (a…j) exigent `TEL_NATIF` : un ordi ALLÉGÉ ne les prend PAS (`palier-appareil.js:105`).
- `LOOK_TEL` (DA, ACES, bloom .44) ne dépend PAS du régime (`soleil-planete.js:433`).
- `hcRepos` (menus à 15 i/s) est réservé à `TEL_NATIF` (`cadence.js:214`) ; le commentaire « menus à 30 i/s » de LÉGER vient du budget PAL MOYEN (non vérifié clé par clé).

## 4. Le juge (`code/moteur/poste-juge.js`)

Appelé à chaque image par `cadFin` (`cadence.js:83`) seulement si `POSTE.auto`. Travaille 1×/s (`:35`).
- Course = `started && running && !gameOver && !garageOn` ; pause = rien ; fin de course → `posteFin()`.
- Les 15 premières secondes ne comptent pas, ni les secondes non « calmes » (`CAD.calme`, posé `boucle-1.js:49`) (`:39`).
- Chaque seconde jugée : `PJ.sec++`, `PJ.kS+=QL.k`, `PJ.cad++` si `CAD.on` (calé sur 30).
  - **MAL** : `(CAD.on || QL.k>=qlBornes().kNet) && QLR.p50 > (CAD.on?21:24)` ms.
  - **BIEN** : `!CAD.on && QL.k<=PAL.b('qlMin',0) && QLR.p90<17.8 && CAD.w<7` (CAD.w = travail processeur par image, ms).
- **Baisse** (`:44-46`) : `mal≥20 s && mal≥40 % de sec`, OU `sec≥45 && cad≥50 % de sec` → `posteBaisse()`. Jamais si déjà changé/averti dans la course, `r<=0`, ou non jugeable (`posteJugeable` = `POSTE.auto && src!=='?poste' && !qHaute()`).
  - `posteBaisse` (`:22-24`) : **deux courses lentes**. 1re → écrit `av = r+1` (avertissement) ; 2e (si `av===r+1` toujours en mémoire) → `posteChange(-1)`.
  - `posteChange(d)` (`:16-19`) écrit `{r, src:'mesure', de, pq, av:0}` et, si baisse, un **MUR** `{r:ancien, t, n}` (n incrémenté si même régime). Note la boîte noire (`__ccNote('poste', …)`).
- **Fin de course** `posteFin` (`:26-33`), si ≥ 15 s jugées : écrit `k` (cran QL moyen arrondi, borné à `kNet`) et `kr` (régime, ou −1 si changé) → départ de la course suivante (`POSTE.k0`). Course « bonne » = `cad≤10 %` et `bien≥80 %` ; une bonne course ≥ 30 s sans avertissement efface `av`. **Promotion** `posteChange(+1)` si bonne, `sec≥60`, `r<3`, pas logiciel, pas déjà changé, et pas de mur actif sur `r+1` (durée du mur = `min(14, 2^(n-1))` jours : 1, 2, 4, 8, 14).
- `posteCadOk(now)` (`:14-15`) : sur l'ordi au palier 2, le calage sur 30 n'entre qu'en dernier (QL à `kNet`, ou `CAD.w>12` ms, ou un cran de résolution qui n'a rien rapporté < 45 s). Sur téléphone (`!POSTE.auto`) : toujours vrai.

**Application** : tout changement de régime est écrit tout de suite dans `localStorage.cashcarPoste` mais s'applique **au rechargement** seulement (POSTE, ALLEGE, PAL sont des `const` lus à la construction ; budgets de contenu lus à la construction des maps). À chaud, seuls jouent l'échelle QL (ombre, halo, résolution 100/86/72 %, 50 % en effondrement ; aucun cran de résolution sur Mac) et la cadence stable 30.

Format mémorisé `cashcarPoste` : `{v:1, r, src:'depart'|'mesure', puce, banc, de, pq, av, mur:{r,t,n}, k, kr, t}`.

## 5. Crochets et paramètres

- `dbgPoste()` → `{r, nom, src, auto, palier, allege, puce, logiciel, faible, coeurs, mem, banc, k0, juge:{sec,mal,bien,cale,cran,change,averti,pq}, appris}` ; `dbgPoste('oubli')` efface `cashcarPoste`.
- `dbgPalier()` / `dbgPalier(n)` (recharge avec `?palier=n`) ; `dbgImg()` (leviers a…j) ; `dbgCadence(30|60|0)`.
- URL : `?poste=0..3|max`, `?postefixe=0|1`, `?pcpx=N` (Mpx), `?allege=0|1`, `?tel=1`, `?mobile=1`, `?palier=0|1|2`, `?palecran=0`, `?appareil=iPhone16,1` (simule le modèle natif), `?img=max|a,c`, `?imgsans=`, `?imgplus=`, `?sobre=0|1`, `?cad30=0`, `?mob_gouv=0`, `?gouv=max`.
- ⚠ Les crochets `window.dbgX` que rien de publié n'appelle sont **retirés** de la copie Vercel ET de l'app par `outils/publie-allege.cjs` (`vercel-build.sh:68-72`, `app-ios/preparer-www.js:269-275`) : `dbgPoste`/`dbgPalier` ne sont utilisables que sur une copie locale (option `--garde-dbg` pour les bancs). Non vérifié un par un si `dbgPoste` est nommé ailleurs (ce qui le garderait).
- Banc : `node outils/banc-pc/serveur.cjs "VERSION PRINCIPALE" 8131` puis `node outils/banc-pc/lent.cjs http://127.0.0.1:8131/index.html --cpux=4 --gpu=swiftshader --duree=60 --oubli=1 --profil=nom`. ⚠ chemin Chrome par défaut Windows (`C:/Program Files/...`) : sur Mac il faut `CHROME=...`. Machine au repos obligatoire (LISEZMOI).

## 6. `palApprend` / `palNote` / `cashcarPalier` sur téléphone

- **`palApprend` et `palNote` n'existent plus dans le code.** Seules traces : le commentaire `palier-appareil.js:14-15` (périmé) et `passation/debug-gameplay/compat-iphone.md:32` (« `palApprend` n'existe plus »). Vérifié par grep sur `code/` et l'assemblage.
- `localStorage.cashcarPalier` n'est écrit qu'à UN endroit (`palier-appareil.js:75`) avec `src:'banc'` (banc processeur, retenu 7 jours, `6048e5` ms). La branche `appris.src==='mesure'` (`:66`) est **morte** ; `palPuce` la teste aussi (`:136`).
- Donc sur téléphone : **aucune rétrogradation ni promotion de palier apprise en course**, rien de persistant. L'adaptation en course est par course seulement : échelle QL (`qlAuto` vrai sur TEL_NATIF), cadence 30 (`CAD30_REC`), gouverneur thermique/paliers `MOB_GOUV` (`gouverneur-thermique.js:25`, `gouverneur-paliers.js`, dose de chaleur, `?mob_raise=1` pour la remontée, inactive par défaut).
- Dans l'app, le banc ne tourne même pas : le modèle natif (`__ccAppareil`) passe avant l'écran et le banc (`palier-appareil.js:62-63,69`), donc `cashcarPalier` n'est jamais écrit sur un iPhone de l'app.

### Pourquoi tous les iPhone ont la même image (cause vérifiée)
`modele` (`palier-appareil.js:62-63`) : `iPhoneG,x` → `G<=10` ANCIEN, `G<=12` MOYEN, sinon **RÉCENT (2)**. Le 13 Pro (iPhone14,2), le 15, le 16, le 17… sont tous `G≥13` → palier 2, et le commentaire dit explicitement « jamais d'image plus lourde d'office ». Le palier 2 sur `TEL_NATIF` = `ALLEGE` + tous les leviers `PAL.imgOn` (a-f, i) + `MOB_GOUV` (30 i/s calées dès le départ, `gouverneur-thermique.js:58`) + `mapsSobres()` vrai sur tout téléphone (`palier-appareil.js:118`). Il n'existe aucun palier au-dessus de 2 et aucune notion de « régime » côté téléphone. (Correspondance identifiant → modèle commercial : de mémoire, non vérifiée dans le code au-delà de « iPhone14,2 = 13 Pro ».)

## 7. Pour un système de profils par appareil : où brancher, pièges

**Réutilisable tel quel (générique)** :
- Le format et l'hygiène de mémoire `cashcarPoste` (`posteLit`/`posteEcrit`, version `v:1`), la logique « deux courses lentes pour baisser » (`av`), les **murs** à recul exponentiel (1→14 j), la promotion après une course ≥ 60 s « bonne », le retour au cran QL appris (`k`/`kr` → `k0`). Ces fonctions ne dépendent que de `POSTE.r`, `QL`, `QLR`, `CAD`, `qlBornes`, `PAL.b`.
- Le principe « choisir au chargement, juger en course, appliquer au rechargement » convient aux budgets de contenu (lus à la construction).

**Ce qui suppose un ordinateur (à ne pas reprendre pour iPhone)** :
- La sortie anticipée `if(!P.pc)return` (`soleil-planete.js:455`) : il faudrait un second classement (ou lever cette garde) pour TEL_NATIF.
- L'heuristique : sur iPhone le renderer dit « Apple GPU » partout, `hardwareConcurrency` est peu parlant et `deviceMemory` absent sous Safari/WKWebView ; le banc processeur est **instable sur iPhone** (16-22 ms à froid contre 3-8 ms chaud, mesuré 13 Pro, `palier-appareil.js:36-40`). Le classement iPhone doit partir du **modèle natif** `__ccAppareil` (fiable, injecté avant le script), puis être corrigé par la mesure.
- `P.fixe` (Mac) et le budget `PC_PX`/`dprPlafond` branche ordi : si un iPhone se retrouvait `POSTE.auto && !ALLEGE`, `dprPlafond` prendrait la branche ordi → `sqrt(3,2 Mpx / 0,33 Mpx)` ≈ 3,1 → DPR 3 (le plafond natif), énorme pour un téléphone. Un profil « iPhone max » doit avoir son propre plafond.
- Les seuils du juge visent 60 i/s d'un PC (MAL = p50 > 24 ms ; BIEN = p90 < 17,8 ms, `CAD.w<7`, et **`!CAD.on`**). Sur iPhone, `MOB_GOUV`/`CAD30_REC` calent sur 30 **dès le départ** : chaque seconde compterait `cad` → règle « calé ≥ 50 % de 45 s » = rétrogradation systématique, et jamais de BIEN donc jamais de promotion. Il faut des critères propres au téléphone (30 ou 60 cible, chaleur `cc:thermique`, dose du gouverneur) — et exclure le calage volontaire du comptage.
- La thermique : un iPhone se bride en 2-7 min ; une course « bonne » dans les 60 premières secondes ne dit rien d'une course de 5 min. Le juge PC n'a pas de notion de chaleur.

**Où brancher** :
- Classement par modèle : à côté de `modele` dans `PAL` (`palier-appareil.js:62-69`) — y ajouter un niveau au-dessus de 2 (ou un « profil » distinct de `PAL.n`), car la RÈGLE D'OR (« palier 2 = image d'avant ») et des dizaines de `PAL.b(...)` à 3 colonnes supposent `n∈{0,1,2}`. Un profil iPhone « max » ≈ l'image Vercel suppose de couper ensemble : `ALLEGE` (const `soleil-planete.js:497`, lu partout), `PAL.imgOn` (`palier-appareil.js:105`, exige TEL_NATIF), `MOB_GOUV`/`CAD30_REC` (`cadence.js:38`, `gouverneur-thermique.js:25`), `mapsSobres()` (`palier-appareil.js:118` — maps : hors périmètre, une autre session), le plafond `dprPlafond`. Tout cela est figé au chargement : le profil doit être connu **avant** `POSTE`/`ALLEGE` (donc lu de `__ccAppareil` + localStorage tôt, comme POSTE le fait).
- Choix du joueur HAUTE/BASSE : `POSTE` lit déjà `cashcarSave.q==='haute'` brut au chargement (`:476`) ; `qHaute()` coupe le juge et l'échelle QL. ⚠ Dans l'app la sauvegarde peut venir d'un miroir natif « encore vide » au tout début (`palier-appareil.js:262-263`) — non vérifié si `localStorage.cashcarSave` est déjà rempli quand `POSTE` le lit dans l'app.
- Correction par la mesure : réécrire un juge type `posteJuge` branché au même endroit (`cadence.js:83`, aujourd'hui gardé par `POSTE.auto`), en réutilisant `posteBaisse`/`posteChange`/murs, avec des seuils téléphone.

**Pièges supplémentaires** :
- `IS_MOBILE` est vrai sur l'ordi en cadre téléphone : ne jamais garder un allègement dessus (`garde-allege.sh` refuse la publication).
- Les crochets `dbg*` sont retirés de l'app et de Vercel par `publie-allege.cjs` : pour lire le profil sur l'iPhone de Sacha, il faut un crochet nommé ailleurs, une note boîte noire (`__ccNote`), ou une copie de banc.
- `html[data-poste]` n'est posé que sur l'ordi ; `html[data-palier]` partout.
- Le commentaire `palier-appareil.js:14-15` décrit un `palApprend` disparu : ne pas s'y fier.
