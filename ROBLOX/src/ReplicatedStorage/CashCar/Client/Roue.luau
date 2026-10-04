-- CASH CAR — LA ROUE (Sacha, 4/10 : « rajoute bouton roulette pour gagner une voiture ou de l'argent au choix »). Elle remplace les
-- MISSIONS et la CARRIÈRE au menu. Huit cases (Config.ROUE) : de l'argent, une CAISSE EXCLUSIVE (les neuf caisses qu'on ne trouve
-- nulle part ailleurs), un SKIN (peinture OR MASSIF, traînée ARC-EN-CIEL), le JACKPOT. Le TIRAGE se fait au serveur
-- (ServerScriptService/Revenus) : la roue d'ici ne fait que TOURNER jusqu'à la case qu'il a tirée. Une caisse gagnée se choisit :
-- LA GARDER (elle est équipée tout de suite) ou LA VENDRE contre de l'argent — la voiture OU l'argent, au choix.
-- D'où viennent les tours : un GRATUIT toutes les 4 h, un OFFERT toutes les 3 parties (la carte de l'écran de fin compte les
-- parties), et des tours à vendre en Robux (REVENUS.produits.tours3 — à 0, le bouton n'existe pas).
-- La roue est en PIXELS (la DA du jeu) : un disque de 60 × 60 cases peint ligne par ligne (une barrette par suite de cases de même
-- couleur, comme les icônes), dans un CanvasGroup qu'on fait tourner d'un bloc.
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local CC = ReplicatedStorage:WaitForChild("CashCar")
local Config = require(CC:WaitForChild("Config"))
local Caisse = require(CC:WaitForChild("Caisse"))
local Hud = require(script.Parent:WaitForChild("Hud"))
local Sons = require(script.Parent:WaitForChild("Sons"))
local RO, R = Config.ROUE, Config.REVENUS
local Catalogue = Caisse.Catalogue
local K, C, FR = Hud.kit, Hud.C, Hud.FR
local inst, texte = K.inst, K.texte
local joueur = Players.LocalPlayer
local RGB = Color3.fromRGB
local OR1 = RGB(255, 215, 94)

local Roue = {}
local ctx: any = nil
local U: any = {}
local N = #RO.cases
local PAS = 360 / N
local function tr(fr: string, en: string): string return FR and fr or en end
local function attr(n: string): any return joueur:GetAttribute(n) end
-- l'icône du bouton (une grille 9 × 9 écrite sur place, comme celles du carnet)
Roue.ICONE = "..#####..|.#..#..#.|#.#.#.#.#|#..###..#|#########|#..###..#|#.#.#.#.#|.#..#..#.|..#####.."

-- ════════ l'état des tours ════════
function Roue.libre(): boolean
	local p = attr("RoueProchain")
	return type(p) == "number" and workspace:GetServerTimeNow() >= p
end
function Roue.tours(): number return (attr("RoueTours") or 0) + (Roue.libre() and 1 or 0) end
local function hms(s: number): string
	s = math.max(0, math.ceil(s))
	local h = s // 3600
	if h > 0 then return string.format("%d:%02d:%02d", h, (s % 3600) // 60, s % 60) end
	return string.format("%d:%02d", s // 60, s % 60)
end
function Roue.attente(): string
	local p = attr("RoueProchain")
	if type(p) ~= "number" then return "" end
	return hms(p - workspace:GetServerTimeNow())
end

-- ════════ LES CASES : couleur, libellé ════════
local function couleurCase(k: number): (Color3, Color3)
	local c = RO.cases[k]
	if c.jackpot then return RGB(255, 196, 40), RGB(60, 30, 4) end
	if c.k == "caisse" then return RGB(70, 214, 120), RGB(6, 40, 18) end
	if c.k == "habit" then return RGB(236, 64, 176), RGB(255, 255, 255) end
	return (k % 2 == 1) and RGB(78, 44, 168) or RGB(28, 92, 196), RGB(255, 255, 255)
end
local function libelle(k: number): string
	local c = RO.cases[k]
	if c.jackpot then return "JACKPOT" end
	if c.k == "caisse" then return tr("CAISSE", "CAR") end
	if c.k == "habit" then return "SKIN" end
	return Hud.argent(c.v)
end

-- ════════ LE DISQUE EN PIXELS ════════
local G9, PX = 60, 8
local function assombrir(c: Color3, k: number): Color3 return Color3.new(c.R * k, c.G * k, c.B * k) end
local function batirDisque(parent: Instance): CanvasGroup
	local cg = inst("CanvasGroup", { Name = "Disque", BackgroundTransparency = 1, Size = UDim2.fromOffset(G9 * PX, G9 * PX),
		AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5) }, parent)
	local R0 = G9 / 2
	local SEP, BORD, BORD2 = RGB(14, 8, 34), RGB(255, 205, 70), RGB(150, 92, 10)
	for y = 0, G9 - 1 do
		local debut, cle, coul = -1, "", nil :: Color3?
		local function fermer(x1: number)
			if coul and debut >= 0 then
				inst("Frame", { BackgroundColor3 = coul, BorderSizePixel = 0, Size = UDim2.fromOffset((x1 - debut) * PX, PX),
					Position = UDim2.fromOffset(debut * PX, y * PX) }, cg)
			end
		end
		for x = 0, G9 do
			local c: Color3? = nil
			if x < G9 then
				local dx, dy = x + 0.5 - R0, y + 0.5 - R0
				local r = math.sqrt(dx * dx + dy * dy)
				if r <= R0 then
					if r > R0 - 2.2 then
						c = (dy < 0) and BORD or assombrir(BORD, 0.82) -- (la jante d'or, plus claire en haut : la lumière vient du ciel)
					elseif r > R0 - 3.1 then
						c = BORD2
					else
						local a = math.deg(math.atan2(dx, -dy)) % 360 -- (dans le sens des aiguilles d'une montre depuis le haut)
						local s = (a + PAS / 2) % 360
						local k = math.floor(s / PAS) + 1
						local bord = math.min(s % PAS, PAS - s % PAS)
						if math.rad(bord) * r < 0.6 then
							c = SEP
						else
							local fond = couleurCase(k)
							-- trois anneaux de lumière : clair au bord, plein, sombre vers le moyeu (le relief du pixel art)
							c = (r > R0 - 5.2) and fond:Lerp(Color3.new(1, 1, 1), 0.18) or ((r < R0 * 0.42) and assombrir(fond, 0.78) or fond)
						end
					end
				end
			end
			local cl = c and c:ToHex() or ""
			if cl ~= cle then
				fermer(x)
				debut, cle, coul = x, cl, c
			end
		end
	end
	-- les AMPOULES de la jante (elles clignotent pendant que la roue tourne)
	U.ampoules = {}
	for i = 1, 16 do
		local a = math.rad((i - 0.5) * 22.5)
		local rr = (R0 - 1.1) * PX
		local f = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.fromOffset(PX, PX), AnchorPoint = Vector2.new(0.5, 0.5),
			Position = UDim2.new(0.5, math.sin(a) * rr, 0.5, -math.cos(a) * rr), ZIndex = 3 }, cg)
		U.ampoules[i] = f
	end
	-- les LIBELLÉS : le long du rayon, du moyeu vers la jante
	for k = 1, N do
		local a = (k - 1) * PAS
		local rr = R0 * 0.58 * PX
		local _, ct = couleurCase(k)
		local t = texte(cg, { Text = libelle(k), TextSize = (RO.cases[k].jackpot or utf8.len(libelle(k)) > 6) and 17 or 21, TextColor3 = ct, Size = UDim2.fromOffset(170, 26),
			AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.new(0.5, math.sin(math.rad(a)) * rr, 0.5, -math.cos(math.rad(a)) * rr),
			Rotation = a - 90, TextWrapped = false, epais = 2, ZIndex = 2 })
		if ct ~= Color3.new(1, 1, 1) then (t:FindFirstChildOfClass("UIStroke") :: UIStroke).Enabled = false end
	end
	return cg
end
-- le moyeu (immobile, par-dessus) et l'aiguille en haut
local function batirMoyeu(parent: Instance)
	local m = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(13 * PX, 13 * PX), AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.5), ZIndex = 4 }, parent)
	for y = 0, 12 do
		local dy = y + 0.5 - 6.5
		local w = math.floor(math.sqrt(math.max(0, 42.25 - dy * dy)) + 0.5)
		if w > 0 then
			inst("Frame", { BackgroundColor3 = (math.abs(dy) > 4.5 or w * 2 >= 12) and RGB(150, 92, 10) or RGB(255, 205, 70), BorderSizePixel = 0,
				Size = UDim2.fromOffset(w * 2 * PX, PX), Position = UDim2.fromOffset((6.5 - w) * PX, y * PX), ZIndex = 4 }, m)
		end
	end
	texte(m, { Text = "$", TextSize = 46, TextColor3 = RGB(60, 30, 4), Size = UDim2.fromScale(1, 1), contour = false, TextWrapped = false, ZIndex = 5 })
	-- l'AIGUILLE : un triangle d'or cerné d'encre, la pointe vers la roue
	local fleche = "#########|#########|.#######.|.#######.|..#####..|..#####..|...###...|...###...|....#...."
	local ai = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(9 * 7, 9 * 7), AnchorPoint = Vector2.new(0.5, 0),
		Position = UDim2.new(0.5, 0, 0.5, -G9 * PX / 2 - 22), ZIndex = 6 }, parent)
	local fond = K.icone(ai, fleche, 7, C.encre, UDim2.fromScale(0.5, 0), Vector2.new(0.5, 0))
	fond.Position = UDim2.new(0.5, 0, 0, 3)
	K.icone(ai, fleche, 6, { { 0.3, RGB(255, 244, 170) }, { 0.7, RGB(255, 196, 40) }, { 1, RGB(200, 120, 10) } }, UDim2.new(0.5, 0, 0, 0), Vector2.new(0.5, 0))
	for _, d in ai:GetDescendants() do
		if d:IsA("GuiObject") then d.ZIndex = 6 end
	end
	U.aiguille = ai
