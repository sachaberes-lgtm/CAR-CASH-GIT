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
local inst = K.inst

local Garage = { ouvert = false }

-- ════════ les mots ════════
local L = FR and {
	voitures = "VOITURES", peinture = "PEINTURE", ailes = "AILES", trainees = "TRAINEES",
	home = "HOME", boutique = "BOUTIQUE", jouer = "JOUER", acheter = "ACHETER", manque = "IL MANQUE",
	equiper = "EQUIPER", verrou = "VERROUILLEE", enBoutique = "EN BOUTIQUE", aToi = "A TOI !",
	ilTeManque = "IL TE MANQUE ", bientot = "BIENTOT DISPONIBLE",
	tout = "TOUT", aMoi = "A MOI", aAcheter = "A ACHETER", gagner = "A GAGNER", defi = "ROUE",
	roue = "SE GAGNE A LA ROUE (ACCUEIL)", carrN = "ATTRAPE-LA AU NIVEAU 10 DES NUAGES  (%d / 10)",
	carrV = "BATS LE BANQUIER AU NIVEAU 10 DE LA VILLE  (%d / 10)", aura = "RANG D'AURA « %s »   (le tien : « %s »)",
	rangs = { "ANONYME", "REMARQUE", "ON PARLE DE TOI", "REPUTE", "LEGENDE LOCALE", "STAR DU BITUME", "MYTHE", "DIVINITE DU CIEL" },
} or {
	voitures = "CARS", peinture = "PAINT", ailes = "WINGS", trainees = "TRAILS",
	home = "HOME", boutique = "SHOP", jouer = "PLAY", acheter = "BUY", manque = "SHORT BY",
	equiper = "EQUIP", verrou = "LOCKED", enBoutique = "IN THE SHOP", aToi = "YOURS!",
	ilTeManque = "SHORT BY ", bientot = "COMING SOON",
	tout = "ALL", aMoi = "MINE", aAcheter = "FOR SALE", gagner = "EARN IT", defi = "WHEEL",
	roue = "WON ON THE WHEEL (HOME SCREEN)", carrN = "CATCH HER IN CLOUDS LEVEL 10  (%d / 10)",
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
		local pan = bloc("Panneau", 10, 0.78, 0.12, 0, 0.42 + k * 0.816, PROF / 2 - 0.05, Color3.fromRGB(214, 218, 230), Enum.Material.Metal, porte)
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
	anneau.CastShadow = false
	local disque = cyl("Disque", 4.38, 0.12, 0, 0.06, 0, Color3.fromRGB(40, 44, 66), nil, plateau)
	disque.Reflectance = 0.2
	cyl("Cercle", 3.22, 0.122, 0, 0.061, 0, Color3.fromRGB(40, 150, 170), Enum.Material.Neon, plateau).CastShadow = false
	cyl("Coeur", 3.18, 0.124, 0, 0.062, 0, Color3.fromRGB(34, 38, 58), nil, plateau).Reflectance = 0.2
	for k = 0, 11 do
		local a = k / 12 * math.pi * 2
		bloc("Plot", 0.16, 0.03, 0.16, math.cos(a) * 4.05, 0.13, math.sin(a) * 4.05, CYAN, Enum.Material.Neon, plateau).CastShadow = false
	end
	plateau.PrimaryPart = disque
	plateau.Parent = d
	-- le halo cyan qui lèche le sol autour du plateau
	for k = 0, 2 do
		local a = k / 3 * math.pi * 2 + 0.5
		lampe("HaloPlateau", math.cos(a) * 5.4, 0.5, math.sin(a) * 5.4, CYAN, 0.3, 18)
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
	lampeRive = lampe("Rive", 0, 2.3, 6, CYAN, 0.45, 52)
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
		Lighting.Ambient = Color3.fromRGB(46, 44, 84)
		Lighting.OutdoorAmbient = Color3.fromRGB(46, 44, 84)
		Lighting.ExposureCompensation = -0.25
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
-- L'INTERFACE
-- ════════════════════════════════════════════════════════════════════════════════════════════════
local U: any = {}
local CASH = Color3.fromRGB(125, 255, 155)
local OR1 = Color3.fromRGB(255, 226, 122)
local ROUGE = Color3.fromRGB(255, 74, 100)
local ENCRE_OR = Color3.fromRGB(58, 24, 0)
-- LA CONSOLE AUX PROPORTIONS DU WEB (garage v7, 844 × 390 porté sur 720 px) : elle tient la moitié droite de l'écran. Elle est
-- dessinée à 470 × 342 puis agrandie d'un bloc (UIScale × ECH_CONSOLE) ; ses textes sont écrits en conséquence (la police pixel
-- fait 5/9 de son TextSize : voir Hud).
local W_CONSOLE, H_CONSOLE, ECH_CONSOLE = 470, 342, 1.6

