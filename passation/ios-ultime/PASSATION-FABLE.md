# PASSATION — chantier ios-ultime (13/11/2026, 3 h)

Pour la session qui reprend. Écrite par la session Fable qui a tenu le chantier du 12/11 midi au 13/11 3 h.
À lire avec : `CLAUDE.md` (la carte du code), `passation/ios-ultime/PLAN-ULTIME.md` (le journal complet, tout est daté ; les sections du 12/11 soir et du 13/11 suffisent), la mémoire `chantier-ios-ultime`.

## 0. Ta mission (Sacha, 13/11 3 h) : LES FONDAMENTAUX

Sacha ne veut pas une session de plus qui fait tourner des tests et pose des rustines. Il veut « un modèle puissant qui va vraiment dans les fondamentaux pour trouver des vrais leviers ».
Ce que j'ai fait jusqu'ici est surtout RÉACTIF : il joue, ça lague, je lis la boîte, je coupe quelque chose (une vingtaine de builds). Ça a réglé des symptômes (canyon, portail, musique) mais le fond n'a pas bougé : **le téléphone passe « serious » en une à trois minutes de jeu et y reste toute la soirée, et à cet état tout se dégrade.** Personne n'a encore répondu à la seule question qui compte : *d'où vient la chaleur, en watts, et par quel composant ?*

Ce qu'on sait vraiment (mesuré) :
- À 30 i/s, à vitesse normale, le script ne travaille que ~4 ms par image ; le « vrai coût » d'une image (barrière de la puce graphique) est de 13 à 37 ms. La puce graphique semble donc dominer — mais c'est une déduction, pas une mesure de puissance.
- À 60 i/s une course passe de nominal à serious en ~1 min ; calée sur 30 dès le départ elle tient plusieurs minutes.
- Le coût du calcul par image grandit avec la vitesse (génération par mètre), et la grotte se creuse en 8 à 21 s.
- L'écran reçoit 75 à 120 rappels d'image par seconde (ProMotion) alors qu'on n'en calcule que 30.
- La mémoire du processus web monte à 1,25-1,33 Go.

