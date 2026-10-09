-- CASH CAR — LA ROUE (Sacha, 4/10 : « rajoute bouton roulette pour gagner une voiture ou de l'argent au choix »). Elle remplace les
-- MISSIONS et la CARRIÈRE au menu. Huit cases (Config.ROUE) : de l'argent, une CAISSE EXCLUSIVE (les neuf caisses qu'on ne trouve
-- nulle part ailleurs), un SKIN (peinture OR MASSIF, traînée ARC-EN-CIEL), le JACKPOT. Le TIRAGE se fait au serveur
-- (ServerScriptService/Revenus) : la roue d'ici ne fait que TOURNER jusqu'à la case qu'il a tirée. Une caisse gagnée se choisit :
-- LA GARDER (elle est équipée tout de suite) ou LA VENDRE contre de l'argent — la voiture OU l'argent, au choix.
-- D'où viennent les tours : un GRATUIT toutes les 4 h, un OFFERT toutes les 3 parties (la carte de l'écran de fin compte les
-- parties), et des tours à vendre en Robux (REVENUS.produits.tours3 — à 0, le bouton n'existe pas).
--
-- LA ROUE v2 (5/10, Sacha : « le design de l'UX/UI n'est pas au niveau ») : un PLATEAU DE JEU TÉLÉ, en pixels (la DA du jeu).
--   · au centre, la roue : un disque de 60 × 60 cases peint en barrettes (une par suite de cases de même couleur, comme les icônes)
--     dans un CanvasGroup qu'on fait tourner d'un bloc ; chaque case porte son lot DEBOUT (icône + valeur) — il se lit droit quand
--     il passe sous l'aiguille. Autour, la JANTE FIXE et ses 24 ampoules (elles respirent au repos, CHASSENT pendant le tour,
--     clignotent ensemble au gain) ; en haut, l'AIGUILLE montée sur charnière, qui claque sur les tétons ; derrière, un soleil de
--     rayons qui accélère avec la roue.
--   · à gauche on LIT (le titre, le tour gratuit, les parties) ; à droite, les TOURS en haut et LE lingot en bas, sous le pouce :
--     TOURNER, puis GARDER / ENCAISSER — un seul or par état d'écran.
--   · le tour : un RECUL d'élan, la roue part, ralentit longtemps (le suspense : elle rampe sur la dernière frontière), dépasse
--     d'un cheveu et revient se caler. La case gagnante FLASHE, la jante clignote, puis le lot JAILLIT au centre dans une gerbe de
--     confettis — la caisse tourne sur son plateau, l'argent se compte.
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local MarketplaceService = game:GetService("MarketplaceService")
local PolicyService = game:GetService("PolicyService")
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
local BLANC = Color3.new(1, 1, 1)
local ENCRE = C.encre
-- l'or en trois tons (lèvre, plein, ombre) : jante, tétons, aiguille, moyeu
local OR_CL, OR_PL, OR_SO = RGB(255, 246, 176), RGB(255, 200, 52), RGB(178, 106, 12)

local Roue = {}
local ctx: any = nil
local U: any = {}
local N = #RO.cases
local PAS = 360 / N
local function tr(fr: string, en: string): string return FR and fr or en end
local function attr(n: string): any return joueur:GetAttribute(n) end
-- (l'UI s'anime en Quad / Quint sortants ; le rebond Back est réservé à la CÉLÉBRATION du gain)
local function tw(o: Instance, d: number, props: { [string]: any }, style: Enum.EasingStyle?, sens: Enum.EasingDirection?): Tween
	local t = TweenService:Create(o, TweenInfo.new(d, style or Enum.EasingStyle.Quad, sens or Enum.EasingDirection.Out), props)
	t:Play()
	return t
end
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

-- ════════ LES CASES : couleur, libellé, icône ════════
-- (v2) des couleurs FRANCHES, une famille par sorte de lot : l'argent en violet / bleu électrique (ses chiffres en VERT BILLET,
-- la couleur de l'argent dans tout le jeu), la caisse en cyan néon, le skin en magenta, le jackpot en or
local function couleurCase(k: number): (Color3, Color3, Color3?)
	local c = RO.cases[k]
	if c.jackpot then return RGB(255, 192, 30), RGB(80, 32, 0), nil end
	if c.k == "caisse" then return RGB(18, 196, 232), BLANC, ENCRE end
	if c.k == "habit" then return RGB(232, 44, 164), BLANC, ENCRE end
	return (k % 2 == 1) and RGB(96, 42, 210) or RGB(26, 92, 224), C.menthe, ENCRE
end
local function libelle(k: number): string
	local c = RO.cases[k]
	if c.jackpot then return "JACKPOT" end
	if c.k == "caisse" then return tr("CAISSE", "CAR") end
	if c.k == "habit" then return "SKIN" end
	return Hud.argent(c.v)
end
-- (v2.1, banc : en dégradé blanc sur cyan, la voiture se lisait comme un fantôme — chaque icône prend UNE couleur qui tranche sur
-- sa case : la caisse en ENCRE sur le cyan, le pinceau blanc sur le magenta, le trophée brun sur l'or, la pièce d'or sur le violet)
local function iconeCase(k: number): (string, any, Color3?)
	local c = RO.cases[k]
	if c.jackpot then return "trophee", RGB(120, 36, 0), nil end
	if c.k == "caisse" then return "voiture", RGB(10, 30, 70), nil end
	if c.k == "habit" then return "pinceau", BLANC, ENCRE end
	return "piece", { { 0.3, OR_CL }, { 0.7, OR_PL }, { 1, OR_SO } }, ENCRE
end

-- ════════ LE PEINTRE DE PIXELS ════════
-- une grille de nx × ny cases de `px` px : f(x, y) rend la couleur de la case (ou nil = vide) ; une barrette par suite de cases
-- de même couleur sur une ligne (sans ça, des milliers de cadres). Les dégradés se QUANTIFIENT, sinon chaque case est unique.
local function peindre(parent: Instance, nx: number, ny: number, px: number, f: (number, number) -> Color3?, z: number?)
	for y = 0, ny - 1 do
		local debut, cle, coul = 0, "", nil :: Color3?
		for x = 0, nx do
			local c: Color3? = nil
			if x < nx then c = f(x, y) end
			local cl = c and c:ToHex() or ""
			if cl ~= cle then
				if coul then
					inst("Frame", { BackgroundColor3 = coul, BorderSizePixel = 0, Size = UDim2.fromOffset((x - debut) * px, px),
						Position = UDim2.fromOffset(debut * px, y * px), ZIndex = z or 1 }, parent)
				end
				debut, cle, coul = x, cl, c
			end
		end
	end
end
-- un dessin en caractères (une palette par lettre, « . » = vide)
local function dessin(parent: Instance, lignes: { string }, px: number, pal: { [string]: Color3 }, z: number?): Frame
	local f = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(#lignes[1] * px, #lignes * px), ZIndex = z or 1 }, parent)
	peindre(f, #lignes[1], #lignes, px, function(x, y) return pal[string.sub(lignes[y + 1], x + 1, x + 1)] end, z)
	return f
end
-- une icône du carnet avec son OMBRE d'encre décalée (elle se détache de n'importe quel fond)
local function iconeOmbre(parent: Instance, nom: string, px: number, bandes: any, z: number?, ombre: Color3?): Frame
	local f = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(9 * px, 9 * px), ZIndex = z or 1 }, parent)
	local o = math.max(2, math.floor(px * 0.55 + 0.5))
	if ombre ~= false :: any then K.icone(f, nom, px, ombre or ENCRE, UDim2.fromOffset(o, o)) end
	K.icone(f, nom, px, bandes, UDim2.fromOffset(0, 0))
	for _, d in f:GetDescendants() do
		if d:IsA("GuiObject") then d.ZIndex = z or 1 end
	end
	return f
end

-- ════════ LA ROUE ════════
local G9, PX = 60, 8 -- le disque : 60 × 60 cases de 8 px (480 px)
local R0 = G9 / 2
local GJ = G9 + 12 -- la jante fixe : 6 cases tout autour (576 px)
local TAILLE = GJ * PX
local NAMP = 24 -- les ampoules de la jante
local SEP = RGB(14, 8, 34)
local function polaire(o: GuiObject, a: number, r: number)
	o.AnchorPoint = Vector2.new(0.5, 0.5)
	o.Position = UDim2.new(0.5, math.sin(math.rad(a)) * r, 0.5, -math.cos(math.rad(a)) * r)
	o.Rotation = a
end

