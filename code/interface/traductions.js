/* ============================================================================
   TRADUCTION FR / EN (2026-08-03)
   La mécanique de langue existait (sélecteur + devise) mais TOUS les textes étaient en français.
   PARTI PRIS : la clé du dictionnaire est LA PHRASE FRANÇAISE elle-même. Le code reste donc lisible
   (`showMsg('CATAPULTE !')`), rien ne casse si une traduction manque — on retombe sur le français —
   et il n'y a pas 400 constantes `MSG_042` à maintenir en parallèle.
   ⚠ TR() fait une correspondance EXACTE, sans magie de remplacement partiel : une substitution de
   fragments mangerait « COMÈTE » dans « COMÈTE 👑 ». Les phrases composées à l'exécution
   (« ⚙ »+nom du moteur) appellent donc TR() sur CHAQUE morceau, à la composition.
   ========================================================================== */
const I18N={
 // ---- la conduite (les textes qui jaillissent au-dessus de la caisse) ----
 'FRÔLÉ !':'CLOSE CALL!','PORTE !':'GATE!','PARFAIT !':'PERFECT!','DIVIN !!':'DIVINE!!',
 'AU CHEVEU !!':'CLOSE ONE!!','ARRACHÉE !':'JUST IN TIME!','NOUVEAU RECORD !':'NEW RECORD!','PLUS QUE':'ONLY','ENCORE':'NEED',
 'QUITTER LA PARTIE ?':'QUIT THE RUN?','RECOMMENCER ?':'RESTART?','Tes gains sont versés au compte.':'Your winnings go to your account.',
 'Les gains de cette partie ne seront PAS versés.':'This run\'s winnings will NOT be paid.','CONTINUER':'CONTINUE','RASE-BORD':'EDGE RIDER','FRÉNÉSIE !':'FRENZY!','FRÉNÉSIE':'FRENZY',
 // ---- interface ----
 'GARAGE':'GARAGE','ÉQUIPER':'EQUIP','✓ ÉQUIPÉE':'✓ EQUIPPED','🔒 VERROUILLÉE':'🔒 LOCKED',
 'glisse pour tourner · molette pour zoomer':'drag to turn · scroll to zoom',
 'clique sur CASH CAR — le son s\'allume avec toi':'click on CASH CAR — sound comes alive with you',
 'cours après le cash · ne tombe jamais':'chase the cash · never fall',
 'GAME OVER':'GAME OVER','VALIDER':'CONFIRM','★ NOUVEAU RECORD — TON NOM':'★ NEW RECORD — YOUR NAME',
 'Prêt à repartir ?':'Ready to go again?','NIVEAU':'LEVEL','AU-DESSUS DE LA VILLE':'ABOVE THE CITY','MER DE NUAGES':'SEA OF CLOUDS','EN ORBITE':'IN ORBIT','TOURNE TON TELEPHONE':'TURN YOUR PHONE','CASH CAR SE JOUE A LA VERTICALE':'CASH CAR IS PLAYED UPRIGHT','Jouer':'Play','Garage':'Garage','Réglages':'Settings','Survivant · off':'Survivor · off',
 'Langue':'Language','Freestyle':'Freestyle','Survivant':'Survivor','on':'on','off':'off',
 'Audio':'Audio','Effets sonores':'Sound effects','Devise':'Currency',
 'Commandes':'Controls','Sauvegarde':'Save','📋 Copier ma sauvegarde':'📋 Copy my save',
 'conduire · piloter en vol':'drive · steer in flight','nitro · double-tap = DÉCOLLAGE':'nitro · double-tap = LIFT-OFF',
 'drift':'drift','replacer la caisse':'respawn the car','pause':'pause','rejouer':'play again',
 'Espace':'Space','Entrée':'Enter','Pad gauche':'Left pad','Pad + frein':'Pad + brake','En vol':'In flight',
 'volant · tirer vers le bas = frein':'steering · pull down = brake',
 'le pad devient un joystick (haut/bas)':'the pad becomes a joystick (up/down)',
 'pouce droit · double-tap = DÉCOLLAGE':'right thumb · double-tap = LIFT-OFF',
 'NITRO INFINIE — 6 s À FOND !':'INFINITE NITRO — 6 s FLAT OUT!','NITRO ∞':'NITRO ∞',
 '🪂 AIRTIME INFINI — 10 s DE VOL !':'🪂 INFINITE AIRTIME — 10 s OF FLIGHT!','AIR ∞':'AIR ∞',
 '⚡ VITESSE +60% — 6 s !':'⚡ SPEED +60% — 6 s!','VITESSE +60%':'SPEED +60%',
 'Volumes':'Volume','Musique':'Music','Effets et moteur':'Effects and engine','Voix':'Voice',
 
 'NITRO (ESPACE)':'NITRO (SPACE)','km/h':'km/h','SON':'SOUND','VOIX':'VOICE','RESET':'RESET','MUS':'MUS',
 '🏆 TOP 10':'🏆 TOP 10','Aucun score — sois le premier !':'No score yet — be the first!',
 'AUCUN RECORD — À TOI DE JOUER':'NO RECORD YET — YOUR MOVE','RECORD':'RECORD','MEILLEURE CAISSE':'BEST CAR',
 'record : ':'best : ','Prochaine voiture à':'Next car at',
 'PRÉSENTE':'PRESENTS','Boost rendu':'Boost yield','Fréquence d\'apparition':'Spawn frequency',
 'ÉTAL — RÉGLAGE DES FRUITS':'STALL — FRUIT SETTINGS','ATELIER — LES MOTEURS':'WORKSHOP — ENGINES',
 '🛝 Parc freestyle':'🛝 Freestyle park','🏁 Survivant':'🏁 Survivor','ON':'ON','OFF':'OFF',
 'Le garage se visite depuis le menu':'The garage is visited from the menu',
 'Ça se visite depuis le menu':'That is visited from the menu',
 'MODE SURVIVANT AU PROCHAIN DÉPART':'SURVIVOR MODE ON NEXT RUN','SURVIVANT DÉSARMÉ':'SURVIVOR DISARMED',
 'PAUSE':'PAUSE','GO !':'GO!','MOTEUR MAX':'MAX ENGINE','PIÈCES':'COINS','pièces de ':'coins worth ',
 'FIGURES':'TRICKS','CHAÎNE MAX':'BEST CHAIN','BUMPS':'BUMPS','ZONES':'ZONES','GAPS':'GAPS','VMAX':'TOP SPEED',
 '🔑 DÉBLOQUÉ : ':'🔑 UNLOCKED: ','PALIER':'TIER','CAISSE':'CAR',
 'COMPTE':'ACCOUNT','VIREMENT':'TRANSFER','AURA':'AURA','NOUVEAU RANG !':'NEW RANK!','IL TE MANQUE':'SHORT BY','EST À TOI':'IS YOURS','débités':'charged',
 'JOUER AVEC CELLE-CI':'PLAY WITH THIS ONE','ACHETER — ':'BUY — ','IL MANQUE ':'SHORT BY ',
 'ANONYME':'NOBODY','REMARQUÉ':'NOTICED','ON PARLE DE TOI':'THEY\'RE TALKING ABOUT YOU','RÉPUTÉ':'RENOWNED',
 'LÉGENDE LOCALE':'LOCAL LEGEND','STAR DU BITUME':'ASPHALT STAR','MYTHE':'MYTH','DIVINITÉ DU CIEL':'SKY GOD','PATRON DU CIEL':'BOSS OF THE SKY','ICÔNE':'ICON','LÉGENDE ÉTERNELLE':'ETERNAL LEGEND','LE CIEL T\'APPARTIENT':'THE SKY IS YOURS',
 // ---- messages de jeu ----
 '↻ ON REPART':'↻ HERE WE GO AGAIN','✦ NOUVEAU SECTEUR':'✦ NEW SECTOR','LA NUIT TOMBE…':'NIGHT IS FALLING…',
 '🚀 DÉCOLLAGE — TOUT ×2 ! ★':'🚀 LIFT-OFF — EVERYTHING ×2! ★',
 '★ DÉCOLLAGE PRÊT — double-tape NITRO ! ★':'★ LIFT-OFF READY — double-tap NITRO! ★',
 '🪦 ÉLIMINÉ — DERNIER DE LA MINUTE !':'🪦 ELIMINATED — LAST OF THE MINUTE!',
 '⚠ ATTENTION !<br>TU ES DERNIER<br>EXPLOSION DANS : 00:':'⚠ WARNING!<br>YOU ARE LAST<br>EXPLOSION IN: 00:',
 'PILE AU CENTRE 🎯':'DEAD CENTER 🎯','À RECULONS — MÊME PAS REGARDÉ !':'BACKWARDS — DIDN\'T EVEN LOOK!',
 'FACE CACHÉE ×2':'HIDDEN FACE ×2',
 'CHAÎNE PERDUE':'CHAIN LOST','RECORD BATTU !':'RECORD BROKEN!','VITESSE':'SPEED','REPORT +':'CARRY-OVER +','⚠ ROULE OU CRÈVE — ':'⚠ DRIVE OR DIE — ',
 '🐷 TIRELIRE ÉVENTRÉE +':'🐷 PIGGY BANK CRACKED +','💸 TU COMPTES EN ':'💸 YOU NOW COUNT IN ',
 '🐷 TIRELIRE ÉVENTRÉE — ':'🐷 PIGGY BANK CRACKED — ',' EN POCHE':' IN POCKET',
 '🛡 L\'ASSURANCE RÉPOND — ':'🛡 THE INSURANCE PAYS OUT — ','POUSSÉE ×':'THRUST ×',
 // ---- les phrases de saveur ----
 'ELLE EST À TOI':'SHE\'S YOURS','CLÉS EN MAIN':'KEYS IN HAND','LIVRÉE, RODÉE, VOLÉE':'DELIVERED, BROKEN IN, FLOWN',
 'TU CHANGES DE MONDE':'YOU\'RE CHANGING WORLDS','SIGNÉ, EMBARQUÉ':'SIGNED, SEALED, DRIVEN','ELLE T\'ATTENDAIT':'SHE WAS WAITING FOR YOU',
 'NOUVEAU JOUET':'NEW TOY','ENCARTÉE AU GARAGE':'PARKED IN YOUR GARAGE',
 'GO ! NE MEURS PAS':'GO! DON\'T DIE','PIED AU PLANCHER — QUESTIONS APRÈS':'FLOOR IT — QUESTIONS LATER',
 'LA PRUDENCE RESTE AU GARAGE':'CAUTION STAYS IN THE GARAGE','ROULE COMME SI L\'ESSENCE ÉTAIT GRATUITE':'DRIVE LIKE FUEL IS FREE',
 'LE FREIN, C\'EST LA PÉDALE DES AUTRES':'THE BRAKE IS OTHER PEOPLE\'S PEDAL','VAS-Y. LE CIEL REGARDE.':'GO ON. THE SKY IS WATCHING.',
 'NOUVELLE ZONE !':'NEW ZONE!','ZONE AVALÉE — SUIVANTE !':'ZONE SWALLOWED — NEXT!','ENCORE UNE ZONE AU COMPTEUR !':'ANOTHER ZONE IN THE BAG!',
 'LA ROUTE EST À TOI !':'THE ROAD IS YOURS!','ZONE SUIVANTE — ON RALENTIT PAS !':'NEXT ZONE — NO SLOWING DOWN!',
 '💸 IL PLEUT DES BILLETS — PARAPLUIE INUTILE':'💸 IT\'S RAINING CASH — UMBRELLA USELESS',
 '💸 LA BANQUE A APPELÉ : ELLE ABANDONNE':'💸 THE BANK CALLED: IT GIVES UP','💸 TON COMPTE A LE VERTIGE':'💸 YOUR ACCOUNT IS DIZZY',
 '💸 L\'ARGENT TOMBE PLUS VITE QUE TOI':'💸 MONEY FALLS FASTER THAN YOU',
 'LA ROUTE GAGNE. CETTE FOIS.':'THE ROAD WINS. THIS TIME.','LE BITUME SE SOUVIENDRA DE TOI':'THE TARMAC WILL REMEMBER YOU',
 'MÊME LES LÉGENDES TOUCHENT LE SOL':'EVEN LEGENDS HIT THE GROUND','CRASH TEST RÉUSSI. ENFIN… TEST.':'CRASH TEST PASSED. WELL… THE CRASH PART.',
 'LA GRAVITÉ : 1 — TOI : 0':'GRAVITY: 1 — YOU: 0','T\'ES MORT. LES THUNES, ELLES, RESTENT.':'YOU\'RE DEAD. THE CASH STAYS.',
 'REVIENS. LA VITESSE S\'ENNUIE DÉJÀ.':'COME BACK. SPEED IS ALREADY BORED.',
 '🏆 RECORD — LES AUTRES JOUENT À UN AUTRE JEU':'🏆 RECORD — EVERYONE ELSE IS PLAYING ANOTHER GAME',
 '🏆 LE LEADERBOARD A DEMANDÉ TON AUTOGRAPHE':'🏆 THE LEADERBOARD ASKED FOR YOUR AUTOGRAPH',
 '🏆 RECORD ÉCRASÉ — COMME TES SUSPENSIONS':'🏆 RECORD SMASHED — LIKE YOUR SUSPENSION',
 '🏆 HISTORIQUE. LA ROUTE S\'EN REMET À PEINE.':'🏆 HISTORIC. THE ROAD IS BARELY RECOVERING.',
 // ---- moteurs ----
 'MOTEUR ROUILLÉ':'RUSTY ENGINE','BICYLINDRE':'TWIN-CYLINDER','3 CYLINDRES':'3-CYLINDER','4 EN LIGNE':'INLINE-4',
 '4 SOUPAPES':'FOUR-VALVE','4 EN LIGNE TURBO':'TURBO INLINE-4','5 CYLINDRES':'5-CYLINDER','V6 BITURBO':'TWIN-TURBO V6',
 'BOXER À PLAT':'FLAT BOXER','V8 ATMO':'NA V8','V8 COMPRESSÉ':'SUPERCHARGED V8','QUADRITURBO':'QUAD-TURBO',
 'ROTATIF TRIPLE':'TRIPLE ROTARY','TURBINE À GAZ':'GAS TURBINE','TURBINE À PLASMA':'PLASMA TURBINE',
 'STATORÉACTEUR':'RAMJET','PULSORÉACTEUR':'PULSEJET','RÉACTEUR NUCLÉAIRE':'NUCLEAR REACTOR','CŒUR À FUSION':'FUSION CORE',
 'MOTEUR À DISTORSION':'WARP DRIVE','COMÈTE':'COMET','TROU NOIR':'BLACK HOLE',
 'Il tousse, il fume, il prie. Mais il tourne.':'It coughs, it smokes, it prays. But it runs.',
 'Deux cylindres. Un qui pousse, un qui regarde.':'Two cylinders. One pushes, one watches.',
 'Deux qui toussent, un qui prie.':'Two coughing, one praying.',
 'Le premier moteur qui ne s\'excuse pas.':'The first engine that doesn\'t apologize.',
 'Il respire enfin par le nez.':'It finally breathes through its nose.',
 'Le premier vrai souffle. Ça siffle.':'The first real breath. It whistles.',
 'Un chiffre impair, un bruit inoubliable.':'An odd number, an unforgettable noise.',
 'La forme fait le son. Le son fait le reste.':'The shape makes the sound. The sound does the rest.',
 'Deux turbos, zéro patience.':'Two turbos, zero patience.',
 'Le centre de gravité au ras du bitume.':'Centre of gravity scraping the tarmac.',
 'Le grondement qui fait trembler la dalle.':'The rumble that shakes the slab.',
 'Un compresseur, et la dalle demande grâce.':'One supercharger, and the slab begs for mercy.',
 'Dix cylindres, zéro argument.':'Ten cylinders, zero arguments.',
 'Douze cylindres qui hurlent à l\'unisson.':'Twelve cylinders screaming in unison.',
 'Deux V6 mariés de force. Ça marche.':'Two V6s married by force. It works.',
 'Seize. Parce que quinze, c\'était ridicule.':'Sixteen. Because fifteen was ridiculous.',
 'Seize cylindres en H. Interdit en course. Logique.':'Sixteen cylinders in an H. Banned from racing. Figures.',
 'Quatre escargots, une seule idée.':'Four snails, one single idea.',
 'Pas de pistons. Que du hurlement.':'No pistons. Just screaming.',
 'L\'hélicoptère a appelé. Il veut son moteur.':'The helicopter called. It wants its engine back.',
 'Plus de pistons. Un souffle continu, bleu.':'No more pistons. One continuous blue breath.',
 'Il n\'avale plus l\'air. Il l\'agresse.':'It no longer swallows air. It assaults it.',
 'Un battement par milliseconde. C\'est le tien qui suit.':'One beat per millisecond. Yours is the one struggling to keep up.',
 'Tu roules avec un cœur de centrale sous le capot.':'You drive with a power-plant core under the hood.',
 'Une petite étoile, sanglée sous le capot.':'A small star, strapped under the hood.',
 'Un gramme. Un seul. Ne freine pas.':'One gram. Just one. Do not brake.',
 'Ce n\'est plus toi qui avances. C\'est la route qui recule.':'You\'re not moving forward any more. The road is backing away.',
 'La caisse est EN FEU. Comme au premier jour.':'The car is ON FIRE. Just like day one.',
 'Tu ne brûles plus le carburant. Tu brûles le ciel.':'You don\'t burn fuel any more. You burn the sky.',
 'Plus rien ne s\'échappe. Même pas toi.':'Nothing escapes any more. Not even you.',
 // ---- voitures ----
 'ELDORADO':'ELDORADO','LE CAÏD':'THE BOSS','SA MAJESTÉ':'HER MAJESTY','ROSSO 40':'ROSSO 40','POSTER 84':'POSTER 84',
 'Rose bonbon, ailerons de requin et une banquette pour trois avocats.':'Candy pink, shark fins, and a bench seat for three lawyers.',
 'Trois tonnes de cube. Personne ne t\'a jamais demandé de te pousser.':'Three tons of cube. Nobody has ever asked you to move over.',
 'Rouge course, aileron plateau. La caisse de rêve : 1,5 million, et chaque dollar se voit.':'Racing red, a wing like a tray. The dream car: 1.5 million, and every dollar shows.',
 'Elle était punaisée au mur de ta chambre. Maintenant, c\'est toi qui la conduis.':'She was pinned to your bedroom wall. Now you\'re the one driving her.',
 'LA CERISE':'THE CHERRY','Elle ouvre les yeux à chaque coup de nitro. Une tonne, cent quinze chevaux, et le plus grand sourire du parking.':'It opens its eyes at every nitro hit. One ton, 115 horsepower, and the biggest smile in the parking lot.', // (JAPONAISES) 83 — la MX-5 NA
 'LA HONTE':'THE DISGRACE',
 'ANTIMATIÈRE':'ANTIMATTER',
 'LA LAME':'THE BLADE','Le même petit roadster, avec un toit qui se range en treize secondes. Il ne pleut jamais assez vite pour la rattraper.':'The same little roadster, with a roof that tucks away in thirteen seconds. It never rains fast enough to catch her.', // (JAPONAISES) 85 — la MX-5 RF
 'LE TOFU':'THE TOFU','Livreur de tofu au petit matin, roi de la descente la nuit. Le verre d\'eau posé sur le tableau de bord ne se renverse jamais.':'Tofu delivery boy at dawn, king of the downhill at night. The glass of water on the dashboard never spills.',
 'LA BÊTE':'THE BEAST','875 chevaux pour 875 kilos, et un aileron plus large qu\'un canapé. Elle a avalé la montagne en huit minutes : le sommet ne s\'en est jamais remis.':'875 horsepower for 875 kilos, and a wing wider than a sofa. It swallowed the mountain in eight minutes: the summit never got over it.',
 'LA FIDÈLE':'THE FAITHFUL','La voiture la plus vendue de la planète. Elle ne tombe jamais en panne, ce qui est presque suspect.':'The best-selling car on the planet. It never breaks down, which is almost suspicious.',
 // ---- descriptions des modes (menu mobile) ----
 'Sept voitures de police sur la piste, à armes égales. Toutes les 60 secondes, le dernier explose. Une place à prendre : la première.':'Seven police cars on the track, evenly matched. Every 60 seconds, the last one blows up. One spot to take: first place.',
 
 'On s\'entraîne sur la vraie piste : la caisse se replace au lieu de mourir. Idéal pour les sauts — mais aucun score n\'est enregistré.':'Practice on the real track: the car respawns instead of dying. Great for jumps — but no score is saved.'
};


