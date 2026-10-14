# Éco · rythme d'argent du début (session GAMEPLAY, 2026-10-14)

Session arrêtée au bout d'environ 1 h (on passe sur un autre ordinateur). **Aucun commit de code** dans `wt/eco` (branche `travail` = `base`, rien n'a changé).
Ce qu'on a mesuré contredit la ligne du BACKLOG. Un coup de pouce codé sans être remesuré risquait de faire tomber le 1er achat AVANT la 3e partie : il n'a donc pas été écrit.

## L'objet le moins cher n'est pas NOIR MAT
Boutique de Léo (`bqListe`, cinq onglets : VOITURES · PEINTURES · AILES · TRAÎNÉES · FIGURES) :
- **$ 2 000** : traînée MENTHE (`COSM.trainee`) et figure SHIMMY (`figures.js`)
- $ 2 500 : peinture MENTHE GLACÉE et figure TOUPIE 360 · $ 3 000 : ailes HÉLICES · $ 3 500 : figure CHANDELLE · $ 4 000 : traînée ROSE NÉON
- $ 5 000 : BLEU MINUIT · $ 9 000 : NOIR MAT
- voitures : les communes à $ 1 500-8 000 sont toutes `retire:1`. La moins chère qu'on peut encore acheter est l'ELDORADO à $ 24 000.

Pourquoi l'éclaireur s'est trompé : la boutique s'ouvre sur l'onglet VOITURES (24 k et plus, capture `pilotage/notes/eclaireur/12-boutique-1.png`). Les objets à 2 000 $ sont rangés dans d'autres onglets.

## D'où vient l'argent
- **En course** (`money`) : les pièces font l'essentiel (`denom()` = DENOMS[palier] × ECO3.gain 0,25 → 0,75 $ par pièce au départ, montant avec le palier moteur), multipliées par la RÉCOLTE (jusqu'à ×2,5) et par le FLOW (jusqu'à ×3), plus les portails et les fins de monde. Les figures ne rapportent que de l'aura.
- **Vers la banque** : `commitExploits` verse `money − START_CASH`, seulement ce qui a été encaissé. La mallette perdue en vol ne compte pas.
- **Primes versées directement en banque** : permis (auto-école) **+500**, une seule fois. Contrat 1 : 25 pièces +150, 4 fruits +150, encaisser 200 $ +200 (= 500). Contrat 2 : 2 figures, 10 s de nitro, 672 km/h, +300 chacun (= 900). Contrat 3 : 2 500.
- Ce que la sauvegarde sait déjà : `ex.runs` (parties jouées, leçon quittée exclue), `shop.own`, `figs`, `owned` (les achats), `bankMax`. Aucun champ neuf n'est nécessaire pour un coup de pouce.

## Mesures au banc (économie d'aujourd'hui, départ = 500 $ du permis)
Banc `sensations/banc/eco-banc.cjs` (N parties de suite, boucle avancée à la main par pas de 33 ms) et `eco-sonde.cjs` (argent toutes les 5 s de jeu).

| pilote | argent en course selon le temps tenu | solde après les parties 1…n |
|---|---|---|
| au sol, nitro tenue (`{nit:3}`) | 10 s : 43 · 20 s : 449 · 30 s : 602 · 40 s : 784 · 45 s : 1 196 · 50 s : 1 486 | 1 632 · **2 662** · 4 264 |
| sauts + nitro (`moyen`, crash forcé à 45/60/75/90 s) | 45 s : 175 · 75 s : 1 428 · 90 s : 1 230 ; une partie sur deux meurt seule vers 10 s (« sat », « air ») | 974 · 978 · 1 013 · **2 441** · 2 550 · 4 877 |
| « humain » : sans nitro, louvoie sur ±60 % de la route | 10 s : 16 · 25 s : 74 · 40 s : 218 · 50 s : 433 · 55 s : 546 | (une seule partie mesurée) |
| ce que l'éclaireur voyait (robot sans pilote, 10-30 s) | 5-35 $ | jamais 2 000 |

Défaut du banc : vers 50 s le pilote reste bloqué au 1er portail (zone 1, `s` ne bouge plus). Les montants au-delà de 50 s sont donc sous-estimés. Les captures des écrans de fin sont dans `banc/shots/eco/fin-*-avant-*.png`.

## Hypothèse du joueur moyen et conclusion provisoire
Hypothèse : un joueur moyen tient 45-90 s par partie et ramasse entre le pilote « humain » (sans nitro, qui louvoie) et le pilote au sol, soit environ 300 à 1 000 $ par partie. Il remplit le contrat 1 dès la 1re ou la 2e partie, et une partie du contrat 2 vers la 2e-4e.
→ Avec l'économie d'aujourd'hui, il peut déjà acheter l'objet à 2 000 $ **vers la 2e ou 3e partie**. L'achat à « ~1 500 parties » vient du robot qui ne conduisait pas et d'un prix mal lu (9 k au lieu de 2 k).
Seuls les joueurs qui meurent en 10-30 s (5-120 $ par partie, plus les primes) mettent plus de 5 parties.

## Ce qui reste à faire (et à trancher par Sacha)
1. **Quel est « le premier achat » visé ?** Si c'est l'objet le moins cher (2 000 $), il ne faut pas de multiplicateur. Il ferait tomber l'achat avant la 3e partie pour le joueur moyen.
   Il resterait au plus un **plancher** pour les joueurs faibles : une prime proportionnelle au temps tenu, qui ne vaut que si `ex.runs` ≤ 5, aucun achat et `bankMax` < 2 000, qui s'efface d'elle-même et qu'on coupe avec `?eco=ancien`.
   Si Sacha vise NOIR MAT (9 k) ou l'ELDORADO (24 k), c'est un tout autre coup de pouce (environ ×3 à ×8 sur 4 parties), à recalculer.
2. **Le vrai manque est sans doute la visibilité** : l'écran de fin ne montre plus aucun objet à acheter (`objRender` montre les missions, `objectif()` ne vise que les caisses). Proposition : une ligne sobre sous « COMPTE : … » (`#mCashTot`), par exemple « TRAÎNÉE MENTHE · $ 2 000 — IL TE MANQUE $ 450 », qui viserait l'objet le moins cher de TOUS les onglets. Et/ou ouvrir la boutique sur l'onglet de l'objet à portée.
3. Le banc doit d'abord savoir passer le portail (`dbgPortail`) pour mesurer des parties de 60-90 s. Ensuite : 5 parties avec et sans `?eco=ancien`, puis la courbe du solde des parties 1 à 6.
4. Port 8872 : il est occupé par le serveur de `pilotage/integ` (PID 31400). J'ai servi sur le 8874, serveur arrêté.
