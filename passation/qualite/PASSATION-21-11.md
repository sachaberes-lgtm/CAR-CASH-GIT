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

### Build 128 : INSTALLÉ le 22/11 à 20h33 (oui de Sacha), par mise à jour, app non supprimée

`~/cash-car/ios-ultime-mesures/builds/build128.app`, depuis `373ee0b15` (`qa/tuto-finitions`, COMPLET=1, `&perfrec=2`). **À installer seulement sur le oui de Sacha** :
`xcrun devicectl device install app --device FE6F8B40-DCFF-5E04-B578-871A79EDCF17 ~/cash-car/ios-ultime-mesures/builds/build128.app`

## 22/11, nuit : gels téléphone brûlant (PAS commité, PAS compilé, rien sur le téléphone)

Sacha, après le build 128 : « la j'ai eu des gros gros freez des le debut […] c'est horible des gros freez et de la chauffe regle ca c'est pas du tout publiable ».

Diagnostic (vol `vol-1122-2042.json`) :
1. Son téléphone était à l'état thermique CRITIQUE avant de jouer, en mode économie : l'écran ne donne que 30 tops par seconde.
2. À critique le jeu visait une image toutes les 50 ms (`cadPer`, `code/moteur/cadence.js`). C'est régulier sur un écran à 60, pas sur un écran à 30.
3. Sur un écran à 30, 50 ms tombe entre deux tops : les images sortent à 33 / 66 ms en alternance.
4. Résultat sur son téléphone : 18,4 images par seconde, hachées, au lieu de 30 régulières (704 images à 33 ms pour 1468 entre 50 et 100 ms).
5. S'y ajoutent de gros gels isolés (140 à 670 ms : portail, pré-bâti, shaders). Ceux-là ne sont PAS traités.

Fait (fichiers modifiés, non commités ; `cashcar-vNNN` pas touché) :
- **Cadence** : `PIL_CAD` vrai par défaut (`code/moteur/pilote-qualite.js`) : à critique, sur un écran à 30, le jeu vise 33 ms. `?sans=pilcad33` rend les 50 ms. La garde de `cadPer` lit maintenant l'interrupteur `PIL_ON` et plus `pilOn()` : un téléphone hors profil gardait les 50 ms hachées. `?sans=pilote` rend toujours l'avant.
- **Barre de nitro figée à critique** : `body.hudBrule` (posée par `hudBruleTick`, `cadence.js`, en course quand `TEL_NATIF`, capteur, thermique ≥ 3), règle §8 de `code/css/interface-opti.css`, `animation-play-state` seulement. Seulement barre pleine, nitro lâché ; pas pendant le boost, ni « à sec », ni pendant l'éclat d'un gain. `?sans=hudbrule`, `dbgHudBrule(1|0|null)`. Photo : `photos/hudbrule-critique.png`.
- **HUD calme éteint de base**, code « uhd » dans RÉGLAGES (`?hudcalme=1` pour un banc) ; **Jade nuit et pluie hors tirage**. Les bancs qui supposaient le calme allumé ont reçu `&hudcalme=1` (`outils/banc-hud/calme-rien, calme-garde, sonde-calme, vie, leger, compteur` ; `outils/banc-pause/pause`).

