// ---------- TIRELIRE : un petit cochon rose attend sur la ligne de départ… ----------
// LE LARGAGE : la voiture tombe du ciel, l'écrase — il éclate en tessons roses et en pièces d'or.
let pigGroup=null,introD=false;
const pigPinkM=new THREE.MeshPhongMaterial({color:0xff9ec4,emissive:0x7a2a48,emissiveIntensity:.14,shininess:220,specular:0xffffff,envMap:envTex,reflectivity:.3,combine:THREE.MixOperation});
const pigDarkM=new THREE.MeshPhongMaterial({color:0xd66d98,shininess:130,specular:0xffd0e0});
/* ⚠ PLUS DE TIRELIRE AU MENU (2026-09-25, user, capture à l'appui : « c'est quoi cette chose ? »). Le largage sur le
   cochon a été retiré des parties le 2026-09-05, mais le FOND du menu le rejouait encore : la caisse suspendue à 13 m
   au-dessus d'une tirelire rose, que la caméra montrait de haut et en gros plan — méconnaissable. Le menu montre
   désormais TA caisse, posée sur la route de la ville. (Le nom reste : trois appelants s'en servent pour « remettre à zéro ».) */
function setupIntroPig(){
  if(pigGroup){scene.remove(pigGroup);pigGroup=null;}
  introD=false;hopY=0;hopV=0;vA=0;vL=0;psi=0;lat=0;
}
function coinPing(i){ // tintement de pièces qui roulent
  if(!sfxOk())return;
  try{
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='sine';o.frequency.value=[1320,1660,1980,2350][i%4];
    const t0=AC.currentTime+i*.06;
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.06,t0+.012);
    g.gain.exponentialRampToValueAtTime(.001,t0+.22);
    o.connect(g);g.connect(MASTER);o.start(t0);o.stop(t0+.25);
  }catch(e){}
}
function smashPig(){
  introD=false;graceT=1.4;
  if(!pigGroup)return;
  const pp=carGroup.position;
  for(let k=0;k<14;k++){ // tessons de porcelaine rose (matériaux partagés → sh:1, pas de dispose)
    const d=new THREE.Mesh(new THREE.BoxGeometry(.1+Math.random()*.22,.05+Math.random()*.1,.1+Math.random()*.22),
      k%4===3?pigDarkM:pigPinkM);
    d.position.copy(pp);d.position.y+=.5;
    chips.push({m:d,sh:1,v:new THREE.Vector3((Math.random()-.5)*12,3+Math.random()*7,(Math.random()-.5)*12),
      rx:(Math.random()-.5)*15,ry:(Math.random()-.5)*15,life:1.9});
    scene.add(d);
  }
  for(let k=0;k<10;k++){ // …et les économies du cochon giclent
    const d=new THREE.Mesh(pickGeo,pickMat);d.scale.setScalar(.4);
    d.position.copy(pp);d.position.y+=.6;
    chips.push({m:d,sh:1,v:new THREE.Vector3((Math.random()-.5)*9,4+Math.random()*8,(Math.random()-.5)*9),
      rx:(Math.random()-.5)*18,ry:(Math.random()-.5)*18,life:2.3});
    scene.add(d);
    coinPing(k);
  }
  scene.remove(pigGroup);pigGroup=null;
  // LA TIRELIRE SYMBOLIQUE : elle ne contient que la mise du studio — 1,61 €. Indexée sur denom()
  // elle crachait des centaines de milliers dès l'écran d'ouverture : un jeu de progression ne
  // commence pas riche, il commence avec de quoi payer un café.
  // ⚠ ELLE NE DONNE RIEN, ELLE RÉVÈLE (2026-08-03) : `money` vaut DÉJÀ START_CASH (posé à l'init et
  // par resetGame). La tirelire faisait `money+=START_CASH` par-dessus → toute partie commençait à
  // 3,22 € au lieu de 1,61 €. C'est la MÊME mise qu'on casse en deux, pas une seconde.
  // Le message ne promet donc plus « +X » : il constate ce qu'on a en poche.
  money=START_CASH;levelCash=0;paintMoney();
  // ⚠ pas fmtC ici : il ARRONDIT (1,61 → « 2 »), le message aurait annoncé 2 € à côté d'un compteur
  // affichant 1,61. La mise est le seul montant du jeu qui se dit au centime près.
  trickMsg(TR('🐷 TIRELIRE ÉVENTRÉE — ')+CUR()+' '+START_CASH.toFixed(2).replace('.',LANG==='fr'?',':'.')+TR(' EN POCHE'),1);
  flyCash(pp,6);
  sparkBurst(sparkGold,pp,16,10);
  noiseBurst(.3,.22,2600);noiseBurst(.16,.15,4200);subBoom(.22);thud(9); // craquement de porcelaine
  shake=Math.max(shake,.8);squashT=Math.max(squashT,.3);
}
// ---------- PARTICULES : poussière des roues + flocons de vitesse ----------
// disque flou : les particules sont rondes et diffuses, plus jamais des carrés
const puffTex=(function(){
  const cv=document.createElement('canvas');cv.width=cv.height=64;
  const c=cv.getContext('2d');
  const g=c.createRadialGradient(32,32,2,32,32,30);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.55,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.beginPath();c.arc(32,32,30,0,7);c.fill();
  return new THREE.CanvasTexture(cv);
})();
// ÉTINCELLE : cœur brûlant, chute d'alpha RAPIDE — pour le feu d'échappement. Le disque mou (puffTex)
// gonflé par le bloom faisait des BALLONS blancs ; ici le point reste une étincelle, même en gros plan.
const sparkTex=(function(){
  const cv=document.createElement('canvas');cv.width=cv.height=64;
  const c=cv.getContext('2d');
  const g=c.createRadialGradient(32,32,1,32,32,30);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.16,'rgba(255,255,255,.85)');
  g.addColorStop(.42,'rgba(255,255,255,.22)');g.addColorStop(.7,'rgba(255,255,255,.04)');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.beginPath();c.arc(32,32,30,0,7);c.fill();
  return new THREE.CanvasTexture(cv);
})();
/* LES PARTICULES « PROCHES » (2026-09-26, audit rendu) : une braise de 1,8 m à 5 m de la caméra faisait un ROND de 150 px derrière
   la caisse — les taches orange du verdict. `proche` : taille plafonnée à l'écran (26 px CSS, suivie par la résolution adaptative)
   et fondu sous 3,5-8 m de la caméra. Les pools de l'EXPLOSION n'y sont pas soumis : eux doivent remplir l'écran. */
