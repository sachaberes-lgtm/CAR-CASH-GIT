-- CASH CAR — LA VILLE (buildVoxCity du jeu web, VERSION PRINCIPALE/index.html L11559 ; les fenêtres : villeMatTours L10649).
-- Le niveau « AU-DESSUS DE LA VILLE » : un CANYON de tours bâti le long du ruban (trois rangs de chaque côté : le mur, la deuxième
-- ligne, le fond de rue) et, au large, la forêt du village jusqu'à la brume. Chaque tour a ses RETRAITS (des volumes emboîtés qui
-- partent tous du pied), parfois des TUYAUX le long d'une façade, une ANTENNE et son feu rouge ou une COURONNE de néon, et le long
-- du canyon une ENSEIGNE verticale magenta ou cyan à hauteur de route.
-- LA RÈGLE D'OR : la route ne traverse JAMAIS une tour (`tourLibre` rogne le pied ou le toit) — et les tours sont DURES : en vol,
-- entrer dans une tour tue (`Ville.heurt`).
-- LES FENÊTRES : chaque tour a UNE teinte dominante — chaude #ffb04a (on y vit) ou froide #8fd8ff (on y travaille) —, 35 à 45 % de
-- fenêtres éteintes, des étages qui s'allument par bandes. Roblox n'a pas de matière sur mesure : deux images de 8 × 8 fenêtres,
-- répétées sur les façades par les coordonnées de texture d'un cube (un gabarit par nombre de travées et d'étages).
local AssetService = game:GetService("AssetService")
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Maillage = require(script.Parent:WaitForChild("Maillage"))
local Recyclage = require(script.Parent:WaitForChild("Recyclage"))
local Perf = require(script.Parent:WaitForChild("Perf"))
local M = Config.M
local RH = Config.ROAD_HALF

local Ville = {}

local VOX = 6.4 -- la maille de la ville : tout atterrit sur la trame
local function snap(v: number): number return math.max(1, math.floor(v / VOX + 0.5)) * VOX end
local function lisse(x: number, a: number, b: number): number
	local t = math.clamp((x - a) / (b - a), 0, 1)
	return t * t * (3 - 2 * t)
end

-- ── les deux images de fenêtres (8 × 8 fenêtres, 16 pixels par travée) ──
local CEL, NF = 16, 8
local images: { any } = {}
-- (MINUIT EN VILLE, villeApres L33057 : « 3 fenêtres sur 4 éteintes ») `nuit` : les mêmes façades, plus tard — un mur presque noir,
-- une fenêtre allumée sur quatre, et celles qui restent brûlent plus fort (elles sont seules dans le noir)
local function image(froide: boolean, nuit: boolean?): any?
	local k = (froide and 2 or 1) + (nuit and 2 or 0)
	if images[k] ~= nil then return images[k] or nil end
	images[k] = false
	local N = CEL * NF
	local ok, im = pcall(function() return AssetService:CreateEditableImage({ Size = Vector2.new(N, N) }) end)
	if not ok or not im then return nil end
	local rnd = Random.new(froide and 7711 or 4242)
	local b = buffer.create(N * N * 4)
	-- le béton du village : gris-bleu, mouillé (× 1,25 : la teinte de chaque tour le ramène entre 0,8 et 1,25)
	local mur = nuit and { 26, 27, 38 } or { 64, 67, 83 }
	local dom = froide and { 143, 216, 255 } or { 255, 176, 74 }
	local aut = froide and { 255, 176, 74 } or { 143, 216, 255 }
	for i = 0, N * N - 1 do
		buffer.writeu8(b, i * 4, mur[1])
		buffer.writeu8(b, i * 4 + 1, mur[2])
		buffer.writeu8(b, i * 4 + 2, mur[3])
		buffer.writeu8(b, i * 4 + 3, 255)
	end
	for fy = 0, NF - 1 do
		local vit = rnd:NextNumber() > 0.26 -- un plateau sur quatre dort (il garde quelques veilleuses)
		for fx = 0, NF - 1 do
			local allume = rnd:NextNumber() < (vit and 0.72 or 0.08) * (nuit and 0.25 or 1)
			if allume then
				local c = (rnd:NextNumber() < 0.8) and dom or aut
				local e = (nuit and 1.05 or 0.8) + 0.4 * rnd:NextNumber()
				-- la fenêtre : 60 % de la travée en largeur (un bandeau dans les bureaux), 52 % de l'étage en hauteur
				local x0, x1 = froide and 1 or 3, froide and 14 or 12
				for y = 4, 11 do
					for x = x0, x1 do
						local o = ((fy * CEL + y) * N + fx * CEL + x) * 4
						buffer.writeu8(b, o, math.min(255, math.floor(c[1] * e)))
						buffer.writeu8(b, o + 1, math.min(255, math.floor(c[2] * e)))
						buffer.writeu8(b, o + 2, math.min(255, math.floor(c[3] * e)))
					end
				end
			end
		end
	end
	local ok2 = pcall(function() im:WritePixelsBuffer(Vector2.zero, Vector2.new(N, N), b) end)
	images[k] = ok2 and im or false
	return images[k] or nil