Mesuré dans Chrome seulement (écran à 30 émulé en ne servant qu'un top sur deux, `dbgThermique(3)`, `?tel=1&app=1&eco=1&appareil=iPhone14,2`, courses de 60 s) :
- Avec la correction : 30,0 images/s, 1800 intervalles sur 1802 à 33 ms. Avec `?sans=pilcad33` : 17,3 images/s, 274 à 33 ms et 763 à 66 ms.
- Processeur bridé ×4 : 29,7 images/s (1729 à 33 ms, 47 à 50 ms) contre 17,9. Le pilote descend au cran 8 vers 40 s dans les deux cas (il vise 10 à critique) : la correction n'y change rien.
- Inchangé : thermique 2 (30 régulières) ; écran à 60 à critique (20 images/s régulières, 50 ms). Hors profil à critique sur écran à 30 : 17,7 avant la garde `PIL_ON`, 30,0 après.
- Barre figée (grotte, HUD calme éteint, fenêtres de 6 s alternées) : nitro lâché, ×4 : 12,0 → 8,1 ms de fil principal par image d'écran (−31 %) ; ×8 : 105 → 134 images en 6 s. Nitro tenu : aucun gain (rien n'y est figé). ⚠ Chrome sert les animations à 60 tops quand le jeu calcule 20 à 30 images : le gain ×4 est flatté ; le ×8 (une animation par image, comme sur le téléphone) est le plus honnête.
- Gardes démarrage, allégé, charte : OK. Partie 390×844 `?tel=1` de 40 s : 0 exception.
- `calme-rien.cjs` relancé : 14 contrôles bons, 2 faux (« rien ne se ramasse au calme », « aucune pièce ne vole ») : ces deux contrôles sont périmés depuis `0be027803` (le ramassage au calme a été rétabli), pas depuis ce soir ; ils échouent aussi avec `?sans=calmegarde`. Non corrigés.

Reste à faire :
- Lire un vol sur le vrai téléphone, critique + économie, après un build (sur le oui de Sacha) : rien de ceci n'a tourné sur un iPhone.
- Les gros gels isolés de 140 à 670 ms (portail, pré-bâti, shaders) : non traités.
- La barre figée peut s'arrêter au milieu du passage du reflet (un trait clair immobile) : à juger sur le téléphone.
- À la livraison : `cashcar-vNNN` +1, commit de `code/` et d'index.html ensemble.

- 23/11 : build 129 COMPILÉ depuis `3ac5364aa` (`--qs "&perfrec=2&sans=radiopause"`), copie `~/cash-car/ios-ultime-mesures/builds/build129.app`. PAS installé (attend le oui de Sacha).
- 23/11 17h36 : build 129 INSTALLÉ sur l'iPhone (oui de Sacha), app remplacée sans suppression. À lire après ses parties : `sh outils/banc-perf/lire-vol.sh`.

## 23/11 : parois du canyon

Sacha, après avoir joué : « la map canyon est toujour assez bugger sur les paroie et tout ». Il a dit oui à : les parois en pans décalés, le ciel sous la route penchée.

**Résultat : trois causes trouvées, AUCUN correctif posé.** `code/` est intact (diff vide). Aucun des trois ne se corrige en petit sans toucher au relief, aux triangles ou aux couleurs choisies le 17/11.

Méthode : un point de vue figé (`dbgCanyonVoute('vueS', s)`), le shader de la roche remplacé à chaud, une variante à la fois. Les crochets d'essai ont été retirés. `?tel=1&palier=2`, 390×844 et 844×390.

**A. Pans décalés, rectangles sombres** (graine 12 s 1001 et 1703, graine 2 s 9358 et 10483, graine 25 nuit s 1282)
- Cause : ce n'est pas la lecture des strates. Des bandes tracées sur la SEULE hauteur du monde (ni texture, ni bruit, ni normale, ni case, ni ombre) cassent aux mêmes endroits, du même décalage. Les strates sont bien horizontales et au même repère partout (rochers posés et plan des murs sont dans la même grille de hauteur, même shader). Ce qui saute, c'est la paroi : à 85°, chaque case du relief est un pan de 8 à 16 m de large pour ~100 m de haut, tourné autrement que son voisin et qui le masque en partie. Vus de près, d'en bas, caméra penchée, des lits horizontaux sortent décalés d'un pan à l'autre.
- Écartés, un par un, image inchangée : l'ombre par sommet (ces vues sont entièrement à l'ombre, `lit` = 0 partout), `?sans=cyombre`, la normale dans le mélange des plans, la case des gros pixels, le gondolage des lits, le texel fin à 6 m au lieu de 12.
- La grille : à 32 et 64 les pans changent de forme (à 16 un morceau de paroi manque à s 1703, on voit le ciel), le décalage reste.
- Rectangles sombres : deux lits de la colonne (ardoise foncé, brun foncé). À l'ombre ils sortent à 20-55 sur 255 contre ~150 pour le grès voisin. Restent aussi des pans sombres avec des lits unis : l'éclairage selon la normale du pan.
- Photos : `photos/canyon-parois/8-…`, `9-…`, `10-…`, `11-…`.
- Laissé : (1) adoucir la paroi demande un relief plus fin ou filtré au loin (triangles ou textures en plus, à mesurer) ; (2) remonter les deux lits sombres est un choix de couleur, à Sacha.

