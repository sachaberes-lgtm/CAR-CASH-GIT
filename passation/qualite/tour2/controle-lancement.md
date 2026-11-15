CONTRÔLE ADVERSE — lot 1 « LANCEMENT » (qa/lancement, 1ef728014, worktree ~/cash-car/qualite-lancement, lu sans rien modifier)

**Verdict : fusionnable.** Il reste deux points à suivre (D1, D2) et un défaut sérieux qui existait déjà avant ce lot, hors de son périmètre (S1). Celui-là bloque la fusion de qualite-appareil vers main, pas la fusion de ce lot.

Le diff réel (`git diff qualite-appareil...HEAD`) porte sur 5 fichiers : `app-ios/package.json`, `app-ios/publier-maj.js`, `code/moteur/intro-161.js`, `VERSION PRINCIPALE/sfx.js` et `passation/qualite/lancement.md`. Ce sont exactement les fichiers du lot (PLAN.md §3, lot 1) plus le rapport. Aucun fichier interdit n'est touché (maps, prebati, route-sans-haut, economie, boutique). `index.html` et `sw.js` ne sont pas committés, et l'arbre de travail est propre.

**Ce que j'ai vérifié dans le code**
- **`package.json`**
  - `sync` passe `--jeu-fichier`, et `archiver.sh:14` passe bien par `npm run sync`.
  - `essai` : avec `--jeu-fichier --essai`, `npm run essai -- "<dir>"` donne toujours le dossier à `--essai` (preparer-www.js:26 lit argv[iE+1]). C'est correct.
  - `www` reste sans l'option, ce qui est sans conséquence.
- **`publier-maj.js:46`**
  - L'option est ajoutée en fin d'arguments, sans conflit avec `--essai`/`--sortie`/`--maj`.
  - Le manifeste est fait de toutes les empreintes des fichiers de TMP (l.77-81) : `jeu.<sha>.js` y entre.
  - Le filet de Capgo est bien celui annoncé : natif.js:313-315 ne fait `notifyAppReady` qu'après `__gameReady`, avec `appReadyTimeout` 60000 et `autoDeleteFailed` true (capacitor.config.json:35-36).
  - natif.js:333 sait déjà reconnaître `script[src*="jeu."]` dans sa ligne CHARGEMENT.
- **preparer-www.js:324-330** : `--jeu-fichier` passe après toutes les coupes. La page est relue par garde-demarrage, puis les contrôles PUB/AD et marques lisent aussi `jeu.*.js`. L'outil publie-script-externe.cjs garde le script en ligne au moindre doute. Le risque est bien faible.
- **`intro-161.js`**
  - `INTRO_ORDRE` reprend exactement, et dans le même ordre, les `return` de `introPrete` (chauffe-intro, etapes, lier, chauffe, tôles, depart-avance, photos, lit, coup-appui).
  - Chaque lecture est dans un try. `DENSE` (vignette-moteur.js:423) et `renderer` sont dans le même script assemblé.
  - Les globales `__ccEco` / `__ccThermique` / `__ccBranche` sont bien celles du jeu (gouverneur-paliers.js:141, profil-juge.js:134).
  - Rien ne change dans le jeu : le changement ne fait que lire.
- **`sfx.js`**
  - `S.debutCourse` existe avant l'appel de `suite()` (définie l.140, appelée l.144), donc le wrapper `dc.apply` est sûr. `suite()` n'est appelée qu'une fois.
  - Le `return` saute bien l'ancienne ligne `lance`.
  - `cc:revele` existe (intro-161.js:768, init.js:347, et il est rejoué par aura-banque-contrats.js:224) : le `{once:true}` évite un double déclenchement, et le verrou `parti` aussi.
  - Le site n'est pas touché : sans `Capacitor.isNativePlatform` et sans `?banquetard=1`, c'est l'ancienne ligne.
  - `?sans=banquetard` remet l'ancien comportement dans l'app.
  - `sfx.js?v=15` n'a pas changé (code/page/bibliotheques.html:18). C'est l'usage : les commits b05020d12 et 4c1a224f9 ne l'avaient pas changé non plus, et c'est `sw.js` qui purge à la publication.

