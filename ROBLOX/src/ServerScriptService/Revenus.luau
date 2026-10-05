-- CASH CAR — LES REVENUS (serveur). Ce qui fait vivre — et rapporter — un jeu Roblox, HORS de la boutique des caisses :
--   · LES RAISONS DE REVENIR (Roblox paie les créateurs au TEMPS que ses membres Premium passent dans le jeu) : le CADEAU DU JOUR et
--     sa SÉRIE (7 jours qui montent), les CADEAUX DE TEMPS DE JEU (5, 15, 30, 60 min dans la session), les BADGES, le CLASSEMENT
--     MONDIAL ; le BONUS PREMIUM (+10 % d'argent : on donne aux membres Premium une raison de jouer ici) ;
--   · LE BOUCHE-À-OREILLE : le bonus de GROUPE (une fois), les INVITATIONS d'amis (les deux sont récompensés) ;
--   · LES ACHATS EN ROBUX (Sacha, 5/10 : « fais de ce jeu une usine à fric ») — en tête de la BOUTIQUE, et là où ils ont un sens :
--     le passe « ×2 ARGENT » (500 R$ ; aussi proposé à l'écran de fin, au moment où l'on voit ce qu'on aurait gagné), le passe
--     « NITRO INFINIE » (700 R$ : la réserve ne se vide jamais — attribut joueur NitroInfini, lu par le pilote), le passe VIP
--     (cadeaux doublés, nom doré), et le produit CŒUR (50 R$, achat répété : une vie de plus, GARDÉE dans le profil — proposé aussi
--     à la mort quand on n'en a plus : acheté, il est dépensé aussitôt et la caisse repart là où elle a explosé) ;
--   · LA ROUE : un tour gratuit toutes les 4 h, un tour offert toutes les 3 parties, des tours à vendre — le tirage se fait ICI
--     (jamais chez le joueur) : de l'argent, une caisse EXCLUSIVE (à garder ou à revendre, au choix), un habillage, le jackpot.
-- ⚠ Les numéros (passes, produits, badges, groupe) se posent dans Config.REVENUS une fois créés sur create.roblox.com par Sacha : à 0,
-- l'objet n'existe pas encore et tout ce qui en dépend se tait (rien ne se vend sans lui). Le cadeau du jour, le temps de jeu, le
-- classement et les invitations marchent sans rien créer.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local MarketplaceService = game:GetService("MarketplaceService")
local BadgeService = game:GetService("BadgeService")
local DataStoreService = game:GetService("DataStoreService")
local HttpService = game:GetService("HttpService")

local CC = ReplicatedStorage:WaitForChild("CashCar")
local Config = require(CC:WaitForChild("Config"))
local Catalogue = require(CC:WaitForChild("Caisses"):WaitForChild("Catalogue"))
local R = Config.REVENUS
local RO = Config.ROUE

local Revenus = {}
local ctx: any = nil
-- (payes : les passes achetés PENDANT la session — Roblox garde en cache la réponse de UserOwnsGamePassAsync, qui peut encore dire
-- « non » juste après l'achat : un passe payé ici ne se reperd pas)
local droits: { [number]: { argent2: boolean, nitroInfini: boolean, vip: boolean, premium: boolean, payes: { [string]: boolean } } } = {}
local session: { [number]: { debut: number, n: number, badges: { [string]: boolean }, classeT: number } } = {}
local Studio = game:GetService("RunService"):IsStudio()

local function jourDe(t: number): number return math.floor(t / 86400) end -- (le jour UTC : le même pour tous les serveurs)

-- ── les DROITS : passes possédés, Premium ──
-- (banc) workspace:SetAttribute("DbgPasse", "nitroInfini") — ou "argent2", "vip", ou plusieurs : « nitroInfini,argent2 » — fait comme
-- si le joueur possédait ce passe (Studio seulement : en ligne, seul Roblox dit ce qu'on possède)
local function passeSimule(nom: string): boolean
	if not Studio then return false end
	local q = workspace:GetAttribute("DbgPasse")
	return type(q) == "string" and string.find("," .. q .. ",", "," .. nom .. ",", 1, true) ~= nil
end
local function lireDroits(p: Player)
	local d = droits[p.UserId] or { argent2 = false, nitroInfini = false, vip = false, premium = false, payes = {} }
	for nom, id in R.passes do
		local a = d.payes[nom] == true or passeSimule(nom)
		if not a and type(id) == "number" and id > 0 then
			local ok, r = pcall(function() return MarketplaceService:UserOwnsGamePassAsync(p.UserId, id) end)
			a = if ok then r == true else (d :: any)[nom] == true -- (Roblox ne répond pas : on garde ce qu'on savait)
		end
		(d :: any)[nom] = a
	end
	d.premium = p.MembershipType == Enum.MembershipType.Premium
	droits[p.UserId] = d
	p:SetAttribute("Argent2", d.argent2)
	p:SetAttribute("NitroInfini", d.nitroInfini) -- (le pilote le lit : la réserve ne se vide plus)
	p:SetAttribute("VIP", d.vip)
	p:SetAttribute("Premium", d.premium)
	return d
end
function Revenus.droits(p: Player): any return droits[p.UserId] or lireDroits(p) end

-- ce que vaut 1 $ gagné en course pour ce joueur : × 2 (passe), × 1,1 (Premium)
function Revenus.multiplicateur(p: Player): number
	local d = Revenus.droits(p)
	return (d.argent2 and 2 or 1) * (d.premium and (1 + R.premiumBonus) or 1)
end

-- ── les BADGES : une fois, discrètement (BadgeService ne marche que dans un jeu publié) ──
local function badge(p: Player, nom: string)
	local id = R.badges[nom]
	local se = session[p.UserId]
	if type(id) ~= "number" or id <= 0 or not se or se.badges[nom] then return end
	se.badges[nom] = true
	task.spawn(function()
		local ok, a = pcall(function() return BadgeService:UserHasBadgeAsync(p.UserId, id) end)
		if ok and not a then pcall(function() BadgeService:AwardBadge(p.UserId, id) end) end
	end)
end
Revenus.badge = badge

-- un message pour le joueur (un bandeau, un montant qui tombe) — voir Client/Revenus
local evRevenu: RemoteEvent? = nil
local function dire(p: Player, quoi: string, montant: number?, txt: string?)
	if evRevenu then evRevenu:FireClient(p, quoi, montant, txt) end
end
local function crediter(p: Player, prof: any, montant: number)
	prof.compte += math.floor(montant)
	ctx.Profils.pousser(p)
	ctx.compte(p, prof)
	ctx.Profils.sauverBientot(p)
end
-- ── LES CŒURS : le stock vit dans le profil, le joueur le lit sur son attribut « Coeurs » (pilote, boutique) ──
local function etatCoeurs(p: Player, prof: any)
	p:SetAttribute("Coeurs", math.max(0, math.floor(prof.coeurs or 0)))
end

-- ── le CADEAU DU JOUR : 7 jours qui montent, la série repart à 1 si l'on saute un jour ; VIP = doublé ──
local function etatJour(p: Player, prof: any)
	local auj = jourDe(os.time())
	local dispo = prof.jour ~= auj
	local serie = dispo and ((prof.jour == auj - 1) and prof.serie + 1 or 1) or prof.serie
	p:SetAttribute("JourDispo", dispo)
	p:SetAttribute("Serie", serie)
end
local function gainJour(p: Player, serie: number): number
	local g = R.jour[((serie - 1) % #R.jour) + 1]
	return g * (Revenus.droits(p).vip and 2 or 1)
end

-- ── les CADEAUX DE TEMPS DE JEU : dans la session (5, 15, 30, 60 min, puis toutes les heures) ; VIP = doublés ──
local function seuil(n: number): (number, number) -- le n-ième cadeau (1…) : à combien de minutes, combien
	local t = R.tempsJeu
	if n <= #t then return t[n][1], t[n][2] end
	local dernier = t[#t]
	return dernier[1] + (n - #t) * 60, dernier[2]
end

-- ── LA ROUE ──
-- ce que le joueur voit de sa roue (attributs, lus par Client/Roue) : les tours en réserve, l'heure du prochain tour gratuit (os.time,
-- comparée chez lui à workspace:GetServerTimeNow), les parties faites vers le tour offert
local function etatRoue(p: Player, prof: any)
	local r = prof.roue
	p:SetAttribute("RoueTours", r.n)
	p:SetAttribute("RoueProchain", r.libre + RO.libreH * 3600)
	p:SetAttribute("RoueParties", r.parties)
end
Revenus.etatRoue = etatRoue
local rng = Random.new()
local function tirer(): number
	local total = 0
	for _, c in RO.cases do total += c.w end
	local x = rng:NextNumber() * total
	for k, c in RO.cases do
		x -= c.w
		if x <= 0 then return k end
	end
	return 1
end
-- un tour : gratuit s'il est l'heure, sinon pris dans la réserve. Rend { case, gain?, caisse?, habit? } — le client fait tourner la
-- roue JUSQU'À la case tirée ici
local function tourner(p: Player, prof: any): (boolean, any)
	local r = prof.roue
	local t = os.time()
	if t - r.libre >= RO.libreH * 3600 then
		r.libre = t
	elseif r.n > 0 then
		r.n -= 1
	else
		return false, "pas de tour"
	end
	local k = tirer()
	-- (banc) workspace:SetAttribute("DbgRoueCase", k) force la case (Studio seulement)
	local force = workspace:GetAttribute("DbgRoueCase")
	if game:GetService("RunService"):IsStudio() and type(force) == "number" and RO.cases[force] then k = force end
	local c = RO.cases[k]
	local res: any = { case = k }
	r.attente = -1
	if c.k == "caisse" then
		local libres = {}
		for i, f in Catalogue do
			if f.cond.k == "roue" and not f.retire and not table.find(prof.caisses, i) then table.insert(libres, i) end
		end
		table.sort(libres)
		if #libres > 0 then
			local i = libres[rng:NextInteger(1, #libres)]
			table.insert(prof.caisses, i)
			r.attente = i
			res.caisse = i
		else
			res.gain = RO.revente -- (toute la collection est déjà au garage : la case paie)
		end
	elseif c.k == "habit" then
		local libres = {}
		for cat, l in Config.HABITS do
			for _, d in l do
				if d.roue and not table.find(prof.habits, cat .. ":" .. d.id) then table.insert(libres, { cat, d.id }) end
			end
		end
		if #libres > 0 then
			local h = libres[rng:NextInteger(1, #libres)]
			table.insert(prof.habits, h[1] .. ":" .. h[2])
			res.habit = h
		else
			res.gain = c.v
		end
	else
		res.gain = c.v
	end
	if res.gain then prof.compte += res.gain end
	etatRoue(p, prof)
	ctx.compte(p, prof)
	return true, res
end

-- ── le CLASSEMENT MONDIAL : le meilleur record de chacun, les dix premiers rafraîchis toutes les 2 min ──
local classement: any = nil
do
	local ok, s = pcall(function() return DataStoreService:GetOrderedDataStore("CashCarClassement_v1") end)
	if ok then classement = s end
end
local noms: { [number]: string } = {}
local function nomDe(id: number): string
	if noms[id] then return noms[id] end
	local p = Players:GetPlayerByUserId(id)
	local ok, n = pcall(function() return p and p.DisplayName or Players:GetNameFromUserIdAsync(id) end)
	noms[id] = (ok and n) or "?"
	return noms[id]
end
local function rafraichir()
	if not classement then return end
	local ok, page = pcall(function() return classement:GetSortedAsync(false, 10):GetCurrentPage() end)
	if not ok or type(page) ~= "table" then return end
	local liste = {}
	for _, e in page do
		local id = tonumber(e.key)
		if id then table.insert(liste, { n = nomDe(id), v = e.value }) end
	end
	CC:SetAttribute("Classement", HttpService:JSONEncode(liste))
end
local function inscrire(p: Player, record: number)
	local se = session[p.UserId]
	if not classement or not se or os.clock() - se.classeT < 30 then return end
	se.classeT = os.clock()
	task.spawn(function()
		pcall(function() classement:SetAsync(tostring(p.UserId), math.floor(record)) end)
	end)
end

-- ════════ le branchement ════════
function Revenus.init(c: any)
	ctx = c
	evRevenu = c.remote("Revenu")
	local evRevivre = c.remote("Revivre")
	local P = ctx.Profils

	-- le CADEAU DU JOUR
	P.actions.cadeauJour = function(p, prof)
		local auj = jourDe(os.time())
		if prof.jour == auj then return false, "deja pris" end
		prof.serie = (prof.jour == auj - 1) and prof.serie + 1 or 1
		prof.jour = auj
		local g = gainJour(p, prof.serie)
		prof.compte += g
		etatJour(p, prof)
		if prof.serie >= 7 then badge(p, "serie7") end
		dire(p, "jour", g)
		ctx.compte(p, prof)
		return true
	end
	-- les CADEAUX DE TEMPS DE JEU
	P.actions.cadeauTemps = function(p, prof)
		local se = session[p.UserId]
		if not se then return false, "pas de session" end
		local mn, g = seuil(se.n + 1)
		if workspace:GetServerTimeNow() - se.debut < mn * 60 - 2 then return false, "pas encore" end
		se.n += 1
		g *= Revenus.droits(p).vip and 2 or 1
		prof.compte += g
		p:SetAttribute("CadeauN", se.n)
		dire(p, "temps", g)
		ctx.compte(p, prof)
		return true
	end
	-- le BONUS DE GROUPE (une fois) : vérifié sur la liste FRAÎCHE des groupes du joueur (il vient peut-être de rejoindre)
	P.actions.groupe = function(p, prof)
		if type(R.groupe) ~= "number" or R.groupe <= 0 then return false, "pas de groupe" end
		if prof.groupe then return false, "deja pris" end
		local ok, gs = pcall(function() return game:GetService("GroupService"):GetGroupsAsync(p.UserId) end)
		local membre = false
		if ok and type(gs) == "table" then
			for _, g in gs do if g.Id == R.groupe then membre = true end end
		end
		if not membre then return false, "pas membre" end
		prof.groupe = true
		prof.compte += R.groupeBonus
		p:SetAttribute("GroupeFait", true)
		dire(p, "groupe", R.groupeBonus)
		ctx.compte(p, prof)
		return true
	end

	-- LA ROUE : tourner ; puis, si c'est une caisse, la GARDER (elle est équipée) ou la REVENDRE (au choix : la caisse ou l'argent)
	P.actions.roue = tourner
	P.actions.roueGarder = function(p, prof, i)
		if type(i) ~= "number" or prof.roue.attente ~= i then return false, "rien a garder" end
		prof.roue.attente = -1
		return P.actions.equiper(p, prof, i)
	end
	P.actions.roueVendre = function(p, prof, i)
		if type(i) ~= "number" or prof.roue.attente ~= i then return false, "rien a vendre" end
		local j = table.find(prof.caisses, i)
		if j then table.remove(prof.caisses, j) end
		if prof.caisse == i then prof.caisse = 0 end
		prof.roue.attente = -1
		prof.compte += RO.revente
		ctx.compte(p, prof)
		return true
	end

	-- UN CŒUR SE DÉPENSE (Sacha, 5/10 : « une vie en plus sous forme de cœur ») : la caisse devait exploser, le pilote l'a déjà
	-- replacée sur la route (il n'attend pas la réponse) — ici on retire le cœur du stock, et on refuse à zéro
	P.actions.coeur = function(p, prof)
		if (prof.coeurs or 0) < 1 then
			etatCoeurs(p, prof) -- (le joueur se croyait un cœur de trop : il relit la vérité)
			return false, "plus de coeur"
		end
		prof.coeurs -= 1
		etatCoeurs(p, prof)
		return true
	end

	-- les PRODUITS (le CŒUR, les 3 TOURS DE ROUE) : accordés par Roblox (ProcessReceipt), une fois par achat — jamais deux fois le
	-- même reçu
	MarketplaceService.ProcessReceipt = function(info)
		local p = Players:GetPlayerByUserId(info.PlayerId)
		if not p then return Enum.ProductPurchaseDecision.NotProcessedYet end
		local prof = P.de(p)
		if table.find(prof.achats, info.PurchaseId) then return Enum.ProductPurchaseDecision.PurchaseGranted end
		-- (une session dont la sauvegarde est illisible n'écrit jamais : ce qu'on y accorderait serait perdu en partant — Roblox
		-- représentera le reçu plus tard, quand la sauvegarde répondra)
		if (prof :: any).horsLigne and not Studio then return Enum.ProductPurchaseDecision.NotProcessedYet end
		if info.ProductId == R.produits.coeur then
			-- +1 cœur au stock ; la carte de la MORT l'attend peut-être (Revivre) : elle le dépense aussitôt et la caisse repart
			prof.coeurs += 1
			etatCoeurs(p, prof)
			dire(p, "coeur", nil, tostring(prof.coeurs))
			evRevivre:FireClient(p)
		elseif info.ProductId == R.produits.tours3 then
			prof.roue.n += 3
			etatRoue(p, prof)
			dire(p, "tours", nil, "3")
		else
			return Enum.ProductPurchaseDecision.NotProcessedYet
		end
		table.insert(prof.achats, info.PurchaseId)
		while #prof.achats > 30 do table.remove(prof.achats, 1) end
		P.sauverBientot(p)
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end
	-- un passe acheté EN JEU : ses droits tout de suite (noté « payé » : la réponse de Roblox, en cache, peut encore dire non)
	MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(p, id, achete)
		if not achete then return end
		local d = Revenus.droits(p)
		for nom, pid in R.passes do
			if type(pid) == "number" and pid > 0 and pid == id then d.payes[nom] = true end
		end
		lireDroits(p)
		for nom, pid in R.passes do
			if type(pid) == "number" and pid > 0 and pid == id then dire(p, "passe", nil, nom) end
		end
	end)
	Players.PlayerMembershipChanged:Connect(function(p) lireDroits(p) end)

	-- (banc, Studio seulement) DbgPasse : voir passeSimule ; DbgCoeurs = n : le stock de cœurs de chaque joueur posé à n
	if Studio then
		workspace:GetAttributeChangedSignal("DbgPasse"):Connect(function()
			for _, p in Players:GetPlayers() do lireDroits(p) end
		end)
		workspace:GetAttributeChangedSignal("DbgCoeurs"):Connect(function()
			local n = tonumber(workspace:GetAttribute("DbgCoeurs"))
			if not n then return end
			for _, p in Players:GetPlayers() do
				local prof = P.de(p)
				prof.coeurs = math.max(0, math.floor(n))
				etatCoeurs(p, prof)
			end
		end)
	end

	task.spawn(function()
		while true do
			pcall(rafraichir)
			task.wait(120)
		end
	end)
end

-- à l'arrivée (profil chargé) : les droits, le cadeau du jour, l'horloge des cadeaux, le badge de bienvenue, l'invitation
function Revenus.arrivee(p: Player, prof: any)
	session[p.UserId] = { debut = workspace:GetServerTimeNow(), n = 0, badges = {}, classeT = -100 }
	p:SetAttribute("CadeauDebut", session[p.UserId].debut)
	p:SetAttribute("CadeauN", 0)
	p:SetAttribute("GroupeFait", prof.groupe == true)
	lireDroits(p)
	etatJour(p, prof)
	etatRoue(p, prof)
	-- (banc) DbgCoeurs posé AVANT l'arrivée du joueur : il s'applique aussi
	local dbgC = Studio and tonumber(workspace:GetAttribute("DbgCoeurs"))
	if dbgC then prof.coeurs = math.max(0, math.floor(dbgC)) end
	etatCoeurs(p, prof)
	badge(p, "bienvenue")
	if prof.permis then badge(p, "permis") end
	-- L'INVITATION : arrivé par le lien d'un ami (une fois dans la vie du compte) — lui et l'ami présent sont récompensés
	local ok, jd = pcall(function() return p:GetJoinData() end)
	local par = ok and type(jd) == "table" and tonumber(jd.ReferredByPlayerId) or 0
	if par and par > 0 and par ~= p.UserId and (prof.invite or 0) == 0 then
		prof.invite = par
		crediter(p, prof, R.invitation)
		dire(p, "invite", R.invitation)
		local ami = Players:GetPlayerByUserId(par)
		if ami then
			local pa = ctx.Profils.de(ami)
			crediter(ami, pa, R.invitation)
			dire(ami, "ami", R.invitation, p.DisplayName)
		end
	end
end
function Revenus.depart(p: Player)
	session[p.UserId] = nil
	droits[p.UserId] = nil
end

-- à chaque fin de partie : les badges d'exploit, le classement
function Revenus.surFin(p: Player, prof: any, stats: any, aura: number?)
	if type(stats) ~= "table" or stats.lecon then return end
	-- LA ROUE : une vraie partie (15 s de course au moins) compte pour le tour offert
	-- (et le serveur le vérifie à sa montre : deux fins de partie à moins de 15 s d'écart ne comptent qu'une fois)
	local se = session[p.UserId]
	if type(stats.duree) == "number" and stats.duree >= 15 and se and os.clock() - (se.roueT or -100) >= 15 then
		se.roueT = os.clock()
		local r = prof.roue
		r.parties += 1
		if r.parties >= RO.parties then
			r.parties = 0
			r.n += 1
			dire(p, "tours", nil, "1")
		end
		etatRoue(p, prof)
	end
	if type(stats.zone) == "number" and stats.zone >= 6 then badge(p, "zone6") end
	if type(stats.tier) == "number" and stats.tier >= 9 then badge(p, "moteur10") end
	if type(aura) == "number" and aura >= 1000 then badge(p, "aura1000") end
	if prof.record >= 1e6 then badge(p, "millionnaire") end
	if prof.permis then badge(p, "permis") end
	inscrire(p, prof.record)
end

return Revenus
