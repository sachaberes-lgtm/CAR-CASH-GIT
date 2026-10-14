# QUESTIONS POUR SACHA — la file commune (PILOTAGE les lui retranscrit et note ses réponses ici)

Sacha (3 h 15) : « au fur et à mesure que des sessions se posent des questions et qu'elles jugent que je pourrais donner mon avis, elles peuvent
te le dire à toi et tu me fais une retranscription. »

COMMENT FAIRE (toute session) : AJOUTE un bloc à la fin de ce fichier — pas de message à PILOTAGE (il lit ce fichier à chaque réveil), SAUF si la
question te BLOQUE vraiment (alors un message d'une ligne). Tu n'attends pas la réponse : tu continues sur ton choix PAR DÉFAUT, réversible.

```
### Q<numéro> · <SESSION> · <heure>
Question : <une phrase, compréhensible sans le code>
Choix : A) … · B) … (· C) …)
Par défaut (ce que je fais en attendant) : <A/B/C> — réversible ? <oui/non>
Réponse de Sacha : (PILOTAGE remplit)
```

---
## RÉPONSES DE SACHA — 3 h 25 (questions relevées par PILOTAGE dans les fichiers d'état)
- **Q1 · INTERFACE** — MISSIONS et « OFFRES ÉPHÉMÈRES » quittent le hub du garage → **OUI**
- **Q2 · INTERFACE** — l'œil = petite touche près du nom de la caisse → **OUI**
- **Q3 · INTERFACE** — OFFRES et RÉGLAGES quittent l'écran de fin → **OUI**
- **Q4 · INTERFACE** — HOME en mot → flèche ◀ → **OUI**
- **Q5 · INTERFACE** — rang d'aura écrit + sa jauge retirés du hub → **OUI**
- **Q6 · INTERFACE** — badges « RECORD ! » masqués sur l'écran de fin → **NON : on les REMET** (visibles sur l'écran de fin)
- **Q7 · INTERFACE** — halo doré du logo → pas encore de réponse (garde ton choix par défaut, réversible)
- **Q8 · GRAPHISME → GAMEPLAY** — NUAGES 4 de la carrière sans idée de jeu depuis le retrait des cônes → **« trouvez un autre niveau cool »** :
  GAMEPLAY imagine et pose une nouvelle idée de jeu pour ce niveau (sans cônes), la décrit ici en 3 lignes ; réversible.
- **Q9 · GRAPHISME** — pièces chinoises du jade → **le VRAI TROU percé** (le patch en proposition est à appliquer)

## ORDRE DIRECT DE SACHA — 3 h 25
- **« Dans la map chinoise il faut les mêmes nuages que dans la map normale. »** → GRAPHISME : les nuages de la map de jade (PICS DE JADE, et le
  SOLEIL DE JADE s'il a les mêmes nuages en cubes) remplacés par ceux de la MER DE NUAGES. OPTIMISATION : les nuages en cubes du jade pesaient
  ~300 000 triangles — ne les optimise plus, donne à GRAPHISME le budget de triangles à ne pas dépasser et mesure après.

---
## DÉCISION DE SACHA — 3 h 27
- **Le CHAT POP-TART reste dans l'app** : « le chat reste, on prend le risque ». APP STORE : pas de coupe C1 (voir la tête de `notes/regard-apple.md`).

---

### Q2 · INTERFACE · 3 h 22
Question : dans l'inventaire du garage, la caisse équipée se reconnaît à sa face blanche, sans le mot « ÉQUIPÉ » ; faut-il remettre le mot ?
Choix : A) face blanche seule (défaut) · B) remettre « ÉQUIPÉ » sur la carte
Défaut : A

### Q3 · INTERFACE · 3 h 22
Question : depuis la pause en course, on n'a que 5 réglages rapides ; veux-tu une touche « tous les réglages » qui ouvre l'écran complet ?
Choix : A) non, les 5 rapides suffisent (défaut) · B) oui, ajouter la touche
Défaut : A

### Q4 · INTERFACE · 3 h 22
Question : l'inventaire n'affiche plus le nombre d'objets possédés (le « 2 » à côté du titre) ; le remettre ?
Choix : A) non (défaut) · B) oui, petit chiffre près du titre
Défaut : A
## DÉCISIONS DE SACHA — 3 h 30 (sur les idées d'amélioration globale proposées par PILOTAGE)
- **Pas de TestFlight ; « on sort plus tard »** → plus de course contre la montre cette nuit : des commits propres et vérifiés plutôt que du volume.
- **Collisions AVANT la cadence à 30 i/s : OUI** → DEBUGGING rend les tests de choc « balayés » (trafic, satellites : on traverse à 20-30 i/s) ;
  OPTIMISATION n'active pas le 30 i/s sur les vieux téléphones tant que ce correctif n'est pas au journal commun.
