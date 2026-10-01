-- CASH CAR — LE HUD DU SCORE (dans l'écran de course) : la bande de FLOW sous la nitro (le mot, quatre cases, « $×1,3 »),
-- les étiquettes de trait (+NARCISSE / -PSYCHO), l'emblème de la FRÉNÉSIE (trois barres N · M · P et son chrono),
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

	-- ── la bande de FLOW : sous la jauge de nitro, même largeur ──
	local bande = inst("Frame", { Name = "Flow", BackgroundTransparency = 1, Size = UDim2.new(0.46, 52, 0, 20), Position = UDim2.fromOffset(20, 66) }, hud)
	U.flowNom = K.texte(bande, { Text = "FLOW", TextSize = 12, TextColor3 = C.texte, Size = UDim2.fromOffset(118, 20),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	local cases = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, -206, 0, 12), Position = UDim2.fromOffset(122, 4) }, bande)
	U.cases = {}
	for i = 1, 4 do
		local fond = inst("Frame", { BackgroundColor3 = C.piste, BorderSizePixel = 0, Size = UDim2.new(0.25, -4, 1, 0),
			Position = UDim2.fromScale((i - 1) * 0.25, 0) }, cases)
		inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, fond)
		local plein = inst("Frame", { BackgroundColor3 = CEL[i], BorderSizePixel = 0, Size = UDim2.fromScale(0, 1) }, fond)
		U.cases[i] = { fond = fond, plein = plein }
		if i == 4 then
			-- la ZONE ROUGE (88-100) : les 48 derniers % de la case TRIADE
			U.zoneRouge = inst("Frame", { BackgroundColor3 = ROUGE, BackgroundTransparency = 0.55, BorderSizePixel = 0,
				Size = UDim2.fromScale(0.48, 1), Position = UDim2.fromScale(0.52, 0) }, fond)
		end
	end
	U.flowMul = K.texte(bande, { Text = "", TextSize = 12, TextColor3 = Color3.fromRGB(125, 255, 155), Size = UDim2.fromOffset(78, 20),
		Position = UDim2.new(1, 0, 0, 0), AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
	-- les étiquettes de trait, sous le mot FLOW
	U.tags = {}
	for i, t in TRAITS do
		U.tags[t[1]] = { l = K.texte(hud, { Text = "", TextSize = 9, Size = UDim2.fromOffset(120, 14), Position = UDim2.fromOffset(20 + (i - 1) * 124, 90),
			TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false }), fin = 0, signe = 0 }
	end

	-- ── l'AURA et sa chaîne ──
	local bloc = inst("Frame", { Name = "Aura", BackgroundTransparency = 1, Size = UDim2.fromOffset(420, 96), Position = UDim2.fromOffset(20, 110) }, hud)
	local rond = inst("Frame", { BackgroundColor3 = C.nuit, BorderSizePixel = 0, Size = UDim2.fromOffset(30, 30), Rotation = 45, Position = UDim2.fromOffset(4, 4) }, bloc)
	inst("UIStroke", { Color = C.magenta, Thickness = 4, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, rond)
	K.texte(bloc, { Text = "AURA", TextSize = 11, TextColor3 = Color3.fromRGB(255, 200, 250), Size = UDim2.fromOffset(80, 14), Position = UDim2.fromOffset(48, 0),
		TextXAlignment = Enum.TextXAlignment.Left })
	U.aura = K.texte(bloc, { Text = "0", TextSize = 22, TextColor3 = C.texte, Size = UDim2.fromOffset(240, 26), Position = UDim2.fromOffset(48, 14),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	U.auraRec = K.texte(bloc, { Text = "", TextSize = 9, TextColor3 = C.terne, Size = UDim2.fromOffset(300, 12), Position = UDim2.fromOffset(48, 42),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.chaX = K.texte(bloc, { Text = "", TextSize = 26, Size = UDim2.fromOffset(90, 30), Position = UDim2.fromOffset(0, 58),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	U.chaL1 = K.texte(bloc, { Text = "", TextSize = 11, TextColor3 = C.or_, Size = UDim2.fromOffset(320, 14), Position = UDim2.fromOffset(92, 58),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.chaL2 = K.texte(bloc, { Text = "", TextSize = 9, TextColor3 = C.terne, Size = UDim2.fromOffset(320, 12), Position = UDim2.fromOffset(92, 74),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	local fondT = inst("Frame", { BackgroundColor3 = C.piste, BorderSizePixel = 0, Size = UDim2.fromOffset(300, 5), Position = UDim2.fromOffset(92, 90), Visible = false }, bloc)
	U.chaFond = fondT
	U.chaT = inst("Frame", { BackgroundColor3 = C.magenta, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1) }, fondT)
	U.verse = K.texte(bloc, { Text = "", TextSize = 16, TextColor3 = hex("#ff9ee6"), Size = UDim2.fromOffset(240, 20), Position = UDim2.fromOffset(190, 16),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.verse.TextTransparency = 1

	-- ── l'emblème de la FRÉNÉSIE : DARK TRIAD, trois barres, le chrono ──
	local tri = inst("Frame", { Name = "Triade", BackgroundColor3 = Color3.fromRGB(30, 6, 14), BorderSizePixel = 0, Size = UDim2.fromOffset(250, 62),
		Position = UDim2.fromOffset(20, 214), Visible = false }, hud)
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
	U.verse.Position = UDim2.fromOffset(190, 28)
	TweenService:Create(U.verse, K.LENTE, { Position = UDim2.fromOffset(190, 14) }):Play()
	verseFin = os.clock() + 1.1
end

function HudScore.fren(etat: string)
	if etat == "debut" then
		U.triade.Visible = true
		U.triade.Position = UDim2.fromOffset(-260, 214)
		TweenService:Create(U.triade, K.LENTE, { Position = UDim2.fromOffset(20, 214) }):Play()
	elseif etat == "fin" then
		U.triade.Visible = false
	end
end

-- ════════ chaque image ════════
local auraVue = 0
function HudScore.tick(dt: number, mode: string)
	local F, R, CH = Score.FLOW, Score.FREN, Score.CHA
	local t = os.clock()
	-- la bande
	local lv = F.lv
	U.flowNom.Text = (lv == 4) and Score.T("FRENESIE", "FRENZY") or Score.FLOW_NOM[lv]
	U.flowNom.TextColor3 = COL[lv]
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
	U.aura.Text = Hud.entier(auraVue)
	if CH.rec > 0 then
		if a > CH.rec then U.auraRec.Text = "+" .. Hud.entier(a - CH.rec) .. Score.T(" AU-DESSUS", " ABOVE")
		elseif a >= CH.rec * 0.85 then U.auraRec.Text = Score.T("ENCORE ", "ONLY ") .. Hud.entier(CH.rec - a)
		else U.auraRec.Text = "RECORD " .. Hud.entier(CH.rec) end
	else
		U.auraRec.Text = ""
	end
	if CH.n > 0 then
		U.chaX.Text = "×" .. math.max(1, CH.x)
		U.chaX.TextColor3 = hex(Score.X_COUL[CH.x])
		U.chaL1.Text = CH.liste[1] or ""
		U.chaL2.Text = (CH.liste[2] or "") .. "   " .. Hud.entier(CH.pts) .. " PTS"
		U.chaFond.Visible = true
		local q = (mode == "fall") and 1 or math.clamp(CH.t / Score.CHA_FEN, 0, 1)
		q = math.min(q, math.clamp((Score.CHA_VIE - CH.age) / 3, 0, 1)) -- (les 3 dernières secondes de sa vie, la barre se vide)
		U.chaT.Size = UDim2.fromScale(q, 1)
		U.chaT.BackgroundColor3 = (mode ~= "fall" and CH.t < 1.1) and ((math.sin(t * 20) > 0) and ROUGE or C.magenta) or C.magenta
	else
		U.chaX.Text, U.chaL1.Text, U.chaL2.Text = "", "", ""
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
