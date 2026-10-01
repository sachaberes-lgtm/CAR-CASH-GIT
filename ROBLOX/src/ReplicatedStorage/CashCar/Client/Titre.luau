-- CASH CAR — L'ÉCRAN TITRE v3 : « la chute dans un ciel qui a de la profondeur » (chuteRender / chutePlan / CHUTE_NU,
-- VERSION PRINCIPALE/index.html L35085-35330 — Sacha : « il faut que ça s'inspire de l'écran titre de Zelda Tears of the Kingdom »).
--   · LE REGARD se règle sur le SOLEIL (à droite, dans le dos de la caméra : les nuages sont éclairés de face) ;
--   · LA CAISSE tombe très haut (900 m au-dessus du sommet de la piste), de trois-quarts dessus, nez piqué, le toit vers la caméra ;
--     elle ne descend pas : c'est l'AIR qui monte ;
--   · 18 VRAIS CUMULUS (les gabarits v8) posés à la main à trois profondeurs, qui montent à la vitesse de la chute et renaissent
--     sous le cadre ;
--   · la caisse se pose dans la place que l'interface laisse libre (à gauche, couché), l'horizon reste DROIT ;
--   · JOUER : elle PIQUE — le nez plonge, elle accélère, la caméra passe derrière elle, le champ s'ouvre, un voile blanc… et la
--     course démarre.
local Lighting = game:GetService("Lighting")
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Nuages = require(script.Parent:WaitForChild("Nuages"))
local M = Config.M

local Titre = {}
Titre.pret = false

-- CHUTE_P (les réglages retenus aux captures)
local P = { az = 2.35, alt = 900, avant = -1700, pitch = 0.62, roule = 0.12, cap = 0.28, elev = 0.34, gite = -0.45, vit = 14, taille = 0.82 }
-- CHUTE_NU : { droite, devant, rayon, gabarit, vitesse, hauteur de départ } en mètres
local NU = {
	-- devant
	{ 60, 1700, 260, 0, 1, -900 }, { -160, 700, 110, 1, 1, -420 }, { 50, 330, 34, 2, 1, -230 }, { 150, 1000, 150, 3, 1, -640 }, { -60, 2600, 340, 4, 1, -1250 }, { -30, 480, 55, 3, 1, -120 },
	-- à droite (derrière le titre et les boutons)
	{ 900, 1500, 260, 0, 1, -760 }, { 520, 760, 110, 1, 1, -500 }, { 1500, 1700, 280, 4, 1, -800 }, { 300, 460, 50, 2, 1, -330 }, { 1050, 700, 100, 3, 1, -420 }, { 800, 2600, 360, 4, 1, -1150 },
	-- à gauche et tout autour
	{ -600, 1300, 160, 0, 1, -700 }, { -1000, 400, 140, 1, 1, -380 }, { -700, -600, 150, 3, 1, -450 }, { 300, -1000, 180, 0, 1, -520 }, { 1200, -400, 160, 1, 1, -330 }, { -200, -1500, 220, 4, 1, -640 },
}
-- les cinq formes du titre (mediocris, humilis, humilis, mediocris, congestus) → les gabarits du ciel de coton qui leur ressemblent
local GABARIT = { [0] = 0, [1] = 1, [2] = 3, [3] = 5, [4] = 2 }

type Cumulus = { p: MeshPart, dec: Vector3, a: number, b: number, y: number, v: number, lo: number, hi: number }
local S = {
	C = Vector3.zero, lh = Vector3.zAxis, t = 0, go = nil :: { t: number, suite: () -> (), fini: boolean }?,
	nu = {} :: { Cumulus }, dossier = nil :: Folder?, fh = Vector3.xAxis, f = Vector3.xAxis, pos = Vector3.zero, u = 0,
}

