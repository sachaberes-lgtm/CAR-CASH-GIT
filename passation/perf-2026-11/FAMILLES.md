# FAMILLES — qui dessine quoi au palier 0, map par map (C3.a, 5/11/2026)

Mesuré par `python3 outils/banc-perf/familles.py --palier 0 --tel --json x.json <carte:météo …>` (Chrome iPhone émulé 390×844 ×3, processeur ×4, `?garde=1&palier=0&tel=1&pistegraine=777`, un vrai portail vers chaque map). Trois instants fixes par map (la caisse reposée par `dbgPortail(d)` à d = 1800, 900, 2800 m de la fin de la piste, 80 m de route attendus), `dbgCout()` puis `dbgAppels(70)` avec `__appelsDetail=1`. Les compteurs ne dépendent pas de la charge (machine à 3.5). Le tableau retient l'instant le plus lourd en triangles.

Lecture : `appels` / `triangles` = `dbgCout()` (image entière, ombre comprise) ; les familles sont celles de `dbgAppels` (appels / milliers de triangles, hors ombre). ⚠ L'écran de mort ou un autre endroit de la piste peut dépasser ces valeurs (Fable avait lu 348 k aux dunes à la mort contre 207 k ici).

Nouveaux noms posés par C3.a : `piste bitume|flancs|rails néon|nappe néon|ligne centrale` (+ ` maigre`/` moyen`), `pièces 1 €`/`pièces 2 €`, `nuages v8|boules|cubes cassés`, `grotte roche|poussière|décor`, `canyon décor`, `dunes décor`, `banquise décor`, `crypto tours lointaines|faisceaux`, `orbite satellites`.

## Récapitulatif (AVANT, p0, instant le plus lourd des trois)

| map | appels | triangles | par instant (appels/k tri) |
|---|---|---|---|
| nuages:midi | 151 | 425k | 1800: 109/292k · 900: 106/287k · 2800: 151/425k |
| dunes:soir | 113 | 191k | 1800: 106/169k · 900: 84/147k · 2800: 113/191k |
| canyon:matin | 114 | 341k | 1800: 92/288k · 900: 85/250k · 2800: 114/341k |
| grotte:matin | 142 | 302k | 1800: 142/302k · 900: 140/181k · 2800: 94/190k |
| banquise:midi | 123 | 149k | 1800: 109/136k · 900: 99/104k · 2800: 123/149k |
| ville:pluie | 95 | 213k | 1800: 95/197k · 900: 86/136k · 2800: 88/213k |
| crypto:midi | 119 | 252k | 1800: 90/189k · 900: 98/205k · 2800: 119/252k |
| espace:matin | 115 | 311k | 1800: 92/262k · 900: 95/250k · 2800: 115/311k |
| foret:midi | 110 | 479k | 1800: 105/348k · 900: 97/252k · 2800: 110/479k |
| jade:midi | 126 | 757k | 1800: 103/278k · 900: 104/195k · 2800: 126/757k |

## nuages:midi

| appels | tri | famille |
|---|---|---|
| 22 | 131k | ShaderMaterial <nuages v8> |
| 18 | 98k | ShaderMaterial[I] <coton> |
| 2 | 38k | MeshPhongMaterial <piste bitume {BufferGeometry ro0  a39c8e}> (scène) |
| 4 | 32k | MeshBasicMaterial <piste rails néon {BufferGeometry ro0  a9336f}> (scène) |
| 4 | 32k | MeshBasicMaterial <piste nappe néon {BufferGeometry ro1 T add  f24aa0}> (scène) |
| 4 | 16k | MeshLambertMaterial <piste flancs {BufferGeometry ro0  3a3833}> (scène) |
| 9 | 13k | ShaderMaterial |
| 8 | 13k | MeshPhongMaterial |

## dunes:soir

| appels | tri | famille |
|---|---|---|
| 3 | 24k | MeshBasicMaterial <piste rails néon {BufferGeometry ro0  1595b2}> (scène) |
| 3 | 24k | MeshBasicMaterial <piste nappe néon {BufferGeometry ro1 T add  1fd6ff}> (scène) |
| 1 | 20k | MeshPhongMaterial[I] <pièces 1 € {BufferGeometry ro0  808080}> (scène) |
| 1 | 19k | MeshPhongMaterial <piste bitume {BufferGeometry ro0  a39c8e}> (scène) |
| 3 | 12k | MeshLambertMaterial <piste flancs {BufferGeometry ro0  3a3833}> (scène) |
| 7 | 9k | MeshPhongMaterial |
| 1 | 9k | MeshPhongMaterial[I] <pièces 2 € {BufferGeometry ro0  808080}> (scène) |
| 7 | 8k | MeshPhongMaterial < {BufferGeometry ro0 fruit ffffff}> (scène) |

