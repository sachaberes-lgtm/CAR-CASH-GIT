/* ---------------- LES DÉCORS ET LEURS LUMIÈRES (des formes low-poly, la DA des autres maps) ----------------
   · LA MINE : un CADRE de bois tous les 32 m (deux poteaux, la poutre à 28 m, les corbeaux), une torche sur un poteau sur deux, en quinconce ;
   · LES TORCHES (toutes les salles, une tous les ~42 m, en quinconce) : sur la paroi la plus proche (≤ 96 m du bord de la route), sinon
     plantées au sol au bord de la route — le chemin que quelqu'un a déjà exploré ; la salle de lave n'en a qu'une sur deux ;
   · LES GEMMES : des grappes de DIAMANTS (bleu) et d'OR dans les parois, près de la route — elles luisent : c'est CASH CAR ;
   · LA GROTTE LUXURIANTE : des LIANES aux BAIES qui luisent pendues à la voûte (chacune une lumière orange), des AZALÉES fleuries sur la mousse ;
   · LE BOYAU : des grappes de CRISTAUX violets, roses et azur (grottes-embellies.js) qui sortent de ses parois — (2026-10-25) la géode est partie ;
   · LES STALACTITES : des CONCRÉTIONS en cônes à six pans, pendues ou dressées ;
   · LE LAC DE LAVE : des CHUTES DE LAVE de la voûte au lac (trois lumières chacune) ;
   · LES ABYSSES : des CAPTEURS de sculk (leurs vrilles battent en cyan), les PILIERS d'ardoise d'une cité oubliée et leur feu d'âme bleu.
   Rien ne touche la route : chaque décor passe `grtLibre` (36 m d'air au-dessus d'elle, 14 m sous la dalle — le « dessus » étant celui de la DALLE, qui roule sur les parois). */
