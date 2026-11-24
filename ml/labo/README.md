# ml/labo — la boîte noire du labo (étape 1 bis du plan BOTS-ML)

Plan : `passation/BOTS-ML.md`, section 5. Socle : `ml/bot` (le contrat du bot, le pilote, les mesures) et `ml/reel` (le vrai jeu sans écran).

Ici : **tout ce que la boucle produira laisse une trace, au moment où ça arrive.** Un cerveau n'entre au labo que par `inscrire.js` :
son code, la raison de son changement, sa note, chacune de ses courses et son coût s'écrivent d'un coup. Rien n'est posé à la main.

| Fichier | Rôle |
|---|---|
| `labo.js` | les traces : le journal, les dépenses, les rejeux, la clôture d'une génération. `node labo.js` = l'état du labo |
| `inscrire.js` | **l'entrée unique** : note un cerveau dans le vrai jeu et l'inscrit au journal (`--valider` : le renote sur des graines neuves) |
| `clore.js` | fin d'une génération : désigne le champion, garde les courses qui comptent, vide le tampon |
| `garder.js` | garder une course à la main (le bêtisier), même après la clôture |
| `rejouer.js` | remet les touches d'un rejeu dans le jeu sans écran : la course doit être la même. `--tout` après chaque mise à jour du jeu |
| `arbre.js` | fabrique `arbre.html`, l'arbre généalogique des cerveaux (un fichier, sans serveur) |
| `projection.js` | la salle de projection : rejoue une course gardée dans le vrai jeu **avec l'image**, et la filme |

```bash
cd ml/labo
node labo.js                                       # où en est le labo
node inscrire.js cerveau.js --etape 3 --generation 0 --modele main --raison "ce qui change, et pourquoi"
node inscrire.js cerveau.js --etape 3 --generation 1 --parents c0004 --modele opus-5-5 --entree 4200 --sortie 1800 --euros 0.09 --raison "…"
node garder.js c0012 910037 --pourquoi "mort absurde : il saute dans le portail"
node clore.js --etape 3 --generation 1 --critere argent_min
node inscrire.js cerveau.js … --regime allege      # noté dans le jeu des vrais joueurs (version allégée) ; max par défaut
node noter.js cerveau.js --parties --sortie n.json # (dans ml/bot) noter d'abord, puis inscrire SANS rejouer :
node inscrire.js cerveau.js … --note n.json        #   refusé si la note vient d'un autre code ou d'une autre version du jeu
node inscrire.js --valider c0012                   # le champion, sur 20 graines qu'aucun cerveau n'a vues (950000 + 37 × i),
                                                   #   dans SON régime, sur SA map imposée (ceux de sa ligne du journal)
node arbre.js                                      # refait arbre.html
node rejouer.js --tout                             # tous les rejeux gardés redonnent-ils la même course ?
node projection.js                                 # puis http://localhost:3161/
```

---

## 1. Ce qui s'écrit, et où

| Où | Quoi | Git |
|---|---|---|
| `journal/cerveaux.jsonl` | une ligne par candidat (voir § 2). On n'y fait qu'ajouter | oui |
| `journal/generations.jsonl` | une ligne par génération close : le critère, le champion, les courses gardées et pourquoi | oui |
| `journal/validations.jsonl` | un candidat renoté sur des graines neuves | oui |
| `journal/depenses.jsonl` | chaque appel à l'API : étape, modèle, jetons, euros | oui |
| `journal/echanges/<id>.json.gz` | la demande et la réponse de l'API pour ce candidat (`--echange`) | oui |
| `cerveaux/<id>-<nom>.js` | le code du candidat, tel qu'il a été noté | oui |
| `rejeux/<id>-g<graine>.json` | une course gardée : la graine, la version du jeu, les touches image par image | oui |
| `trajectoires/<id>-g<graine>.json.gz` | la même course, vue par l'enregistreur du jeu (position 10 fois par seconde, événements, routes) | oui |
| `trajectoires/e<étape>-g<génération>-toutes.json.gz` | la trace fine de **toutes** les courses de la génération (1 point par seconde, vue de dessus) : les cartes | oui |
| `arbre.html` | la page de l'arbre | oui |
| `tampon/` | toutes les courses de la génération en cours, complètes. `clore.js` y choisit puis le vide | **non** |
| `videos/` | les films. Ils se refont à partir des rejeux | **non** |

