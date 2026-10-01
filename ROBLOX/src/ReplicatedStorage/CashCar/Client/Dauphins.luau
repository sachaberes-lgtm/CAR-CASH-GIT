-- CASH CAR — LE BANC DE DAUPHINS (updateDolphins du jeu web : la figure LE DAUPHIN)
-- Quand la caisse vole près de la route, un banc de dauphins jaillit DEVANT elle et traverse l'écran en arcs, l'un après l'autre :
-- chacun perce la « surface » dans une gerbe d'eau, bondit, replonge dans une autre gerbe, laisse un sillage d'étincelles roses.
-- Le banc GRANDIT avec la tenue (un dauphin de plus toutes les 0,6 s, six au plus) ; au sixième, les six percent ENSEMBLE (le bond
-- royal). Au ras de la route et vite, le banc s'emballe. En dark triad ils sont NOIRS.
-- Ce module ne fait que MONTRER : le compte (aura, figure, nombre de dauphins) est dans Client/Score (DOL).
-- ROBLOX : le dauphin est le maillage du web, cuit (CashCar/Objets, 790 triangles) — un gabarit et cinq copies. On ne peut ni le
-- faire onduler ni le couper au ras de l'eau (pas de shader) : il se fond en perçant la surface, la gerbe fait le reste.
local RunService = game:GetService("RunService")
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local Objets = require(script.Parent.Parent:WaitForChild("Objets"))
local Bus = require(script.Parent:WaitForChild("Bus"))
local Maillage = require(script.Parent:WaitForChild("Maillage"))
local Score = require(script.Parent:WaitForChild("Score"))
local M = Config.M
local V3 = Vector3.new

local Dauphins = {}

-- LE BANC (les gabarits de Léo) : tempo du bond, amplitude, niveau de la « surface », profondeur (vers la caméra = positif),
-- taille ; p0 : où en est chacun au déclenchement (négatif = encore sous l'eau). Ils entrent dans cet ordre.
local BANC = {
	{ speed = 0.30, amp = 3.6, base = -1.6, z = 0, scale = 1.15, p0 = 0 },
	{ speed = 0.24, amp = 2.9, base = -1.2, z = -3.5, scale = 0.85, p0 = -0.15 },
	{ speed = 0.38, amp = 4.1, base = -1.9, z = 1.8, scale = 0.95, p0 = -0.35 },
	{ speed = 0.27, amp = 3.3, base = -1.4, z = 4.6, scale = 0.8, p0 = -0.2 },
	{ speed = 0.33, amp = 3.9, base = -1.8, z = -6.4, scale = 1.0, p0 = -0.3 },
	{ speed = 0.21, amp = 2.6, base = -1.1, z = 2.9, scale = 0.72, p0 = -0.1 },
}
local LONG = 3.2 -- la longueur du corps (les unités du gabarit)
local NOIR = Color3.fromRGB(14, 13, 18)

local D: any = {
	bati = false, pret = false, montre = 0, depuis = 9, dir = -1, kS = 1, W = 13, rasK = 0, syncT = 0, syncVr = 1, sync = false,
	onAvant = false, nbAvant = 0, rep = nil :: CFrame?, vP = nil :: Vector3?, vF = V3(0, 0, -1), noir = false,
	d = {} :: { any },
}
local hote: Part

local function ss(x: number, a: number, b: number): number
	local t = math.clamp((x - a) / (b - a), 0, 1)
	return t * t * (3 - 2 * t)
end

local function emetteur(parent: Instance, couleur: Color3, taille: number, vie0: number, vie1: number, v0: number, v1: number, cone: number, g: number): ParticleEmitter
	local e = Instance.new("ParticleEmitter")
	e.Texture = "rbxasset://textures/particles/sparkles_main.dds"
	e.Color = ColorSequence.new(couleur)
	e.LightEmission = 1
	e.LightInfluence = 0
	e.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, taille), NumberSequenceKeypoint.new(1, taille * 0.35) })
	e.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.05), NumberSequenceKeypoint.new(0.6, 0.3), NumberSequenceKeypoint.new(1, 1) })
	e.Lifetime = NumberRange.new(vie0, vie1)
	e.Speed = NumberRange.new(v0, v1)
	e.SpreadAngle = Vector2.new(cone, cone)
	e.Acceleration = V3(0, -g, 0)
	e.Rate = 0
	e.Enabled = false
	e.EmissionDirection = Enum.NormalId.Top
	e.Parent = parent
	return e
