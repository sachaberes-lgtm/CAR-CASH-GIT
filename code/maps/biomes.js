// ============================================================================
//  BIOMES — LE CYCLE DU CIEL : 10 ambiances, lerpées ~4 s au portail
//  (uniforms/couleurs UNIQUEMENT — jamais de recompilation shader).
//  Le tour du cadran, dans l'ordre : AUBE (heure bleue) · LEVER · MATIN · MIDI ·
//  APREM · GOLDEN · COUCHANT · SOIR · NUIT, plus l'ORAGE en joker météo.
//  Les 9 « jour » sont tirées au HASARD (jamais deux fois la même de suite) au
//  départ et à chaque portail — au 3e portail de la MÊME partie, la VRAIE NUIT
//  tombe pour de bon (le mode débloqué, phares rois).
//  ⚠ bioLerp parcourt TOUTES les clés numériques : un biome à qui il manque un
//  champ garderait la valeur du précédent en plein fondu. Copier le gabarit entier.
// ============================================================================
let zoneArch='FLOW'; // posé par genCtrl (ADN de piste) — plus utilisé par les biomes, gardé pour debug
const BIOMES={
  // ---- L'HEURE BLEUE : juste avant que le soleil casse l'horizon ----
  // Le ciel est déjà lumineux mais le soleil est encore SOUS la ligne : tout est bleu-indigo, froid,
  // et une seule estafilade magenta traîne à l'horizon. Rien à voir avec la NUIT (noire) : ici ça
  // respire, les étoiles s'éteignent une à une et la ville brûle encore ses néons.
  aube:{ nm:'L\'HEURE BLEUE', skyMul:[.62,.80,1.22],skyLift:[.02,.05,.11],sunTint:[.95,.42,.55],sunHalo:.34,city:.60,stars:.95,moon:1.15,
    fog:[.15,.23,.41],fogN:420,fogF:2700,
    hemiS:[.40,.55,.82],hemiG:[.07,.09,.21],hemiI:.46, sunC:[.86,.56,.64],sunI:.72,
    fillC:[.24,.47,.74],fillI:.30, kickC:[.88,.34,.62],kickI:.17,
    volSun:[1.30,.88,1.05],volSky:[.22,.33,.64],volGnd:[.06,.08,.19],volAmb:.48,
    expo:.73,sat:1.31,
    env:[[0,'#0f1a3e'],[.3,'#1e3260'],[.48,'#4a5a8e'],[.58,'#8e5a86'],[.66,'#2a2a52'],[1,'#0c1028']],eS1:[190,150,220,.40],eS2:[110,180,240,.30]},
  // ---- LEVER DE SOLEIL : la fournaise perce, les ombres restent glacées ----
  // LE contraste le plus photogénique du jeu : lumière corail brûlante d'un côté, remplissage CYAN
  // franc de l'autre. C'est ce grand écart chaud/froid qui fait toute la beauté d'un vrai lever.
  lever:{ nm:'LEVER DE SOLEIL', skyMul:[1.16,.94,1.06],skyLift:[.11,.05,.06],sunTint:[1,.52,.34],sunHalo:1.25,city:.22,stars:.10,moon:.32,
    fog:[.73,.53,.53],fogN:390,fogF:2400,
    hemiS:[.80,.69,.84],hemiG:[.16,.18,.31],hemiI:.60, sunC:[1,.66,.42],sunI:1.46,
    fillC:[.30,.49,.82],fillI:.31, kickC:[1,.48,.38],kickI:.19,
    volSun:[2.30,1.25,.85],volSky:[.42,.45,.73],volGnd:[.16,.13,.23],volAmb:.61,
    expo:.90,sat:1.37,
    env:[[0,'#2e5a9e'],[.3,'#7a7ab0'],[.48,'#f09a72'],[.58,'#ffb870'],[.66,'#6a5a70'],[1,'#2a3050']],eS1:[255,190,140,.52],eS2:[130,190,255,.34]},
  /* (2026-09-27, vague 3) RETOUR AU CIEL D'AVANT pour MATIN · MIDI · APREM (le niveau NUAGES) — Sacha : « j'aime pas le niveau dans les
     nuages, remets une version antérieure ». Le « jour cobalt » de la vague 2 (expo .92-.94, zénith bleu roi, brume cobalt, étalonnage
     ETAL_JOUR, apport de zénith) est retiré : ces trois biomes retrouvent leurs valeurs et l'étalonnage d'origine (BIO_ETAL0). */
  // ---- MATIN CLAIR : l'air lavé, la lumière propre ----
  // Le biome le plus NET du jeu : cyan franc, soleil blanc-doré, zéro rose. Il sert de respiration
  // au milieu de tout ce violet — c'est justement son contraste avec le reste qui le rend beau.
  matin:{ nm:'MATIN CLAIR', skyMul:[1.00,1.26,1.76],skyLift:[.05,.10,.17],city:0,stars:0,moon:.08,
    fillI:.24, kickC:[1,.86,.68],kickI:.08,
    sat:1.20},
  // ---- PLEIN MIDI : le soleil au zénith, la lumière qui cogne ----
  // Le plus LUMINEUX : bleu cobalt profond au-dessus, soleil quasi blanc, ombres courtes et dures.
  // Saturation volontairement plus basse — à cette heure c'est la LUMIÈRE qui claque, pas la teinte.
  midi:{ nm:'PLEIN MIDI', skyMul:[.88,1.20,1.88],skyLift:[.03,.07,.15],city:0,stars:0,moon:0,
    fillI:.18, kickC:[1,.92,.80],kickI:.06,
    volAmb:.92},
  aprem:{ nm:'FIN D\'APRÈS-MIDI', skyMul:[1.22,1.38,1.70],skyLift:[.06,.10,.18],city:0,stars:0,moon:.15,
    sunC:[1,.88,.72],
    fillI:.22, kickC:[1,.75,.60],kickI:.08,
    sat:1.18},
  golden:{ nm:'GOLDEN HOUR', skyMul:[1.30,1.05,.92],skyLift:[.12,.05,.02],sunTint:[1,.62,.30],sunHalo:1.15,city:.15,stars:0,moon:.25,
    fog:[.80,.55,.38],fogN:400,fogF:2500,
    hemiS:[.95,.78,.62],hemiG:[.26,.20,.26],hemiI:.60, sunC:[1,.72,.36],sunI:1.55,
    fillC:[.42,.48,.72],fillI:.20, kickC:[1,.55,.35],kickI:.14,
    volSun:[2.2,1.35,.75],volSky:[.52,.44,.58],volGnd:[.24,.17,.18],volAmb:.62,
    expo:.94,sat:1.34,
    env:[[0,'#5a7ab8'],[.3,'#c88a70'],[.48,'#f2b04a'],[.58,'#ffc060'],[.66,'#7a5a58'],[1,'#3a3a5e']],eS1:[255,214,130,.55],eS2:[255,170,90,.35]},
  couchant:{ nm:'DÉBUT DE SOIRÉE', skyMul:[1.05,.85,1.05],skyLift:[.05,.02,.06],sunTint:[1,.48,.30],sunHalo:.95,city:.55,stars:.25,moon:.5,
    fog:[.58,.36,.48],fogN:380,fogF:2300,
    hemiS:[.80,.58,.72],hemiG:[.18,.15,.26],hemiI:.50, sunC:[1,.55,.34],sunI:1.30,
    fillC:[.36,.42,.78],fillI:.24, kickC:[1,.35,.60],kickI:.18,
    volSun:[2.0,1.0,.70],volSky:[.44,.34,.62],volGnd:[.18,.11,.20],volAmb:.56,
    expo:.84,sat:1.40,
    env:[[0,'#3a4a8e'],[.3,'#7a4a86'],[.48,'#e87a9a'],[.58,'#e8925e'],[.66,'#4a3a5e'],[1,'#242046']],eS1:[255,180,190,.5],eS2:[150,190,240,.3]},
  soir:{ nm:'SOIRÉE', skyMul:[.80,.75,1.0],skyLift:[.01,.01,.03],sunTint:[1,.38,.30],sunHalo:.55,city:1.5,stars:1,moon:1,
    fog:[.30,.18,.34],fogN:400,fogF:2500,
    hemiS:[.66,.48,.68],hemiG:[.12,.11,.22],hemiI:.46, sunC:[1,.44,.26],sunI:1.15,
    fillC:[.31,.46,.91],fillI:.26, kickC:[1,.24,.62],kickI:.24,
    volSun:[1.6,.85,.65],volSky:[.28,.26,.56],volGnd:[.11,.07,.16],volAmb:.52,
    expo:.78,sat:1.46,
    env:[[0,'#1e1e50'],[.3,'#5e3676'],[.48,'#cc5e8e'],[.58,'#cc7a48'],[.66,'#42324e'],[1,'#181236']],eS1:[240,150,190,.5],eS2:[120,200,235,.32]},
  nuit:{ nm:'NUIT NOIRE', skyMul:[.42,.46,.72],skyLift:[0,0,0],sunTint:[.45,.32,.42],sunHalo:.12,city:.75,stars:1.9,moon:1.7,
    fog:[.066,.09,.19],fogN:460,fogF:2900,
    hemiS:[.23,.29,.46],hemiG:[.04,.05,.12],hemiI:.32, sunC:[.58,.68,.90],sunI:.80,
    fillC:[.18,.29,.78],fillI:.22, kickC:[.42,.48,.87],kickI:.14,
    volSun:[1.0,1.1,1.4],volSky:[.15,.19,.42],volGnd:[.04,.05,.11],volAmb:.42,
    expo:.64,sat:1.24,
    env:[[0,'#0e1434'],[.3,'#1c2650'],[.48,'#32406e'],[.58,'#3a4a80'],[.66,'#1a2244'],[1,'#080c20']],eS1:[170,195,255,.35],eS2:[120,150,230,.25]},
  // ---- ORAGE VIOLET : le ciel tourne au bleu de contusion, l'or passe DESSOUS ----
  // Le coup d'éclat du lot, et le seul qui ne soit pas une heure mais une MÉTÉO. Recette : on
  // ASSOMBRIT tout (expo au plancher, plafond violet, brume qui se referme à 1900) SAUF une fente
  // d'or brûlant sous la couche de nuages — plus un kick violet électrique. Saturation POUSSÉE au
  // maximum du jeu (1.54) : c'est elle qui empêche le sombre de virer au gris et garde le côté
  // pétant. Zéro étoile, zéro lune (tout est bouché), mais la ville rallume ses néons en plein jour.
  orage:{ nm:'ORAGE VIOLET', skyMul:[.70,.66,.97],skyLift:[.02,.02,.05],sunTint:[1,.72,.38],sunHalo:.72,city:.90,stars:0,moon:0,
    fog:[.26,.24,.39],fogN:300,fogF:1900,
    hemiS:[.44,.40,.61],hemiG:[.08,.08,.15],hemiI:.43, sunC:[1,.70,.34],sunI:1.32,
    fillC:[.22,.45,.59],fillI:.31, kickC:[.70,.35,1.0],kickI:.27,
    volSun:[2.10,1.30,.70],volSky:[.30,.28,.51],volGnd:[.07,.06,.13],volAmb:.44,
    expo:.74,sat:1.54,
    env:[[0,'#241e3a'],[.3,'#3a3252'],[.48,'#6a5a6e'],[.58,'#c8923e'],[.66,'#2e2a42'],[1,'#141020']],eS1:[255,190,90,.42],eS2:[120,220,220,.30]},
  // ---- ORBITE (2026-09-24) : le biome du NIVEAU « EN ORBITE » — il ne se tire JAMAIS au hasard ----
  // Le noir de l'espace, mais pas un trou : le ciel descend presque à zéro (`uSpace` finit le travail
  // dans le shader), les étoiles passent au maximum du jeu et SOUS l'horizon, et c'est la PLANÈTE —
  // agrandie et posée sous la route par `lvlPlanete` — qui tient la lumière. Soleil blanc et dur (pas
  // d'atmosphère pour le rougir), remplissage bleu-Terre, brume quasi noire et très lointaine : au-delà
  // de la route il n'y a rien à fondre, seulement de la distance.
  // ⚠ (2026-09-24) « dans le NOIR COMPLET » : zéro étoile, zéro lune, zéro halo solaire — il ne reste que la
  // Terre, la route et la caisse. Le soleil garde sa LUMIÈRE (sunI) : c'est lui qui éclaire la Terre et la caisse.
  espace:{ nm:'ORBITE', skyMul:[0,0,0],skyLift:[0,0,0],sunTint:[1,.90,.80],sunHalo:0,city:0,moon:0,
    fogN:900,fogF:4200,
    hemiS:[.05,.05,.09],// (2026-09-27) LA LUMIÈRE SPATIALE : pas de ciel (le dessus de l'hémisphère est noir), son dessous est le BLEU DE LA TERRE ; UN soleil blanc et dur (sa direction : orbiteLumiere)
    // `fill` vient de la Terre, `kick` est le clair de lune (leurs directions : orbiteLumiere)
    volSun:[1.25,1.20,1.65],volSky:[.12,.14,.32],volGnd:[.03,.03,.08],volAmb:.40},
  // ---- AURORE (2026-09-24) : le NIVEAU 1 de la carrière — « le soleil vient de se lever, la journée promet ».
  // Déjà du JOUR, pas l'heure bleue : un ciel clair qui jaunit vers l'horizon, une lumière chaude et RASANTE (ombres
  // longues : sunI haut, hemi clair), un remplissage bleu tendre de l'autre côté, un air LIMPIDE (brume lointaine).
  aurore:{ nm:'AURORE', skyMul:[1.58,1.68,1.86],skyLift:[.34,.24,.08],city:0,stars:0,moon:0},
  // ---- PLUIE NÉON (2026-09-24) : le ciel du niveau VILLE — « le village caché de la pluie », version cyberpunk ----
  // Un plafond ARDOISE bas et mouillé (pas de soleil : sunHalo au plancher, pas de lune, pas d'étoiles), une
  // brume gris-bleu qui avale le lointain, et toute la couleur qui vient d'EN BAS : la guirlande néon de
  // l'horizon au maximum (city 1.5), un remplissage CYAN et un contre-jour MAGENTA — les deux néons de la pluie.
  pluie:{ nm:'PLUIE NÉON', skyMul:[.42,.50,.64],skyLift:[.03,.04,.06],sunTint:[.70,.50,.80],sunHalo:.06,stars:0,moon:0,
    // brume VIOLETTE (était .12/.14/.19, bleu-noir) : la ville se FOND dans l'horizon au lieu d'y trancher
    volAmb:.44,
    eS2:[80,230,255,.35]},
  // ---- PARIS LA NUIT (2026-09-28, Léo : « une map ville à Paris », « Paris la nuit ») : le 4e monde ----
  // Le COUPLE COMPLÉMENTAIRE de la nuit parisienne : un ciel BLEU MARINE (lune, quelques étoiles) sur une ville ORANGE-OR (lampadaires au
  // sodium, façades éclairées, la tour dorée). La lumière vient d'EN BAS (hemiG chaud, `fill` ambré) et du clair de lune d'en haut.
  paris:{ nm:'PARIS LA NUIT', skyMul:[.40,.46,.78],skyLift:[.015,.012,.03],sunTint:[.62,.55,.72],sunHalo:.08,city:.30,stars:.55,moon:1.45,
    fog:[.10,.10,.20],fogN:420,fogF:2800,
    hemiS:[.30,.36,.58],hemiG:[.20,.13,.07],hemiI:.42, sunC:[.62,.70,.95],sunI:.70,
    fillC:[1,.64,.32],fillI:.30, kickC:[1,.80,.45],kickI:.16,
    volSun:[1.0,1.0,1.3],volSky:[.16,.18,.36],volGnd:[.10,.07,.05],volAmb:.42,
    expo:.78,sat:1.30,
    env:[[0,'#0a1030'],[.3,'#18224c'],[.48,'#3a3a6a'],[.58,'#b06a36'],[.66,'#261c36'],[1,'#07081a']],eS1:[255,200,130,.5],eS2:[140,170,255,.3],
    wb:[1.02,.99,.96],sh:[.004,.008,.03],hi:[.05,.03,0],con:1.12,bloomS:.62,bloomT:.86,vigK:.40,vigC:[.05,.04,.12],rimK:.2},
  // ---- PARIS AU SOL (2026-09-28) : trois heures, fondues d'un quartier à l'autre par parisTick (le ciel, lui, suit uParisT) ----
  parisOr:{ nm:'PARIS — HEURE DORÉE', skyMul:[1,1,1],skyLift:[0,0,0],sunTint:[1,.62,.30],sunHalo:.3,city:0,stars:0,moon:0,
    fog:[.86,.67,.54],fogN:420,fogF:3400,
    hemiS:[.62,.70,.95],hemiG:[.36,.27,.2],hemiI:.62, sunC:[1,.72,.42],sunI:1.6,
    fillC:[.45,.52,.8],fillI:.22, kickC:[1,.6,.4],kickI:.12,
    volSun:[2,1.3,.8],volSky:[.5,.46,.6],volGnd:[.24,.18,.18],volAmb:.6,
    expo:.95,sat:1.2,
    env:[[0,'#5a7ab8'],[.3,'#c8a080'],[.48,'#f2b870'],[.58,'#ffcf80'],[.66,'#7a6a68'],[1,'#3a3a4e']],eS1:[255,214,150,.5],eS2:[255,180,110,.3],
    wb:[1.03,1,.96],sh:[.01,.015,.04],hi:[.04,.02,0],con:1.06,bloomS:.5,bloomT:.9,vigK:.3,vigC:[.10,.06,.08],rimK:.2,rimS:.5},
  parisBleu:{ nm:'PARIS — HEURE BLEUE', skyMul:[1,1,1],skyLift:[0,0,0],sunTint:[.9,.5,.5],sunHalo:.05,city:0,stars:.25,moon:.4,
    fog:[.30,.32,.52],fogN:360,fogF:3200,
    hemiS:[.40,.50,.85],hemiG:[.2,.14,.10],hemiI:.5, sunC:[.85,.62,.62],sunI:.5,
    fillC:[1,.66,.36],fillI:.34, kickC:[.6,.7,1],kickI:.14,
    volSun:[1.2,.9,1],volSky:[.26,.32,.62],volGnd:[.1,.1,.18],volAmb:.5,
    expo:.86,sat:1.26,
    env:[[0,'#101a40'],[.3,'#26346a'],[.48,'#5a5a90'],[.58,'#c07a5a'],[.66,'#2a2a52'],[1,'#0c1028']],eS1:[255,190,130,.45],eS2:[120,170,255,.3],
    wb:[.99,.99,1.03],sh:[.0,.01,.05],hi:[.05,.03,0],con:1.08,bloomS:.6,bloomT:.86,vigK:.36,vigC:[.04,.04,.12],rimK:.3,rimS:.45},
  parisNuit:{ nm:'PARIS — LA NUIT', skyMul:[1,1,1],skyLift:[0,0,0],sunTint:[.5,.4,.5],sunHalo:0,city:0,stars:.8,moon:1.1,
    fog:[.07,.07,.13],fogN:300,fogF:3000,
    hemiS:[.22,.28,.5],hemiG:[.24,.14,.07],hemiI:.4, sunC:[.5,.56,.8],sunI:.28,
    fillC:[1,.62,.3],fillI:.42, kickC:[.7,.8,1],kickI:.14,
    volSun:[.9,.9,1.2],volSky:[.14,.16,.34],volGnd:[.1,.07,.05],volAmb:.4,
    expo:.8,sat:1.3,
    env:[[0,'#0a1030'],[.3,'#18224c'],[.48,'#3a3a6a'],[.58,'#b06a36'],[.66,'#261c36'],[1,'#07081a']],eS1:[255,200,130,.5],eS2:[140,170,255,.3],
    wb:[1.02,.99,.96],sh:[.004,.008,.03],hi:[.05,.03,0],con:1.12,bloomS:.64,bloomT:.84,vigK:.4,vigC:[.05,.04,.12],rimK:.2},
  // ---- L'ATELIER (2026-09-26, vague 2) : l'ambiance du GARAGE — jamais tirée, posée par openGarage, rendue à la fermeture ----
  // MESURÉ avant : saturation .42-.56, les caisses blanches BRÛLÉES — l'atelier héritait du ciel et du SOLEIL de la dernière course
  // (plein midi : `hemiI` .95 + soleil 1,42 à travers les murs) EN PLUS de ses deux lampes et de ses cônes additifs. Un atelier, c'est
  // deux lampes et beaucoup d'ombre : le ciel ne fait plus que déboucher (.32), le soleil n'est plus qu'un souvenir (.5), l'exposition
  // descend (.82) et la couleur remonte (1,35). Le ciel, les étoiles et la laque restent ceux de garageRender / paintEnvAtelier.
  atelier:{ nm:'ATELIER', skyMul:[.62,.92,1.34],skyLift:[0,0,0],sunTint:[1,.90,.80],sunHalo:.12,city:0,stars:1.7,moon:1.5,
    fog:[.05,.05,.08],fogN:900,fogF:4200,
    hemiS:[.62,.66,.80],hemiG:[.10,.08,.14],hemiI:.32, sunC:[1,.93,.84],sunI:.50,
    fillC:[.30,.45,.80],fillI:.14, kickC:[.90,.35,.70],kickI:.08,
    volSun:[1.2,1.1,1.0],volSky:[.2,.2,.3],volGnd:[.05,.05,.08],volAmb:.40,
    expo:.82,sat:1.35,
    env:[[0,'#06070b'],[.47,'#2b313d'],[1,'#0a0b0f']],eS1:[255,226,184,.5],eS2:[130,220,255,.4],
    wb:[1,.99,.975],sh:[.012,.002,.04],hi:[.04,.022,0],con:1.20,bloomS:.36,bloomT:.90,vigK:.46,vigC:[.11,.016,.19]},
};
/* L'ÉTALONNAGE PAR NIVEAU (2026-09-26, vague 2 « L'ENCRE ET L'OR ») — UN MONDE, TROIS HEURES, LA MÊME ENCRE.
   Jusqu'ici la balance des blancs, la teinte des ombres et des hautes lumières, le contraste, le bloom et la vignette étaient des
   CONSTANTES : le plein jour héritait du voile magenta et des ombres violettes de la nuit, et d'une vignette violette à 52 %. Chaque
   biome porte désormais son étalonnage, et `bioApply` (qui reste LE SEUL écrivain) le pousse dans l'ACES, le bloom et le liseré :
   · wb/sh/hi/con : balance des blancs, ombres (teintées d'ENCRE, jamais grises), hautes lumières, contraste ;
   · bloomS/bloomT : force (base desktop — le téléphone garde son rapport .44/.54, voir BLOOM_K) et seuil du bloom ;
   · vigK/vigC : la vignette, désormais DANS l'ACES (voir ACESShader) — sa force et sa couleur ;
   · rimK/rimS : d'où vient le liseré des caisses (0 = le soleil, 1 = le néon du `kick`, le contre-jour de la nuit) et sa force ;
   · fogIn/fogCj : la couleur du white-out DANS un nuage, et celle de la brume à contre-jour.
   Un biome sans étalonnage reçoit les valeurs d'avant (`BIO_ETAL0`) : la ville, l'heure bleue, le soir… ne bougent pas d'un bit.
   ⚠ bioLerp parcourt les clés du biome d'ARRIVÉE : le remplissage ci-dessous garantit que TOUS les biomes les ont toutes. */
