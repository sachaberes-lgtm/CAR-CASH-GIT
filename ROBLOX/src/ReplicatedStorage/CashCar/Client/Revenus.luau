-- CASH CAR — LES REVENUS, côté joueur (voir ServerScriptService/Revenus) : ce qui fait revenir et ce qui se paie.
--   · le CADEAU DU JOUR : à l'accueil, une carte de sept jours qui montent — on prend celui d'aujourd'hui (la série casse si l'on
--     saute un jour) ;
--   · la PILE de l'accueil, en bas à gauche, sous le pouce : le CADEAU de temps de jeu (son compte à rebours, puis « CADEAU ! »),
--     le TOP 10, INVITER DES AMIS, la BOUTIQUE ROBUX (5/10 : un raccourci vers les offres) et selon le cas REJOINDRE LE GROUPE (une
--     fois, de l'argent) ou PREMIUM (+10 % sur tout l'argent) ;
--   · LE CŒUR À LA MORT (5/10, il remplace la « seconde chance ») : quand la caisse explose, une carte propose — avec des cœurs en
--     réserve — d'en UTILISER un (gratuit, un appui) ou de terminer ; sans cœur, d'en acheter un — acheté, il sert aussitôt : on
--     repart là où l'on a explosé, la partie continue (lot 2 : le cœur se CHOISIT, il ne part plus tout seul sur une partie de 25 s) ;
--   · l'interrupteur NITRO INFINIE des RÉGLAGES (colonne JEU, ligne posée par Hud) : branché ICI, montré à qui possède le passe ;
--   · l'écran de fin : la mention ×2 ARGENT / PREMIUM quand on y a droit, sinon l'offre « ×2 ARGENT » à la place du badge RECORD ;
--   · le TOP 10 MONDE (la tuile CLASSEMENT de la pile) : les meilleurs records de tous les serveurs, rafraîchis par le serveur ;
--   · LES PRIX en Robux, lus sur Roblox une fois par objet (Revenus.prix) — pour la carte du cœur et pour la BOUTIQUE.
-- Tout ce qui se paie se tait tant que son numéro est à 0 dans Config.REVENUS (rien ne se vend sans que Sacha l'ait créé).
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")

local CC = ReplicatedStorage:WaitForChild("CashCar")
local Config = require(CC:WaitForChild("Config"))
local Catalogue = require(CC:WaitForChild("Caisses"):WaitForChild("Catalogue")) -- (le nom d'une caisse légendaire achetée)
local Hud = require(script.Parent:WaitForChild("Hud"))
local Sons = require(script.Parent:WaitForChild("Sons"))
local R = Config.REVENUS
local K, C, FR = Hud.kit, Hud.C, Hud.FR
local inst, texte = K.inst, K.texte
local joueur = Players.LocalPlayer
local OR1 = Color3.fromRGB(255, 215, 94)
local T_OK = "OK"

local Revenus = {}
local ctx: any = nil
local U: any = {}
local function tr(fr: string, en: string): string return FR and fr or en end
local function attr(n: string): any return joueur:GetAttribute(n) end
local function idDe(t: any, nom: string): number
	local id = t[nom]
	return (type(id) == "number" and id > 0) and id or 0
end

-- ce que vaut 1 $ gagné en course (le MÊME calcul que le serveur : passe ×2, Premium +10 %) et sa mention
function Revenus.mult(): number
	return (attr("Argent2") and 2 or 1) * (attr("Premium") and (1 + R.premiumBonus) or 1)
end
function Revenus.mention(): string?
	local a, p = attr("Argent2"), attr("Premium")
	if a and p then return "x2 + PREMIUM" end
	if a then return tr("x2 ARGENT", "x2 CASH") end
	if p then return "PREMIUM +" .. math.floor(R.premiumBonus * 100 + 0.5) .. tr(" %", "%") end
	return nil
end

-- ── LES PRIX EN ROBUX (5/10) : c'est Sacha qui les fixe sur create.roblox.com — le jeu les LIT, une fois par objet, en tâche de fond.
-- Rend le prix s'il est connu, sinon nil (et la question part) : sans réponse de Roblox, on n'écrit pas de prix. Un échec se
-- redemande au bout de 30 s. `passe` : un passe de jeu (sinon un produit de développeur).
-- (5/10) GetProductInfoAsync (GetProductInfo est dépréciée) : lue ICI, chez le joueur, elle rend SON prix — le prix régional et la
-- remise des abonnés Roblox Plus (PriceInRobux = ce qu'il paiera vraiment). ──
local prixLu: { [string]: number } = {}
local prixDemande: { [string]: number } = {}
function Revenus.prix(id: number, passe: boolean): number?
	if type(id) ~= "number" or id <= 0 then return nil end
	local cle = (passe and "p" or "d") .. id
	if prixLu[cle] then return prixLu[cle] end
	if os.clock() - (prixDemande[cle] or -100) > 30 then
		prixDemande[cle] = os.clock()
		task.spawn(function()
			local ok, info = pcall(function()
				return (MarketplaceService :: any):GetProductInfoAsync(id, passe and Enum.InfoType.GamePass or Enum.InfoType.Product)
			end)
			if ok and type(info) == "table" and type(info.PriceInRobux) == "number" then prixLu[cle] = info.PriceInRobux end
		end)
	end
	return nil
end
-- un prix à l'écran : « R$ 500 » (la police pixel n'a pas l'icône Robux)
function Revenus.robux(n: number?): string
	return n and ("R$ " .. math.floor(n)) or ""
end
-- le stock de cœurs (attribut posé par le serveur)
function Revenus.coeurs(): number
	local n = attr("Coeurs")
	return (type(n) == "number" and n > 0) and math.floor(n) or 0
end

-- ── la FENÊTRE (la famille de la fenêtre d'achat de la boutique) : un voile qui bloque ce qu'il couvre, une carte violette à
-- filet d'or, la bande d'or en haut ──
local function fenetre(nom: string, W: number, H: number): (Frame, Frame)
	local v = inst("Frame", { Name = nom, BackgroundColor3 = Color3.fromRGB(6, 4, 16), BackgroundTransparency = 0.32, Size = UDim2.fromScale(1, 1),
		Visible = false, Active = true, ZIndex = 40 }, Hud.racine)
	inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, v) -- (le voile avale les clics)
	local c = inst("Frame", { Name = "Carte", BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.fromOffset(W, H),
		AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), Active = true }, v)
	K.degrade(c, Color3.fromRGB(58, 26, 92), Color3.fromRGB(20, 12, 42), 90)
	inst("UIStroke", { Color = OR1, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, c)
	inst("Frame", { BackgroundColor3 = OR1, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 6) }, c)
	return v, c
end

-- ════════ LE CADEAU DU JOUR ════════
local function creerJour()
	local v, c = fenetre("CadeauDuJour", 940, 500)
	texte(c, { Text = tr("CADEAU DU JOUR", "DAILY GIFT"), TextSize = 50, TextColor3 = OR1, italique = true, Size = UDim2.new(1, 0, 0, 56),
		Position = UDim2.fromOffset(0, 30), TextWrapped = false, epais = 4 })
	U.jSous = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 24, TextColor3 = C.texte2, Text = "",
		Size = UDim2.new(1, -40, 0, 28), Position = UDim2.fromOffset(20, 94) }, c)
	-- LES SEPT CASES v2 (5/10, Sacha : « travaille les graphismes… les cadeaux ») : elles étaient grises et toutes pareilles. Chacune a
	-- son FOND (nuit : à venir · vert : pris · or : AUJOURD'HUI, qui pulse), un gros cadeau, et le montant en grand ; la 7e, le
	-- trophée, est plus large — c'est le gros lot de la semaine.
	U.jCases = {}
	local W, G9 = 112, 10
	local x0 = (940 - (6 * W + 1.25 * W + 6 * G9)) / 2
	local xC = x0
	for i = 1, 7 do
		local Wi = (i == 7) and math.floor(W * 1.25) or W
		local f = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.fromOffset(Wi, 170), Position = UDim2.fromOffset(xC, 132) }, c)
		xC += Wi + G9
		local grad = inst("UIGradient", { Rotation = 90 }, f)
		local st = inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, f)
		local j = texte(f, { Text = tr("J", "D") .. i, TextSize = 20, TextColor3 = C.terne, Size = UDim2.new(1, 0, 0, 22), Position = UDim2.fromOffset(0, 10), TextWrapped = false })
		local ico = K.icone(f, (i == 7) and "trophee" or "cadeau", (i == 7) and 7 or 6, C.terne, UDim2.new(0.5, 0, 0, 38), Vector2.new(0.5, 0))
		local m = texte(f, { Text = "", TextSize = 22, TextColor3 = C.terne, Size = UDim2.new(1, -8, 0, 26), Position = UDim2.new(0, 4, 1, -38),
			TextWrapped = false, TextScaled = true, epais = 3 })
		inst("UITextSizeConstraint", { MaxTextSize = 22, MinTextSize = 10 }, m)
		local sc = inst("UIScale", {}, f)
		U.jCases[i] = { f = f, grad = grad, st = st, j = j, ico = ico, m = m, sc = sc }
	end
	-- (la case d'aujourd'hui respire)
	task.spawn(function()
		while v.Parent do
			if v.Visible and U.jIci then
				local k = U.jCases[U.jIci]
				if k then k.sc.Scale = 1.06 + 0.04 * math.sin(os.clock() * 5) end
			end
			task.wait()
		end
	end)
	U.jVip = texte(c, { Text = "", TextSize = 18, TextColor3 = OR1, Size = UDim2.new(1, 0, 0, 20), Position = UDim2.fromOffset(0, 306), TextWrapped = false })
	U.jPrendre = K.lingot(c, tr("PRENDRE", "CLAIM"), UDim2.fromOffset(520, 96), UDim2.new(0.5, 0, 1, -34), Vector2.new(0.5, 1), 36)
	U.jPrendre.Activated:Connect(function()
		if U.jOccupe then return end
		U.jOccupe = true
		local ok = ctx.action("cadeauJour")
		U.jOccupe = false
		v.Visible = false
		if not ok then Hud.toast(tr("CADEAU DEJA PRIS", "GIFT ALREADY CLAIMED"), nil, "croix") end
	end)
	U.jour = v
