-- CASH CAR — LES MAILLAGES. Le jeu web modèle tout en facettes colorées (caisses, moteurs, fruits, nuages) ;
-- ici on rend ces mêmes triangles à Roblox avec un EditableMesh : mêmes sommets, mêmes couleurs, une normale
-- par FACE (chaque coin a son sommet : pas de lissage, c'est le style du jeu).
--
-- Format cuit (voir outils/cuire-caisses.js) : { v = base64, t = base64 }
--   v : 9 octets par sommet unique — x, y, z en int16 (demi-millimètres) puis r, g, b
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

export type Options = {
	miroir: boolean?,        -- retourne le maillage en X (les roues de gauche)
	couleur: Color3?,        -- ne garde QUE les facettes de cette couleur (les feux : une pièce Néon par couleur)
	teinte: ((Color3) -> Color3)?, -- repeint les couleurs au passage (la peinture de la boutique)
}

-- les couleurs distinctes d'un maillage (pour découper les feux par couleur)
function Maillage.couleurs(d: { v: string, t: string }): { Color3 }
	local v = decoder(d.v)
	local vus, liste = {}, {}
	for i = 0, buffer.len(v) - 9, 9 do
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
	if not ok or not em then return nil, Vector3.zero end
	local v, t = decoder(d.v), decoder(d.t)
	local k = echelle / 2000
	local sx = (opt and opt.miroir) and -1 or 1
	local filtre = opt and opt.couleur
	local fcle = filtre and (math.floor(filtre.R * 255 + 0.5) * 65536 + math.floor(filtre.G * 255 + 0.5) * 256 + math.floor(filtre.B * 255 + 0.5))
	local teinte = opt and opt.teinte
	local couleurs: { [number]: number } = {}
	local nb = 0
	-- 1re passe : la boîte des facettes gardées
	local mnx, mny, mnz, mxx, mxy, mxz = math.huge, math.huge, math.huge, -math.huge, -math.huge, -math.huge
	for i = 0, buffer.len(t) - 6, 6 do
		local ia = buffer.readu16(t, i) * 9
		local ca = buffer.readu8(v, ia + 6) * 65536 + buffer.readu8(v, ia + 7) * 256 + buffer.readu8(v, ia + 8)
		if not fcle or ca == fcle then
			for j = 0, 4, 2 do
				local o = buffer.readu16(t, i + j) * 9
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
		local ia, ib, ic = buffer.readu16(t, i) * 9, buffer.readu16(t, i + 2) * 9, buffer.readu16(t, i + 4) * 9
		if sx < 0 then ib, ic = ic, ib end -- un miroir retourne le sens des faces
		local ca = buffer.readu8(v, ia + 6) * 65536 + buffer.readu8(v, ia + 7) * 256 + buffer.readu8(v, ia + 8)
		if not fcle or ca == fcle then
			local ids = table.create(3)
			local cids = table.create(3)
			for n, o in { ia, ib, ic } do
				ids[n] = em:AddVertex(Vector3.new(buffer.readi16(v, o) * k * sx, buffer.readi16(v, o + 2) * k, buffer.readi16(v, o + 4) * k) - centre)
				local cc = buffer.readu8(v, o + 6) * 65536 + buffer.readu8(v, o + 7) * 256 + buffer.readu8(v, o + 8)
				local cid = couleurs[cc]
				if not cid then
					local c3 = Color3.fromRGB(buffer.readu8(v, o + 6), buffer.readu8(v, o + 7), buffer.readu8(v, o + 8))
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

-- Rend un MeshPart (ou nil) et le centre où le poser. ⚠ appelle CreateMeshPartAsync : à lancer hors de la boucle de rendu.
function Maillage.piece(d: { v: string, t: string }, echelle: number, opt: Options?): (MeshPart?, Vector3)
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

return Maillage
