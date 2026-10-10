-- CASH CAR — LE SERPENT (updateSerpent du jeu web : la figure SNAKE LOOP)
-- Passer SOUS la route et se reposer sur sa face de départ : un serpent néon (cyan à la tête, magenta à la queue) fouette autour
-- de la caisse pendant 2,6 s. Sa tête tourne sur un cercle de 5,4 m qui ondule en hauteur ; le corps suit comme une corde
-- (54 tronçons de 34 cm), épais derrière la tête, effilé vers la queue. En dark triad il est NOIR, lueur rouge sang.
-- ROBLOX : pas de tube qu'on déforme à chaque image — le corps est une chaîne de rubans (Beam) tournés vers la caméra.
local RunService = game:GetService("RunService")
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Bus = require(script.Parent:WaitForChild("Bus"))
local Perf = require(script.Parent:WaitForChild("Perf"))
local Effets = require(script.Parent:WaitForChild("Effets"))
local Score = require(script.Parent:WaitForChild("Score"))
local M = Config.M
local V3 = Vector3.new

local Serpent = {}

local NSEG, SEGL, R = 54, 0.34, 5.4
-- le rayon le long du corps (s : 0 le museau → 1 la queue) : la tête renflée, le cou, le corps, la queue en pointe
local RP = { { 0, 0.02 }, { 0.018, 0.30 }, { 0.05, 0.44 }, { 0.10, 0.30 }, { 0.34, 0.30 }, { 0.62, 0.20 }, { 0.82, 0.11 }, { 0.94, 0.06 }, { 1, 0.02 } }
local function rayon(s: number): number
	for i = 1, #RP - 1 do
		if s <= RP[i + 1][1] then
			local a, b = RP[i], RP[i + 1]
			local t = (s - a[1]) / (b[1] - a[1])
			t = 0.5 - 0.5 * math.cos(t * math.pi)
			return a[2] + (b[2] - a[2]) * t
		end
	end
	return 0.02
end

local S: any = { bati = false, montre = 0, pic = 0, a = 0, noir = nil, noeuds = table.create(NSEG + 1, Vector3.zero), att = {}, corps = {}, ventre = {} }
local hote: Part

local function batir()
	S.bati = true
	hote = Instance.new("Part")
	hote.Name = "Serpent"
	hote.Anchored = true
	hote.CanCollide, hote.CanQuery, hote.CanTouch = false, false, false
	hote.Transparency = 1
	hote.Size = V3(1, 1, 1)
	hote.Parent = workspace
	for i = 0, NSEG do
		local a = Instance.new("Attachment")
		a.Parent = hote
		S.att[i] = a
		local ang = -i * SEGL / R
		S.noeuds[i + 1] = V3(math.cos(ang) * R, 1.4, math.sin(ang) * R)
	end
	local function ruban(i: number, z: number): Beam
		local b = Instance.new("Beam")
		b.Attachment0, b.Attachment1 = S.att[i - 1], S.att[i]
		b.FaceCamera = true
		b.Segments = 1
		b.LightInfluence = 0
		b.ZOffset = z
		b.Enabled = false
		b.Parent = hote
		return b
	end
	for i = 1, NSEG do
		S.corps[i] = ruban(i, 0)    -- le corps néon
		S.ventre[i] = ruban(i, 0.1) -- l'arête claire, par-dessus : le tube prend du volume
	end
end

local function peindre(noir: boolean)
	S.noir = noir
	for i = 1, NSEG do
		local s0, s1 = (i - 1) / NSEG, i / NSEG
		local c: Beam, v: Beam = S.corps[i], S.ventre[i]
		if noir then
			c.Color = ColorSequence.new(Color3.fromRGB(12, 12, 17))
			c.LightEmission = 0
			v.Color = ColorSequence.new(Color3.fromRGB(154, 12, 24))
			v.LightEmission = 0.6
		else
			c.Color = ColorSequence.new(Color3.fromHSV(0.50 + s0 * 0.34, 0.9, 1), Color3.fromHSV(0.50 + s1 * 0.34, 0.9, 1))
			c.LightEmission = 0.45
			v.Color = ColorSequence.new(Color3.fromHSV(0.50 + s0 * 0.34, 0.35, 1), Color3.fromHSV(0.50 + s1 * 0.34, 0.35, 1))
			v.LightEmission = 0.8
		end
	end
