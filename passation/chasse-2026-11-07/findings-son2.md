# Chasse — son, le graphe et les interactions (agent Opus, 2026-11-07, v1235)

Bilan : 0 bloquant, 3 majeurs, 4 mineurs, 3 « à vérifier ». Scripts : chasse/son2/.

## 1. La carte du graphe
Contextes : AC (le jeu, 48 kHz, `initAudio` graphe-audio.js:166) ; iAC (intro 1.61, intro-161.js:693, sortie directe sans limiteur via `vol9`=sfxVol(), fermé 4,2 s après la casse ; pas créé si SON coupé) ; contexte de l'ancienne intro (init.js:126, `?intro=ancien`) ; les iframes Pouce bleu « html » reçoivent AC par Proxy (pouce-bleu-jeu.js:146) ; sfx.js utilise AC (`CCSON.init(AC,MASTER)`) ; moteur vivant = AudioWorklet dans AC (`?moteurvivant=1`).

Bus dans AC :
```
EFFETS : [chaînes] → MASTER(1) → BUSOUT → cmp(−16 dB, 4:1, genou 12, 4/160 ms) → lim (tanh 1,3) → MASTER._vol (sfxVol()=VOL.sfx×.58) → _limIn (.937 ; 0 si SON coupé) ─┐
MORTS (sampleWA) → MASTER._vol (après le compresseur) ────────────────────────────────────────────────────────────────────┤
POUCE BLEU : filtre → g → MUSBUS → e(.937) ───────────────────────────────────────────────────────────────────────────────┤→ MASTER._lim (−1 dBFS, 20:1, 1 ms) → destination
<audio> branché (MUS_WA) : src → W.g → MUSBUS → [cmp doux tactile] → W.e ─────────────────────────────────────────────────┘
<audio> NON branché (Safari, iOS<17) : sortie directe, hors limiteur
```
Compresseur sur les effets seulement ; limiteur −1 dBFS commun (ratio 20). Sous l'eau (Jade) `eauFiltre` entre MASTER et BUSOUT : morts et musique y échappent. Bus sfx.js : ui −5 dB, rec 0, fx +1, amb −4, salle (convolution).

Portes (graphe-audio.js) : 11 (gainN+LFO, windG, whG, skidG, jrG/jrDep, jetG, jetLowG, jetOscG, pluieG, GOM.sG/gG) + DRS, RSN, RR. Ouverture dans `setTargetAtTime` dès consigne > 1e-4 ; fermeture par `portesTick` après 7 constantes. Piège : `.value=` ou une rampe ne rouvre pas ; aucun écrivain fautif trouvé.

Qui écrit quel gain : chaque image de course (boucle-5, porte `running&&!paused&&!gameOver`) ; `duckT` (moteur, vent, nitro, pluie ; pas la musique) ; SIG_RECUL → MUSBUS.recul −3 dB 0,4 s ; Pause : 26 gains à 0 (12 ms), BUSOUT à 0 à +0,42 s, AC suspendu +0,49 s, `musicEl.pause()` ; Reprise : `busPlein`, `acReveil`, `musicPause(false)` à la fin du 3-2-1 ; Clic en pause (`pauseSon`) : rec/fx/amb à 0, BUSOUT 1, `AC.resume`, +0,54 s BUSOUT 0 + suspension ; SON coupé : `_limIn` 0 (contexte jamais suspendu, SON-N04) ; Explosion : `musicStop(true)` (0,35 s) ; endGame : tout à 0,05-0,3 s, musicMenu à +1,4 s ; resetGame : `finSonsCoupe`, `busPlein`, `deathStop`, `musicStartRun(true)` ; Frénésie : `<audio>` THE DARK TRIAD, Pouce bleu à 0 quand `fr9` ; Lobby lié : niveau = mixage menu (ciel ×.36, garage ×1), fondu 4 s.

Volumes : `SAVE.d.sfx/mus` → `SND.sfx/music` (sauvegarde.js:301), `SAVE.d.vol` → `VOL` (:302). Plus de `vox` (annonceur en texte seulement). `SND.sfx` lu par sfxOk/sfx, chuteDoux, bqSon, deathSound, vroomGarage, instruOn, intro, boum JOUER, musWaSon ; ignoré par les boucles CCSON déjà créées et `sldSynth` (muets de fait par `_limIn`). `VOL.mus` appliqué seulement par musicTick (iPhone sans MUS_WA : `el.volume` verrouillé).

## 2. Matrice des états (résumé)
Intro : iAC puis lobby à `reveler` (+260 ms), queue d'iAC sans limiteur commun. Menu : lobby ×.36, chute douce, vent au piqué. Garage : lobby ×1, `garage.ambiance`+`garage.feu` (reprise 800 ms boucle-1:139), coupés par closeGarage. Boutique : nappe, couche « air » jamais branchée (N05). JOUER : lobby → `transforme`, boum ; lobby pas prêt : double départ (N04). Course/vol/nitro : OK, pas de souffle orphelin. Frénésie : OK sauf pause (N01). Pause : Pouce bleu continue 0,49 s et repart à chaque clic (N02). Arrière-plan/retour : OK. Explosion/fin/seconde chance/final spin/rejouer : OK (N03 spin connu). Quitter : OK. Recommencer : l'ancien morceau reprend sous le volet (N03). Portail : tonalité ne suit pas (N06).

