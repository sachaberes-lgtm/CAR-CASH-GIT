/* ===== LES RUINES ENSABLÉES (2026-10-26, Léo : « parfois, dans ces milieux-là, il y a du solide… des gens qui font des constructions solides, il y en a pas mal d'insolites… je veux vraiment un peu l'immensité, un effet d'immensité ») =====
   Ce que le désert n'avait pas : de la pierre que le sable AVALE. Des sites de 1 à 4 pièces, semés tout le long de la route à 40-900 m de son bord (≈ un par 700 m, le 1er tôt, visible dès le départ) : un PAN DE MUR à créneaux brisés,
   une RANGÉE DE COLONNES tronquées (les fûts sortent à des hauteurs différentes, un chapiteau d'or sur le plus grand), une ARCHE dont la clé est tombée, un ESCALIER de temple qui plonge sous la dune (deux pylônes au sommet), un CHAPITEAU
   couché (un fût de papyrus), une TÊTE de colosse qui regarde le ciel (les têtes d'animaux de dunes-dieux.js), un OBÉLISQUE couché, la pointe sous le sable — et des blocs tombés. Chaque pièce est ENFONCÉE de 30 à 70 % de sa hauteur dans le sable (le sol est lu sous toute
   l'emprise : jamais de coin qui flotte : la base inclinée est comparée au sable sur 25 points), inclinée comme la pente, jamais dans l'eau ni sur la route. Le site se choisit parmi jusqu'à 48 emplacements (on s'arrête à 9 visibles) : il faut qu'on le VOIE (un rayon part de la route, avant le site et à sa hauteur : le relief ne doit pas le cacher) et on préfère
   les CREUX entre les dunes ; plus il est loin, plus il est grand (jusqu'à 5,6 ×, un mur de 60 m : l'immensité), plus il est seul. Même matière que tous les décors (assises, gravure : DN_AFS), tout CUIT dans la géométrie du décor tiré (dnCuiseur) : 0 appel de dessin de plus, 0 programme de plus,
   ≤ 8 000 triangles (`PAL.B.dnRuinesEns` = la part du budget par palier). Son hasard est LOCAL, né du tracé (comme dnEmbellir) : rien dans `rnd` ni dans le tirage du décor. `?sans=dunesruines` = sans elles. Console : `dbgRuines()` (la liste des sites), `dbgRuines('vue', n, recul, haut, cap)`,
   `dbgDunes('galerie', s, ['ruMur','ruColonnes','ruArche','ruEscalier','ruChapiteau'])` (les modèles). */
