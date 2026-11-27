# La sélection naturelle des bots : le mode d'emploi

Une population de 20 pilotes joue des courses sur ce PC, jour et nuit, sans rien payer.
À chaque génération, 6 nouveaux pilotes naissent (des copies légèrement changées des meilleurs). Les moins bons sont renvoyés.
Quand un pilote prouve sur des courses neuves qu'il fait mieux que le champion, il devient le nouveau champion.
Il est alors rangé dans le dossier `champions/`.

Tout se passe dans ce dossier, `ml/evolution/`. Le jeu n'est jamais modifié.

---

## INSTALLER SUR UN NOUVEAU PC (une seule fois)

La sélection tourne dans **un dossier à elle**, `CASH-CAR-evolution`, à côté du dépôt. Personne n'y travaille : rien ne la dérange.

**Avant tout, si la boucle payante (`ml/ecurie/boucle.js`) tourne sur ce PC : arrête-la, et retire sa tâche planifiée** (celle qui la relance
toute seule). Les deux ne peuvent pas se partager le processeur, et la sélection refuse de partir tant que `boucle.js` tourne.

1. Ouvre le dossier du dépôt déjà cloné (celui qui contient `VERSION PRINCIPALE`). Clique dans la barre d'adresse de l'Explorateur, tape `cmd`, puis Entrée.
   Une fenêtre noire s'ouvre dans ce dossier.
   Tape `node --version` : il doit afficher `v24…` (sinon, installe Node 24 d'abord).
2. Tape ces deux lignes, une par une (Entrée après chacune) :

   ```
   git fetch origin
   git worktree add -b evolution-ryzen ..\CASH-CAR-evolution origin/bots-ecurie
   ```

   Tu dois voir `Preparing worktree (new branch 'evolution-ryzen')`, puis `HEAD is now at …`.
   Si git dit `already exists`, c'est déjà installé : passe à « METTRE À JOUR ».
3. Tape cette ligne :

   ```
   git config user.email
   ```

   S'il n'affiche **rien**, tape aussi ces deux lignes (git doit avoir un nom pour ranger les mises à jour) :

   ```
   git config user.name "Sacha (Ryzen)"
   git config user.email "sacha-ryzen@exemple.invalid"
   ```

4. Ouvre le nouveau dossier `CASH-CAR-evolution\ml\evolution` (à côté du dépôt). **Double-clic sur `lancer.cmd`.** Laisse la fenêtre ouverte.
5. **Double-clic sur `installer-tache.cmd`** dans ce même dossier. Lis ce qu'il dit, puis tape O ou N.
6. **Double-clic sur `sauver-traces.cmd`**. Si GitHub demande de te connecter, fais-le une fois.

Le nom `evolution-ryzen` est le nom de la branche de ce PC. Sur un autre PC, prends un autre nom qui commence par `evolution-`.

## METTRE À JOUR (quand Claude a changé le bot)

1. Dans `CASH-CAR-evolution\ml\evolution` : **double-clic sur `arreter.cmd`**. Attends « C'est arrêté ».
2. Ouvre une fenêtre de commande dans le dossier `CASH-CAR-evolution` (barre d'adresse, `cmd`, Entrée). Tape :

   ```
   git fetch origin
   git merge --no-edit origin/bots-ecurie
   ```

   Tu dois voir `Merge made by …` ou `Already up to date.`
   Si git dit `CONFLICT`, tape `git merge --abort` et demande à Claude.
3. **Double-clic sur `lancer.cmd`.**

Ce que ça fait :
- Si le bot a changé (ses yeux, sa main, le pilote fabriqué, le jeu), une **nouvelle époque** commence. Les notes repartent de zéro, les courses sont rejouées, mais **les pilotes restent**. Le contrôle d'identité est refait (quelques minutes).
- Si seuls des textes ont changé, rien ne se voit : la sélection reprend où elle en était.
- L'histoire déjà écrite (l'arbre, le récit, les champions) n'est jamais effacée.

---

## Lancer

**Double-clic sur `lancer.cmd`.**

- Une fenêtre noire s'ouvre. **Laisse-la ouverte** : elle n'affiche rien, c'est normal. Tout est écrit dans `etat/sortie.log`.
- La fermer arrête tout d'un coup. Ce n'est pas grave (seules les courses en cours sont perdues), mais `arreter.cmd` est plus propre.
- Si c'est déjà lancé, le second lancement s'en rend compte et ne fait rien.
- Au tout premier lancement sur un PC, il **mesure d'abord ce PC**. Il joue quelques courses avec plusieurs nombres de courses à la fois (par exemple 8, puis 12, puis 14 sur un PC à 16 cœurs), et garde le nombre le plus rapide qui ne fait rien rater. Cela prend entre 10 minutes et une heure. La fenêtre le dit.
- Ensuite il vérifie que le pilote fabriqué conduit exactement comme pilote-voltige (quelques minutes). Puis la sélection commence.
- Le résultat de la mesure est rangé dans `etat/machine.json`. Il ne sert qu'à ce PC : sur un autre PC, la mesure est refaite toute seule. Rien à régler à la main.
- Si la mesure est interrompue (arrêt, pause), la sélection part quand même avec un nombre prudent. La mesure sera refaite au lancement suivant.
- Pour refaire la mesure (par exemple après avoir changé de processeur) : arrête la sélection, puis tape `node ml\evolution\evoluer.js --banc` à la racine du dossier.

### Le lancement automatique (une seule fois, par toi)

**Double-clic sur `installer-tache.cmd`.** Il explique ce qu'il va faire et demande O ou N.

Ce qu'il fait :
- il relance la sélection 5 minutes après l'ouverture de ta session Windows ;
- il relance toutes les heures si elle s'est arrêtée toute seule ;
- il coupe la mise en veille quand le PC est sur secteur, pour qu'il ne s'endorme pas la nuit ;
- toutes les heures, il lance `sauver-traces.cmd auto` : il **envoie** l'histoire de la sélection sur GitHub (voir « Mettre l'histoire à l'abri »). Il te dit avant le O / N l'adresse et la branche.

Il ne relance pas une sélection que tu as arrêtée avec `arreter.cmd`. Pour la reprendre, refais un double-clic sur `lancer.cmd`.

Une petite fenêtre noire peut apparaître quelques secondes, une fois par heure. C'est la relance ou la mise à l'abri.

Après un redémarrage, ta session Windows doit être ouverte pour que ça reparte.

Pour tout retirer : ouvre une fenêtre de commande dans ce dossier et tape `installer-tache.cmd enlever`.

---

## Arrêter

**Double-clic sur `arreter.cmd`.**

- Il ne lance plus de nouvelle course. Il attend la fin de celles en cours (quelques minutes), puis s'arrête.
- La fenêtre dit « C'est arrêté » quand c'est fini. Tu peux la fermer avant, l'arrêt se fera quand même.
- **Rien n'est perdu.** Au prochain lancement, la sélection reprend là où elle en était.
- Les relances automatiques attendent que tu relances `lancer.cmd` à la main.

Pour une pause sans tout arrêter : crée un fichier vide nommé `PAUSE` (sans extension) dans `etat/`. Efface-le pour reprendre.

---

## Savoir où ça en est

### En 10 lignes

Dans une fenêtre de commande, à la racine du dossier :

```
node ml\evolution\etat.js
```

Ces 10 lignes sont aussi dans `etat/resume.txt`. Elles disent, dans l'ordre :

1. la génération, la phase (A, B ou C) et l'époque ;
2. **EN MARCHE** ou **ARRETE** ;
3. le débit (courses jouées par heure), et combien de courses à la fois (et la date de la mesure du PC) ;
4. le champion : sa note F, son palier, son écart aux joueurs E ;
5. le meneur (le mieux noté après le champion) ;
6. le témoin (pilote-voltige tel qu'il est, jamais modifié) ;
7. la dernière mesure du coffre : de combien le champion fait mieux que le témoin ;
8. la dernière validation (le meneur a-t-il été sacré ?) ;
9. les courses ratées et les pannes de la dernière génération ;
10. les alertes. « Alertes : aucune » veut dire que tout va bien.

### Le tableau

**Double-clic sur `etat/tableau.html`.** Il s'ouvre dans le navigateur, sans Internet.

Il est refait à la fin de chaque génération et se recharge tout seul toutes les 5 minutes. Pour le refaire tout de suite : `node ml\evolution\tableau.js`.

Ce qu'il faut regarder, dans l'ordre :

1. **Est-ce que ça apprend ? (le coffre).** C'est le seul vrai juge. Le champion et le témoin jouent les mêmes 40 courses, qui ne servent jamais à l'entraînement.
   Si la ligne verte (le champion) passe et reste au-dessus de la grise (le témoin), la sélection a vraiment trouvé mieux.
   Les premiers jours, elles se confondent : c'est normal.
2. **Génération par génération.** La note F du meneur, du champion et du témoin. Le témoin doit rester à peu près stable. S'il dérive beaucoup, quelque chose cloche dans les courses.
3. **Le champion conduit-il comme un joueur ?** Les barres vertes sont « comme un joueur », les rouges sont très loin.
4. **La population.** Tous les pilotes vivants, du mieux au moins bien noté.
5. **La chance du meneur.** Montre combien le meneur avait été chanceux à l'entraînement.
6. **La diversité.** Si la courbe passe sous la ligne rouge, les pilotes se ressemblent trop.
7. **La machine.** Le débit, les courses ratées, les pannes, les époques.

Les traits verticaux pointillés marquent un changement d'époque. Une nouvelle époque commence quand le jeu, les yeux ou la main du bot ont changé.
Les notes repartent alors de zéro, mais les pilotes restent.

En haut du tableau, deux liens ouvrent l'arbre et le récit.

---

## L'arbre et le récit (l'histoire, pour le portfolio)

La sélection écrit elle-même son histoire, à la fin de chaque génération, dans `etat/` :

- **`etat/arbre.html`** : l'arbre généalogique des pilotes. Double-clic, il s'ouvre dans le navigateur, sans Internet.
  - Chaque point est un pilote, à la génération où il est né. Son trait est sa vie, jusqu'à son renvoi.
  - Un fil le relie à son parent (deux fils pour un enfant de deux parents).
  - Le trait vert épais remonte la lignée du champion jusqu'au pilote de départ.
  - Touche un point : sa fiche dit de qui il est né, ce qui a changé chez lui (gène par gène, avec un mot simple), ses notes, quand il a été renvoyé.
  - Les boutons en haut trouvent le champion, le témoin et le meneur.
- **`etat/histoire.md`** : le récit, génération par génération, en phrases simples. En tête, dix lignes disent où on en est, puis « Les mots » explique les mots du récit.
  Il s'ouvre avec le Bloc-notes. On peut le copier tel quel dans le journal de bord.

## Mettre l'histoire à l'abri : `sauver-traces.cmd`

**Double-clic sur `sauver-traces.cmd`.**

- Il refait l'arbre, le récit et le tableau, et les range dans git (un « commit », sur ce PC).
- Puis il les **envoie sur GitHub**, dans ton dépôt, sur la branche de la sélection (`evolution-…`). Jamais sur `main` : le jeu et le site ne changent pas.
- Ce qui part : les journaux légers (pilotes vivants, générations, validations, renvoyés, coffre, `machine.json`), le tableau, l'arbre, le récit, `resume.txt` et les champions. Rien d'autre : ni les courses, ni `sortie.log`.
- Une ligne dit ce qu'il a fait. Le détail est dans `etat/traces.log`.
- S'il ne s'est rien passé depuis la dernière fois (sélection arrêtée), il ne fait pas de commit.
- Pas d'Internet ? Ce n'est pas grave : tout est gardé sur le PC, l'envoi se refera la fois suivante.
- Il ne tourne que dans le dossier de la sélection (`CASH-CAR-evolution`). Ailleurs, il refuse et le dit.
- `installer-tache.cmd` peut le lancer tout seul toutes les heures (il te le demande).

**Pour ne rien envoyer du tout** : crée un fichier vide nommé `PAS-D-ENVOI` (sans extension) dans `etat/`. Les commits restent alors sur ce PC. Efface-le pour envoyer de nouveau.

---

## Les gestes des joueurs (depuis le 27/11)

- Les pilotes ont reçu cinq gestes que les vrais joueurs font et que le bot ne faisait pas : lâcher le volant juste avant de retomber, zigzaguer par petits coups rapides, donner de petits coups de nitro en l'air, garder la nitro un quart de seconde après le décollage, laisser la voiture finir sa glisse quand elle retombe.
- À la naissance, ces gestes sont **éteints** : les pilotes conduisent comme avant.
- De temps en temps, un nouveau-né en allume un, au hasard. S'il fait mieux, il reste et transmet son geste ; sinon, il est renvoyé comme les autres.
- On ne sait pas encore si ces gestes sont bons : c'est la sélection qui le dira. Dans l'arbre, la fiche d'un pilote montre un geste allumé (par exemple `coupOn` : 0 → 1).
- Ce changement a commencé une **nouvelle époque** (un trait pointillé sur les courbes) : les notes sont reparties de zéro, les pilotes sont restés.

---

## Prendre un champion

Chaque champion sacré laisse deux fichiers dans `champions/` :

- `gNNNN-xxxxxxxx.js` : le pilote lui-même. NNNN est la génération où il a été sacré. C'est un pilote ordinaire, comme pilote-voltige.
- `gNNNN-xxxxxxxx.json` : ses notes et ce qui a changé par rapport au témoin.

Le plus récent est le champion en titre. Le tableau (section 4) et la ligne 4 de `etat.js` donnent son identifiant.

Pour le faire noter comme n'importe quel bot, à la racine du dossier :

```
node ml\bot\noter.js ml\evolution\champions\gNNNN-xxxxxxxx.js --graines 12 --depart 910000 --tmax 900 --regime allege
```

Pour l'inscrire au labo ou le mettre dans le jeu, donne le fichier à Claude. Le labo demande d'abord une petite retouche de `ml/labo/labo.js` (étape 9 de la spécification).

---

## Si ça s'arrête

| Ce que tu vois | Ce que ça veut dire | Quoi faire |
|---|---|---|
| `ARRETE SANS PREVENIR` (ligne 2) | Le PC a redémarré, la fenêtre a été fermée, ou une coupure. | Double-clic sur `lancer.cmd`. Il reprend tout seul. |
| `ARRETE (arret voulu ...)` | Tu as utilisé `arreter.cmd`. | Double-clic sur `lancer.cmd` quand tu veux reprendre. |
| La fenêtre dit « Pas lancé : il tourne déjà » | Une sélection tourne déjà. | Rien. |
| La fenêtre dit « Pas lancé : … une option est mal écrite » | Un mot de travers dans la commande. Rien n'a été lancé. | Regarder la fin de `etat/sortie.log`. `node ml\evolution\evoluer.js --aide` montre toutes les options. |
| `sortie.log` dit « le maitre pid … vit encore mais son signe de vie a … s (veille ?) » | Le PC sort de veille ; l'ancienne sélection tourne encore. Le second lancement ne lui prend pas sa place. | Rien : elle reprend toute seule. |
| `sortie.log` dit « VERROU PERDU » | Deux sélections se sont disputé le même dossier `etat/`. Celle-ci s'est arrêtée proprement. | Rien, si l'autre tourne (`node ml\evolution\etat.js` dit EN MARCHE). Sinon, relancer. |
| `sortie.log` finit par « journal illisible » | Une ligne abîmée au milieu d'un journal de `etat/` (`morts.jsonl`, `generations.jsonl`…). La sélection ne part pas, pour ne rien oublier en silence. | Donner la fin de `etat/sortie.log` à Claude. |
| La fin de `sortie.log` parle de `boucle.js` ou d'une inscription au labo | `ml/ecurie/boucle.js` tourne, ou une inscription au labo est en cours. Ils ne doivent pas tourner en même temps que la sélection. | Attendre qu'ils aient fini, puis relancer. |
| `sortie.log` dit « impossible de verifier que ml/ecurie/boucle.js ne tourne pas … on part quand meme » | Windows n'a pas répondu à temps. La sélection est partie quand même. | Rien, si `boucle.js` ne tourne pas. |
| `sortie.log` finit par « YEUX CHANGES » ou « identite » | Les yeux du bot ont changé d'une façon que la sélection ne sait pas suivre. | **Ne pas relancer en boucle.** Donner la fin de `etat/sortie.log` à Claude. |
| Alerte « plus de 2 % de courses non mesurées » ou « panne(s) de cerveau » | Des courses plantent. Un pilote qui rate seul deux courses est renvoyé ; une course ratée à cause du PC (trop chargé, arrêt) est rejouée au lancement suivant. | Regarder la fin de `etat/sortie.log`. Si ça dure, arrêter et demander à Claude. |
| Alerte « population trop semblable » | Les pilotes se ressemblent trop. | Pas urgent. Le signaler à Claude. |
| Alerte « aucune generation finie depuis ... » | Il tourne mais n'avance plus. | Regarder la fin de `etat/sortie.log`. Arrêter puis relancer. |
| Les relances automatiques ne repartent pas | La tâche n'est pas posée, ou `arreter.cmd` a été utilisé. | Double-clic sur `lancer.cmd`. |
| `etat/traces.log` dit « envoi rate » à chaque heure | GitHub refuse ou n'est pas joignable. Tout reste gardé sur le PC. | Double-clic sur `sauver-traces.cmd` et connecte-toi à GitHub si on te le demande. |
| `sauver-traces.cmd` dit « refuse : la branche courante est … » | Il a été lancé hors du dossier de la sélection. | Le lancer depuis `CASH-CAR-evolution\ml\evolution`. |
| La fenêtre se ferme tout de suite, avec « … était inattendu » | Plus depuis le 27/11 : `lancer.cmd` marche aussi dans un dossier dont le nom a des parenthèses, comme `CASH CAR (2)`. | Si ça revient : renommer le dossier sans parenthèses. |

Windows arrête une tâche planifiée au bout de 3 jours. La relance de toutes les heures la fait repartir. Rien n'est perdu.

Le journal complet est `etat/sortie.log`. La fin du fichier est le plus récent.

---

## Ce qu'il ne faut pas faire

- **Ne pas effacer `etat/`** : c'est la mémoire de la sélection (les pilotes, leurs notes, toutes les courses jouées).
- Ne pas changer le jeu, les yeux ou la main du bot dans ce dossier pendant que ça tourne. Sur le PC de nuit, la sélection tourne dans un dossier à elle (`CASH-CAR-evolution`), que personne ne touche.
- Ne pas lancer `ml/ecurie/boucle.js` en même temps.
- Ne pas modifier `config.json` pendant que ça tourne. Le nombre de courses à la fois ne s'y règle plus : il est mesuré pour chaque PC.

---

## Les fichiers

| Fichier | Rôle |
|---|---|
| `lancer.cmd` | Lance (double-clic). |
| `arreter.cmd` | Arrête proprement (double-clic). |
| `installer-tache.cmd` | Pose le lancement automatique et la mise à l'abri de chaque heure (une fois, par toi). |
| `sauver-traces.cmd` | Met l'arbre, le récit et le tableau à l'abri dans git et sur GitHub (double-clic). |
| `etat.js` | Le résumé en 10 lignes. |
| `tableau.js` | Refait le tableau (et l'arbre, et le récit). |
| `arbre.js`, `histoire.js` | Refont l'arbre et le récit (le tableau les appelle). |
| `etat/tableau.html` | Le tableau à ouvrir. |
| `etat/arbre.html` | L'arbre généalogique des pilotes. |
| `etat/histoire.md` | Le récit, génération par génération. |
| `etat/resume.txt` | Les 10 lignes, dans un fichier. |
| `etat/machine.json` | Ce que la mesure a trouvé pour ce PC (combien de courses à la fois). |
| `etat/sortie.log` | Tout ce qui s'est passé. |
| `etat/traces.log` | Le détail de la mise à l'abri. |
| `etat/PAS-D-ENVOI` | (si tu le crées) la mise à l'abri n'envoie plus rien. |
| `champions/` | Les champions sacrés. |
| `config.json` | Tous les réglages de la sélection. |
| `notes/LIVRAISON.md` | Ce qui est prêt, et les commandes à taper sur le PC de nuit. |
| `INTERFACES.md` | Pour les développeurs : comment les morceaux s'emboîtent. |