`LABO_DIR=<dossier>` devant une commande : un autre labo. Les essais des outils ne touchent jamais le vrai journal.

---

## 2. Une ligne du journal

```
id, nom, date            c0007, « vire-large », le jour
etape, generation        où il est né dans le plan
parents                  le ou les candidats dont il descend (aucun : une racine)
modele                   qui a écrit le code : « main », ou le modèle de l'API
raison                   LA PHRASE : ce qui change et pourquoi. Elle fait l'arbre et le récit
code, sha, octets        le fichier dans cerveaux/, son empreinte ; jumeau = un candidat qui a exactement le même code
jeu                      version (cashcar-vNNN), commit, empreinte de index.html + figures.js, regime (max ou allege)
graines, tmax            sur quoi il a été noté
carte, meteo             la map et la météo imposées à la note (--carte, --meteo) ; null = tirées par la graine
note                     les chiffres du lot (ceux de ml/bot/mesures.js, comptés comme pour les joueurs)
courses[]                chaque course : graine, empreinte, durée, fin, argent, figures, vols, raccourcis,
                         plus long vol posé, plus de figures en un vol, plus gros raccourci, et OÙ elle finit (map, route, s, x y z, en vol ?)
cout                     jetons lus, jetons écrits, euros (null = prix à chiffrer, jamais deviné)
```

Chaque course garde aussi ses `pannes` (décisions du cerveau coupées par la limite de temps). **Une course avec une panne ne vaut pas** :
elle n'est pas répétable. `inscrire.js` le signale à la fin ; la cause est un cerveau trop lent, ou un PC surchargé pendant la note.

`inscrire.js` **refuse** : pas de raison, un parent inconnu, un cerveau d'API sans ses jetons, une génération qui n'est pas un entier,
un nom de cerveau qui ne donne pas un nom simple (les accents sont retirés : « élan » → `elan`), **une génération déjà close**.
Il refuse avant de jouer, pas après. Si le journal refuse quand même après la note, la note n'est pas perdue : elle reste au tampon
(`tampon/note-refusee-….json`) et se réinscrit sans rejouer avec `--note`.

`--note <fichier>` (une note faite par `ml/bot/noter.js --parties`) n'est inscrite que si elle vient de **ce code** (son empreinte sha1
si la note la porte, sinon le nom que le cerveau se donne) et de **cette version du jeu** (son empreinte si la note la porte, sinon
`cashcar-vNNN` ; un avertissement si index.html a été réécrit depuis), dans le régime et sur la map demandés.

`--valider` reprend le **régime**, la **map** et la **météo** de la ligne du candidat (un `--regime` tapé à la main l'emporte, avec un
avertissement : la validation ne se compare plus à sa note).

---

## 3. Ce qui est gardé d'une génération

Garder chaque course coûterait trop (≈ 400 Ko l'enregistrement d'une course de 3 minutes). `clore.js` garde, en rejeu **et** en trajectoire :

