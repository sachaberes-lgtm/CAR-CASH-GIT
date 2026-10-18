# ALLÈGEMENT — LOT F « CAISSES » (2026-10-18, branche al-caisses, base 024675ba)

## A. REMISES DANS LE JEU (changement VISIBLE, demandé par Sacha) : LA POUPÉE, LE REQUIN, LA RAIE
- Léo avait demandé le retrait de LA POUPÉE (716ff989, 17/10 : « enlève la barbie », remboursée 4,2 M$) ; Sacha revient dessus.
- **LA POUPÉE** : `retire:1` ôté de sa fiche ; prix inchangé (4,2 M$, ÉPIQUE). Gabarit, pot, traductions étaient restés.
- **LE REQUIN** : `retire:1` ôté ; sa condition `k:'bientot'` (« DÉFI À VENIR » du 6 au 14/10) redevient ce qu'elle était avant le 6/10 :
  `{k:'premium',eur:'9,99 €',rar:'leg'}` (boutique, LÉGENDAIRE). Il a bien été en vente (ccfbb021^). StoreKit n'est pas branché : comme
  les autres caisses en €, il s'équipe grâce à TEST_CAISSES et ne s'achète pas encore.
- **LA RAIE** : `retire:1` ôté, `rar:'epique'` (avant le 6/10) et `CAR_UNLOCK` `{p:2500000}` (2,5 M$, le prix qu'on lui remboursait).
- `san` : `RB_RETIRE={'LA RAIE':2.5e6}` supprimé (plus rien à rembourser en dehors de `CAR_UNLOCK[i].p`) ; une caisse non retirée ne sort plus de
  `owned`. Les remboursements déjà versés restent acquis (aucun argent repris) ; qui a été remboursé peut la racheter.
- Rien d'autre à toucher : SHAPES (`requin` + sa gerbe `fx.spray`, `e_raie`, `poupee`), ECH_POTS, FACET_SHAPES (`requin`), traductions EN (noms + punchlines),
  photos de boutique (rendues à la volée, aucune image statique) étaient tous restés. Les index CARS/CAR_UNLOCK ne bougent pas.
- `passation/preuves/preuve-raie.cjs` (preuve du remboursement de LA RAIE, déjà périmée sur la base : `m2Vierge` introuvable) est remplacée par
  `preuve-remises.cjs` : fiches, prix, « qui les possède les garde », caisse encore retirée remboursée une fois (ancien fichier : KO aux cas de remise).

## B. 48 — FICHES DES CAISSES RETIRÉES
- 27 lignes CARS réduites à `{retire:1,name:'…'}` (index des sauvegardes : mêmes noms, même ordre, 79 fiches). Vérifié : aucune boucle ne lit la fiche d'une
  retirée (`carRetiree` d'abord partout ; `buildCar` n'est atteint que par `dbgEquipe`, banc). COMÈTE garde sa fiche : `retire:1` à la source mais la
  mission `terre` la RAMÈNE à l'exécution (`SHAPES.proto` existe, voir « revenue »). Les 7 retirées données par une mission (TAXI JAUNE, SANS-PERMIS,
  GRILLE-PAIN, BOULE, GLACIER, DEUCHE, DÉESSE) n'ont pas de gabarit : elles restent retirées, `c.shape` indéfini ne les ranime pas (comme avant).
- Traductions EN : les punchlines des 27 retirées (29 paires, deux étaient en double) partent, ET 44 paires de l'ancien roster de 24 voitures (21 noms
  CAISSE À SAVON… DIEU-VITESSE, 23 punchlines : chaque clé n'apparaît qu'une fois dans le fichier, jamais lues). Les NOMS des retirées restent : `TR(r.car)`
  les écrit dans l'écran des missions (7 cas) et dans le message de remboursement `SAVE.remb` (tous). ANTIMATIÈRE reste (palier moteur).
- Déjà absents (rien à retirer) : pots ECH_POTS et FACET_SHAPES des retirées (il n'en restait plus). Roues : style `tourbillon` + option `flanc` de `lpWheel` retirés
  (seule LA DÉFERLANTE s'en servait). `sansPneu` reste : mort lui aussi (aucun gabarit ne le passe), non demandé.
- À noter, non corrigé : 7 missions paient en caisses retirées (elles n'apparaissent pas au garage) ; `vie5min` vise « LA JEEP », qui n'existe pas ;
  pour ces caisses le patch M2 remplace `CAR_UNLOCK[i]` par `{k:'mis',av}` AVANT `san` : leur prix `p` n'est donc plus lu pour le remboursement.

## C. 49 — SIX FORMES SANS CAISSE : kei, break, pickup, muscle, berline, wedge supprimées (`gt` repli et `proto` COMÈTE gardés). En-tête de section corrigé.

## D. 18 — BOUTS MORTS DE creatures/
- dauphin.js : `DOL_CHORE`, `dolChorePose`, `DOL_CYCLE`, `DOL_ETOILE` (une toile 64×64 peinte à chaque chargement du jeu), `dolNoirMaj` + `dolNoir` retirés
  (le jeu a `jdmNoirMaj`). `DOL_BANC` reste (le jeu le lit). singe.js : le singe PENDU (`singeForme`, `SINGE_F/FM`, `singeAnime`, `singeTape`, `sgDebout/sgCol/sgOs`,
  `SG_YA/SG_YH/SG_QI`, la branche `queue/mains` de `singeNouveau`). Gardés : poses du décor, course, `sgPrim/sgProche/sgColQ` (partagés).
- boite-dauphins.html : plus de vue LE BANC, de chorés, de gerbes ni de route ; il reste UN dauphin (Au ras, Dark triad écrit dans la boîte, Ralenti, Figé, Lisse,
  Ciel rêve, Structure) et la toile des étoiles, déplacée dans la boîte. boite-singe.html : plus de poses « par la queue / par les mains » (pose de départ : COUCOU).
- index.html : l'en-tête qui disait « creatures/*.js non chargés par le jeu » est corrigé (ils le sont : `<script>` et Worker `atelier.js`).

## Octets (7 660 148 → 7 635 516 pour index.html, −24,6 Ko net)
index.html : fiches CARS −5,9 Ko (net des commentaires de la remise) · I18N −11,0 Ko · roues −1,3 Ko · six formes −6,4 Ko ; creatures/dauphin.js −5,5 Ko, singe.js −5,1 Ko ;
boite-dauphins.html −8,0 Ko, boite-singe.html −0,8 Ko. Guide : une ligne (« Retirer une caisse »). sw.js non touché.