-- LE PLAN (chutePlan) : où tombe la caisse, vers où l'on regarde ; puis les cumulus (bâtis une fois, en tâche de fond)
function Titre.plan(piste: any)
	local soleil = Lighting:GetSunDirection()
	local sx, sz = soleil.X, soleil.Z
	local sn = math.sqrt(sx * sx + sz * sz)
	if sn < 1e-3 then sx, sz, sn = 1, 0, 1 end
	local ca, sa = math.cos(P.az), math.sin(P.az)
	local lx, lz = (sx * ca - sz * sa) / sn, (sx * sa + sz * ca) / sn
	if -lz * sx + lx * sz < 0 then lx, lz = (sx * ca + sz * sa) / sn, (-sx * sa + sz * ca) / sn end -- le soleil à DROITE de l'image
	S.lh = Vector3.new(lx, 0, lz).Unit
	-- la destination : le début de la piste (son centre), et le sommet de toute la piste
	local gx, gz, n, yM = 0, 0, 0, -math.huge
	local pas = math.max(1, math.floor(40 * M / piste.DS))
	for i = 1, piste.n, pas do
		local q = piste.F[i].Position / M
		if q.Y > yM then yM = q.Y end
		if (i - 1) * piste.DS / M <= 3200 then
			gx += q.X
			gz += q.Z
			n += 1
		end
	end
	local G = Vector3.new(gx / math.max(1, n), yM, gz / math.max(1, n))
	S.C = Vector3.new(G.X - S.lh.X * P.avant, G.Y + P.alt, G.Z - S.lh.Z * P.avant)
	Titre.pret = true
	-- les cumulus
	if S.dossier then return end
	local dossier = Instance.new("Folder")
	dossier.Name = "Titre"
	S.dossier = dossier
	for _, d in NU do
		local p, dec = Nuages.seul(GABARIT[d[4]] or 0, d[3])
		if p then
			local dd = math.sqrt(d[1] * d[1] + d[2] * d[2])
			p.Parent = dossier
			table.insert(S.nu, { p = p, dec = dec, a = d[1], b = d[2], y = d[6], v = d[5], lo = -(1.2 * dd + 1.3 * d[3]), hi = 0.1 * dd + 1.3 * d[3] })
		end
	end
end
function Titre.montrer(oui: boolean)
	if S.dossier then S.dossier.Parent = oui and workspace or nil end
	if oui then
		S.go = nil
		S.u = 0
	end
end
-- JOUER : le piqué (1,75 s), puis `suite`
function Titre.lancer(suite: () -> ())
	if S.go then return end
	S.go = { t = 0, suite = suite, fini = false }
end
function Titre.enPique(): boolean return S.go ~= nil end

-- À chaque image du menu : la caisse (sa pose) ; les cumulus qui montent. Rend le CFrame de la caisse.
local pieces: { BasePart }, poses: { CFrame } = {}, {}
function Titre.caisse(dt: number, voile: ((number) -> ())?): CFrame
	S.t += dt
	local t = S.t
	local lh = S.lh
	local droite = Vector3.new(-lh.Z, 0, lh.X) -- la droite de l'écran
	-- le cap : de trois-quarts, vers la droite de l'écran et un peu vers le fond ; le nez plonge
	local fh = (droite * math.cos(P.cap) + lh * math.sin(P.cap)).Unit
	local pi = P.pitch + 0.06 * math.sin(t * 0.9) + 0.03 * math.sin(t * 2.3)
	local ro = P.gite + P.roule * math.sin(t * 0.53) + 0.07 * math.sin(t * 1.7) -- elle montre son TOIT à la caméra
	local u, dy, fwd = 0, 0, 0
	local G = S.go
	if G then
		G.t += dt
		u = math.min(1, G.t / 1.75)
		local e = u * u * (3 - 2 * u)
		pi += (1.3 - pi) * math.min(1, u / 0.3) -- le nez PLONGE
		ro *= 1 - e
		dy = -(u ^ 2.3) * 150 -- elle accélère vers la route
		fwd = u * u * 25
		if voile then voile(math.clamp((u - 0.72) / 0.28, 0, 1)) end
		if u >= 1 and not G.fini then
			G.fini = true
			task.defer(G.suite)
		end
	end
	S.u = u
	local f = Vector3.new(fh.X * math.cos(pi), -math.sin(pi), fh.Z * math.cos(pi)).Unit
	local up = (Vector3.yAxis - f * f.Y).Unit
	local sd = up:Cross(f).Unit
	up = (up * math.cos(ro) + sd * math.sin(ro)).Unit
	sd = up:Cross(f).Unit
	local C = S.C + fh * fwd + Vector3.new(math.sin(t * 1.3) * 0.1, dy + math.sin(t * 2.1) * 0.12, 0)
	S.fh, S.f, S.pos = fh, f, C
	-- les CUMULUS : ils montent, la caisse tombe (ancrés au point de chute, pas à la caisse qui pique)
	local vk = 1 + (G and u * u * 7 or 0)
	if #S.nu > 0 and S.dossier and S.dossier.Parent then
		table.clear(pieces)
		table.clear(poses)
		for _, c in S.nu do
			c.y += P.vit * c.v * vk * dt
			if c.y > c.hi then c.y = c.lo end
			table.insert(pieces, c.p)
			table.insert(poses, CFrame.new((S.C + droite * c.a + lh * c.b + Vector3.new(0, c.y, 0)) * M + c.dec))
		end
		workspace:BulkMoveTo(pieces, poses, Enum.BulkMoveMode.FireCFrameChanged)
	end
	-- (le repère cuit des caisses : le nez vers −Z, la droite du pilote +X)
	return CFrame.fromMatrix((C - up * 0.45) * M, -sd, up, -f)
