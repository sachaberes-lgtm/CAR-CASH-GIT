# hasard-bugs — les FUITES D'ÉTAT d'un couple map × météo au suivant (2026-10-14, 4 h 45 → 5 h 25)

Branche `gfx/hasard-bugs` (copie `gfx/wt/hasard-bugs`). Commits : `2ee1e2d` (hook `dbgEtatLum`), `b2dc5fc` (soleil de l'orbite), `93c7464` (planète de l'orbite).

## ⚠ CE QUI N'A PAS ÉTÉ FAIT : LE BANC ALÉATOIRE N'A PAS TOURNÉ
Le navigateur de l'équipe a été tenu pendant TOUTE ma mission par le démon de `hasard-beaute` (`banc/hasard-beaute/daemon.cjs`, verrou
`banc/equipe-verrou` pris à 4 h 46, encore tenu à 5 h 10), puis la charge de la machine est montée à 190 (règle : > 25 → on n'ouvre pas).
Mon script a attendu son tour 18 minutes puis je l'ai arrêté ; relancé à 5 h 13 (verrou d'équipe libre, charge 22), il a alors attendu 7 min un créneau MACHINE (les 2 de `pilotage/slots` pris par d'autres sessions) et je l'ai arrêté à 5 h 20, verrou rendu (aucun Chrome lancé par moi, aucune capture). Donc : **0 graine jouée, 0 comparaison
chiffrée**. Les deux correctifs ci-dessous viennent de la LECTURE DU CODE et ne sont PAS vérifiés à l'image (syntaxe + garde burn-out seulement).

LE BANC EST PRÊT, à lancer dès que le navigateur est libre et la charge < 25 (une ouverture, ~8 min avec les références) :
```
cd ~/cash-car/gfx/banc/hasard-bugs
node seq.cjs 4401 12 1 > g4401.log 2>&1     # graine 4401 : espace×soir → nuages×midi → espace×satellites → jade×soir → ville×pluie → espace×soir → jade×midi → ville×nuit → espace×midi → ville×soir → espace×midi → jade×pluie
node compare.cjs 4401                        # pour chaque arrivée : état « par portail » ≠ état « démarré dessus » (refs/<carte>-<meteo>.json)
node seq.cjs 7302 12 1 && node compare.cjs 7302   # 2e graine (les références déjà prises sont réutilisées ; vider refs/ après un correctif qui change l'état direct)
```
`seq.cjs` : `dbgClassique(c,m)` + `dbgSaut()` (le vrai chemin `newTrack`), 4,5 s d'attente (fondu 1,2 s), deux relevés `dbgEtatLum()` à 0,5 s
(ce qui bouge entre les deux = bruit, ignoré), une capture par arrivée dans `shots/hasard/g<graine>/` ; puis recharge `?carte=&meteo=` pour
chaque couple distinct (référence). Il relève aussi `cles` : les champs et longueurs de tableau de TOUTES les ambiances (contrôle de `bioLerp`).
`dbgEtatLum()` (index.html, à côté de `dbgNiveau`) renvoie : ambiance, tous les nombres de `LVL`, `LVL.cur` à plat, `BIO.cur` + env, TOUS les
uniformes de `skyU` / `acesPass` / `GFX_U` / `RIM_U` / `ROAD_U`, les 4 lumières + `carLight` (couleur, intensité, position, ombre), brume
(scène + bases), exposition, bloom, planète (visible, échelle, teintes, toile peinte, anneau), nuages, soleil-sprite/nappe/rayons,
`CAMP_FOG/FLASH`, somme des lumières de la scène par type, fond/env/dôme.

## LE TABLEAU DES ÉTATS (lecture du code : un portail = `newTrack` → `lvlChoisir` → `buildTrack` → `bioGo` → `lvlGo` → `campDebut`)
| État dépendant du couple | Posé à l'arrivée | Fondu | Remis à zéro en quittant | Verdict |
|---|---|---|---|---|
| ambiance (59 champs de `BIOMES`) → ciel, brume, 4 lumières, expo, étalonnage, bloom, liseré | oui (`bioGo`) | oui (`bioLerp`, 1,2 s, par le sombre) | — (tout champ est réécrit) | SAIN : vérifié par script que TOUS les champs de tout le bloc ∈ 29 champs racine ∪ `BIO_ETAL0`, et que chaque tableau a la même longueur partout (aucun champ « absent d'une des deux ambiances ») |
| `env`/`eS1`/`eS2` (reflets des caisses) | oui (`paintEnv` dans `bioGo`) | non (repeint d'un coup, sous le flash) | — | sain |
| `LVL.espace/planete/pluie/ville/nuit/jade/crypto/mer/route/sheen/paris` | oui (`lvlGo` pose les 11 cibles à CHAQUE portail, 0 par défaut) | oui (`lvlStep`, même courbe) | oui (cible recalculée) | sain |
| `uSpace/uJade/uMer` (dans `lvlStep`), `uVille/uPluie/uParis` (boucle), `ROAD_U.*` (`routeTick`), voile de pluie (`pluieTick`), phares (`carVit`) | relus chaque image depuis `LVL` | suit | suit | sain |
| soleil-sprite / nappe / rayons (`nuit9` dans `bioApply`) | oui (dernier pas du fondu, `lvlStep` passe avant `bioStep`) | oui | oui | sain |
| `LVL.cur.orage` / `cielMusical` / `hard` / `piste` / `id` | lus en direct chaque image | non (bascule sous le flash) | oui | sain |
| éclairs, `CAMP_FOG`, `CAMP_FLASH`, foudre de la ville | `campDebut` → `eclVide` + `villeDebut` → `foudreCache` | — | oui | sain |
| nuages (bancs, coton, coton du jade : teinte nuit/orage lue dans `LVL.cur`) | rebâtis par piste | — | oui (`cotonVide`, `COTON.jd=null`) | sain |
| planète : toile, teintes, limbe, anneau (`lvlAstre` → `planetesGarde`/`planetesPeint`) | oui en orbite ; hors orbite gardée telle quelle (elle s'éteint par l'échelle) | échelle fondue | anneau : visible seulement si la toile est Saturne ET `planetGroup.visible` (échelle > .02) | sain |
| **soleil de l'orbite `ORB.cle` (direction de la lumière clé, des ombres, du reflet d'objectif)** | **NON** | lissé 1,1/s | **NON** (`ORB.cleOk` jamais remis à faux) | **FUITE → corrigée (bug 1)** |
| **place de la planète `LVL.dir`** | **NON** (lissage .35/s en continu, le cap saute au portail) | lissé | — | **RETARD à l'arrivée → corrigé (bug 2)** |
| lune de l'orbite `ORB.dm` | oui (`ORB.capOk=false` dans `orbiteBuild`) | lissé 2/s | oui | sain |
| lumières `fill`/`kick` : POSITION (orbite) | `orbiteLumiere` (pondéré par `LVL.espace`) | suit | oui (`FILL_P0/KICK_P0` reposés quand `espace` < .001) | sain |
| `uJMerY` (mer du jade, posé par `buildJade`) | oui en jade | — | non, mais lu seulement si `uJade` > 0 | sans effet |
NON COUVERT par la lecture (seul le banc le dira) : les ~50 lectures de `LVL.cur.id` dans les systèmes de carte (ville : enseignes, fenêtres,
trafic ; jade : `jadeTick`, eau ; orbite : débris, satellites), la chauffe hors écran (`chauffeRendu`), le REJOUER après une mort (`resetGame`
refait un fondu de 1,2 s depuis l'ambiance de la mort — voulu d'après le commentaire), le retour au menu.

## BUG 1 — X → EN ORBITE pour la 2e fois de la partie (ex. espace×soir → nuages×midi → espace×satellites) — corrigé, `b2dc5fc`
Symptôme attendu : pendant ~3 s après le portail, le soleil de l'orbite vient du mauvais côté puis TOURNE — ombres qui balaient la chaussée,
flanc éclairé qui change de côté, reflet d'objectif (`FLARE`) qui traverse l'écran.
Cause : `orbiteLumiere` cale la lumière clé sur le cap de la caméra (`ORB.cleC`) et la rejoint avec retard ; `ORB.cleOk` (le « première fois :
on la pose d'un coup ») n'était JAMAIS remis à faux — `ORB.cle` gardait la direction de la FIN de l'orbite précédente. La lune, elle, était
déjà remise (`ORB.capOk=false` dans `orbiteBuild`). EN ORBITE sort 1 fois sur 3-4 au tirage : le cas est courant.
Correctif : `ORB.cleOk=false` à côté de `ORB.capOk=false` (`orbiteBuild`, une ligne). NON VÉRIFIÉ À L'IMAGE.

## BUG 2 — X → EN ORBITE (toute arrivée par portail) — corrigé, `93c7464`
Symptôme attendu : l'orbite arrive « sans planète » (ou planète dans le dos / hors cadre), puis elle glisse à sa place en ~8 s.
Cause : `lvlPlanete` fait suivre `LVL.dir` au cap de la caméra à .35/s (le « gros retard » voulu en conduite) ; au portail le cap SAUTE
(nouvelle piste) et rien ne recale la planète, alors que son échelle, elle, fond en 1,2 s.
Correctif : `lvlGo` arme `LVL.dirVif=.9` s quand le niveau d'arrivée est une orbite ; pendant ce temps `lvlPlanete` rejoint à 12/s (sous le
fondu sombre du portail, planète encore minuscule) puis reprend son retard de .35/s. Rien d'autre ne change. NON VÉRIFIÉ À L'IMAGE.
Si l'effet ne plaît pas : retirer la ligne `if(c&&c.espace)LVL.dirVif=.9;` de `lvlGo` (le reste devient inerte).

## POUR LES AUTRES
- Tout NOUVEAU champ d'ambiance doit être ajouté à `BIO_ETAL0` (valeur neutre) : un champ nombre présent dans certaines ambiances seulement
  reste à l'ancienne valeur en arrivant sur une ambiance qui ne l'a pas (`bioLerp` boucle sur les clés de l'ARRIVÉE) ; un champ TABLEAU absent
  de `BIO.cur` lève une exception à chaque image du fondu (lumières figées). Aujourd'hui : aucun cas (vérifié par script sur cette branche).
- L'hypothèse « fuites de `bioLerp` / de `LVL` » n'est PAS confirmée par le code : ces deux mécanismes sont propres. Les seules fuites trouvées
  sont des LISSAGES calés sur le cap de la caméra, propres à l'orbite. Si Sacha voit encore des « éclairages bugués », chercher d'abord du
  côté des VALEURS (hasard-beaute) et du fondu de 1,2 s lui-même, puis lancer le banc ci-dessus.

## REPRISE (5 h 20 → 6 h 05) — LE BANC A TOURNÉ, LES DEUX CORRECTIFS SONT RETIRÉS
- Graine 4401, 12 couples par `dbgSaut` + 10 références « démarré dessus » (`banc/hasard-bugs/cmp4401.txt`) : 76 différences, 3 à 9 par couple,
  AUCUNE d'éclairage. Ce sont : `post.uCtr/uSafe/uRn/uNit` (cadrage de la caisse à l'écran, dynamiques) ; `uHueAmp/uLvl/uFlip/bloom.force` (musique) ;
  la toile de planète gardée hors orbite (`planetesGarde`, planète CACHÉE : sans effet) ; `uJMerY/uEauT` (mer du jade, lus seulement si `uJade`>0) ;
  `route.uJStyle` 5 au lieu de 1 hors jade (toujours multiplié par `LVL.jade`=0 dans `routeTick` et gardé par `uJadeR` : sans effet) ;
  `uVilleY` -0,3 hors ville (lu seulement avec `uVille`>0). 0 erreur JS. Lumières, brume, expo, étalonnage, ciel, soleil, nuages : identiques.
- Bugs 1 et 2 INFIRMÉS : banc `portail.cjs` par VRAIS portails (nuages×midi → espace×soir → ville×midi → espace×satellites → jade×midi), relevé
  toutes les 0,35 s, AVEC (`portail-apres.log`) et SANS (`portail-avant.log`) les correctifs : à 0,7 s après le portail le soleil (repère caméra
  ≈ (-0,93 ; 0,3 ; 0,1)) et la planète (NDC ≈ (-0,1 ; -0,2)) sont déjà à leur place dans les deux cas. Retirés : commits 24b007f et 7e6eed1.
- « Ombre de la caisse sans la caisse » (hasard-pour-bugs.md) : NON REPRODUIT — 4 vrais portails + 11 sauts, caisse visible (19/23 mailles,
  comme au départ), caméra à 5,6-6,1 m, toutes les 0,35 s pendant 6 s ; captures `shots/hasard/portail-*`. Dans les images de hasard-beaute la
  caméra semble DANS la caisse (pluie de confettis/pièces du portail, HUD masqué) : piste = caméra trop près (plan proche), pas la lumière.
- Graine 7302 : non jouée (budget).
