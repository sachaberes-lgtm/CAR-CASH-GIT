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
	if string.sub(r, 1, 2) == "w:" then return workspace:FindFirstChild(string.sub(r, 3), true) or workspace end -- (« w:Zone3 » : un dossier du monde)
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
	elseif op == "arbre" then
		-- l'inventaire du monde : pour chaque enfant de la racine, combien de descendants et de pièces (pour trouver ce qui s'accumule)
		local t = {}
		for _, c in racine(r):GetChildren() do
			local n, np = 0, 0
			for _, d in c:GetDescendants() do
				n += 1
				if d:IsA("BasePart") then np += 1 end
			end
			if n >= 20 then table.insert(t, { c.Name .. ":" .. c.ClassName, n, np }) end
		end
		if string.sub(r, 1, 2) == "w:" then -- (dans un dossier : on compte aussi les pièces par nom et par classe)
			local parNom = {}
			for _, d in racine(r):GetDescendants() do
				if d:IsA("BasePart") then local k = d.Name .. ":" .. d.ClassName parNom[k] = (parNom[k] or 0) + 1 end
			end
			for k, n in parNom do if n >= 20 then table.insert(t, { "#" .. k, n, n }) end end
		end
		table.sort(t, function(a, b) return a[2] > b[2] end)
		local o = {}
		for i = 1, math.min(30, #t) do table.insert(o, t[i][1] .. "=" .. t[i][2] .. "/" .. t[i][3]) end
		ev:FireServer("arbre : " .. table.concat(o, " "))
	elseif op == "ecran" then
		-- où tombent à l'écran les pièces qui s'appellent `nom` : x, y (0-1), profondeur, taille apparente (fraction de la hauteur)
		local cam = workspace.CurrentCamera
		local t = {}
		chacun(r, nom, function(d)
			if d:IsA("BasePart") and #t < 24 then
				local v, vu = cam:WorldToViewportPoint(d.Position)
				local h = d.Size.Magnitude / math.max(1, v.Z) / (2 * math.tan(math.rad(cam.FieldOfView) / 2))
				table.insert(t, string.format("%s(%.2f,%.2f z%d t%.2f)", vu and "V" or "-", v.X / cam.ViewportSize.X, v.Y / cam.ViewportSize.Y, v.Z, h))
			end
		end)
		ev:FireServer("ecran " .. nom .. " : " .. table.concat(t, " "))
	elseif op == "stats" then
		-- le coût du rendu, tel que Roblox le compte (triangles, appels de dessin, ombres, interface, mémoire, ms par image)
		local St = game:GetService("Stats")
		local t = {}
		for _, k in { "SceneTriangleCount", "SceneDrawcallCount", "ShadowsTriangleCount", "ShadowsDrawcallCount", "UI2DTriangleCount",
			"UI2DDrawcallCount", "UI3DTriangleCount", "UI3DDrawcallCount", "InstanceCount", "PrimitivesCount", "FrameTime", "RenderCPUFrameTime",
			"RenderGPUFrameTime", "HeartbeatTimeMs" } do
			local ok, v = pcall(function() return (St :: any)[k] end)
			table.insert(t, k .. "=" .. (ok and tostring(typeof(v) == "number" and math.floor(v * 100 + 0.5) / 100 or v) or "?"))
		end
		local okM, mem = pcall(function() return St:GetTotalMemoryUsageMb() end)
		table.insert(t, "memMb=" .. (okM and math.floor(mem) or "?"))
		for _, tag in { "GraphicsMeshParts", "GraphicsParts", "GraphicsTexture", "GraphicsParticles", "Gui", "Instances", "LuaHeap", "PhysicsParts" } do
			local okT, v = pcall(function() return St:GetMemoryUsageMbForTag((Enum.DeveloperMemoryTag :: any)[tag]) end)
			if okT then table.insert(t, tag .. "=" .. math.floor(v)) end
		end
		ev:FireServer("stats : " .. table.concat(t, " "))
	elseif op == "grand" then
		-- (banc) la bannière du niveau, tout de suite (pour la photographier)
		local H = require(RS:WaitForChild("CashCar"):WaitForChild("Client"):WaitForChild("Hud"))
		H.grand(nom, nil, 3)
		ev:FireServer("grand : " .. tostring(nom))
	elseif op == "sons" then
		-- (5/10) les sons QUI JOUENT et leur volume effectif — pour savoir d'où vient un bruit pendant les essais
		local t = {}
		for _, d in game:GetDescendants() do
			if d:IsA("Sound") and d.IsPlaying then
				local g = d.SoundGroup
				table.insert(t, string.format("%s(v%.2f g%s%.2f)", d:GetFullName(), d.Volume, g and g.Name or "-", g and g.Volume or 1))
			end
		end
		ev:FireServer("sons : " .. #t .. " " .. table.concat(t, " ", 1, math.min(#t, 12)))
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
	-- (l'intro du studio se joue avant l'accueil : on attend que le pilote dise « menu prêt » lui-même — 25 s au plus)
	local t0 = os.clock()
	while not Players.LocalPlayer:GetAttribute("MenuPret") and os.clock() - t0 < 25 do task.wait(0.25) end
	ev:FireServer("joueur : menu prêt")
end)
game:GetService("LogService").MessageOut:Connect(function(msg, typ)
	if typ == Enum.MessageType.MessageWarning or typ == Enum.MessageType.MessageError then ev:FireServer("[sortie] " .. msg) end
end)
