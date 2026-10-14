# ÉTAT — LE ROYAUME DE FEU (session VOLCAN, 2026-10-14 ~19 h)

Demande de Sacha : une map volcanique « royaume des flammes / Mustafar » — lacs de lave, volcans, une route qui DESCEND le long du volcan,
des choses cool qui se passent, aucun gameplay bizarre (la lave tue), une ambiance et des couleurs très travaillées.

## Où
- Worktree `C:/Users/sacha/Documents/GitHub/CCG-volcan`, branche `volcan` (poussée sur origin/volcan), fusionnée avec origin/main.
- Code : bloc `<<<VOLCAN>>>`…`<<<FIN VOLCAN>>>` de `VERSION PRINCIPALE/index.html` (juste après la forêt) ; ambiances `BIOMES.volcan*`
  (après celles de la forêt) ; `SF_CARTES.volcan` ; sons : bloc `<<<VOLCAN>>>` de `atelier-son/recettes.js` (cuits, `sons-banque.js?v=19`) ;
  journal : section « LE ROYAUME DE FEU — LA MAP DU VOLCAN » en haut de `JOURNAL.md` ; index du guide (§3 et §8).
- Sources de travail (scratchpad de la session e853f501) : `v1.js`…`v4.js` (le bloc), `biomes.js`, `carte.js`, `branche.py <index.html>`
  (idempotent : remplace le bloc et les ambiances, branche le reste une fois) ; `carte.cjs <graine>` = vue de dessus + profil SANS GPU
  (Node) ; `vbanc.cjs <racine> soir,nuit,… 844 390` = captures en course + photos (file équitable du banc, patience 100 min).
  Si le scratchpad est perdu : éditer directement le bloc dans index.html.

## Fait
- Route `genVolcan` (flanc du grand volcan sur 130-170° en descente, S, plaine des lacs, arche, fin au pied du second volcan, 3 plongeons),
  relief `volcanSol` (bruit fractal `vlcB`, lacs = sol sous `yl`, cônes coupés par le couloir), lave animée, coulées, aiguilles d'obsidienne
  (collisions), arche, orgues, hornitos + geysers + fontaines dans les lacs, éruptions (fontaine, bombes décor, tremblement), panaches,
  plafond de cendre, braises/cendre, volcans du loin, 6 météos, sons, chauffe au menu, `dbgVolcan`.
- MESURÉ sans GPU (Node, 12 graines × échelles 1/2/3,2) : 6,8-10,2 km, sol ≥ 17 m sous le bord de la dalle, lave ≥ 52 m sous la route.
- MESURÉ au banc (1er passage, Chrome sans GPU) : 0 erreur, construction 225 ms (sol 172 ms), sol 147 k tri, lave 63 k tri.
- Raccord à la bible DA (bords néon rose, contre-jour rose, ciel froid / braise, vignette bleu nuit ; accent = orange lave).

## Reste
1. VOIR les rendus GPU (vbanc) : régler couleurs / densités si besoin (les valeurs sont dans `VLC_MET` et `BIOMES.volcan*`).
2. Fumée commune puis poussée au verrou (`cc-push.lock`) : merge origin/main, syntaxe, gardes, `sw.js` +1, push `volcan:main`, recopie.
3. Ensuite (si Sacha le veut) : la musique (Léo, `MUSIC_LIEU` commenté), le nom, la cadence des éruptions.
