# BOTS ML — le plan (2026-11-21)

Statut : **proposé, pas encore validé par Sacha. Étape 0 faite le 22/11** (`ml/reel` tourne sur le jeu actuel : 6,8 × le temps réel ;
même graine = même course au bit près dans un processus neuf, presque dans le même processus — détails et limites dans `ml/reel/README.md`).
**Étape 1 faite le 23/11** (le contrat du bot, le bot de référence, l'outil de l'étalon : `ml/bot/README.md`). L'étalon en est à
**14 parties sur 20** au 24/11 (10 de Sacha au clavier, 4 de Léo au doigt) : la barre est provisoire, il en manque 6.
**Étape 1 bis faite le 24/11** (la boîte noire du labo : `ml/labo/README.md`). Les comptes rendus sont à la fin de la section 3.
La boucle (étapes 2 à 8) n'est pas codée : aucun euro d'API n'a été dépensé.

> **NOUVEL OBJECTIF (24/11/2026, Sacha) : une écurie de bots pour le matchmaking, un par niveau de record du palier 1 au palier 30,
> indiscernables de vrais joueurs.** Le plan de cet objectif, et l'état du chantier, sont dans **`ml/ecurie/PLAN.md`** ; l'étude qui le fonde
> dans `ml/ecurie/etude/`. Il remplace les étapes 2 à 8 ci-dessous (la boucle par API), qui restent pour mémoire. Aucun euro d'API n'est
> dépensé : le travail se fait sur l'abonnement, et le crédit ne sera touché qu'avec l'accord de Sacha.
Demande : des bots qui jouent vraiment à CASH CAR (rouler, voler, figures, raccourcis), un plan qui dépense surtout les ~200 € de crédit API, et un projet qui sert au portfolio (RCA — je suppose Royal College of Art, à confirmer).

---

## 1. Ce qui existe déjà, et pourquoi ça a calé

| Dossier | Ce que c'est | Ce qui a manqué |
|---|---|---|
| `ml/train/` (juillet → septembre) | 24 voitures à petit réseau, mutées au hasard, dans une **copie** du jeu | La copie a divergé du vrai jeu. Après 300 générations : 0 figure, 9 % de poses réussies. Le champion ne finissait aucune course alors que les totaux du run étaient bons. |
| `ml/reel/` (20 octobre) | Le **vrai jeu publié** tourne sans écran dans Node, piloté par les touches du clavier, horloge à 1/60 s | Cerveau de 16 neurones, noté à la distance seule. 3 à 4 fois le temps réel d'après son README (pas remesuré depuis). |
| `ml/bot/` (23 novembre, étape 1) | Le **contrat du bot** : yeux, gestes, doigts, pilote, mesures, bot de référence, outil de l'étalon | 6 parties de joueurs (14 sur 20). |
| `ml/labo/` (24 novembre, étape 1 bis) | La **boîte noire** : journal des cerveaux, dépenses, rejeux, arbre, salle de projection (rejeu avec l'image, film) | La boucle qui l'alimentera (étape 2). |

À lire avant tout : `ml/reel/README.md`, `ml/train/README.md` (les quatre règles de travail y sont toujours valables).

Autres briques utiles déjà dans le jeu : l'enregistreur de parties (`?jeurec=1`, `code/moteur/enregistreur-jeu.js`), le pilote de mesure `dbgAuto`, les graines de piste (`?pistegraine=`, `dbgGenRoute`), les 7 pilotes du mode Survivant (retiré de l'interface).

