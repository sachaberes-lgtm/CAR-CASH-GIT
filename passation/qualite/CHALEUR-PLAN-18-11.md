# Chaleur et gels du build 121 — diagnostic et plan (nuit du 18/11, workflow werpjmrlk)

Source complète (trois analyses + plan) : `CHALEUR-PLAN-18-11.json`. Vol analysé : `~/cash-car/ios-ultime-mesures/vol/vol-1118-0416.json`.

## Diagnostic
1. PROUVÉ : toute la séance s'est jouée à l'état « serious », du début à la fin (851 s sur 851). Le téléphone était déjà chaud au départ, et la charge rapide le chauffait encore (+20 % de batterie en 25 min). À cet état, l'écran ne donne qu'un top toutes les 33 ms. Une image qui le rate coûte 66 ms.
2. PROUVÉ : le processeur manque, pas les pixels. Le travail JS passe de 6 ms (nominal) à 11-16 ms par image. Le vrai coût est de 23 ms en médiane et 36 ms au 90e centile. 42 % des images ratent leur top.
3. PROUVÉ (j'ai relu JeuViewController.swift:602-633) : la SondeNatif, nouvelle dans le build 121, lance CHAQUE SECONDE sur le fil principal de l'app une boucle Swift de 200 × 1024 additions. L'app est compilée en Debug (compiler.sh). Ce blocage dure 49-84 ms, et 160-300 ms en ville. 80 % des gels « hors boucle » tombent à un nombre entier de secondes l'un de l'autre, alors que le fil de la page est LIBRE. PROBABLE (il manque l'horodatage croisé) : ce battement en est la cause, puisque ce fil-là donne les tops d'image à WKWebView.
4. Deux analyses se contredisent : l'une dit « 121 pas pire que 120 » (75 contre 77 gels/min), l'autre dit « la nature a changé ». Les deux sont vraies. La sonde a REMPLACÉ une partie des gels du 120 sans en ajouter beaucoup. Retirer la sonde ramènera donc probablement au niveau du 120 à serious (≈ 50 gels/min), ce qui reste mauvais.
5. PROUVÉ : la vraie casse date du 16/11. 545a472 tenait 29,5 i/s à serious ; 089a868 tombe à 20-22 i/s. Il y a 250 commits entre les deux. J'y ai lu un suspect que les trois analyses n'ont pas nommé : NÉNUPHARS « figé en segments » (6696a2c3e, 15/11). Ce morceau a 30 paliers (un par moteur) en segments de 10 s. Il décode le segment suivant ET les paliers voisins en pleine course (pouce-bleu-jeu.js:187-200). D'où 7 à 16 décodages par course, à 150-400 ms une fois bridé, presque tous suivis d'un gel. PROBABLE.
6. RÉFUTÉ : la loupe et la résolution ne causent pas les gels. Cette nuit, l'échelle s'est effondrée (QL 10, loupe retirée) et les gels ont continué (39-108/min contre 45-113). Le vrai coût n'a pas bougé. La voiture a perdu sa netteté pour rien, contre la règle de Sacha.
7. PROUVÉ : avec Sacha en BASSE N1, le juge de chaleur et l'image lourde (gdxLourd, dkDoux) ne font rien. Seule l'échelle QL réagit, et elle baisse la voiture en même temps que la map.
8. PROUVÉ : « 75 images d'écran par seconde au sol » est un artefact : CAD.rN n'est pas remis à zéro au départ d'une course.
9. PROBABLE : la ville de 03:15 (7 i/s) est un effondrement du processeur de tout le téléphone (sentinelle ×5, décodages ×10, 1re image de 990 ms dont b6 vitrine/garage 552 ms). Ce n'est pas d'abord un défaut de rendu de la ville.
10. HYPOTHÈSE : les gels « sur l'interface » viennent de la vitrine HD. Elle rend à DPR 2 (2,6 fois les pixels d'une course), avec une ombre 1024 et 30 i/s à serious, sans jamais lire l'état thermique. Le menu chauffe donc plus qu'une course. Aucune mesure des menus à chaud n'existe.

## Lots