// ---- L'ÉCONOMIE v3 (2026-09-25) : boutique, contrats, objectif ----
Object.assign(I18N,{"BOUTIQUE": "SHOP", "CONTRAT": "CONTRACT", "REMPLI !": "COMPLETE!", "OBJECTIF": "GOAL", "TU PEUX TE L'OFFRIR": "YOU CAN AFFORD IT", "ACHETER": "BUY", "ARTICLES À TA PORTÉE": "ITEMS YOU CAN AFFORD", "ARTICLE À TA PORTÉE": "ITEM YOU CAN AFFORD", "EST À TOI — VA LA VOIR": "IS YOURS — GO SEE IT", "EST À TOI — ESSAIE-LA": "IS YOURS — TRY IT ON", "VERSÉS SUR TON COMPTE": "PAID INTO YOUR ACCOUNT", "VOITURES": "CARS", "PEINTURE": "PAINT", "AILES": "WINGS", "TRAÎNÉES": "TRAILS", "TRAÎNÉE": "TRAIL", "ÉQUIPÉE": "EQUIPPED", "D'ORIGINE": "FACTORY", "MENTHE GLACÉE": "ICE MINT", "BLEU MINUIT": "MIDNIGHT BLUE", "NOIR MAT": "MATTE BLACK", "COUCHER DE SOLEIL": "SUNSET", "CHROME MIROIR": "MIRROR CHROME", "OR MASSIF": "SOLID GOLD", "PANNEAUX": "PANELS", "HÉLICES": "PROPELLERS", "PLUMES D'ANGE": "ANGEL FEATHERS", "CHAUVE-SOURIS": "BAT", "NITRO": "NITRO", "MENTHE": "MINT", "ROSE NÉON": "NEON PINK", "POUDRE D'OR": "GOLD DUST", "ARC-EN-CIEL": "RAINBOW", "LA BULLE": "THE BUBBLE", "LE SCARABÉE": "THE SCARAB", "LE COMBI": "THE CAMPER", "LA DOLORÈS": "LA DOLORES", "La teinte du constructeur. Elle a fait ses preuves.": "The factory color. It has proved itself.", "Fraîche comme un billet qui sort du distributeur.": "Fresh as a bill straight out of the ATM.", "Le bleu des néons de la ville, à trois heures du matin.": "The blue of the city neons, at 3 a.m.", "Pas un reflet. Même la police hésite.": "Not a single reflection. Even the cops hesitate.", "Du miel en bas, du violet en haut : le ciel de 19 h, en laque.": "Honey at the bottom, violet on top: the 7 p.m. sky, in lacquer.", "Tu te vois dedans. Les autres aussi.": "You can see yourself in it. So can everyone else.", "Ne s'achète pas : se mérite au contrat n° 4.": "Not for sale: earned with contract #4.", "Deux planches de planeur qui sortent des flancs. Sobre.": "Two glider boards sliding out of the sides. Understated.", "Quatre rotors. Ça ne vole pas mieux, mais ça brasse de l'air.": "Four rotors. It does not fly any better, but it moves a lot of air.", "Blanches, en éventail. Le ciel te prend pour un des siens.": "White, fanned out. The sky takes you for one of its own.", "Membranes noires et doigts d'os. Pour les vols de nuit.": "Black membranes and bony fingers. For night flights.", "Orange brûlé. Le classique des tuyères.": "Burnt orange. The exhaust classic.", "Un sillage vert d'eau qui sent le propre.": "A sea-green wake that smells clean.", "Le rose des enseignes. On te suit à la trace.": "Neon-sign pink. Everyone can follow you.", "Tu ne laisses pas de la fumée derrière toi. Tu laisses de l'or.": "You do not leave smoke behind. You leave gold.", "Ne s'achète pas : se mérite au contrat n° 5.": "Not for sale: earned with contract #5.", "Ronde comme un sou neuf. Tout le monde lui sourit, même la police.": "Round as a shiny penny. Everyone smiles at it, even the cops.", "Des fleurs sur la tôle, la paix sur le nez, et 45 chevaux qui font de leur mieux.": "Flowers on the bodywork, peace on the nose, and 45 horses doing their best.", "Inox brossé, portes papillon. À 88 à l'heure elle remonte le temps, paraît-il. Toi, tu vas plus vite.": "Brushed steel, gullwing doors. At 88 it travels back in time, apparently. You go faster.", "IL TE MANQUE": "YOU ARE SHORT", "COMPTE": "ACCOUNT"});
Object.assign(I18N,{"TOURNE": "TURN", "VOLE": "FLY", "Glisse ton *pouce* à gauche, puis à droite": "Slide your *thumb* left, then right", "Flèches [←] puis [→]": "Arrows [←] then [→]", "Garde le doigt sur *NITRO*": "Keep your finger on *NITRO*", "Maintiens [ESPACE]": "Hold [SPACE]", "Sors de la route *par le bord* !": "Drive off the road *over the edge*!", "En l'air : garde *NITRO* et reviens sur la route": "In the air: hold *NITRO* and get back over the road", "En l'air : [ESPACE] et reviens sur la route": "In the air: hold [SPACE] and get back over the road", "Vise *l'anneau* sur la route. Doré = parfait !": "Aim for *the ring* on the road. Gold = perfect!", "Tape *2 fois* vite sur *NITRO*": "Tap *NITRO* *twice*, fast", "Tape *2 fois* vite sur [ESPACE]": "Tap [SPACE] *twice*, fast", "6 gestes. Ici, *impossible de perdre* !": "6 moves. Here, *you can't lose*!", "BIEN !": "NICE!", "PARFAIT !": "PERFECT!", "ÇA DÉCOLLE !": "LIFTOFF!", "TU VOLES !": "YOU'RE FLYING!", "POSÉ !": "LANDED!", "STYLÉ !": "STYLISH!", "TAPE 2 FOIS VITE SUR NITRO": "TAP NITRO TWICE, FAST", "SORTI ! SUIS LA ROUTE": "OFF THE ROAD! FOLLOW IT", "RATÉ ! ON RECOMMENCE": "MISSED! TRY AGAIN"}); // (2026-10-14) L'AUTO-ÉCOLE v2
Object.assign(I18N,{"SOIR": "EVENING", "NUIT": "NIGHT", "PLUIE": "RAIN", "LA VILLE": "THE CITY", "Restaurer un code": "Restore a code", "REPORT": "CARRY-OVER", "(au garage)": "(in your garage)", "Copie ce code :": "Copy this code:", "Colle ton code de sauvegarde :": "Paste your save code:", "PARFAIT ! ": "PERFECT! ", "PARFAIT !": "PERFECT!", "DIVIN !!": "DIVINE!!", "POSÉ LOURD — AÏE…": "HEAVY LANDING — OUCH…", "PARFAIT (BOOST ×2) !": "PERFECT (BOOST ×2)!", "DOUBLE MONSTRE": "DOUBLE MONSTER", "TRIPLE MONSTRE": "TRIPLE MONSTER", "🍉 PASTÈQUE !": "🍉 WATERMELON!", "🧃 RAFALE": "🧃 FRUIT RUSH", "⏱ AU CHEVEU —": "⏱ BY A HAIR —", "⏱ À L'ARRACHÉE —": "⏱ CLUTCH —", "ESSOREUSE COSMIQUE !!": "COSMIC SPIN CYCLE!!", "CHAÎNE ×": "CHAIN ×", "CARREAU": "DIAMOND", "CŒUR": "HEART", "TRÈFLE": "CLUB", "TÊTE DE MORT": "SKULL", "LE NOMBRE D'OR": "THE GOLDEN RATIO", "Z Q S D": "W A S D", "HORS DE L'EAU !": "OUT OF THE WATER!", "HORS DE L'EAU": "OUT OF THE WATER"}); // (2026-10-14) LES TEXTES : les clés qui manquaient (audits A, B, C du 14/10)
Object.assign(I18N,{"VERT OGRE": "OGRE GREEN", "Le vert des marais. Ça sent un peu, mais c'est chez toi.": "Swamp green. It smells a bit, but it's home.", "BLEU HÉRISSON": "HEDGEHOG BLUE", "Le bleu d'un hérisson pressé. Les anneaux sont en option.": "The blue of a hedgehog in a hurry. Rings sold separately.", "ROSE POUPÉE": "DOLL PINK", "Rose bonbon, laque parfaite. Tu n'es pas en plastique, tu es en carbone.": "Candy pink, flawless lacquer. You're not plastic, you're carbon fiber.", "BANANA": "BANANA", "Salopette en bas, jaune en haut. Elle dit « banana » à chaque virage.": "Overalls at the bottom, yellow on top. It says \"banana\" at every turn.", "NUIT DE GOTHAM": "GOTHAM NIGHT", "Noir laqué, la ville qui brille dedans. Les toits sont à toi.": "Gloss black with the city shining in it. The rooftops are yours.", "MONDE À L'ENVERS": "UPSIDE DOWN", "Noir en bas, rouge sang en haut : cette caisse vient de l'autre côté. Les guirlandes clignotent.": "Black at the bottom, blood red on top: this car came from the other side. The lights are flickering.", "VAPORWAVE": "VAPORWAVE", "Cyan, rose, violet : un coucher de soleil de 1986 sur une cassette usée.": "Cyan, pink, purple: a 1986 sunset on a worn-out tape.", "LAVE": "LAVA", "Du volcan au toit, la coulée ne refroidit jamais. N'y jette pas d'anneau.": "From the volcano to the roof, the flow never cools down. Don't throw a ring in.", "HOLOGRAMME": "HOLOGRAM", "Chrome irisé qui change de couleur à chaque angle. Une carte rare… en voiture.": "Iridescent chrome that changes color at every angle. A rare card… on wheels.", "SUPER GUERRIER": "SUPER WARRIOR", "Doré du toit aux pneus. Les cheveux se dressent, le niveau dépasse les 9 000.": "Gold from roof to tires. Hair standing up, power level over 9,000.", "PIGEON": "PIGEON", "Gris, deux barres noires, un reflet vert au cou. Le roi des toits bat des ailes trop vite et ne sait pas pourquoi.": "Gray, two black bars, a green sheen on the neck. The king of the rooftops flaps too fast and has no idea why.", "AVION EN PAPIER": "PAPER PLANE", "Une feuille à grands carreaux, trois plis, zéro aérodynamique. Ça plane quand même : c'est toi qui pilotes.": "A sheet of school paper, three folds, zero aerodynamics. It glides anyway: you're the pilot.", "MONARQUE": "MONARCH", "Des ailes de papillon orange et noir qui battent en plein vol. Délicates. Jusqu'à 900 à l'heure.": "Orange-and-black butterfly wings that flap mid-flight. Delicate. Up to 900 km/h.", "8-BIT": "8-BIT", "Des ailes d'ange en gros pixels, qui battent par à-coups. La console de ton grand frère approuve.": "Angel wings in chunky pixels, flapping frame by frame. Your big brother's console approves.", "BARON ROUGE": "RED BARON", "Deux plans de toile rouge, des haubans, une odeur d'huile de ricin. Un chien sur sa niche en rêve encore.": "Two red canvas wings, bracing wires, a whiff of castor oil. A dog on his doghouse still dreams about it.", "ENGRENAGES": "GEARWORKS", "Du laiton, de la toile et des rouages qui tournent. Léonard l'avait dessinée, toi tu la pilotes.": "Brass, canvas and spinning gears. Leonardo drew it; you fly it.", "AILES EN X": "X-FOILS", "Quatre plans qui s'écartent en X une fois dépliés. Verrouillez les ailes en position d'attaque.": "Four foils that split into an X once deployed. Lock wings in attack position.", "FÉE": "FAIRY", "Quatre voiles irisés qui bourdonnent. Il suffit d'y croire. Et d'un plein de nitro.": "Four shimmering veils that buzz. You just have to believe. And have a full tank of nitro.", "DRAGON": "DRAGON", "Membranes veinées de lave, griffe au poignet. Elles battent lentement : la puissance n'a pas besoin de se presser.": "Lava-veined membranes, a claw at the wrist. They beat slowly: real power never rushes.", "PHÉNIX": "PHOENIX", "Des plumes de feu qui ne s'éteignent jamais. Tu exploses ? Tu renais de tes cendres. Au prochain run.": "Feathers of fire that never go out. You blow up? You rise from your ashes. Next run.", "SAKURA": "SAKURA", "Des pétales de cerisier, comme dans un générique d'animé. Le drame, c'est pour les autres.": "Cherry blossom petals, straight out of an anime opening. The drama is for everyone else.", "MATRICE": "MATRIX", "Pilule rouge avalée : du code vert ruisselle derrière toi. La route, c'est toi qui la réécris.": "Red pill swallowed: green code streams behind you. You rewrite the road as you go.", "ANNEAUX D'OR": "GOLD RINGS", "Tu sèmes des anneaux comme un hérisson qui vient de se cogner. Sauf que toi, tu ne ralentis pas.": "You spill rings like a hedgehog that just got hit. Except you never slow down.", "PLUIE DE BLOCS": "BLOCK RAIN", "Des pièces de quatre carrés tombent en tournant. Aucune ligne ne disparaît : tout reste à toi.": "Four-square pieces tumble down. No line ever clears: you keep it all.", "GLOUTON": "CHOMPER", "Une ligne de pastilles et quatre fantômes à tes trousses. Lâche la nitro : ils deviennent bleus.": "A line of dots and four ghosts on your tail. Let go of the nitro: they turn blue.", "HYPERESPACE": "HYPERSPACE", "Les étoiles s'étirent en traits. Tu passes en vitesse lumière, les autres restent des touristes.": "Stars stretch into streaks. You jump to light speed; everyone else stays a tourist.", "LA GRILLE": "THE GRID", "Un mur de lumière dans ton sillage. Celui qui te colle finit en pixels.": "A wall of light in your wake. Whoever tailgates you ends up in pixels.", "FAIS PLEUVOIR": "MAKE IT RAIN", "Des liasses qui s'envolent à chaque nitro. Ce n'est pas du gaspillage, c'est de la communication.": "Cash flies out with every nitro. It's not a waste, it's marketing.", "FOUDRE DIVINE": "DIVINE LIGHTNING", "Des éclairs crépitent derrière toi. Le marteau, tu l'as laissé au garage.": "Lightning crackles behind you. You left the hammer in the garage."}); // (2026-10-14) LES PEINTURES, LES AILES ET LES TRAÎNÉES POP
Object.assign(I18N,{"SORTI ! GLISSE TON POUCE POUR SUIVRE LA ROUTE": "OFF THE ROAD! SLIDE YOUR THUMB TO FOLLOW IT", "TROP LONGTEMPS EN L'AIR : POSE-TOI AVANT": "TOO LONG IN THE AIR: LAND SOONER", "TOMBE DANS LE VIDE": "FELL INTO THE VOID", "ENCASTRE DANS UNE TOUR": "CRASHED INTO A TOWER", "6 S A L'ARRET : ROULE OU CREVE": "6 S STANDING STILL: DRIVE OR DIE", "DERNIER DE LA MEUTE": "LAST OF THE PACK", "CHAINE MAX": "BEST CHAIN", "ASTUCE": "TIP", "Tire le pouce vers le BAS en tournant : DRIFT !": "Pull your thumb DOWN while steering: DRIFT!", "En l'air : pouce en HAUT = plonge, en BAS = monte.": "In the air: thumb UP = dive, DOWN = climb.", "AUTO-ÉCOLE": "DRIVING SCHOOL", "PASSER": "SKIP", "TOURNE": "STEER", "DÉCOLLE": "TAKE OFF", "VOLE À LA NITRO": "FLY ON NITRO", "POSE-TOI": "LAND IT", "Glisse ton pouce à gauche… puis à droite.": "Slide your thumb left… then right.", "Maintiens NITRO : ça pousse fort.": "Hold NITRO: it pushes hard.", "Fonce hors de la route, par le bord. N'aie pas peur.": "Drive off the road, over the edge. Don't be scared.", "En l'air, MAINTIENS NITRO et reviens au-dessus de la route.": "In the air, HOLD NITRO and steer back over the road.", "Au-dessus de la route, l'anneau apparaît : pose-toi dessus (or = parfait).": "Over the road, the ring appears: land on it (gold = perfect).", "PERMIS OBTENU !": "LICENSE EARNED!", "ENCORE ! ET CETTE FOIS, NITRO EN L'AIR": "AGAIN! AND THIS TIME, NITRO IN THE AIR", "RATÉ ! ON RECOMMENCE": "MISSED! TRY AGAIN", "L'AUTO-ÉCOLE T'ATTEND AU PROCHAIN JOUER": "DRIVING SCHOOL AWAITS ON YOUR NEXT PLAY", "REVOIR L'AUTO-ECOLE": "REPLAY DRIVING SCHOOL"});
Object.assign(I18N,{"ENCORE ! NITRO EN L'AIR": "AGAIN! NITRO IN THE AIR"});
Object.assign(I18N,{"AUTO-ECOLE INTERROMPUE":"DRIVING SCHOOL STOPPED"}); // (2026-09-28) l'écran de fin d'une leçon QUITTÉE (mFill)
Object.assign(I18N,{"RECORD DE FRÉNÉSIE !":"FRENZY RECORD!","NITRO !":"NITRO!","FRENESIE":"FRENZY"});
Object.assign(I18N,{"NARCISSE":"NARCISSIST","MACHIAVEL":"MACHIAVELLI","PSYCHO":"PSYCHO","UNE FIGURE !":"DO A TRICK!","RACCOURCI !":"SHORTCUT!","TIENS LES TROIS TRAITS":"HOLD ALL THREE TRAITS","FIGURE · RACCOURCI · NITRO":"TRICK · SHORTCUT · NITRO","DRIFT OU FIGURE !":"DRIFT OR TRICK!","DE TRAVERS !":"SIDEWAYS!","À CONTRESENS !":"WRONG WAY!","POSE UNE FIGURE !":"LAND A TRICK!"});
Object.assign(I18N,{"OFFRE DE LANCEMENT": "LAUNCH OFFER", "LA CAISSE DU MOIS": "CAR OF THE MONTH", "Une voiture exclusive, sa peinture et sa traînée. Introuvable ailleurs.": "An exclusive car, its paint and its trail. Found nowhere else.", "BIENTÔT": "SOON", "VOITURES PREMIUM": "PREMIUM CARS", "LÉGENDAIRE": "LEGENDARY", "ÉPIQUE": "EPIC", "RARE": "RARE", "RESTAURER MES ACHATS": "RESTORE PURCHASES", "BIENTÔT DISPONIBLE — À LA SORTIE SUR L'APP STORE": "COMING SOON — AT THE APP STORE LAUNCH", "AUCUN ACHAT À RESTAURER": "NO PURCHASES TO RESTORE", "CONTRAT RÉUSSI": "CONTRACT DONE", "DÉBLOQUÉ": "UNLOCKED"});
Object.assign(I18N,{"DÉFI RÉUSSI": "CHALLENGE DONE", "DÉFIS RÉUSSIS !": "CHALLENGES DONE!", "MISSION RÉUSSIE": "MISSION DONE", "MISSIONS RÉUSSIES !": "MISSIONS DONE!", "MISSION RÉUSSIE !": "MISSION DONE!", "À GAGNER": "TO WIN", "Ne s'achète pas : elle se gagne en relevant des défis.": "Not for sale: won by beating challenges.","Ne s'achète pas : elle se gagne en relevant des missions.": "Not for sale: won by completing missions."});
Object.assign(I18N,{"NOUVEAU MOTEUR": "NEW ENGINE"});
Object.assign(I18N,{"VERSÉS AU COMPTE": "PAID INTO YOUR ACCOUNT", "MOTEUR": "ENGINE", "NOUVEAU RANG !": "NEW RANK!", "RECORD !": "RECORD!", "AURA": "AURA"});
Object.assign(I18N,{"À TOI": "YOURS", "CHAT POP-TART": "POP-TART CAT", "REQUIN": "SHARK", "COMÈTE": "COMET", "FORMULE OR": "GOLD FORMULA", "LE MANS 24": "LE MANS 24", "EL PATRON": "EL PATRON", "ACIDE": "ACID"});
Object.assign(I18N,{"Une pâtisserie industrielle avec une tête de chat et quatre roulettes. Personne n'a demandé pourquoi. Tout le monde a demandé comment.": "An industrial pastry with a cat's head and four little wheels. Nobody asked why. Everybody asked how.", "Bulle de verre, museau de grand blanc, quatre bras d'hélices repliés dans les flancs. Au sol il roule. En l'air, il chasse.": "Glass bubble, great-white snout, four propeller arms folded into its flanks. On the ground it drives. In the air, it hunts.", "Coin furtif, bulle de verre, dérive dorsale. La reine du ciel, et elle le sait. Personne ne l'a jamais vue de face.": "Stealth wedge, glass bubble, dorsal fin. Queen of the sky, and she knows it. No one has ever seen her from the front.", "Compacte japonaise passée au bain d'acide : capot vitré sur le bloc, aileron de table à repasser, échappement qui crache vert.": "A Japanese compact dipped in acid: glass bonnet over the engine, ironing-board wing, exhaust that spits green."});
Object.assign(I18N,{"RASE-BORD": "EDGE RIDER"});
Object.assign(I18N,{"FRONDE": "SLINGSHOT"}); /* (2026-09-30) LA FRONDE : le nom de l'aura, dans la chaîne */
// (2026-09-28, chasse aux détails) les figures les plus fréquentes restaient en français en anglais (au-dessus de la caisse et dans la liste de chaîne)
Object.assign(I18N,{'TONNEAU':'BARREL ROLL','TONNEAU !':'BARREL ROLL!','PAR-DESSUS':'OVER IT','PAR-DESSUS !':'OVER IT!','AIR MONSTRE':'MONSTER AIR','DAUPHIN EN VOL':'DOLPHIN RUN','POSE PARFAITE':'PERFECT LANDING','POSE DIVINE':'DIVINE LANDING','IMPACT METEORE':'METEOR IMPACT'});
Object.assign(I18N,{'VIBRATIONS':'VIBRATION'});Object.assign(I18N,{'APPRENDS A VOLER':'LEARN TO FLY','ESPACE TERMINE':'SPACE COMPLETE','PARIS TERMINE':'PARIS COMPLETE','LE SYSTEME SOLAIRE EST A TOI':'THE SOLAR SYSTEM IS YOURS'});
try{if(window.FIG)FIG.liste.forEach(function(f){if(f.en&&f.en!==f.n)I18N[f.n]=f.en;});if(window.FIG&&FIG.auto)Object.keys(FIG.auto).forEach(function(k){const f=FIG.auto[k];I18N[f.n]=f.en;});}catch(e){} // (2026-10-14) les noms des FIGURES (figures.js) en anglais
Object.assign(I18N,{'2 TAPS':'2 TAPS','GLISSER':'SLIDE','Pose le pouce sur *NITRO*, glisse, lâche':'Thumb on *NITRO*, slide, release','GLISSE DEPUIS NITRO, LACHE':'SLIDE FROM NITRO, RELEASE'}); // (2026-10-15) LA FIGURE AU GLISSÉ
Object.assign(I18N,{'ENTRER UN CODE':'ENTER A CODE','TOUT EST DÉBLOQUÉ !':'EVERYTHING UNLOCKED!','CODE INCONNU':'UNKNOWN CODE','FIGURE RATEE !':'BOTCHED TRICK!','FIGURES':'TRICKS','FIGURE':'TRICK','ACQUISE':'OWNED','AIR MONSTRE':'MONSTER AIR','DAUPHIN EN VOL':'DOLPHIN RUN','POSE PARFAITE':'PERFECT LANDING','POSE DIVINE':'DIVINE LANDING','IMPACT METEORE':'METEOR IMPACT'});
Object.assign(I18N,{"FRÉNÉSIE": "FRENZY", "FRÉNÉSIE !": "FRENZY!", "RESTE DANS LE ROUGE": "STAY IN THE RED", "PLUS VITE !": "FASTER!", "RISQUE + VITESSE": "RISK + SPEED"});
/* (2026-09-28, passe de lancement) CE QU'UN JOUEUR ANGLOPHONE LISAIT ENCORE EN FRANÇAIS, relevé à l'écran par un banc qui note chaque
   texte affiché pendant 3 minutes de jeu : la liste d'aura, les trois pouvoirs, la fête des ordres de grandeur, la meute du Survivant. */
