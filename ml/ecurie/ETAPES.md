# L'écurie — les étapes, une par une

Chaque étape se ferme par **un commit** sur la branche `bots-ecurie` (dossier `C:\Users\sacha\code\CASH-CAR-bots-ecurie`).
Pour chacune : ce qui en sort, **comment vérifier**, et **le texte à coller dans une autre session** pour lancer la suivante.
Le plan d'ensemble est dans `PLAN.md`, l'étude dans `etude/`.

> ⚠ Toujours travailler dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie`, jamais dans `CAR-CASH-GIT` (d'autres sessions y changent de branche).
> Vérifier la branche avant un commit : `git branch --show-current` doit répondre `bots-ecurie`.

| # | Étape | État |
|---|---|---|
| A | L'étude : ce qui donne des pièces, ce qui tue, les vrais joueurs mesurés | **faite** (commit `67ea1f009`) |
| B | Les fondations : défauts corrigés, yeux v2, doigts v2 | **en cours** (24/11 au soir) |
| C | Le pilote d'élite, amélioré par tours | à faire |
| C bis | La boucle automatique sur le crédit API (≈ 200 €), avec un plafond de dépense | à écrire après B |
| D | Le facteur humain et les 30 niveaux | à faire |
| E | Le juge, niveau par niveau | à faire |
| F | Le paquet du matchmaking et le dossier du portfolio | à faire |

---

## A — L'étude (faite)

**Ce qui en sort.** `etude/` : neuf rapports (économie, morts, deux sur les maps, vol, conduite, record, bot actuel, vrais joueurs) et
`defauts-confirmes.md` (28 défauts du travail d'avant). `ml/bot/discerner.js` : le juge « humain ou bot ».

**Vérifier.**
```
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\bot
node etalon.js                                   # 14 parties, paliers 1 1 4 5 5 8 11 12 14 15 16 21 22 28
node discerner.js ..\labo\trajectoires           # le bot de référence : reconnu à coup sûr (AUC ≈ 0,97)
```

## B — Les fondations (en cours)

**Ce qui doit en sortir.**
1. Les 28 défauts corrigés (ou refusés avec la raison).
2. **Les yeux v2** (`ml/bot/yeux.js`) : en vol, un radar qui prévoit l'issue (pose, choc contre le décor, jauge vide) pour plusieurs
   façons de piloter ; au sol, « et si je sortais par le bord ? », les couloirs et plafonds devant, la vitesse sûre d'un virage, la ligne
   parfaite, l'aimant, le palier.
3. **Les doigts v2** (`ml/bot/doigts.js`, `piloter.js`) : un `profil` par cerveau — appuis irréguliers à graine, temps de réaction,
   volant recalculé à chaque image, drift, seconde chance.
4. Une relecture par trois agents, et la reprise de ce qu'ils confirment.

**Vérifier quand c'est fini.**
```
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\bot
node verifier.js                 # TOUT PASSE, et l'empreinte de la section 3 reste a7b3171768ca (un cerveau sans profil conduit comme avant)
cd ..\labo
node rejouer.js --tout           # 4 rejeu(x) exact(s) sur 4
```
Et lire `ml/bot/README.md` §2 (la vue) et §3 (les gestes, le profil) : tout ce qui est neuf doit y être décrit.

**Si la session s'est coupée avant la fin**, coller dans une nouvelle session :
> Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (branche `bots-ecurie`), lis `ml/ecurie/ETAPES.md` et `ml/ecurie/PLAN.md`, puis finis
> l'étape B : regarde `git status` et `git diff` pour voir ce qui est déjà fait, termine ce qui manque de la liste « ce qui doit en
> sortir », fais passer les deux vérifications, mets à jour `ETAPES.md`, et valide dans git. Ne me pose pas de question.

## C — Le pilote d'élite

**Ce qui doit en sortir.** `ml/ecurie/pilote.js` : un seul cerveau, réglé par un `PROFIL`, qui se sert du radar. Amélioré par tours :
lire ses morts (`node autopsie.js`), corriger, noter sur 20 graines en version allégée (`--regime allege --tmax 900`). Chaque version
entre au labo par `ml/labo/inscrire.js` (étape `C`, une génération par tour), avec sa raison.

**Le but, chiffré.** Battre le bot de référence (palier médian 10, meilleur 20) et monter le plus haut possible. Le palier 28 est le
meilleur des joueurs ; le palier 30 demande environ 11 minutes de survie. Le plafond atteint sera écrit ici, pas promis.

**Vérifier.**
```
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\labo
node labo.js                     # les générations de l'étape C, leur champion
node arbre.js                    # puis ouvrir arbre.html : la lignée, la raison de chaque changement
```

**Pour lancer cette étape dans une autre session**, coller :
> Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (branche `bots-ecurie`), lis `ml/ecurie/ETAPES.md`, `ml/ecurie/PLAN.md` et
> `ml/ecurie/etude/*.md`, puis fais l'étape C : écris `ml/ecurie/pilote.js` (un cerveau à profil qui se sert du radar des yeux v2) et
> améliore-le par tours — autopsie des morts, correction, note sur 20 graines en `--regime allege --tmax 900`, inscription au labo à chaque
> tour. Jamais plus de 4 courses à la fois. Arrête-toi quand deux tours de suite ne gagnent plus rien, écris le plafond atteint dans
> `ETAPES.md`, et valide dans git. Ne me pose pas de question.

## C bis — La boucle automatique sur le crédit API

**Pourquoi.** L'abonnement a une limite d'usage (atteinte le 24/11 pour les agents) et demande une session ouverte. Le crédit API
(≈ 200 €) sert à ce que l'abonnement ne sait pas faire : tourner **seul, la nuit**, sur des dizaines de variantes du pilote.

**Ce qui doit en sortir.** `ml/ecurie/boucle.js` : à chaque tour, il prend le champion du labo, lit ses pires morts (autopsie), demande
à Claude par l'API d'écrire des variantes, les note dans le vrai jeu, et inscrit chacune au labo **avec son coût en jetons et en euros**
(`inscrire.js --entree --sortie --euros`, cumul par étape dans `node ml/labo/labo.js`).
- Un **plafond de dépense** obligatoire (`--budget 20` = il s'arrête à 20 €) et un mode à blanc (`--a-blanc` : tout sauf l'appel payant).
- La clé de l'API se lit dans la variable d'environnement `ANTHROPIC_API_KEY`, que **Sacha pose lui-même** ; elle n'est jamais écrite
  dans un fichier ni dans le journal.
- D'abord un calibrage à petit budget (quelques euros) : quel modèle gagne le plus de paliers par euro. Puis le gros de la somme sur le
  pilote d'élite (étape C) et sur le réglage des 30 niveaux (étape D).

**Rien n'est dépensé sans l'accord de Sacha** : écrire la boucle ne coûte rien, la lancer oui. C'est lui qui la lance, ou qui dit de le faire.

**Vérifier.** `node ml/ecurie/boucle.js --a-blanc --tours 1` fait un tour complet sans dépenser ; `node ml/labo/labo.js` donne les euros par étape.

## D — Le facteur humain et les 30 niveaux

**Ce qui doit en sortir.** `ml/ecurie/profils/` : au moins un profil par palier de record, de 1 à 30 (ou jusqu'au plafond de l'étape C),
réglés par la mesure. Le niveau N est le profil dont le **meilleur palier sur 20 parties** vaut N. Le rythme de ramassage reste celui
d'un humain (≈ 420 pièces par minute) ; c'est la survie, le temps de réaction et les erreurs qui changent. `ml/ecurie/echelle.json` :
pour chaque niveau, le profil, sa distribution de paliers, ses causes de fin.

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
Plus Sacha et Léo (et d'autres) enregistrent de parties, plus le juge vaut quelque chose.

## F — Le paquet du matchmaking et le portfolio

**Ce qui doit en sortir.**
- `ml/ecurie/paquet/` : pour chaque palier, ses pilotes, leurs chiffres, et des courses toutes prêtes (rejeux et trajectoires) qu'un
  jeu pourrait rejouer en fantôme. Brancher ces fantômes dans le jeu est un changement du jeu : à décider par Sacha.
- `ml/labo/jalons/ecurie/` : l'arbre, un film par niveau marquant (salle de projection), la courbe « palier par niveau », dix lignes de bilan.