-- une PLAQUE de la barre d'action : un cadre (qu'on place) et un fond (qui s'enfonce)
local STYLES = {
	or_ = { ColorSequence.new({ ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 250, 223)), ColorSequenceKeypoint.new(0.5, Color3.fromRGB(255, 208, 68)),
		ColorSequenceKeypoint.new(1, Color3.fromRGB(234, 147, 10)) }), C.orSh, ENCRE_OR },
	laque = { ColorSequence.new(Color3.fromRGB(39, 32, 73), Color3.fromRGB(20, 16, 41)), C.trait, C.texte },
	verrou = { ColorSequence.new(Color3.fromRGB(22, 20, 38), Color3.fromRGB(14, 12, 26)), Color3.fromRGB(40, 36, 66), C.terne },
}
local ICONES = { ["⌂"] = "maison", ["$"] = "panier" } -- (ce que la police pixel n'a pas : une icône du web)
local function plaque(parent: Instance, nom: string): any
	local cadre = inst("Frame", { Name = nom, BackgroundTransparency = 1 }, parent)
	local tranche = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(10, 8, 24), Size = UDim2.new(1, 0, 1, 0), Position = UDim2.fromOffset(0, 5) }, cadre)
	local fond = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.new(1, 1, 1), Size = UDim2.fromScale(1, 1) }, cadre)
	local grad = inst("UIGradient", { Rotation = 90 }, fond)
	local trait = inst("UIStroke", { Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, fond)
	local filet = inst("Frame", { BorderSizePixel = 0, Size = UDim2.new(0, 4, 1, 0) }, fond)
	local l1 = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIX, Size = UDim2.new(1, -10, 0, 16), Position = UDim2.fromOffset(5, 7),
		TextSize = 14, Text = "" }, fond)
	local l2 = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIX, Size = UDim2.new(1, -10, 1, 0), Position = UDim2.fromOffset(5, 0),
		TextSize = 16, Text = "" }, fond)
	local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.new(1, 0, 1, 5), Text = "", AutoButtonColor = false, ZIndex = 4 }, cadre)
	local pq = { cadre = cadre, fond = fond, grad = grad, trait = trait, filet = filet, l1 = l1, l2 = l2, b = b, tranche = tranche, enfonce = false,
		ico = nil :: Frame?, icoNom = "", icoSeule = false }
	local function pose(bas: boolean)
		TweenService:Create(fond, K.RAPIDE, { Position = UDim2.fromOffset(0, (bas or pq.enfonce) and 5 or 0) }):Play()
	end
	b.MouseButton1Down:Connect(function() pose(true) end)
	b.MouseButton1Up:Connect(function() pose(false) end)
	b.MouseLeave:Connect(function() pose(false) end)
	b.Activated:Connect(function() Sons.jouer("tap") end)
	return pq
