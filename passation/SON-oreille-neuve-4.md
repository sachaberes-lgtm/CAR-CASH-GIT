# L'oreille neuve n°4 : audit final son (lecture seule, 2026-10-14)

Base : `son/integ/VERSION PRINCIPALE/index.html` à HEAD `ae3dae8`. RIEN ÉCOUTÉ. Méthode : banque dumpée (`son/banc/oreille4/banque.txt`, 196 fiches),
ids appelés par `sfx('…')` croisés avec la banque (`appels.txt`), puis lecture ciblée des moments listés dans la mission.
Audit écourté (quota) : couverts = pouvoirs, défis, carrière, dauphins/singes, NITROOO, frénésie, écran de fin, garage/boutique, tonalité, répétition.
Non rejoués : niveaux relatifs sous la musique iPhone (`MUS_WA`), déjà traités par oreille-neuve-1/3 et coherence.md.

## Défauts au-dessus de « mineur » : UN seul

### 1. Une ligne de néon manquée (campagne N12) sonne comme une DÉFAITE et creuse le mix
- PREUVE : `chainesTick` l. ~41014 : `popTexte('LIGNE CASSEE',…,0)` (priorité d'affichage 0, un petit raté) puis `sfx('defaite',{vol:-5})`.
  `defaite` = fiche `rec`, +3 dB, groupe `r`, prio 5, « le cuivre qui s'affaisse » (le son du banquier qui gagne). `SON_DUCK['defaite']=.3` (l. 34215) est
  appliqué par `sfx()` sans tenir compte du `vol` (l. 34225 : `if(h&&SON_DUCK[id])duckT=…`) : le moteur et le vent reculent comme pour une vraie défaite.
  Le −5 dB baisse le niveau (= −2, celui de `aura.perdue`/`flow.perdu`) mais pas le creux, ni la prio 5 du groupe `r` (une pièce ou un frôlé dans les 110 ms recule de 9 dB).
- POURQUOI : le raté bénin le plus fréquent de la campagne VILLE prend la voix d'un verdict de famille « fin de duel » ; la hiérarchie danger/récompense est brouillée.
- CORRECTIF (une ligne, son seul) : `if(SONV2)sfx('aura.perdue',{st:-2})` à la place de `sfx('defaite',{vol:-5})` (trois notes qui descendent, étouffées, niveau déjà voulu, pas de duck, pas de prio).

## Mineurs (une ligne chacun)
- NITROOO / AIR NITROOO : à l'armement (`nitroooPart`) flash + fov + secousse mais aucun son propre ; seuls `chaineAura` (aura.geste) puis un tic de palier à −19 dB une seconde plus tard. Silence voulu par Léo (08/10, 12/10 « bruit parasite »), à ne pas toucher.
- Entrées mortes : `pwr.b`, `pwr.bouclierCasse/Fin/Plot` (aucun pouvoir bouclier dans `PWR_ORDRE=['n','a','v','m','x']`) ; leurs entrées `SON_DUCK` aussi. Inoffensif.
- Substituts d'attente : `singe.troupe`→`dauphin.banc` +5 dB, `aura.moyenne`→`victoire` −4, `caisse.atchoum`→`nitro.sec` : sonnent, mais empruntent un son d'une autre famille (le banc de dauphins pour des singes).
- `pose.parfait` (v1, rj 1,2 %, vj 1 dB, aucune variation de hauteur) : le même « tchak » à chaque pose parfaite ; cd 0,2 s. Un `st` qui suit la série (`jeu.sansFaute` le fait déjà) l'éloignerait d'un tic.
- `virage`, `dosdane`, `decollage`, `drift.charge`, `alerte.tic/tac` : v1, ±1,2 % de hauteur seulement ; cadences basses sauf les tics d'alerte (volontairement mécaniques).
- Garage : les sons `key:1` gardent la tonalité du dernier morceau du lobby alors que la musique y est en pause (`sonTonSuit` lit `musicEl.src`, qui reste) ; sans musique jouée depuis le lancement t=0. Cohérent avec la nappe de boutique (`bqSon` lit la même `_t`) ; aucune dissonance entendue possible hors musique.
- Fin de partie : `ui.compte` (360-1110 ms), `ui.jauge` (520 ms, 1,1 s), `ui.record` (810 ms), `mort.compteFin` (1110 ms), `ui.carnet` (490 ms) se chevauchent ; niveaux (−10/−10/+2/0/+6) non réécoutés, déjà calés par la session INTERFACE.
- `ASTUCE` (misBanniere) : bannière muette ; voulu (conseil, pas récompense).

## Vérifié et écarté
- Pouvoirs : prise (`pwr.<k>`/`pwr.autre`), cumul (re-prise rejoue la signature, durée plafonnée), double/triple, tic-tac `pwr.bientot` une fois, fin `pwr.fin` pour n/a/v et m/x : tout sonne.
- Défis : `ui.mission` part à l'affichage de la bannière (titre constant `'DÉFI RÉUSSI'`), `ui.carnet` en lobby et à la mort ne se doublent pas (titre différent).
- Frénésie : arme / entre / pose / cash / record en direct / sort (muet à la mort) : chacun a sa fiche, record ne tombe pas sur l'entrée.
- Carrière : radar, pad.neon (st qui monte), fourgon, rival.devant/passe, victoire/défaite, éclair+tonnerre différé, abri, panne.gresille : tous sonorisés.
- Dauphins : `dauphin.banc`, `jeu.dauphin` (st), `fig.dauphinRoyal` ; singes : sonorisés par substitut.
- Boutique : nappe `bqSon` accordée sur `sonTonSuit._t`, atelier plongé à −45 dB ; achat/équiper/carte/tampon sans double son.
- Les fallbacks `!sfx('id absent')` ne se déclenchent pas en double : `play` rend null pour une fiche absente, et ces ids sont absents donc le repli est unique.

## VERDICT
La zone son est quasi « finie » : un seul défaut vérifié au-dessus de mineur (n°1, correctif d'une ligne, sans risque), tout le reste est mineur ou voulu.
Après le n°1 : OUI, plus rien au-dessus de mineur DANS CE QUI A ÉTÉ LU. Réserve honnête : aucune écoute, et les niveaux relatifs sous la musique iPhone n'ont pas été recalculés dans cette passe ; seule l'oreille de Sacha peut les trancher.