end
local function majJour()
	local serie = attr("Serie") or 1
	local auj = ((serie - 1) % 7) + 1
	local vip = attr("VIP") and 2 or 1
	U.jSous.Text = (serie > 1) and tr("Jour " .. serie .. " d'affilée — reviens demain : ça monte encore.",
		"Day " .. serie .. " in a row — come back tomorrow: it keeps growing.")
		or tr("Reviens chaque jour : le cadeau monte. Rate un jour, et ça repart du début.",
		"Come back every day: the gift grows. Miss a day and it starts over.")
	U.jIci = auj
	for i, k in U.jCases do
		local fait, ici = i < auj, i == auj
		local col = ici and Color3.fromRGB(60, 30, 4) or (fait and C.menthe or C.texte2)
		-- les fonds : or d'aujourd'hui, vert de ce qui est pris, nuit bleutée de ce qui vient (le trophée : violet royal)
		local haut, bas
		if ici then
			haut, bas = Color3.fromRGB(255, 236, 130), Color3.fromRGB(240, 160, 20)
		elseif fait then
			haut, bas = Color3.fromRGB(40, 110, 60), Color3.fromRGB(16, 52, 30)
		elseif i == 7 then
			haut, bas = Color3.fromRGB(96, 52, 150), Color3.fromRGB(40, 18, 70)
		else
			haut, bas = Color3.fromRGB(44, 40, 92), Color3.fromRGB(22, 18, 48)
		end
		k.grad.Color = ColorSequence.new(haut, bas)
		k.st.Color = ici and Color3.fromRGB(255, 250, 200) or (fait and C.vert or C.trait)
		k.st.Thickness = ici and 4 or 2
		k.sc.Scale = 1
		k.j.TextColor3 = col
		k.m.TextColor3 = ici and Color3.fromRGB(60, 30, 4) or col
		local trait9 = k.m:FindFirstChildOfClass("UIStroke")
		if trait9 then trait9.Enabled = not ici end
		k.m.Text = fait and tr("PRIS", "TAKEN") or Hud.argent(R.jour[i] * vip)
		K.teinter(k.ico, ici and { { 0.4, Color3.fromRGB(255, 255, 255) }, { 1, Color3.fromRGB(200, 60, 120) } }
			or (fait and C.menthe or ((i == 7) and OR1 or C.texte2)))
	end
	U.jVip.Text = (vip > 1) and tr("VIP : ×2", "VIP: ×2") or ""
	U.jPrendre.Text = tr("PRENDRE  ", "CLAIM  ") .. Hud.argent(R.jour[auj] * vip)
