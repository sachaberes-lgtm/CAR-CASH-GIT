-- CASH CAR — LE CIEL DU NIVEAU 1 : « le jour d'altitude ». Azur profond au zénith, horizon crème,
-- une mer de nuages sous la route (bâtie par chaque joueur, voir Decor), un soleil d'après-midi qui
-- couche les ombres. Posé par le SERVEUR : Lighting se réplique tout seul chez chaque joueur.
local Config = require(script.Parent:WaitForChild("Config"))
local Ciel = {}

local function obtenir(parent: Instance, classe: string, nom: string): any
	local x = parent:FindFirstChild(nom)
	if x and x.ClassName == classe then return x end
	if x then x:Destroy() end
	local n = Instance.new(classe)
	n.Name = nom
	n.Parent = parent
	return n
end

function Ciel.poser(Lighting: Lighting, ws: Workspace)
	local C = Config.CIEL
	Lighting.ClockTime = C.heure
	Lighting.GeographicLatitude = 23
	Lighting.Brightness = 2.0 -- (a 2,6 les laques et la mer de nuages partaient au blanc : le jeu web est sature et contraste)
	Lighting.Ambient = C.ambiance
	Lighting.OutdoorAmbient = C.ambianceExt
	-- (le ciel de Roblox, pris comme lumière d'ambiance, teintait TOUTES les ombres en cyan et se reflétait dans le bitume —
	-- une route bleu clair, des nuages de glace : l'ambiance vient de OutdoorAmbient, lavande, et le reflet du ciel est en sourdine)
	Lighting.EnvironmentDiffuseScale = 0.3
	Lighting.EnvironmentSpecularScale = 0.6
	Lighting.ShadowSoftness = 0.25
	Lighting.GlobalShadows = true
	Lighting.ExposureCompensation = C.expo
	Lighting.ColorShift_Top = C.soleil
	Lighting.ColorShift_Bottom = Color3.fromRGB(150, 135, 205)

	local ciel = obtenir(Lighting, "Sky", "CielCashCar")
	ciel.SunAngularSize = 16
	ciel.MoonAngularSize = 7
	ciel.StarCount = 0
	ciel.CelestialBodiesShown = true

	local atm = obtenir(Lighting, "Atmosphere", "Altitude")
	atm.Density = C.brumeDensite
	atm.Offset = 0.2
	-- (mesuré au banc : une brume CRÈME posée sur le bleu du ciel donnait un ciel VERT-TURQUOISE ; en blanc bleuté, l'azur reste franc)
	-- (et un horizon CLAIR, presque blanc, comme jHor du jeu web : un Decay bleu profond faisait une bande bleu sombre entre le ciel et la mer)
	atm.Color = Color3.fromRGB(236, 240, 250)
	atm.Decay = Color3.fromRGB(150, 195, 250)
	atm.Glare = 0.25
	atm.Haze = C.brumeVoile

	local bloom = obtenir(Lighting, "BloomEffect", "Bloom")
	bloom.Intensity = 0.3 -- (à 0,55 / 0,94 tout ce qui était clair bavait : les nuages, la mer, le sillage — une image surexposée)
	bloom.Size = 24
	bloom.Threshold = 1.5

	local cc = obtenir(Lighting, "ColorCorrectionEffect", "Etalonnage")
	cc.Saturation = C.saturation
	cc.Contrast = C.contraste
	cc.Brightness = 0
	cc.TintColor = Color3.fromRGB(255, 247, 240)

	-- le LOINTAIN adouci (le web floute le fond à la vitesse) : les facettes des nuages lointains fondent, la route et la caisse restent nettes
	local flou = obtenir(Lighting, "DepthOfFieldEffect", "Lointain")
	flou.FocusDistance = 40
	flou.InFocusRadius = 900
	flou.NearIntensity = 0
	flou.FarIntensity = 0.12

	local rays = obtenir(Lighting, "SunRaysEffect", "Rayons")
	rays.Intensity = 0.05
	rays.Spread = 0.55

	-- les nuages dynamiques de Roblox, au-dessus : de la matière dans le ciel, zéro pièce
	local terrain = ws:FindFirstChildOfClass("Terrain")
	if terrain then
		local nu = obtenir(terrain, "Clouds", "Nuages")
		nu.Cover = 0.5
		nu.Enabled = false -- (les cirrus réalistes de Roblox juraient avec les cumulus du jeu : le ciel du jeu web est un azur NU, peuplé par ses seuls nuages)
		nu.Density = 0.42
		nu.Color = Color3.fromRGB(255, 252, 246)
	end
end

return Ciel
