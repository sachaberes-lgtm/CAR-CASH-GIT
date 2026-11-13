/* LA CONSTRUCTION — un générateur (voir LES TRANCHES), mené d'une traite par buildJade. Il ne touche NI à la scène NI à la route NI aux
   uniformes (jadePose / jadeReprend s'en chargent). */
/* ======================= LE DÉCOR AU HASARD (2026-10-20, Sacha : « chaque map doit être aléatoire avec des modules et des décors qui changent, TOUTES LES MAPS ») =======================
   MESURÉ AVANT : le tracé de la vallée change depuis le 18/10 (axe, ordre des monuments, humeurs), pas son décor — les mêmes rangs de piliers (mêmes
   densités, mêmes hauteurs autour de la route), la même jade vert-de-gris, autant de pins, de lianes, de cascades, de rayons et de brume à chaque
   vallée. Désormais, par vallée, un TIRAGE DE DÉCOR dans un flux à lui (`dr`, né de la graine du décor : jamais `jr`), treize choix indépendants
   (`JADE.dz`, lisible dans `dbgJade().deco`) — (v16, Léo : « évite les clichés en mode Chine ») ni pagode, ni lanterne, ni pavillon ne reviennent :
   · LA PIERRE (`teinte`) : jade (celle d'avant), émeraude, grès rose, ardoise, or d'automne — deux uniforms (uRocT, uVerT) dans le programme du verre
     de jade : même programme, 1 = l'image d'avant ;
   · LES PILIERS DU BORD (`dens`) : la vallée ouverte ×0,6, avant, la forêt de piliers ×1,25 (les trois rangs le long de la route) ;
   · LEUR HAUTEUR (`haut`) : des pics qui plongent sous la route (−70 m), avant, ou qui la dominent (+90 m) ;
   · LEUR CARRURE (`larg`) : fins ×0,75 (les gabarits étroits et hauts), avant, massifs ×1,3 ;
   · LE LOINTAIN (`loin`) : ×0,5 / 1 / 1,35 ;
   · LES ROCHERS QUI FLOTTENT (`roch`) : rares, avant, une NUÉE (3 montagnes sur 4, jusqu'à 4 rochers chacune) ;
   · LA FORÊT PEINTE (`pins`) : clairsemée ×0,45, avant, dense ×1,2, et la part des pins ;
   · LES LIANES (`lian`) : aucune, peu, avant, des rideaux ;
   · LES CASCADES (`casc`) : rares, avant, partout ;
   · LES RAYONS (`ray`), LES NUAGES (`nua`), LA BRUME (`brume` : son nombre et sa part au ras de l'eau) ;
   · L'EAU (`eau`) : basse, avant, haute (le fleuve du ciel, à 165 / 185 / 210 m au-dessus de la mer de nuages).
   La règle d'or ne bouge pas : chaque pilier passe par `regle` (SOUS la dalle à 45 m, ou au-dessus à 70 m). `?sans=jadedecor` = la vallée d'avant,
   au tirage près (aucun tirage de plus dans `jr`). */
const JADE_TEINTES=[['jade',1.3,[1,1,1],[1,1,1]],['émeraude',1,[.84,1.08,.96],[.82,1.18,.92]],['grès rose',1,[1.18,.94,.88],[1.05,1,.9]],['ardoise',.9,[.84,.9,1.1],[.88,1,1.08]],['or d\'automne',.9,[1.06,1,.9],[1.55,1.12,.55]]];
function jadeDecoTire(seed){
  const dr=mulberry32((seed^0xDEC01A)>>>0),ch=a=>a[(dr()*a.length)|0],pds=L9=>{let t=0;for(const e of L9)t+=e[1];let u=dr()*t;for(const e of L9){u-=e[1];if(u<=0)return e;}return L9[0];};
  const D={},li=[];
  {const t=pds(JADE_TEINTES);D.roc=t[2];D.ver=t[3];li.push('pierre '+t[0]);}
  {const d=ch([[.6,'vallée ouverte'],[1,'piliers'],[1.25,'forêt de piliers']]);D.dens=d[0];li.push(d[1]);}
  {const h=ch([[-70,'pics bas'],[0,'pics à hauteur'],[90,'pics dominants']]);D.haut=h[0];li.push(h[1]);}
  {const l=ch([[.75,'fins'],[1,'moyens'],[1.3,'massifs']]);D.larg=l[0];li.push('piliers '+l[1]);}
  D.loin=ch([.5,1,1.35]);li.push('lointain ×'+D.loin);
  {const r=ch([[.18,3,'rares'],[.5,3,'comme avant'],[.75,4,'une nuée']]);D.roch={p:r[0],n:r[1]};li.push('rochers flottants : '+r[2]);}
  {const p=ch([.45,1,1.2]),q=ch([.32,.62,.9]);D.pins={k:p,pin:q};li.push('forêt peinte ×'+p+', '+Math.round(q*100)+' % de pins');}
  D.lian=ch([0,.5,1,1.6]);li.push('lianes ×'+D.lian);
  {const c=ch([[.03,8,'rares'],[.11,16,'comme avant'],[.26,26,'partout']]);D.casc={p:c[0],n:c[1]};li.push('cascades '+c[2]);}
  D.ray=ch([.45,1,1.5]);li.push('rayons ×'+D.ray);
  D.nua=ch([.6,1,1.4]);li.push('nuages ×'+D.nua);
  {const b=ch([.6,1,1.5]),lo=ch([.25,.45,.7]);D.brume={n:b,bas:lo};li.push('brume ×'+b+' ('+Math.round(lo*100)+' % au ras de l\'eau)');}
  D.li=li;return D;}
