-- BANC DU SCORE (hors Roblox) : luau outils/banc-score.luau   — vérifie le FLOW, la frénésie et la chaîne d'aura contre la fiche du jeu web
local Score = require("../src/ReplicatedStorage/CashCar/Client/Score")
local journal = {}
Score.dire.pop = function(t) table.insert(journal, "pop:" .. t) end
Score.dire.slam = function(t, s) table.insert(journal, "slam:" .. t .. "|" .. tostring(s)) end
Score.dire.fren = function(e) table.insert(journal, "fren:" .. e) end
local ok, ko = 0, 0
local function verifie(nom, a, b, tol)
	local bon = (type(a) == "number" and type(b) == "number") and math.abs(a - b) <= (tol or 1e-6) or a == b
	if bon then ok += 1 else ko += 1; print("ÉCHEC", nom, "obtenu", a, "attendu", b) end
end

-- 1. la chaîne d'aura : l'exemple de la fiche (§3.5) = 1650
Score.debut(0, 0)
Score.ETAT.mode = "fall"
Score.geste("180", 45, "vrille", true)
Score.geste("360", 45, "vrille", true)
Score.geste("BIG AIR", 50, "bigair")
Score.geste("METEORE", 100, "meteo")
for _ = 1, 100 do Score.chaineTick(0.1, "fall") end -- en l'air l'horloge est gelée
verifie("chaine ouverte en vol", Score.CHA.n, 4)
Score.ETAT.mode = "drive"
Score.geste("POSE PARFAITE", 70, "pose")
Score.chaineTick(2, "drive")
Score.geste("FROLE", 20, "frole", false, true)
verifie("multiplicateur", Score.CHA.x, 5)
for _ = 1, 40 do Score.chaineTick(0.1, "drive") end
verifie("aura encaissée", Score.aura(), 1650)
verifie("chaine fermée", Score.CHA.n, 0)
-- la redite d'une même famille : −30 %, pas de +1 au multiplicateur
Score.geste("BIG AIR", 50, "bigair"); Score.geste("BIG AIR", 50, "bigair")
verifie("redite", Score.CHA.pts, 50 + 35)
verifie("redite x", Score.CHA.x, 1)
Score.chainePerdue()
verifie("chaine perdue", Score.aura(), 1650)

-- 2. le FLOW : une pièce à la croisière vaut 0.7 × 1 × 0.55 = 0.385
Score.debut(0, 0)
Score.flowTick(0.016, "drive", 1, false)
Score.flowAdd(0.7, "route")
verifie("pièce case 1", Score.FLOW.v, 0.385, 1e-9)
-- la vitesse compte : à 0.6 de la croisière ×0.35, à 1.3 ×1.35
Score.debut(0, 0); Score.flowTick(0.016, "drive", 0.6, false); Score.flowAdd(10, "style")
verifie("lent", Score.FLOW.v, 10 * 0.55 * 0.35, 1e-9)
Score.debut(0, 0); Score.flowTick(0.016, "drive", 1.3, false); Score.flowAdd(10, "style")
verifie("rapide", Score.FLOW.v, 10 * 0.55 * 1.35, 1e-9)
-- monter jusqu'à l'arme : des figures (risque) à la croisière
Score.debut(0, 0)
local gestes = 0
while not Score.FREN.arme and gestes < 400 do
	Score.flowTick(0.016, "fall", 1, false)
	Score.flowAdd(12, "risque")
	gestes += 1
end
verifie("armée", Score.FREN.arme, true)
verifie("palier avant frénésie", Score.FLOW.lv, 3)
print("  gestes de risque (12) pour armer :", gestes)
-- la case TRIADE refuse tout sous 92,5 % de la croisière
Score.debut(0, 0); Score.FLOW.v = 80; Score.FLOW.lv = 3
Score.flowTick(0.016, "drive", 0.9, false)
local v0 = Score.FLOW.v
Score.flowAdd(12, "risque")
verifie("porte de vitesse", Score.FLOW.v, v0, 1e-9)
-- la frénésie : déclenchée, les trois traits pleins, ×3
Score.debut(0, 0); Score.FLOW.v = 99.9; Score.FLOW.lv = 3
Score.flowTick(0.016, "fall", 1, false); Score.flowAdd(12, "risque")
verifie("armée 2", Score.frenPeut(), true)
Score.frenDeclenche()
verifie("frénésie", Score.niveau(), 4)
verifie("×3", Score.flowMult(), 3)
verifie("traits pleins", Score.FREN.tr.n + Score.FREN.tr.m + Score.FREN.tr.p, 4 + 8 + 1.5)
-- on ne nourrit rien, au sol, à la croisière : PSYCHO meurt à 1,5 s, NARCISSE à 4 s, MACHIAVEL à 8 s ; la jauge passe sous 88
local t, perdu = 0, nil
while t < 30 do
	Score.flowTick(0.02, "drive", 1, false); t += 0.02
	if Score.niveau() < 4 then perdu = t; break end
