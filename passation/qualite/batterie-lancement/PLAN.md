PLAN « BATTERIE + VITESSE DE LANCEMENT » (iPhone, app iOS). Lecture seule de /Users/sachaberes/cash-car/qualite (b241a7d51). Rien modifié, rien committé, aucun navigateur ni build. Aucun gain ci-dessous n'est mesuré : ce sont des estimations.

## 1. Le cas de Sacha change les priorités

- **Branché** : la batterie ne se vide pas. Ce qui compte, c'est la chaleur, qui bride le téléphone (20 i/s en critical, lancement plus long). Le wattmètre se tait branché (`code/moteur/gouverneur-thermique.js:113`).
- **En économie d'énergie** : l'écran est à 30 et iOS verrouille au bout de 30 s. Toute veille de menu qui part après 30 s ne lui sert à rien.
- **Le mode éco est connu du jeu mais n'allège rien** : `__ccEco` n'est lu que par `cadence.js:65`, `gouverneur-thermique.js:80` et `:121`, et `enregistreur-perf.js:96`.
- **Aucune ligne `chargement` ne dit si le téléphone était en éco, branché ou chaud** (`code/moteur/intro-161.js:1045-1047`). Deux lancements ne sont donc pas comparables aujourd'hui.

## 2. Vérification des 10 propositions les plus prometteuses

| # | Proposition | Verdict | Ce que dit le code |
|---|---|---|---|
| 1 | Script du jeu en fichier (`--jeu-fichier`) | **Vraie, à faire** | L'option existe (`app-ios/preparer-www.js:321-327`) mais n'est passée ni par `app-ios/package.json:8` (`sync`, appelé par `archiver.sh:14`) ni par `app-ios/publier-maj.js:44`. Le `www/` actuel n'a pas de `jeu.*.js`. `passation/PASSE3-P4.md:3` : « gardée comme option, pas activée par défaut ». |
| 2 | Chronométrer chaque étape du « prêt » | **Vraie, à compléter** | La ligne `chargement` donne déjà `lier` et `chauffe` en ms (`intro-161.js:1047`). Il manque tôles, départ d'avance, lit, coup-appui, et éco / thermique / branché. |
| 3 | Moteur audio et vent qui calculent du silence hors course | **Fausse : déjà fait** | Les « portes » débranchent chaque chaîne dont la consigne est nulle, au menu aussi (`code/son/graphe-audio.js:62-89`, `portesTick` l.84, portes posées l.511-513). |
| 4 | Scène 3D dessinée sous un écran opaque | **Vraie** | `#overlay::before` est à opacité 1 hors `home`/`dead` (`code/css/charte-2-ecrans.css:8-15`). `hcSaute` (`code/moteur/cadence.js:179-197`) n'a aucun cas « couvert » : la 3D tourne à 30 i/s dessous. |
| 5 | Boucles CSS des menus jamais gelées | **Vraie** | `hudDortTick` sort avec `cle=''` dès `!started||garageOn` (`cadence.js:154`). L'exclusion est voulue : un bouton MISSIONS gelé restait invisible. Il faut donc un autre mécanisme que ce scan. |
| 6 | Vitrine des menus à densité 2 | **Vraie** | `PAL.B.vhdDprTel=[2,2,2]` (`code/rendu/nettete-qualite.js:238-240`), contre 1,25 en course BASSE. Le menu dessine 2,56× plus de pixels que la course. |
| 7 | Éco → image d'un niveau plus bas en course | **Vraie mais sans effet pour le défaut** | Le 13 Pro est en BASSE par défaut (`T.c[1].def='fast'` → N1, `code/rendu/soleil-planete.js:467`). Gain seulement si HAUTE est choisie. |
| 8 | 2e banque de sons chargée en plein chargement dense | **Vraie** | `VERSION PRINCIPALE/sfx.js:152-153` : 500 ms après `load` sous WebKit. Attention : `sfx.js` sert aussi le site, il faut une garde « app seulement ». |
| 9 | Menus à 5 i/s après 3 min | **Vraie mais inutile pour Sacha** | Le plancher est bien 15 i/s après 60 s (`cadence.js:203`, `:226-229`). En éco, l'écran est déjà éteint à 30 s. |
| 10 | 3 morceaux encore synthétisés en direct | **Non tranchée** | `passation/ios-ultime/PLAN-ULTIME.md:130` : Sacha a dit non au rendu, la question « retirer du tirage ou laisser » est restée ouverte. Je n'ai pas pu confirmer l'état dans l'app. À lire sur la ligne `musique` de la boîte noire. |

