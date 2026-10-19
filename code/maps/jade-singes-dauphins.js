/* LES SINGES DU SOLEIL DE JADE (2026-10-15, Léo : « on va les replacer par map : les singes apparaîtront quelques fois sur les montagnes où on
   peut les voir dire bonjour ; on les voit quelques fois, de manière random comme la map, sur la route, en train de courir ou de manger une
   mangue, ou penchés sur le bord de la route et sur les montagnes — qu'on en voie quelques fois seulement, mais qu'on les voie quand même »).
   Du DÉCOR (aucune collision, aucun gain) : à chaque course sur les PICS DE JADE, QUATRE rencontres tirées au hasard le long de la piste
   (`JSG_N`), une de chaque : sur une MONTAGNE proche de la route, un grand singe debout qui dit COUCOU · sur la ROUTE, un singe assis qui
   MANGE UNE MANGUE (il regarde passer la caisse) · sur la ROUTE, un singe qui COURT dans le sens de la course (la caisse le double) · AU BORD
   de la route, un singe assis sur l'arête, les jambes dans le vide, qui fait coucou. Chacun naît devant la caisse, assez loin pour qu'on le
   voie venir (`JSG_AV`), de l'autre côté de la route qu'elle, et repart dès qu'elle l'a laissé derrière. La forme vient de `creatures/singe.js`
   (les poses articulées) et de `creatures/vitrail.js` ; les quatre formes sont bâties AU MENU, tranche par tranche (≤ 5 ms par image), puis
   compilées une fois hors écran : en course, rien ne se construit ni ne se compile. Console : `dbgJadeSinges()` (le plan, la rencontre en
   cours), `dbgJadeSinges('bonjour'|'mangue'|'course'|'bord')` (une rencontre, tout de suite). */
const JSG_ESSAI=/[?&]singesjade=1\b/.test(location.search);
const JSG_N=4,JSG_AV={bonjour:240,mangue:170,course:150,bord:170},JSG_ECH={bonjour:11,mangue:8.5,course:7.5,bord:8.5}; // (mesuré au banc) à 6 m de haut, ils restaient cachés derrière la caisse jusqu'à 40 m : des singes GÉANTS, du décor de dessin animé
/* (2026-10-17) PLUS PETITS ET IMPRÉVISIBLES (Léo : « rends-les plus petits, c'est un peu trop grand ; c'est imprévisible : ils peuvent soit te
   suivre, soit sauter, soit… »). MESURÉ : le singe de la route faisait 11 à 14 m de haut, neuf fois la caisse — `JSG_TAILLE` les ramène à
   5-6 m (celui de la montagne, vu de loin, garde un peu plus : `JSG_TMONT`). `?singetaille=.3` pour en essayer une autre.
   Les singes ne se cachent plus derrière la caisse : ils BOUGENT. Chaque rencontre tire sa réaction (`JSG_ACT`), qui part quand la caisse arrive :
   · SUIT — il bondit et galope À CÔTÉ d'elle, un peu devant (dans le champ), à sa vitesse, en sautillant, puis lâche prise ;
   · SAUTE — il traverse la route d'un bond PAR-DESSUS la caisse (le haut du bond tombe quand elle passe dessous), se pose de l'autre côté,
     puis, au hasard, la suit ou plonge dans le vide ;
   · PLONGE — il détale vers le bord et se jette dans le vide ;
   · RESTE — ce qu'il faisait (coucou, mangue, assis au bord, la course qu'on double).
   Le singe de la MONTAGNE : soit il reste à faire coucou, soit il SAUTE de son pic jusque sur la route, devant la caisse, et la suit.
   Du DÉCOR (aucune collision). Le mouvement est balistique (gravité, élan) dans le repère de la route (s, lat, h) ; un singe posé qui se
   lève prend la forme EN COURSE au premier bond. Console : `dbgJadeSinges('mangue','saute')` force une réaction. */
const JSG_TAILLE=(function(){const m=/[?&]singetaille=([\d.]+)/.exec(location.search);return m?+m[1]:.45;})(),JSG_TMONT=1.3; // la montagne : ×.45×1,3
const JSG_ACT={mangue:{suit:.3,saute:.3,plonge:.15,reste:.25},bord:{suit:.25,saute:.3,plonge:.2,reste:.25},course:{suit:.35,saute:.35,reste:.3},bonjour:{saute:.5,reste:.5}};
const JSG_G=26,JSG_HB=7; // la gravité des singes (m/s², un bond de dessin animé) et la hauteur du bond par-dessus la caisse (m)
function jsgTire(type){const P=JSG_ACT[type];let r=Math.random(),k0='reste';for(const k in P){k0=k;r-=P[k];if(r<0)return k;}return k0;}
function jsgEch(type){return JSG_ECH[type]*JSG_TAILLE*(type==='bonjour'?JSG_TMONT:1);}
const JSG_VIT={uSat:.62,uClair:.78,uLueur:.55,uEcart:.94,uCoqA0:.28}; // le vitrail EN COURSE (l'étalonnage du jeu sature ×1,4 : sans ça, un singe brun sort orange)
const JSG={S:{},node:new THREE.Group(),fab:null,pret:false,chaud:false,cle:null,plan:[],cur:null,t:0,vR:0,R0:null,force:null,
  F:{p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},v1:new THREE.Vector3(),v2:new THREE.Vector3(),v3:new THREE.Vector3(),
  m:new THREE.Matrix4(),cib:new THREE.Vector3(),vel:new THREE.Vector3(),p0:new THREE.Vector3()};
JSG.node.visible=false;scene.add(JSG.node);
function jsgActif(){return !!(started&&!gameOver&&JADE.root&&LVL.cur&&LVL.cur.piste==='jade'&&!PARK.on&&!TUTO.on);}
function jsgCache(){if(JSG.cur){JSG.cur.o.nd.visible=false;JSG.cur=null;}JSG.node.visible=false;}
function jsgS(){ // où est la caisse sur la piste (au sol : s ; en vol : la dalle la plus proche) — null sans route sous elle
  if(mode==='drive')return s;const P=carGroup.position,bi=dalleProche(P.x,P.y,P.z,2,1e9,tryLand._bi);if(bi<0||bi>=NP)return null;
  return bi/(NP-1)*L+JSG.v1.subVectors(P,pts[bi]).dot(T[bi]);}
function jsgPlan(){ // QUATRE rencontres sur la piste, une de chaque, dans un ordre tiré au hasard
  const ty=['bonjour','mangue','course','bord'];for(let i=ty.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;const x=ty[i];ty[i]=ty[j];ty[j]=x;}
  JSG.plan=[];for(let k=0;k<JSG_N;k++)JSG.plan.push({s:L*(.1+k*.21+Math.random()*.07),type:ty[k%ty.length],fait:false});
}
function jsgPose(o,p,y,z,ech){ // pose le singe : position p, son haut y, son regard z (unitaires)
  const x=JSG.v3.crossVectors(y,z).normalize(),z2=JSG.v2.crossVectors(x,y);JSG.m.makeBasis(x,y,z2);
  o.nd.quaternion.setFromRotationMatrix(JSG.m);o.nd.position.copy(p);o.nd.scale.setScalar(ech);o.nd.updateMatrixWorld(true);}