function* grtDecorsG(V,R,fr,MOB){ /* (2026-10-31, passe perf mobile) un générateur : rendez-vous JF.lim entre les familles de décors et dans leurs boucles (d'un bloc : 34-47 ms ×4 au pré-bâti) ; d'un trait, le même tirage au bit près */const D=new Map(),T9=[],P9=[],B=V.B,b=R.bornes,RHd=ROAD_HALF,UP=[0,1,0],BAS=[0,-1,0],VZ=GRT_VASTE; // VZ : LA GROTTE VASTE (19/10) — les décors à l'échelle des salles
  GROTTE.col={G:new Map(),n:0};const nb={};
  const lum=function(x,y,z,r,c,I){P9.push({x:x,y:y,z:z,r:r,r2:r*r,c:c,I:I});};
  const torche=function(x,y,z,k){k=k||1;grtPrisme(D,V,x,y-4.2*k,z,UP,5,.42*k,.36*k,4.4*k,GT.BOIS,fr()*6);grtOcta(D,V,x,y+.9*k,z,.85*k,1.5*k,GT.FLAMME,fr()*6);T9.push({x:x,y:y+k,z:z});nb.torches=(nb.torches|0)+1;}; // (k : la taille — les torches des grandes salles se voient de loin)
  const cel=function(x,y,z){return [Math.floor((x-V.ox)/B),Math.floor((y-V.oy)/B),Math.floor((z-V.oz)/B)];};
  // le plafond et le plancher d'une colonne : là où la DENSITÉ change de signe (la surface qu'on voit)
  const plafond=function(x,y,z,mx){if(grtDensIci(V,x,y,z)<=0)return null;let yy=y;for(;yy<y+mx;yy+=2)if(grtDensIci(V,x,yy,z)<=0)return yy-1;return null;};
  const plancher=function(x,y,z,mx){if(grtDensIci(V,x,y,z)<=0)return null;let yy=y;for(;yy>y-mx;yy-=2)if(grtDensIci(V,x,yy,z)<=0){const v=grtIci(V,x,yy-1,z);return v===0?yy+1:null;}return null;}; // (sur la roche seulement : jamais sur la lave ou l'eau)
  const pris=function(s0,s1){if(s0==null||s1==null)return -1;let a=R.i0,z=R.n-21;while(a<z&&R.S[a]<s0)a++;let e=a;while(e<z&&R.S[e+1]<=s1)e++;if(e<=a)return -1;return a+((fr()*(e-a+1))|0);}; // un échantillon au hasard DANS la salle
  const cote=function(q,lat){const sd=fr()<.5?-1:1;cote.y=R.Y[q]+R.BY[q]*sd*lat;return [R.X[q]+R.BX[q]*sd*lat,R.Z[q]+R.BZ[q]*sd*lat];}; /* (SUR LES PAROIS) le CÔTÉ de la dalle (qui roule) : x, z, et cote.y la hauteur du point — le décor part de là */
  // la paroi la plus proche, à hauteur y, dans la direction latérale sd : [x, z, nx, nz] juste devant elle, ou null
  const paroi=function(q,sd,y,d0,d1){const bx=R.BX[q]*sd,by=R.BY[q]*sd,bz=R.BZ[q]*sd,h=y-R.Y[q],y0=R.Y[q]+R.NNY[q]*h,x0=R.X[q]+R.NNX[q]*h,z0=R.Z[q]+R.NNZ[q]*h; /* (SUR LES PAROIS) on marche le long du CÔTÉ de la dalle, à h au-dessus d'elle : [x, z, nx, nz, distance, y] juste devant la roche */
    for(let dd=d0;dd<d1;dd+=2){if(grtDensIci(V,x0+bx*dd,y0+by*dd,z0+bz*dd)<=0){const d2=dd-2.2;return [x0+bx*d2,z0+bz*d2,-bx,-bz,d2,y0+by*d2];}}return null;};
  /* ===== LES DÉCORS TOUT EN AIR (2026-11-07, Sacha : « génération aléatoire parfaite ») =====
     MESURÉ (dbgGrotte('audit'), graines 1-10) : une lumière de chute de lave sur deux (27 sur 56) et ~6 lianes par grotte étaient DANS la roche — la chute descend
     d'aplomb de la voûte au lac, la liane et la concrétion de la voûte vers le bas, mais la paroi d'une salle n'est pas verticale : la colonne traversait un surplomb,
     un rebord, le sol au-dessus du lac. Une colonne n'est posée que si TOUT son fût est dans l'air (un point tous les 4 m, 1,5 m de marge aux deux bouts). */
  const enAir=function(x,z,ya,yb){for(let y9=ya+1.5;y9<yb-1.5;y9+=4)if(grtDensIci(V,x,y9,z)<=0)return false;return true;};
  const enSalle=function(x,z,ya,yb,k){for(const u of [.04,.35,.65,.97])if(grtSalAt(V,R,x,ya+(yb-ya)*u,z)!==k)return false;return true;}; /* (2026-11-10) TOUT le fût dans SA salle (quatre points, du pied à la pointe) : un décor est tiré par abscisse mais posé jusqu'à 0,8 rayon de côté, où la grotte est parfois celle d'une autre salle (voir grtSalAt) */
  if(performance.now()>JF.lim)yield;
  // ---- 0 · LA MINE ----
  const ap=R.apres||{}; // (LES PROFONDEURS AU HASARD) la fin de chaque salle : le début de la suivante, quelle qu'elle soit
  if(b.mine!=null&&ap.mine!=null){let n=0,der=-1;
    for(let q=R.i0;q<R.n-20;q++){const s9=R.S[q];if(s9<b.mine+20||s9>ap.mine-60)continue;const t=Math.floor(s9/32);if(t===der)continue;der=t;
      const x=R.X[q],y=R.Y[q],z=R.Z[q],tx=R.TX[q],tz=R.TZ[q],yaw=Math.atan2(tx,tz),la=RHd+7,y0=y-THICK-7,y1=y+27.5;
      for(const sd of [-1,1]){grtBoite(D,V,x+tz*sd*la,(y0+y1)/2,z-tx*sd*la,.9,(y1-y0)/2,.9,GT.BOIS,yaw,'roche');
        grtBoite(D,V,x+tz*sd*(la-3.2),y1-2.4,z-tx*sd*(la-3.2),2.4,.7,.7,GT.BOIS,yaw,'roche');
        if(n%2===(sd>0?0:1))torche(x+tz*sd*(la-1.4),y+9,z-tx*sd*(la-1.4));}
      grtBoite(D,V,x,y1+.6,z,la+1,1.1,1.1,GT.BOIS,yaw,'roche');n++;}nb.cadres=n;}
  if(performance.now()>JF.lim)yield;
  // ---- LES TORCHES (hors de la mine) ----
  {let sd=1,der=-1e9;for(let q=R.i0;q<R.n-20;q++){const s9=R.S[q],sal=R.SAL[q];if(sal===0||s9-der<(sal===4?84:R.TUN&&R.TUN[q]?20:42))continue;der=s9;sd=-sd;
    const y=R.Y[q]+7,tk=GRV.torK,w=paroi(q,sd,y,RHd+4,VZ?Math.min(R.RH[q]*1.45,600):96);let ok=false;
    if(w&&w[4]>=RHd+3&&grtDensIci(V,w[0],w[5]+5,w[1])>0){torche(w[0],w[5],w[1],tk);ok=true;}
    if(!ok){const bx=R.TZ[q]*sd,bz=-R.TX[q]*sd,tx=R.X[q]+bx*(RHd+9),tz=R.Z[q]+bz*(RHd+9),yf=plancher(tx,R.Y[q]-THICK-3,tz,70);if(yf!=null&&grtLibre(R,tx,tz,yf,yf+5*tk,1))torche(tx,yf+4.6*tk,tz,tk);}}}
  if(performance.now()>JF.lim)yield;
  // ---- LES GEMMES : diamants et or dans les parois, près de la route (une grappe tous les ~110 m) ----
  {let n=0;for(let q=R.i0;q<R.n-20;q+=Math.max(1,Math.round(110/6))){const sal=R.SAL[q];if(sal===0)continue;const sd=fr()<.5?-1:1,y=R.Y[q]+4+fr()*18,w=paroi(q,sd,y,RHd+6,VZ?Math.min(R.RH[q]*1.45,600):160);if(!w)continue;
    const t=(sal>=4||fr()<.55)?GT.DIAMANT:GT.OR,k9=3+((fr()*3)|0),g9=VZ?2:1;
    for(let k=0;k<k9;k++){const a=fr()*6.28,r9=fr()*3.2*g9;grtOcta(D,V,w[0]-w[2]*1.2*g9+Math.cos(a)*r9,w[5]+(fr()-.5)*5*g9,w[1]-w[3]*1.2*g9+Math.sin(a)*r9,(1+fr()*1.3)*g9,(1.5+fr()*2.2)*g9,t,fr()*6);}
    lum(w[0],w[5],w[1],22*(VZ?1.9:1),t===GT.DIAMANT?[.25,.85,1]:[1,.78,.25],.55);n++;}nb.gemmes=n;}
  if(performance.now()>JF.lim)yield;
  // ---- 1 · LA GROTTE LUXURIANTE : les lianes à baies, les azalées ----
  {let n=0,na=0;const N=Math.round((VZ?190:110)*MOB),NA=Math.round((VZ?80:46)*MOB),g9=VZ?1.7:1;
    for(let e=0;e<N*8&&n<N;e++){if((e&7)===7&&performance.now()>JF.lim)yield;const q=pris(b.luxe,ap.luxe);if(q<0)break;const xz=cote(q,RHd+6+fr()*(VZ?R.RH[q]*.72:104)),yc=plafond(xz[0],cote.y+6,xz[1],VZ?R.UP[q]*1.5:120);if(yc==null)continue;
      const Lv=(10+fr()*32)*(VZ?2.4:1),yb=yc-Lv;if(!enAir(xz[0],xz[1],yb,yc)||!grtLibre(R,xz[0],xz[1],yb,yc,2*g9)||!enSalle(xz[0],xz[1],yb,yc,1))continue; /* (2026-11-10) DANS SA SALLE : la liane pend dans la luxuriante, pas dans la salle d'à côté (voir grtSalAt) */
      grtPrisme(D,V,xz[0],yc+2,xz[1],BAS,4,.4*g9,.25*g9,Lv+2,GT.FEUILLE,fr()*6);
      for(let u=2.5*g9;u<Lv-g9;u+=(2.8+fr()*1.6)*g9)grtOcta(D,V,xz[0]+(fr()<.5?-.6:.6)*g9,yc-u,xz[1]+(fr()-.5)*.7*g9,.62*g9,.75*g9,GT.BAIE,fr()*6);
      lum(xz[0],yc-Lv*.65,xz[1],VZ?50:30,[1,.5,.12],.8);n++;}
    for(let e=0;e<NA*8&&na<NA;e++){if((e&7)===7&&performance.now()>JF.lim)yield;const q=pris(b.luxe,ap.luxe);if(q<0)break;const xz=cote(q,RHd+10+fr()*(VZ?R.RH[q]*.7:90)),yf=plancher(xz[0],cote.y-THICK-4,xz[1],VZ?R.DN[q]*1.5+20:110);if(yf==null)continue;
      const w=(2.6+fr()*2.4)*g9,h=(2.2+fr()*1.8)*g9;if(!grtLibre(R,xz[0],xz[1],yf,yf+2*h,w)||!enSalle(xz[0],xz[1],yf,yf+2*h,1))continue;
      grtOcta(D,V,xz[0],yf+h,xz[1],w,h*1.05,GT.FEUILLE,fr()*6);grtOcta(D,V,xz[0]+(fr()-.5)*w,yf+h*1.25,xz[1]+(fr()-.5)*w,w*.7,h*.8,GT.FEUILLE,fr()*6);
      for(let k=0;k<4;k++)grtOcta(D,V,xz[0]+(fr()-.5)*w*1.5,yf+h*(1.4+fr()*.5),xz[1]+(fr()-.5)*w*1.5,.55*g9,.55*g9,GT.FLEUR,fr()*6);na++;}
    nb.lianes=n;nb.azalees=na;}
  if(performance.now()>JF.lim)yield;
  // ---- 2 · LE BOYAU : ses cristaux sont ceux des grottes embellies (grtCristauxG) — plus de géode ----
  if(performance.now()>JF.lim)yield;
  // ---- 3 · LES STALACTITES : les concrétions, des cônes à six pans ----
  /* (2026-11-01, Sacha : « la grotte glacée, plus de stalactites et tout ») GLACE : la salle gèle plus dur — 80 % de concrétions de plus,
     plus longues et plus fines (des glaçons, pas des cônes de pierre). */
  {const ICE9=GROTTE.met==='glace';let n=0;const N=Math.round((VZ?240:140)*MOB*(ICE9?1.8:1)),g9=(VZ?1.25:1)*(ICE9?.85:1),Lk=ICE9?1.35:1;
    for(let e=0;e<N*8&&n<N;e++){if((e&7)===7&&performance.now()>JF.lim)yield;const q=pris(b.stal,ap.stal);if(q<0)break;const xz=cote(q,RHd+8+fr()*(VZ?R.RH[q]*.8:118)),pend=ICE9?fr()<.72:fr()<.55,k=.75+fr()*.5;
      if(pend){const yc=plafond(xz[0],cote.y+8,xz[1],VZ?R.UP[q]*1.5:150);if(yc==null)continue;const Ld=(8+fr()*38)*(VZ?2.6:1)*Lk;if(!enAir(xz[0],xz[1],yc-Ld,yc)||!grtLibre(R,xz[0],xz[1],yc-Ld,yc,Math.max(5,3.4*k*(.8+Ld/60)*g9+2))||!enSalle(xz[0],xz[1],yc-Ld,yc,3))continue; /* (2026-11-10) une concrétion ne pend que dans les stalactites (voir grtSalAt) */ /* (2026-11-05, Léo : « de gros tas de neige sur la route ») la marge suit la VRAIE base du cône (jusqu'à ~9 m en grotte vaste glacée), plus un 5 m fixe */
        grtPrisme(D,V,xz[0],yc+3,xz[1],BAS,6,3.4*k*(.8+Ld/60)*g9,0,Ld+3,GT.CONCRETION,fr()*6,'roche');}
      else{const yf=plancher(xz[0],cote.y-THICK-3,xz[1],VZ?R.DN[q]*1.5+20:140);if(yf==null)continue;const Hs=(6+fr()*30)*(VZ?2.4:1)*Lk;if(!enAir(xz[0],xz[1],yf,yf+Hs)||!grtLibre(R,xz[0],xz[1],yf,yf+Hs,Math.max(5,3.2*k*(.8+Hs/50)*g9+2))||!enSalle(xz[0],xz[1],yf,yf+Hs,3))continue; /* (idem : la marge suit la base réelle) */
        grtPrisme(D,V,xz[0],yf-2,xz[1],UP,6,3.2*k*(.8+Hs/50)*g9,0,Hs+2,GT.CONCRETION,fr()*6,'roche');}
      n++;}nb.concretions=n;}
  if(performance.now()>JF.lim)yield;
  // ---- 3 bis · LES GÉANTS (2026-11-05, voir GRT_GEANT) : un stalagmite énorme au centre de chaque virage du module, planté au sol, plafonné sous la voûte ----
  GROTTE.geantsInfo=[];
  if(R.geants&&R.geants.length){const fg=mulberry32(0x6E4A17A5),G9=GRT_GEANT;let n=0; /* (un flux à part : les autres décors tirent leur hasard comme avant) */
    /* une tige de pierre : un cône tronqué à 7 pans, inscrit aux collisions À LA MESURE de sa facette (le rayon moyen entre l'apothème et le sommet : grtPrisme ne le ferait qu'à 0,8 × le rayon) */
    const tige=function(x,y,z,r0,r1,h,rot){grtPrisme(D,V,x,y,z,UP,7,r0,r1,h,GT.CONCRETION,rot);const rc=Math.max(r0,r1)*.95+1;grtCol(x,y+h/2,z,rc,h/2,rc,0,'roche').cone=[x,y,z,0,1,0,r0*.95,r1*.95,h];};
    const pendue=function(x,y,z,r0,h,rot){grtPrisme(D,V,x,y,z,BAS,7,r0,0,h,GT.CONCRETION,rot);const rc=r0*.95+1;grtCol(x,y-h/2,z,rc,h/2,rc,0,'roche').cone=[x,y,z,0,-1,0,r0*.95,0,h];};
    for(const g of R.geants){const q=g.q,x=g.x,z=g.z,rG=g.r,info={x:Math.round(x),z:Math.round(z),r:Math.round(rG),R:Math.round(g.R),ok:0,why:''};GROTTE.geantsInfo.push(info);
      if(R.NNY[q]<.75){info.why='dalle couchée';continue;} /* (le virage lu en plan n'est juste que si la dalle est à peu près à l'endroit : le dévers (34°) laisse .83) */
      const yR=R.Y[q],y0=yR+14,d0=grtDensIci(V,x,y0,z);info.d0=Math.round(d0);
      let yf=plancher(x,y0,z,640);if(yf==null&&d0>0){for(let yy=y0;yy>y0-640;yy-=2)if(grtDensIci(V,x,yy,z)<=0){yf=yy+1;break;}} /* (un fond de lave ou d'eau : le géant y plonge) */
      const yc=plafond(x,y0,z,640);
      if(yf==null||yc==null){info.why=yf==null?(d0>0?'pas de sol':'dans la roche'):'pas de voûte';continue;}
      /* la hauteur se compte depuis la ROUTE (le fond peut être 200 m plus bas, dans un gouffre) : la pointe est à 150-210 m au-dessus d'elle, ou 38 m sous la voûte */
      const top=Math.min(yR+G9.haut[0]+fg()*(G9.haut[1]-G9.haut[0]),yc-G9.voute),H=top-yf;
      if(top-yR<90){info.why='voûte trop basse';continue;}
      /* le pied s'évase si le fond est loin sous la route : la largeur au niveau de la route reste celle du virage (rG), borné pour ne pas toucher la route */
      const t0=Math.max(0,Math.min(.9,(yR-yf+12)/(H+12))),pr=t0<.30?1-.38*t0/.30:t0<.62?.62-.24*(t0-.30)/.32:t0<.86?.38-.23*(t0-.62)/.24:.15*(1-(t0-.86)/.14),rB=Math.min(rG/pr,rG*1.8,g.R-ROAD_HALF-40);
      if(!grtLibre(R,x,z,yf,top,rB)){info.why='sur la route';continue;}
      // le fût : quatre tiges qui s'affinent (le pied enterré de 12 m), un léger décalage d'une tige à l'autre, des facettes tournées
      const Ht=H+12,F9=[.30,.32,.24,.14],R9=[1,.62,.38,.15,0],rot=fg()*6.28;let yy=yf-12,cx=x,cz=z;
      for(let k=0;k<4;k++){const h=Ht*F9[k];tige(cx,yy,cz,rB*R9[k],rB*R9[k+1],h,rot+k*.37);yy+=h;cx+=(fg()-.5)*rB*.07;cz+=(fg()-.5)*rB*.07;}
      // les piquants du pied : trois ou quatre petits stalagmites collés au géant
      const ns=3+((fg()*2)|0);for(let k=0;k<ns;k++){const a=rot+k/ns*6.2832+fg()*.9,dd=rB*(.8+fg()*.25),sx=x+Math.cos(a)*dd,sz=z+Math.sin(a)*dd,sy=plancher(sx,yf+14,sz,140);if(sy==null)continue;
        const rs=rB*(.18+fg()*.12),hs=Math.min(H,260)*(.13+fg()*.17);if(!grtLibre(R,sx,sz,sy,sy+hs,rs))continue;tige(sx,sy-6,sz,rs,0,hs+6,fg()*6);}
      // la stalactite d'en face : elle descend presque jusqu'à la pointe (le géant tient la salle du sol à la voûte)
      const gap=yc-top;pendue(x,yc+3,z,rG*.36,gap*.82+3,rot+1);
      // la lumière : deux foyers ambre sur le flanc tourné vers la route (à hauteur de la route et plus haut), deux grandes torches au pied quand il est près de la route — le géant se lit de loin dans le noir
      const ang=Math.atan2(R.X[q]-x,R.Z[q]-z),dx=Math.sin(ang),dz=Math.cos(ang);
      lum(x+dx*rG*.9,yR+10,z+dz*rG*.9,170,[1,.62,.28],.85);lum(x+dx*rG*.5,yR+90,z+dz*rG*.5,210,[1,.7,.4],.6);
      if(yR-yf<120)for(const sd of [-1,1]){const tx=x+dx*(rB+10)-dz*sd*16,tz=z+dz*(rB+10)+dx*sd*16,ty=plancher(tx,yf+14,tz,120);if(ty!=null)torche(tx,ty+4.2*2.4,tz,2.4);}
      info.ok=1;info.H=Math.round(H);info.yf=Math.round(yf);info.yc=Math.round(yc);info.yR=Math.round(yR);info.rB=Math.round(rB);n++;}
    nb.geants=n;}
  if(performance.now()>JF.lim)yield;
  // ---- 4 · LE LAC DE LAVE : les chutes de lave ----
  {let n=0;const lac=GROTTE.lac;if(lac){const N=Math.round((VZ?14:9)*MOB),cw=VZ?6:3.4;
    for(let e=0;e<N*10&&n<N;e++){if((e&7)===7&&performance.now()>JF.lim)yield;const q=pris(b.lave,ap.lave);if(q<0)break;const sd=fr()<.5?-1:1,y=R.Y[q]+28,w=paroi(q,sd,y,RHd+30,VZ?Math.min(R.RH[q]*1.45,640):300);if(!w)continue;
      /* (2026-11-07, TOUT EN AIR) la chute cherche sa place : de la paroi vers la route, tous les 10 m, le premier aplomb dont le fût (le centre et deux coins) est dans l'air
         de la voûte jusqu'à ce qui l'arrête — le lac de lave (de préférence) ou un rebord de roche où elle se répand ; jamais à travers un surplomb ni le sol au-dessus du lac */
      let c9=null;for(let d9=VZ?6:3;d9<w[4]-RHd-24&&!c9;d9+=10){const x=w[0]+w[2]*d9,z=w[1]+w[3]*d9,yc=plafond(x,w[5],z,VZ?R.UP[q]*1.6:140);if(yc==null)continue;
        let yb=null;for(let yy=w[5];yy>lac.y-6;yy-=2)if(grtDensIci(V,x,yy,z)<=0){yb=yy+1;break;}if(yb==null||yc-yb<30)continue;
        if(!enAir(x,z,yb,yc)||!enAir(x+cw*.9,z+cw*.9,yb+3,yc-6)||!enAir(x-cw*.9,z-cw*.9,yb+3,yc-6)||!grtLibre(R,x,z,yb-4,yc,cw+4))continue;c9={x:x,z:z,yc:yc,yb:grtIci(V,x,yb-3,z)===4?lac.y:yb-2};}
      if(!c9||!enSalle(c9.x,c9.z,c9.yb,c9.yc,4))continue;const x=c9.x,z=c9.z,y9=c9.yb,h=(c9.yc+2-y9)/2;grtBoite(D,V,x,y9+h,z,cw,h,cw,GT.LAVE,Math.atan2(w[2],w[3]),'lave');
      for(const u of VZ?[.12,.37,.62,.88]:[.2,.55,.88])lum(x,y9+2*h*u,z,VZ?120:78,[1,.36,.07],1.35);n++;}}nb.chutes=n;}
  if(performance.now()>JF.lim)yield;
  /* ---- LA GLACE : le PINGOUIN-TOTEM (clin d'œil à la grotte de glace de Fight Club) — quelques-uns, immobiles et grands (~16 m), plantés au bord de la route, face à elle ---- */
  if(GROTTE.met==='glace'){let n=0;const N=Math.round(12*MOB),k=2.2;
    for(let e=0;e<N*14&&n<N;e++){if((e&7)===7&&performance.now()>JF.lim)yield;const q=pris(R.S[R.i0],R.S[R.n-21]);if(q<0||R.SAL[q]===0)continue;const xz=cote(q,RHd+16+fr()*(VZ?Math.min(R.RH[q]*.5,120):60)),yf=plancher(xz[0],cote.y-THICK-3,xz[1],140);if(yf==null)continue;
      if(!grtLibre(R,xz[0],xz[1],yf,yf+16*k/2.2,6*k/2.2))continue;const x=xz[0],z=xz[1],yaw=Math.atan2(R.X[q]-x,R.Z[q]-z),sn=Math.sin(yaw),cs=Math.cos(yaw);
      grtBoite(D,V,x,yf+3.2*k,z,1.1*k,3.2*k,.9*k,GT.BASALTE,yaw,'roche');grtBoite(D,V,x+sn*.8*k,yf+3.0*k,z+cs*.8*k,.8*k,2.5*k,.3*k,GT.LAVE,yaw);
      grtOcta(D,V,x,yf+7*k,z,.95*k,1.0*k,GT.BASALTE,yaw);grtOcta(D,V,x+sn*1.1*k,yf+6.7*k,z+cs*1.1*k,.35*k,.3*k,GT.BAIE,0);
      for(const sd of [-1,1])grtBoite(D,V,x+cs*sd*1.35*k,yf+3.3*k,z-sn*sd*1.35*k,.25*k,2.2*k,.7*k,GT.BASALTE,yaw);
      lum(x,yf+6*k,z,34,[.5,.8,1],.5);n++;}
    nb.pingouins=n;}
  if(performance.now()>JF.lim)yield;
  // ---- 5 · LES ABYSSES : capteurs de sculk, piliers de la cité oubliée, feux d'âme ----
  {let n=0,np=0;const N=Math.round((VZ?90:48)*MOB),NP9=Math.round((VZ?28:16)*MOB),g9=VZ?1.8:1;
    for(let e=0;e<N*8&&n<N;e++){if((e&7)===7&&performance.now()>JF.lim)yield;const q=pris(b.abysse,1e9);if(q<0)break;const xz=cote(q,RHd+6+fr()*(VZ?R.RH[q]*.7:76)),yf=plancher(xz[0],cote.y-THICK-3,xz[1],VZ?R.DN[q]*1.5+20:90);if(yf==null)continue;
      if(!grtLibre(R,xz[0],xz[1],yf,yf+5*g9,3*g9)||!enSalle(xz[0],xz[1],yf,yf+5*g9,5))continue;grtPrisme(D,V,xz[0],yf-1,xz[1],UP,6,2.6*g9,1.9*g9,2.4*g9,GT.SCULK,fr()*6);
      for(const o of [[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2]])grtPrisme(D,V,xz[0]+o[0]*g9,yf+1.2*g9,xz[1]+o[1]*g9,UP,4,.32*g9,.12*g9,(2.6+fr()*1.2)*g9,GT.CAPTEUR,fr()*6);
      lum(xz[0],yf+4*g9,xz[1],VZ?44:24,[.12,.85,.95],.85);n++;}
    for(let e=0;e<NP9*10&&np<NP9;e++){if((e&7)===7&&performance.now()>JF.lim)yield;const q=pris(b.abysse,1e9);if(q<0)break;const xz=cote(q,RHd+22+fr()*(VZ?R.RH[q]*.7:70)),yf=plancher(xz[0],cote.y-THICK-3,xz[1],VZ?R.DN[q]*1.5+20:110);if(yf==null)continue;
      const yc=plafond(xz[0],yf+2,xz[1],VZ?450:200);let H=(26+fr()*46)*(VZ?2.6:1);if(yc!=null)H=Math.min(H,yc-yf-12*g9); /* (2026-11-07) le chapiteau et le feu d'âme (jusqu'à 5,8 × g9 au-dessus du fût) restent sous la voûte : la lumière était dans la roche */if(H<14)continue;if(!grtLibre(R,xz[0],xz[1],yf,yf+H+5,6*g9)||!enSalle(xz[0],xz[1],yf,yf+H+6*g9,5))continue; /* (le chapiteau et le feu d'âme comptent : jusqu'à H + 5,8 × g9) */
      const rot=fr()*1.5;grtBoite(D,V,xz[0],yf+H/2,xz[1],3.8*g9,H/2,3.8*g9,GT.BRIQUE,rot,'roche');grtBoite(D,V,xz[0],yf+H+1.1*g9,xz[1],4.8*g9,1.1*g9,4.8*g9,GT.BRIQUE,rot,'roche');
      grtOcta(D,V,xz[0],yf+H+3.6*g9,xz[1],1.5*g9,2.2*g9,GT.AME,fr()*6);lum(xz[0],yf+H+4*g9,xz[1],VZ?60:34,[.25,.75,1],1.1);np++;}
    nb.capteurs=n;nb.piliersCite=np;}
  return {D:D,T:T9,P:P9,n:nb};}
