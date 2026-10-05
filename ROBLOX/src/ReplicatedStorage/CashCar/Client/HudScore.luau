-- CASH CAR — LE HUD DU SCORE (dans l'écran de course) : la bande de FLOW sous la nitro (le mot, quatre cases, « $×1,3 »),
-- les étiquettes de trait (+STYLE / -VITESSE), l'emblème de la FRÉNÉSIE (trois barres et son chrono),
-- le compteur d'AURA et sa chaîne (les deux dernières lignes, le ×, la barre des 3,5 s), l'annonce qui claque (slam),
-- l'éclair d'écran. Tout se lit dans Client/Score (FLOW, FREN, CHA) ; ce module ne fait qu'afficher.
--
-- LA REVUE DU HUD (5/10, « le meilleur jeu de Roblox ») — mesurée au banc, PC et téléphone couché :
--   · la bande de FLOW faisait la largeur de la barre de nitro et venait SOUS l'annonce du centre (« TRIPLE MONSTRE » écrit sur
--     « $×1,3 » en 16:9) : elle s'arrête maintenant au tiers de l'écran — le haut du milieu reste à l'annonce ;
--   · les étiquettes de trait flottaient à des places fixes, loin du mot FLOW (jusque sous les textes du centre), vertes ou rouges
--     sans dire QUEL trait : elles se serrent juste après le mot, toujours dans le même ordre, à la couleur de leur trait (le signe
--     garde le vert / le rouge) ; le gain bondit, la faute tremble ;
--   · « 1 197 AURA » se lisait « 1   197 » (en police pixel, l'espace des milliers fait la largeur d'un chiffre) : un blanc fin ;
--   · l'AURA, la chaîne et l'annonce ont l'OMBRE DURE du logo (le pixel en relief) : elles se lisent sur le ciel blanc comme sur
--     la ville de nuit, et chaque gain les fait BONDIR (l'aura qui encaisse, le × qui monte, le palier de flow) ;
--   · l'éclair et la lueur des bords couvraient la zone utile seulement (une bande morte sous les boutons de Roblox, un cadre
--     dur à 8 px du bord) : ils vivent sur un écran à part, bord à bord, et la lueur est un dégradé de néon ;
--   · l'emblème de la frénésie disait N · M · P (les noms d'origine retirés le 5/10) : il dit les initiales des traits du jeu.
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local Hud = require(script.Parent:WaitForChild("Hud"))
local Score = require(script.Parent:WaitForChild("Score"))

