-- CASH CAR — L'INTERFACE (menu, course, pause, réglages, mort), calquée sur la VERSION PRINCIPALE web.
-- Références : captures du jeu web à 1280×720 (menu CHUTE, course, écran de mort) — même disposition :
--   · MENU : le logo CASH CAR en haut à droite (or, barre tricolore rose/cyan/or dessous), ⚙ à droite,
--     JOUER en grandes lettres d'or en bas à droite ; la caisse qui pique à gauche, au-dessus des nuages.
--   · COURSE : ⚡ + la grande barre de NITRO en haut à gauche, AURA dessous ; en haut à droite la pause
--     cyan puis l'ARGENT vert et le chrono d'AIR ; le bouton NITRO en bas à droite ; la bannière du niveau.
--   · MORT : « NOUVEAU RECORD ! », le panneau vert VERSÉ AU COMPTE, AURA, MOTEUR ATTEINT, les stats,
--     HOME et le grand REJOUER doré.
-- Roblox n'a ni biais (skew) ni découpe (clip-path) : les plaques PENCHÉES sont bâties en bandes (voir `penche`), les icônes
-- pixel du web (PXI_G, cuites dans CashCar/Icones) en barrettes, les jauges en quatre bandes comme la barre NITRO du web.
-- Police pixel (Press Start 2P, livrée avec Roblox), sans accents sur les capitales (elle ne les a pas).
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local GuiService = game:GetService("GuiService")

local Controles = require(script.Parent:WaitForChild("Controles"))
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Icones = require(script.Parent.Parent:WaitForChild("Icones"))
local Sons = require(script.Parent:WaitForChild("Sons"))
local Bus = require(script.Parent:WaitForChild("Bus"))

local Hud = {}

-- ── la langue : français si le compte Roblox est en français, anglais sinon ──
local FR = Config.francais()
Hud.FR = FR
local T = FR and {
	jouer = "JOUER", rejouer = "REJOUER", menu = "HOME", quitter = "QUITTER", reprendre = "REPRENDRE", recommencer = "RECOMMENCER",
	pause = "PAUSE", son = "SON", musique = "MUSIQUE", record = "RECORD", nouveau = "NOUVEAU RECORD !",
	reglages = "REGLAGES", fermer = "FERMER", retour = "RETOUR", jeu = "JEU", revoir = "REVOIR L'AUTO-ECOLE", volume = "VOLUME", pouce = "POUCE HAUT EN VOL", vibrations = "VIBRATIONS", plonge = "PLONGE", monte = "MONTE", verse = "VERSES AU COMPTE", compte = "COMPTE :", meilleur = "MEILLEUR",
	moteurAtteint = "MOTEUR ATTEINT", palier = "PALIER", encore = "ENCORE %d PIECES POUR", encore1 = "ENCORE 1 PIECE POUR", moteurMax = "LE PLUS GROS MOTEUR",
	multiMax = "MULTI MAX", kmhMax = "KM/H MAX", zone = "ZONE", figures = "FIGURES", frenesie = "FRENESIE", distance = "DISTANCE", pieces = "PIECES",
	aura = "AURA", moteur = "MOTEUR", nitro = "NITRO", air = "AIR", go = "GO !", niveau = "MER DE NUAGES",
	astuce = "ASTUCE", glisse = "GLISSE POUR\nTOURNER", chargement = "LA ROUTE SE CONSTRUIT",
		missions = "MISSIONS", garage = "GARAGE", carriere = "CARRIERE", boutique = "BOUTIQUE", bientot = "BIENTOT DISPONIBLE", roue = "LA ROUE",
		facile = "MODE FACILE", choisis = "CHOISIS TON MODE", normal = "NORMAL", facileMot = "FACILE",
		facileTxt = "En FACILE, la voiture suit mieux les virages, tu restes plus longtemps en l'air et tu as 3 vies. Tu pourras changer dans les réglages.",
		vies = "PLUS QUE %d VIES", derniereVie = "DERNIERE VIE !", onRepart = "ON REPART !",
	astuces = {
		"Sors par le BORD de la route : tu voles, et tu te poses plus bas. C'est là que le jeu se joue.",
		"En l'air : flèche HAUT = plonge, flèche BAS = monte. Gauche / droite = les vrilles.",
		"Chaque pièce fait monter ton MOTEUR : plus de pièces, plus de vitesse.",
		"Freine en tournant : DRIFT ! Lâche, et la caisse repart plus fort.",
		"En l'air : flèche HAUT = monte, flèche BAS = plonge. Gauche / droite = les vrilles.",
	},
	astucesTactile = {
		"Sors par le BORD de la route : tu voles, et tu te poses plus bas. C'est là que le jeu se joue.",
		"En l'air : pouce en HAUT = plonge, en BAS = monte. Gauche / droite = les vrilles.",
		"Chaque pièce fait monter ton MOTEUR : plus de pièces, plus de vitesse.",
		"Tire le pouce vers le BAS en tournant : DRIFT !",
		"En l'air : pouce en HAUT = monte, en BAS = plonge. Gauche / droite = les vrilles.",
	},
	morts = { air = "TROP LONGTEMPS EN L'AIR", vide = "AVALE PAR LE VIDE", arret = "EN PANNE SECHE", tour = "ENCASTRE DANS UNE TOUR", sat = "PERCUTE PAR UN SATELLITE", quitte = "PARTIE QUITTEE", autre = "GAME OVER" },
} or {
	jouer = "PLAY", rejouer = "PLAY AGAIN", menu = "HOME", quitter = "QUIT", reprendre = "RESUME", recommencer = "RESTART",
	pause = "PAUSE", son = "SOUND", musique = "MUSIC", record = "BEST", nouveau = "NEW RECORD!",
	reglages = "SETTINGS", fermer = "CLOSE", retour = "BACK", jeu = "GAME", revoir = "REPLAY DRIVING SCHOOL", volume = "VOLUME", pouce = "THUMB UP IN FLIGHT", vibrations = "VIBRATION", plonge = "DIVE", monte = "CLIMB", verse = "BANKED", compte = "ACCOUNT:", meilleur = "BEST",
	moteurAtteint = "ENGINE REACHED", palier = "TIER", encore = "%d MORE COINS FOR", encore1 = "1 MORE COIN FOR", moteurMax = "THE BIGGEST ENGINE",
	multiMax = "MAX MULTI", kmhMax = "MAX KM/H", zone = "ZONE", figures = "TRICKS", frenesie = "FRENZY", distance = "DISTANCE", pieces = "COINS",
	aura = "AURA", moteur = "ENGINE", nitro = "NITRO", air = "AIR", go = "GO!", niveau = "SEA OF CLOUDS",
	astuce = "TIP", glisse = "SWIPE TO\nSTEER", chargement = "BUILDING THE ROAD",
		missions = "MISSIONS", garage = "GARAGE", carriere = "CAREER", boutique = "SHOP", bientot = "COMING SOON", roue = "THE WHEEL",
		facile = "EASY MODE", choisis = "PICK YOUR MODE", normal = "NORMAL", facileMot = "EASY",
		facileTxt = "In EASY, the car follows the turns better, you stay longer in the air and you get 3 lives. You can change it in the settings.",
		vies = "%d LIVES LEFT", derniereVie = "LAST LIFE!", onRepart = "BACK ON THE ROAD!",
	astuces = {
		"Leave the road by the EDGE: you fly, and land lower down. That's where the game is.",
		"In the air: UP arrow = dive, DOWN arrow = climb. Left / right = spins.",
		"Every coin grows your ENGINE: more coins, more speed.",
		"Brake while turning: DRIFT! Let go, and the car shoots off harder.",
		"In the air: UP arrow = climb, DOWN arrow = dive. Left / right = spins.",
	},
	astucesTactile = {
		"Leave the road by the EDGE: you fly, and land lower down. That's where the game is.",
		"In the air: thumb UP = dive, DOWN = climb. Left / right = spins.",
		"Every coin grows your ENGINE: more coins, more speed.",
		"Pull your thumb DOWN while turning: DRIFT!",
		"In the air: thumb UP = climb, DOWN = dive. Left / right = spins.",
	},
	morts = { air = "TOO LONG IN THE AIR", vide = "SWALLOWED BY THE VOID", arret = "OUT OF GAS", tour = "SMASHED INTO A TOWER", sat = "HIT BY A SATELLITE", quitte = "RUN ENDED", autre = "GAME OVER" },
}
Hud.T = T

