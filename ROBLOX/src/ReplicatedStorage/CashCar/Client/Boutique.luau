-- CASH CAR — LA BOUTIQUE (l'écran #mShop du jeu web) : ce qui s'achète avec de l'argent réel. La page défile, de haut en bas :
--   · LE KIT DU PILOTE (5/10, lot 2) : la carte dorée « OFFRE DE BIENVENUE » — 50 000 $, 3 cœurs, la traînée POUDRE D'OR — tant
--     qu'il n'est pas acheté (une fois par compte) ;
--   · LES OFFRES EN ROBUX (Sacha, 5/10 : « fais de ce jeu une usine à fric ») — ×2 ARGENT, NITRO INFINIE, les CŒURS (1, 5 ou 15) —
--     et VIP, 3 TOURS DE ROUE quand ils existent (les tours : seulement là où Roblox permet de vendre du hasard, et on les achète
--     dans LA ROUE, qui montre ses chances) ;
--   · L'ARGENT (5/10, lot 2) : cinq packs de $ pour le compte ;
--   · la vitrine des CAISSES LÉGENDAIRES : à gauche la caisse À LA UNE, à droite la grille — chacune s'achète UNE fois (produit de
--     Roblox ; « A TOI ! » ensuite, le garage la montre comme à soi).
-- RETOUR reste en bas à gauche. Tout prix est LU sur Roblox (Revenus.prix) — jamais écrit ici ; un numéro encore à 0 dans
-- Config.REVENUS : la carte dit BIENTOT et ne vend rien. (5/10 : plus de « −50 % » — un rabais sans prix barré réel est interdit.)
-- Les photos sont de vraies caisses 3D (Caisse.vignette) : bâties une par une à l'ouverture, RENDUES à la fermeture (le budget de
-- triangles de Roblox est compté) ; si le budget refuse, la case garde sa pastille de couleur.
local TweenService = game:GetService("TweenService")
local MarketplaceService = game:GetService("MarketplaceService")
local PolicyService = game:GetService("PolicyService")
local joueur = game:GetService("Players").LocalPlayer
local CC = script.Parent.Parent -- (le dossier CashCar : Profil, ProfilMaj — les caisses légendaires déjà à soi)
local Hud = require(script.Parent:WaitForChild("Hud"))
local Roue = require(script.Parent:WaitForChild("Roue")) -- (la carte 3 TOURS mène à LA ROUE : ses chances s'y lisent avant l'achat)
local Sons = require(script.Parent:WaitForChild("Sons"))
local Caisse = require(script.Parent.Parent:WaitForChild("Caisse"))
local Maillage = require(script.Parent:WaitForChild("Maillage"))
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Revenus = require(script.Parent:WaitForChild("Revenus")) -- (les prix lus sur Roblox, le stock de cœurs)
local Catalogue = Caisse.Catalogue
local K, C = Hud.kit, Hud.C
local inst = K.inst
local FR = Hud.FR

local Boutique = { ouvert = false }
local U: any = {}
local ctx: any = nil
local depuis = "menu"
local fileN = 0
local UNE = 9 -- la caisse à la une : le CHAT ARC-EN-CIEL
local OR1 = Color3.fromRGB(255, 215, 94)

local function tr(fr: string, en: string): string return FR and fr or en end
local RARETE = { legendaire = { "LEGENDAIRE", "LEGENDARY", Color3.fromRGB(255, 215, 94) }, epique = { "EPIQUE", "EPIC", Color3.fromRGB(199, 125, 255) },
	rare = { "RARE", "RARE", Color3.fromRGB(77, 184, 255) } }

-- la liste : tout ce qui est « premium » dans le catalogue, dans l'ordre de ses indices, la une à part
local LISTE: { number } = {}
for i = 0, 200 do
	local f = Catalogue[i]
	if f and f.cond and f.cond.k == "premium" and i ~= UNE then table.insert(LISTE, i) end
end

-- LA PHOTO d'une caisse (carPhoto du web) : trois-quarts avant, nez à gauche
local function photographier(vp: ViewportFrame, i: number, zoom: number): Model?
	local m = Caisse.vignette(i)
	if not m then return nil end
	local corps = m.PrimaryPart :: BasePart
	local az, el = 0.82, 0.27
	local dir = Vector3.new(-math.sin(az) * math.cos(el), math.sin(el), -math.cos(az) * math.cos(el))
	local projete = corps.Size.Z * math.sin(az) + corps.Size.X * math.cos(az)
	local dist = projete / 0.9 / (2 * math.tan(math.rad(12)) * zoom) + corps.Size.Z * 0.18
	local cam = Instance.new("Camera")
	cam.FieldOfView = 24
	local vise = corps.Position + Vector3.new(0, -corps.Size.Y * 0.04, 0)
	cam.CFrame = CFrame.lookAt(vise + dir * dist, vise)
	cam.Parent = vp
	vp.CurrentCamera = cam
	vp.LightDirection = (-dir * 0.5 + Vector3.new(0.5, -1, 0.2)).Unit
	m.Parent = vp
	return m
end

-- la plaque « BIENTOT » : le cadenas et le mot, cernés d'or
local function bientot(parent: Instance, pos: UDim2, ancre: Vector2?, corps: number)
	local p = inst("Frame", { BackgroundColor3 = Color3.fromRGB(16, 12, 30), BorderSizePixel = 0, Size = UDim2.fromOffset(corps * 6.4, corps * 1.9), Position = pos,
		AnchorPoint = ancre or Vector2.zero }, parent)
	inst("UIStroke", { Color = OR1, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, p)
	inst("Frame", { BackgroundColor3 = OR1, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3), Position = UDim2.new(0, 0, 1, -3) }, p)
	K.icone(p, "verrou", math.max(1, math.floor(corps / 12)), OR1, UDim2.new(0, 12, 0.5, 0), Vector2.new(0, 0.5))
	K.texte(p, { Text = tr("BIENTOT", "SOON"), TextSize = corps, TextColor3 = OR1, Size = UDim2.new(1, -40, 1, 0), Position = UDim2.fromOffset(36, 0), TextWrapped = false })
end

-- ── LES CAISSES LÉGENDAIRES EN ROBUX (5/10, lot 2) : un PRODUIT par caisse (Config.REVENUS.caisses), achat UNIQUE tenu par le
-- profil — la boutique suit le profil (Profil, puis chaque ProfilMaj) pour savoir lesquelles sont déjà à soi ──
local R = Config.REVENUS
local PR: any = { caisses = {} }
local function idDe(t: any, cle: any): number
	local id = t and t[cle]
	return (type(id) == "number" and id > 0) and id or 0
end
local function idCaisse(i: number): number return idDe(R.caisses, i) end
local function possedeCaisse(i: number): boolean
	return type(PR.caisses) == "table" and table.find(PR.caisses, i) ~= nil
end
-- le prix d'un produit (ou d'un passe), lu sur Roblox : « R$ 399 », ou "" tant qu'il n'est pas connu
local function prixTxt(id: number, passe: boolean): string
	if id <= 0 then return "" end
	local p = Revenus.prix(id, passe)
	return p and Revenus.robux(p) or ""
end
local function ecrire(t: TextLabel | TextButton, txt: string)
	if t.Text ~= txt then t.Text = txt end
