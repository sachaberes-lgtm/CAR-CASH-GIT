-- CASH CAR — LA CAISSE. Chaque joueur DESSINE les caisses chez lui (la sienne, collée à sa physique ; celles des
-- autres, lissées vers la position que le serveur relaie). Le nez regarde −Z (LookVector de Roblox).
--
-- Les 68 caisses sont celles du jeu web, AU TRIANGLE PRÈS : Caisses/Formes/Fxx est cuit par outils/cuire-caisses.js
-- en exécutant les vrais constructeurs du jeu (SHAPES, lpKit, lpWheel…). Une caisse = un maillage par MATIÈRE
-- (laque, chrome, or, satiné, mat, verre) + une pièce Néon par couleur de feu + quatre roues qui tournent.
-- Si Roblox refuse les maillages (appareil ancien, mémoire) : la caisse de secours en blocs.
--
-- Caisse.construire(nom, indice, ancree) → Model, poignees
--   poignees = { flammes, trainees, reflet, phares, essieux = { Weld }, bases = { CFrame }, rayons = { number }, fiche }
local Config = require(script.Parent:WaitForChild("Config"))
local Catalogue = require(script.Parent:WaitForChild("Caisses"):WaitForChild("Catalogue"))
local Formes = script.Parent:WaitForChild("Caisses"):WaitForChild("Formes")
local M = Config.M

local Caisse = {}
Caisse.Catalogue = Catalogue

-- comment chaque matière du jeu web répond à la lumière de Roblox
local MATIERES = {
	p = { Enum.Material.SmoothPlastic, 0.10 }, -- LAQUE
	c = { Enum.Material.SmoothPlastic, 0.45 }, -- CHROME
	o = { Enum.Material.SmoothPlastic, 0.35 }, -- OR
	s = { Enum.Material.SmoothPlastic, 0.0 },  -- cuir, toile, satiné
	m = { Enum.Material.SmoothPlastic, 0.0 },  -- mat : pneus, grilles, plastiques
	g = { Enum.Material.SmoothPlastic, 0.12 }, -- verre (à .30 il renvoyait le ciel en bleu vif : une vitre du jeu est SOMBRE)
}

