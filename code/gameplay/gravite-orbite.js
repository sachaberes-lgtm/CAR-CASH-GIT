/* LA GRAVITÉ DE L'ORBITE (2026-09-28, portée de la lignée car-crash) — l'orbite était un décor : mêmes sauts, même jauge qu'aux nuages.
   En ESPACE (niveau EN ORBITE et toute la carrière ESPACE) la gravité est DIVISÉE PAR DEUX : `gK()` est lu par TOUS les intégrateurs
   de chute (joueur, vol plané à la nitro, viseur, meute, dos d'âne, plots qui valsent) ; la jauge d'airtime passe de 6 à 10,2 s
   (`airMax()`) — un saut deux fois plus haut ne doit pas exploser en plein ciel. ⚠ Le VOL PLANÉ à la nitro reprend une PART de la
   gravité : il est ×gK lui aussi, sinon il la battrait (.6 × 33 > .5 × 33) et la caisse monterait toute seule. Mesuré là-bas :
   même impulsion → 13,5 m de haut contre 6,7. Jamais au parc (ses sauts sont réglés à part). */
const ORB_G=.5,ORB_AIR=5/6; /* (2026-10-14 soir, Sacha : « dans l'espace 5 secondes de air time ») la jauge de l'espace passe de 10,2 s à 5 s (6 × 5/6) : moins que sur Terre, alors que les sauts y montent deux fois plus haut — voulu */
function gK(){return (LVL.espaceA>=.5&&!PARK.on)?ORB_G:(DN.gx>1?DN.gx:1);} /* (2026-10-23, DUNES) DN.gx : la pesanteur d'un vol de tremplin, tirée à la vitesse du décollage (voir dnLevre) — plus on va vite, plus la caisse retombe vite : elle se pose sur l'ÉPAULE à toute vitesse */
function volSens(){return SAVE.d&&SAVE.d.volH==='plonge'?1:-1;} // (2026-10-10) absent = MONTE
/* ===== VOL INVERSÉ (2026-10-27, Léo : « option inverted, vol inversé haut et bas ») ===== */
function volInv(){return SAVE.d&&SAVE.d.volInv?-1:1;} // -1 = haut/bas inversés en vol (clavier ET pouce) ; absent = normal
function volInvBascule(){SAVE.d.volInv=SAVE.d.volInv?0:1;SAVE.flush();}
function volhBascule(){SAVE.d.volH=volSens()<0?'plonge':'monte';SAVE.flush();} // (2026-09-30, R7-5) LE seul écrivain de « POUCE HAUT EN VOL » : les RÉGLAGES et la PAUSE passent par lui // (2026-09-29) « pouce en HAUT = monte » : l'assiette au pouce s'inverse (le clavier ne change pas)
function airMax(){return AIR_MAX*(gK()<1?ORB_AIR:1);}
// AIR_RATE : le vol se joue PLUS VITE en temps réel — la parabole dans l'espace est identique
// (viseur d'atterrissage + seuils de figures inchangés), mais on passe moins de temps à flotter.
let fallVH0=-1; // (vol v6) vitesse HORIZONTALE au décollage : au-delà, la traînée de la route s'applique en vol
let AIR_RATE=1; // base V1 (temps réel) — startFall le RE-pilote depuis 2026-07-20 : =1 sous 450 km/h affichés, puis rampe douce jusqu'au cap 1.35 (l'ancienne ère 2.3 COMPENSAIT SPD=.25 ; ici c'est un dosage de tempo, pas une compensation).
const PARK={on:false}; // MODE FREESTYLE : le parc de figures (pas une course). Armé au menu, persiste entre les runs. Neutralise police/mort/portail.
const PARK_VCAP=145; // PARC : plafond de vitesse (m/s ≈ 260 km/h affichés) — la nitro infinie ne DOIT PAS envoyer à 1000 km/h ingérables ; on garde une vitesse RAPIDE mais CONTRÔLABLE (sol ET air)
const SPD=0.48; // +20 % (2026-09-25, user : « augmente la vitesse global du jeu et des voitures de 20 % ») — 0.4 × 1,2 ; il venait de −20 % (0.5 → 0.4) le matin même —  // vitesse globale du jeu — RESTAURÉ à la valeur V1 (2026-07-19) : le ÷2 « trop rapide dès le début » tuait le fun nerveux/arcade de la V1 ; le user tranche pour la V1. SPD scale TOUT : avance joueur/bots, chute, viseur ET compteur (donc les km/h affichés DOUBLENT — seuils de sensation ABSOLUS ajustés en conséquence, les systèmes RELATIFS via vmaxShow s'ajustent seuls)
const BOOM_SOL={ok:false,p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()}; // (2026-09-28) le bitume sous l'explosion : ses pièces y rebondissent
/* (2026-10-14, sensations) L'ÉPAVE GARDE SON ÉLAN. Les pièces partaient en étoile depuis un point FIXE : à 200 km/h la caisse
   s'arrêtait net dans l'air, comme collée. Elles héritent d'une part de sa vraie vitesse (PT_U.uVc, celle que suit la caméra) : 22 %,
   12 m/s au plus — au sol la roue file DEVANT, dans le vide la pluie de tôle continue de TOMBER. Les éclats, plus légers, moitié moins.
   Pas contre un MUR (tour, façade, pic : rien ne traverse). debrisLoin repasse derrière : jamais vers l'objectif. */
