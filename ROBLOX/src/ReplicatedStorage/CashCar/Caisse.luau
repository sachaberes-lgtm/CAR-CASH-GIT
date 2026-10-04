-- CASH CAR — LA CAISSE. Chaque joueur DESSINE les caisses chez lui (la sienne, collée à sa physique ; celles des
-- autres, lissées vers la position que le serveur relaie). Le nez regarde −Z (LookVector de Roblox).
--
-- Les 68 caisses sont celles du jeu web, AU TRIANGLE PRÈS : Caisses/Formes/Fxx est cuit par outils/cuire-caisses.js
-- en exécutant les vrais constructeurs du jeu (SHAPES, lpKit, lpWheel…). Une caisse = un maillage par MATIÈRE
-- (laque, chrome, or, satiné, mat, verre) + une pièce Néon par couleur de feu + quatre roues qui tournent.
-- Si Roblox refuse les maillages (appareil ancien, mémoire) : la caisse de secours en blocs.
--
-- Caisse.construire(nom, indice, ancree, habits) → Model, poignees
--   habits = { peinture = id, aile = id, trainee = id } : ce que la boutique lui fait porter (voir Config.HABITS)
--   poignees = { flammes, trainees, reflet, phares, essieux = { Weld }, bases = { CFrame }, rayons = { number }, fiche }
local Config = require(script.Parent:WaitForChild("Config"))
local Catalogue = require(script.Parent:WaitForChild("Caisses"):WaitForChild("Catalogue"))
local Formes = script.Parent:WaitForChild("Caisses"):WaitForChild("Formes")
local M = Config.M

local Caisse = {}
Caisse.Catalogue = Catalogue

