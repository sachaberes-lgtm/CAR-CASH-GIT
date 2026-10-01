-- CASH CAR — L'INTERFACE (menu, course, pause, réglages, mort), calquée sur la VERSION PRINCIPALE web.
-- Références : captures du jeu web à 1280×720 (menu CHUTE, course, écran de mort) — même disposition :
--   · MENU : le logo CASH CAR en haut à droite (or, barre tricolore rose/cyan/or dessous), ⚙ à droite,
--     JOUER en grandes lettres d'or en bas à droite ; la caisse qui pique à gauche, au-dessus des nuages.
--   · COURSE : ⚡ + la grande barre de NITRO en haut à gauche, AURA dessous ; en haut à droite la pause
--     cyan puis l'ARGENT vert et le chrono d'AIR ; le bouton NITRO en bas à droite ; la bannière du niveau.
--   · MORT : « NOUVEAU RECORD ! », le panneau vert VERSÉ AU COMPTE, AURA, MOTEUR ATTEINT, les stats,
--     HOME et le grand REJOUER doré.
-- Roblox n'a ni biais (skew) ni découpe (clip-path) : les plaques restent droites, le reste suit le web.
-- Police pixel (Press Start 2P, livrée avec Roblox), sans accents sur les capitales (elle ne les a pas).
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local GuiService = game:GetService("GuiService")

local Controles = require(script.Parent:WaitForChild("Controles"))
local Sons = require(script.Parent:WaitForChild("Sons"))

local Hud = {}

-- ── la langue : français si le compte Roblox est en français, anglais sinon ──
local FR = string.sub(Players.LocalPlayer.LocaleId or "fr", 1, 2) == "fr"
Hud.FR = FR
local T = FR and {
	jouer = "JOUER", rejouer = "REJOUER", menu = "HOME", reprendre = "REPRENDRE", recommencer = "RECOMMENCER",
	pause = "PAUSE", son = "SON", musique = "MUSIQUE", record = "RECORD", nouveau = "NOUVEAU RECORD !",
	reglages = "REGLAGES", fermer = "FERMER", verse = "VERSE AU COMPTE", compte = "COMPTE :", meilleur = "MEILLEUR",
	moteurAtteint = "MOTEUR ATTEINT", palier = "PALIER", encore = "ENCORE %d PIECES POUR", moteurMax = "LE PLUS GROS MOTEUR",
	multiMax = "MULTI MAX", kmhMax = "KM/H MAX", zone = "ZONE", figures = "FIGURES", distance = "DISTANCE", pieces = "PIECES",
	aura = "AURA", moteur = "MOTEUR", nitro = "NITRO", air = "AIR", go = "GO !", niveau = "MER DE NUAGES",
	astuce = "ASTUCE", glisse = "GLISSE POUR\nTOURNER", chargement = "LA ROUTE SE CONSTRUIT",
		missions = "MISSIONS", garage = "GARAGE", carriere = "CARRIERE", boutique = "BOUTIQUE", bientot = "BIENTOT DISPONIBLE",
		facile = "MODE FACILE", choisis = "CHOISIS TON MODE", normal = "NORMAL", facileMot = "FACILE",
		facileTxt = "En FACILE, la voiture suit mieux les virages, tu restes plus longtemps en l'air et tu as 3 vies. Tu pourras changer dans les réglages.",
		vies = "PLUS QUE %d VIES", derniereVie = "DERNIERE VIE !", onRepart = "ON REPART !",
	astuces = {
		"Sors par le BORD de la route : tu voles, et tu te poses plus bas. C'est là que le jeu se joue.",
		"En l'air : flèche HAUT = plonge, flèche BAS = monte. Gauche / droite = les vrilles.",
		"Chaque pièce fait monter ton MOTEUR : plus de pièces, plus de vitesse.",
	},
	astucesTactile = {
		"Sors par le BORD de la route : tu voles, et tu te poses plus bas. C'est là que le jeu se joue.",
		"En l'air : pouce en HAUT = plonge, en BAS = monte. Gauche / droite = les vrilles.",
		"Chaque pièce fait monter ton MOTEUR : plus de pièces, plus de vitesse.",
	},
	morts = { air = "TROP LONGTEMPS EN L'AIR", vide = "AVALE PAR LE VIDE", arret = "EN PANNE SECHE", autre = "GAME OVER" },
} or {
	jouer = "PLAY", rejouer = "PLAY AGAIN", menu = "HOME", reprendre = "RESUME", recommencer = "RESTART",
	pause = "PAUSE", son = "SOUND", musique = "MUSIC", record = "BEST", nouveau = "NEW RECORD!",
	reglages = "SETTINGS", fermer = "CLOSE", verse = "PAID TO ACCOUNT", compte = "ACCOUNT:", meilleur = "BEST",
	moteurAtteint = "ENGINE REACHED", palier = "TIER", encore = "%d MORE COINS FOR", moteurMax = "THE BIGGEST ENGINE",
	multiMax = "MAX MULTI", kmhMax = "MAX KM/H", zone = "ZONE", figures = "TRICKS", distance = "DISTANCE", pieces = "COINS",
	aura = "AURA", moteur = "ENGINE", nitro = "NITRO", air = "AIR", go = "GO!", niveau = "SEA OF CLOUDS",
	astuce = "TIP", glisse = "SWIPE TO\nSTEER", chargement = "BUILDING THE ROAD",
		missions = "MISSIONS", garage = "GARAGE", carriere = "CAREER", boutique = "SHOP", bientot = "COMING SOON",
		facile = "EASY MODE", choisis = "PICK YOUR MODE", normal = "NORMAL", facileMot = "EASY",
		facileTxt = "In EASY, the car follows the turns better, you stay longer in the air and you get 3 lives. You can change it in the settings.",
		vies = "%d LIVES LEFT", derniereVie = "LAST LIFE!", onRepart = "BACK ON THE ROAD!",
	astuces = {
		"Leave the road by the EDGE: you fly, and land lower down. That's where the game is.",
		"In the air: UP arrow = dive, DOWN arrow = climb. Left / right = spins.",
		"Every coin grows your ENGINE: more coins, more speed.",
	},
	astucesTactile = {
		"Leave the road by the EDGE: you fly, and land lower down. That's where the game is.",
		"In the air: thumb UP = dive, DOWN = climb. Left / right = spins.",
		"Every coin grows your ENGINE: more coins, more speed.",
	},
	morts = { air = "TOO LONG IN THE AIR", vide = "SWALLOWED BY THE VOID", arret = "OUT OF GAS", autre = "GAME OVER" },
}
Hud.T = T

