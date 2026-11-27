# Modèle d'entrée du journal de bord

À copier en fin de journée de travail, sous le nom `AAAA-MM-JJ.md` (exemple : `2026-11-28.md`), dans `ml/ecurie/portfolio/journal/`. Ensuite, ajouter une ligne par essai écarté au registre des impasses de `LISEZ-MOI.md`, la ligne du chapitre à sa table des matières, et tout mot nouveau à `LEXIQUE.md`.

**Les règles, en bref.**
- Rien d'inventé. Chaque chiffre, date ou citation vient d'une source ouverte ce jour-là (commit, fichier, journal) et nommée dans l'entrée.
- Ce qui n'a pas été retrouvé n'est pas écrit. Ce qui est incertain porte la mention « non vérifié ».
- Les échecs comptent autant que les réussites.
- Des phrases courtes. Un mot technique est expliqué en une demi-phrase la première fois.
- Pas de superlatifs. Aucune clé, aucun jeton, aucune adresse e-mail, aucun chemin vers des secrets.
- Longueur : 600 à 1 500 mots.
- Heures : les messages de Sacha en UTC (comme dans `paroles-sacha.md`), les commits à l'heure de Paris. Le dire en tête.

---

```markdown
# JJ/MM/AAAA — <ce qui s'est passé, en un titre>

**En une phrase.** <Le fait principal de la journée, réussite ou échec.>

## En une minute

<Six à huit phrases simples, une par ligne, sans jargon : ce qu'on voulait, ce qui s'est passé, ce qui a raté, qui a décidé. Elles doivent suivre la fin de l'« En une minute » du chapitre d'avant.>

*Heures : messages de Sacha en UTC, commits à l'heure de Paris (UTC + 1).*

## La question du moment

<Où en était le chantier le matin, et la question à laquelle la journée devait répondre.>

## Ce qu'on a tenté

- **<L'essai>** (`<commit>`, <heure>). <Ce qui s'est passé, avec le chiffre qui tranche.> **GARDÉ** / **ÉCARTÉ** / **EN SUSPENS**.

## Ce qu'on a appris

**Sur le jeu.** <…>
**Sur les bots.** <…>
**Sur la méthode.** <…>

## Les décisions

- **Sacha** (<heure UTC>) : « <sa phrase, orthographe rectifiée> ».
- **Claude** : <ce que Claude a choisi, et pourquoi>.
- **En suspens** : <ce qui attend une réponse>.

## Les chiffres

| mesure | valeur | source |
|---|---|---|
| <…> | <…> | `<commit court>` ou `<chemin du fichier>` |

## Ce qu'on peut montrer

- `<chemin>` : <ce qu'on y voit>. Dans git / hors git.

## Sources

- Commits : `<h>` (JJ/MM HH:MM), …
- Fichiers lus : …
```

---

## Quoi mettre dans chaque rubrique

**Titre.** La date, puis ce qui s'est passé, pas ce qu'on espérait.
*Exemple :* `# 28/11/2026 — La sélection tourne une nuit et ne bat pas le témoin`

**En une phrase.** Le fait principal. Si la journée a échoué, la phrase le dit.
*Exemple :* « La sélection naturelle a tourné 9 heures sur le Ryzen ; son champion n'est pas mieux noté que le pilote témoin sur le coffre de graines. » (exemple fictif)

**En une minute.** L'histoire du jour pour qui ne lira rien d'autre. Pas de chiffre sans son sens (« il ressemble davantage aux joueurs » plutôt que « écart 1,67 »), pas de mot du lexique sans explication. Relire la fin de l'« En une minute » du chapitre d'avant : on doit comprendre pourquoi on passe de l'un à l'autre.

