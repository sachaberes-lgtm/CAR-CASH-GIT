# MANDAT — Mettre CASH CAR sous git, proprement et pour de bon

Tu interviens sur le Mac de Sacha. Le projet est un jeu de course en HTML/JS visant
une sortie App Store en novembre 2026. Il est développé à deux (Sacha + un ami) et
n'a **aucune sauvegarde versionnée** du fichier source principal à l'heure où ce
mandat est écrit. C'est le problème à régler.

## Règles absolues

1. **Ne supprime jamais un fichier.** Déplacer, oui. Supprimer, non.
2. **Si la réalité ne correspond pas à ce mandat, tu t'arrêtes et tu rapportes.**
   N'improvise pas une structure différente sans le dire.
3. **Aucun `git push` avant l'étape 3** (scan des secrets) et avant validation de
   Sacha. Un dépôt poussé ne se dé-pousse pas.
4. Sacha n'est pas développeur. Ton rapport final doit être lisible par quelqu'un
   qui ne connaît pas git : pas de jargon sans explication entre parenthèses.

---

## Étape 1 — Diagnostic (lecture seule, tu ne modifies rien)

Inspecte et rapporte :

- L'arborescence de `~/cash-car` sur 2 niveaux, avec les tailles.
- Est-ce qu'un dossier `.git` existe déjà, et où ? (`~/cash-car`, `~/cash-car/demo`,
  ailleurs ?) Pour chacun : `git remote -v`, la branche courante, et l'état de
  `git status`.
- Où se trouve le clone local du dépôt GitHub existant `sachaberes-lgtm/CAR-CASH-GIT`.
- Le nombre de lignes de `~/cash-car/game/index.html` et la date de sa dernière
  modification.
- La liste des fichiers de plus de 5 Mo (ils ne doivent pas entrer dans git tel quel).

**Puis arrête-toi et affiche ce diagnostic.** La suite dépend de ce que tu trouves.
Si `~/cash-car/game/index.html` n'existe pas, ne continue pas : demande à Sacha où
est le jeu.

---

## Étape 2 — Filet de sécurité, avant toute chose

Crée une copie de secours horodatée, hors du dossier de travail :

    ~/Documents/cash-car-sauvegardes/cash-car-AAAA-MM-JJ.zip

Elle contient `~/cash-car` en entier, sans les dossiers `.git` ni `node_modules`.
Vérifie que l'archive s'ouvre et qu'elle contient bien `game/index.html`.
Rapporte son poids. Tant que cette étape n'est pas faite, ne touche à rien d'autre.

---

## Étape 3 — Chercher des secrets avant de publier quoi que ce soit

Cherche dans **tout** `~/cash-car` (fichiers suivis ou non) des clés d'API :
motifs `api[_-]?key`, `secret`, `token`, `sk-`, `Bearer`, `ELEVENLABS`, `SUNO`,
`VERCEL`, `ANTHROPIC`, ainsi que tout fichier `.env`.

Rapporte chaque occurrence avec son fichier et sa ligne, **sans afficher la valeur
complète** (masque tout sauf les 4 premiers caractères).

S'il y en a : arrête-toi, liste-les, et explique à Sacha lesquelles il doit révoquer.
Ne pousse rien.

---

## Étape 4 — La structure cible

Un seul dépôt privé, à la racine `~/cash-car`, qui devient **la source de vérité** :

    ~/cash-car/
      .gitignore
      CLAUDE.md
      README.md
      game/            ← le jeu complet : c'est LUI qu'on protège
      demo/            ← l'usine à démo (build.py + ses sorties)
      archive/         ← les vieilles versions, gardées mais sorties du chemin

Le dépôt public existant `CAR-CASH-GIT` **n'est pas touché** : il garde son rôle de
vitrine publique branchée sur Vercel. Séparation nette : source privée d'un côté,
démo publique de l'autre.

Actions :

- Si `~/cash-car` n'est pas encore un dépôt git, initialise-le (branche `main`).
- Si un `.git` s'y trouve déjà et pointe vers `CAR-CASH-GIT`, **ne le réutilise pas** :
  arrête-toi et rapporte, on décidera ensemble.
