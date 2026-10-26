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
  uNeb:{value:1}, // (2026-10-15) LA VOÛTE d'étoiles de l'orbite (× uSpace) : 0 = le noir complet d'avant — (2026-10-25) la voie lactée et les nébuleuses ne sont plus appelées du tout
  uBandes:{value:new THREE.Vector3(0,0,0)}, // (2026-10-25) LES ÉTOILES JOUENT LA MUSIQUE (orbite) : x = basses, y = médiums, z = aigus — l'excès de chaque bande sur sa moyenne, 0..1 (voir musicTick)
  uEtK:{value:1.5}, // (2026-10-22) pixels de rendu par pixel CSS (`renderer.getPixelRatio()`, posé par orbiteTick) : les étoiles de l'orbite gardent la même taille sur tous les téléphones
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
  uVilleY:{value:0},
  // (2026-09-26) la SKYLINE descend à l'altitude de la ville (en sinus d'élévation) : la route spirale AU-DESSUS des toits
  /* (2026-10-19, essai ARC) LE FOND EN PHOTO + LA MER DE CUMULUS — voir « LE CIEL D'ARC » plus bas. uPh : x la part de la photo, y la colonne (0-1) de son
     soleil, z sa hauteur (rad), w l exposition · uPh2.x le sens du tour · uMr : x la mer de cumulus (0 = la mer peinte d avant), y la profondeur du
     pont de nuages (m sous l œil), z la tuile (m), w la couverture (le seuil des trouées) · uMr2 : x le relief, y la brume (× la tuile). */
  uTapis:{value:0},uArcE:{value:new THREE.Vector4(0,.045,.36,0)},uPhT:{value:null},uMrT:{value:null},uPh:{value:new THREE.Vector4(0,.6,.1,1)},uPh2:{value:new THREE.Vector4(1,0,0,0)},uMr:{value:new THREE.Vector4(0,900,4200,.12)},uMr2:{value:new THREE.Vector4(1.6,3.6,0,.4)},
  uTi:{value:new THREE.Vector4(0,0,0,1)},uTi2:{value:new THREE.Vector4(0,0,.35,0)},uTZen:{value:new THREE.Vector3()},uTMid:{value:new THREE.Vector3()},uTHor:{value:new THREE.Vector3()},uTSol:{value:new THREE.Vector3()},uTMerH:{value:new THREE.Vector3()},uTMerO:{value:new THREE.Vector3()},uTCir:{value:new THREE.Vector3()}, // (titre v4) LE CIEL DE L'ÉCRAN TITRE (cielTitre) — uTi.x = 0 hors du titre : rien ne change en course
  uMzA:{value:new THREE.Vector4(760,.8,15,.25)},uMzB:{value:new THREE.Vector4(.20,.16,.26,.8)},uMzT:{value:new THREE.Vector4(0,0,0,0)},uMzO:{value:new THREE.Vector4(0,0,0,0)},uMzH:{value:new THREE.Vector4(0,0,0,0)}, /* ⚠ (0,0,0,0) ÉCRIT : un Vector4() vide vaut (0,0,0,1) — la part 1 peignait toute la mer en NOIR (vu par Léo au menu de sa copie). */ /* (2026-10-03, atelier des nuages : « une fonction pour altérer le ciel en bas ») les COULEURS de la mer de nuages forcées — trous, ombres, dômes : rgb + part (w) ; w = 0 partout = la mer d'avant au bit près */ // (2026-09-30, niveau 1 v2) LA MER SCULPTÉE : échelle des cellules, part « gonflée », franchise de la lumière, remous · couverture, fermeture au loin, creux, clarté des trouées
  uVG:{value:0}, /* (2026-10-01, Sacha : « enlève tous les trucs Van Gogh ») la touche Van Gogh est RETIRÉE du ciel comme des nuages : plus aucun shader ne lit cet uniforme — l'objet reste, inerte, pour qu'un code qui l'écrirait encore ne plante pas */
  uCiel2:{value:0}, /* (2026-10-17, continuité) LE CIEL CONTINU : 1 sur les six maps de la continuité (routeTick), 0 ailleurs (titre, ville, jade : au bit près) */
  uJour:{value:0},uMerLoin:{value:8000}, /* (2026-10-14, passe graphismes · ciel2) la mer lointaine — là où son bruit s'étire en traînées — fond deux fois plus tôt dans la brume : un dégradé propre à l'horizon (titre et chute posent le leur) */uJZen:{value:new THREE.Vector3()},uJMid:{value:new THREE.Vector3()},uJHor:{value:new THREE.Vector3()},uJSol:{value:new THREE.Vector3()}, // (2026-09-30) LE JOUR D'ALTITUDE (voir cielJour) : 0 = le ciel d'avant
  uSkySat:{value:1}, // (2026-10-15 soir) LA CHROMA DU CIEL DE JOUR (voir cielSat, routeTick) : 1 = telle quelle
  uSym:{value:0}, // (2026-10-15) LE CIEL SANS DESSOUS (map NUAGES) : 1 = la moitié basse du dôme est le reflet de la haute (voir TETE)
  uMer:{value:0}, // (2026-09-26) LA MER DE NUAGES PEINTE sous l'horizon — niveau NUAGES seulement (voir merNuages ; fondue par lvlStep comme la ville)
  uBasTex:{value:null},uBasInv:{value:new THREE.Vector2(1,1)},uBasTr:{value:0},
  uCanyon:{value:0},uCyF:{value:0},uCyDn:{value:0},uCyZ:{value:new THREE.Vector3(.1,.25,.6)},uCyM:{value:new THREE.Vector3(.35,.45,.7)},uCyH:{value:new THREE.Vector3(.8,.7,.6)},uCyS:{value:new THREE.Vector3(1,.8,.6)},uCyB:{value:new THREE.Vector3(.8,.5,.6)},uCyC:{value:new THREE.Vector3(1,.9,.85)},uCyD:{value:new THREE.Vector3(.45,.45,.55)},uCyR:{value:new THREE.Vector3(.5,.45,.5)},uCyK:{value:new THREE.Vector4(0,0,0,0)},uCyN:{value:new THREE.Vector4(0,1,1,0)},uCyW:{value:new THREE.Vector2(0,0)}, // (2026-10-14) LE CANYON DES GÉANTS : son ciel (voir COUCHES.canyon) — uCanyon 0 ailleurs
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
      'uniform sampler2D uPhT,uMrT;uniform vec4 uPh,uPh2,uMr2;uniform float uTapis;uniform vec4 uArcE;',
      'vec3 phCiel(vec3 d){float H=1.5708,e=asin(clamp(d.y,0.,1.)),eg=max(asin(clamp(uSunDir.y,-1.,1.)),.02),ep=uPh.z;',
      '  float e2=e<eg?e*ep/eg:ep+(H-ep)*(e-eg)/(H-eg);',
      '  float u=uPh.y+uPh2.x*(atan(d.x,-d.z)-atan(uSunDir.x,-uSunDir.z))/6.2832,u1=fract(u),u2=fract(u+.5)-.5;',
      '  vec2 uv=vec2(u1,e2/H),g=vec2(u2,uv.y);vec2 dx=dFdx(g),dy=dFdy(g);vec2 dx1=dFdx(uv),dy1=dFdy(uv);',
      '  if(abs(dx1.x)+abs(dy1.x)<abs(dx.x)+abs(dy.x)){dx=dx1;dy=dy1;}',
      /* ===== LE CIEL SE COMPILE AUSSI EN WebGL1 (24/10, relecture : « shaders invalides sur certains GPU ») =====
         `textureGrad` n'existe qu'en GLSL ES 3.00 (WebGL2) : sur un navigateur resté en WebGL1 (WebGL2 indisponible ou bloqué par le pilote),
         les SEPT programmes du dôme ne compilaient plus — tout le ciel manquait, au menu comme sur chaque map. En WebGL1 : une lecture simple
         (au plus une couture d'un pixel au raccord du tour de la photo). En WebGL2 (__VERSION__ 300) : la ligne d'avant, telle quelle. */
      '#if __VERSION__>=300',
      '  return textureGrad(uPhT,uv,dx,dy).rgb*uPh.w;}',
      '#else',
      '  return texture2D(uPhT,uv).rgb*uPh.w;}',
      '#endif',
      'uniform vec3 uSkyMul,uSkyLift,uSunTint;uniform float uSunHalo,uCity,uStars,uMoon,uPulse,uRose;', // grade biome (identité par défaut) + uPulse musique
      'uniform vec3 uFd[8];uniform vec3 uVc[6];', // (2026-10-16) LES TEINTES DE LA VILLE : les couleurs fixes du dégradé et du ciel de la ville (valeurs d'origine hors ville teintée)
      'uniform float uSpace,uNeb,uEtK;uniform vec3 uBandes;', // NIVEAU ORBITE : 0 = aucun effet · uNeb : les nébuleuses (2026-10-15) · uEtK : pixels de rendu par pixel CSS, pour la taille des étoiles (2026-10-22)
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
      'uniform float uVille,uPluie,uVilleY;uniform vec3 uFogCol,uCam;',
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
      '    float t=1600./max(-y,.01);',
      // (2026-09-27, passe perf iPhone) au-delà de 26,5 km (3,5° sous l horizon) les lumières pèsent exp(-t/2300) < 1e-5 : il ne reste que la brume
      '    if(t<26500.){',
      '    vec2 p=d.xz*t+uCam.xz;',
      '    float qu=smoothstep(.3,.8,vn(p/1500.))*(.5+.5*vn(p/450.+4.2)),qu2=vn(p/2600.+9.1);', // les QUARTIERS : un centre qui brille, des zones éteintes
      '    vec3 G=mix(vec3(1.,.42,.18),uVc[2],qu2)*qu*.24;', // la lueur des quartiers qui monte dans la brume
      '    vec3 L=G+smoothstep(3000.,7000.,t)*vec3(.05,.03,.015)*(.25+.75*qu);',           // au loin (au-delà de 7 km) : la lueur MOYENNE, pas de moiré — les fines sont dans villeFin
      '    bas=F*(1.+.28*smoothstep(-.05,-.6,y)*nuit)+L*exp(-t/2300.)*(1.+.6*lv)*nuit;}', // la brume s éclaire par en dessous
      '    else bas=F*(1.+.28*smoothstep(-.05,-.6,y)*nuit);}',
      /* (2026-10-24, Sacha : « le ciel déconne, il n'y a pas de fondu, c'est moche ») HORIZON SANS COUPURE : hors pluie, le ciel du dessus (corail, bleu
         nuit) basculait en 3° sur la brume du dessous — une ligne franche, la couleur de l'air n'étant pas celle du sol. Maintenant la brume REMONTE
         dans le ciel (≈ 12°, courbe douce, 60 % au ras de l'horizon) : le dégradé du ciel s'y noie, comme le brouillard noie les tours 3D ; la jonction
         s'élargit à ±3°. Sous la pluie (uPluie = 1) le plafond est déjà fondu dans la brume : rien ne change. */
      '  haut=mix(haut,F,(1.-smoothstep(0.,.21,y))*(1.-uPluie)*.6);',
      '  return mix(bas,haut,smoothstep(-.05,.045,y));}',
      'void villeFin(inout vec3 c,vec3 d){',
      '  float y=d.y;vec3 F=uFogCol;',
      '  float nuit=clamp(1.5-dot(F,vec3(.3,.59,.11))*4.,0.,1.),lv=uLvl*(.35+uPulse*.5+uBeatK*.6);',
      '  if(y<.03&&nuit>0.){float t=1600./max(-y,.01);',
      /* (2026-09-27, passe perf iPhone) AU-DELÀ DE 7 KM (les 13 derniers degrés sous l'horizon, la moitié de l'abîme vu en vol), le
         mélange du bas prenait DÉJÀ 100 % de la lueur moyenne : artères, rues, toits et leur scintillement étaient calculés pour être
         multipliés par zéro. Ils ne sont plus calculés que là où ils comptent — même image. */
      '  if(t<7000.){',
      '    float px=t*.0016/max(-y,.06),fl=smoothstep(3000.,7000.,t);',               // px : ce que couvre un pixel au sol (m) — l anticrénelage suit la distance
      '    vec2 p=d.xz*t+uCam.xz;',
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
      '    c+=(vec3(1.,.55,.22)*(route*.5+rue*.3)+pc*pt)*(.25+.75*qu)*(1.-fl)*exp(-t/2300.)*(1.+.6*lv)*nuit;}}}',
      'void villeSkyline(inout vec3 c,vec3 d,float az){',
      '  vec3 F=uFogCol;float nuit=clamp(1.5-dot(F,vec3(.3,.59,.11))*4.,0.,1.),lv=uLvl*(.35+uPulse*.5+uBeatK*.6);',
      // ---- LA SKYLINE : du plus loin au plus proche, chaque rangée un peu moins noyée dans la brume ----
      /* ⚠ (2026-09-26, constat de la passe graphique) LA SKYLINE FLOTTAIT : posée sur l horizon (y≈0), alors que la route de la
         ville descend en SPIRALE au-dessus des toits — la ville 3D est donc SOUS l horizon, et la rangée peinte se lisait comme
         une bande en pointillés suspendue à mi-hauteur au-dessus des vraies tours. Elle se pose désormais à l ÉLÉVATION où
         seraient des toits lointains à l altitude de la ville (`uVilleY`, posé par la boucle d après CITY.n.routeY, ~3,5 km) :
         vue d en haut, elle passe SOUS l horizon, derrière la forêt 3D, noyée de brume ; ses fenêtres sont un cran plus sourdes. */
      '  float y=d.y-uVilleY;',
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
      '  float tz9=uTapis>.001?max(uMzB.x,uTapis+.15):uMzB.x;float cov=smoothstep(tz9-uMzB.y*far-.22*big,tz9+.14-uMzB.y*far-.22*big,n),cr=smoothstep(.55,.82,n),ao=smoothstep(tz9,tz9+.32,n);', // (2026-10-20) le tapis clairsemé aussi sur la mer du menu
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
  const ETO_ANC=/[?&]etoiles=ancien\b/.test(location.search); // (2026-10-22) `?etoiles=ancien` : le ciel étoilé de l'orbite d'avant (grains d'un pixel, une seule taille) — pour comparer ; voir `pous`
  const COUCHES={
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
      'uniform float uCanyon,uCyF,uCyDn;uniform vec3 uCyZ,uCyM,uCyH,uCyS,uCyB,uCyC,uCyD,uCyR;uniform vec4 uCyK,uCyN;uniform vec2 uCyW;',
      'float cyh(float x){return fract(sin(x*127.13+.71)*43758.5453);}',
      'vec2 cyMesas(float az,float y){vec2 o=vec2(0.);for(int L=0;L<3;L++){float fl=float(L),N=11.+fl*7.,s=fl*13.1+3.7,u=az/6.2831853*N,id=floor(u);',
      '  for(int k=-1;k<=1;k++){float i2=mod(id+float(k),N),r1=cyh(i2+s),r2=cyh(i2*1.37+s*2.1),r3=cyh(i2*2.71+s*4.3);if(r3<.30)continue;',
      '    float c=float(k)+.5+(r2-.5)*.5,w=.12+.30*r1,dx=abs(u-id-c),top=(.010+.020*r3)*(1.-.28*fl),cap=step(.55,r2)*smoothstep(w*.55,w*.42,dx)*top*.55;',
      '    float m=smoothstep(w,w-.02,dx)*(1.-smoothstep(top+cap-.0012,top+cap+.0012,y))*step(-.03,y);if(m>o.x)o=vec2(m,fl);}}return o;}',
      /* (2026-10-14, passe graphismes · cysoleil) LE CIEL CRÈME DU CANYON : le masque du DISQUE SOLAIRE était inversé (`ds=1.-smoothstep(…,sd)` vaut 1 PARTOUT sauf près du soleil) —
         tout le ciel prenait la couleur du disque (crème ×uCyN.z, jusqu'à ×4) et l'ACES l'écrasait en blanc crème, au matin, à midi comme au soir (sonde : masquer le dôme
         = noir, ses uniformes étaient justes). `ds=smoothstep(…)` : 1 sur le disque, 0 ailleurs. */
      /* (2026-10-18) LES DUNES D'OR : l'horizon de mesas devient un horizon de DUNES (deux houles) et trois PYRAMIDES au loin — mélangé par uCyDn (0 ailleurs : le canyon au bit près) */
'vec2 dnHorizon(float az,float y){float t1=.0075+.0085*(.5+.5*sin(az*6.+1.7))*(.55+.45*sin(az*15.+.4))+.0022*sin(az*37.+2.),t0=.0035+.0055*(.5+.5*sin(az*9.+4.1))*(.5+.5*sin(az*23.+2.2)),pm=0.;', /* (2026-10-20, LE SURF) les trois pyramides PEINTES de l'horizon sont retirées (pm reste 0) : les vraies se dressent au bout de la route, autour du portail */
      '  float m1=1.-smoothstep(t1-.0012,t1+.0012,y),m0=1.-smoothstep(t0-.0012,t0+.0012,y);vec2 o=vec2(m1,1.);if(pm>m1*.5)o=vec2(max(m1,pm),.6);if(m0>.01)o=vec2(max(o.x,m0),mix(o.y,0.,m0));return o*step(-.03,y);}',
      'vec3 canyonCiel(vec3 d){d=normalize(d);float y=d.y,yy=max(y,0.),az=atan(d.x,-d.z),sd=dot(d,uSunDir),sdp=max(sd,0.);',
      '  vec3 c=mix(uCyH,uCyM,smoothstep(0.,.20,yy));c=mix(c,uCyZ,smoothstep(.12,.85,yy));',
      '  c+=uCyS*(pow(sdp,6.)*.30+pow(sdp,40.)*.40)*(1.-.8*uCyN.w);',
      '  {float an=pow(max(-sd,0.),1.5)*uCyN.x;c=mix(c,uCyB,an*smoothstep(.03,.07,y)*(1.-smoothstep(.12,.24,y))*.7);c=mix(c,c*vec3(.70,.75,.92),an*(1.-smoothstep(0.,.05,y))*smoothstep(-.01,.01,y)*.6);}',
      '  if(y>.015&&uCyK.x+uCyK.y>.001){float t=2800./y;vec2 p=d.xz*t+uCam.xz*.7+vec2(uTime*4.,uTime*1.5);',
      '    p=vec2(p.x*(1.-.62*uCyW.x),p.y*(1.+.55*uCyW.x));', /* (2026-10-23, DUNES : « plus de nuages ») uCyW.x : les nuages s'ÉTIRENT en bandes (cumulus de la photo 9) ; uCyW.y : ils se MODÈLENT (le côté du soleil clair, le dessous sombre) */
      '    float n=vfbm(p/1500.+.5*vec2(vn(p/2800.+3.7),vn(p/2800.-5.1))),cov=smoothstep(.80-uCyK.x*.55,1.05-uCyK.x*.55,n)*exp(-t/26000.)*step(.001,uCyK.x);',
      '    float ci=smoothstep(.45,.85,vfbm(vec2(p.x/5200.,p.y/900.)+7.))*exp(-t/40000.)*.55*uCyK.y;',
      '    float li=.5+.5*dot(normalize(vec3(d.x,0.,d.z)+1e-4),normalize(vec3(uSunDir.x,0.,uSunDir.z)+1e-4));',
      '    float sh9=0.;if(uCyW.y>0.){vec2 sv=normalize(uSunDir.xz+1e-4)*.16;float n2=vfbm((p+sv*1500.)/1500.+.5*vec2(vn(p/2800.+3.7),vn(p/2800.-5.1)));sh9=clamp((n-n2)*3.2,-.5,.5)*uCyW.y;}vec3 cc=mix(uCyD,uCyC,clamp(li*.7+.6*(n-.5)+pow(sdp,4.)*.5+sh9,0.,1.));c=mix(c,cc,cov*.92);c=mix(c,mix(uCyC,c,.35),ci);}',
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
      '  float cw9=max(uMr.w,uTapis);float cov=smoothstep(cw9-.07,cw9+.05,h),epa=smoothstep(cw9,cw9+.3,h);',                   // la couverture ; l épaisseur (les bords des trouées s amincissent)
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
      '    if(uTapis>.001)m=mix(mix(uTMerO*.6,uTHor,.55),m,smoothstep(uTapis-.07,uTapis+.05,h0));',                    // (2026-10-20, Léo : « enlever le tapis complètement rempli ») des îlots de cumulus, l air entre eux
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
      /* (2026-10-21, Léo : « petit arc-en-ciel, léger, pas juste grisaille ; il faut créer le décor avec ») L'ARC-EN-CIEL : un cercle de 42° autour du point opposé au soleil (le soleil forcé à ~22° de haut :
         le sommet de l'arc à ~20°, quelle que soit l'heure du jeu), sept bandes (rouge dehors, violet dedans) fondues, une enveloppe douce, un fondu vers l'horizon ; uArcE : x force (0 = éteint),
         y demi-largeur (rad), z hauteur du soleil forcée (rad). Ajouté, jamais plein : la lumière, pas un dessin. */
      'void cielArcEC(inout vec3 col,vec3 d,float y){',
      '  if(uArcE.x<.001||y<.0)return;',
      '  vec2 h=normalize(uSunDir.xz+vec2(1e-4));float ce=cos(uArcE.z),se=sin(uArcE.z);vec3 A=vec3(-h.x*ce,-se,-h.y*ce);',
      '  float th=acos(clamp(dot(d,A),-1.,1.)),t=(th-(.7330-uArcE.y))/(2.*uArcE.y);',        // .7330 rad = 42° : t = 1 au bord rouge (dehors), 0 au bord violet (dedans)
      '  if(t<=0.||t>=1.)return;',
      '  float hu=(1.-t)*.76;vec3 rgb=clamp(abs(mod(hu*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);',
      '  float env=pow(sin(3.14159*t),1.4)*smoothstep(0.,.14,y)*uArcE.x;',
      '  col+=rgb*env*(.55+.45*dot(col,vec3(.33)));}',
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
      'bool cielSOn(float y,float sd){return uStars>0.&&(y>.10||uSpace>0.)&&sd<.8'+(ETO_ANC?'':'&&uSpace<.999')+';}', // la voûte des étoiles (hors orbite : au-dessus de .10) — (2026-10-22) en orbite, ce sont celles de `pous` (la voûte profonde)
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
      '  col+=mix(vec3(.80,.88,1.),vec3(1.,.86,.70),step(.8,fract(h*3.31)))*st*mix(smoothstep(.10,.42,y),1.,uSpace)*(1.-smoothstep(.25,.8,sd))*.9*uStars*'+(ETO_ANC?'(1.+uSpace*.5)':'(1.-uSpace)')+'*(1.+uPulse*1.3);}}', // elles descendent plus bas : le haut du cadre est habité — MINUIT les multiplie, l aube les éteint ; elles palpitent au beat
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
      '  vec3 mw=mix(vec3(.34,.40,.70),vec3(1.,.82,.66),cen*cen*cen*cen*band);', // bleutée, cœur chaud
      '  float n1=esF(d*1.7+vec3(5.,2.,9.)),n2=esF(d*2.3+vec3(13.,7.,1.)),fl=ln;',
      '  float pv=smoothstep(.46,.78,n1),pb=smoothstep(.48,.80,n2);',
      '  vec3 neb=vec3(.44,.14,.70)*pv*(.45+.9*fl)+vec3(.10,.26,.80)*pb*(.45+.9*(1.-fl))+vec3(.70,.12,.50)*pv*pb*1.3;',
      '  col+=(mw*glow*.58+neb*.26*(1.-.55*dust))*uSpace*uNeb;}',
    ],
    pous:[
      /* ===== LA VOÛTE PROFONDE (2026-10-22, Léo : « travaille un tout petit peu les étoiles pour créer un peu de profondeur, là c'est un peu tout noir ;
         des petites étoiles et des étoiles un peu moins petites ; travaille la répartition, observe des images ») =====
         (Remplace la poussière d'étoiles du 15/10 — des grains d'un pixel, tous pareils, jetés au hasard ; `?etoiles=ancien` la rend.) Passe NETTE.
         QUATRE CLASSES, de la plus fine à la plus grosse, comme sur une vraie photo du ciel : un VOILE de grains très faibles, des PETITES, des MOYENNES à
         peine plus grosses, quelques BRILLANTES à halo (qui font fleurir le bloom). Chaque classe a sa grille (`voute` : une étoile au plus par cellule, des
         ceintures de même AIRE — pas de pincement au pôle), sa taille EN PIXELS CSS (`uEtK`, celle d'un objectif : elle ne bouge ni avec le champ de vision, qui
         s'élargit avec la vitesse — c'est la densité qui monte —, ni avec la résolution du téléphone), son éclat (beaucoup de faibles, peu de fortes : `q*q`) et sa
         teinte (bleutées, blanches, orangées — plus franche chez les grosses). Les étoiles sont RONDES partout (la distance se compte en pixels via les dérivées de
         la direction ; l'ancienne voûte les mesurait en angle sans le cosinus de la latitude et les étirait en ovales, puis en tirets vers le haut du cadre).
         La RÉPARTITION n'est pas uniforme : la bande de la voie lactée les serre (3 à 4 fois plus), de larges PLAGES de ~20° sont plus ou moins peuplées (deux
         champs lents, `c1` et `c2`, jamais les mêmes d'une classe à l'autre), les brillantes sont semées sans règle ; chaque étoile se pose où elle veut dans sa
         cellule et le voile a DEUX grilles de pas différents (sinon des rangées et des colonnes se voient là où il est dense — mesuré à 100° de champ).
         Hors orbite (uSpace = 0) cette couche ne tourne pas : les autres ciels sont inchangés au bit près. Coût : une graine de hasard par pixel et par classe,
         le reste seulement dans une cellule habitée. */
      'vec3 vouteTeinte(float t,float s){', // la teinte d'une étoile, tirée au hasard (t) : bleutée, blanche ou orangée ; s = à quel point elle se voit
      '  vec3 c=mix(vec3(.68,.78,1.),vec3(1.,.97,.92),smoothstep(.04,.34,t));',   // un quart bleutées (pâles : jamais des diodes), le gros blanc
      '  c=mix(c,vec3(1.,.76,.52),smoothstep(.62,1.,t));',                          // et plus du tiers qui chauffe vers l orangé
      '  return mix(vec3(1.),c,s);}',
      // UNE classe : A = (rangées par unité de y, graine, part des cellules habitées, rayon du cœur en pixels CSS) · B = (éclat min, éclat max, halo, échelle du halo en pixels CSS) · C = (teinte, scintillement, pouls, marge)
      'vec3 voute(float y,float u0,float pa,vec4 A,vec4 B,vec4 C,float bd){',
      '  float row=floor(y*A.x),yc=(row+.5)/A.x,cc=sqrt(max(1.-yc*yc,.02));',      // la rangée, et le cosinus de sa latitude
      '  float M=max(3.,floor(6.2832*A.x*cc*cc+.5)),u=u0*M,ci=floor(u);',          // les cellules de la rangée : de même aire d une rangée à l autre
      '  vec2 id=vec2(row,ci)+A.y;',
      '  if(hash21(id)>A.z)return vec3(0.);',                                      // cellule vide
      '  vec2 f=vec2(fract(u)-(C.w+(1.-2.*C.w)*hash21(id+17.3)),fract(y*A.x)-(C.w+(1.-2.*C.w)*hash21(id+29.1)));', // l étoile se pose où elle veut dans la cellule, à une marge du bord près (large pour les grosses, qu un bord couperait) : sinon des rangées et des colonnes se voient
      '  float r=length(vec2(f.x*6.2832/M*cc,f.y/(A.x*cc)))/pa;',                 // sa distance au pixel, EN PIXELS de rendu
      '  float sg=max(A.w*uEtK,.6),hs=B.w*uEtK;',                                  // le cœur et le halo se comptent en pixels CSS (même taille sur tous les téléphones) ; jamais sous ~½ pixel : il scintillerait
      '  if(r>3.2*sg+3.*hs)return vec3(0.);',
      '  float q=hash21(id+41.7),ph=hash21(id+53.9);',
      '  float k=exp(-.5*r*r/(sg*sg))+B.z*exp(-r/max(hs,.001));',                  // le cœur, et son halo
      '  return vouteTeinte(hash21(id+7.9),C.x)*mix(B.x,B.y,q*q)*k*(1.+C.y*sin(uTime*(.45+ph*1.1)+ph*40.))*(1.+uPulse*C.z)*(1.+bd*step(.35,hash21(id+63.1)));}', /* (2026-10-25) LES ÉTOILES JOUENT : bd = la bande de sa classe (basses : les brillantes · médiums : les moyennes · aigus : les petites et le voile), 65 % des étoiles de la classe y répondent — très léger */
      'void cielPoussiere(inout vec3 col,float y,float az){',
      '  float pa=max(sqrt(length(cross(dFdx(vDir),dFdy(vDir)))),1e-5),u0=az*.159155+.5;',    // l angle que couvre un pixel
      '  vec3 d=vDir;float b=dot(d,normalize(vec3(.78,.38,-.50))),bl=exp(-b*b*9.),bc=exp(-b*b*55.);', // la bande de la voie lactée : large, et son cœur
      '  float c1=sin(d.x*8.3+d.z*6.1+1.7)*sin(d.y*9.7-d.x*5.1+.6)+.7*sin(d.z*13.1+d.y*7.3-1.1)*sin(d.x*11.3+d.z*8.1+2.4);', // des plages plus ou moins peuplées
      '  float c2=sin(d.x*10.7-d.y*6.1+.3)*sin(d.z*9.3+d.y*11.9+1.9)+.7*sin(d.y*14.1+d.x*7.7+2.2)*sin(d.z*12.1-d.x*9.9-.5);',
      '  float fa=.8+.8*bl+.6*bc;',
      '  vec3 s=voute(y,u0,pa,vec4(50.,3.1,min(.9,.22*fa*exp(c1*.40)),.45),vec4(.10,.36,0.,0.),vec4(.35,0.,0.,.04),uBandes.z*.35);',                 // le voile : des grains très faibles, sur DEUX grilles de pas différents (une seule laisse voir ses rangées là où elle est dense)
      '  s+=voute(y,u0,pa,vec4(33.,5.3,min(.9,.20*fa*exp(c2*.40)),.45),vec4(.10,.36,0.,0.),vec4(.35,0.,0.,.04),uBandes.z*.35);',
      '  s+=voute(y,u0,pa,vec4(22.,7.7,min(.9,.38*(.9+.7*bl+.4*bc)*exp(c2*.35)),.52),vec4(.28,.75,0.,0.),vec4(.55,.06,.3,.06),uBandes.z*.5);',       // les petites
      '  s+=voute(y,u0,pa,vec4(11.,11.3,min(.9,.42*(1.+.4*bl)*exp((c1+c2)*.18)),.68),vec4(.60,1.15,.14,1.7),vec4(.8,.10,.7,.15),uBandes.y*.5);',   // les moyennes
      '  s+=voute(y,u0,pa,vec4(5.4,19.9,.55,.95),vec4(1.2,2.,.20,3.),vec4(1.,.10,1.,.22),uBandes.x*.6);',                                         // les brillantes
      '  col+=s*uSpace*uNeb;}',
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
  if(ETO_ANC)COUCHES.pous=[ // (2026-10-22) `?etoiles=ancien` : la poussière d'étoiles du 15/10, telle quelle (180 cellules par tour, des grains d'un pixel bleus, blancs ou mauves, serrés dans la voie lactée)
      'void cielPoussiere(inout vec3 col,float y,float az){',
      '  float b=dot(vDir,normalize(vec3(.78,.38,-.50))),band=exp(-b*b*36.);',
      '  vec2 sg=vec2(az*28.6479,y*60.),sid=floor(sg),sfr=fract(sg);float h=hash21(sid+71.3);',
      '  if(h<.935-.16*band)return;',
      '  vec2 stp=vec2(fract(h*23.7),fract(h*41.3))*.7+.15;',
      '  float sr=length(vec2((sfr.x-stp.x)*.0349*sqrt(max(0.,1.-y*y)),(sfr.y-stp.y)*.01667));',
      '  float st=1.-smoothstep(0.,.0016,sr),k=fract(h*5.13);',
      '  vec3 c=k<.4?vec3(.66,.76,1.):k<.75?vec3(1.,.96,.92):vec3(.86,.62,1.);',
      '  col+=c*st*(.55+.65*band)*(.7+.3*sin(uTime*(.8+h*2.)+h*31.))*uSpace*uNeb;}',
  ];
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
      /* (2026-10-25, Sacha : « remets le ciel noir dans l'espace, enlève les couleurs de nébuleuses et tout ») plus d'appel à cielEspace : ni voie lactée ni nébuleuses, le noir et les étoiles */
      '  float sd=max(dot(vDir,uSunDir),0.);',      // couchant : halo rosé large, couronne corail, coeur incandescent (tamisé)
      '  cielMer(col,y,sd);', // NUAGES : la mer de nuages sous l horizon (voir merNuages)
      '  cielJour(col,y,sd);', // (2026-09-30) le jour d altitude : la lueur du soleil sur l horizon
      '  cielSoleil(col,sd);',
      '  if(uTi.x>.001)cielTitre(col,vDir,y,sd);', // (titre v4) le ciel de l écran titre
      '  if(uPh.x>.001&&y>-.006)col=mix(col,phCiel(vDir),uPh.x*smoothstep(-.006,.004,y));', // (essai ARC) la photo
      '  cielArcEC(col,vDir,y);', // (2026-10-21) l arc-en-ciel de la pluie : APRÈS le titre et la photo, qui repeignent tout le ciel
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
      '  float y=vDir.y;vec3 col=cielFond(y);float sd=max(dot(vDir,uSunDir),0.);', // (2026-10-15) + l espace profond
      '  cielMer(col,y,sd);cielJour(col,y,sd);cielSoleil(col,sd);if(uTi.x>.001)cielTitre(col,vDir,y,sd);cielArcEC(col,vDir,y);',
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
    // (2026-10-22) LES PICS DE JADE SEULS : le MÊME ciel que la branche `uJade>.9999` du programme plein (le rouleau peint, ou le dessous de la mer), sans le reste
    jd:['void main(){gl_FragColor=vec4((uSous>.5?jadeSous(vDir):jadeCiel(vDir))+vec3(cielTrame()),1.);}'],
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
  /* (24/10, relecture) `extensions.derivatives` : dFdx/dFdy (la photo, la voûte de l'orbite) exigent en WebGL1 la directive
     OES_standard_derivatives — three ne la pose que si on la demande, et l'ignore en WebGL2 (programme identique au bit près). */
  /* ===== LES BOUCLES DU CIEL NE SE DÉROULENT PLUS (2026-10-25, Sacha : « le lien Vercel est particulièrement lent au démarrage ») =====
     MESURÉ (Chrome, AMD RX 6600, ANGLE/Direct3D 11, site publié, profil neuf) : une seule tâche de 56 s au premier chargement, dans la compilation du ciel « plein »
     (41 000 caractères, 14 boucles) — le compilateur Direct3D DÉROULE chaque boucle à borne constante (fbm de 4 tours rappelés des dizaines de fois…). Banc
     (le même source, compilé seul) : 33 s tel quel · 20 s avec les bornes lues dans un uniform (le compilateur ne peut plus dérouler) · 11 s sans aucune boucle.
     Même image : la borne vaut ce qu'elle valait. Les boucles qui lisent une texture (ombres de la mer, ombre du titre) restent constantes (dérivées dans une
     boucle dynamique) ; WebGL1 exige des bornes constantes (téléphones anciens) : la règle ne joue qu'en WebGL2 et sur ordinateur (le téléphone ne change pas). Le navigateur garde ensuite le programme compilé
     (cache de shaders sur le disque) : seuls les chargements qui suivent une modification des shaders payaient. `?boucles=0` = les bornes constantes d'avant. */
  const ciBoucles=function(fs){ if(typeof WebGL2RenderingContext!=='function'||(window.matchMedia&&matchMedia('(hover:none)').matches)||/[?&]boucles=0\b/.test(location.search))return fs; const ns=[];
    const out=fs.replace(/for\s*\(\s*int (\w+)\s*=\s*(-?\d+)\s*;\s*\1\s*(<=?)\s*(\d+)\s*;/g,function(m,v,a,op,b,off){ if(/texture2D/.test(fs.slice(off,off+260)))return m;
      const nm='uL'+(op==='<='?'e':'')+b; if(ns.indexOf(nm)<0){ns.push(nm);if(!skyU[nm])skyU[nm]={value:+b};} return 'for(int '+v+'='+a+';'+v+op+nm+';';});
    if(!ns.length)return fs; const k=out.search(/^(?!\s*#)\s*\S/m); return out.slice(0,k)+'uniform int '+ns.join(',')+';\n'+out.slice(k); };
  const mk=(fs,lisse)=>new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,depthTest:!lisse,vertexShader:VS,fragmentShader:ciBoucles(fs),extensions:{derivatives:true}});
  const mat=mk(src(TETE,VILLE,VILLE_CIEL,MER,K.fond,K.mer,K.jour,K.soleil,K.titre,K.jade,K.canyon,K.gon,K.son,K.guirl,K.niveau,K.etoiles,K.espace,K.pous,K.lune,K.voile,K.onde,K.trame,MAIN.plein));
  /* LE CIEL SE PEINT EN DERNIER (2026-09-26, vague 2 — audit GPU). Il était dessiné en PREMIER (renderOrder −9, sans écrire la
     profondeur) : chaque pixel de l'écran payait le shader le plus lourd du jeu (mer de nuages, ville, étoiles, fond musical)… puis
     la route, la caisse, les nuages le recouvraient. Posé sur le plan lointain (z = w dans le vertex) et dessiné APRÈS tous les
     opaques, il est rejeté par le test de profondeur partout où quelque chose le cache : on ne peint plus que le ciel qu'on VOIT.
     Les transparents (soleil « 1.61 », nappe, rayons, halo de la planète, nuages en fondu) passent toujours après lui ; la Terre
     (opaque) se peint juste derrière (renderOrder 21, même plan lointain). Image identique. */
  const m=new THREE.Mesh(new THREE.SphereGeometry(4300,48,28),mat);
  const F_BAS=.5,FPK_BAS=1; // la passe lisse : ½ de la résolution en largeur et en hauteur (¼ des pixels) · l'anticrénelage de la mer y compte des pixels d'ÉCRAN (1)
  m.userData.ciel={plein:mat,f:F_BAS,
    basN:mk(src('#define MER_FPK '+FPK_BAS.toFixed(4),TETE,VILLE,MER,K.fond,K.mer,K.jour,K.soleil,K.titre,K.gon,K.guirl,K.voile,K.espace,K.trame,MAIN.basN),true),
    netN:mk(src(TETE,K.son,K.etoiles,K.pous,K.lune,K.trame,MAIN.netN)),
    basV:mk(src(TETE,VILLE,VILLE_CIEL,K.trame,MAIN.basV),true),
    netV:mk(src(TETE,VILLE,VILLE_CIEL,K.trame,MAIN.netV)),
    cy:mk(src(TETE,VILLE,K.son,K.etoiles,K.canyon,K.trame,MAIN.cy)), // (2026-10-14) LE CANYON DES GÉANTS : son ciel seul
    jd:mk(src(TETE,VILLE,K.jade,K.trame,MAIN.jd))}; // (2026-10-22) LES PICS DE JADE : son ciel seul
  m.frustumCulled=false;m.renderOrder=20;scene.add(m);return m;
})();
let FOG_N=420,FOG_F=2600; // near/far pilotés par les BIOMES (le lerp cloudInS les relit chaque frame)
const FOG_BASE=new THREE.Color(0x5e3254),FOG_CLOUD=new THREE.Color(0xd8bcd0),fogTmp=new THREE.Color(); // FOG_BASE : l'objet reste const, les biomes mutent son RGB
const FOG_CJ=new THREE.Color(0xc06a54),cjV=new THREE.Vector3(); // CONTRE-JOUR : l'air s'embrase quand on roule vers le soleil (la seule zone lumineuse)
scene.fog=new THREE.Fog(0x5e3254,FOG_N,FOG_F); // brume MAGENTA sombre : la route lointaine fond dans le rose de la nuit qui tombe
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.1,9800);
// SOLEIL « 1.61 » : les grands numéros lumineux du studio se couchent à l'horizon
const sunSprite=(function(){
  const cv=document.createElement('canvas');cv.width=cv.height=512;
  const c=cv.getContext('2d');
  const tex=new THREE.CanvasTexture(cv);
  const cvO=document.createElement('canvas');cvO.width=cvO.height=512;const texO=new THREE.CanvasTexture(cvO); // (vague 2) les chiffres d'or
  function draw(){
    c.clearRect(0,0,512,512);
    // UNE VRAIE SOURCE DE LUMIÈRE (2026-08-03) : le disque était volontairement « contenu » et
    // dessiné en fusion NORMALE — il PEIGNAIT le ciel au lieu d'y AJOUTER de la lumière, d'où un
    // aplat terne. Il passe en additif (voir le matériau) et gagne un vrai noyau brûlant : un cœur
    // blanc franc, une couronne dorée large, puis la longue retombée corail qui se noie dans le ciel.
    const g=c.createRadialGradient(256,256,10,256,256,252);
    g.addColorStop(0,'rgba(255,252,242,1)');      // le NOYAU : blanc chaud, pas crème
    g.addColorStop(.09,'rgba(255,236,190,.98)');  // il tient jusqu'à 9 % — c'est ça qui fait « ça brûle »
    g.addColorStop(.20,'rgba(255,198,120,.62)');  // couronne dorée large
    g.addColorStop(.46,'rgba(255,132,104,.24)');
    g.addColorStop(1,'rgba(255,124,110,0)');      // retombée corail jusqu'à zéro AVANT le bord du disque
    c.fillStyle=g;c.beginPath();c.arc(256,256,252,0,7);c.fill();
    /* LE « 1.61 » EN OR (2026-09-26, vague 2 — « l'encre et l'or »). En additif, les chiffres blancs sur un ciel de jour clair ne
       pouvaient qu'AJOUTER un peu de lumière : un fantôme pâle, illisible (mesuré par le directeur artistique). Le disque reste ici,
       ADDITIF, avec son sillon creusé (le halo ne lave pas les glyphes) ; les CHIFFRES passent sur un second sprite, en fusion
       NORMALE, peints comme une plaque du HUD : OR #ffd75e, reflet #fff3b0 en tête, tranche #b8860b, liseré d'ENCRE #1c0430. La
       lumière, c'est l'argent : l'astre du niveau est une pièce d'or. */
    c.font='84px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='middle';
    c.lineJoin='round';
    c.globalCompositeOperation='destination-out';
    c.lineWidth=30;c.strokeStyle='rgba(0,0,0,.70)';c.strokeText('1.61',256,260); // le sillon
    c.globalCompositeOperation='source-over';
    tex.needsUpdate=true;
    // les CHIFFRES D'OR (même cadrage 512 : le sprite enfant se superpose au pixel près)
    const d=cvO.getContext('2d');d.clearRect(0,0,512,512);
    d.font=c.font;d.textAlign='center';d.textBaseline='middle';d.lineJoin='miter';
    d.lineWidth=16;d.strokeStyle='#1c0430';d.strokeText('1.61',256,266);d.strokeText('1.61',256,260); // le liseré d'encre, tranche comprise
    d.fillStyle='#b8860b';d.fillText('1.61',256,266);                                             // la TRANCHE : l'épaisseur de la pièce
    const cvL=document.createElement('canvas');cvL.width=cvL.height=512;const l=cvL.getContext('2d');   // la face : or plein, reflet clair en tête
    l.font=c.font;l.textAlign='center';l.textBaseline='middle';l.fillStyle='#ffd75e';l.fillText('1.61',256,260);
    l.globalCompositeOperation='source-atop';l.fillStyle='#fff3b0';l.fillRect(0,0,512,248);
    d.drawImage(cvL,0,0);toileRend(cvL); // (2026-10-14, passe perf mobile) toile de travail 512² : 1 Mo rendu tout de suite, à chaque dessin
    texO.needsUpdate=true;
  }
  draw();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw).catch(function(){});
  // ADDITIF : c'est ce qui fait la différence entre un autocollant et une source de lumière — le disque
  // AJOUTE sa lumière au ciel, le bloom l'attrape, et le halo se fond au lieu de se découper.
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));
  // renderOrder ÉPINGLÉ (2026-07-20 v3) : sans lui, le tri des transparents (distance CAMÉRA,
  // recalculée chaque frame) faisait passer le soleil devant/derrière les titans au gré du shake
  // → gros clignotement à l'horizon. Le trio soleil/nappe/rayons dessine toujours JUSTE après le
  // skyDome (-9), donc toujours DERRIÈRE les nuages : ordre fixe, plus aucun flip possible.
  sp.renderOrder=-8;
  /* LE 1.61 DEVIENT UN ASTRE (2026-08-08). Il était « contenu » : 940 d'échelle à 3600 de distance,
     soit ~15° — un logo posé à l'horizon. Il passe à 2050, soit **~31° de large, 43 % de la hauteur
     d'écran** : on ne le regarde plus, il nous regarde. C'est l'ancre du niveau 1, le point fixe
     autour duquel tout le reste tourne. ⚠ l'échelle est la SEULE chose que la musique pilote ici
     (`sunSprite.scale`) : l'opacité appartient aux BIOMES (`bioApply`) et la lui disputer ferait
     clignoter le soleil à chaque portail. Le battement passe donc par `material.color`, que
     personne d'autre n'écrit. */
  sp.userData.base=2050;
  sp.scale.set(2050,2050,1);
  // (vague 2) LES CHIFFRES D'OR : un enfant du disque — même place, même échelle (la musique le fait battre avec lui), caché avec lui
  // (garage, étal, orbite, pluie). Fusion NORMALE : l'or se PEINT sur le ciel, il ne s'y dilue plus. Dessiné après la nappe et les rayons.
  const chif=new THREE.Sprite(new THREE.SpriteMaterial({map:texO,transparent:true,depthWrite:false,fog:false}));
  chif.renderOrder=-5;sp.add(chif);sp.userData.chif=chif;
  return sp;
})();
// LUEUR D'HORIZON + RAYONS CRÉPUSCULAIRES (purement visuels — constantes réglables)
const GLOW_DROP=260,RAY_LIFT=520,RAY_OFF=[-520,-180,150,480],RAY_ANGLES=[-.42,-.15,.12,.38],RAY_OPACITY=.12;
const horizonGlow=(function(){ // nappe très large et plate : l'horizon embrasé sous le soleil
  // ⚠ LE RECTANGLE À L'HORIZON, C'ÉTAIT ICI (corrigé 2026-08-03, MESURÉ). Le dégradé radial avait un
  // rayon de 124 px dans un canvas haut de 64 (32 depuis le centre) : verticalement il n'atteignait
  // JAMAIS sa dernière étape transparente, il était TRANCHÉ par le bord. Alpha relevé sur les bords
  // haut et bas : 149/255, soit 58 % d'opacité qui tombe à 0 d'un coup — sur un sprite ADDITIF de
  // 3000 × 560, ça dessine une barre rectangulaire franche en travers du ciel.
  // LA CORRECTION : on rend le dégradé ELLIPTIQUE (le canvas 2D ne sait faire que des cercles, donc
  // on écrase le repère en Y) et on cale son zéro AVANT le bord — 30 px sur 32, il reste une marge
  // de sécurité complètement transparente tout autour.
  const cv=document.createElement('canvas');cv.width=256;cv.height=64;
  const c=cv.getContext('2d');
  const R9=124;
  const g=c.createRadialGradient(0,0,2,0,0,R9);
  g.addColorStop(0,'rgba(255,182,128,.82)');g.addColorStop(.45,'rgba(240,110,126,.38)');g.addColorStop(1,'rgba(240,110,126,0)');
  c.save();
  c.translate(128,32);c.scale(1,30/R9); // 30 (et non 32) : le dégradé s'éteint 2 px avant le bord
  c.fillStyle=g;c.fillRect(-R9,-R9,R9*2,R9*2);
  c.restore();
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,opacity:.8}));
  sp.renderOrder=-7; // épinglé derrière les nuages (voir sunSprite)
  sp.scale.set(3000,560,1);return sp;
})();
// ---------- LA PLANÈTE : une Terre bleu-vert qui flotte haut dans le ciel, vue depuis l'orbite ----------
// Un ancrage céleste de plus (comme la lune), volontairement PETIT : elle habite le cadre sans le manger.
const PLANET_DIR=new THREE.Vector3(-.76,.11,.64).normalize(); // BASSE et DÉPORTÉE : une partie sort du cadre → on lit une DEMI-SPHÈRE, pas une bille (et la route reste dégagée)
// ON EST AU RAS DE L'ATMOSPHÈRE : la Terre n'est plus une bille dans le ciel mais un MONDE dont on
// voit la COURBURE (~40° d'arc ≈ la moitié de la hauteur d'écran), posé bas, avec son limbe qui brille.
const PLANET_R=1560,PLANET_D=3400; // ~62 % de la hauteur : la demi-sphère barre franchement le ciel — on rase l'atmosphère
const TERRE_VOLUTES=false; // (2026-10-14, passe graphismes) interrupteur d'UNE ligne : les volutes blanches peintes sur la Terre (les seuls « nuages » qu'on voie en orbite — buildClouds/buildCoton/mkCloud n'y créent rien, lvlNuageOk dit non). false = Terre sans nuages. FALSE (Sacha a validé le retrait des « nuages » de l'espace, 14/10) : la Terre du matin est nette ; remettre true pour les revoir.
const planetGroup=(function(){
  const g=new THREE.Group();
  // texture : océans profonds, continents verts, calottes blanches et volutes nuageuses
  // TEXTURE ÉQUIRECTANGULAIRE d'après la réf : EUROPE + AFRIQUE, océan azur vif, Sahara ocre,
  // massifs enneigés, récifs et fosses. Tout est procédural (aucun asset) mais géographiquement lisible.
  const W9=1024,H9=512,cv=document.createElement('canvas');cv.width=W9;cv.height=H9;const x=cv.getContext('2d');
  const paintTerre=function(x){ // (2026-10-14, passe graphismes) la peinture de la Terre, mise en fonction pour pouvoir REPEINDRE la même toile (même taille) quand la variante d'orbite change de planète (voir PLANETES) — le corps est inchangé
  const oc=x.createLinearGradient(0,0,0,H9); // OCÉAN : azur vibrant, plus profond aux pôles
  oc.addColorStop(0,'#0a3f7d');oc.addColorStop(.30,'#1370cf');oc.addColorStop(.5,'#1b8ae6');
  oc.addColorStop(.70,'#1370cf');oc.addColorStop(1,'#0a3f7d');
  x.fillStyle=oc;x.fillRect(0,0,W9,H9);
  for(let i=0;i<90;i++){ // fosses profondes + hauts-fonds turquoise (les « coraux » de la réf)
    const cx=Math.random()*W9,cy=30+Math.random()*(H9-60),r=18+Math.random()*90;
    x.fillStyle=Math.random()<.45?'rgba(6,40,92,.30)':'rgba(64,196,224,.20)';
    x.beginPath();x.ellipse(cx,cy,r,r*(.35+Math.random()*.4),Math.random()*3,0,6.2832);x.fill();
  }
  // masse de terre : amas de disques → côtes déchiquetées, jamais une patate
  const land=(pts,col,r,n)=>{x.fillStyle=col;
    for(const p of pts)for(let i=0;i<n;i++){
      const a=Math.random()*6.2832,d=Math.random()*r;
      x.beginPath();x.arc(p[0]+Math.cos(a)*d,p[1]+Math.sin(a)*d*.8,r*(.34+Math.random()*.4),0,6.2832);x.fill();}};
  const VERT='#2e8b45',SABLE='#d9b169',SAHARA='#e3c07d',STEPPE='#8a9c4a';
  // AFRIQUE : bulbe nord large (Sahara), corne à l'est, pointe sud
  land([[470,250],[520,235],[430,240],[500,285],[470,320],[452,355],[500,205],[556,268]],VERT,30,10);
  land([[430,215],[480,205],[530,212],[575,232],[392,222]],SAHARA,30,10); // le Sahara couvre le nord
  land([[452,196],[512,190],[560,200]],SABLE,22,8);                        // dunes plus claires
  land([[462,300],[486,330],[458,352]],VERT,24,9);                          // Afrique équatoriale/australe
  // EUROPE : plus petite, verte, découpée — au nord de la Méditerranée
  land([[452,150],[492,140],[522,152],[420,142],[540,132]],VERT,20,8);
  land([[404,120],[440,112],[478,118]],STEPPE,18,7);                        // plaines du nord
  // MASSIFS ENNEIGÉS : Alpes, Atlas, Caucase
  x.fillStyle='rgba(244,250,255,.85)';
  for(const m of [[470,140],[496,146],[436,196],[556,146],[520,138]]){
    for(let i=0;i<5;i++){x.beginPath();
      x.ellipse(m[0]+(Math.random()-.5)*22,m[1]+(Math.random()-.5)*10,5+Math.random()*7,3+Math.random()*4,Math.random()*3,0,6.2832);x.fill();}
  }
  x.fillStyle='rgba(238,248,255,.95)';x.fillRect(0,0,W9,26);x.fillRect(0,H9-26,W9,26); // calottes polaires
  x.globalAlpha=.46;x.fillStyle='#ffffff';                                   // volutes nuageuses en bandes
  for(let i=0;i<(TERRE_VOLUTES?54:0);i++){
    const cx=Math.random()*W9,cy=34+Math.random()*(H9-68),w=40+Math.random()*130;
    x.beginPath();x.ellipse(cx,cy,w,7+Math.random()*13,(Math.random()-.5)*.5,0,6.2832);x.fill();
  }
  x.globalAlpha=1;
  };const peintTerre=function(x){const r0=Math.random;Math.random=planetesAlea(77);try{paintTerre(x);}finally{Math.random=r0;}};peintTerre(x); // (graine fixe : la Terre est la même à chaque repeinte)
  const tex=new THREE.CanvasTexture(cv);tex.wrapS=THREE.RepeatWrapping;texLibere(tex); // (2026-10-14, passe perf mobile) 1024 × 512 peinte une fois : 2 Mo rendus après l'envoi (paliers 0-1)
  // ⚠ le grade final (expo + saturation + bloom) BRÛLE tout ce qui est clair : mesurée à [253,231,239],
  // la planète ressortait BLANCHE. On la rentre donc volontairement sombre — c'est le post qui la rallume.
  const globe=new THREE.Mesh(new THREE.SphereGeometry(PLANET_R,44,30),
    new THREE.MeshBasicMaterial({map:tex,fog:false,color:0x55708c})); // teinte multiplicative : garde le bleu-vert au lieu de saturer
  /* LE JOUR ET LA NUIT SUR LA TERRE (2026-09-26). En MeshBasic, le globe était éclairé UNIFORMÉMENT — une bille peinte, sans
     volume. Il prend un soleil — ⚠ PAS `SUN_DIR` : en orbite la planète suit le CAP de la caméra (lvlPlanete), et avec le vrai
     soleil on la voyait par sa face de NUIT la moitié du niveau (mesuré : en roulant vers le couchant, un disque bleu-noir). La
     lumière vient donc du dessus, un peu de côté et de derrière l'œil : la face visible est TOUJOURS le jour, le terminateur
     court sur le bord bas (le plus souvent sous la route). En orbite le disque « 1.61 » est éteint : rien ne le contredit.
     Une face de jour un peu plus vive, une face de NUIT bleu-nuit (jamais noire — la Terre reste lisible), un TERMINATEUR large et
     ourlé d'une bande de couchant, le REFLET du soleil sur les océans (masqué hors des bleus : Mars ou Vénus n'ont pas de mer),
     et un liseré d'atmosphère DANS le disque, plus fort côté jour. ⚠ le limbe additif et le halo qui BAT au rythme sont d'autres
     coquilles : on n'y touche pas. Compilé au menu par les `renderer.compile` de chauffe (le globe est dans la scène, même caché). */
  globe.material.onBeforeCompile=function(sh){
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWN9,vWP9,vL9;')
      .replace('#include <project_vertex>','#include <project_vertex>\nvWN9=normalize(mat3(modelMatrix)*normal);vWP9=(modelMatrix*vec4(transformed,1.)).xyz;'+
        'vec3 tc9=normalize(cameraPosition-modelMatrix[3].xyz),sd9=normalize(cross(tc9,vec3(0.,1.,0.))+vec3(1e-4));vL9=normalize(tc9*.5+vec3(0.,.75,0.)+sd9*.45);'+
        'gl_Position.z=gl_Position.w;'); // (2026-09-26, vague 2) sur le plan lointain, comme le dôme : tout ce qui est devant la cache, test de profondeur compris
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWN9,vWP9,vL9;')
      .replace('#include <envmap_fragment>',[
        '{ vec3 N=normalize(vWN9),V=normalize(cameraPosition-vWP9),uSol=normalize(vL9);float ndl=dot(N,uSol);',
        '  float jour=smoothstep(-.22,.30,ndl);vec3 c0=outgoingLight;',
        '  vec3 c=mix(c0*vec3(.30,.36,.58)+vec3(.004,.008,.026),c0*1.12,jour);',            // nuit bleu-nuit ↔ jour
        '  c+=vec3(1.,.42,.20)*.16*(1.-smoothstep(0.,.20,abs(ndl-.02)));',                  // le couchant qui court sur le terminateur
        '  float mer=smoothstep(.02,.12,c0.b-max(c0.r,c0.g));vec3 H=normalize(uSol+V);',
        '  c+=vec3(1.,.9,.74)*pow(max(dot(N,H),0.),70.)*mer*jour*.55;',                     // le soleil qui scintille sur l océan
        '  vec3 rim9=mix(mix(vec3(.85,.52,.30),vec3(.92,.82,.58),clamp(opacity*3.,0.,1.)),vec3(.30,.62,1.),step(.9,opacity));diffuseColor.a=1.;', // (2026-10-14, passe graphismes) la couleur du liseré se lit dans `opacity` (uniforme déjà là, inutilisé par un globe opaque) : 1 = bleu de la Terre (inchangé), 0 = ocre (Mars), .3 = crème (Jupiter, Saturne) ; l'alpha reste 1
        '  c+=rim9*pow(1.-max(dot(N,V),0.),3.)*(.12+.40*jour);',                // l atmosphère vue par la tranche, DANS le disque
        '  outgoingLight=c; }',
        '#include <envmap_fragment>'].join('\n'));
  };
  globe.material.customProgramCacheKey=function(){return 'globeJourNuit3';};
  globe.rotation.z=.28; // axe incliné, comme la vraie
  g.add(globe);
  // ATMOSPHÈRE : un liseré bleu qui déborde du disque (BackSide = on ne voit que le pourtour)
  // LE LIMBE : vu d'aussi près, c'est LUI qui vend l'altitude — un liseré d'atmosphère qui déborde
  const atmo=new THREE.Mesh(new THREE.SphereGeometry(PLANET_R*1.045,40,28),
    new THREE.MeshBasicMaterial({color:0x8fd4ff,transparent:true,opacity:.20,side:THREE.BackSide,
      blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  /* L'ATMOSPHÈRE EN DÉGRADÉ (2026-09-26, vague 2). La coquille ajoutait une opacité CONSTANTE : autour du disque un anneau bleu marine
     plat (mesuré #072e61, cerné net des deux côtés) — un liseré de dessin animé, pas de l'air — et un voile uniforme sur tout le globe.
     Elle dose désormais sa lumière à l'angle de vue : pleine au ras du disque (là où le regard traverse le plus d'air), nulle au bord
     extérieur de la coquille et au centre du globe. Même couleur, même opacité pilotée par la musique (LVLFX) et par le niveau (lvlAstre) :
     seul le PROFIL change. Le halo qui bat au rythme (la coquille suivante) n'est pas touché. */
  atmo.material.onBeforeCompile=function(sh){
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vN9a,vV9a;')
      .replace('#include <project_vertex>','#include <project_vertex>\nvN9a=normalMatrix*normal;vV9a=-mvPosition.xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vN9a,vV9a;')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );',
        'float nd9=abs(dot(normalize(vN9a),normalize(vV9a)));'+ // 0 au bord extérieur de la coquille, ≈ .29 au ras du disque (R / 1,045 R), → 1 au centre
        'vec4 diffuseColor=vec4(diffuse,opacity*2.2*smoothstep(0.,.29,nd9)*(1.-smoothstep(.29,.66,nd9)));');
  };
  atmo.material.customProgramCacheKey=function(){return 'atmoDegrade';};
  g.add(atmo);
  /* LE LIMBE QUI RESPIRE (2026-08-08) — « fais briller certains éléments comme la planète ».
     ⚠ ON NE TOUCHE PAS AU GLOBE. La doc juste au-dessus le dit : le grade final BRÛLE tout ce qui
     est clair, la planète est rentrée volontairement sombre pour que le post la rallume. Éclairer
     la TEXTURE la ramènerait au blanc plat qu'on avait déjà corrigé une fois. C'est donc le LIMBE,
     et lui seul, qui prend la musique : une seconde coquille additive plus large que la première,
     dont l'opacité et la teinte cognent au beat. Un halo qui gonfle autour d'un globe sombre se lit
     comme une atmosphère qui s'illumine ; un globe qui blanchit se lit comme un bug. */
  const halo=new THREE.Mesh(new THREE.SphereGeometry(PLANET_R*1.135,36,24),
    new THREE.MeshBasicMaterial({color:0x6fc0ff,transparent:true,opacity:.10,side:THREE.BackSide,
      blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  g.add(halo);
  // ⚠ le renderOrder d'un GROUP ne se propage PAS aux enfants (mesuré : la planète n'apparaissait
  // pas du tout — différence de pixels 0). Comme tout astre, elle se dessine en PREMIER, sans test
  // de profondeur : le ciel derrière, tout le reste (nuages, route) la recouvre naturellement ensuite.
  g.traverse(o=>{if(o.material){o.material.depthWrite=false;o.material.depthTest=false;o.renderOrder=-8;}});
  /* (2026-09-26, vague 2 — audit GPU) LE GLOBE SE PEINT APRÈS LE CIEL. Le dôme passe désormais APRÈS les opaques (voir skyDome) : le globe,
     s'il restait premier et sans test de profondeur, serait recouvert par le ciel. Il se pose donc lui aussi sur le plan lointain (z = w)
     et se dessine juste après le dôme (21 > 20), AVEC le test de profondeur : la route, les caisses, la ville le cachent sans qu'on ait
     à peindre ses pixels pour rien. Même image. */
  globe.material.depthTest=true;globe.renderOrder=21;
  /* ⚠ LE HALO TRAVERSAIT LA ROUTE (2026-09-25, user : « on voit le rayonnement de la Terre à travers la route »).
     Le globe est OPAQUE : il passe dans la liste opaque, en premier, et la route le recouvre — parfait. Mais l'atmosphère
     et le limbe sont TRANSPARENTS : three.js dessine TOUS les transparents APRÈS tous les opaques, renderOrder ou pas.
     Sans test de profondeur, ils se peignaient donc PAR-DESSUS la route déjà posée. Ils reprennent le test (sans écrire
     de profondeur) : la route, les caisses, la ville les masquent ; le ciel, lui, est plus loin qu'eux. */
  atmo.material.depthTest=true;halo.material.depthTest=true;
  g.userData.globe=globe;g.userData.atmo=atmo;g.userData.halo=halo;
  g.userData.tex=tex;g.userData.peintTerre=peintTerre;g.userData.W9=W9;g.userData.H9=H9;g.userData.peint='terre'; // (2026-10-14, passe graphismes) de quoi repeindre la toile (planetesPeint)
  scene.add(g);return g;
})();
/* <<<FIN CIEL>>> */
/* ===== LE FLOU DES TOILES SANS `ctx.filter` (24/10, relecture WebKit : « les bugs qui n'existent que sous Safari / WKWebView ») =====
   `ctx.filter='blur(Npx)'` n'existe dans AUCUN Safari (iOS 15 → 18 : derrière le réglage « Canvas Filters », éteint par défaut) : l'affectation
   y crée une simple propriété et rien n'est flouté — les rayons du soleil et les faisceaux des phares de TOUTES les caisses sortaient à bords
   nets sur iPhone (le `try` ne voit rien : il n'y a pas d'erreur). Là où le filtre manque, `flou2dRepli` floute la toile APRÈS le dessin :
   trois flous-boîtes séparables (≈ la gaussienne d'écart-type N du filtre CSS), en alpha prémultiplié (pas de frange sombre), le dehors de la
   toile transparent. Une fois par texture, au chargement (256 × 256 : quelques ms). Là où `ctx.filter` existe (Chrome, Firefox, Android) :
   la fonction rend tout de suite, rien ne change. */
function flou2dNatif(){if(flou2dNatif.v===undefined){try{flou2dNatif.v=typeof CanvasRenderingContext2D!=='undefined'&&('filter' in CanvasRenderingContext2D.prototype);}catch(e){flou2dNatif.v=false;}}return flou2dNatif.v;}
function flou2dRepli(c,w,h,s){if(flou2dNatif()||!(s>0))return;try{
  const im=c.getImageData(0,0,w,h),d=im.data,n=w*h,A=new Float32Array(n*4),B=new Float32Array(n*4);
  for(let i=0;i<n;i++){const a=d[i*4+3]/255;A[i*4]=d[i*4]*a;A[i*4+1]=d[i*4+1]*a;A[i*4+2]=d[i*4+2]*a;A[i*4+3]=d[i*4+3];}
  const wi=Math.sqrt(4*s*s+1);let wl=Math.floor(wi);if(wl%2===0)wl--;const m=Math.round((12*s*s-3*wl*wl-12*wl-9)/(-4*wl-4)); /* les 3 boîtes d'une gaussienne : m de largeur wl, les autres wl+2 */
  const passe=function(S,D,r,hz){const L=hz?w:h,K=hz?h:w,st=hz?4:w*4,k=1/(2*r+1);
    for(let j=0;j<K;j++){const o=hz?j*w*4:j*4;for(let ch=0;ch<4;ch++){let acc=0;for(let t=0;t<=r&&t<L;t++)acc+=S[o+t*st+ch];
      for(let i=0;i<L;i++){D[o+i*st+ch]=acc*k;const ad=i+r+1,ot=i-r;if(ad<L)acc+=S[o+ad*st+ch];if(ot>=0)acc-=S[o+ot*st+ch];}}}};
  for(let b=0;b<3;b++){const r=((b<m?wl:wl+2)-1)/2;passe(A,B,r,true);passe(B,A,r,false);}
  for(let i=0;i<n;i++){const a=A[i*4+3],q=a>0?255/a:0;d[i*4+3]=Math.round(a);d[i*4]=Math.round(A[i*4]*q);d[i*4+1]=Math.round(A[i*4+1]*q);d[i*4+2]=Math.round(A[i*4+2]*q);}
  c.putImageData(im,0,0);}catch(e){}}
const RAYS=(function(){ // 3-4 faisceaux diffus en éventail derrière les nuages (discrets)
  const cv=document.createElement('canvas');cv.width=64;cv.height=256;
  const c=cv.getContext('2d');
  try{c.filter='blur(5px)';}catch(e){}
  // MÊME PIÈGE que la nappe d'horizon : la 1re étape valait .5 EN BAS DU CANVAS, pile sur le bord —
  // une coupure franche en travers d'un sprite additif de 260 × 1700. On part donc de zéro et on
  // monte en 6 % de hauteur : le pied du rayon s'allume au lieu d'être tranché au couteau.
  const g=c.createLinearGradient(0,256,0,0);
  g.addColorStop(0,'rgba(255,190,150,0)');g.addColorStop(.06,'rgba(255,190,150,.5)');
  g.addColorStop(.55,'rgba(250,150,140,.18)');g.addColorStop(1,'rgba(240,130,130,0)');
  c.fillStyle=g;
  c.beginPath();c.moveTo(26,256);c.lineTo(38,256);c.lineTo(58,0);c.lineTo(6,0);c.closePath();c.fill();
  flou2dRepli(c,64,256,5); /* (24/10) Safari n'a pas `ctx.filter` : le même flou, après coup (voir LE FLOU DES TOILES SANS ctx.filter) */
  const tex=new THREE.CanvasTexture(cv);
  const arr=[];
  for(let i=0;i<RAY_ANGLES.length;i++){
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,opacity:RAY_OPACITY,rotation:RAY_ANGLES[i]}));
    sp.renderOrder=-6; // épinglé derrière les nuages (voir sunSprite)
    sp.scale.set(260,1700,1);arr.push(sp);
  }
  return arr;
})();
const SUN_PERP=new THREE.Vector3().crossVectors(SUN_DIR,new THREE.Vector3(0,1,0)).normalize();
// Détection mobile / matériel faible AVANT le renderer : elle pilote antialias, DPR, ombres et post-traitement.
/* ⚠ `?tel=1` (ou `?mobile=1`) — LA VERSION TÉLÉPHONE SUR L'ÉCRAN D'ORDI (2026-09-24). « Une version
   mobile et tactile, jouable sur mon écran d'ordi avec le même affichage que sur un téléphone, mais
   sans simuler un écran de téléphone » : le jeu garde TOUTE la fenêtre, et prend le chemin téléphone
   complet — coque de menu, écran nu, volant à gauche, NITRO à droite, gaz auto, rendu mobile.
   Ce qui change par rapport à un vrai téléphone, et seulement ça : pas de gel « téléphone couché »
   (un écran d'ordi est en paysage, c'est normal), pas de plein écran forcé au premier clic, et une
   résolution d'image à la mesure d'un moniteur (voir `applyQ`). Toutes les commandes tactiles ont un
   repli souris ; le clavier reste branché ; un écran tactile d'ordi marche au doigt. */
/* ⚠ LES DEUX ÉDITIONS : `EDITION` est déclarée dans le <head> (2026-09-28), à côté de la COLONNE de l'ordi qui en dépend —
   c'est toujours la SEULE ligne qui diffère entre VERSION PRINCIPALE et AUTRE VERSION (voir synchro-versions.js). Dans la
   colonne, ce qui suit voit un écran de 390 × 844 non tactile : c'est donc ce chemin `FORCE_TEL` qui y tourne. */
const TACTILE_NATIF=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)||('ontouchstart'in window)||navigator.maxTouchPoints>0;
const TEL_NATIF=TACTILE_NATIF&&((window.matchMedia&&matchMedia('(hover:none)').matches)||Math.min(screen.width,screen.height)<600); // (2026-10-01) l'ÉCRAN, pas la fenêtre — même test que la colonne du <head>
const FORCE_TEL=/[?&](tel|mobile)=1/.test(location.search)||(EDITION==='mobile'&&!TEL_NATIF&&!/[?&](pc|desktop)=1/.test(location.search)); // l'ORDI qui joue la version téléphone
const IS_MOBILE=FORCE_TEL||TEL_NATIF;
/* ===== LES DEUX VERSIONS DU JEU : MAX SUR ORDINATEUR, OPTIMISÉE SUR TÉLÉPHONE (2026-10-25, Sacha : « quand on lance Vercel, ça arrive sur la version
   maximum ; quand on lance le téléphone, c'est la version optimisée — que j'aie pas à te le redire ») =====
   UN SEUL code, DEUX régimes, séparés par UN SEUL drapeau :
     · `ALLEGE` = la version OPTIMISÉE : le VRAI téléphone (TEL_NATIF), ou un essai à la main (`?tel=1` / `?mobile=1` / `?allege=1`). `?allege=0` la coupe (comparer).
       C'est LUI qui garde TOUT ce qui retire de l'image : résolution, ombres, bloom, anticrénelage, densité des décors, satellites, cartes retirées du tirage…
     · l'ORDINATEUR (Vercel, /jouer/) = le MAX : chaque branche « PC » du code, jamais allégée.
   ⚠ `IS_MOBILE` NE DIT PAS « téléphone » : il est vrai AUSSI sur l'ordi, qui joue l'édition 'mobile' dans son cadre de téléphone (FORCE_TEL, voir EDITION). Il ne sert
   donc QU'À L'INTERFACE (tactile, disposition, cadre). Tout allègement de rendu ou de contenu se garde sur `ALLEGE` — `garde-allege.sh` (lancée par vercel-build.sh)
   REFUSE la publication si `IS_MOBILE` apparaît hors de la liste des fichiers d'interface. Les paliers `PAL.b(...)` restent sûrs (l'ordi est au palier 2).
   Le 24/10, des retraits « téléphone » gardés par IS_MOBILE ont dégradé le PC (forêt, dunes, Crypto City, Jade, satellites) : c'est pour que ça ne revienne pas. */
