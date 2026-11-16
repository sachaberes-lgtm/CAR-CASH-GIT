# Banc du creusement de la grotte (grotte-vite, 13/11)

Rejoue le travailleur du creusement HORS du navigateur, sous Node (V8) et sous **JavaScriptCore** (`jsc`, le moteur de Safari et de l'iPhone, livré avec macOS).

- `captures/<nom>.json` : le message réellement envoyé au travailleur (route échantillonnée, bornes), capturé au banc navigateur
  (`Worker.prototype.postMessage` détourné, envoi à un petit serveur local). `captures/travailleur.js` : le code du travailleur capturé (avant ce chantier : générateurs).
- `node fabrique.cjs [sortie.js] [--generateurs]` : fabrique le code du travailleur depuis la SOURCE courante (`code/maps/grott*.js` + la déclaration `const code=` de
  `grotte-travailleur.js`), aplati comme `grwPlat` (ou non, `--generateurs`). Défaut : `courant.js`.
- `node creuse.mjs [code.js] [capture.json…]` : temps (min, médiane sur `REP`, défaut 3), étapes (`et`) et **empreinte de la grille** rendue (P, D, SI, SD, dir, cle, chS, nAir).
- `jsc creuse-jsc.js -- code.js capture.json [rep]` (jsc = `/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc`) : la même chose sous JSC.

Deux codes donnent la même grotte si l'empreinte est la même. Le Mac est souvent chargé (`uptime`) : comparer des minimums, ou des comptes.
