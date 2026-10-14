# NOTES — mer-nuit (passe graphismes, 14/10) — la nuit et l'orage des NUAGES

Branche `gfx/mer-nuit` (copie `gfx/wt/mer-nuit`). Interrupteur : `MERNUIT_V2` — `?sans=mernuit` = l'image d'avant au bit près (rien n'est écrit).
Banc : `banc/mer-nuit/ab.cjs` (A/B en une ouverture, deux contextes, `TAGS=`/`COUPLES=`), `banc/mer-nuit/fin.cjs` (réglage final + portail + planche).
Captures : `shots/mer-nuit/` — `planche-iphone.png` (AVANT | APRÈS : nuit, orage, midi, soir, portail nuit → matin).
Capture comme l'iPhone : `?palier=2&tel=1`, couché 844×390, PAS de dbgQual/dbgDPR (DPR 3D 1 en RAPIDE) ; HUD masqué et `dbgNet(true)` (flou coupé) pour juger la couleur.

## CE QUI CHANGE (zones touchées)
- `const MERNUIT_V2` + `Object.assign(BIO_ETAL0,{mzH:[1,.985,.96,0],mzO:[.4,.5,.66,0],nuA:[1,1,1]})` (juste après `const BIO_ETAL0=`) : clés inertes partout
  (w 0 → `mix(x,c,0)=x` ; albédo ×1). Le rgb de mzH/mzO = la teinte d'avant, pour qu'un portail nuit → jour glisse vers elle.
- `bioApply` : UNE ligne après `CLOUD_MAT.color.setRGB(…)` — écrit `skyU.uMzH/uMzO` (sauf au titre, `CHUTE.on` : chuteRender pose les siens
  et les rend à la sortie, inchangé) et multiplie `CLOUD_MAT.color` (= `N8_U.uAlb`, l'albédo de TOUS les nuages) par `nuA`.
- Section MER DE NUAGES de l'étalonnage : un bloc `if(MERNUIT_V2){…}` avec nuagesNuit {mzH [.013,.023,.084,.85] (#1E2A52), mzO [.004,.007,.028,.85],
  nuA [.32,.34,.41]} et tempete {mzH [.068,.093,.162,.8] (#4A5670), mzO [.022,.03,.055,.8], nuA [.55,.58,.66]}. Filles villeOrage/jadeOrage : copies
  figées avant ce bloc, inchangées. + `window.dbgMer()` (banc : uniformes de la mer, albédo des nuages).
- Coût : 0 programme, 0 texture, 0 passe (des valeurs d'uniformes).

## POURQUOI PAS LA LIGNE DE TEINTE DE `buildCoton` (le plan)
Essayée (1er commit) : le shader `nuage8Mat` ne prend que 30 % de la teinte d'instance (`mix(1,vT,.3)`) → ×.30 donnait ×.79 : rien ne se voyait
(capture `apres-nuit-1` du 1er passage). Et l'albédo plancher `.55+volSun*.16` de `CLOUD_MAT` gardait la ouate éclairée. D'où `nuA` sur l'albédo :
lerpé au portail (la teinte d'instance, elle, est figée à la construction de la piste), et il éteint AUSSI les bancs, coussins et tours (maillages).

## VU (3 ouvertures navigateur, 0 erreur JS)
- NUIT : mer blanche-crème → bleu nuit (houle lisible) ; cumulus lavande éclairés → masses bleu nuit ; route plus claire que le ciel. 1er réglage
  .30/.34/.45 : bleu roi un peu saturé → .32/.34/.41.
- ORAGE : mer indigo claire → ardoise, cumulus ardoise ; la brume d'horizon reste plus claire que la mer (zénith sombre, horizon clair).
- MIDI, SOIR : uniformes w 0 / albédo ×1 relus au banc (identiques par construction) ; captures avant/après sur deux pistes tirées différemment.
- Portail nuit → matin : PAS VU (3e ouverture annulée : charge machine 130 puis 650). Par le code : `bioLerp` mélange mzH/mzO/nuA (w .85 → 0, nuA → 1),
  la mer revient à la teinte d'avant ; `fin.cjs` est prêt (3 images du fondu + relevé dbgMer, puis la planche légendée).
- Planche : composée SANS navigateur (`banc/mer-nuit/planche.cjs`, PNG en Node pur) — légende dans `planche-iphone.txt`.

## DOUTES / POUR LES AUTRES
- B1 (coton-blanc) : si le facteur de teinte d'instance du shader change, rien ne bouge ici (je n'utilise plus la teinte d'instance).
- Plan : « fusionner les deux lignes Object.assign par couple » — NON fait (lignes d'etal-nuages et hasard-beaute intactes, mon bloc s'ajoute) :
  moins de conflits de fusion ; à fusionner par l'intégrateur s'il le souhaite.
- La lune et le halo de la ville (`LVL`) non touchés. Béton de nuit non mesuré en L* (à l'œil : route plus claire que le ciel, phares devant).
