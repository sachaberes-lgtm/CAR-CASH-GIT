-- CASH CAR — LA BOUTIQUE (l'écran #mShop du jeu web) : SEULEMENT les caisses qui s'achètent avec de l'argent réel — une vitrine.
-- À gauche l'OFFRE DE LANCEMENT (la caisse à la une, −50 %), à droite LES LEGENDAIRES en grille qui défile, RETOUR en bas à gauche.
-- ⚠ Rien ne se vend encore : sur le web chaque case dit « BIENTOT » (la porte d'achat refuse) ; ici aussi. Les prix du web sont en
-- euros — Roblox n'affiche que des Robux : le prix n'est PAS écrit tant que Sacha n'a pas décidé des tarifs (la plaque dit BIENTOT).
-- Les photos sont de vraies caisses 3D (Caisse.vignette) : bâties une par une à l'ouverture, RENDUES à la fermeture (le budget de
-- triangles de Roblox est compté) ; si le budget refuse, la case garde sa pastille de couleur.
local TweenService = game:GetService("TweenService")
local Hud = require(script.Parent:WaitForChild("Hud"))
local Sons = require(script.Parent:WaitForChild("Sons"))
local Caisse = require(script.Parent.Parent:WaitForChild("Caisse"))
local Maillage = require(script.Parent:WaitForChild("Maillage"))
local Catalogue = Caisse.Catalogue
local K, C = Hud.kit, Hud.C
local inst = K.inst
local FR = Hud.FR

local Boutique = { ouvert = false }
local U: any = {}
local ctx: any = nil
local depuis = "menu"
local fileN = 0
local UNE = 9 -- la caisse à la une : le CHAT ARC-EN-CIEL
local OR1 = Color3.fromRGB(255, 215, 94)

local function tr(fr: string, en: string): string return FR and fr or en end
local RARETE = { legendaire = { "LEGENDAIRE", "LEGENDARY", Color3.fromRGB(255, 215, 94) }, epique = { "EPIQUE", "EPIC", Color3.fromRGB(199, 125, 255) },
	rare = { "RARE", "RARE", Color3.fromRGB(77, 184, 255) } }

-- la liste : tout ce qui est « premium » dans le catalogue, dans l'ordre de ses indices, la une à part
local LISTE: { number } = {}
for i = 0, 200 do
	local f = Catalogue[i]
	if f and f.cond and f.cond.k == "premium" and i ~= UNE then table.insert(LISTE, i) end
end

-- LA PHOTO d'une caisse (carPhoto du web) : trois-quarts avant, nez à gauche
local function photographier(vp: ViewportFrame, i: number, zoom: number): Model?
	local m = Caisse.vignette(i)
	if not m then return nil end
	local corps = m.PrimaryPart :: BasePart
	local az, el = 0.82, 0.27
	local dir = Vector3.new(-math.sin(az) * math.cos(el), math.sin(el), -math.cos(az) * math.cos(el))
	local projete = corps.Size.Z * math.sin(az) + corps.Size.X * math.cos(az)
	local dist = projete / 0.9 / (2 * math.tan(math.rad(12)) * zoom) + corps.Size.Z * 0.18
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

-- la plaque « BIENTOT » : le cadenas et le mot, cernés d'or
local function bientot(parent: Instance, pos: UDim2, ancre: Vector2?, corps: number)
	local p = inst("Frame", { BackgroundColor3 = Color3.fromRGB(16, 12, 30), BorderSizePixel = 0, Size = UDim2.fromOffset(corps * 6.4, corps * 1.9), Position = pos,
		AnchorPoint = ancre or Vector2.zero }, parent)
	inst("UIStroke", { Color = OR1, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, p)
	inst("Frame", { BackgroundColor3 = OR1, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3), Position = UDim2.new(0, 0, 1, -3) }, p)
	K.icone(p, "verrou", math.max(1, math.floor(corps / 12)), OR1, UDim2.new(0, 12, 0.5, 0), Vector2.new(0, 0.5))
	K.texte(p, { Text = tr("BIENTOT", "SOON"), TextSize = corps, TextColor3 = OR1, Size = UDim2.new(1, -40, 1, 0), Position = UDim2.fromOffset(36, 0), TextWrapped = false })
end

local cases: { any } = {}
-- ════════ LA FENÊTRE D'ACHAT (shopPop, L22245 ; Sacha, 1/10 : « il faut que la fenêtre de la voiture sorte de la page en mode
-- pop-up pour valider la transaction ») ════════
-- Toucher une caisse de la vitrine la fait SORTIR de la grille : sa carte quitte sa place (un trou reste), grandit et vient se poser
-- au centre sur un voile — même photo (la caisse 3D de la case y passe : aucun maillage de plus), même nom — avec la rareté, sa
-- phrase, UN lingot d'or (ACHETER) et ANNULER. Fermer (ANNULER, le voile, RETOUR) la renvoie À SA PLACE par le même chemin.
-- L'achat n'est pas branché (les Robux : décision de Sacha) : ACHETER le DIT dans la fenêtre (« BIENTOT DISPONIBLE ») et ne donne
-- jamais rien.
local SP: any = { on = false }
local function creerFenetre(g: Instance)
	local v = inst("Frame", { Name = "Fenetre", BackgroundColor3 = Color3.fromRGB(6, 4, 16), BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1),
		Visible = false, Active = true }, g)
	local fond = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, v)
	fond.Activated:Connect(function() Boutique.popFerme() end) -- (le VOILE ferme)
	local W, H = 620, 600
	local c = inst("Frame", { Name = "Carte", BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.fromOffset(W, H),
		AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), Active = true }, v)
	K.degrade(c, Color3.fromRGB(58, 26, 92), Color3.fromRGB(20, 12, 42), 90)
	SP.trait = inst("UIStroke", { Color = OR1, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, c)
	SP.bande = inst("Frame", { BackgroundColor3 = OR1, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 6) }, c)
	SP.echelle = inst("UIScale", {}, c)
	SP.rare = K.texte(c, { Text = "", TextSize = 22, TextColor3 = OR1, Size = UDim2.fromOffset(300, 26), Position = UDim2.fromOffset(24, 22),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	local rab = inst("Frame", { BackgroundColor3 = C.magenta, BorderSizePixel = 0, Size = UDim2.fromOffset(120, 48), Position = UDim2.new(1, -22, 0, 16), AnchorPoint = Vector2.new(1, 0) }, c)
	inst("UIStroke", { Color = Color3.fromRGB(255, 190, 240), Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, rab)
	K.texte(rab, { Text = "-50%", TextSize = 34, TextColor3 = C.texte, Size = UDim2.fromScale(1, 1), TextWrapped = false, epais = 3 })
	SP.remise = rab
	rab.Visible = false -- (pas de prix, pas de remise : elle reviendra avec les tarifs en Robux)
	SP.vue = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.new(1, -40, 0, 250), Position = UDim2.fromOffset(20, 56),
		Ambient = Color3.fromRGB(104, 100, 128), LightColor = Color3.fromRGB(226, 216, 204) }, c)
	SP.pastille = inst("Frame", { BorderSizePixel = 0, AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), Size = UDim2.fromOffset(150, 42) }, SP.vue)
	SP.nom = K.texte(c, { Text = "", TextSize = 46, TextColor3 = C.texte, Size = UDim2.new(1, -48, 0, 52), Position = UDim2.fromOffset(24, 312),
		TextXAlignment = Enum.TextXAlignment.Left, TextScaled = true, epais = 4 })
	inst("UITextSizeConstraint", { MaxTextSize = 46, MinTextSize = 18 }, SP.nom)
	SP.desc = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 22, TextColor3 = C.texte2, TextWrapped = true, Text = "",
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, Size = UDim2.new(1, -48, 0, 78), Position = UDim2.fromOffset(24, 372),
		TextScaled = true }, c)
	inst("UITextSizeConstraint", { MaxTextSize = 22, MinTextSize = 13 }, SP.desc)
	-- UN lingot d'or (ACHETER), ANNULER en cyan à côté — deux décisions, une seule dorée (la charte)
	SP.oui = K.lingot(c, tr("ACHETER", "BUY"), UDim2.new(0.56, -30, 0, 84), UDim2.new(0, 24, 1, -58), Vector2.new(0, 1), 40)
	SP.non = K.tuile(c, tr("ANNULER", "CANCEL"), C.cyan, UDim2.new(0.44, -30, 0, 72), UDim2.new(1, -24, 1, -64), Vector2.new(1, 1), 24, "gauche")
	SP.note = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 17, TextColor3 = C.terne, TextWrapped = true, Text = "",
		Size = UDim2.new(1, -48, 0, 40), Position = UDim2.new(0, 24, 1, -48), TextXAlignment = Enum.TextXAlignment.Left }, c)
	SP.acheter = function()
		if not SP.on or SP.anim then return end
		-- l'achat n'est pas branché : on le DIT, dans la fenêtre, et rien n'est donné
		Sons.vrai("uiRefus", nil, nil, "tap", 0.8)
		Hud.vibre(10)
		SP.oui.TextScaled = true
		SP.oui.Text = tr("BIENTOT DISPONIBLE", "COMING SOON")
		SP.note.Text = tr("Les achats arrivent très bientôt.", "Purchases are coming very soon.") -- (le jeu est publié : plus de « à la sortie »)
		SP.note.TextColor3 = OR1
		task.spawn(function() -- (un refus se sent : la carte tremble)
			for k = 1, 6 do
				c.Position = UDim2.new(0.5, ((k % 2 == 0) and 1 or -1) * (7 - k), 0.5, 0)
				task.wait(0.035)
			end
			if not SP.anim then c.Position = UDim2.fromScale(0.5, 0.5) end
		end)
	end
	SP.oui.Activated:Connect(SP.acheter)
	SP.non.Activated:Connect(function() Boutique.popFerme() end)
	for _, o in v:GetDescendants() do
		if o:IsA("GuiObject") then o.ZIndex = 30 end
	end
	v.ZIndex = 30
	SP.voile, SP.carte = v, c
	SP.trou = inst("Frame", { Name = "Trou", BackgroundColor3 = Color3.fromRGB(10, 7, 22), BorderSizePixel = 0, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 29 })
	inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, SP.trou)