end
-- LA PLAQUE D'ÉTAT d'une caisse de la vitrine (la plaque BIENTOT, devenue vivante) : BIENTOT (pas encore de numéro) · son PRIX en
-- Robux (à vendre) · A TOI ! (achetée, en vert)
local function plaqueEtat(parent: Instance, pos: UDim2, ancre: Vector2?, corps: number): any
	local p = inst("Frame", { BackgroundColor3 = Color3.fromRGB(16, 12, 30), BorderSizePixel = 0, Size = UDim2.fromOffset(corps * 6.4, corps * 1.9), Position = pos,
		AnchorPoint = ancre or Vector2.zero }, parent)
	local trait = inst("UIStroke", { Color = OR1, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, p)
	local bas = inst("Frame", { BackgroundColor3 = OR1, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 3), Position = UDim2.new(0, 0, 1, -3) }, p)
	local px = math.max(1, math.floor(corps / 12))
	local icos = {
		bientot = K.icone(p, "verrou", px, OR1, UDim2.new(0, 12, 0.5, 0), Vector2.new(0, 0.5)),
		prix = K.icone(p, "panier", px, OR1, UDim2.new(0, 12, 0.5, 0), Vector2.new(0, 0.5)),
		aToi = K.icone(p, "coche", px, C.vert, UDim2.new(0, 12, 0.5, 0), Vector2.new(0, 0.5)),
	}
	local t = K.texte(p, { Text = "", TextSize = corps, TextColor3 = OR1, Size = UDim2.new(1, -40, 1, 0), Position = UDim2.fromOffset(36, 0), TextWrapped = false })
	local o: any = { etat = "" }
	function o.regler(etat: string, txt: string)
		if o.etat ~= etat then
			o.etat = etat
			local col = (etat == "aToi") and C.vert or OR1
			for k, f in icos do f.Visible = k == etat end
			trait.Color, bas.BackgroundColor3, t.TextColor3 = col, col, col
		end
		ecrire(t, txt)
	end
	o.regler("bientot", tr("BIENTOT", "SOON"))
	return o
end
local function etatCaisse(i: number): (string, string)
	if possedeCaisse(i) then return "aToi", tr("A TOI !", "YOURS!") end
	local id = idCaisse(i)
	if id <= 0 then return "bientot", tr("BIENTOT", "SOON") end
	local p = prixTxt(id, false)
	return "prix", (p ~= "") and p or tr("ACHETER", "BUY")
end

local cases: { any } = {}
-- ════════ LA FENÊTRE D'ACHAT (shopPop, L22245 ; Sacha, 1/10 : « il faut que la fenêtre de la voiture sorte de la page en mode
-- pop-up pour valider la transaction ») ════════
-- Toucher une caisse de la vitrine la fait SORTIR de la grille : sa carte quitte sa place (un trou reste), grandit et vient se poser
-- au centre sur un voile — même photo (la caisse 3D de la case y passe : aucun maillage de plus), même nom — avec la rareté, sa
-- phrase, UN lingot d'or (ACHETER + son prix en Robux) et ANNULER. Fermer (ANNULER, le voile, RETOUR) la renvoie À SA PLACE par le
-- même chemin. (5/10, lot 2) ACHETER ouvre la fenêtre d'achat de Roblox (le produit de la caisse) ; le serveur la range au profil
-- (ProcessReceipt) et la fenêtre dit « A TOI ! ». Sans numéro dans Config.REVENUS.caisses : ACHETER le DIT (« BIENTOT DISPONIBLE »)
-- et ne donne jamais rien.
local SP: any = { on = false }
local function creerFenetre(g: Instance)
	local v = inst("Frame", { Name = "Fenetre", BackgroundColor3 = Color3.fromRGB(6, 4, 16), BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1),
		Visible = false, Active = true }, g)
	local fond = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, v)
	fond.Activated:Connect(function() Boutique.popFerme() end) -- (le VOILE ferme)
	local W, H = 620, 600
	local c = inst("Frame", { Name = "Carte", BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.fromOffset(W, H),
		AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), Active = true }, v)
	K.degrade(c, Color3.fromRGB(58, 26, 92), Color3.fromRGB(20, 12, 42), 90)
	SP.trait = inst("UIStroke", { Color = OR1, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, c)
	SP.bande = inst("Frame", { BackgroundColor3 = OR1, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 6) }, c)
	SP.echelle = inst("UIScale", {}, c)
	SP.rare = K.texte(c, { Text = "", TextSize = 22, TextColor3 = OR1, Size = UDim2.fromOffset(300, 26), Position = UDim2.fromOffset(24, 22),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	-- (5/10 : le badge « −50 % » est PARTI — une remise permanente, sans prix barré réel, est un faux rabais : interdit par Roblox)
	SP.vue = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.new(1, -40, 0, 250), Position = UDim2.fromOffset(20, 56),
		Ambient = Color3.fromRGB(104, 100, 128), LightColor = Color3.fromRGB(226, 216, 204) }, c)
	SP.pastille = inst("Frame", { BorderSizePixel = 0, AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), Size = UDim2.fromOffset(150, 42) }, SP.vue)
	SP.nom = K.texte(c, { Text = "", TextSize = 46, TextColor3 = C.texte, Size = UDim2.new(1, -48, 0, 52), Position = UDim2.fromOffset(24, 312),
		TextXAlignment = Enum.TextXAlignment.Left, TextScaled = true, epais = 4 })
	inst("UITextSizeConstraint", { MaxTextSize = 46, MinTextSize = 18 }, SP.nom)
	SP.desc = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 22, TextColor3 = C.texte2, TextWrapped = true, Text = "",
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, Size = UDim2.new(1, -48, 0, 78), Position = UDim2.fromOffset(24, 372),
		TextScaled = true }, c)
	inst("UITextSizeConstraint", { MaxTextSize = 22, MinTextSize = 13 }, SP.desc)
	-- UN lingot d'or (ACHETER), ANNULER en cyan à côté — deux décisions, une seule dorée (la charte)
	SP.oui = K.lingot(c, tr("ACHETER", "BUY"), UDim2.new(0.56, -30, 0, 84), UDim2.new(0, 24, 1, -58), Vector2.new(0, 1), 40)
	SP.non = K.tuile(c, tr("ANNULER", "CANCEL"), C.cyan, UDim2.new(0.44, -30, 0, 72), UDim2.new(1, -24, 1, -64), Vector2.new(1, 1), 24, "gauche")
	SP.note = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 17, TextColor3 = C.terne, TextWrapped = true, Text = "",
		Size = UDim2.new(1, -48, 0, 40), Position = UDim2.new(0, 24, 1, -48), TextXAlignment = Enum.TextXAlignment.Left }, c)
	SP.acheter = function()
		if not SP.on or SP.anim then return end
		local i = SP.i
		-- déjà à soi : rien à racheter
		if possedeCaisse(i) then
			Hud.toast(tr("DEJA A TOI : ELLE T'ATTEND AU GARAGE", "ALREADY YOURS: IT'S IN YOUR GARAGE"), C.vert, "coche")
			return
		end
		-- le produit existe : la fenêtre d'achat de Roblox (le serveur accorde — ProcessReceipt — et range la caisse au profil)
		local id = idCaisse(i)
		if id > 0 then
			pcall(function() MarketplaceService:PromptProductPurchase(joueur, id) end)
			SP.note.Text = tr("Confirme dans la fenêtre de Roblox : la caisse arrive aussitôt dans ton garage.",
				"Confirm in Roblox's window: the car lands in your garage right away.")
			SP.note.TextColor3 = C.texte2
			return
		end
		-- pas encore de numéro : on le DIT, dans la fenêtre, et rien n'est donné
		Sons.vrai("uiRefus", nil, nil, "tap", 0.8)
		Hud.vibre(10)
		SP.oui.TextScaled = true
		SP.oui.Text = tr("BIENTOT DISPONIBLE", "COMING SOON")
		SP.note.Text = tr("Les achats arrivent très bientôt.", "Purchases are coming very soon.") -- (le jeu est publié : plus de « à la sortie »)
		SP.note.TextColor3 = OR1
		task.spawn(function() -- (un refus se sent : la carte tremble)
			for k = 1, 6 do
				c.Position = UDim2.new(0.5, ((k % 2 == 0) and 1 or -1) * (7 - k), 0.5, 0)
				task.wait(0.035)
			end
			if not SP.anim then c.Position = UDim2.fromScale(0.5, 0.5) end
		end)
	end
	SP.oui.Activated:Connect(SP.acheter)
	SP.non.Activated:Connect(function() Boutique.popFerme() end)
	-- l'état du lingot, tenu à jour tant que la fenêtre est ouverte : le prix qui arrive de Roblox, la caisse qui vient d'être achetée
	-- (sans numéro, on n'y touche pas : « BIENTOT DISPONIBLE » reste écrit après l'appui)
	function SP.maj()
		local i = SP.i
		if possedeCaisse(i) then
			SP.oui.TextSize = 40
			ecrire(SP.oui, tr("A TOI !", "YOURS!"))
			ecrire(SP.note, tr("Elle t'attend au garage : équipe-la et roule.", "It's waiting in your garage: equip it and drive."))
			SP.note.TextColor3 = C.vert
		elseif idCaisse(i) > 0 then
			local p = prixTxt(idCaisse(i), false)
			SP.oui.TextSize = (p ~= "") and 30 or 40
			ecrire(SP.oui, tr("ACHETER", "BUY") .. ((p ~= "") and ("  " .. p) or ""))
		end
	end
	for _, o in v:GetDescendants() do
		if o:IsA("GuiObject") then o.ZIndex = 30 end
	end
	v.ZIndex = 30
	SP.voile, SP.carte = v, c
	SP.trou = inst("Frame", { Name = "Trou", BackgroundColor3 = Color3.fromRGB(10, 7, 22), BorderSizePixel = 0, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 29 })
	inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, SP.trou)
