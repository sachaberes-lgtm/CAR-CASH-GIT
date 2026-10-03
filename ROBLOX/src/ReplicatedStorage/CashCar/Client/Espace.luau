-- CASH CAR — L'ORBITE (le niveau « EN ORBITE » du jeu web : orbiteBuild L13933, lvlPlanete L13389, la lune L13560).
--   · LA TERRE : une demi-sphère bleue qui barre le bas du ciel. Elle se cale sur le CAP de la caméra — un peu sur la gauche, 35°
--     sous l'horizon — avec un gros retard : on la voit glisser, elle ne colle jamais à l'écran.
--   · LA LUNE QUI REGARDE (Sacha : la lune qui « suit » le joueur est VOULUE) : un visage de troll choqué, en haut à droite, dont
--     les yeux suivent la caisse et clignent.
--   · LES SATELLITES : des Starlink (un corps plat, une aile solaire) et des débris semés autour de la piste, jamais sur la route ;
--     quelques TRAINS alignés très haut — le collier de perles.
-- ROBLOX : une sphère de plus de 2 048 studs n'existe pas — la Terre et la lune sont des DISQUES peints (une sphère vue de loin
-- est un disque), posés très loin, toujours face à la caméra, à leur vraie taille. Le ciel noir et les étoiles : Client/Ambiance.
local AssetService = game:GetService("AssetService")
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local M = Config.M
local RH = Config.ROAD_HALF

local Espace = {}

-- ── un bruit de valeur, pour peindre (continents, nuages, cratères) ──
local function h2(x: number, y: number, g: number): number
	local n = math.sin(x * 127.1 + y * 311.7 + g * 74.7) * 43758.5453
	return n - math.floor(n)
end
local function bruit(x: number, y: number, g: number): number
	local xi, yi = math.floor(x), math.floor(y)
	local xf, yf = x - xi, y - yi
	local u, v = xf * xf * (3 - 2 * xf), yf * yf * (3 - 2 * yf)
	local a, b, c, d = h2(xi, yi, g), h2(xi + 1, yi, g), h2(xi, yi + 1, g), h2(xi + 1, yi + 1, g)
	return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
end
local function fbm(x: number, y: number, g: number): number
	return bruit(x, y, g) * 0.5 + bruit(x * 2.1, y * 2.1, g + 3) * 0.3 + bruit(x * 4.3, y * 4.3, g + 7) * 0.2
end

local function imageDe(N: number, pixel: (number, number, number) -> (number, number, number, number)): any?
	local ok, im = pcall(function() return AssetService:CreateEditableImage({ Size = Vector2.new(N, N) }) end)
	if not ok or not im then return nil end
	local b = buffer.create(N * N * 4)
	for y = 0, N - 1 do
		for x = 0, N - 1 do
			local u, v = (x + 0.5) / N * 2 - 1, 1 - (y + 0.5) / N * 2
			local r, g, bl, a = pixel(u, v, math.sqrt(u * u + v * v))
			local o = (y * N + x) * 4
			buffer.writeu8(b, o, math.clamp(math.floor(r * 255), 0, 255))
			buffer.writeu8(b, o + 1, math.clamp(math.floor(g * 255), 0, 255))
			buffer.writeu8(b, o + 2, math.clamp(math.floor(bl * 255), 0, 255))
			buffer.writeu8(b, o + 3, math.clamp(math.floor(a * 255), 0, 255))
		end
		if y % 24 == 0 then task.wait() end
	end
	local ok2 = pcall(function() im:WritePixelsBuffer(Vector2.zero, Vector2.new(N, N), b) end)
	return ok2 and im or nil
end