/* ---------------- LE RENDU : UNE matière à FACETTES (la DA des autres maps) ----------------
   La normale de la FACETTE vient des dérivées (aucune normale à stocker : le low-poly des pics du glacier et du cône du volcan), tournée vers
   la caméra ; la paroi et le sol de chaque SALLE (`GRT_MUR`/`GRT_SOL` : couleurs pleines et saturées, des strates douces, une variation par paquet
   de facettes — aucune texture) ; les matières vives : la LAVE à plaques de croûte, l'eau, l'améthyste, les cristaux, les baies, le sculk dont les
   veines battent, les capteurs, les feux, les gemmes. La lumière : le plancher, les TORCHES et le LIEU (cuits aux sommets, dosés par la météo),
   une lumière douce d'en haut qui dessine les facettes, l'occlusion, la LANTERNE de la caisse. Les éclats PERCENT le brouillard. */
const GRT_MUR=[[.46,.32,.22],[.22,.36,.33],[.32,.25,.46],[.60,.38,.22],[.17,.15,.24],[.10,.15,.24]]; // mine, luxuriante, puits, stalactites, lave, abysses
const GRT_SOL=[[.42,.28,.15],[.24,.56,.16],[.26,.22,.40],[.68,.48,.28],[.24,.11,.09],[.04,.17,.21]];
/* ===== L'ACCORD DES SALLES (2026-11-03, passe maps cohérentes — Sacha : « que les maps soient toutes magnifiques dans leur ensemble, cohérentes et optimisées ») =====
   MESURÉ au banc (photos de course, Lab) : trois salles parlaient trop fort à côté des maps du ciel — la ROCHE prenait la couleur que la charte réserve aux ÉCLATS :
   · LE BOYAU : air, brume, ciel, sol et remplissage VIOLET-MAGENTA saturés (le néon violet que Sacha rejette : « trop IA ») — la route du NOIR COMPLET sortait
     violette ; ils perdent un tiers de leur saturation (même teinte, même clarté) : l'améthyste reste aux CRISTAUX (violets, roses, azur), qui ressortent de la paroi ;
   · LA LUXURIANTE : un sol vert FLUO (vert pur × lumière verte : le « criard » de la charte) — un vert mousse, même clarté, ~25 % de chroma en moins ;
   · LE LAC DE LAVE : TOUT rouge — brume, ciel, sol, remplissage — la caisse rouge se perdait sur une route rouge (chroma 69) ; la règle des deux températures
     de la charte : la clé chaude (la lave, par en dessous) et son CONTRAIRE en ombre — le ciel de la salle devient ardoise, la brume une cendre chaude.
   La clarté de chaque couleur est gardée (luminance), seule la teinte bouge. `?sans=grtaccord` = avant (A/B). */
const GRT_ACCORD=!/[?&]sans=([^&]*,)?grtaccord(,|&|$)/.test(location.search);
function grtDs(c,k){const l=.3*c[0]+.59*c[1]+.11*c[2];return c.map(function(v){return v+(l-v)*k;});} /* une couleur k plus près de son gris (même luminance) */
if(GRT_ACCORD){GRT_MUR[2]=grtDs(GRT_MUR[2],.35);GRT_SOL[2]=grtDs(GRT_SOL[2],.35);GRT_SOL[1]=[.26,.52,.22];
  GRT_AMB[1]=[.15,.35,.25];GRT_AMB[2]=grtDs(GRT_AMB[2],.35);GRT_AMB[4]=[.27,.11,.075];} /* (banc du 3/11 au soir : décalé vers l'INDIGO, le boyau sortait d'un bleu-violet ÉLECTRIQUE — l'ACES sature le bleu ; il garde donc sa teinte et perd un tiers de sa saturation) */
const GRT_U={uTime:{value:0},uTorch:{value:1},uLieu:{value:1},uAmb:{value:new THREE.Color(.05,.05,.06)},uEmi:{value:1},uLav:{value:1},uFlam:{value:1},uLant:{value:1},uVein:{value:1},uGlint:{value:1},uIce:{value:0},uLacW:{value:new THREE.Vector2(-1e5,-1e5)},
  uTorchC:{value:new THREE.Color(1.5,.86,.42)},uLantC:{value:new THREE.Color(1.05,.95,.82)},uLantP:{value:new THREE.Vector3(0,-1e5,0)},
  uMur:{value:GRT_MUR.map(function(c){return new THREE.Vector3(c[0],c[1],c[2]);})},uSol:{value:GRT_SOL.map(function(c){return new THREE.Vector3(c[0],c[1],c[2]);})}};
