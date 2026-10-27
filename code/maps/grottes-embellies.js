/* ===== LES GROTTES EMBELLIES : DES CRISTAUX À TEINTES DANS LES PAROIS (2026-10-24, reprise sur le code d'aujourd'hui de la passe du 20/10 ; Sacha : « amélioration visuelle des maps — ajouter des éléments, améliorer les textures,
   améliorer les lumières ; chaque map un peu plus belle, sans que ce soit trop gourmand pour le téléphone ») =====
   La LUMIÈRE-VEDETTE des Profondeurs : des grappes de cristaux ROSE (#F24AA0, la marque), VIOLET (l'améthyste de la map), AZUR (le froid) et OR MIEL (le cash) qui sortent
   des parois, des voûtes et des sols, loin de la route — les grandes salles en portent de GRANDES (la taille suit la distance : une grappe à 250 m se lit encore) — et
   chacune allume la roche autour d'elle, CUITE aux sommets (une lumière ponctuelle de plus dans les listes des tronçons : aucune lumière three, aucun appel de dessin de plus,
   aucun programme : les formes rejoignent la maille décor de leur tronçon, la matière est celle de la roche — GT 19-22 dans GRT_FS).
   LE HASARD : un flux à part (`mulberry32(seed ^ 0x5C47A1)`) — ni le `rnd` de la piste ni le `fr` des décors d'avant (leurs tirages ne bougent pas d'un cran : la piste, les torches,
   les gemmes, les lianes… restent identiques à l'octet près).
   LA RÈGLE D'OR : une grappe n'est posée que si sa pointe reste à ≥ ROAD_HALF + 16 m de l'axe de la route (`grtLibre` : 36 m d'air au-dessus, 14 m sous la dalle) ;
   elle ne compte pour aucune collision (comme les gemmes) : rien n'a changé pour la physique ni pour la route, quelle que soit sa forme.
   LES PALIERS : `PAL.B.grotteCris` = [0,35 ; 0,65 ; 1] × la part des grappes (le vieux téléphone en porte ~40, le récent ~150) ; `PAL.B.grotteVeine` = [0 ; 1 ; 1] : les filons et l'humidité de la roche
   (grottes-2.js, GRT_FS) ne sont pas calculés sur le vieux téléphone. L'ENTRÉE (la grande salle d'arrivée, rh > 90 m) en porte aussi, rose et or ; la mine, trop étroite, aucune. */
