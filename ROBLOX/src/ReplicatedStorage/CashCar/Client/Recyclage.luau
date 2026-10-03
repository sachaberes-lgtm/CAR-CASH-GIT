-- CASH CAR — LE RECYCLAGE DES PIÈCES.
-- Mesuré au banc le 3/10 (outils/distant : `client("stats")`) : la mémoire « PhysicsParts » montait d'environ 20 Mo à CHAQUE zone
-- bâtie, et ne redescendait jamais — sur une longue session de téléphone (une zone 3, une zone 4… à chaque partie), de quoi
-- saturer. Une expérience isolée a donné la loi : une pièce posée dans le monde laisse ~1,25 Ko derrière elle à sa destruction,
-- quoi qu'on fasse (même une Part toute simple) ; mais une pièce qu'on SORT du monde puis qu'on y REMET ne coûte plus rien après
-- sa première entrée (6 000 pièces, quatre allers-retours : 0 Mo de plus).
-- Donc : quand une zone est oubliée, ses pièces simples (rails, tirets, béton, tuyaux, néons, tours) ne sont plus détruites —
-- elles attendent ici, hors du monde, et la zone suivante les reprend. Seules les pièces MARQUÉES (attribut « Rec ») et sans
-- enfant y passent : ce qu'on a fabriqué pour ça, rien d'autre.
--   · Recyclage.part()      : une Part dans l'état d'une Part neuve (pour les propriétés que nos constructeurs touchent) ;
--   · Recyclage.copie(g)    : une copie d'un GABARIT (les tours de la ville) — g porte sa clé dans « Rec », ses copies aussi ;
--   · Recyclage.rendre(d)   : le dossier d'une zone qu'on oublie — il sort du monde TOUT DE SUITE, ses pièces marquées rejoignent la
--     réserve par paquets (1 500 par image : une ville, c'est 15 000 pièces — d'un bloc, 110 ms d'à-coup au portail), puis le reste
--     est détruit.
local Recyclage = {}

local reserve: { [string]: { BasePart } } = {}
local gabaritDe: { [string]: BasePart } = {}
local LOIN = CFrame.new(0, -1e5, 0)
local MAX = 30000 -- (au-delà, on détruit : la réserve ne grossit pas sans fin)
local total = 0
-- (avant de ranger une pièce : ce que son module doit oublier d'elle, par la 1re lettre de sa clé — « N » : les nuages)
Recyclage.surRendre = {} :: { [string]: (BasePart) -> () }

function Recyclage.part(): Part
	local l = reserve.P
	local p = l and table.remove(l)
	if p then
		total -= 1
		return p :: Part
	end
	local n = Instance.new("Part")
	n:SetAttribute("Rec", "P")
	return n
end

-- le gabarit doit porter sa clé (`g:SetAttribute("Rec", cle)`, cle ≠ "P") : ses copies en héritent
function Recyclage.copie(g: BasePart): BasePart
	local cle = g:GetAttribute("Rec")
	if type(cle) == "string" then
		gabaritDe[cle] = g
		local l = reserve[cle]
		local p = l and table.remove(l)
		if p then
			total -= 1
			-- ce que l'usage précédent a pu changer, repris du gabarit (la taille, la place et la teinte : l'appelant les pose)
			if p:IsA("MeshPart") and g:IsA("MeshPart") then p.TextureContent = g.TextureContent end
			p.Transparency = g.Transparency
			p.LocalTransparencyModifier = 0
			return p
		end
	end
	return g:Clone()
end

function Recyclage.rendre(dossier: Instance?)
	if not dossier then return end
	dossier.Parent = nil
	task.spawn(function()
		for i, d in dossier:GetDescendants() do
			if i % 1500 == 0 then task.wait() end
			if d:IsA("BasePart") then
				local cle = d:GetAttribute("Rec")
				if type(cle) == "string" and total < MAX and not d:FindFirstChildWhichIsA("Instance") then
					local f9 = Recyclage.surRendre[string.sub(cle, 1, 1)]
					if f9 then pcall(f9, d) end
					d.Parent = nil
					d.CFrame = LOIN
					if cle == "P" then
						-- l'état d'une Part neuve, pour tout ce qu'un constructeur peut avoir changé SANS le reposer à chaque fois
						d.Name = "Part"
						d.CastShadow = true
						d.Transparency = 0
						d.Reflectance = 0
						d.LocalTransparencyModifier = 0;
						(d :: Part).Shape = Enum.PartType.Block
					end
					local l = reserve[cle]
					if not l then
						l = {}
						reserve[cle] = l
					end
					table.insert(l, d)
					total += 1
				end
			end
		end
		dossier:Destroy()
	end)
end

-- (banc) combien attendent
function Recyclage.compte(): number return total end

return Recyclage
