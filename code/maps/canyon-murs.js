/* ===== LE CANYON SUR LES MURS (2026-11-05, Sacha : « des modules dans les canyons, vraiment presque incliné à 90 degrés, le long des falaises, comme si on était en train de rouler sur les
   murs. Mais par moment, pas tout le temps. Certains modules où, quand ça s'élargit, la route part sur le côté et on roule le long du mur ») =====
   · LA PIÈCE `mur` (genCanyon, `PC.mur`) : une approche à contre-courbe, puis UN GRAND VIRAGE (70-92°, rayon tiré pour durer ~`T` s de croisière). Pas plus d'un par canyon, dans ~4
     canyons sur 10 (« par moments » : il prend la place de la pièce due, le budget de longueur ne bouge pas) ; jamais dans le départ, les raccourcis, les étroits, l'arche, l'amphithéâtre ni la finale — ce sont des pièces à part.
   · LA DALLE SE COUCHE (`cyMurBank`) : même recette que le dévers des dunes et de la jade (les normales passent à buildTrack par `TORD.N`) mais jusqu'à `max` (86°) : la courbure du seul
     grand virage, moyennée sur ±`ramp`/2 s de croisière (deux passes) et pliée par un tanh, donne un roulis qui monte en ~4 s, TIENT tout le virage, puis redescend ; une borne de vitesse
     de roulis (24°/s) garantit qu'il n'y a jamais d'à-coup. La dalle penche vers l'INTÉRIEUR du virage : la falaise est à l'EXTÉRIEUR, comme un mur de la mort — la force du virage plaque la caisse.
   · LA PHYSIQUE : `TORD.on` (la caméra, le vol et le bord de la route suivent la dalle) mais `TORD.pente` : la pente du canyon pousse et retient toujours (hautPente) ; et le vol/le bord ne
     suivent la dalle que si elle est vraiment couchée (`murRoule`, > 25°) — les vols de la route à plat restent ceux d'avant, au chiffre près.
   · LE RELIEF ÉPOUSE LA DALLE (cyProfil, `S.mu`) : pour chaque échantillon de la route, `mu` (0 → 1 de 28° à 66° de roulis) fait venir un PLAN de roche, parallèle à la dalle, à `gap` m derrière
     le dessous de la dalle (700 m plus bas quand la dalle est à plat : le plan n'existe pas) ; le canyon s'élargit (le pied des parois à 235 m) et sa rivière s'écarte de la route du côté du vide. La roche vaut
     max(profil du canyon, plan) : une vraie paroi à 85° exactement derrière la dalle (le plan est LINÉAIRE, l'interpolation de la grille de 12 m le reproduit au centimètre), le haut de la paroi
     rejoint le plateau, et la dalle ne touche jamais la pierre. `dbgCanyonMurs()` mesure tout (part de route sur les murs, angle, vitesse de roulis, écart dalle-roche).
   `?sans=canyonmurs` = le canyon d'avant, au tirage près. */
