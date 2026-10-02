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
local UserInputService = game:GetService("UserInputService")
local GuiService = game:GetService("GuiService")

local Controles = require(script.Parent:WaitForChild("Controles"))
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Icones = require(script.Parent.Parent:WaitForChild("Icones"))
local Sons = require(script.Parent:WaitForChild("Sons"))

local Hud = {}

-- ── la langue : français si le compte Roblox est en français, anglais sinon ──
local FR = string.sub(Players.LocalPlayer.LocaleId or "fr", 1, 2) == "fr"
Hud.FR = FR
local T = FR and {
	jouer = "JOUER", rejouer = "REJOUER", menu = "HOME", reprendre = "REPRENDRE", recommencer = "RECOMMENCER",
	pause = "PAUSE", son = "SON", musique = "MUSIQUE", record = "RECORD", nouveau = "NOUVEAU RECORD !",
	reglages = "REGLAGES", fermer = "FERMER", retour = "RETOUR", jeu = "JEU", revoir = "REVOIR L'AUTO-ECOLE", volume = "VOLUME", pouce = "POUCE HAUT EN VOL", vibrations = "VIBRATIONS", plonge = "PLONGE", monte = "MONTE", verse = "VERSES AU COMPTE", compte = "COMPTE :", meilleur = "MEILLEUR",
	moteurAtteint = "MOTEUR ATTEINT", palier = "PALIER", encore = "ENCORE %d PIECES POUR", moteurMax = "LE PLUS GROS MOTEUR",
	multiMax = "MULTI MAX", kmhMax = "KM/H MAX", zone = "ZONE", figures = "FIGURES", frenesie = "FRENESIE", distance = "DISTANCE", pieces = "PIECES",
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
	morts = { air = "TROP LONGTEMPS EN L'AIR", vide = "AVALE PAR LE VIDE", arret = "EN PANNE SECHE", tour = "ENCASTRE DANS UNE TOUR", sat = "PERCUTE PAR UN SATELLITE", quitte = "PARTIE QUITTEE", autre = "GAME OVER" },
} or {
	jouer = "PLAY", rejouer = "PLAY AGAIN", menu = "HOME", reprendre = "RESUME", recommencer = "RESTART",
	pause = "PAUSE", son = "SOUND", musique = "MUSIC", record = "BEST", nouveau = "NEW RECORD!",
	reglages = "SETTINGS", fermer = "CLOSE", retour = "BACK", jeu = "GAME", revoir = "REPLAY DRIVING SCHOOL", volume = "VOLUME", pouce = "THUMB UP IN THE AIR", vibrations = "VIBRATION", plonge = "DIVE", monte = "CLIMB", verse = "PAID TO ACCOUNT", compte = "ACCOUNT:", meilleur = "BEST",
	moteurAtteint = "ENGINE REACHED", palier = "TIER", encore = "%d MORE COINS FOR", moteurMax = "THE BIGGEST ENGINE",
	multiMax = "MAX MULTI", kmhMax = "MAX KM/H", zone = "ZONE", figures = "TRICKS", frenesie = "FRENZY", distance = "DISTANCE", pieces = "COINS",
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
local function texte(parent: Instance, props: { [string]: any }): TextLabel
	local t = inst("TextLabel", {
		BackgroundTransparency = 1, FontFace = PIX, TextColor3 = C.texte, TextSize = 16,
		Size = UDim2.new(1, 0, 0, 24), TextWrapped = true,
	}, parent)
	for k, v in props do
		if k ~= "epais" and k ~= "contour" and k ~= "contourCouleur" and k ~= "italique" then (t :: any)[k] = v end
	end
	if props.italique then t.FontFace = PIXI end
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
	-- (fond BLANC : un dégradé MULTIPLIE la couleur du cadre — sur du carbone, tous les panneaux du jeu sortaient presque NOIRS,
	-- là où le web pose un bleu-violet de nuit)
	local f = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = taille, Position = pos,
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
-- rend le conteneur (à placer), la plaque (ce qui s'enfonce) et le bouton
local function penche(parent: Instance, taille: UDim2, pos: UDim2, ancre: Vector2?, fond: Color3, filet: Color3?, tranche: Color3, lisere: Color3?): (Frame, Frame, TextButton)
	local boite = inst("Frame", { BackgroundTransparency = 1, Size = taille, Position = pos, AnchorPoint = ancre or Vector2.zero }, parent)
	local tr = inst("Frame", { BackgroundColor3 = tranche, BorderSizePixel = 0 }, boite)
	local plaque = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, boite)
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
		local d = math.floor(Hh * PENTE + 0.5)
		local n = math.ceil(Hh / CRAN)
		for i = 0, n - 1 do
			local y = i * CRAN
			local h = math.min(CRAN, Hh - y)
			local x = math.floor((Hh - y - h / 2) * PENTE + 0.5)
			local bande = inst("Frame", { BackgroundColor3 = (i == 0 and lisere) or fondC, BorderSizePixel = 0, Size = UDim2.new(1, -d, 0, h), Position = UDim2.fromOffset(x, y) }, bandes)
			if i == 0 and lisere then
				-- le biseau clair : deux pixels en haut de la première bande
				inst("Frame", { Name = "c", BackgroundColor3 = fondC, BorderSizePixel = 0, Size = UDim2.new(1, 0, 1, -2), Position = UDim2.fromOffset(0, 2) }, bande)
			else
				bande.Name = "c"
			end
			if filetC then inst("Frame", { Name = "f", BackgroundColor3 = filetC, BorderSizePixel = 0, Size = UDim2.new(0, 5, 1, 0) }, bande) end
		end
		tr.Size = UDim2.new(1, -d, 0, 6)
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
	for _, d in plaque:GetDescendants() do
		if fond and d.Name == "c" then (d :: Frame).BackgroundColor3 = fond end
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
local function tuile(parent: Instance, libelle: string, filet: Color3, taille: UDim2, pos: UDim2, ancre: Vector2?, corps: number?, ico: string?, pose: string?): TextButton
	local _, plaque, b = penche(parent, taille, pos, ancre, C.carbone, filet, C.encre, C.trait)
	local cs = corps or 16
	b.Text = libelle
	b.TextSize = cs
	inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual }, b)
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
			local px = math.max(2, math.floor(em * 0.19 + 0.5))
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
	end
	retour(b, plaque)
	return b
