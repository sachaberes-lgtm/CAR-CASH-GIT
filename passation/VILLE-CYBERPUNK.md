# VILLE CYBERPUNK — la route et la ville se mélangent (nuit du 2026-11-18)

Demande de Sacha : « on a l'impression que la route fait son chemin et qu'autour il y a des immeubles qui ont été générés » ; il veut que « la ville et la
route se mélangent », le sentiment de VISITER une ville, unique à chaque passage. Inspiration cyberpunk (le piqué du Cinquième Élément, Coruscant) : l'ambiance, rien de copié.

Branche `claude/ville-cyberpunk-063e59`, partie de `qualite-appareil` (a42e9ec50). **Rien sur main, rien dans `qualite-appareil`, aucun build, le vrai téléphone n'a rien vu.**
`VERSION PRINCIPALE/index.html` et `sw.js` ne sont pas commités : réassembler (`node code/assembler.cjs --depuis-morceaux`) et incrémenter le cache à la fusion.

## 0. Le plan (écrit avant de coder, 02 h 40)

Ce qui existe déjà (lu dans `code/maps/ville-scenes.js`, `ville-entree.js`) : la route de la ville est une phrase de SCÈNES (traversée, passerelle, façade, phare,
crête, portes, plongée, slalom et épingle des géantes) ; chaque scène dépose des ANCRES (`FILETMARK`), `vsReserve` réserve leur emprise AVANT les tours ordinaires
(qui, elles, restent à 24 m du bord de la dalle), `vsBatir` pose leurs volumes APRÈS, dans les familles de volumes existantes (0 appel de dessin en plus).
Le constat de Sacha s'explique : hors scène, la ville est une trame de tours tenue à 24 m de la route ; les scènes sont rares (4-5 par route), larges
(virages à 2,2-3 rP autour d'UNE tour) et leur tirage est un squelette (entrée → paquet → raccourci → grand moment, choisis par `graine % 4`).

Périmètre : la carte `ville` seulement (ni Crypto City ni la vitrée, qui partagent `genCtrl1` : leurs empreintes doivent rester identiques — décision à confirmer par Sacha).

| Lot | Quoi | Interrupteur (rend l'avant au bit près) |
|---|---|---|
| A | LES MODULES ROUTE-VILLE : le slalom des tours (les tours dans la ligne de mire, on les évite au dernier moment), le piqué (bascule d'un coup, plongée à 30-40° entre deux murs de tours à travers des nappes de circulation, ressource au ras de la rue), les montagnes russes des toits (crêtes au ras des toits, creux entre les tours), la tranchée (long S au fond d'un canyon de façades à 14 m) | `?sans=villecyber` |
| B | L'IMMEUBLE QU'ON TRAVERSE refait : approche (on le voit de loin, dans l'axe, la bouche lisible), forme (un vrai immeuble posé, plus une tour qui flotte), intégration (entrée et sortie) | `?sans=villehall` |
| C | LES CADRES DE NÉON (« portails ») retirés le 14/11 (`VILLE_SANS_CADRES`) : de retour à certains moments seulement, tirés par partie | `?sans=villecadres` |
| U | LE TIRAGE UNIQUE : le sac à mémoire des routes uniques (`route-uniques.js`) appliqué à la ville — plus de squelette, chaque suite de modules jouée une fois | `?sans=villeuniques` |
| D | FINITION DES IMMEUBLES (ensuite seulement) : le plus beau et le plus léger possible, comptes `renderer.info` ≤ avant en `?tel=1` | `?sans=villefinition` |

Méthode : un lot = un auteur + un contrôle adverse qui EXÉCUTE (banc Node des vrais générateurs, puis Chrome sous verrou) ; seul un lot FUSIONNABLE entre sur la branche.
Empreintes de référence (`node outils/banc-routes/empreinte.cjs graines=1-12`, a42e9ec50) : ville p0 `d63b36e2af8b` p10 `fb378a8c6756` ; crypto `5447610bd8f2` / `eae97981f833` ;
nuages `469d52aff855` / `2e1661d8fe93` ; espace `9c99fae61d38` / `ea2d9e750351`.

## 0 bis. Le jury de conception (03 h 10) — À LIRE par tout auteur, contrôleur ou correcteur d'un lot

Synthèse et propositions : `passation/ville-cyber/JURY.md`. Ce qui s'applique tout de suite :
- **Lot A** (critique du jury, à vérifier au contrôle) : un module neuf inscrit dans `VS.scenes` change AUSSI Crypto City (`MCJ` de crypto) → l'inscrire hors de `VS.scenes`, gardé `MC==='ville'` ;
  le slalom ne pose ses tours que côté INTÉRIEUR des arcs (en vol la caisse part sur la tangente), jamais dans un AIRZ ni sur une lèvre de raccourci ; la crête du piqué et celles
  des montagnes russes LANCENT la caisse dès que le rayon vertical est sous v²/g : cône `FILETMARK.air` et piste de réception dans l'axe, dévers `nul`, ressource ≥ 3 rP ;
  la tranchée : un vol droit sort du S en ~1,5 s → R ≥ 4 rP ou preuve au simulateur de vol mains libres ; chaque module a son entrée dans `LONG`.
- **Lot U** (tirage unique) : cahier des charges au § (2) de la synthèse. **Lot A2** : l'étage qui change, la corde et la fenêtre, les murs d'avenue (§ 3), après une mesure du « 1er rang édenté » (`jade-balade.js`, `tourLibre`).

## 0 ter. Changement de cap (19/11, Sacha réveillé) — LA VILLE DU 3/11 EST LA RÉFÉRENCE

Sacha a revu la ville du commit `aa160d07f` (3/11) : « c'est exactement celle-là […] des sortes de tunnels formés d'immeubles chelous, ultra conceptuels […] tu reprends la
structure de cette ville-là et tu y ajoutes les modules et les trucs en plus ». Enquête (route, décor) et plan contrôlé : `passation/ville-cyber/ANCIENNE-VILLE.md`.
En bref : la route descendait fort et sans montée (≈ 17 % au banc contre 10 %), tournait plus (4,8 tours contre 3,1) et revenait le long d'elle-même, plus haut de ~190 m ;
`tourLibre` relevait le pied des tours du dessus, `villePied` le fondait dans la brume violette. Défait surtout par 5188a4d21 (7/11), e1c64a63e (8/11) et les scènes du 13/11.
Plan : socle = lots A, B, C ; puis lot E (la route à étages, `?sans=villeetages` rend le socle au bit près, carte ville seule) ; puis lot D (tours pendues, fondu violet).
Choix pris sans attendre (à confirmer par Sacha) : la spirale du parking revient SERRÉE comme au 3/11 (CONFIRMÉ par Sacha le 19/11 : « 3 novembre ») ; les sauts et raccourcis restent ; pas de portage `?ville=0311`
(l'étalon est l'archive d'aa160d07f, servie à part pour les photos et mesurée au banc Node de l'enquête).
