# Bugs que je n'ai pas su régler (à confier à Fable)

Écrit pendant la chasse du 2026-11-08 (Sonnet 5.5). Règle : je n'écris ici que ce que j'ai VU, avec la preuve, et ce que j'ai essayé. Si une ligne dit « non résolu », je ne l'ai pas résolu.

## Corrigé dans cette chasse
- `HCAP is not defined` (génération de piste, `arc` / `enroul` dans `code/maps/ville-entree.js`) : introduit par e1c64a63 (v1333), le tableau n'était jamais déclaré. Chaque tracé de piste levait un ReferenceError, rattrapé en `console.warn` (« chargement · piste », « pré-bâti »). Corrigé : `const HCAP=[]` après `let P=…`. Preuve : le banc de course ne relève plus ces warnings.

- Jade : `bufferSubData: srcOffset + length too large` + `Vertex buffer is not big enough` (gouttes d'eau). Cause : `eauPIm` posait `im.count=0` AVANT `setColorAt(0,…)` ; three r128 dimensionne `instanceColor` sur `this.count` → tableau de 0 élément. Corrigé (`code/maps/jade-eau.js:34`). Preuve : la sonde `course-gl.cjs --map jade:matin` donnait 2 erreurs GL, maintenant `GLERR []`.
- Forêt : `DROIT` / `der` hors de portée de `fMod` (voir le commit).

## Non résolus

### 1. (partiellement résolu — voir plus haut pour Jade) Erreurs WebGL sur la map par défaut, appel introuvable
- Symptôme : en Chrome headless, la console finit par « WebGL: too many errors, no more errors will be reported » (32 erreurs). Au premier passage (avant le correctif HCAP, piste de secours) : `bufferSubData: srcOffset + length too large` et `Vertex buffer is not big enough for the draw call`. Après le correctif, seul « too many errors » reste visible : les 32 messages précédents ne sont pas livrés au banc.
- Essayé : une sonde (`outils/banc-course/fait-gl.cjs` → `course-gl.cjs`) qui enveloppe `drawArrays/drawElements/*Instanced/bufferSubData/bufferData/texImage2D` et appelle `getError()` derrière chaque appel. Résultat : zéro erreur attrapée dans le thread principal, alors que Chrome en compte 32.
- Hypothèses non vérifiées : l'erreur vient d'un `OffscreenCanvas` dans un Worker (il y en a dans `canyon-route.js`, `dunes-1.js`, `jade-singes-dauphins.js`, `nuages-v8.js`, `finition.js`, `silhouettes.js`), ou d'appels que mon enveloppe ne couvre pas (`vertexAttribPointer`, `copyBufferSubData`…), ou c'est un artefact de SwiftShader/headless et rien sur un vrai téléphone. Je ne sais pas laquelle.
- À faire : rejouer sur un vrai GPU (le banc `banc-garage-argent` passe par Chrome headless GPU via cdp.cjs) et envelopper aussi les Workers.
- **FAIT le 2026-11-10 (Fable), cause prouvée — voir `passation/GELS-SHADERS.md` § 5** : vraie puce, Workers attachés : 256 avertissements de performance de la relecture par tampon (`engLit`) puis « too many errors », aucune erreur GL (`getError()` = NO_ERROR, témoin positif), aucun Worker en cause ; sans la relecture, 0 message.

### 2. `genParis` n'existe nulle part
- `code/moteur/piste-prebati.js:95` appelle `genParis()` quand `pi==='paris'`. La fonction est introuvable dans tout le dépôt. Chemin du banc `dbgGenBilan1` seulement, et Paris est retiré du jeu (la sauvegarde l'accepte encore : `sauvegarde.js:72`, `carrSel.id`). Je ne l'ai pas touché : je ne sais pas si Paris doit revenir ou si le chemin doit être supprimé.

### 3. `outils/jour-test.cjs` : 8 cas KO sur 88 (primes de la série)
- Le test attend l'ancienne table de primes (25 · 40 · 55 · 70 · 85 · 100) et un cadeau « prêt » dès le départ ; le jeu paie maintenant des lots (`code/missions/aujourdhui.js:27`, 150 · 250 · jeton · 400 · 600 · jeton · peinture). Je ne sais pas si le test est périmé (probable) ou si une règle du cadeau/jour a régressé : à trancher avec la règle voulue par Sacha. Je n'ai pas touché au jeu pour ça. (`eco-debut-test.cjs` : périmé aussi, remis d'aplomb — 0 KO.)

### 4. L'avertissement « WebGL: too many errors » (nuages, espace, grotte) est un heisenbug
- **EXPLIQUÉ le 2026-11-09 (session de debugging, Opus 5.5) : ce n'est PAS une erreur GL.** Sonde de comptage (copie de `course.cjs` qui garde l'ORDRE des messages, `canyon:matin`, 2 courses) : 256 « performance warning: READ-usage buffer was written, then fenced… » (la relecture du moteur de l'écran de mort, `engLit`, `vignette-moteur.js`, = D3 ci-dessous), puis « too many errors » à l'index 271, et AUCUN autre message WebGL. Chrome n'affiche que 256 messages WebGL par contexte, et ces avertissements de performance comptent dans le même quota. La sonde GL disparaissait le symptôme parce qu'un `getError()` après chaque appel est un aller-retour synchrone : la barrière est résolue avant la réécriture du tampon, l'avertissement ne naît plus. Les « 32 erreurs » du point 1 sont la même chose. Conséquence pratique : après deux ou trois écrans de mort, une VRAIE erreur WebGL ne s'afficherait plus dans la console de Chrome. Le correctif (bufferData avant readPixels, 898faf5c) a été retiré exprès (e92ddd55, pas testé sur Metal) : à reprendre avec un essai sur iPhone.
- **Confirmé le 2026-11-10 sur vraie puce, par intervention (GELS-SHADERS.md § 5).**
- Reproductible sans sonde (2 courses sur 2 en nuages), absent dès que la sonde GL enveloppe TOUTES les méthodes du contexte et appelle getError() derrière chacune. Aucun des 32 messages n'est livré individuellement au banc. Piste : erreurs dans un contexte hors thread principal, ou erreurs asynchrones liées au timing. Non résolu.

### 5. Compteur « COLLECTE TOUTES LES VOITURES 1 / 23 » alors que le garage dit 52 caisses
- `m2Col('voiture').tot` exclut volontairement les caisses de mission et celles payées en euros (design documenté dans `defis-moteur.js:81-83`). Je le crois voulu, mais l'affichage peut surprendre : décision de Sacha.

### 6. Glacier : résidus après le correctif du tremplin (v1365)
- Graine 13, tremplin 4 (s≈3899) : tue encore le pilote auto à volant gelé (2/3 en midi) ; route en S après la lèvre (+19° puis −23°), non couvert par le nouveau garde. Graine 10, tremplin 0 (lip 1822) : tue à mains lâchées avant et après, autre mécanisme (flanc « raide .32 », vol de 2,5 s).
- Le seuil `BK_BEC.ecart`=79 m à 190 m est empirique (calé sur 47 tremplins) ; ~20 % des tremplins ont bougé de +30 à +200 m, l'effet sur la jouabilité (feel) n'a PAS été regardé à l'œil. `?sans=glaceecart` rend l'ancien garde. Le pilote `dbgAuto` garde le volant du décollage en vol : peut-être un artefact du banc (`dbgAuto(vol:1)`).

### 7. Franchissements de portail (audit de 206 passages, 201 franchis, 0 exception)
- **D1 gel de 3,3-3,9 s à la 1re entrée en jade/forêt, cache de shaders GPU vide** (joueur neuf, 1er portail) : ~22-31 programmes liés en synchrone en course (`getProgramInfoLog` 3,7 s ; `vignette-moteur.js:247-249`, `jade-vol.js:297`) ; la liaison parallèle (`compileDoux`) n'existe que hors course. Confié à un agent (branche `debug/chauffe`) : voir son résultat. Sur iPhone/Safari (pas de KHR_parallel_shader_compile) le coût réel n'est PAS mesuré. **Repris le 2026-11-10 (Fable) : le garde de course, branche `gels-shaders-2026-11-10`, voir `passation/GELS-SHADERS.md` — 0 attente de liaison en course, avec ou sans KHR ; D2 (banquise) couvert par le même garde mais pas mesuré à part.**
- **D2 banquise : 1,1-1,6 s à chaque 1re entrée, même à chaud** (+7 à +10 programmes à l'entrée, non préchauffée comme jade) ; cause non vérifiée.
- **D3 avertissement Chrome « READ-usage buffer was written, then fenced » ×127 après une mort** : `vignette-moteur.js:46-52` (PBO `engVigRender`) ; la ligne corrigée par 898faf5c ne suffit pas, l'avertissement persiste (sans effet visible).
- **L1 jade/nuit : le pilote auto reste en vol 60 s (jauge d'AIR pleine, se remplit dans l'eau, `jade-3.js:387,449`)** : à confirmer, un joueur peut-il planer sans fin loin du portail ?
- Mémoire : `renderer.info.memory.geometries` monte de ~25 par zone sur les chaînes A-B-A-B, fuite NON démontrée (la vitesse monte aussi).
- Non testé : iPhone/Safari/Metal, son, passage pendant l'explosion/seconde chance, parc Freestyle, jade balade, auto-école, pré-bâti pas fini au passage.

## À vérifier par un œil humain (je ne peux pas juger)
- Tout ce qui est « beau » ou « bien équilibré » : réglages de feeling, difficulté, rythme des pistes, contraste réel sur un écran de téléphone. Mes bancs mesurent des exceptions et des tailles, pas le plaisir de jeu.
