-- CASH CAR — LE SERVEUR. Il fait peu, exprès :
--   1. il tire la GRAINE de la piste (tout le serveur roule sur la même route : chaque joueur la bâtit
--      chez lui à partir de ce nombre — zéro pièce de route à envoyer sur le réseau) ;
--   2. il pose le CIEL (lumière, atmosphère) ;
--   3. il tient une caisse ANCRÉE par joueur, qui ne porte que la position envoyée par ce joueur (chacun
--      dessine les caisses chez lui ; celle-ci sert de boîte aux lettres pour que les autres la voient) ;
--   4. il tient le CLASSEMENT et la SAUVEGARDE (record à vie + COMPTE cumulé, comme le compte du jeu web).
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Lighting = game:GetService("Lighting")

local CC = ReplicatedStorage:WaitForChild("CashCar")
local Config = require(CC:WaitForChild("Config"))
local Ciel = require(CC:WaitForChild("Ciel"))

workspace.Gravity = 0 -- la physique de la caisse est à nous (aussi posé dans le fichier)
Players.CharacterAutoLoads = false

-- ── 1. la graine ──
local graine = Config.GRAINE_FIXE or (os.time() % 900000 + 1000)
CC:SetAttribute("Graine", graine)

-- ── 2. le ciel ──
Ciel.poser(Lighting, workspace)

-- ── les tuyaux vers les joueurs ──
local function remote(nom: string, classe: string?)
	local ok, r = pcall(function() return Instance.new(classe or "RemoteEvent") end)
	if not ok then r = Instance.new("RemoteEvent") end -- (UnreliableRemoteEvent absent : repli)
	r.Name = nom
	r.Parent = CC
	return r
end
local evFin = remote("FinPartie")                           -- fin de partie (montant, distance)
local evEtat = remote("EtatCaisse")                         -- menu / course, zone, nitro
local evRecord = remote("Record")                           -- record à vie + compte, rendus au joueur
local evPos = remote("PosCaisse", "UnreliableRemoteEvent")  -- la position de la caisse, 15 fois/s

-- ── 3. les caisses ──
local dossier = Instance.new("Folder")
dossier.Name = "Caisses"
dossier.Parent = workspace

-- ── 4. les profils (compte, caisses, missions, carrière, réglages — voir Profils) ──
local Profils = require(script.Parent:WaitForChild("Profils"))
local fnProfil = remote("Profil", "RemoteFunction")   -- le client lit son profil
local fnAction = remote("Action", "RemoteFunction")   -- le client demande (acheter, équiper, régler…), le serveur vérifie
local evProfil = remote("ProfilMaj")                  -- le serveur pousse le profil à jour
Profils.pousser = function(p: Player) evProfil:FireClient(p, Profils.de(p)) end
-- LES REVENUS : cadeaux, badges, classement, passes, seconde chance (voir Revenus)
local Revenus = require(script.Parent:WaitForChild("Revenus"))
Profils.surHabit = function(p: Player) -- la peinture, les ailes, la traînée : les autres doivent les voir
	local m = dossier:FindFirstChild(p.Name)
	local prof = Profils.de(p)
	if m then
		m:SetAttribute("Peinture", prof.porte.peinture)
		m:SetAttribute("Aile", prof.porte.aile)
		m:SetAttribute("Trainee", prof.porte.trainee)
	end
end
Profils.surEquipe = function(p: Player, i: number) -- la caisse équipée change : les autres doivent la redessiner
	local m = dossier:FindFirstChild(p.Name)
	if m then m:SetAttribute("Caisse", i) end
end

fnProfil.OnServerInvoke = function(p)
	return Profils.de(p)
end
fnAction.OnServerInvoke = function(p, nom, ...)
	local f = Profils.actions[nom]
	if type(nom) ~= "string" or not f then return false, "action inconnue", Profils.de(p) end
	local prof = Profils.de(p)
	local ok, res, msg = pcall(f, p, prof, ...)
	if not ok then return false, "erreur", prof end
	if res then Profils.sauverBientot(p) end
	return res, msg, prof
end

