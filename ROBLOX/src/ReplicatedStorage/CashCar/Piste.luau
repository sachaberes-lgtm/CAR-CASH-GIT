-- CASH CAR — LA PISTE : le ruban de route suspendu dans le ciel, calculé à partir d'une GRAINE.
-- Le serveur ne tire que la graine ; chaque joueur calcule la même route chez lui (Random.new est
-- déterministe) : zéro pièce de route sur le réseau, et la physique lit des nombres, jamais des pièces.
--
-- Comme genCtrl du jeu web (index.html L8841) : une TORTUE avance motif après motif — grands virages,
-- épingles, esses, vagues, plongeons, lignes d'élan, chicanes — et la route ne fait que DESCENDRE. Tous
-- les 1600-2600 m, un MODULE du niveau NUAGES : le FILET (la route repasse 48 m plus bas, pile où atterrit
-- la caisse qui sort du virage par le bord), les LACETS (épingles empilées), les MONTAGNES RUSSES, le GRAND
-- PLONGEON, le DOS DE CHAMEAU. Un motif qui passerait À TRAVERS la route déjà posée est refusé ; passer
-- franchement dessous ou dessus est permis : c'est là que le vol devient un raccourci.
--
-- Pas de dévers (le jeu web n'en a pas) : la route reste à plat en travers.
-- Repère d'un échantillon (CFrame, en studs) : LookVector = sens de la route, UpVector = normale du
-- dessus, RightVector = la droite du pilote. Position = milieu du bitume, sur la face du dessus.
local Config = require(script.Parent:WaitForChild("Config"))
local P = Config.PISTE
local M = Config.M
local RH = Config.ROAD_HALF

export type Objet = { s: number, lat: number, h: number, face: number, kind: string, pw: string?, grp: number?, r: number?, fruit: number?, ligne: boolean? }
export type Piste = {
	graine: number, zone: number, niveau: string, variante: string?, entree: { number }?, DS: number, n: number, len: number, F: { CFrame },
	minY: number, grille: { [number]: { number } }, cellule: number,
	objets: { Objet }, modules: { { a: number, b: number, nom: string } },
}

local Piste = {}

local function lisse(u: number): number
	u = math.clamp(u, 0, 1)
	return u * u * (3 - 2 * u)
end
local function cle(x: number, y: number, z: number): number
	return (x + 4096) * 67108864 + (y + 4096) * 8192 + (z + 4096)
end

-- Génère la zone `zone` à partir de la pose `depart` (CFrame en studs ; nil = l'origine du monde).
-- `ceder` (facultatif) est appelé entre deux motifs : on étale le calcul sur plusieurs images.
-- `ecole` = la piste DESSINÉE de l'auto-école (genTuto, L8765) : douze tronçons écrits à la main, pas de hasard.
function Piste.generer(graine: number, zone: number, depart: CFrame?, ceder: (() -> ())?, ecole: boolean?): Piste
	local rnd = Random.new(graine * 97 + zone * 7919)
	local function r(a: number, b: number): number return a + rnd:NextNumber() * (b - a) end
	local niv: string = ecole and "nuages" or Config.niveau(zone).id
	local variante: string? = (not ecole) and Config.niveau(zone).var or nil
	local VILLE, ESPACE = niv == "ville", niv == "espace"
	local LV = 1 + (zone - 1) * 0.35          -- lvPiste : plus on va vite, plus les rayons s'ouvrent
	-- L'AUTOROUTE ORBITALE (ESP_ROUTE, L8845) : en ESPACE la piste est dessinée pour 30 % de vitesse en plus
	if ESPACE then LV *= 1.3 end
	-- LES PENTES COMPRIMÉES (VILLE_PENTE, ESP_ROUTE.pente) : sous le seuil rien ne bouge ; au-delà, seule une part de l'excès passe —
	-- entre les tours chaque façade MESURE la pente (48° → 30°) ; en orbite, à gravité ÷2, le relief devient une houle (≤ ~10°)
	local SEUIL, GARDE = 9, 1
	if VILLE then SEUIL, GARDE = 0.30, 0.35 elseif ESPACE then SEUIL, GARDE = 0.14, 0.4 end
	local function comprime(p: number): number
		local a = math.abs(p)
		if a <= SEUIL then return p end
		return math.sign(p) * (SEUIL + (a - SEUIL) * GARDE)
	end
	local RS = 1.25 * LV
	local LEN = P.longueur * (1 + math.min(1.1, (zone - 1) * 0.25))
	local DS = P.pas

	-- ── la tortue (en MÈTRES) ──
	local pos: Vector3, lacet: number
	if depart then
		pos = depart.Position / M
		local lk = depart.LookVector
		lacet = math.atan2(-lk.X, -lk.Z)
	else
		pos = Vector3.new(0, P.yDepart, 0)
		lacet = 0
	end
	local pente = 0 -- tangente de la pente (négatif = on descend)
	local pts: { Vector3 } = { pos }
	local grilleM: { [number]: { number } } = {}
	local CELM = P.cellule

	local function cellOf(v: Vector3)
		return math.floor(v.X / CELM), math.floor(v.Y / CELM), math.floor(v.Z / CELM)
	end
	local function inscrire(i: number)
		local cx, cy, cz = cellOf(pts[i])
		local k = cle(cx, cy, cz)
		local l = grilleM[k]
		if not l then l = {}; grilleM[k] = l end
		table.insert(l, i)
	end
	inscrire(1)
	local LARGE = RH * 2.25
	local function heurte(v: Vector3, jusqua: number): boolean
		local cx, cy, cz = cellOf(v)
		local rr = math.ceil(LARGE / CELM)
		local ry = math.ceil(P.degagement / CELM)
		for dx = -rr, rr do
			for dy = -ry, ry do
				for dz = -rr, rr do
					local l = grilleM[cle(cx + dx, cy + dy, cz + dz)]
					if l then
						for _, j in l do
							if j < jusqua then
								local d = v - pts[j]
								if math.abs(d.Y) < P.degagement and Vector3.new(d.X, 0, d.Z).Magnitude < LARGE then
									return true
								end
							end
						end
					end
				end
			end
		end
		return false
	end

	-- un « pas » = { dl = variation de cap (rad), p = pente visée (tangente) }
	local plan: { { dl: number, p: number } } = {}
	local pc = 0 -- pente courante du plan (pour enchaîner les rampes)
	local function seg(longueur: number, angle: number, penteFin: number, rampe: number?)
		local n = math.max(2, math.floor(longueur / DS + 0.5))
		local p0 = pc
		penteFin = comprime(math.clamp(penteFin, -P.penteMax, 0.40))
		-- (ESP_ROUTE.cretes) en ESPACE, crêtes et creux sont arrondis 2,5 fois plus
		local nR = math.max(1, math.floor(math.min(longueur * 0.5, (rampe or 55) * (ESPACE and 2.5 or 1)) / DS))
		for k = 1, n do
			local u = (k - 0.5) / n
			local forme = 1 - math.cos(2 * math.pi * u) -- courbure nulle aux deux bouts, angle total respecté
			table.insert(plan, { dl = angle / n * forme, p = p0 + (penteFin - p0) * lisse(k / nR) })
		end
		pc = penteFin
	end
	local function arc(R: number, angleDeg: number, penteFin: number)
		local a = math.rad(angleDeg)
		seg(R * math.abs(a), a, penteFin)
	end
	local function sens(): number return (rnd:NextNumber() < 0.5) and -1 or 1 end

	-- ── les motifs de la zone (poids de l'archétype FLOW, L8891 ; motifs L9039-9085) ──
	-- ⚠ les virages PLONGENT : dans le jeu web un virage descend de 60 à 110 % de sa longueur (avant le lissage
	-- des crêtes) — la route est un toboggan, et c'est ce qui met un étage de route sous la caisse qui sort par
	-- le bord. Mesuré au banc : avec des virages à 5-10 %, 5 % des sorties se reposaient ; il faut que ça plonge.
	local function desc(a: number, b: number): number return -math.min(P.penteMax, r(a, b)) end
	local MOTIFS = {
		{ "grand", 16, function() -- le grand balayage : large, il descend doucement
			local large = VILLE or ESPACE -- (L9462) R 160-320 en VILLE et en ORBITE, 110-200 ailleurs
			local R = (large and (160 + r(0, 160)) or (110 + r(0, 90))) * RS
			arc(R, sens() * math.min(100 + r(0, 60), (large and 64000 or 52000) / R), desc(0.12, 0.24))
		end },
		{ "virage", 30, function() -- le grand virage : il PLONGE
			local R = (80 + r(0, 120)) * RS
			arc(R, sens() * math.min(45 + r(0, 65), 46000 / R), desc(0.45, 0.8))
		end },
		{ "epingle", 3, function()
			seg(r(25, 65), 0, desc(0.4, 0.6))
			local R = r(55, 105) * RS
			local A = 180 / math.sqrt(math.max(1, LV * 0.7))
			arc(R, sens() * A, -r(24, 50) / (R * math.rad(A)))
			seg(r(25, 65), 0, desc(0.4, 0.6))
		end },
		{ "esses", 26, function()
			local sg = sens()
			local A, R = r(25, 70), r(80, 180) * RS
			for _ = 1, rnd:NextInteger(1, 3) do
				local p = desc(0.45, 0.8)
				arc(R, sg * A, p)
				arc(R, -sg * A, p)
			end
		end },
		{ "vague", 6, function() -- bosse + creux, en courbe
			local sg = sens()
			seg(r(40, 80), sg * math.rad(r(10, 22)), desc(0.2, 0.35), 30)
			seg(r(50, 90), sg * math.rad(r(10, 22)), r(0.3, 0.4), 30)
			seg(r(70, 120), sg * math.rad(r(12, 26)), desc(0.5, 0.7), 30)
		end },
		{ "plongeon", 4, function()
			seg(r(60, 140), sens() * math.rad(r(10, 20)), desc(0.35, 0.58), 35)
			arc(r(90, 170) * RS, sens() * r(25, 75), desc(0.6, 0.8))
		end },
		{ "elan", 6, function() -- la ligne de momentum : longue, cintrée, raide
			seg((90 + r(0, 100)) * LV, sens() * math.rad(r(20, 40)), desc(0.32, 0.48), 40)
		end },
		{ "chicane", 6, function()
			local sg = sens()
			for _ = 1, rnd:NextInteger(3, 5) do
				arc(r(70, 160) * RS, sg * r(16, 30), desc(0.4, 0.55))
				sg = -sg
			end
		end },
	}
	-- LES POIDS DU NIVEAU (`wv` : la VILLE a ses grands virages et ses grands balayages ; l'ORBITE les mêmes, tempérés par
	-- ESP_ROUTE.w : épingles × 0,35 ; vagues, plongeons, chicanes × 0,5 ; lignes d'élan × 1,2)
	if VILLE or ESPACE then
		local W = { grand = 28, virage = 40, epingle = 2, esses = 22, vague = 6, plongeon = 2, elan = 3, chicane = 5 }
		if ESPACE then
			W.epingle *= 0.35
			W.vague *= 0.5
			W.plongeon *= 0.5
			W.chicane *= 0.5
			W.elan *= 1.2
		end
		for _, m in MOTIFS do m[2] = W[m[1]] or m[2] end
	end
	-- entre deux motifs : une liaison qui tourne (16-36°) et descend de 8-16 m (L9084)
	local function liaison()
		local l = r(50, 90) * LV
		seg(l, sens() * math.rad(r(16, 36)), -r(8, 16) * LV / l)
	end

	-- ── les modules du niveau NUAGES (L8918-8942) ──
	local MODULES = {
		FILET = function()
			-- un virage rapide et presque plat… puis la route continue de tourner en s'ÉVASANT et en
			-- descendant de 48 m : un tour plus loin, elle repasse sous le point où atterrit la caisse
			-- qui a quitté le virage par l'extérieur (≈ 90 m plus loin sur la tangente, 2,4 s de vol).
			local sg = sens()
			local R1 = r(95, 140) * RS
			arc(R1, sg * r(55, 75), 0)
			local A = math.rad(410)
			local descente = 48 + r(0, 6)
			local n = math.floor(2 * math.pi * (R1 + 30) * (A / (2 * math.pi)) / DS)
			local p0 = pc
			local pente2 = -descente / (2 * math.pi * (R1 + 28))
			local parcouru = 0
			for k = 1, n do
				local u = k / n
				local Rk = R1 + 55 * lisse(u / 0.72)
				local dl = DS / Rk
				parcouru += dl
				if parcouru > A then break end
				table.insert(plan, { dl = sg * dl, p = p0 + (pente2 - p0) * lisse(k / 20) })
			end
			pc = pente2
			seg(60, 0, -0.05)
		end,
		LACETS = function()
			-- la première branche, puis 2-3 épingles qui descendent de ~45 m chacune : les branches sont
			-- côte à côte, chacune plus bas que la précédente → on saute de l'une à l'autre
			seg(150, 0, -0.04)
			local sg = sens()
			for _ = 1, rnd:NextInteger(2, 3) do
				local R = r(62, 82) * RS
				arc(R, sg * 180, -45 / (math.pi * R))
				seg(r(110, 170), 0, -0.04)
				sg = -sg
			end
		end,
		RUSSES = function()
			for _ = 1, rnd:NextInteger(3, 4) do
				local h = r(16, 26) * LV
				seg(h / 0.3, 0, 0.30, 25)
				seg(h / 0.3, 0, -0.34, 25)
			end
			seg(40, 0, -0.05)
		end,
		PLONGEON = function()
			seg(50, 0, -0.46, 40)
			seg(r(110, 160), 0, -0.46)
			seg(60, 0, -0.04, 45)
		end,
		CHAMEAU = function()
			seg(90, 0, 0.30, 40)
			seg(70, 0, -0.34, 45)
			seg(80, 0, -0.05, 40)
		end,
	}
	local sac: { string } = {}
	local dernierMod = ""
	local function modSuivant(): string
		if #sac == 0 then
			-- (le FILET reste écrit mais sort du sac : au banc des vols, 5 % des sorties s'y reposaient, contre 25 %
			-- dans les LACETS — sa boucle doit partir dans l'AUTRE sens, en bretelle, et passer par le point calculé)
			sac = { "LACETS", "RUSSES", "LACETS", "PLONGEON", "CHAMEAU" }
			for i = #sac, 2, -1 do
				local j = rnd:NextInteger(1, i)
				sac[i], sac[j] = sac[j], sac[i]
			end
			if sac[#sac] == dernierMod then sac[1], sac[#sac] = sac[#sac], sac[1] end
			if sac[#sac] == sac[#sac - 1] then sac[2], sac[#sac] = sac[#sac], sac[2] end
		end
		local m = table.remove(sac) :: string
		dernierMod = m
		return m
	end

	-- ── poser un plan : simulé d'abord, écrit seulement s'il ne traverse pas la route ──
	local modules = {}
	local entreeA, entreeB = 0, 0 -- (VILLE) les numéros de points de la fin de la droite surélevée et du pied de la rampe
	local function poser(verifier: boolean): boolean
		local l, q = lacet, pos
		local essai: { Vector3 } = {}
		local base = #pts
		for _, st in plan do
			l += st.dl
			local cp = 1 / math.sqrt(1 + st.p * st.p)
			local dir = Vector3.new(-math.sin(l) * cp, st.p * cp, -math.cos(l) * cp)
			q += dir * DS
			if verifier and heurte(q, base - 60) then
				table.clear(plan)
				return false
			end
			table.insert(essai, q)
		end
		for _, v in essai do
			table.insert(pts, v)
			inscrire(#pts)
		end
		lacet, pos = l, q
		if #plan > 0 then pente = plan[#plan].p end
		table.clear(plan)
		return true
	end

	if ecole then
		-- LA PISTE D'ÉCOLE : droite 300 · virage 70° R190 · droite 360 (−24) · virage −90° R210 · droite 420 ·
		-- droite 240 (−80, le grand plongeon) · droite 380 · virage 55° R170 · virage −55° R170 · droite 300 (+20) ·
		-- virage 120° R230 · droite 420 → le portail
		local function droit(l: number, dy: number?) seg(l, 0, (dy or 0) / l, 40) end
		pc = 0
		droit(300)
		arc(190, 70, 0)
		droit(360, -24)
		arc(210, -90, 0)
		droit(420)
		droit(240, -80)
		droit(380)
		arc(170, 55, 0)
		arc(170, -55, 0)
		droit(300, 20)
		arc(230, 120, 0)
		droit(420)
		seg(80, 0, 0, 50)
		poser(false)
		LEN = 0 -- (rien d'autre : la boucle des motifs ne tourne pas)
	else
	-- le départ : un bout plat pour poser la caisse, puis la rampe qui plonge (on prend de l'élan)
	pc = 0
	if VILLE then
		-- L'ENTRÉE DANS LA VILLE (VILLE_ENTREE_R, L8855) : une ligne droite quasi plate, SURÉLEVÉE — les toits qui la bordent restent
		-- sous la route, on voit la ville défiler —, puis la GRANDE RAMPE qui plonge dans le canyon
		seg(40, 0, 0)
		seg(420 * LV, 0, -6 / 420, 40)
		entreeA = #plan + 1
		seg(520 * LV, 0, -220 / 520, 60)
		entreeB = #plan + 1
		seg(40, 0, -0.08, 30)
	else
		seg(40, 0, 0)
		seg(P.departLong * LV, 0, -P.departPente, 40)
		seg(40, 0, -0.08, 30)
	end
	poser(false)
	end

	local prochainModule = (niv == "nuages") and r(P.module[1], P.module[2]) * LV * 0.6 or math.huge -- (les modules sont ceux du niveau NUAGES)
	local POIDS_TOT = 0
	for _, m in MOTIFS do POIDS_TOT += m[2] end
	while (#pts - 1) * DS < LEN - 400 do
		local ok = false
		local estModule = (#pts - 1) * DS >= prochainModule
		for essai = 1, 14 do
			pc = pente
			local nom
			if estModule and essai <= 6 then
				-- (L9333-9349 : les modules — lacets, montagnes russes, grand plongeon, dos de chameau — sont ceux des NUAGES seuls ;
				-- L'ORAGE, le niveau dur, n'a droit qu'à UN virage à filet)
				nom = (variante == "orage") and "FILET" or modSuivant()
				MODULES[nom]()
			else
				local x = rnd:NextNumber() * POIDS_TOT
				for _, m in MOTIFS do
					x -= m[2]
					if x <= 0 then
						nom = m[1]
						m[3]()
						break
					end
				end
			end
			local a = (#pts - 1) * DS
			if poser(true) then
				if estModule and essai <= 6 then
					table.insert(modules, { a = a * M, b = (#pts - 1) * DS * M, nom = nom }) -- en studs, comme len
					prochainModule = (variante == "orage") and math.huge or ((#pts - 1) * DS + r(P.module[1], P.module[2]) * LV)
				end
				ok = true
				break
			end
		end
		if not ok then
			-- coincé partout : on plonge d'un étage, ça dégage toujours
			pc = pente
			seg(120, 0, -0.5, 30)
			seg(40, 0, -0.05, 30)
			poser(false)
		else
			pc = pente
			liaison()
			if not poser(true) then
				pc = pente
				seg(60, 0, -0.1)
				poser(false)
			end
		end
		if ceder then ceder() end
	end
	-- l'arrivée : la dernière descente vers le PORTAIL, qui se pose à plat
	if not ecole then
		pc = pente
		seg(110 * LV, 0, -0.28, 40)
		seg(80, 0, 0, 50)
		poser(false)
	end

	-- ── les repères, sur la vraie courbe (en STUDS) ──
	local n = #pts
	local F: { CFrame } = table.create(n)
	local minY = math.huge
	for i = 1, n do
		local a = pts[math.max(1, i - 1)]
		local b = pts[math.min(n, i + 1)]
		local T = (b - a).Unit
		local Rv = T:Cross(Vector3.yAxis)
		if Rv.Magnitude < 1e-3 then Rv = T:Cross(Vector3.xAxis) end
		Rv = Rv.Unit
		local U = Rv:Cross(T).Unit
		local p = pts[i] * M
		F[i] = CFrame.fromMatrix(p, Rv, U, -T)
		minY = math.min(minY, p.Y)
	end
	local CEL = P.cellule * M
	local grille: { [number]: { number } } = {}
	for i = 1, n do
		local p = F[i].Position
		local k = cle(math.floor(p.X / CEL), math.floor(p.Y / CEL), math.floor(p.Z / CEL))
		local l = grille[k]
		if not l then l = {}; grille[k] = l end
		table.insert(l, i)
	end

	local piste = {
		graine = graine, zone = zone, niveau = niv, variante = variante, entree = (entreeA > 0) and { entreeA, entreeB } or nil,
		DS = DS * M, n = n, len = (n - 1) * DS * M, F = F,
		minY = minY, grille = grille, cellule = CEL, objets = {}, modules = modules,
	}
	Piste.semer(piste :: any, rnd, zone, ecole)
	return piste :: any
end

-- ── les objets (spawnPickups L23148) : tout existe sur les DEUX faces (miroir strict) ──
function Piste.semer(p: Piste, rnd: Random, zone: number, ecole: boolean?)
	-- Ce que la route porte (buildTrack L10182-10286, spawnPickups L23625-23751). Tout existe en MIROIR sur les deux
	-- faces ; lat est donné dans le repère de SA face (la droite du pilote qui roule dessus).
	-- L'ordre : les flaques, les plots (lignes de chantier, slaloms, portes de frôlé), puis les pièces — qui ESQUIVENT
	-- plots et flaques —, enfin les cristaux. Les PADS et les FRUITS ne sont pas semés ici : c'est LA LIGNE PARFAITE
	-- qui les pose en course, devant la caisse, sur la trajectoire idéale (Pilote, ligneTick).
	local function r(a: number, b: number): number return a + rnd:NextNumber() * (b - a) end
	local O = Config.OBJETS
	local HALF = RH - 1.8
	local L = p.len / M
	local zones = zone - 1
	local rich = math.clamp(0.88 + zones * 0.52, 0.88, 3.4)   -- la route s'enrichit à chaque portail
	local STR = math.clamp(1 + zones * 0.22, 1, 2.1)           -- le pas des motifs s'allonge avec la vitesse
	local vC = 70 + zones * 35                                 -- ~1 s de croisière (m)
	local function dansModule(sp: number): boolean
		for _, m in p.modules do
			if sp > m.a / M - 30 and sp < m.b / M + 30 then return true end
		end
		return false
	end
	local DSm = p.DS / M
	local function tangente(sp: number): Vector3
		return p.F[math.clamp(math.floor(sp / DSm) + 1, 1, p.n)].LookVector
	end
	-- une portion DROITE : sur ±d mètres, aucune tangente à plus de ~6° de celle du point
	local function droite(sp: number, d: number): boolean
		local t0 = tangente(sp)
		for q = -d, d, 10 do
			if tangente(sp + q):Dot(t0) < 0.995 then return false end
		end
		return true
	end
	local plots: { { s: number, lat: number } } = {}
	local flaques: { { s: number, lat: number, r: number } } = {}
	local groupe = 0
	local function plot(sp: number, lt: number)
		if sp > L - 140 then return end
		table.insert(plots, { s = sp, lat = lt })
		for _, face in { 1, -1 } do
			table.insert(p.objets, { s = sp * M, lat = lt * M, h = 0.12 * M, face = face, kind = "plot", grp = groupe })
		end
	end

	-- ── les FLAQUES d'huile : rares, en ligne droite, jamais en montée ──
	local sp = r(420, 920)
	while sp < L - 220 do
		if rnd:NextNumber() >= 0.4 then
			local rayon = r(2, 3.1)
			local lo = r(-1, 1) * (RH - 4.5)
			if tangente(sp).Y <= 0.04 and not dansModule(sp) and droite(sp, math.max(60, 1.1 * vC)) then
				table.insert(flaques, { s = sp, lat = lo, r = rayon })
				for _, face in { 1, -1 } do
					table.insert(p.objets, { s = sp * M, lat = lo * M, h = 0.05 * M, face = face, kind = "flaque", r = rayon })
				end
			end
		end
		sp += r(1240, 2760)
	end
	-- ── les PLOTS, 1re vague : le SLALOM (3 en quinconce) ou la LIGNE DE CHANTIER (4 le long d'un bord) ──
	sp = r(300, 520)
	while sp < L - 170 do
		local slal = rnd:NextNumber() < 0.55
		local w = slal and math.min(r(3.5, 8), RH - 1.3) or 0
		local sd = (rnd:NextNumber() < 0.5) and -1 or 1
		if not dansModule(sp) then
			groupe += 1
			if slal then
				for k = 0, 2 do plot(sp + k * 15, ((k % 2 == 1) and -1 or 1) * w) end
			else
				for k = 0, 3 do plot(sp + k * 7.5, sd * (RH - 1.3)) end
			end
		end
		sp += r(340, 860)
	end
	-- ── 2e vague : LES PORTES DE FRÔLÉ (deux plots à 6 m, deux ou trois portes à la file) — elles se resserrent avec les portails ──
	local z = math.min(3, zones)
	sp = ecole and L or r(385, 605)
	while sp < L - 170 do
		local g = r(-1, 1) * (RH - 6)
		local nP = (rnd:NextNumber() < 0.5) and 2 or 3
		if not dansModule(sp) then
			groupe += 1
			for k = 0, nP - 1 do
				plot(sp + k * 13, g - 3)
				plot(sp + k * 13, g + 3)
			end
		end
		sp += (560 - z * 40) + r(0, 500)
	end

	-- ── les PIÈCES : cinq motifs. Chaque motif (sauf l'éparpillé) est une SÉRIE : la prendre entière paie du flow ──
	local serie = 0
	local grp: number? = nil
	local function piece(sq: number, lt: number)
		if sq < 120 or sq > L - 50 then return end -- (les pièces vont PARTOUT, modules compris : seuls plots et flaques les évitent)
		-- l'ESQUIVE : une pièce ne se pose jamais sur un plot ni dans une flaque
		for _, c in plots do
			if math.abs(c.s - sq) <= 3.4 and math.abs(c.lat - lt) <= 2.5 then
				local cote = (lt >= c.lat) and 1 or -1
				lt = c.lat + cote * 2.8
				if math.abs(lt) > HALF then lt = c.lat - cote * 2.8 end
			end
		end
		for _, f in flaques do
			if math.abs(f.s - sq) <= f.r + 2.4 and math.abs(f.lat - lt) <= f.r + 1.4 then
				local cote = (lt >= f.lat) and 1 or -1
				lt = f.lat + cote * (f.r + 1.8)
			end
		end
		lt = math.clamp(lt, -HALF, HALF)
		for _, face in { 1, -1 } do
			table.insert(p.objets, { s = sq * M, lat = lt * M, h = 1.3 * M, face = face, kind = "piece", grp = grp })
		end
	end
	local function esp(v: number): number return v / rich end
	local ss = O.debut
	while ss < L - 90 do
		if rnd:NextNumber() < 0.24 / rich then
			ss += esp(r(120, 280)) -- une portion VIDE
		else
			local pat = rnd:NextNumber()
			if pat < 0.80 then
				serie += 1
				grp = serie
			else
				grp = nil
			end
			if pat < 0.30 then -- ZIGZAG
				local n, amp, ph, st = rnd:NextInteger(5, 8), HALF * r(0.7, 1), r(1.1, 2.4), r(10, 14) * STR
				for i = 0, n - 1 do piece(ss + i * st, math.sin(i * ph) * amp) end
				ss += esp(n * st / STR + r(70, 120))
			elseif pat < 0.52 then -- ARC
				local n, amp, sd, st = rnd:NextInteger(5, 8), HALF * r(0.75, 1), (rnd:NextNumber() < 0.5) and -1 or 1, r(11, 15) * STR
				for i = 0, n - 1 do piece(ss + i * st, sd * amp * math.sin(i / (n - 1) * math.pi)) end
				ss += esp(n * st / STR + r(70, 120))
			elseif pat < 0.70 then -- CERCLE : un anneau à plat, étiré le long de la route
				local R9, n = math.min(HALF, r(5.5, 9.5)), rnd:NextInteger(8, 11)
				local Rs = R9 * STR
				for i = 0, n - 1 do
					local th = i / n * 6.2832
					piece(ss + Rs + Rs * math.sin(th), R9 * math.cos(th))
				end
				ss += esp(2 * R9 + r(80, 130))
			elseif pat < 0.80 then -- JACKPOT : une ligne dense
				local n, st = rnd:NextInteger(12, 17), 6 * STR
				for i = 0, n - 1 do piece(ss + i * st, math.sin(i * 0.55) * 2.4) end
				ss += esp(n * st / STR + r(140, 220))
			else -- ÉPARPILLÉ
				local n, st = rnd:NextInteger(2, 4), r(20, 38) * STR
				for i = 0, n - 1 do piece(ss + i * st, r(-1, 1) * HALF) end
				ss += esp(n * st / STR + r(60, 110))
			end
		end
	end

	-- ── à l'ÉCOLE : des pads fixes, une voie sur trois (la ligne parfaite ne joue pas pendant la leçon) ──
	if ecole then
		local sq = r(180, 330)
		local voie = math.min(RH - 2.95, math.max(4.6, RH * 0.45))
		while sq < L - 100 do
			local lt = ({ 0, -1, 1 })[(math.floor(sq * 0.0071) % 3) + 1] * voie
			for _, face in { 1, -1 } do
				table.insert(p.objets, { s = sq * M, lat = lt * M, h = 0.1 * M, face = face, kind = "pad" })
			end
			sq += r(280, 560)
		end
	end
	-- ── les cristaux de pouvoir : un tous les 860-1 620 m ──
	local sc = ecole and L or r(380, 640)
	local PW = Config.POUVOIRS
	local cles = { "n", "a", "v", "m", "x" }
	while sc < L - 140 do
		local tot = 0
		for _, k in cles do tot += PW[k].poids end
		local x = rnd:NextNumber() * tot
		local pw = "n"
		for _, k in cles do
			x -= PW[k].poids
			if x <= 0 then pw = k; break end
		end
		local lt = r(-1, 1) * (RH - 4)
		if not dansModule(sc) then
			for _, face in { 1, -1 } do
				table.insert(p.objets, { s = sc * M, lat = lt * M, h = 2.1 * M, face = face, kind = "cristal", pw = pw })
			end
		end
		sc += r(O.cristalTous[1], O.cristalTous[2])
	end
end

-- ── lecture ──
-- repère interpolé à la distance s (studs). CFrame:Lerp tourne proprement.
function Piste.repere(p: Piste, s: number): CFrame
	local x = math.clamp(s / p.DS, 0, p.n - 1.0001)
	local i = math.floor(x)
	return p.F[i + 1]:Lerp(p.F[i + 2], x - i)
end

-- repère d'une FACE : dessus (face 1) = le repère tel quel ; dessous (face −1) = retourné autour du sens
-- de la route (on roule la tête en bas), posé sur la face inférieure de la dalle.
local RETOURNE = CFrame.Angles(0, 0, math.pi)
function Piste.repereFace(p: Piste, s: number, face: number): CFrame
	local f = Piste.repere(p, s)
	if face < 0 then
		return (f - f.UpVector * (Config.THICK * M)) * RETOURNE
	end
	return f
end

-- tous les échantillons des 27 cellules autour d'un point (studs)
function Piste.autour(p: Piste, v: Vector3, out: { number }): { number }
	table.clear(out)
	local CEL = p.cellule
	local cx, cy, cz = math.floor(v.X / CEL), math.floor(v.Y / CEL), math.floor(v.Z / CEL)
	for dx = -1, 1 do
		for dy = -1, 1 do
			for dz = -1, 1 do
				local l = p.grille[cle(cx + dx, cy + dy, cz + dz)]
				if l then
					for _, j in l do table.insert(out, j) end
				end
			end
		end
	end
	return out
end

-- la pose de sortie de la zone
function Piste.fin(p: Piste): CFrame
	return p.F[p.n]
end
-- le départ de la zone suivante : au-dessus de la sortie, remonté à l'altitude de départ. La route descend
-- de 2,5 à 5 km par zone : sans ça, vers la 5e zone la caisse passerait sous la limite où Roblox efface
-- tout (FallenPartsDestroyHeight). Le portail est donc un saut vertical — invisible, la zone d'avant
-- disparaît au même instant (dans le jeu web aussi, le portail bâtit une piste neuve et remet s à 0).
function Piste.suite(p: Piste): CFrame
	local f = p.F[p.n]
	return f + Vector3.new(0, Config.PISTE.yDepart * M - f.Position.Y, 0)
end

return Piste