end

local function batir()
	D.bati = true
	hote = Instance.new("Part")
	hote.Name = "Dauphins"
	hote.Anchored = true
	hote.CanCollide, hote.CanQuery, hote.CanTouch = false, false, false
	hote.Transparency = 1
	hote.Size = V3(1, 1, 1)
	hote.Parent = workspace
	task.spawn(function()
		-- (à l'échelle 1 stud par unité : la taille se règle à chaque image sur la vraie caméra)
		local gabarit, centre = Maillage.piece(Objets.dauphin, 1)
		if not gabarit then return end
		gabarit.Anchored = true
		gabarit.Massless = false
		gabarit.CastShadow = false
		gabarit.Material = Enum.Material.SmoothPlastic
		gabarit.Reflectance = 0.08
		gabarit.Transparency = 1
		for i, b in BANC do
			local p = (i == 1) and gabarit or gabarit:Clone()
			p.Name = "Dauphin" .. i
			p.Parent = hote
			-- la gerbe (à la surface, là où il la perce) et le sillage (à la queue)
			local ag = Instance.new("Attachment")
			ag.Parent = hote
			local at = Instance.new("Attachment")
			at.Parent = hote
			D.d[i] = { b = b, p = b.p0, up = false, vr = 0, sy = false, roll = i * 2.3, pret = false, piece = p, taille = p.Size, centre = centre,
				ag = ag, gerbe = emetteur(ag, Color3.fromRGB(214, 250, 255), 1, 0.45, 1.0, 6, 16, 38, 30),
				ecume = emetteur(ag, Color3.fromRGB(214, 250, 255), 0.7, 0.3, 0.5, 8, 14, 84, 12),
				at = at, sillage = emetteur(at, Color3.fromRGB(255, 106, 214), 0.6, 0.45, 0.6, 0, 0.5, 180, 0) }
		end
		D.pret = true
	end)
end

local function cacher()
	if not D.pret or not D.visible then return end
	D.visible = false
	for _, u in D.d do
		u.piece.Transparency = 1
		u.sillage.Enabled = false
	end
end

-- la gerbe : une COURONNE qui monte et un ANNEAU d'écume qui file au ras de l'eau
local function gerbe(u: any, pos: Vector3, haut: CFrame, puissance: number, k: number, nM: number)
	u.ag.WorldCFrame = CFrame.fromMatrix(pos * M, haut.RightVector, haut.UpVector, haut.LookVector * -1)
	local e: ParticleEmitter = u.gerbe
	e.Speed = NumberRange.new(4 * puissance * k * M * 0.4, 9 * puissance * k * M * 0.4)
	e.Acceleration = haut.UpVector * (-6 * k * M)
	e.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.5 * k * M * 0.5), NumberSequenceKeypoint.new(1, 0.15 * k * M * 0.5) })
	e:Emit(math.floor(18 * nM + 0.5))
	local a: ParticleEmitter = u.ecume
	a.Speed = NumberRange.new(1.5 * puissance * k * M, 2.2 * puissance * k * M)
	a.Acceleration = haut.UpVector * (-6 * k * M)
	a.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.4 * k * M * 0.5), NumberSequenceKeypoint.new(1, 0.1 * k * M * 0.5) })
	a:Emit(math.floor(14 * nM + 0.5))
end

