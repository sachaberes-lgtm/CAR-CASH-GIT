/* ================= LE PLAN DE LA MORT (vague 3, 2026-09-27) =================
   Sacha : « l'explosion quand tu meurs doit être mieux cadrée ». Mesuré avant (390×844, `dbgBoomCam`) : c'était la POURSUITE figée —
   7 à 14 m du foyer selon la vitesse, le grand-angle de la vitesse (129° en portrait : la boule tordue au ras du bitume, les débris
   plein cadre devant), le haut de l'écran restait celui de la caisse (sous la dalle ou en vrille : on mourait dans un monde À L'ENVERS,
   et sous la route la boule était CACHÉE par la dalle), et la secousse jetait la caméra de ±0,5 m à CHAQUE image. Désormais un vrai
   PLAN, le même au sol, en vol, sous la route, dans la VILLE, en ORBITE, à 100 comme à 1500 km/h :
     · la caméra part de la poursuite et RECULE d'un trait (0,55 s) jusqu'à ~14 m, puis continue en travelling arrière lent et en orbite
       douce jusqu'à l'écran de mort — jamais d'arrêt sec, jamais de dérive, jamais dans la fumée ;
     · elle garde l'azimut de la poursuite (le point de vue du joueur), un peu AU-DESSUS du plan de la route (elle ne traverse jamais le
       bitume) ; en vol loin de toute dalle : un peu au-dessus de l'horizon ;
     · le monde se remet À L'ENDROIT (haut de l'écran = le ciel). Mort retourné (dessous, vrille) : la bascule se fait d'un coup, sur
       l'éclair de l'explosion — un raccord de montage plutôt qu'un tonneau ;
     · un objectif de plan (70°, élargi portrait par fovPor ≈ 92°) au lieu du grand-angle de la vitesse ;
     · la visée suit le centre VISUEL de la boule, qui MONTE : la boule reste au milieu de la zone libre de l'écran — sous le HUD du haut
       et ses bandeaux, au-dessus du pouce et du bouton NITRO ;
     · la secousse devient un TREMBLEMENT lisse (deux sinus qui s'éteignent) appliqué à la visée : l'image vibre, la caméra ne saute plus ;
     · garde-fous : recul raccourci si une TOUR de la VILLE barre le chemin, caméra tenue hors de la dalle.
   Aucun ralenti (verdict Sacha) : c'est la même seconde huit, cadrée. Zéro allocation par image (vecteurs et quaternions à demeure). */
