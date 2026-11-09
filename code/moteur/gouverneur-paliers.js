
/* ===== LE GOUVERNEUR PILOTE L'IMAGE PAR PALIERS : BAISSE À CHAUD, REMONTE À FRAIS (2026-11-07, vitesse-fluide) =====
   BAISSE — MESURÉ (13 Pro, app, build 6) : calé sur 30 et l'échelle QL au plancher (crans 9-11), la course tombe quand même à 83 ms (12 i/s) vers 8 min de jeu : à chaud la puce est bridée ~3×, il faut couper ~3× de
   travail. La dose de chaleur (gouverneur-thermique.js ; le 30 calé la monte de 0,5 par seconde : 60 ≈ 2 min, 100 ≈ 3 min 20, 140 ≈ 4 min 40 de course) pose, PAR PALIERS, la couche dynamique de la passe 3
   (`imgRegle`, rendu/nettete-qualite.js : halo, mips, ombre, plafond de résolution, ciel lisse, densité des traits d'air et traînées) — le départ de course (P2 : halo ½, ombre 768, plafond 1,25, ciel ½…) est le palier 0.
     0 · < 60   : le départ statique de P2, rien d'écrit.
     1 · ≥ 60   : plafond 1,1 ; halo ½ à 2 mips.
     2 · ≥ 100  : plafond 1,0 ; halo coupé ; ombre 512 ; ciel lisse 1 image sur 4 ; traits d'air et traînées ×½ ; échelle QL au cran maximal (flou radial coupé) ; vent et émission de la caisse ×½ ; + RÉGIME CHAUD (mobh-regime-chaud.js).
     3 · ≥ 140  : plafond 0,8 ; ciel lisse 1 image sur 8.
   L'ÉTAT THERMIQUE D'iOS (`cc:thermique`) : ≥ 2 pose la dose à 160 (gouverneur-thermique.js) = palier 3 tout de suite ; `mobPalCible` garantit au moins 2 / 3 même si la dose baissait.
   ⚠ MONTÉE immédiate, DESCENTE lente : un palier ne se lève qu'une minute après le dernier changement, un palier à la fois (la dose ne redescend que de 0,25 par seconde de repos).
   REMONTE (règle de Sacha : « fluidité d'abord ; une fois atteinte, remonter le rendu vers celui de l'ordinateur ») — paliers NÉGATIFS : le téléphone est FRAIS (dose < `MOB_R.frais`) et FLUIDE pendant 60 s
   d'affilée (travail de l'image médian < 12 ms, jamais > 16 ms, images à l'heure : p75 de l'échelle QL ≤ 19 ms) → un cran de plus : −1 = plafond de résolution du réglage du joueur (1,5 en NETTE) ; −2 = + halo plein
   (5 mips) et ombre 1024. Chaque cran demande SES 60 s. Un cran de remontée tombe d'un coup au palier 0 dès que la fluidité manque 5 s de suite, ou que la dose atteint le palier 1 ; il ne revient pas dans la même course.
   Seulement sur téléphone récent (TEL_NATIF, palier 2 : c'est MOB_GOUV). `?gouv=max` = rien de tout cela (et pas de régime chaud par défaut) ; `?mob_raise=1` = la remontée (INACTIVE par défaut depuis le 07/11 soir : build 13, 15 gels > 1 s en course, hypothèse = les bascules réallouent les cibles) ; `?mob_gouv=0` = plus de gouverneur.
   Banc : `dbgGouv()` donne `gpu` (palier, ce qui est posé) ; `dbgGouv(dose)` pose la dose et lève la garde d'une minute. */
const MOB_PALS=MOB_GOUV&&!/[?&]gouv=max\b/.test(location.search);
/* LA POLYPHONIE DES BRUITAGES SOUS LA CHALEUR (2026-11-08, vitesse-fluide : le son coûte +4 à +10 ms de processeur par image) : au palier 2 et plus, EN COURSE seulement, `window.__ccPoly.on` est vrai ; sfx.js (le lecteur de sons) ignore alors les sons de moins de `min` s (hors boucle,
   hors `force`) et ramène la polyphonie de chaque son à `k` × son maximum (au moins 1). Les plus anciennes voix s'effacent comme d'habitude. La musique n'est pas touchée. `?mob_poly=0` = jamais. Compteurs : `__ccPoly.ign` (sons ignorés), `.cou` (voix coupées). */