end

-- la photo d'une caisse (Client/Boutique : la vignette en un maillage, cadrée de trois quarts)
local function photographier(vp: ViewportFrame, i: number): Model?
	local m = Caisse.vignette(i)
	if not m then return nil end
	local corps = m.PrimaryPart :: BasePart
	local az, el = 0.82, 0.27
	local dir = Vector3.new(-math.sin(az) * math.cos(el), math.sin(el), -math.cos(az) * math.cos(el))
	local projete = corps.Size.Z * math.sin(az) + corps.Size.X * math.cos(az)
	local dist = projete / 0.9 / (2 * math.tan(math.rad(12)) * 1.9) + corps.Size.Z * 0.18 -- (×1,9 : la caisse REMPLIT le cadre, c'est le lot)
	local cam = Instance.new("Camera")
	cam.FieldOfView = 24
	local vise = corps.Position + Vector3.new(0, -corps.Size.Y * 0.04, 0)
	cam.CFrame = CFrame.lookAt(vise + dir * dist, vise)
	cam.Parent = vp
	vp.CurrentCamera = cam
	vp.LightDirection = (-dir * 0.5 + Vector3.new(0.5, -1, 0.2)).Unit
	m.Parent = vp
	return m
end

-- ════════ LA FENÊTRE ════════
local function creer()
	local v = inst("Frame", { Name = "Roue", BackgroundColor3 = RGB(6, 4, 16), BackgroundTransparency = 0.25, Size = UDim2.fromScale(1, 1),
		Visible = false, Active = true, ZIndex = 42 }, Hud.racine)
	inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, v) -- (le voile avale les clics)
	-- les rayons dorés derrière la roue (immobiles : un éventail qui respire)
	local scene = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(620, 620), AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.new(0.5, -250, 0.5, 6) }, v)
	U.halo = inst("Frame", { BackgroundColor3 = RGB(255, 196, 40), BackgroundTransparency = 0.82, BorderSizePixel = 0, Size = UDim2.fromOffset(560, 560),
		AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5) }, scene)
	inst("UICorner", { CornerRadius = UDim.new(0.5, 0) }, U.halo)
	inst("UIGradient", { Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.2), NumberSequenceKeypoint.new(0.5, 0.75), NumberSequenceKeypoint.new(1, 1) }),
		Rotation = 90 }, U.halo)
	U.disque = batirDisque(scene)
	batirMoyeu(scene)

	-- la colonne de droite : le titre, les tours, TOURNER
	local col = K.carbone(v, UDim2.fromOffset(520, 560), UDim2.new(0.5, 330, 0.5, 6), OR1, Vector2.new(0.5, 0.5))
	U.col = col
	texte(col, { Text = tr("LA ROUE", "THE WHEEL"), TextSize = 56, TextColor3 = OR1, italique = true, Size = UDim2.new(1, 0, 0, 60), Position = UDim2.fromOffset(0, 26),
		TextWrapped = false, epais = 4 })
	inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 21, TextColor3 = C.texte2, TextWrapped = true,
		Text = tr("De l'argent, des skins… et neuf caisses qu'on ne gagne QU'ICI. Une caisse gagnée : tu la gardes, ou tu la revends — au choix.",
			"Cash, skins… and nine cars you can ONLY win here. Win a car: keep it, or sell it — your call."),
		Size = UDim2.new(1, -60, 0, 78), Position = UDim2.fromOffset(32, 92) }, col)
	-- ── l'état : les tours, le prochain gratuit, les parties ──
	U.etat = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, 380), Position = UDim2.fromOffset(0, 176) }, col)
	U.tours = texte(U.etat, { Text = "", TextSize = 34, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 40), Position = UDim2.fromOffset(0, 4), TextWrapped = false, epais = 3 })
	U.prochain = texte(U.etat, { Text = "", TextSize = 18, TextColor3 = C.terne, Size = UDim2.new(1, 0, 0, 22), Position = UDim2.fromOffset(0, 52), TextWrapped = false })
	U.parties = texte(U.etat, { Text = "", TextSize = 18, TextColor3 = C.terne, Size = UDim2.new(1, 0, 0, 22), Position = UDim2.fromOffset(0, 80), TextWrapped = false })
	U.tourner = K.lingot(U.etat, tr("TOURNER", "SPIN"), UDim2.fromOffset(420, 100), UDim2.new(0.5, 0, 0, 124), Vector2.new(0.5, 0), 46)
	U.tourner.Activated:Connect(function() Roue.tourner() end)
	U.acheter = K.tuile(U.etat, tr("3 TOURS", "3 SPINS"), C.magenta, UDim2.fromOffset(250, 68), UDim2.new(0, 34, 1, -24), Vector2.new(0, 1), 20, "panier")
	U.acheterBoite = U.acheter.Parent.Parent
	U.acheter.Activated:Connect(function()
		local id = R.produits.tours3
		if type(id) == "number" and id > 0 then pcall(function() MarketplaceService:PromptProductPurchase(joueur, id) end) end
	end)
	U.fermer = K.tuile(U.etat, "", C.cyan, UDim2.fromOffset(150, 68), UDim2.new(1, -34, 1, -24), Vector2.new(1, 1), 30, "croix")
	U.fermer.Activated:Connect(function() Roue.fermer() end)

	-- ── le GAIN (à la place de l'état, quand la roue s'arrête) ──
	U.gain = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, 380), Position = UDim2.fromOffset(0, 176), Visible = false }, col)
	U.gTete = texte(U.gain, { Text = "", TextSize = 40, TextColor3 = OR1, italique = true, Size = UDim2.new(1, 0, 0, 46), Position = UDim2.fromOffset(0, 0), TextWrapped = false, epais = 4 })
	U.gMontant = texte(U.gain, { Text = "", TextSize = 64, TextColor3 = C.menthe, Size = UDim2.new(1, -20, 0, 72), Position = UDim2.fromOffset(10, 70), TextWrapped = false,
		epais = 5, contourCouleur = RGB(4, 40, 20) })
	U.gVue = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.new(1, -40, 0, 170), Position = UDim2.fromOffset(20, 44),
		Ambient = RGB(150, 150, 178), LightColor = RGB(255, 250, 240) }, U.gain)
	U.gNom = texte(U.gain, { Text = "", TextSize = 30, TextColor3 = C.texte, Size = UDim2.new(1, -30, 0, 34), Position = UDim2.fromOffset(15, 214), TextWrapped = false,
		TextScaled = true, epais = 3 })
	inst("UITextSizeConstraint", { MaxTextSize = 30, MinTextSize = 14 }, U.gNom)
	U.gNote = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 20, TextColor3 = C.texte2, TextWrapped = true, Text = "",
		Size = UDim2.new(1, -60, 0, 60), Position = UDim2.fromOffset(30, 172) }, U.gain)
	U.gGarder = K.lingot(U.gain, tr("LA GARDER", "KEEP IT"), UDim2.fromOffset(260, 92), UDim2.new(0, 30, 1, -24), Vector2.new(0, 1), 32)
	U.gVendre = K.tuile(U.gain, "", C.cyan, UDim2.fromOffset(190, 84), UDim2.new(1, -30, 1, -28), Vector2.new(1, 1), 18)
	U.gVendre.TextWrapped = true
	U.gOk = K.lingot(U.gain, "OK", UDim2.fromOffset(300, 92), UDim2.new(0.5, 0, 1, -24), Vector2.new(0.5, 1), 40)
	U.gGarder.Activated:Connect(function() Roue.choisir(true) end)
	U.gVendre.Activated:Connect(function() Roue.choisir(false) end)
	U.gOk.Activated:Connect(function() Roue.retourEtat() end)
	U.voile = v
