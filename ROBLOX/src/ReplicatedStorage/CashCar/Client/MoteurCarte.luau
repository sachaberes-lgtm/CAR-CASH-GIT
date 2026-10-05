-- CASH CAR — LA CARTE MOTEUR (engBig v5, index.html L22577) : à chaque palier, le NOUVEAU MOTEUR apparaît en 3D au-dessus
-- de la caisse, son nom à sa couleur néon ; il tourne une seconde, puis PLONGE dans le capot en rétrécissant. À l'impact :
-- l'éclair à sa couleur, le coup de caméra, la poussée — et « +N KM/H » jaillit de la caisse.
-- (verdicts de Sacha sur le jeu web : le moteur 3D en GRAND dès qu'on le débloque ; il suit la voiture, ne cache jamais la
-- route plus d'une seconde, rétrécit et rentre dedans.)
-- Les 30 moteurs sont ceux du jeu web, cuits (Moteurs/Mxx — outils/cuire-moteurs.js). Celui du palier SUIVANT se bâtit
-- d'avance, en tâche de fond : rien ne se construit à l'instant du palier.
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Bus = require(script.Parent:WaitForChild("Bus"))
local Hud = require(script.Parent:WaitForChild("Hud"))
local Sons = require(script.Parent:WaitForChild("Sons"))
local Maillage = require(script.Parent:WaitForChild("Maillage"))
local Effets = require(script.Parent:WaitForChild("Effets"))
local Moteurs = script.Parent.Parent:WaitForChild("Moteurs")
local Liste = require(Moteurs:WaitForChild("Liste"))
local M = Config.M
local FR = Config.francais()

local MoteurCarte = {}

local ECHELLE = 0.55       -- le moteur à l'échelle de la caisse : ~1,1 m de long posé au-dessus du toit
local HAUT = 3.1           -- m au-dessus de la route (le toit est vers 1,5 m)
local T_COULOIR, T_PLONGE = 1.0, 0.48 -- (ENG_COULOIR, ENG_PLONGE) une seconde au-dessus de la caisse, puis 0,48 s pour rentrer dans le capot
local T_ATELIER = T_COULOIR + T_PLONGE - 1.7 * 0.38 -- la scène d'atelier part pour que sa RÉVÉLATION tombe à l'entrée dans le capot
-- les capacités qu'un palier ouvre (ENG_CAP) : la carte les NOMME à la place de « NOUVEAU MOTEUR »
local CAPACITES = { [12] = { "+ PLUIE DE BILLETS", "+ CASH SHOWER" }, [15] = { "+ AIMANT A PIECES", "+ COIN MAGNET" }, [27] = { "+ CAISSE EN FEU", "+ CAR ON FIRE" } }

local MATIERES = {
	c = { Enum.Material.SmoothPlastic, 0.45 }, -- miroir : inox, collecteurs
	a = { Enum.Material.SmoothPlastic, 0.18 }, -- alu, anodisé, carbone verni
	m = { Enum.Material.SmoothPlastic, 0.0 },  -- fonte, noir
}
-- (comme pour les caisses : Roblox ne rend jamais une pièce plus claire que sa couleur — on relève les teintes sombres)
local function lumiere(c: Color3): Color3
	local mx = math.max(c.R, c.G, c.B, 0.001)
	local f = math.clamp(0.92 / mx, 1, 1.5)
	return Color3.new(math.min(1, c.R * f), math.min(1, c.G * f), math.min(1, c.B * f))
end
-- la couleur du moteur poussée au NÉON (engNeon) : les gris d'acier des premiers paliers deviennent cyan, le reste gagne sa saturation
local function neon(h: number): Color3
	local c = Color3.fromRGB(bit32.rshift(h, 16), bit32.band(bit32.rshift(h, 8), 255), bit32.band(h, 255))
	local mx, mn = math.max(c.R, c.G, c.B), math.min(c.R, c.G, c.B)
	local l = (mx + mn) / 2
	local s = (mx == mn) and 0 or ((l > 0.5) and (mx - mn) / (2 - mx - mn) or (mx - mn) / (mx + mn))
	if s < 0.3 or l > 0.9 then return Color3.fromRGB(94, 230, 255) end
	local teinte = c:ToHSV()
	-- (teinte gardée, saturation ≥ 0,88, clarté 0,58-0,68 — rendu en TSV : vif et clair)
	return Color3.fromHSV(teinte, 0.72, 1)
end

-- ── bâtir un moteur : un Model de pièces ancrées autour de l'origine ──
local function donnees(i: number): { [string]: any }?
	local f = Liste[i]
	if not f then return nil end
	local d = {}
	local nom = string.format("M%02d", i)
	if f.eclate then
		for _, g in f.eclate do
			local m = Moteurs:FindFirstChild(nom .. g)
			if m then
				local ok, x = pcall(require, m)
				if ok then d[g] = x end
			end
		end
	else
		local m = Moteurs:FindFirstChild(nom)
		if not m then return nil end
		local ok, x = pcall(require, m)
		if not ok then return nil end
		d = x
	end
	return d
end
-- (rend aussi « complet » : aucune pièce refusée par le budget de triangles)
local function construire(i: number): (Model?, boolean)
	local d = donnees(i)
	if not d then return nil, false end
	local modele = Instance.new("Model")
	modele.Name = "Moteur" .. i
	local nb, manque = 0, 0
	local function poser(p: MeshPart, centre: Vector3)
		p.Anchored = true
		p.Massless = false
		p.CastShadow = false
		p.CFrame = CFrame.new(centre)
		p.Parent = modele
		nb += 1
	end
	for g, x in d do
		if g == "l" then
			-- ce qui s'allume : une pièce Néon par couleur (quatre au plus : les teintes rares se rangent dans la dernière)
			local couleurs = Maillage.couleurs(x)
			for k, c in couleurs do
				if k > 4 then break end
				local p, centre = Maillage.piece(x, M * ECHELLE, { couleur = c })
				if p then
					p.Material = Enum.Material.Neon
					p.Color = c
					poser(p, centre)
				else
					manque += 1
				end
			end
		else
			local p, centre = Maillage.piece(x, M * ECHELLE, { teinte = lumiere })
			if p then
				local mt = MATIERES[g] or MATIERES.m
				p.Material = mt[1]
				p.Reflectance = mt[2]
				p.Color = Color3.new(1, 1, 1)
				poser(p, centre)
			else
				manque += 1
			end
		end
	end
	if nb == 0 then
		Maillage.rendre(modele)
		return nil, false
	end
	modele.WorldPivot = CFrame.identity
	return modele, manque == 0
end

-- ── la réserve : le moteur du prochain palier, bâti d'avance ──
local prets: { [number]: Model } = {}
local enCours: { [number]: boolean } = {}
local function preparer(i: number)
	if not Liste[i] or prets[i] or enCours[i] then return end
	enCours[i] = true
	task.spawn(function()
		local ok, m = pcall(construire, i)
		enCours[i] = nil
		if ok and m then prets[i] = m end
	end)
end
-- UN SEUL moteur bâti à la fois : Roblox ne donne que ~68 000 triangles à tout ce qui est bâti par code
local function oublier(sauf: number?)
	for i, m in prets do
		if i ~= sauf then
			Maillage.rendre(m)
			prets[i] = nil
		end
	end
end

-- ── la carte ──
-- LA CARTE v2 (5/10, revue du HUD) : le titre était écrit en 9 px et le nom en 20, quelle que soit la taille de l'écran (illisible sur
-- un PC, minuscule sur un téléphone), cernés d'un trait de 1 px. Elle se dessine maintenant comme le HUD — pour un écran de 720 de haut,
-- agrandie avec lui — cernée d'encre épaisse, le nom en relief à la couleur sombre du moteur ; et elle CLAQUE en arrivant.
type Carte = { t: number, tier: number, modele: Model?, gui: BillboardGui, a: Attachment, textes: { TextLabel }, traits: { UIStroke },
	couleur: Color3, gain: number, tour: number, atelier: boolean, plonge: boolean, impact: boolean }
