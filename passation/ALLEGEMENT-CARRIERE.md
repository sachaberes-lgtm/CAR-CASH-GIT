# ALLÈGEMENT — LOT B « CARRIÈRE » (2026-10-18)

Sacha : « enlève tout les truc du mode carrière », « enlève l'élément saute mouton », « remet la map paris dans le mode classique ».
Branche `al-carriere` (depuis 024675ba). `index.html` : 7 660 148 → 7 425 108 octets (−235 040, −3,1 %) ; `assets/img/carriere/` : −923 Ko.

## Ce qui est parti
- LE NOYAU : `CARRIERE`, `carNiveau`, `CARR`, `CARR_LARG`, `TEST_CARRIERE`, `bioMix`, `carrFait`/`carrMarque`, `SANS_CARRIERE` et la classe
  `html.sansCarr`, `PLAY_CARR`, le chemin CARRIÈRE de `lvlChoisir`, `portDest`, `prebCible`, la bannière « SKY HIGH 3 — … », `dbgCampagne`,
  `dbgCarriere`, `dbgCamp`, `dbgVille`, `dbgRendu`, `dbgMoutons`, `dbgPluie`.
- LES PISTES DESSINÉES : `genCampagne` (≈ 12 Ko) ; `CAMPM` reste déclaré (toujours vide : les générateurs des autres maps le vident, le pré-bâti l'échange).
- LES SYSTÈMES DES NUAGES 2-10 : `CAMP`, `campN`, les repères, les portes, les nuages dessinés (`o.mur`, `o.titan`, `c.ecran`), la poursuite
  (`SURV.chasse`/`SURV.camp`, `poursuiteTick`, `TIR`, `FUME`, `campVue`), les raccourcis d'ovale, la corde (`cordeK`, `CORDE_ON`), le portail
  fermé du niveau 10, la caisse-nuage du niveau 10 (`fantomePris`, `fantomeSaute`), les finales (`campFinale`, `villeFinale`, `parisFinale`,
  `espaceFinale`, `campEchec`), `campTick`, `campFx` (+ son CSS), `BIOMES.orageDore`.
- LA VILLE 11-20 : radars, ligne de néon (`campPad`), flaques, foudre, panne, catadioptres, fourgon, heure de pointe, banquier (`VBQ`),
  étages, `villeTick`/`villeDebut`/`villeStop`/`villeChauffePrep`, `VZ`, `VC`, `MUSIC_VILLE`.
- LES RÉSIDUS : satellites-obstacles `SATOB`/`satHard`/`impSat`/`?sats=route` (§0 d'`orbiteBuild`, rien ne tirait `r()` par défaut) ;
  Saturne (`planetesSaturne`, l'anneau `planetesAnneau`, `SATURNE_ANNEAU`, `BIOMES.espaceSat`, la vignette `espaceH`) ; PLUTON/`hard`.
- SAUTE-MOUTON : le niveau 4 et l'événement rare (`MOUTONS_ON`, `EVT_MOUTONS`, `?moutons=1`, `EVT_MT`, `evtMoutons*`, `moutonMats` que
  `campChauffe` compilait à chaque menu, `campMoutonLibre` neutralisé dans `veqSaut` et le saut de figure — le saut lui-même ne change pas).
- LES ÉCRANS : `#carr`, `carrVue`, `carrVueC6`, `carrLancer…`, `carrPlayMaj`, la tuile NIVEAU (`.gLevel`), `#gCarr`, l'onglet du hub, l'icône
  CARRIÈRE de `?menu=leo`, le `hCarr` de `HAS_D` ; ≈ 19 Ko de CSS (185 éditions, `<style id="carriereV2">` entier) ; `assets/img/carriere/`.
- LE SIMULATEUR DE LÉO : ses entrées SKY HIGH 1-5 et VILLE 1-5 (dbgCampagne) ; le niveau par défaut devient la PARTIE SANS FIN.

## Ce qui reste, et pourquoi
- L'ORAGE (`ECL`, `orageTick`, `CAMP_FLASH`/`CAMP_FOG`), la caisse-nuage de L'ÉVÉNEMENT RARE (`GH`, `fantomeTick`, `evt*`), les FILETS,
  `campCourbure` (`KAPB` : filets et ligne de la caisse-nuage), `campDebut`/`campStop`, `campChauffe` (caisse-nuage + voiture de police),
  `villeApres`, la plaque `vChip`/`#campChip` (le Survivant au téléphone, `meuteTick`), `vPos`/`vKmh`/`vPaie`/`vMat`, la pluie de débris `DEB`
  (`?debris=1`, `debK` retiré : il lisait la carrière), `SHAPES.nuage`, `SHAPES.lingot`.
- LA CAISSE-NUAGE et LE LINGOT : `CAR_UNLOCK` = `{p:1,8 M|2,2 M, exK:'carrN'|'carrV', exV:5}` (le prix du 14/10 écrit en dur) ; la migration
  après `SAVE.load` donne la caisse à qui l'avait gagnée ; `SAVE.d.carr`/`carrSel` restent lus par le nettoyeur ; `carStat('carrN'|'carrV')` gardé.
- Trois `:is(…)` CSS gardent leur item carrière (`#carr .carrBiome`, `.mAccB[data-m="carr"]`) : l'ôter changerait leur spécificité.
- Les quatre règles de l'ex-`<style id="sansCarriere">` : `.sansCarr` remplacé par `.hub` doublé (même spécificité, même cascade).

## PARIS revient dans le mode classique (changement voulu)
- `NIV_PARIS` (la ligne commentée du 10/10), `SF_NIV.paris`, `SF_CARTES.paris` = UN temps (`soir`, `parisOr` : la course tourne elle-même
  l'heure, or → bleue → nuit) ; `parisChauffe` revient au menu ; carte postale `assets/portail/paris-soir.webp` (dbgCartePostale) et
  `PCUBE_CP` ; répertoire des maps (`maps.js` + `img/paris-soir.jpg`) ; `?carte=paris` marche. Hors cycle fixe (`?classique=cycle`).
- Paris joue la RADIO (comme en carrière : `MUSIC_LIEU` n'a pas d'entrée `paris`) ; ses pigeons (PGP) sont gardés.
- Effets voulus de l'entrée de Paris au tirage : une map de plus (10), donc chaque map — et la caisse-nuage, qui ne vit qu'aux nuages —
  un peu plus rare (modèle d'`outils/evt-test.cjs` : 13,9 % des parties voient l'événement) ; les missions « chaque map » comptent Paris.
- Banc (scratchpad du lot, `banc-paris.cjs`, une passe par la file) : départ à Paris sans erreur, carte postale et photo tirées, portail
  Paris → nuages (midi) puis nuages → Paris (la fenêtre montre la Concorde) ; le plus long trou d'image au passage ≈ 190 ms (PC), 0 erreur JS.

## Contrôles
- `verif.cjs` : « aucun nom nouveau non résolu », VERIF OK. `garde-charte.sh`, `garde-burnout.sh` : OK. `outils/evt-test.cjs` : TOUT EST BON.
  FUMÉE (cc-banc/fumee.cjs) : OK, couché + debout, 0 erreur JS.
- Sons de la banque sans appelant après le lot : `pad.neon`, `rival.devant`, `rival.passe`, `radar`, `panne.gresille`, `trafic.accroche`,
  `flaque.sec`, `portail.ouvre`, `foudre.touche`, `monde.fin` (plus que dans SON_DUCK) ; appelants morts : `mort.feu`, `mort.foudre`
  (causes `feu`/`sat` disparues), `porte` (plots `dur`, vides), `abri` (la pluie de débris, `?debris=1`).
