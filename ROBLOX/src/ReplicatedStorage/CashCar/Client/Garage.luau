-- CASH CAR — LE GARAGE (mode BOUTIQUE du jeu web : #garage, #gTop, #gBottom).
-- Un ATELIER en 3D (plateau tournant cerclé de cyan, porte sectionnelle, néons, bazar de garagiste) et, par-dessus,
-- la même interface que le web : le COMPTE en haut à gauche, la fiche de la caisse (nom, barre à la couleur de sa
-- rareté, rang « 12 / 68 », sa condition si elle est fermée), et en bas à droite la CONSOLE : onglets, pastilles de
-- famille (possédées / total), bande de vignettes, puis HOME · BOUTIQUE · le bouton de décision · JOUER.
--
-- Les règles sont celles du web :
--   · la rareté se lit à la COULEUR seule (barre, pastille, liseré de vignette) ;
--   · UN seul lingot d'or : s'il y a une décision (ACHETER, ÉQUIPER), c'est elle qui est en or et JOUER passe en laque ;
--   · acheter = un seul appui, sans confirmation, et la caisse n'est PAS équipée d'office ;
--   · JOUER équipe la caisse montrée si elle est ouverte, puis lance ;
--   · Config.TEST_CAISSES (comme TEST_CAISSES du web) : tout s'équipe, mais la vraie condition reste écrite.
-- L'argent et la possession vivent au SERVEUR (Profils) : ici on DEMANDE, le serveur vérifie.
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local Lighting = game:GetService("Lighting")

local CC = script.Parent.Parent
local Config = require(CC:WaitForChild("Config"))
local Caisse = require(CC:WaitForChild("Caisse"))
local Maillage = require(script.Parent:WaitForChild("Maillage"))
local Argent = require(script.Parent:WaitForChild("Argent"))
local Hud = require(script.Parent:WaitForChild("Hud"))
local Sons = require(script.Parent:WaitForChild("Sons"))

local M = Config.M
local Catalogue = Caisse.Catalogue
local K, C, FR = Hud.kit, Hud.C, Hud.FR
-- (9/10, Sacha : « met les prix ») le PRIX EN ROBUX d'une légendaire, sur sa carte : le vrai prix du produit dès que Roblox l'a dit
-- (Client/Revenus le lit et le garde), sinon le prix conseillé de Config.REVENUS.prixCaisses
local function prixRobux(i: number): string
	local R = Config.REVENUS
	local id = R.caisses and R.caisses[i]
	local ok, Revenus = pcall(require, script.Parent:WaitForChild("Revenus"))
	local p = (ok and type(id) == "number" and id > 0) and Revenus.prix(id, false) or nil
	p = p or (R.prixCaisses and R.prixCaisses[i])
	return p and ("R$ " .. math.floor(p)) or (FR and "BOUTIQUE" or "SHOP")
end
local inst = K.inst

local Garage = { ouvert = false }

-- ════════ les mots ════════
local L = FR and {
	voitures = "VOITURES", peinture = "PEINTURE", ailes = "AILES", trainees = "TRAINEES",
	home = "HOME", boutique = "BOUTIQUE", jouer = "JOUER", acheter = "ACHETER", manque = "IL MANQUE",
	equiper = "EQUIPER", verrou = "VERROUILLEE", enBoutique = "EN BOUTIQUE", aToi = "A TOI !", equipee = "EQUIPEE",
	ilTeManque = "IL TE MANQUE ", gagneLes = "  -  JOUE POUR LES GAGNER", bientot = "BIENTOT DISPONIBLE",
	tout = "TOUT", aMoi = "A MOI", aAcheter = "A ACHETER", gagner = "A GAGNER", defi = "ROUE",
	roue = "SE GAGNE A LA ROUE", jour7 = "CADEAU DU 7e JOUR DE CONNEXION D'AFFILEE", sept = "7 JOURS", bientotDefi = "BIENTOT : UN DEFI A VENIR",
	carrN = "ATTRAPE-LA AU NIVEAU 10 DES NUAGES  (%d / 10)",
	carrV = "BATS LE BANQUIER AU NIVEAU 10 DE LA VILLE  (%d / 10)", aura = "RANG D'AURA « %s »   (LE TIEN : « %s »)",
	rangs = { "ANONYME", "REMARQUE", "ON PARLE DE TOI", "REPUTE", "LEGENDE LOCALE", "STAR DU BITUME", "MYTHE", "DIVINITE DU CIEL" },
} or {
	voitures = "CARS", peinture = "PAINT", ailes = "WINGS", trainees = "TRAILS",
	home = "HOME", boutique = "SHOP", jouer = "PLAY", acheter = "BUY", manque = "SHORT BY",
	equiper = "EQUIP", verrou = "LOCKED", enBoutique = "IN THE SHOP", aToi = "YOURS!", equipee = "EQUIPPED",
	ilTeManque = "SHORT BY ", gagneLes = "  -  PLAY TO EARN IT", bientot = "COMING SOON",
	tout = "ALL", aMoi = "MINE", aAcheter = "FOR SALE", gagner = "EARN IT", defi = "WHEEL",
	roue = "WON ON THE WHEEL", jour7 = "GIFT FOR LOGGING IN 7 DAYS IN A ROW", sept = "7 DAYS", bientotDefi = "SOON: A CHALLENGE IS COMING",
	carrN = "CATCH HER IN CLOUDS LEVEL 10  (%d / 10)",
	carrV = "BEAT THE BANKER IN CITY LEVEL 10  (%d / 10)", aura = 'AURA RANK "%s"   (yours: "%s")',
	rangs = { "NOBODY", "NOTICED", "THEY'RE TALKING ABOUT YOU", "RENOWNED", "LOCAL LEGEND", "ASPHALT STAR", "MYTH", "SKY GOD" },
}
local SEUILS_AURA = { 0, 400, 1500, 4000, 10000, 24000, 55000, 120000 } -- AURA_RANKS du web

-- ════════ les familles (RARETES du web) : la couleur EST la rareté ════════
local RARETES = {
	{ id = "commun", c = Color3.fromRGB(185, 196, 214) },
	{ id = "rare", c = Color3.fromRGB(77, 184, 255) },
	{ id = "epique", c = Color3.fromRGB(199, 125, 255) },
	{ id = "legendaire", c = Color3.fromRGB(255, 215, 94) },
	{ id = "defi", c = Color3.fromRGB(94, 227, 122) },
}
local COULEUR_RAR: { [string]: Color3 } = {}
for _, r in RARETES do COULEUR_RAR[r.id] = r.c end
local function eurNombre(s: string?): number
	if not s then return 0 end
	local n = tonumber((string.gsub(string.gsub(s, ",", "."), "[^%d%.]", "")))
	return n or 0
end
local function ordre(i: number): number -- carOrdre : dans une famille, du plus accessible au plus dur
	local k = Catalogue[i].cond
	if k.k == "depart" then return -1 end
	if k.k == "prix" then return k.v end
	if k.k == "premium" then return eurNombre(k.eur) end
	if k.k == "roue" then return i end
	if k.k == "jour7" then return 500 + i end -- (9/10) LE DRAGON D'OR du 7e jour, après les exclusives de la roue
	if k.k == "aura" then return 100 + k.v end
	return 1e9
end
local FAMILLES: { [string]: { number } } = {}
local LISTE: { number } = {} -- tout le garage, dans l'ordre des familles (garageListe)
local RANG: { [number]: number } = {}
do
	for _, r in RARETES do FAMILLES[r.id] = {} end
	-- (carRetiree, 2/10 — Sacha : « supprimer ces 6 voitures du jeu, elles sont pas intéressantes ») une caisse RETIRÉE garde sa
	-- ligne (les sauvegardes désignent les caisses par leur numéro) mais elle n'est plus nulle part : ni famille, ni vignette, ni compteur
	for i, f in Catalogue do
		if not f.retire then table.insert(FAMILLES[f.rar] or FAMILLES.commun, i) end
	end
	for _, r in RARETES do
		table.sort(FAMILLES[r.id], function(a, b)
			local oa, ob = ordre(a), ordre(b)
			if oa ~= ob then return oa < ob end
			return a < b
		end)
		for _, i in FAMILLES[r.id] do
			table.insert(LISTE, i)
			RANG[i] = #LISTE
		end
	end
end

-- ════════ l'état ════════
local ctx: any = nil
local montre = 0          -- la caisse sur le plateau
local famille = "commun"  -- la famille dont on voit la bande
local onglet = "voiture"
local function profil(): any return ctx.profil() end
local function possede(i: number): boolean return table.find(profil().caisses, i) ~= nil end
local function rangAura(a: number): number
	local r = 1
	for k, v in SEUILS_AURA do if a >= v then r = k end end
	return r
end
local function gagnee(i: number): boolean -- carUnlockedVrai
	local k = Catalogue[i].cond
	if k.k == "depart" or possede(i) then return true end
	if k.k == "aura" then return rangAura(profil().aura or 0) - 1 >= k.v end
	return false
end
local function ouverte(i: number): boolean return Config.TEST_CAISSES == true or gagnee(i) end

-- ════════ les HABILLAGES (onglets PEINTURE · AILES · TRAINEES) ════════
local HABITS = Config.HABITS
local COUL_CAT = { peinture = Color3.fromRGB(255, 154, 216), aile = Color3.fromRGB(159, 232, 255), trainee = Color3.fromRGB(255, 176, 64) }
local essai: { [string]: string } = {}                    -- ce qu'on ESSAIE sur la caisse (pas forcément à soi)
local choisi = { peinture = 1, aile = 1, trainee = 1 }     -- l'article montré dans chaque onglet
local filtre = "tout"
local function tenue(): any return profil().porte or { peinture = "usine", aile = "panneaux", trainee = "nitro" } end
local function aHabit(cat: string, d: any): boolean
	if not d.p and not d.mis and not d.roue then return true end
	return table.find(profil().habits or {}, cat .. ":" .. d.id) ~= nil
end
local function habitsVitrine(): any
	local p = tenue()
	return { peinture = essai.peinture or p.peinture, aile = essai.aile or p.aile, trainee = essai.trainee or p.trainee }
end
local function passeFiltre(cat: string, d: any): boolean
	local a = aHabit(cat, d)
	return filtre == "tout" or (filtre == "moi" and a) or (filtre == "acheter" and not a and d.p ~= nil)
end

-- ════════════════════════════════════════════════════════════════════════════════════════════════
-- L'ATELIER (bâti une fois, à la première visite ; hors du monde tant que le garage est fermé)
-- Repère : mètres, centre du plateau à l'origine, la PORTE sur le mur +Z. La caméra regarde vers la porte.
-- ════════════════════════════════════════════════════════════════════════════════════════════════
local O = Vector3.new(0, 9000, 0)
local LARG, PROF, HAUT = 22, 26, 6.2
local POD = 0.12
local dossier: Folder? = nil
local plateau: Model
local porte: Model
local flammes: { BasePart } = {}
local tubeMalade: BasePart
local lampeCle: BasePart
local lampeRive: BasePart
local feuPorte: PointLight
local scanner: BasePart
local cible: Model
local vitrine: Model? = nil
local vitrinePg: any = nil

local function P(x: number, y: number, z: number): Vector3 return O + Vector3.new(x, y, z) * M end
local function bloc(nom: string, sx: number, sy: number, sz: number, x: number, y: number, z: number, couleur: Color3,
	matiere: Enum.Material?, parent: Instance?): Part
	local p = Instance.new("Part")
	p.Name = nom
	p.Anchored = true
	p.CanCollide = false
	p.CanQuery = false
	p.CanTouch = false
	p.Size = Vector3.new(sx, sy, sz) * M
	p.CFrame = CFrame.new(P(x, y, z))
	p.Color = couleur
	p.Material = matiere or Enum.Material.SmoothPlastic
	p.Parent = parent or dossier
	return p
end
-- un cylindre DEBOUT (axe vertical)
local function cyl(nom: string, rayon: number, h: number, x: number, y: number, z: number, couleur: Color3,
	matiere: Enum.Material?, parent: Instance?): Part
	local p = bloc(nom, h, rayon * 2, rayon * 2, x, y, z, couleur, matiere, parent)
	p.Shape = Enum.PartType.Cylinder
	p.CFrame = CFrame.new(P(x, y, z)) * CFrame.Angles(0, 0, math.pi / 2)
	return p
end
local function lampe(nom: string, x: number, y: number, z: number, couleur: Color3, eclat: number, portee: number, ombres: boolean?): (Part, PointLight)
	local p = bloc(nom, 0.1, 0.1, 0.1, x, y, z, couleur)
	p.Transparency = 1
	p.CastShadow = false
	local l = Instance.new("PointLight")
	l.Color = couleur
	l.Brightness = eclat
	l.Range = portee
	l.Shadows = ombres == true
	l.Parent = p
	return p, l
end
local function ecriteau(piece: BasePart, face: Enum.NormalId, txt: string, couleur: Color3, corps: number, fond: Color3?)
	local sg = Instance.new("SurfaceGui")
	sg.Face = face
	sg.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud
	sg.PixelsPerStud = 40
	sg.LightInfluence = 0
	sg.Brightness = 2
	sg.Parent = piece
	local t = inst("TextLabel", { BackgroundTransparency = fond and 0 or 1, BackgroundColor3 = fond or Color3.new(), Size = UDim2.fromScale(1, 1),
		FontFace = K.PIX, Text = txt, TextColor3 = couleur, TextSize = corps, TextWrapped = true }, sg)
	return t
end

local AFFICHE: { TextLabel }? = nil -- (les quatre valeurs de l'affiche RECORD PERSO, posées par batir)
local NUIT = Color3.fromRGB(24, 26, 44)
local MUR = Color3.fromRGB(58, 66, 124) -- (capture web : une TÔLE bleu-violet, éclairée — à 36,42,74 l'atelier était un trou noir)
local NERVURE = Color3.fromRGB(74, 84, 150)
local PLINTHE = Color3.fromRGB(26, 30, 54)
local ACIER = Color3.fromRGB(58, 64, 92)
local CYAN = Color3.fromRGB(95, 240, 255)
-- (v3, 5/10) LE PLATEAU PREND LA COULEUR DE LA RARETÉ : l'anneau, le cercle, les plots, le halo au sol, le scanner et la lampe de
-- rive glissent vers la couleur de la famille de la caisse montrée — une légendaire tourne sur de l'or, une épique sur du violet.
-- (rien d'ajouté : les mêmes pièces, recolorées dans Garage.rendu)
local R3: any = { plots = {}, halos = {}, teinte = CYAN }

local function batir()
	local d = Instance.new("Folder")
	d.Name = "CashCarAtelier"
	dossier = d
	-- ── la coque : sol verni, quatre murs, plafond ──
	local sol = bloc("Sol", LARG + 1, 0.4, PROF + 1, 0, -0.2, 0, NUIT)
	sol.Reflectance = 0.07
	bloc("Plafond", LARG + 1, 0.4, PROF + 1, 0, HAUT + 0.2, 0, Color3.fromRGB(16, 16, 28))
	bloc("MurFond", LARG + 1, HAUT, 0.4, 0, HAUT / 2, -PROF / 2 - 0.2, MUR)
	bloc("MurG", 0.4, HAUT, PROF + 1, LARG / 2 + 0.2, HAUT / 2, 0, MUR)
	bloc("MurD", 0.4, HAUT, PROF + 1, -LARG / 2 - 0.2, HAUT / 2, 0, MUR)
	-- le mur de la PORTE : deux piliers et un linteau autour d'une baie de 10 × 4,9 m
	bloc("PilierG", 6, HAUT, 0.4, 8, HAUT / 2, PROF / 2 + 0.2, MUR)
	bloc("PilierD", 6, HAUT, 0.4, -8, HAUT / 2, PROF / 2 + 0.2, MUR)
	local linteau = bloc("Linteau", 10, HAUT - 4.9, 0.4, 0, 4.9 + (HAUT - 4.9) / 2, PROF / 2 + 0.2, MUR)
	ecriteau(linteau, Enum.NormalId.Front, "CASH CAR", Color3.fromRGB(255, 90, 200), 46)
	for _, s in { -1, 1 } do
		bloc("Plinthe", 0.08, 1.0, PROF, s * (LARG / 2 - 0.02), 0.5, 0, PLINTHE)
		bloc("Montant", 0.3, 4.9, 0.3, s * 5.15, 2.45, PROF / 2 - 0.1, Color3.fromRGB(255, 196, 40))
		-- les bandes orange au sol, du plateau à la porte
		local b = bloc("Bande", 0.12, 0.02, 7.4, s * 3.3, 0.012, 9.2, Color3.fromRGB(255, 150, 30))
		b.CastShadow = false
	end
	bloc("PlintheFond", LARG, 1.0, 0.08, 0, 0.5, -PROF / 2 + 0.02, PLINTHE)
	-- la TÔLE ondulée : une nervure claire tous les 0,7 m, au fond et sur les deux flancs
	for k = 0, math.floor(LARG / 0.7) do
		bloc("Nervure", 0.16, HAUT - 1.1, 0.06, -LARG / 2 + 0.35 + k * 0.7, 1 + (HAUT - 1.1) / 2, -PROF / 2 + 0.03, NERVURE).CastShadow = false
	end
	for _, s in { -1, 1 } do
		for k = 0, math.floor(PROF / 0.7) - 1 do
			bloc("Nervure", 0.06, HAUT - 1.1, 0.16, s * (LARG / 2 - 0.03), 1 + (HAUT - 1.1) / 2, -PROF / 2 + 0.35 + k * 0.7, NERVURE).CastShadow = false
		end
	end
	-- les poutres et les six tubes (un qui grésille)
	for k, z in { -7.5, 0, 7.5 } do
		bloc("Poutre", LARG, 0.3, 0.3, 0, HAUT - 0.25, z, ACIER, Enum.Material.Metal)
		for _, x in { -5, 5 } do
			local t = bloc("Tube", 3.2, 0.12, 0.14, x, HAUT - 0.5, z, Color3.fromRGB(226, 236, 255), Enum.Material.Neon)
			t.CastShadow = false
			if k == 1 and x == 5 then tubeMalade = t end
		end
	end
	lampe("Plafonnier", 0, HAUT - 0.9, 0, Color3.fromRGB(190, 205, 255), 0.7, 60, true)

	-- ── LA PORTE sectionnelle (elle se lève au lâcher) et le rideau de FEU derrière ──
	porte = Instance.new("Model")
	porte.Name = "Porte"
	for k = 0, 5 do
		-- (v3 : acier brossé — à 214,218,230 la porte faisait un aplat BLANC derrière le nom de la caisse)
		local pan = bloc("Panneau", 10, 0.78, 0.12, 0, 0.42 + k * 0.816, PROF / 2 - 0.05, Color3.fromRGB(150, 156, 184), Enum.Material.Metal, porte)
		if k == 3 or k == 4 then
			for _, x in { -3, 0, 3 } do
				bloc("Hublot", 1.3, 0.26, 0.04, x, 0.42 + k * 0.816, PROF / 2 - 0.13, Color3.fromRGB(255, 120, 40), Enum.Material.Neon, porte).CastShadow = false
			end
		end
		if k == 0 then porte.PrimaryPart = pan end
	end
	porte.Parent = d
	bloc("Brasier", 10.6, 5.2, 0.2, 0, 2.6, PROF / 2 + 1.5, Color3.fromRGB(190, 46, 14), Enum.Material.Neon).CastShadow = false
	for k = 0, 19 do
		local f = bloc("Flamme", 0.5, 1, 0.14, -4.75 + k * 0.5, 1, PROF / 2 + 1.3,
			(k % 3 == 0) and Color3.fromRGB(255, 190, 60) or Color3.fromRGB(255, 110, 30), Enum.Material.Neon)
		f.CastShadow = false
		table.insert(flammes, f)
	end
	local _, fp = lampe("FeuPorte", 0, 2.2, PROF / 2 - 1.5, Color3.fromRGB(255, 130, 50), 0, 60, true)
	feuPorte = fp

	-- ── LE PLATEAU : un disque de fer cerclé de cyan, douze plots, un cercle intérieur ──
	plateau = Instance.new("Model")
	plateau.Name = "Plateau"
	local anneau = cyl("Anneau", 4.47, 0.10, 0, 0.05, 0, CYAN, Enum.Material.Neon, plateau)
	R3.anneau = anneau
	anneau.CastShadow = false
	local disque = cyl("Disque", 4.38, 0.12, 0, 0.06, 0, Color3.fromRGB(40, 44, 66), nil, plateau)
	disque.Reflectance = 0.2
	R3.cercle = cyl("Cercle", 3.22, 0.122, 0, 0.061, 0, Color3.fromRGB(40, 150, 170), Enum.Material.Neon, plateau)
	R3.cercle.CastShadow = false
	cyl("Coeur", 3.18, 0.124, 0, 0.062, 0, Color3.fromRGB(34, 38, 58), nil, plateau).Reflectance = 0.2
	for k = 0, 11 do
		local a = k / 12 * math.pi * 2
		local pl9 = bloc("Plot", 0.16, 0.03, 0.16, math.cos(a) * 4.05, 0.13, math.sin(a) * 4.05, CYAN, Enum.Material.Neon, plateau)
		pl9.CastShadow = false
		table.insert(R3.plots, pl9)
	end
	plateau.PrimaryPart = disque
	plateau.Parent = d
	-- le halo cyan qui lèche le sol autour du plateau
	for k = 0, 2 do
		local a = k / 3 * math.pi * 2 + 0.5
		local _, h9 = lampe("HaloPlateau", math.cos(a) * 5.4, 0.5, math.sin(a) * 5.4, CYAN, 0.3, 18)
		table.insert(R3.halos, h9)
	end
	-- le SCANNER du retourneur (un disque de lumière qui monte quand on change de caisse)
	scanner = cyl("Scanner", 3.0, 0.04, 0, 0.2, 0, CYAN, Enum.Material.Neon)
	scanner.Transparency = 1
	scanner.CastShadow = false

	-- ── le BAZAR (tout ce qui est haut reste à plus de 8,3 m du centre : la vue ne le traverse jamais) ──
	-- le distributeur rouge
	bloc("Distributeur", 0.9, 2.1, 1.2, 10.3, 1.05, 6.4, Color3.fromRGB(214, 40, 52))
	bloc("Vitrine", 0.05, 1.2, 0.8, 9.83, 1.3, 6.4, Color3.fromRGB(255, 120, 140), Enum.Material.Neon).CastShadow = false
	for k = 0, 2 do
		bloc("Canette", 0.06, 0.16, 0.7, 9.8, 0.95 + k * 0.36, 6.4, ({ Color3.fromRGB(90, 220, 255), Color3.fromRGB(255, 215, 94), Color3.fromRGB(120, 255, 150) })[k + 1], Enum.Material.Neon).CastShadow = false
	end
	-- l'affiche « RECORD PERSO » dans son cadre d'or
	bloc("CadreAffiche", 1.7, 2.5, 0.08, 7.4, 2.5, PROF / 2 - 0.05, Color3.fromRGB(255, 200, 60)).Reflectance = 0.3
	local aff = bloc("Affiche", 1.46, 2.26, 0.04, 7.4, 2.5, PROF / 2 - 0.11, Color3.fromRGB(58, 30, 112))
	-- (affichesMaj, L33816) L'AFFICHE PARLE : le titre, puis TES records — la meilleure partie, l'aura max, le palier moteur, la vitesse
	-- max ; tenus à jour à chaque ouverture du garage
	do
		local sg = Instance.new("SurfaceGui")
		sg.Face = Enum.NormalId.Front
		sg.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud
		sg.PixelsPerStud = 40
		sg.LightInfluence = 0
		sg.Brightness = 2
		sg.Parent = aff
		local function lig(txt: string, y: number, h: number, corps: number, c: Color3): TextLabel
			return inst("TextLabel", { BackgroundTransparency = 1, Size = UDim2.new(1, -16, 0, h), Position = UDim2.fromOffset(8, y), FontFace = K.PIX,
				Text = txt, TextColor3 = c, TextScaled = true, TextWrapped = false }, sg)
		end
		local OR9, BL9, LV9 = Color3.fromRGB(255, 215, 94), Color3.new(1, 1, 1), Color3.fromRGB(180, 168, 230)
		lig(FR and "RECORD" or "PERSONAL", 10, 18, 18, OR9)
		lig(FR and "PERSO" or "BEST", 30, 12, 12, BL9)
		AFFICHE = {}
		for k, nom in { FR and "MEILLEURE PARTIE" or "BEST RUN", FR and "AURA MAX" or "MAX AURA", FR and "PALIER MOTEUR" or "ENGINE TIER", FR and "VITESSE MAX" or "TOP SPEED" } do
			local y = 54 + (k - 1) * 40
			lig(nom, y, 9, 9, LV9)
			AFFICHE[k] = lig("-", y + 12, 16, 16, OR9)
		end
	end
	-- les piles de pneus
	for _, q in { { 8.9, 9.6, 3 }, { 9.7, 8.7, 2 }, { -9.6, -5.2, 4 }, { 9.6, -8.4, 3 } } do
		for k = 0, q[3] - 1 do
			cyl("Pneu", 0.42, 0.26, q[1], 0.13 + k * 0.27, q[2], Color3.fromRGB(20, 20, 26))
			cyl("Jante", 0.2, 0.27, q[1], 0.13 + k * 0.27, q[2], Color3.fromRGB(110, 116, 140), Enum.Material.Metal)
		end
	end
	-- les plots de chantier (sous 50 cm : ils ont le droit d'être près)
	for _, q in { { 6.3, 9.4 }, { 5.4, 10.6 }, { 7.3, 10.2 }, { -6.9, 6.6 } } do
		bloc("PlotBase", 0.42, 0.05, 0.42, q[1], 0.025, q[2], Color3.fromRGB(255, 110, 30))
		bloc("PlotBas", 0.28, 0.2, 0.28, q[1], 0.15, q[2], Color3.fromRGB(255, 110, 30))
		bloc("PlotBande", 0.21, 0.1, 0.21, q[1], 0.3, q[2], Color3.fromRGB(245, 245, 250))
		bloc("PlotHaut", 0.14, 0.14, 0.14, q[1], 0.42, q[2], Color3.fromRGB(255, 110, 30))
	end
	-- l'établi, son panneau d'outils, la servante
	bloc("Etabli", 0.9, 0.1, 3.4, -10.3, 0.9, 2.2, Color3.fromRGB(150, 100, 60), Enum.Material.Wood)
	bloc("EtabliCorps", 0.8, 0.85, 3.2, -10.35, 0.42, 2.2, Color3.fromRGB(46, 60, 110))
	bloc("PanneauOutils", 0.06, 1.5, 3.2, -10.9, 2.2, 2.2, Color3.fromRGB(70, 76, 108))
	for k, c in { Color3.fromRGB(255, 90, 90), Color3.fromRGB(255, 215, 94), Color3.fromRGB(90, 220, 255), Color3.fromRGB(190, 200, 220), Color3.fromRGB(120, 255, 150) } do
		bloc("Outil", 0.05, 0.6 - (k % 2) * 0.2, 0.12, -10.84, 2.2 + (k % 2) * 0.2, 0.9 + k * 0.45, c)
	end
	bloc("Servante", 0.7, 0.9, 1.0, -10.2, 0.5, -1.2, Color3.fromRGB(220, 44, 60))
	-- le rack et ses caisses
	for k = 0, 3 do
		bloc("Etagere", 0.9, 0.06, 4.2, -10.4, 0.5 + k * 0.95, -8.2, ACIER, Enum.Material.Metal)
		for j = 0, 3 do
			local c = ({ Color3.fromRGB(70, 110, 230), Color3.fromRGB(150, 90, 230), Color3.fromRGB(240, 170, 60), Color3.fromRGB(60, 190, 200) })[(k + j) % 4 + 1]
			if (k * 3 + j) % 5 ~= 0 then bloc("Carton", 0.7, 0.5, 0.8, -10.4, 0.78 + k * 0.95, -9.8 + j * 1.05, c) end
		end
	end
	for _, z in { -10.2, -6.2 } do bloc("RackPied", 0.08, 3.6, 0.08, -10.0, 1.8, z, ACIER, Enum.Material.Metal) end
	-- les bidons bleus et le compresseur
	for _, q in { { -7.7, 11.2 }, { -8.5, 10.5 }, { -8.6, 11.5 } } do
		cyl("Bidon", 0.3, 0.9, q[1], 0.45, q[2], Color3.fromRGB(50, 96, 226))
	end
	bloc("Compresseur", 0.8, 0.7, 1.5, 10.2, 0.55, -3.2, Color3.fromRGB(240, 120, 40))
	bloc("CompresseurPied", 0.7, 0.2, 1.3, 10.2, 0.1, -3.2, Color3.fromRGB(30, 30, 40))
	-- le socle des MISSIONS : un fût, deux joncs verts, la cible qui tourne
	cyl("Fut", 0.46, 1.0, -6.1, 0.5, 9.0, Color3.fromRGB(44, 50, 70))
	cyl("Jonc", 0.48, 0.07, -6.1, 0.3, 9.0, Color3.fromRGB(94, 227, 122), Enum.Material.Neon).CastShadow = false
	cyl("Jonc", 0.48, 0.07, -6.1, 0.82, 9.0, Color3.fromRGB(94, 227, 122), Enum.Material.Neon).CastShadow = false
	cible = Instance.new("Model")
	cible.Name = "Cible"
	for k, q in { { 0.5, Color3.fromRGB(94, 227, 122), 0.04 }, { 0.36, Color3.fromRGB(20, 40, 30), 0.05 }, { 0.2, Color3.fromRGB(94, 227, 122), 0.06 } } do
		local c = cyl("Disque" .. k, q[1], q[3], -6.1, 1.75, 9.0, q[2], Enum.Material.Neon, cible)
		c.CFrame = CFrame.new(P(-6.1, 1.75, 9.0)) * CFrame.Angles(0, math.pi / 2, 0)
		c.CastShadow = false
		if k == 1 then cible.PrimaryPart = c end
	end
	cible.Parent = d
	lampe("LueurCible", -6.1, 1.7, 8.2, Color3.fromRGB(94, 227, 122), 0.8, 14)
	-- la guirlande d'ampoules, tendue devant la porte
	local tons = { Color3.fromRGB(255, 90, 200), CYAN, Color3.fromRGB(255, 215, 94), Color3.fromRGB(120, 255, 150) }
	for k = 0, 17 do
		local u = k / 17
		local b = bloc("Ampoule", 0.13, 0.13, 0.13, -10.4 + u * 20.8, 5.45 - 0.7 * (1 - (2 * u - 1) ^ 2), PROF / 2 - 1.4, tons[k % 4 + 1], Enum.Material.Neon)
		b.Shape = Enum.PartType.Ball
		b.CastShadow = false
	end
	-- les deux lampes de studio : elles suivent la vue (la clé chaude, la rive cyan)
	lampeCle = lampe("Cle", 0, 4.1, -5.2, Color3.fromRGB(255, 220, 168), 1.0, 60, true)
	local rive9
	lampeRive, rive9 = lampe("Rive", 0, 2.3, 6, CYAN, 0.45, 52)
	R3.rive = rive9
	R3.teinte = CYAN
	-- L'ARGENT DE L'ATELIER : le plan des tas de billets (ils se bâtissent quand le compte les demande)
	Argent.batir(d, O, M, LARG, PROF)
end

-- l'ambiance : dedans, le soleil du niveau n'existe pas. On éteint le dehors le temps de la visite (côté joueur seulement).
local sauve: any = nil
local function ambiance(on: boolean)
	local atm = Lighting:FindFirstChildOfClass("Atmosphere")
	local rays = Lighting:FindFirstChildOfClass("SunRaysEffect")
	if on then
		if sauve then return end
		sauve = { b = Lighting.Brightness, a = Lighting.Ambient, o = Lighting.OutdoorAmbient, e = Lighting.ExposureCompensation,
			d = Lighting.EnvironmentDiffuseScale, s = Lighting.EnvironmentSpecularScale, dens = atm and atm.Density, r = rays and rays.Enabled }
		Lighting.Brightness = 0
		-- (4/10, mesuré au banc : quand la machine rame, Roblox baisse la qualité et COUPE les lampes — or l'atelier n'est éclairé que
		-- par elles : à (46, 44, 84) il devenait NOIR, la caisse invisible. Sur un petit téléphone, ce serait tout le temps. Une
		-- ambiance de secours plus claire : l'atelier se lit sans lampes, et garde sa pénombre quand elles brillent)
		Lighting.Ambient = Color3.fromRGB(112, 106, 160) -- (5/10 : 82,78,130 restait trop sombre lampes coupées — la caisse se perdait)
		Lighting.OutdoorAmbient = Color3.fromRGB(112, 106, 160)
		Lighting.ExposureCompensation = -0.1
		Lighting.EnvironmentDiffuseScale = 0.12
		Lighting.EnvironmentSpecularScale = 0.25
		if atm then atm.Density = 0 end
		if rays then rays.Enabled = false end
	elseif sauve then
		Lighting.Brightness = sauve.b
		Lighting.Ambient = sauve.a
		Lighting.OutdoorAmbient = sauve.o
		Lighting.ExposureCompensation = sauve.e
		Lighting.EnvironmentDiffuseScale = sauve.d
		Lighting.EnvironmentSpecularScale = sauve.s
		if atm and sauve.dens then atm.Density = sauve.dens end
		if rays and sauve.r ~= nil then rays.Enabled = sauve.r end
		sauve = nil
	end
end

-- ════════════════════════════════════════════════════════════════════════════════════════════════
-- L'INTERFACE — v3 (5/10, « le design du garage n'est pas au niveau »). La disposition du web reste (la fiche en haut à gauche,
-- la CONSOLE en bas à droite) ; tout est redessiné à la charte du menu :
--   · ce qu'on TOUCHE est une PLAQUE PENCHÉE du kit (onglets, familles, barre d'action) — les mêmes que les tuiles de l'accueil ;
--   · UN lingot d'or par écran : la décision quand on PEUT la prendre (ACHETER, ÉQUIPER, VOIR), sinon JOUER ;
--   · la RARETÉ se lit partout à la même couleur — et maintenant aussi en toutes lettres (la puce de la fiche, la famille ouverte) ;
--   · les cartes sont teintées de leur famille ; leur prix est VERT quand on peut payer, ROSE quand il manque de l'argent ;
--   · une caisse sans photo (le budget de formes de Roblox est compté) montre sa SILHOUETTE de profil en pixels, à sa couleur.
-- ════════════════════════════════════════════════════════════════════════════════════════════════
local U: any = {}
local CASH = Color3.fromRGB(125, 255, 155)
local OR1 = Color3.fromRGB(255, 226, 122)
local ROUGE = Color3.fromRGB(255, 74, 100)
local ROSE_PRIX = Color3.fromRGB(255, 150, 172) -- (un prix qu'on ne peut pas encore payer : lisible, sans crier comme le rouge)
local ENCRE_OR = Color3.fromRGB(44, 20, 2)
-- LA CONSOLE AUX PROPORTIONS DU WEB : dessinée à 470 × 362 puis agrandie d'un bloc (UIScale × ECH_CONSOLE) ; ses textes sont écrits
-- en conséquence (la police pixel fait 5/9 de son TextSize : voir Hud).
local W_CONSOLE, H_CONSOLE, ECH_CONSOLE = 470, 362, 1.6
-- LA GRILLE DE LA CONSOLE (unités de la console) : chaque rangée qu'on touche fait au moins 44 + 7 (la tranche de la plaque compte
-- dans la cible) — sur un téléphone couché de 390 px, ~40 px réels pour les familles, 45 et plus pour tout le reste
-- (v4, 6/10) les familles 44 → 46 de haut, et leur cible déborde de 4 en haut (la tranche en bas) : 40 → 45 px réels sur un téléphone
local Y = { ong = 14, hOng = 50, pas = 80, hPas = 46, bande = 138, hBande = 134, bar = 284, hBar = 62, ecart = 8, pente = math.tan(math.rad(12)) }
local function ombrer(c: Color3, k: number): Color3 return Color3.new(c.R * k, c.G * k, c.B * k) end
-- les teintes d'une plaque à partir de sa couleur (la recette de Hud : tuile) — le fond, la tranche, le biseau
-- (v4 : la tranche n'est plus presque noire — la couleur profonde de la plaque, comme les tuiles du kit)
local function teintes(c: Color3): (Color3, Color3, Color3)
	return ombrer(c, 0.34):Lerp(C.carbone, 0.42), ombrer(c, 0.44), ombrer(c, 0.72):Lerp(C.carbone, 0.2)
end
local TRANCHE_OFF = Color3.fromRGB(16, 12, 36) -- la tranche d'un onglet, d'une famille au repos
local OR_FOND, OR_BISEAU = Color3.fromRGB(255, 190, 32), Color3.fromRGB(255, 248, 170)
local PLAQUE_OFF = Color3.fromRGB(30, 25, 58) -- un onglet, une famille au repos
local function vif(c: Color3): Color3 return ombrer(c, 0.62):Lerp(C.carbone, 0.25) end -- la même, allumée à sa couleur
local NOM_RAR = FR and { commun = "COMMUN", rare = "RARE", epique = "EPIQUE", legendaire = "LEGENDAIRE", defi = "DEFI" }
	or { commun = "COMMON", rare = "RARE", epique = "EPIC", legendaire = "LEGENDARY", defi = "CHALLENGE" }

-- UNE PLAQUE PENCHÉE de la barre d'action (Hud.kit.penche) : la boîte (qu'on place), la plaque (qui s'enfonce), le bouton (il couvre
-- aussi la tranche : la cible gagne ses 7 px) et une PILE centrée — l'icône, la petite ligne, la grande ligne.
-- `dore` : le LINGOT (or, encre brune, le reflet qui passe) ; sinon une plaque teintée de `c`, son filet à gauche.
local function plaqueP(parent: Instance, nom: string, c: Color3?, dore: boolean?): any
	local fond, tranche, biseau
	if dore then
		fond, tranche, biseau = OR_FOND, C.orSh, OR_BISEAU
	else
		fond, tranche, biseau = teintes(c :: Color3)
	end
	local boite, plaque, b = K.penche(parent, UDim2.fromOffset(100, Y.hBar), UDim2.new(), nil, fond, (not dore) and c or nil, tranche, biseau)
	boite.Name = nom
	boite.Visible = false
	b.Size = UDim2.new(1, 0, 1, 7)
	b.ZIndex = 4
	K.retour(b, plaque)
	-- (v4) la pile se centre sur la FACE penchée, pas sur la boîte (moins la pente, et le filet à gauche) : dans les plaques étroites
	-- de HOME et BOUTIQUE (58), la maison et le panier mordaient sur le filet — mesuré au banc
	local d = math.floor(Y.hBar * Y.pente + 0.5)
	local dec = dore and 0 or 5
	local pile = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, -d - dec, 1, 0), Position = UDim2.fromOffset(math.floor(d / 2) + dec, 0), ZIndex = 3 }, plaque)
	inst("UIListLayout", { FillDirection = Enum.FillDirection.Vertical, HorizontalAlignment = Enum.HorizontalAlignment.Center,
		VerticalAlignment = Enum.VerticalAlignment.Center, Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder }, pile)
	local encre = dore and ENCRE_OR or C.texte
	local function ligne(ordre: number): TextLabel
		local t = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIXI, TextSize = 14, Text = "", TextColor3 = encre,
			Size = UDim2.new(1, -10, 0, 12), LayoutOrder = ordre, Visible = false }, pile)
		if not dore then inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual }, t) end
		return t
	end
	return { boite = boite, plaque = plaque, b = b, pile = pile, l1 = ligne(2), l2 = ligne(3), encre = encre, icos = {} }
