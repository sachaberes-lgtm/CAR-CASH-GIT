-- CASH CAR — LES REVENUS, côté joueur (voir ServerScriptService/Revenus) : ce qui fait revenir et ce qui se paie.
--   · le CADEAU DU JOUR : à l'accueil, une carte de sept jours qui montent — on prend celui d'aujourd'hui (la série casse si l'on
--     saute un jour) ;
--   · le DOCK de l'accueil, en bas à gauche, sous le pouce : le CADEAU de temps de jeu (son compte à rebours, puis son montant), la
--     BOUTIQUE ROBUX (5/10 : un raccourci vers les offres), le TOP 10, INVITER DES AMIS et selon le cas REJOINDRE LE GROUPE (une
--     fois, de l'argent) ou PREMIUM (+10 % sur tout l'argent) ;
--   · LE CŒUR À LA MORT (5/10, il remplace la « seconde chance ») : quand la caisse explose, une carte propose — avec des cœurs en
--     réserve — d'en UTILISER un (gratuit, un appui) ou de terminer ; sans cœur, d'en acheter un — acheté, il sert aussitôt : on
--     repart là où l'on a explosé, la partie continue (lot 2 : le cœur se CHOISIT, il ne part plus tout seul sur une partie de 25 s) ;
--   · l'interrupteur NITRO INFINIE des RÉGLAGES (colonne JEU, ligne posée par Hud) : branché ICI, montré à qui possède le passe ;
--   · l'écran de fin : la mention ×2 ARGENT / PREMIUM quand on y a droit, sinon l'offre « ×2 ARGENT » à la place du badge RECORD ;
--   · le TOP 10 MONDE « SANS AIDE » (la tuile TOP 10 du dock) : les meilleurs records de tous les serveurs faits sans cœur, sans
--     nitro infinie et sans mode facile — le serveur trie, ce fichier le DIT ;
--   · LES PRIX en Robux, lus sur Roblox une fois par objet (Revenus.prix) — pour la carte du cœur et pour la BOUTIQUE.
-- Tout ce qui se paie se tait tant que son numéro est à 0 dans Config.REVENUS (rien ne se vend sans que Sacha l'ait créé).
--
-- LE DESSIN v3 (5/10, Sacha : « le design n'est pas au niveau ») — laque sombre · or · néon, la charte du kit de Hud :
--   · une FENÊTRE est une plaque de LAQUE : épaisseur sous la carte, double filet (le trait d'accent, un filet fin en retrait), un
--     reflet clair sur le haut, le titre d'or avec son ombre portée et la barre des trois néons du logo dessous ; elle S'OUVRE (le voile
--     se pose, la carte grandit de 0,9 à 1 en 0,3 s) et se referme en un appui (0,1 s) ;
--   · le DOCK : la pile de cinq longues plaques qui mangeait la caisse est devenue une rangée de tuiles carrées sous la caisse — une
--     grosse icône, un mot, les primes sur des pastilles — qui grandit sur les écrans larges et se range en colonne sur les étroits ;
--   · l'or = UN lingot : PRENDRE, CONTINUER / UTILISER UN COEUR ; le reste en tuiles de couleur.
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")
local TweenService = game:GetService("TweenService")

local CC = ReplicatedStorage:WaitForChild("CashCar")
local Config = require(CC:WaitForChild("Config"))
local Catalogue = require(CC:WaitForChild("Caisses"):WaitForChild("Catalogue")) -- (le nom d'une caisse légendaire achetée)
local Hud = require(script.Parent:WaitForChild("Hud"))
local Sons = require(script.Parent:WaitForChild("Sons"))
local R = Config.REVENUS
local K, C, FR = Hud.kit, Hud.C, Hud.FR
local inst, texte = K.inst, K.texte
local CH = Hud.CHASSE -- (un caractère pixel fait 5/9 de son corps : les largeurs se calculent)
local joueur = Players.LocalPlayer
local OR1 = Color3.fromRGB(255, 215, 94)
local ENCRE = C.encre
local BLANC = Color3.new(1, 1, 1)
local T_OK = "OK"

-- les DEUX durées de la charte (l'appui, la transition d'écran), et le SEUL rebond permis : la fête du cadeau pris
local TI_APPUI = K.RAPIDE
local TI_ECRAN = TweenInfo.new(0.3, Enum.EasingStyle.Quint, Enum.EasingDirection.Out)
local TI_FETE = TweenInfo.new(0.45, Enum.EasingStyle.Back, Enum.EasingDirection.Out)

local Revenus = {}
local ctx: any = nil
local U: any = {}
-- ── LE NOUVEAU JOUEUR D'ABORD SUR LA ROUTE (6/10 — l'algorithme de Roblox juge un jeu sur les nouveaux venus qui partent avant
-- 60 s) : tant qu'il n'a fini AUCUNE partie, aucune fenêtre ne s'ouvre d'elle-même à l'accueil — JOUER est libre tout de suite. Le
-- cadeau du jour l'attend : il s'ouvre au retour à l'accueil après sa première partie. Le signal : les parties de son PROFIL
-- (`stats.parties`, lu au serveur une fois, puis suivi par ProfilMaj), et les parties finies dans cette session (finEcran).
-- Inconnu (le profil n'est pas encore arrivé) = nouveau : la fenêtre attend le profil plutôt que de barrer la route. (banc)
-- workspace « DbgNeuf » = true (nouveau) / false (ancien) force la réponse. ──
U.partiesProfil = nil :: number?
U.finies = 0
local function nouveau(): boolean
	local f = workspace:GetAttribute("DbgNeuf")
	if f == true then return U.finies == 0 end
	if f == false then return false end
	if U.finies > 0 then return false end
	return (U.partiesProfil or 0) <= 0
end
local function lireParties(p: any)
	if type(p) == "table" and type(p.stats) == "table" and type(p.stats.parties) == "number" then U.partiesProfil = p.stats.parties end
end
local function tr(fr: string, en: string): string return FR and fr or en end
local function attr(n: string): any return joueur:GetAttribute(n) end
local function idDe(t: any, nom: string): number
	local id = t[nom]
	return (type(id) == "number" and id > 0) and id or 0
end
local function tw(o: Instance, ti: TweenInfo, p: { [string]: any }): Tween
	local t = TweenService:Create(o, ti, p)
	t:Play()
	return t
end
local function sombre(c: Color3, k: number): Color3 return Color3.new(c.R * k, c.G * k, c.B * k) end
local function clair(c: Color3, k: number): Color3 return c:Lerp(BLANC, k) end
-- une icône pixel en TROIS bandes (lèvre claire, plein, ombre) — le relief des icônes du HUD, pas un aplat
local function bandes(c: Color3): any return { { 0.25, clair(c, 0.55) }, { 0.7, c }, { 1, sombre(c, 0.66) } } end
-- REPEINDRE une tuile du kit dans un autre filet (la recette de Hud, teintesTuile : la face = le filet à moitié dans la nuit, le
-- liseré du haut = le filet presque plein) — le cadeau prêt passe de l'ambre à l'or
local function repeindreTuile(b: TextButton, f: Color3)
	local plaque = b.Parent :: Instance
	K.repeindre(plaque, sombre(f, 0.5):Lerp(C.carbone, 0.3), f)
	local l = plaque:FindFirstChild("l", true)
	if l then (l :: Frame).BackgroundColor3 = sombre(f, 0.95) end
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

-- ════════ LA FENÊTRE v3 : une plaque de LAQUE ════════
-- Le voile (il avale les clics), et la carte : son ÉPAISSEUR dessous (la plaque a un chant, comme les tuiles du kit), le dégradé de
-- laque violette, le trait d'ACCENT tout autour et un filet fin en retrait (le double cadre des vitrines), un REFLET clair sur la
-- moitié haute, la bande d'accent en haut. `accent` : l'or par défaut, le rouge pour le cœur.
local gen: { [Instance]: number } = {}
local function fenetre(nom: string, W: number, H: number, accent: Color3?): (Frame, Frame, UIScale, TextButton)
	local acc = accent or OR1
	local v = inst("Frame", { Name = nom, BackgroundColor3 = Color3.fromRGB(6, 4, 16), BackgroundTransparency = 0.32, Size = UDim2.fromScale(1, 1),
		Visible = false, Active = true, ZIndex = 40 }, Hud.racine)
	local fond = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, v)
	local boite = inst("Frame", { Name = "Boite", BackgroundTransparency = 1, Size = UDim2.fromOffset(W, H), AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.new(0.5, 0, 0.5, -4) }, v)
	local sc = inst("UIScale", {}, boite)
	local ep = inst("Frame", { Name = "Chant", BackgroundColor3 = sombre(acc, 0.3), BorderSizePixel = 0, Size = UDim2.fromScale(1, 1), Position = UDim2.fromOffset(0, 9) }, boite)
	inst("UIStroke", { Color = ENCRE, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, ep)
	local c = inst("Frame", { Name = "Carte", BackgroundColor3 = BLANC, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1), Active = true }, boite)
	K.degrade(c, Color3.fromRGB(66, 26, 104), Color3.fromRGB(13, 8, 30), 90)
	inst("UIStroke", { Color = acc, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, c)
	if K.lisere then K.lisere(c, clair(acc, 0.35), sombre(acc, 0.35)) end -- (le biseau des plaques de laque du kit : clair en haut, sombre en bas)
	local lq = inst("Frame", { Name = "Laque", BackgroundColor3 = BLANC, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0.46, 0) }, c)
	inst("UIGradient", { Rotation = 90, Transparency = NumberSequence.new(0.87, 1) }, lq)
	local fi = inst("Frame", { Name = "Filet", BackgroundTransparency = 1, Size = UDim2.new(1, -18, 1, -18), Position = UDim2.fromOffset(9, 9) }, c)
	inst("UIStroke", { Color = acc, Thickness = 1, Transparency = 0.45, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, fi)
	inst("Frame", { BackgroundColor3 = acc, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 6) }, c)
	return v, c, sc, fond
end
-- elle s'OUVRE (le voile se pose, la carte grandit — Quint, 0,3 s) et se REFERME en un appui (0,1 s)
local function ouvrir(v: Frame, sc: UIScale)
	gen[v] = (gen[v] or 0) + 1
	v.Visible = true
	v.BackgroundTransparency = 1
	sc.Scale = 0.9
	tw(v, TI_ECRAN, { BackgroundTransparency = 0.32 })
	tw(sc, TI_ECRAN, { Scale = 1 })
	Sons.vrai("uiModale", nil, nil, "tap", 1.1, 0.5)
end
local function fermer(v: Frame, sc: UIScale)
	if not v.Visible then return end
	gen[v] = (gen[v] or 0) + 1
	local g = gen[v]
	tw(v, TI_APPUI, { BackgroundTransparency = 1 })
	tw(sc, TI_APPUI, { Scale = 0.94 })
	task.delay(0.1, function() if gen[v] == g then v.Visible = false end end)
end
-- le TITRE d'une fenêtre : l'or penché, son OMBRE portée (le logo fait pareil), et la barre des trois néons dessous
local function titre(c: Instance, txt: string, y: number, taille: number)
	local o = texte(c, { Text = txt, TextSize = taille, TextColor3 = Color3.fromRGB(96, 40, 8), italique = true, Size = UDim2.new(1, 0, 0, taille + 8),
		Position = UDim2.fromOffset(5, y + 5), TextWrapped = false, contour = false })
	o.TextTransparency = 0.1
	texte(c, { Text = txt, TextSize = taille, TextColor3 = OR1, italique = true, Size = UDim2.new(1, 0, 0, taille + 8), Position = UDim2.fromOffset(0, y),
		TextWrapped = false, epais = 4, contourCouleur = Color3.fromRGB(44, 16, 4) })
	local larg = math.min(440, math.floor(utf8.len(txt) * taille * CH * 0.8))
	local b = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(larg, 6), Position = UDim2.new(0.5, 8, 0, y + taille + 14),
		AnchorPoint = Vector2.new(0.5, 0) }, c)
	for i, col in { C.magenta, C.cyan, OR1 } do
		inst("Frame", { BackgroundColor3 = col, BorderSizePixel = 0, Size = UDim2.new(i == 1 and 0.44 or 0.28, -8, 1, 0),
			Position = UDim2.fromScale(i == 1 and 0 or (i == 2 and 0.44 or 0.72), 0) }, b)
	end
end
-- une PASTILLE (le badge des tuiles du menu : NEW, le nombre de tours) — ici la prime, en vert billet
local function pastille(parent: Instance, fond: Color3, corps: number): TextLabel
	local f = inst("Frame", { Name = "Pastille", BackgroundColor3 = fond, BorderSizePixel = 0, Size = UDim2.fromOffset(60, corps + 12),
		Position = UDim2.new(1, 2, 0, -20), AnchorPoint = Vector2.new(1, 0), ZIndex = 8 }, parent)
	inst("UICorner", { CornerRadius = UDim.new(0, 6) }, f)
	inst("UIStroke", { Color = ENCRE, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, f)
	return texte(f, { Text = "", TextSize = corps, TextColor3 = BLANC, Size = UDim2.fromScale(1, 1), TextWrapped = false, ZIndex = 8 })
end
local function ecrirePastille(t: TextLabel, txt: string)
	if t.Text == txt then return end
	t.Text = txt
	local f = t.Parent :: Frame
	f.Size = UDim2.fromOffset(math.floor(utf8.len(txt) * t.TextSize * CH + 16), f.Size.Y.Offset)
end

-- ════════ LE CADEAU DU JOUR v3 ════════
-- Sept CASES sur une rangée, chacune une petite plaque (épaisseur dessous, biseau clair dessus), le montant sur un BANDEAU d'encre
-- en pied — on lit la semaine d'un regard : ce qui est PRIS (vert, la coche), AUJOURD'HUI (l'or, qui respire dans son halo), ce
-- qui VIENT (la nuit, le cadeau qui GROSSIT de jour en jour) et le TROPHÉE du 7e jour (violet royal, plus large, cerclé d'or).
-- PRENDRE : la case d'aujourd'hui passe au vert dans un rebond (la seule célébration de l'écran), puis la fenêtre se referme.
local JW, JH = 960, 520
local CASE_W, CASE_W7, CASE_H, CASE_G = 112, 140, 178, 12
local function peindre(k: any, i: number, etat: string, vip: number)
	local roi = i == 7
	local ici, fait = etat == "ici", etat == "fait"
	local haut, bas, trait, chant
	if ici then
		haut, bas, trait, chant = Color3.fromRGB(255, 238, 140), Color3.fromRGB(242, 156, 16), Color3.fromRGB(255, 250, 206), C.orSh
	elseif fait then
		haut, bas, trait, chant = Color3.fromRGB(36, 104, 58), Color3.fromRGB(12, 44, 26), C.vert, Color3.fromRGB(4, 22, 12)
	elseif roi then
		haut, bas, trait, chant = Color3.fromRGB(110, 56, 170), Color3.fromRGB(42, 18, 76), OR1, Color3.fromRGB(22, 8, 40)
	else
		haut, bas, trait, chant = Color3.fromRGB(48, 42, 100), Color3.fromRGB(20, 16, 46), C.trait, Color3.fromRGB(8, 6, 22)
	end
	k.grad.Color = ColorSequence.new(haut, bas)
	k.st.Color = trait
	k.st.Thickness = ici and 3 or 2
	k.st.Transparency = fait and 0.35 or 0
	k.ep.BackgroundColor3 = chant
	k.bis.BackgroundTransparency = ici and 0.35 or 0.78
	-- le numéro du jour : brun sur l'or (sans contour), menthe sur ce qui est pris, lavande éteinte sur ce qui vient
	k.j.TextColor3 = ici and Color3.fromRGB(96, 44, 4) or (fait and C.menthe or (roi and OR1 or C.terne))
	local sj = k.j:FindFirstChildOfClass("UIStroke")
	if sj then sj.Enabled = not ici end
	-- l'icône : la coche quand c'est pris, sinon le cadeau (ou le trophée) dans la couleur de son état
	k.cad.Visible = not fait
	k.coche.Visible = fait
	if ici then
		K.teinter(k.cad, roi and { { 0.3, BLANC }, { 0.7, Color3.fromRGB(176, 70, 220) }, { 1, Color3.fromRGB(96, 22, 140) } }
			or { { 0.24, BLANC }, { 0.5, Color3.fromRGB(255, 118, 190) }, { 1, Color3.fromRGB(206, 30, 104) } })
	elseif not fait then
		K.teinter(k.cad, roi and { { 0.3, Color3.fromRGB(255, 246, 180) }, { 0.7, Color3.fromRGB(255, 200, 40) }, { 1, Color3.fromRGB(214, 128, 0) } }
			or bandes(Color3.fromRGB(176, 168, 248)))
	end
	-- le montant, sur son bandeau
	k.bande.BackgroundColor3 = ici and Color3.fromRGB(120, 58, 0) or (fait and Color3.fromRGB(4, 30, 14) or ENCRE)
	k.bande.BackgroundTransparency = ici and 0.1 or 0.35
	k.m.Text = fait and tr("PRIS", "TAKEN") or Hud.argent(R.jour[i] * vip)
	k.m.TextSize = math.min(roi and 24 or 22, math.floor((k.w - 14) / math.max(1, utf8.len(k.m.Text) * CH)))
	k.m.TextColor3 = ici and Color3.fromRGB(255, 246, 206) or (fait and C.menthe or (roi and OR1 or C.texte))
	-- le halo d'or : aujourd'hui seulement (la boucle le fait respirer)
	for _, h in k.halo do h.Transparency = 1 end
	k.sc.Scale = 1
end
local function creerJour()
	local v, c, sc = fenetre("CadeauDuJour", JW, JH, OR1)
	U.jSc = sc
	titre(c, tr("CADEAU DU JOUR", "DAILY GIFT"), 26, 48)
	U.jSous = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 24, TextColor3 = C.texte2, Text = "", RichText = true,
		Size = UDim2.new(1, -60, 0, 28), Position = UDim2.fromOffset(30, 104) }, c)
	-- (VIP : les cadeaux doublés — une étiquette d'or dans le coin, plus une ligne perdue sous les cases)
	U.jVip = inst("Frame", { BackgroundColor3 = Color3.fromRGB(60, 34, 4), BorderSizePixel = 0, Size = UDim2.fromOffset(122, 34),
		Position = UDim2.new(1, -30, 0, 30), AnchorPoint = Vector2.new(1, 0), Visible = false }, c)
	inst("UIStroke", { Color = OR1, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, U.jVip)
	texte(U.jVip, { Text = "VIP x2", TextSize = 18, TextColor3 = OR1, Size = UDim2.fromScale(1, 1), TextWrapped = false })
	U.jCases = {}
	local x0 = (JW - (6 * CASE_W + CASE_W7 + 6 * CASE_G)) / 2
	local yC = 152
	local xC = x0
	for i = 1, 7 do
		local Wi = (i == 7) and CASE_W7 or CASE_W
		local base = UDim2.fromOffset(xC + Wi / 2, yC + CASE_H / 2)
		xC += Wi + CASE_G
		-- (le support, ancré en son MILIEU : la case respire et rebondit sur place)
		local h = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(Wi, CASE_H), Position = base, AnchorPoint = Vector2.new(0.5, 0.5) }, c)
		local sc9 = inst("UIScale", {}, h)
		local halo = {}
		-- (le halo : deux cadres d'or emboîtés autour de la case du jour — du pixel qui rayonne, pas un aplat qui salit le fond)
		for q = 1, 2 do
			local e = q * 7
			local r9 = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, e * 2, 1, e * 2 + 7), Position = UDim2.fromOffset(-e, -e), ZIndex = 1 }, h)
			halo[q] = inst("UIStroke", { Color = OR1, Thickness = 3, Transparency = 1, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, r9)
		end
		local ep = inst("Frame", { BackgroundColor3 = ENCRE, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1), Position = UDim2.fromOffset(0, 7), ZIndex = 2 }, h)
		inst("UIStroke", { Color = ENCRE, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, ep)
		local f = inst("Frame", { BackgroundColor3 = BLANC, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1), ZIndex = 3 }, h)
		local grad = inst("UIGradient", { Rotation = 90 }, f)
		local st = inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, f)
		local bis = inst("Frame", { BackgroundColor3 = BLANC, BackgroundTransparency = 0.7, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3) }, f)
		local j = texte(f, { Text = tr("J", "D") .. i, TextSize = 18, TextColor3 = C.terne, Size = UDim2.new(1, 0, 0, 20), Position = UDim2.fromOffset(0, 13), TextWrapped = false })
		-- (le cadeau GROSSIT avec la semaine : 45 px les trois premiers jours, 54 ensuite, 63 pour le trophée)
		local px = (i == 7) and 7 or ((i >= 4) and 6 or 5)
		local cad = K.icone(f, (i == 7) and "trophee" or "cadeau", px, C.texte2, UDim2.new(0.5, 0, 0, 84), Vector2.new(0.5, 0.5))
		local coche = K.icone(f, "coche", 6, bandes(C.menthe), UDim2.new(0.5, 0, 0, 84), Vector2.new(0.5, 0.5))
		coche.Visible = false
		local bande = inst("Frame", { BackgroundColor3 = ENCRE, BackgroundTransparency = 0.35, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 42),
			Position = UDim2.new(0, 0, 1, -42) }, f)
		local m = texte(bande, { Text = "", TextSize = 22, Size = UDim2.new(1, -10, 1, 0), Position = UDim2.fromOffset(5, 0), TextWrapped = false,
			epais = 3 })
		U.jCases[i] = { h = h, base = base, sc = sc9, halo = halo, ep = ep, f = f, grad = grad, st = st, bis = bis, j = j, cad = cad, coche = coche,
			bande = bande, m = m, w = Wi }
	end
	-- (la case d'aujourd'hui respire, son halo bat avec elle — rien ne tourne quand la fenêtre est fermée)
	RunService.RenderStepped:Connect(function()
		if not v.Visible or not U.jIci then return end
		local k = U.jCases[U.jIci]
		if not k then return end
		local s = math.sin(os.clock() * 4)
		k.sc.Scale = 1.08 + 0.025 * s
		k.halo[1].Transparency = 0.3 - 0.22 * s
		k.halo[2].Transparency = 0.7 - 0.18 * s
	end)
	U.jPrendre = K.lingot(c, tr("PRENDRE", "CLAIM"), UDim2.fromOffset(540, 92), UDim2.new(0.5, 0, 1, -30), Vector2.new(0.5, 1), 36)
	U.jour = v
