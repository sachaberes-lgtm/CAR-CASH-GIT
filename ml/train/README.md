# ml/train — la course qui s'apprend toute seule

24 voitures roulent sur la piste du jeu avec **la physique du joueur, les commandes du joueur, les
règles du joueur**. Chacune se débrouille. À la fin de la manche, **la moitié la plus nulle est
remplacée** par des enfants mutés de la moitié qui a gagné. On recommence. C'est tout — pas de
récompense inventée, pas de pilote assisté, pas de cerveau importé.

> Ce fichier remplace `COMPTE-RENDU.md`, `RAPPORT-SESSION-2026-09-08.md`, `HANDOVER.md` et
> `CRITIC-REPORT.md`, qui se recouvraient et se contredisaient par endroits.
> Ils sont dans `archive-2026-09-09/rapports/` si on a besoin du détail historique.

---

## 1. LA MANIÈRE DE BOSSER — la vraie leçon du 2026-09-09

Le problème du 8-9 septembre n'était pas technique. **Deux agents écrivaient dans `train.html` en
même temps.** Résultat : un dossier `results/` détruit par un commit de rangement (deux sessions
d'enregistrement de Sacha perdues), des mesures comparées entre deux versions différentes du même
fichier, et une demande de *conseil* traitée comme une demande de *code*.

**LES QUATRE RÈGLES.**

1. **UN SEUL AGENT ÉCRIT DANS `train.html` À LA FOIS.** C'est le fichier du jeu, 940 Ko, édité par
   épissures à ancres. Deux écrivains = ancres périmées, mesures incomparables, travail perdu.
   Les autres proposent un diff, ne l'appliquent pas.
2. **« DONNE-MOI UN CONSEIL » N'EST PAS « FAIS-LE ».** Quand Sacha demande quoi répondre à un autre
   agent, ou ce qu'il faut corriger, la livraison est **du texte**, pas un commit. Si le conseil vaut
   d'être codé, on le dit — et on attend le go.
3. **RIEN N'EST ANNONCÉ SANS AVOIR ÉTÉ VU OU MESURÉ.** Pas d'affirmation sur ce qui s'affiche à
   l'écran sans l'avoir regardé (`document.hidden` gèle la simulation : un onglet caché ne prouve
   rien). Si on ne peut pas voir : **« je ne peux pas voir »**.
4. **CE QUI N'EST PAS DANS GIT N'EXISTE PAS.** `results/` a été effacé parce qu'il était dans le
   `.gitignore`. Les démos et les champions sont versionnés depuis.

**ET LA RÈGLE QUI MANQUAIT.** Les quatre tests du harnais vérifiaient tous la **cohérence interne**
d'un run — même physique que le joueur, commandes humaines, protocole d'évaluation sain, trois
chiffres de comportement. **Aucun ne demandait ce que le run laisse derrière lui.** Le mode
entraînement gardait toute la population dans l'onglet et n'écrivait rien ; deux runs arrivés aux
générations 139 et 148 ont été perdus. Ni les agents ni le harnais ne l'ont vu — c'est Sacha qui a
posé la question. D'où `check-persist.js`, et la règle : **on vérifie la durabilité, pas seulement
la justesse.**

---

## 2. LE SOCLE VÉRIFIÉ (à ne pas re-débattre)

| Invariant | Prouvé par | Résultat mesuré |
|---|---|---|
| Le bot et le joueur partagent **une seule** physique (`stepCar`) | `check-iso.js` | écart max **0.000e+0** sur 3000 pas |
| Le bot ne peut émettre **que** des commandes atteignables au clavier | `check-actions.js` | **PASS**, 24/24 états, jamais gaz+cabré |
| Chaque voiture est notée sur plusieurs pistes distinctes, en moyenne | `check-eval.js` | PASS |
| La progression **survit** à un redémarrage | `check-persist.js` | PASS, 5 maillons de la chaîne présents |
| Le comportement en course, en trois chiffres | `check-live.js` | vitesse moyenne · dispersion à 2 s · % sur route à 5 s |

**Déterminisme.** Pas de temps fixe `1/60 s` + accumulateur, tout l'aléa passe par `TRAIN.rnd`
(mulberry32 graine). Le headless et le navigateur sortent **les mêmes chiffres** : c'est ce qui
permet de comparer deux versions du code au lieu de comparer deux coups de chance.

---

## 3. COMMENT ON VÉRIFIE

```bash
cd ml/train && VERIFIER.bat
```

Cinq étapes, dans l'ordre : syntaxe → isomorphisme physique → conformité des commandes →
simulation + protocole d'évaluation → **persistance**. Puis les trois chiffres, puis l'ouverture du
navigateur. ⚠ **Changer d'onglet met la simulation en pause** (`document.hidden`) : une mesure prise
sur un onglet caché ne vaut rien.

Autres entrées :
- `LANCER-TRAIN.bat` — la course qui s'entraîne, à regarder.
- `ENREGISTRER.bat` — sert le jeu **et** reçoit les fichiers (`rec-server.js`, port 8766).
  C'est lui qui écrit `results/champion.json` quand la simulation sauvegarde.
- `node multi-train.js` — N graines sur N cœurs.
- `node sim-train.js --seed 42 --gens 25` — un run reproductible, sans navigateur.

**La sauvegarde.** Touche `S` en cours d'entraînement, et automatiquement toutes les
`TRAIN.AUTOSAVE` générations (10 par défaut, `?autosave=N` pour changer) — **avant** le
renouvellement de la population, sinon un onglet fermé entre deux générations emporte tout. Le
champion atterrit dans `results/champion.json` + une copie horodatée dans `results/champions/`.
À la génération 0, le jeu **repart de ce fichier**.

---

## 4. CE QUI RESTE OUVERT, par impact décroissant

1. **La mesure du correctif de vol n'a jamais été faite.** En vol, `car.s` est gelé : 6 entrées sur
   11 restaient constantes pendant les 6 secondes, le cerveau tenait donc la même commande — d'où
   « elles partent toutes en virage à fond à gauche ». Corrigé (`car.lastNearS` + une 12ᵉ entrée : le
   cap en vol). **Non mesuré** : est-ce que le taux d'atterrissage remonte au-dessus des 9 % ?
2. **Le détecteur de raccourci ne se déclenche quasiment jamais** en course réelle : sa fenêtre de
   8-60 m contre une médiane réelle de 159 m. L'élargir change la **définition** d'un raccourci —
   c'est une décision de game design, pas un réglage.
3. **`CONES` / `c9.hit` est un état global partagé** : les 24 voitures ne courent donc pas dans le
   même monde au même instant. Ça bloque la parallélisation à l'intérieur d'une génération.
4. **12 cœurs, 1 utilisé** pendant une génération. `multi-train.js` ne parallélise qu'entre graines.
5. **Un pas de vol coûte 6,5× un pas au sol** (balayage O(NP) des points de piste à chaque frame).
   Un index spatial donnerait ~6× — avec `check-iso.js` qui doit rester à `0.000e+0`.

---

## 5. CE QUI A ÉTÉ ARCHIVÉ, ET POURQUOI

`archive-2026-09-09/` — rien n'est supprimé, tout reste dans git.

- **`clonage/`** — `clone.js`, `bench-clone.js`, `xp-openloop.js`. Le clonage comportemental
  (apprendre le pilotage sur les parties de Sacha) a été **abandonné sur sa décision** : *« je veux
  juste mettre les voitures avec la même physique et les mêmes règles que le joueur, et après chacune
  se démerde »*. À recycler si un jour on veut un **fantôme du record** : le lecteur de démos sait
  déjà rejouer une partie et recalculer les entrées à partir de l'état brut + la graine de piste.
- **`diagnostics/`** — les sondes jetables d'une question précise (saturation des entrées,
  percentiles, fenêtre du détecteur de raccourci, généralisation, pilote au sol, bancs du critique).
  Leur **valeur est dans leurs résultats**, repris au §2 et §4 ; le code est à usage unique.
- **`rapports/`** — les quatre documents que ce README remplace.
- **`sauvegardes-html/`** — trois copies de `train.html` datées de la nuit du 8 au 9, plus
  `train-inject.js`. Git fait ce travail mieux qu'elles.
