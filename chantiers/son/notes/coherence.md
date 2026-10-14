# LA COHÉRENCE DES NIVEAUX — session SON (2026-10-14, agent « coherence »)

Table complète (196 sons, appels, vol, grp/prio) : `/Users/sachaberes/cash-car/son/banc/coherence/table.tsv`
(script `table.cjs`). Niveau JOUÉ = base + BUS actuel + `vol` de l'appel.

## Ce qu'on mesure vraiment
- `mesures.txt` col. 5 = `L + f.db − 10` (cuire.js l. 93) : sonie LUFS200 du tampon NORMALISÉ à −20 (+ fiche db + TRIM).
  ⚠ Le BUS n'y est PAS (l'en-tête « sortie bus » ment) → j'ajoute le bus ACTUEL (ui −5 depuis le −3 de la cuisson, rec 0, fx +1, amb −4).
- Tout son est normalisé à −20 avant la fiche : col5 ≈ db − 30 (moins le limiteur doux sur quelques clics). Pour les sons
  cuits après mesures.txt (fronde, chute.vent, fruits recuits) : base = db − 30.
- Le `vol` d'un appel s'ajoute en dB (sfx.js l. 159 : TRIM + f.db + vol + recul du chef).

## La table, par famille fonctionnelle (dB LUFS200 joués, vol compris)
| famille | sons (niveau joué) |
|---|---|
| INTERFACE (bus ui) | ui.tap −35,3 · ui.on −36 · ui.equipe −37 · ui.nav −38,1 · ui.retour −38 · ui.danger −38,2 · ui.off −39 · ui.ok −39 · ui.refus −40 · ui.erreur −40 · ui.onglet −40,2 · garage.tole/bascule −40 · tuto.info −41 · mort.enseigne −41 · ui.modale −42,1 · ui.volet −43 · ui.feuille −43,1 · ui.feuilleFerme −44 · ui.compteur −44 · ui.voletSort −45 · ui.jauge −45 · ui.compte −45,1 · ui.curseur −45,8 · ui.appui −48,9 · ui.lettre −51,4 |
| INTERFACE sur bus rec | **ui.carte −34** (feuilleter la boutique) · ui.achat −29 · ui.banniere/mission/debloque −30 · ui.record −28 (−36 en course, Léo) · ui.carnet −24 |
| PETITS GESTES RÉPÉTÉS | piece −30 (**+4 Léo, à garder**) · fruit.* −28 (myrtille −30,7) · pad −27 · pad.neon −29 · frole −35…−32 · fig.vrille/maillon −31 · aura.geste −32 · fig.bump −30 · drift.charge −33 · virage −35 · dosdane −29 · flaque.eau/huile −28 · moteur.cylindre −38/−42 |
| RÉCOMPENSES | verdict.1 −28 · verdict.2 −26 · verdict.3 −24 · verdict.meteor −25 · aura.encaisse1/2/3 −30/−28/−26 · aura.x5/x8/x10 −28/−27/−25 · flow.1/2/3 −30/−29/−28 · fig.bigair/meteore/dauphin −30 · fig.palier −29 · fig.monstre −28 · fig.snake −27 · pose.parfait/cheveu −28 · raccourci −29 · pwr.* −28 (double −27, triple −25) · turbo.mini/super/ultra −29/−27/−25 · fruit.rafale −30 · argent.gros −29 · triade.revele −28 · jeu.sansFaute −30 · **piece.recolte −35** · **piece.serie −31** · **frenesie.cash −37** · jeu.palierVitesse −35 (−8, à garder) · nitrooo.palier −48 (−17, à garder) |
| GRANDS MOMENTS | verdict.mega −22 · monde.fin −22 · frenesie.entre −23 · fig.jackpot −24 · ui.carnet −24 · portail/orbite.entre/argent.palier/caisse.debloquee/jeu.miracule −25 · fruit.pasteque −25 · victoire −26 · frenesie.record −27 · moteur.palier −36 (−10, Léo « la trompette », à garder) |
| DANGER / CHOCS | explosion −16 · cratere −20 · pose.choc −29…−21 (selon l'impact) · impact.immeuble −23 · pwr.bouclierCasse −23 · mort.* −25 · trafic.accroche −26 · pose.lourde/travers/contresens −27 · foudre.touche −27 · chute −28 · plot −29 · triade.meurt −29 · nitro.sec −31 · alerte.tac −31,4 · flow.perdu/aura.perdue −32 · alerte.tic −33 |

## Les inversions trouvées
1. **LA FAMILLE DE LA PIÈCE CASSÉE PAR LE +4** (le plus audible : 2/3 des événements de course sont des pièces). La pièce
   est passée de −34 à −30 (Léo, 12/10) ; ce qui roule DESSUS est resté où il était :
   · `piece.recolte` (toutes les 5 pièces, une RÉCOMPENSE) −35 : 5 dB SOUS la pièce qu'elle couronne (avant : −1) ;
   · `piece.serie` (SÉRIE COMPLÈTE, récompense) −31 : sous la pièce (avant : +3) ;
   · la doublure de la 10e pièce (blip, vol −3) : −7 sous la pièce au lieu de −3 ;
   · `frenesie.cash` (« le ×3 qui couronne la pièce », conçu 3 dB sous elle, CLAUDE.md) −37 : 7 dB sous.
   → chacun reçoit le même +4 que la pièce (la relation d'origine revient).
2. **INTERFACE : LE MÊME GESTE, DEUX NIVEAUX** — feuilleter/présenter un objet de la boutique : `ui.carte` (bus rec, −34)
   pour une peinture/aile/traînée, `ui.feuille` (−43) pour une caisse (bqGeste l. 46101) ; et `ui.carte` est le son
   d'interface le plus fort du garage, au-dessus de l'appui principal `ui.tap` (−35) — un « je feuillette » plus fort qu'un « je valide ».
   → `ui.carte` −3 (−37, au rang de ui.equipe/ui.on, sous ui.tap) ; la caisse garde ui.feuille (elle a déjà garage.bascule).
3. Jumeaux de famille > 3 dB SANS raison écrite : aucun autre. (pasteque +4 sur les fruits : raison écrite « le graal ». turbo
   mini/super/ultra, verdicts, encaissements, ×5/8/10, flow.1/2/3 : monotones, 1-2 dB par cran.)

## Les chevauchements (même image)
- POSE : pose.choc (fx, sans grp) + verdict.N (r, prio 4-7) + pose.parfait (sans grp, t .08) + aura/encaisse (r) : le chef range le
  groupe r (verdict devant). pose.choc grimpe jusqu'à −21 sur une pose DURE : c'est un choc (famille danger) qui doit dominer : gardé.
- MÉTÉORE : cratere (r 5, −20) + verdict.meteor (r 5, −25) : même prio → pas de recul, le cratère couvre de 5 dB. C'est la même
  chose entendue deux fois (l'impact EST la figure) : gardé.
- MORT : explosion −16 (duckT 1) + mort.<cause> −25 + deathSound (DEATH_LIB, égalisé par son:chef) : la signature passe 9 dB sous
  l'explosion, par-dessus — c'est voulu (« on ENTEND pourquoi ») : gardé.
- PIÈCE : piece (sans grp) + piece.recolte (sans grp) + frenesie.cash : pas de chef, ils s'additionnent — d'où l'importance de leur
  ordre de niveaux (inversion n° 1).
- FRÉNÉSIE à la pose : frenesie.entre (r 8) passe devant verdict/aura/flow (r) : correct.

## Laissé (et pourquoi)
- piece +4, moteur.palier −10, ui.record −8 en course, nitrooo.palier −17, jeu.palierVitesse −8 : décisions datées (Léo/Sacha).
- fruit.pasteque −25 (= grands moments) : raison écrite dans la fiche (« le graal… l'accord doré qui dit jackpot »).
- pad −27 au-dessus de verdict.1 (−28) : le pad est une POUSSÉE (le TCHAK + l'élan, la vitesse se sent) ; 1 dB ne s'entend pas.
- fruits −28 = verdict.1 −28 : ils ne tombent pas dans la même image ; 2 dB au-dessus d'une pièce (le fruit pèse plus) : cohérent.
- SON_DUCK, grp/prio : pas réglables sans recuire (ou pas à moi).

## La règle appliquée (niveaux joués, LUFS200)
interface −35…−45 (ui.tap −35 = le plus fort des clics ; feuilleter −37) · petits gestes répétés −29…−33 (pièce −30, fruit −28,
pad −27 = poussée) · récompenses −24…−29 (encaissements −28/−26/−24, flow −28/−27/−26, verdicts −28/−26/−24, série −27, récolte −31
car elle double la pièce dans la même image) · grands moments −22…−25 · danger/chocs −16…−29 (explosion −16, cratère −20).
Toute récompense ≥ 2 dB au-dessus de la pièce ; tout ce qui « couronne » la pièce garde sa relation d'origine.

## Commits (branche son/coherence)
- 1f0ead5 récolte (+4) et série complète (+4) — blip / coinSerie
- b9ecf17 frenesie.cash +4 — frenCash
- 6861465 ui.carte −3 (4 appels) — garageGo, bqPhotos, vignettes d'habillage, bqGeste
- 4692157 aura.encaisse1/2/3 +2 — chaineEncaisse
- 8309a4d flow.1/2/3 +2 — flowSnd