end
local function majJour()
	local serie = attr("Serie") or 1
	local auj = ((serie - 1) % 7) + 1
	local vip = attr("VIP") and 2 or 1
	local nb = '<font color="#ffd75e">' .. serie .. "</font>"
	U.jSous.Text = (serie > 1) and tr("Jour " .. nb .. " d'affilée — reviens demain : ça monte encore.",
		"Day " .. nb .. " in a row — come back tomorrow: it keeps growing.")
		or tr("Reviens chaque jour : le cadeau monte. Rate un jour, et ça repart du début.",
		"Come back every day: the gift grows. Miss a day and it starts over.")
	U.jIci = auj
	U.jVipK = vip
	for i, k in U.jCases do
		peindre(k, i, (i < auj) and "fait" or ((i == auj) and "ici" or "avenir"), vip)
	end
	U.jVip.Visible = vip > 1
	U.jPrendre.Text = tr("PRENDRE  ", "CLAIM  ") .. Hud.argent(R.jour[auj] * vip)
end
local function ouvrirJour()
	majJour()
	ouvrir(U.jour, U.jSc)
	-- (les cases montent à leur place l'une après l'autre : la semaine se déroule)
	for i, k in U.jCases do
		k.h.Position = k.base + UDim2.fromOffset(0, 28)
		task.delay(0.04 + i * 0.035, function() tw(k.h, TI_ECRAN, { Position = k.base }) end)
	end
