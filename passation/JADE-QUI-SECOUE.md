# JADE QUI SECOUE, PUIS SANS MER — passation (2026-11-12)

Demande de Sacha : « refonte du système de route des montagnes de Jade : trop répétitif, trop plat. Beaucoup de modules, propres à la map,
fun, simple, sobre, sans grands demi-tours. Il faut que ça secoue. » Puis, en cours de réglage : « changement de plan : plus de mer dans les
pics de jade, ça doit juste être des pics flottants comme Avatar ; retravaille la génération et le design pour que ça soit à couper le souffle ;
la route doit descendre en passant entre les montagnes qui flottent. »

Branche `jade-modules-2026-11-12` (partie d'origin/main v1497), **non poussée, non publiée**.

## Les modules (genJade1, code/maps/jade-1.js)

| Module (`?jmod=` clé) | Ce que c'est |
|---|---|
| slalom | 4 ou 6 virages alternés, un pic planté à la corde de chacun |
| defile | un S large entre deux rangées de pics en quinconce |
| carrousel | un grand appui de 105-125° autour d'un vrai pic (remplace épingle et double sommet dans le paquet) |
| vrille | une droite, un tonneau complet de la dalle (~4 s) |
| colimacon | un tour complet autour d'un pic ; sans mer il DESCEND toujours (64 à 90 m) |
| plongee | sans mer : LE GRAND PLONGEON — 62 à 90 m de chute en ~3,6 s entre deux pics, sous une île qui flotte au-dessus de la route (`jPlongeon`). Avec `?mer=1` : la route sous la mer (`jade-secoue.js`) |
| bosses | 3 ou 4 bosses de 6-8 m sur une droite |
| ascension | rare (25 %, `?asc=1`) : un tour jusqu'au-dessus du pic (150-200 m), une crête, un tour de l'autre main pour redescendre |

Jusqu'à 5 modules par vallée, deux par tronçon (`troncFun`) ; signatures (slalom, vrille, colimaçon, plongée) entrelacées avec les autres.

## Jade sans mer (`JADE_MER` faux par défaut ; `?mer=1` rend la mer, sans descente)

- **Le ciel** (`code/rendu/scene-ciel.js`, `jAbime`, uniforme `uJAbime`) : sous l'horizon, plus de fleuve ni de mer en cubes — la brume qui
  s'enfonce vers un bleu profond, et loin dessous une mer de nuages éclairée côté soleil, à `uJMerY` (parallaxe vraie).
- **Plus d'eau** : `jadeEauOk()` est faux → ni physique de l'eau, ni dauphins, ni objectif mouillé, ni son sous l'eau ; le ras de l'eau est
  coupé ; la chute de la fin ne fait plus d'écume. `JADE.eauY = merY − 40` : le fond de l'abîme, sous le pied de toutes les montagnes.
  Tomber de la route : la mort par le vide habituelle (jauge d'air, ou 120 m sous le point le plus bas).
- **La descente** : le relief au hasard penche vers le bas (`JDESC` 5,5 à 8,5 %, `JADE.desc`) ; ondes plus douces (budget de pente 0,20 au lieu
  de 0,30). Mesuré : 280 à 380 m de descente sur les trois vallées conduites.
- **Les îles du ciel** (jadeBatit, jade-3.js) : tous les 560-980 m une montagne flotte au-dessus de la route (pied 75 à 135 m plus haut).
  Le lointain s'étage de −380 à +720 m autour de la route (au lieu de −260/+420). Cascades × 1,6, longueur plafonnée à 340 m (elles se perdent
  dans la brume).

## Réglages faits pendant les contrôles

- **Piliers du Pont** (`jadePont`, jade-eau.js) : ils étaient posés sans la règle d'or. Graine 28 : un pilier de 440 m sur l'approche d'un
  colimaçon. Désormais un pilier qui tomberait sur une autre portion de route est rehaussé au-dessus d'elle (il tient toujours l'arche), sinon
  il n'est pas posé (`dbgJadeMods().pontSaute`).
- **Ascension** : autour d'une route levée, aucun sommet au-dessus de la crête − 35 m (900 m à la ronde) ; les pics du centre peuvent plonger
  sous l'abîme pour que leur sommet reste sous la crête.
- **Paliers voisins** : deux zones aplanies du relief à moins de 400 m prennent le même niveau (graine 23 : 53 % de pente à l'entrée des
  Trois Pics, juste après un colimaçon).
- `dbgJadeMods(s)` : les montagnes qui touchent la route à l'abscisse `s` (le banc s'en sert pour trouver un coupable).

## Ce qui a été vérifié (Chrome sans fenêtre, `outils/banc-maps`)

Avec la mer (avant le changement de plan) : lot de 20 graines × 2 éditions, 19/20 propres → la 28 (pilier du Pont) corrigée ; défilé,
carrousel, bosses, ascension, colimaçon descendant vus en photo et conduits sans mort ; téléphone : plongée, vrille, ascension conduites.

Sans mer : voir le bilan du lot en bas de ce fichier.

Commandes :
`node outils/banc-maps/serveur.cjs 8347`, puis
`node outils/banc-maps/banc.cjs gen --carte=jade --graines=1,2,3 --roule=100 --photos=1 --port=8347 --cdp=9551 --profil=jade --auditfile=<audit-lot.js>`
où l'audit est `JSON.stringify({m:dbgJadeMods(),r:dbgJadeRegle(),a:dbgJadeAudit()…})` ; `vue --graines=7 --s=700,1050 --meteo=midi` pour des photos.

## Ce qui reste

1. **Juger en jeu** : la descente (le pilote auto la tient, mais au volant ?), le grand plongeon (3,6 s à ~25 %), l'île au-dessus.
2. **Le ciel par temps** : jugé par beau temps (midi) et sous la pluie ; pas vu la nuit ni au soir (uJdK.z assombrit l'abîme la nuit).
3. **La vrille** : le volant dans le tonneau (`rails9` de boucle-2-conduite.js traite une dalle couchée comme un looping sans TORD.on).
4. **Le code de la mer** reste (derrière `?mer=1`) : `jade-secoue.js` (route sous la mer), `jadeEauVol`, les dauphins. À retirer si Sacha confirme.
5. **Publication** : rejouer sur origin/main à jour, numéro de cache +1, pousser à part, vérifier `/jouer/sw.js` en ligne. Rien n'a été poussé.

## Bilan du lot sans mer (graines 11 à 30, ordi et téléphone)

- 1er passage : 19/20 sur chaque édition — graine 28 : l'arche du Pont traversée par l'approche d'un colimaçon ; 8 vallées au-dessus de 40 % de pente
  (les zones aplanies annulaient la descente, la route rattrapait 50 m en sortant).
- Corrigé : la descente s'ajoute après les paliers (ils n'aplanissent que les ondes) ; l'arche refusée si une autre portion de route passe dans son
  volume (`pontSaute` = 10). Les 9 graines fautives repassées : 9/9 propres, 0 heurt, toutes les pentes sous 0,40 sauf le grand plongeon
  (0,42 à 0,47 : voulu). Descente mesurée : 470 à 630 m par vallée.
- Conduite au pilote auto à travers le grand plongeon : graines 11 et 27 (ordi), 15 et 28 (téléphone) vivantes.