Object.assign(I18N,{'RATÉ ! GARDE LE NITRO, VISE LE DESSUS':'MISSED! HOLD NITRO, AIM FOR THE TOP'});
Object.assign(I18N,{'LES NUAGES CACHENT LES VIRAGES':'CLOUDS HIDE THE TURNS','LES TOURS NE PARDONNENT PAS':'TOWERS SHOW NO MERCY'}); // (2026-09-30) les promesses des NUAGES et de la VILLE
Object.assign(I18N,{'MINUIT EN VILLE':'MIDNIGHT CITY','PLEINS PHARES':'HIGH BEAMS','LES FACADES SONT DES MURS':'THE FACADES ARE WALLS'});
Object.assign(I18N,{'CANYON DES GÉANTS':'CANYON OF GIANTS','LES PAROIS NE PARDONNENT PAS':'THE WALLS NEVER FORGIVE','ENCASTRE DANS LA PAROI':'SMASHED INTO THE CLIFF','AU FOND DU CANYON':'AT THE BOTTOM OF THE CANYON','A LA RIVIERE !':'INTO THE RIVER!'}); // (2026-10-14) LE CANYON DES GÉANTS
Object.assign(I18N,{'ESQUIVE LES SATELLITES':'DODGE THE SATELLITES','PERCUTE PAR UN SATELLITE':'HIT BY A SATELLITE'}); // (2026-09-30) le 6e niveau
Object.assign(I18N,{'L\'ORAGE':'THE STORM','TEMPÊTE':'STORM','LA ROUTE SE CACHE : L\'ECLAIR LA MONTRE':'THE ROAD HIDES: LIGHTNING SHOWS IT'}); // (2026-09-29) le 4e niveau
Object.assign(I18N,{'VIRAGE A FOND':'FULL THROTTLE TURN','RATTRAPE':'CAUGHT','RATTRAPE !':'CAUGHT!'}); // (2026-09-29) LA ROUTE QUI TE RATTRAPE
Object.assign(I18N,{'FRÔLÉ':'CLOSE CALL','RÉCOLTE':'COIN RUSH','RAFALE':'FRUIT RUSH','VIRAGE SERRÉ':'TIGHT TURN','MÉTÉORE':'METEOR',
  'AU CHEVEU':'BY A HAIR','ARRACHÉE':'CLUTCH','EN FEU !!':'ON FIRE!!','DEMENT !!!':'INSANE!!!','ÇA CHAUFFE !':'HEATING UP!',
  'IL PLEUT DES BILLETS':'IT\'S RAINING CASH','NITRO ILLIMITEE':'UNLIMITED NITRO','6 S A FOND':'6 S FLAT OUT','AIRTIME INFINI':'INFINITE AIRTIME',
  '10 S DE VOL':'10 S OF FLIGHT','VITESSE ×2':'SPEED ×2','⚡ VITESSE ×2 — 6 s !':'⚡ SPEED ×2 — 6 s!',' MAINTENANT !':'!','TOI':'YOU','EN TÊTE':'LEADING',
  'PLUS VITE !':'FASTER!','RISQUE + VITESSE':'RISK + SPEED','🛝 PARC FREESTYLE AU PROCHAIN DÉPART':'🛝 FREESTYLE PARK ON NEXT START',
  'RETOUR À LA COURSE':'BACK TO RACING','L\'AUTO-ÉCOLE T\'ATTEND AU PROCHAIN JOUER':'DRIVING SCHOOL AWAITS ON YOUR NEXT RUN',
  'POSÉ LOURD — AÏE… ':'HEAVY LANDING — OUCH… ','PARFAIT (BOOST ×2) ! ':'PERFECT (BOOST ×2)! ','🐬 LE DAUPHIN !':'🐬 THE DOLPHIN!',
  'VRILLE 360 — LAVE-LINGE !':'360 SPIN — WASHING MACHINE!','TRIPLE BUMP — LA DALLE EN PLEURE':'TRIPLE BUMP — THE ROAD IS CRYING'});
