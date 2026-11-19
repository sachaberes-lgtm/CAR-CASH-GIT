# BANC DE CHALEUR v3 — l'énergie du jeu sur le 13 Pro (nuit du 16 au 17/11)

Session banc-chaleur, branche `qualite-appareil`. Builds de mesure 1192 → 1196 (Debug, jamais sur main).
Installé à la fin : **build 1196** (`~/cash-car/ios-ultime-mesures/builds/build1196-banc.app`), page noire (`chaleur=vide`).

## Ce qui a changé dans le banc (v2 → v3)

1. **On sait ce que fait l'app.** Un battement toutes les 10 s dans le journal du téléphone :
   `CCBANC état=course mode=drive carte=nuages météo=midi moteur=29 km/h=581 ips=30 ms=16.7 rendu_ms=4.1 QL=0 DPR=1.25 cad=30 zones=3 th=0 eco=0 branché=1 batterie=80 autreSon=1 lum=0`
   - la page (natif.js) envoie l'état du jeu (`window.dbgBancEtat`) par `webkit.messageHandlers.ccBanc` ;
   - le natif (JeuViewController.swift, `BancBattement`, Debug + CC_QS seulement) ajoute th (ProcessInfo.thermalState 0-3), eco, branché, batterie, autreSon, lum (luminosité) et l'écrit par **os_log public** (NSLog sortait en `<private>`) ;
   - si la page se tait 25 s : `CCBANC état=muet` (page morte ou figée).
   - `ips` = images de jeu comptées (`loop._fr`) sur 10 s ; `rendu_ms` = temps CPU des appels `renderer/composer.render` par image.
2. **La puissance réelle, lue par le câble** (`outils/banc-chaleur/batterie.py`, toutes les 2 s) : la jauge de batterie publie `PowerTelemetryData`.
   `SystemLoad` = ce que consomme TOUT le téléphone (mW) ; les compteurs `AccumulatedSystemLoad / SystemLoadAccumulatorCount` donnent la **moyenne exacte** sur une fenêtre (rafraîchis toutes les ~20 s).
   Plus la température de la batterie (`Temperature`, centièmes de °C), la charge (%), « en charge ».
   C'est LA mesure : elle sépare les postes en 3 minutes, sans attendre que le téléphone chauffe. Le budget thermique (v2) ne sert plus qu'à dire quand iOS bride.
3. **Rien au hasard** : `carte=nuages&meteo=midi` + `window.dbgBancCarte` (SF.force tenu par un accesseur : chaque portail retire nuages/midi), moteur 15 dès la 1re seconde (`chalpal=1`), film d'intro sauté.
4. **Le repos** : page noire au moins `REPOS_MIN` s ET température de batterie ≤ `TBAT_MAX` tenue 60 s ET budget du noyau (clientId 10) ≥ 2950 mW.
5. **Le refus** : un essai est INVALIDE si l'app n'est pas dans l'état demandé ≥ 90 % du temps, a été relancée, s'est tue, ou si la puissance n'a pas été lue.

Pièges trouvés cette nuit (corrigés) :
- `chaldpr` : le crochet reposait le DPR dès que `curDPR` différait de la cible → `imgRegle` → `qlPose` toutes les 1,5 s : +0,4 à +0,9 W. Les essais DPR de 04 h 55-05 h 45 mesuraient le crochet (refusés). Corrigé en comparant le PLAFOND (`DPR_CAP`), build 1196.
  Posé une seule fois (build 1195), le plafond était remis à 1,25 au départ de la course (`mobile-tactile.js` : `DPR_CAP=dprPlafond(fast)`).