end
-- PRENDRE (le bouton, ou le banc) : rend ce que le serveur a répondu
local function prendreJour(): boolean
	if U.jOccupe then return false end
	U.jOccupe = true
	local ok = ctx.action("cadeauJour")
	local i = U.jIci
	if ok and U.jour.Visible and i and U.jCases[i] then
		-- LA FÊTE : la case passe au vert d'un rebond, le lingot dit ENCAISSE, puis la fenêtre se referme
		local k = U.jCases[i]
		U.jIci = nil
		peindre(k, i, "fait", U.jVipK or 1)
		k.sc.Scale = 1.34
		tw(k.sc, TI_FETE, { Scale = 1 })
		U.jPrendre.Text = tr("ENCAISSE !", "CLAIMED!")
		task.wait(U.jFeteT or 0.85)
		fermer(U.jour, U.jSc)
	else
		fermer(U.jour, U.jSc)
		if not ok then Hud.toast(tr("CADEAU DEJA PRIS", "GIFT ALREADY CLAIMED"), nil, "croix") end
	end
	U.jOccupe = false
	return ok
end

-- ════════ LE DOCK DE L'ACCUEIL (en bas à gauche, sous le pouce — la charte) ════════
-- v3 : la pile de cinq longues plaques (420 px de large, 5 étages) couvrait la moitié de la caisse. C'est maintenant une RANGÉE de
-- tuiles carrées sous la caisse, dans la bande que rien n'occupe : une grosse icône pixel (on la reconnaît avant de la lire), un mot,
-- et les primes sur des PASTILLES vertes, comme les badges des tuiles du menu. CADEAU · ROBUX · TOP 10 · INVITER · GROUPE/PREMIUM —
-- la dernière disparaît sans laisser de trou. Sur un écran large (téléphone couché) la rangée GRANDIT jusqu'à ×1,3 ; sur un écran
-- trop étroit pour elle à côté de JOUER (une tablette 4:3), elle se range en COLONNE contre le bord.
local TW, TH, GAP = 104, 92, 10
local AMI = ".###.....|#####....|#####..#.|.###..###|.......#.|.###.....|#####....|#####....|#####...." -- (un ami, et le « + »)
local function puce(ico: string, filet: Color3): (TextButton, Frame)
	local b = K.tuile(U.pile, " ", filet, UDim2.fromOffset(TW, TH), UDim2.new(0, 0, 1, 0), Vector2.new(0, 1), 20)
	b.TextScaled = false
	-- (RichText : l'ajusteur du kit laisse ce libellé tranquille — il retirerait toute la pente de la plaque à un mot posé EN BAS, où
	-- elle ne mord presque pas, et « INVITER » tomberait à 11 ; la taille se calcule ici, voir `libelle`)
	b.RichText = true
	b.TextYAlignment = Enum.TextYAlignment.Bottom
	-- (le libellé sous l'icône ; décalé d'un rien vers la gauche, comme le bas de la plaque penchée)
	inst("UIPadding", { PaddingBottom = UDim.new(0, 13), PaddingLeft = UDim.new(0, 6), PaddingRight = UDim.new(0, 12) }, b)
	local icoF = K.icone(b.Parent :: Instance, ico, 5, bandes(filet), UDim2.new(0.5, 5, 0, 11), Vector2.new(0.5, 0))
	table.insert(U.puces, b)
	return b, icoF
