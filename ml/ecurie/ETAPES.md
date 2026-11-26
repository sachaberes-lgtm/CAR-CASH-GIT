# L'écurie — les étapes, une par une

Chaque étape se ferme par **un commit** sur la branche `bots-ecurie` (dossier `C:\Users\sacha\code\CASH-CAR-bots-ecurie`).
Pour chacune : ce qui en sort, **comment vérifier**, et **le texte à coller dans une autre session** pour lancer la suivante.
Le plan d'ensemble est dans `PLAN.md`, l'étude dans `etude/`.

> ⚠ Toujours travailler dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie`, jamais dans `CAR-CASH-GIT` (d'autres sessions y changent de branche).
> Vérifier la branche avant un commit : `git branch --show-current` doit répondre `bots-ecurie`.

| # | Étape | État |
|---|---|---|
| A | L'étude : ce qui donne des pièces, ce qui tue, les vrais joueurs mesurés | **faite** (commit `67ea1f009`) |
| B | Les fondations : défauts corrigés, yeux v2, doigts v2 | **faite** (25/11/2026) : défauts corrigés, yeux v2 et doigts v2 écrits, relus par des agents, corrigés, puis contrôlés une dernière fois (`verifier.js` TOUT PASSE en régime max et en régime allégé, 5 rejeux exacts sur 5, la boucle à blanc va au bout avec un cerveau à profil) ; **finitions du 25/11 au soir** : le radar sonde le canyon à chaque image (exact, +0,2 % de coût), la justesse refaite avec la main réglée, les fins de ligne du labo. Ce qui reste faux ou non mesuré est écrit plus bas : ce sont des limites connues, pas des oublis |
| C | Le pilote d'élite, amélioré par tours | **commencée (25/11/2026) : le premier pilote existe** (`ml/ecurie/pilote.js`, main `clavier`). Au tri (12 graines, 600 s, allégé) : **palier médian 12,5, meilleur 20**, contre 6 et 17 pour le bot de référence sur les mêmes graines. **Contrôlé le 25/11 au soir** (aucune erreur ; sur 8 graines de 600 s : médian 11,5 et meilleur 18, contre 7 et 16). **Pas encore fait** (le travail de la chaîne) : la note de 20 graines de 900 s, l'inscription au labo, les tours payés de la boucle |
| C bis | La boucle automatique sur le crédit API (les 200 €), avec un plafond de dépense | **prête, essayée à blanc** : un tour complet le 24/11 puis de nouveau le 25/11 avec un cerveau à profil (0 €) ; la clé d'API est acceptée par les quatre modèles (`essai-api.js` du 24/11 : Opus 5.5, Sonnet 5.5 et Fable 5.2 avec repli, Haiku 5.5 sans) ; `boucle.js` a un plafond général de 200 € lu au journal des dépenses (`--plafond`, commit `71f3c7bea`). **Calibrée le 25/11** : un tour de 6 variantes par modèle sur le même pilote (4,63 €) ; aucun palier gagné validé, écart entre modèles dans le bruit ; **choix : Sonnet 5.5, départ `pilote.js`** (`agents/choix.json`, détails dans la partie C bis) |
| D | Le facteur humain et les 30 niveaux | à faire |
| E | Le juge, niveau par niveau | à faire |
| F | Le paquet du matchmaking et le dossier du portfolio | à faire |

---

## OÙ ON EN EST — à lire en premier (25/11/2026 : l'étape B est finie, le premier pilote est contrôlé, la chaîne tourne)

### L'étape C, deuxième temps : le pilote qui vole (26/11/2026)

**La demande de Sacha (26/11)** : « ils conduisent bien mais ils sont encore trop frileux de s'envoler et de faire des figures dans les airs ; pour plus de
réalisme il faut qu'ils puissent utiliser toutes les figures du jeu ; parfois ils n'osent pas prendre des raccourcis évidents », puis « lance une
enquête : tous les éléments à ajouter aux bots pour simuler de vrais joueurs ». La boucle par tranches n'a pas été relancée : elle ne note que le palier.

**Ce qui existe maintenant.**
- `ml/bot/voltige.js` : les vols un par un, joueurs et bots comptés pareil. Les joueurs au clavier : 8,5 vols par minute, 94 % par le bord, 43 % des
  poses sont des raccourcis (3,5 par minute, 413 m en médiane, sur toutes les cartes), 2,8 figures lancées par minute, toutes en vol, 4,3 % de morts par vol.
- **Le rayon `viser`** (`ml/bot/yeux.js`, README § 2 bis) : un raccourci de joueur est un plongeon vers un morceau de piste plus loin et plus bas ; le
  radar ne savait pas dire s'il se pose. Il propose maintenant des cibles (`ciblesDe`), joue le vol vers elles avec les lois du jeu (`viser`,
  `viserPlane`, en vol et depuis le bord), et donne la loi à suivre (`vue.vol.cible`, l'ordre `cible`).
- **Le garage** (`module.exports.garage`, README § 1) : un pilote s'équipe de n'importe laquelle des 12 figures du jeu (essayé : rodéo, chandelle,
  hélico lancés dans une course, rejeu exact) ; la boucle le fixe comme la main.
- **L'enquête** `etude/realisme.md` (une session à part) : 26 écarts mesurés, le juge mis à l'épreuve, 28 parties à enregistrer.
- **`ml/ecurie/pilote-voltige.js`** : `pilote.js` (même main) plus — au sol, s'engager volant à fond vers le bord quand un rayon du sol promet deux vues de
  suite une pose propre plus loin sur la piste (120 m de chute au plus, 3,6 s de vol au plus) ; en vol, tenir sa cible avec patience ; une figure quand
  la pose est à plus de 2,2 s (la direction du geste est celle que le vol tient déjà) ; sortir du dessous de la dalle après 0,8 s.

**Ses chiffres** (20 graines × 900 s, allégé, `ml/bot/results/note-pilote-voltige-allege.json` ; `pilote.js` : sa note du labo c0003 et
`agents/tmp-voltige/note-pilote-v1.json`, 12 × 600 s ; les joueurs : `node voltige.js`) :

| | `pilote.js` | `pilote-voltige.js` | les joueurs au clavier |
|---|---|---|---|
| palier médian · record | 11 · 20 | **9,5 · 21** | 10 · 28 |
| raccourcis par minute (gain médian) | 0,24 (228 m) | **0,71 (749 m)** | 3,49 (413 m) |
| figures lancées par minute · vols à figure | 0 · 0 % | **0,59 · 8,7 %** | 2,79 · 17,6 % |
| vols par minute · durée médiane · hauteur médiane | 5,2 · 1,28 s · 0 m | 5,3 · **1,82 s · 4 m** | 8,5 · 2,27 s · 38 m |
| sous la dalle (part du sol) | 29 % | **14 %** | 3 % |
| morts par vol | 8,1 % | 8,1 % | 4,3 % |
| pièces par minute · nitro tenue | 327 · 29 % | 286 · 30 % | 436 · 61 % |
| le juge (`discerner.js`, AUC) | 0,974 | **0,97** | — |

Les plongeons voulus, comptés à part sur 4 lots de 12 courses de 300 s (`agents/tmp-voltige/lot-pH3*.txt`, `lot-p2f*.txt`) : 67 engagés, 4 morts (6 %).

**Ce que les essais ont appris** (chacun mesuré sur les mêmes 12 graines, `agents/tmp-voltige/lot-*.txt`) :
- un plongeon de 300 à 350 m porte la caisse à 300 m/s : elle traverse l'axe visé sans pouvoir s'y aligner (d'où `raccChute` 120 m) ;
- une figure lancée pendant un plongeon le dérègle (le geste tient sa flèche 0,27 s et tape deux fois la NITRO) : 5 morts sur 23 avec une direction
  en alternance, 2 sur 12 avec une figure dès 1,7 s de marge, 0 sur 12 à 2,2 s ;
- à la **grotte** (4 sorties sur 4 contre la roche), au **canyon** et sur la **jade** (3 sur 4), l'annonce du rayon du sol est fausse : sorties voulues
  interdites là (`raccCartes`), alors que les joueurs y coupent 4 à 5 fois par minute ;
- en vol **subi**, basculer vers un rayon `viser` tue (interdit) ; un engagement abandonné à moins de 0,5 s du bord fait sortir en travers (on ne renonce plus) ;
- éviter de se poser **sous** la dalle coûte de la survie : 25 points de pénalité → 12 % du sol dessous mais 2 paliers de moins ; 10 points → 10 à 15 %, 1 palier ;
- ouvrir les cibles à hauteur égale ou plus hautes (les vols des joueurs **montent** de 38 m) avec nitro à l'engagement : 3 morts sur 10, retiré
  (`agents/tmp-voltige/yeux-haut.js` garde l'essai).

**La suite du 26/11 au soir : la nitro, le slalom, et la boucle qui note la ressemblance.**
- **La nitro** (`agents/tmp-voltige/bilan-N*.txt`, `bilan-F*.txt`) : la jauge du pilote n'est **jamais vide** — c'est lui qui ne demande la nitro que 30 %
  du sol. La demander plus coûte de la survie : 38 % du temps → palier médian 8 à 8,5 (au lieu de 9,5) ; 53 % → 7. Partir « vers la route, réacteur
  allumé » à chaque vol subi : 7 aussi. Rien de gardé : c'est le choix de l'endroit qui manque, pas l'envie.
- **Le slalom** (`pS.js`) : faire osciller la ligne visée de ± 4,5 m ne change pas le rythme (un aller reste à 0,99 s contre 0,58 s chez les joueurs :
  c'est la main qui le fixe) et coûte un palier et demi. Abandonné ; c'est un réglage de la main (étape D, `--main-libre`).
- **Le départ et les portails** (gardés, `mes-pD-930000.json`, `mes-pP.json`) : le pilote file droit 1,5 à 5,5 s au départ (un temps tiré de la piste ;
  les joueurs donnent leur premier coup de volant à 3,8 s, le pilote le donnait à 0,5 s) et sort par le bord pour passer le portail en vol quand un rayon
  du sol l'annonce : **13 portails sur 23 en vol** (les joueurs 56 %), contre 10 sur 23, sans perte de palier (médian 9 des deux côtés sur 12 courses).
- **La grotte rouverte, pour voir** (`lot-pGr.txt`, `lot-pGr-neuves.txt`, 24 courses) : avec les règles d'aujourd'hui (promesse tenue deux vues, 120 m
  de chute au plus), 24 plongeons voulus à la grotte, 2 morts (8 %) — ce n'est plus « 4 sur 4 » ; les sorties voulues doublent (1,1 à 1,3 par minute,
  0,83 à 0,90 raccourci par minute) mais le palier médian baisse d'un palier à un palier et demi (8 et 5, contre 9 et 6,5). **Laissée fermée** dans le
  pilote validé : c'est un arbitrage palier contre ressemblance, donc l'affaire de la boucle (`raccCartes`, une ligne à changer).
- **`ml/bot/ressemblance.js` : l'écart aux joueurs.** L'AUC du juge reste à 0,97 quoi qu'on corrige ; il fallait un nombre qui bouge à chaque pas. L'écart
  est la distance moyenne aux joueurs au clavier sur quinze mesures (nitro, vols, raccourcis, figures, poses, dessous, slalom, vitesse), en écarts-types
  d'une partie à l'autre. `pilote.js` : **2,67** ; `pilote-voltige.js` : **2,33** ; une partie de joueur contre les autres : 0,9. (Chaque mesure était alors bornée à 4 écarts-types ; depuis le soir du 26/11 la borne est à 8 : 3,05 et 2,54 — voir « Le soir du 26/11 ».)
- **La boucle note « palier ET ressemblance »** (`boucle.js --critere mixte` : mixte = palier médian − 6 × écart ; chaque note porte `ecart_joueurs` et
  `ecart_detail`, que Claude lit avec la note du parent ; huit angles neufs tirés du plan de l'enquête ; `CONSIGNES.md` dit le nouveau but, le tableau
  des joueurs et ce qui a déjà été essayé). Essayée à blanc le 26/11 (0 €) : elle va au bout. La chaîne relit `agents/choix.json` à chaque tranche :
  Sonnet 5.5, départ `pilote-voltige.js`, étape du labo **C2**, critère mixte. **Elle n'est pas lancée** (une dépense : à déclencher par Sacha).

**Ce qui n'est pas fait, et ce que ça dit.** Le juge ne bouge pas (0,97) : comme l'enquête l'annonçait, les vols et les figures ne suffisent pas. Ce qui
trahit le plus reste l'ondulation du slalom (z +4), la nitro (30 % contre 63 %), la part du temps en l'air (17 % contre 28 %), la hauteur des vols. Les
raccourcis restent cinq fois trop rares (trois cartes sur six interdites), les figures cinq fois. `pilote.js` n'est pas remplacé : `pilote-voltige.js`
est un palier et demi plus bas en médiane (dans le bruit de 20 courses, mais dans le même sens sur trois mesures).
`verifier.js` TOUT PASSE (604 s, empreinte `a7b3171768ca`) après les changements des yeux ; 34 rejeux exacts sur 34 (refaits après le dernier réglage des cibles).

### Le soir du 26/11 : le pilote ne se cache plus sous la dalle

**Ce qui a été mesuré** (outils jetables `agents/tmp-voltige/` : `dessous.js`, `dessous-sortie.js`, `dessous-vues.js`, sur les parties des joueurs et sur des lots de 12 courses de 300 s) :

| Sous la dalle | Joueurs au clavier | Pilote d'avant | Pilote du soir |
|---|---|---|---|
| part du sol | 3,2 % | 16,4 % (18,7 % sur graines neuves) | **2,3 %** |
| passages par minute | 0,8 | 1,4 | 0,8 |
| durée d'un passage : médiane · le plus long | 1,1 s · 4,4 s | 3,5 s · 66 s | **1,5 s · 4,4 s** |
| comment on en sort | au bord tout de suite ; 15 retours dessus sur 19 | il part vers le bord, renonce, recommence | au bord tout de suite ; 21 retours dessus sur 35 |

Un joueur posé sous la dalle file au bord dans la seconde : la caisse fait le tour de la dalle et retombe dessus, presque sans volant. Le pilote, lui,
y restait : sur quatre maps (canyon, grotte, jade, ville) la sortie lui était interdite ; ailleurs il attendait qu'un rayon du sol promette une pose,
or ce rayon dit « air » une vue sur deux (la loi « vers la route » jouée depuis le dessous annonce 5 à 6 s de vol, il en faut 2 à 4 en vrai) : il
s'engageait, renonçait, recommençait — 90 % de son temps dessous venait de passages de plus de 5 s.

**Ce qui est adopté dans `pilote-voltige.js`** : `dessousAveugle` (après 0,8 s dessous, au bord sans attendre de promesse, et sans y renoncer),
`dessousDecor:1` (sur les maps à décor : seulement si un rayon de ce côté sauve), `dessousFuir` (en vol, une façon tenue qui mène SOUS la dalle se
quitte dès qu'un autre rayon promet une pose propre dessus) et `dessousPose:25` (une pose dessous perd 25 points au lieu de 10).

**Ce que ça donne, et ce que ça coûte** (`ml/bot/results/note-pilote-voltige-allege.json`, 20 courses de 900 s, mêmes graines que l'après-midi) :
dessous 14,0 % → **2,3 %** ; écart aux joueurs 2,54 → **2,02** ; mais palier médian 9,5 → **7**, record 21 → 14, survie médiane 164 → 125 s. Sur deux
lots de 12 courses de 300 s (graines 910000… et 930000…) : somme des paliers 208 → 163, dans les sept variantes essayées. **Le dessous était un abri** :
le pilote y roulait un sixième du temps sans bord à tenir ; l'en sortir l'expose, et chaque sortie est un vol (5 morts sur 53 sorties sur les mêmes
graines, 4 à 5 sur 25 sur les neuves ; les joueurs : 3 sur 22). Gardé quand même : une caisse à l'envers sous la route pendant une minute est ce qui
trahit le plus un bot, et ce n'est pas un niveau de jeu.

**La note de ressemblance corrigée** (`ml/bot/ressemblance.js`, `BORNE` 4 → 8). À 4, se cacher sous la dalle (z +7,7) ne coûtait pas plus qu'un écart
de 4 : le critère mixte de la boucle préférait la cachette (3 paliers contre 0,25 d'écart) et l'aurait retrouvée. À 8 : `pilote.js` **3,05**,
le pilote de l'après-midi **2,54**, celui du soir **2,02**, une partie de joueur contre les autres 0,91 (inchangé). Mixte : −5,7 l'après-midi, −5,1 le soir.

**Essayé le même soir, pas gardé** (12 courses chacun, mêmes graines ; `faire-pU.js`, `faire-pT.js`, `faire-tard.js`, `faire-pW.js`) :
- tenir la nitro pendant la sortie du dessous : plus de retours dessous (22 sur 55) et de morts (6) ;
- **des coups de nitro en vol** (une ou deux vues de réacteur quand la façon tenue et sa jumelle « réacteur tenu » se posent toutes deux) : palier médian
  5 au lieu de 8, survie 92 s au lieu de 145, les morts « jauge vide » doublent — le coup ajoute 100 à 250 km/h, la caisse dépasse la route ;
- quitter une façon dont la pose est promise dans plus de 3 s (ou 2,2 s) pour un rayon qui se pose plus tôt : rien de net ;
- sortir du dessous en biais doux (cap 0,18 à 0,45 rad au lieu du plein volant) : une sortie sur deux retombe dessous (13 sur 28, 20 sur 38).

**Ce que les joueurs font en vol, mesuré ce soir et pas encore imité** (`vols-humains.js`, `par-carte.js`, `morts.js`, `vol-mort.js`) :
- 183 vols de plus de 1,5 s : **2,63 allumages du réacteur par vol** (un vol sur 25 seulement sans nitro), nitro déjà allumée au décollage 67 fois sur
  100, souvent rallumée dans la dernière demi-seconde avant la pose. Chaque allumage est un « coup » du jeu (46 × la poussée, un par allumage, 0,5 s au
  moins entre deux). Le pilote : 0,86 allumage par vol, 47 % de vols sans nitro, 7 % au décollage. Pour l'imiter sans mourir il faut un rayon « coup »
  dans les yeux (allumage bref, puis la loi sans nitro) : le rayon « réacteur tenu » ne dit pas où mène un coup ;
- carte par carte, les joueurs roulent à **590 à 700 km/h** au sol, nitro tenue 72 à 78 % partout, 8 à 10 vols par minute (3 au canyon), 0 à 6 % de
  morts par vol (20 % au canyon). Le pilote : 390 à 460 km/h, 2,7 à 8,5 vols par minute, 17 % de morts par vol à la ville, 13 % sur la jade, 57 % au
  canyon. **Les joueurs ne tiennent pas mieux la route : ils en sortent deux fois plus et se reposent deux fois mieux** ;
- **toutes** les morts du pilote arrivent en vol après une sortie par le bord ; dans la grande note du soir, 12 sur 20 sont des vols de 5 à 6 s qui ne
  se posent jamais (« air » 8, « vide » 4) : la loi « vers la route » tourne autour de la dalle, 50 m au-dessus, d'un côté puis de l'autre, en
  promettant à chaque vue une pose deux secondes plus tard (nuages 910185). C'est le prochain chantier, avant la nitro ;
- canyon 910111 (la même mort dans toutes les variantes) : après 1,8 s de vol la caisse se pose à 53° de travers, retraverse la route en 0,3 s et
  finit dans la paroi — une pose « propre » pour le jeu (il tolère 55°), que le sol ne peut pas rattraper.

### La fin de soirée du 26/11 : la loi « vers la route » du pilote, corrigée — les paliers perdus sont regagnés

**Le compte des vols par durée** (`vols-longs.js`, grande note du soir) : un vol de plus de 5 s parti du dessus tuait le pilote **9 fois sur 21** ; les
joueurs, 1 fois sur 11 (et ils en ont trois fois moins). Deux défauts, lus vue par vue (`vol-mort.js`) :
- **nuages 910074** : la caisse passe sous le niveau de la dalle, se retrouve à 1,63 rad de l'axe de la route — et la loi ne braque plus (elle ne braque
  que sous 1,6 rad) : 6 s tout droit, perpendiculaire à la route, réacteur allumé, jusqu'à la jauge vide. Tous les rayons disent « air » : rien ne la réveille ;
- **nuages 910185, jade, ville** : la loi braque sur l'écart et l'axe du MOMENT, la main obéit 0,2 à 0,35 s plus tard ; à 600 km/h la caisse a déjà
  retraversé la route : elle oscille à ± 100 m de part et d'autre de la dalle, volant à fond d'un côté puis de l'autre, jusqu'à la fin de l'air (les
  joueurs, dans leurs vols longs, ne touchent presque pas au volant).

**Adopté** (`pilote-voltige.js`, la loi du PILOTE seulement ; celle des rayons, dans les yeux, n'a pas changé) : `volDemiTour` (la loi braque aussi
au-delà de 1,6 rad) et `volAvance:.25` (la loi est appliquée à l'écart et à l'axe qu'on aura dans 0,25 s, mesurés d'une vue à l'autre).

| 24 courses de 300 s (graines 910000… et 930000…) | somme des paliers | morts pour 100 vols |
|---|---|---|
| le pilote du soir (sorti du dessous) | 163 | 13,9 · 15,3 |
| + la loi braque au-delà de 1,6 rad | 167 | 8,5 · 15,3 |
| + le cap visé selon la vitesse (`volRetour:.8`) | 186 | 8,5 · 9,7 |
| + `volRetour:.8` et avance 0,2 s | 192 | 11,4 · 8,2 |
| **+ avance 0,25 s (gardé)** | **193** | **8,7 · 8,1** |
| + avance 0,15 s · avance 0,35 s | 180 · 185 | 11,5 · 9,2 — 9,6 · 10,6 |
| (le pilote de l'après-midi, caché sous la dalle) | 208 | 7,5 · 9,0 |

**La grande note** (`ml/bot/results/note-pilote-voltige-allege.json`, 20 courses de 900 s) : palier médian **8,5**, record **19** (le soir 7 et 14 ;
l'après-midi, caché sous la dalle, 9,5 et 21 ; les joueurs 10 et 28) ; survie médiane 153 s (125) ; **8,3 morts pour 100 vols** (12) ; 5,2 vols par minute
(4,1 ; joueurs 7,9) ; 21 % du temps en l'air (17,6 ; joueurs 31) ; **24 portails sur 36 passés en vol** (11 sur 26 ; joueurs 56 %) ; 0,97 figure lancée
par minute (0,71) ; sous la dalle 3,5 % du sol ; écart aux joueurs **2,00** ; mixte **−3,5** (−5,1 le soir, −5,7 l'après-midi).

**Ce qui tue maintenant** : 10 des 20 morts arrivent **dans la seconde qui suit une sortie de route**, contre le décor (roche 9, pic 3, eau 2 ; la
grotte : 12 morts sur 61 vols). Deux formes (`morts-courtes.js`) : la pose trop en travers (0,5 à 1 rad : la caisse retraverse la route en une
demi-seconde et ressort de l'autre côté), et un zigzag au sol qui s'amplifie vers 550 km/h (± 20 m, volant à fond) jusqu'au bord. C'est le chantier suivant.

### Les finitions de l'étape B et le contrôle du premier pilote (25/11/2026, soir)

Fait par une session payée sur la clé d'API (le relais `relais.js`, agent « finitions-b », Opus 5.5), entre le premier pilote et le calibrage.
Rien n'a changé dans `code/` ni dans « VERSION PRINCIPALE/ ».

**1. Le radar sonde le canyon à chaque image, comme le jeu juge le choc** (`boucle-3-physique.js` appelle `canyonHeurt` à chaque image de vol ;
avant, `yeux.js` le sondait une image sur huit). Sonde par sonde, c'était trop cher : une sonde coûte 134 µs, dont 115 pour le terrain (cinq
`cyHauteur`). D'où **la borne du relief** (`borneCanyon`, `yeux.js`) : une borne haute de la hauteur du terrain, lue dans les grilles du jeu
d'après le texte de `cyHauteur` ; au-dessus d'elle le terrain ne peut pas toucher et seuls les ouvrages sont appelés (5 µs), sinon `canyonHeurt`
entier. La réponse est donc celle du jeu, image par image.
- **Exact** : 0 écart sur 1,3 million de points tirés autour de 5 canyons (graines 910000, 910037, 910111, 910222, 910481 ; 56 % des points
  dispensés du terrain ; l'outil, jetable, est hors git : `ml/ecurie/agents/tmp-pilote/bench-borne.js`). Une signature des textes du jeu
  (`canyonHeurt`, `cyHauteur`, `cyButtesH`, `cyNiveauEau`, `cyBil`, `cyNz`, `JH`) éteint la borne et s'inscrit dans `__YEUX.manque` si une mise à
  jour du jeu les change (`verifier.js` exige `manque` vide ; la nouvelle signature se lit par `__YEUX.signatureCanyon()`).
- **Le coût d'une course entière au canyon** (8 graines imposées au canyon, 150 s, allégé, les mêmes courses avant et après ; temps de boucle, sans
  la construction de la piste) : sonde par sonde, **+18 %** pour le pilote (la vue en vol de 18 à 125 ms) et +5,3 % pour le bot de référence ;
  avec la borne, **+0,2 %** pour le pilote (yeux 5,2 → 5,4 s sur 83 s) et **+0,5 %** pour la référence (8,9 → 10,2 s sur 278 s). Sous les +10 % demandés.
- **Pas à pas au canyon** (`node justesse.js --cartes canyon --pas --graines 16`, sortie `results/justesse-allege-pas-canyon.json` — à part pour ne
  pas écraser les 44 vols de `justesse-allege-pas.json`) : 20 vols, **les places au centimètre 20 sur 20** (écart au pire 0 m), **l'issue à
  l'image près 18 sur 18**.
- `justesse.js` et `verifier.js` (contrôle 8 bis) comptent maintenant le canyon dans « le décor est sondé à chaque image ».
- La course d'un cerveau sans profil ne change pas (les yeux ne font que lire). Les 8 courses du pilote sur les graines de la note sont **les mêmes au
  bit près** qu'avant le changement (même empreinte, graine par graine), comme les 8 du bot de référence.

**2. La justesse avec la main réglée** (`node justesse.js --profil clavier --graines 5`, 6 maps × 5 graines, 55 vols ; README § 2 ter) :
l'issue juste **50 fois sur 55 à la première vue du vol** (le 24/11 : 36 sur 50), **55 sur 55 dès que les doigts tiennent la façon**, **41 sur 43
une seconde avant la fin** ; au canyon 8 sur 8 aux trois moments ; le vol qui suit un saut 14 sur 20 (avant 14 sur 26). Avec une main à profil, la
première vue reste une estimation (9 fois sur 10).

**3. Le labo : les fins de ligne de `c0002`.** La cause : Git (`core.autocrlf=true` sur ce PC) rendait les copies de `ml/labo/cerveaux/` en CRLF et
les rangeait en LF — le fichier de `c0001` ne correspondait plus à son empreinte ici, celui de `c0002` ne l'aurait plus ailleurs. Corrigé :
`.gitattributes` porte `ml/labo/cerveaux/*.js -text`, `c0001` est rangé avec ses octets LF (`fec3305d`), `c0002` avec ses octets CRLF (`a4d1eb92`).
La ligne du journal de `c0002` (`jumeau` vide pour le même code que `c0001`) n'est pas réécrite (aucun outil du labo ne le fait) : la différence
est écrite dans `ml/labo/README.md` (§ 2).

**4. Le premier pilote, contrôlé sans le réécrire.** `ml/ecurie/pilote.js` lu en entier contre la vue réelle :
- **les champs existent et sont lus comme il faut** : `route` (tableau `{d, virage}`), `lacetRoute` / `lacetMax`, `virage.d` / `marge`, `tenue.tient` /
  `cote`, `couloirs` (`d0`, `d1`), `mur.ici`, `flaques`, `ligne.objets`, `piecesDevant` et `orbes` par `latC` (le miroir sous la dalle est évité),
  `vol.proche` (`envers` compris), `vol.air.reste` ; **`rayons` est cherché par son nom dans le tableau** (`find(x => x.m === …)`) ; `vue.carte` vaut bien
  `canyon`, `grotte`, `jade`, `ville` (vérifié dans le jeu) ; positif à gauche partout ; unités cohérentes (rad, rad/s, m, s) ;
- **les ordres sont ceux que la main lit** : `{ligne, nitro}` au sol, `{volant, manche, nitro, ensuite: {ligne: 0}}` en vol (`ensuite` avec `ligne` vaut :
  la main `clavier` a le suivi) ;
- **rien ne triche** : il ne lit que `vue` et sa mémoire ; profil `{modele: 'clavier', graine: 1, chance: {prend: 1, palierMin: 12}}`, dans les bornes ;
- **aucune vraie erreur trouvée : rien n'a été corrigé.** Un point discutable, laissé parce que c'est de la stratégie : en vol, la façon tenue est
  toujours jugée comme un rayon long (`vaut(mien, true, v)`), même quand c'est un rayon court (`gauche`, `cabre`…) dont « libre » veut dire « on ne
  sait pas » ; il quitte donc plus vite une façon courte. À laisser à la boucle ;
- **la note, mêmes graines et même durée que la référence** (8 graines de 910000 à 910259, 600 s au plus, allégé ; `results/note-pilote-allege-t600-g8.json`
  et `note-reference-allege-t600-g8.json`, à part pour ne pas écraser les notes de 12 graines) :

  | | le pilote | le bot de référence |
  |---|---|---|
  | palier médian | **11,5** | 7 |
  | meilleur palier | **18** | 16 |
  | les 8 paliers | 5 9 10 11 12 13 14 18 | 4 5 6 6 8 8 13 16 |
  | survie médiane | 232,8 s | 136,2 s |
  | pièces par minute | 295,8 | 286,5 |
  | fins | paroi 3, tour 2, vide 2, roche 1 | vide 3, rivière, tour, pic, paroi, roche |

  Graine par graine le pilote fait mieux 7 fois sur 8 (moins bien sur 910000 : 12 contre 16). 4 courses sur 8 ont pris la seconde chance. Aucune
  erreur du cerveau, aucune panne. Ce sont exactement les 8 premières courses de la note de 12 graines de Fable (mêmes empreintes) ;
- **l'essai à blanc de la boucle** (`node boucle.js --a-blanc --tours 1 --candidats 2 --depuis pilote.js --coeurs 2`, 0 €) : **elle va au bout** : le pilote est noté et inscrit (`c0001` du labo jetable, profil `bb745b50cdb1`, celui que la boucle gardera), les 2 variantes (des jumeaux, à blanc) triées, la meilleure notée en grand puis validée sur 2 graines neuves contre la barre du parent (« TIENT »), la génération close, « pas de progrès ce tour », 0 €. Rien n'est refusé.

**À la fin** : `node ml/bot/verifier.js` **TOUT PASSE** (625 s, régime max ; empreinte de la section 3 **`a7b3171768ca`**, égale au témoin ; contrôle 8 bis : une sonde toutes les 1,04 image au pire, canyon compris ; au canyon le voltigeur coûte 3,8 ms par vue, sous la limite de 6) ; `node ml/labo/rejouer.js --tout --coeurs 2` : **5 rejeux exacts sur 5**.

### LA CHAÎNE DES DEUX SEMAINES (`ml/ecurie/chaine.js`, `ml/ecurie/agent-api.js`)

**Ce qu'elle est.** Un programme qui tourne seul, détaché de toute session Claude Code, et qui enchaîne le travail de l'étape C jusqu'au 08/12/2026.
**Elle ne paie que sur la clé d'API, jamais sur l'abonnement** : elle retire de son environnement tout ce qui vient d'une session Claude Code
(`CLAUDE*`, `ANTHROPIC_*`) et n'y remet que `ANTHROPIC_API_KEY` (lue dans la portée Utilisateur de Windows si besoin).
- **`agent-api.js`** lance une session Claude Code sans écran : `claude -p --bare` (en mode `--bare`, seule la clé d'API est lue : ni OAuth, ni
  trousseau), avec un plafond en dollars par session (`--max-budget-usd`), les deux `CLAUDE.md` joints à la consigne, `git push` interdit. Au premier
  message il lit la source de facturation annoncée (`apiKeySource`) et **coupe la session si ce n'est pas la clé d'API**. Le coût final est inscrit au
  journal des dépenses du labo (`ml/labo/journal/depenses.jsonl`), que le plafond de 200 € compte. Le récit de chaque session :
  `agents/<date>-<nom>.jsonl` et `.md`.
- **`chaine.js`**, dans l'ordre :
  1. **le premier pilote** (agent Fable 5.2, consigne `consignes-agents/pilote.md`, 25 $ au plus ; Opus 5.5 en second essai) — **fait le 25/11** :
     `ml/ecurie/pilote.js`, 11,63 € ;
  2. **le calibrage** : `boucle.js` une fois par modèle, même départ, un tour de 6 variantes, 5 € chacun — étapes **K-haiku, K-sonnet, K-opus,
     K-fable** — puis un compte rendu (agent Sonnet 5.5, `consignes-agents/compte-rendu.md`) ;
  3. **le choix** du modèle et du départ (agent Opus 5.5, `consignes-agents/choix-modele.md`) → `agents/choix.json` (Opus 5.5 par défaut s'il manque) ;
  4. **la boucle de l'étape C par tranches de 20 €** (`boucle.js --budget 20 --tours 20 --etape C`), la dépense étalée : **au plus 14 € par jour**
     depuis le 25/11 (si moins de 5 € sont permis, elle attend une heure), **jusqu'au 08/12/2026 23 h 59** ; **un compte rendu après chaque
     tranche**. Deux tranches de suite sans dépense l'arrêtent ; une tranche ratée fait une pause de 30 min.

  Le plafond général de 200 € est tenu par `boucle.js` et `agent-api.js`. Une seule chose à la fois : jamais plus de 4 courses du jeu. Le PC est
  tenu éveillé tant qu'elle tourne (une demande du processus, aucun réglage changé).
- **Son journal** : `ml/ecurie/agents/chaine.log` (une ligne par pas, les lignes `[boucle]` et `[agent-api]` recopiées) ; la sortie complète de
  chaque pas dans `agents/sortie-<pas>.log` ; ce qui est fait dans `agents/chaine-etat.json`.
- **L'arrêter** : créer le fichier `ml/ecurie/agents/STOP` ; elle s'arrête au pas suivant (le pas en cours va au bout). Elle s'arrête aussi seule au
  plafond de 200 € ou à l'échéance du 08/12.
- **La relancer** : retirer `STOP`, puis `node chaine.js` dans `ml/ecurie` : elle **reprend où elle en était** (d'après `chaine-etat.json` ; un pas
  fait n'est pas refait).
- **Glisser un agent entre deux pas** : `node relais.js --pid <pid de la chaîne> --consigne consignes-agents/<x>.md --nom <x> --modele … --budget …
  --etape …` pose `STOP`, attend l'arrêt, lance l'agent, retire `STOP` et relance la chaîne (c'est ainsi que ces finitions ont été faites).

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
- ~~Le radar au canyon sondé une image sur huit~~ : **réglé le 25/11 au soir** (à chaque image, par la borne du relief ; pas à pas 20 vols sur 20 au
  centimètre, 18 sur 18 à l'image près). Ce que le radar ne voit toujours pas reste écrit au README (§ 2 bis : glacier, dunes, ville vitrée au-delà de son sol…).
- **Avec une main à profil, le radar est une estimation à la première vue d'un vol** : refait le 25/11 au soir avec la main réglée, 50 fois sur 55 juste
  (55 sur 55 une fois la façon tenue depuis une réaction).
- **Un seul pilote se sert du radar** (`pilote.js`, en vol) : ce que le radar lui apporte n'est pas mesuré à part.
- **Aucun tour payé n'a tourné** : ni le refus « main changée », ni une variante qui bat son parent, ni la validation sur 20 graines n'ont été vus en vrai.
- Dans un même processus, l'espace et la grotte ne sont pas encore répétables : les notes et les rejeux gardent un processus neuf par course.
- La salle de projection n'a pas été essayée dans un navigateur avec la lettre `C` ni avec le relief du canyon.
- `c0002` a des fins de ligne Windows : son empreinte diffère de `c0001` pour un code identique et son `jumeau` est vide (sans effet sur les courses ;
  la cause est corrigée, la ligne gardée telle quelle : `ml/labo/README.md` § 2).
- `ml/bot/results/note-essai-main-allege-t120-parties.json` (2,9 Mo, les enregistrements de l'essai de la main) reste hors de git : il se refait à l'identique.

**La clé d'API.** Sacha l'a posée (`setx ANTHROPIC_API_KEY`) ; `node essai-api.js` du 24/11 passe pour les quatre modèles. Une session ouverte
avant le `setx` ne voit pas la clé : lancer depuis un terminal neuf.

**Le texte à coller dans la prochaine session :**
> la chaîne tourne ; pour reprendre, lire `ml/ecurie/agents/chaine.log` et relancer `node chaine.js` (dans `ml/ecurie`).

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

### Le calibrage (25/11/2026, 14 h 30 – 17 h 45) et le choix du modèle

Même pilote de départ (`ml/ecurie/pilote.js`, identique octet pour octet aux cerveaux c0003, c0010, c0017, c0024), un lancement de
`boucle.js` par modèle (`--tours 1 --candidats 6 --budget 5`), chacun dans son étape du labo. Le parent noté en grand (20 graines × 900 s,
allégé) : **palier médian 11, record 20, survie médiane 215 s** ; au tri (6 graines × 600 s) : 11,5. Sources : `node ml/labo/labo.js`,
`ml/labo/journal/{cerveaux,generations,validations,depenses}.jsonl`, `ml/ecurie/agents/chaine.log`.

| | Haiku 5.5 (K-haiku) | Sonnet 5.5 (K-sonnet) | Opus 5.5 (K-opus) | Fable 5.2 (K-fable) |
|---|---|---|---|---|
| Variantes reçues / chargeables / refusées | 6 / 6 / 0 | 6 / 6 / 0 | 6 / 6 / 0 | 1 / 0 / 1 (réponse coupée à 32 000 jetons) |
| Notes au tri (parent 11,5) | 11,5 · 11,5 · 10 · 8 · 11,5 · **12** | **13,5** · 11,5 · 7,5 · 12 · 12 · 9,5 | 10 · 9,5 · 9,5 · 8,5 · **11** · 7,5 | — |
| Moyenne des 6 tris | 10,75 | 11,0 | 9,3 | — |
| Meilleure au tri (médian · record · survie) | c0009 : 12 · — · — ; c0004 : 11,5 · 18 · 222 s | c0011 : 13,5 | c0022 : 11 · 18 · 220 s (sous la barre, pas notée en grand) | — |
| En grand, 20 graines (parent 11 · 20 · 215 s) | c0005 : 11 · 20 · 215 s ; c0009 : 10,5 · 20 · 194 s | **c0011 : 13 · 19 · 230 s** ; c0015 : 11 · 20 · 207 s | — | — |
| Validation sur 20 graines neuves | — (rien ne battait le parent) | c0011 : 10,5 · 18 · 205 s contre 11 · 18 · 214 s → **ne tient pas** | — | — |
| Champion sacré | non | non | non | non |
| Euros (journal des dépenses) | 0,06 € | 0,77 € | 1,89 € | 1,91 € |
| Heures de PC (chaine.log) | 56 min | 74 min (dont la validation) | 41 min (rien de promu) | 24 min (la note du parent seule) |
| Variantes chargeables par euro | ≈ 100 | ≈ 7,8 | ≈ 3,2 | 0 |
| **Paliers gagnés validés, par euro / par heure de PC** | **0 / 0** | **0 / 0** | **0 / 0** | **0 / 0** |
| (pour mémoire, gain non validé à l'entraînement) | 0 | +2 → 2,6 /€ · 1,6 /h | — | — |

Chaque lancement comprend environ 10 minutes pour renoter le parent (le même code à chaque fois) : les heures de PC d'un vrai tour de
l'étape C seront un peu plus courtes.

**L'écart est-il au-dessus du hasard ? Non.** Personne n'a gagné un palier validé. Le seul gain (Sonnet, c0011, +2 en grand) est tombé à
−0,5 sur des graines neuves : exactement le bruit annoncé (le parent va de 4 à 20 selon la graine ; une médiane sur 6 graines bouge d'environ
±2 paliers). Les moyennes des tris (Haiku 10,75, Sonnet 11,0, Opus 9,3) ne se distinguent pas avec 6 variantes chacune ; Opus un peu plus
bas est au plus un indice, pas une mesure. Le seul fait net : **Fable 5.2 ne passe pas avec `max_tokens` 32 000** (1,91 € pour une réponse
coupée, aucune variante) — à corriger dans `boucle.js` avant de l'employer.

**Le choix : Sonnet 5.5, en partant de `pilote.js`** (`ml/ecurie/agents/choix.json`).
- Aucun champion sacré au calibrage : le départ de l'étape C reste `ml/ecurie/pilote.js` (pas de `depart-C.js`).
- Gain indiscernable, donc la règle « le plus de variantes par euro sans perdre en qualité de code ». Sur le papier, Haiku gagne (6 sur 6
  chargeables, ≈ 0,01 € la variante). **Mais le PC est le frein, pas l'argent** : à 30–100 min le tour, le PC fait au plus une vingtaine de
  tours par jour. Sonnet (≈ 0,77 € le tour) remplit ces tours au rythme des 13–14 € par jour ; Haiku donnerait le **même nombre** de variantes
  (celles que le PC peut noter) et laisserait l'argent dormir, Opus (≈ 1,9 € le tour) en ferait 2,5 fois moins pour le même argent.
  À nombre de variantes égal, Sonnet garde la qualité de code (6 sur 6 chargeables) et a produit la seule variante qui ait passé le tri
  et la note en grand.
- Raison pratique, vérifiée dans le code : `chaine.js` arrête la chaîne après **deux tranches de suite à moins de 0,5 €**, et `boucle.js`
  s'arrête après 4 tours sans progrès (`--patience 4`). Avec Haiku (≈ 0,06 € le tour), une tranche de 4 tours coûte 0,24 € : la chaîne se
  serait arrêtée seule au bout de quelques heures. Avec Sonnet, 4 tours ≈ 3 €.
- À surveiller : les prix du tableau de `boucle.js` (Haiku 0,10 / 0,50 $ le million) sont une estimation, la facture fait foi. Après le
  calibrage, il reste **≈ 174,7 €** (200 − 25,31) avant la session de choix elle-même (plafond 4 $). Tel qu'écrit, `chaine.js` donne
  tout ce reste à l'étape C au rythme de 14 € par jour, alors que le tableau des 200 € réservait 90 € à C et 60 € à D et E : à trancher par
  Sacha avant que l'étape C ne dépasse 90 €.


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
