# Vidéo d'aperçu App Store — 30 s (scénario)
Règles Apple : captures de l'APPLICATION réelle (pas de texte promo plein écran), 15-30 s, jusqu'à 3 aperçus par taille, iPhone 6,9 po = 886×1920 (debout) ou 1920×886 (couché).
Ton : fun, cash, arrogant. Sans voix off (le jeu n'a plus aucune voix) ; son du jeu + musique de la radio ; sous-titres FR/EN incrustés par le montage (≤ 5 mots).

| t (s) | Plan (gameplay réel) | Incrustation FR / EN |
|---|---|---|
| 0-3 | Accueil au ciel (heure du téléphone) → JOUER | « T'as 1 vie. Fais-la cash. » / « One life. Make it cash. » |
| 3-8 | Départ de la route dans les nuages, caisse au pilotage, 1er virage | « Pilote » / « Drive » |
| 8-14 | Nitro puis saut du bord : figures en l'air, vrille, pose parfaite, billets | « Nitro. Saute. Vrille. » / « Boost. Jump. Spin. » |
| 14-20 | Changement de map (portail) : ville de nuit néons roses sous la pluie | « 5 mondes, 6 météos » / « 5 worlds, 6 weathers » |
| 20-25 | Garage : défilé de 3 caisses rares (rareté en couleur) | « 50+ caisses » / « 50+ cars » |
| 25-28 | Orbite : la Terre, satellites, vol libre | « Va plus haut » / « Go higher » |
| 28-30 | Écran de fin : l'argent en héros + logo CASH CAR | « CASH CAR » |

Prise de vue : banc commun (cc-banc/lib.cjs), son coupé pour les captures ; pour la vidéo, enregistrement écran du simulateur iOS / iPhone réel (le banc headless ne rend pas 60 i/s fiables).
Montage : cuts secs sur le tempo de la musique ; première seconde = la plus spectaculaire (Apple affiche l'image d'affiche tirée de la vidéo).
À ne pas montrer : TEST_CAISSES, boutique non branchée, noms de marques à renommer (voir CONFORMITE-APP-REVIEW.md).

## Scénario image par image (30 fps = 900 images)
| Images | Plan | Cadre / mouvement | Son |
|---|---|---|---|
| 0-12 | Flash d'une caisse en plein saut, billets qui volent (image d'affiche) | caméra de poursuite, léger zoom | impact grave + clic |
| 12-60 | Accueil : titre, ciel de l'heure, caisse tournant | fixe, puis le pouce appuie JOUER (doigt visible) | nappe de menu |
| 60-120 | Départ : la caisse démarre sur la route de nuages | caméra héros derrière | moteur, musique entre |
| 120-210 | Courbe, nitro : traînée de feu, les lignes de vitesse | FOV qui s'ouvre | souffle de nitro |
| 210-300 | Bord de route : le saut, le monde sous la caisse, vrille | caméra de vol, ralenti 0,7 pendant 10 images à l'apex | silence de l'air, puis pose |
| 300-345 | Pose parfaite : hit-stop, « PARFAIT », pluie de billets, compteur d'argent | plan serré, shake court | tchak + caisse enregistreuse |
| 345-420 | Portail : fondu, la ville de nuit sous la pluie, néons roses | traveling avant | pluie, basses |
| 420-510 | Orage de la forêt noire : éclair blanc, phares, loup (si visible) | plan large | tonnerre |
| 510-600 | Garage : 3 caisses (commune, rare, légendaire) défilent, couleur de rareté | orbite lente | tintement de rareté |
| 600-690 | Orbite : la Terre, satellites, vol libre | travelling arrière | silence spatial + synthé |
| 690-780 | Crash spectaculaire puis REJOUER (l'argent en héros) | plan fixe écran de fin | thump + montant qui s'égrène |
| 780-900 | Logo CASH CAR + « Disponible sur l'App Store » (fond noir, 2 s) | fixe | accord final |
Contrainte : garder 10 % de marge de sécurité (encoche / île dynamique) ; aucune marque tierce visible ; sous-titres dans les deux langues pour 2 pistes de montage.