end
-- l'écart entre la case (à l'écran) et la carte posée au centre, en unités de l'interface : d'où elle part, où elle rentre
local function viser(src: GuiObject): (UDim2, number)
	local k = math.max(0.1, SP.carte.AbsoluteSize.X / (620 * SP.echelle.Scale)) -- (l'échelle de la racine de l'interface)
	local vC = SP.voile.AbsolutePosition + SP.voile.AbsoluteSize / 2
	local sC = src.AbsolutePosition + src.AbsoluteSize / 2
	local d = (sC - vC) / k
	return UDim2.new(0.5, d.X, 0.5, d.Y), math.min(1, src.AbsoluteSize.X / k / 620)
end
local TI = TweenInfo.new(0.42, Enum.EasingStyle.Quint, Enum.EasingDirection.Out)
function Boutique.pop(src: GuiObject, i: number, vp: ViewportFrame, pastille: Frame)
	if SP.on or not SP.carte then return end
	local f = Catalogue[i]
	if not f then return end
	SP.on, SP.anim, SP.src, SP.vp, SP.i = true, true, src, vp, i
	local r = RARETE[f.rar] or RARETE.legendaire
	SP.rare.Text, SP.rare.TextColor3 = tr(r[1], r[2]), r[3]
	SP.trait.Color, SP.bande.BackgroundColor3 = r[3], r[3]
	SP.remise.Visible = i == UNE
	SP.nom.Text = Hud.sansAccent(string.upper(FR and f.nom or (f.en or f.nom)))
	SP.desc.Text = FR and (f.desc or "") or (f.descEN or f.desc or "")
	SP.oui.TextScaled = false
	SP.oui.Text = tr("ACHETER", "BUY")
	SP.note.Text = tr("Achat unique, avec tes Robux. À toi pour toujours.", "One-time purchase with your Robux. Yours forever.")
	SP.note.TextColor3 = C.terne
	-- la photo : la caisse 3D de la case passe dans la fenêtre (avec sa caméra), sinon sa pastille de couleur
	SP.modele = vp:FindFirstChildOfClass("Model")
	if SP.modele and vp.CurrentCamera then
		SP.cam = vp.CurrentCamera:Clone()
		SP.cam.Parent = SP.vue
		SP.vue.CurrentCamera = SP.cam
		SP.vue.LightDirection = vp.LightDirection
		SP.modele.Parent = SP.vue
		SP.pastille.Visible = false
	else
		SP.modele = nil
		SP.pastille.Visible = true
		SP.pastille.BackgroundColor3 = pastille.BackgroundColor3
	end
	-- LA CARTE SORT DE LA PAGE : posée au centre, puis partie de la place de la case
	SP.voile.Visible = true
	SP.voile.BackgroundTransparency = 1
	SP.echelle.Scale = 1
	SP.carte.Position = UDim2.fromScale(0.5, 0.5)
	local pos, s = viser(src)
	SP.carte.Position, SP.echelle.Scale = pos, s
	SP.trou.Parent = src
	SP.trou.Visible = true
	Sons.vrai("uiModale", nil, nil, "tap", 1.1, 0.5)
	Hud.vibre(8)
	TweenService:Create(SP.voile, TI, { BackgroundTransparency = 0.32 }):Play()
	TweenService:Create(SP.echelle, TI, { Scale = 1 }):Play()
	local tw = TweenService:Create(SP.carte, TI, { Position = UDim2.fromScale(0.5, 0.5) })
	tw.Completed:Once(function() SP.anim = false end)
	tw:Play()