## canyon:matin

| appels | tri | famille |
|---|---|---|
| 3 | 90k | ShaderMaterial[I] <canyon décor> |
| 3 | 27k | MeshBasicMaterial <piste rails néon {BufferGeometry ro0  1cb9a0}> (scène) |
| 3 | 27k | MeshBasicMaterial <piste nappe néon {BufferGeometry ro1 T add  2b15f0}> (scène) |
| 1 | 24k | MeshPhongMaterial[I] <pièces 1 € {BufferGeometry ro0  808080}> (scène) |
| 1 | 19k | MeshPhongMaterial <piste bitume {BufferGeometry ro0  a39c8e}> (scène) |
| 3 | 14k | MeshLambertMaterial <piste flancs {BufferGeometry ro0  3a3833}> (scène) |
| 1 | 12k | MeshPhongMaterial[I] <pièces 2 € {BufferGeometry ro0  808080}> (scène) |
| 7 | 10k | ShaderMaterial |

## grotte:matin

| appels | tri | famille |
|---|---|---|
| 4 | 77k | MeshPhongMaterial <piste bitume {BufferGeometry ro0  a39c8e}> (scène) |
| 1 | 39k | MeshPhongMaterial[I] <pièces 1 € {BufferGeometry ro0  808080}> (scène) |
| 4 | 38k | MeshBasicMaterial <piste rails néon {BufferGeometry ro0  3ef0ff}> (scène) |
| 4 | 38k | MeshBasicMaterial <piste nappe néon {BufferGeometry ro1 T add  3ef0ff}> (scène) |
| 35 | 31k | ShaderMaterial <grotte roche> |
| 4 | 19k | MeshLambertMaterial <piste flancs {BufferGeometry ro0  3a3833}> (scène) |
| 1 | 14k | MeshPhongMaterial[I] <pièces 2 € {BufferGeometry ro0  808080}> (scène) |
| 4 | 10k | MeshBasicMaterial <piste ligne centrale {BufferGeometry ro1 T  f2eee6}> (scène) |

## banquise:midi

| appels | tri | famille |
|---|---|---|
| 1 | 49k | MeshPhongMaterial[I] <pièces 1 € {BufferGeometry ro0  808080}> (scène) |
| 1 | 22k | MeshPhongMaterial[I] <pièces 2 € {BufferGeometry ro0  808080}> (scène) |
| 4 | 17k | ShaderMaterial <banquise verglas> |
| 9 | 13k | ShaderMaterial |
| 8 | 12k | MeshPhongMaterial |
| 4 | 11k | ShaderMaterial <banquise neige> |
| 6 | 4k | MeshPhongMaterial < {BufferGeometry ro0 fruit ffffff}> (scène) |
| 4 | 4k | MeshDepthMaterial |

## ville:pluie

| appels | tri | famille |
|---|---|---|
| 1 | 46k | MeshPhongMaterial[I] <pièces 1 € {BufferGeometry ro0  808080}> (scène) |
| 2 | 38k | MeshPhongMaterial <piste bitume {BufferGeometry ro0  a39c8e}> (scène) |
| 1 | 28k | MeshPhongMaterial[I] <pièces 2 € {BufferGeometry ro0  808080}> (scène) |
| 3 | 19k | MeshLambertMaterial[I] |
| 2 | 19k | MeshBasicMaterial <piste rails néon {BufferGeometry ro0  aff579}> (scène) |
| 2 | 19k | MeshBasicMaterial <piste nappe néon {BufferGeometry ro1 T add  4af161}> (scène) |
| 2 | 10k | MeshLambertMaterial <piste flancs {BufferGeometry ro0  3a3833}> (scène) |
| 2 | 5k | MeshBasicMaterial <piste ligne centrale {BufferGeometry ro1 T  f2eee6}> (scène) |

## crypto:midi

