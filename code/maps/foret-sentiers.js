/* ===== LES SENTIERS DE LUCIOLES (2026-11-05, Sacha : « mets-toi en game designer senior, améliore-la encore, il faut que ce soit une map fun ») =====
   LE JEU DE LA FORÊT, C'EST LE RACCOURCI (passation/RACCOURCIS.md) : on voit une autre route plus bas, on sort par le bord, on se pose dessus et on gagne des
   kilomètres (le jeu crie RACCOURCI, la frénésie part). Mais rien ne disait OÙ sauter, et un raté tue : la plupart des joueurs ne sautaient jamais. Le défaut
   n'était pas le nombre de raccourcis (MESURÉ au banc, outils/banc-routes/foret.cjs : 8 à 38 par forêt, jusqu'à 12 km de gain), c'était qu'ils ne se lisaient pas.
   · LE SENTIER (`foretSentiersCalc`, au début du décor) : les meilleurs (en moyenne 1,3 par forêt au palier 0, ~0,3-1 aux hauts paliers où les vols sont plus longs — la forêt s'élargit avec le palier) raccourcis de la forêt (à 900 m au moins l'un de l'autre) sont BALISÉS. Au passage
     d'une route à 25-190 m sous une autre, on cherche le bord d'où une sortie — le cap de la route braqué de 0 à 26° vers l'extérieur (le joueur qui vise le bord),
     à la vitesse du moment (× 1,55 la croisière du palier au départ, × 1,1 en fin de partie : le jeu roule à ~1,8 × au début) — se pose proprement sur la dalle d'en dessous (≥ 180 m de gain, pose à moins de 53° de l'axe) et qui TIENT encore avec ± 6 m/s de vitesse verticale
     au décollage (mesuré : elle varie de −7 à +10 m/s d'un saut à l'autre) ; à × 0,8 ou × 1,4 la vitesse, la sortie est mieux notée : le même simulateur que le banc des raccourcis (gravité FALL_G × SPD, la caisse part du bord avec la vitesse de la
     route). Faute de mieux (moins de deux fils), un second passage laisse la trajectoire s'infléchir en l'air (± 20 à 40°/s : le joueur suit les fruits) ;
   · LE FIL (`foretSentiersPose`, avec les pièces) : quatre fruits en ligne vers le point de sortie (on s'y range), puis les fruits de la trajectoire, en l'air,
     tous les 0,36 s — oranges, mangues, melons, pommes (les gros) —, et à la pose UN FRUIT-POUVOIR (nitro infinie, vitesse ×2 ou aura ×2) sur la route d'arrivée.
     Qui suit le fil se pose, remplit sa nitro EN VOL (le triplé de la frénésie : raccourci + nitro) et repart avec un pouvoir ; les fruits en l'air ne se
     prennent qu'en vol (`p.air`, voir pickupsTick) et à 30 m (la trajectoire n'est juste qu'à ± 25 m : mesuré en jeu, 2 sauts) ;
   · LE COULOIR : 24 m de rayon autour de la trajectoire, aucun géant ni arbre ordinaire (`FORET.sentZ`, lu par geantXZ et par zone()) — le fil ne
     passe jamais dans un tronc ;
   · les autres croisements restent des paris : pas de fil, on voit la route, on décide.
   `?sans=foretsentiers` = la forêt sans fils. Banc : `dbgSentiers()` (les fils, les fruits posés et pris) ; `node outils/banc-routes/foret.cjs sentiers palier n`. */
