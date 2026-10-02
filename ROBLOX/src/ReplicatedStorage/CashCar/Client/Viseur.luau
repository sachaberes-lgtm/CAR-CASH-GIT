-- CASH CAR — LE VISEUR D'ATTERRISSAGE (landMark, L37462 du jeu web) : « où vais-je atterrir ? »
-- En vol, un ANNEAU se pose sur la route là où la caisse va retomber (le Pilote le calcule : la même chute, intégrée en avance).
-- Sa couleur dit la pose qui vient : OR et qui bat = la fenêtre du PARFAIT (vas-y, c'est maintenant), BLANC = une pose normale,
-- ROUGE = un posé lourd. Il apparaît d'un coup (14/s) et s'efface plus doucement (7/s) : la dernière pose trouvée reste le
-- temps du fondu. Sous la dalle comme dessus : l'anneau se pose sur la face où l'on va toucher.
-- ROBLOX n'a pas de tore : l'anneau est peint sur une plaque (deux faces), hors lumière.
local Config = require(script.Parent.Parent:WaitForChild("Config"))
local M = Config.M

local Viseur = {}

local OR, BLANC, ROUGE = Color3.fromRGB(255, 215, 94), Color3.fromRGB(255, 255, 255), Color3.fromRGB(255, 80, 64)
local R = 3 -- m : le rayon de l'anneau
local V: any = nil
local E = { a = 0, c = BLANC, cible = BLANC }

local function batir()
	if V then return end
	local p = Instance.new("Part")
	p.Name = "Viseur"
	p.Anchored = true
	p.CanCollide, p.CanQuery, p.CanTouch = false, false, false
	p.CastShadow = false
	p.Transparency = 1
	p.Size = Vector3.new(R * 2.6 * M, 0.05, R * 2.6 * M)
	local traits, cadres = {}, {}
	for _, face in { Enum.NormalId.Top, Enum.NormalId.Bottom } do
		local sg = Instance.new("SurfaceGui")
		sg.Face = face
		sg.SizingMode = Enum.SurfaceGuiSizingMode.FixedSize
		sg.CanvasSize = Vector2.new(256, 256)
		sg.LightInfluence = 0
		sg.Brightness = 4
		sg.Parent = p
		local f = Instance.new("Frame")
		f.AnchorPoint = Vector2.new(0.5, 0.5)
		f.Position = UDim2.fromScale(0.5, 0.5)
		f.Size = UDim2.fromScale(1 / 1.3, 1 / 1.3)
		f.BackgroundTransparency = 1
		f.BorderSizePixel = 0
		f.Parent = sg
		local c = Instance.new("UICorner")
		c.CornerRadius = UDim.new(0.5, 0)
		c.Parent = f
		local st = Instance.new("UIStroke")
		st.Thickness = 256 / 1.3 * 0.35 / R * 0.5 -- (le tube du tore : 0,35 m)
		st.Transparency = 1
		st.Parent = f
		table.insert(traits, st)
		table.insert(cadres, f)
	end
	p.Parent = workspace
	V = { p = p, traits = traits, cadres = cadres }
end

-- À chaque image. `vu` : une pose est en vue ; `cf` : où (l'anneau à plat sur la dalle) ; `impact` : la vitesse d'impact prédite.
function Viseur.tick(dt: number, vu: boolean, cf: CFrame?, impact: number?, t: number)
	if not V then
		if not vu then return end
		batir()
	end
	local echelle = 1
	if vu and cf then
		V.p.CFrame = cf
		local i = impact or 0
		E.cible = (i < 4.5) and OR or ((i >= 10) and ROUGE or BLANC)
		if E.a < 0.05 then E.c = E.cible end
		if i < 4.5 then echelle = 1 + math.sin(t * 10) * 0.12 end -- l'anneau OR bat
	end
	E.a += ((vu and 1 or 0) - E.a) * math.min(1, dt * (vu and 14 or 7))
	E.c = E.c:Lerp(E.cible, math.min(1, dt * 12)) -- la teinte GLISSE de l'une à l'autre
	local montre = E.a > 0.02
	for k, st in V.traits do
		st.Transparency = montre and (1 - 0.85 * E.a) or 1
		st.Color = E.c
		V.cadres[k].Size = UDim2.fromScale(echelle / 1.3, echelle / 1.3)
	end
end

return Viseur