**B. Ciel sous la route penchée** (graine 12, s 3900-4050, caméra de course)
- C'est la dalle couchée sans roche derrière, dans la pièce `boucle` (s 3144-4608). Mesuré tous les 10 m : roche à 6-12 m sous la dalle de s 3810 à 3900 (roulis 83° → 60°), puis plus rien à moins de 99 m de s 3920 à 4120 (roulis 54° → 1°), sol 160 à 190 m plus bas.
- Deux mécanismes : le plan de roche recule de (1 − mu)² × 700 m sous 66° de roulis (`cyProfil`) ; et ici il manque même quand on le rapproche.
- Essai (retiré) : plan ramené à la dalle dès ~43° de roulis. Sur ce passage la roche n'arrive que sous UN bord (12 m), centre et autre bord toujours vides, image de course identique. Hypothèse non prouvée : la taille fine garde le profil le plus BAS des deux bras de route voisins (`if(prof.C<best)`), ce qui efface le plan près de l'autre bras de la boucle.
- Compte sur 10 graines (1-10, points tous les 8 m, roulis > 30°, hors tubes, vide > 24 m sous le centre ou un bord) : 109 passages, 7 à 14 par graine. 77 sont des rampes d'entrée ou de sortie de dévers (30-62°, ~96 m), 14 des fonds de boucle ou grands murs (jusqu'à 86°, 250-520 m), 18 des dévers faibles (30-35°). Par roulis : 30-49° 100 % sans roche, 50-59° 85 %, 60-89° 18 %.
- Photo : `12-…`. Laissé : c'est une reprise du relief (loi du plan + règle des deux bras), avec risque sur la règle d'or et les vols.

**C. Roche en longues bandes le long de la route penchée** (graine 12, s 3837)
- Pas une projection dans le mauvais axe. Les bandes de hauteur pure donnent les mêmes rayures. La dalle est à 77° sur un plan de roche lisse, exactement parallèle à elle, et la caméra roule avec la dalle : des lits horizontaux y courent le long de la route et montent à l'écran.
- Photo : `13-…`. Laissé : casser le plan par du relief, ou baisser le contraste des lits sur ce plan (choix de couleur).

Contrôles (code inchangé, index.html réassemblé depuis les morceaux) : gardes démarrage, allégé, charte OK. Course canyon complète graine 12 en 390×844 et graine 2 en 844×390 : arrivée, pas de mort, pas d'exception. Mer de nuages 45 s : 0 exception.

Non vérifié : `lot.mjs` et `cout.mjs` non relancés (aucun correctif) ; rien sur le vrai iPhone ; A vu sur trois graines seulement ; la partie « nuages » a été lancée par `carte=nuages` sans relire le nom de la carte dans la page.

### 23/11 (suite) : les lits sombres adoucis — POSÉ (Sacha : « Oui, adoucis »)

Sacha a vu la planche 11 et a répondu « Oui, adoucis » à « J'adoucis les bandes sombres de la roche du canyon ? (les garder, mais moins foncées) ». Cela traite la partie « rectangles sombres » de A. Les pans eux-mêmes (le relief), B et C ne sont pas touchés.