**Défaut sérieux, déjà là avant ce lot et hors de son périmètre**
- **S1** — confirmé. `app-ios/preparer-www.js:190` cherche toujours `function cousinTout(){try{return !!SAVE.d.cousin;}…`. Or b241a7d51 a réécrit cette fonction en `code/economie/aura-banque-contrats.js:95` (garde `window.ccAchat` ajoutée).
  - Conséquence : `une()` arrête la fabrication, donc `npm run sync`, `archiver.sh`, `publier-maj.js` et `vercel-build.sh:23` (essai de l'app pendant le build du site, sauf avec `GARDE_APP=0`) échouent tous sur qualite-appareil.
  - b241a7d51 n'est **pas** sur origin/main : il n'est que sur qualite-appareil et qa/lancement. Main et Vercel ne sont donc pas cassés aujourd'hui, mais il faut corriger la coupe avant toute fusion de qualite-appareil vers main.
  - La nouvelle `cousinTout()` rend déjà false dans l'app. On peut donc changer la cible de la coupe ou la retirer, mais c'est au propriétaire de preparer-www.js et d'economie de décider.

**Défauts mineurs et doutes**
- **D1** — `sfx.js` (le bloc ajouté après la l.152, `addEventListener('pointerdown',tot,…)`). Le 1er toucher du menu lance l'analyse des ~6 Mo de `sons-banque-2.js` et le passage de ses sons dans la file de décodage au moment même où JOUER est tapé, donc au départ de la course.
  - Au banc (Chrome, `--cpu 4`, localhost), on a mesuré : banque à 26,3 s, en route à 28,4 s, 0 perdu. Sur le 13 Pro (WebKit, sans requestIdleCallback), c'est plausiblement une saccade de 100-300 ms au départ, et des sons de la banque 2 qui se taisent dans les premières secondes. Le plan demandait « à cc:revele », sans parler du toucher.
  - À ajouter aux mesures sur le téléphone : la pire image des 3 premières secondes de course, JOUER tapé tout de suite, avec et sans `?sans=banquetard`.
  - « perdus 0 » ne vaut qu'au banc, son coupé, comme l'agent le dit lui-même.
- **D2** — `intro-161.js` (`introLibere`, `introDetail`).
  - Une étape libérée qui retient de nouveau le film plus tard garde son 1er instant de libération : « libérés » peut sous-dater la dernière vraie libération.
  - Au PLAFOND, l'étape qui bloque encore n'apparaît pas dans « libérés ». Elle est donnée par « manque », ce qui suffit.
  - `__ccEco` et `__ccThermique` peuvent encore valoir « ? » si le plugin natif répond après « prêt ». C'est peu probable vers 10 s.
- **D3** — `~/cash-car/ios-ultime-mesures/compiler.sh:6` (`COMPLET=1 node preparer-www.js --maj http://127.0.0.1:1/ --qs "$QS"`) n'a pas `--jeu-fichier`. C'est confirmé, comme l'agent l'a signalé : les builds de mesure ne mesureront pas le script en fichier tant qu'on ne l'ajoute pas. C'est hors du dépôt.
- **Doute** — le gain annoncé (935 → 660-694 ms au DCL) vient du build 17 (PASSE3-P4.md). Rien n'est re-mesuré sur le téléphone dans ce lot.
  - preparer-www.js:323 disait « à garder dans l'app seulement si la mesure le justifie ». Le passage par défaut repose donc sur une mesure ancienne. Le risque est faible, mais la 4e mesure de l'agent (`publier-maj.js --local`, puis le jeu démarre) est indispensable avant la 1re vraie mise à jour en direct.
- Le lot « programmes » n'est pas dans ce diff : il n'y a pas de jumeaux à vérifier ici.

**Affirmations de l'agent sans preuve dans le dépôt** : les chiffres du banc (27,1 / 24,6 / 6,8 s). Je ne les ai pas rejoués : contrôle en lecture seule, sans navigateur. Ils sont cohérents avec le code lu.

**VERDICT : FUSIONNABLE dans qualite-appareil.** S1 est à corriger par le propriétaire de preparer-www.js et d'economie avant toute fusion vers main. D1 et D3 sont à traiter avec les mesures sur le 13 Pro.