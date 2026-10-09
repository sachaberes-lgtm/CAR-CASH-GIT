-- CASH CAR — LA BOUTIQUE v2 (9/10, Sacha : « je t'ai demandé 100 fois de prendre des initiatives pour travailler la boutique et
-- l'expérience utilisateur ») : ce qui s'achète en Robux, rangé comme dans les boutiques du haut des classements Roblox.
--   · à GAUCHE, LE RAIL : quatre onglets — OFFRES · CAISSES · ARGENT · AVANTAGES — et RETOUR dessous, à sa place de toujours. Tout
--     ce qui sert à naviguer vit sous le pouce gauche, rien ne se pose sur la page. Un onglet fait GLISSER la page jusqu'à sa
--     section ; l'onglet allumé suit la page quand on la fait défiler au doigt (une seule page, un seul défilement) ;
--   · en HAUT à droite, ce qu'on a : le compte en $ et les cœurs en réserve (on lit en haut, on touche en bas) ;
--   · LA PAGE : 1. OFFRES — UNE grande carte, la meilleure offre du moment : le KIT DU PILOTE tant qu'il n'est pas pris (ce qu'il
--     contient en trois tuiles, son prix, UN lingot d'or), sinon le premier passe qu'on n'a pas (×2 ARGENT, puis NITRO INFINIE,
--     puis VIP s'il existe) ; tout est à soi : la section s'efface ; 2. CAISSES — les légendaires EN GRAND, chacune avec sa
--     VIGNETTE dessinée (sa vraie forme, ses vraies couleurs : Caisse.vignetteImage), la une en pleine largeur ; le bouton de la
--     carte, c'est son prix ; toucher la caisse la fait SORTIR de la page (la fenêtre d'achat, en grand) ; 3. ARGENT — cinq packs :
--     le montant en vert, une pile de pièces qui grandit avec le pack, le prix sur le bouton ; 4. AVANTAGES — les passes (×2
--     ARGENT, NITRO INFINIE, VIP), 3 TOURS DE ROUE quand ils existent, puis les CŒURS (1, 5, 15).
-- L'HONNÊTETÉ (règles de Roblox) : un prix affiché est celui que Roblox rend pour CE joueur (Revenus.prix : prix régional, remise
-- Plus). Un objet pas encore créé (numéro à 0 dans Config.REVENUS) reste visible, en terne : BIENTOT et son prix CONSEILLÉ — rien
-- ne se vend. « BONUS +x % » et « MEILLEURE AFFAIRE » ne s'écrivent que s'ils sont VRAIS, calculés sur les prix lus sur Roblox ;
-- aucun minuteur, aucun stock, aucun rabais, aucun « POPULAIRE » (pas de chiffres de vente pour le dire).
-- Le chemin de l'achat ne change pas : MarketplaceService (PromptProductPurchase / PromptGamePassPurchase), le serveur accorde
-- (ServerScriptService/Revenus, `recevoir`). Les 3 TOURS s'achètent dans LA ROUE, qui montre ses chances avant (hasard payant), et
-- leur carte se cache là où Roblox interdit de vendre du hasard (PolicyService).
-- Plus aucune caisse 3D bâtie à l'ouverture : les vignettes sont des images — le budget de maillages de Roblox reste au garage.
-- (banc, Studio seulement) workspace « DbgBoutiqueIds » = true : chaque objet fait comme s'il existait, au prix conseillé (pris pour
-- le vrai : les étiquettes se calculent) ; un achat écrit « [boutique] fenetre d'achat » dans la Sortie au lieu d'appeler Roblox.
local TweenService = game:GetService("TweenService")
local MarketplaceService = game:GetService("MarketplaceService")
local PolicyService = game:GetService("PolicyService")
local RunService = game:GetService("RunService")
local joueur = game:GetService("Players").LocalPlayer
local CC = script.Parent.Parent -- (le dossier CashCar : Profil, ProfilMaj — les caisses légendaires déjà à soi, le compte)
local Hud = require(script.Parent:WaitForChild("Hud"))
local Roue = require(script.Parent:WaitForChild("Roue")) -- (la carte 3 TOURS mène à LA ROUE : ses chances s'y lisent avant l'achat)
local Sons = require(script.Parent:WaitForChild("Sons"))
local Caisse = require(CC:WaitForChild("Caisse"))
local Config = require(CC:WaitForChild("Config"))
local Revenus = require(script.Parent:WaitForChild("Revenus")) -- (les prix lus sur Roblox, le stock de cœurs)
local Catalogue = Caisse.Catalogue
local K, C = Hud.kit, Hud.C
local inst = K.inst
local FR = Hud.FR
local CH = Hud.CHASSE
local R = Config.REVENUS
local STUDIO = RunService:IsStudio()

local Boutique = { ouvert = false }
local U: any = { sections = {}, onglets = {} }
local ctx: any = nil
local depuis = "menu"
local UNE = 9 -- la caisse à la une : le CHAT ARC-EN-CIEL
local OR1 = Color3.fromRGB(255, 215, 94)
local BLANC = Color3.new(1, 1, 1)
local VIOLET = Color3.fromRGB(176, 107, 255)
local RATIO = 80 / 144 -- (la vignette dessinée fait 144 × 80)
local GAUCHE = Enum.TextXAlignment.Left
local BORD = Enum.ApplyStrokeMode.Border

local function tr(fr: string, en: string): string return FR and fr or en end
local function ombrer(c: Color3, k: number): Color3 return Color3.new(c.R * k, c.G * k, c.B * k) end
local function ecrire(t: any, txt: string) if t.Text ~= txt then t.Text = txt end end
local function nomCaisse(i: number): string
	local f = Catalogue[i]
	return Hud.sansAccent(string.upper(FR and f.nom or (f.en or f.nom)))
end
local RARETE = { legendaire = { "LEGENDAIRE", "LEGENDARY", Color3.fromRGB(255, 215, 94) }, epique = { "EPIQUE", "EPIC", Color3.fromRGB(199, 125, 255) },
	rare = { "RARE", "RARE", Color3.fromRGB(77, 184, 255) } }

