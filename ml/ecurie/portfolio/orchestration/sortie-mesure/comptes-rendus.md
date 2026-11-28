# La mesure de la sortie préparée : les comptes rendus des agents

Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l'outil les remet en texte, sans rien réécrire. Ce sont les mots des agents : ce qu'ils affirment n'a pas été recontrôlé ici.

- Orchestration : `sortie-preparee-mesure` (wf_e9f81f3f-6ec), lancée par la session principale (Claude Fable).
- Agents : 2, tous du modèle claude-opus-5-5.
- Durée : 43 min ; jetons consommés par les agents : 503 584 (0,50 millions) ; appels d'outils : 101.
- Le script lui-même est à côté : `script.js`.

## Les agents, dans l'ordre de lancement

1. mesureur : un pilote de diagnostic, des courses à carte tenue, le tableau des décollages au bord (phase « Mesure »)
2. relecteur : refait les calculs par un autre chemin et propose une règle chiffrée (phase « Relecture »)

## 1. mesureur

*Rôle : mesureur : un pilote de diagnostic, des courses à carte tenue, le tableau des décollages au bord. Phase : Mesure.*

## Étude « sortie préparée » : mesure des décollages de c0025

Tout est dans le dossier neuf C:\Users\sacha\code\CASH-CAR-genes-v4\ml\ecurie\etude\sortie-preparee\ (non suivi par git). Aucun fichier suivi n'a été modifié (`git status` : seul ce dossier, en `??`). Rien n'a été écrit dans CASH-CAR-bots-ecurie, ni dans ml/evolution/etat. Pas de commit.

**Réponse courte :** aucune règle qui lit les rayons du bord pour changer de façon (R1 à R4) ne peut sauver quoi que ce soit chez c0025. Sur les 27 décollages subis mortels, ni `rien` ni `plane` n'annonçait une pose ou la lèvre. La seule règle qui touche beaucoup de décollages est la nitro seule (R5), et on ne sait pas si elle sauve ou si elle tue.

### Fichiers
- `pilote-diag.js` : le texte du pilote né du génome c0025 (v:4, id 19e3767cc346), plus `DIAG_CODE`. Ces lignes recopient seulement l'état interne (façon tenue, vol voulu, raccourci engagé) dans un champ `diag` de l'ordre, que l'hôte retire.
- `course-diag.js` : une course comme enfant.js (il requiert ses `envelopper`, `resultatCompact` et `optionsCourse`, et recopie `tenirLaCarte`).
  - En `--diag 1`, l'hôte demande en plus aux yeux la loi fidèle et les lois de secours S1 et S2. Il retire ensuite les rayons `retour0..2` et `vol.retours` de la vue avant de la donner au pilote.
  - Chaque vue est gardée dans un fichier JSONL compressé.
- `mesurer.js` : les 40 courses et les 3 courses de référence (2 à la fois au plus, priorité basse, reprise possible), puis la preuve.
- `analyser.js` : les tableaux, rejouables sans course à partir de `sorties/lignes/*.jsonl.gz` (2,3 Mo).
- `sorties/decollages.txt` et `sorties/decollages.json`, `sorties/preuve.json`, `sorties/mesure.log`, `LISEZ-MOI.md` (pour le jury, avec les dix lignes de ce que le pilote sait).

### Preuve que le diagnostic ne change rien
Course identique avec et sans diagnostic : mêmes empreinte, empreinteVues, empreinteTouches, palier, survie, cause et pièces. Vérifié sur 3 courses et 2 graines :
- grotte tenue 3970400 (c51ab14fd94f / abe50e0ec984 / ef9d984e0e58) ;
- sans carte 3970400 ;
- jade tenue 3970437, 180 s pleins (d52937d0bf45, 767 pièces).