end
-- style : "or_" | "laque" | "verrou" ; filet = la couleur du liseré gauche (laque) ; l1 petite ligne, l2 grande
local function habiller(pq: any, style: string, filet: Color3?, l1: string?, l2: string, corps: number?, couleur2: Color3?)
	local s = STYLES[style]
	pq.grad.Color = s[1]
	pq.trait.Color = (style == "laque" and filet == ROUGE) and ROUGE or s[2]
	pq.filet.Visible = style == "laque" and filet ~= nil
	if filet then pq.filet.BackgroundColor3 = filet end
	-- « ⌂ » et « $ » : la police pixel ne les a pas — une icône pixel du web à la place (au-dessus du libellé, ou seule)
	local ico = (l1 and ICONES[l1]) or ICONES[l2]
	local seule = ICONES[l2] ~= nil
	if ico ~= pq.icoNom or (ico and pq.icoSeule ~= seule) then
		if pq.ico then pq.ico:Destroy() end
		pq.ico, pq.icoNom, pq.icoSeule = nil, ico or "", seule
		if ico then
			pq.ico = K.icone(pq.fond, ico, seule and 3 or 2, filet or s[3], UDim2.new(0.5, 0, seule and 0.5 or 0, seule and 0 or 8), Vector2.new(0.5, seule and 0.5 or 0))
		end
	elseif pq.ico and filet then
		K.teinter(pq.ico, filet)
	end
	if ico and not seule then l1 = " " end -- (la place de l'icône)
	if seule then l2 = "" end
	pq.l1.Text = (l1 and l1 ~= " ") and l1 or ""
	pq.l1.TextColor3 = s[3]
	pq.l2.Text = l2
	pq.l2.TextColor3 = couleur2 or s[3]
	pq.l2.TextSize = corps or 16
	pq.l2.Position = UDim2.fromOffset(5, l1 and 11 or 0)
	pq.enfonce = style == "verrou"
	pq.fond.Position = UDim2.fromOffset(0, pq.enfonce and 5 or 0)
end

local tuiles: { [number]: any } = {}
local RESERVE = 9000 -- triangles qu'une photo ne prend jamais (la caisse du plateau en a besoin)
local fileN = 0 -- le numéro de la file de photos en cours (changer de famille l'annule)

-- LA PHOTO d'une caisse (carPhoto du web) : trois-quarts avant, nez à gauche, objectif de 24°
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
	local dist = projete / 0.9 / (2 * math.tan(math.rad(12)) * (104 / 54)) + corps.Size.Z * 0.18
	local cam = Instance.new("Camera")
	cam.FieldOfView = 24
	local vise = corps.Position + Vector3.new(0, -corps.Size.Y * 0.04, 0)
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
	local aMoi = possede(i)
	local equipee = profil().caisse == i
	local sombre = not aMoi and f.cond.k ~= "depart"
	t.vp.ImageColor3 = sombre and Color3.fromRGB(120, 112, 150) or Color3.new(1, 1, 1)
	t.verrou.Visible = sombre
	t.losange.Visible = equipee
	local etiquette, couleur = "", CASH
	if sombre then
		if f.cond.k == "prix" then etiquette = Hud.argent(f.cond.v)
		-- (4/10, version publique : Roblox se paie en Robux — plus aucun prix en euros à l'écran ; la caisse de la boutique dit BOUTIQUE,
		-- celle de la roue dit ROUE)
		elseif f.cond.k == "premium" then etiquette, couleur = L.boutique, OR1
		elseif f.cond.k == "roue" then etiquette, couleur = L.defi, OR1 end
	elseif not equipee then
		etiquette = "✓"
	end
	t.prix.Text = etiquette
	t.prix.TextColor3 = couleur
	t.trait.Enabled = i == montre
	t.cadre.BackgroundColor3 = i == montre and Color3.fromRGB(52, 44, 96) or Color3.fromRGB(26, 22, 50)
end

local function creerTuile(i: number, rang: number): any
	local f = Catalogue[i]
	local c = COULEUR_RAR[f.rar]
	local cadre = inst("Frame", { Name = "T" .. i, BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(26, 22, 50), LayoutOrder = rang, ClipsDescendants = true }, U.bande)
	local trait = inst("UIStroke", { Color = c, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border, Enabled = false }, cadre)
	local vp = inst("ViewportFrame", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Ambient = Color3.fromRGB(150, 150, 178),
		LightColor = Color3.fromRGB(255, 244, 230) }, cadre)
	-- en attendant la photo : une pastille à la couleur de sa laque
	local pastille = inst("Frame", { BorderSizePixel = 0, AnchorPoint = Vector2.new(0.5, 0.5), Position = UDim2.fromScale(0.5, 0.45),
		Size = UDim2.fromOffset(44, 12), BackgroundColor3 = Color3.fromHex(string.format("%06x", f.laque)) }, cadre)
	inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = c, Size = UDim2.new(1, 0, 0, 3), Position = UDim2.new(0, 0, 1, -3), ZIndex = 2 }, cadre)
	local prix = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIX, TextSize = 15, Text = "", TextColor3 = CASH,
		Size = UDim2.new(1, -6, 0, 16), Position = UDim2.new(0, 0, 1, -21), TextXAlignment = Enum.TextXAlignment.Right, ZIndex = 3 }, cadre)
	inst("UIStroke", { Color = C.encre, Thickness = 2 }, prix)
	local verrou = K.icone(cadre, "verrou", 1, Color3.fromRGB(190, 180, 255), UDim2.fromOffset(5, 5))
	verrou.ZIndex = 3
	for _, p in verrou:GetChildren() do (p :: Frame).ZIndex = 3 end
	verrou.Visible = false
	local losange = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(255, 199, 42), Size = UDim2.fromOffset(9, 9),
		Position = UDim2.fromOffset(7, 6), Rotation = 45, ZIndex = 3, Visible = false }, cadre)
	local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", ZIndex = 5 }, cadre)
	local t = { cadre = cadre, trait = trait, vp = vp, pastille = pastille, prix = prix, verrou = verrou, losange = losange, b = b }
	b.Activated:Connect(function()
		Sons.jouer("tap")
		Garage.sauter(i)
	end)
	return t
end