- **Alléger : OUI — « supprime les voix, et d'ailleurs supprime du code de main tout ce qui n'est pas visible »** → PILOTAGE, en deux temps :
  (1) après T1 : fichiers jamais joués (voix d'annonceur, audio orphelin) supprimés sur `assemblage`, preuve par grep ;
  (2) code invisible : INVENTAIRE prouvé d'abord (ce qui est mort / inatteignable / masqué), suppression par petits lots vérifiés APRÈS le dernier
  train (supprimer du code pendant que cinq branches bougent = des conflits pour tout le monde). Ce qui est caché mais signé Léo (CRYPTOCITY hors
  rotation, édition Poki, outils) et les crochets `dbg*` dont dépendent les bancs : listés pour décision, pas supprimés d'office.
- **Ce qui dit « bientôt » : OUI, on CACHE** → INTERFACE : bouton « BIENTOT » du garage (`.gVerrou`) et blocs « ? BIENTÔT » (`gMystere`) ;
  PILOTAGE (après T1) : les 3 caisses impossibles à obtenir (REQUIN, COMÈTE, LA RAIE) et les affiches « CLASSEMENT MONDIAL : BIENTOT EN LIGNE ».
- **Pages de confidentialité et d'assistance : « publie »** → APP STORE (sa zone) : les pages SEULES, sans rien publier du jeu.
- **Égaliser le volume des musiques et des bruitages** → ajouté à la liste de PILOTAGE, en tenant compte des poussées de Léo sur main
  (mesures d'abord, table de gains additive, sur `assemblage` à jour).

---
## RÉPONSES DE SACHA — 3 h 33
- **Adresse de contact (page d'assistance, fiche App Store)** : `16180contact@gmail.com`
- **Musique de FRÉNÉSIE absente (`dark-triad.mp3`)** : « Léo va push un truc » → PILOTAGE refusionne origin/main à chaque train ; à vérifier au train suivant.

---

### Q · APP STORE · 3 h 50
Question : quelle adresse e-mail RÉELLE afficher sur les pages de confidentialité et d'assistance (et donner à Apple) ? Le dépôt ne connaît
que `support@<ton-domaine>` (dossier `support-email/`, domaine jamais acheté) ; les pages portent encore le repère `support@example.com`.
Choix : A) une adresse que Sacha lit déjà · B) une adresse dédiée à créer (ex. une boîte « cashcar… ») · C) acheter le domaine et brancher `support@…`
Par défaut (ce que je fais en attendant) : RIEN n'est publié (pas de page avec un repère vide) — réversible ? oui
Et : la publication = un commit sur `origin/main` (dossier `pages-app/` + 1 ligne dans `vercel-build.sh` → /confidentialite.html et
/assistance.html). Pousser sur main = publier : j'attends le OUI de Sacha dans MA session (un message relayé ne me suffit pas pour ça).
Réponse de Sacha : adresse = `16180contact@gmail.com` (A). Pour la POUSSÉE sur main des deux pages : Sacha a dit « publie » à PILOTAGE (3 h 30) ;
tu demandes son OUI dans ta propre session, c'est la bonne règle — PILOTAGE lui a dit d'aller te le confirmer.

## RÉPONSES DE SACHA — 3 h 50 (questions Q2-Q4 d'INTERFACE) + UN ORDRE
- **Q2 · INTERFACE** — remettre le mot « ÉQUIPÉ » sur la caisse équipée → **OUI (B)**
- **Q3 · INTERFACE** — une touche « tous les réglages » depuis la pause → **OUI (B)**
- **Q4 · INTERFACE** — remettre le nombre d'objets de l'inventaire → **NON**, et surtout :
  **« l'inventaire n'est pas forcément la bonne solution ; je trouve le garage et la boutique très brouillon : REFONTE TOTALE. »**
  → INTERFACE : refonte totale du GARAGE et de la BOUTIQUE (organisation, navigation, comment on regarde / choisit / achète / équipe une caisse).
  Méthode : 2 ou 3 PISTES en maquettes d'abord (dans `ui/maquettes/`), posées ici en question pour que Sacha choisisse, PUIS le code.
  La scène 3D (salle blanche, bras robots, plateau, burn-out) reste à Léo, qui y pousse en direct : l'interface se pose DESSUS.

---

### Q6 · INTERFACE · 3 h 48
Question : dans la carrière, toucher un monde ouvre maintenant la liste de ses niveaux, et c'est la touche JOUER en or qui lance le niveau en cours (avant, demande de Léo du 30/09 : toucher le monde lançait directement). On garde ?
Choix : A) le monde ouvre ses niveaux, JOUER lance (défaut) · B) toucher le monde lance directement, comme avant
Par défaut (ce que je fais en attendant) : A — réversible ? oui
Réponse de Sacha : (PILOTAGE remplit)

