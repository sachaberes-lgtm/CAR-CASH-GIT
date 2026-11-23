# BOTS ML — le plan (2026-11-21)

Statut : **proposé, pas encore validé par Sacha. Étape 0 faite le 22/11** (`ml/reel` tourne sur le jeu actuel : 6,8 × le temps réel ;
même graine = même course au bit près dans un processus neuf, presque dans le même processus — détails et limites dans `ml/reel/README.md`).
Le reste n'est pas codé.
Demande : des bots qui jouent vraiment à CASH CAR (rouler, voler, figures, raccourcis), un plan qui dépense surtout les ~200 € de crédit API, et un projet qui sert au portfolio (RCA — je suppose Royal College of Art, à confirmer).

---

## 1. Ce qui existe déjà, et pourquoi ça a calé

| Dossier | Ce que c'est | Ce qui a manqué |
|---|---|---|
| `ml/train/` (juillet → septembre) | 24 voitures à petit réseau, mutées au hasard, dans une **copie** du jeu | La copie a divergé du vrai jeu. Après 300 générations : 0 figure, 9 % de poses réussies. Le champion ne finissait aucune course alors que les totaux du run étaient bons. |
| `ml/reel/` (20 octobre) | Le **vrai jeu publié** tourne sans écran dans Node, piloté par les touches du clavier, horloge à 1/60 s | Cerveau de 16 neurones, noté à la distance seule. 3 à 4 fois le temps réel d'après son README (pas remesuré depuis). |

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
- Proposition de rangement : `ml/labo/journal/`, `ml/labo/rejeux/`, `ml/labo/jalons/<étape>/`, `ml/labo/arbre.html`.

### 5.5 Deux points à vérifier à l'étape 1 bis

- **Filmer sans ffmpeg** : le PC n'a ni ffmpeg ni Python. Piste : l'enregistreur vidéo du navigateur branché sur l'image du jeu, ou OBS que Sacha utilise déjà. Non testé.
- **Un rejeu n'est exact que sur la version du jeu qui l'a produit.** On note donc le commit avec chaque rejeu, et on filme les vidéos d'un jalon avant de changer de version.

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