/* `LOOK_TEL` = L'IMAGE TELLE QU'ELLE A ÉTÉ RÉGLÉE (DA, étalonnage dans l'ACES, bloom .44, flou de boost) : elle a été mise au point dans le cadre téléphone,
   donc la MÊME sur ordi et sur téléphone — ce n'est PAS un allègement, on n'y touche pas pour « améliorer » le PC (ça changerait les couleurs et le halo que Sacha a validés). */
const LOOK_TEL=FORCE_TEL||TEL_NATIF;
const ALLEGE=!/[?&]allege=0\b/.test(location.search)&&(TEL_NATIF||/[?&](tel|mobile|allege)=1\b/.test(location.search));
/* (2026-10-09, Léo : « la capacité d'aller dans cette map avec une voiture, la mobilité comme le main, mais seulement ça : pas de jeu, que la
   voiture dans la map ») LA BALADE — `?map=jade` : la caisse sur la route des PICS DE JADE, sa conduite telle quelle ; ni pièces, ni plots,
   ni score, ni HUD ; la mort n'est qu'un replacement (le bac à sable) ; rien n'est écrit dans la sauvegarde. Voir « LES PICS DE JADE ». */
const BALADE=/[?&](map=jade|balade=1)\b/.test(location.search);
/* (2026-10-12, Léo : « là, il n'y a pas de fruits, tout ça : fais-en un niveau complet avec ses aspects — fruits custom, pièces ¥ yuan
   yen — qu'on ajoute au système audio (le simulateur) pour tester, référencé par un nom que tu choisis ») LE NIVEAU « SOLEIL DE JADE » :
   la map des PICS DE JADE en VRAI niveau (pièces, fruits, plaques, plots, pouvoirs, score, HUD, mort) — `dbgNiveauJade()` le lance
   (le simulateur l'appelle), `?niveau=jade` le choisit dès le chargement. JADE_JEU vrai = lvlChoisir rend la map, ses fruits à elle,
   ses pièces frappées du ¥. La BALADE (`?map=jade`, la voiture seule) ne change pas. */