### sondecalme — `qa/sondecalme`
- **quoi** : La SondeNatif ne fait plus sa sentinelle Swift sur le fil principal de l'app. Par défaut, elle ne garde que la pression mémoire et le retard du battement, qui ne coûtent rien. La sentinelle passe sur une file d'arrière-plan (DispatchQueue.global(qos:.utility)) et ne repasse sur .main qu'avec un paramètre de banc. Le POULS Debug de natif.js (rAF permanent et elementFromPoint toutes les 4 s) se coupe aussi par défaut dans le build de jeu. Dans le même lot, la mesure est corrigée pour juger le vol suivant : CAD.rN remis à zéro au départ de la course (bvNeuve), horodatage page de chaque __ccSwN, étiquette par appelant des gl readPixels.
- **pourquoi** : C'est le seul travail ajouté dans le build 121 qui tape à 1 Hz sur le fil qui donne les tops d'image. Il colle au battement des gels hors boucle (80 % à un nombre entier de secondes), et c'est de la mesure, pas du jeu.
- **gain_attendu** : Jusqu'à 55-60 des 71 gels hors boucle par minute en moins. Probablement un retour au niveau du build 120 à serious, pas mieux. Le gain se juge au vol suivant.
- **prix_image** : Aucun.
- **interrupteur** : ?sans=sondecalme (côté natif : un paramètre lu dans la QS pour remettre la sentinelle sur .main et le pouls)
- **fichiers** : app-ios/ios/App/App/JeuViewController.swift (SondeNatif, l. 578-635), app-ios/natif/natif.js (POULS l. 439-444, envoi « go »), code/moteur/cadence.js (seulement la remise à zéro de rN : une ligne, voir les conflits), code/moteur/mouchard-gels.js (étiquettes readPixels)
- **depend_de** : rien ; à écrire en premier
- **preuve_au_banc_mac** : Aucun banc Chrome n'est possible : c'est du code natif. La preuve est une relecture : la minuterie .main ne lance plus que la pression et le retard ; xcodebuild compile ; le crochet de banc remet l'ancien comportement. Côté JS, un test Node de la remise à zéro de rN sur des secondes simulées : la 1re seconde ne compte plus les rAF du menu.
- **preuve_sur_telephone** : Boîte de vol de la séance suivante, mêmes conditions (branché, économie, chaud). Colonnes : gels hors boucle par minute, battement à 1 Hz (chaleur/a7.py et a8.py, le pic de phase doit disparaître), M[25] lu depuis la file d'arrière-plan, R[0] corrigé. Contrôle direct : une course avec le crochet de banc, une sans.
- **risque** : Faible. On perd la sentinelle « fil de l'app » telle quelle. Si la cause est ailleurs, le gain sera nul, mais rien ne casse.