const GRT_VS=['attribute vec4 aF;attribute vec4 aL;uniform vec3 uMur[6],uSol[6];varying vec3 vW,vMur,vSol;varying vec4 vF,vL;','#include <fog_pars_vertex>',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vF=aF;vL=aL;int s=int(aF.y+.5);vMur=uMur[s];vSol=uSol[s];vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const GRT_FS=['uniform float uTime,uTorch,uLieu,uEmi,uLav,uFlam,uLant,uVein,uGlint,uIce;uniform vec3 uAmb,uTorchC,uLantC,uLantP;uniform vec2 uLacW;','varying vec3 vW,vMur,vSol;varying vec4 vF,vL;','#include <fog_pars_fragment>',FG_BRUIT,
  'void main(){',
  '  vec3 n=normalize(cross(dFdx(vW),dFdy(vW)));if(dot(n,cameraPosition-vW)<0.)n=-n;', // la FACETTE
  /* (2026-11-10, Sacha : « des triangles très visibles sur l'eau et la lave ») vF.w = le bord d'un lac (0 · 1 lave · 2 eau) + 4 × le TON de la facette (0-63, tiré par triangle : grtR6) — fc ne vient plus d'un hash par pixel sur des cubes qui coupaient les facettes en carrés.
     LA LIGNE D'EAU : sur un triangle qui touche le lac, la matière dépend de la HAUTEUR du fragment (sous le niveau du lac + 0,9 m : lave ou eau ; au-dessus : la roche) — avant, la majorité des coins de chaque triangle décidait : des dents de 12 m, lave / magma / roche en damier le long du rivage */
  '  float mt=floor(vF.x+.5),sal=floor(vF.y+.5),w4=floor(vF.w+.5),lk=w4-4.*floor(w4*.25),fc=floor(w4*.25)/63.;vec3 alb;vec3 em=vec3(0.);',
  '  if(lk>.5){float wl=lk>1.5?uLacW.y:uLacW.x;mt=vW.y<wl+.9?(lk>1.5?2.:1.):(mt>.5&&mt<2.5?0.:mt);}',
  '  if(mt<.5){float up=smoothstep(.45,.85,n.y),st=fh2(vec2(floor(vW.y*.14),sal*3.1));alb=mix(vMur,vSol,up)*(.84+.24*st)*(.88+.2*fc);alb=mix(alb,mix(vec3(.46,.70,.84),vec3(.86,.95,1.),up)*(.84+.24*st)*(.88+.2*fc),uIce);em+=vec3(.7,.9,1.)*pow(max(0.,sin(uTime*1.5+fc*40.)),20.)*uIce*.35*step(.7,fc);', /* GLACE : bleu glacé, sols givrés, paillettes de givre */ // la ROCHE : la paroi, le sol, les strates
  '    if(sal>4.5)em=vec3(.10,.85,.95)*step(.8,fc)*up*.7*uEmi*(.3+.7*pow(.5+.5*sin(uTime*2.2-length(vW.xz)*.02+fc*6.),3.));', // le SCULK : des plaques du sol des abysses qui battent en cyan
  '    else if(sal>.5&&sal<1.5)em=vec3(.35,.95,.25)*step(.84,fc)*up*.22*uEmi;', // la mousse qui luit par plaques
  /* LES FILONS (embellir, 2026-10-24) : des lignes de minerai qui courent sur les parois et les voûtes (jamais le sol) — l'isoligne d'une onde plane tordue (aucun bruit, ~30 opérations),
     par zones de ~30 m, qui s'élargit avec la distance (fwidth : pas de scintillement de pixel) et s'efface avant 420 m ; ils scintillent par bandes qui montent le long de la paroi.
     La couleur du filon suit la salle (or, or, rose, miel, braise, rose) — écrite ici, en constantes : aucun varying de plus (les vieux GPU en ont 8) */
  '    if(uVein>.001){vec3 q=vW*.05,vv=sal<1.5?vec3(1.,.73,.29):sal<2.5?vec3(1.,.40,.78):sal<3.5?vec3(1.,.70,.32):sal<4.5?vec3(1.,.50,.10):vec3(1.,.30,.78);',
  '      float w1=sin(q.x*.7+q.y*1.9-q.z*.5+sin(q.z*1.2+q.y*.8)*.8+sal*2.3),zn=step(.7,fh3(floor(vW*.032)+sal*3.));',
  '      float fv=zn*(1.-up)*(1.-smoothstep(0.,.13+fwidth(w1)*1.6,abs(w1)))*(1.-smoothstep(160.,420.,length(cameraPosition-vW)));',
  '      float gl=pow(max(0.,sin(uTime*1.9+vW.y*.21+fc*30.)),14.);alb=mix(alb,vv*.4,fv*.7);em+=vv*fv*(.3+.45*gl*uGlint)*uVein;}}',
  /* LA LAVE (2026-11-01, reprise de la HOULE de l'eau des Pics de Jade — jMerH, une somme de sinus) : le lac est plat (le maillage ne bouge pas,
     la grotte ne recreuse rien à chaque image), mais sa croûte se soulève et s'affaisse comme la houle de Jade, en bien plus lent et lourd ; le
     dégradé lisse de l'eau devient des PALIERS nets (la croûte qui se fige par plaques) — moins fluide, plus visqueux. */
  /* (2026-11-11, Sacha : « améliore la texture de l'eau et de la lave, sans plus de ressources — là elle est terrible ») LA CROÛTE FENDUE : le lac n'est plus un aplat rouge à taches —
     des PLAQUES de croûte sombre et, entre elles, des RIVIÈRES de lave vive (rouge au bord, orange, jaune au cœur). Le réseau = la ligne où deux bruits se croisent (|a − b|) : les deux mêmes
     fn2 qu'avant, le second tordu par le premier ; la houle (deux sinus au lieu de trois, plus de gradient ni de normalize) fait respirer la largeur des rivières. fwidth garde le bord net de près
     et sans scintillement de loin. GLACE : la banquise et ses fissures blanches, figées (le temps s'arrête). Coût : moins d'opérations que la version du 01/11. */
  '  else if(mt<1.5){float t=uTime*(1.-uIce),h=sin(vW.x*.021+t*.22)*.5+sin(vW.z*.017-t*.16)*.5,vt=step(abs(n.y),.5);vec2 p=mix(vW.xz*.024,vec2((vW.x+vW.z)*.11,vW.y*.02+t*.35),vt);', // vt : une face debout (les CHUTES) — la lave y coule vers le bas, en longues coulées
  '    float a=fn2(p+vec2(t*.012,t*.008)),b=fn2(p*2.3+vec2(-t*.02,t*.014)+a*1.4),d=abs(a-b),lw=.125+.03*h+.12*vt,w=fwidth(d)*1.2;',
  '    float riv=1.-smoothstep(lw-w,lw+w+.012,d),core=1.-min(1.,d/lw),gl=1.-smoothstep(lw,lw+.17,d);', // riv : la rivière (1) ou la croûte (0) · core : 0 au bord, 1 au cœur · gl : la croûte chauffe près du bord
  '    vec3 hot=mix(vec3(.90,.13,.015),vec3(1.,.50,.06),smoothstep(.0,.45,core));hot=mix(hot,vec3(1.,.86,.40),smoothstep(.5,.95,core));',
  '    vec3 cr=mix(vec3(.04,.018,.017),vec3(.105,.04,.03),b);',
  '    vec3 ci=mix(mix(vec3(.30,.58,.88),vec3(.50,.76,.96),b),vec3(.93,.98,1.),riv*(.45+.55*core));', // GLACE : la banquise, ses fissures blanches
  '    alb=mix(mix(cr,hot*.2,riv),ci*.55,uIce);em=mix((hot*riv*1.9+(vec3(.035,.007,.004)+vec3(1.,.20,.02)*gl*gl*.6)*(1.-riv))*uLav,ci*.5,uIce);}', // la LAVE : la croûte fendue
  /* L'EAU : le fond sombre (le même fn2 qu'avant), des FILS DE LUMIÈRE qui ondulent dessus (l'isoligne d'une somme de trois sinus tordue par ce bruit : des caustiques sans texture),
     et le lac s'éclaircit au rasant (la surface renvoie la salle) */
  '  else if(mt<2.5){float t=uTime;vec2 p=vW.xz*.05;float f=fn2(p+vec2(t*.05,t*.03));vec2 q=p*1.2+f*2.6;',
  '    float d=abs(sin(q.x*1.7+t*.45)+sin(q.y*1.3-t*.38)+sin((q.x+q.y)*.9+t*.3))*.33,ln=1.-smoothstep(0.,.20+fwidth(d),d);ln*=ln*(.25+.75*f);', // un fil doux, large au cœur des taches claires, presque éteint dans les creux
  '    vec3 dv=cameraPosition-vW;float ra=1.-clamp(dv.y*inversesqrt(dot(dv,dv)),0.,1.);ra*=ra*ra;',
  '    alb=mix(mix(vec3(.008,.055,.13),vec3(.03,.21,.31),f),vec3(.07,.30,.36),ra*.6)+vec3(.05,.20,.19)*ln;em=vec3(.02,.11,.16)*(.6+.4*f)+vec3(.08,.31,.30)*ln+vec3(.03,.15,.17)*ra;}', // l'EAU
  '  else if(mt<3.5){alb=mix(vec3(.40,.16,.72),vec3(.72,.42,1.),fc*.7);em=vec3(.55,.22,.95)*(.35+.25*fc)*uEmi*(.8+.2*sin(uTime*1.3+fc*9.));}', // l'AMÉTHYSTE de la géode
  '  else if(mt<4.5)alb=vec3(.42,.25,.12)*(.85+.25*fc);', // le BOIS
  '  else if(mt<5.5){alb=vec3(0.);em=mix(mix(vec3(1.,.5,.12),vec3(.35,.8,1.),uIce),mix(vec3(1.,.9,.5),vec3(.8,.97,1.),uIce),fc)*2.6*uFlam*(.82+.18*sin(uTime*13.+vW.x*2.3+vW.z*1.7));}', // la FLAMME des torches
  '  else if(mt<6.5){alb=vec3(.45,.2,.8);em=mix(vec3(.62,.28,1.),vec3(1.,.72,1.),fc)*1.5*uEmi*(.85+.15*sin(uTime*2.+fc*5.));}', // les CRISTAUX
  '  else if(mt<7.5){alb=vec3(.5,.2,.05);em=vec3(1.,.48,.08)*2.*uEmi;}', // les BAIES
  '  else if(mt<8.5)alb=mix(vec3(.10,.34,.08),vec3(.22,.52,.14),fc);', // les FEUILLES
  '  else if(mt<9.5){alb=vec3(1.,.42,.72);em=vec3(1.,.42,.72)*.18;}', // les FLEURS d'azalée
  '  else if(mt<10.5){alb=mix(vec3(.52,.32,.18),vec3(.66,.44,.26),fc)*(.85+.2*fh2(vec2(floor(vW.y*.5),3.)));alb=mix(alb,mix(vec3(.62,.80,.92),vec3(.88,.96,1.),fc)*(.9+.15*fc),uIce);} /* GLACE : des glaçons (2026-10-26 : « ; » et accolades manquants — le shader de la grotte ne compilait plus) */', // la CONCRÉTION
  '  else if(mt<11.5){alb=vec3(.10,.10,.14)*(.85+.3*fc);alb=mix(alb,mix(vec3(.30,.52,.70),vec3(.55,.78,.92),fc)*(.88+.18*fh2(vec2(floor(vW.y*.3),7.))),uIce);}', // le BASALTE — (2026-11-11, Sacha : « certains piliers de la grotte glacée s'affichent en noir ») GLACE : des colonnes de glace bleue, un ton plus profond que la paroi
  '  else if(mt<12.5){alb=vec3(.02,.09,.12);em=vec3(.10,.8,.92)*step(.7,fc)*.6*uEmi;}', // le SCULK (le pied des capteurs)
  '  else if(mt<13.5){alb=vec3(.05,.6,.7);em=vec3(.06,.80,.95)*1.8*uEmi*(.3+.7*pow(.5+.5*sin(uTime*2.5+fc*6.),3.));}', // les CAPTEURS
  '  else if(mt<14.5){alb=vec3(.13,.14,.19)*(.85+.25*fc);alb=mix(alb,mix(vec3(.38,.50,.64),vec3(.62,.76,.88),fc),uIce);}', // les BRIQUES de la cité — GLACE : l'ardoise givrée (elle restait noire)
  '  else if(mt<15.5){alb=vec3(0.);em=mix(vec3(.2,.75,1.),vec3(.7,1.,1.),fc)*2.4*(.82+.18*sin(uTime*11.+vW.x));}', // le FEU D'ÂME
  '  else if(mt<16.5){alb=vec3(.3,.9,1.);em=vec3(.25,.9,1.)*1.3*uEmi*(.7+.3*sin(uTime*3.+fc*20.));}', // le DIAMANT
  '  else if(mt<17.5){alb=vec3(1.,.75,.15);em=vec3(1.,.72,.15)*.9*uEmi*(.7+.3*sin(uTime*3.+fc*20.));}', // l'OR
  /* LES CRISTAUX À TEINTES (embellir) : rose #F24AA0, violet, azur, or miel — la lumière-vedette des parois ; une lueur par facette (le prisme se lit), un pouls lent, de rares éclats qui courent */
  '  else{vec3 hc=mt<19.5?vec3(1.,.26,.58):mt<20.5?vec3(.60,.30,1.):mt<21.5?vec3(.22,.60,1.):vec3(1.,.72,.26);',
  '    float fk=.55+.6*abs(dot(n,vec3(.42,.71,.57))),gl=pow(max(0.,sin(uTime*2.3+fc*50.+vW.y*.4)),16.);alb=hc*.3;',
  '    em=hc*fk*(1.1+.4*fc)*(.55+.45*uEmi)*(.88+.12*sin(uTime*1.6+fc*9.))+vec3(1.,.92,.96)*gl*.5*uGlint;}',
  /* LE RIVAGE ROUGEOIE (2026-11-10, remplace la matière MAGMA posée par triangle) : dans la salle de lave, la roche, la concrétion et le basalte rougissent et luisent par la HAUTEUR au-dessus du lac (11 m) — un dégradé continu, des taches douces (bruit lissé), plus de facettes allumées au hasard */
  '  if(sal>3.5&&sal<4.5&&uLacW.x>-1e4&&(mt<.5||(mt>9.5&&mt<11.5))){float hh=max(0.,vW.y-uLacW.x),heat=1.-smoothstep(0.,11.,hh);if(heat>.002){alb=mix(alb,mix(vec3(.16,.05,.04),vec3(.30,.42,.55),uIce),heat*.75);em+=mix(vec3(1.,.38,.06),vec3(.45,.78,1.),uIce)*heat*heat*(.2+.95*fn3(vW*.05+vec3(0.,uTime*.03,0.)))*1.1*uLav*(.82+.18*sin(uTime*2.+fc*8.));}}',
  '  alb=mix(alb,alb*vec3(.88,.98,1.08)+vec3(.03,.05,.07),uIce);', /* GLACE : tout se refroidit */
  '  float ao=vF.z/255.,key=.6+.4*max(0.,dot(n,vec3(.3,.86,.41)));',
  '  vec3 dl=uLantP-vW;float d2=dot(dl,dl),lam=max(0.,dot(n,dl))*inversesqrt(d2+1.);vec3 Lc=uLantC*uLant*(.25+.75*lam)/(1.+d2/1600.);',
  /* L'HUMIDITÉ (embellir) : des plaques de roche mouillée qui brillent quand les phares passent (le reflet de la lanterne sur les facettes) — le détail vivant, sans calcul côté processeur ; le vieux téléphone ne la paie pas (uVein = 0) */
  '  if(mt<.5&&uVein>.001&&uLant>.01){vec3 Hh=normalize(normalize(cameraPosition-vW)+normalize(dl));float wm=step(mix(.5,.12,uIce),fh3(floor(vW*.045)+sal*5.))*(1.-.6*smoothstep(.45,.85,n.y));',
  '    em+=uLantC*pow(max(dot(n,Hh),0.),30.)*wm*uLant*.7/(1.+d2/2200.);}',
  '  vec3 col=alb*(((uAmb+uTorchC*(vL.x*uTorch)+mix(vL.yzw,vec3(dot(vL.yzw,vec3(.34)))*vec3(.9,1.0,1.12),uIce)*(2.*uLieu))*key+Lc)*ao);',
  /* (2026-11-03, passe maps cohérentes) PLUS D'ÉCLAT QUI SURGIT AU BOUT DE LA BRUME : les éclats percent la brume (45 % au-delà de son fond), mais un tronçon n'est dessiné
     qu'à moins de « fond de brume + 170 m » de la caméra (grotteTick) — la lave, les cristaux, les gemmes d'un tronçon qui entrait APPARAISSAIENT d'un coup à ~1 km. Ils
     s'éteignent désormais en douceur entre 85 % et 100 % du fond de la brume (à la distance vraie, pas à la profondeur : les bords de l'écran aussi) : rien ne surgit. */
  '  #ifdef USE_FOG','  float ff=smoothstep(fogNear,fogFar,fogDepth);col=mix(col,fogColor,ff)+em*(1.-ff*.55)*(1.-smoothstep(fogFar*.85,fogFar,length(cameraPosition-vW)));','  #else','  col+=em;','  #endif',
  '  gl_FragColor=vec4(col,1.);}'].join('\n');
/* LES POUSSIÈRES (700 points ronds et doux autour de la caméra, comme les braises du volcan) : la poussière de la mine, les spores, les paillettes
   de la géode, les gouttes, les braises, les âmes — chaque salle les siennes, fondues en ~1 s. */
const GRT_PU={uK:{value:0},uSz:{value:.4},uSw:{value:1},uBoxC:{value:new THREE.Vector3()},uVel:{value:new THREE.Vector3()},uPC:{value:new THREE.Color(1,1,1)},uPx:{value:1}};
const GRT_PART_VS=['attribute vec4 aR;uniform float uTime,uPx,uK,uSz,uSw;uniform vec3 uBoxC,uVel,uPC;varying vec3 vC;varying float vA;',
  'void main(){vec3 p=aR.xyz*180.+uVel*uTime*(.55+.9*aR.w)+vec3(sin(uTime*.7+aR.w*20.),.5*sin(uTime*.5+aR.w*13.),cos(uTime*.6+aR.w*7.))*uSw;',
  ' p=mod(p-uBoxC+90.,180.)-90.+uBoxC;vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float dd=-mv.z;',
  ' gl_PointSize=clamp(uSz*uPx*(420./max(dd,2.))*(.55+.9*aR.w),1.,9.*uPx);vA=uK*smoothstep(150.,45.,dd)*smoothstep(5.,16.,dd)*(.55+.45*sin(uTime*2.3+aR.w*31.));vC=uPC;}'].join('\n');
const GRT_PART_FS='varying vec3 vC;varying float vA;void main(){float a=smoothstep(.5,.08,length(gl_PointCoord-.5));if(a*vA<.004)discard;gl_FragColor=vec4(vC*vA*a,1.);}';
const GRT_PART=[{c:[.95,.70,.42],v:[0,-.6,0],w:1.2,z:.32,k:.5},{c:[.55,1,.32],v:[0,.9,0],w:3,z:.42,k:.75},{c:[1,.55,1],v:[0,.3,0],w:2,z:.36,k:.85},
  {c:[.55,.78,1],v:[0,-16,0],w:.3,z:.28,k:.7},{c:[1,.42,.08],v:[0,7,0],w:2.4,z:.4,k:.95},{c:[.25,1,1],v:[0,2.6,0],w:4,z:.4,k:.8}]; // mine, luxe, boyau, stalactites, lave, abysses (z : la taille en mètres)
const GRT_PART_GLACE={c:[.85,.95,1],v:[0,-3,0],w:2.5,z:.34,k:.9}; /* GLACE : de la neige fine qui tombe doucement */
try{Object.assign(PAL.B,{grottePart:[380,560,700]});}catch(e){}
const GRT_MATS={roche:null,part:null},GRT_FX={part:null,p:null};
function grtMats(){if(GRT_MATS.roche)return GRT_MATS;
  const m=new THREE.ShaderMaterial({uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),GRT_U),vertexShader:GRT_VS,fragmentShader:GRT_FS,fog:true,side:THREE.DoubleSide,extensions:{derivatives:true}});
  m.dispose=function(){};GRT_MATS.roche=m; // jamais libérée : un seul jeu pour toutes les grottes
  const p=new THREE.ShaderMaterial({uniforms:Object.assign({uTime:GRT_U.uTime},GRT_PU),vertexShader:GRT_PART_VS,fragmentShader:GRT_PART_FS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  p.dispose=function(){};GRT_MATS.part=p;return GRT_MATS;}
function grtPartObj(){if(GRT_FX.part)return GRT_FX.part;const M=grtMats(),n=Math.round(PAL_B9('grottePart',700)*(mapsSobres()?.75:1)),R9=mulberry32(0x6A7C1E),a=new Float32Array(n*4);for(let i=0;i<n*4;i++)a[i]=R9();
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aR',new THREE.BufferAttribute(a,4));
  const p=new THREE.Points(g,M.part);p.name='grotte poussière';p.frustumCulled=false;p.visible=false;p.matrixAutoUpdate=false;p.renderOrder=8;scene.add(p);GRT_FX.part=p;GRT_FX.p=JSON.parse(JSON.stringify(GRT_PART[0]));return p;}
/* ---------------- LA CONSTRUCTION ----------------
   1 · les échantillons de route, la boîte, la grille ; 2 · CREUSER (en tranches au pré-bâti) ; 3 · le puits, les lacs, les piliers ; 4 · les
   décors et leurs lumières ; 5 · les MAILLES, tronçon par tronçon, du départ vers l'arrivée — au pré-bâti, toutes ; en direct (le premier
   portail, un rejouer), les 1 100 premiers mètres tout de suite et le reste quelques millisecondes par image (grotteTick). */
/* (2026-10-22, DEBUGGING : un TROU NOIR dans la paroi du puits — graine 3333, 24 × 48 m, à ~260 m de la route) LES TRONÇONS QUI FERMENT LA ROCHE.
   La facette d'une arête qui traverse la paroi est posée par le tronçon du côté BAS de l'arête (x, y ou z) ; si ce tronçon n'a jamais été
   alloué (aucun creusement n'y est passé), l'air d'à côté reste ouvert : on voit le vide à travers une roche qui tue (grtD : -127). Le puits
   coupe son entonnoir au cylindre Rmax, que le bruit et le haut de l'entonnoir dépassent parfois. Chaque tronçon qui a de l'air sur une face basse
   reçoit son voisin manquant (de la roche pleine, maillé dans le même ordre) : la densité, donc la collision, ne change pas. */
function grtBouche(V){const n0=V.pool.length;let n=0;
  for(let c=0;c<n0;c++){const d=V.cle[c],ci=d%V.CX,cj=((d/V.CX)|0)%V.CY,ck=(d/(V.CX*V.CY))|0,DN=V.dn[c];
    for(let ax=0;ax<3;ax++){const a=ci-(ax===0?1:0),b=cj-(ax===1?1:0),e=ck-(ax===2?1:0);if(a<0||b<0||e<0||V.dir[a+V.CX*(b+V.CY*e)]>=0)continue;
      let air=false;for(let u=0;u<16&&!air;u++)for(let w=0;w<16;w++)if(DN[ax===0?(u<<4)|(w<<8):ax===1?u|(w<<8):u|(w<<4)]>0){air=true;break;}
      if(air){const c2=grtCh(V,a,b,e);V.chS[c2]=Math.min(V.chS[c2],V.chS[c]);n++;}}}
  return n;}
function grotteVide(){
  if(GROTTE.root){GROTTE.root.traverse(function(o){if(o.userData.jeter&&o.geometry)o.geometry.dispose();});GROTTE.root=null;}
  GROTTE.V=null;GROTTE.R=null;GROTTE.grp=[];GROTTE.file=null;GROTTE.fi=0;GROTTE.msFile=0;GROTTE.pret=false;GROTTE.col=null;GROTTE.salle=-1;GROTTE.piliers=null;
  GROTTE.puits=null;GROTTE.lac=null;GROTTE.lavLum=null;GROTTE.eau=null;GROTTE.dec=null;GROTTE.LL=null;GROTTE.heurt='';grwFin();
  GROTTE.envPret=null;} /* (2026-11-03, passe maps cohérentes) envPret (le témoin des ciels préparés, voir grotteTick) gardait la RACINE de la grotte quittée — tous ses tronçons et leurs mailles
   restaient dans le tas JavaScript jusqu'à la grotte suivante */
function buildGrotte(seed){jadeFini(buildGrotteG(seed));} // d'un trait au passage ; en tranches d'avance (prebDecorG)
function* buildGrotteG(seed){ // ses rendez-vous (JF.lim) ne rendent la main qu'au pré-bâti
  grotteVide();
  if(PARK.on||!LVL.cur||LVL.cur.id!=='grotte'||!(NP>1)||!GROTTE.salles)return;
  const t0=performance.now(),direct=JF.lim===Infinity,fr=mulberry32((seed^0x6A07E)>>>0),MOB=mapsSobres()?.75:1; /* (2026-11-08) le téléphone RÉCENT : décors pleins (voir LES MAPS PLEINES) */ /* (2026-11-03) ALLEGE, plus TEL_NATIF : le même allègement (décors ×,75) sur le vrai téléphone ET sur ?tel=1 — le banc « téléphone » mesure enfin ce que le téléphone dessine ; ?allege=0 rend tout */
  GROTTE.met=GRT_MET[LVL.cur.meteo]?LVL.cur.meteo:'matin';GROTTE.n={};
  const root=new THREE.Group();root.name='grotte décor';root.matrixAutoUpdate=false;scene.add(root);GROTTE.root=root;trackMeshes.push(root);
  const R=grtEchantillons();GROTTE.R=R;GRT_U.uLacW.value.set(GROTTE.lac?GROTTE.lac.y:-1e5,GROTTE.eau?GROTTE.eau.y:-1e5); /* (2026-11-10) le niveau de la lave et de l'eau : la ligne d'eau du fragment */
  let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;
  for(let q=0;q<R.n;q++){const r=Math.max(R.RH[q]+Math.abs(R.LAT[q]),R.UP[q],R.DN[q],R.BAS[q])*1.4+30; /* (SUR LES PAROIS) le creux tourne avec la dalle : la même marge dans les trois sens */
    x0=Math.min(x0,R.X[q]-r);x1=Math.max(x1,R.X[q]+r);z0=Math.min(z0,R.Z[q]-r);z1=Math.max(z1,R.Z[q]+r);y0=Math.min(y0,R.Y[q]-r);y1=Math.max(y1,R.Y[q]+r);}
  const V=grtMonde(x0,y0,z0,x1,y1,z1);GROTTE.V=V;
  if(performance.now()>JF.lim)yield;
  const tm={ech:Math.round(performance.now()-t0)};let t9=performance.now();
  /* (le pas de creusement suit la largeur : un ellipsoïde tous les rh/3,2 m — entre deux, le creux des parois fait ~1,5 m, sous la facette et le bruit) */
  const tw=yield* grwCreuse(V,R,{x0:x0,y0:y0,z0:z0,x1:x1,y1:y1,z1:z1});if(!tw)for(let q=0,ac=1e9,nq=0;q<R.n;q++){grtNoyau(V,R,q);ac+=6;if(ac<Math.max(6,R.RH[q]/3.2)&&!R.EXT[q])continue;ac=0;yield* grtCreuse1(V,R,q);if(R.BAS[q]>0)yield* grtCreuse1(V,R,q,{ax:0,ay:1,az:0,rh:R.RH[q]*.85,up:14,dn:R.BAS[q]});nq++;if(performance.now()>JF.lim)yield;} /* (2026-10-24, passe perf) un rendez-vous par creusement (tous les 8 : des tranches de 40-60 ms ×4 au pré-bâti) */ /* (2026-11-08) le travailleur a creusé (grotte-travailleur.js) : la boucle ci-contre ne tourne que sans lui */
  tm.creuse=Math.round(performance.now()-t9);tm.travailleur=!!tw;t9=performance.now();
  tm.puits=0;
  t9=performance.now();grtLacs(V,R);GROTTE.piliers=grtPiliers(V,R,fr);GROTTE.n.bouche=grtBouche(V);V.nzc=null;tm.lacs=Math.round(performance.now()-t9);if(performance.now()>JF.lim)yield; // (le cache du bruit ne sert plus)
  t9=performance.now();const dec=yield* grtDecorsG(V,R,fr,MOB);yield* grtCristauxG(V,R,dec,seed);tm.decors=Math.round(performance.now()-t9);GROTTE.tm=tm; /* (2026-10-24, embellir) les cristaux à teintes : un flux de hasard à part, leurs lumières rejoignent dec.P */
  GROTTE.dec=dec.D;GROTTE.LL=grtLumListes(V,dec.T,dec.P);Object.assign(GROTTE.n,dec.n);GROTTE.n.lumieres=dec.P.length;GROTTE.n.piliers=GROTTE.piliers.length;
  GROTTE.n.troncons=V.pool.length;GROTTE.n.air=V.nAir;GROTTE.n.col=GROTTE.col.n;GROTTE.msCreuse=tm.creuse+tm.puits;
  if(performance.now()>JF.lim)yield;t9=performance.now();
  const ord=[];for(let c=0;c<V.pool.length;c++)ord.push(c);ord.sort(function(a,b){return V.chS[a]-V.chS[b];});GROTTE.file=ord;GROTTE.fi=0;grwMailleInit(V,R,ord);
  /* (2026-10-20, Sacha : « beaucoup de freeze et de latence sur la version vercel ») « D'UN TRAIT » SE RELIT ICI, PAS SEULEMENT AU DÉBUT. Un pré-bâti
     pas fini quand vient le JOUER (ou le portail) est fini par prebTravaille(Infinity) : `direct`, lu au début du générateur, valait faux, et
     TOUTE la grotte restante se maillait dans la même image (MESURÉ en ligne, trace Chrome : 220 ms de grtTroncon/grtMailleNets au JOUER, sur
     l'ordi). Comme un bâti direct : les 1 100 premiers mètres tout de suite, le reste par les tranches de grotteTick (grtTranches). */
  while(GROTTE.fi<ord.length){const c=ord[GROTTE.fi];if((direct||JF.lim===Infinity)&&R.S[Math.min(R.n-1,V.chS[c])]>1100)break;yield* grtTronconG(c);GROTTE.fi++;if(performance.now()>JF.lim)yield;}
  GROTTE.pret=GROTTE.fi>=ord.length;tm.mailles=Math.round(performance.now()-t9);
  GROTTE.ms=Math.round(performance.now()-t0);
  grotteMeteo(GROTTE.met,started?bioPortDur():.01);
}
function grtTroncon(c){jadeFini(grtTronconG(c));} // d'un trait (les tranches en course) — au pré-bâti : yield* grtTronconG
/* (2026-11-03, passe maps cohérentes) LA COPIE JAVASCRIPT DES MAILLES EST JETÉE UNE FOIS ENVOYÉE À LA CARTE GRAPHIQUE (comme nuLibre, les fantômes des nuages) :
   une maille de roche n'est jamais relue (la collision lit le champ de densité, la sphère de culling est calculée avant l'envoi) et la page se recharge si le
   contexte est perdu. Chaque sommet de la grotte (non indexé : 20 octets) existait deux fois — à la carte graphique ET dans le tas JavaScript, toute la course. */
function grtLibere(){this.array=null;}
function* grtTronconG(c){const V=GROTTE.V,d=V.cle[c],ci=d%V.CX,cj=((d/V.CX)|0)%V.CY,ck=(d/(V.CX*V.CY))|0,C=16*V.B,M=grtMats(),LL=GROTTE.LL&&GROTTE.LL.get(d)||null;
  const g=new THREE.Group();g.position.set(V.ox+ci*C,V.oy+cj*C,V.oz+ck*C);g.matrixAutoUpdate=false;g.updateMatrix();
  const mk=function(p){const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(p.P,3));ge.setAttribute('aF',new THREE.BufferAttribute(p.F,4));ge.setAttribute('aL',new THREE.BufferAttribute(p.L,4,true));
    if(p.I)ge.setIndex(new THREE.BufferAttribute(p.I,1));ge.computeBoundingSphere();for(const k9 in ge.attributes)ge.attributes[k9].onUpload(grtLibere);if(ge.index)ge.index.onUpload(grtLibere);const me=new THREE.Mesh(ge,M.roche);me.name='grotte roche';me.matrixAutoUpdate=false;me.updateMatrix();me.userData.jeter=1;g.add(me);};
  const m=yield* grwMailleDe(V,c,LL);GROTTE.n.triangles=(GROTTE.n.triangles|0)+m.nt;
  const L9=GROTTE.dec&&GROTTE.dec.get(d);let pd=null;
  if(L9&&L9.length){const qs=V.chS[c],sal=qs<1e9&&GROTTE.R?GROTTE.R.SAL[Math.min(GROTTE.R.n-1,qs)]:0,p=grtMailleDecor(V,c,L9,LL,sal);if(p.nv){pd=p;GROTTE.n.decors=(GROTTE.n.decors|0)+L9.length;GROTTE.n.triangles+=p.I.length/3;}}
  /* (2026-10-24, embellir) LA ROCHE ET LES DÉCORS D'UN TRONÇON EN UN SEUL MAILLAGE (un seul appel de dessin : avant, chaque tronçon à décors en payait deux — les cristaux à teintes en ajoutent partout) : les sommets du décor (indexé) sont dépliés à la suite de ceux de la roche (non indexée), même matière, mêmes attributs */
  if(pd&&m.nt){const na=m.nv,nb=pd.I.length,P=new Float32Array((na+nb)*3),F=new Uint8Array((na+nb)*4),Lt=new Uint8Array((na+nb)*4);
    P.set(m.P.subarray(0,na*3));F.set(m.F.subarray(0,na*4));Lt.set(m.L.subarray(0,na*4));
    for(let i=0;i<nb;i++){const v=pd.I[i],o=na+i;P[o*3]=pd.P[v*3];P[o*3+1]=pd.P[v*3+1];P[o*3+2]=pd.P[v*3+2];F[o*4]=pd.F[v*4];F[o*4+1]=pd.F[v*4+1];F[o*4+2]=pd.F[v*4+2];F[o*4+3]=pd.F[v*4+3];Lt[o*4]=pd.L[v*4];Lt[o*4+1]=pd.L[v*4+1];Lt[o*4+2]=pd.L[v*4+2];Lt[o*4+3]=pd.L[v*4+3];}
    mk({P:P,F:F,L:Lt,I:null,nv:na+nb,nt:(na+nb)/3});}
  else{if(m.nt)mk(m);if(pd)mk(pd);}
  g.userData.c=new THREE.Vector3(g.position.x+C/2,g.position.y+C/2,g.position.z+C/2);GROTTE.root.add(g);GROTTE.grp.push(g);}
