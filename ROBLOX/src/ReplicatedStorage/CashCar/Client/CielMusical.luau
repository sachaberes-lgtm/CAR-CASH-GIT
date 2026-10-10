-- CASH CAR — LE CIEL MUSICAL DE LA VILLE (le fond de rythme du dôme, shader skyDome L6355 du jeu web ; Sacha, 24/09 : « deuxième
-- [niveau] au-dessus de la ville AVEC les clignotements dans le ciel »).
--   · LA ROUE : seize quartiers de lumière autour de l'horizon, un sur deux à l'accent rose, l'autre au cyan, plus discret — « le
--     ciel est à DEUX temps » ; elle tourne lentement, et sa lueur monte sur chaque frappe.
--   · LES PILIERS : vingt-six barreaux d'égaliseur posés sur l'horizon (pas seize : ils ne se superposent jamais à la roue), dont
--     la hauteur saute avec la musique.
--   · LE SOUFFLE : tout suit l'énergie de la musique (`Sound.PlaybackLoudness` du morceau qui joue) ; sans musique importée, un
--     battement calme à 120 à la minute tient le rythme.
-- ROBLOX n'a ni dôme ni shader de ciel, et sa brume avale tout ce qui est loin : chaque quartier, chaque pilier est un panneau
-- d'interface posé à 3 km autour de la caméra (un BillboardGui n'est pas pris par la brume, mais il passe DERRIÈRE les tours et la
-- route : c'est bien un ciel). Rien n'existe hors de la ville.
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Perf = require(script.Parent:WaitForChild("Perf"))
local M = Config.M

local CielMusical = {}

local R = 3000 * M          -- le rayon du cercle de panneaux
local NQ, NP = 16, 26
local A, B = Color3.fromRGB(255, 62, 200), Color3.fromRGB(62, 232, 255)
local V: any = nil
local E = { spin = 0, t = 0, pulse = 0, mesure = 0, on = false, acc = 0 }

local function panneau(dossier: Instance, couleur: Color3): (Part, BillboardGui, Frame)
	local p = Instance.new("Part")
	p.Anchored = true
	p.CanCollide, p.CanQuery, p.CanTouch = false, false, false
	p.CastShadow = false
	p.Transparency = 1
	p.Size = Vector3.new(1, 1, 1)
	p.Parent = dossier
	local g = Instance.new("BillboardGui")
	g.LightInfluence = 0
	g.MaxDistance = math.huge
	g.ClipsDescendants = false
	g.Adornee = p
	g.Parent = p
	local f = Instance.new("Frame")
	f.Size = UDim2.fromScale(1, 1)
	f.BackgroundColor3 = couleur
	f.BackgroundTransparency = 1
	f.BorderSizePixel = 0
	f.Parent = g
	-- (la lumière monte de l'horizon et meurt vers le zénith)
	local d = Instance.new("UIGradient")
	d.Rotation = 90
	d.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(0.45, 0.55), NumberSequenceKeypoint.new(0.86, 0), NumberSequenceKeypoint.new(1, 0.4) })
	d.Parent = f
	return p, g, f
end

local function batir()
	if V then return end
	local d = Instance.new("Folder")
	d.Name = "CielMusical"
	local q, pl = {}, {}
	local largeur = 2 * math.pi * R / NQ * 0.5 -- (un quartier occupe la moitié de son seizième : du ciel entre deux)
	for i = 1, NQ do
		local p, g, f = panneau(d, (i % 2 == 0) and A or B)
		g.Size = UDim2.fromScale(largeur, 2400 * M)
		q[i] = { p = p, f = f }
	end
	for j = 1, NP do
		-- (hash du web : phh — la taille au repos de chaque barreau et sa place dans la mesure)
		local h = (math.sin(j * 127.1 + 3.7 * 311.7) * 43758.5453) % 1
		local p, g, f = panneau(d, A:Lerp(B, h))
		pl[j] = { p = p, g = g, f = f, h = h }
	end
	V = { d = d, q = q, pl = pl }
end

-- À chaque image. `force` : 0 hors de la ville, 1 en ville, 0,5 à minuit. `fort` : le volume instantané du morceau (0-1), ou nil.
function CielMusical.tick(dt: number, force: number, cam: Vector3, fort: number?)
	if force <= 0 then
		if E.on then
			E.on = false
			V.d.Parent = nil
		end
		return
	end
	batir()
	if not E.on then
		E.on = true
		V.d.Parent = workspace
	end
	-- (APPAREIL FAIBLE, Config.FAIBLE.cielHz) mesuré au banc : 0,5 à 0,65 ms par image sur PC — 42 panneaux d'interface retaillés et
	-- reteintés à chaque image. Sur l'appareil faible ils battent `cielHz` fois par seconde : à 3 km, on ne voit pas la différence
	if Perf.faible then
		E.acc += dt
		if E.acc < 1 / (Perf.F.cielHz or 60) then return end
		dt, E.acc = E.acc, 0
	end
	E.t += dt
	E.spin += dt * 0.035
	-- la FRAPPE et le SOUFFLE : la musique si elle joue, sinon un battement à 120 à la minute
	local phase = (E.t * 2) % 1
	local frappe = math.max(0, 1 - phase * 3.2) ^ 2
	local pulse = 0.35 + 0.25 * math.sin(E.t * 0.9)
	if fort and fort > 0.01 then
		frappe = math.clamp((fort - E.pulse) * 3.5, 0, 1)
		pulse = math.clamp(fort, 0, 1)
	end
	E.pulse += (pulse - E.pulse) * math.min(1, dt * 4)
	if phase < dt * 2 then E.mesure += 1 end
	local base = Vector3.new(cam.X, cam.Y, cam.Z)
	-- LA ROUE : wg = 0,075 + souffle × 0,10 + frappe × 0,26 ; un quartier sur deux à 42 %
	local wg = (0.075 + E.pulse * 0.10 + frappe * 0.26) * force
	for i, o in V.q do
		local az = (i - 1) / NQ * 2 * math.pi + E.spin
		o.p.CFrame = CFrame.new(base + Vector3.new(math.cos(az) * R, 1000 * M, math.sin(az) * R))
		-- (mesuré au banc : à × 1,6 les quartiers ne se lisaient pas sur la brume violette — un panneau d'interface ne s'ADDITIONNE pas
		-- au ciel comme le fait le shader du web, il le recouvre : il lui faut plus d'opacité pour la même lueur)
		o.f.BackgroundTransparency = 1 - math.min(0.85, wg * ((i % 2 == 0) and 1 or 0.42) * 4.5)
	end
	-- LES PILIERS : hgt = 0,045 + h × 0,07 + (souffle × 0,09 + frappe × 0,13) × (0,35 + 0,65 × fract(h × 7,3 + mesure))
	local larg = 2 * math.pi * R / NP * 0.28
	for j, o in V.pl do
		local az = (j - 0.5) / NP * 2 * math.pi
		local saut = 0.35 + 0.65 * ((o.h * 7.3 + E.mesure * 0.37) % 1)
		local haut = (0.045 + o.h * 0.07 + (E.pulse * 0.09 + frappe * 0.13) * saut) * R
		o.g.Size = UDim2.fromScale(larg, haut)
		o.p.CFrame = CFrame.new(base + Vector3.new(math.cos(az) * R, haut * 0.5 - 60 * M, math.sin(az) * R))
		o.f.BackgroundTransparency = 1 - math.min(0.95, (0.16 + frappe * 0.52) * force * 3)
	end
end

return CielMusical