### musiquecalme — `qa/musiquecalme`
- **quoi** : Le lecteur à segments de NÉNUPHARS (joueurSegments) ne décode plus pendant la course quand le téléphone est chaud. À serious, ou sous ALLEGE + économie : 1) au départ de course (sous le volet), on décode d'avance le segment en cours et le suivant du palier de départ, ainsi que les deux paliers voisins ; 2) en course, plus aucun palier voisin : un changement de moteur ne bascule qu'au début d'un segment déjà décodé ; 3) le suivant se décode au plus une fois par segment (10 s). Les décodages sont rangés dans un étalement : jamais deux à la fois, et jamais dans la seconde qui suit une image en retard. On vérifie aussi que les 6 décodages du départ (ville de 03:15 : 6 en 0,3 s) partent avant le premier top de la course.
- **pourquoi** : Le lot a été introduit le 15/11, dans la fenêtre de la casse du 16/11. Cette nuit, 7 à 16 décodages par course, presque tous suivis d'un gel, à 150-400 ms une fois bridés. Les trois analyses le voient, et aucune ne l'a relié à la casse.
- **gain_attendu** : Une part des gels en course (sur 16 décodages, 12 suivis d'un gel ; sur 7, 7) et moins de processeur à chaud. Probable, non chiffré.
- **prix_image** : Aucun pixel. Le morceau reste entier. À chaud, la bascule de palier quand le moteur change arrive au prochain segment (jusqu'à 10 s) au lieu de la mesure suivante (2,5 s).
- **interrupteur** : ?sans=musiquecalme
- **fichiers** : VERSION PRINCIPALE/assets/audio/pouce-bleu-jeu.js (joueurSegments, charge, tick), lecture de l'état thermique (MOB_S.thermo ou __ccBranche) par une petite fonction exposée côté code/son/ si besoin
- **depend_de** : rien ; peut s'écrire en même temps que sondecalme (fichiers disjoints)
- **preuve_au_banc_mac** : En Node ou dans le volet avec le son coupé : simuler 3 min de course avec un moteur qui change de palier toutes les 5 s, à froid et en « serious » simulé. Compter les décodages en course (attendu : au plus 1 par segment, 0 voisin), vérifier que l'enchaînement reste à l'échantillon près (PB.etat().seg : aucun trou) et que la mémoire ne dépasse pas l'ancien pic.
- **preuve_sur_telephone** : Boîte de vol : c.D (décodages par course, avec durée et heure) et la part des gels dans la seconde qui suit un décodage. Attendu : moins de 2 décodages par minute de course à serious, au lieu de 7-16 par course. En A/B, ?sans=musiquecalme une course sur deux.
- **risque** : Moyen. Un segment pas prêt fait jouer le secours (reprise à la mesure suivante, déjà prévue). Le moteur et la musique se désaccordent plus longtemps à chaud. À faire écouter à Sacha.

### voituredabord — `qa/voituredabord`
- **quoi** : À serious, l'échelle QL ne descend plus sous le cran 5. L'effondrement (QL.effondre) ne retire plus la loupe de la caisse : la loupe ne s'en va qu'à critical. Quand il faut baisser, ce sont les effets du décor qui baissent (halo, ombre, ciel 1/8, traits d'air ×0,7). Aucune réallocation de la toile en course à serious.
- **pourquoi** : Cette nuit, l'échelle est tombée de 5 à 10 et a retiré la loupe dès la course 6. Gain mesuré : aucun (vrai coût 24 contre 21 ms, i/s égales, gels non diminués). C'est la règle « priorité sur la voiture » de Sacha, violée sans rien gagner. On évite aussi les gels de réallocation (270-300 ms connus).
- **gain_attendu** : Pas de gain de fluidité attendu, à part quelques gels de réallocation en moins par course. Gain net en qualité : la voiture reste nette toute la séance.
- **prix_image** : Aucune perte. La caisse garde sa netteté. Le décor baisse comme aujourd'hui, mais par ses effets plutôt que par la résolution.
- **interrupteur** : ?sans=voituredabord
- **fichiers** : code/rendu/loupe-caisse.js (loupeChaud, l. 73-78), code/rendu/nettete-qualite.js (qlPose, qlDoux, plancher), code/moteur/boucle-1.js:120-146 (si l'effondrement y est décidé)
- **depend_de** : rien en code. MÊMES FICHIERS que menuchaud (nettete-qualite.js) et que origin/qa/pilote (loupe-caisse.js, nettete-qualite.js) : écrire voituredabord AVANT menuchaud, et prévenir la session du pilote qu'il faudra le rebâtir dessus.
- **preuve_au_banc_mac** : Banc Chrome sous verrou, plus tard (pas cette nuit si la machine reste saturée) : téléphone ralenti simulé (?tel=1, faux état serious), course longue. Compter les réallocations de la toile (0 attendu), le cran QL (≤ 5 tenu), la loupe (quad présent), la largeur du tampon (2532 gardé). Une planche photo avant/après de la caisse.
- **preuve_sur_telephone** : Boîte de vol : S (cran QL ≤ 5 à serious), G[38] / M[16] (toile/fenêtre 900 % tenu), gels par minute pas pires que la séance d'avant, vrai coût R[2] comparable.
- **risque** : Faible à moyen. Si le téléphone part en critical, la loupe s'en va quand même (prévu). Conflit de fichiers avec origin/qa/pilote : son verrou de résolution en course fait une partie de ce lot.

### flushtot — `qa/flushtot`
- **quoi** : Appeler gl.flush() juste après composer.render() dans boucle-6-hud.js, et ranger après ce flush tout ce qui ne touche pas l'image de cette passe (prebTick 0,4-1,5 ms, mesure, cadFin, bvImage). La puce reçoit ses commandes 1 à 2 ms plus tôt.
- **pourquoi** : Le vrai coût (23 ms en médiane, 36 au p90) enchaîne environ 11 ms de JS et environ 12 ms de puce. Gagner 1-2 ms fait repasser une partie des images du p90 sous les 33 ms du top. Zéro pixel, une ligne.
- **gain_attendu** : Quelques points de tops ratés en moins (le p90 passerait de 36 à environ 34 ms). Non prouvé : ANGLE ou WebKit vident peut-être déjà au fil de l'eau.
- **prix_image** : Aucun.
- **interrupteur** : ?sans=flushtot
- **fichiers** : code/moteur/boucle-6-hud.js:307-330
- **depend_de** : rien ; fichier disjoint des autres lots (boucle-6-hud.js : vérifier que menuchaud n'y touche pas à la l. 136, sinon les écrire l'un après l'autre)
- **preuve_au_banc_mac** : Pas de gain mesurable sur le Mac. Preuve de non-régression : l'image reste au pixel près (photo avant/après), l'ordre des tranches est inchangé, compilation des <script> d'index.html (vm.Script).
- **preuve_sur_telephone** : Boîte de vol en A/B une course sur deux : vrai coût R[2] (médiane et p90), part des intervalles au-delà de 34,5 ms (histogramme B), gels hors boucle par minute.
- **risque** : Faible.

### menuchaud — `qa/menuchaud`
- **quoi** : À serious et au-delà, pour l'accueil, le garage et la boutique : la vitrine HD garde son DPR 2 (la voiture reste nette) mais baisse son décor. Ombre 768 au lieu de 1024, halo en ½ résolution à 2 étages (comme en course). Après 10 s sans geste, repos à 15 i/s réguliers (aujourd'hui, seulement à critical). Retour immédiat à 30 au premier toucher. La bascule se fait sous le volet (ecranWipe).
- **pourquoi** : Sacha voit des freezes « sur l'interface ». Au menu, la vitrine rend 1,32 Mpx (2,6 fois une course), avec une ombre 1024 et 30 i/s à serious, sans lire l'état thermique : le téléphone chauffe entre deux courses au lieu de refroidir.
- **gain_attendu** : Moins de chaleur et de travail entre les courses (−0,46 M texels d'ombre, halo réduit, moitié moins d'images au repos). Effet sur les freezes de l'interface : inconnu, car aucune mesure des menus à chaud n'existe.
- **prix_image** : Ombre et halo du menu un peu plus doux à chaud. La voiture garde sa résolution. Au repos, le mouvement des nuages du menu passe à 15 i/s réguliers (Sacha l'a déjà vu, à faire valider).
- **interrupteur** : ?sans=menuchaud
- **fichiers** : code/rendu/nettete-qualite.js (VHD : vhdDpr, vhdBascule, vhdOmbreTel, l. 235-249), code/moteur/cadence.js (ACC30_CHAUD, l. 424-432 ; hcSaute)
- **depend_de** : voituredabord (nettete-qualite.js) ; cadence.js est aussi touché par origin/qa/pilote et par la ligne rN de sondecalme : écrire sondecalme puis voituredabord puis menuchaud, dans cet ordre
- **preuve_au_banc_mac** : Sous verrou, plus tard : faux état serious + ?tel=1. Compter la taille de l'ombre (768), les passes du halo, la toile de la vitrine (DPR 2 gardé) et la cadence au repos (intervalles à 66 ms réguliers après 10 s, retour à 33 au toucher). Planche photo du garage.
- **preuve_sur_telephone** : Il faut d'abord que la boîte de vol couvre les menus (rappels par seconde, gels au menu, avec un drapeau d'écran). Puis comparer la sentinelle Swift (M[25] depuis la file d'arrière-plan) et la chaleur au départ de la course suivante, avec ou sans le lot.
- **risque** : Moyen. Même fichier que voituredabord et que le pilote. Le repos à 15 i/s ne doit jamais tomber pendant qu'on fait tourner une voiture au doigt.

### portailborne — `qa/portailborne`
- **quoi** : Le portail étalé (PV:etale) arrête sa tranche dès qu'elle dépasse son budget, mesuré en temps réel entre deux sous-pas, et non plus d'après le Mac froid. À serious, il ne lance aucune tranche dans la seconde qui suit une image en retard. Un filet est gardé : si le portail approche sans être prêt, il finit en tranches courtes forcées, jamais d'un bloc à l'entrée.
- **pourquoi** : Une fois bridées, ses « tranches de 0,3-3 ms » durent 20-154 ms. On en compte 186 au-delà de 8 ms (≈ 4,5 s), concentrées dans les longues courses à plusieurs maps qui tombent à 20-22 i/s.
- **gain_attendu** : Ces ≈ 186 coups de plus de 8 ms supprimés ou coupés en morceaux.
- **prix_image** : Aucun. Le portail est prêt un peu plus tard.
- **interrupteur** : ?sans=portailborne
- **fichiers** : le morceau du portail étalé (PORTV / PV:etale, dans code/maps/ ou code/gameplay/portail-passage.js), code/moteur/boucle-*.js (prebTick) si l'appel y vit
- **depend_de** : rien en fichiers communs avec les autres lots ; à écrire en dernier, après accord de la session maps
- **preuve_au_banc_mac** : En Node ou au banc, plus tard : simuler un processeur ×5 plus lent (multiplier les durées mesurées). Vérifier qu'aucune tranche ne dépasse le budget plus un sous-pas, que le portail est toujours prêt avant l'entrée (piste figée via __ev), et que la scène bâtie est identique au bit près avec ou sans le lot.
- **preuve_sur_telephone** : Boîte de vol : c.Q['PV:etale'] (nombre de rappels au-delà de 8 ms et pire durée), aucune reconstruction d'un bloc à l'entrée d'un portail, i/s des longues courses à plusieurs maps.
- **risque** : Moyen. Un portail pas prêt à temps provoque un gros gel à l'entrée. Les fichiers de maps sont aussi travaillés par la session ville-cyberpunk / finition-maps : la prévenir avant.

## Écartés
- « Couper la loupe ou baisser la résolution rend de la fluidité » : réfuté cette nuit. Effondrement QL 10 sans loupe : vrai coût 24 contre 21 ms, i/s égales, gels non diminués. Retirer la loupe à éco + fair (qa/gouvlent partie D) est écarté pour la même raison et parce que ça va contre « la voiture d'abord ».
- « Viser 20 ou 24 i/s à chaud pour un rythme régulier » : faux sur ce téléphone. Les tops arrivent à 33 ms, donc 20 i/s donne 33/66 au hasard, plus haché que 23 i/s. Même défaut au CAD_CRIT20 actuel à critical (seuil 33,3 ms). Seuls 30 et 15 sont réguliers.
- 15 i/s régulières à serious : ce n'est pas un lot de cette nuit. C'est un dernier recours, sur un prototype que Sacha jugerait au pouce, seulement si 30 ne tient pas une fois la sonde et la musique réglées.
- « 75 images d'écran par seconde au sol » : artefact du compteur CAD.rN (non remis à zéro). Corrigé dans sondecalme, rien à en tirer.
- Le pilote de qualité comme remède aux gels : à BASSE + branché + éco + serious, ses crans valent la base. Seul son verrou de résolution sert, et voituredabord le couvre en partie.
- Le juge de chaleur, gdxLourd, dkDoux : ils ne jouent qu'à partir du N2, donc rien chez Sacha (N1). Pas la peine d'y toucher pour lui.
- Commander la cadence de WKWebView depuis le natif (preferredFrameRateRange, API privée), la mitigation thermique, le mode économie ou la luminosité : impossible ou refusé par l'App Store, et la luminosité est le réglage du joueur.
- « Le build 121 est pire que le 120 » : non à état égal. La sonde a changé la nature des gels, pas leur nombre. La vraie casse date du 16/11 (fenêtre 545a472..089a868).
- Rendu en tête de boucle (A1) : gros gain possible, mais il touche la sensation de conduite, l'ordre caméra/loupe/photos et ajoute une image de latence. Trop risqué pour une nuit : à garder pour un lot de jour après flushtot.
- HUD dans la toile, traits de vitesse en WebGL, fusion des envois de la map, recyclage des géométries : de vrais chantiers, pas des lots d'une nuit, et pour la plupart dans les fichiers des maps.
- Directeur de maps à chaud (tirer moins la ville) : il retire de la variété, c'est à Sacha de décider, pas un lot de nuit.
- Loupe ×2 à chaud : elle joue sur la chaleur, pas sur les gels, et touche à la netteté de la voiture. C'est une question pour Sacha, pas un lot.

## Questions pour Sacha
- Si le téléphone est chaud, tu acceptes que le changement de musique quand tu changes de moteur arrive jusqu'à 10 s plus tard, au lieu de 2,5 s, pour enlever les gels de la musique ?
- Au menu, quand le téléphone est chaud et que tu ne touches à rien pendant 10 s, le décor peut-il tourner à 15 images par seconde régulières (la voiture reste nette, tout repart au premier toucher) ?
- Pour la séance de test : tu peux débrancher le téléphone ou couper la charge rapide un moment ? Sinon on garde branché + économie comme cette nuit, c'est la règle.
- Si ça ne suffit pas, tu préfères 15 images par seconde parfaitement régulières, ou 23 un peu hachées ? Tu trancheras au pouce.
