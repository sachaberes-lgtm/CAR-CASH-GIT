-- CASH CAR — LES TROIS HEURES DU NIVEAU NUAGES (BIOMES matin · midi · aprem du jeu web, L13195 ; tirées au hasard à chaque
-- piste : `lvlBiome`, L30930). Roblox n'avait qu'une heure, toute blanche — le jeu web, lui, passe d'un matin clair à un midi
-- cobalt, puis à une fin d'après-midi DORÉE (nuages pêche, ombres ardoise, horizon abricot).
-- Une heure = la brume (crème ou pêche du côté du soleil — `fogCj` —, bleue à l'opposé — `fog`), la teinte du soleil,
-- l'étalonnage, et la PALETTE des nuages (côté soleil, ombre vers le ciel, ombre du ventre : `volSun`, `volSky`, `volGnd`).
-- Le passage se fait en fondu (1,2 s au portail, comme `BIO_PORTAIL`) ; le menu garde le matin (l'ambiance du titre).
-- Posé CHEZ LE JOUEUR : le serveur a créé les objets (Ciel.poser), chacun les règle pour lui.
local Lighting = game:GetService("Lighting")
local TweenService = game:GetService("TweenService")
local Bus = require(script.Parent:WaitForChild("Bus"))
local Nuages = require(script.Parent:WaitForChild("Nuages"))
local Mer = require(script.Parent:WaitForChild("Mer"))
local Config = require(script.Parent.Parent:WaitForChild("Config"))

local Ambiance = {}
local RGB = Color3.fromRGB
local V3 = Vector3.new

-- brume = du côté du soleil · loin = à l'opposé · eclat / voile / densite = Atmosphere (Glare, Haze, Density)
-- soleil = la teinte de la lumière directe · ext = l'ambiance du plein air · teinte, sat, con = l'étalonnage · expo
-- S, OH, OB = la palette des nuages (0-255) · mer = la teinte de la mer de nuages
local HEURES: { [string]: any } = {
	matin = {
		brume = RGB(246, 238, 222), loin = RGB(96, 156, 240), eclat = 0.2, voile = 0.4, densite = 0.034, -- (mesuré : à voile 0,9 le ciel du matin sortait BLANC ; le web a un zénith azur profond)
		soleil = Color3.new(1, 0.97, 0.93), ext = RGB(235, 230, 245), teinte = RGB(255, 250, 244), sat = 0.38, con = 0.3, expo = -0.08,
		S = V3(300, 280, 248), OH = V3(186, 184, 236), OB = V3(160, 156, 222), mer = Color3.new(1, 1, 1), -- (5/10 : la face au soleil dorée, l'ombre mauve)
	},
	midi = {
		brume = RGB(236, 240, 236), loin = RGB(72, 140, 244), eclat = 0.15, voile = 0.3, densite = 0.032,
		soleil = Color3.new(1, 0.99, 0.96), ext = RGB(232, 234, 250), teinte = RGB(252, 252, 255), sat = 0.36, con = 0.3, expo = -0.05,
		S = V3(300, 286, 256), OH = V3(184, 188, 244), OB = V3(156, 160, 230), mer = Color3.new(1, 1, 1), -- (5/10 : un soleil plus chaud sur le coton)
	},
	-- LE TITRE (BIOMES.titre du web) : le matin poussé vers l'écran titre de Zelda — azur profond, horizon presque blanc, brume très loin
	-- (3/10, mesuré au banc : à densité 0,03 la brume de Roblox EFFAÇAIT tout le décor du titre — les 18 cumulus, à 2-7 km de la
	-- caméra, et la mer de nuages, étaient bien dans le cadre mais fondus dans le ciel : l'écran titre n'était qu'un aplat cyan. À
	-- 0,01 la mer et les cumulus reviennent, comme sur le web)
	titre = {
		brume = RGB(226, 238, 250), loin = RGB(70, 140, 235), eclat = 0.1, voile = 0.25, densite = 0.01,
		soleil = Color3.new(1, 0.96, 0.88), ext = RGB(235, 232, 246), teinte = RGB(255, 252, 248), sat = 0.34, con = 0.22, expo = -0.04,
		S = V3(286, 280, 268), OH = V3(176, 194, 242), OB = V3(152, 168, 228), mer = Color3.new(1, 1, 1),
	},
	aprem = {
		brume = RGB(255, 214, 168), loin = RGB(84, 128, 220), eclat = 1.0, voile = 0.9, densite = 0.046,
		soleil = Color3.new(1, 0.88, 0.72), ext = RGB(236, 222, 232), teinte = RGB(255, 244, 232), sat = 0.42, con = 0.32, expo = -0.1,
		S = V3(292, 246, 198), OH = V3(162, 168, 226), OB = V3(136, 140, 206), mer = Color3.new(1, 0.93, 0.86),
	},
	-- ── LA PLUIE NÉON (BIOMES.pluie, L13084) : le ciel du niveau VILLE — un plafond ardoise bas et mouillé, ni soleil ni étoiles, une
	-- brume VIOLETTE qui avale le lointain, et toute la couleur qui vient d'en bas : remplissage cyan, contre-jour MAGENTA.
	-- (nuit = l'horloge de Roblox à minuit : le ciel est noir ; `lum` = la lumière directe, `amb` = l'ambiance qui porte presque tout)
	pluie = {
		-- (mesuré au banc, 2/10) · le VOILE colore le ciel (à 2,4 il restait NOIR : il faut 10 pour que la brume violette le remplisse)
		-- · une ambiance CLAIRE et presque neutre : les fenêtres sont une image posée sur les tours, c'est l'ambiance qui les allume —
		-- sous une ambiance violette l'orange #ffb04a sortait bleu-gris · une lumière directe faible : pas de soleil sous la pluie
		nuit = true, etoiles = 0, lum = 0.5, amb = RGB(200, 190, 225),
		-- · la nuit, Roblox rend la brume à ~0,3 du rouge et 0,75 du bleu demandés, et l'étalonnage pousse encore le bleu : une brume
		-- violette (150,50,170) à saturation 0,5 donnait un ciel OUTREMER (45,0,241). Une brume ROSE (190,80,140), une saturation de
		-- 0,25 et une exposition un cran plus bas rendent le violet profond du web (50,6,114 au zénith)
		brume = RGB(190, 80, 140), loin = RGB(120, 50, 100), eclat = 0, voile = 10, densite = 0.26,
		soleil = RGB(255, 96, 190), ext = RGB(235, 225, 250), teinte = RGB(238, 226, 255), sat = 0.25, con = 0.28, expo = -0.1,
		S = V3(282, 272, 254), OH = V3(182, 194, 238), OB = V3(158, 168, 224), mer = Color3.new(1, 1, 1),
	},
	-- ── L'ORBITE (BIOMES.espace, L13063) : pas de ciel — « le NOIR COMPLET : zéro étoile, zéro lune, zéro halo solaire » ; UN soleil
	-- blanc et dur ; le dessous éclairé par le bleu de la Terre.
	-- (mesuré au banc, 2/10) à minuit Roblox n'éclaire plus qu'à la lune : la caisse sortait presque noire. L'orbite garde donc l'heure
	-- du JOUR (le soleil dur est là) et c'est le CIEL qu'on peint en noir (`noir` : les six faces de la boîte du ciel).
	espace = {
		-- (mesuré : sous une ambiance bleu Terre (40,64,132) à saturation 0,4, le bitume sortait BLEU ÉLECTRIQUE (5,10,190) ; le web est
		-- un indigo violacé (50,45,130) — l'ambiance garde du rouge, l'étalonnage sature moitié moins)
		noir = true, etoiles = 0, lum = 2.6, amb = RGB(70, 62, 120),
		brume = RGB(0, 0, 0), loin = RGB(0, 0, 0), eclat = 0, voile = 0, densite = 0,
		soleil = Color3.new(1, 0.97, 0.92), ext = RGB(80, 84, 150), teinte = RGB(246, 248, 255), sat = 0.2, con = 0.34, expo = -0.1,
		S = V3(282, 272, 254), OH = V3(182, 194, 238), OB = V3(158, 168, 224), mer = Color3.new(1, 1, 1),
	},
}
-- ── LA TEMPÊTE (BIOMES.tempete, L13162) : le ciel de L'ORAGE — les nuages du niveau 1 dans le noir : ardoise au zénith, une brume
-- proche et sombre (la route se lit à ~600 m : c'est l'ÉCLAIR qui l'ouvre, voir Client/Orage), pas de soleil, des nuages éclairés
-- d'un argent FROID sur des flancs d'ardoise.
HEURES.tempete = {
	-- (mesuré au banc, 2/10) une brume ardoise (58,62,96) à densité 0,5 noyait tout dans un bleu outremer, nuages compris : le web
	-- montre des nuages GRIS-LAVANDE sur un indigo violacé. La brume part donc vers le ROSE (Roblox lui retire son rouge), la densité
	-- tombe à 0,3, et la caisse garde une vraie lumière (elle est claire sur le web)
	sansSoleil = true, etoiles = 0, lum = 1.0, amb = RGB(118, 116, 170),
	brume = RGB(160, 96, 124), loin = RGB(96, 60, 88), eclat = 0, voile = 10, densite = 0.3,
	soleil = Color3.new(0.66, 0.70, 0.92), ext = RGB(180, 176, 220), teinte = Color3.new(1, 1, 1), sat = 0.1, con = 0.2, expo = -0.05,
	S = V3(214, 208, 238), OH = V3(120, 118, 166), OB = V3(62, 58, 98), mer = Color3.new(0.42, 0.40, 0.56),
}
-- ── MINUIT (BIOMES.nuitNoire, L13175) : la PLUIE NÉON trois heures plus tard. Le ciel presque noir, quelques étoiles, une brume
-- noire-bleue ; les lumières d'ambiance au plancher : ce qui éclaire la route, ce sont les PHARES.
HEURES.minuit = {
	-- (mesuré au banc) à exposition −0,3 et contraste 0,32 il ne restait RIEN : ni route ni caisse. Le web garde la caisse bien
	-- lisible et la route devinée sous les phares : l'exposition remonte, le contraste baisse, la brume garde une pointe de rose
	nuit = true, etoiles = 900, lum = 0.25, amb = RGB(150, 144, 176),
	brume = RGB(60, 30, 70), loin = RGB(30, 14, 40), eclat = 0, voile = 6, densite = 0.3,
	soleil = RGB(120, 140, 220), ext = RGB(170, 164, 196), teinte = RGB(236, 232, 255), sat = 0.28, con = 0.15, expo = 0.25,
	S = V3(282, 272, 254), OH = V3(182, 194, 238), OB = V3(158, 168, 224), mer = Color3.new(1, 1, 1),
}
local ORDRE = { "matin", "midi", "aprem" }
local FACES = { "SkyboxBk", "SkyboxDn", "SkyboxFt", "SkyboxLf", "SkyboxRt", "SkyboxUp" }
local NOIR = "rbxasset://textures/blackBkg_square.png"
local FACES_JOUR: { [string]: string }? = nil
local NIVEAU = "nuages" -- le niveau de la zone active (Bus « niveau »)
local VARIANTE: string? = nil -- sa variante (orage, nuit, hard)
local courante = ""

function Ambiance.nom(): string return courante end

-- L'ÉCLAT (Sacha, 4/10 : « améliore les éclairages et les graphismes » — et sa direction de toujours : saturé, contrasté, façon GTA,
-- jamais délavé). Mesuré au banc en A/B sur la même image : +0,12 de saturation, +0,08 de contraste, et le JOUR, le voile et
-- l'éblouissement de la brume divisés par deux — le ciel bleuit, les nuages prennent du relief, la ville claque. (La nuit, le
-- voile reste : c'est lui qui peint le ciel violet de la ville et de l'orage.)
local ECLAT = { sat = 0.12, con = 0.08, voile = 0.55, eblouit = 0.5 }
-- LA LAMPE DU HÉROS (Caisse.construire) suit l'heure (5/10, revue visuelle) : la nuit elle sauve la caisse du contre-jour ; en plein
-- jour, ajoutée au soleil, elle délavait la laque en PÊCHE — elle se fait discrète
local HEROS = { pluie = 1.1, minuit = 1.3, tempete = 1.0, espace = 0.6 }
local HEROS_JOUR = 0.3
function Ambiance.poser(nom: string, duree: number?)
	local H = HEURES[nom]
	if not H or nom == courante then return end
	courante = nom
	local atm = Lighting:FindFirstChild("Altitude")
	local cc = Lighting:FindFirstChild("Etalonnage")
	local info = TweenInfo.new(math.max(0.01, duree or 1.2), Enum.EasingStyle.Sine, Enum.EasingDirection.InOut)
	local kH = HEROS[nom] or HEROS_JOUR
	workspace:SetAttribute("HerosK", kH)
	local mc = workspace:FindFirstChild("MaCaisse")
	local lh = mc and mc:FindFirstChild("Heros", true)
	if lh and lh:IsA("PointLight") then TweenService:Create(lh, info, { Brightness = kH }):Play() end
	if atm then
		local jour = not (H.nuit or H.noir or H.sansSoleil)
		TweenService:Create(atm, info, { Color = H.brume, Decay = H.loin, Glare = H.eclat * (jour and ECLAT.eblouit or 1),
			Haze = H.voile * (jour and ECLAT.voile or 1), Density = H.densite }):Play()
	end
	if cc then
		TweenService:Create(cc, info, { TintColor = H.teinte, Saturation = H.sat + ECLAT.sat, Contrast = H.con + ECLAT.con }):Play()
	end
	TweenService:Create(Lighting, info, { ColorShift_Top = H.soleil, OutdoorAmbient = H.ext, ExposureCompensation = H.expo,
		Brightness = H.lum or 1.2, Ambient = H.amb or Config.CIEL.ambiance }):Play()
	-- le JOUR ou la NUIT : l'horloge bascule à mi-fondu (le ciel noir de la ville et de l'orbite, sans soleil ni lune de Roblox)
	local ciel = Lighting:FindFirstChild("CielCashCar")
	task.delay((duree or 1.2) * 0.5, function()
		if courante ~= nom then return end
		Lighting.ClockTime = H.nuit and 0 or Config.CIEL.heure
		if ciel then
			ciel.StarCount = H.etoiles or 0
			ciel.CelestialBodiesShown = not (H.nuit or H.noir or H.sansSoleil)
			-- le ciel NOIR de l'orbite : les six faces de la boîte du ciel passent au noir (une image livrée avec Roblox) ; ailleurs,
			-- elles retrouvent celles d'origine
			if not FACES_JOUR then
				FACES_JOUR = {}
				for _, f in FACES do FACES_JOUR[f] = (ciel :: any)[f] end
			end
			for _, f in FACES do (ciel :: any)[f] = H.noir and NOIR or FACES_JOUR[f] end
		end
	end)
	-- les nuages changent de palette à mi-fondu (le web passe par le sombre au portail : on ne voit pas la bascule)
	task.delay((duree or 1.2) * 0.5, function()
		if courante ~= nom then return end
		Nuages.palette(H.S, H.OH, H.OB)
		pcall(Mer.teinte, H.mer)
	end)
end

-- L'ÉCLAIR (orageTick, L32253) : le ciel s'allume — `flash` ouvre l'exposition — et le brouillard RECULE (`ouvre` : la route, le
-- portail se montrent). Posé à chaque image par Client/Orage tant que l'éclair vit ; 0, 0 rend l'ambiance de l'heure.
function Ambiance.eclair(flash: number, ouvre: number)
	local H = HEURES[courante]
	if not H then return end
	Lighting.ExposureCompensation = H.expo + 1.1 * flash
	local atm = Lighting:FindFirstChild("Altitude")
	if atm then (atm :: any).Density = H.densite * (1 - 0.5 * ouvre) end