-- ── la palette du web (charte v4/v5 : carbone, or, néon) ──
local PIX = Font.new("rbxasset://fonts/families/PressStart2P.json")
-- L'ITALIQUE du web (la charte penche ses titres et les libellés de ses plaques) : Roblox penche la police pixel lui-même
local PIXI = Font.new("rbxasset://fonts/families/PressStart2P.json", Enum.FontWeight.Regular, Enum.FontStyle.Italic)
local CH = 5 / 9 -- LA CHASSE de la police pixel : un caractère fait 5/9 du TextSize (mesuré dans Studio : « CASH CAR » en 80 = 350 px)
Hud.CHASSE = CH
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
-- (5/10, refonte du design) LE CORPS QUI TIENT DANS SA BOÎTE. La police pixel est à chasse fixe : un libellé qui déborderait (un
-- écran 16:10, un iPad, une langue plus longue) rapetisse juste ce qu'il faut — jamais au-dessus du corps demandé, et il le
-- retrouve dès que la place revient. (TextScaled ne rétrécissait PAS un texte sur une seule ligne : « POUCE HAUT EN VOL » passait
-- sous « PLONGE » et « REJOUER » sortait du lingot, mesuré au banc en 1150 px de large.) `marge` : ce qu'il faut laisser libre en
-- largeur ; `pente` : la plaque est penchée, sa largeur utile perd la pente sur sa hauteur.
local function ajuster(t: TextLabel | TextButton, marge: number, pente: boolean?)
	local voulu = t.TextSize
	local moi = false
	local function calc()
		if t.TextScaled or t.RichText or t.Text == "" then return end
		local n = 0
		for l in string.gmatch(t.Text, "[^\n]+") do n = math.max(n, utf8.len(l) or #l) end
		if n == 0 then return end
		-- (la largeur DESSINÉE : l'écran divisé par toutes les échelles au-dessus — la racine, le lingot qui respire…)
		local k, a = 1, t :: Instance?
		while a and a:IsA("GuiObject") do
			local s = a:FindFirstChildOfClass("UIScale")
			if s then k *= s.Scale end
			a = a.Parent
		end
		k = math.max(k, 0.01)
		local pad = t:FindFirstChildOfClass("UIPadding")
		local w = t.AbsoluteSize.X / k - marge - (pad and (pad.PaddingLeft.Offset + pad.PaddingRight.Offset) or 0)
		if pente then w -= t.AbsoluteSize.Y / k * math.tan(math.rad(12)) end
		if w <= 8 then return end -- (pas encore posé)
		local c = math.clamp(math.floor(w / (n * 5 / 9)), 8, voulu)
		if c ~= t.TextSize then
			moi = true
			t.TextSize = c
			moi = false
		end
	end
	t:GetPropertyChangedSignal("TextSize"):Connect(function()
		if moi then return end
		voulu = t.TextSize
		calc()
	end)
	t:GetPropertyChangedSignal("Text"):Connect(calc)
	t:GetPropertyChangedSignal("TextScaled"):Connect(calc)
	t:GetPropertyChangedSignal("AbsoluteSize"):Connect(calc)
	task.defer(calc)
end
local function texte(parent: Instance, props: { [string]: any }): TextLabel
	local t = inst("TextLabel", {
		BackgroundTransparency = 1, FontFace = PIX, TextColor3 = C.texte, TextSize = 16,
		Size = UDim2.new(1, 0, 0, 24), TextWrapped = true,
	}, parent)
	for k, v in props do
		if k ~= "epais" and k ~= "contour" and k ~= "contourCouleur" and k ~= "italique" and k ~= "ajuste" then (t :: any)[k] = v end
	end
	if props.italique then t.FontFace = PIXI end
	if props.contour ~= false then
		inst("UIStroke", { Color = props.contourCouleur or C.encre, Thickness = props.epais or 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual }, t)
	end
	if props.ajuste then ajuster(t, props.ajuste) end
	return t
end
local function degrade(parent: Instance, a: Color3, b: Color3, rot: number?)
	inst("UIGradient", { Color = ColorSequence.new(a, b), Rotation = rot or 90 }, parent)
end
-- le LISERÉ d'une plaque de laque : un filet de 2 px À L'INTÉRIEUR du bord, clair en haut, sombre en bas — la lumière tombe du haut,
-- la laque a un biseau. (Un cadre transparent rentré de 2 px, et son trait qui déborde vers l'extérieur : il recouvre le bord.)
local function lisere(f: GuiObject, haut: Color3, bas: Color3): Frame
	local r = inst("Frame", { Name = "Lisere", BackgroundTransparency = 1, Size = UDim2.new(1, -4, 1, -4), Position = UDim2.fromOffset(2, 2) }, f)
	local st = inst("UIStroke", { Color = Color3.new(1, 1, 1), Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, r)
	inst("UIGradient", { Rotation = 90, Color = ColorSequence.new(haut, bas) }, st)
	return r
end
-- une plaque de CARBONE (le fond de tous les panneaux du web) avec son filet de couleur à gauche
-- (v3, 5/10 — LA LAQUE) : le trait violet de 2 px se perdait sur la nuit ; désormais le panneau a le langage des boutons : un
-- CONTOUR d'encre de 3 px qui le détache de n'importe quel décor, un LISERÉ clair en haut / sombre en bas, et un REFLET de laque
-- sur son premier tiers. Même géométrie qu'avant : rien ne bouge chez ceux qui l'empruntent (garage, roue, boutique…).
local function carbone(parent: Instance, taille: UDim2, pos: UDim2, filet: Color3?, ancre: Vector2?): Frame
	-- (fond BLANC : un dégradé MULTIPLIE la couleur du cadre — sur du carbone, tous les panneaux du jeu sortaient presque NOIRS,
	-- là où le web pose un bleu-violet de nuit)
	local f = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = taille, Position = pos,
		AnchorPoint = ancre or Vector2.zero }, parent)
	degrade(f, C.carbone2, C.carbone, 90)
	inst("UIStroke", { Color = C.encre, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, f)
	local reflet = inst("Frame", { Name = "Reflet", BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.93, BorderSizePixel = 0,
		Size = UDim2.fromScale(1, 0.34) }, f)
	inst("UIGradient", { Rotation = 90, Transparency = NumberSequence.new(0, 1) }, reflet)
	lisere(f, Color3.fromRGB(112, 100, 176), Color3.fromRGB(38, 32, 70))
	if filet then
		inst("Frame", { Name = "Filet", BackgroundColor3 = filet, BorderSizePixel = 0, Size = UDim2.new(0, 6, 1, 0) }, f)
	end
	return f
end

-- LA SIGNATURE des titres : la barre des trois néons (rose, cyan, or) qui court sous le logo — sous chaque grand titre aussi
local function signature(parent: Instance, pos: UDim2, large: number?): Frame
	local barre = inst("Frame", { Name = "Signature", BackgroundTransparency = 1, Size = UDim2.fromOffset(large or 220, 7), Position = pos }, parent)
	for i, c in { C.magenta, C.cyan, C.or_ } do
		inst("Frame", { BackgroundColor3 = c, BorderSizePixel = 0, Size = UDim2.new(i == 1 and 0.44 or 0.28, -8, 1, 0),
			Position = UDim2.fromScale(i == 1 and 0 or (i == 2 and 0.44 or 0.72), 0) }, barre)
	end
	return barre
end
-- LA JUPE : le fond d'un écran plein (pause, réglages, fin) déborde de 400 px de chaque côté de la racine — la bande des boutons de
-- Roblox en haut, les bords de l'encoche d'un téléphone couché ne laissent plus voir le jeu derrière un écran opaque (mesuré : une
-- bande de ciel bleu de 58 px au-dessus du chargement et des réglages). Le dégradé du fond la suit.
local function jupe(f: Frame)
	local j = inst("Frame", { Name = "Jupe", BackgroundColor3 = f.BackgroundColor3, BackgroundTransparency = f.BackgroundTransparency, BorderSizePixel = 0,
		Size = UDim2.new(1, 800, 1, 800), Position = UDim2.fromOffset(-400, -400), ZIndex = 0 }, f)
	local g = f:FindFirstChildOfClass("UIGradient")
	if g then g.Parent = j end
	f.BackgroundTransparency = 1
end
-- L'EMPILEMENT : tout un écran passe au-dessus de son plan de base SANS écraser l'ordre de ses couches (le mot du lingot au-dessus
-- de son reflet, le fond sous tout) — l'ancienne boucle mettait toutes les couches au même rang
local function empiler(f: Instance, base: number)
	for _, d in f:GetDescendants() do
		if d:IsA("GuiObject") then d.ZIndex = base + d.ZIndex end
	end
end

-- LE RETOUR D'APPUI (charte : « chaque appui répond ») : la plaque S'ENFONCE dans sa tranche sous le doigt ; à la souris, elle
-- se SOULÈVE d'un cran et s'éclaire quand on la survole (un bouton de PC qui ne réagit pas au survol a l'air mort). Le survol
-- n'existe qu'à la souris : sur un téléphone, il resterait collé après le tap.
local function souris(): boolean
	local t = UserInputService:GetLastInputType()
	return t == Enum.UserInputType.MouseMovement or t == Enum.UserInputType.MouseButton1 or t == Enum.UserInputType.MouseButton2
		or t == Enum.UserInputType.MouseWheel
end
local function eclairer(plaque: Instance, on: boolean)
	local fond = plaque:GetAttribute("fond")
	if typeof(fond) ~= "Color3" then return end
	local f = on and (fond :: Color3):Lerp(Color3.new(1, 1, 1), 0.12) or fond
	for _, d in plaque:GetDescendants() do
		if d.Name == "c" and d:IsA("Frame") then
			local k = d:GetAttribute("k") or 0
			d.BackgroundColor3 = f:Lerp(Color3.new(1, 1, 1), 0.14):Lerp(Color3.new(f.R * 0.8, f.G * 0.8, f.B * 0.8), k)
		end
	end
end
local function retour(b: GuiButton, cible: GuiObject)
	local p0 = cible.Position
	local bas, survol = false, false
	local function poser()
		local dy = bas and 4 or (survol and -2 or 0)
		TweenService:Create(cible, RAPIDE, { Position = p0 + UDim2.fromOffset(0, dy) }):Play()
	end
	b.MouseButton1Down:Connect(function()
		bas = true
		poser()
	end)
	b.MouseButton1Up:Connect(function()
		bas = false
		poser()
	end)
	b.MouseEnter:Connect(function()
		if not souris() then return end
		survol = true
		eclairer(cible, true)
		poser()
	end)
	b.MouseLeave:Connect(function()
		bas = false
		if survol then eclairer(cible, false) end
		survol = false
		poser()
	end)
	b.Activated:Connect(function()
		Sons.jouer("tap")
		Hud.vibre(6)
	end)
end

-- ── L'HAPTIQUE (hap du web) : UN seul endroit, et il écoute l'interrupteur VIBRATIONS. `ms` : la durée du coup (6 un appui,
-- 40 un crash). La manette vibre ; le téléphone aussi quand Roblox le permet (moteur « Touch »). ──
Hud.vib = true
function Hud.vibre(ms: number)
	if not Hud.vib then return end
	pcall(function()
		local HS = game:GetService("HapticService")
		for _, t in { Enum.UserInputType.Gamepad1, Enum.UserInputType.Touch } do
			if HS:IsVibrationSupported(t) then
				local m = HS:IsMotorSupported(t, Enum.VibrationMotor.Small) and Enum.VibrationMotor.Small or Enum.VibrationMotor.Large
				HS:SetMotor(t, m, math.clamp(0.25 + ms / 60, 0.25, 1))
				task.delay(math.clamp(ms / 1000 + 0.04, 0.05, 0.25), function() pcall(function() HS:SetMotor(t, m, 0) end) end)
			end
		end
	end)
end

-- ── LA PLAQUE PENCHÉE (charte v4 du web : « penché = je touche ») ──
-- Roblox ne sait pas incliner un cadre. La plaque est faite de fines BANDES horizontales, chacune décalée d'un cran : un
-- parallélogramme en escalier de pixels (le haut part vers la droite) — exact à toutes les tailles, et dans le ton du jeu.
-- Le filet de couleur suit le bord gauche. Dessous, la TRANCHE : la plaque a une épaisseur, l'appui l'enfonce dedans.
-- (essayé d'abord : couper un rectangle par un dégradé de transparence tourné — les bords tombaient à côté selon la taille)
local PENTE = math.tan(math.rad(12))
local CRAN = 4 -- hauteur d'une bande (px de l'interface)
-- LA PLAQUE v2 (5/10, Sacha : « tous les boutons sont super moches ») : sombres et plates, toutes pareilles, elles se perdaient
-- dans le décor. Désormais : un CONTOUR d'encre de 3 px tout autour (le parallélogramme se détache de n'importe quel fond), un
-- DÉGRADÉ de lumière (la bande du haut éclairée, celle du bas dans l'ombre — la plaque a du volume), un filet plus large, une
-- tranche plus épaisse et cernée. Chaque bande retient sa place (attribut « k », 0 en haut, 1 en bas) : repeindre garde le relief.
local CONTOUR = 3
local function ombrer(c: Color3, k: number): Color3 return Color3.new(c.R * k, c.G * k, c.B * k) end
local function relief(c: Color3, k: number): Color3 return c:Lerp(Color3.new(1, 1, 1), 0.14):Lerp(ombrer(c, 0.8), k) end
-- rend le conteneur (à placer), la plaque (ce qui s'enfonce) et le bouton
local function penche(parent: Instance, taille: UDim2, pos: UDim2, ancre: Vector2?, fond: Color3, filet: Color3?, tranche: Color3, lisere: Color3?): (Frame, Frame, TextButton)
	local boite = inst("Frame", { BackgroundTransparency = 1, Size = taille, Position = pos, AnchorPoint = ancre or Vector2.zero }, parent)
	local tr = inst("Frame", { BackgroundColor3 = tranche, BorderSizePixel = 0 }, boite)
	inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, tr)
	local plaque = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, boite)
	plaque:SetAttribute("fond", fond) -- (le survol éclaire la face à partir de sa couleur du moment — voir `eclairer`)
	local contour = inst("Frame", { Name = "Contour", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, plaque)
	local bandes = inst("Frame", { Name = "Bandes", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, plaque)
	local hauteur = -1
	local fondC, filetC = fond, filet
	local function batir()
		-- (la hauteur en px de l'INTERFACE : la racine est mise à l'échelle, AbsoluteSize est en px d'écran)
		local Hh = taille.Y.Offset
		if taille.Y.Scale ~= 0 then
			local e = boite:FindFirstAncestorWhichIsA("GuiObject")
			Hh = math.floor(taille.Y.Scale * (e and e.AbsoluteSize.Y or 0) + taille.Y.Offset + 0.5)
		end
		if Hh == hauteur or Hh < 4 then return end
		hauteur = Hh
		bandes:ClearAllChildren()
		contour:ClearAllChildren()
		local d = math.floor(Hh * PENTE + 0.5)
		local n = math.ceil(Hh / CRAN)
		local function cerne(x: number, y: number, h: number)
			inst("Frame", { BackgroundColor3 = C.encre, BorderSizePixel = 0, Size = UDim2.new(1, -d + 2 * CONTOUR, 0, h), Position = UDim2.fromOffset(x - CONTOUR, y) }, contour)
		end
		for i = 0, n - 1 do
			local y = i * CRAN
			local h = math.min(CRAN, Hh - y)
			local x = math.floor((Hh - y - h / 2) * PENTE + 0.5)
			local k = (n > 1) and i / (n - 1) or 0
			cerne(x, y, h)
			if i == 0 then cerne(x, -CONTOUR, CONTOUR) end
			if i == n - 1 then cerne(x, Hh, CONTOUR) end
			local bande = inst("Frame", { BackgroundColor3 = (i == 0 and lisere) or relief(fondC, k), BorderSizePixel = 0, Size = UDim2.new(1, -d, 0, h), Position = UDim2.fromOffset(x, y) }, bandes)
			if i == 0 and lisere then
				-- le biseau clair : deux pixels en haut de la première bande
				bande.Name = "l"
				local c9 = inst("Frame", { Name = "c", BackgroundColor3 = relief(fondC, k), BorderSizePixel = 0, Size = UDim2.new(1, 0, 1, -2), Position = UDim2.fromOffset(0, 2) }, bande)
				c9:SetAttribute("k", k)
			else
				bande.Name = "c"
				bande:SetAttribute("k", k)
			end
			if filetC then inst("Frame", { Name = "f", BackgroundColor3 = filetC, BorderSizePixel = 0, Size = UDim2.new(0, 7, 1, 0) }, bande) end
		end
		tr.Size = UDim2.new(1, -d, 0, 8)
		tr.Position = UDim2.new(0, 0, 1, -1)
	end
	batir()
	if taille.Y.Scale ~= 0 then boite:GetPropertyChangedSignal("AbsoluteSize"):Connect(batir) end
	local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), FontFace = PIXI, Text = "",
		TextColor3 = C.texte, TextSize = 16, AutoButtonColor = false }, plaque)
	return boite, plaque, b
end
-- repeindre une plaque penchée (le bouton NITRO s'embrase à l'appui, sa bande change de couleur avec la réserve)
local function repeindre(plaque: Instance, fond: Color3?, filet: Color3?)
	if fond then plaque:SetAttribute("fond", fond) end
	for _, d in plaque:GetDescendants() do
		if fond and d.Name == "c" then (d :: Frame).BackgroundColor3 = relief(fond, d:GetAttribute("k") or 0) end
		if filet and d.Name == "f" then (d :: Frame).BackgroundColor3 = filet end
	end
end

-- ── LES ICÔNES PIXEL du web (grilles 9 × 9 dessinées à la main) : une barrette par suite de pixels, d'une couleur ou en BANDES
-- (lèvre, plein, ombre : `{ { 0.22, clair }, { 0.64, plein }, { 1, sombre } }`, la part de hauteur où la bande s'arrête).
local function couleurLigne(bandes: any, y: number): Color3
	if typeof(bandes) == "Color3" then return bandes end
	local f = (y + 0.5) / 9
	for _, q in bandes do
		if f <= q[1] then return q[2] end
	end
	return bandes[#bandes][2]
end
local function icone(parent: Instance, nom: string, px: number, bandes: any, pos: UDim2?, ancre: Vector2?): Frame
	local f = inst("Frame", { Name = "Icone", BackgroundTransparency = 1, Size = UDim2.fromOffset(9 * px, 9 * px), Position = pos or UDim2.new(),
		AnchorPoint = ancre or Vector2.zero }, parent)
	local y = 0
	-- (un nom du carnet d'icônes, ou une grille écrite sur place : « ....#....|… »)
	for ligne in string.gmatch(string.find(nom, "|", 1, true) and nom or (Icones[nom] or Icones.croix), "[^|]+") do
		local x = 1
		while x <= 9 do
			if string.sub(ligne, x, x) == "#" then
				local x1 = x
				while x1 < 9 and string.sub(ligne, x1 + 1, x1 + 1) == "#" do x1 += 1 end
				local p = inst("Frame", { BackgroundColor3 = couleurLigne(bandes, y), BorderSizePixel = 0, Size = UDim2.fromOffset((x1 - x + 1) * px, px),
					Position = UDim2.fromOffset((x - 1) * px, y * px) }, f)
				p:SetAttribute("y", y)
				x = x1 + 1
			else
				x += 1
			end
		end
		y += 1
	end
	return f
end
local function teinter(f: Instance, bandes: any)
	for _, p in f:GetChildren() do
		local y = p:GetAttribute("y")
		if y then (p :: Frame).BackgroundColor3 = couleurLigne(bandes, y) end
	end
end

-- ── LA JAUGE (le modèle du web : la barre NITRO) : fond d'encre, cadre indigo, épaisseur dessous, remplissage en QUATRE BANDES
-- (lèvre claire, plein, plein sombre, ourlet), curseur blanc au bout. Les familles de couleur sont celles du web (:root de hudDA).
local function hx(h: string): Color3 return Color3.fromHex(h) end
local FAM = {
	nitro = { hx("ffd58f"), hx("ff8d2e"), hx("ff7415"), hx("ad4200") },
	bleu = { hx("b5c4ff"), hx("4a68f0"), hx("2a44c8"), hx("16247a") },    -- la réserve BLEUE
	violet = { hx("f1dcff"), hx("b06bff"), hx("8a3dff"), hx("3e1287") },  -- la NITRO INFINIE
	air = { hx("d8fbff"), hx("5ee6ff"), hx("18b0e2"), hx("0b4f7a") },     -- l'AIR : cyan
	or_ = { hx("fff0b8"), hx("ffc93a"), hx("f29a00"), hx("7a4200") },     -- le temps qui presse
	rouge = { hx("ffd0d6"), hx("ff5a6e"), hx("e0203c"), hx("6e0014") },   -- il ne reste plus rien
	menthe = { hx("e6fffa"), hx("7dffec"), hx("22d6bd"), hx("0b5e55") },  -- AIRTIME INFINI
}
Hud.FAM = FAM
local J_ENCRE, J_FOND, J_CURS = hx("170f55"), hx("0d0a2a"), hx("fff6d8")
local function jauge(parent: Instance, taille: UDim2, pos: UDim2, ancre: Vector2?, cadre: number, levre: number): any
	local boite = inst("Frame", { BackgroundTransparency = 1, Size = taille, Position = pos, AnchorPoint = ancre or Vector2.zero }, parent)
	inst("Frame", { BackgroundColor3 = J_ENCRE, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, cadre + 1), Position = UDim2.fromScale(0, 1) }, boite) -- l'épaisseur
	local cad = inst("Frame", { BackgroundColor3 = J_ENCRE, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1) }, boite)
	local creux = inst("Frame", { BackgroundColor3 = J_FOND, BorderSizePixel = 0, Size = UDim2.new(1, -2 * cadre, 1, -2 * cadre), Position = UDim2.fromOffset(cadre, cadre) }, cad)
	local function plein(): (Frame, { Frame })
		local f = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromScale(0, 1) }, creux)
		local l = {
			inst("Frame", { BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, levre) }, f),
			inst("Frame", { BorderSizePixel = 0, Size = UDim2.new(1, 0, 0.5, -levre), Position = UDim2.fromOffset(0, levre) }, f),
			inst("Frame", { BorderSizePixel = 0, Size = UDim2.new(1, 0, 0.5, -levre), Position = UDim2.fromScale(0, 0.5) }, f),
			inst("Frame", { BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, levre), Position = UDim2.new(0, 0, 1, -levre) }, f),
		}
		return f, l
	end
	local f1, c1 = plein()
	local f2, c2 = plein()
	for i, q in c2 do q.BackgroundColor3 = FAM.bleu[i] end
	local curseur = inst("Frame", { BackgroundColor3 = J_CURS, BorderSizePixel = 0, Size = UDim2.new(0, cadre + 1, 1, cadre * 2), AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0, 0.5), ZIndex = 2 }, creux)
	local o: any = { boite = boite, cadre = cad }
	local fam1 = ""
	-- a : la part pleine, dans la couleur de `famille` ; b : la réserve bleue, à la suite
	function o.regler(a: number, famille: string, b: number?)
		a = math.clamp(a, 0, 1)
		local r = math.clamp(b or 0, 0, 1 - a)
		f1.Size = UDim2.fromScale(a, 1)
		f2.Position = UDim2.fromScale(a, 0)
		f2.Size = UDim2.fromScale(r, 1)
		curseur.Position = UDim2.fromScale(a + r, 0.5)
		curseur.Visible = a + r > 0.004
		if famille ~= fam1 then
			fam1 = famille
			for i, q in c1 do q.BackgroundColor3 = (FAM[famille] or FAM.nitro)[i] end
		end
	end
	-- le cadre bat (à sec, urgence) : la couleur du cadre, nil = l'encre
	function o.alerte(c: Color3?) cad.BackgroundColor3 = c or J_ENCRE end
	o.regler(1, "nitro", 0)
	return o
end

-- une TUILE du web : une plaque penchée de carbone, son filet de couleur à gauche, son libellé
-- `ico` : une icône pixel du web, de la couleur du filet. `pose` : "h" icône + libellé côte à côte, centrés (défaut) · "v" l'icône
-- AU-DESSUS du libellé (les tuiles carrées du menu) · "g" l'icône calée à gauche (le libellé peut changer : SON ON / OFF)
-- les COULEURS d'une tuile, tirées de son filet : la face (le filet plongé dans la nuit), la tranche, le liseré du haut
-- (v3, 5/10) : la face était le filet à 34 % noyé à 42 % dans le carbone — sur le ciel bleu de l'accueil, cinq plaques boueuses.
-- Elle garde désormais la moitié de sa couleur (saturée, jamais délavée), et son liseré est le filet presque plein : un reflet net.
local function teintesTuile(filet: Color3): (Color3, Color3, Color3)
	return ombrer(filet, 0.5):Lerp(C.carbone, 0.3), ombrer(filet, 0.16), ombrer(filet, 0.95)
end
local TUILES = setmetatable({}, { __mode = "k" }) :: { [TextButton]: any }
local function tuile(parent: Instance, libelle: string, filet: Color3, taille: UDim2, pos: UDim2, ancre: Vector2?, corps: number?, ico: string?, pose: string?): TextButton
	-- (v2 : chaque tuile prend SA couleur — le fond est son filet plongé dans la nuit, le liseré du haut son filet éclairé : un
	-- bouton cyan, un rose, un vert se distinguent au premier coup d'œil, au lieu de cinq plaques bleu nuit identiques)
	local fondT, trancheT, lisereT = teintesTuile(filet)
	local _, plaque, b = penche(parent, taille, pos, ancre, fondT, filet, trancheT, lisereT)
	local cs = corps or 16
	b.Text = libelle
	b.TextSize = cs
	inst("UIStroke", { Color = C.encre, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual }, b)
	TUILES[b] = { plaque = plaque, filet = filet }
	if ico then
		local em = cs * CH -- la hauteur d'un caractère
		if libelle == "" then
			icone(plaque, ico, math.max(2, math.floor(cs / 6 + 0.5)), filet, UDim2.fromScale(0.5, 0.5), Vector2.new(0.5, 0.5))
		elseif pose == "v" then
			local px = math.max(2, math.floor(em * 0.36 + 0.5))
			local ecart = math.floor(em * 0.55)
			local total = 9 * px + ecart + em
			icone(plaque, ico, px, filet, UDim2.new(0.5, 0, 0.5, -total / 2), Vector2.new(0.5, 0))
			b.TextYAlignment = Enum.TextYAlignment.Top
			inst("UIPadding", { PaddingTop = UDim.new(0.5, math.floor(-total / 2 + 9 * px + ecart - (cs - em) / 2)) }, b)
		elseif pose == "g" then
			-- (v3 : l'icône calée à gauche faisait 18 px dans une tuile de 64 — un pixel par case de plus, elle se reconnaît)
			local px = math.max(3, math.floor(em * 0.24 + 0.5))
			icone(plaque, ico, px, filet, UDim2.new(0, 32, 0.5, 0), Vector2.new(0, 0.5))
			b.TextXAlignment = Enum.TextXAlignment.Left
			inst("UIPadding", { PaddingLeft = UDim.new(0, 32 + 9 * px + math.floor(em * 0.7)) }, b)
		else
			-- (la police pixel est à chasse fixe : la largeur du libellé se calcule)
			local px = math.max(2, math.floor(em * 0.19 + 0.5))
			local ecart = math.floor(em * 0.7)
			local large = 9 * px + ecart + utf8.len(libelle) * em
			icone(plaque, ico, px, filet, UDim2.new(0.5, -large / 2, 0.5, 0), Vector2.new(0, 0.5))
			inst("UIPadding", { PaddingLeft = UDim.new(0, 9 * px + ecart) }, b)
		end
		TUILES[b].ico = plaque:FindFirstChild("Icone")
	end
	retour(b, plaque)
	ajuster(b, 16, true)
	return b
end
-- une tuile ÉTEINTE (SON OFF, MUSIQUE OFF…) : la face passe au gris de nuit, le filet et l'icône au terne — l'état se lit avant le mot
local function allumer(b: TextButton, on: boolean)
	local t = TUILES[b]
	if not t then return end
	local filet = on and t.filet or C.terne
	local fondT, _, lisereT = teintesTuile(filet)
	repeindre(t.plaque, fondT, filet)
	local l = t.plaque:FindFirstChild("l", true)
	if l then (l :: Frame).BackgroundColor3 = lisereT end
	if t.ico then teinter(t.ico, filet) end
	b.TextColor3 = on and C.texte or C.texte2
end

-- le GRAND bouton doré (REJOUER, REPRENDRE) : UN lingot par écran, penché lui aussi
local function lingot(parent: Instance, libelle: string, taille: UDim2, pos: UDim2, ancre: Vector2?, corps: number?): TextButton
	local _, plaque, b = penche(parent, taille, pos, ancre, Color3.fromRGB(255, 190, 32), nil, C.orSh, Color3.fromRGB(255, 248, 170))
	b.Text = libelle
	b.TextColor3 = Color3.fromRGB(40, 22, 4)
	b.TextSize = corps or 34
	-- (v3, 5/10) LES LETTRES GRAVÉES : sous le mot d'encre, son double d'or pâle, 3 px plus bas — le mot est frappé DANS le métal, pas
	-- posé dessus. Le double suit tout ce qu'on fait au mot (texte, corps, question de confirmation…).
	do
		local grave = inst("TextLabel", { Name = "Grave", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Position = UDim2.fromOffset(0, 3),
			FontFace = PIXI, TextColor3 = Color3.fromRGB(255, 246, 200), TextTransparency = 0.15, ZIndex = 2 }, plaque)
		local function copie()
			grave.Text, grave.TextSize, grave.TextScaled, grave.RichText = b.Text, b.TextSize, b.TextScaled, b.RichText
			grave.Visible = b.Visible and b.TextTransparency < 0.9
		end
		for _, p9 in { "Text", "TextSize", "TextScaled", "RichText", "Visible", "TextTransparency" } do b:GetPropertyChangedSignal(p9):Connect(copie) end
		copie()
	end
	-- (v2) le REFLET : une barre de lumière en biais qui traverse le lingot toutes les 3 s — l'or attire l'œil, c'est LE bouton
	do
		local reflet = inst("Frame", { Name = "Reflet", BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.55, BorderSizePixel = 0,
			Size = UDim2.new(0, 22, 1, -6), Position = UDim2.new(-0.2, 0, 0, 3), Rotation = 12, ZIndex = 2 }, plaque)
		inst("UIGradient", { Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(0.5, 0.2), NumberSequenceKeypoint.new(1, 1) }) }, reflet)
		local clip = inst("Frame", { BackgroundTransparency = 1, ClipsDescendants = true, Size = UDim2.new(1, -math.floor(PENTE * 40), 1, 0), ZIndex = 2 }, plaque)
		b.ZIndex = 3 -- (le texte passe devant le reflet)
		reflet.Parent = clip
		task.spawn(function()
			while reflet.Parent do
				reflet.Position = UDim2.new(-0.15, 0, 0, 3)
				TweenService:Create(reflet, TweenInfo.new(0.7, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut), { Position = UDim2.new(1.1, 0, 0, 3) }):Play()
				task.wait(3.2)
			end
		end)
	end
	retour(b, plaque)
	ajuster(b, 30, true)
	return b
