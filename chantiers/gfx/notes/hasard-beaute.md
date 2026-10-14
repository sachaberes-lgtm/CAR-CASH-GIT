# hasard-beaute — la beauté des mix tels que le joueur les reçoit (14/10, copie gfx/wt/hasard-beaute)
Banc : gfx/banc/hasard-beaute/daemon.cjs (UNE ouverture pilotée par fichiers cmd/cN.js → oN.txt), `dbgClassique(c,m)` + vrai portail (`dbgPortail(260)`, repli `dbgSaut`), REJOUER si mort, `dbgNet(true)` (flou de vitesse coupé) pour juger.
Graines : 4825 (10 couples, session 1) · 7131 (14 couples, session 2) · 9027 (les 22, images nettes `n-<carte>-<météo>.png`). Un seul navigateur ouvert pour tout (charge machine montée à 190 en fin de passe).
| Couple | Vu par vrai tirage | Verdict | Correction (commit) |
|---|---|---|---|
| nuages matin / midi / pluie | oui (portail) | beaux | — |
| nuages soir | oui | béton sombre et violet | rtK 1,05, hemiG chaud, clé 1,25 (3c62278) |
| nuages nuit | oui | cumulus éclairés comme de jour, mer GLSL claire | volSun/volSky bas, lune .4 (c2f8bca) ; mer : reste |
| nuages orage | oui | cumulus blanc-lavande trop lumineux | volSun/volSky bas, clé .4 (f166084) |
| ville matin | oui | ciel un peu vif, tours peu éclairées | clé 2, ciel clair, brume lointaine (64b5097) |
| ville midi | oui | ciel cobalt, tours ternes | clé 2, azur clair, brume (1f4e377) |
| ville soir / nuit / pluie | oui | beaux | — |
| ville orage | oui | indigo violacé | ardoise gris-bleu (96a363c) |
| jade matin / midi / pluie | oui | très beaux | — |
| jade soir | oui | béton beige clair (Léo : non touché) | — |
| jade nuit | oui | rochers noirs sur ciel noir, pas de silhouette | non corrigé (champs jd* du rouleau) |
| jade orage | oui | sombre mais lisible | — |
| espace matin / midi / satellites | oui | bons | — |
| espace soir | oui | béton chocolat | sunC [1,.9,.8] (5676092) |
## Reste / POUR LES AUTRES
- VILLE de jour : les fenêtres des tours restent allumées orange en plein midi (shader `villeMatTours`, pas une valeur d'ambiance) — proposition : atténuer l'émission par `BIO.jour`/le courant `CITY.uC` de jour.
- Après un portail, +3,5 s : la caisse parfois absente de l'image (ombre seule) sur plusieurs arrivées de la série 2 — à vérifier côté transition.
- Je n'ai PAS pu juger : le rendu sous le flou de vitesse du boost post-portail (très fort, masque le décor) ; jade nuit ; les sapèques de près ; téléphone réel. Le jade soir de Léo est le béton le plus clair du jeu.
