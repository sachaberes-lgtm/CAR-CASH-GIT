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
	Lighting.Brightness = 2.05 -- (a 2,6 les laques et la mer de nuages partaient au blanc : le jeu web est sature et contraste)
	Lighting.Ambient = C.ambiance
	Lighting.OutdoorAmbient = C.ambianceExt
	Lighting.EnvironmentDiffuseScale = 1
	Lighting.EnvironmentSpecularScale = 1
	Lighting.ShadowSoftness = 0.25
	Lighting.GlobalShadows = true
	Lighting.ExposureCompensation = C.expo
	Lighting.ColorShift_Top = C.soleil
	Lighting.ColorShift_Bottom = Color3.fromRGB(120, 130, 190)

	local ciel = obtenir(Lighting, "Sky", "CielCashCar")
	ciel.SunAngularSize = 16
	ciel.MoonAngularSize = 7
	ciel.StarCount = 0
	ciel.CelestialBodiesShown = true

	local atm = obtenir(Lighting, "Atmosphere", "Altitude")
	atm.Density = C.brumeDensite
	atm.Offset = 0.2
	atm.Color = C.horizon
	atm.Decay = Color3.fromRGB(110, 165, 225) -- (le bleu profond du zénith teintait toute la brume en turquoise)
	atm.Glare = 0.3
	atm.Haze = C.brumeVoile

	local bloom = obtenir(Lighting, "BloomEffect", "Bloom")
	bloom.Intensity = 0.55
	bloom.Size = 28
	bloom.Threshold = 0.94

	local cc = obtenir(Lighting, "ColorCorrectionEffect", "Etalonnage")
	cc.Saturation = C.saturation
	cc.Contrast = C.contraste
	cc.Brightness = 0.01
	cc.TintColor = Color3.fromRGB(255, 250, 244)

	local rays = obtenir(Lighting, "SunRaysEffect", "Rayons")
	rays.Intensity = 0.05
	rays.Spread = 0.55

	-- les nuages dynamiques de Roblox, au-dessus : de la matière dans le ciel, zéro pièce
	local terrain = ws:FindFirstChildOfClass("Terrain")
	if terrain then
		local nu = obtenir(terrain, "Clouds", "Nuages")
		nu.Cover = 0.5
		nu.Density = 0.42
		nu.Color = Color3.fromRGB(255, 252, 246)
	end
end

return Ciel