const BIO_ETAL0={wb:[1,1,1],sh:[0,.004,.03],hi:[.024,.014,-.008],con:1.16,bloomS:.46,bloomT:.95,vigK:.52,vigC:[.03,.045,.09],daCon:1,rtK:1, /* (2026-10-14, passe graphismes · étalonnage commun) avant : wb [1.02,.985,1.03] · sh [.004,-.008,.062] · hi [.052,.008,-.014] · con 1.23 · bloomS .54 · bloomT .92 · vigC [.149,.047,.212] — voir « LA COUCHE COMMUNE » plus bas */
 daExpo:1,daWbN:1,daSh:1,daHi:1,
  rimK:0,rimS:.40,fogIn:[.847,.737,.816],fogCj:[.753,.416,.329],
  jour:0,jZen:[0,0,0],jMid:[0,0,0],jHor:[0,0,0],jSol:[0,0,0],
  cyZ:[.1,.25,.6],cyM:[.35,.45,.7],cyH:[.8,.7,.6],cyS:[1,.8,.6],cyB:[.8,.5,.6],cyC:[1,.9,.85],cyD:[.45,.45,.55],cyR:[.5,.45,.5],cyK:[0,0,0,0],cyN:[0,1,1,0],cyA:[Math.asin(SUN_DIR.y)*57.29578,Math.atan2(SUN_DIR.x,SUN_DIR.z)*57.29578,0,0],cyL:[1,.6,.4],cyT:[1,1,1],cyW:[.15,.6,.6],cyX:[.03,.22,.32],cyF:[.8,.8,.8],cyQ:[0,100,0,0], // (2026-10-14) LE CANYON DES GÉANTS : lus seulement là-bas (uCanyon, CY.mat) — cyA par défaut = le soleil d'origine
  jdZ:[.42,.58,.66],jdH:[.93,.90,.80],jdR:[.2,.28,.27],jdB:[.86,.87,.82],jdS:[1,.88,.66],jdM:[.93,.90,.80],jdL:[.42,.58,.66],jdK:[1,1,1,0]}; // (2026-10-09) le ciel des PICS DE JADE (lu seulement là-bas : uJade) // (2026-09-30) LE JOUR D'ALTITUDE : 0 = le ciel d'avant (voir cielJour)