// ---- la charte v4 (2026-09-26) : les libellés neufs de l'interface (et ceux qui retombaient en français) ----
Object.assign(I18N,{"LÉGENDAIRES":"LEGENDARIES","EXOTIQUES":"EXOTICS","EXOTIQUE":"EXOTIC","MYTHIQUES":"MYTHICS","MYTHIQUE":"MYTHIC","INFINIS":"INFINITE","INFINI":"INFINITE","BIENTÔT":"SOON"}); // (2026-10-10) les sept raretés
Object.assign(I18N,{"MISSIONS SECRÈTES":"SECRET MISSIONS","COMMUNES":"COMMONS","COMMUNE":"COMMON","RARES":"RARES","ÉPIQUES":"EPICS","ÉPIQUE":"EPIC","LÉGENDES":"LEGENDS","LÉGENDAIRE":"LEGENDARY","DÉFIS":"MISSIONS","TOUT":"ALL","À MOI":"MINE","À ACHETER":"FOR SALE","TRAÎNÉE":"TRAIL","PEINTURE":"PAINT","AILES":"WINGS"});
Object.assign(I18N,{"PIÈCE":"COIN","RETOUR":"BACK","EN BOUTIQUE":"IN THE SHOP","VERROUILLÉE":"LOCKED","ÉQUIPÉE":"EQUIPPED","IL MANQUE":"SHORT BY","LES LEGENDAIRES":"LEGENDARIES","DÉFI":"CHALLENGE","MISSION":"MISSION","FAITES":"DONE"});
// (2026-09-28, pouvoirs v2) les six pouvoirs, leurs durées, le cumul, le bouclier qui sauve
Object.assign(I18N,{'NITRO INFINIE — 9 s À FOND !':'INFINITE NITRO — 9 s FLAT OUT!','🪂 AIRTIME INFINI — 14 s DE VOL !':'🪂 INFINITE AIRTIME — 14 s OF FLIGHT!',
  '⚡ VITESSE ×2 — 8 s !':'⚡ SPEED ×2 — 8 s!','9 S A FOND':'9 S FLAT OUT','14 S DE VOL':'14 S OF FLIGHT','8 S':'8 S',
  'AIMANT':'MAGNET','BOUCLIER':'SHIELD','AURA ×2':'AURA ×2','NITRO MAX':'NITRO MAX','AIR MAX':'AIR MAX',
  'AIMANT — 12 s : TOUT L\'OR VIENT À TOI !':'MAGNET — 12 s: ALL THE GOLD COMES TO YOU!','L\'OR VIENT A TOI':'THE GOLD COMES TO YOU',
  'BOUCLIER — 20 s : UNE CHUTE PARDONNÉE !':'SHIELD — 20 s: ONE FALL FORGIVEN!','UNE CHUTE PARDONNEE':'ONE FALL FORGIVEN',
  'AURA ×2 — 12 s : TOUTE L\'AURA COMPTE DOUBLE !':'AURA ×2 — 12 s: ALL AURA COUNTS DOUBLE!','TOUTE L\'AURA COMPTE DOUBLE':'ALL AURA COUNTS DOUBLE',
  'DOUBLE POUVOIR':'DOUBLE POWER','TRIPLE POUVOIR':'TRIPLE POWER','DOUBLE POUVOIR !':'DOUBLE POWER!','TRIPLE POUVOIR !':'TRIPLE POWER!',
  'SAUVE !':'SAVED!','LE BOUCLIER A CEDE':'THE SHIELD BROKE','LE BOUCLIER T\'A SAUVE':'THE SHIELD SAVED YOU','DEMOLI':'SMASHED',
  'SANS FAUTE':'FLAWLESS','SERIE CASSEE':'STREAK BROKEN','MIRACULE':'MIRACLE','MIRACULE !':'MIRACLE!','RECORD DE VITESSE':'SPEED RECORD','SÉRIE COMPLÈTE':'FULL SET','PLONGEON !':'DIVE!','REPLONGEON !':'DIVE AGAIN!','RICOCHET !':'SKIP!','RICOCHET':'SKIP','LA MER TE RAMENE':'THE SEA BRINGS YOU BACK','HORS DE L EAU !':'OUT OF THE WATER!','PLONGEON':'DIVE','REPLONGEON':'DIVE AGAIN','HORS DE L EAU':'OUT OF THE WATER'});
