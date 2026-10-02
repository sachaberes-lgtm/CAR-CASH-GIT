-- CASH CAR — LES EFFETS : tout ce qui gicle, éclate, pleut et tache. Le pilote ANNONCE (Bus), ce module MONTRE.
-- Repris du jeu web (index.html) : les bassins de particules (makePool L23451), sparkBurst (L24352), la gerbe de pose
-- (poseGerbe L24330), le boom d'atterrissage (landBoom L24318), le cratère du météore (L24269), l'explosion « L'ENCRE ET
-- L'OR » (L23535-23755, L24031), les billets (L25607), la pluie de devises (L25765), le jus de fruit (L24236, L28659),
-- la scène du palier de moteur (L37102).
--
-- Sur Roblox un bassin = quelques ParticleEmitter posés sur des points d'attache qu'on déplace avant de tirer.
-- Deux ancres : le MONDE (ce qui reste où c'est né) et la CAISSE (ce qui naît près d'elle au sol part AVEC elle —
-- dans le jeu web l'étincelle hérite de la vitesse de la caisse, sinon elle resterait 30 m derrière en une image).
-- Les vitesses du jeu web sont en m/s : × M pour des studs.
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local Lighting = game:GetService("Lighting")
local GuiService = game:GetService("GuiService")
local AssetService = game:GetService("AssetService")
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Bus = require(script.Parent:WaitForChild("Bus"))
local Hud = require(script.Parent:WaitForChild("Hud"))
local HudScore = require(script.Parent:WaitForChild("HudScore"))
local Sons = require(script.Parent:WaitForChild("Sons"))
local Score = require(script.Parent:WaitForChild("Score"))
local Camera = require(script.Parent:WaitForChild("Camera"))
local M = Config.M
local FR = string.sub(Players.LocalPlayer.LocaleId or "fr", 1, 2) == "fr"
local function tr(fr: string, en: string): string return FR and fr or en end

local Effets = {}
local rnd = Random.new()
local function r(a: number, b: number): number return a + rnd:NextNumber() * (b - a) end
local function hex(h: number): Color3 return Color3.fromRGB(bit32.rshift(h, 16), bit32.band(bit32.rshift(h, 8), 255), bit32.band(h, 255)) end

local TEX_BRAISE = "rbxasset://textures/particles/sparkles_main.dds" -- le cœur brûlant (sparkTex)
local TEX_FEU = "rbxasset://textures/particles/fire_main.dds"
local TEX_FUMEE = "rbxasset://textures/particles/smoke_main.dds"      -- le disque mou (puffTex)

local OR, BLEU, ROSE = hex(0xffd75e), hex(0x5ee6ff), hex(0xff3ec8)
local ENCRE = hex(0x1c0430)
-- le jus de chaque fruit (L19818-19990), dans l'ordre de Config.FRUITS
local JUS = { hex(0xff9ec2), hex(0xffd63a), hex(0xd10f2b), hex(0xff8b12), hex(0x6a4bd8), hex(0xe8253f) }

-- ════════ les ancres ════════
local function ancre(nom: string): Part
	local p = Instance.new("Part")
	p.Name = nom
	p.Anchored = true
	p.CanCollide = false
	p.CanQuery = false
	p.CanTouch = false
	p.CastShadow = false
	p.Transparency = 1
	p.Size = Vector3.new(1, 1, 1)
	p.Parent = workspace
	return p
end
local ancreMonde: Part, ancreCaisse: Part
local cam = workspace.CurrentCamera

-- ════════ les bassins ════════
-- c = la couleur (ou un ColorSequence) · t = la taille (m) · a = { fonduEntree, fonduSortie, tailleNaissance, tailleMort }
-- (en parts de vie, comme fx.a) · op = l'opacité · add = additif · acc = la vraie gravité (m/s²) · frein = la traînée ·
-- etire = une étincelle qui file le long de sa vitesse · caisse = le bassin part avec la caisse
type Regle = { tex: string, c: any, t: number, a: { number }, op: number, add: boolean, acc: number?, frein: number?, etire: boolean?,
	caisse: boolean?, vie: { number }, nb: number?, eclat: number? }
type Bassin = { e: { ParticleEmitter }, a: { Attachment }, i: number }
local BASSINS: { [string]: Bassin } = {}
local function bassin(nom: string, g: Regle)
	local b: Bassin = { e = {}, a = {}, i = 0 }
	for k = 1, g.nb or 4 do
		local a = Instance.new("Attachment")
		a.Name = nom .. k
		a.Parent = g.caisse and ancreCaisse or ancreMonde
		local e = Instance.new("ParticleEmitter")
		e.Name = nom
		e.Enabled = false
		e.Rate = 0
		e.Texture = g.tex
		e.Color = (typeof(g.c) == "ColorSequence") and g.c or ColorSequence.new(g.c)
		e.LightEmission = g.add and 1 or 0
		e.LightInfluence = g.add and 0 or 0.35
		e.Brightness = g.eclat or (g.add and 2 or 1)
		local t = g.t * M
		e.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, t * g.a[3], t * g.a[3] * 0.22), NumberSequenceKeypoint.new(1, t * g.a[4], t * g.a[4] * 0.22) })
		local tr0 = 1 - g.op
		local fi, fo = math.clamp(g.a[1], 0, 0.45), math.clamp(g.a[2], 0.05, 0.5)
		local cles = {}
		if fi > 0.01 then
			table.insert(cles, NumberSequenceKeypoint.new(0, 1))
			table.insert(cles, NumberSequenceKeypoint.new(fi, tr0))
		else
			table.insert(cles, NumberSequenceKeypoint.new(0, tr0))
		end
		table.insert(cles, NumberSequenceKeypoint.new(1 - fo, tr0))
		table.insert(cles, NumberSequenceKeypoint.new(1, 1))
		e.Transparency = NumberSequence.new(cles)
		e.Lifetime = NumberRange.new(g.vie[1], g.vie[2])
		e.Acceleration = Vector3.new(0, -(g.acc or 0) * M, 0)
		e.Drag = g.frein or 0
		e.EmissionDirection = Enum.NormalId.Top
		e.Rotation = NumberRange.new(0, 360)
		e.LockedToPart = g.caisse == true
		if g.etire then
			e.Orientation = Enum.ParticleOrientation.VelocityParallel
			e.Rotation = NumberRange.new(0, 0)
		end
		e.Parent = a
		table.insert(b.a, a)
		table.insert(b.e, e)
	end
	BASSINS[nom] = b
end

-- tirer n particules d'un bassin : au point `pos` (studs), autour de la direction `haut`, entre v0 et v1 m/s,
-- dans un cône de `cone` degrés (180 = la sphère entière) ; vie0/vie1 remplacent la durée de vie du bassin
local function jet(nom: string, pos: Vector3, haut: Vector3, n: number, v0: number, v1: number, cone: number, vie0: number?, vie1: number?)
	local b = BASSINS[nom]
	if not b or n <= 0 then return end
	b.i = b.i % #b.a + 1
	local a, e = b.a[b.i], b.e[b.i]
	local up = (haut.Magnitude > 1e-4) and haut.Unit or Vector3.yAxis
	local droite = up:Cross(Vector3.zAxis)
	if droite.Magnitude < 1e-3 then droite = up:Cross(Vector3.xAxis) end
	a.WorldCFrame = CFrame.fromMatrix(pos, droite.Unit, up)
	e.Speed = NumberRange.new(v0 * M, v1 * M)
	e.SpreadAngle = Vector2.new(cone, cone)
	if vie0 then e.Lifetime = NumberRange.new(vie0, vie1 or vie0) end
	e:Emit(math.floor(n + 0.5))
end
Effets.jet = jet

-- sparkBurst (L24352) : ±sp/2 à plat, 0…0,7·sp vers le haut, 0,28-0,5 s — la gerbe d'étincelles de tout le jeu
local etat: any = {}
local function pres(pos: Vector3): boolean
	return etat.mode == "drive" and etat.carCF ~= nil and (pos - etat.carCF.Position).Magnitude < 8 * M
end
local function etincelles(couleur: string, pos: Vector3, n: number, sp: number, haut: Vector3?)
	local nom = couleur .. (pres(pos) and "C" or "")
	jet(nom, pos, haut or (etat.carCF and etat.carCF.UpVector) or Vector3.yAxis, n, sp * 0.15, sp * 0.75, 58)
end
Effets.etincelles = etincelles