/* (2026-10-14, passe graphismes · mer-nuit) LA MER DE NUAGES SUIT L'HEURE : ses sommets (`mzH`) et ses ombres (`mzO`) deviennent des champs d'ambiance
   (uMzH/uMzO du GLSL `merZ`, jusqu'ici écrits par le seul titre). w = 0 = la mer d'avant au bit près (mix(x,c,0) = x) : toutes les ambiances la gardent,
   seules nuagesNuit et tempete reçoivent une valeur (section MER DE NUAGES de l'étalonnage). */
const MN_T9=new THREE.Color();
Object.assign(BIO_ETAL0,{mzH:[1,.985,.96,0],mzO:[.4,.5,.66,0],nuA:[1,1,1]}); // rgb = la teinte d'avant (le fondu d'un portail glisse vers elle), w 0 = inerte · nuA = l'albédo des nuages × 1 (inchangé)
Object.assign(BIO_ETAL0,{nuLav:[.72,.78,.97],nuR:[-.25,.5,.64,1],nuK:[1,1,1,1]}); // (2026-10-14, passe graphismes · nuages-jour) LA MATIÈRE DES CUMULUS PAR AMBIANCE : nuLav = la teinte de l'ombre (GLSL uLav), nuR = uR (frontière d'ombre, clarté de l'ombre), nuK = uK (albédo, soleil, lisière, bord) ; les défauts = les valeurs d'avant, inertes
Object.assign(BIO_ETAL0,{dnA:[.95,.56,.26],dnB:[.88,.36,.17],dnL:[1,.78,.52],dnS:[.62,.62,.95],dnC:[.93,.86,.78],dnV:[.22,.42,.10],dnH:[.9,.7,.5],dnQ:[0,0,0,0],dnK:[.5,1,.25,1],dnM:[.8,.010,1,0],dnW:[.10,.66,.62],dnX:[.02,.26,.36]}); // (2026-10-18) LES DUNES D'OR : le sable de leurs six temps (lus seulement là-bas : dunesTick)
// (vague 3) ETAL_JOUR retiré : le jour des NUAGES reprend l'étalonnage d'origine (BIO_ETAL0), voir le haut de BIOMES
Object.assign(BIOMES.pluie,{rimS:.55}); // VILLE : l'étalonnage d'avant (déjà au niveau) — le liseré vient du NÉON de contre-jour
Object.assign(BIOMES.espace,{fog:[.016,.02,.055],wb:[.98,1,1.04],rimS:.62}); // ORBITE : le vide NOIR et froid, un contraste dur ; la brume n'est plus le noir absolu mais le noir bleuté #04050e de la bible (le lointain de la route s'y fond, et la brillance d'horizon du bitume, qui en prend la couleur, n'est plus nulle)
/* LA TEMPÊTE (2026-09-29) — le ciel du niveau L'ORAGE (jamais tiré au hasard) : les NUAGES du niveau 1 dans le noir — ardoise au zénith,
   brume proche et sombre (on voit la route à ~1 km, moins dans les bancs : l'ÉCLAIR ouvre le brouillard, voir orageTick), pas de soleil
   (la pluie l'éteint), les nuages éclairés d'un argent FROID (volSun bleuté) sur des flancs d'ardoise, le liseré des caisses vient du néon.
   Clone de l'ORAGE VIOLET SANS la ville peinte à l'horizon (city 0). */
BIOMES.tempete=Object.assign(JSON.parse(JSON.stringify(BIOMES.orage)),{nm:'TEMPÊTE',
  skyMul:[.34,.38,.60],skyLift:[.012,.014,.032],sunTint:[.75,.78,.95],sunHalo:0,city:0,
  fogN:70,fogF:660, /* (2026-09-30, « que ça gêne la visibilité ») 140/1050 → 70/660 : la route se lit à ~600 m, l'éclair l'ouvre (CAMP_FOG) */
  fillI:.32,
  volSun:[1.02,1.10,1.42],volSky:[.30,.33,.50],volGnd:[.08,.08,.14],volAmb:.5,
  expo:.86,
  env:[[0,'#161a2c'],[.3,'#232a44'],[.48,'#3a4260'],[.58,'#566080'],[.66,'#20263c'],[1,'#0c0e18']],eS1:[170,190,255,.30],eS2:[110,140,220,.25],
  bloomS:.6,bloomT:.85,rimK:.7,rimS:.5});
/* MINUIT (2026-09-30) — le ciel du niveau MINUIT EN VILLE (jamais tiré au hasard) : la PLUIE NÉON trois heures plus tard. Le ciel presque
   noir, quelques étoiles entre les nuages, la ville peinte à l'horizon n'est plus qu'une braise, la brume noire-bleue à ~900 m ; les
   lumières d'ambiance au plancher : ce qui éclaire la route, ce sont les PHARES (voir villeApres et les faisceaux PHARE_FX). */
BIOMES.nuitNoire=Object.assign(JSON.parse(JSON.stringify(BIOMES.pluie)),{
  });
Object.assign(BIOMES.tempete,{daCon:0,daExpo:1.12,daWbN:.5,daSh:.35});Object.assign(BIOMES.espace,{daWbN:.6}); // (DA) les niveaux sombres : voir daPose
/* LES PICS DE JADE (2026-10-09, Léo) — l'air d'un rouleau peint : un soleil bas et doux (or pâle), une brume crème-jade qui avale le
   lointain à ~2,5 km (les piliers s'y fondent, le ciel peint prend le relais), un ciel clair, un remplissage vert-de-gris. Étalonnage doux
   (la couche DA en retrait : les verts et les gris du lavis, pas le split teal/orange). */
BIOMES.jade={nm:'PICS DE JADE',skyMul:[1,1,1],skyLift:[0,0,0],sunTint:[1,.95,.86],sunHalo:0,city:0,stars:0,moon:0,
  /* (v6, Léo : « c'est trop clair là ») : fini le blanc délavé de la v5 — l'air des photos (brume blanc-bleuté mais plus loin, lumière du
     soleil franche, la mer de nuages qui éclaire par-dessous), un cran plus sombre que la v4, des couleurs pleines */
  /* (v17, Léo : « de la colorimétrie sur tout le niveau, du shading, une ambiance FÉERIQUE, le ciel plus dégradé ») — l'heure dorée d'un
     conte : la brume rose-lavande, une lumière d'or, les ombres lilas (le ciel les remplit), un contre-jour rose ; l'étalonnage plus saturé,
     les ombres violettes, les hautes lumières chaudes, un halo plus généreux (ce qui brille rayonne), la vignette prune. */
  fog:[.88,.80,.72],fogN:240,fogF:2500,
  hemiS:[.84,.80,.84],hemiG:[.60,.50,.48],hemiI:.98, sunC:[1,.78,.52],sunI:1.15,
  fillC:[.82,.56,.86],fillI:.20, kickC:[1,.78,.86],kickI:.07,
  volSun:[1.9,1.7,1.5],volSky:[.78,.70,.90],volGnd:[.40,.34,.44],volAmb:.82,
  expo:.90,sat:1.08,
  env:[[0,'#5f74c8'],[.3,'#a99ad8'],[.48,'#f2cfe0'],[.58,'#ffe2c4'],[.66,'#8a6f86'],[1,'#3a2e48']],eS1:[255,232,200,.50],eS2:[230,170,220,.32],
  wb:[1.01,.99,1.02],sh:[.012,-.002,.034],hi:[.022,.008,-.008],con:1.06,bloomS:.46,bloomT:.84,vigK:.28,vigC:[.18,.08,.20],rimK:0,rimS:.38,fogIn:[.94,.86,.78],fogCj:[1,.76,.56],
  daCon:.6,daExpo:1,daWbN:1,daSh:.3,daHi:.2,
  jdZ:[.50,.56,.66],jdL:[.74,.72,.74],jdM:[1,.66,.42],jdH:[1,.78,.54],jdR:[.40,.38,.46],jdB:[.90,.82,.76],jdS:[1,.72,.44]}; // (12/10 soir, Léo : « le ciel, un mélange de GRIS, BLEU, ORANGÉ ») l orange en bas, un gris chaud au milieu, le gris-bleu en haut // (12/10, Léo : « le ciel plus ORANGÉ, du coup, asiatique ») l orange du soir, le zénith bleu-mauve (v17 bis : la soie céladon)
for(const k9 in BIOMES)for(const f9 in BIO_ETAL0)if(BIOMES[k9][f9]==null)BIOMES[k9][f9]=JSON.parse(JSON.stringify(BIO_ETAL0[f9]));
/* (2026-10-14, passe graphismes · garage-lumiere) LE GARAGE SORT DU NÉON. Constat de l'œil neuf : c'était le seul lieu du jeu resté « néon » (disque
   cerclé de cyan, guirlande de losanges, vignette violette, moitié droite de la salle en noir bouché) alors que l'interface autour est passée en charte 6
   « ENCRE · BLANC · OR ». Tout ce qui suit est de la VALEUR (couleurs, intensités, brume, exposition) : zéro texture, zéro lumière, zéro appel de dessin
   en plus.  ATELIER_V0 = l'atelier d'avant, gardé tel quel : la BOUTIQUE de Léo (bqBio) en hérite, elle ne bouge pas. */
const ATELIER_V0=JSON.parse(JSON.stringify(BIOMES.atelier));
Object.assign(BIOMES.atelier,{hemiS:[.84,.85,.96],hemiG:[.13,.13,.20],hemiI:.97,sunC:[1,.90,.76],sunI:.92,fillC:[.55,.62,.82],fillI:.26,kickC:[1,.72,.42],kickI:.05,
  vigC:[.02,.03,.075],vigK:.26,expo:1.04,sat:1.15,con:1.12}); // lumière ambiante : de quoi LIRE les murs ; clé chaude, ombres bleu-nuit (la vignette n'est plus violette)
// Le tirage du jour, dans l'ordre des heures (+ l'ORAGE en joker météo) — la NUIT ne se tire pas,
// elle se MÉRITE (3 portails). 9 ambiances en rotation : deux parties ne se ressemblent plus.
const BIO_DAY=['aube','lever','matin','midi','aprem','golden','couchant','soir','orage'];
/* LE JOUR D'ALTITUDE — LES TROIS HEURES DU NIVEAU NUAGES (2026-09-30, Sacha, capture de Zelda : Tears of the Kingdom à l'appui : « c'est
   vilain, refonte totale, refonte également du niveau dans les nuages, ambiance haut de gamme GTA 6, toute l'ambiance doit être refaite
   et parfaite »). Le ciel d'AU-DESSUS des nuages : azur profond au zénith, turquoise lumineux, horizon crème (jZen/jMid/jHor, voir
   cielJour), la lueur du soleil posée sur l'horizon (jSol), une mer de nuages PLEINE sous l'horizon (merZ) ; la brume de l'air épais,
   repoussée (on lit loin, la mer fait sa propre perspective) ; le contre-jour crème et le blanc des bancs (fogCj/fogIn : le corail et
   le rose de la nuit teintaient le jour en MAGENTA) ; l'étalonnage neutre-frais (plus de voile magenta, vignette bleu nuit, ombres à
   peine sarcelle) ; des nuages BLANCS au soleil (volSun presque neutre : la pêche, c'est l'après-midi). Réglé au banc (ciel2.js, menu
   et course figée, debout et couché) ; `dbgAmb(nom,{…})` pour retoucher à chaud. Le menu (MENU_BIO = 'matin') prend le même ciel. */
{const G9={daHi:0,wb:[1,1,1],sh:[-.006,.008,.03],hi:[0,0,0],con:1.2, /* (2026-10-01) daHi 0 : plus de split or de la couche DA au jour d'altitude (les blancs sortaient SABLE) — le hi de compensation n'a plus lieu d'être */ /* hi : compense le split or de la couche DA (+.02,+.038,−.042) — sinon un nuage blanc, haute lumière, sortait ORANGE */vigC:[.05,.14,.22],vigK:.26, /* (niveau 1 v2) .34 → .26 : avec le bitume plus sombre, le bas de l'image tournait au trou noir */fogIn:[.93,.95,.97],hemiG:[.78,.80,.86],volGnd:[.60,.66,.78],volSky:[.55,.75,.95]};
 Object.assign(BIOMES.matin,G9,{jour:1,con:1.28,jSol:[.55,.38,.18],sunTint:[1,.90,.70],sunHalo:.8,
   fogN:900,fogF:5200,fogCj:[.96,.90,.78],hemiS:[.78,.86,.95],hemiI:.70,sunI:1.5,fillC:[.55,.75,.95],
   volSun:[2.05,1.98,1.84],volAmb:.9,expo:.96,
   env:[[0,'#2f7fc0'],[.3,'#6cc0dc'],[.48,'#e6f2ee'],[.58,'#fff4de'],[.66,'#b9c9d6'],[1,'#8ea4ba']],eS1:[255,248,230,.44],eS2:[150,215,240,.32]});
 Object.assign(BIOMES.midi,G9,{jour:1,sunTint:[1,.96,.88],sunHalo:.6,
   fogN:1000,fogF:5600,hemiS:[.76,.86,.98],hemiI:.70,sunC:[1,.98,.92],sunI:1.55,
   volSun:[2.3,2.25,2.15],
   env:[[0,'#1f6cc4'],[.3,'#5ab0e0'],[.48,'#dff0f6'],[.58,'#ffffff'],[.66,'#bccbd8'],[1,'#90a4bc']],eS1:[255,255,248,.46],eS2:[140,205,250,.3]});
 Object.assign(BIOMES.aprem,G9,{jour:1,con:1.28,jZen:[.14,.34,.62],jMid:[.40,.62,.82],jHor:[.98,.88,.74],jSol:[.75,.42,.16],sunTint:[1,.82,.58],sunHalo:.9,
   fog:[.90,.87,.83],fogN:900,fogF:5000,fogCj:[1,.84,.66],hemiS:[.80,.84,.96],hemiI:.70,sunI:1.35,fillC:[.58,.66,.86],
   volSun:[1.9,1.6,1.3],volAmb:.8,expo:.94,hi:[.01,0,-.01], // l'après-midi garde un peu d'or dans ses lumières
   env:[[0,'#3a78b8'],[.3,'#80b4d6'],[.48,'#f2dcbc'],[.58,'#ffd9a0'],[.66,'#c2b8b4'],[1,'#8e98ac']],eS1:[255,236,200,.44],eS2:[170,205,240,.3]});}