### Q10 · INTERFACE · 3 h 58
Question : refonte totale du garage et de la boutique — laquelle des trois pistes ? (maquettes seulement, rien n'est codé ; vue d'ensemble : `/Users/sachaberes/cash-car/ui/maquettes/comparatif.png`, détail : `/Users/sachaberes/cash-car/ui/maquettes/PISTES.md`)
Choix :
A) LE SHOWROOM — un seul lieu : une bande de TOUTES les caisses en bas, la touche d'or dit JOUER ou ACHETER ; acheter et jouer = 2 touches — `/Users/sachaberes/cash-car/ui/maquettes/A-planche.png`
· B) GARAGE + CATALOGUE — deux lieux : le garage ne montre que mes caisses, la boutique est un catalogue plein écran puis une fiche d'achat ; acheter et jouer = 4 touches — `/Users/sachaberes/cash-car/ui/maquettes/B-planche.png`
· C) LA FICHE À TIROIR — un seul lieu, un panneau à 4 onglets CAISSE · PEINTURE · AILE · TRAÎNÉE qui remplace inventaire et boutique ; acheter et jouer = 3 touches — `/Users/sachaberes/cash-car/ui/maquettes/C-planche.png`
Recommandation : A — un seul lieu, un seul geste, une seule touche d'or, et la caisse reste la vedette ; on peut lui ajouter la grille de B comme raccourci « tout voir » si la bande est trop longue.
Par défaut : aucun — j'attends le choix avant de coder
Réponse de Sacha : (PILOTAGE remplit)
### Q · PILOTAGE (nettoyage) · 4 h 05 — rendu de l'agent, branche `detail/nettoyage` (fusion prévue au train T2), détail : `notes/nettoyage.md`
FAIT : 14 fichiers jamais joués supprimés (10 Mo : 9 voix, eww, wow, nocturnal-groove, lobby-ascenseur, vapeur-salon) ; REQUIN, COMÈTE, LA RAIE
cachées (`retire:1`, aucun index déplacé) ; le toast « TES RECORDS : BIENTOT EN DETAIL » retiré.
Questions pour Sacha (+ Léo) :
N1. LA RAIE cachée : qui l'avait achetée (2,5 M $) la perd sans remboursement. A) rembourser · B) la laisser à ceux qui l'ont · C) tant pis
N2. Retirer les COMMENTAIRES à la fabrication (pas dans le code source) : 1,88 Mo sur 4,72 Mo de script → la page passe de 5,65 à ~3,5 Mo. oui / non
N3. Supprimer le lot « sûr » après le dernier train (~209 Ko de code mort + 137 Ko de banque de sons + 27 Ko de CSS) : oui / non
N4. CRYPTOCITY (56 Ko, lancée seulement par `?niveau=crypto`, le simulateur de Léo s'en sert) : garder / supprimer
N5. ville-n6 à n10 (11,4 Mo, jamais joués, « en attente » chez Léo) : garder / supprimer
N6. Édition Poki / CrazyGames (30 Ko dans le fichier) : garder / supprimer
N7. Les 124 commandes de test `dbg*` que plus aucun banc n'appelle (91 Ko ; certaines sont à Léo) : garder / supprimer
N8. Petits restes : anciens nuages, ancien garage, variantes du jade, `?bq=herbe`, 5 niveaux de campagne retirés, atelier des nuages en ligne : garder / supprimer
Réponse de Sacha (4 h 15) : **« mais on supprime tout ce qui n'est pas là actuellement »** → N3 OUI ; N4 CRYPTOCITY, N5 ville-n6…n10, N6 édition Poki,
N7 commandes de test inutilisées, N8 petits restes : SUPPRIMER. N1 (LA RAIE) et N2 (commentaires à la fabrication) : pas encore de réponse.
Exécution par PILOTAGE sur `detail/nettoyage`, un commit par famille (facile à annuler) : d'abord le lot sûr, les fichiers, les petits restes et les
commandes de test ; CRYPTOCITY et l'édition Poki (chirurgie plus profonde) après 6 h. NON supprimés sans nouvel avis : les outils locaux de Léo
(simulateur, salle blanche, boîtes…) et les commandes de test qu'ils appellent, `?bq=herbe` (ajouté par Léo cette nuit, boutique en direct), le code
des cônes (GRAPHISME vient de poser l'interrupteur), le CSS (INTERFACE refond garage et boutique), les formes des 3 caisses cachées en attente de leur défi.

---

## RETOUR DE SACHA — 4 h 25 (il joue le mode classique, en ligne depuis 3 h 56)
- **« Il y a plein de nouvelles maps et d'éclairages dans le jeu maintenant, mais les couleurs ne rendent pas du tout bien sur certaines maps.
  Travaille les rendus AU CAS PAR CAS — la ville ensoleillée par exemple ne marche pas. »** → GRAPHISME : la VILLE de jour (matin, midi) en premier,
  puis chaque couple map × météo un par un ; pour chacun une planche AVANT / APRÈS posée ici pour que Sacha valide.

---
## IDÉE / ORDRE DE SACHA — 4 h 30
- **« Dans l'espace on met des nuages et tout, mais on peut mettre différentes planètes du système solaire à la place de la Terre. »**
  → GRAPHISME : sur la map EN ORBITE, la Terre remplacée par des planètes différentes selon la variante (matin / midi / soir / satellites) ou le tirage —
  même sphère, même shader, seule la texture / la palette change (bâtie une fois au chargement du niveau, jamais pendant la course) ; et dire si les
  nuages gardent un sens dans l'espace. Proposition (quelle planète pour quelle variante) + planche à poser ici avant de généraliser.

---

## RETOUR DE SACHA — 4 h 35
- **« Je ne sais pas pourquoi ni comment régler le problème, mais on a un souci de maniabilité avec le joystick : on le perd souvent du doigt. »**
  → GAMEPLAY (propriétaire du volant tactile) : diagnostic par le code puis correctif — suivi du doigt par son identifiant, zone de prise large, base
  qui SUIT le pouce quand il sort du rayon, rien qui lâche avant le `touchend`/`touchcancel` de CE doigt, 2e doigt (nitro) sans effet sur le 1er.
  À regarder : la branche locale `fix-joystick-saut` (09/10, jamais fusionnée). APP STORE : les gestes système des bords dans l'app.

---

Q · GRAPHISME · planètes de l'orbite : /Users/sachaberes/cash-car/gfx/shots/planetes/planche-proposition.png — Proposition (le système solaire au fil de la journée, même sphère/même shader, seule la toile 1024×512 est repeinte au portail) : MATIN = Terre · MIDI = Mars (démontré, branche gfx/planetes, interrupteur `PLANETES_ON`) · SOIR = Jupiter (ses bandes ambre épousent la clé du soir) · SATELLITES = Saturne (l'anneau = 1 disque + 1 programme de plus : à valider, sinon Uranus).
Q · GRAPHISME · nuages en orbite : aucun objet nuage n'existe en orbite (`lvlNuageOk` dit non) ; ce que tu vois ce sont les 54 volutes blanches PEINTES dans la Terre. Interrupteur d'une ligne `TERRE_VOLUTES` (laissé à true). Je les retire (Terre nette, sans nuages) ? Oui / non ? Et on généralise aux 4 variantes ?

Q · GRAPHISME · ville matin : /Users/sachaberes/cash-car/gfx/shots/apres/aa-ville-matin.png — béton L* 52 → ~41 (rtK .72) et expo .91 → .97 : ville lumineuse, plus de béton gris-bleu blême

Q · GRAPHISME · ville midi : /Users/sachaberes/cash-car/gfx/shots/apres/aa-ville-midi.png — béton L* 50 → ~44 (rtK .8), expo .92 → .98 ; ciel azur franc et tours claires gardés (un premier réglage trop foncé a été corrigé)

Q · GRAPHISME · ville soir : /Users/sachaberes/cash-car/gfx/shots/apres/aa-ville-soir.png — mauve retiré : hemiS/hemiG/jMid réchauffés (ciel pêche-prune, béton taupe L* 34 au lieu de violet-gris), rtK .85

Q · GRAPHISME · ville nuit : /Users/sachaberes/cash-car/gfx/shots/apres/aa-ville-nuit.png — inchangé : déjà tenu (béton bleu-nuit lisible, tours et enseignes en couleur)

Q · GRAPHISME · ville pluie : /Users/sachaberes/cash-car/gfx/shots/apres/aa-ville-pluie.png — inchangé : ardoise, route mouillée, seules les enseignes en couleur

Q · GRAPHISME · ville orage : /Users/sachaberes/cash-car/gfx/shots/apres/aa-ville-orage.png — ciel plus ardoise et moins indigo (jZen/jMid/jHor réduits en bleu)

Q · GRAPHISME · nuages matin : /Users/sachaberes/cash-car/gfx/shots/apres/aa-nuages-matin.png — inchangé : azur → pêche, cumulus crème, béton L* 42

Q · GRAPHISME · nuages midi : /Users/sachaberes/cash-car/gfx/shots/apres/aa-nuages-midi.png — béton L* 46 → ~40 (rtK .9) ; cumulus proches encore un peu sable (coton, hors valeurs d'ambiance)

Q · GRAPHISME · nuages soir : /Users/sachaberes/cash-car/gfx/shots/apres/aa-nuages-soir.png — béton L* 47 → ~21 puis rtK .83 : taupe rosé plus sombre (cible soir) ; ciel pêche → mauve doux gardé

Q · GRAPHISME · nuages nuit : /Users/sachaberes/cash-car/gfx/shots/apres/aa-nuages-nuit.png — hemiI .58 → .55 et lune .8 → .74 : nuages et béton un cran plus bas (béton L* ~14) ; la mer blanche (GLSL) reste

Q · GRAPHISME · nuages pluie : /Users/sachaberes/cash-car/gfx/shots/apres/aa-nuages-pluie.png — inchangé : gris perle, la plus tenue

Q · GRAPHISME · nuages orage : /Users/sachaberes/cash-car/gfx/shots/apres/aa-nuages-orage.png — inchangé (ardoise correcte) ; cumulus beige à droite = teinte du coton

Q · GRAPHISME · jade matin : /Users/sachaberes/cash-car/gfx/shots/apres/aa-jade-matin.png — béton L* 60 → ~36-46 (rtK .6) : plus de dalle blanche terne, la voiture ressort

Q · GRAPHISME · jade midi : /Users/sachaberes/cash-car/gfx/shots/apres/aa-jade-midi.png — béton L* 60 → ~46 (rtK .6), décor céladon et coton inchangés

Q · GRAPHISME · jade soir : /Users/sachaberes/cash-car/gfx/shots/apres/aa-jade-soir.png — NON touché (soir de Léo) : béton beige-rosé clair L* 59, à trancher par Sacha/Léo (rtK .6 le mènerait à ~46)

Q · GRAPHISME · jade nuit : /Users/sachaberes/cash-car/gfx/shots/apres/aa-jade-nuit.png — inchangé : béton lisible mais rochers noirs sur ciel noir (pas de silhouette) — à régler dans les champs jd* avec un essai à l'image

Q · GRAPHISME · jade pluie : /Users/sachaberes/cash-car/gfx/shots/apres/aa-jade-pluie.png — inchangé : gris à peine vert, béton L* 42

Q · GRAPHISME · jade orage : /Users/sachaberes/cash-car/gfx/shots/apres/aa-jade-orage.png — inchangé : vert-ardoise sombre, acceptable

Q · GRAPHISME · orbite matin : /Users/sachaberes/cash-car/gfx/shots/apres/aa-espace-matin.png — clé de soleil [1,.9,.72] → [1,.94,.84] : béton gris chaud au lieu de sable-brun

Q · GRAPHISME · orbite midi : /Users/sachaberes/cash-car/gfx/shots/apres/aa-espace-midi.png — inchangé : béton gris neutre, dalles lisibles (L* 42)

Q · GRAPHISME · orbite soir : /Users/sachaberes/cash-car/gfx/shots/apres/aa-espace-soir.png — clé [1,.78,.58] → [1,.82,.66] : béton moins chocolat saturé (L* ~28)

Q · GRAPHISME · orbite satellites : /Users/sachaberes/cash-car/gfx/shots/apres/aa-espace-satellites.png — inchangé (même ambiance que midi, béton L* 37)

Q · GRAPHISME · CRYPTOCITY : /Users/sachaberes/cash-car/gfx/shots/apres/aa-crypto-x.png — inchangé : jour clair tenu, béton gris L* 44 (haut de fourchette)

Q · GRAPHISME · Soleil de Jade : /Users/sachaberes/cash-car/gfx/shots/apres/aa-soleil-x.png — inchangé (Léo) : une seule capture, béton L* 54 un peu clair


Q · GRAPHISME · planètes (fait) : /Users/sachaberes/cash-car/gfx/shots/planetes/planche-4-planetes.png — matin Terre sans volutes, midi Mars, soir Jupiter, satellites Saturne et son anneau (branche gfx/planetes ; interrupteurs PLANETES_ON, SATURNE_ANNEAU, TERRE_VOLUTES)


Q · GAMEPLAY — le joystick qu'on perd du doigt (2026-10-14, agent volant de la passe SENSATIONS)
- Trouvé et reproduit : après REJOUER (et après le tout premier JOUER), un rideau couvre l'écran pendant un tiers de seconde. Si le pouce revient à sa place PENDANT ce rideau, le jeu ne le voit jamais : pas de rond de joystick, la caisse file tout droit, jusqu'à ce qu'on relève le pouce pour le reposer. C'est le correctif du 09/10 (« le joystick disparaît après un saut dans le vide ») qui n'était jamais arrivé dans le jeu.
- Corrigé dans la copie de la passe (pas encore en ligne) : en course, un pouce déjà posé à gauche prend le volant tout seul. Le reste est sain : le joystick suit déjà le pouce quand il s'éloigne, la nitro ne le fait pas lâcher, toute la moitié gauche de l'écran le prend, rien du HUD n'est posé dessus. Donc aucun choix à faire entre joystick fixe et joystick qui suit : il suit déjà.
- La question pour Sacha : est-ce bien JUSTE APRÈS REJOUER que tu le perds, ou aussi en pleine course ? Si c'est en pleine course, pouce posé tout en bas de l'écran : c'est sans doute le geste d'iPhone « remonter pour revenir à l'accueil » qui te vole le doigt — ça se règle dans l'app (pas dans Safari), dis-le et on le fait. Pour essayer le correctif : lien de test de la passe SENSATIONS, mourir, toucher REJOUER et poser le pouce à gauche tout de suite — le rond doit apparaître dès que la course part.
## PRÉCISION DE SACHA — 4 h 40 (joystick)
- **« Dans l'app, c'est juste que souvent, quand mon pouce se déplace trop, il se détache. »** → le défaut n° 1 à corriger : le pouce qui sort du
  rayon / de la zone du volant ne doit JAMAIS lâcher le volant (braquage tenu au maximum, ou base qui suit le pouce) tant que CE doigt est posé.

---

Q · GAMEPLAY — « dans l'app, quand mon pouce se déplace trop, il se détache » (2026-10-14, 4 h 50, suite de la précision de 4 h 40)
- Ce qu'on sait : dans le jeu, un pouce tiré très loin NE lâche PAS le volant — vérifié avec de vrais doigts simulés (jusqu'à 90 % de la largeur, tout en haut, tout en bas, la nitro posée ou levée à côté : 33 cas, 0 échec). La base du joystick suit déjà le pouce. Et l'app demande déjà à l'iPhone de ne pas voler les gestes des bords.
- La cause la plus probable (NON reproduite sur un vrai iPhone, c'est une hypothèse) : un pouce qui s'étire se couche sur le verre ; l'écran peut le compter un instant comme DEUX doigts puis lâcher le premier. Le jeu prenait le second pour une paume et l'ignorait : joystick mort sous un pouce toujours posé. Corrigé dans la branche de la passe SENSATIONS : un contact né à moins de 90 px du pouce, moins d'une demi-seconde avant, REPREND le volant sans à-coup. Une vraie paume (loin, ou posée depuis longtemps) n'hérite toujours pas.
- Pour en avoir le cœur net : RÉGLAGES, tout en bas, la ligne VERSION affiche « VOLANT R3 C1 » dès qu'il se passe quelque chose. R = le nombre de fois où le relais a sauvé le joystick ; C = le nombre de fois où l'iPhone a coupé le doigt lui-même. Sacha : après une partie dans l'app à jour, dis-nous ces deux chiffres. R qui monte = c'était ça, et c'est réglé. C qui monte = c'est l'iPhone qui coupe, il faudra chercher côté app. Les deux à zéro alors que ça se détache encore = autre chose, on reprend.
- Aussi corrigé (reproduit, lui) : un pouce reposé pendant le rideau de REJOUER ou du premier JOUER n'était jamais vu ; il prend maintenant le volant tout seul.
- ⚠ Rien de tout ça n'est en ligne ni dans l'app : c'est sur la branche `sensations-integration` (9ca03ea), à prendre dans un train puis à reconstruire dans l'app.

## SACHA — 4 h 50 à 5 h 05 (consignes générales)
- « Fais encore plus dans le détail partout… on est très loin d'un niveau professionnel… la recherche de la perfection et l'intégration des poussées de Léo. »
- « C'est surtout l'INTERFACE qui est affreuse sur iPhone : refonte totale, inventivité. »
- « Je ne veux pas qu'ils arrêtent de travailler, jamais ; donne-leur toujours du travail ; pendant ce temps toi tu cherches des points à améliorer au global. »
- « C'est surtout les GRAPHISMES et les SHADERS, c'est très mal géré ; je veux que le jeu soit MAGNIFIQUE ; les ambiances et la colorimétrie ne vont pas du tout. »

---
- (5 h 10) « Pour les graphismes, c'est surtout l'ÉTALONNAGE et la COLORIMÉTRIE. » → GRAPHISME : la chaîne de couleur et l'étalonnage d'abord ; un shader seulement s'il empêche la bonne couleur.


Q · GRAPHISME · ville midi (hasard) : /Users/sachaberes/cash-car/gfx/shots/hasard-beaute/aa-ville-midi.png — ciel azur clair (plus cobalt), tours plus éclairées (clé 2), ombres bleutées, brume claire lointaine
Q · GRAPHISME · ville matin (hasard) : /Users/sachaberes/cash-car/gfx/shots/hasard-beaute/aa-ville-matin.png — tours plus éclairées, ciel un cran plus clair, brume plus lointaine
Q · GRAPHISME · nuages nuit (hasard) : /Users/sachaberes/cash-car/gfx/shots/hasard-beaute/aa-nuages-nuit.png — cumulus moins éclairés (volSun/volSky, lune .4) ; la mer GLSL reste claire
Q · GRAPHISME · nuages orage (hasard) : /Users/sachaberes/cash-car/gfx/shots/hasard-beaute/aa-nuages-orage.png — cumulus ardoise sombres au lieu de blanc-lavande
Q · GRAPHISME · nuages soir (hasard) : /Users/sachaberes/cash-car/gfx/shots/hasard-beaute/aa-nuages-soir.png — béton plus clair et moins violet (rtK 1,05)
Q · GRAPHISME · orbite soir (hasard) : /Users/sachaberes/cash-car/gfx/shots/hasard-beaute/aa-espace-soir.png — béton gris-taupe au lieu de chocolat (sunC)
Q · GRAPHISME · ville orage (hasard) : /Users/sachaberes/cash-car/gfx/shots/hasard-beaute/aa-ville-orage.png — ciel ardoise gris-bleu, sans indigo

Q · GRAPHISME · chaîne de couleur : /Users/sachaberes/cash-car/gfx/shots/chaine-couleur/planche-crans.png — L'iPhone reçoit le MÊME étalonnage que le banc (écart ±1-2,5/255 mesuré à image figée ; aucune condition de palier/cran sur les uniformes ; pas d'erreur de gamma : tout le jeu est cohérent « en valeurs d'écran »). Mais il calcule l'image en DPR 1 (réglage RAPIDE par défaut, 1/9 des pixels d'un écran ×3, piqué .40) et son halo était 2× plus large qu'au banc → CORRIGÉ (gfx/chaine-couleur 133836f, halo à largeur d'écran constante, coût nul).
  À trancher par Sacha : (1) essayer tout de suite Réglages → IMAGE : NETTE sur l'iPhone ; proposition : NETTE par défaut au palier récent ; (2) les noirs bouchés (contraste à pivot .5 écrêté : tout sous ~28/255 sort noir pur) — interrupteur POST_PIVOT posé ÉTEINT ; (3) replier le grade figé ×1,12 de saturation dans DA. Console Safari sur l'iPhone : `dbgChaine()` dit palier, DPR, cible 16 bits ou 8 bits.

### Q11 · INTERFACE · direction artistique de toute l'interface · 5 h 30
Question : quelle direction artistique pour TOUTE l'interface (accueil, course, fin, garage, boutique, offres comprises) ? Maquettes seulement, rien n'est codé. À regarder d'abord : `ui/maquettes/dir-comparatif.png` ; détail : `ui/maquettes/DIRECTIONS.md`.
Choix : 1) LA PLANCHE À BILLETS — tout ce qui se touche est un billet de la banque CASH CAR, et la fin de partie imprime un billet à ton score avec ta caisse dans le médaillon (`ui/maquettes/dir-1-planche.png`) · 2) LE COMPTEUR — toute l'interface est un compteur à rouleaux : chiffres et mots tournent, l'action est une rangée de rouleaux orange J·O·U·E·R qui tourne en 3·2·1 (`ui/maquettes/dir-2-planche.png`) · 3) CODE DE LA ROUTE — vitesse dans un panneau de limitation, cash sur une plaque, menu sur un poteau de panneaux, prix sur un totem de station-service, et la fin de partie est ta photo de radar « flashé à 303 km/h » (`ui/maquettes/dir-3-planche.png`)
Recommandation : la 3 (la plus lisible d'un coup d'œil ET la plus originale ; la photo de radar se partage), avec le chiffre qui roule de la 2 sur la plaque du cash et le panneau de vitesse.
Par défaut : aucun — j'attends le choix de Sacha avant de coder. Réversible ? oui (rien n'est touché dans le jeu)
Réponse de Sacha : (PILOTAGE remplit)