let JADE_JEU=/[?&]niveau=jade\b/.test(location.search)&&!BALADE;
/* (2026-10-12, Léo : « lance-le en tant que map qui se déclenche quand on appuie sur JOUER, avec CETTE musique-là, précisément ; on retouchera
   la map directement sur le main ») LE JOUER = LE SOLEIL DE JADE : le JOUER de l'accueil et celui du garage lancent ce niveau (jadeJouer) —
   sauf pour un tout premier joueur (l'auto-école d'abord) et au simulateur pour ses parties SANS FIN (`?play=sansfin`). (Sa musique, GLISSE V2, est partie le 18/10 : Pouce bleu joue seul en course.) */
const JADE_PLAY=/[?&]play=jade\b/.test(location.search)&&!BALADE; // (2026-10-13, Sacha : « refonte du mode classique ») JOUER lance le MODE CLASSIQUE AU HASARD (classiqueJouer) — le SOLEIL DE JADE en direct : `?play=jade`
/* (2026-10-12, Léo : « l'important avec ce simulateur, c'est qu'on puisse jouer dans la map : enlève l'écran d'accueil ») LE JEU DU SIMULATEUR —
   `?simu=1` (posé par simulateur/course.html) : pas d'écran titre (le voile s'ouvre tout seul, comme la balade), pas de rechargement automatique
   quand une nouvelle version sort (le simulateur garde la main) ; le reste est le jeu tel quel. `dbgQuitte()` finit la course sans explosion. */
const SIMU_JEU=/[?&]simu=1\b/.test(location.search);
/* (2026-10-12, le simulateur) la page des maps pose ce jeu en PETIT sur une image puis en PLEIN ÉCRAN : son cadre change de zoom, donc de
   devicePixelRatio — le plafond de résolution (DPR_CAP), pris une fois au démarrage, restait celui de la petite image (plein écran flou).
   En ?simu=1 seulement, il suit le zoom du cadre (même calcul qu'au démarrage). */
if(SIMU_JEU){let dpr9=devicePixelRatio;setInterval(function(){if(Math.abs(devicePixelRatio-dpr9)<.01)return;dpr9=devicePixelRatio;
  try{DPR_CAP=Math.min(devicePixelRatio,ALLEGE?1:1.5);qlReprise();}catch(e){}},250);}