const DN_RUE={on:!/[?&]sans=([^&]*,)?dunesruines(,|&|$)/.test(location.search)};
PAL.B.dnRuinesEns=[.45,.75,1];if(DN_MOB)PAL.B.dnRuinesEns[2]=PAL.B.dnRuinesEns[1]; /* la part du budget (8 000 triangles) : [ancien, moyen, récent] — le téléphone reste au palier moyen */
Object.assign(DN_MOD,{
  /* LE PAN DE MUR (long 25, épais 3, haut ≤ 10,7, x = la longueur) : un soubassement, huit tronçons dont la crête est brisée à des hauteurs différentes, quelques créneaux, deux meurtrières, une frise de lapis, un panneau gravé */
  ruMur:function(){const g=dnKit(61),C=DN_COL,Hs=[9.6,8.2,5.4,7.8,3.6,6.4,2.4,4.8];g.box(0,0,0,25.6,1.1,4.1,C.gres2,1,1);
    Hs.forEach(function(h,i){const x=-10.5+i*3,ox=((i%3)-1)*.35;g.frus(x,1.1,0,2.98,3,2.62,2.46,h,i%3===1?C.gres2:C.gres,1,ox,0,0,.06);
      if(i===0||i===1||i===3)for(const d of [-.85,.85])g.box(x+ox+d,1.1+h,0,1.1,1.3,2.1,C.gres,1,0);
      if(i===3||i===5)for(const sz of [-1,1])g.box(x,1.1+h*.55,sz*1.36,.7,2,.14,C.noir,0,0);});
    for(const sz of [-1,1]){g.box(-9,6.1,sz*1.36,6,.55,.14,C.lapis,3,0);g.box(-9,6.75,sz*1.36,6,.12,.15,C.or,3,0);g.box(-7.5,2,sz*1.46,4.6,2.2,.14,C.gres,4,0);}return g.fin();},
  /* LES COLONNES (cinq fûts sur un stylobate, 31 × 7,6 : de 2 à 14 m, des tambours décalés, un chapiteau à collier d'or sur le plus grand, un tambour et un architrave à terre) */
  ruColonnes:function(){const g=dnKit(62),C=DN_COL,r=1.5,X=[-12,-6,0,6,12],Hh=[9.2,7.4,4,9.4,2];g.box(0,0,0,31,1,7.6,C.gres2,1,1);g.box(0,1,0,29.2,.5,6.2,C.gres,1,0);
    X.forEach(function(x,i){const h=Hh[i],nd=Math.max(1,Math.round(h/4.5)),dh=h/nd;
      for(let k=0;k<nd;k++){const sh=k?((i+k)%2?.16:-.14):0;g.cyl(x+sh,1.5+k*dh,sh*.6,r*(k?1-.05*k:1.16),r*(1-.05*(k+1)),dh,8,k&1?C.gres2:C.gres,1,(i+k)*.4);}
      if(i===0){const y=1.5+h;g.lathe(x,0,[[.84*r,y],[1.2*r,y+.7],[1.7*r,y+1.9],[1.5*r,y+2.9]],8,[C.gres,C.cre],1);g.box(x,y+2.9,0,4.4,.8,4.4,C.gres2,1,0);g.cyl(x,y-.1,0,.92*r,.92*r,.5,8,C.or,3,0);}});
    g.push();g.T(4.5,r,5.6);g.Ry(.5);g.Rz(Math.PI/2);g.cyl(0,-2,0,r*1.02,r*.98,4,8,C.gres,1,0,1);g.pop();g.push();g.T(-8,.4,-5.5);g.Ry(.9);g.Rz(.14);g.box(0,0,0,9,1.6,2.4,C.gres2,1,1);g.pop();return g.fin();},
  /* L'ARCHE (large 15, épaisse 3,2, haute 11,6, face à +z) : deux piédroits à bandes de lapis, des voussoirs (la clé a disparu : 7 à 9 manquent), deux claveaux tombés devant */
  ruArche:function(){const g=dnKit(63),C=DN_COL,ri=3.9,ro=6.2,sp=5.4,T=1.6,N=12;g.box(0,0,0,15.2,.7,5.4,C.gres2,1,1);
    for(const sx of [-1,1]){g.box(sx*5.05,.7,0,2.3,sp-.7,3.2,C.gres,1,0);for(const sz of [-1,1]){g.box(sx*5.05,3.1,sz*1.6,2.3,.4,.14,C.lapis,3,0);g.box(sx*5.05,3.55,sz*1.6,2.3,.1,.15,C.or,3,0);}}
    g.push();g.Rx(Math.PI/2); /* le plan (x, y) de l'arche devient le plan (x, −z) du prisme : l'épaisseur est l'axe local y */
    for(let j=0;j<N;j++){if(j>=7&&j<=9)continue;const a0=Math.PI-j*Math.PI/N,a1=Math.PI-(j+1)*Math.PI/N,P=(a,rr)=>[Math.cos(a)*rr,-(sp+Math.sin(a)*rr)];g.ext([P(a0,ri),P(a0,ro),P(a1,ro),P(a1,ri)],-T,T,j&1?C.gres2:C.gres,1,.04);}
    g.pop();g.push();g.T(-1.5,0,3.4);g.Ry(.5);g.Rz(.2);g.box(0,0,0,4.6,1.9,3.2,C.gres,1,1);g.pop();g.push();g.T(2.6,0,-3.3);g.Ry(-.4);g.box(0,0,0,3.6,1.7,3,C.gres2,1,1);g.pop();return g.fin();},
  /* L'ESCALIER (large 13, long 28,5 centré, haut 17 ; il MONTE vers +z) : neuf marches, deux joues, une terrasse, deux pylônes brisés d'inégale hauteur à bande de lapis, une baie de 6,6 m entre eux */
  ruEscalier:function(){const g=dnKit(64),C=DN_COL,N=9,rise=1.05,run=2.5,w=13,Lz=N*run,hT=N*rise;g.T(0,0,-(Lz+6)/2);
    for(let i=0;i<N;i++)g.box(0,0,i*run+run/2,w,(i+1)*rise,run,i&1?C.gres:C.gres2,1,0);
    g.push();g.Ry(Math.PI/2);g.Rx(Math.PI/2); /* le plan (z, y) de la joue : x_local = −z, z_local = −y, l'épaisseur = l'axe local y = le monde x */
    for(const sx of [-1,1]){const x0=sx*(w/2+.7);g.ext([[0,0],[-Lz,0],[-Lz,-(hT+1.5)],[0,-(rise+1.5)]],x0-.7,x0+.7,C.gres2,1,.05);}g.pop();
    g.box(0,0,Lz+3,w+2.8,hT,6,C.gres2,1,0);
    for(const sx of [-1,1]){g.frus(sx*5.5,hT,Lz+3,4.4,4.4,3.7,3.6,sx<0?7.5:4.2,C.gres,1,sx*.3,0,0,.06);g.box(sx*5.5,hT+2.6,Lz+.73,3.9,.5,.14,C.lapis,3,0);}return g.fin();},
  /* LE CHAPITEAU COUCHÉ (long ~14) : un fût de colonne de papyrus tombé sur le flanc, le collier d'or, le bouton, l'abaque ; un tambour à côté */
  ruChapiteau:function(){const g=dnKit(65),C=DN_COL,r=2.3;g.T(-1.9,0,0);g.push();g.T(-5.4,3.5,0);g.Rz(-Math.PI/2);g.cyl(0,0,0,.86*r,.84*r,7,10,C.gres,1,0,0);g.cyl(0,6.6,0,.92*r,.92*r,.5,10,C.or,3,0);
    g.lathe(0,0,[[.86*r,7],[1.12*r,7.7],[1.5*r,8.9],[1.38*r,10.4],[1.1*r,10.7]],10,[C.gres,C.cre],1);g.box(0,10.7,0,6.6,.9,6.6,C.gres2,1,0);g.pop();
    g.push();g.T(7.5,1.8,5);g.Ry(.7);g.Rz(Math.PI/2);g.cyl(0,-1.7,0,1.8,1.8,3.4,10,C.gres,1,0,1);g.pop();return g.fin();}});
