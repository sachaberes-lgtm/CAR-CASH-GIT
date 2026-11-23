/* ===== LES YEUX DU BOT (2026-11-23, etape 1 BOTS-ML : « des yeux corrects — le cerveau voit ce que le joueur voit ») =====
   Une porte de LECTURE posee dans le vrai jeu (ml/reel) : `voir(J)` rend LA VUE, un objet de nombres simples, sans rien de three.js.
   Elle LIT, elle ne pose rien : ses propres vecteurs, aucun tirage au hasard, aucune variable du jeu ecrite.
   Reperes (ceux du jeu) : distances en METRES, temps en SECONDES, angles en RADIANS ; tout ce qui est lateral est POSITIF A GAUCHE
   (lat, cap, volant, virage, gisement). `d` = la distance le long de la route, devant la caisse.
   Le detail de chaque champ : ml/bot/README.md (« Ce que le bot voit »). */
const YEUX_CODE=`window.__YEUX=(function(){
  const V1=new THREE.Vector3(),V2=new THREE.Vector3(),V3=new THREE.Vector3(),VIT=new THREE.Vector3();
  const DEVANT=[30,60,100,150,220,300,400,550],POUV={n:'nitro',a:'air',v:'vitesse',m:'aimant',x:'x2'};
  const r1=function(x){return Math.round(x*10)/10;},r2=function(x){return Math.round(x*100)/100;},r3=function(x){return Math.round(x*1000)/1000;};
  const idx=function(sv){return Math.max(0,Math.min(NP-1,Math.round(sv/L*(NP-1))));};
  /* de combien la route tourne entre i et j, autour du haut de la route en i : + = a gauche */
  const virage=function(i,j,sd){const a=T[i],b=T[j],n=Nn[i];V1.crossVectors(a,b);return Math.atan2(V1.dot(n)*sd,a.dot(b));};
  /* les troncons de route EN CONTREBAS que la caisse peut atteindre en quittant la route (ou depuis son vol) : la matiere des raccourcis.
     gain = la piste sautee, moins la distance volee en ligne droite (la mesure du jeu : il crie RACCOURCI a partir de 60 m). */
  const troncons=function(P,sRef,reste){
    const g=FALL_G*gK()*SPD,vh=Math.hypot(VIT.x,VIT.z),out=[];
    if(vh<5)return out;
    const pas=Math.max(1,Math.round(25/(L/(NP-1)))),i0=idx(sRef+80),i1=idx(sRef+3500);
    let cur=null;
    for(let j=i0;j<=i1;j+=pas){
      const Q=pts[j],dy=P.y-Q.y;let ok=false,o=null;
      if(dy>8&&Nn[j].y>.35){
        const hx=Q.x-P.x,hz=Q.z-P.z,dist=Math.hypot(hx,hz),sj=j/(NP-1)*L,gain=(sj-sRef)-Math.hypot(dist,dy);
        if(gain>=60&&dist>20){
          const gis=Math.atan2(VIT.z*hx-VIT.x*hz,VIT.x*hx+VIT.z*hz);            /* + = le troncon est a gauche de ma trajectoire */
          const tx=T[j].x,tz=T[j].z,axe=Math.abs(Math.atan2(hx*tz-hz*tx,hx*tx+hz*tz)); /* l'angle d'arrivee sur son axe (pose propre : moins de 55 degres) */
          const tC=(VIT.y+Math.sqrt(VIT.y*VIT.y+2*g*dy))/g,tT=dist/vh;
          o={s:Math.round(sj),gain:Math.round(gain),dist:Math.round(dist),chute:Math.round(dy),gisement:r2(gis),axe:r2(axe),tChute:r2(tC),tTrajet:r2(tT)};
          ok=tC<reste-.3&&tT>tC*.55&&tT<tC*1.6&&Math.abs(gis)<.9&&axe<.95;}}
      if(ok){if(!cur){cur={m:o,s0:o.s,s1:o.s};out.push(cur);}else{cur.s1=o.s;if(o.gain>cur.m.gain)cur.m=o;}}else cur=null;}
    return out.map(function(c){c.m.longueur=c.s1-c.s0+25;return c.m;}).sort(function(a,b){return b.gain-a.gain;}).slice(0,4);};
  return function(){
    const sol=mode==='drive',vol=mode==='fall',sd=side<0?-1:1,cap9=nitroCap(),P=carGroup.position;
    const c=LVL&&LVL.cur,vm=vitMult();
    const v={
      mode:sol?'sol':vol?'vol':'boom',fini:!!(gameOver||mode==='boom'),mort:(gameOver||mode==='boom')?((typeof mortCause==='string'&&mortCause)||'?'):null,
      carte:c?(c.carte||c.piste||c.id||null):null,meteo:c?(c.meteo||null):null,
      nitro:r3(nitroR/cap9),reserve:r3(nitroX/cap9),nitroOn:!!nitroOn,nitroLibre:pwrNitroT>0||startBoostT>0,
      flow:r2(FLOW.v),flowNiveau:FLOW.lv|0,argent:r2(money),pieces:coinsGot|0,figures:runStats.tricks|0,chaine:CHA.n|0,moteur:engTier|0,
      pouvoirs:{nitro:r1(pwrNitroT),vitesse:r1(pwrSpdT),air:r1(pwrAirT),aimant:r1(pwrMagT)},
      L:Math.round(L),demi:ROAD_HALF};
    if(sol){
      const bi=idx(s),seg=L/(NP-1),vit=Math.abs(vA)*SPD*vm;
      v.s=r1(s);v.fin=Math.round(L-s);v.lat=r2(lat);v.cap=r3(psi);v.vitesse=r1(vit);v.volant=r2(steer);v.dessous=sd<0;
      v.drift=!!driftEnCours;v.glisse=slipT>0;v.sursis=r2(graceT);v.rebond=hopY>0||hopV!==0;v.figureRoute=!!FR.on;v.bond=r2(FR.on?FR.lift:0);
      v.lacetRoute=r3(routeLacet);v.lacetMax=r3(lacetMax(vA)*vm);
      v.pente=r3(Math.asin(Math.max(-1,Math.min(1,T[bi].y))));
      v.devers=r3(Math.asin(Math.max(-1,Math.min(1,B[bi].y))));
      /* devant : de combien la route tourne, monte, se PENCHE (devers : 0 = a plat, + = le bord gauche plus haut), si elle est a l'envers, s'il y a un trou */
      v.route=DEVANT.map(function(d){const j=idx(s+d);return {d:d,virage:r3(virage(bi,j,sd)),monte:r1(pts[j].y-pts[bi].y),
        devers:r3(Math.asin(Math.max(-1,Math.min(1,B[j].y)))),envers:Nn[j].y<0,trou:!!(typeof TROU!=='undefined'&&TROU&&TROU[j])};});
      v.plaques=[];for(let i=0;i<PADS.length;i++){const d=PADS[i]-s;if(d>0&&d<450)v.plaques.push({d:Math.round(d),lat:r1(sd*PADL[i])});}
      v.flaques=[];for(const o of OILS){if(o.face!==side)continue;const d=o.s-s;if(d>-5&&d<350)v.flaques.push({d:Math.round(d),lat:r1(sd*o.lat),rayon:r1(o.r)});}
      /* les pieces par tranches de 25 m (ou est la file, combien), les fruits et les bidons un par un */
      const tr={};v.fruits=[];v.orbes=[];
      for(let i=0;i<pickups.length;i++){const p=pickups[i];if(p.taken||p.face!==side||p.air)continue;const d=p.s-s;if(d<4||d>325)continue;
        if(p.pow){v.orbes.push({d:Math.round(d),lat:r1(p.lat),pouvoir:POUV[p.pow]||p.pow});continue;}                       /* un orbe de pouvoir */
        if(p.fruit>=0){const fd=FRUIT_DEFS[p.fruit]||{};v.fruits.push({d:Math.round(d),lat:r1(p.lat),nom:fd.n||null,force:fd.boost||0});continue;} /* un fruit : il remplit la reserve de nitro */
        const k=Math.floor(d/25),q=p.deux?2:1,t=tr[k]||(tr[k]={d:k*25+12,n:0,l:0});t.n+=q;t.l+=p.lat*q;}                 /* une piece (deux : elle compte double) */
      v.piecesDevant=Object.keys(tr).map(function(k){const t=tr[k];return {d:t.d,lat:r1(t.l/t.n),n:t.n};}).sort(function(a,b){return a.d-b.d;});
      v.modules=[];try{for(const m of (MODS||[])){if(m.s1<s)continue;if(m.s0-s>900)break;v.modules.push({nom:m.fig||null,d0:Math.round(m.s0-s),d1:Math.round(m.s1-s),climax:!!m.climax});if(v.modules.length>=2)break;}}catch(e){}
      VIT.copy(T[bi]).multiplyScalar(Math.cos(psi)).addScaledVector(B[bi],sd*Math.sin(psi)).multiplyScalar(vit);
      v.troncons=sd>0?troncons(P,s,airMax()):[];
    }else if(vol){
      const vit=fallVel.length()*SPD,reste=pwrAirT>0?99:Math.max(0,airMax()-fallTR);
      VIT.copy(fallVel).multiplyScalar(SPD);
      v.vitesse=r1(vit);v.volant=r2(steer);
      const f={t:r2(fallTR),reste:r2(reste),monte:r1(VIT.y),plancher:Math.round(fallPos.y-(trackMinY-120)),lacetMax:r3(lacetVol(fallVel.length()))};
      /* la route la plus proche (le radar de la pose) : ou j'en suis le long de la piste, de combien je suis a cote et au-dessus */
      const sN=curNear?lastNearS:s;v.s=r1(sN);v.fin=Math.round(L-sN);
      if(curNear){const bi=idx(lastNearS);f.proche={lat:r1(curLatOff),haut:r1(curHOff),avant:r1(VIT.dot(T[bi])),cote:r1(VIT.dot(B[bi])),versRoute:r1(-VIT.dot(Nn[bi])),
        axe:r3(Math.atan2(VIT.dot(B[bi]),VIT.dot(T[bi])))};}else f.proche=null;
      /* l'anneau de pose que le joueur voit : ou il est par rapport a ma trajectoire, dans combien de temps j'y suis */
      if(LM.vu&&CAMV.eta<90){const hx=landMark.position.x-P.x,hz=landMark.position.z-P.z;
        f.anneau={delai:r2(CAMV.eta),dist:Math.round(Math.hypot(hx,hz)),dessous:r1(P.y-landMark.position.y),gisement:r2(Math.atan2(VIT.z*hx-VIT.x*hz,VIT.x*hx+VIT.z*hz))};}else f.anneau=null;
      /* la figure en cours : combien il en tourne, le temps qu'il lui faut encore, l'angle qui lui reste, l'ecart a l'endroit */
      const C=FX2.corps;f.figure=null;
      if(C&&C.figs.length){let n=0,ang=0;for(let i=0;i<C.figs.length;i++){const r=C.figs[i];if(r.paye)continue;n++;for(let j=0;j<r.mv.length;j++)ang=Math.max(ang,r.mv[j].tours*6.2832-r.mv[j].th);}
        if(n||C.ecart()>.05)f.figure={enCours:n,reste:r2(C.reste()),angle:r2(ang),ecart:r2(C.ecart()),budget:r2(Math.min(9,C.budget))};}
      f.figuresDuVol=FX2.payees|0;
      v.vol=f;
      v.troncons=troncons(P,sN,reste);
    }
    return v;};
})();
window.__MODE=function(){return mode==='drive'?(FR.on?'bond':'sol'):mode==='fall'?'vol':'boom';};`;

function installer(J){ J.ev(YEUX_CODE); return J; }
function voir(J){ return J.g.sandbox.__YEUX(); }
function modeDe(J){ return J.g.sandbox.__MODE(); }
module.exports={installer,voir,modeDe,YEUX_CODE};