var PT_U={uPxMax:{value:26*curDPR}};
function ptProche(sh){
  sh.uniforms.uPxMax=PT_U.uPxMax;
  sh.vertexShader='uniform float uPxMax;varying float vProche;\n'+sh.vertexShader.replace('#include <logdepthbuf_vertex>','gl_PointSize=min(gl_PointSize,uPxMax);vProche=smoothstep(3.5,8.0,-mvPosition.z);\n#include <logdepthbuf_vertex>');
  sh.fragmentShader='varying float vProche;\n'+sh.fragmentShader.replace('#include <tonemapping_fragment>','gl_FragColor.a*=vProche;\n#include <tonemapping_fragment>');
}
/* LES PARTICULES v2 (2026-09-26, passe graphique) — trois défauts « amateur » réglés dans UN shader, pour les réserves qui déclarent
   une courbe `fx` (les autres — les dauphins — gardent l'ancien rendu au pixel près ; le jus des fruits y est passé en vague 2) :
   · elles NAISSENT et MEURENT en FONDU : `aF` = vie restante (1 → 0), `fx.a`=[entrée, sortie, taille à la naissance, taille à la mort]
     en fractions de vie — la fumée gonfle en s'effaçant, l'étincelle rétrécit ; plus de points qui s'allument et s'éteignent d'un coup ;
   · chacune a SA taille (`aR`, cuite une fois par emplacement) : fini la réserve entière qui palpite à l'unisson ;
   · `fx.etire` : l'étincelle S'ÉTIRE dans le sens de sa vitesse À L'ÉCRAN (vitesse relative à la caisse que suit la caméra, `PT_U.uVc`,
     posée par `ptTick`) — un trait fin, tête chaude, queue qui s'éteint : la vitesse se LIT. Tout se calcule dans le vertex shader
     (projection de p et de p+v·dt), zéro coût CPU ; le trait est plafonné (2,4 × le plafond « proche ») et son épaisseur reste fine.
   Chauffe : les réserves sont en scène dès la première image (au menu), leurs programmes y compilent — jamais en course.
   Un emplacement mort a `aF`=0 → taille 0 : la réserve au repos (au menu, empilée à l'origine) ne coûte plus un pixel. */
