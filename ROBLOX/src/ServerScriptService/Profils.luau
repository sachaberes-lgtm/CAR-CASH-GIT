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
			ast1 = false, ast2 = false, ast3 = false, ast4 = false }, -- les ASTUCES déjà lues (une fois à vie) : le bord, le vol, les pièces, le drift
		permis = false, -- le PERMIS de l'auto-école : +500 $, une seule fois dans la vie du compte
		stats = { parties = 0, distance = 0, pieces = 0, figures = 0 },
	}
end

local Catalogue = require(game:GetService("ReplicatedStorage"):WaitForChild("CashCar"):WaitForChild("Caisses"):WaitForChild("Catalogue"))
local function sain(p: any): Profil
	local n = Profils.neuf()
	if type(p) ~= "table" then return n end
	for k, v in n do
		if k == "reglages" or k == "porte" then
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
	for _, k in { "compte", "record", "auraMeilleur", "aura", "frenRec", "moteurMax" } do
		if n[k] ~= n[k] or n[k] < 0 or n[k] > 1e18 then n[k] = 0 end
	end
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
	n.mis = Carnets.etat(n.mis)
	local habits = {}
	for _, h in n.habits do
		if type(h) == "string" and #h < 60 and not table.find(habits, h) then table.insert(habits, h) end
	end
	n.habits = habits
	return n
end

local actifs: { [number]: Profil } = {}

function Profils.charger(p: Player): Profil
	local prof = Profils.neuf()
	if store then
		local ok, v = pcall(function() return store:GetAsync("p_" .. p.UserId) end)
		if ok and v ~= nil then prof = sain(v) end
	end
	actifs[p.UserId] = prof
	return prof
end

function Profils.de(p: Player): Profil
	return actifs[p.UserId] or Profils.charger(p)
end

function Profils.sauver(p: Player)
	local prof = actifs[p.UserId]
	if not prof or not store then return end
	pcall(function()
		store:UpdateAsync("p_" .. p.UserId, function(ancien)
			-- jamais en arrière : l'argent et le record ne redescendent pas si deux serveurs se croisent
			local a = sain(ancien)
			prof.record = math.max(prof.record, a.record)
			prof.auraMeilleur = math.max(prof.auraMeilleur, a.auraMeilleur)
			prof.moteurMax = math.max(prof.moteurMax, a.moteurMax)
			return prof
		end)
	end)
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

-- ── les MISSIONS : un défi réussi verse sa prime TOUT DE SUITE ; le carnet se ferme à la fin de la partie ──
Profils.actions.defi = function(_, prof, i, v)
	if type(i) ~= "number" or i ~= math.floor(i) or i < 1 or i > 3 then return false, "defi inconnu" end
	local d = Carnets.de(prof.mis.n)[i]
	if prof.mis.ok[i] then return false, "deja reussi" end
	if type(v) ~= "number" or v ~= v or v < d.v then return false, "pas atteint" end
	prof.mis.ok[i] = true
	prof.mis.best[i] = d.v
	prof.compte += d.p
	return true
end
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
	if not d.p and not d.mis then return true end -- offert
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
Profils.actions.suivre = function(_, prof, i)
	if i ~= -1 and not (type(i) == "number" and i == math.floor(i) and i >= 1 and i <= 3) then return false, "defi inconnu" end
	prof.mis.f = i
	return true
end
-- à la fin d'une partie : les meilleurs essais, puis le carnet se ferme si les trois défis sont réussis
function Profils.finCarnet(prof: Profil, essais: any)
	local c = Carnets.de(prof.mis.n)
	if type(essais) == "table" then
		for i = 1, 3 do
			local b = essais[i]
			if type(b) == "number" and b == b and b > prof.mis.best[i] and not prof.mis.ok[i] then
				prof.mis.best[i] = math.min(c[i].v * 0.999, b) -- (un essai ne RÉUSSIT pas le défi : seule l'action « defi » le fait)
			end
		end
	end
	if prof.mis.ok[1] and prof.mis.ok[2] and prof.mis.ok[3] then
		local rec = c.rec
		if rec.caisse then
			if not Profils.possede(prof, rec.caisse) then table.insert(prof.caisses, rec.caisse) end
		elseif rec.habit then
			if not table.find(prof.habits, rec.habit) then table.insert(prof.habits, rec.habit) end
		elseif rec.cash then
			prof.compte += rec.cash
		end
		prof.mis = { n = prof.mis.n + 1, ok = { false, false, false }, best = { 0, 0, 0 }, f = -1 }
	end
end

Profils.actions.reglage = function(_, prof, cle, valeur)
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
	return true
end

return Profils