end
-- une icône pixel dans la pile d'une plaque (rangée sous le nom « maison3 » : la maison à 3 px)
local function icoP(pl: any, nom: string, px: number, couleur: any)
	local f = K.iconeRelief(pl.pile, nom, px, couleur) -- (v4 : en relief, avec son ombre — un picto cyan sur une plaque cyan se détache)
	f.LayoutOrder = 1
	f.Visible = false
	pl.icos[nom .. px] = f
end
-- ce que dit une plaque : l'icône, la petite ligne, la grande (son corps, sa couleur)
local function dire(pl: any, ico: string?, l1: string?, l2: string?, corps: number?, couleur2: Color3?)
	for k, f in pl.icos do f.Visible = k == ico end
	pl.l1.Visible = l1 ~= nil
	pl.l1.Text = l1 or ""
	pl.l1.TextSize = 12
	pl.l1.Size = UDim2.new(1, -10, 0, 10)
	local cs = corps or 24
	pl.l2.Visible = l2 ~= nil
	pl.l2.Text = l2 or ""
	pl.l2.TextSize = cs
	pl.l2.Size = UDim2.new(1, -10, 0, math.floor(cs * 0.8))
	pl.l2.TextColor3 = couleur2 or pl.encre
end
-- le REFLET du lingot (comme Hud : lingot) — une barre de lumière en biais traverse l'or toutes les 3 s : c'est LE bouton
local function refleter(pl: any)
	local d = math.floor(Y.hBar * Y.pente + 0.5)
	local clip = inst("Frame", { BackgroundTransparency = 1, ClipsDescendants = true, Size = UDim2.new(1, -d, 1, -6), Position = UDim2.fromOffset(math.floor(d / 2), 3),
		ZIndex = 2 }, pl.plaque)
	local r = inst("Frame", { BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.4, BorderSizePixel = 0, Size = UDim2.new(0, 26, 1, 8),
		Position = UDim2.new(-0.2, 0, 0, -4), Rotation = 12 }, clip)
	inst("UIGradient", { Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1), NumberSequenceKeypoint.new(0.5, 0.1), NumberSequenceKeypoint.new(1, 1) }) }, r)
	task.spawn(function()
		while r.Parent do
			if pl.boite.Visible and U.racine and U.racine.Visible then
				r.Position = UDim2.new(-0.2, 0, 0, -4)
				TweenService:Create(r, TweenInfo.new(0.7, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut), { Position = UDim2.new(1.15, 0, 0, -4) }):Play()
			end
			task.wait(3.2)
		end
	end)
