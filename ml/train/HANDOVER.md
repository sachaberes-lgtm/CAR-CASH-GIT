# PASSAGE DE RELAIS — mode entraînement CASH CAR
### À lire en entier avant de toucher une ligne. Écrit le 2026-09-08.

> Ce document est fait pour qu'un agent qui n'a jamais vu ce projet puisse travailler dessus sans
> refaire les erreurs qui ont coûté une journée. Il remplace toute connaissance orale.
> L'historique détaillé est dans `RAPPORT-SESSION-2026-09-08.md`. Ici : **comment travailler**.

---

## 1. Ce que c'est, en dix lignes

`ml/train/train.html` est le jeu CASH CAR (Three.js, un seul fichier) + un mode entraînement.
Avec `?train=1`, 24 voitures pilotées par un petit réseau de neurones (MLP 11→16→4, écrit à la main,
**aucune librairie**) évoluent par neuroévolution. Avec `?rec=1`, le jeu enregistre les parties du
joueur pour en cloner le pilotage.

**L'invariant fondateur : le joueur et les bots exécutent LA MÊME physique.** Une seule fonction,
`stepCar(car, input, dt, world)`. Il n'existe aucune copie. C'est vérifié mécaniquement, au bit près.

**L'objectif du jeu, dit par le propriétaire :** *« leur but est juste de franchir la ligne d'arrivée
le plus vite possible et je veux qu'elles apprennent à contrôler leur corps pour y arriver. »*

---

## 2. LA RÈGLE DE MÉTHODE (celle qui a manqué)

**Rien n'est vrai tant que ce n'est pas mesuré.** Au cours de la session du 2026-09-08, l'agent
précédent a affirmé six choses par déduction : les six étaient fausses, et c'est le propriétaire —
non-développeur, qui regardait simplement son écran — qui les a réfutées à chaque fois.

Concrètement :
- **Ne jamais décrire ce qui se passe à l'écran sans l'avoir vu.** Le panneau d'aperçu se gèle
  (`document.hidden` met la simulation en pause). Si tu ne peux pas voir : **dis que tu ne peux pas
  voir**. C'est pour ça que `check-live.js` existe.
- **Ne jamais lire une entrée normalisée comme une mesure physique.** Elles sont plafonnées.
  Utilise l'état brut (`etat` dans les démos). Une affirmation « le joueur roule à 144 km/h » lue sur
  `clamp(v/80)` était fausse d'un facteur 1,7 : il roule à 243.
- **Ne jamais sonder le réseau avec un état fabriqué à la main.** Il se comporte autrement en
  situation. Mesure en course.
- **Attention aux ratios de composition.** « % de morts en airtime » monte quand les autres causes
  de mort disparaissent : ça ressemble à une régression alors que c'est un progrès. Mesure des taux,
  pas des parts.

---

## 3. LES INVARIANTS, ET COMMENT LES VÉRIFIER

`VERIFIER.bat` (double-clic) enchaîne tout et finit par ouvrir le jeu. En détail :

| commande | ce qu'elle garantit | verdict attendu |
|---|---|---|
| `node check-syntax.js` | le gros script parse | `OK syntaxe JS` |
| `node check-iso.js` | joueur et bots = même physique | **`écart max 0.000e+0`** |
| `node check-actions.js` | le bot ne peut pas produire une commande inhumaine | **`PASS`**, 24 états |
| `node sim-train.js` | l'entraînement tourne, déterministe | `SIM TRAIN OK` |
| `node clone.js` | entraîne un cerveau sur `results/demos/` | passe son tour s'il n'y a rien |
| `node check-live.js` | **les trois chiffres que le propriétaire regarde** | voir §6 |

**Si `check-iso.js` n'est pas à 0.000e+0, arrête tout et répare.** C'est l'invariant le plus cher du
projet : trois passes de correction et deux agents critiques avaient échoué à le tenir avant qu'on
supprime la copie de physique.

Le navigateur et le headless donnent **exactement les mêmes lignes** sur la même graine. Si ce n'est
plus le cas, quelque chose a introduit de l'aléa non semé.

---

## 4. INTERDITS

- **`demo/cash-car-demo/index.html`** — c'est la démo déployée sur Vercel. Jamais.
- **`survTick` (~l. 9900-10150 de train.html)** — la meute du mode Survivant. Elle a sa propre
  physique simplifiée, **c'est voulu**, ce n'est pas une copie à supprimer.
  ⚠ En revanche son **pilote** est une mine : son volant est
  `phiT = clamp(Δlat/(max(6,v·SPD)·0,9), ±0,62)` puis `st = clamp((phiT−psi)·4, ±1)`, et sa physique
  au sol est déjà celle du joueur. Le propriétaire a proposé de le porter comme contrôleur au sol —
  bonne idée, non faite.
- **`stepCar` et tout ce qu'il appelle** — sauf mandat explicite, et alors `check-iso.js` doit
  rester vert.
- **`ml/train/results/demos/`** — ⚠ **CE DOSSIER A DÉJÀ ÉTÉ DÉTRUIT UNE FOIS**, le 2026-09-08 à
  12h18, par un ménage de fichiers non suivis (commit `a38cb91`). Deux sessions de jeu perdues.
  Ce sont les **seules données que le projet ne sait pas régénérer** : un cerveau se ré-entraîne,
  une piste se reconstruit depuis sa graine, une partie jouée ne revient jamais. Elles sont
  désormais **versionnées dans git** exprès. Ne les remets pas dans `.gitignore`.

---

## 5. LES PIÈGES TECHNIQUES

- `rg` / `search_files` **échouent** sur ce chemin. Utiliser
  `cd ~/Documents/GitHub/CAR-CASH-GIT/ml/train && grep -n "motif" train.html`.
