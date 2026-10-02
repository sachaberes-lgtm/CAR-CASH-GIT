-- CASH CAR — LES PIGEONS RAMIERS (PIGEONS, mkPigeon, spawnPigeonFlock, updatePigeons — L8605 du jeu web) : de rares traversées
-- d'oiseaux, un peu de vie dans le ciel. Une volée de 2 à 5 ramiers passe en travers, loin devant la caisse, bat des ailes… puis plane.
-- RARE, exprès : la première après 12-26 s, les suivantes toutes les 24-56 s, jamais deux volées à la fois.
-- PAS DE PIGEON EN ORBITE NI DANS L'ORAGE (revue PISTE du 30/09) : une volée de ramiers devant la Terre vue du vide, ou en plein déluge
-- sous les éclairs, ça n'a rien à faire là — et la volée d'avant le portail s'efface.
-- ROBLOX : chaque oiseau = 9 petites pièces ancrées, posées d'un seul `BulkMoveTo` par image (45 pièces au plus). Bâties à la première
-- volée, rangées (hors du monde) entre deux passages : rien n'est créé ni détruit en course.
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local M = Config.M

local Pigeons = {}

local K = 1.7 * M -- (g.scale.setScalar(1.7))
local GRIS = Color3.fromRGB(151, 162, 182)   -- 0x97a2b6 : le corps
local ROSE = Color3.fromRGB(201, 169, 180)   -- 0xc9a9b4 : le poitrail rosé
local AILE = Color3.fromRGB(118, 131, 155)   -- 0x76839b
local BLANC = Color3.fromRGB(244, 246, 250)  -- 0xf4f6fa : la tache du cou, la barre alaire — la signature du ramier

local dossier: Folder? = nil
local OISEAUX: { any } = {} -- la réserve (5 oiseaux)
local VOL: { any } = {}     -- ceux qui volent
local attente = 12 + math.random() * 14
local horloge = 0
local PARTS: { BasePart } = {}
local CFS: { CFrame } = {}
local LOIN = CFrame.new(0, -4000, 0)

local function piece(forme: Enum.PartType, taille: Vector3, couleur: Color3, neon: boolean?): BasePart
	local p = Instance.new("Part")
	p.Shape = forme
	p.Size = taille * K
	p.Color = couleur
	p.Material = neon and Enum.Material.Neon or Enum.Material.SmoothPlastic
	p.Anchored = true
	p.CanCollide, p.CanQuery, p.CanTouch = false, false, false
	p.CastShadow = false
	p.CFrame = LOIN
	p.Parent = dossier
	return p
end