Ce qu'on NE sait PAS, et qui serait un vrai point de départ :
1. **La répartition réelle de l'énergie** sur l'appareil : processeur du contenu web, processus GPU de WebKit, puce graphique, écran, audio, radio. Outils jamais utilisés ici : Instruments sur l'iPhone branché (`xcrun xctrace record` avec les modèles « Game Performance », « Energy Log », « Time Profiler » ciblant l'app et ses processus WebContent/GPU), `pymobiledevice3` (la mémoire `iphone-budget-thermique` dit comment lire le budget thermique par le journal système). Tant que ce chiffre manque, on optimise à l'aveugle.
2. **Le plafond structurel** : un jeu three.js (r128, minifié dans `vendor/`) dans une WKWebView. Quels coûts sont dus à l'architecture plutôt qu'au contenu ? Pistes de fond à instruire, pas à supposer : la chaîne de post-traitement et sa résolution (combien de passes plein écran, à quelle taille) ; le rendu à 120 Hz du compositeur alors qu'on dessine à 30 (regarder `CADisableMinimumFrameDurationOnPhone` dans `Info.plist` et ce que WebKit fait d'une toile qui ne change pas) ; le nombre de programmes (182 à 236) et de matières distinctes ; les ombres ; les textures flottantes ; la synthèse sonore en WebAudio temps réel (tampon de 128 échantillons) face à des sons pré-rendus ; ce qui pourrait quitter le fil principal (génération de piste, creusement) ou être précalculé une fois pour toutes ; ce qu'une version plus récente de three.js ou un rendu dans un travailleur changerait.
3. **Le budget** : fixer un objectif chiffré (par exemple « 15 min de jeu sans quitter l'état fair, débranché ») et en déduire un budget par image pour le script et pour la puce, puis voir ce qui ne rentre pas — au lieu de couper au hasard.

**Ne me crois pas sur parole.** Sacha veut des failles que je n'ai pas vues : pars du principe que mes conclusions sont des hypothèses. Celles que je n'ai jamais prouvées et qui pourraient être fausses :
- « c'est la puce graphique qui chauffe » (déduit du vrai coût d'une image, jamais mesuré en puissance) ;
- « le temps de travail du script gonfle parce que les appels WebGL attendent la puce » (explication du canyon : plausible, non vérifiée) ;
- « la première minute à 60 i/s fait basculer le téléphone » (deux parties seulement, téléphone branché) ;
- « le téléphone était chaud à cause de la charge par le câble » (jamais séparé du jeu : aucune partie débranchée et froide n'a été lue) ;
- « la mémoire est stable » (je n'ai lu que des compteurs de textures et de géométries, jamais l'empreinte réelle du processus) ;
- le 12/11 j'ai attribué à la chaleur seule des ralentissements qui venaient aussi du canyon puis de la vitesse : je me suis trompé deux fois sur la cause avant que Sacha me corrige.
Si tu as le mode multi-agents, sers-t'en pour CONTREDIRE : plusieurs relecteurs indépendants qui cherchent à réfuter chaque hypothèse, pas plusieurs exécutants qui la confirment.

Ce que j'attends de toi : d'abord COMPRENDRE et MESURER au bon niveau, écrire un diagnostic de fond (où part l'énergie, quels sont les 3 à 5 leviers structurels, ce que chacun rapporterait, ce qu'il coûte et ce qu'il risque), le montrer à Sacha, puis seulement exécuter. Un levier de fond qui change l'allure du jeu ou son architecture se décide avec lui.
Avant cela, deux choses terre à terre ne peuvent pas attendre : la régression du § 2 (son téléphone gèle à l'accueil) et la question du build 81.

## 1. Le but et les règles de Sacha

Rendre l'app iOS de CASH CAR fluide et durable sur son iPhone 13 Pro avant la sortie App Store. Il joue, je lis le téléphone par le câble, je corrige, je compile, j'installe.

- **Rien sur `main` sans son oui explicite**, cas par cas. Tout vit sur la branche `ios-ultime` (worktree `~/cash-car/ios-ultime`).
- **Installer coupe sa partie** : toujours demander avant, et lancer `sh outils/banc-perf/lire-vol.sh` juste avant d'installer (sauve ses vols).
- Allègements réservés au téléphone (`TEL_NATIF` ou `ALLEGE`, jamais `IS_MOBILE`), l'ordinateur au pixel près, la direction artistique intacte, un interrupteur `?sans=…` par changement.
- Après toute modif de `code/` : `node code/assembler.cjs --depuis-morceaux`, les 4 gardes (`node outils/garde-demarrage.cjs`, `sh garde-charte.sh`, `sh garde-allege.sh`, `sh garde-burnout.sh`), `cashcar-vNNN` +1 dans `VERSION PRINCIPALE/sw.js` (une seule ligne `const CACHE`), commit de `code/` ET `index.html` ensemble, push. Ne jamais committer `app-ios/www`.
- Il veut des **sessions parallèles en continu** (« dès qu'une finit, tu en lances une autre »), **archivées dès qu'elles ont fini** et que leur travail est fusionné. Il veut **la chaleur réduite au maximum** pour l'instant.
- Français partout ; un lien de test à la fin de chaque livraison (https://car-cash-git.vercel.app/jouer/ = la version publiée).

## 2. Où on en est — À LIRE EN PREMIER

**La branche `ios-ultime` (HEAD `1bb61bc20`, cache v1542) porte une RÉGRESSION non résolue.**
Depuis le lot du build 79 (fusion de main v1535 + `transitions-ui` + `son-solide`), l'accueil gèle sur le téléphone, même froid : gels de 6,3 · 9,6 · 2,3 · 3,1 · 4,2 s (`gel | … inGarage garMenuH pal=0 basc=0`), 70 trous > 120 ms dans la première minute (pire 9,6 s), `#renderer` créé à 4,1 s au lieu de 0,4 s, des images du menu de 590-750 ms (`serpent | … JS image loop 650`), `prêt en 23.6 s, étapes 43` (13,4 s / 34 avant), `programmes 236` (182 avant). Les builds 75 à 78 n'ont pas ces gels.

Cause NON trouvée (le Mac était saturé : aucune mesure possible). Suspects, dans l'ordre :
1. `transitions-ui` : `transUI` / `transCad` / `transBloque` (`code/moteur/cadence.js`), `departVoileLeve` (`code/interface/garage-rendu.js`) — interrupteurs `?sans=transcad`, `?sans=transphoto`, `?sans=departvoile`.
2. main v1529-1535 : grottes sans lacets (`code/maps/grottes-1.js`), boutique, pouce NITRO, enregistreur de jeu (`code/moteur/enregistreur-jeu.js`).
3. `son-solide` (`code/son/graphe-audio.js`, `console-son.js`, `sfxSuite`) — `?sans=suitehorloge`.
4. Depuis le build 78, le script du début de document arrive enfin à la page (`poseScriptDebut`, `JeuViewController.swift`) : `__ccAppareil`, `__ccEco`, `__ccAutreSon` sont connus AVANT le jeu pour la première fois. Le palier par modèle (`code/rendu/palier-appareil.js`) et un téléphone vu « froid » (pleine image, résolution 1,5) s'appliquent donc pour la première fois. Le build 78 lui-même n'a pas montré de gel, mais il n'a été joué que quelques minutes.

Méthode conseillée : sur un Mac calme, comparer le lancement jusqu'au menu entre `c7ab25096` (build 78, sain) et HEAD (tâches longues, coût d'une image du menu), puis bissecter les trois fusions (`24aec16b9` main, `e2fe72767` transitions-ui, `a25196cd9` son-solide). Ou, sur le téléphone, des builds avec `--qs "&perfrec=2&sans=transcad,transphoto,departvoile"` etc.

**Sur l'iPhone de Sacha : le build 80** (= HEAD moins `MOB_FROID30`, donc AVEC la régression).
**Le build 81 est compilé mais PAS installé** (`~/cash-car/ios-ultime-mesures/builds/build81.app`) : c'est un build de repli HORS BRANCHE = le jeu du commit `c7ab25096` (build 78) + les correctifs musique du build 80 (`autreSonEffets`, `musRelance`) + `MOB_FROID30`, cache v1541. Sacha n'a pas encore répondu à « j'installe le 81 ? ». **Ne pas installer un build de la branche tant que la régression n'est pas trouvée.**

## 3. Ce qui a été fait (12/11 midi → 13/11 3 h)

Validé sur le téléphone par Sacha ou par les vols :
- **Canyon à chaud** : roche du relief au niveau 0 en serious/critical (`cyFS`, `cyDetPose`, `?sans=cychaud`) → 30 i/s au lieu de 9-19. Décor du canyon posé par tranches à l'entrée (`?sans=cyetale`).
- **Rotation** sans écran noir, **son qui revient** au retour dans l'app (veilleur du son, `natif.js` § 4 quater), **compteur de l'écran de mort** qui ne reste plus entre deux chiffres (aussi sur main, v1519).
- **Grande vitesse** : le portail franchi en vol n'est plus un gel de 11 s (attente sous le voile : `portail | attente 1354 ms sous le voile`). Sacha : « c'est mieux, j'ai commencé à lag qu'au palier 21 ».
- **L'autre musique (Deezer/Spotify)** — trois chemins confirmés par la boîte noire au build 78 : contexte audio « interrupted » page visible → jeu muet ; retour d'arrière-plan (≥ 3 s, `isOtherAudioPlaying` ET `secondaryAudioShouldBeSilencedHint`) → jeu muet ; MUSIQUE rallumée à la main → le jeu reprend le son. La fin de l'autre musique est guettée chaque seconde.

Posé mais PAS vérifié sur le téléphone :
- Chaleur : `SON_CHAUD` (charge du son réduite à chaud), `MOB_LONG` (sérieux qui dure → plafond 1,1 ; critical → 0,85), `MOB_FAIR30`, `MOB_FROID30` (course calée sur 30 à tout état), `HC_FROID` (pause 10 i/s, écran de mort à la cadence des menus).
- Musique au LANCEMENT (musique d'abord, puis le jeu) : le script du début de document était jeté par Capacitor ; reposé dans `capacitorDidLoad` au build 78. Sacha n'a pas dit si ce cas précis marche.
- Build 80/81 : effets du jeu par-dessus la musique du téléphone (`autreSonEffets`, `__ccAutreSon=2`), musique du jeu redemandée à 0,7 / 2 / 4 s quand on la rallume (`musRelance`).
- Sessions fusionnées : `debug-ultime` (un bug d'autre musique corrigé), `interface-opti` (HUD endormi, reflets, trame de MISSIONS), `grande-vitesse`, `transitions-ui`, `son-solide` (voix de l'écran de mort sur l'horloge audio, décrochages du démarrage). Rapports dans `passation/` : `DEBUG-ULTIME.md`, `INTERFACE-OPTI.md`, `GRANDE-VITESSE.md`, `TRANSITIONS-UI.md`, `SON-SOLIDE.md`. Inventaire App Store : `~/cash-car/ios-ultime-mesures/APP-STORE-RESTE.md`.

## 4. Les sessions parallèles

**En cours quand j'ai écrit ceci** (elles rendent compte à MA session, pas à la tienne : lis leurs branches et leurs rapports) :
- `gpu-base` — **A FINI à 3 h** : branche `origin/gpu-base`, dernier commit `8fce2d23e` (cache v1540), les 7 maps relevées, 2 lots d'allègements téléphone, rapport `passation/GPU-BASE.md` ; elle dit elle-même qu'elle n'a AUCUN temps de puce fiable (Mac chargé, volet caché) et rien de mesuré sur l'iPhone. Ni relue ni fusionnée ni archivée. (avant : dernier vu `1c6a179e1`, « lot 2 : feu du nitro à plage, rails/nappe néon moyens au loin… »), chantier `~/cash-car/gpu-base`, rapport attendu `passation/GPU-BASE.md`. Mission : mesurer le coût graphique d'une image map par map et alléger ce qui ne se voit pas (téléphone seulement).
- `demarrage-vite` — branche `origin/demarrage-vite` (dernier vu : `8883d9033`, « le chargement dense sous le serpent et les photos du garage seulement en vue »), chantier `~/cash-car/demarrage-vite`, rapport attendu `passation/DEMARRAGE-VITE.md`. Mission : lancement plus court, menu sans à-coups. Je lui ai transmis les chiffres de la régression du lot 79 (message en file : pas sûr qu'elle l'ait lu). Sa base est d'AVANT le lot 79.

**Supprimée par Sacha avant la fin** : `grotte-vite` — la branche `origin/grotte-vite` existe (`52b32dfeb`, « la grotte se creuse sans générateurs dans son travailleur »), travail partiel, NI relu NI fusionné, pas de rapport final garanti. Le problème reste entier : `grotte | travailleur | 20851 ms de creusement` ×7 sur le téléphone chaud. Attention : main a changé `grottes-1.js` entre-temps (grottes sans lacets).

Archivées (travail fusionné) : `interface-opti`, `grande-vitesse`, `app-store-pret`, `debug-ultime`, `transitions-ui`, `son-solide`.

Comment je fusionnais une branche finie : relire le diff (`git diff HEAD...origin/<branche> -- code app-ios`), `git merge origin/<branche>` (le conflit de `sw.js` et d'`index.html` se règle en gardant le nôtre puis en réassemblant et en montant le cache), 4 gardes, `node outils/banc-routes/toutes.mjs` (240 routes), une fumée au banc, commit, push, build, puis demander à Sacha avant d'installer.

## 5. Ce qui reste à faire, par ordre

1. **Trouver et corriger la régression du lot 79** (§ 2). Tant qu'elle est là, tout nouveau build de la branche gèle à l'accueil.
2. Relire puis fusionner `gpu-base` et `demarrage-vite` quand elles ont fini (les archiver ensuite). Décider du sort de `grotte-vite`.
3. **La grotte** : le creusement prend 8 à 21 s sur le téléphone chaud, l'attente au portail revient à chaque grotte.
4. **La chaleur** : le téléphone passe serious/critical en quelques minutes et y reste toute la soirée. La mesure téléphone froid ET débranché n'a jamais été faite (Sacha joue branché). Si critical arrive encore avec `MOB_FROID30` : cadence 24/20 en serious prolongé (lui demander avant, ça se voit).
5. Le son au démarrage : deux décrochages de ~500 ms à chaque arrivée au menu (traité par `son-solide`, donc dans le lot en régression : à revérifier).
6. Jamais traités : la mémoire (WebContent 1,25-1,33 Go, page tuée deux fois le 12/11), la rotation pendant l'intro (`remesure` → `prepare()` de `intro-161.js`, trous de 1,3 s), les autres iPhone (simulateur), la grande vitesse au-delà du palier 21.
7. Vague 5 (édition boutique, archive) : voir `APP-STORE-RESTE.md` — `app-ios/www` à régénérer, fiche « iOS 15 » → « 16.4 », captures à refaire. Rien chez Apple sans le oui de Sacha.
8. Questions ouvertes à Sacha : les 3 morceaux de musique non pré-rendus ; figer l'orientation pendant l'intro ; `MOB_FROID30` définitif ou provisoire.

## 6. Le mode d'emploi

**Lire le téléphone** (branché) : `sh outils/banc-perf/lire-banc.sh` (la boîte noire : filtrer par `v <7 premiers caractères du commit>` et par genre `son | gel | serpent | mort | memoire | portail | grotte | canyon | chargement`) ; `sh outils/banc-perf/lire-vol.sh` (les vols → `~/cash-car/ios-ultime-mesures/vol/vol-*.json`). Dans un vol : `S` = 8 valeurs par seconde `[s, images, pire ms, travail moyen ×10, phase, km/h ÷10, cran QL, drapeaux]`, drapeaux : bit 0 = calé sur 30, `>>1` = état thermique iOS 0-3 ; `th` = secondes par état ; `R` = 3 valeurs par seconde `[rAF reçus, intervalle mini ×10, vrai coût ×10]`.

**Compiler un build de mesure** (N = numéro suivant, dernier fait : 81) :
```
cd ~/cash-car/ios-ultime/app-ios && COMPLET=1 node preparer-www.js --maj http://127.0.0.1:1/ --qs "&perfrec=2" && npx cap sync ios
cd ios/App && xcodebuild -project App.xcodeproj -scheme App -configuration Debug -destination generic/platform=iOS -derivedDataPath ~/cash-car/ios-ultime-mesures/dd-tel -allowProvisioningUpdates CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=M532TDYCH2 CURRENT_PROJECT_VERSION=<N> build
cp -R ~/cash-car/ios-ultime-mesures/dd-tel/Build/Products/Debug-iphoneos/App.app ~/cash-car/ios-ultime-mesures/builds/build<N>.app
cd ~/cash-car/ios-ultime && git checkout -- app-ios/www app-ios/ios/App/CapApp-SPM/Package.swift && git clean -fdq app-ios/www
```
**Installer** (après son oui, après `lire-vol.sh`) : `xcrun devicectl device install app --device FE6F8B40-DCFF-5E04-B578-871A79EDCF17 ~/cash-car/ios-ultime-mesures/builds/build<N>.app`.

**Le banc navigateur** (jamais de son) : serveur `cashcar-ios-ultime-profil` (port 8896, `/Users/sachaberes/cash-car/.claude/launch.json`), fenêtre 390×844 d'abord, adresse `?tel=1&palier=2&colonne=0&garde=1&intro=ancien&attente=0&chute=0` (+ `&carte=…&meteo=…` pour la 1re map). Recette : désinscrire le service worker et vider les caches, couper `sfx/mus/vox` dans `localStorage.cashcarSave`, remplacer `requestAnimationFrame` par `setTimeout(16)`, retirer `#splash`, `dbgStep(1)` si `dbgPerf().ms==0`, `dbgJouer()` deux fois, `dbgTuto('permis')`, `dbgAuto(true,0,{vol:true,nit:2})` tôt. Crochets : `dbgState`, `dbgErreurs` (historique : filtrer `panne|erreur|exception|boucle|promesse`), `dbgThermique(n)`, `dbgMoteur()`, `dbgImmortel(true)`, `dbgBoom()`, `dbgCout(true)`, `dbgAppels()`, `dbgPrebati()`, `dbgCyDet(d)`. Un appel JS coupe à 45 s.

## 7. Les pièges appris

- **Le Mac sature vite** : 3 navigateurs de banc au plus toutes sessions confondues ; `uptime` avant toute mesure de temps (au-dessus de ~5, le chrono est faux : le 13/11 `toutes.mjs` a mis 88 s au lieu de 14). Plafond de 5 serveurs de prévisualisation par dossier : les sessions finies gardent parfois le leur → leur dire de le fermer, les archiver.
- `git push` affiche souvent « failed to push some refs » alors que le push est passé : vérifier avec `git ls-remote origin ios-ultime`.
- Capacitor JETTE tout `WKUserScript` ajouté dans `webViewConfiguration(for:)` (il remplace le contrôleur de contenu) : les poser dans `capacitorDidLoad`.
- `isOtherAudioPlaying` n'est sûr que quand le jeu ne joue rien (lancement, retour d'arrière-plan) ; un contexte WebAudio « interrupted » page visible = une autre app a pris le son. Le veilleur du son ne doit rien relancer quand `window.__ccAutreSon===1`.
- Ne jamais poser/retirer `animation:none` en partie (les éléments `.on` rejouent leur annonce).
- `?carte=` et `?meteo=` ne valent que pour la première map ; la vraie intro ne joue pas dans un volet caché.
- Les sessions parallèles : une par chantier, sur sa propre branche et son propre worktree `~/cash-car/<nom>`, jamais dans `ios-ultime` ; elles ne touchent ni à main ni au téléphone. Leur brief doit tout dire (elles ne voient pas cette conversation).
- `origin/pub-hud-calme` appartient à une autre session de Sacha : pour publier sur main, repartir d'`origin/main` dans `~/cash-car/pub-main-hud` et pousser `HEAD:main`.
