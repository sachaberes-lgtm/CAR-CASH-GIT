# LE POUF AÉRIEN — la démo

Demande de Sacha (13/11/2026) : « une animation ultra belle et ultra optimisée, qui ne prenne aucune ressource sur téléphone, quand tu traverses
un nuage dans la map nuage : un pouf avec les petits cubes qu'il y a dans l'air qui sortent ; très aérien ».

- Le code de l'effet vit dans le jeu : `code/maps/nuages-pouf-gpu.js` (entre les marques `/*<pouf-gpu>*/` … `/*</pouf-gpu>*/`).
- `node outils/pouf-nuage/fabrique.cjs` recopie ce code TEL QUEL dans `demo.html` (modèle : `demo-modele.html`, lumière de la ouate relevée en jeu : `lum.json`).
- Servir la racine du dépôt sans cache : `python3 outils/pouf-nuage/serveur.py 8961` → `http://localhost:8961/outils/pouf-nuage/demo.html`
  (et le jeu : `http://localhost:8961/VERSION%20PRINCIPALE/index.html?carte=nuages`).
- Démo : LENT / NORMAL / RAPIDE, RALENTI (×4), POUF (un pouf à la demande) ; un mouton sur la route tous les 520 m.
  `?gel=1` : plus rien ne bouge seul — `demoPas(n)` avance de n images, `demoTir()` lance un pouf (banc image par image).
- En jeu : `dbgPoufGpu()` (état), `dbgPoufGpu(1)` (un pouf à la caisse), `dbgPoufGpu('lum')` (la lumière, pour `lum.json`), `?poufgpu=0` (l'ancien anneau).