-- ════════ LES ARTICLES : un numéro (Config.REVENUS), un prix lu sur Roblox, un prix CONSEILLÉ ════════
-- Les prix conseillés sont ceux du README (« Gagner de l'argent ») et des commentaires de Config.REVENUS ; ceux des caisses viennent
-- de Config.REVENUS.prixCaisses (le garage affiche les mêmes). Ils ne servent qu'à dire, en terne, ce que coûtera un objet pas
-- encore créé : dès que le numéro existe, c'est le prix de Roblox, et rien d'autre, qui s'écrit.
local CONSEIL = {
	passes = { argent2 = 500, nitroInfini = 700, vip = 449 },
	produits = { coeur = 50, coeur5 = 199, coeur15 = 499, kit = 99, tours3 = 99 },
	argent = { 99, 249, 499, 999, 2499 },
}
local function idDe(t: any, cle: any): number
	local id = t and t[cle]
	return (type(id) == "number" and id > 0) and id or 0
end
local function sim(): boolean return STUDIO and workspace:GetAttribute("DbgBoutiqueIds") == true end
local ART: { [string]: any } = {}
local function article(cle: string, passe: boolean, lire: () -> number, conseil: number?)
	ART[cle] = { cle = cle, passe = passe, lire = lire, conseil = conseil }
end
for nom in R.passes do article(nom, true, function() return idDe(R.passes, nom) end, CONSEIL.passes[nom]) end
for nom in R.produits do article(nom, false, function() return idDe(R.produits, nom) end, CONSEIL.produits[nom]) end
-- (les packs d'argent s'appellent « pack1 »… « pack5 » : « argent2 » est déjà le passe x2 ARGENT — mesuré au banc, le 2e pack prenait
-- sa place et la carte x2 ARGENT affichait le prix du pack)
for k, a in R.argent do article("pack" .. k, false, function() return idDe(a, "id") end, CONSEIL.argent[k]) end
for i in R.caisses do article("caisse" .. i, false, function() return idDe(R.caisses, i) end, R.prixCaisses and R.prixCaisses[i]) end

-- le numéro : > 0 le vrai, 0 pas encore créé, -1 un faux numéro du banc
local function idArt(a: any): number
	local id = a.lire()
	if id <= 0 and sim() then return -1 end
	return id
end
local function vendable(a: any): boolean return idArt(a) ~= 0 end
-- le prix, et s'il est VRAI (lu sur Roblox pour ce joueur — ou simulé au banc). Le numéro existe mais Roblox n'a pas encore
-- répondu : pas de prix (jamais un prix inventé entre-temps). Pas de numéro : le prix conseillé, qui n'est PAS vrai.
local function prixArt(a: any): (number?, boolean)
	local id = idArt(a)
	if id == -1 then return a.conseil, a.conseil ~= nil end
	if id > 0 then
		local p = Revenus.prix(id, a.passe)
		return p, p ~= nil
	end
	return a.conseil, false
end
local function robux(n: number?): string return n and ("R$ " .. Hud.entier(n)) or "" end

-- ce qu'on possède : un passe (attribut posé par le serveur), une caisse (le profil), le kit (attribut KitPris)
local PR: any = { caisses = {} }
local ATTR = { argent2 = "Argent2", nitroInfini = "NitroPasse", vip = "VIP" }
local function possede(a: any): boolean
	if a.passe then return joueur:GetAttribute(ATTR[a.cle] or "?") == true end
	local i = tonumber(string.match(a.cle, "^caisse(%d+)$"))
	if i then return type(PR.caisses) == "table" and table.find(PR.caisses, i) ~= nil end
	if a.cle == "kit" then return joueur:GetAttribute("KitPris") == true end
	return false
end
-- l'ÉTAT d'un article et le mot de son bouton : « possede » (A TOI / ACTIF), « acheter » (son prix), « bientot » (pas encore en vente :
-- BIENTOT et le prix conseillé, en terne)
local function etatDe(a: any, motPossede: string?): (string, string)
	if possede(a) then return "possede", motPossede or tr("A TOI", "YOURS") end
	local p, vrai = prixArt(a)
	if not vendable(a) then return "bientot", tr("BIENTOT", "SOON") .. (p and ("   " .. robux(p)) or "") end
	return "acheter", (vrai and p) and robux(p) or tr("ACHETER", "BUY")
end

-- ════════ ACHETER (le circuit de toujours : la fenêtre de Roblox ; le serveur accorde) ════════
local function refus(txt: string?)
	Sons.vrai("uiRefus", nil, nil, "tap", 0.8)
	Hud.vibre(10)
	Hud.toast(txt or tr("BIENTOT : CET ARTICLE ARRIVE TRES VITE", "SOON: THIS ITEM IS ON ITS WAY"), C.texte2, "verrou")
end
local function acheter(a: any)
	if possede(a) then
		local car = string.sub(a.cle, 1, 6) == "caisse"
		Hud.toast(car and tr("DEJA A TOI : ELLE T'ATTEND AU GARAGE", "ALREADY YOURS: IT'S IN YOUR GARAGE")
			or tr("DEJA A TOI : C'EST ACTIF", "ALREADY YOURS: IT'S ACTIVE"), C.vert, "coche")
		return
	end
	local id = idArt(a)
	if id == 0 then
		refus()
		return
	end
	if a.cle == "tours3" then
		-- (hasard payant : les chances se lisent AVANT l'achat — on l'achète dans LA ROUE, qui les montre ; elle vit à l'accueil et
		-- à l'écran de fin)
		if depuis == "garage" then
			Hud.toast(tr("LA ROUE T'ATTEND A L'ACCUEIL", "THE WHEEL IS ON THE HOME SCREEN"), OR1, "etoile")
			return
		end
		Boutique.fermer()
		Roue.ouvrir()
		return
	end
	if id == -1 then
		warn("[boutique] fenetre d'achat Roblox (banc) : " .. (a.passe and "passe " or "produit ") .. a.cle)
		return
	end
	if a.passe then
		pcall(function() MarketplaceService:PromptGamePassPurchase(joueur, id) end)
	else
		pcall(function() MarketplaceService:PromptProductPurchase(joueur, id) end)
	end
end

-- ════════ LES PIÈCES DU DÉCOR (au kit de Hud) ════════
-- une PUCE : un aplat, son mot d'encre — la largeur suit le mot (la police pixel est à chasse fixe)
local function puce(parent: Instance, txt: string, fond: Color3, corps: number, pos: UDim2, ancre: Vector2?, encre: Color3?, trait: Color3?): (Frame, TextLabel)
	local p = inst("Frame", { Name = "Puce", BackgroundColor3 = fond, BorderSizePixel = 0, Position = pos, AnchorPoint = ancre or Vector2.zero }, parent)
	inst("UIStroke", { Color = trait or C.encre, Thickness = 2, ApplyStrokeMode = BORD }, p)
	local t = K.texte(p, { Text = "", TextSize = corps, TextColor3 = encre or C.encre, Size = UDim2.fromScale(1, 1), TextWrapped = false, contour = false })
	local function taille() p.Size = UDim2.fromOffset(math.floor((utf8.len(t.Text) or 0) * corps * CH + corps * 1.5), math.floor(corps * 1.9)) end
	t:GetPropertyChangedSignal("Text"):Connect(taille)
	t.Text = txt
	taille()
	return p, t
end
-- l'EN-TÊTE d'une section : le titre penché, son filet de couleur, une phrase qui dit ce qu'on y trouve
local function entete(parent: Instance, titre: string, sous: string?, couleur: Color3, y: number?): (Frame, TextLabel?)
	local f = inst("Frame", { Name = "Entete", BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, sous and 88 or 54), Position = UDim2.fromOffset(0, y or 0) }, parent)
	K.texte(f, { italique = true, Text = titre, TextSize = 32, TextColor3 = C.texte, Size = UDim2.new(1, 0, 0, 36), TextXAlignment = GAUCHE, TextWrapped = false, epais = 3 })
	inst("Frame", { BackgroundColor3 = couleur, BorderSizePixel = 0, Size = UDim2.fromOffset(96, 6), Position = UDim2.fromOffset(2, 44) }, f)
	inst("Frame", { BackgroundColor3 = ombrer(couleur, 0.55), BorderSizePixel = 0, Size = UDim2.fromOffset(34, 6), Position = UDim2.fromOffset(106, 44) }, f)
	local s: TextLabel? = nil
	if sous then
		s = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 22, TextColor3 = C.texte2, Text = sous, TextXAlignment = GAUCHE,
			TextWrapped = true, Size = UDim2.new(1, 0, 0, 30), Position = UDim2.fromOffset(0, 56) }, f)
	end
	return f, s
end
-- une CARTE : la boîte (placée par la mise en page) et sa plaque (ce qui s'enfonce sous le doigt) — laque teintée de la couleur de
-- l'article, trait d'accent, bande du haut, reflet sur le premier tiers, ombre portée. `touchable` : toute la carte se touche.
local function carte(parent: Instance, accent: Color3, touchable: boolean): any
	local boite = inst("Frame", { Name = "Carte", BackgroundTransparency = 1, Size = UDim2.fromOffset(200, 200) }, parent)
	inst("Frame", { Name = "Ombre", BackgroundColor3 = C.encre, BackgroundTransparency = 0.45, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1),
		Position = UDim2.fromOffset(7, 8) }, boite)
	local p = inst("Frame", { Name = "Plaque", BackgroundColor3 = BLANC, BorderSizePixel = 0, Size = UDim2.fromScale(1, 1) }, boite)
	local grad = inst("UIGradient", { Rotation = 90, Color = ColorSequence.new(Color3.fromRGB(42, 26, 78):Lerp(accent, 0.24), Color3.fromRGB(14, 10, 32)) }, p)
	local trait = inst("UIStroke", { Color = accent, Thickness = 3, ApplyStrokeMode = BORD }, p)
	local bande = inst("Frame", { Name = "Bande", BackgroundColor3 = accent, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 6) }, p)
	local reflet = inst("Frame", { Name = "Reflet", BackgroundColor3 = BLANC, BackgroundTransparency = 0.94, BorderSizePixel = 0, Size = UDim2.fromScale(1, 0.3),
		Position = UDim2.fromOffset(0, 6) }, p)
	inst("UIGradient", { Rotation = 90, Transparency = NumberSequence.new(0, 1) }, reflet)
	local o: any = { boite = boite, p = p, trait = trait, bande = bande, grad = grad }
	if touchable then
		o.b = inst("TextButton", { Name = "Toucher", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false, ZIndex = 8 }, p)
		K.retour(o.b, p) -- (la carte s'enfonce sous le doigt, se soulève sous la souris ; un clic, une vibration)
	end
	return o
end
-- REPEINDRE une tuile du kit dans une autre couleur (la recette de Hud, teintesTuile : la face = la couleur à moitié dans la nuit, le
-- liseré du haut presque plein, la tranche profonde)
local function teindre(b: TextButton, f: Color3)
	local plaque = b.Parent :: Instance
	K.repeindre(plaque, ombrer(f, 0.5):Lerp(C.carbone, 0.3), f)
	local l = plaque:FindFirstChild("l", true)
	if l then (l :: Frame).BackgroundColor3 = ombrer(f, 0.95) end
	local tr9 = plaque.Parent and plaque.Parent:FindFirstChild("Tranche")
	if tr9 then (tr9 :: Frame).BackgroundColor3 = ombrer(f, 0.4) end
end
-- LE BOUTON D'UNE CARTE : une tuile penchée à la couleur de l'article, dont le mot est son PRIX ; elle passe au vert (A TOI, ACTIF)
-- ou au terne (BIENTOT). La cible du pouce déborde du dessin (44 px réels sur un téléphone couché, où la racine est à ×0,46).
local function bouton(parent: Instance, couleur: Color3, taille: UDim2, pos: UDim2, ancre: Vector2?, corps: number): any
	local b = K.tuile(parent, "", couleur, taille, pos, ancre, corps)
	K.cible(b, 10)
	local o: any = { b = b, boite = (b.Parent :: Instance).Parent, c = couleur, etat = "" }
	o.boite.ZIndex = 9 -- (au-dessus de la carte qui se touche)
	function o.regler(etat: string, txt: string)
		if o.etat ~= etat then
			o.etat = etat
			teindre(b, (etat == "acheter" and o.c) or (etat == "possede" and C.vert) or C.terne)
			b.TextColor3 = (etat == "bientot") and C.texte2 or C.texte
		end
		ecrire(b, txt)
	end
	return o
end
-- LE PLATEAU sous une caisse : une flaque de lumière à la couleur de sa rareté, l'ombre au sol et un filet de néon, fondus sur les
-- bords (au banc, la pilule cernée d'avant se lisait comme un bouton) — rend la flaque et le filet, pour les repeindre
local FONDU = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(0.5, 0), NumberSequenceKeypoint.new(1, 1) })
local function plateau(parent: Instance, cercle: Color3): (Frame, Frame)
	-- (le projecteur : une nappe de lumière derrière la caisse, fondue en haut et en bas)
	local spot = inst("Frame", { Name = "Spot", BackgroundColor3 = cercle, BackgroundTransparency = 0.8, BorderSizePixel = 0, AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.52), Size = UDim2.fromScale(0.96, 0.84) }, parent)
	inst("UICorner", { CornerRadius = UDim.new(0.5, 0) }, spot)
	inst("UIGradient", { Rotation = 90, Transparency = FONDU }, spot)
	local halo = inst("Frame", { Name = "Halo", BackgroundColor3 = cercle, BackgroundTransparency = 0.6, BorderSizePixel = 0, AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.86), Size = UDim2.fromScale(1.02, 0.22) }, parent)
	inst("UICorner", { CornerRadius = UDim.new(0.5, 0) }, halo)
	inst("UIGradient", { Transparency = FONDU }, halo)
	local ombre = inst("Frame", { Name = "Ombre", BackgroundColor3 = C.encre, BackgroundTransparency = 0.3, BorderSizePixel = 0, AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.88), Size = UDim2.fromScale(0.74, 0.1) }, parent)
	inst("UICorner", { CornerRadius = UDim.new(0.5, 0) }, ombre)
	inst("UIGradient", { Transparency = FONDU }, ombre)
	local filet = inst("Frame", { Name = "Filet", BackgroundColor3 = cercle, BorderSizePixel = 0, AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.97), Size = UDim2.new(0.92, 0, 0, 3) }, parent)
	inst("UIGradient", { Transparency = FONDU }, filet)
	return halo, filet
