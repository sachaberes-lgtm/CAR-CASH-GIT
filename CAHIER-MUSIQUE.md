# CAHIER DES CHARGES — LA MUSIQUE DE CASH CAR

> Nouveau départ le 2026-10-02. Léo : « je repars sur des petits samples vraiment simples, on construit petit à petit,
> on leur donnera une fonctionnalité ; écris le cahier des charges pour le transférer sur la nouvelle version ».
> Ce document est LA référence à transférer. Il se met à jour à chaque étape validée.

## 1. La méthode
- Un élément à la fois : **son de départ → motif → rythme → 2e son → … → fonction en jeu**.
- À chaque étape, 4 à 8 propositions courtes ; Léo choisit ; rien n'avance sans validation.
- La matière : de préférence de vrais sons (samples envoyés par Léo via la boîte, enregistrements) ; la synthèse maison
  seulement pour de petits éléments.
- Où écouter : http://localhost:8765/boucles.html · où envoyer : bouton « Envoyer à Claude » (→ `atelier-son/boite/`).

## 2. Ce qui est gardé
| Étape | Élément | Fichier | Pourquoi (les mots de Léo) | Validé le |
|---|---|---|---|---|
| — | VAPEUR (boucle de référence) | `assets/audio/music/boucles/lobby-vapeur.m4a` | « sa structure, sa différence, c'est beau » | 2026-10-01 |
| — | GLASSY PLUCKS (lobby actuel) | `assets/audio/music/glassy-plucks-boucle.m4a` | morceau Suno de Léo, section 1:04 → 2:14 | 2026-10-01 |

## 3. Ce qui est rejeté (ne pas y revenir)
- Compositions entières synthétisées par Claude (v1 à v4 « chef d'orchestre »).
- Une musique qui évolue PISTE PAR PISTE (batterie, basse qui entrent et sortent) : « bizarre, disharmonieux ».
- Le studio / générateur à dés : interface trop dense.
- Des instruments synthétisés ajoutés sur un vrai morceau : « robot, très fade ».
- Les souffles de montée en nitro (« l'aspiration »).

## 4. Les règles du jeu pour la musique (pistes, à confirmer)
- Le morceau ne change jamais : la course l'**embellit** (lent, vol, après un crash) ou l'**intensifie** (vitesse, nitro,
  frénésie) — règle à l'essai dans `musique-lumiere.js` (copie de test `jeu-lumiere.html`), pas encore jugée à l'oreille.
- Chaque niveau a sa couleur : Nuages · Ville · Orbite · Frénésie.

## 5. Le journal des étapes
- 2026-10-02 — nouveau départ ; étape 1 à venir : trouver le SON DE DÉPART.
- 2026-10-02 — ÉTAPE 1 proposée : 8 sons de départ, tous en mi♭ (`atelier-son/depart.py` → `assets/audio/music/depart/`),
  onglet « Étape 1 » de boucles.html : PIANO DOUX, GUITARE NYLON, KALIMBA, CLOCHE DE VERRE, NAPPE VAPEUR, BOÎTE À MUSIQUE,
  BASSE RONDE, SYNTHÉ CHAUD. Les ♥ de Léo → `rangement.json` (`gardes`). En attente de son choix.