-- comment chaque matière du jeu web répond à la lumière de Roblox
local MATIERES = {
	p = { Enum.Material.SmoothPlastic, 0.15 }, -- LAQUE (4/10 : 0,10 → 0,15 — la peinture renvoie le ciel, la caisse brille)
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
	local l = Color3.new(math.min(1, c.R * f), math.min(1, c.G * f), math.min(1, c.B * f))
	-- (capture du jeu web du 1er oct. : LA HONTE y est ORANGE VIF, ici elle sortait beige) l etalonnage du web sature
	-- aussi les teintes (x 1,44) : on pousse la saturation de la laque, les gris restent gris
	local h, sat, v = l:ToHSV()
	return Color3.fromHSV(h, 1 - (1 - sat) ^ 1.6, v)
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
local function maillages(m: Model, r: BasePart, indice: number, poignees: any, peinture: any?): boolean
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
		local o3 = { miroir = opt and opt.miroir, teinte = lumiere, peinture = (g == "p") and peinture or nil }
		local mp, centre = Maillage.piece(d, M, o3)
		if not mp then return false end
		-- une peinture a sa MATIÈRE (noir mat : satiné ; chrome ; or) : elle remplace celle de la laque
		local mt = MATIERES[(g == "p" and peinture and peinture.g) or g] or MATIERES.s
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
function Caisse.construire(nom: string, indice: number, ancree: boolean?, habits: any?): (Model, any)
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
	local poignees = { flammes = {}, plumes = {}, jetK = 0, jetT = os.clock(), trainees = {}, essieux = {}, bases = {}, rayons = {}, fiche = fiche, indice = indice, maillage = true }
	local laque = lumiere(Color3.fromHex(string.format("%06x", fiche.laque)))
	-- LA PEINTURE de la boutique recouvre la laque (« usine » = la teinte du constructeur)
	local peint = habits and Config.habit("peinture", habits.peinture)
	if peint and peint.id == "usine" then peint = nil end
	if peint then laque = lumiere(peint.c or peint.grad[2]) end
	poignees.laque = laque
	poignees.habits = habits or {}
	if not maillages(m, r, indice, poignees, peint) then
		poignees.maillage = false
		blocs(m, r, laque)
	end
	-- (les ailes ne doivent jamais empêcher une caisse d'exister)
	local okA, errA = pcall(Caisse.ailes, m, r, fiche, poignees, laque)
	if not okA then
		warn("[CashCar] ailes : " .. tostring(errA))
		poignees.ailes = {}
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
	-- LA LAMPE DU HÉROS (4/10, « améliore les éclairages ») : la caméra de poursuite voit la caisse de DOS, souvent à contre-jour —
	-- une carrosserie terne, sans reflet. Une lampe douce, derrière et au-dessus (là où est la caméra), allume le coffre et le toit et
	-- pose un éclat sur la laque. Rien qu'une lumière (aucune pièce), et seulement sur la caisse du joueur (la vitrine du garage a
	-- ses lampes de studio).
	if nom == "MaCaisse" then
		local a = Instance.new("Attachment")
		a.Name = "LampeHeros"
		a.Position = Vector3.new(0, (fiche.h or 1.4) * 1.9 * M, (fiche.l * 0.5 + 2.4) * M)
		a.Parent = r
		local l = Instance.new("PointLight")
		l.Name = "Heros"
		l.Range = 9 * M
		l.Brightness = 1.1
		l.Color = Color3.fromRGB(255, 244, 232)
		l.Shadows = false
		l.Parent = a
		poignees.heros = l
	end

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
		f.Lifetime = NumberRange.new(0.08, 0.16)
		f.Speed = NumberRange.new(36, 58)
		f.SpreadAngle = Vector2.new(5, 5)
		f.EmissionDirection = Enum.NormalId.Back
		f.Brightness = 1.6
		f.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.7), NumberSequenceKeypoint.new(1, 0.1) })
		f.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.1), NumberSequenceKeypoint.new(1, 1) })
		f.Color = ColorSequence.new(Color3.fromRGB(255, 220, 140), cJet)
		f.Parent = a
		table.insert(poignees.flammes, f)
		-- LA PLUME DE RÉACTEUR (JETS du web, L37646) : un cône de lumière par pot — une coquille à la couleur du feu, un cœur blanc.
		-- Courte au filage (elle brûle dès qu'on roule), longue et affûtée à la nitro ; elle tremble, chaque pot à son rythme.
		-- (3e retour : la « veilleuse » en particules de feu grésillait comme un pétard — le web montre une flamme NETTE)
		local bout = Instance.new("Attachment")
		bout.Name = "Plume" .. i
		bout.Position = a.Position + Vector3.new(0, 0, 0.5)
		bout.Parent = r
		local plume = { a = a, bout = bout, z0 = a.Position, coque = nil :: any, coeur = nil :: any }
		for _, q in { { "coque", 0 }, { "coeur", 0.02 } } do
			local bm = Instance.new("Beam")
			bm.Name = "Plume_" .. q[1]
			bm.Attachment0, bm.Attachment1 = a, bout
			bm.FaceCamera = true
			bm.Segments = 1
			bm.LightEmission = 1
			bm.LightInfluence = 0
			bm.Brightness = 2
			bm.ZOffset = q[2]
			bm.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.05), NumberSequenceKeypoint.new(0.6, 0.45), NumberSequenceKeypoint.new(1, 1) })
			bm.Enabled = false
			bm.Parent = r;
			(plume :: any)[q[1]] = bm
		end
		table.insert(poignees.plumes, plume)
	end
	-- LE SILLAGE v6 (SIL, index.html L14430) : UN PAR POT (4 au plus), né dans sa bouche, long de 100 m. Deux couches dans chaque
	-- sillage : un HALO doux qui s'élargit vers le bout, et un CŒUR fin qui blanchit à la tuyère (c'est lui que le bloom attrape).
	-- Un seul pot : un sillage plus large ; trois ou quatre : un peu plus fins (ils s'additionnent).
	local np = math.min(4, #fiche.pots)
	local wu = (np == 1) and 1.4 or ((np >= 3) and 0.85 or 1)
	for i, pot in fiche.pots do
		if i > 4 then break end
		for _, couche in { { "Halo", 0.42 * wu, 1.7, 1 }, { "Coeur", 0.15 * wu, 0.7, 1 } } do -- (2e retour : à 0,56 × 2,6 et 0,21, deux cônes BLANCS larges comme la caisse — le web trace deux rubans fins, de la couleur du feu) -- (vu dans Studio a 1,5 / 3,2 : en vol, la camera dans l axe, tout l ecran partait au blanc)
			local demi = couche[2] * 0.5 * M
			local a0 = Instance.new("Attachment")
			a0.Name = "Sillage" .. couche[1] .. "H" .. i
			a0.Position = Vector3.new(pot[1] * M, pot[2] * M + demi, pot[3] * M + 0.1)
			a0.Parent = r
			local a1 = Instance.new("Attachment")
			a1.Name = "Sillage" .. couche[1] .. "B" .. i
			a1.Position = Vector3.new(pot[1] * M, pot[2] * M - demi, pot[3] * M + 0.1)
			a1.Parent = r
			local t = Instance.new("Trail")
			t.Name = couche[1]
			t.Attachment0 = a0
			t.Attachment1 = a1
			t.Lifetime = 2.2
			t.MaxLength = 100 * M
			t.MinLength = 0.3
			t.LightEmission = (couche[1] == "Halo") and 0.3 or 0.45 -- (3e retour : « des couleurs FRANCHES, le ruban doit rester orange / bleu, jamais blanc » — le web, L37700 ; en additif il blanchissait) -- (à 1, les deux couches s'additionnaient jusqu'au blanc : la couleur du feu ne se lisait plus)
			t.LightInfluence = 0
			t.Brightness = couche[4]
			t.FaceCamera = true
			t.WidthScale = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(1, couche[3]) })
			-- la queue s'éteint sur le dernier quart (24 m sur 100)
			t.Transparency = (couche[1] == "Halo")
				and NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.35), NumberSequenceKeypoint.new(0.3, 0.6), NumberSequenceKeypoint.new(0.76, 0.82), NumberSequenceKeypoint.new(1, 1) })
				or NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.1), NumberSequenceKeypoint.new(0.3, 0.4), NumberSequenceKeypoint.new(0.76, 0.66), NumberSequenceKeypoint.new(1, 1) })
			t.Color = ColorSequence.new(Color3.fromRGB(255, 160, 60), Color3.fromRGB(255, 60, 30))
			t.Enabled = false
			t.Parent = r
			table.insert(poignees.trainees, t)
		end
	end
	return m, poignees
