# Preuves finales : Crypto City de jour et mode ordinateur (21/11, vérificateur ville-cyber-p2)

Branche `claude/ville-cyberpunk-063e59`, HEAD 962194182. Jeu servi : l'index.html du worktree, assemblé (`--verifier` : d'accord avec les 350 morceaux).
Banc : Chrome sans fenêtre, muet (`--mute-audio`, sfx/mus/vox coupés), sous le verrou (3 prises de 2 à 5 min, toutes rendues). Pilote automatique sans nitro (`dbgAuto(1,0,{nit:0})`).
Je n'ai modifié aucun fichier du dépôt. J'ai seulement écrit ce rapport et 5 planches.

## En bref
- **Le jour (téléphone) est propre.** Je l'ai vérifié sur 9 photos de jour : pas de décor de nuit noir, pas de trou, la route et la voiture se lisent. Aucune erreur de console. Le coût est le même que la nuit.
- **Le décor du lot F ne s'applique pas au jour.** Je l'ai prouvé en isolant l'interrupteur (voir le point 3). Rien ne casse.
- **L'ordinateur est propre.** Je l'ai vérifié sur 16 photos avec 2 graines. Il n'y a aucune erreur de console, le flou V2 est en place et les tours restent nettes à vitesse normale.
- **DÉFAUT trouvé : `?sans=villedecor` éteint DEUX choses, pas une.** Il éteint le décor du lot F et aussi le décor tiré au hasard du 23/10 (`VILLE_DECOR`, ville-v3.js : enseignes, réclames, palette, béton, géantes).
  Il ne rend donc pas « l'avant au bit près ». Les mesures « lot F contre `?sans=villedecor` » (celles du contrôle rejugé comme les miennes) comparent le lot F à une ville privée en plus de son décor du 23/10.

## (a) Crypto City de jour, route à étages, téléphone (`?tel=1`, 844×390, dpr 2, graine 4119)
URL : `&carte=ville&meteo=matin|midi|soir` ; la nuit : `&meteo=orage&teinte=violet`. Le ciel a été vérifié dans `dbgClassique().niveau` : cjMatin, cjMidi, cjSoir et villeOrage.
Planche : `planches/final-jour-g4119-844x390.jpg` (colonnes matin, midi, soir, nuit ; 3 photos chacune, à s ≈ 129, 570, 1170).

| | appels / image | triangles / image | programmes | erreurs |
|---|---|---|---|---|
| matin | 118 · 137 · 128 (moy. 128) | 267 · 331 · 346 k | 154 | 0 |
| midi | 110 · 128 · 123 (moy. 120) | 268 · 334 · 359 k | 154 | 0 |
| soir | 110 · 129 · 120 (moy. 120) | 267 · 330 · 346 k | 154 | 0 |
| nuit (même graine) | 105 · 123 · 114 | 276 · 337 · 351 k | 154 | 0 |

- **Coût du jour égal à celui de la nuit**, à ±5 % près en appels et à ±3 % en triangles, avec le même nombre de programmes (154). Il y a une réserve : sur les photos 1 et 3 de la nuit, l'audit a vu 2 rendus de la caméra au lieu d'un. La photo 2 est la seule comparable au rendu près, et elle donne midi 128 appels / 334 k contre nuit 123 / 337 k.
- **Image :** ciel de l'heure, tours à fenêtres, aucune tache noire, route lisible, voiture lisible sur les 9 photos. On ne voit ni trou ni décor de nuit.
- **Mineur 1 :** à midi, la route devient très claire, presque blanche sur la photo 2. La voiture reste lisible.
- **Mineur 2 :** le matin et le soir se ressemblent beaucoup. C'est un défaut déjà connu du lot J.
- **Mineur 3, sur toutes les cartes y compris la nuit :** à pleine vitesse (uSpeed 0,73 à 0,79, photo 2), le flou radial étire fort les tours sur les bords au téléphone. La netteté du haut de l'image y baisse de 35 à 41 % par rapport à l'image nette. À vitesse normale (0,20), elle ne baisse pas. C'est le flou voulu (une zone nette autour de la caisse), mais il est fort.

