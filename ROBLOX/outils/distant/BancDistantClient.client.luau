-- CASH CAR — LE BANC À DISTANCE, côté joueur (copie de TEST seulement — voir BancDistant, côté serveur).
-- Un joueur ne sait pas exécuter du texte : on lui envoie des ORDRES tout faits.
--   "prop", racine, nom, propriété, valeur   → pour tout ce qui s'appelle `nom` (ou qui EST de cette classe) sous la racine
--                                              ("monde", "lumiere", "ecran", "camera"), écrire la propriété
--   "compte", racine, nom                    → combien y en a-t-il ? (réponse dans le journal du PC)
--   "lire", racine, nom, propriété           → la valeur du premier trouvé
local RS = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local ev = RS:WaitForChild("BancDistant") :: RemoteEvent

local function racine(r: string): Instance
	if r == "lumiere" then return game:GetService("Lighting") end
	if r == "ecran" then return Players.LocalPlayer:WaitForChild("PlayerGui") end
	if r == "camera" then return workspace.CurrentCamera end
	return workspace
end
local function chacun(r: string, nom: string, f: (Instance) -> ()): number
	local n = 0
	for _, d in racine(r):GetDescendants() do
		if d.Name == nom or d.ClassName == nom then
			n += 1
			f(d)
		end
	end
	return n
end
ev.OnClientEvent:Connect(function(op: string, r: string, nom: string, prop: string?, val: any)
	if op == "prop" then
		local rate = 0
		local n = chacun(r, nom, function(d)
			if not pcall(function() (d :: any)[prop] = val end) then rate += 1 end
		end)
		ev:FireServer(string.format("prop %s.%s : %d écrits, %d refusés", nom, tostring(prop), n - rate, rate))
	elseif op == "etat" then
		-- l'état de la partie, tel que le pilote le publie (Bus.etat) : mode, pause, km/h…
		local ok, e = pcall(function() return require(RS:WaitForChild("CashCar"):WaitForChild("Client"):WaitForChild("Bus")).etat() end)
		local t = {}
		if ok and type(e) == "table" then
			for k, v in e do
				if type(v) ~= "table" and typeof(v) ~= "CFrame" then table.insert(t, k .. "=" .. tostring(v)) end
			end
			table.sort(t)
		end
		if ok and type(e) == "table" and typeof(e.carCF) == "CFrame" then
			local q = e.carCF.Position
			table.insert(t, string.format("caisse=(%d,%d,%d)", q.X, q.Y, q.Z))
		end
		local c = workspace.CurrentCamera.CFrame.Position
		table.insert(t, string.format("camera=(%d,%d,%d)", c.X, c.Y, c.Z))
		local okH, ec = pcall(function() return require(RS.CashCar.Client.Hud).ecranCourant() end)
		table.insert(t, "ecran=" .. tostring(okH and ec or "?"))
		-- les images rendues pendant une seconde (0 = la boucle de rendu ne tourne plus)
		local n, c9 = 0, nil
		c9 = game:GetService("RunService").RenderStepped:Connect(function() n += 1 end)
		task.wait(1)
		c9:Disconnect()
		table.insert(t, "images/s=" .. n)
		ev:FireServer("etat : " .. (ok and table.concat(t, " ") or tostring(e)))
	elseif op == "compte" then
		ev:FireServer(string.format("compte %s : %d", nom, chacun(r, nom, function() end)))
	elseif op == "lire" then
		local vu = false
		chacun(r, nom, function(d)
			if vu then return end
			vu = true
			local ok, v = pcall(function() return (d :: any)[prop] end)
			ev:FireServer(string.format("lire %s.%s = %s", nom, tostring(prop), ok and tostring(v) or "(illisible)"))
		end)
		if not vu then ev:FireServer("lire " .. nom .. " : introuvable") end
	end
end)
-- le journal du PC sait quand le joueur est là, puis quand son menu est affiché
ev:FireServer("joueur : arrivé")
task.spawn(function()
	local pg = Players.LocalPlayer:WaitForChild("PlayerGui")
	while not pg:FindFirstChild("CashCarEffets") do task.wait(0.5) end
	ev:FireServer("joueur : menu prêt")
end)
game:GetService("LogService").MessageOut:Connect(function(msg, typ)
	if typ == Enum.MessageType.MessageWarning or typ == Enum.MessageType.MessageError then ev:FireServer("[sortie] " .. msg) end
end)