PT_U.uVc={value:new THREE.Vector3()};
const PT_CP=new THREE.Vector3(),PT_VR=new THREE.Vector3();
function ptTick(dt){ // la vitesse de la caisse suivie par la caméra (lissée, téléportations ignorées) — le repère des traits
  if(dt>0){PT_VR.subVectors(carGroup.position,PT_CP).multiplyScalar(1/dt);
    if(PT_VR.lengthSq()<250000)PT_U.uVc.value.lerp(PT_VR,Math.min(1,dt*14));}
  PT_CP.copy(carGroup.position);
}
function ptShader(o){
  return function(sh){
    sh.uniforms.uPxMax=PT_U.uPxMax;sh.uniforms.uFx=o.uFx;sh.uniforms.uPr=o.uPr;
    // uPr : x,y = fondu près de l'objectif (m) · z = plafond de taille (px CSS) · w = plafond de longueur du trait (px CSS) — 0 = sans
    let vh='attribute float aF;attribute float aR;uniform vec4 uFx;uniform vec4 uPr;uniform float uPxMax;varying float vA9;\n',
        vb='float ag9=1.-aF,dp9=uPxMax/26.,cap9=uPr.z>0.?uPr.z*dp9:4096.;\n'+
           'vA9=(uFx.x>0.?smoothstep(0.,uFx.x,ag9):1.)*(uFx.y>0.?smoothstep(0.,uFx.y,aF):1.);\n'+
           'if(uPr.y>0.)vA9*=smoothstep(uPr.x,uPr.y,-mvPosition.z);\n'+
           'gl_PointSize*=aR*mix(uFx.w,uFx.z,aF)*step(.0001,aF);\n',
        fh='varying float vA9;\n',fb;
    if(o.etire){
      sh.uniforms.uVc=PT_U.uVc;sh.uniforms.uStr=o.uStr;sh.uniforms.uG=o.uG;
      vh+='attribute vec3 aVel;uniform vec3 uVc;uniform float uStr;uniform float uG;varying vec4 vSt9;\n';
      fh+='varying vec4 vSt9;\n';
      vb+='float w9=min(gl_PointSize,cap9);\n'+
          'vec4 q9=projectionMatrix*modelViewMatrix*vec4(transformed+(aVel+vec3(0.,uG,0.)-uVc)*uStr,1.);\n'+
          'vec2 d9=vec2(0.);\n'+
          'if(q9.w>.05&&gl_Position.w>.05)d9=(q9.xy/q9.w-gl_Position.xy/gl_Position.w)*vec2(scale*projectionMatrix[1][1]/projectionMatrix[0][0],scale)*dp9;\n'+
          'float l9=min(length(d9),(uPr.w>0.?uPr.w:50.)*dp9);\n'+
          'vSt9=vec4(l9>.01?d9/max(length(d9),.0001):vec2(1.,0.),l9,w9);\n'+
          'gl_PointSize=(l9+w9)*step(.0001,aF);\n';
      // le TRAIT : une gélule (segment + bouts ronds) dans le carré du point, tête chaude, queue qui s'éteint, cœur qui blanchit
      fb='vec2 q9=(gl_PointCoord-.5)*(vSt9.z+vSt9.w);q9.y=-q9.y;\n'+
         'float al9=dot(q9,vSt9.xy),pe9=dot(q9,vec2(-vSt9.y,vSt9.x)),hw9=max(vSt9.w*.16,.7);\n'+
         'float d9=length(vec2(max(abs(al9)-vSt9.z*.5,0.),pe9))/hw9;\n'+
         'float h9=clamp(al9/(vSt9.z*.5+hw9)*.5+.5,0.,1.);\n'+
         'diffuseColor.a*=vA9*(1.-smoothstep(.15,1.,d9))*mix(.22,1.,h9*h9);\n'+
         'diffuseColor.rgb*=1.+.9*(1.-smoothstep(0.,.5,d9));\n';
    }else{
      vb+='gl_PointSize=min(gl_PointSize,cap9);\n';
      fb='#include <map_particle_fragment>\ndiffuseColor.a*=vA9;\n';
    }
    sh.vertexShader=vh+sh.vertexShader.replace('#include <logdepthbuf_vertex>',vb+'#include <logdepthbuf_vertex>');
    sh.fragmentShader=fh+sh.fragmentShader.replace('#include <map_particle_fragment>',fb);
  };
}
/* LES RÉSERVES AU REPOS NE COÛTENT PLUS RIEN (2026-09-26, vague 2 — audit GPU) : un emplacement JAMAIS né restait en (0,0,0) — et (0,0,0),
   c'est le DÉPART de chaque piste : la fumée de nuage, l'écume, les éclats de nuage et les réserves de l'explosion y étaient EMPILÉS (le
   « dôme / anneau » vu au départ), et chaque réserve coûtait un appel de dessin même vide (~20 par image). Désormais : (1) tout emplacement
   naît rangé sous le monde (y −99999), comme un mort ; (2) une réserve VIDE est `visible=false` — `spawnP` la rallume, `updatePool`
   l'éteint quand plus rien ne vit. ⚠ CHAUFFE : elle reste visible jusqu'à sa PREMIÈRE image dessinée (`chaud`, posé par onAfterRender) —
   c'est au menu que son programme se compile, jamais sur la première gerbe. `masque` : le masquage de `dbgPart('cache',…)` garde la main. */
