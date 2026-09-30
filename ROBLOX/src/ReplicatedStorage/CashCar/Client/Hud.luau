-- CASH CAR — L'INTERFACE (menu, course, pause, mort). La charte du jeu web, traduite en Roblox :
--   · plaques OPAQUES, coins nets, une ÉPAISSEUR sous la plaque qui disparaît à l'appui (le doigt enfonce) ;
--   · UNE action primaire par écran, en OR, pleine largeur du bas ; le reste en cyan, plus petit ;
--   · ce qu'on LIT en haut, ce qu'on TOUCHE en bas ; cibles de 44 px minimum ;
--   · un texte = une couleur pleine ; police pixel (Press Start 2P, livrée avec Roblox), sans accents
--     sur les capitales (la police ne les a pas) ;
--   · une seule courbe d'animation (Quad sortante), deux durées : RAPIDE (l'appui) et LENTE (l'écran).
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
	jouer = "JOUER", rejouer = "REJOUER", menu = "MENU", reprendre = "REPRENDRE", recommencer = "RECOMMENCER",
	pause = "PAUSE", son = "SON", musique = "MUSIQUE", record = "RECORD", nouveau = "NOUVEAU RECORD !",
	distance = "DISTANCE", figures = "FIGURES", vmax = "VMAX", zones = "ZONES", aura = "AURA",
	moteur = "MOTEUR", nitro = "NITRO", go = "GO !", tagline = "le ciel paye cash",
	aideTactile = "Pouce gauche : le volant (en l'air : pique / cabre). Pouce droit : NITRO. Sors par le bord, vole, pose-toi plus bas.",
	aideClavier = "← → le volant · ESPACE la nitro · en l'air ↑ pique, ↓ cabre. Sors par le bord, vole, pose-toi plus bas.",
	chargement = "LA ROUTE SE CONSTRUIT…",
	morts = { air = "TROP LONGTEMPS EN L'AIR", vide = "AVALE PAR LE VIDE", arret = "EN PANNE", autre = "GAME OVER" },
} or {
	jouer = "PLAY", rejouer = "PLAY AGAIN", menu = "MENU", reprendre = "RESUME", recommencer = "RESTART",
	pause = "PAUSE", son = "SOUND", musique = "MUSIC", record = "BEST", nouveau = "NEW RECORD!",
	distance = "DISTANCE", figures = "TRICKS", vmax = "TOP SPEED", zones = "ZONES", aura = "AURA",
	moteur = "ENGINE", nitro = "NITRO", go = "GO!", tagline = "the sky pays cash",
	aideTactile = "Left thumb: steer (in the air: dive / climb). Right thumb: NITRO. Leave by the edge, fly, land lower.",
	aideClavier = "← → steer · SPACE nitro · in the air ↑ dive, ↓ climb. Leave by the edge, fly, land lower.",
	chargement = "BUILDING THE ROAD…",
	morts = { air = "TOO LONG IN THE AIR", vide = "SWALLOWED BY THE VOID", arret = "STALLED", autre = "GAME OVER" },
}
Hud.T = T

