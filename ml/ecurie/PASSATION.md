# Passation — l'écurie, le 26/11/2026 à 13 h

À lire en premier par la session qui reprend. Le détail de chaque étape est dans `ETAPES.md` ; ici, l'état exact, ce qui tourne, et quoi faire.

## Où on en est

| | État |
|---|---|
| A — l'étude | faite |
| B — fondations (yeux v2, doigts v2, relecture de 58 trouvailles, simulateur fidèle avec le relief du canyon, finitions) | **faite** — `verifier.js` passe (empreinte `a7b3171768ca`), 5 rejeux exacts sur 5 |
| C — le pilote d'élite | **le premier pilote existe** : `ml/ecurie/pilote.js` (écrit par Fable 5.2 via l'API, contrôlé par Opus) — palier médian **11**, record **20** sur 20 courses de 900 s (référence 8,5 / 18 ; joueurs 11,5 / 28) |
| C bis — calibrage (4 modèles × 6 variantes) | **fait** : aucune variante ne tient sur 20 graines neuves ; modèle retenu **Sonnet 5.5** (0,13 € la variante), départ `pilote.js` (`ml/ecurie/agents/choix.json`) |
| C bis — la boucle par tranches | **pas commencée** : la tranche 1 a démarré le 26/11 à 12 h 55 puis a été tuée par une interruption (0 € dépensé dans cette tranche) |
| Portfolio | **fait** : `ml/ecurie/portfolio/index.html` + 5 figures SVG (`images/`, refaites par `node ml/ecurie/portfolio/figures.js`) |
| D, E, F | à faire |

**Dépensé : 36,92 € sur 200** (journal `ml/labo/journal/depenses.jsonl`, `node ml/labo/labo.js`). Pilote 11,63 · finitions 8,71 · calibrage 4,63 + choix 0,71 · portfolio 3,83 · images 7,07 · comptes rendus ≈ 0,3.

**Rien ne tourne en ce moment**, sauf le serveur de la salle de projection (`node projection.js`, port 3161), sans importance.

## Pour relancer (c'est la première chose à faire)

Depuis un **terminal ordinaire** (pas depuis un outil d'une session Claude : une interruption de la session tue les processus qu'elle a lancés — c'est ce qui vient d'arriver) :

```powershell
cd C:\Users\sacha\code\CASH-CAR-bots-ecurie\ml\ecurie; node chaine.js
```

La chaîne reprend où elle en était (`agents/chaine-etat.json` : pilote, calibrage, choix faits ; `tranches: 0`) et lance la boucle de l'étape C avec Sonnet 5.5, par tranches, au **rythme corrigé** : chaque jour, ce qui reste des 200 € est partagé entre les jours qui restent jusqu'au 08/12 (≈ 12,5 € par jour). Journal : `agents/chaine.log`. Arrêt : créer le fichier `agents/STOP`. Un compte rendu (`comptes-rendus/compte-rendu-NN.html`) est écrit après chaque tranche.

## Comment le travail se paie — la règle de Sacha

**Le travail lourd se paie sur la clé d'API, jamais sur l'abonnement.** Le 25/11, un workflow de 152 agents a vidé l'abonnement Fable sans toucher aux crédits : Sacha a été très clair, c'est à ne pas refaire. Les outils :