end

-- LE FEU DE LA CAISSE : la plume des pots et les sillages, selon l'état. on = le sillage est allumé ; debit = particules par
-- seconde et par pot ; c = la couleur du feu (orange nitro, bleu de réserve, violet de la nitro infinie, or du pad, ou la
-- traînée de la boutique) ; arc = un arc-en-ciel (ColorSequence) à la place. Vers le bout, le feu tire au rouge-magenta.
local BRAISE = Color3.fromRGB(255, 40, 110)
function Caisse.feu(poignees: any, on: boolean, debit: number, c: Color3, arc: ColorSequence?, veille: boolean?)
	-- la plume : sa force (jTgt du web : .34 au filage, 1,05 à la nitro, +.4 au pad), lissée ; sa longueur et sa largeur en découlent
	do
		local t = os.clock()
		local dt = math.min(0.1, t - (poignees.jetT or t))
		poignees.jetT = t
		local nitro = on and debit >= 100
		local cible = (nitro and 1.05 or (veille and 0.34 or 0)) + ((on and not nitro) and 0.4 or 0)
		local k = (poignees.jetK or 0) + (cible - (poignees.jetK or 0)) * math.min(1, dt * 11)
		poignees.jetK = k
		local allume = k > 0.05
		local fl = 0.82 + 0.18 * math.sin(t * 57 + math.sin(t * 33) * 2.1)
		local long = nitro and 1.85 or 1
		local coque = (on and c) or Color3.fromRGB(255, 140, 48)
		local coeur = nitro and Color3.fromRGB(255, 242, 218) or Color3.fromRGB(255, 230, 176)
		for i, p in poignees.plumes or {} do
			if p.coque.Enabled ~= allume then
				p.coque.Enabled = allume
				p.coeur.Enabled = allume
			end
			if allume then
				local f9 = 0.84 + 0.16 * math.sin(t * 31 + i * 2.4) * math.sin(t * 13.7 + i * 1.7)
				local jl = math.max(0.03, 0.62 * k * 2.1 * fl * long) * f9
				local jr = (0.09 + 0.07 * k + (nitro and 0.05 or 0)) * (1.1 - 0.1 * f9)
				p.bout.Position = p.z0 + Vector3.new(0, 0, jl * M)
				p.coque.Width0, p.coque.Width1 = jr * 2.3 * M, jr * 0.5 * M
				p.coeur.Width0, p.coeur.Width1 = jr * 1.1 * M, jr * 0.12 * M
				p.coque.Color = ColorSequence.new(coque, coque:Lerp(BRAISE, 0.35))
				p.coeur.Color = ColorSequence.new(coeur)
			end
		end
	end
	local chaud = c:Lerp(Color3.new(1, 1, 1), 0.72)
	local flamme = ColorSequence.new(chaud, c)
	for _, f in poignees.flammes do
		f.Rate = debit * 0.4 -- (des braises dans la plume, plus un feu d'artifice)
		f.Color = flamme
	end
	local halo = arc or ColorSequence.new({ ColorSequenceKeypoint.new(0, c), ColorSequenceKeypoint.new(0.6, c:Lerp(BRAISE, 0.3)), ColorSequenceKeypoint.new(1, c:Lerp(BRAISE, 0.6)) })
	local coeur = arc or ColorSequence.new({ ColorSequenceKeypoint.new(0, c:Lerp(Color3.new(1, 1, 1), 0.25)), ColorSequenceKeypoint.new(0.06, c), ColorSequenceKeypoint.new(1, c:Lerp(BRAISE, 0.45)) }) -- (le cœur sortait JAUNE PÂLE : le web garde l'orange du feu jusqu'à la tuyère)
	for _, t in poignees.trainees do
		t.Enabled = on
		t.Color = (t.Name == "Coeur") and coeur or halo
	end
end

-- ════════ LES AILES (L19229) : repliées dans le flanc au sol, DÉPLOYÉES en vol. Le style de la boutique remplace celui
-- du gabarit (sauf les caisses qui n'en ont pas). Quatre styles : panneaux de planeur · hélices · plumes d'ange · chauve-souris.
-- Tout est en pièces simples, soudées à la racine par un Weld qu'on anime (Caisse.deployer).
function Caisse.ailes(m: Model, r: BasePart, fiche: any, poignees: any, laque: Color3)
	poignees.ailes = {}
	local style = fiche.ailes or "panneaux"
	local voulu = poignees.habits and poignees.habits.aile
	if style ~= "none" and voulu and voulu ~= "panneaux" then style = voulu end
	poignees.styleAiles = style
	if style == "none" then return end
	local W, H, L = fiche.w, fiche.h, fiche.l
	local accent = lumiere(Color3.fromHex(string.format("%06x", fiche.accent)))
	local SOMBRE, CHROME = Color3.fromRGB(20, 22, 26), Color3.fromRGB(232, 236, 240)
	local function piece(pivot: CFrame, s: number, taille: Vector3, cf: CFrame, couleur: Color3, matiere: Enum.Material?, pale: number?, forme: Enum.PartType?): BasePart
		local p = Instance.new("Part")
		p.Name = "Aile"
		p.Size = taille * M
		p.Color = couleur
		p.Material = matiere or Enum.Material.SmoothPlastic
		if forme then p.Shape = forme end
		p.CanCollide = false
		p.CanQuery = false
		p.CanTouch = false
		p.Massless = true
		p.CastShadow = false
		p.LocalTransparencyModifier = 1
		local w = Instance.new("Weld")
		w.Part0 = r
		w.Part1 = p
		w.C0 = pivot * cf
		w.Parent = p
		p.Parent = m
		table.insert(poignees.ailes, { w = w, p = p, pivot = pivot, cf = cf, taille = taille * M, s = s, pale = pale })
		return p
	end
	for _, s in { 1, -1 } do -- s = le côté (+X = la droite du pilote)
		local helices = style == "helices"
		local pivot = CFrame.new(s * W * 0.36 * M, (0.35 + H * (helices and 0.44 or 0.55)) * M, L * 0.14 * M)
		local function en(x: number, y: number, z: number): CFrame return CFrame.new(x * M, y * M, z * M) end
		if helices then
			for _, fz in { 1, -1 } do
				piece(pivot, s, Vector3.new(W * 0.62, 0.055, 0.10), en(s * W * 0.44, 0, -fz * L * 0.20), accent)
				piece(pivot, s, Vector3.new(0.09, 0.10, 0.10), en(s * W * 0.78, 0.05, -fz * L * 0.20) * CFrame.Angles(0, 0, math.pi / 2), SOMBRE, nil, nil, Enum.PartType.Cylinder)
				local car = piece(pivot, s, Vector3.new(0.03, 0.56, 0.56), en(s * W * 0.78, 0.09, -fz * L * 0.20) * CFrame.Angles(0, 0, math.pi / 2), CHROME, nil, nil, Enum.PartType.Cylinder)
				car.Transparency = 0.6 -- le carénage de l'hélice
				for _, b in { 0, math.pi / 2 } do
					piece(pivot, s, Vector3.new(0.52, 0.016, 0.085), en(s * W * 0.78, 0.09, -fz * L * 0.20), accent, nil, b)
				end
			end
		elseif style == "plumes" then
			-- PLUMES D'ANGE : six rémiges en éventail, de la plus longue (devant) à la plus courte, pointe dorée
			local BLANC, OR = Color3.fromRGB(251, 248, 240), Color3.fromRGB(255, 215, 94)
			for k = 0, 5 do
				local ln = W * (1.18 - k * 0.13)
				local rot = CFrame.Angles(0, s * (k * 0.19 - 0.05), 0)
				piece(pivot, s, Vector3.new(ln, 0.05, 0.26), rot * en(s * ln / 2, -k * 0.012, 0), BLANC)
				piece(pivot, s, Vector3.new(ln * 0.22, 0.055, 0.20), rot * en(s * ln * 0.9, -k * 0.012, 0), OR, Enum.Material.Neon)
			end
			piece(pivot, s, Vector3.new(W * 0.42, 0.08, 0.46), en(s * W * 0.2, 0.03, 0.05), BLANC)
		elseif style == "chauve" then
			-- CHAUVE-SOURIS : une membrane festonnée (des lames qui raccourcissent) tendue entre des doigts d'os
			local MEMBRANE, OS = Color3.fromRGB(58, 20, 74), Color3.fromRGB(20, 16, 26)
			local Wd = W * 1.15
			-- le bord de fuite : { x, profondeur } du jeu web, rendu par des lames de 1/8 d'envergure
			local bord = { { 0, 0.62 }, { 0.18, 0.56 }, { 0.36, 0.86 }, { 0.48, 0.46 }, { 0.66, 0.70 }, { 0.76, 0.30 }, { 0.92, 0.42 }, { 1, 0.02 } }
			for k = 1, #bord - 1 do
				local a, b = bord[k], bord[k + 1]
				local x0, x1 = a[1] * Wd, b[1] * Wd
				local prof = math.max(0.08, (a[2] + b[2]) / 2 + 0.17)
				piece(pivot, s, Vector3.new(x1 - x0, 0.025, prof), en(s * (x0 + x1) / 2, 0, prof / 2 - 0.17), MEMBRANE)
			end
			for _, q in { { Wd, 0.02 }, { Wd * 0.66, 0.70 }, { Wd * 0.36, 0.86 } } do
				local ln = math.sqrt(q[1] * q[1] + q[2] * q[2])
				piece(pivot, s, Vector3.new(ln, 0.05, 0.05), CFrame.Angles(0, -s * math.atan2(q[2], q[1]), 0) * en(s * ln / 2, 0.02, 0), OS)
			end
			piece(pivot, s, Vector3.new(Wd * 0.56, 0.07, 0.07), en(s * Wd * 0.28, 0.03, -0.17), OS)
		else
			-- PANNEAUX : la planche de planeur et son saumon
			piece(pivot, s, Vector3.new(W * 0.92, 0.05, L * 0.32), en(s * W * 0.5, 0, 0), accent)
			piece(pivot, s, Vector3.new(W * 0.28, 0.04, L * 0.14), en(s * W * 0.92, 0.06, L * 0.08) * CFrame.Angles(-0.2, 0, 0), laque)
		end
	end
end
-- t = le déploiement (0 rentrées dans le flanc, 1 sorties) ; tour = l'angle des hélices
function Caisse.deployer(poignees: any, t: number, tour: number?)
	local ailes = poignees.ailes
	if not ailes or #ailes == 0 then return end
	local k = 0.05 + 0.95 * t
	local cache = t < 0.04
	for _, a in ailes do
		a.p.LocalTransparencyModifier = cache and 1 or 0
		if not cache then
			local c = a.cf
			local rot = c.Rotation
			if a.pale then rot = rot * CFrame.Angles(0, (tour or 0) + a.pale, 0) end
			-- elles SORTENT du flanc (l'envergure s'étire) et prennent un léger dièdre de planeur
			a.w.C0 = a.pivot * CFrame.Angles(0, 0, a.s * 0.16 * t) * CFrame.new(c.X * k, c.Y, c.Z) * rot
			if not a.pale then a.p.Size = Vector3.new(math.max(0.05, a.taille.X * k), a.taille.Y, a.taille.Z) end
		end
	end
end

-- LA VIGNETTE : la caisse entière (corps + quatre roues) en UN maillage, pour les photos du garage (ViewportFrame).
-- Rend un Model (une seule pièce) centré sur l'origine de la caisse, ou nil.
-- Détruire une caisse (ou une vignette) ET rendre ses maillages au budget de Roblox (voir Maillage.rendre)
function Caisse.rendre(m: Instance?)
	if not m then return end
	local Client = script.Parent:FindFirstChild("Client")
	local mMaillage = Client and Client:FindFirstChild("Maillage")
	local ok, Maillage = pcall(function() return require(mMaillage) end)
	if ok and Maillage and Maillage.rendre then Maillage.rendre(m) else m:Destroy() end
end

function Caisse.vignette(indice: number): Model?
	local module = Formes:FindFirstChild(string.format("F%02d", indice))
	local Client = script.Parent:FindFirstChild("Client")
	local mMaillage = Client and Client:FindFirstChild("Maillage")
	if not module or not mMaillage then return nil end
	local okD, donnees = pcall(require, module)
	local okM, Maillage = pcall(require, mMaillage)
	if not okD or not okM then return nil end
	local liste = {}
	for _, d in donnees.corps do table.insert(liste, { d = d }) end
	for _, ro in Catalogue[indice].roues do
		for _, d in donnees.roue do
			table.insert(liste, { d = d, cf = CFrame.new(ro[1], ro[2], ro[3]), miroir = ro[4] })
		end
	end
	local mp, centre = Maillage.fusion(liste, 1, lumiere) -- en mètres : une vignette n'a pas besoin de l'échelle du monde
	if not mp then return nil end
	local m = Instance.new("Model")
	m.Name = "Vignette" .. indice
	mp.Name = "Corps"
	mp.Material = Enum.Material.SmoothPlastic
	mp.Color = Color3.new(1, 1, 1)
	mp.Reflectance = 0.06
	mp.CFrame = CFrame.new(centre)
	mp.Parent = m
	m.PrimaryPart = mp
	return m
end

-- fait tourner les roues d'une caisse : avance = distance parcourue depuis la dernière image (studs, signée)
-- `sus` (m) : la carrosserie descendue sur ses ressorts — les roues remontent d'autant dans son repère, elles restent au sol
function Caisse.rouler(poignees: any, avance: number, sus: number?)
	if #poignees.essieux == 0 then return end
	poignees.angle = (poignees.angle or 0) + avance / math.max(0.1, poignees.rayons[1])
	local rot = CFrame.Angles(-poignees.angle, 0, 0)
	local haut = CFrame.new(0, -(sus or 0) * M, 0)
	for i, w in poignees.essieux do
		w.C0 = haut * poignees.bases[i] * rot
	end
end

return Caisse