Object.assign(DN_ECH,{ruMur:1,ruColonnes:1,ruArche:1,ruEscalier:1,ruChapiteau:1});
/* LES PIÈCES : le modèle, la demi-emprise (x, z) et la hauteur (en unités du modèle), la part enterrée [min, max] (de la hauteur), `tk` : combien la pièce suit la pente du sable (0 : à plat, 1 : parallèle) */
const DN_RUP={mur:{m:'ruMur',hx:12.8,hz:2.2,H:10.7,f:[.38,.62],tk:.35},col:{m:'ruColonnes',hx:15.5,hz:3.8,H:14.4,f:[.3,.55],tk:.4},arc:{m:'ruArche',hx:7.6,hz:5,H:11.6,f:[.3,.5],tk:.4},
  esc:{m:'ruEscalier',hx:7.8,hz:14.3,H:16.5,f:[.3,.5],tk:.8},cha:{m:'ruChapiteau',hx:7.3,hz:4.4,H:7,f:[.3,.6],tk:.5},tet:{m:null,u:7,hx:.75,hz:.75,H:1.35,f:[.35,.55],tk:.3},obe:{m:'obelisque',u:.42,hx:9.2,hz:32,H:9.2,f:[-.05,.25],tk:.8}};
function dnRuinesEns(X){
  DN.ruEns=null;if(!DN_RUE.on||!DN.S||!DN.Z)return;X=X||{};const t0=performance.now(),S=DN.S,RH=ROAD_HALF,Ks=Math.min(1.25,Math.sqrt(lvPiste())),L9=(S.n-1)*S.ds,mult=PAL.b('dnRuinesEns',1),propre=!X.CU,CU=X.CU||dnCuiseur(),v0=CU.n(),
    capT=Math.round(8000*mult),nS=Math.max(4,Math.min(Math.round(L9/700*mult),Math.floor(capT/640))),o9={},o1={},o2={},
    mt=new THREE.Matrix4(),q9=new THREE.Quaternion(),e9=new THREE.Euler(0,0,0,'YXZ'),v9=new THREE.Vector3(),s9=new THREE.Vector3(),PI=Math.PI;
  let h9=0x7F4A7C15;for(const i of [S.n>>3,S.n>>1,(S.n*7)>>3]){h9=Math.imul(h9^Math.round(S.x[i]*8),0x85EBCA6B);h9=Math.imul(h9^Math.round(S.z[i]*8),0xC2B2AE35);}
  const r=mulberry32((h9>>>0)^0x2B07E1); /* le hasard des ruines : né du TRACÉ (trois points de la route), jamais du hasard de la piste ni du tirage du décor */
  const dmin=(x,z)=>{let b=1e18;for(let i=0;i<S.n;i+=2){const dx=S.x[i]-x,dz=S.z[i]-z,d=dx*dx+dz*dz;if(d<b)b=d;}return Math.sqrt(b);};
  const dessous=(x,z,lat,y)=>{for(let i=0;i<S.n;i+=2){const dx=S.x[i]-x,dz=S.z[i]-z;if(dx*dx+dz*dz<lat*lat&&y>S.y[i]-THICK-60)return true;}return false;}; /* un étage de la route (la piste repasse sur elle-même) trop près et pas loin dessous : comme dnPresRoute, sans le test des buttes (la butte vraie est lue à sa vraie distance) */
  const placed=[],pos=[],rj={butte:0,dalle:0,eau:0,pente:0,route:0,libre:0,vue:0,ok:0}; /* les emprises déjà posées par les ruines (x, z, rayon) : on ne les chevauche pas */
  const libre=(x,z,rad)=>{for(const p of DN.pyrs||[])if(Math.hypot(p.x-x,p.z-z)<p.hw*1.5+rad+30)return false;for(const m of DN.mo||[])if(Math.hypot(m.x-x,m.z-z)<m.r+rad+25)return false;for(const b of DN.ob||[])if(Math.hypot(b.x-x,b.z-z)<b.r*2+rad+12)return false;
    for(const v of DN.scnV||[])if(Math.hypot(v.x-x,v.z-z)<v.r+rad+20)return false;for(const c of DN.tor||[])if(Math.hypot(c.x-x,c.z-z)<rad+60)return false;for(const c of DN.car||[])if(Math.hypot(c.x-x,c.z-z)<rad+90)return false;
    if(DN.oa&&Math.hypot(DN.oa.x-x,DN.oa.z-z)<DN.oa.r*1.35+rad+25)return false;for(const p of placed)if(Math.hypot(p[0]-x,p[1]-z)<(p[2]+rad)*.72+4)return false;return true;};
  /* le sol sous l'emprise (3 × 3 points, tournés avec la pièce) : le plus bas, la moyenne, les deux pentes (le long de x et de z locaux) ; null si de l'eau */
  const sol=(P,x,z,ry,s)=>{const ca=Math.cos(ry),sa=Math.sin(ry),hx=P.hx*s,hz=P.hz*s,H=[[0,0,0],[0,0,0],[0,0,0]];let lo=1e9,hi=-1e9,sm=0;
    for(let a=0;a<3;a++)for(let b=0;b<3;b++){const lx=(a-1)*hx,lz=(b-1)*hz,h=dnHauteur(x+lx*ca+lz*sa,z-lx*sa+lz*ca,o9);if(o9.eau)return null;H[a][b]=h;lo=Math.min(lo,h);hi=Math.max(hi,h);sm+=h;}
    return {lo:lo,hi:hi,hm:sm/9,gx:((H[2][0]+H[2][1]+H[2][2])-(H[0][0]+H[0][1]+H[0][2]))/(6*hx),gz:((H[0][2]+H[1][2]+H[2][2])-(H[0][0]+H[1][0]+H[2][0]))/(6*hz)};};
  /* le PLAN d'une pièce (rien n'est encore posé) : sa place, son enfoncement (au moins de quoi cacher le coin que la pente découvre), ses inclinaisons ; null si elle ne tient pas (eau, route, monument, trop pentu) */
  const plan=(kd,x,z,ry,s,ex)=>{const P=DN_RUP[kd];s*=P.u||1;const rad=Math.hypot(P.hx,P.hz)*s,g=sol(P,x,z,ry,s);if(!g){rj.eau++;return null;}ex=ex||{};
    let enf=(P.f[0]+(P.f[1]-P.f[0])*r())*P.H*s;const need=(1-P.tk)*(Math.abs(g.gx)*P.hx*s+Math.abs(g.gz)*P.hz*s)+1.3;if(enf<need)enf=need;if(enf>.8*P.H*s||Math.hypot(g.gx,g.gz)>.36||g.hi-g.lo>.9*P.H*s){rj.pente++;return null;}
    const dr=dmin(x,z);if(dnMesa(x,z,dr)>1.5){rj.butte++;return null;}if(dr<RH+rad*.6+20){rj.route++;return null;}if(dessous(x,z,RH+rad*.62+12,g.hm+P.H*s)){rj.dalle++;return null;}if(!libre(x,z,rad)){rj.libre++;return null;}
    const cl=(v,m)=>Math.max(-m,Math.min(m,v)),tx=(ex.tx0||0)+cl(-g.gz*P.tk,.45),tz=(ex.tz0||0)+cl(g.gx*P.tk,.45);
    if(kd!=='obe'){ /* le plan de la base, incliné comme la pièce, contre le sable sur une grille 5 × 5 : tout coin qui flotterait est enterré (+0,4 m) */
      e9.set(tx,ry,tz);let fl=-1e9;for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){v9.set(a/2*P.hx,0,b/2*P.hz).applyEuler(e9).multiplyScalar(s);const h=dnHauteur(x+v9.x,z+v9.z,o9);if(o9.eau){rj.eau++;return null;}fl=Math.max(fl,g.hm-enf+v9.y-h);}
      if(fl>-.4){enf+=fl+.4;if(enf>.8*P.H*s){rj.pente++;return null;}}}
    return {kd:kd,x:x,z:z,y:g.hm-enf,ry:ry,s:s,rad:rad,vis:P.H*s-enf,tx:tx,tz:tz,hm:g.hm};};
  const teinte=()=>[.92+.14*r(),.92+.14*r(),.92+.14*r()];
  const mettre=pl=>{if((CU.n()-v0)/3>capT)return false;const P=DN_RUP[pl.kd],geo=pl.kd==='tet'?dnMod(dnTeteNom({x:pl.x,z:pl.z})):dnMod(P.m);
    e9.set(pl.tx,pl.ry,pl.tz);q9.setFromEuler(e9);mt.compose(v9.set(pl.x,pl.y,pl.z),q9,s9.set(pl.s,pl.s,pl.s));CU.ajoute(geo,mt,teinte());placed.push([pl.x,pl.z,pl.rad]);pos.push({k:pl.kd,x:Math.round(pl.x),y:+pl.y.toFixed(2),z:Math.round(pl.z),s:+pl.s.toFixed(3),vis:Math.round(pl.vis),ry:pl.ry,tx:pl.tx,tz:pl.tz});return true;};
  /* LES BLOCS tombés : de gros cubes de pierre à moitié dans le sable, autour d'une pièce */
  const blocs=(cx,cz,rad,s,n)=>{for(let k=0;k<n;k++){const an=r()*6.2832,d=rad*(.7+r()*.7),x=cx+Math.sin(an)*d,z=cz+Math.cos(an)*d,w=s*(1.3+r()*2.2),h=w*(.5+.5*r()),dp=w*(.7+.6*r()),g=dnHauteur(x,z,o9);
      if(o9.eau||dmin(x,z)<RH+w+18||dnPresRoute(x,z,RH+w+10,g+h)||!libre(x,z,w))continue;if((CU.n()-v0)/3>capT)return;
      e9.set((r()-.5)*.5,r()*6.28,(r()-.5)*.5);q9.setFromEuler(e9);mt.compose(v9.set(x,g-h*.4,z),q9,s9.set(w,h,dp));CU.ajoute(dnMod('bloc'),mt,[.88*(.94+.12*r()),.76*(.94+.12*r()),.58*(.94+.12*r())]);placed.push([x,z,w*.8]);}};
  /* la LIGNE DE VUE : d'un point de la route (l'œil de la caméra de poursuite : 3,5 m au-dessus de la dalle, à 14 m de l'axe du côté du site — on roule souvent près du bord) au haut de la pièce — ni la dalle elle-même (elle cache tout ce qui plonge de plus de quelques degrés au-delà de son bord) ni le relief ne doivent la couper */
  const voit=(ei,x,z,yt,sg)=>{const ex=S.x[ei]-S.tz[ei]*sg*14,ey=S.y[ei]+3.5,ez=S.z[ei]+S.tx[ei]*sg*14,d=Math.hypot(x-ex,z-ez),n=Math.max(2,Math.ceil(d/14)),ux=(x-ex)/d,uz=(z-ez)/d;
    for(let t=8;t<Math.min(d,110);t+=8){const px=ex+ux*t,pz=ez+uz*t,py=ey+(yt-ey)*t/d;let bj=-1,bd=1e18;for(let j=Math.max(0,ei-40);j<Math.min(S.n,ei+40);j++){const dx=S.x[j]-px,dz=S.z[j]-pz,q=dx*dx+dz*dz;if(q<bd){bd=q;bj=j;}}if(bd<RH*RH&&py<S.y[bj]+.5)return false;}
    for(let q=1;q<n*.92;q++){const t=q/n,h=dnHauteur(ex+(x-ex)*t,ez+(z-ez)*t,o1);if(h>ey+(yt-ey)*t-.5)return false;}return true;};
  const poids=(L9a)=>{let t=0;for(const e of L9a)t+=e[1];let u=r()*t;for(const e of L9a){u-=e[1];if(u<=0)return e[0];}return L9a[0][0];};
  const step=(L9-380-420)/Math.max(1,nS-1);let nP=0;const sites=[];
  for(let k=0;k<nS;k++){
    const sB=k?380+(k-1+r()*.8)*step:90+r()*300;let best=null,nOk=0;
    for(let pass=0;pass<(k?1:2)&&!best;pass++)for(let e=0;e<48;e++){ /* le 1er site : s'il n'y a rien de visible, on prend le meilleur emplacement quand même (2e passe) */
      const s0=Math.max(40,Math.min(L9-320,sB+(k?(r()-.5)*300:0))),i=Math.max(0,Math.min(S.n-1,Math.round(s0/S.ds))),sg=r()<.5?-1:1,u=r(),lat0=k===0?(u<.5?110+r()*150:260+r()*170):u<.5?42+r()*190:u<.85?230+r()*300:520+r()*380;
      const x=S.x[i]-S.tz[i]*sg*(RH+lat0),z=S.z[i]+S.tx[i]*sg*(RH+lat0),ar=Math.atan2(S.x[i]-x,S.z[i]-z),far=lat0>260,ia=Math.max(0,i-Math.round(130/S.ds)),dd=Math.hypot(x-S.x[ia],z-S.z[ia],dnHauteur(x,z,o1)-S.y[ia]),
        ss=Ks*Math.max(1,Math.min(5.6,.9+dd/(78+40*r())));
      const kd=poids(far?[['arc',3],['mur',2.2],['col',2.4],['esc',1.4],['tet',1],['obe',1.1],['cha',.3]]:[['mur',3],['col',2.4],['arc',2],['esc',1.4],['tet',1.3],['cha',.9],['obe',1.2]]);
      const gx=dnHauteur(x+6,z,o1)-dnHauteur(x-6,z,o2),gz=(dnHauteur(x,z+6,o1)-dnHauteur(x,z-6,o2)),gl=Math.hypot(gx,gz)/12; /* la pente du sable (le sens de la descente : −gradient) */
      let ry=ar+(r()-.5)*.7,ex={};
      if(kd==='esc'||kd==='obe')ry=gl>.08?Math.atan2(-gx,-gz)+(r()-.5)*.5:ar+(r()<.5?1:-1)*PI/2+(r()-.5)*.4; /* l'escalier descend dans le sable, l'obélisque couché a la pointe en bas */
      if(kd==='obe')ex.tx0=PI/2+.08+.1*r();if(kd==='tet'){ex.tx0=-(.25+.35*r());ex.tz0=(r()-.5)*.4;}
      const pl=plan(kd,x,z,ry,kd==='esc'?Math.min(ss,2.3):ss,ex);if(!pl)continue;
      const yt=pl.y+(kd==='obe'?P9H(pl):DN_RUP[kd].H*pl.s*.8),va=voit(ia,x,z,yt,sg),vb=voit(i,x,z,yt,sg),ic=Math.max(0,i-Math.round(330/S.ds)),vc=voit(ic,x,z,yt,sg),vis=(va?1:0)+(vb?1:0)+(vc?1:0);if(!vis&&!pass){rj.vue++;continue;}rj.ok++;nOk++;nOk++;
      const bx=x-S.x[ic],bz=z-S.z[ic],fwd=(bx*S.tx[ic]+bz*S.tz[ic])/(Math.hypot(bx,bz)||1)>.72&&vc,sc=vis*1.4+(fwd?1.6:0)+r()*.6+(pl.vis>6*Ks?.4:0);if(!best||sc>best.sc)best={sc:sc,pl:pl,i:i,lat:lat0,far:far,ss:ss,ry:ry,dd:dd};if(nOk>=(DN_MOB?6:9))break;}
    if(!best)continue;
    if(!mettre(best.pl))break;nP++;const b=best;let np=1;
    /* les COMPAGNONS (le site fait 1 à 4 pièces : plus il est loin, plus il est seul) et les blocs tombés */
    const ne=b.far?(r()<.3?1:0):(r()<.3?1:r()<.7?2:3);
    for(let q=0;q<ne;q++){const kd2=poids([['mur',2],['col',2],['cha',1.6],['tet',1.2],['arc',1.2],['esc',.8]]),s2=b.ss*(.55+.4*r()),P2=DN_RUP[kd2],rad2=Math.hypot(P2.hx,P2.hz)*s2*(P2.u||1),ex2={};if(kd2==='tet'){ex2.tx0=-(.25+.35*r());ex2.tz0=(r()-.5)*.4;}
      for(let t=0;t<4;t++){const an=r()*6.2832,d=(b.pl.rad+rad2)*.8+4*b.ss,x2=b.pl.x+Math.sin(an)*d,z2=b.pl.z+Math.cos(an)*d,pl2=plan(kd2,x2,z2,b.ry+(r()-.5)*.8+(r()<.3?PI:0),s2,ex2);if(pl2){if(mettre(pl2))np++;break;}}}
    blocs(b.pl.x,b.pl.z,b.pl.rad,b.ss,b.far?1+((r()*2)|0):2+((r()*3)|0));
    sites.push({k:b.pl.kd,s:Math.round(b.i*S.ds),lat:Math.round(b.lat),dd:Math.round(b.dd),dy:Math.round(S.y[b.i]-b.pl.hm),x:Math.round(b.pl.x),z:Math.round(b.pl.z),pieces:np,s_:+b.ss.toFixed(2)});}
  if(propre&&CU.n()>v0){const g=CU.fin(),im=new THREE.InstancedMesh(g,dnMats().t,1);im.setMatrixAt(0,mt.identity());im.instanceMatrix.needsUpdate=true;im.matrixAutoUpdate=false;im.updateMatrix();im.frustumCulled=false;im.userData.jeter=1;im.name='dunes ruines ensablées';DN.grp.add(im);}
  const tris=Math.round((CU.n()-v0)/3);DN.ruEns={sites:sites,rj:rj,L:Math.round(L9),nS:nS,pieces:pos,tris:tris,ms:+(performance.now()-t0).toFixed(1),cap:capT};if(X.N)X.N.ruinesEns=sites.length+'/'+pos.length+'/'+tris+'t';}