function grtTranches(ms){const F=GROTTE.file;if(!F||GROTTE.fi>=F.length)return;const t0=performance.now();
  while(GROTTE.fi<F.length&&performance.now()-t0<ms){grtTroncon(F[GROTTE.fi]);GROTTE.fi++;}
  GROTTE.msFile+=performance.now()-t0;if(GROTTE.fi>=F.length)GROTTE.pret=true;}
/* ---------------- LES MÉTÉOS : la grotte glisse d'un temps à l'autre au même fondu que l'ambiance ---------------- */
function grotteMeteo(m,dur){const T9=GRT_MET[m]||GRT_MET.matin;GROTTE.met=GRT_MET[m]?m:'matin';
  if(!GROTTE.cur)GROTTE.cur=JSON.parse(JSON.stringify(T9));
  GROTTE.de=JSON.parse(JSON.stringify(GROTTE.cur));GROTTE.to=T9;GROTTE.k=0;GROTTE.dur=Math.max(.01,dur||1.2);}
function grtPas(dt){if(!GROTTE.cur||GROTTE.k>=1)return;GROTTE.k=Math.min(1,GROTTE.k+dt/GROTTE.dur);const e=GROTTE.k*GROTTE.k*(3-2*GROTTE.k),a=GROTTE.de,b=GROTTE.to,o=GROTTE.cur;
  for(const k in b)o[k]=a[k]+(b[k]-a[k])*e;}
function grtBioNom(met,k){return 'grt-'+(GRT_MET[met]?met:'matin')+'-'+GRT_SALLES[k|0];}
function grtSalleIci(sc){const R=GROTTE.R;if(!R)return 0;let lo=R.i0,hi=R.n-21;while(lo<hi){const m=(lo+hi+1)>>1;if(R.S[m]<=sc)lo=m;else hi=m-1;}return R.SAL[lo];}
const GRT_V=new THREE.Vector3(),GRT_PF=['w','z','k']; // (GRT_PF : les champs fondus des poussières — un tableau à demeure, rien d'alloué par image)
function grotteTick(dt){
  const on=!!GROTTE.root&&!!LVL.cur&&LVL.cur.id==='grotte'&&!PARK.on;
  if(!on){if(GRT_FX.part&&GRT_FX.part.visible)GRT_FX.part.visible=false;if(GROTTE.root&&!GROTTE.root.parent)grotteVide();return;} // (la grotte quittée : ses mailles rendues à la carte graphique tout de suite, pas au prochain passage)
  if(GROTTE.file&&GROTTE.fi<GROTTE.file.length)grtTranches(paused?12:4); // LES TRANCHES : la grotte se finit quelques millisecondes par image
  const U=GRT_U,c=GROTTE.cur||(grotteMeteo(GROTTE.met,.01),GROTTE.cur),vit=!paused;grtPas(dt);if(vit)U.uTime.value+=dt;
  U.uTorch.value=c.torche;U.uLieu.value=c.lieu;U.uAmb.value.setRGB(c.amb*.85,c.amb*.9,c.amb*1.15);U.uEmi.value=c.emi;U.uLav.value=c.lav;U.uFlam.value=c.flam;
  U.uLant.value=c.lant*(mode==='boom'||!carGroup.visible?0:1);U.uVein.value=c.vein*PAL_B9('grotteVeine',1);U.uGlint.value=c.glint;U.uIce.value=c.ice||0;U.uTorchC.value.setRGB(1.5-.62*(c.ice||0),.86+.16*(c.ice||0),.42+.7*(c.ice||0)); /* (2026-11-03) la torche gelée : un blanc froid (,88 · 1,02 · 1,12), plus un bleu franc (,55 · 1 · 1,42) que l'ACES tournait au cobalt */
  GRT_V.set(0,0,1).applyQuaternion(carGroup.quaternion);U.uLantP.value.copy(carGroup.position).addScaledVector(GRT_V,12);U.uLantP.value.y+=2;
  // LA SALLE : sous la caisse (en vol, la route survolée) ; en entrant, l'ambiance de la salle (2,4 s)
  if(GROTTE.envPret!==GROTTE.root){GROTTE.envPret=GROTTE.root;for(const m9 in GRT_MET)for(let k9=0;k9<GRT_SALLES.length;k9++)envPrepare(BIOMES[grtBioNom(m9,k9)]);} /* (2026-10-24, passe perf) les ciels des reflets de TOUTES les salles, à tous les temps (la grotte change de temps en route : 24 ciels), partent au travailleur (envPrepare) : chaque entrée de salle recalculait le cube des reflets en JS — 210 ms d'image figée sur PC, en pleine course */
  const k=grtSalleIci(mode==='fall'?lastNearS:s);
  if(k!==GROTTE.salle){const nm=grtBioNom(GROTTE.met,k);if(!BIOMES[nm]||BIO.name===nm)GROTTE.salle=k;else if(BIO.k>=1){bioGo(nm,2.4);GROTTE.salle=k;}} // (pendant le fondu du portail : on attend qu'il finisse)
  // LES TRONÇONS : cachés au-delà du brouillard
  {const ff=((scene.fog&&scene.fog.far)||800)+GRV.cull,cp=camera.position,f2=ff*ff;for(const g of GROTTE.grp){const b=g.userData.c,v=(cp.x-b.x)**2+(cp.y-b.y)**2+(cp.z-b.z)**2<f2;if(g.visible!==v)g.visible=v;}}
  // LES POUSSIÈRES
  {const P=grtPartObj(),cur=GRT_FX.p,to=(c.ice||0)>.5?GRT_PART_GLACE:(GRT_PART[k]||GRT_PART[0]),a=Math.min(1,dt*1.2);
   for(const f of GRT_PF)cur[f]+=(to[f]-cur[f])*a;for(let i=0;i<3;i++){cur.c[i]+=(to.c[i]-cur.c[i])*a;cur.v[i]+=(to.v[i]-cur.v[i])*a;}
   const u=GRT_PU;u.uK.value=cur.k*c.part;u.uSz.value=cur.z;u.uSw.value=cur.w;u.uVel.value.fromArray(cur.v);u.uPC.value.setRGB(cur.c[0],cur.c[1],cur.c[2]);u.uPx.value=renderer.getPixelRatio();
   u.uBoxC.value.copy(camera.position);P.visible=u.uK.value>.01;}
}
/* ---------------- CE QUI TUE EN VOL : la roche (la densité au point, la surface qu'on voit), la lave, l'eau, et les gros décors (boîtes orientées) ---------------- */
function grtDansCone(q,p){const dx=p.x-q[0],dy=p.y-q[1],dz=p.z-q[2],t=dx*q[3]+dy*q[4]+dz*q[5];if(t<-1||t>q[8]+1)return false; /* (2026-10-22, DEBUGGING) dans le prisme d'une concrétion (base q0-2, axe q3-5, rayon q6 → q7 sur q8 m), avec la marge d'1 m des boîtes */
  const r=q[6]+(q[7]-q[6])*Math.max(0,Math.min(1,t/q[8]))+1;return dx*dx+dy*dy+dz*dz-t*t<r*r;}
