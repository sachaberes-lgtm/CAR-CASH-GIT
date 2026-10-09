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
-- LA GRAVITÉ DE L'ORBITE (ORB_G, ORB_AIR, L28085) : en ESPACE la gravité est divisée par deux, la jauge d'airtime passe de 6 à 10,2 s
Config.ORB_G = 0.5
Config.ORB_AIR = 1.7
Config.ROAD_HALF = 28      -- demi-largeur de la route (L7115 × LARGEUR 2.0) : 56 m de bitume
Config.THICK = 2.6         -- épaisseur de la dalle
Config.MORT_SOUS = 120     -- on meurt 120 m sous le point le plus bas de la piste
Config.ARRET_KMH = 22      -- « roule ou crève » : sous 22 km/h pendant 6 s → boum
Config.ARRET_T = 6
-- LE MODE FACILE (L27967) : la SEULE assistance du jeu, en option. Quatre différences, rien d'autre :
-- la caisse suit 80 % des virages toute seule, 10 s de vol au lieu de 6, trois vies, 5 m de pose en plus de chaque côté.
Config.FACILE = { coeurs = 3, air = 10 / 6, bord = 5, virage = 0.8, cap = 1.6 }
-- (Sacha, 01/10 : « mets que le mode normal ») — le mode FACILE reste écrit mais ÉTEINT : ni choix au premier lancement,
-- ni réglage. Le rallumer = passer ceci à true, rien d'autre.
Config.FACILE_ACTIF = false

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
-- (leur nom ANGLAIS vient de la liste cuite des moteurs : un seul endroit, celui du jeu web — voir Config.nomMoteur)
do
	local okL, L = pcall(function() return require(script.Parent:WaitForChild("Moteurs"):WaitForChild("Liste")) end)
	if okL and type(L) == "table" then
		for i, m in Config.MOTEURS do
			local l = L[i - 1]
			if type(l) == "table" and l.en then (m :: any).en = l.en end
		end
	end
end
-- le nom d'un moteur (indice 1 = le moteur rouillé) dans la langue du joueur
function Config.nomMoteur(i: number): string
	local m: any = Config.MOTEURS[i]
	if not m then return "" end
	return (Config.francais() or not m.en) and m.nom or m.en
end
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
-- les CINQ cristaux (pouvoirs v2, L23402 — le bouclier est retiré) : le même pouvoir repris se CUMULE (plafond 2 × sa durée)
Config.POUVOIRS = {
	n = { nom = "NITRO MAX", nomEN = "NITRO MAX", duree = 9, couleur = Color3.fromRGB(164, 92, 255), poids = 0.21 },    -- la nitro ne se vide plus (flammes violettes)
	a = { nom = "AIR MAX", nomEN = "AIR MAX", duree = 14, couleur = Color3.fromRGB(94, 230, 255), poids = 0.17 },       -- plus de mort « trop longtemps en l'air »
	v = { nom = "VITESSE x2", nomEN = "SPEED x2", duree = 8, couleur = Color3.fromRGB(255, 62, 200), poids = 0.16 },    -- l'avance ×2 (plafond commun ×2,6 avec NITROOO)
	m = { nom = "AIMANT", nomEN = "MAGNET", duree = 12, couleur = Color3.fromRGB(63, 224, 106), poids = 0.19 },         -- une sphère de 50 m sur les pièces et les fruits
	x = { nom = "AURA x2", nomEN = "AURA x2", duree = 12, couleur = Color3.fromRGB(255, 201, 58), poids = 0.27 },       -- chaque gain d'aura doublé
}