end
-- LA VIGNETTE d'une caisse : l'image dessinée (en gros pixels nets — c'est la direction artistique), posée sur un plateau cerclé de la
-- couleur de sa rareté (le plateau du garage) ; sans image (API d'images refusées), sa silhouette pixel à sa couleur
local function vignette(parent: Instance, i: number, cercle: Color3): any
	local f = Catalogue[i]
	local cadre = inst("Frame", { Name = "Vignette", BackgroundTransparency = 1, Size = UDim2.fromOffset(144, 80) }, parent)
	plateau(cadre, cercle)
	local ei = Caisse.vignetteImage(i)
	local img = inst("ImageLabel", { Name = "Image", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), ScaleType = Enum.ScaleType.Fit,
		ResampleMode = Enum.ResamplerMode.Pixelated, ZIndex = 2 }, cadre)
	if ei then
		img.ImageContent = Content.fromObject(ei)
	else
		img.Visible = false
		K.iconeRelief(cadre, "voiture", 8, Color3.fromHex(string.format("%06x", f.laque)), UDim2.fromScale(0.5, 0.45), Vector2.new(0.5, 0.5))
	end
	return { cadre = cadre, img = img, ei = ei }
end
-- une PILE d'icônes qui grandit avec le pack (pièces pour l'argent, cœurs pour les cœurs) : rangées du bas vers le haut
local PILES = { { 1 }, { 2 }, { 2, 1 }, { 3, 2 }, { 3, 2, 1 } }
local function pile(parent: Instance, ico: string, couleur: Color3, n: number): Frame
	local f = inst("Frame", { Name = "Pile", BackgroundTransparency = 1, Size = UDim2.fromOffset(170, 112), AnchorPoint = Vector2.new(0.5, 0) }, parent)
	local px, pas = 5, 40
	for r, nb in PILES[math.clamp(n, 1, #PILES)] do
		local y = 112 - 45 - (r - 1) * 30
		local x0 = 85 - ((nb - 1) * pas + 45) / 2
		for j = 0, nb - 1 do
			local ic = K.iconeRelief(f, ico, px, couleur, UDim2.fromOffset(x0 + j * pas, y))
			ic.ZIndex = r
		end
	end
	return f
end

-- ════════ 1. OFFRES — LE HÉROS : la première chose vue ════════
-- Le KIT DU PILOTE tant qu'il n'est pas pris (une fois par compte : 50 000 $, 3 cœurs, la traînée POUDRE D'OR), sinon le premier
-- passe qu'on n'a pas. À droite, le prix en grand et UN lingot d'or — le seul de l'écran : c'est LA décision de la page. Pas encore en
-- vente : le lingot laisse la place à une plaque terne BIENTOT (un bouton d'or qui ne vend rien serait un leurre).
local PASSES = {
	argent2 = { ico = "piece", c = OR1, titre = { "x2 ARGENT", "x2 CASH" },
		txt = { "Tout l'argent de tes parties compte DOUBLE. Pour toujours.", "All the cash from your runs counts DOUBLE. Forever." } },
	-- (NitroPasse : le passe est à soi — NitroInfini, lui, dit s'il AGIT : son interrupteur est dans les RÉGLAGES)
	nitroInfini = { ico = "flamme", c = VIOLET, titre = { "NITRO INFINIE", "INFINITE NITRO" },
		txt = { "La jauge ne se vide JAMAIS : nitro à fond, tout le temps. Elle se coupe dans les réglages.",
			"The gauge NEVER empties: full nitro, all the time. Switch it off in the settings." } },
	vip = { ico = "etoile", c = C.cyan, titre = { "VIP", "VIP" },
		txt = { "Cadeaux du jour et de temps de jeu DOUBLÉS, et ton nom en or au-dessus de ta caisse.",
			"Daily and playtime gifts DOUBLED, and your name in gold above your car." } },
}
local ORDRE_PASSES = { "argent2", "nitroInfini", "vip" }
local HE: any = { kind = nil }
local H_HEROS = 304
local function choixHeros(): string?
	if joueur:GetAttribute("KitPris") ~= true then return "kit" end
	for _, cle in ORDRE_PASSES do
		local a = ART[cle]
		if a and not possede(a) and (cle ~= "vip" or vendable(a)) then return cle end
	end
	return nil
end
local function creerHeros(page: Instance): any
	local s = inst("Frame", { Name = "Offres", BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, H_HEROS) }, page)
	local c = carte(s, OR1, false)
	c.boite.Size = UDim2.fromScale(1, 1)
	HE.c = c
	-- ── le KIT : la puce, le nom, la phrase, puis ce qu'il contient en trois tuiles ──
	local kit = inst("Frame", { Name = "Kit", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, c.p)
	HE.kit = kit
	puce(kit, tr("OFFRE DE BIENVENUE", "WELCOME OFFER"), OR1, 17, UDim2.fromOffset(26, 24))
	HE.kitTitre = K.texte(kit, { italique = true, Text = tr("KIT DU PILOTE", "DRIVER'S KIT"), TextSize = 46, TextColor3 = OR1, Size = UDim2.fromOffset(500, 52),
		Position = UDim2.fromOffset(24, 64), TextXAlignment = GAUCHE, TextWrapped = false, epais = 4, ajuste = 6 })
	HE.kitPhrase = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 22, TextColor3 = C.texte2, TextXAlignment = GAUCHE,
		Text = tr("Tout pour bien démarrer, en un seul achat.", "Everything to get going, in one purchase."), Size = UDim2.fromOffset(500, 26),
		Position = UDim2.fromOffset(26, 118) }, kit)
	local kt = R.kit
	local nomHabit, catHabit = "?", "trainee"
	do
		local cat, hid = string.match(kt.habit or "", "^(%w+):(%w+)$")
		catHabit = cat or catHabit
		for _, d in (cat and Config.HABITS[cat]) or {} do
			if d.id == hid then nomHabit = Hud.sansAccent(string.upper(FR and d.nom or (d.en or d.nom))) end
		end
	end
	local MOT_CAT = { trainee = { "LA TRAINEE", "THE TRAIL" }, peinture = { "LA PEINTURE", "THE PAINT" }, aile = { "LES AILES", "THE WINGS" } }
	local mot = MOT_CAT[catHabit] or MOT_CAT.trainee
	HE.tuiles = {}
	for j, it in {
		{ ico = "piece", c = C.menthe, v = Hud.compte(kt.argent), sous = tr("SUR TON COMPTE", "TO YOUR ACCOUNT") },
		{ ico = "coeur", c = C.rouge, v = kt.coeurs .. tr(" COEURS", " HEARTS"), sous = tr("UNE VIE CHACUN", "ONE LIFE EACH") },
		{ ico = (catHabit == "trainee") and "trainee" or "pinceau", c = OR1, v = nomHabit, sous = tr(mot[1] .. ", AU GARAGE", mot[2] .. ", IN YOUR GARAGE") },
	} do
		local t = inst("Frame", { Name = "Contenu" .. j, BackgroundColor3 = C.encre, BackgroundTransparency = 0.35, BorderSizePixel = 0, Size = UDim2.fromOffset(150, 132) }, kit)
		inst("UIStroke", { Color = it.c, Thickness = 2, ApplyStrokeMode = BORD }, t)
		inst("Frame", { BackgroundColor3 = it.c, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 4) }, t)
		K.iconeRelief(t, it.ico, 6, it.c, UDim2.new(0.5, 0, 0, 14), Vector2.new(0.5, 0))
		K.texte(t, { Text = it.v, TextSize = 24, TextColor3 = it.c, Size = UDim2.new(1, -12, 0, 28), Position = UDim2.fromOffset(6, 74), TextWrapped = false, epais = 3, ajuste = 4 })
		local sous = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 18, TextColor3 = C.texte2, Text = it.sous, TextScaled = true,
			Size = UDim2.new(1, -12, 0, 20), Position = UDim2.fromOffset(6, 104) }, t)
		inst("UITextSizeConstraint", { MaxTextSize = 18, MinTextSize = 12 }, sous)
		table.insert(HE.tuiles, t)
		if j < 3 then
			-- le « + » entre deux tuiles : ce qu'on obtient s'ADDITIONNE
			local plus = K.texte(kit, { Text = "+", TextSize = 30, TextColor3 = OR1, Size = UDim2.fromOffset(24, 30), TextWrapped = false, epais = 3 })
			plus.Name = "Plus" .. j
		end
	end
	-- ── un PASSE : son icône en grand, son nom, ce qu'il fait ──
	local ps = inst("Frame", { Name = "Passe", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, c.p)
	HE.passe = ps
	HE.pPuce = puce(ps, tr("A LA UNE", "FEATURED"), OR1, 17, UDim2.fromOffset(26, 24))
	HE.pIcone = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(117, 117), Position = UDim2.fromOffset(30, 92) }, ps)
	HE.pTitre = K.texte(ps, { italique = true, Text = "", TextSize = 46, TextColor3 = OR1, Size = UDim2.fromOffset(500, 52), Position = UDim2.fromOffset(176, 86),
		TextXAlignment = GAUCHE, TextWrapped = false, epais = 4, ajuste = 6 })
	HE.pTxt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 24, TextColor3 = C.texte, TextXAlignment = GAUCHE,
		TextYAlignment = Enum.TextYAlignment.Top, TextWrapped = true, Text = "", Size = UDim2.fromOffset(500, 90), Position = UDim2.fromOffset(178, 146) }, ps)
	-- ── à droite : le PRIX en grand, la note, et LE lingot (ou la plaque BIENTOT) ──
	HE.prix = K.texte(c.p, { Text = "", TextSize = 50, TextColor3 = OR1, Size = UDim2.fromOffset(300, 56), Position = UDim2.new(1, -28, 0, 44),
		AnchorPoint = Vector2.new(1, 0), TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false, epais = 4 })
	HE.note = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 20, TextColor3 = C.texte2, TextXAlignment = Enum.TextXAlignment.Right,
		Text = "", Size = UDim2.fromOffset(300, 24), Position = UDim2.new(1, -30, 0, 106), AnchorPoint = Vector2.new(1, 0) }, c.p)
	HE.lingot = K.lingot(c.p, tr("ACHETER", "BUY"), UDim2.fromOffset(300, 96), UDim2.new(1, -30, 1, -30), Vector2.new(1, 1), 36)
	K.cible(HE.lingot, 4)
	HE.lingot.Activated:Connect(function() if HE.kind then acheter(ART[HE.kind]) end end)
	HE.bientot = bouton(c.p, C.terne, UDim2.fromOffset(300, 86), UDim2.new(1, -30, 1, -34), Vector2.new(1, 1), 24)
	HE.bientot.b.Activated:Connect(function() if HE.kind then acheter(ART[HE.kind]) end end)
	HE.cadre = s
	return s
