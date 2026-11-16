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
const BV={on:false,P:'ccBV',N:16, /* (2026-11-12) 16 courses gardées, plus 220 : 48 courses remplissaient les ≈ 5 Mo du stockage — celui de la SAUVEGARDE du joueur aussi */c:null,ses:Date.now(),sansLev:false,lev:'base',levN:0,
  VB:[300,600,1000,1600],HB:[17.5,21,26,34.5,51,101],WB:[4,8,12,16,25],
  LEV:{dpr1:{dpr:1},halo0:{halo:'off'},stries0:{stries:0},ombre512:{ombre:512},ciel3:{ciel:3},fx0:{cls:'bvFx0'},air0:{cls:'bvAir0'},anim0:{cls:'bvAnim0'},filtre0:{cls:'bvFiltre0'},texte0:{cls:'bvTexte0'},fig0:{cls:'bvFig0'},cycle:{cyc:1}}, /* (build 54) fx0 tient 29 i/s en vol contre 21 en base (build 52) : anim0 = ni animation ni transition, filtre0 = aucun filtre — lequel des deux ? */
  /* (2026-11-12, ios-ultime vague 2) DEUX LEVIERS D'INTERFACE. Mesuré : en vol la scène 3D ne coûte pas plus qu'au sol (appels et triangles comptés sur le Mac), le travail JS non plus, et pourtant
     le 13 Pro tombe de 26 à 15 i/s. Reste le HUD : en vol s'ajoutent des transitions de largeur, des animations (chrono de vol, jauge NITRO) et des textes à ombre portée réécrits à chaque image.
     fx0 = ni filtre, ni animation, ni transition CSS pendant la course ; air0 = le chrono de vol caché. Ils ne dépendent pas du gouverneur (TIR_DOM quand il n'est pas au palier 0). */
  TIR:['base'],TIR_DOM:['base'], /* (2026-11-12, Sacha : « ça dit CHAÎNE PERDUE en pleine partie plusieurs fois alors que je suis pas mort ») PLUS DE LEVIER D'INTERFACE NI DE CYCLE : retirer une classe qui coupait les animations (`animation:none`) RELANÇAIT l'animation de tout élément resté `.on` — la dernière grande annonce (#slam9, toujours « CHAÎNE PERDUE » : la mort d'avant) rejouait à chaque tour du cycle. La boîte de vol n'écrit plus que des mesures. */ /* (2026-11-12, build 56, Sacha : « le système de figure est très lent aussi ») LE CYCLE : au lieu d'un levier par course (il faut des dizaines de courses), les réglages TOURNENT toutes les 6 s dans la même course — même map, même chaleur, même pilote. c.V note le réglage de chaque seconde. base · filtre0 (aucun filtre) · anim0 (ni animation ni transition) · texte0 (les compteurs réécrits à chaque image sans leur contour en drop-shadow : argent, aura) · fig0 (le HUD des figures, les grands textes de verdict sans filtre, ombre ni animation) · fx0 (tout). */CYC:['base','filtre0','anim0','texte0','fig0','fx0'],CYC_S:6,cyc:-1};
(function(){try{const q=location.search;
  if(/[?&]perfrec=2\b/.test(q)){localStorage.setItem(PREC.KON,'2');BV.on=true;}
  else if(!/[?&]perfrec=[01]\b/.test(q))BV.on=localStorage.getItem(PREC.KON)==='2';
  BV.sansLev=/[?&]bvlev=0\b/.test(q);try{const n9=+(localStorage.getItem(BV.P+'n')||0);for(let k=Math.max(0,n9-300);k<n9-BV.N;k++)localStorage.removeItem(BV.P+k);}catch(e2){} /* les courses au-delà des 16 dernières s'effacent au lancement (déjà relues par câble) */}catch(e){BV.on=/[?&]perfrec=2\b/.test(location.search);}})();
