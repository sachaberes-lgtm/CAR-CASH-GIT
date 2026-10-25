/* ================= L'ÉTALONNAGE PAR MAP × MÉTÉO (2026-10-14, passe graphismes) =================
   Sacha : « pour chaque map, pour chaque météo… la colorimétrie, l'étalonnage… que tout soit cohérent » — et la route devient un béton mat.
   Des SURCHARGES de valeurs, posées APRÈS toutes les définitions : `bioMet` COPIE son parent, donc retoucher ici une ambiance mère ne
   change plus ses filles — chaque couple se règle seul. Une section par map (une équipe par section). Gratuit pour la puce : des nombres. */
// ---- ÉTALONNAGE · MER DE NUAGES (matin · midi · nuagesSoir · nuagesNuit · nuagesPluie · tempete) ----
Object.assign(BIOMES.matin,{sat:1.10,con:1.14,expo:.98,jZen:[.12,.36,.76],jMid:[.35,.58,.85],jHor:[.97,.85,.74],jSol:[.5,.36,.2],fog:[.93,.87,.82],fogCj:[.98,.9,.76],fogIn:[.96,.95,.95],sunC:[1,.92,.78],hemiG:[.7,.72,.8],fillC:[.55,.68,.92],volSky:[.8,.84,.94],volGnd:[.78,.78,.86],vigC:[.06,.07,.11],env:[[0,'#5E9FDD'],[.3,'#9CC4E6'],[.48,'#F4E2D0'],[.58,'#FFF1DC'],[.66,'#B9C3D2'],[1,'#8E9AB0']]}); // (2026-10-14, passe graphismes) MATIN : sat/con produits 1,19/1,21 (≤1,20/1,22), ciel azur → pêche pâle (charte #5E9FDD → #F7D9BC), brume pêche de l'horizon, clé or pâle, ombres lavande, cumulus crème clair (plus de beige/lilas), vignette neutre. NB les jZen/jMid/jHor sont LINÉAIRES (avant ACES) : les poser en sRGB les rend trop clairs
Object.assign(BIOMES.midi,{rtK:.9,sat:1.14,con:1.18,expo:.96,jZen:[.13,.40,.84],jMid:[.5,.74,.93],jHor:[.81,.91,.97],jSol:[.3,.28,.2],fog:[.8,.89,.96],fogCj:[.94,.93,.88],sunC:[1,.99,.96],hemiG:[.7,.72,.8],fillC:[.5,.7,.95],volSky:[.8,.86,.95],volGnd:[.8,.82,.88],vigC:[.06,.08,.12],env:[[0,'#3F8FE0'],[.3,'#7FB8EA'],[.48,'#DDEEF8'],[.58,'#FFFFFF'],[.66,'#BCCBD8'],[1,'#90A4BC']]}); // (2026-10-14, passe graphismes) MIDI : sat/con 1,23/1,25, fini le cobalt (azur → horizon bleu très clair), brume bleu clair, cumulus BLANCS (clé blanche, ombres bleu pâle, plus de taupe), expo .96 pour que le béton reste à L* ~45, vignette neutre
Object.assign(BIOMES.nuagesSoir,{expo:.97,hemiI:.6,jSol:[.9,.5,.24],sunHalo:.9,sunC:[1,.78,.6],volSky:[.56,.5,.68],volGnd:[.34,.27,.34],vigC:[.07,.05,.08],env:[[0,'#3C4C8C'],[.3,'#8C7CAA'],[.48,'#FFB98A'],[.58,'#FFD6A8'],[.66,'#A88A94'],[1,'#6A6080']]}); // (2026-10-14, passe graphismes) SOIR : sat/con 1,25/1,25 (≤1,30), pêche → mauve doux (plus de violet vif ni d'orange fluo), clé pêche (#FFC79A) ADOUCIE après contrôle (sunI 1,7 → 1,15, hemi .55 → .6 : au soleil de face le béton virait au saumon L* 65, sat .5 — non revérifié à l'image), ombres prune, cumulus pêche (ventres moins noirs), halo du soleil .9, vignette neutre (plus de rose)
Object.assign(BIOMES.nuagesSoir,{sunI:1.25}); // (2026-10-14, passe graphismes · hasard-beaute) NUAGES SOIR : béton plus lisible et moins violet-sombre (rtK .83 → 1,05, rebond sol plus chaud, clé 1,15 → 1,25) ; vu au vrai tirage
Object.assign(BIOMES.nuagesNuit,{expo:1.0,fogN:600,fogF:4000}); // (2026-10-14, passe graphismes) NUIT : sat/con 1,12/1,21 (≤1,15/1,25) ; lumière qui éclaire le béton remontée (hemi .5 → .58, lune .75 → .8 en #B3C2E6, fill .22 → .26, expo .92 → 1,0) : béton L* 18-34 mesuré selon l'angle avec .65/.9/.3 (avant : trou noir), puis allégé d'un cran — non revérifié, ciel linéaire charte #0B1230 → #1E2A52 (plus sombre que la route), brume bleu sombre = horizon. Reste : la mer de nuages (GLSL merZ) garde des sommets blancs
Object.assign(BIOMES.nuagesPluie,{sat:1.04,con:1.10,expo:1.0,sunC:[1,.82,.70],hemiG:[.34,.30,.40],jZen:[.20,.17,.27],jMid:[.42,.32,.43],jHor:[.80,.58,.58],fog:[.58,.50,.55],fogIn:[.62,.54,.58],fogCj:[.70,.56,.56],vigK:.28,vigC:[.07,.05,.10],sunTint:[1,.78,.68],sunHalo:.4}); // (2026-10-14, passe graphismes) PLUIE : sat/con 1,04/1,17 (≤1,05/1,18), gris perle (ciel et brume du même gris-bleu, plus de pervenche clair), clé diffuse #D5DEEA, la route mouillée garde le spectacle
Object.assign(BIOMES.matin,{nuLav:[.82,.89,.95],nuR:[-.3,.45,.78,1],nuK:[1,1.15,1,1],volSun:[2.75,2.7,2.65]}); // (2026-10-14, passe graphismes · nuages-jour) MATIN : les cumulus ne sont plus gris-lavande. Cause : l'ombre des cumulus (GLSL nuage8Mat) était un bleu-lavande FIGÉ vec3(.72,.78,.97) × .64 ; elle devient un bleu-gris clair vert-bleuté (L* ventre ~65 au lieu de ~55, plus de teinte 280°), frontière d'ombre plus douce (pas de liseré), soleil ×1,15 et albédo ~1 (sommets L* ~88-90). Valeurs seulement. (Le fond de dalle ne s'estompe pas par fogN/fogF : la route a sa propre brume, essayé 200/1100 → 320/1900, sans effet à l'horizon.)
Object.assign(BIOMES.midi,{nuLav:[.80,.89,.97],nuR:[-.3,.45,.78,1],nuK:[1,1.08,1,1],volSun:[2.7,2.7,2.65]}); // (2026-10-14, passe graphismes · nuages-jour) MIDI : cumulus BLANCS au soleil (sommets L* ~90, soleil ×1,08 pour garder le modelé ; ventres bleu-gris clair (L* ~60-65, ex. lavande L* ~45-55 d'orage), ombre douce sans liseré ; même mécanisme que le matin
Object.assign(BIOMES.nuagesSoir,{jHor:[.95,.70,.58],volSun:[2.5,2.25,2.0],hemiS:[.76,.69,.8]}); // (2026-10-14, passe graphismes · nuages-jour) SOIR (course) : même famille que le titre SOIR/GOLDEN (zénith mauve doux [.14,.14,.42], horizon pêche [.95,.70,.58], sat 1,08 / con 1,14) ; cumulus pêche crème, ventres prune rosée désaturée (nuLav), lisière de contre-jour adoucie (nuK.z .5), plus de galets orange-mauve ; hemiS un peu moins bleu (le dessus des cumulus à l'ombre). N'écrit QUE nuagesSoir (copie figée de titreGolden au chargement : le titre ne bouge pas)
Object.assign(BIOMES.nuagesSoir,{jZen:[.10,.14,.32],jMid:[.42,.38,.46],sat:1.06,rtK:.90,mzH:[.95,.68,.52,.8],mzO:[.13,.11,.13,.8],nuLav:[.66,.60,.64],nuR:[-.3,.45,.56,1],nuK:[1,1.3,.5,.5]}); // (2026-10-14, passe graphismes · soir2) SOIR, en VALEURS (le passage d'avant n'avait changé que la teinte) : la mer de nuages avait un seul étage clair (sommets crème, creux bleu-violet pâle, tout à L* 45-65) → sommets pêche chaud (mzH .95,.68,.52, part .8) et CREUX prune désaturée sombre (mzO .15,.10,.14, part .8) : l'étagement sommet/creux se lit enfin, comme au titre SOIR/GOLDEN (pêche → prune) ; cumulus : clé ×1,12 → ×1,3 (sommets plus clairs), ventres plus sombres et moins bleus (nuLav .84,.72,.78 → .70,.58,.66, clarté d'ombre nuR.z .74 → .56) ; béton rtK 1,05 → .90 (L* mesuré 32 → ~25, charte 22-30 : la caisse orange se détache) ; con 1,14 → 1,24 (≤1,32), sat 1,08 → 1,06 (réel 1,28 ≤ 1,30) ; zénith un cran moins violet (jZen .14,.14,.42 → .16,.15,.36, non revérifié à l'image). N'écrit QUE nuagesSoir (copie figée de titreGolden : le titre ne bouge pas, mesuré identique). ⚠ mzT n'est PAS un champ d'ambiance (bioLerp lit BIO.from[k][0] : TypeError) — ne pas l'ajouter."
Object.assign(BIOMES.tempete,{jour:1,hemiG:[.1,.12,.2],volGnd:[.1,.11,.17],sh:[0,.008,.03],vigK:.5,vigC:[.02,.025,.045],eS1:[190,205,235,.3],eS2:[120,140,180,.25],env:[[0,'#1B2236'],[.3,'#2A3348'],[.48,'#4A5670'],[.58,'#6A7690'],[.66,'#2A3144'],[1,'#10131C']]}); // (2026-10-14, passe graphismes) ORAGE (niveau L'ORAGE) : ARDOISE — le ciel passe de l'ancien dégradé Vice City (violet/magenta, orange au zénith sous skyMul) au « jour d'altitude » gris-bleu #1E2740 → #4A5670 (jour:1, comme les 5 autres météos), contre-jour violet → bleu-gris, hemi/fill/brume/vignette sans violet, sat 1,0 × 1,08 = 1,08 (≤1,10) ; mêmes fogN/fogF (visibilité du niveau)
/* (2026-10-14, passe graphismes · aurore2) L'AURORE = LA TOUTE PREMIÈRE IMAGE DE COURSE (l'auto-école, et le niveau 1 de la carrière). Elle tournait encore sur
   le ciel d'avant (jour:0 : bande rose Miami → bleu électrique / magenta / orange qui se battaient), avec une lumière orangée et le split or de la couche DA qui
   changeaient le béton en SABLE : la caisse orange s'y perdait. → le ciel d'altitude (jour:1) en aube SOBRE : zénith bleu pâle, horizon crème à peine pêche,
   soleil doux et blanc chaud, rebond du sol neutre ; split or coupé (daHi 0, comme le matin : les blancs sortaient sable) ; béton gris (rtK). Couleurs du ciel
   et brume en LINÉAIRE. */
