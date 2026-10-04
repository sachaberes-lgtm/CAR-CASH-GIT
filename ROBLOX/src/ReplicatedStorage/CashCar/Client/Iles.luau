-- CASH CAR — LES ÎLES FLOTTANTES du niveau NUAGES (Sacha, 4/10 : « améliore la map… les graphismes au max, avec l'idée de faire un
-- jeu Roblox à succès »). Le ciel du niveau 1 n'avait que du coton : on y roulait sans rien sous les roues que la mer de nuages. Le
-- jeu a pris l'écran titre de Zelda TOTK comme modèle (voir Client/Titre) : ses ÎLES DU CIEL donnent l'échelle, la profondeur, et
-- de quoi regarder en vol. Ici en VOXELS, comme les caisses : un plateau d'herbe, une couche de terre, la roche qui se resserre
-- en STALACTITE vers la mer de nuages, des arbres cubiques (verts, et ROSES : le rose du jeu), parfois une CASCADE qui tombe du
-- bord dans le vide, et sa bruine.
-- Que du décor : aucune collision, aucune ombre portée (de loin, elles ne se voient pas et se paient), et JAMAIS au-dessus ni
-- au-dessous du ruban (la garde, comme celle des nuages : on vole au-dessus de la route, une île y aurait barré la vue).
-- Des Parts recyclées (voir Client/Recyclage) : zéro maillage — le budget de triangles reste aux nuages et aux caisses.
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Recyclage = require(script.Parent:WaitForChild("Recyclage"))
local M = Config.M
local RH = Config.ROAD_HALF
local RGB = Color3.fromRGB

local Iles = {}
-- (banc) les îles posées : centre du plateau (m) et rayon — pour cadrer une photo (DbgOuvre « ile »)
Iles.centres = {} :: { { p: Vector3, r: number } }