- `?sans=crit20` ne change rien tant que le téléphone n'est pas « critical » (th=3) : inutile dans des essais de 3-5 min partis froids.
- La batterie : tenue à 80 % (recharge optimisée, `IsCharging=0`) jusqu'à 05 h 54, puis **la charge a repris** (≈ 3,6 W dans la batterie). `SystemLoad` ne compte pas la charge : la puissance reste juste ; la température de batterie, elle, monte plus vite (pente faussée).
- **Mode économie d'énergie : `eco=0` sur TOUTE la série** (le battement le lit à chaque ligne). iOS le coupe tout seul quand la charge passe 80 %. Je ne l'ai pas rallumé (réglage système). Les chiffres sont donc SANS mode économie.
- Luminosité `lum=0` (écran au minimum) toute la nuit : l'écran pèse très peu ici ; en jeu de jour il pèse plus.

## Protocole (commandes exactes)

```sh
R=~/cash-car/ios-ultime-mesures/chaleur; Q=~/cash-car/qualite/outils/banc-chaleur
# 1. le journal (avec CCBANC) et le lecteur de puissance
nohup sh -c '~/Library/Python/3.9/bin/pymobiledevice3 syslog live --udid 00008110-000621041468401E 2>>journal.err | grep --line-buffered -E "CCBANC|thermal budget|New state|Budget Trace|thermalLevel,|CLTM|setDetailedThermalPowerBudget" >> journal.txt' &   # (dans $R)
nohup /usr/bin/python3 $Q/batterie.py 2 >> $R/batterie.txt 2>> $R/batterie.err &
# 2. une liste « nom|interrupteurs » (une référence toutes les 2-3 variantes), puis la série
TBAT_MAX=3020 REPOS_MIN=180 nohup sh $Q/serie-v3.sh $R/listes/b3.txt 180 &     # (TBAT_MAX=9999 si la batterie charge)
# 3. lire
tail $R/resultats.txt                      # une ligne par essai, VALIDE / INVALIDE (raisons)
sh $Q/recalcul.sh "2026-11-17 04:05"       # refait tous les résumés → $R/recalcul.jsonl
CLE=W_30_180 python3 $Q/bilan.py $R/recalcul.jsonl   # chaque variante contre ses 2 références voisines
python3 $Q/plancher.py                     # la page noire, lue dans les repos
```
Arrêter proprement entre deux essais : `touch $R/STOP`. Compiler un build de mesure : `sh $R/b/compiler-banc.sh <N>` (copie dans `builds/build<N>-banc.app`).

## La preuve de répétabilité

Puissance moyenne 30 → 180 s (compteurs de la jauge), course de référence (nuages/midi, moteur 15→29, son, 30 i/s, QL 0-1,7, DPR 1,25) :

| essai | heure | batterie | W 30-180 s | W 30 s-fin | pente temp. batterie |
|---|---|---|---|---|---|
| r1-ref | 04:11 | 80 %, ne charge pas | 3,75 | 3,86 | 0,38 °C/min |
| r2-ref | 04:20 | idem | 3,70 | 3,80 | 0,34 |
| r3-ref | 04:29 | idem | 3,89 | 4,05 | 0,42 |
| b-ref1 | 04:41 | idem | 3,72 | 3,85 | 0,33 |
| b-ref2 | 05:15 | idem | 3,52 | 3,68 | 0,29 |
| b-ref3 | 05:51 | la charge reprend | 3,94 | 3,97 | (0,89, faussée) |
| c-ref4 | 06:11 | en charge 89 % | 3,94 | 3,94 | (faussée) |
| c-ref5 | 06:37 | en charge 98 % | 4,09 | 4,09 | (faussée) |

**3 références de suite : 3,75 / 3,70 / 3,89 W = ±2,5 %** (objectif ±15 % : tenu). Les 8 : 3,82 W ± 0,17 (4,4 %). Sans charge (5) : 3,72 ± 0,12 W ; pente 0,35 ± 0,04 °C/min.
La mesure v2 (budget thermique) variait de ×3 entre trois références : elle dépendait de la charge de la batterie et de la chaleur de départ, que la puissance ignore.

## Les essais valides (chaque variante contre ses deux références voisines)

`CLE=W_30_180 python3 bilan.py recalcul.jsonl` :