end
local function poser(pl: any, x: number, w: number)
	pl.boite.Visible = true
	pl.boite.Position = UDim2.fromOffset(x, Y.bar)
	pl.boite.Size = UDim2.fromOffset(w, Y.hBar)
end

-- une plaque d'ONGLET ou de FAMILLE : sombre au repos, repeinte quand elle s'allume (K.repeindre) ; son contenu en pile (onglet :
-- l'icône au-dessus du mot) ou en ligne (famille : la gemme devant le compte)
local function plaqueO(parent: Instance, h: number, w: number, pos: UDim2, vertical: boolean): any
	local boite, plaque, b = K.penche(parent, UDim2.fromOffset(w, h), pos, nil, PLAQUE_OFF, nil, TRANCHE_OFF, nil)
	-- (la cible couvre la tranche ; une famille, plus basse, déborde aussi de 4 en haut — jamais sur la rangée des onglets)
	if vertical then b.Size = UDim2.new(1, 0, 1, 7) else
		b.Size = UDim2.new(1, 0, 1, 11)
		b.Position = UDim2.fromOffset(0, -4)
	end
	b.ZIndex = 4
	K.retour(b, plaque)
	local d = math.floor(h * Y.pente + 0.5)
	local pile = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, -d, 1, 0), Position = UDim2.fromOffset(math.floor(d / 2), 0), ZIndex = 3 }, plaque)
	inst("UIListLayout", { FillDirection = vertical and Enum.FillDirection.Vertical or Enum.FillDirection.Horizontal,
		HorizontalAlignment = Enum.HorizontalAlignment.Center, VerticalAlignment = Enum.VerticalAlignment.Center,
		Padding = UDim.new(0, vertical and 6 or 8), SortOrder = Enum.SortOrder.LayoutOrder }, pile)
	local txt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIXI, TextSize = 13, Text = "", TextColor3 = C.terne,
		TextXAlignment = vertical and Enum.TextXAlignment.Center or Enum.TextXAlignment.Left, -- (en ligne : un débord part à droite, jamais sur la gemme)
		AutomaticSize = vertical and Enum.AutomaticSize.None or Enum.AutomaticSize.X, Size = vertical and UDim2.new(1, 0, 0, 11) or UDim2.fromOffset(0, 11),
		LayoutOrder = 2 }, pile)
	inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual }, txt)
	return { boite = boite, plaque = plaque, b = b, pile = pile, txt = txt, allume = nil :: boolean? }
end
-- allumer / éteindre une plaque d'onglet ou de famille (on ne repeint que si ça change : ~40 bandes par plaque)
local function allumer(o: any, on: boolean, fond: Color3)
	if o.allume == on and o.fond == fond then return end
	o.allume, o.fond = on, fond
	K.repeindre(o.plaque, fond)
	-- (v4) la tranche s'allume avec la face : l'onglet ouvert, la famille regardée sont des touches de LEUR couleur, épaisses
	local tr = o.boite:FindFirstChild("Tranche")
	if tr then (tr :: Frame).BackgroundColor3 = on and ombrer(fond, 0.62) or TRANCHE_OFF end
	o.txt.TextColor3 = on and C.texte or C.texte2
end
-- la GEMME de rareté (un losange cerné d'encre)
-- (dans un porteur droit : un UIListLayout rend ses enfants sans leur rotation — le losange sortait en carré)
local function gemme(parent: Instance, c: Color3, cote: number, ordre: number?): Frame
	local porteur = inst("Frame", { Name = "Gemme", BackgroundTransparency = 1, Size = UDim2.fromOffset(math.ceil(cote * 1.42), math.ceil(cote * 1.42)),
		LayoutOrder = ordre or 1 }, parent)
	local g9 = inst("Frame", { Name = "Losange", BorderSizePixel = 0, BackgroundColor3 = c, Size = UDim2.fromOffset(cote, cote), Rotation = 45,
		AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.5) }, porteur)
	inst("UIStroke", { Color = C.encre, Thickness = 2 }, g9)
	return g9
end

-- ── LES CARTES ──
local FOND_CARTE = Color3.fromRGB(26, 22, 50)
-- le fond d'une carte : la nuit en haut, sa FAMILLE qui monte du bas (plus vive sur la carte montrée)
local function degradeCarte(c: Color3, vive: boolean): ColorSequence
	local haut = vive and Color3.fromRGB(54, 46, 100) or FOND_CARTE
	return ColorSequence.new({ ColorSequenceKeypoint.new(0, haut), ColorSequenceKeypoint.new(0.45, haut:Lerp(c, 0.08)),
		ColorSequenceKeypoint.new(1, ombrer(c, vive and 0.66 or 0.44)) })