local carte: Carte? = nil
local ancre: Part
local PIX = Font.new("rbxasset://fonts/families/PressStart2P.json")
local ENCRE = Color3.fromRGB(28, 4, 48)

local function fin()
	local c = carte
	if not c then return end
	carte = nil
	c.a:Destroy()
	-- le moteur montré est rendu, celui du palier suivant se bâtit à sa place
	oublier(nil)
	preparer(c.tier + 1)
end

-- l'échelle de l'interface (Hud : un écran de 720 de haut) — plancher 0,62 : sur un téléphone couché, le titre reste lisible
local function echelleHud(): number
	local sc = Hud.racine and Hud.racine:FindFirstChildOfClass("UIScale")
	return math.clamp(sc and sc.Scale or 1, 0.62, 2)
end

local function texte(parent: Instance, taille: number, y: number, h: number, couleur: Color3, trait: number, cTrait: Color3, z: number): (TextLabel, UIStroke)
	local l = Instance.new("TextLabel")
	l.BackgroundTransparency = 1
	l.FontFace = PIX
	l.TextSize = taille
	l.TextColor3 = couleur
	l.TextWrapped = false
	l.Size = UDim2.new(1, 0, 0, h)
	l.Position = UDim2.fromOffset(0, y)
	l.ZIndex = z
	l.Parent = parent
	local s = Instance.new("UIStroke")
	s.Color = cTrait
	s.Thickness = trait
	s.ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual
	s.Parent = l
	return l, s