function* jadeBatit(seed,cle){
  const t00=performance.now(),M9=jadeMats(),G=jadeGabarits(),jr=mulberry32((seed^0x1ADE5EED)>>>0),Q=JADE.Q||{};
  const DZ=JADE_DECOR?jadeDecoTire(seed):null;JADE.dz=DZ;JADE.deco=DZ?DZ.li:null; /* (LE DÉCOR AU HASARD) le tirage de cette vallée */
  const root=new THREE.Group();root.matrixAutoUpdate=false;JADE.root=root;
  let yMin=1e9,yMax=-1e9;for(let i=0;i<NP;i+=4){if(pts[i].y<yMin)yMin=pts[i].y;if(pts[i].y>yMax)yMax=pts[i].y;}
  JADE.merY=yMin-(JADE.deco3?520:230); /* (2026-11-13) la descente Alléluia : l'abîme plus profond (les tours de la fin descendent loin) */JADE.eauY=JADE.merY-40; /* (2026-11-12, plus de mer) l'« eau » n'est plus que le fond de l'abîme, sous le pied de toutes les montagnes (elles s'arrêtent à merY + 90) : la mer de nuages du ciel y est peinte (uJMerY) */ // (v17, Léo : « l'eau plus haute, elle vient frapper les montagnes ») les montagnes sont posées comme avant (pied ≥ merY + 90) ; l'eau monte à merY + 140 : celles du bas trempent
   // LA MER DE NUAGES, loin sous les montagnes : elles flottent — (v14, Léo : « remonte le niveau de l'eau ») 470 → 230 m sous le point le plus bas de la route
  const HB=120,grille=new Map(),pas=Math.max(1,Math.round(10/(L/(NP-1))));
  for(let i=0;i<NP;i+=pas){const p=pts[i],k=Math.floor(p.x/HB)*100003+Math.floor(p.z/HB);let a=grille.get(k);if(!a)grille.set(k,a=[]);a.push(i);}
  const proches=(x,z,R,cb)=>{const r=Math.ceil(R/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);
    for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=grille.get((bx+dx)*100003+(bz+dz));if(a)for(let j=0;j<a.length;j++)cb(a[j]);}};
  const sDe=v=>{let bi=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(v);if(d<bd){bd=d;bi=i;}}return bi;};
  const zonesNu=[];let iPorte=-1,iPont=-1;
  if(Q.porte0&&Q.porte1)iPorte=Math.round((sDe(Q.porte0.p)+sDe(Q.porte1.p))/2);
  if(Q.pont0&&Q.pont1)iPont=Math.round((sDe(Q.pont0.p)+sDe(Q.pont1.p))/2);
  // ---- LES MONTAGNES : [x, z, rayon (m), y du pied (la pointe), y du sommet, gabarit, quart de tour, graine, distance à la route, (10e, optionnel) étiquette de quartier forcé] ----
  const PIL=[],PG=new Map(),PGC=120,mer=JADE.merY+90,snap=v=>Math.round(v/VX)*VX;
  const pgVois=(x,z,cb)=>{const bx=Math.floor(x/PGC),bz=Math.floor(z/PGC);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const a=PG.get((bx+dx)+','+(bz+dz));if(a)for(const q of a)if(cb(q))return true;}return false;};
  const pose=q9=>{PIL.push(q9);const kk=Math.floor(q9[0]/PGC)+','+Math.floor(q9[1]/PGC);let a9=PG.get(kk);if(!a9)PG.set(kk,a9=[]);a9.push(q9);};
  const regle=(cx,cz,rm,yt,Hs)=>{ // LA RÈGLE D'OR à deux issues : SOUS la dalle (sommet −45 m) ou AU-DESSUS (pointe +70 m) — null si ni l'une ni l'autre
    let lo=1e9,hi=-1e9;const clr=rm+ROAD_HALF+18;
    proches(cx,cz,clr,function(i){const p=pts[i];if(Math.hypot(p.x-cx,p.z-cz)>clr)return;lo=Math.min(lo,p.y);hi=Math.max(hi,p.y);});
    if(hi>-1e9&&yt>lo-45&&yt-Hs<hi+70){const tU=Math.floor((lo-45)/VX)*VX,tA=Math.ceil((hi+70+Hs)/VX)*VX,okU=tU-Hs>=mer,okA=tA<hi+760;
      if(okU&&(!okA||yt-tU<=tA-yt))return tU;if(okA)return tA;return null;}
    return yt;};
  const CVOL=JADE.deco3?jadeCouloirVol():null; /* (2026-11-13) LE COULOIR DU VOL des raccourcis : rien ne s'y pose */
  const tente=(cx,cz,r,yt,vert,dR,libre,inv,yRef,forme)=>{ /* forme (2026-11-13) : 1 une île, 2 un massif (JADE_ILE) */ /* inv : la chance qu'une montagne qui flotte TOUT ENTIÈRE au-dessus de yRef + 30 m soit posée RENVERSÉE */
    const t=forme?jadeIleDe(r,forme===2):jadeTplDe(r),T9=G.p[t],rm=T9.rmax*VX,Hs=T9.yTop*VX;cx=snap(cx);cz=snap(cz);
    if(!libre)for(const z of zonesNu)if(Math.hypot(cx-z[0],cz-z[1])<z[2]+rm)return false;
    const pl9=libre?1e9:plaf(cx,cz);if(yt>pl9)yt=pl9; /* (2026-11-12, JADE QUI SECOUE) autour d'une route qu'un module a levée, aucun sommet ne dépasse la crête − 35 m */
    yt=Math.floor(yt/VX)*VX;if(yt-Hs<mer)yt=Math.ceil((mer+Hs)/VX)*VX; // elle FLOTTE : sa pointe reste au-dessus de la mer
    yt=regle(cx,cz,rm,yt,Hs);if(yt==null||yt>pl9+VX)return false; /* …et celle que la mer ou la règle d'or repousserait au-dessus du plafond n'est pas posée */
    if(pgVois(cx,cz,function(q){return Math.hypot(q[0]-cx,q[1]-cz)<(q[2]+rm)*.9;}))return false;if(!jadeVolLibre(CVOL,cx,cz,rm,yt-Hs,yt))return false;
    const q9=[cx,cz,rm,yt-Hs,yt,t,(jr()*4)|0,jr(),dR];if(inv&&yRef!=null&&yt-Hs>yRef+30&&jr()<inv)q9.inv=1;pose(q9);return true;};
  const touffe=(cx,cz,r0,yN,hMin,hMax,n,vert,dR,inv,forme)=>{let ok=0;
    for(let k=0;k<n;k++){const r=r0*(.55+jr()*.6),an=jr()*6.283,dd=k===0?0:(r0+r)*(.9+jr()*.5);
      if(tente(cx+Math.cos(an)*dd,cz+Math.sin(an)*dd,r,yN+hMin+(hMax-hMin)*Math.pow(jr(),.8),vert,dR+dd,false,inv,yN,forme))ok++;}
    return ok;};
  if(iPorte>0){const p=pts[iPorte],b=B[iPorte];zonesNu.push([p.x,p.z,140]);for(let k=-6;k<=6;k++)zonesNu.push([p.x+b.x*k*85,p.z+b.z*k*85,95]);}
  if(iPont>0){const p=pts[iPont],t=T[iPont];for(let k=-3;k<=3;k++)zonesNu.push([p.x+t.x*k*70,p.z+t.z*k*70,ROAD_HALF+(k===0?30:70)]);}
  /* ===== LES PICS POSÉS PAR LES MODULES (2026-11-12, JADE QUI SECOUE — JADE.pose, voir genJade1) =====
     Avant les rangs au hasard (qui s'écartent d'eux). Au bord : le centre à demi-largeur + gap + le rayon du gabarit ; au centre d'un tour : là où le module l'a mis, s'il tient dans le cercle.
     La règle d'or reste entière : un pic qui approcherait la dalle à moins de gap − 3 m (à sa hauteur) est repris plus fin, puis abandonné. `leve(i)` : ce qu'un module a ajouté à la route en ce point. */
  JADE.posees=0;JADE.pontSaute=0;
  const un=function(o,cx0,cz0,ix,iz,r,rMax){
      for(let e=0;e<3;e++,r*=.72){const t=jadeTplDe(r),T9=G.p[t],rm=T9.rmax*VX,Hs=T9.yTop*VX;if(rMax&&rm>rMax)continue;
        const dC=(ix||iz)?ROAD_HALF+o.gap+rm:0,cx=snap(cx0+ix*dC),cz=snap(cz0+iz*dC);
        let yt=o.dessus?Math.ceil((o.y+o.clear+Hs)/VX)*VX:Math.floor(Math.min(o.y+o.h,o.y+o.bas+Hs-60)/VX)*VX; /* dessus : l'île qui flotte au-dessus de la route, son pied `clear` m plus haut */if(!o.fond&&yt-Hs<mer)yt=Math.ceil((mer+Hs)/VX)*VX; /* le pied 60 m au moins sous la route : il se dresse À CÔTÉ d'elle, il ne pend pas au-dessus */
        let ok=true;const clr=rm+ROAD_HALF+o.gap-3;proches(cx,cz,clr,function(i){const p=pts[i];if(p.y>yt-Hs-15&&p.y<yt+15&&Math.hypot(p.x-cx,p.z-cz)<clr)ok=false;});
        if(!ok||pgVois(cx,cz,function(q){return Math.hypot(q[0]-cx,q[1]-cz)<(q[2]+rm)*.9;})||!jadeVolLibre(CVOL,cx,cz,rm,yt-Hs,yt))continue;
        {const q9=[cx,cz,rm,yt-Hs,yt,t,(jr()*4)|0,jr(),ROAD_HALF+o.gap];if(o.inv)q9.inv=1;pose(q9);}JADE.posees++;return true;}
      return false;};
  if(JADE.pose){for(const o of JADE.pose){if(performance.now()>JF.lim)yield;
      if(o.c){un(o,o.x,o.z,0,0,o.r,o.R-ROAD_HALF-o.gap);
        for(let k=0;k<o.sat;k++){const an=jr()*6.2832,ca=Math.cos(an),sa=Math.sin(an);un(o,o.x+ca*o.R,o.z+sa*o.R,-ca,-sa,14+jr()*12,0);}} /* sa cour : des pics plus fins entre lui et la route */
      else un(o,o.x,o.z,o.ix,o.iz,o.r,0);}}
  /* (2026-11-13) LA DESCENTE ALLÉLUIA : les tours, les îles et les cascades des scènes (jade-alleluia.js), avant tout le hasard ; ZC3 : les tranches calmes */
  const ZC3=[],CASC3=[];if(JADE.deco3)yield* jadeDeco3Pose({G:G,pose:pose,proches:proches,pgVois:pgVois,snap:snap,jr:jr,ZC:ZC3,CASC:CASC3,CV:CVOL});
  /* ===== LE RASE-ROUTE (2026-11-13, Sacha : « trop de tout droit, joue avec l'environnement, la route doit exploiter la proximité avec les pics de manière créative ») =====
     Après les pics des modules et avant les rangs au hasard : tous les ~30 m de route, s'il n'y a aucun pic à moins de 27 m du bord (à la hauteur de la route), on en plante UN, tout près (4,5 à 8 m) —
     dans un virage au creux (70 %) ou en paroi à l'extérieur, sur une droite en quinconce ; un sur sept est une île au-dessus de la route (renversée une fois sur deux). Ni vide de plus de ~60 m, ni couloir
     lisse : la route longe toujours de la roche. Rien autour des monuments (zonesNu). `?proxi=0` rend la vallée d'avant. */
  JADE.rase=0;
  if(JADE_FUN&&JADE_PROX&&!JADE.deco3){const ds=L/(NP-1),pF=Math.max(1,Math.round(30/ds)),k6=Math.max(1,Math.round(60/ds)),dMax=JADE_SOBRE?40:27;let alt=jr()<.5?-1:1,nF=0,cpt=0;
    for(let i=Math.round(200/ds);i<NP-Math.round(500/ds);i+=pF){if(performance.now()>JF.lim)yield;
      const p=pts[i];let zn=false;for(const z of zonesNu)if(Math.hypot(p.x-z[0],p.z-z[1])<z[2]+40){zn=true;break;}if(zn)continue;
      let near=false;pgVois(p.x,p.z,function(q){if(p.y>q[3]-12&&p.y<q[4]+12&&Math.hypot(q[0]-p.x,q[1]-p.z)-q[2]-ROAD_HALF<dMax){near=true;return true;}return false;});if(near)continue;
      const a=T[Math.max(0,i-k6)],b=T[Math.min(NP-1,i+k6)],la=Math.hypot(a.x,a.z)||1,lb=Math.hypot(b.x,b.z)||1,cr=(a.x*b.z-a.z*b.x)/(la*lb),t9=T[i],lt=Math.hypot(t9.x,t9.z)||1,tx=t9.x/lt,tz=t9.z/lt;
      let s9=alt;if(Math.abs(cr)>.07)s9=jr()<.7?-Math.sign(cr):Math.sign(cr);else alt=-alt; /* creux du virage : s = −signe du produit vectoriel des deux tangentes */
      cpt++;const o={x:p.x,z:p.z,y:p.y,bas:0,dessus:0,clear:0,inv:0};
      if(cpt%7===0){o.dessus=1;o.clear=38+jr()*20;o.gap=8;o.inv=jr()<.5?1:0;o.r=18+jr()*12;o.h=0;if(un(o,p.x,p.z,0,0,o.r,0))nF++;continue;}
      o.r=11+jr()*15;o.h=110+jr()*200;o.gap=4.5+jr()*3.5;if(un(o,p.x,p.z,s9*tz,-s9*tx,o.r,0))nF++;}
    JADE.rase=nF;}
  const plaf=function(cx,cz){let top=-1e9;for(const q of LV9){if(q[3]<=20)continue;const dx=q[0]-cx,dz=q[2]-cz;if(dx*dx+dz*dz<810000&&q[1]>top)top=q[1];}return top>-1e9?top-35:1e9;}; /* le plafond des montagnes à moins de 900 m d'une route levée de plus de 20 m : le point le plus haut de cette route − 35 m */
  const LV9=JADE.lev||[],leve=function(i){if(!LV9.length)return 0;const p=pts[i];let bd=16900,dy=0;for(const q of LV9){const dx=q[0]-p.x,dv=q[1]-p.y,dz=q[2]-p.z,d=dx*dx+dv*dv+dz*dz;if(d<bd){bd=d;dy=q[3];}}return dy;};
  const MOB=JADE_SOBRE?.35:TEL_NATIF?.7:1,pasR=Math.max(1,Math.round(46/(L/(NP-1))));
  const RANGS=[[ROAD_HALF+38,90,.27,10,30,-150,260,2],[170,200,.38,12,40,-200,330,3],[380,420,.46,16,56,-260,380,4]];
  for(let i=Math.round(120/(L/(NP-1)));i<NP;i+=pasR){if(performance.now()>JF.lim)yield;const t9=T[i],hl=Math.hypot(t9.x,t9.z);if(hl<.5)continue; // (LE PRÉ-BÂTI) les rendez-vous de jadeBatit ne servent qu'à une échéance finie (JF.lim) : au passage, elle est infinie
    const px=-t9.z/hl,pz=t9.x/hl,calme9=ZC3.length&&ZC3.some(function(z){return i>=z[0]&&i<=z[1];});
    for(const sg of [-1,1])for(const R9 of RANGS){if(jr()>R9[2]*MOB*(DZ?DZ.dens:1))continue;if(calme9&&R9!==RANGS[2])continue; /* (la carte postale : rien de près) */
      const r=(R9[3]+jr()*(R9[4]-R9[3]))*(DZ?DZ.larg:1),lat=R9[0]+r+jr()*R9[1],al=(jr()-.5)*40;
      const lv9=leve(i),hB0=R9[6]+(DZ?DZ.haut:0),hB=lv9>20?Math.min(hB0,lv9-35):hB0,hA=Math.min(R9[5]+(DZ?DZ.haut:0),hB-90); /* (JADE QUI SECOUE) sous une route qu'un module a levée, les montagnes restent à la hauteur d'avant, leur sommet 35 m sous la dalle : la crête passe AU-DESSUS d'elles */
      touffe(pts[i].x+px*sg*lat+t9.x/hl*al,pts[i].z+pz*sg*lat+t9.z/hl*al,r,pts[i].y-lv9,hA,hB,1+((jr()*R9[7])|0),1,lat,.35,JADE.deco3&&R9!==RANGS[0]&&jr()<.25?1:0); /* (Alléluia) une sur quatre, loin du bord : une île */}} /* (L'ENVERS) un tiers de celles qui flottent au-dessus de la route, renversées */
  /* LES ÎLES DU CIEL (2026-11-12, JADE SANS MER) : de loin en loin, une montagne flotte AU-DESSUS de la route (son pied 75 à 135 m plus haut) — on passe dessous, on la voit venir. La règle d'or (regle, dans tente) la remonte si la route grimpe sous elle. */
  {const ds9=L/(NP-1);let sI=300+jr()*300;
    while(sI<L-700){if(performance.now()>JF.lim)yield;const i=Math.min(NP-1,Math.round(sI/ds9)),t9=T[i],hl=Math.hypot(t9.x,t9.z);sI+=(JADE_SOBRE?800:380)+jr()*300; /* (LA CHUTE) deux fois plus d'îles */if(hl<.5)continue;
      const r=JADE.deco3?10+jr()*24:18+jr()*16,Hs=G.p[JADE.deco3?jadeIleDe(r*(DZ?DZ.larg:1)):jadeTplDe(r*(DZ?DZ.larg:1))].yTop*VX,lat=(jr()-.5)*2*(ROAD_HALF+10),px=-t9.z/hl,pz=t9.x/hl;
      tente(pts[i].x+px*lat,pts[i].z+pz*lat,r*(DZ?DZ.larg:1),pts[i].y+50+Hs+jr()*70,1,Math.abs(lat),false,.5,pts[i].y,JADE.deco3?1:0); /* (Alléluia) de vraies îles, de toutes les tailles */ /* (L'ENVERS) une île sur deux renversée : sa couronne de pins pend vers la route */}}
  {const S=230,Rmax=TEL_NATIF?2100:2500,m=new Map(),pasC=Math.max(1,Math.round(S*.7/(L/(NP-1))));
   for(let i=0;i<NP;i+=pasC){if(performance.now()>JF.lim)yield;const cx0=Math.round(pts[i].x/S),cz0=Math.round(pts[i].z/S),rr=Math.ceil(Rmax/S);
     for(let dx=-rr;dx<=rr;dx++)for(let dz=-rr;dz<=rr;dz++){const gx=(cx0+dx)*S,gz=(cz0+dz)*S,d=Math.hypot(gx-pts[i].x,gz-pts[i].z);if(d>Rmax)continue;
       const k=(cx0+dx)+','+(cz0+dz),o=m.get(k);if(!o||d<o[0])m.set(k,[d,i,gx,gz]);}}
   for(const v of m.values()){if(v[0]<700||jr()>.55*MOB*(DZ?DZ.loin:1))continue;
     const fo9=JADE.deco3?(jr()<.12?2:jr()<.42?1:0):0; /* (Alléluia) au loin : un massif sur huit, une île sur trois — la taille change */
     touffe(v[2]+(jr()-.5)*S*.7,v[3]+(jr()-.5)*S*.7,fo9===2?64+jr()*24:20+jr()*36,pts[v[1]].y-leve(v[1]),-380,720, /* (sans mer) le lointain s'étage plus haut et plus bas : des îles au-dessus de l'horizon, d'autres loin dessous */fo9===2?1:1+((jr()*4)|0),.85,v[0],.5,fo9); /* (L'ENVERS) la moitié de celles d'en haut, renversées */}}
  const ARB=[];
  const tP0=performance.now();if(iPorte>0){try{yield* jadePorte(root,iPorte,jr,M9,function(x,z,r,yt){return tente(x,z,r,yt,1,60,true);},cle);}catch(e){console.warn('porte',e);JADE.porte=null;}}
  const tP1=performance.now();if(iPont>0){try{yield* jadePont(root,iPont,jr,M9,pose,ARB);}catch(e){console.warn('pont',e);JADE.pont=null;}}JADE.msPorte=Math.round(tP1-tP0);JADE.msPont=Math.round(performance.now()-tP1);
  if(performance.now()>JF.lim)yield;
  // ---- LES ROCHERS EN CUBES qui flottent autour des montagnes (des gabarits à part : JADE_NTPL et suivants) ----
  {const n0=PIL.length;for(let k=0;k<n0;k++){const q=PIL[k];if(JADE_SOBRE||q[8]>1600||jr()>(DZ?DZ.roch.p:.5))continue;const T9=G.p[q[5]];
    for(let j=0,n=1+((jr()*(DZ?DZ.roch.n:3))|0);j<n;j++){const t=JADE_NTPL+((jr()*3)|0),Tr=G.p[t],th=jr()*6.2832,rr=q[2]+12+jr()*45,x=snap(q[0]+Math.cos(th)*rr),z=snap(q[1]+Math.sin(th)*rr),rm=Tr.rmax*VX,Hs=Tr.yTop*VX;
      const yt=Math.floor((q[3]+(T9.Hb+jr()*T9.H*.65)*VX)/VX)*VX;if(yt-Hs<mer)continue;
      let ok=true;proches(x,z,rm+ROAD_HALF+14,function(i){const p=pts[i];if(Math.abs(p.y-yt+Hs/2)<Hs+30&&Math.hypot(p.x-x,p.z-z)<rm+ROAD_HALF+14)ok=false;});
      if(!ok||!jadeVolLibre(CVOL,x,z,rm,yt-Hs,yt)||pgVois(x,z,function(q2){return Math.hypot(q2[0]-x,q2[1]-z)<(q2[2]+rm)*.95&&yt>q2[3]-10&&yt-Hs<q2[4]+10;}))continue;
      pose([x,z,rm,yt-Hs,yt,t,(jr()*4)|0,jr(),1e9]);}}}
  // ---- LA FORÊT PEINTE (pins, touffes) sur les cimes et les corniches, LES LIANES sous les montagnes, les TEMPLES, les CASCADES ----
  const PAG=[],PAV=[],CHU=[],V3=new THREE.Vector3(),Mt=new THREE.Matrix4();for(const c9 of CASC3)CHU.push(c9); /* (Alléluia) les cascades des scènes d'abord */
  let qCur=null;JCH.fixe=new Set();
  const arb=(x,y,z,w,h,cell)=>{if(h<0){const rr=w*.5+ROAD_HALF+12; /* +12 : la route n'est lue que tous les ~10 m (grille) — banc : une liane au bord du couloir passait entre deux points */let hh=-h;proches(x,z,rr,function(i){const p=pts[i];if(p.y<y&&Math.hypot(p.x-x,p.z-z)<rr)hh=Math.min(hh,y-p.y-10);});if(hh<4){jr();return;}h=-hh;} /* (2026-11-12, L'ENVERS) TOUT CE QUI PEND (lianes, pins des pics renversés) s'arrête 10 m au-dessus de la route sous lui — trop court, il n'est pas posé (banc : un pin renversé dans le couloir de conduite) */ARB.push({x:x,y:y,z:z,j:[w,h,cell,jr()],pq:qCur});};
  for(const q of PIL){if(performance.now()>JF.lim)yield;const d=q[8];if(!(d<(TEL_NATIF?700:1000)))continue;const T9=G.p[q[5]],mP=jadeMatPilier(q,0);qCur=q;
    const nA=Math.min(DZ?72:60,Math.round(T9.tops.length*.9*(VX/3.5)*(VX/3.5)*(DZ?DZ.pins.k:1))); // (v7) la même forêt au m² qu'avec des cubes de 3,5 m
    for(let k=0;k<nA&&T9.tops.length;k++){const c=T9.tops[(jr()*T9.tops.length)|0];V3.set(c[0]+.15+jr()*.7,c[1]+1,c[2]+.15+jr()*.7).applyMatrix4(mP);const pin=jr()<(DZ?DZ.pins.pin:.62),h=pin?11+jr()*11:5+jr()*5;arb(V3.x,V3.y,V3.z,h*(pin?.95:1.35),q.inv?-h:h,pin?(jr()*4)|0:4+((jr()*2)|0));}
    for(let k=0;k<Math.min(12,T9.cor.length);k++){const c=T9.cor[(jr()*T9.cor.length)|0];V3.set(c[0]+.5,c[1]+1,c[2]+.5).applyMatrix4(mP);const h=7+jr()*9;arb(V3.x,V3.y,V3.z,h,q.inv?-h:h,jr()<.6?(jr()*4)|0:4+((jr()*2)|0));}
    for(let k=0;k<(q.inv?0:Math.min(DZ?Math.round(16*DZ.lian):16,T9.des.length));k++){ /* (la renversée : son dessous est en haut, pas de lianes) */const c=T9.des[(jr()*T9.des.length)|0];V3.set(c[0]+.5,c[1],c[2]+.5).applyMatrix4(mP);let h=24+jr()*50;const w=14+jr()*12,cel=6+((jr()*2)|0);
      /* (2026-11-07, Sacha : « génération aléatoire parfaite ») LA LIANE NE DESCEND PAS SUR LA ROUTE. MESURÉ (banc, dbgJadeAudit, graine 47 orage, s 3532) : une montagne
         posée AU-DESSUS de la dalle par la règle d'or a sa pointe à 70 m, mais ses lianes pendent jusqu'à 74 m — un rideau de 22 m de large qui descendait jusqu'au bord
         du couloir de conduite. La liane s'arrête désormais 10 m au-dessus de toute route sous son panneau (sa demi-largeur + la demi-route + 4 m) ; trop courte (< 8 m),
         elle n'est pas posée. Les tirages `jr` restent les mêmes (h, w, la case) : le reste de la vallée ne bouge pas. */
      {const rr=w*.5+ROAD_HALF+12; /* +12 : la route n'est lue que tous les ~10 m (grille) — banc : une liane au bord du couloir passait entre deux points */proches(V3.x,V3.z,rr,function(i){const p=pts[i];if(p.y<V3.y&&Math.hypot(p.x-V3.x,p.z-V3.z)<rr)h=Math.min(h,V3.y-p.y-10);});}
      if(h>=8)arb(V3.x,V3.y,V3.z,w,-h,cel);else jr();} /* (le jr() que arb aurait tiré) */
    if(!q.inv&&q[5]>=3&&d<700&&T9.tops.length){let bc=null,bd=1e9;for(const c of T9.tops){const e=Math.hypot(c[0]+.5-T9.M,c[2]+.5-T9.M);if(e<bd){bd=e;bc=c;}}
      V3.set(bc[0]+.5,bc[1]+1,bc[2]+.5).applyMatrix4(mP);if(PAG.length<7&&jr()<.16){PAG.push([V3.x,V3.y,V3.z,1.1+jr()*.4]);JCH.fixe.add(q);}else if(PAV.length<10&&jr()<.14){PAV.push([V3.x,V3.y,V3.z,1.3+jr()*.4]);JCH.fixe.add(q);}}
    if(!q.inv&&CHU.length<(JADE_SOBRE?4:DZ?DZ.casc.n:16)&&T9.H*VX>260&&jr()<(DZ?DZ.casc.p:.11)*1.6){ /* (sans mer) plus de cascades : elles tombent dans le vide */ // UNE CASCADE : d'une cellule au bord (l'air à côté), vers le vide
      const L9=T9.cor.concat(T9.tops);for(let tries=0;tries<12;tries++){const c=L9[(jr()*L9.length)|0];if(!c||c[1]<T9.H*.7)continue;
        const o=[[1,0],[-1,0],[0,1],[0,-1]].find(function(o9){return !voxAt(T9.G,c[0]+o9[0],c[1],c[2]+o9[1])&&!voxAt(T9.G,c[0]+o9[0],c[1]-1,c[2]+o9[1]);});if(!o)continue;
        V3.set(c[0]+.5+o[0]*.55,c[1]+.6,c[2]+.5+o[1]*.55).applyMatrix4(mP);const w=jadeQuart(q[6],o[0],o[1]);
        CHU.push([V3.x,V3.y,V3.z,w[0],w[1],8+jr()*9,Math.min(ALLEGE?340:700,Math.max(20,V3.y-JADE.eauY)*(.55+jr()*.35)),jr()]);JCH.fixe.add(q);break;}}}
  qCur=null;
  /* ---- (2026-10-21, embellie) LES CRISTAUX DE JADE : des grappes sur les cimes et les corniches, du côté de la route (voir jadeCristalPeint). Posés par un générateur
     LOCAL (`jc`) : ni `jr` (les montagnes, les arbres, les cascades) ni le hasard de la piste ne sont touchés. De simples instances de la famille des arbres. ---- */
  const CRI=[];
  {const jc=mulberry32((seed^0xC215A1)>>>0),kc=PAL.b('jadeCristaux',1),V9=new THREE.Vector3();
   for(const q of PIL){if(performance.now()>JF.lim)yield;if(q.inv||q[5]>=JADE_NTPL||!(q[8]<(TEL_NATIF?650:900)))continue;
     const r0=jc(),nn=1+((jc()*2.4)|0);if(r0>.62*kc)continue;
     const T9=G.p[q[5]],mP=jadeMatPilier(q,0);
     for(let k=0;k<nn;k++){let best=null,bd=1e9;
       /* (2026-11-05, Sacha : « les cristaux sont mal générés, ils sortent de nulle part ») une grappe est un dessin de ~.32·h de rayon : posée sur une
          case de corniche (le bord d'un palier) elle débordait dans le vide ou s'enfonçait dans le flanc. Désormais le sol plein doit PORTER toute
          son emprise (les cases du disque, sommet libre au-dessus) — sinon la case est refusée ; les plateaux des cimes passent, les arêtes non. */
       const h=13+jc()*15,rc=Math.max(1,Math.min(6,Math.round(.32*h/VX)));
       for(let t=0;t<14;t++){const lst=jc()<.35&&T9.cor.length?T9.cor:T9.tops;if(!lst.length)continue;const c=lst[(jc()*lst.length)|0];
         let nb=0,ok=0;for(let dx=-rc;dx<=rc;dx++)for(let dz=-rc;dz<=rc;dz++){if(dx*dx+dz*dz>rc*rc)continue;nb++;if(voxAt(T9.G,c[0]+dx,c[1],c[2]+dz)&&!voxAt(T9.G,c[0]+dx,c[1]+1,c[2]+dz))ok++;}
         if(ok<nb*.92)continue;
         V9.set(c[0]+.5,c[1]+1,c[2]+.5).applyMatrix4(mP);let d=1e9;
         proches(V9.x,V9.z,640,function(i){const e=pts[i],dd=Math.hypot(e.x-V9.x,e.z-V9.z);if(dd<d)d=dd;});
         if(d<bd){bd=d;best=[V9.x,V9.y,V9.z];}}
       if(!best||bd>=640||bd<ROAD_HALF+25)continue;
       CRI.push({x:best[0],y:best[1],z:best[2],j:[h*(.9+jc()*.3),h,jc()<.6?8:9,jc()],pq:q});}}}
  if(performance.now()>JF.lim)yield;
  // ---- LA POSE : par QUARTIERS de 360 m (le tri, c'est jadeTri) ----
  const QC=160,quart=new Map(),qDe=(x,z,tag)=>{const k=tag!=null?'t:'+tag:(Math.floor(x/QC)+','+Math.floor(z/QC));let o=quart.get(k);if(!o)quart.set(k,o={k:quart.size,x0:1e9,x1:-1e9,y0:1e9,y1:-1e9,z0:1e9,z1:-1e9});return o;}; // tag : force un même quartier (10e champ de q, voir jadePont — « l'arche grise sur une moitié »)
  const ext=(o,x,y0,y1,z,r)=>{o.x0=Math.min(o.x0,x-r);o.x1=Math.max(o.x1,x+r);o.y0=Math.min(o.y0,y0);o.y1=Math.max(o.y1,y1);o.z0=Math.min(o.z0,z-r);o.z1=Math.max(o.z1,z+r);};
  const vue=jadeVueGeo;
  const famille=(geo,mat,items,b0,b1)=>{if(!items.length||(geo.index&&!geo.index.count))return;
    items.sort(function(a,b){return a.q.k-b.q.k;});
    const n=items.length,F={n:n,M:new Float32Array(n*16),J:new Float32Array(n*4),r:new Map(),b0:b0,b1:b1,tri:(geo.index?geo.index.count:geo.attributes.position.count)/3};
    let a=0;for(let i=0;i<n;i++){const it=items[i];F.M.set(it.m,i*16);F.J.set(it.j,i*4);if(i===n-1||items[i+1].q!==it.q){F.r.set(it.q.k,[a,i+1]);a=i+1;}}
    {const nr=F.r.size;F.rK=new Int32Array(nr);F.rA=new Int32Array(nr);F.rB=new Int32Array(nr);let i9=0;for(const [k,r] of F.r){F.rK[i9]=k;F.rA[i9]=r[0];F.rB[i9]=r[1];i9++;}} // (2026-10-14) la même liste en tableaux : jadeTri la parcourt sans rien allouer (voir jadeTri)
    if(items.some(function(it){return it.pq;}))F.tq=items.map(function(it){return it.pq||null;}); // (v14) les arbres : leur montagne (l'effondrement les emporte)
    if(items[0].pi!==undefined){F.pidx=new Map();F.qk=new Int32Array(n);F.dst=new Map();for(let i=0;i<n;i++){F.pidx.set(items[i].pi,i);F.qk[i]=items[i].q.k;}} // (v8) pour céder une montagne aux cubes fins
    const g=vue(geo);F.im=new THREE.InstancedMesh(g,mat,n);F.im.frustumCulled=false;F.im.matrixAutoUpdate=false;
    F.aJ=new THREE.InstancedBufferAttribute(new Float32Array(n*4),4);F.aJ.setUsage(THREE.DynamicDrawUsage);g.setAttribute('aJ',F.aJ);
    F.im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);F.im.count=0;root.add(F.im);JADE.fam.push(F);
    if(mat===M9.vr){F.im.renderOrder=3;F.im2=new THREE.InstancedMesh(g,M9.vrX,n);F.im2.instanceMatrix=F.im.instanceMatrix;F.im2.frustumCulled=false;F.im2.matrixAutoUpdate=false;F.im2.renderOrder=2;F.im2.count=0;root.add(F.im2); // la passe d'ABSORPTION jumelle (mêmes tampons)
      F.im3=new THREE.InstancedMesh(g,M9.vrP,n);F.im3.instanceMatrix=F.im.instanceMatrix;F.im3.frustumCulled=false;F.im3.matrixAutoUpdate=false;F.im3.renderOrder=2.5;F.im3.count=0;root.add(F.im3);} // …et celle de la PROFONDEUR
    return F;};
  const parT=G.p.map(function(){return [[],[],[],[]];});
  {PIL.forEach(function(q,pi){const o=qDe(q[0],q[1],q[9]);ext(o,q[0],q[3]-8,q[4]+25,q[1],q[2]);for(let k=0;k<4;k++)parT[q[5]][k].push({q:o,m:jadeMatPilier(q,k).toArray(),j:[q[7],q[8]<2000||q[8]===1e9?1:.85,0,0],pi:pi});});
    for(let t=0;t<G.p.length;t++){if(performance.now()>JF.lim)yield;const Gt=G.p[t].geo;famille(Gt[0],M9.vr,parT[t][0],0,0);if(performance.now()>JF.lim)yield;famille(Gt[1],M9.vr,parT[t][1],1,1);if(performance.now()>JF.lim)yield;famille(Gt[2],M9.vrO,parT[t][2],2,4);if(performance.now()>JF.lim)yield;famille(Gt[3],M9.vrO,parT[t][3],5,5);}} // (v17) au-delà de 750 m : UNE passe opaque (le verre en trois passes coûtait 3× ses triangles)
  // (v8) LES CUBES MINUSCULES : une famille par gabarit, remplie à chaque image des montagnes proches (finProches) — elles quittent leur famille de 1,75 m
  if(performance.now()>JF.lim)yield;
  FIN.cap=parT.map(function(a){return Math.min(a[0].length,48);});FIN.vit=false;
  if(FIN.on)for(let t=0;t<G.p.length;t++)if(G.p[t].fin)finFamille(t);
  FIN.stamp=new Int32Array(PIL.length);FIN.was=new Uint8Array(PIL.length);FIN.gen=0;
  {const enArb=function(a){const o=qDe(a.x,a.z);ext(o,a.x,a.y-80,a.y+25,a.z,20);return {q:o,m:Mt.makeTranslation(a.x,a.y,a.z).toArray(),j:a.j,pq:a.pq};};
   famille(G.arbreQ,M9.arb,ARB.map(enArb),0,2);
   famille(G.arbreQ,M9.arb,CRI.map(enArb),0,3);} /* (2026-11-05) les cristaux : leur propre famille, dessinée jusqu'à la bande 3 (1 300 m) et fondue en trame dans le shader (900 → 1 250 m) — ils apparaissaient d'un coup à 900 m, 25 m de haut, « de nulle part » */
  // (v16, « évite les clichés en mode Chine ») plus de pagodes ni de pavillons sur les cimes
  JADE.quart=[];for(const o of quart.values())JADE.quart[o.k]={c:new THREE.Vector3((o.x0+o.x1)/2,(o.y0+o.y1)/2,(o.z0+o.z1)/2),r:Math.hypot(o.x1-o.x0,o.y1-o.y0,o.z1-o.z0)/2+10,b:[o.x0,o.x1,o.y0,o.y1,o.z0,o.z1]};
  if(CHU.length){const m=new THREE.Mesh(jadeChutes(CHU),JADE_CHUTE_M);m.userData.jeter=true;m.frustumCulled=false;m.renderOrder=5;root.add(m);}
  {const RY=[],pasY=Math.max(1,Math.round(170/(L/(NP-1))));for(let i=0;i<NP;i+=pasY){if(JADE_SOBRE||jr()>.55*(DZ?DZ.ray:1))continue;const t9=T[i],hl=Math.hypot(t9.x,t9.z)||1,px=-t9.z/hl,pz=t9.x/hl,sg=jr()<.5?-1:1,lat=60+Math.pow(jr(),1.3)*650;
     RY.push([pts[i].x+px*sg*lat,pts[i].y+40+jr()*160,pts[i].z+pz*sg*lat,22+jr()*55,650+jr()*600,jr(),.03+jr()*.05]);}
   if(RY.length){const m=new THREE.Mesh(jadeRayons(RY),JADE_RAYON_M);m.userData.jeter=true;m.frustumCulled=false;m.renderOrder=7;root.add(m);JADE.n9=RY.length;}}
  if(performance.now()>JF.lim)yield;
  // ---- LES NUAGES EN VOLUTES : loin autour de la route (au-dessus des montagnes, et quelques bancs bas sur le fleuve), quelques-uns au-dessus d'elle ----
  {const NU=[],pasN=Math.max(1,Math.round(360/(L/(NP-1)))); // (v17, Léo : « plus de nuages ») 480 → 360 m, quatre par pas au lieu de trois, une couche ENTRE les montagnes et des bancs bas sur l'eau
   for(let i=0;i<NP;i+=pasN){const t9=T[i],hl=Math.hypot(t9.x,t9.z)||1,px=-t9.z/hl,pz=t9.x/hl;
     if(!JADE_SOBRE&&jr()<.55*(DZ?DZ.nua:1)){const sg=jr()<.5?-1:1,w=200+jr()*260,lat=ROAD_HALF+420+w*.5+jr()*900;NU.push([pts[i].x+px*sg*lat,pts[i].y-60+jr()*300,pts[i].z+pz*sg*lat,w,w*.5,(jr()*16)|0,jr(),pts[i].x,pts[i].z]);} // entre les montagnes
     for(let k=0;k<(JADE_SOBRE?0:4);k++){const r9=jr();if(r9>.8*(DZ?Math.min(1.2,DZ.nua):1))continue;const sg=jr()<.5?-1:1,haut=true,lat=haut?1000+Math.pow(jr(),.8)*3000:1500+jr()*2600,al=(jr()-.5)*700,w=haut?800+jr()*1100:1500+jr()*1300;
       const y=haut?pts[i].y+260+jr()*820:JADE.eauY+45+jr()*120;NU.push([pts[i].x+px*sg*lat+t9.x/hl*al,y,pts[i].z+pz*sg*lat+t9.z/hl*al,w,w*.5,(jr()*16)|0,jr(),pts[i].x,pts[i].z]);}
     if(jr()<.35){const sg=jr()<.5?-1:1,lat=250+jr()*500,w=600+jr()*600;NU.push([pts[i].x+px*sg*lat,pts[i].y+780+jr()*600,pts[i].z+pz*sg*lat,w,w*.5,(jr()*16)|0,jr(),pts[i].x,pts[i].z]);}} // au-dessus de la route
   }
  // ---- (v17) LES MONTAGNES QUE L'EAU FRAPPE : la section de chacune au ras de l'eau (le centre et le rayon des cubes de cette couche) ----
  JADE.eauPil=null;JADE.eauT=0; /* (plus de mer) plus de montagne trempée */
  if(performance.now()>JF.lim)yield;
  // ---- LA GRILLE DES CHOCS (cases de 80 m) : chaque montagne et chaque rocher y est inscrit dans son cercle ; le test final lit SES cubes ----
  {const CG=80,g9=new Map();
   PIL.forEach(function(q,k){const re=q[2]+2;for(let gx=Math.floor((q[0]-re)/CG);gx<=Math.floor((q[0]+re)/CG);gx++)for(let gz=Math.floor((q[1]-re)/CG);gz<=Math.floor((q[1]+re)/CG);gz++){const kk=gx*100003+gz;let a=g9.get(kk);if(!a)g9.set(kk,a=[]);a.push(k);}});
   JADE.col={g:g9,CG:CG,P:PIL};} /* (2026-11-03, passe « maps cohérentes ») la clé d'une case est un NOMBRE (gx × 100003 + gz, comme la grille de la route plus haut) : finProches (chaque image) et jadeHeurt (chaque image de vol) fabriquaient une chaîne par case lue */
  // ---- LA BRUME QUI FLOTTE ----
  {const n0=Math.round((JADE_SOBRE?60:TEL_NATIF?150:240)*(DZ?DZ.brume.n:1)),itb=[],ib=[],Mx=new THREE.Matrix4();const pasB=Math.max(1,Math.floor(NP/n0));
   for(let i=0;i<NP;i+=pasB){const t9=T[i],hl=Math.hypot(t9.x,t9.z)||1,px=-t9.z/hl,pz=t9.x/hl;
     for(let k=0;k<2;k++){const sg=jr()<.5?-1:1,lat=ROAD_HALF+60+Math.pow(jr(),1.4)*700,w=140+jr()*320,low=jr()<(DZ?DZ.brume.bas:.45);
       const y=low?JADE.eauY+20+jr()*100:pts[i].y-260+jr()*290;
       itb.push(pts[i].x+px*sg*lat+(jr()-.5)*120,y,pts[i].z+pz*sg*lat+(jr()-.5)*120);ib.push(w*(low?1.8:1),w*(low?.42:.3),jr(),low?.75:.38+jr()*.3);}}
   const n=itb.length/3,geo=new THREE.PlaneGeometry(1,1),im=new THREE.InstancedMesh(geo,JADE_BRUME_M,n);
   for(let k=0;k<n;k++){Mx.makeTranslation(itb[k*3],itb[k*3+1],itb[k*3+2]);im.setMatrixAt(k,Mx);}
   geo.setAttribute('aB',new THREE.InstancedBufferAttribute(new Float32Array(ib),4));im.userData.jeter=true;
   im.frustumCulled=false;im.renderOrder=4;root.add(im);JADE.brume=im;}
  JADE.depart=120; // (2026-10-12, Léo : « enlève les trucs en bois asiatiques ») plus d'arches de troncs au départ ni à l'arrivée
  if(performance.now()>JF.lim)yield;try{yield* jadeChutePrep(PIL,jr,root);}catch(e){console.warn('chute',e);}
  JADE.n={montagnes:PIL.filter(function(q){return q[5]<JADE_NTPL;}).length,rochers:PIL.filter(function(q){return q[5]>=JADE_NTPL;}).length,arbres:ARB.length,cristaux:CRI.length,temples:PAG.length+PAV.length,cascades:CHU.length,
    brume:JADE.brume?JADE.brume.count:0,quartiers:JADE.quart.length,porte:!!JADE.porte,pont:!!JADE.pont,ms:Math.round(performance.now()-t00),gabaritsMs:G.ms,
    L:Math.round(L),merY:Math.round(JADE.merY),eauY:Math.round(JADE.eauY),trempees:JADE.eauPil?JADE.eauPil.length:0,triGabarits:G.p.map(function(T9){return (T9.geo||T9.peau||[]).map(function(g){return g.index.count/3;});}),vitrail:false};
  JADE.audit={arb:ARB,cri:CRI,chu:CHU}; /* (2026-11-07, banc) ce que dbgJadeAudit relit : les arbres, lianes, cristaux et cascades posés (de simples références) */
  JADE.cle=cle; // bâtie jusqu'au bout : elle pourra être gardée
}
function jadeRoute(){ // la route du jeu sur la jade : rails, lueur, liseré, flancs et ligne comme partout ailleurs (leurs valeurs de buildTrack)
  for(const m of NEON_RAILS){if(!m.userData.c0)m.userData.c0=m.color.getHex();m.visible=true;}for(const m of NEON_GLOW){if(m.userData.o0==null)m.userData.o0=m.opacity;m.visible=true;}
  const ac=NEON_RAILS[0]&&NEON_RAILS[0].userData.c0||0x4fe0a8,gl=NEON_GLOW[0]&&NEON_GLOW[0].userData.o0!=null?NEON_GLOW[0].userData.o0:.6;
  if(NEON_RAILS[0]){NEON_RAILS[0].color.setHex(ac);if(NEON_RAILS[0].userData.base)NEON_RAILS[0].userData.base.setHex(ac);NEON_RAILS[0].userData.hsl=null;} // (le caméléon garde la teinte mesurée : on la lui fait remesurer)
  if(NEON_GLOW[0]){NEON_GLOW[0].opacity=gl;NEON_GLOW[0].userData.base=gl;}
  ROAD_U.uAcc.value.setHex(0xf2b93b);if(JADE.flank)JADE.flank.color.setHex(0x3a3833); // le liseré et les catadioptres des tranches
  if(JADE.ligne)JADE.ligne.opacity=LIGNE_OPJ;}
