-- CASH CAR — L'IMPACT DANS UN IMMEUBLE (villeImpact v2, L10555 du jeu web ; Sacha, 29/09 : « retravaille sérieusement l'impact dans
-- les immeubles, sans que ce soit trop gourmand, mais plus travaillé »).
-- La caisse entre dans une tour : elle y laisse un CRATÈRE — une cavité noire au bord irrégulier, la lèvre chauffée à blanc puis
-- rouge, le brasier au fond, des fers à béton qui pendent, des LÉZARDES qui partent du trou, de la SUIE étirée vers le haut, une onde
-- de choc sur la façade. Des MORCEAUX volent (béton, dalles, fers rougis, verre) ; deux RÉPLIQUES crachent du feu (0,3 s et 0,72 s) ;
-- le VERRE pleut le long de la façade la première seconde ; les FLAMMES lèchent la façade et une colonne de FUMÉE monte pendant 8 s.
-- LA TAILLE SUIT LA VITESSE : 3,4 m à l'arrêt → 6 m lancé à fond, jamais plus que la façade.
-- ROBLOX : le web grave le cratère dans le shader des tours ; ici ce sont des pièces posées SUR la façade (≈ 75, bâties une fois,
-- rangées hors du monde entre deux impacts — rien n'est créé en course). Aucune lumière. Les particules passent par le Bus (« gerbe »).
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Bus = require(script.Parent:WaitForChild("Bus"))
local M = Config.M

local Impact = {}

local LOIN = CFrame.new(0, -5000, 0)
local dossier: Folder? = nil
local P: any = nil -- les pièces du cratère
local MORCEAUX: { any } = {}
local E = { on = false, t = 0, pos = Vector3.zero, N = Vector3.xAxis, T1 = Vector3.yAxis, T2 = Vector3.zAxis, R = 4, rep = 0, verre = 0, fume = 0, aV = 0, aF = 0, aL = 0, aB = 0 }
local PARTS: { BasePart } = {}
local CFS: { CFrame } = {}

local function piece(forme: Enum.PartType, couleur: Color3, mat: Enum.Material, tr: number?): Part
	local p = Instance.new("Part")
	p.Shape = forme
	p.Color = couleur
	p.Material = mat
	p.Transparency = tr or 0
	p.Anchored = true
	p.CanCollide, p.CanQuery, p.CanTouch = false, false, false
	p.CastShadow = false
	p.Size = Vector3.new(1, 1, 1)
	p.CFrame = LOIN
	p.Parent = dossier
	return p
end

local function batir()
	if dossier then return end
	local d = Instance.new("Folder")
	d.Name = "CashCarImpact"
	d.Parent = workspace
	dossier = d
	local B, C = Enum.PartType.Block, Enum.PartType.Cylinder
	local lisse, neon = Enum.Material.SmoothPlastic, Enum.Material.Neon
	P = {
		levre = piece(C, Color3.fromRGB(255, 240, 200), neon),          -- la lèvre chauffée à blanc, puis rouge
		trou = piece(C, Color3.fromRGB(10, 7, 9), lisse),               -- la cavité
		brasier = piece(C, Color3.fromRGB(255, 120, 30), neon, 0.15),   -- le feu au fond
		onde = piece(C, Color3.fromRGB(255, 220, 170), neon, 0.5),      -- l'onde de choc qui file sur la façade
		suie = piece(B, Color3.fromRGB(14, 10, 12), lisse, 0.5),        -- la suie étirée vers le haut
		bord = {}, dalles = {}, fers = {}, lezardes = {}, braises = {},
	}
	for i = 1, 10 do P.bord[i] = piece(Enum.PartType.Ball, Color3.fromRGB(10, 7, 9), lisse) end -- le bord irrégulier (plus d'étoile)
	for i = 1, 3 do P.dalles[i] = piece(B, Color3.fromRGB(150, 70, 24), lisse) end              -- les dalles des étages, éclairées d'en dessous
	for i = 1, 6 do P.fers[i] = piece(B, Color3.fromRGB(40, 22, 18), lisse) end                 -- les fers à béton qui pendent
	for i = 1, 11 do
		P.lezardes[i] = piece(B, Color3.fromRGB(18, 12, 16), lisse)                              -- onze lézardes sombres…
		P.braises[i] = piece(B, Color3.fromRGB(255, 70, 30), neon)                               -- …rougeoyantes près du bord
	end
	-- les morceaux : 12 blocs de béton, 6 dalles, 4 fers rougis, 10 éclats de verre
	for i = 1, 32 do
		local sorte = (i <= 12) and 0 or ((i <= 18) and 1 or ((i <= 22) and 2 or 3))
		local m: Part
		if sorte == 3 then
			m = piece(B, (i % 2 == 0) and Color3.fromRGB(170, 230, 255) or Color3.fromRGB(255, 220, 150), neon, 0.25)
		elseif sorte == 2 then
			m = piece(B, Color3.fromRGB(255, 96, 40), neon)
		else
			m = piece(B, (i % 2 == 0) and Color3.fromRGB(106, 102, 114) or Color3.fromRGB(74, 70, 84), Enum.Material.Concrete)
		end
		MORCEAUX[i] = { m = m, sorte = sorte, on = false, t = 0, vie = 0, v = Vector3.zero, cf = LOIN, rot = Vector3.zero, s = Vector3.one }
	end
end

-- un disque (cylindre couché) : rayon r (m), épaisseur e (m), posé à d (m) devant la façade
local function disque(p: Part, r: number, e: number, d: number)
	p.Size = Vector3.new(e * M, 2 * r * M, 2 * r * M)
	p.CFrame = CFrame.fromMatrix((E.pos + E.N * d) * M, E.N, E.T1, E.T2)
end
-- un pavé posé sur la façade : centre (a le long de T2, b le long de T1), largeur le long de T2, hauteur le long de T1, tourné de `ang`
local function pave(p: Part, a: number, b: number, l: number, h: number, e: number, d: number, ang: number?)
	p.Size = Vector3.new(e * M, h * M, l * M)
	p.CFrame = CFrame.fromMatrix((E.pos + E.T2 * a + E.T1 * b + E.N * d) * M, E.N, E.T1, E.T2) * CFrame.Angles(ang or 0, 0, 0)
end

local function ranger()
	if not P then return end
	for _, k in { "levre", "trou", "brasier", "onde", "suie" } do P[k].CFrame = LOIN end
	for _, k in { "bord", "dalles", "fers", "lezardes", "braises" } do
		for _, p in P[k] do p.CFrame = LOIN end
	end
	for _, q in MORCEAUX do
		q.on = false
		q.m.CFrame = LOIN
	end
end

-- (une nouvelle ville, une nouvelle partie : l'ancien cratère s'éteint)
function Impact.fin()
	E.on = false
	ranger()
end

local function gerbe(nom: string, pos: Vector3, n: number, v0: number, v1: number, cone: number, vers: Vector3)
	Bus.emit("gerbe", nom, pos * M, n, v0, v1, cone, vers)
end
local function hasard(k: number): Vector3 -- un point au hasard sur la bouche du cratère (rayon k·R)
	local a, r = math.random() * 6.283, math.sqrt(math.random()) * E.R * k
	return E.pos + E.T1 * (math.cos(a) * r) + E.T2 * (math.sin(a) * r)
end

-- `col` : la collision de la ville (Ville.batir) · `p` : la caisse (m) · `vel` : sa vitesse MONDE (m/s). Rend false si aucune tour.
function Impact.frappe(col: any, p: Vector3, vel: Vector3): boolean
	if not col then return false end
	local l = col.g[(math.floor(p.X / 60) + 4096) * 8192 + math.floor(p.Z / 60) + 4096]
	if not l then return false end
	local c = col.c
	local o: number? = nil
	for _, k in l do
		if math.abs(p.X - c[k + 1]) < c[k + 4] / 2 + 0.9 and math.abs(p.Z - c[k + 3]) < c[k + 6] / 2 + 0.9 and math.abs(p.Y - c[k + 2]) < c[k + 5] / 2 + 0.5 then
			o = k
			break
		end
	end
	if not o then return false end
	batir()
	ranger()
	local dx, dy, dz = p.X - c[o + 1], p.Y - c[o + 2], p.Z - c[o + 3]
	local hx, hy, hz = c[o + 4] / 2, c[o + 5] / 2, c[o + 6] / 2
	-- la face d'ENTRÉE : la moins traversée
	local px, py, pz = hx + 0.9 - math.abs(dx), hy + 0.5 - math.abs(dy), hz + 0.9 - math.abs(dz)
	local qx, qy, qz = math.clamp(dx, -hx, hx), math.clamp(dy, -hy, hy), math.clamp(dz, -hz, hz)
	local N: Vector3
	local face: number
	if px <= pz and px <= py then
		N = Vector3.new((dx < 0) and -1 or 1, 0, 0)
		qx = hx * N.X
		face = math.min(hz, hy)
	elseif pz <= py then
		N = Vector3.new(0, 0, (dz < 0) and -1 or 1)
		qz = hz * N.Z
		face = math.min(hx, hy)
	else
		N = Vector3.new(0, (dy < 0) and -1 or 1, 0)
		qy = hy * N.Y
		face = math.min(hx, hz)
	end
	local vW = vel.Magnitude
	local R = math.max(3, math.min(3.4 + math.min(2.6, vW / 28), face * 0.9)) -- la taille suit la VITESSE, jamais plus que la façade
	local T1 = (math.abs(N.Y) > 0.9) and Vector3.xAxis or Vector3.yAxis
	local T2 = N:Cross(T1).Unit
	T1 = T2:Cross(N).Unit
	E.on, E.t, E.pos, E.N, E.T1, E.T2, E.R = true, 0, Vector3.new(c[o + 1] + qx, c[o + 2] + qy, c[o + 3] + qz), N, T1, T2, R
	E.rep, E.verre, E.fume, E.aV, E.aF, E.aL, E.aB = 0, 1.1, 8, 0, 0, 0, 0

	-- ── LE CRATÈRE ──
	disque(P.levre, R * 0.96, 0.1, 0.05)
	disque(P.trou, R * 0.86, 0.16, 0.1)
	disque(P.brasier, R * 0.42, 0.12, 0.2)
	P.brasier.CFrame *= CFrame.new(0, -R * 0.3 * M, 0) -- le feu est au FOND, vers le bas de la cavité
	disque(P.onde, R, 0.06, 0.24)
	P.levre.Color, P.levre.Transparency = Color3.fromRGB(255, 240, 200), 0
	P.brasier.Transparency, P.onde.Transparency = 0.15, 0.5
	pave(P.suie, 0, R * 1.7, R * 1.25, R * 1.9, 0.05, 0.06)
	P.suie.Transparency = 0.62
	for i, b in P.bord do -- le bord : des morsures dans la lèvre (un bruit, pas une étoile)
		local a = (i - 1) / #P.bord * 6.283 + math.random() * 0.4
		local r = R * (0.84 + math.random() * 0.2) -- (à cheval sur la lèvre : elle ne se lit plus qu'en ARCS, le trou n'est plus un rond parfait)
		local k = R * (0.26 + math.random() * 0.24)
		b.Size = Vector3.new(0.3 * M, k * M, k * (0.7 + math.random() * 0.8) * M)
		b.CFrame = CFrame.fromMatrix((E.pos + T1 * (math.cos(a) * r) + T2 * (math.sin(a) * r) + N * 0.12) * M, N, T1, T2) * CFrame.Angles(math.random() * 6, 0, 0)
	end
	for i, d in P.dalles do -- les dalles des étages, dans la cavité
		local b = (i - 2) * R * 0.5
		local demi = math.sqrt(math.max(0.2, (R * 0.84) ^ 2 - b * b))
		pave(d, 0, b, demi * 2, 0.22, 0.06, 0.2)
	end
	for i, f in P.fers do -- les fers à béton pendent du haut du trou
		local a = (i - 3.5) / 6 * R * 1.3
		local haut = math.sqrt(math.max(0.2, (R * 0.84) ^ 2 - a * a))
		local long = 0.6 + math.random() * 1.2
		pave(f, a, haut - long / 2, 0.07, long, 0.07, 0.26, (math.random() - 0.5) * 0.5)
	end
	for i, z in P.lezardes do -- les lézardes partent du trou
		local a = (i - 1) / 11 * 6.283 + (math.random() - 0.5) * 0.4
		local long = R * (0.5 + math.random() * 1.1)
		local r = R * 0.9 + long / 2
		pave(z, math.sin(a) * r, math.cos(a) * r, 0.14 + math.random() * 0.1, long, 0.04, 0.05, a + (math.random() - 0.5) * 0.25)
		local lb = long * 0.3
		pave(P.braises[i], math.sin(a) * (R * 0.9 + lb / 2), math.cos(a) * (R * 0.9 + lb / 2), 0.07, lb, 0.05, 0.07, a)
		P.braises[i].Transparency = 0.1
	end

	-- ── LES MORCEAUX ──
	for i, q in MORCEAUX do
		local a, r = math.random() * 6.283, math.sqrt(math.random()) * R * 0.7
		if q.sorte == 3 then
			q.s = Vector3.new(0.5 + math.random() * 0.7, 0.4 + math.random() * 0.5, 0.07)
		elseif q.sorte == 2 then
			q.s = Vector3.new(0.07, 0.07, 1.4 + math.random() * 1.4)
		elseif q.sorte == 1 then
			local k = 0.8 + math.random() * 0.8
			q.s = Vector3.new(k * (1.3 + math.random() * 0.9), 0.16 + math.random() * 0.12, k * (0.9 + math.random() * 0.6))
		else
			local k = 0.5 + math.random() * 1.4
			q.s = Vector3.new(k * (0.7 + math.random() * 0.6), k * (0.5 + math.random() * 0.6), k * (0.7 + math.random() * 0.6))
		end
		local sp = (6 + math.random() * ((q.sorte == 3) and 16 or ((q.sorte == 1) and 7 or 11))) * (0.8 + math.min(0.6, vW / 150))
		q.v = N * sp + T1 * (math.cos(a) * (2 + math.random() * 6)) + T2 * (math.sin(a) * (2 + math.random() * 6)) + vel * 0.12 + Vector3.yAxis * (2 + math.random() * 7)
		local sv = (q.sorte == 1) and 4 or 9
		q.rot = Vector3.new((math.random() - 0.5) * sv, (math.random() - 0.5) * sv, (math.random() - 0.5) * sv)
		q.cf = CFrame.new((E.pos + T1 * (math.cos(a) * r) + T2 * (math.sin(a) * r) + N * 0.4) * M) * CFrame.Angles(math.random() * 6, math.random() * 6, math.random() * 6)
		q.t, q.vie, q.on = 0, 2.6 + math.random() * 1.8, true
		q.m.Size = q.s * M
		q.m.CFrame = q.cf
	end

	-- ── LE SOUFFLE ── la poussière de béton, la fumée, le verre pilé qui scintille, les braises
	for _ = 1, 6 do gerbe("poussiere", hasard(0.9), 7, 2, 11, 40, N) end
	gerbe("fumee", E.pos, 14, 3, 9, 50, N)
	for _ = 1, 4 do gerbe("eau", hasard(0.8), 9, 8, 26, 55, (N + Vector3.yAxis * 0.3).Unit) end
	for _ = 1, 3 do gerbe("braiseO", hasard(0.7), 7, 4, 14, 55, (N + Vector3.yAxis * 0.4).Unit) end
	return true
end

-- À chaque image (même après la mort : le trou fume pendant l'écran de fin). Rend la secousse des répliques.
function Impact.tick(dt: number): number
	if not E.on then return 0 end
	E.t += dt
	local t, R, N = E.t, E.R, E.N
	if t > 90 then -- (filet) un cratère n'a plus rien à dire au bout d'une minute et demie
		Impact.fin()
		return 0
	end
	local secousse = 0
	-- la lèvre : blanche → orange → rouge sombre, puis elle s'éteint ; le brasier danse et retombe
	if t < 9 then
		local u = math.min(1, t / 3)
		P.levre.Color = Color3.fromRGB(255, 240, 200):Lerp(Color3.fromRGB(255, 96, 24), math.min(1, u * 2)):Lerp(Color3.fromRGB(120, 20, 10), math.max(0, u * 2 - 1))
		P.levre.Transparency = math.clamp((t - 4) / 4, 0, 1) * 0.85
		local f9 = math.min(1, E.fume / 3)
		P.brasier.Transparency = 1 - (0.85 * f9) * (0.75 + 0.25 * math.sin(t * 23) * math.sin(t * 7.3))
		for _, b in P.braises do b.Transparency = math.clamp(0.1 + t / 4, 0, 1) end
		for _, d in P.dalles do d.Color = Color3.fromRGB(150, 70, 24):Lerp(Color3.fromRGB(26, 18, 18), 1 - f9) end
	end
	-- l'onde de choc : elle file sur la façade en 0,35 s
	if t < 0.4 then
		local u = math.min(1, t / 0.35)
		local r = R * (1 + 2.2 * (1 - (1 - u) ^ 2))
		P.onde.Size = Vector3.new(0.06 * M, 2 * r * M, 2 * r * M)
		P.onde.Transparency = 0.5 + 0.5 * u
	elseif P.onde.Transparency < 1 then
		P.onde.Transparency = 1
		P.onde.CFrame = LOIN
	end
	-- les morceaux : la gravité, la rotation, et ils se replient en fin de vie (pas de pop)
	table.clear(PARTS)
	table.clear(CFS)
	for _, q in MORCEAUX do
		if q.on then
			q.t += dt
			if q.t > q.vie then
				q.on = false
				q.m.CFrame = LOIN
			else
				q.v -= Vector3.yAxis * (22 * dt)
				q.cf = (q.cf + q.v * dt * M) * CFrame.Angles(q.rot.X * dt, q.rot.Y * dt, q.rot.Z * dt)
				local e = math.min(1, (q.vie - q.t) / 0.4)
				if e < 1 then q.m.Size = q.s * (M * math.max(0.02, e)) end
				table.insert(PARTS, q.m)
				table.insert(CFS, q.cf)
			end
		end
	end
	if #PARTS > 0 then workspace:BulkMoveTo(PARTS, CFS, Enum.BulkMoveMode.FireCFrameChanged) end
	-- les deux RÉPLIQUES : une bouffée de feu ressort par la bouche du cratère
	if E.rep < 2 and t > ((E.rep == 1) and 0.72 or 0.3) then
		E.rep += 1
		local k = (E.rep == 1) and 14 or 9
		gerbe("langue", E.pos - E.T1 * (R * 0.15), k, 5, 14, 35, (N + Vector3.yAxis * 0.35).Unit)
		gerbe("braiseO", E.pos, math.floor(k * 0.7), 4, 12, 50, (N + Vector3.yAxis * 0.4).Unit)
		secousse = 0.25
	end
	-- le VERRE pleut le long de la façade, depuis les étages au-dessus du trou (la première seconde)
	if E.verre > 0 then
		E.verre -= dt
		E.aV += dt * 40
		while E.aV >= 1 do
			E.aV -= 1
			gerbe("eau", E.pos + E.T2 * ((math.random() - 0.5) * R * 2.4) + E.T1 * (R * (0.6 + math.random() * 1.6)) + N * 0.6, 1, 2, 6, 20, (-Vector3.yAxis + N * 0.3).Unit)
		end
	end
	-- la FUMÉE monte du trou pendant 8 s, les FLAMMES lèchent la façade, les braises volent — le feu retombe sur les 3 dernières secondes
	if E.fume > 0 then
		E.fume -= dt
		local f9 = math.min(1, E.fume / 3)
		E.aF += dt * 9
		while E.aF >= 1 do
			E.aF -= 1
			gerbe("fumee", E.pos + N * 1.5 + E.T1 * (R * 0.3) + E.T2 * ((math.random() - 0.5) * R * 0.8), 1, 3.5, 6.5, 16, (Vector3.yAxis + N * 0.3).Unit)
		end
		E.aL += dt * 22 * f9
		while E.aL >= 1 do
			E.aL -= 1
			gerbe("langue", E.pos + E.T2 * ((math.random() - 0.5) * R * 1.3) + E.T1 * (R * (0.25 + math.random() * 0.55)) + N * (0.5 + math.random() * 0.6), 1, 4, 8, 14, (Vector3.yAxis + N * 0.2).Unit)
		end
		E.aB += dt * 24 * f9
		while E.aB >= 1 do
			E.aB -= 1
			gerbe((math.random() < 0.6) and "braiseO" or "braiseJ", E.pos + N + E.T2 * ((math.random() - 0.5) * R) + E.T1 * ((math.random() - 0.5) * R * 0.6), 1, 2, 6, 40, (Vector3.yAxis + N * 0.4).Unit)
		end
	end
	return secousse
end

-- (banc) un impact sur la tour la plus proche de `pos` (m), à sa hauteur : rend la vue d'où le regarder (un CFrame, pour DbgVue)
function Impact.essai(col: any, pos: Vector3, vit: number?): CFrame?
	if not col then return nil end
	local c = col.c
	local mieux, d2 = nil, 1e18
	for o = 0, #c - 6, 6 do
		if c[o + 4] > 12 and c[o + 5] > 30 and math.abs(pos.Y - c[o + 2]) < c[o + 5] / 2 - 8 then
			local dx, dz = pos.X - c[o + 1], pos.Z - c[o + 3]
			local d = dx * dx + dz * dz
			if d < d2 then mieux, d2 = o, d end
		end
	end
	if not mieux then return nil end
	local o = mieux
	local dx, dz = pos.X - c[o + 1], pos.Z - c[o + 3]
	local p: Vector3
	if math.abs(dx) / c[o + 4] > math.abs(dz) / c[o + 6] then
		p = Vector3.new(c[o + 1] + ((dx < 0) and -1 or 1) * (c[o + 4] / 2 - 0.3), pos.Y, c[o + 3] + math.clamp(dz, -c[o + 6] / 4, c[o + 6] / 4))
	else
		p = Vector3.new(c[o + 1] + math.clamp(dx, -c[o + 4] / 4, c[o + 4] / 4), pos.Y, c[o + 3] + ((dz < 0) and -1 or 1) * (c[o + 6] / 2 - 0.3))
	end
	if not Impact.frappe(col, p, (p - pos).Unit * (vit or 60)) then return nil end
	return CFrame.lookAt((E.pos + E.N * 24 + E.T2 * 9 + Vector3.yAxis * 3) * M, E.pos * M)
end

return Impact