end
-- la PUCE d'une carte, en bas à droite : un prix, BOUTIQUE, ROUE, la coche verte (à moi) ou ÉQUIPÉE sur fond d'or
local function puceCarte(cadre: Frame): any
	local p = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = C.encre, BackgroundTransparency = 0.12, AnchorPoint = Vector2.new(1, 1),
		Position = UDim2.new(1, -4, 1, -6), Size = UDim2.fromOffset(0, 15), AutomaticSize = Enum.AutomaticSize.X, ZIndex = 3 }, cadre)
	inst("UIPadding", { PaddingLeft = UDim.new(0, 4), PaddingRight = UDim.new(0, 3) }, p)
	inst("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, VerticalAlignment = Enum.VerticalAlignment.Center, Padding = UDim.new(0, 3),
		SortOrder = Enum.SortOrder.LayoutOrder }, p)
	local coche = K.icone(p, "coche", 1, CASH)
	coche.LayoutOrder = 1
	local txt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIX, TextSize = 11, Text = "", TextColor3 = CASH,
		AutomaticSize = Enum.AutomaticSize.X, Size = UDim2.fromOffset(0, 15), LayoutOrder = 2 }, p)
	return { f = p, coche = coche, txt = txt }
end
local function direPuce(pc: any, txt: string?, couleur: Color3?, coche: boolean?, fond: Color3?)
	pc.f.Visible = (txt ~= nil and txt ~= "") or coche == true
	pc.coche.Visible = coche == true
	pc.txt.Visible = txt ~= nil and txt ~= ""
	pc.txt.Text = txt or ""
	pc.txt.TextColor3 = couleur or CASH
	pc.f.BackgroundColor3 = fond or C.encre
	pc.f.BackgroundTransparency = fond and 0 or 0.12
end

-- LA SILHOUETTE d'une caisse sans photo : un coupé de PROFIL en pixels (nez à gauche, comme les photos), à la couleur de sa laque —
-- la petite voiture vue de face d'avant ressemblait à un envahisseur de l'espace. # carrosserie (claire en haut, sombre en bas),
-- w vitres, r pneus, h jantes, l phare, t feu
local SILHOUETTE = {
	"........######......",
	"......##ww#wwww#....",
	".....#www#wwwwww#...",
	"..################..",
	"l##################t",
	"####rrr#######rrr###",
	"...rrhrr.....rrhrr..",
	"...rrhrr.....rrhrr..",
	"....rrr.......rrr...",
}
local function silhouette(parent: Instance, px: number, laque: Color3, sombre: boolean): Frame
	local f = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(20 * px, 9 * px), AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.new(0.5, 0, 0.5, -5) }, parent)
	local k = sombre and 0.5 or 1
	local claire, sombreC = laque:Lerp(Color3.new(1, 1, 1), 0.3), ombrer(laque, 0.62)
	local function teinte(ch: string, y: number): Color3
		local c
		if ch == "#" then c = (y <= 3) and claire or ((y == 4) and laque or sombreC)
		elseif ch == "w" then c = Color3.fromRGB(150, 220, 255)
		elseif ch == "r" then c = Color3.fromRGB(16, 14, 28)
		elseif ch == "h" then c = Color3.fromRGB(160, 164, 186)
		elseif ch == "l" then c = Color3.fromRGB(255, 236, 160)
		else c = Color3.fromRGB(255, 60, 80) end
		return ombrer(c, k)
	end
	-- l'ombre au sol, sous les roues
	inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = C.encre, BackgroundTransparency = 0.45, Size = UDim2.fromOffset(18 * px, px),
		Position = UDim2.fromOffset(px, 9 * px) }, f)
	for y, ligne in SILHOUETTE do
		local x = 1
		while x <= #ligne do
			local ch = string.sub(ligne, x, x)
			if ch ~= "." then
				local x1 = x
				while x1 < #ligne and string.sub(ligne, x1 + 1, x1 + 1) == ch do x1 += 1 end
				inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = teinte(ch, y - 1), Size = UDim2.fromOffset((x1 - x + 1) * px, px),
					Position = UDim2.fromOffset((x - 1) * px, (y - 1) * px) }, f)
				x = x1 + 1
			else
				x += 1
			end
		end
	end
	return f
end

local tuiles: { [number]: any } = {}
local RESERVE = 9000 -- triangles qu'une photo ne prend jamais (la caisse du plateau en a besoin)
local fileN = 0 -- le numéro de la file de photos en cours (changer de famille l'annule)
local CARTE_L, CARTE_H = 106, 60

-- LA PHOTO d'une caisse (carPhoto du web) : trois-quarts avant, nez à gauche, objectif de 24° — calée un peu HAUT dans la carte
-- (la puce du prix vit en bas à droite)
local function photographier(t: any, i: number)
	local m = Caisse.vignette(i)
	if not m then return end
	if not t.cadre.Parent then
		Caisse.rendre(m)
		return
	end
	local corps = m.PrimaryPart :: BasePart
	local az, el = 0.82, 0.27
	local dir = Vector3.new(-math.sin(az) * math.cos(el), math.sin(el), -math.cos(az) * math.cos(el))
	local projete = corps.Size.Z * math.sin(az) + corps.Size.X * math.cos(az)
	local dist = projete / 0.86 / (2 * math.tan(math.rad(12)) * (CARTE_L / CARTE_H)) + corps.Size.Z * 0.18
	local cam = Instance.new("Camera")
	cam.FieldOfView = 24
	local vise = corps.Position + Vector3.new(0, -corps.Size.Y * 0.2, 0)
	cam.CFrame = CFrame.lookAt(vise + dir * dist, vise)
	cam.Parent = t.vp
	t.vp.CurrentCamera = cam
	t.vp.LightDirection = (-dir * 0.5 + Vector3.new(0.5, -1, 0.2)).Unit
	m.Parent = t.vp
	t.pastille.Visible = false
	t.modele = m
end

local function majTuile(i: number)
	local t = tuiles[i]
	if not t then return end
	local f = Catalogue[i]
	local aMoi = possede(i) or f.cond.k == "depart"
	local equipee = profil().caisse == i
	local sombre = not aMoi
	local vue = i == montre
	t.vp.ImageColor3 = sombre and Color3.fromRGB(104, 96, 140) or Color3.new(1, 1, 1)
	t.image.ImageColor3 = t.vp.ImageColor3 -- (une caisse pas encore à soi : la vignette assombrie, comme la photo)
	if not t.aImage and t.silSombre ~= sombre then
		if t.sil then t.sil:Destroy() end
		t.sil = silhouette(t.pastille, 3, t.laque, sombre)
		t.silSombre = sombre
	end
	t.verrou.Visible = sombre
	if equipee then
		direPuce(t.puce, L.equipee, ENCRE_OR, false, Color3.fromRGB(255, 199, 42))
	elseif aMoi then
		direPuce(t.puce, nil, nil, true)
	elseif f.cond.k == "prix" then
		-- (4/10, version publique : Roblox se paie en Robux — plus aucun prix en euros à l'écran ; la caisse de la boutique dit BOUTIQUE,
		-- celle de la roue dit ROUE)
		direPuce(t.puce, Hud.argent(f.cond.v), (profil().compte or 0) >= f.cond.v and CASH or ROSE_PRIX)
	elseif f.cond.k == "premium" then
		direPuce(t.puce, prixRobux(i), OR1)
	elseif f.cond.k == "roue" then
		direPuce(t.puce, L.defi, OR1)
	elseif f.cond.k == "jour7" then
		direPuce(t.puce, L.sept, OR1)
	elseif f.cond.k == "bientot" then
		direPuce(t.puce, FR and "BIENTOT" or "SOON", C.lavande)
	elseif f.cond.k == "aura" then
		direPuce(t.puce, "AURA", C.lavande)
	else
		direPuce(t.puce, nil)
	end
	t.trait.Color = vue and Color3.new(1, 1, 1):Lerp(t.rar, 0.3) or ombrer(t.rar, 0.5)
	t.trait.Thickness = vue and 3 or 2
	t.grad.Color = degradeCarte(t.rar, vue)
end

local function creerTuile(i: number, rang: number): any
	local f = Catalogue[i]
	local c = COULEUR_RAR[f.rar]
	local cadre = inst("Frame", { Name = "T" .. i, BorderSizePixel = 0, BackgroundColor3 = Color3.new(1, 1, 1), LayoutOrder = rang, ClipsDescendants = true }, U.bande)
	local grad = inst("UIGradient", { Rotation = 90, Color = degradeCarte(c, false) }, cadre)
	local trait = inst("UIStroke", { Color = ombrer(c, 0.5), Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, cadre)
	local vp = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Ambient = Color3.fromRGB(150, 150, 178),
		LightColor = Color3.fromRGB(255, 244, 230) }, cadre)
	-- (9/10) LA VIGNETTE DESSINÉE de la caisse (Caisse.vignetteImage) : sa vraie forme, ses vraies couleurs, tout de suite — la photo
	-- 3D n'est plus prise que si l'image manque
	local image = inst("ImageLabel", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), ScaleType = Enum.ScaleType.Fit }, cadre)
	local ei = Caisse.vignetteImage(i)
	if ei then image.ImageContent = Content.fromObject(ei) else image.Visible = false end
	-- en attendant la photo (ou quand le budget de formes de Roblox la refuse) : la SILHOUETTE (posée par majTuile)
	local pastille = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = ei == nil }, cadre)
	inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = c, Size = UDim2.new(1, 0, 0, 3), Position = UDim2.new(0, 0, 1, -3), ZIndex = 2 }, cadre)
	local puce = puceCarte(cadre)
	-- le cadenas : une petite plaque d'encre en haut à gauche
	local verrou = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = C.encre, BackgroundTransparency = 0.12, Size = UDim2.fromOffset(15, 15),
		Position = UDim2.fromOffset(4, 4), ZIndex = 3, Visible = false }, cadre)
	K.icone(verrou, "verrou", 1, Color3.fromRGB(200, 190, 255), UDim2.fromOffset(3, 3))
	local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", ZIndex = 5 }, cadre)
	local t = { cadre = cadre, grad = grad, trait = trait, vp = vp, pastille = pastille, puce = puce, verrou = verrou, b = b, rar = c,
		laque = Color3.fromHex(string.format("%06x", f.laque)), sil = nil :: Frame?, silSombre = nil :: boolean?, image = image,
		aImage = ei ~= nil }
	b.Activated:Connect(function()
		Sons.jouer("tap")
		Hud.vibre(6)
		Garage.sauter(i)
	end)
	-- le SURVOL (souris) : le liseré de la carte s'éclaire — on sait ce qu'on va toucher
	b.MouseEnter:Connect(function() if i ~= montre then trait.Color = c:Lerp(Color3.new(1, 1, 1), 0.15) end end)
	b.MouseLeave:Connect(function() majTuile(i) end)
	return t
end

-- une carte d'HABILLAGE : le nuancier de la laque, le ruban de la traînée, l'aile et son nom
local tuilesH: { any } = {}
local function majCartesHabits()
	local cat = onglet
	for _, t in tuilesH do
		local vue = t.j == choisi[cat]
		t.trait.Color = vue and Color3.new(1, 1, 1):Lerp(COUL_CAT[cat], 0.3) or ombrer(COUL_CAT[cat], 0.5)
		t.trait.Thickness = vue and 3 or 2
		t.grad.Color = degradeCarte(COUL_CAT[cat], vue)
	end
end
local function majBandeHabits()
	fileN += 1
	for i, t in tuiles do
		Caisse.rendre(t.modele)
		t.cadre:Destroy()
		tuiles[i] = nil
	end
	for _, t in tuilesH do t.cadre:Destroy() end
	table.clear(tuilesH)
	local cat = onglet
	local cc = COUL_CAT[cat]
	local p = tenue()
	local compte = profil().compte or 0
	for j, d in HABITS[cat] do
		if passeFiltre(cat, d) then
			local cadre = inst("Frame", { Name = "H" .. j, BorderSizePixel = 0, BackgroundColor3 = Color3.new(1, 1, 1), LayoutOrder = j, ClipsDescendants = true }, U.bande)
			local grad = inst("UIGradient", { Rotation = 90, Color = degradeCarte(cc, false) }, cadre)
			local trait = inst("UIStroke", { Color = ombrer(cc, 0.5), Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, cadre)
			if cat == "aile" then
				-- (5/10) une aile en pixels à gauche du nom : la case disait un mot, elle montre une aile
				local ic9 = K.icone(cadre, "aile", 3, { { 0.4, Color3.fromRGB(220, 246, 255) }, { 1, cc } }, UDim2.new(0, 7, 0.5, -6), Vector2.new(0, 0.5))
				ic9.ZIndex = 2
				inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIX, TextSize = 11, TextWrapped = true, Text = FR and d.nom or d.en, TextColor3 = C.texte,
					Size = UDim2.new(1, -42, 1, -22), Position = UDim2.fromOffset(38, 3), TextXAlignment = Enum.TextXAlignment.Left, ZIndex = 2 }, cadre)
			else
				-- le NUANCIER : un échantillon cerné d'encre (la traînée : un ruban qui s'efface)
				local nu = inst("Frame", { BorderSizePixel = 0, Size = UDim2.new(1, -16, 0, (cat == "trainee") and 12 or 24), Position = UDim2.fromOffset(8, (cat == "trainee") and 14 or 7),
					BackgroundColor3 = Color3.new(1, 1, 1), ZIndex = 2 }, cadre)
				if cat ~= "trainee" then inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, nu) end
				if d.grad then
					inst("UIGradient", { Rotation = 20, Color = ColorSequence.new({ ColorSequenceKeypoint.new(0, d.grad[1]), ColorSequenceKeypoint.new(0.5, d.grad[2]),
						ColorSequenceKeypoint.new(1, d.grad[3]) }) }, nu)
				elseif d.arcenciel then
					inst("UIGradient", { Color = ColorSequence.new({ ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 60, 60)), ColorSequenceKeypoint.new(0.25, Color3.fromRGB(255, 190, 40)),
						ColorSequenceKeypoint.new(0.5, Color3.fromRGB(110, 255, 90)), ColorSequenceKeypoint.new(0.75, Color3.fromRGB(60, 220, 255)), ColorSequenceKeypoint.new(1, Color3.fromRGB(255, 70, 220)) }) }, nu)
				elseif d.c then
					nu.BackgroundColor3 = d.c
				elseif cat == "peinture" then
					nu.BackgroundColor3 = Color3.fromHex(string.format("%06x", Catalogue[montre].laque)) -- « d'origine » : la teinte de CETTE caisse
				else
					nu.BackgroundColor3 = Color3.fromRGB(255, 122, 36)
				end
				if cat == "trainee" then inst("UIGradient", { Transparency = NumberSequence.new(0, 0.85) }, nu) end
			end
			inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = cc, Size = UDim2.new(1, 0, 0, 3), Position = UDim2.new(0, 0, 1, -3), ZIndex = 2 }, cadre)
			local puce = puceCarte(cadre)
			if p[cat] == d.id then
				direPuce(puce, L.equipee, ENCRE_OR, false, Color3.fromRGB(255, 199, 42))
			elseif aHabit(cat, d) then
				direPuce(puce, nil, nil, true)
			elseif d.p then
				direPuce(puce, Hud.argent(d.p), compte >= d.p and CASH or ROSE_PRIX)
			else
				direPuce(puce, L.defi, OR1)
			end
			local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", ZIndex = 5 }, cadre)
			b.Activated:Connect(function()
				Sons.jouer("tap")
				Hud.vibre(6)
				Garage.essayer(cat, j)
			end)
			b.MouseEnter:Connect(function() if j ~= choisi[cat] then trait.Color = cc:Lerp(Color3.new(1, 1, 1), 0.15) end end)
			b.MouseLeave:Connect(function() majCartesHabits() end)
			table.insert(tuilesH, { cadre = cadre, trait = trait, grad = grad, j = j })
		end
	end
	majCartesHabits()
	U.bande.CanvasPosition = Vector2.zero