function jsgMontagne(sp){ // une montagne près de la route, devant : son sommet sous le niveau de la route (on le voit d'en haut), le singe dessus
  const C=JADE.col;if(!C)return null;const i0=Math.max(0,Math.min(NP-1,Math.round(sp/L*(NP-1)))),r0=pts[i0],mort=C.mort||new Set(),chute=new Set();
  for(const c of JCH.L)if(c&&c.pi!=null)chute.add(c.pi);
  let best=-1,bd=1e9;
  C.P.forEach(function(q,k){if(mort.has(k)||chute.has(k))return;const d=Math.hypot(q[0]-r0.x,q[1]-r0.z),h=q[4]-r0.y;if(d<ROAD_HALF+q[2]+20||d>280)return;
    if(h<-150||h>50)return; // MESURÉ : les montagnes au bord de la route la dépassent de 70 à 230 m — leur sommet est invisible d'en bas ; on prend un sommet de 150 m sous la route à 50 m au-dessus
    const sc=Math.abs(h-10)*.5+Math.abs(d-130)*.4;if(sc<bd){bd=sc;best=k;}});
  if(best<0)return null;const q=C.P[best];
  let bx=q[0],bz=q[1],by=-1e9;
  for(const o of [[0,0],[.25,0],[-.25,0],[0,.25],[0,-.25],[.18,.18],[-.18,-.18],[.18,-.18],[-.18,.18]]){const x=q[0]+o[0]*q[2],z=q[1]+o[1]*q[2];
    for(let y=q[4]+2;y>q[4]-30;y-=.5)if(jadePilierDans(q,x,y,z)){if(y>by){by=y;bx=x;bz=z;}break;}}
  if(by<-1e8)return null;return {p:new THREE.Vector3(bx,by+.5,bz),q:q};
}
function jsgLance(R,type){ // la rencontre naît devant la caisse
  const o=JSG.S[type];if(!o)return false;const dir=driveDir||1,sp=R+dir*JSG_AV[type];if(sp<30||sp>L-80)return false;
  const F=JSG.F;frameAt(sp,F);const cote=Math.random()<.5?1:-1,sl=-Math.sign(lat||cote)||cote; // de l'AUTRE côté de la route que la caisse
  const E={type,o,s:sp,t:0,ech:jsgEch(type),vs:0,lat:0,cote:sl,
    act:JSG.force||jsgTire(type),ph:type==='course'?'galop':'pose',mob:type==='course',h:0,vh:0,vl:0,air:0,pt:0,fin:0,side:sl,
    ecart:7+Math.random()*4,off:6+Math.random()*6,hopT:.4,trig:.8+Math.random()*.5,k:Math.random()*6.28,z:new THREE.Vector3()}; // trig : l'instant du réveil change d'une fois à l'autre
  JSG.force=null;
  if(type==='bonjour'){const M=jsgMontagne(sp);if(!M)return false;E.p=M.p;E.n=new THREE.Vector3(0,1,0);
    const i0=Math.max(0,Math.min(NP-1,Math.round(sp/L*(NP-1))));E.vers=pts[i0].clone();}
  else if(type==='bord')E.lat=sl*(ROAD_HALF-.25);
  else E.lat=sl*Math.max(ROAD_HALF*.5,ROAD_HALF-6); // (mesuré) à mi-largeur, dans un virage, il tombait pile derrière la caisse à l'écran : près du bord
  if(type==='course'){const vt=JSG.vel.dot(F.t)*dir;E.vs=Math.max(8,.5*Math.max(20,vt));}
  JSG.cur=E;JSG.node.visible=true;o.nd.visible=true;o.S.e.t=0;
  try{if(typeof sfx==='function')sfx('singe.coucou');}catch(e){} // (son à faire : nom posé)
  return true;
}
function jsgCourse(E){ // le singe posé se LÈVE : la forme EN COURSE prend sa place (au premier bond, on ne voit pas le change)
  const C=JSG.S.course;if(!C)return false;if(E.o!==C){E.o.nd.visible=false;E.o=C;C.nd.visible=true;C.S.e.t=0;}
  E.mob=true;E.ech=jsgEch('course');E.pt=0;return true;}
