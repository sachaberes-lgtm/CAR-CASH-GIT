/* ===== L'ENREGISTREUR DE PARTIES (2026-10-24, passe perf, Sacha : « lors des tests la voiture reste conduite sur le sol alors qu'une grosse partie du
   jeu se joue en voltigeant dans les airs ; fais un mode où c'est moi qui joue en voltigeant et toi tu récupères de la data ») =====
   Le pilote des bancs roule au sol : il ne vole presque pas, ne fait pas de figures, ne rate rien. Ici c'est SACHA qui joue, et le jeu note, à chaque
   image de course : la durée de l'image, le temps pris par le jeu avant le dessin (proxy du JS de la boucle), et la PHASE — sol, vol, figure (en vol
   avec une figure lancée) — avec la map, le palier, le cran de qualité, la densité. À chaque fin de partie, la course est rangée dans le téléphone
   (localStorage `ccPerfRec`, les 15 dernières) : on la relit sur le Mac par le pont de l'inspecteur (`dbgPerfRec()`).
   ALLUMER : `?perfrec=1` dans l'adresse, ou `localStorage.ccPerfRecOn='1'` (l'appli n'a pas d'adresse), ou `dbgPerfRec(1)` ; ÉTEINDRE : `?perfrec=0`
   ou `dbgPerfRec(0)`. Éteint, il ne pose aucun rappel d'image : zéro coût. Rien de ce qu'il fait ne touche au jeu (il lit, il ne pose rien). */
const PREC={on:false,cours:null,der:0,K:'ccPerfRec',KON:'ccPerfRecOn',N:15,LONG:40,BORNES:[16.9,25,33.4,50,100]};
(function(){try{const q=location.search;
  if(/[?&]perfrec=0\b/.test(q)){localStorage.removeItem(PREC.KON);}
  else if(/[?&]perfrec=1\b/.test(q)){localStorage.setItem(PREC.KON,'1');PREC.on=true;}
  else PREC.on=localStorage.getItem(PREC.KON)==='1';}catch(e){PREC.on=/[?&]perfrec=1\b/.test(location.search);}})();
function precPhase(){ /* sol / vol / figure (en vol avec une figure lancée) */
  if(mode!=='fall')return 'sol';
  let f=false;try{const C=FX2&&FX2.corps;f=!!(C&&C.figs&&C.figs.length);}catch(e){}
  return f?'figure':'vol';}
function precLieu(){try{return (LVL&&LVL.cur&&LVL.cur.id)||'?';}catch(e){return '?';}}
function precNeuve(now){ return {debut:new Date().toISOString(),t0:now,carte:[precLieu()],palier:(typeof PAL!=='undefined'?PAL.n:null),
  phases:{},longues:[],secondes:[],sec:null,ql:[],dpr:[],cad:null,n:0}; }
function precPose(c,ph,dt,js){
  const p=c.phases[ph]||(c.phases[ph]={n:0,ms:0,js:0,max:0,b:[0,0,0,0,0,0]});
  p.n++;p.ms+=dt;p.js+=js;if(dt>p.max)p.max=dt;
  let i=0;while(i<PREC.BORNES.length&&dt>PREC.BORNES[i])i++;p.b[i]++;}
function precFinit(c,now){ /* la course finie : arrondie et rangée */
  if(c.sec)c.secondes.push(c.sec);c.duree=+((now-c.t0)/1000).toFixed(1);
  for(const k in c.phases){const p=c.phases[k];p.ms=Math.round(p.ms);p.js=Math.round(p.js);p.max=Math.round(p.max);p.ips=p.ms?+(1000*p.n/p.ms).toFixed(1):0;}
  delete c.sec;delete c.t0;
  try{const a=JSON.parse(localStorage.getItem(PREC.K)||'[]');a.push(c);while(a.length>PREC.N)a.shift();localStorage.setItem(PREC.K,JSON.stringify(a));}catch(e){}}