const BOOM_CAM={
  DIST:14,       // m — le recul du plan : la boule (~9 m) tient près de la moitié de la largeur en portrait, gerbe et débris autour
  DIST_FIN:17,   // m — le travelling arrière continue, lentement, jusque-là (fin de la mort, 1,8 s)
  SITE:16,       // ° — hauteur du regard au-dessus du plan de la route (en vol : de l'horizon) — la boule se lit de l'extérieur, la route sert de sol
  ORBITE:7,      // °/s — la lente rotation autour du foyer : le plan vit sans que le cadre bouge
  FOV:70,        // ° — l'objectif du plan, AVANT l'élargissement portrait (fovPor)
  ENTREE:.55,    // s — le recul « d'un trait » depuis la poursuite (sortie cubique : vif puis posé)
  VISEE:2.6,     // m — la visée au-dessus du foyer : le cœur de la boule tombe un peu SOUS le milieu de l'écran (les bandeaux du haut restent libres)
  VISEE_MONTE:1.2, // m/s — … et elle suit les volutes qui montent (panoramique vertical lent)
  TREMBLE:.09,   // m de visée par unité de `shake`, à 18 m : ~1° de tremblement au plus fort
  COUPE:-.17,    // si le haut de l'écran pointait à plus de ~100° du ciel : raccord sur l'éclair (cos de l'angle)
  /* SOUS LA ROUTE, ON FILME PAR-DESSUS : les volutes montent vers le CIEL (Y monde, quelle que soit la face) — sous la dalle elles
     s'y enfoncent aussitôt, et d'en dessous on ne voyait que des étincelles (mesuré, avant comme après). Vue de dessus, la boule PERCE la
     route : elle se lit en entier. ⚠ Si un jour les volutes montent selon la normale de la face, repasser à false (plan d'en dessous). */
  DESSOUS_PAR_DESSUS:true,
  n:new THREE.Vector3(),az:new THREE.Vector3(),d0:new THREE.Vector3(),u0:new THREE.Vector3(),dir:new THREE.Vector3(),v:new THREE.Vector3(),
  w:new THREE.Vector3(),ao:new THREE.Vector3(),rp:new THREE.Vector3(),rt:new THREE.Vector3(),rn:new THREE.Vector3(),Y:new THREE.Vector3(0,1,0),
  q:new THREE.Quaternion(),qa:new THREE.Quaternion(),F:{p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},
  m0:'drive',pret:false,r0:10,f0:90,dMax:22,sRef:0,cote:1,sens:1,coupe:false,
  /* (2026-10-15) L'IMPACT : contre un MUR, le plan se met de TROIS-QUARTS (TROIS_QUARTS ° de la normale de la paroi, du côté où la poursuite
     traînait déjà) — de face, la boule n'était qu'un disque sur un fond uni, on ne lisait pas « je me suis écrasé contre un mur » ; de biais,
     la paroi fuit, le cratère se lit, la boule s'y écrase et les pièces en rebondissent. L'orbite referme lentement l'angle. Contre le
     SOL, le regard monte de SITE_SOL ° de plus : le cratère se lit d'en haut. */
  TROIS_QUARTS:40,SITE_SOL:14,siteImp:0
};
function boomCamDir(t,out){ // la direction foyer → caméra à l'instant t : l'azimut qui orbite, relevé du SITE
  const C=BOOM_CAM,a=C.sens*C.ORBITE*t*Math.PI/180,e=(C.SITE+C.siteImp)*Math.PI/180;
  C.w.crossVectors(C.n,C.az); // l'axe latéral du plan
  out.copy(C.az).multiplyScalar(Math.cos(a)).addScaledVector(C.w,Math.sin(a)).multiplyScalar(Math.cos(e)).addScaledVector(C.n,Math.sin(e));
  return out.normalize();
}
function boomCamInit(){ // au PREMIER pas de la mort (la poursuite de cette image est déjà posée)
  const C=BOOM_CAM;C.pret=true;
  C.r0=Math.max(2,camera.position.distanceTo(boomPos));
  C.d0.subVectors(camera.position,boomPos).multiplyScalar(1/C.r0);
  C.u0.copy(camera.up).normalize();C.f0=camera.fov;C.coupe=C.u0.y<C.COUPE;
  // la route de référence : celle qu'on roulait, ou la plus proche en vol — et de quel côté de la dalle meurt-on ?
  C.sRef=C.m0==='drive'?s:lastNearS;frameAt(C.sRef,C.F);C.rp.copy(C.F.p);C.rt.copy(C.F.t);C.rn.copy(C.F.n);
  C.v.subVectors(boomPos,C.rp);const hB=C.v.dot(C.rn),sol=C.m0==='drive'||(Math.abs(hB)<12&&Math.abs(C.v.dot(C.F.b))<ROAD_HALF+6); // au sol, ou en vol au ras d'une dalle
  let cote=C.m0==='drive'?(side<0?-1:1):(hB>-THICK*.5?1:-1);
  C.ao.set(0,C.VISEE,0);
  if(sol&&cote<0&&C.DESSOUS_PAR_DESSUS){cote=1;C.ao.addScaledVector(C.rn,THICK);} // la boule perce la dalle : on la vise là où elle sort
  C.cote=cote; // le côté de la dalle où la caméra doit rester
  if(sol)C.n.copy(C.rn).multiplyScalar(cote);else C.n.copy(C.Y); // le « sol » du plan : la face de la dalle ; en plein ciel, l'horizon
  C.az.copy(C.d0).addScaledVector(C.n,-C.d0.dot(C.n)); // l'azimut de la poursuite, couché dans ce sol
  if(C.az.lengthSq()<1e-3)C.az.copy(C.rt).negate().addScaledVector(C.n,C.rt.dot(C.n)); // (poursuite pile à l'aplomb : on se met derrière)
  C.az.normalize();C.w.crossVectors(C.n,C.az);C.sens=C.d0.dot(C.w)<0?-1:1; // l'orbite prolonge le côté où la poursuite traînait déjà
  C.siteImp=0;
  if(IMP.on){C.v.copy(IMP.n).addScaledVector(C.n,-IMP.n.dot(C.n)); // (L'IMPACT) la normale de la paroi, couchée dans le sol du plan
    if(Math.abs(IMP.n.dot(C.n))<.75&&C.v.lengthSq()>.04){C.v.normalize();C.rn.crossVectors(C.n,C.v); // un MUR : trois-quarts
      const sg=C.az.dot(C.rn)<0?-1:1,a9=C.TROIS_QUARTS*Math.PI/180;
      C.az.copy(C.v).multiplyScalar(Math.cos(a9)).addScaledVector(C.rn,Math.sin(a9)*sg).normalize();C.sens=-sg;}
    else C.siteImp=C.SITE_SOL;} // le SOL : on monte
  // LA VILLE : si une tour est dans l'axe, le recul s'arrête avant (rayon au début et à la fin de l'orbite)
  C.dMax=C.DIST_FIN;
  const T9=IMP.on&&IMP.test?IMP.test:CITY.col&&CITY.root?villeHeurt:null; // (2026-10-15, L'IMPACT) l'obstacle de la carte, quel qu'il soit (pas seulement les tours)
  if(T9)for(let k=0;k<2;k++){boomCamDir(k*1.8,C.dir);
    for(let d=4;d<=C.DIST_FIN;d+=2){C.v.copy(boomPos).add(C.ao).addScaledVector(C.dir,d);if(T9(C.v)){C.dMax=Math.min(C.dMax,Math.max(6,d-3));break;}}}
}
function boomCamTick(dt){
  const C=BOOM_CAM;if(!C.pret)boomCamInit();
  const t=boomT,e=1-Math.pow(1-Math.min(1,t/C.ENTREE),3);
  boomCamDir(t,C.dir);
  C.q.setFromUnitVectors(C.d0,C.dir);C.qa.identity().slerp(C.q,e); // la direction glisse de la poursuite au plan (sur la sphère : jamais à travers le foyer)
  const D=Math.min(C.dMax,C.DIST+(C.DIST_FIN-C.DIST)*Math.min(1,t/1.8)),r=C.r0+(D-C.r0)*e;
  camera.position.copy(boomPos).addScaledVector(C.v.copy(C.d0).applyQuaternion(C.qa),r);
  // HORS DE LA DALLE : la caméra reste de son côté, à 1,3 m au moins du bitume
  {const sc=THREE.MathUtils.clamp(C.sRef+C.v.subVectors(camera.position,C.rp).dot(C.rt),0,L-.01);frameAt(sc,C.F);
   C.v.subVectors(camera.position,C.F.p);const h=C.v.dot(C.F.n);
   if(Math.abs(C.v.dot(C.F.b))<ROAD_HALF+1.5&&C.v.lengthSq()<3600){
     if(C.cote>0&&h<1.3)camera.position.addScaledVector(C.F.n,1.3-h);
     else if(C.cote<0&&h>-THICK-1.3)camera.position.addScaledVector(C.F.n,-(h+THICK+1.3));}}
  // le ciel en haut de l'écran : raccord net si l'on mourait retourné, sinon la tête se redresse avec le recul
  if(C.coupe||e>=1)camera.up.copy(C.Y);else camera.up.copy(C.u0).lerp(C.Y,e).normalize();
  const fT=fovPor(C.FOV),f=C.f0+(fT-C.f0)*e;if(Math.abs(camera.fov-f)>.01){camera.fov=f;camera.updateProjectionMatrix();}
  C.v.copy(boomPos).add(C.ao);C.v.y+=C.VISEE_MONTE*t;
  if(shake>0){ // TREMBLEMENT lisse sur la visée (et plus sur la position) : il s'éteint en ~0,9 s
    const a=REDUCED_MOTION||window.dbgNoShake?0:shake*C.TREMBLE*r/18;C.w.subVectors(C.v,camera.position).cross(C.Y); // (2026-09-30) « Réduire les animations » : le plan de la mort ne tremble pas (la secousse s’éteint quand même, elle ne déborde pas sur la partie suivante) ; dbgNoShake comme les autres plans
    if(C.w.lengthSq()>1e-6)C.w.normalize();
    C.v.addScaledVector(C.w,Math.sin(t*47)*a).addScaledVector(C.Y,Math.sin(t*37+1.3)*a*.8);
    shake=Math.max(0,shake-3*dt);}
  camera.lookAt(C.v);
}
// ---------- SIGNATURES D'EXPLOSION : chaque caisse meurt à sa façon ----------
const heartTex=(function(){ // cœur rose (COMÈTE)
  const cv=document.createElement('canvas');cv.width=cv.height=64;
  const c=cv.getContext('2d');
  c.fillStyle='#ff4d88';c.shadowColor='#ff4d88';c.shadowBlur=10;
  c.beginPath();
  c.moveTo(32,54);c.bezierCurveTo(6,34,10,10,32,22);c.bezierCurveTo(54,10,58,34,32,54);
  c.fill();
  return new THREE.CanvasTexture(cv);
})();
function mkCaneS(){ // la canne du gentleman
  const g=new THREE.Group();
  const wood=new THREE.MeshPhongMaterial({color:0x6b4a26,shininess:80,specular:0xd0b090});
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,1.5,8),wood);g.add(shaft);
  const hook=new THREE.Mesh(new THREE.TorusGeometry(.17,.05,6,12,Math.PI),wood);hook.position.y=.78;g.add(hook);
  const tip=new THREE.Mesh(new THREE.CylinderGeometry(.065,.05,.12,8),new THREE.MeshPhongMaterial({color:0xd8c060,shininess:200}));
  tip.position.y=-.78;g.add(tip);
  return g;
}
function mkPipeS(){ // …et sa pipe
  const g=new THREE.Group();
  const wood=new THREE.MeshPhongMaterial({color:0x5a3a20,shininess:90,specular:0xc0a080});
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.13,.10,.2,10),wood);g.add(bowl);
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.55,6),wood);
  stem.rotation.z=Math.PI/2;stem.position.set(.32,.06,0);g.add(stem);
  return g;
}
function mkPhoneS(){ // le téléphone (écran qui luit)
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(.34,.03,.68),
    new THREE.MeshPhongMaterial({color:0x14161c,shininess:220,specular:0xffffff,envMap:envTex,reflectivity:.4}));
  g.add(body);
  const scr=new THREE.Mesh(new THREE.BoxGeometry(.30,.012,.60),new THREE.MeshBasicMaterial({color:0x66d8ff}));
  scr.position.y=.02;g.add(scr);
  return g;
}
function mkIngotS(){ // lingot d'or
  return new THREE.Mesh(new THREE.BoxGeometry(.5,.16,.24),
    new THREE.MeshPhongMaterial({color:0xffd040,emissive:0x8a5e00,emissiveIntensity:.4,shininess:320,specular:0xffffff,envMap:envTex,reflectivity:.75}));
}
function mkDiamS(){ // diamant bleu vif brillant
  return new THREE.Mesh(new THREE.OctahedronGeometry(.22),
    new THREE.MeshPhongMaterial({color:0x55c8ff,emissive:0x1560ff,emissiveIntensity:.7,shininess:400,specular:0xffffff,envMap:envTex,reflectivity:.9,transparent:true,opacity:.92}));
}
/* (vague 2) LES ÉCLATS NE FONCENT PLUS SUR L'OBJECTIF : la poursuite est à ~5,5 m du foyer — un débris lancé vers elle la frôlait en
   ~0,2 s et devenait une PLAQUE ORANGE plein écran (le « carton » des captures). La composante qui file vers la caméra est renvoyée
   vers l'avant (miroir sur l'axe du regard, à plat) ; la gerbe reste aussi large, elle s'ouvre DEVANT nous. */
