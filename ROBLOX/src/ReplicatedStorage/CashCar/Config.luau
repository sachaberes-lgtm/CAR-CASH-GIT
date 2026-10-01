-- CASH CAR — LES RÉGLAGES. Tous les chiffres du jeu web (VERSION PRINCIPALE/index.html) sont repris
-- tels quels, avec le numéro de ligne d'où ils viennent : la caisse Roblox doit se conduire, voler et
-- payer comme l'autre. Les distances sont en MÈTRES du jeu ; Config.M les convertit en studs.
local Config = {}

Config.M = 2.5 -- studs par mètre (la caisse fait 2 × 4,4 m = 5 × 11 studs)

-- ── les constantes du moteur physique (index.html L27469, L27499) ──
Config.SPD = 0.48          -- vitesse globale : le monde avance de vA·SPD mètres par seconde
Config.GRAV = 9.8 * 0.55   -- la pente qui freine ou relance, au sol
Config.FALL_G = 33         -- gravité du vol (× SPD = 15,8 m/s² dans le monde)
Config.AIR_MAX = 6         -- secondes en l'air avant l'explosion (le camembert)
Config.ROAD_HALF = 28      -- demi-largeur de la route (L7115 × LARGEUR 2.0) : 56 m de bitume
Config.THICK = 2.6         -- épaisseur de la dalle
Config.MORT_SOUS = 120     -- on meurt 120 m sous le point le plus bas de la piste
Config.ARRET_KMH = 22      -- « roule ou crève » : sous 22 km/h pendant 6 s → boum
Config.ARRET_T = 6

-- ── le moteur monte avec les pièces (ENGINE_TIERS, L20328) : { pièces, poussée, nom, réservoir de nitro (s) } ──
Config.MOTEURS = {
	{ 0, 1.00, nom = "MOTEUR ROUILLÉ", res = 2.00, d = "Il tousse, il fume, il prie. Mais il tourne." },
	{ 5, 1.06, nom = "BICYLINDRE", res = 2.02, d = "Deux cylindres. Un qui pousse, un qui regarde." },
	{ 12, 1.12, nom = "3 CYLINDRES", res = 2.05, d = "Deux qui toussent, un qui prie." },
	{ 21, 1.19, nom = "4 EN LIGNE", res = 2.08, d = "Le premier moteur qui ne s'excuse pas." },
	{ 33, 1.26, nom = "4 SOUPAPES", res = 2.11, d = "Il respire enfin par le nez." },
	{ 48, 1.34, nom = "4 EN LIGNE TURBO", res = 2.15, d = "Le premier vrai souffle. Ça siffle." },
	{ 66, 1.42, nom = "5 CYLINDRES", res = 2.19, d = "Un chiffre impair, un bruit inoubliable." },
	{ 88, 1.50, nom = "V6", res = 2.23, d = "La forme fait le son. Le son fait le reste." },
	{ 114, 1.59, nom = "V6 BITURBO", res = 2.28, d = "Deux turbos, zéro patience." },
	{ 145, 1.68, nom = "BOXER À PLAT", res = 2.33, d = "Le centre de gravité au ras du bitume." },
	{ 181, 1.78, nom = "V8 ATMO", res = 2.38, d = "Le grondement qui fait trembler la dalle." },
	{ 223, 1.88, nom = "V8 COMPRESSÉ", res = 2.43, d = "Un compresseur, et la dalle demande grâce." },
	{ 271, 1.99, nom = "V10", res = 2.49, d = "Dix cylindres, zéro argument." },
	{ 326, 2.10, nom = "V12", res = 2.55, d = "Douze cylindres qui hurlent à l'unisson." },
	{ 389, 2.21, nom = "W12", res = 2.61, d = "Deux V6 mariés de force. Ça marche." },
	{ 452, 2.33, nom = "V16", res = 2.67, d = "Seize. Parce que quinze, c'était ridicule." },
	{ 540, 2.45, nom = "H16 F1", res = 2.73, d = "Seize cylindres en H. Interdit en course. Logique." },
	{ 630, 2.58, nom = "QUADRITURBO", res = 2.80, d = "Quatre escargots, une seule idée." },
	{ 731, 2.71, nom = "ROTATIF TRIPLE", res = 2.87, d = "Pas de pistons. Que du hurlement." },
	{ 844, 2.85, nom = "TURBINE À GAZ", res = 2.94, d = "L'hélicoptère a appelé. Il veut son moteur." },
	{ 970, 2.99, nom = "TURBINE À PLASMA", res = 3.01, d = "Plus de pistons. Un souffle continu, bleu." },
	{ 1110, 3.13, nom = "STATORÉACTEUR", res = 3.08, d = "Il n'avale plus l'air. Il l'agresse." },
	{ 1265, 3.28, nom = "PULSORÉACTEUR", res = 3.15, d = "Un battement par milliseconde. C'est le tien qui suit." },
	{ 1420, 3.44, nom = "RÉACTEUR NUCLÉAIRE", res = 3.23, d = "Tu roules avec un cœur de centrale sous le capot." },
	{ 1624, 3.60, nom = "CŒUR À FUSION", res = 3.31, d = "Une petite étoile, sanglée sous le capot." },
	{ 1830, 3.76, nom = "ANTIMATIÈRE", res = 3.39, d = "Un gramme. Un seul. Ne freine pas." },
	{ 2055, 3.90, nom = "MOTEUR À DISTORSION", res = 3.46, d = "Ce n'est plus toi qui avances. C'est la route qui recule." },
	{ 2270, 4.02, nom = "COMÈTE", res = 3.52, d = "La caisse est EN FEU. Comme au premier jour." },
	{ 2566, 4.12, nom = "SUPERNOVA", res = 3.56, d = "Tu ne brûles plus le carburant. Tu brûles le ciel." },
	{ 2854, 4.20, nom = "TROU NOIR", res = 3.60, d = "Plus rien ne s'échappe. Même pas toi." },
}
-- valeur d'une pièce par palier de moteur (DENOMS L11820, × 0,25)
Config.DENOMS = { 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9, 9, 10, 11, 11, 12, 12, 13, 14, 15, 16, 16 }
Config.CASH_DEPART = 1.61

