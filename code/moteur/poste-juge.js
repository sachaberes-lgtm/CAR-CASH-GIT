/* ===== LE JUGE DU RÉGIME DE L'ORDINATEUR (2026-11-10, Sacha : « pas de latence peu importe l'ordi, ça doit s'adapter en fonction de chaque ordi ») =====
   Le RÉGIME du poste (POSTE, rendu/soleil-planete.js : 3 MAX · 2 ALLÉGÉ · 1 LÉGER · 0 MINIMUM) se choisit au chargement ; ici, la COURSE le juge, une fois par seconde, « au calme »
   (ni reconstruction de zone, ni retour d'onglet, ni 30 Hz imposé par le navigateur) :
     · MAL  : à bout de leviers (calé sur 30, ou l'échelle QL à son plancher net) et la médiane des images toujours en retard (> 24 ms ; calé : plus de la moitié des images ratent même le 30).
     · CALÉ : la seconde s'est jouée à 30 i/s (la cadence stable).
     · BIEN : ni calé, ni baissé (l'échelle à son cran de départ), 9 images sur 10 à l'heure, et moins de 7 ms de travail du processeur par image.
   20 s de MAL (et 40 % de la course), ou une course de 45 s calée la moitié du temps → un régime PLUS BAS — à la 2e course lente (voir posteBaisse) —, écrit tout de suite (`localStorage.cashcarPoste`), appliqué à la prochaine visite :
   60 i/s dans un régime plus léger valent mieux que 30 au maximum (« fluidité d'abord »). Le régime quitté devient un MUR : 1 jour au 1er échec (l'ordi était peut-être occupé ailleurs ce jour-là), puis 2, 4, 8, 14 jours s'il échoue encore.
   Une course d'au moins 60 s jugées, BIEN à 80 % et calée moins de 10 % → un régime PLUS HAUT à la prochaine visite, sauf vers un mur. Le rendu logiciel reste au MINIMUM ; IMAGE = HAUTE et `?poste=N` ne
   sont jamais jugés. En fin de course, le cran moyen de l'échelle est retenu : la course suivante en repart (POSTE.k0).
   `posteCadOk` : sur l'ordi au palier 2, la cadence stable n'entre qu'en DERNIER — l'échelle QL d'abord (elle peut rendre le 60), sauf si c'est le processeur qui bute (> 12 ms de travail par image :
   baisser la résolution n'y changerait rien) ou si un cran de résolution vient de ne rien rapporter (le plafond de l'échelle). */
const PJ={t:0,t0:0,crs:false,sec:0,mal:0,bien:0,cad:0,kS:0,fait:0,averti:false,pq:''};
function posteCadOk(now){ if(!POSTE.auto||PAL.n<2||qHaute())return true;
  const b=qlBornes();return QL.k>=b.kNet||CAD.w>12||!!(QL.plafT&&now-QL.plafT<45000&&QL.k>=QL.plafK);}
function posteChange(d,pq){ const r=Math.max(0,Math.min(3,POSTE.r+d));if(r===POSTE.r)return;
  const o={r:r,src:'mesure',de:POSTE.r,pq:pq,av:0};if(d<0){const a=posteLit(),m=a&&a.mur;o.mur={r:POSTE.r,t:Date.now(),n:(m&&m.r===POSTE.r?(m.n|0):0)+1};}
  posteEcrit(o);PJ.fait=d;PJ.pq=pq;
  try{window.__ccNote&&window.__ccNote('poste','régime '+POSTE.r+' → '+r+' à la prochaine visite : '+pq);}catch(e){}}
/* DEUX COURSES LENTES POUR BAISSER : la 1re ne laisse qu'un AVERTISSEMENT (`av` = régime + 1) — l'ordi était peut-être occupé ailleurs (une mise à jour, un autre programme) ; la 2e baisse.
   Une course qui se passe bien entre-temps efface l'avertissement. Pendant ce temps l'échelle QL et la cadence stable tiennent la course. */
