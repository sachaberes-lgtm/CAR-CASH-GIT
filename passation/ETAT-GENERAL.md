# ÉTAT — session GENERAL (2026-10-14, fin de séance)

## Rôle
- Intégrateur des idées de Léo : relire ses commits quand il pousse, signaler à PILOTAGE, corriger ce qu'on me confie.
- Worktree `C:\Users\sacha\Documents\GitHub\CCG-pop`, branche `boutique-pop`. Poussée par LE TRAIN
  (C:\Users\sacha\cc-train\LISEZMOI.txt) : merge origin/main, syntaxe + gardes, ne pas monter sw.js, banc métier,
  `git push origin boutique-pop`, puis `echo "GENERAL boutique-pop" >> /c/Users/sacha/cc-train/file.txt`.
- Bancs uniquement par `C:\Users\sacha\cc-banc\lib.cjs` (file, passe-droit, 2 créneaux). Mes scripts : scratchpad de la
  session 52b9efb2…/scratchpad/pop (verrou.js, tuto2.js, chance.js, combo.js, eco.js, slide.js ; common.js attend
  `domcontentloaded` : `load` ne vient plus depuis le 14/10 soir).

## Livré le 14/10 (sur main)
- Auto-école v2 (6 gestes dont FIGURE), carte pixel néon (+ variante charte 6 sous html.c6). Un `</style>` égaré a été corrigé (207ab05).
- Revue de Léo, points 7, 13 et 14 ; code cousin sans le payant.
- SECONDE CHANCE (bloc `CHANCE`) : reprise au point de mort, moteur −1, 3·2·1, bouclier de 3 s, comptabilité à bases décalées.
- COMBOS À TROIS (`COMBO_NOMS`, `comboNote`, `SAVE.d.combos`, sonCombo de SON).
- Économie option A : ELDORADO 3 000, CHARGEUR 6 000, DÉFIEUR 10 000, BAVAROISE 20 000 (passation/ECONOMIE.md).

## Dans le train (inscrit, branche boutique-pop b9340744)
- Prix de la seconde chance = 100 % de l'argent de la COURSE (`money − START_CASH`, la prime de mission exclue), minimum 300 $.
  Banc : mort à 1 000 $ → 1 000 $.
- BON gratuit du FINAL SPIN : `SAVE.d.chanceG` → prix 0, `chanceEtat().gratuit`, GRATUIT au 3·2·1. La ligne san et le don du bon
  sont chez IDEE ; le texte GRATUIT sur la plaque, chez INTERFACE.
- Figure SLIDE (bloc `SLD`) : flanc qui déborde sur la lèvre, façades de Paris, et tout mur via `slideContact()`. Étincelles or,
  aura (20 + 120 × v/vmax) par seconde, étiquette #slideHud, payée dans la chaîne. Banc : 166 à 50 % vmax, 290 à vmax, en 2 s.
  `sonSlide(etat,k)` : debut / tick / fin / paye, chez SON.

## En attente
- CANYON (injoignable) : appeler `slideContact()` à chaque image où une paroi de couloir touche la caisse en conduite.
- Sacha : les deux plateaux de prix (550 k-900 k et 3 M-4 M, ×1,06-1,17 par marche), à garder ou espacer (ECONOMIE.md §7).
- Relire les prochains commits de Léo.