function grotteHeurt(p){const V=GROTTE.V;if(!V)return '';
  if(grtDensIci(V,p.x,p.y,p.z)<=0){const a=grtIci(V,p.x,p.y,p.z),b=grtIci(V,p.x,p.y-V.B*.5,p.z); /* (2026-10-22, DEBUGGING : « 4 m plus bas » datait des cases de 8 m — avec celles de 12 m (LA GROTTE VASTE), quand un centre de case tombe 0 à 2 m au-dessus de la surface d'un lac, le point et ses 4 m plus bas restaient dans cette case non marquée : toute chute dans CE lac (lave, eau, bassin du puits) se lisait « roche » ; une demi-case plus bas est toujours sous la surface) */return a===4||b===4?(GROTTE.met==='glace'?'glace':'lave'):a===5||b===5?'eau':'roche';}
  const G=GROTTE.col;if(G){const a=G.G.get(Math.floor(p.x/64)+','+Math.floor(p.z/64));
    if(a)for(let i=0;i<a.length;i++){const o=a[i],dx=p.x-o.x,dz=p.z-o.z,lx=dx*o.c-dz*o.s,lz=dx*o.s+dz*o.c;
      if(Math.abs(lx)<o.hx+1&&Math.abs(p.y-o.y)<o.hy+1&&Math.abs(lz)<o.hz+1&&(!o.cone||grtDansCone(o.cone,p)))return o.k==='lave'&&GROTTE.met==='glace'?'glace':o.k; /* (2026-11-05, Léo : « dans la glace ça donne l'aigle de feu ») la lave repeinte en glace tue en 'glace', pas en 'lave' (la mission ROULE DANS LA LAVE) */}}
  return '';}
/* ---------------- LA CHAUFFE AU MENU : la roche et les poussières ---------------- */
function grotteChauffe(){const M=grtMats(),g9=new THREE.BufferGeometry();
  g9.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,0,1],3));g9.setAttribute('aF',new THREE.BufferAttribute(new Uint8Array(12),4));g9.setAttribute('aL',new THREE.BufferAttribute(new Uint8Array(12),4,true));
  const me=new THREE.Mesh(g9,M.roche),P=grtPartObj();me.frustumCulled=false;const g=new THREE.Group();g.add(me);scene.add(g);
  const v=P.visible;P.visible=true;try{chauffeRendu([g,P]);}finally{scene.remove(g);P.visible=v;g9.dispose();}}
/* ---------------- LA CONSOLE ---------------- */
/* ===== L'AUDIT DE LA GÉNÉRATION (2026-11-07, Sacha : « génération aléatoire parfaite ») =====
   `dbgGrotte('audit')` — LECTURE SEULE, pour le banc des maps (outils/banc-maps, --audit) : ce que la grotte bâtie a posé contre la route, mesuré dans le
   repère de la DALLE (elle roule sur les parois : « au-dessus » = sa normale). Le couloir de conduite = demi-largeur + 1 m, de 0,3 à 7 m au-dessus de la dalle.
   · roche : des points du couloir (tous les 3 m, 5 travers × 3 hauteurs) dans la roche, la lave ou la glace (la case le dit) ;
   · decor / bitume / frole : les formes du décor (boîtes, prismes, octaèdres, échantillonnées dans leur volume) DANS le couloir, à travers la dalle
     (sous la route, jusqu'à THICK), ou qui le frôlent (demi-largeur + 3 m, de −1 à 9 m) ;
   · lumRoche : les lumières (torches et lumières du lieu) posées dans la roche ;
   · flotte : les prismes plantés (concrétions, lianes, cristaux, sculk, géants) dont le pied n'entre pas dans la roche (1 m derrière la base : plus de 2 m d'air) ;
   · lac : la plus petite hauteur de la dalle au-dessus de la lave / de l'eau dans leur portée ;
   · sig : une empreinte du décor (le déterminisme : même graine → même empreinte). */
function grtAudit(o){const R=GROTTE.R,V=GROTTE.V,D=GROTTE.dec;if(!R||!V||!D)return 'pas de grotte bâtie';
  const RH=ROAD_HALF,out={L:Math.round(L),roche:0,decor:0,bitume:0,frole:0,lumRoche:0,flotte:0,nForm:0,ou:{roche:[],decor:[],bitume:[],frole:[],lumRoche:[],flotte:[]},lac:null,eau:null,sig:0};
  const note=function(k,v){out[k]++;if(out.ou[k].length<12)out.ou[k].push(v);};
  const proche=function(x,y,z){const bx=Math.floor(x/48),bz=Math.floor(z/48);let best=-1,bd=1e18;
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L9=R.G.get((bx+a)+','+(bz+b));if(!L9)continue;for(const q of L9){if(R.EXT[q])continue;const dx=x-R.X[q],dy=y-R.Y[q],dz=z-R.Z[q],d=dx*dx+dy*dy+dz*dz;if(d<bd){bd=d;best=q;}}}
    return best;};
  /* 1 · LA ROCHE DANS LE COULOIR */
  {const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},p=new THREE.Vector3();let der=-1e9;
    for(let s9=40;s9<L;s9+=3){frameAt(s9,F9);for(const lt of [-RH-1,-RH/2,0,RH/2,RH+1])for(const h of [.3,3.5,7]){p.copy(F9.p).addScaledVector(F9.b,lt).addScaledVector(F9.n,h);
      if(grtDensIci(V,p.x,p.y,p.z)>0)continue;if(s9-der>9){const c=grtIci(V,p.x,p.y,p.z);note('roche',{s:Math.round(s9),lt:Math.round(lt),h:h,cas:c===4?'lave':c===5?'eau':'roche',sal:grtSalleIci(s9)});der=s9;}else out.roche++;}}}
  /* 2 · LES FORMES DU DÉCOR CONTRE LE COULOIR */
  const vu={};let sig=0;
  const teste=function(x,y,z,t,f){const q=proche(x,y,z);if(q<0||R.S[q]<40)return 0;const dx=x-R.X[q],dy=y-R.Y[q],dz=z-R.Z[q],dN=dx*R.NNX[q]+dy*R.NNY[q]+dz*R.NNZ[q],dB=dx*R.BX[q]+dy*R.BY[q]+dz*R.BZ[q],dT2=dx*dx+dy*dy+dz*dz-dN*dN-dB*dB;
    if(dT2>36)return 0;const aB=Math.abs(dB);let k=null;
    if(aB<RH+1&&dN>.3&&dN<7)k='decor';else if(aB<RH&&dN>-THICK&&dN<=.3)k='bitume';else if(aB<RH+3&&dN>-1&&dN<9)k='frole';
    if(!k)return 0;const cle=k+(f|0);if(vu[cle])return 1;vu[cle]=1;note(k,{s:Math.round(R.S[q]),t:t,lat:+dB.toFixed(1),h:+dN.toFixed(1),forme:f9(f)});return 1;};
  const f9=function(f){return f[0]+'@'+Math.round(f[1])+','+Math.round(f[2])+','+Math.round(f[3]);};
  let id=0;const coiffe=new Set(),kc=function(x,y,z){return Math.round(x*10)+','+Math.round(y*10)+','+Math.round(z*10);}; /* la COIFFE d'un cristal (sa pointe) part du haut du fût : son pied est le fût, pas la roche */
  for(const L9 of D.values())for(const f of L9)if(f[0]==='p'&&f[9]>.01)coiffe.add(kc(f[1]+f[4]*f[10],f[2]+f[5]*f[10],f[3]+f[6]*f[10]));
  out.types={flotte:{},lumRoche:{}};
  for(const L9 of D.values())for(const f of L9){out.nForm++;id++;f.__a=id;sig=(sig+Math.round(f[1]*7)+Math.round(f[2]*3)+Math.round(f[3]*5))%1000000007;
    const pts=[];
    if(f[0]==='b'){const x=f[1],y=f[2],z=f[3],hx=f[4],hy=f[5],hz=f[6],cs=Math.cos(f[8]),sn=Math.sin(f[8]);
      for(const u of [-1,-.5,0,.5,1])for(const v of [-1,-.5,0,.5,1])for(const w of [-1,-.5,0,.5,1]){const lx=u*hx,ly=v*hy,lz=w*hz;pts.push([x+lx*cs+lz*sn,y+ly,z-lx*sn+lz*cs]);}}
    else if(f[0]==='p'){const x=f[1],y=f[2],z=f[3],dv=[f[4],f[5],f[6]],r0=f[8],r1=f[9],h=f[10];
      const ref=Math.abs(dv[1])<.9?[0,1,0]:[1,0,0];let u=[dv[1]*ref[2]-dv[2]*ref[1],dv[2]*ref[0]-dv[0]*ref[2],dv[0]*ref[1]-dv[1]*ref[0]];const ul=Math.hypot(u[0],u[1],u[2])||1;u=[u[0]/ul,u[1]/ul,u[2]/ul];
      const v=[dv[1]*u[2]-dv[2]*u[1],dv[2]*u[0]-dv[0]*u[2],dv[0]*u[1]-dv[1]*u[0]];
      for(let a=0;a<=8;a++){const tt=a/8,r=r0+(r1-r0)*tt,hh=h*tt;pts.push([x+dv[0]*hh,y+dv[1]*hh,z+dv[2]*hh]);
        for(let k=0;k<8;k++){const an=k/8*6.2832,ca=Math.cos(an)*r,sa=Math.sin(an)*r;pts.push([x+u[0]*ca+v[0]*sa+dv[0]*hh,y+u[1]*ca+v[1]*sa+dv[1]*hh,z+u[2]*ca+v[2]*sa+dv[2]*hh]);}}
      /* le pied : 1 m derrière la base, dans la roche (sauf les torches : un manche planté au sol ou contre la paroi, et les petits éclats d'une grappe) */
      if(f[11]!==GT.BOIS&&f[11]!==GT.FLAMME&&f[11]!==GT.CAPTEUR&&h>3&&!coiffe.has(kc(x,y,z))&&grtDensIci(V,x-dv[0],y-dv[1],z-dv[2])>3){out.types.flotte[f[11]]=(out.types.flotte[f[11]]|0)+1;const q=proche(x,y,z);note('flotte',{s:q>=0?Math.round(R.S[q]):null,t:f[11],forme:f9(f),r0:+r0.toFixed(1),r1:+r1.toFixed(1),h:Math.round(h),dir:[+dv[0].toFixed(2),+dv[1].toFixed(2),+dv[2].toFixed(2)],base:Math.round(grtDensIci(V,x,y,z)),dens:Math.round(grtDensIci(V,x-dv[0],y-dv[1],z-dv[2]))});}}
    else{const x=f[1],y=f[2],z=f[3],r=f[4],h=f[5];pts.push([x,y,z],[x+r,y,z],[x-r,y,z],[x,y,z+r],[x,y,z-r],[x,y+h,z],[x,y-h,z]);}
    for(const p of pts)if(teste(p[0],p[1],p[2],f[7]!=null&&f[0]==='b'?f[7]:f[0]==='p'?f[11]:f[6],f.__a?f:f))break;}
  for(const L9 of D.values())for(const f of L9)delete f.__a;
  /* 3 · LES LUMIÈRES DANS LA ROCHE */
  if(GROTTE.LL){const S9=new Set();for(const a of GROTTE.LL.values()){for(const l of a.t)S9.add(l);for(const l of a.p)S9.add(l);}
    for(const l of S9){if(grtDensIci(V,l.x,l.y,l.z)<=0){const kk=l.r?Math.round(l.r):'torche';out.types.lumRoche[kk]=(out.types.lumRoche[kk]|0)+1;const q=proche(l.x,l.y,l.z);note('lumRoche',{s:q>=0?Math.round(R.S[q]):null,r:l.r?Math.round(l.r):'torche',p:[Math.round(l.x),Math.round(l.y),Math.round(l.z)]});}}
    out.nLum=S9.size;}
  /* 4 · LA LAVE ET L'EAU SOUS LA ROUTE */
  for(const [k,L9] of [['lac',GROTTE.lac],['eau',GROTTE.eau]]){if(!L9)continue;let m=1e9,sm=null;for(let q=R.i0;q<R.n-20;q++)if(R.S[q]>=L9.s0&&R.S[q]<=L9.s1){const d=R.Y[q]-L9.y;if(d<m){m=d;sm=R.S[q];}}out[k]={y:Math.round(L9.y),min:Math.round(m),s:sm!=null?Math.round(sm):null,s0:Math.round(L9.s0),s1:Math.round(L9.s1)};}
  /* 5 · LA ROUTE CONTRE ELLE-MÊME, dans le repère de la dalle (enroulée : un passage peut en frôler un autre sur un mur) : un point j à plus de 250 m d'abscisse, à moins de 2 demi-largeurs + 6 m de travers et 12 m de la dalle de i */
  {const C=60,g=new Map(),ds=L/Math.max(1,NP-1);for(let i=0;i<NP;i+=3){const p=pts[i],k=Math.floor(p.x/C)+','+Math.floor(p.y/C)+','+Math.floor(p.z/C);let l=g.get(k);if(!l)g.set(k,l=[]);l.push(i);}
    out.contacts=0;out.ou.contacts=[];let der=-1e9;
    for(let i=0;i<NP;i+=3){const p=pts[i],cx=Math.floor(p.x/C),cy=Math.floor(p.y/C),cz=Math.floor(p.z/C);let hit=null;
      for(let a9=-1;a9<=1&&!hit;a9++)for(let b9=-1;b9<=1&&!hit;b9++)for(let c9=-1;c9<=1&&!hit;c9++){const l=g.get((cx+a9)+','+(cy+b9)+','+(cz+c9));if(!l)continue;
        for(const j of l){if(Math.abs(j-i)*ds<250)continue;const dx=pts[j].x-p.x,dy=pts[j].y-p.y,dz=pts[j].z-p.z,dN=dx*Nn[i].x+dy*Nn[i].y+dz*Nn[i].z,dB=dx*B[i].x+dy*B[i].y+dz*B[i].z,dT=dx*T[i].x+dy*T[i].y+dz*T[i].z;
          if(Math.abs(dT)<30&&Math.abs(dN)<12&&Math.abs(dB)<2*RH+6){hit={s:Math.round(i*ds),s2:Math.round(j*ds),dN:+dN.toFixed(1),dB:+dB.toFixed(1),ny:+Nn[i].y.toFixed(2),ny2:+Nn[j].y.toFixed(2)};break;}}}
      if(hit){out.contacts++;if(hit.s-der>60&&out.ou.contacts.length<10){out.ou.contacts.push(hit);der=hit.s;}}}}
  try{out.tord=TORD.info?{essai:TORD.info.essai,contacts:TORD.info.contacts}:null;}catch(e){}
  out.sig=sig;out.n=GROTTE.n;out.col=GROTTE.col?GROTTE.col.n:0;out.ms=GROTTE.ms;out.tm=GROTTE.tm;out.pret=GROTTE.pret;out.hasard=GROTTE.Q&&GROTTE.Q.hasard||null;
  return out;}