### Q · PILOTAGE (éclaireur global) · 5 h 55 — 45 lignes de travail versées dans BACKLOG.md (INTERFACE 28), deux décisions pour Sacha :
E1. Le CHINOIS est proposé dans le choix de langue avec 578 clés traduites sur 901 : les écrans mélangent trois langues. A) le cacher tant qu'il
    n'est pas complet · B) le compléter (gros travail de traduction) · C) laisser
E2. L'ICÔNE de l'app et l'écran de lancement natif sont encore en horizon synthwave violet / rose / cyan (le style « IA » que tu as rejeté), fixes
    4 secondes, suivis de 3 écrans de lancement de styles différents. A) refaire icône + lancement dans la direction choisie pour l'interface · B) laisser
Réponse de Sacha (6 h 00) : E1 → **ENLEVER le chinois** ; E2 → **« j'aime bien l'icône actuelle »** : on GARDE l'icône (l'écran de lancement
natif peut quand même s'effacer dès que le jeu est prêt au lieu de 4 s fixes, sans changer de style).

Q · GRAPHISME · trois questions du directeur artistique (6 h) — voir ~/cash-car/gfx/DIRECTION.md (page 1 = l'intention, lisible en 3 min) :
  1. IMAGE : NETTE sur ton iPhone (Réglages) — le jeu calcule aujourd'hui à 1/9 des pixels de l'écran en RAPIDE. Accepte-t-il NETTE par défaut sur les iPhone récents (zone perf) ?
  2. Le JUS SUR L'OBJECTIF (taches pixel roses/jaunes/violettes) et les CONFETTIS multicolores salissent presque toutes les images : peut-on les doser — 4 taches au plus, plus petites, couleurs désaturées ; confettis or, ivoire, vert ?
  3. Le béton du JADE SOIR de Léo et du SOLEIL DE JADE est le plus clair du jeu (beige, L* 59) : on le baisse à L* 45 (`rtK` .75), sans toucher au reste de l'ambiance ?

### Q · APP STORE · 6 h 10
Question : le code « cousin » (RÉGLAGES › ENTRER UN CODE, ajouté par Léo cette nuit) débloque toutes les voitures, habillages, figures et
niveaux. Apple interdit de débloquer du contenu par un code hors achat intégré (règle 3.1.1). Dans l'app iPhone, on le garde ?
Choix : A) coupé dans l'app seulement (le jeu web le garde) · B) gardé aussi dans l'app (risque de refus à la revue)
Par défaut (ce que je fais en attendant) : A — fait (commit 60ce60d sur ios-capacitor), réversible ? oui
Réponse de Sacha : (PILOTAGE remplit)