end

-- ── les gabarits de tour : un cube d'un stud, ses quatre façades tapissées nw × nh (et np × nh) fois ──
local gabarits: { [string]: any } = {}
local function gabarit(nw: number, np: number, nh: number, froide: boolean): MeshPart?
	local cle = nw .. "|" .. np .. "|" .. nh .. (froide and "f" or "c")
	local g = gabarits[cle]
	if g ~= nil then return g or nil end
	gabarits[cle] = false
	local im = image(froide)
	local mp = Maillage.seul(function(): MeshPart?
		local em = AssetService:CreateEditableMesh()
		local function face(a: Vector3, b: Vector3, c: Vector3, d: Vector3, n: Vector3, u: number, v: number)
			local ia, ib, ic, id = em:AddVertex(a), em:AddVertex(b), em:AddVertex(c), em:AddVertex(d)
			local nn = em:AddNormal(n)
			local ua, ub, uc, ud = em:AddUV(Vector2.new(0.01, v)), em:AddUV(Vector2.new(u, v)), em:AddUV(Vector2.new(u, 0.01)), em:AddUV(Vector2.new(0.01, 0.01))
			local f1 = em:AddTriangle(ia, ib, ic)
			em:SetFaceNormals(f1, { nn, nn, nn })
			em:SetFaceUVs(f1, { ua, ub, uc })
			local f2 = em:AddTriangle(ia, ic, id)
			em:SetFaceNormals(f2, { nn, nn, nn })
			em:SetFaceUVs(f2, { ua, uc, ud })
		end
		local h = 0.5
		-- (a, b en bas ; c, d en haut — vus de dehors, dans le sens direct)
		face(Vector3.new(-h, -h, h), Vector3.new(h, -h, h), Vector3.new(h, h, h), Vector3.new(-h, h, h), Vector3.zAxis, nw, nh)
		face(Vector3.new(h, -h, -h), Vector3.new(-h, -h, -h), Vector3.new(-h, h, -h), Vector3.new(h, h, -h), -Vector3.zAxis, nw, nh)
		face(Vector3.new(h, -h, h), Vector3.new(h, -h, -h), Vector3.new(h, h, -h), Vector3.new(h, h, h), Vector3.xAxis, np, nh)
		face(Vector3.new(-h, -h, -h), Vector3.new(-h, -h, h), Vector3.new(-h, h, h), Vector3.new(-h, h, -h), -Vector3.xAxis, np, nh)
		-- le toit et le dessous : du mur (un pixel de béton)
		face(Vector3.new(-h, h, h), Vector3.new(h, h, h), Vector3.new(h, h, -h), Vector3.new(-h, h, -h), Vector3.yAxis, 0.012, 0.012)
		face(Vector3.new(-h, -h, -h), Vector3.new(h, -h, -h), Vector3.new(h, -h, h), Vector3.new(-h, -h, h), -Vector3.yAxis, 0.012, 0.012)
		local okF, fige = pcall(function() return AssetService:CreateEditableMeshAsync(Content.fromObject(em), { FixedSize = true }) end)
		if okF and fige then
			em:Destroy()
			em = fige
		end
		local okP, piece = pcall(function() return AssetService:CreateMeshPartAsync(Content.fromObject(em), { CollisionFidelity = Enum.CollisionFidelity.Box }) end)
		if not okP or not piece then
			pcall(function() em:Destroy() end)
			return nil
		end
		Maillage.noter(12)
		return piece
	end)
	if not mp then return nil end
	mp.Name = "Tour"
	mp:SetAttribute("Rec", "T" .. cle) -- (ses copies passent au recyclage : voir Client/Recyclage)
	mp.Anchored = true
	mp.CanCollide = false
	mp.CanQuery = false
	mp.CanTouch = false
	mp.CastShadow = false
	mp.Material = Enum.Material.SmoothPlastic
	if im then mp.TextureContent = Content.fromObject(im) end
	gabarits[cle] = mp
	return mp
