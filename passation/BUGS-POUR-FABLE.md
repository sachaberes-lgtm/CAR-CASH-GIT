# Bugs que je n'ai pas su régler (à confier à Fable)

Écrit pendant la chasse du 2026-11-08 (Sonnet 5.5). Règle : je n'écris ici que ce que j'ai VU, avec la preuve, et ce que j'ai essayé. Si une ligne dit « non résolu », je ne l'ai pas résolu.

## Corrigé dans cette chasse
- `HCAP is not defined` (génération de piste, `arc` / `enroul` dans `code/maps/ville-entree.js`) : introduit par e1c64a63 (v1333), le tableau n'était jamais déclaré. Chaque tracé de piste levait un ReferenceError, rattrapé en `console.warn` (« chargement · piste », « pré-bâti »). Corrigé : `const HCAP=[]` après `let P=…`. Preuve : le banc de course ne relève plus ces warnings.

## Non résolus

### 1. Erreurs WebGL dont je ne trouve pas l'appel
- Symptôme : en Chrome headless, la console finit par « WebGL: too many errors, no more errors will be reported » (32 erreurs). Au premier passage (avant le correctif HCAP, piste de secours) : `bufferSubData: srcOffset + length too large` et `Vertex buffer is not big enough for the draw call`. Après le correctif, seul « too many errors » reste visible : les 32 messages précédents ne sont pas livrés au banc.
- Essayé : une sonde (`outils/banc-course/fait-gl.cjs` → `course-gl.cjs`) qui enveloppe `drawArrays/drawElements/*Instanced/bufferSubData/bufferData/texImage2D` et appelle `getError()` derrière chaque appel. Résultat : zéro erreur attrapée dans le thread principal, alors que Chrome en compte 32.
- Hypothèses non vérifiées : l'erreur vient d'un `OffscreenCanvas` dans un Worker (il y en a dans `canyon-route.js`, `dunes-1.js`, `jade-singes-dauphins.js`, `nuages-v8.js`, `finition.js`, `silhouettes.js`), ou d'appels que mon enveloppe ne couvre pas (`vertexAttribPointer`, `copyBufferSubData`…), ou c'est un artefact de SwiftShader/headless et rien sur un vrai téléphone. Je ne sais pas laquelle.
- À faire : rejouer sur un vrai GPU (le banc `banc-garage-argent` passe par Chrome headless GPU via cdp.cjs) et envelopper aussi les Workers.

### 2. `genParis` n'existe nulle part
- `code/moteur/piste-prebati.js:95` appelle `genParis()` quand `pi==='paris'`. La fonction est introuvable dans tout le dépôt. Chemin du banc `dbgGenBilan1` seulement, et Paris est retiré du jeu (la sauvegarde l'accepte encore : `sauvegarde.js:72`, `carrSel.id`). Je ne l'ai pas touché : je ne sais pas si Paris doit revenir ou si le chemin doit être supprimé.

## À vérifier par un œil humain (je ne peux pas juger)
- Tout ce qui est « beau » ou « bien équilibré » : réglages de feeling, difficulté, rythme des pistes, contraste réel sur un écran de téléphone. Mes bancs mesurent des exceptions et des tailles, pas le plaisir de jeu.
