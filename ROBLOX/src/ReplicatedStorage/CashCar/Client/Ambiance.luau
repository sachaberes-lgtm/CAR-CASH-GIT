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

local Ambiance = {}
local RGB = Color3.fromRGB
local V3 = Vector3.new

-- brume = du côté du soleil · loin = à l'opposé · eclat / voile / densite = Atmosphere (Glare, Haze, Density)
-- soleil = la teinte de la lumière directe · ext = l'ambiance du plein air · teinte, sat, con = l'étalonnage · expo
-- S, OH, OB = la palette des nuages (0-255) · mer = la teinte de la mer de nuages
local HEURES: { [string]: any } = {
	matin = {
		brume = RGB(246, 238, 222), loin = RGB(96, 156, 240), eclat = 0.2, voile = 0.4, densite = 0.034, -- (mesuré : à voile 0,9 le ciel du matin sortait BLANC ; le web a un zénith azur profond)
		soleil = Color3.new(1, 0.97, 0.93), ext = RGB(235, 230, 245), teinte = RGB(255, 250, 244), sat = 0.30, con = 0.24, expo = -0.06,
		S = V3(282, 272, 254), OH = V3(182, 194, 238), OB = V3(158, 168, 224), mer = Color3.new(1, 1, 1),
	},
	midi = {
		brume = RGB(236, 240, 236), loin = RGB(72, 140, 244), eclat = 0.15, voile = 0.3, densite = 0.032,
		soleil = Color3.new(1, 0.99, 0.96), ext = RGB(232, 234, 250), teinte = RGB(252, 252, 255), sat = 0.28, con = 0.26, expo = -0.02,
		S = V3(288, 284, 274), OH = V3(176, 196, 246), OB = V3(152, 170, 232), mer = Color3.new(1, 1, 1),
	},
	-- LE TITRE (BIOMES.titre du web) : le matin poussé vers l'écran titre de Zelda — azur profond, horizon presque blanc, brume très loin
	titre = {
		brume = RGB(226, 238, 250), loin = RGB(70, 140, 235), eclat = 0.1, voile = 0.25, densite = 0.03,
		soleil = Color3.new(1, 0.96, 0.88), ext = RGB(235, 232, 246), teinte = RGB(255, 252, 248), sat = 0.34, con = 0.22, expo = -0.04,
		S = V3(286, 280, 268), OH = V3(176, 194, 242), OB = V3(152, 168, 228), mer = Color3.new(1, 1, 1),
	},
	aprem = {
		brume = RGB(255, 214, 168), loin = RGB(142, 162, 226), eclat = 1.0, voile = 1.4, densite = 0.048,
		soleil = Color3.new(1, 0.88, 0.72), ext = RGB(236, 222, 232), teinte = RGB(255, 244, 232), sat = 0.34, con = 0.26, expo = -0.08,
		S = V3(292, 246, 198), OH = V3(162, 168, 226), OB = V3(136, 140, 206), mer = Color3.new(1, 0.93, 0.86),
	},
}
local ORDRE = { "matin", "midi", "aprem" }
local courante = ""

function Ambiance.nom(): string return courante end

function Ambiance.poser(nom: string, duree: number?)
	local H = HEURES[nom]
	if not H or nom == courante then return end
	courante = nom
	local atm = Lighting:FindFirstChild("Altitude")
	local cc = Lighting:FindFirstChild("Etalonnage")
	local info = TweenInfo.new(math.max(0.01, duree or 1.2), Enum.EasingStyle.Sine, Enum.EasingDirection.InOut)
	if atm then
		TweenService:Create(atm, info, { Color = H.brume, Decay = H.loin, Glare = H.eclat, Haze = H.voile, Density = H.densite }):Play()
	end
	if cc then
		TweenService:Create(cc, info, { TintColor = H.teinte, Saturation = H.sat, Contrast = H.con }):Play()
	end
	TweenService:Create(Lighting, info, { ColorShift_Top = H.soleil, OutdoorAmbient = H.ext, ExposureCompensation = H.expo }):Play()
	-- les nuages changent de palette à mi-fondu (le web passe par le sombre au portail : on ne voit pas la bascule)
	task.delay((duree or 1.2) * 0.5, function()
		if courante ~= nom then return end
		Nuages.palette(H.S, H.OH, H.OB)
		pcall(Mer.teinte, H.mer)
	end)
end

-- une heure au hasard, jamais deux fois la même de suite
function Ambiance.auHasard(): string
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
