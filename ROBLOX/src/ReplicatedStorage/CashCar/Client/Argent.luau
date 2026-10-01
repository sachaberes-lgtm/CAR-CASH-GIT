-- CASH CAR — L'ARGENT DE L'ATELIER (garArgent du jeu web, 1er oct. — Sacha : « plus on gagne d'argent, plus il doit y avoir des
-- tas de billets sur le sol du garage, un peu placés partout, sur les meubles et tout »).
-- Le COMPTE se voit : des liasses VERTES (corps vert billet, bande kraft) en TAS bas dans le couloir de la caméra, en GROS TAS au
-- pied des murs, en piles sur les meubles, et — quand on devient riche — en PALETTES contre les murs. Rien dans l'allée de la porte
-- (la caisse sort par là), rien devant l'affiche du record, rien sur le plateau.
--   · LA COURBE du web : n = 12 × (compte / 50)^0,4 — 100 $ → 16 objets, 1 k → 40, 10 k → 100, 100 k → 250, 1 M → 630.
--     Dépenser fait FONDRE les tas : l'argent part de l'atelier.
--   · L'ORDRE du web : chaque place s'ouvre à un seuil, puis c'est la place la MOINS remplie qui reçoit l'objet suivant — les tas
--     montent ensemble, du bas vers le haut (jamais une liasse en l'air).
-- ROBLOX : le web dessine tout dans UN maillage (setDrawRange). Ici chaque liasse est faite de deux blocs, bâtis seulement quand
-- le compte les demande (un joueur à 1 000 $ n'en porte que 40), et rangés hors du monde quand le compte baisse.
local Argent = {}

local K, E = 12, 0.4
local LL, LT, LW = 0.5, 0.11, 0.24 -- la liasse : longue, épaisse, large (m) — × 3,2 d'une vraie : à 10 m une vraie serait une miette
local FACE = { Color3.fromRGB(40, 104, 60), Color3.fromRGB(36, 94, 55), Color3.fromRGB(46, 117, 69) }
local BANDE = { Color3.fromRGB(191, 162, 92), Color3.fromRGB(191, 162, 92), Color3.fromRGB(169, 136, 74) }
local BILLET = Color3.fromRGB(58, 143, 85)

local file: { (() -> { BasePart })? } = {} -- l'objet n° k : de quoi le bâtir (nil = un seuil pas encore atteint)
local faits: { [number]: { BasePart } } = {}
local dossier: Instance? = nil
local montres = 0
local O, M = Vector3.zero, 1

function Argent.combien(compte: number): number
	return math.max(0, math.floor(K * (math.max(0, compte) / 50) ^ E + 0.5))
end

local function bloc(w: number, h: number, d: number, x: number, y: number, z: number, ry: number, rx: number, rz: number, c: Color3): BasePart
	local p = Instance.new("Part")
	p.Anchored = true
	p.CanCollide, p.CanQuery, p.CanTouch = false, false, false
	p.CastShadow = false
	p.TopSurface, p.BottomSurface = Enum.SurfaceType.Smooth, Enum.SurfaceType.Smooth
	p.Material = Enum.Material.SmoothPlastic
	p.Size = Vector3.new(w, h, d) * M
	p.CFrame = CFrame.new(O + Vector3.new(x, y, z) * M) * CFrame.Angles(0, ry, 0) * CFrame.Angles(rx, 0, rz)
	p.Color = c
	return p
end

-- le plan : les places, leurs objets (des fermetures : rien n'est bâti ici), puis la file
local function planifier(LARG: number, PROF: number)
	local rnd = Random.new(0x5eed51)
	local function rn(): number return rnd:NextNumber() end
	local function liasse(x: number, y: number, z: number, ry: number, rx: number, rz: number): () -> { BasePart }
		local u = rn()
		local f, b = FACE[math.floor(u * 3) + 1], BANDE[math.floor(rn() * 3) + 1]
		local k = 1 + (u - 0.5) * 0.1 -- un grain de ± 5 % : du papier, pas du plastique
		f = Color3.new(math.min(1, f.R * k), math.min(1, f.G * k), math.min(1, f.B * k))
		return function()
			return { bloc(LL, LT, LW, x, y + LT / 2, z, ry, rx, rz, f), bloc(0.09, LT + 0.006, LW + 0.012, x, y + LT / 2, z, ry, rx, rz, b) }
		end
	end
	local function billet(x: number, z: number, ry: number): () -> { BasePart }
		local rx, rz = (rn() - 0.5) * 0.06, (rn() - 0.5) * 0.06
		return function() return { bloc(0.24, 0.006, 0.11, x, 0.005, z, ry, rx, rz, BILLET) } end
	end
	-- OÙ POSER : les meubles de CET atelier (leurs rectangles au sol), le bazar rond, l'allée de la porte, l'affiche, le plateau
	local RECT = { { 10.3, 6.4, 1.3, 1.5 }, { -10.3, 2.2, 1.4, 3.6 }, { -10.2, -1.2, 1.0, 1.2 }, { -10.4, -8.2, 1.2, 4.4 }, { 10.2, -3.2, 1.0, 1.7 } }
	local ROND = { { -6.1, 9.0, 0.6 }, { 8.9, 9.6, 0.5 }, { 9.7, 8.7, 0.5 }, { -9.6, -5.2, 0.5 }, { 9.6, -8.4, 0.5 }, { 6.3, 9.4, 0.3 }, { 5.4, 10.6, 0.3 },
		{ 7.3, 10.2, 0.3 }, { -6.9, 6.6, 0.3 }, { -7.7, 11.2, 0.36 }, { -8.5, 10.5, 0.36 }, { -8.6, 11.5, 0.36 } }
	local PAL = { { 9.6, 11.4, 0 }, { -9.7, 7.6, math.pi / 2 }, { -9.7, 5.4, math.pi / 2 }, { 9.7, -0.2, math.pi / 2 }, { 4.2, -11.6, 0 }, { -9.4, -11.6, 0 } }
	for _, p in PAL do table.insert(RECT, { p[1], p[2], (p[3] ~= 0) and 0.92 or 1.12, (p[3] ~= 0) and 1.12 or 0.92 }) end
	local function libre(x: number, z: number, m: number): boolean
		if math.abs(x) > LARG / 2 - 0.7 or math.abs(z) > PROF / 2 - 0.7 then return false end
		if math.abs(x) < 2.4 + m and z > 3 then return false end           -- l'allée de la porte : la caisse sort par là
		if z > PROF / 2 - 1.8 and x > 4.9 and x < 8.6 then return false end -- l'affiche du record, au mur de la porte
		for _, r in RECT do
			if math.abs(x - r[1]) < r[3] / 2 + m and math.abs(z - r[2]) < r[4] / 2 + m then return false end
		end
		for _, o in ROND do
			if math.sqrt((x - o[1]) ^ 2 + (z - o[2]) ^ 2) < o[3] + m then return false end
		end
		return true
	end
	-- (la vue tourne autour de la caisse : pas de « côté caméra » comme sur le web — les places se tirent au sort, bien réparties)
	local function choisir(r0: number, r1: number, m: number, ecart: number, nb: number, deja: { { number } }): { { number } }
		local cand = {}
		for x = -10, 10, 0.5 do
			for z = -12, 12, 0.5 do
				local r = math.sqrt(x * x + z * z)
				if r >= r0 and r <= r1 and libre(x, z, m) then table.insert(cand, { x, z, rn() }) end
			end
		end
		table.sort(cand, function(a, b) return a[3] < b[3] end)
		local pris = {}
		for _, c in cand do
			if #pris >= nb then break end
			local ok = true
			for _, p in pris do
				if math.sqrt((p[1] - c[1]) ^ 2 + (p[2] - c[2]) ^ 2) < ecart then ok = false break end
			end
			if ok then
				for _, p in deja do
					if math.sqrt((p[1] - c[1]) ^ 2 + (p[2] - c[2]) ^ 2) < ecart then ok = false break end
				end
			end
			if ok then table.insert(pris, c) end
		end
		return pris
	end
	-- un TAS : des couches qui rétrécissent, de travers, et quelques billets échappés autour
	local function tas(x0: number, z0: number, couches: { { number } }): any
		local it = {}
		local y = 0
		for l, cc in couches do
			local n, R9, y9, penche = cc[1], cc[2], y, (l > 1) and 0.12 or 0.04
			local pts = {}
			for _ = 1, 80 do
				if #pts >= n then break end
				local a, d = rn() * 6.2832, math.sqrt(rn()) * R9
				local px, pz = x0 + math.cos(a) * d, z0 + math.sin(a) * d
				local ok = true
				for _, q in pts do
					if math.sqrt((q[1] - px) ^ 2 + (q[2] - pz) ^ 2) <= 0.27 then ok = false break end
				end
				if ok then table.insert(pts, { px, pz }) end
			end
			for _, q in pts do table.insert(it, liasse(q[1], y9, q[2], rn() * 6.2832, (rn() - 0.5) * penche, (rn() - 0.5) * penche)) end
			local a, d = rn() * 6.2832, 0.7 + rn() * 0.45
			table.insert(it, billet(x0 + math.cos(a) * d, z0 + math.sin(a) * d, rn() * 6.2832))
			y += LT * 0.96
		end
		return { it = it, a = 0 }
	end
	-- LES TAS BAS autour du plateau (3 couches : 33 cm) — puis LES GROS TAS au pied des murs (5 couches)
	local bas = choisir(5.1, 8.1, 0.72, 1.7, 10, {})
	local gros = choisir(8.4, 11.2, 1.0, 2.2, 7, bas)
	local TB, TG = {}, {}
	for _, c in bas do table.insert(TB, tas(c[1], c[2], { { 6, 0.55 }, { 4, 0.4 }, { 2, 0.22 } })) end
	for _, c in gros do table.insert(TG, tas(c[1], c[2], { { 9, 0.8 }, { 7, 0.62 }, { 5, 0.46 }, { 3, 0.3 }, { 1, 0.08 } })) end
	-- LES MEUBLES : des piles bien rangées sur ce qui est plat (colonnes { dx, dz }, couches)
	local function pile(x: number, y: number, z: number, ry: number, cols: { { number } }, couches: number): any
		local it = {}
		for l = 0, couches - 1 do
			for _, c in cols do
				table.insert(it, liasse(x + c[1] + (rn() - 0.5) * 0.02, y + l * LT, z + c[2] + (rn() - 0.5) * 0.02, ry + (rn() - 0.5) * 0.08, 0, 0))
			end
		end
		return { it = it, a = 0 }
	end
	local M9 = {
		pile(-6.1, 1.0, 9.0, 0.35, { { 0, 0 } }, 3),                                -- sur le fût
		pile(10.3, 2.1, 6.4, math.pi / 2, { { 0, -0.27 }, { 0, 0.27 } }, 4),         -- sur le distributeur
		pile(-10.2, 0.95, -1.2, math.pi / 2, { { 0, -0.27 }, { 0, 0.27 } }, 4),      -- la servante
		pile(-10.3, 0.95, 1.2, math.pi / 2, { { 0, 0 } }, 4),                        -- l'établi
		pile(-10.3, 0.95, 3.1, math.pi / 2, { { 0, -0.27 }, { 0, 0.27 } }, 5),
		pile(10.2, 0.9, -3.2, math.pi / 2, { { 0, 0 } }, 3),                         -- le compresseur
	}
	-- LES PALETTES (riche) : contre les murs — 1 palette + 10 couches de 8 liasses (1,23 m)
	local function pal(x: number, z: number, ry: number): any
		local c, s = math.cos(ry), math.sin(ry)
		local it = { function()
			return { bloc(1.12, 0.03, 0.92, x, 0.015, z, ry, 0, 0, Color3.fromRGB(110, 77, 44)), bloc(1.0, 0.08, 0.8, x, 0.07, z, ry, 0, 0, Color3.fromRGB(95, 66, 38)),
				bloc(1.12, 0.024, 0.92, x, 0.118, z, ry, 0, 0, Color3.fromRGB(134, 96, 58)) }
		end }
		for l = 0, 9 do
			for j = 0, 3 do
				for i = 0, 1 do
					local lx, lz = (i - 0.5) * 0.505 + (rn() - 0.5) * 0.012, (j - 1.5) * 0.232 + (rn() - 0.5) * 0.012
					table.insert(it, liasse(x + c * lx + s * lz, 0.13 + l * LT, z - s * lx + c * lz, ry + (rn() - 0.5) * 0.03, 0, 0))
				end
			end
		end
		return { it = it, a = 0 }
	end
	-- les seuils d'ouverture : tas bas et meubles entremêlés (ce qu'on voit d'abord), les gros tas, puis les palettes quand on devient riche
	local ord = {}
	local A1 = { 0, 1, 3, 6, 8, 11, 14, 17, 21, 25, 29, 33, 38, 43, 48, 54, 60, 66, 72, 80, 88, 96, 104, 112 }
	local ti, mi, i = 1, 1, 0
	while ti <= #TB or mi <= #M9 do
		local p
		if (i % 2 == 0 and ti <= #TB) or mi > #M9 then
			p = TB[ti]
			ti += 1
		else
			p = M9[mi]
			mi += 1
		end
		p.a = A1[math.min(i, #A1 - 1) + 1] + math.max(0, i - #A1 + 1) * 8
		table.insert(ord, p)
		i += 1
	end
	for k, p in TG do
		p.a = 70 + (k - 1) * 28
		table.insert(ord, p)
	end
	local A2 = { 160, 240, 340, 460, 600, 760 }
	for k, p in PAL do
		local q = pal(p[1], p[2], p[3])
		q.a = A2[k]
		table.insert(ord, q)
	end
	-- LA FILE : à chaque pas, la place ouverte la MOINS remplie reçoit l'objet suivant
	local fait = table.create(#ord, 0)
	local n = 0
	while true do
		local mieux, bf = 0, 2
		local reste = false
		for k, p in ord do
			if fait[k] < #p.it then
				reste = true
				if p.a <= n then
					local f = fait[k] / #p.it
					if f < bf then bf, mieux = f, k end
				end
			end
		end
		if not reste then break end
		n += 1
		if mieux == 0 then
			file[n] = nil -- un seuil pas encore atteint : l'objet n n'ajoute rien
		else
			fait[mieux] += 1
			file[n] = ord[mieux].it[fait[mieux]]
		end
		if n > 1400 then break end
	end
	Argent.max = n
end

-- origine = le coin (0,0,0) de l'atelier (studs), echelle = studs par mètre
function Argent.batir(parent: Instance, origine: Vector3, echelle: number, LARG: number, PROF: number)
	dossier, O, M = parent, origine, echelle
	montres = 0
	table.clear(file)
	for _, l in faits do
		for _, p in l do p:Destroy() end
	end
	table.clear(faits)
	planifier(LARG, PROF)
end

-- le compte a changé : on montre les n premiers objets (bâtis à la demande), on range les autres
function Argent.maj(compte: number)
	if not dossier then return end
	local n = math.min(Argent.max or 0, Argent.combien(compte))
	if n == montres then return end
	if n > montres then
		for k = montres + 1, n do
			local f = file[k]
			if f then
				local l = faits[k]
				if not l then
					l = f()
					faits[k] = l
				end
				for _, p in l do p.Parent = dossier end
			end
		end
	else
		for k = n + 1, montres do
			local l = faits[k]
			if l then
				for _, p in l do p.Parent = nil end
			end
		end
	end
	montres = n
end

return Argent