function makePool(n,size,color,opacity,proche,fx){
  const pos=new Float32Array(n*3),vel=new Float32Array(n*3);
  for(let i=0;i<n;i++)pos[i*3+1]=-99999; // jamais née = rangée loin, comme une morte
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({size:size,color:color,transparent:true,opacity:opacity,depthWrite:false,map:puffTex,alphaTest:.02}));
  const P={mesh:m,pos:pos,vel:vel,life:new Float32Array(n),n:n,head:0,chaud:false,masque:false};
  m.onAfterRender=function(){P.chaud=true;delete m.onAfterRender;}; // dessinée une fois : programme compilé, elle peut dormir
  if(fx){ // PARTICULES v2 : fondu de vie, taille propre, trait étiré (voir plus haut)
    const fa=new Float32Array(n),ar=new Float32Array(n),va=fx.v==null?.45:fx.v;
    for(let i=0;i<n;i++){const h=Math.sin(i*12.9898+n*.731)*43758.5453;ar[i]=1-va*.5+va*(h-Math.floor(h));} // tirage FIXE (pas de Math.random : il décalerait l'aléatoire du jeu)
    g.setAttribute('aF',new THREE.BufferAttribute(fa,1));g.setAttribute('aR',new THREE.BufferAttribute(ar,1));
    if(fx.etire)g.setAttribute('aVel',new THREE.BufferAttribute(vel,3));
    // `proche` = le garde-objectif historique (26 px, fondu 3,5-8 m) ; `fx.pr` le règle à la main (l'explosion : grands, mais jamais un mur collé à l'objectif)
    const pr=fx.pr||(proche?[3.5,8,26,50]:[0,0,0,0]);
    const o={etire:!!fx.etire,uFx:{value:new THREE.Vector4().fromArray(fx.a||[0,0,1,1])},uPr:{value:new THREE.Vector4().fromArray(pr)},uStr:{value:fx.str||.04},uG:{value:0}};
    m.material.onBeforeCompile=ptShader(o);
    m.material.customProgramCacheKey=function(){return o.etire?'pt2E':'pt2';}; // DEUX programmes pour toutes les réserves v2 (le reste passe par des uniforms)
    P.fa=fa;P.l0=new Float32Array(n);P.fx=o;
  }else if(proche){m.material.onBeforeCompile=ptProche;m.material.customProgramCacheKey=function(){return 'ptProche';};}
  m.frustumCulled=false;scene.add(m);
  return P;
}
const dust=makePool(160,.4,0x9d95b6,.26,true,{a:[.2,.7,.55,2.6],v:.6,pr:[2.4,5,26,0]}); // (vague 2) plafond 36 → 26 px : la taille à l'écran est la MÊME pour tout (`PT_U.uPxMax`) // (particules v2) FUMÉE DE GLISSE : lavande claire et douce, elle NAÎT petite contre la roue, GONFLE et s'efface — plus de pastilles sombres à bord net. Garde-objectif resserré (2,4-5 m, 36 px au plus) : elle vit AUTOUR des roues arrière, à 4-5 m de la caméra (le 3,5-8 m l'effaçait entièrement), et ne peut toujours pas faire de dôme. // gomme mauve-nuit, discrète (les gros flocons beiges permanents, c'est fini) — (2026-09-26) 1,1 → .55 : collée à la roue, elle faisait un grand DISQUE mauve à l'écran
// (vague 2) `wisps` (brume de nuage le long de la caisse) SUPPRIMÉE : 150 points de 4,2 m jamais émis nulle part, un appel de dessin pour rien.
/* TRAITS D'AIR v2 (2026-09-26, passe graphique) : des segments gris à opacité fixe qui APPARAISSAIENT et DISPARAISSAIENT d'un coup
   (0,6 s, puis rien). Désormais chacun s'allume, vit et s'éteint (enveloppe sinus) et porte un DÉGRADÉ : l'extrémité qui vient vers
   la caméra est franche, l'autre s'efface — un filet d'air qui file, pas un bâton posé. Additif doux (couleurs par sommet), un seul
   appel de dessin comme avant, et plus de renvoi au GPU quand aucun trait ne vit. */