end
print(string.format("  frénésie tenue sans rien faire : %.2f s", perdu or -1))
verifie("frénésie perdue", perdu ~= nil and perdu > 4 and perdu < 9, true)
verifie("retombée", Score.FLOW.v, 76, 1e-6)
verifie("palier après", Score.FLOW.lv, 3)
-- en vol rien ne brûle
Score.debut(0, 0); Score.FLOW.v = 99.9; Score.FLOW.lv = 3; Score.flowTick(0.016, "fall", 1, false); Score.flowAdd(12, "risque"); Score.frenDeclenche()
for _ = 1, 500 do Score.flowTick(0.02, "fall", 1, false) end
verifie("vol : tient", Score.niveau(), 4)
verifie("vol : traits intacts", Score.FREN.tr.p, 1.5)
-- la fuite hors frénésie : case 2 (25-50), répit 2,75 s puis 2,8 /s
Score.debut(0, 0); Score.FLOW.v = 40; Score.FLOW.lv = 1
for _ = 1, 137 do Score.flowTick(0.02, "drive", 1, false) end -- 2,74 s : rien
verifie("répit", Score.FLOW.v, 40, 1e-6)
for _ = 1, 100 do Score.flowTick(0.02, "drive", 1, false) end -- 2 s de fuite
verifie("fuite", Score.FLOW.v, 40 - 2.8 * (0.74 + 2 - 0.75), 0.08)
-- la pose ratée
Score.debut(0, 0); Score.FLOW.v = 60; Score.FLOW.lv = 2; Score.flowCasse(70)
verifie("pose ratée", Score.FLOW.v + Score.FLOW.lv, 0)

-- 3. le ralenti : 2,7 s réelles, le temps du jeu passé est plus court
Score.debut(0, 0); Score.ralentiPose(2.7)
local jeu = 0
for _ = 1, 270 do jeu += Score.ralentiDt(0.01, false) end
print(string.format("  ralenti : 2,70 s réelles = %.2f s de jeu", jeu))
verifie("ralenti", jeu > 1.2 and jeu < 2.0, true)

-- 4. le dauphin : 2 s au ras (hF 2 m) à la croisière
Score.debut(0, 0); Score.ETAT.mode = "fall"
local nee = false
for i = 1, 100 do if Score.dolTick(0.02, true, 2, 1, 0.5 + i * 0.02) then nee = true end end
verifie("dauphin né", nee, true)
print("  dauphin : aura vue après 2 s au ras =", Score.dolVu())
Score.ETAT.mode = "drive"; Score.dolPose()
print("  dauphin : chaîne après la pose =", Score.CHA.pts, "×", Score.CHA.x, "· nage versée au compteur =", Score.aura())
verifie("dauphin : la figure reste un geste de chaîne", Score.CHA.pts, 150)
verifie("dauphin : la nage tombe droit au compteur", Score.aura() > 500, true)

-- 4 bis. LA CHAÎNE SE FERME : les robinets vont droit au compteur ; une chaîne vit 25 s au plus
Score.debut(0, 0); Score.ETAT.mode = "drive"
Score.geste("RECOLTE x5", 20, "recolte", true, true, true)
verifie("robinet : au compteur", Score.aura(), 20)
verifie("robinet : hors chaîne", Score.CHA.n, 0)
Score.ETAT.mode = "fall"
Score.geste("180", 45, "vrille", true)
for _ = 1, 260 do Score.chaineTick(0.1, "fall") end -- 26 s en vol : elle a passé l'âge, mais ne s'encaisse qu'au sol
verifie("chaîne vieille, encore ouverte en vol", Score.CHA.n, 1)
Score.chaineTick(0.016, "drive")
verifie("chaîne vieille : encaissée à la pose", Score.aura(), 65)

