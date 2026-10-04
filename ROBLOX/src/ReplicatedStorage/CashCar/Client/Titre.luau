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
local Iles = require(script.Parent:WaitForChild("Iles"))
local M = Config.M
local K = Config.CIEL.titreK or 1 -- (la maquette : voir Config.CIEL.titreK)

local Titre = {}
Titre.pret = false
Titre.nuPret = false -- (les cumulus sont bâtis : l'accueil peut s'ouvrir)

-- CHUTE_P (les réglages retenus aux captures)
-- (3/10, Léo, deux captures : « voici le point de vue vertical souhaité ») le regard presque à NIVEAU — couché (elev) un rien SOUS la
-- caisse : l'horizon à ~46 % de la hauteur, on voit son dessous ; debout (elevP) à peine au-dessus. (Avant : 0,34, on regardait le toit.)
local P = { az = 2.35, alt = 900, avant = -1700, pitch = 0.62, roule = 0.12, cap = 0.28, elev = -0.08, elevP = 0.06, gite = -0.45, vit = 14, taille = 0.82 }
-- CHUTE_NU : { droite, devant, rayon, gabarit, vitesse, hauteur de départ } en mètres
local NU = {
	-- devant
	{ 60, 1700, 260, 0, 1, -900 }, { -160, 700, 110, 1, 1, -420 }, { 50, 330, 34, 2, 1, -230 }, { 150, 1000, 150, 3, 1, -640 }, { -60, 2600, 340, 4, 1, -1250 }, { -30, 480, 55, 3, 1, -120 },
	-- à droite (derrière le titre et les boutons)
	{ 900, 1500, 260, 0, 1, -760 }, { 520, 760, 110, 1, 1, -500 }, { 1500, 1700, 280, 4, 1, -800 }, { 300, 460, 50, 2, 1, -330 }, { 1050, 700, 100, 3, 1, -420 }, { 800, 2600, 360, 4, 1, -1150 },
	-- à gauche et tout autour
	{ -600, 1300, 160, 0, 1, -700 }, { -1000, 400, 140, 1, 1, -380 }, { -700, -600, 150, 3, 1, -450 }, { 300, -1000, 180, 0, 1, -520 }, { 1200, -400, 160, 1, 1, -330 }, { -200, -1500, 220, 4, 1, -640 },
}
-- LES ÎLES DU CIEL (4/10, Sacha : « améliore la map… les graphismes au max ») : quatre îles flottantes qui montent avec les
-- cumulus — on tombe le long d'elles, comme à l'ouverture de Zelda TOTK. { droite, devant, hauteur de départ, rayon, graine }
local ILES = { { 470, 1050, -330, 115, 11 }, { 950, 1700, -520, 165, 23 }, { -700, 2300, -760, 230, 37 }, { 520, 700, -170, 58, 41 } }
-- les cinq formes du titre (mediocris, humilis, humilis, mediocris, congestus) → les gabarits du ciel de coton qui leur ressemblent
local GABARIT = { [0] = 0, [1] = 1, [2] = 3, [3] = 5, [4] = 2 }