/* (v14, Léo : « à la fin du niveau, des montagnes qui commencent à chuter, autour ») L'EFFONDREMENT — après le repère « chute » (les ~2 derniers
   km), les montagnes à moins de 900 m de la route tombent, l'une après l'autre, ~700 m avant que la caisse arrive à leur hauteur : elles
   TREMBLENT (0,9 s), puis basculent autour de leur pointe et tombent (8-15 m/s²) jusqu'à la mer, où elles soulèvent une gerbe de CUBES
   d'écume, et sombrent. Leurs pins et leurs lianes tombent avec elles ; celles qui portent une cascade ou un temple restent debout (ce sont
   des maillages fusionnés). Elles quittent la grille des chocs dès qu'elles bougent, mais gardent leur hitbox mobile (jadeHeurt, via c.inv). Les matrices des familles (F.M, via F.pidx / F.tq) et
   celles des cubes fins (FIN.mats) sont réécrites à chaque image ; au redémarrage, tout revient. */
const JCH={L:[],fixe:new Set(),splash:null,sp:[],t:0};
function* jadeChutePrep(PIL,jr,root){ // (LE PRÉ-BÂTI) un générateur : rendez-vous à l'échéance JF.lim
  JCH.L=[];JCH.sp.length=0;if(JADE.col)JADE.col.mort=new Set();
  /* (v16, Léo : « évite que les montagnes s'effondrent sur la route ; petit à petit : au début ça tient, après ça tombe un peu ») — sur TOUT
     le niveau : rien avant 18 %, puis quelques-unes, de plus en plus jusqu'à la fin (probabilité 6 % → 90 %) ; chacune BASCULE VERS
     L'EXTÉRIEUR (l'axe est ⟂ à la direction route → montagne : son sommet s'éloigne) et dérive en s'éloignant ; jamais celles qui
     surplombent la route ou la frôlent (à moins de ROAD_HALF + 30 m, au-dessus de la dalle). */
  for(let pi=0;pi<PIL.length;pi++){const q=PIL[pi];if((pi&31)===31&&performance.now()>JF.lim)yield;if(JCH.fixe.has(q)||q.inv)continue;let bi=-1,bd2=1e18;
    for(let i=0;i<NP;i+=3){const p=pts[i],d=(p.x-q[0])*(p.x-q[0])+(p.z-q[1])*(p.z-q[1]);if(d<bd2){bd2=d;bi=i;}}
    if(bi<0)continue;const dH=Math.sqrt(bd2),sN=bi/(NP-1)*L,u=sN/L;if(dH-q[2]>900||u<.18)continue;
    if(dH-q[2]<ROAD_HALF+30&&q[3]>pts[bi].y-12)continue;                                             // elle surplombe la route : elle tient
    if(jr()>.06+.84*Math.pow(THREE.MathUtils.smoothstep(u,.25,.93),1.3))continue;                    // de plus en plus vers la fin
    const dx=(q[0]-pts[bi].x)/(dH||1),dz=(q[1]-pts[bi].z)/(dH||1);
    JCH.L.push({pi:pi,q:q,sN:sN,dl:jr()*350,ax:new THREE.Vector3(dz,0,-dx),dx:dx,dz:dz,g:8+jr()*7,w:.12+jr()*.25,t0:0,fin:false,spl:false,orig:null});}
  // L'ÉCUME EN CUBES : une réserve de 700 cubes blancs (une instance), lancés à l'impact
  const g=new THREE.BoxGeometry(1,1,1),im=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:0xf4f8fa,emissive:0x2a3238}),700);im.count=0;im.frustumCulled=false;im.userData.jeter=true;
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(im);JCH.splash=im;}
/* (2026-10-14, passe perf mobile) ENVOI BORNÉ d'une InstancedMesh recopiée en tête chaque image : seules les n premières instances (réécrites
   cette image) partent à la puce — pas les 700 / 1 800 places du tampon — et RIEN quand n===0 (le mesh est caché). coul : la teinte aussi (3 par instance). */