if(BALADE)document.documentElement.classList.add('balade');
const IS_LOW_END=ALLEGE||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4);
/* ====================== LE PALIER DE L'APPAREIL — PAL (2026-10-14, passe perf mobile, Sacha : « la version mobile n'arrive pas à afficher
   de bons graphismes sans bugger ; comprime un maximum, que ce soit fluide même sur un iPhone 7 ») ======================
   Jusqu'ici RIEN ne distinguait un iPhone 7 d'un iPhone 15 Pro : `IS_MOBILE` = tout téléphone, Safari dit « 2 cœurs » et « Apple GPU » sur
   tous les iPhone. Un iPhone 7 démarrait donc avec les réglages du 15 Pro, puis l'échelle QL descendait cran par cran — des dizaines de
   secondes de saccades avant de trouver son régime, à chaque partie. Et l'échelle QL ne sait baisser que l'ombre, le halo et la
   résolution : pas le nombre de triangles, d'appels de dessin, de particules ni le travail du processeur, qui sont ce qui étouffe une
   vieille puce. PAL répond UNE fois, au démarrage, à « quelle machine ? » — et tout le jeu peut tailler ses budgets dessus :
     PAL.n = 0  ANCIEN  (iPhone 6s / 7 / 8 / X / SE 1 — puces A9 à A11 ; Android d'entrée de gamme) : 30 i/s STABLES valent mieux que 45 hachées
             1  MOYEN   (iPhone XR / XS / 11 / SE 2 — A12, A13 ; Android milieu de gamme)
             2  RÉCENT  (iPhone 12 et après, ordinateurs) : l'image d'avant, au pixel près — RIEN ne change pour lui.
     PAL.bas = (n===0) · PAL.moyen = (n<=1) · PAL.B = les BUDGETS par palier (`PAL.b('cle')` rend la valeur du palier courant).
   COMMENT ON SAIT (du plus sûr au moins sûr) :
     1 · `?palier=0|1|2` (banc, essai) ;
     2 · ce que le jeu a APPRIS sur cet appareil aux parties d'avant (`localStorage.cashcarPalier`, écrit par `palNote` quand la mesure
         réelle en course contredit le palier : voir palApprend) ;
     3 · la version d'iOS — une CERTITUDE matérielle : un iPhone resté en iOS 15 ne peut pas avoir mieux qu'une puce A10 (6s, 7, SE 1),
         en iOS 16 pas mieux qu'une A11 (8, X) ; en iOS 26 au moins une A13 (iPhone 11) ;
     4 · sur Android : la mémoire annoncée (`deviceMemory`) et la puce graphique (affinée par `palPuce` une fois le contexte 3D créé) ;
     5 · un PETIT BANC du processeur (quelques millisecondes d'arithmétique, le meilleur de 4 tours) pour départager le reste.
   RÈGLE D'OR : tout ce qui se taille sur PAL doit laisser le palier 2 IDENTIQUE à avant (les téléphones récents gardent toute l'image).
   `dbgPalier()` décrit ; `dbgPalier(n)` recharge la page à ce palier. */
const PAL=(function(){
  const P={n:2,src:'défaut',ios:0,banc:null,puce:'',mem:navigator.deviceMemory||0,appris:null};
  const ua=navigator.userAgent||'',mI=/(?:iPhone|iPad|iPod).*? OS (\d+)[_.]/.exec(ua);P.ios=mI?+mI[1]:0;
  const banc=function(){ // ~3-4 ms sur une puce M (ordi), ~7 sur A15, ~10 sur A12, ~15 sur A10 (ordres de grandeur : le banc DÉPARTAGE, il ne tranche pas seul)
    try{const N=4096,a=new Float32Array(N),b=new Float32Array(N);let m=1e9;
      for(let r=0;r<4;r++){const t0=performance.now();let s=0,h=7;
        for(let k=0;k<120;k++)for(let i=0;i<N;i++){h=(Math.imul(h,1103515245)+12345)|0;a[i]=(h>>>8)*5.96e-8;b[i]=a[i]*a[(i+17)&4095]+b[(i+4095)&4095]*.5;s+=b[i];}
        const d=performance.now()-t0;if(s===s&&d<m)m=d;}
      return m;}catch(e){return null;}};
  const force=/[?&]palier=([0-2])\b/.exec(location.search);
  let appris=null;try{appris=JSON.parse(localStorage.getItem('cashcarPalier')||'null');}catch(e){}
  if(appris&&!(appris.n>=0&&appris.n<=2&&appris.v===1))appris=null;
  P.appris=appris;
  /* ===== L'ÉCRAN DE L'IPHONE DIT SA GÉNÉRATION (2026-10-24, passe perf iPhone, Sacha : « il faut que la version mobile soit parfaite ») =====
     MESURÉ sur l'iPhone 13 Pro de Sacha, DANS L'APP (copie de banc CC BANC, sans inspecteur) : le banc ci-dessus y rend 16 à 22 ms au 1er
     lancement (le compilateur de JavaScript n'est pas encore passé, et le téléphone chauffait), 3 à 8 ms une fois chaud. Classé ANCIEN et
     RETENU 7 jours : cadence 30 dès le départ, échelle QL au cran 4-5, DPR 1,25 — alors qu'au palier RÉCENT il tient 60 i/s à DPR 1,5 avec
     2 ms de JS par image. Le même iPhone tombait ANCIEN ou RÉCENT selon le lancement. Et l'app (WKWebView) comme Safari 26 écrivent
     « iPhone OS 18_7 » sous iOS 26 : la règle « iOS 26 → au moins une A13 » ne jouait jamais.
     La taille d'écran d'un iPhone (en points, portrait) et sa densité désignent sa génération sans rien mesurer :
       RÉCENT (A14 et après) : 360×780 (12 mini, 13 mini) · 390×844 (12, 13, 14, 16e) · 428×926 (12/13 Pro Max, 14 Plus) · 393×852 (14 Pro, 15, 16)
         · 430×932 (14 Pro Max, 15/16 Plus, Pro Max) · 402×874 (16 Pro, 17) · 440×956 (16/17 Pro Max) · 420×912 (Air) — et toute taille INCONNUE en
         densité 3 et ≥ 390 de large (les iPhone à venir) ;
       MOYEN (A12, A13) : 414×896 (XR, 11 en ×2 ; XS Max, 11 Pro Max en ×3) ;
       ANCIEN (A9 à A11) : 320×568 (SE 1) · 414×736 ×3 (6s, 7, 8 Plus) ;
       DOUTEUX, le banc tranche comme avant : 375×667 ×2 (6s, 7, 8, SE 2, SE 3 : A9 à A15) · 375×812 ×3 (X, XS, 11 Pro) · le Zoom de l'écran.
     Le Safari d'iOS 26 garde sa vraie version dans « Version/26 » : elle relève P.ios (l'app, elle, ne l'écrit pas).
     `?palier=` et le palier appris passent toujours avant ; le palier 2 lui-même ne change pas (RÈGLE D'OR). `?palecran=0` = l'ancien choix. */
  const mV=/Version\/(\d+)/.exec(ua);if(mV&&P.ios&&+mV[1]>=26&&P.ios<+mV[1])P.ios=+mV[1];
  const ecran=(function(){
    if(!/iPhone/.test(ua)||/[?&]palecran=0\b/.test(location.search))return null;
    const w=Math.round(Math.min(screen.width,screen.height)),h=Math.round(Math.max(screen.width,screen.height)),d=Math.round(devicePixelRatio||1),k=w+'x'+h+'@'+d;
    const n={'360x780@3':2,'390x844@3':2,'428x926@3':2,'393x852@3':2,'430x932@3':2,'402x874@3':2,'440x956@3':2,'420x912@3':2,
             '414x896@2':1,'414x896@3':1,'320x568@2':0,'414x736@3':0}[k];
    if(n!=null)return {n:n,k:k};
    if(d>=3&&w>=390&&k!=='414x736@3')return {n:2,k:k+' (inconnu)'};
    return null;})();
  if(force){P.n=+force[1];P.src='?palier';}
  else if(appris&&appris.src==='mesure'){P.n=appris.n;P.src='appris en course';}
  else if(!IS_MOBILE||FORCE_TEL){P.n=2;P.src='ordinateur';} // l'ordi (colonne comprise) : l'échelle QL suffit
  else if(P.ios&&P.ios<=15){P.n=0;P.src='iOS '+P.ios+' (A10 au mieux)';}
  else if(ecran){P.n=ecran.n;P.src='écran '+ecran.k.replace('x','×').replace('@',' ×');}
  else{
    if(appris&&appris.src==='banc'&&Date.now()-appris.t<6048e5){P.banc=appris.banc;P.n=appris.n;P.src='banc (retenu)';}
    else{P.banc=banc();const m=P.banc;P.n=m==null?1:m>=12.5?0:m>=8.5?1:2;P.src='banc '+(m==null?'?':m.toFixed(1)+' ms');
      try{localStorage.setItem('cashcarPalier',JSON.stringify({v:1,n:P.n,src:'banc',banc:m,t:Date.now()}));}catch(e){}}
    if(P.ios===16&&P.n>1){P.n=1;P.src+=' · iOS 16 (A11 au mieux)';}
    if(P.ios>=26&&P.n<1){P.n=1;P.src+=' · iOS 26 (A13 au moins)';}
    if(!P.ios&&P.mem){if(P.mem<=2&&P.n>0){P.n=0;P.src+=' · '+P.mem+' Go';}else if(P.mem<=4&&P.n>1){P.n=1;P.src+=' · '+P.mem+' Go';}}
  }
  P.bas=P.n===0;P.moyen=P.n<=1;
  try{document.documentElement.dataset.palier=String(P.n);}catch(e){} // `html[data-palier="0"]` : le CSS peut s'alléger sur les vieux appareils
  /* LES BUDGETS — une ligne par chose qui se taille, [ANCIEN, MOYEN, RÉCENT]. La 3e colonne = le jeu d'avant : on n'y touche pas.
     Chaque zone du jeu AJOUTE ses lignes ici (une seule table à régler), et lit `PAL.b('cle')`. */
  P.B={};
  P.b=function(k,d){const v=P.B[k];return v?v[P.n]:d;};
  return P;})();
/* LES TOILES 2D RENDUES APRÈS L'ENVOI À LA PUCE (2026-10-14, passe perf mobile). MESURÉ (iPhone 7 émulé) : 184 toiles 2D vivantes = 52 Mo
   avant le premier écran — et iOS plafonne la mémoire de toiles d'une page (au-delà : toiles blanches, puis la page est tuée). Une toile
   qui n'a servi qu'à peindre UNE fois une `CanvasTexture` ne sert plus à rien dès que three l'a envoyée (`texture.onUpdate` est appelé
   juste après l'envoi, mipmaps comprises) : `texLibere(tex)` la vide alors (largeur = hauteur = 0 → la mémoire est rendue tout de suite,
   sans attendre le ramasse-miettes). ⚠ UNIQUEMENT pour une texture JAMAIS redessinée (aucun `needsUpdate` ultérieur, pas de redessin à
   l'arrivée de la police, image jamais relue par un autre code, texture jamais `dispose()` puis resservie). Le contexte 3D perdu ne
   demande rien : il RECHARGE la page (voir webglcontextrestored). Le palier se lit À L'ENVOI (pas à l'appel : des textures naissent
   avant PAL dans le fichier). Palier 2 : inchangé (toiles gardées, outils `dbg*` qui les relisent intacts).
   `toileRend(cv)` : pour une toile de TRAVAIL (copiée dans une autre puis jetée) — invisible, vaut pour tous les paliers. */
PAL.B.memToiles=[1,1,0]; // rendre les toiles des textures peintes une fois : ancien, moyen = oui · récent = comme avant
function toileRend(cv){try{if(cv&&cv.getContext)cv.width=cv.height=0;}catch(e){}}
function texLibere(tex){if(!tex||tex._lib)return tex;tex._lib=1;const av=tex.onUpdate;
  tex.onUpdate=function(t){if(av)av(t);t.onUpdate=av||null;if(PAL.b('memToiles',0)){toileRend(t.image);MEM_TOILES.n++;}};return tex;}
const MEM_TOILES={n:0};window.dbgToiles=function(){return {palier:PAL.n,actif:PAL.b('memToiles',0),rendues:MEM_TOILES.n};}; // (dev) combien de toiles ont été rendues
function palPuce(gl9){ // (après la création du contexte) la puce graphique, là où le navigateur la dit (Android) : une puce d'entrée de gamme rabat le palier
  try{const x=gl9.getExtension('WEBGL_debug_renderer_info'),r=x?String(gl9.getParameter(x.UNMASKED_RENDERER_WEBGL)||''):'';PAL.puce=r;
    if(PAL.src==='?palier'||PAL.src==='appris en course'||!IS_MOBILE||FORCE_TEL)return;
    const vieux=/Adreno \(TM\) [1-5]\d\d|Mali-(4|T\d|G5[127]|G3\d|G71|G72)|PowerVR (SGX|Rogue G[6E])|Apple A(7|8|9|10)\b/i.test(r),moyenne=/Adreno \(TM\) 6[0-4]\d|Mali-G(7[6-8]|6[18])/i.test(r);
    const n=vieux?0:moyenne?Math.min(PAL.n,1):PAL.n;if(n<PAL.n){PAL.n=n;PAL.bas=n===0;PAL.moyen=n<=1;PAL.src+=' · '+r.slice(0,40);try{document.documentElement.dataset.palier=String(n);}catch(e){}}}catch(e){}}
window.dbgPalier=function(n){ if(n!=null){const u=new URL(location.href);u.searchParams.set('palier',String(n|0));location.href=u.toString();return 'rechargement au palier '+(n|0);}
  return {n:PAL.n,nom:['ANCIEN','MOYEN','RÉCENT'][PAL.n],src:PAL.src,ios:PAL.ios,banc:PAL.banc,mem:PAL.mem,puce:PAL.puce,appris:PAL.appris,budgets:Object.keys(PAL.B).reduce(function(o,k){o[k]=PAL.B[k][PAL.n];return o;},{})};}; // (banc)
const REDUCED_MOTION=(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)||false; // ACCESSIBILITÉ : iOS « Réduire les animations » → coupe bloom + grain + effets de vitesse
if(REDUCED_MOTION)document.documentElement.setAttribute('data-reduced-motion','1');
const FOVP_K=REDUCED_MOTION?.3:1; // (2026-09-30) « Réduire les animations » : les COUPS de champ (fovPunch — nitro, boost, drift, +34° à l'entrée en orbite) à 30 %, là où ils s'appliquent
/* (2026-10-14, passe SENSATIONS — Sacha : « sans changer radicalement le gameplay, en se focalisant sur le fun et les sensations, rajoute
   des petits détails : conduite, vol, animation, bumps, collisions, explosions, quand tu vas dans l'eau… que ce soit jouissif sur mobile »)
   UN interrupteur pour tout ce que la passe ajoute : `?sens=0` dans l'adresse rend le jeu d'AVANT (à comparer côte à côte, ou à couper
   d'un coup si un détail gêne). Rien de ce qui est gardé par SENS ne touche la physique, les vitesses ni l'économie : du ressenti seul. */
var SENS=!/[?&]sens=0/.test(location.search); var SENSG=SENS; /* le même drapeau sous un nom que rien ne masque : le bloc tactile a un `const SENS` local (l interface), qui le cachait → « Cannot access SENS before initialization », le jeu ne démarrait plus */
try{matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',function(e){if(e.matches)document.documentElement.setAttribute('data-reduced-motion','1');else document.documentElement.removeAttribute('data-reduced-motion');});}catch(e){} // (2026-09-29) le réglage d'iOS change en cours de partie : les règles qui ne lisent que l'attribut suivent
const renderer=new THREE.WebGLRenderer({antialias:!ALLEGE&&!IS_LOW_END,powerPreference:'high-performance'});
renderer.setSize(innerWidth,innerHeight);
document.body.appendChild(renderer.domElement);
try{palPuce(renderer.getContext());}catch(e){} // (2026-10-14, passe perf mobile) le palier affiné par la puce graphique — voir PAL
/* ⚠ LE CONTEXTE 3D PERDU (2026-09-25, audit App Store) : iOS reprend la carte graphique d'une app en arrière-plan
   (appel, appareil photo, jeu lourd). Sans ces deux écouteurs, le jeu revenait sur un ÉCRAN NOIR définitif — le
   refus classique pour « l'app ne répond plus ». On empêche l'abandon (`preventDefault` = « je veux le récupérer »),
   et au retour du contexte on recharge proprement : la sauvegarde est sur le disque, rien n'est perdu. */
// (2026-09-30) les trois chemins finissent par un RECHARGEMENT : la partie en cours est posée (enCoursPose) avant d'être perdue — SAVE.load la versera
renderer.domElement.addEventListener('webglcontextlost',function(e){e.preventDefault();try{sessionStorage.ccCtxPerdu=(+sessionStorage.ccCtxPerdu||0)+1;}catch(err){}try{enCoursPose();SAVE.flush();}catch(err){}},false); // (compteur de session : `sessionStorage.ccCtxPerdu` dit combien de fois c'est arrivé)
renderer.domElement.addEventListener('webglcontextrestored',function(){try{enCoursPose();SAVE.flush();}catch(e){}location.reload();},false);
/* ===== LE CONTEXTE PERDU AU PREMIER PLAN (24/10, débogage sortie iOS : « zéro écran bloqué ») =====
   Les deux chemins du dessus attendent un événement : le contexte RENDU (webglcontextrestored) ou le RETOUR d'arrière-plan (visibilitychange).
   Perdu alors que l'appli reste à l'écran (pression mémoire de la carte graphique, processus GPU de WebKit relancé) et jamais rendu : rien ne
   venait — toile noire pour toujours, la course continuait à l'aveugle sous le HUD. Banc (perte sans retour, en course) : 3 s de noir, aucune
   reprise. Filet : 5 s après la perte, toujours perdu et toujours visible → le même rechargement (la partie a été posée à la perte). */
/* (même passe, intégration) PAS DE RECHARGEMENT EN BOUCLE : si la carte graphique reprend le contexte juste après chaque relance (mémoire
   saturée), le filet relançait toutes les ~20 s sans fin. À la 4e perte de la session (sessionStorage.ccCtxPerdu, compté plus haut), on pose
   l écran « CASH CAR a calé » (window.__crash) : le joueur touche RELANCER quand il veut, sa progression est sauvegardée. */
renderer.domElement.addEventListener('webglcontextlost',function(){setTimeout(function(){try{if(!document.hidden&&renderer.getContext().isContextLost()){let n9=0;try{n9=+sessionStorage.ccCtxPerdu||0;}catch(e){}if(n9>3&&typeof window.__crash==='function')window.__crash((ccCtxEn()?'3D context lost ':'contexte 3D perdu ')+'×'+n9,'');else location.reload();}}catch(e){}},5000);},false);
function ccCtxEn(){let l9='';try{l9=localStorage.ccLang||'';}catch(e){}return l9?l9!=='fr':!/^fr/i.test(navigator.language||'fr');}
// (2026-09-29, audit de sortie) iOS peut garder le contexte PERDU au retour d'arrière-plan sans jamais le rendre : écran noir pour toujours.
// Au retour, s'il est encore perdu 1,5 s plus tard, on relance (la sauvegarde a été écrite à la perte).
addEventListener('visibilitychange',function(){if(document.hidden)return;setTimeout(function(){try{if(!document.hidden&&renderer.getContext().isContextLost()){try{enCoursPose();SAVE.flush();}catch(e){}location.reload();}}catch(e){}},1500);});
let DPR_CAP=Math.min(devicePixelRatio,ALLEGE?1:1.5),curDPR=Math.min(DPR_CAP,devicePixelRatio),dprT=0; // téléphone .66→1 (2026-09-24) : la résolution adaptative sait désormais REMONTER, elle protège la fluidité
// PLANCHER DE L'ADAPTATIF : sur téléphone on a le droit de descendre BAS. `setPixelRatio` ne touche
// que le canvas 3D — le HUD est du DOM, il reste net au pixel quoi qu'il arrive. On enlève donc les
// pixels là où ils coûtent (raymarch, bloom, ombres) sans jamais flouter une jauge.
/* LE MAX SUR ORDINATEUR (2026-10-25, Sacha : « Vercel = la version maximum ») MESURÉ (Chrome, fenêtre 1440×900 ×2, cadre téléphone) : le jeu voit un écran de
   844×390 à densité 3,16 (la page-cadre zoome l'iframe), mais la course était plafonnée à DPR_CAP 1,5 : dessinée en 1 266 px de large puis étirée sur ~2 670 px
   physiques — le flou du PC. Désormais l'ordi (pas ALLEGE) dessine aux pixels RÉELS de l'écran, dans un budget de pixels (PC_PX, 4,5 M : ~4K/2) ; le téléphone
   garde son plafond de palier (`dprNetCap`). RAPIDE (choix du joueur) reste à 1. `?pcpx=N` (millions de pixels) règle le budget au banc, `?pcpx=0` = l'ancien plafond 1,5. */
const PC_PX=(function(){const m=/[?&]pcpx=([\d.]+)/.exec(location.search);return m?+m[1]*1e6:3.2e6;})(); /* (2026-10-25, Sacha : « Chrome prend 1 700 Mo de GPU ») budget 4,5 M → 3,2 M : toujours les pixels réels d'un écran 1080p, mais plus la 4K/2 ; `?pcpx=4.5` = avant */
const VHD_PX_PC=(function(){const m=/[?&]vhdpc=([d.]+)/.exec(location.search);return m?+m[1]*1e6:4.2e6;})(); /* budget de pixels de la vitrine du menu sur ordinateur (8,3 M avant) ; `?vhdpc=8.3` = avant */
function dprPlafond(fast){ if(fast)return Math.min(devicePixelRatio,1);
  if(ALLEGE||!PC_PX)return Math.min(devicePixelRatio,PAL.b('dprNetCap',1.5));
  return Math.min(devicePixelRatio,Math.max(1.25,Math.sqrt(PC_PX/Math.max(1,innerWidth*innerHeight))),4);}
const DPR_MIN=(IS_MOBILE&&!FORCE_TEL)?.5:.6; // .42 était une bouillie de pixels — et on y restait coincé (voir la remontée dans loop)
// PORTRAIT : le `fov` de three est VERTICAL — sur un écran haut, le champ HORIZONTAL s'effondre.
// FOV_K rouvre l'angle, POR (0 paysage → 1 portrait) recadre la caméra. Les deux se règlent ENSEMBLE
// avec camBack/camH : reculer rapetisse, monter redresse, viser bas remonte la caisse dans le cadre.
let FOV_K=1,FOV_TK=1,POR=0;
function fovFit(){ const a=innerWidth/Math.max(1,innerHeight);
  FOV_K=a<1?Math.min(1.30,Math.max(1,.80/a)):1;
  FOV_TK=Math.tan(FOV_K*.2*Math.PI)/Math.tan(.2*Math.PI); // 36° = .2π : calé pour que le repos (72°) retombe pile sur 72×FOV_K — le cadrage portrait validé ne bouge pas
  POR=Math.min(1,Math.max(0,(1-a)/.42)); } // 16:9 → 0 · 9:16 → 1
// (2026-09-25) PORTRAIT : on élargit la TANGENTE, pas l'angle. Multiplier l'angle faisait exploser le champ à haute vitesse sur un
// vrai téléphone (135° en croisière, 162° en nitro, >180° = image retournée). Ici le zoom de vitesse garde le RAPPORT réglé sur PC,
// plafonné à 150°. Sur PC et en paysage (FOV_TK=1), la somme est identique au bit près.
function fovPor(d){return FOV_TK===1?d:Math.min(150,Math.atan(Math.tan(Math.min(170,d)*Math.PI/360)*FOV_TK)*360/Math.PI);}
fovFit(); // RÉSOLUTION ADAPTATIVE — cap desktop 1.5 : sur Retina, 1.75→1.5 = −26 % de pixels, invisible sous bloom+grain (écran 1× : min() ne change rien)
renderer.setPixelRatio(curDPR);
let composer=null,bloomPass=null,acesPass=null,POST_ON=false,SHADOW_ON=true; // POST-PROCESSING (assigné juste après)
let BLOOM_RES=1; // (2026-09-27, passe perf iPhone) part de la résolution du bloom — un cran de l'échelle de qualité (QL) la baisse à ¾
/* (perf, lot 4) LA TAILLE DE L'ÉCRAN, LUE UNE FOIS PAR REDIMENSIONNEMENT. MESURÉ (profil, téléphone émulé) : sur Chrome mobile, lire
   `innerWidth`/`innerHeight` FORCE une mise en page complète (la page à « viewport » se remet en page pour répondre) — et comme le HUD
   venait d'écrire ses styles, chaque image en payait une : 7,7 % du processeur pendant la carte MOTEUR. Ce qui suit la caisse à l'écran
   lit désormais `VP`, tenu à jour ici (écouteur posé AVANT tous les autres : ils le trouvent déjà à jour). */
const VP={w:innerWidth,h:innerHeight};
addEventListener('resize',()=>{VP.w=innerWidth;VP.h=innerHeight;});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();fovFit();renderer.setSize(innerWidth,innerHeight);if(composer)composer.setSize(innerWidth,innerHeight);slCv.width=innerWidth;slCv.height=innerHeight;if(juiceCv){juiceCv.width=innerWidth;juiceCv.height=innerHeight;}});
const hemi=new THREE.HemisphereLight(0xba86b6,0x18162e,0.40);scene.add(hemi); // ambiance VICE CITY NUIT (assombrie) : ciel rose-mauve baissé, sol indigo — la pénombre gagne, les lumières de la caisse vivent (nommée : les BIOMES la pilotent)
const sun=new THREE.DirectionalLight(0xff6a3c,1.45);sun.position.copy(SUN_DIR).multiplyScalar(3800);scene.add(sun); // BRAISE ROUGE-CORAIL : la lumière rasante peint le bitume en rouge sombre — golden hour devenue red hour
const fill=new THREE.DirectionalLight(0x4f74e8,.24);fill.position.set(-200,-400,-100);scene.add(fill); // fill BLEU NÉON par en dessous : les ventres de caisse prennent la ville
const kick=new THREE.DirectionalLight(0xff3d9e,.20);kick.position.set(-520,260,410);scene.add(kick); // baiser MAGENTA venu de la ville : le flanc opposé au soleil prend le néon
/* Paris retiré — tout est misé sur le CIEL : couchant, nuages irisés, pigeons ramiers */

