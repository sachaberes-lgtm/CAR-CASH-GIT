RAPPORT — BATTERIE en course et en pause (iPhone 13 Pro, app iOS). Lecture seule : rien n'a été modifié, rien n'a été committé.

Résumé : le code est déjà très économe. Presque tout ce qui tournait « pour rien » a été traité entre le 23/10 et le 14/11. Il reste peu de gros gains sans perte d'image. Le seul levier vraiment net touche l'image : le mode économie d'énergie d'iOS est bien détecté, mais il ne sert jamais à économiser. Le reste rapporte peu (moins de 2 % chacun). Les estimations s'appuient sur l'ordre de grandeur relevé par le wattmètre du jeu (une ligne « energie » donne ≈ 4,5 W en course) et sur ce que coûte chaque poste. Rien n'a été mesuré ici.

═══ CE QUI EXISTE DÉJÀ (ne pas refaire) ═══
- Cadence de course : 30 i/s dès le départ, même téléphone froid (MOB_FROID30, gouverneur-thermique.js:68), et 20 i/s à l'état critique (CAD_CRIT20, cadence.js:85-88). Une image sautée ne coûte presque rien (boucle-1.js:7-14). Plafond à 60 sur les écrans 120 Hz (cadence.js:43). Info.plist n'a pas CADisableMinimumFrameDurationOnPhone, donc la vue web n'utilise jamais le 120 Hz de l'écran : rien à faire.
- Pause : la scène est dessinée à 10 i/s, puis à 2 i/s après 2 s sans geste (hcSaute, cadence.js:180-189). Le contexte audio s'endort en fondu (init.js:~377-383, acDortApres). Le verrou d'écran est rendu en pause (init.js:363 wakeLache), donc un téléphone posé en pause s'éteint.
- Écran de mort : 3,5 s après la mort, il suit la règle des menus (cadence.js:183-185).
- Menus : 30 i/s, 60 sous le doigt, 15 i/s seulement à l'état critique ou après 1 min sans geste (hcRepos, cadence.js:226-229). La bande de la boutique tourne à 30 (BANDE30). Les objets hors champ ne sont pas dessinés au menu (MENU CULL).
- Interface : les animations en boucle du HUD invisible sont gelées (HUD_DORT, cadence.js:136-165). L'écriture est allégée et le HUD se calme quand on lâche le nitro (sonCalme coupe les effets). Les toiles 2D ne s'effacent qu'une fois quand elles sont vides (boost-depart.js:226/266, jus-echelle.js:115).
- Arrière-plan : la course se met en pause et le contexte audio est suspendu (init.js:435-437), aussi sur les événements `pause` et `ccInactif` de Capacitor (mobile-tactile.js:611-619). Info.plist n'a pas de UIBackgroundModes : iOS fige l'app derrière, minuteries natives comprises.
- Son : le veilleur de natif.js:180-199 ne réveille jamais un contexte que le jeu a endormi (__ccVeille, natif.js:119-122). Tout coupé = contexte suspendu (curseurs.js:75, graphe-audio.js:307/529). La musique de course est pré-rendue sur téléphone (passation/VITESSE-FLUIDE.md:84).
- Enregistreurs : la boîte de vol BV (enregistreur-perf.js:80-81) et l'enregistreur JREC (enregistreur-jeu.js:20-23) sont éteints par défaut. natif.js:61-62 efface le drapeau dans une app construite sans perfrec. La boîte noire écrit au plus toutes les 0,4 s, et toutes les 20 s pour les lignes répétées (debut-corps.html:120-121). La sauvegarde attend 120 s en course (sauvegarde.js:339).
- Mesures déjà prêtes :
  - le wattmètre WATT (gouverneur-thermique.js:105-124), débranché : une ligne `energie` par pour-cent perdu, avec watts, phase (menu/course/pause/mort), état thermique et « éco » ;
  - le banc de chaleur outils/banc-chaleur/essai.sh (budget thermique d'iOS en W, A/B par interrupteurs CC_QS, page noire comme plancher avec `chaleur=vide`) ;
  - le banc Mac outils/banc-perf/menus-chaleur.py (images, appels, triangles et JS par seconde).
- Économie d'énergie : elle est détectée. Swift la lit au lancement (JeuViewController.swift:23), puis à chaque changement et toutes les 5 s (:394-397, :456) → window.__ccEco. Elle sert seulement à ne pas prendre l'écran à 30 pour de la lenteur (CAD.eco, cadence.js:65 ; mobEco, gouverneur-thermique.js:80 ; profil-juge.js:95 ne juge pas en éco). Elle n'allège rien.
- En charge : la surchauffe vient de la batterie qui charge, pas du jeu (mémoire du banc de chaleur, 13/11). L'app ne peut pas agir sur la charge.

═══ PROPOSITIONS, classées gain/risque ═══

1. ÉCONOMIE D'ÉNERGIE → l'image retombe d'un niveau (HAUTE N2 → N1 sur le 13 Pro). Gain MOYEN, risque MOYEN, décision de Sacha.
   - Où : le niveau se calcule dans rendu/soleil-planete.js:488-489 (P.n = prfNivT(...)) et se suit à chaud par prfRegle. Il faut y ajouter « si __ccEco === 1 : niveau max N1 », puis recalculer à l'événement cc:thermique, qui porte déjà __ccEco (gouverneur-thermique.js:126).
   - L'ordinateur ne bouge pas : PRF.on n'est vrai que si TEL_NATIF.
   - Interrupteur : `?sans=ecoimg`.
   - Gain : N2 → N1, c'est DPR 1,5 → 1,25 (0,69× pixels), un halo à mi-résolution au lieu de plein, et une ombre 768 au lieu de 1280 (0,36× texels). Si le GPU pèse 40-50 % des ≈ 4,5 W de course, environ 0,3-0,6 W de moins, soit 7-12 % d'autonomie en course. Rien si Sacha est déjà en BASSE (le défaut du 13 Pro : T.c[1].def='fast', soleil-planete.js:467).
   - Risque : l'image baisse en éco. Sacha a dit « ça doit marcher même en économie d'énergie », pas « garder HAUTE ». À lui demander. Une variante plus douce garde le DPR et éteint seulement le halo plein et l'ombre 1280.
   - Preuve sans téléphone : au banc `?tel=1&classe=1&eco=1` + HAUTE, dbgGouv().eco doit être vrai et PRF.n doit valoir 1. Puis comparer les triangles et appels par seconde (menus-chaleur.py) et curDPR, avec et sans `?sans=ecoimg`.
   - Sur le téléphone : débranché, en éco, deux séries de courses avec et sans l'interrupteur. Comparer les watts des lignes `energie` en phase course (au moins 3 pour-cent chacune).

2. LE MOTEUR AUDIO ET LE VENT CALCULENT DU SILENCE HORS COURSE. Gain FAIBLE, risque FAIBLE-MOYEN.
   - Où : son/graphe-audio.js. Le moteur v2 est créé aux lignes 338-440 (8 oscillateurs, 4 sources en boucle, 10 filtres, un waveshaper, ~15 gains) et démarré à la ligne 440. Le souffle et la gomme sont démarrés à la ligne 183 (2 sources en boucle, 6 filtres, 1 oscillateur). Rien de tout cela n'est jamais arrêté ni débranché. Au menu, au garage et sur l'écran de mort, avec le contexte éveillé pour la musique, ils tournent à gain 0.
   - Proposition : débrancher leur sortie du MASTER hors course (!started || garageOn || gameOver depuis plus de 3,5 s), puis rebrancher au départ, en fondu de 30 ms. WebKit ne calcule que ce qui est relié à la sortie.
   - Interrupteur : `?sans=moteurdort`.
   - Gain : ≈ 1-2 % d'un cœur sur le fil audio, ≈ 10-30 mW. Moins de 1 % au menu, rien en course.
   - Risque : un clic au rebranchement, ou un moteur muet au premier départ. Vérifier d'abord que le garage ne fait pas vrombir ce moteur.
   - Preuve sans téléphone : outils/banc-son (fumee-son.mjs, mixage.mjs). La sortie de course doit rester identique, au menu elle doit être nulle. Pour le coût : chronométrer un OfflineAudioContext de 60 s avec et sans la chaîne.
   - Sur le téléphone : `energie` en phase menu/garage, débranché. Le gain risque d'être sous le bruit de mesure : ne le faire que s'il est simple.

3. LA DOSE DE CHALEUR EST ÉCRITE DANS localStorage TOUTES LES 5 s, PARTOUT. Gain TRÈS FAIBLE, risque TRÈS FAIBLE.
   - Où : moteur/gouverneur-thermique.js:95 (mobGouvSauve tous les 5 s). Elle est déjà écrite aussi en pagehide, en page cachée et à serious (:87, :127-129).
   - Proposition : n'écrire que si `actif` change ou si D bouge de plus de 10, et au plus toutes les 30 s.
   - Gain : une écriture de stockage (appel inter-processus + base) toutes les 5 s en moins. Négligeable en watts, mais gratuit.
   - Preuve : au banc, compter les appels à localStorage.setItem par minute (enrobage de la fonction).

4. LES MENUS AU REPOS PROLONGÉ. Gain FAIBLE, risque FAIBLE, mais touche au ressenti des nuages de l'accueil.
   - Où : cadence.js:226-229 (hcRepos). Les deux valeurs de repos sont aujourd'hui à 66,7 ms (cadence.js:203), donc le « 10 i/s à 8 s » n'existe plus : après 1 min sans geste, l'accueil reste à 15 i/s jusqu'au verrouillage automatique.
   - Proposition : 5 i/s après 3 min sans geste. Personne ne regarde ; le premier toucher rend les 60.
   - Interrupteur : `?sans=reposlong`.
   - Gain : seulement entre 3 min et le verrouillage (souvent 30 s à 5 min, donc rarement atteint). Faible.
   - Preuve : au banc, dbgHC().per après 3 min sans geste simulé (rendre performance.now() factice ou poser HC.gT).
   - Sur le téléphone : essai.sh « accueil » de 6 min, avec et sans l'interrupteur, budget à 5 min.

5. MINUTERIES NATIVES QUI RÉVEILLENT LA PAGE. Gain TRÈS FAIBLE, risque MOYEN (l'autre musique de Sacha).
   - Où : JeuViewController.swift:406 (guetteAutreSon chaque seconde, un evaluateJavaScript donc un aller-retour vers le processus web), :397 (5 s) et :477 (5 s, GardeVue).
   - Tout s'arrête en arrière-plan. Passer le guet de 1 s à 2 s couperait un réveil par seconde, mais le retour du son après l'autre musique deviendrait plus lent.
   - À ne faire que si 1 à 4 ne suffisent pas.

6. À VÉRIFIER AVANT TOUT : RESTE-T-IL UNE MUSIQUE SYNTHÉTISÉE EN DIRECT DANS L'APP ?
   - Gain possiblement GROS, mais seulement sur ces morceaux.
   - passation/ios-ultime/PLAN-ULTIME.md:67, :130 et :145 : 3 morceaux du tirage n'avaient pas de rendu figé (NÉNUPHARS VELOURS bleu-9551, LUNE DE JADE bleu-6167, FIRE PRIME bleu-8154). Une synthèse en direct, c'est 50 à 190 oscillateurs, la plus grosse charge audio connue (VITESSE-FLUIDE.md:84). La question à Sacha (les retirer du tirage de l'app ou les rendre) était restée ouverte. Ces identifiants sont toujours dans code/son/musique.js:536-544.
   - Preuve sans téléphone : dans www/ fabriqué, lister les morceaux du tirage et leur fichier de paliers.
   - Sur le téléphone : la ligne `musique` de la boîte noire (figée ou direct) pour chaque course.

Pistes écartées après lecture :
- les ~25 setInterval de 100 à 250 ms : tous protégés par garageOn, started ou document.hidden ;
- le détecteur de gels (rAF de debut-corps.html:128) : quasi gratuit ;
- les photos de boutique au repos (economie/boutique.js:203) : bornées et rares ;
- « loggingBehavior: debug » dans capacitor.config.json : Capacitor n'écrit ses journaux que dans un build Debug ;
- la mise à jour en direct (natif.js:269-316) : une requête au lancement, sans scrutation.

═══ COMMENT MESURER SUR LE TÉLÉPHONE ═══
1. Débranché (sinon le wattmètre se tait et la charge fausse la chaleur), en éco ou non, mais noté.
2. Avant chaque essai, la règle de PERF-3.md:45 : refuser de mesurer si le lancement « origine → DCL » dépasse 1,5 s (téléphone bridé).
3. Lire les lignes `energie` de la boîte noire. Il faut au moins 3 % par variante et la même map.
4. Pour la chaleur : essai.sh <nom> "&sans=…" 300, puis comparer les secondes avant 2,0 / 1,5 W.

Hors de ce lot : la vitesse de lancement, que Sacha a aussi demandée, n'est pas traitée dans ce rapport.