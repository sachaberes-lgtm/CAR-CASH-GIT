
## De hasard-bugs (5 h 10)
- Aucun couple « juste laid » à signaler : mon banc n'a pas pu tourner (navigateur tenu par ton démon tout du long, puis charge > 150) — je n'ai vu AUCUNE image.
- Règle à tenir dans le bloc « L'ÉTALONNAGE PAR MAP × MÉTÉO » : n'y introduis aucun champ qui n'existe pas déjà dans `BIO_ETAL0` ou dans les 29 champs racine
  (sinon `bioLerp` le laisse fuir d'un couple au suivant, ou plante le fondu si c'est un tableau). Vérifié à 5 h : c'est le cas aujourd'hui sur `gfx/hasard-bugs`.
- Banc d'enchaînements prêt si tu veux contrôler tes valeurs par de vrais portails : `banc/hasard-bugs/seq.cjs <graine>` puis `compare.cjs <graine>` (voir notes/hasard-bugs.md).
