# JADE QUI SECOUE, PUIS SANS MER — passation (2026-11-12)

Demande de Sacha : « refonte du système de route des montagnes de Jade : trop répétitif, trop plat. Beaucoup de modules, propres à la map,
fun, simple, sobre, sans grands demi-tours. Il faut que ça secoue. » Puis, en cours de réglage : « changement de plan : plus de mer dans les
pics de jade, ça doit juste être des pics flottants comme Avatar ; retravaille la génération et le design pour que ça soit à couper le souffle ;
la route doit descendre en passant entre les montagnes qui flottent. » Puis, sur le code de la mer gardé derrière `?mer=1` : « j'en veux plus ».

**Publié** : v1512 (Jade sans mer, commit 2d245d30), puis v1515 (la mer retirée du code, commit 11ada290). Branche de travail : `jade-modules-2026-11-12`.

## Les modules (genJade1, code/maps/jade-1.js)

| Module (`?jmod=` clé) | Ce que c'est |
|---|---|
| slalom | 4 ou 6 virages alternés, un pic planté à la corde de chacun |
| defile | un S large entre deux rangées de pics en quinconce |
| carrousel | un grand appui de 105-125° autour d'un vrai pic (remplace épingle et double sommet dans le paquet) |
| vrille | une droite, un tonneau complet de la dalle (~4 s) |
| colimacon | un tour complet autour d'un pic, qui DESCEND toujours (64 à 90 m) |
| plongee | LE GRAND PLONGEON (`jPlongeon`) — 62 à 90 m de chute en ~3,6 s entre deux pics, sous une île qui flotte au-dessus de la route |
| bosses | 3 ou 4 bosses de 6-8 m sur une droite |
| ascension | rare (25 %, `?asc=1`) : un tour jusqu'au-dessus du pic (150-200 m), une crête, un tour de l'autre main pour redescendre |

Jusqu'à 5 modules par vallée, deux par tronçon (`troncFun`) ; signatures (slalom, vrille, colimaçon, plongée) entrelacées avec les autres.
`?sans=jadefun` : la génération d'avant ces modules (sans la mer, elle aussi).

## Jade sans mer

- **Le ciel** (`code/rendu/scene-ciel.js`, `jAbime`) : sous l'horizon, la brume qui s'enfonce vers un bleu profond, et loin dessous une mer de
  nuages éclairée côté soleil, à `uJMerY` (parallaxe vraie). Le fleuve, la mer en cubes, l'écume et le ciel d'en dessous sont retirés.
- **Plus d'eau, dans le code non plus** (v1515) : la physique de l'eau (plonger, ricocher, surfer, jaillir, la mer qui ramène), l'eau qui frappe
  les montagnes, les effets (gouttes, couronnes, sillage, objectif mouillé, son sous l'eau, la peau de l'eau), les dauphins (et leur modèle,
  plus chargé par la page), le ras de l'eau, la route sous la mer et l'option `?mer=1`. **`JEAU` reste, neutre** (jade-3.js) : le vol, la caméra,
  le son, les missions et les portails le lisent — la caisse n'est jamais dans l'eau. `JADE.eauY = merY − 40` : le fond de l'abîme.
  Tomber de la route : la mort par le vide habituelle (jauge d'air, ou 120 m sous le point le plus bas : `jadeVide`).
- **La mission L'ABYSSE** (missions/table.js, secrète, 15 000) : « DESCENDS 400 M DANS LES PICS DE JADE » — la descente depuis le haut de la
  vallée (defis-moteur.js), au lieu du fond de la mer, devenu impossible.
- **La descente** : le relief au hasard penche vers le bas (`JDESC` 5,5 à 8,5 %, `JADE.desc`), ajoutée APRÈS les paliers (ils n'aplanissent que
  les ondes) ; ondes plus douces (budget de pente 0,20). Mesuré : 470 à 630 m de descente par vallée.
- **Les îles du ciel** (jadeBatit, jade-3.js) : tous les 560-980 m une montagne flotte au-dessus de la route (pied 75 à 135 m plus haut).
  Le lointain s'étage de −380 à +720 m autour de la route. Cascades × 1,6, longueur plafonnée à 340 m (elles se perdent dans la brume).

## Réglages faits pendant les contrôles

- **Le Pont du ciel** (`jadePont`, jade-eau.js) posait ses piliers et son arche sans la règle d'or : un pilier qui tomberait sur une autre portion
  de route est rehaussé au-dessus d'elle, sinon pas posé ; une arche traversée par une autre portion → pas de Pont dans la vallée (`pontSaute`).
- **Ascension** : autour d'une route levée, aucun sommet au-dessus de la crête − 35 m (900 m à la ronde).
- **Paliers voisins** : deux zones aplanies du relief à moins de 400 m prennent le même niveau.
- Crochets de banc (`jade-secoue.js`) : `dbgJadeMods()` / `dbgJadeMods(s)` (les montagnes au droit de la route en s), `dbgUniformes()` (les matières
  dont le programme lit un uniforme absent — la cause d'un écran noir « a.needsUpdate »).

## Ce qui a été vérifié (Chrome sans fenêtre, `outils/banc-maps`)

- Lots de 20 graines × 2 éditions (ordi, téléphone) avec et sans mer ; les fautives corrigées puis repassées : 0 heurt, pentes sous 0,40 sauf le
  grand plongeon (0,42 à 0,47, voulu). Conduites au pilote auto sans mort à travers plongeon, vrille, colimaçon, ascension.
- Après le retrait de la mer : syntaxe, assembleur, gardes, analyseur des non-déclarés (44 au lieu de 52, rien de nouveau), `dbgUniformes()` vide ;
  Jade (ordi + téléphone), nuages et grotte conduits avec photos, image nette.
- Panne trouvée en route (pas de ce travail) : depuis la fusion d1e431eb (v1508), tout le jeu s'affichait en noir en course (« a.needsUpdate »,
  `TRAIT_U.uAA` perdu). Une autre session l'a corrigée (3f462573, v1513) ; v1515 la contient.

Commandes :
`node outils/banc-maps/serveur.cjs 8347`, puis
`node outils/banc-maps/banc.cjs gen --carte=jade --graines=1,2,3 --roule=100 --photos=1 --port=8347 --cdp=9551 --profil=jade --audit="JSON.stringify({u:dbgUniformes(),m:dbgJadeMods(),r:dbgJadeRegle()})"` ;
`vue --graines=7 --s=700,1050 --meteo=midi` pour des photos. ⚠ `--roule` long : une vallée finie passe le portail, `s` repart de zéro.

## Ce qui reste

1. **Juger en jeu, au volant** : la descente, le grand plongeon, l'île au-dessus, la vrille (`rails9` de boucle-2-conduite.js traite une dalle couchée
   comme un looping sans TORD.on).
2. **Le ciel** pas vu la nuit ni au soir en photo fixe (vu la nuit en course : correct).
3. Les textes de figures de l'eau (PLONGEON, RICOCHET, SURF…) restent dans traductions.js : inutilisés, sans effet.
