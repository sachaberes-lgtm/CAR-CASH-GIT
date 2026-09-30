-- CASH CAR — LE SERVEUR. Il fait peu, exprès :
--   1. il tire la GRAINE de la piste (tout le serveur roule sur la même route : chaque joueur la bâtit
--      chez lui à partir de ce nombre — zéro pièce de route à envoyer sur le réseau) ;
--   2. il pose le CIEL (lumière, atmosphère, mer de nuages) ;
--   3. il donne à chaque joueur SA caisse (tout le monde la voit, c'est le joueur qui la conduit) ;
--   4. il tient le CLASSEMENT (record de la partie + record à vie, sauvegardé).
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
	local r = Instance.new(classe or "RemoteEvent")
	r.Name = nom
	r.Parent = CC
	return r
end
local evFin = remote("FinPartie")       -- le joueur annonce sa fin de partie (montant, distance)
local evEtat = remote("EtatCaisse")     -- menu / course : sa caisse se montre ou se cache chez les autres
local evRecord = remote("Record")       -- le serveur rend au joueur son record à vie

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

local recordVie: { [number]: number } = {}

local function charger(p: Player)
	if not store then return 0 end
	local ok, v = pcall(function()
		return store:GetAsync("j_" .. p.UserId)
	end)
	if ok and type(v) == "table" and type(v.record) == "number" then
		return v.record
	end
	return 0
end

local function sauver(p: Player)
	if not store then return end
	local r = recordVie[p.UserId]
	if not r then return end
	pcall(function()
		store:UpdateAsync("j_" .. p.UserId, function(ancien)
			local a = (type(ancien) == "table" and type(ancien.record) == "number") and ancien.record or 0
			return { record = math.max(a, r) }
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

	-- sa caisse
	local couleur = COULEURS[(p.UserId % #COULEURS) + 1]
	if p.UserId <= 0 then couleur = COULEURS[1] end -- en test dans Studio : l'orange du jeu
	local m = Caisse.construire(p.Name, couleur)
	m:SetAttribute("Joueur", p.UserId)
	m:SetAttribute("EnCourse", false)
	m:PivotTo(CFrame.new(0, Config.GARAGE_Y, 0))
	m.Parent = dossier
	pcall(function()
		m.PrimaryPart:SetNetworkOwner(p)
	end)

	task.spawn(function()
		local r = charger(p)
		recordVie[p.UserId] = math.max(recordVie[p.UserId] or 0, r)
		rec.Value = recordVie[p.UserId]
		evRecord:FireClient(p, recordVie[p.UserId])
	end)
end
Players.PlayerAdded:Connect(arrivee)
-- en test dans Studio, le joueur peut être entré AVANT que ce script écoute : on le rattrape
for _, p in Players:GetPlayers() do task.spawn(arrivee, p) end

Players.PlayerRemoving:Connect(function(p)
	local m = dossier:FindFirstChild(p.Name)
	if m then m:Destroy() end
	sauver(p)
	recordVie[p.UserId] = nil
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

-- Fin de partie : le montant vient du joueur. On le borne (un montant absurde est ignoré) —
-- ce n'est pas une banque, c'est un tableau d'honneur.
local dernierEnvoi: { [number]: number } = {}
evFin.OnServerEvent:Connect(function(p, montant, distance)
	if type(montant) ~= "number" or montant ~= montant or montant < 0 or montant > 1e15 then return end
	local t = os.clock()
	if dernierEnvoi[p.UserId] and t - dernierEnvoi[p.UserId] < 2 then return end
	dernierEnvoi[p.UserId] = t
	montant = math.floor(montant)
	local ls = p:FindFirstChild("leaderstats")
	if ls then
		ls["Dernier $"].Value = montant
		if montant > (recordVie[p.UserId] or 0) then
			recordVie[p.UserId] = montant
			ls["Record $"].Value = montant
			evRecord:FireClient(p, montant)
			task.spawn(sauver, p)
		end
	end
end)