Aussi vérifié :
- La dose de chaleur est bien écrite toutes les 5 s (`gouverneur-thermique.js:95`). Gain négligeable.
- `demarrage-vite` est bien dans HEAD : `DENSE` est en place (`code/interface/vignette-moteur.js:423-440`).
- Le chargement dense travaille par tranches de 28 ms : le mode éco (30 Hz) ne le ralentit presque pas.
- Les étapes d'avant (`chargementTick`, `vignette-moteur.js:518-520`) font un pas par image, donc deux fois plus lentes en éco. Le lot 1 dira si ça pèse.

## 3. Le plan : 4 lots indépendants

Aucun fichier n'est partagé entre deux lots.

### Lot 1 : LANCEMENT, mesurer et script en fichier
**Gain** : ~250 ms à chaque relancement, plus la mesure qui décide de la suite. **Risque** : très faible.

- **But** :
  - passer `--jeu-fichier` par défaut, dans le build et dans les mises à jour en direct ;
  - une ligne `chargement` complète : instant où chaque étape de `introPrete` se libère, nombre de programmes, `dbgDense()`, éco, thermique, branché ;
  - charger `sons-banque-2.js` à `cc:revele` dans l'app seulement (le site garde ses 500 ms).
- **Fichiers** : `app-ios/package.json`, `app-ios/publier-maj.js`, `code/moteur/intro-161.js`, `VERSION PRINCIPALE/sfx.js`.
- **Interrupteur** : `?sans=banquetard`. La ligne de journal n'en a pas besoin. Le script en fichier se retire en ôtant l'option.
- **Estimation** : 935 → 660-694 ms au DCL, mesuré sur le build 17 (`PASSE3-P4.md`). 100-300 ms pour la banque (analyse de 6 Mo hors du serpent).
- **Preuve sans téléphone** :
  - `node app-ios/preparer-www.js --essai --jeu-fichier` : `jeu.<empreinte>.js` présent et la relecture `garde-demarrage` passe ;
  - `outils/banc-demarrage/lancement.cjs --cpu 4` : la nouvelle ligne apparaît, 0 erreur ;
  - `CCSON.etat()` après une course lancée tout de suite : `perdus` = 0.
- **Sur le 13 Pro** : 3 lancements à chaud et 3 à froid, débranché et nominal, puis les mêmes branché en éco. Lire `chargement` avec `outils/banc-perf/boite-noire.sh`. L'étape qui se libère en dernier désigne le chantier suivant.

### Lot 2 : PROGRAMMES EN DOUBLE, diagnostic seul
**Gain espéré** : 1-4 s à froid, 0,5-2 s à chaud. **Risque** : nul (outil seulement).

- **But** : lister les programmes compilés sous le serpent et repérer les jumeaux. Ils sont passés de 182 à 236 au build 80 (`PLAN-ULTIME.md:379`). Les corrections se décident ensuite, fichier par fichier, hors maps.
- **Fichiers** : un nouvel outil `outils/banc-demarrage/programmes.cjs`. Aucun fichier du jeu.
- **Interrupteur** : aucun.
- **Estimation** : 26 s à froid pour ~176 programmes, soit 0,1-0,15 s par programme évité.
- **Preuve sans téléphone** : le tableau « source identique, defines différents », avec pour chaque groupe d'où il vient (maps = intouchable).
- **Sur le 13 Pro** : rien à ce stade. Après correction : durée de `chauffe` dans la ligne du lot 1.

### Lot 3 : MENUS FROIDS
**Gain** : modeste en watts, utile en chaleur avant la course. **Risque** : faible.

- **But (a), scène couverte** : sous RÉGLAGES, MODES, boutique de la coque, SÉRIE, PLAQUE/PROFIL et CONFIDENTIALITÉ, la 3D passe à 2 i/s. C'est le même mécanisme que la pause froide (`cadence.js:186-189`). Je déconseille de couper tout à fait : à 2 i/s, le son, le gouverneur et les minuteries de la boucle restent vivants. La fenêtre `transUI` garde la priorité pour les fondus d'entrée et de sortie.
- **But (b), veille des reflets** : après 20 s sans geste au menu, une classe `html.ccVeille` met les animations en pause (`animation-play-state:paused`, jamais `animation:none`). Réveil au premier toucher. Exclus : transition en cours, série, missions, révélation, achat.
- **Fichiers** : `code/moteur/cadence.js`, `code/css/interface-opti.css`.
- **Interrupteurs** : `?sans=couverte`, `?sans=veille`.
- **Estimation** :
  - (a) ~93 % des images 3D en moins sur ces écrans (30 → 2 i/s, ~146 appels par image), mais on y reste peu ;
  - (b) seul repère connu : un reflet gelé a fait passer le temps libre du fil principal de 30,4 k à 48,6 k (`interface-opti.css:9-12`). Utile à Sacha entre 20 s et son verrouillage à 30 s, davantage hors éco.