const dbC=new THREE.Vector3(),dbS=new THREE.Vector3(),dbBox=new THREE.Box3();
function debrisLoin(v){
  dbC.subVectors(boomPos,camera.position);dbC.y=0;const l=dbC.length();if(l<1e-3)return v;dbC.multiplyScalar(1/l);
  const k=v.x*dbC.x+v.z*dbC.z;if(k<0){v.x-=2*k*dbC.x;v.z-=2*k*dbC.z;}
  return v;
}
function signatureBoom(lvl){
  const toss=(m,sp,part)=>{ // éjection « logique » : vers l'extérieur et vers le haut, en tournoyant — `part` : matière/géométrie PARTAGÉES (ni éteintes ni jetées au ménage)
    const a=Math.random()*Math.PI*2;
    m.position.copy(boomPos);m.position.y+=.4;
    debris.push({m:m,v:debrisLoin(new THREE.Vector3(Math.cos(a)*(5+Math.random()*sp),8+Math.random()*10,Math.sin(a)*(5+Math.random()*sp))),
      rx:(Math.random()-.5)*11,ry:(Math.random()-.5)*11,part:part});
    scene.add(m);
  };
  // ⚠ REMAPPÉ SUR LA GAMME DES SIX (2026-09-24) : ce tableau datait de l'ère des 24, ses index ne
  // désignaient plus rien. Chaque caisse perd ce qui la caractérise — l'argent, surtout.
  //             idx : 0 HONTE · 1 ELDORADO · 2 CAÏD · 3 MAJESTÉ · 4 ROSSO · 5 POSTER
  const bonusBills=[0,12,16,26,20,40][lvl]||0; // billets garantis par modèle
  for(let k=0;k<bonusBills;k++)spawnBill(boomPos,
    new THREE.Vector3((Math.random()-.5)*20,7+Math.random()*15,(Math.random()-.5)*20),1.8+Math.random()*1.6);
  if(lvl===1){toss(mkCaneS(),9);toss(mkPipeS(),8);}           // ELDORADO : la canne et la pipe du parrain
  if(lvl===2)toss(mkPhoneS(),10);                             // LE CAÏD : le téléphone
  if(lvl===1||lvl===3||lvl===4||lvl===5){                     // lingots : l'Eldorado (la cité d'or), la Rolls, la Ferrari, le poster
    const n=lvl===5?5:(lvl===3?4:3);
    for(let k=0;k<n;k++)toss(mkIngotS(),11);
  }
  if(lvl===3||lvl===5){                                       // diamants : SA MAJESTÉ, POSTER 84
    const n=lvl===5?6:4;
    for(let k=0;k<n;k++)toss(mkDiamS(),13);
  }
  if(lvl===-1){ // (l'explosion néon du PROTO — sans caisse depuis 2026-09-24, gardée pour un futur modèle) // PROTO NÉON : explosion bizarroïde rose/cyan
    for(let k=0;k<90;k++){
      const a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1),sp2=6+Math.random()*24;
      spawnP(neonPool,boomPos.x,boomPos.y,boomPos.z,
        Math.sin(b)*Math.cos(a)*sp2,Math.cos(b)*sp2*.8+3,Math.sin(b)*Math.sin(a)*sp2,.5+Math.random()*.8);
    }
    sparkBurst(sparkBlue,boomPos,40,26);
  }
  if(lvl===5){ // POSTER 84, la couronne : le final total — cœurs, eau, champignon
    for(let k=0;k<6;k++){
      const h=new THREE.Sprite(new THREE.SpriteMaterial({map:heartTex,transparent:true,depthWrite:false}));
      h.scale.set(1.3,1.3,1);h.position.copy(boomPos);
      skulls.push({m:h,v:new THREE.Vector3((Math.random()-.5)*12,10+Math.random()*9,(Math.random()-.5)*12),
        rs:(Math.random()-.5)*7,life:2.4});
      scene.add(h);
    }
    sparkBurst(sparkBlue,boomPos,60,30); // l'EAU gicle contre le feu
    for(let k=0;k<50;k++){ // colonne de champignon (fission)
      spawnP(smokePool,boomPos.x+(Math.random()-.5)*2,boomPos.y+k*.25,boomPos.z+(Math.random()-.5)*2,
        (Math.random()-.5)*2,6+Math.random()*5,(Math.random()-.5)*2,1.4+Math.random()*.8);
    }
  }
  /* (2026-09-30) LES RÉCOMPENSES DES CAMPAGNES MEURENT À LEUR FAÇON — elles mouraient comme LA HONTE (les signatures sont indexées 0..5).
     Reconnues par leur FORME, jamais par un index (la gamme bouge). Rien de neuf pour le GPU : le lingot lance des lingots taillés dans
     SA matière (LINGOT_MAT, celle de la caisse qu'on voit exploser : programme déjà lié ; `part` : elle n'est ni éteinte ni jetée au
     ménage) sur UNE géométrie partagée ; la caisse-nuage crève dans les réserves de ouate (cloudBits, foam). */
  const sh9=(CARS[lvl]||{}).shape;
  if(sh9==='lingot'){ // LE LINGOT : la réserve d'or saute — lingots en gerbe, pluie de billets, étincelles d'or
    if(!signatureBoom.lgG){const g=lingotGeo();g.translate(0,-.475,0);g.scale(.12,.16,.12);signatureBoom.lgG=g;} // 24 × 15 × 50 cm, née à la 1re mort du lingot, gardée
    for(let k=0;k<8;k++)toss(new THREE.Mesh(signatureBoom.lgG,LINGOT_MAT),12,true);
    for(let k=0;k<36;k++)spawnBill(boomPos,new THREE.Vector3((Math.random()-.5)*22,8+Math.random()*16,(Math.random()-.5)*22),1.9+Math.random()*1.6);
    sparkBurst(sparkGold,boomPos,40,22);
  }
  if(sh9==='nuage'){ // LA CAISSE-NUAGE : elle CRÈVE — la ouate éclate en mille bouts, une bouffée plus haut, un voile de brume qui s'étale
    shatterCloud(boomPos,1.6);
    tmp3.copy(boomPos);tmp3.y+=1.8;shatterCloud(tmp3,.8);
    for(let k=0;k<16;k++){const a=Math.random()*6.2832,sp=2+Math.random()*5;
      spawnP(foam,boomPos.x+Math.cos(a)*1.5,boomPos.y+.6+Math.random(),boomPos.z+Math.sin(a)*1.5,Math.cos(a)*sp,.6+Math.random()*1.8,Math.sin(a)*sp,1+Math.random()*.8);}
  }
}
// LES MORTS NE SE RESSEMBLENT PLUS : 5 signatures d'explosion tirées au sort (couleurs + forme + son)
const BOOM_VARS=[
  {n:'FEU',    r1:0xffd080,r2:0xff5e2e,li:0xff9540,fl:'#ffd9a0',sk:0xffd75e,rings:3,pitch:1.0},
  {n:'PLASMA', r1:0xbfe8ff,r2:0x2e9bff,li:0x50c8ff,fl:'#cfeaff',sk:0x5ee6ff,rings:5,pitch:1.6},
  {n:'ACIDE',  r1:0xe6ff9a,r2:0x6ee23a,li:0x9dff50,fl:'#e4ffc0',sk:0xbfff5e,rings:2,pitch:1.3},
  {n:'VICE',   r1:0xffc0ea,r2:0xff2e9b,li:0xff3ec8,fl:'#ffc8ee',sk:0xff7ad5,rings:4,pitch:0.8},
  {n:'GLACE',  r1:0xd8f4ff,r2:0x7ab8e8,li:0x9fd8ff,fl:'#e8f8ff',sk:0xcfeaff,rings:6,pitch:2.0}
];
let BOOMV=BOOM_VARS[0];
/* ---- LES MORTS PAR NIVEAU (2026-09-30) — une MESURE, jamais un affichage ------------------------------------------------------
   Aucun chiffre ne disait OÙ l'on meurt : le cycle a six niveaux et leur difficulté se réglait au ressenti. Chaque mort RÉELLE (l'explosion
   qui mène à l'écran de fin : ni l'auto-école, ni le bac à sable, ni le parc) compte dans
   `SAVE.d.ex.morts[niveau][cause]`, et le temps de course dans `SAVE.d.ex.temps[niveau]` (secondes RÉELLES : pause, explosion et ralenti
   de frénésie n'y changent rien). Clé : l'id + sa variante (`ville-nuit`, `espace-hard`), `ecole` (la piste de la leçon, roulée après le
   permis), `c-<id>-<n>` en carrière (ses niveaux ne se mêlent pas au cycle). Le temps s'accumule en MÉMOIRE et se verse au changement de
   niveau, à la mort, à la fin de partie et toutes les 20 s (SAVE.mark : c'est le filet des 30 s qui écrit). `dbgMorts()` lit tout ça. */
