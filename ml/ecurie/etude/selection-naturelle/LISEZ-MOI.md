# L'étude du 27/11/2026 : de quoi est né le système de sélection naturelle

Ce dossier garde ce qui a servi à concevoir `ml/evolution/` (l'apprentissage par sélection qui tourne seul sur le PC de Sacha).
Tout vivait dans un dossier de travail que git ignore (`ml/ecurie/agents/tmp-voltige/`) : copié ici le 27/11 pour ne rien perdre
(demande de Sacha : « il faut qu'on garde des traces de tous les process, pour un portfolio »).

| Fichier | Ce que c'est |
|---|---|
| `SPECIFICATION.md` | La spécification du système : la population, le génome (les réglages du pilote + deux petits réseaux de neurones muets à la naissance), la note, les graines, ce qu'on peut honnêtement en attendre. Écrite par un agent Opus à partir des trois études ci-dessous, relue par Fable. |
| `bruit/` | **Combien une note est-elle fiable ?** 34 pilotes × 24 graines : `courses-0.json` (les courses), `extraire.js` et `analyser.js` (les outils), `resultats.txt` (les chiffres : l'écart-type d'un palier d'une course à l'autre, le nombre de courses qu'il faut pour voir un palier de différence, les mesures de ressemblance qui ne sont que du bruit). |
| `inventaire/` | **Qu'est-ce qu'un pilote a le droit de contenir ?** Essais du bac fermé où tourne un pilote (`essai-bac.js`, `essai-course.js`, `sortie.txt`) : un réseau de 53 512 poids se charge en 15 ms et décide en 0,25 à 0,4 ms. `vue-exemple.json` : une vue telle que les yeux la donnent au pilote. |
| `selection/etalon.js` | La note « dans la foule » : l'écart aux joueurs avec une zone morte d'un écart-type. |
| `PROPOSITIONS.md` | **Qu'est-ce qui distingue encore le bot d'un joueur ?** Le compte rendu de quatre enquêtes (agents Opus), chacune relue par un vérificateur qui a refait les mesures : quatre gestes au verdict « à essayer » (les mains lâchées avant le contact, le slalom demandé par le pilote, le coup de nitro vu en vol, le relâché après le décollage), un cinquième classé premier par son vérificateur sans verdict écrit (après la pose, la ligne suit la caisse), des « douteux », un « à écarter ». Ces gestes deviendront des gènes, éteints à la naissance. (Le 27/11, Claude avait annoncé « six gestes retenus » à Sacha : c'était une erreur de compte, corrigée à la relecture.) |
| `outils-27nov/` | Les outils de mesure de la loi « retour » des yeux (commit `49012f2d9`) : `rayons-vol.js` (ce que chaque loi de vol donne, vol par vol), `categories.js` (les vols voulus, subis, en chaîne), `resume.js`, `avant2.js` (les dernières secondes d'une course), `faire-pR.js` (le pilote d'essai qui suit la loi « retour »), `faire-diag*.js`, `yeux-retour*.js` (les deux retouches des yeux). |
| `mesures-27nov/` | Les sorties de ces outils : `out-*.txt` (les tableaux par pilote d'essai, sur les graines 910000 et 930000), `pre-d*.txt`, `verifier-27nov.txt` (le contrôle des yeux : TOUT PASSE, empreinte `a7b3171768ca`). |

Ce qui n'est **pas** ici, parce que trop lourd (526 Mo) : les courses brutes des pilotes d'essai (`mes-*.json`, `vols-*.json`, `note-*.json`).
Elles restent sur le PC de travail dans `ml/ecurie/agents/tmp-voltige/` et se refont avec les outils ci-dessus (même graine = même course).

Le récit de la journée : `ml/ecurie/portfolio/journal/2026-11-27.md`.