/* ============ TRIPTYQUE VISUEL : ACES + BLOOM + OMBRES DE CONTACT ============ */
// --- OMBRES LONGUES (golden hour) : une seule casteuse — le soleil — dans une fenêtre ortho serrée qui SUIT la caisse.
// Soleil à ~5,9° → l'ombre fait ~9,7× la hauteur de l'objet : le rasant étire tout au sol.
renderer.shadowMap.enabled=true;
/* (2026-10-14, passe perf mobile) LE FILTRE DE L'OMBRE, PAR PALIER. L'ombre douce (PCFSoft) lit la carte 36 fois par pixel éclairé (9 prises
   interpolées à la main × 4) ; l'ombre PCF simple, 17 fois, sans les interpolations — même carte, même biais, bord un peu moins fondu.
   Le type entre dans le #define des matières : il se choisit ICI, avant toute compilation, et plus personne ne le change ensuite.
   RÉCENT : ombre douce, comme avant. (`?palier=2` pour comparer.) */
PAL.B.postOmbreDouce=[0,0,1];
renderer.shadowMap.type=PAL.b('postOmbreDouce',1)?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;
sun.castShadow=true;
sun.shadow.mapSize.set(ALLEGE||IS_LOW_END?1024:1280,ALLEGE||IS_LOW_END?1024:1280); // 1280 : l'ortho ±34 m est si serrée que 1536 était du luxe — passe d'ombre ~30 % moins chère
const SUNC=sun.shadow.camera;
SUNC.left=-34;SUNC.right=34;SUNC.top=30;SUNC.bottom=-64;SUNC.near=40;SUNC.far=340;SUNC.updateProjectionMatrix(); // fond profond : l'ombre atteint la dalle même très haut au-dessus de la route
sun.shadow.bias=-0.0003;sun.shadow.normalBias=0.08; // normalBias en MÈTRES (~2 texels) : assez pour tuer l'acné, pas de quoi décoller l'ombre
scene.add(sun.target);
const SUN_UP=new THREE.Vector3().crossVectors(SUN_PERP,SUN_DIR).normalize(),shadV=new THREE.Vector3(); // base du plan lumière (snap texel)
// --- Étalonnage GTA-VICE (réglables d'un coup d'œil) : saturé, contrasté, teal-orange ---
let POST_EXPO=0.71;        // exposition BASSE : la nuit gagne — le sol s'éteint pour que nitro/boost/phares RAYONNENT dessus (let : les BIOMES la pilotent, le contre-jour la relit chaque frame)
const POST_SAT=1.40;       // SATURATION forte : néons Vice City (valeur d'init — les biomes écrivent acesPass.uniforms.uSat en direct)
const POST_CONTRAST=1.23;  // CONTRASTE : noirs profonds, hautes lumières franches
let POST_PIVOT=.5;          // (2026-10-14, passe graphismes · chaîne de couleur) le PIVOT du contraste. À .5 (l'image d'avant, au bit près) tout ce qui sort de l'ACES sous ~.14 est écrêté à 0 dès que le contraste dépasse 1,3 : des noirs BOUCHÉS (seuil = 25 à 35/255 en valeur de scène). Plus bas (.35) les ombres gardent leur dégradé — mais toute l'image monte de (con−1)·(.5−pivot) : à régler avec l'exposition. INTERRUPTEUR ÉTEINT (.5) : `dbgGfx({pivot:.35})` pour essayer à chaud ; uniforme `uKC` calculé en JS, coût nul.
const POST_VIVID=0.74;     // 0 = ACES sobre (désature les hautes lumières) · 1 = tonemap qui PRÉSERVE la couleur (les néons restent des néons)
const POST_WB=new THREE.Vector3(1.02,0.985,1.03);       // voile MAGENTA subtil : le rose Vice City infuse toute l'image
const POST_SHADOW=new THREE.Vector3(0.004,-0.008,0.062); // OMBRES → bleu-violet nuit (place au néon)
const POST_HI=new THREE.Vector3(0.052,0.008,-0.014);      // LUMIÈRES → or rosé (le couchant qui s'accroche aux tôles)
// Grade cinéma en PASSE FINALE : tonemap préservant la chroma + contraste + saturation + split-tone. Scène en amont inchangée.
const GRADE_ACES=LOOK_TEL; // (2026-09-25) l'étalonnage final (ex-filtre CSS du canvas) passe DANS l'ACES : plus de passe de compositeur plein écran, à la résolution de l'écran, sur téléphone
const FXAA_ON=!/[?&]msaa=1/.test(location.search); /* (2026-10-25, Sacha : « Léo et moi n'avons pas les mêmes bugs sur le même lien » · « 1 700 Mo de GPU ») FXAA PARTOUT : l'anticrénelage dépendait de la machine (MSAA si écran < ×1,5 et plus de 4 cœurs, FXAA sinon) — deux images différentes, et la cible MSAA demi-flottante (×4) pesait des centaines de Mo. `?msaa=1` = l'ancien choix. */ // // (2026-09-26, audit rendu) là où il n'y a PAS de MSAA (téléphone : aucun anticrénelage, chaque marche = 3 px physiques)
const ACES_N=LOOK_TEL?6:8;   // flou radial du boost : 18 lectures de texture au téléphone au lieu de 24 (le grain animé fond les copies)
/* LA PASSE FINALE ALLÉGÉE (2026-09-27, passe perf iPhone, tour 2 — « le post-traitement »). MESURÉ au micro-banc (la passe seule, rejouée
   sur une image figée, 585×1266 comme l'iPhone en NETTE ; rendu logiciel SwiftShader ET vraie carte, chronomètre de la puce) : en rendu
   logiciel, ce qui coûte ce sont les LECTURES de texture (FXAA ~45 %, halo ~20 %, calcul ~15 %) ; sur une vraie puce, le CALCUL de
   l'étalonnage pèse ~35 % et les lectures FILTRÉES le reste. Quatre allègements, même image (écart ≤ 1/255, 0 sur la plupart des pixels) :
   · FXAA : le centre et ses 4 voisins tombent PILE sur des texels (même taille que l'image) — lus par `texelFetch` (un texel, ni
     filtrage ni dérivées ; bord de l'image : coordonnées bornées = ce que faisait le « clamp to edge »). Identique au bit près ;
   · toutes les autres lectures (flou radial, bords du FXAA, halo) en `textureLod(…,0)` : ces cibles n'ont pas de mips et filtrent en
     linéaire à toutes les échelles — même résultat au bit près, sans le calcul de dérivées qui précède chaque `texture()` (−20 % sur
     vraie carte à lui seul) ;
   · le HALO : les 5 mips étaient relus à CHAQUE pixel de l'écran — ils sont désormais sommés UNE fois dans une petite cible à la
     taille du 1er mip (voir « LE HALO COMPOSÉ » sous le compositeur) : 1 lecture au lieu de 5 (PC : 2 au lieu de 10) ;
   · l'étalonnage : exposition × balance et contraste pré-calculés par image (`uWE`, `uKC`), tunnel et lueur de nitro sautés quand
     ils valent 0 (branche sur un uniforme : toute l'image prend le même chemin), la vignette ne tire sa racine qu'au-delà de l'ellipse
     où elle commence, et le grade du téléphone replié en 2 opérations.
   WebGL1 (très vieux appareils) : `texelFetch`/`textureLod` n'y existent pas — mêmes calculs en `texture2D`, comme avant. */
const W2_POST=!!(renderer.capabilities&&renderer.capabilities.isWebGL2);
const TXL=(s,u)=>W2_POST?'textureLod('+s+','+u+',0.0)':'texture2D('+s+','+u+')'; // une lecture filtrée, sans dérivées quand on peut
/* LE FLOU DE VITESSE SANS MOTIF (2026-10-15, Léo : « sur iPhone, des parties de l'écran se répétaient, un peu les pixels », photo à
   l'ORBITE en vol, NITROOO). MESURÉ au banc (même image rendue deux fois, zoom ×6) : là où le flou file loin de la caisse, l'image portait
   une TRAME RÉGULIÈRE — colonnes d'un pixel sur deux, diagonales — absente sans le flou. C'était le chemin du téléphone : 6 prises
   décalées par le bruit entrelacé (fait pour être lissé d'une image à l'autre, ce que le jeu ne fait pas). Loin de la caisse les prises
   sont espacées de dizaines de pixels : chaque pixel en tirait 6 échantillons au hasard du motif → la trame, qui scintille en 2-3 px
   d'écran (la 3D en NETTE est à ×1,5 sur un écran ×3). L'ordi n'a pas ce chemin (8 prises fixes).
   Désormais, téléphone et WebGL2 : chaque prise lit l'image PRÉ-FLOUTÉE à la taille de son intervalle + ½ niveau (mipmaps de la cible
   de la scène, générés seulement quand le flou joue — `flouMips`) : les prises se fondent, plus besoin de décalage (essayé au banc, même
   image : un bruit sans motif laissait du grain au bord de la lune, sans pré-flou les sourcils se dédoublaient en stries) ; une prise
   qui sortirait de l'image se replie en MIROIR au lieu de répéter le pixel du bord (~5 % de chaque bord au boost). Image STABLE d'une
   image à l'autre. Près de la caisse (intervalle sous ~0,7 texel) : lecture au niveau 0, image identique. Même nombre de lectures. `?flou=ancien` = le chemin d'avant (comparer sur le
   téléphone). */
const FLOU_MIPS=ACES_N<8&&W2_POST&&!/[?&]flou=ancien\b/.test(location.search);
/* LA CAISSE RESTE NETTE (2026-09-30, niveau 1 v2) : où est la caisse à l'écran (uCtr, en coordonnées d'image 0-1), quelle taille y fait-elle
   (uSafe : le rayon de son disque net), et l'échelle qui ramène la distance à la caisse à celle d'avant (uRn : le coin le plus loin de la
   caisse compte comme le coin de l'image comptait depuis le milieu). Hors cadre (derrière la caméra) : le milieu, comme avant. */
const POST_CV=new THREE.Vector3(),POST_CV2=new THREE.Vector3();
function postCaisse(U){
  let x=.5,y=.5,rs=0;
  if(started&&!gameOver&&carGroup.visible){POST_CV.copy(carGroup.position).project(camera);
    if(POST_CV.z<1&&Math.abs(POST_CV.x)<1.4&&Math.abs(POST_CV.y)<1.4){x=POST_CV.x*.5+.5;y=POST_CV.y*.5+.5;
      const R9=.55*((CARS[level]&&CARS[level].l)||4.2);POST_CV2.setFromMatrixColumn(camera.matrixWorld,0).multiplyScalar(R9).add(carGroup.position).project(camera);
      rs=Math.min(.32,Math.hypot((POST_CV2.x-POST_CV.x)*.5,(POST_CV2.y-POST_CV.y)*.5));}}
  x=Math.min(.85,Math.max(.15,x));y=Math.min(.85,Math.max(.15,y));
  U.uCtr.value.set(x,y);U.uSafe.value=rs;
  U.uRn.value=.7071/Math.max(Math.hypot(Math.max(x,1-x),Math.max(y,1-y)),.5);
}
const ACESShader={
  uniforms:{tDiffuse:{value:null},uExposure:{value:POST_EXPO},uSat:{value:POST_SAT},uContrast:{value:POST_CONTRAST},
            uVivid:{value:POST_VIVID},uWB:{value:POST_WB},uSh:{value:POST_SHADOW},uHi:{value:POST_HI},uSpeed:{value:0},uJit:{value:0},uRes:{value:new THREE.Vector2(1/1024,1/1024)},
            uVigK:{value:.52},uVigC:{value:new THREE.Vector3(.149,.047,.212)}, // (2026-09-26, vague 2) la VIGNETTE du niveau (ex-calque DOM #vig), posée par bioApply
            uWE:{value:new THREE.Vector3(1,1,1)},uKC:{value:new THREE.Vector2(1,0)},
            uCtr:{value:new THREE.Vector2(.5,.5)},uSafe:{value:0},uRn:{value:1}}, // (2026-09-30, niveau 1 v2) le flou de vitesse part de la CAISSE et la garde nette (voir « LA CAISSE RESTE NETTE ») // (tour 2, post) uWB×uExposure et le contraste (pente, décalage) — posés par acesPass.render à chaque image
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:['uniform sampler2D tDiffuse;uniform float uExposure,uSat,uContrast,uVivid,uSpeed,uJit,uVigK,uSharp;uniform vec3 uWB,uSh,uHi,uVigC,uWE;uniform vec2 uRes,uKC,uCtr;uniform float uSafe,uRn;varying vec2 vUv;',
    'uniform sampler2D uBc;uniform float uBa;', // (2026-09-27, passe perf iPhone) le BLOOM FUSIONNÉ — le halo déjà composé (voir « LE HALO COMPOSÉ » sous le compositeur) ; uBa = 0 : pas de halo
    'uniform vec4 uNit;uniform float uNitF;uniform float uTrame;', // (vague 3, NITRO) la couleur de la poussée sur les bords (rgb + part) et le coup d'allumage — posés par nfxTick
    // (2026-09-26, audit rendu) LES HAUTES LUMIÈRES ROULENT au lieu de s'écraser : en NUAGES, 98 % du haut de l'image avait un canal au
    // plafond (un aplat bleu électrique, des nuages brûlés). Le coude garde la TEINTE (on divise les trois canaux ensemble) : tout ce
    // qui tenait déjà sous .86 ne bouge pas d'un iota — seuls les pixels qui saturaient retrouvent leur dégradé.
    'vec3 roule(vec3 c){float m=max(c.r,max(c.g,c.b));if(m>0.86){float k=0.86+0.14*(1.0-exp(-(m-0.86)/0.14));c*=k/m;}return c;}',
    'vec3 aces(vec3 x){const float a=2.51,b=.03,c=2.43,d=.59,e=.14;return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.,1.);}',
    'const vec3 LUM=vec3(.2126,.7152,.0722);',
    'void main(){',
    // (tour 2, post) `r` (une racine) ne sert qu'au flou, au tunnel et à la lueur : calculé seulement quand l'un d'eux joue (`fx`, même
    // valeur pour toute l'image). Sans poussée, tunnel ×1 et lueur +0 exactement : les sauter ne change pas un bit.
    '  vec2 dir=vUv-0.5; vec3 x; vec2 bu=vUv,bd=vec2(0.0);',
    '  bool fx=uSpeed>0.0||uNit.a+uNitF>0.0; float r=0.0; if(fx)r=length(dir);',
    '  if(uSpeed>0.004){',                                    // + flou radial + aberration chromatique (fuite vers les bords)
    /* LA CAISSE RESTE NETTE (2026-09-30, niveau 1 v2 — mesuré sur les captures : en portrait la caisse est en BAS de l'image, le flou
       partait du MILIEU, elle était le premier objet étalé, à la moindre plaque BOOST). Le flou part désormais de la caisse (uCtr, sa
       position à l'écran) ; sa force suit la distance à la caisse ramenée à la même échelle qu'avant (uRn : le coin le plus loin vaut
       le coin d'avant) ; et un disque de la taille de la caisse (uSafe) reste NET — le monde file, la caisse jamais. */
    '    vec2 dc=vUv-uCtr; float rb=length(dc)*uRn, ms=smoothstep(uSafe,uSafe*2.2+.02,length(dc));',
    '    vec2 buv=uCtr+dc*(1.0+uSpeed*0.60*rb*rb*ms);',            // WARP AU BOOST : le monde S INCURVE FORT autour de la caisse (centre stable → jouable)
    '    float amt=uSpeed*(0.04+rb*rb*1.7)*ms; vec3 acc=vec3(0.0);', // r² : centre NET, filé TRÈS FRANC vers les bords
    FLOU_MIPS?'    float lodF=max(log2(max(length(dc*amt*(0.62/'+ACES_N+'.0)/uRes),1e-4))+0.5,0.0);':'', // (FLOU SANS MOTIF) l intervalle entre deux prises, en texels → le niveau de mip qui le couvre, + ½ (les copies se fondent) ; 0 tant qu il tient sous ~0,7 texel : la caisse reste NETTE
    FLOU_MIPS?'    float jt=0.5;': // (FLOU SANS MOTIF) plus de décalage : les prises pré-floutées se fondent, l image ne grésille plus d une image à l autre
    '    float jt=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715)))+uJit);', // grain ANIMÉ : moins de prises sans dessiner de copies (statique = saleté collée)
    '    for(int i=0;i<'+ACES_N+';i++){ float t='+(ACES_N<8?'(float(i)+jt)/'+ACES_N+'.0':'float(i)/7.0')+'; vec2 off=dc*amt*t*0.62;',
    FLOU_MIPS?'      acc+=textureLod(tDiffuse,1.0-abs(1.0-abs(buv-off)),lodF).rgb; }': // (FLOU SANS MOTIF) la prise pré-floutée, repliée en miroir au bord
    '      acc+='+TXL('tDiffuse','buv-off')+'.rgb; }',        // (2026-09-26) UNE lecture par prise (il y en avait trois : 18 lectures par pixel au téléphone)
    '    x=acc/'+ACES_N+'.0; bu=buv-dc*amt*0.31;'+(LOOK_TEL?'':' bd=dc*amt*0.155;'), // le halo se lit au milieu de la traînée (PC : aux deux quarts, il FILE comme l'image ; téléphone : une lecture — mesuré invisible, 5 lectures de moins au boost)
    // L'ABERRATION CHROMATIQUE (2026-09-26, vague 2) — MESURÉ : au boost, chaque bord de nuage et chaque fenêtre de la ville s'ourlait
    // d'un ARC-EN-CIEL rose/jaune/cyan de 10-12 px (×.05 de l'amplitude du flou, dès le centre). Réduite au TIERS et seulement au-delà de
    // 45 % du rayon (le bord de l'image fuit, le centre reste propre) — et COUPÉE au téléphone : deux lectures de texture en moins par pixel.
    LOOK_TEL?'':'    { vec2 mid=buv-dc*amt*0.31, ca=dc*amt*0.015*smoothstep(.45,.9,rb);'+
    '      x.r=mix(x.r,'+TXL('tDiffuse','mid-ca')+'.r,0.5); x.b=mix(x.b,'+TXL('tDiffuse','mid+ca')+'.b,0.5); }',
    '  } else {',
    FXAA_ON?[ // ANTICRÉNELAGE LÉGER (FXAA simplifié) — seulement image nette (le flou de boost lisse déjà) ; hors bord, 5 lectures et on sort
    // (tour 2, post) le centre et ses 4 voisins sont des TEXELS entiers : `texelFetch`, coordonnées bornées au cadre (= clamp to edge)
    W2_POST?'    ivec2 tm=textureSize(tDiffuse,0)-1,ip=min(ivec2(vUv*vec2(tm+1)),tm);'+
      ' vec3 cM=texelFetch(tDiffuse,ip,0).rgb,cNW=texelFetch(tDiffuse,clamp(ip+ivec2(-1,-1),ivec2(0),tm),0).rgb,cNE=texelFetch(tDiffuse,clamp(ip+ivec2(1,-1),ivec2(0),tm),0).rgb,'+
      'cSW=texelFetch(tDiffuse,clamp(ip+ivec2(-1,1),ivec2(0),tm),0).rgb,cSE=texelFetch(tDiffuse,clamp(ip+ivec2(1,1),ivec2(0),tm),0).rgb;':
    '    vec3 cM=texture2D(tDiffuse,vUv).rgb,cNW=texture2D(tDiffuse,vUv+vec2(-1.,-1.)*uRes).rgb,cNE=texture2D(tDiffuse,vUv+vec2(1.,-1.)*uRes).rgb,cSW=texture2D(tDiffuse,vUv+vec2(-1.,1.)*uRes).rgb,cSE=texture2D(tDiffuse,vUv+vec2(1.,1.)*uRes).rgb;',
    '    float lM=dot(cM,LUM),lNW=dot(cNW,LUM),lNE=dot(cNE,LUM),lSW=dot(cSW,LUM),lSE=dot(cSE,LUM);',
    '    float lMin=min(lM,min(min(lNW,lNE),min(lSW,lSE))),lMax=max(lM,max(max(lNW,lNE),max(lSW,lSE)));',
    // (2026-09-27, tour 2) LE PIQUÉ QUI COMPENSE LA RÉSOLUTION : quand l'échelle QL descend sous le plafond, `uSharp` > 0 rend aux
    // détails fins (grain du bitume, liserés, tôles) le contraste que le rééchantillonnage leur a pris — accentuation adaptative façon
    // CAS, dosée par le contraste LOCAL (elle ne s'emballe jamais sur les bords : ceux-là partent dans le FXAA juste en dessous) et
    // bornée par le voisinage (aucun halo possible). Ses 4 lectures sont CELLES du FXAA : coût nul. À pleine résolution uSharp = 0 :
    // l'image est identique au bit près.
    '    if(lMax-lMin<max(0.0312,lMax*0.125)){ x=cM;',
    '      if(uSharp>0.001){ vec3 av=(cNW+cNE+cSW+cSE)*0.25, mn=min(min(cNW,cNE),min(cSW,cSE)), mx=max(max(cNW,cNE),max(cSW,cSE));',
    '        x=clamp(cM+(cM-av)*uSharp*2.0,min(mn,cM),max(mx,cM)); }',
    '    } else {',
    '      vec2 d=vec2(-((lNW+lNE)-(lSW+lSE)),((lNW+lSW)-(lNE+lSE)));',
    '      float dr=max((lNW+lNE+lSW+lSE)*0.03125,0.0078125); float rc=1.0/(min(abs(d.x),abs(d.y))+dr);',
    '      d=clamp(d*rc,vec2(-8.0),vec2(8.0))*uRes;',
    '      vec3 a=0.5*('+TXL('tDiffuse','vUv+d*(1.0/3.0-0.5)')+'.rgb+'+TXL('tDiffuse','vUv+d*(2.0/3.0-0.5)')+'.rgb);',
    '      vec3 b=a*0.5+0.25*('+TXL('tDiffuse','vUv-d*0.5')+'.rgb+'+TXL('tDiffuse','vUv+d*0.5')+'.rgb);',
    '      float lB=dot(b,LUM); x=(lB<lMin||lB>lMax)?a:b; }'].join('\n'):'    x='+TXL('tDiffuse','vUv')+'.rgb;',
    '  }',
    // le HALO, déjà composé (poids, écrêtage à 1 et ×alpha compris) : UNE lecture — deux au PC quand il file au boost
    LOOK_TEL?'  if(uBa>0.0)x+='+TXL('uBc','bu')+'.rgb;':'  if(uBa>0.0)x+=(bd.x!=0.0||bd.y!=0.0)?0.5*('+TXL('uBc','bu-bd')+'.rgb+'+TXL('uBc','bu+bd')+'.rgb):'+TXL('uBc','bu')+'.rgb;',
    '  x*=uWE;',                                          // = x·uWB·uExposure (produit posé par image)
    'float L=dot(x,LUM);',
    'vec3 perCh=aces(x);',                              // ACES par canal : sûr mais désature les hautes lumières
    'vec3 lumB=x*(clamp((L*(2.51*L+.03))/(L*(2.43*L+.59)+.14),0.,1.)/max(L,1e-4));', // ACES sur la LUMINANCE seule (en scalaire) → la chroma est conservée (néon)
    'vec3 c=max(mix(perCh,lumB,uVivid),0.);',           // dosage entre les deux (plus d'écrêtage ici : voir `roule`)
    'c=max(c*uKC.x+uKC.y,0.);',                         // CONTRASTE : noirs profonds — (c−.5)·k+.5 = c·k + (.5−.5k)
    'float l2=dot(c,LUM);c=mix(vec3(l2),c,uSat);',      // SATURATION
    'c+=uSh*(1.-smoothstep(0.,0.5,l2));',               // split-tone : ombres TEAL
    'c+=uHi*smoothstep(0.5,1.0,l2);',                   // split-tone : lumières OR
    'if(fx){',
    'c*=1.0-uSpeed*smoothstep(0.30,0.85,r)*0.55;',      // TUNNEL DE VITESSE : les bords plongent dans le noir, l'œil file au centre
    // (vague 3, NITRO) LES BORDS S'ALLUMENT DE LA COULEUR DE LA POUSSÉE — une LUEUR ajoutée (pas un voile : un mélange vers l'orange
    // délavait le rose en brun, mesuré), plus forte sur le sombre que sur le clair (elle ne brûle jamais le ciel), + le COUP d'allumage.
    // Le centre (la caisse, la route devant) reste intact : tout se joue au-delà du quart de l'image. Zéro lecture de texture.
    '{float ne=smoothstep('+('0.46,0.80')+',r);c+=uNit.rgb*(ne*(uNit.a*(1.0-0.6*min(1.0,dot(c,LUM)))+uNitF));}}',
    // = saturate(1.12) contrast(1.05) brightness(.97) du CSS, même ordre — mix(l,c,1.12) = 1.12c − .12l ; ((c−.5)·1.05+.5)·.97 = 1.0185c − .02425
    GRADE_ACES?'c=max(c,0.);c=max(c*1.12-dot(c,LUM)*.12,0.);c=max(c*1.0185-.02425,0.);':'',
    // LA VIGNETTE (2026-09-26, vague 2) — c'était un calque DOM plein écran (#vig) : violet, fixe à 52 %, même en plein jour cobalt. Elle
    // vit ici, par niveau (uVigK/uVigC, posés par bioApply). Même dessin au pixel que l'ancien dégradé CSS (ellipse centrée à 44 % du
    // haut, taille « coin le plus loin », transparente jusqu'à mi-chemin puis linéaire) : la VILLE garde exactement son cadre.
    // (tour 2, post) nulle DANS l'ellipse (|vq|·1,2354 ≤ 1, soit |vq|² ≤ 0,655218) : la racine et le mélange ne se font qu'au-delà.
    'c=clamp(roule(c),0.,1.);',
    '{vec2 vq=vec2((vUv.x-.5)/.5,(vUv.y-.56)/.44);float q=dot(vq,vq);',
    'if(q>0.6552)c=mix(c,uVigC,uVigK*clamp(sqrt(q)*1.2354-1.,0.,1.));',
    // LE TRAMAGE DE SORTIE (2026-09-28, « plus beau sur iPhone sans coût en plus ») : tout est calculé en demi-flottant, mais l'écran
    // reçoit 8 bits — les grands dégradés (le ciel des NUAGES, la brume, la vignette, la nuit de la VILLE) s'y rangeaient en MARCHES
    // de 1/255 bien visibles sur un OLED. Un demi-niveau de bruit (le même bruit entrelacé que le flou, animé par uJit) casse les
    // marches : l'œil moyenne, le dégradé redevient continu. Le noir pur reste noir (arrondi à 0), l'ORBITE garde son noir complet.
    '{float dn9=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715)))+uJit);c+=(dn9-.5)*uTrame;}',
    'gl_FragColor=vec4(c,1.0);}}'].join('\n')
};
ACESShader.uniforms.uBc={value:null};ACESShader.uniforms.uBa={value:0}; // (posé sur acesPass APRÈS sa création : ShaderPass CLONE les uniforms, une texture clonée serait une autre texture)
ACESShader.uniforms.uSharp={value:0}; // (tour 2) le piqué qui compense la résolution — posé par applyDPR
ACESShader.uniforms.uTrame={value:1/255}; // (passe graphismes mobile) le tramage de sortie — 0 = l'ancienne sortie, voir dbgGfx
ACESShader.uniforms.uNit={value:new THREE.Vector4(1,.478,.141,0)};ACESShader.uniforms.uNitF={value:0}; // (vague 3, NITRO) la poussée sur les bords — voir nfxTick
/* (2026-10-14, passe graphismes — flou-vitesse) UN FLOU DE VITESSE PROPRE : il DIT la vitesse sans détruire l'image. MESURÉ sur les
   planches de la nuit : au boost (uSpeed .6) le coin de l'image filait sur ~200 px (amt = uSpeed·(.04+1,7·rb²)), le warp agrandissait
   le bord de 30 %, le tunnel noircissait les coins de moitié — les tours de la ville, les pics, les cumulus n'étaient plus que des
   traînées ; et en simple croisière (le voile CAM_HEROS, uSpeed .075-.2) le bord filait déjà de 30 px, sans FXAA. V2 :
   · la force suit une courbe `sp` (uFv.w) : croisière → presque rien (sous .02 l'image reste NETTE et repasse par le FXAA), boost
     → ~ moitié, nitro pleine → plein ;
   · flou ET warp ne commencent qu'au-delà d'un rayon (uFv.x, distance à la caisse ramenée au coin) et montent en carré : la caisse,
     la route devant et le point de fuite restent nets, seuls les bords filent ;
   · force max (uFv.y) et warp (uFv.z) à ~la moitié d'avant ; aberration chromatique (ordi seul) ÷ 2,5 et repoussée au bord ; tunnel
     .55 → .30 et plus loin du centre.
   Même nombre de lectures, même programme pour tous les paliers (palier 0 : FLOU_OK coupe déjà tout), aucune compilation en course. Banc : dbgFlou({v,s,fv}). */
