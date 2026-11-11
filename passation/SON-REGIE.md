# SON — LA RÉGIE (2026-11-11, Fable, à la demande de Sacha)

Sacha : « améliore le son global du jeu. Il n'y a pas de son pour le drift ; le son des virages, on dirait un crissement de pneus ; le moteur et la musique, c'est mal mixé […]
chaque action doit avoir un impact, ça joue les uns sur les autres », puis « trop de sons aigus quand tu ramasses des pièces », « des variations dans le moteur : il a pris un
coup après un atterrissage, après un gros drift, il repart bizarrement, dans les airs il tourne différemment », « le crépitement du nitro selon la durée d'appui, avec une
traîne », et enfin « le son du moteur est agaçant, à long terme ça fait mal aux oreilles, c'est comme une perceuse ».

Branche `son-pro` (worktree `~/cash-car/son-pro`), fusionnée avec main v1462 (dont LA GOMME QUI CHANTE de Sacha, v1457). Cache v1463. **Rien n'a été écouté : tout est mesuré.**

## Ce qui était faux (mesuré, `outils/banc-son/mixage.mjs` et `fatigue.mjs`)
| Constat | Mesure avant | Après |
|---|---|---|
| Le moteur « perceuse » | son volume battait à 15 Hz sur toute sa profondeur ; une raie pure à 205 Hz, +20 dB sur le fond | battement 27 % à 68 Hz en croisière, 21 % en drift ; crête/RMS 10,9 → 7,9 dB |
| Moteur / musique | de +4 dB (morceau discret) à −5 dB (morceau plein) : jamais le même mixage | tenu à −4 dB sous le morceau (au-dessus de 160 Hz), ~4 dB de moins encore quand rien ne se passe |
| Le drift | aucune voix à lui ; le moteur se TAISAIT (gaz coupés) | effets +5,6 dB sur la croisière : quinte grave sous la gomme, moteur en charge, morsure, raccroche |
| Le nitro tenu | +1 à +2 dB sur la croisière, le même du début à la fin | il monte de ~5 dB en 3 s, claque par rafales, puis ~1,5 s de traîne |
| Les files de pièces | chaque tintement réglé pour sonner seul | plateau d'aigus jusqu'à −11 dB et −7 dB par son dans une file |

## Où
- `code/son/regie.js` : tout l'état (`REG`), les niveaux (`REG_NIV`), `regPas` (une fois par image), `regRegime` / `regMoteur` / `regApres` (le moteur), `regEquilibre` (moteur ↔ musique), `dbgRegie()`.
- `code/moteur/boucle-5-sons.js` : les six points de branchement (cherchez « LA RÉGIE »).
- `code/rendu/stries-vent.js` (`rugPas`, `rugUn`) : le nitro à la durée, la traîne.
- `VERSION PRINCIPALE/sfx.js` (`DENS`) : la densité des récompenses. `assets/audio/musique-bus.js` (`parole`) : le creux à 280 Hz qui s'ouvre.
- `code/son/graphe-audio.js` : `regBatit()` en fin d'initAudio ; le creux de l'oreille (−2,5 dB à 3,1 kHz sur tous les effets). `code/son/voix-moteur.js` : la gorge adoucie.

## Revenir en arrière
`?regie=0` : tout comme avant (sauf la densité : `?densite=0`). Les niveaux se règlent en direct : `dbgRegie('niv',{cible:-3,recul:.7,quinte:.07,ronron:.2})`.

## Vérifier
- `node outils/banc-son/mixage.mjs --wav dossier` : les scènes (croisière, virage, drift, nitro bref / tenu, vol, pièces), 5 pistes, niveaux et bandes.
- `node outils/banc-son/fatigue.mjs dossier/croisiere-moteur.wav` : battement, raies, acuité. `enveloppe.mjs` : une traîne, un raté.
- `node outils/banc-son/fumee-son.mjs --frenesie --chance` (bureau), `--colonne portrait --mobile`, `--colonne portrait --mobile --url "&tel=1"` : VERTES le 11/11.
  ⚠ Sous une charge machine > 30 la fumée sort ROUGE sans raison (vu ce jour-là) : `uptime` d'abord.

## Reste ouvert
- **Rien n'a été écouté**, ni sur ordinateur ni sur iPhone. Les réglages à juger d'abord : le recul du moteur en croisière (`recul`), le niveau de la quinte du drift, la traîne du nitro.
- Un vrai drift au doigt n'a pas été tenu au banc (le pilote automatique ne drifte pas) : la scène « drift » force l'entrée de la régie.
- Le moteur moderne de Léo (`?moteur=buche`) ne passe pas par le velours (il a sa propre chaîne) ; le nitro physique (`?nitro=physique`) reste derrière son drapeau.
- L'app iOS (`app-ios/www`) n'est pas resynchronisée.