end
-- un libellé de tuile : il tient TOUJOURS dans sa plaque (la police pixel est à chasse fixe — la taille se calcule)
local function libelle(b: TextButton, txt: string)
	if b.Text == txt then return end
	b.Text = txt
	b.TextSize = math.min(20, math.floor(68 / math.max(1, utf8.len(txt) * CH)))
end
local function ranger()
	if not U.pile then return end
	local n = (U.bonusBoite and U.bonusBoite.Visible) and 5 or 4
	local a = Hud.racine.AbsoluteSize
	local larg = (a.Y > 1) and (a.X / a.Y * 720) or 1280
	-- la place entre le bord gauche et JOUER. La colonne du menu (Hud : 668 px, LA ROUE · GARAGE · BOUTIQUE · JOUER) se resserre
	-- vers son coin sur un écran moins allongé ; JOUER (620 px qui respirent à ×1,035) déborde d'une dizaine de px à sa gauche.
	local cs = math.clamp((larg - 478) / 668, 0.62, 1)
	local libre = larg - 678 * cs - 24 - 26
	local k = libre / (n * TW + (n - 1) * GAP)
	local colonne = k < 0.62
	U.pileK.Scale = colonne and 1 or math.min(k, 1.3) -- (16:9 : un rien plus petite que 1, pour laisser respirer JOUER)
	for i, b in U.puces do
		local bo = b.Parent.Parent :: Frame
		bo.Position = colonne and UDim2.new(0, 0, 1, -(i - 1) * (TH + GAP)) or UDim2.new(0, (i - 1) * (TW + GAP), 1, 0)
	end
	U.pile.Size = colonne and UDim2.fromOffset(TW, n * TH + (n - 1) * GAP + 16) or UDim2.fromOffset(n * TW + (n - 1) * GAP, TH + 16)