-- ════════ les anneaux : un cercle qui s'ouvre et s'éteint ════════
-- (pas d'image : un cadre rond et son liseré — face à la caméra sur un panneau, ou couché sur la route)
type Anneau = { gui: any, piece: Part?, trait: UIStroke, t: number, dur: number, r0: number, r1: number, pic: number, pw: number, pa: number, vie: boolean, c: Color3?, c1: Color3? }
local anneaux: { Anneau } = {}
local function cercle(parent: Instance, couleur: Color3, epais: number): UIStroke
	local f = Instance.new("Frame")
	f.BackgroundTransparency = 1
	f.Size = UDim2.fromScale(0.94, 0.94)
	f.Position = UDim2.fromScale(0.03, 0.03)
	f.Parent = parent
	local c = Instance.new("UICorner")
	c.CornerRadius = UDim.new(0.5, 0)
	c.Parent = f
	local s = Instance.new("UIStroke")
	s.Color = couleur
	s.Thickness = epais
	s.Parent = f
	return s
end
-- face à la caméra : r0 → r1 mètres en `dur` s, opacité pic·(1−u)^pa, ouverture 1−(1−u)^pw
local function anneauCamera(pos: Vector3, couleur: Color3, r0: number, r1: number, dur: number, delai: number, pic: number)
	task.delay(delai, function()
		local a = Instance.new("Attachment")
		a.WorldPosition = pos
		a.Parent = ancreMonde
		local g = Instance.new("BillboardGui")
		g.LightInfluence = 0
		g.Brightness = 3
		g.Size = UDim2.fromScale(r0 * 2 * M, r0 * 2 * M)
		g.MaxDistance = 4000
		g.Adornee = a
		g.Parent = a
		local trait = cercle(g, couleur, 7)
		table.insert(anneaux, { gui = g, trait = trait, t = 0, dur = dur, r0 = r0, r1 = r1, pic = pic, pw = 2, pa = 2, vie = true })
	end)
end
-- couché sur un plan (la route) : cf = le repère du plan (UpVector = sa normale)
local function anneauSol(cf: CFrame, couleur: Color3, r0: number, r1: number, dur: number, pic: number, pw: number, pa: number, epais: number?, c1: Color3?)
	local p = Instance.new("Part")
	p.Anchored = true
	p.CanCollide = false
	p.CanQuery = false
	p.CanTouch = false
	p.CastShadow = false
	p.Transparency = 1
	p.Size = Vector3.new(r0 * 2 * M, 0.2, r0 * 2 * M)
	p.CFrame = cf
	p.Parent = workspace
	local g = Instance.new("SurfaceGui")
	g.Face = Enum.NormalId.Top
	g.SizingMode = Enum.SurfaceGuiSizingMode.FixedSize
	g.CanvasSize = Vector2.new(512, 512)
	g.LightInfluence = 0
	g.Brightness = 3
	g.Parent = p
	local trait = cercle(g, couleur, epais or 10)
	table.insert(anneaux, { gui = g, piece = p, trait = trait, t = 0, dur = dur, r0 = r0, r1 = r1, pic = pic, pw = pw, pa = pa, vie = true, c = couleur, c1 = c1 })
	return p
end
local function anneauxTick(dt: number)
	for i = #anneaux, 1, -1 do
		local a = anneaux[i]
		a.t += dt
		local u = math.clamp(a.t / a.dur, 0, 1)
		local R = (a.r0 + (a.r1 - a.r0) * (1 - (1 - u) ^ a.pw)) * 2 * M
		if a.piece then
			a.piece.Size = Vector3.new(R, 0.2, R)
		else
			a.gui.Size = UDim2.fromScale(R, R)
		end
		a.trait.Transparency = 1 - a.pic * (1 - u) ^ a.pa
		if a.c1 and a.c then a.trait.Color = a.c:Lerp(a.c1, u) end
		if u >= 1 then
			if a.piece then a.piece:Destroy() else a.gui.Parent:Destroy() end
			table.remove(anneaux, i)
		end
	end
end

-- ════════ l'écran : le flash des BORDS (flashEcran, L28219 — le centre reste clair), les billets qui volent au compteur ════════
local gui: ScreenGui
local bords: { Frame } = {}
-- LES BORDS DE L'IMAGE prennent la couleur de la poussée (nfxTick, L28452) — tant qu'on la TIENT : orange feu 30 %, bleu de
-- réserve 36 %, violet de la nitro infinie, or du pad turbo (plus discret, 14 %). Ils montent vite (×8) et retombent en douceur
-- (×2,6). Quatre bandes à part : le flash des bords (ci-dessous) garde les siennes.
local teinte: { Frame } = {}
local vigBas: Frame? = nil -- la bande du bas de la vignette : pleine sur la ROUTE (le bitume proche plonge dans le sombre), légère ailleurs
local nfx = { edge = 0, c = Color3.fromRGB(255, 122, 36) }
local function teinteTick(dt: number)
	local vit = etat.mode == "drive" or etat.mode == "fall"
	local on = etat.nitroOn == true
	local eT = vit and (on and (etat.bleue and 0.36 or 0.3) or (((etat.boost or 0) > 0) and 0.14 or 0)) or 0
	nfx.edge += (eT - nfx.edge) * math.min(1, dt * ((eT > nfx.edge) and 8 or 2.6))
	local cible = (etat.bleue and Color3.fromRGB(91, 125, 255)) or (on and (etat.infini and Color3.fromRGB(157, 77, 255) or Color3.fromRGB(255, 122, 36))) or Color3.fromRGB(255, 215, 94)
	nfx.c = nfx.c:Lerp(cible, math.min(1, dt * 12))
	-- LE FLOU DU LOINTAIN ne vit qu'en COURSE (le web floute le décor à la vitesse ; son menu, lui, est net)
	do
		local flou = Lighting:FindFirstChild("Lointain")
		if flou then
			local v = ((etat.mode == "drive" or etat.mode == "fall") and not etat.intro) and 0.8 or 0
			local f = flou.FarIntensity + (v - flou.FarIntensity) * math.min(1, dt * 3)
			if math.abs(f - flou.FarIntensity) > 0.002 then flou.FarIntensity = f end
		end
	end
	if vigBas then
		local v = (etat.mode == "drive" and not etat.intro) and 0 or 0.6
		vigBas.BackgroundTransparency += (v - vigBas.BackgroundTransparency) * math.min(1, dt * 4)
	end
	local a = 1 - nfx.edge
	for _, f in teinte do
		if f.BackgroundTransparency ~= a or f.BackgroundColor3 ~= nfx.c then
			f.BackgroundTransparency = a
			f.BackgroundColor3 = nfx.c
		end
	end
end
-- LES FILÉS v2 (drawSpeedLines, L28514) : des traits fins façon anime qui FILENT du milieu vers les bords. Chacun VIT : il naît
-- loin du centre (le milieu reste net), file en 0,2-0,4 s, s'allume et s'éteint en douceur, puis renaît ailleurs. « Un peu » en
-- croisière, beaucoup au boost et à la nitro (chauffés à la couleur de la poussée). + LA GERBE de l'allumage (nfxFiles) : 18 traits
-- qui jaillissent près du centre quand on appuie. Une COMÈTE : tête franche vers l'extérieur, queue qui s'étire vers le centre.
local SLN, GFN = 44, 18
local files: { any } = {}
local gerbe: { any } = {}
local rndF = Random.new(0x2f6b1a3)
local COMETE = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(0.55, 0.45), NumberSequenceKeypoint.new(0.86, 0),
	NumberSequenceKeypoint.new(1, 1) })
local function fileNeuf(parent: Instance): any
	local f = Instance.new("Frame")
	f.Name = "File"
	f.BorderSizePixel = 0
	f.BackgroundColor3 = Color3.new(1, 1, 1)
	f.AnchorPoint = Vector2.new(0.5, 0.5)
	f.Visible = false
	f.ZIndex = 3
	local g = Instance.new("UIGradient")
	g.Transparency = COMETE
	g.Parent = f
	f.Parent = parent
	return { f = f, a = 0, r = 0, v = 0, t = 9, T = 1, l = 0, w = 1, al = 0 }
end
local function filePose(o: any, cx: number, cy: number, k: number, couleur: Color3, alpha: number)
	local ca, sa = math.cos(o.a), math.sin(o.a) * 0.82
	local d9 = math.sqrt(ca * ca + sa * sa)
	local r = o.r + o.v * o.t
	local l = o.l * d9
	local f = o.f
	f.Size = UDim2.fromOffset(l, math.max(1, o.w * 3))
	f.Position = UDim2.fromOffset(cx + ca * r + ca / d9 * l / 2, cy + sa * r + sa / d9 * l / 2)
	f.Rotation = math.deg(math.atan2(sa, ca))
	f.BackgroundColor3 = couleur
	f.BackgroundTransparency = 1 - alpha
	f.Visible = true