Object.assign(I18N,{'MOY':'AVG','MOYENNE BATTUE':'AVERAGE BEATEN'}); // (2026-10-12) la JAUGE D'AURA
Object.assign(I18N,{"MISSIONS":"MISSIONS","MENU":"MENU","HOME":"HOME","ATELIER":"WORKSHOP","LES TROIS DEFIS":"THE THREE MISSIONS",
  "DEFI":"CHALLENGE","REUSSI":"DONE","SUIVI EN COURSE":"TRACKED","MEILLEUR ESSAI":"BEST RUN","RECOMPENSE":"REWARD","ENSUITE":"NEXT","CARNET":"SET",
  "EN COURS":"ACTIVE","PROCHAINE RECOMPENSE":"NEXT REWARD","A VENIR":"COMING UP","NOUVELLE":"NEW","SUIVIE":"TRACKED","PAS ENCORE TENTEE":"NOT TRIED YET",
  "ENCORE {n} MISSIONS":"{n} MORE MISSIONS","ENCORE 1 MISSION":"1 MORE MISSION","TOUCHE UNE MISSION POUR LA SUIVRE":"TAP A MISSION TO TRACK IT", /* (2026-10-15) l'écran MISSIONS en liste */
  "CHAQUE DEFI EN UNE PARTIE":"EACH MISSION IN ONE RUN","CHAQUE MISSION EN UNE PARTIE":"EACH MISSION IN ONE RUN","TOUCHE UNE MISSION POUR LA SUIVRE EN COURSE":"TAP A MISSION TO TRACK IT","LES 3 MISSIONS D'ABORD":"FINISH THE 3 MISSIONS FIRST","SUIVI":"TRACKING","TOUCHE UN DEFI POUR LE SUIVRE EN COURSE":"TAP A CHALLENGE TO TRACK IT","LES 3 DEFIS D'ABORD":"FINISH THE 3 CHALLENGES FIRST"}); // (2026-09-30) l'écran MISSIONS de l'atelier // (2026-09-28) la porte et l'écran des MISSIONS, la sortie MENU de l'écran de mort
