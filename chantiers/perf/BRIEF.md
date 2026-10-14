# CASH CAR — PASSE OPTIMISATION MOBILE (nuit du 14/10/2026) — RÈGLES COMMUNES (v2, après le redémarrage du Mac)

Sacha : « la version mobile n'arrive pas à afficher de bons graphismes sans bugger. Comprime un maximum, que le jeu soit le plus fluide
possible **même sur un iPhone 7**. Quelque chose d'irréprochable, comme une équipe de game developers seniors. » Cible de la nuit : la
version APP STORE (iPhone, WKWebView). Tu es ingénieur performance senior ; `R=/Users/sachaberes/cash-car/perf`.

## Les 5 lois (le Mac a redémarré cette nuit sous 45 agents et 15 navigateurs : on ne refait pas ça)
1. **MISSION COURTE : 20-30 minutes, UN livrable.** Ton chef t'a donné les fonctions et les lignes : ne re-cartographie pas le fichier.
2. **UN COMMIT APRÈS CHAQUE GAIN** (au plus tard à 15 minutes, « (en cours) » si besoin). Un agent sans commit est un agent perdu.
3. **PAS DE NAVIGATEUR.** Tu ne lances ni Chrome, ni banc, ni serveur, ni simulateur. Tu raisonnes sur le CODE ; tes seules vérifications :
   `node $R/banc/syntaxe.cjs "<ta copie>/VERSION PRINCIPALE/index.html"` (0 erreur) et `sh garde-burnout.sh` (racine de ta copie : OK).
   Les mesures (compteurs, captures, fumée), c'est le chef qui les fait à l'intégration : dis-lui dans ton rapport QUOI vérifier et COMMENT.
4. **LE PALIER 2 NE CHANGE PAS** (les iPhone récents gardent toute l'image). Une optimisation est soit INVISIBLE (même image, moins de
   travail : vaut pour tous), soit taillée sur le palier (`PAL`, ci-dessous) et le palier 2 reste identique à avant.
5. **FUSIONNABLE** : six sessions modifient le même fichier. Modifs CHIRURGICALES — pas de reformatage, de réindentation, de déplacement de
   bloc, de renommage. On AJOUTE (une garde, un budget, un cache, une sortie anticipée) plutôt que réécrire.

