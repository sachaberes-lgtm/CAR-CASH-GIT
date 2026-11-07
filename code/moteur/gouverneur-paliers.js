
/* ===== LE GOUVERNEUR PILOTE LE COÛT GPU PAR PALIERS DE DOSE (2026-11-07, vitesse-fluide : « à chaud la puce est bridée ~3×, il faut couper ~3× de travail ») =====
   MESURÉ (13 Pro, app, build 6) : calé sur 30 et l'échelle QL au plancher (crans 9-11), la course tombe quand même à 83 ms (12 i/s) vers 8 min de jeu. Couper le travail d'UNE image est donc
   la seule réponse : la dose de chaleur (gouverneur-thermique.js) pose, PAR PALIERS, des leviers qui existent déjà — aucun fichier du rendu n'est touché, ce morceau n'écrit que :
     · `DPR_CAP` (puis `qlPose`) : le plafond de résolution — l'échelle QL se recalcule dessus (plafond ≤ 1 : ses crans se serrent, `kMax` = halo coupé + ombre 512 + flou radial coupé) ;
     · le plancher de l'échelle `PAL.B.qlMin` (elle ne remonte pas au-dessus, et le cran est tenu d'un coup) ;
     · `PAL.B.cielImg` (la passe lisse du ciel dessinée une image sur N), `PAL.B.ventK` (traits de vent) et `PAL.B.emiK` (émission de fumée, flammes, traits d'air additifs).
   PALIERS (dose en secondes équivalentes de 60 i/s — voir gouverneur-thermique.js ; le 30 calé monte de 0,5 par seconde : 60 ≈ 2 min, 100 ≈ 3 min 20, 140 ≈ 4 min 40 de course) :
     0 · < 60   : rien (le jeu tel quel).
     1 · ≥ 60   : plafond de résolution 1,25 ; halo à ¾ (cran 3).
     2 · ≥ 100  : plafond 1,0 ; cran maximal de l'échelle (halo coupé, ombre 512, flou radial coupé) ; ciel lisse une image sur 4 ; vent ×½ ; émission ×½ ; + le RÉGIME CHAUD (mobh-regime-chaud.js).
     3 · ≥ 140  : plafond 0,8 ; ciel lisse une image sur 8.
   L'ÉTAT THERMIQUE D'iOS (`cc:thermique`) : ≥ 2 pose la dose à 160 (gouverneur-thermique.js) = palier 3 tout de suite ; la règle `mobPalCible` garantit au moins 2 / 3 même si la dose baissait.
   ⚠ MONTÉE immédiate, REMONTÉE lente : un palier ne se lève qu'une minute après le dernier changement, un palier à la fois (la dose ne redescend que de 0,25 par seconde de repos).
   Seulement sur téléphone récent (TEL_NATIF, palier 2 : c'est MOB_GOUV). `?gouv=max` = rien de tout cela (et pas de régime chaud par défaut) ; `?mob_gouv=0` = plus de gouverneur du tout.
   Banc : `dbgGouv()` donne `gpu` (palier, ce qui est coupé) ; `dbgGouv(dose)` pose la dose et lève la garde d'une minute. */
const MOB_PALS=MOB_GOUV&&!/[?&]gouv=max\b/.test(location.search);
const MOB_PP=[{d:0},{d:60,dpr:1.25,ql:3,ciel:1,k:1},{d:100,dpr:1,ql:99,ciel:4,k:.5},{d:140,dpr:.8,ql:99,ciel:8,k:.5}]; /* tout se règle ici ; ql 99 = le cran maximal de l'échelle */
const MOB_PQ=['qlMin','cielImg','ventK','emiK'],MOB_P={t:0,chg:-1e9,tk:0,b:null,n:0};
function mobPalBase(){ /* les valeurs d'origine du palier, lues une fois, avant la 1re écriture */
  if(MOB_P.b)return MOB_P.b;const b={};for(const k of MOB_PQ)b[k]=PAL.b(k,k==='qlMin'?0:1);return(MOB_P.b=b);}
function mobPalEcrit(k,v){const A=PAL.B[k]||(PAL.B[k]=[mobPalBase()[k],mobPalBase()[k],mobPalBase()[k]]);A[PAL.n]=v;}
function mobPalCible(){let t=0;for(let i=1;i<MOB_PP.length;i++)if(MOB_S.D>=MOB_PP[i].d)t=i;
  if(MOB_S.thermo>=3)t=3;else if(MOB_S.thermo>=2)t=Math.max(t,2);return t;}
function mobPalCap(t){let c0=DPR_CAP;try{c0=dprPlafond(SAVE.d.q==='fast');}catch(e){}return Math.min(c0,MOB_PP[t].dpr||c0);} /* le plafond du réglage du joueur, sous celui du palier */
function mobPalApplique(t){
  const B=mobPalBase(),P=MOB_PP[t],baisse=t<MOB_P.t;
  mobPalEcrit('cielImg',Math.max(B.cielImg,P.ciel||B.cielImg));mobPalEcrit('ventK',B.ventK*(P.k||1));mobPalEcrit('emiK',B.emiK*(P.k||1));
  DPR_CAP=mobPalCap(t);
  const kMax=qlBornes().kMax;mobPalEcrit('qlMin',t?Math.min(kMax,Math.max(B.qlMin,P.ql)):B.qlMin);
  MOB_P.t=t;MOB_P.chg=performance.now();MOB_P.n++;
  if(baisse)qlReprise();else qlPose(QL.k);} /* remontée : l'échelle rend la pleine résolution du réglage ; descente : le plancher et le plafond se posent tout de suite */
function mobPalTick(now){ /* à chaque image d'écran (appelé par mobGouvTick) ; ne travaille qu'une fois par seconde */
  if(!MOB_PALS||now-MOB_P.tk<1000)return;MOB_P.tk=now;
  const c=mobPalCible();
  if(c>MOB_P.t){mobPalApplique(c);return;}
  if(c<MOB_P.t){if(now-MOB_P.chg>=60000)mobPalApplique(MOB_P.t-1);return;}
  if(MOB_P.t&&DPR_CAP>mobPalCap(MOB_P.t)+.001){DPR_CAP=mobPalCap(MOB_P.t);qlPose(QL.k);}} /* un changement de réglage (RAPIDE/NETTE) a rendu le plafond : on le reprend */
window.dbgGouvPaliers=function(){const B=MOB_P.b;return {actif:MOB_PALS,palier:MOB_P.t,bascules:MOB_P.n,dprCap:+DPR_CAP.toFixed(2),cran:QL.k,qlMin:PAL.b('qlMin',0),cielImg:PAL.b('cielImg',1),ventK:PAL.b('ventK',1),emiK:PAL.b('emiK',1),base:B,seuils:MOB_PP.map(function(p){return p.d;})};};
