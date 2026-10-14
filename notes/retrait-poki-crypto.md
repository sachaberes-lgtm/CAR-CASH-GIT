# retrait-poki-crypto — notes au fil de l'eau (14/10)
Worktree : ~/cash-car/detail/wt/retrait-poki-crypto, branche detail/retrait-poki-crypto (partie de assemblage T2 4007550).
Outils (scratchpad, perdus au redémarrage) : ast.cjs (instructions de 1er niveau via acorn 8.17 de ~/.hermes), ref.cjs (comptes mot entier), ctx.py.

## Lot 1 — CRYPTOCITY (−64,3 Ko)
Retiré : le bloc « CRYPTOCITY — LA VILLE EN BULL RUN » entier (CRYPTO, MOON_DIR, cryptoOn/Reserve/Vide/Place/Tour/ColBougies, CRYPTO_VERRE,
cryptoPied, cryptoMatTours(Loin), cryptoPubAtlas, cryptoMatPub/Bougie/Taureau, TAUREAU_VERRE, cryptoMats, crTri/crLoft/crPatte/crTube/crGeo,
cryptoTaureauGeo, TAUREAU_K, cryptoTaureau, cryptoHeurt, CRYPTO_G, cryptoGeos, cryptoTickerTex, cryptoBatit, cryptoMatPiece, cryptoInit,
cryptoFeu(Devant), cryptoFusee(Tick), cryptoAth, cryptoTick, cryptoJackpot, cryptoChauffe, window.dbgCrypto) ; NIV_CRYPTO, CRYPTO_JEU, CRYPTO_URL,
cryptoPlayOk, cryptoJouer, window.dbgNiveauCrypto, les 2 branches JOUER ?niveau=crypto (accueil + garage) ; BIOMES.bullrun (+ son étalonnage) ;
LVL.crypto/cryptoDe/cryptoA (+ GLACE.crypto, uTeinte, accent) ; les branches CR de buildVoxCity (+ l0..le de batir, morts) ; la pièce 'B' de
coinPeint ; '-crypto' de mortsCle ; I18N NOUVEL ATH/JACKPOT/CRYPTOCITY ; le cryptoTick de la boucle.
Gardé (visible dans le jeu actuel) : LA PLUIE D'ARGENT v2 (PLA, déclenchée par startMoneyRain partout) — sans sa « pluie de fond » de CRYPTOCITY ;
son billet ₿ (plaBilletBtc, qui porte encore le texte « CRYPTOCITY · BULL RUN » dessiné : c'est ce qu'on voit tomber) ; cryptoPicto → renommé
plaPicto, réduit à 'btc' et 'eth' (les seuls que la pluie dessine) ; la chauffe de la pluie au menu → plaChauffe (la part PLA de cryptoChauffe).
Outils de Léo qui n'ont plus la carte (voulu, non modifiés) : VERSION PRINCIPALE/simulateur/course.html l. 314 (`w.dbgNiveauCrypto()`, lèvera une
erreur si on choisit la map), simulateur/maps.js l. 45-47 (map CRYPTOCITY, play:false, photo maps-ciel/img/crypto-volant.jpg) ;
~/cash-car/debug/banc/robot-parcours/scenarios.cjs l. 94 (parcourt '?niveau=crypto' : jouera désormais le JOUER normal).
Doc non touchée (PILOTAGE) : VERSION PRINCIPALE/CLAUDE.md § « CRYPTOCITY — LA VILLE EN BULL RUN + LA PLUIE D'ARGENT v2 » (l. 164+) est périmé
pour la part CRYPTOCITY ; le CLAUDE.md racine idem s'il en parle.

## Fumée 1 (après CRYPTOCITY + POKI lot 1) : FUMÉE OK — couche, debout : accueil → JOUER → course → mort → REJOUER → mort → accueil, 0 erreur JS

## Lots 2-4 — L'ÉDITION POKI / CRAZYGAMES / PLAYGAMA (−31,8 Ko au total + poki-construire.js)
Méthode : pliage de constante MÉCANIQUE par l'analyseur (fold.cjs : acorn preserveParens, POKI=false puis PKC=false, FACILE_OK=true ;
if/?:/&&/||/! ; une instruction seule sur sa ligne part avec sa ligne ; bloc à let/const gardé entre accolades ; re-parse + recherche des
identifiants restants). Semantique App Store inchangée par construction (POKI y valait toujours false). 38 branches pliées en tout.
- lot POKI 1 (8447c71, 5,4 Ko) : 15 branches l. 17000-47000 (I18N du portail, ordre des niveaux, prix des caisses, objectif d'achat,
  SF.on, jadePlayOk, socle, gRappel/gRang1, MENU_SACHA, HUB, TEST_CAISSES=true gardé comme interrupteur).
- lot POKI 2 (bf22fe2, 7,0 Ko) : 9 branches de fin de jeu + le gros if(POKI){…} (son/pause/langue/SAUVEGARDE du portail : SAVE.portail,
  p.lit, p.stockage, SAVE.natif=2 n'y vivait QUE pour le portail) + pk, pkDeja, pkMuet, pkPasse (rendait toujours vrai : ses 3 appelants
  appellent directement), pkSilence, SAVE.portail, SAVE_VIDE. Miroir natif (SAVE.natif, Capacitor) et sw.js : intacts hors !POKI.
- lot POKI 3 (e1b062e, 19,4 Ko) : <head> (POKI_BUILD, POKI, PORTAIL(_SDK), FACILE_OK, KITS/CC_PK/CC_PUB/CC_MUET), colonne (PKC, pokiDims,
  cadre de Poki), facOn, git rm poki-construire.js.
CSS retiré (ne visait QUE html.poki / la crypto) : `html.colonne.poki body>.ccHors`, `html.poki,html.poki body{overscroll-behavior}`,
`html.poki … #gvCof / #gShopBas` (grille du garage), tout `<style id="poki">` sauf la règle html.sansVoix (le bloc s'appelle désormais
<style id="sansVoix">), `html.sansFacile [data-m="facile"]` (CrazyGames), le bloc charte 6 `html.c6.poki … (.mOutils/.mMisBtn/.mGear/.mPlay)`.
Laissé exprès : ~60 sélecteurs `html.hub:not(.poki)` / `html.c6.hub:not(.poki)` / `html.colonne:not(.poki)` / `html.hubOn:not(.poki)` —
toujours vrais, mais le :not(.poki) pèse 0,1,0 dans la spécificité : le retirer peut changer la cascade → à la session INTERFACE.
Laissé : L'ÉTERNELLE (`k:'pubs'`, SAVE.d.ex.pubs) — déjà inatteignable hors portail ; .gitignore (POKI/, POKI.zip) ; le README n'en parlait pas.
Docs à mettre à jour (PILOTAGE) : CLAUDE.md racine l. 6 (poki-construire.js), VERSION PRINCIPALE/CLAUDE.md l. 356, 2227-2274 (édition Poki).

## Fumée finale (e1b062e) : FUMÉE OK — couche, debout : … 0 erreur JS · ?play=jade : FUMÉE OK — couche : … 0 erreur JS. Serveur 8614 arrêté.
