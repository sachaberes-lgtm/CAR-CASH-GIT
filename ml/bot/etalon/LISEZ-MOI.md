# Les parties des joueurs — l'étalon

Dépose ici les fichiers exportés par le jeu (`cashcar-parties-….json`). Rien d'autre à faire : `node ../etalon.js` les lit tous.

Depuis le 24/11/2026 l'étalon compte deux joueurs (décision de Sacha). **Rien dans un export ne dit qui a joué** : la liste est tenue
ici et dans `JOUEURS` (en tête de `../etalon.js`), fichier par fichier — jamais par date (corrigé le 24/11 : le fichier du 24/11 à 12:13 est à Sacha).

| Fichier | Joueur | Ce qu'il contient |
|---|---|---|
| `cashcar-parties-2026-11-23-1950.json` | Sacha (au clavier) | 7 morceaux (23/11, 19:29 à 19:47), dont une reprise par seconde chance (19:42, recollée à 19:33) |
| `cashcar-parties-2026-11-23-2020.json` | Sacha (au clavier) | 3 parties (23/11, 20:15 à 20:19) |
| `cashcar-parties-2026-11-24-1213.json` | Sacha (au clavier) | 6 parties : les 3 de 20:20 **en double** (écartées par `etalon.js`) + 3 morceaux nouveaux (24/11, 12:05 à 12:10 ; 12:10 est la reprise par seconde chance de 12:06) |
| `cashcar-parties-2026-11-24-11-05.json` | Léo (au doigt, sur téléphone) | 5 parties (24/11, 10:44 à 11:00), dont celle de 10:44 à l'auto-école (écartée) |

La barre d'un seul joueur, à côté : `node ../etalon.js --nom=Leo` (ses fichiers sont pris dans la liste) → `results/etalon-leo.json`.
**Un nouvel export** : l'ajouter à ce tableau ET à `JOUEURS` dans `../etalon.js` (sinon `etalon.js` demande « à qui est ce fichier ? »).

Ces fichiers restent dans git : une partie jouée ne se refabrique pas (leçon de `ml/train`).

Le mode d'emploi complet (allumer l'enregistreur, jouer, exporter) est dans `../README.md`, section « L'étalon ».