const FOR_SENT={on:typeof location!=='undefined'&&/[?&]foretsentiers=1/.test(location.search), /* (2026-11-05 soir) COUPÉS par défaut : Sacha a fini la forêt en 10 s et veut s'y PERDRE — un fil de fruits rend le raccourci évident et gagnant à coup sûr ; `?foretsentiers=1` les rend */ vk0:1.55,vk1:1.1,bascule:.45,pop:5.3,dv:6,air:30,pente:.48,ang:[0,8,16,26],ang2:[0,14],lac:[-30,30],cos:.6,latMax:14,robMin:0,gainMin:180,esp:900,rayon:24,pas:.18,fruits:['ORANGE','MANGUE','MELON','POMME'],pow:['n','v','x','n']};
function* foretSentiersCalc(){ /* un générateur : il rend la main à l'échéance JF.lim (le pré-bâti) */
  FORET.sent=[];FORET.sentZ=[];
  if(!FOR_SENT.on||PARK.on||!(NP>300))return;
  const ds=L/(NP-1),G=FALL_G*SPD*gK(),HALF=ROAD_HALF,vN=Math.max(40,vPalier())*(FOR_SENT.vk0+(FOR_SENT.vk1-FOR_SENT.vk0)*Math.min(1,Math.max(0,engTier|0)/25)),tolS=Math.max(14,ds*2+2),bA=new THREE.Vector3(),tmp9=()=>typeof JF!=='undefined'&&performance.now()>JF.lim;
  /* 1. les croisements : une route 25-190 m sous une autre, à moins de 210 m en plan (un croisement ou un frôlement), et DEVANT (≥ 300 m de route plus loin) */
  const H2=new Map(),k2=(a,b)=>a*100003+b;
  for(let i=0;i<NP;i+=3){const p=pts[i],k=k2(Math.floor(p.x/100),Math.floor(p.z/100));let a=H2.get(k);if(!a)H2.set(k,a=[]);a.push(i);}
  const st=Math.max(1,Math.round(14/ds)),PR=[],dMax=Math.max(210,vN*2.2),R2c=Math.ceil(dMax/100); /* (le palier) la portée d'un vol grandit avec la vitesse */
  for(let i=0;i<NP;i+=st){const p=pts[i],cx=Math.floor(p.x/100),cz=Math.floor(p.z/100);let bj=-1,bd=1e9;
    for(let a=-R2c;a<=R2c;a++)for(let b=-R2c;b<=R2c;b++){const l=H2.get(k2(cx+a,cz+b));if(!l)continue;
      for(const j of l){if((j-i)*ds<300)continue;const dy=p.y-pts[j].y;if(dy<25||dy>230)continue;const d=Math.hypot(p.x-pts[j].x,p.z-pts[j].z);if(d<dMax&&d<bd){bd=d;bj=j;}}}
    if(bj>=0)PR.push([i,bj,bd]);}
  const CX=[];{let g=null;const gap=Math.round(90/ds);for(const q of PR){if(g&&q[0]-g.last<=gap){g.last=q[0];if(q[2]<g.rep[2])g.rep=q;}else{g={first:q[0],last:q[0],rep:q};CX.push(g);}}}
  if(tmp9())yield;
  /* 2. le simulateur de vol : une sortie par le bord (côté sd) de la dalle i0, avec le cap de la route braqué de `ag` degrés vers l'extérieur (le joueur qui vise
     le bord), à vm × la vitesse nominale, et un lacet de `w` °/s (le joueur qui suit les fruits) ; rend la première dalle touchée.
     ⚠ MESURÉ en jeu (dbgSentiersPos, deux sauts) : la caisse sortie par le bord ne tombe pas tout de suite — la BASCULE (BASC_T = 0,45 s) installe la gravité
     peu à peu, et la sortie la lance avec un petit POP vers le haut : vitesse verticale de départ ≈ 5,3 m/s + la moitié de la pente de la route × la vitesse ;
     ensuite g = FALL_G × SPD (23 m/s²). La vitesse horizontale est celle de la route (mesurée à ± 3 %). Les fruits sont indicatifs : le joueur a le volant et le pouce. */
  const C3=70,CY=24,G3=new Map(),k3=(a,b,c)=>((a&2047)*2048+(b&2047))*2048+(c&2047); /* cases de 70 m en plan et de 24 m en hauteur (la dalle est mince : peu de points par case) */
  for(let i=0;i<NP;i+=2){const p=pts[i],k=k3(Math.floor(p.x/C3),Math.floor(p.y/CY),Math.floor(p.z/C3));let a=G3.get(k);if(!a)G3.set(k,a=[]);a.push(i);}
  const VC=new Map(),vois=(a,b,c)=>{const k=k3(a,b,c);let o=VC.get(k);if(o)return o;o=[];for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){const l=G3.get(k3(a+x,b+y,c+z));if(l)for(const j of l)o.push(j);}VC.set(k,o);return o;};
  const vol=(i0,sd,vm,ag,w,rec,dv)=>{
    const t0=T[i0],n0=Nn[i0];bA.crossVectors(n0,t0); /* b = n × t, le repère de frameAt */
    let x=pts[i0].x+bA.x*sd*(HALF+.5),y=pts[i0].y+bA.y*sd*(HALF+.5),z=pts[i0].z+bA.z*sd*(HALF+.5);
    const ca=Math.cos(ag*Math.PI/180),sa=Math.sin(ag*Math.PI/180)*sd,x0=x,y0=y,z0=z,dt=1/30,wr=w*Math.PI/180*dt,cw=Math.cos(wr),sw=Math.sin(wr);
    let vx=(t0.x*ca+bA.x*sa)*vN*vm,vy=FOR_SENT.pop+FOR_SENT.pente*t0.y*vN*vm+(dv||0),vz=(t0.z*ca+bA.z*sa)*vN*vm,t=0,dist=0,nx=FOR_SENT.pas;const path=rec?[]:null,hh=Math.hypot(vx,vz)||1,hx=vx/hh,hz=vz/hh;
    while(t<5.6){
      const ox=x,oy=y,oz=z;if(w){const a9=vx*cw-vz*sw;vz=vx*sw+vz*cw;vx=a9;}vy-=G*dt*Math.min(1,t/FOR_SENT.bascule);x+=vx*dt;y+=vy*dt;z+=vz*dt;t+=dt;dist+=Math.hypot(vx,vy,vz)*dt;
      if(rec&&t>=nx){path.push([x,y,z,t]);nx+=FOR_SENT.pas;}
      if(y<y0-215)return null; /* plus bas que toute route à portée */
      const L9=vois(Math.floor(x/C3),Math.floor(y/CY),Math.floor(z/C3));
      for(const j of L9){if(t<.36)continue;const q=pts[j],nj=Nn[j],tj=T[j]; /* (pas de pose avant 0,35 s de vol : voir tryLand) */
        const h=(x-q.x)*nj.x+(y-q.y)*nj.y+(z-q.z)*nj.z,h0=(ox-q.x)*nj.x+(oy-q.y)*nj.y+(oz-q.z)*nj.z;
        if(!(h0>0&&h<=0&&h>-8))continue;
        const dd=(x-q.x)*tj.x+(y-q.y)*tj.y+(z-q.z)*tj.z;if(Math.abs(dd)>tolS)continue;
        bA.crossVectors(nj,tj);const la=(x-q.x)*bA.x+(y-q.y)*bA.y+(z-q.z)*bA.z;if(Math.abs(la)>=HALF)continue;
        if(Math.abs(j-i0)*ds<300)return null; /* elle se repose sur SA route (le virage se referme sous elle) : pas un raccourci */
        const sp=Math.hypot(vx,vy,vz)||1;
        return {j:j,t:t,gain:(j-i0)*ds-dist,cosA:(vx*tj.x+vy*tj.y+vz*tj.z)/sp,lat:la,path:path,p0:[x0,y0,z0],h:[hx,hz]};}}
    return null;};
  /* 3. pour chaque croisement, le meilleur bord, le meilleur braquage (et, au second passage, le meilleur lacet) : avant le croisement (vitesse × 4,8 s au plus), des deux côtés */
  const cand=[],stp=Math.max(1,Math.round(24/ds)),DB={dv:0,cx:CX.length,tests:0,rien:0,gain:0,cos:0,t:0,lat:0,rob:0,fils1:0};FORET.sentDbg=DB;
  const nMax=Math.max(2,Math.min(5,Math.round(L/3200)));FORET.sentVN=Math.round(vN*10)/10;
  const passe=function*(LAC){
    for(const g of CX){if(tmp9())yield;
      const back=Math.ceil(Math.min(2600,vN*5.2)/ds),lo=Math.max(40,g.first-back),hi=Math.min(NP-40,g.last+Math.ceil(40/ds)),stp9=Math.max(stp,Math.ceil((hi-lo)/(LAC.length>1?36:70)));let best=null;
      for(let i0=lo;i0<=hi;i0+=stp9)for(const sd of [-1,1])for(const ag of (LAC.length>1?FOR_SENT.ang2:FOR_SENT.ang))for(const w of LAC){
        if(i0*ds<600||i0*ds>L-1000)continue;if((DB.tests&15)===0&&tmp9())yield;
        const r=vol(i0,sd,1,ag,w,false);DB.tests++;if(!r){DB.rien++;continue;}if(r.gain<FOR_SENT.gainMin){DB.gain++;continue;}if(r.cosA<FOR_SENT.cos){DB.cos++;continue;}if(r.t<1.3||r.t>5.2){DB.t++;continue;}if(Math.abs(r.lat)>FOR_SENT.latMax){DB.lat++;continue;}
        let rob=0;for(const m of [.8,1.4]){const q=vol(i0,sd,m,ag,w,false);if(q&&q.gain>=150&&q.cosA>=.64)rob++;}
        {let ok=true;for(const dv of [-FOR_SENT.dv,FOR_SENT.dv]){const q=vol(i0,sd,1,ag,w,false,dv);if(!q||q.gain<100||q.cosA<.5){ok=false;break;}}if(!ok){DB.dv++;continue;}} /* la vitesse verticale du décollage varie de ± 9 m/s (mesuré) : la pose doit tenir */
        if(rob<FOR_SENT.robMin){DB.rob++;continue;}
        const sc=rob*1000+Math.min(r.gain,4000)/4-Math.abs(r.lat)*8-ag*6-Math.abs(w)*4-(1-r.cosA)*400;if(!best||sc>best.sc)best={i0:i0,sd:sd,ag:ag,w:w,r:r,rob:rob,sc:sc};}
      if(best)cand.push(best);}};
  const choix=()=>{cand.sort((a,b)=>b.sc-a.sc);const ch=[];for(const c of cand){if(ch.length>=nMax)break;if(ch.some(o=>Math.abs(o.i0-c.i0)*ds<FOR_SENT.esp))continue;ch.push(c);}return ch;};
  yield* passe([0]);
  let ch=choix();DB.fils1=ch.length;
  if(ch.length<2){yield* passe(FOR_SENT.lac);ch=choix();} /* le second passage : la trajectoire qui s'infléchit */
  ch.sort((a,b)=>a.i0-b.i0);
  /* 4. le fil de chaque raccourci retenu : les fruits (un sur deux, tous les 0,36 s), le couloir sans arbres (tous les 0,18 s) */
  for(const c of ch){const r=vol(c.i0,c.sd,1,c.ag,c.w,true);if(!r)continue;
    const fr=[];for(let k=1;k<r.path.length;k+=2){if(r.path[k][3]>r.t-.28)break;fr.push([r.path[k][0],r.path[k][1]+1.2,r.path[k][2]]);}
    for(const p of r.path)if(p[3]<r.t-.1)FORET.sentZ.push([p[0],p[2],FOR_SENT.rayon]);
    FORET.sent.push({i0:c.i0,s0:Math.round(c.i0*ds),sd:c.sd,ag:c.ag,w:c.w,p0:r.p0,h:r.h,fr:fr,sL:Math.round(r.j*ds),gain:Math.round(r.gain),t:+r.t.toFixed(2),rob:c.rob,lat:+r.lat.toFixed(1),cos:+r.cosA.toFixed(2)});}
}
/* À la pose des pièces : les fils de la forêt (voir l'en-tête). Les fruits de la ligne d'approche sont de vrais fruits de route ; ceux de la trajectoire sont `air` */
function foretSentiersPose(){
  if(!FOR_SENT.on||PARK.on||BALADE||!FORET.sent||!FORET.sent.length||!(LVL.cur&&LVL.cur.piste==='foret'))return;
  const gros=FOR_SENT.fruits.map(n=>FRUIT_DEFS.findIndex(f=>f.n===n)).filter(i=>i>=0),choisi=()=>gros.length?gros[(Math.random()*gros.length)|0]:fruitPick();
  const UP=new THREE.Vector3(0,1,0);let nS=0,nA=0;
  for(const e of FORET.sent){
    for(let k=0;k<4;k++){const d9=16+k*15,x=e.p0[0]-e.h[0]*d9,z=e.p0[2]-e.h[1]*d9; /* la ligne d'approche : droite vers le point de sortie, dans le cap de sortie — on s'y range avant de sauter */
      const bi=dalleProche(x,e.p0[1],z,2,1e9,-1);if(bi<0)continue;const sp=bi/(NP-1)*L;if(sp<130||enTrou(sp,6))continue;
      const q=pts[bi],nj=Nn[bi],fi=choisi(),lv=fruitLeve(fi),m=mkFruit(fi);frameAt(sp,F);mat4b.makeBasis(F.b,F.n,F.t);
      const y=q.y-(nj.x*(x-q.x)+nj.z*(z-q.z))/Math.max(.3,nj.y); /* le plan de la dalle (le dévers la penche) */
      m.position.set(x,y+lv*nj.y,z);m.quaternion.setFromRotationMatrix(mat4b);m.updateMatrix();m.matrixAutoUpdate=false;scene.add(m);
      pickups.push({s:sp,lat:e.sd*(ROAD_HALF-6),face:1,nitro:true,fruit:fi,mesh:m,taken:false,ax:F.n.clone()});nS++;}
    for(const p of e.fr){const fi=choisi(),m=mkFruit(fi);m.position.set(p[0],p[1],p[2]);m.updateMatrix();m.matrixAutoUpdate=false;scene.add(m);
      const bi=dalleProche(p[0],p[1],p[2],2,1e9,-1);
      pickups.push({s:bi>=0?bi/(NP-1)*L:e.s0,lat:0,face:1,nitro:true,fruit:fi,mesh:m,taken:false,ax:UP.clone(),air:true});nA++;}
    {const sp=Math.min(L-120,e.sL+80);frameAt(sp,F);mat4b.makeBasis(F.b,F.n,F.t); /* à la pose : un fruit-pouvoir au milieu de la route d'arrivée */
      const k=FOR_SENT.pow[(Math.random()*FOR_SENT.pow.length)|0],m=mkPower(k,1),lev=m.userData.lev||2.1;
      m.position.copy(F.p).addScaledVector(F.n,lev);m.quaternion.setFromRotationMatrix(mat4b);m.updateMatrix();m.matrixAutoUpdate=false;scene.add(m);
      pickups.push({s:sp,lat:0,face:1,nitro:false,pow:k,mesh:m,taken:false,ax:F.n.clone()});}
  }
  FORET.sentPose={sol:nS,air:nA};
}
window.dbgSentiers=function(){const a=pickups.filter(p=>p.air);return {on:FOR_SENT.on,fils:(FORET.sent||[]).map(e=>({s0:e.s0,cote:e.sd,ag:e.ag,w:e.w,sL:e.sL,gain:e.gain,t:e.t,rob:e.rob,lat:e.lat,cos:e.cos,fruits:e.fr.length})),pose:FORET.sentPose||null,airPris:a.filter(p=>p.taken).length,air:a.length,couloir:(FORET.sentZ||[]).length,dbg:FORET.sentDbg||null};};
/* banc : `dbgSentiersEssai(k, vm, sgn)` pose la caisse au bord du fil k (le cap braqué de `ag` degrés vers l'extérieur, sgn = ±1 le sens de psi), à vm × la vitesse nominale, et la laisse sortir */
window.dbgSentiersEssai=function(k,vm,sgn){const e=(FORET.sent||[])[k|0];if(!e)return 'pas de fil';if(mode!=='drive'||gameOver)return 'pas en route';
  const v=(FORET.sentVN||90)*(vm||1);window.dbgBord({s:e.s0,lat:0,psi:(sgn||1)*e.sd*e.ag*Math.PI/180,vA:v/SPD,grace:0});window.dbgBord({lat:e.sd*(ROAD_HALF+1.2),vL:0});return {fil:k|0,s0:e.s0,vN:FORET.sentVN,v:+v.toFixed(1),ag:e.ag,w:e.w,prevu:{sL:e.sL,t:e.t}};};
/* banc : la position de la caisse, son temps de vol, sa vitesse verticale, et la distance au fruit en l'air non pris le plus proche ; \`dbgSentiersFr(k)\` rend les fruits du fil k */
window.dbgSentiersPos=function(){let d=1e9,n=0;for(const p of pickups)if(p.air&&!p.taken){const q=p.mesh.position.distanceTo(carGroup.position);if(q<d)d=q;n++;}
  return {m:mode,t:+(fallT||0).toFixed(2),x:+carGroup.position.x.toFixed(1),y:+carGroup.position.y.toFixed(1),z:+carGroup.position.z.toFixed(1),vy:+(fallVel.y||0).toFixed(1),h:String(FORET.heurt||''),over:!!gameOver,dFruit:+d.toFixed(1),restants:n};};
window.dbgSentiersFr=function(k){const e=(FORET.sent||[])[k|0];return e?{yL:pts[Math.max(0,Math.min(NP-1,Math.round(e.sL/L*(NP-1))))].y,sL:e.sL,p0:e.p0,h:e.h,fr:e.fr.map(p=>p.map(v=>+v.toFixed(1)))}:null;};