const streaks=(function(){
  const n=50,pos=new Float32Array(n*6),col=new Float32Array(n*6);
  for(let i=0;i<n;i++){pos[i*6+1]=pos[i*6+4]=-99999;}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const m=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  m.frustumCulled=false;scene.add(m);
  const o={mesh:m,pos:pos,col:col,life:new Float32Array(n),n:n,head:0,viv:false,chaud:false};
  m.onAfterRender=function(){o.chaud=true;delete m.onAfterRender;}; // (vague 2) chauffé au menu, puis il dort tant qu'aucun trait ne vit
  return o;
})();
function spawnStreak(x,y,z,dx,dy,dz){
  const i=streaks.head;streaks.head=(i+1)%streaks.n;streaks.mesh.visible=true;
  streaks.pos[i*6]=x;streaks.pos[i*6+1]=y;streaks.pos[i*6+2]=z;
  streaks.pos[i*6+3]=x+dx;streaks.pos[i*6+4]=y+dy;streaks.pos[i*6+5]=z+dz;
  streaks.life[i]=.6;
}
function updateStreaks(dt){
  let viv=false;const C=streaks.col;
  for(let i=0;i<streaks.n;i++)if(streaks.life[i]>0){viv=true;
    streaks.life[i]-=dt;
    if(streaks.life[i]<=0){streaks.pos[i*6+1]=-99999;streaks.pos[i*6+4]=-99999;C[i*6]=C[i*6+1]=C[i*6+2]=C[i*6+3]=C[i*6+4]=C[i*6+5]=0;continue;}
    const e=Math.sin(streaks.life[i]/.6*3.1416)*.34; // s'allume, file, s'éteint
    C[i*6]=.78*e;C[i*6+1]=.86*e;C[i*6+2]=1*e;             // l'extrémité ARRIÈRE (elle vient vers l'objectif) : franche, bleu d'air
    C[i*6+3]=.78*e*.08;C[i*6+4]=.86*e*.08;C[i*6+5]=e*.08; // l'avant s'efface
  }
  if(viv||streaks.viv){const at=streaks.mesh.geometry.attributes;at.position.needsUpdate=true;at.color.needsUpdate=true;}
  else if(streaks.chaud&&streaks.mesh.visible)streaks.mesh.visible=false; // (vague 2) aucun trait : aucun appel de dessin
  streaks.viv=viv;
}
const flames=makePool(150,1.8,0xff9030,.8,true,{a:[0,.55,1,.35],etire:1,str:.03,v:.5}); // (particules v2) des TRAITS de feu, étirés dans leur vitesse // braises (les GROSSES nappes, c'est fini : le plume mesh fait le spectacle)
flames.mesh.material.blending=THREE.AdditiveBlending;flames.mesh.material.map=sparkTex; // texture étincelle : fini les ballons
const flameCore=makePool(90,1.0,0xffe9a0,.9,true,{a:[0,.5,1,.4],etire:1,str:.026,v:.4}); // cœur chaud des braises (deux tons)
flameCore.mesh.material.blending=THREE.AdditiveBlending;flameCore.mesh.material.map=sparkTex;
const embers=makePool(120,.24,0xffb24a,.8,true,{a:[.06,.5,1,.45],etire:1,str:.05,v:.6});
const silBraises=makePool(180,.2,0xffb24a,.85,true,{a:[.06,.5,1,.45],etire:1,str:.05,v:.6}); // (sillage v6) les braises du SILLAGE (réserve à part : celle des flammes reste aux flammes) — même recette, même programme // braises fines qui s'échappent du feu et montent — (2026-09-25) .55 → .32 : près de la caméra une braise de .55 m faisait un rond de 200 px
embers.mesh.material.blending=THREE.AdditiveBlending;embers.mesh.material.map=sparkTex;
// ---------- EXPLOSION ----------
/* (vague 2, « L'ENCRE ET L'OR ») LES RÉSERVES DE L'EXPLOSION suivent les trois formes de la bible : le CORPS de la boule, ce sont les
   VOLUTES (panneaux ombrés, plus bas) ; ici il ne reste que des TRAITS (langues de feu, éclats, braises) et des BOUFFÉES de charbon.
   Les deux réserves de gros disques mous (orange 120 px, rouge 80 px) faisaient le VOILE orange plein écran et les TACHES rouges rondes
   qui traînaient sur la route à la fin : ce sont désormais des traits étirés dans leur vitesse. Taille plafonnée au plafond commun
   (26 px × résolution) pour TOUT, explosion comprise, et fondu sous 2-6 m de l'objectif. */
