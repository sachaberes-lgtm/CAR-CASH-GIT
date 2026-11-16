# LOT 5 — LES PLANCHES PHOTO PAR NIVEAU (14/11) : rapport

Branche `qa/planches` (partie de `qualite-appareil` = lots 1-3 fusionnés). Rien dans `code/` n'est touché. Livré : `outils/banc-qualite/` (`niveaux.cjs` le banc, `passes.sh` les 4 passes sous verrou, `planches.sh` les planches) et
`passation/qualite/photos/niveaux/` (12 planches JPEG + 4 `niveaux-<fmt>-<carte>-chiffres.json` avec TOUS les relevés).

## Comment c'est pris
Chrome sans fenêtre, muet, iPhone émulé 844×390 (couché) et 390×844 (debout), DPR 3, tactile, `hover:none`, UA iPhone, SANS `?tel=1` : le profil se calcule seul depuis `?appareil=`
(`PRF.on` vrai prouve que `TEL_NATIF` est vrai ; le témoin `?sans=profil` rend `PRF.on` faux, classe 0). Sauvegarde muette neuve (réglage posé : `fast` pour N1, `haute` pour N2-N4 ; témoin : sauvegarde neuve).
Même graine de piste (`pistegraine=7`), nuages `meteo=midi` (SANS cela la météo est tirée au hasard à chaque chargement : première série jetée, ciels rose/orange/bleu selon le tirage), Jade `meteo=nuit`.
Course lancée par `dbgJouer`, pilote auto + nitro (`dbgAuto`, `dbgNitro(9,0)`), rAF coupé, `dbgStep(1,33)` × 420 pas fixes, échelle QL figée (`dbgPin`), puis deux rendus (`dbgLoupe({rendre:1})`),
capture en pixels d'écran (2532×1170 ou 1170×2532) : image entière, zoom caisse (240×170 pt ⇒ 720×510 px, planche ×2), zoom traînées (380×190 pt, planche ×2). Le relevé est refait une seconde plus tard (`releve2`) pour voir si ombre/toile bougent : **identiques partout**.

## Les chiffres (relevé après 420 pas ; nuages couché ; Jade couché entre parenthèses quand ça diffère)
| | N1 BASSE 14,2 | N2 HAUTE 14,2 | N3 HAUTE 15,4 | N4 HAUTE 18,1 | témoin ?sans=profil |
|---|---|---|---|---|---|
| classe / niveau (statique) | 1 / N1 (N2) | 1 / N2 (N2) | 2 / N3 (N3 image PC) | 4 / N4 (N4 image PC) | 0 / hors profil |
| DPR courant | 1,25 | 1,5 | 2 | 3 | 1,25 |
| cible de la scène (couché) | 1055×487 | 1266×585 | 1688×780 | = toile (loupe retirée) | 1055×487 |
| toile réelle (drawingBuffer) | 2532×1170 (la loupe/toile pleine) | 2532×1170 | 2532×1170 | 2532×1170 | 2532×1170 |
| ombre (taille, filtre) | 768 PCF | 1024 PCF | 1280 PCFSoft | 1280 PCFSoft | 768 PCF |
| halo (résolution, étages) | ½, 3 | 1, 4 | 1, 5 | 1, 5 | ½, 3 |
| loupe (kq ; px rubans) | posée ×2,4 ; 27 000 | ×2,0 ; 26 700 | ×1,5 ; 26 700 | retirée (×1) ; 0 | posée ×2,4 ; **0** (ancienne : disque seul) |
| cran QL k / cadence | 1 / 30 i/s | 1 / 30 | 0 / 30 | 0 / **60** | 0 / 30 |
| maps sobres | oui | oui | oui | **non** | oui |
| appels de dessin (nuages) | 201 | 201 | 228 | 211 | 197 |
| triangles (nuages) | 814 585 | 813 025 | 873 077 | 873 768 | 811 817 |
| appels (Jade) | 204 | 199 | 200 | 246 | 205 |
| triangles (Jade) | 758 855 | 758 089 | 800 191 | 823 024 | 760 059 |
| programmes | 171 (Jade 172) | 171 (172) | 171 (172) | 170 (171) | 171 (172) |
| géométries / textures | 604 / 133 | 604 / 134 | 615 / 136 | 615 / 136 | 604 / 132 |
Debout (Jade) : appels 189 · 191 · 194 · 238 · 188 ; triangles 684 k · 681 k · 768 k · 782 k · 681 k ; pixels de loupe sur rubans 128 700 (N1, N2), 130 200 (N3), 0 (N4, témoin).
Nuages debout : appels 178 · 187 · 191 · 190 · 176 ; triangles 736 k · 737 k · 787 k · 787 k · 736 k ; rubans 66 000 · 66 000 · 65 000 · 0 · 0.
À lire : les triangles montent de ~7 % à N3 (ombre 1280 + autoroute/décor « image PC »), et N4 ajoute des appels (+10-50 selon la map : décor non sobre) ; N1, N2 et le témoin sont à 1 % près identiques en géométrie (leurs différences sont en pixels, pas en polygones).
Les tailles de cible du tableau confirment la table du plan (1,25 / 1,5 / 2 / 3). Aucun niveau n'a dérivé entre les deux relevés (DPR, ombre, cran QL identiques).