Object.assign(BIOMES.aurore,{jour:1,daHi:0,sh:[-.006,.008,.03],hi:[0,0,0],sat:1.06,expo:.97,rtK:.85,jZen:[.20,.37,.67],jMid:[.51,.60,.75],jHor:[.90,.83,.72],jSol:[.38,.29,.18],sunTint:[1,.88,.68],sunHalo:.85,fog:[.90,.86,.82],fogN:900,fogF:5200,fogCj:[.95,.89,.80],fogIn:[.95,.95,.96],hemiS:[.80,.85,.92],hemiG:[.62,.62,.66],hemiI:.66,sunC:[1,.90,.76],sunI:1.5,fillC:[.56,.68,.90],fillI:.26,kickC:[.9,.8,.7],kickI:.1,volSun:[2.1,2.0,1.9],volSky:[.78,.82,.92],volGnd:[.7,.72,.8],volAmb:.85,vigK:.24,vigC:[.05,.07,.1],env:[[0,'#6E95C8'],[.3,'#A9BFDA'],[.48,'#F2DFC8'],[.58,'#FBEBD6'],[.66,'#B8BEC8'],[1,'#8C94A6']],eS1:[255,232,200,.46],eS2:[170,200,240,.3]});
/* (2026-10-14, LA BIBLE CAR CASH, passe graphismes · nuagesjour) LA MER DE NUAGES DE JOUR SORT DU BLANC (mur des maps : ciel L* 91-95, chroma 1-2, brume #f7f0ea).
   Des COPIES pour la course (`nuagesMatinCC`, `nuagesMidiCC`, branchées sur SF_CARTES plus bas) : le menu et le titre gardent matin/midi au bit près.
   Zénith azur → horizon PÊCHE, brume bleu tendre (plus jamais blanche), ombre des cumulus bleu ciel (ventres colorés, pas gris), mer aux sommets crème
   chaud et aux creux bleus, contre-jour ROSE, saturation effective ~1,38 ; plus la signature de route (bords roses, ligne or). */
{
 BIOMES.nuagesMatinCC=bioMet(BIOMES.matin,{sat:1.14,con:1.22,jZen:[.10,.30,.66],jMid:[.40,.60,.86],fog:[.70,.74,.84],fogIn:[.88,.90,.96],kickC:[1,.38,.66],kickI:.2,nuLav:[.70,.80,.98],nuR:[-.3,.45,.64,1],mzH:[1,.92,.82,.5],mzO:[.50,.62,.86,.5],vigC:[.05,.06,.14]});
 BIOMES.nuagesMidiCC=bioMet(BIOMES.midi,{nm:'MIDI',con:1.24,jZen:[.08,.28,.68],jMid:[.34,.58,.90],fog:[.66,.74,.88],fogIn:[.86,.90,.96],kickC:[1,.38,.68],kickI:.18,nuLav:[.70,.80,.98],nuR:[-.3,.45,.64,1],mzH:[1,.95,.88,.45],mzO:[.50,.62,.88,.5],vigC:[.05,.06,.14]});
}
Object.assign(BIOMES.nuagesPluie,{nuLav:[.54,.46,.60],nuR:[-.1,.55,.52,1],nuK:[.98,1.0,.66,1],nuA:[.96,.92,.93],volSun:[1.1,1.02,1.0]}); // (2026-10-14, passe graphismes · cumnuit) PLUIE : cumulus gris perle → ardoise, plus laiteux. Avant : albédo 1, ombre lavande .64, soleil 1,15-1,32 (blancs lumineux) ; après : albédo ×(.86,.87,.9) et ×.92, ombre ardoise [.40,.46,.56] à .5, clé diffuse .95-1,1 ×.85, lisière .6
Object.assign(BIOMES.tempete,{nuR:[-.05,.5,.5,1],nuK:[1,1.5,.5,1]}); // (2026-10-14, passe graphismes · cumnuit) ORAGE : cumulus ardoise sombre à ventre noir-bleu. Avant : ombre lavande .64 (ventre presque aussi clair que le dessus) ; après : ombre ardoise-encre [.14,.19,.30] à .5, éclair/clé ×1,5 sur les faces éclairées pour garder un sommet lisible, lisière .5
Object.assign(BIOMES.tempete,{jZen:[.02,.018,.08],jMid:[.05,.034,.13],jHor:[.15,.08,.24],fog:[.17,.16,.33],fogIn:[.3,.28,.48],fogCj:[.32,.24,.46],hemiS:[.42,.40,.62],kickC:[.62,.42,1],kickI:.3,volSky:[.24,.2,.44],nuLav:[.25,.23,.42],mzH:[.11,.09,.26,.8],mzO:[.035,.025,.085,.8],nuA:[.64,.62,.78]}); // (2026-10-15, Sacha : « l'orage de la mer de nuages, beaucoup trop gris ») l'ardoise vire à l'ORAGE ÉLECTRIQUE : ciel indigo-violet, brume violette, ventres pourpres, kick violet néon
/* (2026-10-14, Sacha : « trop gris, trop triste ; rajoute des couleurs pures, bleu ou violet, une ambiance CLAIR DE LUNE » — passe graphismes · clairdelune) LA MER DE
   NUAGES DE NUIT = CLAIR DE LUNE (la bible : la nuit = bleu et violet PURS, jamais gris). Ciel bleu profond saturé → indigo → horizon violet (linéaire), étoiles et lune
   plus fortes ; mer de nuages bleu nuit LUMINEUSE ; cumulus aux sommets argent-bleu (la lune) et aux ventres VIOLETS ; lumière : lune bleutée, remplissage violet,
   contre-jour ROSE ; saturation effective ~1,43 ; la signature de route (bords roses, ligne or). */
