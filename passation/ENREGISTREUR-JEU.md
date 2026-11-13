# L'ENREGISTREUR DE JEU — montrer à Claude comment on joue (2026-11-13)

Sacha : « Claude arrive mal à comprendre comment on joue au jeu. Crée un enregistreur de position sur la version mobile pour que, sans flux vidéo
ni flux d'images, Claude comprenne comment je joue. Je fais quelques parties, et après je lui fais un prompt à partir de ça pour la génération de maps. »

Pas d'image : des chiffres. Le code est `code/moteur/enregistreur-jeu.js` (il LIT l'état du jeu, il ne touche à rien ; éteint, il ne coûte rien).

## Sur le téléphone
1. Allumer, une fois (c'est gardé dans le téléphone) :
   - dans l'app ou sur le site : écran d'accueil → **RÉGLAGES** → 5 touchers rapides sur la petite ligne de version → **BOÎTE NOIRE** → **PARTIES** → **ALLUMER** ;
   - ou, dans Safari : https://car-cash-git.vercel.app/jouer/?jeurec=1
2. Jouer normalement. À chaque fin de partie, un petit « PARTIE ENREGISTRÉE · n » s'affiche. Les 8 dernières sont gardées.
3. Sortir les parties : même chemin → **PARTIES** →
   - **PARTAGER** : un fichier `cashcar-parties-….json` par la feuille de partage (AirDrop vers le Mac, Fichiers, Mail…) ;
   - **COPIER** : tout part dans le presse-papier (le presse-papier universel le colle sur le Mac : coller dans un fichier `.json`).
   - **EFFACER** (deux touchers) pour repartir de zéro.
   Téléphone branché au Mac : `dbgJeuRec('tout')` par le pont de l'inspecteur rend le même paquet.

## Sur le Mac (pour Claude)
```bash
node outils/jeu-rec/lire.mjs ~/Downloads/cashcar-parties-XXXX.json > parties.md
```
rend un récit par partie : bilan (sol / vol / figure, placement sur la largeur, usage du pouce, nitro, drift), **anticipation** (de combien de
secondes le braquage précède la courbure de la route), la liste des **vols** (d'où : bord, trou, saut ; durée, figures, où ça se pose),
la **route découpée en morceaux** (droite / virage / serré, pente, à l'envers, modules, trous) avec ce que le joueur y a fait, et une **frise**
(une ligne toutes les 2 s ; `--pas 4` pour moins, `--frise 0` sans, `--partie N` pour une seule).

`outils/jeu-rec/voir.html?f=<fichier.json>` (servi en http) dessine la route vue du ciel avec la trace (blanc sol, bleu vol, rose figure, rouge mort)
et la largeur de la route dans le temps (+ le stick). Claude peut en prendre une capture.

## Le format (`cashcar-jeurec-1`)
`{format, exporte, ver, parties:[…]}` ; une partie :
- `debut`, `ver`, `ecran {w,h,portrait,app,tel}`, `voiture`, `tuto` ;
- `routes[]` : une par piste (départ, puis chaque portail) — `carte, meteo, nm, L` (m), `rh` (demi-largeur, m), `pas` (m), `mods [[s0,s1,nom,climax]]`,
  `trous [[s0,s1]]`, `P [[x,y,z,cap°,pente°,dévers°,envers]]` un point tous les `pas` m ;
- `cols` + `ech` : 10 échantillons / s — `t` (s, pauses retirées), `r` (index de route), `m` (0 sol, 1 vol, 2 figure, 3 boom), `s` (abscisse le long
  de la route), `lat` (m, > 0 = à gauche), `h` (m au-dessus de la dalle), `kmh`, `vm` (multiplicateur d'avance : bonus VITESSE), `st` / `sv` (le stick du
  pouce, −1..1), `doigt` (posé), `steer` (le braquage lissé, > 0 = à gauche), `nit`, `drift`, `dessous` (roule sous la dalle), `x y z` (monde) ;
- `ev` : `[t, genre, …]` — `decol` (bord|trou|saut, s, lat, kmh) · `pose` (s, lat, kmh, durée du vol, h max, figures) · `fig` (id) · `figure_payee` (n) ·
  `piece` (n, s, lat) · `bump` (s, lat) · `route` (index, carte) · `pause` / `reprise` · `mort` (cause, s, lat, mode) ;
- `fin` : `t, cause, argent, pieces, figures, bumps, zones, vmax`.

## Le prompt type, après quelques parties
> Voici N parties que j'ai jouées sur téléphone (récit de `outils/jeu-rec/lire.mjs` ci-joint, fichier brut dans …). Lis d'abord comment je joue :
> où je me place sur la route, quand je décolle et pourquoi, ce que je fais en l'air, ce qui me tue, où je m'ennuie (longues droites sans
> geste), où je n'ai pas le temps de réagir (anticipation). Ensuite, propose une génération de routes pour la map X qui colle à cette façon
> de jouer : …