end

-- ════════ l'affichage de l'état ════════
local function majEtat()
	if not U.voile then return end
	local n, libre = Roue.tours(), Roue.libre()
	U.tours.Text = (n > 0) and (tr("TOURS : ", "SPINS: ") .. n) or tr("PLUS DE TOUR", "NO SPINS LEFT")
	U.tours.TextColor3 = (n > 0) and OR1 or C.terne
	U.prochain.Text = libre and tr("TOUR GRATUIT DISPONIBLE !", "FREE SPIN READY!") or (tr("GRATUIT DANS ", "FREE IN ") .. Roue.attente())
	U.prochain.TextColor3 = libre and C.menthe or C.terne
	local pa = attr("RoueParties") or 0
	U.parties.Text = string.format(tr("PARTIES : %d / %d  →  +1 TOUR", "RUNS: %d / %d  →  +1 SPIN"), pa, RO.parties)
	local id = R.produits.tours3
	U.acheterBoite.Visible = type(id) == "number" and id > 0
	U.tourner.Text = (n > 0) and tr("TOURNER", "SPIN") or tr("PLUS DE TOUR", "NO SPINS")
	U.tourner.TextSize = (n > 0) and 46 or 30
end

-- ════════ TOURNER ════════
U.angle = 0
local function segmentEnHaut(ang: number): number return math.floor(((-ang) % 360 + PAS / 2) / PAS) end
function Roue.tourner()
	if U.tourne or not U.voile or U.gain.Visible then return end
	if Roue.tours() <= 0 then
		Sons.vrai("uiRefus", nil, nil, "tap", 0.8)
		Hud.toast(tr("PLUS DE TOUR : REVIENS PLUS TARD", "NO SPINS: COME BACK LATER"), nil, "croix")
		return
	end
	U.tourne = true
	U.tourner.Text = "..."
	task.spawn(function()
		local ok, res = ctx.action("roue")
		if not ok or type(res) ~= "table" or not RO.cases[res.case] then
			U.tourne = false
			majEtat()
			Hud.toast(tr("LA ROUE EST COINCEE, REESSAIE", "THE WHEEL IS STUCK, TRY AGAIN"), nil, "croix")
			return
		end
		Sons.jouer("go", 1.2, 0.6)
		-- 5 tours pleins, puis la case tirée sous l'aiguille (un peu décalée dans sa case : une vraie roue ne s'arrête jamais pile au milieu)
		local a0 = U.angle % 360
		local cible = -((res.case - 1) * PAS) + (math.random() - 0.5) * PAS * 0.62
		local d = ((cible - a0) % 360) + 360 * 5
		local T, t = 5.4, 0
		local dernier = segmentEnHaut(a0)
		local cn: RBXScriptConnection
		cn = RunService.RenderStepped:Connect(function(dt: number)
			t += dt
			local u = math.min(1, t / T)
			local e = 1 - (1 - u) ^ 4
			U.angle = a0 + d * e
			U.disque.Rotation = U.angle
			local s = segmentEnHaut(U.angle)
			if s ~= dernier then
				dernier = s
				Sons.jouer("bip", 1.6 - 0.5 * u, 0.32) -- (le cliquet : il ralentit avec la roue)
				U.aiguille.Rotation = -14
				Hud.vibre(4)
			end
			U.aiguille.Rotation *= 0.82
			-- les ampoules : une sur deux, en alternance — de plus en plus lentement
			local ph = math.floor(os.clock() * (4 + 10 * (1 - u))) % 2
			for i, a in U.ampoules do a.BackgroundColor3 = ((i + ph) % 2 == 0) and Color3.new(1, 1, 1) or RGB(255, 170, 30) end
			if u >= 1 then
				cn:Disconnect()
				U.aiguille.Rotation = 0
				U.tourne = false
				Roue.reveler(res)
			end
		end)
	end)
