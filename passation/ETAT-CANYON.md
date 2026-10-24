# ETAT-CANYON (14/10 nuit, branche `canyon2`, worktree Documents/GitHub/CCG-canyon) — détails : JOURNAL.md « LE CANYON v2 »
FAIT (inscrit au train) :
- Tracé v2 : 8 raccourcis en TROMBONE (sortie 94 m à côté de l'approche, 55-90 m plus bas, gain ~0,8-1,1 km), virages de course enchaînés,
  rayons ≥ rayonPalier()×1,08 (repli 40+0,3·v), règle d'or OK sur 5 graines × 2 paliers (banc processeur, marge mini 41-52 m).
- Couloir des Étroits : parois en bandes à 3,5 m des bords, on FROTTE (parisMur(dt,'paroi')), dures en vol.
- Tunnel d'arrivée (460 m) : façade + bouche néon rose, galerie à voûte au-dessus du portail, roche claire teintée de ses néons.
- Roche lisible : rais de lumière retirés, strates horizontales, vernis discret, grain fin, ombres violettes.
RESTE :
1. Banc GAMEPLAY `node C:/Users/sacha/cc-banc/raccourcis.cjs canyon <graine> --palier N` : attend `window.dbgTrace` sur main. Cible 0,6/km :
   le canyon a ~0,35/km (8 boucles sur ~22 km) — soit raccourcir la piste (~14 km), soit ajouter des boucles hors couloir.
2. Revoir les 6 météos avec la nouvelle roche (planche matin/midi/soir/nuit/pluie/orage) ; la nuit dans le tunnel.
3. Suivre `rayonPalier()`/`vPalier()` quand GAMEPLAY les pousse (le code les prend déjà s'ils existent).
Bancs (scratchpad de la session, à recopier si besoin) : vues.js (--rac, --tun), cpu.js (règle d'or, croisements, raccourcis).
