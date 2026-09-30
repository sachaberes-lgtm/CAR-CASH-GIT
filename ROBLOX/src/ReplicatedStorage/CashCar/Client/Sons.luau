-- CASH CAR — LES SONS (côté joueur). Un son = un nom de Config.SONS. Numéro vide → le son de secours
-- livré avec Roblox s'il existe (Config.SONS_SECOURS), sinon silence : un son manquant ne casse JAMAIS rien.
local SoundService = game:GetService("SoundService")
local Config = require(script.Parent.Parent:WaitForChild("Config"))

local Sons = {}
Sons.actif = true
Sons.musiqueActive = true

local dossier = Instance.new("Folder")
dossier.Name = "CashCarSons"
dossier.Parent = SoundService

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
		s.Parent = dossier
		table.insert(l, s)
	end
	bassins[nom] = l
	tours[nom] = 0
	return l
end

-- joue un son une fois. hauteur = PlaybackSpeed (1 = normal, 2^(n/12) = n demi-tons plus haut)
function Sons.jouer(nom: string, hauteur: number?, volume: number?)
	if not Sons.actif then return end
	local l = bassin(nom)
	if not l or #l == 0 then return end
	tours[nom] = (tours[nom] % #l) + 1
	local s = l[tours[nom]]
	s.PlaybackSpeed = hauteur or 1
	if volume then s.Volume = volume else s.Volume = VOLUMES[nom] or 0.5 end
	s.TimePosition = 0
	s:Play()
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
	s.Parent = dossier
	s:Play()
	boucles[nom] = s
	return s
end
function Sons.regler(nom: string, volume: number, hauteur: number?)
	local s = Sons.boucle(nom)
	if not s then return end
	local v = (Sons.actif and volume or 0)
	if nom == "musique" and not Sons.musiqueActive then v = 0 end
	s.Volume = v
	if hauteur then s.PlaybackSpeed = hauteur end
end

return Sons
