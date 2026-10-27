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
