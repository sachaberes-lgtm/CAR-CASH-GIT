# Lot 1 « LANCEMENT : mesurer et script en fichier » (2026-11-15, branche qa/lancement)

## Fait
1. **Script du jeu en fichier par défaut** (`--jeu-fichier`) :
   - `app-ios/package.json` : `sync` (donc `archiver.sh`, qui appelle `npm run sync`) et `essai` (`--jeu-fichier --essai`, dans cet ordre pour que `npm run essai -- "<dossier>"` marche encore) ;
   - `app-ios/publier-maj.js` : les mises à jour en direct aussi (sinon une maj remettait le script en ligne).
   - Retrait : ôter l'option à ces deux endroits.
2. **Ligne `chargement` complète** (`code/moteur/intro-161.js`, lecture seule) : au « prêt », la ligne d'avant, puis
   `· libérés : chauffe-intro 5.4, etapes 6.9, lier 7.6, chauffe 10.1, tôles 10.3, depart-avance 10.7 · programmes 161 · dense 69 images, 104 pas, 9 tôles, 2622 ms · éco 0 · thermique 0 · branché non`.
   - « libérés » : seulement les étapes qui ont retenu le film, avec l'instant (s) où elles se sont libérées. **La dernière = le chantier suivant.**
   - branché : `non` / `en charge` / `plein` / `?` (hors de l'app) ; thermique 0-3 ; éco 0/1.
3. **Banque de sons tardive, app seulement** (`VERSION PRINCIPALE/sfx.js`) : dans l'app (Capacitor natif), `sons-banque-2.js` part 1,2 s après `cc:revele`, ou au 1er toucher du menu, ou à une course relancée (`debutCourse`), filet 45 s après load. Le site garde sa ligne `setTimeout(function(){go(0);},500)` telle quelle (le nouveau code est AVANT, et ne s'allume que si Capacitor natif). Interrupteurs : `?sans=banquetard` (comme avant, dans l'app aussi), `?banquetard=1` (forcer au banc).

## Vérifié
- `node code/assembler.cjs --depuis-morceaux` + `outils/garde-demarrage.cjs` : OK ; `node --check sfx.js` OK ; index.html remis (`git checkout`).
- `COMPLET=1 node app-ios/preparer-www.js --essai --jeu-fichier --qs "&perfrec=2" --maj http://127.0.0.1:1/` : réussi, `jeu.<empreinte>.js` (6,05 Mo) + `index.html` 1,0 Mo, preload dans la tête, relecture garde-demarrage passée, `qs.json` et `var QS="&perfrec=2"` dans natif.js (le QS cuit et `CC_QS` passent par natif.js, chargé avant le jeu : inchangé).
- Banc `lancement.cjs --cpu 4` (copie dans le scratchpad avec un relevé en plus, ports 9851/9852, muet, verrou pris puis rendu, Chrome fermé) :
  - sur le www de l'app (script en fichier, allégé) : 0 erreur, la nouvelle ligne apparaît, banque 2 chargée à 28,4 s pour un menu à 27,1 s ;
  - sur une copie de VERSION PRINCIPALE à banque scindée, `?banquetard=1`, JOUER envoyé dès le menu (24,6 s) : banque 2 à 26,3 s, course en route à 28,4 s (banque là avant la course), `CCSON.etat()` : perdus 0, tardifs 0 ;
  - même copie SANS interrupteur (= le site) : banque 2 à 6,8 s, sous le serpent, comme avant.
- Mises à jour en direct : natif.js ne donne le feu vert à Capgo (`notifyAppReady`) qu'après `__gameReady` ; si `jeu.*.js` ne se chargeait pas dans une maj, retour seul à la version d'avant (60 s) et la version est refusée ensuite. Risque borné, donc gardé par défaut.

## Non vérifié / à savoir
- ⚠ **La fabrication de l'édition App Store échoue aujourd'hui sur la branche, sans rapport avec ce lot** : `preparer-www.js` ne trouve plus `function cousinTout(){try{return !!SAVE.d.cousin;}…}` (réécrite par b241a7d51 dans `code/economie/aura-banque-contrats.js`). Donc `npm run sync`, `archiver.sh`, `publier-maj.js` ET `vercel-build.sh` (ligne 23, l'essai de l'app) s'arrêtent. À corriger dans `preparer-www.js` (hors de mon lot). Mes essais ont donc tourné en `COMPLET=1` (coupes sautées).
- **compiler.sh** (`~/cash-car/ios-ultime-mesures`) appelle `preparer-www.js` directement, pas `npm run sync` : il ne prend PAS le script en fichier. Pour le build de mesure, ajouter `--jeu-fichier` à sa ligne `COMPLET=1 node preparer-www.js …` (fichier hors du dépôt, pas touché). Il fabrique aussi depuis `~/cash-car/finition-build`, pas depuis cette branche.
- Le son au banc est coupé (règle) : `perdus` = 0 ne prouve pas qu'on entend tout ; ce qui est prouvé, c'est que la banque est là avant la course.
- Rien vu sur iPhone ; pas de build, pas de simulateur.

## À mesurer sur le 13 Pro
1. Build avec `--jeu-fichier` : ligne `chargement | jeu fichier · origine→DCL …` (natif.js) au 2e lancement, contre le build d'avant.
2. Ligne `chargement | mode 1 · prêt en …` : 3 lancements à chaud + 3 à froid, débranché nominal, puis branché en éco (`outils/banc-perf/boite-noire.sh`). Lire la dernière étape de « libérés ».
3. Une course lancée tout de suite au menu : les sons de course sont là (sinon `?sans=banquetard`).
4. Une mise à jour en direct d'essai (`publier-maj.js --local`) avant la vraie : `jeu.*.js` téléchargé, le jeu démarre.
