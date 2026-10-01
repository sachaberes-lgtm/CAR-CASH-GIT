--!native
--!optimize 2
-- CASH CAR — LA MER DE NUAGES. Dans le jeu web (merZ) c'est un plancher de cumulus dessiné par le shader du ciel,
-- ~420 m sous la route : presque plein, de rares trous bleus, des dômes crème éclairés du côté du soleil, des
-- creux bleutés, et la brume qui avale le lointain. Roblox n'a pas de shader (et son Sky refuse une image peinte
-- par code — essayé) : la mer est donc un VRAI RELIEF, un damier de maillages bosselés qui suit la caisse,
-- habillé d'UNE image peinte au lancement avec les formules du web (bruit en « bourrelets », lumière prise vers
-- le soleil, creux assombris, trous).
--   · le relief et l'image se répètent tous les 8 000 studs (3,2 km) : on déplace les dalles, jamais la matière ;
--   · chaque dalle reste FIXE dans le monde tant qu'elle est dans la fenêtre autour de la vue (tuile torique) :
--     la parallaxe est juste, la mer n'a pas de bord ;
--   · DEUX couronnes : 8 × 8 dalles fines sous la vue (±3,2 km), 16 × 16 dalles grossières autour (±6,4 km),
--     puis un grand plateau uni que la brume achève — vue de haut (le menu), la mer va jusqu'à l'horizon ;
--   · la mer reste ~380 m sous la caisse en course (la route plonge de plusieurs km par zone), 620 m au menu.
-- Si l'appareil refuse les maillages : les dômes blancs de la 1re version (rien ne casse).
local AssetService = game:GetService("AssetService")
local Lighting = game:GetService("Lighting")
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local M = Config.M

local Mer = { pret = false }

local T = 2000          -- studs : le côté d'une dalle
local NT = 4            -- dalles par période
local D = T * NT        -- la période du relief
local NP = 8            -- dalles FINES par côté (8 × 8 = 64, ±8 000 studs)
local P = T * NP
local NPL = 16          -- dalles GROSSIÈRES par côté (16 × 16, ±16 000 studs ; celles sous les fines sont cachées)
local PL = T * NPL
local G = 20            -- carreaux par côté d'une dalle fine
local GL = 5            -- … d'une dalle grossière
local JUPE = 140        -- studs : la jupe qui pend au bord de chaque dalle (aucun jour entre deux finesses)
local N = 1024          -- l'image
local AMP = 150         -- studs : le relief, du creux au sommet (plus haut, la mer devenait une chaîne de montagnes)
local SOUS = 380 * M    -- la mer sous la caisse

local dossier: Folder
local dalles: { { p: BasePart, ox: number, oz: number } } = {}
local loin: { { p: BasePart, ox: number, oz: number } } = {}
local plateau: BasePart? = nil
local pieces: { BasePart } = {}
local poses: { CFrame } = {}
local cleVue = ""
local domes: { { p: BasePart, ox: number, oz: number, dy: number } } = {}
local yMer = nil :: number?

-- ── le bruit : quatre octaves de bruit de valeur, PÉRIODIQUES (la mer se raccorde à elle-même) ──
local function tables(rnd: Random): { [number]: { number } }
	local t = {}
	for o = 0, 4 do
		local per = 8 * 2 ^ o
		local l = table.create(per * per)
		for k = 1, per * per do l[k] = rnd:NextNumber() end
		t[o] = l
	end
	return t
end
local function bruit(l: { number }, per: number, x: number, y: number): number
	local i, j = math.floor(x), math.floor(y)
	local fx, fy = x - i, y - j
	fx = fx * fx * (3 - 2 * fx)
	fy = fy * fy * (3 - 2 * fy)
	local i0, j0 = i % per, j % per
	local i1, j1 = (i0 + 1) % per, (j0 + 1) % per
	local a, b = l[j0 * per + i0 + 1], l[j0 * per + i1 + 1]
	local c, d = l[j1 * per + i0 + 1], l[j1 * per + i1 + 1]
	return a + (b - a) * fx + (c - a + (a - b - c + d) * fx) * fy
