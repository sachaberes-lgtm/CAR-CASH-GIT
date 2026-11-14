# MAPS PRO — CANYON : les textures (2026-11-14) — passation du diagnostic

Branche `pro/canyon-2026-11-14` (partie d'origin/main v1589). Demande de Sacha : « canyon est très buggé dans les textures ».
Cette étape est le DIAGNOSTIC : **le jeu n'est pas modifié** (seuls `outils/banc-routes/canyon-textures*.{cjs,js}`, `canyon-planche.cjs` et ce dossier sont ajoutés).
Photos de preuve : `passation/maps-pro-canyon/` (les `cy-*-g7*.json` sont les mesures « avant »).

## Les bancs (ports réservés : serveur 8310-8319, CDP 9510-9519, profil « pro-canyon »)
```
node outils/banc-maps/serveur.cjs 8310 <worktree>
# photos EN ROULANT (pilote auto, une photo toutes les 3,5 s) — météos valides : matin, soir, nuit, pluie, orage (PAS « midi » : tirage au hasard)
node outils/banc-maps/banc.cjs gen --carte=canyon --meteo=soir --graines=5,11 --port=8310 --cdp=9511 --profil=pro-canyon --roule=55 --photos=1 --photoms=3500 --out=<d> [--tel=1]
# vues fixes (l'œil du joueur, en pause), variantes de diagnostic, mesures
node outils/banc-routes/canyon-textures.cjs --meteo=soir --graine=7 --s=1260,2580 --variantes=rc,col,lit,rk,veg,N,terrain,decor,sansardoise,sansfilons,sanscases --cdp=9512 --profil=pro-canyon-b --out=<d>
# LA RÉFÉRENCE « avant/après » (12 vues, graine 7 : la même route sous toutes les météos)
node outils/banc-routes/canyon-textures.cjs --meteo=<m> --graine=7 --s=700,1260,2076,2580,3150,3500,4414,7454,8800,9300,9510,10200 --mesure=1 --cout=1 [--tel=1] --out=<d>
node outils/banc-routes/canyon-planche.cjs --out=planche.png --cols=4 --larg=2000 [--filtre=txt] <dossier|fichiers>
```
`canyon-textures.cjs` ne touche pas au jeu : il passe par `dbgScene()` et retouche à chaud une COPIE du fragment shader de la roche (vues `rc`, `col`, `lit`, `rk`, `veg`…,
retraits `sansardoise`, `sansfilons`, `sansphares`, `sanscases`…). `--mesure=1` : sur les pixels de roche (masque rendu à part), part de noir (luma < 10 / < 20 sur 255),
de fluo, luma moyenne, fourmillement (écart moyen par pixel quand l'œil avance de 0,5 m). `--jsfile=outils/banc-routes/canyon-textures-sonde-arbres.js` : matières, attributs, uniformes.
Pièges : deux Chrome ne partagent pas un profil (un `--profil` par banc lancé en parallèle) ; `--meteo=midi` n'existe pas pour le canyon.

## Les mesures « avant » (graine 7, 12 vues fixes, 1280×800 ordi `poste=max` ; téléphone 390×844 ×2)
| météo | noir < 10 (moy / pire vue) | noir < 20 | luma moy | fourmillement | triangles | appels | image figée (médiane, bruitée) | détail |
|---|---|---|---|---|---|---|---|---|
| matin ordi | 0,6 % / 3,0 % | 2,8 % | 85 | 3,95 | 737 000 | 125 | 6,4 ms | 2 |
| soir ordi | 7,7 % / 20,5 % | 12,4 % | 43 | 4,02 | 757 000 | 127 | 6,6 ms | 2 |
| nuit ordi | 12,6 % / 25,1 % | 23,3 % | 31 | 3,38 | 691 000 | 120 | 6,9 ms | 2 |
| pluie ordi | 3,5 % / 22,6 % | 4,5 % | 73 | 4,29 | 649 000 | 122 | 7,2 ms | 2 |
| orage ordi | 14,9 % / 41,3 % | 26,7 % | 33 | 3,80 | 610 000 | 114 | 6,9 ms | 2 |
| soir tél | 7,0 % / 23,6 % | 11,0 % | 51 | 3,76 | 352 000 | 86 | 4,1 ms | 1 |
| nuit tél | 10,8 % / 27,2 % | 20,1 % | 38 | 6,32 | 343 000 | 84 | 3,7 ms | 1 |
(« fluo » : 5,2 % le matin, ≤ 0,2 % ailleurs.) Construction relevée par `cc:construction` pendant les courses : 645-1190 ms ordi, 1000-3300 ms tél — machine chargée, NON fiable.
Route (Node, `canyon-charte.cjs graines=1-12`) : p0 R1 max 7,26 s, R3 juge max 66, envers min 6,4 % ; p10 7,32 / 70 / 7,1 % ; p20 8,25 / 71 / 7,0 % — à retrouver identique (les textures ne touchent pas la route).
Erreurs : aucune (`__cyErr` nul, console vide, « erreurs 0 » sur 12 courses). Aucun NaN (normales, couleurs) dans les géométries du décor.

## Les constats (preuve → cause)
1. **BANDES NOIRES à frange rouge sur les parois** (soir, nuit, pluie, orage ; ordi et téléphone). `avant-bande-noire-soir-s1260.png` ; la vue `rc` (`avant-bande-noire-albedo-s1260.png`)
   montre que la bande est un LIT MINCE rouge pur. Cause : `canyon-relief.js` l. 93 `rc=st.rgb*st.rgb` puis saturation ×1,32 : les lits brique [166,82,62] et lie-de-vin [164,96,90]
   (`cyStratesDonnees`, `canyon-route.js`) deviennent (0,49 ; 0,07 ; 0,02) — presque plus de vert ni de bleu. À l'ombre la lumière est bleue (soir : uSky 0,26/0,30/0,47, uSunC 0,50/0,21/0,08
   absent car lit = 0) : rouge × bleu = noir ; le plancher `col*vec3(.36,.26,.25)` est lui aussi multiplié par l'albédo, et l'ardoise V3 (`CY_V3SH`, l. 112) retire encore le rouge.
2. **ARBRES NOIRS** (silhouettes noires, jamais vertes à l'ombre). `avant-arbres-noirs-barres-s2580.png`. Sonde : couleur de sommet 0,09-0,50 (palette `sombre` de `CY_ARB`, canyon-mine.js l. 211),
   `CY_AFS` (canyon-relief.js l. 291) la met au carré (0,05/0,16/0,02) et n'a AUCUN plancher : × la lumière d'ombre ≈ 1-3 %. Le programme est sain (USE_COLOR, normales correctes).
   Le commit qui les éloignait de la route (« se lisaient comme des taches noires ») traitait le symptôme.
3. **TACHES NOIRES EN DAMIER au fond de la gorge** : la ripisylve (`col=mix(col,mix(vec3(.05,.10,.03),vec3(.16,.24,.06)…`, l. 101), même mal que 2, découpée en cases par la lecture au centre des gros pixels.
   `avant-fond-ripisylve-eau-s3150.png` (vue `veg` : rouge = ripisylve, vert = eau).
4. **L'EAU en nappe bleue moirée** sur le fond vu de la route couchée (même photo) : rayures de moiré dans la nappe ; cause non isolée (lecture `texture2D(uNZ, vW.xz/16.)` sans le niveau de la case, à vérifier).
5. **LES FILONS D'OR se lisent comme de la lave / des éclairs** (soir, nuit, orage : `passation/maps-pro-canyon` s1260, planche d'orage dans le rapport). Cause l. 113 : terme ADDITIF, sans brume ni nuit
   (`.30+.70*lit`), tracé sur une ligne de niveau de `n1` lue par case (zigzags en blocs), d'autant plus visible que la roche autour est noire (constat 1).
6. **LE TUNNEL DE LA PHRASE (tube facetté) ignore la lumière** : bouche crème et jaune en plein jour… la NUIT et sous l'ORAGE (pixels identiques). `avant-tube-nuit-planche.png`.
   Cause : `cyVouMat` = `MeshBasicMaterial` couleurs de sommet (canyon-voute.js l. 12) ; `teinte()` (l. 27) prend l'octet sRGB des strates SANS le carré du relief, « dehors au soleil » cuit (0,70-1,0),
   aucune météo (le tunnel d'arrivée a `T2_JOUR`, pas celui-ci).
7. **L'INTÉRIEUR DU TUBE en damier** brun/noir/kaki (`avant-tube-dedans-s10200.png`) : facettes de ~9 m, ±15 % de hasard × bande 0,78 × couleur de strate par case : se lit comme une texture manquante.
8. **Traînées étirées sur les murs à rider** (vues `rk`, `lit` de s3150) : `rk`, `lit`, `dk`, `veg`, eau sont des varyings PAR SOMMET (CY_VS l. 67) ; sur un plan à 85° une case de 12 m couvre ~137 m de haut.
9. **Fissures (ciel à travers la paroi) et crêtes en dents de scie** : `avant-tel-fissures-s3637.png` (téléphone, R0 = 85 m), s3150/s3500 à l'ordi. C'est la GÉOMÉTRIE (CDLOD) : l'autre session
   (`canyon-murs-2026-11-13`, worktree wt-cy, non commité) a un correctif `CY_LODF` (`?sans=cylod`) dans canyon-relief.js — à intégrer, pas à refaire.
10. **Nuit : les phares peignent la paroi en orange fluo** (planche de nuit du rapport) : `hlMonde` × 2,4 sur un albédo orange. Voulu (Léo, 10/11), mais contraste brutal avec la roche noire : à arbitrer.
Non vérifié : le pré-bâti du vrai jeu (`prebati=0` au banc), le popping en mouvement (le « fourmillement » est mesuré, pas attribué : la variante `sanscases` n'a pas été chiffrée), les mipmaps, paliers 10/20 en image.

## Plan de correction (dans l'ordre ; chaque point derrière `?sans=cytex` — ou un nom par point — pour comparer)
1. Roche : plancher d'albédo après la saturation (ramener vers la luminance quand un canal s'effondre : p. ex. `rc=max(rc,vec3(L)*.45)`), et plancher d'ombre NEUTRE (`max(c, vec3(L(col))*k*uSky…)` au lieu de `col*…`).
   Cible : noir < 10 ≤ 2 % le soir et sous la pluie, ≤ 6 % la nuit et l'orage, luma du matin inchangée (±2).
2. Arbres et ripisylve : même plancher dans `CY_AFS` (ciel + rebond, jamais sous ~6 % de luma), verts de la ripisylve remontés ; contrôler `avant-arbres-noirs…` et s3150.
3. Filons : × lumière du jour (`uSunC`), fondus dans la brume, plus fins ; coupés la nuit et sous l'orage (ou gardés seulement au niveau 2 de jour).
4. Tube : albédo au carré comme le relief + un facteur de lumière par météo (soit `M9.b`, la matière de la roche déjà utilisée par les bouchons ; soit `material.color` mis à jour dans `canyonTick`
   depuis hemi/soleil — zéro programme en plus) ; contraste des facettes réduit (±7 %, bande 0,9). Photos nuit/orage/matin de s10150-10900 (graine 11).
5. Eau : couper `wat` sur les pentes et lire les bruits de l'eau au niveau de la case ; recontrôler s3150.
6. Intégrer `CY_LODF` de wt-cy avec son auteur (fissures) ; les traînées par sommet (8) en dépendent (densité du maillage des murs) — à traiter ensuite seulement si elles restent visibles.
7. Phares sur la roche la nuit : décision de Sacha/Léo.
8. Après chaque point : la référence (5 météos + `--tel=1`), `canyon-charte.cjs` (route identique), `banc-graphismes` pour le coût (alterner avec wt-avant), autres maps intactes (seuls des fichiers `canyon-*` sont touchés).