-- ── la palette du web (charte v4/v5 : carbone, or, néon) ──
local PIX = Font.new("rbxasset://fonts/families/PressStart2P.json")
local TXT = Font.new("rbxasset://fonts/families/BuilderSans.json", Enum.FontWeight.Bold)
local C = {
	or_ = Color3.fromRGB(255, 215, 94), orFonce = Color3.fromRGB(255, 170, 20), orSh = Color3.fromRGB(150, 96, 12),
	cyan = Color3.fromRGB(0, 234, 255), rose = Color3.fromRGB(255, 110, 200), magenta = Color3.fromRGB(255, 62, 200),
	rouge = Color3.fromRGB(255, 94, 122), vert = Color3.fromRGB(98, 224, 98), menthe = Color3.fromRGB(150, 255, 190),
	orange = Color3.fromRGB(255, 128, 32), lavande = Color3.fromRGB(190, 180, 255),
	carbone = Color3.fromRGB(26, 22, 48), carbone2 = Color3.fromRGB(34, 28, 62), trait = Color3.fromRGB(64, 56, 110),
	nuit = Color3.fromRGB(16, 10, 36), piste = Color3.fromRGB(22, 18, 52),
	texte = Color3.fromRGB(236, 240, 255), texte2 = Color3.fromRGB(180, 200, 255), terne = Color3.fromRGB(143, 132, 200),
	encre = Color3.fromRGB(8, 6, 20),
	-- anciens noms (le pilote s'en sert)
	plaque = Color3.fromRGB(34, 48, 92), plaqueSh = Color3.fromRGB(6, 18, 46),
}
Hud.C = C
local RAPIDE = TweenInfo.new(0.09, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local LENTE = TweenInfo.new(0.32, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)

local function inst(classe: string, props: { [string]: any }, parent: Instance?): any
	local o = Instance.new(classe)
	for k, v in props do (o :: any)[k] = v end
	if parent then o.Parent = parent end
	return o
end
local function texte(parent: Instance, props: { [string]: any }): TextLabel
	local t = inst("TextLabel", {
		BackgroundTransparency = 1, FontFace = PIX, TextColor3 = C.texte, TextSize = 16,
		Size = UDim2.new(1, 0, 0, 24), TextWrapped = true,
	}, parent)
	for k, v in props do
		if k ~= "epais" and k ~= "contour" and k ~= "contourCouleur" then (t :: any)[k] = v end
	end
	if props.contour ~= false then
		inst("UIStroke", { Color = props.contourCouleur or C.encre, Thickness = props.epais or 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual }, t)
	end
	return t
end
local function degrade(parent: Instance, a: Color3, b: Color3, rot: number?)
	inst("UIGradient", { Color = ColorSequence.new(a, b), Rotation = rot or 90 }, parent)
end
-- une plaque de CARBONE (le fond de tous les panneaux du web) avec son filet de couleur à gauche
local function carbone(parent: Instance, taille: UDim2, pos: UDim2, filet: Color3?, ancre: Vector2?): Frame
	local f = inst("Frame", { BackgroundColor3 = C.carbone, BorderSizePixel = 0, Size = taille, Position = pos,
		AnchorPoint = ancre or Vector2.zero }, parent)
	degrade(f, C.carbone2, C.carbone, 90)
	inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, f)
	if filet then
		inst("Frame", { BackgroundColor3 = filet, BorderSizePixel = 0, Size = UDim2.new(0, 6, 1, 0) }, f)
	end
	return f
end

local function retour(b: GuiButton, cible: GuiObject)
	local p0 = cible.Position
	b.MouseButton1Down:Connect(function()
		TweenService:Create(cible, RAPIDE, { Position = p0 + UDim2.fromOffset(0, 4) }):Play()
	end)
	local function relache() TweenService:Create(cible, RAPIDE, { Position = p0 }):Play() end
	b.MouseButton1Up:Connect(relache)
	b.MouseLeave:Connect(relache)
	b.Activated:Connect(function()
		Sons.jouer("tap")
		pcall(function()
			local HS = game:GetService("HapticService")
			if HS:IsVibrationSupported(Enum.UserInputType.Gamepad1) then
				HS:SetMotor(Enum.UserInputType.Gamepad1, Enum.VibrationMotor.Small, 0.4)
				task.delay(0.06, function() HS:SetMotor(Enum.UserInputType.Gamepad1, Enum.VibrationMotor.Small, 0) end)
			end
		end)
	end)
end

-- une TUILE du web : carbone + filet coloré + pictogramme + libellé
local function tuile(parent: Instance, libelle: string, filet: Color3, taille: UDim2, pos: UDim2, ancre: Vector2?, corps: number?): TextButton
	local f = carbone(parent, taille, pos, filet, ancre)
	local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), FontFace = PIX, Text = libelle,
		TextColor3 = C.texte, TextSize = corps or 16, AutoButtonColor = false }, f)
	inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual }, b)
	retour(b, f)
	return b
end