-- LA LUMIÈRE DU JEU WEB. Là-bas le soleil et le ciel éclairent une peinture à ~1,7 fois sa couleur, puis l'image est
-- compressée vers le blanc : LA HONTE (#7a4a2b, un brun) sort ORANGE à l'écran. Roblox, lui, ne rend jamais une
-- pièce plus claire que sa couleur. On relève donc les couleurs cuites comme le fait la lumière du web :
-- × 1,7 pour les teintes sombres, sans jamais dépasser 0,92 de valeur (les teintes vives ne bougent pas).
local function lumiere(c: Color3): Color3
	local mx = math.max(c.R, c.G, c.B, 0.001)
	local f = math.clamp(0.92 / mx, 1, 1.7)
	return Color3.new(math.min(1, c.R * f), math.min(1, c.G * f), math.min(1, c.B * f))
end

local function souder(racine: BasePart, p: BasePart, cf: CFrame, modele: Instance)
	p.CFrame = racine.CFrame * cf
	p.Anchored = false
	p.CanCollide = false
	p.CanQuery = false
	p.CanTouch = false
	p.Massless = true
	local w = Instance.new("WeldConstraint")
	w.Part0 = racine
	w.Part1 = p
	w.Parent = p
	p.Parent = modele
end

-- ── la caisse de SECOURS : des blocs (aucun maillage) ──
local NOIR = Color3.fromRGB(18, 18, 24)
local function blocs(m: Model, r: BasePart, laque: Color3)
	local function piece(nom: string, classe: string, taille: Vector3, cf: CFrame, couleur: Color3, matiere: Enum.Material?): BasePart
		local p = Instance.new(classe) :: BasePart
		p.Name = nom
		p.Size = taille
		p.Color = couleur
		p.Material = matiere or Enum.Material.SmoothPlastic
		souder(r, p, cf, m)
		return p
	end
	piece("Plancher", "Part", Vector3.new(4.9, 0.9, 10.6), CFrame.new(0, 1.05, 0), laque)
	piece("BasNoir", "Part", Vector3.new(5.0, 0.35, 10.2), CFrame.new(0, 0.55, 0), NOIR)
	piece("Capot", "WedgePart", Vector3.new(4.7, 0.75, 4.2), CFrame.new(0, 1.85, -3.1), laque)
	piece("Poupe", "Part", Vector3.new(4.8, 0.75, 3.0), CFrame.new(0, 1.85, 3.8), laque)
	piece("PareBrise", "WedgePart", Vector3.new(3.9, 1.0, 1.9), CFrame.new(0, 2.72, -1.05), NOIR, Enum.Material.Glass)
	piece("Toit", "Part", Vector3.new(3.9, 1.0, 2.3), CFrame.new(0, 2.72, 1.05), NOIR, Enum.Material.Glass)
	piece("Lunette", "WedgePart", Vector3.new(3.9, 1.0, 1.6), CFrame.new(0, 2.72, 3.0) * CFrame.Angles(0, math.pi, 0), NOIR, Enum.Material.Glass)
	piece("Aileron", "Part", Vector3.new(5.2, 0.16, 1.1), CFrame.new(0, 3.0, 4.85), NOIR)
	for _, sx in { -1, 1 } do
		for _, sz in { -1, 1 } do
			local p = piece("Roue", "Part", Vector3.new(1.0, 2.1, 2.1), CFrame.new(sx * 2.3, 1.05, sz * 3.55), NOIR) :: Part
			p.Shape = Enum.PartType.Cylinder
		end
		piece("Phare", "Part", Vector3.new(1.1, 0.3, 0.2), CFrame.new(sx * 1.7, 1.45, -5.28), Color3.fromRGB(255, 244, 214), Enum.Material.Neon)
	end
	piece("FeuArriere", "Part", Vector3.new(4.4, 0.28, 0.15), CFrame.new(0, 1.9, 5.32), Color3.fromRGB(255, 40, 60), Enum.Material.Neon)
end

-- ── la vraie caisse : les maillages cuits ──
local function maillages(m: Model, r: BasePart, indice: number, poignees: any): boolean
	local module = Formes:FindFirstChild(string.format("F%02d", indice))
	local Client = script.Parent:FindFirstChild("Client")
	local mMaillage = Client and Client:FindFirstChild("Maillage")
	if not module or not mMaillage then return false end
	local okD, donnees = pcall(require, module)
	local okM, Maillage = pcall(require, mMaillage)
	if not okD or not okM then return false end
	local pieces: { BasePart } = {}
	local function matiere(g: string, d: any, opt: any?, parentCF: CFrame?, cible: BasePart?): boolean
		if g == "l" then
			-- les FEUX : une pièce Néon par couleur (le Néon de Roblox prend la couleur de la pièce)
			for _, c in Maillage.couleurs(d) do
				local o2 = { couleur = c, miroir = opt and opt.miroir }
				local mp, centre = Maillage.piece(d, M, o2)
				if mp then
					mp.Name = "Feu"
					mp.Material = Enum.Material.Neon
					mp.Color = c
					souder(cible or r, mp, (parentCF or CFrame.identity) * CFrame.new(centre), m)
					table.insert(pieces, mp)
				end
			end
			return true
		end
		local o3 = { miroir = opt and opt.miroir, teinte = lumiere }
		local mp, centre = Maillage.piece(d, M, o3)
		if not mp then return false end
		local mt = MATIERES[g] or MATIERES.s
		mp.Name = "Matiere_" .. g
		mp.Material = mt[1]
		mp.Reflectance = mt[2]
		mp.Color = Color3.new(1, 1, 1)
		souder(cible or r, mp, (parentCF or CFrame.identity) * CFrame.new(centre), m)
		table.insert(pieces, mp)
		return true
	end
	for g, d in donnees.corps do
		if not matiere(g, d) then
			for _, p in pieces do p:Destroy() end
			return false
		end
	end
	-- les quatre roues : un MOYEU invisible par roue, soudé par un Weld qu'on fait tourner (l'essieu est X)
	local fiche = Catalogue[indice]
	local modeles: { [string]: { any } } = {}
	for i, ro in fiche.roues do
		local moyeu = Instance.new("Part")
		moyeu.Name = "Moyeu" .. i
		moyeu.Size = Vector3.new(0.2, 0.2, 0.2)
		moyeu.Transparency = 1
		moyeu.CanCollide = false
		moyeu.CanQuery = false
		moyeu.CanTouch = false
		moyeu.Massless = true
		local base = CFrame.new(ro[1] * M, ro[2] * M, ro[3] * M)
		moyeu.CFrame = r.CFrame * base
		local w = Instance.new("Weld")
		w.Name = "Essieu"
		w.Part0 = r
		w.Part1 = moyeu
		w.C0 = base
		w.Parent = moyeu
		moyeu.Parent = m
		-- la roue n'est bâtie qu'UNE fois par côté (droite / gauche en miroir) : les suivantes sont des copies
		local cote = ro[4] and "g" or "d"
		if modeles[cote] then
			for _, src in modeles[cote] do
				local c = src.p:Clone()
				for _, x in c:GetChildren() do if x:IsA("WeldConstraint") then x:Destroy() end end
				souder(moyeu, c, src.cf, m)
			end
		else
			modeles[cote] = {}
			local avant = #pieces
			for g, d in donnees.roue do
				matiere(g, d, { miroir = ro[4] }, nil, moyeu)
			end
			for k = avant + 1, #pieces do
				table.insert(modeles[cote], { p = pieces[k], cf = moyeu.CFrame:ToObjectSpace(pieces[k].CFrame) })
			end
		end
		table.insert(poignees.essieux, w)
		table.insert(poignees.bases, base)
		table.insert(poignees.rayons, ro[5] * M)
	end
	return true