end
-- le nombre de répétitions de l'image (8 fenêtres) le plus proche, parmi quelques crans : peu de gabarits, des fenêtres de 3 à 5 m
local CRANS_L = { 0.5, 0.75, 1, 1.25, 1.5 }
local CRANS_H = { 1, 1.5, 2.5, 4, 6, 9, 13, 19, 28 }
-- (APPAREIL FAIBLE, Config.FAIBLE.villeGabarits = false) MESURÉ AU BANC : la ville est le poste le plus lourd du jeu en APPELS DE
-- DESSIN — 200 sur 360 dans une vue de course. Chaque gabarit de tour (une combinaison de crans × chaude ou froide) est un appel de
-- plus : Roblox ne regroupe que les copies d'un MÊME maillage. Des crans deux fois plus larges : 40 gabarits au plus au lieu de 450 —
-- les tours gardent leurs cotes au centimètre (la collision ne lit qu'elles), seules leurs fenêtres s'étirent un peu plus d'une
-- tour à l'autre (une travée de 2,5 à 6 m au lieu de 3 à 5)
local CRANS_L_FAIBLE = { 0.6, 1.2 }
local CRANS_H_FAIBLE = { 1.2, 2.5, 5, 10, 20 }
local function cran(x: number, liste: { number }): number
	local m, md = liste[1], math.huge
	for _, c in liste do
		local d = math.abs(math.log(x / c))
		if d < md then m, md = c, d end
	end
	return m
end

local NEON = { Color3.fromRGB(255, 62, 200), Color3.fromRGB(62, 232, 255), Color3.fromRGB(255, 79, 158), Color3.fromRGB(82, 200, 255),
	Color3.fromRGB(255, 62, 200), Color3.fromRGB(255, 59, 92) }

export type Collision = { g: { [number]: { number } }, c: { number } }

-- Bâtit la ville autour d'une piste. Rend la grille de collision des tours (en mètres).
function Ville.batir(piste: any, dossier: Instance, graine: number, ceder: (() -> ())?, accent: Color3?): Collision
	local vr = Random.new(graine + 0x5EED1)
	local nuit = piste.variante == "nuit" -- MINUIT EN VILLE
	local function r(): number return vr:NextNumber() end
	local F = piste.F
	local NP = piste.n
	local DS = piste.DS / M
	local function pt(i: number): Vector3 return F[i].Position / M end
	local racine = Instance.new("Folder")
	racine.Name = "Ville"
	racine.Parent = dossier
	-- LA GRILLE DE HACHAGE DE LA PISTE : un point tous les ~12 m, par cases de 120 m (horizontales)
	local HB = 120
	local grille: { [number]: { number } } = {}
	local pasP = math.max(1, math.floor(12 / DS + 0.5))
	local function cle(bx: number, bz: number): number return (bx + 4096) * 8192 + bz + 4096 end
	for i = 1, NP, pasP do
		local p = pt(i)
		local k = cle(math.floor(p.X / HB), math.floor(p.Z / HB))
		local l = grille[k]
		if not l then
			l = {}
			grille[k] = l
		end
		table.insert(l, i)
	end
	local function proches(x: number, z: number, R: number, cb: (number) -> ())
		local rr = math.ceil(R / HB)
		local bx, bz = math.floor(x / HB), math.floor(z / HB)
		for dx = -rr, rr do
			for dz = -rr, rr do
				local l = grille[cle(bx + dx, bz + dz)]
				if l then
					for _, i in l do cb(i) end
				end
			end
		end
	end
	-- LA RÈGLE D'OR : [pied, toit] rognés pour que la route ne traverse jamais la tour (nil s'il ne reste rien)
	local function tourLibre(cx: number, cz: number, hd: number, b: number, t: number): (number?, number?)
		local clr = hd + RH + 24
		local c2 = clr * clr
		for _ = 1, 4 do
			local ok = true
			proches(cx, cz, clr, function(i: number)
				local p = pt(i)
				local dx, dz = p.X - cx, p.Z - cz
				if dx * dx + dz * dz > c2 then return end
				if p.Y > t + 60 or p.Y < b - 40 then return end
				ok = false
				if p.Y > (b + t) * 0.5 then t = math.min(t, p.Y - 60) else b = math.max(b, p.Y + 44) end
			end)
			if ok then break end
			if t - b < 40 then return nil, nil end
		end
		if t - b >= 40 then return b, t end
		return nil, nil
	end
	-- L'ENTRÉE SURÉLEVÉE : 1 le long de la droite, 0 au pied de la rampe (les toits qui la bordent passent SOUS la route)
	local iEA, iEB = 0, 0
	if piste.entree then iEA, iEB = piste.entree[1], piste.entree[2] end
	local function eEnt(i: number): number
		if iEA <= 0 then return 0 end
		if i <= iEA then return 1 end
		if i >= iEB then return 0 end
		return 1 - lisse((i - iEA) / (iEB - iEA), 0.25, 1)
	end

	local corps: { { number } } = {}  -- { x, y, z, w, h, p, genre, teinte, froide }
	local neons: { { number } } = {}  -- { x, y, z, w, h, p, couleur }
	local nT = 0
	local R_CAN, R_VIL, SN, SF = 330, 1900, 54, 200
	-- UNE TOUR : (cx, cz) son centre, d sa distance à l'axe, yN l'altitude du tronçon qu'elle borde, yLo le plus bas de ce tronçon
	local function batir(cx: number, cz: number, d: number, yN: number, yLo: number, canyon: boolean, w: number, p: number, eE: number)
		local hd = math.sqrt(w * w + p * p) * 0.5 + 5
		local t
		if canyon then
			local k = 1 - math.min(1, (d - 54) / (R_CAN - 54)) -- LE CANYON : les murs montent AU-DESSUS de la route
			t = yN - 50 + 290 * r() ^ 0.75 * (0.55 + 0.45 * k)
			if k > 0.5 and r() < 0.22 then t += 160 end
		else
			t = yN - 230 + r() * r() * 470 -- AU LARGE : la forêt du village
		end
		if eE > 0 then
			local u9 = math.clamp((t - yN + 50) / 450, 0, 1)
			local tE = yN - 22 - (1 - u9) * 120
			t += (tE - t) * eE
		end
		local b = math.min(yLo, yN) - 330 - r() * 120
		if t - b > 1000 then b = t - 1000 end
		local b2, t2 = tourLibre(cx, cz, hd, b, t)
		if not b2 or not t2 then return end
		b, t = b2, t2
		local H = t - b
		nT += 1
		local froide = r() >= 0.58 -- la tour FROIDE (les bureaux)
		-- LES RETRAITS : volumes emboîtés qui partent tous du pied, plus étroits et plus hauts
		local et = (H > 260) and ((r() < 0.55) and 3 or 2) or ((r() < 0.4) and 2 or 1)
		local wk, pk = w, p
		for k = 0, et - 1 do
			local fr = (k == et - 1) and 1 or (0.5 + 0.36 * (k + 1) / et + (r() - 0.5) * 0.08)
			table.insert(corps, { cx, b + H * fr / 2, cz, wk, H * fr, pk, 0, 0.8 + r() * 0.45, froide and 1 or 0 })
			wk, pk = snap(wk * 0.72), snap(pk * 0.72)
			if wk < VOX * 2 or pk < VOX * 2 then break end
		end
		-- LES TUYAUX : ils descendent le long d'une façade jusque dans la brume
		if H > 220 and r() < (canyon and 0.7 or 0.5) then
			local nt = 1 + math.floor(r() * 3)
			local tk = snap(3 + r() * 2.5)
			for _ = 1, nt do
				local f = math.floor(r() * 4)
				local ht, gl = H * (0.5 + r() * 0.45), (r() - 0.5) * 0.7
				local ox = (f < 2) and ((f == 1) and 1 or -1) * (w / 2 + tk / 2) or gl * w
				local oz = (f < 2) and gl * p or ((f == 2) and 1 or -1) * (p / 2 + tk / 2)
				table.insert(corps, { cx + ox, b + ht / 2, cz + oz, tk, ht, tk, 1, 0.8 + r() * 0.45, 0 })
			end
		end
		-- L'ANTENNE et son FEU ROUGE — sinon, parfois, la COURONNE à l'accent de la zone
		if H > 320 and r() < 0.5 then
			local ha = 24 + r() * 56
			table.insert(corps, { cx, b + (H + ha) / 2, cz, 2.4, H + ha, 2.4, 2, 1, 0 })
			table.insert(neons, { cx, t + ha, cz, 4.5, 4.5, 4.5, 6 })
		elseif r() < 0.32 then
			table.insert(neons, { cx, t - 1.4, cz, wk / 0.72 * 1.05, 2.8, pk / 0.72 * 1.05, 7 })
		end
		-- L'ENSEIGNE VERTICALE : le long du canyon, une tour sur deux porte son néon, à hauteur de ROUTE
		if r() < (canyon and 0.5 or 0.18) then
			local hs = math.min(H * 0.3, 30 + r() * 60)
			local ys = math.max(b + hs / 2 + 20, math.min(t - hs / 2 - 6, yN + (r() - 0.3) * 80))
			local fx, sg = r() < 0.5, (r() < 0.5) and -1 or 1
			table.insert(neons, { cx + (fx and sg * (w / 2 + 1.2) or 0), ys, cz + (fx and 0 or sg * (p / 2 + 1.2)), fx and 1.8 or 7.5, hs, fx and 7.5 or 1.8,
				1 + math.floor(r() * 5) })
		end
	end
	-- LE CANYON, bâti le long du ruban : chaque tour se pose par rapport au TRONÇON qu'elle borde
	local pasC = math.max(1, math.floor(SN / DS + 0.5))
	local ROWS = { { 28, 40, 0.9 }, { 100, 60, 0.7 }, { 190, 130, 0.5 } }
	local BUD = 1700
	local kC = math.min(1, BUD / math.max(1, (NP / pasC) * 2 * 2.1))
	local compte = 0
	for i = 1, NP, pasC do
		local T9 = F[i].LookVector
		local hl = math.sqrt(T9.X * T9.X + T9.Z * T9.Z)
		if hl >= 0.5 then
			local px, pz, tx, tz = -T9.Z / hl, T9.X / hl, T9.X / hl, T9.Z / hl
			local pi = pt(i)
			local yLo = pi.Y
			for j = math.max(1, i - pasC * 5), math.min(NP, i + pasC * 5), pasC do
				local y = F[j].Position.Y / M
				if y < yLo then yLo = y end
			end
			for _, sg in { -1, 1 } do
				for _, rw in ROWS do
					if r() <= rw[3] * kC then
						local w, p = snap(16 + r() * 26), snap(16 + r() * 26)
						local hd = math.sqrt(w * w + p * p) * 0.5
						local lat, al = RH + rw[1] + hd + r() * rw[2], (r() - 0.5) * SN * 0.6
						-- (ENTRÉE v2, web f0b1a84, Léo 4/10 : « les niveaux villes ne sont pas tous des villes ») seul le MUR — le 1er rang, au bord —
						-- passe sous la route surélevée de l'entrée ; le 2e et le 3e rang gardent leur hauteur : on arrive ENTRE les gratte-ciel, pas
						-- dans un ciel vide (et depuis le 5/10, la ville OUVRE la partie : c'est le premier écran du jeu). Mêmes tirages.
						batir(pi.X + px * sg * lat + tx * al, pi.Z + pz * sg * lat + tz * al, lat, pi.Y, yLo, true, w, p, (rw == ROWS[1]) and eEnt(i) or 0)
					end
				end
			end
		end
		compte += 1
		if ceder and compte % 12 == 0 then ceder() end
	end
	-- AU LARGE : la forêt du village, par cases au sol, calée sur le point de piste le plus proche
	do
		local cellules: { [number]: { number } } = {}
		local rr = math.ceil(R_VIL / SF)
		local pas = math.max(1, math.floor(SF * 0.6 / DS + 0.5))
		for i = 1, NP, pas do
			local p = pt(i)
			local cx0, cz0 = math.floor(p.X / SF + 0.5), math.floor(p.Z / SF + 0.5)
			for dx = -rr, rr do
				for dz = -rr, rr do
					local gx, gz = (cx0 + dx) * SF, (cz0 + dz) * SF
					local d = math.sqrt((gx - p.X) ^ 2 + (gz - p.Z) ^ 2)
					if d <= R_VIL then
						local k = cle(cx0 + dx, cz0 + dz)
						local o = cellules[k]
						if not o or d < o[1] then cellules[k] = { d, i, gx, gz } end
					end
				end
			end
			if ceder and i % (pas * 20) == 1 then ceder() end
		end
		local liste = {}
		for _, v in cellules do
			if v[1] > R_CAN then table.insert(liste, v) end
		end
		table.sort(liste, function(a, b) return a[3] * 100003 + a[4] < b[3] * 100003 + b[4] end) -- (un ordre fixe : même ville chez tous)
		local kF = math.min(1, BUD * 0.55 / math.max(1, #liste))
		for n, v in liste do
			if r() <= kF * 0.8 then
				local cx, cz = v[3] + (r() - 0.5) * SF * 0.4, v[4] + (r() - 0.5) * SF * 0.4
				local d2, yN, iN = 1e12, F[v[2]].Position.Y / M, v[2]
				local yLo = yN
				proches(cx, cz, 360, function(i: number)
					local p = pt(i)
					local e = (p.X - cx) ^ 2 + (p.Z - cz) ^ 2
					if e < d2 then
						d2, yN, iN = e, p.Y, i
					end
					if e < 129600 and p.Y < yLo then yLo = p.Y end
				end)
				local dF = (d2 < 1e12) and math.sqrt(d2) or v[1]
				batir(cx, cz, dF, yN, yLo, false, snap(20 + r() * 30), snap(20 + r() * 30), 0) -- (ENTRÉE v2 : la forêt garde sa hauteur à l'entrée)
			end
			if ceder and n % 40 == 0 then ceder() end
		end
	end

	-- LES TOURS SONT DURES : chaque volume (sauf les mâts) rangé dans une grille de 60 m
	local CG = 60
	local col: Collision = { g = {}, c = {} }
	for k, v in corps do
		local o = (k - 1) * 6
		for j = 1, 6 do col.c[o + j] = v[j] end
		if v[7] ~= 2 then
			local x0, x1, z0, z1 = v[1] - v[4] / 2, v[1] + v[4] / 2, v[3] - v[6] / 2, v[3] + v[6] / 2
			for gx = math.floor(x0 / CG), math.floor(x1 / CG) do
				for gz = math.floor(z0 / CG), math.floor(z1 / CG) do
					local kk = cle(gx, gz)
					local l = col.g[kk]
					if not l then
						l = {}
						col.g[kk] = l
					end
					table.insert(l, o)
				end
			end
		end
	end

	-- ── LA POSE ──
	local function boite(v: { number }, nom: string, couleur: Color3, matiere: Enum.Material): Part
		local p = Recyclage.part() -- (reprise au recyclage quand la zone est oubliée)
		p.Name = nom
		p.Anchored = true
		p.CanCollide = false
		p.CanQuery = false
		p.CanTouch = false
		p.CastShadow = false
		p.TopSurface = Enum.SurfaceType.Smooth
		p.BottomSurface = Enum.SurfaceType.Smooth
		p.Material = matiere
		p.Color = couleur
		p.Size = Vector3.new(math.min(2040, v[4] * M), math.min(2040, v[5] * M), math.min(2040, v[6] * M))
		p.CFrame = CFrame.new(v[1] * M, v[2] * M, v[3] * M)
		p.Parent = racine
		return p
	end
	for k, v in corps do
		if v[7] == 0 then
			-- le BÉTON du village et ses fenêtres (travée ~3,5 m, étage ~4 m : l'image porte 8 fenêtres)
			local gros = Perf.faible and not Perf.F.villeGabarits
			local cL, cH = gros and CRANS_L_FAIBLE or CRANS_L, gros and CRANS_H_FAIBLE or CRANS_H
			local g = gabarit(cran(v[4] / 28, cL), cran(v[6] / 28, cL), cran(v[5] / 32, cH), v[9] > 0.5)
			local t = v[8] / 1.25
			if g then
				local p = Recyclage.copie(g)
				p.Size = Vector3.new(v[4] * M, math.min(2040, v[5] * M), v[6] * M)
				p.CFrame = CFrame.new(v[1] * M, v[2] * M, v[3] * M)
				p.Color = Color3.new(t, t, t)
				if nuit then
					local imN = image(v[9] > 0.5, true) -- (le même gabarit, une autre image : zéro maillage de plus)
					if imN then p.TextureContent = Content.fromObject(imN) end
				end
				p.Parent = racine
			else
				boite(v, "Tour", Color3.new(0.25 * t, 0.26 * t, 0.32 * t), Enum.Material.SmoothPlastic)
			end
		elseif v[7] == 1 then
			boite(v, "Tuyau", Color3.new(0.32 * v[8], 0.33 * v[8], 0.37 * v[8]), Enum.Material.Metal) -- le MÉTAL des tuyaux : il accroche le néon
		else
			boite(v, "Mat", Color3.new(0.10, 0.10, 0.12), Enum.Material.SmoothPlastic)
		end
		if ceder and k % 60 == 0 then ceder() end
	end
	for k, v in neons do
		local c = (v[7] == 7) and (accent or NEON[1]) or NEON[v[7]]
		if nuit then c = Color3.new(c.R * 0.55, c.G * 0.55, c.B * 0.55) end -- (à minuit le courant baisse : les enseignes couvent)
		boite(v, "Neon", c, Enum.Material.Neon)
		if ceder and k % 80 == 0 then ceder() end
	end
	racine:SetAttribute("tours", nT)
	racine:SetAttribute("volumes", #corps)
	racine:SetAttribute("neons", #neons)
	return col
end

-- ── LA PLUIE (le « village de la pluie ») : un rideau de traits fins qui tombe AUTOUR de la caméra. Un seul émetteur, accroché à une
-- pièce invisible qui suit l'œil (les gouttes sont verrouillées à la pièce : à 300 km/h, une pluie posée dans le monde reste derrière).
local pluieP: Part? = nil
local pluieE: ParticleEmitter? = nil
function Ville.pluie(actif: boolean, camCF: CFrame, taux: number?, vent: boolean?)
	if not pluieP then
		if not actif then return end
		local p = Instance.new("Part")
		p.Name = "Pluie"
		p.Anchored = true
		p.CanCollide = false
		p.CanQuery = false
		p.CanTouch = false
		p.Transparency = 1
		p.Size = Vector3.new(46 * M, 1, 46 * M)
		local e = Instance.new("ParticleEmitter")
		e.Texture = "rbxasset://textures/particles/sparkles_main.dds"
		e.EmissionDirection = Enum.NormalId.Bottom
		e.Orientation = Enum.ParticleOrientation.FacingCameraWorldUp
		e.Rate = 520
		e.Lifetime = NumberRange.new(0.5, 0.7)
		e.Speed = NumberRange.new(62 * M, 78 * M)
		e.SpreadAngle = Vector2.new(2, 2)
		e.Size = NumberSequence.new(0.8)
		e.Squash = NumberSequence.new(2.6) -- (étiré en hauteur : un TRAIT, pas un flocon)
		e.Color = ColorSequence.new(Color3.fromRGB(196, 206, 255))
		e.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(0.15, 0.42), NumberSequenceKeypoint.new(1, 0.6) })
		e.LightEmission = 0.6
		e.LightInfluence = 0
		e.LockedToPart = true
		e.Enabled = false
		e.Parent = p
		p.Parent = workspace
		pluieP, pluieE = p, e
	end
	local p, e = pluieP :: Part, pluieE :: ParticleEmitter
	if e.Enabled ~= actif then
		e.Enabled = actif
		if not actif then e:Clear() end
	end
	if actif then
		e.Rate = 520 * (taux or 1) * Perf.part(Perf.F.pluie) -- (APPAREIL FAIBLE : une part des traits, Config.FAIBLE.pluie)
		-- au-dessus de l'œil et un peu devant (à plat : la pluie tombe droit, quelle que soit l'assiette de la caméra)
		local av = camCF.LookVector * Vector3.new(1, 0, 1)
		-- (pluieTick, L13487 : L'ORAGE a du VENT — la pluie tombe en biais — et plus de pluie)
		p.CFrame = CFrame.new(camCF.Position + av * (10 * M) + Vector3.new(0, 16 * M, 0)) * CFrame.Angles(0, 0, vent and math.rad(11) or 0)
	end
end

-- ── LES PHARES DE MINUIT (villeApres, PHARE_FX L14361) : « PLEINS PHARES » — à minuit ce sont eux qui éclairent la route. Deux
-- FAISCEAUX qui partent des phares (70 m, 6 m d'ouverture au bout) : la pluie et la brume les rendent visibles ; et une lampe qui
-- court DEVANT la caisse (les lumières de Roblox ne portent pas à plus de 24 m : celle de la caisse ne suffit pas).
local PH: any = nil
function Ville.phares(actif: boolean, carCF: CFrame, demi: number, long: number)
	if not PH then
		if not actif then return end
		local function invisible(nom: string): Part
			local p = Instance.new("Part")
			p.Name = nom
			p.Anchored = true
			p.CanCollide, p.CanQuery, p.CanTouch = false, false, false
			p.Transparency = 1
			p.Size = Vector3.new(1, 1, 1)
			return p
		end
		local base, loin = invisible("Faisceaux"), invisible("PhareLoin")
		local fx = {}
		for k = 1, 2 do
			local a0, a1 = Instance.new("Attachment"), Instance.new("Attachment")
			a0.Parent, a1.Parent = base, base
			local b = Instance.new("Beam")
			b.Attachment0, b.Attachment1 = a0, a1
			b.FaceCamera = true
			b.Segments = 1
			b.Width0, b.Width1 = 0.5 * M, 12 * M
			b.Color = ColorSequence.new(Color3.fromRGB(223, 233, 255))
			b.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.5), NumberSequenceKeypoint.new(0.25, 0.68),
				NumberSequenceKeypoint.new(0.7, 0.9), NumberSequenceKeypoint.new(1, 1) })
			b.LightEmission = 1
			b.LightInfluence = 0
			b.Parent = base
			fx[k] = { a0, a1, b }
		end
		local l = Instance.new("SpotLight")
		l.Face = Enum.NormalId.Front
		l.Angle = 110
		l.Range = 60
		l.Brightness = 4
		l.Color = Color3.fromRGB(224, 242, 255) -- (du jaune halogène au BLANC xénon)
		l.Shadows = false
		l.Parent = loin
		base.Parent, loin.Parent = workspace, workspace
		PH = { base = base, loin = loin, fx = fx, lampe = l, on = true }
	end
	if PH.on ~= actif then
		PH.on = actif
		PH.lampe.Enabled = actif
		for _, f in PH.fx do f[3].Enabled = actif end
	end
	if not actif then return end
	PH.base.CFrame = carCF
	for k, f in PH.fx do
		local x = ((k == 1) and -1 or 1) * demi * 0.62 * M
		f[1].Position = Vector3.new(x, 0.15 * M, -long * 0.5 * M)
		f[2].Position = Vector3.new(x * 1.6, -0.9 * M, -(long * 0.5 + 70) * M)
	end
	-- la lampe : 15 m devant, 7 m au-dessus de la route, tournée vers le bitume devant elle
	PH.loin.CFrame = carCF * CFrame.new(0, 7 * M, -15 * M) * CFrame.Angles(-math.rad(42), 0, 0)
end

-- la caisse est-elle DANS une tour ? (p en mètres ; marge : la demi-caisse)
function Ville.heurt(col: Collision?, p: Vector3): boolean
	if not col then return false end
	local CG = 60
	local l = col.g[(math.floor(p.X / CG) + 4096) * 8192 + math.floor(p.Z / CG) + 4096]
	if not l then return false end
	local c = col.c
	for _, o in l do
		if math.abs(p.X - c[o + 1]) < c[o + 4] / 2 + 0.9 and math.abs(p.Z - c[o + 3]) < c[o + 6] / 2 + 0.9 and math.abs(p.Y - c[o + 2]) < c[o + 5] / 2 + 0.5 then
			return true
		end
	end
	return false
end

return Ville