### Q-SON · SON · quatre choix d'oreille · 5 h 55 (la session SON n'écoute pas : elle mesure — ces quatre-là demandent TON oreille)
Q-SON-1. LA MUSIQUE SUR IPHONE n'obéit à rien : le volume d'un <audio> y est verrouillé, elle joue à 100 % partout — au ciel (Léo la voulait
   « très légère, comme entendue en tombant », 15 %), au garage, en course (−4 à −8 dB à l'ordi), sous l'annonceur ; le curseur MUSIQUE ne fait rien.
   A) la faire passer par WebAudio dans l'appli (tout le mixage de l'ordi revient : curseur, ciel léger, fondus, sonie égale, compression des creux)
      — risque connu (c'est ce qui la rendait MUETTE en septembre, d'où la « musique v4 ») : livré derrière un interrupteur, avec un contrôle de
      silence qui revient à l'ancien chemin, et rien n'est allumé avant ton essai sur ton iPhone ;
   B) garder le chemin actuel, et au ciel la mettre en PAUSE sur iPhone (la 1re demande de Léo : « elle se lance quand j'appuie sur le garage ») ;
   C) laisser. Recommandation : A (essai sur ton iPhone d'abord), B en attendant. Par défaut : C. Réversible : oui.
Q-SON-2. LE SON DE MORT est tiré au sort entre trois « placeholders » (minecraft 0,3 s, explosion, gong) par-dessus l'explosion de la banque.
   A) une signature unique (l'explosion + `mort.<cause>` de la banque, sans tirage) ; B) garder explosion + gong seulement ; C) laisser.
   Recommandation : A (le son qu'on entend à chaque partie doit être reconnaissable). Par défaut : C. Réversible : oui.
Q-SON-3. EN ORBITE, le vent et le sifflement sont coupés (le vide) : le monde le plus rapide est le plus plat à l'oreille.
   A) garder le silence de l'air ; B) un plancher de 25 % du grondement grave (sans le sifflement). Par défaut : A. Réversible : oui.
Q-SON-4. LA FRÉNÉSIE n'a pas sa musique (`dark-triad.mp3`, morceau de Léo, absent) : en attendant elle joue le morceau en cours un demi-ton
   plus haut et 6 % plus vite (corrigé cette nuit : plus de trou de musique à l'entrée dans l'appli). A) en attendant Léo, basculer sur
   CASH CAR VITESSE (le plus énergique de la radio) pendant la frénésie ; B) garder le surmultiplié. Par défaut : B. Réversible : oui.