end

-- ════════ LA PILE DE L'ACCUEIL (en bas à gauche, sous le pouce — la charte) ════════
local function puce(y: number, ico: string, filet: Color3): TextButton
	local b = K.tuile(U.pile, " ", filet, UDim2.fromOffset(420, 64), UDim2.new(0, 0, 1, y), Vector2.new(0, 1), 23, ico, "g") -- (un libellé non vide : vide, la tuile centre son icône)
	b.TextScaled = false
	return b
end
local function creerPile()
	local p = inst("Frame", { Name = "PileAccueil", BackgroundTransparency = 1, Size = UDim2.fromOffset(440, 380), Position = UDim2.new(0, 34, 1, -30),
		AnchorPoint = Vector2.new(0, 1), Visible = false, ZIndex = 12 }, Hud.racine)
	U.pile = p
	-- le CADEAU de temps de jeu (en bas : c'est lui qui change, lui qu'on vient chercher)
	U.temps = puce(0, "cadeau", OR1)
	U.temps.Activated:Connect(function()
		if not U.tempsPret or U.tOccupe then return end
		U.tOccupe = true
		ctx.action("cadeauTemps")
		U.tOccupe = false
	end)
	-- INVITER DES AMIS (le lien d'invitation de Roblox ; un ami qui arrive par lui : de l'argent pour lui ET pour toi)
	-- le TOP 10 MONDE
	U.classe = puce(-76, "trophee", C.cyan)
	U.classe.Text = tr("TOP 10 MONDE", "WORLD TOP 10")
	U.classe.Activated:Connect(function() Revenus.classement() end)
	U.inviter = puce(-152, "coeur", C.magenta)
	U.inviter.Text = tr("INVITER  +", "INVITE  +") .. Hud.argent(R.invitation)
	U.inviter.Activated:Connect(function()
		local SS = game:GetService("SocialService")
		local ok, peut = pcall(function() return SS:CanSendGameInviteAsync(joueur) end)
		if ok and peut then
			pcall(function() SS:PromptGameInvite(joueur) end)
		else
			Hud.toast(tr("INVITATIONS INDISPONIBLES ICI", "INVITES NOT AVAILABLE HERE"), nil, "croix")
		end
	end)
	-- LA BOUTIQUE ROBUX (Sacha, 5/10 : « fais de ce jeu une usine à fric ») : un raccourci vers les offres en Robux, en tête de la
	-- boutique — ×2 ARGENT, NITRO INFINIE, LES CŒURS
	U.robux = puce(-228, "panier", OR1)
	U.robux.Text = tr("BOUTIQUE ROBUX", "ROBUX SHOP")
	U.robux.TextColor3 = OR1
	U.robux.Activated:Connect(function()
		if ctx and ctx.boutique then ctx.boutique() end
	end)
	-- REJOINDRE LE GROUPE (une fois) ou PREMIUM — tout en haut : quand elle n'a rien à offrir, elle disparaît sans laisser de trou
	U.bonus = puce(-304, "drapeau", C.vert)
	U.bonusBoite = U.bonus.Parent.Parent
	U.bonus.Activated:Connect(function()
		if U.bonusGenre == "groupe" then
			local ok = pcall(function() game:GetService("GroupService"):PromptJoinAsync(R.groupe) end)
			if ok then ctx.action("groupe") end
		elseif U.bonusGenre == "premium" then
			pcall(function() MarketplaceService:PromptPremiumPurchase(joueur) end)
		end
	end)
