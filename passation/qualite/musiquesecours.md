# Lot MUSIQUESECOURS — la musique en segments ne reste plus muette 10 s après un fichier raté (19/11)

Branche `qa/musiquesecours`, bâtie sur `origin/qualite-appareil` (307308d24). Chantier de finition du 19/11.
Corrige le défaut relevé par le contrôle du lot MUSIQUECALME (voir `musiquecalme.md`).

## Le défaut
En régime calme (à chaud), si le fichier du segment suivant ratait DEUX fois (le « suivant », puis le secours à 1 s du bord),
plus rien ne le redemandait une fois le bord passé : le segment en cours restait un trou, soit 10 s muettes (4 mesures) et une coupe nette au bord.
Avant le lot MUSIQUECALME, la garde relançait le fichier à chaque passage.

## Ce qui change
Un seul fichier de jeu : `VERSION PRINCIPALE/assets/audio/pouce-bleu-jeu.js`, fonction `gardeCalme` (3 lignes). Toujours un seul décodage à la fois.
Plus `code/page/bibliotheques.html` : `pouce-bleu-jeu.js?v=19` passe à `?v=20`. index.html réassemblé en local, pas commité.
1. **Le segment en cours est un trou** : si le palier joué ne couvre pas la mesure en cours et que son fichier n'est ni décodé ni en chargement, on le relance (`secours`). La reprise à la mesure suivante le pose dès qu'il est décodé. C'est ce que demandait la fiche.
2. **Le suivant a raté** : on le redemande dès que `charge` le permet (1 s après l'échec, 3 essais en tout), au lieu d'attendre 1 s avant le bord. Ça laisse le temps d'un 3e essai avant le bord.
3. **Le secours à 1 s du bord** : si le fichier visé a déjà raté, il demande plutôt la suite du palier joué (si elle n'a pas raté, elle).

Le point 1 seul ramène le trou de 4 mesures à 1 (banc ci-dessous) : un fichier raté deux fois juste avant le bord ne peut pas être redécodé à temps. Les points 2 et 3 ferment ce dernier trou.
Rien ne change tant qu'aucun fichier ne rate (preuve ci-dessous) ; au frais, rien ne change du tout.

## Preuves (Node, sans son, sans Chrome)
Banc : `outils/banc-musiquecalme/sim.cjs`, qui gagne l'injection d'échec : `FAILT=<ms> FAILN=<n>` = le premier fichier demandé après FAILT (horloge virtuelle) rate ses n premiers chargements.
- **Le défaut, avant ce lot** (`FAILT=60000 FAILN=2`) : dans les 4 essais calmes « scie », « boosts », « pb scie », « pb boosts » : **4 mesures sans voix, 1 coupe nette**.
- **Avec le point 1 seul** : 1 mesure sans voix, 1 coupe nette.
- **Avec le lot** : FAILT = 60, 61, 63,5, 65, 68, 75, 90, 97, 120, 150 s × FAILN = 1 et 2, les 16 essais chaque fois : **0 mesure sans voix, 0 coupe nette**, 0 à deux voix, 0 mauvais fichier, 0 départ inexact, au plus 1 décodage à la fois.
  Et 5 graines × 300 s, moteur +1 toutes les 3 s, FAILN = 2 et 3 : pareil, 0 partout (à 3 échecs le fichier est condamné, le secours prend la suite du palier joué).
- **Sans échec, rien ne bouge** : la sortie du banc est identique (`diff`) à celle du lot MUSIQUECALME (fichier de 307308d24, `--source`).
- **`?sans=musiquecalme` = l'avant, au bit près** : sortie identique entre le fichier de 307308d24 et le nouveau, sous `--qs '?sans=musiquecalme'`, sans échec ET avec `FAILT=60000 FAILN=2`.
- `node --check` OK ; `node code/assembler.cjs --depuis-morceaux` → index et 349 morceaux d'accord ; gardes démarrage, allègement, charte : OK.

## Non vérifié
- Pas de banc Chrome, rien sur le téléphone, aucune écoute.
- Le banc fait rater le fetch (`ok: false`) ; un `decodeAudioData` qui rejette passe par le même chemin (`RATE`), mais n'a pas été simulé à part.
- Le point 3 peut faire jouer à chaud un segment de l'ancien palier au lieu du visé quand le visé a raté : la bascule attend alors le segment d'après (≈ 10 s de retard en plus, seulement après un échec).
