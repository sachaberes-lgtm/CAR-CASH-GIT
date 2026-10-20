/* ===================== LA CHUTE — LE MENU DANS LE CIEL (2026-09-30, Sacha, capture de Zelda : Tears of the Kingdom à l'appui) =====================
   « Au lieu d'être dans le garage, la voiture doit TOMBER DU CIEL, en face d'une route, dans le biome nuage, de très haut, à l'infini ; garde
   l'affichage et les boutons ; on la voit tomber sur la gauche, à la place de la voiture du garage, et sur la droite les boutons que j'ai faits. »
   · C'EST LE MODE « MENU » DE L'ATELIER, PEINT AILLEURS : tout le reste ne bouge pas (garageOn, #mHome par-dessus, garMode, les portes
     GARAGE / MISSIONS / BOUTIQUE qui ouvrent l'atelier sous leur volet). `garageRender` passe la main à `chuteRender` tant que l'atelier est
     en mode MENU (et pas MISSIONS) — l'atelier est caché, le monde du niveau 1 (la piste du menu, ses nuages, la mer, le ciel du JOUR des
     NUAGES `MENU_BIO`) est dessiné ; revenu à l'atelier (boutique, missions), `chuteSort` lui rend sa lumière, son reflet et ses sons.
   · LA PLACE : la caisse est posée là où l'interface laisse de la place (`menuCadre`, celui de la vitrine : la bande de GAUCHE couché, la
     bande entre le titre et les boutons debout) ; elle y garde la même taille quelle que soit la caisse (sa sphère englobante).
   · L'INFINI : la caisse ne descend pas — c'est l'AIR qui monte. Des bancs de nuage (sprites) montent autour d'elle et passent la caméra,
     des filets de vent (quads additifs, UN appel de dessin) filent vers le haut, SA traînée (celle de la boutique, `trailApercu`) monte
     derrière elle, la caisse tangue, roule, ses roues tournent, la vue balance lentement. De 190 m de haut, la route ne se rapproche
     pas à l'œil : c'est ce qu'on voit, vraiment, en chute libre.
   · LE PLAN (titre v3, 2026-10-01 — voir « L'ÉCRAN TITRE v3 » dans CLAUDE.md) : `chutePlan()` règle le REGARD sur le SOLEIL (dans le dos de
     la caméra, à droite : les nuages éclairés de face), la caisse très haut au-dessus du sommet de la piste, la piste derrière. Autour
     d'elle, les CUMULUS DU TITRE (`CHUTE_NU`) : de vrais nuages v8 posés à la main à trois profondeurs, qui montent.
   · JOUER (`chuteLance`) : elle PIQUE — le nez plonge, elle accélère vers la route, la caméra passe derrière elle, l'air rugit, le champ
     s'ouvre ; elle traverse un banc de nuage (le voile BLANC, `#chuteVoile`) et, sous le voile, la course démarre (même fin que le
     lâcher de l'atelier : closeGarage, puis start()/resetGame()).
   · COÛT : ~16 sprites + 1 maillage de filets + la traînée — les matières sont celles de l'atelier et de la traînée d'aperçu (zéro
     programme de plus mesuré au banc). Hooks : `dbgChute()` (état), `dbgChute({…})` (règle un paramètre de CHUTE_P), `?chute=0` (l'atelier
     comme avant).
   ⚠ `var` et pas `const` : updateContactShadow et cielHorsCourse, déclarées bien plus haut, lisent CHUTE — `var` vaut `undefined` avant
   cette ligne au lieu de lever une erreur (la zone morte d'un const planterait le tout premier rendu). */
var CHUTE={G:new THREE.Vector3(),nu:null,oA:0,oAc:0,oW:0,oP:0,oPc:0,mvT:0,tk:0,tSens:1,on:false,t:0,go:null,L:-1,s:0,C:new THREE.Vector3(),cam:new THREE.Vector3(),f:new THREE.Vector3(),fh:new THREE.Vector3(),lh:new THREE.Vector3(),
  q:new THREE.Quaternion(),m:new THREE.Matrix4(),v1:new THREE.Vector3(),v2:new THREE.Vector3(),v3:new THREE.Vector3(),w:null,fil:null,voile:null,bioPas:-1,vent:false,entree:0};
const CHUTE_OK=!/[?&]chute=0\b/.test(location.search);
const CHUTE_P={cielT:1,voiles:0,brumeT:2.2,elevP:.06,studio:1,amb:.55,sk:1.6,kh:.75,sc:.12,sb:0,sr:1.35,fige:null, /* (2026-10-03) LE MODELÉ DE LA CAISSE, choisi sur planche (banc studio.mjs, f1) : voir chuteStudio */cleC:0xfff1dc,rimC:0xbfe4ff,rim:1.1,rimS:0,lampe:1,az:2.35,cote:0,nuages:1,K:[1.02,1.08,1.1,1],R:[-.3,.5,.72,1],mzA:[1500,.8,9,.2],mzB:null,gite:-.45,coton:0,cle:.5,brume:1,expo:1,trainee:0,alt:900,avant:-1700,pitch:.62,roule:.12,cap:.28,elev:.015, /* (titre v3) voir « L'ÉCRAN TITRE v3 » : alt = au-dessus du SOMMET de la piste, az = l'angle regard ↔ soleil, cote = la piste décalée à droite de la caisse (couché), nuages = les cumulus du titre */ /* (niveau 1 v2) pitch .22 → .55, elev .22 → .30 : à plat, elle PLANAIT ; le nez piqué vers la mer, on la voit TOMBER */vit:14,echelle:1,taille:.82,sol:.3,sous:70,plancher:0,tour:75,sens:1,face:-.785,faceA:.21,vb:.8,cjF:1.2}; /* (2026-10-08, LE SENS DU TOUR) sens : +1 = le décor glisse vers la GAUCHE (mesuré : un point du décor à 1,7 km recule de 0,1 à 0,13 d'écran pour 0,1 rad de tour) — la caisse, nez à droite, a l'air d'AVANCER vers la droite : le sens de lecture (Maass & Russo 2003 : un mouvement de gauche à droite se lit « vers l'avant » chez qui lit de gauche à droite ; Chokron & De Agostini 2000 : on préfère les images orientées vers la droite), le travelling qui suit un sujet allant à droite, et vu d'en haut le sens des aiguilles d'une montre. Le doigt ne l'inverse plus. */ /* (2026-10-08, LA CAISSE EN DIAGONALE) face : l'angle (rad) d'où le regard la voit, autour d'elle — −0,785 (315°) = trois-quarts avant nez à droite : l'avant ET le flanc (phares, calandre, portières ; Léo : « plus diagonale, qu'on voie un peu l'avant et le profil » — choisi sur planche 295° → 345°) ; faceA : le balancement autour (±12°, un aller-retour par tour) ; face:null = la caisse fixe dans le monde, le tour passe par son dos */ /* (2026-10-07, LE TOUR SANS FIN) tour : secondes pour un tour complet du regard autour de la caisse (0 = la vue ne tourne que sous le doigt) */ // (2026-09-30, le JOUR D'ALTITUDE) de très haut au-dessus de TOUT le monde du niveau : les cumulus deviennent un champ de nuages sous la caisse, la mer à perte de vue ; plus de traînée orange ni de plancher peint ; brume repoussée, exposition et clé baissées (l'image sortait délavée) // (choisi aux captures : l'horizon et la mer de nuages dans l'image, le soleil de côté devant — sa lueur rose-or sur l'horizon)
window.dbgChute=function(o){if(o&&typeof o==='object'){if(o.orb!=null){CHUTE.oA=CHUTE.oAc=+o.orb||0;CHUTE.oW=0;CHUTE.tk=0;o=Object.assign({},o);delete o.orb;} /* (le tour sans fin, banc) orb : poser le regard à cet angle (rad) — avec tour:0 il y reste */if(o.NU&&CHUTE.nu){o.NU.forEach(function(d,i){const c=CHUTE.nu[i];if(!c||!d)return;c.a=d[0];c.b=d[1];c.r=d[2];c.v=d[4];c.y=d[5];c.m.scale.set(d[2],d[2],d[2]);const dd=Math.hypot(d[0],d[1]);c.lo=-(1.2*dd+1.3*d[2]);c.hi=.1*dd+1.3*d[2];c.off=false;});for(let i=o.NU.length;i<CHUTE.nu.length;i++)CHUTE.nu[i].off=true;o=Object.assign({},o);delete o.NU;} /* (banc) NU : rejouer la disposition des cumulus du titre sans recharger */
  Object.assign(CHUTE_P,o);CHUTE.L=-1;}
  return {titreCiel:+skyU.uTi.value.x,cadre:(function(){const c=menuCadre();return [+c.nx.toFixed(2),+c.ny.toFixed(2),+c.fr.toFixed(2),+c.fh.toFixed(2)];})(),ecran:(function(){const q=carGroup.position.clone().project(camera);return [+q.x.toFixed(2),+q.y.toFixed(2)];})(),orb:[+CHUTE.oA.toFixed(2),+CHUTE.oP.toFixed(2)],lum:CHUTE.lum9,tris:CHUTE.nu?CHUTE.nu.reduce(function(a,c){return a+(c.m.visible&&c.m.geometry.index?c.m.geometry.index.count/3:0);},0):0,nu:CHUTE.nu?CHUTE.nu.filter(function(c){return c.m.visible;}).length:0,mz:+skyU.uMzA.value.x,ciel:document.body.classList.contains('titreCiel'),on:CHUTE.on,go:!!CHUTE.go,s:Math.round(CHUTE.s),C:CHUTE.C.toArray().map(Math.round),cam:CHUTE.cam.toArray().map(function(x){return +x.toFixed(1);}),P:CHUTE_P,
    route:(function(){try{frameAt(CHUTE.s,F);const q=F.p.clone().project(camera);return [+q.x.toFixed(2),+q.y.toFixed(2),+q.z.toFixed(3)];}catch(e){return null;}})()};};