const boomPool=makePool(240,1.5,0xff7a24,1,false,{a:[0,.5,1,.45],etire:1,str:.03,v:.6,pr:[2,6,26,60]});boomPool.mesh.material.blending=THREE.AdditiveBlending; // LANGUES DE FEU : des traits orange FEU qui jaillissent du foyer
const smokePool=makePool(120,2.6,0x2e2428,.5,false,{a:[.14,.75,.6,1.7],v:.5,pr:[3.5,8,26,0]});smokePool.drag=1.1; // BOUFFÉES de CHARBON #2e2428 : la fumée FREINE et s'étale en montant
const boomRed=makePool(130,1.1,0xff3b2a,1,false,{a:[.03,.55,1,.5],etire:1,str:.03,v:.5,pr:[2,6,26,60]});boomRed.mesh.material.blending=THREE.AdditiveBlending; // éclats ROUGES (plus de ronds rouges posés sur la route)
const boomYel=makePool(130,1.3,0xffd94a,1,false,{a:[0,.5,1,.5],etire:1,str:.035,v:.5,pr:[1,4,26,60]});boomYel.mesh.material.blending=THREE.AdditiveBlending; // les éclats jaunes FILENT
const boomTom=makePool(170,1.05,0xa31212,1,false,{a:[0,.4,1,.8],etire:1,str:.025,v:.6,pr:[1,4,26,60]}); // sang : giclée dense de pixels rouge sombre MINUSCULES
// braises d'explosion : pixels chauds qui scintillent — rouges, puis orange et jaunes plus fins
const boomEmbR=makePool(70,.9,0xff3818,1,false,{a:[.05,.45,1,.5],etire:1,str:.045,v:.6,pr:[1,4,24,60]});boomEmbR.mesh.material.blending=THREE.AdditiveBlending;
const boomEmbO=makePool(55,.6,0xff8a20,1,false,{a:[.05,.45,1,.5],etire:1,str:.05,v:.6,pr:[1,4,20,60]});boomEmbO.acc=13;boomEmbO.mesh.material.blending=THREE.AdditiveBlending; // (2026-09-26) elles RETOMBENT en arc
const boomEmbY=makePool(45,.42,0xffd840,1,false,{a:[.05,.45,1,.5],etire:1,str:.05,v:.6,pr:[1,4,16,60]});boomEmbY.acc=16;boomEmbY.mesh.material.blending=THREE.AdditiveBlending;
const neonPool=makePool(90,1.6,0xff3ec8,1,false,{a:[.05,.6,1,.6],pr:[2,6,26,0]});neonPool.mesh.material.blending=THREE.AdditiveBlending; // Proto Néon
/* ---------- L'EXPLOSION v3 — « L'ENCRE ET L'OR » (2026-09-26, vague 2) ----------
   Verdict du directeur artistique : « du CARTON DÉCOUPÉ ». Les volutes étaient des AUTOCOLLANTS — des chou-fleurs orange PLATS (sprites
   non éclairés, dégradé radial blanc) posés dans une scène éclairée ; l'écran virait au BEIGE pendant 1-2 images (un cœur additif qui
   gonflait à 4 m de rayon à 5,5 m de l'objectif, trois tores OPAQUES de 2 m d'épaisseur, un flash beige à 95 %) ; et chaque mort
   fabriquait ~30 sprites et ~7 tores neufs (géométries + matières). Désormais :
   · les VOLUTES sont des PANNEAUX INSTANCIÉS (`mkPanneaux` : UN appel de dessin pour toute la boule, créés au chargement, chauffés au
     menu). Leur texture a du VOLUME : 4 silhouettes en chou-fleur dont chaque lobe est une petite sphère éclairée d'en haut à gauche,
     posées sur une grille de 2 texels — la langue pixel du HUD —, un TON par bloc (clair cuit · base · ombre · ENCRE #1c0430 en liseré
     bas-droit) et un cœur. Le shader teinte ces tons de la couleur de VIE (blanc brûlant → FEU #ff7a24 → rouge → CHARBON #2e2428) ;
     l'ombre, elle, tombe dans l'encre du monde. Triées de loin en près (mélange normal) ;
   · GARDE-OBJECTIF : opacité × smoothstep(2,5 → 6 m) de la caméra, le foyer des volutes RECULÉ de 2,4 m dans l'axe du regard (la
     poursuite est à ~5,5 m de la caisse) et la couronne qui s'ouvre vers le fond, jamais vers l'objectif : la boule se lit DE
     L'EXTÉRIEUR au lieu de peindre l'écran (mesuré : 3,5 → 8 m l'effaçait à 80 % les 100 premières ms) ;
   · les DARDS : 2e appel de dessin (additif), plus courts, plus fins, plus brefs — des TRAITS ;
   · les ONDES : trois anneaux-traits (la texture de l'onde au sol) créés UNE fois, qui filent en 0,32 s ; le cœur de lumière, ce sont
     les premières volutes (blanches, puis or). Plus aucun `new` côté image à l'explosion. */
const boomSpikeTex=(function(){ // ÉCLAT pointu : large à la base, fin à la pointe (les dards des références)
  const w=64,h=128,cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');
  x.beginPath();x.moveTo(w*.5,0);x.lineTo(w*.86,h*.72);x.lineTo(w*.5,h);x.lineTo(w*.14,h*.72);x.closePath();
  const g=x.createLinearGradient(0,h,0,0);
  g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.45,'rgba(255,208,110,.9)');g.addColorStop(1,'rgba(255,120,30,0)');
  x.fillStyle=g;x.fill();
  return new THREE.CanvasTexture(cv);
})();
/* LA TEXTURE DES VOLUTES : 4 chou-fleurs de 64 texels dans un atlas 2×2, cuits une fois. R = le TON (0 encre · .16 ombre profonde · .32 ombre
   · .62 base · .95 clair cuit), G = le cœur (qui brûle au premier tiers de la vie), A = la silhouette, en MARCHES de 2 texels. Filtrage
   « au plus proche » en grossissement : le bord reste un escalier de pixels, comme les plaques du HUD. Tirage FIXE (Math.random décalerait
   l'aléatoire du jeu, et les photos avant/après ne seraient plus comparables). */