/* L'AMBIANCE DU TITRE (titre v3) : le matin d'altitude, poussé vers l'écran titre de Zelda TOTK — un azur plus profond au zénith, un
   turquoise franc, l'horizon presque blanc, une brume très loin (les cumulus du titre font la perspective), un soleil un peu plus fort.
   Lue par chuteRender seulement (`BIOMES.titre`) ; le niveau garde son 'matin'. `dbgAmb('titre',{…})` pour retoucher à chaud. */
/* LE CIEL DU BULL RUN (2026-10-13, CRYPTOCITY) : le jour d'altitude du midi, un azur profond au zénith, l'horizon et la brume en OR (la
   ville sort d'une brume dorée), le soleil franc et chaud, le remplissage vert « profit », le sol qui renvoie de l'or ; pas de lune (une
   pièce ₿ la remplace, voir cryptoTick). Étalonnage : un cran plus saturé, hautes lumières dorées, vignette d'or sombre. */
BIOMES.bullrun=Object.assign(JSON.parse(JSON.stringify(BIOMES.midi)),{nm:'BULL RUN',
  sunTint:[1,.92,.70],sunHalo:1,
  fogN:620,fogF:3300,
  hemiG:[.66,.52,.26],sunC:[1,.92,.72],fillI:.22,kickC:[1,.80,.38],kickI:.12,
  volSun:[2.2,2,1.6],volAmb:.9,sat:1.12,hi:[.016,.008,-.01],
  eS1:[255,236,180,.5],eS2:[120,255,190,.3]});
BIOMES.titre=JSON.parse(JSON.stringify(BIOMES.matin));
Object.assign(BIOMES.titre,{nm:'TITRE',jZen:[.05,.27,.66],jMid:[.22,.62,.90],jHor:[.90,.95,.94],fog:[.80,.90,.96],fogN:500,sunC:[1,.96,.88],sunI:1.6,hemiI:.78,expo:.94,vigK:.2});
/* LES HEURES DU TITRE (2026-10-05, Sacha : « pour l'écran d'accueil dans le ciel, fais plusieurs éclairages et ambiances à plusieurs
   moments de la journée : matin, midi, après-midi, golden hour, soir, nuit — il faut que toutes les ambiances soient magnifiques »).
   Six ambiances du ciel de l'accueil, toutes tirées du titre v3 (le MATIN, inchangé) : seules la lumière, les couleurs et l'air changent —
   aucun objet de plus. L'heure est celle du TÉLÉPHONE (`titreHeureDe`) ; `?heure=midi` dans l'adresse ou `dbgHeure('nuit')` la forcent.
   Ce que chaque heure règle à côté (cumulus du titre, mer de nuages, lampes de la caisse, voiles de l'écran) : `TITRE_H`, près de CHUTE_P. */
function titreAmb(o){return Object.assign(JSON.parse(JSON.stringify(BIOMES.titre)),o);}
BIOMES.titreMatin=BIOMES.titre; // le titre v3 tel quel : l'azur de Zelda, soleil dans le dos
// MIDI : le soleil au plus haut — le bleu le plus profond au zénith, un horizon blanc, des cumulus d'un blanc franc, l'air limpide
BIOMES.titreMidi=titreAmb({nm:'TITRE · MIDI',jZen:[.02,.19,.58],jMid:[.13,.51,.88],jHor:[.86,.93,.97],jSol:[.30,.30,.26],sunTint:[1,.98,.94],sunHalo:.55,
  fog:[.80,.89,.97],fogN:620,fogF:6200,hemiS:[.76,.86,.98],hemiI:.82,sunC:[1,.99,.96],sunI:1.75,expo:.95,sat:1.22,con:1.3,
  env:BIOMES.midi.env,eS1:BIOMES.midi.eS1,eS2:BIOMES.midi.eS2});
// APRÈS-MIDI : la lumière se dore à peine, l'horizon prend une crème chaude, un voile d'air tiède au loin
BIOMES.titreAprem=titreAmb({nm:'TITRE · APRES-MIDI',jZen:[.10,.30,.62],jMid:[.34,.60,.84],jHor:[.98,.90,.78],jSol:[.75,.45,.20],sunTint:[1,.86,.64],sunHalo:.9,
  fog:[.90,.88,.84],fogN:520,fogF:5000,fogCj:[1,.86,.70],hemiS:[.80,.84,.96],hemiI:.74,sunC:[1,.95,.86],sunI:1.5,expo:.93,sat:1.26,hi:[.01,0,-.01],
  env:BIOMES.aprem.env,eS1:BIOMES.aprem.eS1,eS2:BIOMES.aprem.eS2});
// GOLDEN HOUR : le soleil rase la mer de nuages — ambre sur l'horizon, ciel lavande, cumulus pêche et or côté soleil, ombres mauves
BIOMES.titreGolden=titreAmb({nm:'TITRE · GOLDEN HOUR',jZen:[.12,.22,.52],jMid:[.56,.52,.72],jHor:[1,.70,.42],jSol:[1.1,.52,.16],sunTint:[1,.60,.32],sunHalo:1.15,
  fog:[.94,.72,.58],fogN:700,fogF:8000,fogCj:[1,.70,.48],fogIn:[1,.90,.82],hemiS:[.70,.68,.88],hemiG:[.55,.42,.46],hemiI:.55,sunC:[1,.72,.44],sunI:1.7,
  expo:.9,sat:1.36,con:1.24,vigC:[.16,.07,.10],vigK:.3,hi:[.02,0,-.02],
  env:[[0,'#2a3c78'],[.3,'#8a78a8'],[.48,'#ffb070'],[.58,'#ffd08a'],[.66,'#b08a8c'],[1,'#6a6080']],eS1:[255,200,140,.5],eS2:[160,150,220,.3]});
// SOIR : le soleil vient de passer sous la mer — une bande corail sur l'horizon, l'indigo monte, les premières étoiles, la lune se lève
BIOMES.titreSoir=titreAmb({nm:'TITRE · SOIR',jZen:[.05,.07,.24],jMid:[.28,.20,.44],jHor:[.94,.46,.42],jSol:[.75,.25,.20],sunTint:[.95,.45,.45],sunHalo:.4,stars:.4,moon:.8,
  fog:[.42,.30,.44],fogN:420,fogF:4200,fogCj:[.90,.52,.55],fogIn:[.70,.60,.72],hemiS:[.42,.40,.66],hemiG:[.18,.14,.26],hemiI:.55,sunC:[.96,.60,.62],sunI:.9,
  expo:.88,sat:1.26,con:1.22,vigC:[.06,.04,.14],vigK:.34,
  env:[[0,'#0e1030'],[.3,'#3a2a5e'],[.48,'#c25a6a'],[.58,'#ff8a70'],[.66,'#4a3858'],[1,'#141428']],eS1:[255,150,150,.45],eS2:[120,130,220,.3]});
// NUIT : la lune — un ciel d'encre semé d'étoiles, la mer de nuages argentée, des cumulus d'argent bleuté, pas de soleil
BIOMES.titreNuit=titreAmb({nm:'TITRE · NUIT',jZen:[.006,.012,.045],jMid:[.025,.045,.12],jHor:[.09,.13,.25],jSol:[.04,.05,.09],sunTint:[.6,.7,1],sunHalo:0,stars:1.25,moon:1.35,
  fog:[.06,.08,.16],fogCj:[.30,.36,.55],fogIn:[.30,.34,.48],hemiS:[.30,.38,.60],hemiG:[.06,.08,.16],hemiI:.5,sunC:[.62,.72,1],sunI:.75,fillC:[.30,.40,.70],
  expo:.92,sat:1.1,con:1.18,vigC:[.01,.02,.06],vigK:.42,sh:[0,.005,.03],
  env:[[0,'#04060f'],[.3,'#0a1430'],[.48,'#24345e'],[.58,'#5a6a96'],[.66,'#121a34'],[1,'#05070f']],eS1:[180,200,255,.4],eS2:[90,110,180,.3]});
/* LES MÉTÉOS DU MODE CLASSIQUE (2026-10-13, Sacha : « la map, le biome, et la météo : la pluie, l'orage avec des nuages, le soleil le matin,
   le soir, à midi — plusieurs éclairages — et que cette variable soit indépendante de la map »). Le mode classique tire une MAP puis une
   MÉTÉO (voir « LE MODE CLASSIQUE AU HASARD », après NIVEAUX) ; chaque couple qui n'existait pas reçoit ici SON ambiance, faite à partir
   de celles du jeu (rien n'est inventé à côté : les heures du titre pour la mer de nuages, la tempête pour l'orage, le rouleau de Léo pour
   la jade). Que des uniforms : aucun programme de plus. `bioMet(base,o)` = une copie de `base` (toutes ses clés) retouchée par `o`.
   Jade : `jdK` = le temps qu'il fait sur le rouleau peint (soleil, or des kasumi, fleuve, lune) — voir uJdK dans COUCHES.jade. */
function bioMet(base,o){return Object.assign(JSON.parse(JSON.stringify(base)),JSON.parse(JSON.stringify(o)));}
function bioPris(src,cles){const o={};for(const k of cles)o[k]=src[k];return o;}
const BIO_TITRE_CLES=['jZen','jMid','jHor','jSol','sunTint','sunHalo','stars','moon','fogCj','fogIn','hemiS','hemiG','hemiI','sunC','sunI','fillC','expo','sat','con','vigC','vigK','hi','sh','env','eS1','eS2'];
// LA MER DE NUAGES — le soir et la nuit : les couleurs des HEURES DU TITRE (golden hour, nuit), l'air et la brume de la course
BIOMES.nuagesSoir=bioMet(BIOMES.aprem,Object.assign(bioPris(BIOMES.titreGolden,BIO_TITRE_CLES),{nm:'COUCHER DE SOLEIL',fog:[.94,.72,.58],fogN:900,fogF:5200,
  volSun:[2.1,1.35,.8],volSky:[.52,.46,.64],volGnd:[.24,.17,.2],volAmb:.66}));
BIOMES.nuagesNuit=bioMet(BIOMES.aprem,Object.assign(bioPris(BIOMES.titreNuit,BIO_TITRE_CLES),{nm:'NUIT D\'ALTITUDE',fog:[.06,.08,.16],fogN:700,fogF:4600,
  volSun:[1,1.1,1.45],volSky:[.15,.19,.42],volGnd:[.04,.05,.11],volAmb:.46,kickC:[.42,.48,.87],kickI:.14,rimK:.5,rimS:.5,daExpo:1.1,daSh:.3,daWbN:.6}));