### Les courses
- **Graines :** plage de l'essai du banc v2, 3 963 000 + 37·i avec i = 200 à 207 (3 970 400 à 3 970 659). C'est hors des plages réservées et hors de la vague d'essai (i = 0 à 5).
- **Plan :** grotte, ville, jade et canyon en carte tenue, 8 graines chacune, plus 8 courses sans carte imposée ; tmax 180.
- **Bilan :** 40 courses, 66,7 min de course, 252 décollages (185 subis, tous par le bord ; 67 voulus), 21,5 min d'horloge. 0 erreur, aucune seconde chance prise.
- 3 décollages de moins de 0,1 s n'ont aucune vue en vol et échappent à la mesure (252 vus sur 255).

### Chiffres clés
**a. Décollages subis, par carte :**

| carte | décollages subis | morts | causes | mort après (médiane) |
|---|---|---|---|---|
| canyon | 33 | 10 (30 %) | paroi 8, canyon 2 | 0,15 s |
| grotte | 37 | 9 (24 %) | roche 9 | 0,55 s |
| ville | 23 | 3 (13 %) | | |
| jade | 74 | 4 (5 %) | | |

- Les sorties voulues tuent en ville : 5 morts sur 22 raccourcis, contre 1 sur 45 ailleurs.
- **Le bord est vu tard.** Première annonce 0,3 s avant le décollage en médiane (0,2 à 0,6 s). À la dernière vue au sol, `tn.t` vaut 0,05 s en médiane.
- Les rayons du bord existent 0,3 s avant le décollage pour 130 vols sur 185, 0,7 s avant pour 13, et 1,2 s avant pour 1 seul.
- Aucun décollage sur 252 ne part avec la nitro demandée à la dernière vue au sol.

**b. Fiabilité du rayon `versRoute` du bord :**
- « pose propre » : 87 posés sur 93 (94 %).
- « choc » sans bascule en vol : 15 morts sur 16.
- « air ou fond » : 22 posés sur 26, toujours après une bascule.
- Les rayons `rien` et `plane` du bord ne peuvent pas être vérifiés : le pilote ne les prend jamais.

**c. Les 27 décollages subis mortels :**
- Combinaisons rien / versRoute / plane : choc/choc/choc 16, choc/pose propre/choc 6, air/air/air 3, autres 2.
- Aucun cas où `rien` ou `plane` annonçait une pose ou la lèvre.
- Dans 6 cas, `versRoute` annonçait une pose propre et la voiture est morte quand même.
- La condition des secours est vraie dans les 27, mais S1 ne se posait proprement que dans 1 et S2 dans 4. Elle est aussi vraie dans 45 vols posés.

**d/e. Règles candidates.** 120 des 167 décollages subis sur décor passent la garde du contrat (34 exclus par la jauge).

| règle | décollages touchés | par course de 180 s | mortels | non mortels |
|---|---|---|---|---|
| R1 (le contrat) | 0 | 0 | 0 | 0 |
| R2 | 2 | 0,09 | 0 | 2 |
| R3 | 0 | 0 | 0 | 0 |
| R4 | 4 | 0,18 | 0 | 4 |
| R5 (nitro seule) | 120 | 5,4 (3,4 sans carte à 7,1 en jade tenue) | 20 | 99 |

- Pour R5, versRoute annonçait déjà une pose propre dans 63 des 99 non mortels.
- R5 partirait aussi sur 60 vues sans décollage dans les 0,55 s.
- Sa première vue utile est à 0,3 s du décollage en médiane (87 sur 120 à 0,25 s ou plus) ; la main met environ 0,2 s à obéir.

**f. `rienOn` :**
- 879 vues où « rien » se pose propre et la façon tenue se pose aussi.
- Écart (angle de la façon tenue moins angle de « rien ») aux quantiles 5/25/50/75/95 % : −0,53 / −0,13 / 0 / +0,02 / +0,31.
- « rien » est plus droit 255 fois, plus tordu 367 fois, égal 257 fois.
- Sous la garde de la règle (662 vues), en déclenchements simulés sur 40 courses :

