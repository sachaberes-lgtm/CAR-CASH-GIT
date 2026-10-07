-- CASH CAR — LA CAMÉRA, reprise du jeu web d'aujourd'hui (VERSION PRINCIPALE/index.html, boucle L36968-37090 et L37280-37330).
--
-- SUR ROUTE — « LA CAMÉRA COLLE À LA CAISSE » : on lisse l'ÉCART caisse→caméra, jamais la position dans le monde (lissée
-- dans le monde, la caméra traîne de vitesse ÷ 7 : à fond la caisse devient un point au loin). Par-dessus :
--   · LA CAMÉRA HÉROS (CAM_HEROS) : le champ tenu s'ouvre peu avec la vitesse, « ça pousse » se dit par l'ACCÉLÉRATION
--     (un coup de champ qui se referme), la caméra AVANCE quand le champ s'ouvre (la caisse garde sa taille), la nitro ne
--     la recule presque plus, elle descend un peu vers la route à haute vitesse ;
--   · le RETARD LATÉRAL : on voit la caisse partir vers le bord de l'écran, la caméra la rejoint (0,22 s) ;
--   · LE REGARD SUIT LA ROUTE (CAM_REGARD) : la visée se tire vers un point de la piste 0,45 s devant, sur TA ligne ;
--   · LE CABRAGE ANTICIPÉ (CAM_ROUTE) : devant un mur la caméra lève le nez, devant un sommet elle pique — en pivotant
--     autour de la caisse, qui reste à sa place à l'écran ;
--   · LE TONNEAU : dessus ↔ dessous, la caméra ROULE autour de l'axe du regard au lieu de couper à travers la dalle.
-- EN VOL — la caméra de POURSUITE : derrière la trajectoire, au-dessus de la caisse (son haut à elle, pas le ciel), le
-- retard installé en 0,6 s ; le BRAS garde la caisse à sa taille du décollage ; le champ se resserre avec l'ampleur du saut.
-- À LA MORT — BOOM_CAM : elle recule à 14 m en 0,55 s puis à 17 m, 16° au-dessus, et tourne à 7°/s.
--
-- Tout est en MÈTRES du jeu web, converti par M au dernier moment. Les fonctions rendent la place, la visée, le haut et
-- le champ : c'est le pilote qui pose la caméra (et ses secousses).
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local M = Config.M
local SPD = Config.SPD

local Camera = {}

local ROUTE = { ANTICIPE = 0.5, ANTICIPE_DESSOUS = 0.9, VOIR_LOIN = 0.65, LOIN_MIN = 38, LOIN_MAX = 90, HAUT_MAX = 22, GARDE = 12, BAS_MAX = 24, LISSE = 0.2, TONNEAU = 7 }
local REGARD = { k = 0.45, min = 35, max = 90, por = 0.3 }
local TAILLE = { fovMax = 125, genou = 6, recMax = 0.6 }
local HEROS = { ref = 86, dMin = 0.88, dMax = 1, kick = 16, accK = 200, tau = 0.6, boost = 0.2, bas = 0.08, vise = 1.2, recP = 1.1, fovMaxL = 112, genouL = 8 }
local SECOUSSE_V = 0.45 -- CAM_SHAKE_V
-- (6/10) LA REPRISE (après un vol, la mort, le menu) se lisait au CHRONOMÈTRE : plus de 0,15 s entre deux images = « on reprend ».
-- Une image qui tousse (un portail, le ramasse-miettes, un téléphone bridé) ou la PAUSE la déclenchaient à tort : le cabrage
-- anticipé retombait d'un coup à zéro, le retard latéral et la visée se recalaient — la caméra SAUTAIT. Les vraies reprises sont
-- désormais dites par les changements de caméra eux-mêmes (route ↔ vol ↔ mort) ; le chronomètre ne garde que les longues
-- absences (le garage, le menu), et la pause tient les horloges (Camera.tenir).
local REPRISE = 0.5
local JAMAIS = -1e9

-- l'état (une seule caméra : celle du joueur)
local S = {
	off = Vector3.zero, vise = nil :: Vector3?, viseR = 1, tVise = 0, tRoute = 0, carPrev = nil :: Vector3?,
	camLat = nil :: number?, tLat = 0, phi = 0, sg = 1, vif = false, tonneau = false, up = Vector3.yAxis,
	fovB = 72, tFov = 0, v0 = -1, acc = 0, zoom = 0, lean = 0, nitroOff = 0, nitroAvant = false,
	tVol = 0, s0 = 0.2, airT = 0, boomT = 0, boomOff = Vector3.zero, boomAng = 0, fov = 72,
}
Camera.etat = S

