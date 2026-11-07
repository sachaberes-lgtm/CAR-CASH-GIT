# Sonde audio — ce qui joue vraiment (Chrome headless muet, agent Opus, 2026-11-07)

Bilan : 0 bloquant, 3 majeurs, 6 mineurs. Données : chasse/banc-son/ (journal.md, sonde-*.json, log*.txt, sonde-inj.js, lance-son.cjs, sc.cjs, scX.cjs, analyse.cjs, ou.cjs). Mesure : prototypes WebAudio enveloppés avant le jeu, `CCSON.play` nommé, étiquettes ramenées à `code/<morceau>:ligne` ; volume effectif = produit des gains jusqu'à la destination (indicateur, sans l'amplitude propre des buffers ni les WaveShaper).

## A. Carte mesurée
Contextes : avec `?intro=ancien`, ctx 1 `introSound` (init:126) fermé à l'entrée au menu ; ctx 2 le jeu (`initAudio`, graphe-audio:167, 48 kHz), seul vivant ensuite ; Pouce bleu, sfx.js et l'`<audio>` branché y passent. Pas de contexte orphelin. Compresseurs (ctx 2) : master (−16 dB, ratio 4, :181), limiteur −1 dBFS (:188), `musWaBranche` (musique:234), deux par morceau Pouce bleu, mur de vent (stries-vent:410). 17-22 boucles à gain 0 tournent en permanence (moteur, vent, gomme, pluie), menu et garage compris.

| État | Sources audibles | Somme des gains | Pic |
|---|---|---|---|
| Menu | vent `chuteDoux` 0,03+0,007, lobby 0,007-0,02 | 0,03-0,06 | 0,51 (tardifs) |
| Garage | `garage.feu` 0,038, `garage.ambiance` 0,027, lobby (pic 0,5 à l'entrée) | 0,09-0,2 | 0,62 |
| Boutique 3D | feu/ambiance à 0 mais en boucle, lobby 0,007-0,06 | 0,02-0,1 | 0,1 |
| Course | moteur 0,02-0,04, gomme 0,03-0,17, vent 0,015, Pouce bleu 0,06-0,2, ponctuels 0,1-0,45 | 0,24-0,45 | 1,12 |
| Frénésie | `dark-triad.m4a` 0,56, Pouce bleu 0 (coupé) | 0,54 | 1,20 |
| Mort | explosion 0,80 (3,2 s) + mort `sampleWA` 0,29-0,52 + 0,33 | 0,9-1,73 | 1,73 |
| Fin → garage | lobby suivant, feu, ambiance | 0,06-0,2 | 0,3 |
| Tout coupé | aucune | 0 | ctx running |

## B. Défauts

### SONDE-N01 · MAJEUR · Le premier son de chaque sorte part en retard
- `CCSON.play` renvoie null au premier appel de presque chaque id (50+ ids en C : `depart.logo`, `nitro.plein`, `pwr.n`, `pwr.double`, `frenesie.entre`, `triade.revele`, `aura.encaisse1`, `explosion`, `mort.vide`, `moteur.palier`, `pad`…), puis rejoué depuis `une@sfx.js:90` (décodage à la demande) à gain plein, 23 ms à ~1 s plus tard (frénésie : 2,73 s). Au chargement, `riche.bon`, `fourgon.billets`, `riche.gemme`, `riche.verre` (richesse-3:162-167) refusés puis rejoués plusieurs secondes plus tard sur le titre.
- Ce que le joueur entend : premières fanfares décalées ou empilées ; gerbe d'argent du titre après coup.
- Cause : sfx.js `play()` « LES SONS À LA DEMANDE » (`S.demande`/`S.att`) ; seules les `pre:1` sont décodées d'avance. Confiance haute (refus puis relance), moyenne (délais : un vrai téléphone décode plus lentement).

### SONDE-N02 · MAJEUR · Après la pause, le jeu repart sans son
- E2 : `ctx.resume()` appelé 8 fois (feuilleFerme, repriseCompte, chaque `pas`, togglePause:371) ; `paused:false` à 141 793 ms mais contexte `suspended` jusqu'à 148 968 ms : 7,2 s muettes. E5 : 2,1 s. X3 : > 1 s. À la reprise, les `ui.bip` du compte partent en paquet (deux refusés par recharge, un joue 7 s après).
- Cause : mobile-tactile.js `repriseCompte`/`pas` : `acReveil(AC).then(function(){sfx('ui.bip');})` sans vérifier que le chiffre est encore d'actualité ; togglePause relâche sans attendre le contexte. La lenteur de resume() sous headless+--mute-audio gonfle la durée. Confiance haute (bips en paquet), moyenne (durée).

### SONDE-N03 · MAJEUR · La musique de frénésie écrase tout le mixage
- `dark-triad.m4a` (el.volume=1) gain effectif 0,56-0,58 contre Pouce bleu 0,06-0,2 et moteur 0,02-0,04 ; Pouce bleu bien coupé pendant la frénésie puis revient (0,064 → 0,10). Somme 0,35 → 0,76-1,2.
- Cause : deux chaînes sans référence de sonie commune (musique-frenesie.js `frenMus`/`musicVolCible` vs `POUCE_JEU.niveau`/`PBJ_NIV`). Confiance moyenne (pas de LUFS, amplitude du m4a inconnue).

### SONDE-N04 · MINEUR · Contexte éveillé quand tout est coupé (39 sources vivantes, 18 boucles à 0 ; = SON-N04).
### SONDE-N05 · MINEUR · Le morceau de l'écran de fin continue dans la course 2 sans coupure (lobby lié → transforme ; sans doute voulu).
### SONDE-N06 · MINEUR · Boutique 3D : feu/ambiance du garage à 0 sans stop, repartent au retour (propre).
### SONDE-N07 · MINEUR · 17-22 boucles muettes en permanence ; jusqu'à 320 sources vivantes en course 2 (majorité à 0). CPU.
### SONDE-N08 · MINEUR · Fin d'un accord Pouce bleu figé en pause rejoué à la reprise (X1 : buffers 3,4 s et 0,5 s figés 16 s).
### SONDE-N09 · MINEUR · La mort est le pic de saturation (somme 1,64-1,73 : explosion 0,8 + sampleWA 0,5 + 0,3) ; limiteur présent, pompage possible sur la musique de fin.

## C. Boucles orphelines
Aucune boucle de la partie 1 audible dans la partie 2. Boucles vivantes à 0 : initAudio (graphe-audio:201-350), gomBatit (:116/125), garage.feu/ambiance en boutique, chuteDoux au menu (0,03+0,007, s'arrête en course), voix Pouce bleu figées en pause/arrière-plan.

## D. Non fait
Intro 161 complète (sautée) ; rampe `ventCiel` ; seconde chance (`ok:false`) ; ×2 ; Final Spin (rouleaux jamais partis avec Entrée) ; arrière-plan au menu ; niveaux réels (LUFS) ; `createMediaElementSource` intercepté seulement à partir de E. Mute partiel : aucune fuite (effets coupés → seule la musique ; musique coupée → aucune musique, frénésie comprise).
