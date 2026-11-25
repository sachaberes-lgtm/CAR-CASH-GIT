# L'écurie — les étapes, une par une

Chaque étape se ferme par **un commit** sur la branche `bots-ecurie` (dossier `C:\Users\sacha\code\CASH-CAR-bots-ecurie`).
Pour chacune : ce qui en sort, **comment vérifier**, et **le texte à coller dans une autre session** pour lancer la suivante.
Le plan d'ensemble est dans `PLAN.md`, l'étude dans `etude/`.

> ⚠ Toujours travailler dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie`, jamais dans `CAR-CASH-GIT` (d'autres sessions y changent de branche).
> Vérifier la branche avant un commit : `git branch --show-current` doit répondre `bots-ecurie`.

| # | Étape | État |
|---|---|---|
| A | L'étude : ce qui donne des pièces, ce qui tue, les vrais joueurs mesurés | **faite** (commit `67ea1f009`) |
| B | Les fondations : défauts corrigés, yeux v2, doigts v2 | **faite** (25/11/2026) : défauts corrigés, yeux v2 et doigts v2 écrits, relus par des agents, corrigés, puis contrôlés une dernière fois (`verifier.js` TOUT PASSE en régime max et en régime allégé, 5 rejeux exacts sur 5, la boucle à blanc va au bout avec un cerveau à profil). Ce qui reste faux ou non mesuré est écrit plus bas : ce sont des limites connues, pas des oublis |
| C | Le pilote d'élite, amélioré par tours | **commencée (25/11/2026) : le premier pilote existe** (`ml/ecurie/pilote.js`, main `clavier`). Au tri (12 graines, 600 s, allégé) : **palier médian 12,5, meilleur 20**, contre 6 et 17 pour le bot de référence sur les mêmes graines. **Pas encore fait** : la note de 20 graines de 900 s, l'inscription au labo, les tours payés de la boucle |
| C bis | La boucle automatique sur le crédit API (les 200 €), avec un plafond de dépense | **prête, essayée à blanc** : un tour complet le 24/11 puis de nouveau le 25/11 avec un cerveau à profil (0 €) ; la clé d'API est acceptée par les quatre modèles (`essai-api.js` du 24/11 : Opus 5.5, Sonnet 5.5 et Fable 5.2 avec repli, Haiku 5.5 sans) ; `boucle.js` a un plafond général de 200 € lu au journal des dépenses (`--plafond`, commit `71f3c7bea`). **Aucun tour payé n'a encore tourné** |
| D | Le facteur humain et les 30 niveaux | à faire |
| E | Le juge, niveau par niveau | à faire |
| F | Le paquet du matchmaking et le dossier du portfolio | à faire |

---

## OÙ ON EN EST — à lire en premier (25/11/2026 : l'étape B est contrôlée, l'étape C est commencée)

### L'étape C, premier temps : le premier pilote (25/11/2026, après-midi)

**Ce qui existe.** `ml/ecurie/pilote.js` : un cerveau à profil, écrit à la main en cinq tours (écrire, noter, lire les morts, corriger).
La boucle l'accepte : `node boucle.js --a-blanc --tours 1 --candidats 2 --depuis pilote.js` va au bout (0 €, profil `bb745b50cdb1`).
Rien n'a changé dans `ml/bot`, `ml/labo`, `code/` ni « VERSION PRINCIPALE/ ».

**Son profil — celui que la boucle gardera fixe.** `{ modele: 'clavier', graine: 1, chance: { prend: 1, palierMin: 12 } }` : la main
`clavier` telle que réglée à l'étape B, sans rien écrire par-dessus, aucune erreur ajoutée ; la seconde chance prise une fois, seulement
si la partie a déjà atteint le palier 12 (les joueurs l'ont prise aux paliers 14 et 28, dans leurs deux meilleures parties).

**Sa stratégie** (elle est écrite en tête du fichier).
- *Au sol* : il vise de loin ce qui se ramasse (la ligne parfaite, puis les pièces, puis les pouvoirs) et sa ligne glisse vers sa cible
  au lieu d'y sauter ; il lit la route devant (`vue.route`) pour se placer à l'intérieur du virage **d'après** et donne à la main un cap
  d'avance sur le changement de sens ; la nitro est demandée là où la route se tient (`vue.tenue`, `vue.virage`) et où le virage demande
  peu de volant, moins volontiers sur les maps à décor ; un fond de jauge est gardé pour planer.
- *En vol* : la loi « vers la route » au décollage ; tant que le radar annonce une pose, la lèvre ou le portail pour la façon tenue, il
  n'en change pas ; sinon il prend la façon du rayon dont l'issue vaut le plus (une pose droite et qui reste sur la dalle d'abord).
- Il ne saute pas, ne fait pas de figure, ne cherche pas de raccourci, ne drifte pas, ne freine pas.

**Ses chiffres de tri, contre le bot de référence sur les mêmes graines et la même durée** (12 graines de 910000 à 910407, 600 s au
plus, version allégée, simulateur `relief-canyon` ; `ml/bot/results/note-pilote-allege-t600.json` et `note-reference-allege-t600.json`).
Aucune course n'est coupée par le temps, d'un côté comme de l'autre.

| | le pilote (main `clavier`) | le bot de référence (main de machine) |
|---|---|---|
| palier médian | **12,5** | 6 |
| meilleur palier | **20** | 17 |
| les 12 paliers | 5 9 10 10 11 12 13 13 13 14 18 20 | 4 4 4 5 6 6 6 8 8 13 16 17 |
| survie médiane | 239,6 s | 103,5 s |
| pièces par minute | 325 | 316 |
| nitro tenue | 28,5 % du temps | 15 % |
| vols par minute, part du temps en l'air | 5,2 · 16,1 % | 2,67 · 6,5 % |
| fins | paroi 4 (les 4 au canyon), roche 3 (grotte), vide 3, tour 2 | pic 4, vide 3, roche 2, paroi 1, rivière 1, tour 1 |

Graine par graine, le pilote fait mieux 10 fois sur 12 (moins bien sur 910000 : 12 contre 16, et sur 910370 : 13 contre 17).
Le but de l'étape (médian 8,5, meilleur 18, mesurés sur 20 graines de 900 s) est donc dépassé **au tri** ; ce n'est pas encore la note
de 20 graines.

**Ce qu'il faut savoir avant de se fier à ces chiffres.**
- **12 graines, pas 20.** Le palier médian bouge de 7 à 12 par le seul hasard des courses (mesuré à l'étape B) : l'écart avec la référence
  (12,5 contre 6, 10 graines sur 12) est net, le chiffre 12,5 lui-même ne l'est pas.
- **La seconde chance compte dans le meilleur palier.** 7 courses sur 12 l'ont prise (elles avaient donc déjà le palier 12 à leur
  première mort : le médian resterait à 12 ou plus sans elle). Les deux plus hautes (20 et 18) l'ont prise : ce qu'elles auraient fait
  sans elle n'est pas mesuré. Le bot de référence, lui, ne la prend jamais.
- Les mesures intermédiaires des cinq tours portent sur 4 graines de 300 s (8 au canyon) : elles ont servi à choisir, pas à prouver.
- Le juge (`discerner.js`) n'a pas été passé sur ce pilote ; `verifier.js` et les rejeux n'ont pas été refaits (rien n'a changé sous eux).

**Les cinq tours, et ce que chacun a appris** (4 graines, 300 s ; les paliers obtenus entre parenthèses).
1. Tenir la route avec une marge, la nitro selon `vSure`, le radar en vol (3 5 11 11). Lu dans les morts : 15 décollages dans une course,
   aucun par un virage trop rapide pour la caisse (`vSure` gardait 300 m/s de marge) — c'est la main qui prend le virage en retard.
2. La ligne qui glisse, l'intérieur du virage, la nitro coupée quand le virage demande du volant (5 5 8 17). Lu : la moitié des sorties
   sont des sorties **en chaîne** — la caisse revient en travers, se pose (« propre » pour le jeu jusqu'à 55°) et ressort par l'autre bord.
3. En vol, changer de façon dès qu'un rayon annonce une pose plus droite (4 9 11 11). Lu : pire — deux morts jauge vide, la caisse
   zigzague au-dessus de la route ; la main met 0,2 à 0,3 s à obéir et le vol tourne de 3 rad par seconde.
4. Au sol, le virage **d'après** et le cap d'avance (5 10 10 12) : les sorties premières passent de 3,4 à 2,2 par minute de route.
5. En vol, la façon **tenue** tant que le radar lui annonce une pose (5 11 12 18) : 70 décollages, 4 morts, une course encore en vie à 300 s. C'est la version gardée.
   (Les sorties premières y remontent à 3,4 par minute : les courses durent plus longtemps, donc roulent plus vite.)

**Ce qui le tue encore.**
- **Le canyon.** Il y sort 1,5 fois par minute de route et la paroi est à une dizaine de mètres du bord : au banc (8 graines forcées au
  canyon, 150 s), 7 courses sur 8 y meurent, en 36 à 85 s ; au tri, les 4 courses passées par le canyon y finissent. Essayé sans effet
  mesurable : rouler dans l'axe sans nitro (1,35 sortie par minute contre 1,54), une avance de cap plus forte (1,74). Non essayé : freiner.
- **Les S serrés** : la loi `ligne` de la main suit le virage sous les roues, perçu 0,15 s plus tard ; au changement de sens elle braque
  encore du mauvais côté. Le cap d'avance en rattrape une partie.
- **Les coups de volant longs** (0,3 à 0,45 s, un sur dix) : à 400 km/h, un seul met la caisse au bord depuis l'axe en une seconde.
  Le pilote n'y peut rien par la ligne qu'il vise ; un joueur sort lui aussi (8 vols par minute).
- **Les poses en travers**, puis la roche de la grotte et les tours de la ville quand la chaîne de sorties s'allonge.

**Trouvé en chemin dans `ml/bot`, non corrigé (interdit ici).**
- `vue.virage` ne décrit que le **premier** virage devant (celui sous les roues tant qu'il dure) : le virage inverse d'un S n'apparaît
  qu'à 20 m. Le pilote le reconstitue depuis `vue.route` ; un champ « le virage d'après » dans les yeux servirait à tous les cerveaux.
- `node autopsie.js --json` écrit le JSON **après** les lignes de console du jeu (« CASH CAR — build… », « photoDev ReferenceError… ») :
  la sortie ne se relit pas telle quelle par `JSON.parse`.
- À chaque seconde chance le simulateur écrit deux erreurs (`ImageData is not defined`, `cv.toDataURL is not a function`, la photo de
  la pub) : sans effet sur la course, mais elles noient la sortie de `noter.js`.

**La suite.** La note de 20 graines de 900 s et les tours payés sont le travail de la boucle (`node boucle.js --budget … --depuis pilote.js`),
qui part de ce pilote et garde sa main. Les outils jetables de ces cinq tours (un banc qui compte les sorties premières et les sorties en
chaîne, par map) sont restés hors de git dans `ml/ecurie/agents/tmp-pilote/`.

### ⚠ Le simulateur a changé le 25/11 : le canyon a enfin son relief

Jusqu'au 25/11, dans le simulateur (`ml/reel`), le canyon n'avait **ni paroi, ni rivière, ni tunnel, ni mur de couloir** : son calcul
partait dans un « travailleur » qui ne répondait jamais. Une sortie de route au canyon était donc un vol gratuit. Depuis le commit
`9b1b9a0b4`, le simulateur calcule ce relief sur place (`&cyw=0`, l'interrupteur que le jeu a déjà). Le jeu, lui, ne change pas.

- **La version du simulateur est écrite partout** : `SIMULATEUR = relief-canyon` (l'ancien s'appelle `avant-relief`), dans chaque note,
  chaque ligne du journal du labo et chaque rejeu. Les rejeux se rejouent dans le simulateur de leur enregistrement ; la boucle ne compare
  que des notes du même simulateur ; `inscrire.js --note` refuse une note d'un autre.
- **L'empreinte témoin ne change pas : `a7b3171768ca` avant comme après.** La course témoin (graine 910000, 150 s, régime max) passe
  par espace > nuages > grotte, jamais par le canyon. Il n'y a donc rien à remplacer dans les commandes « Vérifier » ni dans les textes à coller.
- **La note de départ, elle, change** (le bot de référence, version allégée, 900 s, 20 graines, `ml/bot/results/note-reference-allege.json`) :

  | | avant le relief (gardée : `note-reference-allege-avant-relief.json`) | avec le relief (la nouvelle note de départ) |
  |---|---|---|
  | palier médian | 9 | **8,5** |
  | meilleur palier | 25 | **18** |
  | survie médiane | 157,3 s | **141,1 s** |
  | pièces par minute | 402,5 | **351,7** |
  | causes de fin | vide 11, pic 4, roche 4, tour 1 | vide 8, pic 4, **paroi 3**, roche 3, **rivière 1**, tour 1 |

  Seules les 4 courses qui passent au canyon changent (j'ai relu les deux fichiers : mêmes 20 graines, mêmes réglages). La graine 910222
  tombe du palier 25 au palier 5 (paroi à 76,6 s), 910444 de 20 à 12, 910481 de 13 à 11, 910111 meurt « rivière » au lieu de « vide ».
  **Le « meilleur 25 » d'avant était donc en partie un défaut du simulateur.**
- Au labo : l'ancien bot de référence `c0001` a été renoté dans le nouveau simulateur (`c0002`), une course gardée `c0002-g910444` (mort
  contre une paroi à 196,9 s) ; `c0001-g910444` est marquée « canyon sans relief : pas une course possible dans le vrai jeu ».

### Ce qui est fait et que j'ai contrôlé moi-même ce matin

- **`node ml/bot/verifier.js`** (régime max) : **TOUT PASSE** en 609 s (31 processus neufs, 2 à la fois). **Empreinte de la section 3 :
  `a7b3171768ca`**, égale au témoin écrit dans le fichier, la même dans deux processus. Un cerveau sans profil conduit donc exactement comme avant.
- **`node ml/bot/verifier.js --regime allege`** (lancé pour la première fois) : **TOUT PASSE** en 388 s. L'empreinte de la section 3 y vaut
  `f906ffa945fe` (la même dans deux processus, et la même par la main v2 sans effet au contrôle 10). Le contrôle du témoin (3 bis) **ne juge pas**
  ce régime : le témoin a été relevé en régime max ; le fichier le dit (« ne juge pas ces réglages ») au lieu de le compter comme réussi ou raté.
  Aucun contrôle n'échoue parce qu'il serait écrit pour le régime max. À savoir : plusieurs courses courtes (contrôles 6c hors ville, 12)
  donnent les mêmes empreintes dans les deux régimes, parce que l'allégé ne change rien sur ces bouts de maps ; la ville, elle, change
  (774 images contre 570). Le résultat est gardé dans `ml/bot/results/verifier-allege.json` (le `verifier.json` reste celui du régime max).
- **`node ml/labo/rejouer.js --tout --coeurs 2`** : **5 rejeux exacts sur 5** (4 enregistrés avant le relief, rejoués sans lui, et le nouveau `c0002-g910444`).
- **La boucle à blanc avec un cerveau À PROFIL** (`node boucle.js --a-blanc --tours 1 --candidats 3 --depuis ..\bot\essai-main.js`, 0 €) :
  **elle va au bout**. Le départ est noté et inscrit (`c0001`, profil `6b1cce6c4905`), les 3 variantes sont triées, la meilleure est notée
  en grand puis validée sur 2 graines neuves contre la barre du parent (« TIENT »), la génération est close, « pas de progrès ce tour ».
  À blanc, les variantes sont des jumeaux du parent et les courses ne durent que 40 s : cela prouve la tuyauterie, pas la boucle payante.

### Ce que la relecture a trouvé et corrigé (58 trouvailles confirmées, quatre lots, 25/11)

Des agents ont relu les yeux v2 et les doigts v2, d'autres ont vérifié chaque trouvaille, puis quatre correcteurs ont repris ce qui était
confirmé. Commits `fffa5f5c3` (les yeux), `ef1a73c78` (la main), `b57b79197` (les outils et les documents), `9b1b9a0b4` (le simulateur).
Les chiffres ci-dessous sont ceux des correcteurs ; je n'ai refait moi-même que `verifier.js` (qui contient une partie de ces mesures), les rejeux et la boucle à blanc.

- **Les yeux (le radar)** : le décor de la grotte et de la jade est sondé à chaque image (avant une sur deux : une roche annoncée 1,45 s trop
  tard) ; le saut vu du sol est joué image par image comme la main le fait (24 images de route, NITRO et manche tenus 5 images, la flèche de fin
  de geste) ; `sautRefuse` compte le prix (35 % de la jauge) et l'attente de 0,9 s ; la loi `versRoute` braque dans le bon sens tête en bas.
  Mesures : pas à pas, l'issue à l'image près **41 fois sur 41** (avant 38) ; le saut, issue juste **17 sur 18** (avant 15), la pose annoncée
  0,36 s trop tôt (avant 0,71 s et 45 m) ; en vol, 57 sur 57 comme avant. Contrôles neufs 6g, 8 bis, 8 ter, 8 quater.
- **La main** : plus de coup de volant à contresens (avant, un appui sur quatre partait du mauvais côté pour un ordre doux) ; un geste ne
  s'ouvre plus sur un tapotement de nitro (avant, un geste sur six était lu de travers par le jeu ; maintenant 57 doubles appuis lus sur 57) ;
  la flèche d'en face peut suivre tout de suite (inversion) ; la fin du drift lâche ↓ avant la flèche ; les embardées sortent au taux demandé
  (6,0 par minute pour 6) ; un profil ne peut plus rendre la main plus rapide qu'avant ni écrire un infini ; nouvel ordre `ensuite`. Le compte
  du temps des mesures était faux (0,1 s par échantillon au lieu de 0,11) : **les chiffres des joueurs au clavier sont corrigés : 101,6 coups
  de volant par minute de sol (et non 111,3), 1,24 changement de sens par seconde (et non 1,36)**. Réglée sur eux, la main `clavier` donne
  99,9 coups par minute (−2 %), une durée médiane de 0,20 s contre 0,22 (−9 %), mais **0,89 changement de sens par seconde contre 1,24 (−28 %)**.
- **Le juge** (`discerner.js`) divise l'ondulation par la vitesse : à vitesse égale, **le bot ondule PLUS que les joueurs** (avant, le juge
  disait l'inverse). AUC 0,993 : le bot est reconnu à coup sûr, surtout par ses vols (0,21 décollage par 10 s contre 1,3 chez les joueurs).
- **La boucle** : elle **impose la main du parent** (une variante qui change de profil est perdue avant d'être notée ; `--main-libre` pour
  les étapes D et E), sinon elle aurait pu « monter le palier » en rendant la main machine ou en prenant la seconde chance à chaque mort.
  **Un champion n'est sacré qu'après 20 graines neuves** contre la barre du parent sur ces mêmes graines (`validations.jsonl`), car le palier
  médian bouge de 7 à 12 par le seul hasard des courses. Les morts reprises par la seconde chance ne disparaissent plus de ce que la boucle
  montre à l'API. Un pilote refusé dit pourquoi. Seules des notes du même tmax, du même régime et du même simulateur se comparent.
- **Le simulateur** : le relief du canyon (plus haut) ; une course ne dépend plus des courses d'avant dans un même processus quand on allume
  la NITRO en vol (`loop._nAirT` et une quarantaine de données effacées avant chaque course : 5 maps sur 7 répétables dans un même processus).
- **Les documents** : `rayons` est un tableau (c'est écrit dans `CONSIGNES.md` et le README), `vue.moteur` vaut le palier moins un,
  `justesse.js` n'écrase plus une mesure sans `--force`, `inscrire.js` note à 900 s par défaut, PLAN et BOTS-ML disent le cadre du crédit.
  **`CONSIGNES.md` a changé le 25/11** (ce que la boucle dit du jeu à Claude) : `rayons` en tableau, l'issue `coupe`, `latC`, « la main est
  fixée : ne change pas `profil` ».

### Ce qui a été refusé, et pourquoi

- **Le rayon « viser »** (vers un tronçon en contrebas) : c'est une fonction neuve, pas une prévision fausse ; il lui faudrait son propre budget de calcul. Écrit au README.
- **La pose dans le filet d'un virage comptée comme un raccourci** : la seule correction fidèle change le jeu (l'enregistreur devrait écrire
  ses raccourcis) — interdit ici, à décider par Sacha. « Raccourcis par minute » n'est ni un critère de la boucle ni une mesure du juge.
- **Des lois de la main à 5 points au lieu de 3** : le code et les contrôles lisent les lois par leur rang ; gardées à 3. La forme fine des durées (le pic à 133 ms) n'est donc pas reproduite.
- **Le retard du suivi tiré au hasard** : il reste fixe (150 ms au clavier) : rien ne le mesure chez les joueurs.
- **Un défaut du JEU** : dans le vrai jeu, le travailleur du canyon plante faute de `cyNiveauEau`. On ne touche pas au jeu ici : c'est écrit
  dans `ml/reel/README.md`, **à transmettre au chantier du jeu** (`cyNiveauEau` à ajouter à la liste de `code/maps/canyon-route.js`, ligne 761).
- **La double boucle pendant l'attente du portail** dans le simulateur : décrite, pas corrigée (cela changerait l'empreinte témoin sans preuve que l'autre course soit plus juste).
- **La sauvegarde de départ du bot** (la première partie d'un débutant) : documentée, pas changée — la changer change toutes les courses ; à décider à l'étape D.
- **Le bot de référence garde l'ancienne loi `versRoute`** (sans le cas tête en bas) : la changer changerait sa course, donc la note de départ.

### Ce qui reste faux ou n'est pas mesuré

- **Le pilote reste reconnaissable** : changements de sens −28 % au clavier, −25 % au doigt ; la nitro tenue 15 % du temps contre 60 % chez
  les joueurs ; des vols six fois plus rares. Ce n'est pas la main : c'est la trajectoire du cerveau d'essai. C'est le travail de l'étape C (et D).
- **Les temps de réaction, le retard du suivi, les gestes et l'avance du drift** sont des ordres de grandeur : l'étalon des joueurs n'a que
  10 échantillons par seconde. Le modèle `doigt` n'a eu que 2 tours de réglage, sur 4 parties de Léo.
- **Le radar au canyon** est sondé une image sur huit (la grotte et la jade à chaque image) : 32 vols prévus justes sur 32 et 16 chocs sur 16,
  mais aucune mesure image par image au canyon ; un frôlement de paroi entre deux sondes n'est pas exclu. Une vue en vol au canyon coûte 10 à 20 ms.
- **Avec une main à profil, le radar est une estimation à la première vue d'un vol** (environ 7 fois sur 10 juste ; 49 sur 50 une fois la façon tenue) ; `justesse.js --profil clavier` n'a pas été refait avec les dernières valeurs de la main.
- **Aucun pilote ne se sert encore du radar** : qu'il aide à survivre n'est pas mesuré.
- **Aucun tour payé n'a tourné** : ni le refus « main changée », ni une variante qui bat son parent, ni la validation sur 20 graines n'ont été vus en vrai.
- Dans un même processus, l'espace et la grotte ne sont pas encore répétables : les notes et les rejeux gardent un processus neuf par course.
- La salle de projection n'a pas été essayée dans un navigateur avec la lettre `C` ni avec le relief du canyon.
- Le fichier `ml/labo/cerveaux/c0002-reference.js` a des fins de ligne Windows : son empreinte diffère de `c0001` pour un code identique (sans effet sur les courses).
- `ml/bot/results/note-essai-main-allege-t120-parties.json` (2,9 Mo, les enregistrements de l'essai de la main) reste hors de git : il se refait à l'identique.

**La clé d'API.** Sacha l'a posée (`setx ANTHROPIC_API_KEY`) ; `node essai-api.js` du 24/11 passe pour les quatre modèles. Une session ouverte
avant le `setx` ne voit pas la clé : lancer depuis un terminal neuf.

**Le texte à coller dans la prochaine session :**
> Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (branche `bots-ecurie`), lis `ml/ecurie/ETAPES.md` (la section « Où on en est »),
> `ml/ecurie/PLAN.md`, `ml/ecurie/etude/*.md` et `ml/bot/README.md` (§ 2 à 3.8). L'étape B est faite, le premier pilote de l'étape C existe
> (`ml/ecurie/pilote.js`, main `clavier` ; au tri, médian 12,5 et meilleur 20 sur 12 graines). Fais dans l'ordre, en validant dans git à la
> fin de chaque point et en mettant `ETAPES.md` à jour : (3) la suite de l'étape C : note ce pilote sur 20 graines en
> `--regime allege --tmax 900`, inscris-le au labo (étape `C`, génération 0), puis améliore-le par tours (autopsie des morts, correction,
> note, inscription) sans changer son `profil` ; ce qui le tue d'abord : le canyon ; la note de départ à battre reste celle du bot de
> référence AVEC le relief du canyon : palier médian 8,5, meilleur 18 ; (4) le calibrage de l'étape C bis (10 € : les quatre modèles
> sur le même parent, un nombre égal de variantes), puis la boucle par tranches de 20 €, sans dépasser 200 € au total (`--plafond 200`,
> `node ml/labo/labo.js` donne le cumul) et en étalant la dépense jusqu'au 08/12/2026 (13 à 14 € par jour). Jamais plus de 4 courses à la
> fois. Le contrat à garder : `node ml/bot/verifier.js` passe en entier avec l'empreinte `a7b3171768ca`, `node ml/labo/rejouer.js --tout`
> donne tous les rejeux exacts. Rien dans `code/` ni dans « VERSION PRINCIPALE/ ». Aucun `git push`. Si la limite d'usage du modèle
> bloque des agents, lance-les avec un autre modèle. Ne me pose pas de question.

---

## A — L'étude (faite)

**Ce qui en sort.** `etude/` : neuf rapports (économie, morts, deux sur les maps, vol, conduite, record, bot actuel, vrais joueurs) et
`defauts-confirmes.md` (28 défauts du travail d'avant). `ml/bot/discerner.js` : le juge « humain ou bot ».

**Vérifier.**
```
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\bot
node etalon.js                                   # 14 parties, paliers 1 1 4 5 5 8 11 12 14 15 16 21 22 28
node discerner.js ..\labo\trajectoires           # le bot de référence : reconnu à coup sûr
```

## B — Les fondations (faite le 25/11/2026)

**Ce qui en est sorti.**
1. Les 28 défauts du travail d'avant : 24 corrigés, les autres refusés avec leur raison (`etude/defauts-confirmes.md`).
2. **Les yeux v2** (`ml/bot/yeux.js`, README § 2, 2 bis, 2 ter) : en vol, un radar qui prévoit l'issue (pose, choc contre le décor, jauge
   vide, fond, portail) pour dix façons de piloter ; au sol, la tenue de route, « et si je sortais par le bord ? », les couloirs, le mur,
   la vitesse sûre d'un virage, la ligne parfaite, le saut refusé, l'aimant, le palier.
3. **Les doigts v2** (`ml/bot/doigts.js`, `piloter.js`, README § 3.1 à 3.8) : un `profil` par cerveau — temps de réaction, volant par coups
   de durées tirées, suivi à chaque image, nitro hachée, drift, seconde chance, cinq erreurs ; trois modèles `machine`, `clavier`, `doigt`.
4. La relecture (58 trouvailles confirmées) et leur reprise, puis le contrôle final du 25/11 (voir « Où on en est »).

**Vérifier.**
```
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\bot
node verifier.js                 # TOUT PASSE (environ 10 min), et l'empreinte de la section 3 reste a7b3171768ca (un cerveau sans profil conduit comme avant)
node verifier.js --regime allege # TOUT PASSE (environ 7 min), empreinte f906ffa945fe ; le témoin n'y juge pas (il est relevé en régime max)
node justesse.js --graines 5     # le radar : prévu / arrivé, par map (refait results/justesse-allege.json ; les autres mesures : README § 2 ter, tableau des commandes)
node noter.js essai-main.js --regime allege --coeurs 2 --tmax 120 --graines 8 --parties --sortie results\note-essai-main-allege-t120-parties.json
node appuis.js results\note-essai-main-allege-t120-parties.json --nom essai-main-allege-t120   # la main du bot contre celle des joueurs
cd ..\labo
node rejouer.js --tout --coeurs 2   # 5 rejeux exacts sur 5
```
(`node justesse.js` tout court refuse d'écraser le fichier des 57 vols et donne les bonnes options : c'est voulu.)

## C — Le pilote d'élite

**Ce qui doit en sortir.** `ml/ecurie/pilote.js` : un seul cerveau, réglé par un `profil` (la main `clavier` au départ), qui se sert du
radar. Amélioré par tours : lire ses morts (`node autopsie.js`), corriger, noter sur 20 graines en version allégée
(`--regime allege --tmax 900`). Chaque version entre au labo par `ml/labo/inscrire.js` (étape `C`, une génération par tour), avec sa raison.
La main est fixée pour toute l'étape : la boucle de l'étape C bis refuse une variante qui change de profil.

**Le but, chiffré.** Battre le bot de référence et monter le plus haut possible. Le point de départ, mesuré le 25/11 dans la version
allégée du jeu, **avec le relief du canyon** (20 courses, 15 minutes au plus, `ml/bot/results/note-reference-allege.json`) :
**palier médian 8,5, meilleur 18**, survie médiane 141 s, 352 pièces par minute, nitro tenue 15,5 % du temps. (Avant le relief : 9 et 25,
un chiffre en partie faux.) Les joueurs : médian 11,5, meilleur 28. Le palier 30 demande environ 11 minutes de survie. Attention : le bot
de référence a la main de machine ; avec la main `clavier`, le même cerveau survivait deux fois moins longtemps. Le plafond atteint sera écrit ici, pas promis.

**Vérifier.**
```
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\labo
node inscrire.js ..\ecurie\pilote.js --etape C --generation 0 --modele main --regime allege --tmax 900 --raison "…"
node clore.js --etape C --generation 0 --critere palier_median
node inscrire.js --valider c00NN  # le champion, sur 20 graines qu'aucun cerveau n'a vues
node labo.js                     # les générations de l'étape C, leur champion
node arbre.js                    # puis ouvrir arbre.html : la lignée, la raison de chaque changement
```

**Pour lancer cette étape dans une autre session**, coller le texte de « Où on en est » (il commence par l'étape C).

## C bis — La boucle automatique sur le crédit API (les 200 €)

**C'est la méthode du plan, et c'est à ça que servent les crédits.** Claude écrit des variantes du pilote (un appel payant chacune),
le vrai jeu les note, on garde la meilleure, on recommence. L'abonnement a une limite d'usage et demande une session ouverte ; la boucle
tourne seule, la nuit.

**Ce qui existe.** `ml/ecurie/boucle.js`, `ml/ecurie/CONSIGNES.md` (ce que la boucle dit du jeu à Claude avant chaque variante),
`ml/ecurie/lecture.js`, `essai-api.js`.
- **Essayée à blanc** : un tour complet le 24/11 (bot de référence, 3 variantes, 0 €), refait le 25/11 avec un cerveau à profil
  (`essai-main.js`) après la relecture : départ noté, variantes triées, la meilleure notée puis validée sur graines neuves, génération close.
- **La clé d'API est acceptée** par les quatre modèles (`essai-api.js`, 24/11) : Opus 5.5, Sonnet 5.5 et Fable 5.2 avec repli, Haiku 5.5 sans.
- **Un plafond général de 200 €** lu au journal des dépenses du labo, toutes étapes réunies (`--plafond`, 200 par défaut, commit `71f3c7bea`) :
  le budget d'un lancement est raboté à ce qu'il reste ; une variante payée dont l'inscription est refusée reste comptée.
- **Depuis la relecture (25/11)** : la main du parent est imposée (`--main-libre` pour D et E) ; un champion n'est sacré qu'après 20 graines
  neuves contre la barre du parent (`validations.jsonl`) ; seules des notes du même tmax, du même régime et du même simulateur se comparent.
- **Pas encore fait** : aucun tour payé.

**Un tour.** Le parent est le meilleur pilote validé de l'étape. Ses trois pires courses sont racontées (autopsie, chaque mort comprise,
même reprise par la seconde chance). Six variantes sont demandées, chacune sous un angle différent (survie en vol, vitesse avant les
virages, ligne parfaite, fil des pièces, la map qui tue, voler comme un joueur…). Chacune est triée sur 6 graines ; celles qui tiennent
la barre du parent sont notées sur 20 ; celle qui le bat est validée sur 20 graines neuves. Toutes sont inscrites au labo avec leur
raison et **leur coût**. La génération est close, l'arbre refait, le labo validé dans git.

**Le temps que ça prend (mesuré le 24/11).** Le simulateur joue environ **2,5 fois plus vite que le temps réel par processus** (356 s de
jeu en 96 s, deux courses à la fois). Une course de 900 s prend donc **5 à 6 minutes**, et **un tour de boucle** (6 variantes triées,
les promues notées sur 20 graines) **30 à 100 minutes** à 4 courses à la fois, selon combien de variantes sont promues et combien de
temps elles survivent. **Le frein n'est pas l'argent, c'est le PC.**

**Les 200 €, répartis.** Décision de Sacha du 24/11 : **les 200 € s'étalent sur deux semaines, jusqu'au 08/12/2026, soit 13 à 14 € par jour.**

| Poste | Budget | À quoi |
|---|---|---|
| Calibrage | 10 € | les quatre modèles (Haiku 5.5, Sonnet 5.5, Opus 5.5, Fable 5.2) sur **le même parent** et **le même nombre de variantes** : lequel gagne le plus de paliers par euro |
| Le pilote d'élite (étape C) | 90 € | monter le plafond le plus haut possible |
| Le facteur humain et les 30 niveaux (étapes D et E) | 60 € | des profils que le juge ne distingue pas des joueurs, à chaque palier |
| Le récit (journal de bord, bêtisier commenté) | 15 € | pour le portfolio |
| Réserve | 25 € | |

Prix relevés le 03/11/2026, en dollars par million de jetons lus / écrits : Haiku 5.5 0,10 / 0,50 · Sonnet 5.5 2 / 10 · Opus 5.5 4 / 20 ·
Fable 5.2 8 / 40. Une variante coûte de l'ordre de 0,30 € avec Opus 5.5. La boucle compte 1 € pour 1 $ et affiche une **estimation** :
la facture de la console fait foi.

**Les garde-fous.** `--budget` est obligatoire (sauf `--a-blanc`) : la boucle s'arrête avant de le dépasser ; `--plafond` borne tous les
lancements réunis. `--a-blanc` fait tout sauf l'appel payant, dans un labo jetable (`ml/labo/tampon/a-blanc/…`). La clé se lit dans
l'environnement (`ANTHROPIC_API_KEY`) et n'est écrite nulle part. Hors de ce cadre (les 200 € de l'écurie), pas un euro sans l'accord de Sacha.

**Ce que Sacha a fait, une fois** (dans PowerShell, puis rouvrir le terminal) :
```
setx ANTHROPIC_API_KEY "sa-clé"        # la clé se crée sur console.anthropic.com → API keys
```

**Vérifier, puis lancer.**
```
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie
node boucle.js --a-blanc --tours 1 --candidats 3 --depuis ..\bot\essai-main.js   # un tour complet sans rien dépenser (≈ 5 min)
node boucle.js --budget 10 --tours 3 --modele claude-opus-5-5 --depuis pilote.js   # un vrai lancement, plafonné à 10 €
node ..\labo\labo.js                                                  # les euros dépensés, par étape
```

**Pour lancer cette étape dans une autre session**, coller le texte de « Où on en est » (points 3 et 4) : la boucle suppose que le
pilote de l'étape C existe.

## D — Le facteur humain et les 30 niveaux

**Ce qui doit en sortir.** `ml/ecurie/profils/` : au moins un profil par palier de record, de 1 à 30 (ou jusqu'au plafond de l'étape C),
réglés par la mesure. Le niveau N est le profil dont le **meilleur palier sur 20 parties** vaut N. Le rythme de ramassage reste celui
d'un humain (≈ 420 pièces par minute) ; c'est la survie, le temps de réaction et les erreurs qui changent. `ml/ecurie/echelle.json` :
pour chaque niveau, le profil, sa distribution de paliers, ses causes de fin. À décider ici : la sauvegarde de départ du bot (aujourd'hui
la première partie d'un débutant).

**Vérifier.** `node ml/ecurie/echelle.js` affiche le tableau des 30 niveaux : palier visé, médiane, record, nombre de parties.

**Pour lancer cette étape dans une autre session**, coller :
> Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (branche `bots-ecurie`), lis `ml/ecurie/ETAPES.md`, `PLAN.md` et `etude/humains.md`,
> puis fais l'étape D : à partir du pilote de l'étape C, fabrique les profils des paliers 1 à 30 en réglant la survie, le temps de
> réaction et les erreurs (pas le rythme de ramassage), mesure chacun sur 20 graines en `--regime allege --tmax 900`, écris
> `ml/ecurie/echelle.json` et l'outil `echelle.js`, mets à jour `ETAPES.md`, et valide dans git. Ne me pose pas de question.

## E — Le juge, niveau par niveau

**Ce qui doit en sortir.** Chaque niveau passé devant `ml/bot/discerner.js`, contre les parties des joueurs. Un tableau : niveau, AUC,
verdict, la mesure qui trahit le plus. Les profils sont corrigés tant qu'une mesure reste à plus de 1,5 écart-type des joueurs.

**La limite à écrire à chaque fois.** 14 parties de 2 joueurs, aucune de débutant : pour les niveaux bas, c'est une extrapolation.
Plus Sacha et Léo (et d'autres) enregistrent de parties, plus le juge vaut quelque chose. Non vérifié : « hauteur max » et « pièces par
seconde » dépendent-elles aussi de la vitesse, comme l'ondulation ?

## F — Le paquet du matchmaking et le portfolio

**Ce qui doit en sortir.**
- `ml/ecurie/paquet/` : pour chaque palier, ses pilotes, leurs chiffres, et des courses toutes prêtes (rejeux et trajectoires) qu'un
  jeu pourrait rejouer en fantôme. Brancher ces fantômes dans le jeu est un changement du jeu : à décider par Sacha.
- `ml/labo/jalons/ecurie/` : l'arbre, un film par niveau marquant (salle de projection), la courbe « palier par niveau », dix lignes de bilan.