// …sous la PLUIE : un plafond gris au-dessus de la mer de nuages, pas de soleil, la brume qui se referme à ~1,8 km (le rideau : LVL.pluie)
BIOMES.nuagesPluie=bioMet(BIOMES.midi,{nm:'AVERSE',jSol:[.04,.04,.04],sunTint:[.8,.82,.9],sunHalo:.05,
  fogN:260,fogF:1900,hemiS:[.60,.64,.72],hemiI:.78,sunI:.62,
  fillC:[.45,.55,.72],fillI:.26,kickC:[.55,.62,.80],kickI:.12,volSun:[1.15,1.2,1.32],volSky:[.46,.50,.60],volGnd:[.22,.23,.28],volAmb:.7,
  rimK:.3,rimS:.42,
  env:[[0,'#3a4250'],[.3,'#58606e'],[.48,'#8a909a'],[.58,'#a2a7ae'],[.66,'#5e6470'],[1,'#30343c']],eS1:[200,210,230,.30],eS2:[150,165,190,.25]});
// LA VILLE — sous l'orage (la tempête, les néons rallumés)
BIOMES.villeOrage=bioMet(BIOMES.tempete,{});
// LES PICS DE JADE — le rouleau de Léo (BIOMES.jade : l'or du soir) repeint à quatre autres heures : la soie change, le pinceau reste
BIOMES.jadeMatin=bioMet(BIOMES.jade,{nm:'JADE · MATIN',fogN:260,fogF:2700,sunC:[1,.92,.76],sunI:1.25,hemiI:1,
  volSun:[2,1.9,1.7],
  jdK:[.55,.7,1.05,0],
  fogCj:[1,.92,.76],eS1:[255,244,214,.5],eS2:[170,205,240,.3]});
BIOMES.jadeMidi=bioMet(BIOMES.jade,{nm:'JADE · MIDI',fogN:300,fogF:3000,sunC:[1,.98,.94],sunI:1.45,hemiI:1.02,
  fillI:.18,volSun:[2.2,2.15,2.05],sat:1.12,
  jdK:[.25,.45,1.15,0],
  fogCj:[.96,.95,.90],eS1:[255,255,248,.48],eS2:[150,200,255,.3]});
BIOMES.jadeNuit=bioMet(BIOMES.jade,{nm:'JADE · NUIT',fogN:200,fogF:2300,
  kickI:.12,volAmb:.45,expo:.92,con:1.12,
  vigK:.4,hi:[0,0,0],rimK:.5,rimS:.5,daWbN:.6,daExpo:1.08});
BIOMES.jadePluie=bioMet(BIOMES.jade,{nm:'JADE · PLUIE',fogN:150,fogF:1700,sunI:.6,hemiI:.85,
  kickI:.08,volSun:[1.2,1.25,1.3],volAmb:.72,expo:.94,con:1.04,
  vigK:.32,hi:[0,0,0],
  jdS:[.3,.32,.34],jdK:[0,.1,.62,0]});
BIOMES.jadeOrage=bioMet(BIOMES.jadePluie,{nm:'JADE · ORAGE',fogN:90,fogF:1150,sunI:.5,hemiI:.6,
  fillI:.28,volAmb:.5,expo:.88,con:1.1,
  vigK:.5,rimK:.7,rimS:.5,daCon:.4,daExpo:1.1,daWbN:.5,daSh:.35});