function jsgBond(E,lat1,vR){ // le bond PAR-DESSUS la route : sommet à JSG_HB, de son côté à lat1 ; il avance avec la caisse à ~55 % de sa vitesse
  E.vh=Math.sqrt(2*JSG_G*JSG_HB);const Tf=2*E.vh/JSG_G;E.vl=(lat1-E.lat)/Tf;E.vs=.55*vR;E.ph='saut';E.pt=0;E.air=1;
  try{if(typeof sfx==='function')sfx('singe.saut');}catch(e){} // (son à faire : nom posé)
}
function jsgDSaut(vR){const Tf=2*Math.sqrt(2*JSG_G*JSG_HB)/JSG_G;return .45*Math.max(20,vR)*Tf*.55+6;} // l'écart caisse → singe où il s'élance : elle passe sous le haut du bond
function jsgReveil(E,R,vR,dir){ // un singe POSÉ : sa réaction part quand la caisse arrive
  const d=(E.s-R)*dir,v=Math.max(20,vR),RH=ROAD_HALF;if(E.act==='reste')return;
  if(E.type==='bonjour'){ // de son pic jusque sur la route, devant la caisse (un bond de 2 s), puis il la suit
    if(E.act!=='saute')return;if(d<v*1.1+30){E.act='reste';return;} // jamais passé dans le champ : il reste à faire coucou
    if(d>v*2.6+160)return;
    const q=JSG.v1.copy(E.p).project(camera);if(q.z>1||Math.abs(q.x)>.75||Math.abs(q.y)>.9)return; // MESURÉ : parti à 50° de l'axe, on ne voyait que son arrivée — il s'élance DANS le champ
    const Tb=2,sT=R+dir*(v*Tb+40),F=JSG.F;
    if(sT>L-80||sT<30){E.act='reste';return;}frameAt(sT,F);
    const sd=Math.sign(JSG.v1.subVectors(E.p,F.p).dot(F.b))||1,latT=sd*RH*.45;
    if(Math.abs(E.p.y-F.p.y)>90){E.act='reste';return;} // un pic trop bas (ou trop haut) : le bond serait absurde, il reste à faire coucou
    const P1=F.p.clone().addScaledVector(F.b,latT),C=E.p.clone().add(P1).multiplyScalar(.5);C.y=Math.max(E.p.y,P1.y)+22;
    const e0=E.ech;jsgCourse(E);E.ech0=e0;E.P0=E.p.clone();E.P1=P1;E.C=C;E.Tb=Tb;E.sT=sT;E.latT=latT;E.side=sd;E.s0=E.s;E.ph='vol';E.air=1;
    try{if(typeof sfx==='function')sfx('singe.saut');}catch(e){}return;}
  if(E.act==='suit'&&d<v*.9*E.trig+15){jsgCourse(E);E.ph='suit';E.dur=4+Math.random()*2.5;E.vh=7;E.vs=0;}
  else if(E.act==='saute'&&d<jsgDSaut(v)){jsgCourse(E);jsgBond(E,-E.side*(RH-6),v);}
  else if(E.act==='plonge'&&d<v*.7*E.trig+15){jsgCourse(E);E.ph='plonge';E.vh=5;E.vs=0;}
}
function jsgBouge(E,dt,R,vR,dir){ // un singe EN MOUVEMENT : son comportement, puis sa balistique dans le repère de la route (s, lat, h)
  const RH=ROAD_HALF,d=(E.s-R)*dir,v=Math.max(20,vR);E.pt+=dt;
  if(E.ph==='vol'){ // le grand bond depuis la montagne (courbe de Bézier dans le monde) — posé, il devient un singe de la route qui suit
    const u=Math.min(1,E.pt/E.Tb);E.ech=E.ech0+(jsgEch('course')-E.ech0)*u;E.s=E.s0+(E.sT-E.s0)*u;
    if(u>=1){E.s=E.sT;E.lat=E.latT;E.h=0;E.vh=0;E.vl=0;E.vs=v*.9;E.ph='suit';E.pt=0;E.dur=3.5+Math.random()*2;E.air=1;}
    return;}
  let sol=E.h<=.001&&Math.abs(E.lat)<RH+.5;
  if(E.ph==='galop'){ // la course d'origine : il trottine devant, la caisse le double — à moins qu'il ne se décide
    if(E.act==='suit'&&d<v*.45+12){E.ph='suit';E.pt=0;E.dur=4+Math.random()*2.5;}
    else if(E.act==='saute'&&d<jsgDSaut(v))jsgBond(E,-E.side*(RH-6),v);}
  if(E.ph==='suit'){ // à côté de la caisse, un peu devant : là où la caméra le voit
    const tS=R+dir*(E.off+3*Math.sin(E.pt*1.3+E.k)),tL=Math.max(-(RH-3),Math.min(RH-3,lat+E.side*E.ecart)),
      vT=v+Math.max(-25,Math.min(30,(tS-E.s)*dir*1.8));E.vs+=Math.max(-120*dt,Math.min(120*dt,vT-E.vs));
    if(sol){E.vl=Math.max(-25,Math.min(25,(tL-E.lat)*2.5));if((E.hopT-=dt)<=0){E.vh=4.5+Math.random()*4;E.hopT=.5+Math.random()*1.1;sol=false;}}
    if(E.pt>E.dur){E.ph='lache';E.pt=0;}}
  else if(E.ph==='lache'){E.vs+=(v*.35-E.vs)*Math.min(1,dt*1.5);if(sol)E.vl*=Math.exp(-dt*3);}
  else if(E.ph==='plonge'){E.vs+=(v*.5-E.vs)*Math.min(1,dt*2);
    if(sol){E.vl=E.side*16;if(Math.abs(E.lat)>RH-2){E.vh=7;E.vl=E.side*12;sol=false;}}}
  else if(E.ph==='saut'){E.vs=.55*v;
    if(sol&&E.pt>.3){E.side=Math.sign(E.lat)||E.side;E.vl=0; // posé de l'autre côté : il la suit, ou il plonge
      if(Math.random()<.5){E.ph='suit';E.dur=2.5+Math.random()*2;}else E.ph='plonge';E.pt=0;}}
  if(!sol||E.vh>0){const h0=E.h;E.vh-=JSG_G*dt;E.h+=E.vh*dt;
    if(E.h<0&&h0>=-.01&&Math.abs(E.lat)<RH+.5){E.h=0;E.vh=0;}} // il retombe sur la dalle — ou passe le bord et tombe dans le vide
  E.s+=dir*E.vs*dt;E.lat+=E.vl*dt;
  E.air+=((E.h>.25||Math.abs(E.lat)>RH+.5?1:0)-E.air)*Math.min(1,dt*8);
  if(E.h<-4)E.fin+=dt; // tombé dans le vide : il s'efface
}
/* L'ATELIER (creatures/atelier.js, un Worker) : MESURÉ, les quatre formes VITRAIL coûtent 3,5 s de calcul ; en tranches de 5 ms dans la page,
   il fallait 8 à 13 s de menu — un JOUER rapide les finissait (et les compilait) en pleine course. Le Worker les calcule à côté et les rend
   en tableaux transférés ; `jsgGeo` refait les géométries telles que vitrailPrepare les aurait faites. Sans Worker (file://, refus, erreur,
   silence de 30 s) : retour au calcul en tranches d'avant, rien ne casse. */
function jsgGeo(o){const g=new THREE.BufferGeometry();for(const k in o.a)g.setAttribute(k,new THREE.BufferAttribute(o.a[k][0],o.a[k][1])); // (normal et aN gardent leur tableau commun, comme dans vitrailLisseG)
  g.setIndex(new THREE.BufferAttribute(o.i,1));g.boundingSphere=new THREE.Sphere(new THREE.Vector3(o.bs[0],o.bs[1],o.bs[2]),o.bs[3]);return g;}
function jsgAtelierRepli(){const L9=JSG.atW||[];JSG.at=null;JSG.atW=null;for(const W of L9)try{W.terminate();}catch(e){}}
function jsgAtelier(){JSG.at=null;try{if(typeof Worker!=='function'||location.protocol==='file:')return;
  const lots=[['bonjour','mangue'],['bord','course']]; // DEUX ouvriers en parallèle (les téléphones ont plusieurs cœurs) : ~0,9 s par forme, deux formes chacun
  let reste=lots.length;JSG.atW=[];JSG.at='calcule';JSG.atT=performance.now();
  for(const lot of lots){const W=new Worker('creatures/atelier.js?v=2');JSG.atW.push(W);
    W.onerror=function(ev){try{if(ev&&ev.preventDefault)ev.preventDefault();}catch(e){}if(JSG.atW&&JSG.atW.indexOf(W)>=0)jsgAtelierRepli();};
    W.onmessage=function(e){if(!JSG.atW||JSG.atW.indexOf(W)<0)return;try{for(const o of e.data){const F=o.n==='course'?SINGE_FC:singePoseForme(o.n);if(!F._geo)F._geo={lisse:jsgGeo(o.lisse),ecailles:jsgGeo(o.ecailles)};}}catch(er){jsgAtelierRepli();return;}
      try{W.terminate();}catch(e){}if(--reste===0){JSG.at='fini';JSG.atW=null;}};
    W.postMessage({formes:lot});}}catch(e){jsgAtelierRepli();}}
