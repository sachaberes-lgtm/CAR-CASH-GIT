CONTRÔLE ADVERSE, lot 2 « programmes en double » (worktree ~/cash-car/qualite-programmes, branche qa/programmes, c65b8ccbf). J'ai seulement lu le code, sans navigateur.

**Ce que contient le diff (`git diff qualite-appareil...HEAD`)**
Trois fichiers, tous dans le lot :
- `outils/banc-demarrage/programmes.cjs`
- `passation/qualite/programmes.md`
- `passation/qualite/programmes-tableau.md`

Aucun fichier du jeu n'est touché. Ni `index.html`, ni `sw.js`, ni `vendor/` ne sont dans le commit, et rien de `maps/` ou d'`economie/`. Le site, l'app et les mises à jour en direct ne changent donc pas avec ce commit. L'outil lance Chrome avec `--mute-audio` et une sauvegarde où le son est coupé.

**Trois jumeaux vérifiés dans le code : tous confirmés**
1. **#12 / #44.** `voitures/buildcar.js:399` et `gameplay/impact.js:317-318` : les deux sont des MeshBasic avec une texture, transparents, en addition et sans brume. Seul `impact` a `side:DoubleSide`. C'est bien un jumeau INERTE par `DOUBLE_SIDED`.
2. **#46 / #69.** `gameplay/zones-caisses.js:196-197` et `maps/nuages-coton.js:74-76` : même `nuageShader`, seule la clé propre diffère (`nuageCaisse` / `nuageV2`). `nuageShader` ne lit que des uniformes partagés et des constantes. Comme three r128 rappelle `onBeforeCompile` pour chaque matériau avant `acquireProgram`, partager la clé est sûr. Le correctif 4 tient.
3. **#52 / #55.** `voitures/echappements.js:346` (`lpMat`, `vertexColors:true`). Le motif `vertexAlphas:!0===r.vertexColors&&x.geometry&&…` est bien dans `vendor/three.min.js` : il rend `undefined` sans attribut couleur et `false` sinon. Le correctif 3 (`!!(…)`) est sûr et ne change aucune image.

**Défauts sérieux** (dans les correctifs proposés, rien n'est codé)
- **S1. Le drapeau `TEL_NATIF` proposé pour le correctif 2 changerait le site sur téléphone.**
  - `code/rendu/soleil-planete.js:417-418` : `TEL_NATIF` vaut vrai sur tout écran tactile, donc aussi Safari mobile sur Vercel.
  - Or `passation/qualite/PLAN.md:22` dit : hors profil, Safari compris, « RIEN ne change ».
  - Il faut se régler sur `PRF.on` ou sur `Capacitor.isNativePlatform()`, et lire ce drapeau au moment de l'appel (c'est un `const` du script du jeu, chargé après three).
- **S2. Correctif 1 : le filtre tel qu'il est décrit retirerait des matières encore dessinées dans deux cas.**
  - `rendu/triptyque-bloom.js:381` : la passe verticale de l'étage 0 utilise `_pv[0]` seulement si `W2_POST` (l.54, WebGL2). Sinon elle dessine `separableBlurMaterials[0]`, qu'on ne peut donc écarter que si `p._pv` existe.
  - Si `bloomPlieMat` échoue (l.442, `p.plie=false`), le chemin d'origine revient : highPass, composite et copy servent de nouveau.
  - Le filtre doit donc tester l'état réel (`p._p0`, `p._pv`, `p._cMat`, `p.nMips===5`), pas seulement les drapeaux `fuse`, `plie` et `plie2d`.
  - Sinon il n'y a pas de casse visible, mais la matière se compile à son premier dessin : c'est le gel que la liaison douce devait éviter.

**Défauts mineurs**
- **m1. Le total de 20 compte un programme deux fois.**
  - Le #84 (`basic` du halo) est retiré par le correctif 1, et il compte aussi dans le groupe de 3 réunis par le correctif 2 (#84/#153/#155, 2 évités).
  - Les deux ensemble donnent 19 au plus (165 → ~146).
- **m2. Le décompte des jumeaux se chevauche.**
  - INERTES englobe EXACT : #46/#69 est listé dans les deux (tableau l.78 et l.150), et #84/#155 aussi (l.90 et l.142).
  - « 3 EXACT + 13 INERTES » ne fait donc pas 16 programmes en trop.
- **m3. La simulation du correctif 2 est plus prudente que le correctif décrit.**
  - Elle exclut les shaders dont le corps cite des lumières ou des ombres (`directionalLights`, `getShadow`, etc., `programmes.cjs:305`). Le correctif proposé pour three, lui, met tout à 0 pour tout ShaderMaterial `lights:false`.
  - Aujourd'hui aucun shader ne pose problème : seuls des Lambert avec `onBeforeCompile` (cryptocity, ville-v3, ville-verre) citent `USE_SHADOWMAP` ou `NUM_DIR_LIGHTS`, et ils sont exclus. Mais la règle n'est pas la même : il faudrait le dire, ou exclure les ShaderMaterial personnalisés.
  - La simulation remet aussi `flipSided` à faux (l.310), alors que le rapport dit de le garder (programmes.md:56).
- **m4. Le correctif 1 changerait aussi l'ordinateur.**
  - La partie « 5 matières d'origine + `_p2` » ne dépend pas du téléphone : l'ordinateur compilerait moins.
  - L'image reste la même, mais la consigne dit que l'ordinateur ne change pas. Il faut le borner à `PRF.on`, ou l'assumer et le dire.
- **m5. Le correctif 2 change aussi des programmes des maps** (nuages-embellie #0/#66, orbite-2 #24) sans toucher `maps/`. À dire clairement à Sacha.
- **m6. `--relire` n'avertit pas.** Si `index.html` ne correspond plus aux morceaux (après le `git checkout` exigé), les piles sont ramenées à de mauvaises lignes en silence. L'avertissement de `K.egal` n'existe que si Chrome tourne (`programmes.cjs:209-211`).
- **m7. La sonde ralentit le relevé.** Elle enveloppe `Object.defineProperty` partout et capture une pile de 60 cadres par matériau (1 572 matériaux), alors que le commentaire dit qu'elle « ne change aucun comportement ». Les instants et les phases (serpent / film) sont faussés. Les comptes, eux, restent justes.

**Doutes**
- Le gain du correctif 1 n'existe que si l'iPhone a l'extension `KHR_parallel_shader_compile`. Sans elle, `lierPasses` ne tourne jamais et ces 9 programmes ne sont même pas dans les 165 de l'iPhone. Le rapport le signale ; `dbgLier().ext` à lire sur le 13 Pro.
- Quand les programmes se lient en parallèle, retirer un programme ne fait sans doute pas gagner 0,10-0,15 s. Ce chiffre vient de la chauffe entière (26 s / 176).
- Classe 1 : les étages 4 de `_pv` et `sep` sont bien hors de portée par défaut (`bloomNM`, triptyque-bloom.js:15 : N2 → 4). Mais `dbgImg({mips:5})` (nettete-qualite.js:124) les redemande, et ils se compileraient alors à leur premier dessin. C'est acceptable, l'outil est réservé au banc.
- Le relevé vient de Chrome et non de WebKit (le rapport le dit).

**VERDICT : fusionnable** pour ce que le commit contient (outil + rapport, zéro fichier du jeu, aucun risque pour le site, l'app ou les mises à jour en direct). Avant de coder les correctifs, il faut d'abord corriger le rapport : S1 (drapeau), S2 (conditions du filtre du halo) et m1 (total à 19).