/* ===== LE PROFIL D'IMAGE DANS LA BOÎTE DE VOL (2026-11-14, Sacha : « retravaille encore les shaders » — pour juger un vol, il faut savoir QUELLE image il a vue) =====
   Chaque course note `prf:{c,q,n,plaf,fps,dpr}` au départ (classe, réglage BASSE/HAUTE, niveau N1-N4, plafond de résolution, cadence visée, résolution courante), lu sur PRF
   (téléphone profilé seulement : ailleurs `prf` vaut null et rien d'autre ne change). Un changement de RÉGLAGE en course (bouton IMAGE, niveau, plafond ou cadence ; pas la
   résolution qui suit l'échelle QL) est suivi : `prfN` = combien, `prfD` = le dernier état, `prfC` = [seconde, q (0 BASSE · 1 HAUTE), n, plafond ×100, fps, dpr ×100]
   (40 au plus) — outils/banc-perf/analyse-vol.py en fait la table PAR NIVEAU D'IMAGE. Une lecture par seconde, aucune allocation tant que rien ne change. */
function bvPrf(){try{if(typeof PRF!=='undefined'&&PRF&&PRF.on)return {c:PRF.c,q:PRF.q,n:PRF.n,plaf:PRF.dpr?+(+PRF.dpr).toFixed(3):0,fps:PRF.fps,dpr:+(+curDPR).toFixed(3)};}catch(e){}return null;}
function bvPrfSuit(c){try{const l=c.prfD||c.prf;if(!l||typeof PRF==='undefined'||!PRF.on)return;const pl=PRF.dpr?+(+PRF.dpr).toFixed(3):0;
  if(PRF.q===l.q&&PRF.n===l.n&&pl===l.plaf&&PRF.fps===l.fps)return;
  c.prfD=bvPrf();c.prfN=(c.prfN|0)+1;if(!c.prfC)c.prfC=[];if(c.prfC.length<40)c.prfC.push((c.S.length/8)|0,PRF.q==='haute'?1:0,PRF.n,Math.round(pl*100),PRF.fps,Math.round(c.prfD.dpr*100));}catch(e){}}
function bvNeuve(now){let lev='base';
  try{if(!BV.sansLev){const T=MOB_P.t===0?BV.TIR:BV.TIR_DOM;lev=T[(Math.random()*T.length)|0];const L=BV.LEV[lev];if(L&&(L.cls||L.cyc)){if(!document.getElementById('bvCss')){const st=document.createElement('style');st.id='bvCss';st.textContent='body.bvFx0 *{filter:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;animation:none!important;transition:none!important}body.bvAir0 #airHud{display:none!important}body.bvAnim0 *{animation:none!important;transition:none!important}body.bvFiltre0 *{filter:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}body.bvTexte0 :is(#cashHud .chV i,#cashHud .chV span,#avVal,#avX,#avPts){filter:none!important}body.bvFig0 :is(#fh,#fh *,#slam9,#slam9 *,#verdHud,#verdHud *,#popTxt,#lvlNum,#lvlNum *){filter:none!important;text-shadow:none!important;animation:none!important}';document.head.appendChild(st);}if(L.cls)document.body.classList.add(L.cls);}else if(L)imgRegle(L);}}catch(e){lev='base';}
  BV.lev=lev;try{BV.levN=MOB_P.n;}catch(e){BV.levN=0;}
  if(MG.on){MG.sec.nL=0;MG.sec.nR=0;MG.sec.hS=0;} /* (contrôle du lot GELS) la 1re seconde ne compte pas le menu */
  const mgo=MG.on; /* sans mouchard, la course ne porte ni G ni M : l'analyse retombe sur la table « dans / hors boucle » */
  const o={d:new Date().toISOString(),ses:BV.ses,tl:Math.round(now/1000),lev:lev,gv:0,v:(typeof CC_VER==='string'?CC_VER:'?'),pal:(typeof PAL!=='undefined'?PAL.n:-1),
    ecr:screen.width+'x'+screen.height+'@'+(window.devicePixelRatio||1),app:String(window.__ccAppareil||''),eco:(window.__ccEco|0),cartes:[],mot:0,th:[0,0,0,0,0],prf:bvPrf(),mg:mgEtat(),G:mgo?[]:null,GN:mgo?[]:null,Q:mgo?{}:null,M:mgo?[]:null,Mw:mgo?12:undefined,x0:mgo?mgSeance():undefined,D:mgo?[]:undefined,TR:mgo?[0,0,0,0,0,0,0,0,0]:undefined,prfN:0,cadE:CAD.entrees,cadS:CAD.sorties,B:{},L:[],S:[],n:0,t0:now,der:0,fin:now,sec:null};if(!mgo){delete o.mg;delete o.G;delete o.GN;delete o.Q;delete o.M;delete o.Mw;delete o.x0;delete o.D;delete o.TR;}return o;}
