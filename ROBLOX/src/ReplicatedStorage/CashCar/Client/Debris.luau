-- CASH CAR — L'ORBITE · LA PLUIE DE DÉBRIS (DEB, debArme, debTick, debFrappe : L32903 du jeu web).
-- Des morceaux de satellites qui RENTRENT en brûlant. Un cercle rouge se pose LÀ OÙ TU SERAS dans 1,5 s ; il se resserre en battant,
-- un FAISCEAU rouge se dresse sur la cible (on la lit de loin), le débris arrive de trois-quarts avant avec sa traîne, et frappe
-- pile dedans. TOUCHÉ = −40 % de vitesse, du flow perdu, la gerbe te soulève ; ESQUIVÉ de près = de l'aura, un peu de nitro, et la
-- série fait monter la mise. Sous la dalle : à l'abri. (Les règles — qui est touché, ce que ça coûte — sont dans le Pilote : ici,
-- la cible, la chute et l'impact.)
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Piste = require(script.Parent.Parent:WaitForChild("Piste"))
local M = Config.M
local RH = Config.ROAD_HALF

local Debris = { on = false, t = 0, prochain = 4.2, dit = false, serie = 0, p1 = Vector3.zero, n = Vector3.yAxis }
Debris.T = 1.5 -- le préavis : le temps de LIRE la cible et de braquer ; en dessous c'est une loterie
Debris.R = 7.5 -- le rayon de la frappe (m)

local ROUGE = Color3.fromRGB(255, 51, 32)
local RMAX = Debris.R * 2.3
local V: any = nil -- les pièces (bâties une fois)

local function batir()
	if V then return end
	local d = Instance.new("Folder")
	d.Name = "Debris"
	local function invisible(nom: string): Part
		local p = Instance.new("Part")
		p.Name = nom
		p.Anchored = true
		p.CanCollide, p.CanQuery, p.CanTouch = false, false, false
		p.CastShadow = false
		p.Transparency = 1
		p.Size = Vector3.new(1, 1, 1)
		p.Parent = d
		return p
	end
	-- LA CIBLE : une plaque posée sur la dalle, un anneau et un disque peints dessus
	local cible = invisible("Cible")
	cible.Size = Vector3.new(RMAX * 2 * M, 0.05, RMAX * 2 * M)
	local sg = Instance.new("SurfaceGui")
	sg.Face = Enum.NormalId.Top
	sg.SizingMode = Enum.SurfaceGuiSizingMode.FixedSize
	sg.CanvasSize = Vector2.new(512, 512)
	sg.LightInfluence = 0
	sg.Brightness = 5 -- (mesuré au banc : à 2, sous le soleil dur de l'orbite, la cible se lisait à peine)
	sg.Parent = cible
	local function rond(): (Frame, UIStroke)
		local f = Instance.new("Frame")
		f.AnchorPoint = Vector2.new(0.5, 0.5)
		f.Position = UDim2.fromScale(0.5, 0.5)
		f.BackgroundColor3 = Color3.fromRGB(255, 42, 16)
		f.BackgroundTransparency = 1
		f.BorderSizePixel = 0
		f.Parent = sg
		local c = Instance.new("UICorner")
		c.CornerRadius = UDim.new(0.5, 0)
		c.Parent = f
		local st = Instance.new("UIStroke")
		st.Color = ROUGE
		st.Thickness = 0
		st.Parent = f
		return f, st
	end
	local anneau, trait = rond()
	local disque = rond()
	-- LE FAISCEAU (dressé sur la dalle) et LA TRAÎNE (derrière la tête) : deux rubans tournés vers l'œil
	local ancre = invisible("Ancre")
	ancre.CFrame = CFrame.identity
	local function ruban(c: ColorSequence, t: NumberSequence): (Beam, Attachment, Attachment)
		local a0, a1 = Instance.new("Attachment"), Instance.new("Attachment")
		a0.Parent, a1.Parent = ancre, ancre
		local b = Instance.new("Beam")
		b.Attachment0, b.Attachment1 = a0, a1
		b.FaceCamera = true
		b.Segments = 1
		b.Color = c
		b.Transparency = t
		b.LightEmission = 1
		b.LightInfluence = 0
		b.Parent = ancre
		return b, a0, a1
	end
	local K = NumberSequenceKeypoint.new
	local faisceau, f0, f1 = ruban(ColorSequence.new(Color3.fromRGB(255, 60, 36)), NumberSequence.new({ K(0, 0.1), K(0.35, 0.55), K(1, 1) }))
	local traine, t0, t1 = ruban(ColorSequence.new({ ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 245, 215)),
		ColorSequenceKeypoint.new(0.18, Color3.fromRGB(255, 170, 70)), ColorSequenceKeypoint.new(0.6, Color3.fromRGB(255, 70, 30)),
		ColorSequenceKeypoint.new(1, Color3.fromRGB(200, 30, 20)) }), NumberSequence.new({ K(0, 0.05), K(0.18, 0.25), K(0.6, 0.75), K(1, 1) }))
	-- LA TÊTE : une braise blanche
	local tete = invisible("Tete")
	tete.Shape = Enum.PartType.Ball
	tete.Material = Enum.Material.Neon
	tete.Color = Color3.fromRGB(255, 226, 160)
	-- L'IMPACT : une boule de feu qui gonfle et s'efface
	local boum = invisible("Boum")
	boum.Shape = Enum.PartType.Ball
	boum.Material = Enum.Material.Neon
	boum.Color = Color3.fromRGB(255, 120, 40)
	d.Parent = workspace
	V = { d = d, cible = cible, anneau = anneau, trait = trait, disque = disque, faisceau = faisceau, f0 = f0, f1 = f1,
		traine = traine, t0 = t0, t1 = t1, tete = tete, boum = boum, boumT = 0, p0 = Vector3.zero, dir = Vector3.yAxis }
