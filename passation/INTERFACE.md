# PASSATION — session INTERFACE (14/10, 13 h) → reprise sur le PC

Branche : `ui-integration` (poussée sur GitHub, JAMAIS sur `main`). Elle contient `assemblage` T6 (`242da07`) + toute l'interface
« charte 6 ». Le PC n'a ni `~/cash-car/ui` ni `~/cash-car/pilotage` : tout ce qu'il faut est dans ce dossier `passation/`.

- `INTERFACE.md` (ce fichier) : fait, en cours, suite, décisions, règles, comment tester.
- `BRIEF-INTERFACE.md` : le brief complet des agents (§0 bis = règles de lisibilité, point 8 = cap de 6 h 10). Les chemins
  `/Users/sachaberes/cash-car/...` qu'il cite sont ceux du Mac : sur le PC, lis-les comme « à refaire » ou « non disponible ».
- `accord.md` : la passe d'ACCORD (§2 les jetons, §3 les 74 changements numérotés et leur état FAIT / ÉCARTÉ / NON FAIT, §5-§10 ce qui est fait).
- `accueil-avant-apres.jpg`, `garage-avant-apres.jpg`, `pause-fin-avant-apres.jpg` : planches avant / après (iPhone, debout et couché).

---------------------------------------------------------------------------------------------------------------------------------------

## 1. Le cap (Sacha, 6 h 10 — il prime sur tout)

« Ce sont les DÉTAILS qui m'intéressent, faire le jeu le plus PROPRE possible ; les idées principales on les fera après ; rends chaque
chose COMPATIBLE et MAGNIFIQUE les unes avec les autres. »
- La direction artistique (Q11 : billets / compteur / radar) est EN PAUSE : pas de refonte, pas d'idée nouvelle.
- Le travail en cours, c'est le polissage de la charte 6, et que tout s'accorde : la même touche, la même marge, la même échelle de texte, le même
  toucher et la même transition partout. L'interface doit s'accorder aussi aux décors 3D.
- Formats : de l'iPhone SE au Pro Max, en debout et en couché.
- On tranche à l'œil, de façon réversible, sans poser de question à Sacha. Il veut que le travail ne s'arrête jamais.

## 2. Les décisions de Sacha qui concernent l'interface

**Hub, accueil, écran de fin** (3 h 25)
- Q1 : MISSIONS et OFFRES ÉPHÉMÈRES quittent le hub du garage → OUI.
- Q2 : l'œil devient une petite touche près du nom de la caisse → OUI.
- Q3 : OFFRES et RÉGLAGES quittent l'écran de fin → OUI.
- Q4 : HOME en mot devient la flèche ◀ → OUI.
- Q5 : le rang d'aura écrit et sa jauge sont retirés du hub → OUI. Plus tard, en direct : « plus de surnom bizarre, juste l'aura » → AUCUN nom
  de rang d'aura nulle part (« DIVINITÉ DU CIEL »…), seulement le chiffre.
- Q6 : les badges « RECORD ! » restent VISIBLES sur l'écran de fin. Ils ne s'affichent que si un vrai record > 0 est battu.
- Q7 : halo doré du logo → pas de réponse ; on garde le choix par défaut.