end

-- ════════ LE GAIN ════════
function Roue.reveler(res: any)
	U.res = res
	U.etat.Visible = false
	U.gain.Visible = true
	U.gVue:ClearAllChildren()
	local pi = U.gain:FindFirstChild("Pinceau")
	if pi then pi:Destroy() end
	if U.gModele then
		Caisse.rendre(U.gModele)
		U.gModele = nil
	end
	local c = RO.cases[res.case]
	local caisse = res.caisse
	U.gMontant.Visible = res.gain ~= nil
	U.gVue.Visible = caisse ~= nil
	U.gNom.Visible = caisse ~= nil or res.habit ~= nil
	U.gGarder.Parent.Parent.Visible = caisse ~= nil
	U.gVendre.Parent.Parent.Visible = caisse ~= nil
	U.gOk.Parent.Parent.Visible = caisse == nil
	U.gNote.Text = ""
	if caisse then
		local f = Catalogue[caisse]
		U.gTete.Text = tr("UNE CAISSE !", "A CAR!")
		U.gNom.Text = string.upper(FR and f.nom or (f.en or f.nom))
		U.gNom.Position = UDim2.fromOffset(15, 214)
		U.gModele = photographier(U.gVue, caisse)
		U.gVendre.Text = tr("LA VENDRE\n", "SELL IT\n") .. Hud.argent(RO.revente)
		Sons.jouer("record")
		Hud.vibre(60)
	elseif res.habit then
		local d = Config.habit(res.habit[1], res.habit[2])
		U.gTete.Text = tr("UN SKIN !", "A SKIN!")
		U.gNom.Text = d and string.upper(FR and d.nom or d.en) or "?"
		U.gNom.Position = UDim2.fromOffset(15, 70)
		-- (le pinceau, à la couleur du skin)
		local ic = K.icone(U.gVue, "pinceau", 7, (d and d.c) or (d and d.arcenciel and C.magenta) or OR1, UDim2.new(0.5, 0, 0, 132), Vector2.new(0.5, 0.5))
		ic.Parent = U.gain
		ic.Name = "Pinceau"
		U.gNote.Text = tr("Il t'attend au GARAGE, onglet ", "It's waiting in the GARAGE, tab ") .. ((res.habit[1] == "peinture") and tr("PEINTURE.", "PAINT.") or tr("TRAINEES.", "TRAILS."))
		Sons.jouer("record")
		Hud.vibre(40)
	else
		local jack = c.jackpot == true
		U.gTete.Text = jack and "JACKPOT !!!" or tr("GAGNE !", "YOU WIN!")
		U.gMontant.Text = "+" .. Hud.argent(res.gain)
		U.gNote.Text = (c.k ~= "argent") and tr("(Tu avais déjà tout : la case paie.)", "(You already had it all: the slot pays out.)") or ""
		Sons.jouer(jack and "record" or "encaisse")
		Hud.vibre(jack and 120 or 30)
	end
	-- le gain BONDIT
	local sc = U.gain:FindFirstChildOfClass("UIScale") or inst("UIScale", {}, U.gain)
	sc.Scale = 0.6
	TweenService:Create(sc, TweenInfo.new(0.28, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Scale = 1 }):Play()