const CY_MUR={on:!/[?&]sans=([^&]*,)?canyonmurs(,|&|$)/.test(location.search),max:86*Math.PI/180,T:8.5,ramp:3.8,vmax:24*Math.PI/180,mu0:28*Math.PI/180,mu1:66*Math.PI/180,gap:2.5,dec:110,larg:235,proba:.45};
function cyMurLisse(a,sc,hh,W9){const n=a.length,o=new Float32Array(n);for(let i=0;i<n;i++){let sw=0,sk=0;for(let j=i;j>=0&&sc[i]-sc[j]<W9;j--){sw+=hh[j];sk+=a[j]*hh[j];}for(let j=i+1;j<n&&sc[j]-sc[i]<W9;j++){sw+=hh[j];sk+=a[j]*hh[j];}o[i]=sk/sw;}return o;}
/* le roulis voulu à chaque point de contrôle de C entre i0 et i1 (le grand virage) — rend les normales de la dalle, comme le dévers de la jade */
function cyMurBank(C,i0,i1,VW){
  const n=C.length,sc=new Float32Array(n),kap=new Float32Array(n),hh=new Float32Array(n);
  for(let i=1;i<n;i++)sc[i]=sc[i-1]+Math.hypot(C[i].x-C[i-1].x,C[i].z-C[i-1].z);
  for(let i=0;i<n;i++){const a9=C[Math.max(0,i-1)],b9=C[Math.min(n-1,i+1)];hh[i]=Math.hypot(b9.x-a9.x,b9.z-a9.z)/2||1;}
  for(let i=Math.max(1,i0);i<=Math.min(n-2,i1);i++){const ax=C[i].x-C[i-1].x,az=C[i].z-C[i-1].z,bx=C[i+1].x-C[i].x,bz=C[i+1].z-C[i].z,la=Math.hypot(ax,az)||1,lb=Math.hypot(bx,bz)||1;
    kap[i]=Math.asin(Math.max(-1,Math.min(1,(ax*bz-az*bx)/(la*lb))))/((la+lb)/2);} // la courbure signée, DANS le virage seulement (rien avant, rien après : le roulis naît de la moyenne, pas d'un masque)
  const Lr=CY_MUR.ramp*VW,W9=Math.max(80,Lr*.5),kl=cyMurLisse(cyMurLisse(kap,sc,hh,W9),sc,hh,W9);
  let ks=0,kn=0;for(let i=i0;i<=i1;i++){ks+=Math.abs(kap[i]);kn++;}const kref=Math.max(1e-4,.42*ks/Math.max(1,kn));
  const b=new Float32Array(n);for(let i=0;i<n;i++)b[i]=CY_MUR.max*Math.tanh(kl[i]/kref);
  const lim=(i,j)=>CY_MUR.vmax/Math.max(30,VW)*Math.abs(sc[i]-sc[j]); // la vitesse de roulis bornée (24°/s à la croisière), dans les deux sens : jamais d'à-coup
  for(let i=n-2;i>=0;i--)b[i]=Math.max(b[i+1]-lim(i,i+1),Math.min(b[i+1]+lim(i,i+1),b[i]));
  for(let i=1;i<n;i++)b[i]=Math.max(b[i-1]-lim(i,i-1),Math.min(b[i-1]+lim(i,i-1),b[i]));
  const N=[];let mx=0,lon=0;
  for(let i=0;i<n;i++){const a9=C[Math.max(0,i-1)],c9=C[Math.min(n-1,i+1)],tl=Math.hypot(c9.x-a9.x,c9.z-a9.z)||1,tx=(c9.x-a9.x)/tl,tz=(c9.z-a9.z)/tl,b9=b[i];
    N.push(new THREE.Vector3(-tz*Math.sin(b9),Math.cos(b9),tx*Math.sin(b9)));if(Math.abs(b9)>mx)mx=Math.abs(b9);if(i&&Math.abs(b9)>CY_MUR.mu1)lon+=sc[i]-sc[i-1];}
  return {N:N,maxDeg:Math.round(mx*57.2958),mur:Math.round(lon),de:Math.round(sc[i0]),a:Math.round(sc[i1]),W:Math.round(W9),kref:+kref.toExponential(2)};
}
/* (genCanyon, à la fin) le grand virage de la pièce `mur` → les normales de la dalle : CY.murN (lues par pisteRoute) · CY.murI (le bilan) */
function cyMurPose(C,Q,VW){
  CY.murN=null;CY.murI=null;if(!CY_MUR.on||!Q.mur1||!Q.mur2)return;
  const ix=p=>{let bi=0,bd=1e18;for(let j=0;j<C.length;j++){const d=C[j].distanceToSquared(p);if(d<bd){bd=d;bi=j;}}return bi;};
  const i0=ix(Q.mur1.p),i1=ix(Q.mur2.p);if(i1-i0<3)return;
  const r=cyMurBank(C,i0,i1,VW);CY.murN=r.N;CY.murI={i0:i0,i1:i1,maxDeg:r.maxDeg,mur:r.mur,de:r.de,a:r.a,W:r.W,kref:r.kref};
}
/* (cyBatitG) les échantillons de la route (tous les 8 m) apprennent leur dalle : la normale (S.nx/ny/nz), le poids de mur mu (0 → 1 de 28° à 66° de roulis) et le côté de la falaise
   (S.mg : +1 = à droite de la route, −1 = à gauche — la falaise est à l'opposé de la normale) */
function cyMurEchantillons(S,st9){
  const n=S.n,A=k=>new Float32Array(k);S.mu=A(n);S.mg=A(n);S.nx=A(n);S.ny=A(n);S.nz=A(n);S.dec=CY_MUR.dec;S.gap=(typeof THICK==='number'?THICK:5.2)+CY_MUR.gap; /* le plan est derrière le DESSOUS de la dalle (son épaisseur THICK, 5,2 m) + 2,5 m de garde (les corniches de la roche mordent ±1,1 m) */let nm=0,mx=0;
  const nv=new THREE.Vector3(),tv=new THREE.Vector3(),up=new THREE.Vector3(),sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  for(let i=0;i<n;i++){const s9=Math.min(L,i*S.ds),f=s9/st9,k=Math.min(NP-2,Math.floor(f)),u=f-k;
    nv.copy(Nn[k]).lerp(Nn[k+1],u).normalize();tv.copy(T[k]).lerp(T[k+1],u).normalize();
    up.set(0,1,0).addScaledVector(tv,-tv.y);const ul=up.length(),c9=ul>.2?nv.dot(up)/ul:1,al=Math.acos(Math.max(-1,Math.min(1,c9))),tl=Math.hypot(tv.x,tv.z)||1;
    S.nx[i]=nv.x;S.ny[i]=nv.y;S.nz[i]=nv.z;S.mu[i]=sm(CY_MUR.mu0,CY_MUR.mu1,al);S.mg[i]=(nv.x*tv.z-nv.z*tv.x)/tl>0?-1:1;
    if(S.mu[i]>.5)nm++;if(al>mx)mx=al;}
  S.murN=nm;S.murMax=mx;}