- **Preuve sans téléphone** :
  - `outils/banc-menus/menus.cjs` : images dessinées par seconde et par écran (`renderer.info`), avec et sans l'interrupteur ;
  - photo toile cachée contre toile visible sur chaque écran : identiques = bien couvert ;
  - `document.getAnimations()` en cours avant et après 20 s ;
  - `outils/banc-interface/webkit.cjs` pour le temps libre ;
  - retour de MISSIONS dans le garage : le bouton réapparaît (le bug du 13/11).
- **Sur le 13 Pro** : `outils/banc-chaleur/essai.sh` 5 min dans RÉGLAGES puis 5 min sur l'accueil, A/B par interrupteur, budget thermique à la fin. Débranché : lignes `energie` de phase menu, 15 min par variante.

### Lot 4 : ÉCO = IMAGE PLUS LÉGÈRE (attend le oui de Sacha sur photos)
**Gain** : le plus gros pour lui. **Risque** : visible.

- **But** : quand `__ccEco` vaut 1 :
  - la vitrine des menus passe de densité 2 à 1,5 ;
  - si HAUTE est choisie, la course plafonne à N1 (variante douce : garder la densité, baisser seulement halo et ombre).
  - Recalcul à l'événement `cc:thermique`, qui porte déjà l'éco. L'ordinateur n'est pas concerné (`PRF.on` et `TEL_NATIF` seulement).
- **Fichiers** : `code/rendu/nettete-qualite.js`, `code/rendu/soleil-planete.js`. Ce sont les fichiers vivants du chantier qualité (PRF) : à confier à la session qui les tient, pas à un agent en parallèle.
- **Interrupteur** : `?sans=ecoimg`.
- **Estimation** :
  - vitrine : (1,5/2)² = −44 % de pixels dans tous les menus ;
  - course en HAUTE : 0,69× pixels et ombre 768 au lieu de 1280, soit ~0,3-0,6 W si le GPU pèse 40-50 % de ~4,5 W ;
  - rien en course si Sacha est en BASSE.
- **Preuve sans téléphone** : `?tel=1&classe=1&eco=1` : `curDPR` de la vitrine, `PRF.n`, triangles et pixels par seconde (`outils/banc-perf/menus-chaleur.py`). Photos A/B en 390×844 ×3 à montrer à Sacha avant tout code livré.
- **Sur le 13 Pro** : en éco, `essai.sh` accueil 5 min avec et sans. Débranché : watts de phase menu.

**Ordre** : lots 1, 2 et 3 en parallèle tout de suite. Lot 4 après le choix de Sacha.

## 4. Ce que j'écarte, et pourquoi

- **Endormir le moteur audio et le vent** : déjà fait par les portes.
- **Fusionner `demarrage-vite`** : déjà dans HEAD.
- **Menus à 5 i/s après 3 min, et veille profonde de la 3D à 0 i/s** : rien pour Sacha (verrouillage à 30 s en éco). Risque de menu figé au retour d'un achat.
- **Minuteries de 250 ms et minuteries natives (guet de l'autre musique)** : gain sous le bruit de mesure. Le guet à 2 s ralentirait le retour du son.
- **Dose de chaleur écrite moins souvent** : négligeable, pas un lot.
- **Reflet de JOUER déplacé par `transform`** : risque visuel sur la forme penchée. En réserve si le lot 3 (b) ne suffit pas.
- **Tôles gardées en IndexedDB, et départ d'avance rendu au menu** : seulement si le lot 1 désigne leur étape. Le second revient sur la règle du 8/11 « pas de latence au menu ».
- **Grotte creusée dès le début de la course** : touche au moment du tirage des maps. Décision de Sacha et Léo, hors de ce plan.
- **Baisser la luminosité, agir sur la charge** : réglages du système.

## 5. Décisions pour Sacha

1. **Lot 4** : accepte-t-il une vitrine un peu moins fine en économie d'énergie ? Photos A/B à lui montrer d'abord.
2. **Film d'intro plus court au relancement** (`K` de 0,8 à 0,6, ou droit au logo ; `intro-161.js:52-57`) : 1-3 s gagnées à chaque lancement, risque technique nul, mais c'est de la DA. Un toucher saute déjà au logo aujourd'hui.
3. **Les 3 morceaux en direct** (NÉNUPHARS VELOURS, LUNE DE JADE, FIRE PRIME) : les retirer du tirage de l'app ou les laisser ? Vérifier d'abord la ligne `musique`.