- `node` veut des chemins Windows natifs (`C:\Users\...`), pas `/c/Users/...`.
- **`train.html` est en CRLF.** Un script qui le réécrit doit le rendre en CRLF, sinon les ancres de
  recherche suivantes échouent.
- Le `<script>` principal est celui qui contient `survTick` **ET** `buildTrack` (pas le premier).
- `window.__TRAIN` et `window.__ISO` ne sont exposés qu'avec **`?sim=1`** dans l'URL. `__ISO` est ce
  qui rend `check-iso.js` possible : ne pas le retirer.
- Constantes : `FALL_G=33`, `SPD=0.5`, `ROAD_HALF=14`, `THICK=2.6`, `GRAV=9.8*.55`, `AIR_MAX=6`,
  `AIR_ASSIST=1.0`, `TURN_HS=.0035`.
- Commentaires **en français**, style compact, voix du projet (imagée, précise).

---

## 6. L'ÉTAT EXACT AU MOMENT DU RELAIS

**Ce qui est fait et vérifié**
- physique unique (`stepCar`), `check-iso.js` = 0.000e+0
- pas de temps fixe + tout l'aléa semé → navigateur == headless
- espace d'action du bot = celui du joueur (état de touches, gaz/assiette couplés), `check-actions.js` PASS
- entrées re-normalisées sur les percentiles mesurés : **10 sur 11 dans la cible**
- démos rejouables : graine de piste **par frame** + état brut ; `clone.js` **recalcule** les entrées
  au lieu de les relire → un futur changement d'échelle ne coûte plus une session de jeu

**Le point de départ à battre** (départ aléatoire, `node check-live.js`) :

| | graine 3 | graine 5 |
|---|---|---|
| vitesse moyenne | 26 km/h | 24 km/h |
| écart-type des positions à t=2 s | 22,1 m | 16,0 m |
| sur la route à t=5 s | 29 % | 46 % |

*Repère : le propriétaire, en jouant, roule à **243 km/h de médiane**.*

**CE QUI BLOQUE, ET C'EST LA PREMIÈRE CHOSE À FAIRE**
`results/demos/` est **vide**. Sans démo, pas de clonage. Demander au propriétaire de lancer
`ENREGISTRER.bat` et de jouer **2-3 minutes de conduite propre** — tenir la route, corriger ses
dérives, varier la vitesse, **pas de saut volontaire**.
⚠ Le brief inverse (« sors de la route pour sauter ») a déjà été donné une fois : il a produit un
clone qui poussait vers le fossé à toutes les positions. Ne pas le refaire.

---

## 7. CE QU'IL RESTE À FAIRE, PAR EFFET DÉCROISSANT

1. **Le protocole d'évaluation fabrique de la récitation.** Mesuré : un champion fait **2456** sur la
   piste qu'il a apprise et **38** sur une inconnue. Et `newTrack` régénère la piste toutes les 5
   générations, donc la mémorisation est jetée avant de servir. → **Noter chaque voiture sur
   plusieurs pistes et moyenner.** C'est le correctif à plus fort effet, et il ne coûte rien au temps
   de jeu du propriétaire.
2. **12 cœurs, un seul utilisé.** Un lanceur `child_process` qui répartit les graines = ×8
   d'expérience à temps égal. Travail d'infrastructure, fichiers disjoints, sans risque.
3. **Le détecteur de raccourci ne se déclenche jamais** (0 % en course). Mesuré : sa fenêtre de
   distance 3D est 8-60 m alors que la distance réelle entre deux bouts de piste a une **médiane de
   159 m**. Les seuils ont été réglés pour une géométrie que le générateur ne produit pas.
   ⚠ Élargir change la **définition** d'un raccourci : décision de conception, à faire valider.
4. **Porter le pilote de `survTick`** comme contrôleur au sol, et réduire l'apprentissage au vol
   (idée du propriétaire). Le gymnase aérien conçu avec lui : caisse placée en l'air, dalle à
   atteindre, épisodes de ~3 s — **15× plus d'essais** qu'une manche de 45 s.
5. **La fitness** : `totD + contrôle − sorties + arrivée`. L'ancienne est rejouable via
   `W_CTRL=0, W_OUT=0, W_CUT=150`. Un A/B a montré **aucun effet** — le problème était en amont.
6. **Algorithme** : la sélection actuelle (élitisme + tournoi) est le maillon faible. CMA-ES sur 260
   paramètres est ~150 lignes de JS pur. PPO demanderait de la dérivation automatique (TF.js ou un
   pont Python), donc de lever la règle « pas de librairie ».

**Ordre de grandeur à garder en tête :** les agents CarRacing de référence sur Hugging Face sont
entraînés sur **1 à 5 millions de pas**. Ici une génération = 65 000 pas, sur un cœur. Le budget
n'est atteignable qu'en réglant (1) et (2).

---

## 8. COMMENT AMORCER UN AGENT SUR CE PROJET

Prompt de départ suggéré :

> Tu reprends le mode entraînement de CASH CAR, dans `ml/train/` du dépôt CAR-CASH-GIT.
> Lis `ml/train/HANDOVER.md` en entier avant de toucher quoi que ce soit, puis
> `RAPPORT-SESSION-2026-09-08.md` pour l'historique.
> Règle absolue : rien n'est vrai tant que ce n'est pas mesuré, et tu donnes la commande qui le
> reproduit. Si tu ne peux pas voir l'écran, tu dis que tu ne peux pas voir.
> Avant de rendre la main : `VERIFIER.bat` doit être vert de bout en bout.

Et lui rappeler que **le propriétaire n'est pas développeur** : il juge sur ce qu'il voit à l'écran
et sur trois chiffres (§6). Un rapport qui ne les donne pas ne vaut rien.
