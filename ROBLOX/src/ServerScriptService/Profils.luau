-- CASH CAR — LES PROFILS (serveur). Tout ce qu'un joueur garde d'une partie à l'autre : le COMPTE (l'argent
-- versé à chaque fin de partie), le record, les caisses achetées et celle qu'il conduit, les peintures,
-- les missions, la carrière, les réglages. UNE entrée DataStore par joueur, versionnée (comme SAVE.d du web).
--
-- Le client DEMANDE (acheter, équiper, régler, réclamer une mission…), le serveur VÉRIFIE (prix, argent,
-- possession) puis renvoie le profil à jour : un joueur ne peut pas s'offrir une caisse en trichant.
-- Les règles de chaque action vivent dans Profils.actions (les systèmes s'y branchent : garage, missions…).
local DataStoreService = game:GetService("DataStoreService")

local Profils = {}

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
		caisses = { [1] = true }, caisse = 1,
		peintures = {}, peinture = 0,
		traines = {}, trainee = 0,
		missions = {}, carriere = {},
		reglages = { son = true, musique = true, facile = false },
		stats = { parties = 0, distance = 0, pieces = 0, figures = 0 },
	}
end

local function sain(p: any): Profil
	local n = Profils.neuf()
	if type(p) ~= "table" then return n end
	for k, v in n do
		if type(p[k]) == type(v) then n[k] = p[k] end
	end
	for _, k in { "compte", "record", "auraMeilleur" } do
		if n[k] ~= n[k] or n[k] < 0 or n[k] > 1e18 then n[k] = 0 end
	end
	if type(n.caisse) ~= "number" or not n.caisses[n.caisse] then n.caisses[1] = true; n.caisse = 1 end
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
			return prof
		end)
	end)
end

function Profils.oublier(p: Player)
	actifs[p.UserId] = nil
end

-- les actions que le client peut demander : nom → function(joueur, profil, ...) → ok, message
Profils.actions = {} :: { [string]: (Player, Profil, ...any) -> (boolean, string?) }

Profils.actions.reglage = function(_, prof, cle, valeur)
	if type(cle) ~= "string" or prof.reglages[cle] == nil or type(valeur) ~= type(prof.reglages[cle]) then
		return false, "reglage inconnu"
	end
	prof.reglages[cle] = valeur
	return true
end

return Profils