ACESShader.uniforms.uFv={value:new THREE.Vector4(.26,2.0,.8,.25)}; // rayon où le flou commence · force · warp · courbe de vitesse (part linéaire)
const FLOU_R=[['uniform float uSafe,uRn;','uniform float uSafe,uRn;uniform vec4 uFv;'],
  ['  if(uSpeed>0.004){','  float sp=uSpeed*(uFv.w+(1.0-uFv.w)*uSpeed); if(sp>0.02){'],
  ['    vec2 buv=uCtr+dc*(1.0+uSpeed*0.60*rb*rb*ms);','    float e=max(rb-uFv.x,0.0); e*=e; vec2 buv=uCtr+dc*(1.0+sp*uFv.z*e*ms);'],
  ['    float amt=uSpeed*(0.04+rb*rb*1.7)*ms; vec3 acc=vec3(0.0);','    float amt=sp*uFv.y*e*ms; vec3 acc=vec3(0.0);'],
  ['c*=1.0-uSpeed*smoothstep(0.30,0.85,r)*0.55;','c*=1.0-sp*smoothstep(0.42,0.95,r)*0.30;']],
  FLOU_RO=[['ca=dc*amt*0.015*smoothstep(.45,.9,rb);','ca=dc*amt*0.006*smoothstep(.55,.95,rb);']]; // (ordi seul : absente du programme du téléphone)
function flouFS(f,v){const a=v?0:1,b=v?1:0;for(const r of FLOU_R)if(f.indexOf(r[a])<0)return f; // une ligne retouchée ailleurs : on ne touche à rien
  for(const r of FLOU_R.concat(FLOU_RO))f=f.replace(r[a],r[b]);return f;}
ACESShader.fragmentShader=flouFS(ACESShader.fragmentShader,1);
/* (2026-10-13, Léo : « l'effet écran quand tu ressors de l'eau, travaille-le encore plus ») L'OBJECTIF MOUILLÉ RÉFRACTE : une petite toile de
   NORMALES (LENS.cvN, au tiers de l'écran : R/G = le décalage de chaque pixel, en pixels de la toile ÷ 16) dit où chaque goutte et la nappe
   dévient l'image — la goutte agit comme une lentille (l'image derrière elle est retournée et grossie), la nappe qui s'égoutte ondule. Une
   seule lecture de texture, et seulement quand l'objectif est mouillé (uLensK) : sinon l'image est identique au bit près. */
ACESShader.uniforms.uLens={value:null};ACESShader.uniforms.uLensK={value:0};ACESShader.uniforms.uLensA={value:new THREE.Vector2(.05,.1)};
{const fs=ACESShader.fragmentShader,k=fs.indexOf('void main(){')+12;
 ACESShader.fragmentShader=fs.slice(0,k).replace('varying vec2 vUv;','varying vec2 vUv;uniform sampler2D uLens;uniform float uLensK;uniform vec2 uLensA;')+
   '\n  vec2 uvL=vUv;if(uLensK>0.001){vec2 ln9=texture2D(uLens,vUv).rg*2.-1.;if(dot(ln9,ln9)>.0004)uvL=clamp(vUv-ln9*uLensA*uLensK,vec2(.001),vec2(.999));}'+
   fs.slice(k).replace(/vUv/g,'uvL');}
/* (FLOU SANS MOTIF) les mipmaps de la cible que l'ACES relit, le temps d'une passe : three la garde en filtre LINÉAIRE sans mips (aucun
   coût ailleurs) ; quand le flou joue, on les génère et on passe en LINÉAIRE ENTRE MIPS pour cette seule lecture, puis on rend le filtre
   d'origine (la passe est déjà émise : elle garde ses mips). Une cible neuve (retaillée) repart sans mips : la 1re image du flou les crée. */
function flouMips(rd,rt,on){ try{
  const p=rt&&rt.texture&&rd.properties.get(rt.texture),gl=rd.getContext();if(!p||!p.__webglTexture)return false;
  rd.state.bindTexture(gl.TEXTURE_2D,p.__webglTexture);
  if(on)gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,on?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);return true;
}catch(e){return false;} }
const CAN_POST=typeof THREE.EffectComposer==='function'&&typeof THREE.RenderPass==='function'&&typeof THREE.UnrealBloomPass==='function'&&typeof THREE.ShaderPass==='function';
if(CAN_POST){ try{
  const w=innerWidth,h=innerHeight;
  let rt; // MSAA seulement sur desktop musclé (sinon double AA + coût MSAA inutile)
  // RT en HALF-FLOAT : un RT 8 bits + grade contrasté (SAT 1.40/VIVID) POSTERISE les grands dégradés
  // doux — sur les nuages volumétriques ça dessinait des ANNEAUX « agate » (lignes de niveau) que
  // AUCUN réglage du raymarch ne pouvait tuer. En 16 bits flottants, le banding est impossible.
  /* (2026-09-26, vérif iPhone) FILET : un tampon demi-flottant que le pilote ne sait pas REMPLIR (pas d'EXT_color_buffer_float) ne lève
     aucune erreur — il donne un écran NOIR. On l'essaie donc une fois, en 4×4 : s'il n'est pas complet, repli 8 bits (un peu de banding
     dans les grands dégradés, mais une image). Sans effet là où il marche (PC, Android, iPhone récents). */
  const f16ok=(function(){if(!(renderer.capabilities&&renderer.capabilities.isWebGL2))return false;
    try{const t=new THREE.WebGLRenderTarget(4,4,{format:THREE.RGBAFormat,type:THREE.HalfFloatType});renderer.setRenderTarget(t);
      const gl=renderer.getContext(),ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;renderer.setRenderTarget(null);t.dispose();return ok;}
    catch(e){try{renderer.setRenderTarget(null);}catch(e2){}return false;}})();
  const rtType=f16ok?THREE.HalfFloatType:THREE.UnsignedByteType;
  if(!FXAA_ON&&!ALLEGE&&!IS_LOW_END&&devicePixelRatio<1.5&&typeof THREE.WebGLMultisampleRenderTarget==='function')rt=new THREE.WebGLMultisampleRenderTarget(w,h,{format:THREE.RGBAFormat,type:rtType}); // MSAA réservé aux écrans 1× (où le crénelage se voit) — sur Retina le resolve coûte cher pour rien
  else rt=new THREE.WebGLRenderTarget(w,h,{format:THREE.RGBAFormat,type:rtType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
  composer=new THREE.EffectComposer(renderer,rt);
  composer.setPixelRatio(curDPR);composer.setSize(w,h);
  composer.addPass(new THREE.RenderPass(scene,camera));
  // BLOOM demi-résolution partout : gros gain GPU, halation quasi identique à l'œil.
  const HALO_REF=2,HALO_LOG=[3,10,28,72,176].map(Math.log2); // (2026-10-14, chaîne de couleur) la résolution où le halo a été réglé (banc : DPR 2) et le rayon de chaque étage, en log2 de texels de la base
  const bSc=LOOK_TEL?.42:IS_LOW_END?.52:.55; // bloom demi-résolution un cran plus bas sur desktop : le flou EST le produit, personne ne voit la différence
  const bRes=new THREE.Vector2(Math.max(320,Math.round(w*bSc)),Math.max(240,Math.round(h*bSc)));
  bloomPass=new THREE.UnrealBloomPass(bRes,LOOK_TEL?0.44:0.54,LOOK_TEL?0.44:.5,0.92);
  // (2026-09-26, audit rendu) `addPass` rappelle setSize(largeur×DPR) : la résolution `bSc` était IGNORÉE (mesuré : ½ au lieu de .42).
  // UnrealBloomPass prend la moitié de ce qu'on lui donne — on lui donne donc 2×bSc.
  /* LE HALO COMPOSÉ (2026-09-27, passe perf iPhone, tour 2 — « le post-traitement »). Le halo fusionné dans l'ACES relisait ses 5 mips
     à CHAQUE pixel de l'écran (740 000 × 5 lectures sur iPhone en NETTE). Ils sont désormais sommés UNE fois par image dans une petite
     cible à la taille du 1er mip (~250×530 sur iPhone : 18 % des pixels de l'écran) — mêmes poids, même écrêtage à 1, même ×alpha —
     et l'ACES n'en lit plus qu'UNE texture. C'est le « composite » d'origine d'UnrealBloomPass, mais en demi-flottant (pas l'arrondi
     8 bits d'avant) et sans la copie plein écran qui le suivait. MESURÉ (images figées, 3 niveaux, sol/vol/nitro) : ≤ 1/255, 0,005/255
     en moyenne — le 1er mip est lu pile sur ses texels, les 4 autres, déjà très flous, passent par une interpolation de plus. */
  bloomPass._cRT=new THREE.WebGLRenderTarget(2,2,{format:THREE.RGBAFormat,type:rtType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false,stencilBuffer:false});
  bloomPass._cRT.texture.generateMipmaps=false;
  bloomPass._cMat=new THREE.ShaderMaterial({uniforms:{t1:{value:null},t2:{value:null},t3:{value:null},t4:{value:null},t5:{value:null},w:{value:new THREE.Vector4()},w5:{value:0},a:{value:0}},
    depthTest:false,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'varying vec2 vUv;uniform sampler2D t1,t2,t3,t4,t5;uniform vec4 w;uniform float w5,a;void main(){gl_FragColor=vec4(clamp(w.x*'+TXL('t1','vUv')+'.rgb+w.y*'+TXL('t2','vUv')+'.rgb+w.z*'+
      TXL('t3','vUv')+'.rgb+w.w*'+TXL('t4','vUv')+'.rgb+w5*'+TXL('t5','vUv')+'.rgb,0.,1.)*a,1.0);}'});
  bloomPass._a=0; // l'alpha du halo de l'image (strength·Σpoids écrêté à 1) — relu par l'ACES
  bloomPass._wn=[0,0,0,0,0];bloomPass.norme=!/[?&]halo=large/.test(location.search); // (2026-10-14, passe graphismes · chaîne de couleur) le halo à largeur d'écran constante — voir « LE HALO GARDE SA LARGEUR » dans son rendu
  {const s0=bloomPass.setSize.bind(bloomPass);bloomPass.setSize=function(W,H){this._W=W;this._H=H;s0(Math.max(2,Math.round(W*bSc*2*BLOOM_RES)),Math.max(2,Math.round(H*bSc*2*BLOOM_RES)));
    const v0=this.renderTargetsVertical[0];if(this._cRT&&(this._cRT.width!==v0.width||this._cRT.height!==v0.height))this._cRT.setSize(v0.width,v0.height);};} // (_W/_H retenus : l'échelle QL retaille le bloom seul) — le halo composé suit le 1er mip
  /* (2026-10-14, passe perf mobile) LES ÉTAGES DU HALO, PAR PALIER. Le halo, c'est 5 étages de flou (½, ¼ … 1/32 de sa base), 2 passes
     chacun, + la passe qui les somme : 11 changements de cible par image. Sur un iPhone 7 l'image entière fait 667×375 : les deux derniers
     étages n'y pèsent que ~200 et ~50 pixels — leurs 4 passes ne coûtent pas des pixels mais 4 allers-retours de cible sur une puce à
     tuiles. ANCIEN : 3 étages (7 passes), MOYEN : 4 (9 passes), RÉCENT : 5 (11 passes, comme avant). Le poids des étages retirés se
     reporte sur le dernier calculé (même énergie, même alpha, même écrêtage) : le halo garde sa force, il s'étale juste un peu moins loin.
     Console : `bloomPass._nM=5` rend les 5 étages. Ne vaut que pour le chemin fusionné (`?bloom=ancien` garde tout). */
  PAL.B.postBloomMips=[3,4,5];bloomPass._nM=PAL.b('postBloomMips',5);
  if(REDUCED_MOTION)bloomPass.enabled=false; // reduced-motion : bloom coupé
  composer.addPass(bloomPass);
  acesPass=new THREE.ShaderPass(ACESShader);acesPass.renderToScreen=true;composer.addPass(acesPass);
  /* FUSION DU BLOOM (2026-09-27, passe perf iPhone). UnrealBloomPass finissait par DEUX passes : un « composite » qui somme ses 5 mips
     dans une cible 8 bits, puis une COPIE additive de cette cible sur l'image entière — un aller-retour plein écran en demi-flottant
     rien que pour ajouter le halo, sur un GPU à tuiles (Apple) le plus cher des deux. L'ACES relisait ensuite cette même image. Le halo
     est désormais sommé DANS l'ACES (5 lectures bilinéaires de petites textures) : deux passes de moins, dont une plein écran.
     MÊME CALCUL que ce qui se voyait (écart mesuré : 0,3/255 en moyenne au sol, au niveau du bruit en nitro) : poids `strength·mix(f,1.2−f,radius)` (= lerpBloomFactor, facteurs 1/.8/.6/.4/.2,
     teintes blanches), somme ÉCRÊTÉE à 1 (la cible 8 bits du composite l'écrêtait), puis ×alpha — la copie additive mélangeait en
     SRC_ALPHA, et l'alpha du composite valait strength·Σpoids écrêté à 1 : sous strength ≈ .29 le halo s'atténuait deux fois, ici aussi.
     Seule nuance : le halo s'ajoute APRÈS le FXAA / le flou radial au lieu d'avant (il est déjà flou : invisible — captures comparées).
     `bloomPass.fuse=false` rend l'ancien chemin (repli, banc). */
  {const R0=THREE.UnrealBloomPass.prototype.render;
   if(!R0.__fus){THREE.UnrealBloomPass.prototype.render=function(rd,wb,rb,dT,mask){
      if(!this.fuse||this.renderToScreen)return R0.apply(this,arguments);
      rd.getClearColor(this._oldClearColor);this.oldClearAlpha=rd.getClearAlpha();const oa=rd.autoClear;rd.autoClear=false;rd.setClearColor(this.clearColor,0);
      if(mask)rd.state.buffers.stencil.setTest(false);
      const pl=this.plie!==false&&this.nMips===5&&bloomPlieMat(this); // (voir PLIAGE ci-dessous ; `bloomPass.plie=false` = les 11 passes d'origine)
      if(!pl){this.highPassUniforms.tDiffuse.value=rb.texture;this.highPassUniforms.luminosityThreshold.value=this.threshold;
        this.fsQuad.material=this.materialHighPassFilter;rd.setRenderTarget(this.renderTargetBright);rd.clear();this.fsQuad.render(rd);}
      let inp=pl?rb:this.renderTargetBright;
      const nM=Math.min(this.nMips,this._nM||this.nMips); // (2026-10-14, passe perf mobile) les étages de flou de ce palier — voir postBloomMips
      for(let i=0;i<nM;i++){const m=this.separableBlurMaterials[i],hz=this.renderTargetsHorizontal[i],vt=this.renderTargetsVertical[i];
        if(pl&&i>=3&&this.plie2d!==false){const q=this._p2[i];q.uniforms.colorTexture.value=inp.texture;q.uniforms.texSize.value=m.uniforms.texSize.value; // mips 3-4 : le flou 2D en UNE passe
          this.fsQuad.material=q;rd.setRenderTarget(vt);rd.clear();this.fsQuad.render(rd);inp=vt;continue;}
        const mh=(pl&&i===0)?this._p0:m;if(mh!==m){mh.uniforms.texSize.value=m.uniforms.texSize.value;mh.uniforms.thr.value=this.threshold;mh.uniforms.sw.value=this.highPassUniforms.smoothWidth.value;}
        this.fsQuad.material=mh;mh.uniforms.colorTexture.value=inp.texture;mh.uniforms.direction.value=THREE.UnrealBloomPass.BlurDirectionX;rd.setRenderTarget(hz);rd.clear();this.fsQuad.render(rd);
        const mv=(pl&&this._pv)?this._pv[i]:m; // (tour 2, post) la passe VERTICALE lit pile ses texels : texelFetch (voir bloomPlieMat)
        this.fsQuad.material=mv;mv.uniforms.colorTexture.value=hz.texture;m.uniforms.direction.value=THREE.UnrealBloomPass.BlurDirectionY;rd.setRenderTarget(vt);rd.clear();this.fsQuad.render(rd);
        inp=vt;}
      if(this._cMat&&this.nMips===5){ // LE HALO COMPOSÉ (voir sa création) : poids `strength·mix(f,1.2−f,radius)` = lerpBloomFactor, facteurs 1/.8/.6/.4/.2
        const cu=this._cMat.uniforms,s=this.strength,r=this.radius,w0=s*(1-.8*r),w1=s*(.8-.4*r),w2=s*.6,w3=s*(.4+.4*r),w4=s*(.2+.8*r);
        for(let i=0;i<5;i++)cu['t'+(i+1)].value=this.renderTargetsVertical[Math.min(i,nM-1)].texture; // (2026-10-14) un étage non calculé lit le dernier calculé : son poids s'y reporte
        /* (2026-10-14, passe graphismes · chaîne de couleur) LE HALO GARDE SA LARGEUR À L'ÉCRAN, QUELLE QUE SOIT LA RÉSOLUTION. Les flous du halo
           se comptent en TEXELS de sa cible, et sa cible suit la résolution (curDPR × BLOOM_RES) : à DPR 1 (un iPhone en RAPIDE) le halo
           s'étalait donc DEUX FOIS plus large à l'écran qu'à DPR 2 (le banc où les ambiances ont été réglées), et il s'élargissait encore à
           chaque cran de résolution perdu — un voile laiteux autour de chaque clair, que personne n'avait réglé. Les POIDS des étages sont
           redistribués pour retrouver le profil de la référence (DPR 2, halo plein) : chaque étage de référence verse son poids sur les
           étages réels de même rayon à l'écran (rayons 3·10·28·72·176 texels de la base ; ce qui est plus fin que le 1er étage y reste).
           Même somme (même force, même alpha), que des uniformes, aucune passe ni lecture en plus. `bloomPass.norme=false` (ou
           `?halo=large`, `dbgGfx({haloNorme:0})`) rend le halo d'avant. */
        if(this.norme&&this._W){const L9=HALO_LOG,o9=this._wn,d9=Math.log2(HALO_REF/Math.max(.05,curDPR*BLOOM_RES));
          if(Math.abs(d9)>.03){const e9=[w0,w1,w2,w3,w4];o9[0]=o9[1]=o9[2]=o9[3]=o9[4]=0;
            for(let j=0;j<5;j++){const t9=L9[j]-d9;let x9=0;if(t9>=L9[4])x9=4;else if(t9>L9[0]){let i9=0;while(i9<3&&t9>L9[i9+1])i9++;x9=i9+(t9-L9[i9])/(L9[i9+1]-L9[i9]);}
              const i0=Math.floor(x9),f9=x9-i0;o9[i0]+=e9[j]*(1-f9);if(f9>0)o9[Math.min(4,i0+1)]+=e9[j]*f9;}
            cu.w.value.set(o9[0],o9[1],o9[2],o9[3]);cu.w5.value=o9[4];cu.a.value=this._a=Math.min(1,Math.max(0,w0+w1+w2+w3+w4));}
          else{cu.w.value.set(w0,w1,w2,w3);cu.w5.value=w4;cu.a.value=this._a=Math.min(1,Math.max(0,w0+w1+w2+w3+w4));}}
        else{cu.w.value.set(w0,w1,w2,w3);cu.w5.value=w4;cu.a.value=this._a=Math.min(1,Math.max(0,w0+w1+w2+w3+w4));}
        this.fsQuad.material=this._cMat;rd.setRenderTarget(this._cRT);rd.clear();this.fsQuad.render(rd);}
      else this._a=0;
      if(mask)rd.state.buffers.stencil.setTest(true);
      rd.setClearColor(this._oldClearColor,this.oldClearAlpha);rd.autoClear=oa;};
    THREE.UnrealBloomPass.prototype.render.__fus=true;}
   /* PLIAGE (2026-09-27, passe perf iPhone) — trois passes de moins, MÊME calcul :
      · le SEUIL (la passe « bright ») est plié dans le 1er flou horizontal : ce flou lisait la cible « bright » PILE aux centres de ses
        texels (même taille, décalages entiers), et chaque texel valait seuil(scène lue au même point) écrêté à [0,1] par la cible 8 bits.
        Il applique donc le seuil lui-même à chacune de ses 5 lectures de la scène (écrêtage compris) — une cible de moins à remplir ;
      · les deux plus petits mips (1/16 et 1/32 de la base : ~2 000 et ~500 pixels sur iPhone) font leur gaussienne en 2D en une passe
        au lieu de H puis V. Une gaussienne est séparable : Σᵢⱼ wᵢwⱼ·I = la passe V de la passe H, au même point, lue aux mêmes endroits —
        seul l'arrondi 8 bits intermédiaire disparaît. 17² et 21² lectures sur si peu de pixels : moins cher qu'un aller-retour de cible.
      13 passes plein cadre à l'origine (seuil + 10 flous + composite + copie) → 8. Compilé au 1er rendu du bloom (au menu).
      ⚠ (2026-09-27, tour 2 — « le post-traitement ») LES MIPS 3-4 REDEVIENNENT SÉPARABLES (`plie2d=false`). MESURÉ (image figée, bloom
      seul, A/B dans la même page) : le flou 2D était PLUS LENT que les deux passes qu'il remplaçait — 17² et 21² prises par pixel,
      chacune pondérée par une gaussienne recalculée (≈ 800 000 prises par image), contre 2×17 et 2×21 prises en deux passes. Chrono
      de la puce (carte PC, 585×1266) : 0,32 → 0,25 ms au sol, 0,31 → 0,23 en vol ; rendu logiciel : −5 à −10 %.
      Le seuil, lui, reste plié dans le 1er flou (sa passe séparée était plus lente sur la puce, et s'écartait jusqu'à 7/255 en nitro).
      Écart : ≤ 1-2/255 (0,03 en moyenne — l'arrondi 8 bits entre H et V d'origine revient). `?bloom=plie2d` rend le flou 2D (banc). */
   function bloomPlieMat(p){ if(p._p0)return true; try{
     const vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
       gp='float gp(float x,float s){return 0.39894*exp(-0.5*x*x/(s*s))/s;}';
     p._p0=new THREE.ShaderMaterial({defines:{KR:3},uniforms:{colorTexture:{value:null},texSize:{value:new THREE.Vector2(1,1)},direction:{value:new THREE.Vector2(1,0)},thr:{value:.9},sw:{value:.01}},vertexShader:vs,
       fragmentShader:'varying vec2 vUv;uniform sampler2D colorTexture;uniform vec2 texSize,direction;uniform float thr,sw;'+gp+
         'vec3 hp(vec2 u){vec4 t='+(W2_POST?'textureLod(colorTexture,u,0.0)':'texture2D(colorTexture,u)')+';float v=dot(t.xyz,vec3(0.299,0.587,0.114));return clamp(t.rgb*smoothstep(thr,thr+sw,v),0.0,1.0);}'+
         'void main(){vec2 inv=1.0/texSize;float fs=float(KR),ws=gp(0.0,fs);vec3 s=hp(vUv)*ws;for(int i=1;i<KR;i++){float x=float(i),w=gp(x,fs);vec2 o=direction*inv*x;s+=(hp(vUv+o)+hp(vUv-o))*w;ws+=2.0*w;}gl_FragColor=vec4(s/ws,1.0);}'});
     p._p2=[];for(const i of [3,4]){const K=[3,5,7,9,11][i];
       p._p2[i]=new THREE.ShaderMaterial({defines:{KR:K},uniforms:{colorTexture:{value:null},texSize:{value:new THREE.Vector2(1,1)}},vertexShader:vs,
         fragmentShader:'varying vec2 vUv;uniform sampler2D colorTexture;uniform vec2 texSize;'+gp+
           'void main(){vec2 inv=1.0/texSize;float fs=float(KR),ws=0.0;vec3 s=vec3(0.0);for(int j=1-KR;j<KR;j++){float wj=gp(float(j),fs);for(int i=1-KR;i<KR;i++){float w=wj*gp(float(i),fs);s+=texture2D(colorTexture,vUv+vec2(float(i),float(j))*inv).rgb*w;ws+=w;}}gl_FragColor=vec4(s/ws,1.0);}'});}
     /* (2026-09-27, tour 2 — « le post-traitement ») LES FLOUS SANS FILTRE NI DÉRIVÉES. La passe VERTICALE de chaque mip lit une cible
        de SA taille, à des décalages entiers : chacune de ses prises tombe pile sur un texel → `texelFetch` (bord : coordonnée bornée
        = clamp to edge), même gaussienne calculée dans le même ordre : identique au bit près. Les passes HORIZONTALES réduisent (elles
        lisent le mip d'au-dessus, ou l'image) : elles gardent le filtre linéaire, mais en `textureLod(…,0)` — cibles sans mips, même
        résultat, sans le calcul de dérivées. WebGL1 : rien ne change. */
     if(W2_POST){
       p._pv=[3,5,7,9,11].map(K=>new THREE.ShaderMaterial({defines:{KERNEL_RADIUS:K,SIGMA:K},uniforms:{colorTexture:{value:null}},vertexShader:vs,
         fragmentShader:'varying vec2 vUv;uniform sampler2D colorTexture;float gaussianPdf(in float x,in float sigma){return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;}'+
           'void main(){ivec2 tm=textureSize(colorTexture,0)-1,ip=min(ivec2(vUv*vec2(tm+1)),tm);float fSigma=float(SIGMA);float weightSum=gaussianPdf(0.0,fSigma);'+
           'vec3 diffuseSum=texelFetch(colorTexture,ip,0).rgb*weightSum;for(int i=1;i<KERNEL_RADIUS;i++){float x=float(i);float w=gaussianPdf(x,fSigma);'+
           'vec3 sample1=texelFetch(colorTexture,ivec2(ip.x,min(ip.y+i,tm.y)),0).rgb;vec3 sample2=texelFetch(colorTexture,ivec2(ip.x,max(ip.y-i,0)),0).rgb;'+
           'diffuseSum+=(sample1+sample2)*w;weightSum+=2.0*w;}gl_FragColor=vec4(diffuseSum/weightSum,1.0);}'}));
       for(const m of p.separableBlurMaterials)m.fragmentShader=m.fragmentShader.replace(/texture2D\( colorTexture, (vUv[^)]*)\)/g,'textureLod( colorTexture, $1, 0.0 )');}
     return true;}catch(e){p.plie=false;return false;} }
   const U9=acesPass.uniforms,bp9=bloomPass;
   U9.uBc.value=bp9._cRT.texture; // setSize garde le même objet texture : posé une fois
   bp9.fuse=bp9.plie=!/[?&]bloom=ancien/.test(location.search); // `?bloom=ancien&perf=1` : les 13 passes d'origine, pour comparer SUR le téléphone
   bp9.plie2d=/[?&]bloom=plie2d/.test(location.search); // (tour 2, post) mips 3-4 séparables par défaut (voir PLIAGE) — `?bloom=plie2d` : le flou 2D du tour 1, pour comparer sur le téléphone
   acesPass.render=function(rd,wb,rb){ // (appelle le prototype À CHAQUE FOIS, pas une copie : les bancs qui l'enveloppent continuent de mesurer l'ACES)
     U9.uBa.value=(bp9.enabled&&bp9.fuse)?bp9._a:0; // bloom éteint (réduire les animations, palier ultime) : le halo composé n'est plus à jour — on ne le lit plus
     U9.uWE.value.copy(U9.uWB.value).multiplyScalar(U9.uExposure.value); // (tour 2, post) exposition × balance, une fois par image au lieu d'une fois par pixel
     U9.uKC.value.set(U9.uContrast.value,POST_PIVOT-POST_PIVOT*U9.uContrast.value);      // …et le contraste en pente + décalage
     const mip9=FLOU_MIPS&&U9.uSpeed.value>.004&&flouMips(rd,rb,true); // (FLOU SANS MOTIF) l'image pré-floutée, seulement quand le flou joue
     try{return THREE.ShaderPass.prototype.render.apply(this,arguments);}finally{if(mip9)flouMips(rd,rb,false);}};}
  POST_ON=true;
  {const v9=document.getElementById('vig');if(v9)v9.style.display='none';} // (2026-09-26, vague 2) la vignette est dans l'ACES : un calque plein écran de moins (si le post échoue, #vig reste le repli)
  if(GRADE_ACES)document.body.classList.add('post'); // le shader étalonne → le CSS se retire (si le post échoue, la classe n'est jamais posée : le filtre reste le repli)
}catch(e){composer=null;POST_ON=false;} }

// OMBRE DE CONTACT : un blob dégradé posé au sol sous la caisse — ancre la voiture au monde (coût ~1 draw, mobile-friendly).
const contactTex=(function(){
  const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');
  const g=c.createRadialGradient(64,64,3,64,64,64);
  // (2026-09-26, vague 2) BLANC en couleur, l'alpha porte l'ombre : c'est la matière qui la TEINTE (encre). Peint en noir, la teinte de la
  // matière était multipliée par zéro — l'ombre sortait noir neutre, un trou gris sur le bitume violet.
  g.addColorStop(0,'rgba(255,255,255,.6)');g.addColorStop(.55,'rgba(255,255,255,.32)');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.beginPath();c.arc(64,64,64,0,7);c.fill();return new THREE.CanvasTexture(cv);
})();
/* L'ENCRE (bible vague 2) : toute ombre du jeu est #1c0430, jamais un gris — celle qui colle la caisse au bitume la première.
   ⚠ PAS EN MÉLANGE NORMAL : l'encre (28,4,48) est plus CLAIRE que le bitume d'ORBITE (~0,0,18) — posée par-dessus, elle y aurait
   dessiné une tache violette sous la caisse (exactement ce que Sacha a banni). Elle MULTIPLIE donc le sol : dst × (1 − a·(1 − encre)).
   Une ombre qui ne peut qu'assombrir, teintée : le vert s'éteint le plus, le bleu le moins → un noir violet. La matière porte (1 − encre)
   et `premultipliedAlpha` fait ×a dans le shader ; l'opacité (fondu du télégraphe en vol) garde tout son sens. */
const contactShadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),
  new THREE.MeshBasicMaterial({map:contactTex,color:new THREE.Color(1-28/255,1-4/255,1-48/255),transparent:true,depthWrite:false,fog:false,opacity:1,
    premultipliedAlpha:true,blending:THREE.CustomBlending,blendSrc:THREE.ZeroFactor,blendDst:THREE.OneMinusSrcColorFactor}));
