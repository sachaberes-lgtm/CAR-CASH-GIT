-- CASH CAR — LE PILOTE. Toute la partie tourne ICI, chez le joueur : la physique de la caisse, le vol,
-- les atterrissages, les figures, l'argent, le moteur, la caméra. Le serveur ne sait que la graine de la
-- route et le montant final (pour le classement).
--
-- Les formules sont celles du jeu web, ligne pour ligne (index.html, numéros en commentaire) :
--   vA = la vitesse « du jeu » ; le monde avance de vA·SPD mètres par seconde ; km/h = vA·3,6·SPD.
--   s  = la distance le long de la route (m), lat = l'écart latéral (m, droite +), psi = le cap de la
--        caisse par rapport à la route (rad, droite +), side = la face (+1 dessus, −1 dessous).
-- En vol : fallPos (m, monde), fallVel (unités vA), airRot = l'orientation de la caisse.
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local joueur = Players.LocalPlayer
local CC = ReplicatedStorage:WaitForChild("CashCar")
local Config = require(CC:WaitForChild("Config"))
local Piste = require(CC:WaitForChild("Piste"))
local CL = CC:WaitForChild("Client")
local Construction = require(CL:WaitForChild("Construction"))
local Hud = require(CL:WaitForChild("Hud"))
local Sons = require(CL:WaitForChild("Sons"))
local Controles = require(CL:WaitForChild("Controles"))
local Mer = require(CL:WaitForChild("Mer"))

local M, SPD = Config.M, Config.SPD
local RH, THICK = Config.ROAD_HALF, Config.THICK
local GRAV, FALL_G = Config.GRAV, Config.FALL_G
local NI = Config.NITRO
local MOT = Config.MOTEURS
local O = Config.OBJETS
local E = Hud.E
local T = Hud.T
local FR = Hud.FR

local cam = workspace.CurrentCamera
Hud.creer()
Hud.ecran("charge")

-- ════════ la graine, la caisse ════════
local graine = CC:GetAttribute("Graine")
while not graine do
	CC:GetAttributeChangedSignal("Graine"):Wait()
	graine = CC:GetAttribute("Graine")
end
local evFin = CC:WaitForChild("FinPartie")
local evEtat = CC:WaitForChild("EtatCaisse")
local evRecord = CC:WaitForChild("Record")

local Caisse = require(CC:WaitForChild("Caisse"))
local evPos = CC:WaitForChild("PosCaisse")
local dossierCaisses = workspace:WaitForChild("Caisses")
-- La caisse du serveur n'est qu'une boîte aux lettres (sa position part vers les autres joueurs) : chez moi
-- elle est cachée, et je dessine la MIENNE, ancrée, collée à ma physique. (1re version : la caisse du
-- serveur pilotée par « propriété réseau » — sans avatar, Roblox ne la donnait pas : caisse invisible.)
local function cacher(m: Instance)
	for _, d in m:GetDescendants() do
		if d:IsA("BasePart") then d.LocalTransparencyModifier = 1
		elseif d:IsA("ParticleEmitter") or d:IsA("Trail") or d:IsA("Light") then d.Enabled = false end
	end
end
local caisseServeur = dossierCaisses:WaitForChild(joueur.Name) :: Model
cacher(caisseServeur)
local caisse = Caisse.construire("MaCaisse", caisseServeur:GetAttribute("Couleur") or Color3.fromRGB(255, 122, 26), true)
caisse.Parent = workspace
local racine = caisse.PrimaryPart :: BasePart
local flammes, trainees = {}, {}
for i = 1, 2 do
	local a = racine:WaitForChild("Tuyere" .. i)
	table.insert(flammes, a:WaitForChild("Flamme" .. i))
	table.insert(trainees, racine:WaitForChild("Trainee" .. i))
end
local reflet = racine:WaitForChild("RefletNitro") :: PointLight
local visibleCaisse = true
local function montrerCaisse(oui: boolean)
	if visibleCaisse == oui then return end
	visibleCaisse = oui
	for _, p in caisse:GetDescendants() do
		if p:IsA("BasePart") then p.LocalTransparencyModifier = oui and 0 or 1 end
	end
	for _, f in flammes do f.Enabled = oui end
	for _, t in trainees do if not oui then t.Enabled = false end end
end

local record, compte, meilleurAura = 0, 0, 0
evRecord.OnClientEvent:Connect(function(v, c)
	if type(v) == "number" then
		record = math.max(record, v)
		E.menuRecord.Text = record > 0 and (T.record .. " " .. Hud.argent(record)) or ""
	end
	if type(c) == "number" then
		compte = c
		if E.mort.Visible then E.mCompte.Text = T.compte .. " " .. Hud.argent(compte) end
	end
end)

-- ════════ les zones : la 1 est gardée toute la session, les suivantes se bâtissent en tâche de fond ════════
type Zone = { z: number, pret: boolean, piste: Piste.Piste?, dossier: Folder?, objets: { any }?, grille: { [number]: { any } }? }
local ZONES: { [number]: Zone } = {}
local CEL_OBJ = 25 * M
local function cleObj(v: Vector3): number
	return (math.floor(v.X / CEL_OBJ) + 4096) * 67108864 + (math.floor(v.Y / CEL_OBJ) + 4096) * 8192 + (math.floor(v.Z / CEL_OBJ) + 4096)
end

local function preparer(z: number, depart: CFrame?): Zone
	if ZONES[z] then return ZONES[z] end
	local e: Zone = { z = z, pret = false }
	ZONES[z] = e
	task.spawn(function()
		local function ceder() task.wait() end
		local p = Piste.generer(graine, z, depart, ceder)
		local d = Instance.new("Folder")
		d.Name = "Zone" .. z
		Construction.route(p, d, ceder)
		Construction.portail(p, d)
		local objs = Construction.objets(p, d, ceder)
		table.sort(objs, function(a, b) return a.o.s < b.o.s end)
		local grille = {}
		for _, o in objs do
			local k = cleObj(o.pos)
			grille[k] = grille[k] or {}
			table.insert(grille[k], o)
		end
		Construction.nuages(p, d, graine + z, ceder)
		e.piste, e.dossier, e.objets, e.grille = p, d, objs, grille
		e.pret = true
	end)
	return e
end
local function oublier(z: number)
	local e = ZONES[z]
	if not e or z <= 2 then return end -- la 1 et la 2 restent en réserve (on y revient à chaque partie)
	if e.dossier then e.dossier:Destroy() end
	ZONES[z] = nil
end
local function remettreObjets(e: Zone)
	for _, o in e.objets or {} do
		o.pris = false
		o.aimante = nil
		o.p.CFrame = o.base
		o.p.Parent = e.dossier
	end
end