-- le DISQUE (il tourne) : les huit cases, leurs séparations, la bordure d'or, les TÉTONS (l'aiguille claque dessus), les lots debout
local function batirDisque(parent: Instance): CanvasGroup
	local cg = inst("CanvasGroup", { Name = "Disque", BackgroundTransparency = 1, Size = UDim2.fromOffset(G9 * PX, G9 * PX),
		AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), ZIndex = 2 }, parent)
	local fonds, clairs, sombres = {}, {}, {}
	for k = 1, N do
		local f = couleurCase(k)
		fonds[k] = f
		clairs[k] = f:Lerp(BLANC, 0.22)
		sombres[k] = Color3.new(f.R * 0.7, f.G * 0.7, f.B * 0.7)
	end
	peindre(cg, G9, G9, PX, function(x, y)
		local dx, dy = x + 0.5 - R0, y + 0.5 - R0
		local r = math.sqrt(dx * dx + dy * dy)
		if r > R0 then return nil end
		if r > R0 - 1.3 then return OR_PL end
		if r > R0 - 2.3 then return OR_SO end
		if r > R0 - 2.9 then return SEP end
		local a = math.deg(math.atan2(dx, -dy)) % 360 -- (dans le sens des aiguilles d'une montre depuis le haut)
		local s = (a + PAS / 2) % 360
		local k = math.floor(s / PAS) + 1
		local bord = math.min(s % PAS, PAS - s % PAS)
		if math.rad(bord) * r < 0.55 then return SEP end
		-- trois anneaux de lumière : clair au bord, plein, sombre vers le moyeu (le relief du pixel art)
		if r > R0 - 5.6 then return clairs[k] end
		if r < R0 * 0.46 then return sombres[k] end
		return fonds[k]
	end)
	-- les TÉTONS : un clou d'or à chaque frontière de case, sur la bordure
	for k = 1, N do
		local p = inst("Frame", { BackgroundColor3 = OR_CL, BorderSizePixel = 0, Size = UDim2.fromOffset(12, 12), ZIndex = 3 }, cg)
		inst("UIStroke", { Color = ENCRE, Thickness = 2 }, p)
		polaire(p, (k - 1) * PAS + PAS / 2, (R0 - 1.15) * PX)
	end
	-- les LOTS, debout dans leur case (le haut du lot vers la jante) : l'icône près du bord, la valeur dessous
	for k = 1, N do
		local a = (k - 1) * PAS
		local c = RO.cases[k]
		local _, ct, cc = couleurCase(k)
		local nom, bandes, ombre = iconeCase(k)
		polaire(iconeOmbre(cg, nom, 6, bandes, 4, ombre or (false :: any)), a, 178)
		local t = texte(cg, { Text = libelle(k), TextSize = c.jackpot and 17 or 21, TextColor3 = ct, Size = UDim2.fromOffset(150, 26), TextWrapped = false,
			contour = cc ~= nil, contourCouleur = cc, epais = 3, ZIndex = 4 })
		polaire(t, a, 128)
		if c.jackpot then
			polaire(texte(cg, { Text = Hud.argent(c.v), TextSize = 15, TextColor3 = ct, Size = UDim2.fromOffset(120, 20), TextWrapped = false,
				contour = false, ZIndex = 4 }), a, 101)
		end
	end
	return cg
end
-- l'ÉCLAT : la forme d'UNE case (celle du haut), blanche — on la tourne sur la case gagnante et on la fait flasher
local function batirEclat(parent: Instance): CanvasGroup
	local cg = inst("CanvasGroup", { Name = "Eclat", BackgroundTransparency = 1, Size = UDim2.fromOffset(G9 * PX, G9 * PX), GroupTransparency = 1,
		AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), ZIndex = 3 }, parent)
	peindre(cg, G9, G9, PX, function(x, y)
		local dx, dy = x + 0.5 - R0, y + 0.5 - R0
		local r = math.sqrt(dx * dx + dy * dy)
		if r > R0 - 2.9 or r < 6.5 then return nil end
		local a = math.abs(math.deg(math.atan2(dx, -dy)))
		if a > PAS / 2 then return nil end
		local bord = math.rad(PAS / 2 - a) * r
		if bord < 0.55 then return nil end
		return (bord < 1.6 or r > R0 - 4) and BLANC or RGB(255, 248, 205)
	end)
	return cg
end
-- la JANTE (fixe) : liseré d'encre, cerclage d'or éclairé d'en haut, gorge de laque prune où vivent les ampoules
local AMP_BLANC, AMP_AMBRE, AMP_ETEINTE = RGB(255, 250, 216), RGB(255, 162, 26), RGB(86, 40, 54)
local function batirJante(parent: Instance): Frame
	local f = inst("Frame", { Name = "Jante", BackgroundTransparency = 1, Size = UDim2.fromOffset(TAILLE, TAILLE), AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.5), ZIndex = 1 }, parent)
	local Rj = GJ / 2
	local laques = { RGB(92, 40, 132), RGB(58, 22, 94), RGB(34, 12, 60) }
	peindre(f, GJ, GJ, PX, function(x, y)
		local dx, dy = x + 0.5 - Rj, y + 0.5 - Rj
		local r = math.sqrt(dx * dx + dy * dy)
		if r > Rj then return nil end
		if r > Rj - 0.9 then return ENCRE end
		if r > Rj - 2 then return (dy < -12) and OR_CL or ((dy < 14) and OR_PL or OR_SO) end
		if r > Rj - 2.6 then return ENCRE end
		if r > R0 - 0.4 then return laques[(dy < -14) and 1 or ((dy < 16) and 2 or 3)] end
		return nil
	end)
	U.ampoules, U.halos = {}, {}
	for i = 1, NAMP do
		local a = (i - 1) * 360 / NAMP + 360 / NAMP / 2
		local h = inst("Frame", { BackgroundColor3 = AMP_AMBRE, BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.fromOffset(26, 26), ZIndex = 2 }, f)
		polaire(h, a, (R0 + 1.7) * PX)
		local b = inst("Frame", { BackgroundColor3 = AMP_ETEINTE, BorderSizePixel = 0, Size = UDim2.fromOffset(14, 14), ZIndex = 3 }, f)
		inst("UIStroke", { Color = ENCRE, Thickness = 2 }, b)
		inst("Frame", { BackgroundColor3 = BLANC, BackgroundTransparency = 0.25, BorderSizePixel = 0, Size = UDim2.fromOffset(4, 4), Position = UDim2.fromOffset(2, 2), ZIndex = 3 }, b)
		polaire(b, a, (R0 + 1.7) * PX)
		U.ampoules[i], U.halos[i] = b, h
	end
	return f
end
-- une ampoule : 0 éteinte, 1 blanche, 2 ambre (le halo suit)
local function ampoule(i: number, e: number)
	local b, h = U.ampoules[i], U.halos[i]
	b.BackgroundColor3 = (e == 1 and AMP_BLANC) or (e == 2 and AMP_AMBRE) or AMP_ETEINTE
	h.BackgroundTransparency = (e == 1 and 0.55) or (e == 2 and 0.72) or 1
	h.BackgroundColor3 = (e == 1) and RGB(255, 236, 150) or AMP_AMBRE
end
-- le MOYEU (fixe) : une pièce d'or frappée du $
local function batirMoyeu(parent: Instance)
	local n = 15
	local m = inst("Frame", { Name = "Moyeu", BackgroundTransparency = 1, Size = UDim2.fromOffset(n * PX, n * PX), AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.5), ZIndex = 5 }, parent)
	local Rm = n / 2
	peindre(m, n, n, PX, function(x, y)
		local dx, dy = x + 0.5 - Rm, y + 0.5 - Rm
		local r = math.sqrt(dx * dx + dy * dy)
		if r > Rm then return nil end
		if r > Rm - 0.9 then return ENCRE end
		if r > Rm - 1.9 then return (dy < 0) and OR_CL or OR_SO end
		if r > Rm - 2.6 then return OR_SO end
		return (dy < -2) and RGB(255, 222, 92) or OR_PL
	end, 5)
	texte(m, { Text = "$", TextSize = 50, TextColor3 = RGB(110, 50, 4), Size = UDim2.fromScale(1, 1), Position = UDim2.fromOffset(3, 3), contour = false,
		TextWrapped = false, ZIndex = 6 })
	U.moyeu = m
