# L'échelle de bots : des niveaux pour le matchmaking, et des experts (28/11/2026)

Étude de lecture, sans aucune course ni aucun test. Écrite pour quelqu'un qui ne lit pas le code.
Branche `bots-ecurie`. Rien n'est modifié dans `ml/evolution`, `ml/bot`, `ml/reel`, `code/` ni `VERSION PRINCIPALE/` : tout est dans ce dossier.
Dix agents : quatre lecteurs (les joueurs, le palier, la sélection, l'existant), trois concepteurs (les niches, le handicap, une voie libre),
trois relecteurs adverses (les chiffres, le code, le but). Ce texte range leur travail. Il ne décide rien.

## En une minute

1. **Le but a changé de forme.** Sacha ne veut pas un champion, il veut deux familles : une **échelle** de bots du palier 1 au palier 30 qui conduisent
   et meurent comme un joueur de leur niveau, pour un matchmaking ; et des **experts** qui ne perdent jamais au palier moteur 30 (§ 1).
2. **Chez les deux joueurs enregistrés, une partie faible est une partie qui meurt tôt.** À la même minute, tout le monde roule et ramasse pareil (§ 2.3).
   La durée explique 63 % des pièces ; le palier suit la durée presque parfaitement (ρ = 0,99).
3. **On n'a que 14 parties de 2 habitués.** Aucun débutant. Rien aux paliers 2-3, 6-7, 9-10, 13, 17-20, 23-27, 29-30. Sans les deux parties
   rattrapées par une seconde chance, le record des joueurs tombe de 28 à 21 (§ 2, § 7).
4. **Le palier de c0025 est borné par la mort, pas par le temps** : aucune des 1 250 courses du banc n'atteint 900 s. Il ramasse aussi moitié moins
   par minute que les joueurs (§ 3).
5. **La sélection ne sait pas fabriquer des niveaux** : elle cherche un seul champion, et l'écart vrai de niveau entre ses pilotes vaut 0,00 à 0,16 palier.
   Elle sait en revanche trier la ressemblance (E varie vraiment, de 0,66 à 0,90) (§ 4).
6. **Rien de l'échelle n'existe** : ni profils, ni paquet, ni bot faible voulu. Tous les bots connus ont un centre entre les paliers 5 et 8.
   Aucun bot n'a dépassé le palier 21. Aucun bot de `ml/` n'est branché dans le jeu (§ 5).
7. **Trois conceptions** (§ 6) : des **niches** (une étagère de cases de niveau), un **handicap** (un seul bon pilote, ralenti par une molette),
   une **banque de courses** (les courses d'un seul pilote, rangées par palier d'arrivée) avec des experts élevés à part.
8. **Aucune ne fabrique l'expert du palier 30** et les trois le disent. Il faudrait 40 à 1 000 fois moins de morts par minute qu'aujourd'hui,
   à une vitesse 4 à 6 fois plus haute. On ne sait pas si le jeu le permet (§ 6, § 7).
9. **Les relecteurs classent d'abord deux petites mesures** qui ne touchent pas `ml/evolution` : les cinq copies du pilote (handicap) et le tri
   des courses passé au discerneur (banque). Les niches attendent qu'un « bouton niveau » existe (§ 8).
10. **Trois questions reviennent à Sacha** : le sens de « ne pas perdre du tout », fantômes ou bots en direct, et l'enregistreur enrichi (§ 9).

## 1. Le but, dans les mots de Sacha

| date | ses mots | où c'est écrit |
|---|---|---|
| 24/11 | « des bots qui peuvent faire des matchmaking du record de palier 1 au palier 30, et qu'on ne puisse pas faire la différence entre eux et des vrais joueurs. Les joueurs qui ne sont pas forts doivent avoir des bots de leur niveau, et les très bons joueurs aussi. » | `../../PLAN.md` l.3-5 ; journal `2026-11-24.md` l.56 |
| 26/11 | « on ne peux pas du tout faire la diff entre un bot et un vrai jouer » | `../../agents/tmp-voltige/paroles-sacha.md` |
| 26/11 | « fait les bots les plus realisee possible » | même fichier |
| 27/11 | « […] mon objectif d'avoir les meileur bots possible » (la demande de la sélection naturelle) | même fichier |
| 28/11 | « bah oui il doit mourir comme un joueur mais il faut aussi des pilote expert qui ne peuvent pas perdre du tout au palier moteur 30 il faut differnt niveau de bot qui permetent un match makin adapté au niveau de chaque joueur » | `../avant-le-bord/LISEZ-MOI.md` § 9.6 |

Le 28/11 répond à la question laissée par l'étude « avant le bord » : un bot doit-il mourir sur décor comme un joueur, ou moins ?

**Deux familles, donc :**
- **(1) L'échelle humaine** : des bots de niveaux différents, du palier 1 au palier 30, chacun conduisant et mourant comme un joueur de ce niveau.
- **(2) Les experts** : des pilotes qui ne perdent jamais au palier moteur 30.

**Ce qui est neuf.** Avant le 28/11, Sacha n'avait jamais demandé de pilote « qui ne perd pas ». `PLAN.md` § 4 disait même : « Garantir le palier 30 […]
Le plafond atteint sera mesuré et dit, pas promis » (lecteur existant).

**Ce que « ne pas perdre » peut vouloir dire.** Le jeu n'a pas de course gagnée contre un autre joueur, hors du mode Survivant : la partie finit à la mort.
Trois lectures sont possibles, aucune n'est écrite par Sacha (lecteur existant) :
- (a) atteindre le palier 30 sans jamais mourir ;
- (b) ne jamais être le dernier au couperet du mode Survivant ;
- (c) finir devant le joueur, à la distance ou à l'argent.

## 2. Ce qu'on sait des joueurs

Source : `lecteur-joueurs/parties.js` → `sortie.txt`, `sortie.json` ; `lecteur-joueurs/a-temps-egal.js` → `a-temps-egal.txt`.
Les parties sont comptées par `partiesJoueurs` (`ml/bot/mesures.js`), comme `etalon.js` et `ressemblance.js`.
Ces chiffres recoupent `../humains.md`, à 2 s près (la fin est prise à la mort, pas à l'explosion).

### 2.1 Combien

| | parties | minutes | paliers (triés) | médiane | record |
|---|---|---|---|---|---|
| Sacha (clavier) | 10 | 30,1 | 1 4 5 5 8 12 14 15 22 28 | 10 | 28 |
| Léo (doigt, navigateur du téléphone) | 4 | 10,7 | 1 11 16 21 | 13,5 | 21 |
| **Tous** | **14** | **40,8** | 1 1 4 5 5 8 11 12 14 15 16 21 22 28 | **11,5** | **28** |

- **Deux joueurs, tous deux habitués. Aucun débutant.**
- Toutes les parties sont en allégé, avec la voiture LA HONTE, sur deux versions du jeu (`a-temps-egal.txt`).
- Les deux parties au palier 1 (12 et 14 s) sont des faux pas de bons joueurs, mortes sur la première route.
- **Sans les deux parties à seconde chance** (paliers 28 et 22), les joueurs ont une médiane de 9,5 et un record de 21 ; Sacha seul, une médiane de 6,5
  et un record de 15 : la zone de c0025 (relecteur chiffres, `relecteur-chiffres/sortie-recompter.txt`).

### 2.2 Comment ils meurent

- 13 parties sur 14 meurent en vol. Seule la partie au palier 28 meurt au sol (`sortie.json`, champ `en_vol`).
- Causes : pic sur la jade 3, roche dans la grotte 3, paroi au canyon 2, puis une chacune pour glace, air (nuages, espace, ville), vide et tour
  (`a-temps-egal.txt`).
- **Les trois morts « pic sur la jade » sont les trois parties faibles de Sacha** (paliers 4, 5, 5).
- Fins de partie minute par minute : 3 sur 14, 2 sur 11, 4 sur 9, 2 sur 5, soit 21, 18, 44 et 40 %. Les intervalles à 95 % sont énormes :
  environ [5–48], [19–73], [12–77] pour les trois dernières (relecteur chiffres).
- Morts par minute, secondes chances comprises : 16 morts en 40,8 min, soit **0,39 par minute, à 95 % [0,22–0,64]** (relecteur chiffres).

### 2.3 D'où vient le palier : la survie, pas le style

- Pièces = durée × rythme. **La durée explique 63 % de la variance de log(pièces)** (72 % sur les parties de 60 s et plus).
  Corrélation de Spearman entre palier et durée : 0,99 (`sortie.txt`).
- **À temps égal, la différence disparaît** (`a-temps-egal.txt`, fenêtres de 60 s) :

| 1re minute | pièces ramassées | km/h au sol | nitro % |
|---|---|---|---|
| parties faibles de Sacha (P5, P5, P8, P12) | 271, 272, 98, 259 | 409, 431, 374, 421 | 67, 74, 66, 82 |
| parties fortes de Sacha (P14, P15, P22, P28) | 402, 149, 135, 198 | 415, 411, 413, 421 | 69, 67, 76, 81 |
| Léo (P11, P16, P21) | 338, 327, 324 | 421, 397, 393 | 76, 80, 78 |

- **Chez un même joueur, une partie faible est une partie qui meurt tôt** (sur un pic de la jade, en vol, avant 66 s). Elle n'est ni plus lente ni plus pauvre.
- **Réserve des relecteurs.** Ce n'est montré que sur la première minute de 2 habitués, avec 4 parties faibles d'un seul joueur. Que de vrais débutants
  conduisent autrement, **on ne le sait pas**.

L'heure à laquelle tombe chaque palier (`sortie.txt`) :

| palier | instant (s) | parties |
|---|---|---|
| 5 | 39 à 95 | 11 |
| 10 | 114 à 172 | 8 |
| 15 | 182 à 246 | 5 |
| 20 | 247 à 347 | 3 |
| 25 | 409 | 1 |

### 2.4 Les 15 mesures de E et le niveau

Sur les 11 parties de plus de 60 s (`sortie.txt`) :
- Seules la **nitro** (ρ = −0,75) et la **nitroSol** (ρ = −0,61) suivent le palier, et c'est surtout un effet de la durée : 72 à 78 % de nitro la première
  minute, moins ensuite.
- Les autres mesures sont des signatures **du joueur** (clavier ou doigt), pas du niveau. Exemple : la hauteur médiane d'un vol vaut 6 à 11 m chez Léo,
  25 à 69 m chez Sacha.
- **Conséquence.** La référence de E mêle des parties de 60 s et de 545 s. Un bot qui meurt tôt aura « trop » de nitro face à elle, un bot qui dure
  « trop peu ».
- Sur 11 parties, chaque ρ porte une incertitude énorme : ce sont des indices, pas des lois.

### 2.5 Peut-on décrire « un joueur de palier 3, 10, 20 » ?

**Non.** On a des parties à ces paliers, pas des joueurs de ce niveau (lecteur joueurs § 5). Ce qu'on sait décrire, c'est **une seule courbe, celle d'un
habitué** : son rythme (environ 150 à 400 pièces la première minute, puis 400 à 600 par minute), sa vitesse au fil du temps, l'heure de chaque palier.

Pour le palier 30 : aucun humain observé n'y arrive. **Aucune donnée de joueur ne peut étalonner le haut de l'échelle.**

### 2.6 L'enregistreur du jeu

`code/moteur/enregistreur-jeu.js` existe déjà (lecteur joueurs § 6) :
- éteint par défaut ; allumé par `?jeurec=1` ou dans l'app (réglages, 5 touchers sur la version, boîte noire, PARTIES) ;
- 10 échantillons par seconde et tous les événements (décollage, pose, pièce, mort et cause, changement de route) ;
- rangé seulement dans l'appareil (`ccJeuRec`) : 8 dernières parties, 1,6 Mo au plus ; **rien ne part vers un serveur** ;
- récupéré à la main (PARTAGER ou COPIER), déposé dans `ml/bot/etalon/`.

**Ce qui manque pour une échelle** : qui joue (aucun identifiant), le niveau du joueur au départ (son record `SAVE.d.ex.eng`, son nombre de parties
`SAVE.d.ex.runs`), la graine de la piste, un événement « raccourci payé », l'appareil et le mode de contrôle. La sauvegarde compte déjà des morts par niveau
(`ex.morts`, `ex.temps`, `code/sauvegarde.js:29`), jamais exportées.

**Combien de parties faudrait-il ?** Estimation du lecteur, pas une mesure : situer la moyenne d'un joueur à ±2 paliers demande environ 60 parties
(écart-type de Sacha environ 8 ; 1,96 × 8 / 2 ≈ 4, au carré ≈ 16, × 4). Une échelle demande plusieurs joueurs par tranche, débutants compris :
quelques dizaines de joueurs, des centaines de parties.

## 3. De quoi est fait un palier, et ce qui borne c0025

Source : `palier/lire-banc.js`, `palier/debit-et-survie.js`, `palier/vitesse-et-parfait.js`, sorties `palier/sortie-*.txt`.

### 3.1 Les 30 seuils

Le palier se lit dans les pièces (`coinsGot`) : une pièce vaut 1, une figure posée 2 à 18 (`../economie.md`). Seuils
(`code/gameplay/pickups-fruits.js:557`) : 0, 40, 85, 150, 225, 305, 400, 505, 615, 730, 860, 995, 1130, 1280, 1430, 1585, 1745, 1910, 2080, 2255,
2440, 2630, 2825, 3030, 3240, 3455, 3680, 3910, 4145, **4385**.

| palier | seuil | croisière (m/s ; km/h affichés) | m parcourus en 0,45 s |
|---|---|---|---|
| 1 | 0 | 70 (251 km/h) | 31 |
| 7 | 400 | 99 | 45 |
| 10 | 730 | 121 (436 km/h) | 55 |
| 20 | 2 255 | 275 (990 km/h) | 124 |
| 30 | 4 385 | 439 (1 580 km/h) | 198 |

Calcul du lecteur sur `engLate` (`code/gameplay/camera.js:317`) et `maxSp` (`code/moteur/boucle-1.js:183`) ; table complète dans
`palier/sortie-vitesse-et-parfait.txt`.

### 3.2 c0025 dans le banc des gènes

Source : `../banc-des-genes/etat/courses-2026-48.jsonl`, bras « depart », 96 courses ; 1 250 courses en tout.

| mesure | c0025 (96) | les 1 250 |
|---|---|---|
| palier moyen / médian | 6,83 / 7 | 6,84 / 6 |
| palier q10 – q90 / max | 3 – 11 / 14 | 3 – 11 / 19 |
| survie médiane | 123 s | 120 s |
| survie max | 286 s | 444,5 s |
| pièces par minute | 226,6 | 225,0 |
| **courses coupées par les 900 s** | **0** | **0** |

Risque de finir dans la minute :

| minute | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| c0025 | 18 % | 35 % | 69 % | 56 % | 100 % (7 courses) |
| les 1 250 | 20 % | 38 % | 60 % | 62 % | 68 % |
| joueurs | 21 % | 18 % | 44 % | 40 % | — |

**Le palier de c0025 est borné par la mort.** Pas par le temps (aucune course n'atteint 900 s), pas par les pièces posées : il faudrait 151 pièces par
minute pour le palier 30 en 30 min, et c0025 en fait 227.

**Il est limité deux fois** : il meurt à peu près aussi tôt que les joueurs, et ramasse environ moitié moins par minute (joueurs : 416 par minute sur
l'ensemble, 400 à 590 une fois lancés, `../humains.md`). À durée égale (parties de 120 à 180 s), 527 pièces en médiane contre 1 003 chez les joueurs
(`concepteur-libre/sortie-courbe-de-survie.txt` § 4).

Ce que valent son débit et sa survie au-delà de 5 min : **on ne sait pas**. Aucune de ses courses ne dépasse 5 min ; 2 courses sur 1 250 dépassent 7 min.

### 3.3 Le pilote parfait qui ne meurt jamais

Un calcul, pas une mesure (`palier/sortie-vitesse-et-parfait.txt`) : croisière du palier courant, sans nitro ni figures, densité de pièces qui suit
les portails, longueur de zone **non lue dans le code** (7 ou 11 km, hypothèses de `../economie.md`).

**Le palier 30 est atteignable en 4 à 10 minutes par un pilote qui ne meurt pas**, bien avant 900 s. Ce qui manque aux experts, c'est la survie.

### 3.4 La main tient-elle à la vitesse du palier 30 ?

- La main clavier (`ml/bot/doigts.js:113`) met environ 0,45 s du regard à la touche (décision toutes les 100 ms, réaction médiane 200 ms, suivi 150 ms).
- Les virages grandissent avec le palier (×1 à ×4,4) : le temps pour traverser un virage ne baisse que d'environ 30 % du palier 7 au palier 30.
- **Ce qui ne grandit pas devient ingérable** : la demi-route de 28 m, la portée de 40 m citée dans `yeux.js:457`. 40 m se traversent en 0,40 s au palier 7
  et en **0,09 s au palier 30**, moins que la main.
- Un humain a conduit au palier 28 (avec une seconde chance) : cette main n'est pas trop lente en soi pour un joueur. Rien ne prouve qu'elle puisse y rouler
  sans jamais mourir.
- Si les pics, trous et parois grandissent avec le palier : on ne sait pas, ce n'est pas lu.

## 4. Ce que la sélection sait faire, et ne sait pas

Source : `selection/*.js` et leurs sorties ; relecteur code (lecture de `git show origin/evolution-ryzen`, commit df26b9546).

**Ce qu'elle est.** F = â − 4 E (`ml/evolution/note.js`, `noter()`), où â est le palier ajusté « pilote + graine ». Elle ne cherche qu'**un** champion :
`population.json` a un seul `champion`, un seul `temoin` ; greffes, coffre, validation et pages en dépendent (le mot `champion` apparaît 46 fois dans
`tableau.js`, 42 dans `histoire.js`, 30 dans `arbre.js`).

**L'état du Ryzen** (`etat/resume.txt` au commit df26b9546, 16 h) : génération 19, 438 courses par heure. Le champion est toujours le témoin c0025 :
palier 6,5, E 0,77. « Mutations comptent-elles ? » : r 0,17, tau 0,43 [0,00 ; 0,72] (relecteur code).

**Ce qu'elle ne sait pas faire.**
- **Produire des niveaux.** À la génération 17, le palier moyen des vivants va de 6,39 à 8,16 ; sur 18 générations, il reste entre 5,8 et 9,0
  (`existant/sortie-etendue-population.txt`). L'écart vrai de niveau entre pilotes vaut **0,16 palier** sur les 13 bras du banc, **0,00** sur les 26 pilotes
  de la sélection du 27/11 (`niches/sortie-cases.txt`).
- **Régler le niveau sans toucher au style** : aucun gène ne le fait (`selection/genes-par-endroit.txt`). La main (réaction, erreurs) a ses boutons dans
  `doigts.js` (`REGLES`, l.90-98), mais elle n'est ni dans le PROFIL (écrit en dur dans `modele.js` l.55) ni dans le génome.
- **Juger la mort** : E n'a aucune mesure de la mort.
- **Juger sous 60 s** : `ressemblance.js` rend `null` sous 60 s (`MIN_S=60`, l.38).

**Ce qu'elle sait faire.**
- **Trier la ressemblance** : E varie vraiment, de 0,66 à 0,90, à ±0,03 près (`niches/sortie-cases.txt`).
- **Recalculer une note sans rejouer** : `note.js` n'est pas dans `FICHIERS_EPOQUE` (`commun.js` l.251). Changer `cfg.note` ne change que l'époque des notes.
  Un taux de mort se calcule depuis `survie_s` et `cause`, déjà dans les lignes.

**Ce qui coûte cher.**
- Toucher `ressemblance.js`, `mesures.js`, `modele.js`, `enfant.js`, `piloter.js`, `doigts.js` ou `yeux.js` : nouvelle époque des courses, **tout est rejoué**
  (la génération 16 a rejoué 352 courses sur 352).
- Changer le `tmax` : il est dans la clé d'une course (`courses.js`, `cle()`), donc rejouer.
- Une île de plus : 26 pilotes × 12 graines = 312 courses par génération, 38 à 55 min (`selection/generations-ryzen.txt`) ; cinq îles, environ 3,7 h.

**Ce qui est dangereux pour l'état du Ryzen.** Changer `cfg.note` sur l'état en marche (les renvois suivants obéissent à la nouvelle note, et **un renvoi
ne se défait pas**) ; changer le format de `population.json` (`etat.js` l.72 le refuse, les pages tombent) ; une seconde population dans le même dossier.
La parade : un `dossierEtat` **et** un `dossierChampions` neufs (`evoluer.js` l.56-59).

**Les gènes v4 ne tournent pas sur le Ryzen** : ses lignes n'ont ni la carte ni la cause de chaque mort (`causesMorts`). Leur fusion ouvrira de toute façon
une époque : c'est le moment le moins cher pour y poser d'autres changements (lecteur sélection).

**La puissance statistique** (`selection/bruit-par-niveau.txt`) : le bruit grandit avec le niveau (écart-type entre graines 2,4 au palier 5, 4,1 au-dessus
de 8 ; environ la moitié du palier). On tient **environ 9 niveaux distincts à 12 graines par pilote, 12 à 24 graines, 17 à 48, 24 à 96**, espacés de façon
géométrique. Ces chiffres sont extrapolés : aucun pilote n'est mesuré au-dessus d'un palier moyen de 9. Le relecteur chiffres les retrouve.

## 5. Ce qui existait déjà

Source : `existant/paliers-du-labo.js`, `existant/etendue-population.js`, sorties à côté ; copies d'état prises sur `origin/evolution-ryzen` au commit f8c071fa0.

**Promis, jamais fait** (`../../ETAPES.md`) :
- étape D : 30 profils dans `ml/ecurie/profils/`, `echelle.json`, `echelle.js` (niveau N = profil dont le meilleur palier sur 20 parties vaut N) : **aucun fichier** ;
- étape E : chaque niveau passé devant `discerner.js` : à faire ;
- étape F : `ml/ecurie/paquet/` (pour chaque palier, ses pilotes et des courses rejouables en fantôme) : **n'existe pas** ;
- les garages par niveau : pas faits, le bot joue toujours la sauvegarde neuve.

**Ce qui pourrait servir** : 116 rejeux (`ml/labo/rejeux/`), 139 trajectoires (`ml/labo/trajectoires/`), presque tous de paliers 5 à 13 ; des films.

**Les pilotes connus** (régime allégé) : tous ont un centre entre 5 et 8 sur les lots récents. Les pilotes de la boucle payante (c0003, c0011) avaient des
médianes de 11 à 13 sur 900 s, mais sans le critère de ressemblance. **Le plus haut palier d'un bot est 21** (c0023, une course). Aucun bot faible voulu
(paliers 1 à 4).

**Le niveau d'un même pilote bouge d'un lot à l'autre** : c0025 a une médiane de 7,5 sur le lot de 900 s, 4 en validation, 5 au coffre, 7 au banc.
Une échelle étalonnée se périme à chaque changement du jeu, pas seulement à chaque nouveau champion (relecteur chiffres).

**Dans le jeu.**
- **Aucun bot de `ml/` n'entre dans le jeu.** Il n'y a aucun serveur ; le classement mondial a été retiré le 30/09 (`code/gameplay/evenements-rares.js` l.207).
- Le niveau du joueur se lit dans `SAVE.d.ex.eng` (son record, 0 à 29). `../record.md` l.18 prévient : il faudrait le palier typique, que le jeu ne garde pas.
- **Le mode Survivant v2** a déjà des adversaires scriptés : sept voitures de police, une personnalité en quatre valeurs (`SURV_PILOTS` : agressivité, fautes,
  réaction, propreté de ligne), classement à la distance, un couperet toutes les 60 s (`code/interface/menu-logo.js` l.164-189). Dit « retiré de l'interface »
  par les études du 24/11, mais `#survBtn` est encore dans le code ; sa visibilité n'est pas vérifiée.
- Pour un fantôme sur la même route que le joueur, il faudrait une graine commune, la mémoire du sac coupée, le même régime, et un enregistreur qui note la graine,
  le palier et les figures.

## 6. Les trois conceptions

### 6.1 Les niches (`niches/`)

**L'idée, pour Sacha.** Au lieu d'un champion, une étagère de 8 cases, des débutants (paliers 1-2) aux très forts (20-30), plus une case « experts ».
Dans chaque case, on garde les 3 pilotes qui ressemblent le plus aux joueurs, mort comprise. Les enfants naissent de toutes les cases et vont dans celle de leur
niveau mesuré. Le concepteur dit lui-même : **un bon rangement, pas un moteur**.

**Les règles.**
- Cases (géométriques) : [1;2[, [2;3[, [3;4,5[, [4,5;6,5[, [6,5;9,5[, [9,5;14[, [14;20[, [20;30], plus EXPERT ; 3 places par case ; 360 courses par génération, environ 51 min.
- Position : palier moyen rétréci vers la note du parent (aujourd'hui `note.js` rétrécit vers la moyenne des vivants, ce qui ramènerait tout au milieu).
- Note dans la case : Q = −(E à durée égale + mesures de mort). Le palier ne sert qu'à choisir la case.
- Plus de champion ni de sacre : chaque case a son n° 1.
- Niveau k : palier moyen sur au moins 36 courses de graines neuves dans la case k.

**Les experts** : 60 graines neuves, `tmax` d'au moins 1 800 s, palier 30 atteint sans mort 60 fois sur 60 (risque borné sous 5 % par course).

**Ce qu'il a mesuré, sans course** (`niches/sortie-cases.txt`) : six cases sur huit sont vides ; tous les pilotes tombent dans [4,5;6,5[ et [6,5;9,5[.
Mais course par course, les 2 139 courses déjà jouées finissent dans toutes les cases de 1 à 20 :

| case | [1;2[ | [2;3[ | [3;4,5[ | [4,5;6,5[ | [6,5;9,5[ | [9,5;14[ | [14;20[ | [20;30] |
|---|---|---|---|---|---|---|---|---|
| courses | 53 | 72 | 471 | 517 | 580 | 366 | 79 | 1 |

**La première étape** (zéro code, environ 550 courses, 1 h 20) : un état séparé où la génération 0 naît de grosses mutations (20 à 40 gènes, sigma 0,5).
Critère écrit d'avance : l'idée vit si l'écart vrai entre pilotes atteint 1,5 palier, si deux lots se corrèlent à 0,5 au moins, et si 3 cases sur 8 ont un
pilote stable. Elle meurt sous 0,75.

**Budget** : cinq niveaux du bas, environ 8 300 courses, 20 h de Ryzen (estimation), **si** le bouton « niveau » existe. Les cases au-dessus de 9,5 ne
s'achètent pas en courses : aucun candidat.

**Ce qui le ferait abandonner** : aucun axe de niveau héritable ; ou le « concurrent gratuit », une étagère de **courses** triées par ressemblance, si
Sacha veut des fantômes.

### 6.2 Le handicap (`handicap/`)

**L'idée, pour Sacha.** On n'élève qu'un pilote, le meilleur possible dans le style des joueurs. Un niveau n'est pas un autre pilote : c'est le même, avec une
« molette de handicap » (main plus lente, fautes, nitro mal placée) réglée jusqu'à ce que ses paliers tombent où l'on veut. Les 30 niveaux sont 30 crans
sur une seule courbe. La molette ne fait que descendre : elle ne fabrique pas l'expert.

**Les règles.**
- La sélection ne change pas de structure. La note devient F′ = â − 4 E′, avec E′ à durée égale (11, 9, 5 et 3 parties de joueurs encore vivantes à 60, 120,
  180 et 240 s) et une mesure de débit de pièces à temps égal.
- Aucune mesure de la mort dans la note du pilote de base : « mourir comme un joueur » se juge à l'étalonnage.
- Gènes du handicap figés (génome v5) ; les niveaux vivent hors de la population (`ml/ecurie/echelle/niveaux.json`) ; chaque nouveau champion périme l'échelle.
- **Niveau k = record sur 20 parties** (le quantile 96,6 % des paliers), parce que le jeu ne connaît que le record du joueur.

**Ce qu'il a mesuré** (`handicap/sortie-courbe-du-handicap.txt`) : c0025 sans handicap a une médiane de 7 et un record sur 20 parties de 13 (11 à 14) :
**c'est déjà un « niveau 13 »**. Son record vaut 1,86 fois sa médiane ; chez le joueur au clavier, 2,8 fois. **Le bot est trop régulier.**

**Les experts** : seconde chance refusée, `tmax` 1 800 s, palier 30 sans une mort puis 5 minutes tenues. 59 courses sans mort bornent la réussite à 95 %.
Sa voie n'apporte qu'un test : « main machine », pour savoir si la main de 0,45 s est le verrou.

**La première étape** (une journée, sans toucher `ml/evolution`) : cinq copies de `ml/ecurie/pilote-voltige.js` (témoin ; réaction ×1,5 ; fautes ;
`nitroDecor` 1,5 ; main machine), 48 graines neuves chacune, 240 courses. Prouvée si un bouton baisse la médiane d'au moins 2 paliers, si trois crans sortent
dans l'ordre et un quatrième est prédit à ±1 palier, si E′ et l'AUC du discerneur ne montent pas, et si la part de morts en vol ne baisse pas.

**Budget** : 5 niveaux, environ 1 500 courses, 3,5 h ; 30 crans, environ 2 500 courses, 6 h, mais seulement jusqu'au record du pilote de base (13 aujourd'hui).

**Ce qui le ferait abandonner** : le handicap trahit le bot ; la courbe ne se répète pas ; le pilote de base ne monte pas ; de vrais débutants conduisent
autrement ; Sacha veut l'invincible et l'humain tirés du même pilote. Le concepteur signale un conflit : la nitro des joueurs a déjà coûté 1,5 à 2,5 paliers
(`../../ETAPES.md` l.225). **Une seule lignée ne sert pas les deux familles.**

### 6.3 La voie libre : une courbe, deux notes, une banque de courses (`concepteur-libre/`)

**L'idée, pour Sacha.** Chez les joueurs, une partie faible meurt tôt. On n'élève donc qu'**un pilote « habitué »**, et ses courses sont rangées par palier
d'arrivée dans une **banque** : la course morte au palier 4 sert d'adversaire au joueur de niveau 4. Les experts sont élevés à part : lâchés au moteur 10, puis
15, 20, 25, 30, on ne garde que ceux qui ne meurent pas.

**Ce qu'il a mesuré** (`concepteur-libre/sortie-courbe-de-survie.txt`) :

| part des parties qui atteignent… | joueurs (14) | c0025 (96) |
|---|---|---|
| le palier 5 | 79 % [52–92] | 76 % [67–83] |
| du 5 au 10 | 73 % [43–90] | **27 % [18–39]** |
| du 10 au 15 | 63 % [31–86] | 0 sur 20 |

**c0025 est déjà « un habitué » jusqu'au palier 5, puis il décroche.** Une course finie au palier 8 dure 145 s (joueur : 153 s) ; au palier 12, 236 s
(joueur : 157 s).

**Les règles.**
- Famille H : F_H = min(â ; 11,6) − 4 E − 2 M ; nitro et nitroSol à poids 0 ; M, la mort, calculée sans rejouer sur quatre marches et les pièces à durée égale.
- Famille X : état séparé, départ au palier imposé, `tmax` 300 s, note = part de 300 s survécue ; passage de classe à 90 % sur 48 graines.
- La banque (`ml/ecurie/paquet/banque.js`) : rejouer avec trace et ranger chaque course sous son palier final. Le simulateur est répétable.
- Niveau k : un lot d'au moins 40 courses finies au palier k, d'un pilote qui passe le test « meurt comme un joueur » (marches, risque par minute, pièces à durée
  égale, causes, seconde chance).
- Expert : 300 graines neuves, `tmax` 1 200 s, palier 30 et aucune fin par une mort ; une seconde chance prise compte comme une défaite.

**La première étape** (une journée) : **A**, c0025 lâché aux paliers 7, 10, 15, 20, 25, 30 (144 courses) ; **B**, 40 courses du banc finies aux paliers
4 à 8 rejouées avec trace et passées à `ml/bot/discerner.js` contre les mêmes fenêtres de temps des joueurs (AUC ≤ 0,75 : la banque vaut pour le bas ;
≥ 0,90 : l'idée est morte).

**Budget** : 5 niveaux (1-2, 3-4, 5-6, 7-9, 10-14), 782 courses, environ 2 h ; seuls 1 à 8 sont crédibles à l'heure humaine. Le diplôme d'un expert :
300 × 1 200 s, environ 7 h.

**Ses faiblesses, dites par lui** : le plafond 11,6 éteint la pression vers le haut ; les intervalles des joueurs ne refusent que les écarts grossiers ;
un niveau fait par tri reste « un habitué qui meurt tôt », rien ne dit que c'est un débutant.

## 7. Ce que les relecteurs ont fait tomber

Quand une attaque contredit une lecture ou une conception, c'est la version du relecteur qui est écrite ici.

### 7.1 Ce qui vaut pour les trois

| ce qui était écrit ou supposé | qui | ce qui reste |
|---|---|---|
| Le haut de l'échelle humaine | relecteur chiffres | Tout ce qui dépasse le palier 21 repose sur **deux parties rattrapées par une seconde chance**. |
| « c0025 meurt comme les joueurs » | relecteur chiffres | Ni « il meurt comme eux » ni « il meurt plus » ne se démontre : 0,39 mort par minute [0,22–0,64] chez les joueurs, 0,52 chez c0025. |
| Le champ `morts` des lignes, « morts > 1 = seconde chance » | relecteurs chiffres et sélection | `morts` compte les morts **en vol** (`b.morts_en_vol`). Le « 7 % de secondes chances » de c0025 n'est pas établi. |
| Une échelle étalonnée tient jusqu'au prochain champion | relecteur chiffres | Elle se périme aussi à chaque changement du jeu (c0025 : médiane 4 à 7,5 selon le lot). |
| Le côté jeu (le matchmaking) | relecteur but | **Aucune voie ne le traite.** Servir un bot ou une course est un changement du jeu. |
| Les budgets des experts | relecteur but | Ils supposent qu'une seconde de jeu coûte autant au palier 30 qu'aujourd'hui. On ne le sait pas. |

### 7.2 Le départ à un palier imposé (`TEST_PAL`)

Trois versions se contredisaient. Celle qui reste, lue dans le code par les relecteurs code et but :
- `TEST_PAL={on:false,n:15}` (`code/economie/aura-banque-contrats.js:85`) n'est **pas figé** : c'est un objet dont les propriétés se changent.
  Le concepteur des niches avait écrit « figé, à demander » : **faux**.
- `J.ev` évalue du code dans le jeu (`ml/reel/jeu-reel.js:145`) ; `window.dbgTremble({tier})` impose déjà `engTier` et `coinsGot`
  (`code/moteur/banc-tremble.js:14`). On peut donc l'imposer sans toucher au jeu. **Personne ne l'a essayé.**
- **Mais ce n'est pas ce que disait la voie libre.** `TEST_PAL` donne d'un coup des pièces à la caisse (`addCoins(E.coins - coinsGot)`) une fois la partie
  lancée : les pièces et le palier mesurés sont faussés dès le départ. Et la caisse roule au moteur 30 **sur la piste et la densité d'un début de partie** :
  les virages sont construits pour le palier + 2, la densité suit les portails franchis. Que la piste se recalcule : non vérifié.
- L'indice : `ENGINE_TIERS[TEST_PAL.n]`, donc le palier 30 s'écrit `n:29` (relecteur but). Le relecteur code demandait de le vérifier.
- **Conséquence** : l'épreuve A ne mesure pas l'expert de Sacha. Un « moins de 10 s » condamne ; un « 60 s ou plus » ne prouve rien. C'est un filtre négatif.

### 7.3 Les niches

| ce qui était écrit | qui | ce qui reste |
|---|---|---|
| « L'axe niveau n'est pas sélectionnable » | relecteur chiffres | **Trop fort.** L'écart de 0,16 est mesuré sur des bras qui sont c0025 avec un ou deux gènes changés. Des cerveaux différents (c0003, c0011) tenaient des médianes de 11 à 13 sur 900 s. |
| La preuve de l'expert, 1 h 30 | relecteur chiffres | 60 courses de 1 800 s, c'est environ **2,0 h** (même hypothèse de coût). |
| « 504 pièces par minute sur les parties de 240 à 400 s » | relecteur chiffres | Ne se retrouve pas : 481, 501 ou 520 selon la méthode, sur 2 parties. Inutilisable comme cible. |
| Les heures de passage et les deux références d'E par durée | relecteur chiffres | Le palier 20 repose sur 3 parties, le 15 sur 5 ; les références sur 6 et 5 parties ; rien pour le bas. |
| L'étagère | relecteur code | Elle réécrit `evoluer.js` en profondeur et retire le coffre, seul garde-fou contre une dérive. Dans une case, Q sans palier laisse dériver vers le bord de la case. |
| Les trois cases du bas | relecteur code | Injugeables : E est muet sous 60 s. La conception l'admet. |
| La voie entière | relecteur but | **Elle se réfute elle-même** : elle ne livre rien avant qu'on trouve un bouton « niveau », et ce bouton, c'est la voie du handicap. Son « concurrent gratuit », l'étagère de courses, est la voie libre. |

### 7.4 Le handicap

| ce qui était écrit | qui | ce qui reste |
|---|---|---|
| Rapport record/médiane du joueur 2,8 ; « un record de 28 à 30 demande une médiane de 11 à 15 » | relecteur chiffres | Vient d'un seul joueur, 10 parties, et tient à la partie à 28 rattrapée. Sans elle : 15/6,5 = 2,3. |
| « Palier 10 vers 183 s contre 120 s » | relecteur chiffres | Les 183 s sortent d'une droite ajustée : aucune ligne du banc ne note l'instant d'un palier. Ordre de grandeur cohérent, **pas une mesure**. |
| Prédiction : survie médiane de 60 à 72 s | relecteur chiffres | Au débit de c0025 sous 60 s (218 pièces par minute), une médiane au palier 4 ou 5 correspond à **41 à 62 s**. À corriger avant de jouer. |
| « 0,35 à 0,5 faute mortelle de plus par minute » | relecteur code | Les boutons (`manque`, `retard`, `sur`, `bruit`) sont des probabilités par appui, pas des morts. Leur effet se mesure, il ne se calcule pas. |
| « Réaction ×1,5 » | relecteur code | N'existe pas : on écrit des durées `[p10, p50, p90]`, arrondies en images de 1/60 s. |
| Le test « main machine » dit si la main est le verrou | relecteur code | La réaction tombe à 0, mais la décision reste cadencée à 100 ms (`doigts.js` l.148). Il borne l'apport de la main clavier, sans plus. Et ce cerveau a été réglé pour la main clavier : il risque de conclure à tort. |
| Budget de 5 niveaux, avec « 100 parties enregistrées pour le juge » | relecteur chiffres | Si ce sont des parties de joueurs, le Ryzen ne peut pas les produire. |
| Classer sur le record | relecteur but | Contredit son propre défaut mesuré : calé sur le record d'un joueur, le bot a une médiane trop haute ; calé sur sa médiane, un record trop bas. Le handicap resserre encore (médiane 3, record 8, calcul). « La forme du jour » n'est pas construite. |
| Un débutant | relecteurs code et but | Aujourd'hui ce serait **un expert saboté** : même ligne, même nitro, mêmes vols. Le seul indice va contre : des erreurs ajoutées font passer les changements de sens de 0,89 à 0,81 par seconde, quand les joueurs sont à 1,24 (`ml/bot/README.md` § 3.8, 8 courses d'un autre cerveau). |
| Le génome v5 aux gènes de main figés | relecteur but | Inutile tant que la première étape n'a pas parlé : une époque payée d'avance. |

### 7.5 La voie libre

| ce qui était écrit | qui | ce qui reste |
|---|---|---|
| L'épreuve A | relecteurs code et but | Voir § 7.2 : elle ne met pas la caisse sur la piste d'un vrai palier 30. À refaire après avoir mesuré ce que `TEST_PAL` pose. |
| Le plafond 11,6 | relecteurs chiffres et code | Compte les deux parties rattrapées (sans elles, 9,4). Sans effet tant que â vaut 6,8. |
| La note M | relecteurs chiffres et code | Des cibles à ±30 points ; ±0,14 par marche à 12 graines : du bruit dans des renvois qui ne se défont pas. **À ne pas faire avec 14 parties.** |
| Les pics : 3 sur 4 contre 7 %, p = 0,0014 | relecteur chiffres | Les trois morts sont d'un seul joueur, sur la jade : trois tirages liés traités comme indépendants. |
| Le test (d) sur « tour » (43 % des courses de c0025 aux paliers 1 à 3) | relecteurs chiffres et but | **Désaccord entre relecteurs.** Le relecteur chiffres retrouve 6 sur 14 ; le relecteur but ne le retrouve pas. Le relecteur chiffres ajoute que la borne des joueurs est prise tous paliers confondus, et qu'ils n'ont aucune partie aux paliers 2 et 3 : le test ne compare pas la même chose. |
| « 30 niveaux en 600 à 2 000 courses » | relecteur chiffres | Suppose un pilote qui n'existe pas : 46 courses du banc finissent entre 14 et 19, 0 au-dessus. |
| `palierDepart` gratuit avec la fusion v4 | relecteur code | Il touche `piloter.js`, un fichier d'époque. Gratuit seulement si les deux tombent le même jour. |
| La banque | relecteur code | Toute course gardée dépend de la version du jeu (dans la clé) ; le jeu n'enregistre pas la graine ; elle ne trie que c0025, dont les courses aux paliers 10 à 14 durent 1,5 fois trop longtemps. |
| La seconde chance comptée comme défaite | relecteur but | Elle coûte déjà un palier moteur (`CHANCE.moteurPerte`, `code/gameplay/seconde-chance.js:188`). Se justifie, mais c'est à Sacha. |

### 7.6 Les experts

Aucune conception ne construit l'expert du palier 30, et les trois le disent. **Leurs deux sondes n'en sont pas** (relecteur code) : « main machine » ne
mesure pas une main sans délai ; l'épreuve `TEST_PAL` ne met pas la caisse sur la piste d'un vrai palier 30.

Ce qui reste, dans les chiffres retrouvés par le relecteur chiffres :
- tenir 15 min dans 95 % des courses demande 0,34 % de risque par minute ; tenir 20 min dans 99 %, 0,05 % ;
- c0025 est à 18 à 69 % par minute : **50 à 200 fois trop** pour la première cible, environ 1 000 fois pour la seconde ;
- ce n'est ni du réglage (12 bras déplacent le palier moyen de 0,75 au plus) ni du temps de calcul (sans mort, le palier 30 tombe en 4 à 10 min) ;
- 1 mort sur 22 était imposée même à une conduite idéale (`../avant-le-bord/LISEZ-MOI.md` § 2.1) : un seul cas, **on ne sait pas si le jeu permet zéro mort** ;
- aucun humain observé n'y arrive. **L'expert ne peut pas être jugé sur E.**

## 8. Le classement des relecteurs

| rang | relecteur chiffres | relecteur code | relecteur but |
|---|---|---|---|
| 1 | Handicap, première étape (prédiction corrigée à 41-62 s) **et** voie libre, épreuve A, le même jour (environ 400 courses) | Handicap, première étape : la moins chère, aucun risque pour le Ryzen, la seule qui teste la main | **Voie libre**, banque et test B seulement : livre le plus tôt (paliers 1 à 8, environ 2 h), rien ne s'y défait |
| 2 | Voie libre, test B (la banque), si Sacha choisit les fantômes | Voie libre, test B ; A à corriger avant d'être jouée | Handicap, première étape, pour des bots en direct ; et le test « main machine » |
| 3 | Niches, seulement si les grosses mutations donnent 1,5 palier d'écart vrai | Niches, l'étape génération 0 ; l'étagère à ne pas faire tant que le niveau ne se transmet pas | Niches, un rangement pour plus tard |

**Ils s'accordent sur ceci :**
- aucune des trois ne justifie aujourd'hui de toucher à `evoluer.js`, au génome ou au `cfg.note` du Ryzen ;
- tout essai passe par un `dossierEtat` et un `dossierChampions` neufs ;
- aucune ne peut étalonner quoi que ce soit au-dessus du palier 21 sur des joueurs ;
- la note F_H (plafond et M) n'est pas à installer avec 14 parties.

**Le mélange proposé par le relecteur but**, sur une journée de PC libre, sans toucher à la note ni à l'état du Ryzen :
- le bas de l'échelle : le test B (une banque de courses de c0025 aux paliers 1 à 8, avec la mention « extrapolé de 2 joueurs habitués, 14 parties ») ;
- la note : E à durée égale avec une mesure de la mort, **recalculée sur le cache** pour voir ce qu'elle classerait, installée seulement avec la fusion v4 ;
- les experts : deux filtres négatifs, l'épreuve A (`n:29`) et « main machine » ;
- les bots en direct : la première étape du handicap, seulement si Sacha veut des adversaires qui conduisent.

Le nombre de niveaux, dit-il, **ne se demande pas à Sacha : il se mesure** (environ 9 à 12 graines, 12 à 24).

## 9. Les questions pour Sacha

Fermées, telles que le relecteur but les pose :
1. « Ne pas perdre du tout », est-ce **atteindre le palier 30 sans aucune mort**, une seconde chance prise comptant comme une défaite ? Oui ou non.
   (Les autres lectures : ne jamais être dernier au mode Survivant ; finir devant le joueur à la distance ou à l'argent.)
2. Le matchmaking se fait-il avec des **fantômes** (des courses enregistrées, rejouées sur la même piste que le joueur) ou avec des **bots qui conduisent en
   direct** ? Fantômes ou direct.
3. Peut-on ajouter à l'enregistreur du jeu (il reste dans l'appareil, rien n'est envoyé) un identifiant anonyme, le record, le nombre de parties et la graine,
   puis faire enregistrer des parties à d'autres joueurs, **débutants compris** ? Oui ou non.

Deux de plus, soulevées par le concepteur du handicap :
4. Un joueur se range-t-il sur **son record** (ce que le jeu garde) ou sur **son palier typique** (ce que `../record.md` conseille, et que le jeu ne garde pas) ?
5. L'expert et le bot « humain » peuvent-ils venir de **deux lignées différentes** ? (Une seule ne sert pas les deux familles, § 6.2.)

## 10. Ce qui reste à mesurer, et ce que cela coûterait

Rien de cela n'a tourné : le PC est pris par une vague du banc et une mesure.

| mesure | ce qu'elle tranche | ce qu'il faut toucher | coût |
|---|---|---|---|
| **Handicap, première étape** : 5 copies du pilote × 48 graines | un bouton de main ou de choix baisse-t-il le palier sans trahir le bot ? | rien dans `ml/evolution` ; des copies de `pilote-voltige.js` dans un dossier d'étude | 240 courses, puis 3 crans × 48 ; courses courtes ; prédiction à corriger (41-62 s) |
| **Test B** : 40 courses du banc aux paliers 4 à 8 rejouées avec trace, passées au discerneur | une course de c0025 qui meurt tôt passe-t-elle pour une partie de joueur ? | un script d'étude | 40 courses courtes, moins d'une heure (ordre de grandeur) |
| **Ce que pose `TEST_PAL`** : lire avec `J.ev` la piste, la densité et les pièces après imposition | l'épreuve A a-t-elle un sens ? | un script d'étude | quelques courses |
| Épreuve A : c0025 lâché aux paliers 7 à 30 | les experts sont-ils hors de portée avec ces yeux ? (filtre négatif) | un script d'étude | 144 courses de 300 s au plus, moins d'une heure |
| Grosses mutations (génération 0 des niches) | existe-t-il un axe de niveau héritable ? | un état séparé, un `config-essai` | environ 550 courses, 1 h 20 |
| Recalculer une note « à durée égale + mort » sur le cache | ce qu'elle classerait, sans renvoi | lecture du cache, sur le Ryzen | aucune course |
| Le diplôme d'un expert | la borne de risque | `tmax` long, nouvelles clés | 59 × 1 200 s ≈ 1,3 h ; 60 × 1 800 s ≈ 2,0 h ; 300 × 1 200 s ≈ 7 h (si une seconde coûte autant au palier 30) |
| De vraies parties de débutants et d'autres joueurs | tout le bas et le haut de l'échelle | l'enregistreur, donc le jeu : **décision de Sacha** | des dizaines de joueurs, des centaines de parties (estimation) |

**Ce qu'on ne sait pas du tout :**
- si de vrais débutants conduisent comme un habitué qui meurt tôt ;
- le temps de réaction des joueurs (`doigts.js` l.77 : l'enregistreur à 10 échantillons par seconde ne le mesure pas) ;
- comment se comporte un bot au-delà de 5 min ;
- si le jeu permet de ne jamais mourir au palier 30 ;
- si les obstacles grandissent avec le palier ;
- combien de générations il faudrait pour doubler le ramassage du pilote (0 nouveau champion en 19 générations).

## 11. Ce que l'on en fait

*Décision de la session principale, le 28/11/2026, après lecture des dix rapports. Aucune course n'avait été jouée pour cette étude.*

**1. On ne touche pas à la sélection du Ryzen pour l'instant** : ni sa note, ni son génome, ni `evoluer.js`. Les trois relecteurs le demandent, et un renvoi
ne se défait pas. Tout essai d'échelle se fait dans un dossier d'étude ou un état neuf.

**2. Le fait qui pèse le plus n'est dans aucune des trois conceptions : c0025 ramasse moitié moins de pièces par minute que les joueurs** (227 contre 416 ;
à durée égale 527 contre 1 003, § 3.2), alors qu'il meurt à peu près aussi tôt qu'eux. Or le palier, ce sont les pièces. À survie égale, un pilote qui
ramasserait comme un joueur aurait le palier d'un joueur, et lui ressemblerait davantage : le même levier sert le palier, la ressemblance et les deux
familles. **La mesure suivante est donc : d'où viennent les pièces des joueurs** (pièces ramassées sur la route, figures posées, vitesse, nitro, vols,
raccourcis), minute par minute, face à c0025. Elle ne coûte aucune course : les parties des joueurs et les lignes du banc gardent ces événements.

**3. Le bas de l'échelle se fera d'abord par le tri** (la voie libre, test B) : chez les joueurs, une partie faible est une partie qui meurt tôt (§ 2.3),
et les courses déjà jouées finissent à tous les paliers de 1 à 19 (§ 6.1). C'est ce qui livre le plus tôt, et rien ne s'y défait. Le test B est joué dès
que le PC a deux cœurs libres, avec son critère écrit avant (AUC du discerneur ≤ 0,75 : la banque vaut pour le bas ; ≥ 0,90 : l'idée est morte).

**4. Le handicap est essayé ensuite** (première étape, 240 courses, prédiction corrigée à 41-62 s), parce que c'est la seule voie qui donne des bots qui
conduisent en direct. Son risque est écrit : un expert saboté n'est pas un débutant.

**5. Les niches ne sont pas construites.** C'est un rangement, pas un moteur : elles attendent qu'un axe de niveau existe.

**6. Les experts : rien n'est promis.** Il faut 50 à 200 fois moins de morts par minute qu'aujourd'hui, et on ne sait pas si le jeu le permet. Deux mesures
bon marché d'abord : lire ce que pose vraiment un départ à palier imposé, puis lâcher c0025 aux paliers 10 à 30 comme filtre (« il tient moins de 10 s »
condamnerait ces yeux et cette main ; l'inverse ne prouverait rien). L'expert aura sa propre lignée et sa propre note (la survie), dans un état à part.

**7. La note de la sélection changera en une seule fois**, quand on saura quoi y mettre (ressemblance à durée égale, débit de pièces, mort), recalculée
d'abord sur le cache pour voir ce qu'elle classerait.

**8. Ce qui est écrit partout désormais** : tout niveau au-dessus du palier 21 ou sous le palier 4 est « extrapolé de 2 joueurs habitués, 14 parties ».

**9. Les questions posées à Sacha le 28/11** (§ 9) : le sens de « ne pas perdre », fantômes ou bots en direct, l'enregistreur enrichi pour d'autres
joueurs. Sans réponse, le travail continue sur les deux voies bon marché (le tri et le handicap), qui servent l'une les fantômes, l'autre le direct.

## 12. Les fichiers

Tous en lecture seule : ils relisent des fichiers du dépôt et n'écrivent que dans ce dossier. Refaire : `node <script>` depuis la racine du dépôt
(chemins relatifs, jamais `/c/…` sous Git Bash). Aucun fichier n'a été supprimé.

| fichier | rôle |
|---|---|
| `lecteur-joueurs/parties.js` → `sortie.txt`, `sortie.json` | les 14 parties, partie par partie ; corrélations des 15 mesures avec le palier (§ 2) |
| `lecteur-joueurs/a-temps-egal.js` → `a-temps-egal.txt` | les joueurs minute par minute ; causes ; versions du jeu (§ 2.3) |
| `palier/lire-banc.js` → `sortie-lire-banc.txt` | c0025 et les 1 250 courses du banc (§ 3.2) |
| `palier/debit-et-survie.js` → `sortie-debit-et-survie.txt` | débit selon la durée, risque par minute |
| `palier/vitesse-et-parfait.js` → `sortie-vitesse-et-parfait.txt` | les 30 paliers, la vitesse, le pilote parfait (§ 3.1, 3.3) |
| `selection/champs-des-lignes.js` → `champs-des-lignes.txt`, `champs-des-lignes-banc.txt` | ce que garde une ligne de course (§ 4) |
| `selection/palier-et-pieces.js` → `palier-et-pieces.txt` | pièces par seconde des bots |
| `selection/bruit-par-niveau.js` → `bruit-par-niveau.txt` | le bruit selon le niveau ; niveaux tenables (§ 4) |
| `selection/generations-ryzen.js` → `generations-ryzen.txt` | cadence et étendue des générations du Ryzen |
| `selection/genes-par-endroit.txt` | les gènes rangés par ce qu'ils règlent |
| `existant/paliers-du-labo.js` → `sortie-paliers-du-labo.txt` | les pilotes connus et leurs paliers (§ 5) |
| `existant/etendue-population.js` → `sortie-etendue-population.txt` | l'étendue de la population, génération par génération |
| `existant/generations-ryzen-f8c071fa0.jsonl`, `population-ryzen-f8c071fa0.json` | copies de l'état du Ryzen (commit f8c071fa0) |
| `niches/cases-deja-remplies.js` → `sortie-cases.txt` | les cases, l'écart vrai entre pilotes, les courses par case (§ 6.1) |
| `handicap/courbe-du-handicap.js` → `sortie-courbe-du-handicap.txt` | crans d'E′, record sur 20 parties, risque par minute, bornes (§ 6.2) |
| `concepteur-libre/courbe-de-survie.js` → `sortie-courbe-de-survie.txt` | les marches de palier, pièces à durée égale, causes (§ 6.3) |
| `relecteur-chiffres/recompter.js` → `sortie-recompter.txt` | le recomptage indépendant (§ 7) |

Les relecteurs code et but n'ont écrit aucun fichier : ils ont lu le code (fichiers cités au § 7) et `git show origin/evolution-ryzen` (commit df26b9546).