function jsgTick(dt){
  // LA FABRIQUE : les quatre formes, tranche par tranche (≤ 5 ms par image), puis UNE compilation hors écran au menu
  if(typeof singePoseForme!=='function')return; // (creatures/singe.js absent : pas de singes)
  if(!JSG.pret){if(JSG.at===undefined)jsgAtelier(); // (2026-10-15) L'ATELIER d'abord : un Worker calcule les formes hors du fil du jeu
    if(JSG.at&&JSG.at!=='fini'&&performance.now()-JSG.atT>30000)jsgAtelierRepli(); // muet depuis 30 s : le calcul en tranches reprend
    let fini=JSG.at==='fini';
    if(!fini&&!JSG.at){if(!JSG.fab)JSG.fab=(function*(){for(const n of ['bonjour','mangue','bord'])yield* vitrailPrepare(singePoseForme(n));yield* vitrailPrepare(SINGE_FC);})();
      const t0=performance.now();let r;do{r=JSG.fab.next();}while(!r.done&&performance.now()-t0<5);fini=r.done;}
    if(fini){JSG.pret=true;for(const n of ['bonjour','mangue','bord','course']){const S=singeNouveau('singeJade',n),nd=new THREE.Group();
      for(const k in JSG_VIT)S.U[k].value=JSG_VIT[k];nd.add(S.grp);nd.visible=false;JSG.node.add(nd);JSG.S[n]={S,nd};}}
    return;}
  if(!JSG.chaud){if(started&&!gameOver&&JSG.cur)return;JSG.chaud=true; // (au menu d'habitude ; une course partie trop tôt la fait ici, une fois, sans singe à l'écran)
   JSG.node.visible=true;for(const n in JSG.S)JSG.S[n].nd.visible=true;
    try{chauffeRendu([JSG.node]);}catch(e){}for(const n in JSG.S)JSG.S[n].nd.visible=false;JSG.node.visible=false;return;}
  if(JSG_ESSAI&&(!started||gameOver)&&!SF.force)SF.force={carte:'jade',meteo:null}; // (prototype) `?singesjade=1` : chaque PLAY part au SOLEIL DE JADE, pour essayer les singes
  if(paused)return;
  if(dt>0){JSG.v1.subVectors(carGroup.position,JSG.p0).multiplyScalar(1/dt);if(JSG.v1.lengthSq()<4e6)JSG.vel.lerp(JSG.v1,Math.min(1,dt*1.5));}JSG.p0.copy(carGroup.position);
  if(!jsgActif()){if(JSG.cur){JSG.why='inactif';jsgCache();}if(!started||gameOver)JSG.cle=null;return;}
  if(JSG.cle!==JADE.root||JSG.rs!==runStats){JSG.cle=JADE.root;JSG.rs=runStats;JSG.R0=null;jsgCache();jsgPlan();} // une nouvelle vallée, ou une nouvelle partie : un nouveau plan
  let R=jsgS();if(R==null)return;
  if(mode!=='drive'&&JSG.R0!=null&&Math.abs(R-JSG.R0)>Math.max(40,Math.abs(JSG.vR)*dt*4))R=JSG.R0+(driveDir||1)*JSG.vR*dt; // en vol, la dalle la plus proche peut être un AUTRE tronçon (au-dessous) : on prolonge l'élan
  if(!JSG.cur&&mode!=='boom'){for(const P of JSG.plan){if(P.fait)continue;if(R>=P.s-JSG_AV[P.type]){P.fait=true;if(Math.abs(R-P.s)<JSG_AV[P.type]+120)jsgLance(R,P.type);}break;}}
  const dir=driveDir||1;
  if(dt>0&&JSG.R0!=null){const r=(R-JSG.R0)/dt*dir;if(Math.abs(r)<400)JSG.vR+=(r-JSG.vR)*Math.min(1,dt*3);}JSG.R0=R; // la vitesse de la caisse LE LONG de la route
  const E=JSG.cur;if(!E)return;
  E.t+=dt;const F=JSG.F;
  if(E.mob)jsgBouge(E,dt,R,JSG.vR,dir);else jsgReveil(E,R,JSG.vR,dir); // (le réveil peut changer sa forme : o et S se lisent APRÈS)
  const o=E.o,S=o.S;
  const der=(R-E.s)*dir; // de combien la caisse l'a dépassé
  if(der>70||E.t>(E.mob?24:16)||mode==='boom'||E.fin>.6){JSG.why=der>70?'doublé':E.fin>.6?'vide':mode==='boom'?'boom':'temps';jsgCache();return;}
  if(E.ph==='vol'){const u=Math.min(1,E.pt/E.Tb),a=1-u,p=JSG.v1.set(0,0,0).addScaledVector(E.P0,a*a).addScaledVector(E.C,2*a*u).addScaledVector(E.P1,u*u);
    const z=JSG.v2.subVectors(E.C,E.P0).multiplyScalar(2*a).addScaledVector(JSG.v3.subVectors(E.P1,E.C),2*u); // la tangente du bond
    E.vh=z.y/E.Tb;z.y=0;if(z.lengthSq()>1e-4)E.z.copy(z.normalize());jsgPose(o,p,JSG.v3.set(0,1,0),E.z,E.ech);}
  else if(E.mob){frameAt(Math.max(0,Math.min(L-.01,E.s)),F);const p=JSG.v1.copy(F.p).addScaledVector(F.b,E.lat).addScaledVector(F.n,E.h);
    const z=JSG.v2.copy(F.t).multiplyScalar(dir*E.vs).addScaledVector(F.b,E.vl);if(z.lengthSq()>1)E.z.copy(z.normalize());else if(E.z.lengthSq()<.5)E.z.copy(F.t).multiplyScalar(dir); // il regarde où il court
    jsgPose(o,p,F.n,E.z,E.ech);}
  else if(E.type==='bonjour'){const z=JSG.v2.subVectors(E.vers,E.p);z.y=0;if(z.lengthSq()<1)z.set(0,0,1);z.normalize();
    const zc=JSG.cib.subVectors(carGroup.position,E.p);zc.y=0;if(zc.lengthSq()>1){zc.normalize();z.lerp(zc,.5).normalize();} // tourné vers la route, et un peu vers la caisse
    jsgPose(o,E.p,E.n,z,E.ech);}
  else{frameAt(Math.max(0,Math.min(L-.01,E.s)),F);const p=JSG.v1.copy(F.p).addScaledVector(F.b,E.lat);
    const z=E.type==='mangue'?JSG.v2.copy(F.t).multiplyScalar(-dir):JSG.v2.copy(F.b).multiplyScalar(E.cote);
    jsgPose(o,p,F.n,z,E.ech);}
  // l'apparition : il GRANDIT en 0,4 s (et rapetisse en partant, ou en tombant dans le vide)
  const k=Math.min(1,E.t/.4)*(der>40?Math.max(0,1-(der-40)/30):1)*(1-Math.min(1,E.fin/.6));o.nd.scale.setScalar(E.ech*Math.max(.01,k));
  S.U.uNoir.value=triNoir()?1:0;S.U.uLum.value.copy(F.n.lengthSq()>.5&&E.type!=='bonjour'?F.n:JSG.v3.set(0,1,0));camera.getWorldDirection(JSG.v3);S.U.uLum.value.addScaledVector(JSG.v3,-.4).normalize();
  const cible=o.nd.worldToLocal(JSG.cib.copy(carGroup.position));
  if(E.mob)singeCourt(S,dt*Math.min(2.4,Math.max(1,E.vs/30)),E.air,E.vh,cible); // (au galop à 300 km/h, les pattes battent plus vite)
  else singeAnimePose(S,dt,cible);
}
window.dbgJadeSinges=function(t,act){ // dbgJadeSinges() : le plan · dbgJadeSinges('bonjour'|'mangue'|'course'|'bord'[, 'suit'|'saute'|'plonge'|'reste']) : une rencontre tout de suite
  if(t==='gel'){paused=!paused;return paused;} // (banc) fige / relance la course sans le panneau de pause — pour photographier
  if(t==='montagnes'){const C=JADE.col,R=jsgS();if(!C||R==null)return null;const r0=pts[Math.max(0,Math.min(NP-1,Math.round((R+240)/L*(NP-1))))],o=[]; // (banc) les montagnes autour du point de la route 240 m devant : [distance, à la route, sommet − route, rayon]
    C.P.forEach(function(q){const d=Math.hypot(q[0]-r0.x,q[1]-r0.z);if(d<500)o.push([Math.round(d),Math.round(q[8]),Math.round(q[4]-r0.y),Math.round(q[2])]);});o.sort(function(a,b){return a[0]-b[0];});return o.slice(0,30);}
  if(t){if(!jsgActif())return 'il faut rouler au SOLEIL DE JADE';jsgCache();const R=jsgS();if(R==null)return 'pas de route sous la caisse';JSG.force=act||null;const ok=jsgLance(R,t);JSG.force=null;return ok?'lancé : '+t+' · '+JSG.cur.act:'pas de place (montagne introuvable, ou fin de piste)';}
  const v=new THREE.Vector3();const E=JSG.cur;
  return {pret:JSG.pret,chaud:JSG.chaud,atelier:JSG.at==null?(JSG.at===null?'tranches':'-'):JSG.at,actif:jsgActif(),demiRoute:+ROAD_HALF.toFixed(1),lat:+lat.toFixed(1),plan:JSG.plan.map(p=>({type:p.type,s:Math.round(p.s),fait:p.fait})),L:Math.round(L),
    vR:Math.round(JSG.vR),why:JSG.why||null,cur:E?{type:E.type,act:E.act,ph:E.ph,h:+E.h.toFixed(1),elat:+E.lat.toFixed(1),vs:Math.round(E.vs),t:+E.t.toFixed(1),s:Math.round(E.s),vu:E.o.nd.visible&&JSG.node.visible,ech:+E.o.nd.scale.x.toFixed(2),pos:E.o.nd.position.toArray().map(Math.round),caisse:carGroup.position.toArray().map(Math.round),ecran:E.o.nd.getWorldPosition(v).project(camera).toArray().map(a=>+a.toFixed(2)),dist:Math.round(E.o.nd.getWorldPosition(v).distanceTo(camera.position))}:null};
};
/* LES DAUPHINS DE LA MER DE JADE (2026-10-15, Léo : « les dauphins jouent, viennent dire coucou à la voiture dans l'eau (SOLEIL DE JADE) et
   sautent en même temps que nous ; pas à chaque fois, mais au bout de 5 s dans l'eau on les croise » — puis, v2 : « ça pourrait être plus pro,
   et tu pourrais même les faire apparaître avant » → au questionnaire : des BONDS NATURELS, PLUS BEAUX À L'ÉCRAN, un COUCOU PLUS CLAIR ; et
   ils sont là AVANT, dès le premier plongeon). Seulement dans la MER des PICS DE JADE ; nulle part ailleurs, et la
   figure LE DAUPHIN ne revient pas. Du DÉCOR : ni aura, ni collision.
   · AVANT LE PLONGEON : la caisse tombe vers la mer (en vol, à moins de 170 m de l'eau, l'impact dans moins de 2,6 s) → le banc est déjà là,
     sous elle, et BONDIT au-devant d'elle : on le voit en tombant. ⚠ Essayé puis retiré : un banc VU DEPUIS LA ROUTE — MESURÉ en captures, la
     dalle cache toute la mer à la caméra de poursuite (elle est 45 à 230 m plus bas : le regard touche la route bien avant l'eau).
   · DÈS LE PLONGEON : la caisse touche l'eau sans avoir été vue tomber → le banc arrive de devant, à sa profondeur ; il joue DEVANT elle, de part
     et d'autre (comme à l'étrave d'un bateau — MESURÉ : en cercle autour d'elle, ils étaient derrière la caméra) ; quand elle flotte ou surfe,
     ils bondissent ; toutes les 3,6-5 s l'un vient à la PORTIÈRE faire COUCOU : sous l'eau il tourne la tête vers l'objectif et vrille
     lentement ; à la surface il saute à côté d'elle en vrillant (son `dauphin.banc`). Quand elle JAILLIT (jadeEauVol → jdmJailli), une fois
     sur deux (JDM_SAUT) ils sautent AVEC elle (élan plafonné : ~10 m). Elle retrouve la route, explose ou part loin → ils plongent.
   · LE BOND NATUREL : ÉLAN (0,3 s : il plonge un peu, la queue bat vite) → le saut (le corps épouse l'arc : `uDol.w` = la courbure de sa
     trajectoire, la queue se relâche en l'air) → l'entrée NEZ LE PREMIER (il poursuit sa plongée un instant). Les gerbes naissent LÀ OÙ SON
     CORPS TRAVERSE LA SURFACE, image après image (la sortie ruisselle de la queue, l'entrée éclabousse autour du nez) + une ride à chaque passage.
   Le modèle : le grand dauphin VITRAIL de creatures/dauphin.js (mkDauphin : écailles en cubes, coque, cœur — 3 programmes compilés AU MENU par
   chauffeRendu, 0 en course) ; les cubes FINS dès 150 px à l'écran. Les gouttes, rides, bulles = celles de la caisse (eauP, eauRide, jadeBullesJet).
   ⚠ Dans la mer leur surface est celle où FLOTTE la caisse (jadeSurfMoy : la houle calmée — la houle en cubes `jadeSurf` varie de ±20 m d'une
   colonne à l'autre : sur elle ils bondissaient à 30 m) ; l'eau les
   COUPE (uSurf) quand on les regarde d'au-dessus sans la peau de la mer ; sous la peau on les devine, comme la caisse.
   Console : dbgJadeDauphins() (l'état, où ils sont à l'écran) · ('tombe') la caisse tombe vers la mer · ('viens') · ('saut') ·
   ('plonge') un vrai plongeon sauté avec eux · ('route') la mer ramène la caisse (le départ) · ('gel') fige. */