Object.assign(BIOMES.nuagesNuit,{sat:1.18,con:1.22,jZen:[.010,.022,.13],jMid:[.030,.040,.20],jHor:[.085,.060,.26],stars:1.6,moon:1.6,fog:[.04,.05,.16],fogIn:[.18,.18,.40],fogCj:[.16,.14,.38],
  hemiS:[.35,.40,.80],hemiG:[.14,.10,.30],hemiI:.58,sunC:[.75,.82,1.0],fillC:[.48,.36,.98],fillI:.32,kickC:[1,.38,.66],kickI:.22,
  volSun:[.75,.85,1.35],volSky:[.26,.22,.58],volGnd:[.12,.08,.26],nuLav:[.34,.24,.66],nuR:[-.1,.5,.58,1],nuK:[1,2.2,.8,1],nuA:[.58,.64,.88],
  mzH:[.11,.17,.44,.85],mzO:[.035,.04,.17,.85],vigC:[.02,.02,.08],vigK:.32});
window.dbgMer=function(){return {h:skyU.uMzH.value.toArray(),o:skyU.uMzO.value.toArray(),alb:CLOUD_MAT.color.toArray().map(x=>+x.toFixed(3)),bio:BIO.name};}; // (banc mer-nuit) les uniformes de la mer
// (fin MER DE NUAGES)
//
//
/* (2026-10-14, passe graphismes · etal-ville2) LES FINITIONS DE LA VILLE : les valeurs finales des ambiances de la ville. Notes : $G/notes/etal-ville2.md */
// ---- ÉTALONNAGE · LA VILLE (nuitNoire · pluie · villeOrage) ----
Object.assign(BIOMES.pluie,{sat:1.38,con:1.3,expo:.72,city:1.5,fog:[.20,.12,.28],fogN:320,fogF:2600,hemiS:[.42,.48,.64],hemiG:[.06,.07,.10],hemiI:.44,sunC:[.62,.70,.95],sunI:.72,fillC:[.25,.80,.95],fillI:.34,kickC:[1,.25,.70],kickI:.30,volSun:[.95,1,1.25],volSky:[.20,.24,.34],volGnd:[.05,.06,.09],bloomS:.55,bloomT:.88,rimK:1,vigK:.8,vigC:[.149,.047,.212],wb:[1.02,.985,1.03],sh:[.004,-.008,.062],hi:[.052,.008,-.014],eS1:[255,90,200,.45],env:[[0,'#10141e'],[.3,'#1c2434'],[.48,'#3a4a5e'],[.58,'#6a3a6a'],[.66,'#1a2030'],[1,'#080a12']]}); // (villerose) LA VILLE AU NÉON ROSE : l'ambiance d'AVANT la passe graphismes (fill cyan, kick magenta, brume violette, guirlande 1,5), cette map seule — con 1,23 → 1,3 et vigK .52 → .8 compensent la couche DA commune (con 1,14 → 1,06, vignette ×.6)
{const R9=JSON.parse(JSON.stringify(BIOMES.pluie)); // (villerose, Sacha 20 h 50 : « la ville doit être en ROSE la nuit ») LA NUIT ET L'ORAGE PRENNENT LE ROSE DE LA VILLE AU NÉON (l'ambiance pluie rendue plus haut) — leur ancien rendu à elles était noir ou ardoise, pas rose
 Object.assign(BIOMES.nuitNoire,R9,{nm:'MINUIT',stars:1.5,moon:.6,expo:.8,fogN:260}); // minuit : le néon rose + les étoiles et la lune, un cran plus lumineux (la route était à L* 5)
 Object.assign(BIOMES.villeOrage,R9,{nm:'VILLE · ORAGE',expo:.68,sunI:.6,hemiI:.38,kickI:.36,city:1.3,fogN:220,fogF:2200});} // l'orage : le néon rose sous un ciel plus bas et plus sombre (les éclairs restent ceux de l'orage)