/* LES HEURES DU TITRE — ce que chaque heure règle à côté de son ambiance (BIOMES.titre…) : `P` = les clés de CHUTE_P (les cumulus du titre
   K/R, la mer de nuages mzT/mzO/mzH — rgb + part —, l'angle regard ↔ soleil az, les lampes de la caisse cleS/zenC/rimC/kh/sk/amb/sol/sc/sr
   — ⚠ banc : aux heures sombres, avec les doses du jour, la caisse n'était plus qu'une silhouette noire —, expo),
   `v` = les voiles de l'écran (rgb, haut, bas, bandeau des boutons), `t` = la teinte des bancs et des filets de vent qui montent.
   Une clé absente reprend la valeur d'origine (CHUTE_P0) : le MATIN est le titre v3 au bit près. */
const CHUTE_P0=JSON.parse(JSON.stringify(CHUTE_P));
const TITRE_MZ0=[0,0,0,0];
const TITRE_H={
  matin: {bio:'titreMatin', P:{az:1.8,K:[1.05,1.2,1.5,1.6],R:[-.4,.45,.85,1],mzT:TITRE_MZ0,mzO:TITRE_MZ0,mzH:TITRE_MZ0},v:['4,24,62',.30,.50,'6,28,60',.62],t:[1,1,1]},
  midi:  {bio:'titreMidi',  P:{az:1.8,K:[1.05,1.18,1.4,1.6],R:[-.4,.45,.85,1],mzT:TITRE_MZ0,mzO:[.62,.74,.90,.25],mzH:[1,1,1,.3],kh:.9},v:['2,30,80',.26,.46,'4,30,72',.6],t:[1,1,1]},
  aprem: {bio:'titreAprem', P:{az:1.75,K:[1.04,1.15,1.5,1.6],R:[-.38,.47,.8,1],mzT:TITRE_MZ0,mzO:[.55,.60,.78,.25],mzH:[1,.95,.86,.35],kh:.7},v:['10,30,66',.30,.50,'10,30,62',.62],t:[1,.97,.92]},
  golden:{bio:'titreGolden',P:{az:1.95,K:[1.05,1.3,1.8,1.6],R:[-.35,.42,.75,1],mzT:[.20,.20,.42,.55],mzO:[.30,.24,.44,.6],mzH:[1,.72,.46,.7],cleS:0xffd0a0,rimC:0xffb070,kh:.35,sk:2.1,amb:.75,sol:.9},v:['40,22,46',.30,.52,'34,18,40',.64],t:[1,.84,.70]},
  soir:  {bio:'titreSoir',  P:{K:[1,1.15,1.6,1.6],R:[-.3,.5,.72,1],mzT:[.10,.09,.24,.6],mzO:[.20,.17,.34,.6],mzH:[.85,.60,.70,.6],cleS:0xffc0cc,zenC:0xa8b8ff,rimC:0x9fb4ff,kh:.5,expo:.95,sk:2.3,amb:.85,sol:.9,sc:.3,sr:1.6},v:['20,10,40',.36,.56,'18,10,36',.66],t:[.85,.66,.78]},
  nuit:  {bio:'titreNuit',  P:{K:[.62,.72,1.3,1.4],R:[-.05,.65,.8,1],mzT:[.02,.03,.08,.9],mzO:[.07,.09,.18,.85],mzH:[.50,.58,.76,.85],cleS:0xb8ccff,zenC:0x8fa8ff,rimC:0x86a6ff,kh:.6,sk:2.5,amb:1,sol:1,sc:.35,sr:1.7},v:['2,6,20',.45,.65,'2,6,20',.7],t:[.34,.40,.58]}};
const TITRE_HEURES=['matin','midi','aprem','golden','soir','nuit'];
/* (titre v4) LA PALETTE DU CIEL DU TITRE, par heure — z zénith, m milieu, h horizon (aussi la brume des cumulus : les lointains s'y
   fondent), s lueur du soleil, mh/mo la mer de nuages au soleil/à l'ombre, c les cirrus, ca leur part, hz la distance de la brume. */
const TITRE_CIEL={
  matin: {tw:.9,ry:.3,cr:.38,z:[.10,.33,.70],m:[.36,.66,.90],h:[.86,.92,.95],s:[.50,.43,.31],mh:[1,.98,.95],mo:[.48,.62,.84],c:[.96,.97,.99],ca:.35,hz:1},
  midi:  {tw:.75,ry:.2,cr:.4,z:[.04,.24,.62],m:[.24,.56,.88],h:[.80,.89,.96],s:[.30,.29,.26],mh:[1.02,1.01,1],mo:[.46,.60,.86],c:[1,1,1],ca:.25,hz:1.1},
  aprem: {tw:1,ry:.4,cr:.38,z:[.12,.30,.62],m:[.44,.64,.84],h:[.95,.90,.82],s:[.50,.40,.28],mh:[1,.95,.88],mo:[.50,.55,.76],c:[1,.96,.92],ca:.4,hz:1},
  golden:{tw:1,ry:.7,cr:.34,z:[.12,.22,.50],m:[.56,.58,.74],h:[.96,.84,.70],s:[.42,.26,.12],mh:[1,.84,.66],mo:[.42,.42,.62],c:[1,.82,.66],ca:.5,hz:.9},
  soir:  {tw:1,ry:.45,cr:.36,z:[.04,.07,.22],m:[.20,.20,.44],h:[.66,.48,.56],s:[.28,.14,.15],mh:[.70,.58,.70],mo:[.18,.19,.36],c:[.88,.60,.66],ca:.45,hz:.85},
  nuit:  {tw:.85,ry:0,cr:.45,z:[.010,.016,.045],m:[.03,.05,.12],h:[.10,.14,.26],s:[.04,.06,.12],mh:[.34,.42,.62],mo:[.05,.07,.15],c:[.35,.42,.60],ca:.2,hz:.8}};
