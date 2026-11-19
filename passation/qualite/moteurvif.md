# Lot « moteurvif » — le moteur vif de l'écran de mort ne casse plus (16/11)

Branche `qa/moteurvif` (worktree `~/cash-car/qualite-moteurvif`), partie de `qualite-appareil` d55bb3511.

## Le bug

Relevé sur l'iPhone (build 118) : `moteurvif | rendu : null is not an object (evaluating 'r.BYTES_PER_ELEMENT')` après une mort.

Cause, confirmée au banc :
- Les moteurs gardés (`ENG_PRET`) jettent leur copie JS au premier envoi à la puce (`engLeger` → `memLibere`). Téléphone seulement (`ALLEGE`).
- Ce rappel ne regarde pas QUEL renderer envoie.
- Le renderer principal dessine le moteur d'abord (premières fois du menu `premMoteurUn`, carte NOUVEAU MOTEUR).
- À la mort, le second renderer (toile vive, `ENG_VIVE.r`) doit envoyer ses propres tampons. Le tableau est `null` : exception.
- Alors `engViveRend` : retour à l'ancienne recopie saccadée (relecture GPU→CPU) pour TOUTE la session.

## Le correctif (`?sans=moteurvif2` = exactement l'avant)

Fichiers : `code/interface/vignette-moteur.js`, `code/rendu/ciel2.js` (une condition).

- `engLibereCb` remplace `memLibereCb` sur les moteurs gardés. Le drapeau `ENG_VIVE.up` marque les dessins du second renderer.
  La copie n'est jetée que quand LES DEUX renderers l'ont envoyée. Gain mémoire final identique.
- La file croisée : un moteur envoyé par un seul renderer entre dans une file. Au menu et à l'écran de mort (`engViveChauffe`), un moteur par image,
  l'autre renderer le dessine hors écran (second : tampon 1×1 ; principal : `engRT`). Seuls les moteurs déjà dessinés y entrent (pas les 30).
- Filet (`engVifPeut`) : un moteur dont un tableau manque sans envoi vif → cette mort prend l'ancien chemin, la session garde le moteur vif.
- `engVigRendRT` en try/finally : une exception ne laisse plus le renderer principal sur le tampon du moteur, fond noir.
- Second contexte en panne : `dispose` + `forceContextLoss`, et les copies qui l'attendaient sont jetées (`engVifBalaie`).
- Le motif de `?sans=moteurvif` ne prend plus `moteurvif2` (`moteurvif(?!2)`).

## Prouvé (banc `outils/banc-moteurvif/morts.cjs`, Chrome sans fenêtre, tel=1, 390×844, compteurs déterministes)

Clé de la reproduction : `--prem 1` (les premières fois des moteurs jouées par le renderer principal, comme au menu sur le téléphone).

| | avant (`?sans=moteurvif2`) | après |
|---|---|---|
| 1re mort | `ko`, « Cannot read properties of null (reading 'BYTES_PER_ELEMENT') », 0 image vive | 0 erreur, 135 images vives (≈30 i/s) |
| 10 morts | ancien chemin toute la session | 10/10 vives, 1384 images, `filet` 0, 0 note moteurvif |
| mémoire | 180 attributs jetés au menu | 180 jetés au menu (file croisée, `--attente 8`), 216 en fin : tous envoyés aux deux (`envoisVif` = `envoisPrinc` = `jetes` = 216) |

`--casse 2` (exception simulée au dessin vif) : `ko`, contexte rendu (`libre`), la mort suivante passe par l'ancien chemin, ses tableaux sont jetés (216).

## NON prouvé

- Le PC : le mode `--ordi 1` du banc ne charge pas en Chrome sans fenêtre (Mac chargé, `pret` faux en 5 min). Par lecture : `ALLEGE` faux →
  `engLeger` ne pose aucun rappel → file vide, `engVifPeut` vrai, `engVigRendRT` identique sans exception. Seul changement PC : sur une panne du
  second contexte, il est maintenant libéré (`dispose` + perte forcée).
- Le vrai iPhone (WebKit) : pas essayé.
- Erreur préexistante vue dans les deux cas : `stNote` « Cannot read properties of undefined (reading 'length') » (hors lot).

## À regarder sur le 13 Pro

1. Menu 15 s, une course avec montées de palier, mourir : le moteur tourne fluide sur la carte de mort.
2. Refaire 5-10 morts : toujours fluide. Boîte noire : aucune note `moteurvif | rendu`.
3. `dbgMoteurVif()` (si console) : `ko:false`, `filet:0`, `mem.jetes` proche de `mem.envoisVif`.
