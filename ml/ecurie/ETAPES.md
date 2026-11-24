# L'écurie — les étapes, une par une

Chaque étape se ferme par **un commit** sur la branche `bots-ecurie` (dossier `C:\Users\sacha\code\CASH-CAR-bots-ecurie`).
Pour chacune : ce qui en sort, **comment vérifier**, et **le texte à coller dans une autre session** pour lancer la suivante.
Le plan d'ensemble est dans `PLAN.md`, l'étude dans `etude/`.

> ⚠ Toujours travailler dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie`, jamais dans `CAR-CASH-GIT` (d'autres sessions y changent de branche).
> Vérifier la branche avant un commit : `git branch --show-current` doit répondre `bots-ecurie`.

| # | Étape | État |
|---|---|---|
| A | L'étude : ce qui donne des pièces, ce qui tue, les vrais joueurs mesurés | **faite** (commit `67ea1f009`) |
| B | Les fondations : défauts corrigés, yeux v2, doigts v2 | **il ne manque que la relecture** : les défauts sont corrigés et validés ; **les yeux v2** (24/11, nuit) et **les doigts v2** (nuit du 24 au 25/11) sont écrits, contrôlés et mesurés ; la relecture par trois agents reste à faire |
| C | Le pilote d'élite, amélioré par tours | à faire |
| C bis | La boucle automatique sur le crédit API (les 200 €), avec un plafond de dépense | **écrite** (`boucle.js`), **jamais essayée** (ni à blanc, ni pour de vrai) ; la clé est posée par Sacha |
| D | Le facteur humain et les 30 niveaux | à faire |
| E | Le juge, niveau par niveau | à faire |
| F | Le paquet du matchmaking et le dossier du portfolio | à faire |

---

## OÙ ON EN EST — à lire en premier (25/11/2026, 1 h, après les yeux v2 et les doigts v2)

**Fait et validé dans git** (branche `bots-ecurie`) :
- l'étude (`etude/`), le plan (`PLAN.md`), le juge `ml/bot/discerner.js`, le palier dans les mesures, le régime allégé du simulateur ;
- **les 24 défauts corrigés** sur les 28 confirmés : 15 dans `ml/bot`, 9 dans `ml/labo`. Contrôles faits par les agents qui les ont
  corrigés : `node verifier.js` passe en entier avec l'empreinte `a7b3171768ca`, les 4 rejeux gardés restent exacts, `node etalon.js`
  donne les paliers 1 1 4 5 5 8 11 12 14 15 16 21 22 28. Je n'ai refait moi-même que la syntaxe, `etalon.js` et `labo.js` ;
- la note de départ : le bot de référence en version allégée, **palier médian 9, meilleur 25** (`ml/bot/results/note-reference-allege.json`) ;
- la boucle sur le crédit API : `boucle.js`, `CONSIGNES.md`, `essai-api.js`.

**Fait depuis (24/11, nuit) — les yeux v2** (`ml/bot/yeux.js`, décrits dans `ml/bot/README.md` § 2, 2 bis, 2 ter) :
- **en vol, le radar** : le vol rejoué image par image avec les lois du jeu, pour 10 façons de piloter (les touches telles qu'elles sont, rien,
  gauche, droite, cabrer, piquer, planer, planer en cabrant, revenir vers la route sans et avec la nitro) → pose (où, quand, dans quel axe, quel
  choc), lèvre, choc contre le décor (grotte, jade, ville, géants de l'orbite ; la cause et le délai), jauge vide, fond du monde, portail ;
- **au sol** : `tenue` (la route se tient-elle 3 s ?), `sorties` (le même radar depuis le bord, d'office ; depuis une sortie à gauche, à droite
  ou un saut, à la demande : `regarder:'sorties'`), `virage` (rayon, vitesse sûre), `couloirs` et `mur`, `ligne` (la ligne parfaite),
  `sautRefuse`, `arret` ; et toujours `palier`, `aimant`, `vitMult`, `invulnerable`, `vol.air` (la vraie marge sous le raisin) ;
- **mesuré** (`ml/bot/justesse.js`, le voltigeur `ml/bot/voltigeur.js`) : sur 57 vols de 6 maps (le voltigeur, version allégée), l'issue prévue est la bonne **57 fois sur 57 à la première vue du vol et 51 sur 51 une seconde avant sa fin** ; une pose
  est annoncée à 0 s, 0,2 m le long de la piste et 0,03 m de côté près (médianes), sa note 22 fois sur 22 ; les 8 chocs contre le décor sont vus. Image par
  image (`--pas`, 44 vols), **les places prévues sont celles du jeu au centimètre, 44 fois sur 44**. Pour le bot de référence, qui change d'ordre en vol, le
  rayon `tenu` dit juste 10 fois sur 12. Une sortie franche du sol est annoncée à 0,07 s près (médiane), l'issue du vol qui suit 16 fois sur 17. Limite : 57
  vols, c'est peu, et ni `cabre`, ni `pique`, ni `versRoute` sans nitro n'ont été tirés ;
- **contrôlé** (`node ml/bot/verifier.js`, sections 3 bis à 8) : `TOUT PASSE` en 9 min (21 processus neufs, 2 à la fois) : l'empreinte de la section 3 reste
  `a7b3171768ca` et égale le témoin écrit dans le fichier ; les vues sont les mêmes dans deux processus ; sans le radar, ou les yeux ouverts à chaque image
  avec les sorties, même course ; aucun tirage du hasard du jeu ; l'état du jeu intact sur 110 contrôles (seuls bougent deux brouillons des heurts du jeu,
  `V9J` et `CY_H9`). `node ml/labo/rejouer.js --tout` : 4 rejeux exacts sur 4.

**Ce que les yeux v2 ne font pas, ou mal** (dit aussi dans le README) :
- **le canyon du simulateur n'a pas de relief** : dans `ml/reel` son calcul part dans un travailleur qui ne répond jamais — ni paroi, ni rivière,
  ni mur de couloir, donc aucune mort « paroi », « riviere » ou « canyon » dans les notes des bots. L'interrupteur du jeu `?cyw=0` le calcule sur
  place (`node ml/bot/justesse.js --cartes canyon --requete "&cyw=0"`). **À décider** : l'ajouter à `ml/reel/jeu-reel.js` change toutes les
  courses qui passent au canyon (notes, rejeux gardés). Avec le relief, une sonde du canyon coûte 134 µs : 13 à 18 ms par vue en vol — il faudra un mémo du relief avant de l'allumer
  pour de bon ;
- **le saut** des sorties prend l'impulsion du dernier saut de la course ; avant le premier, le plancher du jeu : la pose est alors annoncée 0,7 s et 45 m trop tôt
  (mesuré sur 18 sauts) ; le décollage, lui, est à l'image près ;
- pas de rayon `viser` (vers un tronçon en contrebas), pas de plafonds hors des tables (voûtes, boyaux) ; le miroir de `lat` sous la dalle
  dans les champs d'avant n'est pas corrigé ;
- le coût : 0,74 ms par vue contre 0,39 sans le radar sur la course du contrôle 3 (bot de référence, 150 s) ; une vue en vol coûte 1 à 2 ms sans décor, mais
  **2 à 4,5 ms devant la ville, la grotte ou les pics de jade : la cible de 2,5 ms n'y est pas tenue** ; la vue pèse 2 360 caractères contre 1 640.

**Fait depuis (nuit du 24 au 25/11) — les doigts v2** (`ml/bot/doigts.js`, `piloter.js`, décrits dans `ml/bot/README.md` § 3.1 à 3.8) :
- **un `profil` par cerveau** (`module.exports = { nom, profil, decide }`), lu une fois au chargement, borné chez l'hôte (un champ inconnu refuse le
  cerveau). Il règle la main : **temps de réaction** par canal, **suivi** de `ligne` / `viser` à chaque image, **volant par coups** de durées
  tirées, **nitro hachée** au sol, **drift** (l'ordre `drift: ±1` : la flèche d'abord, ↓ ensuite), **seconde chance** (la main touche la plaque
  CONTINUER comme un joueur : c'est le profil qui décide), cinq **erreurs** (appui manqué, réaction en retard, appui trop long, bruit, appui
  parasite). Trois modèles de départ : `machine`, `clavier`, `doigt` ;
- **le hasard de la main a une graine** (celle de la course + celle du profil), un flux par usage, un tirage par événement : même graine = même
  course, et **le journal des touches suffit toujours au rejeu** — une lettre de plus, `C`, pour la plaque de la seconde chance (`rejouer`,
  `ml/labo/labo.js` et la salle de projection la lisent) ;
- **un cerveau sans profil conduit exactement comme avant** : `Doigts.P` est nul, les lignes d'avant s'exécutent. `Doigts.prototype.delais`
  compte le temps de réaction (tiré d'avance : le radar lit le vrai) ;
- **la seconde chance tourne dans `ml/reel` sans y toucher** (elle n'y avait jamais tourné) : la plaque paraît 114 images après la décision qui
  voit la mort, la pub maison dure 5 s, la course reprend 311 images après le toucher, un palier plus bas (moteur 3 → 2, 165 → 85 pièces) ;
- **contrôlé** (`node ml/bot/verifier.js`, sections 9 à 13 ajoutées) : `TOUT PASSE` en 11 min (32 processus neufs, 2 à la fois). L'empreinte de la
  section 3 reste `a7b3171768ca` ; une main v2 sans effet rend cette course, ces touches et ces vues (contrôle 10) ; une main `clavier` est la même
  dans deux processus, tient les limites d'une main, et le rejeu de son journal redonne sa course (contrôle 11) ; la seconde chance : un seul
  toucher de la plaque, une reprise, un palier en moins, la course continue (5400 images contre 2394), le rejeu exact avec le même argent, et
  une main v2 qui ne la prend pas meurt comme la main d'avant (contrôle 12) ; le drift : le jeu drifte, ↓ part deux images après la flèche et
  n'est jamais tenu seul (contrôle 13). `node ml/labo/rejouer.js --tout --coeurs 2` : 4 rejeux exacts sur 4 ;
- **mesuré** (`ml/bot/appuis.js`, `mesures.js` : `mainLot`, la même fonction pour les joueurs et les bots) : le cerveau d'essai `ml/bot/essai-main.js`
  (la conduite du bot de référence sans ses gestes, profil `clavier`), 8 graines, version allégée, 120 s au plus
  (`ml/bot/results/appuis-essai-main-allege-t120.json` ; les enregistrements, 2,8 Mo, ne sont pas dans git : ils se refont à l'identique) :

  | | les joueurs au clavier (10 parties) | la main `clavier` (8 courses) |
  |---|---|---|
  | coups de volant par minute de sol | 111,3 | 84,7 |
  | durée d'un coup : p10 · p50 · p90 | 0,1 · 0,2 · 0,4 s | 0,1 · 0,3 · 0,6 s |
  | écart entre deux débuts : p10 · p50 · p90 (CV) | 0,2 · 0,5 · 0,9 s (0,57) | 0,3 · 0,6 · 1,3 s (0,64) |
  | changements de sens par seconde de sol | 1,36 | 0,88 |
  | nitro allumée | 60,4 % du temps, 35 allumages par minute | 13 %, 18 allumages par minute |
  | tenue de nitro : p10 · p50 · p90 | 0,1 · 0,3 · 2,6 s | 0,1 · 0,3 · 1,0 s |

  La seconde chance a été prise et réussie dans 7 de ces 8 courses (la 8e est morte 1,5 s avant la limite de temps).

**Ce que les doigts v2 ne font pas, ou mal** (dit aussi dans le README, § 3.8) :
- **la main `clavier` n'est pas encore celle des joueurs** : des coups un quart moins nombreux et plus longs, un tiers de changements de sens en
  moins. Les valeurs de départ ne sont pas un réglage ; **les temps de réaction ne sont mesurés nulle part** chez les joueurs (l'étalon est à
  10 échantillons par seconde) : ce sont des ordres de grandeur ;
- **la nitro tenue 60 % du temps ne viendra pas de la main** : elle hache comme les joueurs (tenue médiane 0,3 s), mais c'est le cerveau qui
  la demande, et celui de l'essai ne la demande que dans les droites (13 %) ;
- **cette main coûte cher à un cerveau écrit pour l'ancienne** : les 8 courses de l'essai meurent une première fois en vol, après une sortie
  par le bord, à 72 s en médiane (le bot de référence, main d'avant : 157 s) ; 159 pièces par minute contre 402. Le pilote de l'étape C devra
  être écrit pour sa main ;
- le juge `discerner.js` n'a pas été passé sur ces courses ; `node verifier.js --regime allege` n'a pas été lancé ;
- la salle de projection lit la lettre `C`, mais **ce n'est pas essayé dans un navigateur** ; son mode « cerveau en direct » refuse un cerveau à profil ;
- **les cinq erreurs ne sont exercées dans aucun contrôle ni aucune course** : essayées une fois, la main seule, sans le jeu. L'ordre `drift`
  n'est contrôlé que sur un drift d'une demi-seconde en ligne droite (contrôle 13) : aucun pilote ne s'en sert, et sans profil il n'est pas lu
  (le bilan le compte : `driftSansProfil`) ;
- l'offre de seconde chance est jugée à la décision qui voit la mort : une partie morte entre 18 et 20 s, que le jeu aurait offerte 1,8 s plus
  tard, n'est pas reprise.

**Pas fait** :
- **la relecture** des corrections par trois agents : pas faite. Les 4 défauts de documents (n° 4, 19, 20, 22) et le n° 7 (les raccourcis
  ne se comptent pas tout à fait comme le jeu) restent ouverts ;
- **la boucle n'a jamais tourné**, même à blanc (l'essai a été interrompu) ;
- aucun pilote de l'écurie n'existe.

**La clé d'API.** Sacha l'a posée (`setx ANTHROPIC_API_KEY`) et dit que `node essai-api.js` passe. Les deux premières clés essayées
répondaient « credit balance is too low ». Une session ouverte avant le `setx` ne voit pas la clé : lancer depuis un terminal neuf.

**Le texte à coller dans la prochaine session :**
> Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (branche `bots-ecurie`), lis `ml/ecurie/ETAPES.md` (la section « Où on en est »),
> `ml/ecurie/PLAN.md` et `ml/ecurie/etude/*.md`. Fais dans l'ordre, en validant dans git à la fin de chaque point et en mettant
> `ETAPES.md` à jour : (1) `node ml/ecurie/essai-api.js` puis `node ml/ecurie/boucle.js --a-blanc --tours 1 --candidats 3 --depuis ml/bot/reference.js`,
> et corrige ce qui casse ; (2) finis l'étape B : la relecture des yeux v2 et des doigts v2 par trois agents, et la reprise de ce qu'ils
> confirment, avec `node ml/bot/verifier.js` qui passe et l'empreinte `a7b3171768ca` ; (3) écris le premier pilote `ml/ecurie/pilote.js`
> (étape C) : un cerveau à profil, écrit POUR sa main (`ml/bot/README.md` § 3.1 à 3.8) ; (4) lance le calibrage de
> l'étape C bis (10 €), puis la boucle par tranches de 20 €, sans dépasser 200 € au total. Jamais plus de 4 courses à la fois. Si la limite
> d'usage du modèle bloque des agents, lance-les avec un autre modèle. Ne me pose pas de question.

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
   volant recalculé à chaque image, drift, seconde chance, taux d'erreur. **Écrits, contrôlés et mesurés** (nuit du 24 au 25/11) ; ce qui
   reste à régler est dit plus haut.
4. Une relecture par trois agents, et la reprise de ce qu'ils confirment.

**Vérifier quand c'est fini.**
```
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\bot
node verifier.js                 # TOUT PASSE (11 min), et l'empreinte de la section 3 reste a7b3171768ca (un cerveau sans profil conduit comme avant)
node noter.js essai-main.js --regime allege --coeurs 2 --tmax 120 --graines 8 --parties --sortie results\note-essai-main-allege-t120-parties.json   # 4 min
node appuis.js results\note-essai-main-allege-t120-parties.json --nom essai-main-allege-t120   # la main du bot contre celle des joueurs
node justesse.js                 # le radar : prévu / arrivé, par map (5 min) ; --pas : les places image par image
cd ..\labo
node rejouer.js --tout --coeurs 2   # 4 rejeu(x) exact(s) sur 4
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

**Le but, chiffré.** Battre le bot de référence et monter le plus haut possible. Le point de départ, mesuré le 24/11 dans la version
allégée du jeu (20 courses, 15 minutes au plus, `ml/bot/results/note-reference-allege.json`) : **palier médian 9, meilleur 25**, survie
médiane 157 s, 402 pièces par minute, nitro tenue 16 % du temps. Les joueurs : médian 11,5, meilleur 28. Le palier 28 est le
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

## C bis — La boucle automatique sur le crédit API (les 200 €)

**C'est la méthode du plan, et c'est à ça que servent les crédits.** Claude écrit des variantes du pilote (un appel payant chacune),
le vrai jeu les note, on garde la meilleure, on recommence. L'abonnement a une limite d'usage et demande une session ouverte ; la boucle
tourne seule, la nuit.

**Ce qui existe** (24/11) : `ml/ecurie/boucle.js` et `ml/ecurie/CONSIGNES.md` (ce que la boucle dit du jeu à Claude avant chaque
variante). Écrite et relue, **pas encore essayée** : l'essai à blanc attend la fin de l'étape B, l'essai réel attend la clé.

**Un tour.** Le parent est le meilleur pilote de l'étape. Ses trois pires courses sont racontées (autopsie). Six variantes sont demandées,
chacune sous un angle différent (survie en vol, vitesse avant les virages, ligne parfaite, fil des pièces, la map qui tue, voler comme un
joueur…). Chacune est triée sur 6 graines ; celles qui tiennent la barre du parent sont notées sur 20. Toutes sont inscrites au labo
avec leur raison et **leur coût**. La génération est close, l'arbre refait, le labo validé dans git.

**Les 200 €, répartis.**

| Poste | Budget | À quoi |
|---|---|---|
| Calibrage | 10 € | les mêmes tours avec Haiku 5.5, Sonnet 5.5, Opus 5.5 et Fable 5.2 : lequel gagne le plus de paliers par euro |
| Le pilote d'élite (étape C) | 90 € | monter le plafond le plus haut possible |
| Le facteur humain et les 30 niveaux (étapes D et E) | 60 € | des profils que le juge ne distingue pas des joueurs, à chaque palier |
| Le récit (journal de bord, bêtisier commenté) | 15 € | pour le portfolio |
| Réserve | 25 € | |

Prix relevés le 03/11/2026, en dollars par million de jetons lus / écrits : Haiku 5.5 0,10 / 0,50 · Sonnet 5.5 2 / 10 · Opus 5.5 4 / 20 ·
Fable 5.2 8 / 40. Une variante coûte de l'ordre de 0,30 € avec Opus 5.5. La boucle compte 1 € pour 1 $ et affiche une **estimation** :
la facture de la console fait foi.

**Le frein n'est pas l'argent, c'est le PC.** Chaque variante se joue plusieurs minutes sur tous les cœurs : compter 20 à 30 variantes par
nuit. Les 200 € se dépensent donc sur plusieurs nuits, pas en une heure.

**Les garde-fous.** `--budget` est obligatoire : la boucle s'arrête avant de le dépasser. `--a-blanc` fait tout sauf l'appel payant, dans
un labo jetable. La clé se lit dans l'environnement (`ANTHROPIC_API_KEY`) et n'est écrite nulle part.

**Ce que Sacha fait, une fois** (dans PowerShell, puis rouvrir le terminal) :
```
setx ANTHROPIC_API_KEY "sa-clé"        # la clé se crée sur console.anthropic.com → API keys
```

**Vérifier, puis lancer.**
```
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie
node boucle.js --a-blanc --tours 1 --depuis ..\bot\reference.js      # un tour complet sans rien dépenser (≈ 5 min)
node boucle.js --budget 10 --tours 3 --modele claude-opus-5-5 --depuis pilote.js   # le premier vrai lancement, plafonné à 10 €
node ..\labo\labo.js                                                  # les euros dépensés, par étape
```

**Pour lancer cette étape dans une autre session**, coller :
> Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (branche `bots-ecurie`), lis `ml/ecurie/ETAPES.md`. Fais d'abord
> `node ml/ecurie/boucle.js --a-blanc --tours 1 --depuis ml/bot/reference.js` et corrige ce qui casse. Puis, si la clé d'API est posée,
> lance le calibrage (10 € en tout : un lancement de 2,50 € par modèle), écris dans `ETAPES.md` quel modèle gagne le plus de paliers par
> euro, et lance la boucle de l'étape C avec ce modèle, par tranches de 20 €. Ne dépasse jamais 200 € au total (`node ml/labo/labo.js`
> donne le cumul). Ne me pose pas de question.

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
