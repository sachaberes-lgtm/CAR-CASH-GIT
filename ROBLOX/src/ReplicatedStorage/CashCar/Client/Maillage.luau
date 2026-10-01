-- CASH CAR — LES MAILLAGES. Le jeu web modèle tout en facettes colorées (caisses, moteurs, fruits, nuages) ;
-- ici on rend ces mêmes triangles à Roblox avec un EditableMesh : mêmes sommets, mêmes couleurs, une normale
-- par FACE (chaque coin a son sommet : pas de lissage, c'est le style du jeu).
--
-- Format cuit (voir outils/cuire-caisses.js) : { v = base64, t = base64 }
--   v : 10 octets par sommet unique — x, y, z en int16 (demi-millimètres), r, g, b, puis m = le MASQUE de la peinture
--       (0 : ce sommet n'est pas de la laque ; 1-255 : la lumière que l'ombre cuite lui laisse — la boutique repeint par là)
--   t : 3 × uint16 par triangle (indices dans v)
-- Maillage.piece(donnees, echelle, options) rend un MeshPart prêt à poser (ou nil si Roblox refuse : budget
-- mémoire épuisé, appareil trop ancien — l'appelant garde alors son modèle de secours en blocs).
local AssetService = game:GetService("AssetService")

local Maillage = {}

-- ── base64 → buffer ──
local TABLE = table.create(256, 0)
do
	local alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	for i = 1, 64 do TABLE[string.byte(alpha, i)] = i - 1 end
end
local function decoder(s: string): buffer
	local n = #s
	local pad = 0
	if n >= 1 and string.byte(s, n) == 61 then pad += 1 end
	if n >= 2 and string.byte(s, n - 1) == 61 then pad += 1 end
	local len = n // 4 * 3 - pad
	local out = buffer.create(math.max(len, 0))
	local o = 0
	for i = 1, n, 4 do
		local a, b, c, d = string.byte(s, i, i + 3)
		local x = TABLE[a] * 262144 + TABLE[b] * 4096 + TABLE[c or 61] * 64 + TABLE[d or 61]
		if o < len then buffer.writeu8(out, o, bit32.rshift(x, 16)) end
		if o + 1 < len then buffer.writeu8(out, o + 1, bit32.band(bit32.rshift(x, 8), 255)) end
		if o + 2 < len then buffer.writeu8(out, o + 2, bit32.band(x, 255)) end
		o += 3
	end
	return out
end
Maillage.decoder = decoder

-- UN SEUL ATELIER À LA FOIS. Roblox donne un BUDGET de mémoire aux maillages modifiables : tant qu'il n'est pas figé, un
-- EditableMesh en réserve beaucoup. Deux zones qui se bâtissent en même temps, la mer, les nuages, les objets : à plusieurs
-- ateliers de front, le budget sautait (« Failed to create EditableMesh … memory budget limits »). Tout ce qui fabrique un
-- maillage passe par ici : on attend son tour, on bâtit, on fige, on rend la place.
local atelierPris = false
function Maillage.seul(f: (...any) -> ...any, ...: any): ...any
	while atelierPris do task.wait() end
	atelierPris = true
	local r = table.pack(pcall(f, ...))
	atelierPris = false
	if not r[1] then
		warn("[CashCar] atelier : " .. tostring(r[2]))
		return nil
	end
	return table.unpack(r, 2, r.n)
end

-- (banc) CE QU'IL RESTE DU BUDGET : on fabrique des maillages figés de 1 000 triangles jusqu'au refus, puis on rend tout.
-- Écrit le résultat dans la Sortie. À lancer au menu, une fois tout bâti (Config.BANC_BUDGET).
function Maillage.mesurer(etiquette: string)
	-- trois façons de bâtir ~1 000 triangles : sommets NON partagés · sommets partagés · partagés + une normale par face
	local function essai(nom: string, batir: (any) -> ())
		Maillage.seul(function()
			local garde, n = {}, 0
			while n < 900 do
				local ok, em = pcall(function() return AssetService:CreateEditableMesh() end)
				if not ok or not em then break end
				batir(em)
				local okF, fige = pcall(function() return AssetService:CreateEditableMeshAsync(Content.fromObject(em), { FixedSize = true }) end)
				em:Destroy()
				if not okF or not fige then break end
				table.insert(garde, fige)
				n += 1
				if n % 20 == 0 then task.wait() end
			end
			warn(string.format("[CashCar] BUDGET %s — %s : %d maillages de ~1 000 triangles avant refus", etiquette, nom, n))
			for _, f in garde do f:Destroy() end
		end)
		task.wait(0.5)
	end
	for _, nt in { 100, 1000, 4000 } do
		essai(nt .. " triangles par maillage", function(em)
			for i = 1, nt do
				em:AddTriangle(em:AddVertex(Vector3.new(i, 0, 0)), em:AddVertex(Vector3.new(i, 1, 0)), em:AddVertex(Vector3.new(i, 0, 1)))
			end
		end)
	end
end

local PAS = 10 -- octets par sommet
export type Peinture = { c: Color3?, grad: { Color3 }? } -- une teinte unie, ou un dégradé de trois couleurs du bas de caisse au toit
export type Options = {
	peinture: Peinture?,     -- la peinture de la boutique : elle recouvre la laque (là où le masque le dit)
	miroir: boolean?,        -- retourne le maillage en X (les roues de gauche)
	couleur: Color3?,        -- ne garde QUE les facettes de cette couleur (les feux : une pièce Néon par couleur)
	teinte: ((Color3) -> Color3)?, -- repeint les couleurs au passage (la peinture de la boutique)
}

-- la couleur d'un sommet et sa clé (les sommets de même couleur partagent la leur) : la laque d'origine, ou la PEINTURE
-- de la boutique × l'ombre cuite. Un dégradé se lit sur la hauteur (y en mètres : du bas de caisse 0,35 au toit 1,70).
local function couleurDe(v: buffer, o: number, peinture: Peinture?): (number, Color3)
	local m = buffer.readu8(v, o + 9)
	if peinture and m > 0 then
		local base: Color3
		local cle = 16777216 + m
		if peinture.grad then
			local y = buffer.readi16(v, o + 2) / 2000
			local u = math.clamp((y - 0.35) / 1.35, 0, 1)
			local q = math.floor(u * 24 + 0.5)
			u = q / 24
			local g = peinture.grad
			base = (u < 0.5) and g[1]:Lerp(g[2], u * 2) or g[2]:Lerp(g[3], (u - 0.5) * 2)
			cle += (q + 1) * 256
		else
			base = peinture.c :: Color3
		end
		local k = m / 255
		return cle, Color3.new(base.R * k, base.G * k, base.B * k)
	end
	local r, g, b = buffer.readu8(v, o + 6), buffer.readu8(v, o + 7), buffer.readu8(v, o + 8)
	return r * 65536 + g * 256 + b, Color3.fromRGB(r, g, b)
end

-- les couleurs distinctes d'un maillage (pour découper les feux par couleur)
function Maillage.couleurs(d: { v: string, t: string }): { Color3 }
	local v = decoder(d.v)
	local vus, liste = {}, {}
	for i = 0, buffer.len(v) - PAS, PAS do
		local cle = buffer.readu8(v, i + 6) * 65536 + buffer.readu8(v, i + 7) * 256 + buffer.readu8(v, i + 8)
		if not vus[cle] then
			vus[cle] = true
			table.insert(liste, Color3.fromRGB(buffer.readu8(v, i + 6), buffer.readu8(v, i + 7), buffer.readu8(v, i + 8)))
		end
	end
	return liste
end

-- Rend un EditableMesh (ou nil) et son CENTRE. echelle = studs par mètre.
-- ⚠ Le maillage est bâti CENTRÉ sur sa boîte (Roblox pose un MeshPart par le centre de sa boîte) : la pièce se place
-- donc à repère × CFrame.new(centre) pour que chaque sommet retombe où le jeu web l'a mis.
function Maillage.editable(d: { v: string, t: string }, echelle: number, opt: Options?): (any, Vector3)
	local ok, em = pcall(function() return AssetService:CreateEditableMesh() end)
	if not ok or not em then
		warn("[CashCar] maillage refusé (budget de mémoire) : " .. tostring(em))
		return nil, Vector3.zero
	end
	local v, t = decoder(d.v), decoder(d.t)
	local k = echelle / 2000
	local sx = (opt and opt.miroir) and -1 or 1
	local filtre = opt and opt.couleur
	local fcle = filtre and (math.floor(filtre.R * 255 + 0.5) * 65536 + math.floor(filtre.G * 255 + 0.5) * 256 + math.floor(filtre.B * 255 + 0.5))
	local teinte = opt and opt.teinte
	local peinture = opt and opt.peinture
	local couleurs: { [number]: number } = {}
	local nb = 0
	-- 1re passe : la boîte des facettes gardées
	local mnx, mny, mnz, mxx, mxy, mxz = math.huge, math.huge, math.huge, -math.huge, -math.huge, -math.huge
	for i = 0, buffer.len(t) - 6, 6 do
		local ia = buffer.readu16(t, i) * PAS
		local ca = buffer.readu8(v, ia + 6) * 65536 + buffer.readu8(v, ia + 7) * 256 + buffer.readu8(v, ia + 8)
		if not fcle or ca == fcle then
			for j = 0, 4, 2 do
				local o = buffer.readu16(t, i + j) * PAS
				local x, y, z = buffer.readi16(v, o) * k * sx, buffer.readi16(v, o + 2) * k, buffer.readi16(v, o + 4) * k
				mnx, mny, mnz = math.min(mnx, x), math.min(mny, y), math.min(mnz, z)
				mxx, mxy, mxz = math.max(mxx, x), math.max(mxy, y), math.max(mxz, z)
			end
		end
	end
	if mnx == math.huge then
		em:Destroy()
		return nil, Vector3.zero
	end
	local centre = Vector3.new((mnx + mxx) / 2, (mny + mxy) / 2, (mnz + mxz) / 2)
	for i = 0, buffer.len(t) - 6, 6 do
		local ia, ib, ic = buffer.readu16(t, i) * PAS, buffer.readu16(t, i + 2) * PAS, buffer.readu16(t, i + 4) * PAS
		if sx < 0 then ib, ic = ic, ib end -- un miroir retourne le sens des faces
		local ca = buffer.readu8(v, ia + 6) * 65536 + buffer.readu8(v, ia + 7) * 256 + buffer.readu8(v, ia + 8)
		if not fcle or ca == fcle then
			local ids = table.create(3)
			local cids = table.create(3)
			for n, o in { ia, ib, ic } do
				ids[n] = em:AddVertex(Vector3.new(buffer.readi16(v, o) * k * sx, buffer.readi16(v, o + 2) * k, buffer.readi16(v, o + 4) * k) - centre)
				local cc, c3 = couleurDe(v, o, peinture)
				local cid = couleurs[cc]
				if not cid then
					if teinte then c3 = teinte(c3) end
					cid = em:AddColor(c3, 1)
					couleurs[cc] = cid
				end
				cids[n] = cid
			end
			local f = em:AddTriangle(ids[1], ids[2], ids[3])
			em:SetFaceColors(f, cids)
			nb += 1
		end
	end
	if nb == 0 then
		em:Destroy()
		return nil, Vector3.zero
	end
	return em, centre
end

-- Plusieurs maillages cuits en UN seul EditableMesh (les vignettes du garage : la caisse entière et ses quatre
-- roues en une pièce — un maillage par vignette au lieu de dix). liste = { { d = donnees, cf = CFrame?, miroir = bool? } }
local function fusion(liste: { any }, echelle: number, teinte: ((Color3) -> Color3)?): (MeshPart?, Vector3)
	local ok, em = pcall(function() return AssetService:CreateEditableMesh() end)
	if not ok or not em then return nil, Vector3.zero end
	local k = echelle / 2000
	local pts: { Vector3 } = {}
	local cols: { number } = {}
	local mn, mx = Vector3.new(math.huge, math.huge, math.huge), Vector3.new(-math.huge, -math.huge, -math.huge)
	for _, e in liste do
		local v, t = decoder(e.d.v), decoder(e.d.t)
		local sx = e.miroir and -1 or 1
		local cf = e.cf or CFrame.identity
		for i = 0, buffer.len(t) - 6, 6 do
			local o1, o2, o3 = buffer.readu16(t, i) * PAS, buffer.readu16(t, i + 2) * PAS, buffer.readu16(t, i + 4) * PAS
			if sx < 0 then o2, o3 = o3, o2 end
			for _, o in { o1, o2, o3 } do
				local p = cf * Vector3.new(buffer.readi16(v, o) * k * sx, buffer.readi16(v, o + 2) * k, buffer.readi16(v, o + 4) * k)
				table.insert(pts, p)
				table.insert(cols, buffer.readu8(v, o + 6) * 65536 + buffer.readu8(v, o + 7) * 256 + buffer.readu8(v, o + 8))
				mn, mx = mn:Min(p), mx:Max(p)
			end
		end
	end
	if #pts == 0 then
		em:Destroy()
		return nil, Vector3.zero
	end
	local centre = (mn + mx) / 2
	local cids: { [number]: number } = {}
	for i = 1, #pts, 3 do
		local a, b, c = em:AddVertex(pts[i] - centre), em:AddVertex(pts[i + 1] - centre), em:AddVertex(pts[i + 2] - centre)
		local f = em:AddTriangle(a, b, c)
		local ids = table.create(3)
		for n = 0, 2 do
			local cc = cols[i + n]
			local cid = cids[cc]
			if not cid then
				local c3 = Color3.fromRGB(bit32.rshift(cc, 16), bit32.band(bit32.rshift(cc, 8), 255), bit32.band(cc, 255))
				if teinte then c3 = teinte(c3) end
				cid = em:AddColor(c3, 1)
				cids[cc] = cid
			end
			ids[n + 1] = cid
		end
		em:SetFaceColors(f, ids)
	end
	local okF, fige = pcall(function() return AssetService:CreateEditableMeshAsync(Content.fromObject(em), { FixedSize = true }) end)
	if okF and fige then
		em:Destroy()
		em = fige
	end
	local okP, mp = pcall(function()
		return AssetService:CreateMeshPartAsync(Content.fromObject(em), { CollisionFidelity = Enum.CollisionFidelity.Box })
	end)
	if not okP or not mp then return nil, Vector3.zero end
	mp.Anchored = true
	mp.CanCollide = false
	mp.CanQuery = false
	mp.CanTouch = false
	mp.DoubleSided = true
	return mp, centre
end

-- Rend un MeshPart (ou nil) et le centre où le poser. ⚠ appelle CreateMeshPartAsync : à lancer hors de la boucle de rendu.
local function piece(d: { v: string, t: string }, echelle: number, opt: Options?): (MeshPart?, Vector3)
	local em, centre = Maillage.editable(d, echelle, opt)
	if not em then return nil, Vector3.zero end
	-- ⚠ LE BUDGET : un EditableMesh qu'on peut encore modifier réserve beaucoup de mémoire (Roblox en refuse vite de
	-- nouveaux : « memory budget limits »). Une fois bâti, on en tire une copie FIGÉE (FixedSize), bien plus légère,
	-- et on rend l'atelier tout de suite.
	local okF, fige = pcall(function()
		return AssetService:CreateEditableMeshAsync(Content.fromObject(em), { FixedSize = true })
	end)
	if okF and fige then
		em:Destroy()
		em = fige
	end
	local ok, mp = pcall(function()
		return AssetService:CreateMeshPartAsync(Content.fromObject(em), { CollisionFidelity = Enum.CollisionFidelity.Box })
	end)
	if not ok or not mp then
		warn("[CashCar] maillage refusé : " .. tostring(mp))
		return nil, Vector3.zero
	end
	mp.Anchored = false
	mp.CanCollide = false
	mp.CanQuery = false
	mp.CanTouch = false
	mp.Massless = true
	mp.DoubleSided = true -- les matières du kit sont en double face dans le jeu web
	return mp, centre
end
function Maillage.piece(d: { v: string, t: string }, echelle: number, opt: Options?): (MeshPart?, Vector3)
	local mp, centre = Maillage.seul(piece, d, echelle, opt)
	return mp, centre or Vector3.zero
end
function Maillage.fusion(liste: { any }, echelle: number, teinte: ((Color3) -> Color3)?): (MeshPart?, Vector3)
	local mp, centre = Maillage.seul(fusion, liste, echelle, teinte)
	return mp, centre or Vector3.zero
end

return Maillage