try{Object.assign(PAL.B,{grotteCris:[.35,.65,1],grotteVeine:[0,1,1]});}catch(e){}
const GRT_CRIS_T=[GT.ROSEC,GT.VIOLETC,GT.AZURC,GT.SOLEILC];
const GRT_CRIS_L=[[1,.22,.5],[.55,.25,1],[.2,.55,1],[1,.7,.2]]; // la lumière cuite de chaque teinte (rose, violet, azur, or)
const GRT_CRIS_P=[[.55,0,0,.45],[.40,0,.20,.40],[.25,.55,.20,0],[.40,.30,.30,0],[.50,0,0,.50],[.40,.20,.40,0]]; // la part de chaque teinte par salle (entrée : rose et or ; la mine est écartée plus bas)
const GRT_CRIS_D=[.6,1,1.8,1,.55,1]; // (SUR LES PAROIS) le boyau (la 3e salle) en porte beaucoup plus, violets surtout : l'améthyste reste, la boule non // la densité par salle (la lave a déjà assez de lumière)
function* grtCristauxG(V,R,dec,seed){
  const fe=mulberry32((seed^0x5C47A1)>>>0),D=dec.D,P9=dec.P,RHd=ROAD_HALF,VZ=GRT_VASTE,K9=PAL_B9('grotteCris',1)*(TEL_NATIF?.75:1),UP=[0,1,0],BAS=[0,-1,0];
  let n=0,it=0,acc=0,suiv=30+fe()*40;
  const teinte=function(sal){const p=GRT_CRIS_P[sal];let u=fe(),k=0;for(;k<3&&u>p[k];k++)u-=p[k];return k;};
  const clair=function(x,y,z,L,k){const r=(24+L*.9)*(VZ?1.4:1),c=GRT_CRIS_L[k];P9.push({x:x,y:y,z:z,r:r,r2:r*r,c:c,I:1.7});}; /* (reprise : I .85 → 1,7 — la roche autour d'une grappe rosissait trop peu pour se lire à 150 m dans la brume) */
  /* une grappe : un cristal principal (prisme à cinq pans + pointe) et trois éclats pointus, plantés dans la roche en (bx,by,bz), tournés vers dir (unitaire) */
  const grappe=function(bx,by,bz,dir,L0,r0,k,pro){const t=GRT_CRIS_T[k],L=L0+pro,h=L*.7,rot=fe()*6; /* pro : le PIED ENTERRÉ dans la roche (la grappe sort de la paroi au lieu d'y flotter) */
    grtPrisme(D,V,bx,by,bz,dir,5,r0,r0,h,t,rot,L>9?'roche':0); /* (SUR LES PAROIS) les grosses grappes se touchent : on ne les traverse plus (collision en vol, comme les concrétions) */grtPrisme(D,V,bx+dir[0]*h,by+dir[1]*h,bz+dir[2]*h,dir,5,r0,0,L*.3,t,rot);
    for(let j=0;j<3;j++){ /* trois éclats, nés de la même souche : un petit décalage de la base dans le plan perpendiculaire à l'axe, un axe qui s'écarte de ±0,5 */
      const a=[dir[0]+(fe()-.5)*1.1,dir[1]+(fe()-.5)*1.1,dir[2]+(fe()-.5)*1.1],l=Math.hypot(a[0],a[1],a[2])||1,u=[a[0]/l,a[1]/l,a[2]/l];
      let w=[fe()-.5,fe()-.5,fe()-.5];const pd=w[0]*dir[0]+w[1]*dir[1]+w[2]*dir[2];w=[w[0]-pd*dir[0],w[1]-pd*dir[1],w[2]-pd*dir[2]];const wl=Math.hypot(w[0],w[1],w[2])||1,o=r0*(.5+fe()*1.1)/wl;
      grtPrisme(D,V,bx+w[0]*o,by+w[1]*o,bz+w[2]*o,u,5,r0*.7,0,pro+L0*(.3+fe()*.3),t,fe()*6);}
    n++;};
  for(let q=R.i0+1;q<R.n-20;q++){acc+=R.S[q]-R.S[q-1];const sal=R.SAL[q],dn9=GRT_CRIS_D[sal];if(acc<suiv||!dn9||(sal===0&&R.RH[q]<90))continue;
    acc=0;suiv=(44/Math.max(.05,K9*dn9))*(.6+fe()*.8);if(((++it)&7)===0&&performance.now()>JF.lim)yield;
    const mode=fe(),k=teinte(sal);let ok=false;
    for(let e=0;e<5&&!ok;e++){
      if(mode<.62){ /* la PAROI : on part de la route, on cherche la roche à hauteur y, de côté sd */
        const sd=fe()<.5?-1:1,y=R.Y[q]+(-4+fe()*40),bx=R.TZ[q]*sd,bz=-R.TX[q]*sd,dmax=Math.min(R.RH[q]*1.45,VZ?440:170);let hit=-1;
        for(let dd=RHd+8;dd<dmax;dd+=2)if(grtDensIci(V,R.X[q]+bx*dd,y,R.Z[q]+bz*dd)<=0){hit=dd;break;}
        if(hit<0)continue;const Lmax=hit-.8-(RHd+16);if(Lmax<5)continue;
        const sz=Math.max(1,Math.min(4.2,hit/60)),L=Math.min(Lmax,(5+fe()*7)*sz),r0=L*(.12+fe()*.06),x0=R.X[q]+bx*(hit-.8),z0=R.Z[q]+bz*(hit-.8);
        const a=[-bx+(fe()-.5)*.5,(fe()-.5)*.8,-bz+(fe()-.5)*.5],l=Math.hypot(a[0],a[1],a[2]),u=[a[0]/l,a[1]/l,a[2]/l];
        if(!grtLibre(R,x0+u[0]*L,z0+u[2]*L,y+u[1]*L-3,y+u[1]*L+3,r0+2))continue;
        const pro=r0*1.7+1.5;grappe(x0+bx*(pro+.8),y,z0+bz*(pro+.8),u,L,r0,k,pro);clair(x0-bx*(3+L*.2),y,z0-bz*(3+L*.2),L,k);ok=true;}
      else{ /* la VOÛTE (pendue) ou le SOL (dressée) : de côté, loin de la route */
        const sd=fe()<.5?-1:1,lat=RHd+14+fe()*(VZ?R.RH[q]*.7:90),x=R.X[q]+R.TZ[q]*sd*lat,z=R.Z[q]-R.TX[q]*sd*lat,haut=mode<.8;
        let yb=null;if(haut){let y0=R.Y[q]+8;if(grtDensIci(V,x,y0,z)<=0)continue;for(let yy=y0;yy<y0+(VZ?R.UP[q]*1.5:120);yy+=2)if(grtDensIci(V,x,yy,z)<=0){yb=yy-1;break;}}
        else{let y0=R.Y[q]-THICK-3;if(grtDensIci(V,x,y0,z)<=0)continue;for(let yy=y0;yy>y0-(VZ?R.DN[q]*1.5+20:110);yy-=2)if(grtDensIci(V,x,yy,z)<=0){yb=grtIci(V,x,yy-1,z)===0?yy+1:null;break;}}
        if(yb==null)continue;const sz=Math.max(1,Math.min(3.2,lat/90)),L=(5+fe()*8)*sz,r0=L*(.12+fe()*.06);
        if(!(haut?grtLibre(R,x,z,yb-L,yb,r0*2+2):grtLibre(R,x,z,yb,yb+L,r0*2+2)))continue;
        const pro=r0*1.7+1.5;grappe(x,haut?yb+2+pro:yb-2-pro,z,haut?BAS:UP,L,r0,k,pro);clair(x,haut?yb-L*.4:yb+L*.4,z,L,k);ok=true;}}}
  dec.n.cristauxM=n;}