const MORTS={c:null,k:'',t:0};
function mortsCle(c){if(!c)return '';if(c.piste==='tuto')return 'ecole';return c.id+(c.crypto?'-crypto':'')+(c.vitre?'-vitre':'')+(c.nuit?'-nuit':'');}
function mortsEx(){const E=SAVE.d.ex;if(!E.morts||typeof E.morts!=='object')E.morts={};if(!E.temps||typeof E.temps!=='object')E.temps={};return E;}
function mortsVerse(){if(MORTS.k&&MORTS.t>0){const T=mortsEx().temps;T[MORTS.k]=Math.min(1e8,Math.round(((T[MORTS.k]||0)+MORTS.t)*10)/10);SAVE.mark();}MORTS.t=0;}
function mortsSuit(){if(LVL.cur!==MORTS.c){mortsVerse();MORTS.c=LVL.cur;MORTS.k=mortsCle(LVL.cur);}} // la clé se calcule UNE fois par niveau (zéro chaîne par image)
function mortsHors(){return PARK.on||SANDBOX||TUTO.on;} // parc, bac à sable, leçon : on n'y meurt pas pour de vrai
function mortsTick(dt){if(!started||mode==='boom'||mortsHors())return;mortsSuit();if(MORTS.k){MORTS.t+=dt;if(MORTS.t>20)mortsVerse();}} // chaque image de course (porte de sim de loop : pause exclue)
function mortsCompte(cause){ // une mort RÉELLE (explode)
  if(mortsHors())return;mortsSuit();const k=MORTS.k;if(!k)return;
  const M=mortsEx().morts,c=/^[a-z]{1,12}$/.test(cause)?cause:'autre',o=M[k]||(M[k]={});
  o[c]=Math.min(1e6,(o[c]|0)+1);mortsVerse();SAVE.mark();}
let mortCause=''; // (2026-09-26, audit UX) POURQUOI on est mort — dit sous GAME OVER : une mort comprise donne envie de rejouer
/* (2026-09-30) LA PARTIE BAT-ELLE UN RECORD ? Les TROIS de l'écran de mort (mFill) : l'ARGENT (montants bruts ; 1,61 $ n'en est pas un),
   l'AURA battue en course (CHA.recB), le MOTEUR (un palier jamais atteint avant cette partie). explode s'en sert pour ne pas se moquer
   d'une partie que l'écran de mort va couronner « NOUVEAU RECORD ! ». */
function partieRecord(){try{return !SANDBOX&&((money>(RUNX.best0||0)&&money>START_CASH+.5)||!!CHA.recB||engTier>(RUNX.engAvant|0));}catch(e){return false;}}
// console : dbgExplo(cause) → la mort par cette cause, SANS impact (la boule de l'airtime) — un vrai choc contre une paroi : dbgImpact()
window.dbgExplo=function(c){const v=+PT_U.uVc.value.length().toFixed(1),m=mode;
  explode(c);
  return {avant:m,v:v,volutes:VOLU.filter(function(p){return p.on;}).length,dards:DARD.filter(function(p){return p.on;}).length,debris:debris.length};};
