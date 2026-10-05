-- CASH CAR — LES PROFILS (serveur). Tout ce qu'un joueur garde d'une partie à l'autre : le COMPTE (l'argent
-- versé à chaque fin de partie), le record, les caisses achetées et celle qu'il conduit, les peintures,
-- les missions, la carrière, les réglages. UNE entrée DataStore par joueur, versionnée (comme SAVE.d du web).
--
-- Le client DEMANDE (acheter, équiper, régler, réclamer une mission…), le serveur VÉRIFIE (prix, argent,
-- possession) puis renvoie le profil à jour : un joueur ne peut pas s'offrir une caisse en trichant.
-- Les règles de chaque action vivent dans Profils.actions (les systèmes s'y branchent : garage, missions…).
local DataStoreService = game:GetService("DataStoreService")

local Profils = {}
local Carnets = require(game:GetService("ReplicatedStorage"):WaitForChild("CashCar"):WaitForChild("Carnets"))

local VERSION = 1
local store
do
	local ok, s = pcall(function() return DataStoreService:GetDataStore("CashCarProfils_v1") end)
	if ok then store = s end
end

export type Profil = { [string]: any }

-- la forme garantie d'un profil (san() du web : tout ce qui entre est désinfecté)
function Profils.neuf(): Profil
	return {
		v = VERSION,
		compte = 0, record = 0, auraMeilleur = 0,
		kmhMax = 0, -- la plus grande vitesse jamais atteinte (km/h affichés)
		moteurMax = 0, -- le meilleur palier de MOTEUR jamais atteint (SAVE.d.ex.eng du web) : l'écran de fin dit « RECORD ! » s'il est battu
		aura = 0,      -- l'aura de TOUJOURS (elle fait le rang : ANONYME … DIVINITÉ DU CIEL)
		frenRec = 0,   -- la plus longue frénésie (s)
		caisses = { 0 }, caisse = 0, -- indices du jeu web : 0 = LA HONTE, la caisse de départ
		peintures = {}, peinture = 0,
		traines = {}, trainee = 0,
		mis = { n = 0, ok = { false, false, false }, best = { 0, 0, 0 }, f = -1 }, -- les CARNETS (voir Carnets)
		habits = {},   -- les habillages gagnés ou achetés : « peinture:or », « trainee:arcenciel »…
		porte = { peinture = "usine", aile = "panneaux", trainee = "nitro" }, -- ce que la caisse porte
		carriere = {},
		reglages = { son = true, musique = true, facile = false, facileChoisi = false, tuto = false,
			volSon = 100, volMus = 62, volH = "plonge", vib = true, -- (les curseurs de volume du web : 100 % et 62 % ; POUCE HAUT EN VOL ; VIBRATIONS)
			ast1 = false, ast2 = false, ast3 = false, ast4 = false, shopVu = false, -- (shopVu : la BOUTIQUE a été visitée — sa pastille NEW s'éteint) -- les ASTUCES déjà lues (une fois à vie) : le bord, le vol, les pièces, le drift
			nitroInf = true }, -- (5/10) le passe NITRO INFINIE allumé (son interrupteur, colonne JEU des réglages : rejouer avec la jauge quand on veut)
		permis = false, -- le PERMIS de l'auto-école : +500 $, une seule fois dans la vie du compte
		stats = { parties = 0, distance = 0, pieces = 0, figures = 0 },
		-- les REVENUS (voir Revenus) : le cadeau du jour (son jour UTC, la série), le bonus de groupe pris, qui m'a invité, les reçus
		-- d'achat déjà servis (un reçu ne sert jamais deux fois)
		jour = 0, serie = 0, groupe = false, invite = 0, achats = {},
		-- LES CŒURS (le produit à 50 R$, Sacha 5/10) : le stock de vies en plus — un cœur se dépense quand la caisse devait exploser
		-- (action « coeur »), un achat en ajoute un (ProcessReceipt, voir Revenus)
		coeurs = 0,
		-- LE KIT DU PILOTE (5/10, l'offre de bienvenue en Robux) : déjà acheté — une fois par compte, il quitte la boutique
		kit = false,
		-- LA ROUE : les tours en réserve, l'heure (os.time) du dernier tour gratuit, les parties vers le prochain tour offert, la caisse
		-- qui vient d'être gagnée et qu'on peut encore préférer en argent (-1 : aucune)
		roue = { n = 0, libre = 0, parties = 0, attente = -1 },
	}
end

local Catalogue = require(game:GetService("ReplicatedStorage"):WaitForChild("CashCar"):WaitForChild("Caisses"):WaitForChild("Catalogue"))
local function sain(p: any): Profil
	local n = Profils.neuf()
	if type(p) ~= "table" then return n end
	for k, v in n do
		if k == "reglages" or k == "porte" or k == "roue" then
			-- (clé par clé : un vieux profil n'a pas les réglages ajoutés depuis)
			if type(p[k]) == "table" then
				for rk, rv in v do
					if type(p[k][rk]) == type(rv) then v[rk] = p[k][rk] end
				end
			end
		elseif type(p[k]) == type(v) then
			n[k] = p[k]
		end
	end
	local achats = {}
	for _, a in n.achats do
		if type(a) == "string" and #a < 80 and #achats < 30 then table.insert(achats, a) end
	end
	n.achats = achats
	for _, k in { "n", "libre", "parties" } do
		local v = n.roue[k]
		if v ~= v or v < 0 or v > 1e12 then n.roue[k] = 0 end
	end
	for _, k in { "compte", "record", "auraMeilleur", "aura", "frenRec", "moteurMax", "kmhMax", "jour", "serie", "invite", "coeurs" } do
		if n[k] ~= n[k] or n[k] < 0 or n[k] > 1e18 then n[k] = 0 end
	end
	n.coeurs = math.floor(n.coeurs) -- (des cœurs ENTIERS : un demi-cœur ne sauve personne)
	local possede = {}
	local liste = {}
	for _, i in n.caisses do
		if type(i) == "number" and i == math.floor(i) and i >= 0 and i < 1000 and not possede[i] then
			local f = Catalogue[i]
			if f and f.retire then
				-- LES CAISSES RETIRÉES (san, 2/10) : qui en avait acheté une est REMBOURSÉ au prix payé — une mise à jour ne confisque
				-- pas — et elle sort de la liste (le remboursement ne joue donc qu'une fois)
				if f.cond.k == "prix" then n.compte += f.cond.v end
			else
				possede[i] = true
				table.insert(liste, i)
			end
		end
	end
	if not possede[0] then table.insert(liste, 0) end
	n.caisses = liste
	if type(n.caisse) ~= "number" or n.caisse ~= math.floor(n.caisse) or n.caisse < 0 then n.caisse = 0 end
	if Catalogue[n.caisse] and Catalogue[n.caisse].retire then n.caisse = 0 end -- (qui roulait avec une caisse retirée repart en LA HONTE)
	-- (4/10, version publique) une caisse équipée qu'on ne possède pas — un reste des essais où tout s'équipait : retour à LA HONTE
	local CfgP = require(game:GetService("ReplicatedStorage"):WaitForChild("CashCar"):WaitForChild("Config"))
	if not possede[n.caisse] and not CfgP.TEST_CAISSES then n.caisse = 0 end
	n.mis = Carnets.etat(n.mis)
	local habits = {}
	for _, h in n.habits do
		if type(h) == "string" and #h < 60 and not table.find(habits, h) then table.insert(habits, h) end
	end
	n.habits = habits
	return n
end

local actifs: { [number]: Profil } = {}

-- ⚠ UNE LECTURE RATÉE N'EST PAS UN JOUEUR NEUF. Avant le 3/10, une panne de la sauvegarde à l'arrivée donnait un profil VIDE — et la
-- première écriture effaçait pour de bon les caisses, l'argent et les réglages du joueur. On essaie trois fois (1 s, 2 s, 4 s) ; si
-- la sauvegarde ne répond toujours pas, la session joue sur un profil neuf SANS JAMAIS l'écrire (`horsLigne`), et le joueur le sait.
-- (5/10) UNE SEULE LECTURE À LA FOIS par joueur : le profil était parfois lu DEUX fois à l'arrivée (l'arrivée + une demande du
-- client, ou un reçu d'achat en attente), et la seconde lecture, plus lente, remplaçait la première — avec ce qu'on y avait déjà
-- crédité. La seconde demande attend la première et rend le MÊME profil.
local enLecture: { [number]: boolean } = {}
function Profils.pret(p: Player): boolean
	return actifs[p.UserId] ~= nil and not enLecture[p.UserId]
end
function Profils.charger(p: Player): Profil
	local id = p.UserId
	if enLecture[id] then
		while enLecture[id] and p.Parent do task.wait(0.1) end
		local deja = actifs[id]
		if deja then return deja end
		local hors = Profils.neuf() -- (parti pendant la lecture : un profil jetable, jamais écrit)
		;(hors :: any).horsLigne = true
		return hors
	end
	if actifs[id] then return actifs[id] end
	enLecture[id] = true
	local prof = Profils.neuf()
	if store then
		local lu, v = false, nil
		for essai = 1, 4 do
			local ok, r = pcall(function() return store:GetAsync("p_" .. p.UserId) end)
			if ok then
				lu, v = true, r
				break
			end
			-- (dans Studio sans accès aux services en ligne, la lecture échoue TOUJOURS : pas d'essai de plus, pas d'alerte — rien n'y est
			-- gardé de toute façon)
			if game:GetService("RunService"):IsStudio() then break end
			warn("[CashCar] sauvegarde illisible pour " .. p.Name .. " (essai " .. essai .. ") : " .. tostring(r))
			if essai < 4 then task.wait(2 ^ (essai - 1)) end
		end
		if lu and v ~= nil then
			local okS, r = pcall(sain, v)
			if okS then
				prof = r
			else
				lu = false -- (une sauvegarde qu'on ne sait pas relire : on ne l'écrasera pas non plus)
			end
		end
		if not lu then
			(prof :: any).horsLigne = true
			if not game:GetService("RunService"):IsStudio() then p:SetAttribute("SauvegardeKO", true) end
		end
	end
	-- (parti pendant la lecture : on ne garde rien — sinon ce profil-là resservirait, périmé, à son retour sur ce serveur)
	if p.Parent then actifs[id] = prof end
	enLecture[id] = nil
	return prof
end

function Profils.de(p: Player): Profil
	return actifs[p.UserId] or Profils.charger(p)
end

-- rend VRAI si le profil est écrit (5/10 : un achat en Robux n'est accordé qu'à cette condition — voir Revenus)
function Profils.sauver(p: Player): boolean
	local prof = actifs[p.UserId]
	if not prof or not store or (prof :: any).horsLigne then return false end -- (lecture ratée : on n'écrase rien)
	local efface = prof.efface
	prof.efface = nil
	local ok = pcall(function()
		store:UpdateAsync("p_" .. p.UserId, function(ancien)
			if efface then return prof end -- (une progression EFFACÉE ne reprend rien de l'ancienne)
			-- jamais en arrière : l'argent et le record ne redescendent pas si deux serveurs se croisent
			local a = sain(ancien)
			prof.record = math.max(prof.record, a.record)
			prof.auraMeilleur = math.max(prof.auraMeilleur, a.auraMeilleur)
			prof.moteurMax = math.max(prof.moteurMax, a.moteurMax)
			prof.kmhMax = math.max(prof.kmhMax, a.kmhMax)
			return prof
		end)
	end)
	if not ok and efface then prof.efface = true end -- (l'écriture a raté : l'effacement repartira avec la suivante)
	return ok
end

-- LES ÉCRITURES SE REGROUPENT : Roblox n'accepte qu'une écriture toutes les 6 s sur une même clé — au-delà il les met en file,
-- puis les JETTE quand la file est pleine. Un réglage, une astuce vue, le permis, une fin de partie : chacun demandait la sienne.
-- Ici, une seule écriture au plus toutes les 7 s par joueur ; ce qui arrive entre-temps part avec la suivante (le profil est le même
-- objet, toujours à jour). Quand le joueur s'en va, `Profils.sauver` écrit tout de suite.
local enAttente: { [number]: boolean } = {}
local derniere: { [number]: number } = {}
function Profils.sauverBientot(p: Player)
	local id = p.UserId
	if enAttente[id] then return end
	enAttente[id] = true
	task.spawn(function()
		local attente = 7 - (os.clock() - (derniere[id] or -100))
		if attente > 0 then task.wait(attente) end
		enAttente[id] = nil
		derniere[id] = os.clock()
		Profils.sauver(p) -- (parti entre-temps : son profil est déjà écrit et oublié, sauver ne fait rien)
	end)
end
-- ÉCRIRE MAINTENANT, et savoir si c'est fait (5/10 : les ACHATS EN ROBUX — ProcessReceipt ne répond « accordé » qu'une fois l'achat
-- écrit ; s'il ne l'est pas, Roblox représentera le reçu). Hors du regroupement de 7 s : Roblox met en file une écriture trop
-- rapprochée sur la même clé (l'appel attend son tour), il ne la refuse pas.
function Profils.sauverMaintenant(p: Player): boolean
	derniere[p.UserId] = os.clock()
	return Profils.sauver(p)
end
function Profils.oublier(p: Player)
	actifs[p.UserId] = nil
end

-- les actions que le client peut demander : nom → function(joueur, profil, ...) → ok, message
Profils.actions = {} :: { [string]: (Player, Profil, ...any) -> (boolean, string?) }

-- ── le GARAGE : acheter et équiper (le catalogue est celui du jeu web, cuit) ──
local Config = require(game:GetService("ReplicatedStorage"):WaitForChild("CashCar"):WaitForChild("Config"))
function Profils.possede(prof: Profil, i: number): boolean
	return table.find(prof.caisses, i) ~= nil
end
Profils.actions.acheter = function(_, prof, i)
	local f = type(i) == "number" and Catalogue[i]
	if not f or f.retire then return false, "caisse inconnue" end
	if Profils.possede(prof, i) then return false, "deja a toi" end
	if f.cond.k ~= "prix" then return false, "pas a vendre" end
	if prof.compte < f.cond.v then return false, "pas assez" end
	prof.compte -= f.cond.v
	table.insert(prof.caisses, i)
	return true -- (comme carBuy du web : la caisse achetée n'est PAS équipée d'office)
end
Profils.actions.equiper = function(p, prof, i)
	local f = type(i) == "number" and Catalogue[i]
	if not f or f.retire then return false, "caisse inconnue" end
	if not Profils.possede(prof, i) and not Config.TEST_CAISSES then return false, "pas a toi" end
	prof.caisse = i
	if Profils.surEquipe then Profils.surEquipe(p, i) end
	return true
end

-- ── les MISSIONS (retirées du jeu le 4/10 : la ROUE les remplace) — leurs actions ne répondent plus : « defi » payait sur la simple
-- parole du joueur. Le carnet reste dans le profil (les vieilles sauvegardes), plus rien ne le fait avancer. ──
-- ── les HABILLAGES (shopBuy / shopEquip, L22150) : peintures, ailes, traînées ──
local function habit(cat: any, id: any): any
	local l = type(cat) == "string" and Config.HABITS[cat]
	if not l then return nil end
	for _, d in l do
		if d.id == id then return d end
	end
	return nil
end
function Profils.aHabit(prof: Profil, cat: string, id: string): boolean
	local d = habit(cat, id)
	if not d then return false end
	if not d.p and not d.mis and not d.roue then return true end -- offert
	return table.find(prof.habits, cat .. ":" .. id) ~= nil
end
Profils.actions.habitAcheter = function(p, prof, cat, id)
	local d = habit(cat, id)
	if not d or not d.p then return false, "pas a vendre" end
	if Profils.aHabit(prof, cat, id) then return false, "deja a toi" end
	if prof.compte < d.p then return false, "pas assez" end
	prof.compte -= d.p
	table.insert(prof.habits, cat .. ":" .. id)
	prof.porte[cat] = id -- (un habillage acheté est porté tout de suite — pas une caisse)
	if Profils.surHabit then Profils.surHabit(p) end
	return true
end
Profils.actions.habitEquiper = function(p, prof, cat, id)
	if not habit(cat, id) or not Profils.aHabit(prof, cat, id) then return false, "pas a toi" end
	prof.porte[cat] = id
	if Profils.surHabit then Profils.surHabit(p) end
	return true
end

Profils.actions.permis = function(_, prof)
	if prof.permis then return false, "deja" end
	prof.permis = true
	prof.compte += 500
	return true
end
-- EFFACER MA PROGRESSION (L39243 du jeu web, avec confirmation côté joueur) : le profil repart à zéro. `efface` dit à la sauvegarde de
-- ne PAS fusionner avec l'ancien (sinon le record, l'aura et le moteur effacés y reviendraient — « jamais en arrière »).
-- (5/10) ce qui a été PAYÉ EN ROBUX ne s'efface pas : les cœurs en réserve, et les reçus déjà servis (sans eux, un reçu que Roblox
-- représente serait servi une seconde fois). Les passes, eux, vivent chez Roblox : rien à garder ici.
-- (5/10, lot 2) ni les CAISSES LÉGENDAIRES achetées, ni le KIT DU PILOTE (et l'habillage qu'il offre) : payés, gardés.
Profils.actions.effacer = function(_, prof)
	local n = Profils.neuf()
	local coeurs, achats, kit = prof.coeurs, prof.achats, prof.kit == true
	local payees = {}
	for _, i in (type(prof.caisses) == "table" and prof.caisses or {}) do
		local f = type(i) == "number" and Catalogue[i]
		if f and f.cond.k == "premium" then table.insert(payees, i) end
	end
	for k in pairs(prof) do prof[k] = nil end
	for k, v in n do prof[k] = v end
	if type(coeurs) == "number" then prof.coeurs = coeurs end
	if type(achats) == "table" then prof.achats = achats end
	for _, i in payees do table.insert(prof.caisses, i) end
	if kit then
		prof.kit = true
		table.insert(prof.habits, Config.REVENUS.kit.habit)
	end
	prof.efface = true
	return true
end
Profils.actions.reglage = function(p, prof, cle, valeur)
	if type(cle) ~= "string" or prof.reglages[cle] == nil or type(valeur) ~= type(prof.reglages[cle]) then
		return false, "reglage inconnu"
	end
	if type(valeur) == "number" then
		if valeur ~= valeur then return false, "reglage inconnu" end
		valeur = math.clamp(math.floor(valeur / 5 + 0.5) * 5, 0, 100) -- (les curseurs vont de 0 à 100 %, par pas de 5)
	elseif type(valeur) == "string" and valeur ~= "plonge" and valeur ~= "monte" then
		return false, "reglage inconnu"
	end
	prof.reglages[cle] = valeur
	if Profils.surReglage then Profils.surReglage(p, prof, cle) end -- (5/10 : NITRO INFINIE coupée ou rallumée — voir Revenus)
	return true
end

return Profils
