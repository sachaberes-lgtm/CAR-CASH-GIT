-- CASH CAR — LE SERVEUR. Il fait peu, exprès :
--   1. il tire la GRAINE de la piste (tout le serveur roule sur la même route : chaque joueur la bâtit
--      chez lui à partir de ce nombre — zéro pièce de route à envoyer sur le réseau) ;
--   2. il pose le CIEL (lumière, atmosphère) ;
--   3. il tient une caisse ANCRÉE par joueur, qui ne porte que la position envoyée par ce joueur (chacun
--      dessine les caisses chez lui ; celle-ci sert de boîte aux lettres pour que les autres la voient) ;
--   4. il tient le CLASSEMENT et la SAUVEGARDE (record à vie + COMPTE cumulé, comme le compte du jeu web).
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local Lighting = game:GetService("Lighting")

local CC = ReplicatedStorage:WaitForChild("CashCar")
local Config = require(CC:WaitForChild("Config"))
local Caisse = require(CC:WaitForChild("Caisse"))
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

local COULEURS = {
	Color3.fromRGB(255, 122, 26), Color3.fromRGB(0, 234, 255), Color3.fromRGB(255, 62, 200),
	Color3.fromRGB(255, 215, 94), Color3.fromRGB(98, 224, 98), Color3.fromRGB(160, 110, 255),
}

-- ── 4. la sauvegarde ──
local store
do
	local ok, s = pcall(function()
		return DataStoreService:GetDataStore(Config.DATASTORE)
	end)
	if ok then store = s end
end

type Fiche = { record: number, compte: number }
local fiches: { [number]: Fiche } = {}

local function charger(p: Player): Fiche
	local f = { record = 0, compte = 0 }
	if not store then return f end
	local ok, v = pcall(function()
		return store:GetAsync("j_" .. p.UserId)
	end)
	if ok and type(v) == "table" then
		if type(v.record) == "number" then f.record = v.record end
		if type(v.compte) == "number" then f.compte = v.compte end
	end
	return f
end

local function sauver(p: Player)
	if not store then return end
	local f = fiches[p.UserId]
	if not f then return end
	pcall(function()
		store:UpdateAsync("j_" .. p.UserId, function(ancien)
			local a = type(ancien) == "table" and ancien or {}
			return {
				record = math.max(type(a.record) == "number" and a.record or 0, f.record),
				compte = math.max(type(a.compte) == "number" and a.compte or 0, f.compte),
			}
		end)
	end)
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

	-- sa caisse (ancrée : c'est le joueur qui en donne la position)
	local couleur = COULEURS[(p.UserId % #COULEURS) + 1]
	if p.UserId <= 0 then couleur = COULEURS[1] end -- en test dans Studio : l'orange du jeu
	local m = Caisse.construire(p.Name, couleur, true)
	m:SetAttribute("Joueur", p.UserId)
	m:SetAttribute("EnCourse", false)
	m:SetAttribute("Couleur", couleur)
	m:PivotTo(CFrame.new(0, Config.GARAGE_Y, 0))
	m.Parent = dossier

	task.spawn(function()
		local f = charger(p)
		local g = fiches[p.UserId]
		if g then
			f.record = math.max(f.record, g.record)
			f.compte = math.max(f.compte, g.compte)
		end
		fiches[p.UserId] = f
		rec.Value = f.record
		evRecord:FireClient(p, f.record, f.compte)
	end)
end
Players.PlayerAdded:Connect(arrivee)
-- en test dans Studio, le joueur peut être entré AVANT que ce script écoute : on le rattrape
for _, p in Players:GetPlayers() do task.spawn(arrivee, p) end

Players.PlayerRemoving:Connect(function(p)
	local m = dossier:FindFirstChild(p.Name)
	if m then m:Destroy() end
	sauver(p)
	fiches[p.UserId] = nil
end)

game:BindToClose(function()
	for _, p in Players:GetPlayers() do
		sauver(p)
	end
end)

-- ce que les AUTRES doivent savoir de ma caisse : est-ce que je roule, dans quelle zone, nitro allumée ?
evEtat.OnServerEvent:Connect(function(p, quoi, valeur)
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
evPos.OnServerEvent:Connect(function(p, cf)
	if typeof(cf) ~= "CFrame" then return end
	local t = os.clock()
	if derPos[p.UserId] and t - derPos[p.UserId] < 1 / 20 then return end
	derPos[p.UserId] = t
	local v = cf.Position
	if v ~= v or math.abs(v.X) > 1e6 or math.abs(v.Y) > 1e6 or math.abs(v.Z) > 1e6 then return end
	local m = dossier:FindFirstChild(p.Name)
	if m and m.PrimaryPart then m.PrimaryPart.CFrame = cf end
end)

-- Fin de partie : le montant vient du joueur. On le borne (un montant absurde est ignoré) —
-- ce n'est pas une banque, c'est un tableau d'honneur.
local dernierEnvoi: { [number]: number } = {}
evFin.OnServerEvent:Connect(function(p, montant, distance)
	if type(montant) ~= "number" or montant ~= montant or montant < 0 or montant > 1e15 then return end
	local t = os.clock()
	if dernierEnvoi[p.UserId] and t - dernierEnvoi[p.UserId] < 2 then return end
	dernierEnvoi[p.UserId] = t
	local f = fiches[p.UserId] or { record = 0, compte = 0 }
	fiches[p.UserId] = f
	f.compte += montant
	local ls = p:FindFirstChild("leaderstats")
	if ls then ls["Dernier $"].Value = math.floor(montant) end
	if montant > f.record then
		f.record = montant
		if ls then ls["Record $"].Value = math.floor(montant) end
	end
	evRecord:FireClient(p, f.record, f.compte)
	task.spawn(sauver, p)
end)
