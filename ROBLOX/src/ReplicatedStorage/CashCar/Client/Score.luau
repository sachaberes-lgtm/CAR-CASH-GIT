-- CASH CAR — LE SCORE : le FLOW (jauge 0-100, quatre cases + la FRÉNÉSIE), la TRIADE (STYLE · RUSE · VITESSE),
-- la CHAÎNE D'AURA, le RALENTI de la frénésie et l'aura du DAUPHIN. C'est le « méta » du jeu web, porté ligne pour
-- ligne (index.html : FLOW2 L20930, flowAdd L21025, flowTick L21321, frenDeclenche L21116, frenTriade L21244,
-- chaineAura L28686, chaineEncaisse L28914, RALENTI L21096, dolTick L29467).
--
-- Ce module ne touche à RIEN de Roblox : il calcule. Le pilote lui dit ce qui arrive (une pièce, une figure, une
-- pose…), il rend ce que ça vaut ; ce qui doit se VOIR ou s'ENTENDRE part par Score.dire (le HUD s'y branche).
-- (Il se teste donc hors du jeu : outils/banc-score.luau.)
local Score = {}

-- ════════ ce qui se dit (le HUD et les sons remplacent ces fonctions) ════════
Score.dire = {
	pop = function(_txt: string, _couleur: string?, _prio: number?) end,                 -- un petit texte au-dessus de la caisse
	slam = function(_txt: string, _sub: string?, _c1: string?, _c2: string?, _taille: number?, _prio: number?, _confetti: number?) end,
	son = function(_nom: string, _demiTons: number?) end,
	flash = function(_couleur: string, _alpha: number?) end,
	hap = function(_force: number?) end,
	tag = function(_trait: string, _signe: number) end,                                  -- +STYLE / -VITESSE à côté du mot FLOW
	fov = function(_degres: number) end,                                                 -- un coup de champ
	chaine = function() end,                                                             -- la chaîne d'aura a bougé
	verse = function(_g: number) end,                                                    -- une chaîne s'encaisse (+g d'aura)
	fren = function(_etat: string) end,                                                  -- "debut" | "fin" | "arme" | "desarme"
	musique = function(_frenesie: boolean) end,
}
local FR = true
Score.T = function(fr: string, en: string?): string return (FR or not en) and fr or en end
function Score.langue(fr: boolean) FR = fr end
local T = function(fr: string, en: string?): string return Score.T(fr, en) end