const JDM_ECH=1.6,JDM_G=16,JDM_SAUT=.5,JDM_SAUT_H=8; // taille dans la mer · gravité de leurs bonds (m/s²) · chance de sauter avec la caisse · hauteur de ce saut (m, × la taille)
const JDM_AVANT={h:170,tti:2.6}; // AVANT LE PLONGEON : à moins de h m de l'eau, l'impact dans moins de tti s
const JDM={pret:false,chaud:false,node:new THREE.Group(),D:[],mode:null,part:0,t:0,vrT:2.5,force:false,salut:false,noir:-1,routeT:0,accT:0,cle:null,viens:false,
  cv:new THREE.Vector3(),c0:new THREE.Vector3(),H:new THREE.Vector3(0,0,1),v1:new THREE.Vector3(),v2:new THREE.Vector3(),v3:new THREE.Vector3(),Xr:new THREE.Vector3(),
  X:new THREE.Vector3(),Y:new THREE.Vector3(),Z:new THREE.Vector3(),UP:new THREE.Vector3(0,1,0),AX:new THREE.Vector3(1,0,0),m:new THREE.Matrix4(),q:new THREE.Quaternion()};
JDM.node.visible=false;scene.add(JDM.node);
function jdmActif(){return !!(started&&!gameOver&&jadeEauOk()&&!TUTO.on);}
function jdmFabrique(){ // les trois dauphins (le modèle est bâti au chargement de creatures/dauphin.js) — une fois
  if(typeof mkDauphin!=='function'||typeof DOL_GEO==='undefined'||!DOL_GEO)return false;
  for(let i=0;i<3;i++){const b=DOL_BANC[i]||DOL_BANC[0],d=mkDauphin();d.visible=false;d.frustumCulled=false;JDM.node.add(d);
    JDM.D.push({d:d,b:b,p:new THREE.Vector3(),v:new THREE.Vector3(),X:new THREE.Vector3(1,0,0),F:[11,17,23][i],L:[-6.5,6,-1.5][i],h:[0,1.8,-1.6][i],k:JDM_ECH,
      ph:i*1.7,roll:i*2.3,vr:-1,vrS:1,vrD:.9,st:'nage',up:false,bondT:.6+i*.5,elT:0,plT:0,hB:4,sautT:-1,sV:null,saut:false,cou:0,cs:1,vrF:false,n:0,arr:true});}
  return true;}