end
-- l'AIGUILLE, sur sa CHARNIÈRE : le cadre fait deux fois la hauteur du dessin (dessin dans la moitié basse) — la rotation se fait
-- autour du centre du cadre, donc autour du boulon, comme une vraie languette
local AIGUILLE = {
	"..ooooooo..",
	".olllllllo.",
	"ollgggggsso",
	"olggwwggsso",
	"olggwwgggso",
	".olgggggso.",
	".olgggggso.",
	"..olgggso..",
	"..olgggso..",
	"...olgso...",
	"...olgso...",
	"....ogo....",
	".....o.....",
}
local function batirAiguille(parent: Instance)
	local p = 7
	local h = #AIGUILLE * p
	local ai = inst("Frame", { Name = "Aiguille", BackgroundTransparency = 1, Size = UDim2.fromOffset(#AIGUILLE[1] * p, 2 * h), AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.new(0.5, 0, 0, (TAILLE - G9 * PX) / 2 + 3 * PX - h + p * 1.5), ZIndex = 6 }, parent)
	local pal = { o = ENCRE, l = OR_CL, g = OR_PL, s = OR_SO, w = BLANC }
	local d = dessin(ai, AIGUILLE, p, pal, 6)
	d.Position = UDim2.fromOffset(0, h - p * 1.5)
	-- l'ombre portée sur la jante (décalée, translucide)
	local om = dessin(ai, AIGUILLE, p, { o = ENCRE, l = ENCRE, g = ENCRE, s = ENCRE, w = ENCRE }, 5)
	om.Position = UDim2.fromOffset(5, h - p * 1.5 + 6)
	for _, c in om:GetChildren() do (c :: Frame).BackgroundTransparency = 0.55 end
	U.aiguille = ai
end
-- un SOLEIL de rayons (des faisceaux qui traversent le centre, fondus vers les bouts) : derrière la roue et derrière le gain
local function batirRayons(parent: Instance, n: number, long: number, larg: number, coul: Color3, tr0: number, z: number): Frame
	local f = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(2, 2), AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), ZIndex = z }, parent)
	for i = 0, n - 1 do
		local r = inst("Frame", { BackgroundColor3 = coul, BackgroundTransparency = tr0, BorderSizePixel = 0, Size = UDim2.fromOffset(larg, long),
			AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), Rotation = i * 180 / n, ZIndex = z }, f)
		inst("UIGradient", { Rotation = 90, Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(0.28, 0.25),
			NumberSequenceKeypoint.new(0.5, 0), NumberSequenceKeypoint.new(0.72, 0.25), NumberSequenceKeypoint.new(1, 1) }) }, r)
	end
	return f
end
local function rond(parent: Instance, d: number, coul: Color3, tr0: number, z: number): Frame
	local f = inst("Frame", { BackgroundColor3 = coul, BackgroundTransparency = tr0, BorderSizePixel = 0, Size = UDim2.fromOffset(d, d), AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.5), ZIndex = z }, parent)
	inst("UICorner", { CornerRadius = UDim.new(0.5, 0) }, f)
	return f
end