end
local function mmss(s: number): string
	s = math.max(0, math.ceil(s))
	return string.format("%d:%02d", s // 60, s % 60)
end
local function seuil(n: number): (number, number)
	local t = R.tempsJeu
	if n <= #t then return t[n][1], t[n][2] end
	return t[#t][1] + (n - #t) * 60, t[#t][2]
end
local function majPile()
	local debut, n = attr("CadeauDebut"), attr("CadeauN") or 0
	if type(debut) == "number" then
		local mn, g = seuil(n + 1)
		local reste = mn * 60 - (workspace:GetServerTimeNow() - debut)
		g *= attr("VIP") and 2 or 1
		U.tempsPret = reste <= 0
		local txt = U.tempsPret and (tr("CADEAU !  +", "GIFT!  +") .. Hud.argent(g)) or (tr("CADEAU DANS ", "GIFT IN ") .. mmss(reste))
		if U.temps.Text ~= txt then U.temps.Text = txt end
		U.temps.TextColor3 = U.tempsPret and OR1 or C.texte2
		-- (prêt : la tuile se dandine, pour qu'on vienne la chercher)
		U.temps.Parent.Parent.Rotation = U.tempsPret and math.sin(os.clock() * 7) * 1.6 or 0
	else
		U.temps.Text = tr("CADEAU", "GIFT")
	end
	-- la 3e tuile : le groupe (s'il existe et n'est pas encore pris), sinon Premium (pour qui ne l'a pas)
	local genre = nil
	if idDe(R, "groupe") > 0 and not attr("GroupeFait") then
		genre = "groupe"
	elseif not attr("Premium") and R.premiumBonus > 0 then
		genre = "premium"
	end
	if genre ~= U.bonusGenre then
		U.bonusGenre = genre
		U.bonusBoite.Visible = genre ~= nil
		if genre == "groupe" then
			U.bonus.Text = tr("GROUPE  +", "GROUP  +") .. Hud.argent(R.groupeBonus)
		elseif genre == "premium" then
			U.bonus.Text = "PREMIUM  +" .. math.floor(R.premiumBonus * 100 + 0.5) .. tr(" % D'ARGENT", "% CASH")
		end
	end
end

-- ════════ LE TOP 10 MONDE ════════
local function creerClassement()
	local v, c = fenetre("Classement", 760, 700)
	texte(c, { Text = tr("TOP 10 MONDE", "WORLD TOP 10"), TextSize = 46, TextColor3 = OR1, italique = true, Size = UDim2.new(1, 0, 0, 52),
		Position = UDim2.fromOffset(0, 26), TextWrapped = false, epais = 4 })
	U.cLignes = {}
	for i = 1, 10 do
		local y = 96 + (i - 1) * 46
		local f = inst("Frame", { BackgroundColor3 = (i % 2 == 1) and C.nuit or C.piste, BorderSizePixel = 0, Size = UDim2.new(1, -60, 0, 42),
			Position = UDim2.fromOffset(30, y) }, c)
		local col = (i == 1) and OR1 or (i <= 3 and C.texte or C.texte2)
		local r = texte(f, { Text = tostring(i), TextSize = 20, TextColor3 = col, Size = UDim2.new(0, 56, 1, 0), TextWrapped = false })
		local n = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 24, TextColor3 = col, Text = "",
			TextXAlignment = Enum.TextXAlignment.Left, TextTruncate = Enum.TextTruncate.AtEnd, Size = UDim2.new(1, -300, 1, 0), Position = UDim2.fromOffset(62, 0) }, f)
		local m = texte(f, { Text = "", TextSize = 20, TextColor3 = (i == 1) and OR1 or C.menthe, Size = UDim2.new(0, 220, 1, 0), Position = UDim2.new(1, -232, 0, 0),
			TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
		U.cLignes[i] = { f = f, r = r, n = n, m = m }
	end
	U.cVide = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 24, TextColor3 = C.terne, TextWrapped = true, Visible = false,
		Text = tr("Le classement arrive… Joue une partie : ton record y entre.", "The leaderboard is loading… Play a run: your record goes in."),
		Size = UDim2.new(1, -80, 0, 80), Position = UDim2.fromOffset(40, 200) }, c)
	local ok = K.tuile(c, T_OK, C.cyan, UDim2.fromOffset(260, 76), UDim2.new(0.5, 0, 1, -28), Vector2.new(0.5, 1), 24)
	ok.Activated:Connect(function() v.Visible = false end)
	U.classeV = v
end
function Revenus.classement()
	local liste = {}
	local brut = CC:GetAttribute("Classement")
	if type(brut) == "string" then
		local ok, l = pcall(function() return HttpService:JSONDecode(brut) end)
		if ok and type(l) == "table" then liste = l end
	end
	local moi = joueur.DisplayName
	for i, k in U.cLignes do
		local e = liste[i]
		k.f.Visible = e ~= nil
		if e then
			k.n.Text = tostring(e.n or "?")
			k.m.Text = Hud.argent(tonumber(e.v) or 0)
			k.f.BackgroundColor3 = (e.n == moi) and Color3.fromRGB(60, 44, 10) or ((i % 2 == 1) and C.nuit or C.piste) -- (ma ligne : en or)
		end
	end
	U.cVide.Visible = #liste == 0
	U.classeV.Visible = true
	Sons.vrai("uiModale", nil, nil, "tap", 1.1, 0.5)
end

-- ════════ LE CŒUR À LA MORT (Sacha, 5/10 : « un bouton pour avoir une vie en plus sous forme de cœur pour 50 Robux ») ════════
-- Il remplace la « seconde chance ». Quand la caisse explose, la carte propose :
--   · AVEC des cœurs en réserve (5/10, lot 2 : le cœur se CHOISIT) — UTILISER UN COEUR, gratuit, un appui ; ou TERMINER ;
--   · SANS cœur — d'en acheter un : Roblox l'accorde (ProcessReceipt : +1 au stock), le serveur répond « Revivre », la carte se ferme
--     sur un oui.
-- Dans les deux cas le pilote DÉPENSE alors un cœur (G.revivre) : on repart là où l'on a explosé. Un cœur acheté n'est jamais
-- perdu : si la carte s'est refermée entre-temps, il attend dans le stock la prochaine explosion.
local function creerSeconde()
	local v, c = fenetre("CoeurMort", 800, 420)
	texte(c, { Text = tr("UN COEUR = UNE VIE", "ONE HEART = ONE LIFE"), TextSize = 46, TextColor3 = OR1, italique = true, Size = UDim2.new(1, 0, 0, 56),
		Position = UDim2.fromOffset(0, 30), TextWrapped = false, epais = 4 })
	K.icone(c, "coeur", 7, C.rouge, UDim2.fromOffset(44, 104))
	-- la réserve, sous le cœur (la police du texte sait dessiner « ♥ », pas la police pixel)
	U.sStock = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 30, TextColor3 = C.rouge, Text = "",
		Size = UDim2.fromOffset(110, 30), Position = UDim2.fromOffset(20, 168) }, c)
	U.sTxt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 26, TextColor3 = C.texte2, TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Left, Text = "", Size = UDim2.new(1, -170, 0, 96), Position = UDim2.fromOffset(130, 96), TextScaled = true }, c)
	inst("UITextSizeConstraint", { MaxTextSize = 26, MinTextSize = 16 }, U.sTxt)
	local fond = inst("Frame", { BackgroundColor3 = C.nuit, BorderSizePixel = 0, Size = UDim2.new(1, -80, 0, 12), Position = UDim2.fromOffset(40, 208) }, c)
	U.sBarre = inst("Frame", { BackgroundColor3 = OR1, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1) }, fond)
	U.sOui = K.lingot(c, tr("CONTINUER", "CONTINUE"), UDim2.new(0.58, -40, 0, 92), UDim2.new(0, 40, 1, -40), Vector2.new(0, 1), 34)
	U.sNon = K.tuile(c, tr("NON MERCI", "NO THANKS"), C.cyan, UDim2.new(0.42, -40, 0, 76), UDim2.new(1, -40, 1, -46), Vector2.new(1, 1), 22)
	U.seconde = v
