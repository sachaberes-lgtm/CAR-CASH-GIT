# L'écurie — des bots du palier 1 au palier 30, indiscernables de vrais joueurs

Demande de Sacha, 24/11/2026 : « des bots qui peuvent faire des matchmaking du record de palier 1 au palier 30, et qu'on ne puisse pas
faire la différence entre eux et des vrais joueurs. Les joueurs qui ne sont pas forts doivent avoir des bots de leur niveau, et les très
bons joueurs aussi. » Et : « on garde bien des traces visuelles pour le portfolio ».

Ce document remplace, pour la suite, les étapes 2 à 8 de `passation/BOTS-ML.md` (l'ancien plan de la boucle). Les étapes 0, 1 et 1 bis restent
le socle : `ml/reel` (le vrai jeu sans écran), `ml/bot` (le contrat du bot), `ml/labo` (la boîte noire).

**Le crédit API (ajouté le 25/11).** Ce qui est remplacé, ce sont les étapes de l'ancien plan, pas l'usage du crédit : à la demande de Sacha du
24/11 (« il faut que tu utilises les 200 euros dans ton plan »), une boucle sur l'API a été écrite pour l'écurie (`ml/ecurie/boucle.js` : Claude
écrit des variantes du pilote, le vrai jeu les note). Elle dépense sous un plafond général de 200 € lu au journal des dépenses du labo
(`--plafond`), par un calibrage de 10 € puis des tranches de 20 € (`ml/ecurie/ETAPES.md`). Hors de ce cadre, pas un euro sans l'accord de Sacha.
Au 25/11, aucun tour payé n'a tourné.

**État au 24/11 au soir : l'étude est faite, le socle est en cours de reprise, aucun pilote de l'écurie n'existe encore.**

---

## 1. Ce qu'est un palier, mesuré

Un palier est un moteur (`ENGINE_TIERS`, 30 entrées, de MOTEUR ROUILLÉ à TROU NOIR). On le gagne en ramassant des pièces **pendant**
une course : 40 pièces pour le palier 2, 860 pour le 11, 1 585 pour le 16, 4 385 pour le 30. Chaque course repart du palier 1.
Le record d'un joueur (`SAVE.d.ex.eng`) est le palier le plus haut qu'il ait touché.

| | palier d'une partie | meilleur |
|---|---|---|
| les joueurs (14 parties, Sacha au clavier et Léo au doigt) | médiane 11,5 — de 1 à 28 | 28 |
| le bot de référence (20 courses) | médiane 10 | 20 |

Ce que l'étude a établi (`etude/`, neuf rapports avec leurs preuves dans le code) :

- **Seules deux choses donnent des pièces** : une pièce ramassée (1), une figure posée (2 à 18). Tout le reste ne donne que de l'argent.
- **Les joueurs ramassent environ 420 pièces par minute quel que soit leur niveau.** Le palier d'une partie, c'est surtout sa durée :
  palier 5 vers 1 minute, palier 10 vers 2 à 3, palier 15 vers 3 à 4, palier 20 vers 4 à 6, palier 28 vers 8 à 9.
- **On ne meurt presque qu'en vol** : contre le décor (roche, pic, tour, paroi), jauge d'air vide (6 s), fond du monde. Au sol, rien ne tue
  sur la dalle, sauf les murs des couloirs à grande vitesse.
- **La vitesse monte avec le palier** jusqu'à × 6,3, et les virages s'agrandissent avec elle : c'est le vrai plafond de l'élite.
- **La seconde chance** (une par partie, après 20 s) coûte un palier. Les deux meilleures parties de l'étalon l'ont prise.
- **Aucune voiture n'avantage un joueur** (la physique lit toujours la première caisse). Ce qu'une vieille sauvegarde apporte : des
  figures qui paient plus, le départ boosté, la seconde chance gratuite.

## 2. Ce qui trahit un bot

Le juge `ml/bot/discerner.js` sépare le bot de référence des joueurs presque à coup sûr (0,97 sur 1). Le style des joueurs, mesuré :

- un **slalom permanent** sur toute la largeur de la route, 1,2 à 1,8 changement de sens par seconde ;
- le volant **par petits coups** de 0,1 à 0,4 s, une centaine par minute, à intervalles irréguliers ;
- la **nitro tenue 60 % du temps**, tapotée (le bot : 18 %). Ce qui le permet : la « ligne parfaite » de fruits et de plaques, qui rend
  plus de nitro qu'on n'en brûle si on la suit ;
- **8 vols par minute**, presque tous en sortant par le bord, 2 s chacun, 30 à 50 m de haut (le bot : 3,7 vols, courts et bas) ;
- peu de figures : 85 % des vols n'en ont pas.

Il y a au moins deux styles (Sacha au clavier, Léo au doigt : plus de drift, vols plus courts). Et une limite à dire à chaque fois :
**14 parties de 2 joueurs**. Le juge connaît Sacha et Léo, pas « les humains ». Aucune partie de débutant.

## 3. Le dessin

1. **Voir.** Les yeux v2 : un radar qui prévoit le vol (pose, choc contre le décor, jauge vide) pour plusieurs façons de piloter, les
   couloirs et plafonds devant, la vitesse sûre d'un virage, la ligne parfaite, l'aimant, le palier.
2. **Agir comme une main.** Les doigts v2 : durées d'appui tirées d'un hasard à graine, temps de réaction, suivi du volant à chaque
   image, drift, seconde chance. Un cerveau sans profil conduit exactement comme avant.
3. **Un seul pilote, un profil.** Le niveau et le style sont des réglages : part de la ligne parfaite suivie, prudence avant les
   virages, appétit de vol et de raccourcis, qualité du rattrapage en vol, temps de réaction, taux d'erreur.
4. **Le pilote d'élite d'abord**, amélioré par tours : lire ses morts (autopsie), corriger, noter sur 20 graines. Tout passe par le labo.
5. **L'échelle.** On règle 30 profils par la mesure : le niveau N est le profil dont le **record** sur une vingtaine de parties vaut N.
   Le rythme de ramassage reste celui d'un humain ; c'est la survie qui change.
6. **Le juge.** Chaque niveau passe devant `discerner.js`. « Indiscernable » exige un juge à pile ou face **et** aucune mesure à plus de
   1,5 écart-type des joueurs.
7. **Le paquet du matchmaking** : pour chaque palier, ses pilotes, leurs chiffres et des courses toutes prêtes (fantômes).

Les bots jouent la **version allégée** du jeu (`--regime allege`), celle des joueurs de l'étalon et du téléphone : Crypto City n'y est
pas au tirage.

## 4. Ce que ça ne fera pas tout seul

- **Brancher les fantômes dans le jeu.** Il n'y a ni serveur ni classement ; le niveau du joueur se lit dans sa sauvegarde, et les
  courses des bots devront être livrées avec le jeu. C'est un changement du jeu, à décider par Sacha.
- **Garantir le palier 30.** Il demande environ 11 minutes de survie à une vitesse six fois plus grande. Le plafond atteint sera mesuré
  et dit, pas promis.

## 5. Les traces pour le portfolio

Chaque pilote entre par `ml/labo/inscrire.js` : son code, la raison de chaque changement, sa note, ses courses rejouables. L'arbre
(`ml/labo/arbre.html`) montre la lignée ; la salle de projection (`ml/labo/projection.js`) filme une course à 60 images par seconde.
À la fin de chaque jalon, un dossier `ml/labo/jalons/<nom>/` : le champion, trois films, la courbe, dix lignes de bilan.