- la meilleure course du champion (au critère choisi) et sa course la plus courte ;
- la pire course de la génération (la plus courte de toutes) ;
- le plus long vol posé, le plus de figures en un vol, le plus gros raccourci (s'il y en a).

Et pour **toutes** les courses : leur ligne au journal (avec l'endroit de la fin) et leur trace fine.

Une « mort absurde » ne se repère pas toute seule : c'est `garder.js`, à la main ou par celui qui lit les autopsies.
Après la clôture, `garder.js` rejoue la course à partir du code du candidat (dans son régime, sur sa map imposée) et ne la garde que si
elle redonne la même empreinte. Une ligne d'avant le 24/11 n'a pas sa map : `--carte`/`--meteo` à la main si elle en avait une.

Pendant qu'une inscription note ses courses, elle pose un marqueur au tampon : `clore.js` refuse de clore sa génération tant
qu'elle tourne (sinon le candidat arriverait après la clôture, et ne serait jamais trié).

**Le champion se désigne par un critère écrit** (`--critere`, `argent_min` par défaut). Chaque étape du plan a le sien ; il est noté
dans `generations.jsonl`. Aucune « note unique » n'est inventée ici.

---

## 4. Les rejeux

Un rejeu, c'est : la graine, la map si elle est imposée, la version du jeu, et les touches (`12N5n…` : le nombre d'images depuis le
changement d'avant, puis la touche — MAJUSCULE enfoncée, minuscule relâchée ; `G D H B N` = ← → ↑ ↓ ESPACE). Pas le cerveau.
Depuis les doigts v2 (24/11), une lettre de plus : `C` = la plaque CONTINUER de la **seconde chance** touchée et acceptée (le rejeu appelle
alors la fonction de la plaque, attend la pub et la reprise comme la course d'origine), `c` = l'attente de la plaque abandonnée. Ni le
profil de la main ni son hasard ne servent au rejeu : le journal suffit. La salle de projection rejoue ces touches (non essayé dans un
navigateur à ce jour) ; son mode « cerveau en direct » refuse un cerveau à profil.

`node rejouer.js <course>` remet ces touches dans le jeu sans écran, dans un processus neuf, et compare : même empreinte, même nombre
d'images, même fin, même argent → **EXACT**.

**Un rejeu n'est exact que sur la version du jeu qui l'a produit.** Chaque rejeu porte le commit et l'empreinte du jeu ; `rejouer.js`
et la salle de projection préviennent quand le jeu a changé. Pour rejouer un vieux rejeu : revenir au commit noté (`git worktree add`).
`node rejouer.js --tout` après une mise à jour du jeu dit lesquels ne se rejouent plus — donc si le jeu se conduit encore pareil.

---

## 5. La salle de projection : revoir une course avec l'image, et la filmer

`node projection.js`, puis http://localhost:3161/ : la liste des rejeux gardés. Rien ne sort du PC.

| Lien | Ce que ça fait |
|---|---|
| **voir** | remet les touches du rejeu dans le vrai jeu, avec l'image, à la vitesse du jeu |
| **voir et filmer** (`&film=1`) | le même, filmé : `videos/<course>.webm`, 1280 × 720, **60 images par seconde exactes** |
| **le cerveau en direct** (`&mode=cerveau`) | le cerveau conduit lui-même dans le navigateur, au lieu des touches |
| `&cadence=libre` | au plus vite, sans film : pour contrôler |
| `&film=direct` | filme à la vitesse du jeu (un PC lent y perd des images) |
| `&debit=5` | le débit du film, en mégabits par seconde |

**Comment ça marche.** Le serveur sert le vrai `index.html` avec les mêmes réglages que le simulateur : l'horloge du jeu (une image =
1/60 s), le hasard à graine, aucune entrée, **aucun son** (`projection/prelude.js`). La page lui applique le même code de mise en route que
le simulateur (`ml/reel/jeu-reel.js`), puis les touches. Le rendu, lui, est le vrai : WebGL, textures, bloom.

**Le contrôle est automatique.** À la fin, la page renvoie l'état de la caisse à chaque décision (10 par seconde). Le serveur le compare
à la même course rejouée sans écran et affiche : « la même course », ou la seconde où elles se séparent
(`tampon/projection-<course>.json`).

**Filmer sans ffmpeg.** Le navigateur encode chaque image du jeu (VideoEncoder, VP9) ; `projection.js` écrit lui-même le fichier `.webm`,
chaque image datée à n / 60 s. Le film a donc 60 images par seconde quelle que soit la vitesse du PC — la projection dure juste plus
longtemps que la course. Le film montre **l'image du jeu** (le canevas) : pas le HUD, qui est du HTML par-dessus. Pour un film avec le
HUD : ouvrir « voir » et filmer l'écran avec OBS.

`arbre.js` lie un film à sa course s'il existe (`videos/<course>.webm`) : le clic sur un nœud le montre.

### Pourquoi un « recalage du hasard »

Le jeu tire **tout** du même hasard : la flamme d'un réacteur comme la graine de la route suivante. Or un vrai navigateur anime plus
de choses que le simulateur, et pas autant de fois (presque chaque image tire un nombre différent de valeurs). Sans rien faire, une course
est identique jusqu'au premier portail, puis la route suivante n'est plus la même.

La règle, sans liste à tenir, sans changer ni le jeu ni le simulateur (`HASARD_CODE`, dans `ml/bot/piloter.js`) :

- avant une projection, le serveur rejoue la course **sans écran** (1 à 3 minutes la première fois, puis c'est gardé au tampon). Ce rejeu
  note où en est le hasard au début de chaque image, et à l'entrée de chaque fonction du jeu qui tire au sort ;
- le navigateur se remet au même point aux mêmes appels ;
- un appel que seul le navigateur fait (un effet d'écran) est mis de côté : le hasard du jeu est remis après lui.

Le contrôle de fin de projection dit aussi combien d'images ont eu besoin d'être recalées (`hasard.images`).
`&recale=0` : sans recalage, pour voir la différence.

### Ce qui est vérifié (24/11)

| Essai | Résultat |
|---|---|
| course d'une map (jade, 39,9 s), touches du rejeu | **la même course**, 400 décisions sur 400, morte à la même image |
| la même, le cerveau conduit en direct (`&mode=cerveau`) | **la même course** aussi |
| son film exact | 2 485 images, 41,4 s, 1280 × 720, 26 Mo ; il se lit, a sa durée, on s'y déplace |
| course de quatre maps (187,8 s), sans recalage du hasard | identique 56,6 s, puis une autre route après le premier portail |
| la même, recalée, au régime de ce PC (allégé) | identique 127,4 s, puis la map n'est plus la même (ville au lieu de Crypto City) |
| la même, recalée, **au régime du simulateur** | **la même course, à chaque décision** : 1 879 décisions sur 1 879, 11 268 images, trois portails, même fin (roche) et même argent (52 545,35) ; aucune image n'a eu besoin d'être rattrapée. |

### Le régime : la projection se met dans celui du simulateur

Au chargement, le jeu juge la machine (`POSTE`). Une puce graphique intégrée ou un téléphone → version **allégée**, où Crypto City est
retirée du tirage des maps. Le simulateur n'a pas de carte graphique : il tourne au régime **maximum**. Sans précaution, la projection
montrait donc le jeu allégé de ce PC pendant que le journal décrivait le jeu complet : au deuxième portail, « ville » au lieu de « crypto ».

La page charge le jeu avec `&poste=3` (le régime du simulateur). Un rejeu noté en **allégé** (`--regime allege`) se charge avec
`&allege=1&poste=3` : dans le jeu, un `?allege=` fixe le POSTE avant tout jugement de la machine, dans le simulateur comme dans le
navigateur (lu dans `code/rendu/soleil-planete.js`). `&regime=2` (ou 0, 1, max, allege) projette dans un autre régime — la course
n'est alors plus celle du journal, et le verdict le dira.

La course sans écran gardée au tampon (`tampon/serie-<course>.json`) est refaite quand le rejeu, le code qui rejoue ou **la version du
jeu** changent. Un rejeu enregistré sur une autre version du jeu n'est pas rejoué du tout.

**Qui peut parler au serveur** : seulement ce PC (`localhost`, `127.0.0.1`), et ce qui calcule ou écrit (`/__hasard`, `/__resultat`,
`/__film`, `/__video`) seulement depuis la salle elle-même — une autre page web ouverte dans le navigateur reçoit un 403. Les noms de
course sont nettoyés à l'entrée : rien ne s'écrit hors de `tampon/` et `videos/`. Les films se servent par plages (`Range`, réponse 206) :
on peut s'y déplacer. Au régime maximum, ce PC dessine lentement (5 à 30 images par seconde selon la
map) : sans conséquence pour un film exact, il est juste plus long à faire.

**Croire le verdict affiché**, pas le film : c'est lui qui dit si l'image montre la course du journal.

À savoir :
- si la carte graphique lâche l'image pendant une projection (ça arrive quand une autre fenêtre joue en même temps), le jeu se met en
  pause de lui-même : la projection le compte et le dit ; il faut la relancer ;
- `&bruit=1` affiche les erreurs de la boucle du jeu dans la console ; `&images=600` arrête la course à cette image ;
- `&espion=<nom>` évalue `tampon/<nom>.js` dans le jeu après le départ et range ce qu'il voit dans `window.__ESP` : c'est comme ça que
  l'écart de la map crypto a été trouvé (le même fichier, donné au rejeu sans écran, montre ce que le simulateur fait au même instant) ;
- le navigateur de test reste muet : le prélude remplace le contexte audio par un faux, et les scripts de son ne sont pas chargés.