### Le décor du lot F ne s'applique pas au jour : preuve
1. Dans le vrai jeu, midi contre midi avec `&sans=villedecor` : les tours diffèrent (`toursV7fnge` 14496 contre 11148, `toursVerreNeon2` 1992 contre 5444). À première vue, on dirait donc que le lot F touche le jour.
2. La cause est ailleurs : la même regex `sans=villedecor` éteint aussi `VILLE_DECOR` (ville-v3.js l.388, le 23/10). `dbgVilleDeco().deco` vaut `null` avec `?sans=villedecor` et est rempli sans.
3. **Isolation :** j'ai fait une copie hors dépôt (scratchpad) où seule la regex de ville-v3.js est renommée (`villedecor23`). Dans cette copie, `sans=villedecor` n'éteint plus que le lot F. Résultats :
   - **midi contre midi sans lot F : tours, verre et néons identiques au triangle près.** Seules diffèrent 3 clés qui dépendent du temps (étincelles, route). Le lot F ne s'applique donc pas au jour (`veDecor3` exclut bien `cj`).
   - nuit contre nuit sans lot F : tours 18204 contre 14496 triangles (+26 %), verre 3032 contre 1992, néons 7236 contre 5772. Le lot F agit donc bien la nuit.
   - Le coût du jour ne bouge pas : 121 appels / 319 k avec le lot F, 123 / 313 k sans, et aucune erreur.
   Planche : `planches/final-jour-g4119-interrupteur.jpg`. Colonnes : nuit du jeu, nuit sans le lot F seul (copie), nuit `sans=villedecor` réel, midi (copie).
   Planche `planches/final-jour-g4119-midi-decor.jpg` : midi, midi `sans=villedecor` réel, midi net, nuit nette.

## (b) Mode ordinateur (sans `tel=1`, `&pc=1&poste=max`, 1440×810, dpr 1, nuit `orage` violet)
Planches : `planches/final-pc-g4119-1440x810.jpg` et `planches/final-pc-g4103-1440x810.jpg`. Colonnes : jeu, `sans=villedecor`, jeu net. 4 photos à s ≈ 130, 570, 1110, 1590.

| graine | | appels (bruts, 4 rendus caméra par audit) | triangles | programmes | erreurs |
|---|---|---|---|---|---|
| 4119 | jeu | moy. 264 (252 · 300 · 274 · 228) | moy. 918 k | 167 | 0 |
| 4119 | `sans=villedecor` | moy. 255 | moy. 894 k | 167 | 0 |
| 4103 | jeu | moy. 270 | moy. 1018 k | 167 | 0 |
| 4103 | `sans=villedecor` | moy. 270 | moy. 1041 k | 166 | 0 |

- **Coût du jeu contre `sans=villedecor` :** appels de 0 à +3,5 %, triangles de −2 à +3 %. Ces écarts incluent la perte du décor du 23/10 (voir le défaut plus haut).
- **Chaîne d'image :** palier 2, dpr 1, post, flou radial, fxaa et halo à 5 étages.
- **Flou de vitesse :** le flou V2 est en place (`uFv` présent dans le shader, `dbgFlou` à v:true). À vitesse 0,20, les tours sont nettes : le haut de l'image est aussi net que l'image nette (16,3 contre 14,7 ; 17,9 contre 17,0). Il n'y a pas de traînées roses.
  À pleine vitesse (0,78) : graine 4119, −3 % de netteté ; graine 4103, −30 % (tours du haut gauche étirées, lisibles).
- **Image :** pluie, néons, tours à fenêtres, route lisible, voiture lisible. La route à étages et la boucle apparaissent sans trou.
- **À identifier :** graine 4119, photo 4 (s 1592), un grand bloc sombre aux voxels bruns et jaunes occupe le quart droit, tout près de la caméra. Il a disparu deux images plus tard sur la photo nette. Ce n'est pas dans la route. C'est sans doute un véhicule ou un objet qui passe contre la caméra. Je ne l'ai pas identifié et je l'ai vu une seule fois sur 16 photos.

## Ce que je n'ai PAS vérifié
- Le vrai iPhone et le vrai PC de Sacha : tout ici vient de Chrome sans fenêtre sur le Mac (Metal).
- Le nitro, les sauts et le vol : j'ai roulé sans nitro, donc `NET_NITRO2` n'a jamais été posé (`uRn2` absent dans les 4 cas).
- Le jour sur plus d'une graine : seule la 4119 est passée. Je n'ai pas fait le jour en 390×844, ni le jour sur l'ordinateur.
- Les paliers 10 et 20, et le régime du poste en ALLÉGÉ / LÉGER.
- Les temps par image : j'ai jugé en comptes seulement, avec un Mac partagé.
- L'origine exacte du bloc sombre (PC, 4119, photo 4).
- Le nombre de rendus de la caméra par image : il varie selon la nuit, l'ordinateur et la charge (1 à 4 par audit). J'ai comparé les variantes entre elles à nombre de rendus égal, et les chiffres bruts sont donnés tels quels.

## Note
Dans HEAD, l'`index.html` commité n'a ni le lot J, ni le lot F, ni le flou réparé (`veDecor3`, `BIOMES.cjMidi` et le motif `uSfx` absents). Sur cette branche, c'est voulu (journal, ligne 7 : on réassemble à la fusion). Il faudra seulement ne pas l'oublier au moment de la livraison.
Bancs et données brutes (hors dépôt) : `/private/tmp/claude-501/-Users-sachaberes-cash-car-game--claude-worktrees-ville-cyberpunk-063e59/db932f92-249d-47a9-bdd7-39eb28977a7e/scratchpad/p2/` (passe.sh, iso.sh, page-p2.cjs, planche.py, chrome/*/r-*.json).
