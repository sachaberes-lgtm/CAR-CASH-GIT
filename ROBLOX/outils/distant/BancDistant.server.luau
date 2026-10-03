-- CASH CAR — LE BANC À DISTANCE (copie de TEST seulement : jamais dans CashCar.rbxlx — voir outils/banc.sh et construire.js).
-- Sacha se sert de son PC pendant les essais : on ne peut ni cliquer ni taper dans Studio. Ce script va chercher ses ordres
-- sur le PC (outils/distant.py, http://127.0.0.1:8799) : du Luau exécuté ICI, côté serveur — Lighting et les attributs de
-- Workspace se répliquent tout seuls chez le joueur ; pour ce qui n'existe QUE chez lui (les nuages, la route, la caisse),
-- `client("prop", racine, nom, propriété, valeur)` passe par un RemoteEvent (voir BancDistantClient).
local Http = game:GetService("HttpService")
local RS = game:GetService("ReplicatedStorage")
local URL = "http://127.0.0.1:8799/"
local ev = Instance.new("RemoteEvent")
ev.Name = "BancDistant"
ev.Parent = RS

local function dire(t: any)
	pcall(function() Http:PostAsync(URL .. "sortie", tostring(t), Enum.HttpContentType.TextPlain) end)
end
ev.OnServerEvent:Connect(function(_, t) dire("[joueur] " .. tostring(t)) end)
game:GetService("LogService").MessageOut:Connect(function(msg, typ)
	if typ == Enum.MessageType.MessageWarning or typ == Enum.MessageType.MessageError then dire("[sortie serveur] " .. msg) end
end)
-- à la portée des ordres : client(...) parle au joueur, dire(...) écrit dans le journal du PC
local env = getfenv()
env.client = function(...) ev:FireAllClients(...) end
env.dire = dire

dire("banc à distance : prêt")
while true do
	local ok, corps = pcall(function() return Http:GetAsync(URL .. "suivant", true) end)
	local plein = ok and corps ~= ""
	if plein then
		local f, err = loadstring(corps)
		if f then
			setfenv(f, env)
			local ok2, r = pcall(f)
			dire(ok2 and ("ok " .. tostring(r)) or ("ERREUR " .. tostring(r)))
		else
			dire("SYNTAXE " .. tostring(err))
		end
	end
	task.wait(plein and 0.05 or 0.35)
end