end

local function ouvrir(tier: number, gain: number, sommet: boolean?)
	fin()
	local f = Liste[tier]
	if not f then return end
	local couleur = neon(f.couleur)
	local k = echelleHud()
	local function px(v: number): number return math.floor(v * k + 0.5) end
	local a = Instance.new("Attachment")
	a.Parent = ancre
	local g = Instance.new("BillboardGui")
	g.Size = UDim2.fromOffset(px(660), px(104))
	g.AlwaysOnTop = true
	g.LightInfluence = 0
	g.MaxDistance = 400 * M
	-- (le nom se pose AU-DESSUS du moteur 3D ; quand le moteur n'a pas pu être bâti — le budget de triangles était plein —, il descend
	-- à sa place : sinon il flottait haut dans le ciel, sur les annonces du centre de l'écran)
	g.StudsOffsetWorldSpace = Vector3.new(0, (prets[tier] and 1.35 or 0.2) * M, 0)
	g.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
	g.Adornee = a
	g.Parent = a
	-- (une boîte qui porte l'échelle : le claquement d'arrivée, ancré par le bas — la carte pousse depuis le toit)
	local boite = Instance.new("Frame")
	boite.BackgroundTransparency = 1
	boite.AnchorPoint = Vector2.new(0.5, 1)
	boite.Position = UDim2.fromScale(0.5, 1)
	boite.Size = UDim2.fromScale(1, 1)
	boite.Parent = g
	local sc = Instance.new("UIScale")
	sc.Scale = 1.55
	sc.Parent = boite
	TweenService:Create(sc, TweenInfo.new(0.34, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Scale = 1 }):Play()
	local cap = CAPACITES[tier]
	-- (L22722) un palier jamais atteint avant : NOUVEAU SOMMET, en or
	local tTxt = cap and (FR and cap[1] or cap[2]) or (sommet and (FR and "NOUVEAU SOMMET" or "NEW PEAK") or (FR and "NOUVEAU MOTEUR" or "NEW ENGINE"))
	local tCoul = cap and Color3.fromRGB(125, 255, 154) or (sommet and Color3.fromRGB(255, 215, 94) or Color3.fromRGB(223, 238, 255))
	local titre, sT = texte(boite, px(17), 0, px(22), tCoul, math.max(2, px(3)), ENCRE, 3)
	titre.Text = tTxt
	local nomTxt = Hud.sansAccent(FR and f.nom or f.en)
	local corps = (#nomTxt > 14) and 26 or ((#nomTxt > 10) and 32 or 38)
	-- le nom dans la typo ombrée du HUD : une ombre dure décalée, à la couleur sombre du moteur ; dessus, le néon cerné d'encre
	local cOmbre = couleur:Lerp(Color3.new(0, 0, 0), 0.68)
	local ombre, sO = texte(boite, px(corps), px(34) + math.max(2, px(5)), px(corps + 8), cOmbre, math.max(2, px(4)), cOmbre, 1)
	ombre.Position = UDim2.fromOffset(math.max(2, px(5)), ombre.Position.Y.Offset)
	ombre.Text = nomTxt
	local nom, sN = texte(boite, px(corps), px(34), px(corps + 8), couleur, math.max(2, px(4)), ENCRE, 2)
	nom.Text = nomTxt
	local modele = prets[tier]
	if modele then modele.Parent = workspace end
	carte = { t = 0, tier = tier, modele = modele, gui = g, a = a, textes = { titre, ombre, nom }, traits = { sT, sO, sN }, couleur = couleur, gain = gain,
		tour = 0, atelier = false, plonge = false, impact = false }
	-- l'éclat de l'apparition, et les cylindres qui chantent : une note par cylindre, sur une gamme qui monte
	local cf: CFrame = Bus.etat().carCF
	if cf then Effets.etincelles("or", cf.Position + cf.UpVector * (HAUT * M), 18, 9) end
	local gamme = { 0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24 }
	for i = 0, math.clamp(f.cyl, 1, 16) - 1 do
		task.delay(0.25 + i * 0.05, function()
			if carte and carte.tier == tier and not carte.plonge then Sons.jouer("maillon", Sons.demiTons(gamme[(i % #gamme) + 1]), 0.3) end
		end)
	end
end

local function tick(dt: number)
	local c = carte
	if not c then return end
	local e = Bus.etat()
	if e.pause then return end
	if e.mode ~= "drive" and e.mode ~= "fall" then
		fin()
		return
	end
	local cf: CFrame = e.carCF
	c.t += dt
	if workspace:GetAttribute("DbgGel") then c.t = math.min(c.t, 0.7) end -- (mise au point) la carte reste en l air, le temps de la regarder
	-- la scène d'atelier (soudure, anneau, spirale d'or) : calée pour que sa révélation tombe à l'impact
	if not c.atelier and c.t >= T_ATELIER then
		c.atelier = true
		Bus.emit("atelier", c.tier, c.couleur)
	end
	local u = math.clamp((c.t - T_COULOIR) / T_PLONGE, 0, 1) -- l'avancement de la plongée
	if u > 0 and not c.plonge then
		c.plonge = true
		Sons.jouer("pad", 0.8, 0.4)
	end
	-- le moteur tourne, de plus en plus vite ; en plongée il descend vers le capot et rétrécit
	c.tour += dt * (1.6 + 16 * u * u)
	local k = u * u * (3 - 2 * u)
	local haut = HAUT + math.sin(c.t * 5) * 0.06 - (HAUT - 1.0) * k
	local pos = cf.Position + cf.UpVector * (haut * M) - cf.LookVector * (1.2 * M * k)
	c.a.WorldPosition = pos
	local fondu = math.clamp(u * 3, 0, 1)
	for _, l in c.textes do l.TextTransparency = fondu end
	for _, s in c.traits do s.Transparency = fondu end
	if c.modele then
		local naissance = math.min(1, c.t / 0.14)
		c.modele:ScaleTo(math.max(0.02, (0.6 + 0.4 * naissance) * (1 - 0.92 * k)))
		c.modele:PivotTo(CFrame.fromMatrix(pos, cf.RightVector, cf.UpVector) * CFrame.Angles(0, c.tour, 0) * CFrame.Angles(0.12, 0, 0))
	end
	-- L'IMPACT (engImpact) : le moment où l'on ENCAISSE le moteur
	if u >= 1 and not c.impact then
		c.impact = true
		Effets.flashBords(c.couleur, 0.6)
		Bus.agir.fov(11)
		Bus.agir.secousse(0.4)
		Bus.agir.boost(0.8)
		Sons.jouer("nitroPlein", 1.1)
		Effets.etincelles("or", cf.Position + cf.UpVector * (1.2 * M), 14, 10)
		local gain = c.gain
		task.delay(0.2, function()
			local m = Bus.etat().mode
			if gain > 0 and (m == "drive" or m == "fall") then Hud.pop("+" .. gain .. " KM/H", Color3.fromRGB(125, 255, 154), 22) end
		end)
	end
	if c.t > T_COULOIR + T_PLONGE + 0.15 then fin() end
end

-- ── LA PHOTO DU MOTEUR (l'écran de fin, « MOTEUR ATTEINT ») : le moteur du palier tourne dans une petite fenêtre 3D. Il prend la
-- place du moteur bâti d'avance (un seul à la fois : le budget de triangles), et rend la sienne à la partie suivante. ──
local photoN, photoM = 0, nil :: Model?
local function photoFin()
	photoN += 1
	if photoM then
		Maillage.rendre(photoM)
		photoM = nil
	end
end
local function photo(vp: ViewportFrame, tier: number)
	photoFin()
	local n = photoN
	fin()
	oublier(tier)
	task.spawn(function()
		while enCours[tier] do task.wait() end
		local m = prets[tier]
		prets[tier] = nil
		-- (Roblox ne rend pas tout de suite la mémoire du moteur qu'on vient de détruire : on réessaie, le temps qu'il la libère)
		local essai = 0
		while not m and essai < 5 and n == photoN do
			if essai > 0 then task.wait(0.7) end
			essai += 1
			local ok, x, complet = pcall(construire, tier)
			m = (ok and x) or nil
			if m and not complet and essai < 5 then
				Maillage.rendre(m)
				m = nil
			end
		end
		if not m then return end
		if n ~= photoN then
			Maillage.rendre(m)
			return
		end
		m:ScaleTo(1)
		m:PivotTo(CFrame.identity)
		local boite, taille = m:GetBoundingBox()
		m.WorldPivot = boite -- il tourne autour de son milieu
		m:PivotTo(CFrame.identity)
		local cam = vp:FindFirstChildOfClass("Camera") or Instance.new("Camera")
		cam.FieldOfView = 28
		local r = taille.Magnitude / 2
		cam.CFrame = CFrame.lookAt(Vector3.new(0.55, 0.42, 1).Unit * (r / math.tan(math.rad(14)) * 0.86), Vector3.zero)
		cam.Parent = vp
		vp.CurrentCamera = cam
		m.Parent = vp
		photoM = m
	end)
end

function MoteurCarte.init()
	if ancre then return end
	ancre = Instance.new("Part")
	ancre.Name = "FxMoteur"
	ancre.Anchored = true
	ancre.CanCollide = false
	ancre.CanQuery = false
	ancre.CanTouch = false
	ancre.Transparency = 1
	ancre.Size = Vector3.new(1, 1, 1)
	ancre.CFrame = CFrame.identity
	ancre.Parent = workspace
	RunService.RenderStepped:Connect(function(dt: number)
		if photoM then photoM:PivotTo(CFrame.Angles(0, os.clock() * 0.9, 0) * CFrame.Angles(0.1, 0, 0)) end
		local ok, err = pcall(tick, math.min(dt, 0.05))
		if not ok then
			warn("[CashCar] carte moteur : " .. tostring(err))
			pcall(fin)
		end
	end)
	Bus.on("partie", function()
		photoFin()
		fin()
		oublier(1)
		preparer(1)
	end)
	Bus.on("menu", photoFin)
	Bus.on("fin", function(r: any)
		if Hud.E.mMoteurVue and r and r.tier then photo(Hud.E.mMoteurVue, r.tier) end
	end)
	Bus.on("moteur", function(tier: number, gain: number, sommet: boolean?)
		ouvrir(tier, gain or 0, sommet)
	end)
	Bus.on("mort", fin)
	preparer(1)
end

return MoteurCarte