end

local function cacher()
	if not S.bati or not S.visible then return end
	S.visible = false
	for i = 1, NSEG do
		S.corps[i].Enabled = false
		S.ventre[i].Enabled = false
	end
end

local function tick(dt: number)
	local e = Bus.etat()
	if not e.carCF or e.pause then return end
	if workspace:GetAttribute("DbgSerpent") and S.montre <= 0 then S.montre = 2.6 end -- (mise au point) le serpent tourne en boucle
	if e.mode ~= "drive" and e.mode ~= "fall" then S.montre = 0 end
	if S.montre <= 0 then
		cacher()
		S.pic = 0
		return
	end
	if not S.bati then batir() end
	if S.montre > S.pic then S.pic = S.montre end
	S.montre -= dt
	local noir = Score.frenesie()
	if noir ~= S.noir then peindre(noir) end
	local cf: CFrame = e.carCF
	hote.CFrame = CFrame.new(cf.Position)
	-- le fondu d'entrée et de sortie : il gonfle depuis la caisse, puis s'y résorbe
	local env = math.max(0, math.min(1, (S.pic - S.montre) * 3, S.montre * 2))
	local ech = 0.12 + env * 0.98
	S.a += dt * 2.7 -- il fouette autour de la caisse
	local a = S.a
	local N: { Vector3 } = S.noeuds
	N[1] = V3(math.cos(a) * R, 1.5 + math.sin(a * 2) * 1.0, math.sin(a) * R)
	-- le corps suit comme une corde : chaque nœud reste à 34 cm du précédent
	for i = 2, NSEG + 1 do
		local d = N[i] - N[i - 1]
		local l = d.Magnitude
		if l < 1e-4 then l = 1e-4 end
		N[i] = N[i - 1] + d * (SEGL / l)
	end
	-- dans le repère de la CAISSE (x latéral, y haut, z avant)
	local X, Y, Z = cf.RightVector, cf.UpVector, cf.LookVector
	local c = cf.Position
	for i = 0, NSEG do
		local p = N[i + 1] * (ech * M)
		S.att[i].WorldPosition = c + X * p.X + Y * p.Y + Z * p.Z
	end
	local l0 = rayon(0) * 2 * ech * M
	for i = 1, NSEG do
		local l1 = rayon(i / NSEG) * 2 * ech * M
		local b: Beam = S.corps[i]
		b.Width0, b.Width1 = l0, l1
		b.Enabled = true
		local v: Beam = S.ventre[i]
		v.Width0, v.Width1 = l0 * 0.36, l1 * 0.36
		v.Enabled = true
		l0 = l1
	end
	S.visible = true
	-- des étincelles d'or le long du corps
	if math.random() < dt * 30 then
		local p = N[math.random(1, NSEG + 1)] * (ech * M)
		Effets.etincelles("or", c + X * p.X + Y * p.Y + Z * p.Z, 1, 3)
	end
end

function Serpent.init()
	local tickC = Perf.chrono("Serpent", tick) -- (banc : son temps par image, voir Perf)
	RunService.RenderStepped:Connect(function(dt: number)
		local ok, err = pcall(tickC, math.min(dt, 0.05))
		if not ok then
			if not S.erreur then warn("[CashCar] serpent : " .. tostring(err)) end
			S.erreur = true
			pcall(cacher)
		end
	end)
	-- SNAKE LOOP : la pose qui suit un passage SOUS la route
	Bus.on("pose", function(p: any)
		if p and p.serpent then S.montre = 2.6 end
	end)
	Bus.on("mort", function() S.montre = 0 end)
	Bus.on("partie", function() S.montre = 0 end)
end

return Serpent