end

-- RETOUR : la plaque penchée cyan des sous-écrans du web, en bas à gauche (sous le pouce, jamais en haut : la charte)
-- (v3, 5/10) aux couleurs des tuiles cyan : la plaque carbone presque noire se lisait comme un trou, pas comme un bouton
local function boutonRetour(parent: Instance): TextButton
	local fondR, trancheR, lisereR = teintesTuile(C.cyan)
	local _, plaque, b = penche(parent, UDim2.fromOffset(290, 104), UDim2.new(0, 60, 1, -34), Vector2.new(0, 1), fondR, C.cyan, trancheR, lisereR)
	icone(plaque, "gauche", 4, C.cyan, UDim2.new(0, 56, 0.5, 0), Vector2.new(0, 0.5))
	b.Text = T.retour
	b.TextSize = 32
	b.TextXAlignment = Enum.TextXAlignment.Left
	inst("UIPadding", { PaddingLeft = UDim.new(0, 112) }, b)
	inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual }, b)
	retour(b, plaque)
	return b
end

-- le KIT d'interface, prêté aux autres écrans (garage, missions, carrière…) : une seule charte
Hud.kit = { inst = inst, texte = texte, degrade = degrade, carbone = carbone, tuile = tuile, lingot = lingot, retour = retour,
	penche = penche, repeindre = repeindre, icone = icone, teinter = teinter, jauge = jauge, boutonRetour = boutonRetour,
	allumer = allumer, ajuster = ajuster, lisere = lisere,
	PIX = PIX, PIXI = PIXI, TXT = TXT, RAPIDE = RAPIDE, LENTE = LENTE }

-- ── les formats d'argent (fmtC, L12383) ──
local UNITES = FR and { { 1e15, "Bd" }, { 1e12, "Bn" }, { 1e9, "Md" }, { 1e6, "M" }, { 1e3, "k" } }
	or { { 1e15, "Qa" }, { 1e12, "T" }, { 1e9, "B" }, { 1e6, "M" }, { 1e3, "k" } }
-- la police pixel n'a pas de capitales accentuées : tout ce qui s'écrit en pixels passe par ici
local ACCENTS = { ["É"] = "E", ["È"] = "E", ["Ê"] = "E", ["Ë"] = "E", ["À"] = "A", ["Â"] = "A", ["Î"] = "I", ["Ï"] = "I", ["Ô"] = "O", ["Û"] = "U", ["Ù"] = "U", ["Ç"] = "C", ["Œ"] = "OE" }
function Hud.sansAccent(s: string): string
	for a, b in ACCENTS do s = string.gsub(s, a, b) end
	return s
end
function Hud.nombre(v: number): string
	local s
	if v < 1000 then
		s = string.format("%.2f", v)
	else
		s = string.format("%.0f", v)
		for _, u in UNITES do
			if v >= u[1] * 0.9995 then
				local q = v / u[1]
				s = (q < 100 and string.format("%.1f", q) or string.format("%.0f", q))
				s = string.gsub(s, "%.0$", "") .. " " .. u[2] -- (« $ 2 k », pas « $ 2,0 k » : fmtC du web)
				break
			end
		end
	end
	if FR then s = string.gsub(s, "%.", ",") end
	return s
end
-- (cashTxt, L12856) LE COMPTEUR DE LA COURSE : compact au-delà de 100 000 ; les centimes seulement sous 10 $ (la mise de départ, 1,61) ;
-- sinon un entier, avec ses séparateurs de milliers
function Hud.cash(v: number): string
	v = math.max(0, v)
	if v >= 1e5 then return Hud.nombre(v) end
	local e = math.floor(v + 1e-6)
	if v < 10 and v - e > 0.004 then
		local t = string.format("%.2f", v)
		return FR and (string.gsub(t, "%.", ",")) or t
	end
	local out = string.reverse(string.gsub(string.reverse(tostring(e)), "(%d%d%d)", FR and "%1 " or "%1,"))
	return (string.gsub(out, "^[ ,]", ""))
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
	local out = string.reverse(string.gsub(string.reverse(s), "(%d%d%d)", FR and "%1 " or "%1,"))
	return (string.gsub(out, "^[ ,]", ""))
end