function imEnvoi(im,n,coul){if(!(n>0))return;const a=im.instanceMatrix;a.updateRange.offset=0;a.updateRange.count=n*16;a.needsUpdate=true;
  if(coul&&im.instanceColor){const c=im.instanceColor;c.updateRange.offset=0;c.updateRange.count=n*3;c.needsUpdate=true;}}
const JCH_M=new THREE.Matrix4(),JCH_R=new THREE.Matrix4(),JCH_T=new THREE.Matrix4(),JCH_A=new THREE.Matrix4(),JCH_V=new THREE.Vector3(),JCH_Z=new Float32Array(16);
/* ===== L'EFFONDREMENT S'ARRÊTE AVEC LA PAUSE (24/10, relecture : « une montagne qui tombait sautait d'un coup au retour de pause ») ===== son
   horloge était JADE_U.uTime, qui avance aussi en pause (le temps réel) alors que jadeChuteTick n'y tourne pas : au retour, chaque montagne en
   chute avait pris toute la durée de la pause d’un coup (5 s de pause : 140 à 270 m de chute en une image, l’écume partait, sa hitbox avec). JCH.t ne
   compte que le temps joué (preuve-chute-pause.cjs). */
/* (2026-10-31, Léo : « l'image ne doit plus couper quand je joue sur téléphone ») LA MONTAGNE QUI TOMBE, CUBE PAR CUBE, SANS OBJETS. Chaque image de chute
   recalculait chaque cube par trois appels (fromArray, premultiply, toArray) : MESURÉ (banc iPhone ×4), jusqu'à 88 ms dans une image. Le même produit
   M × cube, écrit à la main dans l'ordre exact de three (Matrix4.multiplyMatrices) : la même matrice au bit près, sans copie intermédiaire. */
