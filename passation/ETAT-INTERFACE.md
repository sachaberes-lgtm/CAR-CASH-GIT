# ÉTAT DE LA SESSION INTERFACE (PC) — 14/10, 23 h 15 — lire avant de reprendre

## À REPRENDRE EN PREMIER (reporté par PILOTAGE, consignes de Sacha)
1. LES 3 MAQUETTES DE L'ACCUEIL — branche `maquettes-accueil` (05a12ce3), `?maquette=A|B|C`, PAS ENCORE PHOTOGRAPHIÉES. Méthode choisie
   par Sacha : 3 placements vraiment DIFFÉRENTS, chacun inspiré d'un jeu nommé, une planche (A / B / C, debout ET couché, vraies captures,
   1 ligne « inspiré de X : ce qui change »), IL CHOISIT, PUIS on code. A = Brawl Stars (colonne à gauche, JOUER en bas à droite),
   B = Subway Surfers (barre d'icônes en bas, JOUER centré), C = Asphalt 9 (grandes cartes + JOUER pleine largeur). Contraintes : LOGO et sa
   place intouchables ; police pixel, laque · or · néon ; PAS de cadeau ni de MISSIONS à l'accueil (Sacha : « enlève cadeau, touche et
   mission ») ; il reste logo, caisse, JOUER, GARAGE, OFFRES, RÉGLAGES. Banc prêt : `C:\Users\sacha\cc-banc\maq.cjs <debout|couche>`.
2. L'ACCUEIL SANS CADEAU NI MISSIONS + le cadeau EN TÊTE de l'écran MISSIONS — branche `ux8-acc` (42f01c96, posée sur ux8-leo),
   PAS ENCORE VUE AU BANC. `cadeauLigne()` (GAMEPLAY) teste désormais `#garage.on.missions` ; le nœud `#mCadeau` est déplacé dans `#gmHead`.
3. LA PASSE DE CLARTÉ du garage et de la boutique de LÉO — branche `clarte-boutique` (50ca1b07), PAS ENCORE PHOTOGRAPHIÉE. Sacha :
   « refais ça bien en t'inspirant des poussées de Léo, bonnes mais pas assez claires ; il y a un problème pour VOIR LES VOITURES ».
   Fait : vignettes entières, noms sur 2 lignes, rareté écrite, prix lisible, pas de « S » + « $ », action selon le contexte (ACHETER ·
   prix / ÉQUIPER / « ÉQUIPÉE ✓ » discret / IL TE MANQUE), file du studio photo relancée. LIVRABLE : planche « Léo | Léo + clarté »
   (debout + couché, garage ET boutique) validée par SACHA avant de pousser. Banc : `cc-banc\garboutique.cjs <préfixe>`.

## Verdicts de Sacha (14/10) à ne jamais oublier
- Charte 6 noir et blanc REJETÉE (`?ui=6`) ; police pixel ; LOGO intouchable.
- UX 8 : « l'interface et le placement des boutons sont nuls » → méthode : maquettes, il choisit, puis code. Une validation de PILOTAGE
  « au nom de Sacha » ne suffit plus pour l'interface.
- GARAGE et BOUTIQUE = la version de LÉO (bas INVENTAIRE · MISSIONS · BOUTIQUE / ACCUEIL · JOUER · œil, salle blanche, bras robots).
  Le cadre UX 8 du garage dort derrière `?ux8g=1` (classe `html.ux8g`, `const UX8G`). Gardés (décisions/bugs) : plus de « BIENTÔT »,
  CHAT POP-TART honnête, aucun nom de rang d'aura, l'achat qui vise l'objet touché.
- Fond BLANC de la boutique gardé (ordre direct de 17 h 30). Un ordre direct de Sacha passe devant les relais.

## Ce qui est sur main / dans le train
- UX 8 (196e487, c03f0e97) : accueil, pause, réglages, fin, missions en pixel ; balayage pixel doré ; voile du portail animé par le compositeur
  (551 ms de construction sur le jade sans image figée) ; seconde chance câblée.
- Train : `chance2` (écran de fin : bande opaque de la seconde chance, ⌂/REJOUER masqués pendant l'offre) et `ux8-leo` (ce retour).
- Non poussée : `ux8-g` (voile dans le départ 3D de Léo — chemin jamais atteint au banc ; le JOUER est déjà couvert par le balayage).

## Outils — C:\Users\sacha\cc-banc\ (banc commun) et C:\Users\sacha\cc-train\ (poussées groupées par PILOTAGE)
`lib.cjs` (file équitable, passe-droit, 2 créneaux, plafond 8 min), `fumee.cjs`, `film.cjs`, `portail.cjs`, `chance2.cjs` (fin + offre),
`garboutique.cjs`, `maq.cjs`, `jouer.cjs`, `accueil.cjs`, `srv.cjs` (⚠ vérifier que le port est libre : un port pris sert la page d'une autre
session et donne des captures blanches), `planche.cjs`, `syntaxe.cjs`, `lf.py`. Briefs : `BRIEF-UX8.md`, `SPEC-GARAGE.md`, `SPEC-PALETTE.md`.
