# Incohérences du jeu — chasse du 21/11 (vérifiées dans le code)

Sacha : « ce genre de détail, c'est pas admissible… C'est plein d'incohérences comme ça qu'il faut que tu cherches et que tu trouves ».


## BLOQUANT (5)

### B1 [traînées]
- **Le joueur voit** : Sur le site (/jouer/) : dans la boutique, au rayon TRAÎNÉES, la bande du garage et les cartes cube, l'ARC-EN-CIEL porte l'étiquette « PACK CHAT » (en anglais « CAT PACK ») et la phrase « Ne s'achète pas : elle vient avec le CHAT POP-TART. ». Son bouton dit INDISPONIBLE. Le chat n'est plus vendu, donc la traînée ne s'obtient plus du tout. C'est l'exemple de Sacha. (Doublons fusionnés : packs-boutique n°1, textes n°1, tables n°11, écrans n°1.)
- **Où** : code/economie/boutique-vitrine.js:14 `else if(d.mis){delete d.mis;if(d.id==='arcenciel'){d.pack='chat';d.d="Ne s'achète pas : elle vient avec le CHAT POP-TART.";}}`. Les étiquettes ne testent que d.pack==='chat' : interface/boutique-classique.js:21 (le rayon par défaut, BQC.on), interface/habillages-accueil.js:26, interface/boutique-scene-1.js:452, interface/boutique-trainee.js:17 (?piste=1), interface/boutique-peinture.js:21. Seul le bouton teste la vente : boutique-scene-1.js:699 `if(d.pack==='chat'&&!carEnVente(chatPackI()))return {e:'defi',t:'INDISPONIBLE'};`. La phrase est affichée sous le nom : boutique-scene-1.js:610 `.tDesc`.
- **Correction** : Le plus simple : la branche sans-trainees retire déjà l'arc-en-ciel de COSM (vérifié : `git show claude/sans-trainees-fed5f1:code/economie/boutique.js` ne contient plus `arcenciel`), et la sauvegarde le garde à ceux qui l'ont. D'ici là, faire rendre -1 à chatPackI() (economie/boutique.js:290, qui ne teste que `retire`) quand !carEnVente(i), et ne pas poser pack:'chat' dans boutique-vitrine.js:14 dans ce cas. La traînée prend alors la voie de l'app.