## Le fichier
- `<ta copie>/VERSION PRINCIPALE/index.html` : 5,4 Mo, ~52 700 lignes, Three.js minifié dans `vendor/` (on n'y touche pas), tout le jeu dans
  UN `<script>` (une seule portée, beaucoup de `const` : l'ordre de déclaration compte). ⚠ des lignes font > 5 000 caractères : JAMAIS
  `cat` ni lecture entière ; `grep -n 'motif' index.html | cut -c1-300`, `sed -n 'A,Bp' index.html | cut -c1-600`, Read avec offset/limit ≤ 200.
- Les commentaires datés qui citent Sacha ou Léo sont des DÉCISIONS. Le guide `CLAUDE.md` (800 Ko) : seulement `grep -n 'mot' CLAUDE.md | cut -c1-300`.
- Léo a déjà fait cette nuit une « passe mobile » (commit `9522ba6`, dans ta base) : les `:has()` du HUD en classes, `hudColonne` lue avant
  d'écrire, appels de dessin vides du jade cachés (`im.visible=n>0`), `jadeChauffeNiveau` (plus de compilation en course), `jadeTri` sans
  allocation, sonde iPhone espacée. Ne le refais pas, ne le défais pas.

## Le PALIER de l'appareil — `PAL` (cherche « LE PALIER DE L'APPAREIL » ; déjà dans ta base)
- `PAL.n` : 0 ANCIEN (iPhone 6s/7/8/X, puces A9-A11) · 1 MOYEN (XR/XS/11/SE 2) · 2 RÉCENT (iPhone 12+, ordinateurs). `PAL.bas` = (n===0),
  `PAL.moyen` = (n<=1). Connu AVANT la création du rendu. Forcé au banc par `?palier=0|1|2` ; `dbgPalier()` décrit.
- Budgets : `PAL.B.<cle>=[ancien, moyen, récent];` déclaré PRÈS de ton code (après le bloc PAL dans l'ordre du fichier), lu par
  `PAL.b('cle', défaut)`. La 3e valeur = le comportement d'AVANT. Préfixe tes clés du nom de ta zone, commente ce que ça taille.
- Déjà posé (bloc « LE DÉPART AU BON CRAN, PAR PALIER ») : `qlDepart`, `qlMin`, `vhdPx`, `vhdOmbre`, `vhdMort`. L'échelle `QL.k` (0 plein …
  kMax) reste l'adaptation en cours de partie ; `VHD` = l'accueil en haute définition.

## L'iPhone 7 (le plus lent qu'on vise)
JavaScript ~4× plus lent que le Mac, un seul cœur utile ; puce graphique à tuiles ~15× moins puissante : elle souffre des PASSES plein
écran, des pixels recouverts (transparence), des ombres (scène dessinée deux fois), au-delà de ~300 000 triangles par image ; 2 Go de
mémoire (Safari tue l'onglet bien avant 1 Go) ; iOS 15.8 ; `performance.now()` arrondi à 1 ms ; toute LECTURE depuis la puce
(`readPixels`, `getBufferSubData`, `clientWaitSync`, `getParameter`) y coûte très cher. Un téléphone qui chauffe se bride : ce qui tourne
pour rien coûte de la fluidité cinq minutes plus tard. Objectif : zéro à-coup — 30 i/s STABLES valent mieux que 45 hachées.

## Mesuré (iPhone 7 émulé 667×375 ; compteurs déterministes)
- Course SOLEIL DE JADE : ~250 appels de dessin, ~1 000 000 triangles par image (nuages en cubes ≈ 300 000), 790 Ko de tampons renvoyés
  à la puce par image ; écran de fin : ~286 appels, ~1 000 000 triangles (le niveau entier reste dessiné derrière les cartes) + la carte
  MOTEUR relue depuis la puce chaque image ; accueil : 75 appels, 37 600 triangles.
- Avant le premier écran : 167 programmes compilés, 1 760 tampons (35 Mo), 184 toiles 2D (52 Mo), tas JS 102 Mo (204 Mo en course).

## Git (ABSOLU)
- Tu travailles UNIQUEMENT dans `$R/wt/<ton-nom>` (branche `perf/<ton-nom>`). Message en français : « Zone : ce qui change, le chiffre
  attendu (passe perf mobile) », terminé par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- JAMAIS : push, merge, rebase, reset --hard, `git stash`, une autre branche, un autre dossier que ta copie.
- Après CHAQUE commit, une ligne au journal commun :
  `printf 'perf:<ton-nom>\t<fonction>\t<lignes>\t<titre>\n' >> /Users/sachaberes/cash-car/debug/journal-correctifs.tsv`
  (et AVANT de toucher une fonction : `grep -n '<fonction>' /Users/sachaberes/cash-car/debug/journal-correctifs.tsv` — si une autre
  session vient d'y passer, lis son titre et ne marche pas dessus).

## Interdit
- Couleurs, lumières, corps des shaders (session GRAPHISME) ; HTML/CSS des écrans (INTERFACE — sauf les écritures DOM par image de la boucle) ;
  la BOUTIQUE 3D et les voitures (GELÉES : Léo y travaille en direct) ; `app-ios/` ; `sw.js` ; les `CLAUDE.md` ; `vendor/`.
- Le BURN-OUT de Léo (tout ce qui commence par burn/don/BURN/DON) : intouchable.
- Le GAMEPLAY (verrouillé par Sacha) : conduite, vitesses, collisions, ramassages, tirages, difficulté. Une optimisation rend les MÊMES
  résultats de simulation ; on espace l'AFFICHAGE, jamais la simulation. On allège les créations de Léo sur les vieux appareils, on ne les retire pas.

## À rendre (ton dernier message, pour le chef — ≤ 25 lignes)
Commits (hash + titre) · fonctions et lignes touchées · le gain ATTENDU chiffré par palier et POURQUOI · ce que le chef doit VÉRIFIER au
navigateur (quel écran, quel compteur, quelle capture, quel risque visuel) · ce que tu as vu sans le toucher (avec fonction + ligne).
Style du code : commentaires en français datés « (2026-10-14, passe perf mobile) » qui disent pourquoi.