/* LE CANYON DES GÉANTS (2026-10-14, Sacha : « toutes les météos et heures de la journée parfaitement gérées et adaptées à un biome
   désertique ») — six ambiances, la signature de chaque météo (la charte de l'image) teintée par l'identité du canyon : l'air SEC (un azur
   plus profond, un horizon chaud et poudré), la roche qui renvoie sa couleur (le rebond `cyL`, le sol de l'hémisphère), l'eau turquoise.
   Les champs cy* (en LINÉAIRE) : le ciel (Z zénith, M milieu, H horizon, S lueur du soleil, B ceinture de Vénus, C/D nuages éclairés /
   à l'ombre, R mesas lointaines, K = cumulus · cirrus · Voie lactée · lune, N = ceinture · taille du disque · éclat · plafond gris), le
   SOLEIL de l'heure `cyA` = [hauteur°, azimut° (depuis +z vers +x), crue, boue], le rebond `cyL`, la teinte de la roche `cyT`, l'eau `cyW`
   (claire) / `cyX` (profonde), la brume du fond `cyF`, `cyQ` = [brume, sa hauteur (m), mouillé, boue]. jour:1 : pendant le fondu du portail
   le ciel du jeu est celui d'altitude (jamais la bande magenta d'avant). Saturation réelle = sat × DA.sat × 1,12 (plafonds de la charte). */
{const cyB=function(o){return bioMet(BIOMES.midi,Object.assign({jour:1,city:0,sunHalo:0,stars:0,moon:0,rimK:0,rimS:.42,daHi:0,wb:[1,1,1]},o));};
 BIOMES.canyonMatin=cyB({nm:'CANYON · MATIN',jZen:[.10,.30,.68],jMid:[.42,.48,.70],jHor:[.93,.66,.52],jSol:[.6,.36,.18],
   fog:[.90,.68,.58],fogN:500,fogF:6500,fogCj:[1,.78,.58],fogIn:[.94,.86,.82],hemiS:[.42,.52,.80],hemiG:[.55,.40,.34],hemiI:.55,sunC:[1,.75,.45],sunI:1.6,
   fillC:[.40,.50,.82],fillI:.18,kickC:[1,.72,.6],kickI:.08,expo:.95,sat:1.02,con:1.16,sh:[0,.004,.026],hi:[.012,.006,-.006],bloomS:.42,bloomT:.95,vigK:.3,vigC:[.05,.035,.035],
   env:[[0,'#5E9FDD'],[.3,'#B8B4D6'],[.48,'#F7D9BC'],[.58,'#FFE6C8'],[.66,'#D89A88'],[1,'#8A5A50']],eS1:[255,226,190,.5],eS2:[160,190,240,.3],
   cyZ:[.10,.30,.68],cyM:[.42,.48,.70],cyH:[.93,.66,.52],cyS:[1,.70,.45],cyB:[.86,.48,.58],cyC:[1,.80,.72],cyD:[.40,.40,.56],cyR:[.55,.45,.52],
   cyK:[.25,.55,0,0],cyN:[.85,.9,1.3,0],cyA:[13,62,0,0],cyL:[1,.62,.55],cyT:[1.03,.96,1],cyW:[.16,.62,.62],cyX:[.03,.22,.32],cyF:[.90,.74,.70],cyQ:[.8,140,0,0]});
 BIOMES.canyonMidi=cyB({nm:'CANYON · MIDI',jZen:[.05,.25,.72],jMid:[.25,.52,.86],jHor:[.72,.76,.78],jSol:[.3,.28,.2],
   fog:[.74,.76,.78],fogN:900,fogF:9000,fogCj:[.92,.90,.84],fogIn:[.92,.94,.95],hemiS:[.45,.62,.95],hemiG:[.62,.46,.36],hemiI:.62,sunC:[1,.93,.82],sunI:1.75,
   fillC:[.48,.62,.92],fillI:.14,kickC:[1,.92,.82],kickI:.05,expo:.94,sat:1.0,con:1.2,sh:[0,.006,.03],hi:[.008,.004,-.004],bloomS:.40,bloomT:.96,vigK:.28,vigC:[.04,.035,.035],
   env:[[0,'#3F8FE0'],[.3,'#88BCEB'],[.48,'#DCE6EE'],[.58,'#FFFFFF'],[.66,'#E2B08E'],[1,'#9A6650']],eS1:[255,252,240,.48],eS2:[150,200,250,.3],
   cyZ:[.05,.25,.72],cyM:[.25,.52,.86],cyH:[.72,.76,.78],cyS:[1,.95,.86],cyB:[.7,.7,.75],cyC:[1,1,.98],cyD:[.55,.62,.74],cyR:[.55,.52,.55],
   cyK:[.38,.15,0,0],cyN:[0,.6,1.8,0],cyA:[63,205,0,0],cyL:[1,.66,.48],cyT:[1.02,1,.97],cyW:[.12,.70,.66],cyX:[.02,.30,.38],cyF:[.86,.84,.80],cyQ:[0,80,0,0]});
 BIOMES.canyonSoir=cyB({nm:'CANYON · SOIR',jZen:[.10,.11,.39],jMid:[.48,.30,.42],jHor:[1,.50,.26],jSol:[.9,.45,.18],
   fog:[.92,.52,.34],fogN:700,fogF:7500,fogCj:[1,.62,.36],fogIn:[1,.84,.74],hemiS:[.32,.30,.55],hemiG:[.45,.25,.18],hemiI:.45,sunC:[1,.42,.16],sunI:1.65,
   fillC:[.34,.36,.70],fillI:.2,kickC:[1,.5,.36],kickI:.12,expo:.9,sat:1.06,con:1.18,sh:[0,.002,.03],hi:[.016,.006,-.008],bloomS:.44,bloomT:.94,vigK:.3,vigC:[.05,.03,.03],
   env:[[0,'#5A5FA8'],[.3,'#B47C9C'],[.48,'#FFB98A'],[.58,'#FFCF9A'],[.66,'#D2704A'],[1,'#6A3426']],eS1:[255,190,130,.55],eS2:[170,150,220,.3],
   cyZ:[.10,.11,.39],cyM:[.48,.30,.42],cyH:[1,.50,.26],cyS:[1,.45,.16],cyB:[.80,.42,.52],cyC:[1,.55,.32],cyD:[.30,.22,.34],cyR:[.42,.27,.33],
   cyK:[.22,.7,0,0],cyN:[.6,1.3,1.2,0],cyA:[6,-112,0,0],cyL:[1,.48,.30],cyT:[1.04,.95,.88],cyW:[.14,.46,.52],cyX:[.03,.14,.24],cyF:[.88,.58,.46],cyQ:[.18,90,0,0]});
 BIOMES.canyonNuit=cyB({nm:'CANYON · NUIT',jZen:[.003,.006,.029],jMid:[.008,.014,.05],jHor:[.013,.023,.084],jSol:[0,0,0],stars:1.3,
   fog:[.013,.022,.075],fogN:300,fogF:4500,fogCj:[.10,.13,.24],fogIn:[.10,.12,.2],hemiS:[.10,.14,.30],hemiG:[.02,.022,.04],hemiI:.4,sunC:[.40,.53,.82],sunI:.5,
   fillC:[.2,.3,.6],fillI:.16,kickC:[.4,.5,.9],kickI:.12,expo:.92,sat:.94,con:1.14,sh:[0,.006,.03],hi:[0,0,0],bloomS:.5,bloomT:.88,vigK:.34,vigC:[.01,.015,.03],rimK:.5,rimS:.5,daSh:.3,daWbN:.6,daExpo:1.1,
   env:[[0,'#0B1230'],[.3,'#141E44'],[.48,'#1E2A52'],[.58,'#2A3A66'],[.66,'#1A1A2A'],[1,'#08080E']],eS1:[170,195,255,.35],eS2:[110,130,200,.25],
   cyZ:[.003,.006,.029],cyM:[.008,.014,.05],cyH:[.013,.023,.084],cyS:[.40,.50,.80],cyB:[0,0,0],cyC:[.06,.07,.11],cyD:[.012,.016,.03],cyR:[.012,.018,.05],
   cyK:[.06,.1,1.2,1],cyN:[0,.75,1.4,0],cyA:[34,140,0,0],cyL:[.16,.18,.26],cyT:[.92,.96,1.08],cyW:[.03,.08,.12],cyX:[.008,.02,.04],cyF:[.04,.05,.10],cyQ:[.3,90,0,0]});
 BIOMES.canyonPluie=cyB({nm:'CANYON · PLUIE',jZen:[.156,.212,.305],jMid:[.25,.31,.40],jHor:[.40,.44,.50],jSol:[0,0,0],
   fog:[.40,.44,.50],fogN:160,fogF:2400,fogCj:[.46,.48,.52],fogIn:[.50,.53,.58],hemiS:[.50,.56,.66],hemiG:[.26,.22,.20],hemiI:.8,sunC:[.665,.73,.823],sunI:.5,
   fillC:[.42,.5,.62],fillI:.18,kickC:[.55,.6,.7],kickI:.08,expo:.95,sat:.92,con:1.1,sh:[0,.006,.02],hi:[0,0,0],bloomS:.42,bloomT:.92,vigK:.3,vigC:[.04,.045,.05],rimK:.3,
   env:[[0,'#6E7F96'],[.3,'#8A98AA'],[.48,'#A9B7C6'],[.58,'#B8C2CE'],[.66,'#8A7068'],[1,'#4A3A34']],eS1:[210,220,234,.3],eS2:[150,165,190,.25],
   cyZ:[.156,.212,.305],cyM:[.25,.31,.40],cyH:[.40,.44,.50],cyS:[.8,.8,.82],cyB:[0,0,0],cyC:[.42,.45,.52],cyD:[.16,.18,.24],cyR:[.30,.31,.35],
   cyK:[0,0,0,0],cyN:[0,.8,.4,1],cyA:[48,180,.5,.6],cyL:[.45,.40,.38],cyT:[.90,.86,.86],cyW:[.36,.32,.26],cyX:[.20,.15,.11],cyF:[.52,.54,.58],cyQ:[.5,110,1,.7]});
 BIOMES.canyonOrage=cyB({nm:'CANYON · ORAGE',jZen:[.013,.02,.051],jMid:[.03,.04,.08],jHor:[.069,.093,.162],jSol:[0,0,0],
   fog:[.06,.08,.14],fogN:90,fogF:1500,fogCj:[.16,.18,.26],fogIn:[.2,.22,.3],hemiS:[.20,.24,.34],hemiG:[.04,.04,.06],hemiI:.55,sunC:[.323,.392,.552],sunI:.35,
   fillC:[.3,.38,.6],fillI:.24,kickC:[.45,.5,.75],kickI:.2,expo:.88,sat:.92,con:1.16,sh:[0,.006,.024],hi:[0,0,0],bloomS:.55,bloomT:.85,vigK:.4,vigC:[.015,.018,.028],rimK:.7,rimS:.5,daCon:.4,daExpo:1.1,daWbN:.5,daSh:.35,
   env:[[0,'#1E2740'],[.3,'#2A3450'],[.48,'#4A5670'],[.58,'#5A6680'],[.66,'#3A3236'],[1,'#141012']],eS1:[170,190,255,.3],eS2:[110,140,220,.25],
   cyZ:[.013,.02,.051],cyM:[.03,.04,.08],cyH:[.069,.093,.162],cyS:[.9,.6,.4],cyB:[0,0,0],cyC:[.10,.12,.18],cyD:[.02,.025,.045],cyR:[.06,.07,.11],
   cyK:[0,0,0,0],cyN:[0,.8,.3,1],cyA:[40,170,1,1],cyL:[.25,.22,.24],cyT:[.86,.84,.88],cyW:[.30,.22,.16],cyX:[.14,.09,.06],cyF:[.16,.18,.24],cyQ:[.45,90,1,1]});
/* (2026-10-14, LA BIBLE CAR CASH, passe graphismes · canyon2) LE CANYON DES GÉANTS PARLE LA LANGUE DES AUTRES MAPS : contre-jour ROSE sur les caisses, saturation
   effective ~1,35 ; MIDI : plus d'horizon ni de brume gris neutre (#c0c4c6, le « ciel délavé ») → sable pêche ; SOIR : soleil à 6°, les ombres des parois tombaient
   au NOIR (ciel .45 / remplissage .2) → ombres bleu-violet (ciel .62, remplissage bleu .38). Plus la signature de route (bords roses, ligne or). */
{
 Object.assign(BIOMES.canyonMatin,{sat:1.12,con:1.2,fillI:.28,kickC:[1,.40,.66],kickI:.18});
 Object.assign(BIOMES.canyonMidi,{rtK:.7,sat:1.12,con:1.22,jHor:[.95,.74,.55],cyH:[.95,.74,.55],fog:[.84,.70,.58],fogCj:[1,.82,.62],fogIn:[.96,.88,.80],cyF:[.90,.76,.64],cyB:[.80,.62,.58],fillI:.26,kickC:[1,.40,.68],kickI:.18});
 Object.assign(BIOMES.canyonSoir,{sat:1.12,con:1.22,hemiS:[.44,.40,.72],hemiI:.62,fillC:[.42,.46,.92],fillI:.38,kickC:[1,.38,.62],kickI:.2});
 for(const k of ['canyonNuit','canyonPluie','canyonOrage'])if(BIOMES[k])Object.assign(BIOMES[k],{kickC:[1,.38,.66],kickI:Math.max(BIOMES[k].kickI||0,.16)});
}}
/* LES DUNES D'OR (2026-10-18, Sacha : « fais les dunes d'or de manière parfaite ») — six temps nés de ceux du canyon (le même ciel du désert, le même
   soleil de l'heure `cyA`), retouchés pour un ERG : un azur plus profond et plus TURQUOISE au milieu (le teal de la DA contre l'or du sable), un horizon
   de poussière chaude, l'ombre du sable violette. Les champs dn* (LINÉAIRE, lus par dunesTick, défauts dans BIO_ETAL0) : dnA / dnB = le sable doré /
   rouge, dnL = la crête, dnS = la teinte de l'ombre, dnC = l'argile des cuvettes, dnV = l'herbe de l'oasis, dnH = la poussière, dnQ = [poussière,
   mirage, tempête, paillettes], dnK = [satin, rides, lumière enveloppée, —], dnW / dnX = l'eau claire / profonde de l'oasis. cyR = les dunes et les
   pyramides de l'horizon (uCyDn). Le temps « pluie » est un VENT DE SABLE (pas une goutte), l'« orage » une TEMPÊTE DE SABLE (orage sec : les éclairs
   dans la poussière). */
{const dnB=function(b,o){return bioMet(BIOMES[b],o);};
 BIOMES.dunesMatin=dnB('canyonMatin',{nm:'DUNES · MATIN',jZen:[.08,.27,.66],jMid:[.34,.48,.78],jHor:[.98,.70,.58],jSol:[.7,.38,.20],
   fog:[.94,.72,.62],fogN:600,fogF:7800,fogCj:[1,.78,.60],fogIn:[.96,.86,.82],hemiS:[.40,.52,.86],hemiG:[.72,.46,.34],hemiI:.58,sunC:[1,.74,.48],sunI:1.6,fillC:[.38,.48,.90],fillI:.26,
   env:[[0,'#4E8FDA'],[.3,'#A9B2DA'],[.48,'#F8D6BC'],[.58,'#FFE2C4'],[.66,'#E2A27E'],[1,'#9A5A3E']],
   cyZ:[.08,.27,.66],cyM:[.34,.48,.78],cyH:[.98,.70,.58],cyS:[1,.68,.44],cyB:[.90,.50,.64],cyC:[1,.82,.74],cyD:[.46,.42,.60],cyR:[.94,.64,.54],
   cyK:[.12,.45,0,0],cyN:[.9,.9,1.3,0],cyA:[10,68,0,0],
   dnA:[1,.64,.40],dnB:[.94,.42,.30],dnL:[1,.80,.62],dnS:[.56,.58,1.04],dnC:[.98,.88,.84],dnV:[.17,.34,.11],dnH:[.98,.76,.68],dnQ:[.30,.20,0,.6],dnK:[.55,1,.25,1],dnW:[.14,.64,.66],dnX:[.03,.24,.36]});
 BIOMES.dunesMidi=dnB('canyonMidi',{nm:'DUNES · MIDI',jZen:[.02,.20,.66],jMid:[.12,.48,.86],jHor:[.92,.80,.62],jSol:[.36,.30,.18],
   fog:[.90,.80,.64],fogN:900,fogF:9800,fogCj:[1,.86,.64],fogIn:[.96,.92,.84],hemiS:[.40,.62,1.0],hemiG:[.82,.56,.36],hemiI:.52,sunC:[1,.94,.82],sunI:1.35,fillC:[.44,.62,.95],fillI:.18,
   env:[[0,'#2F86E0'],[.3,'#6CC2EE'],[.48,'#E6E2D6'],[.58,'#FFF6E6'],[.66,'#EAB27E'],[1,'#A8643C']],
   cyZ:[.02,.20,.66],cyM:[.12,.48,.86],cyH:[.92,.80,.62],cyS:[1,.95,.86],cyB:[.72,.70,.78],cyC:[1,1,.98],cyD:[.56,.64,.78],cyR:[.94,.72,.52],
   cyK:[.36,.34,0,0],cyN:[0,.6,1.8,0],cyA:[50,205,0,0],
   dnA:[.86,.64,.40],dnB:[.80,.44,.26],dnL:[.98,.84,.62],dnS:[.50,.52,.94],dnC:[1,.94,.86],dnV:[.14,.34,.09],dnH:[.96,.86,.68],dnQ:[.22,1,0,1],dnK:[.45,1,.2,.62],dnW:[.10,.72,.70],dnX:[.02,.30,.40]});
 BIOMES.dunesSoir=dnB('canyonSoir',{nm:'DUNES · SOIR',jZen:[.08,.10,.40],jMid:[.50,.30,.46],jHor:[1,.48,.22],jSol:[1,.44,.14],
   fog:[.96,.52,.30],fogN:700,fogF:8200,fogCj:[1,.60,.32],fogIn:[1,.82,.70],hemiS:[.42,.40,.76],hemiG:[.64,.30,.16],hemiI:.62,sunC:[1,.46,.18],sunI:1.7,fillC:[.42,.44,.95],fillI:.36,
   env:[[0,'#4A4FA6'],[.3,'#B0749A'],[.48,'#FFB27E'],[.58,'#FFC88C'],[.66,'#E0663A'],[1,'#74301C']],
   cyZ:[.08,.10,.40],cyM:[.50,.30,.46],cyH:[1,.48,.22],cyS:[1,.44,.14],cyB:[.82,.42,.56],cyC:[1,.56,.32],cyD:[.32,.22,.38],cyR:[.72,.36,.30],
   cyK:[.10,.65,0,0],cyN:[.6,1.3,1.25,0],cyA:[5,-104,0,0],
   dnA:[1,.56,.26],dnB:[.92,.38,.20],dnL:[1,.76,.48],dnS:[.50,.44,1.0],dnC:[1,.80,.66],dnV:[.17,.30,.09],dnH:[1,.58,.36],dnQ:[.32,.40,0,.85],dnK:[.65,1,.30,1],dnW:[.16,.48,.56],dnX:[.03,.14,.26]});
 BIOMES.dunesNuit=dnB('canyonNuit',{nm:'DUNES · NUIT',cyA:[34,150,0,0],cyR:[.10,.09,.20], /* (MESURÉ à la photo : un sable clair sous la lune sortait blanc rosé comme de la neige — le sable de nuit est sombre, la crête argentée) */
   dnA:[.40,.34,.36],dnB:[.34,.27,.30],dnL:[.62,.66,.86],dnS:[.50,.56,1.15],dnC:[.55,.56,.66],dnV:[.10,.20,.14],dnH:[.10,.10,.24],dnQ:[.25,0,0,.4],dnK:[.7,1,.3,1],dnW:[.04,.10,.16],dnX:[.01,.03,.06]});
 BIOMES.dunesVent=dnB('canyonMidi',{nm:'DUNES · VENT DE SABLE',jZen:[.24,.30,.42],jMid:[.56,.48,.40],jHor:[.88,.66,.44],jSol:[.5,.36,.2],
   fog:[.80,.60,.40],fogN:140,fogF:2800,fogCj:[.92,.70,.46],fogIn:[.88,.70,.52],hemiS:[.62,.58,.62],hemiG:[.62,.44,.30],hemiI:.78,sunC:[1,.80,.58],sunI:.95,fillC:[.50,.50,.62],fillI:.2,
   env:[[0,'#7A7E8C'],[.3,'#A69A88'],[.48,'#D8B48A'],[.58,'#E6C49A'],[.66,'#B8865A'],[1,'#6A4428']],
   cyZ:[.24,.30,.42],cyM:[.56,.48,.40],cyH:[.88,.66,.44],cyS:[1,.78,.52],cyB:[0,0,0],cyC:[.96,.74,.48],cyD:[.58,.40,.26],cyR:[.80,.58,.40],
   cyK:[0,0,0,0],cyN:[0,1.1,.7,.55],cyA:[42,160,0,0],
   dnA:[.98,.64,.34],dnB:[.90,.46,.24],dnL:[1,.80,.58],dnS:[.70,.66,.90],dnC:[.94,.86,.76],dnV:[.22,.40,.14],dnH:[.86,.64,.42],dnQ:[.85,0,.6,.15],dnK:[.35,.7,.35,1],dnW:[.30,.40,.36],dnX:[.10,.14,.14]});
 BIOMES.dunesTempete=dnB('canyonOrage',{nm:'DUNES · TEMPÊTE DE SABLE',jZen:[.10,.06,.05],jMid:[.30,.16,.09],jHor:[.58,.32,.16],jSol:[0,0,0],
   fog:[.34,.19,.10],fogN:70,fogF:1300,fogCj:[.46,.26,.13],fogIn:[.42,.25,.15],hemiS:[.46,.34,.30],hemiG:[.30,.18,.09],hemiI:.55,sunC:[1,.60,.34],sunI:.55,fillC:[.48,.38,.50],fillI:.24,
   env:[[0,'#3A2A22'],[.3,'#5A3E2C'],[.48,'#8A5C38'],[.58,'#9A6A40'],[.66,'#5A3A24'],[1,'#20140C']],
   cyZ:[.10,.06,.05],cyM:[.30,.16,.09],cyH:[.58,.32,.16],cyS:[.9,.5,.25],cyB:[0,0,0],cyC:[.66,.38,.18],cyD:[.24,.12,.06],cyR:[.40,.22,.11],
   cyK:[0,0,0,0],cyN:[0,.8,.3,.9],cyA:[36,170,0,0],
   dnA:[.62,.38,.22],dnB:[.52,.28,.15],dnL:[.70,.48,.32],dnS:[.62,.56,.86],dnC:[.62,.52,.44],dnV:[.16,.28,.10],dnH:[.40,.23,.12],dnQ:[1,0,1,0],dnK:[.3,.5,.4,1],dnW:[.18,.20,.18],dnX:[.06,.06,.05]});
 Object.assign(I18N,{"LES DUNES D'OR":'THE GOLDEN DUNES','DE CRETE EN CRETE':'FROM CREST TO CREST','VENT DE SABLE':'DUST WIND','TEMPETE DE SABLE':'SANDSTORM',
   'LE VENT SE LEVE':'THE WIND RISES','LA LUNE ARGENTE LE SABLE':'THE MOON SILVERS THE SAND','ENSEVELI DANS LE SABLE':'BURIED IN THE SAND',"AU FOND DE L'OASIS":'AT THE BOTTOM OF THE OASIS',
   "CONTRE L'OBELISQUE":'SMASHED INTO THE OBELISK','CONTRE LA PYRAMIDE':'SMASHED INTO THE PYRAMID'});
}
// L'ORBITE — le soleil a ses heures aussi : doré au lever sur le bord de la Terre, rouge au couchant (le noir et la Terre ne changent pas)
/* LA FORÊT NOIRE — SES SIX TEMPS (2026-10-14, Sacha : « regarde que toutes les heures et les météos sont bien comprises »). Écrites d'après la
   CHARTE (pilotage-notes, chantiers/gfx/CHARTE.md) : ciel d'altitude (jour:1), jZen/jMid/jHor/jSol et fog en LINÉAIRE, sat ≤ 1,03 de jour (× DA 1,08
   × 1,12 ≤ 1,25), ≤ 1,07 le soir, ≤ .95 la nuit, la pluie et l'orage ; con ≤ 1,24 ; brume = la couleur de l'horizon, mêlée au vert du sous-bois ;
   vignette = l'ombre de la scène en plus sombre. Identité de la map : des VERTS NATURELS (ni fluo, ni sarcelle), l'OR de la lumière, la BRUME.
   La lumière de la forêt elle-même (hauteur du soleil, rayons, brume du fond, papillons, hantise) est dans FOR_MET ; ici : le ciel, l'air, les
   lumières de la caisse. La nuit, la lune du dôme s'éteint (moon:0) : la forêt pose la sienne, pleine et énorme (foretLuneTick). */