-- ════════ petits outils ════════
-- un LINGOT allumé (or) ou éteint (laque) : la plaque, son biseau, sa tranche, son texte, son reflet
local function peindreLingot(b: TextButton, allume: boolean, terne: boolean?)
	local cle = (allume and "a" or "e") .. (terne and "t" or "")
	if b:GetAttribute("teinte") == cle then return end
	b:SetAttribute("teinte", cle)
	local plaque = b.Parent :: Frame
	local fond = allume and (terne and RGB(214, 158, 30) or RGB(255, 190, 32)) or RGB(66, 54, 104)
	K.repeindre(plaque, fond)
	-- (le biseau clair du haut s'appelle « l » dans le kit ; la tranche est le cadre frère de la plaque)
	local l = plaque:FindFirstChild("l", true)
	if l and l:IsA("Frame") then l.BackgroundColor3 = allume and (terne and RGB(240, 214, 130) or RGB(255, 248, 170)) or RGB(104, 92, 150) end
	for _, d in (plaque.Parent :: Frame):GetChildren() do
		-- (la tranche est le cadre SANS NOM frère de la plaque — l'étiquette GRATUIT, elle, a un nom et garde sa couleur)
		if d ~= plaque and d:IsA("Frame") and d.Name == "Frame" then d.BackgroundColor3 = allume and C.orSh or RGB(28, 22, 50) end
	end
	b.TextColor3 = allume and RGB(40, 22, 4) or C.texte2
	-- (les lettres GRAVÉES du kit : leur double d'or pâle devient un creux d'encre sur la plaque éteinte)
	local grave = plaque:FindFirstChild("Grave")
	if grave and grave:IsA("TextLabel") then
		grave.TextColor3 = allume and RGB(255, 246, 200) or RGB(16, 10, 34)
		grave.TextTransparency = allume and 0.15 or 0.3
	end
	local reflet = plaque:FindFirstChild("Reflet", true)
	if reflet then (reflet :: Frame).Visible = allume and not terne end
end
-- (v2.2) LE LINGOT QUI RESPIRE (comme JOUER à l'accueil) : tant qu'il y a quelque chose à faire, l'or bat doucement — l'œil
-- sait où appuyer sans lire. Un UIScale nommé sur la boîte du bouton (la plaque, elle, reste libre de s'enfoncer).
U.souffles = {}
local function respirer(b: TextButton, on: boolean)
	local boite = (b.Parent :: Frame).Parent :: Frame
	local sc = boite:FindFirstChild("Souffle") :: UIScale?
	if not sc then sc = inst("UIScale", { Name = "Souffle" }, boite) end
	local t = U.souffles[b]
	if on and not t then
		t = TweenService:Create(sc :: UIScale, TweenInfo.new(0.9, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true), { Scale = 1.035 })
		U.souffles[b] = t
		t:Play()
	elseif not on and t then
		t:Cancel()
		U.souffles[b] = nil;
		(sc :: UIScale).Scale = 1
	end
end
-- (v2.2) une plaque penchée ÉTEINTE le temps du tour (RETOUR ne peut rien pendant que la roue tourne : il le montre) — ses
-- couleurs d'origine sont gardées sur la plaque, on les rend telles quelles
local function griser(b: TextButton, gris: boolean)
	local plaque = b.Parent :: Frame
	if gris == (plaque:GetAttribute("gris") == true) then return end
	plaque:SetAttribute("gris", gris)
	local l = plaque:FindFirstChild("l", true) :: Frame?
	local f = plaque:FindFirstChild("f", true) :: Frame?
	local ico = plaque:FindFirstChild("Icone") :: Frame?
	if gris then
		plaque:SetAttribute("fond0", plaque:GetAttribute("fond"))
		if l then plaque:SetAttribute("lis0", l.BackgroundColor3) end
		if f then plaque:SetAttribute("fil0", f.BackgroundColor3) end
		K.repeindre(plaque, RGB(46, 40, 78), C.terne)
		if l then l.BackgroundColor3 = RGB(92, 84, 136) end
		if ico then K.teinter(ico, C.terne) end
		b.TextColor3 = C.terne
	else
		local f0 = plaque:GetAttribute("fil0")
		K.repeindre(plaque, plaque:GetAttribute("fond0") :: Color3?, f0 :: Color3?)
		local l0 = plaque:GetAttribute("lis0")
		if l and typeof(l0) == "Color3" then l.BackgroundColor3 = l0 end
		if ico and typeof(f0) == "Color3" then K.teinter(ico, f0) end
		b.TextColor3 = C.texte
	end
end
-- une SECOUSSE horizontale (le refus, le jackpot) — une seule à la fois par objet
local secoue: { [Instance]: boolean } = {}
local function secouer(o: GuiObject, amp: number, duree: number)
	if secoue[o] then return end
	secoue[o] = true
	local p0 = o.Position
	task.spawn(function()
		local t = 0
		while t < duree do
			local k = 1 - t / duree
			o.Position = p0 + UDim2.fromOffset(math.sin(t * 55) * amp * k, math.cos(t * 41) * amp * 0.35 * k)
			t += task.wait()
		end
		o.Position = p0
		secoue[o] = nil
	end)
end

-- la photo d'une caisse (Client/Boutique : la vignette en un maillage) — v2 : sur un PLATEAU TOURNANT, la caméra en orbite
local ASPECT = 500 / 270
local function cadrer(vp: ViewportFrame, cam: Camera, corps: BasePart, az: number)
	local el = 0.26
	local dir = Vector3.new(-math.sin(az) * math.cos(el), math.sin(el), -math.cos(az) * math.cos(el))
	local diag = math.sqrt(corps.Size.X ^ 2 + corps.Size.Z ^ 2)
	local dist = diag / (2 * math.tan(math.rad(12)) * ASPECT * 0.98) + diag * 0.22
	local vise = corps.Position + Vector3.new(0, -corps.Size.Y * 0.04, 0)
	cam.CFrame = CFrame.lookAt(vise + dir * dist, vise)
	vp.LightDirection = (-dir * 0.5 + Vector3.new(0.5, -1, 0.2)).Unit
end
local function photographier(vp: ViewportFrame, i: number): Model?
	local m = Caisse.vignette(i)
	if not m then return nil end
	local cam = Instance.new("Camera")
	cam.FieldOfView = 24
	cam.Parent = vp
	vp.CurrentCamera = cam
	m.Parent = vp
	U.plateau = { vp = vp, cam = cam, corps = m.PrimaryPart, az = 0.82 }
	cadrer(vp, cam, m.PrimaryPart :: BasePart, 0.82)
	return m
end

-- ════════ LA FENÊTRE ════════
local LMIN = 1400 -- la largeur de dessin minimale (un écran plus étroit — 16:9, tablette — voit la scène réduite d'un bloc)
local function creer()
	local v = inst("Frame", { Name = "Roue", BackgroundColor3 = BLANC, BackgroundTransparency = 0.02, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1),
		Visible = false, Active = true, ZIndex = 42 }, Hud.racine)
	-- (9/10, banc du parcours) LA JUPE : le fond déborde de 400 px de chaque côté — sans elle, la bande des boutons de Roblox, en haut,
	-- laissait voir le CIEL CLAIR de l'accueil au-dessus de la roue (le voile s'arrêtait sous elle). Le dégradé et le fondu d'entrée
	-- passent sur elle ; le voile garde sa taille (Roue.placer mesure l'écran sur lui).
	v.BackgroundTransparency = 1
	U.jupe = inst("Frame", { Name = "Jupe", BackgroundColor3 = BLANC, BackgroundTransparency = 0.02, BorderSizePixel = 0, Size = UDim2.new(1, 800, 1, 800),
		Position = UDim2.fromOffset(-400, -400), ZIndex = 0 }, v)
	K.degrade(U.jupe, RGB(64, 18, 84), RGB(10, 6, 26), 80)
	inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, v) -- (le voile avale les clics)
	U.voile = v
	local sc = inst("Frame", { Name = "Scene", BackgroundTransparency = 1, Size = UDim2.fromOffset(LMIN, 720), AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.5) }, v)
	U.scene = sc
	U.sceneEchelle = inst("UIScale", {}, sc)

	-- ── LA ROUE, au centre : halo, rayons, jante, disque, éclat, moyeu, aiguille ──
	local fond = inst("Frame", { Name = "Lumiere", BackgroundTransparency = 1, Size = UDim2.fromOffset(TAILLE, TAILLE), AnchorPoint = Vector2.new(0.5, 0.5), ZIndex = 1 }, sc)
	U.fondRoue = fond
	rond(fond, 860, RGB(255, 60, 190), 0.93, 1)
	rond(fond, 720, RGB(255, 120, 200), 0.9, 1)
	U.rayons = batirRayons(fond, 9, 1240, 74, RGB(255, 206, 90), 0.78, 1)
	rond(fond, 640, RGB(255, 200, 80), 0.84, 1)
	local roue = inst("Frame", { Name = "LaRoue", BackgroundTransparency = 1, Size = UDim2.fromOffset(TAILLE, TAILLE), AnchorPoint = Vector2.new(0.5, 0.5), ZIndex = 2 }, sc)
	U.roue = roue
	U.roueEchelle = inst("UIScale", {}, roue)
	batirJante(roue)
	U.disque = batirDisque(roue)
	U.eclat = batirEclat(roue)
	batirMoyeu(roue)
	batirAiguille(roue)

	-- ── À GAUCHE, on LIT : le titre (comme la BOUTIQUE), deux phrases, le tour gratuit et les parties ; en bas, RETOUR ──
	local g = inst("Frame", { Name = "Gauche", BackgroundTransparency = 1, Size = UDim2.new(0, 440, 1, 0), ZIndex = 12 }, sc)
	U.gauche = g
	texte(g, { italique = true, Text = tr("LA ROUE", "THE WHEEL"), TextSize = 78, TextColor3 = C.texte, Size = UDim2.fromOffset(600, 80), Position = UDim2.fromOffset(66, 22),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 4 })
	for i, c in { C.magenta, C.cyan, C.or_ } do
		inst("Frame", { BackgroundColor3 = c, BorderSizePixel = 0, Size = UDim2.fromOffset(i == 1 and 82 or 38, 7), Position = UDim2.fromOffset(72 + (i == 1 and 0 or (i == 2 and 92 or 140)), 108) }, g)
	end
	inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 22, TextColor3 = C.texte2, TextWrapped = true, LineHeight = 1.1,
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top,
		Text = tr("De l'argent, des skins… et neuf caisses qu'on ne gagne QU'ICI. Une caisse gagnée : tu la gardes, ou tu la revends.",
			"Cash, skins… and nine cars you can ONLY win here. Win a car: keep it, or sell it."),
		Size = UDim2.fromOffset(320, 124), Position = UDim2.fromOffset(68, 136) }, g)
	-- la carte du TOUR GRATUIT : le compte à rebours, puis les parties qui en offrent un
	local cg = K.carbone(g, UDim2.fromOffset(320, 158), UDim2.fromOffset(66, 282), C.menthe)
	U.cartePartie = cg
	U.icoLibre = K.icone(cg, "cadeau", 4, C.menthe, UDim2.fromOffset(26, 22))
	texte(cg, { Text = tr("TOUR GRATUIT", "FREE SPIN"), TextSize = 17, TextColor3 = C.terne, Size = UDim2.fromOffset(240, 18), Position = UDim2.fromOffset(76, 20),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, contour = false })
	U.libre = texte(cg, { Text = "", TextSize = 28, TextColor3 = C.texte, Size = UDim2.fromOffset(240, 32), Position = UDim2.fromOffset(74, 44),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	inst("Frame", { BackgroundColor3 = C.trait, BorderSizePixel = 0, Size = UDim2.new(1, -44, 0, 2), Position = UDim2.fromOffset(26, 92) }, cg)
	texte(cg, { Text = string.format(tr("%d PARTIES = +1 TOUR", "%d RUNS = +1 SPIN"), RO.parties), TextSize = 15, TextColor3 = C.terne, Size = UDim2.fromOffset(280, 18),
		Position = UDim2.fromOffset(26, 104), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, contour = false })
	U.pips = {}
	local np = math.clamp(RO.parties, 1, 6)
	for i = 1, np do
		local p = inst("Frame", { BackgroundColor3 = RGB(20, 14, 40), BorderSizePixel = 0, Size = UDim2.fromOffset(math.floor((268 - (np - 1) * 8) / np), 14),
			Position = UDim2.fromOffset(26 + (i - 1) * (math.floor((268 - (np - 1) * 8) / np) + 8), 130) }, cg)
		inst("UIStroke", { Color = ENCRE, Thickness = 2 }, p)
		U.pips[i] = p
	end
	-- les CHANCES (règle de Roblox pour tout lot tiré au hasard qu'on peut payer en Robux : les afficher AVANT l'achat)
	U.chancesBt = K.tuile(g, tr("VOIR LES CHANCES", "SEE THE ODDS"), C.cyan, UDim2.fromOffset(320, 60), UDim2.new(0, 66, 1, -164), Vector2.new(0, 1), 19)
	U.chancesBoite = U.chancesBt.Parent.Parent
	-- (9/10, parcours) les CIBLES DU POUCE : une plaque de 60 ne faisait que 29 px réels sur un téléphone couché (la racine × 0,49) — la
	-- zone qu'on touche déborde en haut et en bas (le dessin ne bouge pas), sans mordre sur RETOUR ni sur le lingot
	K.cible(U.chancesBt, 15)
	U.chancesBt.Activated:Connect(function() Roue.chances(true) end)
	U.retour = K.boutonRetour(g)
	U.retour.Activated:Connect(function()
		if U.mode == "chances" then Roue.chances(false) else Roue.fermer() end
	end)

	-- ── À DROITE : les TOURS en haut (on lit), le lingot en bas (on touche) ──
	local d = inst("Frame", { Name = "Droite", BackgroundTransparency = 1, Size = UDim2.new(0, 360, 1, 0), AnchorPoint = Vector2.new(1, 0),
		Position = UDim2.new(1, -60, 0, 0), ZIndex = 12 }, sc)
	U.droite = d
	local tk = K.carbone(d, UDim2.fromOffset(360, 132), UDim2.fromOffset(0, 30), C.magenta)
	U.ticket = tk
	local icoT = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(72, 72), Position = UDim2.fromOffset(28, 30) }, tk)
	K.icone(icoT, Roue.ICONE, 8, ENCRE, UDim2.fromOffset(4, 4))
	U.icoTours = K.icone(icoT, Roue.ICONE, 8, { { 0.3, OR_CL }, { 0.7, OR_PL }, { 1, OR_SO } }, UDim2.fromOffset(0, 0))
	U.lTours = texte(tk, { Text = "", TextSize = 20, TextColor3 = C.texte2, Size = UDim2.fromOffset(220, 22), Position = UDim2.fromOffset(122, 24),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, contour = false })
	U.nTours = texte(tk, { Text = "", TextSize = 64, TextColor3 = OR1, Size = UDim2.fromOffset(220, 70), Position = UDim2.fromOffset(118, 50),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 4 })
	U.nToursEchelle = inst("UIScale", {}, U.nTours)
	-- le bas, ÉTAT : acheter des tours (magenta, secondaire), TOURNER (LE lingot)
	U.basEtat = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, d)
	U.acheter = K.tuile(U.basEtat, tr("+3 TOURS", "+3 SPINS"), C.magenta, UDim2.fromOffset(360, 66), UDim2.new(0, 0, 1, -176), Vector2.new(0, 1), 20, "panier")
	U.acheterBoite = U.acheter.Parent.Parent
	K.cible(U.acheter, 12)
	U.acheter.Activated:Connect(function()
		local id = R.produits.tours3
		if type(id) == "number" and id > 0 then pcall(function() MarketplaceService:PromptProductPurchase(joueur, id) end) end
	end)
	U.tourner = K.lingot(U.basEtat, tr("TOURNER", "SPIN"), UDim2.fromOffset(360, 112), UDim2.new(0, 0, 1, -36), Vector2.new(0, 1), 46)
	U.tournerBoite = U.tourner.Parent.Parent
	-- (v2.2) l'étiquette GRATUIT ! collée sur le coin du lingot quand le tour offert attend : on sait que ce tour-là ne coûte rien
	U.tagLibre = inst("Frame", { Name = "Gratuit", BackgroundColor3 = C.menthe, BorderSizePixel = 0, Size = UDim2.fromOffset(170, 36),
		Position = UDim2.fromOffset(34, -24), Rotation = -5, ZIndex = 6, Visible = false }, U.tournerBoite)
	inst("UIStroke", { Color = ENCRE, Thickness = 3 }, U.tagLibre)
	texte(U.tagLibre, { Text = tr("GRATUIT !", "FREE!"), TextSize = 18, TextColor3 = RGB(4, 44, 26), Size = UDim2.fromScale(1, 1), TextWrapped = false,
		contour = false, ZIndex = 7 })
	U.tourner.Activated:Connect(function() Roue.tourner() end)
	-- le bas, GAIN : vendre (cyan) au-dessus, GARDER / ENCAISSER (le lingot) à la place exacte de TOURNER — le même pouce
	U.basGain = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, d)
	U.gVendre = K.tuile(U.basGain, "", C.cyan, UDim2.fromOffset(360, 76), UDim2.new(0, 0, 1, -176), Vector2.new(0, 1), 21)
	U.gVendreBoite = U.gVendre.Parent.Parent
	K.cible(U.gVendre, 7)
	U.gGarder = K.lingot(U.basGain, tr("LA GARDER", "KEEP IT"), UDim2.fromOffset(360, 112), UDim2.new(0, 0, 1, -36), Vector2.new(0, 1), 40)
	U.gGarder.Activated:Connect(function()
		if U.res and U.res.caisse then Roue.choisir(true) else Roue.retourEtat() end
	end)
	U.gVendre.Activated:Connect(function() Roue.choisir(false) end)

	-- ── LE GAIN : il JAILLIT au centre, par-dessus la roue assombrie ──
	local gn = inst("Frame", { Name = "Gain", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 10 }, sc)
	U.gain = gn
	U.gVoile = inst("Frame", { BackgroundColor3 = RGB(8, 4, 20), BackgroundTransparency = 0.3, BorderSizePixel = 0, Size = UDim2.new(1, 400, 1, 400),
		Position = UDim2.fromOffset(-200, -200), ZIndex = 10 }, gn)
	local ca = inst("Frame", { Name = "Carte", BackgroundTransparency = 1, Size = UDim2.fromOffset(620, 600), AnchorPoint = Vector2.new(0.5, 0.5), ZIndex = 11 }, gn)
	U.gCarte = ca
	U.gEchelle = inst("UIScale", {}, ca)
	U.gRayons = batirRayons(ca, 10, 1100, 90, OR1, 0.62, 11)
	U.gHalo = rond(ca, 520, OR1, 0.86, 11)
	-- l'ÉCRIN : une plaque de laque cerclée de la couleur du lot (droite, pas penchée : on ne la touche pas)
	local ec = inst("Frame", { Name = "Ecrin", BackgroundColor3 = BLANC, BorderSizePixel = 0, Size = UDim2.fromOffset(520, 300), AnchorPoint = Vector2.new(0.5, 0),
		Position = UDim2.new(0.5, 0, 0, 126), ZIndex = 12 }, ca)
	K.degrade(ec, RGB(58, 26, 100), RGB(16, 8, 36), 90)
	U.ecrinTrait = inst("UIStroke", { Color = OR1, Thickness = 4, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, ec)
	inst("Frame", { BackgroundColor3 = BLANC, BackgroundTransparency = 0.9, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3), ZIndex = 12 }, ec)
	U.ecrin = ec
	U.gTag = inst("Frame", { BackgroundColor3 = C.magenta, BorderSizePixel = 0, Size = UDim2.fromOffset(280, 36), Position = UDim2.fromOffset(16, -17), ZIndex = 14 }, ec)
	inst("UIStroke", { Color = ENCRE, Thickness = 2 }, U.gTag)
	texte(U.gTag, { Text = tr("EXCLUSIF ROUE", "WHEEL EXCLUSIVE"), TextSize = 16, TextColor3 = BLANC, Size = UDim2.fromScale(1, 1), TextWrapped = false, epais = 2, ZIndex = 15 })
	U.gVue = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(500, 270), Position = UDim2.fromOffset(10, 18),
		Ambient = RGB(150, 150, 178), LightColor = RGB(255, 250, 240), ZIndex = 13 }, ec)
	U.gIco = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), ZIndex = 13 }, ec)
	U.gMontant = texte(ec, { Text = "", TextSize = 78, TextColor3 = C.menthe, Size = UDim2.new(1, -20, 0, 86), Position = UDim2.fromOffset(10, 188), TextWrapped = false,
		epais = 5, contourCouleur = RGB(4, 40, 20), ZIndex = 14 })
	U.gMontantEchelle = inst("UIScale", {}, U.gMontant)
	U.gTete = texte(ca, { Text = "", TextSize = 52, TextColor3 = OR1, italique = true, Size = UDim2.new(1, 0, 0, 60), Position = UDim2.fromOffset(0, 46), TextWrapped = false,
		epais = 5, ZIndex = 14 })
	U.gTeteEchelle = inst("UIScale", {}, U.gTete)
	U.gNom = texte(ca, { Text = "", TextSize = 32, TextColor3 = C.texte, Size = UDim2.new(1, -60, 0, 38), Position = UDim2.fromOffset(30, 446), TextWrapped = false,
		TextScaled = true, epais = 3, ZIndex = 14 })
	inst("UITextSizeConstraint", { MaxTextSize = 32, MinTextSize = 14 }, U.gNom)
	U.gNote = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 21, TextColor3 = C.texte2, TextWrapped = true, Text = "",
		Size = UDim2.new(1, -80, 0, 56), Position = UDim2.fromOffset(40, 492), ZIndex = 14 }, ca)
	-- les CONFETTIS : un petit bassin de pixels qui jaillissent du centre de l'écrin
	U.gConf = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(2, 2), AnchorPoint = Vector2.new(0.5, 0.5), ZIndex = 16 }, gn)
	U.conf = {}
	for i = 1, 44 do
		local f = inst("Frame", { BorderSizePixel = 0, Size = UDim2.fromOffset(10, 10), AnchorPoint = Vector2.new(0.5, 0.5), Visible = false, ZIndex = 16 }, U.gConf)
		U.conf[i] = { f = f, x = 0, y = 0, vx = 0, vy = 0, r = 0, vr = 0, t = 0, vie = 1 }
	end

	-- ── LES CHANCES : case par case, sa couleur, son lot, sa chance ──
	local ch = inst("Frame", { Name = "Chances", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 10 }, sc)
	U.chances = ch
	inst("Frame", { BackgroundColor3 = RGB(8, 4, 20), BackgroundTransparency = 0.3, BorderSizePixel = 0, Size = UDim2.new(1, 400, 1, 400), Position = UDim2.fromOffset(-200, -200),
		ZIndex = 10 }, ch)
	local tb = K.carbone(ch, UDim2.fromOffset(560, 520), UDim2.new(), C.cyan, Vector2.new(0.5, 0.5))
	tb.ZIndex = 11
	U.chCarte = tb
	texte(tb, { italique = true, Text = tr("LES CHANCES", "THE ODDS"), TextSize = 34, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 40), Position = UDim2.fromOffset(0, 22),
		TextWrapped = false, epais = 4 })
	local total = 0
	for _, c in RO.cases do total += c.w end
	for k, c in RO.cases do
		local y = 80 + (k - 1) * 42
		if k % 2 == 1 then
			inst("Frame", { BackgroundColor3 = BLANC, BackgroundTransparency = 0.95, BorderSizePixel = 0, Size = UDim2.new(1, -52, 0, 42), Position = UDim2.fromOffset(32, y) }, tb)
		end
		local sw = inst("Frame", { BackgroundColor3 = (couleurCase(k)), BorderSizePixel = 0, Size = UDim2.fromOffset(24, 24), Position = UDim2.fromOffset(48, y + 9) }, tb)
		inst("UIStroke", { Color = ENCRE, Thickness = 2 }, sw)
		local nom = libelle(k)
		if c.k == "caisse" then nom = tr("CAISSE EXCLUSIVE", "EXCLUSIVE CAR") elseif c.k == "habit" then nom = tr("SKIN EXCLUSIF", "EXCLUSIVE SKIN")
		elseif c.jackpot then nom = "JACKPOT  " .. Hud.argent(c.v) end
		texte(tb, { Text = nom, TextSize = 19, TextColor3 = C.texte, Size = UDim2.fromOffset(330, 42), Position = UDim2.fromOffset(88, y),
			TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
		local pc = c.w / total * 100
		local pcT = string.format(pc < 10 and "%.1f" or "%.0f", pc)
		if FR then pcT = string.gsub(pcT, "%.", ",") end
		texte(tb, { Text = pcT .. " %", TextSize = 19, TextColor3 = OR1, Size = UDim2.fromOffset(120, 42),
			Position = UDim2.new(1, -40, 0, y), AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
	end
	local okC = K.tuile(tb, "OK", C.cyan, UDim2.fromOffset(200, 60), UDim2.new(0.5, 0, 1, -22), Vector2.new(0.5, 1), 24)
	K.cible(okC, 15)
	okC.Activated:Connect(function() Roue.chances(false) end)

	-- la mise en page suit l'écran (rotation du téléphone, fenêtre redimensionnée)
	v:GetPropertyChangedSignal("AbsoluteSize"):Connect(function() Roue.placer() end)
end

-- la SCÈNE : au moins LMIN de large (sinon tout se réduit d'un bloc), la roue au milieu, les colonnes collées aux bords
function Roue.placer()
	if not U.voile then return end
	local a = U.voile.AbsoluteSize
	if a.Y < 2 then return end
	local W = a.X / a.Y * 720
	local Ws = math.max(W, LMIN)
	U.scene.Size = UDim2.fromOffset(Ws, 720)
	U.sceneEchelle.Scale = math.min(1, W / LMIN)
	local centre = UDim2.fromOffset(math.floor(Ws / 2), 372)
	U.roue.Position = centre
	U.fondRoue.Position = centre
	U.gCarte.Position = centre
	U.gConf.Position = centre + UDim2.fromOffset(0, -64)
	U.chCarte.Position = centre
end

-- qui est visible : "etat" (on attend le tour), "tourne", "gain", "chances"
local function poser(mode: string)
	U.mode = mode
	U.gain.Visible = mode == "gain"
	U.chances.Visible = mode == "chances"
	U.basEtat.Visible = mode == "etat" or mode == "tourne"
	U.basGain.Visible = mode == "gain"
	U.chancesBoite.Visible = mode == "etat"
	griser(U.retour, mode == "tourne")
	respirer(U.gGarder, mode == "gain")
	if mode ~= "etat" then respirer(U.tourner, false) end
end

-- ════════ l'affichage de l'état ════════
local function majEtat()
	if not U.voile then return end
	local n, libre = Roue.tours(), Roue.libre()
	local t = tostring(n)
	if U.nTours.Text ~= t and U.nTours.Text ~= "" then
		-- (le compteur BONDIT quand il change : un tour gagné, un tour joué)
		U.nToursEchelle.Scale = 1.35
		tw(U.nToursEchelle, 0.3, { Scale = 1 })
	end
	U.nTours.Text = t
	U.nTours.TextColor3 = (n > 0) and OR1 or C.terne
	U.lTours.Text = (n > 0) and ((n == 1) and tr("TOUR A JOUER", "SPIN TO PLAY") or tr("TOURS A JOUER", "SPINS TO PLAY")) or tr("PLUS DE TOURS", "NO SPINS LEFT")
	K.teinter(U.icoTours, (n > 0) and { { 0.3, OR_CL }, { 0.7, OR_PL }, { 1, OR_SO } } or C.terne)
	U.libre.Text = libre and tr("PRET !", "READY!") or Roue.attente()
	U.libre.TextColor3 = libre and C.menthe or C.texte
	K.teinter(U.icoLibre, libre and C.menthe or C.terne)
	local pa = attr("RoueParties") or 0
	for i, p in U.pips do p.BackgroundColor3 = (i <= pa) and C.menthe or RGB(20, 14, 40) end
	local id = R.produits.tours3
	-- (règle de Roblox : là où les lots payants tirés au hasard sont interdits, on ne VEND pas de tours — les gratuits restent)
	U.acheterBoite.Visible = type(id) == "number" and id > 0 and not U.hasardInterdit
	U.tagLibre.Visible = libre and not U.tourne
	respirer(U.tourner, n > 0 and U.mode == "etat" and not U.tourne)
	if not U.tourne then
		peindreLingot(U.tourner, n > 0)
		U.tourner.Text = (n > 0) and tr("TOURNER", "SPIN") or (libre and tr("TOURNER", "SPIN") or (tr("GRATUIT DANS ", "FREE IN ") .. Roue.attente()))
		U.tourner.TextSize = (n > 0) and 46 or 24
	end
end

-- ════════ LA BOUCLE (seulement roue ouverte) : rayons, ampoules, aiguille, plateau tournant, compteur, confettis ════════
U.angle, U.rayA, U.rayV, U.flap, U.phase, U.amp = 0, 0, 7, 0, 0, "repos"
local motif = ""
local function boucle(dt: number)
	-- le soleil de rayons : il tourne doucement, et s'emballe avec la roue (U.rayV est poussé par le tour, il retombe seul)
	U.rayA = (U.rayA + dt * U.rayV) % 360
	U.rayons.Rotation = U.rayA
	if not U.tourne then U.rayV += (7 - U.rayV) * math.min(1, dt * 1.6) end
	-- les ampoules
	local m
	local tc = os.clock()
	if U.amp == "tourne" then
		local p = math.floor(U.phase)
		m = "t" .. (p % 4)
		if m ~= motif then
			for i = 1, NAMP do ampoule(i, ((i + p) % 4 == 0) and 1 or (((i + p) % 4 == 2) and 2 or 0)) end
		end
	elseif U.amp == "fete" then
		local p = math.floor(tc * 9) % 2
		m = "f" .. p
		if m ~= motif then
			for i = 1, NAMP do ampoule(i, (p == 0) and 1 or 0) end
		end
	else
		local p = math.floor(tc * 2) % 2
		m = "r" .. p
		if m ~= motif then
			for i = 1, NAMP do ampoule(i, ((i + p) % 2 == 0) and 1 or 2) end
		end
	end
	motif = m
	-- l'aiguille revient sur sa charnière (ressort amorti, indépendant de la cadence d'images)
	U.flap *= math.exp(-dt * 13)
	U.aiguille.Rotation = U.flap
	-- le GAIN : ses rayons, la caisse sur son plateau, l'argent qui se compte, les confettis
	if U.mode == "gain" then
		U.gRayons.Rotation = (U.gRayons.Rotation + dt * 16) % 360
		local pl = U.plateau
		if pl and pl.corps and pl.corps.Parent then
			pl.az += dt * 0.55
			cadrer(pl.vp, pl.cam, pl.corps, pl.az)
		end
		local cp = U.compte
		if cp then
			cp.t += dt
			local u = math.min(1, cp.t / cp.d)
			local e = 1 - (1 - u) ^ 3
			U.gMontant.Text = "+" .. Hud.argent(math.floor(cp.v * e + 0.5))
			if u < 1 and tc - (cp.son or 0) > 0.07 then
				cp.son = tc
				Sons.jouer("piece", 1 + u * 0.6, 0.25)
			end
			if u >= 1 then
				U.compte = nil
				U.gMontantEchelle.Scale = 1.25
				tw(U.gMontantEchelle, 0.35, { Scale = 1 }, Enum.EasingStyle.Back)
			end
		end
	end
	if U.confOn then
		local vivant = false
		for _, p in U.conf do
			if p.f.Visible then
				p.t += dt
				if p.t >= p.vie then
					p.f.Visible = false
				else
					vivant = true
					p.vy += 980 * dt
					p.vx *= math.exp(-dt * 1.4)
					p.x += p.vx * dt
					p.y += p.vy * dt
					p.r += p.vr * dt
					p.f.Position = UDim2.fromOffset(p.x, p.y)
					p.f.Rotation = p.r
					p.f.BackgroundTransparency = math.clamp((p.t - p.vie + 0.4) / 0.4, 0, 1)
				end
			end
		end
		U.confOn = vivant
	end
end
local function confettis(couleurs: { Color3 }, n: number)
	for i, p in U.conf do
		if i > n then
			p.f.Visible = false
		else
			local a = math.random() * math.pi * 2
			local v = 300 + math.random() * 560
			p.x, p.y = math.cos(a) * 30, math.sin(a) * 30
			p.vx, p.vy = math.cos(a) * v, math.sin(a) * v * 0.8 - 340
			p.r, p.vr = math.random() * 90, (math.random() - 0.5) * 1000
			p.t, p.vie = 0, 1.2 + math.random() * 0.8
			local w = 8 + math.random(0, 3) * 2
			p.f.Size = UDim2.fromOffset(w, (math.random() < 0.5) and w or math.floor(w * 0.55))
			p.f.BackgroundColor3 = couleurs[math.random(1, #couleurs)]
			p.f.BackgroundTransparency = 0
			p.f.Position = UDim2.fromOffset(p.x, p.y)
			p.f.Visible = true
		end
	end
	U.confOn = true
end

-- ════════ TOURNER ════════
local function segmentEnHaut(ang: number): number return math.floor(((-ang) % 360 + PAS / 2) / PAS) end
-- la CÉLÉBRATION : la case gagnante flashe trois fois, la jante clignote, puis le lot jaillit
local function celebrer(res: any)
	U.eclat.Rotation = U.angle + (res.case - 1) * PAS
	U.amp = "fete"
	Sons.jouer("maillon", 1.25, 0.5)
	Hud.vibre(30)
	U.rayV = 60
	for _ = 1, 3 do
		U.eclat.GroupTransparency = 0.05
		tw(U.eclat, 0.17, { GroupTransparency = 0.8 })
		task.wait(0.2)
	end
	tw(U.roueEchelle, 0.3, { Scale = 1 })
	U.tourne = false
	Roue.reveler(res)
end
local function lancer(res: any)
	-- 6 tours pleins, puis la case tirée sous l'aiguille (un peu décalée dans sa case : une vraie roue ne s'arrête jamais pile au
	-- milieu) ; la roue DÉPASSE de 1,6° et revient se caler — le décalage reste à ±15° du milieu, la case (±22,5°) ne change pas
	local a0 = U.angle % 360
	local cible = -((res.case - 1) * PAS) + (math.random() - 0.5) * PAS * 0.62
	local d = ((cible - a0) % 360) + 360 * 6
	local RECUL, T_RECUL, T, DEPASSE, T_CALE = 10, 0.3, 5.4, 1.6, 0.32
	local t, prec, tSon, tVib = 0, a0, 0, 0
	local dernier = segmentEnHaut(a0)
	U.amp = "tourne"
	tw(U.roueEchelle, 0.4, { Scale = 1.04 })
	local cn: RBXScriptConnection
	cn = RunService.RenderStepped:Connect(function(dt: number)
		t += dt
		local ang, fini
		if t < T_RECUL then
			-- l'ÉLAN : la roue recule d'un geste avant de partir
			ang = a0 - RECUL * math.sin(t / T_RECUL * math.pi / 2)
		elseif t < T_RECUL + T then
			local u = (t - T_RECUL) / T
			ang = a0 - RECUL + (d + RECUL + DEPASSE) * (1 - (1 - u) ^ 3.4)
		else
			local u = math.min(1, (t - T_RECUL - T) / T_CALE)
			ang = a0 + d + DEPASSE * (1 - (u * u * (3 - 2 * u)))
			fini = u >= 1
		end
		local dA = ang - prec
		prec = ang
		local v = math.abs(dA) / math.max(dt, 1 / 240) -- (degrés par seconde)
		U.angle = ang
		U.disque.Rotation = ang
		U.rayV = 7 + math.min(160, v * 0.08)
		U.phase += dt * (3 + math.min(26, v * 0.016))
		local s = segmentEnHaut(ang)
		if s ~= dernier then
			dernier = s
			-- le CLIQUET : le téton pousse la languette du côté où il file ; plus la roue va vite, plus elle claque
			U.flap = -math.sign(dA) * math.clamp(10 + v * 0.01, 10, 26)
			local c = os.clock()
			if c - tSon > 0.04 then
				tSon = c
				Sons.jouer("bip", 1.05 + math.clamp(v / 1800, 0, 0.6), 0.32)
			end
			if c - tVib > 0.08 then
				tVib = c
				Hud.vibre(4)
			end
		end
		if fini then
			cn:Disconnect()
			U.angle = (a0 + d) % 360
			U.disque.Rotation = U.angle
			task.spawn(celebrer, res)
		end
	end)
end
function Roue.tourner()
	if U.tourne or not U.voile or U.mode ~= "etat" then return end
	if Roue.tours() <= 0 then
		Sons.vrai("uiRefus", nil, nil, "tap", 0.8)
		Hud.toast(tr("PLUS DE TOURS : REVIENS PLUS TARD", "NO SPINS: COME BACK LATER"), nil, "croix")
		secouer(U.tournerBoite, 10, 0.35)
		return
	end
	U.tourne = true
	poser("tourne")
	U.tagLibre.Visible = false
	peindreLingot(U.tourner, true, true)
	U.tourner.Text = tr("BONNE CHANCE !", "GOOD LUCK!")
	U.tourner.TextSize = 28
	task.spawn(function()
		local ok, res = ctx.action("roue")
		if not ok or type(res) ~= "table" or not RO.cases[res.case] then
			U.tourne = false
			poser("etat")
			majEtat()
			Hud.toast(tr("LA ROUE EST COINCEE, REESSAIE", "THE WHEEL IS STUCK, TRY AGAIN"), nil, "croix")
			return
		end
		Sons.jouer("go", 1.2, 0.6)
		lancer(res)
	end)
end

-- ════════ LE GAIN ════════
local function viderGain()
	U.compte = nil
	U.plateau = nil
	U.gIco:ClearAllChildren()
	U.gVue:ClearAllChildren()
	if U.gModele then
		Caisse.rendre(U.gModele)
		U.gModele = nil
	end
end
function Roue.reveler(res: any)
	U.res = res
	viderGain()
	poser("gain")
	U.amp = "fete"
	local c = RO.cases[res.case]
	local caisse = res.caisse
	local jack = c.jackpot == true and res.gain ~= nil
	-- la COULEUR DU LOT (rayons, cerclage de l'écrin, confettis) : cyan la caisse, magenta le skin, or le jackpot, vert l'argent
	local teinte = (caisse and C.cyan) or (res.habit and C.magenta) or (jack and OR1) or C.menthe
	for _, r in U.gRayons:GetChildren() do (r :: Frame).BackgroundColor3 = teinte end
	U.gHalo.BackgroundColor3 = teinte
	U.ecrinTrait.Color = teinte
	U.gTag.Visible = caisse ~= nil or res.habit ~= nil
	U.gMontant.Visible = res.gain ~= nil
	U.gVue.Visible = caisse ~= nil
	U.gNom.Visible = caisse ~= nil or res.habit ~= nil
	U.gVendreBoite.Visible = caisse ~= nil
	U.gNote.Text = ""
	local couleurs = { teinte, OR1, BLANC, C.magenta, C.cyan }
	if caisse then
		local f = Catalogue[caisse]
		U.gTete.Text = tr("UNE CAISSE !", "A CAR!")
		U.gNom.Text = Hud.sansAccent(string.upper(FR and f.nom or (f.en or f.nom)))
		U.gModele = photographier(U.gVue, caisse)
		U.gVendre.Text = tr("LA VENDRE  ", "SELL IT  ") .. Hud.argent(RO.revente)
		U.gGarder.Text = tr("LA GARDER", "KEEP IT")
		U.gGarder.TextSize = 40
		Sons.jouer("record")
		Hud.vibre(60)
	elseif res.habit then
		local dh = Config.habit(res.habit[1], res.habit[2])
		U.gTete.Text = tr("UN SKIN !", "A SKIN!")
		U.gNom.Text = dh and Hud.sansAccent(string.upper(FR and dh.nom or dh.en)) or "?"
		-- le pinceau, à la couleur du skin (l'arc-en-ciel en bandes)
		local bandes = (dh and dh.arcenciel) and { { 0.2, RGB(255, 70, 90) }, { 0.38, RGB(255, 150, 40) }, { 0.56, RGB(255, 230, 60) },
			{ 0.74, RGB(80, 230, 120) }, { 1, RGB(70, 140, 255) } } or ((dh and dh.c) or OR1)
		local ic = iconeOmbre(U.gIco, "pinceau", 22, bandes, 14)
		ic.AnchorPoint = Vector2.new(0.5, 0.5)
		ic.Position = UDim2.fromScale(0.5, 0.5)
		U.gNote.Text = tr("Il t'attend au GARAGE, onglet ", "It's waiting in the GARAGE, tab ") .. ((res.habit[1] == "peinture") and tr("PEINTURE.", "PAINT.") or tr("TRAINEES.", "TRAILS."))
		U.gGarder.Text = tr("RECUPERER", "CLAIM")
		U.gGarder.TextSize = 40
		Sons.jouer("record")
		Hud.vibre(40)
	else
		U.gTete.Text = jack and tr("JACKPOT !!!", "JACKPOT!!!") or tr("GAGNE !", "YOU WIN!")
		local ic = iconeOmbre(U.gIco, jack and "trophee" or "piece", 15, { { 0.3, OR_CL }, { 0.7, OR_PL }, { 1, OR_SO } }, 14)
		ic.AnchorPoint = Vector2.new(0.5, 0)
		ic.Position = UDim2.new(0.5, 0, 0, 24)
		U.gMontant.Text = "+" .. Hud.argent(0)
		U.compte = { t = -0.25, d = jack and 1.4 or 0.9, v = res.gain }
		U.gNote.Text = (c.k ~= "argent") and tr("(Tu avais déjà tout : la case paie.)", "(You already had it all: the slot pays out.)") or ""
		U.gGarder.Text = tr("ENCAISSER", "COLLECT")
		U.gGarder.TextSize = 40
		couleurs = { C.menthe, OR1, RGB(60, 200, 110), BLANC }
		Sons.jouer(jack and "record" or "encaisse")
		Hud.vibre(jack and 120 or 30)
	end
	U.gTete.TextColor3 = jack and OR1 or (caisse and C.cyan or (res.habit and C.rose or OR1))
	-- l'entrée : le voile tombe, la carte JAILLIT (le rebond est permis ici : c'est la célébration), le titre claque
	U.gVoile.BackgroundTransparency = 1
	tw(U.gVoile, 0.25, { BackgroundTransparency = 0.25 })
	U.gEchelle.Scale = 0.35
	tw(U.gEchelle, 0.45, { Scale = 1 }, Enum.EasingStyle.Back)
	U.gTeteEchelle.Scale = 1.9
	tw(U.gTeteEchelle, 0.38, { Scale = 1 }, Enum.EasingStyle.Back)
	U.gRayons.Rotation = 0
	confettis(couleurs, jack and 44 or 30)
	if jack then secouer(U.scene, 9, 0.5) end
	-- les boutons du gain arrivent un souffle après la carte (on regarde le lot d'abord)
	U.basGain.Position = UDim2.fromOffset(0, 40)
	tw(U.basGain, 0.32, { Position = UDim2.fromOffset(0, 0) }, Enum.EasingStyle.Quint)
	task.delay(1.1, function() if U.mode == "gain" then U.amp = "repos" end end)
	majEtat() -- (le ticket décompte le tour joué, il bondit)
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
	if not U.voile then return end
	if U.res and U.res.caisse and not U.choix and U.mode == "gain" then
		-- (fermer sans choisir : la caisse reste au garage — elle est déjà à toi)
		task.spawn(function() ctx.action("roueGarder", U.res.caisse) end)
	end
	U.res = nil
	viderGain()
	U.eclat.GroupTransparency = 1
	U.amp = "repos"
	U.confOn = false
	for _, p in U.conf do p.f.Visible = false end
	poser("etat")
	majEtat()
end
function Roue.chances(voir: boolean)
	if not U.voile or U.tourne then return end
	if voir then
		if U.mode ~= "etat" then return end
		Sons.jouer("tap")
		poser("chances")
		local s = U.chCarte:FindFirstChildOfClass("UIScale") or inst("UIScale", {}, U.chCarte)
		s.Scale = 0.9
		tw(s, 0.22, { Scale = 1 })
	elseif U.mode == "chances" then
		poser("etat")
	end
end

-- ════════ ouvrir / fermer ════════
function Roue.ouvrir()
	if not U.voile then creer() end
	if U.voile.Visible then return end
	U.eclat.GroupTransparency = 1
	poser("etat")
	majEtat()
	U.voile.Visible = true
	Roue.placer()
	Sons.vrai("uiModale", nil, nil, "tap", 1.1, 0.5)
	-- l'entrée : le fond tombe, la roue arrive en grandissant, les colonnes glissent depuis leur bord
	U.jupe.BackgroundTransparency = 1
	tw(U.jupe, 0.25, { BackgroundTransparency = 0.02 })
	U.roueEchelle.Scale = 0.8
	tw(U.roueEchelle, 0.5, { Scale = 1 }, Enum.EasingStyle.Quint)
	U.gauche.Position = UDim2.fromOffset(-50, 0)
	tw(U.gauche, 0.32, { Position = UDim2.fromOffset(0, 0) }, Enum.EasingStyle.Quint)
	U.droite.Position = UDim2.new(1, -10, 0, 0)
	tw(U.droite, 0.32, { Position = UDim2.new(1, -60, 0, 0) }, Enum.EasingStyle.Quint)
	U.rayV = 90
	if not U.cnBoucle then U.cnBoucle = RunService.RenderStepped:Connect(boucle) end
end
function Roue.fermer()
	if not U.voile or U.tourne then return end
	if U.mode == "gain" then Roue.retourEtat() end
	if U.mode == "chances" then poser("etat") end
	U.voile.Visible = false
	respirer(U.tourner, false)
	respirer(U.gGarder, false)
	if U.cnBoucle then
		U.cnBoucle:Disconnect()
		U.cnBoucle = nil
	end
	Sons.vrai("uiFerme", nil, nil, "tap", 0.9, 0.4)
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
	task.spawn(function()
		local ok, info = pcall(function() return PolicyService:GetPolicyInfoForPlayerAsync(joueur) end)
		U.hasardInterdit = not ok or (type(info) == "table" and info.ArePaidRandomItemsRestricted == true) -- (sans réponse : prudence, on ne vend pas)
	end)
	-- le TICKET du menu et la carte de fin vivent : tours, compte à rebours (deux fois par seconde)
	local t0 = 0
	RunService.RenderStepped:Connect(function()
		if os.clock() - t0 < 0.5 then return end
		t0 = os.clock()
		local n = Roue.tours()
		-- (le « ! » de la pastille était illisible à cette taille : elle porte le NOMBRE de tours, la tuile dit TOURNE ! — ou, sans tour,
		-- le compte à rebours du prochain tour gratuit)
		if c.info then
			c.info.Text = (n > 0) and tr("TOURNE !", "SPIN!") or Roue.attente()
			c.info.TextColor3 = (n > 0) and OR1 or C.terne
		end
		if c.pastille then
			c.pastille.Visible = n > 0
			c.pastille.Text = (n > 9) and "9+" or tostring(n)
		end
		local e = Hud.ecranCourant()
		if e == "mort" then Hud.defi(Roue.carte()) end
		if U.voile and U.voile.Visible and not U.tourne then majEtat() end
		if U.voile and U.voile.Visible and e ~= "menu" and e ~= "mort" then Roue.fermer() end
	end)
	-- (banc) workspace:SetAttribute("DbgRoue", "ouvrir…" | "tourner…" | "garder…" | "vendre…" | "ok…" | "chances…" | "fermer…")
	workspace:GetAttributeChangedSignal("DbgRoue"):Connect(function()
		local q = tostring(workspace:GetAttribute("DbgRoue") or "")
		if string.find(q, "^ouvrir") then Roue.ouvrir()
		elseif string.find(q, "^tourner") then Roue.tourner()
		elseif string.find(q, "^garder") then Roue.choisir(true)
		elseif string.find(q, "^vendre") then Roue.choisir(false)
		elseif string.find(q, "^ok") then Roue.retourEtat()
		elseif string.find(q, "^chances") then Roue.chances(true)
		elseif string.find(q, "^fermer") then Roue.fermer() end
	end)
end

return Roue
