# GELS-SHADERS — les programmes liés en course, et les « 32 erreurs WebGL » (2026-11-10, Fable)

Branche `gels-shaders-2026-11-10` (worktree `C:\Users\sacha\cc-gels-shaders`), partie d'origin/main v1419, **pas poussée**.
Demande de Sacha : « un joueur neuf, cache de shaders vide, ne subit aucun gel de plus de 120 ms en course, premier portail compris ».

## 1. Ce qui était encore vrai sur origin/main
- 8728be58 (v1369) liait déjà d'avance la map d'en face (`prebLie`, jade/forêt/glacier/grotte), mais seulement avec KHR_parallel_shader_compile, et jamais pendant l'auto-école (`prebCible()` y est nul : `dbgPrelie().sansCible`).
- MESURÉ (banc ci-dessous, vraie puce, cache vide) : toute matière dessinée pour la 1re fois EN COURSE liait son programme dans le dessin, et three lisait aussitôt son état → le fil attendait la puce.
  Trois chemins, piles d'appel à l'appui :
  1. le dessin de la scène (`renderBufferDirect → setProgram → initMaterial → acquireProgram → getProgramInfoLog`) ;
  2. `renderer.compile` en course (`vignette-moteur.js`, l'ancien `LIER.compile0` : `jadeChauffeNiveau`, jade-vol.js:297) ;
  3. la vignette du moteur (`engVigRender → engVigRendRT → renderer.render(engVigScene)`), à chaque palier moteur gagné.
- La banquise (D2) n'a pas été isolée à part : le garde est général (toute map), elle n'est pas tombée dans les tirages mesurés.

## 2. Le correctif : LE GARDE DE COURSE (`code/interface/vignette-moteur.js`, `LIERC`)
- `vendor/three.min.js` retouché en 3 points (`node outils/vendor/retouche-three-garde.cjs`, rejouable, `--verifier`) : setProgram rend `null` pour un programme pas encore lié, initMaterial peut refuser une naissance, renderBufferDirect saute l'objet. Sans les deux crochets posés sur le moteur de rendu, three est inchangé.
- En course, pour la scène du jeu et la vignette du moteur (`lierGardee`) : un programme neuf est lancé sans être lu, son objet n'est pas dessiné tant qu'il n'est pas lié (il apparaît quelques images plus tard), 3 naissances par image au plus (1 sans KHR), `renderer.compile` toujours doux.
- Sans KHR (`LIER.T`) : un seul programme en vol, barrière `fenceSync` lue sans attendre, puis une marge étalonnée sur la durée d'une liaison mesurée au menu (`lierEtalon`), lecture chronométrée qui ajuste la marge. `prebLie` tourne aussi dans ce mode.
- Interrupteurs : `?garde=0` (course comme avant), `?lier=t` (mode sans KHR imposé), `?lier=0` (tout comme avant), `?chauffe=0` (banc : aucune chauffe du menu, tout naît en course). État : `dbgLier().garde`.

## 3. Mesures (banc `outils/banc-sortie/pilote.cjs --sonde outils/banc-sortie/sonde-gels.js`, joueur neuf, intro réelle, SANS attente=0)
Chrome headless, vraie puce (RX 6600, ANGLE D3D11), profil neuf = cache de shaders vide. Scénario : auto-école 40 s, « passer le tuto », 1re course (`?carte=jade&meteo=matin`), portails au pilote automatique, ~5 min.
⚠ La machine était à 100 % de CPU (12 autres Chrome headless d'autres sessions) : les durées sont gonflées, et les trous « sans JS, sans tâche, sans programme » sont du bruit. Les attentes WebGL, elles, sont attribuées par pile d'appel.

| | avant (v1419) | après |
|---|---|---|
| attentes WebGL > 8 ms en course (liaison lue en synchrone) | 20 à 30 par essai, jusqu'à 964 ms chacune | 0 (reste : texImage2D ≤ 20 ms) |
| pire gel en course | 4 588 ms + 1 635 ms (entrée en jade) ; 501 ms au 1er portail (→ grotte) ; 384 ms (6 programmes de la carte moteur) | 901 ms, du JS (voir § 4) |
| gels > 120 ms en course par essai | 35 à 42 | 3 (tous du JS au départ) |
| portails franchis sans gel > 120 ms | 0 sur 3 | 3 sur 3 (essai final), 3 sur 3 (pire cas `?chauffe=0`, 48 programmes nés en course) |
| KHR caché (`?sanskhr=1` de la sonde), pire cas `?chauffe=0` | (non mesuré avant) | 0 attente > 11 ms, 25 programmes nés en course |

Sans KHR, deux réglages ont été essayés et rejetés sur mesure : délai fixe (une lecture a attendu 689 ms), barrière seule (551 ms). Le réglage gardé (barrière + marge étalonnée) : 11 ms au pire.

## 4. Ce qui reste, et qui n'est PAS des shaders (mesuré, non corrigé)
- Le 1er départ : une image de 280 à 450 ms de JS (js ≈ durée) à s = 0.
- « Passer le tuto » : `tutoPasse → resetGame` bâtit la 1re map dans le geste (tâche de 0,9 à 1,6 s hors image), puis une image de 150 à 250 ms.
- Ville (`villeOrage`, s ≈ 2 000) : des images de 435 et 943 ms de JS ; passage grotte → ville : 3 images de 300 à 430 ms ; record battu en forêt : 1 034 ms. Vus une fois chacun, sous charge : à remesurer machine au repos.
- Hors course rien n'a changé : sans KHR, le menu lie toujours en synchrone à froid (l'intro a tenu 125 à 141 s sur cette machine chargée).
- Non mesuré : un vrai Safari / iPhone (Metal), un vrai navigateur sans KHR (Firefox). Un navigateur qui lie DANS `linkProgram` attendra à chaque naissance : le garde ne peut alors qu'étaler (un programme à la fois).
- Effet visible du garde : un objet dont le programme naît en course apparaît avec un retard (≈ 0,5 s avec KHR ; jusqu'à ~1 s par programme sans KHR sur machine lente). Un effet très court né pour la 1re fois en course peut ne pas se voir cette fois-là.

## 5. Les « 32 erreurs WebGL » (BUGS-POUR-FABLE points 1 et 4) : cause prouvée
- Ce ne sont pas des erreurs GL. Journal complet de la page ET des Workers (pilote.cjs `--journal`, cibles filles attachées), vraie puce : **256** fois « performance warning: READ-usage buffer was written, then fenced, but written again before being read back », puis « WebGL: too many errors, no more errors will be reported », dans cet ordre, et rien d'autre.
- `getError()` lu UNE fois en fin d'essai (le drapeau reste levé tant qu'il n'est pas lu) : `NO_ERROR` après 6 min de jeu ; témoin : une erreur provoquée ensuite est bien relevée (`0x500`).
- Workers / OffscreenCanvas : écarté. Aucun contexte WebGL hors du fil principal (le seul `OffscreenCanvas` du code est un `instanceof`, `creatures/atelier.js` n'importe three que pour la géométrie) ; 8 Workers attachés, 0 message.
- La source : la relecture par tampon de la vignette du moteur (`engLit`, `vignette-moteur.js`, PBO + `fenceSync`), en course à chaque carte NOUVEAU MOTEUR et à l'écran de mort. Preuve par intervention : même écran de mort tenu 100 s avec `fenceSync` refusé (`?sanspbo=1` de la sonde, le jeu prend son repli) → 0 message.
- Conséquence inchangée : après ~256 avertissements, une vraie erreur WebGL ne s'afficherait plus dans la console de ce contexte. Non corrigé ici (le correctif 898faf5c avait été retiré exprès, e92ddd55 : pas testé sur Metal).

## 6. Le banc
- `pilote.cjs` : `--sonde <fichier>` (script posé avant le jeu), pas `r` (lit `__sondeGels(1)`), `--journal <fichier>` (tous les messages, Workers compris), `--profil <dossier>` (profil gardé = cache de shaders chaud, sauvegarde vidée), un toucher sans réponse ne fait plus échouer l'essai.
- `sonde-gels.js` : trous d'images > 120 ms avec JS de l'image, tâches longues, programmes nés ; appels WebGL qui attendent, avec pile ; `?sanskhr=1`, `?sanspbo=1` ; `__sondeGlErreur()`.