end
-- le héros prend son contenu (kit ou passe) et sa couleur
local function heros(kind: string)
	if HE.kind == kind then return end
	HE.kind = kind
	local kit = kind == "kit"
	HE.kit.Visible, HE.passe.Visible = kit, not kit
	local col = OR1
	if not kit then
		local d = PASSES[kind]
		col = d.c
		HE.pTitre.Text, HE.pTitre.TextColor3 = tr(d.titre[1], d.titre[2]), d.c
		HE.pTxt.Text = tr(d.txt[1], d.txt[2])
		HE.pIcone:ClearAllChildren()
		K.iconeRelief(HE.pIcone, d.ico, 13, d.c)
		HE.pPuce.BackgroundColor3 = d.c
	end
	HE.c.trait.Color, HE.c.bande.BackgroundColor3 = col, col
	HE.c.grad.Color = kit and ColorSequence.new(Color3.fromRGB(120, 78, 16), Color3.fromRGB(44, 18, 46))
		or ColorSequence.new(Color3.fromRGB(40, 24, 74):Lerp(col, 0.32), Color3.fromRGB(14, 10, 32))
	HE.note.Text = kit and tr("Une seule fois par compte.", "Once per account.") or tr("Achat unique : à toi pour toujours.", "One-time purchase: yours forever.")
end
local function placerHeros(cw: number): number
	-- la colonne de gauche : ce qui reste à gauche du prix et du lingot
	local L = cw - 26 - 300 - 30 - 30
	HE.kitTitre.Size = UDim2.fromOffset(L, 52)
	HE.kitPhrase.Size = UDim2.fromOffset(L, 26)
	local g9 = 26 -- (l'écart entre deux tuiles, où se pose le « + »)
	local tw = math.floor((L - 2 * g9) / 3)
	for j, t in HE.tuiles do
		t.Position = UDim2.fromOffset(26 + (j - 1) * (tw + g9), 152)
		t.Size = UDim2.fromOffset(tw, 128)
		local plus = HE.kit:FindFirstChild("Plus" .. j)
		if plus then plus.Position = UDim2.fromOffset(26 + j * (tw + g9) - g9 / 2 - 12, 200) end
	end
	HE.pTitre.Size = UDim2.fromOffset(L - 150, 52)
	HE.pTxt.Size = UDim2.fromOffset(L - 152, 110)
	return H_HEROS
end
local function majHeros()
	local kind = HE.kind
	if not kind then return end
	local a = ART[kind]
	local p, vrai = prixArt(a)
	local ok = vendable(a)
	HE.lingot.Parent.Parent.Visible = ok
	HE.bientot.boite.Visible = not ok
	if not ok then HE.bientot.regler("bientot", tr("BIENTOT", "SOON")) end
	ecrire(HE.prix, (p and (vrai or not ok)) and robux(p) or "")
	HE.prix.TextColor3 = ok and OR1 or C.terne
end

-- ════════ 2. CAISSES — les légendaires en grand ════════
-- La une (le CHAT ARC-EN-CIEL) en pleine largeur, puis la grille, de la moins chère à la plus chère (on entre par le petit prix).
-- Les caisses RETIRÉES du catalogue (FORMULE OR, ENDURANCE 24, EL PATRON — `retire`) ne se vendent plus : elles ne s'affichent pas.
local LISTE: { number } = {}
for i = 0, 200 do
	local f = Catalogue[i]
	if f and f.cond and f.cond.k == "premium" and not f.retire and i ~= UNE then table.insert(LISTE, i) end
end
table.sort(LISTE, function(a, b)
	local pa, pb = (R.prixCaisses and R.prixCaisses[a]) or 0, (R.prixCaisses and R.prixCaisses[b]) or 0
	if pa ~= pb then return pa < pb end
	return a < b
end)
local CA: any = { cartes = {} }
local function creerCaisse(parent: Instance, i: number, une: boolean): any
	local f = Catalogue[i]
	local rr = RARETE[f.rar] or RARETE.legendaire
	local c = carte(parent, une and C.magenta or rr[3], true)
	if not une then c.grad.Color = ColorSequence.new(Color3.fromRGB(58, 30, 98), Color3.fromRGB(16, 10, 36)) end
	local o: any = { i = i, c = c, une = une, a = ART["caisse" .. i], rar = rr }
	o.v = vignette(c.p, i, rr[3])
	o.rare = puce(c.p, tr(rr[1], rr[2]), C.encre, une and 17 or 15, UDim2.fromOffset(0, 0), nil, rr[3], rr[3])
	if une then o.unePuce = puce(c.p, tr("A LA UNE", "FEATURED"), C.magenta, 18, UDim2.fromOffset(24, 24)) end
	o.nom = K.texte(c.p, { Text = nomCaisse(i), TextSize = une and 40 or 26, TextColor3 = C.texte, TextXAlignment = GAUCHE, TextWrapped = false,
		epais = 3, ajuste = 6 })
	o.nom.ZIndex = 2
	if une then
		o.desc = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 22, TextColor3 = C.texte2, TextWrapped = true, Text = FR and (f.desc or "") or (f.descEN or f.desc or ""),
			TextXAlignment = GAUCHE, TextYAlignment = Enum.TextYAlignment.Top, TextScaled = true }, c.p)
		inst("UITextSizeConstraint", { MaxTextSize = 22, MinTextSize = 15 }, o.desc)
	end
	o.bt = bouton(c.p, C.magenta, UDim2.fromOffset(300, une and 82 or 76), UDim2.new(), nil, une and 26 or 24)
	-- le PRIX achète (la fenêtre de Roblox confirme toujours) ; la caisse elle-même ouvre sa fiche, en grand
	o.bt.b.Activated:Connect(function() acheter(o.a) end)
	c.b.Activated:Connect(function() Boutique.pop(o) end)
	return o
end
local function placerCaisse(o: any, w: number, h: number)
	local c = o.c
	c.boite.Size = UDim2.fromOffset(w, h)
	if o.une then
		local iw = math.min(math.floor(w * 0.5), 480)
		local ih = math.floor(iw * RATIO)
		o.v.cadre.Size = UDim2.fromOffset(iw, ih)
		o.v.cadre.Position = UDim2.fromOffset(22, math.floor((h - ih) / 2) + 18)
		local x0 = 22 + iw + 34
		local rw = w - x0 - 28
		o.rare.Position = UDim2.fromOffset(x0, 34)
		o.nom.Position, o.nom.Size = UDim2.fromOffset(x0, 80), UDim2.fromOffset(rw, 46)
		o.desc.Position, o.desc.Size = UDim2.fromOffset(x0, 136), UDim2.fromOffset(rw, h - 136 - 126)
		o.bt.boite.Size = UDim2.fromOffset(math.min(rw, 340), 82)
		o.bt.boite.Position, o.bt.boite.AnchorPoint = UDim2.new(1, -28, 1, -30), Vector2.new(1, 1)
	else
		local iw = w - 32
		local ih = math.floor(iw * RATIO)
		o.rare.Position = UDim2.fromOffset(18, 20)
		o.v.cadre.Size = UDim2.fromOffset(iw, ih)
		o.v.cadre.Position = UDim2.fromOffset(16, 46)
		o.nom.Position, o.nom.Size = UDim2.fromOffset(18, 46 + ih + 10), UDim2.fromOffset(w - 36, 32)
		o.bt.boite.Size = UDim2.fromOffset(w - 36, 76)
		o.bt.boite.Position, o.bt.boite.AnchorPoint = UDim2.new(0, 16, 1, -22), Vector2.new(0, 1)
	end
end
local function creerCaisses(page: Instance): Frame
	local s = inst("Frame", { Name = "Caisses", BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, 100) }, page)
	entete(s, tr("CAISSES LEGENDAIRES", "LEGENDARY CARS"), tr("Achat unique, à toi pour toujours. Purement cosmétique : la vitesse vient du moteur.",
		"One-time purchase, yours forever. Purely cosmetic: speed comes from the engine."), C.magenta)
	CA.une = creerCaisse(s, UNE, true)
	for rang, i in LISTE do CA.cartes[rang] = creerCaisse(s, i, false) end
	CA.cadre = s
	return s