- Crée `archive/` et déplaces-y toute copie ancienne du jeu que tu trouves à la
  racine (notamment un fichier nommé `JEU ETE VERSION SACHA` s'il est présent),
  en le renommant `archive/jeu-ete-2026-08-11.html`.

---

## Étape 5 — Les fichiers à créer, contenu exact

### `.gitignore`

    # macOS
    .DS_Store

    # Dépendances et caches
    node_modules/
    __pycache__/
    .chrome-profile/

    # Sauvegardes locales
    *.zip

    # Sorties de build de la démo : refabriquées par `python3 demo/build.py`,
    # elles n'ont pas à alourdir l'historique du dépôt source.
    demo/cash-car-demo/
    demo/index.html
    demo/cash-car-demo.artifact.html

    # Secrets — ne doit jamais entrer dans git
    .env
    *.key

### `CLAUDE.md`

    # CASH CAR — règles du projet

    Jeu de course arcade en HTML/JS. Objectif : sortie App Store iOS en novembre 2026.
    Cible 10-25 ans, sessions courtes, inspiration Route Arc-en-ciel (Mario Kart) pour
    les raccourcis et Rocket League pour la voltige.

    ## Où sont les choses

    - `game/index.html` — LE jeu. Fichier unique, ~12 000 lignes : HTML, CSS, moteur
      three.js, physique, bots et interface, tout dedans. Source de vérité unique.
    - `demo/build.py` — fabrique la démo publique en appliquant ~85 patchs à une copie
      de `game/index.html`. Il ne modifie jamais le jeu.
    - `archive/` — anciennes versions. Lecture seule, ne jamais y prendre de code.

    ## Règles de travail

    - **Pas de modification de comportement sans harnais de mesure chiffré d'abord.**
      On mesure, puis on change, puis on remesure. Sinon on ne sait pas si ça marche.
    - Le projet est développé à deux sur un fichier unique. Avant toute session de
      travail : `git pull`. Après : commit et push. Ne jamais garder des modifications
      non poussées plus d'une journée.
    - Commits en français, une phrase qui dit ce qui change et pourquoi.
      Exemple : « accueil : bouton PLAY agrandi et remonté au-dessus de la ligne de
      flottaison ». Pas « update », pas « fix ».
    - Les commentaires du code sont en français et expliquent le POURQUOI, pas le
      QUOI. C'est la convention en place, la respecter.

    ## Contraintes App Store (à ne jamais casser)

    - **Aucun CDN.** three.js, la police et tous les assets sont servis en local.
      Le jeu doit tourner en mode avion. Un écran noir hors ligne = rejet Apple.
    - **Aucune interface de développement dans un build soumis** : le panneau de
      réglage des fruits, le bouton reset flottant et les boutons son du HUD doivent
      être derrière un drapeau `DEV` désactivé en production.
    - Zones tactiles de 44 points minimum, safe areas iPhone respectées
      (`env(safe-area-inset-*)`).
    - `navigator.vibrate` **ne marche pas sur iOS** : l'haptique passe par
      `@capacitor/haptics`.
    - 60 images par seconde visées sur un iPhone milieu de gamme, pas sur le Mac.

    ## Ce qui reste à faire

    Voir `README.md`, section « Chantier en cours ».

### `README.md`

Écris-le toi-même, en français, court (une page). Il doit contenir :

- ce qu'est le jeu, en trois lignes ;
- l'arborescence expliquée ;
- **comment lancer le jeu en local** (trouve la commande réelle, teste-la, ne l'invente
  pas) ;
- comment refabriquer la démo ;
- une section « Chantier en cours » avec cette liste, dans cet ordre :
  1. fusionner les deux coques d'interface en une seule, mobile d'abord
     (aujourd'hui `#settings` et `#mSet` font la même chose deux fois)
  2. drapeau `DEV` pour masquer l'outillage de développement
  3. décider de l'économie du jeu (le cash gagné ne se dépense nulle part)
  4. écran boutique
  5. écran MODES transformé en vraie sélection au lieu de bascules ON/OFF
  6. haptique iOS, tutoriel sans texte
  7. conformité App Store et TestFlight
- une section « À deux » rappelant : `git pull` avant, commit et push après,
  se répartir par zone du fichier et pas par fonctionnalité.

---

## Étape 6 — Premier enregistrement

Ajoute tout, et fais **un seul** commit :

    « Mise sous git du projet complet — état du 7 septembre 2026 »

Puis vérifie et rapporte : le nombre de fichiers suivis, le poids total du dépôt, et
la confirmation que `game/index.html` est bien dedans.

---

## Étape 7 — Publication (seulement si l'étape 3 est propre)

Si l'outil `gh` est installé et authentifié, crée le dépôt **privé**
`sachaberes-lgtm/cash-car` et pousse `main` dessus.

Si `gh` n'est pas disponible : **ne cherche pas à contourner**. Arrête-toi et dis à
Sacha, en une phrase, d'ouvrir GitHub Desktop, d'aller dans File → Add Local
Repository → `~/cash-car`, puis de cliquer le bouton bleu « Publish repository » en
laissant coché « Keep this code private ».

---

## Étape 8 — Rapport final

Termine par un récapitulatif en français simple :

- où est la sauvegarde zip ;
- ce qui est maintenant versionné et où ;
- ce que Sacha doit faire lui-même, s'il reste quelque chose (inviter son ami dans
  Settings → Collaborators du dépôt, par exemple) ;
- tout ce que tu as trouvé d'anormal en chemin.