local function tick(dt: number)
	local e = Bus.etat()
	local S = Score.DOL
	if not e.carCF then return end
	if e.pause then return end
	-- (mise au point) workspace:SetAttribute("DbgDauphins", true) : le banc nage tant que l'attribut tient, sans attendre un vol
	if workspace:GetAttribute("DbgDauphins") then
		D.dbgT = (D.dbgT or 0) + dt
		S = { on = true, nb = math.min(6, 1 + math.floor(D.dbgT / 0.6)), ras = 0.7, mul = 1.4 }
	else
		D.dbgT = nil
	end
	-- le banc JAILLIT à la première image d'un vol proche de la route, et reste tant qu'on y nage (+ le temps de le voir)
	if S.on and not D.onAvant then
		if D.montre <= 0 then D.nbAvant = 0 end
		D.montre = math.max(D.montre, 2.6)
		D.depuis = 0
	end
	D.onAvant = S.on
	if S.on then D.montre = math.max(D.montre, 0.7) end
	if e.mode ~= "drive" and e.mode ~= "fall" then D.montre = 0 end
	if D.montre <= 0 then
		cacher()
		D.rep, D.vP = nil, nil
		return
	end
	if not D.bati then batir() end
	if not D.pret then return end
	D.visible = true
	local cf: CFrame = e.carCF
	local c = cf.Position / M
	local camCF = workspace.CurrentCamera.CFrame
	local cam = camCF.Position / M
	hote.CFrame = CFrame.new(cf.Position)
	-- LE REPÈRE DU BANC : en vol la trajectoire et le haut de l'écran ; au sol celui de la caisse. Il RALLIE la visée (63 % en 0,17 s)
	-- au lieu de sauter à la pose ; posé d'un coup seulement quand le banc est neuf.
	if D.vP then
		local d = c - D.vP
		if d.Magnitude > 0.02 then D.vF = D.vF:Lerp(d.Unit, 1 - math.exp(-dt * 8)).Unit end
	else
		D.vF = cf.LookVector
	end
	D.vP = c
	local av = (e.mode == "fall") and D.vF or cf.LookVector
	local hautRef = (e.mode == "fall") and camCF.UpVector or cf.UpVector
	local lat = av:Cross(hautRef)
	local neuf = D.depuis == 0
	if lat.Magnitude > 0.5 then
		lat = lat.Unit
		local vise = CFrame.fromMatrix(Vector3.zero, lat, lat:Cross(av), -av) -- x = latéral, y = haut, « devant » = la trajectoire
		D.rep = (neuf or not D.rep) and vise or D.rep:Lerp(vise, 1 - math.exp(-dt * 6))
	elseif not D.rep then
		D.rep = cf.Rotation
	end
	local rep: CFrame = D.rep
	local X, Y, Z = rep.RightVector, rep.UpVector, rep.LookVector -- latéral, haut, avant
	-- LISIBILITÉ : la taille se mesure sur la VRAIE caméra — un dauphin ≈ un tiers de la plus petite dimension de l'image
	local vp = workspace.CurrentCamera.ViewportSize
	local pod0 = c + Y * (-0.35 * D.kS) + Z * (4 + 4 * D.kS)
	local dist = math.max(6, camCF.LookVector:Dot(pod0 - cam))
	local hv = dist * math.tan(math.rad(workspace.CurrentCamera.FieldOfView / 2))
	local hw = hv * vp.X / math.max(1, vp.Y)
	local kT, wT = math.clamp(0.17 * math.min(hv, hw), 0.8, 3), math.max(7, 0.8 * hw)
	if neuf then
		D.kS, D.W, D.dir, D.syncT = kT, wT, -D.dir, 0
		for _, u in D.d do u.p, u.up, u.sy = u.b.p0, false, false end
	else
		local a = math.min(1, dt * 1.5)
		D.kS += (kT - D.kS) * a
		D.W += (wT - D.W) * a
	end
	D.montre -= dt
	D.depuis += dt
	local fondu = math.min(1, math.max(0, D.montre) * 2.5)
	local k, W, dir = D.kS, D.W, D.dir
	local pod = c + Y * (-0.35 * k) + Z * (4 + 4 * k)
	-- LE RAS SE VOIT : au ras ET vite, le banc s'emballe (tempo des bonds jusqu'à × 1,5), les gerbes doublent
	local c9 = (e.mode == "fall" and S.on) and (S.ras or 0) or 0
	D.rasK += (c9 - D.rasK) * (1 - math.exp(-dt * 4))
	local rK = D.rasK
	local tempo = 1 + 0.5 * rK * math.clamp(((S.mul or 1) - 0.6) / 1.5, 0, 1)
	local gK = 1 + rK
	-- le BOND ROYAL : le sixième dauphin vient d'arriver — le banc se rassemble (0,4 s), puis les six percent ensemble
	local nb = math.clamp(S.nb or 1, 1, #BANC)
	if nb >= #BANC and D.nbAvant < #BANC then
		D.syncT = 0.4
		D.syncVr = (math.random() < 0.5) and 1 or -1
	end
	D.nbAvant = nb
	local go = false
	if D.syncT > 0 then
		D.syncT -= dt
		go = D.syncT <= 0
	end
	local noir = Score.frenesie()
	if noir ~= D.noir then -- la DARK TRIAD : la robe passe au noir (la couleur de la pièce multiplie celles des facettes)
		D.noir = noir
		for _, u in D.d do u.piece.Color = noir and NOIR or Color3.new(1, 1, 1) end
	end
	for i, u in D.d do
		local b = u.b
		local piece: MeshPart = u.piece
		if i > nb then
			piece.Transparency = 1
			u.sillage.Enabled = false
			u.pret = false
			continue
		end
		if not u.pret then -- il REJOINT le banc : il perce la surface tout de suite
			u.pret = true
			if not neuf then
				u.p = (D.syncT > 0) and -0.2 or -0.12
				u.up = false
			end
		end
		if D.syncT > 0 then
			if u.p > -0.18 then u.p += dt * 3.6 end
		else
			u.p += dt * (u.sy and 0.096 or b.speed * b.speed) * 8.8 * tempo
		end
		if u.p > 1.2 then -- replongé : un temps sous l'eau, et il revient — une fois sur trois en VRILLE
			u.p = -(0.2 + math.random() * 0.3)
			u.vr = (math.random() < 0.34) and ((math.random() < 0.5) and 1 or -1) or 0
			u.sy = false
		end
		if go then u.p, u.sy, u.vr = -0.12, true, D.syncVr end
		local p = u.p
		local arc = math.sin(p * math.pi)
		local amp, base = b.amp * k, b.base * k
		local x, y, z = dir * W * (2 * p - 1), base + arc * amp, -b.z * k
		local dessus = y > base + 0.15 * k and p > 0 and p < 1
		local pos = pod + X * x + Y * y + Z * z
		if dessus ~= u.up then -- on JAILLIT / on REPLONGE → gerbe (plus fournie au ras, plus haute au bond royal)
			gerbe(u, pod + X * x + Y * (base + 0.05 * k) + Z * z, rep, (dessus and 1.2 or 0.9) * b.scale * (u.sy and 1.4 or 1), k, gK)
			u.up = dessus
		end
		-- la surface le « coupe » : il se fond en la perçant (pas de découpe au pixel chez Roblox)
		local hors = (p > 0 and p < 1) and ss(arc, 0.02, 0.22) or 0
		local alpha = hors * fondu * ss((pos - cam).Magnitude, 2.5, 6)
		if alpha <= 0.02 then
			piece.Transparency = 1
			u.sillage.Enabled = false
			continue
		end
		local s = k * b.scale * (0.5 + 0.5 * fondu)
		local tangage = math.atan2(math.cos(p * math.pi) * amp * math.pi, 2 * W * 0.8) -- le nez suit la vitesse du bond
		u.roll += dt * 1.3
		local roulis = math.sin(u.roll) * 0.12 + u.vr * 6.2832 * ss(p, 0.12, 0.88) -- roulis gracieux (+ la vrille)
		local nez = X * (dir * math.cos(tangage)) + Y * math.sin(tangage)
		local orient = CFrame.lookAt(Vector3.zero, nez, Y) * CFrame.Angles(0, 0, roulis)
		piece.Size = u.taille * (s * M)
		piece.CFrame = CFrame.new(pos * M) * orient * CFrame.new(u.centre * (s * M))
		piece.Transparency = 1 - alpha
		-- le sillage part de la QUEUE
		u.at.WorldPosition = (pos - nez * (LONG * 0.5 * s)) * M
		local sl: ParticleEmitter = u.sillage
		sl.Enabled = dessus
		if dessus then
			sl.Rate = 55
			sl.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.24 * k * M * 0.6), NumberSequenceKeypoint.new(1, 0.05 * k * M) })
			sl.Color = ColorSequence.new(noir and Color3.fromRGB(255, 26, 48) or Color3.fromRGB(255, 106, 214))
		end
	end
end

function Dauphins.init()
	RunService.RenderStepped:Connect(function(dt: number)
		local ok, err = pcall(tick, math.min(dt, 0.05))
		if not ok then
			if not D.erreur then warn("[CashCar] dauphins : " .. tostring(err)) end
			D.erreur = true
			pcall(cacher)
		end
	end)
	-- explosion, nouvelle partie : rien ne nage plus
	Bus.on("mort", function() D.montre = 0 end)
	Bus.on("partie", function() D.montre = 0 end)
end

return Dauphins