-- le GRAND bouton doré (REJOUER, REPRENDRE) : dégradé or, texte encre
local function lingot(parent: Instance, libelle: string, taille: UDim2, pos: UDim2, ancre: Vector2?, corps: number?): TextButton
	local f = inst("Frame", { BackgroundColor3 = C.or_, BorderSizePixel = 0, Size = taille, Position = pos, AnchorPoint = ancre or Vector2.zero }, parent)
	degrade(f, Color3.fromRGB(255, 244, 150), Color3.fromRGB(255, 168, 0), 90)
	inst("UIStroke", { Color = C.orSh, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, f)
	local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), FontFace = PIX, Text = libelle,
		TextColor3 = Color3.fromRGB(40, 22, 4), TextSize = corps or 34, AutoButtonColor = false }, f)
	retour(b, f)
	return b
end

-- le KIT d'interface, prêté aux autres écrans (garage, missions, carrière…) : une seule charte
Hud.kit = { inst = inst, texte = texte, degrade = degrade, carbone = carbone, tuile = tuile, lingot = lingot, retour = retour,
	PIX = PIX, TXT = TXT, RAPIDE = RAPIDE, LENTE = LENTE }

-- ── les formats d'argent (fmtC, L12383) ──
local UNITES = FR and { { 1e15, "Bd" }, { 1e12, "Bn" }, { 1e9, "Md" }, { 1e6, "M" }, { 1e3, "k" } }
	or { { 1e15, "Qa" }, { 1e12, "T" }, { 1e9, "B" }, { 1e6, "M" }, { 1e3, "k" } }
function Hud.nombre(v: number): string
	local s
	if v < 1000 then
		s = string.format("%.2f", v)
	else
		s = string.format("%.0f", v)
		for _, u in UNITES do
			if v >= u[1] * 0.9995 then
				local q = v / u[1]
				s = (q < 100 and string.format("%.1f", q) or string.format("%.0f", q)) .. " " .. u[2]
				break
			end
		end
	end
	if FR then s = string.gsub(s, "%.", ",") end
	return s
end
function Hud.argent(v: number): string
	if v < 1000 and v == math.floor(v) then return "$ " .. tostring(v) end -- un montant rond s'écrit sans centimes (les primes, les prix)
	return "$ " .. Hud.nombre(v)
end
function Hud.compte(v: number): string
	local s = tostring(math.floor(v + 0.5))
	local out = string.reverse(string.gsub(string.reverse(s), "(%d%d%d)", FR and "%1 " or "%1,"))
	out = string.gsub(out, "^[ ,]", "")
	return (FR and "$ " or "$") .. out
end
function Hud.entier(v: number): string
	local s = tostring(math.floor(v + 0.5))
	local out = string.reverse(string.gsub(string.reverse(s), "(%d%d%d)", "%1 "))
	return (string.gsub(out, "^ ", ""))
end

-- ════════════════════════════════════════════════════════════════════════════════════════════════
local gui: ScreenGui
local E = {} -- les éléments qu'on met à jour
Hud.E = E