// (fin LA VILLE)
//
//
// ---- ÉTALONNAGE · PICS DE JADE (jadeMatin · jadeMidi · jade · jadeNuit · jadePluie · jadeOrage) ----
Object.assign(BIOMES.jadeMatin,{rtK:.6,expo:.95,wb:[1,1,1],sh:[0,.012,.03],hi:[.014,.012,-.006],hemiS:[.84,.92,.94],hemiG:[.5,.58,.56],fillC:[.56,.74,.8],volSky:[.76,.86,.9],volGnd:[.46,.5,.5],vigC:[.04,.05,.06],jdM:[.72,.82,.72],jdR:[.3,.38,.36],jdB:[.82,.88,.82],jdS:[1,.9,.66],env:[[0,'#6aa6c0'],[.3,'#a8d0d0'],[.48,'#e2ecdc'],[.58,'#fff0cc'],[.66,'#98aca8'],[1,'#44564f']]}); // (2026-10-14, passe graphismes) matin céladon : azur-jade → pêche clair, brume blanc de brume, ombres bleu-vert, vignette neutre (plus de violet), béton non avalé par un ciel crème
Object.assign(BIOMES.jadeMidi,{rtK:.6,expo:1,wb:[1,1,1],sh:[0,.012,.03],hi:[.01,.012,-.004],hemiS:[.82,.92,.98],hemiG:[.46,.56,.52],fillC:[.5,.72,.8],volSky:[.78,.86,.94],volGnd:[.5,.54,.56],vigC:[.04,.05,.06],jdM:[.66,.82,.78],jdR:[.28,.4,.38],jdB:[.82,.9,.86],jdS:[1,.97,.9],env:[[0,'#4a8cc0'],[.3,'#90c4d4'],[.48,'#e2f0ee'],[.58,'#ffffff'],[.66,'#a4b8b8'],[1,'#506670']]}); // (2026-10-14, passe graphismes) midi céladon : plus de cobalt, ciel azur-jade → blanc de brume, ombres bleu-vert, vignette neutre
Object.assign(BIOMES.jade,{sat:1.2,vigC:[.06,.045,.06]}); // (2026-10-14, passe graphismes) soir de Léo : on lui rend sa saturation d'avant la couche commune (1,08 × 1,11 → produit 1,30), vignette violette → ombre prune neutre ; rien d'autre
Object.assign(BIOMES.jade,{rtK:.72}); // (2026-10-14, passe graphismes · oeil-neuf) JADE SOIR : la route la plus claire et la plus beige du jeu (L* ~62 contre ~45 aux autres soirs) → béton gris mat comme ailleurs (rtK 1 → .72)
Object.assign(BIOMES.jadeNuit,{sat:1.06,sunTint:[.7,.82,.95],sunC:[.6,.76,.92],sunI:.5,hemiI:.58,hemiS:[.16,.28,.34],hemiG:[.04,.08,.09],fillC:[.24,.42,.5],kickC:[.4,.6,.7],volSun:[.8,1,1.1],volSky:[.1,.15,.19],volGnd:[.04,.06,.07],sh:[0,.012,.024],vigC:[.012,.02,.03],env:[[0,'#030a0e'],[.3,'#08181f'],[.48,'#1b3440'],[.58,'#35566a'],[.66,'#0d1a22'],[1,'#04080b']],eS1:[170,205,225,.4],eS2:[80,120,140,.3]}); // (2026-10-14, passe graphismes) nuit bleu-vert sombre sans violet : lune argent-bleuté, ciel et brume du même bleu-vert, coton et ouate moins clairs (hemi/lune/vol), vignette neutre
Object.assign(BIOMES.jadePluie,{sat:.95,wb:[1,1,1],sh:[0,.01,.022],sunC:[.84,.88,.88],hemiS:[.62,.7,.68],hemiG:[.28,.34,.32],fillC:[.5,.62,.6],kickC:[.58,.66,.66],vigC:[.04,.05,.05],fog:[.5,.56,.53],fogCj:[.6,.66,.63],fogIn:[.64,.7,.67],volSky:[.5,.56,.56],jdZ:[.3,.38,.38],jdL:[.4,.48,.47],jdM:[.5,.57,.55],jdH:[.6,.66,.62],jdR:[.26,.32,.31],jdB:[.52,.58,.55],env:[[0,'#3a4a4a'],[.3,'#5c6c68'],[.48,'#8c9a94'],[.58,'#9eaaa4'],[.66,'#5a6862'],[1,'#2e3836']],eS1:[200,216,222,.3],eS2:[150,175,175,.25]}); // (2026-10-14, passe graphismes) pluie gris-vert perle : ciel, brume et lumières du même gris à peine vert (plus de lavande), vignette neutre
Object.assign(BIOMES.jadeOrage,{sat:1.02,wb:[1,1,1],sh:[0,.01,.02],sunC:[.58,.68,.72],hemiS:[.36,.42,.46],hemiG:[.08,.1,.11],fillC:[.28,.4,.44],kickC:[.38,.52,.58],kickI:.18,volSun:[.9,1,1.04],volSky:[.26,.32,.34],volGnd:[.07,.09,.1],vigC:[.015,.02,.025],jdS:[.2,.24,.28],env:[[0,'#1c2628'],[.3,'#2e3c40'],[.48,'#56686c'],[.58,'#6c7e82'],[.66,'#2c383a'],[1,'#141a1c']],eS1:[190,210,215,.3],eS2:[110,140,150,.25]}); // (2026-10-14, passe graphismes) orage ardoise verdie : plus d'indigo ni de kick violet, ciel/brume/lumières gris-vert sombres, vignette neutre
/* (2026-10-14, passe graphismes · A4 jade-nuit) L'ESTAMPE DE NUIT — les pics en silhouette d'encre sur un horizon encre-vert PLUS CLAIR, la brume qui
   sépare les plans. Les cibles de la charte (#0D1A1E zénith, #1C3036 horizon) ne se posent PAS en « linéaire » : la chaîne (ACES, contraste pivot .5,
   saturation du grade) écrase tout ce qui sort du shader sous ~.09 en noir pur — le ciel de nuit d'avant tombait donc à 0 et les pics noirs ne se
   détachaient de rien. Valeurs inversées sur la vraie chaîne (banc/jade-nuit/modele.cjs + inverse.cjs) : il faut ~.10-.16 pour sortir #0D1A1E → #1C3036.
   `fog` = le même vert que l'horizon : les pics lointains s'y fondent (plans pâles), les proches restent noirs. (nuit ET orage ET teinte du coton de nuit, voir cotonJade). */
{
Object.assign(BIOMES.jadeNuit,{fog:[.13,.155,.16],fogCj:[.17,.21,.22],fogIn:[.15,.18,.19],jdZ:[.100,.113,.116],jdL:[.108,.126,.131],jdM:[.118,.140,.146],jdH:[.130,.155,.160],jdR:[.09,.10,.10],jdB:[.15,.19,.20],jdS:[.55,.78,.74],jdK:[.9,0,.32,1]}); // (vu à l'image : jdK.y .12 posait des bandes de kasumi DORÉES — sable — sur l'horizon vert : éteintes) // nuit : ciel encre-vert (zénith #0D1A1E → horizon #1C3036), brume bleu-vert près de l'eau (jdB), lune et trait d'argent sur le fleuve (jdS, jdK.z)
Object.assign(BIOMES.jadeOrage,{fog:[.23,.265,.275],fogCj:[.26,.30,.31],fogIn:[.28,.32,.33],jdZ:[.125,.14,.141],jdL:[.145,.165,.170],jdM:[.173,.200,.207],jdH:[.23,.27,.28],jdR:[.12,.14,.14],jdB:[.25,.29,.30],jdK:[0,0,.62,0]}); // orage : ardoise verdie, horizon plus clair que le zénith (#1C282B → #4D6468) pour que les pics s'y découpent
}
/* (2026-10-14, LA BIBLE CAR CASH, passe graphismes · jade2) LES PICS DE JADE PARLENT LA LANGUE DES AUTRES MAPS — la construction et le SOIR de Léo ne bougent pas.
   Matin et midi : brume teintée (elle était quasi blanche, #eff3ec / #eaf2f0), ciel du jade plus azur avec un horizon PÊCHE, contre-jour ROSE, matin un cran plus
   saturé (~1,33) ; toutes les météos : la signature de route (bords roses, ligne or). */
{
 Object.assign(BIOMES.jadeMatin,{sat:1.1,con:1.18,fog:[.80,.82,.74],fogIn:[.86,.88,.82],jdZ:[.22,.44,.74],jdL:[.46,.64,.80],jdH:[1,.82,.60],kickC:[1,.40,.68],kickI:.16});
 Object.assign(BIOMES.jadeMidi,{con:1.2,fog:[.66,.80,.80],fogIn:[.80,.90,.90],jdZ:[.16,.42,.80],jdL:[.40,.64,.86],jdH:[.96,.88,.72],kickC:[1,.40,.68],kickI:.16});
}
// (fin PICS DE JADE)
/* (2026-10-14, LA BIBLE CAR CASH, passe graphismes · foret2) LA FORÊT NOIRE GARDE SA FORCE (verts profonds, or, brume) ET REJOINT LA FAMILLE : contre-jour ROSE sur
   les caisses, saturation de jour ~1,33 (était 1,21-1,27), brumes de jour un cran plus colorées (or au matin, vert-bleu à midi) ; la signature de route (bords roses,
   ligne or) sur toutes ses météos. FOR_MET (direction de la lumière, brume du fond) n'est pas touché. */
{
 if(BIOMES.foretMatin)Object.assign(BIOMES.foretMatin,{sat:1.1,fog:[.80,.70,.50],kickC:[1,.40,.66],kickI:.16});
 if(BIOMES.foretMidi)Object.assign(BIOMES.foretMidi,{sat:1.1,fog:[.58,.72,.76],kickC:[1,.40,.66],kickI:.16});
 if(BIOMES.foretSoir)Object.assign(BIOMES.foretSoir,{sat:1.12,kickC:[1,.38,.62],kickI:.18});
 for(const k of ['foretNuit','foretPluie','foretOrage'])if(BIOMES[k])Object.assign(BIOMES[k],{kickC:[1,.38,.66],kickI:Math.max(BIOMES[k].kickI||0,.14)});
}
//
//
// ---- ÉTALONNAGE · EN ORBITE (espaceMatin · espace · espaceSoir) ----
Object.assign(BIOMES.espaceMatin,{expo:.72,sat:1.04,con:1.18,sh:[0,.006,.03],daSh:0,hi:[.012,.008,0],daHi:0,sunC:[1,.94,.84],sunTint:[1,.86,.68],vigK:.3,vigC:[.012,.014,.024],env:[[0,'#06070f'],[.3,'#0e1226'],[.48,'#28325a'],[.58,'#8a7c72'],[.66,'#0e1226'],[1,'#030308']],eS1:[255,226,185,.4],eS2:[120,150,235,.26]}); // (2026-10-14, passe graphismes) LEVER derrière la Terre : clé or pâle, Terre bleue en rebond, ombres bleu-nuit neutres (plus de violet ni de vert), sat/con sous les plafonds, vignette neutre
Object.assign(BIOMES.espace,{expo:.69,sat:1.04,con:1.18,sh:[0,.006,.03],daSh:0,hi:[.01,.008,0],daHi:0,sunC:[1,.98,.94],vigK:.3,vigC:[.012,.014,.024],eS1:[215,230,255,.4]}); // (2026-10-14, passe graphismes) MIDI (et PLUIE DE SATELLITES, qui lit la même ambiance) : lumière blanche dure, Terre bleue, ombres bleu-nuit neutres, sat 1,12 / con 1,25 (plafonds du niveau satellites inclus), vignette neutre
Object.assign(BIOMES.espaceSoir,{expo:.7,sat:1.02,con:1.18,sh:[0,.004,.026],daSh:0,hi:[.014,.006,0],daHi:0,sunTint:[1,.55,.36],vigK:.3,vigC:[.014,.012,.022],eS1:[255,170,120,.42]}); // (2026-10-14, passe graphismes) COUCHANT : clé ambrée plus sombre, Terre bleue en ombre, plus de magenta (kick rose, env prune retirés), vignette neutre
Object.assign(BIOMES.espaceSoir,{sunC:[1,.9,.8]}); // (2026-10-14, passe graphismes · hasard-beaute) ESPACE SOIR : béton gris-taupe au lieu de chocolat (clé [1,.82,.66] → [1,.9,.8]) ; vu au vrai tirage
/* (2026-10-14, passe graphismes · orbite2) LE REBOND VIENT DE LA PLANÈTE. Le dessous de l'hémisphère (hemiG), le remplissage (fillC), la bande .58 du reflet
   (env) et le 2e liseré (eS2) restaient BLEU TERRE sur les quatre couples, même sous Mars, Jupiter et Saturne : la caisse et la route recevaient la lumière
   d'une planète qui n'est pas là. → Terre bleu-gris, Mars rouille sombre, Jupiter ambre, Saturne or pâle. Et la route était un gris uniforme (2 à 5 L* entre
   le côté soleil et le côté ombre) : clé plus forte, ciel et remplissage plus bas, pour un vrai modelé. */
{
 Object.assign(BIOMES.espaceMatin,{sunI:2.1,hemiI:.4,fillI:.3,hemiG:[.22,.3,.46],fillC:[.36,.5,.8]}); // TERRE : bleu-gris (un cran moins saturé)
 Object.assign(BIOMES.espace,{sunI:2.3,hemiI:.4,fillI:.3,hemiG:[.34,.19,.12],fillC:[.64,.4,.28],env:[[0,'#05060e'],[.3,'#0b1024'],[.48,'#2a2236'],[.58,'#7a4a38'],[.66,'#0b1024'],[1,'#020208']],eS2:[215,150,120,.24]}); // MARS : rouille sombre
 Object.assign(BIOMES.espaceSoir,{sunI:1.8,hemiI:.4,fillI:.3,hemiG:[.36,.27,.16],fillC:[.6,.48,.34],env:[[0,'#07060c'],[.3,'#140f1e'],[.48,'#3a3040'],[.58,'#8a5a44'],[.66,'#140f1e'],[1,'#040306']],eS2:[210,170,130,.24]}); // JUPITER : ambre
}
/* (2026-10-14, LA BIBLE CAR CASH, passe graphismes · orbite3) L'ORBITE REJOINT LA FAMILLE : exposition remontée (~0,73 → ~0,84 effective, les autres maps sont
   à ~1) pour que la caisse et la route sortent du noir, contre-jour ROSE, et la signature de route (bords roses, ligne or) sur le vide. */
