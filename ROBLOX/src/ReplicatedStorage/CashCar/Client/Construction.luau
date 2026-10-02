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
local Maillage = require(script.Parent:WaitForChild("Maillage"))
local Objets = require(script.Parent.Parent:WaitForChild("Objets"))
local M = Config.M
local RH = Config.ROAD_HALF
local EP = Config.THICK * M
local R = Config.ROUTE
local AssetServiceR = game:GetService("AssetService")

local Construction = {}

local modeleCoin = Instance.new("WedgePart")
modeleCoin.Anchored = true
modeleCoin.CanCollide = false
modeleCoin.CanQuery = false
modeleCoin.CanTouch = false
modeleCoin.TopSurface = Enum.SurfaceType.Smooth
modeleCoin.BottomSurface = Enum.SurfaceType.Smooth
modeleCoin.Material = Enum.Material.Plastic
modeleCoin.Color = R.bitume
modeleCoin.CastShadow = false -- (les coins de la dalle se faisaient de l'ombre entre eux : un fil sombre à chaque jointure, en travers de la route)
local REFLET = 0.02
modeleCoin.Reflectance = REFLET -- (le BITUME GLACÉ du jeu web : sombre de près, il prend le ciel et les nuages en rasant — sans reflet, un trou noir)

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
	-- (0,7 m de néon : deux gros tubes cyan qui mangeaient l'image — la version web trace un LISERÉ au bord de la dalle)
	local p = part(Vector3.new(0.24 * M, EP + 0.1 * M, l + 0.05), cf, R.neon, Enum.Material.Neon, parent)
	p.CastShadow = false
end

-- LA DALLE EN MAILLAGE (3e retour de Sacha : « c'est toujours moche ») : en coins épais, chaque tronçon avait SA normale — le soleil
-- et le reflet du ciel changeaient d'un cran à chaque jointure, la route se lisait en FACETTES barrées de fils sombres. Le jeu web
-- trace un ruban continu aux normales lisses. Ici : un maillage par morceau de piste (Roblox : une pièce ≤ 2 048 studs), le
-- dessus et le dessous de la dalle (les tranches sont sous les rails de néon), des normales PARTAGÉES d'un tronçon à l'autre.
-- Rend false si Roblox refuse (budget de maillages) : le morceau retombe sur les coins.
local function dalle(sections: { CFrame }, dossier: Instance): boolean
	local demi = RH * M
	local mn, mx = Vector3.new(math.huge, math.huge, math.huge), Vector3.new(-math.huge, -math.huge, -math.huge)
	local pts = table.create(#sections * 4)
	for k, f in sections do
		local g, d = f.Position - f.RightVector * demi, f.Position + f.RightVector * demi
		local bas = f.UpVector * EP
		for j, q in { g, d, g - bas, d - bas } do
			pts[(k - 1) * 4 + j] = q
			mn, mx = mn:Min(q), mx:Max(q)
		end
	end
	local centre = (mn + mx) / 2
	local nt = (#sections - 1) * 4
	local mp = Maillage.seul(function(): MeshPart?
		local em = AssetServiceR:CreateEditableMesh()
		local blanc = em:AddColor(Color3.new(1, 1, 1), 1)
		local ids, nH, nB = table.create(#pts), table.create(#sections), table.create(#sections)
		for i, q in pts do ids[i] = em:AddVertex(q - centre) end
		for k, f in sections do
			nH[k] = em:AddNormal(f.UpVector)
			nB[k] = em:AddNormal(-f.UpVector)
		end
		local function face(a: number, b: number, c: number, ka: number, kb: number, kc: number, n: { any })
			local t = em:AddTriangle(ids[a], ids[b], ids[c])
			em:SetFaceNormals(t, { n[ka], n[kb], n[kc] })
			em:SetFaceColors(t, { blanc, blanc, blanc })
		end
		for k = 1, #sections - 1 do
			local o, o2 = (k - 1) * 4, k * 4
			-- le dessus (g, d de la section k ; g, d de la suivante), puis le dessous, tourné vers le bas
			face(o + 1, o + 2, o2 + 2, k, k, k + 1, nH)
			face(o + 1, o2 + 2, o2 + 1, k, k + 1, k + 1, nH)
			face(o + 3, o2 + 4, o + 4, k, k + 1, k, nB)
			face(o + 3, o2 + 3, o2 + 4, k, k + 1, k + 1, nB)
		end
		local okF, fige = pcall(function() return AssetServiceR:CreateEditableMeshAsync(Content.fromObject(em), { FixedSize = true }) end)
		if okF and fige then
			em:Destroy()
			em = fige
		end
		local okP, piece = pcall(function() return AssetServiceR:CreateMeshPartAsync(Content.fromObject(em), { CollisionFidelity = Enum.CollisionFidelity.Box }) end)
		if not okP or not piece then
			pcall(function() em:Destroy() end)
			return nil
		end
		Maillage.suivre(piece, em, nt)
		return piece
	end)
	if not mp then return false end
	mp.Name = "Dalle"
	mp.Anchored = true
	mp.CanCollide = false
	mp.CanQuery = false
	mp.CanTouch = false
	mp.CastShadow = false
	mp.DoubleSided = true
	mp.Material = Enum.Material.Plastic -- (mat : en lisse, le bitume prenait tout le bleu du ciel en rasant — une route INDIGO le matin)
	mp.Color = R.bitume
	mp.Reflectance = REFLET
	mp.CFrame = CFrame.new(centre)
	mp.Parent = dossier
	return true
end

-- Bâtit la route d'une piste dans `dossier`. `ceder` est appelé régulièrement (bâtir en tâche de fond).
function Construction.route(piste: Piste.Piste, dossier: Instance, ceder: (() -> ())?)
	local F = piste.F
	local n = piste.n
	local demi = RH * M
	local i = 1
	local compte = 0
	-- le morceau de dalle en cours : ses sections (une par jointure), tant qu'il tient dans une pièce de Roblox
	local sections: { CFrame } = { F[1] }
	local mnS, mxS = F[1].Position, F[1].Position
	local function fermer()
		if #sections >= 2 and not dalle(sections, dossier) then
			-- (secours : les coins épais, comme avant)
			for k = 1, #sections - 1 do
				local fa, fb = sections[k], sections[k + 1]
				local mA, mB = fa.Position - fa.UpVector * (EP / 2), fb.Position - fb.UpVector * (EP / 2)
				local gA, dA = mA - fa.RightVector * demi, mA + fa.RightVector * demi
				local gB, dB = mB - fb.RightVector * demi, mB + fb.RightVector * demi
				triangle(gA, dA, dB, EP, dossier)
				triangle(gA, dB, gB, EP, dossier)
			end
		end
		sections = { sections[#sections] }
		mnS, mxS = sections[1].Position, sections[1].Position
	end
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
		table.insert(sections, fb)
		mnS, mxS = mnS:Min(fb.Position), mxS:Max(fb.Position)
		local e = mxS - mnS
		if math.max(e.X, e.Y, e.Z) > 1700 or #sections > 80 then fermer() end
		local rA, rB = demi - 0.12 * M, demi - 0.12 * M
		rail(mA - fa.RightVector * rA, mB - fb.RightVector * rB, (fa.UpVector + fb.UpVector).Unit, dossier)
		rail(mA + fa.RightVector * rA, mB + fb.RightVector * rB, (fa.UpVector + fb.UpVector).Unit, dossier)
		i = j
		compte += 1
		if ceder and compte % 60 == 0 then ceder() end
	end
	fermer()
	-- LA PEINTURE (buildTrack du web, L10149) : UNE ligne centrale en tirets — blanc lavande 0xe4ddff à demi transparent, 14 m de
	-- tiret tous les 32 m (7 points sur 16), sur les DEUX faces de la dalle. (3e retour : il y avait ici deux rangées de gros
	-- pointillés blancs sur les voies, qui n'existent pas dans le jeu web d'aujourd'hui.)
	local LAVANDE = Color3.fromRGB(228, 221, 255)
	local s = 4 * M
	local k = 0
	while s < piste.len - 16 * M do
		-- (chaque tiret en deux moitiés de 7 m : il suit la courbe)
		for moitie = 0, 1 do
			local f = Piste.repere(piste, s + (3.5 + moitie * 7) * M)
			for _, y in { 0.05 * M, -EP - 0.05 * M } do
				local v = part(Vector3.new(0.4 * M, 0.04 * M, 7.05 * M), CFrame.fromMatrix(f.Position + f.UpVector * y, f.RightVector, f.UpVector, -f.LookVector),
					LAVANDE, Enum.Material.SmoothPlastic, dossier)
				v.Transparency = 0.45
				v.CastShadow = false
			end
		end
		k += 1
		s += 32 * M
		if ceder and k % 80 == 0 then ceder() end
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
local AssetService = game:GetService("AssetService")
local EN_FRANCAIS = string.sub(game:GetService("Players").LocalPlayer.LocaleId or "fr", 1, 2) == "fr"

-- LE PLOT (L7344) : rouge DANGER, deux bandes blanches, 1,5 m — un seul maillage à facettes, bâti une fois puis copié.
-- (le maillage est centré sur sa boîte : on le pose à mi-hauteur)
local PLOT_H = 1.5
local modelePlot: BasePart? = nil
local function plotModele(): BasePart
	if modelePlot then return modelePlot end
	local ROUGE, BLANC = Color3.fromRGB(255, 59, 92), Color3.fromRGB(250, 250, 255)
	local mp = Maillage.seul(function()
		local em = AssetService:CreateEditableMesh()
		-- le profil : { hauteur, rayon, couleur du tronçon AU-DESSUS }
		local profil = {
			{ 0, 0.72, ROUGE }, { 0.10, 0.72, ROUGE }, { 0.10, 0.44, ROUGE }, { 0.51, 0.345, BLANC }, { 0.73, 0.29, ROUGE },
			{ 0.94, 0.225, BLANC }, { 1.10, 0.18, ROUGE }, { 1.50, 0.075, ROUGE },
		}
		local N = 8
		local function pt(k: number, i: number): Vector3
			local q = profil[k]
			local a = (i / N) * math.pi * 2 + ((k <= 2) and math.pi / 4 or 0)
			local n = (k <= 2) and 4 or N -- le socle a quatre pans
			if k <= 2 then a = (math.floor(i / 2) / n) * math.pi * 2 + math.pi / 4 end
			return Vector3.new(math.cos(a) * q[2], q[1] - PLOT_H / 2, math.sin(a) * q[2]) * M
		end
		local function face(a: Vector3, b: Vector3, c: Vector3, col: Color3)
			if (b - a):Cross(c - a).Magnitude < 1e-6 then return end
			local f = em:AddTriangle(em:AddVertex(a), em:AddVertex(b), em:AddVertex(c))
			local id = em:AddColor(col, 1)
			em:SetFaceColors(f, { id, id, id })
		end
		for k = 1, #profil - 1 do
			for i = 0, N - 1 do
				local a, b = pt(k, i), pt(k, i + 1)
				local c, d = pt(k + 1, i), pt(k + 1, i + 1)
				face(a, c, b, profil[k][3])
				face(b, c, d, profil[k][3])
			end
		end
		for i = 0, N - 1 do -- le bouchon du haut
			face(pt(#profil, i), Vector3.new(0, PLOT_H / 2, 0) * M, pt(#profil, i + 1), ROUGE)
		end
		local fige = AssetService:CreateEditableMeshAsync(Content.fromObject(em), { FixedSize = true })
		em:Destroy()
		return AssetService:CreateMeshPartAsync(Content.fromObject(fige), { CollisionFidelity = Enum.CollisionFidelity.Box })
	end)
	local p: BasePart
	if mp then
		p = mp
		p.DoubleSided = true
		p.Color = Color3.new(1, 1, 1)
	else
		p = Instance.new("Part") -- secours : une borne rouge
		p.Size = Vector3.new(0.7, PLOT_H, 0.7) * M
		p.Color = ROUGE
	end
	p.Anchored = true
	p.CanCollide = false
	p.CanQuery = false
	p.CanTouch = false
	p.CastShadow = false
	p.Material = Enum.Material.SmoothPlastic
	modelePlot = p
	return p
end

-- ── LA PIÈCE (pickGeo, L20186) : une galette à 12 pans de 2,36 m, son JONC en relief, et le « $ » en pixels sur ses deux faces ──
local function figer(em: any): MeshPart?
	local okF, fige = pcall(function() return AssetService:CreateEditableMeshAsync(Content.fromObject(em), { FixedSize = true }) end)
	if okF and fige then
		em:Destroy()
		em = fige
	end
	local ok, mp = pcall(function() return AssetService:CreateMeshPartAsync(Content.fromObject(em), { CollisionFidelity = Enum.CollisionFidelity.Box }) end)
	if not ok or not mp then return nil end
	mp.Anchored = true
	mp.CanCollide = false
	mp.CanQuery = false
	mp.CanTouch = false
	mp.CastShadow = false
	mp.DoubleSided = true
	return mp
end
local function hexa(h: number): Color3 return Color3.fromRGB(bit32.rshift(h, 16), bit32.band(bit32.rshift(h, 8), 255), bit32.band(h, 255)) end
-- une image en pixels (une chaîne par ligne, une lettre par pixel) agrandie k fois : les pixels restent des pixels
local function imagePixels(lignes: { string }, couleurs: { [string]: Color3 }, k: number): any?
	local n = #lignes
	local ok, im = pcall(function() return AssetService:CreateEditableImage({ Size = Vector2.new(n * k, n * k) }) end)
	if not ok or not im then return nil end
	local b = buffer.create(n * k * n * k * 4)
	for y = 0, n * k - 1 do
		local l = lignes[y // k + 1]
		for x = 0, n * k - 1 do
			local c = couleurs[string.sub(l, x // k + 1, x // k + 1)]
			local o = (y * n * k + x) * 4
			if c then
				buffer.writeu8(b, o, math.floor(c.R * 255 + 0.5))
				buffer.writeu8(b, o + 1, math.floor(c.G * 255 + 0.5))
				buffer.writeu8(b, o + 2, math.floor(c.B * 255 + 0.5))
				buffer.writeu8(b, o + 3, 255)
			end
		end
	end
	local ok2 = pcall(function() im:WritePixelsBuffer(Vector2.zero, Vector2.new(n * k, n * k), b) end)
	return ok2 and im or nil
end
local PIECE_R, PIECE_E = 1.18, 0.15
local modelePiece: any = nil
local pieceAtelier
local function pieceModele(): BasePart?
	if modelePiece ~= nil then return modelePiece or nil end
	modelePiece = Maillage.seul(pieceAtelier) or false
	return modelePiece or nil
end
pieceAtelier = function(): BasePart?
	-- la frappe (coinTex, L20155) : 16 × 16 — liseré sombre, tranche biseautée (lumière en haut à gauche), champ, et le « $ »
	local DOL = { "..#..", ".####", "#.#..", "#.#..", ".###.", "..#.#", "..#.#", "####.", "..#.." }
	local lignes = {}
	for y = 0, 15 do
		local l = ""
		for x = 0, 15 do
			local dx, dy = x - 7.5, y - 7.5
			local r = math.sqrt(dx * dx + dy * dy)
			local c
			if r > 6.9 then c = "k" elseif r > 5.7 then c = (dx + dy < -1) and "l" or ((dx + dy > 2) and "d" or "h") else c = (dx + dy < -6) and "h" or "g" end
			if x >= 6 and x <= 10 and y >= 3 and y <= 11 and string.sub(DOL[y - 2], x - 5, x - 5) == "#" then c = "s" end
			l ..= c
		end
		lignes[y + 1] = l
	end
	local image = imagePixels(lignes, { k = hexa(0x6e3c00), d = hexa(0xd8a412), g = hexa(0xfff27a), l = hexa(0xfffbe6), h = hexa(0xfffbd0), s = hexa(0x8a4a00) }, 8)
	local ok, em = pcall(function() return AssetService:CreateEditableMesh() end)
	if not image or not ok or not em then return nil end
	local R, e = PIECE_R * M, PIECE_E * M
	local function tri(a: Vector3, b: Vector3, c: Vector3, ua: Vector2, ub: Vector2, uc: Vector2)
		local f = em:AddTriangle(em:AddVertex(a), em:AddVertex(b), em:AddVertex(c))
		em:SetFaceUVs(f, { em:AddUV(ua), em:AddUV(ub), em:AddUV(uc) })
	end
	local N = 12
	local function pt(i: number, z: number, rho: number?): Vector3
		local a = i / N * 2 * math.pi
		return Vector3.new(math.cos(a) * (rho or R), math.sin(a) * (rho or R), z)
	end
	local function uvFace(p: Vector3, sens: number): Vector2 return Vector2.new(0.5 + sens * p.X / (2 * R), 0.5 - p.Y / (2 * R)) end
	local champ, clair = Vector2.new(7.5 / 16, 13.5 / 16), Vector2.new(7.5 / 16, 1.5 / 16) -- un pixel du champ (la tranche), le pixel clair (le jonc)
	for i = 0, N - 1 do
		local a, b = pt(i, e), pt(i + 1, e)
		local a2, b2 = pt(i, -e), pt(i + 1, -e)
		tri(Vector3.new(0, 0, e), a, b, Vector2.new(0.5, 0.5), uvFace(a, 1), uvFace(b, 1))            -- la face
		tri(Vector3.new(0, 0, -e), b2, a2, Vector2.new(0.5, 0.5), uvFace(b2, -1), uvFace(a2, -1))      -- le revers
		tri(a, a2, b, champ, champ, champ)                                                              -- la tranche
		tri(b, a2, b2, champ, champ, champ)
		-- le JONC : un bourrelet en losange autour de la tranche
		local t = 0.13 * M
		local q = { { R + t, 0 }, { R, t }, { R - t, 0 }, { R, -t } }
		for k = 1, 4 do
			local q0, q1 = q[k], q[k % 4 + 1]
			local p0, p1 = pt(i, q0[2], q0[1]), pt(i + 1, q0[2], q0[1])
			local p2, p3 = pt(i, q1[2], q1[1]), pt(i + 1, q1[2], q1[1])
			tri(p0, p1, p2, clair, clair, clair)
			tri(p1, p3, p2, clair, clair, clair)
		end
	end
	local mp = figer(em)
	if not mp then return nil end
	mp.Material = Enum.Material.SmoothPlastic
	mp.Color = Color3.new(1, 1, 1)
	mp.Reflectance = 0.08
	mp.TextureContent = Content.fromObject(image)
	return mp
end

-- ── LES FRUITS (FRUIT_DEFS, L20222 — cuits : Objets.fruits) : un maillage à facettes par fruit ──
local modelesFruit: { [number]: any } = {}
local function fruitModele(i: number): { p: BasePart, dy: number }?
	local m = modelesFruit[i]
	if m ~= nil then return m or nil end
	modelesFruit[i] = false
	local d = Objets.fruits[i]
	if not d then return nil end
	local mp, centre = Maillage.piece(d, M)
	if not mp then return nil end
	mp.Anchored = true
	mp.Massless = false
	mp.CastShadow = false
	mp.Material = Enum.Material.SmoothPlastic
	mp.Reflectance = 0.06
	local r = { p = mp, dy = centre.Y }
	modelesFruit[i] = r
	return r
end
-- la hauteur du centre d'un fruit (fruitLeve, L23459) : son point le plus bas reste ~45 cm au-dessus du bitume, battement compris
function Construction.fruitLeve(i: number): number
	local d = Objets.fruits[i]
	return d and math.max(1.3, -d.bas * 1.1 + 0.45) or 1.3
end

-- ── LE CRISTAL de pouvoir (mkPower, L23525) : le verre à facettes, son cœur-étoile, le gyroscope de deux anneaux ──
-- les pictogrammes en pixels des cinq pouvoirs (PXI_G) : les mêmes que sur la plaque du HUD
local PICTOS = {
	n = "....#....|...##....|...###...|..####.#.|..######.|.###.###.|.##...##.|.##...##.|..#####..",
	a = ".........|#........|##.......|###......|#####....|.#######.|..#######|....#####|.......##",
	v = ".....###.|....###..|...###...|..######.|.....##..|....##...|...##....|..##.....|.#.......",
	m = "##.....##|.........|##.....##|##.....##|##.....##|###...###|.#######.|..#####..|.........",
	x = "....#....|....#....|...###...|#########|.#######.|..#####..|..##.##..|.##...##.|.#.....#.",
}
local imagesPicto: { [string]: any } = {}
local modelesCristal: { [string]: any } = {}
local cristalBase: any = nil
local function cristalModele(pw: string): BasePart?
	local m = modelesCristal[pw]
	if m ~= nil then return m or nil end
	modelesCristal[pw] = false
	local def = Config.POUVOIRS[pw]
	-- (le budget de triangles : les cinq cristaux partagent les mêmes trois maillages, copiés et recolorés)
	if cristalBase == nil then
		local v0 = Maillage.piece(Objets.cristal.verre, M)
		local c0, cc = Maillage.piece(Objets.cristal.coeur, M)
		local a0, ac = Maillage.piece(Objets.cristal.anneaux, M)
		cristalBase = (v0 and c0 and a0) and { v0, c0, cc, a0, ac } or false
	end
	if not cristalBase then return nil end
	local verre = cristalBase[1]:Clone()
	verre.Anchored = true
	verre.Massless = false
	verre.CastShadow = false
	verre.Material = Enum.Material.Glass
	verre.Color = def.couleur
	verre.Transparency = 0.28
	verre.Reflectance = 0.2
	for _, q in { { cristalBase[2], cristalBase[3], def.couleur:Lerp(Color3.new(1, 1, 1), 0.82) }, { cristalBase[4], cristalBase[5], def.couleur } } do
		local p, centre = q[1]:Clone(), q[2]
		do
			p.CastShadow = false
			p.Material = Enum.Material.Neon
			p.Color = q[3]
			p.CFrame = verre.CFrame * CFrame.new(centre)
			local w = Instance.new("WeldConstraint")
			w.Part0, w.Part1 = verre, p
			w.Parent = p
			p.Parent = verre
		end
	end
	-- le pictogramme, dessiné une fois par pouvoir (9 × 9)
	local lignes = string.split(PICTOS[pw] or PICTOS.n, "|")
	imagesPicto[pw] = imagePixels(lignes, { ["#"] = def.couleur }, 6)
	modelesCristal[pw] = verre
	return verre
end
-- tous les modèles, bâtis UNE fois, hors de la boucle de rendu (la ligne parfaite pose des fruits en pleine course)
local etatModeles = 0 -- 0 = pas commencé, 1 = en cours, 2 = prêts
function Construction.modeles()
	if etatModeles == 2 then return end
	if etatModeles == 1 then
		while etatModeles ~= 2 do task.wait() end -- (une deuxième zone se bâtit en même temps : elle attend les modèles)
		return
	end
	etatModeles = 1
	plotModele()
	pieceModele()
	for i = 1, #Config.FRUITS do fruitModele(i) end
	for pw in Config.POUVOIRS do cristalModele(pw) end
	etatModeles = 2
end

-- un objet : sa pièce, sa position. o.lat et o.h sont donnés dans le repère de SA face.
function Construction.unObjet(piste: Piste.Piste, o: Piste.Objet, dossier: Instance): any
	local f = Piste.repereFace(piste, o.s, o.face)
	local haut = (o.kind == "fruit") and Construction.fruitLeve(o.fruit or 1) * M or o.h
	local pos = f.Position + f.RightVector * o.lat + f.UpVector * haut
	local p: BasePart
	if o.kind == "piece" then
		local modele = pieceModele()
		if modele then
			-- la frappe regarde le pilote qui arrive (puis elle tourne sur elle-même)
			p = modele:Clone()
			p.CFrame = CFrame.fromMatrix(pos, f.RightVector, f.UpVector)
			p.Parent = dossier
		else
			p = part(Vector3.new(0.3 * M, 2.36 * M, 2.36 * M), CFrame.fromMatrix(pos, f.RightVector, f.UpVector), OR, Enum.Material.Neon, dossier);
			(p :: Part).Shape = Enum.PartType.Cylinder
			p.CastShadow = false
		end
	elseif o.kind == "pad" then
		-- la plaque de 5,5 × 9 m : fond d'encre, rails et chevrons d'or
		p = part(Vector3.new(5.5 * M, 0.12 * M, 9 * M), CFrame.fromMatrix(pos, f.RightVector, f.UpVector, -f.LookVector), Color3.fromRGB(28, 4, 48), Enum.Material.SmoothPlastic, dossier)
		p.CastShadow = false
		for c = -1.5, 1.5, 1 do
			for cote = -1, 1, 2 do
				local ch = part(Vector3.new(2.5 * M, 0.06 * M, 0.7 * M),
					CFrame.fromMatrix(pos + f.LookVector * (c * 2.25 * M) + f.RightVector * (cote * 1.05 * M) + f.UpVector * (0.07 * M), f.RightVector, f.UpVector, -f.LookVector)
						* CFrame.Angles(0, cote * 0.6, 0),
					Color3.fromRGB(255, 242, 122), Enum.Material.Neon, dossier)
				ch.CastShadow = false
				ch.Parent = p
			end
		end
		for cote = -1, 1, 2 do
			local rail = part(Vector3.new(0.22 * M, 0.08 * M, 9 * M), CFrame.fromMatrix(pos + f.RightVector * (cote * 2.6 * M) + f.UpVector * (0.06 * M), f.RightVector, f.UpVector, -f.LookVector),
				Color3.fromRGB(255, 200, 60), Enum.Material.Neon, dossier)
			rail.CastShadow = false
			rail.Parent = p
		end
	elseif o.kind == "plot" then
		p = plotModele():Clone()
		p.CFrame = CFrame.fromMatrix(pos + f.UpVector * (PLOT_H / 2 * M), f.RightVector, f.UpVector)
		p.Parent = dossier
	elseif o.kind == "flaque" then
		-- la flaque : un disque noir glacé, liseré violet
		local r = (o.r or 2.5) * M
		p = part(Vector3.new(0.06 * M, r * 2.4, r * 2.4), CFrame.fromMatrix(pos, f.UpVector, -f.RightVector), Color3.fromRGB(18, 20, 25), Enum.Material.SmoothPlastic, dossier);
		(p :: Part).Shape = Enum.PartType.Cylinder
		p.Reflectance = 0.45
		p.CastShadow = false
		local lis = part(Vector3.new(0.04 * M, r * 2.75, r * 2.75), CFrame.fromMatrix(pos - f.UpVector * (0.02 * M), f.UpVector, -f.RightVector), Color3.fromRGB(74, 58, 114), Enum.Material.SmoothPlastic, dossier);
		(lis :: Part).Shape = Enum.PartType.Cylinder
		lis.Transparency = 0.55
		lis.CastShadow = false
		lis.Parent = p
	elseif o.kind == "fruit" and fruitModele(o.fruit or 1) then
		-- le VRAI fruit du jeu web, à facettes (cuit)
		local fm = fruitModele(o.fruit or 1) :: { p: BasePart, dy: number }
		p = fm.p:Clone()
		p.CFrame = CFrame.fromMatrix(pos + f.UpVector * fm.dy, f.RightVector, f.UpVector)
		p.Parent = dossier
	elseif o.kind == "fruit" then
		-- (secours, si Roblox refuse les maillages : une boule à sa couleur et sa feuille)
		local fd = Config.FRUITS[o.fruit or 1]
		local t = fd.taille * M
		p = part(Vector3.new(t, t * fd.plat, t), CFrame.fromMatrix(pos, f.RightVector, f.UpVector), fd.couleur, Enum.Material.SmoothPlastic, dossier);
		(p :: Part).Shape = Enum.PartType.Ball
		p.Reflectance = 0.12
		p.CastShadow = false
		local m = Instance.new("SpecialMesh")
		m.MeshType = Enum.MeshType.Sphere
		m.Parent = p
		local feuille = part(Vector3.new(0.5 * M, 0.12 * M, 0.9 * M), CFrame.fromMatrix(pos + f.UpVector * (t * fd.plat * 0.5), f.RightVector, f.UpVector) * CFrame.Angles(0.5, 0.6, 0),
			Color3.fromRGB(70, 190, 80), Enum.Material.SmoothPlastic, dossier)
		feuille.CastShadow = false
		feuille.Parent = p
		local w = Instance.new("WeldConstraint")
		feuille.Anchored = false
		w.Part0, w.Part1 = p, feuille
		w.Parent = feuille
	else -- cristal de pouvoir : le verre à facettes, son cœur, son gyroscope — et son étiquette (on sait ce qu'on vise AVANT de le prendre)
		local pw = Config.POUVOIRS[o.pw or "n"]
		local modele = cristalModele(o.pw or "n")
		if modele then
			p = modele:Clone()
			p.CFrame = CFrame.fromMatrix(pos, f.RightVector, f.UpVector)
			p.Parent = dossier
		else
			p = part(Vector3.new(2.4 * M, 2.4 * M, 2.4 * M), CFrame.fromMatrix(pos, f.RightVector, f.UpVector) * CFrame.Angles(math.pi / 4, 0, math.pi / 4),
				pw.couleur, Enum.Material.Neon, dossier)
			p.CastShadow = false
			p.Transparency = 0.15
		end
		local bb = Instance.new("BillboardGui")
		bb.Size = UDim2.fromOffset(180, 96)
		bb.StudsOffsetWorldSpace = f.UpVector * (4.1 * M)
		bb.AlwaysOnTop = false
		bb.MaxDistance = 160 * M
		bb.LightInfluence = 0
		local picto = imagesPicto[o.pw or "n"]
		if picto then
			local im = Instance.new("ImageLabel")
			im.BackgroundTransparency = 1
			im.AnchorPoint = Vector2.new(0.5, 0)
			im.Position = UDim2.fromScale(0.5, 0)
			im.Size = UDim2.fromOffset(54, 54)
			im.ResampleMode = Enum.ResamplerMode.Pixelated
			im.ImageContent = Content.fromObject(picto)
			im.Parent = bb
		end
		local t = Instance.new("TextLabel")
		t.BackgroundTransparency = 1
		t.Size = UDim2.new(1, 0, 0, 36)
		t.Position = UDim2.new(0, 0, 1, -38)
		t.FontFace = Font.new("rbxasset://fonts/families/PressStart2P.json")
		t.TextScaled = true
		t.TextColor3 = pw.couleur
		t.TextStrokeColor3 = Color3.fromRGB(28, 4, 48)
		t.TextStrokeTransparency = 0
		t.Text = EN_FRANCAIS and pw.nom or pw.nomEN
		t.Name = "Nom"
		t.Parent = bb
		bb.Parent = p
	end
	p.Name = o.kind
	return { o = o, p = p, pos = pos, pris = false, base = p.CFrame }
end

function Construction.objets(piste: Piste.Piste, dossier: Instance, ceder: (() -> ())?): { any }
	local liste = {}
	Construction.modeles()
	for k, o in piste.objets do
		liste[k] = Construction.unObjet(piste, o, dossier)
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