function P9H(pl){return DN_RUP.obe.H*pl.s;} /* la hauteur visée d'un obélisque couché : son demi-socle */
window.dbgRuines=function(k,a,b,c,d){
  const cam9=(P,T,f)=>{DN.ruCam=[P.map(Math.round),T.map(Math.round),f];return window.dbgDunes('cam',P,T,f);}; /* (banc) la caméra posée est gardée : `dbgRuines('derniere')` la rend (pour refaire la MÊME prise sans les ruines) */
  if(k==='derniere')return DN.ruCam||null;
  if(k==='route'){const R=DN.ruEns;if(!R||!R.sites.length)return 'pas de ruines';const q=R.sites[Math.max(0,Math.min(R.sites.length-1,a|0))],S=DN.S,i=Math.max(0,Math.min(S.n-1,Math.round((q.s-(b==null?150:b))/S.ds))); /* (banc) ce que voit la caisse : l'œil à 3,5 m au-dessus de la dalle, à 14 m de l'axe du côté du site, `b` m (150) avant l'abscisse du site, le regard sur lui */
    const sg=((q.x-S.x[i])*-S.tz[i]+(q.z-S.z[i])*S.tx[i])<0?-1:1;return cam9([S.x[i]-S.tz[i]*sg*14,S.y[i]+(d==null?3.5:d),S.z[i]+S.tx[i]*sg*14],[q.x,dnHauteur(q.x,q.z)+6*q.s_,q.z],c||62);}
  if(k==='pres'){const R=DN.ruEns,q=R&&R.pieces[typeof a==='string'?R.pieces.findIndex(function(p){return p.k===a;}):a|0];if(!q)return 'pas de pièce'; /* (banc) la caméra près d'une pièce (n° ou genre) : `b` × sa taille de recul (4), `c` m de haut au moins (6), cap de `d` degrés autour d'elle (0 : du côté de la route) */
    const S=DN.S;let bi=0,bd=1e18;for(let i=0;i<S.n;i+=2){const dx=S.x[i]-q.x,dz=S.z[i]-q.z,w=dx*dx+dz*dz;if(w<bd){bd=w;bi=i;}}
    const l=Math.sqrt(bd)||1,cp=((d||0)*Math.PI/180),ux=(S.x[bi]-q.x)/l,uz=(S.z[bi]-q.z)/l,vx=ux*Math.cos(cp)-uz*Math.sin(cp),vz=uz*Math.cos(cp)+ux*Math.sin(cp),rc=(b==null?4:b)*q.s*(q.k==='tet'?1:10),ex=q.x+vx*rc,ez=q.z+vz*rc,h0=dnHauteur(ex,ez),h1=dnHauteur(q.x,q.z);
    return cam9([ex,Math.max(h0+(c==null?6:c),h1+q.s*(q.k==='tet'?.9:3)),ez],[q.x,h1+q.s*(q.k==='tet'?.9:4),q.z],arguments[5]||60);}
  if(k==='vue'){const R=DN.ruEns;if(!R||!R.sites.length)return 'pas de ruines';const q=R.sites[Math.max(0,Math.min(R.sites.length-1,a|0))],S=DN.S,i=Math.max(0,Math.min(S.n-1,Math.round(q.s/S.ds))); /* (banc) la caméra à `b` m (200) du site, côté route, à `c` m de haut (+ la hauteur du sable), cap tourné de `d` degrés */
    const dx=S.x[i]-q.x,dz=S.z[i]-q.z,l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l,cp=((d||0)*Math.PI/180),cs=Math.cos(cp),sn=Math.sin(cp),vx=ux*cs-uz*sn,vz=uz*cs+ux*sn,rc=b==null?200:b,ex=q.x+vx*rc,ez=q.z+vz*rc,h0=dnHauteur(ex,ez),h1=dnHauteur(q.x,q.z);
    return cam9([ex,Math.max(h0+(c==null?6:c),h1+4),ez],[q.x,h1+8,q.z],arguments[5]||55);}
  if(k==='audit'){const R=DN.ruEns;if(!R)return 'pas de ruines'; /* (banc) le FLOTTEMENT de chaque pièce : le plan de sa base (incliné comme elle) contre le sable, sur une grille 7 × 7 de son emprise — `flotte` > 0 : un coin de la base est AU-DESSUS du sable (un vide visible), `<= 0` : tout est enterré */
    const e=new THREE.Euler(0,0,0,'YXZ'),v=new THREE.Vector3(),o={},out=[];let pire=-1e9;for(const q of R.pieces){const P=DN_RUP[q.k],hx=P.hx*q.s,hz=P.hz*q.s;e.set(q.tx,q.ry,q.tz);let f=-1e9;
      for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){v.set(a/3*P.hx,0,b/3*P.hz).applyEuler(e).multiplyScalar(q.s*(P.u?1:1)).add(new THREE.Vector3(q.x,q.y,q.z));f=Math.max(f,v.y-dnHauteur(v.x,v.z,o));}
      out.push({k:q.k,flotte:+f.toFixed(1)});pire=Math.max(pire,f);}return {pire:+pire.toFixed(1),pieces:out};}
  const R=DN.ruEns;return R?{sites:R.sites.length,pieces:R.pieces.length,tris:R.tris,ms:R.ms,cap:R.cap,L:R.L,nS:R.nS,rj:R.rj,liste:R.sites,pieces:R.pieces}:'pas de ruines';};