for(const k of ['espaceMatin','espace','espaceSoir'])if(BIOMES[k])Object.assign(BIOMES[k],{expo:+(BIOMES[k].expo*1.15).toFixed(3),kickC:[1,.38,.66],kickI:.18,rtK:.72}); /* rtK .72 : A/B au même instant, le béton de l'orbite était à L* 52-72 (cible 32-45) */
for(const k of ['espaceMatin','espace','espaceSoir'])if(BIOMES[k])BIOMES[k].stars=.8; // (2026-10-15) LES NÉBULEUSES : les étoiles se rallument (elles étaient à 0, « noir complet »)
Object.assign(BIOMES.bullrun,{expo:.88,con:1.18,sunI:1.2,hemiI:.62,jZen:[.2,.42,.82],jMid:[.5,.7,.9],jHor:[.98,.92,.76],jSol:[1,.7,.3],fog:[.9,.88,.8],fogCj:[1,.88,.64],fogIn:[1,.96,.9],hemiS:[.84,.9,1],fillC:[.52,.74,.92],vigK:.2,vigC:[.05,.06,.08],env:[[0,'#3f86d8'],[.3,'#7ab6ea'],[.48,'#f2ecd8'],[.58,'#ffe6a8'],[.66,'#c9b890'],[1,'#8a7e66']]}); // (2026-10-14, passe graphismes) CRYPTOCITY : jour clair TENU — ciel sans cobalt (azur → horizon or pâle), con 1,24 → 1,18 (produit 1,26), rebond vert retiré (le vert de hausse reste aux tours), vignette neutre, or du ₿ intact
/* (2026-10-15, Sacha) CRYPTO CITY — LES QUATRE TEMPS DU BULL RUN : le MIDI est le bull run de Léo (bullrun, ci-dessus) ; le MATIN, une aube rose
   et or sur les tours de verre ; le SOIR, l'heure où tout l'or de la ville s'allume ; la NUIT, la ville qui ne dort pas (bureaux allumés :
   uNuit9 dans CRYPTO_VERRE, feux d'artifice, la lune ₿). Jamais de pluie ni d'orage : c'est l'apogée. Que des uniforms. */
BIOMES.cryptoMatin=bioMet(BIOMES.bullrun,{nm:'CRYPTO CITY · MATIN',jZen:[.16,.30,.64],jMid:[.54,.62,.88],jHor:[1,.84,.72],jSol:[1,.64,.40],sunTint:[1,.86,.68],sunC:[1,.86,.68],sunI:1.05,
  fog:[.96,.86,.80],fogCj:[1,.80,.64],fogIn:[1,.92,.88],hemiS:[.88,.86,1],fillC:[.64,.66,.94],expo:.9,
  env:[[0,'#3a5aa8'],[.3,'#8a9ad8'],[.48,'#ffe2d0'],[.58,'#ffd2a4'],[.66,'#c2aa94'],[1,'#7a6a5c']],eS1:[255,226,196,.5],eS2:[170,180,240,.3]});
BIOMES.cryptoSoir=bioMet(BIOMES.nuagesSoir,{nm:'CRYPTO CITY · SOIR',moon:0,fog:[.98,.74,.50],fogN:700,fogF:4200,fogCj:[1,.72,.40],sunC:[1,.76,.42],sunI:1.6,
  hemiG:[.62,.46,.30],sat:1.22,env:[[0,'#24346e'],[.3,'#8a6aa0'],[.48,'#ffb060'],[.58,'#ffd27a'],[.66,'#b88a70'],[1,'#6a5a60']],eS1:[255,206,130,.55]});
BIOMES.cryptoNuit=bioMet(BIOMES.nuagesNuit,{nm:'CRYPTO CITY · NUIT',moon:0,stars:1,jZen:[.008,.014,.05],jMid:[.03,.05,.13],jHor:[.14,.13,.22],
  fog:[.08,.08,.16],fogN:620,fogCj:[.42,.36,.50],hemiG:[.10,.08,.12],kickC:[1,.78,.36],kickI:.16,
  env:[[0,'#04060f'],[.3,'#0c1430'],[.48,'#2a2a52'],[.58,'#6a5a6e'],[.66,'#141a30'],[1,'#05070f']],eS1:[255,210,140,.4],eS2:[90,230,170,.3]});
/* (2026-10-17, Léo) LA VILLE VITRÉE — LES QUATRE HEURES : le jour d'altitude, un ciel BLEU (le verre le renvoie), la brume claire où se noient les
   pieds des tours ; le MATIN : soleil bas, horizon doré ; le COUCHER : le ciel orange et rose que les tours renvoient ; la NUIT : bleu profond,
   les bureaux allumés (uNuit9). Que des uniforms. Les nuages de chaque heure sont dans VIT_MET. */
BIOMES.vitreMidi=bioMet(BIOMES.bullrun,{nm:'VILLE VITREE · MIDI',jZen:[.08,.30,.78],jMid:[.36,.62,.94],jHor:[.84,.91,.99],jSol:[.62,.74,.88],sunTint:[1,.97,.92],sunC:[1,.97,.92],sunI:1.45,
  fog:[.80,.87,.96],fogCj:[.96,.95,.92],fogIn:[.92,.95,1],hemiS:[.78,.88,1],hemiG:[.40,.45,.54],hemiI:.66,fillC:[.58,.74,.98],fillI:.2,
  expo:.85,sat:1.1,con:1.16,hi:[0,.004,.012],vigC:[.03,.05,.09],
  env:[[0,'#2a6fd8'],[.3,'#6aa8ec'],[.48,'#e4eefa'],[.58,'#d8e6f6'],[.66,'#8a98ac'],[1,'#4a5668']],eS1:[255,250,240,.55],eS2:[150,200,255,.3]});