end

local function montrer(oui: boolean)
	if not V then return end
	V.faisceau.Enabled, V.traine.Enabled = oui, oui
	V.tete.Transparency = oui and 0 or 1
	if not oui then
		V.trait.Thickness = 0
		V.disque.BackgroundTransparency = 1
	end
end

-- plus de débris (on quitte l'orbite, on meurt, on revient au menu)
function Debris.cache()
	if Debris.on or Debris.prochain ~= 4.2 then
		Debris.on, Debris.prochain, Debris.dit, Debris.serie = false, 4.2, false, 0
		montrer(false)
	end
end

-- ARMER une chute : la cible tombe là où la caisse sera dans T secondes (avance = m/s le long de la piste), sur SA ligne à ±4 m
function Debris.arme(piste: any, s: number, lat: number, avance: number): boolean
	local L = piste.len / M
	local ts = s + avance * Debris.T
	if ts < 140 or ts > L - 150 then return false end -- le départ et l'approche du portail restent calmes
	batir()
	local tl = math.clamp(lat + (math.random() - 0.5) * 8, -(RH - 5), RH - 5)
	local f = Piste.repere(piste, ts * M)
	local t, b, n = f.LookVector, f.RightVector, f.UpVector
	Debris.on, Debris.t, Debris.n = true, 0, n
	Debris.p1 = f.Position + (b * tl + n * 0.14) * M
	-- de trois-quarts avant, en pente douce : dans le cadre tôt, la traîne visible
	V.dir = (n * 0.45 + t * 0.72 + b * ((math.random() < 0.5) and -0.5 or 0.5)).Unit
	V.p0 = Debris.p1 + V.dir * (720 * M)
	V.cible.CFrame = CFrame.fromMatrix(Debris.p1, b, n)
	V.f0.WorldPosition = Debris.p1
	montrer(true)
	return true
end

-- À chaque image tant qu'une chute est armée. Rend true à l'IMPACT (la cible est alors rangée).
function Debris.tick(dt: number, camCF: CFrame): boolean
	local D = Debris
	D.t += dt
	local u = math.min(1, D.t / D.T)
	local e = u ^ 1.35 -- il ACCÉLÈRE en tombant
	local pos = V.p0:Lerp(D.p1, e)
	local dC = (pos - camCF.Position).Magnitude / M
	local taille = math.clamp(dC * 0.045, 3, 22) * M
	V.tete.Size = Vector3.new(taille, taille, taille)
	V.tete.CFrame = CFrame.new(pos)
	V.t0.WorldPosition = pos
	V.t1.WorldPosition = pos + V.dir * ((120 + u * 150) * M)
	V.traine.Width0, V.traine.Width1 = math.clamp(dC * 0.03, 3.5, 20) * M, 0
	-- LA CIBLE : l'anneau se resserre en battant, le disque se remplit ; SOUS L'ŒIL (la caméra survole la cible) tout s'efface
	local R = D.R * (1 + 1.3 * (1 - u))
	local pul = 0.55 + 0.45 * math.sin(D.t * (10 + 26 * u))
	local kO = math.clamp(((D.p1 - camCF.Position).Magnitude / M - 12) / 22, 0, 1)
	V.anneau.Size = UDim2.fromScale(R / RMAX, R / RMAX)
	V.trait.Thickness = 512 * 0.2 * R / RMAX * 0.5
	V.trait.Transparency = 1 - (0.6 + 0.4 * u) * (0.7 + 0.3 * pul) * (0.3 + 0.7 * kO)
	local r9 = D.R * math.max(0.02, u)
	V.disque.Size = UDim2.fromScale(r9 / RMAX, r9 / RMAX)
	V.disque.BackgroundTransparency = 1 - (0.2 + 0.36 * u) * kO
	V.f1.WorldPosition = D.p1 + D.n * ((34 + u * 20) * M)
	V.faisceau.Width0, V.faisceau.Width1 = (2.2 + u * 1.6) * M, (2.2 + u * 1.6) * M * 0.4
	-- (sous l'œil, le faisceau s'efface lui aussi : il rougissait la moitié de l'écran quand la caisse passait dessus)
	local op = (0.55 + 0.4 * u) * (0.2 + 0.8 * kO)
	V.faisceau.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1 - op), NumberSequenceKeypoint.new(0.35, 1 - op * 0.5), NumberSequenceKeypoint.new(1, 1) })
	if u < 1 then return false end
	-- L'IMPACT
	D.on = false
	montrer(false)
	V.boum.CFrame = CFrame.new(D.p1)
	V.boumT = 0.4
	return true
end

-- la boule de feu de l'impact (elle vit après la chute : à appeler à chaque image)
function Debris.suite(dt: number)
	if not V or V.boumT <= 0 then return end
	V.boumT -= dt
	local k = 1 - math.max(0, V.boumT) / 0.4
	local t = (Debris.R * (0.6 + 1.6 * k)) * 2 * M
	V.boum.Size = Vector3.new(t, t, t)
	V.boum.Transparency = (V.boumT <= 0) and 1 or (0.25 + 0.75 * k)
end

return Debris