-- ── LES HABILLAGES de la boutique (COSM, L22132) : peintures, ailes, traînées. p = le prix ; mis = le carnet qui la donne
-- (elle ne s'achète pas) ; ni l'un ni l'autre = offerte. g = la matière de la peinture (s satiné, c chrome, o or).
local function hx(h: number): Color3 return Color3.fromRGB(bit32.rshift(h, 16), bit32.band(bit32.rshift(h, 8), 255), bit32.band(h, 255)) end
Config.HABITS = {
	peinture = {
		{ id = "usine", nom = "D'ORIGINE", en = "FACTORY", d = "La teinte du constructeur. Elle a fait ses preuves.", dEN = "The maker's color. It has proven itself." },
		{ id = "menthe", nom = "MENTHE GLACEE", en = "ICED MINT", p = 2500, c = hx(0x5ff0c6), d = "Fraîche comme un billet qui sort du distributeur.", dEN = "Fresh as a bill straight out of the ATM." },
		{ id = "minuit", nom = "BLEU MINUIT", en = "MIDNIGHT BLUE", p = 5000, c = hx(0x2b43c4), d = "Le bleu des néons de la ville, à trois heures du matin.", dEN = "The blue of the city's neon signs, at three in the morning." },
		{ id = "noir", nom = "NOIR MAT", en = "MATTE BLACK", p = 9000, c = hx(0x202128), g = "s", d = "Pas un reflet. Même la police hésite.", dEN = "Not a single reflection. Even the police hesitate." },
		{ id = "couchant", nom = "COUCHER DE SOLEIL", en = "SUNSET", p = 18000, grad = { hx(0xffc23a), hx(0xff4f8b), hx(0x6b3cff) }, d = "Du miel en bas, du violet en haut : le ciel de 19 h, en laque.", dEN = "Honey at the bottom, violet at the top: the 7 pm sky, in lacquer." },
		{ id = "chrome", nom = "CHROME MIROIR", en = "MIRROR CHROME", p = 60000, c = hx(0xe9eef5), g = "c", d = "Tu te vois dedans. Les autres aussi.", dEN = "You can see yourself in it. So can the others." },
		{ id = "or", nom = "OR MASSIF", en = "SOLID GOLD", roue = true, c = hx(0xffc93a), g = "o", d = "Ne s'achète pas : elle se gagne à la ROUE.", dEN = "Can't be bought: it is won on the WHEEL." },
	},
	aile = {
		{ id = "panneaux", nom = "PANNEAUX", en = "PANELS", d = "Deux planches de planeur qui sortent des flancs. Sobre.", dEN = "Two glider boards sliding out of the sides. Understated." },
		{ id = "helices", nom = "HELICES", en = "PROPELLERS", p = 3000, d = "Quatre rotors. Ça ne vole pas mieux, mais ça brasse de l'air.", dEN = "Four rotors. It doesn't fly better, but it moves some air." },
		{ id = "plumes", nom = "PLUMES D'ANGE", en = "ANGEL FEATHERS", p = 12000, d = "Blanches, en éventail. Le ciel te prend pour un des siens.", dEN = "White, fanned out. The sky takes you for one of its own." },
		{ id = "chauve", nom = "CHAUVE-SOURIS", en = "BAT", p = 25000, d = "Membranes noires et doigts d'os. Pour les vols de nuit.", dEN = "Black membranes and bone fingers. For night flights." },
	},
	trainee = {
		{ id = "nitro", nom = "NITRO", en = "NITRO", d = "Orange brûlé. Le classique des tuyères.", dEN = "Burnt orange. The exhaust classic." },
		{ id = "menthe", nom = "MENTHE", en = "MINT", p = 2000, c = Color3.fromRGB(59, 255, 180), d = "Un sillage vert d'eau qui sent le propre.", dEN = "A sea-green wake that smells clean." },
		{ id = "rose", nom = "ROSE NEON", en = "NEON PINK", p = 4000, c = Color3.fromRGB(255, 39, 185), d = "Le rose des enseignes. On te suit à la trace.", dEN = "The pink of the signs. They can track you by it." },
		{ id = "or", nom = "POUDRE D'OR", en = "GOLD DUST", p = 15000, c = Color3.fromRGB(255, 185, 39), d = "Tu ne laisses pas de la fumée derrière toi. Tu laisses de l'or.", dEN = "You don't leave smoke behind you. You leave gold." },
		{ id = "arcenciel", nom = "ARC-EN-CIEL", en = "RAINBOW", roue = true, arcenciel = true, d = "Ne s'achète pas : elle se gagne à la ROUE.", dEN = "Can't be bought: it is won on the WHEEL." },
	},
}
function Config.habit(cat: string, id: string?): any
	local l = Config.HABITS[cat]
	if not l then return nil end
	for _, d in l do
		if d.id == id then return d end
	end
	return l[1]
end

-- ── les FRUITS de l'étal (FRUIT_DEFS, L20203) : ils ne rendent QUE de la nitro (la réserve BLEUE) ; boost ne dose plus que la fête ──
Config.FRUITS = {
	{ nom = "PECHE PLATE", boost = 0.6, freq = 10, couleur = Color3.fromRGB(255, 158, 194), taille = 2.2, plat = 0.6 },
	{ nom = "BANANE", boost = 0.5, freq = 12, couleur = Color3.fromRGB(255, 214, 58), taille = 1.9, plat = 0.75 },
	{ nom = "GRENADE", boost = 1.0, freq = 4, couleur = Color3.fromRGB(209, 15, 43), taille = 2.3, plat = 1 },
	{ nom = "ORANGE", boost = 0.5, freq = 11, couleur = Color3.fromRGB(255, 139, 18), taille = 2.2, plat = 1 },
	{ nom = "MYRTILLE", boost = 0.35, freq = 26, couleur = Color3.fromRGB(106, 75, 216), taille = 1.7, plat = 0.95 },
	{ nom = "PASTEQUE", boost = 2.0, freq = 1, couleur = Color3.fromRGB(70, 170, 80), taille = 3.0, plat = 1 },
}
-- LA LIGNE PARFAITE (L11855) : une file FRUIT, PAD, FRUIT, PAD… posée en course devant la caisse, sur la trajectoire idéale
Config.LIGNE = { dt = 1.2, don = 1.15, voir = 3.5 }

-- ── LES NIVEAUX (NIVEAUX du jeu web, L13322) : le portail est la porte entre deux mondes. Sacha, 2/10 : « fais la ville et
-- l'espace, fais pas Paris » — le cycle du web, sans Paris : NUAGES → VILLE → ORBITE → L'ORAGE → MINUIT EN VILLE → PLUIE DE
-- SATELLITES, puis on recommence. Une VARIANTE (`var`) garde l'`id` de son lieu : toute la ville suit, tout le ciel de coton suit ;
-- elle ne change que ce qui fait sa difficulté (orage : les bancs partout et l'éclair · nuit : les fenêtres éteintes et les phares ·
-- hard : des satellites SUR la route).
-- (5/10, Sacha : « sur la version Roblox, mets la ville avant les nuages » — la VILLE ouvre la partie ; l'auto-école, la zone 0,
-- garde le ciel des nuages)
Config.NIVEAUX = {
	{ id = "ville", nom = "AU-DESSUS DE LA VILLE", en = "ABOVE THE CITY" },
	{ id = "nuages", nom = "MER DE NUAGES", en = "SEA OF CLOUDS" },
	{ id = "espace", nom = "EN ORBITE", en = "IN ORBIT" },
	{ id = "nuages", var = "orage", nom = "L'ORAGE", en = "THE STORM" },
	{ id = "ville", var = "nuit", nom = "MINUIT EN VILLE", en = "MIDNIGHT CITY" },
	{ id = "espace", var = "hard", nom = "PLUIE DE SATELLITES", en = "SATELLITE STORM" },
}
Config.NIVEAU_TEST = nil :: string? -- (banc) force le niveau de TOUTES les zones : "ville", "espace", "orage", "nuit", "hard"
-- le niveau d'une zone (la zone 0 est l'auto-école : le ciel des nuages)
function Config.niveau(zone: number): any
	local force = Config.NIVEAU_TEST
	if force and zone > 0 then
		for _, n in Config.NIVEAUX do
			if (n.var or n.id) == force then return n end
		end
	end
	return Config.NIVEAUX[(math.max(1, zone) - 1) % #Config.NIVEAUX + 1]
end

-- ── le niveau 1 : « le jour d'altitude » (biomes matin/midi/aprem, L12775) ──
local function rgb(r, g, b) return Color3.new(r, g, b) end
Config.CIEL = {
	heure = 14.6,
	zenith = rgb(0.08, 0.30, 0.62),
	horizon = rgb(0.93, 0.93, 0.86),
	soleil = rgb(1, 0.97, 0.93),  -- (presque neutre : le crème des nuages est CUIT dans leurs sommets ; un soleil pêche les passait au beige)
	-- (2e retour de Sacha : « c'est moche » — tout tirait au CYAN GLACÉ, des icebergs. La version web met l'ombre en LAVANDE
	-- (le côté ombre « pris par le ciel », nuage8Mat) et le soleil en crème : ce sont ces deux teintes qui font le coton.)
	ambiance = Color3.fromRGB(120, 118, 180), -- (l'ambiance des lieux COUVERTS : l'atelier du garage, le dessous de la caisse)
	ambianceExt = Color3.fromRGB(235, 230, 245),
	expo = -0.06,
	brumeDensite = 0.035,         -- (la mer de nuages doit se lire jusqu'à l'horizon : la brume du web n'en mange que 20 % à 4 km)
	brumeVoile = 0.5,  -- (à 0,5 on voyait les nuages PEINTS du ciel par défaut de Roblox : des cirrus de photo derrière des cumulus de jeu)
	saturation = 0.3,
	contraste = 0.24,
	mer = rgb(0.84, 0.90, 0.92),          -- la mer de nuages (couleur du brouillard du matin)
	-- (Roblox éclaire l'image par-dessus, × 1,4 environ : ces teintes sont celles du web divisées d'autant — à l'écran, des
	-- sommets blancs et des versants bleu ciel, comme la capture du menu web)
	-- (3e retour, mesuré : la mer du menu web est DOUCE, (133,160,183) en moyenne, peu contrastée — ici des trous bleu roi dans du blanc)
	merOmbre = Color3.fromRGB(148, 166, 204),   -- le versant à l'ombre des dômes
	merSommet = Color3.fromRGB(192, 192, 194),  -- les sommets au soleil
	merTrou = Color3.fromRGB(120, 146, 196),    -- les rares trous
	-- LA MAQUETTE DU TITRE (3/10, mesuré au banc) : Roblox démarre en qualité graphique basse et n'affiche alors PAS ce qui est loin —
	-- les cumulus du titre (1 à 7 km) et la mer (620 m dessous) restaient invisibles 15 à 30 s, les plus proches d'abord ; sur un
	-- téléphone en qualité basse, jamais. Le décor du titre est donc une MAQUETTE : distances et tailles × titreK autour de la caisse
	-- (les angles, donc l'image, ne changent pas), la mer du menu × titreK aussi.
	titreK = 0.35,
	merMenu = 620,                              -- m : au menu la caisse tombe de très haut, la mer est loin dessous
}
Config.ROUTE = {
	bitume = Color3.fromRGB(84, 80, 108),  -- (captures web en double définition : un bitume MAT, ardoise violacée (110,105,140) à mi-distance ; c'est la vignette qui noircit le bas de l'image, pas la route — et il ne reflète pas les nuages)
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
Config.TEST_CAISSES = false -- (4/10 : la version PUBLIQUE — chaque caisse se gagne, s'achète ou se tire à la roue)

-- ── LA ROUE (voir Client/Roue et ServerScriptService/Revenus) : huit cases, tirées au SERVEUR selon leur poids `w`. Un tour gratuit
-- toutes les `libreH` heures, un tour offert toutes les `parties` parties (d'au moins 15 s), et des tours à vendre (REVENUS.produits.tours3).
-- « caisse » : une caisse EXCLUSIVE de la roue (cond.k = "roue") qu'on n'a pas encore — on choisit de la GARDER ou de la vendre
-- `revente` $ ; plus rien à gagner : `revente` $ d'office. « habit » : la peinture OR MASSIF ou la traînée ARC-EN-CIEL ; déjà tout :
-- `v` $. L'ordre est celui de la roue, dans le sens des aiguilles d'une montre depuis le haut.
Config.ROUE = {
	libreH = 4, parties = 3, revente = 7500,
	cases = {
		{ k = "argent", v = 250, w = 24 },
		{ k = "caisse", w = 7 },
		{ k = "argent", v = 500, w = 22 },
		{ k = "argent", v = 2500, w = 9 },
		{ k = "argent", v = 1000, w = 18 },
		{ k = "habit", v = 2500, w = 5 },
		{ k = "argent", v = 5000, w = 5 },
		{ k = "argent", v = 20000, w = 1, jackpot = true },
	},
}

-- ── LES REVENUS (voir ServerScriptService/Revenus) — les offres en Robux sont aussi EN TÊTE de la BOUTIQUE (Client/Boutique) ──
-- Les NUMÉROS se posent ici une fois les objets créés sur create.roblox.com (ton expérience → Monétisation / Engagement) : à 0,
-- l'objet n'existe pas et ce qui en dépend se tait (sa carte de la boutique dit BIENTOT). Les prix en Robux se règlent sur le site,
-- pas ici : le jeu les LIT sur Roblox.
Config.REVENUS = {
	-- les PASSES (achat unique, vendus aussi sur la page du jeu et dans la BOUTIQUE) : « ×2 ARGENT » (tout l'argent d'une partie
	-- compte double — 500 R$), « NITRO INFINIE » (la réserve de nitro ne se vide jamais, pour toujours — 700 R$ ; Sacha, 5/10),
	-- « VIP » (cadeaux du jour et de temps de jeu doublés, nom doré au-dessus de la caisse)
	-- (NITRO INFINIE se coupe et se rallume dans les RÉGLAGES — colonne JEU — pour qui possède le passe : réglage « nitroInf »)
	passes = { argent2 = 2024936419, nitroInfini = 2022152446, vip = 2023610427 },
	-- les PRODUITS (achat répété) : le CŒUR (50 R$ ; Sacha, 5/10 : « une vie en plus sous forme de cœur ») — un cœur = une vie : à
	-- l'explosion, la carte de la mort propose d'en UTILISER un (on repart sur la route) ou de terminer ; les cœurs se GARDENT dans le
	-- profil d'une partie à l'autre ; sans cœur, la même carte propose d'en acheter un (acheté, il sert aussitôt).
	-- (5/10, lot 2) les PACKS de cœurs : coeur5 (5 cœurs, ~199 R$), coeur15 (15 cœurs, ~499 R$) ; le KIT DU PILOTE (99 R$, une fois
	-- par compte : voir `kit` plus bas)
	produits = { coeur = 0, coeur5 = 0, coeur15 = 0, tours3 = 0, kit = 0 }, -- (tours3 : TROIS TOURS DE ROUE d'un coup — voir Config.ROUE)
	coeursPar = { coeur = 1, coeur5 = 5, coeur15 = 15 }, -- combien de cœurs donne chaque produit « cœur »
	-- LE KIT DU PILOTE (l'offre de bienvenue, en tête de la boutique tant qu'il n'est pas acheté) : de l'argent, des cœurs, et un
	-- habillage OFFERT (« catégorie:id » de Config.HABITS — ici la traînée POUDRE D'OR, rangée au garage)
	kit = { argent = 50000, coeurs = 3, habit = "trainee:or" },
	-- LES PACKS D'ARGENT (produits, achat répété ; section ARGENT de la boutique) : `id` = le numéro du produit, `v` = les $ versés au
	-- compte. Prix conseillés : 99 · 249 · 499 · 999 · 2 499 R$ (le bonus grandit avec la taille). Les montants se règlent ICI.
	argent = {
		{ id = 0, v = 25000 },  -- 99 R$
		{ id = 0, v = 70000 },  -- 249 R$
		{ id = 0, v = 150000 }, -- 499 R$
		{ id = 0, v = 325000 }, -- 999 R$
		{ id = 0, v = 900000 }, -- 2 499 R$
	},
	-- LES CAISSES LÉGENDAIRES en Robux (les 7 « premium » du catalogue, cond.k = "premium") : [indice de la caisse] = numéro du
	-- PRODUIT. Achat UNIQUE gardé dans le profil (une caisse à soi ne se rachète pas) ; purement cosmétique — la vitesse vient du
	-- moteur, jamais de la caisse. Prix conseillés (le prix web en euros × ~80) en commentaire.
	-- (9/10 : la gamme resserrée du web — Léo, ccfbb02 — reprise à l'identique : REQUIN et COMÈTE passent en défis à venir, ACIDE à
	-- l'argent du jeu, L'ÉTERNELLE à la roue, FORMULE OR / ENDURANCE 24 / EL PATRON retirées ; PIZZA EXPRESS et LA FÉLINE entrent ;
	-- LE DRAGON D'OR ne se vend plus : c'est le cadeau du 7e jour, voir `jour7` plus bas)
	caisses = {
		[9] = 0,  -- CHAT ARC-EN-CIEL (4,20 €) — 339 R$
		[19] = 0, -- LA PIZZA EXPRESS (161 €) — 12 899 R$
		[54] = 0, -- LA FÉLINE (1,61 €) — 129 R$
		[57] = 0, -- LE TRÔNE CENTRAL (1,61 €) — 129 R$
		[58] = 0, -- LE SPECTRE (1,61 €) — 129 R$
		[59] = 0, -- LE CHEVALIER NOIR (9,99 €) — 799 R$
		[60] = 0, -- LE MUR DU SON (0,99 €) — 79 R$
	},
	-- (9/10, Sacha : « met les prix ») le prix AFFICHÉ sur la carte du garage tant que Roblox n'a pas répondu (ou que le produit n'existe
	-- pas encore) — dès que le produit existe, c'est SON vrai prix qui s'affiche. À tenir égal au prix choisi sur create.roblox.com.
	prixCaisses = { [9] = 339, [19] = 12899, [54] = 129, [57] = 129, [58] = 129, [59] = 799, [60] = 79 },
	-- (9/10) les prix CONSEILLÉS des passes, des produits et des packs d'argent (ceux du README) : la boutique les écrit en terne,
	-- « BIENTOT R$ x », tant que le produit n'existe pas — dès qu'il existe, c'est le prix lu sur Roblox. À tenir égal aux prix
	-- choisis sur create.roblox.com (comme prixCaisses).
	prixConseilles = {
		passes = { argent2 = 500, nitroInfini = 700, vip = 449 },
		produits = { coeur = 50, coeur5 = 199, coeur15 = 499, kit = 99, tours3 = 99 },
		argent = { 99, 249, 499, 999, 2499 },
	},
	-- (9/10, Sacha : « après 1 semaine de connexion quotidienne, les joueurs gagnent la voiture dragon d'or ») : la caisse offerte au
	-- 7e jour d'affilée du CADEAU DU JOUR (cond.k = "jour7" au catalogue) — une fois ; déjà à soi, le 7e jour reste le gros montant
	jour7 = 61, -- LE DRAGON D'OR
	-- les BADGES : bienvenue, permis de l'auto-école, zone 6 atteinte, moteur palier 10, 1 000 d'aura en une partie, record d'un
	-- million, sept jours d'affilée
	badges = { bienvenue = 0, permis = 0, zone6 = 0, moteur10 = 0, aura1000 = 0, millionnaire = 0, serie7 = 0 },
	groupe = 0, groupeBonus = 2000, -- le GROUPE Roblox du jeu : rejoindre = 2 000 $ (une fois)
	premiumBonus = 0.1, -- +10 % d'argent pour les membres Premium (Roblox paie au temps qu'ils passent dans le jeu)
	invitation = 1000, -- arriver par l'invitation d'un ami : 1 000 $ pour lui et pour l'ami (une fois)
	jour = { 500, 750, 1000, 1500, 2000, 3000, 5000 }, -- le CADEAU DU JOUR, jours 1 à 7 de la série (puis ça recommence)
	tempsJeu = { { 5, 300 }, { 15, 800 }, { 30, 1500 }, { 60, 3000 } }, -- { minutes dans la session, $ } — puis 3 000 $ chaque heure
}

-- LA LANGUE : celle de Roblox (LocaleId du joueur) — le français pour « fr-* », l'anglais pour tout le reste. UN SEUL endroit pour
-- la lire. (banc) LANGUE_TEST force la langue (« en » : tout le jeu en anglais dans un Studio réglé en français).
Config.LANGUE_TEST = nil :: string?
Config.TACTILE_TEST = nil :: boolean? -- (banc) l'interface du TÉLÉPHONE (volant, bouton nitro, astuces tactiles) dans Studio
-- (banc) la copie de TEST est MUETTE (Sacha, 4/10 : les essais jouaient le son du jeu sur son PC pendant qu'il travaillait) —
-- outils/banc.sh la pose toujours, sauf `SON=1` ; le jeu publié n'y touche jamais
Config.MUET_TEST = nil :: boolean?
function Config.francais(): boolean
	if Config.LANGUE_TEST then return Config.LANGUE_TEST == "fr" end
	local ok, l = pcall(function() return game:GetService("Players").LocalPlayer.LocaleId end)
	return string.sub((ok and l) or "fr", 1, 2) == "fr"
end
Config.CAISSE_TEST = nil :: number? -- (banc) force la caisse équipée, pour regarder un gabarit sans passer par le garage
Config.BANC_BUDGET = false -- (banc) mesure, au menu, ce qu'il reste du budget de mémoire des maillages (voir Maillage.mesurer)

Config.GARAGE_Y = 3000 -- où la caisse attend quand on est au menu (hors de la route)
Config.DATASTORE = "CashCarRecords_v1"
Config.GRAINE_FIXE = nil :: number? -- mettre un nombre pour que tous les serveurs roulent sur la même route

-- LES SONS. Roblox ne joue que des sons importés sur Roblox : importer le dossier ROBLOX/sons-a-importer
-- (Studio → Fenêtre → Asset Manager → Bulk Import), puis outils/remplir-sons.luau dans la barre de commande (il remplit
-- CashCar/SonsIds d'un coup) — ou coller ici chaque numéro « rbxassetid://… » à la main.
-- Vide = le son de secours livré avec Roblox (quand il existe), sinon silence.
Config.SONS = {
	musique = "", moteur = "", nitro = "", ventAltitude = "", crissement = "", -- (crissement : la boucle des pneus qui glissent)
	driftBrrr = "", rasBord = "", -- (la charge du drift qui monte ; le grondement du rase-bord)
	-- la musique par LIEU (MUSIC_LIEU du web) : les nuages, la ville (et l'accueil), l'orage ; pas importée = `musique` continue
	musiqueNuages = "", musiqueVille = "", musiqueOrage = "",
	-- l'ACCUEIL (MUSIC_LOBBY du web, 3/10) : un des deux morceaux de lobby, tiré au lancement et gardé toute la session
	musiqueLobby1 = "", musiqueLobby2 = "",
	piece = "", decollage = "", poseParfait = "", poseChoc = "", poseLourde = "", vrille = "",
	maillon = "", bigAir = "", encaisse = "", explosion = "", pad = "", nitroPlein = "",
	tap = "", go = "", bip = "", compteFin = "", record = "", portail = "", fronde = "",
	-- les niveaux : l'éclair et le tonnerre de L'ORAGE ; les portes, l'ambiance et les débris de l'ORBITE ; la mort par satellite
	eclair = "", tonnerre = "", orbiteEntre = "", orbiteSort = "", espaceAmbiance = "",
	explosionLoin = "", esquive = "", touche = "", abri = "", mortSat = "",
	-- (second audit, 2/10) les sons que le jeu web joue et que Roblox taisait. Pas importés : le jeu garde ce qu'on entendait avant
	-- (voir Sons.vrai : le vrai son s'il est là, sinon son repli) — ou rien.
	alerteTic = "", alerteTac = "", arretTic = "", nitroSec = "", nitroVide = "", nitroPleine = "", nitroooPalier = "", vitessePure = "",
	pwrN = "", pwrA = "", pwrV = "", pwrM = "", pwrX = "", pwrDouble = "", pwrTriple = "", pwrBientot = "",
	pwrFin = "", frenEntre = "", frenSort = "", frenArme = "", frenRecord = "", frenPose = "", frenCash = "", triadeRevele = "",
	triadeRenait = "", triadeMeurt = "", flowPalier = "", flowPerdu = "", plusVite = "", poseTravers = "", poseContresens = "", poseCheveu = "",
	verdict2 = "", verdict3 = "", verdictMeteor = "", verdictMega = "", figMonstre = "", figMeteore = "", figDauphin = "", dauphinBanc = "",
	figSnake = "", figBump = "", raccourci = "", cratere = "", miracule = "", sansFaute = "", palierVitesse = "", auraX5 = "",
	auraX8 = "", auraX10 = "", auraRecord = "", serie = "", recolte = "", fruit1 = "", fruit2 = "", fruit3 = "",
	fruit4 = "", fruit5 = "", fruit6 = "", plot = "", flaque = "", frole = "", driftCharge = "", turboMini = "",
	turboSuper = "", turboUltra = "", nuageEntre = "", nuageSort = "", nuageDefonce = "", portailProche = "", impactImmeuble = "", departLogo = "",
	moteurPalier = "", mortVide = "", mortAir = "", mortArret = "", debrisTole = "", garageTole = "", uiModale = "", uiFerme = "", uiRefus = "",
}
-- (les numéros remplis d'un coup par outils/remplir-sons.luau vivent dans CashCar/SonsIds : ils complètent les cases vides)
do
	local m = script.Parent:FindFirstChild("SonsIds")
	local ok, ids = pcall(function() return m and require(m :: ModuleScript) end)
	if ok and type(ids) == "table" then
		for k, v in ids do
			if type(v) == "string" and Config.SONS[k] == "" then Config.SONS[k] = v end
		end
	end
end
Config.SONS_SECOURS = {
	explosion = "rbxasset://sounds/impact_explosion_03.mp3",
	decollage = "rbxasset://sounds/action_jump.mp3",
	poseChoc = "rbxasset://sounds/action_jump_land.mp3",
	poseLourde = "rbxasset://sounds/action_jump_land.mp3",
	ventAltitude = "rbxasset://sounds/action_falling.ogg",
	tap = "rbxasset://sounds/volume_slider.ogg",
	piece = "rbxasset://sounds/volume_slider.ogg",
	tonnerre = "rbxasset://sounds/impact_explosion_03.mp3", -- (joué très grave : un roulement)
	explosionLoin = "rbxasset://sounds/impact_explosion_03.mp3",
}

return Config