end
-- l'écart entre la case (à l'écran) et la carte posée au centre, en unités de l'interface : d'où elle part, où elle rentre
local function viser(src: GuiObject): (UDim2, number)
	local k = math.max(0.1, SP.carte.AbsoluteSize.X / (620 * SP.echelle.Scale)) -- (l'échelle de la racine de l'interface)
	local vC = SP.voile.AbsolutePosition + SP.voile.AbsoluteSize / 2
	local sC = src.AbsolutePosition + src.AbsoluteSize / 2
	local d = (sC - vC) / k
	return UDim2.new(0.5, d.X, 0.5, d.Y), math.min(1, src.AbsoluteSize.X / k / 620)
end
local TI = TweenInfo.new(0.42, Enum.EasingStyle.Quint, Enum.EasingDirection.Out)
function Boutique.pop(src: GuiObject, i: number, vp: ViewportFrame, pastille: Frame)
	if SP.on or not SP.carte then return end
	local f = Catalogue[i]
	if not f then return end
	SP.on, SP.anim, SP.src, SP.vp, SP.i = true, true, src, vp, i
	local r = RARETE[f.rar] or RARETE.legendaire
	SP.rare.Text, SP.rare.TextColor3 = tr(r[1], r[2]), r[3]
	SP.trait.Color, SP.bande.BackgroundColor3 = r[3], r[3]
	SP.nom.Text = Hud.sansAccent(string.upper(FR and f.nom or (f.en or f.nom)))
	SP.desc.Text = FR and (f.desc or "") or (f.descEN or f.desc or "")
	SP.oui.TextScaled = false
	SP.oui.TextSize = 40
	SP.oui.Text = tr("ACHETER", "BUY")
	SP.note.Text = tr("Achat unique, avec tes Robux. À toi pour toujours.", "One-time purchase with your Robux. Yours forever.")
	SP.note.TextColor3 = C.terne
	SP.maj()
	-- la photo : la caisse 3D de la case passe dans la fenêtre (avec sa caméra), sinon sa pastille de couleur
	SP.modele = vp:FindFirstChildOfClass("Model")
	if SP.modele and vp.CurrentCamera then
		SP.cam = vp.CurrentCamera:Clone()
		SP.cam.Parent = SP.vue
		SP.vue.CurrentCamera = SP.cam
		SP.vue.LightDirection = vp.LightDirection
		SP.modele.Parent = SP.vue
		SP.pastille.Visible = false
	else
		SP.modele = nil
		SP.pastille.Visible = true
		SP.pastille.BackgroundColor3 = pastille.BackgroundColor3
	end
	-- LA CARTE SORT DE LA PAGE : posée au centre, puis partie de la place de la case
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
	TweenService:Create(SP.voile, TI, { BackgroundTransparency = 0.32 }):Play()
	TweenService:Create(SP.echelle, TI, { Scale = 1 }):Play()
	local tw = TweenService:Create(SP.carte, TI, { Position = UDim2.fromScale(0.5, 0.5) })
	tw.Completed:Once(function() SP.anim = false end)
	tw:Play()
end
-- elle rentre à sa place, par le même chemin (vite = sans le trajet : la boutique se ferme)
local function rentre()
	if SP.modele and SP.vp then SP.modele.Parent = SP.vp end
	if SP.cam then
		SP.cam:Destroy()
		SP.cam = nil
	end
	SP.modele = nil
	SP.trou.Visible = false
	SP.voile.Visible = false
	SP.on, SP.anim = false, false
end
function Boutique.popFerme(vite: boolean?)
	if not SP.on then return end
	if vite then return rentre() end
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

