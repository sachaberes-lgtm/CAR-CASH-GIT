// ---------- SCENE ----------
const scene=new THREE.Scene();
/* (2026-09-26, passe perf) LA SCÈNE NE BOUGE JAMAIS : son repère est gelé. Mesuré au profil (ville, niveau 4) : `updateMatrixWorld`
   = 27 % du CPU. Tant que la scène se recalculait elle-même à chaque image, three passait `force` à TOUS ses enfants : ~6 000 matrices
   monde recomposées par image, plots et pièces immobiles compris. Gelée, elle laisse chaque objet ne se recalculer QUE s'il a bougé
   (et les objets gelés — plots, pièces, fruits — ne se recalculent plus du tout tant qu'on ne les touche pas). */
scene.matrixAutoUpdate=false;
/* (2026-09-27, passe perf iPhone) …ET ELLE NE PARCOURT PLUS CE QUI EST ÉTEINT. Recensement en course : ~2 000 objets sous la scène dont
   1 600 invisibles — l'atelier caché (412 objets qui se recomposaient à chaque image), les ~830 pièces hors couloir, les fruits et
   pouvoirs masqués (leurs enfants se recalculaient quand même). three r128 les parcourait tous à chaque rendu (`updateMatrixWorld` =
   8 % du processeur en vol). Un enfant direct INVISIBLE est désormais sauté : il ne se dessine pas, sa matrice monde ne sert à rien.
   Rien n'est perdu : son propre drapeau (`matrixWorldNeedsUpdate`, posé par `updateMatrix()` ou par nous si la scène avait bougé)
   reste levé, et il se recalcule — lui et ses enfants — à la première image où il redevient visible, AVANT d'être dessiné.
   ⚠ Seul risque : lire `.matrixWorld`/`localToWorld` d'un objet caché. Audit fait : seule la caisse le fait (traces de gomme, étincelles,
   aperçu de traînée) → `SCENE_TOUJOURS` la garde toujours à jour ; le serpent et `getWorldPosition` recalculent eux-mêmes. */
const SCENE_TOUJOURS=new Set();
scene.updateMatrixWorld=function(force){
  if(this.matrixAutoUpdate)this.updateMatrix();
  if(this.matrixWorldNeedsUpdate||force){this.matrixWorld.copy(this.matrix);this.matrixWorldNeedsUpdate=false;force=true;} // (racine : pas de parent)
  const ch=this.children;
  for(let i=0,n=ch.length;i<n;i++){const o=ch[i];
    if(o.visible===false&&!SCENE_TOUJOURS.has(o)){if(force)o.matrixWorldNeedsUpdate=true;continue;}
    o.updateMatrixWorld(force);}
};
// CIEL « VICE CITY NUIT » : rose Miami / violet, mais ASSOMBRI — indigo profond au zénith,
// grande brume rose sombre, ambre au ras du couchant, étoiles, lune. La nuit tombe pour de bon.
scene.background=new THREE.Color(0x0d0820); // fond NUIT violet TRÈS sombre (le ciel dôme couvre, ceci teinte les trouées)
/* <<<CIEL>>> — TOUT LE FIRMAMENT : le dôme et ses uniformes, le soleil « 1.61 », la nappe
   d'horizon, la Terre. ⚠ ce bloc ne dépend QUE de `THREE`, de `document` (les textures sont peintes
   en canvas) et de `scene` — un objet qui sait faire `add`, rien de plus.
   `atelier-fond.html` l'exécute tel quel : il montre donc le VRAI ciel du jeu, astres compris, et
   jamais une copie qui dériverait. C'est la seule façon de juger « est-ce que le 1.61 est trop
   gros » sans lancer une partie. */
const SUN_DIR=new THREE.Vector3(.38,.10,-.90).normalize(); // soleil TRÈS BAS (~5,9°) : lumière rasante, ombres longues
// GRADE DE CIEL (biomes) : uniforms à IDENTITÉ NEUTRE — réglages par défaut = rendu Vice City actuel au pixel près.
// La palette reste bakée dans le shader ; le biome la teinte (×mul, +lift horizon) et dose soleil/ville/étoiles/lune.
const MER_MOTIF=false; // (2026-09-28) false = sous l'horizon des NUAGES, l'ABÎME BLEU (Sacha : « tout bleu, sans motif de nuages ») ; true = l'ancienne mer peinte
/* (v17, Léo : « l'eau vient frapper les montagnes volantes, et donc plus haute et agitée ») LA HOULE EN CUBES, PARTAGÉE : la mer du ciel
   peint (jMerCubes) et les montagnes (qui s'arrêtent net à la surface : JADE_VR_FS) lisent la MÊME hauteur de colonne — la coupe de l'eau
   sur la pierre tombe pile sur les cubes de la mer. Plus agitée qu'en v16 : des houles plus rapides, un clapot en plus (uEauT : l'horloge
   de l'eau, figée en pause). */
const JADE_EAU_GLSL='const float JMS=4.;float jMerH(vec2 c){vec2 p=c*JMS;float r=fract(sin(dot(c,vec2(41.3,289.1)))*43758.5453);float h=1.6*sin(p.x*.0105+uEauT*.95)+1.1*sin(p.y*.0165-uEauT*1.3+p.x*.004)+.8*sin((p.x+p.y)*.024+uEauT*1.9)+.7*sin(p.x*.031-p.y*.027+uEauT*1.6)+.55*sin(p.x*.061+p.y*.047+uEauT*2.7)+1.5*(r-.5)+.6*sin(uEauT*3.2+r*6.28);return floor(h);}\n';
/* (2026-10-14, passe graphismes · neon-residuel) LES DERNIERS RESTES DE NÉON VIOLET DU MONDE 3D : (A) la poussée de la nitro (bords de l'image, onde,
   filés, lueur) passe du bleu-violet/violet ultra à un BLANC-OR chaud (la réserve bleue reste un bleu froid DÉSATURÉ), force des bords ≤ .4, bords
   qui ne recolorent plus qu'un quart de l'image ; (B) le plafond de nuages de la ville sous pluie/orage perd son lilas fixe (+.06,.02,.06) et son
   éclair lilas. Que des couleurs et des constantes. */
/* (2026-10-15, Sacha : « rajoute de la couleur dans l'espace — nébuleuses, voie lactée, étoiles, du violet, du bleu — mais que ça reste beau,
   réaliste et spatial, juste un ciel un peu moins vide ») LE CIEL DE L'ORBITE N'EST PLUS UN TROU NOIR : une VOIE LACTÉE en écharpe (bleutée, cœur
   chaud, rubans de poussière sombre), deux NÉBULEUSES (violette et bleue, magenta où elles se croisent) et une POUSSIÈRE D'ÉTOILES fines qui
   se resserre dans la bande. Tout reste BAS en intensité : le noir domine, la couleur se devine — la route et la caisse gardent la lecture.
   Fixe dans le ciel (direction monde), nul hors de l'orbite (× uSpace). */
const skyU={uEauT:{value:0},uSous:{value:0},uSousC:{value:new THREE.Vector3(.13,.47,.50)}, // (2026-10-13) SOUS LA MER du SOLEIL DE JADE (voir jadeSousTick)
  uTime:{value:0},uSunDir:{value:SUN_DIR},
  uSkyMul:{value:new THREE.Vector3(1,1,1)},uSkyLift:{value:new THREE.Vector3(0,0,0)},
  uSunTint:{value:new THREE.Vector3(1,.40,.28)},uSunHalo:{value:1},uCity:{value:1},uStars:{value:1},uMoon:{value:1},uRose:{value:0},
  uNeb:{value:0}, // (2026-10-25, Sacha : « remets le ciel noir dans l'espace, enlève les nébuleuses et tout ») voie lactée, nébuleuses et poussière coupées : 0 = le noir complet. (2026-10-15 : 1 = l'orbite colorée)
  uBandes:{value:new THREE.Vector3(0,0,0)}, // (2026-10-25) LES ÉTOILES JOUENT LA MUSIQUE (orbite) : x = basses, y = médiums, z = aigus — l'excès de chaque bande sur sa moyenne, 0..1 (voir musicTick)
  uSpace:{value:0}, // NIVEAU ORBITE (2026-09-24) : 0 = le ciel de toujours AU PIXEL PRÈS, 1 = le noir étoilé (piloté par lvlStep)
  uPulse:{value:0}, // MUSIQUE : le ciel respire en rythme (piloté par l'analyseur audio, 0 = neutre = rendu d'origine)
  /* ---- LE FOND DU NIVEAU (2026-08-08) : le décor JOUE la musique, façon Geometry Dash / Super Hexagon.
     ⚠ `uLvl` est l'INTERRUPTEUR GÉNÉRAL : à 0 le ciel rend EXACTEMENT ce qu'il rendait avant, au pixel
     près (tout le bloc est sous un `if`). C'est la règle du projet — un effet neuf ne doit jamais
     déplacer d'un poil le rendu qu'on avait déjà validé quand il est éteint. */
  uLvl:{value:0},      // 0..1 : présence du décor de niveau (monte avec la musique, retombe à la fin)
  uSpin:{value:0},     // rotation de LA ROUE, en cycles de quartier (à-coups sur les frappes)
  uBeatK:{value:0},    // la frappe, mise en forme pour le décor (≠ uPulse qui est l'énergie moyenne)
  uFlip:{value:0},     // LA BASCULE : 0/1, les deux teintes s'échangent une fois par phrase
  uBar:{value:0},      // 0..1 dans la mesure — donne au décor une structure, pas juste des flashes
  uAcc:{value:new THREE.Color(0xf24aa0)},   // l'accent de la zone (celui des rails) : le fond parle la MÊME couleur que la piste
  uAcc2:{value:new THREE.Color(0x3ee6f0)},  // sa complémentaire : la seconde voix de la bascule
  uRingR:{value:new THREE.Vector4(9,9,9,9)},// 4 ONDES : rayon angulaire depuis le zénith (9 = éteinte, hors du ciel)
  uRingA:{value:new THREE.Vector4(0,0,0,0)},// …et leur amplitude
  uHi:{value:0},       // LES AIGUS : charleston, cymbales, souffle — ce qui scintille et grésille
  uWave:{value:0},     // phase de L'ONDE DE COULEUR qui roule sur tout le ciel (en tours)
  uHueAmp:{value:0},  // …et son amplitude, en tours de teinte (0,5 = à l'opposé du spectre)
  // LE CIEL DE LA VILLE (2026-09-26) — voir villeCiel dans le shader : présence du niveau VILLE, de la pluie (le plafond), couleur de la
  // brume (le lointain y converge) et position de la caméra (le plafond et les rues d'en bas défilent : parallaxe VRAIE)
  uVille:{value:0},uPluie:{value:0},uFogCol:{value:new THREE.Color(0x331f48)},uCam:{value:new THREE.Vector3()},
  uVilleY:{value:0},uParis:{value:0},uParisT:{value:0}, // (2026-09-28) uParis : le ciel de PARIS (toits bas à l'horizon, lueur d'or) au lieu des tours de la ville
  // (2026-09-26) la SKYLINE descend à l'altitude de la ville (en sinus d'élévation) : la route spirale AU-DESSUS des toits
  /* (2026-10-19, essai ARC) LE FOND EN PHOTO + LA MER DE CUMULUS — voir « LE CIEL D'ARC » plus bas. uPh : x la part de la photo, y la colonne (0-1) de son
     soleil, z sa hauteur (rad), w l exposition · uPh2.x le sens du tour · uMr : x la mer de cumulus (0 = la mer peinte d avant), y la profondeur du
     pont de nuages (m sous l œil), z la tuile (m), w la couverture (le seuil des trouées) · uMr2 : x le relief, y la brume (× la tuile). */
  uPhT:{value:null},uMrT:{value:null},uPh:{value:new THREE.Vector4(0,.6,.1,1)},uPh2:{value:new THREE.Vector4(1,0,0,0)},uMr:{value:new THREE.Vector4(0,900,4200,.22)},uMr2:{value:new THREE.Vector4(3.2,3.,0,1)},
  uTi:{value:new THREE.Vector4(0,0,0,1)},uTi2:{value:new THREE.Vector4(0,0,.35,0)},uTZen:{value:new THREE.Vector3()},uTMid:{value:new THREE.Vector3()},uTHor:{value:new THREE.Vector3()},uTSol:{value:new THREE.Vector3()},uTMerH:{value:new THREE.Vector3()},uTMerO:{value:new THREE.Vector3()},uTCir:{value:new THREE.Vector3()}, // (titre v4) LE CIEL DE L'ÉCRAN TITRE (cielTitre) — uTi.x = 0 hors du titre : rien ne change en course
  uMzA:{value:new THREE.Vector4(760,.8,15,.25)},uMzB:{value:new THREE.Vector4(.20,.16,.26,.8)},uMzT:{value:new THREE.Vector4(0,0,0,0)},uMzO:{value:new THREE.Vector4(0,0,0,0)},uMzH:{value:new THREE.Vector4(0,0,0,0)}, /* ⚠ (0,0,0,0) ÉCRIT : un Vector4() vide vaut (0,0,0,1) — la part 1 peignait toute la mer en NOIR (vu par Léo au menu de sa copie). */ /* (2026-10-03, atelier des nuages : « une fonction pour altérer le ciel en bas ») les COULEURS de la mer de nuages forcées — trous, ombres, dômes : rgb + part (w) ; w = 0 partout = la mer d'avant au bit près */ // (2026-09-30, niveau 1 v2) LA MER SCULPTÉE : échelle des cellules, part « gonflée », franchise de la lumière, remous · couverture, fermeture au loin, creux, clarté des trouées
  uVG:{value:0}, /* (2026-10-01, Sacha : « enlève tous les trucs Van Gogh ») la touche Van Gogh est RETIRÉE du ciel comme des nuages : plus aucun shader ne lit cet uniforme — l'objet reste, inerte, pour qu'un code qui l'écrirait encore ne plante pas */
  uCiel2:{value:0}, /* (2026-10-17, continuité) LE CIEL CONTINU : 1 sur les six maps de la continuité (routeTick), 0 ailleurs (titre, ville, jade : au bit près) */
  uJour:{value:0},uMerLoin:{value:8000}, /* (2026-10-14, passe graphismes · ciel2) la mer lointaine — là où son bruit s'étire en traînées — fond deux fois plus tôt dans la brume : un dégradé propre à l'horizon (titre et chute posent le leur) */uJZen:{value:new THREE.Vector3()},uJMid:{value:new THREE.Vector3()},uJHor:{value:new THREE.Vector3()},uJSol:{value:new THREE.Vector3()}, // (2026-09-30) LE JOUR D'ALTITUDE (voir cielJour) : 0 = le ciel d'avant
  uSkySat:{value:1}, // (2026-10-15 soir) LA CHROMA DU CIEL DE JOUR (voir cielSat, routeTick) : 1 = telle quelle
  uSym:{value:0}, // (2026-10-15) LE CIEL SANS DESSOUS (map NUAGES) : 1 = la moitié basse du dôme est le reflet de la haute (voir TETE)
  uMer:{value:0}, // (2026-09-26) LA MER DE NUAGES PEINTE sous l'horizon — niveau NUAGES seulement (voir merNuages ; fondue par lvlStep comme la ville)
  uBasTex:{value:null},uBasInv:{value:new THREE.Vector2(1,1)},uBasTr:{value:0},
  uCanyon:{value:0},uCyF:{value:0},uCyDn:{value:0},uCyZ:{value:new THREE.Vector3(.1,.25,.6)},uCyM:{value:new THREE.Vector3(.35,.45,.7)},uCyH:{value:new THREE.Vector3(.8,.7,.6)},uCyS:{value:new THREE.Vector3(1,.8,.6)},uCyB:{value:new THREE.Vector3(.8,.5,.6)},uCyC:{value:new THREE.Vector3(1,.9,.85)},uCyD:{value:new THREE.Vector3(.45,.45,.55)},uCyR:{value:new THREE.Vector3(.5,.45,.5)},uCyK:{value:new THREE.Vector4(0,0,0,0)},uCyN:{value:new THREE.Vector4(0,1,1,0)}, // (2026-10-14) LE CANYON DES GÉANTS : son ciel (voir COUCHES.canyon) — uCanyon 0 ailleurs
  uJade:{value:0},uJMerY:{value:-420},uJPx:{value:.0015},uJdZ:{value:new THREE.Vector3(.42,.58,.66)},uJdH:{value:new THREE.Vector3(.93,.90,.80)},uJdR:{value:new THREE.Vector3(.2,.28,.27)},uJdB:{value:new THREE.Vector3(.86,.87,.82)},uJdS:{value:new THREE.Vector3(1,.88,.66)},uJdM:{value:new THREE.Vector3(.93,.90,.80)},uJdL:{value:new THREE.Vector3(.42,.58,.66)},uJdK:{value:new THREE.Vector4(1,1,1,0)},uEauW:{value:new THREE.Vector4(0,0,0,0)},uEauP:{value:[0,1,2,3,4,5,6,7,8,9,10,11].map(function(){return new THREE.Vector4(0,0,-1,0);})}}; // (2026-10-09) LES PICS DE JADE : le ciel peint (voir COUCHES.jade) — 0 ailleurs // (2026-09-27, tour 2) LE CIEL EN DEUX TEMPS : la passe lisse (cible hors écran), 1/taille de l'image où la relire, sa trame si elle est en 8 bits (voir CIEL2)
/* (2026-10-16, Sacha) LES TEINTES DE LA VILLE (voir VTEINTES) — les couleurs FIXES du ciel qui portent le violet de la ville deviennent des uniforms : uFd = les huit
   teintes du dégradé de cielFond (zénith → prune du dessous), uVc = le lilas du plafond, l'éclair, la lueur rose des quartiers, les points roses de l'abîme, le rose
   et le cyan de la guirlande. Leur valeur d'ORIGINE par défaut (toutes les maps, et la ville violette : la même image) ; remappées dans une ville teintée (vtPose). */