function precImage(ts){
  if(!PREC.on)return;requestAnimationFrame(precImage);
  const now=performance.now(),js=Math.max(0,now-ts),dt=PREC.der?ts-PREC.der:0;PREC.der=ts;
  const enCourse=started&&!gameOver;
  if(!enCourse){if(PREC.cours){precFinit(PREC.cours,now);PREC.cours=null;}return;}
  if(!PREC.cours){PREC.cours=precNeuve(now);return;}
  if(!(dt>0)||dt>5000)return; /* l'onglet caché, une pause : pas une image */
  const c=PREC.cours,ph=precPhase(),lieu=precLieu();c.n++;
  if(c.carte[c.carte.length-1]!==lieu)c.carte.push(lieu);
  precPose(c,ph,dt,js);
  const s=Math.floor((now-c.t0)/1000);
  if(!c.sec||c.sec[0]!==s){if(c.sec)c.secondes.push(c.sec);c.sec=[s,0,0,ph];}
  c.sec[1]++;if(dt>c.sec[2])c.sec[2]=Math.round(dt);if(ph!=='sol')c.sec[3]=ph;
  try{const k=QL.k,d=+curDPR.toFixed(2);if(c.ql[c.ql.length-1]?.[1]!==k)c.ql.push([s,k]);if(c.dpr[c.dpr.length-1]?.[1]!==d)c.dpr.push([s,d]);c.cad=!!(typeof CAD!=='undefined'&&CAD.on);}catch(e){}
  if(dt>PREC.LONG&&c.longues.length<200){let v=0;try{v=Math.round(mode==='fall'?Math.hypot(fallVel.x,fallVel.z):Math.abs(vA));}catch(e){}
    c.longues.push([+((now-c.t0)/1000).toFixed(2),Math.round(dt),Math.round(js),ph,lieu,v]);}
}
if(PREC.on)requestAnimationFrame(precImage);
/* (banc) dbgPerfRec() : tout · dbgPerfRec(1|0) : allumer / éteindre (gardé dans le téléphone) · dbgPerfRec('vide') : effacer les courses ·
   dbgPerfRec('resume') : une ligne par course et par phase (i/s, images > 25 / 33 / 50 ms, pire) */
window.dbgPerfRec=function(a){
  if(a===1||a===true){PREC.on=true;try{localStorage.setItem(PREC.KON,'1');}catch(e){}PREC.der=0;requestAnimationFrame(precImage);return 'enregistreur allumé';}
  if(a===0||a===false){PREC.on=false;try{localStorage.removeItem(PREC.KON);}catch(e){}return 'enregistreur éteint';}
  let C=[];try{C=JSON.parse(localStorage.getItem(PREC.K)||'[]');}catch(e){}
  if(a==='vide'){try{localStorage.removeItem(PREC.K);}catch(e){}return 'courses effacées';}
  if(a==='resume')return C.map(function(c){return c.debut.slice(11,19)+' '+c.carte.join('>')+' '+c.duree+'s palier '+c.palier+' | '+Object.keys(c.phases).map(function(k){const p=c.phases[k];
    return k+' '+p.n+' img '+p.ips+' i/s >25:'+(p.b[2]+p.b[3]+p.b[4]+p.b[5])+' >33:'+(p.b[3]+p.b[4]+p.b[5])+' >50:'+(p.b[4]+p.b[5])+' pire '+p.max;}).join(' · ');});
  return {on:PREC.on,enCours:PREC.cours?{n:PREC.cours.n,carte:PREC.cours.carte,phases:PREC.cours.phases}:null,courses:C};};

/* ===== LA BOÎTE DE VOL (2026-11-12, chantier ios-ultime — Sacha : « prépare un truc où c'est moi qui joue pendant quelques heures pour avoir des vraies data ») =====
   L'enregistreur ci-dessus garde 15 courses et compte les images d'ÉCRAN. Celui-ci est fait pour des HEURES de jeu sur le téléphone et pour répondre à UNE question :
   pourquoi le vol à grande vitesse est moins fluide que la route. À la fin de chaque image CALCULÉE de course (bvImage, appelé en fin de loop) il range :
     · la durée entre deux images calculées et le TRAVAIL du jeu (de QLR.t0 à la fin de loop : le JS + l'envoi du dessin, pas la puce), par PHASE (0 sol · 1 vol · 2 figure)
       et par TRANCHE DE VITESSE affichée (km/h : < 300 · 300-600 · 600-1000 · 1000-1600 · > 1600) : histogrammes, sommes, pire image, part d'images calées sur 30 (CAD.on) ;
     · une ligne par SECONDE : [s, images, pire ms, travail moyen ×10, phase, km/h ÷10, cran QL, cadence 30 + 2 × état thermique d'iOS] ;
     · les images LONGUES (> 28 ms à 60, > 50 ms calé sur 30) avec leur contexte ; les secondes passées dans chaque état thermique ; les entrées/sorties de la cadence 30.
   UN LEVIER PAR COURSE, TIRÉ AU HASARD (la moitié des courses restent telles quelles) : résolution plafonnée à 1, halo coupé, traits d'air coupés, ombre 512, ciel lissé
   une image sur 3 — posé par imgRegle au départ, rendu à la fin (seulement si le gouverneur est au palier 0 ; s'il bascule pendant la course, elle est marquée `gv`).
   C'est ce qui dit, sur de vrais vols, QUEL effet coûte : la chaleur et la map sont tirées au hasard avec lui. `?bvlev=0` : aucun levier.
   Rangement : une clé par course (`ccBV<n>`, les 220 dernières ; `ccBVn` = le compteur), écrite à la mort / au retour au menu / quand l'app passe en arrière-plan : jamais
   pendant qu'on roule. Relu par câble : `sh outils/banc-perf/lire-vol.sh`. ALLUMER : `?perfrec=2` (cuit dans l'app de mesure par `--qs "&perfrec=2"`) ; `?perfrec=0` éteint.
   Éteint : un test faux par image, rien d'autre. Il lit, il ne pose rien — sauf le levier de la course, qui ne touche que l'image. */