local function arrivee(p: Player)
	if dossier:FindFirstChild(p.Name) then return end
	-- le tableau des scores (en haut à droite chez Roblox)
	local ls = Instance.new("Folder")
	ls.Name = "leaderstats"
	local rec = Instance.new("NumberValue")
	rec.Name = "Record $"
	rec.Parent = ls
	local der = Instance.new("NumberValue")
	der.Name = "Dernier $"
	der.Parent = ls
	ls.Parent = p

	-- sa boîte aux lettres : une racine invisible et ancrée, qui ne porte que la position envoyée par le joueur
	-- et ce que les autres doivent savoir pour DESSINER sa caisse (laquelle, en course ou non, quelle zone, nitro)
	local m = Instance.new("Model")
	m.Name = p.Name
	local r = Instance.new("Part")
	r.Name = "Racine"
	r.Size = Vector3.new(1, 1, 1)
	r.Transparency = 1
	r.Anchored = true
	r.CanCollide = false
	r.CanQuery = false
	r.CanTouch = false
	r.CFrame = CFrame.new(0, Config.GARAGE_Y, 0)
	r.Parent = m
	m.PrimaryPart = r
	m:SetAttribute("Joueur", p.UserId)
	m:SetAttribute("EnCourse", false)
	m:SetAttribute("Caisse", 0)
	m.Parent = dossier

	task.spawn(function()
		local prof = Profils.charger(p)
		m:SetAttribute("Caisse", prof.caisse)
		Profils.surHabit(p)
		rec.Value = math.floor(prof.record)
		evRecord:FireClient(p, prof.record, prof.compte)
		Profils.pousser(p)
		Revenus.arrivee(p, prof)
	end)
end
Players.PlayerAdded:Connect(arrivee)
Revenus.init({ Profils = Profils, remote = remote, compte = function(p: Player, prof: any) evRecord:FireClient(p, prof.record, prof.compte) end })
-- en test dans Studio, le joueur peut être entré AVANT que ce script écoute : on le rattrape
for _, p in Players:GetPlayers() do task.spawn(arrivee, p) end

Players.PlayerRemoving:Connect(function(p)
	debutCourse[p.UserId] = nil
	local m = dossier:FindFirstChild(p.Name)
	if m then m:Destroy() end
	Profils.sauver(p)
	Profils.oublier(p)
	Revenus.depart(p)
end)

-- (à l'arrêt d'un serveur, Roblox laisse 30 s : toutes les sauvegardes partent EN MÊME TEMPS, pas l'une après l'autre)
game:BindToClose(function()
	local reste = 0
	for _, p in Players:GetPlayers() do
		reste += 1
		task.spawn(function()
			pcall(Profils.sauver, p)
			reste -= 1
		end)
	end
	local t0 = os.clock()
	while reste > 0 and os.clock() - t0 < 25 do task.wait(0.1) end
end)

-- LA MONTRE DU SERVEUR (4/10, avant publication) : quand une partie commence, le serveur le note — à la fin, il sait combien de
-- temps elle a VRAIMENT duré, et borne le montant déclaré par le joueur (voir evFin). Une seconde chance ne relance pas la montre.
local debutCourse: { [number]: number } = {}
-- ce que les AUTRES doivent savoir de ma caisse : est-ce que je roule, dans quelle zone, nitro allumée ?
evEtat.OnServerEvent:Connect(function(p, quoi, valeur)
	if quoi == "course" and valeur == true and not debutCourse[p.UserId] then debutCourse[p.UserId] = os.clock() end
	local m = dossier:FindFirstChild(p.Name)
	if not m then return end
	if quoi == "course" then
		m:SetAttribute("EnCourse", valeur == true)
		if valeur ~= true then m:SetAttribute("Nitro", false) end
	elseif quoi == "zone" and type(valeur) == "number" and valeur >= 1 and valeur < 1000 then
		m:SetAttribute("Zone", math.floor(valeur))
	elseif quoi == "nitro" then
		m:SetAttribute("Nitro", valeur == true)
	end
end)

-- la position : 20 fois par seconde au plus, jamais un nombre aberrant
local derPos: { [number]: number } = {}
evPos.OnServerEvent:Connect(function(p, cf, sP, rel)
	if typeof(cf) ~= "CFrame" then return end
	local t = os.clock()
	if derPos[p.UserId] and t - derPos[p.UserId] < 1 / 20 then return end
	derPos[p.UserId] = t
	local v = cf.Position
	if v ~= v or math.abs(v.X) > 1e6 or math.abs(v.Y) > 1e6 or math.abs(v.Z) > 1e6 then return end
	local m = dossier:FindFirstChild(p.Name)
	if m and m.PrimaryPart then m.PrimaryPart.CFrame = cf end
	-- (la place sur la piste : chacun la reporte sur SA route — voir G.poseDouble chez le joueur)
	if m and type(sP) == "number" and sP == sP and sP >= 0 and sP < 1e6 and typeof(rel) == "CFrame" and rel.Position.Magnitude < 1e5 then
		m:SetAttribute("S", sP)
		m:SetAttribute("Rel", rel)
	end
end)

