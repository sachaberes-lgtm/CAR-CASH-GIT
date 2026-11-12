# JADE QUI SECOUE — passation (2026-11-12)

Demande de Sacha : « refonte du système de route des montagnes de Jade : trop répétitif, trop plat. Beaucoup de modules, propres à la map :
une route qui passe sous l'eau et ressort, un zigzag entre les pics où on ne voit pas la suite, une spirale la tête à l'envers au-dessus de
l'eau, une route qui s'enroule autour d'une montagne et prend de la hauteur, un module rare qui monte au-dessus des montagnes et redescend.
Fun, simple, sobre, sans grands demi-tours. Il faut que ça secoue. » Puis : « fais d'abord ce que seul Fable peut faire, laisse le reste. »

Branche `jade-modules-2026-11-12` (partie d'origin/main v1497, cache v1498), **non poussée, non publiée**.

## Ce qui est fait (le cœur)

| Module (`?jmod=` clé) | Ce que c'est | Où |
|---|---|---|
| slalom | 4 ou 6 virages alternés, un pic planté à la corde de chacun | `jSlalom`, jade-1.js |
| defile | un S large entre deux rangées de pics en quinconce | `jDefile` |
| carrousel | un grand appui de 105-125° autour d'un vrai pic (remplace épingle et double sommet dans le paquet) | `jCarrousel` |
| vrille | une droite, un tonneau complet de la dalle (16 pas, ~4 s) | `jVrille` + normales (`VRI`, bloc JADE_BANK) |
| colimacon | un tour complet autour d'un pic, +64 à +90 m ; descend si une plongée suit | `jColimacon` + `LEV` 'marche' |
| plongee | la route passe sous la mer (52 m de cuve, ~680 m sous l'eau) et ressort | `jPlongee` + `PLG`, jade-secoue.js |
| bosses | 3 ou 4 bosses de 6-8 m sur une droite | `jBosses` + `LEV` 'bosses' |
| ascension | rare (25 %, `?asc=1`) : un tour jusqu'au-dessus du pic (150-200 m), une crête, un tour de l'autre main | `jAscension` + `LEV` 'dome' |

- Le paquet : signatures (slalom, vrille, colimaçon, plongée) et autres, entrelacés ; jusqu'à 5 modules par vallée, deux par tronçon (`troncFun`).
- Les pics des modules : `JADE.pose` (genJade1) → posés par `jadeBatit` avant les rangs au hasard (jade-3.js), à `gap` m du bord, jamais sur la route.
- `JADE.lev` : ce qu'un module ajoute à la route ; les montagnes restent à la hauteur d'avant (la crête de l'ascension passe au-dessus).
- La plongée : la mer de Jade est peinte dans le ciel, sans profondeur. `jadeNoie(mat)` (jade-secoue.js, appelé par `pisteTranches`) coupe les
  cinq matières de la piste à la ligne d'eau, comme les montagnes. La physique ne change pas (l'eau n'agit qu'en vol) ; `jadeRouteEauTick`
  fait la couronne, les bulles, la colonne. La mer se cale 12 m sous l'entrée (`JADE.plonge.W`, lu par jadeBatit).
- `?sans=jadefun` rend la génération d'avant. Console : `dbgJadeMods()`.

## Ce qui a été vérifié (Chrome sans fenêtre, banc `outils/banc-maps`)

- Graines 1 à 5, ordi : zéro erreur, `dbgJadeRegle()` = 0 heurt (aucun pic sur la route), pente max 0,31 à 0,37.
- Graine 2 conduite 110 s au pilote auto : vivante après la vrille et la plongée (photos : dans la vrille, sortie de l'eau objectif mouillé).
- Graines 4 et 5 avec `asc=1` conduites 75 s : vivantes (colimaçon + ascension traversés sur la 5).
- Photos : route coupée à la ligne d'eau, sous l'eau, vrille vue de dehors, slalom, colimaçon.
- `node --check` du jeu entier, `assembler --verifier`, garde-allege, garde-charte, garde-demarrage : OK.

Commande type :
`node outils/banc-maps/serveur.cjs 8347` puis
`node outils/banc-maps/banc.cjs gen --carte=jade --graines=1,2,3 --roule=110 --photos=1 --port=8347 --cdp=9547 --profil=jadefun --audit="JSON.stringify({m:dbgJadeMods(),r:dbgJadeRegle(),e:String(window.__jadeErr||'')})"`
(`vue --graines=2 --s=1290,3980,4500` pour des photos à une abscisse ; `--q="jmod=bosses,defile"` pour imposer des modules.)

## Ce qui reste (réglage et contrôles de routine)

1. **Jamais vus en photo ni conduits exprès** : défilé, carrousel, bosses, la crête et la descente de l'ascension, le colimaçon qui descend.
   Les imposer avec `?jmod=` et regarder : le pic du carrousel et du colimaçon est-il bien au centre (sur la photo du colimaçon de la graine 1
   on ne voit pas de gros pic central) ; les bosses secouent-elles sans faire décoller ; la crête est-elle vraiment au-dessus des montagnes.
2. **Téléphone** (`--tel=1`) : rien n'a été lancé. Vérifier le coût de `jadeNoie` (un test par pixel de route) et le nombre de pics posés avec JADE_SOBRE.
3. **Pièces sous l'eau vues d'au-dessus** : les pièces et fruits ne sont pas coupés à la ligne d'eau (seule la piste l'est) ; avant la plongée
   on peut voir des pièces « posées sur la mer ». À masquer tant que la caméra est au-dessus, ou à accepter.
4. **Vrille** : vérifier à la main le volant dans le tonneau (la règle `rails9` de boucle-2-conduite.js traite la dalle couchée comme un
   looping : sans TORD.on, la caisse est sur rails quand la normale passe sous 0,5), une sortie de route en plein tonneau, les pièces.
5. **Longueur et densité** : mesuré 3 modules + les Trois Pics pour ~7 km (la visée `longueurCible` donne jmN = 3 ici). Si Sacha en veut plus,
   baisser le diviseur 700 de `jmN` (jade-1.js) ; les vallées s'allongent (les modules font 450 à 2 100 m).
6. **Lot de graines** : `dbgJadeAudit()` sur 20 graines (couloir, frôlements, panneaux), les deux éditions ; `outils/banc-course/toutes-maps.cjs` ;
   `outils/banc-routes/empreinte.cjs` pour prouver que les autres maps ne bougent pas ; `?sans=jadefun` et `?sans=jademodules` rejoués.
7. **Le ras de l'eau** est coupé quand la vallée a une plongée (la plongée cale déjà la mer près de la route). À revoir si on veut les deux.
8. **Publication** : rejouer sur origin/main à jour, numéro de cache +1, pousser à part, vérifier `/jouer/sw.js` en ligne. Rien n'a été poussé.
