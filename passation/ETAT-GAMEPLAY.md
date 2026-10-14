# ÉTAT — session GAMEPLAY (PC de Sacha) · 14/10/2026, ~17 h

## FAIT (branche `figures3`, poussée sur main par ce commit — voir JOURNAL « LES FIGURES v2 » et « L'ARGENT DU DÉBUT »)
- **FIGURES v2 — la physique** (`figures.js` v2 : `FIG.Corps` ; jeu : bloc `FIGV2`/`FX2`/`fig*`, style `figuresV2`) : une figure = une EXPLOSION en un point
  de la caisse, les impulsions s'additionnent, inertie, prise vers l'endroit devant, planté avec rebond. 3 emplacements (`SAVE.d.figEq`, inventaire,
  boutique), 3 boutons en vol (`#tFig`, clavier 1·2·3), double-tap = emplacement suivant, tenu = ×2 ×3. Élan emporté au décollage, TOUPIE DE DRIFT.
  Figure plantée = aura × tours + nitro tout de suite (`NITRO2.figAir`) ; posée en plein tour = CHUTE (figures du vol perdues). `?fig=ancien` (Léo),
  `?fig=libre` (FIGURES LIBRES), `dbgFig()`. **UN TAP NITRO REDRESSE** (Sacha) : `Corps.redresse`, plus court chemin, ×2 de freinage.
- **Correctifs** : saut nitro qui finissait en CHUTE (temps de vol = le viseur ; figure AUTOMATIQUE = jamais de chute) ; 2 bugs de Léo (saut sur la
  FACE CACHÉE refusé ; double-tap périmé à 150 ms). Banc : 8 sauts → 8 payés, 0 chute ; fumée commune OK.
- **L'ARGENT DU DÉBUT** (agent, fusionné) : `denom()×ECOD.k`, ×1,5 jusqu'au 1er achat / banque ≥ peinture la moins chère EN VENTE ; `?eco=ancien`,
  `dbgEcoDebut()` ; modèle `outils/eco-debut-modele.cjs` : moyen 6e → 4e partie.
- **DÉFIS secrets** (détections, `SEC`/`SEC_K`/`sec*`, `dbgSec()`) → `secDonne` de GRAPHISME (sur main).
- **Son** : la matière du tour par axe (`figMat`, diff de SON). **Seconde chance** (GENERAL) : barème tranché k0 .6, kPente .05, kMax .8, plancher 300, moteur −1.

## EN COURS (rien de poussé sur main)
- `jour-retour` (worktree `CCG-jour`) : retour quotidien ×2 + série + CADEAU ~6 h (contrat INTERFACE : `cadeauEtat()`→{pret,dansMs,jour},
  `cadeauOuvre()`, ligne `#n7Cadeau` posée par INTERFACE). 3 commits (dont un « EN COURS » : agent coupé par la limite). À FINIR + VÉRIFIER.
- `evt-rares` (worktree `CCG-evt`) : événements rares (banquier, caisse-nuage, moutons ; 1 max/partie ; `?evt=0`). 1 commit « EN COURS », NON vérifié.

## SUITE, PAR PRIORITÉ
1. **LES COMBOS À TROIS** (Sacha, 14/10 ~16 h 50 : « réfléchis à comment ça peut être parfait, peu de jeux l'ont fait ; jouissif ; plein de
   combinaisons de trois figures à partir des moves existants ; tu peux en rajouter d'autres ») — idée : chaque TRIO de figures plantées dans un vol a
   un NOM (table curée + générateur déterministe), un carnet des combos découverts (`SAVE.d.combos`, prime de DÉCOUVERTE), enchaîné « au bon moment »
   (lancer la suivante pendant la PRISE de la précédente) = bonus ; + 4-6 figures neuves (tours entiers seulement). À concevoir puis faire juger.
2. Finir `jour-retour` (cadeau inclus), envoyer le SHA à INTERFACE.
3. Finir et vérifier `evt-rares`.
4. Passation de l'ancienne GAMEPLAY : l'œil neuf sur le ressenti (passation/GAMEPLAY.md).

## RÈGLES DE TRAVAIL (apprises aujourd'hui)
- Worktree à soi ; `git -c core.autocrlf=false add` de fichiers nommés ; avant commit, `git diff --stat` = vrai nombre de lignes (piège CRLF).
- Bancs : `C:/Users/sacha/cc-banc/lib.cjs` (file équitable), fumée `cc-banc/fumee.cjs` AVANT le verrou `cc-push.lock` ; cache sw.js = main + 1.
- Une boucle gelée au banc (`__gel`) ne se relance pas seule : avancer par `dbgStep` jusqu'au bout.