window.dbgGrotte=function(k,o){
  if(k==='audit')return grtAudit(o);
  if(k==='decors'){const R=GROTTE.R,D=GROTTE.dec,V=GROTTE.V;if(!R||!V||!D)return 'pas de grotte bâtie'; /* (2026-11-10, Sacha : « des stalactites en végétation dans un biome pas de glace ») LECTURE SEULE : chaque forme du décor, comptée par matière, par salle DU TRONÇON (celle de sa lumière) et par salle VRAIE (l'échantillon de route le plus proche) */
    const NOM=['mine','luxe','boyau','stal','lave','abysse'],out={},mal={},VOULU={7:1,8:1,9:1,10:3,12:5,13:5,14:5,15:5}; /* la salle voulue de chaque matière de salle : baies, feuilles, fleurs → luxuriante · concrétion → stalactites · sculk, capteurs, briques, âmes → abysses */
    let nF=0,nMal=0,nHors=0;
    for(const [d,L9] of D){const c=V.dir[d],qs=c>=0?V.chS[c]:1e9,salT=qs<1e9?R.SAL[Math.min(R.n-1,qs)]:0;
      for(const f of L9){const t=f[0]==='b'?f[7]:f[0]==='p'?f[11]:f[6],m9=f[0]==='p'?f[10]*.5:0,sr=grtSalAt(V,R,f[1]+(f[0]==='p'?f[4]*m9:0),f[2]+(f[0]==='p'?f[5]*m9:0),f[3]+(f[0]==='p'?f[6]*m9:0)),kk='t'+t+' '+f[0]+' ici:'+(sr<0?'?':NOM[sr])+' tronçon:'+NOM[salT];out[kk]=(out[kk]|0)+1;nF++;
        if(sr<0)nHors++;const w=GROTTE.met==='glace'&&(t===1||t===7)?null:t===1&&f[0]==='b'?4:VOULU[t];if(w!=null&&sr!==w){nMal++;mal[kk]=(mal[kk]|0)+1;}}} /* (glace : le ventre (lave) et le bec (baie) des pingouins se posent dans toutes les salles) */
    return {formes:nF,horsCreusement:nHors,malPlaces:nMal,mal:mal,detail:o&&o.detail?out:undefined};}
  if(k==='sonde'){const R=GROTTE.R,V=GROTTE.V;if(!R||!V)return 'pas de grotte bâtie'; /* (2026-11-05) {s} : ce que la grotte sait de la route à l'abscisse s — la salle, la dalle (NNY), le creux (RH, UP, DN, BAS, LAT), le noyau et la densité au-dessus/au-dessous du centre */
    if(!o||o.s==null){const bad=[];for(let q=R.i0;q<R.n-20&&bad.length<12;q++){if(grtDensIci(V,R.X[q]+R.NNX[q]*1.5,R.Y[q]+R.NNY[q]*1.5,R.Z[q]+R.NNZ[q]*1.5)<=0||grtDensIci(V,R.X[q],R.Y[q],R.Z[q])<=0)bad.push({q:q,S:Math.round(R.S[q]),sal:R.SAL[q],ny:+R.NNY[q].toFixed(2),rh:Math.round(R.RH[q])});}return {mauvais:bad};} /* sans s : les premiers échantillons dont le centre est dans la roche */
    let lo=R.i0,hi=R.n-21;while(lo<hi){const m=(lo+hi+1)>>1;if(R.S[m]<=o.s)lo=m;else hi=m-1;}const q=lo,out=[];
    for(const d of [-18,-12,-6,0,6,12,18]){const j=Math.max(R.i0,Math.min(R.n-21,q+d)),dens=[];for(const h of [-8,-2,1.5,8,14,30]){dens.push(Math.round(grtDensIci(V,R.X[j]+R.NNX[j]*h,R.Y[j]+R.NNY[j]*h,R.Z[j]+R.NNZ[j]*h)));}
      out.push({S:Math.round(R.S[j]),sal:R.SAL[j],ny:+R.NNY[j].toFixed(2),rh:Math.round(R.RH[j]),up:Math.round(R.UP[j]),dn:Math.round(R.DN[j]),bas:R.BAS?Math.round(R.BAS[j]):null,lat:Math.round(R.LAT[j]),y:Math.round(R.Y[j]),dens:dens});}
    return {q:q,lac:GROTTE.lac?Math.round(GROTTE.lac.y):null,piliers:(GROTTE.piliers||[]).filter(function(c){return Math.hypot(c.x-R.X[q],c.z-R.Z[q])<260;}).map(function(c){return {x:Math.round(c.x-R.X[q]),z:Math.round(c.z-R.Z[q]),r:Math.round(c.r),yb:Math.round(c.yb),yt:Math.round(c.yt),k:c.k};}),pts:out};}
  if(k==='module'){const R=GROTTE.R; /* (2026-11-05) LES MODULES : sans argument la liste ([n, abscisse de début et de fin, ce que c'est]) ; {n, d, recul, haut, ahead, fov} la caméra SUR la route, d m après le début du module n, dans le repère de la dalle */
    if(!R)return 'pas de grotte bâtie';const M9=MODMARK.map(function(m,i){const z=MODS&&MODS[i];return {n:i,nom:m.nom||(m.geant?'gGeants':''),s0:z?Math.round(z.s0+60):null,s1:z?Math.round(z.s1):null,fig:m.fig||'',geant:m.geant?1:0,tunnel:m.tunnel?1:0,rouli:m.f?m.f.length:0};});
    if(!o||o.n==null)return M9;const z=MODS&&MODS[o.n];if(!z)return 'pas de module n° '+o.n;
    const at=function(s9){let lo=R.i0,hi=R.n-21;while(lo<hi){const m=(lo+hi+1)>>1;if(R.S[m]<=s9)lo=m;else hi=m-1;}return lo;},s9=z.s0+60+(o.d||0)-(o.recul||0),q=at(s9),q2=at(s9+(o.ahead||160)),h9=o.haut==null?12:o.haut;
    return window.dbgGrotte('vue',{p:[R.X[q]+R.NNX[q]*h9,R.Y[q]+R.NNY[q]*h9,R.Z[q]+R.NNZ[q]*h9],c:[R.X[q2]+R.NNX[q2]*h9*.5,R.Y[q2]+R.NNY[q2]*h9*.5,R.Z[q2]+R.NNZ[q2]*h9*.5],fov:o.fov||75,up:[R.NNX[q],R.NNY[q],R.NNZ[q]]});}
  if(k==='geants'){const R=GROTTE.R; /* (2026-11-05) LES GÉANTS : où ils sont (x, z, rayon du pied, rayon du virage, hauteur, sol, voûte) ou pourquoi il en manque ; o.vue : la caméra devant le n° o.vue, o.cote/o.haut pour la reculer */
    if(!R)return 'pas de grotte bâtie';const L9=GROTTE.geantsInfo||[];
    if(o&&o.vue!=null){const g=R.geants&&R.geants[o.vue];if(!g)return 'pas de géant n° '+o.vue;let qs=g.q;while(qs>R.i0&&R.S[qs]>R.S[g.q]-(o.recul==null?200:o.recul))qs--; /* la caméra SUR la route, o.recul m avant le milieu du virage, dans le repère de la dalle (ce que voit le joueur) ; elle vise le géant, ou la route devant (o.route) */
      const h9=o.haut==null?12:o.haut,c9=o.route?[R.X[qs]+R.TX[qs]*200,R.Y[qs]+h9,R.Z[qs]+R.TZ[qs]*200]:[g.x,R.Y[g.q]+(o.cible==null?90:o.cible),g.z];
      return window.dbgGrotte('vue',{p:[R.X[qs]+R.NNX[qs]*h9,R.Y[qs]+R.NNY[qs]*h9,R.Z[qs]+R.NNZ[qs]*h9],c:c9,fov:o.fov||70,up:[R.NNX[qs],R.NNY[qs],R.NNZ[qs]]});}
    if(o&&o.profil&&R.geants&&R.geants.length){const a=Math.max(R.i0,R.geants[0].q0-60),b=Math.min(R.n-21,R.geants[R.geants.length-1].q1+60),P9=[];for(let q=a;q<=b;q+=10)P9.push([Math.round(R.S[q]),+R.NNY[q].toFixed(2),Math.round(R.RH[q]),Math.round(R.UP[q]),Math.round(R.DN[q]),Math.round(R.Y[q]),Math.round(Math.atan2(R.TX[q],R.TZ[q])*57.2958)]);return {L:L,sTot:GROTTE.sTot,gen:GROTTE.geants,profil:P9};}
    const P9=new THREE.Vector3();for(const i of L9)if(i.ok)i.col=[grotteHeurt(P9.set(i.x+.6*i.r,i.yR,i.z)),grotteHeurt(P9.set(i.x,i.yR+120,i.z)),grotteHeurt(P9.set(i.x+1.4*i.r,i.yR,i.z))]; /* la collision au pied (dedans), à 120 m au-dessus de la route (dedans), et à 1,4 rayon (dehors : '' si l'air est libre) */
    return {demandes:(GROTTE.geants||[]).length,relus:(R.geants||[]).length,poses:L9.filter(function(i){return i.ok;}).length,geants:L9,pos:(R.geants||[]).map(function(g){return {q0:g.q0,q1:g.q1,S0:Math.round(R.S[g.q0]),S1:Math.round(R.S[g.q1]),ny:+R.NNY[g.q].toFixed(2)};})};}
  if(k==='test'){ // LA RÈGLE D'OR : de l'air tous les 6 m au bord et au milieu de la route, sous la dalle (−THICK−1,5), dessus (+1,5) et à hauteur de saut (+14) ; aucun décor dur
    if(!GROTTE.V)return 'pas de grotte bâtie';let roc=0,dec=0;const ou=[],F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},p=new THREE.Vector3();
    for(let s9=0;s9<L;s9+=6){frameAt(s9,F9);for(const lt of [-ROAD_HALF,0,ROAD_HALF])for(const h of [-THICK-1.5,1.5,14]){p.copy(F9.p).addScaledVector(F9.b,lt).addScaledVector(F9.n,h);
      if(!grotteHeurt(p))continue;if(grtDensIci(GROTTE.V,p.x,p.y,p.z)<=0){roc++;if(ou.length<30)ou.push('R'+Math.round(s9)+'('+lt+','+h+')salle'+grtSalleIci(s9)+'/dLac'+(GROTTE.lac?Math.round(p.y-GROTTE.lac.y):'-'));}else{dec++;if(ou.length<30)ou.push('D'+Math.round(s9)+'('+lt+','+h+')');}}}
    return {roche:roc,decors:dec,ou:ou.join(' ')};}
  if(k==='meteo'){grotteMeteo(o||'nuit',.01);GROTTE.cur=JSON.parse(JSON.stringify(GRT_MET[GROTTE.met]));GROTTE.k=1;const nm=grtBioNom(GROTTE.met,Math.max(0,GROTTE.salle));
    if(BIOMES[nm]){bioGo(nm,.01);BIO.k=0;bioStep(1);}grotteTick(0);return GROTTE.met;} // (tout de suite, même en pause : les photos)
  if(k==='reprend'){if(paused)togglePause();return 'reprise';}
  if(k==='vue'&&o){if(started&&!gameOver&&!paused)togglePause();camera.position.fromArray(o.p);if(o.up)camera.up.fromArray(o.up);else camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3().fromArray(o.c));camera.updateMatrixWorld();
    if(o.fov){camera.fov=o.fov;camera.updateProjectionMatrix();}skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);
    {const ff=((scene.fog&&scene.fog.far)||800)+GRV.cull,cp=camera.position;for(const g of GROTTE.grp){const b=g.userData.c;g.visible=(cp.x-b.x)**2+(cp.y-b.y)**2+(cp.z-b.z)**2<ff*ff;}}
    if(scene.fog){scene.fog.color.copy(FOG_BASE);scene.fog.near=FOG_N;scene.fog.far=FOG_F;} // (2026-10-19) la brume de la salle : en pause la boucle ne la recopie pas — les photos du banc avaient toutes celle de la mine
    GRT_PU.uBoxC.value.copy(camera.position);if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'ok';}
  /* les PHOTOS (en pause) : 'salle' (o.k = mine|luxe|boyau|stal|lave|abysse|fin, o.d m après l'entrée, o.h m de haut, o.r m en arrière) */
  if(k==='salle'){const R=GROTTE.R;if(!R)return 'pas de grotte';const sb=R.bornes[(o&&o.k)||'luxe'];if(sb==null)return 'pas de salle';
    const s9=Math.max(0,Math.min(L-1,sb+((o&&o.d)||60))),F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};frameAt(s9,F9);
    const r=(o&&o.r)||22,h=(o&&o.h)||9,p=F9.p.clone().addScaledVector(F9.t,-r).addScaledVector(F9.n,h),c=F9.p.clone().addScaledVector(F9.t,120).addScaledVector(F9.n,h*.4);
    const k9=grtSalleIci(s9),nm=grtBioNom(GROTTE.met,k9);if(BIOMES[nm]){bioGo(nm,.01);BIO.k=0;bioStep(1);}GROTTE.salle=k9;
    return window.dbgGrotte('vue',{p:p.toArray(),c:c.toArray(),fov:o&&o.fov,up:o&&o.slab?F9.n.toArray():null});} /* o.slab : la caméra dans le repère de la dalle (ce que le joueur voit : le haut de la caisse en haut de l'image) */
  /* (2026-11-11) la photo d'un LAC : 'lac' (o.k = lave|eau, o.d m après le milieu du lac, o.h m au-dessus de la surface, o.a m de visée devant) — la caméra descend au ras du lac, sous la route */
  if(k==='lac'){const L9=o&&o.k==='eau'?GROTTE.eau:GROTTE.lac;if(!L9)return 'pas de lac';const s9=Math.max(0,Math.min(L-1,(L9.s0+L9.s1)*.5+((o&&o.d)||0))),F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};frameAt(s9,F9);
    const h=(o&&o.h)||10,a=(o&&o.a)||50,t9=new THREE.Vector3(F9.t.x,0,F9.t.z).normalize(),p=new THREE.Vector3(F9.p.x,L9.y+h,F9.p.z),V9=GROTTE.V,cas=L9===GROTTE.eau?5:4;
    if(o&&o.compte){let n=0,nA=0,ex=null;for(let s8=L9.s0;s8<L9.s1;s8+=12){frameAt(Math.max(0,Math.min(L-1,s8)),F9);for(let lt=-240;lt<=240;lt+=12){const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt;if(grtIci(V9,x,L9.y-3,z)===cas){n++;if(grtDensIci(V9,x,L9.y+6,z)>0){nA++;if(!ex)ex={s:Math.round(s8-L9.s0),lt:lt,dy:Math.round(F9.p.y-L9.y)};}}}}return {y:L9.y,s0:Math.round(L9.s0),s1:Math.round(L9.s1),cases:n,airDessus:nA,ex:ex};}
    /* le lac n'est pas toujours sous la route : on cherche, de part et d'autre, un point d'air au-dessus d'une case du lac, avec du lac devant */
    let saut=(o&&o.i)|0;cherche:for(let s8=L9.s0+((o&&o.d)||0);s8<L9.s1;s8+=24)for(const lt of [0,30,-30,60,-60,100,-100,150,-150,200,-200]){frameAt(Math.max(0,Math.min(L-1,s8)),F9);const x=F9.p.x+F9.b.x*lt,z=F9.p.z+F9.b.z*lt;t9.set(F9.t.x,0,F9.t.z).normalize();
      if(grtIci(V9,x,L9.y-3,z)===cas&&grtDensIci(V9,x,L9.y+h,z)>0&&grtIci(V9,x+t9.x*a*.6,L9.y-3,z+t9.z*a*.6)===cas&&grtDensIci(V9,x+t9.x*a*.3,L9.y+h*.6,z+t9.z*a*.3)>0){if(saut-->0)continue;p.set(x,L9.y+h,z);break cherche;}}
    const c=p.clone().addScaledVector(t9,a);c.y=L9.y;if(o&&o.dis)return {p:p.toArray(),c:c.toArray(),fov:(o&&o.fov)||70}; /* o.dis : seulement dire la vue (le banc de coût la rejoue sur un autre arbre) */
    const k9=grtSalleIci(s9),nm=grtBioNom(GROTTE.met,k9);if(BIOMES[nm]){bioGo(nm,.01);BIO.k=0;bioStep(1);}GROTTE.salle=k9;return window.dbgGrotte('vue',{p:p.toArray(),c:c.toArray(),fov:o&&o.fov});}
  return {on:!!GROTTE.root,met:GROTTE.met,salle:GROTTE.salle,ms:GROTTE.ms,msCreuse:GROTTE.msCreuse,msFile:Math.round(GROTTE.msFile||0),pret:GROTTE.pret,tm:GROTTE.tm,
    file:GROTTE.file?GROTTE.file.length-GROTTE.fi:0,n:GROTTE.n,conflits:GROTTE.conflits,croise:GROTTE.croise,L:Math.round(L),
    salles:GROTTE.R?GROTTE.R.bornes:null,hasard:GROTTE.Q&&GROTTE.Q.hasard||null,roule:grtTordOn(),
    lac:GROTTE.lac&&Math.round(GROTTE.lac.y),eau:GROTTE.eau&&Math.round(GROTTE.eau.y)};};