local HudScore = {}
local K, C, E = Hud.kit, Hud.C, Hud.E
local inst = K.inst
local CH = Hud.CHASSE
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
local VERT = Color3.fromRGB(125, 255, 155)
local ENCRE_J, FOND_J, CURS_J = hex("170f55"), hex("0d0a2a"), hex("fff6d8") -- (l'encre, le creux et le curseur des jauges du kit)
local TRAITS = { { "n", "#ffd75e" }, { "m", "#7dffec" }, { "p", "#ff7a24" } }
local NOIR = Color3.new(0, 0, 0)
local function sombre(c: Color3, k: number): Color3 return c:Lerp(NOIR, k) end
-- les mesures de la bande (unités de l'interface : un écran fait 720 de haut)
local BX, BY = 30, 94          -- le coin de la bande
local MUL_L = 104              -- la place du « $×1,3 » au bout des cases
local NOM_T, TAG_T = 30, 21    -- le corps du mot FLOW, celui des étiquettes
local QUINT = TweenInfo.new(0.22, Enum.EasingStyle.Quint, Enum.EasingDirection.Out)
local BOND = TweenInfo.new(0.38, Enum.EasingStyle.Back, Enum.EasingDirection.Out) -- (le rebond : réservé aux GAINS)

-- ── L'OMBRE DURE : le texte et sa copie décalée en bas à droite, dans une encre teintée — le relief pixel du logo. Les deux vivent
-- dans une boîte qui porte l'échelle (le bond d'un gain les grandit ensemble) ──
local function duo(parent: Instance, props: { [string]: any }, d: number, cOmbre: Color3): any
	local f = inst("Frame", { BackgroundTransparency = 1, Size = props.Size, Position = props.Position, AnchorPoint = props.AnchorPoint or Vector2.zero }, parent)
	local po = table.clone(props)
	po.Size, po.Position, po.AnchorPoint = UDim2.fromScale(1, 1), UDim2.fromOffset(d, d), Vector2.zero
	po.TextColor3, po.contourCouleur = cOmbre, cOmbre
	local o = K.texte(f, po)
	local pl = table.clone(props)
	pl.Size, pl.Position, pl.AnchorPoint = UDim2.fromScale(1, 1), UDim2.new(), Vector2.zero
	local l = K.texte(f, pl)
	o.ZIndex, l.ZIndex = 1, 2
	return { f = f, l = l, o = o, k = inst("UIScale", {}, f), sl = l:FindFirstChildOfClass("UIStroke"), so = o:FindFirstChildOfClass("UIStroke"), d = d }
end
local function duoTexte(q: any, txt: string)
	q.l.Text = txt
	q.o.Text = txt
end
local function duoAlpha(q: any, a: number)
	q.l.TextTransparency, q.o.TextTransparency = a, a
	if q.sl then q.sl.Transparency = a end
	if q.so then q.so.Transparency = a end
end
local function duoCouleur(q: any, c: Color3, cOmbre: Color3?)
	q.l.TextColor3 = c
	local co = cOmbre or sombre(c, 0.72)
	q.o.TextColor3 = co
	if q.so then q.so.Color = co end
end
-- LE SÉPARATEUR DE MILLIERS en police pixel : une espace (ou la virgule anglaise) y prend la largeur d'un chiffre — « 1 197 » se lisait
-- « 1   197 », deux nombres. Il s'écrit à 40 % du corps : un blanc fin. Rend le texte riche et sa largeur, en caractères pleins.
local function serre(s: string, corps: number): (string, number)
	local n = 0
	local fin = '<font size="' .. math.max(1, math.floor(corps * 0.4 + 0.5)) .. '">'
	local out = string.gsub(s, "[ ,]", function(c: string): string
		n += 1
		return fin .. c .. "</font>"
	end)
	return out, (#s - n) + n * 0.4
end
local function bondir(k: UIScale, de: number, info: TweenInfo?)
	k.Scale = de
	TweenService:Create(k, info or BOND, { Scale = 1 }):Play()
end

function HudScore.creer()
	local hud = E.hud
	-- l'ancien bloc AURA cède la place
	E.aura.Parent.Visible = false
	E.chaine.Visible = false

	-- ── la bande de FLOW : la vague, quatre cases sous la jauge de nitro, « $×1,3 » au bout, le mot dessous et, à côté du mot, les
	-- étiquettes de trait. Elle s'arrête au tiers de l'écran : le haut du MILIEU appartient à l'annonce (slam). ──
	local bande = inst("Frame", { Name = "Flow", BackgroundTransparency = 1, Size = UDim2.new(0.30, 59, 0, 76), Position = UDim2.fromOffset(BX, BY) }, hud)
	U.bande = bande
	U.vague = K.icone(bande, ".........|.##....#.|#..#..#..|....##...|.........|.##....#.|#..#..#..|....##...|.........", 4, COL[1], UDim2.fromOffset(4, -7))
	-- (le cadre des cases a l'épaisseur des jauges du kit, et un CERNE d'encre : il se détache du ciel blanc comme de la nuit)
	local cases = inst("Frame", { BackgroundColor3 = ENCRE_J, BorderSizePixel = 0, Size = UDim2.new(1, -59 - MUL_L, 0, 22), Position = UDim2.fromOffset(59, 0) }, bande)
	inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, cases)
	inst("Frame", { BackgroundColor3 = ENCRE_J, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 5), Position = UDim2.fromScale(0, 1) }, cases) -- l'épaisseur
	U.casesF = cases
	U.cases = {}
	for i = 1, 4 do
		local fond = inst("Frame", { BackgroundColor3 = FOND_J, BorderSizePixel = 0, Size = UDim2.new(0.25, -5, 1, -8),
			Position = UDim2.new((i - 1) * 0.25, 4, 0, 4) }, cases)
		local plein = inst("Frame", { BackgroundColor3 = CEL[i], BorderSizePixel = 0, Size = UDim2.fromScale(0, 1) }, fond)
		-- trois bandes comme la barre de nitro : la lèvre claire en haut, le plein, l'ombre en bas — une case a du volume
		inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.45, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3) }, plein)
		inst("Frame", { BackgroundColor3 = NOIR, BackgroundTransparency = 0.7, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0.32, 0), Position = UDim2.fromScale(0, 0.68) }, plein)
		U.cases[i] = { fond = fond, plein = plein }
		if i == 4 then
			-- la ZONE ROUGE (88-100) : les 48 derniers % de la case TRIADE
			U.zoneRouge = inst("Frame", { BackgroundColor3 = ROUGE, BackgroundTransparency = 0.55, BorderSizePixel = 0,
				Size = UDim2.fromScale(0.48, 1), Position = UDim2.fromScale(0.52, 0) }, fond)
		end
	end
	-- le CURSEUR (celui de la barre de nitro) : où en est la jauge, d'un coup d'œil
	U.curseur = inst("Frame", { BackgroundColor3 = CURS_J, BorderSizePixel = 0, Size = UDim2.new(0, 4, 1, 6), AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0, 0.5), ZIndex = 2, Visible = false }, cases)
	U.flowMul = K.texte(bande, { Text = "", TextSize = 26, TextColor3 = VERT, Size = UDim2.fromOffset(MUL_L, 28), AnchorPoint = Vector2.new(0, 0.5),
		Position = UDim2.new(1, -MUL_L + 12, 0, 12), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	U.mulK = inst("UIScale", {}, U.flowMul)
	U.flowNom = K.texte(bande, { Text = "FLOW", TextSize = NOM_T, TextColor3 = C.texte, Size = UDim2.fromOffset(300, 32), AnchorPoint = Vector2.new(0, 0.5),
		Position = UDim2.fromOffset(59, 52), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	U.nomK = inst("UIScale", {}, U.flowNom)
	-- les étiquettes de trait, juste après le mot FLOW : chacune à SA place (l'œil apprend où regarder), à la couleur de son trait
	U.tags = {}
	for _, t in TRAITS do
		local l = K.texte(hud, { Text = "", RichText = true, TextSize = TAG_T, TextColor3 = hex(t[2]), Size = UDim2.fromOffset(200, 22),
			AnchorPoint = Vector2.new(0, 0.5), Position = UDim2.fromOffset(0, BY + 52), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
		U.tags[t[1]] = { l = l, st = l:FindFirstChildOfClass("UIStroke"), k = inst("UIScale", {}, l), c = hex(t[2]), fin = 0, signe = 0, t0 = 0, x = 0, cible = 0 }
	end

	-- ── l'AURA et sa chaîne : LE CHIFFRE du HUD (gros, cerné d'encre, en relief), le mot à côté ; dessous les points de la chaîne,
	-- le ×, sa barre des 3,5 s et les deux dernières figures ──
	local bloc = inst("Frame", { Name = "Aura", BackgroundTransparency = 1, Size = UDim2.fromOffset(640, 262), Position = UDim2.fromOffset(26, 172) }, hud)
	U.bloc = bloc
	U.aura = duo(bloc, { Text = "0", RichText = true, TextSize = 72, TextColor3 = hex("#fbe9ff"), Size = UDim2.fromOffset(640, 76), AnchorPoint = Vector2.new(0, 0.5),
		Position = UDim2.fromOffset(0, 38), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 5, contourCouleur = hex("#1c0430") }, 5, hex("#6a1460"))
	U.auraMot = K.texte(bloc, { Text = "AURA", TextSize = 24, TextColor3 = hex("#ff9ee6"), Size = UDim2.fromOffset(110, 26), Position = UDim2.fromOffset(54, 43),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3, contourCouleur = hex("#1c0430") })
	-- (#avRec, L1560) la ligne de l'objectif « encore une » : une JAUGE qui se remplit vers le record, puis le texte — en OR
	local recF = inst("Frame", { BackgroundColor3 = FOND_J, BorderSizePixel = 0, Size = UDim2.fromOffset(120, 8),
		Position = UDim2.fromOffset(4, 92), Visible = false }, bloc)
	U.recTrait = inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, recF)
	U.recPlein = inst("Frame", { BackgroundColor3 = hex("#ffd75e"), BorderSizePixel = 0, Size = UDim2.fromScale(0, 1) }, recF)
	inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.5, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 2) }, U.recPlein)
	U.recF = recF
	U.auraRec = K.texte(bloc, { Text = "", TextSize = 17, TextColor3 = hex("#ffd75e"), Size = UDim2.fromOffset(500, 20), Position = UDim2.fromOffset(136, 86),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	-- (la chaîne dans son propre groupe : elle PÂLIT quand elle dure — voir HudScore.tick)
	local chGr = inst("CanvasGroup", { Name = "Chaine", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, bloc)
	U.chaGr = chGr
	U.chaPts = K.texte(chGr, { Text = "", RichText = true, TextSize = 28, TextColor3 = C.texte, Size = UDim2.fromOffset(240, 30), Position = UDim2.fromOffset(4, 142),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	U.chaX = duo(chGr, { Text = "", TextSize = 62, Size = UDim2.fromOffset(240, 66), AnchorPoint = Vector2.new(0, 0.5), Position = UDim2.fromOffset(80, 146),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 5, contourCouleur = hex("#1c0430") }, 4, hex("#3a1050"))
	-- la barre des 3,5 s : une jauge du kit en petit (creux, cerne d'encre, lèvre claire)
	local fondT = inst("Frame", { BackgroundColor3 = FOND_J, BorderSizePixel = 0, Size = UDim2.fromOffset(220, 10), Position = UDim2.fromOffset(4, 186), Visible = false }, chGr)
	inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, fondT)
	U.chaFond = fondT
	U.chaT = inst("Frame", { BackgroundColor3 = C.magenta, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1) }, fondT)
	inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.5, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3) }, U.chaT)
	-- les deux dernières figures : le nom en blanc, ce qu'elle vaut en or (la plus ancienne, plus terne)
	U.chaL1 = K.texte(chGr, { Text = "", RichText = true, TextSize = 21, TextColor3 = C.texte, Size = UDim2.fromOffset(640, 24), Position = UDim2.fromOffset(4, 206),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	U.chaL2 = K.texte(chGr, { Text = "", RichText = true, TextSize = 21, TextColor3 = C.terne, Size = UDim2.fromOffset(640, 24), Position = UDim2.fromOffset(4, 233),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	U.verse = K.texte(bloc, { Text = "", RichText = true, TextSize = 24, TextColor3 = hex("#ffd75e"), Size = UDim2.fromOffset(300, 26), Position = UDim2.fromOffset(190, 43),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3, contourCouleur = hex("#1c0430") })
	U.verseSt = U.verse:FindFirstChildOfClass("UIStroke")
	U.verse.TextTransparency = 1

	-- ── l'emblème de la FRÉNÉSIE : DARK TRIAD, son chrono, trois barres aux couleurs des traits ──
	local tri = inst("Frame", { Name = "Triade", BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.fromOffset(312, 80),
		Position = UDim2.fromOffset(26, 436), Visible = false }, hud)
	inst("UIGradient", { Rotation = 90, Color = ColorSequence.new(Color3.fromRGB(64, 8, 24), Color3.fromRGB(22, 4, 12)) }, tri)
	inst("UIStroke", { Color = ROUGE, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, tri)
	inst("Frame", { BackgroundColor3 = ROUGE, BorderSizePixel = 0, Size = UDim2.new(0, 5, 1, 0) }, tri)
	K.texte(tri, { Text = "DARK TRIAD", TextSize = 17, TextColor3 = hex("#ff5e6e"), Size = UDim2.fromOffset(190, 20), Position = UDim2.fromOffset(16, 11),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	U.triChrono = K.texte(tri, { Text = "0:00", TextSize = 22, TextColor3 = C.texte, Size = UDim2.fromOffset(100, 24), Position = UDim2.new(1, -10, 0, 9),
		AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false, epais = 3 })
	U.triBarres = {}
	for i, t in TRAITS do
		local c = hex(t[2])
		local x = 16 + (i - 1) * 96
		-- (l'initiale du trait se pose au début de chaque frénésie : la langue du joueur n'est connue qu'après la création du HUD)
		local lettre = K.texte(tri, { Text = "", TextSize = 17, TextColor3 = c, Size = UDim2.fromOffset(18, 18),
			Position = UDim2.fromOffset(x, 47), TextWrapped = false, epais = 3 })
		local fond = inst("Frame", { BackgroundColor3 = FOND_J, BorderSizePixel = 0, Size = UDim2.fromOffset(62, 14), Position = UDim2.fromOffset(x + 24, 49) }, tri)
		inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, fond)
		local plein = inst("Frame", { BackgroundColor3 = c, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1) }, fond)
		inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.5, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3) }, plein)
		U.triBarres[t[1]] = { plein = plein, couleur = c, lettre = lettre }
	end
	U.triade = tri

	-- ── l'annonce qui CLAQUE (slam) et son sous-titre : en relief, comme l'aura ──
	-- (ancrée par le MILIEU : elle claque depuis le centre de l'écran — ancrée au coin, le grossissement la faisait glisser de la droite)
	U.slam = duo(hud, { Text = "", TextSize = 44, Size = UDim2.new(1, 0, 0, 60), AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.new(0.5, 0, 0.12, 30),
		epais = 4, TextWrapped = false }, 4, hex("#2a0636"))
	U.slamSub = K.texte(hud, { Text = "", TextSize = 20, Size = UDim2.new(1, 0, 0, 24), Position = UDim2.new(0, 0, 0.12, 62), TextWrapped = false, epais = 3 })
	U.slamSubSt = U.slamSub:FindFirstChildOfClass("UIStroke")
	U.slamEchelle = U.slam.k

	-- ── l'éclair d'écran et la lueur des bords (la couleur du palier) : sur un écran À PART, bord à bord — dans le cadre du HUD, ils
	-- laissaient une bande morte sous les boutons de Roblox et le long de l'encoche ──
	local pg = Players.LocalPlayer:WaitForChild("PlayerGui")
	local ecranHud = hud:FindFirstAncestorOfClass("ScreenGui")
	local fx = inst("ScreenGui", { Name = "CashCarScore", ResetOnSpawn = false, IgnoreGuiInset = true, ScreenInsets = Enum.ScreenInsets.None,
		DisplayOrder = (ecranHud and ecranHud.DisplayOrder or 5) - 1, Enabled = false }, pg)
	U.fx = fx
	-- la lueur : quatre bandes de néon qui s'éteignent vers le centre (un dégradé, pas un cadre)
	U.bords = {}
	for _, d in { { 0, 0, 1, 0.16, 90 }, { 0, 0.84, 1, 0.16, 270 }, { 0, 0, 0.1, 1, 0 }, { 0.9, 0, 0.1, 1, 180 } } do
		local f = inst("Frame", { BackgroundColor3 = COL[1], BackgroundTransparency = 1, BorderSizePixel = 0, Position = UDim2.fromScale(d[1], d[2]),
			Size = UDim2.fromScale(d[3], d[4]) }, fx)
		inst("UIGradient", { Rotation = d[5], Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0), NumberSequenceKeypoint.new(0.18, 0.55),
			NumberSequenceKeypoint.new(1, 1) }) }, f)
		table.insert(U.bords, f)
	end
	U.eclair = inst("Frame", { Name = "Eclair", BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1), ZIndex = 2 }, fx)
end

-- ════════ ce que le score fait dire ════════
local slamFin, slamPrio = 0, 0
function HudScore.slam(txt: string, sub: string?, c1: string?, c2: string?, taille: number?, prio: number?)
	local t = os.clock()
	if t < slamFin and (prio or 0) < slamPrio then return end -- une annonce plus importante parle encore
	slamPrio = prio or 0
	slamFin = t + 1.5
	local ts = taille or 44
	local c = hex(c1)
	duoTexte(U.slam, txt)
	duoCouleur(U.slam, c, sombre(c, 0.78))
	U.slam.l.TextSize, U.slam.o.TextSize = ts, ts
	U.slam.f.Size = UDim2.new(1, 0, 0, ts + 16)
	U.slam.f.Position = UDim2.new(0.5, 0, 0.12, (ts + 16) / 2)
	duoAlpha(U.slam, 0)
	U.slamSub.Text = sub or ""
	U.slamSub.TextColor3 = hex(c2 or c1)
	U.slamSub.TextTransparency = 0
	U.slamSubSt.Transparency = 0
	U.slamSub.Position = UDim2.new(0, 0, 0.12, ts + 20)
	U.slamEchelle.Scale = 1.7
	TweenService:Create(U.slamEchelle, QUINT, { Scale = 1 }):Play()
end

-- L'ARGENT QUI TOMBE EN FRÉNÉSIE (frenCash + fx3Tag, L21194 du jeu web) : un « ×3 » JAILLIT de là où l'argent est né (cinq
-- étiquettes recyclées), et le « $×3 » de la bande de flow BAT. Au plus toutes les 90 ms (le pilote s'en charge).
local FX3: any = { i = 0 }
function HudScore.cash3(ecran: Vector2?)
	if not FX3.pool then
		FX3.pool = {}
		for j = 1, 5 do
			FX3.pool[j] = K.texte(U.slam.f.Parent, { Text = "", TextSize = 26, TextColor3 = hex("#ffd75e"), Size = UDim2.fromOffset(140, 30),
				AnchorPoint = Vector2.new(0.5, 0.5), TextTransparency = 1, TextWrapped = false, epais = 4, contourCouleur = hex("#3a1400") })
		end
	end
	U.mulK.Scale = 1.35
	TweenService:Create(U.mulK, TweenInfo.new(0.22, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { Scale = 1 }):Play()
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

-- les étiquettes se rangent SERRÉES après le mot FLOW, toujours dans le même ordre (STYLE · RUSE · VITESSE) ; quand l'une s'éteint,
-- les suivantes glissent à sa place (police à chasse fixe : les largeurs se calculent). Serrées, elles laissent le milieu à l'annonce.
local function tagsPlacer()
	local x = BX + 59 + utf8.len(U.flowNom.Text) * NOM_T * CH + 22
	for _, t in TRAITS do
		local g = U.tags[t[1]]
		g.cible = math.floor(x + 0.5)
		if g.signe ~= 0 then x += (utf8.len(Score.NOM_TRAIT[t[1]] or "") + 1) * TAG_T * CH + 26 end
	end
end

function HudScore.tag(t: string, signe: number)
	local g = U.tags[t]
	if not g then return end
	local maintenant = os.clock()
	if g.signe == signe and maintenant < g.fin then
		g.fin = maintenant + (signe > 0 and 1.4 or 1.8) -- le même signe ne fait que le prolonger
		return
	end
	local neuve = g.signe == 0
	g.signe = signe
	g.fin = maintenant + (signe > 0 and 1.4 or 1.8)
	g.t0 = maintenant
	tagsPlacer()
	if neuve then g.x = g.cible end -- (une étiquette qui naît se pose d'un coup ; celles qui bougent glissent)
	-- le GAIN : le nom à la couleur du trait, le « + » en vert ; la FAUTE : tout en rouge (elle tremble, puis clignote)
	if signe > 0 then
		g.l.Text = '<font color="#7dff9b">+</font>' .. Score.NOM_TRAIT[t]
		g.l.TextColor3 = g.c
	else
		g.l.Text = "-" .. Score.NOM_TRAIT[t]
		g.l.TextColor3 = ROUGE
	end
	g.l.TextTransparency, g.st.Transparency = 0, 0
	bondir(g.k, signe > 0 and 1.3 or 1.15, QUINT)
end

local verseFin = 0
local function versePlace(y: number): UDim2
	return UDim2.fromOffset(U.auraMot.Position.X.Offset + 4 * 24 * CH + 14, y) -- à droite du mot AURA
end
function HudScore.verse(g: number)
	U.verse.Text = "+" .. (serre(Hud.entier(g), 24))
	U.verse.TextTransparency, U.verseSt.Transparency = 0, 0
	U.verse.Position = versePlace(57)
	TweenService:Create(U.verse, K.LENTE, { Position = versePlace(43) }):Play()
	verseFin = os.clock() + 1.1
	-- l'AURA encaisse : le chiffre BONDIT (la seule célébration du compteur)
	bondir(U.aura.k, 1.22)
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
			Position = UDim2.fromScale(0.5, 0.28), Visible = false, ZIndex = 40 }, U.slam.f.Parent)
		local sang = {}
		for _, q in ftLigne(g, "TRIPLE", 6, 4, 7, 6) do table.insert(sang, q) end
		for _, q in ftLigne(g, "MONSTER", 7, 8, 11, 6 + 14 * 6 + 16) do table.insert(sang, q) end
		K.texte(g, { Text = T_FREN, TextSize = 22, TextColor3 = hex("#ffd0d5"), Size = UDim2.new(1, 0, 0, 26), Position = UDim2.fromOffset(0, 6 + 14 * 6 + 16 + 14 * 7 + 18),
			TextWrapped = false, ZIndex = 43, epais = 3, contourCouleur = hex("#1c0408") })
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
	duoTexte(U.slam, "")
	U.slamSub.Text = ""
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
		for k, b in U.triBarres do b.lettre.Text = string.sub(Score.NOM_TRAIT[k] or "?", 1, 1) end
		U.triade.Visible = true
		U.triade.Position = UDim2.fromOffset(-330, 436)
		TweenService:Create(U.triade, K.LENTE, { Position = UDim2.fromOffset(26, 436) }):Play()
	elseif etat == "fin" then
		U.triade.Visible = false
	end
end

-- (le nom des figures de la chaîne : « VIRAGE SERRE +31 » → le nom en blanc, « +31 » en or)
local function ligneFig(s: string?, terne: boolean): string
	if not s or s == "" then return "" end
	s = string.gsub(string.gsub(string.gsub(s, "&", "&amp;"), "<", "&lt;"), ">", "&gt;") -- (le texte riche : ces trois-là s'échappent)
	local nom, val = string.match(s, "^(.-)%s(%+%d+)$")
	if not nom then return s end
	return nom .. ' <font color="' .. (terne and "#b8962e" or "#ffd75e") .. '">' .. val .. "</font>"
end

-- ════════ chaque image ════════
local auraVue = 0
function HudScore.tick(dt: number, mode: string)
	local F, R, CH9 = Score.FLOW, Score.FREN, Score.CHA
	local t = os.clock()
	-- (l'écran des effets ne vit qu'avec le HUD de course : au menu, à la fin, ni lueur ni éclair)
	local surHud = E.hud.Visible
	if U.fx.Enabled ~= surHud then U.fx.Enabled = surHud end
	-- l'auto-école garde le haut de l'écran pour elle (web : body.coOn)
	local libre = not E.coach.Visible
	U.bande.Visible = libre
	U.bloc.Visible = libre
	-- la bande
	local lv = F.lv
	local nom = (lv == 4) and Score.T("FRENESIE", "FRENZY") or Score.FLOW_NOM[lv]
	if lv ~= U.vagueLv or nom ~= U.flowNom.Text then
		local monte = U.vagueLv ~= nil and lv > U.vagueLv
		U.vagueLv = lv
		U.flowNom.Text = nom
		-- (au repos, « FLOW » n'a rien à dire : il se tient en retrait ; un palier l'allume à sa couleur, et le fait BONDIR)
		U.flowNom.TextColor3 = (lv == 0) and C.texte2 or COL[lv]
		K.teinter(U.vague, (lv == 0) and C.terne or COL[lv])
		U.flowMul.TextColor3 = (lv == 0) and C.texte2 or ((lv == 4) and hex("#ffd75e") or VERT)
		tagsPlacer()
		if monte then
			bondir(U.nomK, 1.45)
			bondir(U.mulK, 1.4)
		end
	end
	local mulTxt = "$×" .. Score.fmtMul(Score.flowMult())
	if U.flowMul.Text ~= mulTxt then U.flowMul.Text = mulTxt end
	local revele = F.revele or lv == 4 or R.arme
	local rv = revele and 1 or math.clamp((F.v - 55) / 20, 0, 1)
	for i = 1, 4 do
		local c = U.cases[i]
		local plein = math.clamp((F.v - (i - 1) * 25) / 25, 0, 1)
		c.plein.Size = UDim2.fromScale(plein, 1)
		c.plein.BackgroundColor3 = (lv == 4) and ROUGE or CEL[i]
		if i == 4 then c.fond.BackgroundTransparency = 1 - rv * 0.999; c.fond.Visible = rv > 0.02 end
		-- le curseur se pose au bout de la case qui se remplit
		if F.v > 0.5 and F.v < 99.5 and (plein < 1 or i == 4) and (plein > 0 or i == 1) and (i < 4 or rv > 0.5) then
			U.curseur.Visible = true
			U.curseur.Position = UDim2.new((i - 1) * 0.25 + plein * 0.25, 4 - 5 * plein, 0.5, 0)
		end
	end
	if F.v <= 0.5 or F.v >= 99.5 then U.curseur.Visible = false end
	U.zoneRouge.BackgroundTransparency = R.arme and (0.2 + 0.3 * math.abs(math.sin(t * 9))) or 0.55
	-- la jauge fuit : le mot clignote ; presque au palier : il bat
	local fuit = (lv < 4) and (F.v > 0 and mode == "drive" and not F.nit and F.idle > Score.F2.grace) or (lv == 4 and mode == "drive" and R.k < 3)
	U.flowNom.TextTransparency = (fuit and F.reste < 1.1 and math.sin(t * 22) > 0) and 0.6 or 0
	-- la lueur des bords : la couleur du palier, qui RESPIRE (rien au repos)
	local aB = (lv == 0) and 0 or (0.14 + 0.08 * lv) * (0.78 + 0.22 * math.sin(t * 3))
	for _, f in U.bords do
		f.BackgroundColor3 = COL[lv]
		f.BackgroundTransparency = 1 - aB
	end
	-- les étiquettes : le gain bondit puis tient ; la faute tremble, puis clignote ; toutes s'effacent sur 0,3 s
	for _, g in U.tags do
		local vis = libre and g.signe ~= 0
		if g.l.Visible ~= vis then g.l.Visible = vis end
		if g.signe ~= 0 and t > g.fin then
			g.signe = 0
			g.l.Text = ""
			tagsPlacer()
		elseif g.signe ~= 0 then
			g.x += ((g.cible or g.x) - g.x) * math.min(1, dt * 22)
			local a = math.clamp((t - (g.fin - 0.3)) / 0.3, 0, 1)
			if g.signe < 0 and t - g.t0 > 0.3 and math.sin(t * 14) > 0.4 then a = math.max(a, 0.5) end
			g.l.TextTransparency, g.st.Transparency = a, a
			local dx = (g.signe < 0 and t - g.t0 < 0.3) and math.floor(math.sin((t - g.t0) * 60) * 4 + 0.5) or 0
			g.l.Position = UDim2.fromOffset(math.floor(g.x + 0.5) + dx, BY + 52)
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
			b.lettre.TextColor3 = (q <= 0) and C.terne or b.couleur
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
	if chiffres ~= U.auraVu then
		U.auraVu = chiffres
		local riche, n = serre(chiffres, 72)
		duoTexte(U.aura, riche)
		U.auraMot.Position = UDim2.fromOffset(math.floor(n * 72 * CH + 18 + 0.5), 43) -- (police à chasse fixe : le mot suit le chiffre)
		-- (5/10, revue : le « +34 » du gain restait où il était né — quand l'aura gagnait un chiffre, il mordait sur le mot : « AUR+34 »)
		U.verse.Position = versePlace(U.verse.Position.Y.Offset)
	end
	if CH9.rec > 0 then
		local pR = math.min(1, a / CH9.rec)
		U.recF.Visible = a <= CH9.rec
		U.recPlein.Size = UDim2.fromScale(pR, 1)
		U.recTrait.Color = (pR >= 0.85) and C.or_:Lerp(C.encre, 0.5 + 0.5 * math.sin(os.clock() * 7)) or C.encre -- (À PORTÉE : le cadre bat)
		U.auraRec.Position = UDim2.fromOffset((a <= CH9.rec) and 136 or 4, 86)
		if a > CH9.rec then U.auraRec.Text = "+" .. Hud.entier(a - CH9.rec) .. Score.T(" AU-DESSUS", " ABOVE")
		elseif a >= CH9.rec * 0.85 then U.auraRec.Text = Score.T("ENCORE ", "ONLY ") .. Hud.entier(CH9.rec - a)
		else U.auraRec.Text = "RECORD " .. Hud.entier(CH9.rec) end
	else
		U.auraRec.Text = ""
		U.recF.Visible = false
	end
	if CH9.n > 0 then
		local x = math.max(1, CH9.x)
		local xTxt = "×" .. x
		if xTxt ~= U.chaX.l.Text then
			local monte = U.xVu ~= nil and x > U.xVu
			U.xVu = x
			duoTexte(U.chaX, xTxt)
			local c = hex(Score.X_COUL[CH9.x])
			duoCouleur(U.chaX, c, sombre(c, 0.7))
			if monte then bondir(U.chaX.k, 1.6) end
		end
		-- LE HUD DISCRET (#avCh.discret, L5117) : une chaîne qui dure depuis plus de 3 s sans nouveau maillon PÂLIT (45 %) — un
		-- nouveau geste la rallume
		if CH9.n ~= U.chaN then
			if U.chaN == nil then
				-- la chaîne NAÎT : elle glisse de la gauche
				U.chaGr.Position = UDim2.fromOffset(-24, 0)
				TweenService:Create(U.chaGr, QUINT, { Position = UDim2.new() }):Play()
			end
			U.chaN, U.chaT0 = CH9.n, os.clock()
		end
		local cibleD = (os.clock() - (U.chaT0 or 0) > 3) and 0.55 or 0
		local gD = U.chaGr.GroupTransparency
		if math.abs(cibleD - gD) > 0.005 then U.chaGr.GroupTransparency = gD + (cibleD - gD) * ((cibleD > gD) and 0.05 or 0.35) end
		local l1, l2 = ligneFig(CH9.liste[1], false), ligneFig(CH9.liste[2], true)
		if l1 ~= U.chaL1.Text then U.chaL1.Text = l1 end
		if l2 ~= U.chaL2.Text then U.chaL2.Text = l2 end
		local pts = Hud.entier(CH9.pts)
		if pts ~= U.ptsVu then
			U.ptsVu = pts
			local riche, n = serre(pts, 28)
			U.chaPts.Text = riche
			U.chaX.f.Position = UDim2.fromOffset(math.floor(n * 28 * CH + 16 + 0.5), 146)
		end
		U.chaFond.Visible = true
		local q = (mode == "fall") and 1 or math.clamp(CH9.t / Score.CHA_FEN, 0, 1)
		q = math.min(q, math.clamp((Score.CHA_VIE - CH9.age) / 3, 0, 1)) -- (les 3 dernières secondes de sa vie, la barre se vide)
		U.chaT.Size = UDim2.fromScale(q, 1)
		U.chaT.BackgroundColor3 = (mode ~= "fall" and CH9.t < 1.1) and ((math.sin(t * 20) > 0) and ROUGE or C.magenta) or C.magenta
	else
		if U.chaN ~= nil then
			duoTexte(U.chaX, "")
			U.chaL1.Text, U.chaL2.Text, U.chaPts.Text, U.ptsVu = "", "", "", nil
			U.chaGr.GroupTransparency, U.chaN, U.xVu = 0, nil, nil
			U.chaFond.Visible = false
		end
	end
	if U.verse.Text ~= "" and t > verseFin then
		local va = math.min(1, U.verse.TextTransparency + dt * 3)
		U.verse.TextTransparency, U.verseSt.Transparency = va, va
		if va >= 1 then U.verse.Text = "" end -- (le contour d'un texte transparent reste visible : on le vide)
	end
	-- l'annonce s'efface
	if U.slam.l.Text ~= "" and t > slamFin then
		local u = math.min(1, (t - slamFin) / 0.3)
		duoAlpha(U.slam, u)
		U.slamSub.TextTransparency, U.slamSubSt.Transparency = u, u
		if u >= 1 then
			duoTexte(U.slam, "")
			U.slamSub.Text = ""
			slamPrio = 0
		end
	end
end

function HudScore.raz()
	auraVue = 0
	U.auraVu = nil
	U.triade.Visible = false
	duoTexte(U.slam, "")
	U.slamSub.Text = ""
	for _, g in U.tags do
		g.signe = 0
		g.l.Text = ""
	end
end

return HudScore
