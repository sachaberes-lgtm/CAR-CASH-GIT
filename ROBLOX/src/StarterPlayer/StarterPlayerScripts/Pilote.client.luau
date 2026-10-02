-- CASH CAR — LE PILOTE. Toute la partie tourne ICI, chez le joueur : la physique de la caisse, le vol,
-- les atterrissages, les figures, l'argent, le moteur, la caméra. Le serveur ne sait que la graine de la
-- route et le montant final (pour le classement).
--
-- Les formules sont celles du jeu web, ligne pour ligne (index.html, numéros en commentaire) :
--   vA = la vitesse « du jeu » ; le monde avance de vA·SPD·vitMult mètres par seconde ; km/h = vA·3,6·SPD·vitMult.
--   s  = la distance le long de la route (m), lat = l'écart latéral (m, droite +), psi = le cap de la
--        caisse par rapport à la route (rad, droite +), side = la face (+1 dessus, −1 dessous).
-- En vol : fallPos (m, monde), fallVel (unités vA), flyU = le « haut » du repère de vol.
-- Le SCORE (flow, frénésie, chaîne d'aura) vit dans Client/Score : ici on lui dit ce qui arrive.
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local joueur = Players.LocalPlayer
local CC = ReplicatedStorage:WaitForChild("CashCar")
local Config = require(CC:WaitForChild("Config"))
local Piste = require(CC:WaitForChild("Piste"))
local CL = CC:WaitForChild("Client")
local Construction = require(CL:WaitForChild("Construction"))
local Hud = require(CL:WaitForChild("Hud"))
local Sons = require(CL:WaitForChild("Sons"))
local Controles = require(CL:WaitForChild("Controles"))
local Mer = require(CL:WaitForChild("Mer"))
local Bus = require(CL:WaitForChild("Bus"))
local Garage = require(CL:WaitForChild("Garage"))
local Score = require(CL:WaitForChild("Score"))
local HudScore = require(CL:WaitForChild("HudScore"))
local Missions = require(CL:WaitForChild("Missions"))
-- (Luau refuse plus de 200 variables locales dans une fonction — le premier niveau du script en est une : la caméra et les
-- nuages vivent dans la table KA)
local KA: any = { Camera = require(CL:WaitForChild("Camera")), Nuages = require(CL:WaitForChild("Nuages")), Titre = require(CL:WaitForChild("Titre")),
	pos = Vector3.zero, vise = Vector3.zero, up = Vector3.yAxis, fov = 72, V = {}, refletK = 0, envoiT = 0 }
KA.Ville = require(CL:WaitForChild("Ville"))
KA.Espace = require(CL:WaitForChild("Espace"))
KA.Orage = require(CL:WaitForChild("Orage"))
KA.Debris = require(CL:WaitForChild("Debris"))

local M, SPD = Config.M, Config.SPD
local RH, THICK = Config.ROAD_HALF, Config.THICK
local GRAV, FALL_G = Config.GRAV, Config.FALL_G
local NI = Config.NITRO
local MOT = Config.MOTEURS
local O = Config.OBJETS
local E = Hud.E
local T = Hud.T
local FR = Hud.FR
local function tr(fr: string, en: string): string return FR and fr or en end

local cam = workspace.CurrentCamera
-- le jeu web n'a ni fenêtre de chat ni tableau des joueurs : ils recouvraient la nitro et la pause
do
	local StarterGui = game:GetService("StarterGui")
	for _, t in { Enum.CoreGuiType.PlayerList, Enum.CoreGuiType.Chat, Enum.CoreGuiType.Backpack, Enum.CoreGuiType.Health, Enum.CoreGuiType.EmotesMenu } do
		pcall(function() StarterGui:SetCoreGuiEnabled(t, false) end)
	end
end
Hud.creer()
HudScore.creer()
Score.langue(FR)
Score.fmtArgent = Hud.argent
Hud.ecran("charge")

-- ════════ la graine, la caisse ════════
local graine = CC:GetAttribute("Graine")
while not graine do
	CC:GetAttributeChangedSignal("Graine"):Wait()
	graine = CC:GetAttribute("Graine")
end
local evFin = CC:WaitForChild("FinPartie")
local evEtat = CC:WaitForChild("EtatCaisse")
local evRecord = CC:WaitForChild("Record")

local Caisse = require(CC:WaitForChild("Caisse"))
local evPos = CC:WaitForChild("PosCaisse")
local dossierCaisses = workspace:WaitForChild("Caisses")
-- La caisse du serveur n'est qu'une boîte aux lettres (sa position part vers les autres joueurs) : chez moi
-- elle est cachée, et je dessine la MIENNE, ancrée, collée à ma physique.
local function cacher(m: Instance)
	for _, d in m:GetDescendants() do
		if d:IsA("BasePart") then d.LocalTransparencyModifier = 1
		elseif d:IsA("ParticleEmitter") or d:IsA("Trail") or d:IsA("Light") then d.Enabled = false end
	end
end
local caisseServeur = dossierCaisses:WaitForChild(joueur.Name) :: Model
cacher(caisseServeur)
-- le PROFIL (compte, caisses, caisse équipée, réglages) : lu au serveur, tenu à jour par ProfilMaj
local fnProfil = CC:WaitForChild("Profil") :: RemoteFunction
local fnAction = CC:WaitForChild("Action") :: RemoteFunction
local profil = fnProfil:InvokeServer() or { compte = 0, record = 0, caisses = { 0 }, caisse = 0, reglages = {} }
if Config.CAISSE_TEST then profil.caisse = Config.CAISSE_TEST end
local caisse, poignees = Caisse.construire("MaCaisse", profil.caisse or 0, true, profil.porte)
caisse.Parent = workspace
local racine = caisse.PrimaryPart :: BasePart
local flammes, trainees, reflet = poignees.flammes, poignees.trainees, poignees.reflet
local visibleCaisse = true
-- changer de caisse (le garage) : on rebâtit la mienne, au même endroit
local function changerCaisse(indice: number)
	local ancienne = caisse
	local nouvelle, pg = Caisse.construire("MaCaisse", indice, true, profil.porte)
	-- ⚠ PivotTo, pas « racine.CFrame = » : hors du monde, bouger la racine ne déplace pas les pièces soudées
	-- (la soudure se recale à l'arrivée et la carrosserie reste plantée à l'origine : une caisse invisible)
	nouvelle:PivotTo((ancienne.PrimaryPart :: BasePart).CFrame)
	nouvelle.Parent = workspace
	caisse, poignees, racine = nouvelle, pg, nouvelle.PrimaryPart :: BasePart
	flammes, trainees, reflet = pg.flammes, pg.trainees, pg.reflet
	Caisse.rendre(ancienne) -- (et ses maillages : le budget de triangles de Roblox)
	visibleCaisse = true
end
local function montrerCaisse(oui: boolean)
	if visibleCaisse == oui then return end
	visibleCaisse = oui
	for _, p in caisse:GetDescendants() do
		if p:IsA("BasePart") then p.LocalTransparencyModifier = oui and 0 or 1 end
	end
	for _, f in flammes do f.Enabled = oui end
	for _, t in trainees do if not oui then t.Enabled = false end end
end

local record, compte, meilleurAura = 0, 0, 0
local function lireProfil(p: any)
	local essai = Config.CAISSE_TEST
	profil = p
	if essai then profil.caisse = essai end
	compte = p.compte or compte
	meilleurAura = math.max(meilleurAura, p.auraMeilleur or 0)
end
lireProfil(profil)
CC:WaitForChild("ProfilMaj").OnClientEvent:Connect(function(p)
	if type(p) ~= "table" then return end
	lireProfil(p)
	Garage.majProfil()
end)
evRecord.OnClientEvent:Connect(function(v, c)
	if type(v) == "number" then
		record = math.max(record, v)
		E.menuRecord.Text = record > 0 and (T.record .. " " .. Hud.argent(record)) or ""
	end
	if type(c) == "number" then
		compte = c
		if E.mort.Visible then E.mCompte.Text = T.compte .. " " .. Hud.argent(compte) end
	end
end)

-- ════════ les zones : la 1 est gardée toute la session, les suivantes se bâtissent en tâche de fond ════════
type Zone = { z: number, pret: boolean, piste: Piste.Piste?, dossier: Folder?, objets: { any }?, grille: { [number]: { any } }?,
	pads: { number }?, series: { [number]: number }?, prisSerie: { [number]: number }?, nuages: { any }?, ciel: Folder? }
local ZONES: { [number]: Zone } = {}
local CEL_OBJ = 25 * M
local function cleObj(v: Vector3): number
	return (math.floor(v.X / CEL_OBJ) + 4096) * 67108864 + (math.floor(v.Y / CEL_OBJ) + 4096) * 8192 + (math.floor(v.Z / CEL_OBJ) + 4096)
end

-- (la zone 0 est la piste DESSINÉE de l'auto-école)
local function preparer(z: number, depart: CFrame?): Zone
	if ZONES[z] then return ZONES[z] end
	local e: Zone = { z = z, pret = false }
	ZONES[z] = e
	task.spawn(function()
		local function ceder() task.wait() end
		local p = Piste.generer(graine, math.max(1, z), depart, ceder, z == 0)
		local d = Instance.new("Folder")
		d.Name = "Zone" .. z
		Construction.route(p, d, ceder)
		Construction.portail(p, d)
		local objs = Construction.objets(p, d, ceder)
		table.sort(objs, function(a, b) return a.o.s < b.o.s end)
		local grille = {}
		local pads, series = {}, {}
		for _, o in objs do
			local k = cleObj(o.pos)
			grille[k] = grille[k] or {}
			table.insert(grille[k], o)
			if o.o.kind == "pad" and o.o.face == 1 then table.insert(pads, o.o.s / M) end
			if o.o.kind == "piece" and o.o.grp and o.o.face == 1 then series[o.o.grp] = (series[o.o.grp] or 0) + 1 end
		end
		-- LES NUAGES v8 : le ciel de coton, les bancs de route, les coussins, les tours (la piste d'école n'a que le ciel de coton :
		-- sans lui, la toute première partie d'un joueur se jouait dans un ciel VIDE)
		local nuages = {}
		local ciel = Instance.new("Folder") -- (à part : au menu, les nuages du niveau sont cachés — le titre a les siens)
		ciel.Name = "Nuages"
		ciel.Parent = d
		if p.niveau == "nuages" then
			local okN, resN = pcall(KA.Nuages.batir, p, ciel, graine + z * 31, ceder, z == 0)
			if okN then nuages = resN else warn("[CashCar] nuages : " .. tostring(resN)) end
		elseif p.niveau == "ville" then
			-- LA VILLE : le canyon de tours, la forêt du village, les néons — et la grille de collision (en vol, une tour tue)
			local okV, resV = pcall(KA.Ville.batir, p, ciel, graine + z * 31, ceder)
			if okV then (e :: any).ville = resV else warn("[CashCar] ville : " .. tostring(resV)) end
		elseif p.niveau == "espace" then
			local okE, resE = pcall(KA.Espace.batir, p, ciel, graine + z * 31, ceder)
			if okE then (e :: any).sats = resE else warn("[CashCar] espace : " .. tostring(resE)) end -- (sats : les obstacles de la PLUIE DE SATELLITES)
		end
		e.ciel = ciel
		e.piste, e.dossier, e.objets, e.grille, e.pads, e.series, e.prisSerie, e.nuages = p, d, objs, grille, pads, series, {}, nuages
		e.pret = true
	end)
	return e
end
local function oublier(z: number)
	local e = ZONES[z]
	if not e or z <= 2 then return end -- la 1 et la 2 restent en réserve (on y revient à chaque partie)
	if e.dossier then e.dossier:Destroy() end
	ZONES[z] = nil
end
local function remettreObjets(e: Zone)
	-- les satellites de la route (PLUIE DE SATELLITES) redeviennent tous à esquiver
	if (e :: any).sats then
		for _, o in (e :: any).sats do o.fait, o.pres, o.min = false, false, 99 end
	end
	-- ce que LA LIGNE PARFAITE a posé pendant la partie d'avant s'en va (elle reposera sa file)
	if e.objets then
		local garde, change = {}, false
		for _, o in e.objets do
			if o.dyn then
				o.p:Destroy()
				change = true
			else
				table.insert(garde, o)
			end
		end
		if change then
			e.objets = garde
			local grille, pads = {}, {}
			for _, o in garde do
				local k = cleObj(o.pos)
				grille[k] = grille[k] or {}
				table.insert(grille[k], o)
				if o.o.kind == "pad" and o.o.face == 1 then table.insert(pads, o.o.s / M) end
			end
			e.grille, e.pads = grille, pads
		end
	end
	for _, o in e.objets or {} do
		o.pris = false
		o.hk = nil
		o.aimante = nil
		o.touche = nil
		o.frole = nil
		o.dm = nil
		o.p.CFrame = o.base
		o.p.Parent = e.dossier
	end
	if e.prisSerie then table.clear(e.prisSerie) end
	if e.nuages then KA.Nuages.remettre(e.nuages) end
end

-- ════════ l'état de la partie ════════
local mode = "charge" -- charge | menu | garage | drive | fall | boom | mort
local enPause = false
local zoneN = 1
local zone: Zone
local piste: Piste.Piste
local s, lat, side, vA, psi, yawR, steerS, momT = 0, 0, 1, 0, 0, 0, 0, 0
local sPrev, latPrev = 0, 0
local boost = 0
local nitroR, nitroX, nitroOn, nitroBleue = 2, 0, false, false
local coinsGot, tier, combo = 0, 0, 0
local argent, aura = Config.CASH_DEPART, 0
local pwN, pwA, pwV, pwM, pwX = 0, 0, 0, 0, 0
local graceT = 0
-- (Luau refuse plus de 200 variables locales à la fois : l'état de la conduite fine vit dans G, celui du vol dans V)
-- G : le drift, la fronde, le rase-bord, les flaques, les plots, le roulis, NITROOO, les pads, les compteurs de la partie
local G = {
	driftOn = false, driftC = 0, driftLv = 0, driftCd = 0, slipB = 0, slipT = 0, oilCd = 0,
	virT = 0, virC = 0, virD = false, virPaye = false, frondeCd = 0, raseT = 0, raseAnn = false, froleN = 0, froleT = 0,
	carRoll = 0, rollV = 0, levreY = 0, pureT = 0, pureArmed = true, pureNext = 0, pureLvl = 0, idleT = 0, idleMsg = 0,
	padCd = 0, padN = 0, padSL = nil :: number?, comboT = 0, safeS = 0,
	distAvant = 0, vmax = 0, serie = 0, nbZones = 0, tempsDepart = 0,
	fruitRaf = 0, fruitRafT = 0, coeurs = 3, ailes = 0, helice = 0,
	hopY = 0, hopV = 0, choc = 0, -- LA POSE SANS SAUT : la hauteur qui reste à la pose, sa vitesse, la secousse due au contact
	lgS = 240, lgK = 0, lgV = 0, lgAcc = 20, -- LA LIGNE PARFAITE : la prochaine abscisse, fruit (0) ou pad (1), la vitesse et l'accélération lissées
}
local NTR = { on = false, t = 0, pal = 0, boost = 0, k = 0, kc = 0, gT = 0 }
local NTR_BOOST, NTR_BOOST_MAX, NTR_T = 0.1, 1.6, 2
-- vol
local fallPos, fallVel, prevPos = Vector3.zero, Vector3.zero, Vector3.zero
local flyU, flyAv = Vector3.yAxis, Vector3.new(0, 0, -1)
-- V : le vol
local V = {
	fallT = 0, fallTR = 0, fallVH0 = -1, yawAcc = 0, demiTours = 0, sDecol = 0,
	bascOn = false, bascDir = 1, airRoll = 0, nAirTenu = false, kickT = 0, sideCd = 0, bounceN = 0,
	bascT = 0, -- LA BASCULE BORNÉE (web, 1/10 13 h 35) : le temps VÉCU depuis la sortie par le bord (fallT, lui, est rendu par les bumps)
	fallUnder = false, fallStartSide = 1, flowS0 = 0, flowP0 = Vector3.zero,
	curNear = false, curH = 0, curLat = 0, curT = 0,
	chainVal = 0, chainMult = 1, chainN = 0, bigA = false, monstre = false, nitroAirT = 0, nitroAirTenue = 0,
	volT = 0, nitT = 0, -- la durée du vol et le temps passé réacteur allumé : la pose ne rend que la part volée nitro coupée
}
local vus: { [string]: number } = {}
local boomT, boomPos, causeMort = 0, Vector3.zero, "autre"
local secousse, fovPunch = 0, 0
local intro = false                          -- la CHUTE du départ : la caisse tombe du ciel sur la route
local stats = { pieces = 0, poses = 0, parfaites = 0, fruits = 0, nitro = 0, duree = 0, chaine = 0, figures = 0 }
local CPT: any = {} -- les compteurs de la partie, tels que les missions les lisent (voir Carnets.valeur)
-- L'AUTO-ÉCOLE (TUTO, L22181) : cinq étapes sur la piste dessinée ; on ne peut pas y mourir ; au bout, le PERMIS (+500 $)
local TU: any = { on = false, etape = 0, pause = 0, g = false, d = false, nitroT = 0, volT = 0, solT = 0, t = 0, rates = 0, horsT = 0, msg = nil, msgT = 0, vraiment = 0 }
local astucesVues = {}
local eclats: { { p: BasePart, v: Vector3, r: Vector3, t: number } } = {}
local carCF = CFrame.identity
local menuRot = CFrame.identity -- la pose de la caisse au menu (la CHUTE), gardée pendant le plongeon du départ

local function pousseMoteur(): number return MOT[tier + 1][2] end
local function tardif(): number return 1 + math.min(0.5, math.max(0, tier - 8) * 0.035) end
local function reservoir(): number return MOT[tier + 1].res or 2 end
local function denom(): number return Config.DENOMS[tier + 1] * 0.25 end
local function vmaxShow(): number return 190 * SPD * tardif() * pousseMoteur() end
local function vitMult(): number return math.min(1 + NTR_BOOST_MAX, (pwV > 0 and 2 or 1) * (1 + NTR.boost)) end
local function kmh(): number return math.abs(vA) * 3.6 * SPD * vitMult() end
local FAC = Config.FACILE
local function facile(): boolean return Config.FACILE_ACTIF and profil.reglages ~= nil and profil.reglages.facile == true end
-- LA GRAVITÉ DE L'ORBITE (gK, L28086) : en ESPACE tout ce qui tombe tombe deux fois moins vite, et la jauge d'airtime s'allonge
function G.gK(): number return (piste and (piste :: any).niveau == "espace") and Config.ORB_G or 1 end
local function airMax(): number return Config.AIR_MAX * ((G.gK() < 1) and Config.ORB_AIR or 1) * (facile() and FAC.air or 1) end
function G.nomNiveau(): string
	local n = Config.niveau((piste and (piste :: any).zone) or 1)
	if piste and ((piste :: any).niveau ~= n.id or (piste :: any).variante ~= n.var) then n = Config.NIVEAUX[1] end -- (l'auto-école)
	return tr(n.nom, n.en)
end
local function horiz(v: Vector3): number return math.sqrt(v.X * v.X + v.Z * v.Z) end
-- la vitesse ÷ la croisière (flowVitN, L21005) : en vol, la vitesse HORIZONTALE seule
local function vitN(): number
	local vm = vmaxShow() * 2.9
	if vm <= 0 then return 1 end
	local v = (mode == "fall") and horiz(fallVel) or math.abs(vA)
	return v * 3.6 * SPD / vm
end

local function repere(sM: number, face: number): CFrame
	return Piste.repereFace(piste, sM * M, face)
end
local function nitroGain(q: number) nitroR = math.min(reservoir(), nitroR + q) end

-- ════════ ce que le score fait dire ════════
local SON_DE = { ["fig.maillon"] = "maillon", ["aura.geste"] = "maillon", ["aura.encaisse1"] = "encaisse", ["aura.encaisse2"] = "encaisse",
	["aura.encaisse3"] = "encaisse", ["aura.record"] = "record", ["frenesie"] = "record", ["flow.palier"] = "nitroPlein", ["frenesie.record"] = "record",
	["flow.tic"] = "bip", ["frenesie.arme"] = "bip", ["plus.vite"] = "bip" }
Score.dire.pop = function(txt: string, c: string?, prio: number?) Hud.pop(txt, HudScore.hex(c), (prio and prio >= 2) and 24 or 20) end
Score.dire.slam = HudScore.slam
Score.dire.hap = function(f: number?) Hud.vibre(f or 10) end
Score.dire.flash = HudScore.flash
Score.dire.tag = HudScore.tag
Score.dire.verse = HudScore.verse
Score.dire.fren = HudScore.fren
Score.dire.fov = function(d: number) fovPunch = math.max(fovPunch, d) end
Score.dire.son = function(nom: string, demiTons: number?)
	local n = SON_DE[nom]
	if n then Sons.jouer(n, demiTons and Sons.demiTons(demiTons) or nil) end
end

-- ════════ l'argent, le moteur ════════
-- le GUICHET : toute recette de course passe ici, multipliée par le palier de FLOW (×1 · ×1,3 · ×1,5 · ×1,8 · ×3 en frénésie)
local function encaisser(x: number, source: string): number
	local g = x * Score.flowMult()
	argent += g
	Score.frenCash(g)
	Bus.emit("argent", g, source)
	return g
end
local function ajouterPieces(n: number)
	coinsGot += n
	local avant = tier
	while tier < #MOT - 1 and coinsGot >= MOT[tier + 2][1] do tier += 1 end
	if tier > avant then
		-- LE PASSAGE DE PALIER (L22576) : le nom du moteur, le rugissement, « +N KM/H »
		local gain = math.floor(190 * SPD * (tardif() * pousseMoteur() - (1 + math.min(0.5, math.max(0, avant - 8) * 0.035)) * MOT[avant + 1][2]) * 2.9 + 0.5)
		if G.carteMoteur then
			-- LA CARTE MOTEUR (Client/MoteurCarte) : le moteur en 3D au-dessus de la caisse, qui plonge dans le capot — c'est elle
			-- qui donne la poussée, le coup de caméra et le « +N KM/H », à l'instant de l'impact
			secousse = math.max(secousse, 0.15)
			Bus.emit("moteur", tier, gain)
		else
			HudScore.slam(Hud.sansAccent(MOT[tier + 1].nom), tr("NOUVEAU MOTEUR", "NEW ENGINE"), "#ffd75e", "#dfeeff", 26, 1)
			Sons.jouer("nitroPlein", 1.1)
			boost = math.max(boost, 0.8)
			fovPunch = math.max(fovPunch, 11)
			secousse = math.max(secousse, 0.4)
			task.delay(0.9, function()
				if mode == "drive" or mode == "fall" then Hud.pop("+" .. gain .. " KM/H", Color3.fromRGB(125, 255, 154), 22) end
			end)
			Bus.emit("atelier", tier)
		end
	end
end

-- ════════ les FIGURES en vol (addTrick, L29397) ════════
-- id = la famille ; val = sa valeur de chaîne ; rang 1-3 (ce qu'elle rend au flow) ; brut = pas de décote ; libre = ne compte pas dans la valeur
local AURA_FIG = { vrille = 45, meteo = 100, airnitro = 120, bump = 30 }
local function figure(id: string, txt: string, val: number, rang: number, brut: boolean?, libre: boolean?)
	local n = (vus[id] or 0) + 1
	vus[id] = n
	if not libre then
		V.chainVal += brut and val or val * 0.6 ^ (n - 1)
		V.chainMult += (n == 1) and 0.5 or 0.15
	end
	V.chainN += 1
	stats.figures += 1
	stats.chaine = math.max(stats.chaine, V.chainN)
	if id ~= "dauphin" then -- (le dauphin entre dans la chaîne d'aura à la POSE)
		Score.geste(txt, AURA_FIG[id] or 40, id, id == "vrille" or id == "bump")
	else
		Hud.pop(txt, Color3.fromRGB(125, 255, 236), 22)
	end
	if mode == "fall" and not libre then
		if id == "vrille" then Score.flowAdd(4, "risque", "n")
		else Score.flowAdd(((rang >= 3) and 12 or (rang == 2 and 9 or 6)) * 0.6 ^ (n - 1), "risque", "n") end
	end
	Bus.emit("figure", id, val, n)
end

-- ════════ la nitro : deux réservoirs (L36327) — l'orange se recharge seul, le BLEU ne vient que des fruits ════════
local function gererNitro(dt: number)
	local res = reservoir()
	nitroR = math.min(res, nitroR + NI.regen * dt)
	-- LE BOOST DE DÉPART (startBoostT du web, L28463) : 3 s de nitro OFFERTE quand la caisse touche la route — elle tient la
	-- touche à la place du joueur, ne coûte rien, et brille en arc-en-ciel (voir habiller). Pas à l'auto-école.
	local offert = (G.departT or 0) > 0
	if offert then G.departT = math.max(0, G.departT - dt) end
	if pwN > 0 or offert then nitroR = res end
	local avant = nitroOn
	-- LA LOI DU RÉSERVOIR : il tient tant que la jauge PAIE l'image, et se rallume à 0,3
	local prise = (pwN > 0 or offert) and 0 or Score.nitroConsoDe(dt, Score.F2.frenNitro, Score.frenesie(), NTR.on, mode == "fall")
	nitroOn = (Controles.nitro or offert) and Score.nitroTientDe(nitroR + nitroX, prise, nitroOn)
	if nitroOn and pwN <= 0 and not offert then
		if nitroR >= prise then
			nitroR -= prise
		else
			prise -= nitroR
			nitroR = 0
			nitroX = math.max(0, nitroX - prise) -- l'orange d'abord, puis le bleu
		end
	end
	nitroBleue = nitroOn and nitroR <= 0.01
	if nitroOn and not offert then stats.nitro += dt end
	if avant ~= nitroOn then
		evEtat:FireServer("nitro", nitroOn)
		Bus.emit("nitro", nitroOn, nitroBleue)
	end
end

-- ════════ NITROOO (L29695) : la nitro TENUE capitalise la vitesse (+10 % par seconde, plafond ×2,6) ════════
local function nitroooPart()
	if NTR.on then
		NTR.kc = 1
		return
	end
	NTR.on, NTR.t, NTR.kc, NTR.pal = true, 0, 1, 0
	HudScore.flash("#ff781e", 0.6)
	fovPunch = math.max(fovPunch, 9)
	secousse = math.max(secousse, 0.35)
end
local function nitroooTick(dt: number)
	local actif = NTR.on and nitroOn and (mode == "drive" or mode == "fall")
	if NTR.on and not actif then NTR.on = false end
	if actif then
		NTR.t += dt
		-- la TENUE (0 → 1 en 10 s) : la tête du dragon grossit, devient opaque, s'embrase (Client/Dragon)
		local u = math.clamp(NTR.t / 10, 0, 1)
		NTR.gT = u * u * (3 - 2 * u)
		local pal = math.floor(NTR.t) -- UN PALIER par seconde tenue
		if pal > NTR.pal and NTR.boost < NTR_BOOST_MAX - 0.001 then
			NTR.pal = pal
			NTR.kc = 1
			local pct = math.floor(math.min(NTR_BOOST_MAX, (1 + NTR_BOOST) ^ pal - 1) * 100 + 0.5)
			Hud.pop("+" .. pct .. " %", Color3.fromRGB(255, 176, 64), 20)
			fovPunch = math.max(fovPunch, 4)
			Sons.jouer("pad", Sons.demiTons(math.min(12, pal * 2)), 0.3)
		end
		NTR.boost = math.min(NTR_BOOST_MAX, math.max(NTR.boost, (1 + NTR_BOOST) ^ NTR.t - 1))
	else
		NTR.boost = math.max(0, NTR.boost - dt * 1.4) -- au lâcher : retombe en ~1 s
	end
	-- (web) plus on booste longtemps, plus elle brûle : 0,6 → 1 avec la tenue, et le coup de chaud d'un palier (~0,6 s)
	local cible = actif and math.max((NTR.kc > 0) and 1 or 0, 0.6 + 0.4 * NTR.gT) or 0
	NTR.kc = math.max(0, NTR.kc - dt * 1.6)
	NTR.k += (cible - NTR.k) * math.min(1, dt * (cible > NTR.k and 9 or 3.2))
	if actif then secousse = math.max(secousse, 0.08 * NTR.k) end
end

-- ════════ décoller (startFall, L30229) ════════
local function astuce(i: number)
	if astucesVues[i] or TU.on then return end
	astucesVues[i] = true
	Hud.astuce((Hud.tactile and T.astucesTactile or T.astuces)[i], 6)
end
-- impU = l'élan vers le haut ; impF = le coup d'accélérateur ; bord = on sort par le BORD (la bascule : ni saut ni élan)
local function decoller(impU: number, impF: number, bord: boolean?)
	local cf = repere(s, side)
	local T_, B, N = cf.LookVector, cf.RightVector, cf.UpVector
	local roulis = G.carRoll
	local vm = vitMult()
	local vL = vA * math.sin(psi - G.slipB)
	fallPos = (cf.Position + B * (lat * M)) / M + N * (bord and 0 or 0.6)
	fallVel = T_ * (vA * math.cos(psi - G.slipB) * impF * vm) + B * (vL * vm) + N * impU -- l'éjection = l'avance RÉELLE
	if fallVel.Y > 70 then fallVel = Vector3.new(fallVel.X, 70, fallVel.Z) end
	prevPos = fallPos
	flyAv = (fallVel.Magnitude > 1) and fallVel.Unit or T_
	flyU = N - flyAv * N:Dot(flyAv)
	flyU = (flyU.Magnitude > 1e-3) and flyU.Unit or N
	if not intro then task.delay(0.6, function() if mode == "fall" then astuce(2) end end) end
	V.fallT, V.fallTR, V.yawAcc, V.demiTours, V.nitroAirT, V.nitroAirTenue, V.sideCd, V.bounceN = 0, 0, 0, 0, 0, 0, 0, 0
	V.fallVH0 = -1 -- le plafond horizontal se relève à la 1re image de vol
	V.volT, V.nitT = 0, 0
	G.driftOn, G.driftC, G.driftLv, yawR, G.slipB, G.carRoll, G.rollV, G.levreY = false, 0, 0, 0, 0, 0, 0, 0
	G.virT, G.virC, G.virD, G.virPaye = 0, 0, false, false -- un virage quitté par le bord ne paie pas la fronde
	G.froleN, G.froleT = 0, 0
	V.chainVal, V.chainMult, V.chainN, V.bigA, V.monstre = 0, 1, 0, false, false
	table.clear(vus)
	V.sDecol = s
	V.nAirTenu = nitroOn -- nitro TENUE depuis le sol : pas de coup d'allumage
	V.fallUnder, V.fallStartSide = false, side
	V.flowS0, V.flowP0 = s, fallPos
	V.bascOn = bord == true
	V.bascT = 0
	V.bascDir = bord and -((lat ~= 0) and math.sign(lat) or 1) or 1 -- la vrille tourne du côté du VIDE
	V.airRoll = bord and roulis or 0
	Score.dolDecolle()
	mode = "fall"
	Score.ETAT.mode = "fall"
	Sons.jouer("decollage", nil, bord and 0.25 or nil)
	Bus.emit("decollage", intro)
end

-- ════════ exploser ════════
-- on REPART (respawn, L29589) : replacée sur sa ligne sûre, dessus, 26 de vitesse, 2,2 s de grâce, la nitro à moitié au moins
local function replacer()
	Score.SFA.n = 0
	Score.dolFin()
	V.chainN, V.chainVal, V.chainMult = 0, 0, 1
	s = math.clamp(G.safeS - 8, 0, piste.len / M - 80)
	lat, psi, yawR, side, vA = 0, 0, 0, 1, 26
	G.slipB, G.carRoll, G.rollV, G.levreY = 0, 0, 0, 0
	mode = "drive"
	Score.ETAT.mode = "drive"
	V.bascOn = false
	graceT = math.max(graceT, 2.2)
	nitroR = math.max(nitroR, 0.5 * reservoir())
	carCF = repere(s, 1)
	secousse = math.max(secousse, 0.5)
	E.air.Visible = false
end
-- LES TROIS VIES du mode FACILE (facileSauve, L23506) : le vide et le chrono d'air pardonnent deux fois
local function facileSauve(cause: string): boolean
	if not facile() or G.coeurs <= 1 or (cause ~= "vide" and cause ~= "air") then return false end
	G.coeurs -= 1
	replacer()
	HudScore.slam((G.coeurs > 1) and string.format(T.vies, G.coeurs) or T.derniereVie, T.onRepart, "#ff5e7a", "#ffd75e", 40, 3)
	Sons.jouer("poseLourde")
	return true
end

-- ════════ L'AUTO-ÉCOLE ════════
local TU_ETAPES = FR and {
	{ "TOURNE", "Braque à gauche… puis à droite." }, { "NITRO", "Maintiens NITRO : ça pousse fort." },
	{ "DECOLLE", "Fonce hors de la route, par le bord. N'aie pas peur." },
	{ "VOLE A LA NITRO", "En l'air, MAINTIENS NITRO et reviens au-dessus de la route." },
	{ "POSE-TOI", "Reviens au-dessus de la route et pose-toi dessus (en douceur = parfait)." },
} or {
	{ "STEER", "Steer left… then right." }, { "NITRO", "Hold NITRO: it pushes hard." },
	{ "TAKE OFF", "Drive off the road, over the edge. Don't be scared." },
	{ "FLY ON NITRO", "In the air, HOLD NITRO and steer back over the road." },
	{ "LAND IT", "Get back over the road and land on it (softly = perfect)." },
}
function TU.carte()
	local e = math.clamp(TU.etape, 1, 5)
	E.coach.Visible = TU.on
	if not TU.on then return end
	E.coachTete.Text = TU.msg or (tr("AUTO-ECOLE", "DRIVING SCHOOL") .. " · " .. e .. "/5")
	E.coachTete.TextColor3 = TU.msg and Hud.C.rouge or Hud.C.terne
	E.coachTitre.Text = TU_ETAPES[e][1]
	E.coachTxt.Text = TU_ETAPES[e][2]
	for i = 1, 5 do
		E.coachPips[i].BackgroundColor3 = (i < e) and Color3.fromRGB(98, 224, 98) or ((i == e) and Hud.C.or_ or Hud.C.trait)
	end
	E.btPasser.Text = (os.clock() < TU.vraiment) and tr("VRAIMENT ?", "SURE?") or tr("PASSER", "SKIP")
	E.btPasser.TextColor3 = (os.clock() < TU.vraiment) and Hud.C.rouge or Hud.C.texte2
end
function TU.dire(txt: string)
	TU.msg, TU.msgT = txt, 2.6
end
function TU.vers(e: number)
	TU.etape = e
	TU.g, TU.d, TU.nitroT, TU.volT, TU.solT, TU.t, TU.horsT = false, false, 0, 0, 0, 0, 0
end
-- la leçon se termine : passe = on l'a SAUTÉE (pas de permis)
function TU.fin(passe: boolean)
	TU.on = false
	E.coach.Visible = false
	if pwA > 0 then -- l'airtime prêté est repris : en vol, la jauge repart neuve
		pwA = 0
		V.fallT, V.fallTR = 0, 0
	end
	profil.reglages = profil.reglages or {}
	profil.reglages.tuto = true
	task.spawn(function() pcall(function() fnAction:InvokeServer("reglage", "tuto", true) end) end)
	if passe then return end
	local premier = not profil.permis
	if premier then
		profil.permis = true
		task.spawn(function() pcall(function() fnAction:InvokeServer("permis") end) end)
	end
	HudScore.slam(tr("PERMIS OBTENU !", "LICENSE EARNED!"), premier and "+$500" or nil, "#62e062", "#ffd75e", 40, 3)
	Sons.jouer("record")
	if premier then
		task.delay(1.8, function()
			Hud.astuce(facile() and tr("Fini l'entraînement : tu as 3 VIES. En l'air, pose-toi avant la fin du chrono.", "Training's over: you have 3 LIVES. In the air, land before the timer runs out.")
				or tr("Fini l'entraînement : UNE SEULE VIE. En l'air, pose-toi avant la fin du chrono.", "Training's over: ONE LIFE. In the air, land before the timer runs out."), 3.4)
		end)
	end
end
function TU.bravo()
	Sons.jouer("poseParfait", 1.2)
	TU.pause = 0.75
	if TU.etape >= 5 then
		TU.etape = 6
	else
		TU.vers(TU.etape + 1)
	end
end
-- on ne MEURT pas à l'école : la caisse est replacée, et la leçon reprend au décollage
function TU.rate(): boolean
	if not TU.on then return false end
	replacer()
	nitroR = reservoir()
	TU.dire(tr("RATE ! ON RECOMMENCE", "MISSED! TRY AGAIN"))
	if TU.etape >= 4 then TU.vers(3) end
	HudScore.flash("#ffffff", 0.5)
	return true
end
function TU.tick(dt: number)
	if TU.msgT > 0 then
		TU.msgT -= dt
		if TU.msgT <= 0 then TU.msg = nil end
	end
	if TU.pause > 0 then
		TU.pause -= dt
		if TU.pause <= 0 and TU.etape >= 6 then TU.fin(false) end
		TU.carte()
		return
	end
	local e = TU.etape
	local vol = mode == "fall"
	if e == 1 then
		if steerS < -0.25 then TU.g = true end
		if steerS > 0.25 then TU.d = true end
		if TU.g and TU.d then TU.bravo() end
	elseif e == 2 then
		nitroR = reservoir() -- le plein est offert
		if nitroOn then TU.nitroT += dt end
		if TU.nitroT > 1.1 then TU.bravo() end
	elseif e == 3 then
		if vol then
			pwA = math.max(pwA, 9) -- l'airtime infini est PRÊTÉ
			TU.bravo()
		end
	elseif e == 4 then
		nitroR = reservoir()
		if vol then
			TU.solT = 0
			if nitroOn then TU.volT += dt end
			if TU.volT > 0.9 then TU.bravo() end
		else
			TU.solT += dt
			if TU.solT > 1 then
				TU.vers(3)
				TU.dire(tr("ENCORE ! NITRO EN L'AIR", "AGAIN! NITRO IN THE AIR"))
			end
		end
	elseif e == 5 then
		if not vol then
			TU.bravo()
		else
			pwA = math.max(pwA, 2)
			TU.t += dt
			if TU.t > 9 then
				replacer()
				TU.rates += 1
				if TU.rates >= 2 then
					TU.bravo() -- deux échecs : le permis est accordé quand même
				else
					TU.vers(3)
					TU.dire(tr("RATE ! NITRO, VISE LE DESSUS", "MISSED! NITRO, AIM ABOVE IT"))
				end
			end
		end
	end
	-- étapes 1 et 2 : sortir de la route replace aussitôt
	if e <= 2 and vol then
		TU.horsT += dt
		if TU.horsT > 0.5 then
			replacer()
			nitroR = reservoir()
			TU.dire(tr("SORTI ! SUIS LA ROUTE", "OFF THE ROAD! FOLLOW IT"))
			TU.horsT = 0
		end
	else
		TU.horsT = 0
	end
	TU.carte()
end

local function exploser(cause: string)
	if mode == "boom" or mode == "mort" then return end
	if TU.rate() or facileSauve(cause) then return end
	causeMort = cause
	boomPos = carCF.Position
	Score.mort() -- la chaîne OUVERTE part avec la caisse, le flow retombe
	Bus.emit("mort", cause, mode == "fall", V.chainVal)
	mode = "boom"
	Score.ETAT.mode = "boom"
	boomT = 0
	nitroOn = false
	NTR.on, NTR.boost = false, 0
	-- les éclats de carrosserie (pièces locales, rendues au bout de 2,5 s) — le feu, les ondes, les billets : Client/Effets
	for _, e in eclats do e.p:Destroy() end
	table.clear(eclats)
	local rnd = Random.new()
	local tons = { Color3.fromRGB(255, 60, 50) }
	for _ = 1, 12 do
		local feu = false
		local p = Instance.new("Part")
		p.Anchored = true
		p.CanCollide = false
		p.CanQuery = false
		p.CanTouch = false
		p.CastShadow = false
		p.Material = feu and Enum.Material.Neon or Enum.Material.SmoothPlastic
		p.Color = feu and tons[rnd:NextInteger(1, #tons)] or poignees.laque
		local t = (feu and rnd:NextNumber(1.2, 2.6) or rnd:NextNumber(0.6, 1.4)) * M
		p.Size = feu and Vector3.new(t, t, t) or Vector3.new(t * 1.6, t * 0.25, t)
		p.CFrame = CFrame.new(boomPos + Vector3.new(rnd:NextNumber(-1, 1), rnd:NextNumber(-0.5, 1), rnd:NextNumber(-1, 1)) * M)
		p.Parent = workspace
		local dir = Vector3.new(rnd:NextNumber(-1, 1), rnd:NextNumber(-0.2, 1), rnd:NextNumber(-1, 1)).Unit
		table.insert(eclats, { p = p, v = dir * (feu and rnd:NextNumber(3, 9) or rnd:NextNumber(14, 30)) * M,
			r = Vector3.new(rnd:NextNumber(-6, 6), rnd:NextNumber(-6, 6), rnd:NextNumber(-6, 6)), t = feu and 1 or 0 })
	end
	Sons.jouer("explosion")
	montrerCaisse(false)
	evEtat:FireServer("course", false)
	E.air.Visible = false
end

-- ════════ atterrir (tryLand, L30413-30570) ════════
local voisins: { number } = {}
-- hR = la hauteur qui reste au-dessus de la face où l'on se pose (m ; négative : posée sous le niveau, par la lèvre)
local function atterrir(face: number, latX: number, sX: number, hR: number?)
	side = face
	s = sX
	G.hopY, G.hopV, G.choc = 0, 0, 0
	if intro then
		-- la CHUTE du départ se pose : la course commence (ni note, ni perte de vitesse)
		intro = false
		lat = (face > 0) and latX or -latX
		vA, psi, yawR, G.slipB = 40, 0, 0, 0
		G.departT = (TU.on or workspace:GetAttribute("DbgAuto") == true) and 0 or 3 -- (le pilote automatique du banc ne sait pas tenir un virage à pleine nitro : pas de boost offert pour lui, sauf DbgAuto = "boost")
		mode = "drive"
		Score.ETAT.mode = "drive"
		graceT = 0.3
		V.fallT, V.fallTR = 0, 0
		E.air.Visible = false
		Hud.grand(G.nomNiveau(), Hud.C.texte, 1.8)
		Sons.jouer("go")
		Sons.jouer("poseChoc")
		secousse = 0.6
		task.delay(1.2, function() astuce(1) end)
		task.delay(16, function() astuce(3) end)
		return
	end
	local cf = repere(s, side)
	local T_, B, N = cf.LookVector, cf.RightVector, cf.UpVector
	local vm = vitMult()
	local vT, vB, vN = fallVel:Dot(T_), fallVel:Dot(B), fallVel:Dot(N)
	lat = (face > 0) and latX or -latX
	-- la vitesse de vol redevient une vitesse de route (÷ vitMult : elle était partie multipliée)
	local vTan, vLat = vT / vm, vB * 0.4 / vm
	vA = vTan
	psi = math.clamp(math.atan2(vLat, math.abs(vTan) + 1), -1.4, 1.4)
	yawR, G.slipB = 0, 0
	local perte = math.min(0.52, math.max(0, V.fallT * G.gK() - 0.8) * 0.15 + math.abs(vN) * 0.008) -- (× gK : en orbite un même saut dure deux fois plus)
	vA *= 1 - perte
	local impact = math.abs(vN)
	-- la pose RATÉE : la trajectoire arrive à plus de 55° de l'axe de la route
	local angle = math.deg(math.atan2(math.abs(vB), vT))
	local ratee = math.sqrt(vT * vT + vB * vB) > 4 and angle > 55 + (facile() and 30 or 0)
	lat = math.clamp(lat, -(RH - 0.02), RH - 0.02)
	-- SNAKE LOOP : passé SOUS la route, reposé sur la face de départ
	local serpent = V.fallUnder and face == V.fallStartSide
	if serpent then
		V.chainVal += 14
		V.chainMult += 0.5
		Score.flowAdd(15, "risque", "m")
		Score.geste("SNAKE LOOP", 320, "snake")
	end
	if math.abs(lat) < 0.3 * RH then
		V.chainVal += 4
		V.chainMult += 0.2
	end
	local g = (ratee and 0.65) or ((impact < 4.5 and perte < 0.2) and 1.5) or ((impact >= 10) and 0.65) or 1
	G.serie += 1
	local cachee = face < 0
	local lv = Score.niveau()
	local qG = V.chainVal * math.min(6, V.chainMult) * g * (cachee and 2 or 1) * (1 + lv * 0.5) * ((G.serie >= 2) and (1 + math.min(1, G.serie * 0.1)) or 1)
	local paye = V.chainVal > 0 and qG * Config.DENOMS[tier + 1] >= 0.5 -- « cette pose porte une figure »
	if paye then
		Score.flowAdd((g >= 1.5) and 10 or 4, (g >= 1.5) and "risque" or "style", cachee and "m" or "n")
		nitroGain(Score.nitroFigDe(V.chainMult, g, V.volT, V.nitT)) -- (au prorata du vol fait nitro coupée)
		stats.poses += 1
		ajouterPieces(math.clamp(math.floor(2 + qG / 6 + 0.5), 2, 18))
		boost = math.max(boost, 0.5)
		if g >= 1.5 then Score.geste(tr("POSE PARFAITE", "PERFECT LANDING"), 70, "pose") end
	end
	nitroGain(Score.nitroPoseDe(reservoir(), V.volT, V.nitT)) -- la pose rend 20 % de la jauge pour un VRAI vol (1,2 s), nitro coupée
	if g >= 1.5 and not ratee and (V.fallT > 0.7 or paye) then stats.parfaites += 1 end
	-- ARRACHÉE / AU CHEVEU : posé juste avant la fin du chrono
	local reste = airMax() - V.fallTR
	if pwA <= 0 and reste <= 0.10 then
		Score.geste(tr("AU CHEVEU", "BY A HAIR"), 220, "cheveu")
		Score.flowAdd(20, "risque", "n")
	elseif pwA <= 0 and reste <= 0.30 then
		Score.geste(tr("ARRACHEE", "CLUTCH"), 120, "cheveu")
		Score.flowAdd(12, "risque", "n")
	end
	-- LE RACCOURCI : la piste gagnée − la distance volée en ligne droite
	local gagne = (s - V.flowS0) - (V.flowP0 - fallPos).Magnitude
	local raccourci = false
	if gagne >= 60 then
		raccourci = true
		Score.flowAdd(math.min(45, 12 + gagne * 0.06), "risque", "m")
		Hud.pop(tr("RACCOURCI +", "SHORTCUT +") .. math.floor(gagne + 0.5) .. " M", Color3.fromRGB(125, 255, 236), 22)
		nitroGain(0.3)
		Score.gesteMuet(tr("RACCOURCI", "SHORTCUT"), math.floor(math.min(250, 60 + gagne * 0.2) + 0.5), "coupe")
	elseif gagne >= 25 then
		Score.frenTrait("m", gagne / 60) -- une petite coupe nourrit MACHIAVEL
	end
	-- le dauphin verse ce qu'il a nagé
	Score.dolPose()
	-- les fautes, la série de poses propres
	if ratee then
		Sons.jouer("poseLourde")
	elseif impact >= 10 then
		Score.flowFaute("n", 6, 0.5)
		Hud.pop(tr("POSE LOURD", "HEAVY LANDING"), Hud.C.rouge, 20)
		Sons.jouer("poseLourde")
	elseif g >= 1.5 then
		Sons.jouer("poseParfait")
	else
		Sons.jouer("poseChoc")
	end
	nitroGain(Score.poseJugee(not ratee and impact < 10, V.fallT > 0.7))
	-- LA FRÉNÉSIE : armée, elle part sur une figure POSÉE (ou un grand vol)
	if not ratee and Score.frenPeut() and (V.chainN > 0 or V.bigA or (raccourci and Score.F2.decl.racc)) then Score.frenDeclenche() end
	if ratee then
		Score.flowCasse(angle)
		secousse = math.max(secousse, 0.6)
	end
	-- LA POSE SANS SAUT (web, 2026-10-01) : la pose est déclarée jusqu'à 3 m au-dessus de la dalle ; la caisse FINIT sa descente
	-- (un petit saut de conduite) au lieu de tomber de 2,5 m en une image, et le choc part AU CONTACT
	local reste9 = hR or 0
	if reste9 > 0.25 then
		G.hopY = reste9
		G.hopV = ((face > 0) and vN or -vN) * SPD
		G.choc = math.min(0.6, impact * 0.04)
	else
		if face > 0 and reste9 < 0 then G.levreY = math.max(-0.6, reste9) end -- posée sous le niveau : elle remonte sa marche
		secousse = math.max(secousse, math.min(0.6, impact * 0.04))
	end
	Bus.emit("pose", { g = g, impact = impact, face = face, chainVal = V.chainVal, chainMult = V.chainMult, raccourci = gagne, figures = V.chainN, fallT = V.fallT, reste = reste,
		q = qG, paye = paye, serpent = serpent, ratee = ratee,
		-- le MÉTÉORE (L29912) : la nitro tenue jusqu'au contact, en piqué à plus de 45°
		meteore = nitroOn and fallVel:Dot(fallVel) > 36 and 2 * vN * vN > fallVel:Dot(fallVel) })
	mode = "drive"
	Score.ETAT.mode = "drive"
	graceT = 0.15
	V.bascOn = false
	E.air.Visible = false
end

-- la LÈVRE raccroche (levreRattrape, L30613) : la caisse qui bascule revient d'elle-même sur la route, −6 %
local function levreRattrape(j: number, latOff: number, hOff: number, tOff: number)
	local F = piste.F[j]
	local vm = vitMult()
	local vTan = fallVel:Dot(F.LookVector) / vm
	local vLat = fallVel:Dot(F.RightVector) / vm
	local DSm = piste.DS / M
	s = math.clamp((j - 1) * DSm + math.clamp(tOff, -2, 2), 0, piste.len / M - 1)
	side = 1
	lat = math.sign(latOff) * (RH - 0.05)
	psi = math.clamp(math.atan2(vLat, math.abs(vTan) + 1), -1.4, 1.4)
	yawR, G.slipB = 0, 0
	vA = vTan * 0.94
	G.levreY = math.min(0, hOff)
	G.carRoll = math.clamp(V.airRoll, -0.42, 0.42)
	G.rollV = 0
	mode = "drive"
	Score.ETAT.mode = "drive"
	V.bascOn = false
	Score.dolFin() -- (rien n'est payé ni rendu : ce que le dauphin a nagé attendra la prochaine pose)
	secousse = math.max(secousse, 0.28)
	Sons.jouer("poseChoc", 1.2, 0.3)
	E.air.Visible = false
end

local function essayerAtterrir(dt: number)
	local pos = fallPos * M
	local prev = prevPos * M
	local DSm = piste.DS / M
	local demi = poignees.fiche.w * 0.5
	local vol = (fallPos - prevPos).Magnitude
	-- ── le RADAR : le point de piste le plus proche (dauphin, serpent, sursis, lèvre, bump) ──
	local proche, dProche = nil, math.huge
	local liste = Piste.autour(piste, pos, voisins)
	for _, j in liste do
		local d = (piste.F[j].Position - pos).Magnitude
		if d < dProche then proche, dProche = j, d end
	end
	V.curNear = proche ~= nil and dProche < 40 * M
	if V.curNear and proche then
		local F = piste.F[proche]
		local lc = F:PointToObjectSpace(pos)
		local hOff, latOff, tOff = lc.Y / M, lc.X / M, -lc.Z / M
		V.curH, V.curLat, V.curT = hOff, latOff, tOff
		local N, B = F.UpVector, F.RightVector
		local vN, vB = fallVel:Dot(N), fallVel:Dot(B)
		local prevL = latOff - vB * dt * SPD
		-- le SERPENT : passer SOUS la dalle, dans sa largeur
		if not V.fallUnder and math.abs(latOff) < RH and ((V.fallStartSide > 0 and hOff < -THICK - 1) or (V.fallStartSide <= 0 and hOff > 1)) then V.fallUnder = true end
		if V.bascOn and V.fallStartSide > 0 and not intro then
			-- (a) LE SURSIS : la caisse est PORTÉE par la lèvre tant qu'elle bascule (0,45 s) ou que ses roues intérieures touchent
			-- encore — AU-DELÀ du bord seulement, et jamais plus bas que la lèvre (2 m) : sans ces bornes, une caisse passant
			-- SOUS la route ou revenant après un bump était remontée d'un coup à la surface (jusqu'à 3 m en une image)
			if hOff > -2 and (V.bascT < 0.45 or (math.abs(latOff) >= RH and math.abs(latOff) < RH + demi)) then
				local hS = -0.35 * math.min(1, math.max(V.bascT / 0.45, (math.abs(latOff) - RH) / demi))
				if hOff < hS then
					fallPos += N * (hS - hOff)
					if vN < 0 then fallVel += N * (-vN) end
					pos = fallPos * M
				end
			end
			-- (b) LA LÈVRE RACCROCHE : la caisse REVIENT vers la route dans la seconde, jusqu'à 2 m sous la surface
			if V.sideCd <= 0 and V.bascT < 1 and hOff > -2 and hOff < 0.8 and math.abs(latOff) < RH + demi and vB * math.sign(latOff) < -0.5 then
				levreRattrape(proche, latOff, hOff, tOff)
				return
			end
		end
		-- (c) le BUMP sur la tranche de la dalle
		local sgL = math.sign(latOff)
		-- (LA POSE DÉBOGUÉE, web 2026-10-01) le mur invisible du bord : le bump partait jusqu'à 2,6 m AVANT la tranche et 80 cm
		-- AU-DESSUS du bitume — on revenait se poser par le côté, on rebondissait sur du vide.
		local mrgB = demi + math.max(0.2, math.abs(vB) * SPD * dt * 1.5)
		local bumpIn = math.abs(latOff) >= RH and math.abs(latOff) < RH + mrgB and vB * sgL < -3
		local bumpThru = math.abs(prevL) >= RH and math.abs(latOff) < RH and math.sign(prevL) * vB < -3
		local tranche = V.sideCd <= 0 and not intro and hOff > -THICK - 0.12 and hOff < 0.12 and (bumpIn or bumpThru)
		-- LA LÈVRE POUR TOUTE POSE : roues à moins de 45 cm sous le bitume au contact de la tranche → on se POSE au bord
		if tranche and hOff > -0.45 and V.fallT > 0.35 and vN < 4.5 then
			local cote = bumpThru and math.sign(prevL) or sgL
			atterrir(1, cote * (RH - 0.05), (proche - 1) * DSm + math.clamp(tOff, -2, 2), hOff)
			return
		end
		if tranche then
			local sg = bumpThru and math.sign(prevL) or sgL
			fallVel += B * (-vB * 1.65)
			fallVel *= 0.78
			-- la tranche RENVOIE vers le ciel pour de bon (~1,9 m de montée) : de quoi revenir se poser au volant
			fallVel = Vector3.new(fallVel.X, math.max(fallVel.Y + 2.4, 16 * math.sqrt(G.gK())), fallVel.Z)
			fallPos += B * (sg * math.max(bumpThru and 0 or math.abs(latOff), RH + demi) - latOff) -- remise CONTRE la tranche
			V.sideCd = 0.35
			V.bascOn = false -- la tranche touchée : la bascule est finie
			V.bounceN += 1
			nitroGain(Score.nitroBumpDe(V.bounceN, nitroOn and pwN <= 0)) -- 0,35 · 0,21 · 0,13 · 0,08 puis rien ; rien réacteur allumé
			Score.flowAdd(6, "style")
			V.fallT = math.max(0, V.fallT - airMax() * 0.5) -- DEMI-JAUGE rendue
			V.fallTR = math.max(0, V.fallTR - airMax() * 0.5)
			local noms = { "BUMP", "DOUBLE BUMP", "TRIPLE BUMP" }
			figure("bump", noms[V.bounceN] or ("MEGA BUMP x" .. V.bounceN), 0, math.min(3, V.bounceN), true, true)
			secousse = math.max(secousse, math.min(1.3, 0.3 + math.abs(vB) * 0.03))
			Sons.jouer("poseChoc", 1.3)
			return
		end
	end
	-- ── (d) la POSE : le point EXACT où la trajectoire traverse le plan de la route ──
	local bestFace, bestLat, bestS, bestD, trouve, bestH = 1, 0, 0, math.huge, false, 0
	local marge = facile() and FAC.bord or 0
	for _, j in liste do
		local F = piste.F[j]
		local lc = F:PointToObjectSpace(pos)
		local lp = F:PointToObjectSpace(prev)
		local h, hp = lc.Y / M, lp.Y / M
		local la, z = lc.X / M, -lc.Z / M
		local vN = fallVel:Dot(F.UpVector)
		local tranche = DSm * 0.6 + vol
		if math.abs(z) <= tranche then
			-- la face du DESSUS
			local ok, lx, zx = false, la, z
			if hp >= 0 and h < 0 then
				local t = hp / (hp - h)
				lx = (lp.X + (lc.X - lp.X) * t) / M
				zx = -(lp.Z + (lc.Z - lp.Z) * t) / M
				ok = math.abs(zx) <= DSm * 0.6
			elseif V.fallT > 0.35 and h > -1.2 and h < 3 and vN < 4.5 and math.abs(z) <= DSm * 0.6 then
				ok = true
			end
			if ok and math.abs(lx) < RH + marge and math.abs(h) < bestD then
				bestFace, bestLat, bestS, bestD, trouve, bestH = 1, lx, (j - 1) * DSm + zx, math.abs(h), true, h
			end
			-- la face du DESSOUS (on s'y colle en remontant)
			local ok2, lx2, zx2 = false, la, z
			if hp <= -THICK and h > -THICK then
				local t = (hp + THICK) / (hp - h)
				lx2 = (lp.X + (lc.X - lp.X) * t) / M
				zx2 = -(lp.Z + (lc.Z - lp.Z) * t) / M
				ok2 = math.abs(zx2) <= DSm * 0.6
			elseif V.fallT > 0.35 and h > -THICK - 3 and h < -THICK + 1.2 and vN > -4.5 and math.abs(z) <= DSm * 0.6 then
				ok2 = true
			end
			if ok2 and math.abs(lx2) < RH + marge and math.abs(h + THICK) < bestD then
				bestFace, bestLat, bestS, bestD, trouve, bestH = -1, lx2, (j - 1) * DSm + zx2, math.abs(h + THICK), true, -THICK - h
			end
		end
	end
	if trouve then atterrir(bestFace, bestLat, bestS, bestH) end
end

-- ════════ les pouvoirs v2 (pwrPrend, L23479) : le même pouvoir se CUMULE (plafond 2 × sa durée) ════════
local function pouvoirPrend(k: string)
	local d = Config.POUVOIRS[k]
	local autres = 0
	for kk, v in { n = pwN, a = pwA, v = pwV, m = pwM, x = pwX } do
		if kk ~= k and v > 0 then autres += 1 end
	end
	local function cumule(v: number): number return math.min(d.duree * 2, v + d.duree) end
	if k == "n" then pwN = cumule(pwN) elseif k == "a" then pwA = cumule(pwA) elseif k == "v" then pwV = cumule(pwV)
	elseif k == "m" then pwM = cumule(pwM) else pwX = cumule(pwX) end
	HudScore.slam(FR and d.nom or d.nomEN, nil, "#" .. d.couleur:ToHex(), nil, 26, 1)
	secousse = math.max(secousse, 0.35)
	HudScore.flash("#" .. d.couleur:ToHex(), 0.35)
	Sons.jouer("nitroPlein")
	if autres >= 1 then
		local tri = autres >= 2
		Score.gesteMuet(tri and tr("TRIPLE POUVOIR", "TRIPLE POWER") or tr("DOUBLE POUVOIR", "DOUBLE POWER"), tri and 150 or 70, "pwrCombo", true)
	end
	Bus.emit("pouvoir", k)
end

-- ════════ les objets ════════
local oi = 1
local FRUITS = Config.FRUITS
local function ramasser(o: any)
	local k = o.o.kind
	if k == "pad" then
		if G.padCd > 0 and not o.o.ligne then return end
		-- LE TRAIN DE BOOSTS (padTrain, L28672) : un pad sauté entre le dernier pris et celui-ci casse le train
		local sp = o.o.s / M
		local rate = G.padSL == nil or sp < (G.padSL :: number)
		if not rate then
			for _, q in zone.pads or {} do
				if q > (G.padSL :: number) + 8 and q < sp - 8 then
					rate = true
					break
				end
			end
		end
		G.padN = rate and 1 or G.padN + 1
		G.padSL = sp
		local trk = math.min(5, G.padN) - 1
		vA += O.padPousse + 5 * trk
		boost = math.max(boost, O.padBoost + 0.2 * trk)
		if not o.o.ligne then G.padCd = 1.5 end
		nitroGain(o.o.ligne and 1.15 or 0.12)
		Score.flowAdd(6 + 2 * trk, "route", "p")
		momT = math.min(4.3, momT + 0.8)
		secousse = math.max(secousse, 0.3 + 0.04 * trk)
		fovPunch = math.max(fovPunch, 10 + 2 * trk)
		HudScore.flash("#ff9600", 0.3)
		Sons.jouer("pad", Sons.demiTons(({ 0, 2, 4, 7, 9 })[trk + 1]))
		Hud.pop((G.padN > 1) and ("BOOST x" .. G.padN) or "BOOST", Color3.fromRGB(255, 176, 0), 22)
		Bus.emit("pad", G.padN)
		if o.o.ligne then
			o.pris = true
			o.p.Parent = nil
		end
		return
	end
	o.pris = true
	o.p.Parent = nil
	if k == "piece" then
		combo += 1
		G.comboT = 3
		if combo % 5 == 0 then Score.geste(tr("RECOLTE", "HARVEST") .. " x" .. combo, 20, "recolte", true, false, true) end -- LA RÉCOLTE (un robinet : droit au compteur)
		stats.pieces += 1
		ajouterPieces(1)
		Score.flowAdd(0.7, "route")
		-- SÉRIE COMPLÈTE (coinSerie, L21080) : la DERNIÈRE pièce d'un motif, toutes prises
		local grp = o.o.grp
		if grp and zone.series and zone.prisSerie and mode == "drive" then
			local n = zone.series[grp] or 0
			zone.prisSerie[grp] = (zone.prisSerie[grp] or 0) + 1
			if n >= 4 and zone.prisSerie[grp] == n then
				Score.flowAdd(3 + n * 0.4, "style", "n")
				Hud.pop(tr("SERIE COMPLETE x", "FULL SET x") .. n, Hud.C.or_, 20)
			end
		end
		local mult = math.min(2.5, 1 + 0.5 * math.floor(combo / 5))
		local g = encaisser(denom() * 2.2 * mult, "piece")
		Bus.emit("piece", g, combo)
		Sons.jouer("piece", Sons.demiTons(({ 0, 2, 4, 7, 9, 12, 14, 16 })[((combo - 1) % 8) + 1]))
	elseif k == "cristal" then
		pouvoirPrend(o.o.pw)
		-- le cristal de l'autre face disparaît avec lui (on ne le prend qu'une fois)
		for _, x in zone.objets :: { any } do
			if x ~= o and x.o.kind == "cristal" and math.abs(x.o.s - o.o.s) < 1 and not x.pris then
				x.pris = true
				x.p.Parent = nil
			end
		end
	elseif k == "fruit" then
		-- un fruit = +20 % de la jauge en réserve BLEUE (fruit de la LIGNE : +1,15) ; ni argent ni moteur
		nitroX = math.min(2, nitroX + (o.o.ligne and 1.15 or 0.2 * reservoir()))
		stats.fruits += 1
		local fd = FRUITS[o.o.fruit or 1]
		-- LA RAFALE (fruitCroque, L29230) : 3 fruits et plus à moins de 2,6 s l'un de l'autre
		G.fruitRafT = 2.6
		G.fruitRaf += 1
		local rf = math.min(6, G.fruitRaf)
		secousse = math.max(secousse, math.min(0.55, 0.18 + rf * 0.07))
		if G.fruitRaf >= 3 then Score.geste(tr("RAFALE", "STREAK") .. " x" .. G.fruitRaf, 15 + rf * 6, "rafale", true, false, true) end
		if fd.boost >= 1.5 then
			HudScore.slam(tr("PASTEQUE !", "WATERMELON!"), nil, "#e8253f", nil, 30, 1)
			secousse = math.max(secousse, 0.3)
		end
		HudScore.flash("#" .. fd.couleur:ToHex(), 0.18 + 0.1 * math.min(1, fd.boost / 2))
		Bus.emit("fruit", o.o.fruit, o.pos, fd)
		Sons.jouer("piece", 0.8 + math.min(5, rf - 1) * 0.025)
		-- le jumeau de l'autre face part avec lui
		for _, x in zone.objets :: { any } do
			if x ~= o and x.o.kind == "fruit" and math.abs(x.o.s - o.o.s) < 1 and not x.pris then
				x.pris = true
				x.p.Parent = nil
			end
		end
	end
end

-- l'écart latéral MINIMAL à un objet pendant le trajet de l'image (balEcart, L28121) : rien ne passe « à travers »
local function balEcart(so: number, w: number, sA: number, sB: number, lA: number, lB: number, lo: number): number
	local a, b = math.min(sA, sB), math.max(sA, sB)
	if b < so - w or a > so + w then return math.huge end
	if b - a < 1e-6 then return math.abs(lA - lo) end
	local t0 = math.clamp((so - w - sA) / (sB - sA), 0, 1)
	local t1 = math.clamp((so + w - sA) / (sB - sA), 0, 1)
	local l0, l1 = lA + (lB - lA) * t0, lA + (lB - lA) * t1
	if (l0 - lo) * (l1 - lo) <= 0 then return 0 end
	return math.min(math.abs(l0 - lo), math.abs(l1 - lo))
end

-- les plots volants (un plot percuté part devant, rebondit, se replie)
local volants: { { p: BasePart, v: Vector3, r: Vector3, vie: number } } = {}
local function obstacles(dt: number, cf: CFrame)
	-- les PLOTS (choc, frôlé) et les FLAQUES, sur la face où l'on roule — balayés : rien ne passe à travers
	local objs = zone.objets :: { any }
	local sM = s * M
	G.oilCd = math.max(0, G.oilCd - dt)
	local bal = math.abs(s - sPrev) < 60
	local sA = bal and sPrev or s
	local lA = bal and latPrev or lat
	local fr, fd, fk = nil, math.huge, 0
	for k = oi, #objs do
		local o = objs[k]
		if o.o.s > sM + 40 * M then break end
		if o.o.face == side and not o.pris then
			local so, lo = o.o.s / M, o.o.lat / M
			if o.o.kind == "plot" and not o.touche then
				local e = balEcart(so, 2.6, sA, s, lA, lat, lo)
				if e < math.huge then o.dm = math.min(o.dm or math.huge, e) end
				if e < 1.6 then
					-- LE CHOC : il part devant, la caisse perd 1,5 %
					o.touche = true
					local dl = lat - lo
					local v = cf.LookVector * math.max(8, math.abs(vA) * 0.55) + cf.RightVector * ((dl > 0 and -1 or 1) * (2 + math.random() * 4))
						+ cf.UpVector * (5 + math.random() * 5)
					table.insert(volants, { p = o.p, v = v * M * 0.6, r = Vector3.new(math.random() * 16 - 8, 0, math.random() * 16 - 8), vie = 1.6 })
					vA *= 0.985
					secousse = math.max(secousse, 0.14)
					Score.flowFaute("n", 0, 0.25)
					Sons.jouer("poseChoc", 1.6, 0.3)
				elseif not o.frole and o.dm and so <= s - 2.6 then
					-- LE FRÔLÉ : le plot est passé derrière sans être touché, à moins de 3,6 m
					o.frole = true
					if graceT <= 0 and kmh() > vmaxShow() * 0.45 and o.dm >= 1.6 and o.dm < 3.6 then
						fk += 1
						if o.dm < fd then fd, fr = o.dm, o end
					end
				end
			elseif o.o.kind == "flaque" and G.oilCd <= 0 then
				local r = o.o.r or 2.5
				if balEcart(so, r + 2, sA, s, lA, lat, lo) < r + 0.6 then
					G.slipT, G.oilCd = 0.75, 1.2
					secousse = math.max(secousse, 0.2)
					Sons.jouer("poseChoc", 0.7, 0.3)
				end
			elseif o.o.kind == "pad" then
				if balEcart(so, 6, sA, s, lA, lat, lo) < 4.1 then ramasser(o) end
			elseif o.o.kind == "fruit" and o.o.ligne then
				if balEcart(so, 1.5, sA, s, lA, lat, lo) < 4.5 then ramasser(o) end
			end
		end
	end
	if fr then
		local pres = math.clamp(1 - (fd - 1.6) / 2, 0, 1)
		G.froleN += fk
		G.froleT = 1.4
		local m = (fk > 1) and 1.5 or 1 -- une PORTE (deux plots dans la même image) : ×1,5
		nitroGain((0.08 + 0.08 * pres) * m)
		Score.flowAdd((4 + 4 * pres) * m, "style", "n")
		momT = math.min(4.3, momT + 0.6)
		Score.gesteMuet((G.froleN >= 2) and ("SLALOM x" .. G.froleN) or tr("FROLE", "CLOSE CALL"), 20, "frole")
		if fk == 1 and G.froleN >= 2 then Hud.pop("SLALOM x" .. G.froleN, (G.froleN >= 3) and Hud.C.or_ or Color3.fromRGB(125, 255, 236), 20) end
		fovPunch = math.max(fovPunch, 1.5 + 2 * pres)
		Sons.jouer("maillon", Sons.demiTons(math.min(12, G.froleN * 2)), 0.3)
	end
	G.froleT -= dt
	if G.froleT <= 0 then G.froleN = 0 end
end

-- LA PLUIE DE SATELLITES (satHard, L14061) : percuter un satellite de la route tue ; le frôler (moins de 3,2 m en travers) se paie
-- comme un plot frôlé, une fois sorti de sa bulle. Au sol comme en vol.
function G.satFrole(dm: number)
	local pres = math.clamp(1 - dm / 3.2, 0, 1)
	G.froleN += 1
	G.froleT = 1.4
	nitroGain(0.08 + 0.08 * pres)
	Score.flowAdd(4 + 4 * pres, "style", "n")
	momT = math.min(4.3, momT + 0.6)
	Score.gesteMuet(tr("FROLE", "CLOSE CALL"), 20, "frole")
	fovPunch = math.max(fovPunch, 1.5 + 2 * pres)
	Sons.jouer("maillon", Sons.demiTons(math.min(12, G.froleN * 2)), 0.3)
end
function G.satHard()
	local l = (zone :: any).sats
	if not l or #l == 0 or graceT > 0 or intro then return end
	local P = carCF.Position / M
	for _, o in l do
		if not o.fait then
			local d = P - o.q
			if d:Dot(d) > o.R2 then
				if o.pres then -- sorti de la bulle : le frôlé se paie
					o.fait = true
					if o.min < 3.2 then G.satFrole(o.min) end
				end
			else
				local a, u, t = math.abs(d:Dot(o.W)), math.abs(d:Dot(o.U)), math.abs(d:Dot(o.T))
				if a < o.hw and u < o.hu and t < o.ht then
					o.fait = true
					secousse = math.max(secousse, 1.3)
					exploser("sat")
					return
				end
				-- à hauteur et au droit : la marge qui reste en travers
				if u < o.hu + 1.2 and t < o.ht + 1 then
					o.min = math.min(o.min, math.max(0, a - o.hw))
					o.pres = true
				end
			end
		end
	end
end

-- L'ORBITE · LA PLUIE DE DÉBRIS (debTick, debFrappe, L32956) : la cible tombe là où la caisse SERA ; à l'impact, touché ou esquivé.
-- La pluie se durcit vers le portail (≈ 3,4 s entre deux chutes au départ, 1,9 s à la fin). Seulement en orbite, sur le dessus.
function G.debTick(dt: number, camCF: CFrame)
	local D = KA.Debris
	D.suite(dt)
	if G.gK() >= 1 or TU.on or not (mode == "drive" or mode == "fall") then
		D.cache()
		return
	end
	if not D.on then
		if mode == "drive" and side > 0 and not intro then
			D.prochain -= dt
			if D.prochain <= 0 then
				local ok = D.arme(piste, s, lat, math.max(18, math.abs(vA)) * SPD)
				if ok and not D.dit then
					D.dit = true
					Hud.pop(tr("ESQUIVE LES DEBRIS", "DODGE THE DEBRIS"), Color3.fromRGB(255, 138, 77), 20)
				end
				D.prochain = ok and (3.4 - math.clamp(s / (piste.len / M), 0, 1) * 1.5) * (0.8 + math.random() * 0.4) or 0.35
			end
		end
		return
	end
	if not D.tick(dt, camCF) then return end
	-- LA FRAPPE
	local d = (carCF.Position - D.p1).Magnitude / M
	secousse = math.max(secousse, 0.9 * math.max(0, 1 - d / 140))
	if d < 260 then Sons.jouer("explosion", 0.7, 0.45 * (1 - d / 300)) end
	if mode ~= "drive" then return end -- en vol, on l'a survolé
	if side < 0 then
		if d < D.R + 9 then Hud.pop(tr("A L'ABRI", "SAFE"), Color3.fromRGB(159, 232, 255), 20) end
		return
	end
	if d < D.R + 1.2 then
		-- TOUCHÉ : la vitesse et le flow prennent le choc — pas la vie ; en gravité lunaire, la gerbe soulève la caisse
		vA *= 0.6
		momT = 0
		Score.flowFaute("n", 20, 0.25)
		D.serie = 0
		G.hopV = math.max(G.hopV, 7.5)
		secousse = math.max(secousse, 1.1)
		Hud.pop(tr("TOUCHE !", "HIT!"), Color3.fromRGB(255, 90, 60), 26)
		Hud.vibre(90)
		Sons.jouer("poseChoc", 0.7, 0.5)
	elseif d < D.R + 9 then
		-- ESQUIVÉ DE PRÈS : le risque paie, la série fait monter la mise
		D.serie += 1
		local k = math.min(4, D.serie)
		Hud.pop(tr("ESQUIVE !", "DODGED!") .. ((D.serie > 1) and (" x" .. D.serie) or ""), Color3.fromRGB(255, 176, 0), 22)
		Score.flowAdd(6 + k * 3, "style", "n")
		nitroGain(0.08 + k * 0.04)
		Score.gesteMuet(tr("ESQUIVE", "DODGE"), 24 + k * 6, "esquive")
		Sons.jouer("maillon", Sons.demiTons(k * 2), 0.3)
	end
end

local function objets(dt: number, pos: Vector3, t: number)
	local objs = zone.objets :: { any }
	-- les pièces proches tournent (les autres dorment : zéro coût)
	local sM = s * M
	while oi <= #objs and objs[oi].o.s < sM - 60 * M do oi += 1 end
	local ang = CFrame.Angles(0, t * 2.5, 0)
	for k = oi, #objs do
		local o = objs[k]
		if o.o.s > sM + 160 * M then break end
		local kd = o.o.kind
		if not o.pris and not o.aimante and (kd == "piece" or kd == "cristal" or kd == "fruit") then o.p.CFrame = o.base * ang end
	end
	-- ramassage, attraction, aimant (pickupsTick, L36093) — au sol comme en vol
	local mag = (tier >= 15) and 1 or 0 -- la capacité moteur « AIMANT À PIÈCES »
	local enVol = mode == "fall"
	local face = enVol and ((V.curNear and ((V.curH < -THICK * 0.5) and -1 or 1)) or V.fallStartSide) or side
	local rayonMax = (pwM > 0) and 50 or (enVol and (11 + mag * 3) or (15 + mag * 2))
	local r = math.max(1, math.ceil(rayonMax * M / CEL_OBJ))
	local cx, cy, cz = math.floor(pos.X / CEL_OBJ), math.floor(pos.Y / CEL_OBJ), math.floor(pos.Z / CEL_OBJ)
	local g = zone.grille :: { [number]: { any } }
	for dx = -r, r do
		for dy = -r, r do
			for dz = -r, r do
				local l = g[(cx + dx + 4096) * 67108864 + (cy + dy + 4096) * 8192 + (cz + dz + 4096)]
				if l then
					for _, o in l do
						local kd = o.o.kind
						if not o.pris and o.o.face == face and kd ~= "plot" and kd ~= "flaque" then
							local d = (o.p.Position - pos).Magnitude / M
							if kd == "pad" then
								-- (les pads se prennent au balayage, au sol : voir obstacles)
							elseif d < O.rayon + mag * 0.5 then
								ramasser(o)
							elseif kd ~= "cristal" and pwM > 0 and d < 50 then
								-- la sphère de l'AIMANT : plus la pièce est près, plus elle fonce
								local q = 1 - d / 50
								o.aimante = true
								o.p.CFrame = o.p.CFrame:Lerp(CFrame.new(pos + carCF.UpVector * M), math.min(1, dt * (5 + 25 * q * q)))
							elseif enVol and d < 11 + mag * 3 then
								-- l'ACCROCHE en vol : ce qu'on frôle vient à la caisse
								o.hk = (o.hk or 0) + dt
								o.aimante = true
								o.p.CFrame = o.p.CFrame:Lerp(CFrame.new(pos), math.min(1, dt * (5.5 + 30 * o.hk)))
							elseif not enVol and math.abs(o.o.s / M - s) < 15 + mag * 2 and math.abs(o.o.lat / M - lat) < 9 + mag * 2 then
								o.aimante = true
								o.p.CFrame = o.p.CFrame:Lerp(CFrame.new(pos + carCF.UpVector * M), math.min(1, dt * (6 + mag * 1.5)))
							end
						end
					end
				end
			end
		end
	end
	-- les plots percutés volent 1,6 s
	for i = #volants, 1, -1 do
		local v = volants[i]
		v.vie -= dt
		v.v -= Vector3.new(0, 24 * M * dt, 0)
		v.p.CFrame = (v.p.CFrame + v.v * dt) * CFrame.Angles(v.r.X * dt, 0, v.r.Z * dt)
		if v.vie <= 0 then
			v.p.Parent = nil
			table.remove(volants, i)
		end
	end
end

-- ════════ LA LIGNE PARFAITE (ligneTick, L11855) : FRUIT, PAD, FRUIT, PAD… sur la trajectoire idéale ════════
-- Qui prend tout tient la nitro sans la lâcher : chaque objet rend 1,15 s, il y en a un toutes les 1,2 s de route.
local function poserEnCourse(o: Piste.Objet)
	local rec = Construction.unObjet(piste, o, zone.dossier :: Folder)
	rec.dyn = true
	local objs = zone.objets :: { any }
	local lo, hi = 1, #objs + 1
	while lo < hi do
		local mid = (lo + hi) // 2
		if objs[mid].o.s < o.s then lo = mid + 1 else hi = mid end
	end
	table.insert(objs, lo, rec)
	local g = zone.grille :: { [number]: { any } }
	local k = cleObj(rec.pos)
	g[k] = g[k] or {}
	table.insert(g[k], rec)
	if o.kind == "pad" and o.face == 1 and zone.pads then
		table.insert(zone.pads, o.s / M)
		table.sort(zone.pads)
	end
end
local function ligneBloque(s9: number): boolean
	-- un plot à moins de 9 m, une flaque à moins de son rayon + 7 : la place est prise
	local objs = zone.objets :: { any }
	local lo, hi = 1, #objs + 1
	local cible = (s9 - 12) * M
	while lo < hi do
		local mid = (lo + hi) // 2
		if objs[mid].o.s < cible then lo = mid + 1 else hi = mid end
	end
	for k = lo, #objs do
		local o = objs[k].o
		if o.s > (s9 + 12) * M then break end
		if o.face == 1 then
			local d = math.abs(o.s / M - s9)
			if o.kind == "plot" and d < 9 then return true end
			if o.kind == "flaque" and d < (o.r or 2.5) + 7 then return true end
		end
	end
	return false
end
local function ligneTick(dt: number)
	local LI = Config.LIGNE
	local L = piste.len / M
	local b0 = math.max(30, math.abs(vA) * SPD)
	local H = math.max(4, (RH - 3) * 0.62)
	if G.lgV > 0 and dt > 0 then G.lgAcc += (math.min(40, (b0 - G.lgV) / dt) - G.lgAcc) * math.min(1, dt * 2) end
	G.lgV = b0
	local v = (b0 + math.max(0, G.lgAcc) * LI.voir * 0.7) * vitMult() -- la vitesse À L'ARRIVÉE sur l'objet
	if G.lgS < s + 60 then G.lgS = s + 60 end
	local horizon = s + math.max(220, v * LI.voir)
	local n = 0
	while G.lgS < horizon and G.lgS < L - 120 and n < 3 do
		n += 1
		local s9: number? = nil
		for d = 0, 160, 20 do
			local q = G.lgS + d
			if q >= L - 120 then break end
			if not ligneBloque(q) then
				s9 = q
				break
			end
		end
		if not s9 then
			G.lgS += 180
		else
			-- la CORDE : la file se décale vers l'intérieur du virage (rayon 150 m → ~11 m)
			local f = Piste.repere(piste, s9 * M)
			local c = (Piste.repere(piste, (s9 + 40) * M).LookVector:Dot(f.RightVector) - Piste.repere(piste, (s9 - 40) * M).LookVector:Dot(f.RightVector)) / 80
			local lt = math.clamp(c * 1600, -H, H)
			if G.lgK == 1 then
				for _, face in { 1, -1 } do
					poserEnCourse({ s = s9 * M, lat = lt * face * M, h = 0.1 * M, face = face, kind = "pad", ligne = true })
				end
			else
				-- le fruit : tiré au poids (la myrtille 4 fois sur 10, la pastèque 1 fois sur 64), le même sur les deux faces
				local tot = 0
				for _, fd in FRUITS do tot += fd.freq end
				local x, fi = math.random() * tot, 1
				for i, fd in FRUITS do
					x -= fd.freq
					if x <= 0 then
						fi = i
						break
					end
				end
				for _, face in { 1, -1 } do
					poserEnCourse({ s = s9 * M, lat = lt * face * M, h = 1.6 * M, face = face, kind = "fruit", fruit = fi, ligne = true })
				end
			end
			G.lgK = 1 - G.lgK
			G.lgS = s9 + math.max(40, v * LI.dt)
		end
	end
end


-- ════════ changer de zone : le PORTAIL (portailPasse, L30180) ════════
local function activer(e: Zone)
	zone = e
	piste = e.piste :: Piste.Piste
	for z, x in ZONES do
		if x.dossier then x.dossier.Parent = (z == e.z) and workspace or nil end
	end
	-- (CHUTE_P.coton = 0 dans le jeu web) au menu, les nuages du niveau passaient devant la caisse : la mer de nuages suffit
	if e.ciel then e.ciel.Parent = (mode ~= "menu" and mode ~= "garage" and mode ~= "charge") and e.dossier or nil end
	oi = 1
	evEtat:FireServer("zone", e.z)
	Bus.emit("niveau", (piste :: any).niveau, (piste :: any).variante)
end
local function passerPortail(): boolean
	local ecole = TU.on and zoneN == 0 -- pendant la leçon, le portail ramène sur la piste d'école
	local suiv = ecole and ZONES[0] or ZONES[zoneN + 1]
	if not suiv or not suiv.pret then
		-- la zone suivante n'est pas prête (téléphone très lent) : la caisse patiente au bout de la route
		-- (jamais d'attente DANS la boucle de rendu : Roblox l'interdit)
		if not suiv then preparer(zoneN + 1, Piste.suite(piste)) end
		if mode == "drive" then s = piste.len / M - 0.6 end
		return false
	end
	local longueur = piste.len / M
	G.distAvant += longueur
	local ancienne = zoneN
	-- le saut vertical entre la sortie et le départ remonté : caisse, vol et caméra bougent ensemble
	local saut = (suiv.piste :: Piste.Piste).F[1].Position - piste.F[piste.n].Position
	carCF = carCF + saut
	fallPos += saut / M
	prevPos += saut / M
	V.flowP0 += saut / M
	KA.pos += saut
	KA.vise += saut
	s -= longueur
	sPrev -= longueur
	V.flowS0 -= longueur
	G.padSL = 0 -- le train de boosts TRAVERSE le portail
	G.lgS, G.lgK, G.lgV, G.lgAcc = 240, 0, 0, 20 -- la ligne parfaite repart avec la piste
	if not ecole then
		zoneN += 1
		G.nbZones += 1
	end
	remettreObjets(suiv)
	activer(suiv)
	if not ecole then oublier(ancienne) end
	local g = encaisser(denom() * 24, "portail")
	nitroR = reservoir()
	Bus.emit("portail", zoneN)
	HudScore.slam("ZONE " .. zoneN, "+" .. Hud.argent(g), "#00eaff", "#7dff9b", 34, 1)
	if not ecole then task.delay(1.3, function() if mode == "drive" or mode == "fall" then Hud.grand(G.nomNiveau(), Hud.C.texte, 2.4) end end) end
	Sons.jouer("portail")
	if not ecole then preparer(zoneN + 1, Piste.suite(piste)) end
	return true
end

-- ════════ le DRIFT et son MINI-TURBO (driftTick, L20758) ════════
local function driftTick(dt: number, on: boolean)
	G.driftCd = math.max(0, G.driftCd - dt)
	if on and G.driftCd <= 0 then
		G.driftC += dt
		vA *= math.max(0, 1 - 0.10 * dt) -- −10 %/s en glisse
		local lv = (G.driftC > 1.4 and 3) or (G.driftC > 0.9 and 2) or (G.driftC > 0.45 and 1) or 0
		if lv > G.driftLv then
			G.driftLv = lv
			Sons.jouer("bip", Sons.demiTons(({ 0, 3, 5, 7 })[lv + 1] - 3), 0.35)
		end
	elseif not on and G.driftC > 0 then
		if G.driftLv > 0 then
			-- LE MINI-TURBO, au RELÂCHER
			G.driftCd = 0.6 + 0.3 * G.driftLv
			if G.driftLv >= 2 then momT = 4.3 end
			boost = math.max(boost, 0.35 + 0.3 * G.driftLv)
			vA += 6 * G.driftLv
			nitroGain(0.16 * G.driftLv)
			secousse = math.max(secousse, 0.14 * G.driftLv)
			Score.flowAddDecl(9 * G.driftLv, "style", "n")
			fovPunch = math.max(fovPunch, 6 + 6 * G.driftLv)
			if G.driftLv == 3 then HudScore.flash("#ff5ec8", 0.35) end
			Sons.jouer("fronde", Sons.demiTons(G.driftLv * 3))
			Score.gesteMuet(({ "MINI-TURBO", "SUPER TURBO", "ULTRA TURBO" })[G.driftLv], ({ 50, 100, 180 })[G.driftLv], "drift")
			if G.driftLv >= Score.F2.decl.drift and Score.frenPeut() then Score.frenDeclenche() end -- (en ville, le drift déclenche)
		end
		G.driftC, G.driftLv = 0, 0
	end
end

-- LA FRONDE (frondeLache, L28654) : un virage serré tenu SANS glisser rend de la vitesse à la sortie
local function frondeLache(t: number, c: number)
	if intro or mode ~= "drive" or G.frondeCd > 0 or not (vA > 8) then return end
	local k = math.clamp((t - 0.9) / 1.8, 0, 1)
	local co = (t > 0) and math.min(1, c / t) or 0
	local p = (0.4 + 0.6 * k) * (1 + 0.6 * co)
	vA += 16 * p
	boost = math.max(boost, 0.45 + 0.45 * p)
	momT = math.min(4.3, momT + 0.6 * p)
	nitroGain(0.05 + 0.07 * p)
	fovPunch = math.max(fovPunch, 5 + 6 * p)
	secousse = math.max(secousse, 0.1 + 0.08 * p)
	Score.flowAdd(4 + 6 * p, "route")
	G.frondeCd = 0.8
	Sons.jouer("fronde", Sons.demiTons(({ 0, 2, 4, 7, 9 })[math.clamp(math.floor(p * 3 + 0.5), 0, 4) + 1]))
	Score.gesteMuet(tr("FRONDE", "SLINGSHOT"), math.floor(30 + 40 * p + 0.5), "fronde")
end

-- ════════ LA CONDUITE (L36300-36680) ════════
local function etapeSol(dt: number)
	local push, late = pousseMoteur(), tardif()
	local maxSp = 190 / 3.6 * late * push
	local acc9 = 22 * late * (1 + (push - 1) * 0.6)
	local lv = Score.niveau()
	local cf = repere(s, side)
	local T_ = cf.LookVector
	sPrev, latPrev = s, lat
	gererNitro(dt)
	local vm = vitMult()
	local frein = Controles.frein
	steerS += (Controles.volant - steerS) * math.min(1, dt * 18)
	-- LE DRIFT (conduite v6) : tirer le frein en braquant fort, à bonne vitesse
	local vitOk = math.abs(vA) > maxSp * 0.42
	if not intro and vitOk and frein and math.abs(steerS) > 0.35 then G.driftOn = true
	elseif not vitOk or not frein or math.abs(steerS) < 0.2 then G.driftOn = false end
	driftTick(dt, G.driftOn)
	if not frein and not G.driftOn and math.abs(psi - G.slipB) < 0.25 then momT = math.min(4.3, momT + dt) else momT = math.max(0, momT - 2 * dt) end
	local momF = 1 + math.min(1.8, momT * momT * 0.1)
	local a
	if frein and not G.driftOn then
		a = (vA > 2) and -acc9 * 1.5 or -acc9 * 0.5
	else
		-- le FLOW pousse : +5 % de vitesse de pointe et +6 % d'accélération par palier
		a = acc9 * ((vA < maxSp * (1 + 0.05 * lv)) and 1 or 0.55) * ((boost > 0) and 1.5 or 1) * momF * (1 + 0.06 * lv)
	end
	vA += a * dt
	if nitroOn then vA += (nitroBleue and 48 or NI.pousseSol) * push * dt end
	vA += -GRAV * T_.Y * math.cos(psi - G.slipB) * dt
	vA -= vA * math.abs(vA) * (acc9 / (maxSp * maxSp * 5.8)) * dt
	vA *= 1 - 0.03 * dt
	if vA < -8 then vA = -8 end
	-- le volant : le pouce commande un TAUX de lacet (× 1,15 en drift, × 0,18 sur une flaque)
	local vw = math.max(8, math.abs(vA) * SPD)
	local lacetMax = vw / (40 + 0.3 * vw)
	local rT = steerS * lacetMax * vm * math.clamp(vA / 8, -1, 1) * (G.driftOn and 1.15 or 1) * ((G.slipT > 0) and 0.18 or 1)
	yawR += (rT - yawR) * (1 - math.exp(-dt * vm / 0.1))
	-- l'angle de glisse du NEZ en drift (≈ 24°)
	local slipC = G.driftOn and (math.sign(steerS) * 0.42 * math.min(1, math.abs(steerS))) or 0
	local ds = (slipC - G.slipB) * (1 - math.exp(-(G.driftOn and 4 or 6) * dt))
	G.slipB += ds
	psi += yawR * dt + ds
	-- une flaque : l'embardée
	if G.slipT > 0 then
		G.slipT -= dt
		psi = math.clamp(psi + (math.random() - 0.5) * 2.6 * dt * math.min(1, math.abs(vA) / 12), -1.4, 1.4)
		G.virD = true
	end
	local cap = psi - G.slipB
	local vL = vA * math.sin(cap)
	lat += vL * dt * SPD * vm
	s += vA * math.cos(cap) * dt * SPD * vm
	-- la route tourne SOUS la caisse
	local cf2 = repere(s, side)
	local dyaw = -(T_:Cross(cf2.LookVector)):Dot(cf2.UpVector)
	local fac = facile()
	psi = math.clamp(psi - math.asin(math.clamp(dyaw, -1, 1)) * (1 - (fac and FAC.virage or 0)), -1.4, 1.4)
	if fac and math.abs(steerS) < 0.1 and not G.driftOn then psi *= math.exp(-dt * FAC.cap * vm) end
	if boost > 0 then boost -= dt end
	local k = kmh()
	-- VIRAGE SERRÉ + LA FRONDE
	local aB = math.abs(yawR / vm * vA) * SPD
	G.frondeCd = math.max(0, G.frondeCd - dt)
	if aB > 32 then
		G.virT += dt * vm
		if lat * math.sign(yawR) > RH * 0.2 then G.virC += dt * vm end -- à la CORDE
		if G.driftOn or G.slipT > 0 then G.virD = true end
	elseif aB < 12 then
		if G.virPaye and not G.virD then frondeLache(G.virT, G.virC) end
		G.virT, G.virC, G.virD, G.virPaye = 0, 0, false, false
	end
	if G.virT > 0.9 and not G.virPaye then
		G.virPaye = true
		Score.gesteMuet(tr("VIRAGE SERRE", "TIGHT TURN"), 45, "virage")
	end
	-- RASE-BORD : longer le vide recharge la nitro
	if not intro and math.abs(lat) > RH * 0.8 and math.abs(vA) > maxSp * 0.5 then
		G.raseT += dt
		if not nitroOn then nitroGain(Score.N2.rase * dt) end -- (rien ne se remplit en continu pendant que ça brûle)
		Score.flowAdd(6 * dt, "route")
		if G.raseT > 0.6 and not G.raseAnn then
			G.raseAnn = true
			Score.gesteMuet(tr("RASE-BORD", "EDGE RIDER"), 40, "rase")
		end
	else
		G.raseT, G.raseAnn = 0, false
	end
	-- NITROOO : la nitro tenue 2 s au-dessus de min(400, 55 % de la G.vmax)
	if nitroOn and (G.departT or 0) <= 0 and k > math.min(400, vmaxShow() * 0.55) then -- (le boost de DÉPART tient la touche à la place du joueur : il ne compte pas)
		G.pureT += dt
		if G.pureT > NTR_T and G.pureArmed then
			G.pureArmed = false
			if not NTR.on then
				HudScore.slam("NITROOO !", nil, "#ff7a24", nil, 40, 1)
				Score.geste("NITROOO", 120, "pure")
			end
			G.pureNext = G.pureT + 2
			nitroooPart()
			Score.flowAdd(5, "risque", "p")
		end
		if not G.pureArmed and G.pureT > G.pureNext then
			G.pureNext = G.pureT + 2
			G.pureLvl = math.min(5, G.pureLvl + 1)
			Score.geste("NITROOO x" .. (G.pureLvl + 1), 15 + G.pureLvl * 8, "pure", true, false, true)
		end
	else
		G.pureT, G.pureArmed, G.pureNext, G.pureLvl = 0, true, 0, 0
	end
	-- les plots, les flaques, les pads ; la ligne parfaite se pose devant
	obstacles(dt, cf2)
	if not intro and not TU.on then ligneTick(dt) end
	G.fruitRafT -= dt
	if G.fruitRafT <= 0 then G.fruitRaf = 0 end
	-- ROULE OU CRÈVE (L36365)
	if not intro and graceT <= 0 and G.tempsDepart > 1.5 and math.abs(vA) * 3.6 * SPD < Config.ARRET_KMH then
		G.idleT += dt
		if G.idleT > 1.6 then
			G.idleMsg -= dt
			if G.idleMsg <= 0 then
				G.idleMsg = 0.5
				Hud.pop(tr("ROULE OU CREVE  ", "DRIVE OR DIE  ") .. string.format("%.1f", math.max(0, Config.ARRET_T - G.idleT)), Color3.fromRGB(255, 77, 77), 20)
				Sons.jouer("bip", 1.2)
			end
		end
		if G.idleT >= Config.ARRET_T then
			G.idleT = 0
			exploser("arret")
			return
		end
	else
		G.idleT = math.max(0, G.idleT - dt * 2.5)
	end
	-- le point de réapparition sûr
	if side > 0 and cf2.UpVector.Y > 0.5 and math.abs(lat) < RH - 2 and math.abs(psi) < 0.5 then G.safeS = s end
	-- on quitte la route par le bord : la BASCULE
	if math.abs(lat) > RH then
		if graceT <= 0 then
			carCF = CFrame.new(cf2.Position + cf2.RightVector * lat * M) * cf2.Rotation * CFrame.Angles(0, -psi, 0)
			decoller(0, 1, true)
			return
		else
			lat = math.sign(lat) * RH
		end
	end
	-- dessous, trop lent : la dalle nous lâche
	if side < 0 and cf2.UpVector.Y < -0.15 and math.abs(vA) < 7 and graceT <= 0 then
		carCF = CFrame.new(cf2.Position + cf2.RightVector * lat * M) * cf2.Rotation * CFrame.Angles(0, -psi, 0)
		decoller(0.9, 1)
		return
	end
	-- le portail
	if s * M >= piste.len - 0.5 * M then
		passerPortail()
		cf2 = repere(s, side)
	end
	-- le ROULIS : le virage, le drift, et l'AFFAISSEMENT VERS LE VIDE quand les roues passent la lèvre (L36662)
	local hw = poignees.fiche.w * 0.5
	local dB = math.abs(lat) - (RH - hw)
	local pe = (dB > 0) and math.min(1, dB / hw) or 0
	local aLat = yawR / vm * math.abs(vA) * SPD
	local rollT = math.sign(aLat) * 0.26 * (1 - math.exp(-math.abs(aLat) / 35)) + (G.driftOn and math.sign(G.slipB) * 0.07 or 0) - math.sign(lat) * 0.15 * pe * (2 - pe)
	local d = math.min(dt, 1 / 30)
	G.rollV += ((rollT - G.carRoll) * 196 - G.rollV * 15.4) * d
	G.carRoll = math.clamp(G.carRoll + G.rollV * d, -0.42, 0.42)
	G.levreY *= math.exp(-16 * dt)
	if math.abs(G.levreY) < 0.005 then G.levreY = 0 end
	if G.hopY > 0 then
		G.hopY += G.hopV * dt
		G.hopV -= 26 * G.gK() * dt
		if G.hopY <= 0 then -- le CONTACT
			G.hopY, G.hopV = 0, 0
			secousse = math.max(secousse, G.choc)
			G.choc = 0
		end
	end
	-- la caisse posée
	local pos = cf2.Position + cf2.RightVector * (lat * M) + cf2.UpVector * ((G.levreY + G.hopY) * M)
	carCF = CFrame.new(pos) * cf2.Rotation * CFrame.Angles(0, -psi, 0) * CFrame.Angles(0, 0, G.carRoll)
end

-- ════════ LE VOL (L36896-37176) ════════
local function etapeAir(dt: number)
	V.fallT += dt
	V.fallTR += dt
	V.volT += dt
	if nitroOn and pwN <= 0 then V.nitT += dt end
	V.kickT -= dt
	V.sideCd -= dt
	gererNitro(dt)
	local push = pousseMoteur()
	-- la bascule dure UNE seconde au plus, puis c'est un vol comme un autre (ni portée, ni lèvre, ni gravité retenue)
	if V.bascOn then
		V.bascT += dt
		if V.bascT > 1.1 then V.bascOn = false end
	end
	local gB = V.bascOn and math.min(1, V.bascT / 0.45) or 1 -- LE SURSIS : la gravité s'installe en 0,45 s
	fallVel -= Vector3.new(0, FALL_G * G.gK() * gB * dt, 0)
	-- le repère de vol : l'avant = la trajectoire, le haut reste perpendiculaire (garde contre le blocage de cardan)
	local vit = fallVel.Magnitude
	if vit > 1 then flyAv = fallVel / vit end
	local u = flyU - flyAv * flyU:Dot(flyAv)
	if u.Magnitude > 1e-3 then flyU = u.Unit end
	local droite = flyAv:Cross(flyU)
	if droite.Magnitude < 1e-3 then droite = Vector3.xAxis else droite = droite.Unit end
	-- le LACET (volant) : il tourne la TRAJECTOIRE, et compte les vrilles
	local yawIn = Controles.volant * (1.15 + math.min(0.6, vit * 0.004)) * dt
	if yawIn ~= 0 then fallVel = CFrame.fromAxisAngle(flyU, -yawIn):VectorToWorldSpace(fallVel) end
	V.yawAcc += yawIn
	if V.fallT > 0.45 and not intro then
		local dT = math.floor(math.abs(V.yawAcc) / math.pi)
		if dT > V.demiTours then
			V.demiTours = dT
			figure("vrille", (dT * 180) .. "°", 3.5 * dT, math.min(3, dT), true)
			Sons.jouer("vrille", Sons.demiTons(math.min(12, dT * 2)))
		end
	end
	if nitroOn then
		-- la PORTANCE : la nitro reprend 60 % de la gravité (75 % en réserve bleue)
		fallVel += Vector3.new(0, FALL_G * G.gK() * (nitroBleue and 0.75 or NI.portance) * gB * dt, 0)
		-- le COUP D'ALLUMAGE : une fois par allumage EN VOL, 0,5 s entre deux
		if not V.nAirTenu and V.kickT <= 0 then
			V.nAirTenu = true
			V.kickT = 0.5
			local a = NI.coupAir * push
			local m = fallVel.Magnitude
			fallVel = (m > 1) and fallVel.Unit * (m + a) or (fallVel + flyU * a)
			V.fallVH0 = math.max(V.fallVH0, horiz(fallVel))
			if pwN <= 0 then nitroR = math.max(0, nitroR - 0.12 * reservoir() * (Score.frenesie() and Score.F2.frenNitro or 1)) end
			fovPunch = math.max(fovPunch, 12)
			secousse = math.max(secousse, 0.35)
		end
		-- la POUSSÉE continue, dans l'axe du vol
		local a = (nitroBleue and 96 or NI.pousseAir) * push * (1 + math.min(0.4, NTR.boost)) * dt
		local m = fallVel.Magnitude
		if m > 1 then fallVel = fallVel.Unit * (m + a) end
		V.fallVH0 = math.max(V.fallVH0, horiz(fallVel))
		V.nitroAirT += dt
		V.nitroAirTenue += dt
		if V.nitroAirT > 1.2 and not vus.meteo and not intro then figure("meteo", tr("METEORE", "METEOR"), 8, 2) end
		if V.nitroAirTenue >= NTR_T and not vus.airnitro and not intro then
			figure("airnitro", "AIR NITROOO", 10, 1)
			nitroooPart()
		end
	else
		V.nAirTenu = false
		V.nitroAirTenue = 0
	end
	-- l'ASSIETTE : piqué / cabré (1,7 rad/s sous nitro, 0,85 sans) — elle tourne la trajectoire ET le repère
	local ass = Controles.assiette
	if math.abs(ass) > 0.05 then
		local q = CFrame.fromAxisAngle(droite, -ass * (nitroOn and 1.7 or 0.85) * dt)
		fallVel = q:VectorToWorldSpace(fallVel)
		flyU = q:VectorToWorldSpace(flyU)
	end
	-- le PLAFOND HORIZONTAL = la vitesse d'éjection (la nitro le relève)
	local hx = horiz(fallVel)
	if V.fallVH0 < 0 then V.fallVH0 = math.max(hx, fallVel.Magnitude) end
	if hx > V.fallVH0 and hx > 1 then
		local kx = V.fallVH0 / hx
		fallVel = Vector3.new(fallVel.X * kx, fallVel.Y, fallVel.Z * kx)
	end
	-- les figures de durée
	if V.fallTR > 1.8 and not V.bigA and not intro then
		V.bigA = true
		Score.geste("BIG AIR", 50, "bigair")
		Score.flowAdd(6, "risque", "n")
		Sons.jouer("bigAir")
	end
	if V.fallTR > 3.4 and not V.monstre and not intro then
		V.monstre = true
		Score.geste(tr("AIR MONSTRE", "MONSTER AIR"), 110, "V.monstre")
		Score.flowAdd(10, "risque", "n")
	end
	prevPos = fallPos
	fallPos += fallVel * dt * SPD
	-- LES TOURS NE PARDONNENT PAS (villeHeurt, L11787) : en vol, entrer dans une tour de la ville tue
	if (zone :: any).ville and not intro and KA.Ville.heurt((zone :: any).ville, fallPos) then
		exploser("tour")
		return
	end
	-- la vrille VISUELLE : la caisse roule autour de sa trajectoire
	V.airRoll += (V.bascDir * (3.0 + math.min(2, V.fallT * 0.5)) * (V.bascOn and math.min(1, 0.25 + V.bascT * 1.9) or 1) + Controles.volant * 2.2) * dt * (intro and 0 or 1)
	vit = fallVel.Magnitude
	if vit > 1 then flyAv = fallVel / vit end
	u = flyU - flyAv * flyU:Dot(flyAv)
	if u.Magnitude > 1e-3 then flyU = u.Unit end
	droite = flyAv:Cross(flyU)
	if intro then
		carCF = CFrame.new(fallPos * M) * menuRot -- la CHUTE du départ garde la pose du menu
	elseif droite.Magnitude > 1e-3 then
		carCF = CFrame.fromMatrix(fallPos * M, droite.Unit, flyU) * CFrame.Angles(0, 0, V.airRoll)
	else
		carCF = CFrame.new(fallPos * M) * carCF.Rotation
	end
	essayerAtterrir(dt)
	if mode ~= "fall" then return end
	-- LE DAUPHIN : nager au ras de la dalle (dessus ou dessous, dans sa largeur)
	if not intro then
		local dx = math.max(0, math.abs(V.curLat) - RH)
		local dy = (V.curH > 0 and V.curH) or ((V.curH < -THICK) and (-THICK - V.curH) or 0)
		local hF = math.sqrt(dx * dx + dy * dy)
		local sur = V.curNear and math.abs(V.curT) < 4 and math.abs(V.curLat) <= RH - 3 and hF < 40
		if Score.dolTick(dt, sur, hF, fallVel.Magnitude * 3.6 * SPD / math.max(1, vmaxShow()), V.fallT) then
			figure("dauphin", tr("LE DAUPHIN !", "THE DOLPHIN!"), 3, 2)
		end
		if V.curNear and math.abs(V.curLat) < RH and V.curH > 2.2 and V.curH < 12 then
			local prox = 1 - (V.curH - 2.2) / 9.8
			V.chainVal += 14 * prox * prox * dt
		end
	end
	-- la mort en vol
	if V.fallTR > airMax() and pwA <= 0 and not intro then
		exploser("air")
	elseif fallPos.Y * M < piste.minY - Config.MORT_SOUS * M then
		exploser("vide")
	else
		-- on traverse le portail en volant : il compte aussi (même anneau que Construction.portail)
		local f = Piste.repere(piste, piste.len - 20 * M)
		local centre = f.Position + f.UpVector * (46 * M * 0.62)
		if (fallPos * M - centre).Magnitude < 46 * M then passerPortail() end
	end
end

-- ════════ LA CAMÉRA (L36096-36170, L36389) ════════
local menuCap = Vector3.new(0, 0, -1)
-- (la caméra de ROUTE, de VOL et de MORT est celle du jeu web d'aujourd'hui : Client/Camera)
KA.X = { repere = function(sM: number, face: number): CFrame return Piste.repereFace(piste, sM * M, face) end }
local function camera(dt: number)
	if cam.CameraType ~= Enum.CameraType.Scriptable then cam.CameraType = Enum.CameraType.Scriptable end
	local p = carCF.Position
	local fiche = poignees.fiche
	local t = os.clock()
	local sh, roulis = Vector3.zero, 0
	fovPunch = math.max(0, fovPunch - 18 * dt)
	if mode == "drive" then
		KA.X.carCF, KA.X.cf, KA.X.s, KA.X.L, KA.X.lat, KA.X.side, KA.X.psi, KA.X.vA = carCF, repere(s, side), s, piste.len / M, lat, side, psi, vA
		KA.X.kmh, KA.X.vCrois, KA.X.vitMult, KA.X.nitroOn, KA.X.bleue, KA.X.boost = kmh(), vmaxShow() * 1.55, vitMult(), nitroOn, nitroBleue, boost
		KA.X.steer, KA.X.flow, KA.X.punch, KA.X.l, KA.X.h = steerS, Score.niveau(), fovPunch, fiche.l, fiche.h
		KA.pos, KA.vise, KA.up, KA.fov = KA.Camera.route(dt, KA.X, KA.pos)
		sh, roulis = KA.Camera.secousseRoute(t, secousse, KA.X, vmaxShow())
		secousse = math.max(0, secousse - 3.5 * dt)
	elseif mode == "fall" then
		KA.V.carCF, KA.V.fallVel, KA.V.av, KA.V.haut, KA.V.fallT, KA.V.dtF = carCF, fallVel, flyAv, flyU, V.fallT, dt
		KA.V.nitroOn, KA.V.bleue, KA.V.punch, KA.V.l, KA.V.w, KA.V.h, KA.V.kmh = nitroOn, nitroBleue, fovPunch, fiche.l, fiche.w, fiche.h, kmh()
		KA.pos, KA.vise, KA.up, KA.fov = KA.Camera.vol(dt, KA.V, KA.pos)
		sh = KA.Camera.secousseVol(t, secousse, KA.V)
		secousse = math.max(0, secousse - 3 * dt)
	elseif mode == "boom" or mode == "mort" then
		KA.pos, KA.vise, KA.up, KA.fov = KA.Camera.mort(dt, boomPos, boomT, KA.pos)
		-- le tremblement de l'explosion : un sinus lisse sur la visée, qui retombe
		if secousse > 0 then
			local a9 = 0.09 * math.min(2.6, secousse) * M
			KA.vise += Vector3.new(math.sin(t * 47) * a9, math.sin(t * 37 + 1.3) * a9 * 0.8, 0)
			secousse = math.max(0, secousse - 3 * dt)
		end
	elseif KA.Titre.pret then -- le menu : L'ÉCRAN TITRE v3 (Client/Titre)
		local cfT, fovT = KA.Titre.vue(fiche)
		KA.pos, KA.vise, KA.up, KA.fov = cfT.Position, cfT.Position + cfT.LookVector * (50 * M), cfT.UpVector, fovT
		KA.Camera.etat.fov = fovT
		cam.FieldOfView = fovT
		cam.CFrame = cfT
		return
	else -- (le titre n'est pas encore prêt) la caisse à GAUCHE de l'écran, nez qui plonge vers la droite
		local av = Vector3.new(menuCap.X, 0, menuCap.Z).Unit
		local dr = av:Cross(Vector3.yAxis)
		-- (chuteRender du web) la vue est EN HAUTEUR (~20°) et plonge sur la caisse : la mer de nuages remplit l'écran
		-- sous l'horizon ; objectif de 46° ; la caisse à gauche, la colonne de boutons à droite
		local pos = p - av * (3 * M) + dr * (14.5 * M) + Vector3.yAxis * (5.4 * M)
		KA.pos = KA.pos:Lerp(pos, math.min(1, dt * 3))
		KA.vise = KA.vise:Lerp(p + av * (5.6 * M) - Vector3.yAxis * (0.5 * M), math.min(1, dt * 4))
		KA.up = Vector3.yAxis
		KA.fov += (46 - KA.fov) * math.min(1, dt * 6)
		KA.Camera.etat.fov = KA.fov
		secousse = math.max(0, secousse - 2.5 * dt)
	end
	-- (Roblox ne rend pas un champ de plus de 120°)
	cam.FieldOfView = math.clamp(KA.fov, 20, 120)
	if (KA.vise - KA.pos).Magnitude < 0.01 then KA.vise = KA.pos + Vector3.new(0, 0, -1) end
	local cfC = CFrame.lookAt(KA.pos + sh, KA.vise, KA.up)
	if roulis ~= 0 then cfC *= CFrame.Angles(0, 0, roulis) end
	cam.CFrame = cfC
end

-- ════════ la caisse, ses feux, ses sons ════════
local ARC_EN_CIEL = ColorSequence.new({ ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 60, 60)), ColorSequenceKeypoint.new(0.2, Color3.fromRGB(255, 190, 40)),
	ColorSequenceKeypoint.new(0.4, Color3.fromRGB(110, 255, 90)), ColorSequenceKeypoint.new(0.6, Color3.fromRGB(60, 220, 255)),
	ColorSequenceKeypoint.new(0.8, Color3.fromRGB(110, 90, 255)), ColorSequenceKeypoint.new(1, Color3.fromRGB(255, 70, 220)) })
local function habiller(dt: number)
	if mode == "boom" or mode == "mort" or mode == "charge" then return end
	racine.CFrame = carCF
	local feu = nitroOn or boost > 0 or NTR.boost > 0
	-- la couleur du feu (les teintes de la bible du web) : violet de la nitro infinie, bleu de la réserve, orange de la nitro, or du pad
	-- (la SIGNATURE de la caisse — le rose du chat pop-tart, l'eau du requin — ne vit qu'à la nitro, et passe après les deux signaux)
	local fxC = poignees.fiche and poignees.fiche.fx and poignees.fiche.fx.jet
	local couleur = (pwN > 0 and Color3.fromRGB(157, 77, 255)) or (nitroBleue and Color3.fromRGB(91, 125, 255))
		or (nitroOn and (fxC and Color3.fromHex(string.format("%06x", fxC)) or Color3.fromRGB(255, 122, 36))) or Color3.fromRGB(255, 215, 94)
	-- le départ en ARC-EN-CIEL : la teinte tourne pendant les 3 s offertes (la signature du LANCEMENT, pas de la caisse)
	if (G.departT or 0) > 0 and pwN <= 0 and not nitroBleue then couleur = Color3.fromHSV((os.clock() * 0.65) % 1, 0.8, 1) end
	-- la TRAÎNÉE de la boutique se pose par-dessus (nitro simple seulement : le violet, le bleu et l'or gardent leur sens)
	local arc: ColorSequence? = nil
	local tr9 = Config.habit("trainee", profil.porte and profil.porte.trainee)
	if tr9 and pwN <= 0 and not nitroBleue and nitroOn then
		if tr9.arcenciel then arc = ARC_EN_CIEL elseif tr9.c then couleur = tr9.c end
	end
	Caisse.feu(poignees, feu, nitroOn and 130 or (boost > 0 and 55 or 0), couleur, arc, (mode == "drive" or mode == "fall") and not intro and kmh() > 20)
	-- les AILES : rentrées dans le flanc au sol, sorties en vol ; les hélices brassent doucement au sol et s'emballent en vol
	G.ailes += (((mode == "fall" and not intro) and 1 or 0) - G.ailes) * math.min(1, dt * 6)
	G.helice += dt * (3.5 + G.ailes * 36)
	Caisse.deployer(poignees, G.ailes, G.helice)
	-- les roues tournent à leur vraie vitesse (v / R) ; en l'air elles gardent leur élan
	Caisse.rouler(poignees, vA * SPD * M * dt)
	KA.refletK += ((nitroOn and 1.6 or (boost > 0 and 0.9 or 0)) - KA.refletK) * math.min(1, dt * 8)
	reflet.Brightness = KA.refletK
	-- les boucles de son
	local k = kmh()
	local r = math.clamp(k / math.max(1, vmaxShow() * 1.55), 0, 1.6)
	local atelier = mode == "garage"
	Sons.regler("moteur", atelier and 0.05 or ((mode == "menu") and 0.12 or 0.32), 0.7 + r * 1.1 + (nitroOn and 0.1 or 0))
	Sons.regler("nitro", nitroOn and 0.45 or 0)
	Sons.regler("ventAltitude", atelier and 0 or ((mode == "fall") and math.min(0.7, 0.25 + fallVel.Magnitude * 0.004) or 0.08 + r * 0.1))
	Sons.regler("musique", 0.32)
end

-- ════════ le HUD ════════
local function hud(dt: number)
	E.argent.Text = '<font size="36">$</font>' .. Hud.nombre(argent)
	local res = reservoir()
	-- la barre et le bouton NITRO : la réserve du moteur, la réserve bleue à la suite, violets en NITRO INFINIE
	Hud.nitro(math.clamp(nitroR / res, 0, 1), math.clamp(nitroX / res, 0, 1), pwN > 0, nitroOn)
	if mode == "fall" and not intro then
		E.air.Visible = true
		local reste = pwA > 0 and 1 or math.clamp(1 - V.fallTR / airMax(), 0, 1)
		local sec = string.format("%.1f", math.max(0, airMax() - V.fallTR))
		if FR then sec = string.gsub(sec, "%.", ",") end
		Hud.air(reste, sec, pwA > 0)
	end
	-- les plaques des pouvoirs actifs, dans l'ordre fixe du web (l'œil apprend où regarder)
	local pw = {}
	for _, q in { { "n", pwN }, { "a", pwA }, { "v", pwV }, { "m", pwM }, { "x", pwX } } do
		if q[2] > 0 then table.insert(pw, q) end
	end
	Hud.pouvoirs(pw, E.air.Visible)
	if facile() and (mode == "drive" or mode == "fall") then
		E.coeurs.Visible = true
		E.coeurs.Text = string.rep("♥", G.coeurs) .. '<font color="#40385e">' .. string.rep("♥", math.max(0, FAC.coeurs - G.coeurs)) .. "</font>"
	else
		E.coeurs.Visible = false
	end
	HudScore.tick(dt, mode)
	Hud.tick()
end

-- ════════ les parties ════════
local S_CHUTE, H_CHUTE = 150, 220 -- la caisse tombe au-dessus du point à 150 m, de 220 m de haut
local function poserAuDepart()
	s, lat, side, psi = S_CHUTE, 0, 1, 0
	local cf = repere(s, 1)
	local lk = cf.LookVector
	menuCap = Vector3.new(lk.X, 0, lk.Z).Unit
	local pos = cf.Position + Vector3.new(0, H_CHUTE * M, 0)
	menuRot = (CFrame.lookAt(pos, pos + menuCap) * CFrame.Angles(-math.rad(38), 0, 0)).Rotation
	carCF = CFrame.new(pos) * menuRot
end

local function allerMenu()
	mode = "menu"
	Score.ETAT.enCours = false
	enPause = false
	zoneN = 1
	remettreObjets(ZONES[1])
	activer(ZONES[1])
	-- les zones lointaines de la partie finie rendent leur place (leurs maillages, leurs tours) : la 1 et la 2 suffisent pour repartir
	for z, x in ZONES do
		if z > 2 and x.pret then oublier(z) end
	end
	poserAuDepart()
	montrerCaisse(true)
	KA.pos = carCF.Position + Vector3.yAxis * (10 * M) + menuCap:Cross(Vector3.yAxis) * (20 * M)
	KA.vise = carCF.Position
	KA.Titre.montrer(true)
	Bus.emit("menu")
	Hud.ecran("menu")
	E.menuRecord.Text = record > 0 and (T.record .. " " .. Hud.argent(record)) or ""
	evEtat:FireServer("course", false)
end

local function nouvellePartie()
	-- la leçon tant qu'elle n'a pas été passée (ou sautée) : la piste d'école est la zone 0
	local ecole = profil.reglages ~= nil and profil.reglages.tuto == false and ZONES[0] ~= nil and ZONES[0].pret
	TU.on = ecole
	TU.vers(1)
	TU.rates, TU.pause, TU.msg, TU.msgT, TU.vraiment = 0, 0, nil, 0, 0
	E.coach.Visible = false
	zoneN = ecole and 0 or 1
	KA.Titre.montrer(false)
	remettreObjets(ZONES[zoneN])
	activer(ZONES[zoneN])
	for z, x in ZONES do
		if z > 2 and x.pret then oublier(z) end -- (REJOUER depuis une zone lointaine : elle rend sa place)
	end
	preparer(2, Piste.suite(ZONES[1].piste :: Piste.Piste))
	poserAuDepart()
	vA, yawR, steerS, momT, boost, G.padCd, G.padN, G.padSL = 0, 0, 0, 0, 0, 0, 0, nil
	coinsGot, tier, combo, G.comboT = 0, 0, 0, 0
	nitroR, nitroX, nitroOn, nitroBleue = reservoir(), 0, false, false
	NTR.on, NTR.t, NTR.pal, NTR.boost, NTR.k, NTR.kc = false, 0, 0, 0, 0, 0
	G.pureT, G.pureArmed, G.pureNext, G.pureLvl = 0, true, 0, 0
	argent, aura = Config.CASH_DEPART, 0
	pwN, pwA, pwV, pwM, pwX = 0, 0, 0, 0, 0
	G.idleT, G.idleMsg, graceT = 0, 0, 0
	G.departT = 0
	G.distAvant, G.vmax, G.serie, G.nbZones = 0, 0, 0, 0
	G.driftOn, G.driftC, G.driftLv, G.driftCd, G.slipB, G.slipT, G.oilCd = false, 0, 0, 0, 0, 0, 0
	G.virT, G.virC, G.virD, G.virPaye, G.frondeCd, G.raseT, G.raseAnn, G.froleN, G.froleT = 0, 0, false, false, 0, 0, false, 0, 0
	G.carRoll, G.rollV, G.levreY, secousse, fovPunch = 0, 0, 0, 0, 0
	stats.pieces, stats.poses, stats.parfaites, stats.fruits, stats.nitro, stats.duree, stats.chaine, stats.figures = 0, 0, 0, 0, 0, 0, 0, 0
	G.tempsDepart = 0
	G.fruitRaf, G.fruitRafT = 0, 0
	G.hopY, G.hopV, G.choc = 0, 0, 0
	G.coeurs = FAC.coeurs
	G.safeS = S_CHUTE
	G.lgS, G.lgK, G.lgV, G.lgAcc = 240, 0, 0, 20
	for _, v in volants do v.p.Parent = nil end
	table.clear(volants)
	Score.debut(meilleurAura, profil.frenRec or 0)
	HudScore.raz()
	Missions.debut()
	Bus.emit("partie")
	E.air.Visible = false
	montrerCaisse(true)
	enPause = false
	Hud.ecran("course")
	evEtat:FireServer("course", true)
	-- la CHUTE : la caisse plonge du ciel (la pose du menu) et se pose sur la route — c'est le départ
	intro = true
	fallPos = carCF.Position / M
	fallVel = menuCap * 6 - Vector3.new(0, 60, 0) -- presque à la verticale : elle se pose PILE sur la route dessous
	prevPos = fallPos
	flyAv = fallVel.Unit
	flyU = (menuCap - flyAv * menuCap:Dot(flyAv)).Unit -- le toit regarde vers l'avant : le nez plonge
	V.fallT, V.fallTR, V.yawAcc, V.demiTours, V.nitroAirT, V.nitroAirTenue, V.sideCd, V.bounceN = 0, 0, 0, 0, 0, 0, 0, 0
	V.fallVH0 = horiz(fallVel)
	V.bascOn, V.bascDir, V.airRoll, V.nAirTenu, V.kickT = false, 1, 0, false, 0
	V.fallUnder, V.fallStartSide, V.flowS0, V.flowP0 = false, 1, s, fallPos
	V.chainVal, V.chainMult, V.chainN, V.bigA, V.monstre = 0, 1, 0, false, false
	table.clear(vus)
	V.sDecol = s
	sPrev, latPrev = s, lat
	mode = "fall"
	Score.ETAT.mode = "fall"
	if zone.ciel then zone.ciel.Parent = zone.dossier end -- les nuages du niveau reviennent avec la course
	Sons.jouer("decollage")
	Bus.emit("decollage", intro)
end

local function finPartie()
	mode = "mort"
	aura = Score.fin(false)
	local dist = G.distAvant + math.max(0, s)
	local rec = argent > record and argent > Config.CASH_DEPART + 0.01
	local mres = Missions.fin(CPT)
	evFin:FireServer(argent, dist, aura, { pieces = stats.pieces, figures = stats.poses, kmh = G.vmax, zone = G.nbZones + 1, tier = tier,
		multi = Score.CHA.xMax, cause = causeMort, parfaites = stats.parfaites, fruits = stats.fruits, nitro = stats.nitro,
		duree = stats.duree, chaine = stats.chaine, frenMax = Score.FREN.max, frenRec = Score.FREN.record, mis = mres.meilleur })
	if rec then record = argent end
	meilleurAura = math.max(meilleurAura, aura)
	local cause = T.morts[causeMort] or T.morts.autre
	E.mCause.Text = rec and T.nouveau or cause
	Hud.tenir(E.mCauseEchelle, E.mCause.Text, 62, 560)
	E.mRecord.Text = rec and (FR and "RECORD !" or "RECORD!") or ""
	E.mRecord.Visible = rec
	E.mCompte.Text = T.compte .. " " .. Hud.argent(compte + math.max(0, argent - Config.CASH_DEPART))
	E.mAura.Text = Hud.entier(aura)
	Hud.tenir(E.mAuraEchelle, E.mAura.Text, 78, 250)
	E.mAuraMeilleur.Text = T.meilleur .. " " .. Hud.entier(meilleurAura)
	E.mMoteurNom.Text = Hud.sansAccent(MOT[tier + 1].nom)
	Hud.tenir(E.mMoteurNomEchelle, E.mMoteurNom.Text, 20, 270)
	E.mMoteurPalier.Text = T.palier .. '  <font size="46">' .. tier .. "</font>"
	if tier < #MOT - 1 then
		E.mMoteurEncore.Text = string.format(T.encore, MOT[tier + 2][1] - coinsGot) .. "\n↑ " .. Hud.sansAccent(MOT[tier + 2].nom)
	else
		E.mMoteurEncore.Text = T.moteurMax
	end
	E.mPartie.Text = (rec and (cause .. "\n") or "") .. T.distance .. "  " .. Hud.entier(dist) .. " M   " .. T.pieces .. "  " .. stats.pieces
		.. "   " .. T.figures .. "  " .. stats.poses
	Hud.defi(mres.carte)
	local st = {
		{ "x" .. Score.CHA.xMax, T.multiMax },
		{ Hud.entier(G.vmax), T.kmhMax }, { tostring(G.nbZones + 1), T.zone }, { Score.mmss(Score.FREN.max), T.frenesie },
	}
	for i, v in st do
		E.mStats[i][1].Text = v[1]
		E.mStats[i][2].Text = v[2]
	end
	Hud.ecran("mort")
	Bus.emit("fin", { argent = argent, aura = aura, distance = dist, pieces = stats.pieces, figures = stats.poses,
		kmh = G.vmax, zone = G.nbZones + 1, tier = tier, multi = Score.CHA.xMax, cause = causeMort, record = rec })
	-- le montant s'égrène (750 ms), puis se pose
	local cible = math.max(0, argent - Config.CASH_DEPART) -- on ne verse que les GAINS, jamais la mise de 1,61 $
	task.spawn(function()
		local t0 = os.clock()
		while os.clock() - t0 < 0.75 do
			local u = (os.clock() - t0) / 0.75
			E.mArgent.Text = Hud.argent(cible * (1 - (1 - u) ^ 3))
			Hud.tenir(E.mArgentEchelle, E.mArgent.Text, 100, 560)
			task.wait()
		end
		E.mArgent.Text = Hud.argent(cible)
		Hud.tenir(E.mArgentEchelle, E.mArgent.Text, 100, 560)
		Sons.jouer(rec and "record" or "compteFin")
	end)
end

-- les boutons
-- JOUER : à la toute première partie, on demande d'abord FACILE ou NORMAL (facChoix, L5807)
local function reglage(cle: string, valeur: any)
	profil.reglages = profil.reglages or {}
	profil.reglages[cle] = valeur
	task.spawn(function() pcall(function() fnAction:InvokeServer("reglage", cle, valeur) end) end)
end
local apresChoix: (() -> ())? = nil
local function jouer(suite: () -> ())
	if Config.FACILE_ACTIF and profil.reglages and profil.reglages.facileChoisi == false then
		apresChoix = suite
		E.choix.Visible = true
		return
	end
	suite()
end
local function choisir(oui: boolean)
	reglage("facile", oui)
	reglage("facileChoisi", true)
	E.choix.Visible = false
	local f = apresChoix
	apresChoix = nil
	if f then f() end
end
E.btPasser.Activated:Connect(function()
	if not TU.on then return end
	-- PASSER : si le permis n'a jamais été payé, on demande d'abord (« VRAIMENT ? », 3 s)
	if not profil.permis and os.clock() > TU.vraiment then
		TU.vraiment = os.clock() + 3
		TU.dire(tr("PERMIS +$500", "LICENSE +$500"))
		TU.carte()
		return
	end
	TU.fin(true)
end)
E.btFacileOui.Activated:Connect(function() choisir(true) end)
E.btFacileNon.Activated:Connect(function() choisir(false) end)
function G.jouerMenu()
	if mode ~= "menu" or KA.Titre.enPique() then return end
	jouer(function()
		if not KA.Titre.pret then
			nouvellePartie()
			return
		end
		-- JOUER : la caisse du titre PIQUE (1,75 s), le voile blanc monte, et la course démarre dessous
		Hud.ecran("vide")
		Sons.jouer("decollage")
		KA.Titre.lancer(function() if mode == "menu" then nouvellePartie() end end)
	end)
end
E.btJouer.Activated:Connect(G.jouerMenu)
-- ── LE GARAGE : parcourir, acheter, équiper (voir Client/Garage) ──
local function ouvrirGarage()
	if mode ~= "menu" then return end
	mode = "garage"
	Hud.ecran("garage")
	Garage.ouvrir(profil.caisse)
end
Garage.init({
	profil = function() return profil end,
	-- une demande au serveur : il vérifie, il rend le profil à jour
	action = function(nom: string, ...: any): (boolean, string?)
		local ok, res, msg, p = pcall(function(...) return fnAction:InvokeServer(nom, ...) end, ...)
		if not ok then return false, "erreur" end
		if type(p) == "table" then lireProfil(p) end
		return res == true, msg
	end,
	surEquipe = function(i: number)
		if poignees.indice ~= i then changerCaisse(i) end
	end,
	surHabit = function() changerCaisse(profil.caisse or 0) end, -- la peinture ou les ailes ont changé : on rebâtit la mienne
	surHome = function()
		Garage.fermer()
		allerMenu()
	end,
	surJouer = function()
		Garage.fermer()
		allerMenu()
		jouer(nouvellePartie)
	end,
	surReglages = function() Hud.ecran("reglages") end,
	surBoutique = function()
		Garage.vignettes(false) -- le garage prête sa place à la vitrine
		G.boutique.ouvrir("garage")
	end,
})
E.btGarage.Activated:Connect(ouvrirGarage)
-- ── LES MISSIONS : le carnet ouvert, ses trois défis, sa récompense (voir Client/Missions) ──
Missions.init({
	profil = function() return profil end,
	action = function(nom: string, ...: any): (boolean, string?)
		local ok, res, msg, p = pcall(function(...) return fnAction:InvokeServer(nom, ...) end, ...)
		if not ok then return false, "erreur" end
		if type(p) == "table" then
			-- (le serveur rend le profil : on garde ce que la partie en cours a déjà coché, sa réponse peut arriver en retard)
			local m = profil.mis
			lireProfil(p)
			if m and p.mis and m.n == p.mis.n then
				for i = 1, 3 do
					if m.ok[i] then p.mis.ok[i] = true end
				end
			end
		end
		return res == true, msg
	end,
	surHome = function()
		Missions.fermer()
		Hud.ecran("menu")
	end,
	surJouer = function()
		Missions.fermer()
		if mode == "menu" then jouer(nouvellePartie) end
	end,
})
E.btMissions.Activated:Connect(function()
	if mode ~= "menu" then return end
	Hud.ecran("missions")
	Missions.ouvrir()
end)
E.btCarriere.Activated:Connect(function() if mode == "menu" then Hud.toast(T.bientot) end end)
-- LA BOUTIQUE : une vitrine (rien ne se vend encore) ; RETOUR ramène à l'écran d'où l'on vient
G.boutique = require(CL:WaitForChild("Boutique"))
G.boutique.init({ retour = function(d: string)
	if d == "garage" then Garage.vignettes(true) else Hud.ecran(d) end
end })
E.btBoutique.Activated:Connect(function() if mode == "menu" then G.boutique.ouvrir("menu") end end)
E.btBoutiqueM.Activated:Connect(function() if mode == "mort" then G.boutique.ouvrir("mort") end end)
Hud.surMenu = function() Hud.pastilles(Missions.faits()) end
E.btRejouer.Activated:Connect(function() if mode == "mort" then nouvellePartie() end end)
-- (mise au point) "DbgJouer" : lancer une partie depuis la console ou le banc à distance — du menu ou de l'écran de fin, l'auto-école passée
workspace:GetAttributeChangedSignal("DbgJouer"):Connect(function()
	if mode == "menu" or mode == "mort" then nouvellePartie() end
	task.delay(1.5, function() if TU.on then TU.fin(true) end end)
end)
E.btMenuM.Activated:Connect(function() if mode == "mort" then allerMenu() end end)
local function basculerPause()
	if mode ~= "drive" and mode ~= "fall" then return end
	enPause = not enPause
	Hud.ecran(enPause and "pause" or "course")
end
Controles.surPause = basculerPause
E.btPause.Activated:Connect(basculerPause)
local retourReglages = "menu"
E.btReglages.Activated:Connect(function() if mode == "menu" then retourReglages = "menu"; Hud.ecran("reglages") end end)
E.btReglM.Activated:Connect(function() if mode == "mort" then retourReglages = "mort"; Hud.ecran("reglages") end end)
-- (mise au point) "DbgOuvre" : ouvrir un écran du menu depuis la console ou le banc à distance — "garage", "boutique",
-- "reglages", "missions", "menu" (le retour) ; pour comparer chaque écran à la capture du jeu web sans toucher à la souris
workspace:GetAttributeChangedSignal("DbgOuvre"):Connect(function()
	local v = tostring(workspace:GetAttribute("DbgOuvre") or "")
	if v == "pause" then
		basculerPause() -- (en course : la pause s'ouvre, ou se referme)
	elseif v == "jouer" then
		G.jouerMenu() -- (le vrai JOUER du menu : le piqué du titre, puis la course)
	elseif string.sub(v, 1, 7) == "portail" then
		-- (banc) saute au pied du portail : pour voir un changement de niveau sans rouler toute la zone
		if mode == "drive" then
			s = piste.len / M - 70
			sPrev = s
			lat = 0
		end
	elseif v == "frenesie" then
		if mode == "drive" or mode == "fall" then Score.dbgFren() end
	elseif v == "menu" then
		if mode == "garage" then Garage.fermer() end
		G.boutique.fermer()
		Missions.fermer()
		if mode == "menu" or mode == "garage" or mode == "mort" then allerMenu() end
	elseif mode ~= "menu" then
		return
	elseif v == "garage" then
		ouvrirGarage()
	elseif v == "boutique" then
		G.boutique.ouvrir("menu")
	elseif v == "reglages" then
		retourReglages = "menu"
		Hud.ecran("reglages")
	elseif v == "missions" then
		Hud.ecran("missions")
		Missions.ouvrir()
	end
end)
E.btReprendre.Activated:Connect(function()
	if enPause then basculerPause()
	elseif Hud.ecranCourant() == "reglages" then Hud.ecran(mode == "garage" and "garage" or retourReglages) end
end)
E.btRecom.Activated:Connect(function() if enPause then enPause = false; Score.fin(false); nouvellePartie() end end)
E.btMenuP.Activated:Connect(function() if enPause then enPause = false; Score.fin(false); allerMenu() end end)
-- LES RÉGLAGES : une seule vérité, le PROFIL (gardé par le serveur d'une partie à l'autre) — Sons, Controles et Hud la recopient
-- (avant, SON et MUSIQUE n'étaient jamais enregistrés : ils revenaient sur ON à chaque partie)
do -- (un bloc : le corps du pilote frôle la limite des 200 variables locales)
	local RG = profil.reglages or {}
	Sons.actif = RG.son ~= false
	Sons.musiqueActive = RG.musique ~= false
	Sons.volSon = (RG.volSon or 100) / 100
	Sons.volMus = (RG.volMus or 62) / 100
	Controles.sensVol = (RG.volH == "monte") and -1 or 1
	Hud.vib = RG.vib ~= false
end
local function majBoutonsSon()
	E.btFacile.Text = T.facile .. (facile() and " ON" or " OFF")
	E.btSonP.Text = T.son .. (Sons.actif and " ON" or " OFF")
	E.btMusP.Text = T.musique .. (Sons.musiqueActive and " ON" or " OFF")
	Hud.reglage("son", Sons.actif)
	Hud.reglage("musique", Sons.musiqueActive)
	Hud.reglage("facile", facile())
	Hud.reglage("vib", Hud.vib)
	Hud.volume("volSon", Sons.volSon * 100, Sons.actif)
	Hud.volume("volMus", Sons.volMus * 100, Sons.actif and Sons.musiqueActive)
	Hud.valeur("volH", (Controles.sensVol < 0) and T.monte or T.plonge)
	E.btPouceP.Text = T.pouce .. " : " .. ((Controles.sensVol < 0) and T.monte or T.plonge)
end
function G.basculeSon()
	Sons.actif = not Sons.actif
	reglage("son", Sons.actif)
	majBoutonsSon()
end
function G.basculeMusique()
	Sons.musiqueActive = not Sons.musiqueActive
	reglage("musique", Sons.musiqueActive)
	majBoutonsSon()
end
-- l'écran des RÉGLAGES (les mêmes interrupteurs que la pause : une seule vérité, Sons et le profil)
E.rgRetour.Activated:Connect(function()
	if Hud.ecranCourant() == "reglages" then Hud.ecran(mode == "garage" and "garage" or retourReglages) end
end)
E.rg.son.b.Activated:Connect(G.basculeSon)
E.rg.musique.b.Activated:Connect(G.basculeMusique)
-- les CURSEURS : le son suit le doigt, le profil n'est écrit qu'au lâcher
E.rg.volSon.surChange = function(v: number, fin: boolean)
	Sons.volSon = v / 100
	majBoutonsSon()
	if fin then reglage("volSon", v) end
end
E.rg.volMus.surChange = function(v: number, fin: boolean)
	Sons.volMus = v / 100
	majBoutonsSon()
	if fin then reglage("volMus", v) end
end
-- POUCE HAUT EN VOL : PLONGE ⇄ MONTE (volhBascule du web)
function G.basculePouce()
	Controles.sensVol = -Controles.sensVol
	reglage("volH", (Controles.sensVol < 0) and "monte" or "plonge")
	majBoutonsSon()
end
E.rg.volH.b.Activated:Connect(G.basculePouce)
E.btPouceP.Activated:Connect(G.basculePouce)
E.rg.vib.b.Activated:Connect(function()
	Hud.vib = not Hud.vib
	reglage("vib", Hud.vib)
	majBoutonsSon()
	Hud.vibre(30) -- (on sent tout de suite ce qu'on vient d'allumer)
end)
if E.rg.facile then
	E.rg.facile.b.Activated:Connect(function()
		reglage("facile", not facile())
		reglage("facileChoisi", true)
		majBoutonsSon()
	end)
end
E.rg.tuto.b.Activated:Connect(function()
	reglage("tuto", false) -- la leçon revient à la prochaine partie
	Hud.toast(tr("L'AUTO-ECOLE REVIENT A LA PROCHAINE PARTIE", "DRIVING SCHOOL IS BACK NEXT RUN"), Hud.C.vert)
end)
E.btSonP.Activated:Connect(G.basculeSon)
E.btMusP.Activated:Connect(G.basculeMusique)
E.btFacile.Activated:Connect(function()
	reglage("facile", not facile())
	reglage("facileChoisi", true)
	majBoutonsSon()
end)
majBoutonsSon()
E.btFacile.Parent.Visible = Config.FACILE_ACTIF

-- ════════ les autres caisses : un double chez moi, lissé ; on ne voit que celles qui roulent dans NOTRE zone ════════
type Double = { m: Model, c: Model, vu: boolean?, pg: any, ind: number, cle: string }
local doubles: { [Model]: Double } = {}
local function lisserDoubles(dt: number)
	for m, d in doubles do
		if not m.Parent then
			Caisse.rendre(d.c)
			doubles[m] = nil
		elseif d.vu and m.PrimaryPart then
			d.c.PrimaryPart.CFrame = d.c.PrimaryPart.CFrame:Lerp(m.PrimaryPart.CFrame, math.min(1, dt * 10))
		end
	end
end
task.spawn(function()
	while true do
		for _, m in dossierCaisses:GetChildren() do
			if m ~= caisseServeur and m:IsA("Model") and m.PrimaryPart then
				local d = doubles[m]
				if not d then
					cacher(m)
					local ind = m:GetAttribute("Caisse") or 0
					local porte = { peinture = m:GetAttribute("Peinture"), aile = m:GetAttribute("Aile"), trainee = m:GetAttribute("Trainee") }
					local c, pg = Caisse.construire("Autre", ind, true, porte)
					c:PivotTo(m.PrimaryPart.CFrame)
					c.Parent = workspace
					d = { m = m, c = c, pg = pg, ind = ind, cle = tostring(porte.peinture) .. tostring(porte.aile) }
					doubles[m] = d
				elseif d.ind ~= (m:GetAttribute("Caisse") or 0) or d.cle ~= tostring(m:GetAttribute("Peinture")) .. tostring(m:GetAttribute("Aile")) then
					-- il a changé de caisse au garage : on redessine son double
					Caisse.rendre(d.c)
					doubles[m] = nil
					continue
				end
				local voir = m:GetAttribute("EnCourse") == true and (m:GetAttribute("Zone") or 1) == zoneN
				if d.vu ~= voir then
					d.vu = voir
					for _, p in d.c:GetDescendants() do
						if p:IsA("BasePart") then p.LocalTransparencyModifier = voir and 0 or 1 end
					end
					if voir then d.c.PrimaryPart.CFrame = m.PrimaryPart.CFrame end
				end
				local nitro = voir and m:GetAttribute("Nitro") == true
				Caisse.feu(d.pg, nitro, nitro and 110 or 0, Color3.fromRGB(255, 122, 36))
			end
		end
		task.wait(0.25)
	end
end)

-- ════════ ce que les systèmes peuvent lire et faire (voir Client/Bus) ════════
Bus.etat = function()
	return {
		mode = mode, pause = enPause, intro = intro, s = s, lat = lat, side = side, RH = RH, psi = psi,
		steer = steerS, yawR = yawR, vA = vA, kmh = kmh(), vmax = vmaxShow(), nitroOn = nitroOn, nitroR = nitroR,
		reservoir = reservoir(), tier = tier, argent = argent, aura = aura, fallT = V.fallT, fallTR = V.fallTR,
		zone = zoneN, figures = stats.figures, carCF = carCF, chainMult = V.chainMult, chainVal = V.chainVal, frein = Controles.frein,
		driftOn = G.driftOn, driftLv = G.driftLv, nuage = ((mode == "drive" or mode == "fall") and G.nuageIn) or 0,
		ntr = NTR, infini = pwN > 0, fiche = poignees.fiche, bleue = nitroBleue, boost = boost,
	}
end
Bus.agir.encaisser = encaisser
-- LES EFFETS écoutent le bus (étincelles, gerbes, explosion, billets, jus) : rien d'autre à leur dire
require(CL:WaitForChild("Effets")).init({ compteur = E.argent })
do
	local okC, errC = pcall(function() require(CL:WaitForChild("MoteurCarte")).init() end)
	G.carteMoteur = okC
	if not okC then warn("[CashCar] carte moteur : " .. tostring(errC)) end
	-- LES TROIS HEURES du niveau (matin · midi · après-midi dorée) : elles écoutent le bus (partie, portail, menu)
	local okH, errH = pcall(function() require(CL:WaitForChild("Ambiance")).init() end)
	if not okH then warn("[CashCar] ambiance : " .. tostring(errH)) end
	-- LE DRAGON de NITROOO : il lit l'état du bus (ntr, infini, fiche), rien d'autre à lui dire
	local okD, errD = pcall(function() require(CL:WaitForChild("Dragon")).init() end)
	if not okD then warn("[CashCar] dragon : " .. tostring(errD)) end
	-- LE BANC DE DAUPHINS : il lit Score.DOL et l'état du bus
	local okB, errB = pcall(function() require(CL:WaitForChild("Dauphins")).init() end)
	if not okB then warn("[CashCar] dauphins : " .. tostring(errB)) end
	-- LE SERPENT du SNAKE LOOP : il écoute la pose
	local okS, errS = pcall(function() require(CL:WaitForChild("Serpent")).init() end)
	if not okS then warn("[CashCar] serpent : " .. tostring(errS)) end
end
Bus.agir.secousse = function(x: number) secousse = math.max(secousse, x) end
Bus.agir.fov = function(d: number) fovPunch = math.max(fovPunch, d) end
Bus.agir.nitro = function(x: number) nitroGain(x) end
Bus.agir.vitesse = function(dv: number) vA += dv end
Bus.agir.boost = function(t: number) boost = math.max(boost, t) end
Bus.agir.pieces = function(n: number) ajouterPieces(n) end
Bus.agir.exploser = function(cause: string) exploser(cause) end

-- ════════ LA BOUCLE ════════
RunService:BindToRenderStep("CashCar", Enum.RenderPriority.Camera.Value + 1, function(dtBrut)
	local dt = math.min(dtBrut, 1 / 20)
	Controles.lire()
	-- (mise au point, depuis la console de Studio) workspace:SetAttribute("DbgAuto", true) : un pilote automatique tient le
	-- milieu de la route ; "DbgNitro" : il tient la nitro. Rien de tout ça n'existe pour un joueur.
	if mode == "drive" and workspace:GetAttribute("DbgAuto") then Controles.volant = math.clamp(-(lat * 0.06 + psi * 2.2), -1, 1) end
	if workspace:GetAttribute("DbgNitro") then Controles.nitro = true end
	if workspace:GetAttribute("DbgInf") then pwN = math.max(pwN, 1) end -- "DbgInf" : la nitro infinie (pour regarder le dragon grandir)
	if workspace:GetAttribute("DbgPlein") then nitroR = reservoir() end   -- "DbgPlein" : le plein à chaque image, sans le pouvoir (le dragon de FEU)
	if mode == "charge" then return end
	-- LE RALENTI de la frénésie : le seul ralenti du jeu
	if mode == "drive" or mode == "fall" then dt = Score.ralentiDt(dt, enPause) end
	if not enPause then
		if mode == "drive" or mode == "fall" then
			G.tempsDepart += dt
			stats.duree += dt
			graceT -= dt
			G.padCd -= dt
			-- les pouvoirs : l'AIRTIME ne s'use qu'au quart au sol
			local enVol0 = mode == "fall"
			local aAvant = pwA
			pwN, pwV, pwM, pwX = math.max(0, pwN - dt), math.max(0, pwV - dt), math.max(0, pwM - dt), math.max(0, pwX - dt)
			pwA = math.max(0, pwA - dt * (enVol0 and 1 or 0.25))
			if aAvant > 0 and pwA <= 0 and enVol0 then V.fallT, V.fallTR = 0, 0 end -- il s'éteint EN VOL : une jauge neuve
			Score.ETAT.auraX2 = pwX > 0
			G.comboT -= dt
			if G.comboT <= 0 then combo = 0 end
			if mode == "drive" then etapeSol(dt) else etapeAir(dt) end
			if mode == "drive" or mode == "fall" then
				objets(dt, carCF.Position, os.clock())
				-- LES NUAGES : ils ne font que BLOQUER LA VUE ; un banc percuté au sol éclate, le percer à l'aveugle paie du flow
				do
					local kN, quoi = KA.Nuages.suivre(zone.nuages or {}, carCF.Position, cam.CFrame.Position, mode == "drive", kmh(), dt)
					G.nuageIn = kN
					if kN > 0 then secousse = math.max(secousse, ((mode == "fall") and 0.1 or 0.07) * kN) end
					if quoi then
						Bus.emit("nuage", quoi, kN)
						if quoi == "defonce" then Score.flowAdd(3, "style", "n") elseif quoi == "percee" then Score.flowAdd(7, "risque", "n") end
					end
				end
				nitroooTick(dt)
				G.vmax = math.max(G.vmax, kmh())
			end
			Score.flowTick(dt, mode, vitN(), nitroOn)
			Score.chaineTick(dt, mode)
			aura = Score.aura()
			-- les missions relisent les compteurs de la partie
			CPT.pieces, CPT.fruits, CPT.gains, CPT.poses, CPT.parfaites = stats.pieces, stats.fruits, argent - Config.CASH_DEPART, stats.poses, stats.parfaites
			CPT.kmh, CPT.zones, CPT.duree, CPT.chaine, CPT.nitro = G.vmax, G.nbZones, stats.duree, stats.chaine, stats.nitro
			-- (les missions et la leçon ne doivent JAMAIS pouvoir arrêter la partie : une erreur les coupe, la course continue)
			if mode == "drive" or mode == "fall" then
				local okM, errM = pcall(Missions.tick, dt, CPT)
				if not okM then warn("[CashCar] missions : " .. tostring(errM)) end
			end
			if TU.on and not intro then
				local okT, errT = pcall(TU.tick, dt)
				if not okT then
					warn("[CashCar] auto-école : " .. tostring(errT))
					TU.on = false
					E.coach.Visible = false
				end
			end
			Bus.emit("tick", dt)
		elseif mode == "boom" then
			boomT += dt
			secousse = math.max(secousse, boomT < 0.1 and 1.2 or 0)
			if boomT > 1.8 then finPartie() end
		elseif mode == "menu" or mode == "garage" then
			-- la caisse PIQUE sur place : un souffle qui la berce
			local t = os.clock()
			if KA.Titre.pret then
				-- L'ÉCRAN TITRE v3 : la caisse tombe très haut dans le ciel, entre les cumulus ; JOUER la fait piquer
				carCF = KA.Titre.caisse(dt, function(k: number) if k > 0 then HudScore.flash("#ffffff", k) end end)
			else
				local pos = repere(S_CHUTE, 1).Position + Vector3.new(0, H_CHUTE * M + math.sin(t * 1.1) * 0.5 * M, 0)
				carCF = CFrame.new(pos) * menuRot * CFrame.Angles(math.sin(t * 0.8) * 0.03, 0, math.sin(t * 1.3) * 0.02)
			end
		end
		-- les éclats de l'explosion
		if #eclats > 0 then
			for i = #eclats, 1, -1 do
				local e = eclats[i]
				e.v *= (1 - math.min(1, dt * (e.t == 1 and 2.5 or 0.6)))
				e.v -= Vector3.new(0, (e.t == 1 and 2 or 12) * M * dt, 0)
				e.p.CFrame = (e.p.CFrame + e.v * dt) * CFrame.Angles(e.r.X * dt, e.r.Y * dt, e.r.Z * dt)
				if e.t == 1 then
					e.p.Size += Vector3.new(1, 1, 1) * (dt * 1.5 * M)
					e.p.Transparency = math.min(1, e.p.Transparency + dt * 0.45)
				end
				if e.p.Transparency >= 1 or boomT > 4 or mode == "menu" or mode == "drive" or mode == "fall" then
					e.p:Destroy()
					table.remove(eclats, i)
				end
			end
		end
		habiller(dt)
		if mode == "garage" then Garage.rendu(dtBrut) else camera(dt) end
		local vue = workspace:GetAttribute("DbgVue") -- (mise au point) une vue imposée depuis la console de Studio
		if vue then
			cam.CFrame = vue
			cam.FieldOfView = workspace:GetAttribute("DbgFov") or 90
		end
		Mer.montrer(mode == "menu" or mode == "garage" or (piste :: any).niveau == "nuages")
		Mer.suivre(cam.CFrame.Position, carCF.Position.Y, dt, (mode == "menu" or mode == "garage") and Config.CIEL.merMenu * M or nil)
		KA.Espace.tick(dt, (piste :: any).niveau == "espace" and mode ~= "menu" and mode ~= "garage", cam.CFrame, carCF)
		do
			local var, enJeu = (piste :: any).variante, mode ~= "menu" and mode ~= "garage" and mode ~= "charge"
			local course = mode == "drive" or mode == "fall"
			-- la pluie : la VILLE, MINUIT EN VILLE (moitié moins : pluie 0,55) et L'ORAGE
			KA.Ville.pluie(enJeu and ((piste :: any).niveau == "ville" or var == "orage"), cam.CFrame, (var == "nuit") and 0.55 or 1)
			-- MINUIT EN VILLE : pleins phares (ceux de la caisse au maximum, les faisceaux, la lampe qui court devant)
			local minuit = var == "nuit" and course
			if G.minuit ~= minuit then
				G.minuit = minuit
				local ph = poignees.phares
				if ph then
					ph.Brightness = minuit and 5.2 or 2
					ph.Angle = minuit and 80 or 70
					ph.Color = minuit and Color3.fromRGB(224, 242, 255) or Color3.fromRGB(255, 236, 200)
				end
			end
			KA.Ville.phares(minuit, carCF, poignees.fiche.w * 0.5, poignees.fiche.l or 4.4)
			-- L'ORAGE : l'éclair qui montre la route, le tonnerre qui secoue
			local sk = KA.Orage.tick(dt, var == "orage" and course and not enPause, piste, s, carCF.Position / M)
			if sk > 0 then secousse = math.max(secousse, sk) end
			if course and not enPause then G.satHard() end
			if not enPause then G.debTick(dt, cam.CFrame) end
		end
		-- les nuages PROCHES reçoivent leur version fine ; hors de la course, tout est rendu au budget (voir Nuages.finesseTick)
		KA.Nuages.finesseTick(dtBrut, (mode == "drive" or mode == "fall" or mode == "menu") and cam.CFrame.Position or nil)
		lisserDoubles(dt)
		KA.envoiT -= dtBrut
		if KA.envoiT <= 0 and (mode == "drive" or mode == "fall") then
			KA.envoiT = 1 / 15
			evPos:FireServer(carCF)
		end
	end
	hud(dt)
end)

-- ════════ le démarrage : on bâtit la zone 1 derrière l'écran de chargement ════════
do
Mer.creer(graine)
local z1 = preparer(1, nil)
local t0 = os.clock()
while not z1.pret do
	E.chargeTxt.Text = T.chargement .. string.rep(".", math.floor((os.clock() - t0) * 3) % 4)
	task.wait(0.1)
end
-- la mer de nuages se peint pendant le chargement (au plus 15 s : au-delà on entre, elle arrivera)
while not Mer.pret and os.clock() - t0 < 15 do
	E.chargeTxt.Text = T.chargement .. string.rep(".", math.floor((os.clock() - t0) * 3) % 4)
	task.wait(0.1)
end
preparer(2, Piste.suite(z1.piste :: Piste.Piste))
if profil.reglages and profil.reglages.tuto == false then preparer(0, nil) end
-- le plan du titre (la place de la caisse dans le ciel) tout de suite, ses cumulus dès que les gabarits sont prêts
task.spawn(function()
	local okT, errT = pcall(KA.Titre.plan, z1.piste)
	if not okT then warn("[CashCar] titre : " .. tostring(errT)) end
	if mode == "menu" then KA.Titre.montrer(true) end
end)
allerMenu()
end

-- (mise au point) workspace:SetAttribute("DbgBudget", "une étiquette") : ce qu'il reste du budget de triangles, écrit dans la Sortie
workspace:GetAttributeChangedSignal("DbgBudget"):Connect(function()
	task.spawn(function() require(CL:WaitForChild("Maillage")).mesurer(tostring(workspace:GetAttribute("DbgBudget")), true) end)
end)
if Config.BANC_BUDGET then
	task.spawn(function()
		local Maillage = require(CL:WaitForChild("Maillage"))
		task.wait(8) -- (le titre et la zone 2 ont fini de se bâtir)
		Maillage.mesurer("au menu")
	end)
end
-- aide au débogage (console du client dans Studio) : _G.cashcar()
-- (la console de Studio ne partage pas _G avec les scripts : pour imposer une vue, poser l'attribut DbgVue — un CFrame — sur le Workspace)
_G.cashcar = function()
	return { mode = mode, zone = zoneN, s = s, lat = lat, side = side, vA = vA, kmh = kmh(), psi = psi,
		nitro = nitroR, tier = tier, argent = argent, aura = aura, fallT = V.fallT, n = piste and piste.n, len = piste and piste.len }
end