function Hud.creer()
	local pg = Players.LocalPlayer:WaitForChild("PlayerGui")
	gui = inst("ScreenGui", {
		Name = "CashCar", ResetOnSpawn = false, IgnoreGuiInset = false, ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
		ScreenInsets = Enum.ScreenInsets.CoreUISafeInsets, DisplayOrder = 5,
	}, pg)
	local tactile = UserInputService.TouchEnabled and not UserInputService.KeyboardEnabled
	-- tout est dessiné pour un écran de 720 px de haut : une RACINE de 1/k de l'écran, agrandie k fois
	local racine = inst("Frame", { Name = "Racine", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, gui)
	Hud.racine = racine -- les autres écrans (garage…) se posent dans la même racine mise à l'échelle
	local echelle = inst("UIScale", {}, racine)
	local function recaler()
		local cam = workspace.CurrentCamera
		local h = cam and cam.ViewportSize.Y or 720
		local k = math.clamp(h / 720, tactile and 0.8 or 0.5, 1.5)
		echelle.Scale = k
		racine.Size = UDim2.fromScale(1 / k, 1 / k)
	end
	recaler()
	if workspace.CurrentCamera then workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize"):Connect(recaler) end
	local gStick = inst("ScreenGui", { Name = "CashCarStick", ResetOnSpawn = false, IgnoreGuiInset = true,
		ScreenInsets = Enum.ScreenInsets.None, DisplayOrder = 6 }, pg)

	-- ══ CHARGEMENT ══
	E.charge = inst("Frame", { BackgroundColor3 = C.nuit, Size = UDim2.fromScale(1, 1), ZIndex = 50 }, racine)
	local lg = texte(E.charge, { Text = "CASH CAR", TextSize = 64, TextColor3 = C.or_, Size = UDim2.new(1, 0, 0, 80),
		Position = UDim2.fromScale(0, 0.34), ZIndex = 51, epais = 4 })
	degrade(lg, Color3.fromRGB(255, 244, 170), C.orFonce, 90)
	E.chargeTxt = texte(E.charge, { Text = T.chargement, TextSize = 14, TextColor3 = C.texte2, Position = UDim2.fromScale(0, 0.52), ZIndex = 51 })

	-- ══ MENU (la CHUTE) ══
	local menu = inst("Frame", { Name = "Menu", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, racine)
	E.menu = menu
	-- le logo, en haut à droite, et sa barre tricolore
	local logo = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(620, 150), Position = UDim2.new(1, -40, 0, 20),
		AnchorPoint = Vector2.new(1, 0) }, menu)
	local ombre = texte(logo, { Text = "CASH CAR", TextSize = 80, TextColor3 = Color3.fromRGB(90, 40, 10), Size = UDim2.new(1, 0, 0, 90),
		Position = UDim2.fromOffset(6, 8), TextXAlignment = Enum.TextXAlignment.Right, contour = false })
	ombre.TextTransparency = 0.1
	local titre = texte(logo, { Text = "CASH CAR", TextSize = 80, TextColor3 = C.or_, Size = UDim2.new(1, 0, 0, 90),
		TextXAlignment = Enum.TextXAlignment.Right, epais = 4, contourCouleur = Color3.fromRGB(60, 24, 6) })
	-- (le LOGO est la seule dérogation de la charte au texte en dégradé : c'est une image de marque)
	inst("UIGradient", { Rotation = 90, Color = ColorSequence.new({
		ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 246, 180)), ColorSequenceKeypoint.new(0.5, Color3.fromRGB(255, 196, 40)),
		ColorSequenceKeypoint.new(1, Color3.fromRGB(255, 120, 90)) }) }, titre)
	E.titre = titre
	local barre = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(0, 540, 0, 8), Position = UDim2.new(1, -20, 0, 108),
		AnchorPoint = Vector2.new(1, 0) }, logo)
	for i, c in { C.magenta, C.cyan, C.or_ } do
		inst("Frame", { BackgroundColor3 = c, BorderSizePixel = 0, Size = UDim2.new(i == 1 and 0.4 or 0.28, -8, 1, 0),
			Position = UDim2.fromScale(i == 1 and 0 or (i == 2 and 0.4 or 0.68), 0) }, barre)
	end
	E.menuRecord = texte(logo, { Text = "", TextSize = 14, TextColor3 = C.vert, Position = UDim2.fromOffset(0, 126),
		TextXAlignment = Enum.TextXAlignment.Right, Size = UDim2.new(1, -20, 0, 20) })
	-- la colonne de droite du web (#mHome) : MISSIONS + ⚙, puis GARAGE · CARRIERE · BOUTIQUE, puis JOUER en lettres d'or
	E.btMissions = tuile(menu, "◎ " .. T.missions, C.vert, UDim2.fromOffset(282, 52), UDim2.new(1, -388, 1, -220), nil, 14)
	E.btReglages = tuile(menu, "⚙", C.cyan, UDim2.fromOffset(58, 52), UDim2.new(1, -98, 1, -220), nil, 24)
	E.btGarage = tuile(menu, T.garage, C.cyan, UDim2.fromOffset(112, 60), UDim2.new(1, -388, 1, -160), nil, 11)
	E.btCarriere = tuile(menu, T.carriere, C.cyan, UDim2.fromOffset(112, 60), UDim2.new(1, -270, 1, -160), nil, 11)
	E.btBoutique = tuile(menu, T.boutique, C.magenta, UDim2.fromOffset(112, 60), UDim2.new(1, -152, 1, -160), nil, 11)
	local jouer = inst("TextButton", { BackgroundTransparency = 1, AutoButtonColor = false, Size = UDim2.fromOffset(348, 70),
		Position = UDim2.new(1, -214, 1, -18), AnchorPoint = Vector2.new(0.5, 1), FontFace = PIX, Text = T.jouer, TextSize = 56,
		TextColor3 = C.or_ }, menu)
	inst("UIStroke", { Color = Color3.fromRGB(60, 24, 6), Thickness = 4, ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual }, jouer)
	inst("UIGradient", { Rotation = 90, Color = ColorSequence.new(Color3.fromRGB(255, 244, 170), C.orFonce) }, jouer)
	retour(jouer, jouer)
	E.btJouer = jouer

	-- ══ COURSE ══
	local hud = inst("Frame", { Name = "Course", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, racine)
	E.hud = hud
	-- ⚡ + la barre de nitro
	texte(hud, { Text = "⚡", TextSize = 38, FontFace = TXT, Size = UDim2.fromOffset(44, 48), Position = UDim2.fromOffset(20, 18), contour = false })
	local fondN = inst("Frame", { BackgroundColor3 = C.piste, BorderSizePixel = 0, Size = UDim2.new(0.46, 0, 0, 38),
		Position = UDim2.fromOffset(72, 22) }, hud)
	inst("UIStroke", { Color = C.encre, Thickness = 4, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, fondN)
	E.nitro = inst("Frame", { BackgroundColor3 = C.orange, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1) }, fondN)
	inst("UIGradient", { Rotation = 90, Color = ColorSequence.new({
		ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 200, 110)), ColorSequenceKeypoint.new(0.45, Color3.fromRGB(255, 140, 40)),
		ColorSequenceKeypoint.new(1, Color3.fromRGB(220, 80, 10)) }) }, E.nitro)
	inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.new(0, 6, 1, 0),
		Position = UDim2.fromScale(1, 0), AnchorPoint = Vector2.new(1, 0) }, E.nitro)
	-- AURA
	local aura = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(400, 40), Position = UDim2.fromOffset(20, 84) }, hud)
	local rond = inst("Frame", { BackgroundColor3 = C.nuit, BorderSizePixel = 0, Size = UDim2.fromOffset(34, 34) }, aura)
	inst("UIStroke", { Color = C.magenta, Thickness = 4, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, rond)
	inst("UICorner", { CornerRadius = UDim.new(0.5, 0) }, rond)
	E.aura = texte(aura, { Text = T.aura, TextSize = 15, TextColor3 = Color3.fromRGB(255, 200, 250), TextXAlignment = Enum.TextXAlignment.Left,
		Size = UDim2.new(1, -46, 1, 0), Position = UDim2.fromOffset(46, 0) })
	-- en haut à droite : la pause cyan, l'argent, le chrono d'air
	local pauseF = inst("Frame", { BackgroundColor3 = C.cyan, BorderSizePixel = 0, Size = UDim2.fromOffset(74, 70),
		Position = UDim2.new(1, -22, 0, 16), AnchorPoint = Vector2.new(1, 0) }, hud)
	degrade(pauseF, Color3.fromRGB(80, 240, 255), Color3.fromRGB(0, 130, 190), 90)
	inst("UIStroke", { Color = C.encre, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, pauseF)
	E.btPause = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), FontFace = PIX, Text = "II",
		TextSize = 26, TextColor3 = Color3.fromRGB(0, 50, 80), AutoButtonColor = false }, pauseF)
	retour(E.btPause, pauseF)
	E.coeurs = texte(hud, { Text = "", RichText = true, TextSize = 24, TextColor3 = C.rouge, Size = UDim2.fromOffset(120, 30),
		Position = UDim2.new(1, -108, 0, 36), AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, FontFace = TXT, Visible = false })
	E.argent = texte(hud, { Text = "", RichText = true, TextSize = 40, TextColor3 = C.vert, Size = UDim2.new(0, 460, 0, 48),
		Position = UDim2.new(1, -22, 0, 96), AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, epais = 3 })
	E.air = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(200, 50), Position = UDim2.new(1, -22, 0, 152),
		AnchorPoint = Vector2.new(1, 0), Visible = false }, hud)
	E.airTxt = texte(E.air, { Text = "", RichText = true, TextSize = 26, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 30),
		TextXAlignment = Enum.TextXAlignment.Right })
	local fondA = inst("Frame", { BackgroundColor3 = C.piste, BorderSizePixel = 0, Size = UDim2.new(0, 120, 0, 14),
		Position = UDim2.new(1, 0, 0, 34), AnchorPoint = Vector2.new(1, 0) }, E.air)
	inst("UIStroke", { Color = C.encre, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, fondA)
	E.airFill = inst("Frame", { BackgroundColor3 = C.cyan, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1) }, fondA)
	E.pouvoir = texte(hud, { Text = "", TextSize = 14, TextColor3 = C.or_, Size = UDim2.new(0, 460, 0, 20),
		Position = UDim2.new(1, -22, 0, 208), AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right })
	-- le centre : la bannière du niveau, les figures, la chaîne
	E.grand = texte(hud, { Text = "", TextSize = 38, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 60), Position = UDim2.fromScale(0, 0.33), epais = 4 })
	E.pop = texte(hud, { Text = "", TextSize = 22, TextColor3 = C.or_, Size = UDim2.new(1, 0, 0, 34), Position = UDim2.fromScale(0, 0.22), epais = 3 })
	E.chaine = texte(hud, { Text = "", TextSize = 16, TextColor3 = C.cyan, Size = UDim2.new(1, 0, 0, 24), Position = UDim2.new(0, 0, 0.22, 38) })
	-- la carte ASTUCE
	E.astuce = carbone(hud, UDim2.fromOffset(470, 90), UDim2.new(0.5, 0, 0.26, 0), C.cyan, Vector2.new(0.5, 0))
	E.astuce.Visible = false
	texte(E.astuce, { Text = "⚡", FontFace = TXT, TextSize = 30, Size = UDim2.fromOffset(50, 50), Position = UDim2.fromOffset(16, 18), contour = false })
	texte(E.astuce, { Text = T.astuce, TextSize = 14, TextColor3 = C.texte2, TextXAlignment = Enum.TextXAlignment.Left,
		Size = UDim2.new(1, -90, 0, 20), Position = UDim2.fromOffset(76, 10) })
	E.astuceTxt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = TXT, TextSize = 18, TextColor3 = C.texte, TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, Size = UDim2.new(1, -92, 0, 56),
		Position = UDim2.fromOffset(76, 32), Text = "" }, E.astuce)
	-- la carte de l'AUTO-ÉCOLE (#coach) : l'en-tête et PASSER, le titre, la consigne, cinq pastilles
	E.coach = carbone(hud, UDim2.fromOffset(540, 118), UDim2.new(0.5, 0, 0, 236), C.vert, Vector2.new(0.5, 0))
	E.coach.Visible = false
	E.coachTete = texte(E.coach, { Text = "", TextSize = 10, TextColor3 = C.terne, Size = UDim2.new(1, -180, 0, 14), Position = UDim2.fromOffset(22, 12),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	E.coachTitre = texte(E.coach, { Text = "", TextSize = 20, TextColor3 = C.texte, Size = UDim2.new(1, -44, 0, 26), Position = UDim2.fromOffset(22, 32),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	E.coachTxt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = TXT, TextSize = 17, TextColor3 = C.texte2, TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, Size = UDim2.new(1, -44, 0, 40),
		Position = UDim2.fromOffset(22, 62), Text = "" }, E.coach)
	E.coachPips = {}
	for i = 1, 5 do
		E.coachPips[i] = inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.fromOffset(34, 5), Position = UDim2.new(0, 22 + (i - 1) * 40, 1, -12) }, E.coach)
	end
	E.btPasser = inst("TextButton", { BackgroundColor3 = C.carbone2, BorderSizePixel = 0, Size = UDim2.fromOffset(130, 28), Position = UDim2.new(1, -12, 0, 8),
		AnchorPoint = Vector2.new(1, 0), FontFace = PIX, Text = "", TextSize = 10, TextColor3 = C.texte2, AutoButtonColor = false }, E.coach)
	inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, E.btPasser)
	-- le bouton NITRO (en bas à droite, comme sur le web — souris et doigt)
	local nb = carbone(hud, UDim2.fromOffset(176, 140), UDim2.new(1, -22, 1, -22), nil, Vector2.new(1, 1))
	nb:FindFirstChildOfClass("UIStroke").Color = C.orange
	nb:FindFirstChildOfClass("UIStroke").Thickness = 4
	texte(nb, { Text = "⚡", FontFace = TXT, TextSize = 46, Size = UDim2.new(1, 0, 0, 56), Position = UDim2.fromOffset(0, 12), contour = false })
	texte(nb, { Text = T.nitro, TextSize = 16, Size = UDim2.new(1, 0, 0, 22), Position = UDim2.fromOffset(0, 78) })
	local fondNB = inst("Frame", { BackgroundColor3 = C.piste, BorderSizePixel = 0, Size = UDim2.new(1, -40, 0, 12), Position = UDim2.new(0, 20, 1, -26) }, nb)
	E.nitroMini = inst("Frame", { BackgroundColor3 = C.orange, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1) }, fondNB)
	E.btNitro = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, nb)
	-- l'aide tactile
	E.tactile = inst("Frame", { Name = "Tactile", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, hud)
	texte(E.tactile, { Text = T.glisse, TextSize = 14, TextColor3 = C.texte2, TextXAlignment = Enum.TextXAlignment.Left,
		Size = UDim2.fromOffset(260, 44), Position = UDim2.new(0, 22, 0.58, 0) })
	E.stickBase = inst("Frame", { BackgroundColor3 = C.plaqueSh, BackgroundTransparency = 0.35, BorderSizePixel = 0,
		Size = UDim2.fromOffset(120, 120), AnchorPoint = Vector2.new(0.5, 0.5), Visible = false }, gStick)
	inst("UIStroke", { Color = C.cyan, Thickness = 3 }, E.stickBase)
	inst("UICorner", { CornerRadius = UDim.new(0.5, 0) }, E.stickBase)
	E.stickPouce = inst("Frame", { BackgroundColor3 = C.cyan, BorderSizePixel = 0, Size = UDim2.fromOffset(52, 52),
		AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5) }, E.stickBase)
	inst("UICorner", { CornerRadius = UDim.new(0.5, 0) }, E.stickPouce)
	Hud.tactile = tactile

	-- ══ PAUSE et RÉGLAGES (le même panneau, deux sections) ══
	local voile = inst("Frame", { Name = "Pause", BackgroundColor3 = C.nuit, BackgroundTransparency = 0.25,
		Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 20 }, racine)
	E.pause = voile
	local pan = carbone(voile, UDim2.fromOffset(560, 430), UDim2.fromScale(0.5, 0.5), C.cyan, Vector2.new(0.5, 0.5))
	E.pauseTitre = texte(pan, { Text = T.pause, TextSize = 34, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 44), Position = UDim2.fromOffset(0, 26) })
	E.btSonP = tuile(pan, T.son, C.cyan, UDim2.fromOffset(230, 60), UDim2.new(0.5, -10, 0, 100), Vector2.new(1, 0), 14)
	E.btMusP = tuile(pan, T.musique, C.cyan, UDim2.fromOffset(230, 60), UDim2.new(0.5, 10, 0, 100), Vector2.new(0, 0), 14)
	E.btRecom = tuile(pan, T.recommencer, C.magenta, UDim2.fromOffset(230, 60), UDim2.new(0.5, -10, 0, 180), Vector2.new(1, 0), 14)
	E.btMenuP = tuile(pan, "⌂ " .. T.menu, C.lavande, UDim2.fromOffset(230, 60), UDim2.new(0.5, 10, 0, 180), Vector2.new(0, 0), 14)
	E.btFacile = tuile(pan, T.facile, C.vert, UDim2.fromOffset(480, 54), UDim2.new(0.5, 0, 0, 258), Vector2.new(0.5, 0), 14)
	E.btRecom.Parent.Name = "Recom"
	E.btMenuP.Parent.Name = "MenuP"
	E.btReprendre = lingot(pan, T.reprendre, UDim2.new(1, -60, 0, 84), UDim2.new(0.5, 0, 1, -30), Vector2.new(0.5, 1), 28)
	for _, d in voile:GetDescendants() do
		if d:IsA("GuiObject") then d.ZIndex = 21 end
	end

	-- ══ LE CHOIX DU MODE (à la toute première partie) ══
	local choix = inst("Frame", { Name = "Choix", BackgroundColor3 = C.nuit, BackgroundTransparency = 0.2, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 40 }, racine)
	E.choix = choix
	local pc = carbone(choix, UDim2.fromOffset(620, 330), UDim2.fromScale(0.5, 0.5), C.vert, Vector2.new(0.5, 0.5))
	texte(pc, { Text = T.choisis, TextSize = 26, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 36), Position = UDim2.fromOffset(0, 28) })
	inst("TextLabel", { BackgroundTransparency = 1, FontFace = TXT, TextSize = 19, TextColor3 = C.texte2, TextWrapped = true, Text = T.facileTxt,
		Size = UDim2.new(1, -80, 0, 96), Position = UDim2.fromOffset(40, 84) }, pc)
	E.btFacileOui = tuile(pc, "♥ " .. T.facileMot, C.vert, UDim2.fromOffset(250, 76), UDim2.new(0.5, -12, 1, -34), Vector2.new(1, 1), 20)
	E.btFacileNon = tuile(pc, "⚡ " .. T.normal, C.cyan, UDim2.fromOffset(250, 76), UDim2.new(0.5, 12, 1, -34), Vector2.new(0, 1), 20)
	for _, d in choix:GetDescendants() do
		if d:IsA("GuiObject") then d.ZIndex = 41 end
	end

	-- ══ MORT ══
	local mort = inst("Frame", { Name = "Mort", BackgroundColor3 = C.nuit, BackgroundTransparency = 0.06,
		Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 30 }, racine)
	E.mort = mort
	degrade(mort, Color3.fromRGB(34, 16, 60), Color3.fromRGB(12, 8, 30), 60)
	E.mCause = texte(mort, { Text = "", TextSize = 34, TextColor3 = C.rose, Size = UDim2.new(0.5, 0, 0, 50),
		Position = UDim2.new(0.03, 20, 0, 28), TextXAlignment = Enum.TextXAlignment.Left, epais = 3 })
	-- le panneau vert : VERSÉ AU COMPTE
	local pv = inst("Frame", { BackgroundColor3 = Color3.fromRGB(10, 54, 30), BorderSizePixel = 0, Size = UDim2.new(0.48, 0, 0, 200),
		Position = UDim2.new(0.03, 0, 0, 94) }, mort)
	degrade(pv, Color3.fromRGB(14, 74, 40), Color3.fromRGB(4, 26, 14), 90)
	inst("UIStroke", { Color = Color3.fromRGB(70, 200, 110), Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, pv)
	texte(pv, { Text = T.verse, TextSize = 15, TextColor3 = Color3.fromRGB(170, 240, 190), Position = UDim2.fromOffset(0, 18) })
	E.mRecord = texte(pv, { Text = "", TextSize = 13, TextColor3 = C.vert, Size = UDim2.fromOffset(170, 26),
		Position = UDim2.new(0.5, 0, 0, 44), AnchorPoint = Vector2.new(0.5, 0) })
	inst("UIStroke", { Color = C.vert, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border, Name = "Cadre" }, E.mRecord)
	E.mArgent = texte(pv, { Text = "", TextSize = 64, TextColor3 = C.menthe, Size = UDim2.new(1, 0, 0, 76), Position = UDim2.fromOffset(0, 76),
		epais = 4, contourCouleur = Color3.fromRGB(4, 40, 20) })
	E.mCompte = texte(pv, { Text = "", TextSize = 14, TextColor3 = Color3.fromRGB(170, 240, 190), Position = UDim2.new(0, 0, 1, -34) })
	-- AURA et MOTEUR ATTEINT
	local pa = carbone(mort, UDim2.new(0.23, 0, 0, 300), UDim2.new(0.03, 0, 0, 312), C.magenta)
	texte(pa, { Text = T.aura, TextSize = 16, TextColor3 = C.texte2, Position = UDim2.new(0, 0, 0.3, 0) })
	E.mAura = texte(pa, { Text = "0", TextSize = 44, TextColor3 = C.lavande, Size = UDim2.new(1, 0, 0, 56), Position = UDim2.new(0, 0, 0.3, 32) })
	E.mAuraMeilleur = texte(pa, { Text = "", TextSize = 13, TextColor3 = C.terne, Position = UDim2.new(0, 0, 0.3, 98) })
	local pm = carbone(mort, UDim2.new(0.24, 0, 0, 300), UDim2.new(0.27, 0, 0, 312), C.orange)
	texte(pm, { Text = T.moteurAtteint, TextSize = 14, TextColor3 = C.texte2, Position = UDim2.fromOffset(0, 16) })
	E.mMoteurNom = texte(pm, { Text = "", TextSize = 20, TextColor3 = C.or_, Size = UDim2.new(1, -20, 0, 56), Position = UDim2.fromOffset(10, 70) })
	E.mMoteurPalier = texte(pm, { Text = "", RichText = true, TextSize = 16, TextColor3 = C.texte2, Position = UDim2.fromOffset(0, 150) })
	E.mMoteurEncore = texte(pm, { Text = "", TextSize = 12, TextColor3 = Color3.fromRGB(255, 176, 40), Size = UDim2.new(1, -20, 0, 60),
		Position = UDim2.fromOffset(10, 196) })
	-- à droite : la partie, les stats, les boutons
	local pp = carbone(mort, UDim2.new(0.435, 0, 0, 200), UDim2.new(0.535, 0, 0, 94), C.vert)
	E.mPartie = texte(pp, { Text = "", TextSize = 16, TextColor3 = C.texte, Size = UDim2.new(1, -40, 1, -30), Position = UDim2.fromOffset(28, 15),
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Center, LineHeight = 1.6 })
	local ps = carbone(mort, UDim2.new(0.435, 0, 0, 120), UDim2.new(0.535, 0, 0, 312), nil)
	E.mStats = {}
	for i = 1, 4 do
		local col = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(0.25, 0, 1, 0), Position = UDim2.fromScale((i - 1) * 0.25, 0) }, ps)
		local v = texte(col, { Text = "", TextSize = 28, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 40), Position = UDim2.fromOffset(0, 22) })
		local l = texte(col, { Text = "", TextSize = 11, TextColor3 = C.lavande, Size = UDim2.new(1, 0, 0, 36), Position = UDim2.fromOffset(0, 70) })
		E.mStats[i] = { v, l }
		if i > 1 then inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.new(0, 2, 0.7, 0), Position = UDim2.fromScale(0, 0.15) }, col) end
	end
	E.btReglM = tuile(mort, "⚙ " .. T.reglages, C.cyan, UDim2.new(0.435, 0, 0, 64), UDim2.new(0.535, 0, 0, 450), nil, 15)
	E.btMenuM = tuile(mort, "⌂ " .. T.menu, C.lavande, UDim2.new(0.11, 0, 0, 90), UDim2.new(0.535, 0, 0, 530), nil, 15)
	E.btRejouer = lingot(mort, T.rejouer, UDim2.new(0.31, 0, 0, 90), UDim2.new(0.66, 0, 0, 530), nil, 34)
	for _, d in mort:GetDescendants() do
		if d:IsA("GuiObject") then d.ZIndex = 31 end
	end

	-- ══ LE TOAST : une ligne qui passe en haut de n'importe quel écran (refus d'achat, « bientôt »…) ══
	E.toast = carbone(racine, UDim2.fromOffset(520, 46), UDim2.new(0.5, 0, 0, -60), C.or_, Vector2.new(0.5, 0))
	E.toast.ZIndex = 80
	E.toast.Visible = false
	E.toastTxt = texte(E.toast, { Text = "", TextSize = 12, TextColor3 = C.texte, Size = UDim2.new(1, -24, 1, 0),
		Position = UDim2.fromOffset(14, 0), ZIndex = 81 })

	Hud.brancherTactile()
	return gui