/* faut-il, à cet endroit de la route, que le vol et le bord suivent la dalle ? Partout où TORD roule (nuages, orbite, grotte) : oui. Au canyon (TORD.murs) : seulement si la dalle est
   VRAIMENT couchée (> 25° de roulis) — la route à plat garde la gravité du monde */
function murRoule(Fr){
  if(!TORD.on)return false;if(!TORD.murs)return true;
  const t=Fr.t,nn=Fr.n,uy=1-t.y*t.y;if(uy<.04)return true;
  const ux=-t.y*t.x,uyy=1-t.y*t.y,uz=-t.y*t.z,ul=Math.sqrt(ux*ux+uyy*uyy+uz*uz)||1;
  return (nn.x*ux+nn.y*uyy+nn.z*uz)/ul<.906;}
/* ===== LE BANC DES MURS : dbgCanyonMurs() mesure la route en cours · dbgCanyonMurs(n, graine) génère n canyons et compte ===== */
window.dbgCanyonMurs=function(n,g0){
  const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
  if(n==='vue'){ /* dbgCanyonMurs('vue', s, dist, recul, haut) : une photo figée — l'œil à `dist` m de la dalle (côté vide, sur sa normale), `recul` m en arrière, `haut` m au-dessus ; il regarde la dalle 150 m devant */
    if(!CY.on)return 'pas de canyon';if(started&&!gameOver&&!paused)togglePause();
    frameAt(Math.max(0,Math.min(L-1,arguments[1])),F9);const d=arguments[2]!=null?arguments[2]:120,rc=arguments[3]!=null?arguments[3]:60,ha=arguments[4]!=null?arguments[4]:0;
    camera.position.copy(F9.p).addScaledVector(F9.n,d).addScaledVector(F9.t,-rc);camera.position.y+=ha;camera.up.set(0,1,0);camera.lookAt(F9.p.x+F9.t.x*150,F9.p.y+F9.t.y*150,F9.p.z+F9.t.z*150);camera.updateMatrixWorld();
    skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);if(acesPass)acesPass.uniforms.uSpeed.value=0;if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return {cam:camera.position.toArray().map(Math.round),n:F9.n.toArray().map(v=>+v.toFixed(2))};}
  if(n){const c0=LVL.cur,out=[];try{LVL.cur=NIV_CANYON;const VW=typeof vPalier==='function'?vPalier():70;
    for(let k=0;k<n;k++){const seed=((g0|0)||4242)+k*7919,it=genCanyon(mulberry32(seed));let r=it.next();while(!r.done)r=it.next();const C=r.value,I=CY.murI;
      let Lm=0;for(let i=1;i<C.length;i++)Lm+=Math.hypot(C[i].x-C[i-1].x,C[i].z-C[i-1].z);
      let ok=true,signe=0;if(CY.murN){const i0=I.i0,i1=I.i1;for(let i=i0+1;i<i1;i++){const a=C[i-1],b=C[i],c=C[i+1],kp=(b.x-a.x)*(c.z-b.z)-(b.z-a.z)*(c.x-b.x),nn=CY.murN[i],t=new THREE.Vector3(c.x-a.x,0,c.z-a.z).normalize(),lat=nn.x*t.z-nn.z*t.x; // + : la normale penche vers la droite
          if(Math.abs(lat)>.5){signe++;if((kp>0)===(lat>0))ok=false;}}} // vers l'INTÉRIEUR : dans un virage à gauche (kp > 0) la normale penche à gauche (lat < 0)
      let rmax=0;if(CY.murN){const bq=i=>{const a=C[Math.max(0,i-1)],c=C[Math.min(C.length-1,i+1)],tl=Math.hypot(c.x-a.x,c.z-a.z)||1,tx=(c.x-a.x)/tl,tz=(c.z-a.z)/tl,nn=CY.murN[i];return Math.atan2(nn.x*tz-nn.z*tx,nn.y);}; // l'angle de roulis de la dalle (+ : penchée à droite)
      for(let i=1;i<C.length;i++){const ds=Math.hypot(C[i].x-C[i-1].x,C[i].z-C[i-1].z)||1;rmax=Math.max(rmax,Math.abs(bq(i)-bq(i-1))/ds*VW*57.2958);}}
      out.push({seed:seed,mur:!!CY.murN,L:Math.round(Lm),bilan:CY.murI,partMurs:CY.murI?+(CY.murI.mur/Lm).toFixed(3):0,rouliMaxDegS:+rmax.toFixed(1),sensOk:ok,sep:CY.sep});}
    }finally{LVL.cur=c0;}
    const av=out.filter(o=>o.mur);return {n:out.length,avecMur:av.length,partMoyenne:+(av.reduce((a,o)=>a+o.partMurs,0)/Math.max(1,av.length)).toFixed(3),angleMax:Math.max.apply(null,av.map(o=>o.bilan.maxDeg)),rouliMaxDegS:Math.max.apply(null,av.map(o=>o.rouliMaxDegS)),sensFaux:av.filter(o=>!o.sensOk).length,sepMin:Math.min.apply(null,out.map(o=>o.sep)),detail:out};}
  /* la route en cours : la part sur les murs (> 60°), l'angle max, la vitesse de roulis, l'écart dalle-roche sur chaque mur */
  if(!(LVL.cur&&LVL.cur.piste==='canyon')||!NP)return 'pas de canyon';
  let lon=0,mx=0,rm=0,zones=[],z0=-1,sa0=0;const VW=typeof vPalier==='function'?vPalier():70,ds=L/(NP-1);
  for(let i=0;i<NP;i++){const t=T[i],uy=1-t.y*t.y,ul=Math.sqrt(uy*uy+t.y*t.y*(t.x*t.x+t.z*t.z))||1,c9=(Nn[i].x*-t.y*t.x+Nn[i].y*uy+Nn[i].z*-t.y*t.z)/ul,al=Math.acos(Math.max(-1,Math.min(1,c9)))*57.2958;
    if(al>mx)mx=al;if(al>60){lon+=ds;if(z0<0)z0=i*ds;}else if(z0>=0){zones.push([Math.round(z0),Math.round(i*ds)]);z0=-1;}
    const tl=Math.hypot(t.x,t.z)||1,sa=al*((Nn[i].x*t.z-Nn[i].z*t.x)/tl>0?1:-1); // l'angle de roulis SIGNÉ (+ : penchée à droite) : sa vitesse seule, sans le virage de la route
    if(i){const r9=Math.abs(sa-sa0)/ds*VW;if(r9>rm)rm=r9;}sa0=sa;}
  if(z0>=0)zones.push([Math.round(z0),Math.round(L)]);
  const res={torsion:TORD.on,pente:!!TORD.pente,murs:!!TORD.murs,info:CY.murI||null,angleMaxDeg:Math.round(mx),partMurs:+(lon/L).toFixed(3),murM:Math.round(lon),zones:zones,rouliMaxDegS:+rm.toFixed(1),L:Math.round(L)};
  if(CY.on&&CY.S&&CY.S.mu){res.echantillons={murs:CY.S.murN,max:Math.round(CY.S.murMax*57.2958)};}
  if(CY.on&&zones.length){let gmin=1e9,gmax=-1e9,flotte=0,dedans=0,tot=0,pire=[];const G=[-ROAD_HALF*.95,0,ROAD_HALF*.95];
    for(const z of zones)for(let s9=z[0]+40;s9<z[1]-40;s9+=6){frameAt(s9,F9);const ny=F9.n.y;if(Math.abs(ny)>.35)continue; // seulement là où la dalle est vraiment couchée
      for(const lt of G){const x=F9.p.x+F9.b.x*lt,zz=F9.p.z+F9.b.z*lt,y=F9.p.y+F9.b.y*lt,h=cyHauteur(x,zz),gp=(y-THICK-h)*Math.abs(ny); // l'écart vers le bas, ramené à la normale de la dalle
        tot++;if(gp<gmin){gmin=gp;pire=[Math.round(s9),lt|0,+gp.toFixed(1)];}if(gp>gmax)gmax=gp;if(gp<0)dedans++;if(gp>14)flotte++;}}
    res.contact={points:tot,ecartMin:+gmin.toFixed(1),ecartMax:+gmax.toFixed(1),dansLaRoche:dedans,flottants:flotte,pire:pire};}
  return res;};
