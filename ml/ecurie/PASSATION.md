# Passation — l'écurie, le 26/11/2026 à 14 h 30

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
| **Le pilote qui vole** (`ml/ecurie/pilote-voltige.js`) | **commencé, pas au niveau** : il sort exprès, plonge, se pose (12 raccourcis de 326 m en médiane sur 12 courses ; les joueurs 413 m) et lance des figures, mais 0,5 sortie voulue par minute (joueurs : 3,5 raccourcis) et **palier médian 8,5 contre 12,5** pour `pilote.js` sur les mêmes 12 courses de 300 s. `pilote.js` n'est pas remplacé |
| Contrôles | `node ml/bot/verifier.js` **TOUT PASSE** (534 s, empreinte `a7b3171768ca`) ; `node ml/labo/rejouer.js --tout` : **34 rejeux exacts sur 34** |

**Dépensé : 36,92 € sur 200** au 26/11 à 14 h (rien de plus aujourd'hui avant l'agent ci-dessous). L'abonnement : 3 à 4 % de la semaine après cette session.

## Ce qui tourne

**L'agent « voltige »**, payé par la clé d'API, lancé le 26/11 vers 14 h 30 dans un onglet du terminal de l'app (il survit à la fin de la session) :

```powershell
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie; node agent-api.js --consigne consignes-agents/voltige.md --nom voltige --modele claude-fable-5-2 --budget 12 --etape C
```

Sa tâche (`consignes-agents/voltige.md`) : amener `pilote-voltige.js` au niveau — survivre comme `pilote.js`, voler, couper et faire des figures comme un
joueur —, en s'appuyant sur l'enquête. Son rapport : `agents/<date>-voltige.md` ; il met `ETAPES.md` à jour et valide dans git (jamais de push).
S'il n'a pas tourné (onglet fermé, clé absente) : relancer la commande ci-dessus depuis un terminal ordinaire.

## À faire ensuite, dans l'ordre

1. **Lire le rapport de l'agent voltige** et refaire ses chiffres : `cd ml/ecurie/agents/tmp-voltige; node lot.js ../../pilote-voltige.js --graines 12 --tmax 300 --coeurs 6 --nom controle`
   (les mêmes 12 courses pour `pilote.js` : `lot-v1.txt`, médian 12,5). S'il tient ses buts (consigne, « TON BUT, CHIFFRÉ »), `pilote-voltige.js` devient `pilote.js`.
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

- `pilote-voltige.js` : la grotte et le canyon sont interdits aux sorties voulues (4 sur 4 finissaient contre la roche : l'annonce du rayon du sol y est
  fausse) alors que les joueurs y coupent 5 fois par minute ; vols voulus trop longs (4,6 s en médiane) ; survie en baisse sur les vols subis, cause non trouvée.
- La justesse des rayons « viser » n'est pas mesurée par `justesse.js` ; la salle de projection ne remet pas encore le garage d'un rejeu (`page.html`).
- Fable 5.2 coupé à 32 000 jetons dans `boucle.js` (`max_tokens`) ; la seconde chance prise 7 fois sur 12 (joueurs 2 sur 14) ; le canyon tue toujours.

## Pour voir et tester

- **Les vols des joueurs et d'un bot** : `cd ml\bot; node voltige.js --vols` ; `node voltige.js <note faite avec --parties> --nom x`.
- **Une course racontée vol par vol** : `cd ml\ecurie\agents\tmp-voltige; node essai.js ..\..\pilote-voltige.js --graine 910074 --tmax 150 --detail`.
- **Les bots jouer, avec l'image** : `cd ml\labo; node projection.js`, puis http://localhost:3161/ . L'arbre : http://localhost:3161/labo/arbre.html .
- **L'enquête** : `ml/ecurie/etude/realisme.md`. Les comptes rendus : `ml/ecurie/comptes-rendus/`. Le portfolio : `ml/ecurie/portfolio/index.html`.

## Le texte à coller dans la session qui reprend

> Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (branche `bots-ecurie`), lis `ml/ecurie/PASSATION.md`, `ml/ecurie/etude/realisme.md` puis `ml/ecurie/ETAPES.md`. Lis le rapport de l'agent voltige (`ml/ecurie/agents/*-voltige.md`), contrôle ses chiffres, puis suis « À faire ensuite » de la passation. Fais payer tout travail lourd par la clé d'API (`agent-api.js`), jamais par mon abonnement, sans dépasser 200 € au total d'ici le 08/12, et à chaque fin de contexte prépare un compte rendu esthétique et testable. Ne me pose pas de question.