end

local toastN = 0
function Hud.toast(txt: string, couleur: Color3?)
	toastN += 1
	local n = toastN
	E.toastTxt.Text = txt
	E.toastTxt.TextColor3 = couleur or C.texte
	E.toast.Visible = true
	TweenService:Create(E.toast, LENTE, { Position = UDim2.new(0.5, 0, 0, 14) }):Play()
	task.delay(1.9, function()
		if n ~= toastN then return end
		TweenService:Create(E.toast, LENTE, { Position = UDim2.new(0.5, 0, 0, -60) }):Play()
		task.wait(0.35)
		if n == toastN then E.toast.Visible = false end
	end)
end

-- ── le volant tactile : la moitié gauche de l'écran, le stick NAÎT sous le pouce et le suit ──
local doigt: InputObject? = nil
local origine = Vector2.zero
local COURSE_X, COURSE_Y = 54, 66
local function courbe(v: number, zm: number): number
	local a = math.abs(v)
	if a < zm then return 0 end
	return math.sign(v) * ((a - zm) / (1 - zm)) ^ 1.35
end
function Hud.brancherTactile()
	local t = Controles.tactile
	-- NITRO : au doigt ET à la souris (le bouton est aussi sur PC, comme sur le web)
	E.btNitro.InputBegan:Connect(function(io)
		if io.UserInputType == Enum.UserInputType.Touch or io.UserInputType == Enum.UserInputType.MouseButton1 then t.nitro = true end
	end)
	E.btNitro.InputEnded:Connect(function(io)
		if io.UserInputType == Enum.UserInputType.Touch or io.UserInputType == Enum.UserInputType.MouseButton1 then t.nitro = false end
	end)
	UserInputService.TouchStarted:Connect(function(io, traite)
		if traite or doigt or not E.tactile.Visible then return end
		local cam = workspace.CurrentCamera
		if io.Position.X > cam.ViewportSize.X * 0.5 then return end
		doigt = io
		origine = Vector2.new(io.Position.X, io.Position.Y)
		t.actif = true
		t.x, t.y = 0, 0
		E.stickBase.Visible = true
		E.stickBase.Position = UDim2.fromOffset(origine.X, origine.Y + GuiService:GetGuiInset().Y)
		E.stickPouce.Position = UDim2.fromScale(0.5, 0.5)
	end)
	UserInputService.TouchMoved:Connect(function(io)
		if io ~= doigt then return end
		local p = Vector2.new(io.Position.X, io.Position.Y)
		local d = p - origine
		if math.abs(d.X) > COURSE_X then origine = Vector2.new(p.X - math.sign(d.X) * COURSE_X, origine.Y) end
		if math.abs(d.Y) > COURSE_Y then origine = Vector2.new(origine.X, p.Y - math.sign(d.Y) * COURSE_Y) end
		d = p - origine
		t.x = courbe(d.X / COURSE_X, 0.06)
		t.y = courbe(-d.Y / COURSE_Y, 0.14) -- pouce vers le HAUT = PIQUÉ
		E.stickBase.Position = UDim2.fromOffset(origine.X, origine.Y + GuiService:GetGuiInset().Y)
		E.stickPouce.Position = UDim2.new(0.5, d.X * 0.6, 0.5, d.Y * 0.6)
	end)
	UserInputService.TouchEnded:Connect(function(io)
		if io ~= doigt then return end
		doigt = nil
		t.actif = false
		t.x, t.y = 0, 0
		E.stickBase.Visible = false
	end)