/* (2026-10-14, passe graphismes — ÉCRAN TITRE, les 6 heures) Retouche d'étalonnage PAR VALEURS (charte : signatures MATIN/MIDI/SOIR/NUIT, plus de violet-néon,
   sat ≤ 1,30, pas de cobalt, caisse mieux éclairée). Posée ICI, après les définitions de TITRE_CIEL/TITRE_H, donc APRÈS la copie de titreGolden/titreNuit par
   nuagesSoir/nuagesNuit (la course ne bouge pas). Couleurs de ciel/brume en LINÉAIRE. */
{
  const T2=function(h,o){const H=TITRE_H[h];if(o.ciel)Object.assign(TITRE_CIEL[h],o.ciel);if(o.amb)Object.assign(BIOMES[H.bio],o.amb);if(o.P)Object.assign(H.P,o.P);if(o.v)H.v=o.v;if(o.t)H.t=o.t;};
  // SOIR : zénith bleu-mauve doux → horizon pêche (plus de ciel magenta) ; mer de nuages rosé-prune éclairée pêche ; ombres prune désaturée
  T2('soir',{ciel:{z:[.14,.14,.42],m:[.50,.38,.50],h:[.95,.70,.58],s:[.50,.32,.22],mh:[.95,.70,.58],mo:[.30,.21,.25],c:[1,.72,.60]},
    amb:{jZen:[.14,.14,.42],jMid:[.50,.38,.50],jHor:[.95,.70,.58],jSol:[.95,.40,.18],sunTint:[1,.60,.40],fog:[.68,.54,.52],fogCj:[1,.60,.42],fogIn:[.80,.64,.62],hemiS:[.64,.56,.70],hemiG:[.30,.20,.20],sunC:[1,.70,.52],sat:1.05,con:1.12,vigC:[.05,.035,.07],vigK:.22,
      env:[[0,'#2e3470'],[.3,'#8a78a8'],[.48,'#e8907a'],[.58,'#ffb98a'],[.66,'#5a4a66'],[1,'#2a2438']],eS1:[255,185,138,.45],eS2:[150,150,200,.3]},
    P:{mzT:[.26,.18,.22,.6],mzO:[.30,.21,.25,.6],mzH:[.95,.70,.58,.6],cleS:0xffc8a8,zenC:0xb8b8ee,rimC:0xb0b4f0,amb:1,sol:1.1,sk:2.6,expo:.9,cjA:1.3,cjF:1.9},
    v:['34,28,56',.34,.54,'30,24,50',.64],t:[.78,.60,.54]});
  // GOLDEN : or/pêche pâle au lieu de lavande (mer gris-rosé chaud), ciel bleu doux en haut ; la caisse, mieux éclairée, se détache par sa teinte saturée sur un fond pâli
  T2('golden',{ciel:{z:[.09,.22,.54],m:[.36,.50,.74],h:[.98,.80,.60],s:[.46,.32,.18],mh:[1,.86,.66],mo:[.58,.47,.44],c:[1,.84,.66]},
    amb:{jZen:[.09,.22,.54],jMid:[.36,.50,.74],jHor:[.98,.80,.60],fog:[.92,.76,.64],hemiS:[.80,.76,.84],hemiG:[.50,.40,.34],sat:1.08,con:1.14,vigC:[.10,.06,.07],vigK:.2,
      env:[[0,'#2a3c78'],[.3,'#98909e'],[.48,'#ffb070'],[.58,'#ffd08a'],[.66,'#a08a88'],[1,'#605a6a']],eS1:[255,200,140,.5],eS2:[170,170,200,.25]},
    P:{mzT:[.30,.26,.30,.55],mzO:[.58,.47,.44,.6],mzH:[1,.84,.62,.7],amb:.9,sk:2.9,cjA:1.2,cjF:1.8},
    v:['36,28,40',.30,.48,'32,24,36',.58],t:[1,.88,.76]});
  // NUIT : signature #0B1230 → #1E2A52 (outremer saturé → bleu nuit calme), sat 0,9, mer de nuages sombre, cirrus effacés ; caisse lisible
  T2('nuit',{ciel:{z:[.004,.008,.04],m:[.009,.017,.065],h:[.03,.05,.13],s:[.03,.05,.10],mh:[.50,.58,.74],mo:[.045,.055,.10],c:[.22,.28,.42],ca:.12},
    amb:{jZen:[.004,.008,.04],jMid:[.009,.017,.065],jHor:[.03,.05,.13],fog:[.03,.04,.09],hemiS:[.32,.40,.62],sat:.9,con:1.12,vigC:[.005,.01,.03],vigK:.4},
    P:{mzT:[.015,.025,.06,.9],mzO:[.045,.055,.10,.85],mzH:[.52,.60,.78,.85],K:[.5,.58,1.05,1.2],amb:1.1,sk:3.3,cjA:1.2,cjF:1.8},
    v:['4,8,24',.45,.65,'4,8,24',.7]});
  // MIDI : plus de cobalt au coin haut-gauche (zénith #3F8FE0 max, horizon #CFE8F7), voile haut bleu clair, mer de nuages plus claire
  T2('midi',{ciel:{z:[.05,.26,.70],m:[.26,.58,.88],h:[.66,.82,.93],mo:[.62,.74,.90]},
    amb:{jZen:[.05,.26,.70],jHor:[.66,.82,.93],sat:1.12,con:1.2},P:{mzO:[.70,.80,.92,.25],amb:.75,sol:.7,sk:2.1},v:['40,84,150',.2,.34,'40,84,150',.5]});
  // MATIN : sa propre signature (or pâle bas, horizon pêche clair, brume rosée), léger — avant, identique au midi
  T2('matin',{ciel:{m:[.40,.64,.86],h:[.92,.80,.68],s:[.62,.46,.28],mo:[.50,.60,.82],mh:[1,.94,.86]},
    amb:{jHor:[.92,.80,.68],fog:[.88,.80,.78],sunC:[1,.90,.76],sat:1.14,con:1.14},P:{amb:.75,sol:.7,sk:2.1},v:['40,84,150',.24,.44,'40,84,150',.5]});
  // APRÈS-MIDI : mer de nuages crème chaud au lieu de lavande, bleu un peu plus profond en haut, sat 1,15
  T2('aprem',{ciel:{z:[.12,.32,.68],m:[.40,.62,.86],mo:[.74,.70,.72]},amb:{sat:1.15,con:1.15},P:{mzO:[.74,.70,.72,.25],amb:.75,sol:.7,sk:2.1,cjA:1.1,cjF:1.6},v:['40,70,120',.24,.42,'40,70,120',.5]});
}
function titreCiel(on){const U=skyU,T=TITRE_CIEL[TITRE_HF.h]||TITRE_CIEL.matin;U.uTi.value.set(on?1:0,T.ca,0,T.hz);U.uTi2.value.set(T.tw||0,T.ry||0,T.cr||.35,0);if(!on)return T;
  U.uTZen.value.fromArray(T.z);U.uTMid.value.fromArray(T.m);U.uTHor.value.fromArray(T.h);U.uTSol.value.fromArray(T.s);
  U.uTMerH.value.fromArray(T.mh);U.uTMerO.value.fromArray(T.mo);U.uTCir.value.fromArray(T.c);return T;}
/* LE FOND PEINT DE LA MER DE NUAGES (2026-10-18, Léo : « travaille le fond, comme pour le menu ; là c'est un peu bleu ; sois un peintre réaliste
   expressionniste et designer digital »). En course, le ciel d'altitude (cielJour : jZen/jMid/jHor) faisait un aplat d'azur électrique : on y
   ALLUME la couche peinte du menu (`cielTitre` : dégradé sans palier, l'air épais sur l'horizon, la lueur et les rayons du soleil, les cirrus au
   vent, la mer de nuages aux ombres portées et sa perspective aérienne) avec SA palette par heure — le réalisme de l'air (le bleu s'éteint vers
   l'horizon dans une brume chaude, les lointains s'y noient), l'expression du peintre (l'or du soleil contre les ombres bleues de la mer,
   un zénith profond mais rabattu, jamais cobalt) — et la BRUME des cumulus prend la couleur de cet horizon (sinon les lointains se découpent).
   Que des uniforms (le même programme du ciel) : 0 compilé. La nuit (clair de lune), la pluie et l'orage gardent leur ciel. `dbgNuFond(0|1)`. */
