-- CASH CAR — LE HUD DU SCORE (dans l'écran de course) : la bande de FLOW sous la nitro (le mot, quatre cases, « $×1,3 »),
-- les étiquettes de trait (+STYLE / -VITESSE), l'emblème de la FRÉNÉSIE (trois barres N · M · P et son chrono),
-- le compteur d'AURA et sa chaîne (les deux dernières lignes, le ×, la barre des 3,5 s), l'annonce qui claque (slam),
-- l'éclair d'écran. Tout se lit dans Client/Score (FLOW, FREN, CHA) ; ce module ne fait qu'afficher.
local TweenService = game:GetService("TweenService")
local Hud = require(script.Parent:WaitForChild("Hud"))
local Score = require(script.Parent:WaitForChild("Score"))

local HudScore = {}
local K, C, E = Hud.kit, Hud.C, Hud.E
local inst = K.inst
local U: any = {}
HudScore.U = U

local function hex(h: string?): Color3
	if not h then return C.texte end
	local ok, c = pcall(Color3.fromHex, h)
	return ok and c or C.texte
end
HudScore.hex = hex

local CEL = {}
for i, h in Score.FLOW_CEL do CEL[i] = hex(h) end
local COL = {}
for i = 0, 4 do COL[i] = hex(Score.FLOW_COL[i]) end
local ROUGE = hex("#ff2a3d")
local TRAITS = { { "n", "#ffd75e" }, { "m", "#7dffec" }, { "p", "#ff7a24" } }

function HudScore.creer()
	local hud = E.hud
	-- l'ancien bloc AURA cède la place
	E.aura.Parent.Visible = false
	E.chaine.Visible = false

	-- ── la bande de FLOW (le web couché, 844 × 390, porté sur 720 px) : la vague, la barre de quatre cases sous la jauge de nitro,
	-- « $×1 » au bout, le mot dessous et, à côté du mot, les étiquettes de trait. (Les corps : voir Hud — un caractère = 5/9 du TextSize.) ──
	local bande = inst("Frame", { Name = "Flow", BackgroundTransparency = 1, Size = UDim2.new(0.46, 59, 0, 76), Position = UDim2.fromOffset(30, 94) }, hud)
	U.bande = bande
	U.vague = K.icone(bande, ".........|.##....#.|#..#..#..|....##...|.........|.##....#.|#..#..#..|....##...|.........", 4, COL[1], UDim2.fromOffset(4, -6))
	local cases = inst("Frame", { BackgroundColor3 = hex("#170f55"), BorderSizePixel = 0, Size = UDim2.new(1, -59 - 112, 0, 24), Position = UDim2.fromOffset(59, 0) }, bande)
	inst("Frame", { BackgroundColor3 = hex("#170f55"), BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 4), Position = UDim2.fromScale(0, 1) }, cases) -- l'épaisseur
	U.cases = {}
	for i = 1, 4 do
		local fond = inst("Frame", { BackgroundColor3 = hex("#0d0a2a"), BorderSizePixel = 0, Size = UDim2.new(0.25, -5, 1, -8),
			Position = UDim2.new((i - 1) * 0.25, 4, 0, 4) }, cases)
		local plein = inst("Frame", { BackgroundColor3 = CEL[i], BorderSizePixel = 0, Size = UDim2.fromScale(0, 1) }, fond)
		-- la lèvre claire du haut (les jauges du web sont en bandes, pas en aplat)
		inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.45, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3) }, plein)
		U.cases[i] = { fond = fond, plein = plein }
		if i == 4 then
			-- la ZONE ROUGE (88-100) : les 48 derniers % de la case TRIADE
			U.zoneRouge = inst("Frame", { BackgroundColor3 = ROUGE, BackgroundTransparency = 0.55, BorderSizePixel = 0,
				Size = UDim2.fromScale(0.48, 1), Position = UDim2.fromScale(0.52, 0) }, fond)
		end
	end
	U.flowMul = K.texte(bande, { Text = "", TextSize = 27, TextColor3 = Color3.fromRGB(125, 255, 155), Size = UDim2.fromOffset(112, 28),
		Position = UDim2.new(1, -100, 0, -1), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	U.flowNom = K.texte(bande, { Text = "FLOW", TextSize = 33, TextColor3 = C.texte, Size = UDim2.fromOffset(300, 34), Position = UDim2.fromOffset(59, 36),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	-- les étiquettes de trait, à côté du mot FLOW
	U.tags = {}
	for i, t in TRAITS do
		U.tags[t[1]] = { l = K.texte(hud, { Text = "", TextSize = 20, Size = UDim2.fromOffset(170, 22), Position = UDim2.fromOffset(300 + (i - 1) * 160, 136),
			TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false }), fin = 0, signe = 0 }
	end

	-- ── l'AURA et sa chaîne : LE CHIFFRE du HUD (gros, cerné d'encre), le mot à côté ; dessous les points de la chaîne, le ×, sa
	-- barre des 3,5 s et les deux dernières figures ──
	local bloc = inst("Frame", { Name = "Aura", BackgroundTransparency = 1, Size = UDim2.fromOffset(640, 250), Position = UDim2.fromOffset(26, 172) }, hud)
	U.bloc = bloc
	U.aura = K.texte(bloc, { Text = "0", TextSize = 73, TextColor3 = hex("#f1dcff"), Size = UDim2.fromOffset(640, 76), Position = UDim2.fromOffset(0, 0),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 5, contourCouleur = hex("#1c0430") })
	U.auraMot = K.texte(bloc, { Text = "AURA", TextSize = 30, TextColor3 = Color3.fromRGB(255, 200, 250), Size = UDim2.fromOffset(110, 32), Position = UDim2.fromOffset(54, 26),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	-- (#avRec, L1560) la ligne de l'objectif « encore une » : une JAUGE (110 × 6) qui se remplit vers le record, puis le texte — en OR
	local recF = inst("Frame", { BackgroundColor3 = Color3.new(0, 0, 0), BackgroundTransparency = 0.45, BorderSizePixel = 0, Size = UDim2.fromOffset(110, 6),
		Position = UDim2.fromOffset(4, 80), Visible = false }, bloc)
	U.recTrait = inst("UIStroke", { Color = hex("#ffd75e"), Transparency = 0.7, Thickness = 1, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, recF)
	U.recPlein = inst("Frame", { BackgroundColor3 = hex("#ffd75e"), BorderSizePixel = 0, Size = UDim2.fromScale(0, 1) }, recF)
	U.recF = recF
	U.auraRec = K.texte(bloc, { Text = "", TextSize = 17, TextColor3 = hex("#ffd75e"), Size = UDim2.fromOffset(500, 18), Position = UDim2.fromOffset(124, 74),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	-- (la chaîne dans son propre groupe : elle PÂLIT quand elle dure — voir HudScore.tick)
	local chGr = inst("CanvasGroup", { Name = "Chaine", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, bloc)
	U.chaGr = chGr
	U.chaPts = K.texte(chGr, { Text = "", TextSize = 25, TextColor3 = C.texte2, Size = UDim2.fromOffset(240, 28), Position = UDim2.fromOffset(4, 124),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.chaX = K.texte(chGr, { Text = "", TextSize = 66, Size = UDim2.fromOffset(220, 68), Position = UDim2.fromOffset(70, 98),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 5, contourCouleur = hex("#1c0430") })
	local fondT = inst("Frame", { BackgroundColor3 = hex("#0d0a2a"), BorderSizePixel = 0, Size = UDim2.fromOffset(214, 10), Position = UDim2.fromOffset(4, 168), Visible = false }, chGr)
	U.chaFond = fondT
	U.chaT = inst("Frame", { BackgroundColor3 = C.magenta, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1) }, fondT)
	U.chaL1 = K.texte(chGr, { Text = "", TextSize = 24, TextColor3 = C.texte, Size = UDim2.fromOffset(640, 26), Position = UDim2.fromOffset(4, 186),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.chaL2 = K.texte(chGr, { Text = "", TextSize = 24, TextColor3 = C.terne, Size = UDim2.fromOffset(640, 26), Position = UDim2.fromOffset(4, 214),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.verse = K.texte(bloc, { Text = "", TextSize = 30, TextColor3 = hex("#ff9ee6"), Size = UDim2.fromOffset(300, 32), Position = UDim2.fromOffset(190, 26),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	U.verse.TextTransparency = 1

	-- ── l'emblème de la FRÉNÉSIE : DARK TRIAD, trois barres, le chrono ──
	local tri = inst("Frame", { Name = "Triade", BackgroundColor3 = Color3.fromRGB(30, 6, 14), BorderSizePixel = 0, Size = UDim2.fromOffset(250, 62),
		Position = UDim2.fromOffset(26, 436), Visible = false }, hud)
	inst("UIStroke", { Color = ROUGE, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, tri)
	inst("Frame", { BackgroundColor3 = ROUGE, BorderSizePixel = 0, Size = UDim2.new(0, 5, 1, 0) }, tri)
	K.texte(tri, { Text = "DARK TRIAD", TextSize = 12, TextColor3 = ROUGE, Size = UDim2.fromOffset(150, 16), Position = UDim2.fromOffset(14, 6),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.triChrono = K.texte(tri, { Text = "0:00", TextSize = 12, TextColor3 = C.texte, Size = UDim2.fromOffset(70, 16), Position = UDim2.new(1, -8, 0, 6),
		AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
	U.triBarres = {}
	for i, t in TRAITS do
		local c = hex(t[2])
		K.texte(tri, { Text = string.upper(t[1]), TextSize = 9, TextColor3 = c, Size = UDim2.fromOffset(12, 12), Position = UDim2.fromOffset(14 + (i - 1) * 78, 30),
			TextWrapped = false })
		local fond = inst("Frame", { BackgroundColor3 = C.piste, BorderSizePixel = 0, Size = UDim2.fromOffset(58, 8), Position = UDim2.fromOffset(28 + (i - 1) * 78, 32) }, tri)
		local plein = inst("Frame", { BackgroundColor3 = c, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1) }, fond)
		U.triBarres[t[1]] = { plein = plein, couleur = c }
	end
	U.triade = tri

	-- ── l'annonce qui CLAQUE (slam) et son sous-titre ──
	U.slam = K.texte(hud, { Text = "", TextSize = 44, Size = UDim2.new(1, 0, 0, 60), Position = UDim2.fromScale(0, 0.12), epais = 4, TextWrapped = false })
	U.slamSub = K.texte(hud, { Text = "", TextSize = 14, Size = UDim2.new(1, 0, 0, 20), Position = UDim2.new(0, 0, 0.12, 62), TextWrapped = false })
	U.slamEchelle = inst("UIScale", {}, U.slam)

	-- ── l'éclair d'écran et la lueur des bords (la couleur du palier) ──
	U.eclair = inst("Frame", { Name = "Eclair", BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1), ZIndex = 0 }, hud)
	local bord = inst("Frame", { Name = "Bord", BackgroundTransparency = 1, Size = UDim2.new(1, -16, 1, -16), Position = UDim2.fromOffset(8, 8), ZIndex = 0 }, hud)
	U.bord = inst("UIStroke", { Thickness = 8, Transparency = 1, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, bord)
end

-- ════════ ce que le score fait dire ════════
local slamFin, slamPrio = 0, 0
function HudScore.slam(txt: string, sub: string?, c1: string?, c2: string?, taille: number?, prio: number?)
	local t = os.clock()
	if t < slamFin and (prio or 0) < slamPrio then return end -- une annonce plus importante parle encore
	slamPrio = prio or 0
	slamFin = t + 1.5
	U.slam.Text = txt
	U.slam.TextColor3 = hex(c1)
	U.slam.TextSize = taille or 44
	U.slam.TextTransparency = 0
	U.slamSub.Text = sub or ""
	U.slamSub.TextColor3 = hex(c2 or c1)
	U.slamSub.TextTransparency = 0
	U.slamSub.Position = UDim2.new(0, 0, 0.12, (taille or 44) + 18)
	U.slamEchelle.Scale = 1.7
	TweenService:Create(U.slamEchelle, TweenInfo.new(0.22, Enum.EasingStyle.Quint, Enum.EasingDirection.Out), { Scale = 1 }):Play()
end

-- L'ARGENT QUI TOMBE EN FRÉNÉSIE (frenCash + fx3Tag, L21194 du jeu web) : un « ×3 » JAILLIT de là où l'argent est né (cinq
-- étiquettes recyclées), et le « $×3 » de la bande de flow BAT. Au plus toutes les 90 ms (le pilote s'en charge).
local FX3: any = { i = 0 }
function HudScore.cash3(ecran: Vector2?)
	if not FX3.pool then
		FX3.pool = {}
		for j = 1, 5 do
			FX3.pool[j] = K.texte(U.slam.Parent, { Text = "", TextSize = 22, TextColor3 = hex("#ffd75e"), Size = UDim2.fromOffset(120, 26),
				AnchorPoint = Vector2.new(0.5, 0.5), TextTransparency = 1, TextWrapped = false, epais = 3 })
		end
		FX3.echelle = inst("UIScale", {}, U.flowMul)
	end
	FX3.echelle.Scale = 1.35
	TweenService:Create(FX3.echelle, TweenInfo.new(0.22, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { Scale = 1 }):Play()
	if not ecran then return end
	FX3.i = FX3.i % 5 + 1
	local l: TextLabel = FX3.pool[FX3.i]
	local racine = l.Parent :: GuiObject
	local k = racine.AbsoluteSize.Y / 720 -- (l'interface est à l'échelle : on vise en pixels d'écran, on pose en unités de la racine)
	local x, y = (ecran.X - racine.AbsolutePosition.X) / math.max(0.1, k), (ecran.Y - racine.AbsolutePosition.Y) / math.max(0.1, k)
	l.Text = "×" .. Score.fmtMul(Score.flowMult())
	l.Position = UDim2.fromOffset(x + math.random(-30, 30), y - 20)
	l.TextTransparency = 0
	local st = l:FindFirstChildOfClass("UIStroke")
	if st then st.Transparency = 0 end
	local ti = TweenInfo.new(0.55, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	TweenService:Create(l, ti, { Position = UDim2.fromOffset(l.Position.X.Offset, y - 96), TextTransparency = 1 }):Play()
	if st then TweenService:Create(st, ti, { Transparency = 1 }):Play() end
end

function HudScore.flash(couleur: string, alpha: number?)
	U.eclair.BackgroundColor3 = hex(couleur)
	U.eclair.BackgroundTransparency = 1 - (alpha or 0.5)
	TweenService:Create(U.eclair, TweenInfo.new(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { BackgroundTransparency = 1 }):Play()
end

function HudScore.tag(t: string, signe: number)
	local g = U.tags[t]
	if not g then return end
	local maintenant = os.clock()
	if g.signe == signe and maintenant < g.fin then
		g.fin = maintenant + (signe > 0 and 1.4 or 1.8) -- le même signe ne fait que le prolonger
		return
	end
	g.signe = signe
	g.fin = maintenant + (signe > 0 and 1.4 or 1.8)
	g.l.Text = (signe > 0 and "+" or "-") .. Score.NOM_TRAIT[t]
	g.l.TextColor3 = signe > 0 and Color3.fromRGB(125, 255, 155) or ROUGE
end

local verseFin = 0
function HudScore.verse(g: number)
	U.verse.Text = "+" .. Hud.entier(g)
	U.verse.TextTransparency = 0
	local x = U.auraMot.Position.X.Offset + 4 * 30 * Hud.CHASSE + 16 -- à droite du mot AURA
	U.verse.Position = UDim2.fromOffset(x, 40)
	TweenService:Create(U.verse, K.LENTE, { Position = UDim2.fromOffset(x, 26) }):Play()
	verseFin = os.clock() + 1.1
end

-- ════════ LE TITRE DE LA FRÉNÉSIE : « TRIPLE MONSTER » (frenTitre, L29157 du jeu web) ════════
-- (Sacha, 28/09 : « quand on passe en frénésie, ça doit déclencher l'écriture TRIPLE MONSTER en rouge dégradé, avec une police un peu
-- sataniste, et du sang qui coule du texte ».) Les lettres sont GOTHIQUES, dessinées au pixel (cornes en tête, fûts épais, pieds fendus
-- en pointe), ombrées en bandes rouges (pâle en tête, sang au pied) ; du SANG coule de leurs pieds — des filets qui s'allongent par
-- crans, puis une goutte qui se détache. 2,7 s : la durée exacte du ralenti. Pendant qu'il parle, la grande annonce se tait.
-- (Les grilles sont celles du web, à la lettre ; bâti à la première frénésie.)
local FT_G: { [string]: { string } } = {
	T = { ".#.....#.", "##.....##", "#########", ".#######.", "...###...", "...###...", "...###...", "...###...", "...###...", "...###...", "...###...", "..#####..", ".##...##.", ".#.....#." },
	R = { "#........", "##.......", "#######..", "###..###.", "###...##.", "###..###.", "######...", "###.##...", "###..##..", "###..###.", "###...##.", "###...###", "##.....##", "#.......#" },
	I = { "#...#", "##.##", "#####", ".###.", ".###.", ".###.", ".###.", ".###.", ".###.", ".###.", ".###.", "#####", "##.##", "#...#" },
	P = { "#........", "##.......", "#######..", "###..###.", "###...###", "###..###.", "#######..", "###......", "###......", "###......", "###......", "####.....", "##.......", "#........" },
	L = { "#........", "##.......", "###......", "###......", "###......", "###......", "###......", "###......", "###......", "###......", "###......", "#######.#", "##.....##", "#.......#" },
	E = { "#......#.", "##....##.", "########.", "###......", "###......", "###..#...", "######...", "###..#...", "###......", "###......", "###......", "########.", "##....##.", "#......#." },
	M = { "#.........#", "##.......##", "###.#.#.###", "###########", "###.###.###", "###..#..###", "###.....###", "###.....###", "###.....###", "###.....###", "###.....###", "###.....###", "##.......##", "#.........#" },
	O = { "....#....", "...###...", ".#######.", "###...###", "###...###", "###...###", "###...###", "###...###", "###...###", "###...###", "###...###", ".#######.", "...###...", "....#...." },
	N = { "#.......#", "##.....##", "###...###", "####..###", "###.#.###", "###..####", "###...###", "###...###", "###...###", "###...###", "###...###", "###...###", "##.....##", "#.......#" },
	S = { ".......#.", ".#######.", "###...###", "###....#.", "###......", ".######..", "..######.", "......###", "......###", ".#....###", "###...###", ".#######.", ".#.......", "#........" },
}
-- (les bandes du dégradé : 2 rangées pâles, 4 roses, 4 rouges, 2 sang, 2 sang sombre)
local FT_BANDE = { "#ffe1e4", "#ffe1e4", "#ff6a78", "#ff6a78", "#ff6a78", "#ff6a78", "#ff2a3d", "#ff2a3d", "#ff2a3d", "#ff2a3d", "#c4001f", "#c4001f", "#7a0012", "#7a0012" }
local FT: any = nil
local T_FREN = require(script.Parent.Parent:WaitForChild("Config")).francais() and "FRENESIE" or "FRENZY"
local ftN = 0
local function ftLigne(parent: Instance, mot: string, px: number, nSang: number, graine: number, y0: number): { any }
	local f = inst("Frame", { BackgroundTransparency = 1, AnchorPoint = Vector2.new(0.5, 0), Position = UDim2.new(0.5, 0, 0, y0) }, parent)
	local x = 0
	local pieds: { number } = {}
	for k = 1, #mot do
		local g = FT_G[string.sub(mot, k, k)]
		if g then
			local w = #g[1]
			for y, r in g do
				local a: number? = nil
				for i = 1, w + 1 do
					local on = i <= w and string.sub(r, i, i) == "#"
					if on and not a then a = i end
					if not on and a then
						-- (une ombre d'encre d'une case en bas à droite, puis la case : le cerne du web)
						inst("Frame", { BackgroundColor3 = hex("#1c0408"), BorderSizePixel = 0, Size = UDim2.fromOffset((i - a) * px, px),
							Position = UDim2.fromOffset((x + a - 1) * px + 2, (y - 1) * px + 2), ZIndex = 41 }, f)
						inst("Frame", { BackgroundColor3 = hex(FT_BANDE[y]), BorderSizePixel = 0, Size = UDim2.fromOffset((i - a) * px, px),
							Position = UDim2.fromOffset((x + a - 1) * px, (y - 1) * px), ZIndex = 42 }, f)
						a = nil
					end
				end
			end
			local bas = g[#g]
			for i = 1, w do
				if string.sub(bas, i, i) == "#" then table.insert(pieds, x + i - 1) end -- le sang coule des POINTES des pieds
			end
			x += w + 1
		end
	end
	f.Size = UDim2.fromOffset((x - 1) * px, 14 * px)
	-- le SANG : quelques pieds tirés (graine fixe : le même dessin à chaque frénésie), un filet de 3 à 9 cases, sa goutte au bout
	local r = graine
	local function rnd(): number
		r = (r * 9301 + 49297) % 233280
		return r / 233280
	end
	local sang = {}
	for _ = 1, nSang do
		if #pieds == 0 then break end
		local xx = table.remove(pieds, math.floor(rnd() * #pieds) + 1) :: number
		local l = 3 + math.floor(rnd() * 7)
		local dl = 0.15 + rnd() * 0.5
		local filet = inst("Frame", { BackgroundColor3 = hex("#c4001f"), BorderSizePixel = 0, Size = UDim2.fromOffset(px, 0), Position = UDim2.fromOffset(xx * px, 14 * px), ZIndex = 42 }, f)
		inst("UIGradient", { Rotation = 90, Color = ColorSequence.new(hex("#7a0012"), hex("#ff2a3d")) }, filet)
		local goutte = inst("Frame", { BackgroundColor3 = hex("#ff2a3d"), BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.fromOffset(px * 1.3, px * 1.3), ZIndex = 42 }, f)
		table.insert(sang, { filet = filet, goutte = goutte, l = l, dl = dl, x = xx, px = px })
	end
	return sang
end
function HudScore.frenTitre()
	if not FT then
		local g = inst("CanvasGroup", { Name = "FrenTitre", BackgroundTransparency = 1, Size = UDim2.fromOffset(700, 390), AnchorPoint = Vector2.new(0.5, 0),
			Position = UDim2.fromScale(0.5, 0.28), Visible = false, ZIndex = 40 }, U.slam.Parent)
		local sang = {}
		for _, q in ftLigne(g, "TRIPLE", 6, 4, 7, 6) do table.insert(sang, q) end
		for _, q in ftLigne(g, "MONSTER", 7, 8, 11, 6 + 14 * 6 + 16) do table.insert(sang, q) end
		K.texte(g, { Text = T_FREN, TextSize = 20, TextColor3 = hex("#ffd0d5"), Size = UDim2.new(1, 0, 0, 24), Position = UDim2.fromOffset(0, 6 + 14 * 6 + 16 + 14 * 7 + 18),
			TextWrapped = false, ZIndex = 43 })
		FT = { g = g, sang = sang, echelle = inst("UIScale", {}, g) }
	end
	ftN += 1
	local n = ftN
	local g: CanvasGroup = FT.g
	g.Visible = true
	g.GroupTransparency = 1
	FT.echelle.Scale = 1.8
	TweenService:Create(FT.echelle, TweenInfo.new(0.2, Enum.EasingStyle.Quint, Enum.EasingDirection.Out), { Scale = 1 }):Play()
	-- (pendant qu'il parle, la grande annonce et le verdict de la pose se taisent : UNE voix au centre)
	slamFin, slamPrio = os.clock() + 2.7, 9
	if E.astuce then E.astuce.Visible = false end -- (une carte d'astuce ne passe pas devant le titre)
	U.slam.Text, U.slamSub.Text = "", ""
	local t0 = os.clock()
	task.spawn(function()
		while n == ftN do
			local t = os.clock() - t0
			if t >= 2.7 then break end
			-- l'entrée : il claque, clignote deux fois (0,35 → 0,6 s), tient, puis s'efface sur les 0,38 dernières secondes
			local op = (t < 0.19) and (t / 0.19) or 1
			if t > 0.3 and t < 0.43 then op = 0.25 + 0.75 * math.abs((t - 0.365) / 0.065) end
			if t > 0.43 and t < 0.6 then op = 0.45 + 0.55 * math.abs((t - 0.515) / 0.085) end
			if t > 2.32 then op = math.max(0, 1 - (t - 2.32) / 0.38) end
			g.GroupTransparency = 1 - op
			for _, q in FT.sang do
				-- le filet s'allonge PAR CRANS (8 en 1,3 s), puis la goutte se détache et tombe
				local u = math.clamp((t - q.dl - 0.25) / 1.3, 0, 1)
				q.filet.Size = UDim2.fromOffset(q.px, q.l * q.px * math.floor(u * 8) / 8)
				local v = (t - q.dl - 1.5) / 0.75
				if v > 0 and v < 1 then
					q.goutte.BackgroundTransparency = v
					q.goutte.Position = UDim2.fromOffset(q.x * q.px - q.px * 0.15, (14 + q.l) * q.px + v * v * 5 * q.px)
				else
					q.goutte.BackgroundTransparency = 1
				end
			end
			task.wait()
		end
		if n == ftN then g.Visible = false end
	end)
end

function HudScore.fren(etat: string)
	if etat == "debut" then
		HudScore.frenTitre()
		U.triade.Visible = true
		U.triade.Position = UDim2.fromOffset(-260, 436)
		TweenService:Create(U.triade, K.LENTE, { Position = UDim2.fromOffset(26, 436) }):Play()
	elseif etat == "fin" then
		U.triade.Visible = false
	end
end

-- ════════ chaque image ════════
local auraVue = 0
function HudScore.tick(dt: number, mode: string)
	local F, R, CH = Score.FLOW, Score.FREN, Score.CHA
	local t = os.clock()
	-- l'auto-école garde le haut de l'écran pour elle (web : body.coOn)
	local libre = not E.coach.Visible
	U.bande.Visible = libre
	U.bloc.Visible = libre
	for _, g in U.tags do g.l.Visible = libre end
	-- la bande
	local lv = F.lv
	U.flowNom.Text = (lv == 4) and Score.T("FRENESIE", "FRENZY") or Score.FLOW_NOM[lv]
	U.flowNom.TextColor3 = COL[lv]
	if lv ~= U.vagueLv then
		U.vagueLv = lv
		K.teinter(U.vague, COL[lv])
	end
	U.flowMul.Text = "$×" .. Score.fmtMul(Score.flowMult())
	local revele = F.revele or lv == 4 or R.arme
	local rv = revele and 1 or math.clamp((F.v - 55) / 20, 0, 1)
	for i = 1, 4 do
		local c = U.cases[i]
		local plein = math.clamp((F.v - (i - 1) * 25) / 25, 0, 1)
		c.plein.Size = UDim2.fromScale(plein, 1)
		c.plein.BackgroundColor3 = (lv == 4) and ROUGE or CEL[i]
		if i == 4 then c.fond.BackgroundTransparency = 1 - rv * 0.999; c.fond.Visible = rv > 0.02 end
	end
	U.zoneRouge.BackgroundTransparency = R.arme and (0.2 + 0.3 * math.abs(math.sin(t * 9))) or 0.55
	-- la jauge fuit : le mot clignote ; presque au palier : il bat
	local fuit = (lv < 4) and (F.v > 0 and mode == "drive" and not F.nit and F.idle > Score.F2.grace) or (lv == 4 and mode == "drive" and R.k < 3)
	U.flowNom.TextTransparency = (fuit and F.reste < 1.1 and math.sin(t * 22) > 0) and 0.6 or 0
	U.bord.Color = COL[lv]
	U.bord.Transparency = (lv == 0) and 1 or 1 - (0.25 + 0.15 * lv) * (0.7 + 0.3 * math.sin(t * 3))
	for _, g in U.tags do
		if g.signe ~= 0 and t > g.fin then
			g.signe = 0
			g.l.Text = ""
		elseif g.signe ~= 0 then
			g.l.TextTransparency = (math.sin(t * 14) > 0.4) and 0.5 or 0
		end
	end
	-- la triade
	if lv == 4 then
		for k, b in U.triBarres do
			local mem = (Score.F2.triade :: any)[k]
			local q = math.floor(math.clamp(R.tr[k] / mem, 0, 1) * 20 + 0.5) / 20
			b.plein.Size = UDim2.fromScale(q, 1)
			b.plein.BackgroundColor3 = (q <= 0) and C.terne or b.couleur
			b.plein.BackgroundTransparency = (q > 0 and q < 0.3 and math.sin(t * 16) > 0) and 0.5 or 0
		end
		U.triChrono.Text = Score.mmss(R.t)
		U.triChrono.TextColor3 = R.rec and C.or_ or C.texte
	elseif U.triade.Visible then
		U.triade.Visible = false
	end
	-- l'aura et sa chaîne
	local a = Score.aura()
	auraVue += (a - auraVue) * math.min(1, dt * 7)
	if math.abs(a - auraVue) < 0.5 then auraVue = a end
	local chiffres = Hud.entier(auraVue)
	if chiffres ~= U.aura.Text then
		U.aura.Text = chiffres
		U.auraMot.Position = UDim2.fromOffset(#chiffres * 73 * Hud.CHASSE + 14, 26) -- (police à chasse fixe : le mot suit le chiffre)
	end
	if CH.rec > 0 then
		local pR = math.min(1, a / CH.rec)
		U.recF.Visible = a <= CH.rec
		U.recPlein.Size = UDim2.fromScale(pR, 1)
		U.recTrait.Transparency = (pR >= 0.85) and (0.3 + 0.4 * math.abs(math.sin(os.clock() * 7))) or 0.7 -- (À PORTÉE : la jauge bat)
		U.auraRec.Position = UDim2.fromOffset((a <= CH.rec) and 124 or 4, 74)
		if a > CH.rec then U.auraRec.Text = "+" .. Hud.entier(a - CH.rec) .. Score.T(" AU-DESSUS", " ABOVE")
		elseif a >= CH.rec * 0.85 then U.auraRec.Text = Score.T("ENCORE ", "ONLY ") .. Hud.entier(CH.rec - a)
		else U.auraRec.Text = "RECORD " .. Hud.entier(CH.rec) end
	else
		U.auraRec.Text = ""
		U.recF.Visible = false
	end
	if CH.n > 0 then
		U.chaX.Text = "×" .. math.max(1, CH.x)
		U.chaX.TextColor3 = hex(Score.X_COUL[CH.x])
		-- LE HUD DISCRET (#avCh.discret, L5117) : une chaîne qui dure depuis plus de 3 s sans nouveau maillon PÂLIT (45 %) — un
		-- nouveau geste la rallume
		if CH.n ~= U.chaN then U.chaN, U.chaT0 = CH.n, os.clock() end
		local cibleD = (os.clock() - (U.chaT0 or 0) > 3) and 0.55 or 0
		local gD = U.chaGr.GroupTransparency
		if math.abs(cibleD - gD) > 0.005 then U.chaGr.GroupTransparency = gD + (cibleD - gD) * ((cibleD > gD) and 0.05 or 0.35) end
		U.chaL1.Text = CH.liste[1] or ""
		U.chaL2.Text = CH.liste[2] or ""
		local pts = Hud.entier(CH.pts)
		if pts ~= U.chaPts.Text then
			U.chaPts.Text = pts
			U.chaX.Position = UDim2.fromOffset(#pts * 25 * Hud.CHASSE + 20, 98)
		end
		U.chaFond.Visible = true
		local q = (mode == "fall") and 1 or math.clamp(CH.t / Score.CHA_FEN, 0, 1)
		q = math.min(q, math.clamp((Score.CHA_VIE - CH.age) / 3, 0, 1)) -- (les 3 dernières secondes de sa vie, la barre se vide)
		U.chaT.Size = UDim2.fromScale(q, 1)
		U.chaT.BackgroundColor3 = (mode ~= "fall" and CH.t < 1.1) and ((math.sin(t * 20) > 0) and ROUGE or C.magenta) or C.magenta
	else
		U.chaX.Text, U.chaL1.Text, U.chaL2.Text, U.chaPts.Text = "", "", "", ""
		U.chaGr.GroupTransparency, U.chaN = 0, nil
		U.chaFond.Visible = false
	end
	if U.verse.Text ~= "" and t > verseFin then
		U.verse.TextTransparency = math.min(1, U.verse.TextTransparency + dt * 3)
		if U.verse.TextTransparency >= 1 then U.verse.Text = "" end -- (le contour d'un texte transparent reste visible : on le vide)
	end
	-- l'annonce s'efface
	if U.slam.Text ~= "" and t > slamFin then
		local u = math.min(1, (t - slamFin) / 0.3)
		U.slam.TextTransparency = u
		U.slamSub.TextTransparency = u
		if u >= 1 then
			U.slam.Text, U.slamSub.Text = "", ""
			slamPrio = 0
		end
	end
end

function HudScore.raz()
	auraVue = 0
	U.triade.Visible = false
	U.slam.Text, U.slamSub.Text = "", ""
	for _, g in U.tags do
		g.signe = 0
		g.l.Text = ""
	end
end

return HudScore