**Une image.** Quand une donnée du jour se dessine, la tracer avec un script dans `ml/ecurie/portfolio/figures-journal/` (en clair et en sombre, dans `images/journal-<nom>-*.svg`), l'insérer à sa place sous la forme `![<description en une phrase pour qui ne voit pas l'image>](../images/journal-<nom>-clair.svg)`, suivie de sa légende en italique avec ses sources, et l'ajouter au § 6 de `LISEZ-MOI.md`.

**La question du moment.** L'état du chantier le matin, en trois ou quatre phrases, et la question du jour.
*Exemple :* « Le système de sélection était construit mais n'avait jamais tourné. La question : une nuit suffit-elle à voir un progrès au-dessus du bruit ? »

**Ce qu'on a tenté.** Une puce par essai, dans l'ordre de la journée : le commit, ce qui s'est passé, le verdict en capitales, le chiffre qui tranche. Un essai sans chiffre se dit « non mesuré ».
*Exemple :* « **Des enfants à deux mutations au lieu d'une** (`abc1234`, 10 h 12). Écart aux joueurs 1,61 contre 1,63 : dans le bruit (60 courses). **ÉCARTÉ.** » (exemple fictif)

**Ce qu'on a appris.** Trois rubriques courtes : le jeu (une règle découverte), les bots (ce qui les trahit ou les tue), la méthode (une erreur de mesure, une règle de travail née d'un raté).
*Exemple :* « Sur la méthode : un lot de 12 courses ne départage pas deux pilotes ; il en faut environ 140 pour un palier d'écart (`bruit/resultats.txt`). »

**Les décisions.** Qui a décidé quoi. La phrase de Sacha entre guillemets, avec son heure UTC. Quand Sacha a corrigé la méthode de Claude, l'écrire simplement.
*Exemple :* « **Sacha** (15:42) : « il faut que tu arrêtes de suivre les plans ». Il corrige ici la méthode de Claude. »

**Les chiffres.** Un tableau, une ligne par mesure, toujours avec sa source. Pas de chiffre arrondi sans le dire.
*Exemple :* `| écart aux joueurs, 20 courses de 900 s | 1,67 (veille 2,00) | 1ee936e15 |`

**Ce qu'on peut montrer.** Seulement des fichiers vérifiés ce jour-là avec `ls` et `git ls-files` : page, schéma, film, rejeu, courbe, tableau de bord. Dire s'ils sont dans git ou hors git.
*Exemple :* « `ml/labo/videos/c0003-g910629.webm` : un film de 25 Mo du pilote sur une course. Hors git, se refait à partir du rejeu. »

**Sources.** Les commits courts avec leur date et leur heure, puis les fichiers lus.
*Exemple :* « `49012f2d9` (27/11 16:55) ; `ml/ecurie/ETAPES.md` (partie C) ; `paroles-sacha.md` (section 2026-11-27). »

---

## À ranger au fil de l'eau, pour ne rien perdre

À noter pendant la journée, pas le soir de mémoire. Le bon endroit : le message du commit, ou `ml/ecurie/ETAPES.md` pour ce qui ne fait pas de commit.

1. **Chaque chiffre avec sa source.** Le commit ou le fichier qui le porte, le nombre de courses et leur durée (« 24 courses de 300 s », pas « un lot »).
2. **Chaque essai écarté.** L'idée, la date, le chiffre qui l'a fait écarter, en une ligne. Un essai jeté sans trace sera refait un jour.
3. **La phrase de Sacha.** Elle doit être relevée avec sa date et son heure dans `ml/ecurie/agents/tmp-voltige/paroles-sacha.md`. Ce fichier est hors git : en garder une copie à l'abri est à décider.
4. **Ce qui est montrable.** Le chemin de toute image, film, rejeu, tableau de bord ou page produits. Signaler s'il est hors git : un dossier ignoré peut être effacé (c'est arrivé en septembre).
5. **Le coût.** Les euros de crédit d'API (`ml/labo/journal/depenses.jsonl`), en rappelant que « 1 € compte pour 1 $ » et que la facture fait foi. Noter aussi l'usage de l'abonnement quand il est connu, et le temps de calcul du PC.
6. **Qui a fait quoi.** Le modèle qui signe le commit (ligne `Co-Authored-By`), les agents lancés, leur consigne et leur rapport.
7. **Ce qui reste ouvert.** Les questions posées à Sacha sans réponse, les mesures commencées mais pas finies.
8. **Les erreurs de Claude.** Une mesure fausse, une consigne mal comprise, un plan suivi trop longtemps. Les dire telles quelles.
