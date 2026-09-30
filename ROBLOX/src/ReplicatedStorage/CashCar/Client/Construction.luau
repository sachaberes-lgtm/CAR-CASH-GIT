-- CASH CAR — LA CONSTRUCTION : de la piste calculée (des nombres) aux pièces qu'on voit.
-- Bâtie CHEZ LE JOUEUR, jamais sur le serveur : rien à envoyer, rien que le « streaming » puisse effacer.
--
-- La dalle est un ruban de TRIANGLES (deux coins par triangle, la vieille recette Roblox) : aucun trou
-- dans les virages, aucune pièce qui chevauche sa voisine (donc aucun scintillement). Les tronçons droits
-- sont fusionnés en longs quadrilatères : peu de pièces là où la route ne tourne pas.
-- Le long de chaque bord, un rail de NÉON cyan qui dépasse un peu dessus et dessous : il se lit des deux faces.
-- (1er retour de Sacha, capture Studio : « c'est normal que ça ressemble à ça ? » — la route lisse et claire se
-- lisait comme une nappe d'eau qui se fondait dans le ciel. Bitume d'asphalte sombre et MAT, pointillés,
-- rails plus larges : c'est un ruban de route, il doit trancher sur le ciel.)
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Piste = require(script.Parent.Parent:WaitForChild("Piste"))
local M = Config.M
local RH = Config.ROAD_HALF
local EP = Config.THICK * M
local R = Config.ROUTE

local Construction = {}

local modeleCoin = Instance.new("WedgePart")
modeleCoin.Anchored = true
modeleCoin.CanCollide = false
modeleCoin.CanQuery = false
modeleCoin.CanTouch = false
modeleCoin.TopSurface = Enum.SurfaceType.Smooth
modeleCoin.BottomSurface = Enum.SurfaceType.Smooth
modeleCoin.Material = Enum.Material.SmoothPlastic
modeleCoin.Color = R.bitume
modeleCoin.Reflectance = 0.06

local function part(taille: Vector3, cf: CFrame, couleur: Color3, matiere: Enum.Material, parent: Instance): Part
	local p = Instance.new("Part")
	p.Anchored = true
	p.CanCollide = false
	p.CanQuery = false
	p.CanTouch = false
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.Size = taille
	p.CFrame = cf
	p.Color = couleur
	p.Material = matiere
	p.Parent = parent
	return p
end

-- un triangle épais (épaisseur centrée sur le plan a-b-c) en deux coins
local function triangle(a: Vector3, b: Vector3, c: Vector3, ep: number, parent: Instance)
	local ab, ac, bc = b - a, c - a, c - b
	local abd, acd, bcd = ab:Dot(ab), ac:Dot(ac), bc:Dot(bc)
	if abd > acd and abd > bcd then
		c, a = a, c
	elseif acd > bcd and acd > abd then
		a, b = b, a
	end
	ab, ac, bc = b - a, c - a, c - b
	local droite = ac:Cross(ab)
	if droite.Magnitude < 1e-6 then return end
	droite = droite.Unit
	local haut = bc:Cross(droite).Unit
	local dos = bc.Unit
	local hauteur = math.abs(ab:Dot(haut))
	local w1 = modeleCoin:Clone()
	w1.Size = Vector3.new(ep, hauteur, math.abs(ab:Dot(dos)))
	w1.CFrame = CFrame.fromMatrix((a + b) / 2, droite, haut, dos)
	w1.Parent = parent
	local w2 = modeleCoin:Clone()
	w2.Size = Vector3.new(ep, hauteur, math.abs(ac:Dot(dos)))
	w2.CFrame = CFrame.fromMatrix((a + c) / 2, -droite, haut, -dos)
	w2.Parent = parent
end

local function rail(a: Vector3, b: Vector3, haut: Vector3, parent: Instance)
	local d = b - a
	local l = d.Magnitude
	if l < 0.01 then return end
	local cf = CFrame.lookAt((a + b) / 2, b, haut)
	local p = part(Vector3.new(0.7 * M, EP + 0.3 * M, l + 0.05), cf, R.neon, Enum.Material.Neon, parent)
	p.CastShadow = false
end

-- Bâtit la route d'une piste dans `dossier`. `ceder` est appelé régulièrement (bâtir en tâche de fond).
function Construction.route(piste: Piste.Piste, dossier: Instance, ceder: (() -> ())?)
	local F = piste.F
	local n = piste.n
	local demi = RH * M
	local i = 1
	local compte = 0
	while i < n do
		-- on allonge le quadrilatère tant que la route ne tourne ni ne plie (≤ 3°) et sur 30 m au plus
		local j = i + 1
		while j < n do
			local a, b = F[i], F[j + 1]
			if a.LookVector:Dot(b.LookVector) < 0.99863 or (j + 1 - i) * piste.DS > 30 * M then break end
			j += 1
		end
		local fa, fb = F[i], F[j]
		local mA = fa.Position - fa.UpVector * (EP / 2)
		local mB = fb.Position - fb.UpVector * (EP / 2)
		local gA, dA = mA - fa.RightVector * demi, mA + fa.RightVector * demi
		local gB, dB = mB - fb.RightVector * demi, mB + fb.RightVector * demi
		triangle(gA, dA, dB, EP, dossier)
		triangle(gA, dB, gB, EP, dossier)
		local rA, rB = demi - 0.35 * M, demi - 0.35 * M
		rail(mA - fa.RightVector * rA, mB - fb.RightVector * rB, (fa.UpVector + fb.UpVector).Unit, dossier)
		rail(mA + fa.RightVector * rA, mB + fb.RightVector * rB, (fa.UpVector + fb.UpVector).Unit, dossier)
		i = j
		compte += 1
		if ceder and compte % 60 == 0 then ceder() end
	end
	-- le marquage du niveau 1 (capture web) : des pointillés BLANCS sur les voies, tous les 12 m — sur un ruban
	-- de 56 m, ce sont eux qui disent la vitesse et l'échelle
	local haut = 0.03 * M
	local s = 6 * M
	local k = 0
	while s < piste.len - 6 * M do
		local f = Piste.repere(piste, s)
		local cfl = CFrame.fromMatrix(f.Position + f.UpVector * haut, f.RightVector, f.UpVector, -f.LookVector)
		for _, x in { -0.34, 0.34 } do
			local v = part(Vector3.new(0.45 * M, 0.06 * M, 6 * M), cfl + f.RightVector * (x * RH * M), R.voie, Enum.Material.SmoothPlastic, dossier)
			v.CastShadow = false
		end
		k += 1
		s += 12 * M
		if ceder and k % 150 == 0 then ceder() end
	end
end

-- le PORTAIL de fin de zone : un anneau d'or debout au-dessus de la route, et un voile qui scintille
function Construction.portail(piste: Piste.Piste, dossier: Instance)
	local f = Piste.repere(piste, piste.len - 20 * M)
	local Rr = 46 * M
	local c = f.Position + f.UpVector * (Rr * 0.62)
	local nb = 28
	for k = 0, nb - 1 do
		local a0 = 2 * math.pi * k / nb
		local a1 = 2 * math.pi * (k + 1) / nb
		local p0 = c + (f.RightVector * math.cos(a0) + f.UpVector * math.sin(a0)) * Rr
		local p1 = c + (f.RightVector * math.cos(a1) + f.UpVector * math.sin(a1)) * Rr
		local seg = part(Vector3.new(3 * M, 3 * M, (p1 - p0).Magnitude + 1),
			CFrame.lookAt((p0 + p1) / 2, p1, f.LookVector), (k % 2 == 0) and Color3.fromRGB(255, 215, 94) or Color3.fromRGB(255, 62, 200),
			Enum.Material.Neon, dossier)
		seg.CastShadow = false
	end
	local voile = part(Vector3.new(Rr * 1.9, Rr * 1.9, 0.5), CFrame.fromMatrix(c, f.RightVector, f.UpVector, -f.LookVector),
		Color3.fromRGB(255, 200, 120), Enum.Material.ForceField, dossier)
	voile.Transparency = 0.2
	local m = Instance.new("SpecialMesh")
	m.MeshType = Enum.MeshType.Sphere
	m.Scale = Vector3.new(1, 1, 0.02)
	m.Parent = voile
end

-- ── les objets ──
local OR = Color3.fromRGB(255, 205, 64)
function Construction.objets(piste: Piste.Piste, dossier: Instance, ceder: (() -> ())?): { any }
	local liste = {}
	for k, o in piste.objets do
		local f = Piste.repereFace(piste, o.s, o.face)
		local pos = f.Position + f.RightVector * o.lat + f.UpVector * o.h
		local p: Part
		if o.kind == "piece" then
			p = part(Vector3.new(0.35 * M, 1.5 * M, 1.5 * M), CFrame.fromMatrix(pos, f.RightVector, f.UpVector), OR, Enum.Material.Neon, dossier)
			p.Shape = Enum.PartType.Cylinder
			p.CastShadow = false
		elseif o.kind == "pad" then
			p = part(Vector3.new(7 * M, 0.12 * M, 9 * M), CFrame.fromMatrix(pos, f.RightVector, f.UpVector, -f.LookVector), R.pad, Enum.Material.Neon, dossier)
			p.CastShadow = false
			-- deux chevrons sombres : on lit le sens de la poussée
			for c = -1, 1, 2 do
				local ch = part(Vector3.new(4.6 * M, 0.14 * M, 0.9 * M),
					CFrame.fromMatrix(pos + f.LookVector * (c * 1.8 * M) + f.UpVector * 0.02 * M, f.RightVector, f.UpVector, -f.LookVector),
					Color3.fromRGB(90, 40, 10), Enum.Material.SmoothPlastic, dossier)
				ch.CastShadow = false
				ch.Parent = p
			end
		else -- cristal de pouvoir : un diamant qui tourne, et son étiquette
			local pw = Config.POUVOIRS[o.pw or "n"]
			p = part(Vector3.new(1.7 * M, 1.7 * M, 1.7 * M), CFrame.fromMatrix(pos, f.RightVector, f.UpVector) * CFrame.Angles(math.pi / 4, 0, math.pi / 4),
				pw.couleur, Enum.Material.Neon, dossier)
			p.CastShadow = false
			local bb = Instance.new("BillboardGui")
			bb.Size = UDim2.fromOffset(160, 40)
			bb.StudsOffsetWorldSpace = f.UpVector * (2.2 * M)
			bb.AlwaysOnTop = false
			bb.MaxDistance = 260 * M
			bb.LightInfluence = 0
			local t = Instance.new("TextLabel")
			t.BackgroundTransparency = 1
			t.Size = UDim2.fromScale(1, 1)
			t.FontFace = Font.new("rbxasset://fonts/families/PressStart2P.json")
			t.TextScaled = true
			t.TextColor3 = pw.couleur
			t.TextStrokeTransparency = 0.2
			t.Text = pw.nom
			t.Name = "Nom"
			t.Parent = bb
			bb.Parent = p
		end
		p.Name = o.kind
		liste[k] = { o = o, p = p, pos = pos, pris = false, base = p.CFrame }
		if ceder and k % 150 == 0 then ceder() end
	end
	return liste
end

-- ── les cumulus le long de la route : des bulles blanches ovales, pas une texture ──
-- (la MER de nuages ne se bâtit plus par zone — 2 à 4 km sous le départ, la brume l'effaçait : elle suit
-- la caisse, voir Client/Mer)
function Construction.nuages(piste: Piste.Piste, dossier: Instance, graine: number, ceder: (() -> ())?)
	local rnd = Random.new(graine + 17)
	local function bulle(c: Vector3, t: Vector3, teinte: Color3)
		local p = part(Vector3.new(math.min(2040, t.X), math.min(2040, t.Y), math.min(2040, t.Z)), CFrame.new(c), teinte, Enum.Material.SmoothPlastic, dossier)
		p.CastShadow = false
		local m = Instance.new("SpecialMesh")
		m.MeshType = Enum.MeshType.Sphere
		m.Parent = p
	end
	-- les cumulus : des grappes à l'écart de la route (jamais DANS le couloir de la route)
	local function libre(c: Vector3, rayon: number): boolean
		for i = 1, piste.n, 8 do
			if (piste.F[i].Position - c).Magnitude < rayon then return false end
		end
		return true
	end
	for _ = 1, 80 do
		local i = rnd:NextInteger(1, piste.n)
		local f = piste.F[i]
		local cote = rnd:NextNumber() < 0.5 and -1 or 1
		local c = f.Position + f.RightVector * cote * rnd:NextNumber(160, 420) * M + Vector3.new(0, rnd:NextNumber(-140, -30) * M, 0)
		local taille = rnd:NextNumber(40, 90) * M
		local n = rnd:NextInteger(4, 7) -- tiré AVANT le test : la suite du tirage ne dépend pas de la place
		if not libre(c, taille * 2.2 + (RH + 20) * M) then continue end
		for _ = 1, n do
			local d = Vector3.new(rnd:NextNumber(-1, 1), rnd:NextNumber(-0.3, 0.6), rnd:NextNumber(-1, 1)) * taille
			local t = taille * rnd:NextNumber(0.6, 1.1)
			bulle(c + d, Vector3.new(t * 1.4, t * 0.9, t * 1.3), Color3.fromRGB(252, 252, 250))
		end
		if ceder then ceder() end
	end
end

return Construction