const MOB_POLY=MOB_PALS&&!/[?&]mob_poly=0\b/.test(location.search);
if(MOB_POLY)window.__ccPoly=window.__ccPoly||{on:false,k:.5,min:.06,ign:0,cou:0};
const MOB_PP=[{d:0},{d:60,dpr:1.1,halo:'demi',mips:2,ql:3},{d:100,dpr:1,halo:'off',ombre:512,ciel:4,stries:.5,k:.5,ql:99},{d:140,dpr:.8,halo:'off',ombre:512,ciel:8,stries:.5,k:.5,ql:99}]; /* tout se règle ici ; ql 99 = le cran maximal de l'échelle */
/* LE DÉPART DE P2 (nettete-qualite.js `imgRegle`, palier-appareil.js `PAL.B.imgBloomRes`) : halo ½, 3 mips, ombre 768, ciel sans plancher, traits d'air aux budgets — à tenir d'accord avec P2 ; chaque palier est posé en UN SEUL appel qui redit ces clés (jamais reset puis pose : chaque appel d'imgRegle repasse par applyDPR) */
const MOB_P0={halo:'demi',mips:3,ombre:768,ciel:0,stries:null};
const MOB_RA=[null,{dpr:'cap'},{dpr:'cap',halo:'tout',mips:5,ombre:1024}]; /* la remontée, par cran (palier −1, −2) */
const MOB_R={on:/[?&]mob_raise=1\b/.test(location.search),frais:40,fen:60,wMed:12,wMax:16,p75:19,mal:5};
const MOB_PQ=['qlMin','ventK','emiK'],MOB_P={t:0,chg:-1e9,tk:0,b:null,n:0,s:[],mal:0,non:false};
function mobPalBase(){ /* les valeurs d'origine du palier, lues une fois, avant la 1re écriture */
  if(MOB_P.b)return MOB_P.b;const b={};for(const k of MOB_PQ)b[k]=PAL.b(k,k==='qlMin'?0:1);return(MOB_P.b=b);}
function mobPalEcrit(k,v){const A=PAL.B[k]||(PAL.B[k]=[mobPalBase()[k],mobPalBase()[k],mobPalBase()[k]]);A[PAL.n]=v;}
function mobPalCible(){let t=0;for(let i=1;i<MOB_PP.length;i++)if(MOB_S.D>=MOB_PP[i].d)t=i;
  if(MOB_S.thermo>=3)t=3;else if(MOB_S.thermo>=2)t=Math.max(t,2);return t;}
function mobPalCapJoueur(){let c=DPR_CAP;try{c=dprPlafond(SAVE.d.q==='fast');}catch(e){}return c;} /* le plafond du réglage du joueur (RAPIDE 1, NETTE ce que le départ de P2 en fait) */
function mobPalCapPlein(){let c=1.5;try{c=SAVE.d.q==='fast'?1:Math.min(devicePixelRatio,PAL.b('dprNetCap',1.5));}catch(e){}return c;} /* « vers l'ordinateur » : le plafond de la NETTE d'avant la passe 3 */
function mobPalVoulu(t){ /* ce qu'on pose à ce palier : TOUTES les clés (le départ de P2, puis les écarts du palier) pour un seul appel à imgRegle ; null au palier 0 (c'est `reset`) */
  if(!t)return null;const P=t>0?MOB_PP[t]:MOB_RA[-t],o=Object.assign({dpr:mobPalCapJoueur()},MOB_P0);
  for(const k of ['dpr','halo','mips','ombre','ciel','stries'])if(P[k]!=null)o[k]=P[k];
  if(o.dpr==='cap')o.dpr=mobPalCapPlein();else o.dpr=Math.min(o.dpr,mobPalCapJoueur());
  return o;}