end

-- l'ambiance du NIVEAU : aux NUAGES une heure au hasard (jamais deux fois la même de suite), la pluie néon en VILLE, le noir en ORBITE
function Ambiance.auHasard(): string
	if VARIANTE == "orage" then return "tempete" end
	if VARIANTE == "nuit" then return "minuit" end
	if NIVEAU == "ville" then return "pluie" end
	if NIVEAU == "espace" then return "espace" end
	local n
	repeat n = ORDRE[math.random(1, #ORDRE)] until n ~= courante
	return n
end

function Ambiance.init()
	task.spawn(function()
		Lighting:WaitForChild("Altitude", 20)
		Lighting:WaitForChild("Etalonnage", 20)
		Ambiance.poser("titre", 0.01)
	end)
	Bus.on("niveau", function(id: string, var: string?) NIVEAU, VARIANTE = id, var end)
	-- une partie qui commence, un portail franchi : l'heure change ; le menu revient au matin (l'ambiance du titre)
	Bus.on("partie", function()
		if workspace:GetAttribute("DbgHeure") then return end
		Ambiance.poser(Ambiance.auHasard(), 0.6)
	end)
	Bus.on("portail", function()
		if workspace:GetAttribute("DbgHeure") then return end
		Ambiance.poser(Ambiance.auHasard(), 1.2)
	end)
	Bus.on("menu", function()
		if workspace:GetAttribute("DbgHeure") then return end
		Ambiance.poser("titre", 0.6)
	end)
	-- (mise au point) workspace:SetAttribute("DbgHeure", "aprem") : impose une heure ; nil rend la main au hasard
	workspace:GetAttributeChangedSignal("DbgHeure"):Connect(function()
		local v = workspace:GetAttribute("DbgHeure")
		if type(v) == "string" then Ambiance.poser(v, 0.4) end
	end)
end

return Ambiance