end

-- ── les écrans ──
local courant = ""
function Hud.ecran(nom: string)
	courant = nom
	E.charge.Visible = nom == "charge"
	E.menu.Visible = nom == "menu"
	E.hud.Visible = nom == "course" or nom == "pause"
	E.pause.Visible = nom == "pause" or nom == "reglages"
	E.mort.Visible = nom == "mort"
	E.tactile.Visible = Hud.tactile and nom == "course"
	if nom ~= "course" then
		doigt = nil
		Controles.tactile.actif = false
		Controles.tactile.nitro = false
		E.stickBase.Visible = false
	end
	-- le même panneau sert à la pause (en course) et aux réglages (au menu / à la mort)
	local reg = nom == "reglages"
	E.pauseTitre.Text = reg and T.reglages or T.pause
	E.btRecom.Parent.Visible = not reg
	E.btMenuP.Parent.Visible = not reg
	E.btReprendre.Text = reg and T.fermer or T.reprendre
	if nom == "menu" or nom == "mort" then
		local f = nom == "menu" and E.menu or E.mort
		f.Position = UDim2.fromOffset(0, 24)
		TweenService:Create(f, LENTE, { Position = UDim2.fromOffset(0, 0) }):Play()
	end
end
function Hud.ecranCourant(): string return courant end

