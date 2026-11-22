# Passation du chantier « qualité par appareil » — 21/11/2026, 20h45

Pour la session qui reprend. Le journal complet, lot par lot, est dans `passation/qualite/NUIT-18-11.md` (lire les dernières sections). Ce fichier-ci dit seulement où on en est et quoi faire ensuite.

## Règles de Sacha (inchangées)

- iPhone seulement (13 Pro, app Capacitor). Rien sur `main` sans son oui. **Aucun build installé sans son oui explicite.** Ne jamais supprimer l'app (sa sauvegarde est dedans).
- Fluidité d'abord, puis qualité. La netteté de la voiture baisse en dernier. Le jeu doit tenir branché + mode économie + chaud.
- Messages courts, en français, sans jargon, finis par une liste numérotée de tests.
- Il surveille sa consommation : peu d'agents, un lot à la fois. Il a dit le 21/11 : « lance pas de nouveau truc ».
- Il demande souvent « pause » puis « reprends » / « go » : arrêter les workflows (TaskStop), les relancer par `Workflow({scriptPath, resumeFromRunId})`.

## Où on en est

- **Sur le téléphone** : build 127 (commit `3dd64e4d5`), installé le 21/11 à 22h32 par-dessus le 126 (voir en bas).
- **Branche `qualite-appareil`** : tête `ee62614f2` (+ ce fichier). Depuis le 126, six lots fusionnés, tous contrôlés seuls :
  - `qa/defispossibles` : BLANC NEIGE 60 000, MONTE-CARLO / CAMOUFLAGE / BLOC D'HERBE 180 000 en argent du jeu ; missions du glacier cachées.
  - `qa/coherence` : totaux d'inventaire atteignables, compteurs du rayon voitures, CRYPTO CITY, textes anglais, fiche App Store et assistance du dépôt (non publiées).
  - `qa/boutiquefluide` : pastilles à motif préchauffées, teinte de rareté, pots encastrés gardés.
  - `qa/musiquegarage` : le lobby retente après un départ raté (le défaut de Sacha « plus de musique dans le garage » n'a été reproduit qu'en provoquant l'échec ; **pas prouvé que c'est ce qu'il entend**).
  - `claude/sans-trainees-fed5f1` : onglet et 12 traînées achetables retirés (`passation/SANS-TRAINEES.md`).
- **En cours à 20h45** : le contrôle de l'ensemble avant le build 127 (workflow `wf_f2ca7dc7-7b0`, script `…/workflows/scripts/ensemble-127-wf_f2ca7dc7-7b0.js`, worktree `~/cash-car/lots-nuit/ctl-ensemble127`). Son verdict sera ajouté en bas de ce fichier.
- **`main`** : `7c004c259` (v1626), livré par la session des maps. Il contient tout jusqu'à `fab4c31ac` + la finition des maps, mais **pas** : voitures-tri, pilotevoiture, flammesnitro, les astuces contre la chauffe, boutiquegel, transitions, flouvitesse (le bug du flou est donc toujours en ligne), ni les six lots ci-dessus.
- **Autres branches prêtes, hors du téléphone** : `claude/ville-cyberpunk-063e59` (route à étages, Crypto City de jour, décor du 3/11, flou réparé). `claude/finition-maps-dee281` est déjà sur main mais **pas dans `qualite-appareil`** : à fusionner si Sacha veut voir les maps finies sur son iPhone.

## À faire ensuite, dans l'ordre

1. Lire le verdict du contrôle de l'ensemble (bas de ce fichier). Sain → compiler le build 127 (recette dans `NUIT-18-11.md`, `CURRENT_PROJECT_VERSION=127`, depuis la tête), le proposer, **ne pas l'installer sans oui**. Défaut sérieux → le corriger d'abord (auteur puis contrôle).
2. Après installation : demander à Sacha de laisser le téléphone branché et déverrouillé, lire le vol (`sh outils/banc-perf/lire-vol.sh`, puis `python3 outils/banc-sondecalme/juger-vol.py <vol>`). Dernier vol : `vol-1121-1516.json`, 22,5 gels/min (70 avant le 122) ; une course à 124/min, téléphone bridé fort : le cas « branché + éco + chaud » n'est pas tenu.
3. Pour la musique du garage : si elle manque encore, lui demander la boîte noire (RÉGLAGES › ligne VERSION › COPIER) et y chercher « lobby lié raté » / « lobby lié relancé ».

## Décisions que Sacha n'a pas encore prises

1. Prix des quatre peintures : 60 000 / 180 000 en argent du jeu, ou en euros comme les autres (quatre produits App Store à créer) ?
2. Prix barré « 1,61 € » de l'ICEBERG (jamais pratiqué) : le retirer ?
3. Missions « JOUE SUR CHAQUE MAP » et « AVOIR EXPLORÉ CHAQUE MAP » : les fusionner ?
4. Deux missions du glacier cachées : un remplacement ?
5. Montants de mission (fig5 15k, parf10 25k, rares 150k, lave 20k, km100k 100k) ; produits App Store `cashcar.car.e_aigle` et `cashcar.car.iceberg`.
6. Livraison sur `main` de la branche du téléphone, et de la ville.

## Défauts connus, non traités

- Animation de relance : le volet se lève plus tard (appui → volet levé 0,45 → 0,9 s au banc). Sacha doit juger ; `?sans=transitions`.
- Flammes du nitro : boule de feu sous la caisse 1 à 2 images en salto / vrille.
- Boutique : la caisse est rebâtie à chaque arrêt du défilement ; pire image de l'ouverture inchangée (~0,35 s au banc).
- Musique : si le nouvel essai du lobby rate aussi, garage muet tant qu'on y reste.
- Liste complète des incohérences et de ce qui a été laissé : `passation/qualite/INCOHERENCES-21-11.md`.

## Outils et pièges

- Banc Chrome : deux places, `~/cash-car/verrou-banc.sh prendre "<qui>"` / `rendre`. ⚠ `rendre` libère la place la plus ancienne, pas forcément la sienne. Un agent arrêté en route peut laisser `/private/tmp/cashcar-banc.lock*` : vérifier `qui` et qu'aucun Chrome sans fenêtre ne tourne avant d'effacer.
- Fusion d'un lot : `git merge`, `node code/assembler.cjs --depuis-morceaux`, les trois gardes, `git checkout -- "VERSION PRINCIPALE/index.html"`. Le hook pousse seul ; vérifier avec `git status -sb`.
- Les prompts des agents doivent citer les mots de Sacha. Worktrees allégés sous `~/cash-car/lots-nuit/` ; retirer ceux des lots finis (disque).
- Builds gardés sur le Mac : 122, 123, 125, 126 (`~/cash-car/ios-ultime-mesures/builds/`).

## Verdict du contrôle de l'ensemble (21/11, 22h10) : SAIN

Tête contrôlée : `ee62614f2` (les commits suivants ne touchent que la passation). Aucun défaut sérieux. Huit parties complètes au banc (site, paquet de l'app, édition App Store ; sauvegarde du 126 rejouée, neuve FR, neuve EN) : 0 exception, 0 objet ni caisse ni mission perdus, BLANC NEIGE achetée 60 000, pas d'onglet traînées, les quatre interrupteurs `?sans=` agissent. Peintures : pire image du rayon 250 ms contre 792 ms sans le lot. Lobby : relancé après un départ raté provoqué.

Défauts mineurs relevés (aucun traité, rien lancé) :
1. Sauvegarde du 126 : missions tr5 / tr10 réussies mais pas récupérées → leurs primes (3 000 et 10 000) ne se touchent plus tant que les traînées sont retirées ; eng30 (FOUDRE) cachée, sa récompense attend. Rien n'est effacé.
2. RÉGLAGES › VERSION affiche `df41561f2` dans le 126 comme dans le 127 (index.html jamais commité sur la branche) : Sacha ne peut pas distinguer les deux builds par cette ligne.
3. Édition App Store seulement (pas ses builds, qui sont COMPLET=1) : le CHAT POP-TART sort de `owned` sans remboursement. À régler avant une vraie publication.
4. 404 sur `assets/ciel/mer-cumulus.png` dans le paquet (déjà là au 126).
5. Coût en course : aucune différence visible avec le 126, mesure bruitée.

Pas vérifié : rien n'a tourné sur un vrai iPhone ; StoreKit réel ; la vraie sauvegarde de Sacha ; relance du lobby après une mort ; mise en page ordinateur de la boutique à 5 onglets.

Relevés : dans le scratchpad de la session (`…/scratchpad/ctl127/`, effaçable). Worktrees `~/cash-car/lots-nuit/ctl-ensemble127` et `ctl127-base` laissés en place : à retirer (disque).

## Build 127 : INSTALLÉ le 21/11 à 22h32 (oui de Sacha)

`~/cash-car/ios-ultime-mesures/builds/build127.app`, compilé le 21/11 depuis `3dd64e4d5` (COMPLET=1, `&perfrec=2`). **À installer seulement sur le oui de Sacha** :
`xcrun devicectl device install app --device FE6F8B40-DCFF-5E04-B578-871A79EDCF17 ~/cash-car/ios-ultime-mesures/builds/build127.app`
Rien d'autre ne tourne : aucun workflow, aucun banc.

Installé par mise à jour (app non supprimée, sauvegarde gardée). Suite : attendre le retour de Sacha, puis lire le vol (point 2 de « À faire ensuite »).

## 22/11 : lot « tuto et finitions » (branche `qa/tuto-finitions`, PAS installé, PAS compilé)

Demande de Sacha : refonte du tuto (« plein écran », « pouces en pixels », « faudra pas qu'on puisse le skip »), série et voitures de mission qu'on ne zappe plus, HUD calme « au bout de 3 secondes sans toucher le nitro », plus de titre de map. Il a dit ensuite : « fais pas la compilation x code toi meme ».

- Tuto : `code/interface/auto-ecole.js`, `code/css/ecole.css`, détail et points fragiles dans `passation/qualite/tuto.md`, photos dans `passation/qualite/photos/tuto/`. Plus de PASSER ; une mort à VOLE / POSE-TOI compte comme un raté, l'étape est accordée au 2e.
- Série (`missions/aujourdhui.js`) et révélation (`missions/ecran-revelation.js`) : rien ne ferme avant le bouton, puis 0,7 s, puis seulement le bouton (n'importe où si le bouton est hors écran ; secours 9 s / 12 s).
- HUD calme : `HUD_CALME_MS=3000` (`moteur/cadence.js`). Titre de map : coupé (`maps/continuite.js`, `?titremap=1` le remet).
- `preparer-www.js` : plus de 404 sur mer-cumulus dans les builds COMPLET. Fiche App Store : la note au testeur ne dit plus que le tuto se saute (**à recoller dans App Store Connect par Sacha**).
- Optimisation : mesurée, aucun gain sûr trouvé, rien touché.
- Contrôlé au banc Chrome seulement (4 formats, 0 exception, permis obtenu). Rien sur un vrai iPhone. Avis du contrôleur sur le pouce : 7,5/10.
- Pas fait : fusion dans `qualite-appareil`, `cashcar-vNNN` (resté v1616), compilation. Décision en attente : CHAT POP-TART retiré sans remboursement dans l'édition App Store.

Compiler (Sacha, ou sur son oui), dans `~/cash-car/finition-build` : la recette de `NUIT-18-11.md` avec `origin/qa/tuto-finitions` à la place de `origin/qualite-appareil` et `CURRENT_PROJECT_VERSION=128`.

### Build 128 : COMPILÉ le 22/11 (oui de Sacha), PAS installé

`~/cash-car/ios-ultime-mesures/builds/build128.app`, depuis `373ee0b15` (`qa/tuto-finitions`, COMPLET=1, `&perfrec=2`). **À installer seulement sur le oui de Sacha** :
`xcrun devicectl device install app --device FE6F8B40-DCFF-5E04-B578-871A79EDCF17 ~/cash-car/ios-ultime-mesures/builds/build128.app`
