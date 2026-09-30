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
	volant = 0, assiette = 0, nitro = false, frein = false,
	tactile = { actif = false, x = 0, y = 0, nitro = false },
	surPause = nil :: (() -> ())?,
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
UserInputService.InputEnded:Connect(function(io)
	tenues[io.KeyCode] = nil
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
UserInputService.WindowFocusReleased:Connect(function()
	table.clear(tenues) -- on a changé de fenêtre : plus aucune touche n'est tenue
end)

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
		a = t.y
	end
	Controles.volant = math.clamp(v, -1, 1)
	Controles.assiette = math.clamp(a, -1, 1)
	Controles.nitro = un(N) or pad.r2 or t.nitro
	Controles.frein = un(B) or un(F) or pad.l2 or (t.actif and t.y < -0.65)
end

return Controles