function jchMul(ae,be,A,o){
  for(let j=0;j<4;j++){const b0=be[4*j],b1=be[4*j+1],b2=be[4*j+2],b3=be[4*j+3];
    A[o+4*j]=ae[0]*b0+ae[4]*b1+ae[8]*b2+ae[12]*b3;A[o+4*j+1]=ae[1]*b0+ae[5]*b1+ae[9]*b2+ae[13]*b3;
    A[o+4*j+2]=ae[2]*b0+ae[6]*b1+ae[10]*b2+ae[14]*b3;A[o+4*j+3]=ae[3]*b0+ae[7]*b1+ae[11]*b2+ae[15]*b3;}}
function jadeChuteTick(dt){
  if(!JCH.L.length||!JADE.root||!started||gameOver)return;let chg=false;JCH.t+=dt;const tn=JCH.t;
  for(const c of JCH.L){
    if(!c.t0){if(s>c.sN-700-c.dl&&mode!=='boom'){c.t0=tn;if(JADE.col&&JADE.col.mort)JADE.col.mort.add(c.pi);if(!c.inv)c.inv=new THREE.Matrix4();c.inv.identity();jadeChuteOrig(c);
      if(carGroup.position.distanceTo(JCH_V.set(c.q[0],carGroup.position.y,c.q[1]))<500)shake=Math.max(shake,.12);}else continue;}
    if(c.fin)continue;chg=true;const q=c.q,t=tn-c.t0,tf=Math.max(0,t-.9),dy=.5*c.g*tf*tf,th=Math.min(1.25,.5*c.w*tf*tf),jx=t<.9?Math.sin(t*57)*.35*(t/.9):0;
    const dr=.6*c.g*tf*tf*.25;JCH_T.makeTranslation(q[0]+jx+c.dx*dr,q[3]-dy,q[1]+c.dz*dr); // (elle s'éloigne de la route en tombant)
    JCH_R.makeRotationAxis(c.ax,th);JCH_M.multiplyMatrices(JCH_T,JCH_R);JCH_A.makeTranslation(-q[0],-q[3],-q[1]);JCH_M.multiply(JCH_A); // D = T(pivot)·T(0,−dy,0)·R·T(−pivot)
    c.inv.copy(JCH_M).invert(); /* (2026-10-21, Léo : « on traverse les montagnes qui tombent ») la hitbox suit la montagne : le point testé est ramené dans son repère d'origine */
    const out=dy>(q[4]-(q[3]-300))+60;if(out)c.fin=true;
    {const me=JCH_M.elements;for(const o of c.orig){const A=o.F.M;if(out)A.set(JCH_Z,o.si*16);else jchMul(me,o.m,A,o.si*16);}}
    if(c.fo){if(out)FIN.mats.set(c.pi,JCH_Z);else{JCH_R.fromArray(c.fo);JCH_R.premultiply(JCH_M);if(!c.fm)c.fm=new Float32Array(16);c.fm.set(JCH_R.elements);FIN.mats.set(c.pi,c.fm);}}} /* (2026-11-03) la matrice des cubes fins d'une montagne qui tombe : SON tableau, réécrit (avant : un neuf à chaque image) */
  if(chg){for(const c of JCH.L)if(c.t0&&c.orig&&(!c.fin||!c.vu)){c.vu=c.fin;for(const o of c.orig)o.F.sale=true;if(c.fo)FIN.sale=true;}JADE.sale=true;}
  // l écume
  const S9=JCH.sp,im=JCH.splash;if(im&&S9.length){let n=0;const M9=JCH_M;
    for(let i=S9.length-1;i>=0;i--){const p=S9[i];p.t+=dt;if(p.t>p.l){S9.splice(i,1);continue;}p.vy-=22*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
      if(p.y<JADE.eauY-4){S9.splice(i,1);continue;}const k=p.sz*(1-Math.pow(p.t/p.l,3));M9.makeScale(k,k,k).setPosition(p.x,p.y,p.z);if(n<700)im.setMatrixAt(n++,M9);}
    im.count=n;im.visible=n>0;imEnvoi(im,n);}else if(im&&(im.count||im.visible)){im.count=0;im.visible=false;}}
