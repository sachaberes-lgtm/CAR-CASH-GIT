-- CASH CAR — LES REVENUS (serveur). Ce qui fait vivre — et rapporter — un jeu Roblox, HORS de la boutique des caisses :
--   · LES RAISONS DE REVENIR (Roblox paie les créateurs au TEMPS que ses membres Premium passent dans le jeu) : le CADEAU DU JOUR et
--     sa SÉRIE (7 jours qui montent), les CADEAUX DE TEMPS DE JEU (5, 15, 30, 60 min dans la session), les BADGES, le CLASSEMENT
--     MONDIAL ; le BONUS PREMIUM (+10 % d'argent : on donne aux membres Premium une raison de jouer ici) ;
--   · LE BOUCHE-À-OREILLE : le bonus de GROUPE (une fois), les INVITATIONS d'amis (les deux sont récompensés) ;
--   · LES ACHATS EN ROBUX, sans boutique : le passe « ×2 ARGENT » (proposé à l'écran de fin, au moment où l'on voit ce qu'on aurait
--     gagné), le passe VIP (cadeaux doublés, nom doré), et le produit SECONDE CHANCE (repartir là où l'on a explosé).
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
local R = Config.REVENUS

local Revenus = {}
local ctx: any = nil
local droits: { [number]: { argent2: boolean, vip: boolean, premium: boolean } } = {}
local session: { [number]: { debut: number, n: number, badges: { [string]: boolean }, classeT: number } } = {}

local function jourDe(t: number): number return math.floor(t / 86400) end -- (le jour UTC : le même pour tous les serveurs)

-- ── les DROITS : passes possédés, Premium ──
local function lireDroits(p: Player)
	local d = droits[p.UserId] or { argent2 = false, vip = false, premium = false }
	for nom, id in R.passes do
		if type(id) == "number" and id > 0 then
			local ok, a = pcall(function() return MarketplaceService:UserOwnsGamePassAsync(p.UserId, id) end)
			if ok then (d :: any)[nom] = a == true end
		end
	end
	d.premium = p.MembershipType == Enum.MembershipType.Premium
	droits[p.UserId] = d
	p:SetAttribute("Argent2", d.argent2)
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

	-- la SECONDE CHANCE (produit) : accordée par Roblox (ProcessReceipt), une fois par achat — jamais deux fois le même reçu
	MarketplaceService.ProcessReceipt = function(info)
		local p = Players:GetPlayerByUserId(info.PlayerId)
		if not p then return Enum.ProductPurchaseDecision.NotProcessedYet end
		local prof = P.de(p)
		if table.find(prof.achats, info.PurchaseId) then return Enum.ProductPurchaseDecision.PurchaseGranted end
		if info.ProductId == R.produits.secondeChance then
			evRevivre:FireClient(p)
		else
			return Enum.ProductPurchaseDecision.NotProcessedYet
		end
		table.insert(prof.achats, info.PurchaseId)
		while #prof.achats > 30 do table.remove(prof.achats, 1) end
		P.sauverBientot(p)
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end
	-- un passe acheté EN JEU : ses droits tout de suite
	MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(p, id, achete)
		if not achete then return end
		lireDroits(p)
		for nom, pid in R.passes do
			if pid == id then dire(p, "passe", nil, nom) end
		end
	end)
	Players.PlayerMembershipChanged:Connect(function(p) lireDroits(p) end)

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
	if type(stats.zone) == "number" and stats.zone >= 6 then badge(p, "zone6") end
	if type(stats.tier) == "number" and stats.tier >= 9 then badge(p, "moteur10") end
	if type(aura) == "number" and aura >= 1000 then badge(p, "aura1000") end
	if prof.record >= 1e6 then badge(p, "millionnaire") end
	if prof.permis then badge(p, "permis") end
	inscrire(p, prof.record)
end

return Revenus
