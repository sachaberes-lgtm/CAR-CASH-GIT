-- CASH CAR — LES TRACES DE PNEUS (TRACE, traceTick, L30834 du jeu web ; Sacha, 26/09 : « lors des virages il faut laisser des traces
-- noires », puis « moins foncées, avec une légère transparence ; il faut qu'elles SORTENT DIRECTEMENT des roues »).
-- Un ruban par roue ARRIÈRE, de la largeur de son pneu, posé au ras du bitume dès que la caisse tourne fort ou glisse. Une gomme
-- gris-noir à demi transparente : une trace, pas un trait de marqueur. Le ruban se coupe quand la gomme lâche ou au décollage.
-- ROBLOX : deux `Trail`, chacun tendu entre les deux bords d'un pneu — le ruban reste à plat sur la route, il part de la roue, il
-- s'efface tout seul (8 s). Une plaque invisible suit la caisse et porte les quatre attaches.
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local M = Config.M

local Traces = {}

local V: any = nil
local PNEU = 0.34 -- m : la largeur d'un pneu arrière

local function batir()
	if V then return end
	local p = Instance.new("Part")
	p.Name = "TracesPneus"
	p.Anchored = true
	p.CanCollide, p.CanQuery, p.CanTouch = false, false, false
	p.Transparency = 1
	p.Size = Vector3.new(1, 1, 1)
	local t = {}
	for k = 1, 2 do
		local a0, a1 = Instance.new("Attachment"), Instance.new("Attachment")
		a0.Parent, a1.Parent = p, p
		local tr = Instance.new("Trail")
		tr.Attachment0, tr.Attachment1 = a0, a1
		tr.Lifetime = 8
		tr.MinLength = 0.5 * M -- (un nouveau point tous les 50 cm)
		tr.FaceCamera = false
		tr.Color = ColorSequence.new(Color3.fromRGB(26, 24, 32))
		tr.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.45), NumberSequenceKeypoint.new(0.7, 0.55), NumberSequenceKeypoint.new(1, 1) })
		tr.LightEmission = 0
		tr.LightInfluence = 1
		tr.Enabled = false
		tr.Parent = p
		t[k] = { a0, a1, tr }
	end
	p.Parent = workspace
	V = { p = p, t = t, pos = nil, on = false }
end

-- À chaque image. `on` : la gomme marque (au sol, ça tourne fort ou ça glisse). `cf` : la caisse, posée sur la route.
function Traces.tick(on: boolean, cf: CFrame, demi: number, long: number)
	if not V then
		if not on then return end
		batir()
	end
	-- (un portail, un replacement : la caisse a sauté ailleurs — le ruban ne traverse pas le monde)
	if V.pos and (cf.Position - V.pos).Magnitude > 60 * M then
		for _, t in V.t do t[3]:Clear() end
	end
	V.pos = cf.Position
	V.p.CFrame = cf
	if on ~= V.on then
		V.on = on
		for _, t in V.t do t[3].Enabled = on end
	end
	if on then
		for k, t in V.t do
			local x = ((k == 1) and -1 or 1) * (demi - 0.22) * M
			t[1].Position = Vector3.new(x - PNEU * 0.5 * M, 0.035 * M, long * 0.32 * M)
			t[2].Position = Vector3.new(x + PNEU * 0.5 * M, 0.035 * M, long * 0.32 * M)
		end
	end
end

return Traces
