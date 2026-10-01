-- CASH CAR — LES MISSIONS (carnets de 3 défis, voir Carnets). Trois endroits, comme sur le web :
--   · l'ÉCRAN des missions (depuis le menu) : les trois défis du carnet ouvert, leur jauge (le MEILLEUR ESSAI d'une
--     partie), la prime, la récompense ; on TOUCHE un défi pour le suivre en course ;
--   · EN COURSE : toutes les 0,25 s on relit les compteurs de la partie ; un défi réussi claque sa bannière verte
--     (« DEFI REUSSI » + la prime, versée au compte tout de suite, même si la partie finit mal) ; le défi SUIVI
--     tient une ligne discrète sous l'argent ;
--   · à la MORT : le défi dont cette partie s'est le plus approchée, et la récompense si le carnet vient de se fermer.
-- Le serveur fait foi (primes, récompenses) : ici on DEMANDE (ctx.action("defi", i, valeur)).
local TweenService = game:GetService("TweenService")
local CC = script.Parent.Parent
local Carnets = require(CC:WaitForChild("Carnets"))
local Caisse = require(CC:WaitForChild("Caisse"))
local Hud = require(script.Parent:WaitForChild("Hud"))
local Sons = require(script.Parent:WaitForChild("Sons"))

local Missions = { ouvert = false }
local K, C, E, FR = Hud.kit, Hud.C, Hud.E, Hud.FR
local inst = K.inst
local ctx: any = nil
local U: any = {}
local VERT = Color3.fromRGB(125, 255, 155)
local function tr(fr: string, en: string): string return FR and fr or en end

local function etat(): any
	local p = ctx.profil()
	if type(p.mis) ~= "table" or not p.mis.sain then -- (remis d'aplomb UNE fois par profil reçu, pas à chaque image)
		p.mis = Carnets.etat(p.mis)
		p.mis.sain = true
	end
	return p.mis
end
local function carnet(): any return Carnets.de(etat().n) end

-- le nom d'une récompense et sa couleur (une caisse : la couleur de sa rareté ; une peinture, une traînée ; du cash : le vert de l'argent)
local RARETE = { commun = Color3.fromRGB(185, 196, 214), rare = Color3.fromRGB(77, 184, 255), epique = Color3.fromRGB(199, 125, 255),
	legendaire = Color3.fromRGB(255, 215, 94), defi = Color3.fromRGB(94, 227, 122) }
function Missions.recompense(rec: any): (string, Color3)
	if rec.caisse then
		local f = Caisse.Catalogue[rec.caisse]
		return string.upper(FR and f.nom or (f.en or f.nom)), RARETE[f.rar] or C.texte
	elseif rec.habit then
		local traine = string.sub(rec.habit, 1, 7) == "trainee"
		return tr(rec.nom, rec.en), traine and Color3.fromRGB(255, 176, 64) or Color3.fromRGB(255, 154, 216)
	end
	return "BONUS " .. Hud.argent(rec.cash or 0), VERT
end