end

-- Construit une caisse à l'origine. indice = l'indice du jeu web (0 = LA HONTE).
function Caisse.construire(nom: string, indice: number, ancree: boolean?): (Model, any)
	local fiche = Catalogue[indice] or Catalogue[0]
	if not Catalogue[indice] then indice = 0 end
	local m = Instance.new("Model")
	m.Name = nom
	local r = Instance.new("Part")
	r.Name = "Racine"
	r.Size = Vector3.new(fiche.w * M, 1, fiche.l * M)
	r.Transparency = 1
	r.CanCollide = false
	r.CanQuery = false
	r.CanTouch = false
	r.Anchored = ancree == true
	r.CFrame = CFrame.new()
	r.Parent = m
	m.PrimaryPart = r
	-- L'origine de la racine = le point de contact au sol, au centre : le bas des roues est à y = 0.
	local poignees = { flammes = {}, trainees = {}, essieux = {}, bases = {}, rayons = {}, fiche = fiche, indice = indice, maillage = true }
	local laque = lumiere(Color3.fromHex(string.format("%06x", fiche.laque)))
	poignees.laque = laque
	if not maillages(m, r, indice, poignees) then
		poignees.maillage = false
		blocs(m, r, laque)
	end

	-- ── les lumières ──
	local phares = Instance.new("SpotLight")
	phares.Name = "Phares"
	phares.Face = Enum.NormalId.Front
	phares.Angle = 70
	phares.Range = 60
	phares.Brightness = 2
	phares.Color = Color3.fromRGB(255, 236, 200)
	phares.Parent = r
	poignees.phares = phares
	local reflet = Instance.new("PointLight")
	reflet.Name = "RefletNitro"
	reflet.Range = 18
	reflet.Brightness = 0
	reflet.Color = Color3.fromRGB(255, 122, 36)
	reflet.Parent = r
	poignees.reflet = reflet

	-- ── l'échappement : une flamme par POT (4 au plus), un ruban par côté — aux vrais emplacements de CETTE caisse ──
	local fx = fiche.fx
	local cJet = (fx and fx.jet) and Color3.fromHex(string.format("%06x", fx.jet)) or Color3.fromRGB(255, 122, 36)
	for i, pot in fiche.pots do
		if i > 4 then break end
		local a = Instance.new("Attachment")
		a.Name = "Tuyere" .. i
		a.Position = Vector3.new(pot[1] * M, pot[2] * M, pot[3] * M + 0.1)
		a.Parent = r
		local f = Instance.new("ParticleEmitter")
		f.Name = "Flamme"
		f.Texture = "rbxasset://textures/particles/fire_main.dds"
		f.LightEmission = 1
		f.LightInfluence = 0
		f.Rate = 0
		f.Lifetime = NumberRange.new(0.06, 0.14)
		f.Speed = NumberRange.new(20, 28)
		f.SpreadAngle = Vector2.new(6, 6)
		f.EmissionDirection = Enum.NormalId.Back
		f.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.9), NumberSequenceKeypoint.new(1, 0.1) })
		f.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.1), NumberSequenceKeypoint.new(1, 1) })
		f.Color = ColorSequence.new(Color3.fromRGB(255, 220, 140), cJet)
		f.Parent = a
		table.insert(poignees.flammes, f)
	end
	for i, tp in fiche.trainees do
		local a0 = Instance.new("Attachment")
		a0.Name = "TraineeH" .. i
		a0.Position = Vector3.new(tp[1] * M, tp[2] * M + 0.4, tp[3] * M + 0.1)
		a0.Parent = r
		local a1 = Instance.new("Attachment")
		a1.Name = "TraineeB" .. i
		a1.Position = Vector3.new(tp[1] * M, tp[2] * M - 0.4, tp[3] * M + 0.1)
		a1.Parent = r
		local t = Instance.new("Trail")
		t.Name = "Trainee" .. i
		t.Attachment0 = a0
		t.Attachment1 = a1
		t.Lifetime = 0.45
		t.MinLength = 0.2
		t.LightEmission = 1
		t.LightInfluence = 0
		t.FaceCamera = true
		t.WidthScale = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(1, 0.15) })
		t.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.05), NumberSequenceKeypoint.new(1, 1) })
		t.Color = ColorSequence.new(Color3.fromRGB(255, 160, 60), Color3.fromRGB(255, 60, 30))
		t.Enabled = false
		t.Parent = r
		table.insert(poignees.trainees, t)
	end
	return m, poignees
end

-- fait tourner les roues d'une caisse : avance = distance parcourue depuis la dernière image (studs, signée)
function Caisse.rouler(poignees: any, avance: number)
	if #poignees.essieux == 0 then return end
	poignees.angle = (poignees.angle or 0) + avance / math.max(0.1, poignees.rayons[1])
	local rot = CFrame.Angles(-poignees.angle, 0, 0)
	for i, w in poignees.essieux do
		w.C0 = poignees.bases[i] * rot
	end
end

return Caisse