end

-- le champ de hauteurs H (0..1, négatif dans les trous) sur la période, N × N, dans un buffer de flottants
local function champ(graine: number, ceder: () -> ()): buffer
	local rnd = Random.new(graine + 4127)
	local TB = tables(rnd)
	local TW = tables(rnd) -- la déformation du domaine et les trous
	local h = buffer.create(N * N * 4)
	local amp = { [0] = 0.46, 0.28, 0.16, 0.10 }
	for y = 0, N - 1 do
		local v = y / N
		for x = 0, N - 1 do
			local u = x / N
			-- le domaine se tord d'un quart de cellule : les dômes perdent leur quadrillage
			local wu = u * 8 + (bruit(TW[1], 16, u * 16, v * 16) - 0.5) * 0.5
			local wv = v * 8 + (bruit(TW[1], 16, u * 16 + 3.7, v * 16 + 1.3) - 0.5) * 0.5
			local s = 0
			for o = 0, 3 do
				local k = 2 ^ o
				local n = bruit(TB[o], 8 * k, wu * k, wv * k)
				-- le BOURRELET : |2n − 1| — des plis (adoucis : à vif, on lisait des crêtes de glacier) et des bosses rondes entre eux
				local pli = 2 * n - 1
				s += amp[o] * (math.sqrt(pli * pli + 0.012) - 0.1)
			end
			s = math.min(1, s * 1.75)
			-- les rares TROUS (un grand bruit) : la mer s'y creuse
			local gros = bruit(TW[0], 8, u * 8 + 0.4, v * 8 + 0.9)
			local trou = 1 - math.clamp((gros - 0.09) / 0.12, 0, 1)
			trou = trou * trou * (3 - 2 * trou)
			buffer.writef32(h, (y * N + x) * 4, s * (1 - trou) - trou * 0.35)
		end
		if y % 24 == 23 then ceder() end
	end
	return h
end
local function H(h: buffer, x: number, y: number): number
	return buffer.readf32(h, ((y % N) * N + (x % N)) * 4)
end

-- l'image : sommets crème, ombres bleutées prises du côté opposé au soleil, creux assombris, trous d'azur
local function peindre(h: buffer, soleil: Vector3, ceder: () -> ()): buffer
	local C = Config.CIEL
	local sommet, ombre, trouC = C.merSommet, C.merOmbre, C.merTrou
	local sx, sz = soleil.X, soleil.Z
	local l = math.sqrt(sx * sx + sz * sz)
	if l < 0.01 then sx, sz = 1, 0 else sx, sz = sx / l, sz / l end
	local ex, ez = math.round(sx * 3), math.round(sz * 3)
	local px = buffer.create(N * N * 4)
	for y = 0, N - 1 do
		for x = 0, N - 1 do
			local a = H(h, x, y)
			-- la pente VERS le soleil : si le relief descend vers lui, la facette le regarde
			local lum = math.clamp(0.55 + 13 * (a - H(h, x + ex, y + ez)) + 0.6 * (a - 0.35), 0, 1)
			lum = lum * lum * (3 - 2 * lum) -- (une courbe franche : à contraste doux, tout sortait blanc laiteux)
			local creux = 1 - 0.16 * (1 - math.clamp(a / 0.22, 0, 1))
			local r = (ombre.R + (sommet.R - ombre.R) * lum) * creux
			local g = (ombre.G + (sommet.G - ombre.G) * lum) * creux
			local b = (ombre.B + (sommet.B - ombre.B) * lum) * (0.5 + 0.5 * creux)
			if a < 0 then
				local t = math.min(1, -a / 0.25)
				r += (trouC.R - r) * t
				g += (trouC.G - g) * t
				b += (trouC.B - b) * t
			end
			local o = (y * N + x) * 4
			buffer.writeu8(px, o, math.clamp(r * 255, 0, 255))
			buffer.writeu8(px, o + 1, math.clamp(g * 255, 0, 255))
			buffer.writeu8(px, o + 2, math.clamp(b * 255, 0, 255))
			buffer.writeu8(px, o + 3, 255)
		end
		if y % 32 == 31 then ceder() end
	end
	return px