-- ── la nitro (L35644) : un réservoir en SECONDES qui grandit avec le moteur ──
Config.NITRO = {
	resMin = 2.0, resMax = 3.6, -- capacité du réservoir, du moteur 0 au moteur 29
	regen = 0.2,                -- par seconde, sans rien faire
	vide = 1.0,                 -- consommation par seconde
	seuil = 0.3,                -- il faut au moins ça pour allumer
	pousseSol = 30,             -- vA gagné par seconde au sol (× poussée du moteur)
	pousseAir = 60,             -- poussée en vol, le long de la trajectoire
	coupAir = 46,               -- le coup de pied à l'allumage en vol (une fois par 0,5 s, coûte 12 %)
	portance = 0.6,             -- en vol, la nitro retient la chute (× FALL_G)
	pose = 0.20,                -- chaque atterrissage rend 20 % du réservoir
}

-- ── la piste (buildTrack / genCtrl, L8841-9561) ──
Config.PISTE = {
	pas = 2,              -- un échantillon tous les 2 m
	cellule = 16,         -- la grille qui retrouve la route sous la caisse (m)
	longueur = 9000,      -- longueur de la zone 1 (m) ; les suivantes s'allongent
	yDepart = 1400,       -- altitude du départ (m) : la route ne fait que descendre
	departLong = 110,     -- la droite de lancement (L9039 : straight(110·LV, −70·LV))
	departPente = 0.30,   -- … qui pique : on prend de l'élan tout de suite
	arriveeLong = 110,
	degagement = 16,      -- deux étages de route ne passent jamais à moins de 16 m l'un de l'autre
	penteMax = 0.75,      -- la pente la plus raide (≈ 37°) : les virages du jeu web plongent, lissés à ~30-40°
	module = { 1100, 1800 }, -- tous les 1100-1800 m, un MODULE du niveau NUAGES (LACETS, MONTAGNES RUSSES…) — plus serré que le web (1600-2600) : ici les LACETS portent les étages
}

-- ── les objets sur la route (spawnPickups L23148, pads L9794) ──
Config.OBJETS = {
	debut = 200,          -- rien avant 200 m
	rayon = 3.8,          -- on ramasse une pièce à 3,8 m
	aimant = 15,          -- au sol, les pièces à moins de 15 m viennent à la caisse
	combo = 3,            -- fenêtre du combo (s)
	padTous = { 280, 560 }, padPousse = 18, padBoost = 1.5,
	cristalTous = { 860, 1620 },
}

-- ── les pouvoirs (cristaux, L23258) ──
Config.POUVOIRS = {
	n = { nom = "NITRO INFINIE", nomEN = "INFINITE NITRO", duree = 9, couleur = Color3.fromRGB(255, 122, 36), poids = 0.30 },
	a = { nom = "AIRTIME INFINI", nomEN = "INFINITE AIRTIME", duree = 14, couleur = Color3.fromRGB(0, 234, 255), poids = 0.30 },
	v = { nom = "SPEED UP", nomEN = "SPEED UP", duree = 8, couleur = Color3.fromRGB(255, 215, 94), poids = 0.20 },
	m = { nom = "AIMANT", nomEN = "MAGNET", duree = 12, couleur = Color3.fromRGB(255, 62, 200), poids = 0.20 },
}