contactShadow.renderOrder=1;contactShadow.visible=false;scene.add(contactShadow);
const Fsh={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
const shTmpP=new THREE.Vector3(),shMat4=new THREE.Matrix4();
/* L'EMPREINTE (2026-09-26) — l'ombre de contact n'est plus un DISQUE : c'est l'occlusion d'une VOITURE. Un rectangle aux coins
   ronds, mou, à la taille de CETTE caisse (voie, empattement, largeur des pneus) et quatre appuis plus noirs sous les roues —
   c'est ce qui colle une caisse au bitume. L'ancien rond de 3,8 × 5,4 m, identique pour une kei-car et un mastodonte, se lisait
   comme une tache sous la voiture et ne tournait pas avec elle en glisse. Recalculée UNE fois par caisse (`userData.gen`, posé par
   buildCar) : 64 × 128 px, moins d'une milliseconde, au menu. Noir PUR en alpha : jamais une lueur. */
const EMPR={cv:null,tex:null,cvA:null,texA:null,gen:-1,PW:3.8,PL:5.4,f:new THREE.Vector3(),n:new THREE.Vector3(),r:new THREE.Vector3()};
function emprPeint(){
  if(!EMPR.cv){EMPR.cv=document.createElement('canvas');EMPR.cv.width=64;EMPR.cv.height=128;EMPR.tex=new THREE.CanvasTexture(EMPR.cv);
    EMPR.cvA=document.createElement('canvas');EMPR.cvA.width=64;EMPR.cvA.height=128;EMPR.texA=new THREE.CanvasTexture(EMPR.cvA);} // (2026-10-23) la même empreinte SANS les quatre appuis et plus floue : celle d'une caisse qui a décollé (voir garage-ombre.js)
  const sp=CARS[carGroup.userData.lvl]||CARS[0];
  let wx=sp.w*.42,wzF=sp.l*.32,wzR=sp.l*.32,tw=.3;
  let wxR=wx;if(wheels.length>=4){wx=Math.abs(wheels[1].position.x);wxR=Math.abs(wheels[3].position.x);wzF=Math.abs(wheels[1].position.z);wzR=Math.abs(wheels[3].position.z);tw=wheels[0].userData.large||.3;} // (2026-10-08) la voie de CHAQUE essieu (SQUALE : la roue unique du milieu)
  const BW=Math.max(sp.w,2*Math.max(wx,wxR)+tw)*.5,BL=Math.max(sp.l*.5,Math.max(wzF,wzR)+.35);           // demi-empreinte de la caisse
  EMPR.PW=2*BW+1.3;EMPR.PL=2*BL+1.5;                                                         // + la pénombre tout autour
  const c=EMPR.cv.getContext('2d'),im=c.createImageData(64,128),D=im.data,rc=Math.min(BW,.55),cA=EMPR.cvA.getContext('2d'),imA=cA.createImageData(64,128),DA=imA.data;
  for(let j=0;j<128;j++)for(let i=0;i<64;i++){
    const x=((i+.5)/64-.5)*EMPR.PW,z=(.5-(j+.5)/128)*EMPR.PL;                               // ligne 0 = le NEZ (le haut du canvas = +Y du plan = l'avant)
    const qx=Math.abs(x)-(BW-rc),qz=Math.abs(z)-(BL-rc);                                      // distance signée au rectangle aux coins ronds
    const dd=Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)-rc;
    const t=Math.min(1,Math.max(0,(dd+.3)/.9));let a=.46*(1-t*t*(3-2*t));                     // le corps : plein dessous, fondu sur ~90 cm
    const o=(j*64+i)*4,tA=Math.min(1,Math.max(0,(dd+.3)/.95)),sA=1-tA*tA*(3-2*tA);DA[o]=DA[o+1]=DA[o+2]=255;DA[o+3]=Math.round(.72*sA*255); // (2026-10-23) en l'air : le même corps, sans les quatre appuis, un peu plus dense (l'ombre d'une caisse qui vole doit se LIRE sur un plateau clair)
    const zw=z>0?wzF:wzR,ex=(Math.abs(x)-(z>0?wx:wxR))/(tw*.9),ez=(Math.abs(z)-zw)/.55;                // les quatre appuis
    a=1-(1-a)*(1-.5*Math.exp(-(ex*ex+ez*ez)*1.6));
    D[o]=D[o+1]=D[o+2]=255;D[o+3]=Math.round(a*255); // (vague 2) blanc : l'encre vient de la matière (voir contactShadow)
  }
  c.putImageData(im,0,0);EMPR.tex.needsUpdate=true;cA.putImageData(imA,0,0);EMPR.texA.needsUpdate=true;
}
function updateContactShadow(){ // appelée juste avant le rendu
  if(CHUTE&&CHUTE.on){contactShadow.visible=false;return;} // (2026-09-30) LA CHUTE : pas de sol sous elle (CHUTE est un var : undefined avant sa ligne)
  const gen9=carGroup.userData.gen||0;
  if(EMPR.gen!==gen9){EMPR.gen=gen9;emprPeint();}
  // AU GARAGE ET À LA VITRINE DU MENU aussi : la caisse posée sur son plateau ou sur la route n'avait RIEN sous elle
  const vitrine=garageOn||(((!running&&!started)||MENUV.retour)&&carGroup.visible); // (2026-09-28) l'accueil d'après-mort aussi (accueilRetour)
  if(!SHADOW_ON||(mode==='boom'&&!garageOn)||(!running&&!vitrine)){contactShadow.visible=false;return;}
  if(garageOn&&typeof GBQ!=='undefined'&&(GBQ.on||GBQ.veut||Math.abs(GBQ.lev||0)>.02)){contactShadow.visible=false;return;} /* (2026-10-14, Léo : « la plate sous la voiture : l'ombre se pose sur un sol invisible ») en BOUTIQUE la caisse lévite : l'empreinte la suivait en l'air ; l'ombre au sol, c'est GBQ.omb */
  const M9=contactShadow.material;
  if(vitrine||mode==='drive'){
    EMPR.f.set(0,0,1).applyQuaternion(carGroup.quaternion);                                   // le nez de la caisse (glisse et drift compris)
    const FO=garageOn&&vitrine&&typeof figOmbre==='function'?figOmbre.O:null,air9=!!(FO&&FO.on&&FO.h>.02&&performance.now()-FO.t<150); /* (2026-10-23, Léo : « une ombre plate suit la voiture pendant que ça saute ») AU GARAGE, la caisse qui a quitté le plateau laisse son ombre SUR le plateau, sous son centre, au cap — voir garage-ombre.js */
    if(air9){EMPR.n.set(0,1,0);EMPR.f.set(Math.sin(FO.psi),0,Math.cos(FO.psi));shTmpP.set(FO.x,FO.solY+.018,FO.z);}
    else if(vitrine){EMPR.n.set(0,1,0).applyQuaternion(carGroup.quaternion);shTmpP.copy(carGroup.position).addScaledVector(EMPR.n,.018);}
    else{
      frameAt(s,Fsh);
      if(side<0){Fsh.n.multiplyScalar(-1);Fsh.b.multiplyScalar(-1);}
      EMPR.n.copy(Fsh.n);
      shTmpP.copy(Fsh.p).addScaledVector(Fsh.b,lat).addScaledVector(Fsh.n,(side<0?THICK:0)+0.03); // pile sur la surface (sans le hopY : l'ombre reste au sol quand la caisse saute)
    }
    EMPR.f.addScaledVector(EMPR.n,-EMPR.f.dot(EMPR.n));
    if(EMPR.f.lengthSq()<1e-6)EMPR.f.copy(Fsh.t);EMPR.f.normalize();
    EMPR.r.crossVectors(EMPR.f,EMPR.n);                                                       // X = droite, Y = nez, Z = normale : le plan épouse la route ET suit le cap
    shMat4.makeBasis(EMPR.r,EMPR.f,EMPR.n);
    contactShadow.position.copy(shTmpP);
    contactShadow.quaternion.setFromRotationMatrix(shMat4);
    if(air9){const g9=1+.22*Math.min(FO.h,2.5);M9.map=FO.h>.05?EMPR.texA:EMPR.tex;contactShadow.scale.set(EMPR.PW*FO.kx*g9,EMPR.PL*FO.kz*g9,1);const u9=Math.min(1,Math.max(0,(FO.h-.05)/.55));M9.opacity=(.575+(.9/(1+.18*FO.h)-.575)*u9*u9*(3-2*u9));} /* .575 × .72 = .9 × .46 : le centre de l'ombre garde sa noirceur d'au sol au moment du décollage (aucun saut), puis elle s'éclaircit à peine avec l'altitude */ // en l'air : plus elle monte, plus l'ombre s'étale et s'éclaircit ; les appuis des roues s'éteignent au décollage
    else{if(M9.map!==EMPR.tex)M9.map=EMPR.tex;
      contactShadow.scale.set(EMPR.PW*carGroup.scale.x,EMPR.PL*carGroup.scale.z,1);
      M9.opacity=vitrine?.9:(side<0?1:.72);} // (2026-09-26) l'empreinte porte sa propre densité (≤ .46 sous le corps, ~.7 aux roues) ; sous la dalle elle est seule (l'ombre réelle part dans le vide)
    contactShadow.visible=true;
  }else if(mode==='fall'){
    const hgt=VOLR.on?curHOff:fallPos.y-lastNearY; // hauteur au-dessus de la route la plus proche → télégraphe d'atterrissage — (LE VOL QUI SUIT LA ROUTE) sur la route sans haut ni bas : le long de la normale de la dalle
    if(hgt>0.4&&hgt<46&&(VOLR.on?curLatOff*curLatOff:lastNearH2)<(ROAD_HALF+1.5)*(ROAD_HALF+1.5)){ // ...mais RIEN à survoler au-dessus d'un trou : pas d'ombre suspendue dans le vide — (route ÷2) 560 = 23,7² était la demi-route ×1,7 d'AVANT : sur la route ÷2 l'ombre « tu es au-dessus du bitume » s'allumait jusqu'à 16 m dans le vide ; désormais la dalle + une demi-caisse
      if(M9.map!==contactTex)M9.map=contactTex; // en vol, le télégraphe d'atterrissage reste le disque qui grandit avec la hauteur
      const bi9=tryLand._bi,k=1+hgt*0.05;
      if(bi9!=null&&bi9>=0&&Nn[bi9]&&curHOff>0){ // (2026-09-28) posée SUR la dalle survolée, dans son plan (sur une pente, le disque à plat s'y enfonçait à moitié)
        contactShadow.position.copy(fallPos).addScaledVector(Nn[bi9],.06-curHOff);
        contactShadow.quaternion.setFromRotationMatrix(shMat4.makeBasis(T[bi9],B[bi9],Nn[bi9]));contactShadow.scale.set(6.6*k,5.4*k,1);}
      else{contactShadow.position.set(fallPos.x,lastNearY+0.06,fallPos.z);
        contactShadow.quaternion.setFromRotationMatrix(shMat4.makeRotationX(-Math.PI/2));contactShadow.scale.set(5.4*k,6.6*k,1);} // à plat
      M9.opacity=Math.max(0,Math.min(0.7*(1-hgt/46),(hgt-.4)*1.2));contactShadow.visible=true; // (2026-09-28) en FONDU au décollage (il surgissait à .69 d'un coup)
    }else contactShadow.visible=false;
  }else contactShadow.visible=false;
}
/* LA CAISSE VIT (2026-09-26) — roues et feux, une fois par image juste avant le rendu (appelée à côté d'updateContactShadow).
   LES ROUES : elles tournaient à « vF × 2,5 » pour tout le monde — plus de deux fois trop vite, une roue de kei-car comme une roue
   de mastodonte. Désormais vitesse du SOL (posée par la conduite, `ROUES.v`) ÷ RAYON de la roue. En l'air elles filent sur leur
   élan et s'essoufflent ; au menu, au garage, à l'explosion : arrêtées ; en pause : figées (la photo garde son flou). Le pas par
   image est BORNÉ à .3 rad : au-delà l'œil ne suit plus les rayons (stroboscope) — c'est le disque de FLOU qui prend le relais.
   LES FEUX : un phare n'éblouit que celui qui le regarde EN FACE (vu de profil, un point ; vu de dos, rien) ; les feux arrière
   brillent vers la caméra de poursuite et S'EMBRASENT au frein — pouce tiré vers le bas (drift) ou ↓. La nuit (ville, orbite)
   les halos s'élargissent. Zéro allocation : tout passe par VIT9. */
const VIT9={f:new THREE.Vector3(),v:new THREE.Vector3(),frein:0,tC:new THREE.Color(0xff2818),tF:new THREE.Color(0xff5a36),trC:new THREE.Color(0xff2818),trK:0,clB:1,clW:-1,phT:{aube:.6,matin:0,midi:0,aprem:0,golden:.3,soir:1,nuit:1}}; // phT : les phares selon l'heure du titre (voir plus bas) · clB/clW : la lampe de carrosserie (valeur posée par la boucle / valeur dosée)
function carVit(dt){
  const boom=mode==='boom';
  if(!running||garageOn||boom)ROUES.v=0;
  else if(!paused&&mode!=='drive')ROUES.v*=Math.exp(-dt*.7);
  if(!paused&&wheels.length){
    const R0=wheels[wheels.length-1].userData.R||.45,pas=Math.max(-.3,Math.min(.3,ROUES.v/R0*dt));
    if(pas){for(const w of wheels)w.rotation.x+=pas*R0/(w.userData.R||R0);for(const e of ESSIEUX)e.rotation.x+=pas;} // (2026-09-27) les roues d'origine (hors scène, lues ailleurs) + les essieux soudés qu'on VOIT
  }
  const nuit=Math.max(LVL.pluie||0,LVL.espace||0); // (Paris) la nuit, la lampe de carrosserie reste
  /* LA LAMPE DE CARROSSERIE SE RETIRE AU SOLEIL (2026-09-26, vague 2). `carLight` (blanche, 3 m au-dessus du toit) est la clé de la caisse
     la NUIT — sans elle, en ville, une caisse noire sort #0e010f. Mais de jour elle s'ajoutait au soleil : MESURÉ au pixel en poursuite
     (banc des laques), c'est elle — plus que le vernis — qui délavait les laques (L'ÉTALON #4f8578 → #77ab98 à midi, L'AIGLE DE FEU noir
     → gris #625567) et aplatissait les volumes (une deuxième source dure, par le dessus : plus d'ombre propre). La bible : UNE source dure
     par niveau, le ciel remplit. Elle tombe donc à 38 % de jour, reste pleine la nuit. Le JOUR se lit à la lumière du ciel (`hemi`,
     posée par les biomes : .78-.95 de jour, .6 en golden, .32-.46 la nuit, sous la pluie, en orbite) — la carrière a des nuits sans
     pluie. La boucle la repose chaque image (couleur, clignotement du DERNIER, braquage) : on MÉMORISE sa valeur (`clB`) et on la dose,
     sans jamais la faire dériver en pause. */
  const j9=Math.min(1-nuit,THREE.MathUtils.smoothstep(hemi.intensity,.42,.62)); // 1 = plein jour, 0 = nuit (ville, orbite, nuits de carrière)
  if(running&&!garageOn){if(carLight.intensity!==VIT9.clW)VIT9.clB=carLight.intensity;VIT9.clW=VIT9.clB*(1-.62*j9);carLight.intensity=VIT9.clW;}
  if(ROUES.flou){let k=Math.min(.45,Math.max(0,(Math.abs(ROUES.v)-5)/14)); // (vague 2) .62 → .45 : les rayons qui tournent DESSOUS doivent transparaître, sinon on lit un enjoliveur, pas une roue lancée
   if(mode==='fall')k*=.5;                                                   // en l'air la roue file sur son élan : un voile, plus un disque
   const M9=ROUES.flou.material;M9.opacity=k;ROUES.flou.visible=k>.02;
   // le disque est NON ÉCLAIRÉ : la nuit il brillait plus fort que la roue qu'il recouvre — il suit l'obscurité (sa teinte de base dans userData)
   if(k>.02){if(!M9.userData.c0)M9.userData.c0=M9.color.clone();M9.color.copy(M9.userData.c0).multiplyScalar(.5+.5*j9);}}
  if(!HALO.h.length&&!HALO.t.length)return;
  if(!paused){const fr=((running&&!boom&&mode==='drive'&&(keys.ArrowDown||keys.KeyS||driftEnCours))||(garageOn&&BURN.feuxK>.3))?1:0; // (2026-10-07) au BURN-OUT du garage on tient le frein : les feux stop s'allument
    VIT9.frein+=(fr-VIT9.frein)*Math.min(1,dt*(fr>VIT9.frein?20:5));}
  carGroup.getWorldDirection(VIT9.f);
  VIT9.v.copy(camera.position).sub(carGroup.position);
  const d=VIT9.f.dot(VIT9.v)/Math.max(1e-3,VIT9.v.length());   // +1 : on regarde la calandre · −1 : on regarde les feux
  const fr9=VIT9.frein;
  const av=THREE.MathUtils.smoothstep(d,-.2,.8),ar=THREE.MathUtils.smoothstep(-d,-.2,.8);
  /* (2026-10-16, Léo, deux photos à l'appui : la caisse noire vue de trois-quarts — « des boules de lumière comme ça, c'est pas réaliste, ça
     cache » — et l'orange vue de face — « un peu lumineux, mais pas trop ») EN BOUTIQUE le halo des phares ne s'allume qu'en FACE : opacité et
     taille suivent av² (de face ≈ comme avant, de trois-quarts un quart, de profil rien) — la boule qui débordait du nez a disparu, la lueur sur
     le phare reste. `VIT9.bqK` fond le passage (0,25 s) ; en course et au garage, rien ne change. */
  const bqV=garageOn&&typeof GBQ!=='undefined'&&(GBQ.on||GBQ.veut||Math.abs(GBQ.lev||0)>.02);
  VIT9.bqK=(VIT9.bqK||0)+((bqV?1:0)-(VIT9.bqK||0))*Math.min(1,dt*4);const bk9=VIT9.bqK,av2=av*av;
  /* (2026-10-18, Sacha : « en journée les phares avant des voitures n'ont pas besoin d'être allumés ») LES PHARES S'ÉTEIGNENT AU SOLEIL : le halo
     des phares suit la NUIT DU LIEU — en course celle des lumières v2 (`LUM.nuit` : la lumière du ciel mesurée + le drapeau `nuit` du niveau,
     0 de jour, ~0,4 au soir et sous la pluie, 1 la nuit) ; sur l'écran titre (⚠ `garageOn` y vaut VRAI : le titre passe par garageRender) l'HEURE
     du titre (`VIT9.phT` : éteints du matin à l'après-midi, en veilleuse à la golden hour, allumés le soir et la nuit) ; ailleurs (la mort) le
     jour lu au ciel (`j9`). Ils s'allument à la nuit tombante, en fondu (`VIT9.ph`). Au garage et en boutique, rien ne change (le choix de Léo
     du 16/10). Les feux arrière restent. */
  const phT=CHUTE.on?VIT9.phT[TITRE_HF.h]:null;
  const ph9=phT!=null?phT:garageOn?1:LUM.actif?LUM.nuit:1-j9;VIT9.ph=VIT9.ph==null||garageOn?ph9:VIT9.ph+(ph9-VIT9.ph)*Math.min(1,dt*3);
  const phK=CAR_PHK==null?1:CAR_PHK; // (2026-10-18) des phares ESCAMOTABLES n'éclairent que levés (LA VETTE, voir CAR_PHK)
  HALO.hM.opacity=boom?0:(.95*(.3+.7*av)*(1-bk9)+.9*av2*bk9)*VIT9.ph*phK;
  for(const s9 of HALO.h)s9.visible=HALO.hM.opacity>.01;
  for(const s9 of HALO.h){const k=s9.userData.k*((.55+.5*av)*(1-bk9)+(.3+.6*av2)*bk9)*(1+.3*nuit)*(1+.45*LVL.nuit);s9.scale.set(k,k,1);} // (2026-09-30) MINUIT EN VILLE : des phares PUISSANTS
  // LES FAISCEAUX AU SOL (CARPOOL.head) : en plein jour, un phare ne dessine rien sur le bitume — la nappe chaude se retire de moitié ;
  // la nuit (ville, orbite) elle mord pour de bon. Ce sont les seuls à rester au sol, et ils sont DEVANT la caisse.
  if(CARPOOL.head&&CARPOOL.head.userData.op!=null)CARPOOL.head.material.opacity=Math.min(1,CARPOOL.head.userData.op*(.5+.6*nuit)*(1+1.1*LVL.nuit))*phK;
  /* (2026-10-16, Léo : « dans la boutique, enlève le rayon plat lumineux des phares ; les phares doivent rester un peu lumineux ») EN BOUTIQUE la
     nappe des faisceaux se retire : la caisse lévite, le plan peint restait au ras du plateau et traînait un rayon sur le sol blanc. Les HALOS des
     phares (HALO.h, plus haut) restent, adoucis : ce sont eux qui gardent les phares allumés. Rendue à la sortie (la course la repose de toute façon). */
  if(CARPOOL.head){
    if(bqV){if(CARPOOL.head.visible){CARPOOL.head.visible=false;VIT9.phBq=1;}}else if(VIT9.phBq){CARPOOL.head.visible=true;VIT9.phBq=0;}}
  HALO.tM.opacity=boom?0:Math.min(1,.85*(.35+.65*ar)+.2*fr9);
  /* (2026-10-18, traînées — Sacha : « améliore toutes les traînées ») LE FEU PREND LA COULEUR DE SA TRAÎNÉE : la traînée naît dans le feu arrière,
     mais au nitro un ruban vert, rose ou bleu sortait d'une boule ROUGE — la source et sa lumière ne se répondaient pas. Le halo du feu prend la
     teinte de la traînée à la mesure de son énergie (`VIT9.trK`/`trC`, posés par la boucle avec les traînées de lumière) et enfle d'un tiers :
     la lumière sort d'une lampe de sa couleur. Lâché, il retourne au rouge avec elle ; au garage et à l'explosion, rien ne change. */
  const tk9=(running&&!garageOn&&!boom)?VIT9.trK:0;
  HALO.tM.color.copy(VIT9.tC).lerp(VIT9.tF,fr9);if(tk9>.01)HALO.tM.color.lerp(VIT9.trC,tk9);
  for(const s9 of HALO.t){const k=s9.userData.k*(.85+.2*ar+.65*fr9)*(1+.2*nuit)*(1+.35*tk9);s9.scale.set(k,k,1);}
}
/* LES LUMIÈRES DE LA CAISSE v2 — LE PILOTE (2026-10-17, voir LUM_GLSL). `lumTick` pose chaque image, EN COORDONNÉES MONDE, ce que la caisse éclaire :
   les phares, les deux feux arrière, le feu du nitro (un trait par côté), les traînées de lumière (trois traits chacune) ; `lumVue`, chaîné sur
   scene.onBeforeRender, les passe dans le repère de LA caméra qui rend (poursuite, mode photo, chauffe) — les flaques de lumière ne glissent jamais.
   LA NUIT (`LUM.nuit`) se lit à la lumière du lieu (le ciel et le soleil posés par bioApply : ~0,55 de jour, 0,34 au soir et sous la pluie, 0,10-0,16
   la nuit, mesuré sur les 32 couples map × météo) et au drapeau `nuit` du niveau : phares et feux ne MORDENT qu'à la nuit tombante ; le feu du nitro
   éclaire toujours un peu (c'est du feu). Réglages vivants : `LUMK` (dbgLum). */
