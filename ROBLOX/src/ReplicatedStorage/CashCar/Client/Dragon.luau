-- CASH CAR — LE DRAGON DE NITROOO (dragon v5 → v7 du jeu web, index.html « LE DRAGON v5 — LA COMÈTE A LA FORME D'UN DRAGON »)
-- Verdicts de Sacha sur le web : la comète de NITROOO a ELLE-MÊME la forme d'un dragon — une TÊTE qui ENGLOBE la voiture, plus
-- grosse, plus opaque et plus enflammée à mesure qu'on tient la nitro ; à chaque palier, un tronçon de CORPS de plus pousse
-- DERRIÈRE la voiture ; il se FORME lentement (d'abord des flammes, puis le crâne, les bois, les yeux) ; c'est un dragon chinois
-- en PAPIER : il réagit beaucoup au vent et à la vitesse (le corps claque, les banderoles filent) ; violet en nitro infinie,
-- NOIR en dark triad.
-- Ce module LIT l'état de NITROOO (Bus.etat().ntr : k l'intensité, gT la tenue, pal le palier) sans y toucher.
-- ROBLOX : pas de maillage qu'on déforme à chaque image. Le CRÂNE et la MÂCHOIRE sont deux maillages bâtis une fois (les
-- couronnes du web, mêmes cotes), posés et étirés par leur taille ; tout le reste — corps, crête, bois, sourcils, nageoires,
-- banderoles, moustaches, crinière, barbe, pattes, queue, comète — est fait de RUBANS (Beam) tendus entre des points qu'on
-- déplace à chaque image, tournés vers la caméra comme les bandes du web.
local RunService = game:GetService("RunService")
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Bus = require(script.Parent:WaitForChild("Bus"))
local Maillage = require(script.Parent:WaitForChild("Maillage"))
local Effets = require(script.Parent:WaitForChild("Effets"))
local Score = require(script.Parent:WaitForChild("Score"))
local M = Config.M

local Dragon = {}

local FORME = 6      -- (DRG_FORME) secondes de NITROOO tenue pour passer des flammes au dragon
local HN = 220       -- la TRAJECTOIRE : un point tous les 35 cm
local SPN = 24       -- les points de l'échine (40 sur le web : des rubans droits entre deux points suffisent à 24)
local VREF = 2.9     -- (FLOW_VREF) la croisière du moteur, pour le vent relatif
local V3 = Vector3.new

-- ── les COULEURS (le feu · la nitro infinie · la dark triad) ──
-- la feuille de papier du web (DRG_PF) : liseré sombre, rouge, orange, cœur de paille
local function rvb(h: number): Color3 return Color3.fromRGB(bit32.rshift(h, 16), bit32.band(bit32.rshift(h, 8), 255), bit32.band(h, 255)) end
local function ss(x: number, a: number, b: number): number
	local t = math.clamp((x - a) / (b - a), 0, 1)
	return t * t * (3 - 2 * t)
end
-- (drgViolet) le rouge → violet, l'or → lilas pâle
local function violet(c: Color3): Color3
	local h, s, v = c:ToHSV()
	local deg = h * 360
	if deg > 180 then deg -= 360 end
	local dore = ss(deg, 22, 42)
	return Color3.fromHSV(((272 + 0.35 * deg) % 360) / 360, s * (1 - 0.5 * dore), math.min(1, v + 0.1 * dore))
end
-- (drgNoir) le rouge → noir d'encre, l'or → brun-sang, le plus clair garde un filet rouge vif
local function noir(c: Color3): Color3
	local h, _, _ = c:ToHSV()
	local deg = h * 360
	if deg > 180 then deg -= 360 end
	local mx, mn = math.max(c.R, c.G, c.B), math.min(c.R, c.G, c.B)
	local L = (mx + mn) / 2
	local dore = (mx - mn <= 0.02) and 0 or ss(deg, 20, 40)
	local vif = ss(L, 0.74, 0.9)
	local k, s, a = 0.03 + 0.13 * L, 0.1 + 0.22 * L, 0.55 + 0.5 * L
	local r, g, b = k * 0.92 * (1 - dore) + s * dore, k * 0.86 * (1 - dore) + s * 0.05 * dore, k * (1 - dore) + s * 0.1 * dore
	r += (a - r) * vif
	g += (a * 0.07 - g) * vif
	b += (a * 0.13 - b) * vif
	return Color3.new(math.clamp(r, 0, 1), math.clamp(g, 0, 1), math.clamp(b, 0, 1))
end
local function c3(t: { number }): Color3 return Color3.new(math.min(1, t[1]), math.min(1, t[2]), math.min(1, t[3])) end
local PAPIER = { sombre = rvb(0x7a0c0e), rouge = rvb(0xc8201a), vermillon = rvb(0xec3a2c), orange = rvb(0xee4a22), or_ = rvb(0xffb83a), paille = rvb(0xffe9a8),
	pli = rvb(0xb81a16), ecaille = rvb(0xffd75e) }
local function palette(teinte: ((Color3) -> Color3)?, feu: { [string]: any }): { [string]: any }
	local p: { [string]: any } = {}
	for k, c in PAPIER do p[k] = teinte and teinte(c) or c end
	for k, v in feu do p[k] = v end
	return p
end
-- H haut de flamme · Q queue de flamme · C crête · G moustaches · A halo · O l'œil · coque / coeur : la comète
local PAL = {
	feu = palette(nil, { H = c3({ 1, 0.82, 0.4 }), Q = c3({ 0.95, 0.2, 0.05 }), C = c3({ 1, 0.72, 0.2 }), G = c3({ 1, 0.86, 0.46 }), A = c3({ 1, 0.34, 0.06 }),
		O = rvb(0xffa030), coque = rvb(0xff3a0c), coeur = rvb(0xffc050), gueule = rvb(0xffc050), bord = Color3.fromRGB(255, 110, 30), feuK = 1 }),
	vio = palette(violet, { H = c3({ 0.95, 0.82, 1 }), Q = c3({ 0.5, 0.14, 0.9 }), C = c3({ 0.92, 0.7, 1 }), G = c3({ 0.98, 0.88, 1 }), A = c3({ 0.62, 0.2, 1 }),
		O = rvb(0xb070ff), coque = rvb(0x9d4dff), coeur = rvb(0xd8b0ff), gueule = rvb(0xd0a0ff), bord = Color3.fromRGB(170, 90, 255), feuK = 1 }),
	-- (l'additif ne sait pas faire du noir : en dark triad le feu se tait presque, c'est le papier noir qui parle)
	noi = palette(noir, { H = rvb(0x5a0010), Q = rvb(0x200004), C = rvb(0x70101c), G = rvb(0x90202c), A = rvb(0x300008),
		O = rvb(0xff1830), coque = rvb(0x5a0010), coeur = rvb(0x90101c), gueule = rvb(0xff2030), bord = Color3.fromRGB(255, 30, 50), feuK = 0.25 }),
}

-- ── le CRÂNE (DRG_CR) : sept couronnes de la nuque au bout du museau — [z, y du sommet, (x,y) haut du flanc, (x,y) flanc, (x,y) bas]
-- Coordonnées « tête » : x ±1, y −1 (le sol) → 1 (le haut du crâne), z −1 (la nuque) → 1 (le museau).
local CR = { { -1, 0.5, 0.55, 0.42, 0.88, -0.05, 0.8, -0.8 }, { -0.62, 0.88, 0.7, 0.72, 1, 0.05, 0.9, -0.8 }, { -0.25, 0.8, 0.86, 0.6, 0.98, -0.02, 0.86, -0.7 },
	{ 0.15, 0.62, 0.72, 0.48, 0.88, -0.08, 0.78, -0.5 }, { 0.55, 0.46, 0.56, 0.38, 0.68, -0.12, 0.56, -0.38 }, { 0.85, 0.56, 0.44, 0.44, 0.5, -0.08, 0.4, -0.34 },
	{ 1.05, 0.34, 0.3, 0.28, 0.32, -0.12, 0.22, -0.3 } }