-- ── le format de l'écran (fovFit, L6823) : POR 0 couché → 1 debout ; en portrait on élargit la TANGENTE du champ ──
local POR, FOV_TK = 0, 1
local function format()
	local v = workspace.CurrentCamera.ViewportSize
	local a = v.X / math.max(1, v.Y)
	local fovK = (a < 1) and math.min(1.30, math.max(1, 0.80 / a)) or 1
	FOV_TK = math.tan(fovK * 0.2 * math.pi) / math.tan(0.2 * math.pi)
	POR = math.clamp((1 - a) / 0.42, 0, 1)
end
local function fovPor(d: number): number
	if FOV_TK == 1 then return d end
	return math.min(150, math.deg(math.atan(math.tan(math.rad(math.min(170, d)) / 2) * FOV_TK)) * 2)
end
local function lisse(x: number, a: number, b: number): number
	local t = math.clamp((x - a) / (b - a), 0, 1)
	return t * t * (3 - 2 * t)
end
local function tourne(v: Vector3, axe: Vector3, angle: number): Vector3
	return CFrame.fromAxisAngle(axe, angle):VectorToWorldSpace(v)
end

-- le coup de ZOOM d'une pose parfaite (CAMV.zoom) : −24° à l'impact, relâché en 0,5 s
function Camera.zoom(z: number) S.zoom = math.max(S.zoom, z) end
function Camera.portrait(): number return POR end

export type Route = {
	carCF: CFrame, cf: CFrame, s: number, L: number, lat: number, side: number, psi: number, vA: number, kmh: number, vCrois: number,
	vitMult: number, nitroOn: boolean, bleue: boolean, boost: number, steer: number, flow: number, punch: number,
	l: number, h: number, repere: (number, number) -> CFrame,
}

-- LE TONNEAU (camRouteTonneau) : `cible` = l'écart caisse→caméra voulu, `axe` = l'axe du regard
local function tonneau(cible: Vector3, axe: Vector3, N: Vector3, dt: number): Vector3
	S.vif = false
	local v = S.up - axe * S.up:Dot(axe)
	local w = N - axe * N:Dot(axe)
	if v.Magnitude < 0.01 or w.Magnitude < 0.01 then return cible end
	v, w = v.Unit, w.Unit
	local a = math.atan2(w:Cross(v):Dot(axe), v:Dot(w)) -- de combien la caméra est ROULÉE par rapport à la face
	if math.abs(a) > 3.05 then a = 3.05 * S.sg end
	S.sg = (a < 0) and -1 or 1
	local aA = math.abs(a)
	if aA > 1.05 then S.tonneau = true elseif aA < 0.09 then S.tonneau = false end
	if not S.tonneau and aA < 0.5 then return cible end
	local r = a
	if S.tonneau then
		S.vif = true
		r = a * math.exp(-dt * ROUTE.TONNEAU)
		S.up = tourne(S.up, axe, r - a) -- le haut ROULE (il ne passe plus par zéro)
	end
	return tourne(cible, axe, r * (S.tonneau and 1 or lisse(aA, 0.5, 1.05)))
end