end

-- La CAMÉRA du titre : rend son CFrame et son champ. fiche = la caisse montrée (l, w, h en mètres).
function Titre.vue(fiche: any): (CFrame, number)
	local cam = workspace.CurrentCamera
	local v = cam.ViewportSize
	local aspect = v.X / math.max(1, v.Y)
	local t, u = S.t, S.u
	local G = S.go
	local fov = G and (44 + 26 * u * u) or 44
	-- la place libre (menuCadre) : couché, la bande de GAUCHE (les boutons sont à droite) ; debout, entre le titre et les boutons
	local nx, ny, fr, fhh = -0.52, -0.12, 0.34, 0.5 -- (vu dans Studio a 0,42 : la caisse debordait du bord gauche)
	if aspect < 1 then nx, ny, fr, fhh = -0.16, 0.1, 0.62, 0.4 end
	local R9 = 0.5 * math.sqrt(fiche.l * fiche.l + fiche.w * fiche.w + (fiche.h + 0.6) * (fiche.h + 0.6))
	local tV = math.tan(math.rad(fov) / 2)
	local tH = tV * aspect
	local d = math.max(R9 * P.taille * ((aspect > 1) and 1.75 or 1) / (fr * tH), R9 * 0.8 / (fhh * tV)) * (1 + 0.03 * math.sin(t * 0.37))
	-- la vue BALANCE lentement autour de la caisse
	local sw = math.sin(t * 0.11) * 0.07 + math.sin(t * 0.047 + 1.1) * 0.04
	local cA, sA = math.cos(sw), math.sin(sw)
	local lx, lz = S.lh.X * cA - S.lh.Z * sA, S.lh.X * sA + S.lh.Z * cA
	local ce, se = math.cos(P.elev), math.sin(P.elev)
	local C = S.pos
	local pos = Vector3.new(C.X - lx * ce * d, C.Y + se * d, C.Z - lz * ce * d)
	local k = 1
	if G then
		-- la caméra passe DERRIÈRE elle (poursuite plongeante)
		local q = math.min(1, u / 0.5)
		local e9 = q * q * (3 - 2 * q)
		pos = pos:Lerp(C - S.f * 9 + Vector3.new(0, 3.2, 0), e9)
		k = 1 - q
	end
	local cf = CFrame.lookAt(pos * M, C * M, Vector3.yAxis)
	-- L'HORIZON DROIT : la caisse glisse dans la zone libre en tournant autour de la VERTICALE DU MONDE, puis en levant le nez
	local lacet = math.atan(nx * tH) / math.max(0.5, ce) * k
	cf = CFrame.new(cf.Position) * CFrame.Angles(0, lacet, 0) * cf.Rotation * CFrame.Angles(-math.atan(ny * tV) * k, 0, 0)
	if G and u > 0.2 then -- l'air qui cogne
		local a = (u - 0.2) * 0.9 * 0.08 * M
		cf += Vector3.new((math.random() - 0.5) * a, (math.random() - 0.5) * a, 0)
	end
	return cf, fov
end

return Titre
