# La sélection naturelle des bots : le mode d'emploi

Une population de 20 pilotes joue des courses sur ce PC, jour et nuit, sans Internet et sans rien payer.
À chaque génération, 6 nouveaux pilotes naissent (des copies légèrement changées des meilleurs). Les moins bons sont renvoyés.
Quand un pilote prouve sur des courses neuves qu'il fait mieux que le champion, il devient le nouveau champion.
Il est alors rangé dans le dossier `champions/`.

Tout se passe dans ce dossier, `ml/evolution/`. Le jeu n'est jamais modifié.

---

## Lancer

**Double-clic sur `lancer.cmd`.**

- Une fenêtre noire s'ouvre. **Laisse-la ouverte** : elle n'affiche rien, c'est normal. Tout est écrit dans `etat/sortie.log`.
- La fermer arrête tout d'un coup. Ce n'est pas grave (seules les courses en cours sont perdues), mais `arreter.cmd` est plus propre.
- Si c'est déjà lancé, le second lancement s'en rend compte et ne fait rien.
- Au tout premier lancement, il vérifie d'abord que le pilote fabriqué conduit exactement comme pilote-voltige. Cela prend quelques minutes.

### Le lancement automatique (une seule fois, par toi)

**Double-clic sur `installer-tache.cmd`.** Il explique ce qu'il va faire et demande O ou N.

Ce qu'il fait :
- il relance la sélection 5 minutes après l'ouverture de ta session Windows ;
- il relance toutes les heures si elle s'est arrêtée toute seule ;
- il coupe la mise en veille quand le PC est sur secteur, pour qu'il ne s'endorme pas la nuit.

Il ne relance pas une sélection que tu as arrêtée avec `arreter.cmd`. Pour la reprendre, refais un double-clic sur `lancer.cmd`.

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

Dans une fenêtre de commande, à la racine du dépôt :

```
node ml\evolution\etat.js
```

Ces 10 lignes sont aussi dans `etat/resume.txt`. Elles disent, dans l'ordre :

1. la génération, la phase (A, B ou C) et l'époque ;
2. **EN MARCHE** ou **ARRETE** ;
3. le débit (courses jouées par heure) ;
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

---

## Prendre un champion

Chaque champion sacré laisse deux fichiers dans `champions/` :

- `gNNNN-xxxxxxxx.js` : le pilote lui-même. NNNN est la génération où il a été sacré. C'est un pilote ordinaire, comme pilote-voltige.
- `gNNNN-xxxxxxxx.json` : ses notes et ce qui a changé par rapport au témoin.

Le plus récent est le champion en titre. Le tableau (section 4) et la ligne 4 de `etat.js` donnent son identifiant.

Pour le faire noter comme n'importe quel bot, à la racine du dépôt :

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
| `sortie.log` dit « le maitre pid … vit encore mais son signe de vie a … s (veille ?) » | Le PC sort de veille ; l'ancienne sélection tourne encore. Le second lancement ne lui prend pas sa place. | Rien : elle reprend toute seule. |
| `sortie.log` dit « VERROU PERDU » | Deux sélections se sont disputé le même dossier `etat/`. Celle-ci s'est arrêtée proprement. | Rien, si l'autre tourne (`node ml\evolution\etat.js` dit EN MARCHE). Sinon, relancer. |
| `sortie.log` finit par « journal illisible » | Une ligne abîmée au milieu d'un journal de `etat/` (`morts.jsonl`, `generations.jsonl`…). La sélection ne part pas, pour ne rien oublier en silence. | Donner la fin de `etat/sortie.log` à Claude. |
| La fin de `sortie.log` parle de `boucle.js` ou d'une inscription au labo | `ml/ecurie/boucle.js` tourne, ou une inscription au labo est en cours. Ils ne doivent pas tourner en même temps que la sélection. | Attendre qu'ils aient fini, puis relancer. |
| `sortie.log` finit par « YEUX CHANGES » ou « identite » | Les yeux du bot ont changé d'une façon que la sélection ne sait pas suivre. | **Ne pas relancer en boucle.** Donner la fin de `etat/sortie.log` à Claude. |
| Alerte « plus de 2 % de courses non mesurées » ou « panne(s) de cerveau » | Des courses plantent. Un pilote qui rate seul deux courses est renvoyé ; une course ratée à cause du PC (trop chargé, arrêt) est rejouée au lancement suivant. | Regarder la fin de `etat/sortie.log`. Si ça dure, arrêter et demander à Claude. |
| Alerte « population trop semblable » | Les pilotes se ressemblent trop. | Pas urgent. Le signaler à Claude. |
| Alerte « aucune generation finie depuis ... » | Il tourne mais n'avance plus. | Regarder la fin de `etat/sortie.log`. Arrêter puis relancer. |
| Les relances automatiques ne repartent pas | La tâche n'est pas posée, ou `arreter.cmd` a été utilisé. | Double-clic sur `lancer.cmd`. |

Windows arrête une tâche planifiée au bout de 3 jours. La relance de toutes les heures la fait repartir. Rien n'est perdu.

Le journal complet est `etat/sortie.log`. La fin du fichier est le plus récent.

---

## Ce qu'il ne faut pas faire

- **Ne pas effacer `etat/`** : c'est la mémoire de la sélection (les pilotes, leurs notes, toutes les courses jouées).
- Ne pas changer le jeu, les yeux ou la main du bot dans ce dossier pendant que ça tourne. Sur le PC de nuit, la sélection tourne dans un dossier à elle (`CASH-CAR-evolution`), que personne ne touche.
- Ne pas lancer `ml/ecurie/boucle.js` en même temps.
- Ne pas modifier `config.json` pendant que ça tourne. Si un nombre doit changer, arrêter d'abord.

---

## Les fichiers

| Fichier | Rôle |
|---|---|
| `lancer.cmd` | Lance (double-clic). |
| `arreter.cmd` | Arrête proprement (double-clic). |
| `installer-tache.cmd` | Pose le lancement automatique (une fois, par toi). |
| `etat.js` | Le résumé en 10 lignes. |
| `tableau.js` | Refait le tableau. |
| `etat/tableau.html` | Le tableau à ouvrir. |
| `etat/resume.txt` | Les 10 lignes, dans un fichier. |
| `etat/sortie.log` | Tout ce qui s'est passé. |
| `champions/` | Les champions sacrés. |
| `config.json` | Tous les réglages de la sélection. |
| `INTERFACES.md` | Pour les développeurs : comment les morceaux s'emboîtent. |