- **Quoi** : `code/maps/canyon-route.js`, section « LES LITS SOMBRES ADOUCIS », une passe en fin de `cyStratesDonnees`. Un lit plus sombre que le seuil (80 % de la clarté moyenne des grès massifs de la colonne) fait `CY_DOUX` du chemin vers la clarté des grès, plafonné au seuil ; les trois octets sont multipliés par le même facteur (la teinte reste). Grès et lits clairs : inchangés.
- **Interrupteurs** : `?sans=cydoux` (ou `?cydoux=0`) = la colonne d'avant, à l'octet près (la passe ne s'exécute pas) ; `?cydoux=0..1` = la force. Défaut : **0,5**.
- **Vaut pour** les cinq palettes tirées par graine et les pistes A, B, C et 0 (même fonction). Dans la texture (clarté 0-255), lit le plus foncé : piste A 90-95 → 142-148 ; piste 0 99-105 → 148-155 ; B 96-101 → 148-154 ; C 86-91 → 132-138. Teinte du lit : écart ≤ 1,4° (4,6° sur un lit presque gris de la palette « peint », arrondi des octets).
- **Pourquoi 0,5** (essais 0,4 / 0,5 / 0,6, planches `doux-2`, `doux-3`) : à 0,4 les rectangles noirs de g12 s 1001 restent bien visibles (écart lit/grès 65 → 47) ; à 0,6 le lit disparaît la nuit (écart 25 → 0) et les parois « sedona » de la graine 2 deviennent rouge presque uni. 0,5 est entre les deux : l'écart tombe d'environ la moitié.
- **Mesuré à l'image** (`?tel=1`, vues figées `vueS`, clarté de l'écran 0-255 ; lit foncé = pixels que la force 0,6 éclaircit de plus de 12, grès voisin = anneau de 15 px autour) :

| vue | lit foncé avant → après | grès voisin | écart avant → après |
|---|---|---|---|
| g12 matin s 1001 (ombre, portrait) | 55 → 81 | 120 | 65 → 40 |
| g12 matin s 1703 (ombre, portrait) | 57 → 88 | 121 | 64 → 32 |
| g2 matin s 9358 (paysage) | 47 → 79 | 101 | 53 → 22 |
| g2 matin s 10483 (paysage) | 39 → 66 | 92 | 52 → 26 |
| g25 nuit s 1282 | 57 → 77 | 82 | 25 → 6 |
| g3 matin s 600, paroi éclairée (cadre de gauche) | 62 → 98 | 136 | 74 → 38 |
| g12 soir s 1001 / s 1703 | 48 → 74 / 51 → 83 | 89 / 91 | 41 → 16 / 40 → 8 |
| g12 pluie s 1001 / s 1703 | 41 → 59 / 71 → 91 | 101 / 111 | 60 → 42 / 40 → 20 |
| g12 orage s 1001 / s 1703 | 102 → 130 / 99 → 126 | 155 | 53 → 26 / 55 → 29 |
| g2 nuit s 9358 / s 10483 | 24 → 43 / 25 → 42 | 64 / 56 | 40 → 22 / 31 → 15 |

- **Dérive d'ensemble des parois** (moyenne de la zone de roche du cadre, matin) : clarté +2 à +7 sur 255, teinte −0,1 à −2,0°, saturation +0,006 à +0,03. **Le pire : g3 s 600** (un lit brun couvre 19 % de l'image) : clarté 95,7 → 107,9 le matin, 80,7 → 92,9 le soir, saturation 0,61 → 0,65 ; le grand pan brun foncé devient rouge brique. Pixels saturés (> 250) : inchangés à ±0,1 point. Rien de délavé ni de fluo sur matin, soir, nuit, pluie, orage (`doux-4`).
- **g12 s 3837 (C)** : image inchangée, la bande grise y est le lit ardoise, plus clair que le seuil.
- **Coût** (`cout.mjs`, graines 3 et 12, avant ×3, après ×2) : appels identiques (g12 943 = 943 ; g3 957 = 957, un premier passage « avant » à 1013), programmes 149 / 148, textures 124, relief 32 256 / 25 600 triangles : identiques. **Une différence : la façade du tunnel perd 280 triangles** (g12 : 8 262 → 7 982 ; même écart sur le total du décor de g3) : elle découpe ses tranches là où la couleur du lit change, et il y a moins de sauts. Aucun triangle en plus. `canyon-relief.js` (le shader) n'est pas modifié : ce sont des octets de la texture 1×1024.
- **Contrôles** : `assembler --depuis-morceaux` puis `--verifier` OK ; gardes démarrage, allégé, charte OK. Course canyon complète graine 12 en 390×844 `?tel=1` : arrivée au portail en 114 s, pas de mort, aucun décor apparu, 0 exception. Autre map (`carte=ville`, 45 s, `dbgCanyon().on` = false relu dans la page) : 0 exception, 0 erreur au mouchard.
- **Planches** (`photos/canyon-parois/`) : `doux-1-POUR-SACHA-…` (gauche avant, droite après, quatre vues), `doux-2-forces-…`, `doux-3-paysage-forces-…`, `doux-4-meteos-…`.
- **Non vérifié** : rien sur le vrai iPhone ; `lot.mjs` non relancé (seules des couleurs changent) ; pistes B, C, 0 et palettes zion / bryce mesurées dans la colonne seulement, pas photographiées (photos : classique, sedona, peint, piste A) ; midi non photographié (`meteo=midi` a donné une autre météo au banc) ; `palier=2` n'a pas été passé dans l'URL (le pilote met `?tel=1` seul) ; l'intérieur du tunnel et de la voûte lisent la même colonne, donc adoucis aussi, pas photographiés ; le verrou a été pris par le pilote sous son nom « canyon-final », pas « canyon-doux ». Rien de committé, `sw.js` non touché.

