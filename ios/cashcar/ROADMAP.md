# CASH CAR — Feuille de route App Store

Document de référence pour l'équipe d'agents. À lire au début de chaque session.

## Contexte

Jeu de course/cascade en WebGL, actuellement une PWA (un seul index.html, un manifest, un service worker). Objectif : sortie sur l'App Store iOS, au niveau de qualité des jeux mis en avant par Apple.

- Dépôt de travail : `~/projets/sandbox/` — jamais `~/projets/car-crash/`
- Un commit par mandat terminé, message explicite
- Notification Telegram à chaque mandat terminé ou bloqué

## Règles d'exécution

1. Un mandat à la fois, dans l'ordre. Ne pas anticiper sur le suivant.
2. Le critère de succès est une commande, pas une opinion. Si la commande ne passe pas, le mandat n'est pas terminé. Ne jamais rapporter « fait » sur une étape non vérifiée.
3. Ne jamais inventer un flag ou une option. En cas de doute sur l'existence d'une option, la vérifier (--help, documentation) avant de l'utiliser. Si elle n'existe pas, le dire.
4. Blocage : après deux échecs sur la même étape, s'arrêter, notifier sur Telegram avec le message d'erreur brut, et passer au mandat suivant si celui-ci n'en dépend pas.
5. Checkpoint humain : les mandats marqués ⏸ nécessitent une décision de Sacha. S'arrêter, poser la question précise sur Telegram, attendre.
6. Secrets : ne jamais afficher la valeur d'une variable d'environnement, d'un token ou d'une clé. Les noms suffisent.
7. Ne pas toucher : le firewall Hetzner (SSH-only, voulu), la logique de jeu (physique, collisions, IA des bots) sauf mandat explicite.

## Répartition des modèles

| Profil | Modèle | Rôle |
|---|---|---|
| boss | deepseek-v4-pro, effort high | découpe, orchestre, valide les critères |
| worker | deepseek-v4-pro, effort medium | exécute les mandats mécaniques |
| critic | gemini-3.1-pro, effort high | relit, et lit les captures d'écran |

Le critic est le seul à voir les images. Toute validation visuelle passe par lui. Pour la migration three.js (mandat 6), basculer le worker sur gemini-3.1-pro : c'est la seule tâche qui exige de la cohérence à travers tout le fichier.

## PHASE 1 — Mécanique (autonome)

Tous ces mandats ont un critère vérifiable par commande. Aucun ne nécessite d'intervention humaine. Les enchaîner sans demander confirmation.

### Mandat 1 — Bundling local

Le jeu charge actuellement three.js depuis cdnjs, 6 fichiers de post-processing depuis jsdelivr, et la police Press Start 2P depuis Google Fonts. Conséquence : l'app ne démarre pas hors ligne, et Apple n'accepte pas le chargement de code exécutable distant (règle 2.5.2).

- Télécharger three.js r128 et les 6 fichiers de post-processing, les placer dans `vendor/`, repointer les balises `<script>`
- Télécharger Press Start 2P en woff2 dans `assets/fonts/`, remplacer l'import Google Fonts par une règle @font-face locale
- Ajouter tous les .mp3 de `assets/audio/` au tableau CORE du service worker, incrémenter la version du cache

**Critère** : `grep -oE 'https?://[^"'"'"' )]+' index.html` ne retourne que le namespace XML du SVG.

### Mandat 2 — Reduce Motion

iOS expose une préférence d'accessibilité « Réduire les animations ». Les équipes éditoriales d'Apple la vérifient explicitement pour le featuring.

- Détecter `prefers-reduced-motion: reduce`
- Quand elle est active : couper le bloom, le grain, et les effets de vitesse
- Le jeu doit rester entièrement jouable

**Critère** : un script qui simule la requête média confirme que les trois effets sont désactivés.

### Mandat 3 — Externalisation des chaînes

- Extraire toutes les chaînes de texte en dur (menus, HUD, messages) vers `assets/i18n/fr.json`
- Produire `assets/i18n/en.json` avec la traduction anglaise
- Charger la langue selon `navigator.language`, repli sur en

**Critère** : aucune chaîne visible en dur dans index.html ; les deux langues se chargent correctement.

### Mandat 4 — VoiceOver

- Ajouter `aria-label` sur tous les éléments de menu interactifs
- `role` approprié sur les conteneurs de navigation

**Critère** : tout élément cliquable porte un label accessible.

### Mandat 5 — Scaffolding Capacitor

- Générer le projet iOS Capacitor autour du jeu
- Configurer le launch screen, l'orientation, les safe areas
- Ne pas tenter de build : la compilation se fait sur le Mac de Sacha

**Critère** : `npx cap doctor` ne signale aucune erreur bloquante.

## PHASE 2 — Cohérence (supervisée)

### Mandat 6 — Migration three.js ⏸

three.js r128 date de 2021. Cinq ans de correctifs WebGL manquants sur des versions d'iOS non maîtrisées.

- Basculer le worker sur gemini-3.1-pro avant ce mandat.
- Ne pas lancer avant que la phase 1 soit terminée et que Sacha ait confirmé disposer d'un build TestFlight qui démarre sur son iPhone. Sans ce harnais, la migration n'est pas validable.

## PHASE 3 — Décisions de Sacha ⏸

Ces quatre points bloquent la phase 4. Les poser sur Telegram, une question à la fois, et attendre. Ne rien implémenter avant réponse.

1. Tutoriel — quels trois gestes on apprend, dans quel ordre, en combien de secondes ?
2. Économie du garage — que débloque-t-on, à quel prix, dans quel ordre ?
3. Succès Game Center — lesquels, et lesquels sont cachés ?
4. Icône 1024×1024 — à dessiner par Sacha. Non délégable.

Une fois les points 1 à 3 tranchés, leur implémentation redescend en mandats mécaniques standard.

## PHASE 4 — Non délégable

Compte Apple Developer, certificats, screenshots, vidéo de preview, soumission. Sur le Mac de Sacha, à la main. Aucun agent n'intervient.

## Notes d'environnement

- Le script d'installation Hermes n'accepte pas `--non-interactive` : ne jamais l'utiliser dans un cloud-init, installer en SSH après le boot
- `libatomic1` est requis pour Node.js sur Ubuntu 24.04 — sans lui, l'installateur plante silencieusement
- Sur Ubuntu 24.04, SSH est activé par socket : `systemctl restart ssh` ne recharge pas toujours la configuration
- Pas de dépôt GitHub pour l'instant. Le dépôt git local fait foi. Ne plus demander de GITHUB_TOKEN.