-- ════════ l'écran ════════
local function creer()
	local racine = Hud.racine
	local g = inst("Frame", { Name = "Missions", BackgroundColor3 = Color3.fromRGB(7, 5, 15), BackgroundTransparency = 0.35, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 12 }, racine)
	U.racine = g
	U.titre = K.texte(g, { Text = "", TextSize = 18, TextColor3 = C.texte, Size = UDim2.new(1, -80, 0, 28), Position = UDim2.fromOffset(40, 30),
		TextXAlignment = Enum.TextXAlignment.Left, epais = 3 })
	for k, c in { C.magenta, C.cyan, C.or_ } do
		inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = c, Size = UDim2.fromOffset(k == 1 and 180 or 110, 5), Position = UDim2.fromOffset(40 + (k == 1 and 0 or (k == 2 and 190 or 310)), 64) }, g)
	end
	U.cartes = {}
	for i = 1, 3 do
		local c = K.carbone(g, UDim2.new(0.5, -60, 0, 112), UDim2.fromOffset(40, 90 + (i - 1) * 124), C.cyan)
		c.Active = true
		K.texte(c, { Text = tr("DEFI ", "CHALLENGE ") .. i, TextSize = 10, TextColor3 = C.terne, Size = UDim2.fromOffset(160, 14), Position = UDim2.fromOffset(22, 12),
			TextXAlignment = Enum.TextXAlignment.Left })
		local txt = K.texte(c, { Text = "", TextSize = 15, TextColor3 = C.texte, Size = UDim2.new(1, -170, 0, 22), Position = UDim2.fromOffset(22, 32),
			TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
		local prime = K.texte(c, { Text = "", TextSize = 16, TextColor3 = VERT, Size = UDim2.fromOffset(140, 22), Position = UDim2.new(1, -16, 0, 30),
			AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
		local fond = inst("Frame", { BackgroundColor3 = C.piste, BorderSizePixel = 0, Size = UDim2.new(1, -44, 0, 10), Position = UDim2.fromOffset(22, 64) }, c)
		local plein = inst("Frame", { BackgroundColor3 = C.cyan, BorderSizePixel = 0, Size = UDim2.fromScale(0, 1) }, fond)
		local statut = K.texte(c, { Text = "", TextSize = 10, TextColor3 = C.texte2, Size = UDim2.new(1, -44, 0, 14), Position = UDim2.fromOffset(22, 84),
			TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
		local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", ZIndex = 14 }, c)
		U.cartes[i] = { cadre = c, txt = txt, prime = prime, plein = plein, statut = statut, filet = c:FindFirstChildOfClass("Frame") }
		b.Activated:Connect(function()
			Sons.jouer("tap")
			local m = etat()
			if m.ok[i] then return end
			m.f = (m.f == i) and -1 or i -- toucher le défi suivi le lâche
			task.spawn(function() ctx.action("suivre", m.f) end)
			Missions.maj()
		end)
	end
	-- la RÉCOMPENSE
	local r = K.carbone(g, UDim2.new(0.5, -100, 0, 236), UDim2.new(0.5, 30, 0, 90), C.or_)
	U.recTitre = K.texte(r, { Text = "", TextSize = 11, TextColor3 = C.terne, Size = UDim2.new(1, -40, 0, 14), Position = UDim2.fromOffset(22, 14),
		TextXAlignment = Enum.TextXAlignment.Left })
	U.recVue = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.new(1, -40, 0, 130), Position = UDim2.fromOffset(20, 34),
		Ambient = Color3.fromRGB(150, 150, 178), LightColor = Color3.fromRGB(255, 244, 230) }, r)
	U.recNom = K.texte(r, { Text = "", TextSize = 20, Size = UDim2.new(1, -40, 0, 26), Position = UDim2.new(0, 20, 1, -66), TextWrapped = false, epais = 3 })
	U.recSuite = K.texte(r, { Text = "", TextSize = 9, TextColor3 = C.terne, Size = UDim2.new(1, -40, 0, 14), Position = UDim2.new(0, 20, 1, -32), TextWrapped = false })
	U.aide = K.texte(g, { Text = tr("TOUCHE UN DEFI POUR LE SUIVRE EN COURSE", "TAP A CHALLENGE TO TRACK IT IN RACE"), TextSize = 10, TextColor3 = C.texte2,
		Size = UDim2.new(0.5, -60, 0, 16), Position = UDim2.fromOffset(40, 470), TextXAlignment = Enum.TextXAlignment.Left })
	U.btHome = K.tuile(g, "HOME", C.lavande, UDim2.fromOffset(150, 70), UDim2.new(1, -420, 1, -30), Vector2.new(0, 1), 13, "maison", "v")
	U.btJouer = K.lingot(g, tr("JOUER", "PLAY"), UDim2.fromOffset(250, 70), UDim2.new(1, -40, 1, -30), Vector2.new(1, 1), 30)
	U.btHome.Activated:Connect(function() ctx.surHome() end)
	U.btJouer.Activated:Connect(function() ctx.surJouer() end)
	for _, d in g:GetDescendants() do
		if d:IsA("GuiObject") and d.ZIndex < 13 then d.ZIndex = 13 end
	end

	-- ── EN COURSE : la ligne du défi SUIVI (sous le chrono d'air) et la bannière « DEFI REUSSI » ──
	local hud = E.hud
	U.suivi = inst("Frame", { Name = "DefiSuivi", BackgroundTransparency = 1, Size = UDim2.fromOffset(420, 30), Position = UDim2.new(1, -22, 0, 236),
		AnchorPoint = Vector2.new(1, 0), Visible = false }, hud)
	U.suiviTxt = K.texte(U.suivi, { Text = "", TextSize = 10, TextColor3 = C.texte2, Size = UDim2.new(1, 0, 0, 14), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
	local fs = inst("Frame", { BackgroundColor3 = C.piste, BorderSizePixel = 0, Size = UDim2.fromOffset(180, 4), Position = UDim2.new(1, 0, 0, 20), AnchorPoint = Vector2.new(1, 0) }, U.suivi)
	U.suiviPlein = inst("Frame", { BackgroundColor3 = C.cyan, BorderSizePixel = 0, Size = UDim2.fromScale(0, 1) }, fs)
	U.banniere = K.carbone(hud, UDim2.fromOffset(460, 70), UDim2.new(0.5, 0, 0, -90), VERT, Vector2.new(0.5, 0))
	K.texte(U.banniere, { Text = tr("DEFI REUSSI", "CHALLENGE DONE"), TextSize = 10, TextColor3 = VERT, Size = UDim2.new(1, -30, 0, 14), Position = UDim2.fromOffset(20, 10),
		TextXAlignment = Enum.TextXAlignment.Left })
	U.banTxt = K.texte(U.banniere, { Text = "", TextSize = 14, TextColor3 = C.texte, Size = UDim2.new(1, -150, 0, 22), Position = UDim2.fromOffset(20, 32),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.banPrime = K.texte(U.banniere, { Text = "", TextSize = 16, TextColor3 = VERT, Size = UDim2.fromOffset(130, 22), Position = UDim2.new(1, -14, 0, 30),
		AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
	U.banniere.Visible = false
end

local vignetteDe = -1
local function vignette(rec: any)
	local i = rec.caisse or -1
	if i == vignetteDe then return end
	vignetteDe = i
	U.recVue:ClearAllChildren()
	if i < 0 then return end
	task.spawn(function()
		local m = Caisse.vignette(i)
		if not m or vignetteDe ~= i then
			if m then m:Destroy() end
			return
		end
		local corps = m.PrimaryPart :: BasePart
		local az, el = 0.82, 0.27
		local dir = Vector3.new(-math.sin(az) * math.cos(el), math.sin(el), -math.cos(az) * math.cos(el))
		local cam = Instance.new("Camera")
		cam.FieldOfView = 24
		local dist = (corps.Size.Z * math.sin(az) + corps.Size.X * math.cos(az)) / 0.9 / (2 * math.tan(math.rad(12)) * 2.2) + corps.Size.Z * 0.18
		cam.CFrame = CFrame.lookAt(corps.Position + dir * dist, corps.Position)
		cam.Parent = U.recVue
		U.recVue.CurrentCamera = cam
		U.recVue.LightDirection = (-dir * 0.5 + Vector3.new(0.5, -1, 0.2)).Unit
		m.Parent = U.recVue
	end)
end

function Missions.maj()
	if not U.racine then return end
	local m, c = etat(), carnet()
	U.titre.Text = tr("CARNET ", "BOOK ") .. (m.n + 1) .. tr(" · CHAQUE DEFI EN UNE PARTIE", " · EACH CHALLENGE IN ONE RUN")
	local faits = 0
	for i = 1, 3 do
		local d, u = c[i], U.cartes[i]
		u.txt.Text = Carnets.texte(d, FR, Hud.argent)
		u.prime.Text = "+" .. Hud.argent(d.p)
		local ok = m.ok[i]
		if ok then faits += 1 end
		u.plein.Size = UDim2.fromScale(ok and 1 or math.clamp(m.best[i] / d.v, 0, 1), 1)
		u.plein.BackgroundColor3 = ok and VERT or C.cyan
		if ok then
			u.statut.Text = tr("REUSSI", "DONE")
			u.statut.TextColor3 = VERT
		elseif m.f == i then
			u.statut.Text = tr("SUIVI EN COURSE", "TRACKED IN RACE")
			u.statut.TextColor3 = C.cyan
		else
			u.statut.Text = tr("MEILLEUR ESSAI ", "BEST RUN ") .. Carnets.progres(d, m.best[i], FR, Hud.argent)
			u.statut.TextColor3 = C.texte2
		end
		if u.filet then u.filet.BackgroundColor3 = ok and VERT or ((m.f == i) and C.or_ or C.cyan) end
	end
	local nom, couleur = Missions.recompense(c.rec)
	U.recTitre.Text = tr("RECOMPENSE ", "REWARD ") .. faits .. " / 3"
	U.recNom.Text = nom
	U.recNom.TextColor3 = couleur
	local suite = Missions.recompense(Carnets.de(m.n + 1).rec)
	U.recSuite.Text = tr("ENSUITE · ", "NEXT · ") .. suite
	vignette(c.rec)
	local suivi = (m.f >= 1 and not m.ok[m.f]) and c[m.f] or nil
	U.aide.Text = suivi and (tr("SUIVI : ", "TRACKING: ") .. Carnets.texte(suivi, FR, Hud.argent))
		or tr("TOUCHE UN DEFI POUR LE SUIVRE EN COURSE", "TAP A CHALLENGE TO TRACK IT IN RACE")
end

function Missions.init(c: any)
	ctx = c
	creer()
end
-- combien de défis du carnet sont tenus (les trois cases du bouton MISSIONS de l'accueil)
function Missions.faits(): number
	local m, n = etat(), 0
	for i = 1, 3 do
		if m.ok[i] then n += 1 end
	end
	return n
end
function Missions.ouvrir()
	Missions.ouvert = true
	Missions.maj()
	U.racine.Visible = true
	U.racine.Position = UDim2.fromOffset(0, 18)
	TweenService:Create(U.racine, K.LENTE, { Position = UDim2.fromOffset(0, 0) }):Play()
end
function Missions.fermer()
	Missions.ouvert = false
	U.racine.Visible = false
end

-- ════════ en course ════════
local horloge, banFin, suiviFin = 0, 0, 0
local reussisPartie: { number } = {}
local meilleurePartie = { 0, 0, 0 }
function Missions.debut()
	horloge, suiviFin = 0, 0
	table.clear(reussisPartie)
	meilleurePartie = { 0, 0, 0 }
	U.banniere.Visible = false
end
local function banniere(d: any)
	U.banTxt.Text = Carnets.texte(d, FR, Hud.argent)
	U.banPrime.Text = "+" .. Hud.argent(d.p)
	U.banniere.Visible = true
	U.banniere.Position = UDim2.new(0.5, 0, 0, -90)
	TweenService:Create(U.banniere, K.LENTE, { Position = UDim2.new(0.5, 0, 0, 96) }):Play()
	banFin = os.clock() + 1.6
	Sons.jouer("record", 1.3, 0.4)
end
-- r = les compteurs de la partie (voir Carnets.valeur)
function Missions.tick(dt: number, r: any)
	local t = os.clock()
	if U.banniere.Visible and t > banFin then
		U.banniere.Visible = false
	end
	horloge -= dt
	local m, c = etat(), carnet()
	if horloge <= 0 then
		horloge = 0.25
		for i = 1, 3 do
			if not m.ok[i] then
				local d = c[i]
				local v = Carnets.valeur(d.k, r)
				meilleurePartie[i] = math.max(meilleurePartie[i], v)
				if v > m.best[i] then m.best[i] = math.min(d.v, v) end
				if v >= d.v then
					m.ok[i] = true -- (le serveur confirme et verse la prime)
					table.insert(reussisPartie, i)
					banniere(d)
					if m.f == i then suiviFin = t + 3.2 end
					task.spawn(function() ctx.action("defi", i, v) end)
				end
			end
		end
	end
	-- la ligne du défi suivi
	local f = m.f
	if f >= 1 and c[f] then
		local d = c[f]
		U.suivi.Visible = true
		if m.ok[f] then
			U.suiviTxt.Text = "◆ " .. Carnets.texte(d, FR, Hud.argent) .. " · " .. tr("REUSSI", "DONE")
			U.suiviTxt.TextColor3 = VERT
			U.suiviPlein.Size = UDim2.fromScale(1, 1)
			U.suiviPlein.BackgroundColor3 = VERT
			if suiviFin > 0 and t > suiviFin then
				m.f = -1
				suiviFin = 0
			end
		else
			local v = Carnets.valeur(d.k, r)
			U.suiviTxt.Text = "◆ " .. Carnets.texte(d, FR, Hud.argent) .. " · " .. Carnets.progres(d, v, FR, Hud.argent)
			U.suiviTxt.TextColor3 = C.texte2
			U.suiviPlein.Size = UDim2.fromScale(math.clamp(v / d.v, 0, 1), 1)
			U.suiviPlein.BackgroundColor3 = C.cyan
		end
	else
		U.suivi.Visible = false
	end
end

-- à la mort : ce qu'il faut écrire sur l'écran de fin. Rend { ligne, couleur, ferme = { nom, couleur }? }
function Missions.fin(r: any): any
	U.suivi.Visible = false
	U.banniere.Visible = false
	local m, c = etat(), carnet()
	local res: any = { meilleur = meilleurePartie }
	-- LA CARTE de l'écran de fin (Hud.defi) : l'en-tête, le défi, sa jauge, sa prime, l'objet du carnet, les trois cases
	local recNom, recCouleur = Missions.recompense(c.rec)
	local function carte(d: any, reussi: boolean, tete: string, part: number)
		res.carte = { tete = tete, reussi = reussi, texte = Carnets.texte(d, FR, Hud.argent), part = part, prime = "+" .. Hud.argent(d.p),
			rec = Hud.sansAccent(recNom), recCouleur = recCouleur, faits = { m.ok[1], m.ok[2], m.ok[3] } }
	end
	if m.ok[1] and m.ok[2] and m.ok[3] then
		-- le carnet se FERME (le serveur donne la récompense à la fin de la partie)
		local nom, couleur = Missions.recompense(c.rec)
		carte(c[reussisPartie[#reussisPartie] or 3], true, tr("CARNET FINI !", "BOOK DONE!"), 1)
		res.ferme = { nom = nom, couleur = couleur, rec = c.rec }
		res.ligne = tr("DEFIS REUSSIS ! ", "CHALLENGES DONE! ") .. nom .. ((c.rec.cash and tr(" VERSES AU COMPTE", " PAID TO ACCOUNT")) or tr(" EST A TOI", " IS YOURS"))
		res.couleur = C.or_
		return res
	end
	if #reussisPartie > 0 then
		local d = c[reussisPartie[#reussisPartie]]
		carte(d, true, tr("DEFI REUSSI !", "CHALLENGE DONE!"), 1)
		res.ligne = tr("DEFI REUSSI ! ", "CHALLENGE DONE! ") .. Carnets.texte(d, FR, Hud.argent) .. "  +" .. Hud.argent(d.p)
		res.couleur = VERT
		return res
	end
	-- sinon : le défi dont cette partie s'est le plus approchée
	local mieux, part = 0, -1
	for i = 1, 3 do
		if not m.ok[i] then
			local q = math.clamp(Carnets.valeur(c[i].k, r) / c[i].v, 0, 1)
			if q > part then mieux, part = i, q end
		end
	end
	if mieux > 0 then
		local d = c[mieux]
		carte(d, false, tr("DEFI · ", "CHALLENGE · ") .. Carnets.progres(d, Carnets.valeur(d.k, r), FR, Hud.argent), part)
		res.ligne = Carnets.texte(d, FR, Hud.argent) .. "\n" .. tr("CETTE PARTIE · ", "THIS RUN · ") .. Carnets.progres(d, Carnets.valeur(d.k, r), FR, Hud.argent)
		res.couleur = C.texte2
	end
	return res
end

return Missions