function jdmRaz(E){E.st='nage';E.saut=false;E.cou=0;E.sautT=-1;E.vr=-1;E.up=false;E.elT=0;E.plT=0;E.n=0;E.vrF=false;}
function jdmCache(){for(const E of JDM.D)E.d.visible=false;JDM.node.visible=false;JDM.mode=null;JDM.part=0;}
function jdmNoirMaj(){const n=triNoir()?1:0;if(n===JDM.noir)return;JDM.noir=n; // la dark triad : noirs, liseré rouge sang (comme avant)
  DOL_U.uNoir.value=n;DOL_U.uRimA.value.setRGB(n?1:.55,n?.08:.9,n?.14:1);DOL_U.uRimB.value.setRGB(n?.75:1,n?0:.6,n?.08:.88);DOL_U.uEcC.value.setRGB(n?1:.75,n?.22:.97,n?.28:1);
  for(const E of JDM.D){E.d.material.color.setHex(n?0x0e0d12:0xffffff);if(E.d.userData.coque)E.d.userData.coque.material.color.setHex(n?0x0e0d12:0xffffff);}}
function jdmGerbe(x,sy,z,up,k,s9){ // un dauphin perce la surface (up : la sortie) ou y rentre : une ride, et une couronne de gouttes (à la taille du dauphin)
  try{eauPIm();eauRide(x,sy,z,(up?.1:.16)*s9);const n=(up?14:24)*Math.min(2.2,s9*k)|0;
    for(let i=0;i<n;i++){const a=Math.random()*6.2832,c=Math.cos(a),s=Math.sin(a),r=(.3+Math.random()*.9)*s9,vo=(1.5+Math.random()*4)*Math.sqrt(s9);
      eauP(x+c*r,sy+.2,z+s*r,c*vo,((up?5:7)+Math.random()*(up?6:9))*Math.sqrt(s9),s*vo,(.06+Math.random()*.15)*s9,.7+Math.random()*.7,sy,(Math.random()*3)|0);}}catch(e){}}
function jdmViens(tti){ // le banc arrive : devant la caisse, à sa profondeur — ou, quand elle TOMBE encore (tti : l'impact dans tti s), à mi-chemin de son point d'impact (MESURÉ : sur l'impact, ils étaient à 170 m — minuscules), et il bondit au-devant d'elle (×1,8 : il reprend sa taille sous l'eau)
  const C=carGroup.position,H=JDM.H,px=-H.z,pz=H.x,ix=tti?C.x+JDM.cv.x*tti*.55:C.x,iz=tti?C.z+JDM.cv.z*tti*.55:C.z;JDM.mode='mer';JDM.part=0;JDM.t=0;JDM.vrT=tti?tti+1.6:1.6;JDM.salut=false;JDM.node.visible=true;
  JDM.D.forEach(function(E,i){const lt=(i-1)*(tti?9:6)+(Math.random()-.5)*2,av=tti?8+i*7:30+i*6;jdmRaz(E);E.arr=true;E.k=JDM_ECH*E.b.scale*(tti?1.8:1);E.bondT=tti?.05+i*.3:.5+i*.35;
    E.p.set(ix+H.x*av+px*lt,0,iz+H.z*av+pz*lt);const sy=jadeSurfMoy(E.p.x,E.p.z);E.p.y=tti?sy-2.5:Math.min(C.y-1+(i-1)*1.5,sy-2);E.v.copy(JDM.cv).multiplyScalar(.3);E.v.y=0;});
  if(tti)try{if(SONV2)sfx('dauphin.banc',{vol:-4});}catch(e){}}
function jdmJailli(vx,vy,vz){ // appelée par jadeEauVol au JAILLISSEMENT : la vitesse de la caisse (m/s du monde)
  if(JDM.mode!=='mer'||JDM.part||!(JDM.force||Math.random()<JDM_SAUT))return;JDM.force=false;
  JDM.D.forEach(function(E,i){E.sautT=.05+i*.13+Math.random()*.06;E.sV=[vx,vy,vz];});}