| `rienEcart` | vues qui passent | la règle partirait |
|---|---|---|
| 0,02 | 144 | 30 |
| 0,05 | 116 | 27 |
| 0,1 | 90 | 21 |
| 0,2 (naissance) | 46 (2,1 par course de 180 s) | 10 |

**g. `loiFidele.suit` :**
- 3 163 vues en versRoute ; le compteur actuel en compterait 1 979 (63 %).
- Écart de volant |yeux − pilote| : médiane 0,08, 75 % à 0,32, 90 % à 0,58.
- 1 216 vues à 0,005 près, mais 1 905 (60 %) au-delà de 0,01. Le manche ne diffère que 3 fois.
- L'explication par l'arrondi est fausse : les deux lois diffèrent vraiment.
- Seuil proposé : 0,01. Il retire exactement l'arrondi (qui ne dépasse jamais 0,005) et laisse 60 % des vues.

### Limites (dites dans le LISEZ-MOI)
- Aucun effet sur le palier n'est mesuré : on compte combien de fois une règle agirait, pas ce qu'elle rapporterait.
- Un seul pilote, 8 graines par carte, des cartes tenues, 27 morts seulement.
- Les rayons du bord partent d'une conduite « au mieux », pas de la trajectoire réelle du pilote.
- Aucun code n'est proposé.

## 2. relecteur

*Rôle : relecteur : refait les calculs par un autre chemin et propose une règle chiffrée. Phase : Relecture.*

## Relecture adverse de l'étude « sortie préparée »

Dossier : C:\Users\sacha\code\CASH-CAR-genes-v4\ml\ecurie\etude\sortie-preparee\ (`git status` : seul ce dossier apparaît, en `??`).
- Aucun fichier suivi n'a été modifié.
- Rien n'a été écrit dans CASH-CAR-bots-ecurie ni dans ml/evolution/etat.
- Pas de commit.
- Une seule paire de courses jouée (2 à la fois au plus, 64,6 s chacune), sur la graine 3970474 de la plage de l'essai du banc v2 (3 963 000 + 37·i, i = 202).

### 1. Confirmé
- **La preuve tient.** J'ai rejoué canyon tenue 3970474 avec et sans diagnostic : empreinte `b616b900546f`, vues `a2615c2a90c1`, touches `73f1d1763677`, palier 5, 64,6 s, paroi, 233 pièces. C'est identique, et les vues gardées sont identiques au caractère près à celles du mesureur.
- **Tableaux b, c, e.** Je les ai recalculés avec mon propre script (`relecture.js`), qui tire les vols des événements du jeu. Ils tiennent pour l'essentiel :
  - b : « choc » sans bascule meurt 15 fois sur 16 ; « air » se pose 22 fois sur 26 ;
  - e : R1 0, R2 2, R3 0, R4 4 (les 4 se posent) ; R5 121 / 19 / 101 ;
  - c : aucun mortel où rien ou plane annonçait une issue à la dernière vue au sol ;
  - g (loiFidele.suit) : 63 % des vues, 60 % au-delà de 0,01 ;
  - aucune nitro demandée à la dernière vue au sol (0 sur 253).