PLUS DE QUESTION (cap de Sacha, 6 h 10 : « pas de question ») — défauts appliqués par SON : Q-SON-1 → A limité : musique par WebAudio PAR DÉFAUT sur iPhone iOS 17+ (session audio 'playback' forcée), chien de garde qui revient seul à l'ancien chemin si elle se tait ; ailleurs inchangé · Q-SON-2 → les trois sons gardés, ÉGALISÉS (d5d84fc) · Q-SON-3 → A (le silence de l'air en orbite) · Q-SON-4 → B (le surmultiplié).

### Q · GRAPHISME · la courbe (noirs bouchés, saturation empilée) : `gfx/shots/courbe-noirs/planche.png` (variantes : `variantes.png`)
Ce qui change : les noirs ne sont plus écrêtés — un pied doux remplace la coupure (ville la nuit : 17,5 % → 5,9 % de pixels noir pur), mi-tons, lumières et teintes inchangés (±2/255) ; le grade figé du téléphone est replié dans la courbe et DA.sat (ordi = iPhone).
Éteinte par défaut (branche gfx/courbe-noirs) : à essayer sur l'iPhone avec `?courbe=2` dans l'adresse. Choix : A) l'allumer (pied 2,5) · B) l'allumer avec des noirs encore plus ouverts (pied 3) · C) la laisser éteinte.
Réponse de Sacha : (PILOTAGE remplit)