function jdmTick(dt){
  if(!JDM.pret){if(!jdmFabrique())return;JDM.pret=true;return;}
  if(!JDM.chaud){if(started&&!gameOver&&jadeEauOk())return; // (au menu : les trois programmes se compilent hors écran, une fois)
    JDM.chaud=true;JDM.node.visible=true;for(const E of JDM.D)E.d.visible=true;try{chauffeRendu([JDM.node]);}catch(e){}for(const E of JDM.D)E.d.visible=false;JDM.node.visible=false;return;}
  if(paused)return;
  const C=carGroup.position;
  if(dt>0){JDM.v1.subVectors(C,JDM.c0).multiplyScalar(1/dt);if(JDM.v1.lengthSq()<9e6)JDM.cv.lerp(JDM.v1,Math.min(1,dt*6));}JDM.c0.copy(C);
  {const h=Math.hypot(JDM.cv.x,JDM.cv.z);if(h>3)JDM.H.set(JDM.cv.x/h,0,JDM.cv.z/h);}
  if(!jdmActif()){if(JDM.mode||JDM.node.visible)jdmCache();JDM.cle=null;return;}
  if(JDM.cle!==runStats){JDM.cle=runStats;jdmCache();} // une nouvelle partie
  if(mode==='drive')JDM.routeT+=dt;else JDM.routeT=0;
  if(!JDM.mode&&mode==='fall'&&(JEAU.dans||JDM.viens)){JDM.viens=false;jdmViens(0);} // DÈS LE PLONGEON
  if(!JDM.mode&&mode==='fall'&&!JEAU.dans&&JDM.cv.y<-3){const h=C.y-jadeSurfMoy(C.x,C.z),tti=h/Math.max(3,-JDM.cv.y); // AVANT LE PLONGEON : elle tombe vers la mer
    if(h>4&&h<JDM_AVANT.h&&tti<JDM_AVANT.tti){JDM.accT+=dt;if(JDM.accT>.25)jdmViens(tti);}else JDM.accT=0;}else JDM.accT=0;
  if(!JDM.mode)return;
  JDM.t+=dt;
  if(!JDM.part&&(mode==='boom'||JDM.routeT>.6||JDM.D[0].p.distanceToSquared(C)>260*260))JDM.part=.01; // LE DÉPART : elle a retrouvé la route (ou s'est posée sur une autre), elle explose, elle est loin
  if(JDM.part){JDM.part+=dt;if(JDM.part>2.6){jdmCache();return;}}
  jdmNoirMaj();
  const H=JDM.H,px=-H.z,pz=H.x,cvh=Math.hypot(JDM.cv.x,JDM.cv.z),syC=jadeSurfMoy(C.x,C.z),pres=Math.abs(C.y-syC)<3.5&&mode==='fall',
    sousCam=JSOUS.uK>.5,cam=camera.position,tanH=Math.tan(camera.fov*Math.PI/360),gW=JDM_G;
  DOL_U.uLum.value.set(0,1,0);camera.getWorldDirection(JDM.v2);DOL_U.uLum.value.addScaledVector(JDM.v2,-.4).normalize();DOL_U.uEcume.value=.32;
  // LE COUCOU : l'un d'eux vient à la portière (la caméra est derrière la caisse : on le voit de côté)
  {JDM.vrT-=dt;if(JDM.vrT<=0&&!JDM.part){const L9=JDM.D.filter(function(E){return !(E.cou>0)&&!E.arr&&!E.saut&&E.st==='nage';});
    if(L9.length){const E=L9[(Math.random()*L9.length)|0];E.cou=2.6;E.vrF=false;E.cs=E.L?Math.sign(E.L):(Math.random()<.5?-1:1);JDM.vrT=3.6+Math.random()*1.4;
      try{if(SONV2)sfx('dauphin.banc',{vol:JDM.salut?-5:0});}catch(e){}JDM.salut=true;}else JDM.vrT=.5;}}
  for(let i=0;i<JDM.D.length;i++){const E=JDM.D[i],p=E.p,v=E.v,sy=jadeSurfMoy(p.x,p.z),s9=E.k/1.6,sc=JDM_ECH/1.5;
    if(Math.abs(E.k-JDM_ECH*E.b.scale)>.01&&E.st==='nage'&&p.y<sy-.8*E.k)E.k+=(JDM_ECH*E.b.scale-E.k)*Math.min(1,dt*1.5); // le banc de l'accueil (×1,8) reprend sa taille sous l'eau, jamais à la vue
    if(E.sautT>=0){E.sautT-=dt;if(E.sautT<0){ // LE SAUT AVEC LA CAISSE : un élan plafonné (il ne rejoint pas la route), sa course à elle
      const dep=Math.min(5,Math.max(0,sy-p.y));v.y=Math.min(Math.max(E.sV[1],8),Math.sqrt(2*gW*(JDM_SAUT_H*E.k+dep)));v.x=E.sV[0]*.95;v.z=E.sV[2]*.95;E.st='bond';E.saut=true;E.arr=false;}}
    // OÙ IL VA
    let tx,tz,ty,kp,bvx,bvz,saute=false,hB=0,cloche=0;
    {let f9,l9;
      if(E.cou>0){E.cou-=dt;const ph=2.6-E.cou;f9=.6*sc;l9=E.cs*3.9*sc;cloche=Math.max(0,Math.sin(Math.PI*Math.min(1,Math.max(0,(ph-.8)/1.7))));
        if(ph>1&&!E.vrF){E.vrF=true;E.vr=0;E.vrS=E.cs;if(pres&&E.st==='nage'){E.st='elan';E.elT=.25;E.hB=3.2*E.k;E.bondT=1.6;E.vrD=1.05;}else E.vrD=1.25;}} // à la surface il saute en vrillant ; sous l'eau il vrille lentement en nous regardant
      else{f9=(E.F+3*Math.sin(JDM.t*.7+i*2))*sc;l9=(E.L+2.5*Math.sin(JDM.t*.9+i*1.3))*sc;}
      if(E.saut){f9=(i-1)*3*sc;l9=(i===1?-1:1)*(5+i)*sc;} // en l'air avec elle : à ses côtés
      tx=C.x+H.x*f9+px*l9;tz=C.z+H.z*f9+pz*l9;if(E.arr&&Math.hypot(tx-p.x,tz-p.z)<22)E.arr=false;
      kp=E.arr?.35:(E.saut?1.2:2.2);bvx=JDM.cv.x*(E.arr?.25:1);bvz=JDM.cv.z*(E.arr?.25:1);
      ty=Math.min(C.y+E.h*.6+1.1*Math.sin(JDM.t*1.1+i*2),sy-1.6);if(C.y>syC+3)ty=sy-2.2;
      saute=E.arr||pres;hB=(2.4+1.6*Math.random())*E.k;}
    {const e=Math.min(1,dt*(E.arr?2:4)),dx=tx-p.x,dz=tz-p.z;v.x+=(bvx+dx*kp-v.x)*e;v.z+=(bvz+dz*kp-v.z)*e;
      const vh=Math.hypot(v.x,v.z),vmax=Math.max(26,cvh*1.4+16);if(vh>vmax){v.x*=vmax/vh;v.z*=vmax/vh;}}
    // LE BOND NATUREL : l'élan (il plonge un peu, la queue bat vite) → le saut → l'entrée nez le premier
    if(JDM.part){v.y+=(-9-v.y)*Math.min(1,dt*2);E.st='nage';E.saut=false;} // ils plongent et s'en vont
    else if(E.st==='bond'){v.y-=gW*dt;if(p.y<sy-.35*E.k&&v.y<0){E.st='nage';E.plT=.5;E.saut=false;}}
    else if(E.st==='elan'){E.elT-=dt;v.y+=((sy-1.7*E.k-p.y)*3-v.y)*Math.min(1,dt*5);
      if(E.elT<=0){E.st='bond';v.y=Math.sqrt(2*gW*(E.hB+Math.max(0,sy-p.y)));}}
    else{v.y+=((ty-p.y)*2.5-v.y)*Math.min(1,dt*(E.plT>0?1.1:4));if(E.plT>0)E.plT-=dt;
      E.bondT-=dt;if(E.bondT<=0&&saute&&p.y>sy-4*E.k){E.st='elan';E.elT=.3;E.hB=hB;E.bondT=E.arr?.9+Math.random()*.4:1.1+Math.random()*1.1;}
      else if(E.bondT<=0)E.bondT=.3;}
    p.addScaledVector(v,dt);
    if(p.y<sy-60)p.y=sy-60;
    // LA POSE : le nez suit sa course (au coucou, la tête se tourne vers l'objectif), le dos vers le ciel, un léger roulis — et la vrille
    const d=E.d,vl=v.length();if(vl>1)E.X.copy(v).multiplyScalar(1/vl);
    const X=JDM.Xr.copy(E.X);if(cloche>0&&E.st!=='bond'){JDM.v3.subVectors(cam,p).normalize();X.lerp(JDM.v3,.45*cloche).normalize();}
    const Y=JDM.Y.crossVectors(X,JDM.UP);if(Y.lengthSq()<1e-4)Y.set(0,0,1);Y.normalize();const Zb=JDM.Z.copy(Y);Y.crossVectors(Zb,X);
    JDM.m.makeBasis(X,Y,Zb);d.quaternion.setFromRotationMatrix(JDM.m);
    E.roll+=dt*1.3;let rv=Math.sin(E.roll)*(E.st==='bond'?.22:.12);if(E.vr>=0){E.vr+=dt/E.vrD;if(E.vr>=1)E.vr=-1;else rv+=E.vrS*6.2832*THREE.MathUtils.smoothstep(E.vr,0,1);}
    d.quaternion.multiply(JDM.q.setFromAxisAngle(JDM.AX,rv));
    d.position.copy(p);d.scale.setScalar(E.k);d.updateMatrixWorld(true);
    const dc=Math.sqrt(p.distanceToSquared(cam))+.01,px9=DOL_L*E.k/dc*VP.h/(2*tanH),g9=px9>150?DOL_GEO:DOL_GEO_L;if(d.geometry!==g9)d.geometry=g9; // (v2) les cubes FINS dès 150 px
    if(!d.visible)d.visible=true;
    // la NAGE dans le shader : la queue bat vite à l'élan, se relâche en l'air ; le corps épouse la courbure de l'arc
    const vh9=Math.hypot(v.x,v.z),kap=E.st==='bond'?gW*vh9*vh9/Math.pow(Math.max(2,vl),3):0;
    E.ph+=dt*(E.st==='elan'?15:E.st==='bond'?3.5:7.5+Math.min(8,vl/8));
    const mu=d.material.userData;mu.uDol.value.set(E.st==='elan'?.42:E.st==='bond'?.07:.24,E.ph,2.3,Math.min(.1,kap*E.k*.5));
    if(sousCam)mu.uSurf.value.set(0,1,0,-1e9);else mu.uSurf.value.set(0,1,0,sy); // sous la peau de la mer on le devine ; sans elle, l'eau le coupe
    // L'EAU : une ride et une couronne à chaque passage ; et les gouttes LÀ OÙ SON CORPS TRAVERSE LA SURFACE, image après image
    const up=p.y>sy,prox=p.distanceToSquared(cam)<420*420;
    if(up!==E.up){E.up=up;if(Math.abs(v.y)>2&&prox)jdmGerbe(p.x,sy,p.z,up,Math.min(1.3,.5+Math.abs(v.y)/25),s9);}
    if(prox&&Math.abs(X.y)>.12){const t9=(sy-p.y)/X.y;if(Math.abs(t9)<DOL_L*.5*E.k&&Math.random()<dt*42)try{eauPIm();const qx=p.x+X.x*t9,qz=p.z+X.z*t9;
      for(let n=0;n<2;n++)eauP(qx+(Math.random()-.5)*.6*s9,sy+.15,qz+(Math.random()-.5)*.6*s9,v.x*.22+(Math.random()-.5)*3*s9,(3+Math.random()*6)*Math.sqrt(s9),v.z*.22+(Math.random()-.5)*3*s9,(.07+Math.random()*.16)*s9,.6+Math.random()*.6,sy,(Math.random()*3)|0);}catch(e){}}
    if(!up&&JSOUS.sous&&E.plT>0&&Math.random()<dt*22)try{jadeBullesJet(p,2,.5*s9);}catch(e){} // l'entrée sous l'eau : une traînée de bulles
  }
}
window.dbgJadeDauphins=function(t){ // dbgJadeDauphins() : l'état · ('tombe') · ('viens') · ('saut') · ('plonge') · ('route') · ('gel')
  if(t==='gel'){paused=!paused;return paused;}
  if(t==='tombe'){if(!jdmActif())return 'il faut rouler au SOLEIL DE JADE';jdmCache();JEAU.dans=false;JEAU.cd=0;dbgEau({h:110,vy:-30});return 'elle tombe vers la mer : le banc l\'attend';} // (banc) avant le plongeon
  if(t==='viens'){if(!jdmActif())return 'il faut rouler au SOLEIL DE JADE';if(mode!=='fall')return 'il faut être dans la mer (dbgEau({h:30,vy:-40}))';JDM.viens=true;return 'ils arrivent';}
  if(t==='saut'){JDM.force=true;return 'le prochain jaillissement est sauté avec eux';}
  if(t==='plonge'){if(!jdmActif()||mode!=='fall')return 'pas dans la mer';JEAU.dans=false;JEAU.cd=0;JDM.force=true;dbgEau({h:40,vy:-120});return 'un vrai plongeon, et ils sautent avec elle à la sortie';} // (banc) le saut avec la caisse
  if(t==='route'){if(!jdmActif()||mode!=='fall')return 'pas dans la mer';jadeEauRamene();return 'la mer la ramène sur la route';} // (banc) le départ du banc
  const C=carGroup.position;
  return {pret:JDM.pret,chaud:JDM.chaud,actif:jdmActif(),mode:JDM.mode,part:+JDM.part.toFixed(2),t:+JDM.t.toFixed(1),
    D:JDM.D.map(function(E){const q=E.p.clone().project(camera),sy=jadeSurfMoy(E.p.x,E.p.z);return {st:E.st,vu:E.d.visible,k:+E.k.toFixed(2),n:E.n,dist:+E.p.distanceTo(C).toFixed(1),sousSurf:+(sy-E.p.y).toFixed(1),arr:E.arr,cou:+E.cou.toFixed(1),vr:+E.vr.toFixed(2),
      ecran:q.z<1&&Math.abs(q.x)<1&&Math.abs(q.y)<1?[+q.x.toFixed(2),+q.y.toFixed(2)]:null};})};
};