### 2. Refusé ou corrigé
- **Trois courses comptées deux fois.** Les courses sans carte 3970400, 3970585 et 3970659 rejouent la course tenue de la même graine, à l'identique, jusqu'à la mort. Il reste donc **180 subis distincts et 24 morts distinctes** (et non 185 et 27), dont 13 choc/choc/choc (et non 16).
- **La preuve portait sur 2 courses différentes, pas 3.** Grotte tenue et sans carte 3970400 sont la même course. Avec ma course, on en a 3.
- **Une mort mal attribuée.** En grotte 3970511, il y a un rebond 0,07 s après une pose, sans aucune vue au sol entre les deux. analyser.js lui donne les rayons du décollage précédent. Les « 6 morts où versRoute annonçait une pose propre » sont donc **5**.
- **La médiane « mort après » en grotte** vaut 0,26 s, et non 0,55 s.
- **Les bosses gonflent la fiabilité.** 85 poses sur 160 sont des bosses (moins de 0,5 s ou moins de 3 m). Sans les bosses ni les chaînes, « pose propre » se pose 45 fois sur 50 (90 %, et non 94 %).
- **Les sorties en chaîne.** 38 subis repartent moins de 0,5 s après une pose ; 6 des morts en font partie.
- **rienOn.** Les « 46 vues, 2,1 par course » sont des vues, pas des déclenchements. La règle part **10 fois en 40 courses (0,48 par course de 180 s)**. Les valeurs 0,02 et 0,05 du tableau sont hors des bornes du gène (0,1 à 0,4).
- **Ce qui ne bouge pas.** Le temps de la dernière vue au sol est comparable d'un vol à l'autre : 0 à 0,1 s avant le décollage, médiane 0,05 s.

### 3. La proposition chiffrée
- **Les rayons du bord ne permettent aucune sortie préparée qui compte : c'est une impasse.**
  - Les yeux ne voient aucune issue pour les 24 morts distinctes sur 24.
  - Le bord est annoncé 0,28 s avant le décollage (médiane), alors que la main met 0,2 s à obéir.
  - Au bord, plane se crashe dans 57 vols posés où versRoute se posait, et il ne sauve aucun des 17 mortels sous la garde : le « plane » du contrat serait nuisible.
  - À la première vue en vol, versRoutePlane ne sauve que 1 mortel sur 17, et perd 2 vols posés.
  - Recommandation : écrire l'impasse, laisser sortieOn éteint, ne pas le mettre au banc. Le levier est au sol, avant le bord (ligne, marge, vitesse sur décor).
- **Si l'on veut un gène qui ne soit pas muet**, la seule réécriture sans risque est le « dernier recours nitro » :
  - *Texte :* sur décor, la route lâche dans moins de sortieT, la jauge dépasse sortieJauge, et versRoute du bord finit en choc : on garde la nitro (`m.nitro=true; m.planeBord=v.t`) et le vol part en `versRoutePlane` (`enVol`, `!m.facon && !m.voulu && v.t-m.planeBord<.35`).
  - *Sur ces données :* 19 décollages distincts (0,85 par course de 180 s), dont 11 mortels et 8 posés ; 74 vues au sol, dont 3 sans décollage dans les 0,55 s.
  - *Risque faible :* elle ne touche que des vols que les yeux donnent déjà pour morts.
  - *Gain attendu minuscule :* environ 1 mortel sur 11, invisible au banc (environ 1,1 palier à 96 graines).
- **rienEcart :** aucun changement soutenu. Rien est plus tordu 297 fois et plus droit 162 fois. 0,1, la borne basse, ne servirait qu'à la mesurabilité (17 déclenchements, 0,81 par 180 s). Attention : changer une naissance peut changer l'identifiant des génomes.
- **Compteur loiFidele.suit :** un seuil de 0,01 sur le volant se justifie (63 % devient 60 %, l'écart est réel, médiane 0,08).

### 4. Fichiers à enregistrer
Le dossier ml/ecurie/etude/sortie-preparee/ en entier : celui du mesureur, plus mes ajouts.
- `relecture.js` : le recomptage indépendant, sans course.
- `sorties/relecture.txt` et `sorties/relecture.json` : ses tableaux.
- `sorties/relecture/canyon-3970474-diag0.json`, `-diag1.json`, `-diag1.jsonl.gz` : la preuve rejouée.
- `LISEZ-MOI.md`, complété d'une partie 8 « Relecture » : preuve, biais, tableau confirmé / corrigé, ce que les yeux auraient changé, la proposition, les fichiers.