-- ════════ l'état de la partie ════════
local mode = "charge" -- charge | menu | depart | drive | fall | boom | mort
local enPause = false
local zoneN = 1
local zone: Zone
local piste: Piste.Piste
local s, lat, side, vA, psi, yawR, steerS, momT = 0, 0, 1, 0, 0, 0, 0, 0
local boost, padCd, padTrain, padDernier = 0, 0, 0, -99
local nitroR, nitroOn, nitroAirT, kickT, ntrHold, ntrBoost = 2, false, 0, 0, 0, 0
local coinsGot, tier, combo, dernierePiece = 0, 0, 0, -99
local argent, aura = Config.CASH_DEPART, 0
local pwN, pwA, pwV, pwM = 0, 0, 0, 0
local arretT, graceT, hitT = 0, 0, 0
local distAvant, vmax, nbFig, serie, nbZones = 0, 0, 0, 0, 0
-- vol
local fallPos, fallVel, prevPos = Vector3.zero, Vector3.zero, Vector3.zero
local airRot = CFrame.identity
local fallT, fallTR, fallVH0, yawAcc, demiTours, dolphT, dolphPop, bumpCd, sDecol = 0, 0, 0, 0, 0, 0, 0, 0, 0
local chainVal, chainMult, auraChaine, vus, echelon = 0, 1, 0, {}, 0
local boomT, boomPos, causeMort = 0, Vector3.zero, "autre"
local tempsDepart = 0
local secousse = 0 -- la vibration de caméra (atterrissage, explosion)
local intro = false                          -- la CHUTE du départ : la caisse tombe du ciel sur la route
local multiMax, piecesPrises = 1, 0
local astucesVues = {}
local eclats: { { p: BasePart, v: Vector3, r: Vector3, t: number } } = {}
local carCF = CFrame.identity
local carVel = Vector3.zero