function bvSec(c,e){ /* une seconde finie : la ligne, la carte, le palier du moteur, l'état thermique */
  let th=4;try{if(MOB_S.capteur)th=Math.max(0,Math.min(3,MOB_S.thermo|0));}catch(x){}
  c.th[th]++;bvPrfSuit(c);
  try{const l=(LVL&&LVL.cur&&LVL.cur.id)||'?';if(c.cartes[c.cartes.length-1]!==l)c.cartes.push(l);if(engTier>c.mot)c.mot=engTier;}catch(x){}
  /* (2026-11-12, vague 2) R : par seconde, les images d'écran reçues (rAF bruts), le plus petit intervalle entre deux (×10), et le VRAI coût d'une image mesuré par la barrière de la puce (×10, -1 = pas de mesure fraîche) ;
     la sonde est armée toutes les 5 s de course (cinq images, sans bloquer sur iPhone). ⚠ dans un build de mesure seulement : une mesure fraîche > 13 ms retient le calage sur 30 (cadFin). */
  try{if(!c.R)c.R=[];if(c.R.length<2700)c.R.push(CAD.rN|0,Math.round(Math.min(99,CAD.rMin||99)*10),(QLR.vraiT&&performance.now()-QLR.vraiT<6000)?Math.round(QLR.vrai*10):-1);CAD.rN=0;CAD.rMin=99;if((c.S.length/8)%5===0&&QLR.sN<=0&&!(QLR.S&&QLR.S.pend>0))qlSondeArme();}catch(x){}
  try{if(BV.lev==='cycle'){const k=(((c.S.length/8)/BV.CYC_S)|0)%BV.CYC.length;if(!c.V)c.V=[];c.V.push(BV.cyc<0?0:BV.cyc);if(k!==BV.cyc){bvCycOte();BV.cyc=k;const L9=BV.LEV[BV.CYC[k]];if(L9&&L9.cls)document.body.classList.add(L9.cls);}}}catch(x){}
  try{const b9=window.__ccBatterie;if(b9!=null&&b9>=0){const q=c.bat||(c.bat=[]),n9=q.length,br9=window.__ccBranche|0;if(!n9||q[n9-2]!==b9||q[n9-1]!==br9)q.push((c.S.length/8)|0,b9,br9);}}catch(x){} /* (2026-11-13, LE WATTMÈTRE) bat : [seconde, batterie %, branché 1 non · 2 oui] à chaque changement */
  try{if(!c.P)c.P=[];if(c.P.length<1800)c.P.push(e[1]?Math.round((e[6]||0)/e[1]*10):0,Math.round((e[7]||0)*10));}catch(x){} /* (2026-11-13, ios-aide) P : par seconde, le pré-bâti moyen par image et sa pire tranche (×10), aligné sur S */
  if(MG.on&&c.M&&c.M.length<12000){const q=MG.sec;let sv=-1;if(MG.sen)sv=Math.round(mgSentinelle()*100);mgAppat();
    c.M.push(q.nL,q.nR,Math.round(q.hS),MG.nTO,MG.nIV,MG.nEC,mgAc(1),mgTas(),sv,MG.mgt?q.gc:-1,MG.mgt?q.gcA:-1,mgNatif());q.nL=0;q.nR=0;q.hS=0;q.gc=0;q.gcA=-1;} /* (2026-11-15, lot GELS) M : par seconde, images de loop, autres rAF, ms de rappels HORS boucle, minuteries en attente, intervalles, écouteurs, contexte audio, tas (Mo, -1 inconnu) — voir mgGel */
  /* (2026-11-16, lot SENTINELLE) M a 12 colonnes (c.Mw) : … puis la sentinelle (ms ×100, -1 coupée), passages du ramasse-miettes dans la seconde (-1 sans témoin), âge du dernier appât ramassé (ms, -1 aucun),
     l'état natif (thermique ×1000 + branché ×100 + autre musique ×10 + économie, 9 = inconnu). Voir moteur/mouchard-gels.js. */
  if(c.S.length<7200)c.S.push(e[0],e[1],Math.round(e[2]),e[1]?Math.round(e[3]/e[1]*10):0,e[4],Math.round(e[5]/10),QL.k,(CAD.on?1:0)+2*(th>3?0:th));}