-- ── la charte ──
local PIX = Font.new("rbxasset://fonts/families/PressStart2P.json")
local TXT = Font.new("rbxasset://fonts/families/BuilderSans.json", Enum.FontWeight.Medium)
local C = {
	or_ = Color3.fromRGB(255, 215, 94), orSh = Color3.fromRGB(150, 96, 12), orLn = Color3.fromRGB(255, 244, 196),
	cyan = Color3.fromRGB(0, 234, 255), cyanSh = Color3.fromRGB(0, 92, 120),
	rouge = Color3.fromRGB(255, 94, 122), rougeSh = Color3.fromRGB(120, 20, 40),
	vert = Color3.fromRGB(98, 224, 98), magenta = Color3.fromRGB(255, 62, 200), ambre = Color3.fromRGB(255, 176, 0),
	plaque = Color3.fromRGB(34, 48, 92), plaqueSh = Color3.fromRGB(6, 18, 46),
	texte = Color3.fromRGB(223, 238, 255), texte2 = Color3.fromRGB(159, 232, 255), terne = Color3.fromRGB(143, 132, 200),
	encre = Color3.fromRGB(10, 12, 28),
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
		if k ~= "epais" and k ~= "contour" then (t :: any)[k] = v end
	end
	if props.contour ~= false then
		inst("UIStroke", { Color = C.encre, Thickness = props.epais or 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual }, t)
	end
	return t
end

-- LA PLAQUE D'ARCADE : le seul composant bouton du jeu
local TEINTES = {
	["or"] = { C.or_, C.orSh, C.encre },
	cyan = { Color3.fromRGB(20, 60, 96), C.cyanSh, C.cyan },
	rouge = { Color3.fromRGB(96, 18, 40), C.rougeSh, C.rouge },
	nitro = { Color3.fromRGB(255, 122, 36), Color3.fromRGB(120, 40, 8), C.encre },
}
local function plaque(parent: Instance, libelle: string, teinte: string, taille: UDim2, pos: UDim2, ancre: Vector2?, corps: number?): TextButton
	local t = TEINTES[teinte]
	local cadre = inst("Frame", { BackgroundTransparency = 1, Size = taille, Position = pos, AnchorPoint = ancre or Vector2.new(0.5, 0.5) }, parent)
	local ep = inst("Frame", { -- l'épaisseur
		BackgroundColor3 = t[2], BorderSizePixel = 0, Size = UDim2.fromScale(1, 1), Position = UDim2.fromOffset(0, 6),
	}, cadre)
	local b = inst("TextButton", {
		Name = "Plaque", AutoButtonColor = false, BackgroundColor3 = t[1], BorderSizePixel = 0,
		Size = UDim2.fromScale(1, 1), FontFace = PIX, Text = libelle, TextColor3 = t[3], TextSize = corps or 20,
		TextWrapped = true,
	}, cadre)
	inst("UIStroke", { Color = t[2], Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, b)
	local haut = UDim2.fromOffset(0, 0)
	local bas = UDim2.fromOffset(0, 5)
	b.MouseButton1Down:Connect(function()
		TweenService:Create(b, RAPIDE, { Position = bas }):Play()
		ep.Visible = false
	end)
	local function relache()
		TweenService:Create(b, RAPIDE, { Position = haut }):Play()
		ep.Visible = true
	end
	b.MouseButton1Up:Connect(relache)
	b.MouseLeave:Connect(relache)
	b.Activated:Connect(function()
		Sons.jouer("tap")
		-- l'haptique n'existe chez Roblox que sur manette : un petit coup si on en tient une
		pcall(function()
			local HS = game:GetService("HapticService")
			if HS:IsVibrationSupported(Enum.UserInputType.Gamepad1) then
				HS:SetMotor(Enum.UserInputType.Gamepad1, Enum.VibrationMotor.Small, 0.4)
				task.delay(0.06, function() HS:SetMotor(Enum.UserInputType.Gamepad1, Enum.VibrationMotor.Small, 0) end)
			end
		end)
	end)
	return b
end

-- ── les formats d'argent (fmtC, L12383) ──
local UNITES = FR and { { 1e15, "Bd" }, { 1e12, "Bn" }, { 1e9, "Md" }, { 1e6, "M" }, { 1e3, "k" } }
	or { { 1e15, "Qa" }, { 1e12, "T" }, { 1e9, "B" }, { 1e6, "M" }, { 1e3, "k" } }
function Hud.argent(v: number): string
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
	return "$ " .. s
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
	-- tout est dessiné pour un écran de 720 px de haut : une RACINE de 1/k de l'écran, agrandie k fois
	-- (un UIScale posé directement sur l'écran rétrécirait aussi les cadres plein écran)
	local tactile = UserInputService.TouchEnabled and not UserInputService.KeyboardEnabled
	local racine = inst("Frame", { Name = "Racine", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, gui)
	local echelle = inst("UIScale", {}, racine)
	local function recaler()
		local cam = workspace.CurrentCamera
		local h = cam and cam.ViewportSize.Y or 720
		-- au doigt, jamais sous 0,8 : une plaque de 56 px reste une cible de 44 px (la charte)
		local k = math.clamp(h / 720, tactile and 0.8 or 0.5, 1.5)
		echelle.Scale = k
		racine.Size = UDim2.fromScale(1 / k, 1 / k)
	end
	recaler()
	if workspace.CurrentCamera then workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize"):Connect(recaler) end
	-- le stick tactile vit dans un écran à part, en pixels vrais (il suit le doigt au pixel près)
	local gStick = inst("ScreenGui", { Name = "CashCarStick", ResetOnSpawn = false, IgnoreGuiInset = true,
		ScreenInsets = Enum.ScreenInsets.None, DisplayOrder = 6 }, pg)

	-- ══ ÉCRAN : CHARGEMENT ══
	E.charge = inst("Frame", { BackgroundColor3 = Color3.fromRGB(12, 30, 70), Size = UDim2.fromScale(1, 1), ZIndex = 50 }, racine)
	texte(E.charge, { Text = "CASH CAR", TextSize = 48, TextColor3 = C.or_, Size = UDim2.new(1, 0, 0, 60),
		Position = UDim2.fromScale(0, 0.36), ZIndex = 51, epais = 3 })
	E.chargeTxt = texte(E.charge, { Text = T.chargement, TextSize = 14, TextColor3 = C.texte2, Position = UDim2.fromScale(0, 0.52), ZIndex = 51 })

	-- ══ ÉCRAN : MENU ══
	local menu = inst("Frame", { Name = "Menu", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, racine)
	E.menu = menu
	E.titre = texte(menu, { Text = "CASH CAR", TextSize = 64, TextColor3 = C.or_, Size = UDim2.new(1, 0, 0, 72),
		Position = UDim2.fromScale(0, 0.10), epais = 4 })
	texte(menu, { Text = string.upper(T.tagline), TextSize = 14, TextColor3 = C.texte2, Position = UDim2.new(0, 0, 0.10, 84) })
	E.menuRecord = texte(menu, { Text = "", TextSize = 18, TextColor3 = C.vert, Position = UDim2.new(0, 0, 0.10, 120) })
	E.aide = inst("TextLabel", {
		BackgroundTransparency = 1, FontFace = TXT, TextSize = 17, TextColor3 = C.texte, TextWrapped = true,
		Size = UDim2.new(0.7, 0, 0, 44), Position = UDim2.new(0.5, 0, 1, -146), AnchorPoint = Vector2.new(0.5, 1),
		Text = tactile and T.aideTactile or T.aideClavier,
	}, menu)
	inst("UIStroke", { Color = C.encre, Thickness = 1.5 }, E.aide)
	E.btJouer = plaque(menu, T.jouer, "or", UDim2.fromOffset(360, 78), UDim2.new(0.5, 0, 1, -64), Vector2.new(0.5, 0.5), 30)
	E.btSon = plaque(menu, T.son, "cyan", UDim2.fromOffset(150, 56), UDim2.new(0.5, -290, 1, -64), Vector2.new(0.5, 0.5), 13)
	E.btMus = plaque(menu, T.musique, "cyan", UDim2.fromOffset(150, 56), UDim2.new(0.5, 290, 1, -64), Vector2.new(0.5, 0.5), 13)

	-- ══ ÉCRAN : COURSE ══
	local hud = inst("Frame", { Name = "Course", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, racine)
	E.hud = hud
	E.argent = texte(hud, { Text = "$ 0,00", TextSize = 34, TextColor3 = C.vert, Size = UDim2.new(1, 0, 0, 40), Position = UDim2.fromOffset(0, 10), epais = 3 })
	E.kmh = texte(hud, { Text = "0 KM/H", TextSize = 15, TextColor3 = C.texte, Position = UDim2.fromOffset(0, 56) })
	E.aura = texte(hud, { Text = "", TextSize = 13, TextColor3 = C.magenta, Position = UDim2.fromOffset(0, 80) })
	E.pouvoir = texte(hud, { Text = "", TextSize = 14, TextColor3 = C.or_, Position = UDim2.fromOffset(0, 104) })
	-- la nitro et le moteur, à gauche
	local jauge = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(250, 90), Position = UDim2.fromOffset(18, 12) }, hud)
	texte(jauge, { Text = T.nitro, TextSize = 12, TextXAlignment = Enum.TextXAlignment.Left, TextColor3 = C.texte2, Size = UDim2.new(1, 0, 0, 16) })
	local fondN = inst("Frame", { BackgroundColor3 = C.plaqueSh, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 16), Position = UDim2.fromOffset(0, 20) }, jauge)
	inst("UIStroke", { Color = C.encre, Thickness = 2 }, fondN)
	E.nitro = inst("Frame", { BackgroundColor3 = Color3.fromRGB(255, 122, 36), BorderSizePixel = 0, Size = UDim2.fromScale(0.5, 1) }, fondN)
	E.moteurTxt = texte(jauge, { Text = T.moteur .. " 0", TextSize = 12, TextXAlignment = Enum.TextXAlignment.Left, TextColor3 = C.or_,
		Size = UDim2.new(1, 0, 0, 16), Position = UDim2.fromOffset(0, 46) })
	local fondM = inst("Frame", { BackgroundColor3 = C.plaqueSh, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 8), Position = UDim2.fromOffset(0, 66) }, jauge)
	inst("UIStroke", { Color = C.encre, Thickness = 2 }, fondM)
	E.moteur = inst("Frame", { BackgroundColor3 = C.or_, BorderSizePixel = 0, Size = UDim2.fromScale(0, 1) }, fondM)
	-- le chrono de vol, en barre, sous la caisse
	E.air = inst("Frame", { BackgroundColor3 = C.plaqueSh, BorderSizePixel = 0, Size = UDim2.fromOffset(320, 14),
		Position = UDim2.new(0.5, 0, 0.72, 0), AnchorPoint = Vector2.new(0.5, 0.5), Visible = false }, hud)
	inst("UIStroke", { Color = C.encre, Thickness = 2 }, E.air)
	E.airFill = inst("Frame", { BackgroundColor3 = C.cyan, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1) }, E.air)
	-- les figures : le nom au centre haut, la chaîne dessous
	E.pop = texte(hud, { Text = "", TextSize = 24, TextColor3 = C.or_, Size = UDim2.new(1, 0, 0, 34), Position = UDim2.fromScale(0, 0.25), epais = 3 })
	E.chaine = texte(hud, { Text = "", TextSize = 14, TextColor3 = C.cyan, Position = UDim2.new(0, 0, 0.25, 40) })
	E.grand = texte(hud, { Text = "", TextSize = 72, TextColor3 = C.or_, Size = UDim2.new(1, 0, 0, 90), Position = UDim2.fromScale(0, 0.34), epais = 5 })
	-- la pause (en bas, au milieu : ce qu'on touche vit en bas)
	E.btPause = plaque(hud, "II", "cyan", UDim2.fromOffset(56, 56), UDim2.new(0.5, 0, 1, -40), Vector2.new(0.5, 0.5), 16)

	-- ══ LES COMMANDES TACTILES (seulement sur téléphone / tablette) ══
	E.tactile = inst("Frame", { Name = "Tactile", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, hud)
	E.btNitro = plaque(E.tactile, T.nitro, "nitro", UDim2.fromOffset(150, 150), UDim2.new(1, -100, 1, -110), Vector2.new(0.5, 0.5), 18)
	E.stickBase = inst("Frame", { BackgroundColor3 = C.plaqueSh, BackgroundTransparency = 0.35, BorderSizePixel = 0,
		Size = UDim2.fromOffset(120, 120), AnchorPoint = Vector2.new(0.5, 0.5), Visible = false }, gStick)
	inst("UIStroke", { Color = C.cyan, Thickness = 3 }, E.stickBase)
	E.stickPouce = inst("Frame", { BackgroundColor3 = C.cyan, BorderSizePixel = 0, Size = UDim2.fromOffset(52, 52),
		AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5) }, E.stickBase)
	Hud.tactile = tactile

	-- ══ ÉCRAN : PAUSE ══
	local pause = inst("Frame", { Name = "Pause", BackgroundColor3 = Color3.fromRGB(6, 10, 30), BackgroundTransparency = 0.3,
		Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 20 }, racine)
	E.pause = pause
	texte(pause, { Text = T.pause, TextSize = 40, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 50), Position = UDim2.fromScale(0, 0.18), ZIndex = 21 })
	E.btSonP = plaque(pause, T.son, "cyan", UDim2.fromOffset(170, 56), UDim2.new(0.5, -95, 0.46, 0), nil, 13)
	E.btMusP = plaque(pause, T.musique, "cyan", UDim2.fromOffset(170, 56), UDim2.new(0.5, 95, 0.46, 0), nil, 13)
	E.btRecom = plaque(pause, T.recommencer, "cyan", UDim2.fromOffset(250, 56), UDim2.new(0.5, -135, 1, -150), nil, 13)
	E.btMenuP = plaque(pause, T.menu, "cyan", UDim2.fromOffset(160, 56), UDim2.new(0.5, 140, 1, -150), nil, 13)
	E.btReprendre = plaque(pause, T.reprendre, "or", UDim2.fromOffset(380, 76), UDim2.new(0.5, 0, 1, -62), nil, 26)
	for _, d in pause:GetDescendants() do
		if d:IsA("GuiObject") then d.ZIndex = 21 end
	end

	-- ══ ÉCRAN : MORT ══
	local mort = inst("Frame", { Name = "Mort", BackgroundColor3 = Color3.fromRGB(8, 6, 22), BackgroundTransparency = 0.35,
		Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 30 }, racine)
	E.mort = mort
	E.mCause = texte(mort, { Text = "", TextSize = 22, TextColor3 = C.rouge, Size = UDim2.new(1, 0, 0, 30), Position = UDim2.fromScale(0, 0.09) })
	E.mArgent = texte(mort, { Text = "", TextSize = 60, TextColor3 = C.vert, Size = UDim2.new(1, 0, 0, 72), Position = UDim2.fromScale(0, 0.19), epais = 4 })
	E.mRecord = texte(mort, { Text = "", TextSize = 18, TextColor3 = C.or_, Position = UDim2.new(0, 0, 0.19, 84) })
	E.mStats = texte(mort, { Text = "", TextSize = 13, TextColor3 = C.texte2, Size = UDim2.new(0.9, 0, 0, 60),
		Position = UDim2.new(0.05, 0, 0.19, 124) })
	E.mAura = texte(mort, { Text = "", TextSize = 16, TextColor3 = C.magenta, Position = UDim2.new(0, 0, 0.19, 190) })
	E.btMenuM = plaque(mort, T.menu, "cyan", UDim2.fromOffset(170, 56), UDim2.new(0.5, 0, 1, -150), nil, 13)
	E.btRejouer = plaque(mort, T.rejouer, "or", UDim2.fromOffset(400, 78), UDim2.new(0.5, 0, 1, -62), nil, 28)
	for _, d in mort:GetDescendants() do
		if d:IsA("GuiObject") then d.ZIndex = 31 end
	end

	Hud.brancherTactile()
	return gui
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
	E.btNitro.InputBegan:Connect(function(io)
		if io.UserInputType == Enum.UserInputType.Touch then t.nitro = true end
	end)
	E.btNitro.InputEnded:Connect(function(io)
		if io.UserInputType == Enum.UserInputType.Touch then t.nitro = false end
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
		-- stick FLOTTANT : passé la butée, la base suit le doigt (revenir au centre rend la main tout de suite)
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
	E.pause.Visible = nom == "pause"
	E.mort.Visible = nom == "mort"
	E.tactile.Visible = Hud.tactile and nom == "course"
	if nom ~= "course" then
		doigt = nil
		Controles.tactile.actif = false
		Controles.tactile.nitro = false
		E.stickBase.Visible = false
	end
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
	E.pop.TextSize = taille or 24
	E.pop.TextTransparency = 0
	E.pop.Position = UDim2.new(0, 0, 0.25, 10)
	TweenService:Create(E.pop, LENTE, { Position = UDim2.fromScale(0, 0.25) }):Play()
	popFin = os.clock() + 1.3
end
local grandFin = 0
function Hud.grand(txt: string, couleur: Color3?, duree: number?)
	E.grand.Text = txt
	E.grand.TextColor3 = couleur or C.or_
	E.grand.TextTransparency = 0
	E.grand.Size = UDim2.new(1, 0, 0, 130)
	TweenService:Create(E.grand, LENTE, { Size = UDim2.new(1, 0, 0, 90) }):Play()
	grandFin = os.clock() + (duree or 0.8)
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
end

return Hud