| appels | tri | famille |
|---|---|---|
| 1 | 77k | MeshPhongMaterial[I] <pièces 1 € {BufferGeometry ro0  808080}> (scène) |
| 2 | 38k | MeshPhongMaterial <piste bitume {BufferGeometry ro0  a39c8e}> (scène) |
| 2 | 19k | MeshBasicMaterial <piste rails néon {BufferGeometry ro0  b28728}> (scène) |
| 2 | 19k | MeshBasicMaterial <piste nappe néon {BufferGeometry ro1 T add  ffc23a}> (scène) |
| 3 | 13k | MeshLambertMaterial[I] |
| 2 | 10k | MeshLambertMaterial <piste flancs {BufferGeometry ro0  3a3833}> (scène) |
| 7 | 8k | ShaderMaterial |
| 7 | 7k | MeshPhongMaterial |

## espace:matin

| appels | tri | famille |
|---|---|---|
| 4 | 67k | MeshPhongMaterial <piste bitume {BufferGeometry ro0  a39c8e}> (scène) |
| 1 | 58k | MeshPhongMaterial[I] <pièces 1 € {BufferGeometry ro0  808080}> (scène) |
| 4 | 34k | MeshBasicMaterial <piste rails néon {BufferGeometry ro0  7358d3}> (scène) |
| 4 | 34k | MeshBasicMaterial <piste nappe néon {BufferGeometry ro1 T add  ad853c}> (scène) |
| 1 | 32k | MeshPhongMaterial[I] <pièces 2 € {BufferGeometry ro0  808080}> (scène) |
| 9 | 17k | ShaderMaterial |
| 4 | 17k | MeshLambertMaterial <piste flancs {BufferGeometry ro0  3a3833}> (scène) |
| 7 | 11k | MeshPhongMaterial |

## foret:midi

| appels | tri | famille |
|---|---|---|
| 5 | 96k | MeshPhongMaterial <piste bitume {BufferGeometry ro0  a39c8e}> (scène) |
| 1 | 59k | MeshPhongMaterial[I] <pièces 1 € {BufferGeometry ro0  808080}> (scène) |
| 5 | 48k | MeshBasicMaterial <piste rails néon {BufferGeometry ro0  8ca82a}> (scène) |
| 5 | 48k | MeshBasicMaterial <piste nappe néon {BufferGeometry ro1 T add  c8f03c}> (scène) |
| 1 | 46k | ShaderMaterial <forêt sol> |
| 1 | 30k | ShaderMaterial[I] <forêt Ggsaule1> |
| 1 | 28k | MeshPhongMaterial[I] <pièces 2 € {BufferGeometry ro0  808080}> (scène) |
| 1 | 28k | ShaderMaterial[I] <forêt Ggpleureur1> |

## jade:midi

| appels | tri | famille |
|---|---|---|
| 10 | 471k | ShaderMaterial |
| 1 | 79k | MeshPhongMaterial[I] <pièces 1 € {BufferGeometry ro0  808080}> (scène) |
| 3 | 25k | MeshBasicMaterial <piste rails néon {BufferGeometry ro0  26bf89}> (scène) |
| 3 | 25k | MeshBasicMaterial <piste nappe néon {BufferGeometry ro1 T add  381fcd}> (scène) |
| 1 | 19k | MeshPhongMaterial <piste bitume {BufferGeometry ro0  a39c8e}> (scène) |
| 1 | 14k | ShaderMaterial[I] <jade 0-0 absorption> |
| 1 | 14k | ShaderMaterial[I] <jade 0-0 profondeur> |
| 1 | 14k | ShaderMaterial[I] <jade 0-0> |

## Ce que dit le tableau

- Partout le même trio : la **piste** (bitume + rails néon + nappe néon + flancs : 100 à 250 k, les rails et la nappe pèsent autant l'un que l'autre), les **pièces** (`pièces 1 €` jusqu'à 97 k : 336 triangles la pièce, toutes celles du couloir de 620 m devant ET derrière la caisse) et le décor propre à la map.
- Les budgets `PAL.B` existants ne portaient sur aucun de ces trois postes communs : c'est pourquoi le p0 dessinait presque autant que le p2.
- Le palier 0 à cet instant est déjà sous 150 appels partout ; trois maps dépassent 300 k aux instants lourds (nuages, forêt, canyon), l'espace et la grotte frôlent.
- Vu sans y toucher : `banquise:midi` compile 7 programmes EN COURSE au portail (la règle du jeu : zéro) ; jade (hors périmètre, B2) monte à 764 k au 3e instant (10 appels `ShaderMaterial` = 471 k).
