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
/* (2026-10-22, Léo : « enlève les singes de la map jade, ou rends-les plus légers — sur la map grotte ça bugue moins et c'est aussi joli ») LES SINGES SONT ÉTEINTS :
   plus d'ouvriers au menu (3,5 s de calcul des quatre formes vitrail), plus de programmes à compiler, plus de géométries en mémoire, plus de rencontre à animer.
   Le code reste, intact : `?singes=1` (ou `?singesjade=1`) les rend, tels qu'ils étaient. */
const JSG_ON=JSG_ESSAI||/[?&]singes=1\b/.test(location.search);
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
function jsgActif(){return !JADE_SOBRE&&!!(started&&!gameOver&&JADE.root&&LVL.cur&&LVL.cur.piste==='jade'&&!PARK.on&&!TUTO.on);}
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
  if(!JSG_ON)return; // (2026-10-22) éteints : rien ne se fabrique, rien ne se dessine
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
/* (Les DAUPHINS DE LA MER DE JADE vivaient ici : retirés avec la mer le 2026-11-12.) */