end
-- elle rentre à sa place, par le même chemin (vite = sans le trajet : la boutique se ferme)
local function rentre()
	if SP.modele and SP.vp then SP.modele.Parent = SP.vp end
	if SP.cam then
		SP.cam:Destroy()
		SP.cam = nil
	end
	SP.modele = nil
	SP.trou.Visible = false
	SP.voile.Visible = false
	SP.on, SP.anim = false, false
end
function Boutique.popFerme(vite: boolean?)
	if not SP.on then return end
	if vite then return rentre() end
	if SP.anim then return end
	SP.anim = true
	Sons.vrai("uiFerme", nil, nil, "tap", 0.9, 0.4)
	local pos, s = viser(SP.src)
	local ti = TweenInfo.new(0.32, Enum.EasingStyle.Quint, Enum.EasingDirection.InOut)
	TweenService:Create(SP.voile, ti, { BackgroundTransparency = 1 }):Play()
	TweenService:Create(SP.echelle, ti, { Scale = s }):Play()
	local tw = TweenService:Create(SP.carte, ti, { Position = pos })
	tw.Completed:Once(rentre)
	tw:Play()
end
local function creer()
	local racine = Hud.racine
	local g = inst("Frame", { Name = "Boutique", BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.03, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 18,
		Active = true }, racine)
	U.racine = g
	K.degrade(g, Color3.fromRGB(58, 16, 70), Color3.fromRGB(10, 7, 24), 80)
	K.texte(g, { italique = true, Text = tr("BOUTIQUE", "SHOP"), TextSize = 78, TextColor3 = C.texte, Size = UDim2.fromOffset(800, 80), Position = UDim2.fromOffset(66, 22),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 4 })
	for i, c in { C.magenta, C.cyan, C.or_ } do
		inst("Frame", { BackgroundColor3 = c, BorderSizePixel = 0, Size = UDim2.fromOffset(i == 1 and 82 or 38, 7), Position = UDim2.fromOffset(72 + (i == 1 and 0 or (i == 2 and 92 or 140)), 108) }, g)
	end

	-- ── L'OFFRE DE LANCEMENT : la caisse à la une ──
	local f = Catalogue[UNE]
	local une = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.new(0.436, 0, 0, 400), Position = UDim2.new(0.043, 0, 0, 136) }, g)
	K.degrade(une, Color3.fromRGB(96, 24, 110), Color3.fromRGB(38, 14, 62), 90)
	inst("UIStroke", { Color = C.magenta, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, une)
	local et = inst("Frame", { BackgroundColor3 = C.magenta, BorderSizePixel = 0, Size = UDim2.fromOffset(318, 44), Position = UDim2.fromOffset(22, 22) }, une)
	inst("UIStroke", { Color = Color3.fromRGB(255, 190, 240), Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, et)
	K.texte(et, { Text = tr("A LA UNE", "FEATURED"), TextSize = 24, TextColor3 = C.texte, Size = UDim2.fromScale(1, 1), TextWrapped = false })
	local rab = inst("Frame", { BackgroundColor3 = C.magenta, BorderSizePixel = 0, Size = UDim2.fromOffset(132, 54), Position = UDim2.new(1, -22, 0, 18), AnchorPoint = Vector2.new(1, 0) }, une)
	inst("UIStroke", { Color = Color3.fromRGB(255, 190, 240), Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, rab)
	K.texte(rab, { Text = "-50%", TextSize = 38, TextColor3 = C.texte, Size = UDim2.fromScale(1, 1), TextWrapped = false, epais = 3 })
	rab.Visible = false
	U.uneVue = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.new(0.46, 0, 0, 230), Position = UDim2.new(0, 10, 0, 86),
		Ambient = Color3.fromRGB(104, 100, 128), LightColor = Color3.fromRGB(226, 216, 204) }, une)
	U.unePastille = inst("Frame", { BorderSizePixel = 0, AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), Size = UDim2.fromOffset(120, 34),
		BackgroundColor3 = Color3.fromHex(string.format("%06x", f.laque)) }, U.uneVue)
	local nom = K.texte(une, { Text = Hud.sansAccent(string.upper(FR and f.nom or (f.en or f.nom))), TextSize = 44, TextColor3 = C.texte, Size = UDim2.new(0.52, -24, 0, 104),
		Position = UDim2.new(0.48, 0, 0, 92), TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, LineHeight = 1.2, epais = 4 })
	if nom then nom.TextWrapped = true end
	local desc = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 22, TextColor3 = C.texte2, TextWrapped = true, Text = FR and f.desc or (f.descEN or f.desc),
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, Size = UDim2.new(0.52, -24, 0, 130), Position = UDim2.new(0.48, 0, 0, 204),
		TextScaled = true }, une)
	inst("UITextSizeConstraint", { MaxTextSize = 22, MinTextSize = 13 }, desc)
	bientot(une, UDim2.new(1, -22, 1, -22), Vector2.new(1, 1), 28)
	local bu = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, une)
	U.une = une
	bu.Activated:Connect(function() Boutique.pop(une, UNE, U.uneVue, U.unePastille) end)

	-- ── LES LEGENDAIRES : la grille ──
	K.texte(g, { Text = tr("LES LEGENDAIRES", "THE LEGENDARIES"), TextSize = 26, TextColor3 = C.terne, Size = UDim2.new(0, 500, 0, 28), Position = UDim2.new(0.5, 0, 0, 100),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.grille = inst("ScrollingFrame", { BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.new(0.457, 0, 1, -150), Position = UDim2.new(0.5, 0, 0, 136),
		CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.Y, ScrollingDirection = Enum.ScrollingDirection.Y, ScrollBarThickness = 6,
		ScrollBarImageColor3 = C.terne }, g)
	inst("UIGridLayout", { CellSize = UDim2.new(0.5, -14, 0, 340), CellPadding = UDim2.fromOffset(16, 18), SortOrder = Enum.SortOrder.LayoutOrder }, U.grille)
	inst("UIPadding", { PaddingTop = UDim.new(0, 4), PaddingLeft = UDim.new(0, 3), PaddingBottom = UDim.new(0, 12) }, U.grille)
	for rang, i in LISTE do
		local fc = Catalogue[i]
		local c = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, LayoutOrder = rang }, U.grille)
		K.degrade(c, Color3.fromRGB(44, 26, 78), Color3.fromRGB(22, 14, 44), 90)
		inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, c)
		inst("Frame", { BackgroundColor3 = C.magenta, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 5) }, c)
		local vp = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.new(1, -16, 0, 190), Position = UDim2.fromOffset(8, 14),
			Ambient = Color3.fromRGB(104, 100, 128), LightColor = Color3.fromRGB(226, 216, 204) }, c)
		local pastille = inst("Frame", { BorderSizePixel = 0, AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), Size = UDim2.fromOffset(96, 28),
			BackgroundColor3 = Color3.fromHex(string.format("%06x", fc.laque)) }, vp)
		local n = K.texte(c, { Text = Hud.sansAccent(string.upper(FR and fc.nom or (fc.en or fc.nom))), TextSize = 28, TextColor3 = C.texte, Size = UDim2.new(1, -32, 0, 32),
			Position = UDim2.fromOffset(18, 220), TextXAlignment = Enum.TextXAlignment.Left, TextScaled = true, epais = 3 })
		inst("UITextSizeConstraint", { MaxTextSize = 28, MinTextSize = 13 }, n)
		bientot(c, UDim2.new(0, 18, 1, -18), Vector2.new(0, 1), 22)
		local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, c)
		cases[rang] = { i = i, vp = vp, pastille = pastille, modele = nil, c = c }
		b.Activated:Connect(function() Boutique.pop(c, i, vp, pastille) end)
	end

	-- ── RETOUR, en bas à gauche (sous le pouce, jamais en haut : la charte) ──
	U.btRetour = K.boutonRetour(g)
	U.btRetour.Activated:Connect(function()
		if SP.on then Boutique.popFerme() else Boutique.fermer() end -- (la fenêtre ouverte se ferme d'abord)
	end)
	for _, o in g:GetDescendants() do
		if o:IsA("GuiObject") then o.ZIndex = 19 end
	end
	creerFenetre(g)
end

function Boutique.init(c: any)
	ctx = c
	creer()
end

-- depuis : "menu" | "mort" | "garage" — l'écran auquel RETOUR ramène
function Boutique.ouvrir(d: string)
	if not U.racine then return end
	depuis = d
	Boutique.ouvert = true
	U.racine.Visible = true
	U.grille.CanvasPosition = Vector2.zero
	if d ~= "garage" then Hud.ecran("boutique") end
	-- les photos : la une d'abord, puis la grille, une par une ; au premier refus (budget) on s'arrête, les pastilles restent
	fileN += 1
	local n = fileN
	task.spawn(function()
		-- (Roblox ne rend pas tout de suite la mémoire des maillages qu'on vient de détruire : la première photo réessaie)
		if not U.uneModele then
			local m = photographier(U.uneVue, UNE, 1.9)
			local essai = 0
			while not m and essai < 5 and n == fileN do
				essai += 1
				task.wait(0.7)
				m = photographier(U.uneVue, UNE, 1.9)
			end
			if n ~= fileN then
				Caisse.rendre(m)
				return
			end
			if not m then return end
			U.uneModele = m
			U.unePastille.Visible = false
		end
		for _, k in cases do
			if n ~= fileN then return end
			if not k.modele then
				if Maillage.libre() < (Catalogue[k.i].triangles or 3000) + 1500 then return end -- (plus de place : les pastilles restent)
				local m = photographier(k.vp, k.i, 1.75)
				if n ~= fileN then
					Caisse.rendre(m)
					return
				end
				if not m then return end
				k.modele = m
				k.pastille.Visible = false
				task.wait()
			end
		end
	end)
end

-- (banc) ouvrir la fenêtre d'une case (0 = la une), presser ACHETER
function Boutique.dbg(quoi: string)
	if quoi == "oui" then
		if SP.acheter then SP.acheter() end
	elseif quoi == "non" then
		Boutique.popFerme()
	else
		local r = tonumber(quoi) or 0
		local k = cases[r]
		if r == 0 or not k then Boutique.pop(U.une, UNE, U.uneVue, U.unePastille) else Boutique.pop(k.c, k.i, k.vp, k.pastille) end
	end
end
function Boutique.fermer()
	if not Boutique.ouvert then return end
	Boutique.ouvert = false
	Boutique.popFerme(true)
	fileN += 1
	U.racine.Visible = false
	-- on rend les maillages (le garage en a besoin pour ses vignettes)
	if U.uneModele then
		Caisse.rendre(U.uneModele)
		U.uneModele = nil
		U.unePastille.Visible = true
	end
	for _, k in cases do
		if k.modele then
			Caisse.rendre(k.modele)
			k.modele = nil
			k.pastille.Visible = true
		end
	end
	if ctx and ctx.retour then ctx.retour(depuis) end
end

return Boutique
