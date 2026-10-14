# PASSATION — PILOTAGE (du Mac vers le PC) — 14/10/2026, 13 h 30

## CASH CAR en une phrase
Un jeu de course arcade 3D pour iPhone (et navigateur) de Sacha et Léo : une voiture « caisse » qui file sur une route suspendue dans le ciel, saute,
vole, ramasse de l'argent, une seule vie ; maps × météos tirées au hasard (mer de nuages, ville, pics de jade, orbite) ; garage, boutique 3D, missions,
carrière. Tout le jeu = UN fichier : `VERSION PRINCIPALE/index.html` (~5,6 Mo, Three.js). Publié par Vercel à chaque push sur `main` :
https://car-cash-git.vercel.app/jouer/ — l'app iPhone (Capacitor 8, `app-ios/`, branche `ios-capacitor`) emballe ce même fichier.
Dépôt : github.com/sachaberes-lgtm/CAR-CASH-GIT. Léo pousse en direct sur `main` (boutique 3D, voitures, musique : SA zone).

## Le rôle de PILOTAGE
Chef d'orchestre des sessions (une par chantier : INTERFACE, GRAPHISME, DEBUGGING, OPTIMISATION, GAMEPLAY, SON, APP STORE) :
quotas d'agents, file des questions pour Sacha, et LES TRAINS — fusionner toutes les branches dans `assemblage` (la base commune = le futur « code
final »), vérifier, pousser. PILOTAGE ne code presque pas lui-même : il délègue à des agents neufs (son propre fil coûte cher).

## Les branches à la passation (git fetch origin pour les têtes à jour)
assemblage 676a3ad (train T7) · ui-integration 245ac62 · perf-integration e809d5b · debug-integration b496001
gfx-integration 5e15978 · sensations-integration a3524e7 (GAMEPLAY) · son-integration dd997e9 · ios-capacitor 16a6ac5
pilotage-notes = ces fichiers : REGLES, BUDGET, ETAT (journal des trains), QUESTIONS (décisions de Sacha), BACKLOG, POUR-LEO, PROTOCOLE-PC, etat/, notes/, chantiers/.
Chaque session a sa fiche `passation/<SESSION>.md` à la racine de SA branche.

## Le cap de Sacha (il prime) — 14/10, 6 h 10
« Ce sont les DÉTAILS qui m'intéressent, faire le jeu le PLUS PROPRE possible ; les idées principales, on les fera après ; rends chaque chose
COMPATIBLE et MAGNIFIQUE les unes avec les autres. » Aucune refonte (la direction artistique de l'interface, Q11, est EN PAUSE).

## Retirés sur ordre de Sacha — à ne JAMAIS laisser revenir dans un train
Le chinois (`I18N_ZH`, `LANG==='zh'`), l'édition Poki (`POKI`, `pk(`, `html.poki`, `poki-construire.js`), CRYPTOCITY. Léo les réintroduit parfois en
poussant : à chaque fusion de `origin/main`, prendre notre côté pour ces blocs et le SIEN pour ses nouveautés (cf. ETAT.md, T7).
Intouchables : le burn-out du garage (`garde-burnout.sh` le vérifie), la boutique 3D, les voitures, les morceaux de musique de Léo.

## Un train (≈ toutes les heures)
1. `git fetch origin` ; dans un worktree de `assemblage` : fusionner `origin/main` puis chaque `origin/<session>-integration` (`--no-ff`).
2. Conflits : les deux ajoutent → garder les deux ; sinon le propriétaire de la zone gagne (CSS/HTML → INTERFACE ; couleurs/textures → GRAPHISME ;
   crans de qualité → OPTIMISATION ; bug → DEBUGGING ; volant → GAMEPLAY ; sons → SON ; zone de Léo → main). Conflit douteux : abandonner, reporter.
3. Après chaque fusion : `node syntaxe.cjs "VERSION PRINCIPALE/index.html"` (fourni ici ; 0 erreur) et `sh garde-burnout.sh` (OK).
4. Tester : servir `VERSION PRINCIPALE` (`python3 -m http.server`), menu → JOUER → course → mort → REJOUER, couché et `?colonne=portrait`, 0 erreur.
5. `sw.js` : `const CACHE='cashcar-vNNN'` = max(main, assemblage) + 1. Pousser `assemblage` (branche, jamais main) et les notes.
PUBLIER (pousser sur main) : UNIQUEMENT sur ordre explicite de Sacha, après un train vert.

## Décisions encore ouvertes pour Sacha (QUESTIONS.md)
LE DOGE fige l'iPhone 3-4 s et la boutique 0,4 s (zone de Léo : POUR-LEO.md) ; le rythme du quota (l'hebdomadaire était à 51 % le 14/10 à 13 h) ;
rembourser ceux qui avaient acheté LA RAIE (cachée) ; retirer les commentaires à la fabrication (5,6 → ~3,5 Mo) ; l'idée de jeu de NUAGES 4 ;
l'export de l'app (compte Apple dans Xcode, sur le Mac ; rien n'est envoyé à Apple sans son oui).

## Leçons de la nuit
Le Mac (10 cœurs / 16 Go) est tombé à 465 de charge avec 5 flottes et ~15 Chrome : un sémaphore UNIQUE de navigateurs (3 au plus), jamais le
simulateur iOS en même temps que des navigateurs. 20 agents vident une fenêtre de 5 h en ~2 h 15 : ~12 agents au plus ; les chefs délèguent,
un tour par fin d'agent ; une session à l'arrêt se relance avec un message. Un commit par correctif (deux passes ont tout perdu faute de commits).