BIOMES.foretMatin=bioMet(BIOMES.matin,{nm:'FORÊT · MATIN',jZen:[.11,.35,.72],jMid:[.38,.55,.72],jHor:[.83,.72,.52],jSol:[.62,.40,.20],sunTint:[1,.88,.68],moon:0,
  fogN:90,fogF:2300,fogCj:[.95,.86,.66],fogIn:[.86,.88,.80],hemiS:[.62,.72,.92],hemiG:[.30,.36,.22],hemiI:.75,sunC:[1,.88,.68],sunI:1.45,fillC:[.45,.56,.80],fillI:.22,
  expo:.97,con:1.16,rtK:.75,sh:[0,.008,.03],hi:[.012,.006,-.008],vigK:.22,vigC:[.03,.045,.05],bloomS:.42,bloomT:.93,
  env:[[0,'#5E9FDD'],[.3,'#9CC4D6'],[.48,'#E8DCC0'],[.58,'#F2E6CC'],[.66,'#6E7A5A'],[1,'#2E3A26']],eS1:[255,236,200,.44],eS2:[170,210,235,.28]});
BIOMES.foretMidi=bioMet(BIOMES.midi,{nm:'FORÊT · MIDI',jZen:[.05,.28,.74],jMid:[.21,.48,.82],jHor:[.62,.81,.93],jSol:[.30,.28,.20],sunTint:[1,.97,.90],sunHalo:.55,
  fogN:140,fogF:2700,fogCj:[.92,.93,.86],fogIn:[.86,.92,.90],hemiS:[.68,.80,.98],hemiG:[.32,.42,.22],hemiI:.78,sunI:1.6,fillC:[.48,.64,.90],fillI:.2,
  expo:.98,con:1.18,rtK:.85,sh:[0,.008,.03],hi:[.01,.006,-.006],vigK:.2,vigC:[.03,.045,.05],bloomS:.42,
  env:[[0,'#3F8FE0'],[.3,'#7FB8EA'],[.48,'#D8ECF2'],[.58,'#FFFFFF'],[.66,'#6E8A5E'],[1,'#2A3A24']],eS2:[150,205,250,.3]});
BIOMES.foretSoir=bioMet(BIOMES.nuagesSoir,{nm:'FORÊT · SOIR',jZen:[.10,.115,.39],jMid:[.46,.30,.32],jHor:[1,.49,.25],jSol:[1,.50,.20],sunTint:[1,.62,.38],sunHalo:1,stars:.15,moon:0,
  fog:[.92,.50,.28],fogN:100,fogF:2200,fogCj:[1,.72,.48],fogIn:[1,.88,.78],hemiS:[.52,.50,.70],hemiG:[.30,.24,.16],sunC:[1,.68,.42],fillC:[.42,.40,.66],fillI:.2,
  expo:.94,con:1.2,rtK:.9,sh:[0,.004,.02],hi:[.02,.008,-.01],vigK:.26,vigC:[.06,.04,.05],bloomT:.92,
  env:[[0,'#3C4C8C'],[.3,'#8C7CAA'],[.48,'#FFB98A'],[.58,'#FFD6A8'],[.66,'#5A4A3A'],[1,'#2A2018']],eS1:[255,190,130,.5],eS2:[150,140,210,.28]});
BIOMES.foretNuit=bioMet(BIOMES.nuagesNuit,{nm:'FORÊT · NUIT',jZen:[.006,.010,.040],jMid:[.010,.018,.060],jHor:[.03,.05,.09],jSol:[0,0,0],stars:1.1,moon:0,
  fog:[.08,.11,.13],fogN:40,fogF:1150,fogCj:[.22,.28,.36],fogIn:[.22,.26,.30],hemiS:[.30,.38,.55],hemiG:[.04,.06,.07],sunC:[.62,.74,.95],sunI:.7,fillC:[.30,.40,.60],fillI:.2,
  expo:.95,sat:.92,con:1.16,sh:[0,.006,.025],vigK:.4,vigC:[.01,.02,.03],bloomS:.5,bloomT:.9,
  env:[[0,'#04060f'],[.3,'#0a1430'],[.48,'#24345e'],[.58,'#4a5a88'],[.66,'#0c1416'],[1,'#05080a']],eS2:[90,120,150,.28]});
BIOMES.foretPluie=bioMet(BIOMES.nuagesPluie,{nm:'FORÊT · PLUIE',jZen:[.155,.21,.30],jMid:[.27,.33,.43],jHor:[.40,.47,.56],jSol:[0,0,0],
  fog:[.27,.32,.30],fogN:70,fogF:1250,fogCj:[.40,.44,.44],fogIn:[.44,.48,.48],hemiS:[.58,.66,.72],hemiG:[.24,.30,.26],hemiI:.8,sunC:[.82,.88,.90],sunI:.65,fillC:[.45,.55,.62],fillI:.22,
  expo:.95,sat:.9,con:1.12,rtK:.8,sh:[0,.01,.022],vigK:.3,vigC:[.04,.05,.05],bloomS:.44,
  env:[[0,'#3a4450'],[.3,'#5a646e'],[.48,'#8a9298'],[.58,'#9aa2a6'],[.66,'#4a5650'],[1,'#262e2a']],eS1:[200,214,226,.3],eS2:[150,170,186,.25]});
BIOMES.foretOrage=bioMet(BIOMES.tempete,{nm:'FORÊT · ORAGE',jour:1,jZen:[.013,.020,.051],jMid:[.035,.05,.10],jHor:[.068,.093,.162],sunTint:[.7,.75,.9],
  fog:[.10,.12,.13],fogN:50,fogF:1000,fogCj:[.24,.29,.31],fogIn:[.28,.32,.33],hemiS:[.36,.42,.50],hemiG:[.07,.09,.09],hemiI:.52,sunC:[.62,.70,.82],sunI:.5,fillC:[.30,.40,.52],fillI:.26,kickI:.18,
  expo:.9,sat:.9,con:1.18,rtK:.85,sh:[0,.01,.02],hi:[0,0,0],daCon:.4,daExpo:1.1,vigK:.45,vigC:[.015,.02,.025],bloomS:.5,bloomT:.92});
/* LA BANQUISE — SES SIX TEMPS (2026-10-14, Sacha : « fais une map absolument magnifique »). Écrites d'après la CHARTE (jour:1, couleurs du ciel et
   brume en LINÉAIRE, sat ≤ 1,03 de jour, ≤ 1,07 le soir, ≤ ,95 la nuit, la neige et le blizzard ; con ≤ 1,24). Identité de la map : le BLEU
   PROFOND du ciel d'altitude contre la neige, des OMBRES BLEUES (jamais grises), la glace TURQUOISE, le rose de l'alpenglow aux heures
   basses, le vert des aurores la nuit ; la neige et le blizzard tirent vers le LAVANDE (jamais le gris délavé). La lumière de la banquise
   elle-même (hauteur du soleil, étincelles, alpenglow, aurores, brume de vallée, neige qui tombe) est dans BK_MET ; ici : le ciel, l'air,
   les lumières de la caisse. La nuit, la lune du dôme reste (moon) et les AURORES se lèvent (banqTick). */
BIOMES.banqMatin=bioMet(BIOMES.matin,{nm:'GLACIER · MATIN',jZen:[.07,.20,.58],jMid:[.42,.42,.76],jHor:[1,.58,.50],jSol:[.92,.70,.72],sunTint:[1,.80,.66],sunHalo:1,moon:0,
  fog:[.74,.58,.72],fogN:220,fogF:4200,fogCj:[1,.80,.70],fogIn:[.80,.82,.96],hemiS:[.56,.64,.98],hemiG:[.62,.52,.66],hemiI:.72,sunC:[1,.82,.68],fillC:[.48,.52,.92],fillI:.22,
  expo:.95,con:1.18,rtK:.8,sh:[0,.01,.045],hi:[.014,.004,-.004],vigK:.2,vigC:[.04,.04,.09],bloomS:.48,bloomT:.92,
  env:[[0,'#3A62C8'],[.3,'#8C8EC8'],[.48,'#FFC2B0'],[.58,'#FFE2D2'],[.66,'#C8B8D8'],[1,'#8890B8']],eS1:[255,214,190,.46],eS2:[160,180,255,.3]});
BIOMES.banqMidi=bioMet(BIOMES.midi,{nm:'GLACIER · MIDI',jZen:[.012,.14,.62],jMid:[.10,.40,.88],jHor:[.95,.62,.48],jSol:[.62,.66,.88],sunTint:[1,.93,.84],sunHalo:.7,
  fog:[.52,.64,.90],fogN:260,fogF:5200,fogCj:[.98,.86,.78],fogIn:[.80,.86,1],hemiS:[.56,.70,1],hemiG:[.58,.62,.78],hemiI:.80,sunC:[1,.94,.86],sunI:1.6,fillC:[.46,.62,1],fillI:.24,
  expo:.93,rtK:.85,sh:[0,.012,.05],hi:[.01,.005,-.004],vigK:.18,vigC:[.02,.04,.09],bloomS:.5,bloomT:.9,
  env:[[0,'#1E5ED8'],[.3,'#5C9AF0'],[.48,'#CFE6FA'],[.58,'#FFFFFF'],[.66,'#C8D8F0'],[1,'#90A8D0']],eS1:[255,255,250,.48],eS2:[150,200,255,.32]});
