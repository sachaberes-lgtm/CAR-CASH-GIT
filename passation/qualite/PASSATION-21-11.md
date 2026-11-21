# Passation du chantier « qualité par appareil » — 21/11/2026, 20h45

Pour la session qui reprend. Le journal complet, lot par lot, est dans `passation/qualite/NUIT-18-11.md` (lire les dernières sections). Ce fichier-ci dit seulement où on en est et quoi faire ensuite.

## Règles de Sacha (inchangées)

- iPhone seulement (13 Pro, app Capacitor). Rien sur `main` sans son oui. **Aucun build installé sans son oui explicite.** Ne jamais supprimer l'app (sa sauvegarde est dedans).
- Fluidité d'abord, puis qualité. La netteté de la voiture baisse en dernier. Le jeu doit tenir branché + mode économie + chaud.
- Messages courts, en français, sans jargon, finis par une liste numérotée de tests.
- Il surveille sa consommation : peu d'agents, un lot à la fois. Il a dit le 21/11 : « lance pas de nouveau truc ».
- Il demande souvent « pause » puis « reprends » / « go » : arrêter les workflows (TaskStop), les relancer par `Workflow({scriptPath, resumeFromRunId})`.

## Où on en est

- **Sur le téléphone** : build 126 (commit `a260ce85c`), installé le 21/11 à 15h01.
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