const NU_FOND={ // z zénith, m milieu, h horizon (et la brume), s lueur du soleil, mh/mo la mer au soleil/à l'ombre, c les cirrus, ca leur part, hz la distance de l'air, tw/ry/cr les rayons
  matin:{tw:.9,ry:.4,cr:.38,z:[.22,.27,.50],m:[.62,.64,.76],h:[1,.88,.76],s:[.74,.48,.26],mh:[1,.92,.82],mo:[.40,.47,.70],c:[1,.94,.88],ca:.42,hz:.75,sat:1.04,con:1.14},
  midi: {tw:.75,ry:.25,cr:.4,z:[.19,.27,.52],m:[.56,.65,.82],h:[.97,.93,.86],s:[.60,.48,.32],mh:[1.02,1,.96],mo:[.46,.55,.76],c:[1,1,1],ca:.36,hz:.8,sat:1.04,con:1.14},
  soir: {tw:1,ry:.75,cr:.34,z:[.12,.16,.40],m:[.56,.48,.60],h:[1,.76,.56],s:[.64,.34,.14],mh:[1,.82,.62],mo:[.40,.34,.52],c:[1,.80,.64],ca:.5,hz:.8,sat:1.22},
  /* nuit : PAS de fond peint — la couche du menu la noircissait (le CLAIR DE LUNE bleu-violet de Sacha, 14/10, reste) */};
const NUF={k:0,on:false,T:null,force:null,av:{},ap:{}};
for(const m9 in NU_FOND){const S9=SF_CARTES&&SF_CARTES.nuages&&SF_CARTES.nuages.m[m9],B9=S9&&BIOMES[S9.bio],P9=NU_FOND[m9];if(!B9)continue; // la brume des cumulus = l'horizon peint ; l'étalonnage rabattu (le bleu électrique venait AUSSI de là : sat 1,14 · con 1,24)
  NUF.av[m9]={fog:B9.fog.slice(),sat:B9.sat,con:B9.con};B9.fog=P9.h.slice();(NUF.ap0=NUF.ap0||{})[m9]=P9.h.slice();if(P9.sat)B9.sat=P9.sat;if(P9.con)B9.con=P9.con;NUF.ap[m9]={fog:B9.fog.slice(),sat:B9.sat,con:B9.con};}
/* LE CIEL D'ARC (2026-10-19, essai — Léo : « le ciel dans ARC Raiders est hyper bien fait ; prends les images pour faire un fond plus réaliste
   encore ; les nuages devant, c'était mieux l'avant-dernière version, avec les cubes, joue plus la transparence »). Les images d'ARC Raiders
   sont à Embark (protégées) : on garde leur LEÇON — un ciel naturel, un bleu profond qui pâlit dans une brume claire, de vrais nuages, l'air
   épais sur l'horizon — avec de VRAIES photos libres (Poly Haven, CC0 : kloppenheim_06, wasteland_clouds, belfast_sunset ; assets/ciel/,
   la moitié haute en 4096 × 1024). Au-dessus de l'horizon : la PHOTO (passe nette, pleine résolution), son soleil calé sur celui du jeu.
   En dessous : la MER DE CUMULUS (merArc) — un vrai pont de nuages éclairé par notre soleil, qui rejoint l'horizon de la photo. La brume
   des cumulus du décor prend la couleur de cet horizon. Les nuages devant : le vitrail MOYEN en VERRE (NV_DOSES.verre). La nuit, la pluie,
   l'orage : inchangés. ?arc=0 = le main d'avant ; dbgCielArc() l'état, dbgCielArc(0|1) A/B sur la même image. */
const CIEL_ARC={ // f la photo · su/se son soleil (colonne 0-1, hauteur en degrés) · ex l'exposition · mh/mo la mer au soleil / à l'ombre · s le liseré · h l'horizon (la brume des cumulus)
  matin:{f:'ciel-matin.jpg',su:.612,se:5,ex:.8,ns:0,mi:0,mh:[1,.89,.76],mo:[.44,.52,.70],s:[.85,.55,.30],h:[.74,.72,.72]},
  midi: {f:'ciel-midi.jpg', su:.603,se:7.5,ex:.8,ns:0,mi:0,mh:[1,.98,.94],mo:[.48,.58,.76],s:[.65,.55,.38],h:[.74,.77,.80]},
  soir: {f:'ciel-soir.jpg', su:.665,se:3,ex:.9,ns:1,mi:0,mh:[1,.80,.68],mo:[.40,.39,.55],s:[.95,.52,.26],h:[.64,.58,.58]}};
const CARC={tex:{},mer:null,force:null};
function cielArcTex(f){let t=CARC.tex[f];if(t)return t.pret?t:null;
  t=CARC.tex[f]=new THREE.Texture();t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=true;t.anisotropy=4;t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;
  const im=new Image();im.onload=function(){t.image=im;t.needsUpdate=true;t.pret=true;};im.src='assets/ciel/'+f;return null;}
function cielArcMer(){if(CARC.mer)return CARC.mer.pret?CARC.mer:null;const t=CARC.mer=new THREE.Texture();t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.premultiplyAlpha=false;const im=new Image();im.onload=function(){t.image=im;t.needsUpdate=true;t.pret=true;};im.src='assets/ciel/mer-cumulus.png';return null;}
if(ARC_ON){cielArcMer();for(const m9 in CIEL_ARC){cielArcTex(CIEL_ARC[m9].f); // chargées dès le départ (≈ 1 Mo en tout) ; la brume des cumulus = l'horizon de la photo
  const S9=SF_CARTES&&SF_CARTES.nuages&&SF_CARTES.nuages.m[m9],B9=S9&&BIOMES[S9.bio];if(B9&&NUF.ap[m9]){B9.fog=CIEL_ARC[m9].h.slice();NUF.ap[m9].fog=B9.fog.slice();}}}
/* (2026-10-20, Léo : « enlever en général le tapis complètement rempli de nuages, l'harmoniser avec la répartition des nuages du premier plan selon la météo ») LE TAPIS CLAIRSEMÉ :
   la mer de cumulus ne couvre plus tout le dessous — des ÎLOTS (la couverture TAPIS_M : plus c'est haut, moins il y en a), l'air de l'horizon entre eux ; plus dense là où
   le premier plan l'est (l'orage). `?tapis=0` = le tapis plein d'avant, `?tapis=.5` pour essayer. */
const TAPIS=(function(){const m=/[?&]tapis=([0-9.]+)/.exec(location.search);return m?+m[1]:1;})(),TAPIS_M={matin:.60,midi:.56,aprem:.52,soir:.54,nuit:.50,orage:.34};
function tapisPose(m){skyU.uTapis.value=TAPIS?(TAPIS_M[m]||.55)*Math.min(1,TAPIS):0;}
function cielArcPose(m,k){tapisPose(m);const U=skyU,A=CIEL_ARC[m],on=ARC_ON&&CARC.force!==0&&A&&k>.001,tp=on&&cielArcTex(A.f),tm=on&&cielArcMer();
  if(tp){U.uPhT.value=tp;U.uPh.value.set(k,A.su,A.se*Math.PI/180,A.ex);U.uPh2.value.y=A.ns||0;}else U.uPh.value.x=0;
  if(tm&&!A.mi){U.uMrT.value=tm;U.uMr.value.x=1;U.uTMerH.value.fromArray(A.mh);U.uTMerO.value.fromArray(A.mo);U.uTSol.value.fromArray(A.s);for(let i=0;i<3;i++)N8_U.uLav.value.setComponent(i,[.72,.78,.97][i]*.5+Math.min(.97,A.mo[i]*1.4)*.5);}else U.uMr.value.x=0;} /* (2026-10-20, Léo : « les nuages du premier plan et l'arrière-plan n'ont pas la même couleur ») l'ombre des cumulus en cubes prend à moitié celle du TAPIS (mo) : même famille de bleus / mauves, par météo */