/* ---------------- LES AMBIANCES : une par salle et par météo (appelée après les biomes du volcan, une fois BIOMES né) ----------------
   La grammaire des nuits de la bible (deux températures : la brume froide et sombre, la lumière du lieu chaude ou colorée), la brume est la
   couleur de la grotte AU LOIN (jamais un gris : un teal profond, un violet, un ambre, un pourpre, un noir bleuté). Ciel = brume (on ne le voit
   jamais : la roche est partout). Puis LA RECETTE COMMUNE des maps (`grtConti`, après CONTI) : saturation, contraste, vignette, contre-jour
   rose, bitume commun, par temps — la grotte parle la langue des six autres. */
function grtBiomes(){if(typeof BIOMES==='undefined'||!BIOMES.nuagesNuit)return;
  const S={mine:{fog:[.07,.048,.033],hemiS:[.40,.32,.26],hemiG:[.34,.20,.10],fillC:[1,.58,.26],kickC:[1,.46,.30]},
    luxe:{fog:[.028,.088,.074],hemiS:[.28,.48,.40],hemiG:[.22,.42,.14],fillC:[1,.58,.20],kickC:[.50,1,.70]},
    boyau:{fog:[.074,.032,.13],hemiS:[.46,.32,.70],hemiG:[.36,.16,.52],fillC:[.78,.40,1],kickC:[1,.45,1]},
    stal:{fog:[.094,.066,.042],hemiS:[.50,.42,.32],hemiG:[.36,.26,.16],fillC:[1,.72,.40],kickC:[1,.56,.40]},
    lave:{fog:[.15,.04,.022],hemiS:[.38,.22,.30],hemiG:[.70,.18,.04],fillC:[1,.36,.08],kickC:[1,.30,.12]},
    abysse:{fog:[.01,.045,.06],hemiS:[.12,.30,.36],hemiG:[.04,.20,.24],fillC:[.12,.80,.90],kickC:[.30,.90,1]}};
  if(GRT_ACCORD){for(const f of ['fog','hemiS','hemiG','fillC'])S.boyau[f]=grtDs(S.boyau[f],.35); /* (L'ACCORD DES SALLES, voir GRT_ACCORD) le violet, un tiers plus près du gris */
    Object.assign(S.lave,{fog:[.12,.05,.045],hemiS:[.28,.26,.36],hemiG:[.62,.24,.10],fillC:[1,.46,.20]});} /* la cendre chaude, le ciel ardoise, la lave par en dessous */
  const ICE={}; /* GLACE : la brume bleu-blanc, une teinte par salle (la lave gelée vire au violet pâle, les abysses au bleu profond) */
  /* (2026-11-03, passe maps cohérentes) ses lumières (ciel, sol, remplissage, contre-jour) un tiers plus près du blanc : un bleu saturé que l'étalonnage filmique
     (ACES) écrase vire au VIOLET — la route et les parois de la grotte gelée sortaient pervenche et cobalt ; la glace se lit claire, comme au glacier */
  {const ds=function(c){const l=.3*c[0]+.59*c[1]+.11*c[2];return c.map(function(v){return v+(l-v)*.35;});},ic=function(f,hs,hg,fc,kc){return {fog:f,hemiS:ds(hs),hemiG:ds(hg),fillC:ds(fc),kickC:ds(kc)};};
   ICE.mine=ic([.05,.09,.12],[.42,.58,.74],[.22,.36,.50],[.60,.85,1],[.70,.90,1]);ICE.luxe=ic([.04,.11,.14],[.40,.64,.78],[.22,.42,.52],[.55,.95,.95],[.65,.95,1]);
   ICE.boyau=ic([.06,.08,.15],[.44,.52,.80],[.26,.32,.56],[.70,.75,1],[.80,.80,1]);ICE.stal=ic([.06,.10,.13],[.46,.62,.76],[.26,.40,.52],[.65,.88,1],[.75,.92,1]);
   ICE.lave=ic([.08,.09,.15],[.50,.58,.82],[.34,.38,.60],[.75,.80,1],[.85,.85,1]);ICE.abysse=ic([.02,.06,.11],[.20,.36,.58],[.08,.20,.38],[.30,.65,1],[.40,.75,1]);}
  const M={matin:{k:1,fogN:50,fogF:680,hemiI:.52,fillI:.34,expo:1,bloomS:.55,bloomT:.86},midi:{k:.9,fogN:60,fogF:740,hemiI:.46,fillI:.42,expo:1,bloomS:.66,bloomT:.82},
    soir:{k:1.05,fogN:50,fogF:640,hemiI:.5,fillI:.42,expo:.98,bloomS:.62,bloomT:.84},nuit:{k:.5,fogN:30,fogF:460,hemiI:.4,fillI:.26, /* (2026-11-03) hemiI ,3 → ,4 : avec rtK 1 (grtConti), le béton du NOIR COMPLET revient dans la clarté des nuits communes */expo:1,bloomS:.6,bloomT:.84},glace:{k:1.25,fogN:45,fogF:720,hemiI:.62,fillI:.40,expo:1.04,bloomS:.72,bloomT:.8}};
  const hx=function(c,k){return '#'+c.map(function(v){return ('0'+Math.round(Math.min(1,Math.pow(Math.max(0,v*k),1/2.2))*255).toString(16)).slice(-2);}).join('');};
  for(const m in M)for(const k of GRT_SALLES){const a=m==='glace'?ICE[k]:S[k],b=M[m],kc=GRV.fogS[GRT_SALLES.indexOf(k)]*(k==='mine'?1:GRV.fogC),f=a.fog.map(function(v){return v*b.k*kc;}),sky=f.map(function(v){return v*.8;});
    BIOMES['grt-'+m+'-'+k]=bioMet(BIOMES.nuagesNuit,{nm:'GROTTE · '+k.toUpperCase()+' · '+m.toUpperCase(),jour:1,jZen:sky,jMid:sky,jHor:f,jSol:f,sunTint:[.5,.5,.6],sunHalo:0,stars:0,moon:0,city:0,
      fog:f,fogN:b.fogN*(k==='mine'?1:GRV.fog*GRV.fogN),fogF:b.fogF*(k==='mine'?1:GRV.fog),fogCj:f, /* (GROTTE VASTE) la mine, étroite, garde sa brume : au-delà, des tronçons cachés en moins */fogIn:f.map(function(v){return v*1.6;}),hemiS:a.hemiS,hemiG:a.hemiG,hemiI:b.hemiI,sunC:[.5,.5,.62],sunI:.12,fillC:a.fillC,fillI:b.fillI,kickC:a.kickC,kickI:.22,
      expo:b.expo,sat:1.04,con:1.16,rtK:1,wb:[1,1,1],sh:[0,.006,.02],hi:[.01,.004,-.004],daSh:.4,vigK:.46,vigC:[.01,.01,.03],bloomS:b.bloomS,bloomT:b.bloomT,rimK:.8,
      env:[[0,hx(f,.6)],[.3,hx(f,1.6)],[.48,hx(a.fillC,.35)],[.58,hx(a.fillC,.55)],[.66,hx(f,1.2)],[1,hx(f,.5)]],
      eS1:a.fillC.map(function(v){return Math.round(Math.min(1,v)*255);}).concat([.42]),eS2:a.kickC.map(function(v){return Math.round(Math.min(1,v)*255);}).concat([.26])});}}
/* (2026-11-03, passe maps cohérentes) LA GROTTE GELÉE PREND AUSSI LA RECETTE COMMUNE (celle de midi : la plus claire des cinq) — elle y échappait seule : sa vignette
   à ,46 (celle d'une nuit), son bitume sans la correction commune (rtT, rtA) ; mesurée au banc, sa route sortait VIOLETTE (teinte −61°, chroma 58) et ses parois
   cobalt (chroma 60-65) quand le glacier, la glace de référence, tient un bleu clair (chroma ~40, route −92°). Voir aussi ICE et uTorchC. */
function grtConti(){for(const m of ['matin','midi','soir','nuit','glace']){const r=CONTI.temps[m==='glace'?'midi':m];if(!r)continue;for(const k of GRT_SALLES){const b=BIOMES['grt-'+m+'-'+k];if(!b)continue;
  for(const f in r)if(f!=='stars')b[f]=Array.isArray(r[f])?r[f].slice():r[f];
  /* (2026-11-03, passe maps cohérentes) LA ROUTE DU NOIR COMPLET SE LIT DANS LES PHARES — MESURÉ (banc, bitume à côté de la caisse) : L* 3 à 15 la nuit, 3 dans le
     boyau (un trou noir) quand la nuit commune vise 14-20. Le béton de nuit des maps du ciel est abaissé (rtK ,75) parce que la LUNE l'éclaire ; sous la terre
     il n'y a pas de lune : le béton garde sa clarté (rtK 1). */
  if(m==='nuit')b.rtK=1;}}}
function grtTextes(){Object.assign(I18N,{'LES PROFONDEURS':'THE DEPTHS','LA ROCHE NE PARDONNE PAS':'THE ROCK NEVER FORGIVES','TORCHES':'TORCHES','CRISTAUX':'CRYSTALS','MAGMA':'MAGMA','NOIR COMPLET':'PITCH BLACK',
  'SUIS LES TORCHES':'FOLLOW THE TORCHES','LES CRISTAUX T ECLAIRENT':'THE CRYSTALS LIGHT YOUR WAY','LA LAVE MONTE':'THE LAVA IS RISING','TES PHARES, TA SEULE LUMIERE':'YOUR HEADLIGHTS, YOUR ONLY LIGHT',
  'AU FOND DE L EAU':'AT THE BOTTOM OF THE WATER','GLACE':'ICE','LA GROTTE A GELE':'THE CAVE FROZE'});} // (2026-10-18) LES PROFONDEURS — appelée avec grtBiomes (I18N naît plus bas que ce bloc)
/* <<<FIN GROTTE>>> */