BIOMES.vitreMatin=bioMet(BIOMES.cryptoMatin,{nm:'VILLE VITREE · MATIN',jZen:[.12,.26,.62],jMid:[.50,.60,.88],jHor:[1,.82,.62],jSol:[1,.66,.44],sunTint:[1,.84,.62],sunC:[1,.82,.58],sunI:1.25,
  fog:[.94,.86,.78],fogCj:[1,.80,.58],fogIn:[1,.92,.86],hemiS:[.86,.84,1],hemiG:[.46,.40,.40],fillC:[.62,.66,.94],
  env:[[0,'#34509e'],[.3,'#8496d6'],[.48,'#ffdcc0'],[.58,'#ffc88e'],[.66,'#a8907c'],[1,'#5e5250']],eS1:[255,214,160,.55],eS2:[160,176,240,.3]});
BIOMES.vitreSoir=bioMet(BIOMES.cryptoSoir,{nm:'VILLE VITREE · COUCHER',jZen:[.26,.20,.50],jMid:[.94,.52,.46],jHor:[1,.64,.34],jSol:[1,.48,.22],sunTint:[1,.70,.42],sunC:[1,.64,.36],
  fog:[.96,.70,.56],fogCj:[1,.66,.40],fogIn:[1,.82,.72],hemiS:[.84,.64,.80],hemiG:[.56,.38,.38],sat:.98,
  env:[[0,'#2a2a6e'],[.3,'#9a5a96'],[.48,'#ffa060'],[.58,'#ffc070'],[.66,'#a8706a'],[1,'#5a4458']],eS1:[255,190,120,.6],eS2:[200,130,220,.3]});
BIOMES.vitreNuit=bioMet(BIOMES.cryptoNuit,{nm:'VILLE VITREE · NUIT',stars:.7,jZen:[.005,.008,.03],jMid:[.018,.03,.075],jHor:[.075,.085,.15],jSol:[.03,.035,.06],
  fog:[.04,.05,.09],fogCj:[.20,.22,.32],fogIn:[.2,.22,.3],hemiS:[.24,.28,.42],hemiG:[.06,.06,.09],hemiI:.4,sunC:[.55,.62,.82],sunI:.45,
  fillC:[.30,.34,.50],sat:.92,volSky:[.10,.12,.24],volGnd:[.03,.035,.06],
  env:[[0,'#03050e'],[.3,'#0a1430'],[.48,'#24305a'],[.58,'#4a5a7e'],[.66,'#121a32'],[1,'#04060e']],eS1:[255,226,180,.45],eS2:[120,170,255,.3]});
BIOMES.vitrePluie=bioMet(BIOMES.vitreMidi,{nm:'VILLE VITREE · PLUIE',jZen:[.30,.34,.42],jMid:[.42,.47,.55],jHor:[.60,.64,.70],jSol:[.30,.33,.38],sunTint:[.8,.84,.9],sunHalo:.1,sunC:[.78,.82,.90],sunI:.55,
  fog:[.50,.55,.62],fogN:420,fogF:2900,fogCj:[.62,.66,.72],fogIn:[.6,.64,.7],hemiS:[.62,.68,.78],hemiG:[.30,.32,.36],hemiI:.7,fillC:[.5,.56,.66],fillI:.18,expo:.84,sat:.92,con:1.1,
  env:[[0,'#3a4250'],[.3,'#5a6474'],[.48,'#8a94a2'],[.58,'#7a8494'],[.66,'#4a525e'],[1,'#2a3038']],eS1:[200,210,225,.4],eS2:[150,165,190,.3]});
for(const k9 of ['vitreMatin','vitreMidi','vitreSoir','vitreNuit'])Object.assign(BIOMES[k9],{fogN:Math.max(BIOMES[k9].fogN||0,900),fogF:Math.max(BIOMES[k9].fogF||0,4600)});
if(!VIT_PLAFOND){for(const k9 of ['vitreMatin','vitreMidi','vitreSoir','vitreNuit','vitrePluie'])Object.assign(BIOMES[k9],{kickC:[.80,.88,1],kickI:.12});BIOMES.vitreNuit.moon=1;} // (CLEAN CITY) le contre-jour en blanc froid (le rose est la signature des autres maps) ; la lune revient // (v2) la brume recule : la ville d'en haut se voit
// (fin EN ORBITE)
//
//
// ---- ÉTALONNAGE · LA COUCHE COMMUNE (retouches de DA / BIO_ETAL0 : voir aussi `const DA=` plus bas) ----
// (2026-10-14, passe graphismes · agent etal-commun) Ce qui a changé, pour TOUTES les ambiances d'un coup — des valeurs, rien d'autre :
//  · `const DA=` (plus bas)  : sat 1.2 → 1.08 · con 1.14 → 1.06 · sh/hi (split sarcelle/or) ÷ 2 · vigK 1 → .6 (toutes les vignettes à 60 %) · expo 1.06 gardée.
//  · `const BIO_ETAL0=` (plus haut, les DÉFAUTS versés dans toute ambiance qui n'a pas la clé) : la dominante magenta/violette par défaut est retirée —
//    wb neutre, ombres bleu-nuit (plus de −vert), lumières à peine chaudes, con 1.23 → 1.16, vignette ENCRE BLEU-NUIT [.03,.045,.09] au lieu du violet,
//    halo plus sélectif (bloomS .54 → .46, bloomT .92 → .95 : seul ce qui émet s'allume).
//    Héritent du défaut (wb/sh/hi/con) : tempete, nuitNoire, villeOrage, pluie + les heures de l'ancien parc (aube, lever, golden, couchant, soir, nuit, orage, aurore) ;
//    (bloomS/bloomT) : matin, midi, aprem, nuagesSoir/Nuit/Pluie, bullrun, les 7 titres ; (vigK/vigC) : pluie (la VILLE sous la pluie) et l'ancien parc.
//    Les ambiances qui ont LEUR vigC/con/wb (jade*, espace*, nuages*, ville*…) ne bougent que par DA : leur réglage appartient aux équipes par map.
//  · Les bords d'écran des BONUS (#pwrFx) : dosés à 40 % par `PWR_BORD_K` (grep), à côté de PWR_DEFS.
// (fin COUCHE COMMUNE)
/* (2026-10-15, Sacha : « toutes les maps sont trop ternes et grises — un style plus POP, des couleurs plus FRANCHES ») LA COUCHE POP, après toutes les
   retouches par map : chaque ambiance prend ×1,12 de saturation (plafond 1,45) et un cran de contraste ; avec DA.sat 1,08 → 1,17 la couleur monte d'~20 %.
   Plus, là où Sacha l'a montré : le SOIR des nuages (ciel violet → rose → orange franc, sommets pêche vif, ombres roses), l'ORAGE (voir plus haut), la
   métropole de jour (tours rouges et jaunes). */
{for(const k in BIOMES){const b=BIOMES[k];if(!b||typeof b!=='object')continue;b.sat=Math.min(1.5,(b.sat==null?1:b.sat)*1.18);if(typeof b.con==='number')b.con=Math.min(1.34,b.con+.04);}
 Object.assign(BIOMES.nuagesSoir,{jZen:[.16,.12,.50],jMid:[.66,.34,.60],jHor:[1,.54,.28],jSol:[1,.48,.2],fog:[.98,.70,.62],fogCj:[1,.66,.42],mzH:[1,.62,.40,.85],mzO:[.24,.10,.26,.8],nuLav:[.95,.50,.86],volSky:[.62,.42,.78],volSun:[2.8,1.6,1.75],hemiS:[.78,.62,.92],hemiG:[.62,.40,.46]});
 /* (Sacha : « la pluie et les nuages ternissent le jeu : plus de BLEU ») LES TEMPS GRIS VIRENT AU BLEU : ciel, brume, ombres et lumière d'ambiance glissent
    vers un bleu franc (r ×.78, g ×.94, b ×1,22), +8 % de saturation et un cran d'exposition. La ville rose (pluie/orage) garde son néon. */
 for(const k of ['nuagesPluie','jadePluie','jadeOrage','foretPluie','foretOrage','canyonOrage','tempete'])if(BIOMES[k]){const b=BIOMES[k];
  for(const f of ['jZen','jMid','jHor','fog','fogIn','fogCj','hemiS','hemiG','fillC','sunC','volSun','volSky','volGnd','nuLav','mzH','mzO'])if(Array.isArray(b[f])&&b[f].length>=3){ // la clarté reste, la TEINTE devient un bleu franc (à 62 %)
   const v=b[f]=b[f].slice(),L=.3*v[0]+.59*v[1]+.11*v[2];v[0]+=(L*.62-v[0])*.62;v[1]+=(L*.92-v[1])*.62;v[2]=Math.min(2.4,v[2]+(L*1.55-v[2])*.62);}
  b.sat=Math.min(1.5,b.sat*1.08);if(typeof b.expo==='number')b.expo*=1.06;}
 Object.assign(BIOMES.tempete,{expo:(BIOMES.tempete.expo||1)*1.1,hemiI:.62,sunI:.6,volSun:[.8,.62,1.25],sunC:[.62,.56,.95],fillC:[.36,.42,.95]});}
