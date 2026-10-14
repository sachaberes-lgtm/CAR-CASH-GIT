# Notes de l'intégrateur (passe SENSATIONS, 14/10)

## Volant tactile (commit 437c4b8) — FAIT À LA MAIN
- Braquage plein à 46 px (54), assiette haute 38 px (44), bas : course 44 inchangée (drift) + assiette ×1,12, lissage du pouce τ 30 ms (47).
- `?sens=0` = l'ancien volant ; `?volant=40` = une autre course (34-60). Banc : `node sensations/banc/volant-sim.cjs "<index.html>"`.
- À juger par Sacha sur son iPhone : si « encore pas assez », essayer `?volant=42` puis `40` ; si trop nerveux, `50`.

## Outils communs (5a5626e) : sensCoup / sensHap / sensSecoue, banc `dbgSens(versLat,nez,pompe)`.

## Chocs au sol — FAIT À LA MAIN (bloc 'drive' de loop + frole)
| geste | ce qu'on sent en plus | provoquer |
|---|---|---|
| plaque BOOST | le nez se lève, le cul s'écrase, gerbe d'or sous la poupe (plus fort à chaque pad du train) | rouler sur un pad |
| dos d'âne | le nez monte d'abord (plus sec si on arrive vite), tic dans la main | n'importe quel dos d'âne |
| retombée d'un petit saut | poussière aux roues arrière, le nez pique, tic léger (pas sur une pose : elle a la sienne) | dos d'âne, replacement (touche R / mode facile) |
| plot percuté | la caisse penche à l'opposé du plot et pique du nez ; porte dure : plus fort + vibration | percuter un plot |
| flaque | gerbe d'eau aux deux roues avant (voile de poussière pour l'huile), la caisse se couche puis LOUVOIE ~2° pendant la glisse | ville sous la pluie, flaques d'huile |
| frôlé | la caisse s'écarte d'un rien du plot rasé | raser un plot à plus de 45 % de la vmax |
Risques : aucun sur la physique (sensCoup n'écrit que rollV / SCOUP / susV, lus par la seule carrosserie). À juger à l'œil : les doses.

## L'eau du Soleil de jade — FAIT À LA MAIN (`SEAU`, `sensEau`, `sensMouille`, juste avant « LES CUBES D'EAU »)
Déjà là (Léo, 4 passes du 13/10) : couronne, colonne, gouttes, ruissellement 1,6 s, sillage, bulles, objectif mouillé, filtre du son, ricochet.
| moment | ce qu'on sent en plus | provoquer (`?play=jade`, console `dbgEau({h:60,vy:-40,vh:60})`) |
|---|---|---|
| à flot, lente | LE BOUCHON : la carrosserie roule ±4° et tangue ±3°, pilonne ±7 cm ; se cale quand on prend de la vitesse | se laisser flotter sans nitro |
| à flot, lente | LE BOUILLON : écume qui sort de la poupe (le moteur brasse) + clapotis rare | idem |
| plongeon profond | LE CREUX : au point bas, gerbe de bulles + bloop + tic léger dans la main, à l'instant où la mer repousse | tomber de haut dans la mer |
| pose après l'eau | TREMPÉE : gerbe aux quatre roues au contact, puis les pneus arrière crachent ~2,5 s | ressortir et se poser sur la route en moins de 2,6 s |
Risque : `carBody` est écrit en vol seulement à flot (remis à zéro en sortant et à chaque `startFall`). Si une caisse spéciale anime sa carrosserie en vol, vérifier.
