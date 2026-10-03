-- CASH CAR — REMPLIR LES NUMÉROS DES SONS, D'UN COUP (au lieu de copier ~120 numéros à la main).
-- 1. Studio → Fenêtre → Gestionnaire de ressources → Importation groupée → tous les fichiers de ROBLOX/sons-a-importer.
-- 2. Dans le Gestionnaire de ressources, dossier Audio : tout sélectionner, clic droit → Insérer (les sons arrivent dans le Workspace,
--    chacun avec le nom de son fichier).
-- 3. Affichage → Barre de commande : coller TOUT ce fichier, Entrée.
-- Le script lit chaque son du jeu dont le nom est celui d'un son de CASH CAR, écrit son numéro dans ReplicatedStorage → CashCar →
-- SonsIds, retire les sons insérés (ils ne servaient qu'à porter leur numéro), et dit dans la Sortie ce qu'il a trouvé et ce qui
-- manque. Il recopie aussi la liste dans la Sortie : la garder (l'envoyer à Claude) pour qu'elle entre dans le dépôt.
-- Ensuite : Fichier → Publier sur Roblox.
local SUPPRIMER = true -- false : garder les sons insérés dans le Workspace

local RS = game:GetService("ReplicatedStorage")
local CC = RS:WaitForChild("CashCar")
local module = CC:FindFirstChild("SonsIds")
if not module then
	module = Instance.new("ModuleScript")
	module.Name = "SonsIds"
	module.Parent = CC
end
-- les noms attendus : les clés de Config.SONS, lues dans le texte du module (pas de require : la barre de commande garde un cache)
local attendus, ordre = {}, {}
local src = CC:WaitForChild("Config").Source
local debut = string.find(src, "Config.SONS = {", 1, true)
local fin = debut and string.find(src, "\n}", debut, true)
if not debut or not fin then
	warn("[CashCar] Config.SONS introuvable dans Config : rien n'est fait")
	return
end
for cle in string.gmatch(string.sub(src, debut, fin), "([%a_][%w_]*)%s*=%s*\"") do
	if not attendus[cle] then
		attendus[cle] = true
		table.insert(ordre, cle)
	end
end
-- ce qui est déjà connu (un import précédent)
local ids = {}
local okA, ancien = pcall(function() return loadstring(module.Source)() end)
if okA and type(ancien) == "table" then
	for k, v in ancien do ids[k] = v end
end
-- les sons du jeu qui portent un nom attendu (« piece » ou « piece.mp3 »)
local trouves, ranges = 0, {}
for _, d in game:GetDescendants() do
	if d:IsA("Sound") and string.find(d.SoundId, "rbxassetid://", 1, true) then
		local nom = string.gsub(d.Name, "%.%w+$", "")
		if attendus[nom] then
			if ids[nom] ~= d.SoundId then trouves += 1 end
			ids[nom] = d.SoundId
			table.insert(ranges, d)
		end
	end
end
-- le module, réécrit dans l'ordre de Config.SONS
local lignes = { "-- CASH CAR — LES NUMÉROS DES SONS IMPORTÉS SUR ROBLOX (écrit par outils/remplir-sons.luau, ne pas éditer à la main).", "return {" }
local manque = {}
for _, k in ordre do
	if ids[k] then
		table.insert(lignes, string.format("\t%s = %q,", k, ids[k]))
	else
		table.insert(manque, k)
	end
end
table.insert(lignes, "}")
module.Source = table.concat(lignes, "\n") .. "\n"
if SUPPRIMER then
	for _, d in ranges do d:Destroy() end
end
print(string.format("[CashCar] SONS : %d numéros nouveaux, %d connus en tout sur %d. Manquent : %s", trouves, #ordre - #manque, #ordre,
	(#manque > 0) and table.concat(manque, ", ") or "aucun"))
print("[CashCar] SonsIds — à garder (l'envoyer à Claude pour le dépôt) :\n" .. module.Source)