**Le diagnostic.** Une figure demande, dans l'ordre : être en l'air avec assez de temps restant, avoir 35 % de nitro, faire un double appui dans une fenêtre de 300/420 ms, tenir la bonne direction du pouce, puis poser à moins de 20° de la fin (au-delà de 52° c'est une chute). Des mutations au hasard sur des touches brutes ne tombent jamais sur cet enchaînement. Un raccourci est pire : quitter la route exprès, viser un tronçon plus bas, gagner au moins 60 m, avec 6 s d'air avant d'exploser.

---

## 2. L'idée centrale

**Claude écrit le cerveau du bot, le vrai jeu le note, Claude lit les échecs et réécrit.**

- Le cerveau est un **programme lisible** (JavaScript), pas un réseau muté au hasard.
- La méthode est connue : Eureka (NVIDIA) et AlphaEvolve (DeepMind) — un modèle de langage propose du code, un simulateur tranche.
- Elle demande des milliers d'essais, pas des centaines de millions. Le simulateur lent mais exact (`ml/reel`) suffit, sans carte graphique.
- La dépense est presque entièrement de l'API.
- Le bot tourne dans le jeu sans rien ajouter.

Deux pièces rendent ça possible :

1. **Des gestes au lieu de touches.** Le cerveau décide « saut nitro », « figure avant / arrière / côté », « planer », « viser ce tronçon ». Une couche « doigts » traduit en vraies touches, aux délais d'un humain. Le bot reste limité à ce qu'un joueur peut faire.
2. **Des yeux corrects.** Le cerveau voit ce que le joueur voit : courbes devant, plaques, fruits, pièces, flaques, jauges (nitro, flow), et en vol l'anneau de pose, le temps d'air restant, l'angle restant de la figure, les tronçons atteignables en dessous avec leur gain.

---

## 3. Les étapes

| # | Étape | Ce qui en sort | API |
|---|---|---|---|
| 0 | Réveiller `ml/reel` sur le jeu actuel ; mesurer vitesse et répétabilité (même graine = même course) | Un chiffre d'images/s, un oui/non | 0 € |
| 1 | Le contrat du bot : ce qu'il voit, ses gestes, la couche « doigts ». Un bot écrit à la main sert de référence. Sacha enregistre 20 de ses parties : c'est l'étalon. | La référence et la barre à battre | 0 € (abonnement ; travail pour Fable) |
| 1 bis | **La boîte noire du labo** (section 5) : journal, rejeux, arbre, vidéos. Posée AVANT le premier euro. | Toute la suite laisse une trace | 0 € (abonnement) |
| 2 | Calibrage : 30 mutations par modèle (Haiku, Sonnet, Opus) sur la même tâche | Le modèle qui progresse le plus par euro, le coût réel d'un essai | 15 € |
| 3 | Rouler : ligne, plaques, pièces, nitro | Bat `dbgAuto` en argent par minute sans mourir plus | 15 € |
| 4 | Sauter, se poser, figures, combos | Des figures posées chaque minute, peu de chutes | 35 € |
| 5 | Planer et raccourcis, portail en vol | Des raccourcis pris là où la map en offre | 40 € |
| 6 | Toutes les maps, puis plusieurs styles (prudent, flambeur, voltigeur) | Une écurie de pilotes = des niveaux de difficulté | 30 € |
| 7 | Analyse en lot des morts, rapport par map, brouillon du journal de bord | Un testeur de routes, et le récit | 25 € |
| 8 | Réseau de neurones qui imite le meilleur programme, puis s'affine seul sur le PC | La partie « machine learning » pure | 20 € |
| | Réserve | | 20 € |

**Une étape = une boucle.** Une cinquantaine de cerveaux candidats par tour, chacun noté sur 20 graines, une nuit de PC. Les réglages chiffrés (seuils, gains) s'affinent gratuitement en local. Le champion est toujours validé sur des graines que Claude n'a jamais vues.

**Budget.** Estimation : 0,07 à 0,14 $ par candidat avec Opus 5.5 en traitement par lot (moitié prix). L'étape 2 mesure le vrai coût avant de dépenser le reste. Tarifs en dollars, comptés 1 € = 1 $ pour garder de la marge.

**Cibles.** Pas de chiffres inventés : les figures par minute, le temps en l'air et l'argent par minute de Sacha (étape 1) sont la barre. Test final : le bot contre Sacha sur les mêmes graines.

### Étape 1 — ce qui est sorti (23/11/2026)

Tout est dans `ml/bot/` (mode d'emploi : `ml/bot/README.md`). Le jeu n'a pas été modifié.

**Le contrat.** Un cerveau est un fichier `decide(vue, memoire) → ordre`, appelé 10 fois par seconde, chargé dans un bac fermé.
- *Ce qu'il voit* (`yeux.js`) : la route devant (virage, montée, dévers, trous), pièces, plaques, fruits, orbes, flaques, jauges ; en vol
  l'anneau de pose, le temps d'air restant, la figure en cours, la route la plus proche ; au sol comme en vol, les tronçons en contrebas avec leur gain.
- *Ses gestes* (`doigts.js`) : volant, manche, nitro, figure (4 directions), saut, redresser ; deux aides (tenir une ligne, viser un tronçon).
- *Ses doigts* : les cinq touches du clavier, jamais plus vite qu'une main (67 ms par appui, 7,5 appuis par seconde, 2 gestes par seconde).

**Contrôlé dans le vrai jeu** (`node verifier.js`, tout passe) : les 10 gestes font ce que leur nom dit ; 545 appuis en 150 s, aucun sous la
limite ; deux processus neufs sur la même graine donnent la même course et les mêmes touches ; regarder (yeux, enregistreur) ne change rien.

**La mesure commune.** Le pilote fait tourner l'enregistreur du jeu (celui des parties de Sacha) pendant les courses des bots :
mêmes chiffres, même format, comptés par le même code (`mesures.js`).

**Le bot de référence** (`reference.js`, écrit à la main, rien d'appris), 20 graines, 300 s au plus, jeu `cashcar-v1627` :

| mesure | référence |
|---|---|
| survie médiane | 143 s |
| argent par minute | 17 383 |
| pièces par minute | 391 |
| figures posées par minute | 5,9 |
| temps en l'air | 9,6 % (3,7 vols par minute, 1,6 s en moyenne) |
| raccourcis par minute | 0,04 (il n'en cherche pas) |
| fins | vide 12, roche 5, air 2, pic 1 |

Il traverse 7 maps (nuages, grotte, jade, espace, crypto, canyon, ville). Il meurt surtout en vol, après un saut ou une sortie de route.
C'est le point de départ à battre, pas un bon joueur.

**Ce que la lecture du jeu a corrigé dans ce plan.**
- Au sol, le double appui lance une figure qui **reste sur la route** (un petit bond). Pour voler exprès il faut un geste de plus :
  manche vers soi et un nouvel appui NITRO pendant le bond. Le « saut nitro » simple n'existe que si la direction n'a pas de figure.
- La figure dépend de la direction tenue au second appui (avant, arrière, côté), au sol comme en vol.
- Tenir la NITRO pendant une figure en vol la redresse : planer et tourner ne vont pas ensemble.

**Deux pannes de `ml/reel` réparées** (détail dans `ml/reel/README.md`) : la caisse restait bloquée au portail de fin de piste, et une
grotte bâtie à un portail n'arrivait jamais. L'étape 0 ne les avait pas vues : ses courses duraient 60 s.

**Vitesse réelle.** Sur des courses de plusieurs minutes (maps bâties en route), 4 cœurs jouent environ 6 fois le temps réel au total :
47 min de jeu en 8 min. Un tour de boucle (50 cerveaux × 20 graines) tient en une nuit, comme prévu.

**L'étalon (au 24/11) : 14 parties sur 20, deux joueurs.** Décision de Sacha le 24/11 : les parties de Léo comptent « dans les 20 ».
10 parties au clavier (Sacha), 4 au doigt sur téléphone (Léo). Il en manque 6 : la barre est **provisoire**.

| mesure | les joueurs (14 parties) | référence (20 courses) | bot ÷ joueurs |
|---|---|---|---|
| survie médiane | 156,8 s | 142,6 s | 91 % |
| argent par minute | 25 013 | 17 383 | 69 % |
| pièces par minute | 416 | 391 | 94 % |
| figures posées par minute | 4,96 | 5,9 | 119 % |
| temps en l'air | 28,7 % | 9,6 % | 33 % |
| vols par minute | 7,91 | 3,67 | 46 % |
| raccourcis par minute | 2,66 | 0,04 | 2 % |
| distance par minute | 11 034 m | 8 108 m | 73 % |
| nitro tenue | 60,1 % | 17,6 % | 29 % |

Lecture : le bot ramasse les pièces et pose des figures comme les joueurs ; l'écart est dans le temps en l'air, les raccourcis et la nitro.
Réserves : une partie de 400 s à 324 000 d'argent pèse lourd dans l'argent par minute (20 597 sans elle) ; les joueurs ont la seconde
chance, le bot non ; les courses du bot sont coupées à 300 s ; trois versions du jeu se côtoient (parties en `60aa15e` et `ccdca9b`,
bot en `cashcar-v1627`), écarts non vérifiés. Chacun à part : `ml/bot/results/etalon-sacha.json`, `etalon-leo.json`.

Pour finir : jouer, exporter **toutes les 4 ou 5 parties** (l'enregistreur garde 8 parties **et** 1,6 Mo au plus), déposer les fichiers
dans `ml/bot/etalon/`, lancer `node ml/bot/etalon.js`. Mode d'emploi : `ml/bot/README.md`, section 5.

### Étape 1 bis — ce qui est sorti (24/11/2026)

Tout est dans `ml/labo/` (mode d'emploi : `ml/labo/README.md`). Le jeu n'a pas été modifié. Aucun euro dépensé.

**La règle.** Un cerveau n'entre au labo que par une commande, `inscrire.js`. Elle le note dans le vrai jeu (20 graines, un processus
neuf par course) et écrit d'un coup : son code, ses parents, **la raison de son changement**, sa note, chaque course (graine, empreinte,
fin, endroit de la fin), son coût en jetons et en euros. Elle refuse une inscription sans raison, avec un parent inconnu, ou un cerveau
d'API sans son coût — et elle refuse avant de jouer.

| Trace du plan (5.1) | Où | État |
|---|---|---|
| le journal des cerveaux | `journal/cerveaux.jsonl` + `cerveaux/<id>-<nom>.js` | fait |
| les dépenses | `journal/depenses.jsonl`, cumul par étape (`node labo.js`) | fait ; les tarifs se mesurent à l'étape 2 |
| les rejeux | `rejeux/<id>-g<graine>.json` : graine, version du jeu, touches image par image | fait |
| les trajectoires | `trajectoires/` : les courses gardées en entier, et la trace fine de toutes les courses d'une génération | fait |
| l'arbre | `arbre.html` (`node arbre.js`) : un nœud par cerveau, sa raison, sa note contre son parent et contre les joueurs, les lignes changées, ses courses, son film | fait |
| les vidéos | `projection.js` : le rejeu dans le vrai jeu avec l'image, filmé | fait |

**Le premier inscrit : le bot de référence, `c0001`.** Ses 20 courses redonnent les 20 empreintes de la note du 23/11 : même jeu, mêmes
graines, même course, au bit près, un jour après. Génération 0 close ; 4 courses gardées (sa meilleure, sa plus courte, son plus long vol
posé — 10,3 s, avec un raccourci de 1 722 m —, son vol à 2 figures).

**Contrôlé.**
- *Un rejeu sans le cerveau redonne la course.* Les touches seules, dans un processus neuf : 4 rejeux exacts sur 4 (même empreinte, même
  nombre d'images, même fin, même argent). `node rejouer.js --tout` est le contrôle à refaire après chaque mise à jour du jeu.
- *Les outils ne salissent pas le journal.* `LABO_DIR` : tous les essais ont tourné dans un labo jetable.

**Les deux points à vérifier de la section 5.5.**

1. *Filmer sans ffmpeg : oui.* Le navigateur encode chaque image du jeu (VideoEncoder, VP9) et `projection.js` écrit lui-même le fichier
   `.webm`, chaque image datée à n / 60 s. Essayé : une course de 39,9 s → 2 485 images, 41,4 s, 1280 × 720, 26 Mo ; le film se lit, a sa
   durée, on s'y déplace. La vitesse du PC ne compte pas (ce PC dessine 30 à 40 images par seconde : la projection dure deux fois la
   course). Le premier essai, l'enregistreur vidéo du navigateur en direct, ne gardait que ~12 images par seconde. Le film montre l'image
   du jeu, **pas le HUD** (c'est du HTML par-dessus) : pour un film avec le HUD, la projection se filme à l'écran avec OBS.
2. *Un rejeu n'est exact que sur sa version du jeu : c'est noté et gardé.* Chaque rejeu porte le commit et l'empreinte de
   `index.html` + `figures.js` ; `rejouer.js` et la salle de projection préviennent quand le jeu a changé.

**Le rejeu avec l'image — ce qui est vérifié.** La salle de projection sert le vrai `index.html` à un navigateur, avec les règles du
simulateur (horloge du jeu, hasard à graine, aucune entrée, aucun son), et compare toute seule : l'état de la caisse à chaque décision,
contre la même course sans écran.
- *Une course sur une seule map : la même, à chaque décision.* Course de 39,9 s sur jade : les 400 décisions du navigateur sont celles de
  la course sans écran, jusqu'à la mort à la même image (2 394). Son film montre donc exactement la course du journal.
- *Une course qui traverse des portails.* Course de 187,8 s sur quatre maps (nuages > jade > crypto > grotte). Résultat : **la même course, à chaque décision** : 1 879 décisions sur 1 879, 11 268 images, trois portails, même fin (roche) et même argent (52 545,35) ; aucune image n'a eu besoin d'être rattrapée.
  Il a fallu deux choses pour y arriver, et elles valent pour tout rejeu avec l'image :
  1. **Le recalage du hasard.** Le navigateur tire plus de nombres au hasard que le simulateur (effets d'écran), et le jeu tire la route
     suivante du même hasard : sans rien faire, la course est identique 56,6 s, puis c'est une **autre route** après le premier portail.
     Le rejeu sans écran note donc où en est le hasard (à chaque image, et à l'entrée de chaque fonction du jeu qui tire au sort), et le
     navigateur s'y remet (`HASARD_CODE`, `ml/bot/piloter.js`).
  2. **Le même régime que le simulateur** (`&poste=3`). Voir ci-dessous : c'était la cause de l'écart de 127,4 s.
- *Ce qui protège.* Le verdict est automatique et écrit (`tampon/projection-<course>.json`) : un film n'est « la course du journal » que si
  la projection l'a dit.

**Découverte : le simulateur note un jeu que les joueurs de l'étalon ne jouent pas.** Au chargement, le jeu juge la machine
(`POSTE`, `rendu/soleil-planete.js`). Une puce graphique intégrée ou un téléphone → version **allégée**, où **Crypto City est retirée du
tirage** (`SF_HORS`) : la « cryptoville » n'y a que ses nuits (la ville). Le simulateur n'a pas de carte graphique à juger : il tourne au
régime **maximum**, avec Crypto City.
- Mesuré le 24/11 : au deuxième portail, même état du hasard des deux côtés, le simulateur tire « crypto, midi » et le navigateur de ce PC
  « ville, orage ». Même route (même graine), mais les pièces de la ville valent 0,75 ou 1,5, celles de Crypto City 1 : d'où 127,4 s
  d'accord parfait, puis des gains à × 0,75, puis une conduite qui se sépare.
- Les 14 parties de l'étalon sont **toutes** en version allégée (PC de Sacha, téléphone de Léo) : aucune ne passe par Crypto City.
  Le bot de référence, lui, y roule dans 4 courses sur 20.
- Ni le simulateur ni la salle de projection ne s'écartent du vrai jeu : ce sont **deux régimes** du même jeu. La projection se met dans
  celui du simulateur ; `&regime=2` la met dans celui de ce PC (la course n'est alors plus celle du journal).
- **À trancher par Sacha avant l'étape 3** (section 7, point 6) : noter les bots au régime maximum (aujourd'hui) ou en allégé comme les joueurs.

**Ce que cette étape a appris sur le jeu.**
- Le jeu tire **tout** du même hasard : la flamme d'un réacteur comme la graine de la route suivante (`newTrackG`). Un vrai navigateur
  anime plus de choses que le simulateur ; sans précaution, la route d'après le premier portail n'est plus la même.
- Le simulateur est donc exact sur ce qu'il simule (la conduite, les routes, l'argent), mais il **n'est pas** la couche d'effets du
  vrai jeu. Pour noter des bots c'est sans importance ; pour montrer une course, c'est la salle de projection qui fait le pont.
- L'ancienne intro du jeu se lance à la première touche si un écran titre existe : le prélude le retire dès le chargement.

**Un défaut de l'étape 1 trouvé et corrigé en passant : une note dépendait de la charge du PC.** Chaque décision du cerveau avait
500 ms de vraie montre. Le 24/11, avec le PC occupé par ailleurs, `verifier.js` a raté : deux processus neufs, même graine, deux courses
différentes (3 et 10 décisions coupées). La limite est maintenant de 5 s, et une course s'abandonne à la 3e décision coupée (fin
« panne ») : une boucle sans fin coûte 15 s, pas des heures. `verifier.js` repasse en entier sur le PC chargé, avec l'empreinte du 23/11.
Les pannes restent comptées course par course au journal, et `inscrire.js` les signale : **une course avec une panne ne vaut pas**.

**Pas fait, et dit.** Le bêtisier, les cartes, les planches et le journal de bord (5.2) sont des fabrications à partir de ces traces :
elles viendront avec les générations (il n'y a qu'un cerveau au journal). Les traces qu'il leur faut, elles, s'écrivent déjà.

---

## 4. Ce qui peut casser

- **`ml/reel` ne démarre plus** : il a un mois, le code a beaucoup bougé. D'où l'étape 0 avant tout euro.
- **Plafond avant les raccourcis** : le repli est un noyau de physique rapide + apprentissage par renforcement classique. Plusieurs semaines, avec le risque de divergence qui a tué `ml/train` (banc d'écart contre le vrai jeu obligatoire).
- **Le jeu change** : rejouer les champions à chaque version.
- **Le code généré tourne sur le PC** : il s'exécute dans un bac fermé (pas de fichiers, pas de réseau, temps limité).

---

## 5. Garder des traces : la boîte noire du labo

Principe : **tout ce qui n'est pas enregistré au moment où ça arrive est perdu.** Une génération ratée ne se refabrique pas. On pose donc l'enregistrement avant la première boucle, et il tourne tout seul.

### 5.1 Ce qui s'enregistre automatiquement

| Trace | Contenu | Sert à |
|---|---|---|
| **Le journal des cerveaux** | Une ligne par candidat : numéro, parent(s), étape, génération, modèle, le code, **la raison donnée par Claude pour ce changement**, la note par graine, la cause de chaque mort, le coût en jetons | L'arbre, les courbes, le récit |
| **Les rejeux** | Pour chaque course gardée : la graine, la version du jeu (`cashcar-vNNN` + commit), les touches image par image | Refaire n'importe quelle vidéo plus tard, sous n'importe quel angle |
| **Les trajectoires** | Position de la caisse à 10 Hz + événements (décollage, pose, figure, pièce, mort), au format de l'enregistreur du jeu | Cartes vues de dessus, cartes de chaleur |
| **Les dépenses** | Euros cumulés par étape | La courbe « progrès par euro » |

On ne garde pas chaque course en rejeu (trop lourd) : le champion de chaque génération, la pire course, et les courses « remarquables » repérées automatiquement (plus long vol, plus gros combo, mort la plus absurde).

### 5.2 Ce qu'on fabrique à partir de ces traces

- **L'arbre généalogique des cerveaux** — une page qu'on ouvre dans le navigateur. Un nœud par cerveau, relié à son parent ; couleur = étape, taille = note. Un clic montre ce que Claude a changé, sa raison, et la vidéo. C'est la pièce maîtresse.
- **Les vidéos** — un rejeu relancé dans le vrai jeu avec l'image, filmé. Trois formats : le champion de chaque étape ; le duel côte à côte Sacha / bot sur la même graine ; le « même virage à travers les générations » (génération 1, 10, 50 sur le même passage).
- **Le bêtisier** — les morts les plus bêtes et les triches trouvées par les bots. Montage court par étape.
- **Les cartes** — la route vue de dessus avec toutes les trajectoires d'une génération superposées ; les endroits où l'on meurt ; les raccourcis découverts.
- **Les courbes** — note par génération, figures par minute, poses réussies, euros dépensés.
- **Les planches** — une image fixe par jalon (9 instants d'une course), pour l'imprimé.
- **Le journal de bord** — une entrée datée par nuit de calcul : ce qu'on a tenté, ce qui s'est passé, une image. Brouillon écrit par Claude à partir du journal des cerveaux (étape 7), relu par Sacha.

### 5.3 Un instantané à chaque jalon

À la fin de chaque étape (3, 4, 5, 6, 8) on fige : le champion, 3 vidéos, 1 planche, 1 carte, la courbe, dix lignes de bilan. Même si le projet s'arrête là, le dossier se suffit.

### 5.4 Où ça vit

- **Dans git** : journal, rejeux, trajectoires, champions, images, la page de l'arbre. Leçon de `ml/train` : un dossier `results/` hors git a été effacé une fois.
- **Hors git** : les vidéos (lourdes), dans un dossier à part avec un index. Elles se refont à partir des rejeux.
- Le rangement (posé à l'étape 1 bis) : `ml/labo/journal/`, `cerveaux/`, `rejeux/`, `trajectoires/`, `arbre.html` dans git ; `tampon/` et `videos/` hors git.
  `ml/labo/jalons/<étape>/` viendra avec le premier jalon (étape 3).

### 5.5 Deux points à vérifier à l'étape 1 bis — vérifiés le 24/11

- **Filmer sans ffmpeg** : fait. Le navigateur encode image par image, `ml/labo/projection.js` écrit le `.webm` : 60 images par seconde exactes. OBS reste utile pour un film avec le HUD. Détail : compte rendu de l'étape 1 bis (section 3).
- **Un rejeu n'est exact que sur la version du jeu qui l'a produit.** Le commit et l'empreinte du jeu sont dans chaque rejeu ; les outils préviennent. On filme les vidéos d'un jalon avant de changer de version.

### 5.6 Pour le portfolio

Le fil : deux tentatives ratées, un changement de méthode, puis des cerveaux qu'on peut lire. Ce qu'on montre : l'arbre, les duels, le bêtisier, les cartes, le journal de bord, et une réflexion courte (ce que la machine a compris de travers dans le jeu, la règle « mêmes touches que le joueur »).

---

## 6. Qui fait quoi

- **Crédit API** : la boucle automatique seulement (étapes 2 à 8).
- **Abonnement Claude** : tout le code du laboratoire. Fable pour l'étape 1 et le diagnostic de mi-parcours, un autre modèle pour le reste.
- **Grok** : critique extérieur des rapports, à la main. Pas dans la boucle.
- **PC de Sacha** (6 cœurs, 16 Go, pas de carte NVIDIA) : il note les cerveaux la nuit.

---

## 7. À trancher par Sacha

1. **Bots dans le jeu** : fantômes (courses calculées d'avance sur la piste du jour, rejouées chez le joueur — recommandé) ou rivaux en direct (demande de refaire la physique pour plusieurs voitures) ?
2. **Ses parties** : étalon seulement (sa décision de septembre) ou aussi point de départ à imiter ?
3. **RCA** : confirmer l'école et le programme visé, pour régler le format des pièces (vidéo, page, imprimé).
4. **L'étalon, sur quel appareil ?** (né de l'étape 1) **Tranché le 24/11 : les deux.** Sacha au clavier, Léo au doigt sur téléphone,
   « dans les 20 ». La barre commune mélange donc deux façons de jouer ; la barre de chacun est gardée à côté.
5. **Quelle sauvegarde pour le bot ?** (né de l'étape 1) Il joue une sauvegarde neuve : première voiture, deux figures (salto, tail whip),
   premier palier de moteur au départ. Sacha joue la sienne. À égaliser, ou à assumer.
6. **Dans quel régime noter les bots ?** (né de l'étape 1 bis) Le simulateur tourne au régime maximum (Crypto City au tirage). Sacha et
   Léo jouent en version allégée (sans). « Le bot contre Sacha sur les mêmes graines » demande le même régime des deux côtés : soit le
   simulateur passe en allégé (`?allege=1`, toutes les notes à refaire : 8 minutes pour la référence), soit l'étalon se rejoue sur un PC
   au maximum. Non mesuré : ce que l'allégé change d'autre que le tirage des maps.

---

## Sources

- Eureka : https://arxiv.org/abs/2310.12931v2
- CodeEvolve (version ouverte d'AlphaEvolve) : https://arxiv.org/html/2510.14150v1
- Linesight (Trackmania) : https://linesight-rl.github.io/linesight/build/html
- Rocket League, transfert entre simulateurs : https://ar5iv.labs.arxiv.org/html/2205.05061
- Ripple (imitation puis renforcement) : https://wandb.ai/rolv-arild/ripple/reports/Ripple--VmlldzozNDE5NzE4
- GT Sophy : https://ai.sony/blog/gran-turismo-sophy-five-years-on-from-nature-cover-to-open-frontier
- BeTAIL (imitation de pilotes humains) : https://arxiv.org/html/2402.14194v2
- PufferLib 3.0 : https://puffer.ai/blog.html
- Conseils de portfolio du RCA : https://www.rca.ac.uk/study/apply-to-study/portfolio-advice/