-- ════════ SUR ROUTE ════════ rend : place, visée, haut (studs) et champ (°)
function Camera.route(dt: number, X: Route, camPos: Vector3): (Vector3, Vector3, Vector3, number)
	format()
	local now = os.clock()
	local p = X.carCF.Position
	local cf = X.cf
	local T, N, B = cf.LookVector, cf.UpVector, cf.RightVector
	local fwd = (cf.Rotation * CFrame.Angles(0, -X.psi, 0)).LookVector
	local hC = math.max(0, X.h - 1.5) -- les HAUTES (monster truck, combi) : on recule et on monte d'autant
	local vCam = math.min(X.kmh, TAILLE.recMax / 0.0018)
	local camBoost = math.min(1, (X.nitroOn and 0.72 or 0) + math.min(1, math.max(0, X.boost)) * 0.5)
	local bCam = camBoost * HEROS.boost
	-- le VERTIGO : quand le champ s'ouvre, la caméra AVANCE d'autant
	local dolly = math.clamp(math.tan(math.rad(fovPor(HEROS.ref)) / 2) / math.tan(math.rad(math.min(170, S.fovB)) / 2), HEROS.dMin, HEROS.dMax)
	local hz = 1 - HEROS.bas * math.clamp(X.kmh / math.max(1, X.vCrois) - 0.6, 0, 1)
	local camBack = (3.6 + X.l * 0.42 + hC * 1.6 + vCam * 0.0018 + bCam * 1.6) * (1 - POR * 0.28) * dolly * (1 + (HEROS.recP - 1) * POR)
	local camH = (camBack * 0.40 + hC * 0.9 + vCam * 0.0012 + bCam * 0.25) * (1 + POR * 0.70) * hz
	S.lean = X.steer * 0.065
	-- derrière un axe MI-ROUTE MI-CAISSE
	local camD = T:Lerp(fwd, 0.55).Unit
	-- le retard latéral (~0,22 s), plafonné à 30 % du recul
	if S.camLat == nil or now - S.tLat > REPRISE then S.camLat = X.lat end
	S.tLat = now
	S.camLat = (S.camLat :: number) + (X.lat - (S.camLat :: number)) * (1 - math.exp(-dt / 0.22))
	local cLag = math.clamp((S.camLat :: number) - X.lat, -camBack * 0.3, camBack * 0.3)
	local cible = (-camD * camBack + N * camH + B * cLag) * M
	-- l'écart repart de la caméra RÉELLE à chaque reprise de conduite (après un vol, le garage, un replacement)
	if now - S.tRoute > REPRISE then
		local prev = S.carPrev
		S.off = camPos - ((prev and (prev - p).Magnitude < 30 * M) and prev or p)
		S.phi = 0
	end
	S.tRoute = now
	cible = tonneau(cible, camD, N, dt)
	if (S.off - cible).Magnitude > 50 * M then S.off = cible end -- un saut (portail, replacement) : on ne lisse pas 50 m
	local r9 = S.viseR
	S.off = S.off:Lerp(cible, math.min(1, dt * (S.vif and 16 or 7 * (0.3 + 0.7 * r9 * r9))))
	local pos = p + S.off
	S.carPrev = p
	S.up = S.up:Lerp(N, math.min(1, dt * 4)).Unit
	local up = tourne(S.up, fwd, -S.lean) -- la caméra penche avec toi
	-- la visée : devant la caisse, puis tirée vers la route à venir, sur TA ligne
	local v = p + fwd * ((8.5 + POR * 1.2) * M) + N * ((1.05 - POR * 0.55 - HEROS.vise * POR) * M) + B * (cLag * 0.5 * M)
	do
		local dR = math.clamp(math.abs(X.vA) * SPD * X.vitMult * REGARD.k, REGARD.min, REGARD.max)
		local fv = X.repere(math.clamp(X.s + dR, 0, X.L - 1), X.side)
		local pr = fv.Position + fv.RightVector * (X.lat * M) + fv.UpVector * (1.2 * M)
		local dd = (pr - v).Magnitude / M
		local kV = 0.35 * (1 + REGARD.por * POR) * (REGARD.min / dR) * math.clamp(1 - (dd - dR * 8 / 7) / (dR * 12 / 7), 0, 1)
		v = v:Lerp(pr, kV) - p
		-- la visée reprend en douceur après un vol (×2,2/s), et retrouve son régime (×9/s) en 0,6 s
		S.viseR = math.min(1, S.viseR + dt / 0.6)
		local saut = now - S.tVise > REPRISE
		S.tVise = now
		if not S.vise or saut then
			S.vise = v
		else
			S.vise = (S.vise :: Vector3):Lerp(v, math.min(1, dt * (2.2 + 6.8 * S.viseR * S.viseR)))
		end
	end
	local vise = p + (S.vise :: Vector3)
	-- LE CABRAGE ANTICIPÉ : tout le plan pivote autour de la caisse d'une part du cabrage de la route à venir
	do
		local D = math.clamp(math.abs(X.vA) * SPD * ROUTE.VOIR_LOIN, ROUTE.LOIN_MIN, ROUTE.LOIN_MAX)
		local fa = X.repere(math.clamp(X.s + D, 0, X.L - 0.01), X.side)
		local th = math.atan2(fa.LookVector:Dot(N), fa.LookVector:Dot(T))
		local haut = math.rad(math.max(0, math.min(ROUTE.HAUT_MAX, math.deg(math.atan2(camH, camBack)) - ROUTE.GARDE)))
		local visee = math.clamp(th * ((X.side < 0) and ROUTE.ANTICIPE_DESSOUS or ROUTE.ANTICIPE), -math.rad(ROUTE.BAS_MAX), haut)
		S.phi += (visee - S.phi) * (1 - math.exp(-dt / ROUTE.LISSE))
		local axe = T:Cross(N)
		if axe.Magnitude > 1e-4 and math.abs(S.phi) > 1e-5 then
			S.axePhi = axe.Unit -- (le vol le garde : voir Camera.vol)
			local q = CFrame.fromAxisAngle(axe.Unit, S.phi)
			pos = p + q:VectorToWorldSpace(pos - p)
			vise = p + q:VectorToWorldSpace(vise - p)
			up = q:VectorToWorldSpace(up)
		end
	end
	-- LE CHAMP : « ça pousse » = la PRISE DE VITESSE (l'écart entre la vitesse et sa moyenne lente)
	local r = X.kmh / math.max(1, X.vCrois)
	if S.v0 < 0 or math.abs(X.kmh - S.v0) > 400 then S.v0 = X.kmh end
	S.v0 += (X.kmh - S.v0) * (1 - math.exp(-dt / HEROS.tau))
	local a9 = X.kmh - S.v0
	S.acc += (math.clamp(a9 / HEROS.accK, 0, 1) - S.acc) * (1 - math.exp(-dt * ((a9 > S.acc * HEROS.accK) and 8 or 2)))
	local fb = 72 + X.flow * 1.1 + math.min(16, r * 10 + math.max(0, r - 1) * 4) + ((X.boost > 0) and 4 or 0)
		+ (X.nitroOn and (X.bleue and 10 or 7) or 0) + HEROS.kick * S.acc
	local fovT = math.min(160, fovPor(X.punch + fb))
	local f0 = math.min(160, fovPor(fb))
	-- le champ TENU passe par un genou (125° debout, 112° couché) ; les COUPS passent par-dessus, intacts
	local fmax, genou = (POR > 0.5) and TAILLE.fovMax or HEROS.fovMaxL, (POR > 0.5) and TAILLE.genou or HEROS.genouL
	local K = fmax - genou
	fovT = ((f0 <= K) and f0 or (K + genou * (1 - math.exp(-(f0 - K) / genou)))) + (fovT - f0)
	if now - S.tFov > REPRISE then S.fovB = S.fov end -- le champ de base repart du vrai champ à chaque reprise
	S.tFov = now
	if S.nitroAvant and not X.nitroOn then S.nitroOff = 1.2 end -- à l'extinction de la nitro, le champ RETOMBE en douceur
	S.nitroAvant = X.nitroOn
	S.nitroOff = math.max(0, S.nitroOff - dt)
	S.fovB += (fovT - S.fovB) * math.min(1, dt * ((S.nitroOff > 0 and fovT < S.fovB) and 2.4 or 6))
	S.zoom = math.max(0, S.zoom - dt * 2)
	S.fov = math.max(20, S.fovB - 24 * S.zoom * S.zoom)
	S.tVol = JAMAIS -- (le prochain vol sera une vraie reprise : sa 1re image, sa taille mesurée)
	return pos, vise, up, S.fov
end

-- (6/10) LA PAUSE TIENT LES HORLOGES : la caméra dort sous le panneau ; sans ça, la reprise du 3-2-1 passait pour un retour de vol
-- (le cabrage anticipé retombait à zéro d'un coup, la visée se recalait : un à-coup à chaque pause)
function Camera.tenir()
	local now = os.clock()
	for _, k in { "tRoute", "tLat", "tVise", "tFov", "tVol" } do
		if now - S[k] < REPRISE then S[k] = now end
	end
end

-- les secousses de la ROUTE : des COUPS en sinus désaccordés (plus de neige au hasard), et le frisson de la vitesse
function Camera.secousseRoute(t: number, secousse: number, X: Route, vmaxShow: number): (Vector3, number)
	local N, T = X.cf.UpVector, X.cf.LookVector
	local d, roulis = Vector3.zero, 0
	if secousse > 0 then
		local a = math.min(1.4, secousse) * 0.3
		d += N * (a * (math.sin(t * 31) - 0.6 * math.abs(math.sin(t * 17)))) + T * (a * 0.7 * math.sin(t * 23 + 1.3))
		roulis = a * 0.03 * math.sin(t * 27 + 0.7)
	end
	local spdN = math.clamp((X.kmh - vmaxShow * 1.55 * 0.35) / (vmaxShow * 1.55 * 0.9), 0, 1)
	local calme = 1 - 0.7 * lisse(X.kmh, 700, 1800) -- le plané supersonique : passé ~700 km/h, la caisse fend l'air
	local sh = spdN * spdN * SECOUSSE_V * 0.42 * calme * (X.nitroOn and 1.3 or 1)
	if sh > 0 then
		d += N * (sh * 0.36 * (math.sin(t * 41) + 0.5 * math.sin(t * 67 + 2.1))) + T * (sh * 0.42 * (math.sin(t * 37 + 0.9) + 0.5 * math.sin(t * 59)))
	end
	return d * M, roulis
end

export type Vol = {
	carCF: CFrame, fallVel: Vector3, av: Vector3, haut: Vector3, fallT: number, dtF: number, nitroOn: boolean, bleue: boolean, punch: number,
	l: number, w: number, h: number, kmh: number,
}
local function volR(X: Vol): number return 0.5 * math.sqrt(X.l * X.l + X.w * X.w + (X.h + 0.6) * (X.h + 0.6)) end

-- ════════ EN VOL ════════
function Camera.vol(dt: number, X: Vol, camPos: Vector3): (Vector3, Vector3, Vector3, number)
	format()
	local now = os.clock()
	local p = X.carCF.Position
	local big = math.clamp((X.fallT - 0.5) / 2.2, 0, 1) -- 0 au décollage → 1 sur un gros air
	if now - S.tVol > REPRISE then
		-- 1re image du vol : la TAILLE de la caisse à l'écran, mesurée à l'instant du décollage
		S.zoom = 0
		S.airT = 0
		S.s0 = math.clamp(volR(X) / (math.max(0.5, (camPos - p).Magnitude / M) * math.tan(math.rad(S.fov) / 2)), 0.1, 0.4)
	end
	S.tVol = now
	local cible = (-X.av * ((9.0 - big * 2.6) * (1 - POR * 0.16)) + X.haut * ((3.5 + big * 2.4) * (1 + POR * 0.12))) * M
	-- LE SUIVI SANS À-COUP : on lisse l'écart, et la traîne de la poursuite s'installe en 0,6 s
	S.airT += dt
	local oA = (camPos - p) + X.fallVel * (SPD * X.dtF * (1 - math.min(1, S.airT / 0.6)) * M)
	oA = oA:Lerp(cible, math.min(1, dt * (3 + big * 4.5)))
	-- LE BRAS : jamais plus loin que la distance qui garde la caisse à sa taille du décollage
	local dMx = volR(X) / (S.s0 * math.tan(math.rad(S.fov) / 2)) * M
	if oA.Magnitude > dMx then oA = oA.Unit * dMx end
	local pos = p + oA
	S.up = S.up:Lerp(X.haut, math.min(1, dt * 3)).Unit -- le haut de l'écran = le haut de la caisse
	local up = S.up
	if math.abs(S.lean) > 0.001 then
		S.lean *= math.exp(-dt * 5)
		up = tourne(up, X.av, -S.lean)
	end
	-- la visée de conduite fond vers la caisse en ~0,4 s ; à la pose elle repartira en douceur
	S.viseR = 0
	S.carPrev = p
	local saut = now - S.tVise > REPRISE
	S.tVise = now
	-- (6/10) la visée NAÎT ici si la caméra n'a encore jamais roulé (la chute du tout premier départ de la session) : restée vide, la
	-- 1re image de route la posait d'un coup 8,5 m devant la caisse — le regard sautait de 58° à la pose (mesuré au banc)
	S.vise = (saut or not S.vise) and Vector3.zero or (S.vise :: Vector3) * math.exp(-dt * 5)
	local vise = p + (S.vise or Vector3.zero)
	-- (6/10) LE CABRAGE ANTICIPÉ DE LA ROUTE S'ÉTEINT EN DOUCEUR : il faisait pivoter la visée et le haut autour de la caisse (jusqu'à
	-- 22-24°) et le vol repartait de la visée NON pivotée — au décollage d'une crête ou d'un creux, le regard sautait d'un coup (19°
	-- mesurés au banc). Il retombe ici à zéro en ~0,2 s.
	if math.abs(S.phi) > 1e-4 and S.axePhi then
		S.phi *= math.exp(-dt / ROUTE.LISSE)
		local q = CFrame.fromAxisAngle(S.axePhi, S.phi)
		vise = p + q:VectorToWorldSpace(vise - p)
		up = q:VectorToWorldSpace(up)
	end
	-- le champ se resserre avec l'ampleur du saut (76° petit air → 54° gros air) ; la nitro l'ouvre
	local fovAir = fovPor(76 - big * 22 + X.punch + (X.nitroOn and (X.bleue and 18 or 13) or 0))
	if S.nitroAvant and not X.nitroOn then S.nitroOff = 1.2 end
	S.nitroAvant = X.nitroOn
	S.nitroOff = math.max(0, S.nitroOff - dt)
	S.fov += (fovAir - S.fov) * math.min(1, dt * ((S.nitroOff > 0 and fovAir < S.fov) and 2 or 4))
	S.fovB = S.fov
	S.tRoute, S.tLat = JAMAIS, JAMAIS -- (la prochaine image de route sera une vraie reprise : l'écart repart de la caméra réelle)
	return pos, vise, up, S.fov
end
function Camera.secousseVol(t: number, secousse: number, X: Vol): Vector3
	local droite = X.av:Cross(X.haut)
	local d = Vector3.zero
	if secousse > 0 then
		local a = math.min(1.3, secousse) * 0.12
		d += droite * (math.sin(t * 47) * a) + S.up * (math.sin(t * 37 + 1.3) * a * 0.8)
	end
	local n = math.clamp((X.kmh - 180) / 360, 0, 1.2)
	local sh = n * n * SECOUSSE_V * 0.42 * (1 - 0.7 * lisse(X.kmh, 700, 1800))
	if sh > 0 then
		d += S.up * (sh * 0.36 * (math.sin(t * 41) + 0.5 * math.sin(t * 67 + 2.1))) + droite * (sh * 0.42 * (math.sin(t * 37 + 0.9) + 0.5 * math.sin(t * 59)))
	end
	if X.nitroOn then d += S.up * (math.sin(t * 38.7) * (X.bleue and 0.05 or 0.036)) end -- le réacteur GRONDE dans l'image
	return d * M
end

-- ════════ À LA MORT (BOOM_CAM, L23777) ════════ boomT = le temps depuis l'explosion
function Camera.mort(dt: number, centre: Vector3, boomT: number, camPos: Vector3): (Vector3, Vector3, Vector3, number)
	if boomT <= dt * 1.5 or S.boomT > boomT then
		-- le départ : là où la caméra de poursuite se trouvait
		local d = camPos - centre
		local h = Vector3.new(d.X, 0, d.Z)
		S.boomAng = (h.Magnitude > 0.1) and math.atan2(h.Z, h.X) or 0
		S.boomOff = d
	end
	S.boomT = boomT
	S.tRoute, S.tLat, S.tVol, S.tVise = JAMAIS, JAMAIS, JAMAIS, JAMAIS -- (après la mort : une vraie reprise, quoi qu'il arrive)
	local u = math.clamp(boomT / 0.55, 0, 1)
	local e = 1 - (1 - u) ^ 3
	local dist = 14 + 3 * math.clamp((boomT - 0.55) / 1.25, 0, 1)
	S.boomAng += math.rad(7) * dt
	local el = math.rad(16)
	local cible = Vector3.new(math.cos(S.boomAng) * math.cos(el), math.sin(el), math.sin(S.boomAng) * math.cos(el)) * (dist * M)
	local off = S.boomOff:Lerp(cible, e)
	S.up = Vector3.yAxis
	S.fov += (70 - S.fov) * math.min(1, dt * 5)
	return centre + off, centre + Vector3.new(0, (2.6 + 1.2 * boomT) * M, 0), Vector3.yAxis, S.fov
end

return Camera