-- une tuile d'HABILLAGE : le nuancier de la laque, le ruban de la traînée, le nom de l'aile
local tuilesH: { any } = {}
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
	local p = tenue()
	for j, d in HABITS[cat] do
		if passeFiltre(cat, d) then
			local cadre = inst("Frame", { Name = "H" .. j, BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(26, 22, 50), LayoutOrder = j, ClipsDescendants = true }, U.bande)
			local trait = inst("UIStroke", { Color = C.magenta, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border, Enabled = j == choisi[cat] }, cadre)
			if cat == "aile" then
				inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIX, TextSize = 13, TextWrapped = true, Text = FR and d.nom or d.en, TextColor3 = COUL_CAT.aile,
					Size = UDim2.new(1, -8, 1, -18), Position = UDim2.fromOffset(4, 2) }, cadre)
			else
				local nu = inst("Frame", { BorderSizePixel = 0, Size = UDim2.new(1, -16, 0, (cat == "trainee") and 12 or 26), Position = UDim2.fromOffset(8, (cat == "trainee") and 14 or 6),
					BackgroundColor3 = Color3.new(1, 1, 1) }, cadre)
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
			inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = COUL_CAT[cat], Size = UDim2.new(1, 0, 0, 3), Position = UDim2.new(0, 0, 1, -3), ZIndex = 2 }, cadre)
			local a = aHabit(cat, d)
			local etiquette, couleur = "", CASH
			if a then
				etiquette = (p[cat] == d.id) and "" or "✓"
			elseif d.p then
				etiquette = Hud.argent(d.p)
			else
				etiquette, couleur = L.defi, OR1
			end
			local prix = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIX, TextSize = 15, Text = etiquette, TextColor3 = couleur,
				Size = UDim2.new(1, -6, 0, 16), Position = UDim2.new(0, 0, 1, -21), TextXAlignment = Enum.TextXAlignment.Right, ZIndex = 3 }, cadre)
			inst("UIStroke", { Color = C.encre, Thickness = 2 }, prix)
			if p[cat] == d.id then
				inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(255, 199, 42), Size = UDim2.fromOffset(9, 9), Position = UDim2.new(1, -16, 1, -18), Rotation = 45, ZIndex = 3 }, cadre)
			end
			local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Text = "", ZIndex = 5 }, cadre)
			b.Activated:Connect(function()
				Sons.jouer("tap")
				Garage.essayer(cat, j)
			end)
			table.insert(tuilesH, { cadre = cadre, trait = trait, j = j })
		end
	end
	U.bande.CanvasPosition = Vector2.zero
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
				if t and not t.modele and not t.enCours then
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

local function majPastilles()
	local voitures = onglet == "voiture"
	for _, r in RARETES do U.pastilles[r.id].fond.Visible = voitures end
	for id, f in U.filtres do
		f.fond.Visible = not voitures
		if not voitures then
			local n = 0
			for _, d in HABITS[onglet] do
				local a = aHabit(onglet, d)
				if id == "tout" or (id == "moi" and a) or (id == "acheter" and not a and d.p ~= nil) then n += 1 end
			end
			f.txt.Text = f.nom .. " " .. n
			local actif = id == filtre
			f.fond.BackgroundColor3 = actif and f.c:Lerp(Color3.fromRGB(20, 16, 41), 0.72) or Color3.fromRGB(20, 16, 41)
			f.trait.Color = actif and f.c or C.trait
		end
	end
	if not voitures then return end
	for _, r in RARETES do
		local p = U.pastilles[r.id]
		local a, n = 0, 0
		for _, i in FAMILLES[r.id] do
			n += 1
			if possede(i) or Catalogue[i].cond.k == "depart" then a += 1 end
		end
		p.txt.Text = a .. "/" .. n
		local actif = r.id == famille
		p.fond.BackgroundColor3 = actif and r.c:Lerp(Color3.fromRGB(20, 16, 41), 0.72) or Color3.fromRGB(20, 16, 41)
		p.trait.Color = actif and r.c or C.trait
		p.txt.TextColor3 = actif and C.texte or C.texte2
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
		Hud.tenir(U.compteEchelle, U.compte.Text, 44, 262)
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
			Hud.tenir(U.compteEchelle, U.compte.Text, 44, 262)
		end
	end)
end

-- ce qu'il reste à faire pour une caisse fermée (carUnlockText)
local function condition(i: number): string
	local k = Catalogue[i].cond
	if k.k == "roue" then return L.roue end
	if k.k == "aura" then return string.format(L.aura, L.rangs[k.v + 1] or "?", L.rangs[rangAura(profil().aura or 0)]) end
	if k.k == "premium" then return L.boutique .. " — " .. L.bientot end
	return ""
