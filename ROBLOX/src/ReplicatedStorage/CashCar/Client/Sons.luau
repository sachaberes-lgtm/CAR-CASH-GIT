-- CASH CAR — LES SONS (côté joueur). Un son = un nom de Config.SONS. Numéro vide → le son de secours
-- livré avec Roblox s'il existe (Config.SONS_SECOURS), sinon silence : un son manquant ne casse JAMAIS rien.
local SoundService = game:GetService("SoundService")
local Config = require(script.Parent.Parent:WaitForChild("Config"))

local Sons = {}
Sons.actif = true
Sons.musiqueActive = true
-- LES CURSEURS du web (VOL.sfx, VOL.mus) : 0-1. La musique a été accordée au réglage d'usine (62 %) : son niveau est relatif à lui.
Sons.volSon = 1
-- (SFX_SOUS_MUS, L25558 ; Léo 3/10 : « les MONSTRE ne doivent pas cacher la musique — ça vaut pour TOUS les effets sonores ») :
-- tous les effets −3 dB sous la musique (le curseur EFFETS s'applique par-dessus)
local SOUS_MUS = 0.7
Sons.volMus = 0.62

local dossier = Instance.new("Folder")
dossier.Name = "CashCarSons"
dossier.Parent = SoundService
-- (banc) la copie de test est muette : tous les sons du jeu passent par ce groupe à volume 0 (voir Config.MUET_TEST) — les
-- volumes et les curseurs continuent de vivre normalement, seul ce qui sort des haut-parleurs est coupé
local muet: SoundGroup? = nil
if Config.MUET_TEST then
	local g = Instance.new("SoundGroup")
	g.Name = "MuetTest"
	g.Volume = 0
	g.Parent = SoundService
	muet = g
	-- (5/10, Sacha : « enlève le son » — il entendait encore les essais) TOUT son qui apparaît dans le jeu, d'où qu'il vienne, est
	-- rangé de force dans le groupe muet, volume à zéro
	local function etouffer(d: Instance)
		if d:IsA("Sound") then
			pcall(function()
				d.SoundGroup = g
				d.Volume = 0
			end)
		end
	end
	for _, d in game:GetDescendants() do pcall(etouffer, d) end
	game.DescendantAdded:Connect(function(d) pcall(etouffer, d) end)
end

local function source(nom: string): string?
	local id = Config.SONS[nom]
	if id and id ~= "" then
		if tonumber(id) then return "rbxassetid://" .. id end
		return id
	end
	return Config.SONS_SECOURS[nom]
end

local VOLUMES = {
	piece = 0.35, tap = 0.4, explosion = 0.8, decollage = 0.45, poseChoc = 0.55, poseLourde = 0.7,
	poseParfait = 0.6, vrille = 0.45, maillon = 0.4, bigAir = 0.5, encaisse = 0.6, pad = 0.55,
	nitroPlein = 0.45, go = 0.6, bip = 0.5, compteFin = 0.6, record = 0.7, portail = 0.7, fronde = 0.5,
}

-- le VRAI son est-il importé ? (sinon on joue le son de secours, souvent à une autre hauteur — ou rien)
function Sons.a(nom: string): boolean
	local id = Config.SONS[nom]
	return id ~= nil and id ~= ""
end

-- un petit bassin par son : on peut rejouer une pièce avant que la précédente ait fini
local bassins: { [string]: { Sound } } = {}
local tours: { [string]: number } = {}
local function bassin(nom: string): { Sound }?
	if bassins[nom] then return bassins[nom] end
	local src = source(nom)
	if not src then
		bassins[nom] = {}
		return bassins[nom]
	end
	local l = {}
	for k = 1, (nom == "piece" or nom == "maillon" or nom == "vrille") and 5 or 2 do
		local s = Instance.new("Sound")
		s.Name = nom .. k
		s.SoundId = src
		s.Volume = VOLUMES[nom] or 0.5
		s.SoundGroup = muet
		s.Parent = dossier
		table.insert(l, s)
	end
	bassins[nom] = l
	tours[nom] = 0
	return l
end

-- joue un son une fois. hauteur = PlaybackSpeed (1 = normal, 2^(n/12) = n demi-tons plus haut)
function Sons.jouer(nom: string, hauteur: number?, volume: number?)
	if not Sons.actif or muet then return end -- (la copie de test ne joue rien du tout)
	local l = bassin(nom)
	if not l or #l == 0 then return end
	tours[nom] = (tours[nom] % #l) + 1
	local s = l[tours[nom]]
	s.PlaybackSpeed = hauteur or 1
	s.Volume = (volume or VOLUMES[nom] or 0.5) * Sons.volSon * SOUS_MUS
	s.TimePosition = 0
	s:Play()
end
-- le VRAI son s'il est importé (à `hauteur`, `volume`) ; sinon son REPLI — ce qu'on entendait avant — à SA hauteur et SON volume.
-- Sans repli et sans import : rien. Un son nouveau ne casse donc jamais rien, et il s'allume le jour où Sacha l'importe.
function Sons.vrai(nom: string, hauteur: number?, volume: number?, repli: string?, hRepli: number?, vRepli: number?)
	if Sons.a(nom) then
		Sons.jouer(nom, hauteur, volume)
	elseif repli then
		Sons.jouer(repli, hRepli or hauteur, vRepli or volume)
	end
end
function Sons.demiTons(n: number): number
	return 2 ^ (n / 12)
end

-- les boucles : moteur, nitro, vent, musique. On règle leur volume et leur hauteur à chaque image.
local boucles: { [string]: Sound } = {}
function Sons.boucle(nom: string): Sound?
	if boucles[nom] ~= nil then return boucles[nom] end
	local src = source(nom)
	if not src then
		boucles[nom] = false :: any
		return nil
	end
	local s = Instance.new("Sound")
	s.Name = "Boucle_" .. nom
	s.SoundId = src
	s.Looped = true
	s.Volume = 0
	s.SoundGroup = muet
	s.Parent = dossier
	s:Play()
	boucles[nom] = s
	return s
end
function Sons.regler(nom: string, volume: number, hauteur: number?)
	local s = Sons.boucle(nom)
	if not s then return end
	local v = (Sons.actif and volume or 0)
	if string.sub(nom, 1, 7) == "musique" then -- (musique, musiqueNuages, musiqueVille, musiqueOrage)
		v = Sons.musiqueActive and v * Sons.volMus / 0.62 or 0
	else
		v *= Sons.volSon * SOUS_MUS
	end
	s.Volume = muet and 0 or v
	if hauteur then s.PlaybackSpeed = hauteur end
end

return Sons