const BIO={cur:JSON.parse(JSON.stringify(BIOMES.golden)),from:null,to:BIOMES.golden,k:1,dur:4,name:'golden'};
function bioLerp(a,b,e,out){ // mixe deux biomes champ à champ (tableaux = composantes, nombres = scalaires)
  for(const key in b){ const bv=b[key];
    if(typeof bv==='number')out[key]=a[key]+(bv-a[key])*e;
    else if(Array.isArray(bv)&&typeof bv[0]==='number'){const ov=out[key];for(let i=0;i<bv.length;i++)ov[i]=a[key][i]+(bv[i]-a[key][i])*e;}
  }
}
/* LA COUCHE « DA » (2026-09-30, Sacha : « retravaille les graphismes, la DA et l'étalonnage du jeu » — session INTERFACE, avec l'accord
   de GRAPHISME) : UN seul endroit qui règle l'étalonnage de TOUS les niveaux par-dessus leurs ambiances (BIOMES), sans toucher aux
   biomes eux-mêmes. Que des uniforms : 0 programme compilé. `DA.on=0` rend l'image d'avant au bit près (A/B au banc : dbgDA). */
/* Réglage retenu au banc (etal.js, 5 niveaux × 4 variantes, deux tours) : l'image sortait noyée dans UN violet (ciel, route, nuages et
   caisse), la caisse orange lue saumon pâle. → la chroma gardée dans les hautes lumières (vivid 1), le voile magenta retiré (wbN 1),
   un vrai split TEAL / ORANGE (ombres bleu-vert, lumières or-orange), saturation ×1,2, contraste ×1,14, exposition ×1,06. */
/* (2026-10-14, passe graphismes · étalonnage commun) LA COUCHE TENUE. Avant : sat 1.2 · con 1.14 · sh [-.026,.045,-.006] · hi [.02,.038,-.042] · vigK 1
   (expo 1.06 gardée). Multipliée par des ambiances déjà poussées elle donnait jusqu'à sat 1,63 / con 1,48 : cobalt criard, orange « Cheetos »,
   noirs bouchés, coins recolorés (Sacha : « trop IA »). → sat 1.08, con 1.06, split sarcelle/or divisé par 2, vignette de TOUTES les ambiances
   à 60 %. Choisi à l'œil sur 5 ambiances (shots/etal-commun/planche-essais-DA.png). Le reste se règle PAR AMBIANCE (plafonds de la charte). */