function explode(cause){dmtCoupe();
  try{slideRaz();}catch(e){} // (SLIDE) le frottement part avec la caisse
  try{bkSkateRaz();}catch(e){} // (ICE SKATE) la glisse aussi
  if(chanceProtege(cause))return; // (2026-10-14) LA SECONDE CHANCE : le bouclier de la reprise (voir CHANCE)
  RALENTI.t=0; // (passe qualité) le ralenti de la frénésie s'arrête net à l'explosion : sinon le plan de la mort passait à ×0,3 et l'écran de fin arrivait 2× plus tard
  if(!(gameOver||mode==='boom'))hautVide(); // (vague 2) la caisse explose : plus AUCUNE voix (carte, niveau, geste) — seule « CHAÎNE PERDUE » peut parler
  chainePerdue(true); // (aura v2) la chaîne ouverte part avec la caisse
  if(gameOver||mode==='boom')return;
  mortCause=cause||'';
  try{mortsCompte(mortCause);}catch(e){}try{m2Mort(mortCause);}catch(e){} /* (2026-10-16) LES MISSIONS v2 : morts, les secrètes de la mort */ // (2026-09-30) la mesure des morts par niveau (voir MORTS)
  flowReset();try{flowTick(0);}catch(e){} // le crash VIDE le flow
  /* (2026-09-30) LA MUSIQUE MEURT AVEC LA CAISSE : le tape-stop partait d'endGame, 1,8 s APRÈS l'explosion — toute la boule de feu se
     jouait sur la bande à plein (sur iPhone `el.volume` est verrouillé et `duckT` ne creuse que le WebAudio) : le son de mort, la voix
     et le son de cause passaient DESSOUS. Il part ici, sur l'image du crash ; endGame le laisse finir (musicStop) et la musique du menu
     revient comme avant. Pas au BAC À SABLE ni à l'AUTO-ÉCOLE (endGame replace la caisse, la course continue).
     Après flowReset : une frénésie qui s'éteint ne relance pas la radio par-dessus. */
  if(!SANDBOX&&!TUTO.on)musicStop(true);
  // la chaîne part en fumée avec la caisse — le sel du bank-or-bust
  // (garde mode==='fall' : une explosion au sol après avoir encaissé ne perd rien)
  // (2026-09-29, Sacha : « les figures ne rapportent plus d'argent, seulement de l'aura ») : il n'y a plus de mallette d'ARGENT à perdre ni
  // d'assurance qui en rembourse une part — c'est la chaîne d'AURA qui part en fumée (chainePerdue, plus haut). La gerbe reste.
  if((chain>0||chainVal>0)&&mode==='fall')sparkBurst(sparkGold,carGroup.position,44,24);
  chainHud.style.opacity=0;
  caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  BOOM_CAM.m0=mode;BOOM_CAM.pret=false; // (vague 3) le PLAN DE LA MORT se pose au premier pas (voir boomCamTick)
  BOOM_SOL.ok=mode==='drive';if(BOOM_SOL.ok){frameAt(s,BOOM_SOL);BOOM_SOL.p.addScaledVector(BOOM_SOL.n,side<0?-THICK:0);BOOM_SOL.n.multiplyScalar(side);} // (2026-09-28) morte AU SOL : on garde le plan de la dalle
  mode='boom';boomT=0;boomPos.copy(carGroup.position);bmCam.copy(camera.position); // (vague 2) le point d'où l'on regarde la mort
  if(impFrais()){impCoupPart();return;} // (2026-10-15) L'IMPACT : contre une paroi, la caisse s'ÉCRASE d'abord (0,11 s) — la détonation suit (boomDetone)
  boomDetone();
}
function boomDetone(){ // (2026-10-15) LA DÉTONATION — tout de suite (vide, airtime…), ou à la fin du COUP contre une paroi (voir L'IMPACT)
  hap([55,45,160]); // le téléphone encaisse le crash avec toi
  BOOMV=BOOM_VARS[0]; // signature FIXE « FEU » (réf. illustrations) — la variété vient des volutes, plus d'une roulette de couleurs
  if(IMP.on)boomPos.copy(IMP.s).addScaledVector(IMP.n,1.5).addScaledVector(IMP.t2,Math.abs(IMP.n.y)<.75?.8:0); // contre un mur, la boule naît DEVANT la paroi, un peu au-dessus du trou (collée, la moitié des volutes passait derrière : l'explosion « plate »)
  spawnBoomArt(boomPos,IMP.on?1.12:1,BOOM_MAT.feu,false,null,IMP.on?IMP.n:null); // LA BOULE DE FEU DESSINÉE : volutes en chou-fleur + dards — contre une paroi, elle s'y ÉCRASE
  if(!IMP.on)boomOndePart(boomPos); // (2026-09-26) + l'onde qui court sur le bitume (contre un mur, impDetone la pose SUR la paroi)
  /* (2026-09-28) PENDANT L'AUTO-ÉCOLE, un crash n'est qu'un RATÉ (endGame replace la caisse) : ni la voix « EARLY DEAD » — qui se
     présentait là pour la toute 1re fois, à un joueur qui n'est même pas mort —, ni le son de mort. L'explosion et le « RATÉ » du coach suffisent. */
  /* (2026-09-30) « EARLY DEAD » NE SE MOQUE PLUS À CONTRETEMPS : elle tombait sur la toute 1re mort de chaque joueur (`first:1` : la voix
     se présente à sa 1re occurrence), sur une partie que l'écran de mort allait couronner « NOUVEAU RECORD ! ». Elle se tait donc à la 1re
     partie et sur un record (partieRecord). */
  const tx9=engTier<23&&!TUTO.on&&((SAVE.d.ex&&SAVE.d.ex.runs)|0)>0&&!partieRecord()?annSpeak('earlyDead'):null;
  if(!TUTO.on)deathSound(); // LE SON DE MORT, tiré au sort — il tombe sur l'image de l'explosion, pas après
  if(tx9)trickMsg(tx9,3); // mort avant le haut de l'échelle — indexé sur le MOTEUR (le niveau de caisse n'est plus une progression mais un choix de garage)
  carGroup.visible=false;shadow.position.y=-99999;landMark.visible=false;
  const spec=CARS[level];
  // VRAIS morceaux du modèle arrachés (roues, capot, toit, spoiler…)
  let np9=0;
  // (2026-09-27, passe perf iPhone) les pièces TELLES QUE CONSTRUITES (`CAR_PIECES`) : la caisse visible est soudée par matière, mais
  // l'explosion arrache toujours une roue, un capot, une plaque de rouille — pas un lot soudé (voir « LA CAISSE EN UN MINIMUM DE DESSINS »)
  for(const pc of CAR_PIECES){const ch=pc[0]; // (la carrosserie est un sous-groupe : on arrache SES pièces, pas le bloc entier)
    if(ch===carBody)continue;
    if(np9>=9)break;
    if(!(ch.isMesh||ch.isGroup))continue;
    if(ch.geometry&&ch.geometry.type==='PlaneGeometry')continue; // pas l'underglow
    if(ch.userData&&ch.userData.contour)continue;                 // ni le trait noir du chat pop-tart (une coque vide)
    if(Math.random()<.35)continue;
    np9++;
    const d=ch.clone();
    caissePose(pc,dTmp,qTmp2);d.position.copy(dTmp);d.quaternion.copy(qTmp2);
    // SENS LOGIQUE : chaque pièce part dans SA direction (roue gauche à gauche, capot devant…)
    dTmp.sub(boomPos);
    if(dTmp.lengthSq()<.01)dTmp.set(Math.random()-.5,.3,Math.random()-.5);
    dTmp.normalize();
    // (vague 2) les VRAIES pièces (capot, toit : 1-2 m) partaient à 20 m/s vers le haut et repassaient au-dessus de l'objectif en
    // grandes PLAQUES plates : plus lentes, elles retombent dans la boule ; masquées d'autant plus tôt qu'elles sont grandes
    const rad9=dbBox.setFromObject(d).getSize(dbS).length()*.5;
    debris.push({m:d,v:debrisLoin(new THREE.Vector3(dTmp.x*(6+Math.random()*8),4+Math.random()*7+dTmp.y*6,dTmp.z*(6+Math.random()*8))),
      rx:(Math.random()-.5)*12,ry:(Math.random()-.5)*12,part:true,hid:(3.4+rad9)*(3.4+rad9)});
    scene.add(d);
  }
  // + éclats incandescents génériques
  for(let k=0;k<8;k++){
    const d=new THREE.Mesh(new THREE.BoxGeometry(.12+Math.random()*.24,.07+Math.random()*.16,.12+Math.random()*.3), // (vague 2) des ÉCLATS, plus des plaques : à 2 m de l'objectif une plaque de 50 cm couvrait un tiers de l'écran
      new THREE.MeshPhongMaterial({color:k%3===0?spec.accent:spec.color,emissive:0xff4400,emissiveIntensity:.6,shininess:90}));
    d.position.copy(boomPos);
    debris.push({m:d,v:debrisLoin(new THREE.Vector3((Math.random()-.5)*26,8+Math.random()*18,(Math.random()-.5)*26)),
      rx:(Math.random()-.5)*14,ry:(Math.random()-.5)*14,own:1}); // own : géométrie et matière à lui — libérées au ménage
    scene.add(d);
  }
  if(SENS&&!IMP.on)try{sensBoomElan();}catch(e){} // (2026-10-14, sensations) l'épave garde une part de l'élan de la caisse (voir sensBoomElan) — pas contre un mur
  if(IMP.on)try{impDetone();}catch(e){} // (2026-10-15) L'IMPACT : les pièces rebondissent sur la paroi, ses éclats sautent, l'onde court sur le mur — (le craquement de roche du JADE, sensBoomRoc, est fondu dedans : même animation partout)
  else if(SENS)try{sensBoomRoc();}catch(e){} // (2026-10-14, sensations) contre un PIC DE JADE : les pièces ricochent, la roche crache et craque
  // boule de feu dispersée, moins centrée : foyers décalés, 3 tons — (vague 2) des TRAITS, quatre fois moins : à 950 traits la gerbe
  // faisait un HÉRISSON qui mangeait la boule ; ce sont les volutes qui portent le volume
  for(let k=0;k<44;k++){
    const a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1),sp2=4+Math.random()*20;
    spawnP(boomPool,boomPos.x+(Math.random()-.5)*5,boomPos.y+(Math.random()-.5)*4,boomPos.z+(Math.random()-.5)*5,
      Math.sin(b)*Math.cos(a)*sp2,Math.cos(b)*sp2*.8+3,Math.sin(b)*Math.sin(a)*sp2,.4+Math.random()*.7);
  }
  for(let k=0;k<32;k++){
    const a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1),sp2=3+Math.random()*17;
    spawnP(boomRed,boomPos.x+(Math.random()-.5)*6,boomPos.y+(Math.random()-.5)*5,boomPos.z+(Math.random()-.5)*6,
      Math.sin(b)*Math.cos(a)*sp2,Math.cos(b)*sp2*.8+2,Math.sin(b)*Math.sin(a)*sp2,.5+Math.random()*.8);
  }
  for(let k=0;k<40;k++){
    const a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1),sp2=5+Math.random()*22;
    spawnP(boomYel,boomPos.x+(Math.random()-.5)*7,boomPos.y+(Math.random()-.5)*5,boomPos.z+(Math.random()-.5)*7,
      Math.sin(b)*Math.cos(a)*sp2,Math.cos(b)*sp2*.8+4,Math.sin(b)*Math.sin(a)*sp2,.3+Math.random()*.55);
  }
  // sauce sanglante : pixels rouge sombre minuscules (sur TOUTES les explosions)
  for(let k=0;k<40;k++){
    const a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1),sp2=6+Math.random()*22;
    spawnP(boomTom,boomPos.x+(Math.random()-.5)*3,boomPos.y+(Math.random()-.5)*2,boomPos.z+(Math.random()-.5)*3,
      Math.sin(b)*Math.cos(a)*sp2,Math.cos(b)*sp2+4,Math.sin(b)*Math.sin(a)*sp2,.5+Math.random()*1.2);
  }
  // BRAISES CHAUDES (toutes les explosions) : rouges qui brillent + orange et jaunes plus fines
  for(let k=0;k<40;k++)spawnP(boomEmbR,boomPos.x+(Math.random()-.5)*4,boomPos.y+(Math.random()-.5)*3,boomPos.z+(Math.random()-.5)*4,
    (Math.random()-.5)*9,2+Math.random()*7,(Math.random()-.5)*9,1+Math.random()*1.2);
  for(let k=0;k<32;k++)spawnP(boomEmbO,boomPos.x+(Math.random()-.5)*4,boomPos.y+(Math.random()-.5)*3,boomPos.z+(Math.random()-.5)*4,
    (Math.random()-.5)*11,3+Math.random()*8,(Math.random()-.5)*11,.8+Math.random()*1);
  for(let k=0;k<26;k++)spawnP(boomEmbY,boomPos.x+(Math.random()-.5)*5,boomPos.y+(Math.random()-.5)*3,boomPos.z+(Math.random()-.5)*5,
    (Math.random()-.5)*13,3+Math.random()*9,(Math.random()-.5)*13,.6+Math.random()*.9);
  // SIGNATURE du modèle : chaque caisse meurt à sa façon
  signatureBoom(level);
  // CRÂNE pixelisé qui s'éjecte (parfois)
  if(Math.random()<.75){
    const n9=Math.random()<.25?2:1;
    for(let k=0;k<n9;k++){
      const sk=new THREE.Sprite(new THREE.SpriteMaterial({map:skullTex,transparent:true,depthWrite:false}));
      sk.scale.set(1.7,1.7,1);
      sk.position.copy(boomPos);
      skulls.push({m:sk,v:new THREE.Vector3((Math.random()-.5)*10,11+Math.random()*7,(Math.random()-.5)*10),
        rs:(Math.random()-.5)*9,life:2.2});
      scene.add(sk);
    }
  }
  // plus t'es riche, plus ça pleut des billets
  const nB=Math.min(60,8+Math.floor(Math.log10(Math.max(10,money))*6));
  for(let k=0;k<nB;k++)spawnBill(boomPos,
    new THREE.Vector3((Math.random()-.5)*18,6+Math.random()*14,(Math.random()-.5)*18),1.6+Math.random()*1.4);
  // foyers secondaires décalés dans le temps
  for(let c9=0;c9<3;c9++){
    setTimeout(function(){
      if(mode!=='boom')return;
      const ox=boomPos.x+(Math.random()-.5)*10,oy=boomPos.y+(Math.random()-.5)*6,oz=boomPos.z+(Math.random()-.5)*10;
      for(let k=0;k<32;k++){ // (vague 2) 60 → 32 : des répliques, pas une deuxième gerbe
        const a=Math.random()*Math.PI*2,b2=Math.acos(2*Math.random()-1),sp2=4+Math.random()*16;
        spawnP(k%2?boomRed:boomYel,ox,oy,oz,
          Math.sin(b2)*Math.cos(a)*sp2,Math.cos(b2)*sp2*.8+3,Math.sin(b2)*Math.sin(a)*sp2,.4+Math.random()*.6);
      }
      if(!SONV2)noiseBurst(.35,.2,600); /* (débogage son 2026-09-29) les répliques : l'explosion de la console les porte déjà */
    },180+c9*230);
  }
  // fumée noire légère, pour laisser voir la caisse
  for(let k=0;k<50;k++){
    const a=Math.random()*Math.PI*2;
    spawnP(smokePool,boomPos.x,boomPos.y,boomPos.z,
      Math.cos(a)*(1.5+Math.random()*5),2+Math.random()*6,Math.sin(a)*(1.5+Math.random()*5),.9+Math.random()*1.2);
  }
  // (vague 2) les ONDES DE CHOC face caméra, le CŒUR et les volutes vivent dans `spawnBoomArt` (créés UNE fois, voir L'EXPLOSION v3) :
  // plus de tores opaques neufs à chaque mort. DÉFLAGRATION pour TOUTES les caisses (elle était câblée sur l'index) : des traits FEU et or.
  for(let k=0;k<24;k++){
    const a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1),sp2=6+Math.random()*26;
    spawnP(k%2?boomPool:boomYel,boomPos.x,boomPos.y,boomPos.z,
      Math.sin(b)*Math.cos(a)*sp2,Math.cos(b)*sp2*.9+4,Math.sin(b)*Math.sin(a)*sp2,.4+Math.random()*.7);
  }
  /* (2026-09-28) LE GRONDEMENT POUR TOUT LE MONDE. Il était câblé sur `level>=4` — un reste de l'époque où `level` était une
     progression ; c'est aujourd'hui l'INDEX de la caisse choisie au garage : les quatre premières caisses explosaient sans grave.
     Même grondement pour toutes, un peu allégé (.35/.5 → .3, sub .3) : `boomSnd` part dans la même milliseconde sur le même bus. */
  if(!SONV2){noiseBurst(1.2,.3,240);subBoom(.3);}
  else{const mc9={vide:'mort.vide',air:'mort.air',arret:'mort.arret',police:'mort.police'}[mortCause];if(mc9&&!TUTO.on)sfx(mc9);} // (console) chaque mort a sa signature (sauf à l'auto-école : un crash n'y est qu'un RATÉ), par-dessus l'explosion : on ENTEND pourquoi on est mort · (2026-09-30) le SATELLITE percuté (PLUIE DE SATELLITES) : l'arc électrique qui grille, `mort.foudre` — cuit dans la banque, joué nulle part jusqu'ici
  if(level>=4){
    shake=Math.max(shake,level===5?3.6:3);
  }
  // (2026-09-26, audit rendu) on RECYCLE la lumière dorée de la pose (toujours en scène, à 0) : le nombre de lumières ne change plus,
  // aucun programme ne se recompile — c'était un gel de 1,5 s (PC) pile sur l'explosion
  boomLight=swapLight;boomLight.color.set(BOOMV.li);boomLight.distance=460;boomLight.intensity=7;boomLight.position.copy(boomPos);
  /* (vague 2) LE FLASH : il était BEIGE à 95 % et, par la transition CSS de 0,5 s (montée PUIS descente), il voilait l'écran ~0,8 s —
     le « écran entier beige ». Désormais un éclair blanc-or à 42 %, 70 ms, bords francs (transition courte le temps du coup, puis
     rendue à la feuille de style). */
  flashEl.style.transition='opacity .06s';flashEl.style.background='#fff0c8';flashEl.style.opacity=REDUCED_MOTION?.25:.42; // (2026-09-30) « Réduire les animations » : l'éclair de la mort adouci
  setTimeout(function(){flashEl.style.opacity=0;},70);setTimeout(function(){flashEl.style.transition='';},200);
  // les répliques : chaque signature a son nombre de gerbes (les ondes, elles, sont dans spawnBoomArt)
  for(let e9=0;e9<BOOMV.rings;e9++)setTimeout(function(){
    if(mode!=='boom')return;
    sparkBurst(Math.random()<.5?sparkGold:sparkBlue,boomPos,10,16);
    if(!SONV2)chimeNote(120*BOOMV.pitch*(1+e9*.2),0,.18,.12);
  },90+e9*130);
  shake=2.6;slowT=.7;
  boomSnd();
}
// (2026-09-25) PASSER L'EXPLOSION : une fois le souffle retombé (flash, anneaux, cœur éteints ≈ 0,8 s de simulation), un tap saute au
// bilan. On ne court-circuite PAS endGame : boomT=1.8 laisse la frame suivante éteindre la lumière, les anneaux et les débris.
function boomSkip(){ if(mode!=='boom'||gameOver||paused||boomT<=.8)return false; boomT=1.8; return true; }
const jeteObj=o=>o.traverse(n=>{if(n.geometry&&!n.isSprite)n.geometry.dispose();const mm=Array.isArray(n.material)?n.material:[n.material];for(const m of mm)if(m&&m.dispose)m.dispose();});
function clearBoom(){
  // (2026-09-26, passe fuites) chaque mort laissait ~16 géométries sur le GPU (éclats, anneaux, cœur, objets de signature) : on les
  // LIBÈRE — sauf les débris `part` (clones de la caisse : ils partagent SA géométrie)
  for(const d of debris){scene.remove(d.m);if(!d.part)jeteObj(d.m);}
  debris.length=0;
  for(const k9 of skulls){scene.remove(k9.m);k9.m.material.dispose();}
  skulls.length=0;
  for(const d of chips){scene.remove(d.m);if(!d.sh){if(d.m.material.dispose)d.m.material.dispose();if(d.m.geometry)d.m.geometry.dispose();}}
  chips.length=0;
  billsClear(); // (vague 2) les billets instanciés
  clearBoomArt(); // volutes, dards, cœur et ondes de la boule de feu — (vague 2) RANGÉS, pas libérés : ils servent à la mort suivante
  boomOnde.userData.t=-1;boomOnde.visible=false; // (particules) l'onde au sol s'éteint avec le reste
  if(boomLight){boomLight.intensity=0;boomLight.distance=30;boomLight.color.setHex(0xffd06a);boomLight=null;} // rendue à la pose, JAMAIS retirée de la scène
  impFin();impMiniFin(); // (2026-10-15) L'IMPACT : le cratère, l'étoile, les éclats rangés (et la caisse rendue à sa forme si on quitte pendant le coup)
  boomT=-1;carGroup.visible=true;flashEl.style.background='#ff2020';
}
// étincelles de collecte / d'impact
const sparkGold=makePool(140,.9,0xffd75e,1,true,{a:[0,.45,1,.5],etire:1,str:.04,v:.55});sparkGold.acc=16;sparkGold.mesh.material.blending=THREE.AdditiveBlending; // (particules v2) de VRAIES étincelles : un trait qui file et retombe en arc
const sparkBlue=makePool(70,.9,0x5ee6ff,1,true,{a:[0,.45,1,.5],etire:1,str:.04,v:.55});sparkBlue.acc=12;sparkBlue.mesh.material.blending=THREE.AdditiveBlending;
const sparkPink=makePool(70,.9,0xff3ec8,1,true,{a:[0,.45,1,.5],etire:1,str:.04,v:.55});sparkPink.acc=12;sparkPink.mesh.material.blending=THREE.AdditiveBlending; // le 3e niveau du drift mini-turbo
// L'EAU DU REQUIN : des GOUTTES, pas des braises. Ce qui distingue de l'eau du feu, ce n'est pas la
// couleur — c'est le comportement : ça part en gerbe, ça RETOMBE (gravité positive dans updatePool)
// et ça meurt vite. Une flamme monte, une gerbe tombe ; l'œil fait la différence tout seul.
const spray=makePool(150,.62,0xdff6ff,.92,true,{a:[0,.4,1,.6],etire:1,str:.03,v:.5});spray.mesh.material.blending=THREE.AdditiveBlending; // (vague 2) l'eau et le nuage partagent UNE couleur d'état : #dff6ff
const foam=makePool(80,1.45,0xdff6ff,.34,false,{a:[.1,.6,.6,1.5],pr:[2,6,26,0]});  // l'écume : plus grosse, plus molle, elle traîne derrière — (vague 2) elle n'avait AUCUN plafond : 120 px près de l'objectif
// MORCEAUX DE NUAGE : quand on défonce un banc, il éclate en mille bouts de ouate au point de contact
const cloudBits=makePool(150,2.8,0xdff6ff,.9,false,{a:[.06,.6,.75,1.35],pr:[2,6,26,0]}); // (2026-09-26) garde-objectif : le banc éclate AUTOUR de la caméra — (vague 2) plafond 110 → 26 px : des FLOCONS, plus des ronds blancs de 110 px
// ÉCLABOUSSURE DE FRUIT : gouttelettes à la COULEUR du fruit croqué. Un seul pool dont on repeint le
// matériau à chaque bouchée — les gouttes vivent ~0,3 s, donc le changement de teinte ne se voit jamais.
const juicePool=makePool(110,.8,0xffffff,1,false,{a:[0,.45,1,.6],etire:1,str:.03,v:.5,pr:[2,5,26,50]});juicePool.mesh.material.blending=THREE.AdditiveBlending; // (vague 2) des GOUTTES qui filent (traits), plus des disques mous de 1,15 m — plafonnées comme tout le reste
function juiceSplash(pos,col,power){
  juicePool.mesh.material.color.setHex(col);
  const n=Math.round(16+power*22);
  for(let k=0;k<n;k++){
    const a=Math.random()*6.2832,el=Math.random()*1.2,sp=(4+Math.random()*11)*(.6+power*.7);
    spawnP(juicePool,pos.x,pos.y+.3,pos.z,
      Math.cos(a)*Math.cos(el)*sp,2+Math.sin(el)*sp*.9,Math.sin(a)*Math.cos(el)*sp,.22+Math.random()*.26);
  }
}
function shatterCloud(pos,power){
  const n=Math.floor(18+power*28);
  for(let k=0;k<n;k++){
    const a=Math.random()*6.283,sp=3+Math.random()*12*power;
    spawnP(cloudBits,pos.x+(Math.random()-.5)*4,pos.y+(Math.random()-.5)*2.5,pos.z+(Math.random()-.5)*4,
      Math.cos(a)*sp,1.5+(Math.random()-.3)*sp*.5,Math.sin(a)*sp,.5+Math.random()*.85);
  }
}
// P'TIT BOOM D'ATTERRISSAGE : mini-explosion quand on pose une figure MONSTER+ (tier 1..3), calibrée sur le tier
function landBoom(pos,tier){
  shake=Math.max(shake,.22+tier*.13);
  sparkBurst(sparkGold,pos,16+tier*12,11+tier*4);
  if(tier>=2)sparkBurst(sparkBlue,pos,10+tier*4,10);
  // (vague 2) le flash de la pose : un ÉCLAIR franc (60 ms, bords nets) et plus un voile beige — la transition CSS de 0,5 s le faisait
  // monter PUIS redescendre, ~0,6 s d'écran délavé à chaque grosse pose
  flashEl.style.transition='opacity .05s';flashEl.style.background='#fff0c8';flashEl.style.opacity=Math.min(.4,.14+tier*.09).toFixed(2);
  setTimeout(function(){flashEl.style.opacity=0;},60);
  setTimeout(function(){flashEl.style.transition='';if(mode!=='boom')flashEl.style.background='#ff2020';},180); // on rend le flash au rouge (mort) et sa transition à la feuille de style
  if(!SONV2){subBoom(.10+tier*.07);noiseBurst(.15,.08+tier*.035,300+tier*40);} /* (débogage son 2026-09-29) // (2026-09-26, audit son) plus de `thud(6+tier*4)` : calé sur le GAIN et non sur le */
  // grade, il rejouait un choc grave à chaque pose qui paye — la PARFAITE cognait plus fort que la LOURDE et le compresseur écrasait son « tchak »
}
/* LA GERBE DE POSE (2026-09-26, passe graphique) : se poser faisait 10 points dorés qui montaient droit — et, laissés en l'air
   pendant que la caisse repartait, ils passaient devant l'objectif en ronds flous. Désormais la pose se DESSINE sur le bitume :
   · des étincelles de CHÂSSIS qui RASENT la route, vers l'arrière et les côtés, et retombent (traits étirés, gravité réelle) ;
   · deux bouffées de GOMME basses qui s'étalent de chaque côté des roues (la fumée de glisse : douce, garde-objectif compris).
   Tout hérite de la vitesse de la caisse (sinon la gerbe fonce vers la caméra) ; le nombre suit la violence de l'impact. */