-- Fin de partie : le montant vient du joueur. On le borne (un montant absurde est ignoré) —
-- l'argent est VERSÉ AU COMPTE (le compte du web), le record et les stats suivent.
local dernierEnvoi: { [number]: number } = {}
evFin.OnServerEvent:Connect(function(p, montant, distance, aura, stats)
	if type(montant) ~= "number" or montant ~= montant or montant < 0 or montant > 1e15 then return end
	local t = os.clock()
	if dernierEnvoi[p.UserId] and t - dernierEnvoi[p.UserId] < 2 then return end
	dernierEnvoi[p.UserId] = t
	-- LE PLAFOND (4/10) : le montant vient du joueur — un tricheur pouvait s'inventer des milliards et squatter le classement mondial.
	-- Mesuré au banc en jouant « parfait » (immortel, nitro tenue) : ~1 500 $ à 1 min, ~94 000 $ à 6 min. Le plafond laisse dix fois
	-- plus (2 000 + 8 × durée²) : aucun vrai joueur ne le touche, une fortune inventée y est ramenée.
	local duree = debutCourse[p.UserId] and (t - debutCourse[p.UserId]) or 0
	debutCourse[p.UserId] = nil
	local plafond = 2000 + 8 * duree * duree
	if montant > plafond then
		warn(string.format("[CashCar] fin de partie bornée : %s annonçait %.0f $ en %.0f s (plafond %.0f)", p.Name, montant, duree, plafond))
		montant = plafond
	end
	local prof = Profils.de(p)
	-- on ne verse que les GAINS, jamais la mise de 1,61 $ — multipliés par les droits du joueur (passe ×2 ARGENT, Premium +10 %)
	prof.compte += math.max(0, montant - Config.CASH_DEPART) * Revenus.multiplicateur(p)
	-- (L31161) une LEÇON QUITTÉE n'est pas une partie : seul l'argent gagné est versé — ni record, ni aura, ni partie comptée
	if type(stats) == "table" and stats.lecon == true then
		evRecord:FireClient(p, prof.record, prof.compte)
		Profils.pousser(p)
		Profils.sauverBientot(p)
		return
	end
	if montant > prof.record then prof.record = montant end
	if type(aura) == "number" and aura == aura and aura >= 0 and aura < 1e12 then
		prof.auraMeilleur = math.max(prof.auraMeilleur, aura)
		prof.aura += math.floor(aura + 0.5)
	end
	if type(stats) == "table" and type(stats.frenRec) == "number" and stats.frenRec == stats.frenRec and stats.frenRec >= 5 and stats.frenRec < 3600 then
		prof.frenRec = math.max(prof.frenRec, stats.frenRec)
	end
	if type(stats) == "table" and type(stats.kmh) == "number" and stats.kmh == stats.kmh and stats.kmh > 0 and stats.kmh < 1e5 then
		prof.kmhMax = math.max(prof.kmhMax, math.floor(stats.kmh + 0.5))
	end
	if type(stats) == "table" and type(stats.tier) == "number" and stats.tier == math.floor(stats.tier) and stats.tier >= 0 and stats.tier < 200 then
		prof.moteurMax = math.max(prof.moteurMax, stats.tier)
	end
	prof.stats.parties += 1
	if type(distance) == "number" and distance == distance and distance > 0 and distance < 1e7 then
		prof.stats.distance += distance
	end
	if type(stats) == "table" then
		for _, k in { "pieces", "figures" } do
			local v = stats[k]
			if type(v) == "number" and v == v and v >= 0 and v < 1e6 then prof.stats[k] += v end
		end
		if Profils.finPartie then pcall(Profils.finPartie, p, prof, stats) end -- (carrière)
		pcall(Revenus.surFin, p, prof, stats, aura) -- (les badges d'exploit, le classement mondial)
	end
	local ls = p:FindFirstChild("leaderstats")
	if ls then
		ls["Dernier $"].Value = math.floor(montant)
		ls["Record $"].Value = math.floor(prof.record)
	end
	evRecord:FireClient(p, prof.record, prof.compte)
	Profils.pousser(p)
	Profils.sauverBientot(p)
end)
