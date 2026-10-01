-- CASH CAR — LES CARNETS (missions v2, index.html L21485-21600). Un carnet = 3 DÉFIS + 1 RÉCOMPENSE. Un seul carnet
-- ouvert à la fois, dans l'ordre, pour toujours : neuf écrits à la main, puis une série sans fin (tirée d'un
-- générateur déterministe : le même numéro donne le même carnet chez tout le monde, serveur compris).
-- RÈGLE : chaque défi se réussit en UNE SEULE partie (le compteur repart à chaque partie), mais les trois peuvent
-- se réussir dans trois parties différentes.
-- Module PUR (partagé serveur / joueur) : il se teste hors du jeu (outils/banc-score.luau).
local Carnets = {}

-- k = le genre du défi, v = l'objectif, p = la prime (versée au COMPTE dès qu'il est réussi)
-- rec = la récompense du carnet : { caisse = indice } | { habit = "peinture:or" } | { cash = montant }
local ECRITS = {
	{ { k = "coins", v = 25, p = 150 }, { k = "fruits", v = 4, p = 150 }, { k = "cash", v = 200, p = 200 }, rec = { caisse = 6 } },
	{ { k = "tricks", v = 2, p = 300 }, { k = "perfect", v = 1, p = 300 }, { k = "kmh", v = 672, p = 300 }, rec = { caisse = 7 } },
	{ { k = "zones", v = 1, p = 750 }, { k = "chain", v = 3, p = 750 }, { k = "cash", v = 2500, p = 1000 }, rec = { caisse = 8 } },
	{ { k = "survie", v = 150, p = 2000 }, { k = "tricks", v = 8, p = 2000 }, { k = "cash", v = 12000, p = 2500 }, rec = { habit = "peinture:or", nom = "OR MASSIF", en = "SOLID GOLD" } },
	{ { k = "zones", v = 2, p = 4000 }, { k = "chain", v = 4, p = 4000 }, { k = "perfect", v = 3, p = 4000 }, rec = { habit = "trainee:arcenciel", nom = "ARC-EN-CIEL", en = "RAINBOW" } },
	{ { k = "tricks", v = 10, p = 5000 }, { k = "coins", v = 120, p = 5000 }, { k = "zones", v = 2, p = 6000 }, rec = { caisse = 65 } },
	{ { k = "perfect", v = 5, p = 7500 }, { k = "kmh", v = 900, p = 7500 }, { k = "chain", v = 6, p = 9000 }, rec = { caisse = 63 } },
	{ { k = "zones", v = 3, p = 13000 }, { k = "fruits", v = 12, p = 13000 }, { k = "cash", v = 60000, p = 15000 }, rec = { caisse = 64 } },
	{ { k = "tricks", v = 20, p = 20000 }, { k = "perfect", v = 10, p = 20000 }, { k = "zones", v = 4, p = 25000 }, rec = { caisse = 62 } },
}
Carnets.ECRITS = #ECRITS

-- ── le générateur des carnets 10 et suivants (carnetBrut, L21526) ──
local function mul32(a: number, b: number): number -- Math.imul : le produit sur 32 bits
	local al, ah = bit32.band(a, 0xFFFF), bit32.rshift(a, 16)
	local bl, bh = bit32.band(b, 0xFFFF), bit32.rshift(b, 16)
	return bit32.band(al * bl + bit32.lshift(bit32.band(ah * bl + al * bh, 0xFFFF), 16), 0xFFFFFFFF)
end
local function ecoRond(v: number): number
	if v < 100 then return math.max(10, math.floor(v / 10 + 0.5) * 10) end
	local e = 10 ^ (math.floor(math.log10(v)) - 1) -- deux chiffres significatifs
	return math.floor(v / e + 0.5) * e
end
Carnets.ecoRond = ecoRond