-- la MÂCHOIRE (DRG_MC) : [z, lèvre (x,y), flanc (x,y), y du menton]
local MC = { { -0.2, 0.86, -0.55, 0.8, -0.88, -0.98 }, { 0.3, 0.66, -0.52, 0.62, -0.86, -0.96 }, { 0.7, 0.44, -0.48, 0.4, -0.8, -0.9 }, { 0.95, 0.24, -0.44, 0.22, -0.7, -0.76 } }
local RK, RS = { 3, 2, 1, 0, 1, 2, 3 }, { -1, -1, -1, 0, 1, 1, 1 } -- une couronne : bas gauche → sommet → bas droit
local BR = { [0] = 1.25, 0.95, 0.72, 0.5 }                          -- la lumière vient du HAUT : l'arête claire, le bas sombre
local CHARNIERE = V3(0, -0.5, -0.2)                                 -- la mâchoire pivote ici

local function eclaire(c: Color3, k: number): Color3
	return Color3.new(math.min(1, c.R * k), math.min(1, c.G * k), math.min(1, c.B * k))
end
-- les triangles du crâne et de la mâchoire, aux couleurs d'une palette (l'arête en paille, les flancs rouges, le bas sombre)
local function triangles(p: { [string]: any }): ({ { any } }, { { any } })
	local feuille = { [0] = p.paille, p.orange, p.rouge, p.sombre }
	local blanc = eclaire(p.paille, 1.3)
	local crane: { { any } } = {}
	local function rang(s: number): ({ Vector3 }, { Color3 })
		local R = CR[s]
		local pts, cols = {}, {}
		for k = 1, 7 do
			local q, sg = RK[k], RS[k]
			pts[k] = V3((q > 0) and R[2 * q + 1] * sg or 0, (q > 0) and R[2 * q + 2] or R[2], R[1])
			cols[k] = eclaire(feuille[q], BR[q])
		end
		return pts, cols
	end
	local function quad(t: { { any } }, a: Vector3, b: Vector3, c: Vector3, d: Vector3, ca: Color3, cb: Color3, cc: Color3, cd: Color3)
		table.insert(t, { a, c, b, ca, cc, cb })
		table.insert(t, { b, c, d, cb, cc, cd })
	end
	for s = 1, #CR - 1 do
		local pa, ca = rang(s)
		local pb, cb = rang(s + 1)
		for k = 1, 6 do quad(crane, pa[k], pa[k + 1], pb[k], pb[k + 1], ca[k], ca[k + 1], cb[k], cb[k + 1]) end
	end
	local pd, cd = rang(#CR)
	local bout = V3(0, 0.04, 1.13) -- le bout du museau
	for k = 1, 6 do table.insert(crane, { pd[k], bout, pd[k + 1], cd[k], eclaire(p.paille, 1.15), cd[k + 1] }) end
	for _, sg in { -1, 1 } do -- les CROCS du haut, chauffés à blanc
		table.insert(crane, { V3(sg * 0.47, -0.36, 0.46), V3(sg * 0.57, -0.36, 0.62), V3(sg * 0.53, -0.68, 0.55), blanc, blanc, blanc })
	end
	local machoire: { { any } } = {}
	local function rangM(s: number): ({ Vector3 }, { Color3 })
		local J = MC[s]
		return { V3(-J[2], J[3], J[1]), V3(-J[4], J[5], J[1]), V3(0, J[6], J[1]), V3(J[4], J[5], J[1]), V3(J[2], J[3], J[1]) },
			{ p.orange, eclaire(p.rouge, 0.9), eclaire(p.sombre, 0.9), eclaire(p.rouge, 0.9), p.orange }
	end
	for s = 1, #MC - 1 do
		local pa, ca = rangM(s)
		local pb, cb = rangM(s + 1)
		for k = 1, 4 do quad(machoire, pa[k], pa[k + 1], pb[k], pb[k + 1], ca[k], ca[k + 1], cb[k], cb[k + 1]) end
	end
	for _, sg in { -1, 1 } do -- les crocs du bas
		table.insert(machoire, { V3(sg * 0.4, -0.5, 0.64), V3(sg * 0.46, -0.5, 0.78), V3(sg * 0.43, -0.22, 0.71), blanc, blanc, blanc })
	end
	return crane, machoire
end

-- ── les RUBANS : n points, n−1 Beam ──
type Ruban = { n: number, a: { Attachment }, b: { Beam }, feu: boolean, alpha: number, c0: Color3?, c1: Color3?, vu: boolean }
local hote: Part
local rubans: { Ruban } = {}
local function ruban(n: number, feu: boolean, z: number?): Ruban
	local r: Ruban = { n = n, a = {}, b = {}, feu = feu, alpha = -1, c0 = nil, c1 = nil, vu = false }
	for i = 1, n do
		local a = Instance.new("Attachment")
		a.Parent = hote
		r.a[i] = a
	end
	for i = 1, n - 1 do
		local b = Instance.new("Beam")
		b.Attachment0, b.Attachment1 = r.a[i], r.a[i + 1]
		b.FaceCamera = true
		b.Segments = 1
		b.LightInfluence = 0
		-- (le feu : la flamme livrée avec Roblox, qui défile le long du ruban — un aplat additif se lisait comme un éclat de verre
		-- pâle sur le ciel de jour)
		b.LightEmission = feu and 0.55 or 0
		if feu then
			b.Texture = "rbxasset://textures/particles/fire_main.dds"
			b.TextureMode = Enum.TextureMode.Stretch
			b.TextureLength = 1
			b.TextureSpeed = 1.6
		end
		b.ZOffset = z or 0
		b.Enabled = false
		b.Parent = hote
		r.b[i] = b
	end
	table.insert(rubans, r)
	return r
end
local function montrer(r: Ruban, on: boolean)
	if r.vu == on then return end
	r.vu = on
	for _, b in r.b do b.Enabled = on end
end
-- la couleur d'un ruban, de la racine au bout, et son opacité (a0 à la racine, a1 au bout) — écrites seulement quand elles changent
local function peindre(r: Ruban, c0: Color3, c1: Color3, a0: number, a1: number)
	local n = r.n - 1
	local cle = math.floor(a0 * 40 + 0.5) + math.floor(a1 * 40 + 0.5) * 64
	if r.c0 == c0 and r.c1 == c1 and r.alpha == cle then return end
	local memeC = r.c0 == c0 and r.c1 == c1
	r.c0, r.c1, r.alpha = c0, c1, cle
	for i, b in r.b do
		local u0, u1 = (i - 1) / n, i / n
		if not memeC then b.Color = ColorSequence.new(c0:Lerp(c1, u0), c0:Lerp(c1, u1)) end
		b.Transparency = NumberSequence.new(1 - (a0 + (a1 - a0) * u0), 1 - (a0 + (a1 - a0) * u1))
	end
end

-- ── l'état ──
local D: any = {
	bati = false, t = 0, em = 0, fo = 0, ne = false, roar = 0, neuf = 0, nS = 0, pal = -1, vOk = false,
	vir = 0, air = 0, imp = 0, envol = 0, nodS = 0, nodV = 0, spd0 = -1, ph = 0, phF = 0, vt = 0, raf = 1, modeP = "drive",
	Us = Vector3.yAxis, vF = V3(0, 0, -1), vP = Vector3.zero, vPrev = V3(0, 0, -1), lS = 0, cl = 2, pouls = 0,
	h = table.create(HN, Vector3.zero), hI = 1, hN = 0,
	SP = table.create(SPN, Vector3.zero), SL = table.create(SPN, Vector3.zero),
	crane = {}, machoire = {}, R = {}, palNom = "",
}
local P: { Vector3 } = table.create(32, Vector3.zero) -- les points du ruban en cours
local W: { number } = table.create(32, 0)            -- ses demi-largeurs (m)

-- ── bâtir (au premier embrasement) ──
local function batir()
	D.bati = true
	hote = Instance.new("Part")
	hote.Name = "Dragon"
	hote.Anchored = true
	hote.CanCollide, hote.CanQuery, hote.CanTouch = false, false, false
	hote.Transparency = 1
	hote.Size = V3(1, 1, 1)
	hote.Parent = workspace
	local R = D.R
	-- le CORPS : la frange de paille, le papier vermillon plié, les écailles d'or ; par-dessus la crête de feu, autour le halo
	R.halo = ruban(SPN, true, -0.4)
	R.frange = ruban(SPN, false, 0)
	R.corps = ruban(SPN, false, 0.15)
	R.ecaille = ruban(SPN, false, 0.3)
	R.crete = ruban(SPN, true, 0.45)
	R.pat = { ruban(3, false, 0.2), ruban(3, false, 0.2), ruban(3, false, 0.2), ruban(3, false, 0.2) }
	R.que = { ruban(3, true, 0.2), ruban(3, true, 0.2), ruban(3, true, 0.2) }
	R.rub = { ruban(4, false, 0.2), ruban(4, false, 0.2), ruban(4, false, 0.2) }
	-- la TÊTE
	R.sour = { ruban(3, false, 0.5), ruban(3, false, 0.5) }
	R.cor = { ruban(4, false, 0.5), ruban(4, false, 0.5) }
	R.andou = { ruban(3, false, 0.5), ruban(3, false, 0.5) }
	R.ore = { ruban(3, false, 0.5), ruban(3, false, 0.5) }
	R.ban = { ruban(5, false, 0.3), ruban(5, false, 0.3) }
	R.mous = { ruban(4, true, 0.5), ruban(4, true, 0.5) }
	R.cri, R.fla, R.bar = {}, {}, {}
	for j = 1, 6 do
		R.cri[j] = ruban(3, true, 0.4)
		R.fla[j] = ruban(3, true, 0.6)
	end
	for j = 1, 3 do R.bar[j] = ruban(3, true, 0.4) end
	-- la COMÈTE : la coque, son cœur blanc, cinq langues
	R.coque = ruban(3, true, -0.2)
	R.coeur = ruban(2, true, -0.1)
	R.langue = {}
	for j = 1, 5 do R.langue[j] = ruban(2, true, 0) end
	-- les YEUX (chauffés à blanc, pupille fendue) et la lueur de la gueule
	D.yeux = {}
	for i = 1, 2 do
		local o = Instance.new("Part")
		Instance.new("SpecialMesh", o).MeshType = Enum.MeshType.Sphere -- (une amande : une boule étirée)
		o.Material = Enum.Material.Neon
		o.Anchored = true
		o.CanCollide, o.CanQuery, o.CanTouch, o.CastShadow = false, false, false, false
		o.Transparency = 1
		o.Parent = hote
		local pu = o:Clone()
		pu.Color = Color3.fromRGB(20, 0, 10)
		pu.Material = Enum.Material.SmoothPlastic
		pu.Parent = hote
		D.yeux[i] = { o, pu }
	end
	local ag = Instance.new("Attachment")
	ag.Parent = hote
	local lg = Instance.new("PointLight")
	lg.Range = 14 * M
	lg.Brightness = 0
	lg.Shadows = false
	lg.Parent = ag
	D.gueuleA, D.gueuleL = ag, lg
	-- le crâne et la mâchoire, aux trois couleurs (en tâche de fond : le feu n'attend pas)
	task.spawn(function()
		for _, nom in { "feu", "vio", "noi" } do
			local tc, tm = triangles(PAL[nom])
			local pc, cc, sc = Maillage.brut(tc)
			local pm, cm, sm = Maillage.brut(tm)
			if pc then
				pc.Material = Enum.Material.SmoothPlastic
				pc.Transparency = 1
				pc.Parent = hote
				D.crane[nom] = { p = pc, c = cc, s = sc }
			end
			if pm then
				pm.Material = Enum.Material.SmoothPlastic
				pm.Transparency = 1
				pm.Parent = hote
				D.machoire[nom] = { p = pm, c = cm, s = sm }
			end
		end
	end)
end

local function cacher()
	if not D.bati or not D.visible then return end
	D.visible = false
	for _, r in rubans do montrer(r, false) end
	for _, k in D.crane do k.p.Transparency = 1 end
	for _, k in D.machoire do k.p.Transparency = 1 end
	for _, y in D.yeux do
		y[1].Transparency = 1
		y[2].Transparency = 1
	end
	D.gueuleL.Brightness = 0
end

-- ── la TRAJECTOIRE de la caisse : un anneau (hI = le plus récent, toujours la caisse), un point de plus tous les 35 cm ──
local function histo(c: Vector3, raz: boolean, cF: Vector3)
	local H = D.h
	if raz then
		D.hI, D.hN = 1, 40
		for i = 0, 39 do H[((1 - 1 - i) % HN) + 1] = c - cF * (0.5 * i) end -- en ligne droite derrière la caisse
		return
	end
	local prec = H[((D.hI - 2) % HN) + 1]
	if (c - prec).Magnitude >= 0.35 then
		D.hI = (D.hI % HN) + 1
		D.hN = math.min(HN, D.hN + 1)
	end
	H[D.hI] = c
end
local function pt(i: number): Vector3 return D.h[((D.hI - 1 - i) % HN) + 1] end
-- l'ÉCHINE : SPN points à pas égal le long de la trajectoire, de dA à dA+Lb derrière la caisse, et leur latérale
local function echineCalc(cF: Vector3, cR: Vector3)
	local st = math.max(0.01, D.Lb) / (SPN - 1)
	local i, acc = 0, 0
	local A, B = pt(0), pt(1)
	local sg = (A - B).Magnitude
	for m = 1, SPN do
		local dd = D.dA + (m - 1) * st
		while acc + sg < dd and i < D.hN - 2 do
			acc += sg
			i += 1
			A = B
			B = pt(i + 1)
			sg = (A - B).Magnitude
		end
		if acc + sg >= dd then
			D.SP[m] = A:Lerp(B, (sg > 1e-5) and (dd - acc) / sg or 0)
		else
			local d = B - A
			d = (d.Magnitude > 1e-4) and d.Unit or -cF
			D.SP[m] = B + d * (dd - acc - sg) -- trajectoire trop courte : tout droit
		end
	end
	for m = 1, SPN do
		local d = D.SP[math.max(1, m - 1)] - D.SP[math.min(SPN, m + 1)]
		local l = d:Cross(D.U)
		D.SL[m] = (l.Magnitude > 1e-5) and l.Unit or cR
	end
end
-- un point du CORPS (u : 0 la nuque → 1 le bout de la queue) : la trajectoire + l'ONDULATION + le CLAQUEMENT du papier
local function echine(u: number): Vector3
	local x = math.clamp(u * (SPN - 1), 0, SPN - 1.001)
	local i = math.floor(x)
	local f = x - i
	local s = u * D.Lb
	local o = D.SP[i + 1]:Lerp(D.SP[i + 2], f)
	local env = ss(s, 0.4, 3)
	local ph = 6.2832 * s / D.lam - D.ph
	local sl = D.SL[i + 1]:Lerp(D.SL[i + 2], f)
	local bt = env * u * (0.3 + 0.7 * u)
	local fq = 6.2832 * s / D.flm - D.phF
	local cl = D.Af * bt
	o += sl * (D.Aw * env * math.sin(ph) + cl * (math.sin(fq) + 0.45 * math.sin(2.3 * fq + 1.7)) + D.dev * u * u)
		+ D.U * (D.y0 + D.Av * env * math.sin(ph * 0.7 + 1.1) + cl * 0.7 * math.cos(fq * 0.9 + 0.8) - D.sag * u * u)
	if s < 1.8 then o = o:Lerp(D.N0, 1 - ss(s, 0, 1.8)) end -- la NUQUE sort de l'arrière de la tête
	return o
end

-- écrit le ruban `r` depuis P / W (mètres), aminci près de l'objectif (2,6 → 6,5 m) ; kz = l'échelle des largeurs
local function poser(r: Ruban, cam: Vector3, kz: number?)
	local k = (kz or 1) * 2 * M
	local n = r.n
	local l0 = W[1] * ss((P[1] - cam).Magnitude, 2.6, 6.5) * k
	r.a[1].WorldPosition = P[1] * M
	for i = 2, n do
		r.a[i].WorldPosition = P[i] * M
		local l1 = W[i] * ss((P[i] - cam).Magnitude, 2.6, 6.5) * k
		local b = r.b[i - 1]
		b.Width0, b.Width1 = l0, l1
		l0 = l1
	end
	montrer(r, true)
end

-- ════════ chaque image ════════
local K: { Vector3 } = { Vector3.zero, Vector3.zero, Vector3.zero, Vector3.zero }
local function tick(dt: number)
	local e = Bus.etat()
	local N = e.ntr
	if not N or not e.carCF or not e.fiche then return end
	local vis = N.k
	if vis < 0.02 then
		cacher()
		D.pal, D.roar, D.em, D.fo, D.ne, D.vOk, D.nS = -1, 0, 0, 0, false, false, 0
		return
	end
	if e.pause then return end
	if not D.bati then batir() end
	D.visible = true
	D.t += dt
	local t = D.t
	D.em = math.min(1, D.em + dt / 0.6)     -- il JAILLIT de la caisse
	D.fo = math.min(1, D.fo + dt / FORME)   -- et il se FORME, lentement
	local camCF = workspace.CurrentCamera.CFrame
	local cam, camUp = camCF.Position / M, camCF.UpVector
	local cf: CFrame = e.carCF
	local c = cf.Position / M
	local cF, cU = cf.LookVector, cf.UpVector
	local cR = cU:Cross(cF) -- (le +x du web : à GAUCHE de l'écran quand on suit la caisse)
	local sp = e.fiche
	hote.CFrame = CFrame.new(cf.Position)
	-- LA TRAJECTOIRE (un portail, un téléport : le corps repart tout droit derrière) et le HAUT : celui de l'ÉCRAN, lissé
	local pas = 0
	if not D.vOk then
		D.Us, D.vF, D.vP, D.lS, D.vOk = camUp, cF, c, 0, true
		D.vPrev, D.spd0 = cF, -1
		histo(c, true, cF)
	else
		pas = (c - D.vP).Magnitude
		if pas > 4 * D.lS + 10 then
			D.vF = cF
			histo(c, true, cF)
			pas = 0
		else
			D.lS += (pas - D.lS) * 0.3
			histo(c, false, cF)
			if pas > 0.02 then D.vF = D.vF:Lerp((c - D.vP) / pas, 1 - math.exp(-dt * 6)).Unit end
		end
		D.vP = c
	end
	D.Us = D.Us:Lerp(camUp, 1 - math.exp(-dt * 2.5))
	D.Us = (D.Us.Magnitude < 1e-2) and camUp or D.Us.Unit
	D.U = D.Us
	-- LE REPÈRE DE LA TÊTE : la trajectoire lissée et le haut de l'écran — la caisse fait ses figures DEDANS
	local hF: Vector3 = D.vF
	local hU = D.Us - hF * D.Us:Dot(hF)
	if hU.Magnitude < 1e-2 then hU = cU - hF * cU:Dot(hF) end
	hU = hU.Unit
	local hR = hU:Cross(hF)
	-- le VIRAGE, l'AIR, le RESSORT de la tête, le VENT
	local yr = D.vPrev:Cross(hF):Dot(hU) / math.max(1e-3, dt)
	D.vPrev = hF
	D.vir += (math.clamp(yr / 1.1, -1, 1) - D.vir) * (1 - math.exp(-dt * 5))
	local ai = (e.mode == "fall") and 1 or 0
	D.air += (ai - D.air) * (1 - math.exp(-dt * ((ai == 1) and 3 or 5)))
	if D.modeP == "fall" and e.mode == "drive" then D.imp = 1 end
	if D.modeP == "drive" and e.mode == "fall" then D.envol = 1 end
	D.modeP = e.mode
	D.imp = math.max(0, D.imp - dt * 2.6)
	D.envol = math.max(0, D.envol - dt * 1.6)
	local v9 = pas / math.max(1e-3, dt)
	if D.spd0 < 0 then D.spd0 = v9 end
	local ac = math.clamp((v9 - D.spd0) / math.max(1e-3, dt), -400, 400)
	D.spd0 = v9
	local cib = -math.clamp(ac / 60, -1, 1) * 0.09 + 0.1 * D.envol - 0.1 * D.imp
	D.nodV += ((cib - D.nodS) * 60 - D.nodV * 7) * dt
	D.nodS = math.clamp(D.nodS + D.nodV * dt, -0.25, 0.25)
	D.ph += dt * (4.6 - 1.6 * D.air) -- les ondes du corps courent moins vite en vol : il NAGE
	local wv = (e.kmh or 0) / math.max(1, (e.vmax or 200) * VREF)
	D.vt += (math.clamp((wv - 0.45) / 1.5, 0, 1.7) - D.vt) * (1 - math.exp(-dt * 2.2))
	D.raf = 0.74 + 0.26 * math.sin(t * 0.83) * math.sin(t * 0.37 + 1.3) + 0.5 * math.min(1, math.abs(ac) / 160)
	D.phF += dt * (6.5 + 13 * D.vt)
	local bk = 0.3 * D.vir * (1 - 0.4 * D.air)
	local kU = hU * math.cos(bk) + hR * math.sin(bk)
	local kR = hR * math.cos(bk) - hU * math.sin(bk)
	-- LES PALIERS : un palier = un RUGISSEMENT, et un tronçon de plus
	local rugit = false
	if N.pal ~= D.pal then
		if D.pal >= 0 and N.pal > D.pal then
			D.roar, D.neuf, rugit = 1, 1, true
		end
		D.pal = N.pal
	end
	if not D.ne and D.fo >= 0.86 then -- les yeux viennent de s'ouvrir : il est NÉ, il rugit
		D.ne, D.roar, rugit = true, 1, true
	end
	D.roar = math.max(0, D.roar - dt * 1.4)
	D.neuf = math.max(0, D.neuf - dt * 1.1)
	D.nS += (math.max(0, N.pal) - D.nS) * math.min(1, dt * 2.4)
	local n9, gT = D.nS, (N.gT or 0)
	local gB = math.min(1, n9 / 10)
	local R9 = (D.roar > 0.82) and (1 - D.roar) / 0.18 or D.roar / 0.82
	local em, VR, AI, IM, VT = D.em, D.vir, D.air, D.imp, D.vt
	local v1 = math.min(1, VT)
	local V = vis * (1 + 0.25 * R9)
	local FO = D.fo
	local fCr, fTr, fOe, fMo, fBo, fCo = ss(FO, 0.2, 0.58), ss(FO, 0.38, 0.75), ss(FO, 0.68, 0.86), ss(FO, 0.3, 0.7), ss(FO, 0.3, 0.6), ss(FO, 0.7, 1)
	local CHs = 1 - ss(FO, 0.15, 0.7) -- le CHAOS du début : des flammes sauvages
	local nomPal = Score.frenesie() and "noi" or (e.infini and "vio" or "feu")
	local C9 = PAL[nomPal]
	local R = D.R
	local function fl(u: number): number return 0.78 + 0.22 * math.sin(23 * u - 11 * t) * math.sin(7 * u + 5.3 * t) end

	-- ===== LA TÊTE : elle GROSSIT et devient OPAQUE avec la tenue =====
	local hw, hh, hl = sp.w * 0.5, sp.h, sp.l * 0.5
	local Hs = (1 + 0.4 * gT) * (0.45 + 0.55 * em) * (1 + 0.06 * R9) * (1 + 0.022 * math.sin(t * 2.3)) * (1 + 0.25 * (1 - fCr))
	local TX, TY, TZ = hw * 1.32 * Hs * (1 + 0.08 * IM), hh * 0.875 * Hs * (1 - 0.14 * IM), hl * 1.4 * Hs
	local Z0 = -hl + 1.4 * hl * Hs -- elle grossit vers l'AVANT et vers le HAUT : la nuque reste à l'arrière de la caisse
	local sw = 0.07 * math.sin(t * 1.3) * (1 - 0.6 * math.abs(VR)) + 0.03 * math.sin(t * 3.1) + 0.24 * VR
	local nod = 0.04 * math.sin(t * 2.1 + 1) + 0.1 * R9 + D.nodS
	local function MT(x: number, y: number, z: number): Vector3 -- coordonnées TÊTE → monde (m)
		local zz = math.max(0, z + 1) * 0.5
		return c + kR * ((x + sw * zz) * TX) + kU * (0.04 + (y + 1 + nod * zz) * TY) + hF * (Z0 + z * TZ)
	end
	-- la CAMÉRA DANS LA TÊTE : elle s'efface quand l'objectif s'en approche
	local fC
	do
		local d = cam - c
		local x9, y9, z9 = d:Dot(hR) / TX, (d:Dot(hU) - 0.04) / TY - 1, (d:Dot(hF) - Z0) / TZ
		fC = ss(x9 * x9 + y9 * y9 / 1.44 + z9 * z9 / 1.32, 1.05, 2.1)
	end
	local noirK = (nomPal == "noi")
	local opCrane = math.min(1, ((noirK and 0.92 or 0.5) + (noirK and 0.08 or 0.5) * gT) * V * (0.4 + 0.6 * em)) * fC * fCr
	local opPapier = math.min(1, ((noirK and 0.9 or 0.45) + (noirK and 0.1 or 0.55) * gT) * V * (0.4 + 0.6 * em)) * fTr * fC
	local opFeu = math.min(1, V * (0.55 + 0.6 * gT)) * C9.feuK
	-- le crâne et la mâchoire : posés dans le repère de la tête, étirés à sa taille ; le museau regarde dans le virage et hoche
	local oa = 0.06 + 0.4 * R9 + 0.06 * math.max(0, math.sin(t * 1.9)) + 0.14 * AI * (0.6 + 0.4 * math.sin(t * 3.3)) + 0.12 * IM
	do
		local base = CFrame.fromMatrix((c + kU * 0.04 + hF * Z0) * M, kR, kU, hF) * CFrame.new(0, TY * M, 0)
		local nuque = CFrame.new(0, 0, -TZ * M)
		local vie = nuque * CFrame.Angles(-nod * 0.5 * TY / TZ, sw * 0.5 * TX / TZ, 0) * nuque:Inverse()
		local ech = V3(TX * M, TY * M, TZ * M)
		for nom, k in D.crane do
			if nom == nomPal and opCrane > 0.02 then
				k.p.Size = k.s * ech
				k.p.CFrame = base * vie * CFrame.new(k.c * ech)
				k.p.Transparency = 1 - opCrane
			else
				k.p.Transparency = 1
			end
		end
		local ch = CFrame.new(CHARNIERE * ech)
		for nom, k in D.machoire do
			if nom == nomPal and opCrane > 0.02 then
				k.p.Size = k.s * ech
				k.p.CFrame = base * vie * ch * CFrame.Angles(oa, 0, 0) * ch:Inverse() * CFrame.new(k.c * ech)
				k.p.Transparency = 1 - opCrane
			else
				k.p.Transparency = 1
			end
		end
	end
	-- un RUBAN le long de la courbe de Bézier K1 → K4 (coordonnées TÊTE) : demi-largeur wA → wB (m)
	local function courbe(r: Ruban, wA: number, wB: number)
		local n = r.n
		for i = 1, n do
			local u = (i - 1) / (n - 1)
			local a, b, cc, d = (1 - u) ^ 3, 3 * (1 - u) ^ 2 * u, 3 * (1 - u) * u * u, u ^ 3
			local q = K[1] * a + K[2] * b + K[3] * cc + K[4] * d
			P[i] = MT(q.X, q.Y, q.Z)
			W[i] = (wA + (wB - wA) * u) * Hs
		end
		poser(r, cam)
	end
	local pointes = { Vector3.zero, Vector3.zero }
	for s2 = 1, 2 do
		local sg = (s2 == 1) and -1 or 1
		-- les SOURCILS : des bourrelets au-dessus des yeux, relevés vers l'extérieur (il est FÂCHÉ)
		K[1], K[2], K[3], K[4] = V3(sg * 0.3, 0.84, 0.02), V3(sg * 0.62, 0.92, -0.12), V3(sg * 0.9, 0.92, -0.28), V3(sg * 1.1, 1.04, -0.46)
		courbe(R.sour[s2], 0.26, 0.08)
		peindre(R.sour[s2], C9.orange, C9.paille, opPapier, opPapier)
		-- les BOIS : deux cornes qui partent de l'arrière du crâne — elles poussent avec la tenue, le vent les couche
		local hf = (0.95 + 0.3 * gT) * (0.2 + 0.8 * fTr)
		local bx, by, bz = sg * 0.42, 0.86, -0.72
		K[1], K[2] = V3(bx, by, bz), V3(bx + sg * 0.1 * hf, by + 0.45 * hf, bz - 0.2 * hf - 0.05 * VT)
		K[3] = V3(bx + sg * 0.32 * hf, by + (0.85 - 0.06 * VT) * hf, bz - 0.38 * hf - 0.2 * VT)
		K[4] = V3(bx + sg * 0.55 * hf, by + (1.1 - 0.16 * VT) * hf, bz - 0.25 * hf - 0.42 * VT + 0.05 * VT * math.sin(D.phF * 0.9 + sg))
		pointes[s2] = K[4]
		local k1, k2, k3, k4 = K[1], K[2], K[3], K[4]
		courbe(R.cor[s2], 0.3, 0.05)
		peindre(R.cor[s2], C9.rouge, C9.paille, opPapier, opPapier)
		-- l'ANDOUILLER, dressé au milieu du bois
		do
			local u = 0.45
			local a, b, cc, d = (1 - u) ^ 3, 3 * (1 - u) ^ 2 * u, 3 * (1 - u) * u * u, u ^ 3
			local q = k1 * a + k2 * b + k3 * cc + k4 * d
			K[1], K[2], K[3], K[4] = q, q + V3(sg * 0.04, 0.25 * hf, 0.1), q + V3(sg * 0.08, 0.45 * hf, 0.2), q + V3(sg * 0.1, 0.6 * hf, 0.32)
			courbe(R.andou[s2], 0.18, 0.04)
			peindre(R.andou[s2], C9.rouge, C9.paille, opPapier, opPapier)
		end
		-- les NAGEOIRES : un éventail derrière l'œil, qui bat (des AILES en vol)
		do
			local b9 = (0.08 + 0.22 * AI) * math.sin(t * (4.3 - 1.7 * AI) + sg)
			local fo = 1 - 0.3 * VR * sg
			K[1], K[2] = V3(sg * 0.94, 0.42, -0.42), V3(sg * (1.18 + b9) * fo, 0.58, -0.6)
			K[3] = V3(sg * (1.42 + b9) * fo, 0.74 + 0.1 * AI * math.sin(t * 2.6 + sg), -0.76)
			K[4] = V3(sg * (1.58 + b9 * 1.5) * fo, 0.96 + 0.18 * AI * math.sin(t * 2.6 + sg - 0.4), -0.82)
			courbe(R.ore[s2], 0.3, 0.05)
			peindre(R.ore[s2], C9.vermillon, C9.or_, opPapier, opPapier)
		end
		-- les YEUX, sur les flancs du crâne, sous les sourcils : on ne les voit que de face (de la poursuite, il regarde devant)
		do
			local pos = MT(sg * 0.98, 0.54, -0.3)
			local axe = (kR * (sg * 0.82) + kU * 0.22 + hF * 0.52).Unit
			local vu = ss((cam - pos).Unit:Dot(axe), 0.08, 0.42)
			local op = math.min(1, 1.3 * V * (0.5 + 0.5 * em)) * fC * fOe * vu
			local eb = (1 + 0.35 * R9) * (0.9 + 0.2 * gT)
			local cli = (D.cl < 0.09) and 0.15 or 1
			local y = D.yeux[s2]
			local rep = CFrame.lookAt(pos * M, (pos + axe) * M, kU) -- l'amande : longue vers l'avant, plate vers l'extérieur
			y[1].Size = V3(1.5 * Hs * eb, 0.75 * Hs * eb * cli * math.max(0.06, fOe), 0.3 * Hs) * M
			y[1].CFrame = rep
			y[1].Color = C9.O
			y[1].Transparency = 1 - op
			y[2].Size = V3(0.16 * Hs * eb, 0.6 * Hs * eb * cli * math.max(0.06, fOe), 0.34 * Hs) * M
			y[2].CFrame = rep
			y[2].Transparency = 1 - op
		end
		-- les MOUSTACHES : des flancs du museau, longues, une onde court de la racine au bout — de la soie
		do
			local mm = (1 + 0.5 * gT) * (1 + 0.3 * AI) * (0.3 + 0.7 * fMo) * (0.8 + 0.35 * math.min(1.4, VT))
			local function on(u: number, f: number): number return math.sin(D.phF * 0.62 - u * 4.6 + sg * 1.3 + f) end
			K[1], K[2] = V3(sg * 0.46, -0.08, 0.9), V3(sg * (0.85 + 0.1 * on(0.33, 0)) - VR * 0.1, 0.02 + 0.15 * on(0.33, 1.6), 0.7)
			K[3] = V3(sg * (1.25 + 0.13 * on(0.66, 0)) - VR * 0.24, -0.08 + 0.14 * on(0.66, 1.6), 0.15)
			K[4] = V3(sg * (1.5 + 0.17 * on(1, 0)) - VR * 0.4, 0.15 + 0.17 * on(1, 1.6), -0.5 * mm)
			courbe(R.mous[s2], 0.15 * fMo, 0.04 * fMo)
			peindre(R.mous[s2], C9.G, C9.C, opFeu * fC, opFeu * 0.5 * fC)
		end
	end
	D.cl -= dt
	if D.cl < 0 then D.cl = 2.5 + math.random() * 2 end
	-- la LUEUR de la GUEULE : le feu qui couve entre les crocs — elle éclate au rugissement
	D.gueuleA.WorldPosition = MT(0, -0.42, 0.95) * M
	D.gueuleL.Color = C9.gueule
	D.gueuleL.Brightness = math.min(1, (0.55 + 0.45 * R9 + 0.3 * AI) * V) * fBo * 3 * C9.feuK
	-- la CRINIÈRE : six langues de feu qui partent de la nuque vers l'arrière et l'extérieur — plus longues avec la tenue
	do
		local ml = (0.8 + 0.4 * gT) * (1 + 0.35 * AI) * (1 + 0.4 * CHs) * (0.85 + 0.3 * v1)
		for j = 0, 5 do
			local sg, lv = (j < 3) and -1 or 1, j % 3
			local bx, by, bz = sg * 0.86, -0.1 + 0.35 * lv, -0.95
			local function on(u: number): number return (0.1 + 0.1 * VT) * u * math.sin(D.phF * 0.85 - u * 5 + j * 1.7) end
			K[1], K[2] = V3(bx, by, bz), V3(bx + sg * 0.2 - VR * 0.12, by + 0.12 + on(0.33), bz - 0.3 * ml)
			K[3] = V3(bx + sg * 0.4 - VR * 0.26, by + 0.25 + on(0.66), bz - 0.6 * ml)
			K[4] = V3(bx + sg * 0.55 - VR * 0.42 + on(1) * 0.6, by + 0.38 + on(1), bz - 0.9 * ml)
			courbe(R.cri[j + 1], 0.5, 0.06)
			peindre(R.cri[j + 1], C9.H, C9.Q, opFeu * fC * 0.8, 0)
		end
	end
	-- les FLAMMÈCHES : six langues qui lèchent le crâne vers la nuque — la tête est EN FEU, plus avec la tenue
	do
		local lf = (0.55 + 0.55 * gT) * (1 + 0.25 * AI) * (1 + 0.5 * CHs)
		local BX, BY, BZ = { 0.18, 0.72, 0.9 }, { 0.7, 0.5, 0 }, { 0.35, -0.05, 0.15 }
		for j = 0, 5 do
			local sg, rg = (j % 2 == 1) and 1 or -1, math.floor(j / 2) + 1
			local bx, by, bz = sg * BX[rg], BY[rg], BZ[rg]
			local w1, w2 = 0.1 * math.sin(t * 13 + j * 2.1), 0.12 * math.sin(t * 9.7 + j * 1.3)
			K[1], K[2] = V3(bx, by, bz), V3(bx + sg * 0.06 + w1 - VR * 0.05, by + 0.2 * lf, bz - 0.25 * lf)
			K[3] = V3(bx + sg * 0.12 + w2 - VR * 0.1, by + 0.36 * lf, bz - 0.5 * lf)
			K[4] = V3(bx + sg * 0.16 + w1 - VR * 0.16, by + 0.46 * lf + w2, bz - 0.8 * lf)
			courbe(R.fla[j + 1], 0.26, 0.03)
			peindre(R.fla[j + 1], C9.H, C9.Q, opFeu * fC * fl(j * 0.3), 0)
		end
	end
	-- la BARBE : trois langues sous le menton
	for j = 0, 2 do
		local o, w = j - 1, 0.06 * math.sin(t * 9 + j)
		K[1], K[2], K[3], K[4] = V3(o * 0.12, -0.78, 0.82), V3(o * 0.16 + w, -0.9, 0.7), V3(o * 0.2, -1, 0.55), V3(o * 0.25 + w, -1.05, 0.36)
		courbe(R.bar[j + 1], 0.2 * fMo, 0.04 * fMo)
		peindre(R.bar[j + 1], C9.C, C9.Q, opFeu * fC * 0.8, 0)
	end
	-- LES BANDEROLES : deux larges bandes de papier nouées à la POINTE des bois ; elles filent derrière la tête en V, CLAQUENT
	-- plus vite et plus fort avec la vitesse, se TORDENT (leur largeur bat), partent vers l'extérieur du virage, PENDENT sans vent
	do
		local Lr = (2.2 + 2.4 * gT) * (0.6 + 0.45 * v1) * fTr * (1 - 0.45 * AI)
		for s2 = 1, 2 do
			local sg = (s2 == 1) and -1 or 1
			local r = R.ban[s2]
			local noeud = MT(pointes[s2].X, pointes[s2].Y, pointes[s2].Z)
			for i = 1, r.n do
				local u = (i - 1) / (r.n - 1)
				local d = u * Lr
				local bt = u * (0.3 + 0.7 * u)
				local fq = 6.2832 * d / 1.5 - D.phF * 1.15 + sg * 1.7
				local cl = (0.12 + 0.46 * VT) * D.raf * bt * (1 + 0.4 * CHs)
				P[i] = noeud - hF * (d * (0.55 + 0.3 * v1)) + kR * (sg * 0.36 * d - VR * 0.5 * u * u * Lr + cl * math.sin(fq))
					+ kU * (0.26 * d * v1 * (1 - 0.85 * AI) - (1 - v1) * (1 - v1) * 0.8 * Lr * u * u + cl * 0.7 * math.cos(fq * 0.9 + 0.6))
				W[i] = (0.36 - 0.16 * u) * Hs * (0.5 + 0.5 * math.abs(math.cos(fq * 0.5 + sg)))
			end
			poser(r, cam)
			peindre(r, C9.vermillon, C9.paille, opPapier, opPapier)
		end
	end

	-- ===== LE CORPS : il suit la TRAJECTOIRE, un compartiment par palier — il sort APRÈS la tête formée =====
	local Lc = 1.7 + 0.5 * gB
	local Lb = n9 * Lc * (0.5 + 0.5 * em) * fCo
	local corps = Lb > 0.25
	D.Lb, D.dA = Lb, hl
	D.N0 = MT(0, -0.35, -0.95) -- la NUQUE : l'arrière de la tête
	-- (vu dans Studio : en vol la caméra est derrière la caisse, DANS l'axe du corps — à pleine largeur il la cachait entièrement.
	-- En l'air il s'affine et passe SOUS la trajectoire : on voit la caisse par-dessus.)
	local Wc = (0.4 + 0.5 * gB + 0.06 * R9) * (1 - 0.4 * AI)
	D.Aw = (0.35 + 1.1 * gB) * (1 - 0.45 * math.abs(VR)) * (1 + 0.35 * AI) * (1.3 - 0.6 * v1) -- fort, le vent le TEND
	D.Av = (0.2 + 0.35 * gB) * (1 + 0.6 * AI)
	D.y0 = (0.3 + Wc) * (1 - AI) - 1.6 * Wc * AI
	D.lam = (4 + 2 * gB) * (1 + 0.35 * AI)
	D.Af = Wc * (0.22 + 0.85 * VT) * D.raf   -- …et le fait CLAQUER
	D.flm = 1.5 + 0.5 * Wc + 0.5 * v1
	D.dev = 0.1 * VR * Lb * v1               -- en virage le bout libre part vers l'extérieur
	D.sag = (1 - v1) * (1 - v1) * ((AI > 0.5) and Lb * 0.12 or math.max(0, D.y0 - Wc * 0.45)) + 0.22 * Lb * AI -- sans vent, le papier pend ; en vol il plonge sous la caisse
	local opCorps = math.min(1, 0.3 + 0.9 * V)
	if corps then
		echineCalc(cF, cR)
		local function prof(u: number): number return 0.7 + 0.3 * ss(u, 0, 0.15) - 0.78 * ss(u, 0.55, 1) end -- nuque, ventre plein, queue effilée
		local pts = table.create(SPN)
		local crete: { number } = table.create(SPN)
		for i = 1, SPN do
			local u = (i - 1) / (SPN - 1)
			local sq = 6.2832 * u * Lb / D.flm - D.phF -- le lampion GONFLE par bouffées, le bout libre se TORD
			pts[i] = echine(u)
			P[i] = pts[i]
			local cu = u * n9
			local fr = cu - math.floor(cu + 0.5)
			local rg = (cu > 0.35 and cu < n9 - 0.35) and math.exp(-fr * fr * 18) or 0
			W[i] = Wc * prof(u) * (1 + 0.18 * rg) * (1 + 0.14 * math.min(1.2, VT) * math.sin(sq * 0.5 + 1.1)) * (1 - 0.34 * u * (0.5 + 0.5 * math.sin(sq * 1.3)))
			local sc = (u * n9 * 3 - t * 0.6) % 1
			crete[i] = Wc * 0.7 * (0.18 + 0.82 * sc) * prof(u)
		end
		poser(R.frange, cam)
		poser(R.corps, cam, 0.8)
		poser(R.ecaille, cam, 0.4)
		poser(R.halo, cam, 2.1)
		-- les couleurs par tronçon : les PLIS de l'accordéon (un pli clair, un pli sombre), les ANNEAUX D'OR entre deux
		-- compartiments, l'éclat du tronçon NEUF
		local tr = 1 - opCorps
		for i = 1, SPN - 1 do
			local u = (i - 0.5) / (SPN - 1)
			local cu = u * n9
			local fr = cu - math.floor(cu + 0.5)
			local rg = (cu > 0.35 and cu < n9 - 0.35) and math.exp(-fr * fr * 18) or 0
			local neuf = (cu > n9 - 1 and cu < n9) and D.neuf * (0.6 + 0.4 * fl(u)) or 0
			local pli = ((i % 2 == 0) and C9.vermillon or C9.pli):Lerp(C9.ecaille, math.min(1, rg + 0.6 * neuf))
			local b = R.corps.b[i]
			b.Color = ColorSequence.new(pli)
			b.Transparency = NumberSequence.new(tr)
			b = R.frange.b[i]
			b.Color = ColorSequence.new(C9.paille)
			b.Transparency = NumberSequence.new(tr)
			b = R.ecaille.b[i]
			b.Color = ColorSequence.new((i % 2 == 0) and C9.ecaille or C9.or_)
			b.Transparency = NumberSequence.new(1 - opCorps * (0.55 + 0.45 * rg))
			b = R.halo.b[i]
			b.Color = ColorSequence.new(C9.A)
			b.Transparency = NumberSequence.new(1 - math.min(1, V * 0.3 * fl(u)) * C9.feuK)
		end
		-- LA CRÊTE : des flammes en dents de scie qui défilent sur le dos
		for i = 1, SPN do
			P[i] = pts[i] + D.U * (Wc * 1.05)
			W[i] = crete[i]
		end
		poser(R.crete, cam)
		peindre(R.crete, C9.C, C9.C, math.min(1, opFeu * 1.1), math.min(1, opFeu * 0.9))
		-- les PATTES : la paire avant au 1er tronçon, la paire arrière au dernier — griffes vers l'extérieur
		local C4 = { 0.5, 0.62, math.max(0.8, n9 - 0.62), math.max(0.9, n9 - 0.5) }
		for j = 1, 4 do
			if j > 2 and n9 < 1.4 then
				montrer(R.pat[j], false)
			else
				local u = math.min(n9, C4[j]) / math.max(0.01, n9)
				local Lp = 0.5 + 0.6 * gB
				local b = echine(u)
				local T = (echine(math.max(0, u - 0.02)) - b)
				T = (T.Magnitude > 1e-4) and T.Unit or hF
				local d = T:Cross(D.U)
				d = (d.Magnitude > 1e-4) and d.Unit or cR
				local dir = (D.U * -0.55 + d * (((j % 2 == 0) and 1 or -1) * 0.8)).Unit
				for i = 1, 3 do
					local w = (i - 1) / 2
					P[i] = b + dir * (Lp * w) + T * (0.45 * Lp * w * w)
					W[i] = Wc * (0.42 - 0.3 * w)
				end
				poser(R.pat[j], cam)
				peindre(R.pat[j], C9.rouge, C9.paille, opCorps, opCorps)
			end
		end
		-- LA QUEUE : trois flammes en éventail au bout, et trois RUBANS de papier qui s'allongent avec les paliers et le vent
		local bout = pts[SPN]
		local T = bout - echine(0.97)
		T = (T.Magnitude > 1e-4) and T.Unit or -hF
		local s2 = T:Cross(D.U)
		s2 = (s2.Magnitude > 1e-4) and s2.Unit or cR
		for j = 0, 2 do
			local o, Lq = j - 1, 0.8 + 1.6 * gB
			local dir = (T + s2 * (o * 0.55)).Unit
			for i = 1, 3 do
				local w = (i - 1) / 2
				P[i] = bout + dir * (Lq * w) + D.U * (0.3 * w * math.sin(6 * w - 10 * t + j))
				W[i] = Wc * (0.34 - 0.32 * w) * (0.8 + 0.3 * math.sin(9 * t + j * 2))
			end
			poser(R.que[j + 1], cam)
			peindre(R.que[j + 1], C9.Q, C9.C, opFeu, 0)
			local r = R.rub[j + 1]
			local Lr = (1.6 + 3.2 * gB) * (0.6 + 0.5 * v1)
			for i = 1, r.n do
				local w = (i - 1) / (r.n - 1)
				local d = w * Lr
				local bt = w * (0.3 + 0.7 * w)
				local fq = 6.2832 * d / 1.4 - D.phF * 1.2 + j * 2.1
				local cl = (0.12 + 0.5 * VT) * D.raf * bt
				P[i] = bout + T * (d * (0.75 + 0.25 * v1)) + s2 * (o * 0.18 * d + cl * math.sin(fq))
					+ D.U * (cl * 0.7 * math.cos(fq * 0.9 + j) - (1 - v1) * (1 - v1) * 0.5 * Lr * w * w)
				W[i] = Wc * (0.3 - 0.14 * w) * (0.55 + 0.45 * math.abs(math.cos(fq * 0.5 + j)))
			end
			poser(r, cam)
			peindre(r, C9.vermillon, C9.paille, opCorps, opCorps)
		end
	else
		for _, r in { R.frange, R.corps, R.ecaille, R.halo, R.crete } do montrer(r, false) end
		for j = 1, 4 do montrer(R.pat[j], false) end
		for j = 1, 3 do
			montrer(R.que[j], false)
			montrer(R.rub[j], false)
		end
	end

	-- ===== LA COMÈTE (nitroooTick du web) : la coque de plasma posée devant le nez, son cœur blanc, cinq langues qui partent du
	-- bouclier avant et filent le long de la carrosserie — elle grossit avec la tenue, comme la tête =====
	do
		local k = vis
		local HS = 0.85 + 0.75 * gT
		local flk = 0.84 + 0.16 * math.sin(t * 37) * math.sin(t * 13.3)
		local nez = c + cF * (sp.l * 0.62) + cU * (sp.h * 0.5)
		local Lq = sp.l * (0.75 + 0.62 * k) * flk * HS
		P[1], P[2], P[3] = nez, nez - cF * (Lq * 0.45), nez - cF * Lq
		W[1], W[2], W[3] = sp.w * 0.5 * (1 + 0.06 * k) * HS, sp.w * 0.62 * (1 + 0.06 * k) * HS, 0.05
		poser(R.coque, cam)
		peindre(R.coque, C9.coque, C9.coque, math.min(1, 0.5 * k) * C9.feuK, 0)
		nez = c + cF * (sp.l * 0.66) + cU * (sp.h * 0.45)
		P[1], P[2] = nez, nez - cF * (sp.l * (0.3 + 0.34 * k) * flk * HS)
		W[1], W[2] = sp.w * 0.3 * HS, 0.04
		poser(R.coeur, cam)
		peindre(R.coeur, Color3.new(1, 1, 1), C9.coeur, math.min(1, 0.7 * k) * C9.feuK, 0)
		for i, d in Dragon.LANGUES do
			local fi = 0.8 + 0.2 * math.sin(t * (21 + i * 3.7) + d[8]) * math.sin(t * (9.3 + i) + d[8] * 2)
			local racine = c + cR * (d[1] * sp.w) + cU * (d[2] * sp.h) + cF * (d[3] * sp.l)
			local dir = (-cF - cR * d[4] + cU * d[5]).Unit
			P[1], P[2] = racine, racine + dir * (sp.l * d[7] * (0.45 + 0.75 * k) * fi * HS)
			W[1], W[2] = sp.w * d[6] * (0.8 + 0.3 * k) * HS, 0.03
			poser(R.langue[i], cam)
			peindre(R.langue[i], C9.H, C9.coque, math.min(1, 0.75 * k * (1 + 2 * CHs * 0.3)) * C9.feuK, 0)
		end
		-- LES BORDS DE L'ÉCRAN battent à sa couleur tant que ça brûle
		D.pouls -= dt
		if k > 0.4 and D.pouls <= 0 then
			D.pouls = 0.62
			Effets.flashBords(C9.bord, 0.18 + 0.22 * k, 0.6)
		end
	end
	-- LE RUGISSEMENT : il crache une gerbe de braises devant lui
	if rugit then
		local nez = MT(0, 0.04, 1.13) * M
		Effets.etincelles("or", nez, 16, 12)
	end
end

-- [x (× largeur), y (× hauteur), z (× longueur, +avant), lacet, tangage, rayon (× largeur), longueur (× longueur), déphasage]
Dragon.LANGUES = { { -0.44, 0.42, 0.5, 0.2, 0.1, 0.24, 1.25, 0 }, { 0.44, 0.42, 0.5, -0.2, 0.1, 0.24, 1.25, 1.7 }, { 0, 0.72, 0.46, 0, 0.2, 0.3, 1.05, 3.1 },
	{ -0.3, 1.02, 0.1, 0.1, 0.16, 0.2, 0.95, 4.4 }, { 0.3, 1.02, 0.1, -0.1, 0.16, 0.2, 0.95, 5.6 } }

function Dragon.init()
	RunService.RenderStepped:Connect(function(dt: number)
		local ok, err = pcall(tick, math.min(dt, 0.05))
		if not ok then
			if not D.erreur then warn("[CashCar] dragon : " .. tostring(err)) end
			D.erreur = true
			pcall(cacher)
		end
	end)
	Bus.on("mort", function() D.vOk = false end)
end

return Dragon
