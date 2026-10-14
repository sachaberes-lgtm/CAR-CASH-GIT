# ÉTAT — LA BANQUISE (session MONTAGNE, 2026-10-14 ~20 h)

Demande de Sacha : « une nouvelle map en mode banquise : la route dévale une montagne au-dessus du sol, d'immenses pics de glace partout ;
des traces dans la poudreuse en frôlant le sol, la mort si on va trop profond ; glisser de manière ultra stylée sur les lacs gelés et les pics
pas trop abrupts » · « absolument magnifique ».

## Où
- Worktree `C:/Users/sacha/Documents/GitHub/CCG-banquise`, branche `banquise`. Sur main depuis a8ffb18 (v399) ; la suite (tranches, DA) dans
  la poussée du soir. Code : bloc `<<<BANQUISE>>>`…`<<<FIN BANQUISE>>>` de `VERSION PRINCIPALE/index.html` (après la forêt) ; sons : bloc
  `<<<BANQUISE>>>` de `atelier-son/recettes.js` (`banq.*`, `sons-banque.js?v=19`) ; journal : section « LA BANQUISE » en haut de `JOURNAL.md`.
- Sources de travail (scratchpad de la session 13496b7c) : `banq-1..4.js` → `python banq-pose.py <index.html>` (remplace le bloc entre les
  balises ; les branchements ne sont posés qu'une fois). Si le scratchpad est perdu : éditer le bloc dans index.html directement.
- Bancs : `banq-node.cjs` (Node, sans navigateur : génération, sûreté sous la dalle, chutes simulées dans la poudreuse, sur la glace, vers
  les pics), `banq-temps.cjs` (temps de construction par phase), `banq-banc.cjs <meteo> <actions>` (navigateur via cc-banc/lib.cjs).

## Fait (vérifié)
- Route qui dévale (slalom géant, 3-4 cassures), neige sous la dalle (7 m d'air minimum), 8-13 lacs gelés, pics en 4 familles (glisse,
  séracs, aiguilles, géants), stalactites, six temps (BIOMES.banq*, BK_MET), aurores, neige, blizzard, poussière de diamant, six sons cuits.
- Physique : la poudreuse porte et tasse, trace + gerbe, mort au-delà de 2,4 m ; la glace se glisse (dérive, givre, rayures, tremplin), choc
  de face mortel ; la montagne ramène sous 70 km/h. Navigateur (2e banc) : 0 erreur JS sur les six temps, glisse d'un lac en jeu.
- Construction en tranches + grille v2 : Node 143 → 52-58 ms (ordinateur), 19-25 ms (palier ancien). Fumée commune OK (19 h 54).
- Raccord à la bible DA-CARCASH (proposition) : horizons pêche, brumes teintées, contre-jour rose.

## Reste
1. MESURER au navigateur le temps de construction après les tranches (mon dernier passage au banc a expiré dans la file) :
   `dbgBanq().ms`, `.tp`, `.file` — `?carte=banquise&meteo=midi`, JOUER.
2. REVOIR EN IMAGE la gerbe de poudreuse (deux rideaux sur les côtés) : elle remplissait l'écran avant le correctif.
3. Le BLIZZARD ressemble encore à la neige (même flocons, plus de vent) : des stries horizontales seraient mieux.
4. Les bords de route suivent `BORDS_V2` (ambre) de GRAPHISME — la bible demande du rose : à eux de trancher pour toutes les maps.
5. À trancher par Sacha : le nom, la musique (Léo, ligne `banquise:` de MUSIC_LIEU), le dosage de la poudreuse (`BK_PH`, `dbgBanq('phys',{prof:…})`).

## Réglages clés
`BK_PH` (prof, kN, flot, kT, vPl/lift, nyMin, vnMort/sinMax, rebond, frG, grip, rameneT/V) · `BK_MET` (lumière par météo) ·
`PAL.B.banq*` · `BK_TOUT` / `bkTranches` (la file) · `BK_DF` (le loin). Console : `dbgBanq()`, `dbgBanq('etat')`, `dbgBanq('poudre'|'glace'|'pic9',{h,v,pq})`,
`dbgBanq('pic'|'lac',{d,h})`, `dbgBanq('meteo','nuit')`, `dbgBanq('fini')`, `dbgBanq('ramene')`.
