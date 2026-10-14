# Relecture indépendante de la session SON (lecture seule, aucun navigateur)

Fichier relu : `integ/VERSION PRINCIPALE/index.html` à HEAD = `0bf046b` (le HEAD a avancé pendant la relecture : les 4 derniers commits Son —
affiches, poursuite, pluie ×2 — ont été relus aussi). Base `4007550`. Les 36 commits `Son ·` ont été lus un par un (diff complet), puis le
code résultant relu en contexte (les lignes ci-dessous sont celles de HEAD).
Outils (dans `son/banc/relecture/`) : `scope.cjs` (acorn + eslint-scope : identifiants non résolus, zone morte au chargement),
`early.cjs` (références textuellement avant la déclaration), `constw.cjs` (écriture dans un `const`), `moteur.cjs` (le bloc `<<<SON-MOTEUR>>>` du jeu
exécuté tel quel : 51 840 combinaisons régime/charge/nitro/ovr/drift/respiration × 30 moteurs × genou allumé/éteint), `tables.cjs` (tables d'échelles).
`node syntaxe.cjs` : 14 scripts, 0 erreur de syntaxe.

## DÉFAUTS CONFIRMÉS

### 1. [gêne] Musique iPhone muette au lancement quand SON est coupé et MUSIQUE allumée (iOS 17+, MUS_WA)
- Où : `initAudio` ligne 34403 `if(!SND.sfx)try{AC.suspend();}` PUIS, ~20 lignes plus bas, `if(MUS_WA.on)musWaBranche()` (l. ~34425) → `musWaSon()` (l. 32925) → `musWaReveil()` (l. 32920).
  Commit : ce81651 (« musique iPhone par WebAudio »).
- Scénario : joueur qui a coupé SON (réglage conservé) mais gardé MUSIQUE. Au 1er geste `initAudio` crée le contexte et appelle `suspend()` ; juste
  après, `musWaBranche()` branche la musique et `musWaReveil()` lit `AC.state` : `suspend()` est asynchrone, l'état est encore `'running'`, donc
  `musWaReveil` ressort sans rien faire. Le contexte passe ensuite à `suspended` avec la musique branchée dedans = silence. Elle ne revient qu'au
  toucher suivant (`musicDeverrouille` / `audioKick` : `resume()` dans un geste) ; si `musicJoue` relance la musique hors geste (fin d'intro), le
  `resume()` peut être refusé par iOS. Effet : le lobby démarre muet jusqu'au 2e toucher. Pas de crash, pas de condamnation (le chien de garde exige `running`).
- Correctif en une ligne : `if(!SND.sfx&&!MUS_WA.on)try{AC.suspend();}catch(e){}` (avec MUS_WA, c'est `musWaSon` qui ferme les effets par `_limIn`).

### 2. [mineur, perf] `musTrim()` relit `musicEl.src` deux fois par image
- Où : `musTrim` l. 32867, appelée par `musVol()` depuis `musicTick` (1×/image) et `distTick` (1×/image) ; commit 3b5cc49.
- Le getter `HTMLMediaElement.src` résout l'URL et rend une chaîne neuve à chaque appel : petite allocation répétée 120×/s à 60 i/s, sur le chemin chaud. À mesurer sur iPhone, vraisemblablement négligeable.
- Correctif : poser `musTrim._s` / `_g` dans `playMusic` (là où `el.src` change) au lieu de comparer la chaîne à chaque image.

### 3. [mineur] Repli « ancien son » joué EN PLUS quand `sfx()` rend null pour cause de délai minimal
- Où : `afficheTap` l. ~42390 : `if(!(SONV2&&sfx('ui.ok')))` → deux `chimeNote` ; `ui.ok` a `cd` 0,15 s. Commit 810eee4.
  Même motif (inoffensif) dans `impactSnd` (`debris.tole`, cd 0,08 s pour un appel toutes les 0,13 s : ne se déclenche pas en pratique).
- Scénario : deux touchers d'affiche à moins de 0,15 s → le 2e fait sonner les deux cloches fixes que le commit voulait supprimer.
- Correctif : tester `window.CCSON.existe('ui.ok')` (comme `son()`), pas le retour de `sfx()`.

### Hors SON (déjà connu de l'intégrateur : `indef-ref-integ.json`), à ne pas oublier avant la sortie
- `eauPTick` l. 15952 : `let n=0;const M9=…,dr=…,cp=…` est avalé par un `//` (commit 9522ba6 « Passe mobile », présent dès la base `4007550`).
  Dès qu'il y a une goutte de mer (`EAUP.L` non vide : plongeon, ricochet, sortie de l'eau du SOLEIL DE JADE), `dr` / `cp` / `n` lèvent une ReferenceError ;
  `jadeSousTick` (appelé sous `try` avec `loopWarn`) s'arrête là, donc `eauRideTick`, `eauCouronneTick`, `sillonTick`, `eauBTick`, `lensTick` ne tournent plus
  pendant les éclaboussures. Les nouveaux sons de mer de SON (3591f56) ne sont pas touchés. Correctif : remettre `let n=0;const M9=JCH_M,dr=Math.exp(-.5*dt),cp=camera.position;` sur sa propre ligne.

## ÉCARTÉ APRÈS VÉRIFICATION

- Zone morte au chargement : `SON_VOL_VERROU`, `MUS_SONIE`, `MUS_WA` (var + fonctions hoistées), `MUSJ`, `SVOL`, `JETN`, `ENG_DOUX/ENG_GENOU`, `SON_UI`, `GSON9`, `FIN_SONS`, `SON_P_AR`, `SON_ECH_AR`, `SON_FRUIT_ST`, `SON_FR_D/R/C` : aucune lecture avant déclaration au chargement (seules références antérieures : `musicSuitLieu`→`MUSJ` et `sonTonSuit`→`JMUS`, dans des fonctions appelées après le chargement).
- Identifiants non définis : aucun identifiant neuf de SON n'est non résolu (`scope.cjs`) ; aucun `const` réécrit.
- NaN/Infinity dans les gains moteur : 51 840 combinaisons × 30 moteurs, 0 valeur non finie (`engGenou`, `engSouffle`, `whineF/whineG`, `fF0/fF`). `stt` ne laisse de toute façon pas un NaN dans un AudioParam (`setTargetAtTime(NaN)` lève avant d'écrire).
- `el.volume` > 1 : les quatre écritures de la musique sont bornées à 1 (musicJoue, musicStop, musicTick, tape-stop) ; `d.v` de `DEATH_LIB` ≤ 0,95 × `sfxVol()` ≤ 1. Seul le gain WebAudio monte à 1,41 (`MUS_WA.MAX`), c'est voulu.
- `setTargetAtTime` direct à chaque image : tout passe par `stt` (moteur via `engApplique`, JETN, SVOL, pluie, gain MUS_WA) ; la respiration ±0,7 % ne dépasse la garde de `stt` (0,2 %) que quelques fois par seconde.
- Tables hors bornes : `SON_P_AR[(k9-11)%10]`, `SON_ECH_AR[(i-10)%8]` (i ≥ 10), `SON_FRUIT_ST` (i ≥ 4 → indices 2/3), `sonUiSt` : balayage 2 000 combos / 5 000 degrés, 0 `undefined`, maximum +21 demi-tons (`tables.cjs`).
- `blip` : la quinte à t:+0,03 s ne fait pas avaler la pièce par le délai `cd` 0,018 s de `CCSON.play` (comparaison sur `t0` : 0,03 > 0,018) ; `blip._t` ne survit pas à autre chose qu'un horodatage.
- Options de `sfx` utilisées (`pan`, `t`, `rate`, `st`, `vol`) : toutes lues par `sfx.js` ; les ids ajoutés (`nitro.sec`, `dauphin.banc`, `victoire`, `debris.tole`, `ui.ok`, `aura.x5`, `fig.snake`, etc.) existent dans la banque ; les trois absents voulus (`caisse.atchoum`, `singe.troupe`, `aura.moyenne`) retombent bien sur les remplaçants.
- Fondu de GLISSE (`JMUS.tS`) : timer annulé dès que `jadeMusVeut()` redevient vrai ; à son tir il revérifie `!jadeMusVeut()` ; un tir après un `jadeMusGeste` retombe sur le `start()` du tick (auto-guérison) ; `setVolume(0)` du module est une rampe (τ 0,1 s), 480 ms = −42 dB avant le `suspend()`.
- Fondu radio→GLISSE (`MUSJ`) : un seul point d'appel (`musicSuitLieu` ← `newTrack`), remis à 0 par `musicStartRun`, `musicStop`, et dans le tick dès que `musicMode!=='run'`, `!jadeMusOn()` ou `!musicOn` ; pas de rappel répété qui repousserait la fin.
- États qui survivent : `SVOL.t/k` remis à 0 par `respawn`, `newTrack`, `resetGame`, `startFall` (et `k` retombe tout seul) ; `GSON9` remis à faux au début de chaque geste qui le lit ; `SON_UI` borné par le temps ; `pluieG` mis à 0 par `endGame` et par la pause (`_s9` vidé) ; `finSonsCoupe` seulement si `gameOver`.
- MUS_WA : gardes `musWaTient()` partout (faux tant que rien n'est branché → chemin `<audio>` d'avant intact hors iOS 17+) ; `MUS_WA.g` jamais lu avant `br=true` ; `musWaCondamne` débranche tout avant `br=false` ; le chien de garde ne juge que si l'élément joue, n'est pas muet, la page est visible, le contexte tourne, le volume voulu > .05 et le temps avance ; `getFloatTimeDomainData` exigé à l'allumage ; l'analyseur sans sortie est tiré d'office par WebKit/Chrome. Reste un risque que seul un iPhone tranche (voir `muswa.md`), pas un défaut de code.
- Retrait de Poki par un autre agent : `musWaReveil`/`pkMuet`/`g9` n'ont plus `CC_PUB`/`CC_MUET` ; plus aucune référence orpheline (`CC_PUB` : 0 occurrence).
- `toast(h,muet)` : aucun appelant existant ne passait déjà un 2e argument ; la cérémonie du changement de rapport (`_shT/_shR`) : accolades et `else if(engGear>1…)` toujours appariés ; la pluie (`pluieG`) : porte, `dbgVu` (9 noms), `endGame`, pause, `dk`/`JEAU.k`/`cloudInS` en portée.
- Allocation par image : rien de neuf dans les chemins de boucle (`engSouffle`, `JETN`, `SVOL`, `musWaGarde` à tampon créé une fois) ; les littéraux `{st:…,vol:…}` de `blip`/`uiClic`/`froleSnd` sont par événement, pas par image.
- Fusions : chaque ligne ajoutée par les commits Son se retrouve dans HEAD (les seules absentes sont des états intermédiaires remplacés par un commit Son suivant ou les lignes Poki retirées par un autre agent).
