# Banc du parcours de la boutique (lot « boutiquefluide », 21/11)

Chrome sans fenêtre et muet (`--mute-audio`, sfx/mus/vox à false dans `cashcarSave`), iPhone 13 Pro émulé (844×390, DPR 3, tactile, `?tel=1&appareil=iPhone14,2`),
processeur ×4 pendant tout le parcours. Index « gravé » à la volée (`CC_BUILD`/`CC_PHOTOS` = `banc-bf`) : les photos sont GARDÉES d'un chargement à l'autre
(IndexedDB), comme dans l'app ; `--grave 0` = la copie locale (rien gardé) ; `--froid 1` = la base des photos vidée avant chaque essai (le 1er lancement après une mise à jour).

```
sh outils/banc-boutiquefluide/passe.sh <sortie> <profils> "avec,sans,avec,sans" [--photo 1] [--course 1] [--egal 1] [--profils 1]
node outils/banc-boutiquefluide/resume.cjs <sortie>... --sauf 1         # médianes [min-max] par étape, avec / sans ; --sauf : essais écartés (le 1er remplit la base)
sh outils/banc-boutiquefluide/sous-verrou.sh node outils/banc-boutiquefluide/trace.cjs --essai avec --out <dossier>   # trace : styles, mises en page, piles
python3 outils/banc-boutiquefluide/planche.py <dossier des captures> <planche.png>                              # avant / après, même écran, écart pixel
```

- **Parcours** (`parcours.cjs`) : menu au repos → BOUTIQUE (`#gShopBas`) → les six rayons → 4 lancers aller + 4 retour de la bande (VOITURES puis PEINTURES) →
  trois articles → un ACHAT en pièces (la 1re caisse « ACHETER € … ») → ÉQUIPER → retour → 2e ouverture → retour. Par étape : pire image, images > 50 / > 100 ms,
  temps perdu (somme des dépassements de 16,7 ms), style / mise en page / script (Performance.getMetrics), profileur à 250 µs (fonctions et causes de la pire image).
- Tous les essais d'une passe tournent dans le MÊME Chrome (la page rechargée entre deux) : le 1er remplit la base des photos, il est à écarter (`--sauf 1`).
- Une passe ≤ 4 essais (~10 min) : le verrou commun reprend une place tenue plus de 15 min.
- `--course 1` : après le dernier essai, une course (`dbgJouer`) et une mort (`dbgDauphin('boom')`). Exceptions et `__loopErr` relevés à chaque essai.
- Crochets du lot : `dbgMotPre()` (les motifs préparés), `dbgMotEgal()` (data: d'avant et blob: d'après : mêmes octets ?), `dbgEchMemo()` (les pots encastrés gardés).
- Le banc est Chrome + SwiftShader, pas WebKit ni le GPU de l'iPhone : les temps « hors JS » (composition, GPU) n'y sont pas ceux du téléphone.