Q · GAMEPLAY — les FIGURES LIBRES (2026-10-14, 5 h 45, demande de Sacha : « inspire-toi des figures et de leur interface dans le shop, mais refonte totale de la physique »)
- Fait sur `sensations-integration` (9d1b37e) : en vol, un double-tap NITRO n'est plus une animation tirée au sort, c'est un DEMI-TOUR LOURD sur l'axe du pouce (neutre = tonneau, gauche/droite = toupie, haut/bas = salto, diagonale = les deux). Les demi-tours s'empilent quand on martèle et se composent (un demi-salto puis une demi-toupie = la caisse en demi-tonneau, que le rattrapage finit). Chaque demi-tour rapporte du nitro tout de suite (5 % de la jauge, plus s'il change d'axe, 60 % au plus par vol) ; chaque tour complet se nomme (TONNEAU, HELICO 720, SALTO ARRIERE…), deux axes = TIRE-BOUCHON / RODEO / VRILLE PENCHEE, trois = SALTO COSMIQUE.
- Le double-tap ne pousse plus la caisse en avant : le coup de réacteur de son 1er appui est rendu. Un appui seul reste le boost.
- Gardé de Léo : le catalogue, le shop, l'inventaire, la boîte, le SAUT NITRO au sol, le jugement de la pose. Une figure du shop qu'on POSSÈDE, réussie à la main, paie moitié plus. `?fig=script` rend le lecteur de Léo.
- À trancher entre Sacha et Léo : c'est Léo qui a fait le système tiré au sort (37529a2, 4 h 56) ; le défaut est maintenant la physique libre. Banc : 4 vols, 0 pose ratée, 0 erreur ; le ressenti est à juger au téléphone.

## SACHA — 6 h 10 : « les détails m'intéressent, le jeu le plus propre possible ; les idées principales après ; rends chaque chose compatible et magnifique les unes avec les autres » → Q11 (direction de l'interface) EN PAUSE ; plus de grandes questions : chaque session tranche par l'œil et la mesure (NETTE : OPTIMISATION ; noirs bouchés : GRAPHISME).

Q · GRAPHISME · la ville de jour, façades : /Users/sachaberes/cash-car/gfx/shots/facades-jour/planche-iphone.png — au matin et à midi, les fenêtres des tours ne sont plus allumées en orange : le verre s'assombrit et renvoie le ciel en rasant, et le béton passe du lavande au gris neutre ; soir, nuit et pluie gardent leurs fenêtres.
Les enseignes et les parapets passent du magenta/cyan à ambre / blanc / rouge de balise (ça se voit aussi la nuit ; ?sans=neonville coupe ce seul point) — à valider (éteint par ?sans=facades)