-- l'ÉCLAIR de la nitro, en trois bandes (lèvre, plein, ombre) — pas un aplat
local ECLAIR = {
	nitro = { { 0.22, hx("fff3c4") }, { 0.64, hx("ffb81f") }, { 1, hx("e07a00") } },
	violet = { { 0.24, Color3.new(1, 1, 1) }, { 0.6, FAM.violet[1] }, { 1, FAM.violet[2] } },
	feu = { { 0.3, Color3.new(1, 1, 1) }, { 0.7, hx("fff3c4") }, { 1, hx("ffb81f") } },
}

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
	local tactile = Config.TACTILE_TEST == true or (UserInputService.TouchEnabled and not UserInputService.KeyboardEnabled)
	-- tout est dessiné pour un écran de 720 px de haut : une RACINE de 1/k de l'écran, agrandie k fois
	local racine = inst("Frame", { Name = "Racine", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, gui)
	Hud.racine = racine -- les autres écrans (garage…) se posent dans la même racine mise à l'échelle
	local echelle = inst("UIScale", {}, racine)
	local function recaler()
		-- (la hauteur UTILE : Roblox garde une bande en haut pour ses propres boutons — mesurer la fenêtre entière coupait le bas
		-- de l'écran de fin de 47 px)
		local cam = workspace.CurrentCamera
		local h = gui.AbsoluteSize.Y
		if h < 50 then h = (cam and cam.ViewportSize.Y or 720) - 36 end
		-- (pas de plancher sur téléphone : à 0,8 les 720 px dessinés ne tenaient plus dans 390 px d'écran, REJOUER sortait par le bas —
		-- et les tailles sont celles du web, mesurées justement sur un écran de téléphone)
		local k = math.clamp(h / 720, 0.35, 2)
		echelle.Scale = k
		racine.Size = UDim2.fromScale(1 / k, 1 / k)
		-- (mise au point) workspace:SetAttribute("DbgLarge", 1280) : l'interface se dessine comme sur un écran de cette largeur
		-- (1280 = un écran 16:9), au milieu de la fenêtre — pour vérifier qu'aucun écran ne se chevauche sur un écran moins allongé
		local force = workspace:GetAttribute("DbgLarge")
		if type(force) == "number" and force > 300 then
			racine.AnchorPoint = Vector2.new(0.5, 0)
			racine.Position = UDim2.fromScale(0.5, 0)
			racine.Size = UDim2.new(0, force, 1 / k, 0)
		else
			racine.AnchorPoint = Vector2.zero
			racine.Position = UDim2.new()
		end
	end
	workspace:GetAttributeChangedSignal("DbgLarge"):Connect(recaler)
	recaler()
	if workspace.CurrentCamera then workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize"):Connect(recaler) end
	gui:GetPropertyChangedSignal("AbsoluteSize"):Connect(recaler)
	local gStick = inst("ScreenGui", { Name = "CashCarStick", ResetOnSpawn = false, IgnoreGuiInset = true,
		ScreenInsets = Enum.ScreenInsets.None, DisplayOrder = 6 }, pg)

	-- ══ CHARGEMENT v3 (5/10, Sacha : « l'écran de chargement est super moche ») ══
	-- Le COUCHANT RÉTRO du jeu (le ciel violet qui rougit vers l'horizon, le soleil à bandes, la grille néon qui file vers lui), le
	-- GRAND logo de l'accueil, une BARRE qui avance, une ASTUCE qui change toutes les 3 s. Tout en cadres : rien à charger.
	-- (v3) mesuré au banc : la grille partait À L'ENVERS (les lignes tournaient autour de leur milieu : elles se rejoignaient en bas de
	-- l'écran au lieu de l'horizon), les bandes du soleil dépassaient du disque, la barre et l'astuce se lisaient À TRAVERS la grille,
	-- le logo s'affichait une seconde dans la police de secours, et la bande des boutons de Roblox montrait le ciel bleu du jeu.
	local JUPE = 400 -- (le fond déborde de la racine de chaque côté : la bande du haut et les bords de l'encoche sont couverts)
	E.charge = inst("Frame", { Name = "Charge", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), ZIndex = 50 }, racine)
	do
		local fond = inst("Frame", { Name = "Jupe", BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.new(1, 2 * JUPE, 1, 2 * JUPE),
			Position = UDim2.fromOffset(-JUPE, -JUPE), ZIndex = 50 }, E.charge)
		-- (les repères du ciel sont donnés en part de l'ÉCRAN, ramenés à la jupe qui le déborde)
		local function kp(s: number, c: Color3) return ColorSequenceKeypoint.new(math.clamp((s * 720 + JUPE) / (720 + 2 * JUPE), 0, 1), c) end
		inst("UIGradient", { Rotation = 90, Color = ColorSequence.new({ ColorSequenceKeypoint.new(0, Color3.fromRGB(8, 4, 26)),
			kp(0, Color3.fromRGB(12, 6, 34)), kp(0.42, Color3.fromRGB(58, 14, 86)), kp(0.6, Color3.fromRGB(176, 40, 116)), kp(0.628, Color3.fromRGB(232, 70, 136)),
			kp(0.632, Color3.fromRGB(30, 8, 52)), kp(1, Color3.fromRGB(10, 4, 24)), ColorSequenceKeypoint.new(1, Color3.fromRGB(6, 2, 16)) }) }, fond)
		-- le HALO du couchant : des disques roses emboîtés derrière le soleil, coupés net à l'horizon
		local ciel = inst("Frame", { BackgroundTransparency = 1, ClipsDescendants = true, Size = UDim2.new(1, 0, 0.63, JUPE), Position = UDim2.fromOffset(0, -JUPE), ZIndex = 50 }, E.charge)
		for k = 1, 4 do
			local d = 900 - k * 150
			local h = inst("Frame", { BackgroundColor3 = Color3.fromRGB(255, 70 + k * 18, 160 - k * 10), BackgroundTransparency = 0.9 - k * 0.012, BorderSizePixel = 0,
				Size = UDim2.fromOffset(d, d), Position = UDim2.new(0.5, 0, 1, 0), AnchorPoint = Vector2.new(0.5, 0.5), ZIndex = 50 }, ciel)
			inst("UICorner", { CornerRadius = UDim.new(0.5, 0) }, h)
		end
		-- le SOLEIL à bandes, posé sur l'horizon (63 % de la hauteur) : des tranches de 4 px de la largeur exacte du disque — un rond de
		-- pixel art — et des coupes de plus en plus larges vers le bas (le ciel se voit à travers, comme sur les pochettes de 1986)
		local R = 152
		local sol = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(2 * R, R), Position = UDim2.fromScale(0.5, 0.63), AnchorPoint = Vector2.new(0.5, 1), ZIndex = 50 }, E.charge)
		-- (les coupes en part de la hauteur du soleil : de plus en plus larges, les bandes de plus en plus fines)
		local COUPES = { { 0.47, 0.5 }, { 0.58, 0.61 }, { 0.68, 0.73 }, { 0.78, 0.83 }, { 0.87, 0.94 }, { 0.965, 2 } }
		for y = 0, R - 4, 4 do
			local yc = y + 2
			local coupe = false
			for _, q in COUPES do if yc >= q[1] * R and yc < q[2] * R then coupe = true end end
			if not coupe then
				local dy = R - yc
				local w = 2 * math.floor(math.sqrt(math.max(0, R * R - dy * dy)) + 0.5) -- (la corde ENTIÈRE : deux demi-cordes)
				inst("Frame", { BackgroundColor3 = Color3.fromRGB(255, 232, 96):Lerp(Color3.fromRGB(255, 56, 150), (yc / R) ^ 1.3), BorderSizePixel = 0,
					Size = UDim2.fromOffset(w, 4), Position = UDim2.new(0.5, 0, 0, y), AnchorPoint = Vector2.new(0.5, 0), ZIndex = 50 }, sol)
			end
		end
		-- la GRILLE : des lignes qui partent TOUTES du point de fuite (caché juste derrière l'horizon) et s'ouvrent vers le bas, et des
		-- traverses qui filent vers nous (le sol défile). Chaque ligne tourne autour de son MILIEU (c'est ainsi que Roblox fait tourner un
		-- cadre) : on la pose donc au milieu du segment point de fuite → bord bas, à la bonne longueur et au bon angle.
		local GW, GH, VY = 3600, math.floor(0.37 * 720) + JUPE, -70
		local grille = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(GW, GH), Position = UDim2.fromScale(0.5, 0.63), AnchorPoint = Vector2.new(0.5, 0),
			ZIndex = 50, ClipsDescendants = true }, E.charge)
		for k = -16, 16 do
			local dx, dy = k * 150, GH - VY
			local L = math.sqrt(dx * dx + dy * dy)
			inst("Frame", { BackgroundColor3 = Color3.fromRGB(255, 62, 200), BackgroundTransparency = 0.2 + math.min(0.5, math.abs(k) * 0.03), BorderSizePixel = 0,
				AnchorPoint = Vector2.new(0.5, 0.5), Size = UDim2.fromOffset(2, L), Position = UDim2.fromOffset(GW / 2 + dx / 2, VY + dy / 2),
				Rotation = -math.deg(math.atan2(dx, dy)), ZIndex = 50 }, grille)
		end
		E.chargeTraverses = {}
		for k = 1, 8 do
			E.chargeTraverses[k] = inst("Frame", { BackgroundColor3 = Color3.fromRGB(0, 234, 255), BackgroundTransparency = 0.35, BorderSizePixel = 0,
				Size = UDim2.new(1, 0, 0, 2), ZIndex = 50 }, grille)
		end
		-- la brume de l'horizon : un trait de lumière rose qui fond le soleil dans la grille
		inst("Frame", { BackgroundColor3 = Color3.fromRGB(255, 140, 210), BackgroundTransparency = 0.2, BorderSizePixel = 0, Size = UDim2.new(1, 2 * JUPE, 0, 3),
			Position = UDim2.new(0, -JUPE, 0.63, -1), ZIndex = 50 }, E.charge)
		-- le BANDEAU d'encre sous la barre : la grille ne passe plus à travers les mots (la même bande que la bannière de niveau)
		local bande = inst("Frame", { BackgroundColor3 = C.encre, BackgroundTransparency = 0, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 190),
			Position = UDim2.fromScale(0, 0.8), AnchorPoint = Vector2.new(0, 0.5), ZIndex = 51 }, E.charge)
		inst("UIGradient", { Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(0.22, 0.32),
			NumberSequenceKeypoint.new(0.78, 0.32), NumberSequenceKeypoint.new(1, 1) }) }, bande)
	end
	-- le LOGO de l'accueil, en grand (les deux mots en or et en rose, la barre des trois néons)
	-- (Roblox plafonne un texte à 100 px : le logo est écrit à 100, puis grandi d'un bloc ×1,7 par une boîte qui le porte — l'intro du
	-- studio, elle, fait battre le logo par sa propre échelle)
	local boiteLogo = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(460, 130), Position = UDim2.fromScale(0.5, 0.3), AnchorPoint = Vector2.new(0.5, 0.5), ZIndex = 51 }, E.charge)
	inst("UIScale", { Scale = 1.7 }, boiteLogo)
	local lg = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), ZIndex = 51 }, boiteLogo)
	do
		local function mot(txt: string, x: number, bas: Color3)
			local o = texte(lg, { Text = txt, TextSize = 100, TextColor3 = Color3.fromRGB(90, 40, 10), Size = UDim2.fromOffset(260, 104),
				Position = UDim2.new(0.5, x + 5, 0, 6), AnchorPoint = Vector2.new(0.5, 0), TextWrapped = false, contour = false, italique = true, ZIndex = 51 })
			o.TextTransparency = 0.1
			local t = texte(lg, { Text = txt, TextSize = 100, TextColor3 = Color3.new(1, 1, 1), Size = UDim2.fromOffset(260, 104),
				Position = UDim2.new(0.5, x, 0, 0), AnchorPoint = Vector2.new(0.5, 0), TextWrapped = false, epais = 4, contourCouleur = Color3.fromRGB(60, 24, 6),
				italique = true, ZIndex = 52 })
			-- (le LOGO est la seule dérogation de la charte au texte en dégradé : c'est une image de marque)
			inst("UIGradient", { Rotation = 90, Color = ColorSequence.new({ ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 246, 180)),
				ColorSequenceKeypoint.new(0.5, Color3.fromRGB(255, 196, 40)), ColorSequenceKeypoint.new(1, bas) }) }, t)
		end
		-- (un caractère pixel fait 5/9 de son corps : CASH ≈ 222 px, CAR ≈ 167 px, 22 px entre les deux — comme à l'accueil)
		mot("CASH", -94, Color3.fromRGB(255, 150, 30))
		mot("CAR", 122, Color3.fromRGB(255, 94, 122))
		-- (la barre des trois néons court sous les DEUX mots, de C à R : 411 px)
		local barre = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(414, 7), Position = UDim2.new(0.5, 10, 0, 110), AnchorPoint = Vector2.new(0.5, 0), ZIndex = 52 }, lg)
		for i, c in { C.magenta, C.cyan, C.or_ } do
			inst("Frame", { BackgroundColor3 = c, BorderSizePixel = 0, Size = UDim2.new(i == 1 and 0.44 or 0.28, -8, 1, 0),
				Position = UDim2.fromScale(i == 1 and 0 or (i == 2 and 0.44 or 0.72), 0), ZIndex = 52 }, barre)
		end
	end
	E.chargeLogo = lg
	E.chargeEchelle = inst("UIScale", {}, lg)
	-- la BARRE de chargement : LA jauge du jeu (la barre NITRO, en or), et la ligne d'état dessous
	E.chargeBloc = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(660, 130), Position = UDim2.fromScale(0.5, 0.8), AnchorPoint = Vector2.new(0.5, 0.5), ZIndex = 52 }, E.charge)
	E.chargeJ = jauge(E.chargeBloc, UDim2.new(1, 0, 0, 34), UDim2.fromOffset(0, 0), nil, 5, 4)
	E.chargeJ.regler(0, "or_", 0)
	-- (l'état : calé à GAUCHE sur la place de la phrase sans ses points — les points qui défilent ne font plus danser la ligne ; hors du
	-- bloc de la barre : après l'intro, le chargement peut encore parler sans elle)
	local largeEtat = math.floor(utf8.len(T.chargement) * 26 * CH + 0.5)
	E.chargeTxt = texte(E.charge, { Text = T.chargement, TextSize = 26, TextColor3 = C.texte, Position = UDim2.new(0.5, -largeEtat / 2, 0.8, -20),
		Size = UDim2.fromOffset(largeEtat + 120, 30), ZIndex = 53, TextWrapped = false, TextXAlignment = Enum.TextXAlignment.Left, epais = 3 })
	E.chargeAstuce = inst("TextLabel", { BackgroundTransparency = 1, FontFace = TXT, TextSize = 26, TextColor3 = C.texte2, Text = "", TextWrapped = true,
		Size = UDim2.new(1, 0, 0, 56), Position = UDim2.fromOffset(0, 84), ZIndex = 52 }, E.chargeBloc)
	-- (la police pixel arrive une seconde APRÈS le premier affichage : le logo et l'état restent cachés jusqu'à ce qu'elle soit là —
	-- au plus 2,5 s, ensuite on montre quoi qu'il arrive)
	do
		boiteLogo.Visible = false
		E.chargeTxt.Visible = false
		local montre = false
		local function montrer()
			if montre then return end
			montre = true
			boiteLogo.Visible = true
			E.chargeTxt.Visible = true
		end
		task.spawn(function()
			local aCharger = { E.chargeTxt, E.chargeAstuce }
			for _, d in lg:GetDescendants() do if d:IsA("TextLabel") then table.insert(aCharger, d) end end
			pcall(function() game:GetService("ContentProvider"):PreloadAsync(aCharger) end)
			montrer()
		end)
		task.delay(2.5, montrer)
	end
	-- la vie de l'écran : la barre avance (vite puis de plus en plus lentement — elle ne s'arrête jamais avant la fin), la grille défile,
	-- l'astuce change
	do
		local ASTUCES = FR and { "Sors par le BORD de la route : tu t'envoles.", "Tiens la NITRO en l'air pour planer plus loin.",
			"Pose-toi en douceur : une pose PARFAITE paie plus.", "La ROUE : un tour gratuit toutes les 4 heures.",
			"Reviens chaque jour : le CADEAU DU JOUR grossit.", "Plus le moteur monte, plus chaque piece vaut cher." }
			or { "Drive off the EDGE of the road: you take off.", "Hold NITRO in the air to glide further.",
			"Land softly: a PERFECT landing pays more.", "THE WHEEL: a free spin every 4 hours.",
			"Come back every day: the DAILY GIFT grows.", "The bigger the engine, the more every coin is worth." }
		local t0 = os.clock()
		local cn: RBXScriptConnection
		cn = RunService.RenderStepped:Connect(function()
			if not E.charge.Parent then cn:Disconnect() return end
			if not E.charge.Visible then return end
			local t = os.clock() - t0
			if E.chargeBloc.Visible then E.chargeJ.regler(math.min(0.97, 1 - math.exp(-t / 3.2)), "or_", 0) end
			for k, tr9 in E.chargeTraverses do
				local u = ((k - 1) / #E.chargeTraverses + t * 0.35) % 1
				tr9.Position = UDim2.fromOffset(0, math.floor(u * u * 300 / 2) * 2) -- (de 2 px en 2 px : le pixel ne glisse pas)
				tr9.BackgroundTransparency = 0.88 - 0.6 * u
			end
			local i = math.floor(t / 3.2) % #ASTUCES + 1
			if E.chargeAstuce.Text ~= ASTUCES[i] then E.chargeAstuce.Text = ASTUCES[i] end
		end)
	end

	-- ══ MENU (la CHUTE) ══
	-- LES TAILLES SONT CELLES DU WEB : le jeu web se joue dans un écran de téléphone couché (844 × 390, même sur ordi) ; tout est
	-- mesuré sur ses captures et porté sur 720 px de haut (× 1,846). ⚠ La police pixel de Roblox est plus petite que son corps :
	-- un caractère fait 5/9 du TextSize (mesuré dans Studio) — un texte de 11 px sur le web demande un TextSize de 36 ici.
	local menu = inst("Frame", { Name = "Menu", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, racine)
	E.menu = menu
	-- le logo, en haut à droite : CASH en or, CAR en or qui vire au corail, et sa barre tricolore
	-- (Roblox plafonne le TextSize à 100 : le logo est écrit en 100 puis agrandi par une échelle, depuis son coin haut-droit)
	local logo = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(540, 150), Position = UDim2.new(1, -44, 0, 14),
		AnchorPoint = Vector2.new(1, 0) }, menu)
	inst("UIScale", { Scale = 1.4 }, logo)
	local function mot(txt: string, x: number, bas: Color3)
		local o = texte(logo, { Text = txt, TextSize = 100, TextColor3 = Color3.fromRGB(90, 40, 10), Size = UDim2.new(0, 300, 0, 100),
			Position = UDim2.new(1, x + 5, 0, 6), AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false, contour = false, italique = true })
		o.TextTransparency = 0.1
		local t = texte(logo, { Text = txt, TextSize = 100, TextColor3 = Color3.new(1, 1, 1), Size = UDim2.new(0, 300, 0, 100),
			Position = UDim2.new(1, x, 0, 0), AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false,
			epais = 4, contourCouleur = Color3.fromRGB(60, 24, 6), italique = true })
		-- (le LOGO est la seule dérogation de la charte au texte en dégradé : c'est une image de marque)
		inst("UIGradient", { Rotation = 90, Color = ColorSequence.new({
			ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 246, 180)), ColorSequenceKeypoint.new(0.5, Color3.fromRGB(255, 196, 40)),
			ColorSequenceKeypoint.new(1, bas) }) }, t)
		return t
	end
	E.titre = mot("CASH", -196, Color3.fromRGB(255, 150, 30))
	mot("CAR", 0, Color3.fromRGB(255, 94, 122))
	-- (v3) la barre des trois néons court sous les DEUX mots, du C de CASH au R de CAR (elle s'arrêtait sous le A, décalée : mesuré
	-- sur la photo de l'accueil) — CASH commence 418 px avant le bord droit du logo
	local barre = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(0, 410, 0, 7), Position = UDim2.new(1, -8, 0, 104),
		AnchorPoint = Vector2.new(1, 0) }, logo)
	for i, c in { C.magenta, C.cyan, C.or_ } do
		inst("Frame", { BackgroundColor3 = c, BorderSizePixel = 0, Size = UDim2.new(i == 1 and 0.44 or 0.28, -8, 1, 0),
			Position = UDim2.fromScale(i == 1 and 0 or (i == 2 and 0.44 or 0.72), 0) }, barre)
	end
	E.menuRecord = texte(logo, { Text = "", TextSize = 16, TextColor3 = C.vert, Position = UDim2.fromOffset(0, 120), Visible = false, -- (L5613 : le logo parle seul)
		TextXAlignment = Enum.TextXAlignment.Right, Size = UDim2.new(1, -14, 0, 20), TextWrapped = false })
	-- la colonne de droite : LA ROUE + ⚙, puis GARAGE · BOUTIQUE, puis JOUER en lettres d'or (Sacha, 4/10 : les MISSIONS et la
	-- CARRIÈRE sont parties — « supprime les éléments inutiles » —, la ROUE a pris la place des missions, voir Client/Roue)
	-- (v3, 5/10) la colonne vit dans un CADRE calé en bas à droite — mêmes positions qu'avant, comptées depuis le même coin. Sur un
	-- écran moins allongé (un iPad 4:3, un portable 16:10) elle se resserre d'un bloc vers son coin au lieu de passer sous la pile
	-- de l'accueil (en bas à gauche) : à 960 px de large, LA ROUE recouvrait PREMIUM et INVITER.
	local col = inst("Frame", { Name = "Colonne", BackgroundTransparency = 1, Size = UDim2.fromOffset(668, 380), Position = UDim2.fromScale(1, 1),
		AnchorPoint = Vector2.new(1, 1) }, menu)
	do
		local sc = inst("UIScale", {}, col)
		local function serrer()
			local k = echelle.Scale
			if k <= 0 then return end
			sc.Scale = math.clamp((menu.AbsoluteSize.X / k - 478) / 668, 0.62, 1)
		end
		menu:GetPropertyChangedSignal("AbsoluteSize"):Connect(serrer)
		serrer()
	end
	E.btRoue = tuile(col, T.roue, C.or_, UDim2.fromOffset(510, 94), UDim2.new(1, -668, 1, -366), nil, 39,
		"..#####..|.#..#..#.|#.#.#.#.#|#..###..#|#########|#..###..#|#.#.#.#.#|.#..#..#.|..#####..", "g")
	-- (à droite de la tuile : « x2 » en or quand des tours attendent, sinon le compte à rebours du prochain tour gratuit)
	E.roueInfo = texte(E.btRoue.Parent :: Instance, { Text = "", TextSize = 26, TextColor3 = C.terne, Size = UDim2.fromOffset(170, 40),
		Position = UDim2.new(1, -40, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false, epais = 3 })
	E.misPips = {}
	E.btReglages = tuile(col, "", C.cyan, UDim2.fromOffset(104, 94), UDim2.new(1, -148, 1, -366), nil, 34, "reglages")
	E.btGarage = tuile(col, T.garage, C.cyan, UDim2.fromOffset(307, 112), UDim2.new(1, -668, 1, -258), nil, 34, "voiture", "v")
	E.btBoutique = tuile(col, T.boutique, C.magenta, UDim2.fromOffset(307, 112), UDim2.new(1, -352, 1, -258), nil, 34, "panier", "v")
	-- LES PASTILLES (#bdGar, #bdShop, L5623) : le GARAGE dit combien de choses la banque peut s'offrir (caisses et habillages — tout
	-- ce qui s'achète en argent du jeu est au garage) ; la BOUTIQUE dit NEW tant qu'on n'y est jamais allé
	-- (v3) un AUTOCOLLANT de pixel collé sur le coin de la plaque : carré (pas d'arrondi — la charte), cerné d'encre, une lèvre claire en
	-- haut, et un battement lent qui appelle l'œil sans crier
	local function pastille(tuile9: TextButton, fond: Color3): TextLabel
		local l = texte(tuile9.Parent :: Instance, { Text = "", TextSize = 20, TextColor3 = Color3.new(1, 1, 1), BackgroundColor3 = fond, BackgroundTransparency = 0,
			Size = UDim2.fromOffset(56, 36), Position = UDim2.new(1, 10, 0, -18), AnchorPoint = Vector2.new(1, 0), TextWrapped = false, Visible = false, ZIndex = 8,
			epais = 2, contourCouleur = ombrer(fond, 0.35) })
		inst("UIStroke", { Name = "Cadre", Color = C.encre, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, l)
		inst("Frame", { Name = "Levre", BackgroundColor3 = fond:Lerp(Color3.new(1, 1, 1), 0.4), BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3), ZIndex = 8 }, l)
		inst("Frame", { Name = "Ourlet", BackgroundColor3 = ombrer(fond, 0.6), BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3), Position = UDim2.new(0, 0, 1, -3), ZIndex = 8 }, l)
		local sc = inst("UIScale", {}, l)
		TweenService:Create(sc, TweenInfo.new(0.75, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true), { Scale = 1.1 }):Play()
		return l
	end
	E.bdGar = pastille(E.btGarage, C.rouge)
	E.bdShop = pastille(E.btBoutique, C.magenta)
	E.bdShop.Text = "NEW"
	E.bdRoue = pastille(E.btRoue, C.rouge) -- (des tours attendent : leur nombre en rouge, comme une notification)
	E.bdRoue.Text = "1" -- (Client/Roue y écrit le nombre de tours)
	-- JOUER v2 (5/10, Sacha : « les boutons sont super moches ») : des lettres d'or posées dans le ciel ne se lisaient pas comme un
	-- bouton — c'est maintenant LE lingot de l'écran, large, qui respire doucement
	local jouer = lingot(col, T.jouer, UDim2.fromOffset(620, 108), UDim2.new(1, -46, 1, -24), Vector2.new(1, 1), 80) -- (v3 : 64 → 80, LE mot de l'écran)
	do
		local boiteJ = jouer.Parent.Parent :: Frame
		local sc = inst("UIScale", {}, boiteJ)
		TweenService:Create(sc, TweenInfo.new(0.9, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true), { Scale = 1.035 }):Play()
	end
	E.btJouer = jouer

	-- ══ COURSE ══
	local hud = inst("Frame", { Name = "Course", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, racine)
	E.hud = hud
	-- l'éclair + la barre de nitro
	E.nitroIco = icone(hud, "eclair", 5, ECLAIR.nitro, UDim2.fromOffset(30, 26))
	-- (v3) la barre s'arrête au TIERS de l'écran, au même bout que la bande de FLOW dessous (HudScore : 30 + 59 + 0,30) — elle passait
	-- le milieu en 16:9, et le haut du centre appartient aux annonces
	E.nitro = jauge(hud, UDim2.new(0.30, 0, 0, 44), UDim2.fromOffset(89, 28), nil, 5, 4)
	-- (l'ancien bloc AURA : le score a le sien, HudScore — celui-ci reste éteint)
	local aura = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(400, 40), Position = UDim2.fromOffset(20, 84), Visible = false }, hud)
	E.aura = texte(aura, { Text = T.aura, TextSize = 15, TextColor3 = Color3.fromRGB(255, 200, 250), TextXAlignment = Enum.TextXAlignment.Left,
		Size = UDim2.new(1, -46, 1, 0), Position = UDim2.fromOffset(46, 0) })
	-- en haut à droite : la pause cyan (penchée), l'argent, le chrono d'air
	local _, pauseP, pauseB = penche(hud, UDim2.fromOffset(102, 92), UDim2.new(1, -22, 0, 15), Vector2.new(1, 0), hx("14c8e6"), nil, hx("06304a"), hx("9ff4ff"))
	icone(pauseP, "pause", 5, { { 0.5, hx("0a4a66") }, { 1, hx("06304a") } }, UDim2.fromScale(0.5, 0.5), Vector2.new(0.5, 0.5))
	E.btPause = pauseB
	retour(E.btPause, pauseP)
	E.coeurs = texte(hud, { Text = "", RichText = true, TextSize = 30, TextColor3 = C.rouge, Size = UDim2.fromOffset(140, 36),
		Position = UDim2.new(1, -136, 0, 40), AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, FontFace = TXT, Visible = false })
	E.argent = texte(hud, { Text = "", RichText = true, TextSize = 55, TextColor3 = C.vert, Size = UDim2.new(0, 560, 0, 58),
		Position = UDim2.new(1, -22, 0, 116), AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false,
		epais = 4, contourCouleur = hx("04200f") })
	E.argentEchelle = inst("UIScale", {}, E.argent)
	-- (#cashHud .chD) chaque gain s'additionne dans un « +$ » sous le compteur tant que ça tombe (1,8 s après le dernier) — « ×3 » et
	-- l'or en frénésie
	E.argentPlus = texte(hud, { Text = "", RichText = true, TextSize = 24, TextColor3 = C.vert, Size = UDim2.new(0, 560, 0, 28), Position = UDim2.new(1, -22, 0, 174),
		AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false, Visible = false, epais = 3, contourCouleur = hx("04200f") })
	-- LE CHRONO DE VOL (#airHud du web) : l'aile, les secondes, « AIR », et la barre de la nitro qui se VIDE
	E.air = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(200, 86), Position = UDim2.new(1, -22, 0, 184),
		AnchorPoint = Vector2.new(1, 0), Visible = false }, hud)
	E.airIco = icone(E.air, "aile", 4, FAM.air[2], UDim2.fromOffset(0, 6))
	E.airTxt = texte(E.air, { Text = "", RichText = true, TextSize = 44, TextColor3 = FAM.air[2], Size = UDim2.new(1, -40, 0, 46), Position = UDim2.fromOffset(40, 0),
		TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false, contourCouleur = hx("1c0430"), epais = 4 })
	E.airJ = jauge(E.air, UDim2.new(1, 0, 0, 26), UDim2.fromOffset(0, 52), nil, 5, 3)
	-- LES PLAQUES DE POUVOIR (#pwrChip) : une par pouvoir actif, sous l'argent (sous le chrono quand on vole)
	E.pouvoirs = inst("CanvasGroup", { BackgroundTransparency = 1, Size = UDim2.fromOffset(270, 340), Position = UDim2.new(1, -22, 0, 208), AnchorPoint = Vector2.new(1, 0) }, hud) -- (sous le « +$ » du compteur)
	-- le centre : la bannière du niveau, les figures, la chaîne
	-- (5/10) la BANNIÈRE du niveau sur un BANDEAU : un texte blanc posé sur la ville ou le ciel se lisait mal — une bande d'encre qui
	-- s'efface aux deux bouts, un filet de néon dessus et dessous, le nom en grand
	E.grandBande = inst("Frame", { BackgroundColor3 = C.encre, BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 78),
		Position = UDim2.fromScale(0, 0.33), AnchorPoint = Vector2.new(0, 0.15) }, hud)
	inst("UIGradient", { Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(0.25, 0.25),
		NumberSequenceKeypoint.new(0.75, 0.25), NumberSequenceKeypoint.new(1, 1) }) }, E.grandBande)
	for _, y9 in { 0, 1 } do
		local f9 = inst("Frame", { Name = "Filet", BackgroundColor3 = C.cyan, BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3),
			Position = UDim2.new(0, 0, y9, -y9 * 3) }, E.grandBande)
		inst("UIGradient", { Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(0.3, 0),
			NumberSequenceKeypoint.new(0.7, 0), NumberSequenceKeypoint.new(1, 1) }) }, f9)
	end
	E.grand = texte(hud, { Text = "", TextSize = 38, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 60), Position = UDim2.fromScale(0, 0.33), epais = 4 })
	E.pop = texte(hud, { Text = "", TextSize = 22, TextColor3 = C.or_, Size = UDim2.new(1, 0, 0, 34), Position = UDim2.fromScale(0, 0.22), epais = 4 })
	E.chaine = texte(hud, { Text = "", TextSize = 16, TextColor3 = C.cyan, Size = UDim2.new(1, 0, 0, 24), Position = UDim2.new(0, 0, 0.22, 38) })
	-- LE DAUPHIN v7 (dolHudVol, L29722 ; Sacha, 30/09 : « on doit voir l'aura monter pendant l'animation des dauphins, pendant qu'on
	-- survole la route ») : EN VOL, un compteur seul monte sous la caisse dès que les dauphins nagent — ce qui sera VRAIMENT versé.
	E.dolVol = texte(hud, { Text = "", TextSize = 26, TextColor3 = Color3.fromRGB(125, 255, 236), Size = UDim2.new(1, 0, 0, 30),
		Position = UDim2.fromScale(0, 0.76), Visible = false, epais = 3 })
	-- LE LOGO DU DÉPART (#launchLogo + #launchGlow, L664 du jeu web ; 5/09 : « plus impressionnant ») : CASH CAR en or CLAQUE à
	-- l'écran quand la caisse touche la route — parti de tout petit, il dépasse sa taille avant de s'y poser (un IMPACT, pas un
	-- fondu), avec un halo doré derrière lui. C'est la seule célébration à rebond de l'interface (règle 7 de la charte).
	do
		local boite = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(640, 120), Position = UDim2.fromScale(0.5, 0.26),
			AnchorPoint = Vector2.new(0.5, 0.5), Visible = false, ZIndex = 30 }, hud)
		E.logoEchelle = inst("UIScale", { Scale = 0.18 }, boite)
		-- le halo : des disques d'or emboîtés (un dégradé radial fait main)
		E.logoHalo = {}
		for k = 1, 6 do
			local d = 520 * (1 - (k - 1) / 6.5)
			local h = inst("Frame", { BackgroundColor3 = Color3.fromRGB(255, 180 + k * 7, 60 + k * 14), BackgroundTransparency = 1, BorderSizePixel = 0,
				Size = UDim2.fromOffset(d, d), Position = UDim2.fromScale(0.5, 0.5), AnchorPoint = Vector2.new(0.5, 0.5), ZIndex = 29 }, boite)
			inst("UICorner", { CornerRadius = UDim.new(0.5, 0) }, h)
			E.logoHalo[k] = h
		end
		E.logoMots = {}
		for k, m in { { "CASH", -84, Color3.fromRGB(255, 150, 30) }, { "CAR", 104, Color3.fromRGB(255, 94, 122) } } do
			local t = texte(boite, { Text = m[1], TextSize = 84, TextColor3 = Color3.new(1, 1, 1), Size = UDim2.fromOffset(360, 100),
				Position = UDim2.new(0.5, m[2], 0.5, 0), AnchorPoint = Vector2.new(0.5, 0.5), TextWrapped = false, epais = 4,
				contourCouleur = Color3.fromRGB(60, 24, 6), italique = true, ZIndex = 31 })
			inst("UIGradient", { Rotation = 90, Color = ColorSequence.new({
				ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 246, 180)), ColorSequenceKeypoint.new(0.5, Color3.fromRGB(255, 196, 40)),
				ColorSequenceKeypoint.new(1, m[3]) }) }, t)
			E.logoMots[k] = t
		end
		E.logo = boite
	end
	-- la carte ASTUCE
	-- (v3) en HAUT, entre le bout de la barre de nitro et la colonne de l'argent : au milieu de l'écran elle couvrait la route
	-- pendant le vol — là où l'on regarde pour se poser
	E.astuce = carbone(hud, UDim2.new(0.38, 0, 0, 112), UDim2.new(0.30, 118, 0, 16), C.cyan, nil)
	E.astuce.Visible = false
	-- (v3) l'icône dans sa CASE d'encre, le mot ASTUCE en cyan (il disait « astuce » d'une voix terne), la phrase plus grande
	do
		local case = inst("Frame", { BackgroundColor3 = C.nuit, BorderSizePixel = 0, Size = UDim2.fromOffset(58, 58), Position = UDim2.new(0, 22, 0.5, 0),
			AnchorPoint = Vector2.new(0, 0.5) }, E.astuce)
		inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, case)
		lisere(case, Color3.fromRGB(0, 150, 170), Color3.fromRGB(0, 50, 64))
		icone(case, "eclair", 5, ECLAIR.nitro, UDim2.fromScale(0.5, 0.5), Vector2.new(0.5, 0.5))
	end
	texte(E.astuce, { Text = T.astuce, TextSize = 22, TextColor3 = C.cyan, TextXAlignment = Enum.TextXAlignment.Left,
		Size = UDim2.new(1, -110, 0, 24), Position = UDim2.fromOffset(98, 12), TextWrapped = false, italique = true })
	E.astuceTxt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = TXT, TextSize = 23, TextColor3 = C.texte, TextWrapped = true, TextScaled = true,
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, Size = UDim2.new(1, -114, 0, 64),
		Position = UDim2.fromOffset(98, 40), Text = "" }, E.astuce)
	inst("UITextSizeConstraint", { MaxTextSize = 23, MinTextSize = 14 }, E.astuceTxt) -- (la carte suit la largeur de l'écran : la phrase s'y range)
	-- la carte de l'AUTO-ÉCOLE (#coach) : en HAUT, sous la jauge (web : top 62 px sur 390 — elle garde le haut de l'écran pour elle) ;
	-- l'en-tête et PASSER, le titre, la consigne, cinq pastilles
	-- (v3, 5/10) mesuré au banc : un en-tête de 9 px de haut qu'on ne lisait pas, PASSER en simple cadre plat (le seul bouton du jeu
	-- qui n'était pas une plaque), cinq traits gris sans contour. Tout a grandi d'un cran, PASSER est une touche penchée.
	E.coach = carbone(hud, UDim2.fromOffset(640, 200), UDim2.new(0.5, 60, 0, 92), C.vert, Vector2.new(0.5, 0))
	E.coach.Visible = false
	E.coachTete = texte(E.coach, { Text = "", TextSize = 18, TextColor3 = C.terne, Size = UDim2.new(1, -240, 0, 20), Position = UDim2.fromOffset(26, 16),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, ajuste = 4 })
	E.coachTitre = texte(E.coach, { Text = "", TextSize = 38, TextColor3 = C.texte, Size = UDim2.new(1, -52, 0, 40), Position = UDim2.fromOffset(26, 44),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3, italique = true, ajuste = 4 })
	E.coachTxt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = TXT, TextSize = 24, TextColor3 = Color3.fromRGB(214, 224, 255), TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, Size = UDim2.new(1, -52, 0, 50),
		Position = UDim2.fromOffset(26, 88), Text = "" }, E.coach)
	-- (L1229) LA DÉMO DU GESTE : un petit film en pixels sous la consigne — le pouce qui glisse, l'éclair qu'on presse, la flèche
	-- qui file vers le bord, la cible qui bat. Quatre pictos bâtis une fois ; Hud.coachGeste n'en montre qu'un et le fait jouer.
	E.coachGeste = inst("Frame", { Name = "Geste", BackgroundTransparency = 1, ClipsDescendants = true, Size = UDim2.new(1, -52, 0, 44),
		Position = UDim2.fromOffset(26, 130) }, E.coach)
	E.coachGestes = {}
	for _, g in { { "glisse", "pouce", Color3.new(1, 1, 1) }, { "nitro", "eclair", hx("ff8d2e") }, { "bord", "droite", Color3.new(1, 1, 1) }, { "pose", "cible", hx("7dff9a") } } do
		local f = icone(E.coachGeste, g[2], 4, g[3], UDim2.new(0.5, 0, 0, 22), Vector2.new(0.5, 0.5))
		f.Visible = false
		E.coachGestes[g[1]] = { f = f, k = inst("UIScale", {}, f) }
	end
	E.coachPips = {}
	for i = 1, 5 do
		local pip = inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.fromOffset(42, 8), Position = UDim2.new(0, 26 + (i - 1) * 52, 1, -20) }, E.coach)
		inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, pip)
		E.coachPips[i] = pip
	end
	-- PASSER : une touche penchée cyan, petite (on la trouve, elle ne vole pas la vedette à la consigne). Le pilote y écrit
	-- « PASSER » puis « VRAIMENT ? » en rouge.
	E.btPasser = tuile(E.coach, "", C.cyan, UDim2.fromOffset(186, 54), UDim2.new(1, -16, 0, 12), Vector2.new(1, 0), 20)
	-- le bouton NITRO (en bas à droite, comme sur le web — souris et doigt)
	-- une touche PENCHÉE, sœur de la pause : l'éclair de la barre, le mot, et SA jauge (la même recette que la barre)
	-- (v3) la face prend la TEINTE de la poussée (orange au repos, bleue sur la réserve, violette en nitro infinie) au lieu d'un carbone
	-- presque noir : c'est le bouton qu'on presse le plus du jeu, il doit se voir du coin de l'œil
	local _, nbP, nbB = penche(hud, UDim2.fromOffset(184, 156), UDim2.new(1, -26, 1, -28), Vector2.new(1, 1), C.carbone:Lerp(FAM.nitro[2], 0.2), FAM.nitro[2],
		C.encre, FAM.nitro[1])
	E.nitroPlaque = nbP
	E.nitroLisere = nbP:FindFirstChild("l", true)
	E.nitroBtIco = icone(nbP, "eclair", 7, ECLAIR.nitro, UDim2.new(0.5, 0, 0, 14), Vector2.new(0.5, 0))
	texte(nbP, { Text = T.nitro, TextSize = 30, Size = UDim2.new(1, 0, 0, 32), Position = UDim2.fromOffset(0, 82), contourCouleur = hx("431600"), epais = 3, TextWrapped = false })
	E.nitroMini = jauge(nbP, UDim2.fromOffset(132, 20), UDim2.new(0.5, -6, 1, -16), Vector2.new(0.5, 1), 3, 2)
	E.btNitro = nbB
	nbB.ZIndex = 3
	-- (L1243) L'APPEL : pendant les étapes NITRO de l'auto-école, un anneau d'or bat autour du bouton — c'est LUI qu'il faut presser
	E.nitroAppel = inst("Frame", { Name = "Appel", BackgroundTransparency = 1, Size = UDim2.fromOffset(204, 176), Position = UDim2.new(1, -16, 1, -18),
		AnchorPoint = Vector2.new(1, 1), Visible = false, ZIndex = 4 }, hud)
	E.nitroAppelTrait = inst("UIStroke", { Color = C.or_, Thickness = 5, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, E.nitroAppel)
	-- l'aide tactile
	E.tactile = inst("Frame", { Name = "Tactile", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, hud)
	-- (v3) SOUS l'anneau du volant qu'elle désigne, sur une ligne : à mi-hauteur à gauche, elle collait aux lignes de la chaîne d'aura
	E.glisseTxt = texte(E.tactile, { Text = (string.gsub(T.glisse, "%s+", " ")), TextSize = 22, TextColor3 = C.texte2, TextWrapped = false,
		Size = UDim2.fromOffset(420, 28), Position = UDim2.new(0.25, 0, 1, -40), AnchorPoint = Vector2.new(0.5, 0.5), epais = 3 })
	-- (L1106, L3609) L'INVITATION DU VOLANT : un anneau de seize tirets cyan au milieu de la moitié gauche, sous le pouce, qui respire
	-- (1,6 s : 35 → 80 %, × 1,08) — on sait OÙ poser le doigt. Il part au premier braquage, avec la consigne.
	do
		local D9 = 170
		local g = inst("CanvasGroup", { Name = "Invite", BackgroundTransparency = 1, Size = UDim2.fromOffset(D9, D9), AnchorPoint = Vector2.new(0.5, 0.5),
			Position = UDim2.new(0.25, 0, 1, -150), GroupTransparency = 0.65 }, E.tactile)
		local sc = inst("UIScale", {}, g)
		local R9 = D9 / 2 / 1.08 - 4
		for k = 0, 15 do
			local a = math.rad(-8 + 8 + k * 22.5) -- (chaque tiret couvre 16° sur 22,5 : son milieu)
			inst("Frame", { BackgroundColor3 = Color3.fromRGB(159, 232, 255), BorderSizePixel = 0, AnchorPoint = Vector2.new(0.5, 0.5),
				Size = UDim2.fromOffset(2 * math.pi * R9 * 16 / 360, 7), Rotation = math.deg(a) + 90,
				Position = UDim2.new(0.5, math.cos(a) * R9, 0.5, math.sin(a) * R9) }, g)
		end
		local ti = TweenInfo.new(0.8, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true)
		TweenService:Create(g, ti, { GroupTransparency = 0.2 }):Play()
		TweenService:Create(sc, ti, { Scale = 1.08 }):Play()
		E.volantInvite = g
	end
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
	jupe(voile)
	-- (la troisième rangée : POUCE HAUT EN VOL — le web le met aussi dans la pause : « c'est en pleine partie qu'on découvre qu'on
	-- préfère l'autre sens » — et, s'il est ouvert, le mode FACILE à côté)
	-- (v3, 5/10) le titre a la signature des écrans du jeu (italique, la barre des trois néons dessous) ; CHAQUE tuile a son icône
	-- à gauche et son mot centré dans la place qui reste (SON et MUSIQUE n'en avaient pas : deux familles de boutons dans un panneau) ;
	-- SON OFF / MUSIQUE OFF passent au gris — l'état se voit avant de se lire.
	local pan = carbone(voile, UDim2.fromOffset(760, 606), UDim2.fromScale(0.5, 0.5), C.cyan, Vector2.new(0.5, 0.5))
	E.pausePan = pan
	E.pauseTitre = texte(pan, { Text = T.pause, TextSize = 60, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 62), Position = UDim2.fromOffset(0, 22), TextWrapped = false,
		epais = 4, italique = true })
	signature(pan, UDim2.new(0.5, -110, 0, 90))
	-- (charte v5 du web, #tpResume) LA PAUSE DIT OÙ EN EST LA PARTIE : l'aura, le moteur, le niveau — une ligne sous le titre
	E.pauseBilan = texte(pan, { Text = "", TextSize = 24, TextColor3 = C.texte2, Size = UDim2.new(1, -60, 0, 28), Position = UDim2.fromOffset(30, 108), TextWrapped = false,
		ajuste = 0 })
	local function centre(b: TextButton): TextButton
		b.TextXAlignment = Enum.TextXAlignment.Center
		return b
	end
	E.btSonP = centre(tuile(pan, T.son, C.cyan, UDim2.fromOffset(330, 82), UDim2.new(0.5, -10, 0, 152), Vector2.new(1, 0), 28, "son", "g"))
	E.btMusP = centre(tuile(pan, T.musique, C.cyan, UDim2.fromOffset(330, 82), UDim2.new(0.5, 10, 0, 152), Vector2.new(0, 0), 28, "musique", "g"))
	E.btRecom = centre(tuile(pan, T.recommencer, C.magenta, UDim2.fromOffset(330, 82), UDim2.new(0.5, -10, 0, 248), Vector2.new(1, 0), 24, "rejouer", "g"))
	E.btMenuP = centre(tuile(pan, T.quitter, C.rouge, UDim2.fromOffset(330, 82), UDim2.new(0.5, 10, 0, 248), Vector2.new(0, 0), 28, "quitter", "g")) -- (L5774 : QUITTER, rouge — elle VERSE les gains et ouvre l'écran de fin)
	if Config.FACILE_ACTIF then
		E.btFacile = centre(tuile(pan, T.facile, C.vert, UDim2.fromOffset(330, 72), UDim2.new(0.5, -10, 0, 344), Vector2.new(1, 0), 22, "coeur", "g"))
		E.btPouceP = centre(tuile(pan, T.pouce, C.cyan, UDim2.fromOffset(330, 72), UDim2.new(0.5, 10, 0, 344), Vector2.new(0, 0), 16, "aile", "g"))
	else
		E.btFacile = centre(tuile(pan, T.facile, C.vert, UDim2.fromOffset(680, 72), UDim2.new(0.5, 0, 0, 344), Vector2.new(0.5, 0), 26, "coeur", "g"))
		E.btPouceP = centre(tuile(pan, T.pouce, C.cyan, UDim2.fromOffset(680, 72), UDim2.new(0.5, 0, 0, 344), Vector2.new(0.5, 0), 26, "aile", "g"))
	end
	-- (le pilote écrit « SON ON » / « SON OFF » : la tuile s'éteint d'elle-même au mot OFF)
	for _, b9 in { E.btSonP, E.btMusP, E.btFacile } do
		b9:GetPropertyChangedSignal("Text"):Connect(function() allumer(b9, not string.find(b9.Text, "OFF", 1, true)) end)
	end
	E.btRecom.Parent.Name = "Recom"
	E.btMenuP.Parent.Name = "MenuP"
	E.btReprendre = lingot(pan, T.reprendre, UDim2.new(1, -80, 0, 104), UDim2.new(0.5, 0, 1, -32), Vector2.new(0.5, 1), 64)
	empiler(voile, 20)

	-- ══ RÉGLAGES (#mSet du web) : un écran à part — le titre, deux colonnes de lignes (AUDIO · JEU), RETOUR en bas à gauche ══
	-- Une ligne = une icône dans sa case, un libellé, et à droite un interrupteur (ON / OFF) ou une action.
	-- (fond BLANC sous le dégradé : un dégradé multiplie la couleur du cadre — sur du bleu nuit il sortait presque noir)
	-- (v3, 5/10) mesuré au banc en 1150 px de large (un portable 16:10) : « POUCE HAUT EN VOL » passait SOUS « PLONGE », « REVOIR
	-- L'AUTO-ECOLE » sur sa flèche, « EFFACER MA PROGRESSION » tombait sur deux lignes de 8 px ; et aucune ligne ne réagissait au
	-- doigt. Désormais : chaque libellé TIENT dans sa place (`ajuster`), la valeur de POUCE HAUT passe SOUS son libellé, la ligne
	-- s'éclaire au survol et s'assombrit sous le doigt, les colonnes sont des plaques de laque, l'interrupteur une vraie glissière.
	local reg = inst("Frame", { Name = "Reglages", BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.04, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 22 }, racine)
	E.reglages = reg
	degrade(reg, Color3.fromRGB(46, 16, 62), Color3.fromRGB(10, 7, 24), 80)
	jupe(reg)
	texte(reg, { Text = T.reglages, TextSize = 78, TextColor3 = C.texte, Size = UDim2.fromOffset(800, 80), Position = UDim2.fromOffset(66, 22), italique = true,
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 4 })
	signature(reg, UDim2.fromOffset(72, 106), 270)
	local function colonne(titre: string, x0: number, x1: number, teinte: Color3): Frame
		-- l'en-tête : un carré de couleur et le mot (il se lisait à peine, en lavande terne)
		inst("Frame", { BackgroundColor3 = teinte, BorderSizePixel = 0, Size = UDim2.fromOffset(12, 12), Position = UDim2.new(x0, 2, 0, 140) }, reg)
		texte(reg, { Text = titre, TextSize = 24, TextColor3 = C.texte2, Size = UDim2.new(0, 260, 0, 26), Position = UDim2.new(x0, 24, 0, 133),
			TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
		local p = carbone(reg, UDim2.new(x1 - x0, 0, 0, 0), UDim2.new(x0, 0, 0, 170), teinte)
		;(p:FindFirstChild("Filet") :: Frame).Size = UDim2.new(0, 5, 1, 0)
		return p
	end
	-- une LIGNE : rend le bouton (toute la ligne se touche) et de quoi écrire son état. `genre` : nil = interrupteur ON / OFF,
	-- "action" = la flèche du web, "valeur" = un mot cyan et sa flèche (PLONGE ▶). Les lignes s'empilent dans leur colonne.
	-- (⚠ Client/Revenus replie la ligne NITRO INFINIE : chaque ligne est un cadre ENFANT DIRECT de sa colonne, posé à son Y — ne pas
	-- les ranger dans un sous-cadre)
	E.rg = {}
	local Hl = 96
	local function ligne(p: Frame, cle: string, ico: string, libelle: string, genre: string?)
		local y = p:GetAttribute("y") or 0
		p:SetAttribute("y", y + Hl)
		p.Size = UDim2.new(p.Size.X.Scale, 0, 0, y + Hl)
		local l = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, Hl), Position = UDim2.fromOffset(0, y) }, p)
		-- la lueur de la ligne : rien au repos, un voile clair au survol, plus franc sous le doigt
		local lueur = inst("Frame", { Name = "Lueur", BackgroundColor3 = Color3.fromRGB(150, 170, 255), BackgroundTransparency = 1, BorderSizePixel = 0,
			Size = UDim2.new(1, -14, 1, -6), Position = UDim2.fromOffset(9, 3) }, l)
		if y > 0 then inst("Frame", { BackgroundColor3 = C.encre, BackgroundTransparency = 0.35, BorderSizePixel = 0, Size = UDim2.new(1, -28, 0, 2), Position = UDim2.fromOffset(18, 0) }, l) end
		local case = inst("Frame", { BackgroundColor3 = C.nuit, BorderSizePixel = 0, Size = UDim2.fromOffset(60, 60), Position = UDim2.new(0, 26, 0.5, 0), AnchorPoint = Vector2.new(0, 0.5) }, l)
		inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, case)
		lisere(case, Color3.fromRGB(70, 66, 130), Color3.fromRGB(20, 14, 44))
		local ic = icone(case, ico, 4, C.cyan, UDim2.fromScale(0.5, 0.5), Vector2.new(0.5, 0.5))
		local droite = (genre == "action") and 64 or ((genre == "valeur") and 64 or 196)
		local lib = texte(l, { Text = libelle, TextSize = 30, TextColor3 = C.texte, Size = UDim2.new(1, -106 - droite, 0, 34), Position = UDim2.new(0, 106, 0.5, 0),
			AnchorPoint = Vector2.new(0, 0.5), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3, ajuste = 0 })
		local o: any = { ico = ic }
		if genre == "action" then
			icone(l, "droite", 3, C.cyan, UDim2.new(1, -30, 0.5, 0), Vector2.new(1, 0.5))
		elseif genre == "valeur" then
			icone(l, "droite", 3, C.cyan, UDim2.new(1, -30, 0.5, 0), Vector2.new(1, 0.5))
			-- (le libellé en haut, la valeur dessous : « POUCE HAUT EN VOL » garde toute la largeur de la ligne)
			lib.Position = UDim2.new(0, 106, 0.5, -15)
			o.valeur = texte(l, { Text = "", TextSize = 24, italique = true, TextColor3 = C.cyan, Size = UDim2.new(1, -106 - droite, 0, 28), Position = UDim2.new(0, 106, 0.5, 19),
				AnchorPoint = Vector2.new(0, 0.5), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, ajuste = 0 })
		else
			-- l'interrupteur : une glissière d'encre, son curseur (lèvre claire, ourlet sombre — un bouton de pixel), ON (cyan, à
			-- droite) ou OFF (éteint, à gauche) — redessinés par Hud.reglage
			local inter = inst("Frame", { BackgroundColor3 = C.nuit, BorderSizePixel = 0, Size = UDim2.fromOffset(150, 56), Position = UDim2.new(1, -28, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5) }, l)
			o.trait = inst("UIStroke", { Color = C.encre, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, inter)
			o.piste = inter
			o.curseur = inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.fromOffset(56, 42), Position = UDim2.fromOffset(7, 7) }, inter)
			inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, o.curseur)
			o.levre = inst("Frame", { BackgroundColor3 = C.lavande, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 5) }, o.curseur)
			o.ourlet = inst("Frame", { BackgroundColor3 = C.nuit, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 5), Position = UDim2.new(0, 0, 1, -5) }, o.curseur)
			o.mot = texte(inter, { Text = "OFF", TextSize = 24, italique = true, TextColor3 = C.terne, Size = UDim2.fromOffset(72, 28), Position = UDim2.new(1, -8, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5),
				TextWrapped = false })
		end
		o.lib = lib
		o.b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false, ZIndex = 2 }, l)
		do
			local bas, survol = false, false
			local function luire()
				lueur.BackgroundTransparency = bas and 0.84 or (survol and 0.93 or 1)
			end
			o.b.MouseButton1Down:Connect(function() bas = true luire() end)
			o.b.MouseButton1Up:Connect(function() bas = false luire() end)
			o.b.MouseEnter:Connect(function() survol = souris() luire() end)
			o.b.MouseLeave:Connect(function() bas, survol = false, false luire() end)
		end
		o.b.Activated:Connect(function()
			Sons.jouer("tap")
			Hud.vibre(6)
		end)
		o.ligne = l
		E.rg[cle] = o
	end
	-- un CURSEUR de volume (volRow du web) : « VOLUME » et le pourcentage, une piste, une poignée qu'on fait glisser (pas de 5 %)
	local Hc = 76
	local function curseur(p: Frame, cle: string)
		local y = p:GetAttribute("y") or 0
		p:SetAttribute("y", y + Hc)
		p.Size = UDim2.new(p.Size.X.Scale, 0, 0, y + Hc)
		local l = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, Hc), Position = UDim2.fromOffset(0, y - 12) }, p)
		texte(l, { Text = T.volume, TextSize = 20, TextColor3 = C.terne, Size = UDim2.new(0.5, 0, 0, 22), Position = UDim2.fromOffset(106, 4),
			TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
		local o: any = {}
		o.pct = texte(l, { Text = "", TextSize = 20, TextColor3 = C.texte2, Size = UDim2.new(0.4, 0, 0, 22), Position = UDim2.new(1, -28, 0, 4), AnchorPoint = Vector2.new(1, 0),
			TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
		local piste = inst("Frame", { BackgroundColor3 = C.nuit, BorderSizePixel = 0, Size = UDim2.new(1, -134, 0, 16), Position = UDim2.fromOffset(106, 44) }, l)
		inst("UIStroke", { Color = C.encre, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, piste)
		o.plein = inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.fromScale(0.5, 1) }, piste)
		inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.55, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 4) }, o.plein)
		o.poignee = inst("Frame", { BackgroundColor3 = C.texte2, BorderSizePixel = 0, Size = UDim2.fromOffset(26, 42), Position = UDim2.fromScale(0.5, 0.5), AnchorPoint = Vector2.new(0.5, 0.5) }, piste)
		inst("UIStroke", { Color = C.encre, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, o.poignee)
		inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 5) }, o.poignee)
		inst("Frame", { BackgroundColor3 = Color3.fromRGB(110, 120, 170), BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 5), Position = UDim2.new(0, 0, 1, -5) }, o.poignee)
		-- toute la bande se touche (la cible fait 76 px de haut, la piste 16) : on suit le doigt tant qu'il appuie
		local zone = inst("TextButton", { BackgroundTransparency = 1, Text = "", AutoButtonColor = false, Size = UDim2.new(1, -106, 1, 0), Position = UDim2.fromOffset(90, 0) }, l)
		o.surChange = nil :: ((number, boolean) -> ())?
		local tient = false
		local function lire(x: number, fin: boolean)
			local a = piste.AbsolutePosition.X
			local w = math.max(1, piste.AbsoluteSize.X)
			local v = math.clamp(math.floor(((x - a) / w) * 20 + 0.5) * 5, 0, 100)
			if o.surChange then o.surChange(v, fin) end
		end
		zone.InputBegan:Connect(function(io: InputObject)
			if io.UserInputType == Enum.UserInputType.MouseButton1 or io.UserInputType == Enum.UserInputType.Touch then
				tient = true
				lire(io.Position.X, false)
			end
		end)
		UserInputService.InputChanged:Connect(function(io: InputObject)
			if tient and (io.UserInputType == Enum.UserInputType.MouseMovement or io.UserInputType == Enum.UserInputType.Touch) then lire(io.Position.X, false) end
		end)
		UserInputService.InputEnded:Connect(function(io: InputObject)
			if tient and (io.UserInputType == Enum.UserInputType.MouseButton1 or io.UserInputType == Enum.UserInputType.Touch) then
				tient = false
				lire(io.Position.X, true)
				Sons.jouer("tap")
			end
		end)
		E.rg[cle] = o
	end
	local ca = colonne("AUDIO", 0.043, 0.487, C.cyan)
	ligne(ca, "son", "son", T.son)
	curseur(ca, "volSon")
	ligne(ca, "musique", "musique", T.musique)
	curseur(ca, "volMus")
	local cj = colonne(T.jeu, 0.513, 0.957, C.magenta)
	if Config.FACILE_ACTIF then ligne(cj, "facile", "coeur", T.facile) end -- (Sacha : « mets que le mode normal » — la ligne n'existe que si le mode est ouvert)
	ligne(cj, "volH", "aile", T.pouce, "valeur")
	ligne(cj, "vib", "vibre", T.vibrations)
	ligne(cj, "nitroInf", "flamme", FR and "NITRO INFINIE" or "INFINITE NITRO") -- (5/10) le passe NITRO INFINIE, coupé ou rallumé : branché et montré (à qui le possède) par Client/Revenus
	ligne(cj, "tuto", "volant", T.revoir, "action")
	-- (L5718) EFFACER MA PROGRESSION — en rouge, tout en bas, et il faut toucher DEUX fois
	ligne(cj, "effacer", "croix", FR and "EFFACER MA PROGRESSION" or "ERASE MY PROGRESS", "action")
	E.rg.effacer.lib.TextColor3 = C.rouge
	teinter(E.rg.effacer.ico, C.rouge)
	E.rgRetour = boutonRetour(reg)
	empiler(reg, 22)

	-- ══ LE CHOIX DU MODE (à la toute première partie) ══
	local choix = inst("Frame", { Name = "Choix", BackgroundColor3 = C.nuit, BackgroundTransparency = 0.2, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 40 }, racine)
	E.choix = choix
	jupe(choix)
	local pc = carbone(choix, UDim2.fromOffset(820, 440), UDim2.fromScale(0.5, 0.5), C.vert, Vector2.new(0.5, 0.5))
	texte(pc, { Text = T.choisis, TextSize = 44, TextColor3 = C.texte, Size = UDim2.new(1, -60, 0, 46), Position = UDim2.fromOffset(30, 30), TextWrapped = false, epais = 3,
		italique = true, ajuste = 0 })
	signature(pc, UDim2.new(0.5, -110, 0, 86))
	inst("TextLabel", { BackgroundTransparency = 1, FontFace = TXT, TextSize = 26, TextColor3 = C.texte2, TextWrapped = true, Text = T.facileTxt,
		Size = UDim2.new(1, -100, 0, 140), Position = UDim2.fromOffset(50, 108) }, pc)
	E.btFacileOui = tuile(pc, T.facileMot, C.vert, UDim2.fromOffset(340, 100), UDim2.new(0.5, -14, 1, -40), Vector2.new(1, 1), 34, "coeur")
	E.btFacileNon = tuile(pc, T.normal, C.cyan, UDim2.fromOffset(340, 100), UDim2.new(0.5, 14, 1, -40), Vector2.new(0, 1), 34, "eclair")
	empiler(choix, 40)

	-- ══ MORT : L'ÉCRAN DE FIN v3 du web (#mDead) ══
	-- À gauche : le titre (NOUVEAU RECORD ! ou la cause), le panneau vert de l'argent VERSÉ (le héros de l'écran), puis deux cartes,
	-- l'AURA de la partie et le MOTEUR ATTEINT avec sa photo 3D. À droite : la carte du DÉFI, les quatre chiffres de la partie,
	-- BOUTIQUE | REGLAGES, et la paire des jeux mobiles HOME | REJOUER (le lingot : la seule plaque d'or).
	-- Tout est mesuré sur le web (844 × 390) et porté sur 720 px de haut.
	-- (v3, 5/10) les cartes sont des plaques de laque (contour d'encre, liseré, reflet) ; l'AURA a son titre EN HAUT comme sa voisine
	-- MOTEUR ATTEINT (il flottait au milieu, deux cartes côte à côte qui ne s'alignaient pas) ; les chiffres tiennent dans leur colonne
	-- sans TextScaled ; et sur un écran 16:10 ou un iPad, le titre ne mord plus sur la carte de LA ROUE ni REJOUER sur son lingot.
	local mort = inst("Frame", { Name = "Mort", BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.06,
		Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 30 }, racine)
	E.mort = mort
	-- (L39294) LA GARDE : l'écran de fin ignore les appuis pendant 0,6 s — on martèle NITRO pour passer l'explosion, et REJOUER est
	-- juste sous le pouce : sans elle, la partie repartait avant qu'on ait vu son résultat
	E.mGarde = inst("TextButton", { Name = "Garde", Text = "", BackgroundTransparency = 1, AutoButtonColor = false, Size = UDim2.fromScale(1, 1),
		ZIndex = 60, Visible = false }, mort)
	degrade(mort, Color3.fromRGB(34, 16, 60), Color3.fromRGB(12, 8, 30), 60)
	jupe(mort)
	E.mCause = texte(mort, { Text = "", TextSize = 62, TextColor3 = C.rose, italique = true, Size = UDim2.new(0.48, -30, 0, 64),
		Position = UDim2.new(0.03, 24, 0, 14), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 4, contourCouleur = hx("3a0626") })
	inst("UISizeConstraint", { MaxSize = Vector2.new(4000, 64) }, E.mCause)
	E.mCauseEchelle = inst("UIScale", {}, E.mCause)
	-- le panneau vert : VERSÉS AU COMPTE
	local pv = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.new(0.48, 0, 0, 218),
		Position = UDim2.new(0.03, 0, 0, 90) }, mort)
	degrade(pv, Color3.fromRGB(18, 96, 52), Color3.fromRGB(4, 30, 16), 90)
	inst("UIStroke", { Color = C.encre, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, pv)
	do
		local reflet = inst("Frame", { Name = "Reflet", BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.9, BorderSizePixel = 0, Size = UDim2.fromScale(1, 0.4) }, pv)
		inst("UIGradient", { Rotation = 90, Transparency = NumberSequence.new(0, 1) }, reflet)
	end
	lisere(pv, Color3.fromRGB(110, 240, 150), Color3.fromRGB(8, 50, 26))
	inst("Frame", { BackgroundColor3 = Color3.fromRGB(125, 255, 155), BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 5) }, pv)
	texte(pv, { Text = T.verse, TextSize = 28, TextColor3 = Color3.fromRGB(190, 250, 205), Size = UDim2.new(1, -20, 0, 30), Position = UDim2.fromOffset(10, 16), TextWrapped = false,
		ajuste = 0 })
	-- (le cadre RECORD : une étiquette pleine, cernée — Client/Revenus y écrit aussi la mention VIP / PREMIUM)
	E.mRecord = texte(pv, { Text = "", TextSize = 24, TextColor3 = C.menthe, Size = UDim2.fromOffset(190, 34), BackgroundColor3 = Color3.fromRGB(6, 46, 24), BackgroundTransparency = 0,
		Position = UDim2.new(0.5, 0, 0, 52), AnchorPoint = Vector2.new(0.5, 0), TextWrapped = false })
	inst("UIStroke", { Color = C.menthe, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border, Name = "Cadre" }, E.mRecord)
	E.mArgent = texte(pv, { Text = "", TextSize = 100, TextColor3 = C.menthe, Size = UDim2.new(1, 0, 0, 100), Position = UDim2.new(0.5, 0, 0, 86), AnchorPoint = Vector2.new(0.5, 0),
		epais = 5, contourCouleur = Color3.fromRGB(4, 40, 20), TextWrapped = false })
	E.mArgentEchelle = inst("UIScale", {}, E.mArgent)
	E.mCompte = texte(pv, { Text = "", TextSize = 26, TextColor3 = Color3.fromRGB(190, 250, 205), Size = UDim2.new(1, -20, 0, 28), Position = UDim2.new(0, 10, 1, -40), TextWrapped = false,
		ajuste = 0 })
	-- AURA et MOTEUR ATTEINT
	local pa = carbone(mort, UDim2.new(0.235, 0, 0, 366), UDim2.new(0.03, 0, 0, 328), nil)
	-- (capture web : chaque carte a SA teinte — l'aura sur un fond prune, le moteur sur un bleu de nuit ; en carbone noir, l'écran était un trou)
	pa:FindFirstChildOfClass("UIGradient").Color = ColorSequence.new(Color3.fromRGB(64, 36, 100), Color3.fromRGB(26, 16, 50))
	inst("Frame", { BackgroundColor3 = C.magenta, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 5) }, pa)
	texte(pa, { Text = T.aura, TextSize = 26, TextColor3 = C.texte2, Size = UDim2.new(1, -16, 0, 28), Position = UDim2.fromOffset(8, 18), TextWrapped = false, ajuste = 0 })
	-- (le cœur de la carte, centré dans la place sous le titre : l'étoile de l'aura, le chiffre, le meilleur)
	icone(pa, "etoile", 6, { { 0.3, hx("ffd0f4") }, { 0.7, hx("ff6ad5") }, { 1, hx("b0208c") } }, UDim2.new(0.5, 0, 0.5, -64), Vector2.new(0.5, 0.5))
	E.mAura = texte(pa, { Text = "0", TextSize = 78, TextColor3 = hx("ff8ae0"), Size = UDim2.new(1, 0, 0, 80), Position = UDim2.new(0.5, 0, 0.5, -6), AnchorPoint = Vector2.new(0.5, 0), TextWrapped = false,
		epais = 4, contourCouleur = hx("3a0626") })
	E.mAuraEchelle = inst("UIScale", {}, E.mAura)
	E.mAuraMeilleur = texte(pa, { Text = "", TextSize = 24, TextColor3 = C.terne, Size = UDim2.new(1, -16, 0, 26), Position = UDim2.new(0, 8, 0.5, 88), TextWrapped = false, ajuste = 0 })
	local pm = carbone(mort, UDim2.new(0.235, 0, 0, 366), UDim2.new(0.275, 0, 0, 328), nil)
	pm:FindFirstChildOfClass("UIGradient").Color = ColorSequence.new(Color3.fromRGB(36, 50, 104), Color3.fromRGB(16, 20, 48))
	inst("Frame", { BackgroundColor3 = C.cyan, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 5) }, pm)
	texte(pm, { Text = T.moteurAtteint, TextSize = 26, TextColor3 = C.texte2, Size = UDim2.new(1, -16, 0, 28), Position = UDim2.fromOffset(8, 18), TextWrapped = false, ajuste = 0 })
	-- la PHOTO : le moteur du palier, en 3D, qui tourne (rempli par Client/MoteurCarte à la fin de la partie)
	E.mMoteurVue = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.new(1, -20, 0, 180), Position = UDim2.fromOffset(10, 50),
		Ambient = Color3.fromRGB(78, 76, 96), LightColor = Color3.fromRGB(190, 182, 172), LightDirection = Vector3.new(-0.5, -1, -0.6) }, pm) -- (vu dans Studio : à 150 / 255 le moteur sortait blanc)
	E.mMoteurNom = texte(pm, { Text = "", TextSize = 20, TextColor3 = C.or_, Size = UDim2.new(1, -16, 0, 22), Position = UDim2.new(0.5, 0, 0, 232), AnchorPoint = Vector2.new(0.5, 0), TextWrapped = false })
	E.mMoteurNomEchelle = inst("UIScale", {}, E.mMoteurNom)
	E.mMoteurPalier = texte(pm, { Text = "", RichText = true, TextSize = 26, TextColor3 = C.texte2, Size = UDim2.new(1, 0, 0, 46), Position = UDim2.new(0.5, 0, 0, 258), AnchorPoint = Vector2.new(0.5, 0), TextWrapped = false })
	do
		-- (« PALIER 4 RECORD ! » est en texte riche — le chiffre en 46 — : il ne passe pas par `ajuster`. Sa largeur se compte morceau
		-- par morceau, et une échelle le resserre quand la carte est étroite : sur un portable 16:10 il touchait les deux bords.)
		local sc = inst("UIScale", {}, E.mMoteurPalier)
		local function serrer()
			local t = E.mMoteurPalier.Text
			local large = 0
			local reste = string.gsub(t, '<font size="(%d+)">(.-)</font>', function(c, m)
				large += utf8.len((string.gsub(m, "<[^>]+>", ""))) * tonumber(c) * CH
				return ""
			end)
			large += utf8.len((string.gsub(reste, "<[^>]+>", ""))) * 26 * CH
			local k, a = 1, E.mMoteurPalier :: Instance?
			while a and a:IsA("GuiObject") do
				local s9 = a:FindFirstChildOfClass("UIScale")
				if s9 then k *= s9.Scale end
				a = a.Parent
			end
			local w = E.mMoteurPalier.AbsoluteSize.X / math.max(k, 0.01) - 20
			if w > 40 and large > 0 then sc.Scale = math.min(1, w / large) end
		end
		E.mMoteurPalier:GetPropertyChangedSignal("Text"):Connect(serrer)
		E.mMoteurPalier:GetPropertyChangedSignal("AbsoluteSize"):Connect(serrer)
	end
	E.mMoteurEncore = texte(pm, { Text = "", TextSize = 17, TextColor3 = Color3.fromRGB(255, 176, 40), Size = UDim2.new(1, -16, 0, 48),
		Position = UDim2.fromOffset(8, 308), LineHeight = 1.3 })
	-- à droite : la carte de LA ROUE (l'ancienne carte du défi : les mêmes cases, voir Hud.defi et Client/Roue) — on la touche, la
	-- roue s'ouvre
	local pp = carbone(mort, UDim2.new(0.435, 0, 0, 282), UDim2.new(0.535, 0, 0, 26), C.vert)
	E.mDefiBouton = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false, ZIndex = 3 }, pp)
	do
		-- (la carte se touche : elle s'éclaire au survol et sous le doigt, comme une ligne des réglages)
		local lueur = inst("Frame", { Name = "Lueur", BackgroundColor3 = Color3.fromRGB(150, 255, 170), BackgroundTransparency = 1, BorderSizePixel = 0,
			Size = UDim2.new(1, -4, 1, -4), Position = UDim2.fromOffset(2, 2), ZIndex = 2 }, pp)
		local bas, survol = false, false
		local function luire() lueur.BackgroundTransparency = bas and 0.88 or (survol and 0.95 or 1) end
		E.mDefiBouton.MouseButton1Down:Connect(function() bas = true luire() end)
		E.mDefiBouton.MouseButton1Up:Connect(function() bas = false luire() end)
		E.mDefiBouton.MouseEnter:Connect(function() survol = souris() luire() end)
		E.mDefiBouton.MouseLeave:Connect(function() bas, survol = false, false luire() end)
		E.mDefiBouton.Activated:Connect(function() Sons.jouer("tap") Hud.vibre(6) end)
	end
	E.mDefiFilet = pp:FindFirstChild("Filet") :: Frame?
	E.mDefiIco = icone(pp, "..#####..|.#..#..#.|#.#.#.#.#|#..###..#|#########|#..###..#|#.#.#.#.#|.#..#..#.|..#####..", 4, C.vert, UDim2.fromOffset(28, 22))
	E.mDefiTete = texte(pp, { Text = "", TextSize = 24, TextColor3 = C.vert, Size = UDim2.new(1, -200, 0, 26), Position = UDim2.fromOffset(76, 28),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, ajuste = 0 })
	E.mDefiPips = {}
	for i = 1, 3 do
		local pip = inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.fromOffset(12, 28), Position = UDim2.new(1, -90 + i * 20, 0, 26) }, pp)
		inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, pip)
		E.mDefiPips[i] = pip
	end
	E.mDefiTxt = texte(pp, { Text = "", TextSize = 32, TextColor3 = C.texte, Size = UDim2.new(1, -56, 0, 76), Position = UDim2.fromOffset(28, 72),
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, LineHeight = 1.15, epais = 3 })
	local fondD = inst("Frame", { BackgroundColor3 = hx("0d0a2a"), BorderSizePixel = 0, Size = UDim2.new(1, -56, 0, 14), Position = UDim2.fromOffset(28, 160) }, pp)
	inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, fondD)
	E.mDefiPlein = inst("Frame", { BackgroundColor3 = C.vert, BorderSizePixel = 0, Size = UDim2.fromScale(0, 1) }, fondD)
	inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.6, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 4) }, E.mDefiPlein)
	E.mDefiPrime = texte(pp, { Text = "", TextSize = 22, TextColor3 = C.vert, Size = UDim2.new(0.5, -28, 0, 24), Position = UDim2.fromOffset(28, 188),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, ajuste = 0 })
	E.mDefiRec = texte(pp, { Text = "", TextSize = 22, TextColor3 = C.or_, Size = UDim2.new(0.5, -28, 0, 24), Position = UDim2.new(1, -28, 0, 188),
		AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false, ajuste = 0 })
	-- (la cause de la mort et la distance : la petite ligne du bas de la carte)
	E.mPartie = texte(pp, { Text = "", TextSize = 17, TextColor3 = C.terne, Size = UDim2.new(1, -56, 0, 40), Position = UDim2.new(0, 28, 1, -52),
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Bottom, LineHeight = 1.3 })
	-- les quatre chiffres de la partie
	local ps = carbone(mort, UDim2.new(0.435, 0, 0, 130), UDim2.new(0.535, 0, 0, 328), nil)
	E.mStats = {}
	for i = 1, 4 do
		local col = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(0.25, 0, 1, 0), Position = UDim2.fromScale((i - 1) * 0.25, 0) }, ps)
		-- (« 1 234 » km/h débordait de sa colonne : le chiffre rapetisse juste ce qu'il faut — TextScaled le laissait tel quel)
		local v = texte(col, { Text = "", TextSize = 54, TextColor3 = C.texte, Size = UDim2.new(1, -12, 0, 58), Position = UDim2.fromOffset(6, 20), TextWrapped = false, epais = 3,
			ajuste = 0 })
		local l = texte(col, { Text = "", TextSize = 19, TextColor3 = C.lavande, Size = UDim2.new(1, -8, 0, 22), Position = UDim2.fromOffset(4, 88), TextWrapped = false, ajuste = 0 })
		E.mStats[i] = { v, l }
		if i > 1 then inst("Frame", { BackgroundColor3 = C.encre, BackgroundTransparency = 0.3, BorderSizePixel = 0, Size = UDim2.new(0, 2, 0.66, 0), Position = UDim2.fromScale(0, 0.17) }, col) end
	end
	E.btBoutiqueM = tuile(mort, T.boutique, C.magenta, UDim2.new(0.2125, 0, 0, 88), UDim2.new(0.535, 0, 0, 480), nil, 30, "panier")
	E.btReglM = tuile(mort, T.reglages, C.cyan, UDim2.new(0.2125, 0, 0, 88), UDim2.new(0.7575, 0, 0, 480), nil, 30, "reglages")
	-- (HOME : l'icône AU-DESSUS du mot, comme GARAGE et BOUTIQUE à l'accueil — côte à côte, sur un iPad, ils ne tenaient plus dans
	-- sa largeur et le mot tombait à 9 px)
	E.btMenuM = tuile(mort, T.menu, C.lavande, UDim2.new(0.125, 0, 0, 104), UDim2.new(0.535, 0, 0, 588), nil, 28, "maison", "v")
	E.btRejouer = lingot(mort, T.rejouer, UDim2.new(0.3, 0, 0, 104), UDim2.new(0.67, 0, 0, 588), nil, FR and 80 or 58) -- (« PLAY AGAIN » : dix lettres)
	empiler(mort, 30)

	-- ══ LE TOAST : une ligne qui passe en haut de n'importe quel écran (refus d'achat, « bientôt »…) ══
	E.toast = carbone(racine, UDim2.fromOffset(780, 66), UDim2.new(0.5, 0, 0, -80), C.or_, Vector2.new(0.5, 0))
	E.toast.ZIndex = 80
	E.toast.Visible = false
	E.toastTxt = texte(E.toast, { Text = "", TextSize = 22, TextColor3 = C.texte, Size = UDim2.new(1, -28, 1, 0),
		Position = UDim2.fromOffset(16, 0), ZIndex = 81, TextWrapped = false, epais = 3, ajuste = 0 })

	-- (banc) workspace:SetAttribute("DbgAstuce", os.clock()) : la carte d'astuce, 6 s — pour la photographier en course
	workspace:GetAttributeChangedSignal("DbgAstuce"):Connect(function() Hud.astuce(T.astuces[1], 6) end)

	Hud.brancherTactile()
	return gui
