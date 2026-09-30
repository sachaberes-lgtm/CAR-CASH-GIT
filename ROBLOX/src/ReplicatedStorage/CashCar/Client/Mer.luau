-- CASH CAR — LA MER DE NUAGES. Dans le jeu web, c'est un dégradé peint sous l'horizon (merZ) : on ne
-- l'atteint jamais. Ici, un champ de dômes blancs toujours ~380 m SOUS la caisse, qui la suit.
-- Chaque dôme reste FIXE dans le monde tant qu'il est dans la tuile autour de la caméra, et ressort de l'autre
-- côté quand il la quitte (tuile torique) : la parallaxe est juste, le champ n'a pas de bord.
-- La route plonge de 2 à 4 km par zone : une mer posée une fois pour toutes sous le point le plus bas se
-- perdait dans la brume (1er retour de Sacha : « c'est normal que ça ressemble à ça ? »).
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local M = Config.M

local Mer = {}

local TUILE = 7600      -- studs : le côté de la tuile qui se répète (la brume mange le reste)
local SOUS = 380 * M    -- profondeur de la mer sous la caisse
local dossier: Folder
local domes: { { p: BasePart, ox: number, oz: number, dy: number } } = {}
local yMer = nil :: number?

function Mer.creer(graine: number)
	dossier = Instance.new("Folder")
	dossier.Name = "MerDeNuages"
	local rnd = Random.new(graine + 991)
	local C = Config.CIEL
	for _ = 1, 70 do
		local w = rnd:NextNumber(1000, 1700)
		local p = Instance.new("Part")
		p.Anchored = true
		p.CanCollide = false
		p.CanQuery = false
		p.CanTouch = false
		p.CastShadow = false
		p.Material = Enum.Material.SmoothPlastic
		p.Size = Vector3.new(math.min(2040, w), rnd:NextNumber(180, 380), math.min(2040, w * rnd:NextNumber(0.75, 1.2)))
		p.Color = C.mer:Lerp(Color3.new(1, 1, 1), rnd:NextNumber(0.55, 0.9))
		local m = Instance.new("SpecialMesh")
		m.MeshType = Enum.MeshType.Sphere
		m.Parent = p
		p.Parent = dossier
		table.insert(domes, { p = p, ox = rnd:NextNumber(0, TUILE), oz = rnd:NextNumber(0, TUILE), dy = rnd:NextNumber(-90, 50) })
	end
	dossier.Parent = workspace
end

-- à chaque image : camPos = la caméra, yCaisse = l'altitude de la caisse (studs)
function Mer.suivre(camPos: Vector3, yCaisse: number, dt: number)
	if not dossier then return end
	local cible = yCaisse - SOUS
	-- la mer descend avec la caisse, mais en douceur (un saut de portail la recale d'un coup)
	if not yMer or math.abs(cible - yMer) > 600 * M then
		yMer = cible
	else
		yMer = (yMer :: number) + (cible - (yMer :: number)) * math.min(1, dt * 0.8)
	end
	local y = yMer :: number
	local demi = TUILE / 2
	for _, d in domes do
		local x = camPos.X - demi + ((d.ox - camPos.X + demi) % TUILE)
		local z = camPos.Z - demi + ((d.oz - camPos.Z + demi) % TUILE)
		d.p.CFrame = CFrame.new(x, y + d.dy, z)
	end
end

return Mer
