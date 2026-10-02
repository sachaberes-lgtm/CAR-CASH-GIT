-- CASH CAR — L'ORAGE (le 4e niveau du cycle : les NUAGES sous l'orage — eclFrappe, eclEcrit, orageTick, L32209 du jeu web).
-- « LA ROUTE SE CACHE : L'ÉCLAIR LA MONTRE » : la brume de la tempête ferme la vue à ~600 m ; toutes les 3,4 à 7,4 s un éclair
-- tombe à côté de la route, 380 à 900 m DEVANT la caisse. Il claque (0,2 s), vacille, s'éteint ; le ciel s'allume et le brouillard
-- RECULE le temps de sa lueur (Ambiance.eclair) : on lit la route, le virage, le portail. Le tonnerre arrive après, plus fort et
-- plus tôt quand c'est près. Le DERNIER éclair d'une zone tombe à côté du portail : il montre la sortie.
-- L'éclair lui-même : un tronc brisé de 16 segments, du ciel (640 m) jusque sous la route, et deux branches — des pièces de néon
-- tenues en réserve (jamais créées en course).
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Piste = require(script.Parent.Parent:WaitForChild("Piste"))
local Sons = require(script.Parent:WaitForChild("Sons"))
local Ambiance = require(script.Parent:WaitForChild("Ambiance"))
local M = Config.M
local RH = Config.ROAD_HALF

local Orage = {}

local N = 27 -- 16 segments de tronc, 6 + 5 de branches
local E: any = { pieces = nil, dossier = nil, seg = {}, P = {}, t = 4, k = 0, vie = 0, tonT = -1, ton = 0, dernier = false, pisteVue = nil, allume = false }
local COULEUR = Color3.fromRGB(236, 222, 255)

local function reserve()
	if E.pieces then return end
	local d = Instance.new("Folder")
	d.Name = "Eclair"
	E.pieces = {}
	for i = 1, N do
		local p = Instance.new("Part")
		p.Name = "Eclair"
		p.Anchored = true
		p.CanCollide, p.CanQuery, p.CanTouch = false, false, false
		p.CastShadow = false
		p.Material = Enum.Material.Neon
		p.Color = COULEUR
		p.Transparency = 1
		p.Size = Vector3.new(1, 1, 1)
		p.Parent = d
		E.pieces[i] = p
	end
	d.Parent = workspace
	E.dossier = d
end

-- l'éclair tombe : son pied (en mètres), puis le tronc et les branches
local function frappe(piste: any, s: number, car: Vector3)
	local L = piste.len / M
	local pied: Vector3
	if s > L - 1700 and not E.dernier then
		E.dernier = true
		local f = Piste.repere(piste, piste.len - 20 * M)
		pied = f.Position / M + f.RightVector * 150 + Vector3.new(0, -110, 0)
	else
		local f = Piste.repere(piste, math.min(L - 10, s + 380 + math.random() * 520) * M)
		local t = f.LookVector
		local l = math.max(1e-3, math.sqrt(t.X * t.X + t.Z * t.Z))
		local d = ((math.random() < 0.5) and -1 or 1) * (RH + 90 + math.random() * 420)
		pied = Vector3.new(f.Position.X / M + t.Z / l * d, f.Position.Y / M - 150, f.Position.Z / M - t.X / l * d)
	end
	local P, H, nT = E.P, 640, 16
	local function h(a: number): number return (math.random() - 0.5) * a end
	table.clear(E.seg)
	P[0] = Vector3.new(pied.X + h(60), pied.Y + H, pied.Z + h(60))
	for k = 1, nT do
		local u = k / nT
		P[k] = Vector3.new(P[0].X + (pied.X - P[0].X) * u + h(46), P[0].Y - H * u, P[0].Z + (pied.Z - P[0].Z) * u + h(46))
		table.insert(E.seg, { k - 1, k, 4.2 })
	end
	local q = nT + 1
	for _, br in { { 5, 6 }, { 10, 5 } } do
		local prev, ang = br[1], math.random() * 6.283
		for k = 1, br[2] do
			P[q] = Vector3.new(P[prev].X + math.cos(ang) * 28 * k / br[2] * 3 + h(22), P[prev].Y - 34, P[prev].Z + math.sin(ang) * 28 * k / br[2] * 3 + h(22))
			table.insert(E.seg, { prev, q, 2 })
			prev = q
			q += 1
		end
	end
	-- les pièces prennent leur place (une fois : l'éclair ne bouge pas, il ne fait que vaciller)
	for i = 1, N do
		local sg = E.seg[i]
		local p = E.pieces[i]
		if sg then
			local a, b = P[sg[1]] * M, P[sg[2]] * M
			p.Size = Vector3.new(sg[3] * M, sg[3] * M, (b - a).Magnitude + sg[3] * M * 0.6)
			p.CFrame = CFrame.lookAt((a + b) / 2, b)
		end
	end
	E.vie, E.k = 0.34, 1
	local dd = (pied - car).Magnitude
	E.tonT = 0.25 + dd / 1400
	E.ton = math.max(0.25, 1 - dd / 1400)
end

local function eteindre()
	if not E.allume then return end
	E.allume = false
	for i = 1, N do E.pieces[i].Transparency = 1 end
end

-- À chaque image. `actif` : on roule ou on vole dans L'ORAGE. Rend la secousse du tonnerre (0 le reste du temps).
function Orage.tick(dt: number, actif: boolean, piste: any, s: number, car: Vector3): number
	if not actif then
		if E.pieces and (E.allume or E.k > 0) then
			eteindre()
			E.k, E.vie, E.tonT = 0, 0, -1
			if Ambiance.nom() == "tempete" then Ambiance.eclair(0, 0) end
		end
		return 0
	end
	reserve()
	if E.pisteVue ~= piste then
		-- une nouvelle zone d'orage : le premier éclair attend un peu, le dernier est à nouveau dû
		E.pisteVue, E.dernier, E.t = piste, false, 3
	end
	E.t -= dt
	if E.t <= 0 then
		frappe(piste, s, car)
		E.t = 3.4 + math.random() * 4
		-- (mise au point) workspace:SetAttribute("DbgEclair", true) : un éclair toutes les 2 s, qui tient 1,2 s — le temps d'une photo
		if workspace:GetAttribute("DbgEclair") then E.t, E.vie = 2, 1.2 end
	end
	if E.vie > 0 then
		E.vie -= dt
		-- il claque, puis vacille
		local fl = (E.vie > 0.2) and 1 or ((math.sin(E.vie * 90) > 0) and 0.85 or 0.25)
		E.allume = true
		for i = 1, #E.seg do E.pieces[i].Transparency = 1 - fl end
		if E.vie <= 0 then eteindre() end
	end
	if E.k > 0 then
		E.k = math.max(0, E.k - dt * 1.9)
		local e = E.k * E.k
		local vacille = (E.vie > 0 and math.sin(E.vie * 70) < -0.6) and 0.55 or 1
		if Ambiance.nom() == "tempete" then Ambiance.eclair(0.8 * e * vacille, e) end
	end
	local secousse = 0
	if E.tonT >= 0 then
		E.tonT -= dt
		if E.tonT < 0 then
			Sons.jouer("tonnerre", 0.42 + math.random() * 0.1, 0.2 + 0.6 * E.ton)
			if E.ton > 0.7 then secousse = 0.25 end
		end
	end
	return secousse
end

return Orage