const SENS_BOOM={v:new THREE.Vector3(),n:0,t0:0};
function sensBoomElan(){
  if(mortCause==='tour'||mortCause==='facade'||mortCause==='pic')return;
  const V=SENS_BOOM.v.copy(PT_U.uVc.value),l=V.length();if(!(l>3))return; // (un NaN ne passe pas)
  V.multiplyScalar(Math.min(12,l*.22)/l);
  for(const d of debris){if(!d||!d.v)continue;d.v.addScaledVector(V,d.part?1:.5);debrisLoin(d.v);}
}
/* (2026-10-14, sensations) LE REBOND SE SENT. Roue, capot, éclats rebondissaient sur la dalle en silence, tous pareils (×.55 partout).
   · une ROUE (clone d'un moyeu : userData.R) est en caoutchouc : elle garde son élan le long de la route (×.83 au lieu de ×.55),
     saute un peu plus haut et TOURNE à la vitesse où elle file — elle s'en va en rebondissant au lieu de tomber comme une plaque ;
   · toute pièce qui tape à plus de 3 m/s crache quelques étincelles qui COURENT au ras du bitume (sparkGold, 2 à 5) ;
   · les vraies pièces font cliqueter la tôle (debris.tole, dosé au choc) et les deux premières donnent un tap léger dans la main —
     après le motif de la mort (boomT > .35 s), par le limiteur commun. Dix rebonds comptés par mort, pas un de plus. */