const DA={on:1,expo:1.06,sat:1.17,con:1.06,vivid:1,wbN:1,sh:[-.013,.022,-.003],hi:[.01,.019,-.021],vigK:.6};
function daPose(U,c){
  // par ambiance (champs lerpés comme les autres) : daCon / daExpo / daWbN — les niveaux SOMBRES (tempête, minuit) prennent moins de
  // contraste, plus d'exposition et gardent la moitié de leur voile violet (MESURÉ : le contraste de la couche DA les noyait dans le noir)
  const o=DA.on,kc=o?(c.daCon==null?1:c.daCon):1;U.uSat.value=c.sat*(o?DA.sat:1);U.uContrast.value=c.con*(o?1+(DA.con-1)*kc:1);U.uVivid.value=o?DA.vivid:POST_VIVID;
  const w=o?DA.wbN*(c.daWbN==null?1:c.daWbN):0;U.uWB.value.set(c.wb[0]+(1-c.wb[0])*w,c.wb[1]+(1-c.wb[1])*w,c.wb[2]+(1-c.wb[2])*w);
  const ks=o?(c.daSh==null?1:c.daSh):0; // (DA) la teinte TEAL des ombres, dosée par ambiance : elle colore aussi le NOIR — l'orbite (vide) et les nuits la prennent à peine
  U.uSh.value.set(c.sh[0]+DA.sh[0]*ks,c.sh[1]+DA.sh[1]*ks,c.sh[2]+DA.sh[2]*ks);
  const kh=o?(isFinite(c.daHi)?c.daHi:1):0; /* (2026-10-01) le split OR des hautes lumières, dosé par ambiance : au JOUR D'ALTITUDE il jaunissait tout ce qui est clair — nuages, peinture de route — en crème-sable (MESURÉ par GAMEPLAY : moyenne des clairs (221,219,195) → (206,202,200) sans la couche DA) */
  U.uHi.value.set(c.hi[0]+DA.hi[0]*kh,c.hi[1]+DA.hi[1]*kh,c.hi[2]+DA.hi[2]*kh);
  U.uVigK.value=c.vigK*(o?DA.vigK:1);
}
window.dbgDA=function(o){if(o)for(const k in o){if(Array.isArray(o[k]))DA[k]=o[k].slice();else DA[k]=o[k];}bioApply(BIO.cur);if(acesPass)acesPass.uniforms.uExposure.value=POST_EXPO;if(o&&o.fige){if(started&&!gameOver&&!paused)togglePause();}if(o&&o.degele&&paused)togglePause();if(paused&&POST_ON&&composer)composer.render();return JSON.parse(JSON.stringify(DA));}; // banc : essayer un étalonnage sur l'image figée
function bioApply(c){ // pousse l'ambiance mélangée dans TOUS les organes (uniforms/couleurs only)
  skyU.uSkyMul.value.fromArray(c.skyMul);skyU.uSkyLift.value.fromArray(c.skyLift);skyU.uSunTint.value.fromArray(c.sunTint);
  skyU.uSunHalo.value=c.sunHalo;skyU.uCity.value=c.city;skyU.uStars.value=c.stars;skyU.uMoon.value=c.moon;
  if(c.jdZ){if(c.jdM){skyU.uJdM.value.fromArray(c.jdM);skyU.uJdL.value.fromArray(c.jdL);}skyU.uJdZ.value.fromArray(c.jdZ);skyU.uJdH.value.fromArray(c.jdH);skyU.uJdR.value.fromArray(c.jdR);skyU.uJdB.value.fromArray(c.jdB);skyU.uJdS.value.fromArray(c.jdS);if(c.jdK)skyU.uJdK.value.fromArray(c.jdK);} // (PICS DE JADE) le rouleau peint
  if(c.cyZ){skyU.uCyZ.value.fromArray(c.cyZ);skyU.uCyM.value.fromArray(c.cyM);skyU.uCyH.value.fromArray(c.cyH);skyU.uCyS.value.fromArray(c.cyS);skyU.uCyB.value.fromArray(c.cyB);skyU.uCyC.value.fromArray(c.cyC);skyU.uCyD.value.fromArray(c.cyD);skyU.uCyR.value.fromArray(c.cyR);skyU.uCyK.value.fromArray(c.cyK);skyU.uCyN.value.fromArray(c.cyN);} // (2026-10-14) LE CANYON DES GÉANTS : son ciel
  skyU.uJour.value=c.jour||0;if(c.jZen){skyU.uJZen.value.fromArray(c.jZen);skyU.uJMid.value.fromArray(c.jMid);skyU.uJHor.value.fromArray(c.jHor);skyU.uJSol.value.fromArray(c.jSol);} // (2026-09-30) le jour d'altitude
  FOG_BASE.setRGB(c.fog[0],c.fog[1],c.fog[2]);FOG_N=c.fogN;FOG_F=c.fogF;
  hemi.color.setRGB(c.hemiS[0],c.hemiS[1],c.hemiS[2]);hemi.groundColor.setRGB(c.hemiG[0],c.hemiG[1],c.hemiG[2]);hemi.intensity=c.hemiI;
  sun.color.setRGB(c.sunC[0],c.sunC[1],c.sunC[2]);sun.intensity=c.sunI;
  fill.color.setRGB(c.fillC[0],c.fillC[1],c.fillC[2]);fill.intensity=c.fillI;
  kick.color.setRGB(c.kickC[0],c.kickC[1],c.kickC[2]);kick.intensity=c.kickI;
  // NUAGES : mesh Lambert — ils prennent déjà l'éclairage du biome (hemi/soleil). On teinte en plus
  // leur matière avec la couleur solaire du biome pour qu'ils virent crème le soir et bleus la nuit.
  CLOUD_MAT.color.setRGB(Math.min(1,.55+c.volSun[0]*.16),Math.min(1,.55+c.volSun[1]*.16),Math.min(1,.55+c.volSun[2]*.16));
  {if(c.mzH&&c.mzO&&!(CHUTE&&CHUTE.on)){skyU.uMzH.value.fromArray(c.mzH);skyU.uMzO.value.fromArray(c.mzO);}if(c.nuA)CLOUD_MAT.color.multiply(MN_T9.fromArray(c.nuA));} // (2026-10-14, passe graphismes · mer-nuit) la mer de nuages suit l'heure (hors titre : chuteRender pose ses mzH/mzO et les rend à la sortie) ; nuA éteint la ouate la nuit (l'albédo plancher .55 la gardait éclairée comme de jour) — CLOUD_MAT.color = N8_U.uAlb, tous les nuages
  {const nz=function(a,u,k){const l=Math.max(.01,a[0]*.299+a[1]*.587+a[2]*.114);u.set(1+(a[0]/l-1)*k,1+(a[1]/l-1)*k,1+(a[2]/l-1)*k);}; // (Dragons) la teinte seule (luminance 1), adoucie vers le blanc de k
   nz(c.volSun,GFX_U.uNuSun.value,1.25);nz(c.volSky,GFX_U.uNuSky.value,.62);nz(c.volGnd,GFX_U.uNuGnd.value,.85);}
  if(c.nuLav){N8_U.uLav.value.fromArray(c.nuLav);N8_U.uR.value.fromArray(c.nuR);N8_U.uK.value.fromArray(c.nuK);} // (2026-10-14, passe graphismes · nuages-jour) la matière des cumulus de la course (le titre a ses propres uK/uR) ; valeurs par défaut = l'ancien réglage
  POST_EXPO=c.expo*(DA.on?DA.expo*(c.daExpo==null?1:c.daExpo):1); // (DA) l'exposition du niveau × celle de la couche DA (× la retouche de l'ambiance)
  // (2026-09-26, vague 2) L'ÉTALONNAGE DU NIVEAU (voir BIO_ETAL0) : balance, ombres d'encre, hautes lumières, contraste, vignette
  if(acesPass){const U=acesPass.uniforms;daPose(U,c);U.uVigC.value.fromArray(c.vigC);} // (DA) saturation, balance, ombres, lumières, contraste, vignette : le niveau × la couche DA
  // le BLOOM du niveau : musicTick module la force au beat autour de `musicTick._bloom` — c'est donc la BASE qu'on écrit
  if(bloomPass){musicTick._bloom=c.bloomS*BLOOM_K;bloomPass.threshold=c.bloomT;}
  // LE LISERÉ : du côté de LA source du niveau — le soleil le jour, le néon du kick la nuit (sa couleur ×1,4 : un contre-jour, pas un reflet)
  RIM_DIR.copy(SUN_DIR).lerp(KICK_DIR,c.rimK).normalize();
  RIM_C0.setRGB(1,.851,.627).lerp(RIM_T9.setRGB(c.kickC[0]*1.4,c.kickC[1]*1.4,c.kickC[2]*1.4),c.rimK);
  RIM_U.uRimStr.value=c.rimS;RIM_S0=c.rimS; // (RIM_S0 : la base du niveau — la boucle la relève en vol, voir « la caisse se détache »)
  FOG_CLOUD.setRGB(c.fogIn[0],c.fogIn[1],c.fogIn[2]);FOG_CJ.setRGB(c.fogCj[0],c.fogCj[1],c.fogCj[2]); // le white-out et le contre-jour prennent l'air du niveau
  // le SOLEIL « 1.61 », sa nappe d'horizon et ses rayons sont des SPRITES hors shader : ils suivent le halo du biome
  const nuit9=(1-LVL.espace)*(1-LVL.pluie)*(1-(LVL.jade||0))*(1-(LVL.canyon||0))*(1-(LVL.grotte||0)); /* (2026-10-18) LES PROFONDEURS : sous la terre, pas de soleil « 1.61 » */ /* (2026-10-14) le CANYON peint son soleil lui-même */ // (PICS DE JADE) le soleil est peint dans le rouleau : pas de « 1.61 » // (Paris) la nuit : pas de « 1.61 » // ORBITE, NOIR COMPLET — et sous le plafond de PLUIE de la ville, pas de soleil non plus : même le disque « 1.61 » s'éteint (lvlStep tourne AVANT bioStep : la valeur est fraîche)
  sunSprite.material.opacity=Math.min(1,.15+c.sunHalo*.85)*nuit9;
  horizonGlow.material.opacity=.8*c.sunHalo*nuit9;
  for(const r9 of RAYS)r9.material.opacity=RAY_OPACITY*c.sunHalo*nuit9;
}
// le liseré des caisses : direction MONDE et teinte de repos, posées par bioApply, relues chaque image par la boucle (voir RIM_U)
let RIM_S0=.4; // (2026-09-29) la force du liseré posée par le niveau (bioApply) — la boucle la relève en vol
const RIM_DIR=SUN_DIR.clone(),RIM_C0=new THREE.Color(0xffd9a0),RIM_T9=new THREE.Color(),KICK_DIR=kick.position.clone().normalize();
const BLOOM_K=LOOK_TEL?.44/.54:1; // le téléphone garde son rapport de bloom (.44 contre .54 sur PC) : les forces des biomes sont des bases PC
function bioGo(name,dur){ // lance le voyage vers un biome (reflets carrosserie repeints tout de suite : discret)
  if(!BIOMES[name])name='golden';
  BIO.from=JSON.parse(JSON.stringify(BIO.cur));BIO.to=BIOMES[name];BIO.k=0;BIO.dur=dur||4;BIO.name=name;BIO.dip=0;
  paintEnv(BIO.to.env,BIO.to.eS1,BIO.to.eS2);
}
function bioStep(dt){
  if(BIO.k>=1)return;
  BIO.k=Math.min(1,BIO.k+dt/BIO.dur);
  const e=BIO.k*BIO.k*(3-2*BIO.k); // smoothstep : le ciel bascule sans à-coup
  bioLerp(BIO.from,BIO.to,e,BIO.cur);
  bioApply(BIO.cur);BIO.pas=(BIO.pas|0)+1; // (le compteur de pas : la vitrine du menu sait qu'on a repeint derrière elle)
  /* LE PASSAGE DU PORTAIL (2026-09-26, vague 2) — MESURÉ avant : 4 s de brume LAITEUSE (saturation .30) où la ville surgissait d'un
     coup dans l'air du jour. Le fondu est désormais court (BIO_PORTAIL) et il passe PAR LE SOMBRE : brume et exposition plongent au
     milieu du trajet (sin π·e, nul aux deux bouts) — la membrane de l'ovule, un clin d'œil de caméra. Aucun mélange ne se voit plus :
     on quitte un monde, on cligne, on est dans l'autre. `BIO.dip` n'est posé que par newTrack en course (jamais au menu ni par dbgBio). */
  if(BIO.dip>0){const d9=Math.sin(Math.PI*e)*BIO.dip;FOG_BASE.multiplyScalar(1-.6*d9);POST_EXPO*=1-.3*d9;}
}
const BIO_PORTAIL=1.2; // (2026-09-26, vague 2) la durée du changement de monde au portail (était 4 s)
function bioPortDur(){return PCV.fen?.05:BIO_PORTAIL;} // (2026-10-17) passé PAR LA FENÊTRE du portail de cubes, le monde bascule d'un coup SOUS l'image qu'on traverse (elle se défait ensuite sur la map d'arrivée telle quelle)
window.dbgBio=function(n,d){bioGo(n,d||2);}; // console : dbgBio('nuit') → tester une heure du ciel sans farmer les portails (d = durée du lerp en s)
