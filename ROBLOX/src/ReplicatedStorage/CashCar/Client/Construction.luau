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
local Recyclage = require(script.Parent:WaitForChild("Recyclage"))
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
-- L'HABIT DE LA ROUTE, PAR NIVEAU (buildTrack du web, L10106 : « le liseré suit le monde, plus le hasard ») : NUAGES = le cyan de
-- l'air, VILLE = le rose néon sur un bitume de nuit MOUILLÉ, ORBITE = le cyan froid sur un indigo profond. `nappe` = la lueur du
-- rail qui saigne vers l'intérieur du bitume (1,15 m ; 3,35 m sous la pluie : la route mouillée renvoie le néon), `nappeK` sa force.
local HABITS: { [string]: any } = {
	-- (5/10, Sacha : « prends des libertés pour la map ») le bitume des NUAGES s'assombrit — un violet profond qui fait ressortir la
	-- caisse orange et le coton blanc — et la lueur cyan des rails saigne deux fois plus loin sur la route, comme en ville
	-- (6/10, banc des graphismes, Sacha : « améliore les graphismes au max ») mesuré à l'écran, ce violet sortait BLEU ROI
	-- (45,42,188) : le ciel, l'ambiance et la saturation de l'étalonnage lui mangeaient son rouge — une nappe d'eau, pas une route.
	-- Plus de rouge, moins de bleu dans la matière : à l'écran un VIOLET PROFOND (celui de la fin d'après-midi), qui se détache du
	-- ciel cyan, du coton lavande et de la caisse orange.
	nuages = { accent = R.neon, bitume = Color3.fromRGB(70, 46, 86), nappe = 2.4, nappeK = 0.5 },
	ville = { accent = Color3.fromRGB(242, 74, 160), bitume = Color3.fromRGB(40, 34, 80), nappe = 3.35, nappeK = 0.62, reflets = 1 },
	-- (6/10) l'orbite : sous le soleil dur (Ambiance), un INDIGO violacé — le bleu électrique d'avant luisait comme un néon sur le noir
	espace = { accent = Color3.fromRGB(94, 230, 255), bitume = Color3.fromRGB(64, 44, 92), nappe = 1.15, nappeK = 0.36 },
}
-- les VARIANTES : L'ORAGE prend le violet électrique de l'éclair (0x8a7dff) sur un bitume mouillé ; à MINUIT EN VILLE les néons de la
-- route tombent à 40 % (villeApres) ; la PLUIE DE SATELLITES garde l'habit de l'orbite
HABITS.orage = { accent = Color3.fromRGB(138, 125, 255), bitume = Color3.fromRGB(70, 58, 96), nappe = 3.35, nappeK = 0.5 }
HABITS.nuit = { accent = Color3.fromRGB(190, 58, 126), bitume = Color3.fromRGB(34, 30, 66), nappe = 3.35, nappeK = 0.3, reflets = 0.45 }
-- LA NAPPE DE LUEUR (L10133) : le web pose sous chaque rail un ruban ADDITIF qui meurt sur l'asphalte. Ici c'est une IMAGE d'une
-- bande de pixels en travers de la route (le bitume au milieu, le bitume + l'accent sur les bords), tendue sur la dalle par ses
-- coordonnées de texture : zéro pièce et zéro triangle de plus. (1er essai : la couleur dans les SOMMETS, avec deux colonnes de
-- points de plus par face — la dalle triplait, et quatre zones gardées en réserve vidaient le budget de maillages : la ville
-- qui se préparait pendant le niveau NUAGES perdait ses fenêtres. Mesuré au banc, 2/10.)
local nappes: { [any]: any } = {}
local peindreNappe: (h: any, im: any) -> boolean
local function imageNappe(h: any): any?
	if nappes[h] ~= nil then return nappes[h] or nil end
	nappes[h] = false
	local ok, im = pcall(function() return AssetServiceR:CreateEditableImage({ Size = Vector2.new(128, h.reflets and 256 or 128) }) end)
	if not ok or not im then return nil end
	nappes[h] = peindreNappe(h, im) and im or false
	return nappes[h] or nil
end
peindreNappe = function(h: any, im: any): boolean
	-- LE BITUME MOUILLÉ DE LA VILLE (L9725 : « sous la pluie, la route n'était qu'un aplat violet : c'est pourtant LA surface qui fait
	-- une nuit de pluie ») : `reflets` → l'image fait 96 m de long et porte des TRAÎNÉES de néon (magenta, cyan, ambre des fenêtres),
	-- étirées dans le sens de la route comme des enseignes renvoyées par l'eau. Roblox ne reflète que le ciel : ces reflets sont
	-- peints, pas calculés — mais en roulant, c'est bien une route qui brille.
	-- (4/10 : toutes les routes ont une LONGUEUR d'image — 96 m — pour porter la matière du bitume, voir plus bas)
	local N, H = 128, h.reflets and 256 or 128
	local px = table.create(N * H * 3, 0)
	for x = 0, N - 1 do
		local d = math.min(x + 0.5, N - x - 0.5) / N * 2 * RH -- (mètres depuis le bord le plus proche)
		local k = math.max(0, 1 - d / h.nappe)
		k = k * k * h.nappeK
		local c = { h.bitume.R + h.accent.R * k, h.bitume.G + h.accent.G * k, h.bitume.B + h.accent.B * k }
		for y = 0, H - 1 do
			local o = (y * N + x) * 3
			px[o + 1], px[o + 2], px[o + 3] = c[1], c[2], c[3]
		end
	end
	-- LA MATIÈRE DU BITUME (Sacha, 4/10 : « améliore les graphismes au max ») : la dalle était un aplat — de près, une route
	-- d'asphalte a des MARBRURES, des plaques plus claires, d'autres usées. Deux bruits doux (des cases de 8 et de 32 pixels, soit
	-- 3,5 m et 14 m de large), qui bouclent sur la longueur de l'image ; pas de grain fin : sans mipmaps, un grain au pixel
	-- scintillerait au loin. Moyenne 1 : la teinte de la route ne bouge pas, elle prend du relief.
	do
		local rb = Random.new(4242)
		local function grille(c: number): { number }
			local g = {}
			for i = 1, (N // c + 2) * (H // c) do g[i] = rb:NextNumber() * 2 - 1 end
			return g
		end
		local function bruit(g: { number }, c: number, x: number, y: number): number
			local nx, ny = N // c + 2, H // c
			local fx, fy = x / c, y / c
			local ix, iy = math.floor(fx), math.floor(fy)
			local tx, ty = fx - ix, fy - iy
			tx, ty = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
			local function v(a: number, b: number): number return g[(b % ny) * nx + math.min(nx - 1, a) + 1] end
			local h0 = v(ix, iy) + (v(ix + 1, iy) - v(ix, iy)) * tx
			local h1 = v(ix, iy + 1) + (v(ix + 1, iy + 1) - v(ix, iy + 1)) * tx
			return h0 + (h1 - h0) * ty
		end
		local g8, g32 = grille(8), grille(32)
		for y = 0, H - 1 do
			for x = 0, N - 1 do
				local f = 1 + 0.08 * bruit(g8, 8, x, y) + 0.06 * bruit(g32, 32, x, y)
				local o = (y * N + x) * 3
				px[o + 1] *= f
				px[o + 2] *= f
				px[o + 3] *= f
			end
		end
	end
	if h.reflets then
		local rnd = Random.new(977)
		local TONS = { { 1, 0.24, 0.78 }, { 0.24, 0.91, 1 }, { 1, 0.69, 0.29 }, { 1, 0.31, 0.62 } }
		for _ = 1, 30 do
			local c = TONS[rnd:NextInteger(1, #TONS)]
			local k = (0.10 + rnd:NextNumber() * 0.20) * h.reflets
			local x0, sx = rnd:NextNumber() * N, 1.6 + rnd:NextNumber() * 3.6
			local y0, ly = rnd:NextNumber() * H, 34 + rnd:NextNumber() * 80
			for y = -math.floor(ly), math.floor(ly) do
				local fy = 1 - (y / ly) ^ 2
				local yy = (math.floor(y0 + y) % H) * N
				for x = math.max(0, math.floor(x0 - 3 * sx)), math.min(N - 1, math.ceil(x0 + 3 * sx)) do
					local g = math.exp(-((x - x0) / sx) ^ 2) * fy * fy * k
					local o = (yy + x) * 3
					px[o + 1] += c[1] * g
					px[o + 2] += c[2] * g
					px[o + 3] += c[3] * g
				end
			end
		end
	end
	local b = buffer.create(N * H * 4)
	for i = 0, N * H - 1 do
		for j = 1, 3 do buffer.writeu8(b, i * 4 + j - 1, math.clamp(math.floor(px[i * 3 + j] * 255 + 0.5), 0, 255)) end
		buffer.writeu8(b, i * 4 + 3, 255)
	end
	return (pcall(function() im:WritePixelsBuffer(Vector2.zero, Vector2.new(N, H), b) end))
end
-- (mise au point, le banc des graphismes) workspace:SetAttribute("DbgBitume", '{"niveau":"nuages","bitume":[60,56,80],"nappeK":0.5}') :
-- l'habit d'un niveau RETOUCHÉ et son image REPEINTE en place — toutes les dalles qui la portent changent sur-le-champ
workspace:GetAttributeChangedSignal("DbgBitume"):Connect(function()
	local v = workspace:GetAttribute("DbgBitume")
	if type(v) ~= "string" or v == "" then return end
	local ok, t = pcall(function() return game:GetService("HttpService"):JSONDecode(v) end)
	if not ok or type(t) ~= "table" then return end
	local h = HABITS[t.niveau or "nuages"]
	if not h then return end
	for k, x in t do
		if k ~= "niveau" and k ~= "reflets" then h[k] = (type(x) == "table") and Color3.fromRGB(x[1], x[2], x[3]) or x end
	end
	local im = nappes[h]
	if im then peindreNappe(h, im) end
end)
modeleCoin.Reflectance = REFLET -- (le BITUME GLACÉ du jeu web : sombre de près, il prend le ciel et les nuages en rasant — sans reflet, un trou noir)

-- (rec : une pièce de DÉCOR, reprise au recyclage quand la zone est oubliée — voir Client/Recyclage)
local function part(taille: Vector3, cf: CFrame, couleur: Color3, matiere: Enum.Material, parent: Instance, rec: boolean?): Part
	local p = rec and Recyclage.part() or Instance.new("Part")
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
local function triangle(a: Vector3, b: Vector3, c: Vector3, ep: number, parent: Instance, couleur: Color3?)
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
	if couleur then w1.Color = couleur end
	w1.Size = Vector3.new(ep, hauteur, math.abs(ab:Dot(dos)))
	w1.CFrame = CFrame.fromMatrix((a + b) / 2, droite, haut, dos)
	w1.Parent = parent
	local w2 = modeleCoin:Clone()
	if couleur then w2.Color = couleur end
	w2.Size = Vector3.new(ep, hauteur, math.abs(ac:Dot(dos)))
	w2.CFrame = CFrame.fromMatrix((a + c) / 2, -droite, haut, -dos)
	w2.Parent = parent
end

local function rail(a: Vector3, b: Vector3, haut: Vector3, parent: Instance, habit: any)
	local d = b - a
	local l = d.Magnitude
	if l < 0.01 then return end
	local cf = CFrame.lookAt((a + b) / 2, b, haut)
	-- (0,7 m de néon : deux gros tubes cyan qui mangeaient l'image — la version web trace un LISERÉ au bord de la dalle)
	local p = part(Vector3.new(0.24 * M, EP + 0.1 * M, l + 0.05), cf, habit.accent, Enum.Material.Neon, parent, true)
	p.Name = "Rail"
	p.CastShadow = false
end

-- LA DALLE EN MAILLAGE (3e retour de Sacha : « c'est toujours moche ») : en coins épais, chaque tronçon avait SA normale — le soleil
-- et le reflet du ciel changeaient d'un cran à chaque jointure, la route se lisait en FACETTES barrées de fils sombres. Le jeu web
-- trace un ruban continu aux normales lisses. Ici : un maillage par morceau de piste (Roblox : une pièce ≤ 2 048 studs), le
-- dessus et le dessous de la dalle (les tranches sont sous les rails de néon), des normales PARTAGÉES d'un tronçon à l'autre.
-- Rend false si Roblox refuse (budget de maillages) : le morceau retombe sur les coins.
local function dalle(sections: { CFrame }, dossier: Instance, ctx: { habit: any, dist: number }): boolean
	local habit = ctx.habit
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
	local im = imageNappe(habit) -- (sans image — Roblox l'a refusée — : le bitume uni, dans les sommets)
	local fin = ctx.dist
	local bt = habit.bitume
	local mp = Maillage.seul(function(): MeshPart?
		local em = AssetServiceR:CreateEditableMesh()
		local fond = em:AddColor(im and Color3.new(1, 1, 1) or bt, 1)
		-- (u : en travers de la route ; v : le long — l'image des reflets se répète tous les 96 m, d'un morceau de dalle au suivant)
		local uv = table.create(#pts)
		local dist = ctx.dist
		for k, f in sections do
			if k > 1 then dist += (f.Position - sections[k - 1].Position).Magnitude / M end
			local v = dist / 96
			local uG, uD = em:AddUV(Vector2.new(0.004, v)), em:AddUV(Vector2.new(0.996, v))
			local o = (k - 1) * 4
			uv[o + 1], uv[o + 2], uv[o + 3], uv[o + 4] = uG, uD, uG, uD
		end
		fin = dist
		local ids, nH, nB = table.create(#pts), table.create(#sections), table.create(#sections)
		for i, q in pts do ids[i] = em:AddVertex(q - centre) end
		for k, f in sections do
			nH[k] = em:AddNormal(f.UpVector)
			nB[k] = em:AddNormal(-f.UpVector)
		end
		local function face(a: number, b: number, c: number, ka: number, kb: number, kc: number, n: { any })
			local t = em:AddTriangle(ids[a], ids[b], ids[c])
			em:SetFaceNormals(t, { n[ka], n[kb], n[kc] })
			em:SetFaceColors(t, { fond, fond, fond })
			em:SetFaceUVs(t, { uv[a], uv[b], uv[c] })
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
	ctx.dist = fin
	if not mp then return false end
	mp.Name = "Dalle"
	mp.Anchored = true
	mp.CanCollide = false
	mp.CanQuery = false
	mp.CanTouch = false
	mp.CastShadow = false
	mp.DoubleSided = true
	mp.Material = Enum.Material.Plastic -- (mat : en lisse, le bitume prenait tout le bleu du ciel en rasant — une route INDIGO le matin)
	mp.Color = Color3.new(1, 1, 1) -- (la couleur est dans l'image de la nappe — ou, sans elle, dans les sommets)
	if im then mp.TextureContent = Content.fromObject(im) end
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
	-- (l'habit et la distance sont PROPRES à cet appel : deux zones peuvent se bâtir en même temps)
	local habit = HABITS[(piste :: any).variante or ""] or HABITS[(piste :: any).niveau] or HABITS.nuages
	local ctx = { habit = habit, dist = 0 }
	-- le morceau de dalle en cours : ses sections (une par jointure), tant qu'il tient dans une pièce de Roblox
	local sections: { CFrame } = { F[1] }
	local mnS, mxS = F[1].Position, F[1].Position
	local function fermer()
		if #sections >= 2 and not dalle(sections, dossier, ctx) then
			-- (secours : les coins épais, comme avant)
			for k = 1, #sections - 1 do
				local fa, fb = sections[k], sections[k + 1]
				local mA, mB = fa.Position - fa.UpVector * (EP / 2), fb.Position - fb.UpVector * (EP / 2)
				local gA, dA = mA - fa.RightVector * demi, mA + fa.RightVector * demi
				local gB, dB = mB - fb.RightVector * demi, mB + fb.RightVector * demi
				triangle(gA, dA, dB, EP, dossier, habit.bitume)
				triangle(gA, dB, gB, EP, dossier, habit.bitume)
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
		rail(mA - fa.RightVector * rA, mB - fb.RightVector * rB, (fa.UpVector + fb.UpVector).Unit, dossier, habit)
		rail(mA + fa.RightVector * rA, mB + fb.RightVector * rB, (fa.UpVector + fb.UpVector).Unit, dossier, habit)
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
					LAVANDE, Enum.Material.SmoothPlastic, dossier, true)
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
-- L'OVULE (L10343 ; Sacha, 26/09 : « plus gros et rond comme un ovule ; on peut le franchir en venant de n'importe quelle
-- direction »). Plus un anneau posé sur la route : une SPHÈRE de 55 m de rayon (plus large que la route qui la traverse), le centre
-- un peu au-dessus du bitume — la route entre dans le bas de l'ovule. Une membrane translucide qui brille sur ses bords (rose, et
-- une seconde peau cyan dessous pour l'irisation), un NOYAU éclatant qui bat au centre, un halo. Le Pilote le fait respirer et
-- tourner, et le franchit dès qu'on y ENTRE, d'où qu'on vienne. Rend ses pièces.
function Construction.portail(piste: Piste.Piste, dossier: Instance): any
	local f = Piste.repere(piste, piste.len - 25 * M)
	local Rr = 55 * M
	local c = f.Position + f.UpVector * (Rr * 0.38)
	local function boule(d: number, couleur: Color3, matiere: Enum.Material, transp: number, nom: string): Part
		local p = part(Vector3.new(d, d, d), CFrame.new(c), couleur, matiere, dossier)
		p.Shape = Enum.PartType.Ball
		p.Transparency = transp
		p.CastShadow = false
		p.Name = nom
		return p
	end
	local membrane = boule(Rr * 2, Color3.fromRGB(255, 79, 216), Enum.Material.ForceField, 0, "Ovule")
	local irise = boule(Rr * 1.94, Color3.fromRGB(94, 230, 255), Enum.Material.ForceField, 0.35, "OvuleIrise")
	local noyau = boule(Rr * 0.5, Color3.fromRGB(255, 208, 244), Enum.Material.Neon, 0.15, "OvuleNoyau")
	local halo = boule(Rr * 0.9, Color3.fromRGB(255, 79, 216), Enum.Material.Neon, 0.8, "OvuleHalo")
	local lum = Instance.new("PointLight")
	lum.Color = Color3.fromRGB(255, 79, 216)
	lum.Range = 60
	lum.Brightness = 2
	lum.Shadows = false
	lum.Parent = noyau
	return { c = c, R = Rr, membrane = membrane, irise = irise, noyau = noyau, halo = halo }
end

-- ── les objets ──
local OR = Color3.fromRGB(255, 205, 64)
local AssetService = game:GetService("AssetService")
local EN_FRANCAIS = Config.francais()

-- LE PLOT (L7344) : rouge DANGER, deux bandes blanches, 1,5 m — un seul maillage à facettes, bâti une fois puis copié.
-- (le maillage est centré sur sa boîte : on le pose à mi-hauteur)
local PLOT_H = 1.5
local modelePlot: BasePart? = nil
local function plotModele(): BasePart
	if modelePlot then
		if not modelePlot:GetAttribute("Rec") then modelePlot:SetAttribute("Rec", "plot") end -- (ses copies passent au recyclage)
		return modelePlot
	end
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
	if modelePiece then modelePiece:SetAttribute("Rec", "piece") end -- (ses copies passent au recyclage)
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
-- (9/10, Sacha : « augmente la luminosité des fruits sur la route ») Le web rend 32 % de la couleur d'un fruit SANS lumière (LP_MAT.f,
-- gl .32 : « un bleu roi sort noir » sinon) ; Roblox n'a pas ce plancher, et la nuit de la ville avalait les fruits — mesuré au banc
-- (DbgVueFruit), la myrtille sortait NOIRE. Deux gestes pour le rendre :
-- · L'ÉCLAT : chaque facette relevée vers 0,98 de valeur (×2,4 au plus, l'ordre des teintes gardé : l'ombre reste plus sombre que
--   la lumière) et sa saturation poussée ; plus de reflet (il grisait la peau en renvoyant le ciel) ;
-- · LA COQUE DE NÉON : le même maillage, 6 % plus grand, en néon à 80 % transparent, soudé au fruit — la part « sans lumière » du
--   web, qui fait briller le fruit de loin sans noyer ses facettes (à 72 % on ne lisait plus qu'une tache). Elle part avec lui
--   quand on le croque (Parent = nil) et suit son battement (soudure).
local function eclatAuPlus(c: Color3, plafond: number): Color3
	local mx = math.max(c.R, c.G, c.B, 0.001)
	local f = math.clamp(0.98 / mx, 1, plafond)
	local h, s, v = Color3.new(math.min(1, c.R * f), math.min(1, c.G * f), math.min(1, c.B * f)):ToHSV()
	return Color3.fromHSV(h, 1 - (1 - s) ^ 1.5, v)
end
local function eclatFruit(c: Color3): Color3 return eclatAuPlus(c, 2.4) end
-- (banc) les fruits posés sur la route, pour DbgVueFruit (table faible : un fruit ramassé s'en va tout seul)
local fruitsPoses: { [BasePart]: { i: number, face: number } } = setmetatable({}, { __mode = "k" }) :: any
local function fruitModele(i: number): { p: BasePart, dy: number }?
	local m = modelesFruit[i]
	if m ~= nil then return m or nil end
	modelesFruit[i] = false
	local d = Objets.fruits[i]
	if not d then return nil end
	local mp, centre = Maillage.piece(d, M, { teinte = eclatFruit })
	if not mp then return nil end
	mp.Anchored = true
	mp.Massless = false
	mp.CastShadow = false
	mp.Material = Enum.Material.SmoothPlastic
	mp.Reflectance = 0
	local coque = mp:Clone()
	coque.Name = "Coque"
	coque.Material = Enum.Material.Neon
	coque.Transparency = 0.8
	coque.Size = mp.Size * 1.06
	coque.Anchored, coque.Massless, coque.CanCollide, coque.CanQuery, coque.CanTouch = false, true, false, false, false
	coque.CFrame = mp.CFrame
	local w = Instance.new("WeldConstraint")
	w.Part0, w.Part1 = mp, coque
	w.Parent = coque
	coque.Parent = mp
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
			p = Recyclage.copie(modele)
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
		p = Recyclage.copie(plotModele())
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
		fruitsPoses[p] = { i = o.fruit or 1, face = o.face or 1 }
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

-- ── (banc, 9/10) "DbgVueFruit" = une distance en mètres : la caméra se pose à cette distance du prochain fruit (dessus de la route)
-- et le regarde ; à sa gauche, le MÊME fruit aux couleurs brutes du web, sans coque (l'avant) — l'avant/après sous la même lumière,
-- dans la même photo. Rien de tout ça n'existe sans l'attribut.
do
	local RunService = game:GetService("RunService")
	local vise: BasePart? = nil
	local ecart = Vector3.zero
	local temoins: { Instance } = {}
	local function nettoie()
		for _, t in temoins do t:Destroy() end
		table.clear(temoins)
	end
	local function etiquette(p: BasePart, mot: string)
		local bb = Instance.new("BillboardGui")
		bb.Size = UDim2.fromOffset(160, 40)
		bb.StudsOffsetWorldSpace = Vector3.new(0, p.Size.Y * 0.7, 0)
		bb.AlwaysOnTop = true
		local t = Instance.new("TextLabel")
		t.Size = UDim2.fromScale(1, 1)
		t.BackgroundTransparency = 1
		t.Text = mot
		t.TextScaled = true
		t.Font = Enum.Font.GothamBold
		t.TextColor3 = Color3.new(1, 1, 1)
		t.TextStrokeTransparency = 0
		t.Parent = bb
		bb.Parent = p
		table.insert(temoins, bb)
	end
	local function temoin(i: number, teinte: ((Color3) -> Color3)?, cf: CFrame, mot: string): BasePart?
		local mp, centre = Maillage.piece(Objets.fruits[i], M, teinte and { teinte = teinte } or nil)
		if not mp then return nil end
		mp.Anchored, mp.CanCollide, mp.CanQuery, mp.CastShadow = true, false, false, false
		mp.Material = Enum.Material.SmoothPlastic
		mp.Reflectance = teinte and 0 or 0.06
		mp.CFrame = cf * CFrame.new(0, centre.Y - (fruitModele(i) :: any).dy, 0)
		mp.Parent = workspace
		etiquette(mp, mot)
		table.insert(temoins, mp)
		return mp
	end
	workspace:GetAttributeChangedSignal("DbgVueFruit"):Connect(function()
		RunService:UnbindFromRenderStep("CashCarDbgFruit")
		vise = nil
		nettoie()
		local d = workspace:GetAttribute("DbgVueFruit")
		if type(d) ~= "number" then return end
		-- après la caméra du jeu (Pilote : Camera + 1) : la vue imposée a le dernier mot
		RunService:BindToRenderStep("CashCarDbgFruit", Enum.RenderPriority.Camera.Value + 2, function()
			local cam = workspace.CurrentCamera
			if not (vise and vise.Parent) then
				nettoie()
				vise = nil
				local best = math.huge
				for p, info in fruitsPoses do
					local v = p.Position - cam.CFrame.Position
					if info.face == 1 and p.Parent and v:Dot(cam.CFrame.LookVector) > 0 and v.Magnitude < best then best, vise = v.Magnitude, p end
				end
				local p = vise
				if not p then return end
				local info = fruitsPoses[p]
				ecart = (cam.CFrame.Position - p.Position).Unit * d * M
				local cf = p.CFrame
				local pas = (fruitModele(info.i) :: any).p.Size.X * 1.5
				etiquette(p, "ACTUEL")
				temoin(info.i, nil, cf * CFrame.new(-pas, 0, 0), "AVANT")
			end
			local p = vise :: BasePart
			cam.CFrame = CFrame.lookAt(p.Position + ecart, p.Position - p.CFrame.RightVector * ((fruitModele(fruitsPoses[p].i) :: any).p.Size.X * 0.75))
			cam.FieldOfView = 50
		end)
	end)
end

return Construction
