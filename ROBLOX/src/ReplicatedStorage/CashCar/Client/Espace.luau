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

function Espace.batir(piste: any, dossier: Instance, graine: number, ceder: (() -> ())?)
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
	-- 1. le long du ruban : un satellite ou un débris tous les ~140 m, à 45-260 m de l'axe, au-dessus comme en dessous
	local L = piste.len / M
	local sp, n = 120.0, 0
	while sp < L - 100 do
		local f = F[math.clamp(math.floor(sp / (piste.DS / M)) + 1, 1, NP)]
		local cote = (r() < 0.5) and -1 or 1
		local q = f.Position / M + f.RightVector * (cote * (RH + 45 + r() * r() * 215)) + Vector3.new(0, -70 + r() * 170, 0)
		if libre(q, RH + 22) then
			local cf = CFrame.new(q * M) * tourne()
			local k = 1.6 + r() * 2.2
			if r() < 0.55 then starlink(racine, cf, k) else debris(racine, cf, k, math.floor(r() * 3)) end
		end
		sp += 90 + r() * 110
		n += 1
		if ceder and n % 10 == 0 then ceder() end
	end
	-- 2. LES TRAINS : des files de Starlink alignés, très haut au-dessus de la route — le collier de perles
	for t = 1, math.max(2, math.floor(L / 3500)) do
		local f = F[math.clamp(math.floor(NP * (t - 0.5 + (r() - 0.5) * 0.4) / math.max(2, math.floor(L / 3500))) + 1, 1, NP)]
		local base = f.Position / M + Vector3.new(0, 190 + r() * 160, 0) + f.RightVector * ((r() - 0.5) * 500)
		local a = r() * 6.283
		local dir = Vector3.new(math.cos(a), (r() - 0.5) * 0.12, math.sin(a)).Unit
		local rot = CFrame.lookAt(Vector3.zero, dir) * CFrame.Angles(0, 0, 0.35)
		for k = -7, 7 do
			local q = base + dir * (k * 34)
			if libre(q, RH + 40) then starlink(racine, CFrame.new(q * M) * rot.Rotation, 2.6) end
		end
		if ceder then ceder() end
	end
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
