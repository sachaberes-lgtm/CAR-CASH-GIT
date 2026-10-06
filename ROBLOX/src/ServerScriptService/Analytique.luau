-- CASH CAR — LES STATISTIQUES ROBLOX (Creator Hub → l'expérience → Analytics) : invisibles pour le joueur, le tableau de bord de Sacha.
--   · l'ENTONNOIR DES NOUVEAUX (Onboarding) : arrivé → première course → première fin → deuxième course → une minute tenue →
--     première caisse achetée. On y lit OÙ un nouveau joueur décroche : c'est la courbe qui fait (ou défait) un jeu Roblox.
--   · l'ÉCONOMIE (Economy) : chaque dollar du jeu qui entre (course, cadeaux, roue, packs payés) et qui sort (caisses, habillages),
--     avec le solde — on voit si l'argent coule trop vite ou trop lentement.
--   · quelques ÉVÉNEMENTS (Custom) : la zone atteinte, le montant d'une course, un cœur utilisé, un achat en Robux.
-- Tout passe par pcall : une statistique ne casse jamais le jeu (et en Studio, Roblox n'enregistre rien).
local AS = game:GetService("AnalyticsService")
local Players = game:GetService("Players")
local ET = Enum.AnalyticsEconomyTransactionType

local A = {}
A.T = {
	jeu = ET.Gameplay.Name, achatRobux = ET.IAP.Name, boutique = ET.Shop.Name,
	cadeau = ET.TimedReward.Name, accueil = ET.Onboarding.Name,
}

-- l'entonnoir : seulement pour un NOUVEAU joueur (aucune partie au compteur), chaque étape une fois et dans l'ordre
local suivi: { [number]: { etape: number, debuts: number } } = {}
local function etape(p: Player, n: number, nom: string)
	local s = suivi[p.UserId]
	if not s or n ~= s.etape + 1 then return end
	s.etape = n
	pcall(function() AS:LogOnboardingFunnelStepEvent(p, n, nom) end)
end

function A.arrivee(p: Player, prof: any)
	local neuf = type(prof.stats) == "table" and prof.stats.parties == 0
	suivi[p.UserId] = neuf and { etape = 0, debuts = 0 } or nil
	if neuf then etape(p, 1, "Arrive") end
end
function A.depart(p: Player)
	suivi[p.UserId] = nil
end

-- une course part (la montre du serveur démarre)
function A.debut(p: Player)
	local s = suivi[p.UserId]
	if not s then return end
	s.debuts += 1
	if s.debuts == 1 then etape(p, 2, "Premiere course") end
	if s.debuts == 2 then etape(p, 4, "Deuxieme course") end
end

-- une course finit : l'entonnoir, la zone, le montant
function A.fin(p: Player, montant: number, stats: any, duree: number)
	etape(p, 3, "Premiere fin")
	if duree >= 60 then etape(p, 5, "Une minute tenue") end
	pcall(function()
		if type(stats) == "table" and type(stats.zone) == "number" then AS:LogCustomEvent(p, "ZoneAtteinte", stats.zone) end
		AS:LogCustomEvent(p, "MontantCourse", math.floor(montant))
		AS:LogCustomEvent(p, "DureeCourse", math.floor(duree))
	end)
end

-- l'argent du jeu qui bouge : `montant` > 0 entre, < 0 sort ; `solde` = le compte APRÈS ; `quoi` = un des A.T ; `article` = ce que c'est
function A.argent(p: Player, montant: number, solde: number, quoi: string, article: string?)
	if montant == 0 or montant ~= montant then return end
	local sens = montant > 0 and Enum.AnalyticsEconomyFlowType.Source or Enum.AnalyticsEconomyFlowType.Sink
	pcall(function() AS:LogEconomyEvent(p, sens, "Dollars", math.floor(math.abs(montant)), math.floor(solde), quoi, article) end)
	if montant < 0 and article and string.sub(article, 1, 7) == "caisse:" then etape(p, 6, "Premiere caisse achetee") end
end

-- un événement nommé (un cœur utilisé, un achat en Robux…)
function A.evenement(p: Player, nom: string, valeur: number?)
	pcall(function() AS:LogCustomEvent(p, nom, valeur or 1) end)
end

Players.PlayerRemoving:Connect(A.depart)

return A