end
local function filesTick(dt: number, ecran: Vector2)
	local vit = etat.mode == "drive" or etat.mode == "fall"
	local vc = math.max(60, etat.vmax or 200)
	local nit = etat.nitroOn == true
	local k = vit and (math.max(0, ((etat.kmh or 0) - vc * 0.6) / vc) + (nit and 0.6 or 0)) or 0
	k = math.min(1.35, k)
	local W, H = ecran.X, ecran.Y
	local m9 = math.min(W, H)
	local cx, cy = W / 2, H * 0.46
	local couleur = nit and (etat.bleue and Color3.fromRGB(178, 196, 255) or Color3.fromRGB(255, 208, 160)) or Color3.fromRGB(255, 248, 236)
	local cible = math.floor(k * 30)
	local viv = 0
	for _, o in files do
		if o.t >= o.T then
			if viv >= cible then
				if o.f.Visible then o.f.Visible = false end
				continue
			end
			o.a = rndF:NextNumber() * 6.2832
			o.r = m9 * (0.28 + rndF:NextNumber() * 0.46)
			o.v = m9 * (1.1 + rndF:NextNumber() * 1.3) * (0.6 + 0.4 * k)
			o.t, o.T = 0, 0.22 + rndF:NextNumber() * 0.2
			o.l = (110 + rndF:NextNumber() * 260) * (0.5 + 0.5 * k) * m9 / 390
			o.w = (0.5 + rndF:NextNumber() * 0.8 * math.min(1, k)) * m9 / 390
			o.al = 0.06 + rndF:NextNumber() * 0.14
		end
		o.t += dt
		local u = o.t / o.T
		if u >= 1 then
			o.f.Visible = false
			continue
		end
		viv += 1
		-- (Roblox n'additionne pas la lumière comme le canvas « lighter » du web : un peu plus opaques pour se lire autant)
		filePose(o, cx, cy, k, couleur, math.min(1, o.al * 1.8 * math.sin(u * math.pi) * math.min(1, k + 0.25)))
	end
	for _, o in gerbe do
		if o.t < o.T then
			o.t += dt
			local u = o.t / o.T
			if u > 0 and u < 1 then
				filePose(o, cx, cy, 1, couleur, math.min(1, 0.55 * math.sin(u * math.pi)))
			else
				o.f.Visible = false
			end
		elseif o.f.Visible then
			o.f.Visible = false
		end
	end
end
local function gerbeAllume(ecran: Vector2, k: number)
	local m9 = math.min(ecran.X, ecran.Y)
	for _, o in gerbe do
		o.a = rndF:NextNumber() * 6.2832
		o.r = m9 * (0.12 + rndF:NextNumber() * 0.22)
		o.v = m9 * (2.2 + rndF:NextNumber() * 1.6) * (0.7 + 0.3 * k)
		o.t, o.T = -rndF:NextNumber() * 0.1, 0.2 + rndF:NextNumber() * 0.16
		o.l = (180 + rndF:NextNumber() * 260) * (0.6 + 0.4 * k) * m9 / 390
		o.w = (0.8 + rndF:NextNumber() * 1.1) * m9 / 390
	end
end
local function flashBords(couleur: Color3, alpha: number, duree: number?)
	for _, f in bords do
		f.BackgroundColor3 = couleur
		f.BackgroundTransparency = 1 - alpha
		TweenService:Create(f, TweenInfo.new(duree or 0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { BackgroundTransparency = 1 }):Play()
	end
end
Effets.flashBords = flashBords

-- flyCash (L28860) : n « $ » partent d'un point du monde et filent au compteur d'argent
local compteur: GuiObject? = nil
local function billetsCompteur(pos: Vector3, n: number)
	if not gui or not compteur then return end
	local v, vu = cam:WorldToViewportPoint(pos)
	local x0, y0 = v.X, v.Y
	if not vu or v.Z < 0 then x0, y0 = cam.ViewportSize.X / 2, cam.ViewportSize.Y * 0.6 end
	local cible = compteur.AbsolutePosition + compteur.AbsoluteSize / 2 + GuiService:GetGuiInset()
	for i = 0, n - 1 do
		local l = Instance.new("TextLabel")
		l.BackgroundTransparency = 1
		l.FontFace = Font.new("rbxasset://fonts/families/PressStart2P.json")
		l.Text = "$"
		l.TextSize = 15
		l.TextColor3 = hex(0x8dff9e)
		l.TextStrokeColor3 = hex(0x1c5a2c)
		l.TextStrokeTransparency = 0.3
		l.Size = UDim2.fromOffset(20, 20)
		l.AnchorPoint = Vector2.new(0.5, 0.5)
		l.Position = UDim2.fromOffset(x0 + r(-35, 35), y0 + r(-23, 23))
		l.Parent = gui
		task.delay(0.03 + 0.045 * i, function()
			TweenService:Create(l, TweenInfo.new(0.55, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
				{ Position = UDim2.fromOffset(cible.X, cible.Y), TextTransparency = 1, TextStrokeTransparency = 1, TextSize = 8 }):Play()
			task.delay(0.6, function() l:Destroy() end)
		end)
	end
end
Effets.billetsCompteur = billetsCompteur

-- ════════ les BILLETS en 3D (L25607) : des coupures vertes qui papillonnent ════════
type Billet = { p: Part, v: Vector3, rx: number, ry: number, ph: number, vie: number, cf: CFrame }
local billets: { Billet } = {}
local reserveBillets: { Part } = {}
local MAX_BILLETS = 70
local function pieceBillet(): Part
	local p = table.remove(reserveBillets)
	if p then return p end
	p = Instance.new("Part")
	p.Name = "Billet"
	p.Anchored = true
	p.CanCollide = false
	p.CanQuery = false
	p.CanTouch = false
	p.CastShadow = false
	p.Material = Enum.Material.SmoothPlastic
	p.Color = hex(0x2f9a52)
	p.Size = Vector3.new(0.5 * M, 0.25 * M, 0.02)
	for _, face in { Enum.NormalId.Front, Enum.NormalId.Back } do
		local g = Instance.new("SurfaceGui")
		g.Face = face
		g.SizingMode = Enum.SurfaceGuiSizingMode.FixedSize
		g.CanvasSize = Vector2.new(64, 32)
		g.LightInfluence = 0.6
		g.Parent = p
		local cadre = Instance.new("Frame")
		cadre.BackgroundTransparency = 1
		cadre.Size = UDim2.new(1, -8, 1, -8)
		cadre.Position = UDim2.fromOffset(4, 4)
		cadre.Parent = g
		local s = Instance.new("UIStroke")
		s.Color = hex(0x7fd89a)
		s.Thickness = 2
		s.Parent = cadre
		local t = Instance.new("TextLabel")
		t.BackgroundTransparency = 1
		t.Size = UDim2.fromScale(1, 1)
		t.FontFace = Font.new("rbxasset://fonts/families/PressStart2P.json")
		t.Text = "$"
		t.TextSize = 20
		t.TextColor3 = OR
		t.Parent = g
	end
	return p
end
local function billet(pos: Vector3, v: Vector3, vie: number)
	if #billets >= MAX_BILLETS then return end
	local p = pieceBillet()
	local cf = CFrame.new(pos) * CFrame.Angles(r(0, 6.28), r(0, 6.28), 0)
	p.CFrame = cf
	p.Parent = workspace
	table.insert(billets, { p = p, v = v * M, rx = r(-4.5, 4.5), ry = r(-4.5, 4.5), ph = r(0, 6.28), vie = vie, cf = cf })
end
Effets.billet = billet
local bPieces: { BasePart }, bPoses: { CFrame } = {}, {}
local function billetsTick(dt: number)
	if #billets == 0 then return end
	table.clear(bPieces)
	table.clear(bPoses)
	for i = #billets, 1, -1 do
		local b = billets[i]
		b.vie -= dt
		if b.vie <= 0 then
			b.p.Parent = nil
			table.insert(reserveBillets, b.p)
			table.remove(billets, i)
		else
			b.v = (b.v - Vector3.new(0, 4.5 * M * dt, 0)) * (1 - 0.6 * dt)
			local bal = math.sin(b.ph + b.vie * 6.5)
			local pos = b.cf.Position + b.v * dt + Vector3.new(bal * 1.5 * M * dt, 0, math.cos(1.7 * b.ph + b.vie * 5.1) * 1.1 * M * dt)
			b.cf = CFrame.new(pos) * b.cf.Rotation * CFrame.Angles(b.rx * (0.55 + 0.45 * bal) * dt, b.ry * dt, 0)
			table.insert(bPieces, b.p)
			table.insert(bPoses, b.cf)
		end
	end
	if #bPieces > 0 then workspace:BulkMoveTo(bPieces, bPoses, Enum.BulkMoveMode.FireCFrameChanged) end
end

-- ════════ LA PLUIE DE DEVISES (L25765) : passé un seuil d'argent, il PLEUT des symboles d'or devant la caisse ════════
local DEVISES = { "$", "€", "¥", "£", "₹", "₩", "₽", "฿", "₺", "₪", "₫", "₴", "₦", "₱", "¢" }
local LIGNES_PLUIE = FR and { "IL PLEUT DES BILLETS — PARAPLUIE INUTILE", "LA BANQUE A APPELE : ELLE ABANDONNE", "TON COMPTE A LE VERTIGE", "L'ARGENT TOMBE PLUS VITE QUE TOI" }
	or { "IT'S RAINING CASH — UMBRELLA USELESS", "THE BANK CALLED: IT GIVES UP", "YOUR ACCOUNT IS DIZZY", "MONEY FALLS FASTER THAN YOU" }
type Goutte = { a: Attachment, l: TextLabel, pos: Vector3, v: Vector3, ph: number, vie: number, t: number }
local gouttes: { Goutte } = {}
local reserveGouttes: { Attachment } = {}
local pluie = { t = 0, acc = 0, seuil = 1000 }
local MAX_GOUTTES = 150 -- (le jeu web en lâche 180 par seconde : ici ce sont des panneaux, on en garde ce qu'un téléphone tient)
local function goutte(pos: Vector3)
	if #gouttes >= MAX_GOUTTES then return end
	local a = table.remove(reserveGouttes)
	local l: TextLabel
	if a then
		l = (a:FindFirstChildOfClass("BillboardGui") :: BillboardGui):FindFirstChildOfClass("TextLabel") :: TextLabel
	else
		a = Instance.new("Attachment")
		local g = Instance.new("BillboardGui")
		g.LightInfluence = 0
		g.MaxDistance = 600 * M
		g.Adornee = a
		g.Parent = a
		l = Instance.new("TextLabel")
		l.BackgroundTransparency = 1
		l.Size = UDim2.fromScale(1, 1)
		l.FontFace = Font.new("rbxasset://fonts/families/GothamSSm.json", Enum.FontWeight.Heavy)
		l.TextScaled = true
		l.TextColor3 = OR
		l.TextStrokeColor3 = ENCRE
		l.TextStrokeTransparency = 0
		l.Parent = g
		local d = Instance.new("UIGradient")
		d.Rotation = 90
		d.Color = ColorSequence.new({ ColorSequenceKeypoint.new(0, hex(0xfff3b0)), ColorSequenceKeypoint.new(0.5, hex(0xffd75e)), ColorSequenceKeypoint.new(1, hex(0xb8860b)) })
		d.Parent = l
	end
	local t = r(0.9, 2.6) * M
	local g = a:FindFirstChildOfClass("BillboardGui") :: BillboardGui
	g.Size = UDim2.fromScale(t, t)
	l.Text = DEVISES[rnd:NextInteger(1, #DEVISES)]
	l.TextTransparency = 0
	l.TextStrokeTransparency = 0
	l.Rotation = r(-25, 25)
	a.WorldPosition = pos
	a.Parent = ancreMonde
	table.insert(gouttes, { a = a, l = l, pos = pos, v = Vector3.new(r(-1, 1), -r(2.5, 6), r(-1, 1)) * M, ph = r(0, 6.28), vie = r(3.2, 5), t = 0 })
end
local function pluieTick(dt: number)
	if pluie.t > 0 and etat.carCF then
		pluie.t -= dt
		pluie.acc += 60 * dt
		local cf: CFrame = etat.carCF
		local av = Vector3.new(cf.LookVector.X, 0, cf.LookVector.Z)
		if av.Magnitude < 0.1 then av = Vector3.zAxis end
		av = av.Unit
		while pluie.acc >= 1 do
			pluie.acc -= 1
			goutte(cf.Position + av * (r(12, 72) * M) + Vector3.new(r(-22, 22), r(7, 25), r(-22, 22)) * M)
		end
	end
	for i = #gouttes, 1, -1 do
		local g = gouttes[i]
		g.vie -= dt
		g.t += dt
		if g.vie <= 0 then
			g.a.Parent = nil
			table.insert(reserveGouttes, g.a)
			table.remove(gouttes, i)
		else
			g.pos += g.v * dt + Vector3.new(math.sin(3 * g.t + g.ph), 0, math.cos(2.6 * g.t + g.ph)) * (1.7 * M * dt)
			g.a.WorldPosition = g.pos
			if g.vie < 1 then
				g.l.TextTransparency = 1 - g.vie
				g.l.TextStrokeTransparency = 1 - g.vie
			end
		end
	end
end
local function pluieLance()
	pluie.t = 3
	pluie.acc = 0
	Sons.jouer("encaisse")
	Hud.pop(LIGNES_PLUIE[rnd:NextInteger(1, #LIGNES_PLUIE)], hex(0x7dff9a), 18)
end
Effets.pluie = pluieLance

-- ════════ LE JUS (juiceSplash L24236, juiceScreen L28659 v6) : la gerbe en 3D, et les TACHES qui salissent l'écran ════════
-- (verdict de Sacha sur le jeu web : le jus est GROS et il gêne — c'est voulu, ça se mérite de croquer en rafale)
type Tache = { im: ImageLabel, coule: Frame, t: number, vie: number, R: number, x: number, y: number, vy: number, coul: number }
local taches: { Tache } = {}
local images: { [number]: { any } } = {}
local CEL = 64
-- une tache en pixel art : un pourtour bruité, des gouttes satellites, un liseré d'encre, un cœur plus clair
local function peindreTache(couleur: Color3): any?
	local ok, im = pcall(function() return AssetService:CreateEditableImage({ Size = Vector2.new(CEL, CEL) }) end)
	if not ok or not im then return nil end
	local R = CEL / 4.4
	local cx, cy = CEL / 2, CEL * 0.44
	local n = rnd:NextInteger(9, 13)
	local rayons = {}
	for k = 1, n do rayons[k] = R * r(0.62, 1.17) end
	local sat = {}
	for _ = 1, rnd:NextInteger(3, 5) do
		local ang, d = r(0, 6.28), R * r(1.25, 1.95)
		table.insert(sat, { cx + math.cos(ang) * d, cy + math.sin(ang) * d * 0.9, R * r(0.12, 0.24) })
	end
	local corps = table.create(CEL * CEL, false)
	for y = 0, CEL - 1 do
		for x = 0, CEL - 1 do
			local dx, dy = x + 0.5 - cx, y + 0.5 - cy
			local ang = (math.atan2(dy, dx) / (2 * math.pi)) % 1 * n
			local k = math.floor(ang)
			local f = ang - k
			local rr = rayons[k % n + 1] * (1 - f) + rayons[(k + 1) % n + 1] * f
			local dedans = dx * dx + dy * dy <= rr * rr
			if not dedans then
				for _, s in sat do
					local ex, ey = x + 0.5 - s[1], y + 0.5 - s[2]
					if ex * ex + ey * ey <= s[3] * s[3] then dedans = true; break end
				end
			end
			corps[y * CEL + x + 1] = dedans
		end
	end
	-- la couleur : franche (saturation ≥ 0,78), ni trop sombre ni trop pâle
	local h, s, v = couleur:ToHSV()
	local c = Color3.fromHSV(h, math.max(s, 0.78), math.clamp(v, 0.72, 0.95))
	local clair = c:Lerp(Color3.new(1, 1, 1), 0.38)
	local b = buffer.create(CEL * CEL * 4)
	local function px(x: number, y: number, col: Color3, alpha: number)
		local o = (y * CEL + x) * 4
		buffer.writeu8(b, o, math.floor(col.R * 255))
		buffer.writeu8(b, o + 1, math.floor(col.G * 255))
		buffer.writeu8(b, o + 2, math.floor(col.B * 255))
		buffer.writeu8(b, o + 3, alpha)
	end
	local kx, ky = cx - R * 0.18, cy - R * 0.18
	for y = 0, CEL - 1 do
		for x = 0, CEL - 1 do
			if corps[y * CEL + x + 1] then
				local dx, dy = x + 0.5 - kx, y + 0.5 - ky
				if dx * dx + dy * dy <= (R * 0.5) ^ 2 then px(x, y, clair, 230) else px(x, y, c, 240) end
			else
				-- le liseré d'encre : une case vide qui touche le corps
				local bord = false
				for oy = -1, 1 do
					for ox = -1, 1 do
						local xx, yy = x + ox, y + oy
						if xx >= 0 and xx < CEL and yy >= 0 and yy < CEL and corps[yy * CEL + xx + 1] then bord = true end
					end
				end
				if bord then px(x, y, ENCRE, 255) end
			end
		end
	end
	-- l'éclat : quatre pixels blancs en haut à gauche
	local hx0, hy0 = math.floor(cx - R * 0.45), math.floor(cy - R * 0.45)
	for oy = 0, 1 do
		for ox = 0, 1 do
			if corps[(hy0 + oy) * CEL + hx0 + ox + 1] then px(hx0 + ox, hy0 + oy, Color3.new(1, 1, 1), 255) end
		end
	end
	local ok2 = pcall(function() im:WritePixelsBuffer(Vector2.zero, Vector2.new(CEL, CEL), b) end)
	return ok2 and im or nil
end
local function imageTache(fruit: number): any?
	local l = images[fruit]
	if not l then
		l = {}
		images[fruit] = l
	end
	local k = rnd:NextInteger(1, 3)
	if l[k] == nil then l[k] = peindreTache(JUS[fruit] or JUS[1]) or false end
	return l[k] or nil
end
local function tache(fruit: number, puissance: number)
	if not gui then return end
	local W, H = cam.ViewportSize.X, cam.ViewportSize.Y
	local B = math.min(W, H)
	local R = math.min(112, (0.1 * B + rnd:NextNumber() * 0.1 * B) * (0.8 + 0.45 * puissance))
	-- 35 % dans l'ellipse où l'on conduit, 45 % n'importe où, 20 % repoussées autour
	local x, y
	local tir = rnd:NextNumber()
	local ang = r(0, 6.28)
	if tir < 0.35 then
		local d = math.sqrt(rnd:NextNumber())
		x, y = 0.5 * W + math.cos(ang) * 0.3 * W * d, 0.6 * H + math.sin(ang) * 0.24 * H * d
	elseif tir < 0.8 then
		x, y = r(0, W), r(0, H)
	else
		x, y = 0.5 * W + math.cos(ang) * (0.36 * W + R), 0.6 * H + math.sin(ang) * (0.32 * H + R)
	end
	local couleur = JUS[fruit] or JUS[1]
	local im = Instance.new("ImageLabel")
	im.BackgroundTransparency = 1
	im.AnchorPoint = Vector2.new(0.5, 0.44)
	im.ResampleMode = Enum.ResamplerMode.Pixelated
	im.ImageTransparency = 0.07
	local source = imageTache(fruit)
	if source then
		im.ImageContent = Content.fromObject(source)
	else
		-- (secours : un rond de la couleur du fruit)
		im.BackgroundTransparency = 0.1
		im.BackgroundColor3 = couleur
		local c = Instance.new("UICorner")
		c.CornerRadius = UDim.new(0.5, 0)
		c.Parent = im
	end
	im.ZIndex = 2
	im.Parent = gui
	-- la coulure, sous la tache
	local coule = Instance.new("Frame")
	coule.BorderSizePixel = 0
	coule.BackgroundColor3 = couleur
	coule.AnchorPoint = Vector2.new(0.5, 0)
	coule.Size = UDim2.fromOffset(math.floor(0.3 * R / 4) * 4, 0)
	coule.ZIndex = 1
	coule.Parent = gui
	local s = Instance.new("UIStroke")
	s.Color = ENCRE
	s.Thickness = 2
	s.Parent = coule
	table.insert(taches, { im = im, coule = coule, t = 0, vie = r(1.3, 2), R = R, x = x, y = y, vy = r(12, 34), coul = R * r(0.5, 1.4) })
	while #taches > 10 do -- dix à l'écran au plus : la plus vieille s'en va
		local vieux = table.remove(taches, 1) :: Tache
		vieux.im:Destroy()
		vieux.coule:Destroy()
	end
end
local function tachesTick(dt: number)
	for i = #taches, 1, -1 do
		local t = taches[i]
		t.t += dt
		local u = t.t / t.vie
		if u >= 1 then
			t.im:Destroy()
			t.coule:Destroy()
			table.remove(taches, i)
		else
			-- elle naît en trois marches, tient, puis s'efface ; passé 0,3 s elle glisse par crans de 4 px
			local ech = (t.t < 0.03) and 0.5 or ((t.t < 0.06) and 0.75 or 1)
			local alpha = (u < 0.55) and 0.93 or (((1 - u) / 0.45) ^ 1.5 * 0.93)
			local y = t.y + math.floor(math.max(0, t.t - 0.3) * t.vy / 4) * 4
			local cote = 4.4 * t.R * ech
			t.im.Size = UDim2.fromOffset(cote, cote)
			t.im.Position = UDim2.fromOffset(t.x, y)
			t.im.ImageTransparency = 1 - alpha
			if t.im.BackgroundTransparency < 1 then t.im.BackgroundTransparency = 1 - alpha end
			local l = math.floor(t.coul * u * 1.6 / 4) * 4
			t.coule.Size = UDim2.fromOffset(t.coule.Size.X.Offset, l)
			t.coule.Position = UDim2.fromOffset(t.x, y + t.R * 0.55)
			t.coule.BackgroundTransparency = 1 - alpha
			local trait = t.coule:FindFirstChildOfClass("UIStroke")
			if trait then trait.Transparency = 1 - alpha end
		end
	end
end
local rafale = { n = 0, t = 0 }
local function croque(fruit: number, pos: Vector3, fd: any)
	local t = os.clock()
	rafale.n = (t - rafale.t < 2.6) and math.min(6, rafale.n + 1) or 0
	rafale.t = t
	local boost = fd and fd.boost or 0.5
	local puissance = math.min(1.2, math.min(1, boost / 2) * 0.9 + 0.18 * rafale.n)
	-- la gerbe d'étincelles : la pastèque en fait une fête
	if boost >= 2 then
		etincelles("or", pos, 18, 14)
	elseif boost >= 0.8 then
		etincelles("or", pos, 8, 7)
	else
		etincelles("bleu", pos, 5, 7)
	end
	-- le jus : il gicle de la caisse, à sa couleur
	local b = BASSINS.jus
	local couleur = JUS[fruit] or JUS[1]
	for _, e in b.e do e.Color = ColorSequence.new(couleur:Lerp(Color3.new(1, 1, 1), 0.25), couleur) end
	local origine = etat.carCF and (etat.carCF.Position + etat.carCF.UpVector * (1.4 * M)) or pos
	local k = 0.6 + 0.7 * puissance
	jet("jus", origine, etat.carCF and etat.carCF.UpVector or Vector3.yAxis, 16 + 22 * puissance, 4 * k, 15 * k, 75)
	for _ = 1, 1 + math.min(4, rafale.n) do tache(fruit, puissance) end
end

-- ════════ LA POSE : la gerbe (poseGerbe), le boom d'une figure posée (landBoom), le cratère du météore ════════
local function gerbePose(p: any)
	local cf: CFrame = etat.carCF
	if not cf then return end
	local k = math.min(1, (p.impact or 0) / 9)
	local ns = 12 + math.floor(26 * k + 0.5)
	local nom = ((p.impact or 0) >= 10) and "braiseOC" or "orC"
	local up, lk, rt = cf.UpVector, cf.LookVector, cf.RightVector
	-- les étincelles du châssis : un jet par flanc, vers l'arrière et dehors
	for _, cote in { -1, 1 } do
		local pos = cf.Position + rt * (cote * 0.95 * M) - up * (0.25 * M)
		jet(nom, pos, -lk * 6 + rt * (cote * 4.5 * (0.6 + k)) + up * (1.5 + 2 * k), ns / 2, 3, 12, 32, 0.2, 0.48)
	end
	-- la gomme
	local nd = 4 + math.floor(8 * k + 0.5)
	for _, cote in { -1, 1 } do
		jet("poussiereC", cf.Position + rt * (cote * 1.2 * M) - up * (0.3 * M), -lk * 2.5 + rt * (cote * 4) + up * 0.8, nd / 2, 2, 6.5, 25, 0.4, 0.75)
	end
end
local function boomPose(niveau: number)
	local cf: CFrame = etat.carCF
	if not cf then return end
	Bus.agir.secousse(0.22 + 0.13 * niveau)
	etincelles("or", cf.Position, 16 + 12 * niveau, 11 + 4 * niveau)
	if niveau >= 2 then etincelles("bleu", cf.Position, 10 + 4 * niveau, 10) end
	HudScore.flash("#fff0c8", math.min(0.4, 0.14 + 0.09 * niveau))
end
-- LE CRATÈRE (L24269) : la nitro tenue jusqu'au contact, en piqué à plus de 45° — la route en garde la marque
type Cratere = { trou: Part, t: number }
local crateres: { Cratere } = {}
local function cratere()
	local cf: CFrame = etat.carCF
	if not cf then return end
	local plan = CFrame.fromMatrix(cf.Position + cf.UpVector * (0.09 * M), cf.RightVector, cf.UpVector)
	local trou = Instance.new("Part")
	trou.Name = "Cratere"
	trou.Anchored = true
	trou.CanCollide = false
	trou.CanQuery = false
	trou.CanTouch = false
	trou.CastShadow = false
	trou.Shape = Enum.PartType.Cylinder
	trou.Material = Enum.Material.SmoothPlastic
	trou.Color = Color3.fromRGB(14, 7, 6)
	trou.Transparency = 0.05
	trou.Size = Vector3.new(0.06 * M, 15 * M, 15 * M)
	trou.CFrame = plan * CFrame.Angles(0, 0, math.pi / 2)
	trou.Parent = workspace
	table.insert(crateres, { trou = trou, t = 0 })
	while #crateres > 3 do
		(table.remove(crateres, 1) :: Cratere).trou:Destroy()
	end
	-- le liseré de braise : orange, il refroidit vers le rouge sombre en 3,2 s
	anneauSol(plan + cf.UpVector * (0.05 * M), hex(0xff7a24), 7.2, 7.6, 3.2, 0.9, 1, 1.2, 26, Color3.fromRGB(110, 20, 8))
	-- l'onde de choc
	anneauSol(plan + cf.UpVector * (0.25 * M), hex(0xffe0a0), 2, 24, 0.6, 1, 1, 2, 14)
	etincelles("or", cf.Position, 48, 22)
	etincelles("rose", cf.Position, 20, 16)
	jet("poussiere", cf.Position, cf.UpVector, 26, 8, 24, 80, 0.8, 1.5)
	Bus.agir.secousse(1.1)
	flashBords(Color3.fromRGB(255, 110, 20), 0.65)
	HudScore.slam(tr("IMPACT METEORE", "METEOR IMPACT"), "", "#ffb000", "#ff3924", 40, 3)
	Sons.jouer("explosion", 1.25, 0.5)
end
local function crateresTick(dt: number)
	for i = #crateres, 1, -1 do
		local c = crateres[i]
		c.t += dt
		if c.t > 7 then
			c.trou:Destroy()
			table.remove(crateres, i)
		elseif c.t > 5 then
			c.trou.Transparency = 0.05 + 0.95 * (c.t - 5) / 2
		end
	end
end

-- ════════ L'EXPLOSION — « L'ENCRE ET L'OR » ════════
local boom = { t = 99, pos = Vector3.zero, haut = Vector3.yAxis }
local lueur: PointLight
local lueurA: Attachment
local function spherique(nom: string, c: Vector3, n: number, jx: number, jy: number, v0: number, v1: number, vie0: number, vie1: number)
	-- (le jeu web sème chaque particule dans une boîte ±jx, ±jy : trois foyers suffisent à casser le point unique)
	for _ = 1, 3 do
		jet(nom, c + Vector3.new(r(-jx, jx), r(-jy, jy), r(-jx, jx)) * M, Vector3.yAxis, n / 3, v0, v1, 180, vie0, vie1)
	end
end
local function tetesDeMort(c: Vector3)
	for _ = 1, (rnd:NextNumber() < 0.75) and 1 or 2 do
		local a = Instance.new("Attachment")
		a.WorldPosition = c
		a.Parent = ancreMonde
		local g = Instance.new("BillboardGui")
		g.Size = UDim2.fromScale(1.7 * M, 1.7 * M)
		g.LightInfluence = 0
		g.Adornee = a
		g.Parent = a
		local l = Instance.new("TextLabel")
		l.BackgroundTransparency = 1
		l.Size = UDim2.fromScale(1, 1)
		l.TextScaled = true
		l.Text = "☠"
		l.TextColor3 = Color3.new(1, 1, 1)
		l.TextStrokeColor3 = Color3.new(0, 0, 0)
		l.TextStrokeTransparency = 0
		l.Parent = g
		local v = Vector3.new(r(-5, 5), r(11, 18), r(-5, 5)) * M
		local rot, vr = 0, r(-4.5, 4.5)
		local t = 0
		task.spawn(function()
			while t < 2.2 do
				local dt = task.wait()
				t += dt
				v -= Vector3.new(0, 18 * M * dt, 0)
				a.WorldPosition += v * dt
				rot += vr * dt
				l.Rotation = math.deg(rot)
				if t > 1.6 then
					l.TextTransparency = (t - 1.6) / 0.6
					l.TextStrokeTransparency = (t - 1.6) / 0.6
				end
			end
			a:Destroy()
		end)
	end
end
local function explosion(cause: string, enVol: boolean, chaine: number?)
	local cf: CFrame = etat.carCF
	if not cf then return end
	local c = cf.Position
	-- le centre recule de 2,4 m par rapport à la caméra : la boule ne nous saute pas au visage
	local vue = c - cam.CFrame.Position
	vue = Vector3.new(vue.X, 0, vue.Z)
	if vue.Magnitude > 1e-3 then c += vue.Unit * (2.4 * M) end
	c += Vector3.new(0, 0.4 * M, 0)
	boom.t, boom.pos, boom.haut = 0, c, cf.UpVector
	-- les VOLUTES : trois au cœur tout de suite, quinze en couronne dans les 140 ms
	jet("volute", c, Vector3.yAxis, 3, 1.1, 3.4, 22)
	for k = 1, 5 do
		task.delay(0.028 * k, function()
			local ang, d = r(0, 6.28), r(0.9, 2.4) * M
			jet("voluteCouronne", c + Vector3.new(math.cos(ang) * d, 0.7 * M, math.sin(ang) * d), Vector3.yAxis, 3, 1.1, 3.4, 30)
		end)
	end
	jet("coeurBlanc", c, Vector3.yAxis, 6, 0.5, 2, 180)
	-- les DARDS
	jet("dard", c, Vector3.yAxis, 12, 9, 17, 115)
	-- les ondes : trois face à la caméra, une couchée sur la route
	anneauCamera(c, hex(0xfff3b0), 1, 31, 0.32, 0, 0.85)
	anneauCamera(c, hex(0xff7a24), 1, 21, 0.32, 0.12, 0.7)
	anneauCamera(c, hex(0xff3b2a), 1, 14, 0.32, 0.26, 0.55)
	if not enVol then
		anneauSol(CFrame.fromMatrix(cf.Position + cf.UpVector * (0.25 * M), cf.RightVector, cf.UpVector), hex(0xffc27a), 1.5, 41.5, 0.75, 0.85, 2.4, 1.4, 9)
	end
	-- les éclats et les braises (L24104-24177)
	spherique("langue", c, 44, 2.5, 2, 4, 24, 0.4, 1.1)
	spherique("eclatRouge", c, 32, 3, 2.5, 3, 20, 0.5, 1.3)
	spherique("eclatJaune", c, 40, 3.5, 2.5, 5, 27, 0.3, 0.85)
	spherique("sang", c, 40, 1.5, 1, 6, 28, 0.5, 1.7)
	jet("braiseR", c, Vector3.yAxis, 40, 2, 9, 38, 1, 2.2)
	jet("braiseO", c, Vector3.yAxis, 32, 3, 11, 40, 0.8, 1.8)
	jet("braiseJ", c, Vector3.yAxis, 26, 3, 12, 42, 0.6, 1.5)
	jet("fumee", c, Vector3.yAxis, 50, 1.5, 6.5, 90, 0.9, 2.1)
	for k = 1, 24 do -- la déflagration
		if k % 8 == 0 then jet((k % 16 == 0) and "langue" or "eclatJaune", c, Vector3.yAxis, 8, 6, 32, 180, 0.4, 1.1) end
	end
	-- les répliques : trois éclatements à côté, trois gerbes d'étincelles
	for k, ms in { 0.18, 0.41, 0.64 } do
		task.delay(ms, function()
			local d = c + Vector3.new(r(-5, 5), r(-3, 3), r(-5, 5)) * M
			jet((k % 2 == 0) and "eclatRouge" or "eclatJaune", d, Vector3.yAxis, 32, 4, 20, 180, 0.4, 1)
		end)
	end
	for _, ms in { 0.09, 0.22, 0.35 } do
		task.delay(ms, function()
			jet((rnd:NextNumber() < 0.5) and "or" or "bleu", c + Vector3.new(r(-3, 3), r(-1, 2), r(-3, 3)) * M, Vector3.yAxis, 10, 16 * 0.15, 16 * 0.75, 58)
		end)
	end
	-- une chaîne ouverte part en fumée : l'or s'envole
	if enVol and (chaine or 0) > 0 then jet("or", c, Vector3.yAxis, 44, 24 * 0.15, 24 * 0.75, 58) end
	-- les billets : plus on est riche, plus il en vole
	local n = math.min(60, 8 + math.floor(6 * math.log10(math.max(1, etat.argent or 1))))
	for _ = 1, n do
		billet(c + Vector3.new(r(-1, 1), r(0, 1), r(-1, 1)) * M, Vector3.new(r(-9, 9), r(6, 20), r(-9, 9)), r(1.6, 3))
	end
	tetesDeMort(c)
	-- l'éclair et la lueur
	HudScore.flash("#fff0c8", 0.42)
	lueurA.WorldPosition = c
	lueur.Brightness = 7
	lueur.Enabled = true
end
local colonne = { fumee = 0, braise = 0 }
local function explosionTick(dt: number)
	if boom.t > 3 then return end
	boom.t += dt
	lueur.Brightness = math.max(0, 4.5 - 3 * boom.t)
	if lueur.Brightness <= 0 then lueur.Enabled = false end
	-- la colonne de fumée qui monte, tant que l'écran de fin n'est pas là
	if boom.t < 2.4 then
		colonne.fumee += 11 * dt
		colonne.braise += 7 * dt
		while colonne.fumee >= 1 do
			colonne.fumee -= 1
			jet("fumee", boom.pos + Vector3.new(0, (1 + 3.2 * boom.t) * M, 0), Vector3.yAxis, 1, 4.5, 7, 14, 1.6, 2.5)
		end
		while colonne.braise >= 1 do
			colonne.braise -= 1
			jet("braiseO", boom.pos + Vector3.new(0, (1 + 3.2 * boom.t) * M, 0), Vector3.yAxis, 1, 5, 10, 30, 0.8, 1.4)
		end
	end
end

-- ════════ LE PALIER DE MOTEUR (L37102) : les étincelles de soudure sur le capot, puis l'anneau et la spirale d'or ════════
local palier = { t = 99, c = OR }
local T_SWAP = 1.7
local function palierTick(dt: number)
	if palier.t > T_SWAP then return end
	local cf: CFrame = etat.carCF
	if not cf then return end
	local avant = palier.t
	palier.t += dt
	local u = palier.t / T_SWAP
	if u < 0.4 then
		-- l'assemblage : ça soude, 1,5 m devant, 60 cm au-dessus
		local n = 24 * (1 - u / 0.4) ^ 2 * dt
		if rnd:NextNumber() < n then
			jet("orC", cf.Position + cf.LookVector * (1.5 * M) + cf.UpVector * (0.6 * M), cf.UpVector, 1, 2.6, 6, 40, 0.12, 0.24)
		end
	end
	if u >= 0.38 then
		if avant / T_SWAP < 0.38 then
			anneauSol(CFrame.fromMatrix(cf.Position + cf.UpVector * (0.4 * M), cf.RightVector, cf.UpVector), palier.c, 0.5, 4.3, T_SWAP * 0.62, 0.95, 2, 2, 12)
		end
		local rv = (u - 0.38) / 0.62
		local n = 46 * (1 - 0.55 * rv) * dt * 2
		for _ = 1, math.floor(n + rnd:NextNumber()) do
			local ang = 13 * rv + ((rnd:NextNumber() < 0.5) and 0 or math.pi)
			local R = (1.55 - 0.45 * rv) * M
			local pos = cf.Position + cf.RightVector * (math.cos(ang) * R) + cf.LookVector * (math.sin(ang) * R) + cf.UpVector * (2.3 * rv * M)
			jet("orC", pos, cf.UpVector, 1, 3.2, 5.2, 8, 0.26, 0.46)
		end
	end
end

-- ════════ ce qui dure : les étincelles du drift, la nitro qu'on lâche, les billets du gros moteur ════════
local suivi = { drift = 0, nitroT = 0, nitroOn = false, billetT = 1, nuage = 0 }
local voile: Frame? = nil
local function continuTick(dt: number)
	local cf: CFrame = etat.carCF
	if not cf then return end
	-- DANS UN NUAGE : le voile blanc monte vite, redescend doucement (cloudInS → #cloudFx, 26 % au plus : jouable)
	do
		local k = etat.nuage or 0
		suivi.nuage += (k - suivi.nuage) * math.min(1, dt * ((k > suivi.nuage) and 9 or 3.5))
		if suivi.nuage < 0.004 then suivi.nuage = 0 end
		if voile then voile.BackgroundTransparency = 1 - suivi.nuage * 0.26 end
	end
	-- le DRIFT : la gomme fume, la jante crache (or ; rose au dernier cran)
	if etat.mode == "drive" and etat.driftOn then
		suivi.drift += dt * (10 + 8 * (etat.driftLv or 0))
		while suivi.drift >= 1 do
			suivi.drift -= 1
			local cote = (rnd:NextNumber() < 0.5) and -1 or 1
			local pos = cf.Position - cf.LookVector * (1.5 * M) + cf.RightVector * (cote * 0.95 * M) - cf.UpVector * (0.3 * M)
			jet(((etat.driftLv or 0) >= 3) and "roseC" or "orC", pos, -cf.LookVector * 2 + cf.UpVector, rnd:NextInteger(1, 3), 5 * 0.2, 7 * 0.8, 45)
			jet("poussiereC", pos, -cf.LookVector + cf.UpVector * 0.5, 1, 1, 3, 30, 0.4, 0.75)
		end
	end
	-- la nitro qu'on LÂCHE (nitroEteint, L27803) : une bouffée, si elle a été tenue au moins 0,25 s
	if etat.nitroOn then
		suivi.nitroT += dt
	elseif suivi.nitroOn and suivi.nitroT >= 0.25 then
		local pos = cf.Position - cf.LookVector * (2.3 * M) + cf.UpVector * (0.1 * M)
		jet("flammeC", pos, -cf.LookVector, 8, 9, 18, 14, 0.1, 0.18)
		jet("braiseOC", pos, -cf.LookVector * 3 + cf.UpVector, 4, 4, 9, 25, 0.2, 0.35)
	end
	if not etat.nitroOn then suivi.nitroT = 0 end
	suivi.nitroOn = etat.nitroOn == true
	-- un GROS moteur (palier 12 et plus) sème des billets en roulant (L36059)
	if (etat.tier or 0) >= 12 and (etat.mode == "drive" or etat.mode == "fall") and math.abs(etat.vA or 0) > 15 then
		suivi.billetT -= dt
		if suivi.billetT <= 0 then
			suivi.billetT = r(0.28, 0.68)
			local cote = (rnd:NextNumber() < 0.5) and -1 or 1
			local vit = cf.RightVector * (cote * 2.5) - cf.LookVector * 5 + cf.UpVector * r(1.5, 3.5)
			-- (elles naissent avec l'élan de la caisse : sans ça elles seraient déjà 30 m derrière)
			local elan = cf.LookVector * (math.abs(etat.vA or 0) * Config.SPD * 0.82)
			billet(cf.Position + cf.RightVector * (cote * 1.1 * M) + cf.UpVector * (0.6 * M), vit + elan, 1.4)
		end
	end
	-- la pluie de devises : un seuil d'argent, qui s'éloigne (× 2,6) à chaque averse
	if (etat.mode == "drive" or etat.mode == "fall") and (etat.argent or 0) >= pluie.seuil then
		pluie.seuil *= 2.6
		pluieLance()
	end
end

-- ════════ le branchement ════════
function Effets.init(ctx: { compteur: GuiObject? }?)
	if ancreMonde then return end
	compteur = ctx and ctx.compteur or nil
	ancreMonde = ancre("FxMonde")
	ancreMonde.CFrame = CFrame.new(0, 0, 0)
	ancreCaisse = ancre("FxCaisse")
	lueurA = Instance.new("Attachment")
	lueurA.Parent = ancreMonde
	lueur = Instance.new("PointLight")
	lueur.Color = hex(0xff9540)
	lueur.Range = 60
	lueur.Brightness = 0
	lueur.Enabled = false
	lueur.Shadows = false
	lueur.Parent = lueurA

	-- l'écran des effets, SOUS le HUD : les bords qui flashent, les taches de jus, les billets qui filent au compteur
	gui = Instance.new("ScreenGui")
	gui.Name = "CashCarEffets"
	gui.IgnoreGuiInset = true
	gui.ResetOnSpawn = false
	local ecranHud = Hud.racine and Hud.racine:FindFirstAncestorOfClass("ScreenGui")
	gui.DisplayOrder = (ecranHud and ecranHud.DisplayOrder or 0) - 1
	gui.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")
	-- quatre bandes dégradées vers le centre : le flash reste aux bords
	for _, d in { { 0, 0, 1, 0.3, 90 }, { 0, 0.7, 1, 0.3, 270 }, { 0, 0, 0.26, 1, 0 }, { 0.74, 0, 0.26, 1, 180 } } do
		local f = Instance.new("Frame")
		f.BorderSizePixel = 0
		f.BackgroundTransparency = 1
		f.Position = UDim2.fromScale(d[1], d[2])
		f.Size = UDim2.fromScale(d[3], d[4])
		f.ZIndex = 5
		f.Parent = gui
		local g = Instance.new("UIGradient")
		g.Rotation = d[5]
		g.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0), NumberSequenceKeypoint.new(1, 1) })
		g.Parent = f
		table.insert(bords, f)
	end
	for _, d in { { 0, 0, 1, 0.34, 90 }, { 0, 0.66, 1, 0.34, 270 }, { 0, 0, 0.3, 1, 0 }, { 0.7, 0, 0.3, 1, 180 } } do
		local f = Instance.new("Frame")
		f.Name = "TeinteNitro"
		f.BorderSizePixel = 0
		f.BackgroundTransparency = 1
		f.Position = UDim2.fromScale(d[1], d[2])
		f.Size = UDim2.fromScale(d[3], d[4])
		f.ZIndex = 4
		f.Parent = gui
		local g = Instance.new("UIGradient")
		g.Rotation = d[5]
		g.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0), NumberSequenceKeypoint.new(0.45, 0.7), NumberSequenceKeypoint.new(1, 1) })
		g.Parent = f
		table.insert(teinte, f)
	end
	for _ = 1, SLN do table.insert(files, fileNeuf(gui)) end
	for _ = 1, GFN do table.insert(gerbe, fileNeuf(gui)) end

	-- LA VIGNETTE (uVigK/uVigC de l'ACES du jeu web : bleu nuit, discrète) : quatre bandes fixes, plus sombres en bas (le bitume)
	for _, d in { { 0, 0, 1, 0.22, 90, 0.7 }, { 0, 0.5, 1, 0.5, 270, 0.1 }, { 0, 0, 0.22, 1, 0, 0.62 }, { 0.78, 0, 0.22, 1, 180, 0.62 } } do -- (le bas BIEN plus sombre : sur le web le bitume proche plonge dans le bleu nuit — mesuré (16,25,36) en bas d'image contre (110,105,140) à mi-route)
		local f = Instance.new("Frame")
		f.Name = "Vignette"
		f.BorderSizePixel = 0
		f.BackgroundColor3 = Color3.fromRGB(20, 14, 48)
		f.BackgroundTransparency = 0
		f.Position = UDim2.fromScale(d[1], d[2])
		f.Size = UDim2.fromScale(d[3], d[4])
		f.ZIndex = 1
		f.Parent = gui
		local g = Instance.new("UIGradient")
		g.Rotation = d[5]
		g.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, d[6]), NumberSequenceKeypoint.new(0.4, (d[6] < 0.2) and 0.42 or 0.9), NumberSequenceKeypoint.new(0.75, (d[6] < 0.2) and 0.86 or 0.97), NumberSequenceKeypoint.new(1, 1) })
		g.Parent = f
		if d[6] < 0.2 then
			vigBas = f
			f.BackgroundTransparency = 0.6
		end
	end

	voile = Instance.new("Frame")
	voile.Name = "Voile"
	voile.BorderSizePixel = 0
	voile.BackgroundColor3 = Color3.fromRGB(240, 246, 255)
	voile.BackgroundTransparency = 1
	voile.Size = UDim2.fromScale(1, 1)
	voile.ZIndex = 0
	voile.Parent = gui
	-- les bassins (la table des pools du jeu web, L23474-24235). Le suffixe C = le même, qui part avec la caisse.
	local etinc = { 0, 0.45, 1, 0.5 }
	for _, c in { { "or", OR, 16 }, { "bleu", BLEU, 12 }, { "rose", ROSE, 12 } } do
		for _, verrou in { false, true } do
			bassin(c[1] .. (verrou and "C" or ""), { tex = TEX_BRAISE, c = c[2], t = 0.55, a = etinc, op = 1, add = true, acc = c[3], etire = true,
				caisse = verrou, vie = { 0.28, 0.5 }, nb = 6, eclat = 3 })
		end
	end
	bassin("jus", { tex = TEX_BRAISE, c = JUS[1], t = 0.62, a = { 0, 0.45, 1, 0.6 }, op = 1, add = true, acc = 55, etire = true, caisse = true, vie = { 0.22, 0.48 }, nb = 3, eclat = 2.5 })
	for _, verrou in { false, true } do
		bassin("poussiere" .. (verrou and "C" or ""), { tex = TEX_FUMEE, c = hex(0x9d95b6), t = 0.55, a = { 0.2, 0.5, 0.55, 2.6 }, op = 0.3, add = false,
			caisse = verrou, vie = { 0.4, 0.75 }, nb = 4 })
	end
	bassin("flammeC", { tex = TEX_FEU, c = hex(0xff9030), t = 1.4, a = { 0, 0.5, 1, 0.35 }, op = 0.8, add = true, caisse = true, vie = { 0.1, 0.18 }, nb = 2 })
	bassin("braiseOC", { tex = TEX_BRAISE, c = hex(0xff8a20), t = 0.5, a = { 0.05, 0.45, 1, 0.5 }, op = 1, add = true, acc = 13, etire = true, caisse = true, vie = { 0.2, 0.48 }, nb = 4, eclat = 3 })
	-- l'explosion
	local feu = ColorSequence.new({
		ColorSequenceKeypoint.new(0, hex(0xfff4d0)), ColorSequenceKeypoint.new(0.08, hex(0xffc640)), ColorSequenceKeypoint.new(0.22, hex(0xff7a24)),
		ColorSequenceKeypoint.new(0.66, hex(0xb3160c)), ColorSequenceKeypoint.new(0.81, hex(0x2e2428)), ColorSequenceKeypoint.new(1, hex(0x2e2428)) })
	bassin("volute", { tex = TEX_FUMEE, c = feu, t = 7.6, a = { 0.05, 0.38, 0.55, 1 }, op = 0.96, add = false, vie = { 1.05, 1.75 }, nb = 1, eclat = 2.2 })
	bassin("voluteCouronne", { tex = TEX_FUMEE, c = feu, t = 5.6, a = { 0.05, 0.38, 0.5, 1 }, op = 0.94, add = false, vie = { 1.05, 1.75 }, nb = 6, eclat = 2 })
	bassin("coeurBlanc", { tex = TEX_FEU, c = Color3.new(1, 0.95, 0.8), t = 4.2, a = { 0, 0.5, 0.6, 1.2 }, op = 0.9, add = true, vie = { 0.25, 0.4 }, nb = 1, eclat = 4 })
	bassin("dard", { tex = TEX_BRAISE, c = hex(0xffd08a), t = 2.2, a = { 0, 0.5, 0.6, 1.3 }, op = 0.95, add = true, etire = true, vie = { 0.26, 0.46 }, nb = 1, eclat = 4 })
	bassin("langue", { tex = TEX_FEU, c = hex(0xff7a24), t = 1.3, a = { 0, 0.5, 1, 0.45 }, op = 1, add = true, etire = true, vie = { 0.4, 1.1 }, nb = 4 })
	bassin("eclatRouge", { tex = TEX_BRAISE, c = hex(0xff3b2a), t = 0.9, a = { 0.03, 0.5, 1, 0.5 }, op = 1, add = true, etire = true, vie = { 0.5, 1.3 }, nb = 6, eclat = 3 })
	bassin("eclatJaune", { tex = TEX_BRAISE, c = hex(0xffd94a), t = 1.05, a = { 0, 0.5, 1, 0.5 }, op = 1, add = true, etire = true, vie = { 0.3, 0.85 }, nb = 6, eclat = 3 })
	bassin("sang", { tex = TEX_BRAISE, c = hex(0xa31212), t = 0.85, a = { 0, 0.4, 1, 0.8 }, op = 1, add = false, acc = 22, etire = true, vie = { 0.5, 1.7 }, nb = 3 })
	bassin("braiseR", { tex = TEX_BRAISE, c = hex(0xff3818), t = 0.7, a = { 0.05, 0.45, 1, 0.5 }, op = 1, add = true, vie = { 1, 2.2 }, nb = 2, eclat = 3 })
	bassin("braiseO", { tex = TEX_BRAISE, c = hex(0xff8a20), t = 0.5, a = { 0.05, 0.45, 1, 0.5 }, op = 1, add = true, acc = 13, vie = { 0.8, 1.8 }, nb = 3, eclat = 3 })
	bassin("braiseJ", { tex = TEX_BRAISE, c = hex(0xffd840), t = 0.36, a = { 0.05, 0.45, 1, 0.5 }, op = 1, add = true, acc = 16, vie = { 0.6, 1.5 }, nb = 2, eclat = 3 })
	-- les miettes de ouate (cloudBits) : un banc qu'on perce part en mille morceaux
	bassin("ouate", { tex = TEX_FUMEE, c = hex(0xdff6ff), t = 2.8, a = { 0.06, 0.5, 0.75, 1.35 }, op = 0.9, add = false, acc = 2.2, vie = { 0.5, 1.35 }, nb = 2 })
	bassin("fumee", { tex = TEX_FUMEE, c = hex(0x2e2428), t = 3.4, a = { 0.14, 0.5, 0.6, 1.7 }, op = 0.5, add = false, frein = 1.6, vie = { 0.9, 2.1 }, nb = 4 })

	-- ── les écoutes ──
	-- (à CHAQUE image, quel que soit le mode : l'explosion et ses billets vivent après la mort de la caisse)
	RunService.RenderStepped:Connect(function(dt: number)
		etat = Bus.etat()
		if etat.pause then return end
		dt = math.min(dt, 0.05)
		if etat.carCF then ancreCaisse.CFrame = etat.carCF end
		anneauxTick(dt)
		billetsTick(dt)
		pluieTick(dt)
		tachesTick(dt)
		crateresTick(dt)
		explosionTick(dt)
		palierTick(dt)
		continuTick(dt)
		teinteTick(dt)
		filesTick(dt, gui.AbsoluteSize)
	end)
	-- (mise au point, depuis la console de Studio) workspace:SetAttribute("DbgFx", "boom") — ou moteur7, pluie, cratere, jus3 —
	-- rejoue un effet sur la caisse, sans attendre que la partie le provoque. Suivi d'un chiffre au besoin, pour le relancer.
	workspace:GetAttributeChangedSignal("DbgFx"):Connect(function()
		local v = tostring(workspace:GetAttribute("DbgFx") or "")
		etat = Bus.etat()
		local n = tonumber(string.match(v, "%d+"))
		if string.find(v, "mort") then Bus.agir.exploser("air")
		elseif string.find(v, "boom") then explosion("air", false, 0)
		elseif string.find(v, "moteur") then Bus.emit("moteur", n or 1, 12)
		elseif string.find(v, "pluie") then pluieLance()
		elseif string.find(v, "cratere") then cratere()
		elseif string.find(v, "jus") then croque(math.clamp(n or 1, 1, 6), etat.carCF.Position, Config.FRUITS[math.clamp(n or 1, 1, 6)])
		end
	end)
	Bus.on("partie", function()
		pluie.seuil, pluie.t = 1000, 0
		palier.t = 99
		boom.t = 99
		rafale.n = 0
		for _, t in taches do
			t.im:Destroy()
			t.coule:Destroy()
		end
		table.clear(taches)
	end)
	Bus.on("piece", function()
		local cf: CFrame = Bus.etat().carCF
		local fren = Score.frenesie()
		etincelles("or", cf.Position + cf.UpVector * (1.2 * M), fren and 14 or 8, fren and 11 or 8)
	end)
	Bus.on("fruit", croque)
	Bus.on("pouvoir", function(k: string)
		local cf: CFrame = Bus.etat().carCF
		etincelles((k == "v") and "rose" or ((k == "a" or k == "n") and "bleu" or "or"), cf.Position + cf.UpVector * (1.2 * M), 14, 9)
	end)
	Bus.on("pose", function(p: any)
		etat = Bus.etat()
		gerbePose(p)
		if p.meteore then
			cratere()
		elseif p.paye then
			boomPose((p.serpent and 3) or ((p.q or 0) >= 140 and 3) or ((p.q or 0) >= 45 and 2) or 1)
		end
		-- la pose PARFAITE : les bords de l'écran s'allument d'or
		if (p.g or 1) >= 1.5 and not p.ratee and ((p.fallT or 0) > 0.7 or p.paye) then
			flashBords(Color3.fromRGB(255, 200, 60), 0.95)
			Camera.zoom(1) -- le coup de zoom : sec, relache en une demi-seconde
		end
	end)
	Bus.on("mort", function(cause: string, enVol: boolean, chaine: number?)
		etat = Bus.etat()
		explosion(cause, enVol, chaine)
	end)
	-- shatterCloud (L24260) : on entre dans un nuage — mille morceaux au point de contact
	Bus.on("nuage", function(quoi: string, k: number)
		if quoi ~= "entre" and quoi ~= "defonce" then return end
		local cf: CFrame = Bus.etat().carCF
		local p = math.min(1, (k or 0) + 0.35)
		jet("ouate", cf.Position, Vector3.yAxis, 18 + 28 * p, 3, 3 + 12 * p, 180)
	end)
	Bus.on("portail", function()
		local cf: CFrame = Bus.etat().carCF
		billetsCompteur(cf.Position, 8)
	end)
	-- la scène d'atelier : armée par la carte moteur (l'onde est à la couleur néon du moteur ; l'or sans carte)
	Bus.on("atelier", function(_tier: number, couleur: Color3?)
		palier.t = 0
		palier.c = couleur or OR
	end)
	Bus.on("nitro", function(on: boolean, bleue: boolean?)
		if on then
			flashBords(bleue and Color3.fromRGB(91, 125, 255) or Color3.fromRGB(255, 122, 36), 0.3, 0.35)
			gerbeAllume(gui.AbsoluteSize, bleue and 0.6 or 1)
		end
	end)
end

return Effets