const LUMK={air:[.12,.9],hl:180000,hlC:[1,.88,.7],feu:.45,feuF:2,feuS:.7,feuR:.4,nit:.8,nitS:1.1,nitR:.5,nitL:2.4,mot:.22,tr:.1,trS:.5,trR:.8,trD:[0,12],amb:[.17,.45],nitJ:.35,car:.15,carF:1.8};
const LUM={on:false,nuit:0,hl:0,n:0,W:null /* Float32Array(LM_N*12), alloué au premier tour : LM_N est déclaré plus bas (avec le shader du bitume) */,hP:[new THREE.Vector3(),new THREE.Vector3()],hF:new THREE.Vector3(),hU:new THREE.Vector3(),hR:new THREE.Vector3(),
  k:new THREE.Vector3(),c:new THREE.Vector3(),v:new THREE.Vector3(),w:new THREE.Vector3(),q:new THREE.Vector3(),f:0,actif:false,fA:new THREE.Vector3(),fB:new THREE.Vector3(),cc:new THREE.Color()};
function lumLampe(ax,ay,az,bx,by,bz,r,lob,cr,cg,cb,sp){ // une lampe-segment en coordonnées MONDE (voir LUM_GLSL) : A, B, rayon doux, lobe (1 = vers l'arrière), couleur × intensité, part de reflet
  if(LUM.n>=LM_N||cr+cg+cb<.004)return;const W=LUM.W,o=LUM.n*12;W[o]=ax;W[o+1]=ay;W[o+2]=az;W[o+3]=r*r;W[o+4]=bx;W[o+5]=by;W[o+6]=bz;W[o+7]=lob;W[o+8]=cr;W[o+9]=cg;W[o+10]=cb;W[o+11]=sp;LUM.n++;}
function lumNoeud(tr,d,o){ // le point de la traînée à `d` mètres de sa tête (le long du chemin), son éclat dans o.w : null au-delà de sa longueur
  const X=tr.X,Y=tr.Y,Z=tr.Z;if(d<=0){o.set(X[0],Y[0],Z[0]);return tr.K[0];}let ac=0;
  for(let i=1;i<tr.n;i++){const dx=X[i]-X[i-1],dy=Y[i]-Y[i-1],dz=Z[i]-Z[i-1],l=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(ac+l>=d){const u=l>1e-4?(d-ac)/l:0;o.set(X[i-1]+dx*u,Y[i-1]+dy*u,Z[i-1]+dz*u);return tr.K[i-1]+(tr.K[i]-tr.K[i-1])*u;}ac+=l;}
  return null;}
function lumTick(dt,kmh){
  if(!LUM.W)LUM.W=new Float32Array(LM_N*12);
  const actif=!LUMK.off&&running&&!garageOn&&started&&!gameOver; // la course seulement (LUMK.off : le banc coupe tout, dbgLum({off:1})) : le menu, le ciel du titre et le garage ont leur propre éclairage
  if(!actif){if(LUM.actif){LUM.actif=false;LUM.n=0;LUM.hl=0;LUM_U.uLmN.value=0;LUM_U.uHlC.value.setRGB(0,0,0);if(CARPOOL.head&&CARPOOL.head.userData.lumCache){CARPOOL.head.visible=true;CARPOOL.head.userData.lumCache=0;}}return;}
  LUM.actif=true;
  /* LA NUIT : la lumière du lieu (ciel + soleil, en luminance), et le drapeau du niveau (les nuits de lune claire) */
  const lu=function(c){return .2126*c.r+.7152*c.g+.0722*c.b;},amb=hemi.intensity*(lu(hemi.color)+lu(hemi.groundColor))*.5;
  const nv=Math.max(LVL.nuit||0,1-THREE.MathUtils.smoothstep(amb,LUMK.amb[0],LUMK.amb[1]));
  LUM.nuit+=(nv-LUM.nuit)*Math.min(1,dt*2);const nu=LUM.nuit,boom=mode==='boom';
  LUM.n=0;
  carGroup.getWorldDirection(LUM.hF);LUM.hU.set(0,1,0).applyQuaternion(carGroup.quaternion);LUM.hR.crossVectors(LUM.hF,LUM.hU);
  LUM.k.copy(LUM.hF).negate(); // l'ARRIÈRE de la caisse : le lobe des feux
  /* LES PHARES : sur les deux lampes du gabarit (les halos HALO.h) — une caisse sans phares (le chat) n'éclaire pas */
  const sp=CARS[level]||{w:2,l:4.4,h:1.3};
  LUM.hl+=(((boom?0:1)*nu*(CAR_PHK==null?1:CAR_PHK))-LUM.hl)*Math.min(1,dt*(boom?12:3)); // (2026-10-18) × le levé des escamotables (voir CAR_PHK)
  if(HALO.h.length){for(let j=0;j<2;j++){const h=HALO.h[Math.min(j,HALO.h.length-1)];potMonde(LUM.v.copy(h.position).setZ(h.position.z-.06),LUM.hP[j]);}}
  else{for(let j=0;j<2;j++)potMonde(LUM.v.set((j?1:-1)*sp.w*.32,.55,sp.l*.5),LUM.hP[j]);}
  if(HALO.h.length===1)LUM.hP[1].copy(LUM.hP[0]);
  /* LES FEUX ARRIÈRE : rouges, ils rayonnent vers l'arrière ; au FREIN ils s'embrasent (le même frein que leurs halos, VIT9.frein) */
  const fr=LUMK.frein!=null?LUMK.frein:(VIT9.frein||0),kf=nu*(boom?0:1)*LUMK.feu*(1+(LUMK.feuF-1)*fr);
  LUM.f=nu*(boom?0:1)*LUMK.car*(1+(LUMK.carF-1)*fr); // la lueur des feux SUR LA CAISSE (voir FEU_U)
  if(CAR_FEUX.length){potMonde(CAR_FEUX[0],LUM.fA).addScaledVector(LUM.k,.06);if(CAR_FEUX.length>1)potMonde(CAR_FEUX[1],LUM.fB).addScaledVector(LUM.k,.06);else LUM.fB.copy(LUM.fA);}else LUM.f=0;
  if(kf>.002)for(let i=0;i<Math.min(2,CAR_FEUX.length);i++){potMonde(CAR_FEUX[i],LUM.v);LUM.v.addScaledVector(LUM.k,.14);
    const k=CAR_FEUX.length===1?kf*1.6:kf;lumLampe(LUM.v.x,LUM.v.y,LUM.v.z,LUM.v.x,LUM.v.y,LUM.v.z,LUMK.feuR,1,k*(1+.25*fr),k*(.05+.1*fr),k*.03,LUMK.feuS);}
  /* LE FEU DU NITRO : un trait par côté, de la bouche du pot le long du jet (il s'allonge avec la vitesse), à la couleur de la flamme (nitroLight :
     orange, bleu de réserve, violet de l'infini, l'or du pad, la traînée achetée…) et qui TREMBLE avec elle */
  let nI=(LUMK.nitF!=null?LUMK.nitF:nitroLight.intensity)*(boom?0:1),c=LUMK.nitF!=null?LUM.cc.setRGB(1,.48,.14):nitroLight.color; // (banc) LUMK.nitF force le feu du nitro, LUMK.frein le frein
  if(nI<.05&&MOTEUR_MINI&&!boom&&mode==='drive'&&FLM.L){let l=0;const np=Math.max(1,Math.min(4,CAR_POTS.length));for(let i=0;i<np;i++)l+=FLM.L[i]||0; // hors nitro, LA FLAMME DU MOTEUR (le mini feu de pixels) : une lueur qui crépite avec ses bouffées, la nuit
    const m=LUMK.mot*Math.min(1.6,l/np)*nu;if(m>nI){nI=m;c=LUM.cc.setRGB(1,.5,.16);}}
  if(nI>.01){const k=nI*LUMK.nit*(LUMK.nitJ+(1-LUMK.nitJ)*nu),ln=LUMK.nitL*(1+Math.min(1.4,Math.abs(kmh||0)/200));
    const pts=CAR_POT_1?[CAR_POT_C]:[CAR_POT_L,CAR_POT_R];
    for(const p of pts){potMonde(p,LUM.v);LUM.w.copy(LUM.v).addScaledVector(LUM.k,ln).addScaledVector(LUM.hU,-.05);LUM.v.addScaledVector(LUM.k,.12);
      const kk=k*(pts.length===1?1.5:1);lumLampe(LUM.v.x,LUM.v.y,LUM.v.z,LUM.w.x,LUM.w.y,LUM.w.z,LUMK.nitR,0,c.r*kk,c.g*kk,c.b*kk,LUMK.nitS);}}
  /* LES TRAÎNÉES DE LUMIÈRE : un trait sur leurs 12 premiers mètres, à leur couleur et à leur éclat (rouge des feux au roulage, le feu du nitro) */
  const kt=QUAL_LOW?0:LUMK.tr*(.2+.8*nu)*(boom?0:1); // (qualité basse : la puce chauffe, les traînées n'éclairent plus — six lampes de moins)
  if(kt>.002)for(let i=0;i<Math.min(2,CAR_FEUX.length);i++){const tr=SILS[i];if(!tr||!tr.m.visible||tr.n<2)continue;
    const g=tr.emit?1:tr.g,cr=tr.CR[0],cg=tr.CG[0],cb=tr.CB[0];let ka=lumNoeud(tr,LUMK.trD[0],LUM.v);
    for(let s=1;s<LUMK.trD.length;s++){const kb=lumNoeud(tr,LUMK.trD[s],LUM.w);if(kb==null||ka==null)break;
      const kk=kt*g*.5*(ka+kb);lumLampe(LUM.v.x,LUM.v.y,LUM.v.z,LUM.w.x,LUM.w.y,LUM.w.z,LUMK.trR,0,cr*kk,cg*kk,cb*kk,LUMK.trS);LUM.v.copy(LUM.w);ka=kb;}}
  /* la NAPPE PEINTE des phares (le trapèze blanc) se retire : la vraie lumière des phares est dans le bitume */
  if(CARPOOL.head&&CARPOOL.head.visible){CARPOOL.head.visible=false;CARPOOL.head.userData.lumCache=1;}
}
function lumVue(cam){ // (chaîné sur scene.onBeforeRender) monde → vue, pour LA caméra qui rend
  const U=LUM_U,e=cam.matrixWorldInverse.elements;
  const P=function(x,y,z,o,w){o.set(e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14],w);};
  const D=function(v,o){o.set(e[0]*v.x+e[4]*v.y+e[8]*v.z,e[1]*v.x+e[5]*v.y+e[9]*v.z,e[2]*v.x+e[6]*v.y+e[10]*v.z);};
  if(!LUM.actif){U.uLmN.value=0;U.uHlC.value.setRGB(0,0,0);FEU_U.uFvC.value.setRGB(0,0,0);return;}
  {const f=LUM.f;FEU_U.uFvC.value.setRGB(f,f*.06,f*.03);if(f>0){P(LUM.fA.x,LUM.fA.y,LUM.fA.z,FEU_U.uFvA.value,.09);P(LUM.fB.x,LUM.fB.y,LUM.fB.z,FEU_U.uFvB.value,.09);}}
  const W=LUM.W,n=LUM.n,sp=ROAD_U.uWet.value>.01?1:0; // sp : le REFLET ne se calcule que sur l'eau — le béton sec est mat, la moitié du travail sautée
  for(let i=0;i<n;i++){const o=i*12,dx=W[o+4]-W[o],dy=W[o+5]-W[o+1],dz=W[o+6]-W[o+2],dd=dx*dx+dy*dy+dz*dz,Bv=U.uLmB.value[i];
    P(W[o],W[o+1],W[o+2],U.uLmA.value[i],W[o+3]+(W[o+7]>.5?100:0)); // le rayon² (+100 : la lampe rayonne vers l'arrière, voir LUM_GLSL)
    Bv.set(e[0]*dx+e[4]*dy+e[8]*dz,e[1]*dx+e[5]*dy+e[9]*dz,e[2]*dx+e[6]*dy+e[10]*dz,dd>1e-6?1/dd:0); // le trait A→B (en vue) et 1/|AB|² (une rotation garde les longueurs)
    U.uLmC.value[i].set(W[o+8],W[o+9],W[o+10],W[o+11]*sp);}
  U.uLmN.value=n;const c=carGroup.position;P(c.x,c.y,c.z,U.uLmS.value,324);D(LUM.k,U.uLmK.value); // la sphère utile : 18 m autour de la caisse (au-delà, un test et rien)
  const hl=LUM.hl*LUMK.hl;U.uHlC.value.setRGB(LUMK.hlC[0]*hl,LUMK.hlC[1]*hl,LUMK.hlC[2]*hl);
  if(hl>0){for(let j=0;j<2;j++){const p=LUM.hP[j];P(p.x,p.y,p.z,U.uHlP.value[j],j&&HALO.h.length===1?.4:1);} /* un seul phare (l'épave) : 1,4 lampe, pas 2 */D(LUM.hF,U.uHlF.value);D(LUM.hR,U.uHlR.value);D(LUM.hU,U.uHlU.value);}
}
window.dbgLumVue=function(d,h,az,vise){ // (banc) MODE PHOTO dans le repère de la CAISSE : d m derrière, h m au-dessus (son haut à elle), az rad autour, vise = m devant le point visé
  if(started&&!gameOver&&!paused)togglePause();
  const p=carGroup.position,F=LUM.v,U=LUM.w,R=LUM.q;carGroup.getWorldDirection(F);U.set(0,1,0).applyQuaternion(carGroup.quaternion);R.crossVectors(F,U);
  d=d==null?9:d;h=h==null?3.4:h;az=az||0;
  camera.position.copy(p).addScaledVector(F,-d*Math.cos(az)).addScaledVector(R,d*Math.sin(az)).addScaledVector(U,h);camera.up.copy(U);
  camera.lookAt(p.x+F.x*(vise||4)+U.x*.7,p.y+F.y*(vise||4)+U.y*.7,p.z+F.z*(vise||4)+U.z*.7);camera.updateMatrixWorld();camera.up.set(0,1,0);
  RIM_U.uSunV.value.copy(RIM_DIR).transformDirection(camera.matrixWorldInverse);
  if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);};
window.dbgLumReprise=function(){if(paused)togglePause();return paused;}; // (banc) la photo a mis en pause : on repart
window.dbgLum=function(o){ // (banc) l'état des lumières de la caisse ; dbgLum({hl:12000,…}) règle LUMK à chaud ; dbgLum({hlK:[…],lmW:[…]}) les uniformes
  if(o){for(const k in o){if(k==='hlK')LUM_U.uHlK.value.fromArray(o.hlK);else if(k==='lmW')LUM_U.uLmW.value.fromArray(o.lmW);else LUMK[k]=o[k];}}
  return {actif:LUM.actif,nuit:+LUM.nuit.toFixed(2),halo:+HALO.hM.opacity.toFixed(2),halos:HALO.h.length,phK:CAR_PHK==null?null:+CAR_PHK.toFixed(2),ph:VIT9.ph==null?null:+VIT9.ph.toFixed(2),phares:+LUM.hl.toFixed(2),lampes:LUM.n,hP:LUM.hP.map(function(v){return v.toArray().map(function(x){return +x.toFixed(2);});}),hF:LUM.hF.toArray().map(function(x){return +x.toFixed(2);}),
    uHlC:LUM_U.uHlC.value.toArray().map(function(x){return +x.toFixed(1);}),uHlP:LUM_U.uHlP.value.map(function(v){return v.toArray().map(function(x){return +x.toFixed(2);});}),hlK:LUM_U.uHlK.value.toArray(),lmW:LUM_U.uLmW.value.toArray(),
    W:LUM.W?Array.from(LUM.W.slice(0,LUM.n*12)):[].map(function(x){return +x.toFixed(2);})};};
window.dbgFeuxEtude=function(o){ /* (banc, 2026-10-20, l'étude des feux) les pièces qui ÉMETTENT de la caisse (matière 'l') : leurs couleurs et leur
     nombre de sommets ; o.masque='l'|'h'|'lh'|'' cache les pièces lumineuses ('l'), les halos ('h'), ou rend tout */
  const L9=[],C9={};carGroup.traverse(function(m){if(!m.isMesh||!m.material||!m.material.isMeshBasicMaterial||!m.material.vertexColors||!m.material.userData.lp)return;L9.push(m);
    const c=m.geometry.attributes.color;if(!c)return;for(let i=0;i<c.count;i++){const k=((Math.round(c.getX(i)*255)<<16)|(Math.round(c.getY(i)*255)<<8)|Math.round(c.getZ(i)*255)).toString(16).padStart(6,'0');C9[k]=(C9[k]||0)+1;}});
  if(o&&o.boite){const bx=new THREE.Box3();carGroup.updateMatrixWorld(true);carGroup.traverse(function(q){if(q.isMesh&&!q.isSprite&&FEUXL.fais.indexOf(q)<0&&!(q.userData&&q.userData.sol)){q.geometry.computeBoundingBox();const bb=q.geometry.boundingBox.clone().applyMatrix4(q.matrixWorld);bx.union(bb);}});const cam=o.cam==='gar'&&typeof GAR!=='undefined'&&GAR.camV?GAR.camV:camera,v=new THREE.Vector3();let x0=1,y0=1,x1=-1,y1=-1;
    for(let i=0;i<8;i++){v.set(i&1?bx.max.x:bx.min.x,i&2?bx.max.y:bx.min.y,i&4?bx.max.z:bx.min.z).project(cam);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);}
    return {x0:(x0+1)/2,x1:(x1+1)/2,y0:(1-y1)/2,y1:(1-y0)/2};}
  if(o&&o.masque!=null){const q=o.masque;for(const m of L9)m.material.visible=q.indexOf('l')<0;HALO.hM.visible=HALO.tM.visible=q.indexOf('h')<0;if(FEUXL.cM)for(const c of FEUXL.cM)c.visible=q.indexOf('h')<0;}
  return {pieces:L9.length,couleurs:C9,halo:{h:HALO.hM.color.getHexString(),hOp:+HALO.hM.opacity.toFixed(2),t:HALO.tM.color.getHexString(),tOp:+HALO.tM.opacity.toFixed(2),n:HALO.h.length},
    faisceau:CARPOOL.head?{c:CARPOOL.head.material.color.getHexString(),op:+CARPOOL.head.material.opacity.toFixed(2),vu:CARPOOL.head.visible}:null,hlC:LUMK.hlC,headSpot:headSpot.color.getHexString()};};
/* ============ fin TRIPTYQUE ============ */

// ---------- GÉNÉRATEUR (45°, patterns pensés pour l'airtime) ----------
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
/* ⚠ LA ROUTE S'ÉLARGIT, ET ELLE RÉTRÉCIT À CHAQUE NIVEAU (2026-09-24, user : « élargis la route ; pour les
   débutants elle réduit à chaque niveau »). `ROAD_HALF` n'est plus une constante : `lvlChoisir` la pose
   AVANT chaque `buildTrack` (voir `LARGEUR`). Tout ce qui la lit le fait à l'exécution (collisions, bords,
   pickups, bots, viseur) — sauf trois géométries PARTAGÉES bâties une fois (dos d'âne, tapis et lèvre
   du tremplin) : elles sont taillées sur `ROAD_HALF0` et chaque mesh se met à l'échelle en X. */
const ROAD_HALF0=14,THICK_ROUTE=5.2;let THICK=THICK_ROUTE; // (2026-10-15 soir, Sacha : « augmente l'épaisseur de la route ») 3,9 → 5,2 m (le double des 2,6 d'origine) — (2026-10-15, Sacha : « augmente de 50 % l'épaisseur des routes pour avoir plus de surface pour bump ») 2,6 → 3,9 m — (2026-10-12) THICK devient un let : le SOLEIL DE JADE roule sur une dalle de DEUX PIÈCES d'épaisseur (buildTrack) — // (2026-09-25 soir) la route avait été divisée par 2 (14 → 7, « réduis de moitié la largeur ») puis REDOUBLÉE à la demande (« double la largeur des routes ») : retour à 14. LARGEUR, CARR_LARG, parc ×1,4 et auto-école ×1,7 sont des MULTIPLES de ce gabarit — une ligne change toute la route
let ROAD_HALF=ROAD_HALF0*2.0;
let pts=[],T=[],Nn=[],B=[],L=0,NP=0,trackMinY=-1e9; // trackMinY : plancher du monde (référence du plongeon fatal)
/* NÉON RÉACTIF (2026-08-07) : on garde une poignée sur les matériaux des rails et de leur nappe
   pour les faire COGNER au beat. ⚠ ce sont des MATÉRIAUX, pas des meshes : la piste est rebâtie à
   chaque zone, donc ces listes se vident avec `trackMeshes` — sinon on garderait des références
   sur des matériaux disposés et le pouls s'appliquerait dans le vide. */
const NEON_RAILS=[],NEON_GLOW=[];
/* L'OVULE (portail d'arrivée) : géométrie et matériau PARTAGÉS, créés une fois — trackMeshes dispose géométrie ET matériau des
   meshes au rebuild, d'où les gardes `userData.garde` posées plus bas : ils survivent aux portails. */
const PORTAL={c:new THREE.Vector3(),R:55,noy:null,halo:null,geo:null,mat:null};