-- ════════ LES OFFRES EN ROBUX (Sacha, 5/10 : « un bouton pour payer 500 Robux pour avoir 2X plus d'argent, un bouton pour payer
-- 700 Robux pour avoir nitro infini, un bouton pour avoir une vie en plus sous forme de cœur pour 50 Robux ») ════════
-- Une carte par offre, côte à côte : l'icône, le nom, la phrase qui donne envie, le PRIX (lu sur Roblox — le prix se règle sur
-- create.roblox.com, jamais ici ; sans réponse, pas de prix écrit) et un gros ACHETER qui ouvre la fenêtre d'achat de Roblox. Un
-- passe déjà à soi : ACTIF. Un numéro encore à 0 dans Config.REVENUS : BIENTOT (la carte reste, le bouton ne fait rien). VIP et
-- 3 TOURS DE ROUE n'ont de carte que s'ils existent.
-- `passe` : passe de jeu (achat unique) / produit (achat répété) ; `attr` : l'attribut joueur qui dit qu'on le possède (posé par
-- le serveur) ; `seulSi` : pas de carte BIENTOT pour lui ; `packs` : la carte des CŒURS et ses trois achats (1, 5, 15) ;
-- `hasard` : un lot tiré au hasard — sa carte se CACHE là où Roblox interdit de vendre du hasard (PolicyService, comme Client/Roue),
-- et l'achat se fait dans LA ROUE, qui montre ses chances avant (règle de Roblox).
local ROUE_ICO = "..#####..|.#..#..#.|#.#.#.#.#|#..###..#|#########|#..###..#|#.#.#.#.#|.#..#..#.|..#####.." -- (la roue de l'accueil)
local OFFRES = {
	{ cle = "argent2", passe = true, attr = "Argent2", ico = "piece", c = Color3.fromRGB(255, 215, 94),
		titre = { "x2 ARGENT", "x2 CASH" }, tag = { "A VIE", "FOREVER" },
		txt = { "Tout l'argent de tes parties compte DOUBLE. Pour toujours.", "All the cash from your runs counts DOUBLE. Forever." } },
	-- (NitroPasse : le passe est à soi — NitroInfini, lui, dit s'il AGIT : son interrupteur est dans les RÉGLAGES)
	{ cle = "nitroInfini", passe = true, attr = "NitroPasse", ico = "flamme", c = Color3.fromRGB(176, 107, 255),
		titre = { "NITRO INFINIE", "INFINITE NITRO" }, tag = { "A VIE", "FOREVER" },
		txt = { "La jauge ne se vide JAMAIS : nitro à fond, tout le temps. Elle se coupe dans les réglages, quand tu veux.",
			"The gauge NEVER empties: full nitro, all the time. Switch it off in the settings whenever you like." } },
	{ cle = "coeur", passe = false, ico = "coeur", c = Color3.fromRGB(255, 94, 122),
		titre = { "COEURS", "HEARTS" }, tag = { "+1 VIE", "+1 LIFE" }, packs = { "coeur", "coeur5", "coeur15" } },
	{ cle = "vip", passe = true, attr = "VIP", ico = "etoile", c = Color3.fromRGB(0, 234, 255), seulSi = true,
		titre = { "VIP", "VIP" }, tag = { "A VIE", "FOREVER" },
		txt = { "Cadeaux du jour et de temps de jeu DOUBLÉS, et ton nom en or au-dessus de ta caisse.",
			"Daily and playtime gifts DOUBLED, and your name in gold above your car." } },
	{ cle = "tours3", passe = false, ico = ROUE_ICO, c = Color3.fromRGB(255, 62, 200), seulSi = true, hasard = true,
		titre = { "3 TOURS DE ROUE", "3 WHEEL SPINS" }, tag = { "x3", "x3" },
		txt = { "Trois tours de LA ROUE d'un coup : de l'argent, des habillages, des caisses exclusives. Les chances sont dans LA ROUE.",
			"Three spins of THE WHEEL at once: cash, skins, exclusive cars. The odds are shown in THE WHEEL." } },
}
local function idOffre(o: any): number
	return idDe(o.passe and R.passes or R.produits, o.cle)
end
local OF: any = { cartes = {}, n = 0, hasardOK = false, sig = "" }
local H_OFFRE = 340
-- l'achat d'un produit : la fenêtre de Roblox (le serveur accorde : ProcessReceipt) — sans numéro, rien
local function acheterId(id: number)
	if id <= 0 then return end
	pcall(function() MarketplaceService:PromptProductPurchase(joueur, id) end)
end
-- l'achat d'une offre (le serveur accorde : ProcessReceipt pour un produit, PromptGamePassPurchaseFinished pour un passe)
local function acheterOffre(o: any)
	local id = idOffre(o)
	if id <= 0 then return end
	if o.hasard then
		-- (hasard payant : les chances se lisent AVANT l'achat — on l'achète dans LA ROUE, qui les montre ; elle vit à l'accueil
		-- et à l'écran de fin)
		if depuis == "garage" then
			Hud.toast(tr("LA ROUE T'ATTEND A L'ACCUEIL", "THE WHEEL IS ON THE HOME SCREEN"), OR1, "etoile")
			return
		end
		Boutique.fermer()
		Roue.ouvrir()
	elseif o.passe then
		pcall(function() MarketplaceService:PromptGamePassPurchase(joueur, id) end)
	else
		acheterId(id)
	end
end
-- une carte se montre ? (VIP, 3 TOURS : seulement s'ils existent ; 3 TOURS : seulement là où le hasard payant est permis)
local function offreVisible(o: any): boolean
	if o.seulSi and idOffre(o) <= 0 then return false end
	if o.hasard and not OF.hasardOK then return false end
	return true
end
-- l'emplacement d'un bouton en bas d'une carte : trois états, trois plaques (une seule visible à la fois)
local function place(c: Instance, h: number): Frame
	return inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, -32, 0, h), Position = UDim2.new(0, 16, 1, -14), AnchorPoint = Vector2.new(0, 1),
		Visible = false }, c)
end
-- BIENTOT · ACTIF · ACHETER : montrer la bonne plaque (rend l'état)
local function etat3(k: any, id: number, possede: boolean): string
	local etat = possede and "actif" or ((id > 0) and "acheter" or "bientot")
	if k.etat ~= etat then
		k.etat = etat
		k.sAch.Visible, k.sBie.Visible = etat == "acheter", etat == "bientot"
		if k.sAct then k.sAct.Visible = etat == "actif" end
	end
	return etat
end
-- bâtir la section des offres (le titre, puis la rangée) ; les cartes se rangent ensuite selon ce qui se montre (rangerOffres)
local function creerOffres(page: Instance): Frame
	local s = inst("Frame", { Name = "Offres", BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, 46 + H_OFFRE) }, page)
	K.texte(s, { italique = true, Text = tr("OFFRES ROBUX", "ROBUX DEALS"), TextSize = 30, TextColor3 = OR1, Size = UDim2.fromOffset(700, 34),
		Position = UDim2.new(0.043, 0, 0, 0), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	local rang = inst("Frame", { Name = "Rang", BackgroundTransparency = 1, Size = UDim2.new(0.914, 0, 0, H_OFFRE), Position = UDim2.new(0.043, 0, 0, 46) }, s)
	for _, o in OFFRES do
		local c = inst("Frame", { Name = "Offre_" .. o.cle, BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.fromScale(0, 1), Visible = false }, rang)
		K.degrade(c, Color3.fromRGB(34, 20, 64):Lerp(o.c, 0.3), Color3.fromRGB(16, 10, 34), 90)
		inst("UIStroke", { Color = o.c, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, c)
		inst("Frame", { BackgroundColor3 = o.c, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 6) }, c)
		-- l'étiquette, en haut à droite : À VIE (un passe), +1 VIE (le cœur), x3 (la roue)
		local tag = inst("Frame", { BackgroundColor3 = o.c, BorderSizePixel = 0, Size = UDim2.fromOffset(18 + utf8.len(tr(o.tag[1], o.tag[2])) * 16 * Hud.CHASSE + 18, 30),
			Position = UDim2.new(1, -14, 0, 18), AnchorPoint = Vector2.new(1, 0) }, c)
		K.texte(tag, { Text = tr(o.tag[1], o.tag[2]), TextSize = 16, TextColor3 = C.encre, Size = UDim2.fromScale(1, 1), TextWrapped = false, contour = false })
		-- l'icône pixel, à la couleur de l'offre (lèvre claire, plein, ombre)
		K.icone(c, o.ico, 6, { { 0.3, o.c:Lerp(Color3.new(1, 1, 1), 0.45) }, { 0.7, o.c }, { 1, o.c:Lerp(Color3.new(0, 0, 0), 0.35) } }, UDim2.fromOffset(18, 20))
		local carte: any = { o = o, c = c }
		local nom = K.texte(c, { italique = true, Text = tr(o.titre[1], o.titre[2]), TextSize = 30, TextColor3 = C.texte, Size = UDim2.new(1, -32, 0, 36),
			Position = UDim2.fromOffset(16, 84), TextXAlignment = Enum.TextXAlignment.Left, TextScaled = true, TextWrapped = false, epais = 3 })
		inst("UITextSizeConstraint", { MaxTextSize = 30, MinTextSize = 14 }, nom)
		if o.packs then
			-- LES CŒURS (5/10, lot 2) : la réserve (la police du texte sait dessiner « ♥ », pas la police pixel), puis TROIS achats —
			-- 1, 5 ou 15 cœurs — chacun sa ligne : combien, et son bouton (son prix, ou BIENTOT)
			carte.nb = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 30, TextColor3 = o.c, Text = "",
				TextXAlignment = Enum.TextXAlignment.Right, Size = UDim2.fromOffset(120, 32), Position = UDim2.new(1, -16, 0, 54), AnchorPoint = Vector2.new(1, 0) }, c)
			carte.packs = {}
			for j, q in o.packs do
				local y = 128 + (j - 1) * 68
				local nC = R.coeursPar[q] or 1
				inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 30, TextColor3 = o.c, Text = "♥ " .. nC,
					TextXAlignment = Enum.TextXAlignment.Left, Size = UDim2.fromOffset(80, 60), Position = UDim2.fromOffset(18, y) }, c)
				local bt = K.tuile(c, tr("BIENTOT", "SOON"), o.c, UDim2.new(1, -116, 0, 58), UDim2.new(0, 98, 0, y + 1), nil, 18)
				bt.Activated:Connect(function()
					local id = idDe(R.produits, q)
					if id > 0 then acheterId(id) else Hud.toast(tr("BIENTOT", "SOON"), nil, "verrou") end
				end)
				table.insert(carte.packs, { nom = q, bt = bt })
			end
		else
			local d = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 19, TextColor3 = C.texte2, TextWrapped = true,
				Text = tr(o.txt[1], o.txt[2]), TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top,
				Size = UDim2.new(1, -32, 0, 80), Position = UDim2.fromOffset(16, 124), TextScaled = true }, c)
			inst("UITextSizeConstraint", { MaxTextSize = 19, MinTextSize = 12 }, d)
			carte.prix = K.texte(c, { Text = "", TextSize = 28, TextColor3 = OR1, Size = UDim2.new(1, -32, 0, 32), Position = UDim2.fromOffset(16, 214),
				TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
			carte.sAch, carte.sAct, carte.sBie = place(c, 64), place(c, 64), place(c, 64)
			carte.bt = K.lingot(carte.sAch, o.hasard and tr("VOIR LA ROUE", "SEE THE WHEEL") or tr("ACHETER", "BUY"), UDim2.new(1, 0, 0, 64), UDim2.new(), nil, o.hasard and 22 or 26)
			carte.bt.Activated:Connect(function() acheterOffre(o) end)
			local actif = K.tuile(carte.sAct, tr("ACTIF", "OWNED"), C.vert, UDim2.new(1, 0, 0, 64), UDim2.new(), nil, 22, "coche")
			actif.Activated:Connect(function() Hud.toast(tr("DEJA A TOI", "ALREADY YOURS"), C.vert, "coche") end)
			bientot(carte.sBie, UDim2.fromScale(0.5, 0.5), Vector2.new(0.5, 0.5), 24)
		end
		table.insert(OF.cartes, carte)
	end
	return s
end
-- ranger la rangée : les cartes qui se montrent, côte à côte, à parts égales (rien ne bouge tant que la liste ne change pas)
local function rangerOffres()
	local vis = {}
	local sig = ""
	for _, k in OF.cartes do
		if offreVisible(k.o) then
			table.insert(vis, k)
			sig ..= k.o.cle .. ","
		end
	end
	if sig == OF.sig then return end
	OF.sig = sig
	local n, ecart = math.max(1, #vis), 18
	for _, k in OF.cartes do k.c.Visible = false end
	for j, k in vis do
		local i = j - 1
		k.c.Size = UDim2.new(1 / n, -ecart * (n - 1) / n, 1, 0)
		k.c.Position = UDim2.new(i / n, i * ecart / n, 0, 0)
		k.c.Visible = true
	end
end

-- ════════ LE KIT DU PILOTE (5/10, lot 2 — l'offre de BIENVENUE) ════════
-- En TÊTE de la page, une carte dorée : 50 000 $, 3 cœurs, la traînée POUDRE D'OR (Config.REVENUS.kit) — un PRODUIT, une fois par
-- compte : acheté, la carte s'en va (attribut KitPris, posé par le serveur). Pas de minuteur, pas de « valeur » gonflée : ce qu'il
-- contient, son prix, c'est tout.
local KT: any = {}
local H_KIT = 190
local function creerKit(page: Instance): Frame
	local s = inst("Frame", { Name = "Kit", BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, H_KIT) }, page)
	local c = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.new(0.914, 0, 1, 0), Position = UDim2.fromScale(0.043, 0) }, s)
	K.degrade(c, Color3.fromRGB(122, 80, 14), Color3.fromRGB(46, 20, 44), 90)
	inst("UIStroke", { Color = OR1, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, c)
	inst("Frame", { BackgroundColor3 = OR1, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 6) }, c)
	local lib = tr("OFFRE DE BIENVENUE", "WELCOME OFFER")
	local tag = inst("Frame", { BackgroundColor3 = OR1, BorderSizePixel = 0, Size = UDim2.fromOffset(36 + utf8.len(lib) * 18 * Hud.CHASSE, 32), Position = UDim2.fromOffset(20, 20) }, c)
	K.texte(tag, { Text = lib, TextSize = 18, TextColor3 = C.encre, Size = UDim2.fromScale(1, 1), TextWrapped = false, contour = false })
	K.icone(c, "cadeau", 7, { { 0.3, Color3.fromRGB(255, 244, 200) }, { 0.7, OR1 }, { 1, Color3.fromRGB(170, 110, 20) } }, UDim2.fromOffset(24, 70))
	local titre = K.texte(c, { italique = true, Text = tr("KIT DU PILOTE", "DRIVER'S KIT"), TextSize = 40, TextColor3 = OR1, Size = UDim2.new(0.62, -110, 0, 46),
		Position = UDim2.fromOffset(106, 62), TextXAlignment = Enum.TextXAlignment.Left, TextScaled = true, TextWrapped = false, epais = 4 })
	inst("UITextSizeConstraint", { MaxTextSize = 40, MinTextSize = 18 }, titre)
	local kt = R.kit
	local contenu = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 26, TextColor3 = C.texte, TextXAlignment = Enum.TextXAlignment.Left,
		Text = tr(Hud.compte(kt.argent) .. "   +   ♥ " .. kt.coeurs .. " cœurs   +   la traînée POUDRE D'OR",
			Hud.compte(kt.argent) .. "   +   ♥ " .. kt.coeurs .. " hearts   +   the GOLD DUST trail"),
		Size = UDim2.new(0.62, -110, 0, 32), Position = UDim2.fromOffset(106, 114), TextScaled = true }, c)
	inst("UITextSizeConstraint", { MaxTextSize = 26, MinTextSize = 13 }, contenu)
	inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 19, TextColor3 = C.terne, TextXAlignment = Enum.TextXAlignment.Left,
		Text = tr("Une seule fois par compte.", "Once per account."), Size = UDim2.new(0.62, -110, 0, 22), Position = UDim2.fromOffset(106, 150) }, c)
	KT.prix = K.texte(c, { Text = "", TextSize = 30, TextColor3 = OR1, Size = UDim2.fromOffset(320, 34), Position = UDim2.new(1, -24, 0, 22), AnchorPoint = Vector2.new(1, 0),
		TextXAlignment = Enum.TextXAlignment.Right, TextWrapped = false, epais = 3 })
	local function coin(): Frame
		return inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(330, 84), Position = UDim2.new(1, -24, 1, -18), AnchorPoint = Vector2.new(1, 1), Visible = false }, c)
	end
	KT.sAch, KT.sBie = coin(), coin()
	local bt = K.lingot(KT.sAch, tr("ACHETER", "BUY"), UDim2.new(1, 0, 0, 84), UDim2.new(), nil, 32)
	bt.Activated:Connect(function() acheterId(idDe(R.produits, "kit")) end)
	bientot(KT.sBie, UDim2.fromScale(0.5, 0.5), Vector2.new(0.5, 0.5), 26)
	return s
