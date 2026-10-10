-- CASH CAR — LE MODE « APPAREIL FAIBLE » (Config.FAIBLE), et le guetteur qui a mesuré ce qu'il coupe.
-- Un téléphone n'a ni la carte graphique ni le processeur d'un PC : passé une certaine charge, l'image hoquette et la caisse
-- se conduit moins bien. Ce module tient UN état, `Perf.faible`, que les modules d'effets lisent :
--   · il s'allume TOUT SEUL sur un appareil tactile sans clavier (le même test que Hud.tactile) ;
--   · sinon, en COURSE, si l'image reste sous `seuilIps` pendant `duree` secondes d'affilée — une bascule à sens unique pour la
--     session (un message dans la console, rien à l'écran) ; le menu, la pause, le garage et une fenêtre en arrière-plan ne
--     comptent pas (Roblox y bride l'image de lui-même) ;
--   · (banc) workspace « DbgFaible » = true / false le FORCE dans un sens ou dans l'autre (et coupe la bascule automatique) ;
--     « DbgIps » = un nombre remplace la mesure de l'image (pour prouver la bascule sans ralentir la machine).
-- Ce qui se bâtit (le décor des nuages, la mer) lit `Perf.faible` à la construction ; ce qui est déjà bâti au moment de la bascule
-- écoute `Perf.surBascule`. RIEN de ce qui touche au JEU ne passe par ici : la piste, les objets, les nuages qu'on traverse, les
-- tours qui tuent, les obstacles et la physique sont ceux du PC, au tirage près.
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Bus = require(script.Parent:WaitForChild("Bus"))

local F: any = Config.FAIBLE or {}
local Perf = { faible = false, raison = "", force = nil :: boolean?, F = F, particules = 0 }

-- ── l'état, et ceux qui veulent savoir quand il change ──
local ecoutes: { (boolean) -> () } = {}
function Perf.surBascule(f: (boolean) -> ())
	table.insert(ecoutes, f)
end
local function basculer(oui: boolean, raison: string)
	if Perf.faible == oui then return end
	Perf.faible = oui
	Perf.raison = raison
	warn(string.format("[CashCar] APPAREIL FAIBLE %s (%s)", oui and "ALLUMÉ" or "ÉTEINT", raison))
	for _, f in ecoutes do
		local ok, err = pcall(f, oui)
		if not ok then warn("[CashCar] appareil faible : " .. tostring(err)) end
	end
end
-- une part de quelque chose (des particules, des stries) : `k` en mode faible, tout sur PC
function Perf.part(k: number?): number
	return Perf.faible and (k or 1) or 1
end

-- ── l'allumage au démarrage : le téléphone (ou la tablette) sans clavier ; le banc d'abord ──
do
	local d = workspace:GetAttribute("DbgFaible")
	if type(d) == "boolean" then
		Perf.force = d
		basculer(d, "banc")
	elseif Config.TACTILE_TEST == true or (UserInputService.TouchEnabled and not UserInputService.KeyboardEnabled) then
		basculer(true, "appareil tactile")
	end
	workspace:GetAttributeChangedSignal("DbgFaible"):Connect(function()
		local v = workspace:GetAttribute("DbgFaible")
		if type(v) == "boolean" then
			Perf.force = v
			basculer(v, "banc")
		else
			Perf.force = nil
		end
	end)
end

-- ── la bascule automatique : l'image, comptée par fenêtres d'une demi-seconde, en course seulement ──
do
	local n, t, bas = 0, 0, 0
	local focus = true
	UserInputService.WindowFocused:Connect(function() focus, bas = true, 0 end)
	UserInputService.WindowFocusReleased:Connect(function() focus, bas = false, 0 end)
	RunService.RenderStepped:Connect(function(dt: number)
		if Perf.faible or Perf.force ~= nil then return end
		n += 1
		t += dt
		if t < 0.5 then return end
		local ips = n / t
		local fen = t
		n, t = 0, 0
		local faux = workspace:GetAttribute("DbgIps")
		if type(faux) == "number" then ips = faux end
		local e = Bus.etat()
		local course = (e.mode == "drive" or e.mode == "fall") and not e.pause
		if not course or (not focus and type(faux) ~= "number") then
			bas = 0
			return
		end
		if ips < (F.seuilIps or 30) then bas += fen else bas = 0 end
		if bas >= (F.duree or 5) then
			basculer(true, string.format("%.0f images/s pendant %.1f s de course", ips, bas))
		end
	end)
end

-- ════════ (banc) LE GUETTEUR : workspace « DbgPerf » = une étiquette ════════
-- Pendant « DbgPerfT » secondes (6 par défaut) : le temps par image (moyenne, 95e centile, pire, images de plus de 33 ms), ce que
-- Roblox compte du rendu (triangles, appels de dessin, temps processeur et carte graphique), le temps de Luau par poste ; puis
-- l'inventaire du monde par poste (pièces, maillages, émetteurs, rubans, traînées, lumières, panneaux) et l'empreinte du JEU
-- (les objets de la route et les nuages qu'on traverse : elle doit être la même en mode faible). « DbgPerfAbl » = true : en plus,
-- chaque poste est retiré du monde une demi-seconde — ce qu'il coûtait en triangles et en appels de dessin, là, à l'écran.
-- Tout s'écrit avec warn (le relais du banc ne transmet que les avertissements). Rien de tout ça n'existe sans l'attribut.
local chronos: { [string]: number } = {}
local mesure = false
-- une fonction chronométrée pendant la mesure (et seulement pendant : hors mesure, un seul test de booléen) — ce qu'elle rend est
-- rendu tel quel (Orage.tick et Impact.tick rendent la secousse : un premier banc l'avait avalée, le pilote comparait nil)
function Perf.chrono(nom: string, f: (...any) -> ...any): (...any) -> ...any
	return function(...)
		if not mesure then return f(...) end
		local t0 = os.clock()
		local r = table.pack(f(...))
		chronos[nom] = (chronos[nom] or 0) + os.clock() - t0
		return table.unpack(r, 1, r.n)
	end
end
local function stat(St: Stats, k: string): number
	local ok, v = pcall(function() return (St :: any)[k] end)
	return (ok and type(v) == "number") and v or 0
end
-- les postes : chaque enfant du monde ; une zone se coupe en deux (son décor : nuages, ville ou orbite — et le reste : la route et
-- ses objets) ; les nuages qu'on traverse sont comptés à part (Nuages.jeu)
local JEU = { piece = true, plot = true, pad = true, flaque = true, cristal = true, fruit = true, SatRoute = true, Dalle = true }
local function inventaire(etiquette: string)
	local CL = script.Parent
	local okN, Nuages = pcall(require, CL:FindFirstChild("Nuages"))
	local nuageJeu = (okN and Nuages.jeu) or {}
	local postes: { [string]: { number } } = {} -- { pièces, maillages, visibles, émetteurs allumés, débit, rubans, traînées, lumières, panneaux }
	local empreintes: { [string]: { number } } = {}
	local function ajoute(nom: string, d: Instance)
		local c = postes[nom]
		if not c then
			c = { 0, 0, 0, 0, 0, 0, 0, 0, 0 }
			postes[nom] = c
		end
		if d:IsA("BasePart") then
			c[1] += 1
			if d:IsA("MeshPart") then c[2] += 1 end
			if d.Transparency < 1 and d.LocalTransparencyModifier < 1 then c[3] += 1 end
		elseif d:IsA("ParticleEmitter") then
			if d.Enabled and d.Rate > 0 then
				c[4] += 1
				c[5] += d.Rate
			end
		elseif d:IsA("Beam") then
			if d.Enabled then c[6] += 1 end
		elseif d:IsA("Trail") then
			if d.Enabled then c[7] += 1 end
		elseif d:IsA("Light") then
			if d.Enabled and d.Brightness > 0 then c[8] += 1 end
		elseif d:IsA("BillboardGui") or d:IsA("SurfaceGui") then
			if d.Enabled then c[9] += 1 end
		end
	end
	local function empreinte(z: string, d: Instance)
		if not d:IsA("BasePart") then return end
		local k = (nuageJeu[d] and "nuageJeu") or (JEU[d.Name] and d.Name) or nil
		if not k then return end
		local e = empreintes[z .. ":" .. k]
		if not e then
			e = { 0, 0 }
			empreintes[z .. ":" .. k] = e
		end
		local p = d.Position
		e[1] += 1
		e[2] += math.floor(p.X / 10) + math.floor(p.Y / 10) * 3 + math.floor(p.Z / 10) * 7
	end
	for _, c in workspace:GetChildren() do
		if c:IsA("Terrain") or c:IsA("Camera") then continue end
		if string.match(c.Name, "^Zone%d+$") then
			for _, cc in c:GetChildren() do
				if cc.Name == "Nuages" and cc:IsA("Folder") then
					local sous = (cc:FindFirstChild("Ville") and "Ville") or (cc:FindFirstChild("Satellites") and "Espace") or "Nuages"
					-- (la ville : ses tours DURES — la collision est bâtie sur ces volumes, ils doivent être les mêmes en mode faible)
					local v9 = cc:FindFirstChild("Ville")
					if v9 then
						empreintes[c.Name .. ":villeVolumes"] = { (v9:GetAttribute("volumes") or 0) :: number, (v9:GetAttribute("tours") or 0) :: number }
					end
					for _, d in cc:GetDescendants() do
						ajoute(c.Name .. "/" .. sous .. ((nuageJeu[d] and "(jeu)") or ""), d)
						empreinte(c.Name, d)
					end
				else
					ajoute(c.Name .. "/route+objets", cc)
					empreinte(c.Name, cc)
					for _, d in cc:GetDescendants() do
						ajoute(c.Name .. "/route+objets", d)
						empreinte(c.Name, d)
					end
				end
			end
		else
			ajoute(c.Name, c)
			for _, d in c:GetDescendants() do ajoute(c.Name, d) end
		end
	end
	local noms = {}
	for k in postes do table.insert(noms, k) end
	table.sort(noms, function(a, b) return postes[a][1] + postes[a][6] * 3 + postes[a][9] > postes[b][1] + postes[b][6] * 3 + postes[b][9] end)
	local l = {}
	for _, k in noms do
		local c = postes[k]
		if c[1] + c[4] + c[6] + c[7] + c[8] + c[9] > 0 then
			table.insert(l, string.format("%s=%d/%dm/%dv pe%d(%d/s) b%d t%d l%d g%d", k, c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9]))
		end
	end
	-- (par paquets : une ligne de journal trop longue se lit mal)
	for i = 1, #l, 8 do
		warn("[CashCar] PERF " .. etiquette .. " postes " .. table.concat(l, " · ", i, math.min(#l, i + 7)))
	end
	local e = {}
	for k, v in empreintes do table.insert(e, string.format("%s=%d#%d", k, v[1], v[2])) end
	table.sort(e)
	warn("[CashCar] PERF " .. etiquette .. " jeu " .. table.concat(e, " "))
end
-- retirer un poste du monde une demi-seconde : ce qu'il coûtait, à l'écran
local function ablation(etiquette: string)
	local St = game:GetService("Stats")
	local Lighting = game:GetService("Lighting")
	local function echantillon(): (number, number, number, number)
		local tri, dr, gpu, cpu, k = 0, 0, 0, 0, 0
		local t0 = os.clock()
		while os.clock() - t0 < 0.35 do
			RunService.RenderStepped:Wait()
			tri += stat(St, "SceneTriangleCount")
			dr += stat(St, "SceneDrawcallCount")
			gpu += stat(St, "RenderGPUFrameTime")
			cpu += stat(St, "RenderCPUFrameTime")
			k += 1
		end
		k = math.max(1, k)
		return tri / k, dr / k, gpu / k * 1000, cpu / k * 1000
	end
	local cibles: { { any } } = {}
	local function retirer(nom: string, i: Instance?)
		if not i then return end
		local parent = i.Parent
		table.insert(cibles, { nom, function() i.Parent = nil end, function() if i.Parent == nil then i.Parent = parent end end })
	end
	for _, c in workspace:GetChildren() do
		if string.match(c.Name, "^Zone%d+$") then
			retirer(c.Name .. "/decor", c:FindFirstChild("Nuages"))
			retirer(c.Name, c)
		elseif not (c:IsA("Terrain") or c:IsA("Camera")) and (c:IsA("Folder") or c:IsA("Model") or #c:GetChildren() > 0) then
			retirer(c.Name, c)
		end
	end
	for _, eff in { "Lointain", "Bloom", "Rayons", "Etalonnage" } do
		local x = Lighting:FindFirstChild(eff)
		if x and x:IsA("PostEffect") then
			local avant = x.Enabled
			table.insert(cibles, { "post:" .. eff, function() x.Enabled = false end, function() x.Enabled = avant end })
		end
	end
	do
		local avant = Lighting.GlobalShadows
		table.insert(cibles, { "ombres", function() Lighting.GlobalShadows = false end, function() Lighting.GlobalShadows = avant end })
	end
	-- (A-B-A : la référence est prise juste AVANT et juste APRÈS chaque retrait — un premier banc n'en prenait qu'une, au début, et
	-- la scène qui bouge encore un peu (les volées, la mer) faisait des écarts de ±30 appels de dessin à tort)
	local b0t, b0d, b0g, b0c = echantillon()
	local B = { b0t, b0d, b0g, b0c }
	local l = {}
	for _, c in cibles do
		c[2]()
		task.wait(0.15)
		local t, d, g, cp = echantillon()
		c[3]()
		task.wait(0.15)
		local t2, d2, g2, c2 = echantillon()
		table.insert(l, string.format("%s:-%dtri/-%ddraw/-%.2fgpu/-%.2fcpu", c[1], (B[1] + t2) / 2 - t, (B[2] + d2) / 2 - d, (B[3] + g2) / 2 - g, (B[4] + c2) / 2 - cp))
		B = { t2, d2, g2, c2 }
	end
	warn(string.format("[CashCar] PERF %s ablation base %dtri %ddraw gpu%.2f cpu%.2f", etiquette, b0t, b0d, b0g, b0c))
	for i = 1, #l, 6 do
		warn("[CashCar] PERF " .. etiquette .. " ablation " .. table.concat(l, " · ", i, math.min(#l, i + 5)))
	end
end
local function guetter(etiquette: string)
	if mesure then return end
	mesure = true
	table.clear(chronos)
	local CL = script.Parent
	local St = game:GetService("Stats")
	-- les systèmes que le pilote appelle à chaque image : enveloppés le temps de la mesure (ils sont appelés par leur champ)
	local enveloppes = {}
	for _, v in { { "Nuages", "suivre" }, { "Nuages", "finesseTick" }, { "Mer", "suivre" }, { "Espace", "tick" }, { "Ville", "pluie" }, { "Ville", "phares" },
		{ "Orage", "tick" }, { "Traces", "tick" }, { "Impact", "tick" }, { "Pigeons", "tick" }, { "CielMusical", "tick" }, { "Viseur", "tick" } } do
		local okM, m = pcall(require, CL:FindFirstChild(v[1]))
		if okM and type(m) == "table" and type(m[v[2]]) == "function" then
			local f = m[v[2]]
			m[v[2]] = Perf.chrono(v[1], f)
			table.insert(enveloppes, { m, v[2], f })
		end
	end
	-- le pilote ENTIER (sa boucle est liée au rendu, juste après la caméra) : deux bornes autour de lui
	local tP = 0
	RunService:BindToRenderStep("CashCarPerfAvant", Enum.RenderPriority.Camera.Value, function() tP = os.clock() end)
	RunService:BindToRenderStep("CashCarPerfApres", Enum.RenderPriority.Camera.Value + 2, function() chronos.Pilote = (chronos.Pilote or 0) + os.clock() - tP end)
	local dts: { number } = {}
	local s = { 0, 0, 0, 0, 0, 0, 0 } -- FrameTime, RenderCPU, RenderGPU, triangles, appels de dessin, ombres, pire triangles
	local p0 = Perf.particules
	local cn = RunService.RenderStepped:Connect(function(dt: number)
		table.insert(dts, dt)
		s[1] += stat(St, "FrameTime")
		s[2] += stat(St, "RenderCPUFrameTime")
		s[3] += stat(St, "RenderGPUFrameTime")
		local tri = stat(St, "SceneTriangleCount")
		s[4] += tri
		s[5] += stat(St, "SceneDrawcallCount")
		s[6] += stat(St, "ShadowsDrawcallCount")
		s[7] = math.max(s[7], tri)
	end)
	local T = workspace:GetAttribute("DbgPerfT")
	T = (type(T) == "number") and T or 6
	local t0 = os.clock()
	task.wait(T)
	local duree = os.clock() - t0
	cn:Disconnect()
	RunService:UnbindFromRenderStep("CashCarPerfAvant")
	RunService:UnbindFromRenderStep("CashCarPerfApres")
	for _, e in enveloppes do e[1][e[2]] = e[3] end
	mesure = false
	local n = math.max(1, #dts)
	local tri = table.clone(dts)
	table.sort(tri)
	local somme, lents = 0, 0
	for _, d in dts do
		somme += d
		if d > 1 / 30 then lents += 1 end
	end
	local e = Bus.etat()
	local okM, mem = pcall(function() return St:GetTotalMemoryUsageMb() end)
	warn(string.format("[CashCar] PERF %s images n=%d moy=%.1fms p95=%.1fms pire=%.1fms >33ms=%d ips=%.1f | frame=%.1fms cpuRendu=%.2fms gpu=%.2fms tri=%d (pire %d) draw=%d ombresDraw=%d particules/s=%d mem=%dMo | mode=%s zone=%s faible=%s",
		etiquette, #dts, somme / n * 1000, tri[math.max(1, math.floor(n * 0.95))] * 1000, tri[n] * 1000, lents, #dts / duree,
		s[1] / n * 1000, s[2] / n * 1000, s[3] / n * 1000, s[4] / n, s[7], s[5] / n, s[6] / n, (Perf.particules - p0) / duree,
		okM and math.floor(mem) or -1, tostring(e.mode), tostring(e.zone), tostring(Perf.faible)))
	local l = {}
	for k, v in chronos do table.insert(l, { k, v }) end
	table.sort(l, function(a, b) return a[2] > b[2] end)
	local o = {}
	for _, v in l do table.insert(o, string.format("%s=%.3f", v[1], v[2] / n * 1000)) end
	warn("[CashCar] PERF " .. etiquette .. " luau(ms/image) " .. table.concat(o, " "))
	inventaire(etiquette)
	if workspace:GetAttribute("DbgPerfAbl") then ablation(etiquette) end
end
workspace:GetAttributeChangedSignal("DbgPerf"):Connect(function()
	local l = workspace:GetAttribute("DbgPerf")
	if type(l) == "string" and l ~= "" then
		task.spawn(function()
			local ok, err = pcall(guetter, l)
			if not ok then
				mesure = false
				warn("[CashCar] PERF erreur : " .. tostring(err))
			end
		end)
	end
end)

return Perf