end
local function placerCaisses(cw: number): number
	local y = 104
	placerCaisse(CA.une, cw, 340)
	CA.une.c.boite.Position = UDim2.fromOffset(0, y)
	y += 340 + 30
	local gap = 26
	local cols = math.max(2, math.floor((cw + gap) / (370 + gap)))
	local w = math.floor((cw - gap * (cols - 1)) / cols)
	local h = math.floor((w - 32) * RATIO) + 46 + 10 + 32 + 22 + 76 + 22
	for rang, o in CA.cartes do
		local col, lig = (rang - 1) % cols, (rang - 1) // cols
		placerCaisse(o, w, h)
		o.c.boite.Position = UDim2.fromOffset(col * (w + gap), y + lig * (h + gap))
	end
	local lignes = math.ceil(#CA.cartes / cols)
	return y + lignes * h + math.max(0, lignes - 1) * gap
end
local function majCaisses()
	for _, o in { CA.une, table.unpack(CA.cartes) } do
		o.bt.regler(etatDe(o.a, tr("A TOI", "YOURS")))
		-- (à soi : la carte passe au vert — elle t'attend au garage)
		local moi = o.bt.etat == "possede"
		local col = moi and C.vert or (o.une and C.magenta or o.rar[3])
		if o.c.trait.Color ~= col then o.c.trait.Color, o.c.bande.BackgroundColor3 = col, col end
	end
end

-- ════════ 3. ARGENT — cinq packs de $ (Config.REVENUS.argent — les montants se règlent là-bas) ════════
-- Le montant en grand et en vert, une pile de pièces qui grandit avec le pack, le prix sur le bouton. « BONUS +x % » : le $ par Robux
-- du pack comparé à celui du plus petit, sur les prix que Roblox rend pour CE joueur ; « MEILLEURE AFFAIRE » : le pack qui donne le
-- plus de $ par Robux — seulement si TOUS les prix sont connus et qu'il bat le suivant d'au moins 5 %.
local AR: any = { cartes = {} }
local MENTHE = C.menthe
local function creerArgent(page: Instance): Frame
	local s = inst("Frame", { Name = "Argent", BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, 100) }, page)
	entete(s, tr("PACKS D'ARGENT", "CASH PACKS"), tr("Versé sur ton compte tout de suite : de quoi t'offrir une caisse au garage.",
		"Paid into your account right away: enough to treat yourself to a car in the garage."), MENTHE)
	for k, a in R.argent do
		local c = carte(s, MENTHE, true)
		c.grad.Color = ColorSequence.new(Color3.fromRGB(24, 64, 54), Color3.fromRGB(12, 16, 32))
		local o: any = { k = k, c = c, a = ART["pack" .. k], v = a.v }
		o.pile = pile(c.p, "piece", OR1, k)
		o.montant = K.texte(c.p, { Text = Hud.compte(a.v), TextSize = 30, TextColor3 = MENTHE, Size = UDim2.new(1, -24, 0, 36), TextWrapped = false, epais = 3, ajuste = 4 })
		o.bonus = puce(c.p, "", MENTHE, 16, UDim2.new(0.5, 0, 0, 0), Vector2.new(0.5, 0))
		o.bonus.Visible = false
		o.meilleur = puce(c.p, tr("MEILLEURE AFFAIRE", "BEST VALUE"), OR1, 15, UDim2.new(0.5, 0, 0, 0), Vector2.new(0.5, 0.5))
		o.meilleur.ZIndex = 10
		o.meilleur.Visible = false
		o.bt = bouton(c.p, MENTHE, UDim2.fromOffset(200, 76), UDim2.new(), nil, 24)
		o.bt.b.Activated:Connect(function() acheter(o.a) end)
		c.b.Activated:Connect(function() acheter(o.a) end)
		AR.cartes[k] = o
	end
	AR.cadre = s
	return s
end
local function placerArgent(cw: number): number
	local y = 104
	local gap = 22
	local n = #AR.cartes
	local cols = (cw >= 1180) and n or math.min(n, 3)
	local w = math.floor((cw - gap * (cols - 1)) / cols)
	local h = 330
	for k, o in AR.cartes do
		local col, lig = (k - 1) % cols, (k - 1) // cols
		-- (la dernière rangée, incomplète, se centre)
		local dansRang = math.min(cols, n - lig * cols)
		local x0 = math.floor((cw - (dansRang * w + (dansRang - 1) * gap)) / 2)
		o.c.boite.Size = UDim2.fromOffset(w, h)
		o.c.boite.Position = UDim2.fromOffset(x0 + col * (w + gap), y + 14 + lig * (h + gap + 14))
		o.pile.Position = UDim2.new(0.5, 0, 0, 30)
		o.montant.Position = UDim2.fromOffset(12, 152)
		o.bonus.Position = UDim2.new(0.5, 0, 0, 196)
		o.bt.boite.Size = UDim2.fromOffset(w - 32, 76)
		o.bt.boite.Position, o.bt.boite.AnchorPoint = UDim2.new(0, 16, 1, -20), Vector2.new(0, 1)
	end
	local lignes = math.ceil(n / cols)
	return y + 14 + lignes * h + (lignes - 1) * (gap + 14)
end
local function majArgent()
	-- le $ par Robux de chaque pack, sur les VRAIS prix seulement
	local r: { [number]: number } = {}
	local tous = true
	for k, o in AR.cartes do
		o.bt.regler(etatDe(o.a))
		local p, vrai = prixArt(o.a)
		if vrai and p and p > 0 then r[k] = o.v / p else tous = false end
	end
	local best, r1, r2 = nil, 0, 0
	for k, x in r do
		if x > r1 then best, r1, r2 = k, x, r1 elseif x > r2 then r2 = x end
	end
	for k, o in AR.cartes do
		local pct = (r[1] and r[k] and k > 1) and math.floor((r[k] / r[1] - 1) * 100 + 0.5) or 0
		o.bonus.Visible = pct >= 5
		if pct >= 5 then ecrire(o.bonus:FindFirstChildOfClass("TextLabel"), "BONUS +" .. pct .. tr(" %", "%")) end
		o.meilleur.Visible = tous and best == k and r2 > 0 and r1 >= r2 * 1.05
	end
end

-- ════════ 4. AVANTAGES — les passes, la roue, les cœurs ════════
local AV: any = { passes = {}, coeurs = {} }
local function creerPasse(parent: Instance, cle: string): any
	local d = PASSES[cle] or { ico = "etoile", c = C.magenta, titre = { "3 TOURS DE ROUE", "3 WHEEL SPINS" },
		txt = { "Trois tours de LA ROUE : argent, habillages, caisses exclusives. Les chances s'affichent dans LA ROUE.",
			"Three spins of THE WHEEL at once: cash, skins, exclusive cars. The odds are shown in THE WHEEL." } }
	local roue = cle == "tours3"
	local col = roue and C.magenta or d.c
	local c = carte(parent, col, true)
	local o: any = { cle = cle, c = c, a = ART[cle], roue = roue }
	local ico = roue and "..#####..|.#..#..#.|#.#.#.#.#|#..###..#|#########|#..###..#|#.#.#.#.#|.#..#..#.|..#####.." or d.ico -- (la roue de l'accueil)
	K.iconeRelief(c.p, ico, 8, col, UDim2.fromOffset(22, 26))
	o.tag = puce(c.p, roue and "x3" or tr("A VIE", "FOREVER"), col, 16, UDim2.new(1, -20, 0, 26), Vector2.new(1, 0))
	o.nom = K.texte(c.p, { italique = true, Text = tr(d.titre[1], d.titre[2]), TextSize = 30, TextColor3 = C.texte, Position = UDim2.fromOffset(20, 112),
		TextXAlignment = GAUCHE, TextWrapped = false, epais = 3, ajuste = 6 })
	o.txt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 20, TextColor3 = C.texte2, TextWrapped = true, Text = tr(d.txt[1], d.txt[2]),
		TextXAlignment = GAUCHE, TextYAlignment = Enum.TextYAlignment.Top, Position = UDim2.fromOffset(20, 156), TextScaled = true }, c.p)
	inst("UITextSizeConstraint", { MaxTextSize = 20, MinTextSize = 14 }, o.txt)
	o.bt = bouton(c.p, col, UDim2.fromOffset(200, 76), UDim2.new(), nil, 24)
	o.bt.b.Activated:Connect(function() acheter(o.a) end)
	c.b.Activated:Connect(function() acheter(o.a) end)
	return o
end
local NB_COEURS = { "coeur", "coeur5", "coeur15" }
local function creerAvantages(page: Instance): Frame
	local s = inst("Frame", { Name = "Avantages", BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, 100) }, page)
	entete(s, tr("AVANTAGES A VIE", "LIFETIME PERKS"), tr("Achetés une fois, à toi pour toujours.", "Buy once, yours forever."), C.cyan)
	for _, cle in { "argent2", "nitroInfini", "vip", "tours3" } do
		if ART[cle] then table.insert(AV.passes, creerPasse(s, cle)) end
	end
	-- les CŒURS : leur en-tête dit ce qu'est un cœur et combien on en a (la police du texte sait dessiner « ♥ », pas la police pixel)
	AV.coeursTete, AV.stock = entete(s, tr("COEURS", "HEARTS"), "", C.rouge)
	for j, q in NB_COEURS do
		if ART[q] then
			local c = carte(s, C.rouge, true)
			c.grad.Color = ColorSequence.new(Color3.fromRGB(78, 22, 50), Color3.fromRGB(14, 10, 32))
			local n = R.coeursPar[q] or 1
			local o: any = { q = q, n = n, c = c, a = ART[q] }
			o.pile = pile(c.p, "coeur", C.rouge, ({ 1, 3, 5 })[j] or 1)
			o.nom = K.texte(c.p, { Text = n .. tr((n > 1) and " COEURS" or " COEUR", (n > 1) and " HEARTS" or " HEART"), TextSize = 28, TextColor3 = C.rouge,
				Size = UDim2.new(1, -24, 0, 34), TextWrapped = false, epais = 3, ajuste = 4 })
			o.bonus = puce(c.p, "", C.rouge, 16, UDim2.new(0.5, 0, 0, 0), Vector2.new(0.5, 0))
			o.bonus.Visible = false
			o.bt = bouton(c.p, C.rouge, UDim2.fromOffset(200, 76), UDim2.new(), nil, 24)
			o.bt.b.Activated:Connect(function() acheter(o.a) end)
			c.b.Activated:Connect(function() acheter(o.a) end)
			table.insert(AV.coeurs, o)
		end
	end
	AV.cadre = s
	return s
end
-- une carte d'avantage se montre ? (VIP, 3 TOURS : seulement s'ils existent ; 3 TOURS : seulement là où le hasard payant est permis)
local OF: any = { hasardOK = false, n = 0 }
local function passeVisible(o: any): boolean
	if o.cle == "vip" or o.roue then
		if not vendable(o.a) then return false end
		if o.roue and not OF.hasardOK then return false end
	end
	return true
