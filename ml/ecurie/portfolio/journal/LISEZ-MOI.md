# Le journal de bord de l'écurie — à lire en premier

Ce dossier raconte comment des bots apprennent à jouer à CASH CAR, le jeu de Sacha. Il est fait pour un lecteur qui a cinq minutes et ne programme pas. Chaque chiffre renvoie à un chapitre, et chaque chapitre à ses sources (un commit git, un fichier, un journal).

*Heures : les messages de Sacha sont donnés en heure UTC, comme dans leur relevé (`ml/ecurie/agents/tmp-voltige/paroles-sacha.md`). Les commits sont à l'heure de Paris (UTC + 1).*

---

## 1. Le chantier en dix lignes

1. CASH CAR est un jeu de course pour téléphone : une route suspendue dans le ciel, des vols, des figures en l'air, des pièces à ramasser.
2. Le but, fixé par Sacha le 24/11 : des bots « qu'on ne puisse pas faire la différence entre eux et des vrais joueurs », du palier 1 au palier 30 (le palier est le niveau atteint pendant une course).
3. Sacha dirige et joue les parties qui servent de barre. Il ne code pas. Le code et les mesures sont de Claude, souvent par des « agents » (d'autres sessions de Claude lancées pour une seule tâche).
4. En septembre et octobre, deux essais de sélection par générations, partis de zéro, ont appris à rouler, presque jamais à voler.
5. Le 22/11, Claude a proposé une autre méthode : écrire lui-même des cerveaux lisibles, notés par le vrai jeu.
6. Le 25/11, quatre modèles de Claude ont écrit des variantes d'un premier pilote. Aucune n'a tenu sur des courses neuves.
7. Les 26 et 27/11, Claude a réglé un pilote à la main pour qu'il vole comme un joueur. Il ressemble davantage aux joueurs (écart aux joueurs 1,67, contre 3,05 pour le premier pilote), mais il atteint des paliers plus bas.
8. Un juge automatique reconnaît toujours le bot (AUC 0,97, où 0,5 voudrait dire « pile ou face »).
9. Le 27/11, Sacha a écarté le réglage à la main. Il a demandé une sélection naturelle qui tourne seule sur son PC. Le système est construit (`ml/evolution/`), mais il n'a pas encore tourné.
10. Sur ce PC, 36,92 € de crédit d'API ont été dépensés sur 200. Une boucle lancée par Sacha sur son second PC, le Ryzen, n'est pas vérifiée ici.

Sources : chapitres `2026-11-24.md`, `2026-11-25_suite.md`, `2026-11-26.md`, `2026-11-27.md`, `comment-on-a-travaille.md`.

---

## 2. Le fil : les changements de méthode

```
 sept. ─────────── 20 oct. ──────── 22 nov. ───── 24 nov. ── 25 nov. ────── 26 nov. ────── 27 nov.
   │                 │                 │             │          │               │              │
 ml/train          ml/reel          le plan       nouveau    boucle         pilote réglé    sélection
 sélection dans    sélection dans   « Claude      but :      payante :      à la main       naturelle
 une COPIE du      le VRAI jeu,     écrit le      indiscer-  4 modèles,     pour voler      hybride, dans
 jeu, de zéro      de zéro          cerveau »     nables     0 champion                     le vrai jeu
```

- **Septembre 2026 : la sélection par générations dans une copie du jeu (`ml/train`).** Vingt-quatre voitures, chacune pilotée par un petit réseau de neurones. Les moins bonnes sont remplacées par des enfants modifiés au hasard. *Provoqué par* le souhait de Sacha : des voitures qui « apprennent à contrôler leur corps ». *Décidé par* Sacha pour la règle (« la moitié la plus nulle se fait remplacer ») et par Claude pour les réseaux et les notes. Le plan du 22/11 date l'essai de « juillet → septembre », mais git n'en garde la trace qu'à partir du 7/09. → `00_avant-le-22-novembre.md`
- **20/10 : la même sélection, mais dans le vrai jeu (`ml/reel`).** *Provoqué par* la copie du jeu, qui avait divergé du jeu publié (gravité, largeur de route, règles des figures), et par la demande de Sacha : des bots « fonctionnels sur la version actuelle du jeu ». Résultat : 3 survivants sur 6 pistes neuves, 0,2 figure par partie. → `00_avant-le-22-novembre.md`
- **22/11 : des cerveaux lisibles écrits par Claude.** « Claude écrit le cerveau du bot, le vrai jeu le note, Claude lit les échecs et réécrit. » *Provoqué par* le constat qu'après 300 générations, la sélection au hasard n'avait produit aucune figure. *Proposé par* Claude. Le plan porte la mention « proposé, pas encore validé par Sacha ». → `2026-11-22_23.md`
- **24/11 : un nouveau but, pas encore une nouvelle méthode.** Sacha remplace « des bots qui jouent vraiment » par « des bots indiscernables, à chaque palier ». → `2026-11-24.md`
- **25/11 : la boucle payante.** Des modèles de Claude, payés sur le crédit d'API, écrivent des variantes d'un premier pilote. *Résultat :* aucun gain qui tienne sur des courses neuves. → `2026-11-25.md`, `2026-11-25_suite.md`
- **26/11 : un pilote réglé à la main, un défaut à la fois.** *Provoqué par* Sacha, qui trouve les bots « trop frileux de s'envoler » et demande à 12:11 UTC une enquête sur tout ce qui distingue encore un bot d'un joueur. Claude choisit de ne pas relancer la boucle payante : elle ne notait que le palier. Il écrit une mesure de ressemblance, « l'écart aux joueurs ». → `2026-11-26.md`
- **27/11 : retour à la sélection naturelle, mais hybride et dans le vrai jeu.** *Décidé par* Sacha à 15:25 UTC : « le plan que tu as fait ne me correspond pas vraiment » ; la veille (26/11, 12:54 UTC), il demandait déjà pourquoi ne pas lancer « plein de simulations en local » sur un autre PC. *Forme choisie par* Claude : le génome part du pilote écrit à la main, avec deux petits réseaux « muets » à la naissance. Un bot est jugé sur toutes ses courses, pas sur une seule manche. → `2026-11-27.md`

---

## 3. Le registre des impasses

Tout ce qui a été essayé puis écarté ou remplacé, une ligne par essai. Le chiffre est celui qui a tranché.

| l'idée | date | ce qu'on a mesuré | pourquoi écarté | chapitre |
|---|---|---|---|---|
| Corriger la copie de la physique des bots | jusqu'au 08/09 | 3 passes et 2 agents critiques sans y arriver | remplacée par une seule fonction pour le joueur et les bots (écart 0 sur 3 000 pas) | 00 |
| Imiter les parties de Sacha (clonage) | 08/09 | 98,9 % des morts en vol, contre 96,0 % au hasard ; critère jugé invalide par le rapport lui-même | écarté par Sacha : « chacune se démerde » | 00 |
| Remettre à l'échelle ce que le réseau voit | 08/09 | record médian 4 995 → 3 244 m, 8 graines sur 8 en baisse | moins bien | 00 |
| Noter chaque voiture sur 3 pistes | 08/09 | 1 535 m contre 2 054 (graine 3), 658 contre 1 934 (graine 7) | moins bien ; mais remis par défaut le 09/09 sans nouvelle mesure | 00 |
| Pilote au sol écrit à la main (idée de Sacha) | 08/09 | médiane 2 898 m contre 3 047 m sans lui | plus régulier, pas meilleur | 00 |
| Sélection par vitesse | 10/09 | 2 120 m contre 2 660 m | moins bien, annulée | 00 |
| Réseau plus gros (32 neurones), décisions à 30 par seconde | 18/09 | 2 611 et 2 675 m contre 2 660 m | du bruit | 00 |
| Manche de 45 s | 19/09 | les crashs arrivaient après la fin ; le bonus d'arrivée ne servait jamais | remplacée par une manche proportionnelle à la piste | 00 |
| Récompenser les figures (0,08 / 1,2 / 3) | 20/10 | 0 figure, puis 1 bot sur 24, puis 0 | l'évolution ne trouve pas l'enchaînement | 00 |
| Entraînement noté sur les figures seules | 20/10 | 23 bots sur 24 en font ; sur courses entières, 1 % d'arrivées, 58 % de morts en vol | inutilisable en course ; la copie payait « figure puis explosion » | 00 |
| Sélection de zéro dans la copie du jeu (`ml/train`) | sept.–20/10 | 300 générations : 0 figure, record 11 746, champion seul 0 % d'arrivées | la copie avait divergé du vrai jeu | 00 |
| Sélection de zéro dans le vrai jeu (`ml/reel`) | 20/10 | 57 générations ; sur 6 pistes neuves, 3 survivent, 0,2 figure par partie | « pas fiable » ; remplacée par le plan du 22/11 | 00 |
| Jouer plusieurs courses dans le même processus | 23/11 | même graine identique 9 à 34 s, puis écart sur la nitro | une course par processus neuf | 22_23 |
| Un « bac fermé » pour le cerveau | 23/11 | le bac laissait passer l'horloge de l'ordinateur et le hasard (défaut n° 1 sur 28) | corrigé le 24/11 | 22_23, 24 |
| Courses de 60 s pour valider le simulateur | 23/11 | deux pannes (portail bloqué, grotte jamais bâtie) vues seulement au-delà de 110 s | mesures plus longues | 22_23 |
| Filmer avec l'enregistreur vidéo du navigateur | 24/11 | environ 12 images par seconde | remplacé par un encodage image par image (60 images/s) | 24 |
| Rejouer dans le navigateur sans recaler le hasard | 24/11 | course identique 56,6 s, puis une autre route | recalage du hasard : 1 879 décisions sur 1 879 | 24 |
| Noter le bot au régime maximum du jeu | 24/11 | Crypto City dans 4 courses sur 20 ; les 14 parties de joueurs sont toutes en allégé | les bots jouent la version allégée, celle des joueurs | 24 |
| 500 ms de vraie montre par décision | 24/11 | deux courses de même graine diffèrent sur un PC chargé (3 et 10 décisions coupées) | 5 s par décision | 24 |
| Courses de 180 s au plus | 24/11 | un bot ne pouvait pas dépasser le palier 15 environ | 900 s | 24 |
| Canyon sans relief dans le simulateur | 24–25/11 | meilleur palier de la référence 25 → 18 une fois les parois remises | « en partie un défaut du simulateur » | 24, 25 |
| Un gros workflow d'agents payé sur l'abonnement | 25/11 | 152 agents ; l'abonnement vidé | « à ne pas refaire » ; le travail lourd passe sur la clé d'API | 25 |
| Calibrage : variantes d'Haiku 5.5 | 25/11 | en grand, 11 et 10,5 contre 11 pour le parent | pas de progrès | 25_suite |
| Calibrage : variante c0011 de Sonnet 5.5 | 25/11 | 13,5 au tri ; sur 20 graines neuves, 10,5 contre 11 | « NE TIENT PAS » | 25_suite |
| Calibrage : variantes d'Opus 5.5 | 25/11 | meilleure à 11 au tri, moyenne 9,3 | pas de progrès | 25_suite |
| Calibrage : Fable 5.2 | 25/11 | réponse coupée à 32 000 jetons, 1,91 € pour aucune variante | inutilisable avec cette limite | 25_suite |
| Choisir le modèle « au plus de variantes par euro » | 25/11 | la règle désignait Haiku | « Le PC limite le nombre de tours, pas l'argent » : Sonnet choisi | 25_suite |
| La règle de rythme de la chaîne des deux semaines | 25–26/11 | bloquée du 25/11 au soir au 26/11 à 12 h 55 (« 14 € permis ») | corrigée le 26/11 ; la chaîne n'a payé aucune tranche | 25_suite, comment |
| Le juge comme mesure de progrès | 26/11 | il reste à 0,97 quoi qu'on corrige | remplacé par « l'écart aux joueurs » | 26 |
| L'écart aux joueurs plafonné à 4 par mesure | 26/11 | se cacher sous la route ne coûtait pas plus qu'un petit écart | plafond porté à 8 | 26 |
| Figures avec une direction en alternance, pose proche | 26/11 | 5 morts sur 23 ; avec la pose à plus de 2,2 s, 0 sur 12 | figures seulement si la pose est à plus de 2,2 s | 26 |
| Des vols plus hauts | 26/11 | 3 morts sur 10 | trop de morts | 26 |
| Plus de nitro au sol (première version) | 26/11 | 53 % du temps → palier médian 7 au lieu de 9,5 | trop cher ce jour-là ; repris et gardé le 27/11 sur le pilote corrigé | 26, 27 |
| Un slalom plus serré | 26/11 | rythme inchangé (0,99 s par aller, joueurs 0,58 s), un palier et demi perdu | sans effet | 26 |
| Rouvrir la grotte aux sorties voulues | 26/11 | deux fois plus de raccourcis, un palier à un palier et demi de moins | laissée fermée, arbitrage confié à la boucle | 26 |
| Coups de nitro en vol pour sortir de sous la route | 26/11 | palier médian 5 au lieu de 8 | trop cher | 26 |
| Sortie de sous la route en biais doux | 26/11 | une sur deux retombe dessous | ne marche pas | 26 |
| Avance de 0,15 s ou 0,35 s dans la loi de vol corrigée | 26/11 | 180 et 185 paliers contre 193 avec 0,25 s | moins bien | 26 |
| Contre la pose en travers : viser au sol avec de l'avance | 26/11 | 180, 192, 177 paliers contre 193 | moins bien | 26 |
| Contre la pose en travers : se redresser au-dessus de la dalle | 26/11 | glisse inchangée, 0,34 à 0,37 rad | sans effet | 26 |
| Contre la pose en travers : planer réacteur allumé | 26/11 | 12 à 19 morts pour 100 vols | trop de morts | 26 |
| Relancer la boucle payante notée au seul palier | 26/11 | elle aurait dépensé 12 € par jour « à polir ce que Sacha vient de refuser » | réécrite (palier et ressemblance), pas lancée | 26 |
| La nitro presque partout, gardée jusqu'au bord | 27/11 | écart 1,33 et 1,27, mais 147 paliers contre 181 et 0,2 figure par minute au lieu de 0,7 | la nitro et les figures se paient sur la même jauge | 27 |
| La loi « retour » réglée à la main | 27/11 | glisse 0,32 contre 0,38, morts dans le bruit | pas franchement meilleure ; réglages laissés à la sélection | 27 |
| Régler le pilote à la main (la méthode) | 27/11 | réglages des 26 et 27/11 : écart aux joueurs 2,00 → 1,67, palier médian 8,5 → 7,5 | écarté par Sacha : « le plan que tu as fait ne me correspond pas vraiment » | 27 |
| Renvoyer le dernier sur une seule manche de 12 courses | 27/11 | bruit du palier 3,21 par course contre 0,86 entre pilotes ; « tirer au sort à 60 % » | note cumulée sur toutes les courses | 27 |
| Un réseau parti de zéro | 27/11 | l'essai d'octobre (selon la spécification, non revérifié) | réseaux « greffés » muets sur le pilote | 27 |
| Croire les enquêtes d'agents sur parole | 27/11 | slalom annoncé 0,70 s, rejoué 1,16 et 0,80 s ; « sans morts nettes » démenti (7 contre 5) | chaque enquête est relue par un vérificateur qui refait les mesures | 27 |
| Un compte rendu à chaque fin de session | 24–25/11 | deux comptes rendus (25/11), aucun ensuite | laissé ; ce journal prend le relais | comment |
| L'agent payant « voltige » | 26/11 | une session Claude ne peut pas lancer une dépense (« l'app l'a refusé ») | prêt, jamais lancé | 26, comment |

---

## 4. Les décisions de Sacha

Les citations ont leur orthographe rectifiée, jamais leur sens. Les heures sont en UTC.

- **Septembre (date exacte non retrouvée)** : la physique des bots doit être « STRICTEMENT isomorphe » à celle du joueur, une règle « répétée 4× par Sacha ». → 00
- **08/09** : « la moitié la plus nulle se fait remplacer » ; il abandonne le clonage : « chacune se démerde ». → 00
- **19/09** : il classe les champions par taux de finition (« décision propriétaire »). → 00
- **20/10** : « débrouille-toi je veux des bots qui marchent », puis des bots « fonctionnels sur la version actuelle du jeu ». → 00
- **23/11 (soir)** : il joue les cinq premières parties de l'étalon, au clavier. Aucune phrase de lui n'a été trouvée pour les 22 et 23/11. → 22_23
- **24/11** : les parties de Léo au téléphone comptent dans l'étalon. → 24
- **24/11** : le nouveau but : « des bots qui peuvent faire des matchmaking du record de palier 1 au palier 30, et qu'on ne puisse pas faire la différence entre eux et des vrais joueurs » ; « on garde bien des traces visuelles pour le portfolio ». → 24
- **24/11, 19:41** : « tous les 200 crédits API en 2 semaines », avec à chaque fin de session « un petit compte rendu esthétique et testable ». → 24, 25
- **25/11, 12:27** : « […] tu as utilisé tout mon Fable sans toucher au crédit API, reprends le travail de Fable avec les crédits API […] ». → 25
- **25/11, 12:29** : « la réinitialisation de Fable arrive dans 24 heures, organise-toi pour ne pas t'arrêter d'ici là » ; « là, il reste 7 % de mon abonnement ; je t'avais demandé d'utiliser les tokens pour ça justement ». → 25, comment
- **25/11, 13:00** : « clôturer le travail amorcé ici sans bâcler le travail débuté par Fable ». → 25
- **25/11, 19:00 et 19:07** : « des jolies photos techniques des simulations pour le portfolio ». → 25_suite
- **25/11, 22:27** : « envoie une vidéo du meilleur bot ». → 25_suite
- **26/11, 11:56** : « fais-moi une note de passation pour reprendre où tu en étais ». → comment
- **26/11, 12:00** : les bots sont « encore trop frileux de s'envoler et de faire des figures dans les airs ». → 26
- **26/11, 12:11 et 12:13** : « ça, c'est le genre de choses auxquelles tu aurais dû penser ; lance une sous-session enquête : tous les éléments à ajouter aux bots pour simuler de vrais joueurs » ; « si tu as besoin, je peux t'enregistrer d'autres parties, bien sûr ». Sacha corrige ici la méthode de Claude : tout mesurer avant de corriger. → 26, comment
- **26/11, 12:54** : « au lieu de tout faire tourner sur Claude, on ne peut pas les mettre sur un autre PC avec carte graphique pour lancer plein de simulations en local ? ». La première poussée vers un calcul local et gratuit, un jour avant le changement de cap. Réponse de Claude non retrouvée dans les sources (`PASSATION.md` écrit le même jour qu'« une carte graphique n'y change rien »). → 26
- **26/11, 15:47** : « ne me pose pas ce genre de question, travaille en autonomie ». Sacha corrige ici la méthode de Claude. → 26, comment
- **27/11, 13:40** : « je lance la boucle sur le Ryzen, continue sans t'arrêter ». → 27
- **27/11, 14:07** : « il ne faut pas que tu t'arrêtes comme ça, hein ; tu ne finis que quand tu penses avoir besoin que je prenne une vraie décision ». → 27, comment
- **27/11, 14:11** : une information collée sur la boucle du Ryzen : 12 € par lancement, arrêt à 60 € au total, à compter dans les 200 € ; ne lancer ni `chaine.js` ni `boucle.js` sur le Xeon. → 27
- **27/11, 14:25** : « gère mieux l'abonnement, tu utilises trop Fable par rapport à Opus ». → 27, comment
- **27/11, 14:31 à 14:35** : « mais je t'ai mis en ultra code, c'est pas le but justement » ; « cramer 100 % de la semaine […] et les 200 crédits API, tu gères ça comme tu veux ». Claude avait compris « économise ». → 27, comment
- **27/11, 15:25** : « laisse tomber la vidéo » ; « le plan que tu as fait ne me correspond pas vraiment » ; un système « où le bot le moins bon est viré […] juste par sélection naturelle ». → 27
- **27/11, 15:40 et 15:42** : « pourquoi on n'a pas fait ça dès le départ ? » ; « il faut que tu arrêtes de suivre les plans ». Sacha corrige de nouveau la méthode de Claude. La même minute, il demande s'il doit arrêter les essais sur le Ryzen ; Claude répond non pour l'instant, jusqu'à la livraison du système de sélection (d'après la conversation du 27/11). → 27
- **27/11, 17:14** : « il faut qu'on garde des traces de tous les process, pour un portfolio ». Ce journal en est la réponse. → 27, comment

---

## 5. Les chiffres qui résument

| mesure | valeur | source | chapitre |
|---|---|---|---|
| Sélection de zéro dans la copie du jeu, 300 générations | 0 figure | `5799d5bb1` | 00 |
| Vrai jeu joué sans écran | 6,8 fois le temps réel (de 2,4 à 11,1 selon la course) | `d304dad70`, `ml/reel/results/etape0.json` | 22_23 |
| Étalon (parties de vrais joueurs) | 14 parties sur 20 prévues : 10 de Sacha, 4 de Léo | `92fef5bd1` | 24 |
| Calibrage des quatre modèles | 4,63 €, 0 champion sacré | `8610302d2` | 25_suite |
| Premier pilote contre bot de référence, 12 graines de 600 s | palier médian 12,5 contre 6 | `09ed02872` | 25 |
| Écart aux joueurs (un vrai joueur comparé aux autres : 0,9) | 3,05 (premier pilote) → 1,67 (27/11) | `1ee936e15` | 26, 27 |
| Part du sol passée sous la route | 14 % → 2,3 % (joueurs 3 %) | `c72d25ecf` | 26 |
| Juge « humain ou bot » (AUC) | 0,97 : le bot est toujours reconnu | `63012939f`, `etude/realisme.md` | 26 |
| Courses par pilote pour voir 1 palier moyen d'écart | environ 140 | `etude/selection-naturelle/bruit/resultats.txt` | 27 |
| Crédit d'API dépensé sur ce PC | 36,92 € sur 200 (Ryzen non compté) | `ml/labo/journal/depenses.jsonl` | 25_suite, 27 |

---

## 6. Ce qu'on peut montrer

Contrôlé le 27/11 avec `ls` et `git ls-files`.

**Ce qui existe**

| pièce | ce que c'est | dans git ? |
|---|---|---|
| `ml/ecurie/portfolio/index.html` | la page portfolio du 25/11 : schémas de l'architecture et de la boucle, arbre du calibrage, « Ce qui n'a pas marché » | oui |
| `ml/ecurie/portfolio/images/*.svg` | 5 figures (`course-dessus`, `radar`, `main`, `paliers`, `justesse`), chacune en clair et en sombre ; refaites par `node ml/ecurie/portfolio/figures.js` à partir de `donnees/radar-c0003-g910629.json.gz` | oui |
| `ml/labo/arbre.html` | l'arbre des cerveaux du labo (calibrage du 25/11) | oui |
| `ml/labo/rejeux/*.json` | les touches image par image des courses gardées (cerveaux c0001 à c0004 et suivants) : de quoi refaire un film | oui |
| `ml/labo/trajectoires/*.json.gz` | les mêmes courses vues de dessus | oui |
| `ml/labo/videos/*.webm` | 4 films de courses (c0001-g910407, c0003-g910407, c0003-g910629, c0004-g910000), du 24 et 25/11 | **non** (dossier ignoré ; ils se refont à partir des rejeux) |
| `ml/labo/projection/page.html` | la salle de projection (`node ml/labo/projection.js`) | oui |
| `ml/ecurie/comptes-rendus/compte-rendu-01.html`, `-02.html` | les deux comptes rendus pour Sacha, du 25/11 | oui |
| `ml/ecurie/etude/*.md`, `etude/selection-naturelle/` | l'étude du 24/11 (neuf rapports, 28 défauts), l'enquête réalisme du 26/11, la spécification, l'étude du bruit et les quatre enquêtes du 27/11 | oui (la sélection naturelle depuis `033bfebeb`) |
| `ml/ecurie/consignes-agents/*.md` et `ml/ecurie/agents/2026-11-25T*.md` | 7 consignes données aux agents et 7 rapports, avec leur coût | oui |
| `ml/ecurie/pilote.js`, `ml/ecurie/pilote-voltige.js` | les deux pilotes, avec leur stratégie en français en tête du fichier | oui |
| `ml/bot/etalon/cashcar-parties-*.json` | les exports bruts des parties de Sacha et de Léo | oui |
| `ml/sim/apercu-31415.png` | une image de septembre : la piste vue de dessus, 7 bots, « 0 pris » sur 5 981 raccourcis | oui |
| `ml/train/results/runs/run-seed*.json`, `ml/reel/results/pop-reel-g1.json` | 21 courbes d'apprentissage de septembre et 57 valeurs d'octobre, jamais dessinées | oui |
| `ml/train/archive-2026-09-09/rapports/RAPPORT-SESSION-2026-09-08.md`, `ml/train/CRITIC-REPORT.md` | le rapport où Claude liste ses huit erreurs ; 83 verdicts d'un agent relecteur | oui |
| `ml/evolution/` (README, tableaux d'essai `essais/test-tableau/complet/tableau.html` et `tests/relecture-robustesse/etat-journaux/tableau.html`) | le système de sélection naturelle et ses tableaux de bord, sur des données de test | **non** (dossier non suivi au 27/11) |
| `ml/ecurie/agents/tmp-voltige/` (dont `paroles-sacha.md`) | les messages datés de Sacha ; 525 fichiers d'outils et de sorties de lots au soir du 27/11 | **non** (dossier ignoré : fragile) |
| ce journal | `ml/ecurie/portfolio/journal/` | **non** (non suivi au 27/11) |

**Ce que le plan prévoyait et qui n'existe pas encore** (`passation/BOTS-ML.md`, § 5.2 et 5.3)

- Le **bêtisier** : les morts les plus bêtes et les triches trouvées par les bots.
- Les **cartes** : toutes les trajectoires d'une génération superposées sur la route vue de dessus, les endroits où l'on meurt, les raccourcis découverts. Il existe une seule course vue de dessus (`course-dessus-*.svg`).
- Les **planches** : neuf instants d'une course en une image fixe, pour l'imprimé.
- Les **duels côte à côte**, Sacha contre bot sur la même graine, et le « même virage à travers les générations ».
- Les **courbes** par génération (note, figures par minute, poses, euros). Les données de septembre existent, aucune courbe n'est dessinée.
- Les **jalons** : un instantané figé par étape (`ml/labo/jalons/` n'existe pas).
- Un film avec l'affichage du jeu (compteurs, argent) : les films actuels montrent l'image seule.

---

## 7. Les chapitres

| fichier | période | en une ligne |
|---|---|---|
| `00_avant-le-22-novembre.md` | sept.–oct. 2026 | deux sélections de réseaux partis de zéro, dans une copie du jeu puis dans le vrai jeu : on roule, on ne vole presque pas |
| `2026-11-22_23.md` | 22–23/11 | le plan « Claude écrit le cerveau », le vrai jeu remis en marche sans écran, le contrat du bot, les cinq premières parties de Sacha |
| `2026-11-24.md` | 24/11 | la boîte noire (le labo), deux versions du même jeu découvertes, le nouveau but de Sacha |
| `2026-11-25.md` | 25/11, jusqu'à 15 h 30 | les yeux et la main relus, l'abonnement vidé par erreur, le premier pilote payé sur la clé d'API |
| `2026-11-25_suite.md` | 25/11, soir | quatre modèles mis à l'épreuve, aucun ne fait mieux ; la page portfolio |
| `2026-11-26.md` | 26/11 | apprendre au pilote à voler, un défaut à la fois ; l'écart aux joueurs |
| `2026-11-27.md` | 27/11 | Sacha change de cap : du réglage à la main à la sélection naturelle |
| `comment-on-a-travaille.md` | 21–27/11 | qui fait quoi, les règles de travail et le raté d'où chacune vient |
| `MODELE-D-ENTREE.md` | — | le gabarit des entrées à venir |

---

## 8. Comment ce journal est tenu

- Il est écrit par des agents Claude à partir de git (les messages de commit), des journaux du labo (`ml/labo/journal/*.jsonl`), des documents du chantier et du relevé daté des messages de Sacha. Personne n'écrit de mémoire.
- Chaque chapitre a été relu par un agent vérificateur, qui a rouvert les sources, corrigé les erreurs de lecture et noté ce qui manquait. Plusieurs corrections ont rendu à Sacha des idées d'abord attribuées à Claude.
- Le relevé des messages de Sacha se refait avec `node ml/ecurie/portfolio/outils/paroles.js <dossier des conversations> <sortie.md>`. Il reste hors git (c'est un relevé brut). Il a été complété le 27/11 au soir (49 messages au lieu de 40 : la première version oubliait les messages tapés pendant que Claude travaillait), et les chapitres ont été corrigés d'après lui.
- Ce qui n'a pas été retrouvé n'est pas écrit. Ce qui est incertain porte la mention « non vérifié ».
- Les citations de Sacha ont leur orthographe rectifiée, jamais leur sens. Seules les phrases qui concernent le chantier sont citées.
- Aucune clé, aucun jeton, aucune adresse n'apparaît dans le journal.
- À partir du 28/11 : une entrée par journée de travail, sur le modèle `MODELE-D-ENTREE.md`, et une ligne ajoutée au registre des impasses pour chaque essai écarté.
- Limite connue : les chapitres dépassent souvent la longueur visée (1 500 mots). Les vérificateurs ont préféré garder les faits sourcés.