function bvCycOte(){try{for(const k of BV.CYC){const L9=BV.LEV[k];if(L9&&L9.cls)document.body.classList.remove(L9.cls);}}catch(x){}}
function bvFinit(coupe){const c=BV.c;BV.c=null;if(!c)return;
  if(c.sec)bvSec(c,c.sec);
  c.dur=+((c.fin-c.t0)/1000).toFixed(1);c.cadE=CAD.entrees-c.cadE;c.cadS=CAD.sorties-c.cadS;if(coupe)c.coupe=1;if(MG.on){c.mg1=mgEtat();c.x1=mgSeance();if(c.TR)for(let i=0;i<9;i++)c.TR[i]=Math.round(c.TR[i]*10)/10;}
  try{if(MOB_P.n!==BV.levN)c.gv=1;if(BV.lev==='cycle'){bvCycOte();BV.cyc=-1;}else if(BV.lev!=='base'){if(BV.LEV[BV.lev]&&BV.LEV[BV.lev].cls)document.body.classList.remove(BV.LEV[BV.lev].cls);else if(MOB_P.t===0)imgRegle('reset');else mobPalApplique(MOB_P.t);}}catch(e){}
  BV.lev='base';
  for(const k in c.B){const b=c.B[k];b.ms=Math.round(b.ms);b.w=Math.round(b.w);b.mx=Math.round(b.mx);}
  delete c.t0;delete c.der;delete c.fin;delete c.sec;
  if(c.dur<5)return;
  const pose=function(){const i=+(localStorage.getItem(BV.P+'n')||0);localStorage.setItem(BV.P+i,JSON.stringify(c));localStorage.setItem(BV.P+'n',String(i+1));localStorage.removeItem(BV.P+(i-BV.N));};
  /* (2026-11-12, ios-ultime) LA BOÎTE PLEINE : le stockage du téléphone (≈ 5 Mo) était rempli après 48 courses — plus aucune course ne s'écrivait (build 61 : 0 course), et l'ancien repli effaçait des clés qui n'existaient pas. Quand l'écriture échoue on retire les PLUS VIEILLES courses, une à une, jusqu'à ce que la nouvelle tienne (elles ont déjà été relues par câble). */
  try{pose();}catch(e){try{const i=+(localStorage.getItem(BV.P+'n')||0);let k=Math.max(0,i-BV.N),ok=false;for(let t=0;t<80&&!ok&&k<i;t++){while(k<i&&localStorage.getItem(BV.P+k)==null)k++;if(k>=i)break;localStorage.removeItem(BV.P+k);k++;try{pose();ok=true;}catch(e3){}}}catch(e2){}}}