function nuFondPose(P,k){const U=skyU;U.uTi.value.set(k,P.ca,0,P.hz);U.uTi2.value.set(P.tw||0,P.ry||0,P.cr||.35,0);
  U.uTZen.value.fromArray(P.z);U.uTMid.value.fromArray(P.m);U.uTHor.value.fromArray(P.h);U.uTSol.value.fromArray(P.s);U.uTMerH.value.fromArray(P.mh);U.uTMerO.value.fromArray(P.mo);U.uTCir.value.fromArray(P.c);}
function nuFondTick(dt){ // à chaque image : la mer de nuages en course → le fond peint (il APPARAÎT en 0,7 s au portail) ; ailleurs, éteint
  if(typeof CHUTE!=='undefined'&&CHUTE.on){skyU.uPh.value.x=0;skyU.uMr.value.x=0;tapisPose('menu');return;} // (le menu peint son ciel lui-même)
  const c=LVL&&LVL.cur,T=(NUF.force!==0)&&c&&c.carte==='nuages'&&!PARK.on?NU_FOND[c.meteo]:null;if(T)NUF.T=T;
  NUF.k+=((T?1:0)-NUF.k)*(NUF.force!=null?1:Math.min(1,dt*1.5));
  if(!T&&NUF.k<.002){if(NUF.on){skyU.uTi.value.x=0;NUF.on=false;}NUF.k=0;skyU.uPh.value.x=0;skyU.uMr.value.x=0;return;}
  if(NUF.T){nuFondPose(NUF.T,NUF.k);NUF.on=true;cielArcPose(c&&c.meteo,NUF.k);}}
window.dbgCielArc=function(k,o){if(k!==undefined)CARC.force=k==null?null:+k;o=o||{};const c=LVL&&LVL.cur,m9=c&&c.meteo; // (banc) A/B sur la même image : 0 = le main d avant (fond peint + mer peinte + fantômes), 1 = l essai
  if(k===0||k===1){const S9=SF_CARTES.nuages.m[m9],B9=S9&&BIOMES[S9.bio];if(B9&&CIEL_ARC[m9]&&NUF.av[m9]){B9.fog=(k===0?(NUF.ap0||{})[m9]||NUF.av[m9].fog:CIEL_ARC[m9].h).slice();bioGo(S9.bio,.01);bioStep(1);}
    const d9=k===0?'fantome':'verre';if(NV_DOSES[d9]&&o.nuages!==false)dbgNuVit(1,{dose:d9});}
  for(const q in o)if(CIEL_ARC[m9]&&q in CIEL_ARC[m9])CIEL_ARC[m9][q]=o[q];
  if(o.mr)skyU.uMr.value.set(skyU.uMr.value.x,o.mr[0],o.mr[1],o.mr[2]);if(o.mr2)skyU.uMr2.value.fromArray(o.mr2); // (banc) la profondeur, la tuile, la couverture · le relief, la brume, l abîme, l ombre
  nuFondTick(1);if(paused||o.rendre){if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}
  return {on:ARC_ON,force:CARC.force,meteo:m9,uPh:skyU.uPh.value.toArray().map(function(v){return +v.toFixed(3);}),uMr:skyU.uMr.value.toArray(),photo:Object.keys(CARC.tex).filter(function(f){return CARC.tex[f].pret;}),mer:!!(CARC.mer&&CARC.mer.pret),dose:NUVIT.dose};};
window.dbgNuFond=function(k){NUF.force=k==null?null:+k; // (banc) même image : 0 = le ciel d'avant (et sa brume), 1 = le fond peint
  const c=LVL&&LVL.cur,m9=c&&c.meteo,S9=SF_CARTES.nuages.m[m9],B9=S9&&BIOMES[S9.bio],E9=(+k===0?NUF.av:NUF.ap)[m9];
  if(B9&&E9){Object.assign(B9,JSON.parse(JSON.stringify(E9)));bioGo(S9.bio,.01);bioStep(1);}nuFondTick(1);
  if(paused||arguments[1]){if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}
  let px=null;if(arguments[1]){const gl=renderer.getContext(),W=gl.drawingBufferWidth,H=gl.drawingBufferHeight,b=new Uint8Array(4);px=[];for(const q of [[.1,.9],[.5,.95],[.9,.9],[.1,.6]]){gl.readPixels(Math.round(q[0]*W),Math.round(q[1]*H),1,1,gl.RGBA,gl.UNSIGNED_BYTE,b);px.push([b[0],b[1],b[2]]);}} // (banc) des pixels du haut de l image
  return {on:NUF.on,k:+NUF.k.toFixed(2),meteo:m9,uTi:+skyU.uTi.value.x.toFixed(2),px:px};};
// l'heure du TÉLÉPHONE → l'ambiance : nuit 22 h-5 h · matin 5 h-10 h · midi 10 h-14 h · après-midi 14 h-17 h · golden hour 17 h-19 h 30 · soir 19 h 30-22 h
function titreHeureDe(d){const h=d.getHours()+d.getMinutes()/60;return h<5?'nuit':h<10?'matin':h<14?'midi':h<17?'aprem':h<19.5?'golden':h<22?'soir':'nuit';}
const TITRE_HF={h:null,force:null,tc:0,tcol:new THREE.Color(1,1,1)};
{const q9=(location.search.match(/[?&]heure=([a-zé\-]+)/i)||[])[1];if(q9){const n9=q9.toLowerCase().replace('apres-midi','aprem').replace('après-midi','aprem').replace('goldenhour','golden');if(TITRE_H[n9])TITRE_HF.force=n9;}}
function titreHeurePose(h){ // pose UNE heure : son ambiance (chuteRender la verra changer et la réappliquera), ses réglages, ses voiles, sa teinte
  const H=TITRE_H[h];if(!H)return;TITRE_HF.h=h;
  BIOMES.titre=BIOMES[H.bio];
  const ks={};for(const n in TITRE_H)for(const k in TITRE_H[n].P)ks[k]=1;
  for(const k in ks)CHUTE_P[k]=JSON.parse(JSON.stringify(H.P[k]!==undefined?H.P[k]:CHUTE_P0[k]===undefined?null:CHUTE_P0[k]));
  CHUTE.L=-1; // l'angle regard ↔ soleil a pu changer : le regard se recalcule
  const bs=document.body.style;bs.setProperty('--tvC',H.v[0]);bs.setProperty('--tvA',H.v[1]);bs.setProperty('--tvA2',H.v[2]);bs.setProperty('--tvB',H.v[3]);bs.setProperty('--tvBA',H.v[4]);
  document.body.dataset.heure=h;
  TITRE_HF.tcol.setRGB(H.t[0],H.t[1],H.t[2]);if(CHUTE.w)for(const w of CHUTE.w)w.sp.material.color.copy(TITRE_HF.tcol);
}
function titreHeureTick(dt){ // l'heure, relue toutes les 20 s (un menu laissé ouvert passe de l'après-midi à la golden hour)
  TITRE_HF.tc-=dt;if(TITRE_HF.h&&TITRE_HF.tc>0)return;TITRE_HF.tc=20;
  const h=TITRE_HF.force||titreHeureDe(new Date());if(h!==TITRE_HF.h)titreHeurePose(h);
}
window.dbgHeure=function(h){ // (dev) forcer une heure du titre : dbgHeure('golden') · dbgHeure(null) : l'horloge du téléphone
  if(h!==undefined){TITRE_HF.force=h&&TITRE_H[h]?h:null;TITRE_HF.tc=0;titreHeureTick(0);}
  return {heure:TITRE_HF.h,forcee:TITRE_HF.force,horloge:titreHeureDe(new Date()),heures:TITRE_HEURES};};