| variante | n | W | écart à la référence | répété ? |
|---|---|---|---|---|
| page noire (plancher : écran au minimum + système), lue dans les repos | 11 | **1,41** (± 0,09) | −2,4 W | oui |
| page noire, batterie en charge | 9 | 1,69 (± 0,07) | | oui |
| accueil (menu, DPR 2,0, son) | 1 | 2,62 | −1,4 W (−35 %) | non |
| course SANS rendu 3D (`chalrendu=0`) | 2 | 2,92 | **−0,9 W (−23 %)** (−0,61 / −1,17) | oui |
| course 20 i/s (`cadfps=20`) | 1 | 3,28 | −0,45 W (−12 %) — QL monte à 1 | non |
| partie lente (sans `chalpal` : moteur 0→16, ~200 km/h) | 1 | 3,22 | −0,5 W (−14 %) | non |
| course sans HUD (`chalhud=0`, #hud caché) | 1 | 3,75 | −0,26 W (−7 %) — dans le bruit (2σ ≈ 0,34) | non |
| course sans son | 2 | 3,77 | −0,08 W (−2 %) (−0,06 / −0,11) — dans le bruit | oui |
| DPR 1,0 / 0,75 | — | — | **NON MESURÉ** : crochet faux (voir plus haut) ; corrigé dans le build 1196, jamais rejoué | — |
| `?sans=crit20`, `?sans=jsimage`, `?sans=progdouble`, pause | — | — | pas joués (temps) — crit20 n'agit qu'à « critical » | — |

## LE BILAN D'ÉNERGIE DU JEU (13 Pro, branché au Mac, écran au minimum, mode économie ÉTEINT)

Course de référence ≈ **3,8 W** pour tout le téléphone :
- **plancher (écran + système + page vide) : 1,4 W (37 %)** — prouvé (11 repos) ;
- **image 3D (WebGL, puce graphique + envoi des images) : ≈ 0,9 W (23 %)** — prouvé à 2 essais (0,6 à 1,2 W) ;
- **le reste du jeu (script, physique, WebKit qui compose la page, HUD, vibrations) : ≈ 1,4 W (37 %)** — par différence ;
  dedans, le HUD ≈ 0,25 W (1 essai, non prouvé) ; le son ≈ 0,1 W (2 essais, dans le bruit : le son ne coûte presque rien).
- **20 i/s rapporte ≈ 0,45 W (12 %)**, la **partie lente ≈ 0,5 W (14 %)** : 1 essai chacun, non prouvés.
- **l'accueil** coûte 1,2 W au-dessus du plancher (1 essai) : moins que la course, mais pas rien (DPR 2,0 au menu).
- La température de batterie monte de ≈ 0,35 °C/min en course (sans charge), ≈ 0,15 °C/min sans rendu 3D, et baisse à l'accueil.
- **Tenue avant « serious » / « critical » : NON MESURÉE.** Aucun essai de 3-5 min parti frais n'a atteint serious (th max 1, budget du noyau jamais < 2,5 W).
  La longue course prévue (25 min) n'a pas eu lieu : **le Mac s'est endormi de 06 h 48 à 09 h 00** (journal et lecteur arrêtés, essai c-20ips2 perdu).
  Pendant ces 2 h 12, l'app a roulé seule en course sur la batterie du téléphone (le port du Mac endormi ne la nourrissait plus) : **99 % → 46 %**, sans aucune mesure.
  (Un ordre de grandeur seulement : 53 % de ~9 Wh en 2,2 h ≈ 2,2 W moyens — plus bas que 3,8 W : bridage, ou course arrêtée ; rien ne permet de le dire.)

À faire ensuite : empêcher le Mac de dormir (`caffeinate -dimsu` en tête de série), rejouer DPR 1,0 / 0,75 (build 1196), 20 i/s et partie lente ×2, une longue course de 25 min pour serious/critical, et une série AVEC le mode économie (Sacha le rallume : iOS l'éteint seul au-dessus de 80 %).
