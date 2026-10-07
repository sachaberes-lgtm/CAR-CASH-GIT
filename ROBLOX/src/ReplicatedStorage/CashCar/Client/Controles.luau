-- CASH CAR — LES COMMANDES. Trois mondes, une seule sortie :
--   Controles.volant  (−1 gauche … +1 droite)
--   Controles.assiette (+1 = PIQUÉ, nez vers le bas ; −1 = CABRER) — ne sert qu'en l'air
--   Controles.nitro   (vrai tant qu'on tient)
--   Controles.frein   (au sol : freiner)
-- Clavier : ← → (ou Q/A et D) · ↑ ↓ (ou Z/W et S) · ESPACE ou MAJ = nitro.
-- Manette : stick gauche · R2 ou A = nitro · L2 ou B = frein.
-- Tactile : le HUD pose ses doigts dans Controles.tactile (la moitié gauche est le volant, le pouce droit la nitro).
-- Le gaz est AUTOMATIQUE partout (comme sur téléphone dans le jeu web) : on ne réclame jamais un troisième doigt.
local UserInputService = game:GetService("UserInputService")

local Controles = {
	volant = 0, assiette = 0, nitro = false, frein = false, tireBas = false,
	tactile = { actif = false, x = 0, y = 0, nitro = false },
	surPause = nil :: (() -> ())?,
	-- POUCE HAUT EN VOL (volSens du web) : 1 = PLONGE (pouce en haut = le nez plonge), −1 = MONTE. Le clavier et la manette ne changent pas.
	sensVol = 1,
}

local tenues: { [Enum.KeyCode]: boolean } = {}
local pad = { x = 0, y = 0, r2 = false, l2 = false }

local G = { [Enum.KeyCode.Left] = true, [Enum.KeyCode.A] = true, [Enum.KeyCode.Q] = true }
local D = { [Enum.KeyCode.Right] = true, [Enum.KeyCode.D] = true }
local H = { [Enum.KeyCode.Up] = true, [Enum.KeyCode.W] = true, [Enum.KeyCode.Z] = true }
local B = { [Enum.KeyCode.Down] = true, [Enum.KeyCode.S] = true }
local N = { [Enum.KeyCode.Space] = true, [Enum.KeyCode.LeftShift] = true, [Enum.KeyCode.RightShift] = true,
	[Enum.KeyCode.ButtonA] = true, [Enum.KeyCode.ButtonR1] = true }
local F = { [Enum.KeyCode.ButtonB] = true, [Enum.KeyCode.ButtonL1] = true }

local function un(t: { [Enum.KeyCode]: boolean }): boolean
	for k in t do
		if tenues[k] then return true end
	end
	return false
end

UserInputService.InputBegan:Connect(function(io, gp)
	if io.KeyCode == Enum.KeyCode.P or io.KeyCode == Enum.KeyCode.ButtonStart then
		if Controles.surPause then Controles.surPause() end
		return
	end
	if gp and io.UserInputType == Enum.UserInputType.Keyboard then return end -- on tape dans le chat
	tenues[io.KeyCode] = true
end)
-- (6/10) LE BOUTON NITRO NE RESTE PLUS COINCÉ : un doigt (ou la souris) qui GLISSE hors du bouton avant de se lever ne déclenche
-- pas l'InputEnded du bouton (Roblox ne le donne qu'au-dessus de lui) — la nitro restait tenue, réacteur allumé, jusqu'au
-- prochain appui. On suit ici chaque doigt posé sur le bouton jusqu'à son VRAI lever, où qu'il ait glissé.
local doigtsNitro: { [InputObject]: boolean } = {}
function Controles.brancherNitro(b: GuiObject)
	b.InputBegan:Connect(function(io)
		if io.UserInputType == Enum.UserInputType.Touch or io.UserInputType == Enum.UserInputType.MouseButton1 then doigtsNitro[io] = true end
	end)
end
UserInputService.InputEnded:Connect(function(io)
	tenues[io.KeyCode] = nil
	local souris = io.UserInputType == Enum.UserInputType.MouseButton1
	if doigtsNitro[io] or souris then
		local avant = next(doigtsNitro) ~= nil
		doigtsNitro[io] = nil
		if souris then -- (la souris : son objet d'entrée n'est pas toujours le même d'un clic à l'autre)
			for k in doigtsNitro do
				if k.UserInputType == Enum.UserInputType.MouseButton1 then doigtsNitro[k] = nil end
			end
		end
		if avant and next(doigtsNitro) == nil then Controles.tactile.nitro = false end
	end
end)
UserInputService.InputChanged:Connect(function(io)
	if io.KeyCode == Enum.KeyCode.Thumbstick1 then
		pad.x, pad.y = io.Position.X, io.Position.Y
	elseif io.KeyCode == Enum.KeyCode.ButtonR2 then
		pad.r2 = io.Position.Z > 0.3
	elseif io.KeyCode == Enum.KeyCode.ButtonL2 then
		pad.l2 = io.Position.Z > 0.3
	end
end)
-- (6/10) la manette aussi se relâche : une gâchette R2 (nitro) ou un stick tenus au moment d'un alt-tab ou d'une manette débranchée
-- restaient « tenus » pour toujours (la caisse braquait seule, la nitro brûlait seule)
local function relache()
	table.clear(tenues) -- on a changé de fenêtre : plus aucune touche n'est tenue
	pad.x, pad.y, pad.r2, pad.l2 = 0, 0, false, false
	table.clear(doigtsNitro)
	Controles.tactile.nitro = false
end
UserInputService.WindowFocusReleased:Connect(relache)
UserInputService.GamepadDisconnected:Connect(relache)

local function zm(v: number, z: number): number -- zone morte + courbe douce (1,35 comme le volant tactile du jeu web)
	local a = math.abs(v)
	if a < z then return 0 end
	local n = (a - z) / (1 - z)
	return math.sign(v) * n ^ 1.35
end

-- à appeler une fois par image
function Controles.lire()
	local v = (un(D) and 1 or 0) - (un(G) and 1 or 0)
	local a = (un(H) and 1 or 0) - (un(B) and 1 or 0)
	local px = zm(pad.x, 0.12)
	local py = zm(pad.y, 0.2)
	if px ~= 0 then v = px end
	if py ~= 0 then a = py end
	local t = Controles.tactile
	if t.actif then
		v = t.x
		a = t.y * Controles.sensVol
	end
	Controles.volant = math.clamp(v, -1, 1)
	Controles.assiette = math.clamp(a, -1, 1)
	Controles.nitro = un(N) or pad.r2 or t.nitro
	Controles.frein = un(B) or un(F) or pad.l2 or (t.actif and t.y < -0.65)
	-- (6/10) LE GESTE DU DRIFT au pouce (tireBas, DRIFT_PX = 34,9 px du web) : le pouce tiré à mi-course vers le bas, en braquant,
	-- suffit à décrocher — on le confondait avec le FREIN (≈ 50 px), et le drift tactile demandait un pouce tiré presque jusqu'en bas
	Controles.tireBas = t.actif and t.y < -0.34
end

return Controles
