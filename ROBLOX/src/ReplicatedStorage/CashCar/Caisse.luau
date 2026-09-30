-- CASH CAR — LA CAISSE : le modèle 3D, en pièces Roblox (aucun maillage importé, aucun ID d'asset).
-- Deux exemplaires par joueur : celle du SERVEUR (ancrée, cachée chez tout le monde, elle ne porte que la
-- position que le joueur envoie) et celles que chaque joueur DESSINE chez lui (la sienne, collée à sa physique ;
-- celles des autres, lissées vers la position du serveur). Le nez regarde -Z (LookVector de Roblox).
-- (la 1re version comptait sur la « propriété réseau » : sans avatar, Roblox ne la donnait pas au joueur,
-- et sa caisse restait plantée au garage — Sacha ne la voyait ni au menu ni en course)
-- Échelle : 1 m du jeu web = Config.M studs. La caisse fait ~2 m × 4,4 m : 5 × 11 studs.
local Caisse = {}

local ORANGE = Color3.fromRGB(255, 122, 26)
local NOIR = Color3.fromRGB(18, 18, 24)

local function piece(modele: Model, racine: BasePart, nom: string, classe: string, taille: Vector3, cf: CFrame,
	couleur: Color3, matiere: Enum.Material?): BasePart
	local p = Instance.new(classe) :: BasePart
	p.Name = nom
	p.Size = taille
	p.CFrame = racine.CFrame * cf
	p.Color = couleur
	p.Material = matiere or Enum.Material.SmoothPlastic
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.CanCollide = false
	p.CanQuery = false
	p.CanTouch = false
	p.Massless = true
	p.Anchored = false
	local w = Instance.new("WeldConstraint")
	w.Part0 = racine
	w.Part1 = p
	w.Parent = p
	p.Parent = modele
	return p
end

-- Construit une caisse neuve à l'origine. couleur = la laque.
function Caisse.construire(nom: string, couleur: Color3?, ancree: boolean?): Model
	local laque = couleur or ORANGE
	local m = Instance.new("Model")
	m.Name = nom
	m.ModelStreamingMode = Enum.ModelStreamingMode.Persistent

	local r = Instance.new("Part")
	r.Name = "Racine"
	r.Size = Vector3.new(5, 3, 11)
	r.Transparency = 1
	r.CanCollide = false
	r.CanQuery = false
	r.CanTouch = false
	r.Anchored = ancree == true
	r.CFrame = CFrame.new()
	r.Parent = m
	m.PrimaryPart = r
	-- L'origine de la racine = le point de contact au sol, au centre : le bas des roues est à y = 0.
	-- Poser la caisse sur la route = poser la racine sur le bitume.

	-- ── la coque : bas de caisse, flancs, capot plongeant, verrière, poupe ──
	piece(m, r, "Plancher", "Part", Vector3.new(4.9, 0.9, 10.6), CFrame.new(0, 1.05, 0), laque)
	piece(m, r, "BasNoir", "Part", Vector3.new(5.0, 0.35, 10.2), CFrame.new(0, 0.55, 0), NOIR)
	piece(m, r, "Capot", "WedgePart", Vector3.new(4.7, 0.75, 4.2), CFrame.new(0, 1.85, -3.1), laque)
	piece(m, r, "Poupe", "Part", Vector3.new(4.8, 0.75, 3.0), CFrame.new(0, 1.85, 3.8), laque)
	piece(m, r, "PareBrise", "WedgePart", Vector3.new(3.9, 1.0, 1.9), CFrame.new(0, 2.72, -1.05), NOIR, Enum.Material.Glass)
	piece(m, r, "Toit", "Part", Vector3.new(3.9, 1.0, 2.3), CFrame.new(0, 2.72, 1.05), NOIR, Enum.Material.Glass)
	piece(m, r, "Lunette", "WedgePart", Vector3.new(3.9, 1.0, 1.6), CFrame.new(0, 2.72, 3.0) * CFrame.Angles(0, math.pi, 0), NOIR, Enum.Material.Glass)
	piece(m, r, "Pavillon", "Part", Vector3.new(3.7, 0.12, 2.1), CFrame.new(0, 3.26, 1.05), laque)
	-- flancs sculptés : une lame noire le long de la caisse (se lit de derrière)
	for _, sx in { -1, 1 } do
		piece(m, r, "Lame", "Part", Vector3.new(0.12, 0.3, 6.8), CFrame.new(sx * 2.49, 1.2, 0.4), NOIR)
		piece(m, r, "Retro", "Part", Vector3.new(0.5, 0.3, 0.5), CFrame.new(sx * 2.25, 2.45, -1.6), laque)
	end

	-- ── l'aileron : deux mâts + la lame ──
	for _, sx in { -1, 1 } do
		piece(m, r, "Mat", "Part", Vector3.new(0.25, 0.8, 0.35), CFrame.new(sx * 1.5, 2.55, 4.7), NOIR)
	end
	piece(m, r, "Aileron", "Part", Vector3.new(5.2, 0.16, 1.1), CFrame.new(0, 3.0, 4.85), NOIR)
	piece(m, r, "AileronFilet", "Part", Vector3.new(5.2, 0.08, 0.15), CFrame.new(0, 3.1, 5.35), laque, Enum.Material.Neon)

	-- ── les roues + jantes (un cylindre Roblox a son axe sur X : pile l'essieu) ──
	for _, sx in { -1, 1 } do
		for _, sz in { -1, 1 } do
			local z = sz * 3.55
			local p = piece(m, r, "Roue", "Part", Vector3.new(1.0, 2.1, 2.1), CFrame.new(sx * 2.3, 1.05, z), NOIR) :: Part
			p.Shape = Enum.PartType.Cylinder
			local j = piece(m, r, "Jante", "Part", Vector3.new(1.04, 1.2, 1.2), CFrame.new(sx * 2.3, 1.05, z), Color3.fromRGB(200, 205, 215), Enum.Material.Metal) :: Part
			j.Shape = Enum.PartType.Cylinder
		end
	end

	-- ── les feux : phares blancs chauds devant, bandeau rouge derrière ──
	for _, sx in { -1, 1 } do
		piece(m, r, "Phare", "Part", Vector3.new(1.1, 0.3, 0.2), CFrame.new(sx * 1.7, 1.45, -5.28), Color3.fromRGB(255, 244, 214), Enum.Material.Neon)
	end
	local feu = piece(m, r, "FeuArriere", "Part", Vector3.new(4.4, 0.28, 0.15), CFrame.new(0, 1.9, 5.32), Color3.fromRGB(255, 40, 60), Enum.Material.Neon)
	feu.Name = "FeuArriere"

	-- ── le néon sous caisse : la nuit, il pose une flaque de couleur sur le bitume ──
	local neon = piece(m, r, "NeonSous", "Part", Vector3.new(4.2, 0.1, 9.0), CFrame.new(0, 0.35, 0), Color3.fromRGB(255, 62, 200), Enum.Material.Neon)
	neon.Transparency = 0.25

	-- ── les lumières (la racine les porte : zéro pièce de plus) ──
	local phares = Instance.new("SpotLight")
	phares.Name = "Phares"
	phares.Face = Enum.NormalId.Front
	phares.Angle = 70
	phares.Range = 60
	phares.Brightness = 2
	phares.Color = Color3.fromRGB(255, 236, 200)
	phares.Parent = r
	local lueur = Instance.new("PointLight")
	lueur.Name = "Lueur"
	lueur.Range = 16
	lueur.Brightness = 1.2
	lueur.Color = Color3.fromRGB(255, 62, 200)
	lueur.Parent = neon

	-- ── l'échappement : deux tuyères, chacune avec une flamme, une traînée et des braises ──
	for i, sx in { -1, 1 } do
		piece(m, r, "Pot", "Part", Vector3.new(0.55, 0.55, 0.5), CFrame.new(sx * 1.25, 0.95, 5.35), Color3.fromRGB(60, 60, 70), Enum.Material.Metal)
		local a = Instance.new("Attachment")
		a.Name = "Tuyere" .. i
		a.Position = Vector3.new(sx * 1.25, 0.95, 5.7)
		a.Parent = r
		-- traînée : deux attaches écartées en hauteur = la largeur du ruban
		local a0 = Instance.new("Attachment")
		a0.Name = "TraineeH" .. i
		a0.Position = Vector3.new(sx * 1.25, 1.35, 5.7)
		a0.Parent = r
		local a1 = Instance.new("Attachment")
		a1.Name = "TraineeB" .. i
		a1.Position = Vector3.new(sx * 1.25, 0.55, 5.7)
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
		local f = Instance.new("ParticleEmitter")
		f.Name = "Flamme" .. i
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
		f.Color = ColorSequence.new(Color3.fromRGB(255, 220, 140), Color3.fromRGB(255, 80, 20))
		f.Parent = a
	end
	local reflet = Instance.new("PointLight")
	reflet.Name = "RefletNitro"
	reflet.Range = 18
	reflet.Brightness = 0
	reflet.Color = Color3.fromRGB(255, 122, 36)
	reflet.Parent = r

	return m
end

-- Repeint la laque d'une caisse (les pièces nommées dans LAQUE prennent la couleur).
local LAQUE = { Plancher = true, Capot = true, Poupe = true, Pavillon = true, Retro = true }
function Caisse.peindre(m: Model, couleur: Color3)
	for _, p in m:GetChildren() do
		if p:IsA("BasePart") and LAQUE[p.Name] then
			p.Color = couleur
		end
	end
end

return Caisse