-- n = l'indice du carnet à partir de 0 (le carnet « 1 » du joueur est n = 0)
function Carnets.de(n: number): any
	if ECRITS[n + 1] then return ECRITS[n + 1] end
	local l = n - #ECRITS + 1
	local pr = ecoRond(5000 * 0.5 * (1 + 0.25 * l))
	local POOL = {
		{ k = "coins", v = math.min(300, 60 + 20 * l) }, { k = "fruits", v = math.min(60, 10 + 3 * l) },
		{ k = "cash", v = ecoRond(12000 * math.min(4, 1 + 0.3 * l)) }, { k = "tricks", v = math.min(30, 8 + 3 * l) },
		{ k = "perfect", v = math.min(10, 3 + l) }, { k = "kmh", v = math.min(1200, 680 + 48 * l) },
		{ k = "zones", v = math.min(6, 2 + math.floor(l / 2)) }, { k = "survie", v = math.min(420, 150 + 30 * l) },
		{ k = "chain", v = math.min(8, 4 + l) }, { k = "nitro", v = math.min(60, 20 + 5 * l) },
	}
	local h = mul32(n, 2654435761)
	if h == 0 then h = 1 end
	local c: any = { rec = { cash = 2 * pr } }
	local pris: { [string]: boolean } = {}
	local garde = 0
	while #c < 3 and garde < 200 do
		garde += 1
		h = bit32.band(mul32(h, 1103515245) + 12345, 0xFFFFFFFF)
		local q = POOL[(bit32.rshift(h, 8) % #POOL) + 1]
		if not pris[q.k] then
			pris[q.k] = true
			table.insert(c, { k = q.k, v = q.v, p = pr })
		end
	end
	return c
end

-- ── les textes (misTxt, L21543) ──
local function duree(v: number, fr: boolean): string
	if v < 60 then return v .. " S" end
	local m, s = v // 60, v % 60
	return m .. " MIN" .. ((s > 0) and string.format(" %02d", s) or "")
end
Carnets.duree = duree
-- argent(v) : la mise en forme d'un montant (fournie par l'appelant : « $ 2,5 k »)
function Carnets.texte(d: { k: string, v: number }, fr: boolean, argent: (number) -> string): string
	local k, v = d.k, d.v
	if k == "coins" then return fr and ("RAMASSE " .. v .. " PIECES") or ("GRAB " .. v .. " COINS") end
	if k == "fruits" then return fr and ("CROQUE " .. v .. " FRUITS") or ("EAT " .. v .. " FRUITS") end
	if k == "cash" then return (fr and "ENCAISSE " or "BANK ") .. argent(v) end
	if k == "tricks" then return fr and ("REUSSIS " .. v .. " FIGURE" .. (v > 1 and "S" or "")) or ("LAND " .. v .. " TRICK" .. (v > 1 and "S" or "")) end
	if k == "perfect" then
		if v == 1 then return fr and "UNE POSE PARFAITE" or "A PERFECT LANDING" end
		return fr and (v .. " POSES PARFAITES") or (v .. " PERFECT LANDINGS")
	end
	if k == "kmh" then return fr and ("ATTEINS " .. v .. " KM/H") or ("HIT " .. v .. " KM/H") end
	if k == "zones" then return fr and ("FRANCHIS " .. v .. " PORTAIL" .. (v > 1 and "S" or "")) or ("CROSS " .. v .. " PORTAL" .. (v > 1 and "S" or "")) end
	if k == "survie" then return (fr and "TIENS " or "SURVIVE ") .. duree(v, fr) end
	if k == "chain" then return fr and ("ENCHAINE " .. v .. " FIGURES D'UN VOL") or ("CHAIN " .. v .. " TRICKS IN ONE JUMP") end
	if k == "nitro" then return fr and ("BRULE " .. v .. " S DE NITRO") or ("BURN " .. v .. " S OF NITRO") end
	return k
end
-- où on en est : « 18 / 25 », « $120 / $200 », « 1 MIN 05 / 2 MIN 30 »
function Carnets.progres(d: { k: string, v: number }, val: number, fr: boolean, argent: (number) -> string): string
	local x = math.min(d.v, val)
	if d.k == "cash" then return argent(x) .. " / " .. argent(d.v) end
	if d.k == "survie" then return duree(math.floor(x), fr) .. " / " .. duree(d.v, fr) end
	return math.floor(x) .. " / " .. d.v
end

-- ── la valeur d'un défi dans la partie en cours (misVal, L21485) : r = les compteurs de la partie ──
-- r = { pieces, fruits, gains, poses, parfaites, kmh, zones, duree, chaine, nitro }
function Carnets.valeur(k: string, r: any): number
	if k == "coins" then return r.pieces or 0 end
	if k == "fruits" then return r.fruits or 0 end
	if k == "cash" then return math.max(0, r.gains or 0) end
	if k == "tricks" then return r.poses or 0 end
	if k == "perfect" then return r.parfaites or 0 end
	if k == "kmh" then return math.floor((r.kmh or 0) + 0.5) end
	if k == "zones" then return r.zones or 0 end
	if k == "survie" then return r.duree or 0 end
	if k == "chain" then return r.chaine or 0 end
	if k == "nitro" then return r.nitro or 0 end
	return 0
end

-- un état de missions tout neuf / remis d'aplomb
function Carnets.etat(m: any): any
	local e = { n = 0, ok = { false, false, false }, best = { 0, 0, 0 }, f = -1 }
	if type(m) ~= "table" then return e end
	if type(m.n) == "number" and m.n >= 0 and m.n < 100000 then e.n = math.floor(m.n) end
	for i = 1, 3 do
		if type(m.ok) == "table" and m.ok[i] == true then e.ok[i] = true end
		if type(m.best) == "table" and type(m.best[i]) == "number" and m.best[i] == m.best[i] and m.best[i] >= 0 then e.best[i] = m.best[i] end
	end
	if type(m.f) == "number" and m.f >= 1 and m.f <= 3 then e.f = math.floor(m.f) end
	return e
end

return Carnets
