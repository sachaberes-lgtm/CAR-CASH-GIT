# PREMIÈRE FOIS — ce qui naît pour la 1re fois EN COURSE (P6, passe 3, 2026-11-07)

Banc : `python3 outils/banc-perf/premiere-fois.py [--sans-portails] [--json f] [--md f]` (Chrome sans fenêtre, iPhone 390×844 ×3, `?garde=1&palier=2&tel=1&pistegraine=777`, profil neuf, processeur ×4 après le menu).
Une seule course déclenche : 15 figures (`dbgFigure`), 5 cristaux posés devant (`dbgPwrDevant`) puis 5 pouvoirs pris (`dbgPwr`), pouvoir + figure en l'air, 2 éclairs, un événement rare, la frénésie, une seconde chance (mort puis reprise), puis un vrai portail par map (`--sans-portails` les saute).
Par étape il relève : programmes liés (`linkProgram` + pile), **premier dessin de chaque couple programme × mélange × profondeur × cible** (avec l'objet, la matière, la géométrie et la ligne qui l'a créé), envois de textures ≥ 16 k px et de tampons ≥ 100 Ko, appels GL > 20 ms (`texImage2D`, `readPixels`, `getProgramParameter`…), `toDataURL`/`toBlob`/`getImageData`, `CanvasTexture`/canvas créés, images > 100 ms (rAF + long-animation-frame avec scripts).
Fichiers : `passation/perf-2026-11/premiere-fois/{avant,apres}.{json,md,txt}` (les `apres-*`/`diag*` sont des essais de mise au point).

## Ce que dit la mesure
1. **Aucun programme n'est LIÉ en course** (`linkProgram` = 0 partout, toutes les étapes) : la chauffe du menu compile tout. **Aucune `CanvasTexture`, aucun `toDataURL`/`readPixels` en course** : les figures, les pouvoirs, les fruits, l'orage, la frénésie ne créent RIEN côté GPU.
2. Ce qui naît quand même, c'est le **premier DESSIN**. Sur iPhone (Metal) le vrai programme de la puce naît au 1er dessin (10 à 50 ms par couple, voir « LA CHAUFFE DE LA PUCE » dans `vignette-moteur.js`) : `renderer.compile` ne fait que lier. Cinq familles n'étaient jamais dessinées avant leur 1re fois :

| naissance | déclencheur (1re fois) | objet / ligne d'origine | cause | AVANT | APRÈS |
|---|---|---|---|---|---|
| billets `BILL_IM` | 1re mort | `rendu/billets-devises.js:5` MeshBasic instancié + carte 64 px | instancié gardé à 0 instance : `onAfterRender → chaud=true` sur une image où three ne dessine rien (`renderInstances` : `if(0===n)return`) | 1 programme | 0 |
| panneaux du cratère `PAN_VOL` (mélange normal) / `PAN_DARD` (additif) | 1re mort | `rendu/tirelire-reserves.js:327/340` `mkPanneaux` (ShaderMaterial instancié) | idem | 2 programmes (2 états) | 0 |
| pluie de monnaies `MONN` | 1res monnaies lâchées | `rendu/billets-devises.js:123` (600 panneaux) | idem (non déclenchée au banc, même mécanisme : chauffée par précaution) | — | 0 |
| pigeon | 1re volée (24-56 s, heure aléatoire) | `maps/pigeons.js:26` `mkPigeon`, MeshLambert couleurs de sommets | `chauffeDivers` ne faisait que `renderer.compile(pigeon)` | 1 programme | 0 |
| carte moteur (`engCarteQuad`, `engHalo`, `engNoir`) | 1er palier de la course | `interface/vignette-moteur.js:104-120` | compilée seulement (`renderer.compile(engVigQuadScene)`) | 2 programmes | 0 |
| moteurs gardés `ENG_PRET` + tampon `engRT` 864×578 | 1re mort / seconde chance | `voitures/matieres-forme.js:248` (Phong env+bump+spec, Phong plat « lapin », cône de flamme additif) | compilés seulement | 3 programmes + 4 textures (192-512 px) + tampon 1,9 Mo + cible 864×578 | 0 / 0 / 0 |