## Ce que je VOIS (planches regardées avec l'outil Read)
**Image entière (nuages, jour)** : même ciel, même route, mêmes débris pour les 5 : la comparaison est valable. Presque aucune différence visible à l'échelle de la page ; la route est un peu plus fine/granuleuse en N3-N4 que N1-N2 ; N4 montre en plus un liseré rose du bord de piste (non sobre) et deux traits de marquage de plus (voir plus bas).
**Zoom caisse** : la lisibilité de la plaque est le meilleur marqueur : N1 et témoin = plaque floue illisible ; N2 = un peu mieux mais empâtée ; **N3 = « CC-161-RZ » lisible** ; **N4 = nette**, bords de la carrosserie et jante plus francs. Les feux arrière rouges ont un halo large et doux en N1/N2, un peu plus serré en N3/N4. La carrosserie (facettes) gagne en finesse de N1 → N4, mais l'écart N3 → N4 est faible.
**Zoom traînées** : le ruban droit (le trait orange) est un trait net avec bord franc en N1-N4, nettement plus défini que le témoin où il est un peu étalé (effet du lot 3, visible dès N1). La nappe orange (flou radial nitro) est la même partout. L'**ombre de la caisse** : bord en marches larges en N1 et surtout **N2 (1024 PCF : escalier de pixels d'ombre bien visible sur le bord en bas à droite, plus gros qu'en N1 à cause du filtre)** ; N3 et N4 (1280 PCFSoft) : bord lissé, mais encore un peu mou.
**Jade (nuit)** : même constat ; plaque lisible dès N3. Les grosses « taches » roses/rouges/orange pixelisées sur les bords sont des particules du jeu (au hasard d'un chargement à l'autre, les mêmes dans les doublons de relevé) : pas un défaut de niveau. N4 montre en plus un faisceau lumineux clair (pilier de lumière) au centre droit, absent des autres : c'est un décor propre au non-sobre (`mapsSobres()` faux), à juger.
**Debout** : la caisse est collée au bord gauche de l'image dans les 5 prises (même instant de course) ; la différence entre niveaux est la même que couché.

## DÉFAUTS / trouvailles à signaler
1. **N2 : l'ombre est le point le plus faible** (escalier de pixels, plus marqué qu'en N1 sur la planche des traînées). C'est le seul niveau où l'ombre gagne en taille (1024) sans passer au filtre doux : à juger sur le vrai 13 Pro (N2 = sa HAUTE). Piste (pas ici) : PCFSoft ou 1280 dès N2.
2. **Un trait sombre le long du ruban orange droit** (bord noir collé au ruban, côté intérieur) visible en N3 et un peu en N2/N4 sur le zoom traînées ; absent en N1 et témoin. Ressemble à un liseré de l'ombre de la caisse/du ruban ou à une marge de la masque du lot 3 (cœur net sur fond flou). Non confirmé : à regarder sur l'iPhone.
3. Aucune frange, aucun anneau de loupe, aucune traînée cassée vus aux 12 planches. À N4 (loupe retirée) et N3 (×1,5) le ruban reste franc. Les zones de la loupe n'ont pas été visualisées ici (lot 3 l'a fait).
4. **Ce n'est PAS exactement le même instant** : position de la caisse en fin de course différente de 3 à 6 unités selon l'essai (nuages : −176,6 / −180,0 / −179,9 / −176,7 / −173,2 ; Jade ≤ 4 aussi pour N3). Les pas sont fixes et la graine aussi, mais la boucle garde une dépendance à l'horloge réelle (cadence 30/60, rattrapage). Les marquages au sol (les lignes blanches) varient donc d'une planche à l'autre : ne pas les lire comme une différence de niveau. Le ciel, le décor, les débris sont identiques.
5. Aucune erreur console, aucune exception, aucune panne (`dbgErreurs`, hors la ligne `profil` du journal) sur les 20 prises (5 essais × 2 cartes × 2 formats). Aucune capture n'a échoué. Chaque essai logue une ligne `profil · classe c · RÉGLAGE → Nn` correcte.
6. Piège de banc (utile) : sans `meteo=`, nuages tire la météo au hasard à chaque chargement (matin/midi/soir/nuit) : les planches ne sont comparables qu'en pinçant `meteo`. `window.TEL_NATIF` n'est pas lisible depuis la console (portée du grand script) : on le déduit de `PRF.on`. La vitesse réelle n'a pas pu être relevée (le compteur n'est écrit que hors tactile et `loop` n'est pas global) : l'option `--vitesse` du banc renvoie « loop is not defined » (nitro tenu, ~500-600 km/h d'après le lot 3, non remesuré).

## NON vérifié
- Rien sur un vrai iPhone : le coût GPU/chaleur/fluidité de chaque niveau (le banc est un Chrome sans GPU qui ne mesure que des appels et des triangles). 60 i/s de N4 non testé en réel.
- 900 km/h, courbes serrées, chute, autres maps, jour de Jade.
- La couleur : mesurée à l'œil seulement.

## À juger sur le vrai iPhone 13 Pro
Ouvrir `photos/niveaux/couche-nuages-caisse.jpg` et `-trainees.jpg` puis comparer avec l'écran : (a) la plaque doit se lire à N3, pas à N1 ; (b) l'ombre de N2 (HAUTE du 13 Pro) : escalier visible ? ; (c) le trait sombre le long du ruban en N2/N3 ; (d) N3 (`CC_QS &classe=2` + HAUTE) tient-il la cadence ?

## Relancer
`sh ~/cash-car/verrou-banc.sh prendre x` puis `node outils/banc-qualite/niveaux.cjs --out <dossier> --carte nuages --meteo midi [--fmt debout]` (ou `sh outils/banc-qualite/passes.sh <dossier>` qui prend/rend le verrou à chaque passe), puis `sh outils/banc-qualite/planches.sh <dossier> passation/qualite/photos/niveaux`.