end
local function placerAvantages(cw: number): number
	local y = 104
	local vis = {}
	for _, o in AV.passes do
		o.c.boite.Visible = passeVisible(o)
		if o.c.boite.Visible then table.insert(vis, o) end
	end
	local gap = 22
	local n = math.max(1, #vis)
	local cols = n
	if (cw - gap * (n - 1)) / n < 230 then cols = math.ceil(n / 2) end
	local w = math.floor((cw - gap * (cols - 1)) / cols)
	for j, o in vis do
		local col, lig = (j - 1) % cols, (j - 1) // cols
		o.c.boite.Size = UDim2.fromOffset(w, 330)
		o.c.boite.Position = UDim2.fromOffset(col * (w + gap), y + lig * (330 + gap))
		o.nom.Size = UDim2.fromOffset(w - 40, 36)
		o.txt.Size = UDim2.fromOffset(w - 40, 64)
		o.bt.boite.Size = UDim2.fromOffset(w - 32, 76)
		o.bt.boite.Position, o.bt.boite.AnchorPoint = UDim2.new(0, 16, 1, -20), Vector2.new(0, 1)
	end
	local lignes = math.ceil(n / cols)
	y += lignes * 330 + (lignes - 1) * gap + 48
	AV.coeursTete.Position = UDim2.fromOffset(0, y)
	y += 104
	local m = #AV.coeurs
	local wc = math.floor((cw - gap * (m - 1)) / math.max(1, m))
	for j, o in AV.coeurs do
		o.c.boite.Size = UDim2.fromOffset(wc, 330)
		o.c.boite.Position = UDim2.fromOffset((j - 1) * (wc + gap), y)
		o.pile.Position = UDim2.new(0.5, 0, 0, 26)
		o.nom.Position = UDim2.fromOffset(12, 146)
		o.bonus.Position = UDim2.new(0.5, 0, 0, 190)
		o.bt.boite.Size = UDim2.fromOffset(wc - 32, 76)
		o.bt.boite.Position, o.bt.boite.AnchorPoint = UDim2.new(0, 16, 1, -20), Vector2.new(0, 1)
	end
	return y + 330
end
local function majAvantages()
	for _, o in AV.passes do
		local e, t = etatDe(o.a, tr("ACTIF", "ACTIVE"))
		-- (la roue : on l'achète DANS la roue — le bouton y mène, et dit son prix)
		if o.roue and e == "acheter" then t = tr("LA ROUE", "THE WHEEL") .. "   " .. t end
		o.bt.regler(e, t)
		local col = (e == "possede") and C.vert or (o.roue and C.magenta or PASSES[o.cle].c)
		if o.c.trait.Color ~= col then o.c.trait.Color, o.c.bande.BackgroundColor3 = col, col end
	end
	local nC = Revenus.coeurs()
	if AV.stock then
		ecrire(AV.stock, tr("Un cœur = une vie : quand ta caisse explose, tu repars là où tu étais.   Tu en as : ♥ " .. nC,
			"One heart = one life: when your car blows up, you carry on right where you were.   You have: ♥ " .. nC))
	end
	-- le BONUS des packs de cœurs : les cœurs par Robux, comparés au cœur seul (sur les vrais prix)
	local p1, v1 = nil, false
	if ART.coeur then p1, v1 = prixArt(ART.coeur) end
	for _, o in AV.coeurs do
		o.bt.regler(etatDe(o.a))
		local p, vrai = prixArt(o.a)
		local pct = (v1 and vrai and p1 and p and p > 0 and o.n > 1) and math.floor(((o.n / p) / (1 / p1) - 1) * 100 + 0.5) or 0
		o.bonus.Visible = pct >= 5
		if pct >= 5 then ecrire(o.bonus:FindFirstChildOfClass("TextLabel"), "BONUS +" .. pct .. tr(" %", "%")) end
	end
end

-- ════════ LA FENÊTRE D'ACHAT D'UNE CAISSE (shopPop du web ; Sacha, 1/10 : « il faut que la fenêtre de la voiture sorte de la page
-- en mode pop-up pour valider la transaction ») ════════
-- Toucher une caisse la fait SORTIR de la page : sa carte quitte sa place (un trou reste), grandit et vient se poser au centre sur
-- un voile — la vignette en grand qui flotte sur son plateau, la rareté, le nom, sa phrase, ce qu'elle est (cosmétique), UN lingot
-- d'or (ACHETER) et FERMER. Fermer (FERMER, le voile, RETOUR) la renvoie À SA PLACE par le même chemin. Déjà à soi : une plaque
-- verte A TOI ; pas encore en vente : une plaque terne BIENTOT — jamais un lingot qui ne vend rien.
local SP: any = { on = false }
local FW, FH = 760, 628
local function creerFenetre(g: Instance)
	local v = inst("Frame", { Name = "Fenetre", BackgroundColor3 = Color3.fromRGB(6, 4, 16), BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1),
		Visible = false, Active = true, ZIndex = 40 }, g)
	local fond = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, v)
	fond.Activated:Connect(function() Boutique.popFerme() end) -- (le VOILE ferme)
	local c = inst("Frame", { Name = "Carte", BackgroundColor3 = BLANC, BorderSizePixel = 0, Size = UDim2.fromOffset(FW, FH), AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.5), Active = true, ZIndex = 2 }, v)
	K.degrade(c, Color3.fromRGB(58, 26, 92), Color3.fromRGB(18, 10, 38), 90)
	SP.trait = inst("UIStroke", { Color = OR1, Thickness = 3, ApplyStrokeMode = BORD }, c)
	SP.bande = inst("Frame", { BackgroundColor3 = OR1, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 6) }, c)
	SP.echelle = inst("UIScale", {}, c)
	SP.rare, SP.rareT = puce(c, "", C.encre, 17, UDim2.fromOffset(28, 26), nil, OR1, OR1)
	-- la vignette en grand, sur son plateau (le cadre flotte : il monte et descend doucement tant que la fenêtre est ouverte)
	SP.scene = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(504, 280), Position = UDim2.new(0.5, 0, 0, 50), AnchorPoint = Vector2.new(0.5, 0) }, c)
	SP.halo, SP.filet = plateau(SP.scene, OR1)
	SP.image = inst("ImageLabel", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), ScaleType = Enum.ScaleType.Fit,
		ResampleMode = Enum.ResamplerMode.Pixelated, ZIndex = 2 }, SP.scene)
	SP.nom = K.texte(c, { Text = "", TextSize = 42, TextColor3 = C.texte, Size = UDim2.new(1, -56, 0, 50), Position = UDim2.fromOffset(28, 336),
		TextXAlignment = GAUCHE, TextWrapped = false, epais = 4, ajuste = 6 })
	SP.desc = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 22, TextColor3 = C.texte2, TextWrapped = true, Text = "",
		TextXAlignment = GAUCHE, TextYAlignment = Enum.TextYAlignment.Top, Size = UDim2.new(1, -56, 0, 52), Position = UDim2.fromOffset(28, 390), TextScaled = true }, c)
	inst("UITextSizeConstraint", { MaxTextSize = 22, MinTextSize = 15 }, SP.desc)
	SP.note = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 19, TextColor3 = C.terne, TextWrapped = true, Text = "",
		TextXAlignment = GAUCHE, TextYAlignment = Enum.TextYAlignment.Top, Size = UDim2.new(1, -56, 0, 44), Position = UDim2.fromOffset(28, 448), TextScaled = true }, c)
	inst("UITextSizeConstraint", { MaxTextSize = 19, MinTextSize = 14 }, SP.note)
	-- UN lingot d'or (ACHETER + le prix) — ou, à la même place, la plaque A TOI / BIENTOT ; FERMER en cyan à côté
	SP.oui = K.lingot(c, tr("ACHETER", "BUY"), UDim2.new(0.58, -34, 0, 92), UDim2.new(0, 28, 1, -26), Vector2.new(0, 1), 34)
	K.cible(SP.oui, 6)
	SP.etat = bouton(c, C.terne, UDim2.new(0.58, -34, 0, 84), UDim2.new(0, 28, 1, -30), Vector2.new(0, 1), 24)
	SP.non = K.tuile(c, tr("FERMER", "CLOSE"), C.cyan, UDim2.new(0.42, -30, 0, 84), UDim2.new(1, -28, 1, -30), Vector2.new(1, 1), 24, "croix", "g")
	K.cible(SP.non, 6)
	SP.acheter = function()
		if not SP.on or SP.anim then return end
		local a = SP.o and SP.o.a
		if not a then return end
		if possede(a) then
			Hud.toast(tr("DEJA A TOI : ELLE T'ATTEND AU GARAGE", "ALREADY YOURS: IT'S IN YOUR GARAGE"), C.vert, "coche")
			return
		end
		if vendable(a) then
			acheter(a)
			SP.note.Text = tr("Confirme dans la fenêtre de Roblox : la caisse arrive aussitôt dans ton garage.",
				"Confirm in Roblox's window: the car lands in your garage right away.")
			SP.note.TextColor3 = C.texte2
			return
		end
		-- pas encore en vente : on le DIT, dans la fenêtre, et rien n'est donné (un refus se sent : la carte tremble)
		Sons.vrai("uiRefus", nil, nil, "tap", 0.8)
		Hud.vibre(10)
		SP.note.Text = tr("Cette caisse arrive très bientôt en boutique.", "This car is coming to the shop very soon.")
		SP.note.TextColor3 = OR1
		task.spawn(function()
			for k = 1, 6 do
				c.Position = UDim2.new(0.5, ((k % 2 == 0) and 1 or -1) * (7 - k), 0.5, 0)
				task.wait(0.035)
			end
			if not SP.anim then c.Position = UDim2.fromScale(0.5, 0.5) end
		end)
	end
	SP.oui.Activated:Connect(SP.acheter)
	SP.etat.b.Activated:Connect(SP.acheter)
	SP.non.Activated:Connect(function() Boutique.popFerme() end)
	-- l'état de la fenêtre, tenu à jour tant qu'elle est ouverte : le prix qui arrive de Roblox, la caisse qui vient d'être achetée
	function SP.maj()
		local a = SP.o and SP.o.a
		if not a then return end
		local e, t = etatDe(a, tr("A TOI : AU GARAGE", "YOURS: IN THE GARAGE"))
		SP.oui.Parent.Parent.Visible = e == "acheter"
		SP.etat.boite.Visible = e ~= "acheter"
		if e == "acheter" then
			ecrire(SP.oui, tr("ACHETER", "BUY") .. ((string.sub(t, 1, 2) == "R$") and ("  " .. t) or ""))
		else
			SP.etat.regler(e, t)
		end
		if e == "possede" and SP.note.TextColor3 ~= C.vert then
			SP.note.Text = tr("Elle t'attend au garage : équipe-la et roule.", "It's waiting in your garage: equip it and drive.")
			SP.note.TextColor3 = C.vert
		end
	end
	SP.voile, SP.carte = v, c
	SP.trou = inst("Frame", { Name = "Trou", BackgroundColor3 = Color3.fromRGB(10, 7, 22), BorderSizePixel = 0, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 20 })
	inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = BORD }, SP.trou)