-- 4 ter. LA LOI DU RÉSERVOIR
verifie("part : vol tout nitro", Score.nitroPartDe(3, 3), 0)
verifie("part : vol sans nitro", Score.nitroPartDe(3, 0), 1)
verifie("pose pleine", Score.nitroPoseDe(2, 1.2, 0), 0.4, 1e-9)
verifie("pose d'un sautillement", Score.nitroPoseDe(2, 0.6, 0), 0.2, 1e-9)
verifie("pose d'un vol tenu au nitro", Score.nitroPoseDe(2, 3, 3), 0)
verifie("figure parfaite, moitié nitro", Score.nitroFigDe(1, 1.5, 2, 1), 0.57 * 1.5 * 0.5, 1e-9)
verifie("bump 1", Score.nitroBumpDe(1, false), 0.35, 1e-9)
verifie("bump 2", Score.nitroBumpDe(2, false), 0.21, 1e-9)
verifie("bump 5", Score.nitroBumpDe(5, false), 0)
verifie("bump nitro allumée", Score.nitroBumpDe(1, true), 0)
verifie("NITROOO au sol", Score.nitroConsoDe(1, 0.5, false, true, false), 0.75, 1e-9)
verifie("NITROOO en vol", Score.nitroConsoDe(1, 0.5, false, true, true), 1, 1e-9)
verifie("frénésie", Score.nitroConsoDe(1, 0.5, true, true, true), 0.5, 1e-9)
verifie("tient", Score.nitroTientDe(0.1, 0.033, true), true)
verifie("à sec il s'éteint (30 i/s)", Score.nitroTientDe(0.02, 0.033, true), false)
verifie("ne se rallume pas sous 0,3", Score.nitroTientDe(0.25, 0.016, false), false)
-- la boucle de Sacha : bouton tenu, jauge de 2 — à 30 images/s le réacteur doit s'ÉTEINDRE
do
	local r, on, allume, dt = 2, false, 0, 1 / 30
	for _ = 1, 30 * 60 do
		r = math.min(2, r + Score.N2.regen * dt)
		local prise = Score.nitroConsoDe(dt, 0.5, false, false, false)
		on = Score.nitroTientDe(r, prise, on)
		if on then r -= prise; allume += dt end
	end
	print(string.format("  bouton tenu 60 s à 30 i/s : réacteur allumé %.0f %% du temps", allume / 60 * 100))
	verifie("plus de nitro infinie", allume < 30, true)
end

-- 5. les carnets : le générateur des carnets 10 et suivants doit tirer les mêmes défis que le jeu web
local Carnets = require("../src/ReplicatedStorage/CashCar/Carnets")
local attendu = {
	[10] = { "tricks 11", "coins 80", "fruits 13", 3100, 6200 }, [11] = { "tricks 14", "coins 100", "survie 210", 3800, 7600 },
	[12] = { "coins 120", "perfect 6", "kmh 824", 4400, 8800 }, [13] = { "zones 4", "tricks 20", "nitro 40", 5000, 10000 },
	[14] = { "zones 4", "survie 300", "chain 8", 5600, 11200 }, [15] = { "tricks 26", "zones 5", "fruits 28", 6300, 12600 },
	[16] = { "nitro 55", "zones 5", "coins 200", 6900, 13800 },
}
for num, a in attendu do
	local c = Carnets.de(num - 1)
	local lus = {}
	for i = 1, 3 do lus[c[i].k .. " " .. c[i].v] = true end
	for i = 1, 3 do verifie("carnet " .. num .. " défi " .. a[i], lus[a[i]] == true, true) end
	verifie("carnet " .. num .. " prime", c[1].p, a[4])
	verifie("carnet " .. num .. " récompense", c.rec.cash, a[5])
end
verifie("carnet 1", Carnets.de(0)[1].v, 25)
verifie("carnet 9 récompense", Carnets.de(8).rec.caisse, 62)
verifie("texte", Carnets.texte({ k = "survie", v = 150 }, true, tostring), "TIENS 2 MIN 30")

print(string.format("%d vérifications, %d échec(s)", ok + ko, ko))
