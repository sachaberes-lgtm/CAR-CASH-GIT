# Passation — l'écurie, le 26/11/2026 à 17 h

À lire en premier par la session qui reprend. Le détail de chaque étape est dans `ETAPES.md` ; ici, l'état exact, ce qui tourne, et quoi faire.

## Ce qui a changé le 26/11 (la demande de Sacha)

Sacha a regardé les bots : « ils conduisent bien mais ils sont encore trop frileux de s'envoler et de faire des figures dans les airs ; pour plus de
réalisme il faut qu'ils puissent utiliser toutes les figures du jeu ; parfois ils n'osent pas prendre des raccourcis évidents ». Puis : « lance une
enquête : tous les éléments à ajouter aux bots pour simuler de vrais joueurs ; objectif : on ne peut pas du tout faire la différence ».

**La boucle par tranches n'a donc PAS été relancée** : elle ne note que le palier médian, et partait d'un pilote qui ne vole pas exprès. La relancer
telle quelle dépenserait 12 € par jour à polir ce que Sacha vient de refuser. Elle repartira du pilote qui vole, avec une note « palier et ressemblance ».

| | État |
|---|---|
| **L'enquête** (`etude/realisme.md`, une session à part, 0 €) | **faite** : 26 écarts mesurés entre le pilote et les joueurs, classés ; le juge mis à l'épreuve (0,974 ; il resterait 0,965 même en corrigeant nitro, vols et figures) ; 28 parties à enregistrer par Sacha et 8 lignes à ajouter à l'enregistreur du jeu (sa décision) |
| **La voltige mesurée** (`ml/bot/voltige.js`) | **fait** : les vols un par un, joueurs et bots comptés pareil (`node voltige.js` : les joueurs ; `node voltige.js <note --parties>` : un bot) |
| **Le rayon « viser »** (`ml/bot/yeux.js`, README § 2 bis) | **fait** : le radar dit enfin si un raccourci se pose (en vol et depuis le bord), avec la loi à suivre (`vue.vol.cible`) et l'ordre `cible` |
| **Le garage** (`module.exports.garage`, README § 1) | **fait et essayé** : un pilote s'équipe de n'importe laquelle des 12 figures du jeu (une course : rodéo, chandelle et hélico lancés ; rejeu exact) ; la boucle fixe le garage comme la main |
| **Le pilote qui vole** (`ml/ecurie/pilote-voltige.js`) | **un premier palier, réglé le 26/11 après-midi** (détail et tableau : `ETAPES.md`, « L'étape C, deuxième temps ») — sur 20 courses de 900 s : palier médian **9,5**, record **21** (`pilote.js` : 11 et 20) ; **0,71 raccourci par minute** de 749 m (avant 0,24 ; les joueurs 3,49) ; **0,59 figure lancée par minute** (avant 0 ; joueurs 2,79) ; sous la dalle **14 %** du sol (avant 29 % ; joueurs 3 %) ; les plongeons voulus tuent 6 fois sur 100. **Le juge ne bouge pas : 0,97** (avant 0,974). `pilote.js` n'est pas remplacé |
| Contrôles | `node ml/bot/verifier.js` **TOUT PASSE** (604 s, empreinte `a7b3171768ca`, après le dernier changement des yeux) ; `node ml/labo/rejouer.js --tout` : **34 rejeux exacts sur 34** (refaits le 26/11 à 17 h) |
| GitHub | la branche `bots-ecurie` est poussée (`origin/bots-ecurie`), pour le second PC de Sacha (Ryzen 5 3600, 12 fils : à installer, voir plus bas) |

**Dépensé : 36,92 € sur 200** au 26/11 à 14 h 30 (0 € aujourd'hui). L'abonnement : 3 à 4 % de la semaine après cette session.

## Ce qui tourne : rien. À lancer par Sacha

**L'agent « voltige »**, payé par la clé d'API (12 $ au plus), est **prêt mais pas lancé** : le 26/11 à 14 h 30 l'app a refusé que la session le lance
elle-même (une dépense : c'est à Sacha de la déclencher). Depuis un terminal ordinaire :

```powershell
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie; node agent-api.js --consigne consignes-agents/voltige.md --nom voltige --modele claude-fable-5-2 --budget 12 --etape C
```

Sa tâche (`consignes-agents/voltige.md`) : amener `pilote-voltige.js` au niveau — survivre comme `pilote.js`, voler, couper et faire des figures comme un
joueur —, en s'appuyant sur l'enquête. Son rapport : `agents/<date>-voltige.md` ; il met `ETAPES.md` à jour et valide dans git (jamais de push).
Il dure une à trois heures et occupe 6 des 8 cœurs du PC. Sans lui, la session qui reprend fait ce réglage elle-même (étape 1 ci-dessous).

## À faire ensuite, dans l'ordre

1. **Ce qui trahit encore le plus le pilote qui vole** (le juge, 20 courses) : le slalom (ondulation z +4 : un aller toutes les 1,0 s sur 17 m, les
   joueurs 0,55 s sur 9 m — c'est la main et la ligne visée), la **nitro** (30 % du temps contre 63 %), la part du temps en l'air (17 % contre 28 %),
   la hauteur des vols (4 m contre 38 m : les joueurs s'envolent nitro allumée et montent). Puis rouvrir la grotte, le canyon et la jade aux sorties
   voulues (il faut d'abord mesurer la justesse des rayons `viser` du sol : `justesse.js` ne les tire pas). Si l'agent voltige a tourné : lire son
   rapport et refaire ses chiffres (`cd ml/ecurie/agents/tmp-voltige; node lot.js ../../pilote-voltige.js --graines 12 --tmax 300 --coeurs 6 --nom controle` ;
   repères sur ces 12 graines : `pilote.js` médian 12,5, la version du 26/11 9,5 à 10,5 ; sur 12 graines neuves `--depart 930000` : 7 et 6,5 à 7,5).
2. **Le juge** (`ml/bot/discerner.js`) : lui ajouter les mesures de l'enquête (§ 3 de `realisme.md` : le dessous de la dalle, la durée d'un aller du slalom,
   le volant en vol, les allumages de nitro en vol, la pose…), un juge « à l'instant » et un juge « du compte ». Sans lui la boucle ne voit aucun progrès de ressemblance.
3. **La boucle** : une note « palier **et** ressemblance » (aujourd'hui `--critere palier_median`) — par exemple refuser une variante dont les vols, les
   raccourcis ou les figures par minute sortent des plages des joueurs (`voltige.resume`), puis départager au palier. Mettre `CONSIGNES.md` à jour (il dit
   encore « figures rares », et rien du rayon viser ni du garage). Puis relancer la chaîne (`node chaine.js` depuis un terminal ordinaire).
4. **Le plan d'action de l'enquête** (§ 4 de `realisme.md`), dans son ordre : sortir du dessous de la dalle (29 % du sol contre 3 %), s'envoler nitro
   allumée, tapoter la nitro en vol, viser le portail en vol, le départ, la seconde chance (`chance.prend` de 1 à 0,3 : c'est la main, donc l'étape D),
   la nitro au sol, le rythme du slalom.
5. **Les garages par niveau** (étape D) : un bot du palier 5 a les figures du débutant, un bot du palier 25 des figures chères ; à tirer par bot.
6. Étapes D, E, F (`ETAPES.md`).

## Ce que Sacha peut faire

- **Enregistrer des parties** : la liste est dans `etude/realisme.md` § 5 (28 parties : 6 normales, 4 « voltige », 4 « prudent », 4 avec d'autres figures
  équipées, 6 de Léo au doigt, 4 d'un vrai débutant). ⚠ L'enquête recommande d'ajouter **d'abord** 8 lignes à l'enregistreur du jeu (les touches ↑ ↓,
  la jauge de nitro, le verdict des poses, la frénésie, la graine de la piste…) : sans elles, les nouvelles parties auront les mêmes trous. C'est une
  modification du jeu : **à décider par Sacha**. Exporter toutes les 4 ou 5 parties (l'enregistreur n'en garde que 8).
- **Un deuxième PC** : les simulations tournent sur le processeur de ce PC (8 cœurs), pas chez Claude, et une carte graphique n'y change rien. Un autre
  PC avec beaucoup de cœurs, Node.js et une copie du dépôt doublerait la cadence ; rien n'est encore écrit pour répartir les courses.

## Comment le travail se paie — la règle de Sacha

**Le travail lourd se paie sur la clé d'API, jamais sur l'abonnement** (le 25/11 un workflow de 152 agents a vidé l'abonnement : à ne pas refaire).
`agent-api.js` (une session sans écran, la clé seulement, coût au journal, plafond de 200 €), `chaine.js`, `relais.js`, `apres.js`,
`consignes-agents/`. La clé : `setx` par Sacha ; ne jamais l'afficher. Le 26/11 Sacha a ajouté : « gère bien ta consommation de l'abonnement et des
crédits API pour que ça dure toute la semaine ». Le rythme : ce qui reste des 200 € partagé entre les jours jusqu'au 08/12 (≈ 12,5 € par jour).

## Défauts connus

- `pilote-voltige.js` : la grotte, le canyon et la jade sont interdits aux sorties voulues (l'annonce du rayon du sol y est fausse : 4 sorties sur 4
  contre la roche à la grotte, 3 sur 4 ratées sur la jade) alors que les joueurs y coupent 4 à 5 fois par minute ; les figures restent rares parce
  qu'une figure lancée à moins de 2,2 s de la pose dérègle le plongeon ; il passe encore 14 % du sol sous la dalle.
- La justesse des rayons « viser » n'est pas mesurée par `justesse.js` ; la salle de projection ne remet pas encore le garage d'un rejeu (`page.html`).
- Fable 5.2 coupé à 32 000 jetons dans `boucle.js` (`max_tokens`) ; la seconde chance prise 7 fois sur 12 (joueurs 2 sur 14) ; le canyon tue toujours.

## Pour voir et tester

- **Les vols des joueurs et d'un bot** : `cd ml\bot; node voltige.js --vols` ; `node voltige.js <note faite avec --parties> --nom x`.
- **Une course racontée vol par vol** : `cd ml\ecurie\agents\tmp-voltige; node essai.js ..\..\pilote-voltige.js --graine 910074 --tmax 150 --detail`.
- **Les bots jouer, avec l'image** : `cd ml\labo; node projection.js`, puis http://localhost:3161/ . L'arbre : http://localhost:3161/labo/arbre.html .
- **L'enquête** : `ml/ecurie/etude/realisme.md`. Les comptes rendus : `ml/ecurie/comptes-rendus/`. Le portfolio : `ml/ecurie/portfolio/index.html`.

## Le texte à coller dans la session qui reprend

> Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (branche `bots-ecurie`), lis `ml/ecurie/PASSATION.md`, `ml/ecurie/etude/realisme.md` puis `ml/ecurie/ETAPES.md`. Lis le rapport de l'agent voltige (`ml/ecurie/agents/*-voltige.md`), contrôle ses chiffres, puis suis « À faire ensuite » de la passation. Fais payer tout travail lourd par la clé d'API (`agent-api.js`), jamais par mon abonnement, sans dépasser 200 € au total d'ici le 08/12, et à chaque fin de contexte prépare un compte rendu esthétique et testable. Ne me pose pas de question.