-- LA TERRE : océan azur (plus profond aux pôles), continents verts et ocres, calottes, volutes de nuages ; le soleil vient d'en
-- haut à gauche ; au bord, l'atmosphère bleuit ; autour, un halo.
local RD = 0.86 -- le disque dans l'image (le reste : le halo)
local function pixelTerre(u: number, v: number, r: number): (number, number, number, number)
	local q = r / RD
	if q > 1 then
		local k = math.max(0, 1 - (q - 1) / (1 / RD - 1))
		return 0.30, 0.62, 1, k * k * 0.55
	end
	local x, y = u / RD, v / RD
	local z = math.sqrt(math.max(0, 1 - x * x - y * y))
	local lon, lat = math.atan2(x, z) + 0.6, math.asin(math.clamp(y, -1, 1))
	local al = math.abs(lat) / 1.5708
	-- l'océan
	local cr, cg, cb = 0.106 - 0.07 * al, 0.54 - 0.29 * al, 0.90 - 0.41 * al
	-- les continents
	local t = fbm(lon * 1.6 + 5, lat * 2.2 + 3, 1)
	if t > 0.56 then
		local sec = bruit(lon * 3 + 9, lat * 3, 5)
		local k = math.min(1, (t - 0.56) * 9)
		local lr, lg, lb = 0.20 + 0.45 * sec, 0.46 + 0.12 * sec, 0.16 + 0.10 * sec -- du vert à l'ocre
		cr, cg, cb = cr + (lr - cr) * k, cg + (lg - cg) * k, cb + (lb - cb) * k
	end
	-- les calottes
	if al > 0.86 then
		local k = math.min(1, (al - 0.86) * 9)
		cr, cg, cb = cr + (0.95 - cr) * k, cg + (0.97 - cg) * k, cb + (1 - cb) * k
	end
	-- les volutes de nuages
	local n = fbm(lon * 2.4 + lat * 0.8 + 11, lat * 3.6 - lon * 0.4, 9)
	if n > 0.5 then
		local k = math.min(0.85, (n - 0.5) * 4)
		cr, cg, cb = cr + (1 - cr) * k, cg + (1 - cg) * k, cb + (1 - cb) * k
	end
	-- le soleil (en haut à gauche, un peu vers l'œil), l'atmosphère au bord
	local nl = (-0.5 * x + 0.62 * y + 0.6 * z)
	local l = math.clamp(nl * 1.15 + 0.35, 0.10, 1.15)
	local bord = (1 - z) ^ 3
	return cr * l + 0.25 * bord, cg * l + 0.5 * bord, cb * l + 0.9 * bord, 1
end
-- LA LUNE : un disque gris, ses mers et ses cratères ; sa bouche en « o » (les yeux sont des cadres : ils BOUGENT)
local function pixelLune(u: number, v: number, r: number): (number, number, number, number)
	if r > 0.98 then return 0.7, 0.7, 0.75, math.max(0, 1 - (r - 0.98) * 50) end
	local z = math.sqrt(math.max(0, 1 - u * u - v * v))
	local t = 0.62 + 0.16 * fbm(u * 3 + 2, v * 3 + 7, 21)
	local mer = fbm(u * 1.7 + 4, v * 1.7, 31)
	if mer > 0.58 then t -= math.min(0.2, (mer - 0.58) * 1.4) end
	-- quelques cratères
	for k = 1, 7 do
		local cx, cy, cr = h2(k, 1, 41) * 1.5 - 0.75, h2(k, 2, 43) * 1.5 - 0.75, 0.05 + 0.08 * h2(k, 3, 47)
		local d = math.sqrt((u - cx) ^ 2 + (v - cy) ^ 2) / cr
		if d < 1 then t -= 0.10 * (1 - d) elseif d < 1.25 then t += 0.05 end
	end
	-- la bouche : un « o » de stupeur
	local bx, by = u / 0.13, (v + 0.46) / 0.17
	local bd = math.sqrt(bx * bx + by * by)
	if bd < 1 then t = 0.10 elseif bd < 1.3 then t -= 0.14 end
	local l = math.clamp((-0.5 * u + 0.6 * v + 0.62 * z) * 1.1 + 0.4, 0.14, 1.1)
	return t * l * 0.92, t * l * 0.78, t * l * 0.62, 1 -- (la lune du web est SÉPIA : un caillou chaud sur le noir)
end

-- (le web : 640 m, ~24° — mais sa caméra ouvre jusqu'à 135° : à l'écran la lune y fait 10 % de la largeur. Avec le champ de
-- Roblox, 640 m en prenait 14 % : 420 m rend la même place dans l'image)
local LUNE_R = 420
local E: any = { bati = false, on = false, dirT = nil, dirL = nil, clig = 3, cligT = 0, oeil = Vector2.zero }
local function disque(nom: string, im: any?, secours: Color3): (Part, BillboardGui, ImageLabel)
	local p = Instance.new("Part")
	p.Name = nom
	p.Anchored = true
	p.CanCollide, p.CanQuery, p.CanTouch = false, false, false
	p.Transparency = 1
	p.Size = Vector3.new(1, 1, 1)
	local g = Instance.new("BillboardGui")
	g.LightInfluence = 0
	g.MaxDistance = math.huge
	g.ClipsDescendants = false
	g.Adornee = p
	g.Parent = p
	local i = Instance.new("ImageLabel")
	i.BackgroundTransparency = 1
	i.Size = UDim2.fromScale(1, 1)
	if im then
		i.ImageContent = Content.fromObject(im)
	else
		i.BackgroundTransparency = 0
		i.BackgroundColor3 = secours
		local c = Instance.new("UICorner")
		c.CornerRadius = UDim.new(0.5, 0)
		c.Parent = i
	end
	i.Parent = g
	return p, g, i
end
local function batirAstres()
	local dossier = Instance.new("Folder")
	dossier.Name = "Orbite"
	E.dossier = dossier
	-- la Terre : PLANET_R 1 560 m × 1,35, à 3 400 m (le halo déborde : l'image est plus grande que le disque)
	local imT = imageDe(320, pixelTerre)
	local pT, gT = disque("Terre", imT, Color3.fromRGB(27, 138, 230))
	-- (une sphère de rayon R vue de D couvre asin(R/D) = 38° ; un disque posé à D n'en couvrirait que atan(R/D) = 32° : × 1,274)
	local dT = 1560 * 1.35 * 1.274 * 2 / RD * M
	gT.Size = UDim2.fromScale(dT, dT)
	pT.Parent = dossier
	E.terre = pT
	-- la lune : à 3 000 m (son rayon : LUNE_R, plus bas)
	local imL = imageDe(192, pixelLune)
	local pL, gL, iL = disque("Lune", imL, Color3.fromRGB(170, 170, 178))
	gL.Size = UDim2.fromScale(LUNE_R * 2 * M, LUNE_R * 2 * M)
	pL.Parent = dossier
	E.lune = pL
	-- ses YEUX : deux globes blancs, deux pupilles qui suivent la caisse, deux paupières qui clignent
	E.pupilles, E.paupieres = {}, {}
	for k, x in { -0.27, 0.27 } do
		local globe = Instance.new("Frame")
		globe.AnchorPoint = Vector2.new(0.5, 0.5)
		globe.Position = UDim2.fromScale(0.5 + x, 0.40)
		globe.Size = UDim2.fromScale(0.27, 0.27)
		globe.BackgroundColor3 = Color3.fromRGB(246, 246, 250)
		globe.BorderSizePixel = 0
		globe.ClipsDescendants = true
		globe.Parent = iL
		local c = Instance.new("UICorner")
		c.CornerRadius = UDim.new(0.5, 0)
		c.Parent = globe
		local tr = Instance.new("UIStroke")
		tr.Color = Color3.fromRGB(40, 40, 52)
		tr.Thickness = 3
		tr.Parent = globe
		local pu = Instance.new("Frame")
		pu.AnchorPoint = Vector2.new(0.5, 0.5)
		pu.Position = UDim2.fromScale(0.5, 0.5)
		pu.Size = UDim2.fromScale(0.42, 0.42)
		pu.BackgroundColor3 = Color3.fromRGB(14, 14, 22)
		pu.BorderSizePixel = 0
		pu.Parent = globe
		local c2 = Instance.new("UICorner")
		c2.CornerRadius = UDim.new(0.5, 0)
		c2.Parent = pu
		local pa = Instance.new("Frame")
		pa.Size = UDim2.fromScale(1, 0)
		pa.BackgroundColor3 = Color3.fromRGB(150, 150, 160)
		pa.BorderSizePixel = 0
		pa.ZIndex = 3
		pa.Parent = globe
		E.pupilles[k], E.paupieres[k] = pu, pa
	end
	E.bati = true -- (à la FIN : peindre les images rend la main, et `tick` lisait une Terre pas encore née)
end

-- ── LES SATELLITES d'une piste (une fois par zone d'orbite) ──
local BLANC, OR, AILE, SOMBRE = Color3.fromRGB(214, 218, 228), Color3.fromRGB(226, 178, 70), Color3.fromRGB(24, 44, 120), Color3.fromRGB(40, 42, 52)
local function piece(parent: Instance, taille: Vector3, cf: CFrame, couleur: Color3, matiere: Enum.Material, reflet: number?): Part
	local p = Instance.new("Part")
	p.Anchored = true
	p.CanCollide, p.CanQuery, p.CanTouch = false, false, false
	p.CastShadow = false
	p.TopSurface, p.BottomSurface = Enum.SurfaceType.Smooth, Enum.SurfaceType.Smooth
	p.Size = taille * M
	p.CFrame = cf
	p.Color = couleur
	p.Material = matiere
	p.Reflectance = reflet or 0
	p.Parent = parent
	return p
end
-- un STARLINK : un corps plat, une aile solaire d'un seul côté (k = l'échelle)
local function starlink(parent: Instance, cf: CFrame, k: number)
	piece(parent, Vector3.new(2.8, 0.22, 1.4) * k, cf, BLANC, Enum.Material.Metal, 0.25).Name = "Sat"
	piece(parent, Vector3.new(1.3, 0.06, 7.2) * k, cf * CFrame.new(0, 0.2 * k * M, 4.4 * k * M), AILE, Enum.Material.SmoothPlastic, 0.55)
	piece(parent, Vector3.new(0.12, 0.12, 0.9) * k, cf * CFrame.new(0, 0.1 * k * M, 0.9 * k * M), SOMBRE, Enum.Material.Metal)
end
-- un DÉBRIS : un étage de fusée, un pan de panneau arraché, un petit satellite d'or
local function debris(parent: Instance, cf: CFrame, k: number, genre: number)
	if genre == 0 then
		local c = piece(parent, Vector3.new(7, 2.4, 2.4) * k, cf, BLANC, Enum.Material.SmoothPlastic, 0.1)
		c.Shape = Enum.PartType.Cylinder
		local b = piece(parent, Vector3.new(0.9, 2.44, 2.44) * k, cf * CFrame.new(1.4 * k * M, 0, 0), SOMBRE, Enum.Material.SmoothPlastic)
		b.Shape = Enum.PartType.Cylinder
	elseif genre == 1 then
		piece(parent, Vector3.new(4.5, 0.08, 2.6) * k, cf, AILE, Enum.Material.SmoothPlastic, 0.55)
	else
		piece(parent, Vector3.new(1.4, 1.4, 1.4) * k, cf, OR, Enum.Material.Foil, 0.3)
		piece(parent, Vector3.new(5.2, 0.06, 1.1) * k, cf, AILE, Enum.Material.SmoothPlastic, 0.55)
		piece(parent, Vector3.new(1.1, 0.06, 5.2) * k, cf, AILE, Enum.Material.SmoothPlastic, 0.55)
	end
end

local TRAINS: { [Instance]: { any } } = {} -- les trains de chaque zone d'orbite bâtie (retirés à sa destruction)
function Espace.batir(piste: any, dossier: Instance, graine: number, ceder: (() -> ())?): { any }
	local rnd = Random.new(graine + 0xA57E)
	local function r(): number return rnd:NextNumber() end
	local F, NP = piste.F, piste.n
	local racine = Instance.new("Folder")
	racine.Name = "Satellites"
	racine.Parent = dossier
	-- la grille de la piste : un objet n'approche AUCUNE portion de route
	local HB = 150
	local grille: { [number]: { Vector3 } } = {}
	local pas = math.max(1, math.floor(10 / (piste.DS / M) + 0.5))
	local function cle(gx: number, gz: number): number return (gx + 4096) * 8192 + gz + 4096 end
	for i = 1, NP, pas do
		local p = F[i].Position / M
		local k = cle(math.floor(p.X / HB), math.floor(p.Z / HB))
		local l = grille[k]
		if not l then
			l = {}
			grille[k] = l
		end
		table.insert(l, p)
	end
	local function libre(q: Vector3, R: number): boolean
		local rr = math.ceil(R / HB)
		local bx, bz = math.floor(q.X / HB), math.floor(q.Z / HB)
		for dx = -rr, rr do
			for dz = -rr, rr do
				local l = grille[cle(bx + dx, bz + dz)]
				if l then
					for _, p in l do
						if (p - q).Magnitude < R then return false end
					end
				end
			end
		end
		return true
	end
	local function tourne(): CFrame return CFrame.Angles(r() * 6.283, r() * 6.283, r() * 6.283) end
	local L = piste.len / M
	-- 0. LA PLUIE DE SATELLITES (orbiteBuild §0, L13961 — Sacha : « la version hardcore, avec beaucoup plus de satellites : il faut que ça
	-- devienne un élément de gameplay de devoir ESQUIVER les satellites »). Des satellites SUR la route, à hauteur de caisse : un
	-- STARLINK en travers (ailes de 14-20 m, penché de 8 à 28°) ou un ÉTAGE DE FUSÉE couché (10-14 m) — seul, ou en RIDEAU de deux qui
	-- ne laissent qu'une trouée de 11-14 m. Un tous les 110-230 m (× la vitesse du niveau) à partir de 650 m ; et, pour les voltigeurs,
	-- des panneaux EN L'AIR (9-20 m au-dessus de la route). Chacun porte un LISERÉ ROUGE : c'est un obstacle, pas un décor. Sa boîte de
	-- collision (Pilote : satHard) est exactement celle qu'on voit. Le dessous de la dalle reste libre (le raccourci des voltigeurs).
	local obstacles: { any } = {}
	if piste.variante == "hard" then
		local ROUGE = Color3.fromRGB(255, 56, 72)
		local RHo = RH - 2
		local DSm = piste.DS / M
		local function pose0(k: number, s9: number, la: number, h: number, rad: number, al: number, be: number)
			local f = F[math.clamp(math.floor(s9 / DSm) + 1, 1, NP)]
			local b, n, t = f.RightVector, f.UpVector, f.LookVector
			local W: Vector3, U: Vector3, T: Vector3
			if k == 0 then -- le panneau : ailes en travers, penché autour de la route
				W, U, T = (b * math.cos(al) + n * math.sin(al)).Unit, (n * math.cos(al) - b * math.sin(al)).Unit, t
			else -- l'étage : couché, un peu de biais
				W, U, T = (b * math.cos(be) + t * math.sin(be)).Unit, n, (t * math.cos(be) - b * math.sin(be)).Unit
			end
			local q = f.Position / M + b * la + n * h
			local hw = (k == 0) and rad or rad * 0.8
			local hu = (k == 0) and rad * 0.06 or rad * 0.24
			local ht = (k == 0) and rad * 0.13 or rad * 0.24
			local cf = CFrame.fromMatrix(q * M, W, U)
			if k == 0 then
				piece(racine, Vector3.new(hw * 2, math.max(0.14, hu * 0.7), ht * 2), cf, AILE, Enum.Material.SmoothPlastic, 0.5).Name = "SatRoute"
				piece(racine, Vector3.new(hw * 0.32, hu * 2, ht * 2.3), cf, BLANC, Enum.Material.Metal, 0.25)
				for _, sg in { -1, 1 } do
					piece(racine, Vector3.new(hw * 2, 0.22, 0.22), cf * CFrame.new(0, 0, sg * ht * M), ROUGE, Enum.Material.Neon)
				end
			else
				local c = piece(racine, Vector3.new(hw * 2, hu * 2, hu * 2), cf, BLANC, Enum.Material.SmoothPlastic, 0.1)
				c.Shape = Enum.PartType.Cylinder
				c.Name = "SatRoute"
				local bande = piece(racine, Vector3.new(hw * 0.3, hu * 2.03, hu * 2.03), cf * CFrame.new(hw * 0.35 * M, 0, 0), SOMBRE, Enum.Material.SmoothPlastic)
				bande.Shape = Enum.PartType.Cylinder
				for _, sg in { -1, 1 } do
					local a = piece(racine, Vector3.new(0.3, hu * 2.1, hu * 2.1), cf * CFrame.new(sg * hw * 0.94 * M, 0, 0), ROUGE, Enum.Material.Neon)
					a.Shape = Enum.PartType.Cylinder
				end
			end
			local mx = math.max(hw, hu, ht) + 5
			table.insert(obstacles, { q = q, W = W, U = U, T = T, hw = hw + 1.0, hu = hu + 0.75, ht = ht + 2.2, R2 = mx * mx, min = 99, pres = false, fait = false,
				s = s9, haut = h > 5 }) -- (s, haut : la LIGNE PARFAITE ne pose jamais un fruit ni un pad dans un satellite posé sur la route)
		end
		local function gabarit(): (number, number, number)
			local k = (r() < 0.55) and 0 or 1
			local rad = (k == 1) and (6 + r() * 3) or (7 + r() * 3)
			return k, rad, (k == 1) and rad * 0.8 or rad
		end
		-- (l'écart grandit avec la vitesse de croisière du niveau : 1,3 à 2,7 s de route entre deux obstacles)
		local espK = math.max(1, 0.45 + 0.4 * (1 + (piste.zone - 1) * 0.35) * 1.3)
		local sp, no = 650 + r() * 100, 0
		while sp < L - 420 do
			if r() < 0.32 then -- LE RIDEAU : deux obstacles, une TROUÉE de 11-14 m quelque part entre eux
				local gw = 11 + r() * 3
				local g = (r() * 2 - 1) * (RHo - gw / 2 - 6)
				for _, sg in { -1, 1 } do
					local k, rad, half = gabarit()
					pose0(k, sp + (r() - 0.5) * 6, g + sg * (gw / 2 + half), (k == 1) and (rad * 0.24 + 0.3) or 1.15, rad, sg * math.rad(8 + r() * 20), (r() - 0.5) * 0.5)
				end
			else
				local k, rad, half = gabarit()
				local la = (r() * 2 - 1) * math.max(0, RHo - half * 0.55)
				pose0(k, sp, la, (k == 1) and (rad * 0.24 + 0.3) or 1.15, rad, ((r() < 0.5) and -1 or 1) * math.rad(8 + r() * 20), (r() - 0.5) * 0.6)
			end
			sp += (110 + r() * 120) * espK
			no += 1
			if ceder and no % 8 == 0 then ceder() end
		end
		local s9 = 900 + r() * 300
		while s9 < L - 500 do -- EN L'AIR : pour qui saute par-dessus un rideau
			pose0(0, s9, (r() * 2 - 1) * RHo * 0.8, 9 + r() * 11, 6 + r() * 4, (r() - 0.5) * 1.4, 0)
			s9 += (420 + r() * 220) * espK
		end
	end
	-- (« plus de satellites dans l'espace », Sacha, 30/09 — orbiteBuild §1 à §3, L14000 : le ciel de l'orbite est PEUPLÉ)
	local DSm0 = piste.DS / M
	local n = 0
	-- 1. LES PASSANTS : de grands Starlink au bord de la route, du côté EXTÉRIEUR du virage qui vient (ils ne cachent jamais la route
	-- qui tourne) ; une moitié dressée au bord, en silhouette sur le noir, l'autre en contrebas
	local NPASS = 30
	for k = 0, NPASS - 1 do
		local i = math.clamp(math.floor((420 + (L - 900) / NPASS * (k + 0.15 + r() * 0.7)) / DSm0) + 1, 1, NP - 1)
		local f = F[i]
		local f2 = F[math.min(NP, i + math.floor(170 / DSm0))]
		local t9, t2 = f.LookVector, f2.LookVector
		local hl = math.sqrt(t9.X * t9.X + t9.Z * t9.Z)
		local tr = t9.Z * t2.X - t9.X * t2.Z
		local sg = (math.abs(tr) < 0.06) and ((r() < 0.5) and -1 or 1) or ((tr < 0) and -1 or 1)
		local rad = 16 + r() * 24
		local lat = RH + rad * 1.1 + 14 + r() * 38
		local dy = (r() < 0.5) and (6 + r() * 30) or -(rad * 0.35 + r() * 46)
		if hl >= 0.5 then
			local q = Vector3.new(f.Position.X / M - t9.Z / hl * sg * lat, f.Position.Y / M + dy, f.Position.Z / M + t9.X / hl * sg * lat)
			if libre(q, rad * 1.1 + RH + 14) then starlink(racine, CFrame.new(q * M) * tourne(), rad / 4.6) end
		 end
		n += 1
		if ceder and n % 10 == 0 then ceder() end
	end
	-- 2. LE CHAMP : le long de la piste, jusqu'à 1,2 km — la parallaxe. Six objets sur dix montent AU-DESSUS de la route (90 à 590 m).
	-- Les gros (> 12 m) : un Starlink sur trois, les autres des débris (étage de fusée, pan de panneau, petit satellite d'or) ; les
	-- petits : des éclats de métal qui accrochent le soleil
	local gros, petits, essais = 0, 0, 0
	while (gros < 110 or petits < 170) and essais < 1100 do
		essais += 1
		local f = F[math.clamp(math.floor(r() * NP) + 1, 1, NP)]
		local t9 = f.LookVector
		local hl = math.sqrt(t9.X * t9.X + t9.Z * t9.Z)
		if hl >= 0.3 then
			local sg = (r() < 0.5) and -1 or 1
			local rad = 3 + r() ^ 2.2 * 46
			local haut = r() < 0.6
			local al = (r() - 0.5) * 260
			local dy = haut and (90 + r() ^ 1.2 * 500) or -(60 + r() * 400)
			local lat = haut and (r() ^ 1.1 * 900) or (RH + 100 + r() ^ 1.3 * 1000)
			local estGros = rad > 12
			if (estGros and gros < 110) or (not estGros and petits < 170) then
				local q = Vector3.new(f.Position.X / M + (-t9.Z * sg * lat + t9.X * al) / hl, f.Position.Y / M + dy, f.Position.Z / M + (t9.X * sg * lat + t9.Z * al) / hl)
				if libre(q, rad * 1.3 + RH + 110) then
					local cf = CFrame.new(q * M) * tourne()
					if estGros then
						gros += 1
						if r() < 0.34 then starlink(racine, cf, rad * 0.9 / 4.6) else debris(racine, cf, rad * 0.85 / 3.6, math.floor(r() * 3)) end
					else
						petits += 1
						local e = rad * 0.8
						piece(racine, Vector3.new(e * (0.5 + r()), e * 0.12, e * (0.3 + r() * 0.6)), cf, (r() < 0.3) and OR or BLANC, Enum.Material.Metal, 0.35)
					end
				end
			end
		end
		if ceder and essais % 25 == 0 then ceder() end
	end
	-- 3. LES TRAINS STARLINK : des files de satellites alignés qui GLISSENT dans le ciel, haut au-dessus de la piste (1,5 à 2,6 km de
	-- long, 20 satellites à pas régulier, tous orientés pareil) — le collier de perles. Chaque satellite est UN panneau : sa file le
	-- déplace à chaque image (Espace.tick) et le replie au bout.
	local mn, mx, ys = Vector3.new(math.huge, 0, math.huge), Vector3.new(-math.huge, 0, -math.huge), 0
	for i = 1, NP, 20 do
		local q = F[i].Position / M
		mn, mx, ys = Vector3.new(math.min(mn.X, q.X), 0, math.min(mn.Z, q.Z)), Vector3.new(math.max(mx.X, q.X), 0, math.max(mx.Z, q.Z)), ys + q.Y
	end
	local centre = Vector3.new((mn.X + mx.X) / 2, ys / math.ceil(NP / 20), (mn.Z + mx.Z) / 2)
	local ex, ez = math.max(400, (mx.X - mn.X) * 0.35), math.max(400, (mx.Z - mn.Z) * 0.35)
	local trains = {}
	for _ = 1, 3 do
		local nb, Lt, rad, v = 20, 1500 + r() * 1100, 19 + r() * 7, 38 + r() * 26
		local an, inc = r() * 6.283, (r() - 0.5) * 0.28
		local d = Vector3.new(math.cos(an) * math.cos(inc), math.sin(inc), math.sin(an) * math.cos(inc)).Unit
		local p0 = Vector3.new(centre.X + (r() - 0.5) * 2 * ex - d.X * Lt / 2, centre.Y + 240 + r() * 320, centre.Z + (r() - 0.5) * 2 * ez - d.Z * Lt / 2)
		local ok = false
		for _ = 1, 5 do
			ok = true
			local u = 0
			while u <= Lt do
				if not libre(p0 + d * u, rad + RH + 140) then
					ok = false
					break
				end
				u += 150
			end
			if ok then break end
			p0 += Vector3.new(0, 150, 0)
		end
		if ok then
			local haut = (Vector3.yAxis - d * d.Y).Unit
			local rot = CFrame.fromMatrix(Vector3.zero, d, haut) * CFrame.Angles(0.35, 0, 0)
			local l = {}
			for j = 0, nb - 1 do
				local pc = piece(racine, Vector3.new(rad * 0.5, rad * 0.03, rad * 1.7), CFrame.new((p0 + d * (Lt * (j + 0.5) / nb)) * M) * rot, AILE, Enum.Material.SmoothPlastic, 0.6)
				pc.Name = "Train"
				table.insert(l, pc)
			end
			table.insert(trains, { p = l, cf = table.create(nb), p0 = p0 * M, d = d, Lt = Lt * M, v = v * M, rot = rot, o = 0 })
		end
		if ceder then ceder() end
	end
	if #trains > 0 then
		TRAINS[racine] = trains
		racine.Destroying:Once(function() TRAINS[racine] = nil end)
	end
	-- 4. LES ANNEAUX DE DÉBRIS (orbiteBuild §4, L14053 — le syndrome de Kessler) : deux anneaux d'éclats autour de la piste. Le premier
	-- presque à plat (7 à 14°) se couche sur l'horizon, derrière la route et la Terre ; le second, dressé de 26 à 37° et tourné d'un
	-- quart de tour, monte en DIAGONALE dans le noir au-dessus de la route : un fleuve d'éclats en travers du ciel. Rayon : la moitié
	-- de l'étendue de la piste + 250 m (1 à 2,6 km), épaisseur en cloche (± 380 m en travers, ± 120 m en hauteur). Jamais sur la route.
	do
		local cy = centre.Y + 160
		local Rb0 = math.min(2600, math.max(1000, math.max(mx.X - mn.X, mx.Z - mn.Z) * 0.5 + 250))
		local ta0, ti0 = r() * 6.283, 0.13 + r() * 0.12
		local ta1, ti1 = ta0 + 1.57 + (r() - 0.5), 0.45 + r() * 0.2
		local function gs(): number return (r() + r() + r() - 1.5) * 1.15 end -- (≈ une gaussienne)
		local TEINTES = { BLANC, OR, Color3.fromRGB(150, 156, 170), Color3.fromRGB(70, 110, 190) } -- argent, lambeau d'or, tige d'acier, cellule
		for anneau = 1, 2 do
			local ta, ti = (anneau == 1) and ta0 or ta1, (anneau == 1) and ti0 or ti1
			local Rb = (anneau == 1) and Rb0 or Rb0 * 1.15
			local e1 = Vector3.new(math.cos(ta), 0, math.sin(ta))
			local nz = CFrame.fromAxisAngle(e1, ti):VectorToWorldSpace(Vector3.yAxis)
			local e2 = nz:Cross(e1).Unit
			local posees, essais4 = 0, 0
			while posees < 340 and essais4 < 1100 do
				essais4 += 1
				local th = r() * 6.283
				local rr, hh = Rb + gs() * 380, gs() * 120
				local rad = 6 + r() ^ 2.4 * 40
				local q = Vector3.new(centre.X, cy, centre.Z) + e1 * (math.cos(th) * rr) + e2 * (math.sin(th) * rr) + nz * hh
				if libre(q, rad * 1.3 + RH + 90) then
					posees += 1
					-- (un éclat de 1 à 3 km ne se lit pas sans l'ÉCLAT du soleil du web : un sur cinq brille — c'est lui qui dessine le fleuve)
					local e = rad * 1.25
					local x = r()
					local c = TEINTES[(x < 0.4 and 1) or (x < 0.66 and 2) or (x < 0.86 and 3) or 4]
					local brille = r() < 0.2
					piece(racine, Vector3.new(e * (0.5 + r()), e * 0.12, e * (0.3 + r() * 0.6)), CFrame.new(q * M) * tourne(), brille and Color3.fromRGB(255, 236, 190) or c,
						brille and Enum.Material.Neon or Enum.Material.Metal, 0.35)
				end
				if ceder and essais4 % 40 == 0 then ceder() end
			end
		end
	end
	return obstacles
end

-- ── chaque image : la Terre et la lune se calent sur la caméra (avec retard), la lune regarde la caisse ──
function Espace.tick(dt: number, actif: boolean, camCF: CFrame, carCF: CFrame)
	if not actif then
		if E.on then
			E.on = false
			E.dossier.Parent = nil
		end
		return
	end
	if not E.bati then
		if E.enCours then return end
		E.enCours = true
		task.spawn(function()
			batirAstres()
			E.enCours = false
		end)
		return
	end
	if not E.on then
		E.on = true
		E.dossier.Parent = workspace
		E.dirT, E.dirL = nil, nil
	end
	-- LES TRAINS glissent le long de leur file et se replient au bout (seulement ceux de la zone montrée)
	for racine, trains in TRAINS do
		if racine:IsDescendantOf(workspace) then
			for _, t in trains do
				t.o = (t.o + t.v * dt) % t.Lt
				local nb = #t.p
				for j = 1, nb do
					t.cf[j] = CFrame.new(t.p0 + t.d * ((t.Lt * (j - 0.5) / nb + t.o) % t.Lt)) * t.rot
				end
				workspace:BulkMoveTo(t.p, t.cf, Enum.BulkMoveMode.FireCFrameChanged)
			end
		end
	end
	local cam = camCF.Position
	local av = camCF.LookVector
	local h = Vector3.new(av.X, 0, av.Z)
	if h.Magnitude < 1e-3 then h = Vector3.new(0, 0, -1) end
	h = h.Unit
	-- LA TERRE : le cap tourné vers la gauche, sous l'horizon ; un gros retard (× 0,35 / s). (le web : 0,5 rad et 35° — sa caméra
	-- plonge de 10 à 50°, la Terre y monte au-dessus du bout de la route. Celle de Roblox regarde plus à plat : à 35° le dôme
	-- restait caché DERRIÈRE la route — 0,3 rad et 28° le font lever comme dans les captures)
	local g = CFrame.Angles(0, 0.3, 0):VectorToWorldSpace(h)
	local cibleT = Vector3.new(g.X, -0.53, g.Z).Unit
	E.dirT = E.dirT and (E.dirT :: Vector3):Lerp(cibleT, math.min(1, dt * 0.35)).Unit or cibleT
	E.terre.CFrame = CFrame.new(cam + (E.dirT :: Vector3) * (3400 * M))
	-- LA LUNE, SA PLACE DANS LE CADRE (orbiteTick, L14114) : elle vise un point de l'IMAGE — le tiers haut-droit : 30 % à droite,
	-- 40 % au-dessus du centre, dans le repère de la caméra redressé sur l'horizon du monde — et le rejoint avec RETARD (2/s) : un
	-- coup de volant la fait glisser comme un astre, elle revient ensuite, sans jamais s'écarter de plus de 9°. C'est ce retard qui
	-- la fait « suivre le joueur » (verdict de Sacha : « c'est un bug mais j'aime bien »).
	local dr = av:Cross(Vector3.yAxis)
	if dr.Magnitude > 1e-2 then
		dr = dr.Unit
		local du = dr:Cross(av)
		local camera = workspace.CurrentCamera
		local tv = math.tan(math.rad(camera.FieldOfView) / 2)
		local vp = camera.ViewportSize
		E.cibleL = (av + dr * (0.30 * tv * vp.X / math.max(1, vp.Y)) + du * (0.40 * tv)).Unit
	end
	local cibleL: Vector3 = E.cibleL or h
	if E.dirL then
		local dm = (E.dirL :: Vector3):Lerp(cibleL, math.min(1, dt * 2)).Unit
		local cc = dm:Dot(cibleL)
		if cc < math.cos(0.16) then
			local pr = dm - cibleL * cc
			if pr.Magnitude > 1e-6 then dm = (cibleL * math.cos(0.16) + pr.Unit * math.sin(0.16)).Unit end
		end
		E.dirL = dm
	else
		E.dirL = cibleL
	end
	local posL = cam + (E.dirL :: Vector3) * (3000 * M)
	E.lune.CFrame = CFrame.new(posL)
	-- SON REGARD : les pupilles vont vers la caisse (dans le repère de l'écran), avec un petit retard ; elle cligne de temps en temps
	local versCaisse = camCF:VectorToObjectSpace((carCF.Position - posL).Unit)
	local vise = Vector2.new(math.clamp(versCaisse.X * 2.2, -1, 1), math.clamp(-versCaisse.Y * 2.2, -1, 1))
	E.oeil = E.oeil:Lerp(vise, math.min(1, dt * 5))
	E.clig -= dt
	if E.clig <= 0 then
		E.clig = 2.5 + math.random() * 4
		E.cligT = 0.16
	end
	E.cligT = math.max(0, E.cligT - dt)
	local ferme = (E.cligT > 0) and math.sin((1 - E.cligT / 0.16) * math.pi) or 0
	for k = 1, 2 do
		E.pupilles[k].Position = UDim2.fromScale(0.5 + E.oeil.X * 0.26, 0.5 + E.oeil.Y * 0.26)
		E.paupieres[k].Size = UDim2.fromScale(1, ferme)
	end
end

return Espace
