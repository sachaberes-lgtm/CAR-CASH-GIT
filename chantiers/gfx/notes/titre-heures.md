# Écran titre — les 6 heures (passe graphismes, 14/10)

Branche `gfx/titre-heures` (copie `~/cash-car/gfx/wt/titre-heures`). Uniquement des VALEURS, toutes sous `if(TITRE_V2){…}`
(bloc juste après `TITRE_CIEL`, ~l.46752 ; `?sans=titre` rend l'ancien titre). Helper local `T2(heure,{ciel,amb,P,v,t})`.
Posé APRÈS la copie de titreGolden/titreNuit par nuagesSoir/nuagesNuit : la course ne bouge pas (voir preuve).

## Par heure (avant → après)
- SOIR — ciel magenta/violet → zénith [.14,.14,.42] · milieu [.50,.38,.50] · horizon pêche [.95,.70,.58] (linéaire) ; brume [.68,.54,.52] ;
  sat 1.26→1.05, con 1.22→1.12 ; vigC prune neutre, vigK .34→.22 ; mer de nuages rosé-prune (mzT/mzO/mzH, mo/mh) au lieu de lilas ;
  hemiS/hemiG moins bleus-violets ; env (reflets) pêche/mauve ; caisse : amb 1, sol 1.1, sk 2.6, expo .9, cjA 1.3, cjF 1.9 ; voiles '34,28,56' ; filets de vent t [.78,.60,.54].
- GOLDEN — nuages/mer lavande → mer gris-rosé chaud [.58,.47,.44], zénith bleu doux [.09,.22,.54], milieu [.36,.50,.74], horizon or pâle [.98,.80,.60] ;
  sat 1.36→1.08, con 1.24→1.14 ; hemiS [.80,.76,.84] (cumulus moins bleu-lilas) ; vigC [.10,.06,.07] vigK .3→.2 ; caisse sk 2.9, amb .9, cjA/cjF 1.2/1.8
  (orange plus vif → se détache du fond pâli par sa chroma).
- NUIT — outremer saturé → #0B1230 → #1E2A52 (z [.004,.008,.04], h [.03,.05,.13]) ; sat 1.1→.9, con 1.18→1.12 ; cirrus ca .2→.12 ; mer sombre
  mzO [.045,.055,.10] ; reflet lunaire mh [.50,.58,.74] ; cumulus K .62→.5 (moins présents derrière le menu) ; caisse sk 3.3, amb 1.1, cjA/cjF.
- MIDI — cobalt du coin haut-gauche : zénith [.05,.26,.70] (≈#3F8FE0), horizon [.66,.82,.93] (≈#CFE8F7) ; sat 1.22→1.12, con 1.30→1.20 ;
  voile haut '2,30,80' .26 → '40,84,150' .20 ; mer plus claire mzO [.70,.80,.92] ; caisse amb .75, sol .7, sk 2.1.
- MATIN — avant identique au midi → horizon pêche clair [.92,.80,.68], lueur solaire or pâle [.62,.46,.28], brume rosée [.88,.80,.78], sunC [1,.90,.76],
  sat 1.24→1.14, con →1.14 ; voile bleu clair ; caisse mieux éclairée comme midi.
- APRÈS-MIDI — mer lavande → crème chaude [.74,.70,.72] ; zénith [.12,.32,.68] ; sat 1.26→1.15, con →1.15 ; caisse amb .75, sol .7, sk 2.1.

## Preuve « la course n'a pas bougé »
`banc/titre-heures/course.cjs` : dump JSON de dbgAmb('nuagesSoir'|'nuagesNuit'|'matin'|'midi'|'nuagesPluie') avec et sans `?sans=titre` :
`cmp shots/titre-heures/course-avec.json course-sans.json` → IDENTIQUES (octet pour octet) ; captures course-avec/sans-nuages{Soir,Nuit}.png :
même palette (les hashs PNG diffèrent seulement parce que la voiture roule).

## Identifié sans corriger (pas une valeur d'ambiance)
- Les filets blancs/bleus verticaux fins (soir x≈118, midi x≈335, nuit x≈345/500) = les FILETS DE VENT qui montent (CHUTE.w, sprites teintés par `TITRE_H.t`) ;
  intentionnels. Teinte adoucie au soir (t [.78,.60,.54]) ; pas retirés.
- L'« objet sombre en diagonale » en bas au centre (soir, x≈390 y≈375) : un tronçon de la piste de la chute (décor du titre) — géométrie, pas touché.
- La caisse paraît « brun-rouille » selon l'angle du tour sans fin (contre-jour) : c'était un manque de lumière (P.amb/sol/sk, cjA/cjF) ; relevé par heure.
  La peinture n'a pas bougé.

## POUR LES AUTRES / propositions
- La course SOIR (nuagesSoir, copie de titreGolden en cours) a encore un ciel violet-orangé ; le titre SOIR/GOLDEN n'y ressemble plus (voulu : charte règle 5).
  Si l'agent « nuages soir » rapproche la course du pêche→mauve doux, reprendre les valeurs T2('soir') comme base.
- Le titre peut encore gagner un vrai lever de lune à la NUIT (moon .8–1.35 existe, peu visible au zénith sombre) : valeur `moon`/`stars` à essayer.