const VOLU_TEX=(function(){
  const F=64,B=2,G=F/B,cv=document.createElement('canvas');cv.width=cv.height=F*2;
  const x=cv.getContext('2d'),im=x.createImageData(F*2,F*2),d=im.data;
  const Lx=-.56,Ly=.6,Lz=.57; // la lumière : en haut à gauche, un peu devant (repère des lobes : y vers le HAUT)
  let h9=40503;const rh=function(){h9=(h9*16807)%2147483647;return (h9-1)/2147483646;};
  const M=new Uint8Array(G*G),T=new Float32Array(G*G),C=new Float32Array(G*G);
  const ok=function(bx,by){return bx>=0&&by>=0&&bx<G&&by<G&&M[by*G+bx]>0;};
  for(let f=0;f<4;f++){
    const L=[{x:G*.5,y:G*.44,r:G*.3}],nl=6+(f&1); // un gros lobe + une couronne de lobes, plus gros en haut (le chou-fleur MONTE)
    for(let i=0;i<nl;i++){const a=(i/nl)*6.2832+rh()*.5+f*.7,rr=G*(.19+rh()*.06),up=Math.sin(a)>0;
      L.push({x:G*.5+Math.cos(a)*rr,y:G*.44+Math.sin(a)*rr*.92,r:G*(.13+rh()*.06)*(up?1.18:.82)});}
    M.fill(0);T.fill(0);C.fill(0);
    for(let by=0;by<G;by++)for(let bx=0;bx<G;bx++){
      const px=bx+.5,py=by+.5;let best=-1,bl=null;
      for(const l of L){const q=1-Math.hypot(px-l.x,py-l.y)/l.r;if(q>best){best=q;bl=l;}}
      if(best<=0)continue;const k=by*G+bx;M[k]=1;
      const nx=(px-bl.x)/bl.r,ny=(py-bl.y)/bl.r,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),lam=nx*Lx+ny*Ly+nz*Lz; // chaque lobe est une SPHÈRE
      T[k]=lam>.56?.95:lam>.26?.62:lam>-.04?.32:.16;
      const dc=Math.hypot(px-L[0].x,py-L[0].y)/(L[0].r*1.05);C[k]=dc<.45?1:dc<.8?.5:0;
    }
    for(let by=0;by<G;by++)for(let bx=0;bx<G;bx++) // le LISERÉ D'ENCRE : le bord bas-droit (côté ombre) — un bloc, deux texels
      if(M[by*G+bx]&&(!ok(bx+1,by)||!ok(bx,by-1)||!ok(bx+1,by-1)))T[by*G+bx]=0;
    const ox=(f&1)*F,oy=(f>>1)*F;
    for(let by=0;by<G;by++)for(let bx=0;bx<G;bx++){const k=by*G+bx;if(!M[k])continue;
      for(let yy=0;yy<B;yy++)for(let xx=0;xx<B;xx++){const o=((oy+F-1-(by*B+yy))*F*2+ox+bx*B+xx)*4; // le canvas a y vers le BAS
        d[o]=Math.round(T[k]*255);d[o+1]=Math.round(C[k]*255);d[o+2]=0;d[o+3]=255;}}
  }
  x.putImageData(im,0,0);
  const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;return t;
})();
/* LES PANNEAUX INSTANCIÉS : des quads face caméra (taille en mètres, rotation dans le plan de l'écran, ancrage au centre ou à la BASE,
   case d'atlas) dessinés en UN appel. Un seul programme pour les volutes, les dards et la pluie de devises (le mode passe par un uniform),
   chauffé au menu : le maillage reste visible jusqu'à sa première image dessinée (`chaud`), puis il dort tant que rien ne vit.
   `panPousse(o)` en fin d'image : renvoie au GPU les `o.cnt` premières instances (tableaux fixes, zéro allocation). */
const PAN_BASE=new THREE.PlaneGeometry(1,1);
const PAN_VS=['attribute vec3 iP;attribute vec4 iS;attribute vec4 iC;attribute vec2 iF;uniform vec2 uAt;',
  'varying vec2 vUv;varying vec4 vC;varying float vH;',
  'void main(){',
  '  vec4 mv=modelViewMatrix*vec4(iP,1.);',
  '  vec2 q=(position.xy+vec2(0.,iS.w*.5))*iS.xy;',                        // iS.w=1 : ancré par la BASE (le dard pousse hors du foyer)
  '  float c=cos(iS.z),s=sin(iS.z);mv.xy+=vec2(c*q.x-s*q.y,s*q.x+c*q.y);',  // face caméra, tourné dans le plan de l'écran
  '  gl_Position=projectionMatrix*mv;',
  '  vUv=(vec2(mod(iF.x,uAt.x),floor(iF.x/uAt.x))+uv)/uAt;vC=iC;vH=iF.y;}'].join('\n');