const VT_FD0=[[.060,.080,.22],[.16,.13,.35],[.40,.22,.45],[.66,.28,.42],[.80,.36,.30],[.86,.50,.30],[.27,.15,.30],[.050,.045,.115]],VT_VC0=[[.06,.02,.06],[.5,.45,.75],[.9,.25,.6],[1,.35,.7],[1,.30,.62],[.36,.78,1]];
skyU.uFd={value:VT_FD0.map(function(c){return new THREE.Vector3(c[0],c[1],c[2]);})};skyU.uVc={value:VT_VC0.map(function(c){return new THREE.Vector3(c[0],c[1],c[2]);})};
const skyDome=(function(){
  /* LE CIEL EN DEUX TEMPS (2026-09-27, passe perf iPhone, tour 2) — le pourquoi et le mesuré sont dans CIEL2 (après chauffeDivers).
     Le shader est rangé en MORCEAUX — la tête, la ville, la mer, les COUCHES (une fonction par couche) et un `main` par programme :
       · PLEIN : le ciel d'avant, couche par couche DANS LE MÊME ORDRE — le repli (fondus de niveau, fond musical, atelier, `?ciel=plein`) ;
       · BAS_N / NET_N (nuages, orbite) et BAS_V / NET_V (ville sous la pluie) : le même calcul coupé en deux passes — une passe LISSE
         à demi-résolution hors écran (dégradé, mer de nuages, soleil, guirlande, voile · plafond et lueur des quartiers) que la passe
         NETTE, à pleine résolution, relit au pixel près de l'écran pour n'y ajouter que ce qui a des BORDS (étoiles, lune · lumières
         fines de l'abîme, skyline) et la trame.
     Aucune couche n'est écrite deux fois : chaque programme appelle LES MÊMES fonctions. */
  const VS='varying vec3 vDirR;void main(){vDirR=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_Position.z=gl_Position.w;}';
  /* (2026-10-15, Sacha : « dans la map des nuages on ne doit plus avoir de haut ou de bas, les nuages ou le ciel partout, rien d'autre »)
     LE CIEL SANS DESSOUS — `uSym` (0 → 1, fondu par lvlStep) replie la moitié basse du dôme sur la haute : sous la route, plus d'abîme ni de
     mer, le MÊME ciel qu'au-dessus (son soleil a son reflet en bas). Toutes les couches lisent `vDir` : une macro le replie pour elles, en une
     ligne. À 0 (toutes les autres maps), mix(y,|y|,0) = y : l'image d'avant au bit près. */
  const TETE=[
      'varying vec3 vDirR;uniform float uSym;uniform vec4 uMr;vec3 vDirS(){return vec3(vDirR.x,mix(vDirR.y,abs(vDirR.y),uSym*(1.-uMr.x)),vDirR.z);}', // (essai ARC) la mer de cumulus allumée : le dessous redevient un dessous
      'uniform float uSkySat;vec3 cielSat(vec3 c){float l=dot(c,vec3(.2126,.7152,.0722));return max(mix(vec3(l),c,uSkySat),0.);}', // (2026-10-15 soir) la chroma du ciel de jour, plafonnée (voir routeTick)
      '#define vDir vDirS()',
      'uniform vec3 uSunDir;uniform float uTime;',
      /* (2026-10-19, essai ARC) LA PHOTO DU CIEL : un vrai ciel (Poly Haven, CC0), sa moitié haute en équirectangulaire ; son soleil est calé sur
         le nôtre (la colonne tourne avec uSunDir, la hauteur se plie : 0 → le soleil du jeu = 0 → celui de la photo, puis jusqu au zénith).
         Lue avec les dérivées de la plus continue des deux coordonnées (fract et fract + ½) : pas de couture au raccord du tour. */
      'uniform sampler2D uPhT,uMrT;uniform vec4 uPh,uPh2,uMr2;',
      'vec3 phCiel(vec3 d){float H=1.5708,e=asin(clamp(d.y,0.,1.)),eg=max(asin(clamp(uSunDir.y,-1.,1.)),.02),ep=uPh.z;',
      '  float e2=e<eg?e*ep/eg:ep+(H-ep)*(e-eg)/(H-eg);',
      '  float u=uPh.y+uPh2.x*(atan(d.x,-d.z)-atan(uSunDir.x,-uSunDir.z))/6.2832,u1=fract(u),u2=fract(u+.5)-.5;',
      '  vec2 uv=vec2(u1,e2/H),g=vec2(u2,uv.y);vec2 dx=dFdx(g),dy=dFdy(g);vec2 dx1=dFdx(uv),dy1=dFdy(uv);',
      '  if(abs(dx1.x)+abs(dy1.x)<abs(dx.x)+abs(dy.x)){dx=dx1;dy=dy1;}',
      '  return textureGrad(uPhT,uv,dx,dy).rgb*uPh.w;}',
      'uniform vec3 uSkyMul,uSkyLift,uSunTint;uniform float uSunHalo,uCity,uStars,uMoon,uPulse,uRose;', // grade biome (identité par défaut) + uPulse musique
      'uniform vec3 uFd[8];uniform vec3 uVc[6];', // (2026-10-16) LES TEINTES DE LA VILLE : les couleurs fixes du dégradé et du ciel de la ville (valeurs d'origine hors ville teintée)
      'uniform float uSpace,uNeb;uniform vec3 uBandes;', // NIVEAU ORBITE : 0 = aucun effet · uNeb : les nébuleuses (2026-10-15)
      'uniform float uJour,uMerLoin,uCiel2;uniform vec3 uJZen,uJMid,uJHor,uJSol;uniform vec4 uMzA,uMzB,uMzT,uMzO,uMzH;', // (2026-09-30) LE JOUR D ALTITUDE : 0 = le ciel d avant, au bit près
      'uniform float uLvl,uSpin,uBeatK,uFlip,uBar,uHi,uWave,uHueAmp;uniform vec3 uAcc,uAcc2;uniform vec4 uRingR,uRingA;', // LE FOND DU NIVEAU
      'float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      /* ROTATION DE TEINTE AUTOUR DE L AXE DES GRIS (Rodrigues). ⚠ c est LA fonction qui permet les
         ondes de couleur : on ne REPEINT pas le ciel (ce qui effacerait le couchant, les etoiles et
         tout le degrade peint a la main), on fait TOURNER sa teinte. Le ciel reste lui-meme, il
         change juste de couleur — un remplacement aurait donne un aplat, pas une onde. */
      'vec3 hueRot(vec3 c,float a){vec3 k=vec3(.57735);float cs=cos(a),sn=sin(a);',
      '  return c*cs+cross(k,c)*sn+k*dot(k,c)*(1.-cs);}',
  ];
  const VILLE=[
      /* ======================== LE CIEL DE LA VILLE (2026-09-26) ========================
         User : « dans le niveau de la ville cette partie est mal gérée — pas les immeubles : la skyline, le sol et le plafond,
         ça casse l'immersion ». MESURÉ sur captures : (1) la SKYLINE était un cylindre peint de 5 200 m, net (sans brouillard)
         DERRIÈRE des tours 3D noyées de brume — le lointain plus contrasté que le proche, l'œil lit un décor de théâtre ; et
         en vol libre la caméra vrille, on voyait le BORD du cylindre (un arc dur dans le ciel, un autre sous la route).
         (2) le SOL : sous l'horizon, rien que le bas du dôme (prune) d'une autre couleur que la brume des pieds de tours,
         plus l'aplat du cylindre — deux violets qui se découpent. (3) le PLAFOND : le fond musical géométrique (roue,
         ondes, piliers d'égaliseur) — des secteurs, des anneaux et des losanges qui, sous l'horizon, dessinaient même des
         polygones beiges sur l'abîme.
         LE PRINCIPE : tout est calculé ICI, dans le dôme, par DIRECTION DU MONDE — aucune géométrie, donc aucun bord, quelle
         que soit la vrille de la caméra. Et tout CONVERGE vers la couleur de la brume (`uFogCol`, recopiée chaque image) sur
         l'horizon : ce que le brouillard fait aux tours 3D, le ciel le fait au lointain — la ville S'Y FOND.
           · LE PLAFOND (pluie) : une couche de nuages bas, 520 m au-dessus de l'œil, éclairée PAR EN DESSOUS par la ville
             (ventres lilas, trouées sombres) ; elle défile avec le vent ET avec la caméra (parallaxe réelle). La musique
             y passe en ondes de néon et en ÉCLAIRS sur les grosses frappes — les « clignotements dans le ciel » (user,
             2026-09-24) restent, mais DANS le monde, plus en surimpression.
           · LA SKYLINE : trois rangées de tours à l'infini + les deux tours du chef (tête ronde, cornes, yeux jaunes) du
             village de la pluie, d'autant plus fondues dans la brume qu'elles sont loin ; fenêtres et feux d'antenne
             percent la brume et respirent avec la musique.
           · LE SOL : l'abîme. 1 600 m sous l'œil, les rues de la ville basse — lampadaires sodium, fenêtres, files de
             phares qui roulent — vues À TRAVERS la brume (elles s'y éteignent au loin, fondues en lueur moyenne : pas de moiré).
         ⚠ PRÉCISION : le hachage est sans sinus (Hoskins) — sin() sur de grands arguments dérive en mediump. */
      'uniform float uVille,uPluie,uVilleY,uParis;uniform vec3 uFogCol,uCam;',
      'float vh(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}',
      'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
      '  return mix(mix(vh(i),vh(i+vec2(1.,0.)),f.x),mix(vh(i+vec2(0.,1.)),vh(i+vec2(1.,1.)),f.x),f.y);}',
      'float vfbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(17.1,9.3);a*=.5;}return s;}',
      // une RANGÉE de tours à l infini : N par tour d horizon, toits entre h0 et h1 (en sinus d élévation), fenêtres de wz
      // renvoie (fenêtre allumée, feu d antenne, silhouette, teinte de la fenêtre)
      'vec4 vTours(float az,float y,float N,float s,float h0,float h1,float wz){',
      '  float cw=6.2831853/N,u=az/cw+s*13.7,id=mod(floor(u),N),dx=(fract(u)-.5)*cw,ax=abs(dx),aa=.0009;',
      '  float r=vh(vec2(id,s)),r2=vh(vec2(id+.5,s+3.1)),r3=vh(vec2(id+.25,s+7.7));',
      '  float hw=cw*(.18+.22*r2),top=h0+(h1-h0)*pow(r,1.7)+step(.93,r3)*(h1-h0)*.6;', // des tours MINCES et HAUTES : le village de la pluie
      '  float body=smoothstep(hw+aa,hw-aa,ax)*smoothstep(top+aa,top-aa,y),cap=0.,ant=0.,feu=0.;',
      '  if(r3<.28){vec2 e=vec2(dx/(hw*1.3),(y-top)/(hw*.75));cap=smoothstep(1.1,.9,dot(e,e))*step(top,y);}', // réservoir bombé
      '  else if(r3<.5)cap=smoothstep(hw*.55+aa,hw*.55-aa,ax)*step(top,y)*smoothstep(top+hw+aa,top+hw-aa,y);', // chapeau
      '  if(r2>.62){float ah=hw*(2.5+4.*r);ant=smoothstep(.0012,.0004,ax)*step(top,y)*step(y,top+ah);',        // antenne et son feu rouge
      '    feu=smoothstep(.004,0.,length(vec2(dx,y-top-ah)))*step(.35,fract(uTime*.45+r*7.));}',
      '  vec2 wc=vec2(dx/(wz*.75),y/wz),wi=floor(wc),wf=abs(fract(wc)-.5);',
      '  float win=step(.8,vh(wi+vec2(id*7.3,s*3.)))*smoothstep(.36,.2,max(wf.x,wf.y))*body*step(ax,hw-wz*.4);',
      '  return vec4(win,feu,max(body,max(cap,ant)),vh(wi+id));}',
      'float vTri(vec2 p,vec2 a,vec2 b,vec2 c){',
      '  float e0=(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x),e1=(c.x-b.x)*(p.y-b.y)-(c.y-b.y)*(p.x-b.x),e2=(a.x-c.x)*(p.y-c.y)-(a.y-c.y)*(p.x-c.x);',
      '  return ((e0>=0.&&e1>=0.&&e2>=0.)||(e0<=0.&&e1<=0.&&e2<=0.))?1.:0.;}',
      // LA TOUR DU CHEF (azimut a0, échelle s) : le fût, la tête ronde, deux cornes, deux yeux, la bouche — renvoie (silhouette, yeux, bouche)
      'vec3 vChef(float az,float y,float a0,float s){',
      '  float dx=mod(az-a0+3.1415927,6.2831853)-3.1415927,ax=abs(dx),tw=.024*s,top=.15*s,aa=.0009;',
      '  float m=smoothstep(tw+aa,tw-aa,ax)*step(y,top);',
      '  vec2 e=vec2(dx/(tw*1.55),(y-top)/(tw*1.05));m=max(m,smoothstep(1.08,.92,dot(e,e))*step(top-.002,y));',
      '  m=max(m,vTri(vec2(ax,y-top),vec2(tw*1.05,tw*.5),vec2(tw*1.95,tw*2.5),vec2(tw*.45,tw*.95)));',
      '  float oeil=step(abs(ax-tw*.52),tw*.17)*step(abs(y-top-tw*.4),tw*.1);',
      '  float bouche=step(ax,tw*.55)*step(abs(y-top+tw*.12),tw*.13);',
      '  return vec3(m,oeil,bouche);}',
  ];
  const VILLE_CIEL=[
      /* (2026-09-27, passe perf iPhone, tour 2) LE CIEL DE LA VILLE EN TROIS FONCTIONS — même calcul, réparti selon ce qui a des bords :
         · `villeLisse` : le plafond (bruits à grande échelle), la brume du bas et la LUEUR des quartiers — tout ce qui varie lentement ;
         · `villeFin`   : les lumières FINES de l'abîme (artères, rues, toits, sous 7 km) — ajoutées telles quelles : là où elles
           existent (13° sous l'horizon et plus bas), le mélange haut/bas vaut 0 et `L = G + (1−fl)·fines + fl·lueur moyenne` ;
         · `villeSkyline` : les tours peintes, nettes au pixel.
         `villeCiel` les enchaîne dans l'ordre d'avant (programme PLEIN). */
      'vec3 villeLisse(vec3 d,vec3 ciel){',
      '  float y=d.y;vec3 F=uFogCol,A=mix(uAcc,uAcc2,uFlip),haut=ciel,bas=F;',
      '  float nuit=clamp(1.5-dot(F,vec3(.3,.59,.11))*4.,0.,1.);', // les lumières de la ville ne gagnent que de nuit (carrière : la ville à midi)
      '  float lv=uLvl*(.35+uPulse*.5+uBeatK*.6);',                // ce que la MUSIQUE allume
      '  if(y>.0108&&uPluie>.001){',                               // ---- LE PLAFOND ---- (vague 2 : calculé SEULEMENT sous la pluie — sans elle, haut = ciel au pixel près)
      '    float t=520./max(y,.01);vec2 p=d.xz*t+uCam.xz+vec2(uTime*7.,uTime*3.),q=p/650.;',
      '    float n=vfbm(q+.6*vec2(vn(q*.45+3.7),vn(q*.45-5.1))),dn=smoothstep(.34,.74,n);',
      '    vec3 cc=mix(F*.62+vec3(0.,.004,.02),F*1.3+'+('mix(vec3(.045,.03,.03),uVc[0],uRose)')+'*nuit,dn);', // trouées plus sombres, ventres éclairés par la ville — (2026-10-14, neon-residuel) la lueur est un gris chaud NEUTRE (le lilas fixe +.06,.02,.06 teintait tout le plafond de l'orage et de la pluie, C 14 teinte 281 → C 9 teinte 245 : ardoise)
      '    if(lv*nuit>0.){float wv=.5+.5*sin(dot(p,vec2(.0019,.0011))-uWave*6.2831853);',
      '    cc+=A*dn*wv*wv*.22*lv*nuit;}',                                             // les néons de la ville ondulent sous les nuages
      '    if(uBeatK*uLvl>0.)cc+='+('mix(vec3(.62,.62,.72),uVc[1],uRose)')+'*smoothstep(.6,.95,vn(q*.3+floor(uTime*2.)*1.7))*uBeatK*uBeatK*uBeatK*uLvl*dn*.55;', // l ÉCLAIR : seulement sur les GROSSES frappes (au cube), sinon un orage à chaque coup de grosse caisse
      '    haut=mix(ciel,mix(F,cc,exp(-t/4200.)),uPluie);}',                          // au loin, le plafond se fond dans la brume
      // (2026-09-27, passe perf iPhone) sous 0,6° (t > 48 km) le plafond pèse exp(-t/4200) < 1e-5 : c est la brume, sans ses 7 bruits
      '  else if(y>-.03&&uPluie>.001)haut=mix(ciel,F,uPluie);',
      '  if(y<.03&&nuit>0.){',                                     // ---- LE SOL : l abîme de la ville basse ---- (vague 2 : ses lumières SEULEMENT de nuit — de jour, bas = brume au pixel près)
      '    float t=mix(1600.,450.,uParis)/max(-y,.01);',              // (Paris) le sol remonte à 450 m : la Seine doit se LIRE
      // (2026-09-27, passe perf iPhone) au-delà de 26,5 km (3,5° sous l horizon) les lumières pèsent exp(-t/2300) < 1e-5 : il ne reste que la brume
      '    if(t<26500.){',
      '    vec2 p=(d.xz*t+uCam.xz)*mix(1.,3.5,uParis);',
      '    float qu=smoothstep(.3,.8,vn(p/1500.))*(.5+.5*vn(p/450.+4.2)),qu2=vn(p/2600.+9.1);', // les QUARTIERS : un centre qui brille, des zones éteintes
      '    vec3 G=mix(vec3(1.,.42,.18),mix(uVc[2],vec3(1.,.62,.26),uParis),qu2)*qu*.24;', // (Paris) la lueur des quartiers vire à l or                    // la lueur des quartiers qui monte dans la brume
      '    vec3 L=G+smoothstep(3000.,7000.,t)*vec3(.05,.03,.015)*(.25+.75*qu);',           // au loin (au-delà de 7 km) : la lueur MOYENNE, pas de moiré — les fines sont dans villeFin
      '    bas=F*(1.+.28*smoothstep(-.05,-.6,y)*nuit)+L*exp(-t/2300.)*(1.+.6*lv)*nuit;}', // la brume s éclaire par en dessous
      '    else bas=F*(1.+.28*smoothstep(-.05,-.6,y)*nuit);}',
      /* (2026-10-24, Sacha : « le ciel déconne, il n'y a pas de fondu, c'est moche ») HORIZON SANS COUPURE : hors pluie, le ciel du dessus (corail, bleu
         nuit) basculait en 3° sur la brume du dessous — une ligne franche, la couleur de l'air n'étant pas celle du sol. Maintenant la brume REMONTE
         dans le ciel (≈ 12°, courbe douce, 60 % au ras de l'horizon) : le dégradé du ciel s'y noie, comme le brouillard noie les tours 3D ; la jonction
         s'élargit à ±3°. Sous la pluie (uPluie = 1) le plafond est déjà fondu dans la brume : rien ne change. */
      '  haut=mix(haut,F,(1.-smoothstep(0.,.21,y))*(1.-uPluie)*.6);',
      '  return mix(bas,haut,smoothstep(-.05,.045,y));}',
      /* LA SEINE (2026-09-28, Léo : « et il y a la Seine ») — un méandre dans le repère MONDE du sol de Paris (450 m sous l œil,
         la même parallaxe que l abîme) : l eau plus noire que la brume où tremblent les reflets d or, les QUAIS de pierre et leurs
         lampadaires, un PONT tous les 520 m avec ses deux rangées de lanternes, et les BATEAUX-MOUCHES qui glissent en inondant l eau
         de leurs projecteurs. Renvoie le masque de l eau (les toits allumés ne s y posent pas). */
      'float seineZ(float x){return 900.*sin(x/2300.)+380.*sin(x/870.+1.7);}',
      'float parisSeine(inout vec3 c,vec2 p,vec2 vd,float px,float t,float fl,float nuit){',
      '  float k1=p.x/2300.,k2=p.x/870.+1.7,zc=seineZ(p.x),dz=.3913*cos(k1)+.4368*cos(k2);',
      '  float sd=(p.y-zc)/sqrt(1.+dz*dz),a=abs(sd),Wd=105.,fo=exp(-t/2600.)*(1.-fl)*uParis,aa=min(1.,5./px);',
      '  float eau=smoothstep(Wd+px,Wd-px,a);',
      '  float rip=vn(vec2(p.x/7.,sd/1.6)+vec2(uTime*.9,0.)),ref=pow(rip,7.)*(.35+.65*smoothstep(Wd*.35,Wd,a))*aa;',
      // LES REFLETS : chaque lampadaire des deux quais étire sur l eau un trait d or VERS L ŒIL (vd : la visée au sol), haché par les vaguelettes
      '  vec2 ve=-normalize(vd+vec2(1e-5)),vp=vec2(-ve.y,ve.x);float rf=0.;',
      '  for(int k=-1;k<=1;k++)for(int q=-1;q<=1;q+=2){float lx=(floor(p.x/38.)+float(k)+.5)*38.;',
      '   vec2 L=vec2(lx,seineZ(lx)+float(q)*(Wd+2.)*sqrt(1.+dz*dz));vec2 r=p-L;float al=dot(r,ve),pe=dot(r,vp);',
      '   rf+=step(0.,al)*exp(-al/70.)*exp(-pe*pe/(3.5+px*px*.3))*(.4+.6*vn(vec2(al/4.,pe*.7)+vec2(uTime*1.5,0.)));}',
      // (essai du 28/09 : bordée de lampadaires, elle se lisait comme une ROUTE) — le SCINTILLEMENT de lune argenté et les reflets d or
      // CASSÉS par le courant disent « de l eau »
      '  float gl=pow(vn(vec2(p.x/3.2,sd/1.1)+vec2(uTime*.7,uTime*.2)),9.)*aa,co=pow(vn(vec2(p.x/15.,sd/.8)+vec2(uTime*.35,0.)),5.)*smoothstep(Wd*.2,Wd*.9,a)*aa;',
      '  c=mix(c,uFogCol*.24+vec3(.012,.022,.055)+vec3(.55,.66,1.)*gl*1.1+vec3(1.,.64,.3)*(ref*.6+rf*1.6+co*.9)*nuit,eau*fo);',
      '  float quai=smoothstep(Wd-px,Wd+px,a)*smoothstep(Wd+16.+px,Wd+16.-px,a);',
      '  c=mix(c,vec3(.34,.29,.22)*(.4+.6*nuit),quai*fo*.8);',
      '  c+=vec3(1.,.72,.38)*smoothstep(2.4+px*.8,0.,length(vec2((fract(p.x/38.)-.5)*38.,a-Wd-12.)))*aa*aa*1.7*fo*nuit;', // les lampadaires des quais (au loin ils s éteignent : pas de liseré continu)
      '  float bx=(fract(p.x/520.)-.5)*520.,pont=smoothstep(15.+px,15.-px,abs(bx))*smoothstep(Wd+20.+px,Wd+20.-px,a);',
      '  c=mix(c,vec3(.36,.3,.22)*(.45+.55*nuit),pont*fo);',
      '  c+=vec3(1.,.8,.5)*smoothstep(1.9+px*.8,0.,length(vec2(abs(bx)-13.,(fract(sd/18.)-.5)*18.)))*step(a,Wd+20.)*aa*1.8*fo*nuit;',
      '  float cel=floor(p.x/1300.),hb=vh(vec2(cel,3.7)),dr=hb<.5?1.:-1.,on=step(.22,fract(hb*13.1));',
      '  vec2 bq=vec2(p.x-(cel+fract(hb*7.+uTime*.0065*dr))*1300.,sd-dr*Wd*.36);',
      '  c=mix(c,vec3(1.,.93,.8),step(abs(bq.x),16.)*step(abs(bq.y),4.5)*on*fo);',                              // la coque blanche
      '  c+=vec3(1.,.8,.5)*exp(-dot(bq,bq)/2200.)*.6*eau*on*fo*nuit;',                                           // ses projecteurs sur l eau
      '  return eau*fo;}',
      'void villeFin(inout vec3 c,vec3 d){',
      '  float y=d.y;vec3 F=uFogCol;',
      '  float nuit=clamp(1.5-dot(F,vec3(.3,.59,.11))*4.,0.,1.),lv=uLvl*(.35+uPulse*.5+uBeatK*.6);',
      '  if(y<.03&&nuit>0.){float t=mix(1600.,450.,uParis)/max(-y,.01);',
      /* (2026-09-27, passe perf iPhone) AU-DELÀ DE 7 KM (les 13 derniers degrés sous l'horizon, la moitié de l'abîme vu en vol), le
         mélange du bas prenait DÉJÀ 100 % de la lueur moyenne : artères, rues, toits et leur scintillement étaient calculés pour être
         multipliés par zéro. Ils ne sont plus calculés que là où ils comptent — même image. */
      '  if(t<7000.){',
      '    float px=t*.0016/max(-y,.06),fl=smoothstep(3000.,7000.,t);',               // px : ce que couvre un pixel au sol (m) — l anticrénelage suit la distance
      '    vec2 p0=d.xz*t+uCam.xz,p=p0*mix(1.,3.5,uParis);float px0=px;px*=mix(1.,3.5,uParis);', // (Paris) sol 3,5× plus proche : la ville y garde sa finesse
      '    float qu=smoothstep(.3,.8,vn(p/1500.))*(.5+.5*vn(p/450.+4.2));',
      // LES ARTÈRES : les lignes de niveau de deux bruits — des routes qui SERPENTENT, se croisent, bouclent. Une grille régulière se lisait
      // comme un sol de synthwave (essai du 26/09) ; vue d en haut à travers la pluie, une ville est un réseau irrégulier de traînées.
      '    float n1=vn(p/950.),n2=vn(p/1350.+5.3),n3=vn(p/420.+11.7),wn=.022+px*.0011;',
      '    float route=max(smoothstep(wn,0.,abs(n1-.5)),smoothstep(wn,0.,abs(n2-.5)))*min(1.,.03/wn);',
      '    float rue=smoothstep(wn*.7,0.,abs(n3-.5))*qu*min(1.,.02/wn);',                 // les rues du quartier : seulement là où ça vit
      '    vec2 ci=floor(p/24.),cf=fract(p/24.)-.5;float hl=vh(ci);',
      '    float pt=step(1.-.32*qu,hl)*smoothstep(.3+px/48.,0.,length(cf))*min(1.,8./px);', // toits et fenêtres, flous dans la brume
      '    pt*=.75+.25*sin(uTime*(1.+hl*3.)+hl*40.);',                                     // quelques-uns scintillent
      '    vec3 pc=mix(vec3(1.,.66,.36),vec3(.4,.85,1.),step(.985,hl));pc=mix(pc,uVc[3],step(.995,hl));',
      '    float eau=uParis>.001?parisSeine(c,p0,d.xz,px0,t,fl,nuit):0.;',                        // (Paris) la SEINE : pas de toits allumés sur l eau
      '    c+=(vec3(1.,.55,.22)*(route*.5+rue*.3)+pc*pt)*(1.-eau)*(.25+.75*qu)*(1.-fl)*exp(-t/2300.)*(1.+.6*lv)*nuit;}}}',
      // PARIS (2026-09-28) : deux rangées de TOITS BAS (mansardes plates, cheminées, lucarnes allumées) — Paris n'a pas de tours
      'void parisToits(inout vec3 c,float y,float az,vec3 F,float nuit){',
      '  float lum=.35+.65*nuit;',
      '  for(int k=0;k<2;k++){float s=float(k)+1.,N=k==0?150.:92.,h0=k==0?-.02:-.013,h1=k==0?-.005:.004;',
      '    float cw=6.2831853/N,u=az/cw+s*7.3,id=floor(u),fx=fract(u),r=vh(vec2(id,s)),top=h0+(h1-h0)*r;',
      '    float body=step(y,top),ch=step(.55,vh(vec2(id*3.1,s)))*step(abs(fx-.3),.035)*step(y,top+.003)*step(top,y);',
      '    vec2 wc=vec2(fx*7.,(top-y)/.0028),wi=floor(wc),wf=abs(fract(wc)-.5);',
      '    float win=step(.5,vh(wi+vec2(id,s)))*step(max(wf.x,wf.y),.22)*body*step(.6,wc.y);',
      '    float fo=smoothstep(-.1,0.,y);vec3 dk=F*(.30+.1*s)+vec3(.006,.005,.008);',
      '    vec3 sil=mix(F,dk,.35*fo)+vec3(1.,.72,.38)*win*(.22+.12*s)*lum*fo;',
      '    c=mix(c,sil,max(body,ch)*fo);}}',
      'void villeSkyline(inout vec3 c,vec3 d,float az){',
      '  vec3 F=uFogCol;float nuit=clamp(1.5-dot(F,vec3(.3,.59,.11))*4.,0.,1.),lv=uLvl*(.35+uPulse*.5+uBeatK*.6);',
      // ---- LA SKYLINE : du plus loin au plus proche, chaque rangée un peu moins noyée dans la brume ----
      /* ⚠ (2026-09-26, constat de la passe graphique) LA SKYLINE FLOTTAIT : posée sur l horizon (y≈0), alors que la route de la
         ville descend en SPIRALE au-dessus des toits — la ville 3D est donc SOUS l horizon, et la rangée peinte se lisait comme
         une bande en pointillés suspendue à mi-hauteur au-dessus des vraies tours. Elle se pose désormais à l ÉLÉVATION où
         seraient des toits lointains à l altitude de la ville (`uVilleY`, posé par la boucle d après CITY.n.routeY, ~3,5 km) :
         vue d en haut, elle passe SOUS l horizon, derrière la forêt 3D, noyée de brume ; ses fenêtres sont un cran plus sourdes. */
      '  float y=d.y-uVilleY;',
      '  if(uParis>.5){float yp=d.y;if(yp>-.1&&yp<.03)parisToits(c,yp,az,F,nuit);return;}', // (Paris) le sol est un plan 450 m sous l œil : son horizon est à y=0, les toits lointains s y posent // PARIS : les toits, pas les tours                                      // (le plafond et l abîme sont faits : y ne sert plus qu à la skyline)
      '  if(y>-.1&&y<.42){',                                         // (vague 2) la SKYLINE seulement dans sa bande : sous −0,1 le pied est noyé (fo = 0), au-dessus de 0,42 plus une antenne — image identique
      '  float fo=smoothstep(-.1,.015,y),lum=(1.+.7*lv)*(.35+.65*nuit)*.75;', // fo : le PIED des tours se noie — sous l horizon il ne reste que la brume et l abîme
      '  vec3 f0=vec3(1.,.64,.3),f1=vec3(.42,.88,1.),dk=F*.35+vec3(.004,.006,.02),sil;vec4 T;',
      /* (2026-09-27, passe perf iPhone) chaque rangée s arrête à SON plus haut point possible (toit le plus haut + antenne la plus longue
         + son feu : .159 · .253 · chef .211) — au-dessus elle rendait silhouette 0 et feu 0, calculés pour rien. Même image. */
      '  if(y<.16){T=vTours(az,y,190.,1.,-.035,.03,.0024);',
      '  sil=mix(F,dk,.16*fo)+mix(f0,f1,step(.8,T.w))*T.x*.22*fo*lum;c=mix(c,sil,T.z*fo);c+=vec3(1.,.18,.14)*T.y*.3*lum*fo;}',
      '  if(y<.254){T=vTours(az,y,120.,2.,-.015,.065,.0032);',
      '  sil=mix(F,dk,.25*fo)+mix(f0,f1,step(.8,T.w))*T.x*.32*fo*lum;c=mix(c,sil,T.z*fo);c+=vec3(1.,.18,.14)*T.y*.45*lum*fo;}',
      '  if(y<.212){vec3 H=vChef(az,y,1.05,1.)+vChef(az,y,-2.25,.82);',
      '  sil=mix(F,dk,.36*fo)*(1.-.35*H.z)+vec3(1.,.84,.37)*H.y*(.55+.2*sin(uTime*.7))*lum;c=mix(c,sil,min(1.,H.x+H.y)*fo);}',
      '  T=vTours(az,y,72.,3.,.0,.1,.0042);',
      '  sil=mix(F,dk,.34*fo)+mix(f0,f1,step(.8,T.w))*T.x*.42*fo*lum;c=mix(c,sil,T.z*fo);c+=vec3(1.,.18,.14)*T.y*.6*lum*fo;}',
      '}',
      'vec3 villeCiel(vec3 d,float az,vec3 ciel){vec3 c=villeLisse(d,ciel);villeFin(c,d);villeSkyline(c,d,az);return c;}',
  ];
  const MER=[
      '#ifndef MER_FPK','#define MER_FPK 1.','#endif', // (tour 2) l empreinte d un pixel, en pixels de CETTE passe (la passe lisse compte les siens)
      /* ===================== LA MER DE NUAGES PEINTE (2026-09-26) — niveau NUAGES =====================
         MESURÉ sur captures (midi, aprem, matin) : sous l'horizon il n'y avait que le bas du dégradé multiplié par le biome — un
         APLAT bleu roi saturé, d'une autre couleur que la brume : la route lointaine et les nuages 3D noyés de brouillard s'y
         DÉCOUPAIENT comme des gommettes, et le « niveau dans les nuages » n'avait pas de mer de nuages à perte de vue.
         LE PRINCIPE (celui de l'abîme de la ville) : un PLAFOND DE NUAGES vu d'en haut, calculé par direction du monde — aucune
         géométrie, aucun bord, parallaxe vraie avec la caméra (`uCam`) et le vent. Le pont est à 480 m sous le niveau zéro du monde
         (sous les nuages 3D de la mer, qui s'y posent devant), et TOUT converge vers la couleur de la brume (`uFogCol`) au loin :
         ce que le brouillard fait aux objets, la mer le fait à l'horizon — la route et les nuages lointains s'y FONDENT.
         Modelé : des moutonnements (fbm déformé), leur flanc tourné vers le soleil éclairé (un 2e échantillon décalé vers le soleil
         donne la pente), les creux dans le bleu du ciel. ⚠ ANTICRÉNELAGE : chaque octave s'éteint quand l'empreinte d'un pixel au sol
         (`fp`) dépasse sa période — sinon moiré scintillant au ras de l'horizon. */
      'uniform float uMer;',
      /* (2026-09-27, passe perf iPhone) LES DEUX FBM DE LA MER EN UNE PASSE — `mfbm2` rend (n au point, n au point décalé vers le
         soleil) : c'est le même calcul qu'avant, octave par octave, au bit près, avec deux économies SANS effet sur l'image :
         (1) les deux points tombent le plus souvent dans la MÊME case du réseau (décalage de .045 case à la 1re octave, .38 à la 4e) —
         les quatre hachages des coins sont alors partagés au lieu d'être refaits ; (2) une octave éteinte par l'anticrénelage (poids
         nul au ras de l'horizon) n'échantillonne plus rien : `mix(.5,vn,0.)` valait déjà exactement .5. La mer était le 1er poste du
         dôme en vol (on la voit sur toute la moitié basse de l'écran). */
      'vec2 mfbm2(vec2 p,vec2 r,float fp){vec2 s=vec2(0.);float a=.5,f=1.;for(int i=0;i<4;i++){float k=1.-smoothstep(.3,.8,fp*f);',
      '  if(k>0.){vec2 ip=floor(p),ir=floor(r),fa=fract(p),fb=fract(r);fa=fa*fa*(3.-2.*fa);fb=fb*fb*(3.-2.*fb);',
      '    float h0=vh(ip),h1=vh(ip+vec2(1.,0.)),h2=vh(ip+vec2(0.,1.)),h3=vh(ip+vec2(1.,1.));',
      '    float na=mix(mix(h0,h1,fa.x),mix(h2,h3,fa.x),fa.y);',
      '    if(ir!=ip){h0=vh(ir);h1=vh(ir+vec2(1.,0.));h2=vh(ir+vec2(0.,1.));h3=vh(ir+vec2(1.,1.));}',
      '    float nb=mix(mix(h0,h1,fb.x),mix(h2,h3,fb.x),fb.y);',
      '    s+=a*vec2(mix(.5,na,k),mix(.5,nb,k));}',
      '  else s+=vec2(a*.5);',
      '  p=p*2.03+vec2(17.1,9.3);r=r*2.03+vec2(17.1,9.3);f*=2.03;a*=.5;}return s;}',
      /* L'ABÎME BLEU (2026-09-28, Sacha : « il faut que le sol du niveau nuages soit tout bleu, sans motif de nuages dessus ») : sous
         l'horizon, plus de mer peinte — le CIEL continue : la brume de l'horizon plonge dans le bleu du zénith du biome, qui s'approfondit
         vers le bas (on vole au-dessus du vide, les cumulus 3D du ciel de coton flottent dessus). `MER_MOTIF=true` rend l'ancienne mer. */
      MER_MOTIF?'':'vec3 merNuages(vec3 d,float y,float sd){vec3 F=uFogCol;if(y>=-.004)return F;'+
        'vec3 b1=vec3(.085,.105,.30)*uSkyMul,b2=vec3(.05,.07,.22)*uSkyMul;'+          // le bleu du ciel du biome : clair sous l horizon, profond tout en bas
        'vec3 m=mix(b1,b2,smoothstep(-.08,-.7,y));m+=uSunTint*pow(sd,6.)*.10*uSunHalo;'+ // à contre-jour, le vide garde un reflet chaud du soleil
        'return mix(m,F,smoothstep(-.12,-.004,y));}',
      /* LA MER DE NUAGES DU JOUR D ALTITUDE (2026-09-30, Zelda : Tears of the Kingdom) — sous l horizon, un PLANCHER de cumulus PLEIN
         (quelques trouées seulement, l azur profond au fond), vu d en haut, calculé par direction du monde comme l ancienne mer (même
         anticrénelage, même parallaxe vraie, même coût : mfbm2). Les dômes : sommets crème au soleil, flancs bleu-lavande à l ombre,
         creux plus sombres ; côté soleil la mer s embrase ; au loin tout se noie dans la brume (perspective aérienne) et SEULE la
         ligne d horizon rejoint le ciel. Mélangée par uJour (0 = la mer d avant). */
      /* (2026-09-30, niveau 1 v2 — la mer de la v1 se lisait comme une AQUARELLE ÉTALÉE : cellules de 1,3 km étirées par un remous fort,
         trouées d azur profond qui, rasantes, devenaient des traînées sombres horizontales, une lumière molle). LA MER SCULPTÉE : des cellules
         de cumulus plus petites (uMzA.x m), un bruit « gonflé » (1−|2n−1|, uMzA.y) qui fait des DÔMES ronds aux creux nets, une lumière
         côté soleil / côté ombre plus franche (uMzA.z), les creux entre les dômes assombris (uMzB.z), un remous léger (uMzA.w) ; au loin la
         mer se FERME (uMzB.y : plus de trouées étirées en rubans) et les trouées prennent l azur du milieu du ciel (uMzB.w), pas l encre. */
      'vec3 merZ(vec3 d,float y,float sd){vec3 F=uFogCol;if(y>=-.002)return F;float yy=min(y,-.0006);',
      '  float t=max(160.,uCam.y+420.)/(-yy);',
      '  vec2 p=d.xz*t+uCam.xz+vec2(uTime*6.,uTime*2.4),q=p/uMzA.x;',
      '  float fp=t*.0016/max(-yy,.02)/uMzA.x*MER_FPK;',
      '  vec2 w=vec2(vn(q*.23+3.7),vn(q*.23-5.1));q+=uMzA.w*w;',
      '  vec2 sx=normalize(uSunDir.xz+vec2(1e-4));',
      '  vec2 n2=mfbm2(q,q+sx*.05,fp);',
      '  float n=mix(n2.x,1.-abs(2.*n2.x-1.),uMzA.y),ns=mix(n2.y,1.-abs(2.*n2.y-1.),uMzA.y);',
      '  float far=1.-exp(-t/9000.);',
      '  float lit=clamp(.5+(n-ns)*uMzA.z,0.,1.);',
      '  float big=vn(q*.07+11.3)-.5;',
      '  float cov=smoothstep(uMzB.x-uMzB.y*far-.22*big,uMzB.x+.14-uMzB.y*far-.22*big,n),cr=smoothstep(.55,.82,n),ao=smoothstep(uMzB.x,uMzB.x+.32,n);',
      '  vec3 trou=mix(mix(uJZen*.6,uJMid*.85,uMzB.w),uMzT.rgb,uMzT.w);',
      '  vec3 ombre=mix(mix(uJMid*.58+vec3(.10,.10,.16),F,.2),uMzO.rgb,uMzO.w);',
      '  vec3 haut=mix(mix(vec3(1.,.985,.96),uSunTint,.18),uMzH.rgb,uMzH.w);',
      '  vec3 m=mix(ombre,haut,lit*(.45+.55*cr));',
      '  m*=1.-uMzB.z*(1.-ao);',
      '  m=mix(trou,m,cov);',
      '  m+=uJSol*pow(sd,4.)*cov*.35;',
      '  m=mix(m,F,(1.-exp(-t/uMerLoin))*.8);',
      '  return mix(m,F,smoothstep(-.03,-.002,y));}',
      MER_MOTIF?'vec3 merNuages(vec3 d,float y,float sd){':'vec3 merNuagesMotif(vec3 d,float y,float sd){', // (l'ancienne mer peinte, gardée intacte)
      '  vec3 F=uFogCol;if(y>=-.004)return F;float yy=min(y,-.0008);',   // (perf iPhone) sur la ligne d horizon la mer EST la brume (dernier mix à 1)
      '  float t=max(140.,uCam.y+480.)/(-yy);',                       // la distance au pont de nuages le long du regard (m)
      '  vec2 p=d.xz*t+uCam.xz+vec2(uTime*4.,uTime*1.6),q=p/900.;', // parallaxe vraie + dérive du vent
      '  float fp=t*.0016/max(-yy,.02)/900.*MER_FPK;',                         // empreinte d un pixel, en périodes de base
      '  vec2 w=vec2(vn(q*.4+3.7),vn(q*.4-5.1));q+=.85*w;',
      '  vec2 sx=normalize(uSunDir.xz+vec2(1e-4));',
      '  vec2 n2=mfbm2(q,q+sx*.045,fp);float n=n2.x;',
      '  float lit=clamp(.5+(n-n2.y)*7.,0.,1.);',          // le flanc tourné vers le soleil prend la lumière
      '  float cov=smoothstep(.36,.66,n);',                             // le dessus des moutons
      // ⚠ PAS DE LAIT (essai du 26/09 : une mer blanche à 60 % et fondue dans une brume pâle = tout le bas de l écran laiteux, les
      // nuages 3D s y perdaient). Les TROUÉES gardent le bleu roi qu avait le bas du ciel (blw × biome) : les moutons blancs
      // se DÉTACHENT dessus, et la brume pâle ne revient que sur les 3 derniers degrés, là où les objets lointains s y noient.
      '  vec3 creux=vec3(.27,.15,.30)*uSkyMul*1.25;',                   // les trouées : le bleu roi du bas du ciel d origine
      '  vec3 ombre=mix(creux,F,.45);',                                 // le flanc à l ombre des moutons
      '  vec3 haut=mix(vec3(1.,.99,.97),uSunTint,.28)*(.86+.24*lit);', // les sommets : crème au soleil du biome
      '  vec3 m=mix(creux,mix(ombre,haut,lit*.75+.25),cov);',
      '  m+=uSunTint*pow(sd,5.)*cov*.28*uSunHalo;',                     // à contre-jour, les moutons s ourlent d or
      '  m=mix(mix(F,creux,.4),m,exp(-t/9000.));',                       // la perspective aérienne : le lointain bleuit
      '  return mix(m,F,smoothstep(-.055,-.004,y));}',                   // …et SEULE la ligne d horizon rejoint la brume
  ];
  const COUCHES={
    /* PARIS AU SOL (2026-09-28, Léo : « un ciel travaillé ») — le ciel de TROIS HEURES (uParisT : 0 dorée · 1 bleue · 2 nuit, fondu
       sur la distance parcourue) : dégradé de chaque heure, une couche d altocumulus ÉCLAIRÉS PAR EN DESSOUS (or et argent face au
       couchant, rose puis ardoise à l heure bleue, la ville orange les allume la nuit), le disque du soleil qui se couche dans l axe
       des Champs-Élysées. Sous l horizon : la brume de la ville. Mélangé par uParis (0 ailleurs : rien ne change). */
    paris:[
      'uniform float uParisT;',
      'vec3 parisDegrade(float y,float sd){float yy=max(y,0.),T=uParisT;',
      '  vec3 hO=mix(vec3(.97,.70,.56),vec3(1.,.74,.44),pow(sd,5.)),cO=mix(hO,vec3(.66,.69,.84),smoothstep(0.,.17,yy));cO=mix(cO,vec3(.30,.47,.78),smoothstep(.14,.62,yy));',
      '  cO+=vec3(1.,.58,.26)*pow(sd,20.)*.55*(1.-smoothstep(0.,.35,yy));',
      '  vec3 hB=mix(vec3(.46,.43,.66),vec3(.95,.56,.44),pow(sd,5.)*.85),cB=mix(hB,vec3(.21,.29,.60),smoothstep(0.,.2,yy));cB=mix(cB,vec3(.06,.10,.31),smoothstep(.2,.7,yy));',
      '  vec3 cN=mix(vec3(.21,.14,.18),vec3(.05,.06,.14),smoothstep(0.,.16,yy));cN=mix(cN,vec3(.012,.018,.05),smoothstep(.16,.6,yy));',
      '  vec3 c=T<1.?mix(cO,cB,T):mix(cB,cN,T-1.);',
      '  return mix(c,uFogCol,smoothstep(0.,-.06,y));}',
      'void parisCiel(inout vec3 col,vec3 d,float y,float sd){',
      '  vec3 c=parisDegrade(y,sd);float T=uParisT;',
      '  if(y>.012){float t=2600./y;if(t<60000.){',
      '    vec2 p=d.xz*t+uCam.xz*.9+vec2(uTime*6.,uTime*2.),q=p/2300.;',
      '    float n=vfbm(q+.55*vec2(vn(q*.5+2.1),vn(q*.5-3.7))),st=vn(vec2(q.x*.4,q.y*3.)+7.);',
      '    float dn=smoothstep(.47,.77,n)*(.72+.28*st)*exp(-t/24000.),ep=smoothstep(.56,.95,n);',
      '    vec3 lO=mix(vec3(1.,.66,.55),vec3(1.25,.86,.52),pow(sd,3.)),dO=vec3(.58,.48,.64);',
      '    vec3 lB=mix(vec3(.50,.38,.55),vec3(.95,.52,.46),pow(sd,3.)),dB=vec3(.17,.19,.36);',
      '    vec3 lN=vec3(.22,.14,.13),dN=vec3(.05,.05,.09);',
      '    vec3 cc=T<1.?mix(mix(lO,dO,ep),mix(lB,dB,ep),T):mix(mix(lB,dB,ep),mix(lN,dN,ep),T-1.);',
      '    c=mix(c,cc,dn*.92);}}',
      '  float dk=smoothstep(.99982,.99992,sd)*(1.-smoothstep(.25,.7,T));c=mix(c,vec3(1.,.9,.72)*3.2,dk);',
      '  c+=vec3(1.,.62,.3)*pow(sd,400.)*1.2*(1.-smoothstep(.25,.8,T));',
      '  col=mix(col,c,uParis);}'],
    /* LES PICS DE JADE (2026-10-09, Léo) — le ciel d un rouleau peint : horizon crème, lavis jade vers le zénith, un soleil pâle, des
       voiles de nuage étirés ; QUATRE rangées de monts à l infini (les crêtes du Huangshan au fond, trois peignes de piliers de
       Zhangjiajie devant), chacune plus nette que celle de derrière, le pied noyé dans la brume ; sous l horizon la MER DE NUAGES (un plan
       à uJMerY : parallaxe vraie avec la caméra). Bords anticrénelés à la taille du pixel (uJPx, en radians). uJade = 0 ailleurs. */
    jade:[
      'uniform float uJade,uJMerY,uJPx,uEauT,uSous;uniform vec3 uJdZ,uJdH,uJdR,uJdB,uJdS,uJdM,uJdL,uSousC;uniform vec4 uEauW,uJdK;', /* (2026-10-13) uJdK : le TEMPS QU IL FAIT sur le rouleau (x soleil peint, y lumière d or : kasumi et voiles, z le fleuve, w le disque devient LUNE) — 1,1,1,0 = le rouleau de Léo */ 'uniform vec4 uEauP[12];',
      'float jh(float x){return fract(sin(x*127.13+.71)*43758.5453);}',
      'float jn(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(jh(i),jh(i+1.),f);}',
      'float jCrete(float a,float s){float r=0.,am=.55,f=3.1;', // des crêtes déchiquetées : un bruit replié, quatre octaves
      '  for(int i=0;i<4;i++){float n=jn(a*f+s+float(i)*7.31);r+=am*(1.-abs(n*2.-1.));f*=2.17;am*=.47;}return r;}',
      // UNE RANGÉE DE PILIERS : la part de la direction (a,y) couverte — N piliers par tour d horizon, sommets entre h0 et h1
      'float jPeigne(float a,float y,float N,float s,float h0,float h1,float w0){',
      '  float u=a*N/6.2831853+s*31.7,id=floor(u),f=fract(u)-.5,c=0.,k2=6.2831853/N;',
      '  for(int k=-1;k<=1;k++){float i2=id+float(k),r1=jh(i2+s),r2=jh(i2*1.37+s*2.1),r3=jh(i2*2.71+s*4.3);',
      '    if(r3<.16)continue;',                                            // des trouées dans la rangée
      '    float cx=float(k)+(r2-.5)*.6,top=mix(h0,h1,r2*r2*.6+r1*.4),w=w0*(.40+.85*r1)*k2;',
      '    float e=clamp((y-h0*.2)/max(top-h0*.2,1e-4),0.,1.),wr=w*(1.-.25*e*e)*(1.+.12*sin(y*900.+i2*3.1));', // il s AFFINE en montant, ses flancs ondulent
      '    float dx=abs(f-cx)*k2,tp=top-wr*.85*pow(min(1.,dx/max(wr,1e-5)),2.2);',                         // le sommet BOMBÉ (la forêt sur la tête)
      '    float bo=top-(top-h0*.2)*(.55+.35*r3)-wr*1.6*pow(min(1.,dx/max(wr,1e-5)),1.5);',                    // la POINTE du dessous : la montagne flotte
      '    c=max(c,clamp((wr-dx)/uJPx+.5,0.,1.)*clamp((tp-y)/uJPx+.5,0.,1.)*smoothstep(bo,bo+wr*1.2,y));}',
      '  return c;}',
      /* (v12, Léo : « ajoute des montagnes au loin, simule une sorte de paysage poétique ») LE LOINTAIN : quatre chaînes en plans de lavis
         sur l horizon — la plus lointaine haute et pâle comme la brume, les plus proches plus basses et plus sombres (le gris-vert de la
         roche), des pics à la Huangshan ; leur pied se noie dans la brume au ras du fleuve. Une crête périodique (deux bruits fondus d un
         bout à l autre du tour d horizon : pas de couture derrière soi). Le fleuve les reflète (voir plus bas). */
      'vec4 jLointain(float az,float y){vec3 B=uJdB;vec4 o=vec4(0.);float t=(az+3.14159)/6.28318;',
      '  for(int i=0;i<5;i++){float fi=float(i),h=.150-.024*fi,f=1.1+1.15*fi,s=fi*13.7+2.1;',
      '    float cr=mix(jCrete(az*f,s),jCrete((az-6.28318)*f,s),t),top=h*(.18+.82*pow(clamp(cr,0.,1.),1.6));',
      '    float cv=clamp((top-y)/uJPx+.5,0.,1.)*smoothstep(-.006,-.001,y);',
      '    vec3 m=mix(vec3(.60,.70,.79),vec3(.20,.31,.31),fi/4.);m=mix(m,uJdR,.15*fi/4.);',  // du gris-bleu du lointain au jade-encre du proche
      '    m*=.92+.16*smoothstep(top*.3,top,y);',                                // le haut des crêtes un peu plus clair (la lumière)
      '    m=mix(m,B,smoothstep(top*.42,-.004,y)*.9);',                    // le pied dans la brume
      '    o.rgb=mix(o.rgb,m,cv);o.a=max(o.a,cv);}',
      '  return o;}',
      /* (v13, Léo : « la mer, beaucoup plus de relief, plus réaliste… en cubes minuscules ») LA MER EN CUBES : des colonnes de cubes de JMS m
         qui montent et descendent (quatre houles qui se croisent + un bruit, en cubes entiers : ±20 m de relief) ; chaque rayon qui regarde
         l eau parcourt les cases une à une (DDA) dans la tranche des vagues : il touche le DESSUS d une colonne (le ciel s y reflète, Fresnel,
         l éclat du soleil, l écume sur les crêtes) ou un FLANC (plus sombre). Plus loin que la portée du parcours, l eau lisse d avant. */
      JADE_EAU_GLSL,
      'vec4 jMerCubes(vec3 o,vec3 d,out vec3 N,out vec2 cc,out float hh){N=vec3(0.,1.,0.);cc=vec2(0.);hh=0.;',
      '  if(d.y>-1e-4)return vec4(-1.);float yT=uJMerY+6.*JMS,yB=uJMerY-7.*JMS,t0=max(0.,(yT-o.y)/d.y),t1=(yB-o.y)/d.y;if(t0>2600.)return vec4(-1.);vec3 p=o+d*t0;',
      '  vec2 dd=vec2(abs(d.x)<1e-5?1e-5:d.x,abs(d.z)<1e-5?1e-5:d.z),st=sign(dd),c=floor(p.xz/JMS),tm=((c+step(0.,dd))*JMS-p.xz)/dd,tdl=JMS/abs(dd),nr=vec2(0.);float tc=0.;',
      '  for(int i=0;i<48;i++){float h=jMerH(c),top=uJMerY+h*JMS;',
      '    if(p.y+d.y*tc<=top){N=vec3(-st.x*nr.x,0.,-st.y*nr.y);cc=c;hh=h;return vec4(p+d*tc,t0+tc);}',          // un FLANC
      '    float tx=min(tm.x,tm.y);if(p.y+d.y*tx<=top){float th=(top-p.y)/d.y;N=vec3(0.,1.,0.);cc=c;hh=h;return vec4(p+d*th,t0+th);}', // le DESSUS
      '    if(tm.x<tm.y){c.x+=st.x;tm.x+=tdl.x;nr=vec2(1.,0.);}else{c.y+=st.y;tm.y+=tdl.y;nr=vec2(0.,1.);}tc=tx;if(t0+tc>t1)break;}',
      '  return vec4(-1.);}',
      /* (2026-10-13) LE DESSOUS DE LA MER (l objectif sous l eau, uSous) : le bleu de l eau, sombre vers le fond, clair vers la surface ; la
         FENÊTRE DE SNELL au-dessus (le ciel, à moins de ~48° de la verticale) ; des RAIS de lumière qui bougent avec la houle. */
      'vec3 jadeSous(vec3 d){d=normalize(d);float up=d.y,az=atan(d.x,-d.z);',
      '  vec3 c=mix(uSousC*.62,uSousC*1.22,smoothstep(-.75,.35,up));',
      '  float ry=pow(max(up,0.),1.6)*pow(.5+.5*sin(az*17.+uEauT*.55)*sin(az*6.-uEauT*.37+1.3),2.);c+=vec3(.50,.80,.72)*ry*.30;',
      '  float win=smoothstep(.56,.82,up);c=mix(c,mix(uJdH,uJdZ,.35)*1.06+vec3(.05,.08,.07)*sin(az*9.+uEauT*1.3),win*.88);',
      '  return c;}',
      'vec3 jadeCiel(vec3 d){d=normalize(d);',                                // (v17 bis) vDir arrive interpolé entre les sommets du dôme : renormalisé, le soleil est un DISQUE (il sortait en goutte)
      '  float y=d.y,yy=max(y,0.),az=atan(d.x,-d.z),sd=max(dot(d,uSunDir),0.);',
      /* (v17 bis, Léo : « un ciel asiatique ») LE CIEL DES PARAVENTS ET DES ROULEAUX : un dégradé de SOIE (bleu doux en haut, céladon, crème,
         or pâle à l horizon : les quatre teintes jdZ/jdL/jdM/jdH), un grand SOLEIL VERMILLON bas sur l horizon (le disque plein, bord net
         adouci, sans halo de photo), et les KASUMI : des bandes de brume DORÉE couchées sur l horizon, aux bouts arrondis, qui coupent le
         lointain par endroits (les nuages d or des paravents japonais). */
      '  vec3 c=mix(uJdH,uJdM,smoothstep(.0,.08,yy));c=mix(c,uJdL,smoothstep(.06,.30,yy));c=mix(c,uJdZ,smoothstep(.24,.85,yy));',
      '  c+=uJdS*(pow(sd,6.)*.18)*(1.-.6*smoothstep(0.,.4,yy));',

      '  if(y>.012&&y<.4){float t=1.0/y;vec2 p=d.xz*t*1.05+vec2(uTime*.003,0.);', // les voiles de lavis, étirés
      '    float n=vfbm(vec2(p.x*.55,p.y*2.4)+3.7);c=mix(c,mix(uJdH,mix(uJdH,vec3(1.),uJdK.y),.35),smoothstep(.56,.86,n)*.42*smoothstep(.012,.06,y)*(1.-smoothstep(.22,.4,y)));}',
      '  {vec4 lo=jLointain(az,y);c=mix(c,lo.rgb,lo.a);}',                  // (v12) le LOINTAIN, derrière les rangées de piliers
      '  {vec3 sv=normalize(vec3(uSunDir.x,0.,uSunDir.z)*.966+vec3(0.,.259,0.));float sv9=max(dot(d,sv),0.);',               // le SOLEIL vermillon, posé AU-DESSUS des monts (~15°)
      '   float dk=1.-smoothstep(.99680,.99725,sv9);vec3 ve=mix(vec3(.90,.26,.15),vec3(.97,.42,.22),smoothstep(.99725,.99990,sv9));',
      '   ve=mix(ve,vec3(.80,.86,.98),uJdK.w);c=mix(c,ve,(1.-dk)*.96*uJdK.x);c+=mix(vec3(.50,.16,.08),vec3(.20,.24,.34),uJdK.w)*pow(sv9,120.)*.22*dk*uJdK.x;}',
      '  for(int i=0;i<4;i++){float fi=float(i),hc=.020+fi*.062+.014*sin(az*1.3+fi*2.1),th=.010+.005*fi;',                   // (v17 bis) les KASUMI : bandes d or couchées
      '    float on=smoothstep(.42,.58,vn(vec2(az*(1.1+fi*.35)+fi*7.3,fi*3.1)));float b=(1.-smoothstep(th*.55,th,abs(y-hc)))*on;',
      '    vec3 kg=mix(vec3(.99,.86,.58),vec3(1.,.94,.80),.5+.5*sin(az*3.+fi));c=mix(c,kg,b*.82*uJdK.y);}',
      '  vec3 B=uJdB;float azq=az;',                                         // (v3, Léo : « que du ciel et de la mer ») : plus de monts posés sur l horizon — au fond aussi, ils FLOTTENT
      // (v12) les quatre rangées de piliers peints sur l horizon sont RETIRÉES : devant le lointain elles faisaient une frise de bosses blanches
      // (v8, Léo : « un dessous, que ce soit la mer — qui fasse penser au fleuve des peintures chinoises, mais bleu ») LE FLEUVE : le bleu
      // minéral des rouleaux (千里江山图) — un lavis bleu-vert, plus profond sous soi, et les LIGNES D EAU peintes au pinceau (fines, serrées,
      // qui ondulent et se cassent en traits), deux houles plus larges, un éclat de soleil sur les lignes ; au loin la brume le reprend.
      '  if(y<0.){float t=(uCam.y-uJMerY)/max(-y,.0004);vec2 P=d.xz*t+uCam.xz;',
      '    float px=t*uJPx/max(-y,.015);',                                    // un pixel, en mètres, sur l eau
      '    vec2 q=vec2(P.x*.956+P.y*.292,-P.x*.292+P.y*.956);',              // le courant, en biais
      '    float lw=q.y/17.+.7*sin(q.x/90.+q.y/150.)+.3*sin(q.x/33.-q.y/61.+1.3)+uEauT*.07;',
      '    float e1=abs(fract(lw)-.5),ln=smoothstep(.5-.07-px/17.,.5-.015,e1)*(1.-smoothstep(.10,.30,px/17.));', // les LIGNES D EAU (un trait tous les 17 m, effacé avant de grésiller)
      '    ln*=smoothstep(.3,.6,vn(vec2(q.x/70.,floor(lw)*.37)));',         // cassées en traits de pinceau
      '    float hw=q.y/90.+.45*sin(q.x/330.+q.y/600.)-uEauT*.03,hb=smoothstep(.1,.5,abs(fract(hw)-.5))*(1.-smoothstep(.12,.4,px/90.));', // les houles
      '    float n=vfbm(P*.0016+vec2(uTime*.002,0.));',
      '    vec3 dp=vec3(.12,.36,.46),cl=vec3(.36,.60,.66);',                  // le bleu minéral : profond / clair
      '    vec3 wa=mix(dp,cl,.25+.5*n+.25*smoothstep(-.35,-.03,y));',
      '    wa*=.88+.12*hb;wa=mix(wa,vec3(.78,.88,.90),ln*.38);',
      '    float gl=pow(max(dot(vec3(d.x,-d.y,d.z),uSunDir),0.),24.);wa+=uJdS*gl*(.25+.9*ln);', // l éclat du soleil sur les lignes
      '    {vec2 gq=P/2.,gi=floor(gq);float g1=fract(sin(dot(gi,vec2(127.1,311.7)))*43758.5453),g2=fract(sin(dot(gi,vec2(269.5,183.3)))*43758.5453);', // (2026-10-13) LES PAILLETTES : une facette de 2 m qui renvoie le soleil, et scintille
      '     vec3 Ng=normalize(vec3((g1-.5)*.6,1.,(g2-.5)*.6));float sp=pow(max(dot(reflect(d,Ng),uSunDir),0.),180.),tw=pow(.5+.5*sin(uEauT*(1.8+3.*g2)+g1*47.),6.),vis=1.-smoothstep(.5,2.2,px);',
      '     wa+=mix(vec3(1.,.95,.85),uJdS,.35)*(sp*tw*5.*vis+pow(gl,1.6)*.45*(1.-vis));',
      '     wa=mix(wa,wa*(.86+.28*g1),.5*vis*(1.-smoothstep(-.35,-.05,y)));}',
      '    wa=mix(wa,mix(uJdH,uJdB,.5)*vec3(.92,.97,1.),pow(1.+y,14.)*.7);', // au ras, le ciel s y reflète
      '    {vec4 lr=jLointain(az,-y+ln*.0012+.0006*sin(P.x*.05+uTime*.4));wa=mix(wa,lr.rgb*vec3(.82,.92,.96),lr.a*.5*smoothstep(-.12,-.004,y));}', // (v12) le lointain se REFLÈTE dans le fleuve, tremblé par les lignes d eau
      '    {vec3 Nc;vec2 cc;float hh;vec4 ht=jMerCubes(uCam,d,Nc,cc,hh);if(ht.w>0.){',                     // (v13) LA MER EN CUBES, de près
      '      float r9=fract(sin(dot(cc,vec2(12.9898,78.233)))*43758.5453),hn=clamp((hh+5.)/9.,0.,1.);',
      '      vec3 wc=mix(vec3(.03,.18,.27),vec3(.20,.58,.64),hn)*(.92+.14*r9);',                          // le bleu : profond dans les creux, turquoise sur les crêtes, chaque cube sa nuance
      '      vec3 Rf=reflect(d,Nc),sk=mix(uJdH,uJdZ,smoothstep(0.,.6,Rf.y));float F=.03+.97*pow(1.-max(dot(-d,Nc),0.),5.),dif=max(dot(Nc,uSunDir),0.)*.5+.5;',
      '      vec2 fq=fract(ht.xz/JMS);float eb=min(min(fq.x,1.-fq.x),min(fq.y,1.-fq.y));',
      '      vec3 cw;if(Nc.y>.5){',
      '        vec2 sq=ht.xz/(JMS*.25),si=floor(sq),sf=fract(sq);float s1=fract(sin(dot(si,vec2(127.1,311.7)))*43758.5453),s2=fract(sin(dot(si,vec2(269.5,183.3)))*43758.5453),s3=fract(sin(dot(si,vec2(419.2,371.9)))*43758.5453);',
      '        float pxw=ht.w*uJPx/max(-d.y,.02),sub=1.-smoothstep(.22,.85,pxw);',
      '        vec3 tn=s2<.2?vec3(.04,.21,.34):s2<.42?vec3(.07,.38,.45):s2<.62?vec3(.15,.57,.61):s2<.80?vec3(.11,.47,.40):s2<.93?vec3(.30,.66,.70):vec3(.52,.80,.82);',
      '        vec3 wS=mix(wc,mix(tn,wc,.5)*(.94+.12*s3),sub*.5);',
      '        float sb=min(min(sf.x,1.-sf.x),min(sf.y,1.-sf.y)),bv=1.-smoothstep(.02,.09,sb);vec2 bo=sign(sf-.5)*bv;',
      '        vec3 Ns=normalize(mix(Nc,normalize(vec3((s1-.5)*.14+bo.x*.18,1.,(s3-.5)*.14+bo.y*.18)),sub));vec3 Rs=reflect(d,Ns);',
      '        float Fs=.03+.97*pow(1.-max(dot(-d,Ns),0.),5.),ds=max(dot(Ns,uSunDir),0.)*.5+.5;vec3 sks=mix(uJdH,uJdZ,smoothstep(0.,.6,Rs.y));',
      '        float hl=vn(ht.xz*.03+vec2(uEauT*.11,-uEauT*.07))*.6+vn(ht.xz*.011-vec2(uEauT*.05,0.))*.4;',
      '        cw=mix(wS*(.70+.3*ds)*(.80+.42*hl),sks,min(1.,Fs*.95+.10));',
      '        cw+=vec3(.05,.22,.20)*smoothstep(.5,4.,hh)*(.4+.6*pow(max(dot(-d,uSunDir),0.),2.));',
      '        cw+=uJdS*pow(max(dot(Rf,uSunDir),0.),28.)*.22;',
      '        float tw=pow(.5+.5*sin(uEauT*(1.6+3.2*s2)+s1*41.),7.);cw+=mix(vec3(1.,.95,.86),uJdS,.3)*pow(max(dot(Rs,uSunDir),0.),260.)*tw*7.*sub;',
      '        cw+=vec3(1.)*step(.985,s1)*tw*.35*sub*(1.-smoothstep(60.,240.,ht.w));',
      '        cw*=mix(1.,.90+.10*smoothstep(0.,.06,sb),sub);',
      '        cw*=.86+.14*smoothstep(0.,.12,eb);cw+=vec3(.10,.14,.15)*(1.-smoothstep(.0,.06,eb))*(1.-smoothstep(300.,900.,ht.w));',
      '        float fo=smoothstep(1.,3.6,hh)*smoothstep(.30,.70,vn(ht.xz*.12+vec2(uEauT*.5,0.)));',               // l ÉCUME sur les crêtes
      '        for(int i=0;i<12;i++){vec4 P=uEauP[i];if(P.z<0.)continue;float dd=length(ht.xz-P.xy)-P.z;if(dd>40.)continue;', // (v17) …et au pied des montagnes que l eau frappe
      '          float rg=exp(-dd*dd/160.)*(.70+.30*sin(uEauT*3.1-dd*.3+P.w)),ro=exp(-pow(dd-mod(uEauT*11.+P.w*7.,40.),2.)/22.)*(1.-smoothstep(12.,40.,dd));',
      '          fo=max(fo,max(rg,ro*.85)*smoothstep(.05,.45,vn(ht.xz*.25+vec2(0.,uEauT*.8))));}',
      '        cw=mix(cw,vec3(.94,.95,1.),fo*.85);}',
      '      else{vec2 fq9=vec2(dot(ht.xz,vec2(Nc.z,-Nc.x)),ht.y)/(JMS*.25),fi9=floor(fq9);float f1=fract(sin(dot(fi9,vec2(91.7,47.3)))*43758.5453);vec2 ff9=fract(fq9);float fb9=min(min(ff9.x,1.-ff9.x),min(ff9.y,1.-ff9.y));', // un flanc : plus sombre, en petits cubes lui aussi
      '        cw=wc*(.46+.22*f1+.30*dif);cw=mix(cw,sk*.8,F*.45);cw*=.84+.16*smoothstep(0.,.08,fb9);}',                                            // un flanc : plus sombre
      '      wa=mix(wa,cw,1.-smoothstep(1400.,2600.,ht.w));}}',
      '    wa*=uJdK.z;float hz=1.-smoothstep(-.16,-.002,y);c=mix(c,wa,hz*hz*(3.-2.*hz));}',
      '  c=mix(c,uFogCol,(1.-smoothstep(0.,.05,abs(y)))*.35);',              // l horizon rejoint la brume de three (les piliers 3D s y fondent)
      '  return c;}'],
    /* LE CANYON DES GÉANTS (2026-10-14, Sacha) — le ciel du désert : un dégradé sec (azur profond au zénith, horizon chaud et poudré), la
       lueur et le DISQUE du soleil de l'heure (SUN_DIR bouge dans ce niveau), la CEINTURE DE VÉNUS rose au-dessus de l'ombre de la Terre à
       l'opposé du soleil bas, des cumulus épars et des cirrus éclairés côté soleil, le PLAFOND gris de la pluie que l'éclair allume, la nuit
       la VOIE LACTÉE (une bande et ses nuages de poussière) et la LUNE (alors le disque), trois plans de MESAS sur l'horizon noyés dans la
       brume, et sous l'horizon la brume du désert (le relief lointain s'y fond). Mélangé par uCanyon (0 ailleurs) ; seul, il a son programme
       (`cy`, voir cielDeuxTemps). Couleurs : uCy* (les ambiances canyon*, en linéaire). */
    canyon:[
      'uniform float uCanyon,uCyF,uCyDn;uniform vec3 uCyZ,uCyM,uCyH,uCyS,uCyB,uCyC,uCyD,uCyR;uniform vec4 uCyK,uCyN;',
      'float cyh(float x){return fract(sin(x*127.13+.71)*43758.5453);}',
      'vec2 cyMesas(float az,float y){vec2 o=vec2(0.);for(int L=0;L<3;L++){float fl=float(L),N=11.+fl*7.,s=fl*13.1+3.7,u=az/6.2831853*N,id=floor(u);',
      '  for(int k=-1;k<=1;k++){float i2=mod(id+float(k),N),r1=cyh(i2+s),r2=cyh(i2*1.37+s*2.1),r3=cyh(i2*2.71+s*4.3);if(r3<.30)continue;',
      '    float c=float(k)+.5+(r2-.5)*.5,w=.12+.30*r1,dx=abs(u-id-c),top=(.010+.020*r3)*(1.-.28*fl),cap=step(.55,r2)*smoothstep(w*.55,w*.42,dx)*top*.55;',
      '    float m=smoothstep(w,w-.02,dx)*(1.-smoothstep(top+cap-.0012,top+cap+.0012,y))*step(-.03,y);if(m>o.x)o=vec2(m,fl);}}return o;}',
      /* (2026-10-14, passe graphismes · cysoleil) LE CIEL CRÈME DU CANYON : le masque du DISQUE SOLAIRE était inversé (`ds=1.-smoothstep(…,sd)` vaut 1 PARTOUT sauf près du soleil) —
         tout le ciel prenait la couleur du disque (crème ×uCyN.z, jusqu'à ×4) et l'ACES l'écrasait en blanc crème, au matin, à midi comme au soir (sonde : masquer le dôme
         = noir, ses uniformes étaient justes). `ds=smoothstep(…)` : 1 sur le disque, 0 ailleurs. */
      /* (2026-10-18) LES DUNES D'OR : l'horizon de mesas devient un horizon de DUNES (deux houles) et trois PYRAMIDES au loin — mélangé par uCyDn (0 ailleurs : le canyon au bit près) */
'vec2 dnHorizon(float az,float y){float t1=.0075+.0085*(.5+.5*sin(az*6.+1.7))*(.55+.45*sin(az*15.+.4))+.0022*sin(az*37.+2.),t0=.0035+.0055*(.5+.5*sin(az*9.+4.1))*(.5+.5*sin(az*23.+2.2)),pm=0.;',
      '  for(int k=0;k<3;k++){float fk=float(k),a0=2.10+fk*.072,h=.031-.0075*fk,da=abs(mod(az-a0+3.14159265,6.2831853)-3.14159265),top=h-da*1.25;pm=max(pm,step(0.,top)*(1.-smoothstep(top-.001,top+.001,y)));}',
      '  float m1=1.-smoothstep(t1-.0012,t1+.0012,y),m0=1.-smoothstep(t0-.0012,t0+.0012,y);vec2 o=vec2(m1,1.);if(pm>m1*.5)o=vec2(max(m1,pm),.6);if(m0>.01)o=vec2(max(o.x,m0),mix(o.y,0.,m0));return o*step(-.03,y);}',
      'vec3 canyonCiel(vec3 d){d=normalize(d);float y=d.y,yy=max(y,0.),az=atan(d.x,-d.z),sd=dot(d,uSunDir),sdp=max(sd,0.);',
      '  vec3 c=mix(uCyH,uCyM,smoothstep(0.,.20,yy));c=mix(c,uCyZ,smoothstep(.12,.85,yy));',
      '  c+=uCyS*(pow(sdp,6.)*.30+pow(sdp,40.)*.40)*(1.-.8*uCyN.w);',
      '  {float an=pow(max(-sd,0.),1.5)*uCyN.x;c=mix(c,uCyB,an*smoothstep(.03,.07,y)*(1.-smoothstep(.12,.24,y))*.7);c=mix(c,c*vec3(.70,.75,.92),an*(1.-smoothstep(0.,.05,y))*smoothstep(-.01,.01,y)*.6);}',
      '  if(y>.015&&uCyK.x+uCyK.y>.001){float t=2800./y;vec2 p=d.xz*t+uCam.xz*.7+vec2(uTime*4.,uTime*1.5);',
      '    float n=vfbm(p/1500.+.5*vec2(vn(p/2800.+3.7),vn(p/2800.-5.1))),cov=smoothstep(.80-uCyK.x*.55,1.05-uCyK.x*.55,n)*exp(-t/26000.)*step(.001,uCyK.x);',
      '    float ci=smoothstep(.45,.85,vfbm(vec2(p.x/5200.,p.y/900.)+7.))*exp(-t/40000.)*.55*uCyK.y;',
      '    float li=.5+.5*dot(normalize(vec3(d.x,0.,d.z)+1e-4),normalize(vec3(uSunDir.x,0.,uSunDir.z)+1e-4));',
      '    vec3 cc=mix(uCyD,uCyC,clamp(li*.7+.6*(n-.5)+pow(sdp,4.)*.5,0.,1.));c=mix(c,cc,cov*.92);c=mix(c,mix(uCyC,c,.35),ci);}',
      '  if(uCyN.w>.001){float t=900./max(y,.02);vec2 p=d.xz*t+uCam.xz+vec2(uTime*9.,uTime*3.);float n=vfbm(p/700.+.6*vec2(vn(p/1300.),vn(p/1300.+4.)));',
      '    vec3 pl=mix(uCyD,uCyC,smoothstep(.3,.8,n))+vec3(.75,.78,.95)*uCyF*(.5+.8*smoothstep(.4,.8,n));c=mix(c,pl,uCyN.w*smoothstep(-.02,.06,y));}',
      '  {float ds=smoothstep('+'.99955-.00035*uCyN.y,.99975-.00035*uCyN.y,sd);c=mix(c,mix(vec3(1.,.97,.9),vec3(.92,.94,1.),uCyK.w)*uCyN.z*(1.+1.2*(1.-uCyK.w)),ds*(1.-uCyN.w*.92));',
      '   if(uCyK.w>.5&&ds>0.){vec3 e1=normalize(cross(uSunDir,vec3(0.,1.,0.)));vec2 q=vec2(dot(d,e1),d.y-uSunDir.y)*90.;c-=vec3(.10,.09,.07)*smoothstep(.45,.7,vn(q*3.+2.))*ds;}}',
      '  if(uCyK.z>.001&&y>-.02){vec3 G=normalize(vec3(.42,.55,.72));float b=dot(d,G),mw=exp(-b*b/.022)*smoothstep(-.02,.15,y);vec2 q=vec2(atan(d.z,d.x)*3.,b*14.);',
      '    mw*=(.55+.6*smoothstep(.35,.75,vfbm(q*5.1)))*(1.-.75*smoothstep(.45,.65,vfbm(q*2.3+1.3))*exp(-b*b/.006));c+=vec3(.55,.58,.75)*mw*.12*uCyK.z;}',
      '  {vec2 m=cyMesas(az,y);if(uCyDn>.001)m=mix(m,dnHorizon(az,y),uCyDn);if(m.x>0.){vec3 mc=mix(uCyR,uFogCol,.25+.25*m.y);c=mix(c,mix(mc,uFogCol,smoothstep(.02,-.005,y)*.5),m.x);}}',
      '  c=mix(c,uFogCol,(1.-smoothstep(-.03,.02,y))*.9);',
      '  return c;}'],
    fond:[
      // VICE CITY NUIT (assombri) : indigo profond au zénith → violet → grande brume ROSE sombre → corail → ambre au ras du soleil
      'vec3 cielFond(float y){',
      '  vec3 zen=uFd[0];', // (2026-10-16) les huit teintes du dégradé = uFd (VT_FD0 : les valeurs d'origine ; remappées dans une ville teintée) — zénith : indigo PROFOND mais VIVANT — règle Alto : le ciel ne meurt jamais en noir
      '  vec3 mve=uFd[1];',  // violet-indigo assombri
      '  vec3 ros=uFd[2];',  // mauve magenta plus sombre
      '  vec3 cor=uFd[3];',  // ROSE Miami ASSOMBRI — riche, plus jamais fluo
      '  vec3 gld=uFd[4];',  // corail chaud sombre
      '  vec3 crm=uFd[5];',  // ambre au ras de l horizon (dernier souffle du soleil)
      '  vec3 blw=uFd[6];',  // prune sous l horizon — relevé, il porte les silhouettes
      '  vec3 dp2=uFd[7];', // tout en bas : indigo-prune lumineux, jamais de trou noir
      '  vec3 col=mix(crm,gld,smoothstep(.012,.05,y));',
      '  col=mix(col,cor,smoothstep(.04,.13,y));',
      '  col=mix(col,ros,smoothstep(.11,.30,y));',
      '  col=mix(col,mve,smoothstep(.26,.48,y));',
      '  col=mix(col,zen,smoothstep(.44,.78,y));',   // le bleu nuit domine le tiers haut
      '  col=mix(blw,col,smoothstep(-.10,.012,y));',
      '  col=mix(dp2,col,smoothstep(-.85,-.12,y));',
      '  col=col*uSkyMul+uSkyLift*smoothstep(.35,-.06,y);', // BIOME : teinte du gradient + lift laiteux concentré à l horizon
      /* LE JOUR D ALTITUDE (2026-09-30, Sacha, capture de Zelda : Tears of the Kingdom — « ambiance haut de gamme GTA 6, toute l ambiance
         doit être refaite et parfaite ») : le ciel d AU-DESSUS des nuages, pas celui d en bas — un azur profond au zénith, un turquoise
         lumineux au milieu, un horizon crème presque blanc (l air épais, éclairé). Son propre dégradé, pas le couchant de Vice City
         multiplié : un rose ne devient jamais turquoise. uJour 0 = le ciel d avant. */
      /* LE CIEL CONTINU (2026-10-17, Sacha, sur une capture du glacier à midi : « regarde comme le ciel est moche ; le dégradé de ciel-soleil est à refaire
         complètement ») : l'ancien dégradé passait de l'horizon au milieu en 9° — une BANDE dure, orange tout autour du monde même à midi, sous un bleu
         saturé. Ici : le zénith fond vers le milieu sur TOUT le dôme (courbe douce), l'HORIZON est un voile large (moitié à ~5°, presque rien à 20°)
         à la couleur de l'AIR, pâle ; la chaleur ne vit que du côté du SOLEIL (cielJour, uJSol). Sur les six maps de la continuité seulement (uCiel2). */
      '  if(uJour>.001){float yj=max(y,0.);vec3 j;',
      '    if(uCiel2>.5){float u=1.-yj;j=mix(uJZen,uJMid,smoothstep(0.,1.,pow(u,1.7)));j=mix(j,uJHor,pow(u,7.));}',
      '    else{j=mix(uJHor,uJMid,smoothstep(0.,.16,yj));j=mix(j,uJZen,smoothstep(.12,.92,yj));}',
      '    col=mix(col,j,uJour);}',
      '  col=mix(col,vec3(0.),uSpace);', // ORBITE : le NOIR COMPLET (demande du user) — la Terre et la route portent seules la lumiere
      '  col*=1.+uPulse*.13;', // MUSIQUE : tout le ciel respire au beat (souffle global doux)
      '  return col;}',
    ],
    mer:[
      'void cielMer(inout vec3 col,float y,float sd){',
      '  if(uMer>.001&&y<.02){vec3 mz=uJour>.001?merZ(vDir,y,sd):vec3(0.);vec3 mo=uJour<.999?merNuages(vDir,y,sd):mz;', // (2026-09-30) la mer du JOUR D ALTITUDE (merZ), mélangée par uJour
      '    col=mix(col,mix(mo,mz,uJour),uMer*(1.-smoothstep(-.016,.012,y))*(1.-uSpace));}', // NUAGES : la mer de nuages sous l horizon (voir merNuages)
      '}',
    ],
    /* LE CIEL DE L'ÉCRAN TITRE v4 (2026-10-06, Sacha : « le ciel est toujours moche dans l'écran d'accueil — refonte visuelle totale,
       surtout ce motif de merde dans le ciel »). Mesuré sur les six heures : le ciel du titre était un ASSEMBLAGE des couches du niveau
       (dégradé à paliers, lueur d'horizon, mer à taches, pommelé en quinconce, plus le sprite de lueur d'horizon) qui ne s'accordaient
       pas — une RAYURE dure sur l'horizon, un papier peint sous lui, des tirets en grille au-dessus. Au titre, cette couche les REMPLACE :
       un dégradé sans palier (horizon → milieu → zénith), la lueur large du côté du soleil, quelques CIRRUS (longues mèches au vent, du
       bruit, jamais une grille), et une mer de nuages SOYEUSE (grandes ondulations douces, éclairées du côté du soleil) qui se FOND dans la
       couleur de l'horizon au lieu de la croiser. Une palette par heure (TITRE_CIEL). uTi : x allumée, y cirrus, w distance de la brume. */
    titre:[
      'uniform vec4 uTi,uTi2;uniform vec3 uTZen,uTMid,uTHor,uTSol,uTMerH,uTMerO,uTCir;',
      'float tH(vec2 p,float fp){float s=0.,a=.55,f=1.;for(int i=0;i<4;i++){float k=1.-smoothstep(.3,.8,fp*f);s+=a*(k*vn(p)+(1.-k)*.5);p=p*2.07+vec2(5.3,1.7);a*=.45;f*=2.07;}return s;}', // (titre v6) le champ de hauteur de la mer
      /* (2026-10-19, essai ARC) LA MER DE CUMULUS : sous l horizon, le dessus d un vrai pont de nuages — la carte de relief cuite
         (atelier-ciel/mer-cumulus.js : des dômes de trois tailles soudés en chou-fleur) relue à deux échelles tournées, éclairée par le
         soleil du jeu (la pente, l ombre portée de trois pas vers lui, les plis à l ombre), des trouées vers l abîme là où le relief
         descend sous la couverture, le liseré d argent à contre-jour, et la perspective aérienne qui rejoint l horizon DE LA PHOTO à la
         même direction (pas de couture entre la mer et le ciel). Les mips de la carte font l anticrénelage du lointain. */
      'void merArc(inout vec3 c,vec3 d,float y,float sd){',
      '  float yy=min(y,-.0006),t=uMr.y/(-yy);',
      '  vec2 p=d.xz*t+uCam.xz+vec2(uTime*7.,uTime*3.),q=p/uMr.z;',
      '  mat2 R=mat2(.80,-.60,.60,.80);vec2 q2=R*q*3.1+vec2(.37,.11);',
      '  vec4 A=texture2D(uMrT,q),B=texture2D(uMrT,q2);',
      '  float h=A.r*.7+B.r*.3;',
      '  vec2 ga=vec2(A.g-.5,.5-A.b),gb=vec2(B.g-.5,.5-B.b),g=ga*.7+(gb*R)*.3*3.1;',                     // la pente dans la tuile (la carte est retournée en v)
      '  vec3 N=normalize(vec3(-g.x*uMr2.x,1.,-g.y*uMr2.x));',
      '  vec3 L=normalize(vec3(uSunDir.x,max(uSunDir.y,.04)+.07,uSunDir.z));',
      '  float nl=dot(N,L),dif=clamp(nl*.6+.4,0.,1.);',
      '  vec2 sx=normalize(uSunDir.xz+vec2(1e-4));float tg=(max(uSunDir.y,.04)+.07)/length(uSunDir.xz+vec2(1e-4));',
      '  float sh=1.;for(int i=1;i<4;i++){float fi=float(i)*.028;float hs=texture2D(uMrT,q+sx*fi).r*.7+texture2D(uMrT,q2+R*sx*fi*3.1).r*.3;sh=min(sh,clamp(1.-(hs-h-fi*tg*12.)*7.,0.,1.));}', // l ombre portée des dômes voisins
      '  sh=mix(1.,sh,uMr2.w);float ao=mix(A.a,1.,.2)*mix(B.a,1.,.4);',
      '  float cov=smoothstep(uMr.w-.07,uMr.w+.05,h),epa=smoothstep(uMr.w,uMr.w+.3,h);',                   // la couverture ; l épaisseur (les bords des trouées s amincissent)
      '  vec3 far=uPh.x>.001?phCiel(normalize(vec3(d.x,.008,d.z))):uTHor;',                              // l air : l horizon de la PHOTO, à cette direction
      '  vec3 lit=mix(uTMerO,uTMerH,dif*mix(.3,1.,sh));',
      '  lit*=mix(.7,1.,ao)*mix(.82,1.,epa);',
      '  lit+=uTMerH*.22*pow(max(nl,0.),5.)*sh;',                                                          // l éclat des sommets au soleil
      '  lit+=uTSol*pow(max(sd,0.),5.)*(1.-epa)*.8;',                                                      // le liseré d argent : les bords minces, à contre-jour
      '  vec3 ab=mix(uTMerO*.6,far,.4+.3*uMr2.z);',                                                        // l abîme sous les trouées : un bleu noyé d air, pas un aplat saturé
      '  vec3 m=mix(ab,lit,cov);',
      '  m=mix(m,far,1.-exp(-t/(uMr.z*uMr2.y)));',
      '  c=mix(m,uPh.x>.001?far:c,smoothstep(-.02,0.,y));}',                                            // au ras de l horizon : l air de la photo (pas le dégradé peint : il y faisait un trait clair)
      'void cielTitre(inout vec3 col,vec3 d,float y,float sd){',
      '  float yp=max(y,0.),sv=max(sd,0.);',
      '  vec3 c=mix(mix(uTHor,uTMid,smoothstep(0.,.30,yp)),uTZen,smoothstep(.12,.95,yp));',          // le dégradé, sans palier
      '  c=mix(c,uTHor*1.04,exp(-yp*9.)*.35);',                                                      // l air épais, large, sur l horizon
      '  c+=uTSol*(pow(sv,3.)*.65*exp(-yp*2.5)+pow(sv,24.)*.6);',                                    // la lueur du côté du soleil
      '  if(uTi2.y>.001&&sv>.2){vec3 u1=normalize(cross(uSunDir,vec3(0.,1.,0.))),u2=cross(u1,uSunDir),v=d-uSunDir*sd;',   // LES RAYONS : des faisceaux autour du soleil, qui respirent
      '    float ang=atan(dot(v,u2),dot(v,u1)),rr=vfbm(vec2(ang*7.,uTime*.03))*.6+vfbm(vec2(ang*19.,uTime*.05+3.))*.4;',
      '    c+=uTSol*smoothstep(.45,.8,rr)*pow(sv,6.)*uTi2.y*(1.-smoothstep(0.,.5,yp));}',
      '  if(uTi.y>.001&&y>.02){float t=3200./y;vec2 p=(d.xz*t+uCam.xz*.3)/5200.+vec2(uTime*.004,uTime*.0015);',
      '    vec2 r=vec2(p.x*.82-p.y*.57,p.x*.57+p.y*.82);',                                              // les cirrus : le vent, en biais
      '    float n=vfbm(vec2(r.x*.45,r.y*2.6)+1.7)*.7+vfbm(r*3.1+5.3)*.3;',                              // de longues mèches, effilochées
      '    float k=smoothstep(.52,.78,n)*smoothstep(.02,.16,y)*(1.-smoothstep(.55,.92,y))*exp(-t/60000.);',
      '    c=mix(c,uTCir*(.85+.35*sv*sv),k*uTi.y);}',
      /* (titre v6) LA MER DE NUAGES AUX OMBRES PORTÉES — un champ de HAUTEUR (des sommets ronds de ~1,5 km, un bourgeonnement plus fin), éclairé
         par sa pente côté soleil ET ombré par les sommets voisins : quatre pas vers le soleil, bas sur l'horizon, et toute crête plus haute que
         le rayon y projette son ombre — les longues ombres bleues des levers de soleil au-dessus des nuages. Les octaves trop fines pour le
         pixel s'effacent (tH). La lisière des sommets prend la lumière (le rebord translucide), et tout se noie dans l'air vers l'horizon. */
      '  if(y<0.&&uMr.x>.5)merArc(c,d,y,sd);else',
      '  if(y<0.){float yy=min(y,-.0008),t=700./(-yy);',
      '    vec2 p=d.xz*t+uCam.xz+vec2(uTime*5.,uTime*2.),q=p/1500.;',
      '    float fp=t*.0016/max(-yy,.02)/1500.*MER_FPK;',
      '    vec2 sx=normalize(uSunDir.xz+vec2(1e-4));float tg=max(uSunDir.y,.04)/length(uSunDir.xz+vec2(1e-4));',
      '    float h0=tH(q,fp),h1=tH(q+sx*.02,fp);',
      '    float sh=1.;for(int i=1;i<5;i++){float fi=float(i)*.11;float hs=tH(q+sx*fi,fp);sh=min(sh,clamp(1.-(hs-h0-fi*tg*1.4)*9.,0.,1.));}',
      '    float lit=clamp(.5+(h1-h0)*16.,0.,1.)*mix(.25,1.,sh);',
      '    float top=smoothstep(.45,.75,h0),creux=smoothstep(.15,.45,h0);',
      '    vec3 m=mix(uTMerO*mix(1.-uTi2.z,1.,creux),uTMerH,lit*.8+top*.2);',
      '    m+=uTMerH*pow(1.-lit,3.)*top*.12;',                                                            // le rebord translucide des sommets à contre-jour
      '    m+=uTSol*pow(sv,3.)*.35*lit;',
      '    m=mix(m,uTHor,(1.-exp(-t/(9000.*uTi.w)))*.85);',                                               // la perspective aérienne
      '    c=mix(m,c,smoothstep(-.035,0.,y));}',                                                          // la mer REJOINT l horizon (pas de rayure)
      '  col=mix(col,c,uTi.x);}'],
    jour:[
      /* (2026-09-30) LE JOUR D ALTITUDE : la lueur chaude du soleil sur l horizon — large, basse, comme l air épais de Zelda au-dessus
         de la mer de nuages (le cœur du soleil reste cielSoleil). */
      'void cielJour(inout vec3 col,float y,float sd){',
      '  if(uJour<.001)return;',
      '  float h=exp(-abs(y)*mix(6.5,5.,uCiel2));',
      '  col+=uJSol*(pow(sd,3.)*.55*h+pow(sd,14.)*.30)*uJour;}', // (continuité) la chaleur autour du soleil monte un peu plus haut (mesuré : plus large, elle blanchissait la moitié du ciel)
    ],
    soleil:[
      /* (2026-09-27, passe perf iPhone) CHAQUE COUCHE NE SE CALCULE QUE LÀ OÙ ELLE PEINT. Mesuré au banc (dôme seul, mêmes uniformes,
         différence de pixels) : le ciel coûtait 15× un aplat, par une douzaine de petites couches calculées sur TOUT le dôme alors que
         chacune n'existe que sur une bande — la guirlande sur ±7° autour de l'horizon, les étoiles au-dessus de 6° (partout en orbite),
         la lune dans sa calotte, le cœur du soleil dans la sienne, le voile au-dessus de 3°. Chaque `if` teste exactement la borne où
         le terme d'origine vaut 0 (smoothstep saturé, step) : l'image est la même au pixel près. Pour la lune et les deux cœurs du
         soleil (des `pow` qui ne s'annulent jamais tout à fait), la borne est prise là où l'apport tombe sous 1e-5 — 400× sous le
         pas d'un niveau de couleur. `atan` (l'azimut) n'est calculé que si une couche qui le lit est allumée sur ce pixel. */
      'void cielSoleil(inout vec3 col,float sd){',
      '  float sd2=sd*sd;col+=uSunTint*(sd2*sd2)*.45*uSunHalo;',
      '  if(sd>.62){col+=vec3(1.,.60,.36)*pow(sd,32.)*.9*uSunHalo;',        // .62^32 = 2e-7
      '    if(sd>.97)col+=vec3(1.,.90,.78)*pow(sd,480.)*1.25*uSunHalo;}',  // .97^480 = 4e-7
      '}',
    ],
    gon:[
      // LA VILLE SOUS LA MER DE NUAGES : guirlande de lueurs néon rose ↔ cyan qui court sur l horizon, loin du soleil
      'bool cielGOn(float y,float sd){return abs(y+.03)<.13&&sd<.75&&uCity*(1.-uSpace)>0.&&(uVille<.999||y>-.03);}', // la bande de la guirlande (cband > 0, loin du soleil) ; en VILLE, sous -.03 l abime la remplace
    ],
    son:[
      'bool cielSOn(float y,float sd){return uStars>0.&&(y>.10||uSpace>0.)&&sd<.8;}', // la voûte des étoiles (hors orbite : au-dessus de .10)
    ],
    guirl:[
      'void cielGuirlande(inout vec3 col,float y,float az,float sd){',
      '  float cty=(.5+.5*sin(az*4.+1.3))*.6+(.5+.5*sin(az*9.+4.2))*.4;cty*=cty;',
      '  float cband=smoothstep(.13,.008,abs(y+.03));',
      '  vec3 neon=mix(uVc[4],uVc[5],.5+.5*sin(az*2.+2.0));', // (2026-10-16) le rose et le cyan de la guirlande : uVc[4], uVc[5] (voir VTEINTES)
      '  col+=neon*cty*cband*(1.-smoothstep(.15,.75,sd))*.42*uCity*(1.-uSpace)*(1.+uPulse*.9);}', // la ville s éteint sous l orage, hurle en NÉON TOTAL — et clignote au beat
    ],
    niveau:[
      /* ======================= LE FOND DU NIVEAU — QUATRE COUCHES ==========================
         LE PARI : un fond de rythme (Geometry Dash, Super Hexagon) dans un jeu où l on VISE une
         réception. Donc tout se passe HAUT et sur les CÔTÉS, jamais dans la bande d horizon où l on
         lit la route — c est `mk` qui garantit ça, et c est la seule raison pour laquelle l effet
         peut être aussi violent sans rendre le jeu injouable.
           1. LA ROUE     — des quartiers alternés qui tournent autour du zénith (Super Hexagon).
           2. LES ONDES   — chaque coup de grosse caisse part du zénith et DÉFERLE jusqu à l horizon.
           3. LA LUEUR    — deux écharpes lentes : la part qui VIT même quand le morceau respire.
           4. LES PILIERS — un égaliseur qui monte de l horizon, un barreau par secteur du ciel.
         ⚠ les couches 1, 3 et 4 vivent en PERMANENCE et ne font que gonfler sur la frappe ; seule
         la 2 naît du beat. Un fond qui n existe QUE sur les coups clignote, il ne « joue » pas. */
      'void cielNiveau(inout vec3 col,float y,float az,float sd){',
      '    float dz=acos(clamp(y,-1.,1.));',                       // angle depuis le ZÉNITH : 0 en haut, 1.57 à l horizon
      /* ⚠ TOUT LE CHAMP VISUEL (2026-08-08). La 1re version protégeait la bande d horizon d un
         `smoothstep(-.02,.15,y)` : le decor n existait qu au-DESSUS de la route, donc en conduite
         — ou l on regarde droit devant — on ne voyait presque rien. Le masque ne coupe plus, il
         DOSE : le bas du ciel joue a 62 %, le haut a 100 %. La route reste lisible parce qu elle
         est un objet 3D DEVANT le dome : elle se decoupe sur le fond au lieu d etre noyee. */
      '    float mk=uLvl*(.62+.38*smoothstep(-.45,.12,y))*(1.-uSpace)*(1.-.75*uJour);', // ORBITE : aucun motif, le noir reste noir — (2026-09-30) jour d altitude : le fond musical en sourdine
      '    mk*=1.-smoothstep(.10,.62,sd)*.42;',                    // le soleil garde son coeur ; il n est plus sanctuarise
      '    vec3 A=mix(uAcc,uAcc2,uFlip),Bc=mix(uAcc2,uAcc,uFlip);',// LA BASCULE : sur les phrases, les deux teintes s echangent
      /* ⚠ LES QUATRE COUCHES S ACCUMULENT DANS `fx`, PAS DANS `col`. Mesure a l origine de ce choix :
         en ajoutant directement, une frappe pleine cramait 13 a 22 % de l ecran en BLANC PUR. Or un
         blanc pur n a plus de teinte — l onde de couleur s effacait donc exactement au moment ou
         elle devait etre la plus spectaculaire. En passant par `fx` on peut ajouter la somme avec un
         amortissement (voir plus bas) : les fortes valeurs se tassent au lieu de buter au plafond. */
      '    vec3 fx=vec3(0.);',
      '    float wf=fract(az*2.5464790+uSpin);',                   // LA ROUE : 16 quartiers par tour (16/2π)
      '    float we=smoothstep(0.,.055,wf)*smoothstep(.5,.445,wf);',
      '    float wg=.075+uPulse*.100+uBeatK*.260;',
      '    fx+=A*we*wg*mk;',
      '    fx+=Bc*(1.-we)*wg*.42*mk;',                             // l autre quartier sur deux, plus discret : le ciel est a DEUX temps
      /* LA CONTRE-ROUE : 7 quartiers, sens INVERSE, vitesse 1,7×. Deux comptes premiers entre eux et
         deux vitesses irrationnelles l une par rapport a l autre = leur moire ne se repete JAMAIS.
         C est ca, le generatif : pas du bruit, deux regles simples qui ne retombent pas en phase. */
      '    float wf2=fract(az*1.1140846-uSpin*1.7+.37);',
      '    float we2=smoothstep(0.,.09,wf2)*smoothstep(.5,.41,wf2);',
      '    fx+=Bc*we2*we*wg*1.05*mk;',                             // l INTERSECTION des deux roues : des losanges qui derivent
      '    vec4 rd=vec4(dz)-uRingR;vec4 r2=rd*rd;',                // LES ONDES : la grosse caisse deferle du zenith
      '    vec4 rg=exp(-r2*150.)*uRingA;vec4 rh=exp(-r2*7.)*uRingA;',
      '    fx+=(A*(rg.x+rg.y+rg.z+rg.w)*1.05+Bc*(rh.x+rh.y+rh.z+rh.w)*.22)*mk;',
      '    float au=sin(az*2.+uTime*.12)*.5+.5;au*=au;',           // LA LUEUR : deux echarpes lentes, la part qui vit au calme
      '    float au2=sin(az*3.-uTime*.085+1.7)*.5+.5;',
      '    float band=smoothstep(.85,.10,dz)*smoothstep(.02,.30,dz);',
      '    fx+=mix(A,Bc,au2)*au*band*(.070+uPulse*.150+uBeatK*.090)*mk;',
      '    float pa=az*4.1380285+.5;',                             // LES PILIERS : 26 barreaux — volontairement PAS 16, sinon ils se superposent a la roue
      '    float pid=floor(pa),pfr=fract(pa)-.5;',
      '    float phh=hash21(vec2(pid,3.7));',
      '    float hgt=.045+phh*.070+(uPulse*.090+uBeatK*.130+uHi*.070)*(.35+.65*fract(phh*7.3+uBar));',
      '    float pil=smoothstep(.34,.20,abs(pfr))*smoothstep(hgt,hgt*.15,y)*step(.004,y);',
      '    fx+=mix(A,Bc,phh)*pil*(.16+uBeatK*.52)*uLvl*(1.-smoothstep(.06,.5,sd));',
      /* LE GRESIL — LES AIGUS. Charleston et cymbales ne sont pas des coups, ce sont des GRAINS : ils
         demandent une reponse a haute frequence SPATIALE (une trame fine) et TEMPORELLE. D ou le
         `floor(uTime*21.)` : la trame est retiree 21 fois par seconde, donc elle GRESILLE au lieu de
         glisser. Un effet qui se deplace lirait comme du mouvement ; un effet qui se retire lit comme
         du souffle. Le seuil descend avec `uHi` : plus il y a d aigus, plus il y a de grains allumes. */
      '    vec2 sc=vec2(az*46.,y*38.);',
      '    float gr=hash21(floor(sc)+floor(uTime*21.));',
      '    float spk=step(.988-uHi*.10,gr)*uHi;',
      '    fx+=mix(A,Bc,fract(gr*7.))*spk*1.6*uLvl;',
      /* L AMORTISSEMENT. `fx/(1+fx*.55)` : quasi lineaire tant que le decor est discret, et de plus
         en plus tasse quand tout tombe en meme temps (roue + onde + gresil + pilier sur la meme
         frappe). L apport ne peut plus depasser ~1,8 quoi qu il arrive, donc plus jamais quatre
         couches qui s empilent en mur blanc. */
      '    col+=fx/(1.+fx*.55);',
      '}',
    ],
    etoiles:[
      // ÉTOILES : elles s allument avec la nuit, scintillent doucement, jamais dans le halo du soleil
      'void cielEtoiles(inout vec3 col,float y,float az,float sd){',
      '  vec2 sg=vec2(az*10.1859,vDir.y*22.);', // 64 cellules par tour → zéro couture
      '  vec2 sid=floor(sg),sfr=fract(sg);',
      '  float h=hash21(sid);',
      '  if(h>=.76){',                                                       // step(.76,h) : 3 cellules sur 4 n ont pas d étoile
      '  vec2 stp=vec2(fract(h*17.13),fract(h*31.71))*.7+.15;',
      // (2026-09-26) des étoiles RONDES : la distance se mesure en ANGLE (une cellule fait 0,098 rad × cos(élévation) de large mais
      // 0,045 de haut — mesurée en cellules, chaque étoile était un grain deux fois plus large que haut). Rayon selon l éclat, et
      // une pointe de couleur (bleutées, blanches, quelques orangées) : un vrai ciel, pas un semis de pixels identiques.
      '  float sr=length(vec2((sfr.x-stp.x)*.0982*sqrt(max(0.,1.-y*y)),(sfr.y-stp.y)*.04545));',
      '  float st=(1.-smoothstep(0.,.0026+.0022*fract(h*7.7),sr))*step(.76,h);',
      '  st*=.55+.45*sin(uTime*(1.2+h*2.6)+h*44.);',
      '  float kc=fract(h*13.37),mus=kc<.34?uBandes.x:kc<.67?uBandes.y:uBandes.z;', /* (2026-10-25) trois familles d étoiles : celles des BASSES, des MÉDIUMS, des AIGUS — chacune ne vibre que sur sa bande */
      '  col+=mix(vec3(.80,.88,1.),vec3(1.,.86,.70),step(.8,fract(h*3.31)))*st*mix(smoothstep(.10,.42,y),1.,uSpace)*(1.-smoothstep(.25,.8,sd))*.9*uStars*(1.+uSpace*.5)*(1.+uPulse*1.3)*(1.+uSpace*mus*.6);}}', // elles descendent plus bas : le haut du cadre est habité — MINUIT les multiplie, l aube les éteint ; elles palpitent au beat
    ],
    espace:[
      /* (2026-10-15) LE CIEL PROFOND DE L ORBITE — une couche LISSE (passe à demi-résolution) : la VOIE LACTÉE et les NÉBULEUSES.
         Un plan galactique incliné (ES : sa normale) coupe le ciel en diagonale ; la bande s élargit et se réchauffe vers le CENTRE
         galactique, un ruban de poussière la fend en son milieu. Les nébuleuses sont deux bruits lents, seuillés : des nappes, pas un
         voile partout — le noir doit rester majoritaire. QUATRE bruits par pixel (les filaments relisent celui du ruban de poussière), à quart de résolution. Bruit de VALEUR 3D sur la direction : zéro couture, zéro pôle. */
      'float esH(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}',
      'float esN(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
      '  return mix(mix(mix(esH(i),esH(i+vec3(1.,0.,0.)),f.x),mix(esH(i+vec3(0.,1.,0.)),esH(i+vec3(1.,1.,0.)),f.x),f.y),',
      '             mix(mix(esH(i+vec3(0.,0.,1.)),esH(i+vec3(1.,0.,1.)),f.x),mix(esH(i+vec3(0.,1.,1.)),esH(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}',
      'float esF(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*esN(p);p=p*2.03+vec3(1.7,9.2,4.1);a*=.5;}return s;}',
      'void cielEspace(inout vec3 col){',
      '  vec3 d=vDir,g=normalize(vec3(.78,.38,-.50));float b=dot(d,g);',
      '  vec3 cC=normalize(vec3(-.30,.55,-.78));cC=normalize(cC-g*dot(cC,g));float cen=max(dot(d,cC),0.);', // le centre galactique, dans le plan
      '  float w=esF(d*2.6+vec3(3.,1.,7.)),ln=esF(d*7.+vec3(11.,4.,2.));',
      '  float bw=.11+.07*w+.10*cen*cen*cen,band=exp(-b*b/(bw*bw));',
      '  float dust=smoothstep(.44,.70,ln)*exp(-b*b/(bw*bw*.22));', // le ruban sombre au milieu de la bande
      '  float glow=band*(.30+.70*w*w*1.6)*(.40+.60*cen*cen)*(1.-.78*dust);',
      '  vec3 mw=mix(vec3(.40,.45,.62),vec3(.86,.84,.80),cen*cen*cen*cen*band);', // (2026-10-24 sobre) grise-bleutée, cœur à peine chaud
      '  float n1=esF(d*1.7+vec3(5.,2.,9.)),n2=esF(d*2.3+vec3(13.,7.,1.)),fl=ln;',
      '  float pv=smoothstep(.46,.78,n1),pb=smoothstep(.48,.80,n2);',
      '  vec3 neb=vec3(.30,.26,.46)*pv*(.45+.9*fl)+vec3(.22,.30,.46)*pb*(.45+.9*(1.-fl));',
      '  col+=mw*glow*.45*uSpace*uNeb;}  /* (2026-10-24, Sacha : « supprime les nébuleuses ») la voie lactée reste, plus de nappes colorées */',
    ],
    pous:[
      /* (2026-10-15) LA POUSSIÈRE D ÉTOILES de l orbite — passe NETTE (des points au pixel). 180 cellules par tour : des étoiles d un
         pixel, bleues, blanches ou mauves, rares hors de la voie lactée et serrées dedans. */
      'void cielPoussiere(inout vec3 col,float y,float az){',
      '  float b=dot(vDir,normalize(vec3(.78,.38,-.50))),band=exp(-b*b*36.);',
      '  vec2 sg=vec2(az*28.6479,y*60.),sid=floor(sg),sfr=fract(sg);float h=hash21(sid+71.3);',
      '  if(h<.935-.16*band)return;',
      '  vec2 stp=vec2(fract(h*23.7),fract(h*41.3))*.7+.15;',
      '  float sr=length(vec2((sfr.x-stp.x)*.0349*sqrt(max(0.,1.-y*y)),(sfr.y-stp.y)*.01667));',
      '  float st=1.-smoothstep(0.,.0016,sr),k=fract(h*5.13);',
      '  vec3 c=k<.4?vec3(.80,.86,1.):vec3(1.,.97,.94);',
      '  col+=c*st*(.55+.65*band)*(.7+.3*sin(uTime*(.8+h*2.)+h*31.))*uSpace*uNeb;}',
    ],
    lune:[
      // LUNE pâle à l opposé du couchant — le témoin du presque-nuit
      'void cielLune(inout vec3 col){',
      '  vec3 mdir=normalize(vec3(-.52,.40,-.72));',
      '  float md=dot(vDir,mdir);',
      '  if(md>.88){',                                                    // sa calotte : hors d elle, .88^90 × .2 = 2e-6 (perf iPhone)
      '  col+=vec3(.93,.96,1.06)*smoothstep(.9976,.9988,md)*1.05*uMoon;', // VRAI disque (~3°) : l ancre céleste du cadre, règle Alto
      '  col+=vec3(.55,.62,.92)*pow(max(md,0.),420.)*.45*uMoon;',        // aura proche
      '  col+=vec3(.28,.32,.55)*pow(max(md,0.),90.)*.20*uMoon;}',        // halo large qui fond dans la nuit
      '}',
    ],
    voile:[
      'void cielVoile(inout vec3 col,float y){',
      '  if(y>.05){float w=sin(vDir.x*8.+uTime*.05)*sin(vDir.z*7.-uTime*.04);', // voile tres subtil qui vit (nul sous .05)
      '  col+=vec3(.016,.010,.016)*w*smoothstep(.05,.4,y);}',
      '}',
    ],
    onde:[
      /* ================== L ONDE DE COULEUR — le grand effet du niveau 1 ==================
         ⚠ ELLE EST PLACEE ICI, TOUT A LA FIN, ET C EST LE POINT. Mise dans le bloc des quatre
         couches, elle n aurait teinte que ce que le decor AJOUTE. A cet endroit elle emporte TOUT :
         le degrade du couchant, le soleil, la lune, les etoiles, la ville. Le ciel entier change de
         couleur d un seul mouvement — c est ce qu on veut dire par spectaculaire.
         ⚠ ET C EST UNE ROTATION DE TEINTE, PAS UN REMPLACEMENT. Repeindre le ciel d une couleur
         donnerait un aplat mort ; le faire TOURNER garde le modele, les degrades, le relief — le
         ciel reste ce ciel-la, il a juste change de couleur.
         DEUX FRONTS qui se croisent (sens opposes, vitesses et frequences differentes) : leur
         interference ne se repete pas, donc l onde n a jamais deux fois la meme forme. */
      'void cielOnde(inout vec3 col,float y,float az){',
      '    float dzw=acos(clamp(y,-1.,1.));',
      '    float w1=sin(dzw*3.4-uWave*6.2831853+az*.60);',        // le front principal roule du zenith vers l horizon
      '    float w2=sin(dzw*1.7-uWave*3.9000000-az*.35+2.1);',    // le second, plus lent et en sens inverse
      '    float amp=uHueAmp*uLvl*(1.-.85*uJour);',   /* (2026-09-30) au JOUR D ALTITUDE l onde ne fait plus tourner le ciel au violet : un souffle, pas une bascule */
      '    col=hueRot(col,(w1*.70+w2*.45)*amp*6.2831853);',
      '    col*=1.+(w1*.5+.5)*amp*.55*uLvl;',                     // …et la crete de l onde ECLAIRE en passant
      /* L EPAULE. Tout ce qui depasse .78 est comprime vers 1 SANS JAMAIS L ATTEINDRE (asymptote).
         ⚠ ce n est pas un `min()` : un ecretage met les trois canaux a la meme valeur, donc du blanc
         pur, donc plus de teinte du tout — on perdrait la couleur pile sur les frappes, la ou elle
         doit crier. L epaule garde les canaux ORDONNES et distincts : ca devient tres clair, ca
         reste colore. C est la difference entre une lumiere et un trou dans l image. */
      '    vec3 ex=max(col-vec3(.78),vec3(0.));',
      '    col=min(col,vec3(.78))+ex/(1.+ex*4.55);',
      '}',
    ],
    trame:[
      'float cielTrame(){return (fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/160.;}', // la trame (dither) : TOUJOURS à pleine résolution, dans la passe qui écrit l écran
    ]};
  const LECT='uniform sampler2D uBasTex;uniform vec2 uBasInv;',LECT_TR='uniform float uBasTr;'; // (passes NETTES) la passe lisse, relue au pixel de l'écran · (passes LISSES) leur trame 8 bits
  const MAIN={
    plein:[
      'void main(){',
      /* (2026-09-27, passe perf iPhone) EN VILLE, LE CIEL DE TOUJOURS NE SE VOIT NULLE PART. Pluie pleine et ville pleine : le plafond
         remplace tout ce qui est au-dessus de −.03, l'abîme tout ce qui est en dessous (`mix(ciel,…,1.)` et poids 0 dans la bande) — le
         dégradé, le soleil, la lune, les étoiles, la guirlande et le voile étaient calculés sur chaque pixel du dôme pour être jetés.
         On saute directement au ciel de la ville (même fonction, même tramage) : même image. Pendant le fondu d'entrée/sortie du
         niveau (uVille ou uPluie < 1), le chemin complet reprend, inchangé. */
      '  if(uJade>.9999){gl_FragColor=vec4((uSous>.5?jadeSous(vDir):jadeCiel(vDir))+vec3(cielTrame()),1.);return;}', // (2026-10-13) sous la mer : son dessous // LES PICS DE JADE : le rouleau peint, seul
      '  if(uVille>.9999&&uPluie>.9999){',
      '    vec3 cv=villeCiel(vDir,atan(vDir.x,-vDir.z),vec3(0.));',
      '    cv+=vec3(cielTrame());', // le même tramage que plus bas
      '    gl_FragColor=vec4(cv,1.);return;}',
      '  float y=vDir.y;',
      '  vec3 col=cielFond(y);',
      '  if(uSpace*uNeb>.001)cielEspace(col);', // (2026-10-15) ORBITE : voie lactée et nébuleuses
      '  float sd=max(dot(vDir,uSunDir),0.);',      // couchant : halo rosé large, couronne corail, coeur incandescent (tamisé)
      '  cielMer(col,y,sd);', // NUAGES : la mer de nuages sous l horizon (voir merNuages)
      '  cielJour(col,y,sd);', // (2026-09-30) le jour d altitude : la lueur du soleil sur l horizon
      '  cielSoleil(col,sd);',
      '  if(uTi.x>.001)cielTitre(col,vDir,y,sd);', // (titre v4) le ciel de l écran titre
      '  if(uPh.x>.001&&y>-.006)col=mix(col,phCiel(vDir),uPh.x*smoothstep(-.006,.004,y));', // (essai ARC) la photo
      '  if(uParis>.001)parisCiel(col,vDir,y,sd);', // PARIS AU SOL : le ciel de l heure
      '  bool gOn=cielGOn(y,sd),sOn=cielSOn(y,sd);',
      '  float az=0.;if(gOn||sOn||uLvl>.001||uVille>.001)az=atan(vDir.x,-vDir.z);',
      '  if(gOn)cielGuirlande(col,y,az,sd);',
      '  if(uLvl>.001&&uVille<.999)cielNiveau(col,y,az,sd);',
      '  if(sOn)cielEtoiles(col,y,az,sd);',
      '  if(uSpace*uNeb>.001)cielPoussiere(col,y,atan(vDir.x,-vDir.z));', // (2026-10-15) ORBITE : la poussière d étoiles
      '  cielLune(col);',
      '  cielVoile(col,y);',
      '  if(uLvl>.001&&uVille<.999)cielOnde(col,y,az);',
      '  if(uVille>.001)col=mix(col,villeCiel(vDir,az,col),uVille);', // LE CIEL DE LA VILLE : plafond, skyline, abîme (voir villeCiel)
      '  if(uJade>.001)col=mix(col,jadeCiel(vDir),uJade);', // (le fondu d entrée/sortie de la map)
      '  if(uCanyon>.001)col=mix(col,canyonCiel(vDir),uCanyon);', // (2026-10-14) LE CANYON DES GÉANTS : son fondu
      '  col=cielSat(col);col+=vec3(cielTrame());', // dither
      '  gl_FragColor=vec4(col,1.);',
      '}'],
    /* PASSE LISSE — NUAGES et ORBITE : dégradé, mer de nuages, soleil, guirlande, voile (tout ce qui varie lentement). Sa seule trame
       (`uBasTr`) ne sert que si la cible est en 8 BITS (téléphone sans demi-flottant) : un arrondi sans trame y poserait des marches
       d'un niveau que la trame de la passe nette ne ferait que redessiner — on arrondit donc au hasard, juste. En demi-flottant : 0. */
    basN:[LECT_TR,
      'void main(){',
      '  float y=vDir.y;vec3 col=cielFond(y);if(uSpace*uNeb>.001)cielEspace(col);float sd=max(dot(vDir,uSunDir),0.);', // (2026-10-15) + l espace profond
      '  cielMer(col,y,sd);cielJour(col,y,sd);cielSoleil(col,sd);if(uTi.x>.001)cielTitre(col,vDir,y,sd);if(uParis>.001)parisCiel(col,vDir,y,sd);',
      '  if(cielGOn(y,sd))cielGuirlande(col,y,atan(vDir.x,-vDir.z),sd);',
      '  cielVoile(col,y);',
      '  gl_FragColor=vec4(cielSat(col)+vec3(cielTrame()*uBasTr),1.);}'],
    // PASSE NETTE — NUAGES et ORBITE : la passe lisse relue, + étoiles et lune (des bords au pixel), + la trame
    netN:[LECT,
      'void main(){',
      '  vec3 col=texture2D(uBasTex,gl_FragCoord.xy*uBasInv).rgb;float y=vDir.y,sd=max(dot(vDir,uSunDir),0.);',
      '  if(uPh.x>.001&&y>-.006){vec3 p9=phCiel(vDir);col=mix(col,mix(cielSat(p9),p9,uPh2.y),uPh.x*smoothstep(-.006,.004,y));}', // (essai ARC) la photo, à pleine résolution
      '  if(cielSOn(y,sd))cielEtoiles(col,y,atan(vDir.x,-vDir.z),sd);',
      '  if(uSpace*uNeb>.001)cielPoussiere(col,y,atan(vDir.x,-vDir.z));', // (2026-10-15) la poussière d étoiles
      '  cielLune(col);',
      '  col+=vec3(cielTrame());gl_FragColor=vec4(col,1.);}'],
    // PASSE LISSE — VILLE sous la pluie : le plafond, la brume du bas et la lueur des quartiers
    basV:[LECT_TR,'void main(){gl_FragColor=vec4(villeLisse(vDir,vec3(0.))+vec3(cielTrame()*uBasTr),1.);}'],
    // PASSE NETTE — VILLE sous la pluie : la passe lisse relue, + les lumières fines de l'abîme, la skyline, la trame
    // (2026-10-14) LE CANYON DES GÉANTS SEUL : son ciel, les étoiles de sa nuit, la trame
    cy:['void main(){vec3 c=canyonCiel(vDir);float y=vDir.y,sd=max(dot(vDir,uSunDir),0.);if(cielSOn(y,sd))cielEtoiles(c,y,atan(vDir.x,-vDir.z),sd);c=cielSat(c);c+=vec3(cielTrame());gl_FragColor=vec4(c,1.);}'],
    netV:[LECT,
      'void main(){',
      '  vec3 c=texture2D(uBasTex,gl_FragCoord.xy*uBasInv).rgb;',
      '  villeFin(c,vDir);',
      '  float yv=vDir.y-uVilleY;if(yv>-.1&&yv<.42)villeSkyline(c,vDir,atan(vDir.x,-vDir.z));', // atan seulement dans la bande de la skyline
      '  c+=vec3(cielTrame());gl_FragColor=vec4(c,1.);}']};
  /* LES CINQ PROGRAMMES — tous tirés des MÊMES morceaux. Les passes lisses (`basN`/`basV`) n'ont pas de profondeur (ni de trame, hors
     cible 8 bits) : elles remplissent une cible hors écran qui couvre toute l'image (voir CIEL2). */
  const src=function(){return [].concat.apply([],arguments).join('\n');},K=COUCHES;
  // (2026-09-26, vague 2 — audit GPU) gl_Position.z = w : le dôme se pose sur le PLAN LOINTAIN (profondeur 1,0) — voir renderOrder plus bas
  const mk=(fs,lisse)=>new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,depthTest:!lisse,vertexShader:VS,fragmentShader:fs});
  const mat=mk(src(TETE,VILLE,VILLE_CIEL,MER,K.fond,K.mer,K.jour,K.soleil,K.titre,K.paris,K.jade,K.canyon,K.gon,K.son,K.guirl,K.niveau,K.etoiles,K.espace,K.pous,K.lune,K.voile,K.onde,K.trame,MAIN.plein));
  /* LE CIEL SE PEINT EN DERNIER (2026-09-26, vague 2 — audit GPU). Il était dessiné en PREMIER (renderOrder −9, sans écrire la
     profondeur) : chaque pixel de l'écran payait le shader le plus lourd du jeu (mer de nuages, ville, étoiles, fond musical)… puis
     la route, la caisse, les nuages le recouvraient. Posé sur le plan lointain (z = w dans le vertex) et dessiné APRÈS tous les
     opaques, il est rejeté par le test de profondeur partout où quelque chose le cache : on ne peint plus que le ciel qu'on VOIT.
     Les transparents (soleil « 1.61 », nappe, rayons, halo de la planète, nuages en fondu) passent toujours après lui ; la Terre
     (opaque) se peint juste derrière (renderOrder 21, même plan lointain). Image identique. */
  const m=new THREE.Mesh(new THREE.SphereGeometry(4300,48,28),mat);
  const F_BAS=.5,FPK_BAS=1; // la passe lisse : ½ de la résolution en largeur et en hauteur (¼ des pixels) · l'anticrénelage de la mer y compte des pixels d'ÉCRAN (1)
  m.userData.ciel={plein:mat,f:F_BAS,
    basN:mk(src('#define MER_FPK '+FPK_BAS.toFixed(4),TETE,VILLE,MER,K.fond,K.mer,K.jour,K.soleil,K.titre,K.paris,K.gon,K.guirl,K.voile,K.espace,K.trame,MAIN.basN),true),
    netN:mk(src(TETE,K.son,K.etoiles,K.pous,K.lune,K.trame,MAIN.netN)),
    basV:mk(src(TETE,VILLE,VILLE_CIEL,K.trame,MAIN.basV),true),
    netV:mk(src(TETE,VILLE,VILLE_CIEL,K.trame,MAIN.netV)),
    cy:mk(src(TETE,VILLE,K.son,K.etoiles,K.canyon,K.trame,MAIN.cy))}; // (2026-10-14) LE CANYON DES GÉANTS : son ciel seul
  m.frustumCulled=false;m.renderOrder=20;scene.add(m);return m;
})();
let FOG_N=420,FOG_F=2600; // near/far pilotés par les BIOMES (le lerp cloudInS les relit chaque frame)
const FOG_BASE=new THREE.Color(0x5e3254),FOG_CLOUD=new THREE.Color(0xd8bcd0),fogTmp=new THREE.Color(); // FOG_BASE : l'objet reste const, les biomes mutent son RGB
const FOG_CJ=new THREE.Color(0xc06a54),cjV=new THREE.Vector3(); // CONTRE-JOUR : l'air s'embrase quand on roule vers le soleil (la seule zone lumineuse)
scene.fog=new THREE.Fog(0x5e3254,FOG_N,FOG_F); // brume MAGENTA sombre : la route lointaine fond dans le rose de la nuit qui tombe
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.1,9800);