end
local function creerPile()
	local p = inst("Frame", { Name = "PileAccueil", BackgroundTransparency = 1, Size = UDim2.fromOffset(5 * TW + 4 * GAP, TH + 16),
		Position = UDim2.new(0, 24, 1, -24), AnchorPoint = Vector2.new(0, 1), Visible = false, ZIndex = 12 }, Hud.racine)
	U.pile = p
	U.pileK = inst("UIScale", {}, p)
	U.puces = {}
	-- le CADEAU de temps de jeu (le premier, sous le pouce : c'est lui qui change, lui qu'on vient chercher) — ambre qui attend, or
	-- qui se dandine quand il est prêt
	U.temps, U.tempsIco = puce("cadeau", C.orange)
	U.tempsEtat = false
	U.temps.TextColor3 = C.texte2
	U.temps.Activated:Connect(function()
		if not U.tempsPret or U.tOccupe then return end
		U.tOccupe = true
		ctx.action("cadeauTemps")
		U.tOccupe = false
	end)
	-- LA BOUTIQUE ROBUX (Sacha, 5/10 : « fais de ce jeu une usine à fric ») : un raccourci vers les offres en Robux, en tête de la
	-- boutique — ×2 ARGENT, NITRO INFINIE, LES CŒURS
	U.robux = puce("panier", C.vert)
	libelle(U.robux, "ROBUX")
	U.robux.Activated:Connect(function()
		if ctx and ctx.boutique then ctx.boutique() end
	end)
	-- le TOP 10 MONDE
	U.classe = puce("trophee", C.cyan)
	libelle(U.classe, "TOP 10")
	U.classe.Activated:Connect(function() Revenus.classement() end)
	-- INVITER DES AMIS (le lien d'invitation de Roblox ; un ami qui arrive par lui : de l'argent pour lui ET pour toi)
	U.inviter = puce(AMI, C.magenta)
	libelle(U.inviter, tr("INVITER", "INVITE"))
	ecrirePastille(pastille(U.inviter.Parent.Parent :: Instance, Color3.fromRGB(22, 140, 64), 16), "+" .. Hud.argent(R.invitation))
	U.inviter.Activated:Connect(function()
		local SS = game:GetService("SocialService")
		local ok, peut = pcall(function() return SS:CanSendGameInviteAsync(joueur) end)
		if ok and peut then
			pcall(function() SS:PromptGameInvite(joueur) end)
		else
			Hud.toast(tr("INVITATIONS INDISPONIBLES ICI", "INVITES NOT AVAILABLE HERE"), nil, "croix")
		end
	end)
	-- REJOINDRE LE GROUPE (une fois) ou PREMIUM — la dernière : quand elle n'a rien à offrir, elle disparaît sans laisser de trou
	U.bonus, U.bonusDrapeau = puce("drapeau", C.lavande)
	U.bonusEtoile = K.icone(U.bonus.Parent :: Instance, "etoile", 5, bandes(OR1), UDim2.new(0.5, 5, 0, 11), Vector2.new(0.5, 0))
	U.bonusEtoile.Visible = false
	U.bonusBoite = U.bonus.Parent.Parent
	U.bonusGenre = false -- (« pas encore décidé » : la première image pose l'état, même s'il n'y a rien à offrir)
	U.bonusP = pastille(U.bonusBoite, Color3.fromRGB(22, 140, 64), 16)
	U.bonus.Activated:Connect(function()
		if U.bonusGenre == "groupe" then
			local ok = pcall(function() game:GetService("GroupService"):PromptJoinAsync(R.groupe) end)
			if ok then ctx.action("groupe") end
		elseif U.bonusGenre == "premium" then
			pcall(function() MarketplaceService:PromptPremiumPurchase(joueur) end)
		end
	end)
	ranger()
	Hud.racine:GetPropertyChangedSignal("AbsoluteSize"):Connect(ranger)
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
	local pret = false
	if type(debut) == "number" then
		local mn, g = seuil(n + 1)
		local reste = mn * 60 - (workspace:GetServerTimeNow() - debut)
		g *= attr("VIP") and 2 or 1
		pret = reste <= 0
		libelle(U.temps, pret and ("+" .. Hud.argent(g)) or mmss(reste))
	else
		libelle(U.temps, tr("CADEAU", "GIFT"))
	end
	U.tempsPret = pret
	-- prêt : la tuile passe à l'OR (filet, icône, montant) et se dandine, pour qu'on vienne la chercher
	if U.tempsEtat ~= pret then
		U.tempsEtat = pret
		local f = pret and OR1 or C.orange
		repeindreTuile(U.temps, f)
		K.teinter(U.tempsIco, bandes(f))
		U.temps.TextColor3 = pret and OR1 or C.texte2
	end
	local boiteT = U.temps.Parent.Parent :: Frame
	boiteT.Rotation = pret and math.sin(os.clock() * 7) * 2 or 0
	-- la 5e tuile : le groupe (s'il existe et n'est pas encore pris), sinon Premium (pour qui ne l'a pas)
	local genre = nil
	if idDe(R, "groupe") > 0 and not attr("GroupeFait") then
		genre = "groupe"
	elseif not attr("Premium") and R.premiumBonus > 0 then
		genre = "premium"
	end
	if genre ~= U.bonusGenre then
		U.bonusGenre = genre
		U.bonusBoite.Visible = genre ~= nil
		U.bonusDrapeau.Visible = genre == "groupe"
		U.bonusEtoile.Visible = genre == "premium"
		if genre == "groupe" then
			libelle(U.bonus, tr("GROUPE", "GROUP"))
			ecrirePastille(U.bonusP, "+" .. Hud.argent(R.groupeBonus))
		elseif genre == "premium" then
			libelle(U.bonus, "PREMIUM")
			ecrirePastille(U.bonusP, "+" .. math.floor(R.premiumBonus * 100 + 0.5) .. tr(" %", "%"))
		end
		ranger()
	end
end

-- ════════ LE TOP 10 MONDE « SANS AIDE » ════════
-- v3 : le PODIUM se voit — les trois premiers rangs sur une pastille d'or, d'argent et de bronze, leur ligne teintée du métal ; MA
-- ligne cerclée d'or. Sous le titre, la règle en une ligne : la pastille SANS AIDE et ce qu'elle veut dire. Vide (le tableau
-- repart de zéro), la fenêtre le dit franchement au lieu de montrer un trou. Le voile, le OK : la fenêtre se ferme.
local MEDAILLE = { Color3.fromRGB(255, 204, 64), Color3.fromRGB(204, 214, 236), Color3.fromRGB(226, 138, 66) }
local TEINTE = { Color3.fromRGB(86, 60, 12), Color3.fromRGB(50, 56, 88), Color3.fromRGB(76, 42, 22) }
local function creerClassement()
	local W, H = 780, 690
	local v, c, sc, fond = fenetre("Classement", W, H, OR1)
	U.cSc = sc
	fond.Activated:Connect(function() fermer(v, sc) end)
	titre(c, tr("TOP 10 MONDE", "WORLD TOP 10"), 24, 46)
	-- SANS AIDE : ni cœur, ni nitro infinie, ni mode facile (le serveur n'inscrit que ces parties-là)
	local l = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, -40, 0, 32), Position = UDim2.fromOffset(20, 98) }, c)
	inst("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, HorizontalAlignment = Enum.HorizontalAlignment.Center,
		VerticalAlignment = Enum.VerticalAlignment.Center, Padding = UDim.new(0, 12), SortOrder = Enum.SortOrder.LayoutOrder }, l)
	local mot = tr("SANS AIDE", "NO HELP")
	local pz = inst("Frame", { BackgroundColor3 = Color3.fromRGB(0, 50, 70), BorderSizePixel = 0, Size = UDim2.fromOffset(math.floor(utf8.len(mot) * 18 * CH + 24), 30),
		LayoutOrder = 1 }, l)
	inst("UIStroke", { Color = C.cyan, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, pz)
	texte(pz, { Text = mot, TextSize = 18, TextColor3 = C.cyan, Size = UDim2.fromScale(1, 1), TextWrapped = false })
	inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 23, TextColor3 = C.texte2, AutomaticSize = Enum.AutomaticSize.X,
		Size = UDim2.fromOffset(0, 30), Text = tr("ni cœur, ni nitro infinie, ni mode facile", "no hearts, no infinite nitro, no easy mode"), LayoutOrder = 2 }, l)
	U.cLignes = {}
	for i = 1, 10 do
		local y = 146 + (i - 1) * 44
		local f = inst("Frame", { BackgroundColor3 = (i <= 3) and TEINTE[i] or ((i % 2 == 1) and C.nuit or C.piste), BorderSizePixel = 0,
			Size = UDim2.new(1, -64, 0, 40), Position = UDim2.fromOffset(32, y) }, c)
		local st = inst("UIStroke", { Color = OR1, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border, Enabled = false }, f)
		-- le RANG sur sa pastille (le métal pour le podium)
		local rg = inst("Frame", { BackgroundColor3 = (i <= 3) and MEDAILLE[i] or C.carbone2, BorderSizePixel = 0, Size = UDim2.new(0, 54, 1, 0) }, f)
		if i <= 3 then inst("Frame", { BackgroundColor3 = BLANC, BackgroundTransparency = 0.45, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3) }, rg) end
		texte(rg, { Text = tostring(i), TextSize = 22, TextColor3 = (i <= 3) and Color3.fromRGB(40, 22, 4) or C.texte2, Size = UDim2.fromScale(1, 1),
			TextWrapped = false, contour = i > 3 })
		local col = (i <= 3) and C.texte or C.texte2
		local n = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 24, TextColor3 = col, Text = "",
			TextXAlignment = Enum.TextXAlignment.Left, TextTruncate = Enum.TextTruncate.AtEnd, Size = UDim2.new(1, -310, 1, 0), Position = UDim2.fromOffset(70, 0) }, f)
		local m = texte(f, { Text = "", TextSize = 20, TextColor3 = (i == 1) and OR1 or C.menthe, Size = UDim2.new(0, 220, 1, 0), Position = UDim2.new(1, -234, 0, 0),
			TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false })
		U.cLignes[i] = { f = f, n = n, m = m, st = st, fond = f.BackgroundColor3 }
	end
	-- vide : le trophée en creux, et la phrase qui donne envie d'y entrer
	U.cVide = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, 360), Position = UDim2.fromOffset(0, 168), Visible = false }, c)
	K.icone(U.cVide, "trophee", 10, bandes(C.trait), UDim2.new(0.5, 0, 0, 20), Vector2.new(0.5, 0))
	inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 32, TextColor3 = C.texte, TextWrapped = true,
		Text = tr("Personne encore — sois le premier !", "Nobody yet — be the first!"), Size = UDim2.new(1, -80, 0, 40), Position = UDim2.fromOffset(40, 136) }, U.cVide)
	inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 23, TextColor3 = C.texte2, TextWrapped = true,
		Text = tr("Fais une partie sans aide : ton record y entre.", "Play a run with no help: your record goes in."),
		Size = UDim2.new(1, -80, 0, 30), Position = UDim2.fromOffset(40, 184) }, U.cVide)
	local ok = K.tuile(c, T_OK, C.cyan, UDim2.fromOffset(240, 66), UDim2.new(0.5, 0, 1, -22), Vector2.new(0.5, 1), 26)
	ok.Activated:Connect(function() fermer(v, sc) end)
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
			local mien = e.n == moi
			k.n.Text = tostring(e.n or "?")
			k.m.Text = Hud.argent(tonumber(e.v) or 0)
			k.f.BackgroundColor3 = mien and Color3.fromRGB(112, 80, 14) or k.fond -- (ma ligne : en or)
			k.st.Enabled = mien
		end
	end
	U.cVide.Visible = #liste == 0
	ouvrir(U.classeV, U.cSc)