### B2 [traînées]
- **Le joueur voit** : Sur l'iPhone (build 126) : l'ARC-EN-CIEL est en vitrine avec le cadenas « MISSION » (bouton « À GAGNER »), alors qu'aucune mission ne la donne et qu'elle n'a pas de prix : on ne peut pas l'avoir. Sa phrase « Ne s'achète pas. » reste en français quand le jeu est en anglais.
- **Où** : app-ios/preparer-www.js:186 `une("d.pack='chat';d.d=\"Ne s'achète pas : elle vient avec le CHAT POP-TART.\";","d.sec=1;d.d=\"Ne s'achète pas.\";",…)` (cette coupe est bien dans le commit du build 126, a260ce85c). Ensuite : interface/boutique-classique.js:21-24 (ni pack, ni eur, ni p : la pastille MISSION) et boutique-scene-1.js:701 `return {e:'defi',t:'À GAGNER'}`. Aucun filtre `.sec` ne cache un habillage non possédé dans les listes de la boutique (grep sur boutique-*.js, habillages-accueil.js et inventaire). La clé "Ne s'achète pas." n'existe nulle part dans code/ ni dans preparer-www.js.
- **Correction** : La fusion de sans-trainees le règle (l'objet sort de COSM). Sinon, dans l'app, mettre 'trainee:arcenciel' en HAB_RETIRES, ou la cacher tant qu'on ne l'a pas. Au minimum, ajouter "Ne s'achète pas.":"Not for sale.".

### B3 [traînées]
- **Le joueur voit** : Sur l'iPhone : les missions « COLLECTE TOUTES LES TRAÎNÉES » (50 000 €) et « COLLECTE TOUS LES OBJETS DU JEU » (500 000 €) ne peuvent jamais être réussies. Le compteur « x / y » de l'onglet TRAÎNÉES de l'inventaire ne peut jamais être plein. Sur le site, les missions excluent bien l'arc-en-ciel, mais pas le compteur de l'inventaire.
- **Où** : code/missions/defis-moteur.js:86 `if(!m2HabReco(cat,d)&&(!d.eur||d.def||a)&&!(d.pack==='chat'&&!a&&m2ChatEuro())){tot++;…}`. Dans l'app, d.pack n'existe plus et d.sec n'est exclu que pour les peintures (:80 `cat==='peinture'&&(d.sec||d.serie)`). m2HabAMoi (:73) demande alors shop.own, qui n'arrive jamais. Les missions : missions/table.js:70 (trall) et :77 (toutall). L'inventaire : interface/garage-menu-inventaire.js:210 `return COSM[cat]?COSM[cat].length:0;` et :219 `pt.textContent=Lb.length+' / '+T`.
- **Correction** : Réglé par la fusion de sans-trainees, qui retire l'arc-en-ciel, tr5, tr10 et trall. Avant cela, dans m2HabReco, exclure les habillages `sec` de toutes les catégories.

### B4
- **Le joueur voit** : Quatre peintures restent « À GAGNER » avec une jauge à 0 et sans prix, alors que leur défi est impossible : BLANC NEIGE (« Joue 10 niveaux sur le glacier. »), MONTE-CARLO (« Joue 20 niveaux sous la neige. »), CAMOUFLAGE (« Joue 10 niveaux dans la forêt. ») et BLOC D'HERBE (« Joue 25 niveaux dans la forêt. »). Du coup, « COLLECTE TOUTES LES COULEURS » (50 000 €) et « COLLECTE TOUS LES OBJETS DU JEU » (500 000 €) ne peuvent jamais être réussies, et le compteur des peintures de l'inventaire ne peut jamais être plein. (Fusion de 9 lignes des quatre chercheurs.)
- **Où** : code/economie/boutique.js:324 `['neige','BLANC NEIGE','commun',…,{k:'sc:glacier',v:10,t:'Joue 10 niveaux sur le glacier.'}]` ; :378 `['camo','CAMOUFLAGE','epique',…,{k:'sc:foret',v:10,t:'Joue 10 niveaux dans la forêt.'}]` ; code/economie/livrees.js:202 `['montecarlo',…,{k:'sc:neige',v:20,t:'Joue 20 niveaux sous la neige.'}]` ; :213 `['bloc',"BLOC D'HERBE",…,{k:'sc:foret',v:25,…}]`. Le prix est retiré : boutique-vitrine.js:5 `if(e[5]){o.def=e[5];o.ind=e[5].t;delete o.eur;}`. Elles restent dans le total : defis-moteur.js:86 `d.def||a` ; missions/table.js:67 (colall) et :77 (toutall). Les preuves : defis-moteur.js:280-282, m2Niveau. Aucun m2Cpt('foret') dans tout code/. 'glacier' ne compte que si c==='banquise', et 'neige' que pour les météos neige et blizzard, qui n'existent que sur la banquise (maps/niveaux.js:82 `neige:{bio:'banqNeige'}`, et glacier-route.js seul). La banquise est hors tirage : maps/niveaux.js:58 `banquise:!/[?&](carte|niveau)=banquise\b/…`.
- **Correction** : Supprimer le 6e champ (le défi) de ces quatre lignes : elles reprennent le PEINT_EUR de leur rareté (1 € pour BLANC NEIGE, 2 € pour les épiques), comme Sacha l'a demandé pour BLANC NEIGE. Créer ensuite leurs produits dans app-ios/outils/produits.csv et dans App Store Connect. Cela répare d'un coup colall, toutall et la barre de l'inventaire. À recouper avec qa/defispossibles.

### B5
- **Le joueur voit** : L'écran MISSIONS (famille EXPLOITS, visible de tous) propose « ROULE 200 KM SUR LE VERGLAS (GLACIER) » (30 000 €). La barre ne bouge jamais, donc la liste des missions ne peut jamais être complète. La secrète « GLISSE 20 S SUR UN LAC GELÉ » est tout aussi impossible.
- **Où** : code/missions/table.js:56 `{id:'verglas100',f:'exploit',k:'verglasKm',v:200,u:'km',r:{cash:30000},…t:'ROULE {v} KM SUR LE VERGLAS (GLACIER)'}` ; :93 `{id:'lac10',f:'secret',k:'lac',v:20,…}`. Les mesures : defis-moteur.js:267 `if(k==='banquise'&&BANQ.sur>0)` et :269 `if(k==='banquise'&&BANQ.glisse&&BANQ.sur===2)`. m2Dispo (defis-moteur.js:240) ne regarde que la récompense, qui est de l'argent : la mission reste listée. La banquise est hors tirage (niveaux.js:58). Le mode pass éteint la cite aussi (missions/pass-table.js:131).
- **Correction** : Dans m2Dispo, renvoyer faux pour verglas100 et lac10 tant que SF_HORS.banquise (ou r:{vide:1}). Lot qa/defispossibles.


## VISIBLE (6)

### V1
- **Le joueur voit** : La peinture GRANDE VAGUE affiche « À GAGNER : Descends au fond de la mer de Jade. » (et sa traduction anglaise). La mer de Jade a été retirée : la mesure est devenue une descente de 400 m entre les pics.
- **Où** : code/economie/boutique.js:369 `{k:'prof',v:'prof',t:'Descends au fond de la mer de Jade.'}` ; la clé anglaise est à :438.
- **Correction** : t:'Descends 400 m dans les pics de Jade.' et, en anglais, 'Drop 400 m in the Jade Peaks.' (la clé de la ligne 438 est à remplacer).

### V2 [traduction]
- **Le joueur voit** : En anglais, la fiche du TAXI JAUNE (THE YELLOW CAB) au garage et dans la fenêtre d'achat reste en français : « Le compteur tourne en millions. Tu montes, tu t'accroches, tu ne négocies pas le prix. ».
- **Où** : code/voitures/cars.js:69 `desc:'Le compteur tourne en millions. Tu montes, tu t\'accroches, tu ne négocies pas le prix.'`. grep -rn dans code/ ne trouve que cette ligne : aucune clé I18N.
- **Correction** : Dans voitures/retour-deuche-taxi.js : Object.assign(I18N,{"Le compteur tourne en millions. Tu montes, tu t'accroches, tu ne négocies pas le prix.":"The meter runs in millions. Get in, hold on, don't haggle."});

### V3 [chat retiré]
- **Le joueur voit** : Sur le site : le CHAT POP-TART, qu'on ne peut plus acheter, reste compté dans les totaux de l'inventaire (« x / … » voitures et les cases fantômes à découvrir) et du profil (« CAISSES x / … ») : un nouveau joueur ne peut jamais les remplir. L'ARC-EN-CIEL gonfle de même le total des traînées. Il reste aussi dans le carrousel du garage (famille LÉGENDAIRE, cadenas « PLUS EN VENTE »). La fiche peut y ajouter « + TRAÎNÉE ARC-EN-CIEL INCLUSE », non vu à l'écran.
- **Où** : interface/garage-menu-inventaire.js:208 `if(!carRetiree(i))n++` ; interface/inventaire-grand.js:20 (ivAbsents, même test) ; voitures/plaque.js:325 `if(carRetiree(i))continue;tot++` ; garage-lacher.js:106 garageListe → rarListe (economie/aura-banque-contrats.js:73, qui ne teste que carRetiree) ; photos-films.js:435 `shArcHtml(i,a){return (i===chatPackI()&&!a)?…'+ TRAÎNÉE ARC-EN-CIEL INCLUSE'…}`, appelé par boutique.js:66 et boutique-scene-1.js:610. La caisse est hors vente : voitures/deblocage.js:47 `horsVente:1`, et carEnVente est faux (aura-banque-contrats.js:45). La boutique des voitures l'écarte bien (bqPieces exclut premium) ; c'est le garage qui la garde.
- **Correction** : Dans invTotal, ivAbsents, plaque.js:325 et rarListe, sauter une caisse !carEnVente(i) que le joueur n'a pas. Dans shArcHtml, demander carEnVente(i). Ou mettre le chat en `retire` sur le site aussi, comme dans l'app.

### V4
- **Le joueur voit** : À la boutique, rayon VOITURES, l'intertitre de chaque rareté affiche « 0/8 », « 0/5 »… même quand on a déjà plusieurs caisses de cette famille. Le compteur « à toi / total » reste presque toujours à 0.
- **Où** : interface/boutique-scene-1.js:207 bqVoitRail `if(bqA(k))ok[f]=(ok[f]|0)+1` ; :204 `const cpt='<em><i>'+a+'</i>/'+n+'</em>'`. Or bqPieces (:196) sort de la liste une caisse à toi (`if(!cousin()&&bqA('v:'+i)&&!(GBQ.partant…))continue;`, Sacha le 11/11).
- **Correction** : N'afficher que `n` (le nombre à acheter), ou calculer a/n sur rarListe(f) entière.

### V5 [App Store]
- **Le joueur voit** : La description App Store (FR et EN) promet « nuages, forêt, canyon, glacier, volcan, villes… ». La forêt et le volcan n'existent pas, le glacier n'est plus tiré, et il n'y a qu'une ville (Crypto City).
- **Où** : app-ios/fiche/FICHE-APP-STORE.md:60 `• Des mondes qui s'enchaînent : nuages, forêt, canyon, glacier, volcan, villes…` et :116 (EN). Les maps : maps/niveaux.js (SF_CARTES : MER DE NUAGES, CRYPTO CITY, PICS DE JADE, LE GLACIER hors tirage, EN ORBITE, LES PROFONDEURS, canyon, dunes hors tirage).
- **Correction** : « nuages, Crypto City, pics de jade, orbite, profondeurs, canyon… » / « clouds, Crypto City, jade peaks, orbit, the depths, canyon… ».

### V6 [aide en ligne]
- **Le joueur voit** : La page d'assistance dit de régler IMAGE sur « RAPIDE » (« GRAPHICS to "FAST" »). Le réglage du téléphone n'affiche que BASSE / HAUTE (LOW / HIGH).
- **Où** : app-ios/fiche/assistance.html:120 `passez IMAGE sur « RAPIDE »` et :192 `set GRAPHICS to "FAST"`, avec la copie publiée pages-app/assistance.html. L'affichage : interface/passe-textes.js:6 `'RAPIDE':'BASSE'` et :9 `'RAPIDE':'LOW'` ; moteur/mobile-tactile.js:364.
- **Correction** : « BASSE » / « LOW » dans les deux copies, puis publier pages-app.


## MINEUR (9)

### M1 [aide en ligne]
- **Le joueur voit** : L'assistance nomme « Restaurer un code » et « Effets sonores et Musique », alors que les réglages du téléphone disent « ENTRER UN CODE » et « SON / MUSIQUE ».
- **Où** : app-ios/fiche/assistance.html:98, :115, :170 et :187 ; à comparer avec page/ecrans-menus.html:148 (`data-fr="ENTRER UN CODE"`) et moteur/mobile-tactile.js:378-379.
- **Correction** : « ENTRER UN CODE » / « ENTER A CODE » et « SON et MUSIQUE » / « SOUND and MUSIC » dans les deux copies.

### M2 [App Store]
- **Le joueur voit** : Les notes au testeur d'Apple annoncent « 8 cars and 29 paint jobs », alors que la même fiche, et le jeu, en comptent 10. La fiche annonce aussi « Une cinquantaine de voitures » pour environ 45 qu'on peut obtenir.
- **Où** : app-ios/fiche/FICHE-APP-STORE.md:177 `(8 cars and 29 paint jobs, …)` contre :170 `39 produits non consommables (10 voitures + 29 peintures`. Aussi :54 et :110.
- **Correction** : « 10 cars and 29 paint jobs » ; « Plus de quarante voitures » / « Over forty cars ».

### M3 [traînées]
- **Le joueur voit** : Après la fusion de sans-trainees, la fiche App Store dira encore « Peintures, ailes et traînées à essayer en 3D », et la case 5 du calendrier de série (une traînée) se change en +2 jetons.
- **Où** : app-ios/fiche/FICHE-APP-STORE.md:55 et :111 : vérifié, la branche claude/sans-trainees-fed5f1 ne les a pas changées. missions/aujourdhui.js:33 `{tr:1}` et :44 (le repli sur 2 jetons), inchangés dans la branche.
- **Correction** : Retirer « traînées » / « trails » de la fiche avec la fusion ; dire à Sacha que le jour 5 de la série donnera des jetons, ou lui choisir un autre lot.

### M4
- **Le joueur voit** : L'ICEBERG s'affiche « 0,80 € » avec « 1,61 € » barré et le bandeau « OFFRE DE L'HIVER ». La caisse n'a jamais été vendue 1,61 € (elle coûtait 3,2 M$ d'argent du jeu) : c'est un prix barré fictif.
- **Où** : code/voitures/deblocage.js:112 `{k:'premium',eur:'0,80 €',rar:'leg',une:1,promo:{av:'1,61 €',t:'OFFRE DE L\'HIVER'}}` ; l'affichage : economie/achats-store.js:180 promoDe. Sacha l'a demandé mot pour mot (commentaire du 18/11 : « 80 centimes au lieu de 1,61 € en mode promo ») ; passation/qualite/voitures-tri.md:88-92 note déjà le risque (directive Omnibus).
- **Correction** : Enlever `av` de `promo` et garder le bandeau seul. C'est à Sacha de trancher : c'est sa demande.

### M5 [nom]
- **Le joueur voit** : La mission « FRÔLE {v} TOURS EN UN SAUT (LA VILLE) » et des défis « dans la ville » parlent de LA VILLE, alors que la map s'appelle partout CRYPTO CITY (la règle de Léo du 03/11).
- **Où** : missions/table.js:27 ; les défis de peinture de economie/boutique.js et livrees.js qui disent « dans la ville » (lignes données par les chercheurs ; grep confirme la mission tours5). maps/niveaux.js : ville et crypto ont toutes deux `nm:'CRYPTO CITY'`.
- **Correction** : « (CRYPTO CITY) » / « in Crypto City ».

### M6 [traduction]
- **Le joueur voit** : Dans le panneau RÉGLAGES classique (surtout sur l'ordinateur), en anglais, le bouton dit encore « Copier ma sauvegarde ».
- **Où** : page/ecrans-menus.html:211 `…</i> Copier ma sauvegarde</button>`. La seule clé porte l'émoji : interface/traductions.js:26 `'📋 Copier ma sauvegarde':'📋 Copy my save'`.
- **Correction** : Ajouter 'Copier ma sauvegarde':'Copy my save'.

### M7 [filtre de rareté]
- **Le joueur voit** : Dans la barre des familles du garage (mode TOUT), il y a sans doute des boutons MYTHIQUES et INFINIS qui ouvrent une bande vide : aucune caisse n'a ces raretés.
- **Où** : economie/aura-banque-contrats.js:61 `const RAR_FAM=RARETES.filter(function(x){return x.id!=='exotique';});` (mythique et infini restent) ; interface/garage-lacher.js:173 (un bouton par famille, sans masquer les familles vides hors du mode boutique). carRar (:67) ne rend jamais mythique ni infini : les cars ne portent que commun, rare, epique et legendaire, et premium donne legendaire. Probable : je n'ai pas vu à l'écran si la barre #gRar est montrée dans ce mode.
- **Correction** : Filtrer RAR_FAM sur rarListe(x.id).length>0, ou retirer mythique et infini comme exotique.

### M8 [missions]
- **Le joueur voit** : Deux missions mesurent la même chose et tombent ensemble : « JOUE SUR CHAQUE MAP AU MOINS UNE FOIS » (30 000 €) et « AVOIR EXPLORÉ CHAQUE MAP » (LE ROUGE-GORGE).
- **Où** : missions/table.js:79 et :81, toutes deux `k:'cartes',v:'tot'`. Le commentaire de :80 le dit déjà : « (à confirmer : deux missions identiques) ».
- **Correction** : Donner une autre mesure à maps2 (cartesP ou meteoMap), ou fusionner les deux. C'est à Sacha de choisir.

### M9 [sauvegarde]
- **Le joueur voit** : Dans l'app, un testeur qui avait acheté le CHAT POP-TART le perd sans aucun message (« QUITTE LE GARAGE » n'apparaît pas, car il n'y a rien à rembourser) et repart en LA HONTE. Il perd aussi l'arc-en-ciel.
- **Où** : code/sauvegarde.js:150 `let p9=(CAR_UNLOCK[x]&&CAR_UNLOCK[x].p)||0` vaut 0 pour une caisse premium, donc :156 `if(rb){…this.remb=…}` ne s'exécute pas. Le chat est retiré dans l'app : preparer-www.js:185.
- **Correction** : Pousser le nom d'une caisse premium retirée dans SAVE.remb, avec un message sans montant. Cela ne touche que des testeurs.


## Écartées par le vérificateur (3)

- Au garage, la pastille LÉGENDAIRES compte le CHAT POP-TART dans son « x / y » (textes n°23). — Le « a/L » de garage-lacher.js:173 ne va que dans l'aria-label et le title. Le bouton visible ne montre que le nom de la famille et son logo (commentaire « (2026-10-09) le LOGO de la famille, plus de compte »). Le joueur ne le voit pas. Le vrai défaut du chat dans les comptes est retenu dans la ligne inventaire/profil.

- Après la fusion de sans-trainees : les missions tr5, tr10 et trall restent visibles avec des totaux à 0, eng30 donne la traînée FOUDRE DIVINE, l'onglet TRAÎNÉES existe encore (textes n°20, tables « à la fusion »). — La branche claude/sans-trainees-fed5f1 retire déjà tr5, tr10 et trall de missions/table.js (grep : seul eng30 reste, annoté du 21/11 et caché par m2Dispo) et l'arc-en-ciel de COSM. L'écran le confirme aussi : la branche retire les onglets et BQ_CATS. Ce qui reste (la fiche App Store, le jour 5 de la série) est gardé en mineur.

- Dans le carrousel du garage, le CHAT a « + TRAÎNÉE ARC-EN-CIEL INCLUSE » sous son nom dans la BOUTIQUE (écrans n°1). — Rejeté pour la boutique seulement : bqPieces (boutique-scene-1.js:196) ne met en rayon que les caisses `u.p>0&&u.k!=='premium'` ou `k==='mis'`, donc le chat n'est jamais sur le plateau de la boutique. La pastille reste possible dans la fiche d'achat du garage (boutique.js:66) : c'est gardé, en non vérifié, dans la ligne chat/comptes.


## Pas couvert
Ce que les quatre angles n'ont pas couvert :
(1) Sur le site, les 10 caisses payées en € (et les peintures en €) ne s'achètent pas sans StoreKit, alors que les compteurs de l'inventaire et du profil (invTotal, plaque.js:325) les comptent quand même. Seul m2Col les sort. Le défaut « x / y jamais plein » est donc bien plus large que le chat. Personne n'a regardé ce que dit le bouton ACHETER d'une caisse en € sur le site.
(2) Les traductions anglaises des textes recomposés à l'exécution (concaténations hors TR, innerHTML), les aria-label posés en JS et les noms de figures de figures.js : aucun angle ne les a contrôlés de façon exhaustive.
(3) L'écran de révélation, les cartes postales des portails, l'auto-école, la machine à sous, le fil des annonces, les astuces de chargement et l'écran de mort : survolés au mieux. Il faut y chercher des mentions du glacier, de la forêt, des dunes ou de caisses retirées (la clé « ENCASTRE DANS UN ARBRE » a été vue morte, mais personne n'a prouvé qu'elle ne s'affiche plus).
(4) Les compteurs de météo par map (meteoMap, LA STRATOS) et cartes (m2Cartes) : je n'ai pas vérifié que leur total exclut bien banquise et dunes, ni, sur téléphone, crypto (SF_HORS.crypto est vrai sous ALLEGE). Si un total compte une map hors tirage, une mission de plus devient impossible sur iPhone.
(5) Le vrai www/ du build 126 : app-ios/www est daté du 14/11 et index.html n'est plus d'accord avec les morceaux (--verifier). Personne n'a confirmé que le build installé contient ce qui est décrit.
(6) Les images et icônes d'objets disparus (tr_arc dans atelier-ferme.js:735, BQ_TR_PHOTO arcenciel), le CSS et ROBLOX/ : non audités.
(7) La musique (« chaque musique » au palier 10) face aux morceaux réellement présents : non vérifiée.
(8) Je n'ai pas relu ligne à ligne les défis « dans la ville » des peintures (boutique.js:355/358, livrees.js:218) : grep ne montre que des descriptions, pas forcément des défis.
