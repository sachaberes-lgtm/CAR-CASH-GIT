-- CASH CAR — L'ORAGE (le 4e niveau du cycle : les NUAGES sous l'orage — eclFrappe, eclEcrit, orageTick, L32209 du jeu web).
-- « LA ROUTE SE CACHE : L'ÉCLAIR LA MONTRE » : la brume de la tempête ferme la vue à ~600 m ; toutes les 3,4 à 7,4 s un éclair
-- tombe à côté de la route, 380 à 900 m DEVANT la caisse. Il claque (0,2 s), vacille, s'éteint ; le ciel s'allume et le brouillard
-- RECULE le temps de sa lueur (Ambiance.eclair) : on lit la route, le virage, le portail. Le tonnerre arrive après, plus fort et
-- plus tôt quand c'est près. Le DERNIER éclair d'une zone tombe à côté du portail : il montre la sortie.
-- L'éclair lui-même : un tronc brisé de 16 segments, du ciel (640 m) jusque sous la route, et deux branches.
-- ⚠ DESSINÉ À L'ÉCRAN, PAS DANS LE MONDE (mesuré au banc, 2/10) : en pièces de néon posées à 400-900 m, la brume de Roblox
-- l'avalait tout entier — on voyait le ciel s'allumer, jamais l'éclair (le web le dessine hors brume : `fog:false`). Ses points
-- restent dans le monde ; chaque image, ils sont projetés et reliés par des traits d'interface, sous le HUD.
local Players = game:GetService("Players")
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Piste = require(script.Parent.Parent:WaitForChild("Piste"))
local Sons = require(script.Parent:WaitForChild("Sons"))
local Ambiance = require(script.Parent:WaitForChild("Ambiance"))
local M = Config.M
local RH = Config.ROAD_HALF

local Orage = {}

local N = 27 -- 16 segments de tronc, 6 + 5 de branches
local E: any = { traits = nil, gui = nil, seg = {}, P = {}, t = 4, k = 0, vie = 0, tonT = -1, ton = 0, dernier = false, pisteVue = nil, allume = false }
local COULEUR = Color3.fromRGB(240, 228, 255)
local HALO = Color3.fromRGB(176, 150, 255)

local function reserve()
	if E.traits then return end
	local gui = Instance.new("ScreenGui")
	gui.Name = "CashCarEclair"
	gui.IgnoreGuiInset = true
	gui.ResetOnSpawn = false
	gui.DisplayOrder = -20 -- (sous le HUD et sous les effets d'écran)
	gui.Enabled = false
	E.traits = {}
	for i = 1, N do
		local halo = Instance.new("Frame")
		halo.AnchorPoint = Vector2.new(0.5, 0.5)
		halo.BackgroundColor3 = HALO
		halo.BackgroundTransparency = 1
		halo.BorderSizePixel = 0
		halo.Parent = gui
		local coeur = Instance.new("Frame")
		coeur.AnchorPoint = Vector2.new(0.5, 0.5)
		coeur.Position = UDim2.fromScale(0.5, 0.5)
		coeur.Size = UDim2.new(1, 0, 0.3, 0)
		coeur.BackgroundColor3 = COULEUR
		coeur.BackgroundTransparency = 1
		coeur.BorderSizePixel = 0
		coeur.Parent = halo
		E.traits[i] = { halo, coeur }
	end
	gui.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")
	E.gui = gui
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
		table.insert(E.seg, { k - 1, k, 9 })
	end
	local q = nT + 1
	for _, br in { { 5, 6 }, { 10, 5 } } do
		local prev, ang = br[1], math.random() * 6.283
		for k = 1, br[2] do
			P[q] = Vector3.new(P[prev].X + math.cos(ang) * 28 * k / br[2] * 3 + h(22), P[prev].Y - 34, P[prev].Z + math.sin(ang) * 28 * k / br[2] * 3 + h(22))
			table.insert(E.seg, { prev, q, 4.2 })
			prev = q
			q += 1
		end
	end
	E.vie, E.k = 0.34, 1
	E.sol = pied.Y + 140 -- (la hauteur de la route, à 10 m près : voir dessiner)
	local dd = (pied - car).Magnitude
	E.tonT = 0.25 + dd / 1400
	E.ton = math.max(0.25, 1 - dd / 1400)
	Sons.jouer("eclair", 1, 0.15 + 0.45 * E.ton) -- (le claquement ; le tonnerre arrive après)
end

local function eteindre()
	if not E.allume then return end
	E.allume = false
	E.gui.Enabled = false
end

-- les traits de l'image : chaque segment projeté sur l'écran (derrière l'œil : rangé), sa largeur en pixels d'après sa distance
local function dessiner(fl: number)
	local cam = workspace.CurrentCamera
	if not cam then return end
	local focale = cam.ViewportSize.Y * 0.5 / math.tan(math.rad(cam.FieldOfView) * 0.5)
	for i = 1, N do
		local sg, tr = E.seg[i], E.traits[i]
		local halo, coeur = tr[1], tr[2]
		local vu = false
		-- (un trait d'interface passe DEVANT tout : la part de l'éclair qui plonge sous la route — cachée par la dalle dans le jeu web —
		-- n'est pas dessinée, sinon elle barrait le bitume et la caisse)
		if sg and E.P[sg[2]].Y > E.sol then
			local a = cam:WorldToViewportPoint(E.P[sg[1]] * M)
			local b = cam:WorldToViewportPoint(E.P[sg[2]] * M)
			if a.Z > 1 and b.Z > 1 then
				local dx, dy = b.X - a.X, b.Y - a.Y
				local l = math.sqrt(dx * dx + dy * dy)
				-- (w = la demi-largeur du ruban du web, en mètres ; jamais moins de 5 pixels de halo)
				local w = math.max(5, sg[3] * 2 * M / math.max(1, (a.Z + b.Z) * 0.5) * focale)
				halo.Position = UDim2.fromOffset((a.X + b.X) * 0.5, (a.Y + b.Y) * 0.5)
				halo.Size = UDim2.fromOffset(l + w * 0.5, w)
				halo.Rotation = math.deg(math.atan2(dy, dx))
				halo.BackgroundTransparency = 1 - 0.34 * fl
				coeur.BackgroundTransparency = 1 - fl
				vu = true
			end
		end
		if not vu then
			halo.BackgroundTransparency = 1
			coeur.BackgroundTransparency = 1
		end
	end
end

-- À chaque image. `actif` : on roule ou on vole dans L'ORAGE. Rend la secousse du tonnerre (0 le reste du temps).
function Orage.tick(dt: number, actif: boolean, piste: any, s: number, car: Vector3): number
	if not actif then
		if E.traits and (E.allume or E.k > 0) then
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
		if E.vie <= 0 then
			eteindre()
		else
			-- il claque, puis vacille
			local fl = (E.vie > 0.2) and 1 or ((math.sin(E.vie * 90) > 0) and 0.85 or 0.25)
			if not E.allume then
				E.allume = true
				E.gui.Enabled = true
			end
			dessiner(fl)
		end
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
			-- (le vrai tonnerre à sa hauteur ; le son de secours — une explosion — joué très grave : un roulement)
			Sons.jouer("tonnerre", Sons.a("tonnerre") and 1 or (0.42 + math.random() * 0.1), 0.2 + 0.6 * E.ton)
			if E.ton > 0.7 then secousse = 0.25 end
		end
	end
	return secousse
end

return Orage