const PAN_FS=['uniform sampler2D uTex;uniform float uMode;uniform vec3 uInk;',
  'varying vec2 vUv;varying vec4 vC;varying float vH;',
  'void main(){',
  '  vec4 t=texture2D(uTex,vUv);float a=t.a*vC.a;if(a<.004)discard;',
  '  vec3 c;',
  '  if(uMode<.5){',                                                        // VOLUTE : r = le ton, g = le cœur
  '    vec3 l=vC.rgb,om=mix(l*.35,uInk,.6);',                               // l'ombre tombe dans l'ENCRE du monde
  '    c=mix(om,l,smoothstep(.2,.55,t.r));',                                  // ombre profonde · ombre · base : trois marches franches
  '    c=mix(c,l*1.55+vec3(.18,.14,.07),smoothstep(.7,.92,t.r));',           // le clair CUIT en haut à gauche
  '    c=mix(uInk,c,smoothstep(.03,.1,t.r));',                               // le liseré d'encre
  '    c=mix(c,vec3(1.35,1.18,.92),vH*t.g);',                                // le cœur qui brûle encore (> 1 : le bloom le prend)
  '  }else c=vC.rgb*t.rgb;',                                                  // DARD, DEVISE : la texture teintée
  '  gl_FragColor=vec4(c,a);}'].join('\n');
function mkPanneaux(n,tex,cols,rows,additif,mode,ordre){
  const g=new THREE.InstancedBufferGeometry();
  g.setIndex(PAN_BASE.index);g.setAttribute('position',PAN_BASE.attributes.position);g.setAttribute('uv',PAN_BASE.attributes.uv);
  const o={n:n,cnt:0,chaud:false,P:new Float32Array(n*3),S:new Float32Array(n*4),C:new Float32Array(n*4),F:new Float32Array(n*2)};
  o.at=[['iP',o.P,3],['iS',o.S,4],['iC',o.C,4],['iF',o.F,2]].map(function(q){
    const a=new THREE.InstancedBufferAttribute(q[1],q[2]);a.setUsage(THREE.DynamicDrawUsage);g.setAttribute(q[0],a);return a;});
  g.instanceCount=0;
  const m=new THREE.ShaderMaterial({uniforms:{uTex:{value:tex},uAt:{value:new THREE.Vector2(cols,rows)},uMode:{value:mode},uInk:{value:new THREE.Color(0x1c0430)}},
    vertexShader:PAN_VS,fragmentShader:PAN_FS,transparent:true,depthWrite:false,fog:false,blending:additif?THREE.AdditiveBlending:THREE.NormalBlending});
  const me=new THREE.Mesh(g,m);me.frustumCulled=false;me.renderOrder=ordre||3;
  me.onAfterRender=function(){o.chaud=true;delete me.onAfterRender;};
  scene.add(me);o.mesh=me;o.g=g;
  return o;
}
function panPousse(o){
  const n=o.cnt;o.g.instanceCount=n;
  if(n>0)for(let i=0;i<o.at.length;i++)o.at[i].needsUpdate=true;
  const v=n>0||!o.chaud;if(o.mesh.visible!==v)o.mesh.visible=v;
}
const VOLU_N=34,VOLU=[],VOLU_ORD=[],DARD_N=22,DARD=[]; // (2026-10-15, L'IMPACT) 26 → 34 et 16 → 22 : les RÉPLIQUES du cratère (des mini-boules) ont leurs cases à côté de la grande
for(let i=0;i<VOLU_N;i++){VOLU.push({on:false,t:0,life:1,x:0,y:0,z:0,vy:0,dx:0,dz:0,r0:1,r1:2,f:0,d2:0,cu:0,fu:null,dr:0});VOLU_ORD.push(null);}
for(let i=0;i<DARD_N;i++)DARD.push({on:false,t:0,life:1,len:1,wid:1,rot:0,dx:0,dy:0,dz:0,ox:0,oy:0,oz:0,vx:0,vy:0,vz:0,dr:0,da:null});
const PAN_VOL=mkPanneaux(VOLU_N,VOLU_TEX,2,2,false,0,3),PAN_DARD=mkPanneaux(DARD_N,boomSpikeTex,1,1,true,1,4);
const BOOM_HOT=new THREE.Color(0xfff4d0),BOOM_OR=new THREE.Color(0xffc640),BOOM_MID=new THREE.Color(0xff7a24),BOOM_COLD=new THREE.Color(0xb3160c); // blanc brûlant → or → FEU → rouge
const bpTmpC=new THREE.Color(),bvA=new THREE.Vector3();
// LA FUMÉE : en fin de vie, la volute vire au CHARBON (le feu retombe en fumée noire) — ce contraste feu/suie fait « dessin »
const BOOM_SMOKE=new THREE.Color(0x2e2428);
/* (2026-10-15) LA TEINTE DE LA BOULE : `feu` = celle de l'airtime, pour TOUTES les morts (Sacha, le soir même : « il faut que ça soit la
   MÊME animation » — la matière par obstacle de l'après-midi, bois · roche · glace · lave…, est retirée, voir L'IMPACT). fu = fumée de fin de vie · da = dards (rgb 0-1) */
const BOOM_MAT={
  feu:  {fu:0x2e2428,da:[1,.816,.541]}
};
for(const k in BOOM_MAT)BOOM_MAT[k].fuC=new THREE.Color(BOOM_MAT[k].fu);