function bvImage(now,kmh){ /* fin de loop : une image CALCULÉE */
  let c=BV.c;
  if(!(started&&running&&!gameOver&&!paused)){MG.lc0=0;if(c){if(!started||gameOver)bvFinit(false);else c.der=0;}return;} /* la pause : la course reste ouverte, l'intervalle ne compte pas */
  if(c&&c.der&&now-c.fin>1500){bvFinit(false);c=null;} /* un trou de plus de 1,5 s sans image de course (écran de fin que la boucle quitte tôt, REJOUER) : la course d'avant est finie */
  if(!c)c=BV.c=bvNeuve(now);
  const d=c.der?now-c.der:0;c.der=now;c.fin=now;
  if(!(d>0)||d>5000){MG.lc0=0;return;} /* (lot GELS) l'intervalle du mouchard repart aussi */
  const w=performance.now()-QLR.t0;let ph=0;
  if(mode==='fall'){ph=1;try{const C=FX2&&FX2.corps;if(C&&C.figs&&C.figs.length)ph=2;}catch(e){}}
  let vb=0;while(vb<4&&kmh>BV.VB[vb])vb++;
  const k=ph+''+vb;let b=c.B[k];if(!b)b=c.B[k]={n:0,ms:0,w:0,mx:0,h:[0,0,0,0,0,0,0],wh:[0,0,0,0,0,0],c30:0,pb:0};
  const pb=PREB.imgMs||0;PREB.imgMs=0; /* (2026-11-13, ios-aide) la part du pré-bâti dans le travail de cette image */
  b.n++;b.ms+=d;b.w+=w;b.pb=(b.pb||0)+pb;if(d>b.mx)b.mx=d;
  let i=0;while(i<6&&d>BV.HB[i])i++;b.h[i]++;i=0;while(i<5&&w>BV.WB[i])i++;b.wh[i]++;
  if(CAD.on)b.c30++;c.n++;
  const s=((now-c.t0)/1000)|0;let e=c.sec;
  if(!e||e[0]!==s){if(e)bvSec(c,e);e=c.sec=[s,0,0,0,0,0,0,0];}
  e[1]++;if(d>e[2])e[2]=d;e[3]+=w;if(ph>e[4])e[4]=ph;if(kmh>e[5])e[5]=kmh;e[6]+=pb;if(pb>e[7])e[7]=pb;
  if(d>(CAD.on?50:28)&&c.L.length<80){let f=CAD.on?1:0;try{if(now-(loop._rebuildT||0)<(loop._rebuildD||2500))f|=2;if(PORTV.att)f|=4;}catch(x){}
    c.L.push([+((now-c.t0)/1000).toFixed(1),Math.round(d),Math.round(w),ph,Math.round(kmh),QL.k,f,Math.round(pb)]);}
  if(MG.on){MG.calc=1;MG.mqT=(now-c.t0)/1000;MG.mqD=d;MG.mqW=w;MG.mqPb=pb;}}
if(BV.on){addEventListener('pagehide',function(){bvFinit(true);});document.addEventListener('visibilitychange',function(){if(document.hidden)bvFinit(true);});}
window.dbgBoiteVol=function(a){ /* (banc) l'état · 'vide' : tout effacer · 'tout' : les courses rangées */
  let n=0;try{n=+(localStorage.getItem(BV.P+'n')||0);}catch(e){}
  if(a==='vide'){try{for(let k=Math.max(0,n-BV.N-40);k<n;k++)localStorage.removeItem(BV.P+k);localStorage.removeItem(BV.P+'n');}catch(e){}return 'boîte de vol vidée';}
  if(a==='tout'){const o=[];try{for(let k=Math.max(0,n-BV.N);k<n;k++){const v=localStorage.getItem(BV.P+k);if(v)o.push(JSON.parse(v));}}catch(e){}return o;}
  return {on:BV.on,rangees:n,levier:BV.lev,enCours:BV.c?{n:BV.c.n,lev:BV.c.lev,B:BV.c.B,L:BV.c.L.length,S:BV.c.S.length/8}:null};};
/* ===== LES GELS DANS LA BOÎTE DE VOL (2026-11-15, lot GELS — voir moteur/mouchard-gels.js) =====
   Allumés avec la boîte de vol (`?perfrec=2`), rien sinon. Pour chaque intervalle de plus de MG.GEL (80 ms), À L'HORLOGE, entre les débuts de deux images de course calculées, une ligne c.G (240 au plus) :
     [t s, intervalle (= boucle d'avant + hors boucle + loop sautés), travail (comme L), boucle de l'image calculée d'AVANT (ms, tout loop), boucle de CETTE image, hors boucle depuis l'image calculée d'avant (somme des trous entre deux loop),
      rappels attribués dans ce hors-boucle (ms), combien > 8 ms, le plus long (indice dans c.GN, -1 aucun), sa durée,
      les 8 tranches de l'image d'AVANT (b1…b6, rendu, après), les 8 de CETTE image, pré-bâti, minuteries en attente, intervalles, contexte audio (voir mgAc),
      secondes depuis le retour d'arrière-plan (-1 jamais), secondes depuis le dernier pivot (-1 jamais), tas (Mo, -1 inconnu), loop SAUTÉS entre les deux (ms), durée de l'image selon rAF (celle de L)]
   c.Q : tous les rappels de plus de 8 ms de la course, par nom : [nombre, ms, pire] (80 noms au plus). c.mg / c.mg1 : [minuteries, intervalles, écouteurs, retour s, pivot s, arrière-plan s, orientation] au départ et à la fin.
   Une ligne ne s'écrit que pour une image longue : aucune allocation sur une image normale. */