function jadeChuteOrig(c){c.orig=[];
  for(const F of JADE.fam){if(F.pidx){const si=F.pidx.get(c.pi);if(si!==undefined)c.orig.push({F:F,si:si,m:F.M.slice(si*16,si*16+16)});}
    if(F.tq)for(let si=0;si<F.tq.length;si++)if(F.tq[si]===c.q)c.orig.push({F:F,si:si,m:F.M.slice(si*16,si*16+16)});}
  if(FIN.on&&JADE.geos&&JADE.geos.p[c.q[5]]&&FIN.cap)c.fo=Float32Array.from(finMat(c.pi));}
/* ===== LA MER RETIRÉE (2026-11-12, Sacha : « plus de mer dans les pics de jade : juste des pics flottants comme Avatar » — puis « j'en veux plus ») =====
   La mer de Jade (v13-v17 : plonger, ricocher, surfer, jaillir, l'eau qui frappe les montagnes, l'écume, la mer qui te ramène), ses effets (jade-eau.js), le son sous l'eau et les
   dauphins sont retirés du code. JEAU reste, NEUTRE : le vol, la caméra, le son, les missions et les portails le lisent — la caisse n'est jamais dans l'eau. */
const JEAU={dans:false,wB:0,k:0,f:0,t:0,prof:0,n:0,rico:0,vRef:0,cd:0,syF:NaN,y0:0,sorti:9,cap:new THREE.Vector3(0,0,1)};
function jadeVide(y){return y<trackMinY-120;} // le plongeon fatal : 120 m sous le point le plus BAS de la piste (au-dessus de l'abîme, comme ailleurs)