-- ════════ FLOW v2 — les valeurs COURANTES (lois 17 à 20) ════════
local BASE = {
	-- l'efficacité de chaque FAMILLE de geste par case : cyan · or · rose · TRIADE · en frénésie
	fam = { route = { 1, 0.5, 0.12, 0, 0 }, style = { 1, 1, 0.8, 0.5, 0 }, risque = { 1, 1, 1, 1, 0 } },
	psy = { sol = 1.12, air = 1.15, t = 1.5, q = { 4, 6 } },
	part = { risque = 1, style = 0.35, route = 0.05 },
	decl = { drift = 9, racc = false },
	triade = { n = 4, m = 8, p = 1.5, vit = 1.3, brule = { 7, 4.5, 2.2, -0.4 } },
}
local VILLE = {
	fam = { route = { 1, 0.55, 0.25, 0.2, 0 }, style = { 1, 1, 0.9, 0.7, 0 }, risque = { 1, 1, 1, 1, 0 } },
	psy = { sol = 1.08, air = 1.15, t = 1.2, q = { 5, 6 } },
	part = { risque = 1, style = 0.7, route = 0.2 },
	decl = { drift = 2, racc = true },
	triade = { n = 6, m = 13, p = 2.4, vit = 1.2, brule = { 7, 4.5, 2.2, -0.4 } },
}
local F2 = {
	fam = BASE.fam, psy = BASE.psy, part = BASE.part, decl = BASE.decl, triade = BASE.triade,
	cel = { 0.55, 0.23, 0.165, 0.14, 0.5 },
	vit = { { 0.6, 0.35 }, { 1, 1 }, { 1.3, 1.35 } },
	gate = 0.925, grace = 2.75,
	fuite = { 2.4, 2.8, 3.2, 2.4 }, pente = { 0, 0, 0.28, 0.28 },
	routeGarde = 50, retombee = 75, frenNitro = 0.5,
	lent = { vit = 0.8, re = 0.95 },
}
Score.F2 = F2
local SEUIL = 88                              -- la zone rouge : la frénésie TIENT tant que la jauge reste ≥ 88
local ECO_FLOW = { [0] = 1, 1.3, 1.5, 1.8, 3 } -- le multiplicateur d'argent par palier
Score.FLOW_NOM = { [0] = "FLOW", "FLOW I", "FLOW II", "FLOW III", "FRENESIE" }
Score.FLOW_COL = { [0] = "#ffffff", "#5ee6ff", "#ffd75e", "#ff5ec8", "#ff2a3d" }
Score.FLOW_CEL = { "#5ee6ff", "#ffd75e", "#ff5ec8", "#b58cff" }
Score.SEUIL = SEUIL
-- (les noms des traits, dans la langue du joueur — lus à l'affichage : la langue se pose après le chargement du module)
local NOM_TRAIT = setmetatable({}, { __index = function(_, k: string): string?
	-- (5/10, Sacha : les trois noms d'origine sont retirés du jeu — les traits s'appellent par ce qu'ils récompensent)
	local n = ({ n = { "STYLE", "STYLE" }, m = { "RUSE", "CUNNING" }, p = { "VITESSE", "SPEED" } })[k]
	return n and T(n[1], n[2]) or nil
end })
Score.NOM_TRAIT = NOM_TRAIT

-- le lieu : la VILLE ouvre d'autres réglages (flowLieu)
function Score.lieu(nom: string?)
	local src = (nom == "ville") and VILLE or BASE
	F2.fam, F2.psy, F2.part, F2.decl, F2.triade = src.fam, src.psy, src.part, src.decl, src.triade
end

-- ════════ l'état ════════
local FLOW = { v = 0, lv = 0, idle = 0, vit = 1, revele = false, lentVu = false, nit = false, psyT = 0, lent9 = false, psyOk = false, reste = 9 }
local FREN = { t = 0, rec = false, tr = { n = 0, m = 0, p = 0 }, k = 3, dit = { n = false, m = false, p = false }, ditT = 0,
	arme = false, coup = false, butin = 0, vu = false, record = 0, nb = 0, max = 0 }
local CHA = { pts = 0, x = 0, fam = {} :: { [string]: number }, n = 0, t = 0, age = 0, liste = {} :: { string }, rec = 0, recB = false, xMax = 0 }
local ETAT = { enCours = false, mode = "drive", aura = 0, auraX2 = false, tuto = false }
local RALENTI = { t = 0, d = 2.7, k = 0.3 }
Score.FLOW, Score.FREN, Score.CHA, Score.ETAT = FLOW, FREN, CHA, ETAT
-- LA CHAÎNE SE FERME (web, 2026-10-01) : une chaîne vit CHA_VIE secondes AU PLUS (vol compris), puis s'encaisse au sol ;
-- et les ROBINETS (récolte, rafale, paliers de NITROOO, nage du dauphin) tombent droit dans le compteur, hors chaîne.
local CHA_FEN, CHA_XMAX, CHA_VIE = 3.5, 10, 25
Score.CHA_FEN = CHA_FEN
Score.CHA_VIE = CHA_VIE
Score.X_COUL = { [0] = "#dfeeff", "#dfeeff", "#35e6ff", "#ffc93a", "#ff4fc2", "#9b6bff", "#ff3924", "#ff3924", "#ff3924", "#ff3924", "#ff3924" }

local function clamp(x: number, a: number, b: number): number return math.max(a, math.min(b, x)) end
local function mmss(t: number): string
	local s = math.floor(t)
	return string.format("%d:%02d", s // 60, s % 60)
end
Score.mmss = mmss
-- l'aura en toutes lettres, avec ses milliers séparés comme au compteur (« 12 345 » ; « 12,345 » en anglais)
local function entier(v: number): string
	local s = tostring(math.floor(v + 0.5))
	local out = string.reverse(string.gsub(string.reverse(s), "(%d%d%d)", FR and "%1 " or "%1,"))
	return (string.gsub(out, "^[ ,]", ""))
end
local function fmtMul(x: number): string
	local s = (x == math.floor(x)) and tostring(x) or string.format("%.1f", x)
	if FR then s = string.gsub(s, "%.", ",") end
	return s
end
Score.fmtMul = fmtMul

-- ════════ les fonctions pures ════════
local function interp(t: { { number } }, x: number): number
	if x <= t[1][1] then return t[1][2] end
	for i = 2, #t do
		if x <= t[i][1] then
			local a, b = t[i - 1], t[i]
			return a[2] + (b[2] - a[2]) * (x - a[1]) / (b[1] - a[1])
		end
	end
	return t[#t][2]
end
local function flowCel(v: number, lv: number): number -- 1..5
	return (lv == 4) and 5 or math.min(3, math.floor(v / 25)) + 1
end
local function flowGainDe(q: number, fam: string, v: number, lv: number, vitN: number): number
	local c = flowCel(v, lv)
	local f = F2.fam[fam] or F2.fam.style
	if c == 4 and vitN < F2.gate then return 0 end
	return q * f[c] * F2.cel[c] * interp(F2.vit, vitN)
end
local function flowGardeDe(fam: string, v: number): boolean return fam ~= "route" or v < F2.routeGarde end
local function flowPerteDe(dt: number, v: number, lv: number, idle: number, air: boolean, nit: boolean, k: number): number
	if air or dt <= 0 then return 0 end                      -- RIEN ne fuit en vol
	if lv == 4 then return dt * F2.triade.brule[clamp(k, 0, 3) + 1] end
	if nit then return 0 end                                  -- la nitro GÈLE la jauge
	local c = math.min(3, math.floor(v / 25)) + 1
	return dt * (F2.pente[c] + ((idle > F2.grace) and F2.fuite[c] or 0))
end
local function flowLvDe(v: number): number
	local b = math.min(4, math.floor(v / 25))
	return (FLOW.lv == 4 and v >= SEUIL) and 4 or b
end
function Score.flowMult(): number return ECO_FLOW[FLOW.lv] or 1 end
function Score.niveau(): number return FLOW.lv end
function Score.frenesie(): boolean return FLOW.lv == 4 end
Score.flowGainDe = flowGainDe

-- combien de secondes avant de perdre le palier si rien ne nourrit (flowReste)
local function flowReste(): number
	if FLOW.v <= 0 then return 9 end
	local plancher = (FLOW.lv == 4 or FREN.arme) and SEUIL or FLOW.lv * 25
	local m = FLOW.v - plancher
	if FLOW.lv == 4 then
		local b = F2.triade.brule[clamp(FREN.k, 0, 3) + 1]
		return (b <= 0) and 9 or m / b
	end
	local c = math.min(3, math.floor(FLOW.v / 25)) + 1
	local grace = math.max(0, F2.grace - FLOW.idle)
	local pente = F2.pente[c]
	if pente > 0 and m / pente <= grace then return m / pente end
	local rest = m - pente * grace
	return grace + rest / (pente + F2.fuite[c])
end

-- ════════ les étiquettes de trait ════════
local function flowTag(t: string, signe: number) Score.dire.tag(t, signe) end

-- ════════ LA TRIADE (en frénésie : trois minuteurs) ════════
local function memDe(t: string): number return (F2.triade :: any)[t] end
local function frenTrait(t: string, part: number?)
	if FLOW.lv ~= 4 then return end
	local mem = memDe(t)
	local avant = FREN.tr[t]
	FREN.tr[t] = math.min(mem, avant + mem * (part or 1))
	if avant <= 0 and FREN.tr[t] > 0 then
		Score.dire.son("triade.renait")
		Score.dire.hap(8)
	end
end
Score.frenTrait = frenTrait

local function frenFin(mort: boolean)
	local t = FREN.t
	if t <= 0 then return end
	FREN.t = 0
	if not mort then Score.dire.son("frenesie.sort") end
	FREN.max = math.max(FREN.max, t)
	local r = FREN.record
	local neuf = t > r and t >= 5
	if neuf then FREN.record = math.floor(t * 10) / 10 end
	local b = FREN.butin
	FREN.butin = 0
	Score.dire.musique(false)
	Score.dire.fren("fin")
	if not mort and t >= 3 then
		local suite = ""
		if neuf and r >= 5 then suite = " · " .. T("RECORD", "RECORD")
		elseif b >= 1 and Score.fmtArgent then suite = " · +" .. Score.fmtArgent(b) end
		Score.dire.pop(T("FRENESIE", "FRENZY") .. " " .. mmss(t) .. suite, (neuf and r >= 5) and "#ffd75e" or "#ff2a3d", 3)
	end
end

local function flowReset()
	frenFin(true)
	FLOW.v, FLOW.lv, FLOW.idle, FLOW.vit = 0, 0, 0, 1
	FLOW.revele, FLOW.lentVu, FLOW.nit, FLOW.psyT, FLOW.lent9, FLOW.psyOk = false, false, false, 0, false, false
	FREN.tr.n, FREN.tr.m, FREN.tr.p = 0, 0, 0
	FREN.arme, FREN.coup, FREN.k = false, false, 3
end

local function frenDebut()
	FREN.t, FREN.butin, FREN.rec = 0, 0, false
	FREN.nb += 1
	FREN.tr.n, FREN.tr.m, FREN.tr.p = F2.triade.n, F2.triade.m, F2.triade.p -- les trois traits partent PLEINS
	FREN.k = 3
	FREN.dit.n, FREN.dit.m, FREN.dit.p = false, false, false
	flowTag("n", 1)
	flowTag("m", 1)
	flowTag("p", 1)
end

local function frenDeclenche()
	FREN.arme = false
	FLOW.v, FLOW.lv, FLOW.idle = 100, 4, 0
	frenDebut()
	local rc = (FREN.record >= 5) and FREN.record or 0
	local cash = T("ARGENT ×", "CASH ×") .. fmtMul(Score.flowMult())
	local sub
	if not FREN.vu then
		sub = T("TIENS LES TROIS TRAITS", "HOLD ALL THREE TRAITS")
	elseif rc > 0 then
		sub = cash .. " · " .. T("RECORD", "RECORD") .. " " .. mmss(rc)
	else
		sub = cash
	end
	FREN.vu = true
	Score.dire.slam(T("FRENESIE !", "FRENZY!"), sub, "#ff2a3d", "#ffb000", 44, 2, 22) -- (le titre TRIPLE MONSTER la couvre 2,7 s : HudScore.frenTitre)
	Score.dire.flash("#ff2a3d", 0.6)
	Score.dire.son("frenesie")
	Score.dire.musique(true)
	Score.dire.hap(40)
	Score.dire.fov(12)
	Score.dire.fren("debut")
	Score.ralentiPose(2.7)
end

local function frenArme()
	FREN.arme = true
	Score.dire.fren("arme")
	if FREN.coup then return end -- (le geste est lui-même un déclencheur : la ville)
	Score.dire.pop((F2.decl.drift <= 3) and T("DRIFT OU FIGURE !", "DRIFT OR TRICK!") or T("POSE UNE FIGURE !", "LAND A TRICK!"), "#ff2a3d", 2)
	Score.dire.hap(10)
	Score.dire.son("frenesie.arme")
end

local function flowRevele()
	FLOW.revele = true
	Score.dire.son("triade.revele")
	Score.dire.pop((F2.decl.drift <= 3) and T("DRIFT · RACCOURCI · VITESSE", "DRIFT · SHORTCUT · SPEED") or T("FIGURE · RACCOURCI · NITRO", "TRICK · SHORTCUT · NITRO"), "#b58cff", 2)
end

-- ════════ flowAdd : LA porte d'entrée des gains ════════
function Score.flowAdd(q: number, fam: string?, trait: string?)
	if q <= 0 or not ETAT.enCours then return end
	local f = fam or "style"
	local t9 = trait or ((f ~= "route") and "n" or nil) -- tout geste de style / risque est STYLE, sauf trait donné ; la route n'a pas d'auteur
	if FLOW.lv == 4 and t9 then
		frenTrait(t9, (f == "risque") and 1 or ((F2.part :: any)[f] or 0) * math.min(1, q / 6))
		flowTag(t9, 1)
	end
	local v0 = FLOW.v
	local g = flowGainDe(q, f, v0, FLOW.lv, FLOW.vit)
	if g <= 0 then
		if f ~= "route" and FLOW.lv < 4 and v0 >= 75 and FLOW.vit < F2.gate and not FLOW.lentVu then
			FLOW.lentVu = true
			Score.dire.pop(T("PLUS VITE !", "FASTER!"), "#ff2a3d", 1)
			Score.dire.son("plus.vite")
		end
		return
	end
	FLOW.v = math.min(100, v0 + g)
	if flowGardeDe(f, v0) then FLOW.idle = 0 end
	if t9 and FLOW.lv < 4 then flowTag(t9, 1) end
	if FLOW.lv == 4 then return end
	local lv = math.min(3, flowLvDe(FLOW.v))
	local arme9 = false
	if FLOW.v >= 100 and not FREN.arme then
		frenArme()
		arme9 = true
	end
	if lv > FLOW.lv then
		FLOW.lv = lv
		if lv >= 3 and not FLOW.revele then
			FLOW.revele = true
			if not arme9 then flowRevele() end
		else
			Score.dire.pop(Score.FLOW_NOM[lv] .. " · $×" .. fmtMul(Score.flowMult()), Score.FLOW_COL[lv], 1)
		end
		Score.dire.hap(16)
		Score.dire.son("flow.palier", lv * 2)
		Score.dire.fov(4 + lv * 2)
	end
end
function Score.flowAddDecl(q: number, fam: string?, trait: string?)
	FREN.coup = true
	Score.flowAdd(q, fam, trait)
	FREN.coup = false
end

-- ════════ les fautes ════════
function Score.flowFaute(t: string, pts: number, part: number)
	if not ETAT.enCours or FLOW.v <= 0 then return end
	if FLOW.lv == 4 then
		FREN.tr[t] = math.max(0, FREN.tr[t] - memDe(t) * part) -- en frénésie : le trait perd une part de sa mémoire
	else
		FLOW.idle = math.max(FLOW.idle, F2.grace)              -- le répit saute : la jauge fuit tout de suite
		if pts > 0 then FLOW.v = math.max(math.floor(FLOW.v / 25) * 25, FLOW.v - pts) end -- jamais sous le plancher du palier
	end
	flowTag(t, -1)
end
-- un coup DIRECT dans la jauge (les dangers de la campagne) : le répit n'est pas annulé (idle = 2)
function Score.flowCoup(pts: number)
	FLOW.v = math.max(0, FLOW.v - pts)
	FLOW.idle = 2
end
-- LA POSE RATÉE (flowCasse) : la jauge retombe à zéro
function Score.flowCasse(angle: number)
	local lvAvant = FLOW.lv
	frenFin(true)
	FLOW.v, FLOW.lv, FLOW.idle = 0, 0, 0
	FREN.arme = false
	Score.dire.pop((angle <= 90) and T("DE TRAVERS !", "SIDEWAYS!") or T("A CONTRESENS !", "WRONG WAY!"), "#ff5e7a", 2)
	Score.dire.son((angle <= 90) and "pose.travers" or "pose.contresens")
	if lvAvant >= 2 then Score.dire.flash("#ff2a3d", 0.35) end
end

-- ════════ la frénésie se déclenche (une figure POSÉE, un raccourci ou un drift en ville) ════════
function Score.frenPeut(): boolean return FREN.arme and FLOW.lv < 4 end
function Score.frenDeclenche() if Score.frenPeut() then frenDeclenche() end end
-- (mise au point) la frénésie tout de suite, pour regarder le DARK TRIAD (dragon, dauphins et serpent noirs)
function Score.dbgFren() if FLOW.lv < 4 then FREN.arme = true frenDeclenche() end end

-- chaque paiement en frénésie nourrit le butin
function Score.frenCash(g: number) if FLOW.lv == 4 then FREN.butin += g end end

-- ════════ flowTick : chaque image ════════
-- e = { mode = "drive"|"fall"|"boom", vitN = vitesse ÷ croisière, nitroOn = bool }
local tic = 0
function Score.flowTick(dt: number, mode: string, vitN: number, nitroOn: boolean)
	if not ETAT.enCours then return end
	FLOW.vit = vitN
	local air = mode == "fall"
	local nit = nitroOn and mode ~= "boom"
	FLOW.nit = nit
	if not air and not nit then FLOW.idle += dt end -- le répit ne court ni en vol ni sous nitro
	if FLOW.lv < 4 and dt > 0 then
		-- VITESSE hors frénésie : la vitesse TENUE paie
		local P = F2.psy
		FLOW.psyT = (mode ~= "boom" and FLOW.vit >= (air and P.air or P.sol)) and FLOW.psyT + dt or 0
		if FLOW.psyT >= P.t then
			FLOW.psyT -= P.t
			Score.flowAdd(air and P.q[2] or P.q[1], air and "risque" or "style", "p")
		end
		if FLOW.vit >= F2.lent.re then FLOW.psyOk = true end
		if FLOW.psyOk and mode == "drive" and not nit and FLOW.v > 0 and FLOW.vit < F2.lent.vit then
			if not FLOW.lent9 then
				FLOW.lent9 = true
				FLOW.idle = math.max(FLOW.idle, F2.grace)
			end
			flowTag("p", -1)
		elseif FLOW.lent9 and FLOW.vit >= F2.lent.re then
			FLOW.lent9 = false
		end
	end
	local fr9 = FLOW.lv == 4
	if fr9 then
		-- LA TRIADE : avant la brûlure
		if nit or FLOW.vit >= F2.triade.vit then FREN.tr.p = F2.triade.p end -- VITESSE : nitro tenue OU vitesse ≥ 1,3 × la croisière
		local k = 0
		FREN.ditT = math.max(0, FREN.ditT - dt)
		for _, t in { "n", "m", "p" } do
			local avant = FREN.tr[t]
			if not air then FREN.tr[t] = math.max(0, avant - dt) end -- en vol RIEN ne meurt
			if FREN.tr[t] > 0 then
				k += 1
			else
				if avant > 0 then flowTag(t, -1) end
				-- un trait MORT réclame ce qu'il lui faut (une fois par trait et par frénésie, au sol, pas plus d'un appel toutes les 0,9 s)
				if not air and not FREN.dit[t] and FREN.ditT <= 0 then
					FREN.dit[t] = true
					FREN.ditT = 0.9
					if t == "n" then
						Score.dire.pop((F2.decl.drift <= 3) and T("DRIFT !", "DRIFT!") or T("UNE FIGURE !", "A TRICK!"), "#ffd75e", 2)
					elseif t == "m" then
						Score.dire.pop(T("RACCOURCI !", "SHORTCUT!"), "#7dffec", 2)
					else
						Score.dire.pop(T("NITRO !", "NITRO!"), "#ff7a24", 2)
					end
					Score.dire.son("triade.meurt")
				end
			end
		end
		FREN.k = k
	end
	FLOW.v = clamp(FLOW.v - flowPerteDe(dt, FLOW.v, FLOW.lv, FLOW.idle, air, nit, FREN.k), 0, 100)
	if fr9 then
		FREN.t += dt
		if FREN.record >= 5 and not FREN.rec and FREN.t > FREN.record then
			FREN.rec = true
			Score.dire.pop(T("RECORD DE FRENESIE !", "FRENZY RECORD!"), "#ffd75e", 3)
			Score.dire.son("frenesie.record")
		end
	end
	local lv = flowLvDe(FLOW.v)
	if FREN.arme and FLOW.v < SEUIL then -- l'arme tombe avec la jauge
		FREN.arme = false
		Score.dire.son("flow.perdu")
		Score.dire.fren("desarme")
	end
	-- le tic d'alerte : au sol, palier > 0, il reste moins de 1,1 s
	FLOW.reste = flowReste()
	if mode == "drive" and FLOW.lv > 0 and (not nit or fr9) and FLOW.reste < 1.1 then
		tic -= dt
		if tic <= 0 then
			tic = 0.1 + 0.3 * FLOW.reste
			Score.dire.son("flow.tic")
		end
	else
		tic = 0
	end
	if lv < FLOW.lv then
		Score.dire.son("flow.chute")
		FLOW.lv = lv
		if fr9 then -- la frénésie est perdue
			FLOW.idle = 0
			FLOW.v = math.min(FLOW.v, F2.retombee + 1)
			FLOW.lv = math.min(FLOW.lv, flowLvDe(FLOW.v))
			frenFin(false)
		end
	end
end

-- ════════ LA CHAÎNE D'AURA ════════
local function chaReset()
	CHA.pts, CHA.x, CHA.n, CHA.t, CHA.age = 0, 0, 0, 0, 0
	table.clear(CHA.fam)
	table.clear(CHA.liste)
end
-- un geste entre dans la chaîne. brut = pas de décote à la redite ; muet = sans texte au-dessus de la caisse ;
-- rob = un ROBINET : payé au compteur tel quel — ni chaîne, ni ×, ni horloge
function Score.geste(nom: string, base: number, fam: string?, brut: boolean?, muet: boolean?, rob: boolean?): number
	if base <= 0 or not ETAT.enCours then return 0 end
	if rob then
		local p = math.max(1, math.floor(base * (ETAT.auraX2 and 2 or 1) + 0.5))
		ETAT.aura += p
		if not muet then Score.dire.pop(nom .. " +" .. p, "#ffd75e", 0) end
		return p
	end
	local f = fam or nom
	local k = CHA.fam[f] or 0
	CHA.fam[f] = k + 1
	local p = math.max(1, math.floor(base * (brut and 1 or 0.7 ^ k) * (ETAT.auraX2 and 2 or 1) + 0.5)) -- −30 % par redite ; AURA ×2 double
	local x0 = CHA.x
	if k == 0 then CHA.x = math.min(CHA_XMAX, CHA.x + 1) end -- chaque NOUVELLE famille : +1 au multiplicateur
	CHA.xMax = math.max(CHA.xMax, CHA.x)
	if CHA.n == 0 then CHA.age = 0 end
	CHA.pts += p
	CHA.n += 1
	CHA.t = CHA_FEN
	table.insert(CHA.liste, 1, nom .. " +" .. p)
	if #CHA.liste > 2 then table.remove(CHA.liste) end
	Score.dire.chaine()
	if CHA.x > x0 then
		if CHA.x == 5 then Score.dire.slam("×5", T("EN FEU !!", "ON FIRE!!"), Score.X_COUL[5], "#ffffff", 30, 1)
		elseif CHA.x == 8 then Score.dire.slam("×8", T("DEMENT !!!", "INSANE!!!"), Score.X_COUL[8], "#ffffff", 34, 1)
		elseif CHA.x == 10 then Score.dire.slam("×10", T("MAX !!!", "MAX!!!"), Score.X_COUL[10], "#ffd75e", 38, 2) end
		-- (L29096) un palier de chaîne se SENT : son, éclair de bord à sa couleur, vibration
		if CHA.x == 5 or CHA.x == 8 or CHA.x == 10 then
			Score.dire.son("aura.x" .. CHA.x)
			Score.dire.flash(Score.X_COUL[CHA.x], 0.4)
			Score.dire.hap((CHA.x == 10) and 60 or 35)
		end
	end
	if not muet then Score.dire.pop(nom .. " +" .. p, (CHA.x > x0) and "#ff9ee6" or "#ffd75e", 0) end
	Score.dire.son((ETAT.mode == "fall") and "fig.maillon" or "aura.geste", math.min(12, CHA.x))
	return p
end
function Score.gesteMuet(nom: string, base: number, fam: string?, brut: boolean?): number
	return Score.geste(nom, base, fam, brut, true)
end

local function chaineEncaisse()
	local g = math.floor(CHA.pts * math.max(1, CHA.x) + 0.5)
	if g > 0 and ETAT.enCours then
		ETAT.aura += g
		Score.dire.verse(g)
		if g >= 600 or CHA.x >= 5 then
			Score.dire.slam("+" .. g, ((CHA.x > 1) and (CHA.pts .. " ×" .. CHA.x .. " · ") or "") .. "AURA", "#ff7ad5", "#b14bff", 30, 1, (g >= 2000) and 16 or 0)
		end
		Score.dire.son((g < 600) and "aura.encaisse1" or ((g < 2000) and "aura.encaisse2" or "aura.encaisse3"))
		-- le record de la partie battu EN COURSE (une fois)
		if not CHA.recB and CHA.rec > 0 and ETAT.aura > CHA.rec and not ETAT.tuto then
			CHA.recB = true
			Score.dire.slam(T("RECORD BATTU !", "RECORD BEATEN!"), "AURA " .. entier(ETAT.aura), "#ffd75e", "#ffb000", 30, 2, 14)
			Score.dire.son("aura.record")
		end
	end
	chaReset()
	Score.dire.chaine()
end
Score.chaineEncaisse = chaineEncaisse

function Score.chainePerdue()
	local g = math.floor(CHA.pts * math.max(1, CHA.x) + 0.5)
	if CHA.n > 0 and g > 0 then
		Score.dire.slam(T("CHAINE PERDUE", "CHAIN LOST"), "-" .. entier(g) .. " AURA", "#ff5e7a", "#b0102a", 24, 2)
	end
	chaReset()
	Score.dire.chaine()
end

function Score.chaineTick(dt: number, mode: string)
	if CHA.n == 0 then return end
	if mode ~= "fall" and mode ~= "boom" then CHA.t -= dt end -- l'horloge est GELÉE en l'air
	CHA.age += dt -- l'âge de la chaîne, lui, court partout
	if CHA.t <= 0 or (CHA.age >= CHA_VIE and mode == "drive") then chaineEncaisse() end
end

-- ════════ LE RALENTI (la frénésie) : le SEUL ralenti du jeu ════════
function Score.ralentiPose(d: number?)
	RALENTI.d = d or 2.7
	RALENTI.t = RALENTI.d
end
local function sstep(x: number, a: number, b: number): number
	local t = clamp((x - a) / (b - a), 0, 1)
	return t * t * (3 - 2 * t)
end
local function ssstep(x: number, a: number, b: number): number
	local t = clamp((x - a) / (b - a), 0, 1)
	return t * t * t * (t * (t * 6 - 15) + 10)
end
-- rend le dt du JEU pour un dt RÉEL : ×0,3 en 0,1 s, tenu jusqu'à 45 %, revenu à ×1 à 2,7 s
function Score.ralentiDt(dtReel: number, pause: boolean): number
	if RALENTI.t <= 0 then return dtReel end
	if not ETAT.enCours then
		RALENTI.t = 0
		return dtReel
	end
	if pause then return dtReel end
	RALENTI.t = math.max(0, RALENTI.t - dtReel)
	local u = 1 - RALENTI.t / RALENTI.d
	return dtReel * (1 + (RALENTI.k - 1) * sstep(u, 0, 0.04) * (1 - ssstep(u, 0.45, 1)))
end
function Score.ralentiStop() RALENTI.t = 0 end

-- ════════ LA LOI DU RÉSERVOIR (bloc pur <<<NITRO2>>> du web, 2026-10-01) ════════
-- Le trou : décoller / se poser en boucle REMBOURSAIT la nitro (la pose rendait 20 % à chaque contact, la figure jusqu'à 1,2…).
--   0. à sec, le réacteur S'ÉTEINT (il tient tant que la jauge PAIE l'image, se rallume à 0,3) ;
--   1. LE VOL DÉPENSE, LA ROUTE REMPLIT : pose et figure rendent au PRORATA DU VOL FAIT NITRO COUPÉE ;
--   2. la pose rend ses 20 % pour un vol d'au moins 1,2 s (prorata en dessous) ;
--   3. le bump : 0,35 puis × 0,6 par rebond du même vol, rien au-delà du 4e, rien réacteur allumé ;
--   4. NITROOO brûle × 0,75 au sol et plein en vol (la frénésie : × 0,5 partout) ;
--   5. le rase-bord ne remplit que nitro COUPÉE.
local N2 = {
	regen = 0.2, seuil = 0.3, conso = 1,
	ntrSol = 0.75, ntrAir = 1,
	coup = 0.12,
	posePct = 0.2, posePlein = 1.2,
	figBase = 0.45, figPar = 0.12, figMax = 1.2,
	bumpQ = 0.35, bumpK = 0.6, bumpN = 4,
	rase = 0.22,
}
Score.N2 = N2
-- la part du vol faite NITRO COUPÉE (1 = tout le vol, 0 = réacteur tenu d'un bout à l'autre)
function Score.nitroPartDe(volT: number, nitT: number): number
	return (volT > 1e-3) and clamp(1 - nitT / volT, 0, 1) or 1
end
-- ce que rend la POSE d'un vol de volT secondes dont nitT réacteur allumé, pour une jauge de cap
function Score.nitroPoseDe(cap: number, volT: number, nitT: number): number
	return N2.posePct * cap * math.min(1, volT / N2.posePlein) * Score.nitroPartDe(volT, nitT)
end
-- ce que rend la FIGURE posée (× de la chaîne, grade de pose : 1 · 1,5 parfaite · 2 divine)
function Score.nitroFigDe(mult: number, g: number, volT: number, nitT: number): number
	return math.min(N2.figMax, N2.figBase + mult * N2.figPar) * ((g >= 2 and 2) or (g >= 1.5 and 1.5) or 1) * Score.nitroPartDe(volT, nitT)
end
-- ce que rend le n-ième BUMP du vol (nit : réacteur allumé à l'impact)
function Score.nitroBumpDe(n: number, nit: boolean): number
	if nit or n > N2.bumpN then return 0 end
	return N2.bumpQ * N2.bumpK ^ math.max(0, n - 1)
end
-- ce que le réacteur brûle pendant dt (kFren : la part de la frénésie)
function Score.nitroConsoDe(dt: number, kFren: number, fren: boolean, ntr: boolean, air: boolean): number
	return dt * N2.conso * (fren and kFren or (ntr and (air and N2.ntrAir or N2.ntrSol) or 1))
end
-- le réacteur TIENT-il ? res = ce qui reste (jauge + réserve bleue) · prise = ce que brûle cette image · on = il était allumé
function Score.nitroTientDe(res: number, prise: number, on: boolean): boolean
	if on then return res > math.max(0.005, prise) end
	return res > N2.seuil
end

-- ════════ LE DAUPHIN v7 : l'aura de la nage ════════
local DOL = { on = false, live = 0, mul = 1, q = 0, aura = 0, rasT = 0, offT = 0, nb = 0, ne = false, cote = {} :: { { any } }, show = 0, recap = 0, recapT = 0 }
Score.DOL = DOL
local DOL_GRACE, DOL_FIG, DOL_PAS, DOL_AURA0, DOL_AURA_RAS, DOL_AURA_MAX = 0.12, 1, 0.6, 80, 190, 1200
local DOL_FLOW_K, DOL_FLOW_MAX, DOL_RAS_H, DOL_RAS_T0, DOL_AURA_NUE, DOL_AURA_MIN = 4, 6, 6.5, 0.35, 0.5, 10
local function dolVitMul(p: number): number return 0.6 + 1.5 * clamp((p - 0.3) / 0.9, 0, 1) end
function Score.dolFin()
	if not DOL.on then return end
	DOL.on = false
	local n = math.floor(DOL.aura * (DOL.ne and 1 or DOL_AURA_NUE) + 0.5)
	if n >= DOL_AURA_MIN then table.insert(DOL.cote, { T("DAUPHIN EN VOL", "DOLPHIN RUN"), n, "dauphinLive", true, true }) end -- versé À LA POSE seulement, au compteur (robinet)
	local f = math.min(DOL_FLOW_MAX, DOL_FLOW_K * DOL.q)
	if DOL.ne and f >= 0.5 then Score.flowAdd(f, "risque") end
	DOL.q = 0
end
-- chaque image de VOL. sur = au-dessus / en dessous de la route, dans sa largeur ; hF = distance à la dalle (m) ;
-- p = vitesse 3D ÷ vmax du moteur ; rend true à l'instant où la FIGURE naît (le pilote appelle alors sa figure)
function Score.dolTick(dt: number, sur: boolean, hF: number, p: number, fallT: number): boolean
	local nee = false
	DOL.show = math.max(0, DOL.show - dt)
	if sur then
		DOL.offT = 0
		if not DOL.on then
			DOL.on, DOL.live, DOL.mul, DOL.q, DOL.aura = true, 0, dolVitMul(p), 0, 0
			if DOL.show <= 0 then
				DOL.nb = 1
				Score.dire.son("dauphin.banc")
			end
			DOL.show = math.max(DOL.show, 2.6)
		end
		DOL.live += dt
		local nb = math.min(6, 1 + math.floor(DOL.live / DOL_PAS))
		if nb > DOL.nb then
			DOL.nb = nb
			Score.dire.son("dauphin", nb * 2)
		end
		if hF <= DOL_RAS_H and fallT > DOL_RAS_T0 then DOL.rasT += dt end
		if not DOL.ne and DOL.rasT >= DOL_FIG then
			DOL.ne = true
			DOL.aura += DOL_AURA0 * DOL.mul
			table.insert(DOL.cote, { T("DAUPHIN", "DOLPHIN"), 150, "dauphin", false, false })
			nee = true
		end
		local ras = clamp(1 - (hF - 2.2) / 9.8, 0, 1)
		DOL.ras = ras -- (la proximité de l'image : le banc la montre — Client/Dauphins)
		DOL.mul += (dolVitMul(p) - DOL.mul) * math.min(1, dt * 4)
		DOL.q += ras * ras * (0.3 + 0.7 * clamp((DOL.mul - 0.6) / 1.5, 0, 1)) * dt
		DOL.aura = math.max(DOL.aura, math.min(DOL_AURA_MAX * DOL.mul, DOL.aura + DOL_AURA_RAS * ras * ras * (1 + 0.15 * (DOL.nb - 1)) * DOL.mul * dt))
		DOL.show = math.max(DOL.show, 0.7)
	else
		DOL.offT += dt
		if DOL.offT > DOL_GRACE and DOL.on then Score.dolFin() end
	end
	return nee
end
-- ce qui sera VRAIMENT versé (le compteur sous la caisse)
function Score.dolVu(): number
	if not DOL.on then return 0 end
	return math.floor(DOL.aura * (DOL.ne and 1 or DOL_AURA_NUE) + 0.5)
end
-- à la pose : les lignes mises de côté entrent dans la chaîne (sans leurs textes), puis UN récapitulatif
function Score.dolPose()
	Score.dolFin()
	local total = 0
	for _, l in DOL.cote do total += Score.geste(l[1], l[2], l[3], l[4], true, l[5]) end
	table.clear(DOL.cote)
	if total > 0 then
		DOL.recap, DOL.recapT = total, 2.2
		Score.dire.pop(T("DAUPHIN", "DOLPHIN") .. " ×" .. math.max(1, DOL.nb) .. "  +" .. entier(total) .. " AURA", "#7dffec", 1)
	end
	DOL.rasT, DOL.ne, DOL.live, DOL.aura = 0, false, 0, 0
end
function Score.dolDecolle()
	Score.dolFin()
	DOL.rasT, DOL.ne, DOL.live, DOL.aura, DOL.q, DOL.offT = 0, false, 0, 0, 0, 0
end
function Score.dolKill()
	DOL.on = false
	table.clear(DOL.cote)
	DOL.rasT, DOL.ne, DOL.live, DOL.aura, DOL.q, DOL.show = 0, false, 0, 0, 0, 0
end

-- ════════ SANS FAUTE : les poses propres d'affilée ════════
local SFA = { n = 0 }
Score.SFA = SFA
function Score.poseJugee(propre: boolean, vraiVol: boolean): number
	if not vraiVol then return 0 end
	if not propre then
		if SFA.n >= 3 then Score.dire.pop(T("SERIE CASSEE", "STREAK BROKEN"), "#ff5e7a", 1) end -- (L23659)
		SFA.n = 0
		return 0
	end
	SFA.n += 1
	local n = SFA.n
	if n == 3 or n == 5 or n == 8 or n == 12 or (n > 12 and n % 5 == 0) then -- (L23661 : 3 · 5 · 8 · 12, puis 15 · 20 · 25…)
		Score.geste(T("SANS FAUTE", "FLAWLESS") .. " ×" .. n, 30 + 8 * math.min(20, n), "sansfaute", true, true)
		Score.dire.son("sans.faute")
		-- (son texte arrive 0,7 s APRÈS la pose : le verdict et PARFAIT ! se lisent d'abord)
		task.delay(0.7, function()
			if ETAT.enCours then Score.dire.pop(T("SANS FAUTE", "FLAWLESS") .. " ×" .. n, "#7dff9a", 2) end
		end)
		return 0.12 -- la nitro rendue
	end
	return 0
end

-- ════════ la partie ════════
-- record = la meilleure aura d'une partie (à battre) ; frenRec = le record de frénésie de toujours (s)
function Score.debut(record: number?, frenRec: number?, tuto: boolean?)
	ETAT.enCours, ETAT.mode, ETAT.aura, ETAT.auraX2, ETAT.tuto = true, "drive", 0, false, tuto == true
	flowReset()
	chaReset()
	CHA.rec, CHA.recB, CHA.xMax = record or 0, false, 0
	FREN.record = frenRec or FREN.record
	FREN.nb, FREN.max = 0, 0
	SFA.n = 0
	Score.dolKill()
	RALENTI.t = 0
end
-- l'explosion : la chaîne OUVERTE est perdue avec la caisse, le flow retombe
function Score.mort()
	Score.chainePerdue()
	flowReset()
	Score.dolKill()
	RALENTI.t = 0
	SFA.n = 0
end
-- la fin de partie : une chaîne ouverte ne s'encaisse que si on est au sol. Rend l'aura de la partie.
function Score.fin(auSol: boolean): number
	if CHA.n > 0 and auSol then chaineEncaisse() end
	frenFin(true)
	ETAT.enCours = false
	return ETAT.aura
end
function Score.aura(): number return ETAT.aura end

return Score
