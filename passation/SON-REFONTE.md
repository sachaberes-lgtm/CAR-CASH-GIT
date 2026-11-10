# SON — LA REFONTE (2026-11-10, Fable, à la demande de Sacha)

Sacha : « Réécriture totale du système de son […] on a plein de problèmes différents en fonction des ordis. Des fois, ça fait des sons stridents.
Des fois, le son lag. […] tu retravailles chaque clic de chaque bouton. Le moteur, les virages, le nitro, la musique, tout ça doit être parfait. »

Branche `son-total` (worktree `~/cash-car/son-total`), partie d'`origin/main` v1415. Cache v1416. **Pas encore sur `main` : Sacha n'a rien écouté.**

## Ce qui a changé

| Quoi | Où | Avant | Maintenant | Revenir en arrière |
|---|---|---|---|---|
| Le bus des effets | `code/son/graphe-audio.js` (LE NOYAU, `sonEpaule`) | compresseur −16 dB 4:1 → tanh(1,3·x) : des harmoniques sur tout, même faible | compresseur −18 dB 3:1 → une épaule : droite jusqu'à 70 %, arrondi au-dessus. Même gain sur les petits signaux (mesuré : +8,2 dB), ±0,4 dB jusqu'à −12 dBFS | `?mix=ancien` |
| Le décrochage du fil audio | `sonGouverne` (appelé par `portesTick`) | rien ne le voyait | l'horloge audio comparée à celle de la page ; 2 décrochages en 30 s = un cran de charge : cran 1 = plafond de voix plus bas + salle débranchée ; cran 2 = musique de course pré-rendue au prochain départ + machine notée lente 7 jours (grand tampon à la session suivante) | `?songouv=0`, `dbgSonLent(0)` |
| La latence du contexte | `sonLatence` | toujours `interactive` | `interactive`, sauf machine notée lente : `playback` (21 ms sur Chrome Mac) | `?latence=min` / `?latence=sure` |
| Le plafond de voix | `VERSION PRINCIPALE/sfx.js` (`play`) | une polyphonie par son, aucune borne sur la somme | 16 voix courtes au plus (11 puis 8 sous la charge) ; la plus ancienne hors interface s'efface en 15 ms | — |
| Les sons en retard | `sfx.js` (éviction), `console-son.js` (`SONS_COURSE`) | un son de course muet depuis 60 s rendait son tampon et repartait 75-115 ms en retard | pas d'éviction pendant une course ; fruits, figures, poses préchauffés ; la seconde chance redemande le paquet | — |
| Le sifflement d'air | `graphe-audio.js` (`whF`), `boucle-5-sons.js` | bande Q 14 entre 2,7 et 4,2 kHz | bande Q 2,4 sous 2,8 kHz, gain ×0,42 (même énergie) | `?sondoux=0` |
| Le spool du nitro | `code/son/fanfare-turbo.js` (`nitroSpool`) | dent de scie dans un Q 7 jusqu'à 6,8 kHz, à chaque appui | bande large sur la fondamentale, passe-bas 2,8 kHz | `?sondoux=0` |
| Turbine, boîte | `graphe-audio.js` (`ewf`, `tf2`) | passe-bas 9 kHz ; denture à 2,6 kHz | passe-bas 3,8 kHz ; denture à 1,7 kHz | `?sondoux=0` |
| Le départ de la musique | `pouce-bleu-jeu.js` (`PB.presse`), `musique.js` (`musicStartRun`) | un morceau encore en chargement au départ de la course était annulé et un AUTRE tiré | il passe en course dès qu'il est prêt | — |
| Le réveil du contexte (musique) | `musique.js` (`musWaReveil`) | `AC.resume()` nu | `acReveil` (le refus d'iOS réarme l'essai) | — |
| La pluie | `graphe-audio.js` | 10 s de tampon calculées au 1er geste alors que la pluie est coupée | plus calculées | — |
| Sirène, charge du drift | `kit-lumiere.js`, `fanfare-turbo.js` | un événement d'automation par image | par `stt` (dédoublonné) | — |
| LES CLICS | `atelier-son/recettes.js` (`<<<LA TOUCHE>>>`), `sons-banque.js` | laque vitrée, note à 1 319 Hz, prise au-dessus de 3,5 kHz | bois laqué, une octave plus bas, rien au-dessus de 6 kHz. Centre du spectre mesuré : `ui.tap` 1 218 → 593 Hz, `ui.nav` 2 026 → 1 133, `ui.onglet` 2 141 → 875, `ui.appui` 1 892 → 651 | `git show fee3e0e9^:"VERSION PRINCIPALE/sons-banque.js"` |
| Les rôles de clic | `code/son/curseurs.js` (`UI_CLIC`) | `ok` retombait sur le clic ordinaire ; vignettes, flèches et entrées de lieu = `nav` | `ok`/`valide` → `ui.valide` · `choix` → `ui.choix` (vignettes) · `menu` → `ui.menu` (GARAGE, BOUTIQUE, MISSIONS, RÉGLAGES, COFFRE) · `suivant`/`precedent` → `ui.fleche` (un ton plus haut / plus bas) ; le JOUER et le ⚙ du PC ont leur son | — |