end
-- la caisse gagnée : la garder (équipée) ou la vendre
function Roue.choisir(garder: boolean)
	local res = U.res
	if not res or not res.caisse or U.choix then return end
	U.choix = true
	task.spawn(function()
		local ok = ctx.action(garder and "roueGarder" or "roueVendre", res.caisse)
		U.choix = false
		if ok then
			if garder then
				if ctx.surEquipe then ctx.surEquipe(res.caisse) end
				Sons.jouer("maillon")
				Hud.toast(tr("NOUVELLE CAISSE AU GARAGE", "NEW CAR IN THE GARAGE"), OR1, "voiture")
			else
				Sons.jouer("encaisse")
				Hud.toast(tr("VENDUE  +", "SOLD  +") .. Hud.argent(RO.revente), C.menthe, "piece")
			end
			U.res = nil -- (choisi : rien à garder d'office en sortant)
		end
		Roue.retourEtat()
	end)
end
function Roue.retourEtat()
	if U.res and U.res.caisse and not U.choix and U.gGarder.Parent.Parent.Visible then
		-- (fermer sans choisir : la caisse reste au garage — elle est déjà à toi)
		task.spawn(function() ctx.action("roueGarder", U.res.caisse) end)
	end
	U.res = nil
	U.gain.Visible = false
	U.etat.Visible = true
	majEtat()
end

-- ════════ ouvrir / fermer ════════
function Roue.ouvrir()
	if not U.voile then creer() end
	if U.voile.Visible then return end
	U.gain.Visible = false
	U.etat.Visible = true
	majEtat()
	U.voile.Visible = true
	Sons.vrai("uiModale", nil, nil, "tap", 1.1, 0.5)
	local sc = U.voile:FindFirstChildOfClass("UIScale") or inst("UIScale", {}, U.voile)
	sc.Scale = 0.92
	TweenService:Create(sc, TweenInfo.new(0.22, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { Scale = 1 }):Play()
end
function Roue.fermer()
	if not U.voile or U.tourne then return end
	if U.gain.Visible then Roue.retourEtat() end
	U.voile.Visible = false
	if ctx.surFerme then ctx.surFerme() end
end
function Roue.ouverte(): boolean return U.voile ~= nil and U.voile.Visible end

-- ════════ la carte de l'ÉCRAN DE FIN (à la place de l'ancien défi) : Hud.defi ════════
function Roue.carte(): any
	local n, libre = Roue.tours(), Roue.libre()
	local pa = attr("RoueParties") or 0
	local faits = {}
	for i = 1, 3 do faits[i] = pa >= i end
	return {
		tete = tr("LA ROUE", "THE WHEEL"),
		reussi = n > 0,
		texte = (n > 0) and string.format(tr("%d TOUR%s A JOUER !", "%d SPIN%s TO PLAY!"), n, n > 1 and "S" or "")
			or string.format(tr("ENCORE %d PARTIE%s\nPOUR UN TOUR", "%d MORE RUN%s\nFOR A SPIN"), RO.parties - pa, (RO.parties - pa) > 1 and "S" or ""),
		part = pa / RO.parties,
		prime = libre and tr("GRATUIT : PRET", "FREE: READY") or (tr("GRATUIT DANS ", "FREE IN ") .. Roue.attente()),
		rec = (n > 0) and tr("TOURNER >", "SPIN >") or "",
		recCouleur = OR1,
		faits = faits,
	}
end

-- ════════ le branchement ════════
-- c = { action = function(nom, ...) → ok, res ; surEquipe = function(i) ; info = TextLabel du bouton du menu (le compte des tours) }
function Roue.init(c: any)
	ctx = c
	-- le TICKET du menu et la carte de fin vivent : tours, compte à rebours (deux fois par seconde)
	local t0 = 0
	RunService.RenderStepped:Connect(function()
		if os.clock() - t0 < 0.5 then
			if U.voile and U.voile.Visible and not U.tourne then
				-- (les ampoules respirent au repos)
				local ph = math.floor(os.clock() * 2) % 2
				for i, a in U.ampoules do a.BackgroundColor3 = ((i + ph) % 2 == 0) and Color3.new(1, 1, 1) or RGB(255, 170, 30) end
			end
			return
		end
		t0 = os.clock()
		local n = Roue.tours()
		if c.info then
			c.info.Text = (n > 0) and ("x" .. n) or Roue.attente()
			c.info.TextColor3 = (n > 0) and OR1 or C.terne
		end
		if c.pastille then c.pastille.Visible = n > 0 end
		local e = Hud.ecranCourant()
		if e == "mort" then Hud.defi(Roue.carte()) end
		if U.voile and U.voile.Visible and not U.tourne and not U.gain.Visible then majEtat() end
		if U.voile and U.voile.Visible and e ~= "menu" and e ~= "mort" then Roue.fermer() end
	end)
	-- (banc) workspace:SetAttribute("DbgRoue", "ouvrir…" | "tourner…" | "garder…" | "vendre…" | "ok…" | "fermer…")
	workspace:GetAttributeChangedSignal("DbgRoue"):Connect(function()
		local q = tostring(workspace:GetAttribute("DbgRoue") or "")
		if string.find(q, "^ouvrir") then Roue.ouvrir()
		elseif string.find(q, "^tourner") then Roue.tourner()
		elseif string.find(q, "^garder") then Roue.choisir(true)
		elseif string.find(q, "^vendre") then Roue.choisir(false)
		elseif string.find(q, "^ok") then Roue.retourEtat()
		elseif string.find(q, "^fermer") then Roue.fermer() end
	end)
end

return Roue