const BV={on:false,P:'ccBV',N:220,c:null,ses:Date.now(),sansLev:false,lev:'base',levN:0,
  VB:[300,600,1000,1600],HB:[17.5,21,26,34.5,51,101],WB:[4,8,12,16,25],
  LEV:{dpr1:{dpr:1},halo0:{halo:'off'},stries0:{stries:0},ombre512:{ombre:512},ciel3:{ciel:3},fx0:{cls:'bvFx0'},air0:{cls:'bvAir0'},anim0:{cls:'bvAnim0'},filtre0:{cls:'bvFiltre0'},texte0:{cls:'bvTexte0'},fig0:{cls:'bvFig0'},cycle:{cyc:1}}, /* (build 54) fx0 tient 29 i/s en vol contre 21 en base (build 52) : anim0 = ni animation ni transition, filtre0 = aucun filtre — lequel des deux ? */
  /* (2026-11-12, ios-ultime vague 2) DEUX LEVIERS D'INTERFACE. Mesuré : en vol la scène 3D ne coûte pas plus qu'au sol (appels et triangles comptés sur le Mac), le travail JS non plus, et pourtant
     le 13 Pro tombe de 26 à 15 i/s. Reste le HUD : en vol s'ajoutent des transitions de largeur, des animations (chrono de vol, jauge NITRO) et des textes à ombre portée réécrits à chaque image.
     fx0 = ni filtre, ni animation, ni transition CSS pendant la course ; air0 = le chrono de vol caché. Ils ne dépendent pas du gouverneur (TIR_DOM quand il n'est pas au palier 0). */
  TIR:['base'],TIR_DOM:['base'], /* (2026-11-12, Sacha : « ça dit CHAÎNE PERDUE en pleine partie plusieurs fois alors que je suis pas mort ») PLUS DE LEVIER D'INTERFACE NI DE CYCLE : retirer une classe qui coupait les animations (`animation:none`) RELANÇAIT l'animation de tout élément resté `.on` — la dernière grande annonce (#slam9, toujours « CHAÎNE PERDUE » : la mort d'avant) rejouait à chaque tour du cycle. La boîte de vol n'écrit plus que des mesures. */ /* (2026-11-12, build 56, Sacha : « le système de figure est très lent aussi ») LE CYCLE : au lieu d'un levier par course (il faut des dizaines de courses), les réglages TOURNENT toutes les 6 s dans la même course — même map, même chaleur, même pilote. c.V note le réglage de chaque seconde. base · filtre0 (aucun filtre) · anim0 (ni animation ni transition) · texte0 (les compteurs réécrits à chaque image sans leur contour en drop-shadow : argent, aura) · fig0 (le HUD des figures, les grands textes de verdict sans filtre, ombre ni animation) · fx0 (tout). */CYC:['base','filtre0','anim0','texte0','fig0','fx0'],CYC_S:6,cyc:-1};
(function(){try{const q=location.search;
  if(/[?&]perfrec=2\b/.test(q)){localStorage.setItem(PREC.KON,'2');BV.on=true;}
  else if(!/[?&]perfrec=[01]\b/.test(q))BV.on=localStorage.getItem(PREC.KON)==='2';
  BV.sansLev=/[?&]bvlev=0\b/.test(q);}catch(e){BV.on=/[?&]perfrec=2\b/.test(location.search);}})();