end

-- le relief d'une dalle : H adouci (les grands dômes seulement — le détail fin est dans l'image)
local function doux(h: buffer, x: number, y: number): number
	local s = 0
	for j = -2, 2 do
		for i = -2, 2 do s += H(h, x + i * 4, y + j * 4) end
	end
	return s / 25
end

local dalle0
local function dalle(h: buffer, ti: number, tj: number, image: any, G: number): MeshPart?
	-- (un seul atelier de maillages à la fois : voir Maillage.seul)
	return require(script.Parent:WaitForChild("Maillage")).seul(dalle0, h, ti, tj, image, G)
end
dalle0 = function(h: buffer, ti: number, tj: number, image: any, G: number): MeshPart?
	local ok, em = pcall(function() return AssetService:CreateEditableMesh() end)
	if not ok or not em then return nil end
	local parTuile = N / NT
	local ids, uvs, nrm = {}, {}, {}
	local pos: { [number]: Vector3 } = {}
	for b = 0, G do
		for a = 0, G do
			local x, y = math.round((ti + a / G) * parTuile), math.round((tj + b / G) * parTuile)
			local hh = doux(h, x, y)
			local k = b * (G + 1) + a
			pos[k] = Vector3.new((a / G - 0.5) * T, (hh - 0.3) * AMP, (b / G - 0.5) * T)
			ids[k] = em:AddVertex(pos[k])
			uvs[k] = em:AddUV(Vector2.new((ti + a / G) / NT, (tj + b / G) / NT))
			-- la normale se lit dans le champ (au-delà du bord de la dalle aussi : aucune couture de lumière)
			local pas = 6
			local dx = (doux(h, x + pas, y) - doux(h, x - pas, y)) * AMP / (2 * pas * D / N)
			local dz = (doux(h, x, y + pas) - doux(h, x, y - pas)) * AMP / (2 * pas * D / N)
			nrm[k] = em:AddNormal(Vector3.new(-dx, 1, -dz).Unit)
		end
	end
	for b = 0, G - 1 do
		for a = 0, G - 1 do
			local k00, k10 = b * (G + 1) + a, b * (G + 1) + a + 1
			local k01, k11 = (b + 1) * (G + 1) + a, (b + 1) * (G + 1) + a + 1
			for _, tri in { { k00, k01, k10 }, { k10, k01, k11 } } do
				local f = em:AddTriangle(ids[tri[1]], ids[tri[2]], ids[tri[3]])
				em:SetFaceUVs(f, { uvs[tri[1]], uvs[tri[2]], uvs[tri[3]] })
				em:SetFaceNormals(f, { nrm[tri[1]], nrm[tri[2]], nrm[tri[3]] })
			end
		end
	end
	-- la JUPE : le bord de la dalle se prolonge vers le bas (mêmes couleurs, même lumière que le bord)
	local function jupe(k0: number, k1: number)
		local w0 = em:AddVertex(pos[k0] - Vector3.new(0, JUPE, 0))
		local w1 = em:AddVertex(pos[k1] - Vector3.new(0, JUPE, 0))
		for _, tri in { { ids[k0], w0, ids[k1], k0, k0, k1 }, { ids[k1], w0, w1, k1, k0, k1 } } do
			local f = em:AddTriangle(tri[1], tri[2], tri[3])
			em:SetFaceUVs(f, { uvs[tri[4]], uvs[tri[5]], uvs[tri[6]] })
			em:SetFaceNormals(f, { nrm[tri[4]], nrm[tri[5]], nrm[tri[6]] })
		end
	end
	for a = 0, G - 1 do
		jupe(a, a + 1)
		jupe(G * (G + 1) + a, G * (G + 1) + a + 1)
		jupe(a * (G + 1), (a + 1) * (G + 1))
		jupe(a * (G + 1) + G, (a + 1) * (G + 1) + G)
	end
	local okF, fige = pcall(function() return AssetService:CreateEditableMeshAsync(Content.fromObject(em), { FixedSize = true }) end)
	if okF and fige then
		em:Destroy()
		em = fige
	end
	local okP, mp = pcall(function()
		return AssetService:CreateMeshPartAsync(Content.fromObject(em), { CollisionFidelity = Enum.CollisionFidelity.Box })
	end)
	if not okP or not mp then return nil end
	mp.Anchored = true
	mp.CanCollide = false
	mp.CanQuery = false
	mp.CanTouch = false
	mp.CastShadow = false
	mp.Material = Enum.Material.Plastic -- (mat : en lisse, le soleil y posait des reflets de neige glacée)
	mp.Color = Color3.new(1, 1, 1)
	mp.DoubleSided = true -- (la jupe se voit des deux côtés)
	if image then mp.TextureContent = Content.fromObject(image) end
	return mp
