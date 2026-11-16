# LOT « SENTINELLE » (2026-11-16) — branche qa/sentinelle

Build 118, 25 min de jeu, « beaucoup de lag ». Dans deux longues courses, TOUT le fil principal ralentit ×8 par paquets.
But du lot : MESURER pour trancher entre bridage du processeur par iOS, ramasse-miettes, ou autre.
Tout est actif SEULEMENT avec le mouchard (build de mesure `?perfrec=2`). Ailleurs : rien n'est posé, coût nul.

## Ce qui est ajouté
1. **Sentinelle du processeur** (`code/moteur/mouchard-gels.js`, `mgSentinelle`) : 200 × 1024 additions sur un Int32Array pré-alloué.
   Aucune allocation. ≈ 0,2 ms à froid. Mesurée une fois par seconde (colonne 8 de `M`), à chaque image de loop > 60 ms et à chaque gel (`G[35]`).
   Réchauffée 12 fois au lancement (sinon les premières tournent dans l'interprète). `?sans=sentinelle`.
2. **Témoin du ramasse-miettes** : `FinalizationRegistry` + un appât par seconde. Par seconde : passages (`M[9]`, rappels à < 5 ms = un passage)
   et âge du dernier appât ramassé (`M[10]`, ms). `G[36]` = ms depuis le dernier passage. `?sans=mgtemoin`. Sans FinalizationRegistry : -1 partout.
3. **Dans la course** (`code/moteur/enregistreur-perf.js`) :
   - `M[11]` état natif par seconde : thermique ×1000 + branché ×100 + autre musique ×10 + économie (9 = inconnu). Lu sur `__ccThermique`, `__ccBranche`,
     `__ccAutreSon`, `__ccEco` (posés par JeuViewController.swift).
   - `c.Mw` = 12 (largeur de `M` ; les anciens fichiers n'en ont pas = 8).
   - `c.x0` / `c.x1` : [âge de la vue web s, durée du dernier arrière-plan s, textures, géométries, programmes] au départ et à la fin.
   - `c.D` : fin de chaque decodeAudioData des segments de musique : [t ×10 s, durée ms, Ko]. Crochet `window.__ccDecode` appelé par
     `VERSION PRINCIPALE/assets/audio/pouce-bleu-jeu.js` (joueurSegments), posé seulement par la boîte de vol + mouchard. Son `?v=17 → 18`.
   - `c.TR` : somme des 8 tranches sur les images de loop LÉGÈRES (< 25 ms) et leur nombre en [8] : la référence de chaque tranche.
4. **analyse-vol.py** : chaque tranche est rapportée à SA référence (c.TR, sinon médiane des tranches légères tirées de G).
   ≥ 4 tranches à ×3 (et ≥ 3 ms) → « fil entier ralenti ×N ». Sinon la tranche la plus anormale (et plus la plus lourde : c'était l'artefact « b4 effets »).
   Affiche la sentinelle (moyenne, quart rapide, par 10 s en ×, aux gels), le témoin, l'état natif, x0→x1, les décodages et s'ils précèdent un gel.
   Compatible avec les anciens fichiers (vérifié sur vol-1114-2253, vol-1115-1546, vol-1116-2058).
5. Banc : `outils/banc-perf/sentinelle.py` (et `COUT=1` pour le coût seul). Mesures : `outils/banc-perf/mesures/sentinelle*.json`.

## Prouvé
- **vol-1116-2058.json** : les deux longues courses sortent « fil entier ralenti » : 19 h 44 → 140 gels ×8,5 médian (4,9-13) ; 19 h 48 → 120 gels ×9,2 (7,1-12).
  Avant : « boucle d'avant · b4 effets » (136 et 115 gels).
- **Banc Chrome** (tel=1, iPhone14,2, perfrec=2, charge 1,7-2,6) : sentinelle médiane 0,200 ms à ×1 → 1,300 / 1,400 ms à ×6 (deux tours) → 0,200 ms de retour à ×1.
  Soit ×6,5-7. En `M` (par seconde) : 0,2-0,3 ms à ×1, 1,0-2,0 ms pendant le ×6. L'analyse dit « par 10 s : 1,7 · 7,9 · 5,2 · 1,4 ».
- **Coût** (travail moyen par image, 40 s, ×1) : allumée 3,47 · 3,43 · 3,95 ms ; coupée 3,52 · 3,59 · 3,78 · 3,82 · 3,86 ms. Pas de coût au-dessus du bruit.
  Coût théorique : 0,2 ms par seconde = 0,02 % ; plus 0,2 ms par gel.
- Témoin (Chrome) : 32 passages en 48 s, appât d'âge médian 210 ms. Décodage simulé rangé dans `D`. x0→x1 : textures 120→128, programmes 154→155.
- **Stockage** : +18 octets par seconde de course (4 colonnes), +2 nombres par ligne G (≈ 2 Ko pour 240 gels), D ≤ 1,5 Ko, x0/x1/TR ≈ 150 o.
  Course de 290 s : 45 Ko → ≈ 53 Ko (+17 %). 16 courses ≈ 850 Ko, loin des ≈ 5 Mo. Plafond de M passé de 8 000 à 12 000 nombres (1 000 s, comme avant).

## NON prouvé
- La sentinelle n'a jamais tourné sur le 13 Pro. **L'horloge de la vue web d'iOS est au milliseconde** (vu sur R : tous les intervalles ×10 sont ronds) :
  une mesure seule vaut 0 ou 1 ms à froid, 1 ou 2 ms bridé ×8. Il faut lire les MOYENNES (par 10 s, sur les gels d'un paquet). La phase de l'horloge
  est supposée au hasard (non vérifié sur le téléphone).
- La durée exacte à froid sur l'A15 (≈ 0,2 ms attendu, JIT de JSC) : à lire dans le premier vol.
- Le témoin dit « un passage a eu lieu », pas sa durée. Avec un appât par seconde, il voit au plus ≈ 1 passage par seconde ; l'âge de l'appât court = ramassages fréquents.
- `__ccDecode` n'a pas vu un vrai décodage (le banc est muet) : appel simulé seulement.
- Dans Chrome ×6, les gels du banc sortent « après rendu » et pas « fil entier » : beaucoup de tranches de référence sont < 0,5 ms (garde des 3 ms). Le banc ne remplace pas le téléphone.
- Petites courses (< 5 images légères dans G) : la référence tirée de G est bruitée. Les nouveaux builds ont `c.TR`.

## Comment trancher sur le 13 Pro (build de mesure `perfrec=2`)
`python3 outils/banc-perf/analyse-vol.py <vol.json>` → « LES GELS : QUI ».
- Sentinelle ×N pendant le paquet ≈ le ×N du « fil entier » → **bridage du processeur** (iOS).
- Sentinelle stable, témoin avec passages juste avant les gels, appât jeune → **ramasse-miettes**.
- Ni l'un ni l'autre → autre (lire D, l'état natif, x0→x1).