function bvNeuve(now){let lev='base';
  try{if(!BV.sansLev){const T=MOB_P.t===0?BV.TIR:BV.TIR_DOM;lev=T[(Math.random()*T.length)|0];const L=BV.LEV[lev];if(L&&(L.cls||L.cyc)){if(!document.getElementById('bvCss')){const st=document.createElement('style');st.id='bvCss';st.textContent='body.bvFx0 *{filter:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;animation:none!important;transition:none!important}body.bvAir0 #airHud{display:none!important}body.bvAnim0 *{animation:none!important;transition:none!important}body.bvFiltre0 *{filter:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}body.bvTexte0 :is(#cashHud .chV i,#cashHud .chV span,#avVal,#avX,#avPts){filter:none!important}body.bvFig0 :is(#fh,#fh *,#slam9,#slam9 *,#verdHud,#verdHud *,#popTxt,#lvlNum,#lvlNum *){filter:none!important;text-shadow:none!important;animation:none!important}';document.head.appendChild(st);}if(L.cls)document.body.classList.add(L.cls);}else if(L)imgRegle(L);}}catch(e){lev='base';}
  BV.lev=lev;try{BV.levN=MOB_P.n;}catch(e){BV.levN=0;}
  return {d:new Date().toISOString(),ses:BV.ses,tl:Math.round(now/1000),lev:lev,gv:0,v:(typeof CC_VER==='string'?CC_VER:'?'),pal:(typeof PAL!=='undefined'?PAL.n:-1),
    ecr:screen.width+'x'+screen.height+'@'+(window.devicePixelRatio||1),app:String(window.__ccAppareil||''),eco:(window.__ccEco|0),cartes:[],mot:0,th:[0,0,0,0,0],cadE:CAD.entrees,cadS:CAD.sorties,B:{},L:[],S:[],n:0,t0:now,der:0,fin:now,sec:null};}
function bvSec(c,e){ /* une seconde finie : la ligne, la carte, le palier du moteur, l'état thermique */
  let th=4;try{if(MOB_S.capteur)th=Math.max(0,Math.min(3,MOB_S.thermo|0));}catch(x){}
  c.th[th]++;
  try{const l=(LVL&&LVL.cur&&LVL.cur.id)||'?';if(c.cartes[c.cartes.length-1]!==l)c.cartes.push(l);if(engTier>c.mot)c.mot=engTier;}catch(x){}
  /* (2026-11-12, vague 2) R : par seconde, les images d'écran reçues (rAF bruts), le plus petit intervalle entre deux (×10), et le VRAI coût d'une image mesuré par la barrière de la puce (×10, -1 = pas de mesure fraîche) ;
     la sonde est armée toutes les 5 s de course (cinq images, sans bloquer sur iPhone). ⚠ dans un build de mesure seulement : une mesure fraîche > 13 ms retient le calage sur 30 (cadFin). */
  try{if(!c.R)c.R=[];if(c.R.length<2700)c.R.push(CAD.rN|0,Math.round(Math.min(99,CAD.rMin||99)*10),(QLR.vraiT&&performance.now()-QLR.vraiT<6000)?Math.round(QLR.vrai*10):-1);CAD.rN=0;CAD.rMin=99;if((c.S.length/8)%5===0&&QLR.sN<=0&&!(QLR.S&&QLR.S.pend>0))qlSondeArme();}catch(x){}
  try{if(BV.lev==='cycle'){const k=(((c.S.length/8)/BV.CYC_S)|0)%BV.CYC.length;if(!c.V)c.V=[];c.V.push(BV.cyc<0?0:BV.cyc);if(k!==BV.cyc){bvCycOte();BV.cyc=k;const L9=BV.LEV[BV.CYC[k]];if(L9&&L9.cls)document.body.classList.add(L9.cls);}}}catch(x){}
  if(c.S.length<7200)c.S.push(e[0],e[1],Math.round(e[2]),e[1]?Math.round(e[3]/e[1]*10):0,e[4],Math.round(e[5]/10),QL.k,(CAD.on?1:0)+2*(th>3?0:th));}
