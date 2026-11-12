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

## LA CHUTE DE JADE, L'ENDROIT ET L'ENVERS (2026-11-12, branche `jade-chute-2026-11-12`)

Sacha : « retravaille la génération de route : il faut que ça aille vers le bas et exploite les pics volants ; on doit descendre en roulant à travers
des pics de jade volants, c'est super épique — prends des libertés, inspire-toi des autres maps », puis « il faut que ce soit vertigineux dans
l'esthétique, et que tu joues sur l'idée de l'endroit et l'envers ».

- **La pente de fond** 17-23 % (`JADE_CHUTE.fond`, `?jadepente=0.07` = celle d'avant) : 0,9 à 1,7 km de descente par vallée ; la route naît en pente.
  La règle du rythme accepte jusqu'à 0,85 de pente pour Jade (route-rythme.js). Les rampes des modules ont leur arrondi (`e`, rampe(t,e)).
- **Modules** : LE PUITS (rare, remplace l'ascension : deux tours autour d'un pic géant, 170-250 m plus bas), LE COULOIR (pics des deux côtés + une île
  au-dessus), LES ARCHES (trois îles au-dessus d'un S), LES MARCHES (3-4 bascules de 30-45 m autour de pics), LE RETOURNEMENT (`envers` : demi-tonneau,
  ~2 s tête en bas en descendant sous trois pics renversés, demi-tonneau) ; plongeon 80-115 m, colimaçon 90-140 m ; îles du ciel deux fois plus nombreuses.
- **Les pics renversés** (`q.inv`) : une île du ciel sur deux, un tiers des montagnes proches et la moitié des lointaines qui flottent entièrement
  au-dessus de la route sont posées la tête en bas (jadeMatPilier / finMat : demi-tour autour de x ; jadePilierDans : le point ramené à l'endroit) ;
  leurs pins pendent (hauteur négative = le shader les dessine vers le bas) ; ni lianes, ni temples, ni cascades, ni cristaux, et elles ne s'effondrent pas.
- **Le saut refusé tête en bas** (`jadeEnversRefuse`, jade-secoue.js) : veqSaut et frEnvol refusent un saut si la dalle regarde vers le bas sur les
  4 s de vol qui suivent (200 m au moins) — sur une descente de 20-40 % un saut dure 3-4 s. Le saut du banc (`dbgAuto({saut})`, boucle-1.js) suit la même règle.
- Cascades jusqu'à 700 m de chute sur ordi (340 sur ALLEGE).

Mesuré : lots propres (0 heurt dans le couloir) ; pente locale max 0,42-0,50 ; sauts toutes les 2 s : plus aucune mort dans les retournements ni
les vrilles ; les morts restantes sont aux Trois Pics (une crête suivie d'un virage de 50° : le saut part tout droit) — elles existaient avec la pente
d'avant (comparaison `?jadepente=0.07` : 4 morts sur 4 contre 3 sur 4).

À faire : juger au volant (la descente, le retournement, le vertige) ; les Trois Pics plus doux si les sauts y tuent trop ; le retournement vu de près
sur téléphone ; `?jmod=` liste : puits, couloir, arches, marches, envers.
- Audit : dbgJadeAudit().panneaux suppose une route à plat ; dans une vrille ou un retournement il signale à tort (graine 13 téléphone : une liane à 88 m du vrai couloir, mesuré dans le repère de la route couchée).

## La nuit et la pluie sur téléphone (2026-11-12)

Sacha : « sur mobile les versions nuit et pluie ont un mauvais rendu ; améliore les couleurs, spécialement pour l'iPhone optimisé ». Les temps avaient été réglés
pour une mer sous l'horizon ; sur téléphone (moins de montagnes, cadrage en hauteur) le ciel, l'abîme et la route remplissent l'écran. Que des couleurs, aucun coût :
- monts peints de l'horizon (jLointain) : suivent la lumière du ciel (silhouettes d'encre la nuit) et, par temps sombre ou gris, prennent la teinte de l'horizon ;
  jour, matin, soir inchangés (plafond 1, poids nul au-dessus d'une luminance de .78) ;
- mer de nuages de l'abîme : éclairée selon le ciel (argent sourd au clair de lune la nuit) ;
- etalonnage-da.js : `rtT` (teinte de la route de Jade) la nuit, l'orage, la pluie ; la pluie en vert de jade brumeux plus profond (brume, ciel, reflets).
Photos avant/après : banc `vue --carte=jade --meteo=nuit|pluie|orage --tel=1`. Pas vu sur un vrai iPhone.