### 23/11 : quatre voitures retirées (Sacha : « enlève les voiture : baroudeur, dolce vita, caid, zagaie »)

Rien n'est committé ni poussé. `sw.js` n'est pas touché (le `cashcar-vNNN` +1 reste à faire à la livraison). `app-ios/www` n'est pas régénéré.

- **Lesquelles** (index comptés dans `CARS`, vérifiés par le banc ; la consigne du lot disait 79 / 81 / 87, les commentaires du fichier avaient raison) :

| N° | Voiture | Avant | Rendu à qui l'avait achetée |
|---|---|---|---|
| 2 | LE CAÏD | rare, 600 000 $ | 600 000 $ |
| 80 | LA DOLCE VITA | commune, 30 000 $ | 30 000 $ |
| 82 | LE BAROUDEUR | commune, 80 000 $ | 80 000 $ |
| 88 | LA ZAGAIE | épique, 3 500 000 $ | 3 500 000 $ |

- **Comment** : la règle du 18/11, sans rien inventer. `code/voitures/cars.js` : `{retire:1,name:'…'}` au même index (91 lignes, aucune n'a glissé). `code/voitures/deblocage.js` : les quatre prix restent, avec le commentaire daté. `SAVE.san` (inchangé) sort la caisse de `owned`, rend le prix une seule fois, remet LA HONTE à qui roulait avec, et le menu dit « LE CAÏD QUITTE LE GARAGE : 600 k REMBOURSÉS ». Les habillages posés restent.
- **Aucune ne se gagnait par mission ni par contrat, aucune ne se vendait en euros** : pas de mission à passer à l'argent, rien à toucher dans `produits.csv` / `Produits.storekit` / App Store Connect.
- **Inventaire** (grep par nom, par gabarit `caid` / `cinq` / `wrangler` / `zagato`, par index en dur) : tout le reste du jeu lit `carRetiree` / `carEnVente` / `carPrice` et suit tout seul — garage (`rarListe`), boutique du garage et sa page « tout », boutique du jour (`bqCles`, `bqValide` : une vitrine gardée qui citait une des quatre est retirée), machine à sous et série de sept jours (`spinEpiqueOk` : LA ZAGAIE en sortait), pub maison (`pubCaisse`), inventaire, plaque, missions de collection (seuils recalculés), `ecoDebutPrix`, code cousin, vieux plancher `ex.floor`. Aucune préchauffe ne citait leurs dessins. Seul index en dur : `gameplay/mort.js` (`signatureBoom`, le téléphone du CAÏD à `lvl===2`), qui ne se déclenche plus ; un commentaire daté, pas de code changé.
- **Dessins gardés** (`voitures/caid.js`, `shapes-1.js`, `rondes-2.js`, `wrangler.js`, `zagato.js`) : la fin de `SHAPES.wrangler` est dans `simpson.js`, ACIDE reprend la forme de LA ZAGAIE, `travail-caisse.js` sert au LOUP, `buildcar.js` teste `shape==='wrangler'`. Les traductions des quatre noms restent (le message de remboursement les lit).
- **Preuves** :
  - `node outils/banc-voitures-tri/banc.cjs` : **297 vérifications, 0 en échec** (les 188 d'avant + 109). Section 5 : fiches réduites, prix gardés, ni vitrine ni tirage ni mission ; sauvegardes d'essai pour chacune (achetée, équipée + habillée, équipée sans la posséder), aucune des quatre, deux (630 000 $, un seul message, deux noms), les quatre (4 210 000 $), avec deux retirées du 18/11, nouveau joueur, vieux plancher + code cousin, rechargement sans second remboursement. Contre-épreuve : un prix faussé (30 001) fait tomber 7 vérifications.
  - `outils/banc-voitures-tri/page-23-11.cjs` (Chrome sans fenêtre, muet, 390×844, `?tel=1`, sous le verrou) : **tout vert, 0 exception, 0 erreur console**. Compte neuf : garage feuilleté à la flèche, 42 caisses, aucune des quatre, aucune carte sans nom, aucun doublon ; vitrine du jour 8 cartes sans prix cassé ; page « tout » 26 cases, aucune vide ; page ACHAT sans elles ; 30 s de course. Joueur qui roulait en CAÏD : arrive en LA HONTE, 601 000 $ en banque, message « LE CAID QUITTE LE GARAGE : 600 k REMBOURSES » vu à l'écran, LA HONTE au garage, 30 s de course, sauvegarde toujours juste après.
  - `assembler --depuis-morceaux` OK (351 morceaux) ; gardes démarrage, allégé, charte OK.
- **Points délicats, à trancher par Sacha** :
  1. **Le trou du début de partie.** Ce qui s'achète à l'argent du jeu, du moins cher au plus cher, est maintenant : LE TAXI JAUNE 2 500 $, puis ELDORADO 500 000 $ (×200), LE CHARGEUR 69 700 000, LA LAME 800 000… Avant, LA DOLCE VITA (30 000) et LE BAROUDEUR (80 000) faisaient les marches. La famille COMMUNE du garage n'a plus que LA HONTE, LE TAXI JAUNE et LE COMBI (secret). Rien n'est cassé (le jeu propose toujours une caisse suivante), mais la deuxième caisse est loin. Je n'ai touché à aucun prix.
  2. **Le remboursement au prix d'aujourd'hui.** `SAVE.san` rend le prix de `CAR_UNLOCK`. LE CAÏD coûtait 60 000 $ avant le « ×10 » du 25/10 : qui l'a payé 60 000 reçoit 600 000. C'est la règle des retraits d'avant (une mise à jour se trompe du bon côté) ; la sauvegarde ne garde pas le prix payé.
  3. **LA ZAGAIE gagnée.** Elle pouvait sortir de la machine à sous (le 7) ou de la série de sept jours. La sauvegarde ne dit pas comment une caisse est venue : qui l'a gagnée ainsi reçoit aussi 3 500 000 $. Même cas que LA PERLE le 18/11.
  4. **Le record de fortune** (`bankMax`) est calculé dans `san` avant le remboursement : il est en retard d'un chargement sur la banque (il se recale au lancement suivant, ou au premier gain). C'était déjà vrai des retraits d'avant ; pas touché.
- **Non vérifié** : rien sur un vrai iPhone ni dans l'app ; aucune photo prise (disque plein) ; l'écran de fin, la machine à sous, la série de sept jours et la pub maison n'ont pas été ouverts dans Chrome (prouvés par le relevé `dbgDefisPossibles` et par le banc Node) ; l'ordinateur (hors `?tel=1`) n'a pas été passé ; `outils/defis-possibles/juge.cjs` et les autres bancs de `outils/` n'ont pas été relancés ; ROBLOX n'est pas concerné.
- 23/11 : build 130 COMPILÉ depuis `ac9df8a14` (canyon adouci, quatre voitures retirées ; `--qs "&perfrec=2&sans=radiopause"`), copie `~/cash-car/ios-ultime-mesures/builds/build130.app` (la copie du build 128 effacée, disque plein). PAS installé (attend le oui de Sacha).