-- la PALETTE (le jour d'altitude : herbe tendre, roche lavande comme les ombres des nuages, terre chaude)
local HERBE = { RGB(126, 198, 98), RGB(108, 184, 92), RGB(146, 210, 110) } -- (mesuré au banc : un cran sous le vert pomme — le ciel est pastel)
local TERRE = RGB(150, 104, 78)
local ROCHE = { RGB(168, 158, 196), RGB(140, 130, 174), RGB(116, 106, 152), RGB(94, 86, 130), RGB(80, 72, 116) }
local FEUILLE_V = { RGB(76, 168, 88), RGB(98, 192, 100), RGB(60, 146, 82) }
local FEUILLE_R = { RGB(255, 150, 206), RGB(246, 118, 186), RGB(255, 184, 224) }
local TRONC = RGB(118, 80, 62)
local EAU = RGB(196, 240, 255)

-- une pièce : `base` en MÈTRES (la position), sa rotation ; `off` dans le repère de l'île
local function bloc(dossier: Instance, base: CFrame, off: Vector3, taille: Vector3, couleur: Color3, rotY: number?, mat: Enum.Material?): Part
	local cf = base * CFrame.new(off)
	if rotY then cf *= CFrame.Angles(0, rotY, 0) end
	local p = Recyclage.part()
	p.Anchored = true
	p.CanCollide = false
	p.CanQuery = false
	p.CanTouch = false
	p.CastShadow = false
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.Material = mat or Enum.Material.SmoothPlastic
	p.Size = taille * M
	p.CFrame = CFrame.new(cf.Position * M) * cf.Rotation
	p.Color = couleur
	p.Name = "Ile"
	p.Parent = dossier
	return p
end

-- un ARBRE cubique : tronc, gros cube de feuillage, petit cube au-dessus (tourné de 45° : la silhouette se casse)
local function arbre(dossier: Instance, base: CFrame, x: number, z: number, h: number, rose: boolean, rnd: Random)
	local pal = rose and FEUILLE_R or FEUILLE_V
	local t = h * 0.16
	bloc(dossier, base, Vector3.new(x, h * 0.25, z), Vector3.new(t, h * 0.5, t), TRONC)
	local c = h * (0.5 + rnd:NextNumber() * 0.14)
	bloc(dossier, base, Vector3.new(x, h * 0.5 + c * 0.42, z), Vector3.new(c, c * 0.8, c), pal[rnd:NextInteger(1, #pal)], rnd:NextNumber() * 1.5)
	local c2 = c * 0.62
	bloc(dossier, base, Vector3.new(x + (rnd:NextNumber() - 0.5) * c * 0.3, h * 0.5 + c * 0.82 + c2 * 0.35, z + (rnd:NextNumber() - 0.5) * c * 0.3),
		Vector3.new(c2, c2 * 0.8, c2), pal[rnd:NextInteger(1, #pal)], math.pi / 4 + rnd:NextNumber() * 0.4)
end

-- UNE ÎLE : `top` = le centre du plateau d'herbe (m), r = son rayon (m)
local function ile(dossier: Instance, top: Vector3, r: number, rnd: Random, loin: boolean)
	if #Iles.centres > 200 then table.remove(Iles.centres, 1) end
	table.insert(Iles.centres, { p = top, r = r })
	local yaw = rnd:NextNumber() * math.pi * 2
	local base = CFrame.new(top) * CFrame.Angles(0, yaw, 0)
	local hg = math.max(2.2, r * 0.1)
	-- le PLATEAU : trois dalles croisées (un octogone de voxels), l'herbe dessus
	local l1, l2 = r * (1.7 + rnd:NextNumber() * 0.3), r * (1.3 + rnd:NextNumber() * 0.3)
	bloc(dossier, base, Vector3.new(0, -hg / 2, 0), Vector3.new(l1, hg, l2), HERBE[1])
	bloc(dossier, base, Vector3.new(r * 0.1, -hg / 2 + 0.02, -r * 0.06), Vector3.new(l2, hg, l1), HERBE[2])
	bloc(dossier, base, Vector3.new(-r * 0.12, -hg / 2 + 0.04, r * 0.1), Vector3.new(l1 * 0.8, hg, l1 * 0.8), HERBE[3], math.pi / 4)
	-- la TERRE, juste dessous
	local ht = math.max(1.6, r * 0.09)
	bloc(dossier, base, Vector3.new(0, -hg - ht / 2, 0), Vector3.new(l1 * 0.94, ht, l2 * 0.94), TERRE)
	bloc(dossier, base, Vector3.new(0, -hg - ht / 2, 0), Vector3.new(l2 * 0.94, ht, l1 * 0.94), TERRE)
	-- la ROCHE : quatre étages qui se resserrent et se décalent, puis la pointe (la stalactite qui plonge vers la mer de nuages)
	local y = -hg - ht
	local fk = { 0.86, 0.66, 0.46, 0.28 }
	local ox, oz = 0, 0
	for k, f in fk do
		local h = r * (0.26 + rnd:NextNumber() * 0.12)
		ox += (rnd:NextNumber() - 0.5) * r * 0.18
		oz += (rnd:NextNumber() - 0.5) * r * 0.18
		bloc(dossier, base, Vector3.new(ox, y - h / 2, oz), Vector3.new(l1 * f, h, l2 * f), ROCHE[k])
		bloc(dossier, base, Vector3.new(ox + r * 0.05, y - h / 2 - h * 0.08, oz - r * 0.04), Vector3.new(l2 * f * 0.9, h, l1 * f * 0.9), ROCHE[math.min(#ROCHE, k + 1)], math.pi / 4 * rnd:NextNumber())
		y -= h * 0.92
	end
	local hp = r * (0.3 + rnd:NextNumber() * 0.25)
	bloc(dossier, base, Vector3.new(ox, y - hp / 2, oz), Vector3.new(r * 0.24, hp, r * 0.22), ROCHE[#ROCHE], rnd:NextNumber())
	if loin then return end -- (les îles du lointain : la silhouette suffit, la brume mange le détail)
	-- les ARBRES (roses sur une île sur trois)
	local rose = rnd:NextNumber() < 0.34
	local na = 1 + math.floor(r / 22 + rnd:NextNumber() * 2)
	for _ = 1, na do
		local a, d = rnd:NextNumber() * math.pi * 2, math.sqrt(rnd:NextNumber()) * r * 0.55
		arbre(dossier, base, math.cos(a) * d, math.sin(a) * d, r * (0.3 + rnd:NextNumber() * 0.22), rose, rnd)
	end
	-- la CASCADE (une île sur trois) : un bassin au bord, la chute dans le vide, la bruine en bas
	if rnd:NextNumber() < 0.36 then
		local a = rnd:NextNumber() * math.pi * 2
		local ex, ez = math.cos(a), math.sin(a)
		local bord = math.min(l1, l2) * 0.5
		local w = math.max(2, r * 0.16)
		bloc(dossier, base, Vector3.new(ex * bord * 0.62, 0.05, ez * bord * 0.62), Vector3.new(w * 1.6, 0.4, w * 1.6), EAU, a, Enum.Material.Glass)
		local hc = r * (1.3 + rnd:NextNumber() * 0.6)
		local chute = bloc(dossier, base, Vector3.new(ex * (bord + 0.4), -hc / 2, ez * (bord + 0.4)), Vector3.new(w, hc, w * 0.35), EAU, -a + math.pi / 2)
		chute.Transparency = 0.18
		local bruine = bloc(dossier, base, Vector3.new(ex * (bord + 0.4), -hc, ez * (bord + 0.4)), Vector3.new(w * 2.6, w * 2.6, w * 2.6), Color3.new(1, 1, 1))
		bruine.Shape = Enum.PartType.Ball
		bruine.Transparency = 0.66
	end
end

-- les îles d'une zone du niveau NUAGES. Rend le nombre d'îles posées.
function Iles.batir(piste: any, dossier: Instance, graine: number, ceder: (() -> ())?): number
	local rnd = Random.new(graine)
	local F = piste.F
	local NP = piste.n
	local L = piste.len / M
	local DS = piste.DS / M
	-- la GARDE : la piste en cases de 150 m, un point tous les ~20 m (en plan : une île n'est jamais au-dessus ni au-dessous du ruban)
	local pasG = math.max(1, math.floor(20 / DS + 0.5))
	local grille: { [number]: { Vector3 } } = {}
	for i = 1, NP, pasG do
		local p = F[i].Position / M
		local k = (math.floor(p.X / 150) + 512) * 1024 + math.floor(p.Z / 150) + 512
		grille[k] = grille[k] or {}
		table.insert(grille[k], p)
	end
	local function libre(x: number, z: number, r: number): boolean
		local rh = r + RH + 70
		local n = math.ceil(rh / 150)
		local cx, cz = math.floor(x / 150), math.floor(z / 150)
		for a = -n, n do
			for b = -n, n do
				local l = grille[(cx + a + 512) * 1024 + cz + b + 512]
				if l then
					for _, p in l do
						local dx, dz = p.X - x, p.Z - z
						if dx * dx + dz * dz < rh * rh then return false end
					end
				end
			end
		end
		return true
	end
	local function travers(i: number): (number, number)
		local t = F[i].LookVector
		local l = math.sqrt(t.X * t.X + t.Z * t.Z)
		if l < 1e-6 then return 1, 0 end
		return -t.Z / l, t.X / l
	end
	local nb = 0
	-- (1) LA COURONNE : des îles moyennes le long de la route, le plateau entre le ruban et 120 m au-dessus — c'est d'où on les VOIT en
	-- roulant (mesuré au banc : posées sous le ruban, la dalle les cachait toutes à la caméra de poursuite) ; une sur quatre plus bas,
	-- pour le vol
	local K = math.clamp(math.floor(L / 360), 8, 30)
	for k = 0, K - 1 do
		local i = math.min(NP, math.floor(((k + 0.15 + rnd:NextNumber() * 0.7) / K) * NP) + 1)
		local p = F[i].Position / M
		local qx, qz = travers(i)
		local sg = (rnd:NextNumber() < 0.5) and -1 or 1
		local r = 32 + rnd:NextNumber() ^ 1.4 * 88
		local d = RH + r + 60 + rnd:NextNumber() ^ 1.4 * 420 -- (plutôt près : de loin, la brume et le flou de vitesse les effacent)
		local y = (rnd:NextNumber() < 0.75) and (p.Y - 15 + rnd:NextNumber() * 135) or (p.Y - 60 - rnd:NextNumber() * 110)
		for _ = 1, 3 do
			local x, z = p.X + qx * sg * d, p.Z + qz * sg * d
			if libre(x, z, r * 1.2) then
				ile(dossier, Vector3.new(x, y, z), r, rnd, false)
				nb += 1
				if ceder then ceder() end
				break
			end
			d += 140
		end
	end
	-- (2) LE LOINTAIN : quelques géantes, silhouettes dans la brume (pas d'arbres : la brume les mange)
	for k = 0, math.clamp(math.floor(L / 1500), 3, 7) - 1 do
		local i = math.min(NP, math.floor(((k + rnd:NextNumber()) / math.clamp(math.floor(L / 1500), 3, 7)) * NP) + 1)
		local p = F[i].Position / M
		local qx, qz = travers(i)
		local sg = (rnd:NextNumber() < 0.5) and -1 or 1
		local r = 110 + rnd:NextNumber() * 90
		local d = RH + r + 700 + rnd:NextNumber() * 900
		local x, z = p.X + qx * sg * d, p.Z + qz * sg * d
		if libre(x, z, r * 1.1) then
			ile(dossier, Vector3.new(x, p.Y + rnd:NextNumber() * 160, z), r, rnd, true)
			nb += 1
			if ceder then ceder() end
		end
	end
	return nb
end

-- UNE ÎLE DE MAQUETTE pour l'écran titre (Client/Titre) : bâtie à l'origine, rendue en pièces + leurs poses RELATIVES au centre
-- du plateau (le titre les déplace d'un bloc, avec les cumulus qui montent)
function Iles.maquette(dossier: Instance, r: number, graine: number): { parts: { BasePart }, offs: { CFrame } }
	local f = Instance.new("Folder")
	ile(f, Vector3.zero, r, Random.new(graine), false)
	local res = { parts = {}, offs = {} }
	for _, p in f:GetChildren() do
		table.insert(res.parts, p :: BasePart)
		table.insert(res.offs, (p :: BasePart).CFrame)
		p.Parent = dossier
	end
	f:Destroy()
	table.remove(Iles.centres) -- (une île de titre n'est pas une île de la piste)
	return res
end

-- (banc) une vue sur l'île la plus proche d'un point (studs) : de trois quarts, un peu au-dessus
function Iles.vue(depuis: Vector3): CFrame?
	local best, bd = nil, math.huge
	for _, c in Iles.centres do
		local d = (c.p * M - depuis).Magnitude
		if d < bd and c.r < 100 then best, bd = c, d end
	end
	if not best then return nil end
	local cible = (best.p - Vector3.new(0, best.r * 0.5, 0)) * M
	local oeil = cible + Vector3.new(best.r * 2.2, best.r * 0.9, best.r * 1.6) * M
	return CFrame.lookAt(oeil, cible)
end

return Iles