end
-- l'écart entre la carte (à l'écran) et la fenêtre posée au centre, en unités de l'interface : d'où elle part, où elle rentre
local function viser(src: GuiObject): (UDim2, number)
	local k = math.max(0.1, SP.carte.AbsoluteSize.X / (FW * SP.echelle.Scale)) -- (l'échelle de la racine de l'interface)
	local vC = SP.voile.AbsolutePosition + SP.voile.AbsoluteSize / 2
	local sC = src.AbsolutePosition + src.AbsoluteSize / 2
	local d = (sC - vC) / k
	return UDim2.new(0.5, d.X, 0.5, d.Y), math.min(1, src.AbsoluteSize.X / k / FW)
end
local TI = TweenInfo.new(0.42, Enum.EasingStyle.Quint, Enum.EasingDirection.Out)
local FLOTTE = TweenInfo.new(1.6, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true)
function Boutique.pop(o: any)
	if SP.on or not SP.carte or not o then return end
	local f = Catalogue[o.i]
	if not f then return end
	local src = o.c.boite
	SP.on, SP.anim, SP.src, SP.o = true, true, src, o
	local r = o.rar
	SP.rareT.Text, SP.rareT.TextColor3 = tr(r[1], r[2]), r[3]
	SP.rare.UIStroke.Color = r[3]
	SP.trait.Color, SP.bande.BackgroundColor3, SP.halo.BackgroundColor3, SP.filet.BackgroundColor3 = r[3], r[3], r[3], r[3]
	SP.nom.Text = nomCaisse(o.i)
	SP.desc.Text = FR and (f.desc or "") or (f.descEN or f.desc or "")
	SP.note.Text = tr("Achat unique, avec tes Robux : à toi pour toujours. Purement cosmétique — la vitesse vient du moteur.",
		"One-time purchase with your Robux: yours forever. Purely cosmetic — speed comes from the engine.")
	SP.note.TextColor3 = C.terne
	SP.image.ImageContent = o.v.ei and Content.fromObject(o.v.ei) or Content.none
	SP.maj()
	-- la vignette FLOTTE au-dessus de son plateau
	SP.image.Position = UDim2.fromOffset(0, 4)
	SP.flotte = TweenService:Create(SP.image, FLOTTE, { Position = UDim2.fromOffset(0, -6) })
	SP.flotte:Play()
	-- LA CARTE SORT DE LA PAGE : posée au centre, puis partie de la place de la carte
	SP.voile.Visible = true
	SP.voile.BackgroundTransparency = 1
	SP.echelle.Scale = 1
	SP.carte.Position = UDim2.fromScale(0.5, 0.5)
	local pos, s = viser(src)
	SP.carte.Position, SP.echelle.Scale = pos, s
	SP.trou.Parent = src
	SP.trou.Visible = true
	Sons.vrai("uiModale", nil, nil, "tap", 1.1, 0.5)
	Hud.vibre(8)
	TweenService:Create(SP.voile, TI, { BackgroundTransparency = 0.3 }):Play()
	TweenService:Create(SP.echelle, TI, { Scale = 1 }):Play()
	local tw = TweenService:Create(SP.carte, TI, { Position = UDim2.fromScale(0.5, 0.5) })
	tw.Completed:Once(function() SP.anim = false end)
	tw:Play()
end
-- elle rentre à sa place, par le même chemin (vite = sans le trajet : la boutique se ferme)
local function rentre()
	if SP.flotte then
		SP.flotte:Cancel()
		SP.flotte = nil
	end
	SP.trou.Visible = false
	SP.voile.Visible = false
	SP.on, SP.anim, SP.o = false, false, nil
end
function Boutique.popFerme(vite: boolean?)
	if not SP.on then return end
	if vite then
		rentre()
		return
	end
	if SP.anim then return end
	SP.anim = true
	Sons.vrai("uiFerme", nil, nil, "tap", 0.9, 0.4)
	local pos, s = viser(SP.src)
	local ti = TweenInfo.new(0.32, Enum.EasingStyle.Quint, Enum.EasingDirection.InOut)
	TweenService:Create(SP.voile, ti, { BackgroundTransparency = 1 }):Play()
	TweenService:Create(SP.echelle, ti, { Scale = s }):Play()
	local tw = TweenService:Create(SP.carte, ti, { Position = pos })
	tw.Completed:Once(rentre)
	tw:Play()
end

-- ════════ LA PAGE, LE RAIL, LA BOURSE ════════
local SECTIONS = {
	{ cle = "offres", fr = "OFFRES", en = "DEALS", c = C.orange, ico = "etoile" },
	{ cle = "caisses", fr = "CAISSES", en = "CARS", c = C.magenta, ico = "voiture" },
	{ cle = "argent", fr = "ARGENT", en = "CASH", c = C.menthe, ico = "piece" },
	{ cle = "avantages", fr = "AVANTAGES", en = "PERKS", c = C.cyan, ico = "eclair" },
}
local ECART_SECTIONS = 64
-- l'échelle entre les unités de l'interface et la position du défilement (CanvasPosition se compte en pixels d'ÉCRAN : la racine
-- est agrandie, la page avec elle)
local function kPage(): number
	local h = U.page.CanvasSize.Y.Offset
	return (h > 0) and (U.page.AbsoluteCanvasSize.Y / h) or 1
end
local function sectionActive(): string?
	local y = U.page.CanvasPosition.Y / kPage()
	local maxY = (U.page.AbsoluteCanvasSize.Y - U.page.AbsoluteWindowSize.Y) / kPage()
	local act = nil
	for _, s in U.sections do
		if s.y then
			if not act then act = s.cle end
			if s.y <= y + 120 then act = s.cle end
		end
	end
	-- (tout en bas : la dernière section, même courte, s'allume)
	if maxY > 0 and y >= maxY - 4 then
		for _, s in U.sections do if s.y then act = s.cle end end
	end
	return act
end
local function allumerOnglet(cle: string?)
	if U.ongletOn == cle then return end
	U.ongletOn = cle
	for _, o in U.onglets do K.allumer(o.b, o.cle == cle) end
end
local function mettreEnPage()
	if not U.page then return end
	local ech = Hud.racine and Hud.racine:FindFirstChildOfClass("UIScale")
	local k = ech and ech.Scale or 1
	local cw = math.floor(U.page.AbsoluteSize.X / math.max(k, 0.01)) - 22 -- (la barre de défilement)
	if cw < 400 then return end
	U.cw = cw
	local y = 4
	for _, s in U.sections do
		local vis = s.visible()
		s.cadre.Visible = vis
		if vis then
			s.cadre.Position = UDim2.fromOffset(0, y)
			local h = s.placer(cw)
			s.cadre.Size = UDim2.fromOffset(cw, h)
			s.y = y
			y += h + ECART_SECTIONS
		else
			s.y = nil
		end
	end
	U.page.CanvasSize = UDim2.fromOffset(0, y + 20)
	-- le RAIL : les onglets des sections montrées, l'un sous l'autre
	local j = 0
	for _, o in U.onglets do
		local s = U.parCle[o.cle]
		local vis = s.y ~= nil
		o.boite.Visible = vis
		if vis then
			o.boite.Position = UDim2.fromOffset(60, 112 + j * 108)
			j += 1
		end
	end
	U.ongletOn = nil
	allumerOnglet(sectionActive())
end
-- un onglet fait GLISSER la page jusqu'à sa section (instant : à l'ouverture)
local GLISSE = TweenInfo.new(0.38, Enum.EasingStyle.Quint, Enum.EasingDirection.Out)
local function allerA(cle: string, instant: boolean?)
	local s = U.parCle[cle]
	if not s or not s.y then return end
	local kp = kPage()
	local maxY = math.max(0, U.page.AbsoluteCanvasSize.Y - U.page.AbsoluteWindowSize.Y)
	local cible = Vector2.new(0, math.clamp(math.floor((s.y - 4) * kp), 0, maxY))
	U.visee = cle
	allumerOnglet(cle)
	if U.glisse then U.glisse:Cancel() end
	if instant then
		U.page.CanvasPosition = cible
		U.visee = nil
		return
	end
	U.glisse = TweenService:Create(U.page, GLISSE, { CanvasPosition = cible })
	U.glisse.Completed:Once(function() U.visee = nil end)
	U.glisse:Play()
end
-- LA BOURSE (en haut à droite : ce qu'on a) — le compte et les cœurs
local function creerBourse(g: Instance)
	local b = inst("Frame", { Name = "Bourse", BackgroundTransparency = 1, AnchorPoint = Vector2.new(1, 0), Position = UDim2.new(1, -40, 0, 26),
		Size = UDim2.fromOffset(700, 52) }, g)
	inst("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, HorizontalAlignment = Enum.HorizontalAlignment.Right,
		VerticalAlignment = Enum.VerticalAlignment.Center, Padding = UDim.new(0, 18), SortOrder = Enum.SortOrder.LayoutOrder }, b)
	local function pastille(ordre: number, ico: string, col: Color3): TextLabel
		local f = inst("Frame", { BackgroundColor3 = C.encre, BackgroundTransparency = 0.25, BorderSizePixel = 0, Size = UDim2.fromOffset(0, 52),
			AutomaticSize = Enum.AutomaticSize.X, LayoutOrder = ordre }, b)
		inst("UIStroke", { Color = col, Thickness = 2, ApplyStrokeMode = BORD }, f)
		inst("UIPadding", { PaddingLeft = UDim.new(0, 12), PaddingRight = UDim.new(0, 16) }, f)
		inst("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, VerticalAlignment = Enum.VerticalAlignment.Center, Padding = UDim.new(0, 12),
			SortOrder = Enum.SortOrder.LayoutOrder }, f)
		local ic = K.iconeRelief(f, ico, 4, col)
		ic.LayoutOrder = 1
		local t = K.texte(f, { Text = "", TextSize = 26, TextColor3 = col, Size = UDim2.fromOffset(0, 40), AutomaticSize = Enum.AutomaticSize.X, TextWrapped = false,
			epais = 3, LayoutOrder = 2 })
		return t
	end
	U.compte = pastille(1, "piece", C.menthe)
	U.nCoeurs = pastille(2, "coeur", C.rouge)
end
local function majBourse()
	ecrire(U.compte, Hud.compte(type(PR.compte) == "number" and PR.compte or 0))
	ecrire(U.nCoeurs, tostring(Revenus.coeurs()))
end

