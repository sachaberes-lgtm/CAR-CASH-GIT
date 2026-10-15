# ÉTAT — session DEBUGING (PC de Sacha) — 14/10, 23 h 20 (fin de séance)

## Rôle
Chasse aux bugs (collisions, pas de temps 30/60/120, machine à états, mort-relance, pause, cycle de vie, rotation JS, portails, sauvegarde,
premier lancement, lecture du tactile, pouvoirs/minuteurs, audio iOS, langues, économie/missions) + GARDE DE MAIN (relire chaque train parti :
C:\Users\sacha\cc-train\journal.txt ; défaut chez une autre session → une ligne à elle + PILOTAGE ; FIGURES/COMBOS → GENERAL). Ordres : PILOTAGE.
POUSSER = LE TRAIN (depuis 23 h) : merge origin/main, syntaxe + garde-burnout + garde-charte, PAS de sw.js, banc métier, `git push origin
debug-integration`, puis `echo "DEBUGING debug-integration" >> /c/Users/sacha/cc-train/file.txt` ; PILOTAGE fume, monte le cache, pousse, écrit PARTI.

## Poussé sur main le 14/10
- v386 : carnets POP remis à zéro une fois · record borné 1e30 · miroir natif lu si sauvegarde locale illisible · LA RAIE remboursée 2,5 M$ + toast
  (REQUIN/COMÈTE : euros seulement ; ⚠ qui a ouvert main entre ~14 h et 16 h 50 a perdu LA RAIE sans trace).
- v398 : SECONDE CHANCE — plus de débit si un volet est déjà en route.
- v403 : éclairs ≤ 3 flashs/s (WCAG 2.3.1, preuve-flashs.cjs) · L'ÉTERNELLE = « JOUE 100 PARTIES » (ex.runs) · loup-garou de la FORÊT.
- v412 : ROYAUME DE FEU — l'éruption ne reste plus embrasée après mort + REJOUER (volcanVide remet uErupt).
- v425 (Sacha) : plus d'ÉVÉNEMENT BANQUIER (ville ; campagne rendue telle qu'avant ; fiche du LINGOT sans banquier — LE LINGOT s'achète 2,2 M$
  depuis SANS_CARRIERE) · plus de PLUIE DE SATELLITES (ni météo de l'ORBITE au classique, ni 6e niveau du cycle ; textes de PLUTON gardés).
- v431 (Sacha) : MARCHE ARRIÈRE 13,8 → 27,6 km/h affichés (vA -8 → -16), accélération en recul ×1,5 (clavier, doigt, souris).
Preuves node `passation/preuves/preuve-{carnets-pop,raie,miroir-illisible,sauvegarde,flashs}.cjs <corrigé> [ancien]` (bouchons SANS_CARRIERE,
CHANCE/chanceBase : tout nouveau global dans `const SAVE={`…`if(BALADE)` doit y être bouchonné).

## Vérifié au banc (UA iPhone, tactile, encoche, Chrome muet, 0 erreur JS)
Debout + couché : accueil → JOUER → vol → pose → mort → REJOUER → ⌂ → garage → réglages. 30 i/s : rotation avant 1er toucher, mort NITRO tenue
(0 PSSHT), portail + mort. 30 tirages de niveaux sans satellites (3 orbites roulées). dbgEvt('banquier') refusé. Recul avant/après.

## Reste, du plus gênant au moins gênant
1. À VÉRIFIER SUR iPHONE : RÉGLAGES debout (1 153 px pour 844) — la liste défile-t-elle au doigt ? (le code le permet ; le banc ne sait pas défiler
   au toucher simulé). Transmis à INTERFACE par PILOTAGE.
2. ⌂ / REJOUER touchés dans les toutes premières ms de l'écran de mort : ignorés (garde d'entrée), un 2e toucher passe. Voulu a priori.
3. Cibles < 44 px au garage (OFFRES ÉPHÉMÈRES 34-38, onglets couchés 40) : INTERFACE.
4. Ramassage ≥ 1 100 km/h EN JEU (prouvé en node seulement, preuve-ramasse OK sur main après ce12fe5).
5. Bug son « boutique + nitro » : non reproduit, attend Sacha.
6. Deux onglets web qui s'écrasent la sauvegarde (S3, web seulement).

## Garde de main — relu le 14/10, RAS sauf corrigés
T9 · GRAPHISME · IDEE · OPTIMISATION (vague 1, RAM.q, image auto) · SECONDE CHANCE (moteur + câblage INTERFACE) · FIGURES v2 (urgent → GAMEPLAY) ·
auto-école v2 · FORÊT · BANQUISE (+ tranches) · ROYAUME DE FEU · UX 8 · retour du jour + événements rares · SON (figures 1-3) · trains 843dab1e, 5befb87d.

## Outils (scratchpad de la session, sur C:/Users/sacha/cc-banc/lib.cjs, CC_QUI=DEBUGING)
fumee.cjs (CONTROLE=1, RAIE=55, BANQ=1) · enjeu.cjs (30 i/s) · iphone.cjs · defile.cjs · satellites.cjs · recul.cjs (ancien/neuf).
⚠ Worktree CCG-debug-integration : repasser en LF avant commit ; apostrophes françaises : jamais dans un heredoc bash (Write puis exécuter).