type Cumulus = { p: MeshPart, dec: Vector3, a: number, b: number, y: number, v: number, lo: number, hi: number }
local S = {
	C = Vector3.zero, lh = Vector3.zAxis, t = 0, go = nil :: { t: number, suite: () -> (), fini: boolean }?,
	nu = {} :: { Cumulus }, iles = {} :: { any }, dossier = nil :: Folder?, fh = Vector3.xAxis, f = Vector3.xAxis, pos = Vector3.zero, u = 0, vu = false,
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
		local p, dec = Nuages.seul(GABARIT[d[4]] or 0, d[3] * K)
		if p then
			local dd = math.sqrt(d[1] * d[1] + d[2] * d[2])
			p.Parent = dossier
			table.insert(S.nu, { p = p, dec = dec, a = d[1], b = d[2], y = d[6], v = d[5], lo = -(1.2 * dd + 1.3 * d[3]), hi = 0.1 * dd + 1.3 * d[3] })
		end
	end
	for _, d in ILES do
		local ok, m = pcall(Iles.maquette, dossier, d[4] * K, d[5])
		if ok and m and #m.parts > 0 then
			local dd = math.sqrt(d[1] * d[1] + d[2] * d[2])
			table.insert(S.iles, { m = m, a = d[1], b = d[2], y = d[3], v = 1, lo = -(1.2 * dd + 2.6 * d[4]), hi = 0.1 * dd + 1.6 * d[4] })
		end
	end
	Titre.nuPret = true
end
-- L'ORBITE AU DOIGT (L35538 du jeu web ; Sacha, 30/09 : « rajoute un moyen de déplacer la caméra autour de la voiture avec le doigt »)
-- — glisser tourne le regard autour de la caisse (le tour complet), de haut en bas il monte ou plonge ; la vue rejoint le doigt en
-- douceur (~0,1 s) et, lâchée en mouvement, elle garde son ÉLAN (frottement × e^−3t). Pas de retour automatique : c'est JOUER qui
-- ramène la caméra derrière la caisse pour le piqué. La caisse, elle, ne bouge pas. (Un appui sur un bouton du menu n'y touche pas.)
local O = { a = 0, ac = 0, w = 0, p = 0, pc = 0, mvT = 0, x = 0, y = 0, dt0 = os.clock(), io = nil :: InputObject? }
do
	local UIS = game:GetService("UserInputService")
	UIS.InputBegan:Connect(function(io: InputObject, traite: boolean)
		if traite or not S.vu or S.go or O.io then return end
		if io.UserInputType == Enum.UserInputType.Touch or io.UserInputType == Enum.UserInputType.MouseButton1 then
			O.io, O.x, O.y, O.mvT = io, io.Position.X, io.Position.Y, os.clock()
			O.x0, O.y0, O.t0 = io.Position.X, io.Position.Y, os.clock()
		end
	end)
	UIS.InputChanged:Connect(function(io: InputObject)
		local d = O.io
		if not d or S.go then return end
		if io ~= d and not (d.UserInputType == Enum.UserInputType.MouseButton1 and io.UserInputType == Enum.UserInputType.MouseMovement) then return end
		local k = 844 / math.max(1, workspace.CurrentCamera.ViewportSize.X) -- (le geste du web se mesure sur un écran couché de 844 px)
		local n9 = os.clock()
		local dm = math.max(0.008, n9 - O.mvT)
		local dA = -(io.Position.X - O.x) * k * 0.008
		O.ac += dA
		O.w = O.w * 0.55 + dA / dm * 0.45
		O.mvT = n9
		-- (L36913, Léo 3/10 : « bloque le point de vue à ce niveau vertical : pas de haut en bas ») le doigt ne fait plus monter ni
		-- plonger le regard : il tourne autour de la caisse, à la hauteur du menu
		O.x, O.y = io.Position.X, io.Position.Y
	end)
	UIS.InputEnded:Connect(function(io: InputObject)
		if O.io and (io == O.io or io.UserInputType == O.io.UserInputType) then
			O.io = nil
			-- ni glissé ni tenu : un TAP — s'il touche la caisse, elle reçoit un petit coup
			local p9 = io.Position
			if math.abs(p9.X - (O.x0 or 0)) < 14 and math.abs(p9.Y - (O.y0 or 0)) < 14 and os.clock() - (O.t0 or 0) < 0.4 then
				Titre.tape(Vector2.new(p9.X, p9.Y))
			end
		end
	end)
end
-- LE TAPOTEMENT AU CIEL (chuteTape, L35713 du jeu web ; Léo, 3/10 : « on peut tapoter la voiture et simuler, à l'endroit tapoté, un
-- coup qui fait légèrement pousser / pivoter la voiture en train de tomber dans les airs »). Le doigt lance un rayon de la caméra ;
-- s'il touche la caisse, le coup part de CE point, dans le sens du rayon : une poussée (le centre recule de quelques décimètres) et
-- un couple r × F (taper le nez la fait tourner autrement que taper l'aile) — puis deux ressorts amortis la ramènent, en deux ou
-- trois balancements. Un éclat à l'endroit du coup, le « toc » de tôle de l'atelier, une vibration. (On vise la BOÎTE de la caisse :
-- ses pièces ne répondent pas aux rayons.)
local TAP: any = { p = Vector3.zero, v = Vector3.zero, r = Vector3.zero, w = Vector3.zero, V = 1.8, W = 0.5, WMAX = 1.3, K = 13, C = 2.6, KR = 15,
	CR = 2.3, flT = 9, n = 0 }
Titre.surTape = nil :: ((Vector3) -> ())? -- (le son et la vibration : posés par le pilote)
function Titre.tape(ecran: Vector2): boolean
	if not S.vu or S.go then return false end
	local m = workspace:FindFirstChild("MaCaisse")
	if not m or not m:IsA("Model") then return false end
	local cam = workspace.CurrentCamera
	local ray = cam:ScreenPointToRay(ecran.X, ecran.Y)
	-- le rayon contre la boîte orientée de la caisse (dans son repère : une boîte alignée)
	local bcf, bt = m:GetBoundingBox()
	local o, d = bcf:PointToObjectSpace(ray.Origin), bcf:VectorToObjectSpace(ray.Direction.Unit)
	local h = bt / 2
	local t0, t1 = -math.huge, math.huge
	for _, ax in { "X", "Y", "Z" } do
		local oa, da, ha = (o :: any)[ax], (d :: any)[ax], (h :: any)[ax]
		if math.abs(da) < 1e-9 then
			if math.abs(oa) > ha then return false end
		else
			local a, b = (-ha - oa) / da, (ha - oa) / da
			if a > b then a, b = b, a end
			t0, t1 = math.max(t0, a), math.min(t1, b)
		end
	end
	if t0 > t1 or t1 < 0 then return false end
	local hit = ray.Origin + ray.Direction.Unit * math.max(0, t0)
	local dir = ray.Direction.Unit
	TAP.v += dir * TAP.V -- la poussée, dans le sens du doigt
	if TAP.v.Magnitude > TAP.V * 2 then TAP.v = TAP.v.Unit * TAP.V * 2 end
	TAP.w += (hit / M - S.pos):Cross(dir) * TAP.W -- le pivot : r × F
	if TAP.w.Magnitude > TAP.WMAX then TAP.w = TAP.w.Unit * TAP.WMAX end
	-- l'éclat, à l'endroit du coup
	if not TAP.fl then
		local f = Instance.new("Part")
		f.Name = "Eclat"
		f.Shape = Enum.PartType.Ball
		f.Material = Enum.Material.Neon
		f.Color = Color3.fromRGB(255, 240, 200)
		f.Anchored, f.CanCollide, f.CanQuery, f.CanTouch, f.CastShadow = true, false, false, false, false
		TAP.fl = f
	end
	TAP.fl.Position = hit - dir * (0.15 * M)
	TAP.fl.Parent = workspace
	TAP.flT, TAP.n = 0, TAP.n + 1
	if Titre.surTape then Titre.surTape(hit) end
	return true
end
-- (banc) le coup au milieu de l'écran, et son état
function Titre.dbgTape(): any
	local m = workspace:FindFirstChild("MaCaisse")
	if m and m:IsA("Model") then
		local v, _ = workspace.CurrentCamera:WorldToScreenPoint(m:GetPivot().Position)
		Titre.tape(Vector2.new(v.X, v.Y))
	end
	return { coups = TAP.n, pousse = TAP.p.Magnitude, pivot = math.deg(TAP.r.Magnitude) }
end
function Titre.montrer(oui: boolean)
	S.vu = oui
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
			table.insert(poses, CFrame.new((S.C + (droite * c.a + lh * c.b + Vector3.new(0, c.y, 0)) * K) * M + c.dec))
		end
		workspace:BulkMoveTo(pieces, poses, Enum.BulkMoveMode.FireCFrameChanged)
		for _, p in pieces do Nuages.suivreFin(p) end
		-- les ÎLES montent avec eux (chaque pièce garde sa pose dans l'île)
		if #S.iles > 0 then
			table.clear(pieces)
			table.clear(poses)
			for _, c in S.iles do
				c.y += P.vit * c.v * vk * dt
				if c.y > c.hi then c.y = c.lo end
				local o = CFrame.new((S.C + (droite * c.a + lh * c.b + Vector3.new(0, c.y, 0)) * K) * M)
				for i, p in c.m.parts do
					table.insert(pieces, p)
					table.insert(poses, o * c.m.offs[i])
				end
			end
			workspace:BulkMoveTo(pieces, poses, Enum.BulkMoveMode.FireCFrameChanged)
		end
	end
	-- (le repère cuit des caisses : le nez vers −Z, la droite du pilote +X)
	local cfC = CFrame.fromMatrix((C - up * 0.45) * M, -sd, up, -f)
	-- le TAPOTEMENT : deux ressorts amortis (poussée, pivot), la caisse tourne autour de son centre
	do
		local k = math.min(dt, 0.05)
		TAP.v = (TAP.v - TAP.p * (TAP.K * k)) * math.exp(-TAP.C * k)
		TAP.p += TAP.v * k
		TAP.w = (TAP.w - TAP.r * (TAP.KR * k)) * math.exp(-TAP.CR * k)
		TAP.r += TAP.w * k
		if TAP.fl and TAP.fl.Parent then
			TAP.flT += dt
			local u = TAP.flT / 0.32
			if u >= 1 then
				TAP.fl.Parent = nil
			else
				TAP.fl.Transparency = u
				local s9 = (0.35 + u * 1.1) * M
				TAP.fl.Size = Vector3.new(s9, s9, s9)
			end
		end
		local a = TAP.r.Magnitude
		if a > 1e-5 or TAP.p.Magnitude > 1e-5 then
			local Cs = C * M
			local q = (a > 1e-5) and CFrame.fromAxisAngle(TAP.r / a, a) or CFrame.identity
			cfC = CFrame.new(Cs + TAP.p * M) * q * CFrame.new(-Cs) * cfC
		end
	end
	return cfC
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
	-- (vu dans Studio à 0,42 : la caisse débordait du bord gauche) · web c02c75a : la caisse au MILIEU de la hauteur utile (elle laissait le haut vide)
	-- (3e retour, mesuré : sur le web couché la caisse prend 27 % de la largeur de l'image — ici 20 %)
	local nx, ny, fr, fhh = -0.52, 0.04, 0.39, 0.5
	if aspect < 1 then nx, ny, fr, fhh = -0.16, 0.1, 0.62, 0.4 end
	local R9 = 0.5 * math.sqrt(fiche.l * fiche.l + fiche.w * fiche.w + (fiche.h + 0.6) * (fiche.h + 0.6))
	local tV = math.tan(math.rad(fov) / 2)
	local tH = tV * aspect
	local d = math.max(R9 * P.taille * ((aspect > 1) and 1.75 or 1) / (fr * tH), R9 * 0.8 / (fhh * tV)) * (1 + 0.03 * math.sin(t * 0.37))
	-- la vue BALANCE lentement autour de la caisse
	local sw = math.sin(t * 0.11) * 0.07 + math.sin(t * 0.047 + 1.1) * 0.04
	local cA, sA = math.cos(sw), math.sin(sw)
	local lx, lz = S.lh.X * cA - S.lh.Z * sA, S.lh.X * sA + S.lh.Z * cA
	-- l'orbite au doigt : l'élan qui s'use, la vue qui rejoint la cible du doigt
	do
		local n9 = os.clock()
		local dt = math.min(0.1, n9 - O.dt0)
		O.dt0 = n9
		if not G then
			if not O.io and O.w ~= 0 then
				O.ac += O.w * dt
				O.w *= math.exp(-dt * 3)
				if math.abs(O.w) < 0.015 then O.w = 0 end
			end
			local kS = 1 - math.exp(-dt * 10)
			O.a += (O.ac - O.a) * kS
			O.p += (O.pc - O.p) * kS
		end
		local oc, os9 = math.cos(O.a), math.sin(O.a)
		lx, lz = lx * oc - lz * os9, lx * os9 + lz * oc
	end
	local el9 = math.clamp(((aspect < 1) and P.elevP or P.elev) + O.p, -0.45, 1.25)
	local ce, se = math.cos(el9), math.sin(el9)
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