end

-- le GRAND bouton doré (REJOUER, REPRENDRE) : UN lingot par écran, penché lui aussi
local function lingot(parent: Instance, libelle: string, taille: UDim2, pos: UDim2, ancre: Vector2?, corps: number?): TextButton
	local _, plaque, b = penche(parent, taille, pos, ancre, Color3.fromRGB(255, 196, 40), nil, C.orSh, Color3.fromRGB(255, 244, 150))
	b.Text = libelle
	b.TextColor3 = Color3.fromRGB(40, 22, 4)
	b.TextSize = corps or 34
	retour(b, plaque)
	return b
end

-- RETOUR : la plaque penchée cyan des sous-écrans du web, en bas à gauche (sous le pouce, jamais en haut : la charte)
local function boutonRetour(parent: Instance): TextButton
	local _, plaque, b = penche(parent, UDim2.fromOffset(290, 104), UDim2.new(0, 60, 1, -34), Vector2.new(0, 1), C.carbone, C.cyan, C.encre, C.trait)
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
	local tactile = UserInputService.TouchEnabled and not UserInputService.KeyboardEnabled
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

	-- ══ CHARGEMENT ══
	E.charge = inst("Frame", { BackgroundColor3 = C.nuit, Size = UDim2.fromScale(1, 1), ZIndex = 50 }, racine)
	local lg = texte(E.charge, { Text = "CASH CAR", TextSize = 64, TextColor3 = C.or_, Size = UDim2.new(1, 0, 0, 80),
		Position = UDim2.fromScale(0, 0.34), ZIndex = 51, epais = 4 })
	degrade(lg, Color3.fromRGB(255, 244, 170), C.orFonce, 90)
	E.chargeTxt = texte(E.charge, { Text = T.chargement, TextSize = 14, TextColor3 = C.texte2, Position = UDim2.fromScale(0, 0.52), ZIndex = 51 })

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
	local barre = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(0, 330, 0, 6), Position = UDim2.new(1, -70, 0, 104),
		AnchorPoint = Vector2.new(1, 0) }, logo)
	for i, c in { C.magenta, C.cyan, C.or_ } do
		inst("Frame", { BackgroundColor3 = c, BorderSizePixel = 0, Size = UDim2.new(i == 1 and 0.44 or 0.28, -8, 1, 0),
			Position = UDim2.fromScale(i == 1 and 0 or (i == 2 and 0.44 or 0.72), 0) }, barre)
	end
	E.menuRecord = texte(logo, { Text = "", TextSize = 16, TextColor3 = C.vert, Position = UDim2.fromOffset(0, 120),
		TextXAlignment = Enum.TextXAlignment.Right, Size = UDim2.new(1, -14, 0, 20), TextWrapped = false })
	-- la colonne de droite du web (#mHome) : MISSIONS + ⚙, puis GARAGE · CARRIERE · BOUTIQUE, puis JOUER en lettres d'or
	E.btMissions = tuile(menu, T.missions, C.vert, UDim2.fromOffset(510, 94), UDim2.new(1, -668, 1, -366), nil, 39, "cible", "g")
	-- les trois cases = les trois défis du carnet (allumées par le pilote : Hud.pastilles)
	E.misPips = {}
	for i = 1, 3 do
		E.misPips[i] = inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.fromOffset(12, 26), Position = UDim2.new(1, -120 + i * 19, 0.5, 0),
			AnchorPoint = Vector2.new(0, 0.5), Rotation = 12 }, E.btMissions.Parent)
	end
	E.btReglages = tuile(menu, "", C.cyan, UDim2.fromOffset(104, 94), UDim2.new(1, -148, 1, -366), nil, 34, "reglages")
	E.btGarage = tuile(menu, T.garage, C.cyan, UDim2.fromOffset(202, 112), UDim2.new(1, -668, 1, -258), nil, 34, "voiture", "v")
	E.btCarriere = tuile(menu, T.carriere, C.cyan, UDim2.fromOffset(202, 112), UDim2.new(1, -457, 1, -258), nil, 34, "trophee", "v")
	E.btBoutique = tuile(menu, T.boutique, C.magenta, UDim2.fromOffset(202, 112), UDim2.new(1, -246, 1, -258), nil, 34, "panier", "v")
	local jouer = inst("TextButton", { BackgroundTransparency = 1, AutoButtonColor = false, Size = UDim2.fromOffset(460, 100),
		Position = UDim2.new(1, -356, 1, -20), AnchorPoint = Vector2.new(0.5, 1), FontFace = PIXI, Text = T.jouer, TextSize = 100,
		TextColor3 = C.or_ }, menu)
	inst("UIScale", { Scale = 1.12 }, jouer)
	inst("UIStroke", { Color = Color3.fromRGB(60, 24, 6), Thickness = 5, ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual }, jouer)
	inst("UIGradient", { Rotation = 90, Color = ColorSequence.new(Color3.fromRGB(255, 244, 170), C.orFonce) }, jouer)
	retour(jouer, jouer)
	E.btJouer = jouer

	-- ══ COURSE ══
	local hud = inst("Frame", { Name = "Course", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, racine)
	E.hud = hud
	-- l'éclair + la barre de nitro
	E.nitroIco = icone(hud, "eclair", 5, ECLAIR.nitro, UDim2.fromOffset(30, 26))
	E.nitro = jauge(hud, UDim2.new(0.46, 0, 0, 44), UDim2.fromOffset(89, 28), nil, 5, 4)
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
	-- LE CHRONO DE VOL (#airHud du web) : l'aile, les secondes, « AIR », et la barre de la nitro qui se VIDE
	E.air = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(200, 86), Position = UDim2.new(1, -22, 0, 184),
		AnchorPoint = Vector2.new(1, 0), Visible = false }, hud)
	E.airIco = icone(E.air, "aile", 4, FAM.air[2], UDim2.fromOffset(0, 6))
	E.airTxt = texte(E.air, { Text = "", RichText = true, TextSize = 44, TextColor3 = FAM.air[2], Size = UDim2.new(1, -40, 0, 46), Position = UDim2.fromOffset(40, 0),
		TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false, contourCouleur = hx("1c0430"), epais = 4 })
	E.airJ = jauge(E.air, UDim2.new(1, 0, 0, 26), UDim2.fromOffset(0, 52), nil, 5, 3)
	-- LES PLAQUES DE POUVOIR (#pwrChip) : une par pouvoir actif, sous l'argent (sous le chrono quand on vole)
	E.pouvoirs = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(270, 340), Position = UDim2.new(1, -22, 0, 190), AnchorPoint = Vector2.new(1, 0) }, hud)
	-- le centre : la bannière du niveau, les figures, la chaîne
	E.grand = texte(hud, { Text = "", TextSize = 38, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 60), Position = UDim2.fromScale(0, 0.33), epais = 4 })
	E.pop = texte(hud, { Text = "", TextSize = 22, TextColor3 = C.or_, Size = UDim2.new(1, 0, 0, 34), Position = UDim2.fromScale(0, 0.22), epais = 3 })
	E.chaine = texte(hud, { Text = "", TextSize = 16, TextColor3 = C.cyan, Size = UDim2.new(1, 0, 0, 24), Position = UDim2.new(0, 0, 0.22, 38) })
	-- la carte ASTUCE
	E.astuce = carbone(hud, UDim2.fromOffset(560, 108), UDim2.new(0.5, 130, 0, 180), C.cyan, Vector2.new(0.5, 0))
	E.astuce.Visible = false
	icone(E.astuce, "eclair", 5, C.cyan, UDim2.fromOffset(24, 30))
	texte(E.astuce, { Text = T.astuce, TextSize = 22, TextColor3 = C.texte2, TextXAlignment = Enum.TextXAlignment.Left,
		Size = UDim2.new(1, -100, 0, 24), Position = UDim2.fromOffset(86, 10), TextWrapped = false })
	E.astuceTxt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = TXT, TextSize = 21, TextColor3 = C.texte, TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, Size = UDim2.new(1, -102, 0, 66),
		Position = UDim2.fromOffset(86, 38), Text = "" }, E.astuce)
	-- la carte de l'AUTO-ÉCOLE (#coach) : en HAUT, sous la jauge (web : top 62 px sur 390 — elle garde le haut de l'écran pour elle) ;
	-- l'en-tête et PASSER, le titre, la consigne, cinq pastilles
	E.coach = carbone(hud, UDim2.fromOffset(628, 150), UDim2.new(0.5, 60, 0, 92), C.vert, Vector2.new(0.5, 0))
	E.coach.Visible = false
	E.coachTete = texte(E.coach, { Text = "", TextSize = 16, TextColor3 = C.terne, Size = UDim2.new(1, -220, 0, 18), Position = UDim2.fromOffset(24, 14),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	E.coachTitre = texte(E.coach, { Text = "", TextSize = 34, TextColor3 = C.texte, Size = UDim2.new(1, -48, 0, 36), Position = UDim2.fromOffset(24, 40),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	E.coachTxt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = TXT, TextSize = 22, TextColor3 = C.texte2, TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, Size = UDim2.new(1, -48, 0, 50),
		Position = UDim2.fromOffset(24, 80), Text = "" }, E.coach)
	E.coachPips = {}
	for i = 1, 5 do
		E.coachPips[i] = inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.fromOffset(40, 6), Position = UDim2.new(0, 24 + (i - 1) * 48, 1, -14) }, E.coach)
	end
	E.btPasser = inst("TextButton", { BackgroundColor3 = C.carbone2, BorderSizePixel = 0, Size = UDim2.fromOffset(180, 44), Position = UDim2.new(1, -12, 0, 10),
		AnchorPoint = Vector2.new(1, 0), FontFace = PIX, Text = "", TextSize = 18, TextColor3 = C.texte2, AutoButtonColor = false }, E.coach)
	inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, E.btPasser)
	-- le bouton NITRO (en bas à droite, comme sur le web — souris et doigt)
	-- une touche PENCHÉE, sœur de la pause : l'éclair de la barre, le mot, et SA jauge (la même recette que la barre)
	local _, nbP, nbB = penche(hud, UDim2.fromOffset(184, 156), UDim2.new(1, -26, 1, -28), Vector2.new(1, 1), C.carbone, FAM.nitro[2], C.encre, C.trait)
	E.nitroPlaque = nbP
	E.nitroBtIco = icone(nbP, "eclair", 7, ECLAIR.nitro, UDim2.new(0.5, 0, 0, 14), Vector2.new(0.5, 0))
	texte(nbP, { Text = T.nitro, TextSize = 30, Size = UDim2.new(1, 0, 0, 32), Position = UDim2.fromOffset(0, 82), contourCouleur = hx("431600"), epais = 3, TextWrapped = false })
	E.nitroMini = jauge(nbP, UDim2.fromOffset(132, 20), UDim2.new(0.5, -6, 1, -16), Vector2.new(0.5, 1), 3, 2)
	E.btNitro = nbB
	nbB.ZIndex = 3
	-- l'aide tactile
	E.tactile = inst("Frame", { Name = "Tactile", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, hud)
	texte(E.tactile, { Text = T.glisse, TextSize = 28, TextColor3 = C.texte2, TextXAlignment = Enum.TextXAlignment.Left,
		Size = UDim2.fromOffset(420, 64), Position = UDim2.new(0, 26, 0.6, 0) })
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
	-- (la troisième rangée : POUCE HAUT EN VOL — le web le met aussi dans la pause : « c'est en pleine partie qu'on découvre qu'on
	-- préfère l'autre sens » — et, s'il est ouvert, le mode FACILE à côté)
	local pan = carbone(voile, UDim2.fromOffset(760, 560), UDim2.fromScale(0.5, 0.5), C.cyan, Vector2.new(0.5, 0.5))
	E.pauseTitre = texte(pan, { Text = T.pause, TextSize = 60, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 62), Position = UDim2.fromOffset(0, 26), TextWrapped = false, epais = 4 })
	E.btSonP = tuile(pan, T.son, C.cyan, UDim2.fromOffset(330, 84), UDim2.new(0.5, -10, 0, 116), Vector2.new(1, 0), 28)
	E.btMusP = tuile(pan, T.musique, C.cyan, UDim2.fromOffset(330, 84), UDim2.new(0.5, 10, 0, 116), Vector2.new(0, 0), 28)
	E.btRecom = tuile(pan, T.recommencer, C.magenta, UDim2.fromOffset(330, 84), UDim2.new(0.5, -10, 0, 218), Vector2.new(1, 0), 24, "rejouer")
	E.btMenuP = tuile(pan, T.menu, C.lavande, UDim2.fromOffset(330, 84), UDim2.new(0.5, 10, 0, 218), Vector2.new(0, 0), 28, "maison")
	if Config.FACILE_ACTIF then
		E.btFacile = tuile(pan, T.facile, C.vert, UDim2.fromOffset(330, 72), UDim2.new(0.5, -10, 0, 320), Vector2.new(1, 0), 22)
		E.btPouceP = tuile(pan, T.pouce, C.cyan, UDim2.fromOffset(330, 72), UDim2.new(0.5, 10, 0, 320), Vector2.new(0, 0), 16)
	else
		E.btFacile = tuile(pan, T.facile, C.vert, UDim2.fromOffset(680, 72), UDim2.new(0.5, 0, 0, 320), Vector2.new(0.5, 0), 26)
		E.btPouceP = tuile(pan, T.pouce, C.cyan, UDim2.fromOffset(680, 72), UDim2.new(0.5, 0, 0, 320), Vector2.new(0.5, 0), 26, "aile", "g")
	end
	E.btRecom.Parent.Name = "Recom"
	E.btMenuP.Parent.Name = "MenuP"
	E.btReprendre = lingot(pan, T.reprendre, UDim2.new(1, -80, 0, 104), UDim2.new(0.5, 0, 1, -34), Vector2.new(0.5, 1), 64)
	for _, d in voile:GetDescendants() do
		if d:IsA("GuiObject") then d.ZIndex = 21 end
	end

	-- ══ RÉGLAGES (#mSet du web) : un écran à part — le titre, deux colonnes de lignes (AUDIO · JEU), RETOUR en bas à gauche ══
	-- Une ligne = une icône dans sa case, un libellé, et à droite un interrupteur (ON / OFF) ou une action.
	-- (fond BLANC sous le dégradé : un dégradé multiplie la couleur du cadre — sur du bleu nuit il sortait presque noir)
	local reg = inst("Frame", { Name = "Reglages", BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.04, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 22 }, racine)
	E.reglages = reg
	degrade(reg, Color3.fromRGB(46, 16, 62), Color3.fromRGB(10, 7, 24), 80)
	texte(reg, { Text = T.reglages, TextSize = 78, TextColor3 = C.texte, Size = UDim2.fromOffset(800, 80), Position = UDim2.fromOffset(66, 22), italique = true,
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 4 })
	for i, c in { C.magenta, C.cyan, C.or_ } do
		inst("Frame", { BackgroundColor3 = c, BorderSizePixel = 0, Size = UDim2.fromOffset(i == 1 and 82 or 38, 7), Position = UDim2.fromOffset(72 + (i == 1 and 0 or (i == 2 and 92 or 140)), 108) }, reg)
	end
	local function colonne(titre: string, x0: number, x1: number): Frame
		texte(reg, { Text = titre, TextSize = 26, TextColor3 = C.terne, Size = UDim2.new(0, 200, 0, 28), Position = UDim2.new(x0, 0, 0, 132),
			TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
		local p = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.new(x1 - x0, 0, 0, 0), Position = UDim2.new(x0, 0, 0, 172),
			AutomaticSize = Enum.AutomaticSize.None }, reg)
		degrade(p, C.carbone2, C.carbone, 90)
		inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, p)
		inst("Frame", { BackgroundColor3 = C.lavande, BackgroundTransparency = 0.4, BorderSizePixel = 0, Size = UDim2.new(0, 5, 1, 0) }, p)
		return p
	end
	-- une LIGNE : rend le bouton (toute la ligne se touche) et de quoi écrire son état. `genre` : nil = interrupteur ON / OFF,
	-- "action" = la flèche du web, "valeur" = un mot cyan et sa flèche (PLONGE ▶). Les lignes s'empilent dans leur colonne.
	E.rg = {}
	local Hl = 108
	local function ligne(p: Frame, cle: string, ico: string, libelle: string, genre: string?)
		local y = p:GetAttribute("y") or 0
		p:SetAttribute("y", y + Hl)
		p.Size = UDim2.new(p.Size.X.Scale, 0, 0, y + Hl)
		local l = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, Hl), Position = UDim2.fromOffset(0, y) }, p)
		if y > 0 then inst("Frame", { BackgroundColor3 = C.trait, BackgroundTransparency = 0.4, BorderSizePixel = 0, Size = UDim2.new(1, -10, 0, 2), Position = UDim2.fromOffset(8, 0) }, l) end
		local case = inst("Frame", { BackgroundColor3 = C.nuit, BorderSizePixel = 0, Size = UDim2.fromOffset(62, 62), Position = UDim2.new(0, 30, 0.5, 0), AnchorPoint = Vector2.new(0, 0.5) }, l)
		inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, case)
		local ic = icone(case, ico, 4, C.cyan, UDim2.fromScale(0.5, 0.5), Vector2.new(0.5, 0.5))
		local lib = texte(l, { Text = libelle, TextSize = 34, TextColor3 = C.texte, Size = UDim2.new(1, -330, 0, 36), Position = UDim2.new(0, 116, 0.5, 0), AnchorPoint = Vector2.new(0, 0.5),
			TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
		local o: any = { ico = ic }
		if genre == "action" then
			icone(l, "droite", 3, C.cyan, UDim2.new(1, -34, 0.5, 0), Vector2.new(1, 0.5))
		elseif genre == "valeur" then
			icone(l, "droite", 3, C.cyan, UDim2.new(1, -34, 0.5, 0), Vector2.new(1, 0.5))
			o.valeur = texte(l, { Text = "", TextSize = 34, italique = true, TextColor3 = C.cyan, Size = UDim2.fromOffset(220, 36), Position = UDim2.new(1, -72, 0.5, 0),
				AnchorPoint = Vector2.new(1, 0.5), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
			-- (« POUCE HAUT EN VOL » + « PLONGE » : sur un écran 16:9 la ligne n'a pas la place à 34 — le libellé rapetisse pour tenir)
			lib.Size = UDim2.new(1, -116 - 230, 0, 48) -- (assez haut : TextScaled se cale aussi sur la hauteur)
			lib.TextScaled = true
			inst("UITextSizeConstraint", { MaxTextSize = 34, MinTextSize = 16 }, lib)
		else
			-- l'interrupteur : une glissière sombre, son curseur, ON (cyan, à droite) ou OFF (éteint, à gauche)
			local inter = inst("Frame", { BackgroundColor3 = C.nuit, BorderSizePixel = 0, Size = UDim2.fromOffset(160, 62), Position = UDim2.new(1, -30, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5) }, l)
			o.trait = inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, inter)
			o.curseur = inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.fromOffset(58, 46), Position = UDim2.fromOffset(8, 8) }, inter)
			o.mot = texte(inter, { Text = "OFF", TextSize = 28, italique = true, TextColor3 = C.terne, Size = UDim2.fromOffset(86, 30), Position = UDim2.new(1, -8, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5),
				TextWrapped = false })
		end
		o.b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, l)
		o.b.Activated:Connect(function() Sons.jouer("tap") end)
		o.ligne = l
		E.rg[cle] = o
	end
	-- un CURSEUR de volume (volRow du web) : « VOLUME » et le pourcentage, une piste, une poignée qu'on fait glisser (pas de 5 %)
	local Hc = 80
	local function curseur(p: Frame, cle: string)
		local y = p:GetAttribute("y") or 0
		p:SetAttribute("y", y + Hc)
		p.Size = UDim2.new(p.Size.X.Scale, 0, 0, y + Hc)
		local l = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, Hc), Position = UDim2.fromOffset(0, y - 14) }, p)
		texte(l, { Text = T.volume, TextSize = 22, TextColor3 = C.terne, Size = UDim2.new(0.5, 0, 0, 24), Position = UDim2.fromOffset(116, 6),
			TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
		local o: any = {}
		o.pct = texte(l, { Text = "", TextSize = 22, TextColor3 = C.terne, Size = UDim2.new(0.4, 0, 0, 24), Position = UDim2.new(1, -30, 0, 6), AnchorPoint = Vector2.new(1, 0),
			TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
		local piste = inst("Frame", { BackgroundColor3 = C.nuit, BorderSizePixel = 0, Size = UDim2.new(1, -146, 0, 14), Position = UDim2.fromOffset(116, 50) }, l)
		inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, piste)
		o.plein = inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.fromScale(0.5, 1) }, piste)
		o.poignee = inst("Frame", { BackgroundColor3 = C.texte2, BorderSizePixel = 0, Size = UDim2.fromOffset(26, 44), Position = UDim2.fromScale(0.5, 0.5), AnchorPoint = Vector2.new(0.5, 0.5) }, piste)
		inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, o.poignee)
		-- toute la bande se touche (la cible fait 88 px de haut, la piste 14) : on suit le doigt tant qu'il appuie
		local zone = inst("TextButton", { BackgroundTransparency = 1, Text = "", AutoButtonColor = false, Size = UDim2.new(1, -116, 1, 0), Position = UDim2.fromOffset(100, 0) }, l)
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
	local ca = colonne("AUDIO", 0.043, 0.487)
	ligne(ca, "son", "son", T.son)
	curseur(ca, "volSon")
	ligne(ca, "musique", "musique", T.musique)
	curseur(ca, "volMus")
	local cj = colonne(T.jeu, 0.513, 0.957)
	if Config.FACILE_ACTIF then ligne(cj, "facile", "coeur", T.facile) end -- (Sacha : « mets que le mode normal » — la ligne n'existe que si le mode est ouvert)
	ligne(cj, "volH", "aile", T.pouce, "valeur")
	ligne(cj, "vib", "vibre", T.vibrations)
	ligne(cj, "tuto", "volant", T.revoir, "action")
	E.rgRetour = boutonRetour(reg)
	for _, d in reg:GetDescendants() do
		if d:IsA("GuiObject") then d.ZIndex = 23 end
	end

	-- ══ LE CHOIX DU MODE (à la toute première partie) ══
	local choix = inst("Frame", { Name = "Choix", BackgroundColor3 = C.nuit, BackgroundTransparency = 0.2, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 40 }, racine)
	E.choix = choix
	local pc = carbone(choix, UDim2.fromOffset(820, 440), UDim2.fromScale(0.5, 0.5), C.vert, Vector2.new(0.5, 0.5))
	texte(pc, { Text = T.choisis, TextSize = 44, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 46), Position = UDim2.fromOffset(0, 34), TextWrapped = false, epais = 3 })
	inst("TextLabel", { BackgroundTransparency = 1, FontFace = TXT, TextSize = 26, TextColor3 = C.texte2, TextWrapped = true, Text = T.facileTxt,
		Size = UDim2.new(1, -100, 0, 150), Position = UDim2.fromOffset(50, 104) }, pc)
	E.btFacileOui = tuile(pc, T.facileMot, C.vert, UDim2.fromOffset(340, 100), UDim2.new(0.5, -14, 1, -40), Vector2.new(1, 1), 34, "coeur")
	E.btFacileNon = tuile(pc, T.normal, C.cyan, UDim2.fromOffset(340, 100), UDim2.new(0.5, 14, 1, -40), Vector2.new(0, 1), 34, "eclair")
	for _, d in choix:GetDescendants() do
		if d:IsA("GuiObject") then d.ZIndex = 41 end
	end

	-- ══ MORT : L'ÉCRAN DE FIN v3 du web (#mDead) ══
	-- À gauche : le titre (NOUVEAU RECORD ! ou la cause), le panneau vert de l'argent VERSÉ (le héros de l'écran), puis deux cartes,
	-- l'AURA de la partie et le MOTEUR ATTEINT avec sa photo 3D. À droite : la carte du DÉFI, les quatre chiffres de la partie,
	-- BOUTIQUE | REGLAGES, et la paire des jeux mobiles HOME | REJOUER (le lingot : la seule plaque d'or).
	-- Tout est mesuré sur le web (844 × 390) et porté sur 720 px de haut.
	local mort = inst("Frame", { Name = "Mort", BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.06,
		Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 30 }, racine)
	E.mort = mort
	degrade(mort, Color3.fromRGB(34, 16, 60), Color3.fromRGB(12, 8, 30), 60)
	E.mCause = texte(mort, { Text = "", TextSize = 62, TextColor3 = C.rose, italique = true, Size = UDim2.new(0.5, 0, 0, 64),
		Position = UDim2.new(0.03, 30, 0, 14), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 4, contourCouleur = hx("3a0626") })
	inst("UISizeConstraint", { MaxSize = Vector2.new(4000, 64) }, E.mCause)
	E.mCauseEchelle = inst("UIScale", {}, E.mCause)
	-- le panneau vert : VERSÉS AU COMPTE
	local pv = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.new(0.48, 0, 0, 218),
		Position = UDim2.new(0.03, 0, 0, 90) }, mort)
	degrade(pv, Color3.fromRGB(16, 84, 46), Color3.fromRGB(4, 30, 16), 90)
	inst("UIStroke", { Color = Color3.fromRGB(70, 200, 110), Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, pv)
	inst("Frame", { BackgroundColor3 = Color3.fromRGB(125, 255, 155), BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 4) }, pv)
	texte(pv, { Text = T.verse, TextSize = 28, TextColor3 = Color3.fromRGB(190, 250, 205), Size = UDim2.new(1, 0, 0, 30), Position = UDim2.fromOffset(0, 14), TextWrapped = false })
	E.mRecord = texte(pv, { Text = "", TextSize = 24, TextColor3 = C.menthe, Size = UDim2.fromOffset(190, 34),
		Position = UDim2.new(0.5, 0, 0, 50), AnchorPoint = Vector2.new(0.5, 0), TextWrapped = false })
	inst("UIStroke", { Color = C.menthe, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border, Name = "Cadre" }, E.mRecord)
	E.mArgent = texte(pv, { Text = "", TextSize = 100, TextColor3 = C.menthe, Size = UDim2.new(1, 0, 0, 100), Position = UDim2.fromOffset(0, 84),
		epais = 5, contourCouleur = Color3.fromRGB(4, 40, 20), TextWrapped = false })
	E.mArgentEchelle = inst("UIScale", {}, E.mArgent)
	E.mCompte = texte(pv, { Text = "", TextSize = 26, TextColor3 = Color3.fromRGB(190, 250, 205), Size = UDim2.new(1, 0, 0, 28), Position = UDim2.new(0, 0, 1, -40), TextWrapped = false })
	-- AURA et MOTEUR ATTEINT
	local pa = carbone(mort, UDim2.new(0.235, 0, 0, 366), UDim2.new(0.03, 0, 0, 328), nil)
	-- (capture web : chaque carte a SA teinte — l'aura sur un fond prune, le moteur sur un bleu de nuit ; en carbone noir, l'écran était un trou)
	pa:FindFirstChildOfClass("UIGradient").Color = ColorSequence.new(Color3.fromRGB(58, 34, 92), Color3.fromRGB(26, 16, 50))
	inst("Frame", { BackgroundColor3 = C.magenta, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 4) }, pa)
	texte(pa, { Text = T.aura, TextSize = 28, TextColor3 = C.texte2, Size = UDim2.new(1, 0, 0, 30), Position = UDim2.new(0, 0, 0.5, -84), TextWrapped = false })
	E.mAura = texte(pa, { Text = "0", TextSize = 78, TextColor3 = hx("ff8ae0"), Size = UDim2.new(1, 0, 0, 80), Position = UDim2.new(0, 0, 0.5, -46), TextWrapped = false,
		epais = 4, contourCouleur = hx("3a0626") })
	E.mAuraEchelle = inst("UIScale", {}, E.mAura)
	E.mAuraMeilleur = texte(pa, { Text = "", TextSize = 24, TextColor3 = C.terne, Size = UDim2.new(1, 0, 0, 26), Position = UDim2.new(0, 0, 0.5, 46), TextWrapped = false })
	local pm = carbone(mort, UDim2.new(0.235, 0, 0, 366), UDim2.new(0.275, 0, 0, 328), nil)
	pm:FindFirstChildOfClass("UIGradient").Color = ColorSequence.new(Color3.fromRGB(34, 46, 92), Color3.fromRGB(16, 20, 48))
	inst("Frame", { BackgroundColor3 = C.cyan, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 4) }, pm)
	texte(pm, { Text = T.moteurAtteint, TextSize = 26, TextColor3 = C.texte2, Size = UDim2.new(1, 0, 0, 28), Position = UDim2.fromOffset(0, 18), TextWrapped = false })
	-- la PHOTO : le moteur du palier, en 3D, qui tourne (rempli par Client/MoteurCarte à la fin de la partie)
	E.mMoteurVue = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.new(1, -20, 0, 180), Position = UDim2.fromOffset(10, 50),
		Ambient = Color3.fromRGB(78, 76, 96), LightColor = Color3.fromRGB(190, 182, 172), LightDirection = Vector3.new(-0.5, -1, -0.6) }, pm) -- (vu dans Studio : à 150 / 255 le moteur sortait blanc)
	E.mMoteurNom = texte(pm, { Text = "", TextSize = 20, TextColor3 = C.or_, Size = UDim2.new(1, -16, 0, 22), Position = UDim2.fromOffset(8, 232), TextWrapped = false })
	E.mMoteurNomEchelle = inst("UIScale", {}, E.mMoteurNom)
	E.mMoteurPalier = texte(pm, { Text = "", RichText = true, TextSize = 26, TextColor3 = C.texte2, Size = UDim2.new(1, 0, 0, 46), Position = UDim2.fromOffset(0, 258), TextWrapped = false })
	E.mMoteurEncore = texte(pm, { Text = "", TextSize = 17, TextColor3 = Color3.fromRGB(255, 176, 40), Size = UDim2.new(1, -16, 0, 48),
		Position = UDim2.fromOffset(8, 308), LineHeight = 1.3 })
	-- à droite : la carte du DÉFI
	local pp = carbone(mort, UDim2.new(0.435, 0, 0, 282), UDim2.new(0.535, 0, 0, 26), C.vert)
	E.mDefiFilet = pp:FindFirstChildOfClass("Frame")
	E.mDefiIco = icone(pp, "coche", 4, C.vert, UDim2.fromOffset(28, 22))
	E.mDefiTete = texte(pp, { Text = "", TextSize = 24, TextColor3 = C.vert, Size = UDim2.new(1, -200, 0, 26), Position = UDim2.fromOffset(76, 28),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	E.mDefiPips = {}
	for i = 1, 3 do
		E.mDefiPips[i] = inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.fromOffset(12, 28), Position = UDim2.new(1, -86 + i * 18, 0, 26) }, pp)
	end
	E.mDefiTxt = texte(pp, { Text = "", TextSize = 32, TextColor3 = C.texte, Size = UDim2.new(1, -56, 0, 76), Position = UDim2.fromOffset(28, 72),
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, LineHeight = 1.15, epais = 3 })
	local fondD = inst("Frame", { BackgroundColor3 = hx("0d0a2a"), BorderSizePixel = 0, Size = UDim2.new(1, -56, 0, 12), Position = UDim2.fromOffset(28, 160) }, pp)
	E.mDefiPlein = inst("Frame", { BackgroundColor3 = C.vert, BorderSizePixel = 0, Size = UDim2.fromScale(0, 1) }, fondD)
	E.mDefiPrime = texte(pp, { Text = "", TextSize = 22, TextColor3 = C.vert, Size = UDim2.new(0.5, -28, 0, 24), Position = UDim2.fromOffset(28, 186),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	E.mDefiRec = texte(pp, { Text = "", TextSize = 22, TextColor3 = C.or_, Size = UDim2.new(0.6, -28, 0, 24), Position = UDim2.new(1, -28, 0, 186),
		AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
	-- (la cause de la mort et la distance : la petite ligne du bas de la carte)
	E.mPartie = texte(pp, { Text = "", TextSize = 17, TextColor3 = C.terne, Size = UDim2.new(1, -56, 0, 40), Position = UDim2.new(0, 28, 1, -52),
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Bottom, LineHeight = 1.3 })
	-- les quatre chiffres de la partie
	local ps = carbone(mort, UDim2.new(0.435, 0, 0, 130), UDim2.new(0.535, 0, 0, 328), nil)
	E.mStats = {}
	for i = 1, 4 do
		local col = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(0.25, 0, 1, 0), Position = UDim2.fromScale((i - 1) * 0.25, 0) }, ps)
		local v = texte(col, { Text = "", TextSize = 56, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 58), Position = UDim2.fromOffset(0, 16), TextWrapped = false, epais = 3 })
		local l = texte(col, { Text = "", TextSize = 20, TextColor3 = C.lavande, Size = UDim2.new(1, 0, 0, 22), Position = UDim2.fromOffset(0, 88), TextWrapped = false })
		E.mStats[i] = { v, l }
		if i > 1 then inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.new(0, 2, 0.7, 0), Position = UDim2.fromScale(0, 0.15) }, col) end
	end
	E.btBoutiqueM = tuile(mort, T.boutique, C.magenta, UDim2.new(0.2125, 0, 0, 88), UDim2.new(0.535, 0, 0, 480), nil, 30, "panier")
	E.btReglM = tuile(mort, T.reglages, C.cyan, UDim2.new(0.2125, 0, 0, 88), UDim2.new(0.7575, 0, 0, 480), nil, 30, "reglages")
	E.btMenuM = tuile(mort, T.menu, C.lavande, UDim2.new(0.125, 0, 0, 104), UDim2.new(0.535, 0, 0, 588), nil, 30, "maison")
	E.btRejouer = lingot(mort, T.rejouer, UDim2.new(0.3, 0, 0, 104), UDim2.new(0.67, 0, 0, 588), nil, FR and 80 or 58) -- (« PLAY AGAIN » : dix lettres)
	for _, d in mort:GetDescendants() do
		if d:IsA("GuiObject") then d.ZIndex = 31 end
	end

	-- ══ LE TOAST : une ligne qui passe en haut de n'importe quel écran (refus d'achat, « bientôt »…) ══
	E.toast = carbone(racine, UDim2.fromOffset(760, 64), UDim2.new(0.5, 0, 0, -80), C.or_, Vector2.new(0.5, 0))
	E.toast.ZIndex = 80
	E.toast.Visible = false
	E.toastTxt = texte(E.toast, { Text = "", TextSize = 22, TextColor3 = C.texte, Size = UDim2.new(1, -24, 1, 0),
		Position = UDim2.fromOffset(14, 0), ZIndex = 81 })

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
	repeindre(E.nitroPlaque, appuye and C.carbone:Lerp(nc, 0.5) or C.carbone, nc)
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
	E.airTxt.Text = (infini and "∞" or secondes) .. ' <font size="20">' .. T.air .. "</font>"
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
	E.pouvoirs.Position = UDim2.new(1, -22, 0, sousChrono and 282 or 190)
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
function Hud.tenir(echelle: UIScale, txt: string, corps: number, large: number)
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
	o.mot.Position = UDim2.new(on and 0 or 1, on and 94 or -8, 0.5, 0)
	o.curseur.Position = UDim2.fromOffset(on and 94 or 8, 8)
	o.curseur.BackgroundColor3 = on and C.cyan or C.trait
	o.trait.Color = on and C.cyan or C.trait
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
	o.pct.Text = math.floor(v + 0.5) .. "%"
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
function Hud.toast(txt: string, couleur: Color3?)
	toastN += 1
	local n = toastN
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