-- (repère de l'oiseau : le nez vers -Z, comme tout ce qui regarde quelque part dans Roblox — le web le pose vers +z)
local function oiseau(): any
	local B, S = Enum.PartType.Ball, Enum.PartType.Block
	local o = {
		-- { la pièce, sa place dans le repère de l'oiseau }
		{ piece(S, Vector3.new(0.5, 0.44, 1.12), GRIS), CFrame.new(0, 0, 0) },            -- le corps (une boule étirée .52 × .46 × 1.15)
		{ piece(B, Vector3.new(0.48, 0.48, 0.48), ROSE), CFrame.new(0, -0.06, -0.3) },    -- le poitrail
		{ piece(B, Vector3.new(0.32, 0.32, 0.32), GRIS), CFrame.new(0, 0.18, -0.56) },    -- la tête
		{ piece(B, Vector3.new(0.12, 0.12, 0.12), BLANC), CFrame.new(-0.12, 0.14, -0.44) }, -- la tache blanche du cou
		{ piece(B, Vector3.new(0.12, 0.12, 0.12), BLANC), CFrame.new(0.12, 0.14, -0.44) },
		{ piece(S, Vector3.new(0.26, 0.04, 0.5), AILE), CFrame.new(0, 0.02, 0.66) },      -- la queue
	}
	local corps = o[1][1]
	local mesh = Instance.new("SpecialMesh") -- (le corps : une vraie boule étirée, pas un pavé)
	mesh.MeshType = Enum.MeshType.Sphere
	mesh.Parent = corps
	local ailes = {}
	for k, sd in { -1, 1 } do
		ailes[k] = {
			sd = sd,
			aile = piece(S, Vector3.new(1.0, 0.02, 0.42), AILE),
			barre = piece(S, Vector3.new(0.9, 0.025, 0.11), BLANC),
		}
	end
	return { fixes = o, ailes = ailes, cf = LOIN, v = Vector3.zero, ph = 0, ph2 = 0, vie = 0 }
end

local function batir()
	if dossier then return end
	local d = Instance.new("Folder")
	d.Name = "CashCarPigeons"
	d.Parent = workspace
	dossier = d
	for i = 1, 5 do OISEAUX[i] = oiseau() end
end

local function ranger(o: any)
	for _, f in o.fixes do f[1].CFrame = LOIN end
	for _, a in o.ailes do a.aile.CFrame = LOIN; a.barre.CFrame = LOIN end
end

-- une volée : loin devant, d'un côté, plus haut que la route — elle traverse vers l'autre côté
local proche = false -- (banc) la prochaine volée passe tout près : on la voit sur une photo
local function volee(car: CFrame)
	batir()
	local n = 2 + math.random(0, 3)
	local fwd, droite = car.LookVector, car.RightVector
	fwd = Vector3.new(fwd.X, 0, fwd.Z)
	fwd = (fwd.Magnitude > 0.01) and fwd.Unit or Vector3.zAxis
	droite = Vector3.new(droite.X, 0, droite.Z)
	droite = (droite.Magnitude > 0.01) and droite.Unit or Vector3.xAxis
	local sd = (math.random() < 0.5) and -1 or 1
	local base = car.Position / M + fwd * (150 + math.random() * 160) + droite * (sd * (60 + math.random() * 90)) + Vector3.yAxis * (22 + math.random() * 46)
	local dir = (droite * (-sd * (0.7 + math.random() * 0.5)) + Vector3.yAxis * ((math.random() - 0.35) * 0.12) + fwd * ((math.random() - 0.5) * 0.7)).Unit
	local colle = proche -- (banc) la volée reste accrochée devant la caisse : une photo prend 1,5 s, la caisse fait 100 m entre-temps
	proche = false
	if colle then base = car.Position / M + fwd * 30 + droite * (sd * 5) + Vector3.yAxis * 6 end
	local vit = 9 + math.random() * 5
	for k = 0, n - 1 do
		local o = OISEAUX[k + 1]
		local p = base - dir * (k * 3.4) + Vector3.new((math.random() - 0.5) * 5, (math.random() - 0.5) * 3 + k * 0.7, (math.random() - 0.5) * 5)
		o.cf = CFrame.lookAt(p * M, (p + dir) * M)
		o.v = dir * (vit * (0.9 + math.random() * 0.2))
		o.ph, o.ph2, o.vie = math.random() * 6, math.random() * 6, 26
		o.colle = colle and car:ToObjectSpace(o.cf) or nil
		table.insert(VOL, o)
	end
end

-- À chaque image. `interdit` : l'orbite, l'orage (pas d'apparition, et la volée en cours s'efface). `mort` : pas de volée sur une épave.
function Pigeons.tick(dt: number, car: CFrame, interdit: boolean, mort: boolean)
	horloge += dt
	attente -= dt
	if attente <= 0 and #VOL == 0 and not mort then
		if not interdit then volee(car) end
		attente = 24 + math.random() * 32
	end
	if #VOL == 0 then return end
	local t = horloge
	table.clear(PARTS)
	table.clear(CFS)
	for i = #VOL, 1, -1 do
		local o = VOL[i]
		o.vie -= dt
		if interdit then o.vie = 0 end
		if o.vie <= 0 then
			ranger(o)
			table.remove(VOL, i)
			continue
		end
		o.cf += (o.v * dt + Vector3.yAxis * (math.sin(t * 1.2 + o.ph) * 0.5 * dt)) * M
		if o.colle then o.cf = car * o.colle end
		for _, f in o.fixes do
			table.insert(PARTS, f[1])
			table.insert(CFS, o.cf * CFrame.new(f[2].Position * K))
		end
		-- les ailes : des battements… puis un vol plané
		local amp = 0.25 + 0.6 * math.max(0, math.sin(t * 0.8 + o.ph2))
		local w = math.sin(t * 10 + o.ph) * amp
		for _, a in o.ailes do
			local racine = o.cf * CFrame.new(a.sd * 0.16 * K, 0.1 * K, -0.06 * K) * CFrame.Angles(0, 0, a.sd * w)
			table.insert(PARTS, a.aile)
			table.insert(CFS, racine * CFrame.new(a.sd * 0.5 * K, 0, 0))
			table.insert(PARTS, a.barre)
			table.insert(CFS, racine * CFrame.new(a.sd * 0.5 * K, 0.012 * K, -0.02 * K))
		end
	end
	if #PARTS > 0 then workspace:BulkMoveTo(PARTS, CFS, Enum.BulkMoveMode.FireCFrameChanged) end
end

-- (banc) une volée tout de suite, près de la caisse
function Pigeons.maintenant(pres: boolean?)
	attente = 0
	proche = pres == true
end

return Pigeons