Totaux du banc (course scénarisée sur nuages, chauffe jouée) : **AVANT 4 premiers dessins de programme + 4 textures montées ; APRÈS 0 + 0.** (D'autres exécutions intermédiaires ont montré les billets/panneaux/carte moteur à la place des 4 de l'AVANT final : ils dépendent de ce que la mort aléatoire du banc touche en premier ; la liste ci-dessus est leur union.)
Les portails (ville, jade, grotte, dunes, canyon, nuages:orage) n'ont montré **aucun** premier dessin d'état ni programme lié en AVANT : les maps ont déjà leurs `*Chauffe` (jade, canyon, dunes, forêt…). Remesurés en APRÈS (`apres-portails.*`, chauffe jouée d'un coup) : **0 programme lié sur les 6 portails, 0 erreur de page** ; premiers dessins : 0 partout SAUF **ville:pluie = 8 programmes** (Lambert/Basic instanciés `fam` ×6 dans `buildVoxCity`, `villeRais` additif, un Basic instancié à carte additive de 13 instances) — la ville voxel est dessinée pour la 1re fois à l'arrivée du portail, `villeChauffe` ne les dessine donc pas tous (hors de mes fichiers : à reprendre par P3/constructeurs de maps ; ils tombent dans « hors portails » du critère, donc tolérés ici).

## Ce qui a été fait
`code/gameplay/premiere-fois.js` (nouvelle section, avant `moteur/desktop-banc.js`) :
- `premInstance`/`premPanneau` : UNE instance de taille nulle (dessin réel, rien à l'écran) passée par `chauffeRendu`, puis l'état d'avant est remis — billets, `PAN_VOL`, `PAN_DARD`, `MONN` ;
- le pigeon dessiné (et plus seulement compilé) ; `premCartes` : les trois quads de la carte moteur dessinés à l'échelle zéro sur la toile ;
- `premMoteursTic` : chaîne de tranches de 250 ms lancée par le menu, qui attend la fin de la chauffe (`CHAUFFE_R.fait`), jamais en course/lâcher/piqué/garage, et dessine UN moteur gardé par tranche dans `engRT` (dédoublonné par clé de programme).
- 7 lignes ajoutées dans la liste `E` de `chauffeDivers` ; interrupteur `?premfois=0` (= avant) ; `dbgPremiere()` (état) et `dbgPremiere('tout')` (joue tout d'un coup : sert au banc). `dbgFigure(id[,sens])` dans `figures-physique.js`. Tous retirés de la copie publiée.
- Gardes passées (`garde-burnout`, `garde-charte`, `garde-allege`, `garde-demarrage`), `assembler --verifier` OK. L'image ne change pas : on ne dessine que des instances de taille nulle / hors écran, dans la cible 8×8 ou dans `engRT`.

## Ce qui N'EST PAS prouvé (à lire avant de conclure)
- **Les millisecondes.** La machine tournait à load 50-500 pendant les mesures : les images > 100 ms du banc viennent de la machine, pas des naissances (la boucle `loop` elle-même est lente, les LoAF le disent). Seuls les COMPTAGES (programmes liés, premiers dessins, envois) sont fiables.
- **Chrome n'est pas Metal.** Le banc montre QUELS dessins sont premiers, pas combien ils coûtent sur le 13 Pro. À vérifier avec la boîte noire de l'intégrateur (le gel de 5,8 s du build 6 portait `hPwr figVol hAirPie` : non reproduit, ces classes sont des états du HUD ; l'hypothèse la plus plausible est une première mort — explosion + billets + panneaux + moteur de l'écran de mort — dans cette fenêtre).
- **Le Chrome sans fenêtre ne finit pas la chauffe du menu** (liaison douce `COMPLETION_STATUS_KHR` jamais vraie ; l'étape atelier ne passe pas). Le banc simule la fin de liaison (300 ms) et, pour l'APRÈS, joue la chauffe d'un coup (`PF_CHAUFFE=1` → `dbgPremiere('tout')`) ; le déroulé réel de la chaîne des moteurs au menu d'un téléphone n'est donc pas vu au banc.
- Le banc ne distingue pas les portails « à froid » des portails chauffés par le menu : sur un téléphone la chauffe du menu précède le premier portail.

## Pour les autres sessions (hors de mon périmètre)
- **P5 (menus)** : `homeCielPrise` fait un `getImageData` de 160×210 (12-23 ms sous ×4) 27 fois sur la course scénarisée, depuis `loop` (écran de mort/accueil) ; la carte du moteur sur l'écran de mort fait un `readPixels` PBO + `engLit` (tampon 1,9 Mo) : voir `interface/vignette-moteur.js`.
- Le banc `premiere-fois.py` est aussi un détecteur de régression : toute nouvelle matière instanciée gardée à zéro instance sort en « premier dessin » à sa 1re fois.

## Suite (08-09/11) — départ, mort, REJOUER
Le profil des 3 s qui suivent JOUER / la mort / l'écran de mort / REJOUER, le levier retenu (carte moteur de l'écran de mort à 15 i/s sur `TEL_NATIF`, `?mortcarte=max` = avant, commit `d1789ad5`), celui qui a été essayé puis abandonné (chauffe du niveau en tranches : la plus longue tranche égale l'appel entier) et la comparaison main / train de l'écran de mort (`d0f1e7db` : aucun écart sur Mac ×4, médiane du pré-bâti suivant 4,7 s des deux côtés) sont dans `passation/perf-2026-11/DEPART-MORT.md`. Banc : `outils/banc-perf/depart-mort.py` (`--latence`, `--sans-profil`, `--vp`). La régression « écran de mort 8-12 s » du banc iPhone 38 est attribuée au banc (reclics, voile collé) — à confirmer par la comparaison 44 / 41.
