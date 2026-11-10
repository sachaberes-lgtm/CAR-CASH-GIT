# Le kit du nitro pour Claude Fable

Tout est dans **`passation/NITRO-POUR-FABLE.md`** (à lire en premier : la mission, les mots de Sacha, l'état, les critères, les pistes, les règles).

| | |
|---|---|
| `verifier.cjs` | la vérification en une commande : `node verifier.cjs --png` (spectrogrammes dans `sortie/`), `--tous`, `--reference` |
| `reference.json` | l'état de départ mesuré (à ne réécrire que quand Sacha a validé à l'oreille) |
| `BRANCHEMENT-JEU.txt` | le plan pour brancher le nitro dans le jeu, prêt et pas posé |
| `../../moteur-moderne-nitro.html` | la page d'écoute (celle de Léo + le nitro) : http://localhost:8138/moteur-moderne-nitro.html |

## 2e tour (10/11, Claude Fable)
- `banc.cjs` : accrochage strict, pulsation, niveau des couches, gestes, coût allumé / éteint (`--v1 autre-version.js` pour comparer, `--P '{…}'` pour essayer un réglage).
- `banc-details.cjs` : les détails de conduite geste par geste.
- En jeu : `node outils/banc-son/nitro-physique.cjs` (depuis la racine du dépôt).
- Tout est raconté dans `passation/NITRO-POUR-FABLE.md` §13.