end

-- LA BANDE SUIT LA CAISSE MONTRÉE : au clavier, à la manette ou au glissé, la carte de la caisse sur le plateau reste en vue (avant,
-- la 6e d'une famille de 16 était hors de la bande et rien ne bougeait)
local function defilerVers(i: number, anim: boolean?)
	local t = tuiles[i]
	if not t or onglet ~= "voiture" or i ~= montre or not Garage.ouvert then return end
	local rang = table.find(FAMILLES[famille], i)
	if not rang then return end
	local fenetre = W_CONSOLE - 24
	local s9 = U.bande.AbsoluteWindowSize.X / fenetre -- (l'échelle de la console : la toile se compte en unités de la console)
	if s9 <= 0 then return end
	local maxX = math.max(0, (U.bande.AbsoluteCanvasSize.X - U.bande.AbsoluteWindowSize.X) / s9)
	local x0 = 3 + ((rang - 1) // 2) * (CARTE_L + 6)
	local vu = U.bande.CanvasPosition.X
	local vers = vu
	if x0 - 3 < vu then
		vers = x0 - 3
	elseif x0 + CARTE_L + 3 > vu + fenetre then
		vers = x0 + CARTE_L + 3 - fenetre
	end
	vers = math.clamp(vers, 0, maxX)
	if math.abs(vers - vu) < 1 then return end
	if anim then
		TweenService:Create(U.bande, K.LENTE, { CanvasPosition = Vector2.new(vers, 0) }):Play()
	else
		U.bande.CanvasPosition = Vector2.new(vers, 0)
	end
end

-- la bande ne montre que la famille courante ; les photos se prennent une par une (la partie coûteuse)
local function majBande()
	if onglet ~= "voiture" then
		majBandeHabits()
		return
	end
	for _, t in tuilesH do t.cadre:Destroy() end
	table.clear(tuilesH)
	fileN += 1
	local n = fileN
	local liste = FAMILLES[famille]
	local garde: { [number]: boolean } = {}
	for _, i in liste do garde[i] = true end
	for i, t in tuiles do
		if not garde[i] then
			Caisse.rendre(t.modele)
			t.cadre:Destroy()
			tuiles[i] = nil
		end
	end
	for rang, i in liste do
		if not tuiles[i] then tuiles[i] = creerTuile(i, rang) end
		majTuile(i)
	end
	U.bande.CanvasPosition = Vector2.zero
	task.spawn(function()
		-- (une photo refusée par le budget de triangles n'est pas perdue : on repasse, le temps que Roblox rende la mémoire des
		-- maillages qu'on vient de détruire — la boutique, la famille d'avant)
		for passe = 1, 3 do
			local rates = 0
			for _, i in liste do
				if n ~= fileN or not Garage.ouvert then return end
				local t = tuiles[i]
				if t and not t.modele and not t.enCours and not t.aImage then -- (une carte qui a sa vignette dessinée n'a plus besoin de photo)
					-- (la RÉSERVE : changer de caisse sur le plateau demande jusqu'à 6 000 triangles — une photo ne les prend pas)
					if Maillage.libre() < (Catalogue[i].triangles or 3000) + RESERVE then return end
					t.enCours = true
					photographier(t, i)
					if not t.modele then
						t.enCours = false
						rates += 1
						if rates >= 2 then break end -- (inutile d'insister tout de suite)
					end
					task.wait()
				end
			end
			if rates == 0 then return end
			task.wait(1.6)
		end
	end)
end

-- les FAMILLES (voitures) ou les FILTRES (habillages) : la famille ouverte s'élargit et dit son nom (« ◆ LEGENDAIRE 1/13 »), les
-- autres gardent leur compte — on lit d'un coup d'œil où on est et ce qu'on possède
local function majPastilles(anim: boolean?)
	local voitures = onglet == "voiture"
	for _, r in RARETES do U.pastilles[r.id].boite.Visible = voitures end
	for id, f in U.filtres do
		f.boite.Visible = not voitures
		if not voitures then
			local n = 0
			for _, d in HABITS[onglet] do
				local a = aHabit(onglet, d)
				if id == "tout" or (id == "moi" and a) or (id == "acheter" and not a and d.p ~= nil) then n += 1 end
			end
			f.txt.Text = f.nom .. "  " .. n
			allumer(f, id == filtre, (id == filtre) and vif(f.c) or PLAQUE_OFF)
		end
	end
	if not voitures then return end
	local W = W_CONSOLE - 28
	local large = 162
	local etroit = (W - large - (#RARETES - 1) * 6) / (#RARETES - 1)
	local x = 14
	for _, r in RARETES do
		local p = U.pastilles[r.id]
		local a, n = 0, 0
		for _, i in FAMILLES[r.id] do
			n += 1
			if possede(i) or Catalogue[i].cond.k == "depart" then a += 1 end
		end
		local actif = r.id == famille
		p.txt.Text = actif and (NOM_RAR[r.id] .. "  " .. a .. "/" .. n) or (a .. "/" .. n)
		p.txt.TextSize = actif and 13 or 12
		allumer(p, actif, actif and vif(r.c) or PLAQUE_OFF)
		local w = actif and large or etroit
		local pos, taille = UDim2.fromOffset(x, Y.pas), UDim2.fromOffset(w, Y.hPas)
		if anim then
			TweenService:Create(p.boite, K.LENTE, { Position = pos, Size = taille }):Play()
		else
			p.boite.Position, p.boite.Size = pos, taille
		end
		x += w + 6
	end
end

-- le COMPTE : il roule jusqu'à sa nouvelle valeur (900 ms)
local compteVu, compteN = 0, 0
local function majCompte(direct: boolean?)
	local cibleV = profil().compte or 0
	Argent.maj(workspace:GetAttribute("DbgArgent") or cibleV) -- les tas de billets suivent le compte (DbgArgent : un compte de mise au point)
	if direct or cibleV == compteVu then
		compteVu = cibleV
		U.compte.Text = Hud.compte(cibleV)
		Hud.tenir(U.compteEchelle, U.compte.Text, 44, 300)
		return
	end
	compteN += 1
	local n, de = compteN, compteVu
	compteVu = cibleV
	task.spawn(function()
		local t0 = os.clock()
		while os.clock() - t0 < 0.9 and n == compteN do
			local u = (os.clock() - t0) / 0.9
			U.compte.Text = Hud.compte(de + (cibleV - de) * (1 - (1 - u) ^ 3))
			task.wait()
		end
		if n == compteN then
			U.compte.Text = Hud.compte(cibleV)
			Hud.tenir(U.compteEchelle, U.compte.Text, 44, 300)
		end
	end)
end

-- ce qu'il reste à faire pour une caisse fermée (carUnlockText)
local function condition(i: number): string
	local k = Catalogue[i].cond
	if k.k == "roue" then return L.roue end
	if k.k == "jour7" then return L.jour7 end
	if k.k == "bientot" then return L.bientotDefi end
	if k.k == "aura" then return string.format(L.aura, L.rangs[k.v + 1] or "?", L.rangs[rangAura(profil().aura or 0)]) end
	if k.k == "premium" then return FR and "EN VENTE A LA BOUTIQUE" or "FOR SALE IN THE SHOP" end
	return ""
end

-- LA FICHE : la puce de rareté, le nom (blanc, son ombre portée à la couleur de la famille), sa barre, la ligne d'état
local ficheCle = ""
local function poserNom(nom: string, c: Color3)
	local corps = math.clamp(math.floor(1000 / math.max(8, utf8.len(nom) or #nom)), 34, 80)
	U.nom.Text = nom
	U.nomOmbre.Text = nom
	U.nom.TextSize = corps
	U.nomOmbre.TextSize = corps
	U.nomOmbre.TextColor3 = ombrer(c, 0.62)
	U.barre.BackgroundColor3 = c
	U.barreW = math.clamp(math.floor((utf8.len(nom) or #nom) * corps * Hud.CHASSE + 14), 180, 660)
	U.barre.Size = UDim2.fromOffset(U.barreW, 6)
end
-- la puce : ◆ + le mot (la famille d'une caisse, ou PEINTURE / AILES / TRAINEES), sur un aplat de sa couleur
local function poserPuce(mot: string, c: Color3)
	U.puceTxt.Text = mot
	U.puceGrad.Color = ColorSequence.new(c:Lerp(Color3.new(1, 1, 1), 0.28), ombrer(c, 0.78))
	U.puceGemme.BackgroundColor3 = Color3.new(1, 1, 1):Lerp(c, 0.25)
end
-- l'ÉTAT, à côté du rang : À TOI (vert) ou ÉQUIPÉE (le losange d'or) — rien pour ce qu'on n'a pas
local function poserEtat(etat: string?)
	U.etat.Visible = etat ~= nil
	if etat == "equipee" then
		U.etatTxt.Text = L.equipee
		U.etatTxt.TextColor3 = Color3.fromRGB(255, 215, 94)
		U.etatLos.Parent.Visible = true
		U.etatTrait.Color = Color3.fromRGB(255, 199, 42)
	elseif etat then
		U.etatTxt.Text = L.aMoi
		U.etatTxt.TextColor3 = CASH
		U.etatLos.Parent.Visible = false
		U.etatTrait.Color = Color3.fromRGB(60, 170, 100)
	end
end
-- la phrase sous le nom (police de lecture) ; `cadenas` : la petite serrure devant
local function poserDesc(txt: string, cadenas: boolean)
	U.desc.Text = txt
	U.descIco.Visible = cadenas and txt ~= ""
	U.desc.Position = UDim2.fromOffset(cadenas and 74 or 44, 258)
end
-- l'ENTRÉE de la fiche quand on change de caisse ou d'article : elle glisse de la gauche, le nom se lève, la barre se tire
local function entreeFiche(cle: string)
	if cle == ficheCle then return end
	ficheCle = cle
	U.fiche.Position = UDim2.fromOffset(-28, 0)
	TweenService:Create(U.fiche, K.LENTE, { Position = UDim2.new() }):Play()
	for _, t in { U.nom, U.nomOmbre } do
		t.TextTransparency = 1
		TweenService:Create(t, K.LENTE, { TextTransparency = 0 }):Play()
	end
	U.barre.Size = UDim2.fromOffset(0, 6)
	TweenService:Create(U.barre, TweenInfo.new(0.32, Enum.EasingStyle.Quint, Enum.EasingDirection.Out), { Size = UDim2.fromOffset(U.barreW or 300, 6) }):Play()
end

-- LA DÉCISION (gEtat + gPrixHtml + gActSync) : quel bouton, en or ou non
local decision = "" -- "" | acheter | pauvre | equiper | verrou | roue | boutique | gagner
local prixDecision = 0
local function majFicheHabit()
	local cat = onglet
	local liste = HABITS[cat]
	local d = liste[choisi[cat]]
	local nom = Hud.sansAccent(string.upper(FR and d.nom or d.en))
	poserNom(nom, COUL_CAT[cat])
	poserPuce(cat == "peinture" and L.peinture or (cat == "aile" and L.ailes or L.trainees), COUL_CAT[cat])
	U.rang.Text = choisi[cat] .. " / " .. #liste
	local compte = profil().compte or 0
	local a = aHabit(cat, d)
	poserEtat((tenue()[cat] == d.id) and "equipee" or (a and "moi" or nil))
	poserDesc(FR and d.d or d.dEN, false)
	if a then
		decision = (tenue()[cat] == d.id) and "" or "equiper"
	elseif d.p then
		decision = (compte >= d.p) and "acheter" or "pauvre"
		prixDecision = d.p
	else
		decision = "gagner"
	end
	entreeFiche(cat .. ":" .. d.id)
end
-- LA BARRE D'ACTION : HOME · BOUTIQUE · la décision · JOUER. UN seul lingot d'or : la décision quand on PEUT la prendre (acheter,
-- équiper, voir en boutique) — sinon c'est JOUER (une caisse trop chère ou fermée : la seule chose à faire, c'est aller gagner)
local function majBarre()
	local compte = profil().compte or 0
	local P9 = U.pl
	for _, pl in P9 do pl.boite.Visible = false end
	local x = 14
	local fin = W_CONSOLE - 14
	if decision ~= "" then
		local prenable = decision == "acheter" or decision == "equiper" or decision == "boutique"
		poser(P9.home, x, 58)
		dire(P9.home, "maison3")
		x += 58 + Y.ecart
		poser(P9.boutique, x, 58)
		dire(P9.boutique, "panier3")
		x += 58 + Y.ecart
		local lDec = math.floor((fin - x - Y.ecart) * 0.57)
		local dec = (decision == "pauvre" and P9.decRouge) or (prenable and P9.decOr) or P9.decVerrou
		poser(dec, x, lDec)
		x += lDec + Y.ecart
		local jo = prenable and P9.jouerCyan or P9.jouerOr
		poser(jo, x, fin - x)
		dire(jo, nil, nil, L.jouer, prenable and 24 or 30)
		if decision == "acheter" then
			dire(dec, nil, L.acheter, Hud.argent(prixDecision), 26)
		elseif decision == "pauvre" then
			dire(dec, nil, L.manque, Hud.argent(prixDecision - compte), 22, ROSE_PRIX)
		elseif decision == "equiper" then
			dire(dec, nil, nil, L.equiper, 28)
		elseif decision == "boutique" then
			-- (5/10 : les légendaires se vendent en Robux — le bouton mène à la boutique, qui donne le prix)
			dire(dec, nil, L.enBoutique, FR and "VOIR" or "VIEW", 26)
		elseif decision == "gagner" then
			dire(dec, "verrou2", nil, L.gagner, 15, C.texte2)
		elseif decision == "roue" then
			dire(dec, nil, L.gagner, L.defi, 22, OR1)
		elseif decision == "jour7" then
			dire(dec, nil, L.gagner, L.sept, 22, OR1)
		else
			dire(dec, "verrou2", nil, L.verrou, 14, C.texte2)
		end
	else
		poser(P9.home, x, 92)
		dire(P9.home, "maison2", nil, L.home, 13)
		x += 92 + Y.ecart
		poser(P9.boutique, x, 112)
		dire(P9.boutique, "panier2", nil, L.boutique, 13)
		x += 112 + Y.ecart
		poser(P9.jouerOr, x, fin - x)
		dire(P9.jouerOr, nil, nil, L.jouer, 42)
	end
end
local function majFiche()
	if onglet ~= "voiture" then
		majFicheHabit()
	else
		Garage.majFicheCaisse()
	end
	majBarre()
end
function Garage.majFicheCaisse()
	local f = Catalogue[montre]
	local c = COULEUR_RAR[f.rar]
	local nom = FR and f.nom or (f.en or f.nom)
	nom = Hud.sansAccent(string.upper(nom)) -- (la police pixel n'a pas de capitales accentuées : « DOLORèS »)
	poserNom(nom, c)
	poserPuce(NOM_RAR[f.rar] or "?", c)
	U.rang.Text = RANG[montre] .. " / " .. #LISTE
	local k = f.cond
	local aMoi, ouv = gagnee(montre), ouverte(montre)
	local test = ouv and not aMoi
	poserEtat((profil().caisse == montre) and "equipee" or (aMoi and "moi" or nil))
	-- la fiche n'écrit que la condition d'une caisse fermée (le prix, lui, est sur le bouton et la carte)
	local desc = ""
	if not aMoi and k.k ~= "prix" then desc = condition(montre) end
	if test then desc = '<font color="#ffd75e">[TEST]</font> ' .. desc end
	poserDesc(desc, not aMoi)
	-- le bouton
	local compte = profil().compte or 0
	if k.k == "prix" and not possede(montre) then
		decision = compte >= k.v and "acheter" or "pauvre"
		prixDecision = k.v
	elseif k.k == "premium" and not possede(montre) and not ouv then
		decision = "boutique"
	elseif not ouv then
		decision = (k.k == "roue") and "roue" or ((k.k == "jour7") and "jour7" or "verrou") -- (une caisse de la roue ou du 7e jour dit OÙ la gagner)
	elseif profil().caisse ~= montre then
		decision = "equiper"
	else
		decision = ""
	end
	entreeFiche("v:" .. montre)
end

local function majAffiche()
	if not AFFICHE then return end
	local p = profil()
	local v = { Hud.compte(p.record or 0), tostring(math.floor(p.auraMeilleur or 0)),
		tostring((p.moteurMax or 0) + 1), math.floor(p.kmhMax or 0) .. " KM/H" }
	for k, l in AFFICHE do l.Text = v[k] end
end
local function majTout()
	majAffiche()
	majCompte()
	majPastilles()
	if onglet ~= "voiture" then majBande() else
		for i in tuiles do majTuile(i) end
	end
	majFiche()
end
Garage.majTout = majTout

local function secouer()
	local p0 = U.consoleP0
	task.spawn(function()
		for k = 1, 6 do
			U.console.Position = p0 + UDim2.fromOffset((k % 2 == 0 and 1 or -1) * (7 - k), 0)
			task.wait(0.05)
		end
		U.console.Position = p0
	end)
end

-- l'achat se FÊTE : le tampon d'or « À TOI ! » et un éclair à la couleur de la caisse
local function tampon(couleur: Color3)
	U.tampon.Visible = true
	U.tampon.TextTransparency = 0
	U.tamponEchelle.Scale = 2.4
	TweenService:Create(U.tamponEchelle, TweenInfo.new(0.28, Enum.EasingStyle.Quint, Enum.EasingDirection.Out), { Scale = 1 }):Play()
	U.eclat.BackgroundColor3 = couleur
	U.eclat.BackgroundTransparency = 0.35
	TweenService:Create(U.eclat, TweenInfo.new(0.9, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { BackgroundTransparency = 1 }):Play()
	task.delay(1.5, function()
		TweenService:Create(U.tampon, K.LENTE, { TextTransparency = 1 }):Play()
		task.wait(0.4)
		U.tampon.Visible = false
	end)
end

local arme = 0 -- après un achat, ÉQUIPER prend la place d'ACHETER : le 2e appui d'un double appui ne doit pas l'activer
local occupe = false
local function deciderHabit()
	local cat = onglet
	local d = HABITS[cat][choisi[cat]]
	if decision == "acheter" or decision == "equiper" then
		occupe = true
		local ok = ctx.action((decision == "acheter") and "habitAcheter" or "habitEquiper", cat, d.id)
		occupe = false
		if ok then
			essai[cat] = nil
			if decision == "acheter" then
				arme = os.clock() + 0.42
				Sons.jouer("encaisse")
				tampon(COUL_CAT[cat])
			else
				Sons.jouer("maillon")
			end
			if ctx.surHabit then ctx.surHabit() end
			Garage.majTout()
		else
			secouer()
		end
	elseif decision == "pauvre" then
		secouer()
		Hud.toast(L.ilTeManque .. Hud.argent(d.p - (profil().compte or 0)) .. L.gagneLes, ROUGE, "croix")
	elseif decision == "gagner" then
		secouer()
		Hud.toast(FR and d.d or d.dEN, nil, "verrou")
	end
end
local function decider()
	if occupe or os.clock() < arme then return end
	if onglet ~= "voiture" then
		deciderHabit()
		return
	end
	local f = Catalogue[montre]
	if decision == "acheter" then
		occupe = true
		local ok = ctx.action("acheter", montre)
		occupe = false
		if ok then
			arme = os.clock() + 0.42
			Sons.jouer("encaisse")
			tampon(COULEUR_RAR[f.rar])
			majTout()
		else
			secouer()
		end
	elseif decision == "pauvre" then
		secouer()
		-- (9/10, parcours : le bouton rouge disait déjà « IL MANQUE $ X » — le toast le répétait mot pour mot, sans dire quoi faire)
		Hud.toast(L.ilTeManque .. Hud.argent(f.cond.v - (profil().compte or 0)) .. L.gagneLes, ROUGE, "croix")
	elseif decision == "equiper" then
		occupe = true
		local ok = ctx.action("equiper", montre)
		occupe = false
		if ok then
			Sons.jouer("maillon")
			ctx.surEquipe(montre)
			majTout()
		else
			secouer()
		end
	elseif decision == "verrou" or decision == "roue" or decision == "jour7" then
		secouer()
		Hud.toast(condition(montre), nil, "verrou")
	elseif decision == "boutique" then
		if ctx.surBoutique then ctx.surBoutique() else Hud.toast(L.bientot, nil, "panier") end
	end
end

local function creerInterface()
	local racine = Hud.racine
	local g = inst("Frame", { Name = "Garage", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, racine)
	U.racine = g
	-- les voiles : le haut, la droite (sous la console) et le coin de la FICHE s'assombrissent pour que le texte se lise sur l'atelier
	-- (la porte blanche passait derrière le nom) — rien de flou : la charte
	-- (v3 : le voile du haut descend jusque sous la fiche — un voile en biais laissait un BORD net en travers de la caisse)
	local vh = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(8, 5, 20), Size = UDim2.new(1, 0, 0, 390) }, g)
	inst("UIGradient", { Rotation = 90, Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.1), NumberSequenceKeypoint.new(0.5, 0.42),
		NumberSequenceKeypoint.new(1, 1) }) }, vh)
	local vd = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(7, 5, 15), Size = UDim2.new(0, 900, 1, 0), Position = UDim2.fromScale(1, 0),
		AnchorPoint = Vector2.new(1, 0) }, g)
	inst("UIGradient", { Rotation = 0, Transparency = NumberSequence.new(1, 0.3) }, vd)
	U.eclat = inst("Frame", { BorderSizePixel = 0, BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, g)

	-- ── le COMPTE ──
	local cp = K.carbone(g, UDim2.fromOffset(340, 68), UDim2.fromOffset(40, 20))
	inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = CASH, Size = UDim2.new(1, 0, 0, 3), Position = UDim2.new(0, 0, 1, -3) }, cp)
	-- (9/10, Sacha : « enlève le S jaune » — la pièce d'or redisait le « $ » vert du montant : le montant seul)
	U.compte = K.texte(cp, { Text = "$ 0", TextSize = 44, TextColor3 = CASH, Size = UDim2.new(1, -36, 1, 0), Position = UDim2.fromOffset(20, 0),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3, contourCouleur = Color3.fromRGB(5, 36, 15) })
	U.compteEchelle = inst("UIScale", {}, U.compte)
	U.compteCadre = cp

	-- ── la FICHE : la ligne de rareté, le nom et son ombre, la barre, la phrase ──
	local fi = inst("Frame", { Name = "Fiche", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, g)
	U.fiche = fi
	local ligne = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.fromOffset(700, 36), Position = UDim2.fromOffset(44, 102) }, fi)
	inst("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, VerticalAlignment = Enum.VerticalAlignment.Center, Padding = UDim.new(0, 14),
		SortOrder = Enum.SortOrder.LayoutOrder }, ligne)
	-- la PUCE de rareté : ◆ + la famille, l'encre sur un aplat de sa couleur (ce n'est pas un bouton : elle ne penche pas)
	U.puce = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.new(1, 1, 1), Size = UDim2.fromOffset(0, 36), AutomaticSize = Enum.AutomaticSize.X,
		LayoutOrder = 1 }, ligne)
	U.puceGrad = inst("UIGradient", { Rotation = 90 }, U.puce)
	inst("UIStroke", { Color = C.encre, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, U.puce)
	inst("UIPadding", { PaddingLeft = UDim.new(0, 12), PaddingRight = UDim.new(0, 12) }, U.puce)
	inst("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, VerticalAlignment = Enum.VerticalAlignment.Center, Padding = UDim.new(0, 10),
		SortOrder = Enum.SortOrder.LayoutOrder }, U.puce)
	U.puceGemme = gemme(U.puce, Color3.new(1, 1, 1), 12, 1)
	U.puceTxt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIX, TextSize = 20, Text = "", TextColor3 = C.encre,
		AutomaticSize = Enum.AutomaticSize.X, Size = UDim2.fromOffset(0, 36), LayoutOrder = 2 }, U.puce)
	U.rang = K.texte(ligne, { Text = "", TextSize = 21, TextColor3 = C.texte2, AutomaticSize = Enum.AutomaticSize.X, Size = UDim2.fromOffset(0, 36),
		TextWrapped = false, LayoutOrder = 2, epais = 3 })
	U.etat = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = C.encre, BackgroundTransparency = 0.25, Size = UDim2.fromOffset(0, 36),
		AutomaticSize = Enum.AutomaticSize.X, LayoutOrder = 3, Visible = false }, ligne)
	U.etatTrait = inst("UIStroke", { Color = CASH, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, U.etat)
	inst("UIPadding", { PaddingLeft = UDim.new(0, 10), PaddingRight = UDim.new(0, 10) }, U.etat)
	inst("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, VerticalAlignment = Enum.VerticalAlignment.Center, Padding = UDim.new(0, 9),
		SortOrder = Enum.SortOrder.LayoutOrder }, U.etat)
	U.etatLos = gemme(U.etat, Color3.fromRGB(255, 199, 42), 11, 1)
	U.etatTxt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIX, TextSize = 17, Text = "", TextColor3 = CASH,
		AutomaticSize = Enum.AutomaticSize.X, Size = UDim2.fromOffset(0, 36), LayoutOrder = 2 }, U.etat)
	-- le NOM : blanc, cerné d'encre, et son OMBRE PORTÉE à la couleur de la famille (le relief du logo CASH CAR) ; calé par le bas
	U.nomOmbre = K.texte(fi, { italique = true, Text = "", TextSize = 80, TextColor3 = C.trait, Size = UDim2.fromOffset(680, 92),
		Position = UDim2.fromOffset(49, 147), TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Bottom,
		TextWrapped = false, epais = 4, ZIndex = 1 })
	U.nom = K.texte(fi, { italique = true, Text = "", TextSize = 80, TextColor3 = C.texte, Size = UDim2.fromOffset(680, 92),
		Position = UDim2.fromOffset(44, 142), TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Bottom,
		TextWrapped = false, epais = 4, ZIndex = 2 })
	U.barre = inst("Frame", { BorderSizePixel = 0, Size = UDim2.fromOffset(440, 6), Position = UDim2.fromOffset(42, 242) }, fi)
	inst("UIStroke", { Color = C.encre, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, U.barre)
	inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.5, Size = UDim2.new(1, 0, 0, 2) }, U.barre)
	U.descIco = K.icone(fi, "verrou", 2, C.lavande, UDim2.fromOffset(44, 263))
	U.desc = K.texte(fi, { FontFace = K.TXT, Text = "", RichText = true, TextSize = 25, TextColor3 = C.texte2, Size = UDim2.fromOffset(560, 96),
		Position = UDim2.fromOffset(44, 258), TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, LineHeight = 1.05, epais = 2 })
	U.tampon = K.texte(g, { Text = L.aToi, TextSize = 90, TextColor3 = Color3.fromRGB(255, 215, 94), Size = UDim2.fromOffset(760, 110),
		Position = UDim2.new(0.3, 0, 0.42, 0), AnchorPoint = Vector2.new(0.5, 0.5), Rotation = -9, Visible = false, epais = 5,
		contourCouleur = Color3.fromRGB(70, 30, 0), ZIndex = 20 })
	U.tamponEchelle = inst("UIScale", {}, U.tampon)

	-- ── ⚙ ──
	U.btReglages = K.tuile(g, "", C.cyan, UDim2.fromOffset(104, 84), UDim2.new(1, -22, 0, 20), Vector2.new(1, 0), 30, "reglages")

	-- ── LA CONSOLE : un panneau de LAQUE (la nuit éclairée par le haut), cerné d'encre, la livrée tricolore sur son bord, une ombre
	-- portée dessous ; le tout dans une boîte qu'on agrandit d'un bloc ──
	local boite = inst("Frame", { Name = "Console", BackgroundTransparency = 1, Size = UDim2.fromOffset(W_CONSOLE, H_CONSOLE),
		Position = UDim2.new(1, -22, 1, -16), AnchorPoint = Vector2.new(1, 1) }, g)
	-- (le web est un écran de téléphone couché, 2,16 fois plus large que haut : sur un écran d'ordinateur 16:9 la console à pleine
	-- taille mangerait 59 % de la largeur — elle se réduit pour laisser la moitié de l'image à la caisse)
	local echelle = inst("UIScale", { Scale = ECH_CONSOLE }, boite)
	local function caler()
		local large = Hud.racine.AbsoluteSize.X / math.max(0.01, Hud.racine:FindFirstChildOfClass("UIScale").Scale) -- la largeur dessinée
		echelle.Scale = ECH_CONSOLE * math.clamp(large / 1560, 0.72, 1)
	end
	caler()
	Hud.racine:GetPropertyChangedSignal("AbsoluteSize"):Connect(caler)
	U.console = boite
	U.consoleP0 = boite.Position
	inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = C.encre, BackgroundTransparency = 0.3, Size = UDim2.fromScale(1, 1), Position = UDim2.fromOffset(0, 7) }, boite)
	local cs = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.new(1, 1, 1), Size = UDim2.fromScale(1, 1), Active = true }, boite)
	cs.Active = true -- un glissé qui commence sur la console ne fait pas tourner la caisse
	inst("UIGradient", { Rotation = 90, Color = ColorSequence.new({ ColorSequenceKeypoint.new(0, Color3.fromRGB(46, 38, 88)),
		ColorSequenceKeypoint.new(0.2, Color3.fromRGB(30, 25, 60)), ColorSequenceKeypoint.new(1, Color3.fromRGB(13, 10, 28)) }) }, cs)
	inst("UIStroke", { Color = C.encre, Thickness = 3, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, cs)
	local liser = inst("Frame", { BackgroundTransparency = 1, Size = UDim2.new(1, -4, 1, -4), Position = UDim2.fromOffset(2, 2) }, cs)
	inst("UIStroke", { Color = C.trait, Thickness = 1, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, liser)
	for k, c in { C.magenta, C.cyan, C.or_ } do -- la livrée, sur le bord du haut
		inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = c, Size = UDim2.new(k == 1 and 0.46 or 0.27, 0, 0, 4), Position = UDim2.fromScale(k == 1 and 0 or (k == 2 and 0.46 or 0.73), 0) }, cs)
	end
	-- les onglets : VOITURES · PEINTURE · AILES · TRAINEES (l'icône au-dessus du mot ; l'onglet ouvert s'allume en rose)
	U.onglets = {}
	local lo = (W_CONSOLE - 28 - 3 * 6) / 4
	for k, o in { { "voiture", L.voitures, "voiture" }, { "peinture", L.peinture, "pinceau" }, { "aile", L.ailes, "aile" }, { "trainee", L.trainees, "trainee" } } do
		local p = plaqueO(cs, Y.hOng, lo, UDim2.fromOffset(14 + (k - 1) * (lo + 6), Y.ong), true)
		p.txt.Text = o[2]
		p.ico = K.iconeRelief(p.pile, o[3], 2, C.terne)
		p.ico.LayoutOrder = 1
		U.onglets[o[1]] = p
		p.b.Activated:Connect(function() Garage.onglet(o[1]) end)
	end
	-- les FAMILLES (la gemme, le compte ; celle qu'on regarde dit son nom)
	U.pastilles = {}
	for _, r in RARETES do
		local p = plaqueO(cs, Y.hPas, 70, UDim2.fromOffset(14, Y.pas), false)
		gemme(p.pile, r.c, 10, 1)
		U.pastilles[r.id] = p
		p.b.Activated:Connect(function()
			-- la famille saute à la caisse équipée si elle en est, sinon à la première
			local eq = profil().caisse
			local vers = (Catalogue[eq] and Catalogue[eq].rar == r.id) and eq or FAMILLES[r.id][1]
			if vers then Garage.sauter(vers) end
		end)
	end
	-- les FILTRES des habillages : tout · à moi · à acheter
	U.filtres = {}
	local lf = (W_CONSOLE - 28 - 2 * 6) / 3
	for k, q in { { "tout", L.tout, Color3.fromRGB(201, 189, 240) }, { "moi", L.aMoi, Color3.fromRGB(94, 227, 122) }, { "acheter", L.aAcheter, C.cyan } } do
		local p = plaqueO(cs, Y.hPas, lf, UDim2.fromOffset(14 + (k - 1) * (lf + 6), Y.pas), false)
		gemme(p.pile, q[3], 9, 1)
		p.boite.Visible = false
		p.nom, p.c = q[2], q[3]
		U.filtres[q[1]] = p
		p.b.Activated:Connect(function()
			filtre = q[1]
			majPastilles()
			majBande()
		end)
	end
	-- la bande de cartes : deux rangées, on fait défiler (la barre de défilement sous les cartes, jamais dessus)
	U.bande = inst("ScrollingFrame", { BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.fromOffset(W_CONSOLE - 24, Y.hBande),
		Position = UDim2.fromOffset(12, Y.bande), CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.X,
		ScrollingDirection = Enum.ScrollingDirection.X, ScrollBarThickness = 4, ScrollBarImageColor3 = C.terne, ScrollBarImageTransparency = 0.25,
		HorizontalScrollBarInset = Enum.ScrollBarInset.ScrollBar, VerticalScrollBarInset = Enum.ScrollBarInset.None }, cs)
	inst("UIGridLayout", { CellSize = UDim2.fromOffset(CARTE_L, CARTE_H), CellPadding = UDim2.fromOffset(6, 6), FillDirection = Enum.FillDirection.Vertical,
		FillDirectionMaxCells = 2, SortOrder = Enum.SortOrder.LayoutOrder }, U.bande)
	inst("UIPadding", { PaddingTop = UDim.new(0, 3), PaddingLeft = UDim.new(0, 3), PaddingRight = UDim.new(0, 3) }, U.bande)
	-- la barre d'action : des plaques penchées, chacune prête dans ses couleurs (on montre celle qu'il faut)
	U.pl = {
		home = plaqueP(cs, "Home", C.lavande),
		boutique = plaqueP(cs, "Boutique", C.magenta),
		decOr = plaqueP(cs, "Decision", nil, true),
		decRouge = plaqueP(cs, "DecisionManque", ROUGE),
		decVerrou = plaqueP(cs, "DecisionFermee", Color3.fromRGB(120, 110, 176)),
		jouerOr = plaqueP(cs, "Jouer", nil, true),
		jouerCyan = plaqueP(cs, "JouerLaque", C.cyan),
	}
	icoP(U.pl.home, "maison", 3, C.lavande)
	icoP(U.pl.home, "maison", 2, C.lavande)
	icoP(U.pl.boutique, "panier", 3, C.magenta)
	icoP(U.pl.boutique, "panier", 2, C.magenta)
	icoP(U.pl.decVerrou, "verrou", 2, C.lavande)
	refleter(U.pl.decOr)
	refleter(U.pl.jouerOr)
	U.pl.home.b.Activated:Connect(function() if not Garage.lance then ctx.surHome() end end)
	U.pl.boutique.b.Activated:Connect(function()
		if Garage.lance then return end
		if ctx.surBoutique then ctx.surBoutique() else Hud.toast(L.bientot) end
	end)
	for _, pl in { U.pl.decOr, U.pl.decRouge, U.pl.decVerrou } do pl.b.Activated:Connect(decider) end
	for _, pl in { U.pl.jouerOr, U.pl.jouerCyan } do pl.b.Activated:Connect(function() Garage.jouer() end) end
	U.btReglages.Activated:Connect(function() if not Garage.lance then ctx.surReglages() end end)

	-- le fondu blanc chaud du lâcher (il survit à la fermeture du garage)
	U.fondu = inst("Frame", { Name = "FonduGarage", BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(255, 227, 184), BackgroundTransparency = 1,
		Size = UDim2.fromScale(1, 1), ZIndex = 70, Visible = false }, racine)
end

-- l'onglet ouvert s'allume en ROSE (la couleur des onglets du web), les autres restent dans la nuit
local ONG_ON = Color3.fromRGB(214, 40, 150)
function Garage.majOnglets()
	for id, o in U.onglets do
		local actif = id == onglet
		allumer(o, actif, actif and ONG_ON or PLAQUE_OFF)
		K.teinter(o.ico, K.bandes(actif and C.texte or C.terne))
		o.txt.TextColor3 = actif and C.texte or C.terne
	end
end
-- ════════════════════════════════════════════════════════════════════════════════════════════════
-- LE PLATEAU, LE RETOURNEUR, LA VUE
-- ════════════════════════════════════════════════════════════════════════════════════════════════
local ang = 0            -- l'angle du plateau (0 = la caisse nous tourne le dos, nez vers la porte)
local pitch, dist = 0.2, 7.8
local bascule: any = nil -- { t, pret = { m }, fait }
local jeton = 0
local glisse: any = nil  -- le doigt / la souris qui fait tourner
local touche = 0         -- l'heure du dernier geste (la vue se balance quand on ne touche à rien)
local lacher: any = nil  -- le LÂCHER : { t }
local echelleVue = 1

local function cfPlateau(): CFrame
	return CFrame.new(P(0, POD, 0)) * CFrame.Angles(0, math.pi + ang, 0)
end
local function poserCaisse(m: Model, echelle: number, dz: number?)
	if math.abs(echelle - echelleVue) > 0.002 or echelle == 1 then
		pcall(function() m:ScaleTo(math.max(0.02, echelle)) end)
	end
	local cf = cfPlateau()
	if dz then cf = CFrame.new(0, 0, dz * M) * cf end
	m:PivotTo(cf)
end

-- changer de caisse : la caisse s'écrase dans le plateau, le scanner monte, la nouvelle se déploie
-- force = rebâtir la même caisse (un habillage essayé)
function Garage.sauter(i: number, direct: boolean?, force: boolean?)
	if not Catalogue[i] or lacher then return end
	if i == montre and vitrine and not bascule and not force then return end
	montre = i
	local fam = Catalogue[i].rar
	local change = fam ~= famille
	famille = fam
	if change then majBande() end
	majPastilles(change and not direct) -- (la famille ouverte s'élargit en glissant)
	for k in tuiles do majTuile(k) end
	task.delay(0.06, defilerVers, i, not change) -- (après la mise en page de la grille)
	majFiche()
	jeton += 1
	local n = jeton
	local b = { t = direct and 0.34 or 0, pret = nil, fait = false }
	bascule = b
	if not direct then Sons.jouer("fronde", 1.2, 0.35) end
	task.spawn(function()
		local m, pg = Caisse.construire("Vitrine", i, true, habitsVitrine())
		if n ~= jeton or not Garage.ouvert then
			Caisse.rendre(m)
			return
		end
		b.pret = m
		b.pg = pg
	end)
end
-- ESSAYER un habillage sur la caisse (même s'il n'est pas à soi)
function Garage.essayer(cat: string, j: number)
	local d = HABITS[cat][j]
	if not d then return end
	choisi[cat] = j
	essai[cat] = d.id
	majCartesHabits()
	majFiche()
	if cat ~= "trainee" then Garage.sauter(montre, false, true) end
end
-- changer d'onglet : VOITURES · PEINTURE · AILES · TRAINEES
function Garage.onglet(o: string)
	if lacher or o == onglet then return end
	local avait = next(essai) ~= nil
	table.clear(essai) -- un essai ne survit pas à son onglet
	onglet = o
	filtre = "tout"
	if o ~= "voiture" then
		-- on ouvre sur ce que la caisse porte
		local p = tenue()
		for j, d in HABITS[o] do
			if d.id == p[o] then choisi[o] = j end
		end
	end
	Garage.majOnglets()
	majPastilles()
	majBande()
	if o == "voiture" then
		for k in tuiles do majTuile(k) end
	end
	majFiche()
	if avait then Garage.sauter(montre, false, true) end
end
function Garage.voisin(d: number)
	if onglet ~= "voiture" then
		local n = #HABITS[onglet]
		Garage.essayer(onglet, (choisi[onglet] - 1 + d) % n + 1)
		return
	end
	local k = RANG[montre] or 1
	Garage.sauter(LISTE[(k - 1 + d) % #LISTE + 1])
end

local function lisse(u: number): number
	u = math.clamp(u, 0, 1)
	return u * u * (3 - 2 * u)
end

-- LE TAP (garageImpact, L34784) : un appui bref sur la vue — ni glissé ni swipe — est un petit COUP : la caisse recule d'un rien
-- et revient (0,4 s), dix éclats de sa laque giclent de son nez et retombent, un « tonk » de tôle. Elle ne change pas de modèle
-- (le changement reste au swipe et aux flèches) : elle répond au toucher.
local IMP: any = { t = 0, D = 0.4, b = {} }
local function impact()
	if not vitrine or lacher or not dossier then return end
	IMP.t = IMP.D
	local f = Caisse.Catalogue[montre] or Caisse.Catalogue[0]
	local cf = vitrine:GetPivot()
	local laque = (vitrinePg and vitrinePg.laque) or Color3.fromRGB(220, 90, 40)
	for i = 1, 10 do
		local q = IMP.b[i]
		if not q then
			local p = Instance.new("Part")
			p.Anchored = true
			p.CanCollide, p.CanQuery, p.CanTouch = false, false, false
			p.CastShadow = false
			p.Material = Enum.Material.SmoothPlastic
			p.Parent = dossier
			q = { p = p }
			IMP.b[i] = q
		end
		local s9 = 0.06 + math.random() * 0.1
		q.p.Size = Vector3.new(s9, s9 * 0.7, s9) * M
		q.p.Color = (math.random() < 0.6) and laque or Color3.fromRGB(40, 42, 52)
		q.p.Transparency = 0
		local a, sp = math.random() * 6.283, 1.1 + math.random() * 1.8
		q.cf = cf * CFrame.new(((math.random() - 0.5) * 0.3) * M, (0.35 + math.random() * 0.3) * M, -(f.l * 0.5 - 0.2) * M)
		q.v = cf:VectorToWorldSpace(Vector3.new(math.cos(a) * sp * 0.4, 1.6 + math.random() * 1.6, -(math.sin(a) * sp * 0.4 + 2.2)))
		q.rx, q.ry = (math.random() - 0.5) * 9, (math.random() - 0.5) * 9
		q.p.CFrame = q.cf
	end
	Sons.vrai("garageTole", nil, nil, "poseChoc", 1.5, 0.35)
	Hud.vibre(12)
end
local function impactTick(dt: number): number -- rend le recul de la caisse (m)
	if IMP.t <= 0 then return 0 end
	IMP.t = math.max(0, IMP.t - dt)
	local ik = 1 - IMP.t / IMP.D
	for _, q in IMP.b do
		q.v -= Vector3.yAxis * (9 * dt)
		q.cf = (q.cf + q.v * dt * M) * CFrame.Angles(q.rx * dt, q.ry * dt, 0)
		q.p.CFrame = (IMP.t > 0) and q.cf or CFrame.new(0, -5000, 0)
		q.p.Transparency = 1 - IMP.t / IMP.D
	end
	return math.sin(math.min(1, ik) * math.pi) * 0.16
end
-- L'APERÇU DES TRAÎNÉES (trailApercu, L35066 du jeu web) : dans l'onglet TRAÎNÉES, deux rubans à la couleur ESSAYÉE (l'arc-en-ciel
-- compris) sortent des pots de la vitrine et ondulent derrière elle — on voit la traînée, pas une pastille. Deux Beams accrochés à
-- la caisse, leurs courbes animées à chaque image ; rendus (cachés) dès qu'on quitte l'onglet.
local TRPV: any = { r = {}, sur = nil }
local ARC9 = ColorSequence.new({ ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 59, 59)), ColorSequenceKeypoint.new(0.2, Color3.fromRGB(255, 155, 26)),
	ColorSequenceKeypoint.new(0.4, Color3.fromRGB(255, 226, 58)), ColorSequenceKeypoint.new(0.6, Color3.fromRGB(59, 255, 106)),
	ColorSequenceKeypoint.new(0.8, Color3.fromRGB(59, 180, 255)), ColorSequenceKeypoint.new(1, Color3.fromRGB(155, 91, 255)) })
local function apercuTrainee(on: boolean, t: number)
	local racine = on and vitrine and vitrine.PrimaryPart
	if not racine then
		for _, r in TRPV.r do r.b.Enabled = false end
		return
	end
	if TRPV.sur ~= racine then -- (une autre caisse sur le plateau : les rubans changent d'accroche)
		for _, r in TRPV.r do r.a0:Destroy() r.a1:Destroy() r.b:Destroy() end
		table.clear(TRPV.r)
		TRPV.sur = racine
		local f = Caisse.Catalogue[montre] or Caisse.Catalogue[0]
		for k = 1, 2 do
			local sd = (k == 1) and -1 or 1
			local a0, a1 = Instance.new("Attachment"), Instance.new("Attachment")
			a0.Position = Vector3.new(sd * f.w * 0.22, 0.43, f.l / 2 + 0.28) * M
			a1.Position = Vector3.new(sd * (f.w * 0.22 + 0.5), 0.78, f.l / 2 + 9.3) * M
			a0.Parent, a1.Parent = racine, racine
			local b = Instance.new("Beam")
			b.Attachment0, b.Attachment1 = a0, a1
			b.Width0, b.Width1 = 0.47 * M, 0.07 * M
			b.Segments = 24
			b.LightEmission, b.LightInfluence = 1, 0
			b.FaceCamera = true
			b.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.55), NumberSequenceKeypoint.new(0.1, 0.25), NumberSequenceKeypoint.new(1, 1) })
			b.Parent = racine
			TRPV.r[k] = { a0 = a0, a1 = a1, b = b, sd = sd }
		end
	end
	local d = Config.habit("trainee", essai.trainee or tenue().trainee)
	local coul = (d and d.arcenciel) and ARC9 or ColorSequence.new((d and d.c) or Color3.fromRGB(255, 158, 26))
	for _, r in TRPV.r do
		r.b.Enabled = true
		r.b.Color = coul
		-- (le ruban ONDULE : deux sinus qui courent le long de lui)
		r.b.CurveSize0 = math.sin(t * 4.5) * 1.6 * M * r.sd
		r.b.CurveSize1 = math.sin(t * 3.2 + 1.3) * 1.2 * M
	end