Object.assign(I18N,{"LES DEFIS · CHACUN EN UNE PARTIE":"MISSIONS · EACH IN ONE RUN","A GAGNER":"TO WIN","ENSUITE":"NEXT","VOIR":"VIEW","RELEVÉ":"DONE","À TENTER":"NOT TRIED YET","CETTE PARTIE":"THIS RUN","DÉFI RÉUSSI !":"CHALLENGE DONE!","BONUS":"BONUS"}); // (2026-09-28, soir) MISSIONS v2 et la porte de l'écran de mort
// (2026-09-29, relecture de sortie) les 50 fiches du garage : noms et punchlines en anglais
Object.assign(I18N,{
 "LA POSTIÈRE":"THE MAIL LADY",
 "LA DEUCHE":"THE TIN SNAIL",
 "LE TAXI JAUNE":"THE YELLOW CAB",
 "LA PIZZA EXPRESS":"PIZZA EXPRESS",
 "30 minutes chrono ou la pizza est offerte. Spoiler : elle n'a jamais été offerte.":"30 minutes or it's free. Spoiler: it has never been free.",
 "LE MONOSPACE":"THE MINIVAN",
 "LE BREAK SUÉDOIS":"THE SWEDISH WAGON",
 "LA BOULE":"THE BUG",
 "LE GLACIER":"ICE CREAM TRUCK",
 "LE TOUT-TERRAIN SOVIÉTIQUE":"THE SOVIET 4X4",
 "LE GRILLE-PAIN":"THE TOASTER",
 "LE CORBILLARD":"THE HEARSE",
 "Six mètres de classe funèbre. Ceux qu'il double finissent à l'arrière, c'est la tradition.":"Twenty feet of funeral class. Whoever it passes ends up in the back. It's tradition.",
 "LA SANS-PERMIS":"THE MICROCAR",
 "L'AUTO-ÉCOLE":"STUDENT DRIVER",
 "LE PICK-UP DU FERMIER":"THE FARM TRUCK",
 "L'AMBASSADEUR":"THE AMBASSADOR",
 "LE CHARGEUR":"THE CHARGER",
 "Quatre portes, parce qu'il faut bien emmener quelqu'un pour voir la tête des autres.":"Four doors, because somebody has to come along and see the look on everyone's faces.",
 "LE DÉFIEUR":"THE DEFIER",
 "Né en 1970, jamais sorti de la puberté. Il te défie au feu rouge, puis au suivant, puis au suivant.":"Born in 1970, never made it out of puberty. It dares you at the red light. Then the next one. Then the next one.",
 "LA BAVAROISE":"THE BAVARIAN",
 "Homologuée pour la route, élevée sur circuit. Elle perd patience avant toi.":"Street-legal, track-bred. It runs out of patience before you do.",
 "LA SUÉDOISE TURBO":"THE SWEDISH TURBO",
 "LE QUATTRO":"THE QUATTRO",
 "LA SILENCIEUSE":"THE SILENT ONE",
 "Zéro bruit, zéro goutte d’essence, zéro excuse : ils ne t’entendent même pas les doubler.":"Zero noise, zero gas, zero excuses: they don't even hear you pass them.",
 "LE TRIDENT":"THE TRIDENT",
 "LA HUIT":"THE EIGHT",
 "LE SAMOURAÏ":"THE SAMURAI",
 "Quatre feux ronds, un aileron, zéro pitié. Tu le vois une fois : dans ton rétro, en train de partir.":"Four round taillights, one wing, zero mercy. You only see it once: in your mirror, on its way out.",
 "LA VETTE":"THE VETTE",
 "Phares cachés, V8 pas caché du tout. Elle se lève pour voir la route, puis elle la mange.":"Pop-up headlights, and a V8 that hides nothing. It wakes up to look at the road, then eats it.",
 "LE CHÂTELAIN":"THE SQUIRE",
 "LA GRANDE ANGLAISE":"THE ENGLISH DAME",
 "Deux tonnes et demie de cuir, de noyer et de W12. Elle ne dépasse pas : elle congédie.":"Two and a half tons of leather, walnut and W12. She doesn't overtake: she dismisses.",
 "LE CHARGEUR 69":"THE CHARGER 69",
 "Phares cachés, intentions aussi. Quand la calandre s'ouvre dans ton rétro, c'est déjà trop tard.":"Hidden headlights, hidden intentions. When that grille opens in your mirror, it's already too late.",
 "L'ÉTALON":"THE STALLION",
 "LA QUEUE DE CANARD":"THE DUCKTAIL",
 "Le moteur est derrière, le becquet aussi. Toi, tu seras devant — c'est tout ce qui compte.":"The engine's in the back, and so is the spoiler. You'll be up front, and that's all that matters.",
 "LA DAYTONA":"THE DAYTONA",
 "Deux mètres de capot, douze cylindres dessous. Le reste de la voiture est juste là pour le suivre.":"Six feet of hood, twelve cylinders underneath. The rest of the car is just there to follow it.",
 "LA TAURINE":"THE TAURINE",
 "Elle a des cils. Et un V12 juste derrière ta nuque. Elle te fait les yeux doux, pas de cadeaux.":"She has eyelashes. And a V12 right behind your neck. She bats her eyes at you, but don't expect favors.",
 "LA STRATOS":"THE STRATOS",
 "Trois titres mondiaux, un mètre onze de haut. La visière, c’est pour voir les autres dans le rétro.":"Three world titles, 1.11 meters tall. The visor is for watching everyone else in the mirror.",
 "LA NOCTAMBULE":"THE NIGHT OWL",
 "Un aileron si grand qu'on l'a interdite sur route. Toi, tu roules dans le ciel : personne ne dira rien.":"A wing so big it got banned from the road. You drive in the sky: nobody's going to say a word.",
 "LA PAGODE":"THE PAGODA",
 "LA DÉESSE":"THE GODDESS",
 "L'AIGLE DE FEU":"THE FIRE EAGLE",
 "Un oiseau d'or sur le capot, un shérif dans le rétro. Le shérif n'a jamais rattrapé l'oiseau.":"A golden bird on the hood, a sheriff in the mirror. The sheriff never caught the bird.",
 "LA ZED":"THE Z",
 "Six cylindres, un capot d'un kilomètre et des rétros sur les ailes : le samouraï a troqué le sabre.":"Six cylinders, a mile-long hood and fender mirrors: the samurai traded in his sword.",
 "LA FÉLINE":"THE FELINE",
 "Un capot si long qu'il arrive au virage avant toi. Élue plus belle du monde, et elle le sait.":"A hood so long it reaches the corner before you do. Voted the most beautiful car in the world, and she knows it.",
 "LA RAIE":"THE RAY",
 "Une taille de guêpe, des hanches de starlette et un V8 sous le capot. Hollywood a pris la route.":"A wasp waist, starlet hips and a V8 under the hood. Hollywood hit the road.",
 "L'ÉTERNELLE":"THE ETERNAL",
 "Seize cylindres, quatre turbos, zéro remords. Le temps, lui, attend qu'elle passe.":"Sixteen cylinders, four turbos, zero regrets. Time itself waits for her to pass.",
 "LE TRÔNE CENTRAL":"THE CENTER THRONE",
 "Un seul siège, au milieu. Les passagers regardent de côté : ils ne sont pas là pour conduire.":"One seat, dead center. The passengers sit off to the side: they're not here to drive.",
 "LE SPECTRE":"THE SPECTER",
 "Tu l’as vu passer ? Non. Personne ne l’a jamais vu passer. D’où le nom.":"Did you see it go by? No. Nobody's ever seen it go by. Hence the name.",
 "LE BLINDÉ NOIR":"BLACK ARMOR",
 "Pas de capot, pas de pitié, pas de feu rouge. Quand il passe, la rue se range toute seule.":"No hood, no mercy, no red lights. When it rolls by, the street clears itself.",
 "LE MUR DU SON":"THE SOUND BARRIER",
 "Deux réacteurs de chasseur, zéro complexe. Le bang que tu entends, c'est elle qui passe.":"Two fighter-jet engines, zero hang-ups. That bang you hear? That's her going by.",
 "LE DRAGON D'OR":"THE GOLDEN DRAGON",
 "Il dormait sur un tas d'or. Maintenant il roule dessus, et il crache du feu à chaque rapport.":"It used to sleep on a pile of gold. Now it drives on one, and breathes fire on every gear change.",
 "LE MASTODONTE":"THE MASTODON",
 "Il ne double personne : il passe dessus. Les dos d'âne, c'est lui qui les fabrique.":"It doesn't pass anyone: it drives over them. Speed bumps? It makes them.",
 "LA GROUPE B":"THE GROUP B",
 "Tellement rapide qu'on l'a interdite. Ici, personne n'interdit rien : bon courage pour la rattraper.":"So fast they banned it. Nobody bans anything here: good luck catching it.",
 "LE HOT ROD":"THE HOT ROD",
 "Un capot ? Pour cacher un compresseur pareil ? Tu rigoles. Même les flammes sont d’époque.":"A hood? To hide a blower like that? You're kidding. Even the flames are vintage.",
 "LA PUCE":"THE FLEA",
 "Trois mètres, quatre phares, zéro complexe. Elle a battu des monstres sur la neige : toi, c'est l'apéro.":"Ten feet long, four headlights, zero complexes. It beat monsters in the snow: you're just the appetizer."
});
// (2026-10-02) L'ORIGAMI
Object.assign(I18N,{
 "L'ORIGAMI":"THE ORIGAMI",
 "Une feuille d'inox, sept plis, zéro courbe. Vitres incassables, paraît-il : on a essayé avec une boule, on n'en parle plus.":"One sheet of stainless steel, seven folds, zero curves. Unbreakable windows, they say: we tried with a steel ball, we don't talk about it."
});
// (2026-10-06) ATCHOUM
Object.assign(I18N,{
 "ATCHOUM":"ACHOO",
 "Elle a pris froid au dernier tour : depuis, elle éternue du feu. Ne reste jamais devant elle.":"She caught a cold on the last lap: now she sneezes fire. Never stay in front of her.",
 "ATCHOUM !":"ACHOO!",
});
// (2026-10-08) LE SQUALE
Object.assign(I18N,{
 "SQUALE":"SHARKY",
 "Toujours le sourire. Surtout quand elle te double.":"Always smiling. Especially when she passes you.",
});
// (2026-10-09) L'ABSTRAITE
Object.assign(I18N,{
 "L'ABSTRAITE":"THE ABSTRACT",
 "Trois lames qui flottent l'une sur l'autre, quatre disques, un anneau d'or qu'elle traverse sans le toucher. Personne ne sait où est le moteur. Elle non plus.":"Three blades floating on top of each other, four discs, a golden ring she drives through without touching. Nobody knows where the engine is. Neither does she.",
});
// (2026-10-10) L'ICEBERG
Object.assign(I18N,{
 "L'ICEBERG":"THE ICEBERG",
 "Un iceberg fendu en trois : deux blocs de glace sur les roues, une bulle au milieu pour un seul pilote. Le vent passe entre.":"An iceberg split in three: two blocks of ice over the wheels, a bubble in the middle for a single driver. The wind blows right through.",
});
// (2026-10-10) LA DÉFERLANTE
Object.assign(I18N,{
 "LA DÉFERLANTE":"THE BREAKER",
});
// (2026-10-16) LA PERLE (ex-L'ONYX)
Object.assign(I18N,{
 "LA PERLE":"THE PEARL",
 "Blanc laqué, zéro bruit, 571 chevaux. Elle passe sans un son, et tout le monde se retourne quand même.":"Gloss white, zero noise, 571 horsepower. She glides by without a sound, and everyone turns around anyway.",
});
// (2026-10-16) LA POUPÉE
Object.assign(I18N,{
 "LA POUPÉE":"THE DOLL",
 "Rose poupée, cuir crème, 650 chevaux. Elle se gare en double file, et c'est la file qui s'excuse.":"Doll pink, cream leather, 650 horsepower. She double-parks, and traffic apologizes.",
});
// (2026-10-14) LE DOGE
Object.assign(I18N,{
 "LE DOGE":"DOGE",
 "Much sillage. Very mots. Wow.":"Much trail. Very words. Wow.",
 "Wow. Très tête. Beaucoup roues. Il te regarde de côté, et il a raison.":"Wow. Such head. Much wheels. He side-eyes you, and he is right.",
});
// (2026-10-11) LA MERCURE
Object.assign(I18N,{
 "LA MERCURE":"THE MERCURY",
});
// (2026-10-10) LA FOURNAISE
Object.assign(I18N,{
 "LA FOURNAISE":"THE FURNACE",
 "Une croûte de basalte qui se fend sur un cœur de lave, le feu qui coule dans chaque joint. Ne la touche pas.":"A basalt crust cracking over a heart of lava, fire flowing through every seam. Don't touch it.",
});
// (2026-09-29) les chaînes visibles qui manquaient
Object.assign(I18N,{
 "VITESSE · DRIFT · TRICHE":"SPEED · DRIFT · CHEATS","DRIFT · RACCOURCI · VITESSE":"DRIFT · SHORTCUT · SPEED","DRIFT !":"DRIFT!","AURA EN FUSION":"AURA MELTDOWN","MULTI MAX !!":"MAX MULTI!!",
 "MAX !!!":"MAX!!!",
 "EXPLOSE !":"IS TOAST!",
 "À TOI !":"YOURS!",
 "BIENTÔT DISPONIBLE":"COMING SOON",
 "TOTAL":"TOTAL"
});
// (2026-09-29) corrections des traductions existantes (ponctuation anglaise, cohérence, longueur, anglais américain)
Object.assign(I18N,{
 "record : ":"best: ",
 "⚠ ATTENTION !<br>TU ES DERNIER<br>EXPLOSION DANS : 00:":"⚠ WARNING!<br>YOU ARE LAST<br>EXPLOSION IN: 00:",
 "ATTENTION !<br>TU ES DERNIER<br>EXPLOSION DANS : 00:":"WARNING!<br>YOU ARE LAST<br>EXPLOSION IN: 00:",
 "IL TE MANQUE":"SHORT BY",
 "AU CHEVEU !!":"BY A HAIR!!",
 "ARRACHÉE !":"CLUTCH!",
 "À TENTER":"NOT YET",
 "VERSÉS AU COMPTE":"BANKED",
 "À GAGNER":"EARN IT",
 "RADAR":"RADAR",
 "FACE CACHÉE ×2":"UNDERSIDE ×2",
 "ELLE EST A TOI":"SHE'S YOURS",
 "BIENTÔT DISPONIBLE — À LA SORTIE SUR L'APP STORE":"COMING SOON",
 "🛝 PARC FREESTYLE AU PROCHAIN DÉPART":"🛝 FREESTYLE PARK ON NEXT RUN",
 "PARC FREESTYLE AU PROCHAIN DÉPART":"FREESTYLE PARK ON NEXT RUN",
 "Le garage se visite depuis le menu":"Visit the garage from the menu",
 "Ça se visite depuis le menu":"Open it from the menu",
 "Le taureau doré. Assurance résiliée d'office.":"The golden bull. Insurance canceled on sight.",
 "Un coin des années 80 passé au bain d'acide : une ampoule qui luit sur le dos, et l'échappement qui crache vert.":"An '80s wedge dipped in acid: a glowing bulb on its back, and an exhaust that spits green.",
 "Le centre de gravité au ras du bitume.":"Center of gravity scraping the asphalt.",
 "LE BITUME SE SOUVIENDRA DE TOI":"THE ASPHALT WILL REMEMBER YOU",
 "Quatre rotors. Ça ne vole pas mieux, mais ça brasse de l'air.":"Four rotors. It doesn't fly any better, but it sure moves some air.",
 "Tu ne laisses pas de la fumée derrière toi. Tu laisses de l'or.":"You don't leave smoke behind. You leave gold.",
 "La teinte du constructeur. Elle a fait ses preuves.":"The factory color. Tried and true."
});
// (2026-09-29) les étiquettes VoiceOver (aria-label), traduites par applyLangDOM
Object.assign(I18N,{"CASH CAR — toucher pour jouer":"CASH CAR — tap to play","Compte":"Account","Familles":"Rarities","Vignettes":"Thumbnails","Précédente":"Previous","Suivante":"Next","Retour":"Back","Fermer":"Close","Carrière":"Career","Menu principal CASH CAR":"CASH CAR main menu","Missions":"Missions","Menu":"Menu","Volant — glisse pour tourner":"Steering — swipe to steer","Gauche":"Left","Droite":"Right","Nitro":"Nitro","La partie en cours":"Current run","Fruit précédent":"Previous fruit","Fruit suivant":"Next fruit","Réglages":"Settings"});
// (2026-09-29, les dix premières minutes) PASSER qui demande, le permis fêté, la carrière qui passe par l'auto-école
Object.assign(I18N,{"VRAIMENT ?": "SURE?", "PERMIS": "LICENSE", "SORTI ! SUIS LA ROUTE": "OFF THE ROAD! FOLLOW IT", "RATÉ ! NITRO, VISE LE DESSUS": "MISSED! NITRO, AIM ABOVE IT", "Fini l'entraînement : UNE SEULE VIE. En l'air, pose-toi avant la fin du chrono.": "Training's over: ONE LIFE. In the air, land before the timer runs out.", "Tu reprendras la leçon au prochain départ.": "You'll pick the lesson up on your next start.", "Tu reprendras la leçon au prochain départ : le PERMIS et sa prime t'attendent.": "You'll pick the lesson up on your next start: the LICENSE and its bonus are waiting.", "PASSE D'ABORD TON PERMIS": "GET YOUR LICENSE FIRST"});
// (2026-09-29) MODE FACILE + pouce haut en vol
Object.assign(I18N,{"MULTI MAX":"BEST MULTI","Fini l'entraînement : tu as 3 VIES. En l'air, pose-toi avant la fin du chrono.":"Training's over: you have 3 LIVES. In the air, land before the timer runs out.","IL MENE DE":"BANKER AHEAD BY","Argent, caisses, habillages, missions, records, carrière et réglages : tout repart de zéro.":"Money, cars, cosmetics, missions, records, career and settings: everything starts over.","Argent, caisses, habillages, missions, records et réglages : tout repart de zéro.":"Money, cars, cosmetics, missions, records and settings: everything starts over."}); // (2026-09-29, passe qualité)
Object.assign(I18N,{"MODE FACILE": "EASY MODE", "POUCE HAUT EN VOL": "THUMB UP IN THE AIR", "PLONGE": "DIVE", "MONTE": "CLIMB", "CHOISIS TON MODE": "PICK YOUR MODE", "En FACILE, la voiture suit mieux les virages, tu restes plus longtemps en l'air et tu as 3 vies. Tu pourras changer dans les réglages.": "In EASY, the car follows the turns better, you stay longer in the air and you get 3 lives. You can change it in the settings.", "FACILE": "EASY", "NORMAL": "NORMAL", "VIES": "LIVES", "DERNIERE VIE !": "LAST LIFE!", "ON REPART !": "BACK ON THE ROAD!", "En l'air : pouce en HAUT = monte, en BAS = plonge.": "In the air: thumb UP = climb, DOWN = dive."});
Object.assign(I18N,{"POUCE HAUT":"THUMB UP","REVOIR":"REPLAY"}); /* (2026-10-14, charte 6) les réglages : « POUCE HAUT EN VOL » et « REVOIR L'AUTO-ECOLE » raccourcis (une ligne = un nom + une valeur) */
// (2026-09-29) écran de fin v5
// ⚠ nommée TR et non T : `T` est DÉJÀ le tableau des tangentes de la piste (T[bi].y) — la
// collision faisait planter tout le script au parsing, écran noir muet.
/* LES CLÉS SANS LEUR SYMBOLE (2026-09-24) : les symboles de tête (✓ 🔒 ★ 📋…) sont devenus des ICÔNES PIXEL
   posées à côté du texte. Chaque clé « symbole + espace + texte » reçoit donc un ALIAS « texte » seul, qui
   traduit pareil — sans ça, retirer l'emoji d'un libellé lui aurait fait perdre sa traduction. */
