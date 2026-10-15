# ÉTAT — session GAMEPLAY (PC de Sacha) · 14/10/2026, ~soir

## FAIT ET POUSSÉ SUR MAIN (voir JOURNAL « LES FIGURES v2 », « L'ARGENT DU DÉBUT », « LE RETOUR DU JOUR », « LES ÉVÉNEMENTS RARES »)
- **FIGURES v2 — la physique** (`figures.js` v2 : `FIG.Corps` ; jeu : bloc `FIGV2`/`FX2`/`fig*`, style `figuresV2`) : une figure = une EXPLOSION en un point
  de la caisse, les impulsions s'additionnent, inertie, prise vers l'endroit devant, planté avec rebond. 3 emplacements (`SAVE.d.figEq`, inventaire,
  boutique), 3 boutons en vol (`#tFig`, clavier 1·2·3), double-tap = emplacement suivant, tenu = ×2 ×3. Élan emporté au décollage, TOUPIE DE DRIFT.
  Figure plantée = aura × tours + nitro tout de suite (`NITRO2.figAir`) ; posée en plein tour = CHUTE (figures du vol perdues). `?fig=ancien` (Léo),
  `?fig=libre` (FIGURES LIBRES), `dbgFig()`. **UN TAP NITRO REDRESSE** (Sacha) : `Corps.redresse`, plus court chemin, ×2 de freinage.
- **Correctifs** : saut nitro qui finissait en CHUTE (temps de vol = le viseur ; figure AUTOMATIQUE = jamais de chute) ; 2 bugs de Léo (saut sur la
  FACE CACHÉE refusé ; double-tap périmé à 150 ms) ; `urgent`/`cale` remis à zéro à chaque vol (bug de DEBUGING, a10d46c).
- **L'ARGENT DU DÉBUT** : `denom()×ECOD.k`, ×1,5 jusqu'au 1er achat / banque ≥ peinture la moins chère EN VENTE ; `?eco=ancien`, `dbgEcoDebut()` ;
  modèle `outils/eco-debut-modele.cjs` : joueur moyen, 1er achat 6e → 4e partie.
- **DÉFIS secrets** (détections, `SEC`/`SEC_K`/`sec*`, `dbgSec()`) → `secDonne` de GRAPHISME.
- **LE RETOUR DU JOUR** (10482999, cache v416) : ×2 sur la 1re partie du jour (max avec l'argent du début, pas le produit), SÉRIE de jours,
  CADEAU toutes les ~6 h. Contrat INTERFACE `cadeauEtat()`→{pret,dansMs,jour,serie}, `cadeauOuvre()`. Ligne d'accueil `#mCadeau` posée par
  GAMEPLAY (style `cadeauLigne`, JS `cadeauLigne()` 1 Hz) : debout au-dessus de MISSIONS, couché sous JOUER — INTERFACE peut la redessiner.
  `dbgJour()`, `dbgCadeau('pret'|'attente')` ; tests `outils/jour-modele.cjs`, `outils/jour-test.cjs`.
- **LES ÉVÉNEMENTS RARES** (même push) : moutons · caisse-nuage, 1 max par partie (`EVT_P=.75`), prime `120×denom()` ; `?evt=0`, `dbgEvt(nom)` ;
  test `outils/evt-test.cjs`. Le BANQUIER a été retiré le soir même (ordre de Sacha, DEBUGING ff4205c). Moutons : refusés là où la route n'est pas
  droite (voulu, la caisse-nuage prend le relais) — pas encore VUS à l'écran.
- **Soir (train)** : le « +1 » de la pièce flotte à côté de la caisse (`piece1Plus`, `.p1f`, 3 étiquettes recyclées, cumul +2 +3) et le « +$ » sous le
  compteur est éteint · le SOLDE PRÉCIS partout (`fmtSolde`/`soldeEcrit`/`soldeFit`, un seul « $ », il roule 0,7 s, la police descend si ça déborde ;
  `dbgSolde({banque,course})`) · l'ESPACE : 5 s de vol (`ORB_AIR=5/6`, Sacha) · la règle des RACCOURCIS (`passation/RACCOURCIS.md`, `dbgTrace`,
  `vPalier`, `rayonPalier`, banc `cc-banc/raccourcis.cjs <carte> <graine> [--palier N] [--depuis trace.json]`).
- **Son** : la matière du tour par axe (`figMat`, diff de SON). **Seconde chance** (GENERAL) : barème conseillé k0 .6, kPente .05, kMax .8, plancher 300, moteur −1.

## SUITE, PAR PRIORITÉ
1. **LES COMBOS À TROIS** — confiés à GENERAL par PILOTAGE : ne pas les commencer ici sans qu'on le redemande.
2. Voir les MOUTONS à l'écran sur une ligne droite (banc `dbgEvt('moutons')` sur un tronçon droit) ; faire juger les 3 événements par Sacha.
3. Verdicts attendus de Sacha : le ressenti des figures (impulsions, redresse), la ligne du cadeau, la fréquence des événements.
4. Passation de l'ancienne GAMEPLAY : l'œil neuf sur le ressenti (passation/GAMEPLAY.md).

## RÈGLES DE TRAVAIL (apprises aujourd'hui)
- Worktree à soi ; `git -c core.autocrlf=false add` de fichiers nommés ; avant commit, `git diff --stat` = vrai nombre de lignes (piège CRLF).
- Bancs : `C:/Users/sacha/cc-banc/lib.cjs` (file équitable). POUSSÉE = LE TRAIN (`C:/Users/sacha/cc-train/LISEZMOI.txt`) : merge main, gardes, banc métier,
  push de la branche, inscription dans `cc-train/file.txt` ; ne pas monter sw.js.
- Une boucle gelée au banc (`__gel`) ne se relance pas seule : avancer par `dbgStep` jusqu'au bout.
- Accueil ux8 : JOUER se lance au DOIGT (`page.touchscreen.tap`), un clic souris ne démarre pas la partie.