**Inventaire, pause, refonte, langue** (3 h 50 et 6 h)
- Q2 : le mot « ÉQUIPÉ » revient sur la caisse équipée → OUI.
- Q3 : une touche « tous les réglages » depuis la pause → OUI (c'est fait).
- Q4 : le compteur d'objets de l'inventaire → NON.
- « Garage et boutique très brouillon : REFONTE TOTALE », avec des maquettes d'abord (Q10, pistes A / B / C). Cette refonte est mise en pause
  par le cap de 6 h 10.
- « Ce qui dit BIENTÔT : on le cache » (c'est fait).
- 6 h : on ENLÈVE le chinois. On GARDE l'icône actuelle ; l'écran de lancement natif peut s'effacer dès que le jeu est prêt.

**Méthode**
- Pour toute refonte de structure : 2 ou 3 pistes en IMAGES à Sacha, il choisit, PUIS on code.

## 3. Les règles

- **Charte 6 « ENCRE · BLANC · OR »** : toutes les règles sont sous `html.c6`, dans les blocs `<style id="charte6">` (le socle) et
  `<style id="c6-<zone>">` (accueil, pages, carriere-missions, garage, boutique, hud, pause-fin, transitions). `?ui=5` = l'ancienne
  interface, à garder intacte.
- **Fini** : le néon violet / magenta / cyan penché, ce qui « fait IA ». La référence est la boutique blanche de Léo.
- **Lisibilité (§0 bis)** :
  - AUCUN texte < 11 px.
  - Press Start 2P (pixel) seulement pour les titres ≥ 16 et les gros chiffres.
  - Le texte courant est en police système, 13 px minimum, graisse 600-800.
  - Pas de navigation par icône seule (sauf ⏸ et ◀).
  - JOUER, REJOUER et ACHETER sont de vraies plaques d'or.
  - ◀ toujours en haut à gauche.
- **Jetons d'accord** (détail dans `accord.md` §2) :
  - hauteurs 48 · 64 · 32 ;
  - un seul toucher : translateY(4px), tranche 4→0, 90 ms linear ;
  - durées 90 / 200 / 100 ms, une seule courbe (.2,.8,.2,1) ;
  - texte 11 · 13 · 15 en système, 16 · 24 · 32 en pixel ; libellés en système 15/800, capitales, .04em ;
  - marges 16 + zone sûre ; ◀ en 48×48 à sL+16, sT+8 ;
  - 2 voiles (.88 et .45) ;
  - états : actif = face blanche, choisi = filet blanc 4 px, en cours = filet or 4 px.
- **Intouchables** :
  - le BURN-OUT de Léo (`burn*`, `BURN*`, `DON*`) : `sh garde-burnout.sh` doit dire OK ;
  - la scène 3D de Léo (garage, salle blanche de la boutique, bras robots) : l'interface se pose DESSUS ;
  - aucun chemin de paiement ;
  - ne pas toucher `sw.js`, les `CLAUDE.md`, `ROBLOX/`, `AUTRE VERSION/`, `app-ios/`, `simulateur*`, `maps-ciel*` (lecture seule),
    `salle-blanche*`, `boite-*`.
- **Retiré par Sacha**, donc plus jamais : le chinois (`I18N_ZH`, `LANG==='zh'`, 3e argument chinois), l'édition POKI (`html.poki`,
  `html.c6.poki`, `POKI`), CRYPTOCITY (seul le billet ₿ existant reste). Contrôle :
  `grep -c "I18N_ZH\|LANG==='zh'\|html\.c6\.poki\|html\.poki" "VERSION PRINCIPALE/index.html"` → 0.
- **Git** :
  - jamais de push sur `main` sans le OUI de Sacha ; seul dépôt = CAR-CASH-GIT (`origin`) ;
  - jamais de `git stash` nu ;
  - un commit par correctif, en français, terminé par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Fichier du jeu** : `VERSION PRINCIPALE/index.html` (~5,5 Mo, ~53 000 lignes). Ne jamais le lire en entier : grep -n, puis sed -n.
- **Livraison** : toujours finir par un lien de test cliquable.

## 4. Ce qui est FAIT (dans `ui-integration`, vu au banc iPhone dpr 3 sauf mention)

- **Accueil** :
  - 4 accès de même forme (icône + mot), JOUER en plaque d'or 64/24 ;
  - FACILE / NORMAL en cartes égales ;
  - « TOUCHE POUR JOUER » au chargement ;
  - RÉGLAGES en 48×48 à sT+8 (recalé en couché).
- **Garage** :
  - le hub sans MISSIONS ni OFFRES, et l'œil près du nom ;
  - en-tête : comptes de même largeur, sans nom de rang ;
  - fiche sur une plaque d'encre (« 1 / 49 » et « COMMUNE » ne flottent plus sur le décor) ;
  - inventaire d'un joueur neuf compact, avec une ligne d'état vide ;
  - inventaire en 2 colonnes ; onglets qui ne se touchent plus (13 px là où ça tient, 11-12 px sinon) ;
  - un nom long passe sur 2 lignes ;
  - le toucher unique.
- **Boutique** :
  - un seul écran OFFRES ; le bouton du bas suit l'onglet ;
  - « IL TE MANQUE » avec une mini-jauge quand l'argent ne suffit pas ;
  - ◀ en haut à gauche ; ◀ depuis le cadeau ramène à l'accueil ;
  - la boutique 3D est rangée sous l'accueil ; l'offre essayée rend ta caisse.
- **Carrière et missions** : les mondes en cartes pleine largeur, avec les photos de ciel copiées dans `assets/img/carriere/`. Toucher un monde
  ouvre ses niveaux, JOUER lance (Q6 défaut A).
- **HUD et auto-école** :
  - la carte coach fait 9 à 12 % de la hauteur ;
  - plus de « SORTI ! » avant le premier toucher ;
  - la plaque de pouvoir se pose 8 px sous la carte (c'est `hudColonne` en JS qui place le `top`).
- **Pause** :
  - tout en système 13-15, REPRENDRE en plaque d'or ;
  - la touche « TOUS LES RÉGLAGES » ;
  - la fermeture des réglages ouverts depuis la pause en 100 ms.
- **Réglages** :
  - libellés 15/800, valeurs 13 ;
  - IMAGE BASSE / HAUTE et POUCE HAUT MONTER / PLONGER ;
  - ENTRER UN CODE remis sous RESTAURER UN CODE.
- **Écran de fin** :
  - légendes en 13/800 ;
  - records seulement s'ils battent un record > 0 ;
  - REJOUER en plaque d'or 64/24 (48/16 en couché sous 400 px) ;
  - plus de défilement en couché ;
  - PERDU au lieu de GAME OVER en français.
- **Transitions** : le rideau se lève en 200 ms. « Réduire les animations » du jeu fait comme celui du téléphone. Le voile est à l'encre.
- **Socle d'accord** : les jetons du §3 ci-dessus appliqués à tout (3 hauteurs, un seul toucher, une seule courbe, échelle de texte, voiles).
  Le violet des fenêtres et la lueur magenta ont disparu.
- **Textes** : une seule table française ; « VERSION LOCALE » traduit ; HOME devient ACCUEIL ; aucun « BIENTÔT » visible.

Contrôles au dernier commit :
- syntaxe 0 erreur (14 scripts) ;
- garde du burn-out OK ;
- chinois / POKI = 0 ;
- fumée couché et debout (accueil → JOUER → course → mort → REJOUER → accueil) : 0 erreur JS.

## 5. En cours / NON intégré

- **Branche `ui/carriere-missions`, commit `db27aa9`** : elle est poussée elle aussi, mais elle n'est PAS dans `ui-integration`. Ses
  changements n'ont jamais été vus au banc, à cause de la charge du Mac.
  - Contenu :
    - auto-école : carte coach en 13/800, ⏸ 48×48 avec le toucher 90 ms, rouge et « bravo » aux couleurs de la charte ;
    - carrière : JOUER sur la recette `.long` ;
    - cartes de mission enfoncées par `transform` ;
    - JOUER de la carrière et des missions à sB+20.
  - À VOIR AU BANC avant de fusionner : carrière, missions et auto-école, en 375×667, 390×844 et 667×375, FR + EN.
  - Restent ensuite : n° 25, 73 (cartes de mission en 13/800, `gmPlace` mesure les cartes) ; n° 26 (« MONTMARTRE » en 13 à 667×375 ?) ;
    n° 52 (écarts 12/8 : 5 niveaux ne tiennent pas à 375×667).
- **Garage, non vu** :
  - l'anglais ;
  - le texte de condition d'une caisse à défi (`#gDesc`) : `.prixSeul` le masque en version TEST ;
  - le nom long revu à 375 debout.
- **Écran de fin** : « MULTI MAX » passe sur 2 lignes à 375 de large. Pistes : graisse 700 pour ces seules légendes, ou écart 8 → 4.
- **Carrière** : une fois sur 6, à 844×390, l'ouverture est tombée directement dans les niveaux de PARIS (peut-être un toucher qui
  traverse). Non reproduit.
- **Boutique, dans la zone 3D de Léo** (non touché) :
  - en couché, la colonne « CETTE SEMAINE » commence dans la marge de l'encoche ;
  - une vignette CHROME MIROIR est vide ;
  - en debout, la 1re rangée d'OFFRES est coupée en haut.

## 6. La suite, par ordre de priorité

Les numéros renvoient à `accord.md` §3.

1. Passage au banc de `ui/carriere-missions` (`db27aa9`), puis fusion. Ensuite C25 / C73, C26 et C52.
2. Garage : passage en anglais et caisse à défi (`#gDesc`). « MULTI MAX » sur une ligne à 375.
3. Le mot « ÉQUIPÉ » sur la caisse équipée (décision Q2 de Sacha) : vérifier qu'il est bien posé partout, inventaire et boutique.
4. Le reste de l'interface au BACKLOG (P1 d'abord).
   - **Écran de fin, entrée** : la fiche arrive en fondu sur la scène vivante (moteur 3D par-dessus la lune, stats gris sur gris) → fond
     assombri dès la 1re image.
   - **Pause › QUITTER** : la modale s'empile sur la pause, et QUITTER (rouge plein) est plus saillant que CONTINUER → la modale remplace le
     panneau, CONTINUER devient la touche principale.
   - **Pause** : RECOMMENCER et QUITTER, côte à côte, sont trop proches pour le doigt → QUITTER séparé, ou RECOMMENCER en lien discret.
   - **HUD de course** : « MOY 400 » et « $×1 » trop petits, montants en décimales ($ 2,78) alors que le reste du jeu affiche des entiers → un
     seul format d'argent.
   - **Réglages › SAUVEGARDE** : COPIER et RESTAURER passent encore par `prompt()` (boîte système grise dans l'app iOS) → la `modale()` du jeu.
   - **Accents** : la police pixel n'a pas de capitales accentuées (CARRIERE, REGLAGES) → passer ces mots en police système, ou dessiner
     les capitales accentuées.
   - **Boutique** :
     - les noms sont tronqués (« CHROME MIR… ») ;
     - en couché, la 1re rangée est coupée et les onglets font 34 px ;
     - le petit iPhone ne montre plus la scène.
     Coordonner avec Léo, car la scène 3D est la sienne.
   - **Missions** : le fil de la RÉCOMPENSE traverse la voiture ; deux polices dans chaque carte.
   - **Course** : l'anneau-fantôme du volant est dessiné sur le feu arrière ; « GLISSE POUR TOURNER » est en 10 px ; la bannière du niveau est
     en violet 12 px.
   - **Accueil d'un joueur neuf** : aucun chiffre ne donne envie de revenir → une idée à proposer à Sacha plus tard (« les idées
     principales après »).
5. Rester à jour avec `assemblage` (le train de PILOTAGE) : `git merge assemblage` avant chaque vague.

## 7. Tester sans les bancs du Mac

```bash
cd "VERSION PRINCIPALE" && python3 -m http.server 8000
```
- couché : http://localhost:8000/index.html
- debout : http://localhost:8000/index.html?colonne=portrait
- ancienne interface : ajouter `?ui=5` (ou `&ui=5`)

À regarder dans le navigateur, en mode appareil iPhone (dpr 3) : 375×667, 390×844, 430×932, en debout et en couché, zones sûres (encoche).
Parcours : accueil → JOUER → course → ⏸ (pause, tous les réglages) → mort (écran de fin) → REJOUER → garage (hub, œil, inventaire,
boutique, OFFRES) → carrière → missions → réglages.
Avant chaque commit :
- la syntaxe des scripts inline (avec node, ou au moins aucune erreur dans la console) ;
- `sh garde-burnout.sh` doit dire OK ;
- le grep chinois / POKI ci-dessus doit donner 0.