end

-- ════════ LE CŒUR À LA MORT (Sacha, 5/10 : « un bouton pour avoir une vie en plus sous forme de cœur pour 50 Robux ») ════════
-- Il remplace la « seconde chance ». Quand la caisse explose, la carte propose :
--   · AVEC des cœurs en réserve (5/10, lot 2 : le cœur se CHOISIT) — UTILISER UN COEUR, gratuit, un appui ; ou TERMINER ;
--   · SANS cœur — d'en acheter un : Roblox l'accorde (ProcessReceipt : +1 au stock), le serveur répond « Revivre », la carte se ferme
--     sur un oui.
-- Dans les deux cas le pilote DÉPENSE alors un cœur (G.revivre) : on repart là où l'on a explosé. Un cœur acheté n'est jamais
-- perdu : si la carte s'est refermée entre-temps, il attend dans le stock la prochaine explosion.
-- v3 : la carte est cerclée de ROUGE (la vie), le cœur BAT dans son écrin (lub-dub), la réserve s'écrit sur sa pastille (« x3 »), et
-- les 6 s se lisent sur une vraie JAUGE du HUD — d'or, puis rouge et clignotante les deux dernières secondes.
local function creerSeconde()
	local W, H = 820, 424
	local v, c, sc = fenetre("CoeurMort", W, H, C.rouge)
	U.sSc = sc
	titre(c, tr("UN COEUR = UNE VIE", "ONE HEART = ONE LIFE"), 26, 44)
	local ecrin = inst("Frame", { BackgroundColor3 = Color3.fromRGB(46, 8, 32), BorderSizePixel = 0, Size = UDim2.fromOffset(136, 136), Position = UDim2.fromOffset(44, 106) }, c)
	inst("UIStroke", { Color = C.rouge, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, ecrin)
	local hb = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(99, 99), Position = UDim2.fromScale(0.5, 0.5), AnchorPoint = Vector2.new(0.5, 0.5) }, ecrin)
	U.sBat = inst("UIScale", {}, hb)
	K.icone(hb, "coeur", 11, { { 0.3, Color3.fromRGB(255, 200, 214) }, { 0.68, Color3.fromRGB(255, 72, 112) }, { 1, Color3.fromRGB(166, 16, 56) } })
	-- la réserve, sur une pastille au pied du cœur
	U.sStockF = inst("Frame", { BackgroundColor3 = Color3.fromRGB(150, 12, 46), BorderSizePixel = 0, Size = UDim2.fromOffset(70, 36), Position = UDim2.new(1, 14, 1, 12),
		AnchorPoint = Vector2.new(1, 1), Visible = false }, ecrin)
	inst("UIStroke", { Color = ENCRE, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, U.sStockF)
	U.sStock = texte(U.sStockF, { Text = "", TextSize = 22, Size = UDim2.fromScale(1, 1), TextWrapped = false })
	U.sTxt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 25, TextColor3 = C.texte, TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Left, Text = "", Size = UDim2.new(1, -250, 0, 96), Position = UDim2.fromOffset(208, 106), TextScaled = true }, c)
	inst("UITextSizeConstraint", { MaxTextSize = 25, MinTextSize = 16 }, U.sTxt)
	U.sJauge = K.jauge(c, UDim2.new(1, -252, 0, 22), UDim2.fromOffset(208, 216), nil, 4, 3)
	U.sOui = K.lingot(c, tr("CONTINUER", "CONTINUE"), UDim2.new(0.58, -44, 0, 92), UDim2.new(0, 44, 1, -34), Vector2.new(0, 1), 34)
	U.sNon = K.tuile(c, tr("NON MERCI", "NO THANKS"), C.cyan, UDim2.new(0.42, -44, 0, 76), UDim2.new(1, -44, 1, -42), Vector2.new(1, 1), 22)
	-- le cœur bat (deux coups, un silence)
	RunService.RenderStepped:Connect(function()
		if not v.Visible then return end
		local ph = (os.clock() * 1.15) % 1
		U.sBat.Scale = 1 + 0.12 * math.exp(-ph * 14) + ((ph > 0.2) and 0.07 * math.exp(-(ph - 0.2) * 14) or 0)
	end)
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
	U.sStockF.Visible = utiliser
	U.sStock.Text = "x" .. stock
	U.sTxt.Text = utiliser and tr("Un cœur de ta réserve, et tu repars là où tu as explosé : la partie continue, avec ton argent, ton moteur et ta zone.",
			"One heart from your stock, and you restart right where you blew up: the run goes on, with your cash, your engine and your zone.")
		or tr("Un cœur, et tu repars là où tu as explosé : la partie continue, avec ton argent, ton moteur et ta zone.",
			"One heart, and you restart right where you blew up: the run goes on, with your cash, your engine and your zone.")
	U.sOui.TextSize = utiliser and 28 or 34
	U.sOui.Text = utiliser and tr("UTILISER UN COEUR", "USE A HEART") or (tr("CONTINUER", "CONTINUE") .. (prix and ("  " .. Revenus.robux(prix)) or ""))
	U.sNon.Text = utiliser and tr("TERMINER", "END RUN") or tr("NON MERCI", "NO THANKS")
	U.sJauge.regler(1, "or_", 0)
	U.sJauge.alerte(nil)
	ouvrir(v, U.sSc)
	local t, enAchat, fini, attente = 6, false, false, -1
	local cns: { RBXScriptConnection } = {}
	local function clore(ok: boolean)
		if fini then return end
		fini = true
		fermer(v, U.sSc)
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
		-- la jauge : d'or, puis ROUGE et son cadre qui bat les deux dernières secondes
		local urgent = t <= 2 and not enAchat
		U.sJauge.regler(math.clamp(t / 6, 0, 1), urgent and "rouge" or "or_", 0)
		U.sJauge.alerte((urgent and math.floor(t * 6) % 2 == 0) and C.rouge or nil)
		if t <= 0 then clore(false) end
	end))
