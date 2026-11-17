# LE MOTEUR SE TAIT : rapport (17/11)

Demande de Sacha (17/11) : « on peut enlever le son du moteur on l'entend presque pas le son du nitro est amplement suffisant ».
Branche `qa/sansmoteur` (partie de `qualite-appareil` eb1f34f92), worktree `~/cash-car/qualite-sansmoteur`.
Interrupteur : `?plus=moteurson` = le son du moteur exactement comme avant (rien n'est supprimé du dépôt).

## Ce qui change
- La VOIX CONTINUE du moteur n'est plus bâtie ni calculée. Plus d'oscillateurs (osc, osc2, sub, LFO, sifflement), plus de souffle, de boîte, de pont,
  de frein moteur, de tic, de bruit rose, de saturation, de filtre, d'égaliseur, plus de `engDose`.
- Plus de consignes par image pour elle : `engSndParams`, `engApplique`, `regMoteur`, `regApres` ne tournent plus.
- La régie n'écoute plus le moteur : pas d'analyseurs (« oreilles »), pas de dosage du moteur.
- Le moteur vivant (`?moteurvivant=1`) et le moteur moderne (`?moteur=buche`) ne sont plus bâtis non plus.
- La boîte virtuelle tourne encore en nombres (`engGear`, `engRpm`, `engLoadStep`). Elle sert au tic dans le pouce et au coup de champ du rapport,
  au coup de `sensNitro`, à l'attention de la régie.

## Fichiers touchés
- `code/rendu/billets-devises.js` : `MOTEUR_SON` (le drapeau) et la section « LE MOTEUR SE TAIT ».
- `code/son/graphe-audio.js` : la chaîne du moteur, MV.build et MB.build sous `MOTEUR_SON` ; `dbgVu` suit les portes ; k-rate seulement si le moteur existe.
- `code/son/voix-moteur.js` : `engSetTier` sans voix = seulement l'état de la boîte.
- `code/moteur/boucle-5-sons.js` : plus de consignes ; la boîte tourne ; claquement sonore du rapport et pétarades sous `MOTEUR_SON`.
- `code/son/regie.js` : pas d'oreilles ni de dosage sans `engDose` ; ratés sous `MOTEUR_SON`.
- `code/interface/burn-out-1.js`, `burn-out-2.js` : le crissement et les flammes du garage restent, la voix et les pétarades se taisent.
- `code/gameplay/portail-passage.js` : la décharge au décollage se tait.
- `outils/banc-sansmoteur/parcours.cjs` : le banc (4 variantes, compteurs WebAudio, couverture V8).

## Inventaire des sons « moteur »
(a) Voix continue, RETIRÉE : ronflement/régime (2 oscillateurs + sub + souffle + saturation + filtre), battement LFO, sifflement, boîte, pont,
frein moteur, tics, bruit rose ; moteur vivant ; moteur moderne ; en vol, le moteur qui s'emballe ; à la mort, la retombée au ralenti.

(b) Ponctuels :
| son | où | état | au sens de Sacha ? |
|---|---|---|---|
| `moteur.palier` (carte moteur, `engSwapArme` → `engSwapSnd`) | achat-carte-moteur.js, graphe-audio.js | GARDÉ | non : signale un nouveau moteur |
| `moteur.cylindre` (paliers d'élan 1,5/3/4,2 s) | boucle-5-sons.js | GARDÉ | à trancher : signale l'élan, mais sonne « moteur » |
| claquement du rapport (subBoom + noiseBurst + pétarade) | boucle-5-sons.js | RETIRÉ (le tic pouce et le coup de champ restent) | oui : c'est du régime |
| pétarades au lâcher et en drift (`crackle`) | boucle-5-sons.js | RETIRÉ | oui |
| ratés après un choc (régie) | regie.js | RETIRÉ | oui |
| décharge au décollage | portail-passage.js | RETIRÉ | oui |
| burn-out du garage : voix au rupteur + pétarades | burn-out-2.js | RETIRÉ (crissement, fumée, flammes gardés) | à trancher : le garage devient plus calme |
| démarrage / coupure | — | il n'y a pas de son à part : c'était la voix continue | — |

## Dépendances vérifiées
- Nitro : sa chaîne ne passe pas par le moteur. Le banc compte les mêmes nœuds nitro. Aucun ducking du nitro par le moteur.
- Musique : `B.parole(REG.att)` (le creux quand « le moteur parle ») est GARDÉ tel quel : la musique bouge comme avant.
- Pneus : le bus des pneus suit `REG.bal/.6`. `REG.bal` se règle sur la puissance du moteur contre la musique. Sans moteur il reste à 0,5 (bus 0,83).
  C'était déjà le cas musique coupée. Musique allumée, avant, il bougeait entre 0,55 et 1,7 : à trancher (voir plus bas).
- Pause, arrière-plan, mort, seconde chance : les listes de gains acceptent `null` (déjà gardées `if(n9)`).
- Haptique : le tic du rapport est gardé (`hap(5)`), la boîte virtuelle tourne. Enregistreur : ne lit pas la voix du moteur.
- Écran Son : il n'y a pas de réglage « moteur » (seulement musique / effets / voix). Rien à masquer.
- `?nitro=physique` lit encore la note : `engSndParams` est calculé seulement si `NPHY.on`.

## Mesures (banc `outils/banc-sansmoteur/parcours.cjs`, Chrome sans fenêtre, ?tel=1, son coupé, 17/11)
| | base (avant) | `?plus=moteurson` | défaut (sans moteur) |
|---|---|---|---|
| nœuds créés à l'init du son | 142 | 142 | 94 (−48) |
| connexions à l'init | 131 | 131 | 90 (−41) |
| sources qui tournent en boucle | 13 (14 en course) | 13 (14) | 5 (6) (−8) |
| tampons créés à l'init | 15 (1 839 359 échantillons) | 15 (idem) | 11 (1 407 359) (−432 000, ≈ 1,7 Mo en float32) |
| nœuds en course / au retour menu | 168 / 188 | 168 / 188 | 120 / 137 |
| `createPeriodicWave` (formes d'onde par palier) | 4 | 4 | 0 |
| temps d'init du son (1 mesure) | 323 ms | 321 ms | 285 ms (−38 ms) |
| `stt` par passage de la boucle son | 58 | 58 | 32 (−45 %) |
| fonctions moteur par passage | 6 (engSndParams, engApplique, engSouffle, engGenou, regMoteur, regApres) | 6 | 0 (reste engLoadStep, la boîte) |
| fichiers moteur téléchargés | 0 | 0 | 0 |
| octets audio téléchargés | 7 951 281 | 7 951 281 | 7 951 281 |
Le moteur par défaut est synthétisé : aucun fichier à ne plus télécharger. Le gain est en nœuds, en calcul par image et en mémoire.

0 exception nouvelle sur le parcours menu → garage/burn-out → départ → course (pilote auto, nitro) → 2 changements de moteur → pause → arrière-plan
→ réanimation → mort → menu, dans les 4 variantes. Une erreur `stNote` (« reading 'length' ») sort AUSSI dans la base : elle n'est pas de ce lot.

## Non prouvé
- Le gel de 332 ms d'`engSwapArme` : le banc n'a pas pris le chemin du minuteur (0 appel mesuré). `engSwapArme` ne touche pas la voix du moteur
  (il joue `moteur.palier`, gardé) : il reste probablement. Le coût de `engSetTier` au palier (formes d'onde + courbe de saturation) disparaît, lui.
- Les appels « par image » : `dbgStep` n'avance pas le compteur d'images ; les chiffres sont par passage de la boucle son (rapports justes, totaux non).
- Le mode silencieux en vrai et l'iPhone : pas testés (rien sur le téléphone).
- Une seule mesure du temps d'init, sur un Mac chargé.

## À trancher par Sacha
1. `moteur.cylindre` (les paliers d'élan) : garder ou retirer ?
2. Le burn-out du garage sans voix de moteur (crissement seul) : ça va ?
3. Le claquement sonore au passage de rapport : retiré (le tic et le coup de champ restent). D'accord ?
4. Le niveau des pneus musique allumée : figé à 0,83 au lieu de suivre le moteur (0,55 à 1,7). Garder, ou fixer une autre valeur ?
5. Le creux de la musique quand « le moteur parle » : gardé pour que la musique reste identique. On pourrait l'enlever.