end

-- ── LE BOUTON NITRO ET SA BARRE : la couleur de la poussée (orange · réserve bleue · NITRO INFINIE violette · à sec rouge) ──
local nEtat = ""
function Hud.nitro(a: number, b: number, infini: boolean, appuye: boolean)
	local fam = infini and "violet" or "nitro"
	E.nitro.regler(infini and 1 or a, fam, infini and 0 or b)
	E.nitroMini.regler(infini and 1 or a, fam, infini and 0 or b)
	local bleu = not infini and a <= 0.01 and b > 0
	local sec = not infini and not appuye and a + b < 0.12
	local cle = fam .. (bleu and "b" or "") .. (sec and "s" or "") .. (appuye and "1" or "0")
	if cle == nEtat then return end
	nEtat = cle
	local nc = (infini and FAM.violet[2]) or (bleu and FAM.bleu[2]) or (sec and FAM.rouge[2]) or FAM.nitro[2]
	-- APPUYÉ : la touche descend de son épaisseur et la face S'EMBRASE à la couleur de la poussée
	repeindre(E.nitroPlaque, C.carbone:Lerp(nc, appuye and 0.55 or 0.2), nc)
	if E.nitroLisere then E.nitroLisere.BackgroundColor3 = nc:Lerp(Color3.new(1, 1, 1), 0.45) end
	E.nitroPlaque.Position = UDim2.fromOffset(0, appuye and 5 or 0)
	local ecl = appuye and ECLAIR.feu or (infini and ECLAIR.violet or ECLAIR.nitro)
	teinter(E.nitroBtIco, ecl)
	teinter(E.nitroIco, infini and ECLAIR.violet or ECLAIR.nitro)
	E.nitroMini.alerte(sec and FAM.rouge[2] or nil)