window.dbgTitre=function(h,o){ /* banc (2026-10-14, passe graphismes) : retoucher à chaud une heure du titre : dbgTitre('midi',{ciel:{z:[..],h:[..]},amb:{fog:[..]},P:{..},v:[..],t:[..]}) ; la repose aussitôt */
  const H=TITRE_H[h];if(!H||!o)return null;if(o.ciel)Object.assign(TITRE_CIEL[h],JSON.parse(JSON.stringify(o.ciel)));if(o.amb)Object.assign(BIOMES[H.bio],JSON.parse(JSON.stringify(o.amb)));if(o.P)Object.assign(H.P,JSON.parse(JSON.stringify(o.P)));if(o.v)H.v=o.v.slice();if(o.t)H.t=o.t.slice();
  TITRE_HF.force=h;TITRE_HF.tc=0;titreHeurePose(h);CHUTE.bioT=null;return {ciel:TITRE_CIEL[h],amb:BIOMES[H.bio].nm};};
/* LA CAISSE AU DOIGT, AU CIEL — v2 « TRASH » (2026-10-07, Léo : « dans le menu ciel la voiture doit pouvoir être tournée, tapée, balancée ;
   le clic sur elle doit être plus trash ») — remplace LE TAPOTEMENT AU CIEL du 03/10 (mêmes points d'entrée : chuteTape, chuteTapeTick).
   · TAPÉE (un tap SUR la caisse) : le COUP part du point touché, dans le sens du rayon — une vraie poussée (V), le couple r × F (W : taper
     le nez ne la fait pas tourner comme taper l'aile) et une part de CHAOS (deux coups ne tombent jamais pareil). Au point d'impact : l'éclat,
     une gerbe d'ÉTINCELLES, des MORCEAUX DE TÔLE à ses couleurs qui s'arrachent et que l'air emporte vers le haut (elle tombe, eux freinent) ;
     la caméra encaisse (secousse + coup de zoom), la tôle craque (pose.choc + debris.tole, pose.lourde quand ça s'emballe), le téléphone vibre.
     LE COMBO : des coups rapprochés (< 0,7 s) frappent de plus en plus fort (×1 → ×2,75) — tapée en rafale, elle part en vrille.
   · TOURNÉE (un glissé qui PART de la caisse — ailleurs le glissé fait toujours tourner la vue) : elle tourne sous le doigt comme une boule
     (gauche-droite autour de la verticale de l'écran, haut-bas autour de son horizontale) et se laisse un peu tirer.
   · BALANCÉE (lâchée en mouvement) : elle garde l'élan du doigt — elle part en toupie et file dans le sens du lancer.
   · LE RETOUR : deux ressorts. La position revient (K/C). La rotation est un QUATERNION (plus un vecteur) : on peut lui faire faire trois
     tours, elle ne les « détord » pas — elle revient par le plus court chemin à son attitude de chute. Tant qu'elle tourne vite (> WL rad/s)
     le ressort la LÂCHE (toupie libre), puis il la rattrape en deux ou trois balancements.
   Rien de neuf à compiler : les morceaux sont des Phong nus (le programme des éclats), étincelles et éclat sont ceux du jeu.
   Réglages : CHUTE_TAP (V/W/WMAX/CHAOS le coup, K/C/KR/CR les ressorts, WL la toupie, TR/TT le doigt). dbgTape() : l'état ; dbgTape('coup')
   frappe la caisse en son centre (banc). */
const CHUTE_TAP={p:new THREE.Vector3(),v:new THREE.Vector3(),Q:new THREE.Quaternion(),w:new THREE.Vector3(),q:new THREE.Quaternion(),
  ray:new THREE.Raycaster(),nd:new THREE.Vector2(),a:new THREE.Vector3(),b:new THREE.Vector3(),o:new THREE.Vector3(),n9:new THREE.Vector3(),
  cR:new THREE.Vector3(),cU:new THREE.Vector3(),pT:new THREE.Vector3(),col:new THREE.Color(),fl:null,flT:9,flS:1,
  V:10,W:6.5,WMAX:20,CHAOS:6,HS:.07,hs:0, /* (2026-10-14, Léo : « augmente l'impact des coups ») poussée ×1,33, pivot ×1,3 ; HS = l'ARRÊT SUR IMAGE au contact (s) */
  K:12,C:2.4,KR:16,CR:1.9,WL:3,TR:.011,TT:.012,PMAX:7,PL:5.5,
  n:0,combo:0,cT:-9,sh:0,deb:null,debM:null,tient:null};
/* LE DOIGT DE BIENVENUE (2026-10-15 soir, Sacha : « une sorte d'icône avec un doigt qui clignote sur la voiture la première fois […] un peu
   accueillant pour la première connexion ») — le dessin et le mouvement : <style id="accueilDoigt">. Montré tant que la caisse du titre n'a
   jamais été tapée (SAVE.d.ast, bit 256), sur l'ACCUEIL seulement (la coque sur « home », le voile d'ouverture parti, ni piqué, ni volet, ni
   auto-école), après 1,2 s d'accueil à l'écran. Le bout du doigt suit le centre de la caisse projeté, LISSÉ (elle tremble dans le vent de la
   chute : la main ne tremble pas avec), gardé dans l'écran pour que la bulle tienne. Le DOM n'est écrit que si la place change d'un pixel.
   La main (16 × 18) : o encre, w gant, g ombre du gant, y/d manchette d'or. */
const CH_DOIGT={el:null,fini:false,on:false,t:0,x:-1,y:-1,tx:'',r:null,rT:0,v:new THREE.Vector3(),BIT:256,
  G:['.....oo.........','....owwo........','....owgo........','....owgo........','....owgo........','....owgooo......','....owgowgooo...',
     '....owgowgowgoo.','.oo.owgowgowgowo','owgoowgowgowgowo','owwwowwwwwwwwwgo','.owwwwwwwwwwwwgo','..owwwwwwwwwwwgo','..owwwwwwwwwwwgo',
     '...owwwwwwwwwgo.','....oyyyyyyyydo.','....oyyyyyyyydo.','....ooooooooooo.'],
  C:{o:'#1c0430',w:'#ffffff',g:'#c8bde8',y:'#ffd75e',d:'#c8901a'}};
try{Object.assign(I18N,{'BIENVENUE !':'WELCOME!','TAPE TA CAISSE':'TAP YOUR CAR'});}catch(e){}
function chuteDoigtEl(){const D=CH_DOIGT;if(D.el)return D.el;const el=document.getElementById('chDoigt');if(!el)return null;
  let r='';for(let y=0;y<D.G.length;y++)for(let x=0;x<16;x++){const c=D.C[D.G[y][x]];if(c)r+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+c+'"/>';}
  el.style.setProperty('--cdSvg','url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 18" shape-rendering="crispEdges">'+r+'</svg>')+'")');
  return D.el=el;}
function chuteDoigtMontre(v){const D=CH_DOIGT;if(!v)D.t=0;if(D.on===v)return;D.on=v;if(D.el)D.el.classList.toggle('on',v);}
function chuteDoigtTick(dt,Ck,G){const D=CH_DOIGT;if(D.fini)return;
  if((SAVE.d.ast|0)&D.BIT){D.fini=true;chuteDoigtMontre(false);return;}
  if(G||!carGroup.visible||TUTO.on||BIENV.on||PLQ.on||PLQ.prof||ecranWipe._on||!overlay||overlay.getAttribute('data-ecran')!=='home'||document.getElementById('splash')){chuteDoigtMontre(false);return;} /* (pas `overlay.style.display` : au ciel, la feuille du garage-menu montre l'accueil par-dessus un display:none écrit en ligne) */
  const el=chuteDoigtEl();if(!el){D.fini=true;return;}
  D.rT-=dt;if(D.rT<=0||!D.r){D.rT=.5;D.r=renderer.domElement.getBoundingClientRect();} // la place du canevas (le cadre de l'ordi le décale) : relue deux fois par seconde
  const R=D.r;D.v.copy(Ck).project(camera);if(!(R.width>0)||D.v.z>1){chuteDoigtMontre(false);return;}
  let sx=R.left+(D.v.x*.5+.5)*R.width,sy=R.top+(.5-D.v.y*.5)*R.height;
  sx=Math.max(R.left+96,Math.min(R.right-96,sx));sy=Math.max(R.top+24,Math.min(R.bottom-132,sy)); // la bulle (sous la main) reste dans l'écran
  if(D.x<0){D.x=sx;D.y=sy;}else{const k=1-Math.exp(-dt*5);D.x+=(sx-D.x)*k;D.y+=(sy-D.y)*k;}
  const tx='translate3d('+Math.round(D.x)+'px,'+Math.round(D.y)+'px,0)';if(tx!==D.tx){D.tx=tx;el.style.transform=tx;}
  D.t+=dt;if(D.t>1.2)chuteDoigtMontre(true);}