function mobPalApplique(t){ /* UN seul appel à imgRegle par bascule (chaque appel refait applyDPR : cibles du compositeur, halo, ombre) */
  const B=mobPalBase(),P=t>0?MOB_PP[t]:null,baisse=t<MOB_P.t&&t>=0,o=mobPalVoulu(t);
  mobPalEcrit('ventK',B.ventK*((P&&P.k)||1));mobPalEcrit('emiK',B.emiK*((P&&P.k)||1));
  const kMax=qlBornes().kMax;mobPalEcrit('qlMin',P?Math.min(kMax,Math.max(B.qlMin,P.ql)):B.qlMin);
  if(baisse)QL.k=Math.min(QL.k,t===0?1:t===1?3:kMax); /* descente : l'échelle se desserre d'un coup — posé AVANT imgRegle, dont le qlPose le prend */
  MOB_P.t=t;MOB_P.chg=performance.now();MOB_P.n++;MOB_P.s.length=0;
  if(o)window.imgRegle(o);else window.imgRegle('reset');} /* imgRegle rejoue qlPose(QL.k) : le plancher, le cran et le plafond se posent ensemble */
function mobPalSain(){ /* l'image de cette seconde : le travail de l'image (CAD.w, lissé sur ~10 images) et la synchro (p75 de l'échelle QL, ramené à une image d'écran) */
  return {w:CAD.w,ok:QLR.p75<=MOB_R.p75};}
function mobPalMediane(a){const v=a.slice().sort(function(x,y){return x-y;});return v[v.length>>1];}
function mobPalTick(now){ /* à chaque image d'écran (appelé par mobGouvTick) ; ne travaille qu'une fois par seconde */
  if(!MOB_PALS||typeof window.imgRegle!=='function'||now-MOB_P.tk<1000)return;MOB_P.tk=now;
  const enCourse=started&&running&&!gameOver&&!garageOn&&!paused;
  if(MOB_POLY)window.__ccPoly.on=MOB_P.t>=2&&enCourse; /* (voir MOB_POLY) */
  if(!enCourse){MOB_P.s.length=0;MOB_P.mal=0;if(!started||gameOver||garageOn)MOB_P.non=false;}
  const c=mobPalCible();
  if(c>Math.max(MOB_P.t,0)){mobPalApplique(c);MOB_P.non=true;return;} /* la dose monte (ou un palier négatif doit tomber au 0 / 1) : tout de suite */
  if(c<MOB_P.t&&MOB_P.t>0){if(now-MOB_P.chg>=60000)mobPalApplique(MOB_P.t-1);return;} /* descente lente, un palier à la fois */
  if(MOB_P.t>0){if(DPR_CAP>mobPalVoulu(MOB_P.t).dpr+.001)window.imgRegle({dpr:mobPalVoulu(MOB_P.t).dpr});return;} /* un changement de réglage (RAPIDE/NETTE) a rendu le plafond : on le reprend */
  if(!enCourse||!MOB_R.on)return;
  const e=mobPalSain();MOB_P.s.push(e);if(MOB_P.s.length>MOB_R.fen)MOB_P.s.shift();
  if(MOB_P.t<0){ /* remonté : la fluidité manque 5 s de suite → retour au départ, sans remonter dans cette course */
    MOB_P.mal=(e.w>MOB_R.wMax||!e.ok)?MOB_P.mal+1:0;
    if(MOB_P.mal>=MOB_R.mal){MOB_P.mal=0;mobPalApplique(0);MOB_P.non=true;return;}}
  if(MOB_P.non||MOB_P.t<=-MOB_RA.length+1||MOB_S.D>=MOB_R.frais||MOB_S.thermo>=1||MOB_P.s.length<MOB_R.fen)return;
  const W=MOB_P.s.map(function(x){return x.w;});
  if(MOB_P.s.every(function(x){return x.ok;})&&mobPalMediane(W)<MOB_R.wMed&&Math.max.apply(null,W)<MOB_R.wMax)mobPalApplique(MOB_P.t-1);} /* chaque cran redemande ses 60 s (mobPalApplique vide la fenêtre) */
window.dbgGouvPaliers=function(){const B=MOB_P.b;return {actif:MOB_PALS,palier:MOB_P.t,bascules:MOB_P.n,dprCap:+DPR_CAP.toFixed(2),cran:QL.k,qlMin:PAL.b('qlMin',0),ventK:PAL.b('ventK',1),emiK:PAL.b('emiK',1),base:B,seuils:MOB_PP.map(function(p){return p.d;}),remonte:MOB_R.on,poly:MOB_POLY?Object.assign({},window.__ccPoly):null,fenetre:MOB_P.s.length,interdit:MOB_P.non,img:typeof window.imgRegle==='function'?window.imgRegle():null};};