local function pousseMoteur(): number return MOT[tier + 1][2] end
local function tardif(): number return 1 + math.min(0.5, math.max(0, tier - 8) * 0.035) end
local function reservoir(): number return NI.resMin + (NI.resMax - NI.resMin) * tier / (#MOT - 1) end
local function denom(): number return Config.DENOMS[tier + 1] * 0.25 end
local function vmaxShow(): number return 190 * SPD * tardif() * pousseMoteur() end
local function vitMult(): number return math.min(2.6, (pwV > 0 and 2 or 1) * (1 + ntrBoost)) end
local function kmh(): number return math.abs(vA) * 3.6 * SPD * vitMult() end

local function repere(sM: number, face: number): CFrame
	return Piste.repereFace(piste, sM * M, face)
end

-- ════════ l'argent, le moteur, l'aura ════════
local function ajouterPieces(n: number)
	coinsGot += n
	local avant = tier
	while tier < #MOT - 1 and coinsGot >= MOT[tier + 2][1] do tier += 1 end
	if tier > avant then
		Hud.pop(T.moteur .. " " .. tier, Hud.C.or_, 26)
		Sons.jouer("nitroPlein", 1.1)
	end
end

local ECHELLE = { { 2, "x2 CHAUD !" }, { 3, "x3 EN FEU !" }, { 4.5, FR and "x4.5 MILLIONNAIRE" or "x4.5 MILLIONAIRE" }, { 6, "x6 JACKPOT MAX" } }
local function figure(nom: string, val: number, auraV: number)
	local n = (vus[nom] or 0) + 1
	vus[nom] = n
	chainVal += val * 0.6 ^ (n - 1)
	chainMult += (n == 1) and 0.5 or 0.15
	auraChaine += auraV * 0.7 ^ (n - 1)
	nbFig += 1
	Hud.pop(nom, Hud.C.or_)
	Sons.jouer("maillon", Sons.demiTons(math.min(12, nbFig * 2)))
	while echelon < #ECHELLE and chainMult >= ECHELLE[echelon + 1][1] do
		echelon += 1
		Hud.grand(ECHELLE[echelon][2], echelon >= 3 and Hud.C.magenta or Hud.C.or_, 0.7)
	end
end

-- ════════ la nitro ════════
local function gererNitro(dt: number, auSol: boolean)
	local res = reservoir()
	local veut = Controles.nitro
	local avant = nitroOn
	if pwN > 0 then
		nitroR = res
		nitroOn = veut
	else
		if veut and (nitroOn and nitroR > 0.005 or nitroR > NI.seuil) then
			nitroOn = true
			nitroR -= NI.vide * dt
		else
			nitroOn = false
		end
		if not nitroOn then nitroR = math.min(res, nitroR + NI.regen * dt) end
		nitroR = math.max(0, nitroR)
	end
	if nitroOn and not avant and not auSol and kickT <= 0 then
		-- le coup de pied à l'allumage en vol (L36221) : +46·poussée, une fois par 0,5 s, 12 % du réservoir
		fallVel += (fallVel.Magnitude > 1 and fallVel.Unit or airRot.LookVector) * NI.coupAir * pousseMoteur()
		kickT = 0.5
		if pwN <= 0 then nitroR = math.max(0, nitroR - res * 0.12) end
	end
	-- NITROOO (L29222) : tenue 2 s au-dessus de min(400, 0,55·vmax) km/h → la vitesse se capitalise (+10 %/s)
	if nitroOn and kmh() > math.min(400, 0.55 * vmaxShow()) then
		ntrHold += dt
		if ntrHold >= 2 then
			if ntrBoost == 0 then Hud.grand("NITROOO !", Color3.fromRGB(255, 122, 36), 0.8); aura += 120 end
			ntrBoost = (1 + ntrBoost) * (1.10 ^ dt) - 1 + 1e-6
		end
	else
		ntrHold = 0
		ntrBoost = math.max(0, ntrBoost - dt * 0.6)
	end
	if avant ~= nitroOn then evEtat:FireServer("nitro", nitroOn) end
end

-- ════════ décoller (startFall, L29730) ════════
local function astuce(i: number)
	if astucesVues[i] then return end
	astucesVues[i] = true
	Hud.astuce((Hud.tactile and T.astucesTactile or T.astuces)[i], 6)
end
local function decoller(impU: number, impF: number)
	local cf = repere(s, side)
	local T_, B, N = cf.LookVector, cf.RightVector, cf.UpVector
	local vL = vA * math.sin(psi)
	fallPos = carCF.Position / M + N * 0.6
	fallVel = T_ * (vA * impF * vitMult()) + B * (vL * vitMult()) + N * impU
	if fallVel.Y > 70 then fallVel = Vector3.new(fallVel.X, 70, fallVel.Z) end
	prevPos = fallPos
	airRot = carCF.Rotation
	if not intro then task.delay(0.6, function() if mode == "fall" then astuce(2) end end) end
	fallT, fallTR, yawAcc, demiTours, dolphT, dolphPop, nitroAirT, bumpCd = 0, 0, 0, 0, 0, 0, 0, 0
	fallVH0 = Vector3.new(fallVel.X, 0, fallVel.Z).Magnitude
	chainVal, chainMult, auraChaine, echelon = 0, 1, 0, 0
	table.clear(vus)
	sDecol = s
	mode = "fall"
	Sons.jouer("decollage")
end

-- ════════ exploser ════════
local function exploser(cause: string)
	if mode == "boom" or mode == "mort" then return end
	causeMort = cause
	boomPos = carCF.Position
	if chainVal > 0 and mode == "fall" then
		Hud.pop(FR and "CHAINE PERDUE" or "CHAIN LOST", Hud.C.rouge)
	end
	mode = "boom"
	boomT = 0
	nitroOn = false
	-- l'amas de cubes de feu + les éclats de carrosserie (pièces locales, rendues au bout de 2,5 s)
	for _, e in eclats do e.p:Destroy() end
	table.clear(eclats)
	local rnd = Random.new()
	local tons = { Color3.fromRGB(255, 60, 50), Color3.fromRGB(255, 96, 60), Color3.fromRGB(230, 40, 60), Color3.fromRGB(255, 150, 60), Color3.fromRGB(90, 40, 60) }
	for k = 1, 34 do
		local feu = k <= 24
		local p = Instance.new("Part")
		p.Anchored = true
		p.CanCollide = false
		p.CanQuery = false
		p.CanTouch = false
		p.CastShadow = false
		p.Material = feu and Enum.Material.Neon or Enum.Material.SmoothPlastic
		local plancher = caisse:FindFirstChild("Plancher") :: BasePart?
		p.Color = feu and tons[rnd:NextInteger(1, #tons)] or (plancher and plancher.Color or Color3.fromRGB(255, 122, 26))
		local t = (feu and rnd:NextNumber(1.2, 2.6) or rnd:NextNumber(0.6, 1.4)) * M
		p.Size = feu and Vector3.new(t, t, t) or Vector3.new(t * 1.6, t * 0.25, t)
		p.CFrame = CFrame.new(boomPos + Vector3.new(rnd:NextNumber(-1, 1), rnd:NextNumber(-0.5, 1), rnd:NextNumber(-1, 1)) * M)
		p.Parent = workspace
		local dir = Vector3.new(rnd:NextNumber(-1, 1), rnd:NextNumber(-0.2, 1), rnd:NextNumber(-1, 1)).Unit
		table.insert(eclats, { p = p, v = dir * (feu and rnd:NextNumber(3, 9) or rnd:NextNumber(14, 30)) * M,
			r = Vector3.new(rnd:NextNumber(-6, 6), rnd:NextNumber(-6, 6), rnd:NextNumber(-6, 6)), t = feu and 1 or 0 })
	end
	Sons.jouer("explosion")
	montrerCaisse(false)
	evEtat:FireServer("course", false)
	E.air.Visible = false
end

-- ════════ atterrir (tryLand, L29832) ════════
local voisins: { number } = {}
local function atterrir(j: number, face: number, latX: number, sX: number)
	side = face
	s = sX
	if intro then
		-- la CHUTE du départ se pose : la course commence (ni note, ni perte de vitesse)
		intro = false
		lat = (face > 0) and latX or -latX
		vA, psi, yawR = 40, 0, 0
		mode = "drive"
		graceT = 0.3
		fallT, fallTR = 0, 0
		E.air.Visible = false
		Hud.grand(T.niveau, Hud.C.texte, 1.8)
		Sons.jouer("go")
		Sons.jouer("poseChoc")
		secousse = 0.6
		task.delay(1.2, function() astuce(1) end)
		task.delay(16, function() astuce(3) end)
		return
	end
	local cf = repere(s, side)
	local T_, B, N = cf.LookVector, cf.RightVector, cf.UpVector
	local vM = vitMult()
	local vT, vB, vN = fallVel:Dot(T_), fallVel:Dot(B), fallVel:Dot(N)
	lat = (face > 0) and latX or -latX
	vA = vT / vM
	psi = math.clamp(math.atan2(vB * 0.4, math.abs(vT) + 1), -1.4, 1.4)
	local perte = math.min(0.52, math.max(0, fallT - 0.8) * 0.15 + math.abs(vN) * 0.008)
	vA *= 1 - perte
	local impact = math.abs(vN)
	-- la note de la pose
	local angle = math.deg(math.acos(math.clamp(airRot.UpVector:Dot(N), -1, 1)))
	local g, note, couleur, auraPose = 1, nil, Hud.C.texte, 0
	if angle > 55 then
		g, note, couleur = 0.65, FR and "DE TRAVERS" or "SIDEWAYS", Hud.C.rouge
		Sons.jouer("poseLourde")
	elseif impact < 4.5 and perte < 0.2 then
		g, note, couleur, auraPose = 1.5, FR and "PARFAIT !" or "PERFECT!", Hud.C.or_, 70
		hitT = 0.08
		Sons.jouer("poseParfait")
	elseif impact >= 10 then
		g, note, couleur = 0.65, FR and "POSE LOURD" or "HEAVY LANDING", Hud.C.rouge
		Sons.jouer("poseLourde")
	else
		Sons.jouer("poseChoc")
	end
	local reste = Config.AIR_MAX - fallTR
	if pwA <= 0 and reste <= 0.10 then
		note, auraPose = FR and "AU CHEVEU !" or "BY A HAIR!", auraPose + 220
	elseif pwA <= 0 and reste <= 0.30 then
		note, auraPose = FR and "A L'ARRACHEE !" or "JUST MADE IT!", auraPose + 120
	end
	if math.abs(lat) < 0.3 * RH then
		chainVal += 4
		chainMult += 0.2
		auraPose += 30
	end
	if s - sDecol >= 60 then
		auraPose += 150
		Hud.grand((FR and "RACCOURCI +" or "SHORTCUT +") .. math.floor(s - sDecol) .. " M", Hud.C.cyan, 0.9)
	end
	if face < 0 then auraPose += 80 end
	serie = (g >= 1) and serie + 1 or 0
	local faceMul = (face < 0) and 2 or 1
	local serieMul = (serie >= 2) and (1 + math.min(1, serie * 0.1)) or 1
	multiMax = math.max(multiMax, math.min(6, chainMult))
	local qG = chainVal * math.min(6, chainMult) * g * faceMul * serieMul
	local res = reservoir()
	local gainN = res * NI.pose
	if chainVal > 0 then
		ajouterPieces(math.clamp(math.floor(2 + qG / 6 + 0.5), 2, 18))
		gainN += math.min(1.2, 0.45 + chainMult * 0.12) * (g >= 2 and 2 or g >= 1.5 and 1.5 or 1)
	end
	nitroR = math.min(res, nitroR + gainN)
	local gainA = math.floor((auraChaine + auraPose) * math.min(6, chainMult) * g * faceMul + 0.5)
	if gainA > 0 then
		aura += gainA
		E.chaine.Text = "+" .. Hud.entier(gainA) .. " " .. T.aura .. (face < 0 and (FR and "  · FACE CACHEE x2" or "  · UNDERSIDE x2") or "")
		E.chaine.TextColor3 = Hud.C.magenta
		task.delay(1.6, function() if mode ~= "fall" then E.chaine.Text = "" end end)
		if chainVal > 0 then Sons.jouer("encaisse") end
	end
	if note then Hud.pop(note, couleur, 26) end
	mode = "drive"
	graceT = 0.15
	E.air.Visible = false
end

local function essayerAtterrir(dt: number)
	local pos = fallPos * M
	local prev = prevPos * M
	local DSm = piste.DS / M
	local bestJ, bestFace, bestLat, bestS, bestD = nil, 1, 0, 0, math.huge
	local dolphH = math.huge
	local vol = (fallPos - prevPos).Magnitude
	for _, j in Piste.autour(piste, pos, voisins) do
		local F = piste.F[j]
		local lc = F:PointToObjectSpace(pos)
		local lp = F:PointToObjectSpace(prev)
		local h, hp = lc.Y / M, lp.Y / M
		local la, z = lc.X / M, -lc.Z / M
		local N = F.UpVector
		local vN = fallVel:Dot(N)
		local tranche = DSm * 0.6 + vol
		if math.abs(z) <= tranche then
			-- la face du DESSUS
			local ok, lx, zx = false, la, z
			if hp >= 0 and h < 0 then
				local t = hp / (hp - h)
				lx = (lp.X + (lc.X - lp.X) * t) / M
				zx = -(lp.Z + (lc.Z - lp.Z) * t) / M
				ok = math.abs(zx) <= DSm * 0.6
			elseif fallT > 0.35 and h > -1.2 and h < 3 and vN < 4.5 and math.abs(z) <= DSm * 0.6 then
				ok = true
			end
			if ok and math.abs(lx) < RH and math.abs(h) < bestD then
				bestJ, bestFace, bestLat, bestS, bestD = j, 1, lx, (j - 1) * DSm + zx, math.abs(h)
			end
			-- la face du DESSOUS (on s'y colle en remontant)
			local ok2, lx2, zx2 = false, la, z
			if hp <= -THICK and h > -THICK then
				local t = (hp + THICK) / (hp - h)
				lx2 = (lp.X + (lc.X - lp.X) * t) / M
				zx2 = -(lp.Z + (lc.Z - lp.Z) * t) / M
				ok2 = math.abs(zx2) <= DSm * 0.6
			elseif fallT > 0.35 and h > -THICK - 3 and h < -THICK + 1.2 and vN > -4.5 and math.abs(z) <= DSm * 0.6 then
				ok2 = true
			end
			if ok2 and math.abs(lx2) < RH and math.abs(h + THICK) < bestD then
				bestJ, bestFace, bestLat, bestS, bestD = j, -1, lx2, (j - 1) * DSm + zx2, math.abs(h + THICK)
			end
			-- le radar du DAUPHIN : une dalle 2,2-12 m sous la caisse
			if math.abs(la) < RH and h > 2.2 and h < 12 and h < dolphH then dolphH = h end
			-- la TRANCHE de la dalle (BUMP, L29858) : on rebondit dessus au lieu de la traverser
			if bumpCd <= 0 and math.abs(la) >= RH and math.abs(la) < RH + 2.6 and h > -THICK - 0.8 and h < 0.8 and math.abs(z) <= DSm * 0.6 then
				local B = F.RightVector
				local vB = fallVel:Dot(B)
				if vB * math.sign(la) < -3 then
					fallVel += B * (-vB * 1.65)
					fallVel *= 0.78
					fallVel += Vector3.new(0, 2.4, 0)
					fallPos = (F.Position + B * (math.sign(la) * (RH + 1.8) * M) + F.UpVector * lc.Y) / M
					bumpCd = 0.35
					fallTR *= 0.5
					nitroR = math.min(reservoir(), nitroR + 0.35)
					figure("BUMP", 0, 30)
					Sons.jouer("poseChoc", 1.3)
				end
			end
		end
	end
	if dolphH < math.huge then
		local prox = 1 - (dolphH - 2.2) / 9.8
		chainVal += 14 * prox * prox * dt
		dolphT += dt
		if dolphPop == 0 and dolphT > 0.4 then
			dolphPop = 1
			figure(FR and "LE DAUPHIN" or "THE DOLPHIN", 0, 150)
		elseif dolphPop == 1 and dolphT > 2.4 then
			dolphPop = 2
			figure(FR and "DAUPHIN ROYAL" or "ROYAL DOLPHIN", 6, 150)
		end
	end
	if bestJ then atterrir(bestJ, bestFace, bestLat, bestS) end
end

-- ════════ les objets ════════
local oi = 1
local function ramasser(o: any)
	o.pris = true
	o.p.Parent = nil
	local k = o.o.kind
	if k == "piece" then
		local t = os.clock()
		combo = (t - dernierePiece < O.combo) and combo + 1 or 1
		dernierePiece = t
		local mult = math.min(2.5, 1 + 0.5 * math.floor(combo / 5))
		argent += denom() * 2.2 * mult
		piecesPrises += 1
		ajouterPieces(1)
		Sons.jouer("piece", Sons.demiTons(({ 0, 2, 4, 7, 9, 12, 14, 16 })[((combo - 1) % 8) + 1]))
	elseif k == "pad" then
		if padCd > 0 then return end
		padTrain = (os.clock() - padDernier < 14) and math.min(5, padTrain + 1) or 1
		padDernier = os.clock()
		vA += O.padPousse + 5 * (padTrain - 1)
		boost = O.padBoost + 0.2 * padTrain
		padCd = 1.5
		nitroR = math.min(reservoir(), nitroR + 0.12)
		Sons.jouer("pad", Sons.demiTons((padTrain - 1) * 2))
		if padTrain >= 2 then Hud.pop("BOOST x" .. padTrain, Color3.fromRGB(255, 176, 64)) end
	elseif k == "cristal" then
		local pw = Config.POUVOIRS[o.o.pw]
		if o.o.pw == "n" then pwN = pw.duree elseif o.o.pw == "a" then pwA = pw.duree
		elseif o.o.pw == "v" then pwV = pw.duree else pwM = pw.duree end
		Hud.grand(Hud.FR and pw.nom or pw.nomEN, pw.couleur, 1)
		Sons.jouer("nitroPlein")
		aura += 50
		-- le cristal de l'autre face disparaît avec lui (on ne le prend qu'une fois)
		for _, x in zone.objets :: { any } do
			if x ~= o and x.o.kind == "cristal" and math.abs(x.o.s - o.o.s) < 1 and not x.pris then
				x.pris = true
				x.p.Parent = nil
			end
		end
	end
end

local function objets(dt: number, pos: Vector3, t: number)
	local objs = zone.objets :: { any }
	-- les pièces proches tournent (les autres dorment : zéro coût)
	local sM = s * M
	while oi <= #objs and objs[oi].o.s < sM - 60 * M do oi += 1 end
	local ang = CFrame.Angles(0, t * 3, 0)
	for k = oi, #objs do
		local o = objs[k]
		if o.o.s > sM + 160 * M then break end
		if not o.pris and o.o.kind ~= "pad" and not o.aimante then o.p.CFrame = o.base * ang end
	end
	-- ramassage et aimant, par la grille (marche au sol comme en vol)
	local rayonA = (pwM > 0) and 50 or ((mode == "drive") and O.aimant or 0)
	local r = math.max(1, math.ceil(rayonA * M / CEL_OBJ))
	local cx, cy, cz = math.floor(pos.X / CEL_OBJ), math.floor(pos.Y / CEL_OBJ), math.floor(pos.Z / CEL_OBJ)
	local g = zone.grille :: { [number]: { any } }
	for dx = -r, r do
		for dy = -r, r do
			for dz = -r, r do
				local l = g[(cx + dx + 4096) * 67108864 + (cy + dy + 4096) * 8192 + (cz + dz + 4096)]
				if l then
					for _, o in l do
						if not o.pris and (mode ~= "drive" or o.o.face == side) then
							local d = (o.p.Position - pos).Magnitude / M
							if o.o.kind == "pad" then
								if mode == "drive" and o.o.face == side then
									local loc = carCF:PointToObjectSpace(o.pos)
									if math.abs(loc.X) < 4.1 * M and math.abs(loc.Z) < 6 * M then ramasser(o) end
								end
							elseif d < O.rayon + (o.o.kind == "cristal" and 1 or 0) then
								ramasser(o)
							elseif o.o.kind == "piece" and d < rayonA then
								o.aimante = true
								o.p.CFrame = o.p.CFrame:Lerp(CFrame.new(pos + carCF.UpVector * M), math.min(1, dt * 9))
							end
						end
					end
				end
			end
		end
	end
end

local camPos, camVise, camUp = Vector3.zero, Vector3.zero, Vector3.yAxis

-- ════════ changer de zone : le PORTAIL (portailPasse, L29682) ════════
local function activer(e: Zone)
	zone = e
	piste = e.piste :: Piste.Piste
	for z, x in ZONES do
		if x.dossier then x.dossier.Parent = (z == e.z) and workspace or nil end
	end
	oi = 1
	evEtat:FireServer("zone", e.z)
end
local function passerPortail(): boolean
	local suiv = ZONES[zoneN + 1]
	if not suiv or not suiv.pret then
		-- la zone suivante n'est pas prête (téléphone très lent) : la caisse patiente au bout de la route
		-- (jamais d'attente DANS la boucle de rendu : Roblox l'interdit)
		if not suiv then preparer(zoneN + 1, Piste.suite(piste)) end
		if mode == "drive" then s = piste.len / M - 0.6 end
		return false
	end
	distAvant += piste.len / M
	local ancienne = zoneN
	-- le saut vertical entre la sortie et le départ remonté : caisse, vol et caméra bougent ensemble
	local saut = (suiv.piste :: Piste.Piste).F[1].Position - piste.F[piste.n].Position
	carCF = carCF + saut
	fallPos += saut / M
	prevPos += saut / M
	camPos += saut
	camVise += saut
	s -= piste.len / M
	zoneN += 1
	nbZones += 1
	remettreObjets(suiv)
	activer(suiv)
	oublier(ancienne)
	argent += denom() * 24
	nitroR = reservoir()
	Hud.grand("ZONE " .. zoneN, Hud.C.cyan, 1.2)
	Sons.jouer("portail")
	preparer(zoneN + 1, Piste.suite(piste))
	return true
end

-- ════════ LA CONDUITE (L35625-35830) ════════
local function etapeSol(dt: number)
	local push, late = pousseMoteur(), tardif()
	local maxSp = 190 / 3.6 * late * push
	local acc9 = 22 * late * (1 + (push - 1) * 0.6)
	local cf = repere(s, side)
	local T_ = cf.LookVector
	gererNitro(dt, true)
	local frein = Controles.frein
	if not frein and math.abs(psi) < 0.25 then momT = math.min(4.3, momT + dt) else momT = math.max(0, momT - 2 * dt) end
	local momF = 1 + math.min(1.8, momT * momT * 0.1)
	local a
	if frein then
		a = (vA > 2) and -acc9 * 1.5 or -acc9 * 0.5
	else
		a = acc9 * ((vA < maxSp) and 1 or 0.55) * ((boost > 0) and 1.5 or 1) * momF
	end
	vA += a * dt
	if nitroOn then vA += NI.pousseSol * push * dt end
	vA += -GRAV * T_.Y * math.cos(psi) * dt
	vA -= vA * math.abs(vA) * (acc9 / (maxSp * maxSp * 5.8)) * dt
	vA *= 1 - 0.03 * dt
	if vA < -8 then vA = -8 end
	-- le volant (conduite v6) : le pouce commande un TAUX de lacet, pas de recentrage automatique
	local vm = vitMult()
	steerS += (Controles.volant - steerS) * math.min(1, dt * 18)
	local vw = math.max(8, math.abs(vA) * SPD)
	local lacetMax = vw / (40 + 0.3 * vw)
	local rT = steerS * lacetMax * vm * math.clamp(vA / 8, -1, 1)
	yawR += (rT - yawR) * (1 - math.exp(-dt * vm / 0.1))
	psi += yawR * dt
	local vL = vA * math.sin(psi)
	lat += vL * dt * SPD * vm
	s += vA * math.cos(psi) * dt * SPD * vm
	-- la route tourne SOUS la caisse
	local cf2 = repere(s, side)
	local dyaw = -(T_:Cross(cf2.LookVector)):Dot(cf2.UpVector)
	psi = math.clamp(psi - math.asin(math.clamp(dyaw, -1, 1)), -1.4, 1.4)
	if boost > 0 then boost -= dt end
	-- rase-bord : longer le vide recharge la nitro
	local k = kmh()
	if math.abs(lat) > 0.8 * RH and k > 0.5 * vmaxShow() then nitroR = math.min(reservoir(), nitroR + 0.22 * dt) end
	-- roule ou crève
	if tempsDepart > 1.5 and k < Config.ARRET_KMH then
		arretT += dt
		if arretT > Config.ARRET_T then exploser("arret"); return end
	else
		arretT = 0
	end
	-- on quitte la route par le bord : on VOLE
	if math.abs(lat) > RH then
		if graceT <= 0 then
			carCF = CFrame.new(cf2.Position + cf2.RightVector * lat * M) * cf2.Rotation * CFrame.Angles(0, -psi, 0)
			decoller(3.4, 1.04)
			return
		else
			lat = math.sign(lat) * RH
		end
	end
	-- dessous, trop lent : la dalle nous lâche
	if side < 0 and cf2.UpVector.Y < -0.15 and math.abs(vA) < 7 and graceT <= 0 then
		carCF = CFrame.new(cf2.Position + cf2.RightVector * lat * M) * cf2.Rotation * CFrame.Angles(0, -psi, 0)
		decoller(0.9, 1)
		return
	end
	-- le portail
	if s * M >= piste.len - 0.5 * M then passerPortail(); cf2 = repere(s, side) end
	-- la caisse posée (un soupçon de roulis dans les virages)
	local pos = cf2.Position + cf2.RightVector * lat * M
	local nouv = CFrame.new(pos) * cf2.Rotation * CFrame.Angles(0, -psi, 0) * CFrame.Angles(0, 0, -steerS * 0.05)
	carVel = (pos - carCF.Position) / math.max(dt, 1e-3)
	carCF = nouv
end

local function nbFigVol(): string
	local n = 0
	for _, v in vus do n += v end
	return n .. (FR and " FIGURE" or " TRICK") .. (n > 1 and "S" or "")
end

-- ════════ LE VOL (L36213-36467) ════════
local function etapeAir(dt: number)
	fallT += dt
	fallTR += dt
	kickT -= dt
	bumpCd -= dt
	gererNitro(dt, false)
	local vol = fallVel.Magnitude
	-- lacet : les VRILLES
	local yawRate = Controles.volant * (1.15 + math.min(0.6, vol * 0.004))
	airRot = airRot * CFrame.Angles(0, -yawRate * dt, 0)
	yawAcc += yawRate * dt
	if fallT > 0.45 then
		local dt_ = math.floor(math.abs(yawAcc) / math.pi)
		if dt_ > demiTours then
			demiTours = dt_
			local noms = { "180 !", FR and "VRILLE 360 - LAVE-LINGE" or "360 SPIN CYCLE", "540 !" }
			figure(noms[dt_] or (FR and "ESSOREUSE COSMIQUE " or "COSMIC SPINNER ") .. (dt_ * 180), 3.5 * dt_, 45)
			Sons.jouer("vrille", Sons.demiTons(math.min(12, dt_ * 2)))
		end
	end
	-- assiette : piqué / cabré (fait tourner la trajectoire avec la caisse)
	local ass = Controles.assiette
	if ass ~= 0 then
		local q = CFrame.fromAxisAngle(airRot.RightVector, -ass * (nitroOn and 1.7 or 0.85) * dt)
		airRot = q * airRot
		fallVel = q:VectorToWorldSpace(fallVel)
	end
	-- la nitro en l'air : elle porte, elle pousse
	if nitroOn then
		local dir = fallVel.Magnitude > 1 and fallVel.Unit or airRot.LookVector
		fallVel += Vector3.new(0, FALL_G * NI.portance * dt, 0)
		fallVel += dir * NI.pousseAir * pousseMoteur() * (1 + math.min(0.4, ntrBoost)) * dt
		nitroAirT += dt
		fallVH0 = math.max(fallVH0, Vector3.new(fallVel.X, 0, fallVel.Z).Magnitude)
		if nitroAirT > 1.2 and not vus["METEORE"] then figure("METEORE", 8, 100) end
		if nitroAirT >= 2 and not vus["AIR NITROOO"] then figure("AIR NITROOO", 10, 120) end
	end
	fallVel -= Vector3.new(0, FALL_G * dt, 0)
	local h = Vector3.new(fallVel.X, 0, fallVel.Z)
	if h.Magnitude > fallVH0 and h.Magnitude > 0 then
		local k = fallVH0 / h.Magnitude
		fallVel = Vector3.new(fallVel.X * k, fallVel.Y, fallVel.Z * k)
	end
	if fallT > 1.8 and not vus["BIG AIR"] and not intro then figure("BIG AIR", 4, 50); Sons.jouer("bigAir") end
	if fallT > 3.4 and not vus["AIR MONSTRE"] and not intro then figure(FR and "AIR MONSTRE" or "MONSTER AIR", 8, 110) end
	prevPos = fallPos
	fallPos += fallVel * dt * SPD
	carVel = fallVel * SPD * M
	carCF = CFrame.new(fallPos * M) * airRot
	essayerAtterrir(dt)
	if mode ~= "fall" then return end
	-- la chaîne en direct
	if chainVal > 0 then
		E.chaine.Text = "x" .. string.format("%.1f", math.min(6, chainMult)) .. "  ·  " .. nbFigVol() .. ""
		E.chaine.TextColor3 = Hud.C.cyan
	end
	-- la mort en vol
	if fallTR > Config.AIR_MAX and pwA <= 0 and not intro then
		exploser("air")
	elseif fallPos.Y * M < piste.minY - Config.MORT_SOUS * M then
		exploser("vide")
	else
		-- on traverse le portail en volant : il compte aussi (même anneau que Construction.portail)
		local f = Piste.repere(piste, piste.len - 20 * M)
		local centre = f.Position + f.UpVector * (46 * M * 0.62)
		if (fallPos * M - centre).Magnitude < 46 * M then passerPortail() end
	end
end

-- ════════ LA CAMÉRA (L36096-36170, L36389) ════════
local menuCap = Vector3.new(0, 0, -1)
local camFov = 72
local orbite = 0
local function camera(dt: number)
	if cam.CameraType ~= Enum.CameraType.Scriptable then cam.CameraType = Enum.CameraType.Scriptable end
	local CA = Config.CAM
	local vis, pos, haut, fov
	local p = carCF.Position
	if mode == "drive" or mode == "depart" then
		local cf = repere(s, side)
		local fwd = carCF.LookVector
		local N = cf.UpVector
		local vk = math.min(333, kmh())
		local recul = (CA.recul + CA.reculL + vk * 0.0018 + ((nitroOn and 0.72 or 0) + (boost > 0 and 0.5 or 0)) * 0.2 * 1.6) * M
		local hauteurC = (recul / M * CA.hauteur + vk * 0.0012) * M
		local dir = cf.LookVector:Lerp(fwd, 0.55).Unit
		pos = p - dir * recul + N * hauteurC
		vis = p + fwd * (CA.vise * M) + N * (CA.viseH * M)
		haut = N
		local r = kmh() / (vmaxShow() * 1.55)
		fov = CA.fov + math.min(16, r * 10 + math.max(0, r - 1) * 4) + (boost > 0 and 4 or 0) + (nitroOn and 7 or 0)
		camPos = camPos:Lerp(pos, math.min(1, dt * 7))
		camVise = camVise:Lerp(vis, math.min(1, dt * 9))
		camUp = camUp:Lerp(haut, math.min(1, dt * 4)).Unit
	elseif mode == "fall" then
		local big = math.clamp((fallT - 0.5) / 2.2, 0, 1)
		local h = Vector3.new(fallVel.X, 0, fallVel.Z)
		local dir = (h.Magnitude > 1) and h.Unit or Vector3.new(airRot.LookVector.X, 0, airRot.LookVector.Z).Unit
		pos = p - dir * ((9 - 2.6 * big) * M) + Vector3.yAxis * ((3.5 + 2.4 * big) * M)
		camPos = camPos:Lerp(pos, math.min(1, dt * (3 + 4.5 * big)))
		camVise = camVise:Lerp(p, math.min(1, dt * 10))
		camUp = camUp:Lerp(Vector3.yAxis, math.min(1, dt * 3)).Unit
		fov = 76 - 22 * big + (nitroOn and 13 or 0)
	elseif mode == "boom" or mode == "mort" then
		orbite += dt * 0.25
		pos = boomPos + Vector3.new(math.cos(orbite), 0.45, math.sin(orbite)) * (26 * M)
		camPos = camPos:Lerp(pos, math.min(1, dt * 2))
		camVise = camVise:Lerp(boomPos, math.min(1, dt * 4))
		camUp = camUp:Lerp(Vector3.yAxis, math.min(1, dt * 3)).Unit
		fov = 70
	else -- menu (la CHUTE du web) : vue de côté, la caisse à GAUCHE de l'écran, nez qui plonge vers la droite
		local av = Vector3.new(menuCap.X, 0, menuCap.Z).Unit
		local dr = av:Cross(Vector3.yAxis)
		pos = p - av * (5 * M) + dr * (15 * M) + Vector3.yAxis * (2.5 * M)
		camPos = camPos:Lerp(pos, math.min(1, dt * 3))
		camVise = camVise:Lerp(p + av * (6.5 * M) - Vector3.yAxis * (1.5 * M), math.min(1, dt * 4))
		camUp = Vector3.yAxis
		fov = 60
	end
	camFov += (math.min(Config.CAM.fovMax, fov) - camFov) * math.min(1, dt * 6)
	cam.FieldOfView = camFov
	-- la vibration de vitesse (relative à la caisse ; l'hyper-vitesse la calme)
	local sh = Vector3.zero
	local spdN = kmh() / math.max(1, vmaxShow())
	secousse = math.max(0, secousse - dt * 2.5)
	local amp = secousse + ((mode == "drive") and math.max(0, spdN - 0.45) * 0.05 or 0)
	if amp > 0 then
		local t = os.clock()
		sh = Vector3.new(math.noise(t * 23, 1), math.noise(t * 23, 2), math.noise(t * 23, 3)) * amp * M
	end
	if (camVise - camPos).Magnitude < 0.01 then camVise = camPos + Vector3.new(0, 0, -1) end
	cam.CFrame = CFrame.lookAt(camPos + sh, camVise, camUp)
end

-- ════════ la caisse, ses feux, ses sons ════════
local refletK = 0
local function habiller(dt: number)
	if mode == "boom" or mode == "mort" or mode == "charge" then return end
	racine.CFrame = carCF
	local feu = nitroOn or boost > 0 or ntrBoost > 0
	local couleur = pwN > 0 and ColorSequence.new(Color3.fromRGB(190, 110, 255), Color3.fromRGB(110, 40, 255))
		or (nitroOn and ColorSequence.new(Color3.fromRGB(255, 180, 70), Color3.fromRGB(255, 70, 30)))
		or ColorSequence.new(Color3.fromRGB(255, 230, 130), Color3.fromRGB(255, 170, 40))
	for i = 1, 2 do
		flammes[i].Rate = nitroOn and 110 or (boost > 0 and 45 or 0)
		trainees[i].Enabled = feu
		trainees[i].Color = couleur
	end
	refletK += ((nitroOn and 1.6 or (boost > 0 and 0.9 or 0)) - refletK) * math.min(1, dt * 8)
	reflet.Brightness = refletK
	-- les boucles de son
	local k = kmh()
	local r = math.clamp(k / math.max(1, vmaxShow() * 1.55), 0, 1.6)
	Sons.regler("moteur", (mode == "menu") and 0.12 or 0.32, 0.7 + r * 1.1 + (nitroOn and 0.1 or 0))
	Sons.regler("nitro", nitroOn and 0.45 or 0)
	Sons.regler("ventAltitude", (mode == "fall") and math.min(0.7, 0.25 + fallVel.Magnitude * 0.004) or 0.08 + r * 0.1)
	Sons.regler("musique", 0.32)
end

-- ════════ le HUD ════════
local function hud()
	E.argent.Text = '<font size="28">$</font>' .. Hud.nombre(argent)
	E.aura.Text = T.aura .. (aura > 0 and ("   " .. Hud.entier(aura)) or "")
	local res = reservoir()
	local fr = math.clamp(nitroR / res, 0, 1)
	E.nitro.Size = UDim2.fromScale(fr, 1)
	E.nitroMini.Size = UDim2.fromScale(fr, 1)
	E.nitro.BackgroundColor3 = pwN > 0 and Color3.fromRGB(170, 90, 255) or Color3.fromRGB(255, 128, 32)
	if mode == "fall" and not intro then
		E.air.Visible = true
		local reste = pwA > 0 and 1 or math.clamp(1 - fallTR / Config.AIR_MAX, 0, 1)
		local sec = string.format("%.1f", math.max(0, Config.AIR_MAX - fallTR))
		if FR then sec = string.gsub(sec, "%.", ",") end
		E.airTxt.Text = (pwA > 0 and "∞" or sec) .. ' <font size="16">' .. T.air .. "</font>"
		E.airFill.Size = UDim2.fromScale(reste, 1)
		E.airFill.BackgroundColor3 = pwA > 0 and Hud.C.magenta or ((Config.AIR_MAX - fallTR < 1.5) and Hud.C.rouge or Hud.C.cyan)
	end
	local pw = {}
	if pwN > 0 then table.insert(pw, (Hud.FR and "NITRO INF " or "INF NITRO ") .. math.ceil(pwN)) end
	if pwA > 0 then table.insert(pw, "AIR INF " .. math.ceil(pwA)) end
	if pwV > 0 then table.insert(pw, "SPEED x2 " .. math.ceil(pwV)) end
	if pwM > 0 then table.insert(pw, (Hud.FR and "AIMANT " or "MAGNET ") .. math.ceil(pwM)) end
	E.pouvoir.Text = table.concat(pw, "  ·  ")
	Hud.tick()
end

-- ════════ les parties ════════
local S_CHUTE, H_CHUTE = 150, 220 -- la caisse tombe au-dessus du point à 150 m, de 220 m de haut
local menuRot = CFrame.identity
local function poserAuDepart()
	s, lat, side, psi = S_CHUTE, 0, 1, 0
	local cf = repere(s, 1)
	local lk = cf.LookVector
	menuCap = Vector3.new(lk.X, 0, lk.Z).Unit
	local pos = cf.Position + Vector3.new(0, H_CHUTE * M, 0)
	menuRot = (CFrame.lookAt(pos, pos + menuCap) * CFrame.Angles(-math.rad(38), 0, 0)).Rotation
	carCF = CFrame.new(pos) * menuRot
	carVel = Vector3.zero
end

local function allerMenu()
	mode = "menu"
	enPause = false
	zoneN = 1
	remettreObjets(ZONES[1])
	activer(ZONES[1])
	poserAuDepart()
	montrerCaisse(true)
	camPos = carCF.Position + Vector3.yAxis * (10 * M) + menuCap:Cross(Vector3.yAxis) * (20 * M)
	camVise = carCF.Position
	Hud.ecran("menu")
	E.menuRecord.Text = record > 0 and (T.record .. " " .. Hud.argent(record)) or ""
	evEtat:FireServer("course", false)
end

local function nouvellePartie()
	zoneN = 1
	remettreObjets(ZONES[1])
	activer(ZONES[1])
	preparer(2, Piste.suite(ZONES[1].piste :: Piste.Piste))
	poserAuDepart()
	vA, yawR, steerS, momT, boost, padCd, padTrain = 0, 0, 0, 0, 0, 0, 0
	coinsGot, tier, combo = 0, 0, 0
	nitroR, nitroOn, ntrHold, ntrBoost = reservoir(), false, 0, 0
	argent, aura = Config.CASH_DEPART, 0
	pwN, pwA, pwV, pwM = 0, 0, 0, 0
	arretT, graceT, hitT = 0, 0, 0
	distAvant, vmax, nbFig, serie, nbZones = 0, 0, 0, 0, 0
	multiMax, piecesPrises = 1, 0
	tempsDepart = 0
	E.chaine.Text = ""
	E.air.Visible = false
	montrerCaisse(true)
	enPause = false
	Hud.ecran("course")
	evEtat:FireServer("course", true)
	-- la CHUTE : la caisse plonge du ciel (la pose du menu) et se pose sur la route — c'est le départ
	intro = true
	fallPos = carCF.Position / M
	fallVel = menuCap * 6 - Vector3.new(0, 60, 0) -- presque à la verticale : elle se pose PILE sur la route dessous
	prevPos = fallPos
	airRot = carCF.Rotation
	fallT, fallTR, yawAcc, demiTours, dolphT, dolphPop, nitroAirT, bumpCd = 0, 0, 0, 0, 0, 0, 0, 0
	fallVH0 = Vector3.new(fallVel.X, 0, fallVel.Z).Magnitude
	chainVal, chainMult, auraChaine, echelon = 0, 1, 0, 0
	table.clear(vus)
	sDecol = s
	mode = "fall"
	Sons.jouer("decollage")
end

local function finPartie()
	mode = "mort"
	local dist = distAvant + math.max(0, s)
	local rec = argent > record and argent > Config.CASH_DEPART + 0.01
	evFin:FireServer(argent, dist)
	if rec then record = argent end
	meilleurAura = math.max(meilleurAura, aura)
	local cause = T.morts[causeMort] or T.morts.autre
	E.mCause.Text = rec and T.nouveau or cause
	E.mRecord.Text = rec and (FR and "RECORD !" or "RECORD!") or ""
	E.mRecord.Visible = rec
	E.mCompte.Text = T.compte .. " " .. Hud.argent(compte + argent)
	E.mAura.Text = Hud.entier(aura)
	E.mAuraMeilleur.Text = T.meilleur .. " " .. Hud.entier(meilleurAura)
	E.mMoteurNom.Text = MOT[tier + 1].nom
	E.mMoteurPalier.Text = T.palier .. '  <font size="30">' .. tier .. "</font>"
	if tier < #MOT - 1 then
		E.mMoteurEncore.Text = string.format(T.encore, MOT[tier + 2][1] - coinsGot) .. "\n↑ " .. MOT[tier + 2].nom
	else
		E.mMoteurEncore.Text = T.moteurMax
	end
	E.mPartie.Text = cause .. "\n" .. T.distance .. "  " .. Hud.entier(dist) .. " M\n" .. T.pieces .. "  " .. piecesPrises
	local st = {
		{ "x" .. (FR and string.gsub(string.format("%.1f", multiMax), "%.", ",") or string.format("%.1f", multiMax)), T.multiMax },
		{ Hud.entier(vmax), T.kmhMax }, { tostring(nbZones + 1), T.zone }, { tostring(nbFig), T.figures },
	}
	for i, v in st do
		E.mStats[i][1].Text = v[1]
		E.mStats[i][2].Text = v[2]
	end
	Hud.ecran("mort")
	-- le montant s'égrène (750 ms), puis se pose
	local cible = argent
	task.spawn(function()
		local t0 = os.clock()
		while os.clock() - t0 < 0.75 do
			local u = (os.clock() - t0) / 0.75
			E.mArgent.Text = Hud.argent(cible * (1 - (1 - u) ^ 3))
			task.wait()
		end
		E.mArgent.Text = Hud.argent(cible)
		Sons.jouer(rec and "record" or "compteFin")
	end)
end

-- les boutons
E.btJouer.Activated:Connect(function() if mode == "menu" then nouvellePartie() end end)
E.btRejouer.Activated:Connect(function() if mode == "mort" then nouvellePartie() end end)
E.btMenuM.Activated:Connect(function() if mode == "mort" then allerMenu() end end)
local function basculerPause()
	if mode ~= "drive" and mode ~= "fall" then return end
	enPause = not enPause
	Hud.ecran(enPause and "pause" or "course")
end
Controles.surPause = basculerPause
E.btPause.Activated:Connect(basculerPause)
local retourReglages = "menu"
E.btReglages.Activated:Connect(function() if mode == "menu" then retourReglages = "menu"; Hud.ecran("reglages") end end)
E.btReglM.Activated:Connect(function() if mode == "mort" then retourReglages = "mort"; Hud.ecran("reglages") end end)
E.btReprendre.Activated:Connect(function()
	if enPause then basculerPause()
	elseif Hud.ecranCourant() == "reglages" then Hud.ecran(retourReglages) end
end)
E.btRecom.Activated:Connect(function() if enPause then enPause = false; nouvellePartie() end end)
E.btMenuP.Activated:Connect(function() if enPause then enPause = false; allerMenu() end end)
local function majBoutonsSon()
	E.btSonP.Text = T.son .. (Sons.actif and " ON" or " OFF")
	E.btMusP.Text = T.musique .. (Sons.musiqueActive and " ON" or " OFF")
end
E.btSonP.Activated:Connect(function() Sons.actif = not Sons.actif; majBoutonsSon() end)
E.btMusP.Activated:Connect(function() Sons.musiqueActive = not Sons.musiqueActive; majBoutonsSon() end)
majBoutonsSon()

-- ════════ les autres caisses : un double chez moi, lissé ; on ne voit que celles qui roulent dans NOTRE zone ════════
type Double = { m: Model, c: Model, vu: boolean? }
local doubles: { [Model]: Double } = {}
local function lisserDoubles(dt: number)
	for m, d in doubles do
		if not m.Parent then
			d.c:Destroy()
			doubles[m] = nil
		elseif d.vu and m.PrimaryPart then
			d.c.PrimaryPart.CFrame = d.c.PrimaryPart.CFrame:Lerp(m.PrimaryPart.CFrame, math.min(1, dt * 10))
		end
	end
end
task.spawn(function()
	while true do
		for _, m in dossierCaisses:GetChildren() do
			if m ~= caisseServeur and m:IsA("Model") and m.PrimaryPart then
				local d = doubles[m]
				if not d then
					cacher(m)
					local c = Caisse.construire("Autre", m:GetAttribute("Couleur") or Color3.new(1, 1, 1), true)
					c.PrimaryPart.CFrame = m.PrimaryPart.CFrame
					c.Parent = workspace
					d = { m = m, c = c }
					doubles[m] = d
				end
				local voir = m:GetAttribute("EnCourse") == true and (m:GetAttribute("Zone") or 1) == zoneN
				if d.vu ~= voir then
					d.vu = voir
					for _, p in d.c:GetDescendants() do
						if p:IsA("BasePart") then p.LocalTransparencyModifier = voir and 0 or 1 end
					end
					if voir then d.c.PrimaryPart.CFrame = m.PrimaryPart.CFrame end
				end
				local nitro = voir and m:GetAttribute("Nitro") == true
				local r = d.c.PrimaryPart
				for i = 1, 2 do
					local a = r:FindFirstChild("Tuyere" .. i)
					local f = a and a:FindFirstChild("Flamme" .. i)
					if f then (f :: ParticleEmitter).Rate = nitro and 90 or 0 end
					local t = r:FindFirstChild("Trainee" .. i)
					if t then (t :: Trail).Enabled = nitro end
				end
			end
		end
		task.wait(0.25)
	end
end)

-- ════════ LA BOUCLE ════════
local envoiT = 0
RunService:BindToRenderStep("CashCar", Enum.RenderPriority.Camera.Value + 1, function(dtBrut)
	local dt = math.min(dtBrut, 1 / 20)
	Controles.lire()
	if hitT > 0 then
		hitT -= dt
		dt *= 0.04 -- le HIT-STOP du PARFAIT : 80 ms de gel
	end
	if mode == "charge" then return end
	if not enPause then
		if mode == "depart" then
			carVel = Vector3.zero
		elseif mode == "drive" or mode == "fall" then
			tempsDepart += dt
			graceT -= dt
			padCd -= dt
			pwN, pwA, pwV, pwM = math.max(0, pwN - dt), math.max(0, pwA - dt), math.max(0, pwV - dt), math.max(0, pwM - dt)
			if mode == "drive" then etapeSol(dt) else etapeAir(dt) end
			if mode == "drive" or mode == "fall" then
				objets(dt, carCF.Position, os.clock())
				vmax = math.max(vmax, kmh())
			end
		elseif mode == "boom" then
			boomT += dt
			secousse = math.max(secousse, boomT < 0.1 and 1.2 or 0)
			if boomT > 1.8 then finPartie() end
		elseif mode == "menu" then
			-- la caisse PIQUE sur place : un souffle qui la berce
			local t = os.clock()
			local pos = repere(S_CHUTE, 1).Position + Vector3.new(0, H_CHUTE * M + math.sin(t * 1.1) * 0.5 * M, 0)
			carCF = CFrame.new(pos) * menuRot * CFrame.Angles(math.sin(t * 0.8) * 0.03, 0, math.sin(t * 1.3) * 0.02)
		end
		-- les éclats de l'explosion
		if #eclats > 0 then
			for i = #eclats, 1, -1 do
				local e = eclats[i]
				e.v *= (1 - math.min(1, dt * (e.t == 1 and 2.5 or 0.6)))
				e.v -= Vector3.new(0, (e.t == 1 and 2 or 12) * M * dt, 0)
				e.p.CFrame = (e.p.CFrame + e.v * dt) * CFrame.Angles(e.r.X * dt, e.r.Y * dt, e.r.Z * dt)
				if e.t == 1 then
					e.p.Size += Vector3.new(1, 1, 1) * (dt * 1.5 * M)
					e.p.Transparency = math.min(1, e.p.Transparency + dt * 0.45)
				end
				if e.p.Transparency >= 1 or boomT > 4 or mode == "menu" or mode == "drive" or mode == "fall" then
					e.p:Destroy()
					table.remove(eclats, i)
				end
			end
		end
		habiller(dt)
		camera(dt)
		Mer.suivre(cam.CFrame.Position, carCF.Position.Y, dt)
		lisserDoubles(dt)
		envoiT -= dtBrut
		if envoiT <= 0 and (mode == "drive" or mode == "fall") then
			envoiT = 1 / 15
			evPos:FireServer(carCF)
		end
	end
	hud()
end)

-- ════════ le démarrage : on bâtit la zone 1 derrière l'écran de chargement ════════
Mer.creer(graine)
local z1 = preparer(1, nil)
local t0 = os.clock()
while not z1.pret do
	E.chargeTxt.Text = T.chargement .. string.rep(".", math.floor((os.clock() - t0) * 3) % 4)
	task.wait(0.1)
end
preparer(2, Piste.suite(z1.piste :: Piste.Piste))
allerMenu()

-- aide au débogage (console du client dans Studio) : _G.cashcar()
_G.cashcar = function()
	return { mode = mode, zone = zoneN, s = s, lat = lat, side = side, vA = vA, kmh = kmh(), psi = psi,
		nitro = nitroR, tier = tier, argent = argent, aura = aura, fallT = fallT, n = piste and piste.n, len = piste and piste.len }
end