-- ════════ TOUT TENIR À JOUR (la boutique ouverte : toutes les 0,4 s) ════════
-- les prix qui arrivent de Roblox, un passe qui vient d'être acheté (ACTIF), un cœur de plus, le kit pris, une caisse achetée — et
-- la mise en page quand ce qui se montre change (le kit parti, VIP ou 3 TOURS qui apparaissent)
local function majBoutique()
	local h = choixHeros()
	if h then heros(h) end
	local sig = tostring(h)
	for _, o in AV.passes do sig ..= passeVisible(o) and "1" or "0" end
	if sig ~= U.sig then
		U.sig = sig
		HE.montre = h ~= nil
		mettreEnPage()
	end
	majHeros()
	majCaisses()
	majArgent()
	majAvantages()
	majBourse()
	if SP.on and SP.maj then SP.maj() end
end

local function creer()
	local racine = Hud.racine
	local g = inst("Frame", { Name = "Boutique", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 18, Active = true }, racine)
	U.racine = g
	-- le FOND déborde de la racine (la bande des boutons de Roblox en haut, les bords d'un téléphone couché : on ne voit pas le jeu
	-- derrière un écran plein)
	local fond = inst("Frame", { Name = "Fond", BackgroundColor3 = BLANC, BorderSizePixel = 0, Size = UDim2.new(1, 800, 1, 800), Position = UDim2.fromOffset(-400, -400),
		Active = true, ZIndex = 0 }, g)
	K.degrade(fond, Color3.fromRGB(56, 16, 70), Color3.fromRGB(10, 7, 24), 80)
	-- ── le TITRE et sa signature (on LIT en haut) ──
	K.texte(g, { italique = true, Text = tr("BOUTIQUE", "SHOP"), TextSize = 52, TextColor3 = C.texte, Size = UDim2.fromOffset(600, 58), Position = UDim2.fromOffset(58, 20),
		TextXAlignment = GAUCHE, TextWrapped = false, epais = 4 })
	for i, c in { C.magenta, C.cyan, C.or_ } do
		inst("Frame", { BackgroundColor3 = c, BorderSizePixel = 0, Size = UDim2.fromOffset(i == 1 and 82 or 38, 7), Position = UDim2.fromOffset(64 + (i == 1 and 0 or (i == 2 and 92 or 140)), 82) }, g)
	end
	creerBourse(g)
	-- ── LA PAGE : tout défile d'un seul geste, à droite du rail ──
	U.page = inst("ScrollingFrame", { Name = "Page", BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.new(1, -440, 1, -106),
		Position = UDim2.fromOffset(400, 106), CanvasSize = UDim2.new(), ScrollingDirection = Enum.ScrollingDirection.Y, ScrollBarThickness = 8,
		ScrollBarImageColor3 = C.terne, VerticalScrollBarInset = Enum.ScrollBarInset.Always }, g)
	U.parCle = {}
	local createurs = {
		offres = { creerHeros, placerHeros, function() return HE.montre == true end },
		caisses = { creerCaisses, placerCaisses },
		argent = { creerArgent, placerArgent },
		avantages = { creerAvantages, placerAvantages },
	}
	for _, d in SECTIONS do
		local f = createurs[d.cle]
		local s = { cle = d.cle, cadre = f[1](U.page), placer = f[2], visible = f[3] or function() return true end }
		table.insert(U.sections, s)
		U.parCle[d.cle] = s
	end
	-- ── LE RAIL : les onglets, sous le pouce gauche ──
	for _, d in SECTIONS do
		local b = K.tuile(g, tr(d.fr, d.en), d.c, UDim2.fromOffset(290, 86), UDim2.fromOffset(60, 112), nil, 22, d.ico, "g")
		K.cible(b, 5)
		local o = { cle = d.cle, b = b, boite = (b.Parent :: Instance).Parent }
		b.Activated:Connect(function() allerA(d.cle) end)
		table.insert(U.onglets, o)
	end
	-- l'onglet allumé suit la page qu'on fait défiler au doigt (sauf pendant un glissé commandé par un onglet)
	U.page:GetPropertyChangedSignal("CanvasPosition"):Connect(function()
		if not U.visee then allumerOnglet(sectionActive()) end
	end)
	U.page:GetPropertyChangedSignal("AbsoluteSize"):Connect(mettreEnPage)
	-- ── RETOUR, en bas à gauche (sous le pouce, jamais en haut : la charte) — au pied du rail, jamais sur la page ──
	U.btRetour = K.boutonRetour(g)
	U.btRetour.Activated:Connect(function()
		if SP.on then Boutique.popFerme() else Boutique.fermer() end -- (la fenêtre ouverte se ferme d'abord)
	end)
	creerFenetre(g)
end

function Boutique.init(c: any)
	ctx = c
	creer()
	-- le PROFIL (le compte, les caisses légendaires déjà à soi) : lu une fois, puis suivi à chaque mise à jour poussée par le serveur
	task.spawn(function()
		local ev = CC:WaitForChild("ProfilMaj", 30) :: RemoteEvent?
		if ev then
			ev.OnClientEvent:Connect(function(p)
				if type(p) == "table" then PR = p end
			end)
		end
		local fn = CC:WaitForChild("Profil", 30) :: RemoteFunction?
		if fn then
			local ok, p = pcall(function() return fn:InvokeServer() end)
			if ok and type(p) == "table" and PR.compte == nil then PR = p end
		end
	end)
	-- LE HASARD PAYANT (règle de Roblox, comme Client/Roue) : là où il est interdit, la carte 3 TOURS ne se montre pas — sans
	-- réponse de Roblox, prudence : on ne la montre pas
	task.spawn(function()
		local ok, info = pcall(function() return PolicyService:GetPolicyInfoForPlayerAsync(joueur) end)
		OF.hasardOK = ok and not (type(info) == "table" and info.ArePaidRandomItemsRestricted == true)
	end)
end

-- depuis : "menu" | "mort" | "garage" — l'écran auquel RETOUR ramène. Du garage, la boutique s'ouvre sur les CAISSES ; `caisse` (un
-- indice) : sa fenêtre d'achat s'ouvre aussitôt (la fiche du garage « EN BOUTIQUE — VOIR » peut y mener tout droit)
function Boutique.ouvrir(d: string, caisse: number?)
	if not U.racine then return end
	depuis = d
	Boutique.ouvert = true
	U.racine.Visible = true
	if d ~= "garage" then Hud.ecran("boutique") end
	U.sig = nil
	majBoutique()
	U.page.CanvasPosition = Vector2.zero
	task.defer(function()
		mettreEnPage()
		if d == "garage" or caisse then allerA("caisses", true) end
		if caisse then
			for _, o in { CA.une, table.unpack(CA.cartes) } do
				if o.i == caisse then Boutique.pop(o) end
			end
		end
	end)
	OF.n += 1
	local nOf = OF.n
	task.spawn(function()
		while Boutique.ouvert and OF.n == nOf do
			task.wait(0.4)
			if Boutique.ouvert and OF.n == nOf then majBoutique() end
		end
	end)
end

-- (banc) ouvrir la fenêtre d'une caisse (0 = la une, n = la n-ième de la grille), presser ACHETER (« oui ») ou FERMER (« non ») ;
-- « offre:coeur » (ou argent2, nitroInfini, vip, tours3, coeur5, coeur15) presse le bouton de cet article ; « kit » celui du KIT
-- DU PILOTE ; « argent:2 » celui du 2e pack d'argent ; « onglet:argent » presse un onglet du rail ; « y:900 » fait défiler la page à
-- cette hauteur (unités de l'interface) ; « offres » écrit dans la Sortie
-- l'état de chaque carte (warn : le journal du banc ne lit que les avertissements)
function Boutique.dbg(quoi: string)
	if quoi == "oui" then
		if SP.acheter then SP.acheter() end
	elseif quoi == "non" then
		Boutique.popFerme()
	elseif quoi == "kit" then
		acheter(ART.kit)
	elseif string.sub(quoi, 1, 7) == "argent:" then
		local a = ART["pack" .. (tonumber(string.sub(quoi, 8)) or 0)]
		if a then acheter(a) end
	elseif string.sub(quoi, 1, 6) == "offre:" then
		local a = ART[string.sub(quoi, 7)]
		if a then acheter(a) end
	elseif string.sub(quoi, 1, 7) == "onglet:" then
		allerA(string.sub(quoi, 8))
	elseif string.sub(quoi, 1, 2) == "y:" then
		U.page.CanvasPosition = Vector2.new(0, (tonumber(string.sub(quoi, 3)) or 0) * kPage())
	elseif quoi == "offres" then
		majBoutique()
		local t = { "heros=" .. tostring(HE.kind) .. (HE.montre and "" or "(cache)") .. " prix=" .. HE.prix.Text }
		for _, o in { CA.une, table.unpack(CA.cartes) } do table.insert(t, "c" .. o.i .. "=" .. o.bt.etat .. ":" .. o.bt.b.Text) end
		for _, o in AR.cartes do
			local bo = o.bonus.Visible and ("+" .. o.bonus:FindFirstChildOfClass("TextLabel").Text) or ""
			table.insert(t, "a" .. o.k .. "=" .. o.bt.b.Text .. bo .. (o.meilleur.Visible and "+MEILLEUR" or ""))
		end
		for _, o in AV.passes do table.insert(t, o.cle .. "=" .. (o.c.boite.Visible and "" or "(cache)") .. o.bt.etat .. ":" .. o.bt.b.Text) end
		for _, o in AV.coeurs do table.insert(t, o.q .. "=" .. o.bt.b.Text .. (o.bonus.Visible and ("+" .. o.bonus:FindFirstChildOfClass("TextLabel").Text) or "")) end
		table.insert(t, "bourse=" .. U.compte.Text .. "/" .. U.nCoeurs.Text)
		warn("[boutique] " .. table.concat(t, " | "))
	else
		local r = tonumber(quoi) or 0
		Boutique.pop((r == 0 or not CA.cartes[r]) and CA.une or CA.cartes[r])
	end
end
function Boutique.fermer()
	if not Boutique.ouvert then return end
	Boutique.ouvert = false
	Boutique.popFerme(true)
	OF.n += 1
	U.racine.Visible = false
	if ctx and ctx.retour then ctx.retour(depuis) end
end

return Boutique