function sensBoomRebond(d,vn){
  if(boomT<SENS_BOOM.t0)SENS_BOOM.n=0;SENS_BOOM.t0=boomT; // une mort neuve : le compte repart (boomT est reparti de 0)
  const N=BOOM_SOL.n,V=d.v,k=V.dot(N),p=d.m.position,roue=!!(d.part&&d.m.userData&&d.m.userData.R>0);
  if(roue){V.addScaledVector(N,-k).multiplyScalar(1.5).addScaledVector(N,k*1.6); // le long de la dalle ×1,5 · vers le haut ×1,6
    d.rx=(d.rx<0?-1:1)*Math.min(18,V.length()/Math.max(.2,d.m.userData.R));d.ry*=.4;}
  if(SENS_BOOM.n>=10)return;SENS_BOOM.n++;
  const ne=Math.min(5,2+(vn*.25|0));
  for(let i=0;i<ne;i++){const h=1+Math.random()*2.5; // elles décollent à peine de la dalle (le long de SA normale : vrai aussi sous la route)
    spawnP(sparkGold,p.x,p.y,p.z,V.x*.7+N.x*h+(Math.random()-.5)*7,V.y*.2+N.y*h,V.z*.7+N.z*h+(Math.random()-.5)*7,.22+Math.random()*.2);}
  if(!d.part)return;
  sfx('debris.tole',{vol:Math.max(-12,Math.min(0,-11+vn*.7))});
  if(SENS_BOOM.n<=2&&boomT>.35)sensHap(10,1);
}
/* (2026-10-14, sensations) LA PLUIE DE BRAISES REBONDIT. Les braises orange et jaunes retombent en arc (acc 13 / 16) mais passaient
   À TRAVERS la dalle : elles s'éteignaient sous la route. Sur le plan de BOOM_SOL (mort au sol seulement, dans la largeur de la route),
   elles sautillent — 45 % du choc rendu, 30 % de frottement — et meurent en dansant sur le bitume. ≤ 100 cases, zéro allocation ;
   une réserve endormie ne coûte rien. Le rebond ne dépend pas du pas : il se déclenche au contact, la gravité reste à updatePool. */
function sensBoomBraises(P){
  if(!P||P.dort)return;
  const p=P.pos,v=P.vel,L=P.life,S=BOOM_SOL,nx=S.n.x,ny=S.n.y,nz=S.n.z,ox=S.p.x,oy=S.p.y,oz=S.p.z,bx=S.b.x,by=S.b.y,bz=S.b.z;
  for(let i=0,j=0;i<P.n;i++,j+=3){if(!(L[i]>0))continue;
    const dx=p[j]-ox,dy=p[j+1]-oy,dz=p[j+2]-oz,h=dx*nx+dy*ny+dz*nz;if(h>=.06||h<-1.5)continue;
    const vn=v[j]*nx+v[j+1]*ny+v[j+2]*nz;if(vn>=0||Math.abs(dx*bx+dy*by+dz*bz)>ROAD_HALF)continue;
    const r=.06-h,w=-.45*vn; // remise sur la dalle · la vitesse de rebond
    p[j]+=nx*r;p[j+1]+=ny*r;p[j+2]+=nz*r;
    v[j]=(v[j]-nx*vn)*.7+nx*w;v[j+1]=(v[j+1]-ny*vn)*.7+ny*w;v[j+2]=(v[j+2]-nz*vn)*.7+nz*w;}
}
/* (2026-10-14, sensations) CONTRE UN PIC DE JADE, ON S'ÉCRASE. La mort 'pic' était la seule sans signature : même étoile, pas de son
   de cause. La roche ne se traverse pas : la part de vitesse de chaque pièce qui FONÇAIT dans le pic repart en arrière (un quart rendu,
   doux : rien ne vole vers l'objectif), une gerbe d'étincelles gicle à rebours du choc, et la pierre craque (`cratere`, baissé de
   7 dB sous l'explosion — faute d'un vrai son de roche, voir les notes). Instantané : rien n'attend, rien ne dure. */
function sensBoomRoc(){
  if(mortCause!=='pic')return;
  const V=SENS_BOOM.v.copy(PT_U.uVc.value),l=V.length();if(!(l>3))return;
  V.multiplyScalar(1/l);
  for(const d of debris){if(!d||!d.v)continue;const a=d.v.dot(V);if(a>0)d.v.addScaledVector(V,-1.25*a);}
  const k=Math.min(1,l/60);
  for(let i=0;i<12;i++){const u=5+Math.random()*(6+10*k);
    spawnP(sparkGold,boomPos.x,boomPos.y,boomPos.z,-V.x*u+(Math.random()-.5)*9,-V.y*u+2+Math.random()*5,-V.z*u+(Math.random()-.5)*9,.3+Math.random()*.3);}
  if(!TUTO.on)sfx('cratere',{vol:-7});
}
const FVISEE={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()}; // le point de la route que la caméra regarde (route v2)
