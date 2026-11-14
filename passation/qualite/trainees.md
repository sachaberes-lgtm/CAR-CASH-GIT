# LOT 3 — LES TRAÎNÉES DE LUMIÈRE NETTES (14/11, branche `qa/trainees`, worktree `~/cash-car/qualite-trainees`)

Sacha : « les traînées de lumière sont mal foutues, elles sont assez floues ». But : des rubans de feux (`SILS`) au cœur NET (un trait franc à bord
tenu) dans un halo doux qui reste, sans coût de fluidité, sur le téléphone PROFILÉ seulement (`PRF.on`) — l'ordinateur et tout appareil hors profil
ne changent pas d'un pixel.

## Qui l'allume
`rnProfil()` (`code/rendu/rubans-nets.js:15`) : `typeof PRF!=='undefined' && PRF.on` (le lot 1 n'était pas fusionné : codé contre l'API figée,
sous `try`, faux si PRF n'existe pas). `?rubans=1` force tout (banc), `?rubans=0` coupe tout. Interrupteurs : `?sans=rubannet` (A),
`?sans=rubanlarg` (B), `?sans=netnitro2` (C), `?sans=loupelong` (D). Crochet : `dbgRubans()` (état, chiffres) ; `dbgRubans({net,larg,masque,long,kC,minTx})`
bascule à chaud ; banc : `{garde:1}` + `{refait:1}` redessine les rubans sans avancer la partie, `{sonde:1|2}` lit l'alpha de la cible de la scène.

## Ce qui est fait (fichier:ligne)
- **Nouveau morceau** `code/rendu/rubans-nets.js`, inscrit dans `code/ORDRE.txt:162` juste après `voitures/atchoum-feu.js` (donc après `maps/orbite-2.js`
  où SIL / SIL_TEX / mkSillage sont définis — `code/maps/*` n'est PAS touché : on surcharge `SILS[i].m/.mi.material` depuis ce morceau).
- **(A) `rubannet` — le profil** : `rnTex` (`rubans-nets.js:24`) fabrique une **DataTexture** 256×2 (la toile 2D prémultiplie : un alpha nul y effaçait la
  couleur — piège rencontré au banc, le halo disparaissait). Moitié halo : la même gaussienne qu'avant (plus finement échantillonnée). Moitié cœur :
  rangée 0 = plateau plein jusqu'à 20 % de la demi-bande, bord raide jusqu'à 36 % ; rangée 1 = même mi-hauteur, bord doux 10 %→50 % ; + jupe 0,22·exp(−5u²).
  `silRuban` (`voitures/atchoum-feu.js:197`) choisit par rangée du ruban entre les deux (uv.y) pour que le bord tienne `RNET.bordT` = 1,5 texel de la
  scène (sans ça : marches d'escalier sur les bords loin / en biais, vues au banc). Le cœur à plateau perd ~22 % d'énergie à crête égale :
  `RNET.kC` = 1,15 (`atchoum-feu.js:152`, appliqué l.196). Les mélanges : `rnMelange` / `rnPose` (`rubans-nets.js:34-45`) — la couleur garde son additif
  EXACT (One/One : la texture porte un alpha, l'additif de three l'aurait multiplié) ; `silEncre` (`atchoum-feu.js:149`) remet ce mélange en sortant de
  l'encre de la boutique. Même géométrie, même matière, aucun programme compilé (vérifié : liste des programmes identique, voir plus bas).
- **(B) `rubanlarg` — le plancher** (`atchoum-feu.js:195`) : la bande du cœur jamais sous `RNET.minTx` = 4,4 texels de la scène (taille d'un texel :
  `rnTexel`, `rubans-nets.js:46`, fov vertical + hauteur de la cible du compositeur) ; l'éclat rendu à proportion (même énergie).
- **(C) `netnitro2` — le cœur hors du flou radial** (`rendu/triptyque-bloom.js:264-277`, ajouté APRÈS le bloc NET_NITRO, rien d'autre du fichier n'est
  touché) : le cœur du ruban rend l'alpha de la cible demi-flottante de la scène NÉGATIF (équation alpha `ReverseSubtract`, `opacity` 20 qui ne touche que
  l'alpha de MeshBasic) — c'est le seul objet de la scène qui puisse le faire, donc aucun faux positif. Dans la branche du flou de NET_NITRO, une lecture
  de plus (`texelFetch` du pixel) : si alpha < 0 et pixel net plus clair que le flou, le pixel net remplace le flou. Uniforme `uRn2` (bascule à chaud).
- **(D) `loupelong` — la loupe le long des rubans** (`rendu/loupe-caisse.js:45-77`) : en plus du disque, jusqu'à 4 capsules d'écran (2 rubans × 2
  segments, coude à 5 m, fin à 18 m de ruban, coupées à 1,4 m devant l'objectif), rayon = demi-bande du cœur à l'écran × 1,5 + 3 px, rectangle englobant
  `uSB` pour épargner le reste de l'écran (shader l.116). Le compte de pixels reconstruits est calculé à chaque image (`dbgLoupe().pxRubans`).
- **LA LOUPE SUIT LA RÉSOLUTION** (`loupe-caisse.js:78-80`, appel l.140) : `kq` = toile / cible de la scène mesuré à chaque image ; sous ×1,12 la loupe se
  retire proprement (toile à la taille de la scène), retour au-dessus de ×1,2 (hystérésis). Hors profil (DPR ≤ 1,35) kq ≥ 2,2 : rien ne change.
- Bancs : `outils/banc-rubans-nets/rubans.cjs` (photos même image étape par étape + chiffres), `planches.sh`, `controle.cjs` (ordi / tél sans profil /
  profil + DPR). Planches : `passation/qualite/photos/trainees/`.

## VÉRIFIÉ (et comment)
Banc Chrome sans fenêtre, iPhone 13 Pro émulé (844×390 et 390×844, DPR 3, tactile, `?tel=1&rubans=1`), boucle menée à la main (dbgStep 33 ms), muet,
verrou du Mac pris/rendu à chaque passage. MÊME IMAGE redessinée pour chaque étape (avant · A · A+B · A+B+C · A+B+C+D).
- **Photos AVANT/APRÈS** : `r-<fmt>-<carte>-v<vitesse>-zoom.jpg` (5 étapes, caisse et rubans, pixels d'écran), `-jeu.jpg` (image entière avant / après /
  zones de la loupe), `pixels-couche-nuages-v150.jpg` et `-v450.jpg` (zoom ×2,4 au pixel près), `zones-loupe-couche-nuages-v450.png` (capsules en magenta).
  Nuages (midi) couché, Jade couché et debout ; à 150, ~470-500 et ~570-590 km/h. Lecture : A rend le cœur nettement plus serré et défini à toute vitesse ;
  au nitro, C rend un bord franc au cœur là où il était étalé par le flou, LE HALO RESTE (la lueur floutée autour) ; D donne le bord au pixel d'écran le
  long des premiers mètres. Couleur et intensité perçues : identiques à l'œil sur les planches (même rouge des feux, même orange du nitro).
- **Le masque n'attrape que les rubans** (sonde de l'alpha, 9 prises) : 1 280 à 7 700 pixels négatifs avec les rubans, **0** sans eux (rubans masqués).
- **Coût de D** (pixels reconstruits en plus, toile 2532×1170 ou 1170×2532) : couché 18 000-43 000 px (le disque : 217 000-505 000) ; debout
  104 000-138 000 px (disque : 300 000-818 000). Soit +4 à +35 % de pixels reconstruits selon la vue, ≤ 4,7 % de l'écran.
- **Rien de compilé, rien de dessiné en plus** : même liste de programmes WebGL avec et sans profil (`controle.cjs`, taille de la liste 2801 = 2801) ;
  aucun appel de dessin ajouté ; aucune allocation par image hors banc (vecteurs/tableaux pré-alloués ; `rnGarde` n'alloue qu'avec `RNET.garde`, banc).
- **Hors profil rien ne bouge** (`controle.cjs`) : ORDINATEUR → profil faux, aucune texture posée (rubans 128/Additive/opacité 1), pas de `netnitro2`, pas de
  loupe ; TÉLÉPHONE SANS PRF → idem, la loupe d'avant (disque seul, `segRubans` 0). Par construction : `rnPose` ne fait rien, `kw9` = 1, `UV9` nul, la
  passe finale n'est pas réécrite. ⚠ Pas de comparaison au pixel près entre deux chargements (le jeu tire au hasard) : c'est vérifié par l'état, pas par l'image.
- **La loupe suit la résolution** (`controle.cjs`, dbgDPR) : DPR 1,25 → kq 2,4 (posée) · 2,0 → 1,5 (posée) · 2,5 → 1,2 (posée) · 2,9 → 1,03 (retirée,
  toile à la taille de la scène) · 3,0 → 1,0 (retirée) · 1,25 → revenue. Aucune exception.
- Syntaxe du grand script (`node --check`), `garde-texte-nu`, `garde-allege.sh` : OK. Aucune exception ni panne au banc.

## NON VÉRIFIÉ
- **900 km/h** : le banc plafonne vers 570-700 km/h (la caisse 0 sous nitro tenue ; la Comète n'a pas de rubans de feux). Les prises « v570 » sont le plus vite atteint.
- **(B) le plancher n'a jamais joué au banc** : en ligne droite le cœur visible garde ≥ 10 texels de bande (`bandeMin` 10-17) — les parties lointaines du
  ruban ne sont à l'écran qu'en virage serré, en vol, en vrille. Code vérifié par les chiffres (`dbgRubans().stats`), pas par une photo.
- **Une vraie nuit** : `?meteo=nuit` sur Jade donne `LUM.nuit` 0,13 seulement (le voile d'encre de jour reste actif) ; pas de photo de nuit noire.
- **L'aperçu du garage (`silApercu`) et la boutique (encre)** : même `silRuban`, même `rnPose` (garanti par le code) — pas photographiés.
- Les photos d'une même prise ne diffèrent pas QUE par les rubans : le feu de pixels (NFEU) et la lueur de bord du nitro bougent d'un redessin à l'autre.
- Le temps GPU (le Mac émule) ; l'effet de `kC` 1,15 sur le halo (bloom) au nitro jugé à l'œil seulement.

## À JUGER SUR LE VRAI iPhone 13 Pro (N1)
1. Les rubans au roulage (rouge des feux) et au nitro : le cœur doit être un trait franc, le halo toujours là ; `?sans=rubannet,rubanlarg,netnitro2,loupelong` = avant.
2. L'intensité : si le cœur paraît plus faible/fort, `dbgRubans({kC:1.25})` ; un bord trop dur/trop doux : `RNET.bordT` (1,5).
3. Au nitro, le cœur net dans l'image filée : naturel, ou « collé » ? (`dbgRubans({masque:0})` pour comparer).
4. Le coût : `dbgLoupe().pxRubans` en course ; chaleur sur 5 min (la loupe s'éteint déjà seule à chaud).
5. Un virage serré / une vrille en vol : la queue lointaine sans grésillement (B).

## Les traînées POP de la boutique (`rendu/trainees-1.js`, `-2.js` — lecture seule)
Même défaut, autrement : planche canvas 8×8 cases de 128 px avec mipmaps trilinéaires sans anisotropie (`trainees-1.js:143`) → petites à l'écran elles
lisent des mips mous ; dessins doux par nature (gaussiennes, `shadowBlur` 6-18 px, l.64, 130-131) ; et elles subissent le flou radial du nitro comme les
rubans d'avant. Il faudrait : (1) anisotropie 4 et un biais de mip (−0,5 à −0,75, `texture2D(uMap,uv,-0.75)` dans `TRX_FS`) ; (2) des dessins à cœur
plein et bord net (shadowBlur réduit, le halo en couche séparée) ; (3) les sortir du flou comme C : leur matière additive écrirait alpha −k
(même `ReverseSubtract` sur l'alpha, la clé de programme ne change pas) — le masque de la passe finale les servirait sans rien de plus.

## Questions ouvertes
- Le profil `PRF` du lot 1 : `rnProfil` est lu UNE fois au chargement (le masque est dans le programme de la passe finale). Si `PRF.on` peut changer à
  chaud, le dire : A/B/D se rebranchent à chaud par `dbgRubans`, C non.
- ⚠ Masquage de noms : `code/voitures/caid.js:248` déclare un `const PRF` LOCAL (le relief du flanc) : sans effet ici (rubans-nets lit la portée du grand
  script), mais à garder en tête pour le lot 1.
- Faut-il que A (le profil seul, gratuit) vaille aussi pour l'ordinateur ? La règle du chantier dit non ; c'est un choix de DA à poser à Sacha.