## Q8 · GAMEPLAY → NUAGES 4 (agent nuages4, 2026-10-14)
- L'idée : « SAUTE LES MOUTONS ». Le matin, de petits moutons de nuage dorment couchés sur la route, là où étaient les portes de plots (3 séries de 3 : au milieu, puis décalés, puis des troupeaux de trois en travers).
- Comment on gagne : on les saute au double-tap NITRO (le saut est offert au pied d'un mouton) ; passé au-dessus = « SAUTE-MOUTON » qui sonne de plus en plus haut, pris de face = le mouton éclate en ouate et la plaque bêle « BEEE ! » ; les 9 = « BERGER D'OR ! ». Rien ne fait perdre.
- L'essayer : niveau 4 de la carrière SKY HIGH, ou `dbgCampagne(4)` dans la console (`dbgMoutons()` montre le troupeau). Interrupteur : `MOUTONS_ON` (false = la piste nue d'avant).

Q · GRAPHISME · la matière des nuages : /Users/sachaberes/cash-car/gfx/shots/coton-blanc/planche-iphone.png (PAS ENCORE FAITE : la machine était à charge 400-670, aucune capture possible ; branche gfx/coton-blanc, 2621a21) — les cumulus ne sont plus tantôt sable tantôt lavande : chaque nuage a un blanc neutre (tous les iPhone, sans coût en plus) ;
sur les iPhone récents (palier 2) les bords s'effilochent en vapeur et le cœur prend un grain léger, avec une lisière d'or seulement à contre-jour — l'iPhone 7 garde son programme d'aujourd'hui — à valider (éteint par ?sans=coton) une fois la planche faite

Q · GRAPHISME · jade nuit et orage : /Users/sachaberes/cash-car/gfx/shots/jade-nuit/planche-iphone.png — la nuit passe d'un ciel noir à un ciel encre-vert (zénith #0D1A1E → horizon #1B3036) où les pics se lisent en silhouette, brume = horizon, coton de nuit en voiles sombres, kasumi dorés éteints ; l'orage devient ardoise verdie à horizon plus clair que le zénith — à valider (éteint par ?sans=jadenuit) ; branche gfx/jade-nuit, commits b0f315c + d8adcd2 ; jade midi/soir non touchés.

Q · GRAPHISME · le flou de vitesse : /Users/sachaberes/cash-car/gfx/shots/flou-vitesse/planche-iphone.png (PAS ENCORE FAITE : machine à charge 400-670, aucune ouverture ; script prêt : node /Users/sachaberes/cash-car/gfx/banc/flou-vitesse/ab.cjs ; branche gfx/flou-vitesse, a32fcf4) — le centre, la caisse et la route devant restent nets : le flou ne gagne que les bords (au-delà de 26 % du rayon, en carré), presque rien en croisière (l image garde son anticrénelage), à peu près la moitié d avant au boost et à la nitro ;
le warp (le monde qui s incurve) et le noircissement des coins divisés par deux, l aberration rouge/cyan (ordi seul) par 2,5 — à valider (éteint par ?sans=flou) une fois la planche faite

Q · GRAPHISME · nuages nuit et orage : /Users/sachaberes/cash-car/gfx/shots/mer-nuit/planche-iphone.png (légende : planche-iphone.txt ; branche gfx/mer-nuit) —
la mer de nuages sous l'horizon s'éteint : bleu nuit la nuit (#1E2A52), ardoise à l'orage (#4A5670), au lieu de sommets blanc crème ;
les cumulus de nuit deviennent des masses bleu nuit (albédo ×.32/.34/.41), ceux de l'orage ardoise (×.55/.58/.66) — midi, soir, matin, pluie, titre inchangés — à valider (éteint par ?sans=mernuit)

Q · GRAPHISME · bords de route : /Users/sachaberes/cash-car/gfx/shots/bords-route/planche-iphone.png (+ planche-debout-nuit.png ; branche gfx/bords-route) —
le rail néon (cyan, rose, violet) et sa lueur disparaissent : de jour le bord est un chanfrein de béton clair, la nuit/pluie/orage un rail blanc doux, les flancs sont en béton sombre, les catadioptres et le liseré sont ambre (or à Cryptocity et au jade), la ligne centrale blanc cassé, les plaques turbo sur béton —
à valider (éteint par ?sans=bords)

### Q · OPTIMISATION (via PILOTAGE) · 7 h 30 — LE DOGE fige l'iPhone 3 à 4 s (vrai blocage, zone de Léo)
La tête du DOGE (`dogeTete`, appelée par `SHAPES.doge`) se calcule à la 1re construction de la caisse : ~1 s de processeur sur le Mac, soit ~3-4 s
d'image figée sur un iPhone 7 — au garage en feuilletant jusqu'à elle, en boutique, ou au départ si elle est équipée (une fois par session).
`dogeQueue` (prévue pour étaler le calcul) existe mais n'est appelée nulle part. Les voitures sont à Léo, qui retouche LE DOGE en direct cette nuit.
Choix : A) Sacha prévient Léo, qui branche `dogeQueue` / calcule la tête hors du fil principal · B) OPTIMISATION corrige dès que Léo a fini avec LE DOGE
Réponse de Sacha : (PILOTAGE remplit)

Q · GAMEPLAY — réponses de Sacha (2026-10-14, 11 h 55)
- Mise en ligne de la passe SENSATIONS : « attends le train » → elle part avec le prochain train de PILOTAGE, GAMEPLAY ne pousse pas.
- Le PARFAIT (gel d image, flash, zoom, couronne) au CONTACT des roues plutôt qu à la déclaration (3 m) : « oui » → en cours (agent oeil).
- L argent du début (BACKLOG P2) : « 4 parties » → le premier achat (la moins chère des peintures) doit tomber à la 4e partie d un joueur moyen. À faire par GAMEPLAY après l agent oeil (1 agent), réversible (?eco=ancien), sans toucher aux prix de la boutique de Léo.
- (12 h 40) 2e gel dans la zone de Léo : ouvrir la BOUTIQUE fige ~400 ms (`shopPhotoTour`). Les deux (DOGE + boutique) sont résumés pour Léo dans `pilotage/POUR-LEO.md`.