function mgEtat(){if(!MG.on)return null;const n=performance.now();return [MG.nTO,MG.nIV,MG.nEC,MG.bgT?Math.round((n-MG.bgT)/1000):-1,MG.pivT?Math.round((n-MG.pivT)/1000):-1,Math.round(MG.bgD/1000),innerWidth>innerHeight?'P':'D'];} /* …, durée du dernier arrière-plan (s), orientation (P paysage · D debout) */
function mgIdx(c,nm){let i=c.GN.indexOf(nm);if(i<0&&c.GN.length<120){c.GN.push(nm);i=c.GN.length-1;}return i;}
MG.lent=function(nm,d){const c=BV.c;if(!c||!c.Q)return;let q=c.Q[nm];if(!q){if(Object.keys(c.Q).length>=80)return;q=c.Q[nm]=[0,0,0];}q[0]++;q[1]+=Math.round(d);if(d>q[2])q[2]=Math.round(d);};
MG.apres=function(t1){const c=BV.c;if(!c||!c.G||c.G.length>=240)return;
  let ti=-1;if(MG.cTopF)ti=mgIdx(c,mgNom(MG.cTopK,MG.cTopF));
  const r=[+MG.mqT.toFixed(1),Math.round(MG.dw),Math.round(MG.mqW),Math.round(MG.lAv),Math.round(MG.lDur),Math.round(MG.cGap),Math.round(MG.cS),MG.cN,ti,Math.round(MG.cTop)];
  for(let i=0;i<8;i++)r.push(Math.round(MG.trAv[i]));for(let i=0;i<8;i++)r.push(Math.round(MG.tr[i]));
  r.push(Math.round(MG.mqPb),MG.nTO,MG.nIV,mgAc(),MG.bgT?Math.round((t1-MG.bgT)/1000):-1,MG.pivT?Math.round((t1-MG.pivT)/1000):-1,mgTas(),Math.round(MG.cSaut),Math.round(MG.mqD),
    (MG.sen&&t1-MG.senT<5)?Math.round(MG.senV*100):-1,(MG.mgt&&MG.gcT)?Math.round(t1-MG.gcT):-1); /* (lot SENTINELLE) [35] la sentinelle mesurée à cette image (ms ×100, -1 aucune), [36] ms depuis le dernier passage vu du ramasse-miettes (-1 jamais) */
  c.G.push(r);};
/* ===== LA SÉANCE ET LES DÉCODAGES DANS LA COURSE (2026-11-16, lot SENTINELLE) — boîte de vol + mouchard seulement =====
   c.x0 / c.x1 (départ / fin) : [âge de la vue web (s), durée du dernier arrière-plan (s), textures, géométries, programmes] (sur une séance de 25 min : 128 → 156 textures, 155 → 186 programmes, sans plateau).
   c.D : la fin de chaque décodage d'un segment de musique (assets/audio/pouce-bleu-jeu.js) pendant la course : [t (s ×10), durée (ms), Ko] (120 au plus).
   c.TR : la référence des tranches — somme des 8 tranches (b1…b6, rendu, après) sur les images de loop LÉGÈRES (loop < 25 ms), et leur nombre en [8] (analyse-vol.py en fait la MOYENNE par tranche : la référence d’une image légère). */
function mgSeance(){let t=-1,g=-1,p=-1;try{const I=renderer.info;t=I.memory.textures;g=I.memory.geometries;p=I.programs?I.programs.length:-1;}catch(e){}
  return [Math.round(performance.now()/1000),Math.round(MG.bgD/1000),t,g,p];}
if(MG.on&&BV.on)window.__ccDecode=function(ms,ko){const c=BV.c;if(!c||!c.D||c.D.length>=360)return;c.D.push(Math.round((performance.now()-(c.t0||0))/100),Math.round(ms),ko|0);};
MG.ref=function(){const c=BV.c;if(!c||!c.TR||MG.lDur>=25)return;const T=c.TR;for(let i=0;i<8;i++)T[i]+=MG.tr[i];T[8]++;};