end
function Garage.rendu(dt: number)
	if not Garage.ouvert or not dossier then return end
	local cam = workspace.CurrentCamera
	local t = os.clock()
	-- ── le plateau ──
	if not glisse and not lacher then ang += 0.24 * dt end
	plateau:PivotTo(CFrame.new(P(0, 0.06, 0)) * CFrame.Angles(0, ang, 0) * CFrame.Angles(0, 0, math.pi / 2))
	cible:PivotTo(CFrame.new(P(-6.1, 1.75 + math.sin(t * 1.4) * 0.06, 9.0)) * CFrame.Angles(0, t * 0.9, 0))
	tubeMalade.Transparency = (math.noise(t * 9, 4.2) > 0.25 or math.sin(t * 37) > 0.93) and 0.75 or 0
	-- ── le retourneur ──
	local b = bascule
	if b then
		if not b.fait then
			b.t = math.min(b.t + dt, 0.34)
			local u = b.t / 0.34
			if vitrine then poserCaisse(vitrine, 1 - lisse(u) * 0.94) end
			echelleVue = 1 - lisse(u) * 0.94
			scanner.Transparency = 0.35 + 0.4 * (1 - u)
			scanner.CFrame = CFrame.new(P(0, 0.2 + u * 2.15, 0)) * CFrame.Angles(0, 0, math.pi / 2)
			if b.t >= 0.34 and b.pret then
				if vitrine then Caisse.rendre(vitrine) end
				vitrine = b.pret
				vitrinePg = b.pg
				poserCaisse(b.pret, 0.06)
				echelleVue = 0.06
				b.pret.Parent = dossier
				b.fait = true
				b.t = 0
			end
		else
			b.t += dt
			local u = math.min(1, b.t / 0.5)
			-- le déploiement : vif puis posé (Quint Out — v3 : plus de rebond à chaque caisse, le rebond est gardé pour les fêtes)
			local e = 1 - (1 - u) ^ 5
			local ech = 0.06 + 0.94 * e
			if vitrine then poserCaisse(vitrine, u >= 1 and 1 or ech) end
			echelleVue = u >= 1 and 1 or ech
			scanner.Transparency = math.min(1, 0.35 + u * 1.4)
			scanner.CFrame = CFrame.new(P(0, 2.35 - u * 2.1, 0)) * CFrame.Angles(0, 0, math.pi / 2)
			ang += dt * 2.2 * (1 - u)
			if u >= 1 then
				bascule = nil
				scanner.Transparency = 1
			end
		end
	elseif vitrine and not lacher then
		vitrine:PivotTo(cfPlateau() * CFrame.new(0, 0, impactTick(dt) * M)) -- (le TAP : elle recule d'un rien)
		-- dans l'onglet AILES, la caisse les montre déployées
		if vitrinePg then Caisse.deployer(vitrinePg, (onglet == "aile") and 1 or 0, t * 9) end
	end
	do
		local okT = pcall(apercuTrainee, onglet == "trainee" and not lacher and vitrine ~= nil, t)
		if not okT then apercuTrainee(false, t) end
	end

	-- ── la teinte du plateau : elle glisse vers la couleur de la famille de la caisse montrée ──
	do
		local f9 = Catalogue[montre] or Catalogue[0]
		local c9 = COULEUR_RAR[f9.rar] or CYAN
		local t9 = R3.teinte :: Color3
		if t9 ~= c9 and R3.anneau then
			t9 = t9:Lerp(c9, math.min(1, dt * 5))
			if math.abs(t9.R - c9.R) + math.abs(t9.G - c9.G) + math.abs(t9.B - c9.B) < 0.01 then t9 = c9 end
			R3.teinte = t9
			R3.anneau.Color = t9
			R3.cercle.Color = Color3.new(t9.R * 0.55, t9.G * 0.55, t9.B * 0.55)
			for _, p9 in R3.plots do p9.Color = t9 end
			for _, h9 in R3.halos do h9.Color = t9 end
			scanner.Color = t9
			R3.rive.Color = t9:Lerp(Color3.new(1, 1, 1), 0.15)
		end
		-- (v3) une caisse LONGUE ouvre un peu l'objectif : le corbillard, l'Eldorado ne sortent plus du cadre en tournant
		local k9 = math.clamp((f9.l or 4.6) / 4.8, 1, 1.16)
		R3.fovK = (R3.fovK or 1) + (k9 - (R3.fovK or 1)) * math.min(1, dt * 3)
	end

	-- ── la vue ──
	local vp = cam.ViewportSize
	local aspect = vp.X / math.max(1, vp.Y)
	local fov = 57 * (R3.fovK or 1) -- (v3 : 52 collait la caisse aux bords de l'écran, une longue en sortait)
	local posM: Vector3, viseM: Vector3
	if lacher then
		-- LE LÂCHER : la porte se lève sur le feu, la caisse s'accroupit puis fonce, la vue passe derrière elle
		lacher.t += dt
		local u = math.min(1, lacher.t / 1.7)
		local o = lisse(math.min(1, lacher.t / 0.8))
		porte:PivotTo(CFrame.new(P(0, 0.42 + o * 5.0, PROF / 2 - 0.05)))
		feuPorte.Brightness = o * 1.4
		for k, f in flammes do
			local h = 1.2 + 2.6 * math.abs(math.noise(k * 0.37, t * 3.1)) + math.sin(t * 9 + k) * 0.25
			f.Size = Vector3.new(0.5, h, 0.14) * M
			f.CFrame = CFrame.new(P(-4.75 + (k - 1) * 0.5, h / 2, PROF / 2 + 1.3))
		end
		ang += (0 - ((ang + math.pi) % (math.pi * 2) - math.pi)) * math.min(1, dt * 8) -- le nez se remet face à la porte
		local z = u * u * 17
		if vitrine then
			local accroupi = u < 0.2 and math.sin(u / 0.2 * math.pi) * 0.06 or 0
			vitrine:PivotTo(CFrame.new(0, -accroupi * M, z * M) * cfPlateau())
		end
		local k = lisse(math.min(1, u / 0.45))
		local dep = Vector3.new(0, 1.0 + dist * math.sin(pitch), -dist * math.cos(pitch))
		posM = dep:Lerp(Vector3.new(0, 1.72, z - 6.4), k)
		viseM = Vector3.new(0, 1.0, 1.5):Lerp(Vector3.new(0, 1.0, z + 4), k)
		fov = 57 * (R3.fovK or 1) + (4 + 10 * u) * k
		if u > 0.86 then
			U.fondu.Visible = true
			U.fondu.BackgroundTransparency = 1 - math.min(1, (u - 0.86) / 0.12)
		end
		if u >= 1 and not lacher.fini then
			lacher.fini = true
			local f = lacher.suite
			task.defer(f)
		end
	else
		-- au repos la vue se balance (±11° en 22 s) ; un geste la calme
		local calme = math.clamp((t - touche - 1.5) / 2, 0, 1)
		local az = math.sin(t * math.pi * 2 / 22) * 0.19 * calme
		local d = dist
		posM = Vector3.new(-math.sin(az) * d * math.cos(pitch), 1.0 + d * math.sin(pitch) + math.sin(t * 0.5) * 0.05 * calme, -math.cos(az) * d * math.cos(pitch))
		posM = Vector3.new(math.clamp(posM.X, -(LARG / 2 - 1.2), LARG / 2 - 1.2), math.clamp(posM.Y, 1.0, HAUT - 1.05),
			math.clamp(posM.Z, -(PROF / 2 - 1.2), PROF / 2 - 1.2))
		viseM = Vector3.new(math.sin(az) * 1.5, 1.0, math.cos(az) * 1.5)
	end
	-- le cadrage : la console occupe la droite, la caisse se centre dans ce qui reste (pas de décalage d'objectif chez Roblox :
	-- on tourne la tête de l'angle qui amène le plateau au milieu de la zone libre)
	local k = 0
	if not lacher or lacher.t < 0.3 then
		-- la part de l'écran que prend la console (mesurée : elle suit l'échelle de l'interface)
		local occupe9 = math.min(0.7, U.console.AbsoluteSize.X * (1 + 44 / W_CONSOLE) / math.max(1, vp.X))
		k = math.atan(occupe9 * math.tan(math.rad(fov / 2)) * aspect)
		if lacher then k *= 1 - lacher.t / 0.3 end
	end
	if cam.CameraType ~= Enum.CameraType.Scriptable then cam.CameraType = Enum.CameraType.Scriptable end
	cam.FieldOfView = fov
	cam.CFrame = CFrame.lookAt(O + posM * M, O + viseM * M) * CFrame.Angles(0, -k, 0)
	-- les deux lampes de studio suivent la vue
	lampeCle.CFrame = CFrame.new(P(-math.sin(0.72) * 5.2, 4.1, -math.cos(0.72) * 5.2))
	lampeRive.CFrame = CFrame.new(P(math.sin(0.6) * 6, 2.3, math.cos(0.6) * 6))
end

-- ════════ les gestes ════════
local function brancherGestes()
	UserInputService.InputBegan:Connect(function(io, traite)
		if not Garage.ouvert or lacher then return end
		if io.UserInputType == Enum.UserInputType.Keyboard then
			if traite then return end
			if io.KeyCode == Enum.KeyCode.Left then Garage.voisin(-1)
			elseif io.KeyCode == Enum.KeyCode.Right then Garage.voisin(1)
			elseif io.KeyCode == Enum.KeyCode.Return or io.KeyCode == Enum.KeyCode.KeypadEnter then Garage.jouer()
			elseif io.KeyCode == Enum.KeyCode.Escape or io.KeyCode == Enum.KeyCode.Backspace then ctx.surHome() end
			return
		end
		if traite or glisse then return end
		if io.UserInputType == Enum.UserInputType.MouseButton1 or io.UserInputType == Enum.UserInputType.Touch then
			glisse = { io = io, x0 = io.Position.X, y0 = io.Position.Y, x = io.Position.X, y = io.Position.Y, t0 = os.clock(),
				souris = io.UserInputType == Enum.UserInputType.MouseButton1 }
			touche = os.clock()
		end
	end)
	UserInputService.InputChanged:Connect(function(io, traite)
		if not Garage.ouvert or lacher then return end
		if io.UserInputType == Enum.UserInputType.MouseWheel then
			if not traite then
				dist = math.clamp(dist - io.Position.Z * 0.5, 4.6, 8.6)
				touche = os.clock()
			end
			return
		end
		local g = glisse
		if not g then return end
		if (g.souris and io.UserInputType == Enum.UserInputType.MouseMovement) or io == g.io then
			local dx, dy = io.Position.X - g.x, io.Position.Y - g.y
			g.x, g.y = io.Position.X, io.Position.Y
			ang -= dx * 0.01
			pitch = math.clamp(pitch + dy * 0.006, 0.02, 0.82)
			touche = os.clock()
		end
	end)
	UserInputService.InputEnded:Connect(function(io)
		local g = glisse
		if not g then return end
		if (g.souris and io.UserInputType == Enum.UserInputType.MouseButton1) or io == g.io then
			glisse = nil
			-- un coup de pouce VIF (> 64 px, surtout horizontal) feuillette : vers la gauche = la suivante
			local dx, dy = g.x - g.x0, g.y - g.y0
			if Garage.ouvert and not lacher and os.clock() - g.t0 < 0.3 and math.abs(dx) > 64 and math.abs(dx) > 1.3 * math.abs(dy) then
				Garage.voisin(dx < 0 and 1 or -1)
			elseif Garage.ouvert and not lacher and math.abs(dx) < 14 and math.abs(dy) < 14 then
				impact() -- ni glissé ni swipe : un TAP
			end
		end
	end)
	UserInputService.TouchPinch:Connect(function(_, echelle, _, etat, traite)
		if not Garage.ouvert or lacher or traite then return end
		if etat == Enum.UserInputState.Change then
			dist = math.clamp(dist / math.clamp(echelle, 0.96, 1.04), 4.6, 8.6)
			touche = os.clock()
		end
	end)
end

-- ════════ ouvrir, fermer, jouer ════════
function Garage.init(c: any)
	ctx = c
	creerInterface()
	brancherGestes()
end

function Garage.ouvrir(indice: number?)
	if Garage.ouvert then return end
	if not dossier then batir() end
	Garage.ouvert = true
	Garage.lance = false
	lacher = nil
	bascule = nil
	glisse = nil
	ang, pitch, dist = 0, 0.2, 7.8
	touche = 0
	porte:PivotTo(CFrame.new(P(0, 0.42, PROF / 2 - 0.05)))
	feuPorte.Brightness = 0
	scanner.Transparency = 1;
	(dossier :: Folder).Parent = workspace
	ambiance(true)
	U.racine.Visible = true
	U.fondu.Visible = false
	onglet = "voiture"
	table.clear(essai)
	filtre = "tout"
	Garage.majOnglets()
	montre = -1
	famille = ""
	ficheCle = ""
	majCompte(true)
	Garage.sauter(indice or profil().caisse or 0, true)
	U.racine.Position = UDim2.fromOffset(0, 18)
	TweenService:Create(U.racine, K.LENTE, { Position = UDim2.fromOffset(0, 0) }):Play()
	-- (v3) la console arrive de la droite, la fiche de la gauche (entreeFiche) : l'écran se pose, il ne s'allume pas d'un coup
	U.console.Position = U.consoleP0 + UDim2.fromOffset(70, 0)
	TweenService:Create(U.console, TweenInfo.new(0.32, Enum.EasingStyle.Quint, Enum.EasingDirection.Out), { Position = U.consoleP0 }):Play()
end

function Garage.fermer()
	if not Garage.ouvert then return end
	Garage.ouvert = false
	fileN += 1
	jeton += 1
	bascule = nil
	lacher = nil
	glisse = nil
	if vitrine then
		Caisse.rendre(vitrine)
		vitrine = nil
	end
	vitrinePg = nil
	table.clear(essai)
	for _, t in tuilesH do t.cadre:Destroy() end
	table.clear(tuilesH)
	for i, t in tuiles do
		Caisse.rendre(t.modele)
		t.cadre:Destroy()
		tuiles[i] = nil
	end
	if dossier then dossier.Parent = nil end
	ambiance(false)
	U.racine.Visible = false
	if U.fondu.Visible then
		TweenService:Create(U.fondu, TweenInfo.new(0.5), { BackgroundTransparency = 1 }):Play()
		task.delay(0.55, function() if not Garage.ouvert then U.fondu.Visible = false end end)
	end
end

-- le profil a changé (une partie finie, un achat validé ailleurs) : on rafraîchit ce qu'on montre
function Garage.majProfil()
	if Garage.ouvert then majTout() end
end

-- LES VIGNETTES SE PRÊTENT (le budget de triangles de Roblox est compté) : la boutique ouverte depuis le garage a besoin de la
-- place — false = on rend les photos (les pastilles reviennent), true = on les reprend
function Garage.vignettes(on: boolean)
	if on then
		if Garage.ouvert and onglet == "voiture" then majBande() end
		return
	end
	fileN += 1
	for _, t in tuiles do
		if t.modele then
			Caisse.rendre(t.modele)
			t.modele = nil
		end
		t.enCours = false
		t.pastille.Visible = true
	end
end

-- JOUER : équipe la caisse montrée si elle est ouverte (garageLaunch), puis le lâcher
function Garage.jouer()
	if not Garage.ouvert or Garage.lance or occupe then return end
	Garage.lance = true
	task.spawn(function()
		if ouverte(montre) and profil().caisse ~= montre then
			local ok = ctx.action("equiper", montre)
			if ok then ctx.surEquipe(montre) end
		elseif not ouverte(montre) and vitrine then
			-- on essayait une caisse fermée : on repart avec la sienne
			Garage.sauter(profil().caisse or 0, true)
		end
		Sons.jouer("decollage")
		TweenService:Create(U.racine, K.LENTE, { Position = UDim2.fromOffset(0, 40) }):Play()
		task.delay(0.25, function() if Garage.lance then U.racine.Visible = false end end)
		lacher = { t = 0, suite = function() ctx.surJouer() end }
	end)
end

-- presser le lingot de décision, comme un doigt (la manette, le banc)
function Garage.dbgDecider() decider() end

return Garage