function chuteDoigtFini(){const D=CH_DOIGT;if(D.fini||(!D.on&&D.t<.3))return;D.fini=true; // le 1er coup sur la caisse : la main s'envole, pour toujours — (banc) sauf le tap qui ferme le voile d'ouverture et retombe sur la caisse (D.t < 0,3 s d'accueil) : il ne compte pas
  SAVE.d.ast=(SAVE.d.ast|0)|D.BIT;try{SAVE.flush();}catch(e){} /* écrit tout de suite : l'appli fermée juste après ne la remontre pas */
  const el=D.el;if(el&&D.on){el.classList.add('fini');setTimeout(function(){el.classList.remove('on','fini');},600);}else if(el)el.classList.remove('on');D.on=false;}
function chuteVisible(o){for(let x=o;x;x=x.parent)if(!x.visible)return false;return true;}
function chuteVise(e){ // le rayon du doigt : la 1re pièce VISIBLE et opaque de la caisse, ou rien
  if(!CHUTE.on||CHUTE.go||!carGroup.visible)return null;
  const T=CHUTE_TAP,r=renderer.domElement.getBoundingClientRect();T.nd.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);
  camera.updateMatrixWorld();T.ray.setFromCamera(T.nd,camera);
  for(const x of T.ray.intersectObject(carGroup,true)){const m=x.object.material;
    if(!x.object.isMesh||!chuteVisible(x.object))continue;if(m&&(m.blending===THREE.AdditiveBlending||(m.transparent&&m.opacity<.5)))continue;return x;}
  return null;
}
function chuteAxes(){const T=CHUTE_TAP;T.cR.set(1,0,0).applyQuaternion(camera.quaternion);T.cU.set(0,1,0).applyQuaternion(camera.quaternion);} // la droite et le haut de l'ÉCRAN, dans le monde
function chuteDebris(){ // les morceaux de tôle (une fois) : 16 boîtes sur UNE géométrie, trois Phong nus (sa couleur, son accent, le noir du dessous)
  const T=CHUTE_TAP;if(T.deb)return;const g=new THREE.BoxGeometry(1,1,1);g.userData.partage=true;
  T.debM=[new THREE.MeshPhongMaterial({color:0xff5a2a,shininess:80,specular:0x777777}),new THREE.MeshPhongMaterial({color:0xffffff,shininess:80,specular:0x777777}),new THREE.MeshPhongMaterial({color:0x17151c,shininess:30,specular:0x333333})];
  T.deb=[];for(let i=0;i<16;i++){const m=new THREE.Mesh(g,T.debM[i%3]);m.visible=false;m.castShadow=m.receiveShadow=false;scene.add(m);
    T.deb.push({m:m,v:new THREE.Vector3(),w:new THREE.Vector3(),t:0,vie:1,s:new THREE.Vector3()});}
  T.di=0;
}
function chuteTape(e){ // TAPÉE : le coup
  const h=chuteVise(e);if(!h)return false;
  try{chuteDoigtFini();}catch(_){} /* (2026-10-15 soir) le doigt de bienvenue a servi */
  const T=CHUTE_TAP,d=T.ray.ray.direction,c=CHUTE.ctr||carGroup.position,now=performance.now()/1000;
  T.combo=now-T.cT<.7?Math.min(6,T.combo+1):1;T.cT=now;const mu=1+.35*(T.combo-1);  // LE COMBO : ×1 → ×2,75
  chuteAxes();const lt=(Math.random()-.5)*2,lu=Math.random()*.8-.2;                       // la poussée : dans le sens du doigt, et DE CÔTÉ (repoussée au loin seulement, elle rapetissait)
  T.v.addScaledVector(d,T.V*mu*.5).addScaledVector(T.cR,T.V*mu*.5*lt).addScaledVector(T.cU,T.V*mu*.5*lu);if(T.v.length()>T.V*3)T.v.setLength(T.V*3);
  T.a.subVectors(h.point,c).cross(d).multiplyScalar(T.W*mu);T.w.add(T.a);                  // le pivot : r × F
  T.w.x+=(Math.random()-.5)*T.CHAOS*mu;T.w.y+=(Math.random()-.5)*T.CHAOS*mu;T.w.z+=(Math.random()-.5)*T.CHAOS*mu; // le chaos
  if(T.w.length()>T.WMAX)T.w.setLength(T.WMAX);
  T.sh=Math.min(2.3,T.sh+.85*mu);T.hs=T.HS*(T.combo>=3?1.35:1);                          // la caméra encaisse (14/10 : plus fort) — et l'arrêt sur image : la caisse fige 70 ms au contact, puis part
  // la normale de la face touchée (dans le monde), pour faire gicler étincelles et morceaux
  const n=T.n9;if(h.face)n.copy(h.face.normal).transformDirection(h.object.matrixWorld);else n.copy(d).negate();if(n.dot(d)>0)n.negate();
  if(!T.fl&&RICH.texEt){T.fl=new THREE.Sprite(new THREE.SpriteMaterial({map:RICH.texEt,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));T.fl.renderOrder=999;T.fl.visible=false;scene.add(T.fl);} // (2026-10-08) l'éclat d'impact : une ÉTOILE nette (la boule floue faisait « naïf »)
  if(!T.fl){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,240,200,.85)');g.addColorStop(1,'rgba(255,210,140,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
    T.fl=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
    T.fl.renderOrder=999;T.fl.visible=false;scene.add(T.fl);}
  T.fl.position.copy(h.point).addScaledVector(d,-.15);T.flT=0;T.flS=1.45+.55*(mu-1);T.fl.visible=true;T.fl.material.rotation=Math.random()*3;T.n++;
  try{caisseAction();}catch(_){} // (2026-10-20, Léo) L'ACTION SPÉCIALE de la caisse tapée (voir caisseAction)
  const P=h.point;richCoup(P,n,d,mu,T.combo); // (2026-10-08) LES ÉTINCELLES v2 et LA PLUIE DE RICHESSE (voir ce bloc) — les gerbes sparkGold/dust d'avant, « brutes, naïves », sont retirées
  chuteDebris();const sp=CARS[garageI]||CARS[0];                                         // LES MORCEAUX DE TÔLE, à ses couleurs
  {const M9=Array.isArray(h.object.material)?h.object.material[0]:h.object.material,G9=h.object.geometry,ca=G9&&G9.attributes&&G9.attributes.color; // la couleur de la PIÈCE touchée (sa couleur de sommet × sa matière)
   if(M9&&M9.color)T.debM[0].color.copy(M9.color);else T.debM[0].color.setHex(sp.color!=null?sp.color:0xff5a2a);
   if(ca&&h.face&&M9&&M9.vertexColors){const i9=h.face.a;T.col.setRGB(ca.getX(i9),ca.getY(i9),ca.getZ(i9));T.debM[0].color.multiply(T.col);}
   T.debM[1].color.setHex(sp.accent!=null?sp.accent:0xdddddd);}
  const nd=Math.min(T.deb.length,Math.round(3+2*mu));
  for(let i=0;i<nd;i++){const D=T.deb[T.di];T.di=(T.di+1)%T.deb.length;const sp9=4+Math.random()*6*mu,m=D.m;
    m.position.copy(P).addScaledVector(n,.05);D.v.set(n.x*sp9+(Math.random()-.5)*5,n.y*sp9+(Math.random()-.5)*5+1.5,n.z*sp9+(Math.random()-.5)*5);
    D.w.set((Math.random()-.5)*16,(Math.random()-.5)*16,(Math.random()-.5)*16);m.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);
    const k9=.5+Math.random()*.8;D.s.set(.34*k9,.05+.05*Math.random(),.24*k9);m.scale.copy(D.s);D.t=0;D.vie=1.3+Math.random()*.9;m.visible=true;}
  try{if(SONV2){if(richSon()){sfx('riche.coup',{vol:-1+3*Math.min(1,mu-1)});sfx('riche.combo',{st:RICH_PD[Math.min(RICH_PD.length-1,T.combo-1)],vol:-3+2*Math.min(1,(T.combo-1)/4),t:.012});} /* (2026-10-16) LE COUP et la note du COMBO qui monte d'un degré à chaque coup de la rafale (voir <<<RICHESSE>>> dans l'atelier) */
      else{sfx('pose.choc',{vol:1+3*Math.min(1,mu-1)});sfx('debris.tole',{vol:3,t:.03});if(T.combo>=2)sfx('pose.lourde',{vol:-2+2*Math.min(1,(T.combo-2)/3),t:.02});}}else{chimeNote(340,0,.05,.10);noiseBurst(.18,.08,900);}}catch(_){} /* la tôle qui encaisse — de plus en plus lourd (l'ancien jeu de sons en repli, banque d'avant) */
  try{hap(T.combo>=3?[40,20,55]:[32,14,26]);}catch(_){}
  return true;
}
function chutePrend(e){ // le doigt se pose : SUR la caisse, il la tient (sinon : la vue, comme avant)
  const T=CHUTE_TAP;T.tient=null;if(!chuteVise(e))return false;
  T.tient={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,t:performance.now(),vx:0,vy:0,drag:false,wR:new THREE.Vector3()};return true;
}
function chuteTourne(e){ // le doigt glisse sur la caisse : elle tourne comme une boule et se laisse tirer
  const T=CHUTE_TAP,H=T.tient;if(!H)return;const dx=e.clientX-H.x,dy=e.clientY-H.y,n9=performance.now(),dm=Math.max(8,n9-H.t)/1000;
  if(!H.drag&&Math.hypot(e.clientX-H.x0,e.clientY-H.y0)>=14)H.drag=true;
  chuteAxes();
  if(H.drag&&(dx||dy)){T.q.setFromAxisAngle(T.cU,dx*T.TR);T.Q.premultiply(T.q);T.q.setFromAxisAngle(T.cR,dy*T.TR);T.Q.premultiply(T.q);T.Q.normalize();
    T.a.copy(T.cU).multiplyScalar(dx*T.TR/dm).addScaledVector(T.cR,dy*T.TR/dm);H.wR.multiplyScalar(.5).addScaledVector(T.a,.5);T.w.set(0,0,0);}
  H.vx=H.vx*.5+dx/dm*.5;H.vy=H.vy*.5+dy/dm*.5;H.x=e.clientX;H.y=e.clientY;H.t=n9;
  T.pT.copy(T.cR).multiplyScalar((H.x-H.x0)*T.TT).addScaledVector(T.cU,-(H.y-H.y0)*T.TT);{const l9=T.pT.length();if(l9>1e-6)T.pT.setLength(T.PL*Math.tanh(l9/T.PL));} /* (2026-10-08, Léo : « on doit pouvoir amener la voiture plus loin, sans trop de contrôle ») une butée ÉLASTIQUE (tanh) au lieu du mur à 2,5 m : les petits gestes sont les mêmes, et plus on tire, plus elle résiste — jusqu'à ~5 m (PL) ; elle suit toujours le doigt EN RESSORT, avec son retard */
}
function chuteLache(){ // le doigt se lève après un glissé : BALANCÉE — elle garde l'élan du doigt
  const T=CHUTE_TAP,H=T.tient;T.tient=null;if(!H||!H.drag)return;
  if(performance.now()-H.t>90){T.w.set(0,0,0);return;}                                   // le doigt s'était arrêté : elle revient d'elle-même
  T.w.copy(H.wR);if(T.w.length()>T.WMAX)T.w.setLength(T.WMAX);
  chuteAxes();T.v.addScaledVector(T.cR,H.vx*T.TT*.9).addScaledVector(T.cU,-H.vy*T.TT*.9);if(T.v.length()>T.V*3)T.v.setLength(T.V*3);
  if(T.w.length()>4)try{if(SONV2)sfx('debris.tole',{vol:-6,rate:.8});hap(10);}catch(_){}
}
function chuteTapeTick(dt,C,up,sc){ // les deux ressorts, l'éclat, les morceaux, les étincelles ; la caisse tourne autour de son CENTRE (C), pas de son origine
  const T=CHUTE_TAP,H=T.tient,tient=!!(H&&H.drag);CHUTE.ctr=C;let k=Math.min(dt,.05);if(T.hs>0){T.hs-=dt;k*=.06;} // (14/10) l'ARRÊT SUR IMAGE : 70 ms presque figée, puis le coup part
  if(tient){T.v.addScaledVector(T.a.subVectors(T.p,T.pT),-T.K*1.8*k).multiplyScalar(Math.exp(-T.C*2*k));}   // tenue : elle suit le doigt, en ressort
  else T.v.addScaledVector(T.p,-T.K*k).multiplyScalar(Math.exp(-T.C*k));
  T.p.addScaledVector(T.v,k);if(T.p.length()>T.PMAX)T.p.setLength(T.PMAX);
  if(!tient){let qw=T.Q.w,s9=1;if(qw<0){s9=-1;qw=-qw;}const sn=Math.sqrt(Math.max(0,1-qw*qw)),an=2*Math.atan2(sn,qw); // l'écart à l'attitude de chute, par le plus court chemin
    if(sn>1e-7)T.a.set(T.Q.x*s9,T.Q.y*s9,T.Q.z*s9).multiplyScalar(an/sn);else T.a.set(0,0,0);
    const wl=T.w.length()/T.WL,kr=T.KR/(1+wl*wl);                                      // toupie : tant qu'elle tourne vite, le ressort la lâche
    T.w.addScaledVector(T.a,-kr*k).multiplyScalar(Math.exp(-T.CR*(.35+.65/(1+wl*wl))*k)); // (lancée, l'air la freine moins : deux ou trois tours de toupie)
    const wa=T.w.length()*k;if(wa>1e-8){T.q.setFromAxisAngle(T.b.copy(T.w).divideScalar(T.w.length()),wa);T.Q.premultiply(T.q).normalize();}}
  T.sh*=Math.exp(-dt*5.5);if(T.sh<.003)T.sh=0;
  if(T.fl&&T.fl.visible){T.flT+=dt;const u=T.flT/.22;if(u>=1)T.fl.visible=false;else{T.fl.material.opacity=(1-u)*(1-u);const s9=(1.1+u*1.4)*sc*T.flS;T.fl.scale.set(s9,s9,1);}} // l'étoile s'ouvre et meurt vite
  if(T.deb)for(const D of T.deb){if(!D.m.visible)continue;D.t+=dt;if(D.t>=D.vie){D.m.visible=false;continue;} // les morceaux : l'air les emporte vers le HAUT (elle tombe, eux freinent)
    D.v.multiplyScalar(Math.exp(-dt*.9));D.v.y+=9*dt;D.m.position.addScaledVector(D.v,dt);D.m.rotation.x+=D.w.x*dt;D.m.rotation.y+=D.w.y*dt;D.m.rotation.z+=D.w.z*dt;
    const f9=Math.min(1,(D.vie-D.t)/.35);D.m.scale.copy(D.s).multiplyScalar(f9);}
  if(!(running&&!paused&&!gameOver)){updatePool(sparkGold,dt,3);updatePool(dust,dt,2);}  // au menu, la boucle de course ne les fait pas vivre
  richTick(dt,C); // (2026-10-08) LA PLUIE DE RICHESSE : objets, étincelles, flamme, éclats
  if(!tient&&T.p.lengthSq()+T.v.lengthSq()+T.w.lengthSq()<1e-8&&1-Math.abs(T.Q.w)<1e-10){T.Q.identity();return;}
  carGroup.quaternion.premultiply(T.Q);
  T.o.copy(up).multiplyScalar(-.45*sc).applyQuaternion(T.Q);carGroup.position.copy(C).add(T.o).add(T.p);
}