end
function Revenus.secondeOuverte(): boolean return U.seconde ~= nil and U.seconde.Visible end

-- ════════ L'ÉCRAN DE FIN : la mention, ou l'offre ×2 ARGENT ════════
-- `badge` = le badge RECORD de l'écran de mort (Hud), `gains` = l'argent de la partie AVANT multiplication. Rend le multiplicateur.
-- v3 : l'offre n'est plus un bandeau plat — c'est une TUILE penchée du kit (penché = je touche), filet d'or, la pièce à gauche ; sa
-- cible déborde du dessin (la charte : 44 px au moins sous le doigt). REJOUER reste le seul lingot de l'écran.
function Revenus.finEcran(badge: TextLabel, rec: boolean, gains: number, lecon: boolean): number
	U.finies += 1 -- (une partie finie, leçon comprise : le joueur n'est plus un nouveau venu, l'accueil peut lui parler)
	local m = lecon and 1 or Revenus.mult()
	local mention = (not lecon) and Revenus.mention() or nil
	if mention then
		badge.Text = rec and (tr("RECORD ! ", "RECORD! ") .. mention) or mention
		badge.Visible = true
	end
	-- (la police pixel est à chasse fixe : le cadre prend la largeur de son texte, 190 au moins)
	badge.Size = UDim2.fromOffset(math.max(190, math.floor(utf8.len(badge.Text) * badge.TextSize * CH + 32)), badge.Size.Y.Offset)
	if not U.offre then
		local b = K.tuile(badge.Parent :: Instance, " ", OR1, UDim2.fromOffset(540, 44), badge.Position + UDim2.fromOffset(0, -4), badge.AnchorPoint, 22, "piece", "g")
		local bo = b.Parent.Parent :: Frame
		bo.Name = "OffreX2"
		bo.ZIndex = badge.ZIndex + 1
		bo.Visible = false
		b.TextColor3 = OR1
		-- (la cible tactile déborde du dessin, en haut et en bas)
		b.Size = UDim2.new(1, 0, 1, 28)
		b.Position = UDim2.fromOffset(0, -12)
		b.Activated:Connect(function()
			local id = idDe(R.passes, "argent2")
			if id > 0 then pcall(function() MarketplaceService:PromptGamePassPurchase(joueur, id) end) end
		end)
		U.offre, U.offreBoite = b, bo
	end
	-- l'offre : le passe existe, on ne l'a pas, pas de record à montrer, une vraie partie qui a rapporté quelque chose
	local montre = (idDe(R.passes, "argent2") > 0 or workspace:GetAttribute("DbgSeconde") ~= nil)
		and not attr("Argent2") and not rec and not lecon and gains > 0
	U.offreBoite.Visible = montre
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
	-- (v3) sa flamme prend la couleur de la NITRO INFINIE — le violet de la jauge quand elle agit : on reconnaît le passe d'un coup d'œil
	if o.ico then K.teinter(o.ico, { { 0.3, Hud.FAM.violet[1] }, { 0.7, Hud.FAM.violet[2] }, { 1, Hud.FAM.violet[3] } }) end
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
--       boutique = function() → ouvre la BOUTIQUE sur ses offres en Robux (la tuile ROBUX du dock) }
function Revenus.init(c: any)
	ctx = c
	creerJour()
	creerPile()
	creerSeconde()
	creerClassement()
	brancherNitroReglage()
	U.jPrendre.Activated:Connect(prendreJour)
	task.spawn(function()
		local ev = CC:WaitForChild("Revenu", 30)
		if ev then (ev :: RemoteEvent).OnClientEvent:Connect(annonce) end
		evRevivre = CC:WaitForChild("Revivre", 30) :: RemoteEvent?
	end)
	-- (le compte des parties du profil : une lecture, puis chaque profil poussé par le serveur)
	task.spawn(function()
		local maj = CC:WaitForChild("ProfilMaj", 30)
		if maj then (maj :: RemoteEvent).OnClientEvent:Connect(lireParties) end
		local fn = CC:WaitForChild("Profil", 30)
		if fn then
			local ok, p = pcall(function() return (fn :: RemoteFunction):InvokeServer() end)
			if ok then lireParties(p) end
		end
	end)
	-- (banc) workspace:SetAttribute("DbgRevenu", "prendre…" | "temps…" | "classement…" | "fermer…") : les boutons sans la souris
	workspace:GetAttributeChangedSignal("DbgRevenu"):Connect(function()
		local q = tostring(workspace:GetAttribute("DbgRevenu") or "")
		if string.find(q, "^prendrelent") then
			-- (la fête au ralenti : la fenêtre reste 4 s sur la case passée au vert, le temps de la photographier)
			U.jFeteT = 4
			task.spawn(function() print("[revenus] cadeauJour", prendreJour()) U.jFeteT = nil end)
		elseif string.find(q, "^prendre") then
			task.spawn(function() print("[revenus] cadeauJour", prendreJour()) end)
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
	-- (banc) DbgNeuf change : on rejoue l'arrivée à l'accueil (la fenêtre refermée, la question reposée)
	workspace:GetAttributeChangedSignal("DbgNeuf"):Connect(function()
		U.jour.Visible = false
		vuJour = false
		warn("[revenus] DbgNeuf", workspace:GetAttribute("DbgNeuf"), "parties au profil", U.partiesProfil, "nouveau =", nouveau())
	end)
	RunService.RenderStepped:Connect(function()
		local menu = Hud.ecranCourant() == "menu" and not (ctx.occupe and ctx.occupe())
		if U.pile.Visible ~= menu then U.pile.Visible = menu end
		if menu then
			majPile()
			-- le cadeau du jour s'ouvre de lui-même à l'accueil, tant qu'il n'est pas pris — jamais devant un nouveau venu qui n'a pas
			-- encore roulé (voir `nouveau`)
			if not vuJour and attr("JourDispo") and not nouveau() then
				vuJour = true
				ouvrirJour()
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
