-- CASH CAR — LE BUS : le pilote ANNONCE ce qui arrive (une pièce, une figure, une pose, un décollage, une
-- mort, un portail…), les systèmes ÉCOUTENT (FLOW, frénésie, aura, missions, carrière, sons, jus…).
-- Aucun système n'a besoin de connaître les autres, et le pilote reste la physique.
--
--   Bus.on("piece", function(valeur, combo) … end)
--   Bus.emit("piece", valeur, combo)
--   Bus.etat()           → l'instantané de la partie (vitesse, position, mode…), fourni par le pilote
--   Bus.agir.argent(x)   → les leviers que le pilote prête aux systèmes (argent, nitro, vitesse, ralenti…)
local Bus = {}

local ecoutes: { [string]: { (...any) -> () } } = {}

function Bus.on(nom: string, f: (...any) -> ())
	local l = ecoutes[nom]
	if not l then
		l = {}
		ecoutes[nom] = l
	end
	table.insert(l, f)
end

-- une écoute qui plante ne casse JAMAIS la partie (le message part dans l'Output de Studio)
function Bus.emit(nom: string, ...: any)
	local l = ecoutes[nom]
	if not l then return end
	for _, f in l do
		local ok, err = pcall(f, ...)
		if not ok then warn("[CashCar] écoute « " .. nom .. " » : " .. tostring(err)) end
	end
end

Bus.etat = function(): { [string]: any } return {} end
Bus.agir = {} :: { [string]: (...any) -> any }

return Bus