end
local evRevivre: RemoteEvent? = nil
-- la proposer ? Pas pendant la leçon. Avec des cœurs en réserve (`coeurs`, compté par le pilote) : TOUJOURS — c'est le joueur qui
-- décide s'il le dépense. Sans cœur : le produit CŒUR existe (ou le banc la simule : DbgSeconde), et c'est une vraie partie (au moins
-- 20 s de course : on ne vend rien à qui vient de rater le premier virage). Elle revient à CHAQUE mort (un cœur = une vie) : refusée,
-- la partie s'arrête de toute façon. (`dejaUsee` : gardé pour le pilote, qui ne le lève plus.)
function Revenus.secondeDispo(dejaUsee: boolean, duree: number, lecon: boolean, coeurs: number?): boolean
	if dejaUsee or lecon then return false end
	if (coeurs or 0) > 0 then return true end
	if (duree or 0) < 20 then return false end
	return idDe(R.produits, "coeur") > 0 or workspace:GetAttribute("DbgSeconde") ~= nil
end
-- la carte : 6 s pour choisir (le chrono s'arrête pendant que Roblox demande la confirmation) ; fin(true) = on repart.
-- `coeurs` > 0 : la carte propose d'en UTILISER un (rien à acheter) ; sinon d'en acheter un.
function Revenus.offrirSeconde(fin: (boolean) -> (), coeurs: number?)
	local v = U.seconde
	local stock = math.max(0, math.floor(coeurs or 0))
	local utiliser = stock > 0
	local id = idDe(R.produits, "coeur")
	local prix = (not utiliser) and Revenus.prix(id, false) or nil
	U.sStock.Text = utiliser and ("♥ " .. stock) or ""
	U.sTxt.Text = utiliser and tr("Un cœur de ta réserve, et tu repars là où tu as explosé : la partie continue, avec ton argent, ton moteur et ta zone.",
			"One heart from your stock, and you restart right where you blew up: the run goes on, with your cash, your engine and your zone.")
		or tr("Un cœur, et tu repars là où tu as explosé : la partie continue, avec ton argent, ton moteur et ta zone.",
			"One heart, and you restart right where you blew up: the run goes on, with your cash, your engine and your zone.")
	U.sOui.TextSize = utiliser and 28 or 34
	U.sOui.Text = utiliser and tr("UTILISER UN COEUR", "USE A HEART") or (tr("CONTINUER", "CONTINUE") .. (prix and ("  " .. Revenus.robux(prix)) or ""))
	U.sNon.Text = utiliser and tr("TERMINER", "END RUN") or tr("NON MERCI", "NO THANKS")
	v.Visible = true
	Sons.vrai("uiModale", nil, nil, "tap", 1.1, 0.5)
	local t, enAchat, fini, attente = 6, false, false, -1
	local cns: { RBXScriptConnection } = {}
	local function clore(ok: boolean)
		if fini then return end
		fini = true
		v.Visible = false
		for _, k in cns do k:Disconnect() end
		fin(ok)
	end
	U.sClore = clore -- (le banc répond sans souris)
	table.insert(cns, U.sNon.Activated:Connect(function() clore(false) end))
	table.insert(cns, U.sOui.Activated:Connect(function()
		if enAchat then return end
		if utiliser then clore(true) return end -- (un cœur de la réserve : rien à payer, le pilote le dépense)
		if workspace:GetAttribute("DbgSeconde") == "oui" then clore(true) return end -- (banc : l'achat simulé)
		if id <= 0 then clore(false) return end
		enAchat = true
		pcall(function() MarketplaceService:PromptProductPurchase(joueur, id) end)
	end))
	table.insert(cns, MarketplaceService.PromptProductPurchaseFinished:Connect(function(uid, pid, achete)
		if uid ~= joueur.UserId or pid ~= id then return end
		if not achete then
			enAchat = false
			clore(false)
			return
		end
		-- (acheté : on attend que le serveur l'accorde — le signal « Revivre » — 12 s au plus : passé ce délai la partie se termine,
		-- et le cœur, quand il arrivera, attendra dans le stock)
		attente = 12
	end))
	if evRevivre then table.insert(cns, evRevivre.OnClientEvent:Connect(function() clore(true) end)) end
	table.insert(cns, RunService.RenderStepped:Connect(function(dt: number)
		if not enAchat then t -= dt end
		if attente > 0 then
			attente -= dt
			if attente <= 0 then clore(false) end
		end
		-- (le prix arrive de Roblox pendant que la carte est ouverte : il s'écrit)
		if not prix and not utiliser then
			prix = Revenus.prix(id, false)
			if prix then U.sOui.Text = tr("CONTINUER", "CONTINUE") .. "  " .. Revenus.robux(prix) end
		end
		U.sBarre.Size = UDim2.fromScale(math.clamp(t / 6, 0, 1), 1)
		if t <= 0 then clore(false) end
	end))
end
function Revenus.secondeOuverte(): boolean return U.seconde ~= nil and U.seconde.Visible end

-- ════════ L'ÉCRAN DE FIN : la mention, ou l'offre ×2 ARGENT ════════
-- `badge` = le badge RECORD de l'écran de mort (Hud), `gains` = l'argent de la partie AVANT multiplication. Rend le multiplicateur.
function Revenus.finEcran(badge: TextLabel, rec: boolean, gains: number, lecon: boolean): number
	local m = lecon and 1 or Revenus.mult()
	local mention = (not lecon) and Revenus.mention() or nil
	if mention then
		badge.Text = rec and (tr("RECORD ! ", "RECORD! ") .. mention) or mention
		badge.Visible = true
	end
	-- (la police pixel est à chasse fixe : le cadre prend la largeur de son texte, 190 au moins)
	badge.Size = UDim2.fromOffset(math.max(190, math.floor(utf8.len(badge.Text) * badge.TextSize * Hud.CHASSE + 32)), badge.Size.Y.Offset)
	if not U.offre then
		local b = inst("TextButton", { Name = "OffreX2", BackgroundColor3 = Color3.fromRGB(40, 26, 8), BorderSizePixel = 0, AutoButtonColor = false,
			Size = UDim2.fromOffset(480, 42), Position = badge.Position, AnchorPoint = badge.AnchorPoint, FontFace = K.PIX, TextSize = 18,
			TextColor3 = OR1, Text = "", ZIndex = badge.ZIndex + 1, Visible = false }, badge.Parent)
		inst("UIStroke", { Color = OR1, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, b)
		-- (la cible tactile déborde du dessin : 44 px au moins, la charte)
		local z = inst("TextButton", { BackgroundTransparency = 1, Text = "", AutoButtonColor = false, Size = UDim2.new(1, 20, 1, 24),
			Position = UDim2.fromOffset(-10, -12), ZIndex = b.ZIndex + 1 }, b)
		z.Activated:Connect(function()
			Sons.jouer("tap")
			Hud.vibre(6)
			local id = idDe(R.passes, "argent2")
			if id > 0 then pcall(function() MarketplaceService:PromptGamePassPurchase(joueur, id) end) end
		end)
		U.offre = b
	end
	-- l'offre : le passe existe, on ne l'a pas, pas de record à montrer, une vraie partie qui a rapporté quelque chose
	local montre = (idDe(R.passes, "argent2") > 0 or workspace:GetAttribute("DbgSeconde") ~= nil)
		and not attr("Argent2") and not rec and not lecon and gains > 0
	U.offre.Visible = montre
	if montre then
		U.offre.Text = tr("x2 ARGENT : CA FAISAIT ", "x2 CASH: THAT WAS ") .. Hud.argent(gains * 2) .. "  >"
		badge.Visible = false
	end
	return m
end

-- ════════ les messages du serveur ════════
local function annonce(quoi: string, montant: number?, txt: string?)
	local a = montant and ("+" .. Hud.argent(montant)) or ""
	local libelles = {
		jour = tr("CADEAU DU JOUR  ", "DAILY GIFT  ") .. a,
		temps = tr("CADEAU  ", "GIFT  ") .. a,
		groupe = tr("BONUS DU GROUPE  ", "GROUP BONUS  ") .. a,
		invite = tr("INVITE PAR UN AMI  ", "INVITED BY A FRIEND  ") .. a,
		ami = Hud.sansAccent(string.upper(txt or "?")) .. tr(" EST VENU  ", " JOINED  ") .. a,
		tours = (txt == "1") and tr("+1 TOUR DE ROUE", "+1 WHEEL SPIN")
			or tr("+" .. (txt or "?") .. " TOURS DE ROUE", "+" .. (txt or "?") .. " WHEEL SPINS"),
		passe = (txt == "argent2") and tr("x2 ARGENT : TES PARTIES COMPTENT DOUBLE", "x2 CASH: YOUR RUNS COUNT DOUBLE")
			or (txt == "nitroInfini") and tr("NITRO INFINIE : LA JAUGE NE SE VIDE PLUS", "INFINITE NITRO: THE GAUGE NEVER EMPTIES")
			or tr("VIP : CADEAUX DOUBLES", "VIP: GIFTS DOUBLED"),
	}
	-- (5/10, lot 2) les CŒURS (montant = combien on en reçoit, txt = la réserve), l'ARGENT acheté, le KIT DU PILOTE (montant = ses $,
	-- txt = ses cœurs), une CAISSE LÉGENDAIRE (txt = son indice)
	if quoi == "coeur" then
		local n = math.floor(montant or 1)
		local mot = tr((n > 1) and " COEURS" or " COEUR", (n > 1) and " HEARTS" or " HEART")
		libelles.coeur = "+" .. n .. mot .. ((tonumber(txt) == n) and "" or tr("  (" .. (txt or "?") .. " EN RESERVE)", "  (" .. (txt or "?") .. " IN STOCK)"))
	elseif quoi == "argent" then
		libelles.argent = "+" .. Hud.compte(montant or 0) .. tr("  AU COMPTE", "  BANKED")
	elseif quoi == "kit" then
		libelles.kit = tr("KIT DU PILOTE : +", "DRIVER'S KIT: +") .. Hud.compte(montant or 0) .. tr(", +" .. (txt or "?") .. " COEURS, TRAINEE POUDRE D'OR AU GARAGE",
			", +" .. (txt or "?") .. " HEARTS, GOLD DUST TRAIL IN THE GARAGE")
	elseif quoi == "caisse" then
		local f = Catalogue[tonumber(txt) or -1]
		local nom = f and Hud.sansAccent(string.upper(FR and f.nom or (f.en or f.nom))) or "?"
		libelles.caisse = nom .. tr(" EST A TOI : ELLE T'ATTEND AU GARAGE", " IS YOURS: IT'S WAITING IN THE GARAGE")
	end
	-- (un cœur acheté sur la carte de la mort est dépensé aussitôt : le pilote le dit lui-même, pas de bandeau par-dessus)
	if quoi == "coeur" and Revenus.secondeOuverte() then return end
	local ico = (quoi == "passe" or quoi == "caisse") and "etoile" or ((quoi == "coeur") and "coeur" or ((quoi == "argent") and "piece" or "cadeau"))
	Hud.toast(libelles[quoi] or a, (quoi == "coeur") and C.rouge or ((quoi == "argent") and C.menthe or OR1), ico)
	Sons.jouer((quoi == "passe" or quoi == "coeur" or quoi == "caisse" or quoi == "kit") and "record" or "encaisse")
	Hud.vibre(30)
end

-- ════════ L'INTERRUPTEUR NITRO INFINIE (5/10 : « qui possède le passe peut l'éteindre / le rallumer ») ════════
-- Sa ligne vit dans la colonne JEU des RÉGLAGES (Hud) ; elle n'existe que pour qui possède le passe (attribut NitroPasse) : sinon
-- elle se REPLIE et les lignes du dessous remontent — pas de trou. ON / OFF = l'attribut NitroInfini (le passe ET l'interrupteur),
-- posé par le serveur ; le réglage « nitroInf » du profil le garde d'une session à l'autre. Allumé par défaut.
local function majNitroReglage()
	local o = Hud.E.rg and Hud.E.rg.nitroInf
	if not o or not o.ligne then return end
	local a = attr("NitroPasse") == true
	local l = o.ligne :: Frame
	if l.Visible ~= a then
		local p = l.Parent :: Frame
		local h = l.Size.Y.Offset
		local y = l.Position.Y.Offset
		for _, x in p:GetChildren() do
			-- (« >= » : repliée, la ligne du dessous est remontée EXACTEMENT à sa place — avec « > » elle n'en redescendait pas, et les deux
			-- lignes se superposaient, mesuré au banc le 5/10)
			if x ~= l and x:IsA("Frame") and x.Position.Y.Offset >= y + (a and 0 or 1) then x.Position += UDim2.fromOffset(0, a and h or -h) end
		end
		p.Size += UDim2.fromOffset(0, a and h or -h)
		l.Visible = a
	end
	Hud.reglage("nitroInf", attr("NitroInfini") == true)
end
local function brancherNitroReglage()
	local o = Hud.E.rg and Hud.E.rg.nitroInf
	if not o or not o.b then return end
	o.b.Activated:Connect(function()
		if U.nOccupe or attr("NitroPasse") ~= true then return end
		U.nOccupe = true
		local on = not (attr("NitroInfini") == true)
		Hud.reglage("nitroInf", on) -- (tout de suite à l'écran ; le serveur confirme par l'attribut)
		Hud.vibre(6)
		ctx.action("reglage", "nitroInf", on)
		U.nOccupe = false
		task.delay(0.4, majNitroReglage)
	end)
	joueur:GetAttributeChangedSignal("NitroPasse"):Connect(majNitroReglage)
	joueur:GetAttributeChangedSignal("NitroInfini"):Connect(majNitroReglage)
	majNitroReglage()
end

-- ════════ le branchement ════════
-- c = { action = function(nom, ...) → ok, msg ; occupe = function() → vrai si l'accueil n'est pas vraiment là (intro, garage…) ;
--       boutique = function() → ouvre la BOUTIQUE sur ses offres en Robux (la tuile BOUTIQUE ROBUX de la pile) }
function Revenus.init(c: any)
	ctx = c
	creerJour()
	creerPile()
	creerSeconde()
	creerClassement()
	brancherNitroReglage()
	task.spawn(function()
		local ev = CC:WaitForChild("Revenu", 30)
		if ev then (ev :: RemoteEvent).OnClientEvent:Connect(annonce) end
		evRevivre = CC:WaitForChild("Revivre", 30) :: RemoteEvent?
	end)
	-- (banc) workspace:SetAttribute("DbgRevenu", "prendre…" | "temps…" | "classement…" | "fermer…") : les boutons sans la souris
	workspace:GetAttributeChangedSignal("DbgRevenu"):Connect(function()
		local q = tostring(workspace:GetAttribute("DbgRevenu") or "")
		if string.find(q, "^prendre") then
			task.spawn(function()
				print("[revenus] cadeauJour", ctx.action("cadeauJour"))
				U.jour.Visible = false
			end)
		elseif string.find(q, "^temps") then
			task.spawn(function() print("[revenus] cadeauTemps", ctx.action("cadeauTemps")) end)
		elseif string.find(q, "^classement") then
			Revenus.classement()
		elseif string.find(q, "^continuer") and U.sClore then
			U.sClore(true)
		elseif string.find(q, "^refuser") and U.sClore then
			U.sClore(false)
		elseif string.find(q, "^fermer") then
			U.jour.Visible, U.classeV.Visible = false, false
		end
	end)
	local vuJour = false
	RunService.RenderStepped:Connect(function()
		local menu = Hud.ecranCourant() == "menu" and not (ctx.occupe and ctx.occupe())
		if U.pile.Visible ~= menu then U.pile.Visible = menu end
		if menu then
			majPile()
			-- le cadeau du jour s'ouvre de lui-même à l'accueil, tant qu'il n'est pas pris
			if not vuJour and attr("JourDispo") then
				vuJour = true
				majJour()
				U.jour.Visible = true
				Sons.vrai("uiModale", nil, nil, "tap", 1.1, 0.5)
			end
		else
			U.classeV.Visible = false
		end
		if not menu and U.jour.Visible then
			U.jour.Visible = false
			vuJour = false -- (quitté sans le prendre : il reviendra au prochain passage à l'accueil)
		end
	end)
end

return Revenus
