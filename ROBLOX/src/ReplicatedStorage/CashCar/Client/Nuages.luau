-- CASH CAR — LES NUAGES v8 du jeu web (VERSION PRINCIPALE/index.html : buildCoton L8203, buildClouds L8422, mkCloud L8379).
-- Les 25 gabarits sont CUITS (Nuages/Nxx — outils/cuire-nuages.js : le sculpteur de cumulus et la surface du jeu) ; ici on
-- les POSE, avec les règles du niveau NUAGES :
--   · LE CIEL DE COTON : des archipels près de la route, des nuages au-dessus et en dessous du ruban, la couronne du milieu
--     (0,35-1,3 km), la couche haute, le lointain, les CATHÉDRALES (des congestus qui montent de l'abîme : une porte ou une
--     falaise), les massifs, les titans à enclume, les tours héroïques et LE COLOSSE ;
--   · LES BANCS DE ROUTE : rares, posés pour CACHER LE VIRAGE SUIVANT (leur bord ~160 m avant l'entrée de la courbe) ;
--   · les COUSSINS de vol (par champs de 2-3) et les TOURS géantes.
-- « Les nuages doivent juste BLOQUER LA VUE, rien d'autre » (Sacha) : ni portance ni frein. Dedans : un voile blanc, la
-- brume qui se referme ; un banc percuté au sol ÉCLATE (il rétrécit, reste en miettes, se reforme en 4,5 s).
-- Un gabarit = un maillage ; chaque nuage est sa copie, étirée (largeur, hauteur) et teintée à sa façon.
-- ⚠ Roblox ne sait pas grandir une pièce au-delà de 2 048 studs : un nuage plus gros est RAPPROCHÉ d'autant (même taille
-- à l'écran vu de la route).
local AssetService = game:GetService("AssetService")
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Maillage = require(script.Parent:WaitForChild("Maillage"))
local Recyclage = require(script.Parent:WaitForChild("Recyclage"))
local Perf = require(script.Parent:WaitForChild("Perf"))
local Modules = script.Parent.Parent:WaitForChild("Nuages")
local Liste = require(Modules:WaitForChild("Liste"))
local M = Config.M
local RH = Config.ROAD_HALF
local THICK = Config.THICK

local Nuages = {}
-- les nuages DE JEU (ceux qu'on traverse : bancs de route, coussins, tours) — le guetteur du banc les compte à part (Client/Perf)
Nuages.jeu = setmetatable({}, { __mode = "k" }) :: { [BasePart]: boolean }
-- les nuages de DÉCOR que l'appareil faible ne bâtit pas (Config.FAIBLE.nuagesMilieu, .nuagesLointain) — bâtis avant une bascule en
-- pleine session, ils sont retirés à la bascule
Nuages.legers = setmetatable({}, { __mode = "k" }) :: { [BasePart]: boolean }

local UNITE = 100 -- studs par unité de nuage dans le gabarit
local TAILLE_MAX = 2000 -- studs : la plus grande pièce que Roblox accepte
local BLANC = 1 -- la clarté de la ouate (la lumière est cuite dans les sommets : voir batir)

-- ── les gabarits : un EditableMesh, la LUMIÈRE CUITE dans les couleurs des sommets (outils/cuire-nuages.js : la formule de
-- nuage8Mat du jeu web — frontière d'ombre douce, soleil crème, ombre bleu-lavande) ; toutes les normales pointent vers le
-- HAUT : l'éclairage de Roblox est alors le même sur tout le nuage (il ne fait que multiplier), plus de frontière dure ni de
-- reflet de plastique — c'est la couleur cuite qu'on voit ──
type Gabarit = { p: MeshPart, centre: Vector3, taille: Vector3, fiche: any, em: any, cols: { { number } } }
-- LA PALETTE DE L'HEURE (les trois heures du niveau NUAGES du web : matin, midi, fin d'après-midi) : le côté soleil, l'ombre
-- tournée vers le ciel, l'ombre du ventre — en 0-255. Les sommets portent les INGRÉDIENTS (part de soleil, modelé de l'ombre,
-- part de ciel : outils/cuire-nuages.js) ; la couleur se compose ici, et se recompose quand l'heure change (Nuages.palette).
local K_LUM = 1.3 -- (l'éclairage de Roblox multiplie tout par ~1,3 : les couleurs sont divisées d'autant)
local PAL = { S = Vector3.new(282, 270, 252), OH = Vector3.new(182, 194, 238), OB = Vector3.new(158, 168, 224) }
local function peindre(em: any, cols: { { number } })
	local S, OH, OB = PAL.S, PAL.OH, PAL.OB
	for _, q in cols do
		local o = (OB + (OH - OB) * q[4]) * q[3]
		local c = (o + (S - o) * q[2]) / (K_LUM * 255)
		em:SetColor(q[1], Color3.new(math.clamp(c.X, 0, 1), math.clamp(c.Y, 0, 1), math.clamp(c.Z, 0, 1)))
	end
end
local gabarits: { [number]: Gabarit | false } = {}
local function batir(k: number, fin: boolean?): Gabarit?
	local module = Modules:FindFirstChild(string.format(fin and "F%02d" or "N%02d", k))
	if not module then return nil end
	local okD, d = pcall(require, module)
	if not okD then return nil end
	local ok, em = pcall(function() return AssetService:CreateEditableMesh() end)
	if not ok or not em then
		warn("[CashCar] nuage " .. k .. " refusé (budget de mémoire)")
		return nil
	end
	local v, t = Maillage.decoder(d.v), Maillage.decoder(d.t)
	local nv = buffer.len(v) // 12
	local e = UNITE / 8000
	local mn, mx = Vector3.new(math.huge, math.huge, math.huge), Vector3.new(-math.huge, -math.huge, -math.huge)
	local pts = table.create(nv)
	for i = 0, nv - 1 do
		local o = i * 12
		local p = Vector3.new(buffer.readi16(v, o) * e, buffer.readi16(v, o + 2) * e, buffer.readi16(v, o + 4) * e)
		pts[i + 1] = p
		mn, mx = mn:Min(p), mx:Max(p)
	end
	local centre = (mn + mx) / 2
	local ids, col = table.create(nv), table.create(nv)
	local haut = em:AddNormal(Vector3.yAxis)
	local couleurs: { [number]: number } = {}
	for i = 0, nv - 1 do
		local o = i * 12
		ids[i + 1] = em:AddVertex(pts[i + 1] - centre)
		-- (les teintes voisines partagent leur couleur : 32 niveaux par voie suffisent à un dégradé de ouate)
		local r, g, b = buffer.readu8(v, o + 9) // 8, buffer.readu8(v, o + 10) // 8, buffer.readu8(v, o + 11) // 8
		local cle = r * 1024 + g * 32 + b
		local c = couleurs[cle]
		if not c then
			c = em:AddColor(Color3.fromRGB(r * 8 + 4, g * 8 + 4, b * 8 + 4), 1)
			couleurs[cle] = c
		end
		col[i + 1] = c
	end
	for i = 0, buffer.len(t) - 6, 6 do
		local a, b, c = buffer.readu16(t, i) + 1, buffer.readu16(t, i + 2) + 1, buffer.readu16(t, i + 4) + 1
		local f = em:AddTriangle(ids[a], ids[b], ids[c])
		em:SetFaceNormals(f, { haut, haut, haut })
		em:SetFaceColors(f, { col[a], col[b], col[c] })
	end
	local okF, fige = pcall(function() return AssetService:CreateEditableMeshAsync(Content.fromObject(em), { FixedSize = true }) end)
	if okF and fige then
		em:Destroy()
		em = fige
	end
	-- les ingrédients de chaque couleur, relus sur le maillage figé (ses numéros de couleur ne sont plus ceux d'avant), puis la
	-- palette de l'heure — AVANT de créer la pièce : même si Roblox ne suivait pas les changements, la pièce naît juste
	local cols: { { number } } = {}
	local okC = pcall(function()
		for _, id in em:GetColors() do
			local c = em:GetColor(id)
			table.insert(cols, { id, c.R, c.G * 1.25, c.B })
		end
		peindre(em, cols)
	end)
	if not okC then warn("[CashCar] nuage " .. k .. " : palette refusée") end
	local okP, mp = pcall(function() return AssetService:CreateMeshPartAsync(Content.fromObject(em), { CollisionFidelity = Enum.CollisionFidelity.Box }) end)
	if not okP or not mp then
		warn("[CashCar] nuage " .. k .. " : pièce refusée")
		return nil
	end
	if fin then
		Maillage.suivre(mp, em, buffer.len(t) / 6) -- (la version fine se rend : sa destruction libère le budget)
	else
		Maillage.noter(buffer.len(t) / 6) -- (le compte du budget de triangles)
	end
	mp.Name = "Nuage"
	mp.Anchored = true
	mp.CanCollide = false
	mp.CanQuery = false
	mp.CanTouch = false
	mp.CastShadow = false
	mp.Material = Enum.Material.Plastic -- (mat : en lisse, le soleil y posait des reflets de glace — des icebergs, pas du coton)
	mp.Color = Color3.new(1, 1, 1)
	return { p = mp, centre = centre / UNITE, taille = mp.Size, fiche = Liste[k], em = em, cols = cols }
end
local function gabarit(k: number): Gabarit?
	return gabarits[k] or nil
end
-- ── LA FINESSE DU TOUT PRÈS (N8_FIN du web : la surface d'un nuage suit sa taille à l'écran, 12 / 18 / 26 / 48 cellules) ──
-- Roblox ne tient pas quatre jeux de 25 maillages dans son budget : tous les nuages sont posés en ÉBAUCHE (12 cellules), et ceux
-- qui deviennent GRANDS à l'écran (cotonTick : 73·R / (d − R/2) segments demandés, au-delà de ~13 l'ébauche montre ses facettes)
-- reçoivent une copie FINE (26 cellules) par-dessus l'ébauche cachée. Une version fine coûte ~3 000 triangles, partagés par
-- tous les nuages de son gabarit ; on en tient quelques-unes à la fois, les plus utiles d'abord, et on les rend dès qu'elles
-- ne servent plus (le garage, la carte moteur ont besoin du budget).
type Inscrit = { p: MeshPart, k: number, f: MeshPart?, q: number }
local inscrits: { Inscrit } = {}
local parPiece: { [MeshPart]: Inscrit } = {}
local fins: { [number]: { g: Gabarit?, etat: string, vu: number } } = {}
local FIN_ON, FIN_OFF, FIN_MAX, FIN_MARGE = 0.16, 0.12, 4, 12000 -- (la marge : la carte moteur et un changement de caisse doivent toujours trouver leur place)
local finT = 0
local function inscrire(p: MeshPart, k: number)
	local e = { p = p, k = k, f = nil, q = 0 }
	table.insert(inscrits, e)
	parPiece[p] = e
end
-- la copie fine suit l'ébauche : sa taille (un banc qui éclate), sa place, sa transparence (la caméra dedans)
local function majFin(e: Inscrit)
	local f, p = e.f, e.p
	local g, gf = gabarits[e.k], fins[e.k] and fins[e.k].g
	if not f or not g or not gf then return end
	local ech = p.Size / g.taille
	f.Size = gf.taille * ech
	f.CFrame = p.CFrame * CFrame.new((gf.centre - g.centre) * UNITE * ech)
	if f.Transparency ~= p.Transparency then f.Transparency = p.Transparency end
end
local function oterFin(e: Inscrit)
	if e.f then
		e.f:Destroy()
		e.f = nil
	end
	if e.p.Parent then e.p.LocalTransparencyModifier = 0 end
end
-- un nuage qu'on DÉPLACE à chaque image (les cumulus du titre) : sa copie fine le suit tout de suite
-- un nuage qui part au RECYCLAGE sort de la liste des « fins » : sa copie fine est rendue, son entrée oubliée — sinon, repris par
-- la zone suivante, il serait inscrit deux fois (et sa version fine dédoublée)
function Nuages.desinscrire(p: BasePart)
	Nuages.jeu[p] = nil
	Nuages.legers[p :: any] = nil
	local e = parPiece[p :: any]
	if not e then return end
	oterFin(e)
	parPiece[p :: any] = nil
	local i = table.find(inscrits, e)
	if i then
		inscrits[i] = inscrits[#inscrits]
		inscrits[#inscrits] = nil
	end
end
Recyclage.surRendre.N = Nuages.desinscrire
function Nuages.suivreFin(p: MeshPart)
	local e = parPiece[p]
	if e and e.f then majFin(e) end
end
-- à chaque image (le pilote) : `cam` = la caméra en course ; nil au menu et au garage → toutes les versions fines sont rendues
function Nuages.finesseTick(dt: number, cam: Vector3?)
	finT -= dt
	if finT > 0 then return end
	finT = 0.2
	local maintenant = os.clock()
	-- 1) chaque nuage vivant et montré : combien de segments il demande
	local voulus: { [number]: number } = {}
	local i = 1
	while i <= #inscrits do
		local e = inscrits[i]
		local p = e.p
		if not p.Parent then
			-- (sa zone a été détruite : il sort de la liste)
			oterFin(e)
			parPiece[p] = nil
			inscrits[i] = inscrits[#inscrits]
			inscrits[#inscrits] = nil
			continue
		end
		local q = 0
		if cam and p:IsDescendantOf(workspace) then
			local R = math.max(p.Size.X, p.Size.Y, p.Size.Z) * 0.5
			local d = (p.Position - cam).Magnitude
			q = R / math.max(1, d - R * 0.5)
		end
		e.q = q
		if q > (e.f and FIN_OFF or FIN_ON) then voulus[e.k] = math.max(voulus[e.k] or 0, q) end
		i += 1
	end
	-- 2) les gabarits fins à tenir : les plus demandés d'abord, tant que le budget le permet
	local ordre = {}
	for k, q in voulus do
		if k ~= 24 then table.insert(ordre, { k, q }) end
	end
	table.sort(ordre, function(a, b) return a[2] > b[2] end)
	local tenus = 0
	local finMax = Perf.faible and (Perf.F.nuagesFins or FIN_MAX) or FIN_MAX -- (APPAREIL FAIBLE : chaque version fine se bâtit en pleine course)
	for _, v in ordre do
		local k = v[1]
		local F = fins[k]
		if tenus >= finMax then
			voulus[k] = nil
			continue
		end
		if not F then
			local tri = (Liste[k] and Liste[k].fin) or 4000
			if Maillage.libre() - tri > FIN_MARGE then
				F = { g = nil, etat = "charge", vu = maintenant }
				fins[k] = F
				task.spawn(function()
					local g = Maillage.seul(batir, k, true)
					if fins[k] ~= F then
						if g then g.p:Destroy() end
						return
					end
					F.g = g
					F.etat = g and "pret" or "refus"
				end)
			else
				voulus[k] = nil
				continue
			end
		end
		F.vu = maintenant
		tenus += 1
	end
	-- 3) chaque nuage : sa copie fine (si son gabarit fin est prêt et qu'il la demande), ou son ébauche
	for _, e in inscrits do
		local F = fins[e.k]
		local veut = voulus[e.k] ~= nil and e.q > (e.f and FIN_OFF or FIN_ON) and F ~= nil and F.etat == "pret"
		if veut and not e.f then
			local f = (F :: any).g.p:Clone()
			f.Color = e.p.Color
			f.Parent = e.p.Parent
			e.f = f
			e.p.LocalTransparencyModifier = 1
			majFin(e)
		elseif not veut and e.f then
			oterFin(e)
		elseif e.f then
			majFin(e)
		end
	end
	-- 4) les gabarits fins qui ne servent plus depuis 3 s (tout de suite hors de la course) : rendus au budget
	for k, F in fins do
		if F.etat ~= "charge" and (not cam or maintenant - F.vu > 3) then
			for _, e in inscrits do
				if e.k == k and e.f then oterFin(e) end
			end
			if F.g then F.g.p:Destroy() end
			fins[k] = nil
		end
	end
end

-- L'HEURE CHANGE : tous les nuages (les 25 gabarits et les versions fines chargées) reprennent la palette — leurs copies
-- partagent leur maillage, elles suivent toutes seules
function Nuages.palette(S: Vector3, OH: Vector3, OB: Vector3)
	if PAL.S == S and PAL.OH == OH and PAL.OB == OB then return end
	PAL.S, PAL.OH, PAL.OB = S, OH, OB
	for _, g in gabarits do
		if g then pcall(peindre, g.em, g.cols) end
	end
	for _, F in fins do
		if F.g then pcall(peindre, F.g.em, F.g.cols) end
	end
end

-- les 25 gabarits, bâtis UNE fois, l'un après l'autre (0 = pas commencé, 1 = en cours, 2 = prêts) : qui arrive pendant
-- qu'ils se bâtissent ATTEND — sinon une deuxième zone se bâtirait sans eux
local etatGabarits = 0
function Nuages.modeles(ceder: (() -> ())?)
	if etatGabarits == 2 then return end
	if etatGabarits == 1 then
		while etatGabarits ~= 2 do task.wait() end
		return
	end
	etatGabarits = 1
	for k = 0, 24 do
		gabarits[k] = Maillage.seul(batir, k) or false
		if gabarits[k] then (gabarits[k] :: any).p:SetAttribute("Rec", "N" .. k) end -- (ses copies passent au recyclage : voir Client/Recyclage)
		if ceder then ceder() end
	end
	etatGabarits = 2
end

-- ── le tirage des gabarits (COTON_GENRES, COTON_POIDS, cotonKind, cotonDe) ──
local GENRES = { "humilis", "humilis", "mediocris", "mediocris", "mediocris", "congestus", "congestus", "congestus", "castellanus", "castellanus", "fractus",
	"stratocumulus", "stratocumulus", "altocumulus", "altocumulus", "cisaille", "cisaille", "champignon" }
local POIDS = { pres = {}, mil = {}, loin = {} }
do
	local C = { pres = { 2, 1, 0.3, 2, 0.8, 1.2 }, mil = { 1.4, 1, 1, 1, 1, 1.4 }, loin = { 1, 1.2, 2, 0.4, 1.2, 1 } }
	local W = { humilis = { 2.2, 1, 0.8 }, mediocris = { 1.6, 1.4, 1.2 }, congestus = { 0.3, 1.3, 2.2 }, castellanus = { 0.8, 1.2, 1 }, fractus = { 1.6, 0.6, 0.2 },
		stratocumulus = { 0.8, 1.3, 1.6 }, altocumulus = { 1.2, 1.4, 0.6 }, cisaille = { 0.3, 1, 1.4 }, champignon = { 0.1, 0.6, 1.6 } }
	for j, q in { "pres", "mil", "loin" } do
		for k = 1, 6 do table.insert(POIDS[q], C[q][k] * 0.55) end
		for _, g in GENRES do table.insert(POIDS[q], W[g][j]) end
	end
end
local function tire(rnd: Random, w: { number }): number -- rend l'indice du gabarit (0-23)
	local s = 0
	for _, x in w do s += x end
	local u = rnd:NextNumber() * s
	for k, x in w do
		u -= x
		if u <= 0 then return k - 1 end
	end
	return 0
end
local function parmi(rnd: Random, liste: { any }): number -- un gabarit parmi ces genres (ou ces numéros)
	local l = {}
	for _, g in liste do
		if type(g) == "number" then
			table.insert(l, g)
		else
			for k, nom in GENRES do
				if nom == g then table.insert(l, 5 + k) end
			end
		end
	end
	return l[rnd:NextInteger(1, #l)]
end
-- une TAILLE en loi de puissance : beaucoup de petits, quelques géants
local function taille(rnd: Random, a: number, b: number, p: number): number
	return a * (b / a) ^ (rnd:NextNumber() ^ p)
end

export type Nuage = { p: MeshPart, c: Vector3, r: number, ry: number, route: boolean, base: Vector3, echelle: Vector3, casse: number, dedans: boolean }

-- Bâtit le ciel et les nuages de jeu d'une piste. Rend la liste des nuages qu'on TRAVERSE (bancs, coussins, tours).
-- (decor : le ciel de coton SEUL, sans les nuages qu'on traverse — la piste de l'auto-école)
function Nuages.batir(piste: any, dossier: Instance, graine: number, ceder: (() -> ())?, decor: boolean?): { Nuage }
	Nuages.modeles(ceder)
	local rnd = Random.new(graine)
	local function cr(): number return rnd:NextNumber() end
	local F = piste.F
	local NP = piste.n
	local L = piste.len / M
	local DS = piste.DS / M
	local traverses: { Nuage } = {}
	-- la garde : un nuage ne mord jamais sur le ruban (cotonTouche) — la piste en cases de 120 m, un point tous les ~18 m
	local pasG = math.max(1, math.floor(18 / DS + 0.5))
	local grille: { [number]: { Vector3 } } = {}
	for i = 1, NP, pasG do
		local p = F[i].Position / M
		local k = (math.floor(p.X / 120) + 512) * 1024 + math.floor(p.Z / 120) + 512
		local l = grille[k]
		if not l then
			l = {}
			grille[k] = l
		end
		table.insert(l, p)
	end
	local function touche(x: number, y: number, z: number, r: number, ry: number): boolean
		local rh, rv = r + RH + 18, ry + 22
		local ih, iv = 1 / (rh * rh), 1 / (rv * rv)
		local n = math.ceil(rh / 120)
		local cx, cz = math.floor(x / 120), math.floor(z / 120)
		for a = -n, n do
			for b = -n, n do
				local l = grille[(cx + a + 512) * 1024 + cz + b + 512]
				if l then
					for _, p in l do
						local dx, dz, dy = p.X - x, p.Z - z, p.Y - y
						if (dx * dx + dz * dz) * ih + dy * dy * iv < 1 then return true end
					end
				end
			end
		end
		return false
	end
	local nb = 0
	-- poser un nuage (cotonPose) : son DESSOUS à yB, près du point de piste `ref` ; refusé s'il toucherait le ruban
	-- `leger` : un nuage de décor que l'APPAREIL FAIBLE ne bâtit pas — tous les tirages sont faits avant (le hasard, la garde du ruban) :
	-- le ciel qui reste et les nuages de JEU qui suivent sont exactement ceux du PC ; rend vrai si le nuage a (ou aurait) sa place
	local function pose(ref: Vector3, x: number, yB: number, z: number, r: number, k: number, syF: number?, sansGarde: boolean?, leger: boolean?): any
		local g = gabarit(k)
		if not g then return nil end
		local gn = g.fiche.genre
		local sx = 0.86 + cr() * 0.44
		local sy0 = (gn == "fractus" or gn == "altocumulus" or gn == "stratocumulus") and (0.75 + cr() * 0.25) or (0.85 + cr() * 0.3)
		local sy = syF or sy0
		-- (la lumière est cuite pour le soleil du ciel : un nuage ne tourne plus que de ±0,4 rad sur lui-même, son côté clair reste au soleil)
		local cap, l9, w9, lourd = (cr() - 0.5) * 0.8, 0.82 + cr() * 0.22, (cr() - 0.5) * 2, cr() < 0.12
		-- Roblox : pas plus de 2 048 studs par pièce → un nuage trop gros est rapproché de la route d'autant
		local plus = math.max(g.taille.X * sx, g.taille.Y * sy, g.taille.Z) / UNITE * r * M
		if plus > TAILLE_MAX then
			local q = TAILLE_MAX / plus
			x, yB, z = ref.X + (x - ref.X) * q, ref.Y + (yB - ref.Y) * q, ref.Z + (z - ref.Z) * q
			r *= q
		end
		local h = (g.fiche.sommet - g.fiche.base) * r * sy
		if not sansGarde and touche(x, yB + h * 0.5, z, r * 1.02 * sx, h * 0.5 + r * 0.05) then return nil end
		if leger and Perf.faible then return true end
		local origine = Vector3.new(x, yB - g.fiche.base * r * sy, z) * M
		local ech = Vector3.new(r * sx, r * sy, r) * (M / UNITE)
		local rot = CFrame.Angles(0, cap, 0)
		local p = Recyclage.copie(g.p) :: MeshPart
		p.Size = g.taille * ech
		p.CFrame = CFrame.new(origine) * rot * CFrame.new(g.centre * UNITE * ech)
		-- SA TEINTE : clair ou sourd, chaud ou froid, parfois lourd — en sourdine (30 %), comme la matière du jeu
		local tr, tv, tb = l9 * (1 + 0.2 * w9) * (lourd and 0.8 or 1), l9 * (1 + 0.02 * w9) * (lourd and 0.83 or 1), l9 * (1 - 0.22 * w9) * (lourd and 0.95 or 1)
		-- (× BLANC : à 1, sous le soleil de Roblox, toute la face éclairée partait au blanc pur, sans modelé)
		p.Color = Color3.new(math.min(1, 1 + (tr - 1) * 0.3) * BLANC, math.min(1, 1 + (tv - 1) * 0.3) * BLANC, math.min(1, 1 + (tb - 1) * 0.3) * BLANC)
		p.Parent = dossier
		inscrire(p, k)
		if leger then Nuages.legers[p] = true end
		nb += 1
		if ceder and nb % 12 == 0 then ceder() end
		return p
	end
	-- (APPAREIL FAIBLE) un sur `nuagesMilieu` dans la couronne du milieu et la couche haute, et pas d'horizon
	local pasM = math.max(1, Perf.F.nuagesMilieu or 1)
	local function milieu(k: number): boolean return k % pasM ~= 0 end
	local function strat(k: number, K: number): number return math.min(NP, math.floor(((k + 0.18 + cr() * 0.64) / K) * NP) + 1) end
	local function pt(i: number): Vector3 return F[i].Position / M end
	local function travers(i: number): (number, number) -- le travers HORIZONTAL du ruban
		local t = F[i].LookVector
		local l = math.sqrt(t.X * t.X + t.Z * t.Z)
		if l < 1e-6 then return 1, 0 end
		return -t.Z / l, t.X / l
	end

	-- ════ LE CIEL DE COTON (buildCoton) — réglages du niveau NUAGES : deux fois moins de nuages, ×1,9 plus gros ════
	-- L'ORAGE (L8231, L8456) : « plus de nuages partout, au point que ça gêne la visibilité » — des nuages à la taille d'origine mais
	-- ×1,6 plus nombreux, des MURS de ouate au ras de la route, un PLAFOND bas, un banc sur la route tous les 300-600 m. Le lointain
	-- (au-delà de la brume de l'orage, ~1 km) n'est pas bâti : ce serait de la brume pure.
	local OR = piste.variante == "orage"
	local GZ, NZ = OR and 1 or 1.9, OR and 1 or 0.5
	local function KK(n: number): number return math.max(1, math.floor(n * (OR and 1.6 or 0.5) + 0.5)) end
	-- (1) LA COURONNE PROCHE, en ARCHIPELS : un grand et ses satellites, du ciel ouvert entre deux
	for k = 0, KK(30) - 1 do
		local i = strat(k, KK(30))
		local p = pt(i)
		local qx, qz = travers(i)
		local sg = (cr() < 0.5) and -1 or 1
		local r = taille(rnd, 30 * GZ, 160 * GZ, 1.5)
		local kk = tire(rnd, POIDS.pres)
		local yB = p.Y - 130 + cr() * 300
		local d = RH + r + 50 + cr() * 300
		local cx, cz, ok = 0, 0, false
		for _ = 1, 3 do
			cx, cz = p.X + qx * sg * d, p.Z + qz * sg * d
			if pose(p, cx, yB, cz, r, kk) then
				ok = true
				break
			end
			d += 110
		end
		if ok then
			local t9 = F[i].LookVector
			for m = 0, cr() < 0.5 and 0 or 1 do
				local a = ((m > 0) and -1 or 1) * (1.5 + cr() * 1.1) * r
				local rs = r * (0.4 + cr() * 0.3)
				pose(p, cx + t9.X * a + qx * sg * (cr() - 0.3) * r, yB + (cr() - 0.5) * r * 0.3, cz + t9.Z * a + qz * sg * (cr() - 0.3) * r, rs, tire(rnd, POIDS.pres))
			end
		end
	end
	-- (2) AU-DESSUS et EN DESSOUS du ruban
	for k = 0, KK(26) - 1 do
		local i = strat(k, KK(26))
		local p = pt(i)
		local qx, qz = travers(i)
		local r = taille(rnd, 24 * GZ, 130 * GZ, 1.5)
		local kk = tire(rnd, POIDS.pres)
		local f = Liste[kk]
		local h = (f.sommet - f.base) * r * 1.3
		local lat = (cr() - 0.5) * 120
		local yB = (cr() < 0.6) and (p.Y + 70 + cr() * 190) or (p.Y - (THICK + 60 + cr() * 170) - h)
		pose(p, p.X + qx * lat, yB, p.Z + qz * lat, r, kk)
	end
	-- (3) LA COURONNE DU MILIEU : 0,35-1,3 km, tout autour
	for k = 0, KK(116) - 1 do
		local p = pt(strat(k, KK(116)))
		local a, d, r = cr() * 6.2832, (350 + cr() * 950) * 1.12, taille(rnd, 50 * GZ, 330 * GZ, 1.6)
		pose(p, p.X + math.cos(a) * d, p.Y - 210 + cr() * 520, p.Z + math.sin(a) * d, r, tire(rnd, POIDS.mil), nil, nil, milieu(k))
	end
	-- (4) LA COUCHE HAUTE : des cumulus qui se découpent sur le ciel
	local K4 = math.floor(44 * NZ + 0.5)
	for k = 0, K4 - 1 do
		local p = pt(strat(k, K4))
		local a, d, r = cr() * 6.2832, 260 + cr() * 1700, taille(rnd, 60 * GZ, 300 * GZ, 1.5)
		pose(p, p.X + math.cos(a) * d, p.Y + 230 + cr() * 420, p.Z + math.sin(a) * d, r, tire(rnd, POIDS.mil), nil, nil, milieu(k))
	end
	if OR then
		-- LES MURS : au ras de la route, de chaque côté, à hauteur de caisse — la route file dans un couloir de ouate : on ne voit plus
		-- d'où vient le virage, seulement la route devant soi, et l'éclair qui éclaire le couloir
		for k = 0, 29 do
			local i = strat(k, 30)
			local p = pt(i)
			local qx, qz = travers(i)
			local sg = (cr() < 0.5) and -1 or 1
			local r = taille(rnd, 40, 120, 1.3)
			local kk = tire(rnd, POIDS.pres)
			local dd = RH + r * 0.8 + 20 + cr() * 40
			for _ = 1, 3 do
				if pose(p, p.X + qx * sg * dd, p.Y - r * 0.45 + cr() * 30, p.Z + qz * sg * dd, r, kk) then break end
				dd += 40
			end
		end
		-- LE PLAFOND : de grands nuages plats et bas, 70-170 m au-dessus de la route, sur elle et autour — le ciel se referme
		for k = 0, 41 do
			local i = strat(k, 42)
			local p = pt(i)
			local qx, qz = travers(i)
			local lat, r = (cr() - 0.5) * 900, taille(rnd, 110, 230, 1.2)
			pose(p, p.X + qx * lat, p.Y + 70 + cr() * 100, p.Z + qz * lat, r, parmi(rnd, { "stratocumulus", "stratocumulus", "humilis", 1, 4 }), 0.8 + cr() * 0.25)
		end
	end
	-- (5) LE LOINTAIN : l'horizon a ses nuages
	local K5 = OR and 0 or math.floor(80 * NZ + 0.5)
	for k = 0, K5 - 1 do
		local p = pt(strat(k, K5))
		local a, d, r = cr() * 6.2832, 1200 + cr() * 1400, taille(rnd, 120 * GZ, 560 * GZ, 1.4)
		pose(p, p.X + math.cos(a) * d, p.Y - 260 + cr() * 700, p.Z + math.sin(a) * d, r, tire(rnd, POIDS.loin), nil, nil, Perf.F.nuagesLointain == false)
	end
	-- (7) LES CATHÉDRALES : de grands congestus qui montent de l'abîme — une PORTE (les deux côtés) ou une FALAISE (un seul)
	local K7 = math.max(3, math.floor(L / (OR and 1400 or 2000))) -- (aux NUAGES : moins de cathédrales, plus grosses — pas à l'orage)
	for k = 0, K7 - 1 do
		local i = strat(k, K7)
		local p = pt(i)
		local qx, qz = travers(i)
		local cotes = (cr() < 0.45) and { -1, 1 } or { (cr() < 0.5) and -1 or 1 }
		for _, sg in cotes do
			local r = (220 + cr() * 120) * (OR and 1 or 1.45)
			local kk = parmi(rnd, { "congestus", "cisaille", "champignon", 2 })
			local yB = p.Y - (220 + cr() * 120)
			local dd = RH + r * 1.25 + 60 + cr() * 230
			local sy = 1 + cr() * 0.15
			for _ = 1, 3 do
				if pose(p, p.X + qx * sg * dd, yB, p.Z + qz * sg * dd, r, kk, sy) then break end
				dd += 90
			end
		end
	end
	-- (6) MASSIFS, TITANS à enclume, TOURS HÉROÏQUES et LE COLOSSE
	for k = 0, OR and -1 or 5 do
		local p = pt(strat(k, 6))
		local a, d, r = cr() * 6.2832, 900 + cr() * 1300, 280 + cr() * 300
		pose(p, p.X + math.cos(a) * d, p.Y - 320 + cr() * 160, p.Z + math.sin(a) * d, r, parmi(rnd, { 2, 0, "congestus", "champignon", "stratocumulus" }))
	end
	for k = 0, OR and -1 or 2 do
		local p = pt(strat(k, 3))
		local a, d, r = cr() * 6.2832, 1700 + cr() * 1500, (600 + cr() * 450) * 0.7
		pose(p, p.X + math.cos(a) * d, p.Y - 420 + cr() * 200, p.Z + math.sin(a) * d, r, 24)
	end
	for k = 0, 2 do
		local p = pt(strat(k, 3))
		local a, d, r = cr() * 6.2832, 520 + cr() * 380, (200 + cr() * 140) * (OR and 1 or 1.5)
		for t = 0, 2 do
			if pose(p, p.X + math.cos(a) * (d + t * 160), p.Y - 300 + cr() * 80, p.Z + math.sin(a) * (d + t * 160), r, parmi(rnd, { "congestus", "cisaille" })) then break end
		end
	end
	if not OR then
		local p = pt(math.clamp(math.floor(NP * (0.6 + cr() * 0.15)), 1, NP))
		local a, d = cr() * 6.2832, 1500 + cr() * 700
		pose(p, p.X + math.cos(a) * d, p.Y - 380, p.Z + math.sin(a) * d, (760 + cr() * 300) * 0.75, 24)
	end

	if decor then return traverses end

	-- ════ LES NUAGES DE JEU (buildClouds) : ceux qu'on traverse ════
	-- un nuage de jeu (mkCloud v8) : centré sur c, rayon r ; rend sa fiche pour le suivi (dedans / dehors)
	local function jeu(c: Vector3, r: number, genres: { any }, route: boolean)
		local kk = parmi(rnd, genres)
		local g = gabarit(kk)
		if not g then return end
		local ry = (g.fiche.sommet - g.fiche.base) * r * 0.5
		-- (mkCloud centre le maillage sur son milieu : le dessous est à c.y − ry)
		if not route and touche(c.X, c.Y, c.Z, r * 1.1, ry) then return end
		local cap = (cr() - 0.5) * 0.8
		local ech = Vector3.new(r, r, r) * (M / UNITE)
		local p = Recyclage.copie(g.p) :: MeshPart
		p.Size = g.taille * ech
		p.Color = Color3.new(BLANC, BLANC, BLANC)
		local milieu = (g.fiche.base + g.fiche.sommet) * 0.5
		local base = Vector3.new(c.X, c.Y - milieu * r, c.Z) * M
		p.CFrame = CFrame.new(base) * CFrame.Angles(0, cap, 0) * CFrame.new(g.centre * UNITE * ech)
		p.Parent = dossier
		inscrire(p, kk)
		Nuages.jeu[p] = true
		-- (« dedans » = l'ellipsoïde r × ry autour du centre, comme dans le jeu web)
		table.insert(traverses, { p = p, c = c * M, r = r * M, ry = ry * M, route = route, base = p.Position, echelle = p.Size, casse = 0, dedans = false })
		nb += 1
		if ceder and nb % 12 == 0 then ceder() end
	end
	-- la courbure de la piste (rad/m) autour de s, mesurée sur ±8 m
	local function courbe(sp: number): number
		local a = math.max(1, math.floor(8 / DS + 0.5))
		local i = math.clamp(math.floor(math.clamp(sp, 0, L) / DS + 0.5), 0, NP - 1)
		local i0, i1 = math.max(0, i - a), math.min(NP - 1, i + a)
		return math.acos(math.min(1, F[i0 + 1].LookVector:Dot(F[i1 + 1].LookVector))) / math.max(1, (i1 - i0) * DS)
	end
	-- l'entrée du prochain VIRAGE (rayon < 200 m) précédé d'une portion droite, entre s0+150 et s0+1200 — ou −1
	local function virage(s0: number, deja: number): number
		local c = s0 + 150
		while c < math.min(L - 320, s0 + 1200) do
			if courbe(c) >= 1 / 200 and courbe(c - 12) < 1 / 200 and math.abs(c - deja) >= 120 then
				local m, n = 0, 0
				local q = c - 210
				while q < c - 10 do
					m += courbe(q)
					n += 1
					q += 10
				end
				if m / n < 1 / 330 then return c end
			end
			c += 8
		end
		return -1
	end
	-- LES BANCS de route : rares ; chacun cache le virage suivant
	do
		local dernier = -1e9
		local sp = (OR and 420 or 1600) + cr() * (OR and 300 or 900)
		while sp < L - 300 do
			if cr() >= (OR and 0.06 or 0.4) then
				local mega = cr() < (OR and 0.45 or 0.1)
				-- (à l'orage, un banc sur quatre ne couvre qu'UN côté de la route : on le frôle, on ne sait pas ce qu'il cache)
				local dl9 = 0
				if OR and not mega and cr() < 0.5 then dl9 = ((cr() < 0.5) and -1 or 1) * RH * (0.35 + cr() * 0.3) end
				local s9 = sp
				local r9 = mega and 55 or 25
				local c9 = OR and -1 or virage(sp, dernier) -- (l'orage se roule À L'AVEUGLE : ses bancs ne choisissent pas leur place)
				if c9 >= 0 then
					dernier = c9
					s9 = math.max(sp, c9 - 160 - r9)
				elseif not OR and courbe(sp) >= 1 / 300 then
					local q = sp + 20
					while q < math.min(L - 320, sp + 600) do
						if courbe(q) < 1 / 330 then
							s9 = q
							break
						end
						q += 20
					end
				end
				local f = F[math.clamp(math.floor(s9 / DS) + 1, 1, NP)]
				local r = mega and ((OR and 58 or 40) + cr() * (OR and 36 or 30)) or ((OR and 30 or 18) + cr() * (OR and 18 or 14))
				local c = f.Position / M + f.UpVector * (mega and (6 + cr() * 4) or (2.5 + cr() * 2)) + f.RightVector * dl9
				jeu(c, r, (r > 34) and { "mediocris" } or { "humilis" }, true)
			end
			sp += OR and (300 + cr() * 300) or (1900 + cr() * 1400)
		end
	end
	-- les CHAMPS de coussins de vol : par 2-3, échelonnés le long de la piste
	for k = 0, 4 do
		local i0 = strat(k, 5)
		local dessus = cr() < 0.62
		for m9 = 0, 1 + math.floor(cr() * 2) do
			local i = math.min(NP, i0 + m9 * (40 + math.floor(cr() * 50)))
			local r9 = 34 + cr() * 28
			local f = F[i]
			local c = f.Position / M + f.RightVector * ((cr() * 2 - 1) * 70)
				+ f.UpVector * (dessus and (r9 * 0.55 + 30 + cr() * 44) or -(r9 * 0.55 + THICK + 32 + cr() * 60))
			jeu(c, r9, { "mediocris", "humilis", "mediocris", "humilis", "congestus" }, false)
		end
	end
	-- les TOURS géantes, alternées gauche / droite, écartées de tout leur rayon
	for k = 0, 4 do
		local i = strat(k, 5)
		local r9 = math.min(200 + cr() * 220, TAILLE_MAX / (2.6 * M))
		local off = (r9 + RH + 60 + cr() * 420) * ((k % 2 == 1) and 1 or -1)
		local f = F[i]
		jeu(f.Position / M + f.RightVector * off + f.UpVector * (-140 + cr() * 330), r9, { "congestus" }, false)
	end
	return traverses
end

-- LA BASCULE en pleine session (Client/Perf) : le décor « léger » déjà bâti s'en va — ni les nuages de jeu, ni ceux du titre
Perf.surBascule(function(oui: boolean)
	if not oui then return end
	local l = {}
	for p in Nuages.legers do table.insert(l, p) end
	for _, p in l do
		Nuages.desinscrire(p)
		p:Destroy()
	end
end)

-- À chaque image : où est la caisse par rapport aux nuages qu'on traverse ? Rend à quel point on est DEDANS (0-1) et
-- ce qui vient d'arriver ("entre", "defonce", "sort", "percee" ou nil), avec le nuage.
function Nuages.suivre(liste: { Nuage }, car: Vector3, cam: Vector3, auSol: boolean, kmh: number, dt: number): (number, string?, Nuage?)
	local dedans, quoi, lequel = 0, nil, nil
	for _, c in liste do
		local d = car - c.c
		local d2 = (d.X * d.X + d.Z * d.Z) / (c.r * c.r) + (d.Y * d.Y) / (c.ry * c.ry)
		-- DÉFONCÉ : il éclate vite, reste en miettes, puis se reforme sur la fin
		if c.casse > 0 then
			c.casse -= dt
			local bt = c.casse
			local sc = (bt > 4.0) and (1 - (4.5 - bt) / 0.5 * 0.92) or ((bt > 1.5) and 0.08 or (0.08 + (1.5 - bt) / 1.5 * 0.92))
			c.p.Size = c.echelle * ((bt <= 0) and 1 or math.max(0.06, sc))
		end
		if d2 < 1 then
			local k = 1 - math.sqrt(d2)
			if k > dedans then dedans = k end
			if not c.dedans then
				c.dedans = true
				quoi, lequel = "entre", c
				if auSol and c.casse <= 0 then
					c.casse = 4.5
					quoi = "defonce"
				end
			end
		elseif c.dedans and d2 > 1.3 then
			c.dedans = false
			quoi, lequel = (c.route and auSol and kmh > 140) and "percee" or "sort", c
		end
		-- la caméra dans le nuage : la ouate vue de dedans n'a pas d'envers — elle s'efface
		local e = cam - c.c
		local dc = (e.X * e.X + e.Z * e.Z) / (c.r * c.r) + (e.Y * e.Y) / (c.ry * c.ry)
		local t = (dc < 1.1) and 0.82 or 0
		if c.p.Transparency ~= t then c.p.Transparency = t end
		local e = parPiece[c.p]
		if e and e.f then majFin(e) end
	end
	return dedans, quoi, lequel
end
-- un nuage SEUL, centré sur lui-même (les cumulus du titre) : rend la pièce, et le décalage à ajouter au centre voulu (studs)
function Nuages.seul(k: number, r: number): (MeshPart?, Vector3)
	Nuages.modeles()
	local g = gabarit(k)
	if not g then return nil, Vector3.zero end
	local rr = math.min(r, TAILLE_MAX / (math.max(g.taille.X, g.taille.Y, g.taille.Z) / UNITE * M))
	local ech = Vector3.new(rr, rr, rr) * (M / UNITE)
	local p = g.p:Clone()
	p.Size = g.taille * ech
	p.Color = Color3.new(BLANC, BLANC, BLANC)
	inscrire(p, k) -- (les cumulus du titre ont droit à leur version fine, comme sur le web : ils sont tout près)
	local milieu = (g.fiche.base + g.fiche.sommet) * 0.5
	return p, g.centre * UNITE * ech - Vector3.new(0, milieu * rr * M, 0)
end
-- remettre les nuages d'une zone à neuf (nouvelle partie)
function Nuages.remettre(liste: { Nuage })
	for _, c in liste do
		c.casse, c.dedans = 0, false
		c.p.Size = c.echelle
		c.p.Transparency = 0
	end
end

return Nuages