function bvCycOte(){try{for(const k of BV.CYC){const L9=BV.LEV[k];if(L9&&L9.cls)document.body.classList.remove(L9.cls);}}catch(x){}}
function bvFinit(coupe){const c=BV.c;BV.c=null;if(!c)return;
  if(c.sec)bvSec(c,c.sec);
  c.dur=+((c.fin-c.t0)/1000).toFixed(1);c.cadE=CAD.entrees-c.cadE;c.cadS=CAD.sorties-c.cadS;if(coupe)c.coupe=1;
  try{if(MOB_P.n!==BV.levN)c.gv=1;if(BV.lev==='cycle'){bvCycOte();BV.cyc=-1;}else if(BV.lev!=='base'){if(BV.LEV[BV.lev]&&BV.LEV[BV.lev].cls)document.body.classList.remove(BV.LEV[BV.lev].cls);else if(MOB_P.t===0)imgRegle('reset');else mobPalApplique(MOB_P.t);}}catch(e){}
  BV.lev='base';
  for(const k in c.B){const b=c.B[k];b.ms=Math.round(b.ms);b.w=Math.round(b.w);b.mx=Math.round(b.mx);}
  delete c.t0;delete c.der;delete c.fin;delete c.sec;
  if(c.dur<5)return;
  const pose=function(){const i=+(localStorage.getItem(BV.P+'n')||0);localStorage.setItem(BV.P+i,JSON.stringify(c));localStorage.setItem(BV.P+'n',String(i+1));localStorage.removeItem(BV.P+(i-BV.N));};
  try{pose();}catch(e){try{const i=+(localStorage.getItem(BV.P+'n')||0);for(let k=i-BV.N;k<i-BV.N+40;k++)localStorage.removeItem(BV.P+k);c.S=[];pose();}catch(e2){}}}
function bvImage(now,kmh){ /* fin de loop : une image CALCULÉE */
  let c=BV.c;
  if(!(started&&running&&!gameOver&&!paused)){if(c){if(!started||gameOver)bvFinit(false);else c.der=0;}return;} /* la pause : la course reste ouverte, l'intervalle ne compte pas */
  if(c&&c.der&&now-c.fin>1500){bvFinit(false);c=null;} /* un trou de plus de 1,5 s sans image de course (écran de fin que la boucle quitte tôt, REJOUER) : la course d'avant est finie */
  if(!c)c=BV.c=bvNeuve(now);
  const d=c.der?now-c.der:0;c.der=now;c.fin=now;
  if(!(d>0)||d>5000)return;
  const w=performance.now()-QLR.t0;let ph=0;
  if(mode==='fall'){ph=1;try{const C=FX2&&FX2.corps;if(C&&C.figs&&C.figs.length)ph=2;}catch(e){}}
  let vb=0;while(vb<4&&kmh>BV.VB[vb])vb++;
  const k=ph+''+vb;let b=c.B[k];if(!b)b=c.B[k]={n:0,ms:0,w:0,mx:0,h:[0,0,0,0,0,0,0],wh:[0,0,0,0,0,0],c30:0};
  b.n++;b.ms+=d;b.w+=w;if(d>b.mx)b.mx=d;
  let i=0;while(i<6&&d>BV.HB[i])i++;b.h[i]++;i=0;while(i<5&&w>BV.WB[i])i++;b.wh[i]++;
  if(CAD.on)b.c30++;c.n++;
  const s=((now-c.t0)/1000)|0;let e=c.sec;
  if(!e||e[0]!==s){if(e)bvSec(c,e);e=c.sec=[s,0,0,0,0,0];}
  e[1]++;if(d>e[2])e[2]=d;e[3]+=w;if(ph>e[4])e[4]=ph;if(kmh>e[5])e[5]=kmh;
  if(d>(CAD.on?50:28)&&c.L.length<80){let f=CAD.on?1:0;try{if(now-(loop._rebuildT||0)<(loop._rebuildD||2500))f|=2;if(PORTV.att)f|=4;}catch(x){}
    c.L.push([+((now-c.t0)/1000).toFixed(1),Math.round(d),Math.round(w),ph,Math.round(kmh),QL.k,f]);}}
if(BV.on){addEventListener('pagehide',function(){bvFinit(true);});document.addEventListener('visibilitychange',function(){if(document.hidden)bvFinit(true);});}
window.dbgBoiteVol=function(a){ /* (banc) l'état · 'vide' : tout effacer · 'tout' : les courses rangées */
  let n=0;try{n=+(localStorage.getItem(BV.P+'n')||0);}catch(e){}
  if(a==='vide'){try{for(let k=Math.max(0,n-BV.N-40);k<n;k++)localStorage.removeItem(BV.P+k);localStorage.removeItem(BV.P+'n');}catch(e){}return 'boîte de vol vidée';}
  if(a==='tout'){const o=[];try{for(let k=Math.max(0,n-BV.N);k<n;k++){const v=localStorage.getItem(BV.P+k);if(v)o.push(JSON.parse(v));}}catch(e){}return o;}
  return {on:BV.on,rangees:n,levier:BV.lev,enCours:BV.c?{n:BV.c.n,lev:BV.c.lev,B:BV.c.B,L:BV.c.L.length,S:BV.c.S.length/8}:null};};