## 3. Défauts

### SON2-N01 · MAJEUR · Pause en frénésie : deux musiques à la reprise
- Où : musique-frenesie.js:261-263 (musicTick, `fr9`) ; init.js:378 ; mobile-tactile.js:368 (repriseCompte).
- Quoi : ⏸ pendant la frénésie : `musicEl.pause()` → événement `pause` → `musicOn=false` → `fr9` faux → musicTick (hors porte de simulation) remet `POUCE_JEU.niveau(b9)` : Pouce bleu remonte ~0,4 s sous la pause ; à REPRENDRE, `busPlein`+`acReveil` : Pouce bleu seul à plein niveau pendant le 3-2-1 (0,9-1,3 s), puis THE DARK TRIAD repart par-dessus.
- Preuve : `musicEl.addEventListener('pause',function(){musicOn=false;});` ; `const fr9=musicMode==='run'&&!!FRENM.sw&&musicOn&&!!musicEl&&!musicEl.paused;` ; `POUCE_JEU.niveau(fr9?0:b9*pbjPlancher(...));`
- Correction : dans `fr9`, `(musicOn||paused)` au lieu de `musicOn&&!musicEl.paused`, ou ne pas toucher `POUCE_JEU.niveau` quand `paused` ; `musicPause(false)` au début du 3-2-1.
- Confiance : moyenne-haute.

### SON2-N02 · MAJEUR · Clic en pause : la musique de course repart
- Où : console-son.js:64-69 (`pauseSon`) ; musique-frenesie.js:259-263 ; Pouce bleu branché sur MASTER._lim (musique.js:494), hors BUSOUT.
- Quoi : dans la pause ou les réglages, chaque bouton/cran relance AC 0,54 s ; Pouce bleu (gain `ch.g` au niveau de course, musicTick ignore `paused`, 1 s de notes posées d'avance) rejoue à plein niveau. Aggravant : 0,49 s après ⏸, Pouce bleu non coupé.
- Correction : à la pause `POUCE_JEU.niveau(0)` (constante 0,012 s) ; dans musicTick `if(paused&&!MUSAP.joue)` niveau 0 ; à la reprise fondu normal.
- Confiance : moyenne-haute.

### SON2-N03 · MAJEUR · RECOMMENCER garde et rallume le morceau abandonné
- Où : mobile-tactile.js:400-402 (`busPlein`+`acReveil` puis ecranWipe → resetGame) ; musique.js:572-574 (`if(POUCE_JEU.joue())POUCE_JEU.course();else pbjDepart(...)`).
- Quoi : sous le volet, la musique de la partie abandonnée repart ; la nouvelle partie démarre sur le même morceau sans tirage ni fondu ; palier qui chute d'un coup.
- Correction : RECOMMENCER → `POUCE_JEU.fin(true)` avant le volet ; dans `musicStartRun(true)` sans reprise, si le morceau joue mais la course est neuve → `pbjDepart(true,false)`. Vérifier le chemin desktop (desktop-banc.js:43).
- Confiance : haute (même morceau sans fondu), moyenne (audible sous le volet).

### SON2-N04 · MINEUR · JOUER pendant le chargement du lobby : course muette puis autre morceau
- Où : garage-lacher.js:47 (`pbjDepart()`), musique.js:574, pouce-bleu-jeu.js:182-186. `joue()` faux en phase `charge` → second `PB.depart` annule le premier.
- Correction : `else if(POUCE_JEU.phase==='charge')POUCE_JEU.veutVite=true;`.
- Confiance : moyenne.

### SON2-N05 · MINEUR · Boutique : couche « air » commentée, nœuds jamais libérés
- Où : boutique-scene-1.js:122 (bqSon), :146 (bqSonCoupe). Le branchement `ah.connect(al);al.connect(ag);ag.connect(g);air.start();` est tombé dans un commentaire `//` ; à la sortie `n.air.stop()` jette (stop sans start), le catch saute `n.g.disconnect()`/`n.eg.disconnect()` : boucle d'écho (délai rebouclé .35) qui reste branchée sur MASTER à chaque visite.
- Correction : remettre le branchement hors du commentaire ; chaque `stop()` dans son propre try.
- Confiance : haute.

### SON2-N06 · MINEUR · La tonalité des effets suit un morceau périmé (`sonTonSuit`, console-son.js:87-90 : ne regarde pas `el.paused`). Correction : `&& !el.paused`. Confiance : haute mécanisme, basse audible.

### SON2-N07 · MINEUR · Les morts échappent au filtre d'eau et à BUSOUT (console-son.js:192 sampleWA → MASTER._vol ; jade-eau.js:196). Confiance : moyenne.

À vérifier : `menuApres` (+1,4 s) pendant le lâcher d'un REJOUER (rare) ; clic à chaque palier (`engSetTier` remplace `engShaper.curve`) ; `setInterval(suivant,7850)` de la nappe de l'intro continue après `iAC.close()` (erreurs avalées).

## Non vérifié
Aucune écoute ; non lus ligne à ligne : musique-bus.js, musique-paliers.js, générateur `musique-trente*`, pages direct/*.html ; seconde-chance.js 1-340 et final-spin.js par grep ; RECOMMENCER desktop ; saturation réelle au limiteur.