-- ── la course ──
local popFin = 0
function Hud.pop(txt: string, couleur: Color3?, taille: number?)
	E.pop.Text = txt
	E.pop.TextColor3 = couleur or C.or_
	E.pop.TextSize = taille or 22
	E.pop.TextTransparency = 0
	E.pop.Position = UDim2.new(0, 0, 0.22, 10)
	TweenService:Create(E.pop, LENTE, { Position = UDim2.fromScale(0, 0.22) }):Play()
	popFin = os.clock() + 1.3
end
local grandFin = 0
function Hud.grand(txt: string, couleur: Color3?, duree: number?, taille: number?)
	E.grand.Text = txt
	E.grand.TextColor3 = couleur or C.texte
	E.grand.TextTransparency = 0
	E.grand.TextSize = taille or 38
	E.grand.Size = UDim2.new(1, 0, 0, 80)
	TweenService:Create(E.grand, LENTE, { Size = UDim2.new(1, 0, 0, 60) }):Play()
	grandFin = os.clock() + (duree or 0.8)
end
local astuceFin = 0
function Hud.astuce(txt: string, duree: number?)
	E.astuceTxt.Text = txt
	E.astuce.Visible = true
	astuceFin = os.clock() + (duree or 5)
end
function Hud.tick()
	local t = os.clock()
	if E.pop.Text ~= "" and t > popFin then
		E.pop.TextTransparency = math.min(1, (t - popFin) / 0.4)
		if t > popFin + 0.4 then E.pop.Text = "" end
	end
	if E.grand.Text ~= "" and t > grandFin then
		E.grand.TextTransparency = math.min(1, (t - grandFin) / 0.3)
		if t > grandFin + 0.3 then E.grand.Text = "" end
	end
	if E.astuce.Visible and t > astuceFin then E.astuce.Visible = false end
end

return Hud