- `ml/ecurie/agent-api.js` — une session Claude Code sans écran (`claude -p --bare`), qui ne lit que `ANTHROPIC_API_KEY` ; la source de facturation est vérifiée au premier message (coupée sinon), le coût inscrit au journal des dépenses, le plafond de 200 € respecté. `node agent-api.js --consigne consignes-agents/X.md --nom X --modele claude-opus-5-5 --budget 10 --etape C`. Rapport : `agents/<date>-X.md`.
- `ml/ecurie/chaine.js` — la chaîne des deux semaines (ci-dessus).
- `ml/ecurie/relais.js` — glisser un agent entre deux pas de la chaîne (pose `STOP`, attend, lance l'agent, relance la chaîne).
- `ml/ecurie/apres.js` — lancer un agent quand un autre a fini (deux agents n'écrivent jamais dans les mêmes fichiers en même temps).
- `ml/ecurie/consignes-agents/` — les consignes déjà écrites (pilote, choix-modele, compte-rendu, finitions-b, portfolio, images).
- La clé : `setx` par Sacha ; si l'environnement ne l'a pas, `agent-api.js` et `chaine.js` la lisent dans la portée Utilisateur (registre). Ne jamais l'afficher.

La session principale ne fait qu'amorcer, vérifier et raconter.

## Ce qui reste à faire, dans l'ordre

1. **Relancer la chaîne** (ci-dessus) et vérifier dans `chaine.log` que la tranche 1 démarre et dépense (une tranche de Sonnet ≈ 0,8 € par tour de 6 variantes ; un tour prend 30 à 100 min de PC).
2. **Surveiller la première tranche** : une variante sacrée (validée sur 20 graines neuves) ? Le compte rendu n° 3 est-il écrit ? Si deux tranches de suite ne dépensent rien, la chaîne s'arrête d'elle-même (« deux tranches de suite sans dépense ») : lire `agents/sortie-tranche-N.log`.
3. **À surveiller / défauts connus** :
   - Fable 5.2 a perdu sa seule réponse du calibrage, coupée à 32 000 jetons de sortie (`boucle.js`, `max_tokens`) : si on réutilise Fable dans la boucle, monter ce plafond.
   - Avec la seconde chance prise dès le palier 12, le record du pilote n'est pas comparable à celui de la référence (qui ne la prend jamais) ; dans la boucle, la comparaison reste juste (la main est fixée).
   - Ce qui tue encore le pilote : le canyon (parois), les S serrés, les vols trop longs (jauge d'air) ; la nitro reste à 28 % du temps contre 61 % chez les joueurs.
   - Une vidéo de la salle de projection dépasse 30 Mo pour 4 min et plus (film toujours en 1280 × 720, le débit bas est ignoré par le navigateur) : on ne peut l'envoyer au téléphone que pour une course de moins de 3 min environ.
4. **Étapes D, E, F** (`ETAPES.md`) quand la boucle a fait monter le plafond : les 30 niveaux, le juge, le paquet et le dossier du portfolio. Budget prévu : D+E 60 €, récit 15 € (déjà 11 € du portfolio), réserve 25 €.

## Pour voir et tester

- **Les bots jouer, avec l'image** : `cd ml\labo; node projection.js`, puis http://localhost:3161/ → « voir » (l'écran reste noir 1 à 5 min au début : la course est d'abord rejouée sans image). La meilleure course du pilote : `c0003-g910407` (5 min 50, 237 000 €), filmée dans `ml/labo/videos/`.
- **L'arbre des cerveaux** : http://localhost:3161/labo/arbre.html (refait par `node ml/labo/arbre.js`).
- **Les comptes rendus** : `ml/ecurie/comptes-rendus/` (n° 1 et 2).
- **Le portfolio** : `ml/ecurie/portfolio/index.html`.

## Le texte à coller dans la session qui reprend

> Dans `C:\Users\sacha\code\CASH-CAR-bots-ecurie` (branche `bots-ecurie`), lis `ml/ecurie/PASSATION.md` puis `ml/ecurie/ETAPES.md`. Vérifie que la chaîne tourne (`ml/ecurie/agents/chaine.log`) ; sinon dis-moi de la relancer depuis un terminal. Suis la boucle de l'étape C jusqu'au 08/12 sans dépasser 200 € au total, fais payer tout travail lourd par la clé d'API (`agent-api.js`), jamais par mon abonnement, et à chaque fin de contexte prépare un compte rendu esthétique et testable. Ne me pose pas de question.