-- ── le niveau 1 : « le jour d'altitude » (biomes matin/midi/aprem, L12775) ──
local function rgb(r, g, b) return Color3.new(r, g, b) end
Config.CIEL = {
	heure = 14.6,
	zenith = rgb(0.08, 0.30, 0.62),
	horizon = rgb(0.93, 0.93, 0.86),
	soleil = rgb(1, 0.95, 0.84),
	ambiance = Color3.fromRGB(70, 86, 118),
	ambianceExt = Color3.fromRGB(150, 170, 200),
	expo = -0.05,                -- (1er retour : la capture Studio était délavée, laiteuse)
	brumeDensite = 0.035,         -- (la mer de nuages doit se lire jusqu'à l'horizon : la brume du web n'en mange que 20 % à 4 km)
	brumeVoile = 1.3,
	saturation = 0.22,
	contraste = 0.16,
	mer = rgb(0.84, 0.90, 0.92),          -- la mer de nuages (couleur du brouillard du matin)
	merOmbre = Color3.fromRGB(128, 148, 186),   -- le versant à l'ombre des dômes (web : #6390B5)
	merSommet = Color3.fromRGB(190, 188, 182),  -- les sommets au soleil (web : #FFF7E9 — assombri : Roblox éclaire par-dessus)
	merTrou = Color3.fromRGB(86, 128, 172),     -- les rares trous (#367CA8)
	merMenu = 620,                              -- m : au menu la caisse tombe de très haut, la mer est loin dessous
}
Config.ROUTE = {
	bitume = Color3.fromRGB(54, 58, 78),  -- le bleu-gris de la capture web du niveau 1 (0x322e40 × ROUTE_JOUR, éclairé par le ciel)
	sodium = Color3.fromRGB(255, 188, 72), -- la ligne centrale
	voie = Color3.fromRGB(210, 216, 230),  -- les lignes de voie
	neon = Color3.fromRGB(62, 230, 240),  -- 0x3ee6f0 : les rails de néon
	tranche = Color3.fromRGB(255, 59, 92), -- 0xff3b5c : la tranche de la dalle
	pad = Color3.fromRGB(255, 176, 64),
}

-- ── la caméra (L36096-36170, L36389) ──
Config.CAM = {
	fov = 72, fovMax = 104,
	recul = 3.6, reculL = 4.0 * 0.42, -- camBack = 3,6 + l·0,42 + km/h·0,0018
	hauteur = 0.40,                   -- camH = camBack·0,40 + km/h·0,0012
	vise = 8.5, viseH = 1.05,         -- on vise 8,5 m devant, 1,05 m au-dessus
}

-- ── le reste ──
-- Comme TEST_CAISSES du jeu web (index.html) : toutes les caisses s'ÉQUIPENT, mais la fiche du garage continue
-- d'écrire la VRAIE condition. ⚠ à remettre à false pour la version publique : c'est l'unique interrupteur.
Config.TEST_CAISSES = true

Config.CAISSE_TEST = nil :: number? -- (banc) force la caisse équipée, pour regarder un gabarit sans passer par le garage

Config.GARAGE_Y = 3000 -- où la caisse attend quand on est au menu (hors de la route)
Config.DATASTORE = "CashCarRecords_v1"
Config.GRAINE_FIXE = nil :: number? -- mettre un nombre pour que tous les serveurs roulent sur la même route

-- LES SONS. Roblox ne joue que des sons importés sur Roblox : importer le dossier ROBLOX/sons-a-importer
-- (Studio → Fenêtre → Asset Manager → Bulk Import), puis coller ici chaque numéro « rbxassetid://… ».
-- Vide = le son de secours livré avec Roblox (quand il existe), sinon silence.
Config.SONS = {
	musique = "", moteur = "", nitro = "", ventAltitude = "",
	piece = "", decollage = "", poseParfait = "", poseChoc = "", poseLourde = "", vrille = "",
	maillon = "", bigAir = "", encaisse = "", explosion = "", pad = "", nitroPlein = "",
	tap = "", go = "", bip = "", compteFin = "", record = "", portail = "", fronde = "",
}
Config.SONS_SECOURS = {
	explosion = "rbxasset://sounds/impact_explosion_03.mp3",
	decollage = "rbxasset://sounds/action_jump.mp3",
	poseChoc = "rbxasset://sounds/action_jump_land.mp3",
	poseLourde = "rbxasset://sounds/action_jump_land.mp3",
	ventAltitude = "rbxasset://sounds/action_falling.ogg",
	tap = "rbxasset://sounds/volume_slider.ogg",
	piece = "rbxasset://sounds/volume_slider.ogg",
}

return Config