## Vérifier
- `node outils/banc-son/fumee-son.mjs --frenesie --chance` : VERT le 10/11 à charge machine ~20 (une seule musique partout, 0 son perdu, 0 décrochage).
  Sous une charge de 50 à 100 (autres sessions), il reste ROUGE sur un seul critère : 1 son d'ambiance de map (`foret.pic`, `foret.oiseau`) décodé trop tard —
  les sons propres à une map ne sont pas préchauffés (à faire : les annoncer au chargement de la map). Les sons de course, eux, ne partent plus en retard.
  La ligne « banque des sons » donne aussi `tardIds` (qui part en retard, en ms), `plafonnes`, `gouv`.
- En jeu : `dbgSonGouv()` (décrochages, cran, latence, mix), `CCSON.etat()`, `dbgVu()`, `dbgAudio()`.
- Écouter les clics un par un : `VERSION PRINCIPALE/sons.html` (famille « interface »).
- Recuire un son : `cd "VERSION PRINCIPALE" && PCM=1 node atelier-son/cuire.js '^ui\.tap$'` (pas de ffmpeg sur ce Mac : PCM 24 kHz).

## Ce qui n'a PAS été touché (validé à l'oreille avant, ou à Léo)
La gomme douce, le feu qui rugit, les 30 voix du moteur (timbres), le burn-out du garage (il garde l'ancien crissement), les morceaux et le
bus des basses, la triade de la frénésie, `ui.jouer`, `garage.bascule`, les sons de récompense (`ui.achat`, `ui.debloque`, `ui.record`…).

## Reste ouvert
- **Rien n'a été écouté** : les mesures disent le spectre et les niveaux, pas le goût. Les clics sont à juger par Sacha.
- **Vrai iPhone** : non mesuré (le gouverneur, le bus doux et les clics y sont actifs ; la latence n'y change pas).
- Une fumée lancée en latence `balanced` sous une charge machine de ~50 a compté 17 décrochages (6,7 s de retard) ; en `interactive` et `playback`,
  0. Non expliqué (charge du moment ou comportement de Chrome sans fenêtre) : c'est pourquoi le défaut reste `interactive`.
- Le moteur sonne +2,8 dB sur iPhone (`gE` = 1 quand le volume des `<audio>` est verrouillé) : calibrage d'avant Pouce bleu, laissé tel quel — à trancher à l'oreille.
- Le creux dynamique moteur → musique (`MUSBUS.moteur`) n'est branché que pour le moteur moderne (`?moteur=buche`).
- Les contextes de l'intro (`intro-161.js`) n'imposent pas 48 kHz et sortent hors du graphe commun : non touchés.
- `crunchSfx` (morsure de fruit) fabrique un tampon neuf à chaque appel ; les 13 tampons du ronron sont bâtis même éteint : petits coûts laissés.