BIOMES.banqSoir=bioMet(BIOMES.nuagesSoir,{nm:'GLACIER · SOIR',jZen:[.06,.07,.30],jMid:[.50,.27,.46],jHor:[1,.46,.30],jSol:[.92,.48,.46],sunTint:[1,.56,.36],sunHalo:1.1,stars:.2,moon:0,
  fog:[.74,.44,.54],fogN:200,fogF:3900,fogCj:[1,.62,.44],fogIn:[.82,.64,.78],hemiS:[.46,.42,.78],hemiG:[.52,.34,.44],hemiI:.6,sunC:[1,.60,.42],sunI:1.6,fillC:[.40,.36,.78],
  expo:.94,con:1.2,rtK:.9,sh:[0,.004,.035],hi:[.02,.006,-.01],vigK:.26,vigC:[.07,.03,.09],bloomS:.5,bloomT:.9,
  env:[[0,'#2A2C78'],[.3,'#8A5A9A'],[.48,'#FF9A78'],[.58,'#FFC69A'],[.66,'#B87890'],[1,'#5A4870']],eS1:[255,170,120,.5],eS2:[150,130,230,.3]});
BIOMES.banqNuit=bioMet(BIOMES.nuagesNuit,{nm:'GLACIER · NUIT',jZen:[.003,.008,.035],jMid:[.008,.022,.065],jHor:[.025,.07,.11],jSol:[.02,.05,.07],sunTint:[.6,.75,1],stars:1.35,moon:1.15,
  fog:[.035,.04,.10],fogN:120,fogF:2800,fogCj:[.14,.32,.30],fogIn:[.10,.22,.26],hemiS:[.28,.46,.70],hemiG:[.10,.18,.24],hemiI:.55,sunC:[.55,.72,1],fillC:[.22,.60,.48],fillI:.26,
  expo:.96,sat:.95,con:1.16,sh:[0,.008,.03],vigK:.38,vigC:[.005,.02,.03],bloomS:.56,bloomT:.88,
  env:[[0,'#02060e'],[.3,'#082036'],[.48,'#1E5A5A'],[.58,'#3E7A88'],[.66,'#0E1E2A'],[1,'#06101a']],eS1:[140,255,190,.36],eS2:[170,120,255,.28]});
BIOMES.banqNeige=bioMet(BIOMES.nuagesPluie,{nm:'GLACIER · NEIGE',jZen:[.30,.34,.52],jMid:[.46,.50,.70],jHor:[.66,.69,.88],jSol:[.62,.66,.84],sunTint:[.86,.88,1],sunHalo:.08,
  fog:[.54,.56,.82],fogN:60,fogF:1400,fogCj:[.74,.76,.92],fogIn:[.70,.74,.90],hemiS:[.74,.80,1],hemiG:[.58,.62,.78],hemiI:.95,sunC:[.84,.88,1],sunI:.55,fillC:[.55,.62,.92],fillI:.2,
  expo:.95,sat:.95,con:1.14,rtK:.8,sh:[0,.01,.04],vigK:.28,vigC:[.05,.05,.11],bloomT:.92,
  env:[[0,'#5A6290'],[.3,'#8088B0'],[.48,'#B0B6D6'],[.58,'#C8CCE6'],[.66,'#9AA0C6'],[1,'#7880A8']],eS1:[220,226,255,.32],eS2:[170,170,230,.26]});
BIOMES.banqBlizzard=bioMet(BIOMES.tempete,{nm:'GLACIER · BLIZZARD',jour:1,jZen:[.09,.11,.24],jMid:[.20,.24,.40],jHor:[.38,.42,.60],jSol:[.36,.40,.58],sunTint:[.8,.82,.95],
  fog:[.38,.40,.64],fogN:25,fogF:720,fogCj:[.50,.54,.72],fogIn:[.48,.52,.70],hemiS:[.58,.64,.88],hemiG:[.36,.40,.56],hemiI:.85,sunC:[.70,.76,.95],sunI:.45,fillC:[.45,.52,.85],fillI:.24,kickI:.14,
  expo:.94,sat:.92,con:1.15,rtK:.85,sh:[0,.01,.035],hi:[0,0,0],vigK:.42,vigC:[.03,.03,.08],bloomS:.48,bloomT:.92,
  env:[[0,'#2a3050'],[.3,'#485270'],[.48,'#7a84a8'],[.58,'#8e98ba'],[.66,'#5a6488'],[1,'#3a4262']],eS1:[200,210,255,.3],eS2:[140,150,220,.25]});
/* LE ROYAUME DE FEU — SES SIX TEMPS (2026-10-14, Sacha : « il faut une ambiance et des couleurs bien travaillées »). La grammaire de la forêt
   (ciel d'altitude jour:1, couleurs en LINÉAIRE, sat ≤ 1,03 de jour, ≤ 1,07 le soir, ≤ ,95 la nuit, la cendre et l'orage ; con ≤ 1,24).
   Identité : le NOIR du basalte, l'ORANGE de la lave — et un ciel qui change tout : l'aube rose et violette, le midi bleu soufré, le SOIR
   ROUGE SANG (la carte postale), la nuit sans autre lumière que la lave, la pluie de cendres brune, l'orage volcanique noir et violet.
   Le rebond du sol (hemiG) et le FILL par en dessous prennent le rouge de la lave : la caisse est éclairée PAR LE BAS. La lumière de la
   roche elle-même (hauteur du soleil, lueur des rives, panache, braises, cendre) est dans VLC_MET.
   Raccord à la bible DA (passation/DA-CARCASH.md) : le contre-jour ROSE (kick) à toutes les heures, le ciel froid contre la braise (deux
   températures), la vignette à l'encre bleu nuit, les bords de route néon rose ; l'accent propre de la map, c'est l'ORANGE de la lave. */
BIOMES.volcanMatin=bioMet(BIOMES.matin,{nm:'VOLCAN · MATIN',jZen:[.07,.08,.28],jMid:[.36,.24,.44],jHor:[1,.55,.42],jSol:[1,.56,.32],sunTint:[1,.74,.55],sunHalo:.9,stars:.1,moon:0,
  fog:[.36,.22,.30],fogN:220,fogF:2600,fogCj:[1,.64,.50],fogIn:[.56,.40,.46],hemiS:[.56,.50,.74],hemiG:[.36,.13,.08],hemiI:.66,sunC:[1,.72,.52],fillC:[.62,.24,.12],
  sat:1.03,con:1.18,rtK:.72,sh:[0,.004,.03],hi:[.016,.006,-.004],vigC:[.03,.035,.08],bloomS:.5,bloomT:.9,
  env:[[0,'#1c1a4a'],[.3,'#5a3a78'],[.48,'#ff9a78'],[.58,'#ffc49a'],[.66,'#3a1a16'],[1,'#140806']],eS1:[255,180,140,.45],eS2:[150,130,220,.28]});
BIOMES.volcanMidi=bioMet(BIOMES.midi,{nm:'VOLCAN · MIDI',jZen:[.06,.20,.56],jMid:[.30,.40,.60],jHor:[.86,.70,.46],jSol:[.52,.40,.24],sunTint:[1,.95,.84],sunHalo:.5,
  fog:[.40,.38,.41],fogN:200,fogF:3200,fogCj:[.94,.82,.62],fogIn:[.66,.62,.60],hemiS:[.64,.70,.88],hemiG:[.34,.16,.09],hemiI:.74,sunC:[1,.95,.86],sunI:1.7,fillC:[.55,.22,.10],fillI:.22,
  expo:.97,sat:1.02,rtK:.8,sh:[0,.006,.03],hi:[.012,.006,-.006],vigK:.22,vigC:[.03,.04,.08],bloomT:.92,
  env:[[0,'#2f62b8'],[.3,'#6c8cc0'],[.48,'#e8cfa0'],[.58,'#fff0d0'],[.66,'#3a2418'],[1,'#120a08']],eS1:[255,248,230,.46],eS2:[150,190,240,.3]});
BIOMES.volcanSoir=bioMet(BIOMES.nuagesSoir,{nm:'VOLCAN · SOIR',jZen:[.10,.025,.09],jMid:[.40,.06,.14],jHor:[1,.30,.07],jSol:[1,.40,.10],sunTint:[1,.45,.20],sunHalo:1.1,stars:.08,moon:0,
  fog:[.26,.07,.10],fogN:200,fogF:3000,fogCj:[.72,.24,.16],fogIn:[.55,.20,.20],hemiS:[.46,.34,.62],hemiG:[.42,.10,.04],hemiI:.6,sunC:[1,.50,.24],sunI:1.6,fillC:[.70,.20,.06],fillI:.26,kickI:.2,
  expo:.93,sat:1.07,con:1.22,rtK:.86,sh:[0,.002,.02],hi:[.02,.006,-.01],vigC:[.04,.025,.08],bloomS:.55,bloomT:.88,
  env:[[0,'#2a0818'],[.3,'#7a1a1a'],[.48,'#ff6a2a'],[.58,'#ffb060'],[.66,'#3a0c06'],[1,'#120404']],eS1:[255,150,90,.5],eS2:[200,80,90,.3]});
BIOMES.volcanNuit=bioMet(BIOMES.nuagesNuit,{nm:'VOLCAN · NUIT',jZen:[.010,.006,.032],jMid:[.04,.014,.06],jHor:[.22,.045,.03],jSol:[0,0,0],sunTint:[.6,.6,.9],stars:.45,moon:.35,
  fog:[.12,.03,.04],fogN:260,fogF:3200,fogCj:[.46,.12,.06],fogIn:[.34,.10,.09],hemiS:[.32,.24,.48],hemiG:[.40,.10,.04],hemiI:.72,sunC:[.55,.52,.78],sunI:.5,fillC:[.80,.22,.06],fillI:.34,kickI:.24,
  expo:.95,sat:.95,sh:[0,.004,.02],vigC:[.01,.012,.04],bloomS:.6,bloomT:.85,
  env:[[0,'#040208'],[.3,'#140810'],[.48,'#3a1010'],[.58,'#6a1c0c'],[.66,'#200604'],[1,'#0a0202']],eS1:[255,140,80,.4],eS2:[120,80,140,.25]});
BIOMES.volcanCendre=bioMet(BIOMES.nuagesPluie,{nm:'VOLCAN · CENDRES',jZen:[.10,.085,.08],jMid:[.20,.16,.14],jHor:[.38,.27,.20],jSol:[0,0,0],sunTint:[.9,.75,.6],sunHalo:.1,
  fog:[.25,.18,.15],fogN:50,fogF:1350,fogCj:[.42,.30,.24],fogIn:[.38,.31,.28],hemiS:[.50,.50,.64],hemiG:[.32,.14,.08],hemiI:.72,sunC:[.86,.72,.60],fillC:[.62,.24,.10],fillI:.24,
  expo:.95,sat:.92,con:1.14,rtK:.8,sh:[0,.004,.02],vigK:.32,vigC:[.03,.035,.07],bloomS:.52,bloomT:.88,
  env:[[0,'#2a2420'],[.3,'#4a3c34'],[.48,'#7a6250'],[.58,'#8a6c56'],[.66,'#2a1a12'],[1,'#120a06']],eS1:[220,190,160,.3],eS2:[150,120,110,.25]});
BIOMES.volcanOrage=bioMet(BIOMES.tempete,{nm:'VOLCAN · ORAGE',jour:1,jZen:[.014,.010,.03],jMid:[.04,.028,.06],jHor:[.15,.06,.06],sunTint:[.7,.65,.9],
  fog:[.09,.05,.06],fogN:50,fogF:1600,fogCj:[.30,.16,.16],fogIn:[.28,.18,.20],hemiS:[.34,.30,.46],hemiG:[.24,.07,.03],hemiI:.52,sunC:[.58,.56,.76],sunI:.5,fillC:[.70,.20,.07],fillI:.3,kickI:.2,
  expo:.9,sat:.92,con:1.18,rtK:.85,sh:[0,.006,.024],hi:[0,0,0],daCon:.4,daExpo:1.1,vigK:.46,vigC:[.012,.014,.04],bloomS:.56,bloomT:.88,
  env:[[0,'#0c0812'],[.3,'#1c1420'],[.48,'#3a2030'],[.58,'#5a2a2a'],[.66,'#1a0a08'],[1,'#080404']],eS1:[200,180,240,.3],eS2:[160,80,80,.25]});
BIOMES.espaceMatin=bioMet(BIOMES.espace,{nm:'ORBITE · LEVER',volSun:[1.5,1.2,1.0]});
BIOMES.espaceSoir=bioMet(BIOMES.espace,{nm:'ORBITE · COUCHANT',volSun:[1.6,.95,.8]});
grtBiomes();grtTextes(); // (2026-10-18) LES PROFONDEURS : une ambiance par salle et par temps, ses textes