const pgB=new THREE.Vector3();
function poseGerbe(pos,nrm,sg,tan,v,impact){
  const k=Math.min(1,Math.max(0,impact)/9),nx=nrm.x*sg,ny=nrm.y*sg,nz=nrm.z*sg;
  pgB.set(tan.y*nz-tan.z*ny,tan.z*nx-tan.x*nz,tan.x*ny-tan.y*nx); // le flanc (tan × haut)
  const ns=12+Math.round(k*26);
  for(let i=0;i<ns;i++){
    const sd=i&1?1:-1,la=(1.5+Math.random()*6)*(.6+k),ar=v*.9-(2+Math.random()*9),up=.5+Math.random()*(1.5+3*k),o=.3+Math.random()*1.3;
    spawnP(impact>=10?boomEmbO:sparkGold,pos.x+pgB.x*sd*o+nx*.12,pos.y+pgB.y*sd*o+ny*.12,pos.z+pgB.z*sd*o+nz*.12, // (2026-09-28) POSÉ LOURD : braises orange-rouge — l'anneau l'annonçait rouge, la gerbe disait or
      tan.x*ar+pgB.x*sd*la+nx*up,tan.y*ar+pgB.y*sd*la+ny*up,tan.z*ar+pgB.z*sd*la+nz*up,.2+Math.random()*.28);
  }
  const nd=4+Math.round(k*8);
  for(let i=0;i<nd;i++){
    const sd=i&1?1:-1,la=2+Math.random()*4.5,ar=v*.9-(1+Math.random()*3),o=.9+Math.random()*.6;
    spawnP(dust,pos.x+pgB.x*sd*o+nx*.3,pos.y+pgB.y*sd*o+ny*.3,pos.z+pgB.z*sd*o+nz*.3,
      tan.x*ar+pgB.x*sd*la+nx*(.4+Math.random()*.8),tan.y*ar+pgB.y*sd*la+ny*(.4+Math.random()*.8),tan.z*ar+pgB.z*sd*la+nz*(.4+Math.random()*.8),.4+Math.random()*.35);
  }
}
function sparkBurst(pool,pos,n,sp){
  // (2026-09-25) une gerbe née CONTRE la caisse en course (pièce, drift, frôlé, rase-bord…) hérite de sa vitesse (EXV, posée par la
  // boucle) : lancée sur place pendant que la caisse file à 40 m/s, elle passait devant la caméra en gros ronds flous. Les gerbes
  // posées ailleurs (explosion, portail, décor) restent où elles naissent.
  let ix=0,iy=0,iz=0;
  if(mode==='drive'&&pos.distanceToSquared(carGroup.position)<64){const v9=PT_U.uVc.value;ix=v9.x;iy=v9.y;iz=v9.z;} // (2026-09-26) la VRAIE vitesse de la caisse (EXV suit le cap : en glisse, les étincelles du mini-turbo partaient de côté)
  for(let k=0;k<n;k++)spawnP(pool,pos.x,pos.y,pos.z,
    ix+(Math.random()-.5)*sp,iy+Math.random()*sp*.7,iz+(Math.random()-.5)*sp,.28+Math.random()*.22);
}
const crV1=new THREE.Vector3(),crV2=new THREE.Vector3(); // (2026-10-15) deux vecteurs de travail partagés (ils vivaient avec les dauphins)
function triNoir(){return FLOW.lv===4&&!PARK.on;} // la DARK TRIAD tourne
