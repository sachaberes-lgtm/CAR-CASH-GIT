# LE FLOU DE VITESSE : passation (lot « flouvitesse », 19-20/11)

Branche `qa/flouvitesse` (fusionne `origin/qualite-appareil` 78b654f08), worktree `~/cash-car/lots-nuit/flouvitesse`. Interrupteur : `?sans=flouvitesse` = l'avant, bug compris.
Demande de Sacha (18/11) : « sur les côtés, quand on va vite, il y a un effet de flou […] Si c'est un bug, corrige-le. » Puis : « non pas de chantier en plus tu essaye de finir tes tache ».

## 2e manche (20/11) : la réparation du bug SEULE
La 1re manche (stries, prises pondérées, une prise de moins) a été refusée au contrôle (+0,5 ms par image au nitro, grouillement quand la caisse bouge) : **elle est retirée en entier**.
Il reste une ligne dans `code/rendu/triptyque-bloom.js` (juste avant `ACESShader.fragmentShader=flouFS(…)`).

### Le bug
« Voiles au tiers » (**3df790c92, 17/11**) a changé la déclaration `uniform float uSafe,uRn;` du shader final en `uniform float uSafe,uRn,uSfx;`. Deux retouches cherchaient l'ancienne
ligne et, ne la trouvant plus, ne touchaient à rien (leur règle « une ligne retouchée ailleurs ») : `FLOU_R` (le flou V2 du 10/11) et `NET_NITRO2` (le cœur des rubans net au nitro, 14/11).
Le shader compilait (aucune erreur) : c'est le flou qui était le MAUVAIS, pas un flou absent.
**Ce que Sacha voyait depuis le 17/11 :** l'ancien flou du 30/09 — dès la croisière rapide tout le tour de l'image bavait (bâtiments de la ville et nuages en bouillie, points lumineux étirés
en longs traits), au nitro presque tout l'écran sauf la caisse était flou et assombri sur les bords, et les traînées de lumière restaient floues au nitro.
**Réparation :** la ligne est coupée en deux (`uniform float uSfx;uniform float uSafe,uRn;`, même déclaration) : les deux retouches la retrouvent.

### Preuves (banc `outils/banc-flouvitesse/flou.cjs`, Chrome sans fenêtre muet sous verrou, iPhone 13 Pro émulé 844×390 DPR 3, `?tel=1&appareil=iPhone14,2`)
- **Le programme = celui d'avant le 17/11.** Le texte du shader final du lot, comparé à celui du jeu de `3df790c92^` (même banc) : identique, sauf les 3 lignes du voile `uSfx`
  (ajoutées le 17/11, présentes aussi dans l'avant ; aucune lecture de texture). Mêmes lectures et mêmes instructions que le flou d'origine. Vs l'avant buggé : le flou V1 → V2,
  et le cœur des rubans (`texelFetch`, sous `uRn2 > 0,5`) revient.
- **Compile, aucune erreur :** crypto et nuages, chaque page (avant et lot) : 0 erreur WebGL (`gl.getError`), 0 programme non lié, 0 exception ni erreur console sur une course
  (6 s croisière + 3 s nitro tenu ; uSpeed 0 → 0,2 en ~3 s, nitro 0,92-1), ni après les photos et la mesure (le programme d'avant reposé sur la même page compile aussi).
- **Planches avant/après** (gauche avant = bug, droite après ; nitro tenu en haut, croisière rapide uSpeed 0,2 en bas ; même image figée, le programme d'avant posé sur la même page) :
  `/private/tmp/claude-501/-Users-sachaberes-cash-car-qualite/f73d43a5-a4c1-4f2f-92ad-78d3cc403908/scratchpad/flou2/planches/planche-crypto.jpg` (ville)
  `/private/tmp/claude-501/-Users-sachaberes-cash-car-qualite/f73d43a5-a4c1-4f2f-92ad-78d3cc403908/scratchpad/flou2/planches/planche-nuages.jpg`
  (hors dépôt, peut être vidé ; PNG bruts dans `…/flou2/p2/`). Écart moyen avant/après : ville nitro ~14/255, ville croisière ~5 ; nuages nitro ~9, croisière ~2,5.
- **Coût, passe finale seule** (20 rendus par chronomètre, 24 tours entrelacés avant / lot / lot sans le cœur des rubans, l'ordre alterne, médianes ; Mac, autre banc possible en même temps) :

  | carte, effet | avant (ms) | lot | écart médian lot − avant | lot sans le cœur − avant |
  |---|---|---|---|---|
  | nuages, croisière .2 | 1,934 | 1,825 | +0,049 | +0,009 |
  | nuages, nitro 1 | 2,384 | 2,481 | +0,148 | −0,021 |
  | ville, croisière .2 | 1,830 | 1,838 | +0,101 | +0,024 |
  | ville, nitro .92 | 2,003 | 2,026 | −0,043 | +0,017 |
  | (1re passe ville) croisière / nitro | 3,348 / 3,407 | 3,086 / 3,536 | +0,03 / +0,17 | — |

  **Dit clairement :** le flou réparé seul (V2) coûte autant que le flou buggé (écart ±0,02 ms, dans le bruit). Le cœur des rubans, éteint par le bug, revient avec **une lecture de
  texture de plus par pixel flouté (7 au lieu de 6 au téléphone)** : la réparation coûte donc PLUS que l'état buggé, de l'ordre de **+0,05 à +0,15 ms par image** de la passe finale sur le Mac
  (≈ +3 à 6 %), pas toujours visible (une mesure à −0,04). C'est le coût d'avant le 17/11, pas un coût nouveau. Pour l'éviter : `?sans=netnitro2` (le cœur des rubans coupé, flou V2 gardé).

## Non vérifié
- Le vrai iPhone (ni image, ni temps). Le PC. Les autres cartes que ville et nuages. Les planches sont des images figées : le rendu en mouvement est à regarder.
- Au nitro, le flou V2 rendu est bien plus discret que ce que Sacha voit depuis le 17/11 (c'était le réglage du 10/11) : s'il trouve que « ça ne fait plus vite », c'est `uFv.y` (force) à monter, pas un bug.