end

-- les dômes de secours (1re version) : si les maillages sont refusés
local function secours(graine: number)
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
		table.insert(domes, { p = p, ox = rnd:NextNumber(0, 7600), oz = rnd:NextNumber(0, 7600), dy = rnd:NextNumber(-90, 50) })
	end
end

function Mer.creer(graine: number)
	dossier = Instance.new("Folder")
	dossier.Name = "MerDeNuages"
	dossier.Parent = workspace
	task.spawn(function()
		local t0 = os.clock()
		local function ceder()
			if os.clock() - t0 > 0.012 then
				task.wait()
				t0 = os.clock()
			end
		end
		local h = champ(graine, ceder)
		local image = nil
		-- LE BUDGET : les images et les maillages modifiables se partagent une réserve de mémoire. L'image de la mer en prenait
		-- 4 Mo à elle seule (1024²) : assez pour que les nuages ou un moteur soient refusés. On la peint en grand, on la rend à
		-- 512² (moyenne de 2 × 2) : la mer est à des centaines de mètres sous la route, elle n'y perd rien.
		local D2 = N // 2
		local okI, im = pcall(function() return AssetService:CreateEditableImage({ Size = Vector2.new(D2, D2) }) end)
		if okI and im then
			local soleil = Lighting:GetSunDirection()
			local grand = peindre(h, soleil, ceder)
			local petit = buffer.create(D2 * D2 * 4)
			for y = 0, D2 - 1 do
				for x = 0, D2 - 1 do
					local a, b = ((y * 2) * N + x * 2) * 4, ((y * 2 + 1) * N + x * 2) * 4
					for c = 0, 2 do
						buffer.writeu8(petit, (y * D2 + x) * 4 + c, (buffer.readu8(grand, a + c) + buffer.readu8(grand, a + 4 + c) + buffer.readu8(grand, b + c) + buffer.readu8(grand, b + 4 + c)) // 4)
					end
					buffer.writeu8(petit, (y * D2 + x) * 4 + 3, 255)
				end
				if y % 64 == 63 then ceder() end
			end
			im:WritePixelsBuffer(Vector2.zero, Vector2.new(D2, D2), petit)
			image = im
		end
		-- les 16 dalles de la période, en deux finesses, puis leurs copies
		local modeles: { [number]: MeshPart } = {}
		local modelesL: { [number]: MeshPart } = {}
		for tj = 0, NT - 1 do
			for ti = 0, NT - 1 do
				local mp = image and dalle(h, ti, tj, image, G)
				local ml = mp and dalle(h, ti, tj, image, GL)
				if not mp or not ml then
					for _, m in modeles do m:Destroy() end
					for _, m in modelesL do m:Destroy() end
					if mp then mp:Destroy() end
					secours(graine)
					Mer.pret = true
					return
				end
				modeles[tj * NT + ti] = mp
				modelesL[tj * NT + ti] = ml
				ceder()
			end
		end
		for J = 0, NP - 1 do
			for I = 0, NP - 1 do
				local src = modeles[(J % NT) * NT + (I % NT)]
				local p = (I < NT and J < NT) and src or src:Clone()
				p.Name = "Dalle"
				p.Parent = dossier
				table.insert(dalles, { p = p, ox = (I + 0.5) * T, oz = (J + 0.5) * T })
			end
		end
		for J = 0, NPL - 1 do
			for I = 0, NPL - 1 do
				local src = modelesL[(J % NT) * NT + (I % NT)]
				local p = (I < NT and J < NT) and src or src:Clone()
				p.Name = "DalleLoin"
				p.Parent = dossier
				table.insert(loin, { p = p, ox = (I + 0.5) * T, oz = (J + 0.5) * T })
			end
		end
		-- le PLATEAU : au-delà des dalles, une nappe unie à la couleur moyenne de la mer, que la brume achève
		local C = Config.CIEL
		local pl = Instance.new("Part")
		pl.Name = "Plateau"
		pl.Anchored = true
		pl.CanCollide = false
		pl.CanQuery = false
		pl.CanTouch = false
		pl.CastShadow = false
		pl.Material = Enum.Material.SmoothPlastic
		pl.Size = Vector3.new(2048, 4, 2048)
		pl.Color = C.merOmbre:Lerp(C.merSommet, 0.62)
		local bm = Instance.new("SpecialMesh")
		bm.MeshType = Enum.MeshType.Brick
		bm.Scale = Vector3.new(120, 1, 120)
		bm.Parent = pl
		pl.Parent = dossier
		plateau = pl
		Mer.pret = true
	end)
end

-- à chaque image : camPos = la caméra, yCaisse = l'altitude de la caisse (studs)
function Mer.suivre(camPos: Vector3, yCaisse: number, dt: number, sous: number?)
	if not dossier then return end
	local cible = yCaisse - (sous or SOUS)
	-- la mer descend avec la caisse, mais en douceur (un saut de portail la recale d'un coup)
	if not yMer or math.abs(cible - yMer) > 600 * M then
		yMer = cible
	else
		yMer = (yMer :: number) + (cible - (yMer :: number)) * math.min(1, dt * 0.8)
	end
	local y = math.round((yMer :: number) / 3) * 3
	-- rien ne bouge tant que la vue reste sur la même dalle et que la mer garde son niveau
	local cle = math.floor(camPos.X / T) .. "," .. math.floor(camPos.Z / T) .. "," .. y .. "," .. #dalles
	if cle ~= cleVue then
		cleVue = cle
		table.clear(pieces)
		table.clear(poses)
		local cx, cz = (math.floor(camPos.X / T) + 0.5) * T, (math.floor(camPos.Z / T) + 0.5) * T
		local demi = P / 2
		for _, d in dalles do
			local x = cx - demi + ((d.ox - cx + demi) % P)
			local z = cz - demi + ((d.oz - cz + demi) % P)
			table.insert(pieces, d.p)
			table.insert(poses, CFrame.new(x, y, z))
		end
		local demiL = PL / 2
		for _, d in loin do
			local x = cx - demiL + ((d.ox - cx + demiL) % PL)
			local z = cz - demiL + ((d.oz - cz + demiL) % PL)
			-- sous les dalles fines, la grossière s'efface (elle plonge loin dessous)
			local dessous = x >= cx - demi and x < cx + demi and z >= cz - demi and z < cz + demi
			table.insert(pieces, d.p)
			table.insert(poses, CFrame.new(x, dessous and y - 6000 or y, z))
		end
		if plateau then
			table.insert(pieces, plateau)
			table.insert(poses, CFrame.new(cx, y - 0.3 * AMP - JUPE * 0.5, cz))
		end
		if #pieces > 0 then workspace:BulkMoveTo(pieces, poses, Enum.BulkMoveMode.FireCFrameChanged) end
	end
	if #domes > 0 then
		for _, d in domes do
			local x = camPos.X - 3800 + ((d.ox - camPos.X + 3800) % 7600)
			local z = camPos.Z - 3800 + ((d.oz - camPos.Z + 3800) % 7600)
			d.p.CFrame = CFrame.new(x, y + d.dy, z)
		end
	end
end

return Mer
