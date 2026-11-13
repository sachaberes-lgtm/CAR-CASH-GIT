# LES NUAGES EN PARCOURS SUR TÉLÉPHONE — passation pour la session d'optimisation iOS (2026-11-13)

Sacha : « nuage a push » — même travail que pour Jade (`passation/JADE-TELEPHONE.md`, branche `jade-alleluia-tel-2026-11-13`) : la nouvelle map optimisée
de la même manière qu'elle l'est aujourd'hui sur mobile, le gros du travail mâché pour la session d'optimisation.

**Branche** : `nuages-parcours-tel-2026-11-13` = `origin/main` b08022d4 (v1571, le parcours carte postale) + cette passe. Rien sur `main`, cache non monté.
**Rien n'a été mesuré sur un iPhone** : banc Chrome sans fenêtre en édition téléphone (`--tel=1`), qui compte mais ne juge pas la fluidité.

## En quatre lignes
1. Le parcours carte postale était déjà presque à parité avec les nuages d'avant sur téléphone : la session des nuages avait prévu le téléphone (`nuaPoufLeger`, un nuage de mer ou de plafond sur deux).
2. Le tirage de la route ne gèle pas : 14 à 33 ms au total (génération 3-15 ms + roulage), contre 133-202 ms pour Jade avant sa passe. Rien à étaler.
3. Seul surplus trouvé : le bitume en pleine finesse, 144-192 k triangles en pointe contre 96-144 k avant le parcours, parce que la route s'enroule (spirale, pont, lacets, boucle, stade).
4. Corrigé par la même règle que Jade (« la tranche moyenne par l'abscisse ») : le bitume de pointe revient à 96 k. Aucun nuage retiré.

## Ce qui change (`code/moteur/piste-prebati.js`, `code/rendu/autoroute.js`)
Le texte est IDENTIQUE à celui de la branche Jade (mêmes lignes, pour que les deux branches fusionnent sans conflit) :
- sur téléphone (`PISTE_MOY`, donc `ALLEGE`), une tranche de route tout entière à plus de 260 m de route devant la caisse, ou 70 m derrière, passe en MOYENNE (une rangée sur 4 m) ;
- `pisteMoysOn()` dit où la règle joue : Jade Alléluia (`JADE.deco3`) et les nuages/orage en parcours (`NUA_PC.on && nua2On()`). Sur `main` d'aujourd'hui, `JADE.deco3` n'existe pas encore : la branche Jade l'apporte ;
- `?pistemoys=0` = avant ; `dbgPiste().parAbscisse` : le nombre de tranches concernées (13-14 au banc). Sur l'ordinateur : `null`, rien ne change (vérifié).

## Mesures (édition téléphone, météo midi, 14 points le long de la route, `dbgChamp()`, milliers de triangles dessinés)
| | Graine 1 | Graine 2 | Graine 3 | Graine 4 | Moyenne |
|---|---|---|---|---|---|
| Nuages d'avant (`?parcours=0`) — médiane / pointe | 440 / 640 | 403 / 620 | 413 / 518 | 419 / 591 | 419 / 592 |
| Parcours, avant cette passe | 489 / 648 | 521 / 723 | 406 / 534 | 362 / 506 | 445 / 603 |
| Parcours, après | 464 / 675 | 489 / 678 | 493 / 586 | 387 / 566 | 458 / 626 |
| Bitume fin, en pointe : avant → après | 144 → 96 | 192 → 96 | 192 → 96 | 144 → 96 | |

**À lire avec prudence** : le total ne baisse pas de façon nette, parce que les nuages eux-mêmes (« coton » 152-255 k, « nuages v8 » 124-201 k) varient de ±80 k d'un
passage à l'autre sur la même graine (graine 3 : coton 152 k puis 209 k). Le gain sûr est celui du bitume (48 à 96 k de moins aux pointes) ; la pire pointe passe de 723 à 678 k.
Appels de dessin : médiane 98-127, pointe 140-193 (avant le parcours : 105-128 / 163-182) — inchangés par cette passe.

## Vérifié au banc
- 4 graines téléphone : 0 erreur ; course au pilote 40 s × 2 graines : vivant, 0 erreur ; ordinateur : 0 erreur, règle inactive.
- Assembleur d'accord ; gardes démarrage, charte, allègement, burn-out : OK ; aucun nouveau nom non déclaré.
- L'image de la tranche moyenne vue de près a été photographiée sur Jade (identique à l'œil) ; pas refaite ici, c'est le même maillage.

## À MESURER SUR LE TÉLÉPHONE, dans l'ordre
1. Boîte de vol : une course dans les nuages en parcours, images > 21 ms et > 51 ms, contre une course d'avant le parcours (build d'avant v1571) à état thermique égal.
2. A/B `pistemoys=0` contre sans (trois passes, plan iOS § 5) : la règle doit faire baisser les images en retard dans la spirale, le pont et les lacets ; Sacha ne doit rien voir changer.
3. Si les nuages restent lourds : le surplus n'est PAS la route mais le coton et « nuages v8 » (jusqu'à 255 k + 201 k). Leviers existants, visibles, à montrer à Sacha : `nuaPoufLeger` (déjà un sur deux pour la mer et le plafond), la densité du coton.
4. Les nappes qu'on traverse (1 à 5 par route) : une grande surface transparente plein écran pendant la chute — c'est du remplissage, pas des triangles ; le banc Chrome ne le mesure pas. À regarder en premier si une chute au travers d'une nappe rame.

## Intégrer
- Cette branche et `jade-alleluia-tel-2026-11-13` portent le même texte dans `piste-prebati.js` et `autoroute.js` : les fusionner dans n'importe quel ordre.
- `sw.js` : +1 à l'intégration. Puis `node code/assembler.cjs --depuis-morceaux`, les 4 gardes, `non-declares.cjs`, une course AVEC photos.
- Rejouer les mesures : `node outils/banc-maps/serveur.cjs 8372`, puis
  `node outils/banc-maps/banc.cjs gen --carte=nuages --meteo=midi --graines=1,2,3,4 --tel=1 --port=8372 --cdp=9571 --profil=nuatel --auditfile=outils/banc-maps/audits/nuages-tel-champ.js`
  (`--q=parcours=0` : les nuages d'avant ; `--q=pistemoys=0` : sans la règle ; `nuages-tel-tirage.js` : le temps du tirage).
