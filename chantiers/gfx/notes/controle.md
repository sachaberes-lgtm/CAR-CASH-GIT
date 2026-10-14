# controle — le dernier regard (passe graphismes, 14/10) — copie `gfx/wt/controle`, branche `gfx/controle`
Banc : `banc/controle/` (carte.cjs = une carte par ouverture, recap.cjs = plusieurs cartes + bascule debout, aa.py / planche.py = assemblage sans navigateur, pose*.py = les réglages).
Captures : `shots/apres/` (`<carte>-<météo>-a.png` = état de départ, `-c`/`-d` = après corrections, `-debout`), planche `shots/apres/planche-tout.png` (6 colonnes, même ordre que l'AVANT : nuages, ville, jade, espace+crypto+soleil), `aa-<carte>-<météo>.png` = AVANT | APRÈS.
6 ouvertures de navigateur (nuages, ville, jade+Soleil de Jade, espace+crypto, recapture couchée, recapture + debout), 0 erreur JS partout.

## Ce que j'ai vu (L* = béton, tiers bas hors voiture, `etal-orbite/lstar.py` ; « avant » = état livré ce matin)
| Couple | Jugement |
|---|---|
| NUAGES matin | OK : azur → pêche, cumulus crème, béton L* 42. |
| NUAGES midi | Béton un peu clair (46) → rtK .9 (37-42 ensuite). Les cumulus proches du soleil sortent sable/beige sur l'azur (matière du coton, pas une valeur d'ambiance) — voir « reste ». |
| NUAGES soir | Pêche → mauve doux, OK ; PAS de béton saumon (taupe rosé) mais clair (L* 47-49) → rtK .75 puis .83 (20-23). |
| NUAGES nuit | Béton lisible mais les nuages proches restent gris-lavande clairs (mer blanche en GLSL) ; béton 20-26 → 13-14 après hemiI .5, remonté à .55 (≈ borne basse de la cible 14-20). |
| NUAGES pluie | OK, la plus tenue (gris perle, béton 39). |
| NUAGES orage | Ardoise-bleu correct ; un cumulus beige à droite (même cause que le midi). |
| VILLE matin | Le plus gros défaut : béton L* 50-54, gris-bleu terne et blême ; corrigé (rtK .72 + expo .97 → L* 40-43). |
| VILLE midi | Ciel franc, tours claires/ombres bleutées, mais béton 50 (froid) → rtK .8 + expo .98 → 44. Le premier réglage (.65) l'avait trop foncé (31) : corrigé après revue. |
| VILLE soir | Le mauve : ciel violet, béton violet-gris (106,94,113). hemiS/hemiG/jMid réchauffés → ciel pêche-prune, béton taupe L* 34. |
| VILLE nuit | OK : ciel très noir, tours lisibles, béton bleu-nuit 23-26, dalles visibles debout. |
| VILLE pluie | OK : ardoise, route mouillée, enseignes seules en couleur. |
| VILLE orage | Plus indigo que ardoise (ciel violacé) → jZen/jMid/jHor moins bleus. |
| JADE matin/midi | Le béton était à L* 60 (blanc terne), le plus clair de tout le jeu → rtK .6 (≈ 36-46). Décor céladon, nuages de coton posés : très bien. |
| JADE soir (Léo) | Béton beige-rosé à L* 59 : NON touché (ordre : le soir de Léo ne se retouche pas) — à trancher. Idem Soleil de Jade (L* 54). |
| JADE nuit | Béton lisible (17) mais les rochers sont noirs sur ciel noir : pas de silhouette. Non corrigé (champs `jd*` du rouleau peint : hors de ce que je sais régler sans essai). |
| JADE pluie | OK : gris à peine vert, béton 42. |
| JADE orage | Sombre, vert-ardoise, rochers noirs ; acceptable. |
| ESPACE matin | Béton sable-brun (clé or) → sunC [1,.94,.84]. |
| ESPACE midi / satellites | OK : béton gris neutre éclairé, dalles et fissures lisibles (L* 37-44). |
| ESPACE soir | Béton chocolat saturé (L* 26-30) → sunC [1,.82,.66]. |
| CRYPTOCITY | OK : azur → or pâle, tours vert/or, béton gris 44 (haut de fourchette), pas retouché. |
Cohérence d'une météo : les 4 matins se reconnaissent (azur → pêche, brume rosée) ; les pluies (nuages, ville, jade) sont toutes gris-bleu/gris-vert tenues ; les orages sont tous ardoise sauf la ville, un cran plus violacée avant correction ; les nuits sont bleu-nuit (ville, nuages) ou bleu-vert (jade). Béton : de jour il était de L* 42 (nuages) à 60 (jade) — désormais 37-46 partout.

## Corrections (des valeurs, un commit chacune ; `rtK` = nouveau réglage d'ambiance, 1 par défaut, lu dans `routeTick`, multiplie la clarté et la teinte du béton)
1. `rtK` (BIO_ETAL0 + `routeTick`) et les valeurs jour : villeMatin .72, villeMidi .8, villeSoir .85, nuagesSoir .83, midi .9, jadeMatin/Midi .6.
2. villeMatin/Midi : expo .91/.92 → .97/.98 (« la ville au soleil doit être lumineuse », Sacha).
3. villeSoir : jMid [.52,.44,.46], hemiS [.68,.66,.78], hemiG [.48,.42,.44]. 4. villeOrage : jZen/jMid/jHor moins bleus. 5. nuagesNuit : hemiI .55, sunI .74.
6. espaceMatin sunC [1,.94,.84] · espaceSoir sunC [1,.82,.66].

## Debout (390×844 : nuages midi, jade midi, ville nuit) — 0 erreur JS
Le béton se lit : fissures, rugosité, joints de dalle (ville nuit : nets, jade : discrets, nuages : à peine). Les nuages du jade se lisent (cumulus posés entre les pics). Les sapèques ne se lisent pas (trop petites/loin sur ces images) : NON VU debout.

## Reste / doutes
- Les cumulus « chauds » du coton (nuages midi, orage, jade matin) sortent sable : teinte par instance du coton, pas réglable par l'ambiance.
- Mer blanche des NUAGES nuit/orage (GLSL `merZ`, proposition d'etal-nuages).
- Jade nuit : rochers sans silhouette ; jade soir (Léo) béton clair.
- Le béton d'orage jade est un peu clair à droite (L* 34 sur la zone droite, reflet).
- Trou carré des sapèques jamais vu de près ; pas de test sur téléphone réel ; le Soleil de Jade n'a eu qu'une capture.
- Planche : assemblée en Python sans légendes (même ordre que l'AVANT).