end

-- ── LE CHRONO DE VOL : cyan · or (il presse) · rouge (plus rien) · menthe (AIRTIME INFINI) ──
local aEtat = ""
function Hud.air(reste: number, secondes: string, infini: boolean)
	local fam = infini and "menthe" or (reste > 0.4 and "air" or (reste > 0.2 and "or_" or "rouge"))
	E.airJ.regler(infini and 1 or reste, fam, 0)
	-- (l'air infini disait « ∞ » : un carré en police pixel)
	E.airTxt.Text = (infini and "MAX" or secondes) .. ' <font size="20">' .. T.air .. "</font>"
	if fam ~= aEtat then
		aEtat = fam
		E.airTxt.TextColor3 = FAM[fam][2]
		teinter(E.airIco, { { 0.34, FAM[fam][1] }, { 0.72, FAM[fam][2] }, { 1, FAM[fam][3] } })
	end
	-- il TREMBLE sous l'urgence (de 2 px entiers, comme tout ce qui bouge dans l'UI pixel)
	E.air.Position = UDim2.new(1, -22 + ((fam == "rouge" and os.clock() % 0.12 < 0.06) and 2 or 0), 0, 184)
end

-- ── LES PLAQUES DE POUVOIR : icône, nom, secondes au dixième, et la jauge qui se vide ; la dernière seconde et demie clignote ──
local PW_ICO = { n = "flamme", a = "aile", v = "eclair", m = "aimant", x = "etoile" }
local pwCle, pwEl = "", {} :: { any }
local pwT0: number? = nil
local pwCleVue = ""
function Hud.pouvoirs(liste: { { any } }, sousChrono: boolean)
	local cle = ""
	for _, q in liste do cle ..= q[1] end
	if cle ~= pwCle then
		pwCle = cle
		E.pouvoirs:ClearAllChildren()
		pwEl = {}
		local petit = #liste >= 3
		local hP = petit and 56 or 74
		for i, q in liste do
			local def = Config.POUVOIRS[q[1]]
			local pc = def.couleur
			local p = inst("Frame", { BackgroundColor3 = C.carbone, BackgroundTransparency = 0.12, BorderSizePixel = 0, Size = UDim2.fromOffset(petit and 230 or 270, hP),
				Position = UDim2.new(1, 0, 0, (i - 1) * (hP + 10)), AnchorPoint = Vector2.new(1, 0) }, E.pouvoirs)
			inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, p) -- (cernée d'encre, comme toutes les plaques)
			local bande = inst("Frame", { BackgroundColor3 = pc, BorderSizePixel = 0, Size = UDim2.new(0, 5, 1, 0) }, p)
			icone(p, PW_ICO[q[1]] or "etoile", petit and 4 or 5, pc, UDim2.new(0, 18, 0.5, -4), Vector2.new(0, 0.5))
			texte(p, { Text = Hud.sansAccent(FR and def.nom or def.nomEN), TextSize = petit and 15 or 18, TextColor3 = C.texte, Size = UDim2.new(1, -78, 0, 20),
				Position = UDim2.fromOffset(74, petit and 5 or 9), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
			local s = texte(p, { Text = "", TextSize = petit and 26 or 36, TextColor3 = pc, Size = UDim2.new(1, -78, 0, 38),
				Position = UDim2.fromOffset(74, petit and 20 or 28), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
			local u = inst("Frame", { BackgroundColor3 = pc, BorderSizePixel = 0, Size = UDim2.new(1, -24, 0, 5), Position = UDim2.new(0, 14, 1, -8) }, p)
			pwEl[i] = { p = p, s = s, u = u, bande = bande, duree = def.duree, t = "" }
		end
	end
	E.pouvoirs.Position = UDim2.new(1, -22, 0, sousChrono and 282 or 208)
	-- LE HUD DISCRET (hudDiscretTick, L29175) : une plaque présente depuis plus de 3 s pâlit (à 65 % — v3 : à 45 % elle disparaissait sur un ciel clair) ; un nouveau pouvoir la rallume,
	-- et la fin d'un pouvoir (qui clignote) la garde EN PLEIN
	if #liste == 0 then
		pwT0 = nil
	elseif not pwT0 or pwCleVue ~= cle then
		pwT0, pwCleVue = os.clock(), cle
	end
	local fort = false
	for _, q in liste do if q[2] < 1.5 then fort = true end end
	local cible = (pwT0 and os.clock() - pwT0 > 3 and not fort) and 0.35 or 0 -- (v3 : à 55 %, « AIMANT 2,5s » disparaissait sur un ciel clair)
	local g = E.pouvoirs.GroupTransparency
	if math.abs(cible - g) > 0.005 then E.pouvoirs.GroupTransparency = g + (cible - g) * ((cible > g) and 0.05 or 0.3) end
	for i, q in liste do
		local e = pwEl[i]
		if e then
			local tx = string.format("%.1f", q[2])
			if FR then tx = string.gsub(tx, "%.", ",") end
			if tx ~= e.t then
				e.t = tx
				e.s.Text = tx .. "s"
			end
			e.u.Size = UDim2.new(math.clamp(q[2] / e.duree, 0, 1), -24, 0, 5)
			e.p.BackgroundTransparency = (q[2] < 1.5 and os.clock() % 0.24 < 0.12) and 0.5 or 0.12
		end
	end
end

-- un libellé à chasse fixe tient dans `large` px : son échelle (UIScale posée sur lui) rétrécit ce qu'il faut
-- (v3) …et jamais plus large que la boîte du libellé lui-même : sur un écran 16:10 ou un iPad, la boîte est plus étroite que les
-- `large` pensés pour un écran couché (le titre de l'écran de fin mordait sur la carte de LA ROUE)
function Hud.tenir(echelle: UIScale, txt: string, corps: number, large: number)
	local l = echelle.Parent
	if l and l:IsA("GuiObject") then
		local k, a = 1, l :: Instance?
		while a and a:IsA("GuiObject") do
			local s9 = a:FindFirstChildOfClass("UIScale")
			if s9 then k *= s9.Scale end
			a = a.Parent
		end
		local w = l.AbsoluteSize.X / math.max(k, 0.01)
		if w > 40 then large = math.min(large, w) end
	end
	echelle.Scale = math.min(1, large / math.max(1, utf8.len(txt) * corps * CH))
end

-- LA CARTE DU DÉFI de l'écran de fin. d = { tete, reussi, texte, part (0-1), prime, rec, recCouleur, faits = { bool × 3 } } (Missions.fin)
function Hud.defi(d: any?)
	local c = d and d.reussi and C.vert or C.cyan
	E.mDefiTete.Text = d and d.tete or ""
	E.mDefiTete.TextColor3 = c
	teinter(E.mDefiIco, c)
	E.mDefiIco.Visible = d ~= nil
	if E.mDefiFilet then E.mDefiFilet.BackgroundColor3 = c end
	E.mDefiTxt.Text = d and d.texte or ""
	E.mDefiPlein.Size = UDim2.fromScale(d and math.clamp(d.part, 0, 1) or 0, 1)
	E.mDefiPlein.BackgroundColor3 = c
	E.mDefiPlein.Parent.Visible = d ~= nil
	E.mDefiPrime.Text = d and d.prime or ""
	E.mDefiPrime.TextColor3 = c
	E.mDefiRec.Text = d and d.rec or ""
	E.mDefiRec.TextColor3 = d and d.recCouleur or C.or_
	for i, pip in E.mDefiPips do
		pip.Visible = d ~= nil
		pip.BackgroundColor3 = (d and d.faits[i]) and C.vert or C.trait
	end
end

-- un interrupteur des RÉGLAGES : allumé (cyan, curseur à droite) ou éteint
function Hud.reglage(cle: string, on: boolean)
	local o = E.rg and E.rg[cle]
	if not o or not o.mot then return end
	o.mot.Text = on and "ON" or "OFF"
	o.mot.TextColor3 = on and C.cyan or C.terne
	o.mot.Position = UDim2.new(on and 0 or 1, on and 80 or -8, 0.5, 0)
	-- (le curseur GLISSE d'un bord à l'autre le temps d'un appui — il ne se téléporte plus)
	TweenService:Create(o.curseur, RAPIDE, { Position = UDim2.fromOffset(on and 87 or 7, 7) }):Play()
	o.curseur.BackgroundColor3 = on and C.cyan or C.trait
	if o.levre then o.levre.BackgroundColor3 = on and Color3.fromRGB(200, 252, 255) or Color3.fromRGB(110, 100, 170) end
	if o.ourlet then o.ourlet.BackgroundColor3 = on and Color3.fromRGB(0, 120, 150) or Color3.fromRGB(34, 28, 64) end
	if o.piste then o.piste.BackgroundColor3 = on and Color3.fromRGB(0, 50, 72) or C.nuit end
	teinter(o.ico, on and C.cyan or C.terne)
end

-- les trois cases du bouton MISSIONS : n défis tenus sur trois
-- un CURSEUR de volume : sa poignée, son plein, son pourcentage (0-100)
function Hud.volume(cle: string, v: number, actif: boolean)
	local o = E.rg and E.rg[cle]
	if not o or not o.poignee then return end
	local u = math.clamp(v / 100, 0, 1)
	o.poignee.Position = UDim2.fromScale(u, 0.5)
	o.plein.Size = UDim2.fromScale(u, 1)
	o.plein.BackgroundColor3 = actif and C.cyan or C.trait
	o.poignee.BackgroundColor3 = actif and C.texte or C.terne
	o.pct.Text = math.floor(v + 0.5) .. (FR and " %" or "%")
	o.pct.TextColor3 = actif and C.texte2 or C.terne
end
-- une ligne À VALEUR (POUCE HAUT EN VOL : PLONGE / MONTE)
function Hud.valeur(cle: string, txt: string)
	local o = E.rg and E.rg[cle]
	if o and o.valeur then o.valeur.Text = txt end
end

function Hud.pastilles(n: number)
	for i, p in E.misPips do p.BackgroundColor3 = (i <= n) and C.vert or C.trait end
end

local toastN = 0
-- ico : une icône PIXEL devant le texte (le web pose ses pictos en pixels ; « ✗ » n'existe dans aucune police de Roblox : un carré)
function Hud.toast(txt: string, couleur: Color3?, ico: string?)
	toastN += 1
	local n = toastN
	if E.toastIco then
		E.toastIco:Destroy()
		E.toastIco = nil
	end
	if ico then
		local f = icone(E.toast, ico, 4, couleur or C.texte, UDim2.new(0, 22, 0.5, 0), Vector2.new(0, 0.5))
		f.ZIndex = 82
		for _, q in f:GetChildren() do (q :: Frame).ZIndex = 82 end
		E.toastIco = f
	end
	-- (le texte part APRÈS l'icône et garde la même marge à droite : il chevauchait l'icône quand il remplissait la ligne)
	E.toastTxt.Position = UDim2.fromOffset(ico and 70 or 16, 0)
	E.toastTxt.Size = UDim2.new(1, ico and -86 or -32, 1, 0)
	E.toastTxt.Text = txt
	E.toastTxt.TextColor3 = couleur or C.texte
	E.toast.Visible = true
	TweenService:Create(E.toast, LENTE, { Position = UDim2.new(0.5, 0, 0, 14) }):Play()
	task.delay(1.9, function()
		if n ~= toastN then return end
		TweenService:Create(E.toast, LENTE, { Position = UDim2.new(0.5, 0, 0, -80) }):Play()
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
		E.glisseTxt.Visible = false -- (L907 : la consigne est dite UNE fois — au premier braquage elle s'efface pour de bon)
		E.volantInvite.Visible = false -- (et l'anneau d'invitation avec elle)
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
	E.pause.Visible = nom == "pause"
	E.reglages.Visible = nom == "reglages"
	E.mort.Visible = nom == "mort"
	E.tactile.Visible = Hud.tactile and nom == "course"
	if nom == "menu" and Hud.surMenu then Hud.surMenu() end
	if nom ~= "course" then
		doigt = nil
		Controles.tactile.actif = false
		Controles.tactile.nitro = false
		E.stickBase.Visible = false
	end
	-- le même panneau sert à la pause (en course) et aux réglages (au menu / à la mort)
	local reg = nom == "reglages"
	E.pauseTitre.Text = reg and T.reglages or T.pause
	E.pauseBilan.Visible = not reg
	E.btRecom.Parent.Visible = not reg
	E.btMenuP.Parent.Visible = not reg
	E.btReprendre.Text = reg and T.fermer or T.reprendre
	if nom == "mort" then
		E.mGarde.Visible = true
		task.delay(0.6, function() E.mGarde.Visible = false end)
	end
	if nom == "menu" or nom == "mort" or nom == "reglages" then
		local f = (nom == "menu" and E.menu) or (nom == "mort" and E.mort) or E.reglages
		f.Position = UDim2.fromOffset(0, 24)
		TweenService:Create(f, LENTE, { Position = UDim2.fromOffset(0, 0) }):Play()
	end
	-- (v3) le panneau de PAUSE monte en place comme les autres écrans (il tombait d'un coup sur la course figée)
	if nom == "pause" and E.pausePan then
		E.pausePan.Position = UDim2.new(0.5, 0, 0.5, 24)
		TweenService:Create(E.pausePan, LENTE, { Position = UDim2.fromScale(0.5, 0.5) }):Play()
	end
end
function Hud.ecranCourant(): string return courant end

-- ── la course ──
-- UNE PRIORITÉ (popTexte, L20827) : un temps fort (PARFAIT = 2 ; AU CHEVEU, RACCOURCI, MIRACULÉ = 3) ne se fait pas voler la
-- vedette par un geste (0) ou un palier (1) dans les 650 ms. Sans elle, la pose écrivait jusqu'à sept textes dans la même image
-- et seul le dernier se lisait.
local popFin = 0
local popPrio, popPrioFin = 0, 0
-- (v3) LA CARTE MOTEUR PARLE SEULE : pendant ses 1,7 s (MoteurCarte, sur « moteur »), un petit texte du centre ne s'écrit pas SUR son
-- titre (« SERIE COMPLETE x17 » sur « NOUVEAU SOMMET ») — il attend qu'elle finisse ; le plus important de l'attente passe ensuite
local carteFin = 0
local enAttente: { any }? = nil
Bus.on("moteur", function() carteFin = os.clock() + 1.7 end)
Bus.on("mort", function() carteFin, enAttente = 0, nil end)
function Hud.pop(txt: string, couleur: Color3?, taille: number?, prio: number?)
	local p9, t9 = prio or 0, os.clock()
	if t9 < carteFin then
		local deja = enAttente ~= nil
		if not enAttente or p9 >= (enAttente[4] or 0) then enAttente = { txt, couleur, taille, p9 } end
		if not deja then
			task.delay(carteFin - t9 + 0.05, function()
				local q = enAttente
				enAttente = nil
				if q and E.hud.Visible then Hud.pop(q[1], q[2], q[3], q[4]) end
			end)
		end
		return
	end
	if p9 < popPrio and t9 < popPrioFin then return end
	popPrio, popPrioFin = p9, t9 + 0.65
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
	E.grand.TextSize = taille or 50
	E.grand.Size = UDim2.new(1, 0, 0, 80)
	TweenService:Create(E.grand, LENTE, { Size = UDim2.new(1, 0, 0, 60) }):Play()
	grandFin = os.clock() + (duree or 0.8)
	-- le bandeau : seulement pour un NOM (le compte à rebours, lui, passe une taille et reste nu)
	local bande = taille == nil
	E.grandBande.BackgroundTransparency = bande and 0 or 1
	for _, f9 in E.grandBande:GetChildren() do
		if f9:IsA("Frame") then f9.BackgroundTransparency = bande and 0 or 1 end
	end
	if bande then
		E.grandBande.Size = UDim2.new(0.4, 0, 0, 78)
		E.grandBande.Position = UDim2.new(0.3, 0, 0.33, 0)
		TweenService:Create(E.grandBande, TweenInfo.new(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
			{ Size = UDim2.new(1, 0, 0, 78), Position = UDim2.fromScale(0, 0.33) }):Play()
	end
end
-- LE LOGO DU DÉPART : il claque (0,7 s, à rebond), tient, puis s'efface — 1,9 s en tout, comme sur le web
local logoN = 0
function Hud.logoDepart()
	logoN += 1
	local n = logoN
	E.logo.Visible = true
	E.logoEchelle.Scale = 0.18
	TweenService:Create(E.logoEchelle, TweenInfo.new(0.7, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Scale = 1 }):Play()
	for _, t in E.logoMots do
		t.TextTransparency = 1
		local st = t:FindFirstChildOfClass("UIStroke")
		if st then st.Transparency = 0 end
		TweenService:Create(t, TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { TextTransparency = 0 }):Play()
	end
	for k, h in E.logoHalo do
		h.BackgroundTransparency = 1
		TweenService:Create(h, TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { BackgroundTransparency = 1 - 0.06 * k }):Play()
	end
	task.delay(1.9, function()
		if n ~= logoN then return end
		local sortie = TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
		for _, t in E.logoMots do
			TweenService:Create(t, sortie, { TextTransparency = 1 }):Play()
			local st = t:FindFirstChildOfClass("UIStroke")
			if st then TweenService:Create(st, sortie, { Transparency = 1 }):Play() end
		end
		for _, h in E.logoHalo do TweenService:Create(h, sortie, { BackgroundTransparency = 1 }):Play() end
		task.delay(0.32, function() if n == logoN then E.logo.Visible = false end end)
	end)
end
-- (une mort, un retour au menu : ni le logo ni la carte d'astuce ne restent plantés sur l'écran de fin ou la partie d'après)
function Hud.logoCache()
	logoN += 1
	E.logo.Visible = false
	E.astuce.Visible = false
end
-- le compteur du dauphin EN VOL (0 = rien à montrer) ; il n'écrit que si l'entier change, et BONDIT quand la figure naît
local dolVu = -1
function Hud.dolVol(v: number)
	if v == dolVu then return end
	local bond = dolVu > 0 and v >= dolVu * 1.6 and v - dolVu >= 20
	dolVu = v
	E.dolVol.Visible = v > 0
	if v <= 0 then return end
	E.dolVol.Text = "+" .. v .. " AURA"
	if bond then
		E.dolVol.TextSize = 38
		TweenService:Create(E.dolVol, LENTE, { TextSize = 26 }):Play()
	end
end
-- le compteur d'argent de la course : la valeur affichée (qui défile), le « +$ » des gains qui tombent (nil = caché), la frappe
local cashVu, cashPlus = "", ""
-- (v3) LE SÉPARATEUR FIN : en police pixel une espace (ou la virgule anglaise) a la largeur d'un chiffre — « $1 244 » se lisait comme
-- deux nombres. Il s'écrit à 40 % du corps, en texte riche (la méthode de `serre` dans HudScore).
local function fin9(s: string, corps: number): string
	return (string.gsub(s, "[ ,]", function(c: string) return '<font size="' .. math.max(1, math.floor(corps * 0.4 + 0.5)) .. '">' .. c .. "</font>" end))
end
function Hud.cashMaj(v: number, plus: string?, x3: boolean, frappe: boolean)
	local t = '<font size="36">$</font>' .. fin9(Hud.cash(v), 55)
	if t ~= cashVu then
		cashVu = t
		E.argent.Text = t
	end
	if frappe then
		E.argentEchelle.Scale = 1.12
		TweenService:Create(E.argentEchelle, RAPIDE, { Scale = 1 }):Play()
	end
	local p = plus or ""
	if p ~= cashPlus then
		cashPlus = p
		E.argentPlus.Text = (string.find(p, "<", 1, true) and p) or fin9(p, 24)
		E.argentPlus.Visible = p ~= ""
	end
	E.argentPlus.TextColor3 = x3 and C.or_ or C.vert
end
-- les pastilles de l'accueil : n choses à s'offrir au garage ; la boutique jamais visitée
function Hud.badges(nGarage: number, shopNeuf: boolean)
	E.bdGar.Text = tostring(nGarage)
	E.bdGar.Visible = nGarage > 0
	E.bdShop.Visible = shopNeuf
end
-- le bilan de la partie en cours, sous le titre PAUSE
function Hud.pauseBilan(aura: number, moteur: number, niveau: number)
	-- (la piste de l'auto-école est la zone 0 : la pause y disait « NIVEAU 0 »)
	local ou = (niveau <= 0) and (FR and "AUTO-ECOLE" or "DRIVING SCHOOL") or ("ZONE " .. niveau)
	E.pauseBilan.Text = string.format("AURA %s   -   %s %d   -   %s", Hud.entier(aura), T.palier, moteur, ou)
end
-- la démo du geste de l'auto-école (les keyframes du web, en marches : coGlisse 1,6 s ×16, coAppui ,5 s ×2, coBord 1,2 s ×12,
-- coCible ,8 s ×4) — appelée à chaque image tant que la carte est là
function Hud.coachGeste(nom: string?)
	local t = os.clock()
	for k, g in E.coachGestes do
		local on = k == nom
		if g.f.Visible ~= on then g.f.Visible = on end
		if on then
			local x, y, sc, tr9 = 0, 0, 1, 0
			if k == "glisse" then
				local u = math.floor((t % 1.6) / 1.6 * 16) / 16
				x = -110 + 220 * (1 - math.abs(1 - 2 * u))
			elseif k == "nitro" then
				y = (t % 0.5 < 0.25) and 0 or 7
			elseif k == "bord" then
				local u = math.floor((t % 1.2) / 1.2 * 12) / 12
				x = (u < 0.8) and (-90 + 200 * u / 0.8) or (110 + 40 * (u - 0.8) / 0.2)
				tr9 = (u < 0.8) and 0 or (u - 0.8) / 0.2
			else
				local u = math.floor((t % 0.8) / 0.8 * 4) / 4
				sc = 0.8 + 0.35 * (1 - math.abs(1 - 2 * u))
			end
			g.f.Position = UDim2.new(0.5, x, 0, 22 + y)
			g.k.Scale = sc
			if g.tr ~= tr9 then -- (les pixels ne s'effacent qu'au bout de la course vers le bord)
				g.tr = tr9
				for _, px9 in g.f:GetChildren() do
					if px9:IsA("Frame") then px9.BackgroundTransparency = tr9 end
				end
			end
		end
	end
end
-- l'anneau d'appel du bouton NITRO (l'auto-école)
function Hud.nitroAppel(on: boolean)
	if E.nitroAppel.Visible ~= on then E.nitroAppel.Visible = on end
	if on then
		local u = 0.5 + 0.5 * math.sin(os.clock() * 7)
		E.nitroAppelTrait.Transparency = 0.1 + 0.6 * u
		E.nitroAppelTrait.Thickness = 3 + 4 * (1 - u)
	end
end
-- L'INTRO DU STUDIO (L38356 du jeu web — « accumulation… battements… FISSION ») : le titre CASH CAR bat trois fois (pulsation, micro-
-- éclair, onde), puis TOUT explose — dollars, cœurs, trèfles, crânes, euros, yens — et la signature se lève dans la fumée, à sa
-- place : 1.61 GAMES (Sacha, 25/09 : « marque juste 1.61 GAMES »). Elle s'EFFACE avant que l'écran ne s'ouvre (deux détonations de
-- suite, et la première ne vaut plus rien). Une fois, au lancement ; ~4 s. Rend la main quand c'est fini.
function Hud.introStudio()
	local ch = E.charge
	if not ch or not ch.Visible then return end
	E.chargeTxt.Visible = false
	E.chargeBloc.Visible = false
	E.chargeJ.regler(1, "or_", 0)
	-- (l'éclair couvre aussi la jupe : la bande des boutons de Roblox blanchit avec le reste)
	local fl = inst("Frame", { BackgroundColor3 = Color3.fromRGB(255, 240, 200), BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.new(1, 800, 1, 800),
		Position = UDim2.fromOffset(-400, -400), ZIndex = 58 }, ch)
	local function onde(r1: number, ep: number, c: Color3, d: number)
		local o = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(40, 40), Position = UDim2.fromScale(0.5, 0.3), AnchorPoint = Vector2.new(0.5, 0.5), ZIndex = 52 }, ch)
		inst("UICorner", { CornerRadius = UDim.new(0.5, 0) }, o)
		local st = inst("UIStroke", { Color = c, Thickness = ep, Transparency = 0.2 }, o)
		local ti = TweenInfo.new(d, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
		TweenService:Create(o, ti, { Size = UDim2.fromOffset(r1, r1) }):Play()
		TweenService:Create(st, ti, { Transparency = 1 }):Play()
		task.delay(d + 0.05, function() o:Destroy() end)
	end
	-- les trois BATTEMENTS
	for k = 1, 3 do
		E.chargeEchelle.Scale = 1 + 0.13 * k
		fl.BackgroundTransparency = 1 - 0.1 * k
		onde(700 + k * 240, 3, Color3.fromRGB(255, 214, 110), 0.7)
		Sons.jouer("bip", Sons.demiTons(-12 + k * 4), 0.4)
		task.wait(0.13)
		E.chargeEchelle.Scale = 1
		fl.BackgroundTransparency = 1
		task.wait(0.32)
	end
	-- LA FISSION : le titre éclate, les symboles partent dans tous les sens
	fl.BackgroundTransparency = 0
	Sons.vrai("departLogo", nil, nil, "explosion", 1.4, 0.4)
	E.chargeLogo.Visible = false
	local SYM = { { "$", "#ffd75e" }, { "♥", "#ff5e8a" }, { "♣", "#54e07a" }, { "☠", "#e8e8f0" }, { "€", "#9ad8ff" }, { "¥", "#ffc46b" }, { "1.61", "#fff2be" }, { "♦", "#ff9d2e" } }
	for _ = 1, 46 do
		local sy = SYM[math.random(1, #SYM)]
		local a, v = math.random() * 6.283, 220 + math.random() * 700
		local l = inst("TextLabel", { BackgroundTransparency = 1, FontFace = TXT, Text = sy[1], TextColor3 = Color3.fromHex(sy[2]), TextSize = 26 + math.random() * 44,
			Size = UDim2.fromOffset(80, 80), Position = UDim2.fromScale(0.5, 0.3), AnchorPoint = Vector2.new(0.5, 0.5), Rotation = math.random() * 360, ZIndex = 53 }, ch)
		local d = 1.5 + math.random() * 0.9
		TweenService:Create(l, TweenInfo.new(d, Enum.EasingStyle.Quart, Enum.EasingDirection.Out), {
			Position = UDim2.new(0.5, math.cos(a) * v, 0.3, math.sin(a) * v * 0.72), Rotation = l.Rotation + (math.random() - 0.5) * 300, TextTransparency = 1 }):Play()
		task.delay(d + 0.05, function() l:Destroy() end)
	end
	for i = 0, 2 do onde(1600 - i * 300, 7 - i * 2, (i == 1) and Color3.fromRGB(255, 120, 180) or Color3.fromRGB(255, 224, 150), 0.9) end
	task.wait(0.13)
	TweenService:Create(fl, TweenInfo.new(0.25), { BackgroundTransparency = 1 }):Play()
	task.wait(0.17)
	-- LA SIGNATURE se lève à la place du titre
	local sig = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(700, 140), Position = UDim2.fromScale(0.5, 0.3), AnchorPoint = Vector2.new(0.5, 0.5), ZIndex = 54 }, ch)
	local sc = inst("UIScale", { Scale = 0.7 }, sig)
	local n1 = texte(sig, { Text = "1.61", TextSize = 96, TextColor3 = C.or_, Size = UDim2.new(1, 0, 0, 100), Position = UDim2.fromOffset(0, 0), ZIndex = 55, epais = 5, TextTransparency = 1 })
	local n2 = texte(sig, { Text = "GAMES", TextSize = 30, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 34), Position = UDim2.fromOffset(0, 104), ZIndex = 55, epais = 3, TextTransparency = 1 })
	degrade(n1, Color3.fromRGB(255, 244, 170), C.orFonce, 90)
	local ti = TweenInfo.new(0.45, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
	TweenService:Create(sc, ti, { Scale = 1 }):Play()
	for _, n9 in { n1, n2 } do
		TweenService:Create(n9, ti, { TextTransparency = 0 }):Play()
		local s9 = n9:FindFirstChildOfClass("UIStroke")
		if s9 then
			s9.Transparency = 1
			TweenService:Create(s9, ti, { Transparency = 0 }):Play()
		end
	end
	for _ = 1, 10 do -- (la scène tremble sous la détonation)
		sig.Position = UDim2.new(0.5, (math.random() - 0.5) * 16, 0.3, (math.random() - 0.5) * 16)
		task.wait(0.034)
	end
	sig.Position = UDim2.fromScale(0.5, 0.3)
	task.wait(1.8)
	-- …et elle s'EFFACE
	local to = TweenInfo.new(0.45, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
	TweenService:Create(sc, to, { Scale = 1.16 }):Play()
	TweenService:Create(n1, to, { TextTransparency = 1 }):Play()
	TweenService:Create(n2, to, { TextTransparency = 1 }):Play()
	for _, s9 in { n1:FindFirstChildOfClass("UIStroke"), n2:FindFirstChildOfClass("UIStroke") } do
		if s9 then TweenService:Create(s9, to, { Transparency = 1 }):Play() end
	end
	task.wait(0.5)
	sig:Destroy()
	fl:Destroy()
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
		if E.grandBande.BackgroundTransparency < 1 then
			local a9 = math.min(1, (t - grandFin) / 0.3)
			E.grandBande.BackgroundTransparency = a9
			for _, f9 in E.grandBande:GetChildren() do
				if f9:IsA("Frame") then f9.BackgroundTransparency = a9 end
			end
		end
		if t > grandFin + 0.3 then E.grand.Text = "" end
	end
	if E.astuce.Visible and t > astuceFin then E.astuce.Visible = false end
end

return Hud