end

-- LA DÉCISION (gEtat + gPrixHtml + gActSync) : quel bouton, en or ou non
local decision = "" -- "" | acheter | pauvre | equiper | verrou | boutique | gagner
local prixDecision = 0
local function majFicheHabit()
	local cat = onglet
	local liste = HABITS[cat]
	local d = liste[choisi[cat]]
	local nom = FR and d.nom or d.en
	U.nom.Text = nom
	U.nom.TextSize = math.clamp(math.floor(1000 / math.max(8, utf8.len(nom) or #nom)), 34, 86)
	U.barre.BackgroundColor3 = COUL_CAT[cat]
	U.rang.Text = choisi[cat] .. " / " .. #liste
	U.desc.Text = FR and d.d or d.dEN
	local compte = profil().compte or 0
	local a = aHabit(cat, d)
	if a then
		decision = (tenue()[cat] == d.id) and "" or "equiper"
	elseif d.p then
		decision = (compte >= d.p) and "acheter" or "pauvre"
		prixDecision = d.p
	else
		decision = "gagner"
	end
end
local function majFiche()
	if onglet ~= "voiture" then
		majFicheHabit()
	else
		Garage.majFicheCaisse()
	end
	local compte = profil().compte or 0
	local choix = decision ~= ""
	local x = 14
	local function placer(pq: any, l: number, visible: boolean)
		pq.cadre.Visible = visible
		if not visible then return end
		pq.cadre.Position = UDim2.fromOffset(x, 262)
		pq.cadre.Size = UDim2.fromOffset(l, 62)
		x += l + 8
	end
	local reste = W_CONSOLE - 28
	if choix then
		placer(U.btHome, 52, true)
		placer(U.btBoutique, 52, true)
		reste -= (52 + 8) * 2
		local lDec = math.floor((reste - 8) * 0.56)
		placer(U.btDecision, lDec, true)
		placer(U.btJouer, reste - 8 - lDec, true)
		habiller(U.btHome, "laque", C.lavande, nil, "⌂", 22)
		habiller(U.btBoutique, "laque", C.magenta, nil, "$", 18)
		habiller(U.btJouer, "laque", C.cyan, nil, L.jouer, 24)
		if decision == "acheter" then
			habiller(U.btDecision, "or_", nil, L.acheter, Hud.argent(prixDecision), 28)
		elseif decision == "pauvre" then
			habiller(U.btDecision, "laque", ROUGE, L.manque, Hud.argent(prixDecision - compte), 24, ROUGE)
		elseif decision == "equiper" then
			habiller(U.btDecision, "or_", nil, nil, L.equiper, 30)
		elseif decision == "boutique" then
			habiller(U.btDecision, "or_", nil, L.enBoutique, FR and "BIENTOT" or "SOON", 26)
		elseif decision == "gagner" then
			habiller(U.btDecision, "verrou", nil, nil, L.gagner, 17)
		else
			habiller(U.btDecision, "verrou", nil, nil, L.verrou, 17)
		end
	else
		placer(U.btHome, 76, true)
		placer(U.btBoutique, 86, true)
		placer(U.btDecision, 0, false)
		placer(U.btJouer, reste - 76 - 86 - 16, true)
		habiller(U.btHome, "laque", C.lavande, "⌂", L.home, 19)
		habiller(U.btBoutique, "laque", C.magenta, "$", L.boutique, 16)
		habiller(U.btJouer, "or_", nil, nil, L.jouer, 62)
	end
end
function Garage.majFicheCaisse()
	local f = Catalogue[montre]
	local c = COULEUR_RAR[f.rar]
	local nom = FR and f.nom or (f.en or f.nom)
	nom = string.upper(nom)
	U.nom.Text = nom
	U.nom.TextSize = math.clamp(math.floor(1000 / math.max(8, utf8.len(nom) or #nom)), 34, 86)
	U.barre.BackgroundColor3 = c
	U.rang.Text = RANG[montre] .. " / " .. #LISTE
	local k = f.cond
	local aMoi, ouv = gagnee(montre), ouverte(montre)
	local test = ouv and not aMoi
	-- la fiche n'écrit que la condition d'une caisse fermée (le prix, lui, est sur le bouton et la vignette)
	local desc = ""
	if not aMoi and k.k ~= "prix" then desc = "🔒 " .. condition(montre) end
	if test then desc = '<font color="#ffd75e">[TEST]</font> ' .. desc end
	U.desc.Text = desc
	-- le bouton
	local compte = profil().compte or 0
	if k.k == "prix" and not possede(montre) then
		decision = compte >= k.v and "acheter" or "pauvre"
		prixDecision = k.v
	elseif k.k == "premium" and not possede(montre) and not ouv then
		decision = "boutique"
	elseif not ouv then
		decision = "verrou"
	elseif profil().caisse ~= montre then
		decision = "equiper"
	else
		decision = ""
	end
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
	local p0 = UDim2.new(1, -22, 1, -16)
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
		Hud.toast(L.ilTeManque .. Hud.argent(d.p - (profil().compte or 0)), ROUGE, "croix")
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
		Hud.toast(L.ilTeManque .. Hud.argent(f.cond.v - (profil().compte or 0)), ROUGE, "croix")
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
	elseif decision == "verrou" then
		secouer()
		Hud.toast(condition(montre), nil, "verrou")
	elseif decision == "boutique" then
		Hud.toast(L.bientot, nil, "panier")
	end
end

local function creerInterface()
	local racine = Hud.racine
	local g = inst("Frame", { Name = "Garage", BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), Visible = false }, racine)
	U.racine = g
	-- les voiles : le haut et la droite s'assombrissent pour que le texte se lise (rien de flou : charte)
	local vh = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(7, 5, 15), Size = UDim2.new(1, 0, 0, 190) }, g)
	inst("UIGradient", { Rotation = 90, Transparency = NumberSequence.new(0.15, 1) }, vh)
	local vd = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(7, 5, 15), Size = UDim2.new(0, 900, 1, 0), Position = UDim2.fromScale(1, 0),
		AnchorPoint = Vector2.new(1, 0) }, g)
	inst("UIGradient", { Rotation = 0, Transparency = NumberSequence.new(1, 0.3) }, vd)
	U.eclat = inst("Frame", { BorderSizePixel = 0, BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1) }, g)

	-- ── le COMPTE ──
	local cp = K.carbone(g, UDim2.fromOffset(340, 68), UDim2.fromOffset(40, 20))
	inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = CASH, Size = UDim2.new(1, 0, 0, 3), Position = UDim2.new(0, 0, 1, -3) }, cp)
	K.icone(cp, "piece", 4, { { 0.3, Color3.fromRGB(255, 240, 170) }, { 0.7, Color3.fromRGB(255, 199, 42) }, { 1, Color3.fromRGB(240, 150, 10) } }, UDim2.new(0, 16, 0.5, -1), Vector2.new(0, 0.5))
	U.compte = K.texte(cp, { Text = "$ 0", TextSize = 44, TextColor3 = CASH, Size = UDim2.new(1, -70, 1, 0), Position = UDim2.fromOffset(64, 0),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 3, contourCouleur = Color3.fromRGB(5, 36, 15) })
	U.compteEchelle = inst("UIScale", {}, U.compte)
	U.compteCadre = cp

	-- ── la FICHE : nom, barre de rareté, rang, condition ──
	U.nom = K.texte(g, { italique = true, Text = "", TextSize = 86, TextColor3 = C.texte, Size = UDim2.fromOffset(640, 90), Position = UDim2.fromOffset(44, 102),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false, epais = 4 })
	U.barre = inst("Frame", { BorderSizePixel = 0, Size = UDim2.fromOffset(440, 6), Position = UDim2.fromOffset(42, 196) }, g)
	U.rang = K.texte(g, { Text = "", TextSize = 28, TextColor3 = C.terne, Size = UDim2.fromOffset(420, 30), Position = UDim2.fromOffset(44, 210),
		TextXAlignment = Enum.TextXAlignment.Left, TextWrapped = false })
	U.desc = K.texte(g, { Text = "", RichText = true, TextSize = 20, TextColor3 = C.texte2, Size = UDim2.fromOffset(600, 120), Position = UDim2.fromOffset(44, 250),
		TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top, LineHeight = 1.4 })
	U.tampon = K.texte(g, { Text = L.aToi, TextSize = 90, TextColor3 = Color3.fromRGB(255, 215, 94), Size = UDim2.fromOffset(760, 110),
		Position = UDim2.new(0.3, 0, 0.42, 0), AnchorPoint = Vector2.new(0.5, 0.5), Rotation = -9, Visible = false, epais = 5,
		contourCouleur = Color3.fromRGB(70, 30, 0), ZIndex = 20 })
	U.tamponEchelle = inst("UIScale", {}, U.tampon)

	-- ── ⚙ ──
	U.btReglages = K.tuile(g, "", C.cyan, UDim2.fromOffset(104, 84), UDim2.new(1, -22, 0, 20), Vector2.new(1, 0), 30, "reglages")

	-- ── LA CONSOLE ──
	local cs = K.carbone(g, UDim2.fromOffset(W_CONSOLE, H_CONSOLE), UDim2.new(1, -22, 1, -16), nil, Vector2.new(1, 1))
	cs.Active = true -- un glissé qui commence sur la console ne fait pas tourner la caisse
	-- (le web est un écran de téléphone couché, 2,16 fois plus large que haut : sur un écran d'ordinateur 16:9 la console à pleine
	-- taille mangerait 59 % de la largeur — elle se réduit pour laisser la moitié de l'image à la caisse)
	local echelle = inst("UIScale", { Scale = ECH_CONSOLE }, cs)
	local function caler()
		local large = Hud.racine.AbsoluteSize.X / math.max(0.01, Hud.racine:FindFirstChildOfClass("UIScale").Scale) -- la largeur dessinée
		echelle.Scale = ECH_CONSOLE * math.clamp(large / 1560, 0.72, 1)
	end
	caler()
	Hud.racine:GetPropertyChangedSignal("AbsoluteSize"):Connect(caler)
	U.console = cs
	for k, c in { C.magenta, C.cyan, C.or_ } do -- la livrée, en liseré
		inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = c, Size = UDim2.new(k == 1 and 0.44 or 0.25, -6, 0, 3),
			Position = UDim2.new(k == 1 and 0 or (k == 2 and 0.46 or 0.73), 0, 0, -3) }, cs)
	end
	-- les onglets
	U.onglets = {}
	local lo = (W_CONSOLE - 28 - 12) / 4
	for k, o in { { "voiture", L.voitures, "voiture" }, { "peinture", L.peinture, "pinceau" }, { "aile", L.ailes, "aile" }, { "trainee", L.trainees, "trainee" } } do
		local f = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.new(1, 1, 1), Size = UDim2.fromOffset(lo, 52),
			Position = UDim2.fromOffset(14 + (k - 1) * (lo + 4), 14) }, cs)
		local grad = inst("UIGradient", { Rotation = 90 }, f)
		local ico = K.icone(f, o[3], 2, C.terne, UDim2.new(0.5, 0, 0, 7), Vector2.new(0.5, 0))
		local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.fromScale(1, 1), FontFace = K.PIX, Text = o[2], TextSize = 16,
			TextYAlignment = Enum.TextYAlignment.Bottom, AutoButtonColor = false }, f)
		inst("UIPadding", { PaddingBottom = UDim.new(0, 4) }, b)
		U.onglets[o[1]] = { f = f, grad = grad, b = b, ico = ico }
		b.Activated:Connect(function()
			Sons.jouer("tap")
			Garage.onglet(o[1])
		end)
	end
	-- les pastilles de famille
	U.pastilles = {}
	local lp = (W_CONSOLE - 28 - 16) / 5
	for k, r in RARETES do
		local f = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(20, 16, 41), Size = UDim2.fromOffset(lp, 36),
			Position = UDim2.fromOffset(14 + (k - 1) * (lp + 4), 76) }, cs)
		local trait = inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, f)
		inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = r.c, Size = UDim2.fromOffset(9, 9), Position = UDim2.new(0, 12, 0.5, 0),
			AnchorPoint = Vector2.new(0.5, 0.5), Rotation = 45 }, f)
		inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = r.c, Size = UDim2.new(1, 0, 0, 2), Position = UDim2.new(0, 0, 1, -2) }, f)
		local txt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIX, Text = "", TextSize = 17, TextColor3 = C.texte2,
			Size = UDim2.new(1, -24, 1, 0), Position = UDim2.fromOffset(22, 0) }, f)
		local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.new(1, 0, 1, 10), Position = UDim2.fromOffset(0, -5), Text = "" }, f)
		U.pastilles[r.id] = { fond = f, trait = trait, txt = txt }
		b.Activated:Connect(function()
			Sons.jouer("tap")
			-- la pastille saute à la caisse équipée si elle est de la famille, sinon à la première
			local eq = profil().caisse
			local vers = (Catalogue[eq] and Catalogue[eq].rar == r.id) and eq or FAMILLES[r.id][1]
			if vers then Garage.sauter(vers) end
		end)
	end
	U.filtres = {}
	local lf = (W_CONSOLE - 28 - 8) / 3
	for k, q in { { "tout", L.tout, Color3.fromRGB(201, 189, 240) }, { "moi", L.aMoi, Color3.fromRGB(94, 227, 122) }, { "acheter", L.aAcheter, C.cyan } } do
		local f = inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(20, 16, 41), Size = UDim2.fromOffset(lf, 36),
			Position = UDim2.fromOffset(14 + (k - 1) * (lf + 4), 76), Visible = false }, cs)
		local trait = inst("UIStroke", { Color = C.trait, Thickness = 2, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, f)
		inst("Frame", { BorderSizePixel = 0, BackgroundColor3 = q[3], Size = UDim2.new(1, 0, 0, 2), Position = UDim2.new(0, 0, 1, -2) }, f)
		local txt = inst("TextLabel", { BackgroundTransparency = 1, FontFace = K.PIX, Text = q[2], TextSize = 15, TextColor3 = C.texte2, Size = UDim2.fromScale(1, 1) }, f)
		local b = inst("TextButton", { BackgroundTransparency = 1, Size = UDim2.new(1, 0, 1, 10), Position = UDim2.fromOffset(0, -5), Text = "" }, f)
		U.filtres[q[1]] = { fond = f, trait = trait, txt = txt, nom = q[2], c = q[3] }
		b.Activated:Connect(function()
			Sons.jouer("tap")
			filtre = q[1]
			majPastilles()
			majBande()
		end)
	end
	-- la bande de vignettes : deux rangées, on fait défiler
	U.bande = inst("ScrollingFrame", { BackgroundTransparency = 1, BorderSizePixel = 0, Size = UDim2.fromOffset(W_CONSOLE - 28, 132),
		Position = UDim2.fromOffset(14, 122), CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.X,
		ScrollingDirection = Enum.ScrollingDirection.X, ScrollBarThickness = 4, ScrollBarImageColor3 = C.terne,
		VerticalScrollBarInset = Enum.ScrollBarInset.None }, cs)
	inst("UIGridLayout", { CellSize = UDim2.fromOffset(106, 58), CellPadding = UDim2.fromOffset(6, 6), FillDirection = Enum.FillDirection.Vertical,
		FillDirectionMaxCells = 2, SortOrder = Enum.SortOrder.LayoutOrder }, U.bande)
	inst("UIPadding", { PaddingTop = UDim.new(0, 2), PaddingLeft = UDim.new(0, 2) }, U.bande)
	-- la barre d'action
	U.btHome = plaque(cs, "Home")
	U.btBoutique = plaque(cs, "Boutique")
	U.btDecision = plaque(cs, "Decision")
	U.btJouer = plaque(cs, "Jouer")
	U.btHome.b.Activated:Connect(function() if not Garage.lance then ctx.surHome() end end)
	U.btBoutique.b.Activated:Connect(function()
		if Garage.lance then return end
		if ctx.surBoutique then ctx.surBoutique() else Hud.toast(L.bientot) end
	end)
	U.btDecision.b.Activated:Connect(decider)
	U.btJouer.b.Activated:Connect(function() Garage.jouer() end)
	U.btReglages.Activated:Connect(function() if not Garage.lance then ctx.surReglages() end end)

	-- le fondu blanc chaud du lâcher (il survit à la fermeture du garage)
	U.fondu = inst("Frame", { Name = "FonduGarage", BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(255, 227, 184), BackgroundTransparency = 1,
		Size = UDim2.fromScale(1, 1), ZIndex = 70, Visible = false }, racine)
end

function Garage.majOnglets()
	for id, o in U.onglets do
		local actif = id == onglet
		o.grad.Color = actif and ColorSequence.new({ ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 114, 217)),
			ColorSequenceKeypoint.new(0.5, Color3.fromRGB(224, 36, 157)), ColorSequenceKeypoint.new(1, Color3.fromRGB(192, 21, 133)) })
			or ColorSequence.new(Color3.fromRGB(30, 25, 58), Color3.fromRGB(18, 14, 36))
		o.b.TextColor3 = actif and C.texte or C.terne
		K.teinter(o.ico, actif and C.texte or C.terne)
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
	majPastilles()
	for k in tuiles do majTuile(k) end
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
	for _, t in tuilesH do t.trait.Enabled = t.j == j end
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
			local u = math.min(1, b.t / 0.72)
			-- le déploiement dépasse un peu (≈ 12 %) puis se pose
			local c1 = 2.2
			local e = 1 + (c1 + 1) * (u - 1) ^ 3 + c1 * (u - 1) ^ 2
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

	-- ── la vue ──
	local vp = cam.ViewportSize
	local aspect = vp.X / math.max(1, vp.Y)
	local fov = 52
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
		fov = 52 + (4 + 10 * u) * k
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
	majCompte(true)
	Garage.sauter(indice or profil().caisse or 0, true)
	U.racine.Position = UDim2.fromOffset(0, 18)
	TweenService:Create(U.racine, K.LENTE, { Position = UDim2.fromOffset(0, 0) }):Play()
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