function posteBaisse(pq){ const a=posteLit();
  if(!(a&&a.av===POSTE.r+1)){posteEcrit({av:POSTE.r+1});PJ.averti=true;PJ.pq='averti : '+pq;return;}
  posteChange(-1,pq);}
function posteJugeable(){return POSTE.auto&&POSTE.src!=='?poste'&&!qHaute();}
function posteFin(){ /* la course vient de finir */
  if(!posteJugeable()||PJ.sec<15)return;
  try{posteEcrit({k:Math.max(0,Math.min(qlBornes().kNet,Math.round(PJ.kS/PJ.sec))),kr:PJ.fait?-1:POSTE.r});}catch(e){}
  const bonne=PJ.cad<=PJ.sec*.1&&PJ.bien>=PJ.sec*.8;
  if(bonne&&PJ.sec>=30&&!PJ.averti){const a0=posteLit();if(a0&&a0.av)posteEcrit({av:0});}
  if(PJ.fait||POSTE.r>=3||POSTE.logiciel||PJ.sec<60||!bonne)return;
  const a=posteLit(),m=a&&a.mur;if(m&&m.r===POSTE.r+1&&Date.now()-m.t<Math.min(14,Math.pow(2,(m.n||1)-1))*864e5)return;
  posteChange(1,'une course de '+PJ.sec+' s avec de la marge');}
function posteJuge(now){ /* appelé par cadFin à chaque image ; ne travaille qu'une fois par seconde */
  if(now-PJ.t<1000)return;PJ.t=now;
  const enCourse=started&&running&&!gameOver&&!garageOn;
  if(!enCourse){if(PJ.crs){PJ.crs=false;posteFin();}return;}
  if(paused)return;
  if(!PJ.crs){PJ.crs=true;PJ.t0=now;PJ.sec=PJ.mal=PJ.bien=PJ.cad=PJ.kS=0;PJ.averti=false;}
  if(!CAD.calme||now-PJ.t0<15000)return; /* les 15 premières secondes ne comptent pas : après un changement de régime, les programmes de la carte graphique se recompilent (des à-coups qui ne disent rien du poste) */
  const b=qlBornes();PJ.sec++;PJ.kS+=QL.k;if(CAD.on)PJ.cad++;
  if((CAD.on||QL.k>=b.kNet)&&QLR.p50>(CAD.on?21:24))PJ.mal++;
  else if(!CAD.on&&QL.k<=PAL.b('qlMin',0)&&QLR.p90<17.8&&CAD.w<7)PJ.bien++;
  if(PJ.fait||PJ.averti||POSTE.r<=0||!posteJugeable())return;
  if(PJ.mal>=20&&PJ.mal>=PJ.sec*.4)posteBaisse(PJ.mal+' s en retard sur '+PJ.sec+' s, à bout de leviers');
  else if(PJ.sec>=45&&PJ.cad>=PJ.sec*.5)posteBaisse('calé sur 30 i/s '+PJ.cad+' s sur '+PJ.sec);}
window.dbgPoste=function(x){ if(x==='oubli'){try{localStorage.removeItem('cashcarPoste');}catch(e){}return 'oublié : la prochaine visite reclasse ce poste';}
  return {r:POSTE.r,nom:['MINIMUM','LÉGER','ALLÉGÉ','MAX'][POSTE.r],src:POSTE.src,auto:POSTE.auto,palier:PAL.n,allege:ALLEGE,puce:String(POSTE.puce).slice(0,70),logiciel:POSTE.logiciel,faible:POSTE.faible,
    coeurs:POSTE.coeurs,mem:POSTE.mem,banc:POSTE.banc,k0:POSTE.k0,juge:{sec:PJ.sec,mal:PJ.mal,bien:PJ.bien,cale:PJ.cad,cran:PJ.sec?+(PJ.kS/PJ.sec).toFixed(1):0,change:PJ.fait,averti:PJ.averti,pq:PJ.pq},appris:posteLit()};}; /* (banc) */