for(const [k,v] of Object.entries({"JOUER": "PLAY", "CARRIERE": "CAREER", "MODES": "MODES", "REGLAGES": "SETTINGS", "REJOUER": "PLAY AGAIN", "MEILLEUR :": "BEST:", "MEILLEUR": "BEST", "CAISSE": "CAR", "UNE SEULE VIE · TOUT LE CIEL": "ONE LIFE · THE WHOLE SKY", "AUDIO": "AUDIO", "JEU": "GAME", "SAUVEGARDE": "SAVE", "SON": "SOUND", "MUSIQUE": "MUSIC", "VOIX": "VOICE", "VOLUME": "VOLUME", "COMMANDES": "CONTROLS", "IMAGE": "GRAPHICS", "LANGUE": "LANGUAGE", "DEVISE": "CURRENCY", "COPIER MA SAUVEGARDE": "COPY MY SAVE", "RESTAURER UN CODE": "RESTORE A CODE", "EFFACER MA PROGRESSION": "ERASE MY PROGRESS", "SURVIVANT": "SURVIVOR", "PARC FREESTYLE": "FREESTYLE PARK", "BAC A SABLE": "SANDBOX", "REPRENDRE": "RESUME", "FERMER": "CLOSE", "REPLACER LA CAISSE": "RESET THE CAR", "RECOMMENCER": "RESTART", "QUITTER": "QUIT", "PAUSE": "PAUSE", "LA PARTIE": "THIS RUN", "VOLANT": "WHEEL", "FLECHES": "ARROWS", "RAPIDE": "FAST", "NETTE": "SHARP", "FIGURES": "TRICKS", "ENTRAINEMENT TERMINE": "TRAINING OVER", "NOUVEAU RECORD !": "NEW RECORD!", "MOTEUR ATTEINT": "ENGINE REACHED", "GLISSE POUR TOURNER": "SWIPE TO STEER", "glisse pour tourner · pince pour zoomer": "drag to turn · pinch to zoom", "touche CASH CAR — le son s'allume avec toi": "tap CASH CAR — sound comes alive with you", "MA SAUVEGARDE": "MY SAVE", "Garde ce code : il restaure toute ta progression.": "Keep this code: it restores all your progress.", "COPIER": "COPY", "COPIE !": "COPIED!", "RESTAURER": "RESTORE", "Colle ton code de sauvegarde.": "Paste your save code.", "ANNULER": "CANCEL", "RESTAURE — RECHARGE…": "RESTORED — RELOADING…", "CODE INVALIDE": "INVALID CODE", "TOUT EFFACER ?": "ERASE EVERYTHING?", "Records, caisses débloquées, carrière et réglages repartent de zéro.": "Records, unlocked cars, career and settings start over.", "EFFACER": "ERASE",  "NUAGES": "SKY HIGH", "SKY HIGH": "SKY HIGH",    "VILLE": "CITY", "ESPACE": "SPACE", "10 heures du jour, de l'aurore au coucher du soleil.": "10 hours of the day, from dawn to sunset.", "Du coucher du soleil à midi, au-dessus du village caché de la pluie.": "From sunset to noon, above the hidden rain village.",  "AURORE": "DAWN",  "LEVER DU SOLEIL": "SUNRISE", "MATIN FRAIS": "CRISP MORNING", "MATIN": "MORNING", "MIDI": "NOON", "APRES-MIDI": "AFTERNOON", "FIN D'APRES-MIDI": "LATE AFTERNOON", "HEURE DOREE": "GOLDEN HOUR", "COUCHER DE SOLEIL": "SUNSET",   "MINUIT": "MIDNIGHT", "ORAGE": "STORM",  "AUBE": "DAYBREAK", "LEVER": "SUNRISE", "MERCURE": "MERCURY", "VENUS": "VENUS", "TERRE": "EARTH", "LUNE": "MOON", "MARS": "MARS", "JUPITER": "JUPITER",     "Elle démarre par pitié. Fais des thunes et oublie-la vite.": "It starts out of pity. Make cash and forget it fast.", "Ça roule. Vu d'où tu viens, c'est déjà un miracle.": "It runs. Given where you're from, that's already a miracle.", "Conçue pour rouler prudemment. Toi, prudent ? On y croit fort.": "Built to drive carefully. You, careful? Sure.", "Elle ne double pas. Elle DÉPLACE.": "It doesn't overtake. It RELOCATES.", "L'écologie te fait coucou dans le rétro. T'as pas de rétro.": "Ecology waves at you in the mirror. You don't have mirrors.", "Refuse de rouler sous 200. Toi aussi, maintenant.": "Refuses to go under 200. So do you, now.", "Elle découpe les virages. Les autres les négocient.": "It carves corners. Others negotiate them.", "Ceux qui l'ont doublée en parlent encore. Ah non : personne.": "Those who passed it still talk about it. Oh wait: nobody.", "Le taureau doré. Assurance résiliée d'office.": "The golden bull. Insurance cancelled on sight.", "Le circuit appelle ça tricher. Nous, du talent.": "The track calls it cheating. We call it talent.", "Prototype d'endurance. Faite pour rouler la nuit entière.": "Endurance prototype. Built to run all night.", "La reine du ciel, et elle le sait.": "Queen of the sky, and she knows it.", "Passée au bain d'acide. Ça se voit.": "Dipped in acid. It shows.", "Personne n'a demandé pourquoi. Tout le monde a demandé comment.": "Nobody asked why. Everybody asked how.", "Au sol, il roule. En l'air, il chasse.": "On the ground, it drives. In the air, it hunts."}))if(!(k in I18N))I18N[k]=v; // la coque mobile, la carrière, les fenêtres, les fiches des caisses (2026-09-24)
for(const k of Object.keys(I18N)){
  const m=/^[\u2190-\u2BFF\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF]+\s+(.+)$/.exec(k);
  if(m&&!(m[1] in I18N))I18N[m[1]]=String(I18N[k]).replace(/^[\u2190-\u2BFF\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF]+\s+/,'');
}
Object.assign(I18N,{'TOUS LES REGLAGES':'ALL SETTINGS'}); Object.assign(I18N,{'AIDE':'HELP','Colle un code de sauvegarde, ou un code secret.':'Paste a save code, or a secret code.'}); // (2026-10-14, UX 8) // (2026-10-14, charte 6) la ligne de la pause qui ouvre l'écran complet
Object.assign(I18N,{"VOL INVERSÉ":"INVERTED FLIGHT"}); /* (2026-10-27, Léo) l'option VOL INVERSÉ des réglages */
Object.assign(I18N,{"INCLINAISON":"TILT STEERING","MAIN":"HAND","GAUCHER":"LEFTY","DROITIER":"RIGHTY"}); /* (2026-10-27, Léo) tourner en penchant le téléphone */
