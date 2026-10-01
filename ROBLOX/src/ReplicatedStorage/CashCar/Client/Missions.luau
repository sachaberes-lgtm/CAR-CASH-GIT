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

-- ════════ l'écran (LES MISSIONS v2 du web, 844 × 390 porté sur 720 px) ════════
-- Lu de gauche à droite : le titre et le mode d'emploi en haut à gauche, les TROIS DÉFIS en haut à droite (chacun sa jauge : le
-- meilleur essai en UNE partie, et sa prime), la RÉCOMPENSE du carnet en bas à gauche (l'objet, dans la couleur de sa famille, et
-- celui d'après), HOME et le lingot JOUER en bas à droite. (Les corps : la police pixel fait 5/9 de son TextSize — voir Hud.)
local CYAN = Color3.fromRGB(94, 230, 255)
local function creer()
	local racine = Hud.racine
	local g = inst("Frame", { Name = "Missions", BackgroundColor3 = Color3.fromRGB(6, 16, 34), BackgroundTransparency = 0.22, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 12 }, racine)
	U.racine = g
	K.texte(g, { Text = "MISSIONS", TextSize = 60, TextColor3 = CYAN, Size = UDim2.fromOffset(600, 62), Position = UDim2.fromOffset(34, 14),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 4, contourCouleur = Color3.fromRGB(4, 30, 52) })
	U.titre = K.texte(g, { Text = "", TextSize = 26, TextColor3 = C.texte2, Size = UDim2.fromOffset(620, 28), Position = UDim2.fromOffset(34, 80),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.titreEchelle = inst("UIScale", {}, U.titre)
	U.aide = K.texte(g, { Text = "", TextSize = 26, TextColor3 = C.or_, Size = UDim2.fromOffset(620, 60), Position = UDim2.fromOffset(34, 116),
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, LineHeight = 1.25 })
	-- les trois défis, en haut à droite (sur un écran moins large que celui du web, ils se resserrent)
	local rangee = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, -690, 0, 196), Position = UDim2.new(1, -33, 0, 22), AnchorPoint = Vector2.new(1, 0) }, g)
	inst("UISizeConstraint", { MaxSize = Vector2.new(810, 196), MinSize = Vector2.new(420, 196) }, rangee)
	U.cartes = {}
	for i = 1, 3 do
		local c = inst("Frame", { BackgroundColor3 = Color3.fromRGB(8, 22, 44), BackgroundTransparency = 0.08, BorderSizePixel = 0, Size = UDim2.new(1 / 3, -10, 1, 0),
			Position = UDim2.new((i - 1) / 3, 5, 0, 0), Active = true }, rangee)
		local trait = inst("UIStroke", { Color = CYAN, Thickness = 2, Transparency = 0.45, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, c)
		local case = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(20, 20), Position = UDim2.fromOffset(16, 16) }, c)
		local caseTrait = inst("UIStroke", { Color = CYAN, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, case)
		local coche = K.icone(case, "coche", 2, VERT, UDim2.fromScale(0.5, 0.5), Vector2.new(0.5, 0.5))
		coche.Visible = false
		local tete = K.texte(c, { Text = tr("DEFI ", "CHALLENGE ") .. i, TextSize = 26, TextColor3 = CYAN, Size = UDim2.new(1, -56, 0, 28), Position = UDim2.fromOffset(46, 12),
			TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
		local txt = K.texte(c, { Text = "", TextSize = 32, TextColor3 = C.texte, Size = UDim2.new(1, -30, 0, 68), Position = UDim2.fromOffset(16, 46),
			TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, TextScaled = true, LineHeight = 1.15, epais = 3 })
		inst("UITextSizeConstraint", { MaxTextSize = 32, MinTextSize = 14 }, txt)
		local fond = inst("Frame", { BackgroundColor3 = Color3.fromRGB(13, 10, 42), BorderSizePixel = 0, Size = UDim2.new(1, -150, 0, 10), Position = UDim2.fromOffset(16, 126) }, c)
		inst("UIStroke", { Color = CYAN, Thickness = 1, Transparency = 0.5, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, fond)
		local plein = inst("Frame", { BackgroundColor3 = C.cyan, BorderSizePixel = 0, Size = UDim2.fromScale(0, 1) }, fond)
		local prime = K.texte(c, { Text = "", TextSize = 24, TextColor3 = VERT, Size = UDim2.fromOffset(124, 26), Position = UDim2.new(1, -10, 0, 118),
			AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
		local statut = K.texte(c, { Text = "", TextSize = 22, TextColor3 = C.texte2, Size = UDim2.new(1, -30, 0, 48), Position = UDim2.fromOffset(16, 144),
			TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, TextScaled = true, LineHeight = 1.15 })
		inst("UITextSizeConstraint", { MaxTextSize = 22, MinTextSize = 12 }, statut)
		local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", ZIndex = 14 }, c)
		U.cartes[i] = { cadre = c, txt = txt, prime = prime, plein = plein, statut = statut, trait = trait, case = caseTrait, coche = coche, tete = tete }
		b.Activated:Connect(function()
			Sons.jouer("tap")
			local m = etat()
			if m.ok[i] then return end
			m.f = (m.f == i) and -1 or i -- toucher le défi suivi le lâche
			task.spawn(function() ctx.action("suivre", m.f) end)
			Missions.maj()
		end)
	end
	-- la RÉCOMPENSE, en bas à gauche
	local r = inst("Frame", { BackgroundColor3 = Color3.fromRGB(8, 22, 44), BackgroundTransparency = 0.08, BorderSizePixel = 0, Size = UDim2.new(1, -33 - 800, 0, 208),
		Position = UDim2.new(0, 33, 1, -26), AnchorPoint = Vector2.new(0, 1) }, g)
	inst("UISizeConstraint", { MaxSize = Vector2.new(765, 208), MinSize = Vector2.new(400, 208) }, r)
	inst("UIStroke", { Color = CYAN, Thickness = 2, Transparency = 0.45, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, r)
	K.icone(r, "etoile", 3, C.or_, UDim2.fromOffset(18, 14))
	K.texte(r, { Text = tr("RECOMPENSE", "REWARD"), TextSize = 28, TextColor3 = C.or_, Size = UDim2.fromOffset(300, 30), Position = UDim2.fromOffset(58, 14),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.recTitre = K.texte(r, { Text = "", TextSize = 28, TextColor3 = C.or_, Size = UDim2.fromOffset(140, 30), Position = UDim2.new(1, -18, 0, 14), AnchorPoint = Vector2.new(1, 0),
		TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
	U.recVue = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(176, 96), Position = UDim2.fromOffset(18, 52),
		Ambient = Color3.fromRGB(150, 150, 178), LightColor = Color3.fromRGB(255, 244, 230) }, r)
	U.recNom = K.texte(r, { Text = "", TextSize = 40, Size = UDim2.new(1, -224, 0, 42), Position = UDim2.fromOffset(206, 66), TextXAlignment = Enum.TextXAlignment.Left,
		TextWrapped = false, epais = 3 })
	U.recNomEchelle = inst("UIScale", {}, U.recNom)
	inst("Frame", { BackgroundColor3 = CYAN, BackgroundTransparency = 0.6, BorderSizePixel = 0, Size = UDim2.new(1, -36, 0, 2), Position = UDim2.fromOffset(18, 158) }, r)
	K.icone(r, "verrou", 2, C.terne, UDim2.fromOffset(18, 172))
	U.recSuite = K.texte(r, { Text = "", TextSize = 24, TextColor3 = C.texte2, Size = UDim2.new(1, -70, 0, 26), Position = UDim2.fromOffset(48, 168),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.recSuiteEchelle = inst("UIScale", {}, U.recSuite)
	-- HOME et le lingot JOUER, en bas à droite
	U.btHome = K.tuile(g, "HOME", C.lavande, UDim2.fromOffset(164, 122), UDim2.new(1, -20 - 563 - 12, 1, -32), Vector2.new(1, 1), 30, "maison", "v")
	U.btJouer = K.lingot(g, tr("JOUER", "PLAY"), UDim2.fromOffset(563, 122), UDim2.new(1, -20, 1, -32), Vector2.new(1, 1), 100)
	U.btHome.Activated:Connect(function() ctx.surHome() end)
	U.btJouer.Activated:Connect(function() ctx.surJouer() end)
	for _, d in g:GetDescendants() do
		if d:IsA("GuiObject") and d.ZIndex < 13 then d.ZIndex = 13 end
	end

	-- ── EN COURSE : la ligne du défi SUIVI (en bas à gauche) et la bannière « DEFI REUSSI » ──
	local hud = E.hud
	U.suivi = inst("Frame", { Name = "DefiSuivi", BackgroundTransparency = 1, Size = UDim2.fromOffset(640, 40), Position = UDim2.new(0, 26, 1, -24),
		AnchorPoint = Vector2.new(0, 1), Visible = false }, hud)
	U.suiviTxt = K.texte(U.suivi, { Text = "", TextSize = 20, TextColor3 = C.texte2, Size = UDim2.new(1, 0, 0, 22), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	local fs = inst("Frame", { BackgroundColor3 = C.piste, BorderSizePixel = 0, Size = UDim2.fromOffset(260, 6), Position = UDim2.fromOffset(0, 30) }, U.suivi)
	U.suiviPlein = inst("Frame", { BackgroundColor3 = C.cyan, BorderSizePixel = 0, Size = UDim2.fromScale(0, 1) }, fs)
	U.banniere = K.carbone(hud, UDim2.fromOffset(680, 104), UDim2.new(0.5, 60, 0, -120), VERT, Vector2.new(0.5, 0))
	K.icone(U.banniere, "coche", 3, VERT, UDim2.fromOffset(22, 12))
	K.texte(U.banniere, { Text = tr("DEFI REUSSI !", "CHALLENGE DONE!"), TextSize = 22, TextColor3 = VERT, Size = UDim2.new(1, -90, 0, 24), Position = UDim2.fromOffset(62, 14),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.banTxt = K.texte(U.banniere, { Text = "", TextSize = 28, TextColor3 = C.texte, Size = UDim2.new(1, -230, 0, 32), Position = UDim2.fromOffset(22, 54),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	U.banTxtEchelle = inst("UIScale", {}, U.banTxt)
	U.banPrime = K.texte(U.banniere, { Text = "", TextSize = 28, TextColor3 = VERT, Size = UDim2.fromOffset(190, 32), Position = UDim2.new(1, -18, 0, 54),
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
	Hud.tenir(U.titreEchelle, U.titre.Text, 26, 600)
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
			u.statut.TextColor3 = C.or_
		else
			u.statut.Text = tr("MEILLEUR ESSAI\n", "BEST RUN\n") .. Carnets.progres(d, m.best[i], FR, Hud.argent)
			u.statut.TextColor3 = C.texte2
		end
		-- la case se coche, le cadre prend la couleur de l'état (réussi vert · suivi or · à faire cyan)
		local ce = ok and VERT or ((m.f == i) and C.or_ or CYAN)
		u.trait.Color = ce
		u.trait.Transparency = (ok or m.f == i) and 0 or 0.45
		u.case.Color = ce
		u.coche.Visible = ok
		u.tete.TextColor3 = ce
	end
	local nom, couleur = Missions.recompense(c.rec)
	U.recTitre.Text = faits .. " / 3"
	U.recNom.Text = Hud.sansAccent(nom)
	U.recNom.TextColor3 = couleur
	local suite = Missions.recompense(Carnets.de(m.n + 1).rec)
	U.recSuite.Text = tr("ENSUITE · ", "NEXT · ") .. Hud.sansAccent(suite)
	local largeur = U.recNom.Parent.AbsoluteSize.X / math.max(0.01, Hud.racine:FindFirstChildOfClass("UIScale").Scale)
	Hud.tenir(U.recNomEchelle, U.recNom.Text, 40, math.max(160, largeur - 230))
	Hud.tenir(U.recSuiteEchelle, U.recSuite.Text, 24, math.max(200, largeur - 76))
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
	Hud.tenir(U.banTxtEchelle, U.banTxt.Text, 28, 440)
	U.banPrime.Text = "+" .. Hud.argent(d.p)
	U.banniere.Visible = true
	U.banniere.Position = UDim2.new(0.5, 60, 0, -120)
	TweenService:Create(U.banniere, K.LENTE, { Position = UDim2.new(0.5, 60, 0, 92) }):Play()
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
