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
  D.eau=ch([165,185,210]);li.push('eau '+(D.eau<185?'basse':D.eau>185?'haute':'comme avant'));
  D.li=li;return D;}
function* jadeBatit(seed,cle){
  const t00=performance.now(),M9=jadeMats(),G=jadeGabarits(),jr=mulberry32((seed^0x1ADE5EED)>>>0),Q=JADE.Q||{};
  const DZ=JADE_DECOR?jadeDecoTire(seed):null;JADE.dz=DZ;JADE.deco=DZ?DZ.li:null; /* (LE DÉCOR AU HASARD) le tirage de cette vallée */
  const root=new THREE.Group();root.matrixAutoUpdate=false;JADE.root=root;
  let yMin=1e9,yMax=-1e9;for(let i=0;i<NP;i+=4){if(pts[i].y<yMin)yMin=pts[i].y;if(pts[i].y>yMax)yMax=pts[i].y;}
  JADE.merY=yMin-230;JADE.eauY=JADE.merY+(DZ?DZ.eau:185); // (v17, Léo : « l'eau plus haute, elle vient frapper les montagnes ») les montagnes sont posées comme avant (pied ≥ merY + 90) ; l'eau monte à merY + 140 : celles du bas trempent
   // LA MER DE NUAGES, loin sous les montagnes : elles flottent — (v14, Léo : « remonte le niveau de l'eau ») 470 → 230 m sous le point le plus bas de la route
  const HB=120,grille=new Map(),pas=Math.max(1,Math.round(10/(L/(NP-1))));
  for(let i=0;i<NP;i+=pas){const p=pts[i],k=Math.floor(p.x/HB)*100003+Math.floor(p.z/HB);let a=grille.get(k);if(!a)grille.set(k,a=[]);a.push(i);}
  const proches=(x,z,R,cb)=>{const r=Math.ceil(R/HB),bx=Math.floor(x/HB),bz=Math.floor(z/HB);
    for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const a=grille.get((bx+dx)*100003+(bz+dz));if(a)for(let j=0;j<a.length;j++)cb(a[j]);}};
  const sDe=v=>{let bi=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(v);if(d<bd){bd=d;bi=i;}}return bi;};
  const zonesNu=[];let iPorte=-1,iPont=-1;
  if(Q.porte0&&Q.porte1)iPorte=Math.round((sDe(Q.porte0.p)+sDe(Q.porte1.p))/2);
  if(Q.pont0&&Q.pont1)iPont=Math.round((sDe(Q.pont0.p)+sDe(Q.pont1.p))/2);
  // ---- LES MONTAGNES : [x, z, rayon (m), y du pied (la pointe), y du sommet, gabarit, quart de tour, graine, distance à la route] ----
  const PIL=[],PG=new Map(),PGC=120,mer=JADE.merY+90,snap=v=>Math.round(v/VX)*VX;
  const pgVois=(x,z,cb)=>{const bx=Math.floor(x/PGC),bz=Math.floor(z/PGC);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const a=PG.get((bx+dx)+','+(bz+dz));if(a)for(const q of a)if(cb(q))return true;}return false;};
  const pose=q9=>{PIL.push(q9);const kk=Math.floor(q9[0]/PGC)+','+Math.floor(q9[1]/PGC);let a9=PG.get(kk);if(!a9)PG.set(kk,a9=[]);a9.push(q9);};
  const regle=(cx,cz,rm,yt,Hs)=>{ // LA RÈGLE D'OR à deux issues : SOUS la dalle (sommet −45 m) ou AU-DESSUS (pointe +70 m) — null si ni l'une ni l'autre
    let lo=1e9,hi=-1e9;const clr=rm+ROAD_HALF+18;
    proches(cx,cz,clr,function(i){const p=pts[i];if(Math.hypot(p.x-cx,p.z-cz)>clr)return;lo=Math.min(lo,p.y);hi=Math.max(hi,p.y);});
    if(hi>-1e9&&yt>lo-45&&yt-Hs<hi+70){const tU=Math.floor((lo-45)/VX)*VX,tA=Math.ceil((hi+70+Hs)/VX)*VX,okU=tU-Hs>=mer,okA=tA<hi+760;
      if(okU&&(!okA||yt-tU<=tA-yt))return tU;if(okA)return tA;return null;}
    return yt;};
  const tente=(cx,cz,r,yt,vert,dR,libre)=>{
    const t=jadeTplDe(r),T9=G.p[t],rm=T9.rmax*VX,Hs=T9.yTop*VX;cx=snap(cx);cz=snap(cz);
    if(!libre)for(const z of zonesNu)if(Math.hypot(cx-z[0],cz-z[1])<z[2]+rm)return false;
    yt=Math.floor(yt/VX)*VX;if(yt-Hs<mer)yt=Math.ceil((mer+Hs)/VX)*VX; // elle FLOTTE : sa pointe reste au-dessus de la mer
    yt=regle(cx,cz,rm,yt,Hs);if(yt==null)return false;
    if(pgVois(cx,cz,function(q){return Math.hypot(q[0]-cx,q[1]-cz)<(q[2]+rm)*.9;}))return false;
    pose([cx,cz,rm,yt-Hs,yt,t,(jr()*4)|0,jr(),dR]);return true;};
  const touffe=(cx,cz,r0,yN,hMin,hMax,n,vert,dR)=>{let ok=0;
    for(let k=0;k<n;k++){const r=r0*(.55+jr()*.6),an=jr()*6.283,dd=k===0?0:(r0+r)*(.9+jr()*.5);
      if(tente(cx+Math.cos(an)*dd,cz+Math.sin(an)*dd,r,yN+hMin+(hMax-hMin)*Math.pow(jr(),.8),vert,dR+dd))ok++;}
    return ok;};
  if(iPorte>0){const p=pts[iPorte],b=B[iPorte];zonesNu.push([p.x,p.z,140]);for(let k=-6;k<=6;k++)zonesNu.push([p.x+b.x*k*85,p.z+b.z*k*85,95]);}
  if(iPont>0){const p=pts[iPont],t=T[iPont];for(let k=-3;k<=3;k++)zonesNu.push([p.x+t.x*k*70,p.z+t.z*k*70,ROAD_HALF+(k===0?30:70)]);}
  const MOB=JADE_SOBRE?.35:TEL_NATIF?.7:1,pasR=Math.max(1,Math.round(46/(L/(NP-1))));
  const RANGS=[[ROAD_HALF+38,90,.27,10,30,-150,260,2],[170,200,.38,12,40,-200,330,3],[380,420,.46,16,56,-260,380,4]];
  for(let i=Math.round(120/(L/(NP-1)));i<NP;i+=pasR){if(performance.now()>JF.lim)yield;const t9=T[i],hl=Math.hypot(t9.x,t9.z);if(hl<.5)continue; // (LE PRÉ-BÂTI) les rendez-vous de jadeBatit ne servent qu'à une échéance finie (JF.lim) : au passage, elle est infinie
    const px=-t9.z/hl,pz=t9.x/hl;
    for(const sg of [-1,1])for(const R9 of RANGS){if(jr()>R9[2]*MOB*(DZ?DZ.dens:1))continue;
      const r=(R9[3]+jr()*(R9[4]-R9[3]))*(DZ?DZ.larg:1),lat=R9[0]+r+jr()*R9[1],al=(jr()-.5)*40;
      touffe(pts[i].x+px*sg*lat+t9.x/hl*al,pts[i].z+pz*sg*lat+t9.z/hl*al,r,pts[i].y,R9[5]+(DZ?DZ.haut:0),R9[6]+(DZ?DZ.haut:0),1+((jr()*R9[7])|0),1,lat);}}
  {const S=230,Rmax=TEL_NATIF?2100:2500,m=new Map(),pasC=Math.max(1,Math.round(S*.7/(L/(NP-1))));
   for(let i=0;i<NP;i+=pasC){if(performance.now()>JF.lim)yield;const cx0=Math.round(pts[i].x/S),cz0=Math.round(pts[i].z/S),rr=Math.ceil(Rmax/S);
     for(let dx=-rr;dx<=rr;dx++)for(let dz=-rr;dz<=rr;dz++){const gx=(cx0+dx)*S,gz=(cz0+dz)*S,d=Math.hypot(gx-pts[i].x,gz-pts[i].z);if(d>Rmax)continue;
       const k=(cx0+dx)+','+(cz0+dz),o=m.get(k);if(!o||d<o[0])m.set(k,[d,i,gx,gz]);}}
   for(const v of m.values()){if(v[0]<700||jr()>.55*MOB*(DZ?DZ.loin:1))continue;
     touffe(v[2]+(jr()-.5)*S*.7,v[3]+(jr()-.5)*S*.7,20+jr()*36,pts[v[1]].y,-260,420,1+((jr()*4)|0),.85,v[0]);}}
  const ARB=[];
  const tP0=performance.now();if(iPorte>0){try{yield* jadePorte(root,iPorte,jr,M9,function(x,z,r,yt){return tente(x,z,r,yt,1,60,true);});}catch(e){console.warn('porte',e);JADE.porte=null;}}
  const tP1=performance.now();if(iPont>0){try{yield* jadePont(root,iPont,jr,M9,pose,ARB);}catch(e){console.warn('pont',e);JADE.pont=null;}}JADE.msPorte=Math.round(tP1-tP0);JADE.msPont=Math.round(performance.now()-tP1);
  if(performance.now()>JF.lim)yield;
  // ---- LES ROCHERS EN CUBES qui flottent autour des montagnes (des gabarits à part : JADE_NTPL et suivants) ----
  {const n0=PIL.length;for(let k=0;k<n0;k++){const q=PIL[k];if(JADE_SOBRE||q[8]>1600||jr()>(DZ?DZ.roch.p:.5))continue;const T9=G.p[q[5]];
    for(let j=0,n=1+((jr()*(DZ?DZ.roch.n:3))|0);j<n;j++){const t=JADE_NTPL+((jr()*3)|0),Tr=G.p[t],th=jr()*6.2832,rr=q[2]+12+jr()*45,x=snap(q[0]+Math.cos(th)*rr),z=snap(q[1]+Math.sin(th)*rr),rm=Tr.rmax*VX,Hs=Tr.yTop*VX;
      const yt=Math.floor((q[3]+(T9.Hb+jr()*T9.H*.65)*VX)/VX)*VX;if(yt-Hs<mer)continue;
      let ok=true;proches(x,z,rm+ROAD_HALF+14,function(i){const p=pts[i];if(Math.abs(p.y-yt+Hs/2)<Hs+30&&Math.hypot(p.x-x,p.z-z)<rm+ROAD_HALF+14)ok=false;});
      if(!ok||pgVois(x,z,function(q2){return Math.hypot(q2[0]-x,q2[1]-z)<(q2[2]+rm)*.95&&yt>q2[3]-10&&yt-Hs<q2[4]+10;}))continue;
      pose([x,z,rm,yt-Hs,yt,t,(jr()*4)|0,jr(),1e9]);}}}
  // ---- LA FORÊT PEINTE (pins, touffes) sur les cimes et les corniches, LES LIANES sous les montagnes, les TEMPLES, les CASCADES ----
  const PAG=[],PAV=[],CHU=[],V3=new THREE.Vector3(),Mt=new THREE.Matrix4();
  let qCur=null;JCH.fixe=new Set();
  const arb=(x,y,z,w,h,cell)=>{ARB.push({x:x,y:y,z:z,j:[w,h,cell,jr()],pq:qCur});};
  for(const q of PIL){if(performance.now()>JF.lim)yield;const d=q[8];if(!(d<(TEL_NATIF?700:1000)))continue;const T9=G.p[q[5]],mP=jadeMatPilier(q,0);qCur=q;
    const nA=Math.min(DZ?72:60,Math.round(T9.tops.length*.9*(VX/3.5)*(VX/3.5)*(DZ?DZ.pins.k:1))); // (v7) la même forêt au m² qu'avec des cubes de 3,5 m
    for(let k=0;k<nA&&T9.tops.length;k++){const c=T9.tops[(jr()*T9.tops.length)|0];V3.set(c[0]+.15+jr()*.7,c[1]+1,c[2]+.15+jr()*.7).applyMatrix4(mP);const pin=jr()<(DZ?DZ.pins.pin:.62),h=pin?11+jr()*11:5+jr()*5;arb(V3.x,V3.y,V3.z,h*(pin?.95:1.35),h,pin?(jr()*4)|0:4+((jr()*2)|0));}
    for(let k=0;k<Math.min(12,T9.cor.length);k++){const c=T9.cor[(jr()*T9.cor.length)|0];V3.set(c[0]+.5,c[1]+1,c[2]+.5).applyMatrix4(mP);const h=7+jr()*9;arb(V3.x,V3.y,V3.z,h,h,jr()<.6?(jr()*4)|0:4+((jr()*2)|0));}
    for(let k=0;k<Math.min(DZ?Math.round(16*DZ.lian):16,T9.des.length);k++){const c=T9.des[(jr()*T9.des.length)|0];V3.set(c[0]+.5,c[1],c[2]+.5).applyMatrix4(mP);const h=24+jr()*50;arb(V3.x,V3.y,V3.z,14+jr()*12,-h,6+((jr()*2)|0));}
    if(q[5]>=3&&d<700&&T9.tops.length){let bc=null,bd=1e9;for(const c of T9.tops){const e=Math.hypot(c[0]+.5-T9.M,c[2]+.5-T9.M);if(e<bd){bd=e;bc=c;}}
      V3.set(bc[0]+.5,bc[1]+1,bc[2]+.5).applyMatrix4(mP);if(PAG.length<7&&jr()<.16){PAG.push([V3.x,V3.y,V3.z,1.1+jr()*.4]);JCH.fixe.add(q);}else if(PAV.length<10&&jr()<.14){PAV.push([V3.x,V3.y,V3.z,1.3+jr()*.4]);JCH.fixe.add(q);}}
    if(CHU.length<(JADE_SOBRE?4:DZ?DZ.casc.n:16)&&T9.H*VX>260&&jr()<(DZ?DZ.casc.p:.11)){ // UNE CASCADE : d'une cellule au bord (l'air à côté), vers le vide
      const L9=T9.cor.concat(T9.tops);for(let tries=0;tries<12;tries++){const c=L9[(jr()*L9.length)|0];if(!c||c[1]<T9.H*.7)continue;
        const o=[[1,0],[-1,0],[0,1],[0,-1]].find(function(o9){return !voxAt(T9.G,c[0]+o9[0],c[1],c[2]+o9[1])&&!voxAt(T9.G,c[0]+o9[0],c[1]-1,c[2]+o9[1]);});if(!o)continue;
        V3.set(c[0]+.5+o[0]*.55,c[1]+.6,c[2]+.5+o[1]*.55).applyMatrix4(mP);const w=jadeQuart(q[6],o[0],o[1]);
        CHU.push([V3.x,V3.y,V3.z,w[0],w[1],8+jr()*9,Math.max(20,V3.y-JADE.eauY)*(.55+jr()*.35),jr()]);JCH.fixe.add(q);break;}}}
  qCur=null;
  /* ---- (2026-10-21, embellie) LES CRISTAUX DE JADE : des grappes sur les cimes et les corniches, du côté de la route (voir jadeCristalPeint). Posés par un générateur
     LOCAL (`jc`) : ni `jr` (les montagnes, les arbres, les cascades) ni le hasard de la piste ne sont touchés. De simples instances de la famille des arbres. ---- */
  const CRI=[];
  {const jc=mulberry32((seed^0xC215A1)>>>0),kc=PAL.b('jadeCristaux',1),V9=new THREE.Vector3();
   for(const q of PIL){if(performance.now()>JF.lim)yield;if(q[5]>=JADE_NTPL||!(q[8]<(TEL_NATIF?650:900)))continue;
     const r0=jc(),nn=1+((jc()*2.4)|0);if(r0>.62*kc)continue;
     const T9=G.p[q[5]],mP=jadeMatPilier(q,0);
     for(let k=0;k<nn;k++){let best=null,bd=1e9;
       for(let t=0;t<6;t++){const lst=jc()<.5&&T9.cor.length?T9.cor:T9.tops;if(!lst.length)continue;const c=lst[(jc()*lst.length)|0];
         V9.set(c[0]+.5,c[1]+1,c[2]+.5).applyMatrix4(mP);let d=1e9;
         proches(V9.x,V9.z,640,function(i){const e=pts[i],dd=Math.hypot(e.x-V9.x,e.z-V9.z);if(dd<d)d=dd;});
         if(d<bd){bd=d;best=[V9.x,V9.y,V9.z];}}
       if(!best||bd>=640||bd<ROAD_HALF+25)continue;
       const h=15+jc()*20;CRI.push({x:best[0],y:best[1],z:best[2],j:[h*(.9+jc()*.3),h,jc()<.6?8:9,jc()],pq:q});}}}
  if(performance.now()>JF.lim)yield;
  // ---- LA POSE : par QUARTIERS de 360 m (le tri, c'est jadeTri) ----
  const QC=160,quart=new Map(),qDe=(x,z)=>{const k=Math.floor(x/QC)+','+Math.floor(z/QC);let o=quart.get(k);if(!o)quart.set(k,o={k:quart.size,x0:1e9,x1:-1e9,y0:1e9,y1:-1e9,z0:1e9,z1:-1e9});return o;};
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
  {PIL.forEach(function(q,pi){const o=qDe(q[0],q[1]);ext(o,q[0],q[3]-8,q[4]+25,q[1],q[2]);for(let k=0;k<4;k++)parT[q[5]][k].push({q:o,m:jadeMatPilier(q,k).toArray(),j:[q[7],q[8]<2000||q[8]===1e9?1:.85,0,0],pi:pi});});
    for(let t=0;t<G.p.length;t++){if(performance.now()>JF.lim)yield;const Gt=G.p[t].geo;famille(Gt[0],M9.vr,parT[t][0],0,0);if(performance.now()>JF.lim)yield;famille(Gt[1],M9.vr,parT[t][1],1,1);if(performance.now()>JF.lim)yield;famille(Gt[2],M9.vrO,parT[t][2],2,4);if(performance.now()>JF.lim)yield;famille(Gt[3],M9.vrO,parT[t][3],5,5);}} // (v17) au-delà de 750 m : UNE passe opaque (le verre en trois passes coûtait 3× ses triangles)
  // (v8) LES CUBES MINUSCULES : une famille par gabarit, remplie à chaque image des montagnes proches (finProches) — elles quittent leur famille de 1,75 m
  if(performance.now()>JF.lim)yield;
  FIN.cap=parT.map(function(a){return Math.min(a[0].length,48);});FIN.vit=false;
  if(FIN.on)for(let t=0;t<G.p.length;t++)if(G.p[t].fin)finFamille(t);
  FIN.stamp=new Int32Array(PIL.length);FIN.was=new Uint8Array(PIL.length);FIN.gen=0;
  famille(G.arbreQ,M9.arb,ARB.concat(CRI).map(function(a){const o=qDe(a.x,a.z);ext(o,a.x,a.y-80,a.y+25,a.z,20);return {q:o,m:Mt.makeTranslation(a.x,a.y,a.z).toArray(),j:a.j,pq:a.pq};}),0,2);
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
  {const E=[],V9=new THREE.Vector3();for(const q of PIL){if(q[3]>JADE.eauY-2||q[4]<JADE.eauY)continue;const T9=G.p[q[5]],Gd=T9.G,yl=Math.floor((JADE.eauY-q[3])/VX);if(yl<0||yl>=Gd.ny)continue;
     let n=0,sx=0,sz=0;for(let x=0;x<Gd.nx;x++)for(let z=0;z<Gd.nz;z++)if(voxAt(Gd,x,yl,z)){n++;sx+=x;sz+=z;}
     if(n<2)continue;V9.set(sx/n+.5,yl,sz/n+.5).applyMatrix4(jadeMatPilier(q,0));E.push({x:V9.x,z:V9.z,r:Math.sqrt(n/Math.PI)*VX,ph:jr()*6.283,t:0});}
   JADE.eauPil=E;JADE.eauT=0;}
  if(performance.now()>JF.lim)yield;
  // ---- LA GRILLE DES CHOCS (cases de 80 m) : chaque montagne et chaque rocher y est inscrit dans son cercle ; le test final lit SES cubes ----
  {const CG=80,g9=new Map();
   PIL.forEach(function(q,k){const re=q[2]+2;for(let gx=Math.floor((q[0]-re)/CG);gx<=Math.floor((q[0]+re)/CG);gx++)for(let gz=Math.floor((q[1]-re)/CG);gz<=Math.floor((q[1]+re)/CG);gz++){const kk=gx+','+gz;let a=g9.get(kk);if(!a)g9.set(kk,a=[]);a.push(k);}});
   JADE.col={g:g9,CG:CG,P:PIL};}
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
  for(let pi=0;pi<PIL.length;pi++){const q=PIL[pi];if((pi&31)===31&&performance.now()>JF.lim)yield;if(JCH.fixe.has(q))continue;let bi=-1,bd2=1e18;
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
function jadeChuteTick(dt){
  if(!JCH.L.length||!JADE.root||!started||gameOver)return;let chg=false;const tn=JADE_U.uTime.value;
  for(const c of JCH.L){
    if(!c.t0){if(s>c.sN-700-c.dl&&mode!=='boom'){c.t0=tn;if(JADE.col&&JADE.col.mort)JADE.col.mort.add(c.pi);if(!c.inv)c.inv=new THREE.Matrix4();c.inv.identity();jadeChuteOrig(c);
      if(carGroup.position.distanceTo(JCH_V.set(c.q[0],carGroup.position.y,c.q[1]))<500)shake=Math.max(shake,.12);}else continue;}
    if(c.fin)continue;chg=true;const q=c.q,t=tn-c.t0,tf=Math.max(0,t-.9),dy=.5*c.g*tf*tf,th=Math.min(1.25,.5*c.w*tf*tf),jx=t<.9?Math.sin(t*57)*.35*(t/.9):0;
    const dr=.6*c.g*tf*tf*.25;JCH_T.makeTranslation(q[0]+jx+c.dx*dr,q[3]-dy,q[1]+c.dz*dr); // (elle s'éloigne de la route en tombant)
    JCH_R.makeRotationAxis(c.ax,th);JCH_M.multiplyMatrices(JCH_T,JCH_R);JCH_A.makeTranslation(-q[0],-q[3],-q[1]);JCH_M.multiply(JCH_A); // D = T(pivot)·T(0,−dy,0)·R·T(−pivot)
    if(!c.spl&&q[3]-dy<JADE.eauY+6){c.spl=true;jadeEcume(q[0],JADE.eauY,q[1],q[2]);}
    c.inv.copy(JCH_M).invert(); /* (2026-10-21, Léo : « on traverse les montagnes qui tombent ») la hitbox suit la montagne : le point testé est ramené dans son repère d'origine */
    const out=dy>(q[4]-JADE.eauY)+60;if(out)c.fin=true;
    for(const o of c.orig){const A=o.F.M;if(out)A.set(JCH_Z,o.si*16);else{JCH_R.fromArray(o.m);JCH_R.premultiply(JCH_M);JCH_R.toArray(A,o.si*16);}}
    if(c.fo){if(out)FIN.mats.set(c.pi,JCH_Z);else{JCH_R.fromArray(c.fo);JCH_R.premultiply(JCH_M);FIN.mats.set(c.pi,new Float32Array(JCH_R.elements));}}}
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
/* (v17) L'EAU QUI FRAPPE : les 12 montagnes trempées les plus proches passent au ciel peint (l'anneau d'écume autour d'elles, uEauP), et de
   loin en loin une GERBE de cubes d'écume jaillit de leur pied (la même réserve que l'effondrement) — devant soi, à moins de 900 m. */
function jadeEauTick(dt){const E=JADE.eauPil;if(!E||!E.length)return;const cp=camera.position,U=skyU.uEauP.value;
  JADE.eauT-=dt;if(JADE.eauT<=0){JADE.eauT=.25;const L9=JADE.eauNear||(JADE.eauNear=[]);L9.length=0;
    for(const e of E){const d=(e.x-cp.x)*(e.x-cp.x)+(e.z-cp.z)*(e.z-cp.z);if(d<2600*2600){e.d=d;L9.push(e);}}
    L9.sort(function(a,b){return a.d-b.d;});if(L9.length>12)L9.length=12;
    for(let i=0;i<12;i++){const e=L9[i];if(e)U[i].set(e.x,e.z,e.r,e.ph);else U[i].set(0,0,-1,0);}}
  if(paused||!started||gameOver||!JCH.splash)return;const L9=JADE.eauNear;if(!L9||!L9.length)return;
  const fx=camera.getWorldDirection(JCH_V);
  for(const e of L9){if(e.d>900*900)continue;e.t-=dt;if(e.t>0)continue;e.t=.9+Math.random()*2.2;
    const dx=e.x-cp.x,dz=e.z-cp.z;if(dx*fx.x+dz*fx.z<0)continue;
    const a0=Math.random()*6.2832,n=8+(Math.random()*10|0);
    for(let k=0;k<n&&JCH.sp.length<650;k++){const a=a0+(Math.random()-.5)*1.6,rr=e.r*(.92+Math.random()*.2),v=4+Math.random()*7;
      JCH.sp.push({x:e.x+Math.cos(a)*rr,y:JADE.eauY+1,z:e.z+Math.sin(a)*rr,vx:Math.cos(a)*v,vy:11+Math.random()*17,vz:Math.sin(a)*v,sz:.7+Math.random()*1.6,t:0,l:1.2+Math.random()*1.1});}}}
function jadeEcume(x,y,z,r){const n=Math.min(90,30+r*1.6|0);
  for(let k=0;k<n;k++){const a=Math.random()*6.2832,rr=r*(.4+Math.random()*.8),v=8+Math.random()*16;
    JCH.sp.push({x:x+Math.cos(a)*rr,y:y+2,z:z+Math.sin(a)*rr,vx:Math.cos(a)*v*.5,vy:14+Math.random()*30,vz:Math.sin(a)*v*.5,sz:1.5+Math.random()*3.5,t:0,l:2+Math.random()*1.6});}}
/* (2026-10-13, Léo : « fais en sorte que la voiture puisse plonger dans l'eau, ressortir, que ce soit comme le ciel ») LA MER COMME UN
   DEUXIÈME CIEL — au SOLEIL DE JADE (et dans la balade), tomber dans l'eau ne tue plus : on y VOLE.
   · LA POUSSÉE (jadeEauVol, dans la branche 'fall') : sous la surface, la gravité s'INVERSE (la poussée d'Archimède la retourne : +1 g
     vers le haut) et l'eau freine un peu ; le volant, le manche et la nitro marchent comme en l'air. On plonge, on ralentit, on remonte.
   · LE JAILLISSEMENT : la mer rend l'élan — on ressort au moins aussi vite qu'on est entré au PREMIER plongeon du vol (×EAU.rend) : on
     remonte jusqu'à la hauteur d'où l'on est tombé, de quoi reprendre la route. Les rebonds suivants ne grandissent jamais au-delà.
   · L'AIR : sous l'eau la jauge du vol se REMPLIT, et plus bas que le point de décollage elle ne baisse pas (la route est à 45-230 m
     au-dessus de l'eau : 200 m de chute durent 7 s, plus que les 6 s de la jauge) — on n'explose de temps de vol qu'en traînant AU-DESSUS, et le plongeon fatal sous la piste n'existe plus
     ici (le fond est à EAU.fond m — la poussée y ramène bien avant). Plongeon et jaillissement sont des FIGURES de la chaîne.
   · LA SURFACE suit la mer en cubes du ciel (jMerH, la même houle, lissée entre les cases pour la caisse, exacte pour l'objectif).
   · SOUS L'EAU (jadeSousTick) : la brume devient l'eau (turquoise, plus sombre en profondeur), le ciel du dôme devient le dessous de
     la mer (jadeSous : la fenêtre de Snell au-dessus, les rais de lumière), la PEAU (une grille de colonnes de 4 m qui suit la houle :
     vue d'en dessous, le miroir de l'eau et la fenêtre sur le ciel ; vue d'au-dessus, l'eau qui laisse deviner la caisse plongée), les
     montagnes montrent leur pied immergé, la caisse lâche des BULLES en petits cubes, la musique s'étouffe. */
/* (2026-10-13, 2e passe — Léo : « on n'a pas l'impression d'être dans l'eau : la physique, les éclaboussures, les gouttes, quand la voiture entre
   et ressort ») L'EAU SE SENT :
   · LE CHOC : l'eau est un mur — à l'impact la vitesse tombe à ×EAU.choc (à plat) … ×EAU.choc+.3 (à pic : on fend l'eau), secousse, coup de
     zoom, gros plouf grave. À PLAT ET VITE (moins de ~14° sous l'horizon) la caisse RICOCHE comme un galet (4 fois au plus par vol).
   · L'EAU ÉPAISSE : sous la surface la caisse freine fort (freinH, freinV), la poussée la remonte doucement — on flotte, on ralentit, on sent
     la masse d'eau ; la nitro y pousse comme une hélice.
   · LE JAILLISSEMENT reste un bond de dauphin : la mer rend la vitesse d'entrée (verticale ET horizontale, ×EAU.rend / ×.85) pour reprendre la route.
   · ÉCLABOUSSURES (EAUP, une réserve de 1 400 cubes d'eau à elle) : à l'entrée une COURONNE qui se lève + des centaines de GOUTTES qui partent
     loin et retombent ; à la sortie une COLONNE d'eau qui suit la caisse ; la caisse RUISSELLE 1,6 s (un chapelet de gouttes derrière elle) ;
     au ras de l'eau, un SILLAGE ; des ONDES qui s'élargissent sur la surface (EAUR).
   · L'OBJECTIF (LENS, une toile en pixels par-dessus l'image) : il sort de l'eau → une NAPPE qui s'égoutte vers le bas et des GOUTTES qui
     glissent sur la vitre ; il y entre → un voile clair et un nuage de bulles.
   · LE SON : sous l'eau tout passe dans un passe-bas (MASTER → filtre → BUSOUT, posé à la 1re plongée, grand ouvert sinon) ; un plouf grave
     à l'entrée, un jet à la sortie, des bloups de bulles sous l'eau. */
/* (2026-10-13, 3e passe — Léo : « pousse encore plus la physique, et mieux faite ») LA VRAIE PHYSIQUE DE L'EAU (réglée d'abord dans un
   simulateur à part, mêmes équations, mêmes unités que le vol) :
   · ARCHIMÈDE : la poussée suit la part IMMERGÉE de la caisse (`f`, de 0 à 1 sur EAU.H = 1,3 m) — B = 3,4 g quand elle est entière sous l'eau
     (nette +2,4 g), et la caisse FLOTTE à l'équilibre (f = 1/B : ~30 cm sous la surface), elle monte et descend avec la houle.
   · L'AMORTISSEMENT du pilonnement (cv) n'agit qu'au passage de la surface (f·(1−f)) : à flot, elle cesse de rebondir en ~1 s ;
     dessous, rien ne retient la remontée.
   · LA TRAÎNÉE ∝ v² (cq) + un peu de linéaire (cl), à proportion de l'immersion : à 600 km/h l'eau est un mur, au ralenti elle glisse.
   · LA GLISSE (hydroplanage) : vite et à moitié dans l'eau, une portance ∝ v² la soulève et la traînée baisse — la nitro en fait un jet-ski.
   · LE MOTEUR à flot : les roues brassent l'eau, la caisse file comme un bateau (~65 km/h) dans la direction du volant.
   · LE CHOC (vitesse ×choc … ×choc+chocK selon la pente) et le RICOCHET restent ; un simple contact (moins de 12 de vitesse verticale) ne
     fait qu'une ride.
   · LE JAILLISSEMENT : seulement après un vrai plongeon (plus de EAU.plonge = 6 m) — la remontée ACCÉLÈRE (la mer recrache), et l'on sort au
     moins à l'élan du premier plongeon du vol (×rend) ou à celui de la PROFONDEUR (on jaillit à ~2,5 × la profondeur atteinte) : plus on
     plonge profond, plus on saute haut. Une vague qui lâche la caisse ne fait qu'un petit bond.
   · L'ASSIETTE : dans l'eau la vrille s'arrête, la caisse se REDRESSE (le haut vers le ciel), à flot elle suit la pente de la houle et son
     nez garde le cap (jadeEauNez, branché sur l'orientation du vol).
   · À FLOT trop longtemps sans nitro (EAU.ramene s), la mer te RAMÈNE sur la route (pas de mort). */
const EAU={amorti:.85,paye:4, /* (2026-10-14, revue des idées de Léo) chaque sortie rendait vRef×1,06+4 : la caisse rebondissait SEULE entre la mer et sa hauteur, et chaque cycle payait REPLONGEON + HORS DE L'EAU + du flow, sans fin. Désormais l'élan rendu baisse de 15 % par plongeon du même vol (la profondeur, elle — un vrai geste à la nitro —, rend toujours son élan) et seuls les 4 premiers paient, comme le ricochet */
  B:3.4,H:1.3,cv:7,cl:.2,cq:.009,vPl:50,cP:1.2,mot:110,vB:95,choc:.55,chocK:.3,ricoA:.24,ricoV:55,rend:1.06,hRend:.85,profSaut:2.5,plonge:6,fond:420,ramene:9};
/* (2026-10-14, Sacha : « le gameplay quand tu vas dans l'eau pourrait être plus fun : là ça ralentit, alors qu'il pourrait y avoir une
   dimension où tu peux PLONGER et SURFER de manière cool ») LA MER QUI SE JOUE — par-dessus la physique de Léo (3e passe), rien n'en est retiré :
   · L'ENTRÉE GARDE L'ÉLAN : le choc ne prend plus que la vitesse VERTICALE (×choc) ; l'avance en garde 90 à 100 % (c'était ×0,55 à ×0,85
     sur tout : on s'arrêtait dans l'eau).
   · LE SURF : à la surface et vite (au-dessus de vPl, la glisse de Léo), l'eau ne freine presque plus (×surfK) — la caisse file sur sa
     carène, le volant taille des courbes dans la houle. « SURF ! » après 0,8 s tenue (une fois par passage dans l'eau), et la mer ne
     « ramène » plus une caisse qui surfe.
   · LE MANCHE PLONGE : dans l'eau le pouce haut / bas pousse la caisse vers le haut / le bas (manche × g), AVEC OU SANS nitro — on
     plonge exprès. Sous l'eau elle est profilée (avance freinée ×sousK seulement) ; on relâche, Archimède la recrache.
   · LE DAUPHIN DE MER : chaque jaillissement rend TOUTE l'avance de l'entrée (c'était 85 %), et les suivants du même vol l'augmentent
     (+6 % par plongeon, plafond +30 %) : plonger, jaillir, replonger = de plus en plus vite. Le nom de la figure compte les sauts.
   `?eau=ancien` = l'eau d'avant, au chiffre près. ⚠ Réglé à la lecture et au banc `dbgEau` : à juger en jeu. */
EAU.fun=!/[?&]eau=ancien\b/.test(location.search);EAU.surfK=.22;EAU.sousK=.4;EAU.manche=3.6;EAU.dauph=.06;EAU.dauphMax=.3;
const JEAU={surfT:0,y0:0,syF:NaN,vS:0,dans:false,f:0,wB:0,t:0,prof:0,vIn:0,vRef:0,hIn:0,n:0,rico:0,cd:0,k:0,sorti:9,goutT:0,bloop:0,flotT:0,cap:new THREE.Vector3(0,0,1),bul:[],im:null}; // cd : le répit après un ricochet ou une sortie (la houle monte et descend de plusieurs mètres)
const JSOUS={sous:false,sous0:false,bascT:9,prof:0,uK:0,N:48,peau:null,base:{c:new THREE.Color(),n:0,f:0},w:{c:new THREE.Color(),n:-1,f:-1,ok:false},c:new THREE.Color(),cA:new THREE.Color(.22,.64,.66),cB:new THREE.Color(.09,.34,.42)};
const JEAU_V=new THREE.Vector3(),JEAU_N=new THREE.Vector3();
function jadeVide(y){return jadeEauOk()?y<JADE.eauY-EAU.fond-200:y<trackMinY-120;} // le plongeon fatal : sous la piste… sauf au-dessus de la mer
function jadeEauOk(){return !!(JADE.root&&LVL.cur&&LVL.cur.piste==='jade'&&!PARK.on&&isFinite(JADE.eauY));}
function jMerHJ(cx,cz,T){const px=cx*4,py=cz*4;let r=Math.sin(cx*41.3+cz*289.1)*43758.5453;r-=Math.floor(r); // la houle du ciel (JADE_EAU_GLSL), case par case
  return Math.floor(1.6*Math.sin(px*.0105+T*.95)+1.1*Math.sin(py*.0165-T*1.3+px*.004)+.8*Math.sin((px+py)*.024+T*1.9)+.7*Math.sin(px*.031-py*.027+T*1.6)+.55*Math.sin(px*.061+py*.047+T*2.7)+1.5*(r-.5)+.6*Math.sin(T*3.2+r*6.28));}
function jadeSurfCase(x,z){return JADE.eauY+jMerHJ(Math.floor(x/4),Math.floor(z/4),skyU.uEauT.value)*4;} // la colonne exacte (l'objectif)
function jadeSurf(x,z){const T=skyU.uEauT.value,u=x/4-.5,v=z/4-.5,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j; // lissée entre les centres des cases (la caisse : pas de marches)
  const a=jMerHJ(i,j,T),b=jMerHJ(i+1,j,T),c=jMerHJ(i,j+1,T),d=jMerHJ(i+1,j+1,T);return JADE.eauY+4*((a*(1-fu)+b*fu)*(1-fv)+(c*(1-fu)+d*fu)*fv);}
function jadeEauRaz(){JEAU.syF=NaN;JEAU.dans=false;JEAU.f=0;JEAU.wB=0;JEAU.t=0;JEAU.prof=0;JEAU.vIn=0;JEAU.vRef=0;JEAU.hIn=0;JEAU.n=0;JEAU.rico=0;JEAU.cd=0;JEAU.k=0;JEAU.sorti=9;JEAU.goutT=0;JEAU.flotT=0;JEAU.bul.length=0;if(JEAU.im)JEAU.im.count=0;
  EAUP.L.length=0;if(EAUP.im)EAUP.im.count=0;for(const r of EAUR.L){r.m.visible=false;r.t=9;}for(const c of COUR.L){c.m.visible=false;c.t=9;}SILL.P.length=0;if(SILL.mesh)SILL.mesh.visible=false;EAUB.L.length=0;if(EAUB.im)EAUB.im.count=0;LENS.g.length=0;LENS.nappe=0;LENS.flash=0;if(LENS.cv)LENS.cv.style.visibility='hidden';if(acesPass&&acesPass.uniforms.uLensK)acesPass.uniforms.uLensK.value=0;
  JSOUS.sous=JSOUS.sous0=false;JSOUS.uK=0;if(JSOUS.peau)JSOUS.peau.visible=false;skyU.uSous.value=0;JADE_U.uSous.value=0;eauFiltre(false,true);}
/* LA SURFACE DE LA PHYSIQUE : la mer en cubes du décor saute de 4 m d'une colonne à l'autre et monte jusqu'à ~30 m/s (MESURÉ : 12,7 m en
   0,4 s sous la caisse — elle avalait une caisse à flot et la faisait « jaillir »). La caisse flotte sur une houle CALMÉE : la moyenne des
   9 colonnes autour d'elle (12 m), deux fois moins haute, suivie à 4 m/s au plus et lissée (τ 0,6 s). Le décor, lui, ne change pas. */
function jadeSurfMoy(x,z){const T=skyU.uEauT.value,i=Math.floor(x/4),j=Math.floor(z/4);let h=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)h+=jMerHJ(i+a,j+b,T);return JADE.eauY+2+4*h/9*.55;} // (+2 : le dessus moyen d'une colonne, son plancher étant arrondi en dessous ; ×,55 : la houle de la physique, deux fois plus calme)
function jadeSurfPh(x,z,dt){const s9=jadeSurfMoy(x,z);if(!isFinite(JEAU.syF)||Math.abs(JEAU.syF-s9)>40||dt<=0){JEAU.syF=s9;JEAU.vS=0;return s9;}
  const dl=Math.max(-4*dt,Math.min(4*dt,(s9-JEAU.syF)*Math.min(1,dt/.6)));JEAU.syF+=dl;JEAU.vS=dl/dt;return JEAU.syF;} // vS : la vitesse de la surface (m/s), pour flotter AVEC elle
function jadeEauVol(dt,dtF){ // branche 'fall', AVANT que la position avance (la vitesse vient d'encaisser gravité, volant, manche, nitro)
  if(!jadeEauOk()){if(JEAU.dans)JEAU.dans=false;JEAU.f=0;return false;}
  const sy=jadeSurfPh(fallPos.x,fallPos.z,dt),d=sy-fallPos.y,f=Math.min(1,Math.max(0,d/EAU.H)),hv=Math.hypot(fallVel.x,fallVel.z),vmW=SPD*AIR_RATE,g=FALL_G*gK(); // d : profondeur du DESSOUS de la caisse · f : sa part immergée
  JEAU.f=f;
  if(fallPos.y<JEAU.y0-2)fallTR=Math.max(0,fallTR-dt); // sous le point de décollage, la mer rattrape : la jauge ne baisse pas
  if(JEAU.cd>0)JEAU.cd-=dt;
  if(!JEAU.dans&&d>0&&(JEAU.cd<=0||d>EAU.plonge)){
    const v=Math.max(1,fallVel.length()),pente=-fallVel.y/v;
    if(fallVel.y<0&&pente<EAU.ricoA&&hv>EAU.ricoV&&JEAU.rico<4&&d<2.5){ // ---- LE RICOCHET : à plat et vite, l'eau renvoie la caisse comme un galet ----
      JEAU.rico++;JEAU.cd=.4;fallVel.y=Math.abs(fallVel.y)*.55+15;fallVel.x*=.82;fallVel.z*=.82;fallPos.y=sy+.4;
      const k9=Math.min(1,hv/160);jadeCouronne(fallPos.x,sy,fallPos.z,.25+.3*k9,fallVel);
      shake=Math.max(shake,.3);fovPunch=Math.max(fovPunch,5);hap([10,14]);
      try{noiseBurst(.28,.13,1500);subBoom(.07);if(SONV2)sfx('flaque.eau',{vol:-3});}catch(e){} // (2026-10-14, session SON) un galet qui rebondit : ≈ −33 dBFS (était −25, au niveau d'un verdict) — le plus léger des trois bruits d'eau (ricochet < sortie < plongeon), audit oreille-neuve n°3 §1
      try{addTrick('ricochet',JEAU.rico>1?'RICOCHET ×'+JEAU.rico:'RICOCHET !',5*JEAU.rico,1,true);flowAdd(5,'risque');}catch(e){}
      return false;}
    JEAU.dans=true;JEAU.t=0;JEAU.prof=0;JEAU.flotT=0;JEAU.surfT=0;
    const vn=-fallVel.y;
    if(vn>12){ // ---- LE PLONGEON : le choc, la couronne, le plouf ----
      JEAU.n++;JEAU.vIn=vn;JEAU.hIn=hv;if(!JEAU.vRef)JEAU.vRef=vn;
      const k9=Math.min(1,v/170);
      if(EAU.fun){const kh=.9+.1*pente;fallVel.y*=EAU.choc+EAU.chocK*pente;fallVel.x*=kh;fallVel.z*=kh;} // (2026-10-14) l'eau prend la chute, pas l'élan
      else fallVel.multiplyScalar(EAU.choc+EAU.chocK*pente); // l'eau est un mur : à plat on s'écrase, à pic on la fend
      jadeCouronne(fallPos.x,sy,fallPos.z,.12+.88*k9,null); // la taille de la gerbe suit la vitesse
      jadeBullesJet(fallPos,20+90*k9,4);
      shake=Math.max(shake,.45+.5*k9);fovPunch=Math.max(fovPunch,9+10*k9);hap([20,30,40]);
      // (2026-10-14, session SON) le plouf de Léo (subBoom + deux noiseBurst) est GARDÉ, mais ramené au rang d'une grosse éclaboussure : il sortait à −17,5…−14,7 dBFS (presque l'explosion, −16),
      // maintenant −26…−22 (sous le cratère −20, au-dessus d'une pose −30), dosé par la force k9. Plus de doublon : le « pouf » d'ouate `nuage.entre` (−36, inaudible sous le plouf) est retiré ;
      // `flaque.eau` (le vrai son d'eau, les bulles) reste dessous, dosé aussi (−34 → −28). Et le moteur se creuse un peu, comme pour un grand moment (audit oreille-neuve n°3 §1).
      try{subBoom(.14+.14*k9);noiseBurst(.6,.14+.10*k9,520);noiseBurst(.9,.06+.05*k9,2600);if(SONV2)sfx('flaque.eau',{vol:-6+6*k9});duckT=Math.max(duckT,.15+.25*k9);}catch(e){}
      if(JEAU.n<=EAU.paye)try{addTrick('plongeon',JEAU.n>1?'REPLONGEON !':'PLONGEON !',6+4*k9,1);flowAdd(6,'risque');}catch(e){}}
    else{eauRide(fallPos.x,sy,fallPos.z,.15);try{if(SONV2)sfx('flaque.eau');}catch(e){}}} // un simple contact : une ride
  else if(JEAU.dans&&d<-.3&&fallVel.y>0){ // ---- ELLE QUITTE L'EAU ----
    JEAU.dans=false;JEAU.cd=.35;JEAU.sorti=0;
    if(JEAU.prof>EAU.plonge&&JEAU.t>.4){ // le JAILLISSEMENT : la colonne d'eau, la caisse qui ruisselle
      JEAU.goutT=1.6;
      const vr=Math.max(Math.min(JEAU.vIn,JEAU.vRef||JEAU.vIn)*EAU.rend*Math.pow(EAU.amorti,Math.max(0,JEAU.n-1))+4,Math.sqrt(2*g*EAU.profSaut*JEAU.prof/SPD));if(fallVel.y<vr)fallVel.y=vr; // l'élan du premier plongeon, ou celui de la profondeur — jamais plus
      {const h2=Math.hypot(fallVel.x,fallVel.z),hw=Math.max(h2,JEAU.hIn*(EAU.fun?1+Math.min(EAU.dauphMax,EAU.dauph*Math.max(0,JEAU.n-1)):EAU.hRend));if(h2>1){fallVel.x*=hw/h2;fallVel.z*=hw/h2;}else{fallVel.x=JEAU.cap.x*hw;fallVel.z=JEAU.cap.z*hw;}fallVH0=Math.max(fallVH0,hw);} // …et sa course : on repart vers la route
      fallTR=0;fallT=Math.min(fallT,.5); // l'air rendu : une jauge de vol neuve
      try{jdmJailli(fallVel.x*vmW,fallVel.y*vmW,fallVel.z*vmW);}catch(e){} // (2026-10-15, Léo) LES DAUPHINS DE LA MER sautent avec elle, une fois sur deux
      const k9=Math.min(1,fallVel.y/170);
      jadeColonne(fallPos.x,sy,fallPos.z,fallVel.y*vmW,.15+.85*k9);
      shake=Math.max(shake,.35);fovPunch=Math.max(fovPunch,11);hap([12,18,26]);airFlash=.6;
      // (2026-10-14, session SON) le jet de Léo est gardé, ramené de −23 à −30…−26 dBFS selon k9 (toujours sous le plongeon, ≈ −22) ; `nuage.sort` (−42) redisait le jet : retiré, `flaque.eau` et `air.regain` restent dessous
      try{noiseBurst(.8,.14+.08*k9,2200);noiseBurst(.5,.12+.08*k9,450);subBoom(.08+.06*k9);if(SONV2){sfx('flaque.eau',{vol:-4});sfx('air.regain');}}catch(e){}
      if(JEAU.t>.3&&JEAU.n<=EAU.paye){try{addTrick('jailli',EAU.fun&&JEAU.n>1?'HORS DE L\'EAU ×'+JEAU.n:'HORS DE L\'EAU !',8+Math.min(18,JEAU.prof*.12)+(EAU.fun?3*Math.min(5,Math.max(0,JEAU.n-1)):0),2);flowAdd(8,'risque');}catch(e){}}}
    else{JEAU.goutT=.6;jadeColonne(fallPos.x,sy,fallPos.z,fallVel.y*vmW,.08);}} // une vague la lâche, un bond de bateau : un petit jet
  if(!JEAU.dans){ // hors de l'eau : la caisse ruisselle, et au ras de la surface elle laisse un sillage
    if(JEAU.goutT>0){JEAU.goutT-=dt;const p=carGroup.position,n9=Math.random()<dt*70*Math.min(1,JEAU.goutT/1.6)?3:0;
      for(let k=0;k<n9;k++)eauP(p.x+(Math.random()-.5)*2.2,p.y-.2+(Math.random()-.5)*.8,p.z+(Math.random()-.5)*2.2,(Math.random()-.5)*1.5,-1-Math.random()*3,(Math.random()-.5)*1.5,.07+Math.random()*.13,1.6,sy);}
    if(d>-2.5&&hv>20)jadeSillage(sy,hv,dt,d);
    return false;}
  // ---- DANS L'EAU : Archimède, l'amortissement, la traînée, la glisse, le moteur ----
  JEAU.t+=dt;if(d>JEAU.prof)JEAU.prof=d;
  fallVel.y+=g*EAU.B*f*dtF;                                   // ARCHIMÈDE : la part immergée porte
  if(EAU.fun&&f>0&&(pitchS<0||fallVel.y<18))fallVel.y+=pitchS*(pitchS>0?.45:1)*g*EAU.manche*Math.min(1,f*2)*dtF; // (2026-10-14) LE MANCHE PLONGE : pouce bas = on plonge (avec ou sans nitro) ; pouce haut = un coup de rein vers la surface, bridé (au banc il lançait la caisse à 119 m)
  const recrache=JEAU.prof>EAU.plonge&&JEAU.t>.4&&fallVel.y>0&&f>=1;    // la remontée d'un vrai plongeon ACCÉLÈRE
  if(recrache)fallVel.y+=g*1.5*dtF;
  {const kk=1-Math.exp(-EAU.cv*Math.max(f*(1-f)*4,f<1?.6:0)*dtF);fallVel.y+=(JEAU.vS/vmW-fallVel.y)*kk;} // le pilonnement s'amortit PAR RAPPORT À LA SURFACE : à flot, la caisse monte et descend AVEC la houle (la gravité du jeu, ~8 m/s², est plus lente que la houle qui retombe : sans ça, elle décollait)
  {const v=fallVel.length(),pl=Math.min(1,Math.max(0,(hv-EAU.vPl)/60)),k=(EAU.cl+EAU.cq*v)*(.25+.75*f)*(1-.5*pl*(1-f)),e=Math.exp(-k*dtF);
   const eH=EAU.fun?Math.exp(-k*(f>=1?EAU.sousK:hv>EAU.vPl?EAU.surfK:1)*dtF):e; // (2026-10-14) en SURF et sous l'eau, l'avance n'est presque plus freinée
   fallVel.x*=eH;fallVel.z*=eH;fallVel.y*=recrache?Math.exp(-k*.3*dtF):e; // la traînée ∝ v², moindre en glisse
   if(f<.95&&hv>EAU.vPl)fallVel.y+=g*EAU.cP*pl*pl*Math.min(1,f*4)*dtF;} // LA GLISSE : vite et à moitié dans l'eau, elle se soulève
  if(f>.04&&f<1){const h2=Math.hypot(fallVel.x,fallVel.z);if(h2<EAU.vB){const a=EAU.mot*(1-h2/EAU.vB)*dtF; // LE MOTEUR : à flot, les roues brassent l'eau
    if(h2>2){fallVel.x+=fallVel.x/h2*a;fallVel.z+=fallVel.z/h2*a;}else{fallVel.x+=JEAU.cap.x*a;fallVel.z+=JEAU.cap.z*a;}}}
  fallVH0=Math.max(fallVH0,Math.hypot(fallVel.x,fallVel.z)); // ce que l'eau donne (moteur, glisse) n'est pas plafonné par l'élan du décollage
  if(d>EAU.fond&&fallVel.y<0)fallVel.y*=.85; // le fond (on n'y arrive pas : la poussée ramène bien avant)
  fallTR=Math.max(0,fallTR-dt*3); // la jauge du vol se remplit dans l'eau
  if(EAU.fun&&f<1&&f>.04&&hv>EAU.vPl){const a9=JEAU.surfT;JEAU.surfT+=dt;if(a9<.8&&JEAU.surfT>=.8){try{addTrick('surf','SURF !',8,1);flowAdd(5,'style');hap([8,20,8]);}catch(e){}}}
  if(f<1&&JEAU.t>1&&!(EAU.fun&&hv>EAU.vPl)){JEAU.flotT+=dt;if(JEAU.flotT>EAU.ramene&&!nitroOn){jadeEauRamene();return true;}}else JEAU.flotT=Math.max(0,JEAU.flotT-dt*2); // à flot trop longtemps : la mer te ramène
  if(f<1&&hv>14)jadeSillage(sy,hv,dt,d); // à flot ou en glisse : les deux nappes vers les côtés
  else if(f<1){JEAU.rideT=(JEAU.rideT||0)-dt;if(JEAU.rideT<=0){JEAU.rideT=.7+Math.random()*.5;eauRide(fallPos.x,sy,fallPos.z,.1);}} // à flot, lente : les ronds autour d'elle
  if(f>=1){if(Math.random()<dt*(nitroOn?45:18))jadeBullesJet(carGroup.position,nitroOn?5:2,1.8);
    JEAU.bloop-=dt;if(JEAU.bloop<=0){JEAU.bloop=.12+Math.random()*(nitroOn?.15:.4);eauBloop(nitroOn?1:.6);}}
  return true;}
function jadeEauRamene(){ // à flot depuis trop longtemps, sans nitro : la mer te ramène sur ta dernière route (comme le filet du mode facile — rien n'est perdu que la chaîne)
  JEAU.dans=false;JEAU.flotT=0;JEAU.f=0;airPie.style.display='none';airFlash=0;
  
  chain=0;chainVal=0;chainMult=1;chainSeen={};chainHud.style.opacity=0;caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  respawn();hopY=2.2;hopV=0;graceT=Math.max(graceT,2.2);loop._camDriveT=0;
  fallVel.set(0,0,0);fallPos.copy(carGroup.position); /* (2026-10-14, revue des idées de Léo) appelée AU MILIEU de la branche du vol : la suite (fallPos qui avance, pickupsTick, tryLand) tournait encore sur l'élan de la mer — elle reste immobile cette image-là, la route la reprend à la suivante */
  try{popTexte(sansAcc(TR('LA MER TE RAMENE')),'#7dffec',2);}catch(e){}try{if(SONV2)sfx('air.regain');}catch(e){}}
function jadeEauNez(nez,dt){ // dans l'orientation du vol : nez = la direction du nez (normalisée), à corriger ; FLY_U se redresse
  const ci=JEAU.dans?1:0;JEAU.wB+=(ci-JEAU.wB)*Math.min(1,dt*(ci?5:1.5));const w=JEAU.wB;if(w<.01)return;
  const hv=Math.hypot(fallVel.x,fallVel.z);if(hv>6)JEAU.cap.set(fallVel.x/hv,0,fallVel.z/hv);
  const V=JEAU_V,sp=fallVel.length();
  if(JEAU.f>=1&&sp>25)V.copy(fallVel).normalize(); // sous l'eau et vite : la trajectoire
  else{V.copy(JEAU.cap);V.y=THREE.MathUtils.clamp(fallVel.y/Math.max(30,hv),-.6,.6);V.normalize();} // à flot ou lente : le CAP, le nez levé/baissé par la vitesse verticale
  nez.lerp(V,w).normalize();
  const N=JEAU_N;if(JEAU.f<1&&JADE.root){const p=fallPos,e=4,sx=(jadeSurfMoy(p.x+e,p.z)-jadeSurfMoy(p.x-e,p.z))/(2*e),sz=(jadeSurfMoy(p.x,p.z+e)-jadeSurfMoy(p.x,p.z-e))/(2*e);N.set(-sx*.5,1,-sz*.5).normalize();}else N.set(0,1,0);
  FLY_U.lerp(N,Math.min(1,dt*3*w)).normalize();} // ARCHIMÈDE redresse la caisse ; à flot elle suit la pente de la houle
