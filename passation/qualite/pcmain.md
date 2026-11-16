# LOT « ORDINATEUR CONTRE MAIN » (2026-11-15)

Question : sur l'ORDINATEUR (pas de ?tel, PRF.on faux), `qualite-appareil` (f20016e67) rend-elle exactement le jeu d'origin/main (545a47222) ?
Le contrôle d'ombre-image avait vu : caisse à x ≈ −114 contre 0,1 sur main en 120 pas, et 18 sources de shader de plus.

## Verdict : PAS d'écart réel. C'est un artefact du banc.

1. Le banc `outils/banc-ombre-image/banc.cjs` n'est pas déterministe sur l'ordinateur. Preuve : main contre main, même commande, deux fois
   (`--ordi 1 --sources 1 --pas 120`) : la 1re course part sur JADE (caisse −190,7 / 0,05 / 32,4 ; 347 sources), la 2e dans une GROTTE (137,9 / −1,6 / 135,7 ;
   346 sources). La branche, une fois : 149,0 / −6,5 / 126,2 et 346 sources, identiques une à une à celles de la 2e course de main.
   Causes : (a) la map n'est pas tenue. `?carte=nuages` remplit `SF.force`, mais `sfImpose` le vide dès qu'il sert une fois (tirage d'avance), puis la map est
   tirée au hasard. (b) `Math.random` n'est pas semé. (c) La course démarre en temps réel (rAF actif) jusqu'à ce que le banc coupe rAF.
   Les « 18 sources de plus » sont donc simplement les matières d'une AUTRE map.
2. Banc rendu déterministe (`outils/banc-pcmain/det.cjs` : Math.random semé dès le chargement, rAF coupé dès « prêt » avec le départ mené par dbgStep,
   `dbgClassique(carte, météo)` avant chaque dbgJouer). Ordinateur 1280×720, DPR 1, sauvegarde neuve :
   - nuages matin, graine 12345, 120 pas. main ×4 : x = 0,108 à chaque fois, y de −119,684 à −119,698. Branche ×4 : x = 0,108, y de −119,688 à −119,707.
     Sources : **329 contre 329, identiques une à une** (compare-sources.py : 0 seulement-main, 0 seulement-branche).
   - jade nuit, graine 777, 600 pas (jusqu'au palier moteur 2) : main −934,49 / −595,10 / 97,35 ; branche −934,41 / −595,09 / 97,32.
     Sources : **330 contre 330, identiques une à une**. Paliers du moteur, vitesses et cadence identiques dans la boîte noire.
   - Le petit bruit restant (≈ 0,02 m sur y/z, 0,08 m sur 600 pas) existe aussi entre deux courses de main : dbgStep donne dt = 33 ms + quelques µs
     (deux appels à performance.now()). Il ne distingue pas main de la branche.
   - Photos : main contre main diffèrent déjà (564 644 px, max 155/255) parce que les shaders lisent le temps réel. Main contre branche est dans le même bruit
     (548 759 à 658 993 px). La photo ne prouve donc rien au pixel avec ce banc. Ce qui fait foi : même position et **mêmes sources**.

## Bissection
Inutile : aucun écart reproductible à pas et graine égaux.

## Correctif
Rien à corriger dans le jeu. Pour les bancs : comparer main et la branche sur l'ordinateur avec `outils/banc-pcmain/det.cjs` (`--fige 1 --graine N --force 1`),
pas avec banc-ombre-image tel quel. Note pour la session maps (pas touché, zone interdite) : sur l'ordinateur, un `?carte=` de l'adresse peut être perdu
avant le JOUER du banc. Le même code est sur main.

Ni index.html ni sw.js commités. Worktree main retiré.