end

-- ════════ L'ARGENT (5/10, lot 2) : cinq PACKS de $ pour le compte (Config.REVENUS.argent — les montants se règlent là-bas) ════════
-- Chaque carte : le montant, le prix lu sur Roblox, ACHETER (ou BIENTOT). Le BONUS n'est écrit que s'il est VRAI : calculé sur les
-- prix que Roblox rend pour CE joueur — le $ par Robux du pack, comparé à celui du plus petit.
local AR: any = { cartes = {} }
local H_ARG = 226
local MENTHE = C.menthe
local function creerArgent(page: Instance): Frame
	local s = inst("Frame", { Name = "Argent", BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, 46 + H_ARG) }, page)
	K.texte(s, { italique = true, Text = tr("ARGENT", "CASH"), TextSize = 30, TextColor3 = MENTHE, Size = UDim2.fromOffset(700, 34),
		Position = UDim2.new(0.043, 0, 0, 0), TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
	local rang = inst("Frame", { Name = "Rang", BackgroundTransparency = 1, Size = UDim2.new(0.914, 0, 0, H_ARG), Position = UDim2.new(0.043, 0, 0, 46) }, s)
	local n, ecart = math.max(1, #R.argent), 18
	for k, a in R.argent do
		local i = k - 1
		local c = inst("Frame", { Name = "Argent_" .. k, BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0,
			Size = UDim2.new(1 / n, -ecart * (n - 1) / n, 1, 0), Position = UDim2.new(i / n, i * ecart / n, 0, 0) }, rang)
		K.degrade(c, Color3.fromRGB(22, 62, 50), Color3.fromRGB(12, 16, 32), 90)
		inst("UIStroke", { Color = MENTHE, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, c)
		inst("Frame", { BackgroundColor3 = MENTHE, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 5) }, c)
		K.icone(c, "piece", 5, { { 0.3, Color3.fromRGB(255, 244, 200) }, { 0.7, OR1 }, { 1, Color3.fromRGB(170, 110, 20) } }, UDim2.fromOffset(16, 18))
		local carte: any = { a = a, k = k }
		carte.bonus = inst("Frame", { BackgroundColor3 = MENTHE, BorderSizePixel = 0, Size = UDim2.fromOffset(132, 28), Position = UDim2.new(1, -12, 0, 18),
			AnchorPoint = Vector2.new(1, 0), Visible = false }, c)
		carte.bonusT = K.texte(carte.bonus, { Text = "", TextSize = 15, TextColor3 = C.encre, Size = UDim2.fromScale(1, 1), TextWrapped = false, contour = false })
		local m = K.texte(c, { Text = Hud.compte(a.v), TextSize = 30, TextColor3 = MENTHE, Size = UDim2.new(1, -28, 0, 36), Position = UDim2.fromOffset(14, 72),
			TextXAlignment = Enum.TextXAlignment.Left, TextScaled = true, TextWrapped = false, epais = 3 })
		inst("UITextSizeConstraint", { MaxTextSize = 30, MinTextSize = 14 }, m)
		carte.prix = K.texte(c, { Text = "", TextSize = 24, TextColor3 = OR1, Size = UDim2.new(1, -28, 0, 28), Position = UDim2.fromOffset(14, 116),
			TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3 })
		carte.sAch, carte.sBie = place(c, 60), place(c, 60)
		local bt = K.tuile(carte.sAch, tr("ACHETER", "BUY"), MENTHE, UDim2.new(1, 0, 0, 60), UDim2.new(), nil, 20)
		bt.Activated:Connect(function() acheterId(idDe(a, "id")) end)
		bientot(carte.sBie, UDim2.fromScale(0.5, 0.5), Vector2.new(0.5, 0.5), 20)
		table.insert(AR.cartes, carte)
	end
	return s
end

-- ════════ TOUT TENIR À JOUR (la boutique ouverte : toutes les 0,4 s) ════════
-- les prix qui arrivent de Roblox, un passe qui vient d'être acheté (ACTIF), un cœur de plus, le kit pris, une caisse achetée
local function ranger()
	local y = 8
	for _, s in { U.secKit, U.secOffres, U.secArgent, U.vit } do
		if s and s.Visible then
			s.Position = UDim2.fromOffset(0, y)
			y += s.Size.Y.Offset + 30
		end
	end
	U.page.CanvasSize = UDim2.fromOffset(0, y + 150) -- (+150 : le bas de la page remonte au-dessus de RETOUR, qui le cachait)
end
local function majBoutique()
	-- le KIT : là tant qu'il n'est pas pris
	local kitLa = joueur:GetAttribute("KitPris") ~= true
	if U.secKit.Visible ~= kitLa then
		U.secKit.Visible = kitLa
		ranger()
	end
	local idKit = idDe(R.produits, "kit")
	etat3(KT, idKit, false)
	ecrire(KT.prix, prixTxt(idKit, false))
	-- les OFFRES
	rangerOffres()
	for _, k in OF.cartes do
		local o = k.o
		if k.packs then
			for _, q in k.packs do
				local id = idDe(R.produits, q.nom)
				local p = prixTxt(id, false)
				ecrire(q.bt, (id <= 0) and tr("BIENTOT", "SOON") or ((p ~= "") and p or tr("ACHETER", "BUY")))
				q.bt.TextColor3 = (id > 0) and C.texte or C.terne
			end
			local nC = Revenus.coeurs()
			ecrire(k.nb, "♥ " .. nC)
			k.nb.TextTransparency = (nC > 0) and 0 or 0.55
		else
			local id = idOffre(o)
			local possede = o.passe and o.attr ~= nil and joueur:GetAttribute(o.attr) == true
			local etat = etat3(k, id, possede)
			ecrire(k.prix, (etat == "acheter") and prixTxt(id, o.passe) or "")
		end
	end
	-- l'ARGENT : le prix, et le BONUS quand il est vrai (le $ par Robux, comparé au plus petit pack — sur les prix de CE joueur)
	local p1 = R.argent[1] and Revenus.prix(idDe(R.argent[1], "id"), false)
	local base = (p1 and p1 > 0) and R.argent[1].v / p1 or nil
	for _, k in AR.cartes do
		local id = idDe(k.a, "id")
		etat3(k, id, false)
		ecrire(k.prix, prixTxt(id, false))
		local p = Revenus.prix(id, false)
		local pct = (base and p and p > 0 and k.k > 1) and math.floor((k.a.v / p / base - 1) * 100 + 0.5) or 0
		k.bonus.Visible = pct >= 5
		if pct >= 5 then ecrire(k.bonusT, "BONUS +" .. pct .. tr(" %", "%")) end
	end
	-- les CAISSES de la vitrine : BIENTOT · leur prix · A TOI !
	if U.uneEtat then U.uneEtat.regler(etatCaisse(UNE)) end
	for _, k in cases do
		if k.etat then k.etat.regler(etatCaisse(k.i)) end
	end
	-- la fenêtre d'achat ouverte
	if SP.on and SP.maj then SP.maj() end
end
local function creer()
	local racine = Hud.racine
	local g = inst("Frame", { Name = "Boutique", BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.03, Size = UDim2.fromScale(1, 1), Visible = false, ZIndex = 18,
		Active = true }, racine)
	U.racine = g
	K.degrade(g, Color3.fromRGB(58, 16, 70), Color3.fromRGB(10, 7, 24), 80)
	K.texte(g, { italique = true, Text = tr("BOUTIQUE", "SHOP"), TextSize = 78, TextColor3 = C.texte, Size = UDim2.fromOffset(800, 80), Position = UDim2.fromOffset(66, 22),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 4 })
	for i, c in { C.magenta, C.cyan, C.or_ } do
		inst("Frame", { BackgroundColor3 = c, BorderSizePixel = 0, Size = UDim2.fromOffset(i == 1 and 82 or 38, 7), Position = UDim2.fromOffset(72 + (i == 1 and 0 or (i == 2 and 92 or 140)), 108) }, g)
	end

	-- ── LA PAGE (5/10) : sous le titre, tout défile d'un seul geste — le KIT (tant qu'il n'est pas pris), les OFFRES EN ROBUX,
	-- l'ARGENT, puis la VITRINE des caisses ; `ranger` les empile (le kit parti, tout remonte) ──
	U.page = inst("ScrollingFrame", { Name = "Page", BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.new(1, 0, 1, -118),
		Position = UDim2.fromOffset(0, 118), CanvasSize = UDim2.new(), ScrollingDirection = Enum.ScrollingDirection.Y, ScrollBarThickness = 6,
		ScrollBarImageColor3 = C.terne }, g)
	U.secKit = creerKit(U.page)
	U.secOffres = creerOffres(U.page)
	U.secArgent = creerArgent(U.page)
	-- la vitrine : la une à gauche, LES LEGENDAIRES à droite — telles qu'avant, posées sous l'argent
	local vit = inst("Frame", { Name = "Vitrine", BackgroundTransparency = 1, Size = UDim2.new(1, 0, 0, 600) }, U.page)
	U.vit = vit

	-- ── la caisse À LA UNE ──
	local f = Catalogue[UNE]
	local une = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Size = UDim2.new(0.436, 0, 0, 400), Position = UDim2.new(0.043, 0, 0, 36) }, vit)
	K.degrade(une, Color3.fromRGB(96, 24, 110), Color3.fromRGB(38, 14, 62), 90)
	inst("UIStroke", { Color = C.magenta, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, une)
	local et = inst("Frame", { BackgroundColor3 = C.magenta, BorderSizePixel = 0, Size = UDim2.fromOffset(318, 44), Position = UDim2.fromOffset(22, 22) }, une)
	inst("UIStroke", { Color = Color3.fromRGB(255, 190, 240), Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, et)
	K.texte(et, { Text = tr("A LA UNE", "FEATURED"), TextSize = 24, TextColor3 = C.texte, Size = UDim2.fromScale(1, 1), TextWrapped = false })
	-- (5/10 : plus de « −50 % » — un rabais sans prix barré réel est un faux rabais, interdit par Roblox)
	U.uneVue = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.new(0.46, 0, 0, 230), Position = UDim2.new(0, 10, 0, 86),
		Ambient = Color3.fromRGB(104, 100, 128), LightColor = Color3.fromRGB(226, 216, 204) }, une)
	U.unePastille = inst("Frame", { BorderSizePixel = 0, AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), Size = UDim2.fromOffset(120, 34),
		BackgroundColor3 = Color3.fromHex(string.format("%06x", f.laque)) }, U.uneVue)
	local nom = K.texte(une, { Text = Hud.sansAccent(string.upper(FR and f.nom or (f.en or f.nom))), TextSize = 44, TextColor3 = C.texte, Size = UDim2.new(0.52, -24, 0, 104),
		Position = UDim2.new(0.48, 0, 0, 92), TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, LineHeight = 1.2, epais = 4 })
	if nom then nom.TextWrapped = true end
	local desc = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.TXT, TextSize = 22, TextColor3 = C.texte2, TextWrapped = true, Text = FR and f.desc or (f.descEN or f.desc),
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, Size = UDim2.new(0.52, -24, 0, 130), Position = UDim2.new(0.48, 0, 0, 204),
		TextScaled = true }, une)
	inst("UITextSizeConstraint", { MaxTextSize = 22, MinTextSize = 13 }, desc)
	U.uneEtat = plaqueEtat(une, UDim2.new(1, -22, 1, -22), Vector2.new(1, 1), 28)
	local bu = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, une)
	U.une = une
	bu.Activated:Connect(function() Boutique.pop(une, UNE, U.uneVue, U.unePastille) end)

	-- ── LES LEGENDAIRES : la grille (5/10 : elle ne défile plus seule — c'est la PAGE qui défile ; deux défilements emboîtés se
	-- volaient la molette et le doigt) ──
	K.texte(vit, { Text = tr("LES LEGENDAIRES", "THE LEGENDARIES"), TextSize = 26, TextColor3 = C.terne, Size = UDim2.new(0, 500, 0, 28), Position = UDim2.new(0.5, 0, 0, 0),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	local rangs = math.ceil(#LISTE / 2)
	local hGrille = 4 + rangs * 340 + math.max(0, rangs - 1) * 18 + 12
	U.grille = inst("Frame", { BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.new(0.457, 0, 0, hGrille), Position = UDim2.new(0.5, 0, 0, 36) }, vit)
	vit.Size = UDim2.new(1, 0, 0, 36 + math.max(400, hGrille))
	inst("UIGridLayout", { CellSize = UDim2.new(0.5, -14, 0, 340), CellPadding = UDim2.fromOffset(16, 18), SortOrder = Enum.SortOrder.LayoutOrder }, U.grille)
	inst("UIPadding", { PaddingTop = UDim.new(0, 4), PaddingLeft = UDim.new(0, 3), PaddingBottom = UDim.new(0, 12) }, U.grille)
	for rang, i in LISTE do
		local fc = Catalogue[i]
		local c = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, LayoutOrder = rang }, U.grille)
		K.degrade(c, Color3.fromRGB(44, 26, 78), Color3.fromRGB(22, 14, 44), 90)
		inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, c)
		inst("Frame", { BackgroundColor3 = C.magenta, BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 5) }, c)
		local vp = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.new(1, -16, 0, 190), Position = UDim2.fromOffset(8, 14),
			Ambient = Color3.fromRGB(104, 100, 128), LightColor = Color3.fromRGB(226, 216, 204) }, c)
		local pastille = inst("Frame", { BorderSizePixel = 0, AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5), Size = UDim2.fromOffset(96, 28),
			BackgroundColor3 = Color3.fromHex(string.format("%06x", fc.laque)) }, vp)
		local n = K.texte(c, { Text = Hud.sansAccent(string.upper(FR and fc.nom or (fc.en or fc.nom))), TextSize = 28, TextColor3 = C.texte, Size = UDim2.new(1, -32, 0, 32),
			Position = UDim2.fromOffset(18, 220), TextXAlignment = Enum.TextXAlignment.Left, TextScaled = true, epais = 3 })
		inst("UITextSizeConstraint", { MaxTextSize = 28, MinTextSize = 13 }, n)
		local etat = plaqueEtat(c, UDim2.new(0, 18, 1, -18), Vector2.new(0, 1), 22)
		local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", AutoButtonColor = false }, c)
		cases[rang] = { i = i, vp = vp, pastille = pastille, modele = nil, c = c, etat = etat }
		b.Activated:Connect(function() Boutique.pop(c, i, vp, pastille) end)
	end

	-- ── RETOUR, en bas à gauche (sous le pouce, jamais en haut : la charte) ──
	-- (5/10, banc : RETOUR se posait SUR les cartes — un pied de page sombre le détache du contenu qui défile dessous)
	local pied = inst("Frame", { Name = "Pied", BackgroundColor3 = Color3.fromRGB(10, 6, 24), BorderSizePixel = 0, Size = UDim2.new(1, 0, 0, 150),
		Position = UDim2.new(0, 0, 1, 0), AnchorPoint = Vector2.new(0, 1) }, g)
	inst("UIGradient", { Rotation = 90, Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(0.45, 0.15),
		NumberSequenceKeypoint.new(1, 0) }) }, pied)
	U.btRetour = K.boutonRetour(g)
	U.btRetour.Activated:Connect(function()
		if SP.on then Boutique.popFerme() else Boutique.fermer() end -- (la fenêtre ouverte se ferme d'abord)
	end)
	for _, o in g:GetDescendants() do
		if o:IsA("GuiObject") then o.ZIndex = 19 end
	end
	creerFenetre(g)
	ranger()
end

function Boutique.init(c: any)
	ctx = c
	creer()
	-- le PROFIL (les caisses légendaires déjà à soi) : lu une fois, puis suivi à chaque mise à jour poussée par le serveur
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

-- depuis : "menu" | "mort" | "garage" — l'écran auquel RETOUR ramène
function Boutique.ouvrir(d: string)
	if not U.racine then return end
	depuis = d
	Boutique.ouvert = true
	U.racine.Visible = true
	U.page.CanvasPosition = Vector2.zero -- (on arrive TOUJOURS en haut : le kit, les offres en Robux)
	if d ~= "garage" then Hud.ecran("boutique") end
	-- tout se tient à jour tant que la boutique est ouverte : un prix qui arrive de Roblox, un passe qui vient d'être acheté (ACTIF),
	-- un cœur de plus, le kit pris, une caisse achetée
	OF.n += 1
	local nOf = OF.n
	majBoutique()
	task.spawn(function()
		while Boutique.ouvert and OF.n == nOf do
			task.wait(0.4)
			if Boutique.ouvert and OF.n == nOf then majBoutique() end
		end
	end)
	-- les photos : la une d'abord, puis la grille, une par une ; au premier refus (budget) on s'arrête, les pastilles restent
	fileN += 1
	local n = fileN
	task.spawn(function()
		-- (Roblox ne rend pas tout de suite la mémoire des maillages qu'on vient de détruire : la première photo réessaie)
		if not U.uneModele then
			local m = photographier(U.uneVue, UNE, 1.9)
			local essai = 0
			while not m and essai < 5 and n == fileN do
				essai += 1
				task.wait(0.7)
				m = photographier(U.uneVue, UNE, 1.9)
			end
			if n ~= fileN then
				Caisse.rendre(m)
				return
			end
			if not m then return end
			U.uneModele = m
			U.unePastille.Visible = false
		end
		for _, k in cases do
			if n ~= fileN then return end
			if not k.modele then
				if Maillage.libre() < (Catalogue[k.i].triangles or 3000) + 1500 then return end -- (plus de place : les pastilles restent)
				local m = photographier(k.vp, k.i, 1.75)
				if n ~= fileN then
					Caisse.rendre(m)
					return
				end
				if not m then return end
				k.modele = m
				k.pastille.Visible = false
				task.wait()
			end
		end
	end)
end

-- (banc) ouvrir la fenêtre d'une case (0 = la une), presser ACHETER ; « offre:coeur » (ou argent2, nitroInfini, vip, tours3 — et
-- coeur5, coeur15 : les packs de la carte des cœurs) presse ACHETER sur cette offre ; « kit » presse ACHETER du KIT DU PILOTE ;
-- « argent:2 » celui du 2e pack d'argent (la fenêtre d'achat de Roblox s'ouvre si son numéro existe — dans Studio, un achat de TEST,
-- rien n'est débité) ; « offres » écrit dans la Sortie l'état de chaque carte (le kit, les offres, l'argent, les caisses)
function Boutique.dbg(quoi: string)
	if quoi == "oui" then
		if SP.acheter then SP.acheter() end
	elseif quoi == "non" then
		Boutique.popFerme()
	elseif quoi == "kit" then
		acheterId(idDe(R.produits, "kit"))
	elseif string.sub(quoi, 1, 7) == "argent:" then
		local a = R.argent[tonumber(string.sub(quoi, 8)) or 0]
		if a then acheterId(idDe(a, "id")) end
	elseif string.sub(quoi, 1, 6) == "offre:" then
		local cle = string.sub(quoi, 7)
		for _, k in OF.cartes do
			if k.o.cle == cle then acheterOffre(k.o) end
			for _, q in k.packs or {} do
				if q.nom == cle and cle ~= k.o.cle then acheterId(idDe(R.produits, cle)) end
			end
		end
	elseif quoi == "offres" then
		majBoutique()
		print(string.format("[boutique] kit : %s, %s, prix « %s »", U.secKit.Visible and "montre" or "pris", KT.etat or "?", KT.prix.Text))
		for _, k in OF.cartes do
			if k.packs then
				local t = {}
				for _, q in k.packs do table.insert(t, q.nom .. " « " .. q.bt.Text .. " »") end
				print(string.format("[boutique] %s : %s, %s, %s", k.o.cle, k.c.Visible and "montre" or "cache", k.nb.Text, table.concat(t, ", ")))
			else
				print(string.format("[boutique] %s : %s, %s, prix « %s »", k.o.cle, k.c.Visible and "montre" or "cache", k.etat or "?", k.prix.Text))
			end
		end
		for _, k in AR.cartes do
			print(string.format("[boutique] argent%d (%s) : %s, prix « %s »%s", k.k, Hud.compte(k.a.v), k.etat or "?", k.prix.Text,
				k.bonus.Visible and (", " .. k.bonusT.Text) or ""))
		end
		print("[boutique] a la une : " .. (U.uneEtat and U.uneEtat.etat or "?"))
		for _, k in cases do
			print(string.format("[boutique] caisse %d : %s", k.i, k.etat and k.etat.etat or "?"))
		end
	else
		local r = tonumber(quoi) or 0
		local k = cases[r]
		if r == 0 or not k then Boutique.pop(U.une, UNE, U.uneVue, U.unePastille) else Boutique.pop(k.c, k.i, k.vp, k.pastille) end
	end
end
function Boutique.fermer()
	if not Boutique.ouvert then return end
	Boutique.ouvert = false
	Boutique.popFerme(true)
	fileN += 1
	U.racine.Visible = false
	-- on rend les maillages (le garage en a besoin pour ses vignettes)
	if U.uneModele then
		Caisse.rendre(U.uneModele)
		U.uneModele = nil
		U.unePastille.Visible = true
	end
	for _, k in cases do
		if k.modele then
			Caisse.rendre(k.modele)
			k.modele = nil
			k.pastille.Visible = true
		end
	end
	if ctx and ctx.retour then ctx.retour(depuis) end
end

return Boutique
