/* ---------------- LES DÉCORS ET LEURS LUMIÈRES (des formes low-poly, la DA des autres maps) ----------------
   · LA MINE : un CADRE de bois tous les 32 m (deux poteaux, la poutre à 28 m, les corbeaux), une torche sur un poteau sur deux, en quinconce ;
   · LES TORCHES (toutes les salles, une tous les ~42 m, en quinconce) : sur la paroi la plus proche (≤ 96 m du bord de la route), sinon
     plantées au sol au bord de la route — le chemin que quelqu'un a déjà exploré ; la salle de lave n'en a qu'une sur deux ;
   · LES GEMMES : des grappes de DIAMANTS (bleu) et d'OR dans les parois, près de la route — elles luisent : c'est CASH CAR ;
   · LA GROTTE LUXURIANTE : des LIANES aux BAIES qui luisent pendues à la voûte (chacune une lumière orange), des AZALÉES fleuries sur la mousse ;
   · LE PUITS : des grappes de CRISTAUX d'améthyste (prismes à six pans, pointus) qui sortent de la géode ;
   · LES STALACTITES : des CONCRÉTIONS en cônes à six pans, pendues ou dressées ;
   · LE LAC DE LAVE : des CHUTES DE LAVE de la voûte au lac (trois lumières chacune) ;
   · LES ABYSSES : des CAPTEURS de sculk (leurs vrilles battent en cyan), les PILIERS d'ardoise d'une cité oubliée et leur feu d'âme bleu.
   Rien ne touche la route : chaque décor passe `grtLibre` (36 m d'air au-dessus d'elle, 14 m sous la dalle). */
/* ===== LE DÉCOR DES PROFONDEURS AU HASARD (2026-10-20, Sacha : « il faut que chaque map soit aléatoire avec des modules et des décors qui changent ») =====
   Avant, le décor était semé par la graine mais sa COMPOSITION était la même à chaque partie. Désormais, chaque grotte TIRE son décor (`grtDecoTire`,
   dans un hasard à lui né de la graine : jamais le `fr` des décors), dix choix indépendants, tous visibles depuis la route : LA MINE (cadres de bois,
   voûtes de pierre ou de basalte · l'espacement · torches ou LANTERNES pendues · les ÉTAIS en biais) · les TORCHES (espacement) · les GEMMES (la paire
   de teintes : diamant et or, rubis, émeraude, saphir, citrine, calcite · leur espacement) · LA GROTTE LUXURIANTE (son lac d'eau ou pas · la teinte des
   baies et des fleurs · les lianes en grappes ou en RIDEAUX · azalées, CHAMPIGNONS GÉANTS lumineux, ou les deux) · LA GÉODE (améthyste, émeraude,
   citrine, saphir ou quartz rose — les cristaux, le cœur, sa lumière, la paroi et la brume de la salle · leur nombre, leur taille) · LES STALACTITES
   (densité, pendues ou dressées, hauteur, colonnes, teinte : ocre, calcite, rouille, bleutée) · LE LAC DE LAVE (chutes, ÎLOTS de basalte, piliers) ·
   LES ABYSSES (sculk, nombre et ARCHITECTURE des piliers de la cité — tours, colonnes, arches —, la teinte des âmes) · la POUSSIÈRE de l'air.
   Une teinte se lit dans le canal libre aF.w (matière + 32 × teinte) : AUCUNE matière ni programme neuf. `dbgGrotte().deco` = le tirage.
   `?sans=grottedecor` = le décor d'avant, au tirage près. */
const GRT_TEINTE=[null,[.25,1,.45],[1,.72,.12],[.35,.55,1],[1,.42,.62],[1,.16,.18],[.85,.92,1],[.7,.3,1]]; // (les lumières : les couleurs de gTeinte du shader)
/* la géode de chaque teinte : sa lumière cuite, sa paroi et son sol (uMur/uSol[2]), ses paillettes, son ambiance (grtBiomes) — 0 = l'améthyste d'avant */
const GRT_GEO=[null,
  {nm:'emeraude',c:[.22,.95,.45],mur:[.18,.34,.28],sol:[.16,.30,.22],pa:[.5,1,.6],fog:[.02,.09,.06],hemiS:[.30,.55,.42],hemiG:[.12,.40,.24],fillC:[.35,1,.6],kickC:[.5,1,.7]},
  {nm:'citrine',c:[1,.62,.12],mur:[.46,.36,.20],sol:[.40,.30,.16],pa:[1,.85,.4],fog:[.11,.07,.02],hemiS:[.6,.48,.28],hemiG:[.5,.32,.08],fillC:[1,.72,.25],kickC:[1,.8,.4]},
  {nm:'saphir',c:[.25,.5,1],mur:[.20,.26,.46],sol:[.16,.22,.40],pa:[.55,.75,1],fog:[.02,.04,.13],hemiS:[.3,.4,.7],hemiG:[.1,.2,.5],fillC:[.4,.6,1],kickC:[.5,.7,1]},
  {nm:'quartz rose',c:[1,.38,.6],mur:[.44,.24,.34],sol:[.38,.20,.30],pa:[1,.6,.8],fog:[.11,.03,.07],hemiS:[.65,.35,.5],hemiG:[.5,.15,.3],fillC:[1,.45,.7],kickC:[1,.5,.8]}];
function grtDecoTire(f){const t=function(a){return a[(f()*a.length)|0];};
  return {mine:{style:t(['bois','bois','pierre','basalte']),pas:t([24,32,32,44]),lum:t(['torches','lanternes']),etais:f()<.5},
    torches:t([32,42,42,60]),
    gemmes:{paire:t([[0,0],[5,0],[1,0],[3,2],[0,5],[6,1]]),pas:t([80,110,150])},
    luxe:{lac:f()<.7,baie:t([0,0,4,3,6,1]),lianes:t(['grappes','rideaux']),flore:t(['azalees','champignons','les deux']),champi:t([4,2,7,3])},
    geode:{teinte:t([0,0,1,2,3,4]),n:t([110,170,240]),k:t([.8,1,1.3,1.5])},
    stal:{dens:t([.6,1,1.5]),pend:t([.35,.55,.8]),haut:t([.7,1,1.4]),col:t(GRT_VASTE?[5,11,18]:[3,6,10]),teinte:t([0,0,6,5,3])},
    lave:{chutes:t(GRT_VASTE?[6,14,24]:[4,9,15]),ilots:t([0,5,10]),pil:t(GRT_VASTE?[8,16,24]:[5,9,14])},
    abysse:{sculk:t([.6,1,1.5]),cite:t(GRT_VASTE?[12,28,40]:[7,16,23]),style:t(['tours','colonnes','arches']),ame:t([0,0,1,7,6])},
    brume:t([.6,1,1.6])};}
function grtDecoTexte(D){if(!D)return null;const N=['','émeraude','citrine','saphir','rose','rubis','calcite','violet'],g=GRT_GEO[D.geode.teinte];
  return ['mine '+D.mine.style+' /'+D.mine.pas+' m, '+D.mine.lum+(D.mine.etais?', étais':''),'torches /'+D.torches+' m','gemmes '+(N[D.gemmes.paire[0]]||'diamant')+'+'+(N[D.gemmes.paire[1]]||'or')+' /'+D.gemmes.pas+' m',
    'luxuriante '+(D.luxe.lac?'lac':'sans lac')+', baies '+(N[D.luxe.baie]||'orange')+', lianes '+D.luxe.lianes+', '+D.luxe.flore,'géode '+(g?g.nm:'améthyste')+' ×'+D.geode.n+' ×'+D.geode.k,
    'stalactites ×'+D.stal.dens+', pendues '+D.stal.pend+', ×'+D.stal.haut+', '+D.stal.col+' colonnes, '+(N[D.stal.teinte]||'ocre'),'lave '+D.lave.chutes+' chutes, '+D.lave.ilots+' îlots, '+D.lave.pil+' piliers',
    'abysses sculk ×'+D.abysse.sculk+', cité '+D.abysse.cite+' '+D.abysse.style+', âmes '+(N[D.abysse.ame]||'bleues'),'poussière ×'+D.brume];}
function grtDecors(V,R,fr,MOB,DC){const D=new Map(),T9=[],P9=[],B=V.B,b=R.bornes,RHd=ROAD_HALF,UP=[0,1,0],BAS=[0,-1,0],VZ=GRT_VASTE,SG=R.segs||{}; // VZ : LA GROTTE VASTE (19/10) — les décors à l'échelle des salles
  /* DC : LE DÉCOR AU HASARD (grtDecoTire ; null = le décor d'avant, au tirage près) · une teinte de matière : t + 32 × son numéro (GRT_TEINTE, lue dans aF.w) */
  GROTTE.col={G:new Map(),n:0};const nb={};
  const TE=function(w,c0){return w?GRT_TEINTE[w]:c0;}; /* la couleur d'une lumière teintée */
  const lum=function(x,y,z,r,c,I){P9.push({x:x,y:y,z:z,r:r,r2:r*r,c:c,I:I});};
  const torche=function(x,y,z,k){k=k||1;grtPrisme(D,V,x,y-4.2*k,z,UP,5,.42*k,.36*k,4.4*k,GT.BOIS,fr()*6);grtOcta(D,V,x,y+.9*k,z,.85*k,1.5*k,GT.FLAMME,fr()*6);T9.push({x:x,y:y+k,z:z});nb.torches=(nb.torches|0)+1;}; // (k : la taille — les torches des grandes salles se voient de loin)
  const cel=function(x,y,z){return [Math.floor((x-V.ox)/B),Math.floor((y-V.oy)/B),Math.floor((z-V.oz)/B)];};
  // le plafond et le plancher d'une colonne : là où la DENSITÉ change de signe (la surface qu'on voit)
  const plafond=function(x,y,z,mx){if(grtDensIci(V,x,y,z)<=0)return null;let yy=y;for(;yy<y+mx;yy+=2)if(grtDensIci(V,x,yy,z)<=0)return yy-1;return null;};
  const plancher=function(x,y,z,mx){if(grtDensIci(V,x,y,z)<=0)return null;let yy=y;for(;yy>y-mx;yy-=2)if(grtDensIci(V,x,yy,z)<=0){const v=grtIci(V,x,yy-1,z);return v===0?yy+1:null;}return null;}; // (sur la roche seulement : jamais sur la lave ou l'eau)
  const pris=function(s0,s1){if(s0==null||s1==null)return -1;let a=R.i0,z=R.n-21;while(a<z&&R.S[a]<s0)a++;let e=a;while(e<z&&R.S[e+1]<=s1)e++;if(e<=a)return -1;return a+((fr()*(e-a+1))|0);}; // un échantillon au hasard DANS la salle
  const prisK=function(k){const L9=SG[k];if(!L9||!L9.length)return -1;if(L9.length===1)return pris(L9[0][0],L9[0][1]); /* (au hasard, une salle deux fois : l'un de ses tronçons, au prorata de sa longueur) */
    let t=0;for(const g of L9)t+=Math.min(g[1],L)-g[0];let u=fr()*t;for(const g of L9){u-=Math.min(g[1],L)-g[0];if(u<=0)return pris(g[0],g[1]);}return pris(L9[L9.length-1][0],L9[L9.length-1][1]);};
  const lacDe=function(q){const LA=GROTTE.lacs||[];if(!LA.length)return GROTTE.lac;const s9=R.S[q];for(const l of LA)if(s9>=l.s0&&s9<=l.s1)return l;return LA[0];}; /* le lac de lave de cet échantillon */
  const cote=function(q,lat){const sd=fr()<.5?-1:1;return [R.X[q]+R.TZ[q]*sd*lat,R.Z[q]-R.TX[q]*sd*lat];};
  // la paroi la plus proche, à hauteur y, dans la direction latérale sd : [x, z, nx, nz] juste devant elle, ou null
  const paroi=function(q,sd,y,d0,d1){const bx=R.TZ[q]*sd,bz=-R.TX[q]*sd;for(let dd=d0;dd<d1;dd+=2){const x=R.X[q]+bx*dd,z=R.Z[q]+bz*dd;if(grtDensIci(V,x,y,z)<=0){const d2=dd-2.2;return [R.X[q]+bx*d2,R.Z[q]+bz*d2,-bx,-bz,d2];}}return null;};
  // ---- 0 · LA MINE ----
  {const sm=SG.mine&&SG.mine[0];if(sm&&sm[1]<1e9){let n=0,der=-1;const mS=sm[0],mE=sm[1]; /* (la mine : de son début à la salle suivante — b.mine … b.luxe d'avant) */
    const pas=DC?DC.mine.pas:32,st=DC?DC.mine.style:'bois',MT=st==='pierre'?GT.BRIQUE:st==='basalte'?GT.BASALTE:GT.BOIS,ep=st==='bois'?.9:st==='pierre'?1.7:1.3,lant=!!DC&&DC.mine.lum==='lanternes';
    for(let q=R.i0;q<R.n-20;q++){const s9=R.S[q];if(s9<mS+20||s9>mE-60)continue;const t=Math.floor(s9/pas);if(t===der)continue;der=t;
      const x=R.X[q],y=R.Y[q],z=R.Z[q],tx=R.TX[q],tz=R.TZ[q],yaw=Math.atan2(tx,tz),la=RHd+7,y0=y-THICK-7,y1=y+27.5;
      for(const sd of [-1,1]){grtBoite(D,V,x+tz*sd*la,(y0+y1)/2,z-tx*sd*la,ep,(y1-y0)/2,ep,MT,yaw,'roche');
        grtBoite(D,V,x+tz*sd*(la-3.2),y1-2.4,z-tx*sd*(la-3.2),2.4,DC?.7*ep/.9:.7,.7,MT,yaw,'roche');
        if(!lant&&n%2===(sd>0?0:1))torche(x+tz*sd*(la-1.4),y+9,z-tx*sd*(la-1.4));
        if(DC&&DC.mine.etais){const ax=x+tz*sd*(la-1),az=z-tx*sd*(la-1),bx=x+tz*sd*(la-10),bz=z-tx*sd*(la-10),ay=y+12,by=y1-1.2,dl=Math.hypot(bx-ax,by-ay,bz-az); /* L'ÉTAI : du poteau à la poutre, en biais */
          grtPrisme(D,V,ax,ay,az,[(bx-ax)/dl,(by-ay)/dl,(bz-az)/dl],4,.5*ep/.9,.45*ep/.9,dl,MT,yaw);}}
      grtBoite(D,V,x,y1+.6,z,la+1,1.1,1.1,MT,yaw,'roche');
      if(st==='pierre')grtOcta(D,V,x,y1+1.9,z,2.2,1.6,GT.BRIQUE,yaw); /* la clé de voûte */
      if(lant&&n%2===0){const sd=(n&2)?1:-1,lx=x+tz*sd*la*.42,lz=z-tx*sd*la*.42; /* LA LANTERNE : pendue à la poutre (la lumière des torches) */
        grtPrisme(D,V,lx,y1,lz,BAS,4,.16,.16,4.2,GT.BOIS,0);grtBoite(D,V,lx,y1-5.4,lz,.75,1.1,.75,GT.BOIS,yaw);grtOcta(D,V,lx,y1-5.4,lz,.62,.95,GT.FLAMME,yaw);
        T9.push({x:lx,y:y1-5.4,z:lz});nb.lanternes=(nb.lanternes|0)+1;}
      n++;}nb.cadres=n;}}
  // ---- LES TORCHES (hors de la mine) ----
  const TP=DC?DC.torches:42;
  {let sd=1,der=-1e9;for(let q=R.i0;q<R.n-20;q++){const s9=R.S[q],sal=R.SAL[q];if(sal===0||s9-der<(sal===4?2*TP:TP))continue;der=s9;sd=-sd;
    const y=R.Y[q]+7,tk=GRV.torK,w=paroi(q,sd,y,RHd+4,VZ?Math.min(R.RH[q]*1.45,600):96);let ok=false;
    if(w&&w[4]>=RHd+3&&grtDensIci(V,w[0],y+5,w[1])>0){torche(w[0],y,w[1],tk);ok=true;}
    if(!ok){const bx=R.TZ[q]*sd,bz=-R.TX[q]*sd,tx=R.X[q]+bx*(RHd+9),tz=R.Z[q]+bz*(RHd+9),yf=plancher(tx,R.Y[q]-THICK-3,tz,70);if(yf!=null&&grtLibre(R,tx,tz,yf,yf+5*tk,1))torche(tx,yf+4.6*tk,tz,tk);}}}
  // ---- LES GEMMES : diamants et or dans les parois, près de la route (une grappe tous les ~110 m) ----
  {let n=0;const gP=DC?DC.gemmes.pas:110,gW=DC?DC.gemmes.paire:[0,0];for(let q=R.i0;q<R.n-20;q+=Math.max(1,Math.round(gP/6))){const sal=R.SAL[q];if(sal===0)continue;const sd=fr()<.5?-1:1,y=R.Y[q]+4+fr()*18,w=paroi(q,sd,y,RHd+6,VZ?Math.min(R.RH[q]*1.45,600):160);if(!w)continue;
    const t=(sal>=4||fr()<.55)?GT.DIAMANT:GT.OR,k9=3+((fr()*3)|0),g9=VZ?2:1,tw=gW[t===GT.DIAMANT?0:1];
    for(let k=0;k<k9;k++){const a=fr()*6.28,r9=fr()*3.2*g9;grtOcta(D,V,w[0]-w[2]*1.2*g9+Math.cos(a)*r9,y+(fr()-.5)*5*g9,w[1]-w[3]*1.2*g9+Math.sin(a)*r9,(1+fr()*1.3)*g9,(1.5+fr()*2.2)*g9,t+32*tw,fr()*6);}
    lum(w[0],y,w[1],22*(VZ?1.9:1),TE(tw,t===GT.DIAMANT?[.25,.85,1]:[1,.78,.25]),.55);n++;}nb.gemmes=n;}
  // ---- 1 · LA GROTTE LUXURIANTE : les lianes à baies, les azalées (AU HASARD : la teinte des baies et des fleurs, les lianes en grappes ou en RIDEAUX, les azalées et/ou des CHAMPIGNONS GÉANTS) ----
  {let n=0,na=0,nc=0;const N=Math.round((VZ?190:110)*MOB),NA=Math.round((VZ?80:46)*MOB),g9=VZ?1.7:1,bw=DC?DC.luxe.baie:0,BAIE=GT.BAIE+32*bw,bc=TE(bw,[1,.5,.12]),rid=!!DC&&DC.luxe.lianes==='rideaux',fl=DC?DC.luxe.flore:'azalees';
    const liane=function(x,z,yc,Lv){grtPrisme(D,V,x,yc+2,z,BAS,4,.4*g9,.25*g9,Lv+2,GT.FEUILLE,fr()*6);
      for(let u=2.5*g9;u<Lv-g9;u+=(2.8+fr()*1.6)*g9)grtOcta(D,V,x+(fr()<.5?-.6:.6)*g9,yc-u,z+(fr()-.5)*.7*g9,.62*g9,.75*g9,BAIE,fr()*6);};
    for(let e=0;e<N*8&&n<N;e++){const q=prisK('luxe');if(q<0)break;const xz=cote(q,RHd+6+fr()*(VZ?R.RH[q]*.72:104)),yc=plafond(xz[0],R.Y[q]+6,xz[1],VZ?R.UP[q]*1.5:120);if(yc==null)continue;
      const Lv=(10+fr()*32)*(VZ?2.4:1),yb=yc-Lv;if(!grtLibre(R,xz[0],xz[1],yb,yc,2*g9))continue;
      liane(xz[0],xz[1],yc,Lv);
      if(rid){const k9=3+((fr()*5)|0);for(let k=1;k<=k9&&n<N;k++){const x=xz[0]+R.TX[q]*k*4.5*g9,z=xz[1]+R.TZ[q]*k*4.5*g9,y2=plafond(x,R.Y[q]+6,z,VZ?R.UP[q]*1.5:120); /* LE RIDEAU : des lianes en rang le long de la route */
        if(y2==null)continue;const L2=Lv*(.7+fr()*.5);if(!grtLibre(R,x,z,y2-L2,y2,2*g9))continue;liane(x,z,y2,L2);n++;}}
      lum(xz[0],yc-Lv*.65,xz[1],VZ?50:30,bc,.8);n++;}
    for(let e=0;e<NA*8&&na<NA;e++){const q=prisK('luxe');if(q<0)break;const xz=cote(q,RHd+10+fr()*(VZ?R.RH[q]*.7:90)),yf=plancher(xz[0],R.Y[q]-THICK-4,xz[1],VZ?R.DN[q]*1.5+20:110);if(yf==null)continue;
      if(fl==='champignons'||(fl==='les deux'&&fr()<.5)){const cw=DC.luxe.champi,Hc=(7+fr()*16)*g9,Rc=(3+fr()*4.5)*g9;if(!grtLibre(R,xz[0],xz[1],yf,yf+Hc+Rc,Rc))continue; /* LE CHAMPIGNON GÉANT : un pied de calcite, un chapeau qui luit */
        grtPrisme(D,V,xz[0],yf-1,xz[1],UP,6,1.1*g9+Rc*.12,.8*g9+Rc*.08,Hc+1,GT.CONCRETION+32*6,fr()*6);grtPrisme(D,V,xz[0],yf+Hc-Rc*.12,xz[1],UP,7,Rc,Rc*.3,Rc*.5,GT.BAIE+32*cw,fr()*6);
        lum(xz[0],yf+Hc,xz[1],VZ?40:24,TE(cw,[1,.5,.12]),.7);nc++;na++;continue;}
      const w=(2.6+fr()*2.4)*g9,h=(2.2+fr()*1.8)*g9;if(!grtLibre(R,xz[0],xz[1],yf,yf+2*h,w))continue;
      grtOcta(D,V,xz[0],yf+h,xz[1],w,h*1.05,GT.FEUILLE,fr()*6);grtOcta(D,V,xz[0]+(fr()-.5)*w,yf+h*1.25,xz[1]+(fr()-.5)*w,w*.7,h*.8,GT.FEUILLE,fr()*6);
      for(let k=0;k<4;k++)grtOcta(D,V,xz[0]+(fr()-.5)*w*1.5,yf+h*(1.4+fr()*.5),xz[1]+(fr()-.5)*w*1.5,.55*g9,.55*g9,GT.FLEUR+32*bw,fr()*6);na++;}
    nb.lianes=n;nb.azalees=na-nc;if(DC)nb.champignons=nc;}
  // ---- 2 · LE PUITS : les cristaux de la géode (AU HASARD : leur teinte — améthyste, émeraude, citrine, saphir, quartz rose —, leur nombre, leur taille) ----
  {const P=GROTTE.puits;let n=0;if(P){const N=Math.round((DC?DC.geode.n:170)*MOB),kG=DC?DC.geode.k:1,CR=GT.CRISTAL+32*(DC?DC.geode.teinte:0);
    for(let e=0;e<N*3&&n<N;e++){const u=fr()*2-1,a=fr()*6.2832,s9=Math.sqrt(1-u*u),dv=[s9*Math.cos(a),u,s9*Math.sin(a)];
      let r=P.rg*.85,hit=null;for(;r<P.rg+5*B;r+=1.5){const x=P.cx+dv[0]*r,y=P.gy+dv[1]*r,z=P.cz+dv[2]*r;if(grtDensIci(V,x,y,z)>0){hit=[x-dv[0]*1.5,y-dv[1]*1.5,z-dv[2]*1.5];break;}}
      if(!hit)continue;const k9=2+((fr()*3)|0);
      for(let k=0;k<k9;k++){const len=((k?4:7)+fr()*(k?6:10))*kG,w=(k?.9+fr()*.6:1.5+fr()*.8)*kG,j=k?[(fr()-.5)*.6,(fr()-.5)*.6,(fr()-.5)*.6]:[0,0,0];
        const d9=[dv[0]+j[0],dv[1]+j[1],dv[2]+j[2]],l9=Math.hypot(d9[0],d9[1],d9[2]);d9[0]/=l9;d9[1]/=l9;d9[2]/=l9;
        const p=[hit[0]+(fr()-.5)*(k?5:1),hit[1]+(fr()-.5)*(k?5:1),hit[2]+(fr()-.5)*(k?5:1)];
        if(!grtLibre(R,p[0],p[2],p[1]-len,p[1]+len,2))continue;grtPrisme(D,V,p[0],p[1],p[2],d9,6,w,0,len,CR,fr()*6);}
      n++;}}nb.cristaux=n;}
  // ---- 3 · LES STALACTITES : les concrétions, des cônes à six pans (AU HASARD : leur densité, pendues ou dressées, leur hauteur, leur teinte) ----
  {let n=0;const N=Math.round((VZ?240:140)*MOB*(DC?DC.stal.dens:1)),g9=VZ?1.25:1,pP=DC?DC.stal.pend:.55,hk=DC?DC.stal.haut:1,CT=GT.CONCRETION+32*(DC?DC.stal.teinte:0);
    for(let e=0;e<N*8&&n<N;e++){const q=prisK('stal');if(q<0)break;const xz=cote(q,RHd+8+fr()*(VZ?R.RH[q]*.8:118)),pend=fr()<pP,k=.75+fr()*.5;
      if(pend){const yc=plafond(xz[0],R.Y[q]+8,xz[1],VZ?R.UP[q]*1.5:150);if(yc==null)continue;const Ld=(8+fr()*38)*(VZ?2.6:1)*hk;if(!grtLibre(R,xz[0],xz[1],yc-Ld,yc,5))continue;
        grtPrisme(D,V,xz[0],yc+3,xz[1],BAS,6,3.4*k*(.8+Ld/60)*g9,0,Ld+3,CT,fr()*6,'roche');}
      else{const yf=plancher(xz[0],R.Y[q]-THICK-3,xz[1],VZ?R.DN[q]*1.5+20:140);if(yf==null)continue;const Hs=(6+fr()*30)*(VZ?2.4:1)*hk;if(!grtLibre(R,xz[0],xz[1],yf,yf+Hs,5))continue;
        grtPrisme(D,V,xz[0],yf-2,xz[1],UP,6,3.2*k*(.8+Hs/50)*g9,0,Hs+2,CT,fr()*6,'roche');}
      n++;}nb.concretions=n;}
  // ---- 4 · LE LAC DE LAVE : les chutes de lave (AU HASARD : leur nombre, des ÎLOTS de colonnes de basalte qui sortent du lac) ----
  {let n=0;if(GROTTE.lac){const N=Math.round((DC?DC.lave.chutes:(VZ?14:9))*MOB),cw=VZ?6:3.4;
    for(let e=0;e<N*10&&n<N;e++){const q=prisK('lave');if(q<0)break;const lac=lacDe(q),sd=fr()<.5?-1:1,y=R.Y[q]+28,w=paroi(q,sd,y,RHd+30,VZ?Math.min(R.RH[q]*1.45,640):300);if(!w)continue;
      const x=w[0]+w[2]*(VZ?6:3),z=w[1]+w[3]*(VZ?6:3),yc=plafond(x,y,z,VZ?R.UP[q]*1.6:140);if(yc==null)continue; // (5 m devant la paroi, côté route)
      if(!grtLibre(R,x,z,lac.y-4,yc,5))continue;const h=(yc+2-lac.y)/2;grtBoite(D,V,x,lac.y+h,z,cw,h,cw,GT.LAVE,Math.atan2(w[2],w[3]),'lave');
      for(const u of VZ?[.12,.37,.62,.88]:[.2,.55,.88])lum(x,lac.y+2*h*u,z,VZ?120:78,[1,.36,.07],1.35);n++;}
    if(DC&&DC.lave.ilots){let ni=0;const g9=VZ?1.6:1;for(let e=0;e<DC.lave.ilots*14&&ni<DC.lave.ilots;e++){const q=prisK('lave');if(q<0)break;const l=lacDe(q),xz=cote(q,RHd+40+fr()*(VZ?R.RH[q]*.8:120));
      if(grtIci(V,xz[0],l.y-3,xz[1])!==4)continue;const k9=3+((fr()*4)|0);let ok=0; /* L'ÎLOT : une touffe de colonnes de basalte, dans la lave */
      for(let k=0;k<k9;k++){const x=xz[0]+(fr()-.5)*16*g9,z=xz[1]+(fr()-.5)*16*g9,r=(2.5+fr()*3.5)*g9,h=(8+fr()*26)*g9;if(!grtLibre(R,x,z,l.y-8,l.y+h,r))continue;grtPrisme(D,V,x,l.y-8,z,UP,6,r,r*.85,h+8,GT.BASALTE,fr()*6,'roche');ok++;}
      if(ok){lum(xz[0],l.y+4,xz[1],VZ?60:36,[1,.36,.07],.6);ni++;}}nb.ilots=ni;}}nb.chutes=n;}
  // ---- (LE PONT, un module) : ses piles de basalte, du fond du gouffre au dessous de la dalle (rien sur la route, aucune collision) ----
  if(R.ponts&&R.ponts.length){let np=0;const g9=VZ?1.6:1;for(const pn of R.ponts)for(let s9=pn[0]+30;s9<pn[1]-20;s9+=55*g9){let q=R.i0;while(q<R.n-21&&R.S[q]<s9)q++;
    const x=R.X[q],z=R.Z[q],yt=R.Y[q]-THICK-1.6;let yb=yt-2;while(yb>yt-520&&grtDensIci(V,x,yb,z)>0)yb-=3;if(yt-yb<12)continue;
    grtPrisme(D,V,x,yb-6,z,UP,6,7*g9,4.2*g9,yt-yb+6-2.4,GT.BASALTE,0);grtBoite(D,V,x,yt-1.2,z,ROAD_HALF*.8,1.2,3.4*g9,GT.BASALTE,Math.atan2(R.TX[q],R.TZ[q]));np++;}nb.piles=np;}
  // ---- 5 · LES ABYSSES : capteurs de sculk, piliers de la cité oubliée, feux d'âme (AU HASARD : la densité du sculk, le nombre et l'ARCHITECTURE des piliers — tours, colonnes, arches —, la teinte des âmes) ----
  {let n=0,np=0;const N=Math.round((VZ?90:48)*MOB*(DC?DC.abysse.sculk:1)),NP9=Math.round((DC?DC.abysse.cite*(VZ?1:.57):(VZ?28:16))*MOB),g9=VZ?1.8:1,st=DC?DC.abysse.style:'tours',aw=DC?DC.abysse.ame:0;
    for(let e=0;e<N*8&&n<N;e++){const q=prisK('abysse');if(q<0)break;const xz=cote(q,RHd+6+fr()*(VZ?R.RH[q]*.7:76)),yf=plancher(xz[0],R.Y[q]-THICK-3,xz[1],VZ?R.DN[q]*1.5+20:90);if(yf==null)continue;
      if(!grtLibre(R,xz[0],xz[1],yf,yf+5*g9,3*g9))continue;grtPrisme(D,V,xz[0],yf-1,xz[1],UP,6,2.6*g9,1.9*g9,2.4*g9,GT.SCULK,fr()*6);
      for(const o of [[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2]])grtPrisme(D,V,xz[0]+o[0]*g9,yf+1.2*g9,xz[1]+o[1]*g9,UP,4,.32*g9,.12*g9,(2.6+fr()*1.2)*g9,GT.CAPTEUR,fr()*6);
      lum(xz[0],yf+4*g9,xz[1],VZ?44:24,[.12,.85,.95],.85);n++;}
    for(let e=0;e<NP9*10&&np<NP9;e++){const q=prisK('abysse');if(q<0)break;const xz=cote(q,RHd+22+fr()*(VZ?R.RH[q]*.7:70)),yf=plancher(xz[0],R.Y[q]-THICK-3,xz[1],VZ?R.DN[q]*1.5+20:110);if(yf==null)continue;
      const yc=plafond(xz[0],yf+2,xz[1],VZ?450:200);let H=(26+fr()*46)*(VZ?2.6:1);if(yc!=null)H=Math.min(H,yc-yf-8);if(H<14)continue;if(!grtLibre(R,xz[0],xz[1],yf,yf+H+5,(st==='arches'?14:6)*g9))continue;
      const rot=fr()*1.5;
      if(st==='colonnes'){grtPrisme(D,V,xz[0],yf-1,xz[1],UP,8,3.6*g9,2.9*g9,H+1,GT.BRIQUE,rot,'roche');grtBoite(D,V,xz[0],yf+H+1.1*g9,xz[1],4.6*g9,1.1*g9,4.6*g9,GT.BRIQUE,rot+.39,'roche');} /* LA COLONNE : un fût à huit pans */
      else if(st==='arches'){const ax=Math.cos(rot)*9*g9,az=-Math.sin(rot)*9*g9; /* L'ARCHE : deux piles et leur linteau */
        for(const sg of [-1,1])grtBoite(D,V,xz[0]+sg*ax,yf+H/2,xz[1]+sg*az,2.6*g9,H/2,2.6*g9,GT.BRIQUE,rot,'roche');grtBoite(D,V,xz[0],yf+H+1.4*g9,xz[1],12.5*g9,1.4*g9,3.2*g9,GT.BRIQUE,rot,'roche');}
      else{grtBoite(D,V,xz[0],yf+H/2,xz[1],3.8*g9,H/2,3.8*g9,GT.BRIQUE,rot,'roche');grtBoite(D,V,xz[0],yf+H+1.1*g9,xz[1],4.8*g9,1.1*g9,4.8*g9,GT.BRIQUE,rot,'roche');}
      grtOcta(D,V,xz[0],yf+H+3.6*g9,xz[1],1.5*g9,2.2*g9,GT.AME+32*aw,fr()*6);lum(xz[0],yf+H+4*g9,xz[1],VZ?60:34,TE(aw,[.25,.75,1]),1.1);np++;}
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
const GRT_U={uTime:{value:0},uTorch:{value:1},uLieu:{value:1},uAmb:{value:new THREE.Color(.05,.05,.06)},uEmi:{value:1},uLav:{value:1},uFlam:{value:1},uLant:{value:1},
  uTorchC:{value:new THREE.Color(1.5,.86,.42)},uLantC:{value:new THREE.Color(1.05,.95,.82)},uLantP:{value:new THREE.Vector3(0,-1e5,0)},
  uMur:{value:GRT_MUR.map(function(c){return new THREE.Vector3(c[0],c[1],c[2]);})},uSol:{value:GRT_SOL.map(function(c){return new THREE.Vector3(c[0],c[1],c[2]);})}};
const GRT_VS=['attribute vec4 aF;attribute vec4 aL;uniform vec3 uMur[6],uSol[6];varying vec3 vW,vMur,vSol;varying vec4 vF,vL;','#include <fog_pars_vertex>',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vF=aF;vL=aL;int s=int(aF.y+.5);vMur=uMur[s];vSol=uSol[s];vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const GRT_FS=['uniform float uTime,uTorch,uLieu,uEmi,uLav,uFlam,uLant;uniform vec3 uAmb,uTorchC,uLantC,uLantP;','varying vec3 vW,vMur,vSol;varying vec4 vF,vL;','#include <fog_pars_fragment>',FG_BRUIT,
  /* (LE DÉCOR AU HASARD, 20/10) la TEINTE d'une matière (aF.w, 0 = la sienne) : 1 émeraude, 2 citrine, 3 saphir, 4 quartz rose, 5 rubis, 6 calcite, 7 violet — GRT_TEINTE */
  'vec3 gTeinte(float w){return w<1.5?vec3(.25,1.,.45):w<2.5?vec3(1.,.72,.12):w<3.5?vec3(.35,.55,1.):w<4.5?vec3(1.,.42,.62):w<5.5?vec3(1.,.16,.18):w<6.5?vec3(.85,.92,1.):vec3(.7,.3,1.);}',
  'void main(){',
  '  vec3 n=normalize(cross(dFdx(vW),dFdy(vW)));if(dot(n,cameraPosition-vW)<0.)n=-n;', // la FACETTE
  '  float mt=floor(vF.x+.5),sal=floor(vF.y+.5),fc=fh3(floor(vW*'+(GRT_VASTE?'.13':'.19')+')+sal*7.);vec3 alb;vec3 em=vec3(0.);',
  '  if(mt<.5){float up=smoothstep(.45,.85,n.y),st=fh2(vec2(floor(vW.y*.14),sal*3.1));alb=mix(vMur,vSol,up)*(.84+.24*st)*(.88+.2*fc);', // la ROCHE : la paroi, le sol, les strates
  '    if(sal>4.5)em=vec3(.10,.85,.95)*step(.8,fc)*up*.7*uEmi*(.3+.7*pow(.5+.5*sin(uTime*2.2-length(vW.xz)*.02+fc*6.),3.));', // le SCULK : des plaques du sol des abysses qui battent en cyan
  '    else if(sal>.5&&sal<1.5)em=vec3(.35,.95,.25)*step(.84,fc)*up*.22*uEmi;}', // la mousse qui luit par plaques
  '  else if(mt<1.5){vec2 p=vW.xz*.035;float f=fn2(p+vec2(uTime*.07,uTime*.045))*.65+fn2(p*2.3-uTime*.11)*.35;',
  '    vec3 c=mix(vec3(.95,.22,.02),vec3(1.,.72,.18),smoothstep(.45,.82,f));c=mix(vec3(.30,.04,.02),c,smoothstep(.28,.42,f));alb=c*.15;em=c*2.2*uLav;}', // la LAVE : des plaques de croûte entre la lave vive
  '  else if(mt<2.5){float f=fn2(vW.xz*.05+vec2(uTime*.05,uTime*.03));alb=mix(vec3(.02,.12,.22),vec3(.06,.30,.42),f);em=vec3(.03,.16,.22)*(.6+.4*f);}', // l'EAU
  '  else if(mt<3.5){alb=mix(vec3(.40,.16,.72),vec3(.72,.42,1.),fc*.7);em=vec3(.55,.22,.95)*(.35+.25*fc)*uEmi*(.8+.2*sin(uTime*1.3+fc*9.));}', // l'AMÉTHYSTE de la géode
  '  else if(mt<4.5)alb=vec3(.42,.25,.12)*(.85+.25*fc);', // le BOIS
  '  else if(mt<5.5){alb=vec3(0.);em=mix(vec3(1.,.5,.12),vec3(1.,.9,.5),fc)*2.6*uFlam*(.82+.18*sin(uTime*13.+vW.x*2.3+vW.z*1.7));}', // la FLAMME des torches
  '  else if(mt<6.5){alb=vec3(.45,.2,.8);em=mix(vec3(.62,.28,1.),vec3(1.,.72,1.),fc)*1.5*uEmi*(.85+.15*sin(uTime*2.+fc*5.));}', // les CRISTAUX
  '  else if(mt<7.5){alb=vec3(.5,.2,.05);em=vec3(1.,.48,.08)*2.*uEmi;}', // les BAIES
  '  else if(mt<8.5)alb=mix(vec3(.10,.34,.08),vec3(.22,.52,.14),fc);', // les FEUILLES
  '  else if(mt<9.5){alb=vec3(1.,.42,.72);em=vec3(1.,.42,.72)*.18;}', // les FLEURS d'azalée
  '  else if(mt<10.5)alb=mix(vec3(.52,.32,.18),vec3(.66,.44,.26),fc)*(.85+.2*fh2(vec2(floor(vW.y*.5),3.)));', // la CONCRÉTION
  '  else if(mt<11.5)alb=vec3(.10,.10,.14)*(.85+.3*fc);', // le BASALTE
  '  else if(mt<12.5){alb=vec3(.02,.09,.12);em=vec3(.10,.8,.92)*step(.7,fc)*.6*uEmi;}', // le SCULK (le pied des capteurs)
  '  else if(mt<13.5){alb=vec3(.05,.6,.7);em=vec3(.06,.80,.95)*1.8*uEmi*(.3+.7*pow(.5+.5*sin(uTime*2.5+fc*6.),3.));}', // les CAPTEURS
  '  else if(mt<14.5)alb=vec3(.13,.14,.19)*(.85+.25*fc);', // les BRIQUES de la cité
  '  else if(mt<15.5){alb=vec3(0.);em=mix(vec3(.2,.75,1.),vec3(.7,1.,1.),fc)*2.4*(.82+.18*sin(uTime*11.+vW.x));}', // le FEU D'ÂME
  '  else if(mt<16.5){alb=vec3(.3,.9,1.);em=vec3(.25,.9,1.)*1.3*uEmi*(.7+.3*sin(uTime*3.+fc*20.));}', // le DIAMANT
  '  else if(mt<17.5){alb=vec3(1.,.75,.15);em=vec3(1.,.72,.15)*.9*uEmi*(.7+.3*sin(uTime*3.+fc*20.));}', // l'OR
  '  else{alb=vec3(.16,.05,.04);em=vec3(1.,.38,.06)*(.25+.75*step(.55,fc))*1.1*uLav*(.75+.25*sin(uTime*2.+fc*8.));}', // le MAGMA du rivage : des facettes qui rougeoient
  '  float tw=floor(vF.w+.5);if(tw>.5){vec3 tc=gTeinte(tw);', /* (LE DÉCOR AU HASARD) les matières teintées : géode, cristaux, baies, fleurs, concrétions, âmes, gemmes */
  '    if(mt>2.5&&mt<3.5){alb=mix(tc*.5,tc*.95,fc*.7);em=tc*(.45+.25*fc)*uEmi*(.8+.2*sin(uTime*1.3+fc*9.));}',
  '    else if(mt>5.5&&mt<6.5){alb=tc*.6;em=mix(tc,mix(tc,vec3(1.),.55),fc)*1.5*uEmi*(.85+.15*sin(uTime*2.+fc*5.));}',
  '    else if(mt>6.5&&mt<7.5){alb=tc*.45;em=tc*2.*uEmi;}',
  '    else if(mt>8.5&&mt<9.5){alb=tc;em=tc*.18;}',
  '    else if(mt>9.5&&mt<10.5)alb=mix(alb,tc*.72,.6);',
  '    else if(mt>14.5&&mt<15.5)em=mix(tc,vec3(1.),.35)*2.4*(.82+.18*sin(uTime*11.+vW.x));',
  '    else if(mt>15.5&&mt<17.5){alb=tc;em=tc*1.2*uEmi*(.7+.3*sin(uTime*3.+fc*20.));}}',
  '  float ao=vF.z/255.,key=.6+.4*max(0.,dot(n,vec3(.3,.86,.41)));',
  '  vec3 dl=uLantP-vW;float d2=dot(dl,dl),lam=max(0.,dot(n,dl))*inversesqrt(d2+1.);vec3 Lc=uLantC*uLant*(.25+.75*lam)/(1.+d2/1600.);',
  '  vec3 col=alb*(((uAmb+uTorchC*(vL.x*uTorch)+vL.yzw*(2.*uLieu))*key+Lc)*ao);',
  '  #ifdef USE_FOG','  float ff=smoothstep(fogNear,fogFar,fogDepth);col=mix(col,fogColor,ff)+em*(1.-ff*.55);','  #else','  col+=em;','  #endif',
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
  {c:[.55,.78,1],v:[0,-16,0],w:.3,z:.28,k:.7},{c:[1,.42,.08],v:[0,7,0],w:2.4,z:.4,k:.95},{c:[.25,1,1],v:[0,2.6,0],w:4,z:.4,k:.8}]; // mine, luxe, géode, stalactites, lave, abysses (z : la taille en mètres)
try{Object.assign(PAL.B,{grottePart:[380,560,700]});}catch(e){}
const GRT_MATS={roche:null,part:null},GRT_FX={part:null,p:null};
function grtMats(){if(GRT_MATS.roche)return GRT_MATS;
  const m=new THREE.ShaderMaterial({uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),GRT_U),vertexShader:GRT_VS,fragmentShader:GRT_FS,fog:true,side:THREE.DoubleSide,extensions:{derivatives:true}});
  m.dispose=function(){};GRT_MATS.roche=m; // jamais libérée : un seul jeu pour toutes les grottes
  const p=new THREE.ShaderMaterial({uniforms:Object.assign({uTime:GRT_U.uTime},GRT_PU),vertexShader:GRT_PART_VS,fragmentShader:GRT_PART_FS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  p.dispose=function(){};GRT_MATS.part=p;return GRT_MATS;}
function grtPartObj(){if(GRT_FX.part)return GRT_FX.part;const M=grtMats(),n=Math.round(PAL_B9('grottePart',700)*(TEL_NATIF?.75:1)),R9=mulberry32(0x6A7C1E),a=new Float32Array(n*4);for(let i=0;i<n*4;i++)a[i]=R9();
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aR',new THREE.BufferAttribute(a,4));
  const p=new THREE.Points(g,M.part);p.frustumCulled=false;p.visible=false;p.matrixAutoUpdate=false;p.renderOrder=8;scene.add(p);GRT_FX.part=p;GRT_FX.p=JSON.parse(JSON.stringify(GRT_PART[0]));return p;}
/* ---------------- LA CONSTRUCTION ----------------
   1 · les échantillons de route, la boîte, la grille ; 2 · CREUSER (en tranches au pré-bâti) ; 3 · le puits, les lacs, les piliers ; 4 · les
   décors et leurs lumières ; 5 · les MAILLES, tronçon par tronçon, du départ vers l'arrivée — au pré-bâti, toutes ; en direct (le premier
   portail, un rejouer), les 1 100 premiers mètres tout de suite et le reste quelques millisecondes par image (grotteTick). */
function grotteVide(){
  if(GROTTE.root){GROTTE.root.traverse(function(o){if(o.userData.jeter&&o.geometry)o.geometry.dispose();});GROTTE.root=null;}
  GROTTE.V=null;GROTTE.R=null;GROTTE.grp=[];GROTTE.file=null;GROTTE.fi=0;GROTTE.msFile=0;GROTTE.pret=false;GROTTE.col=null;GROTTE.salle=-1;GROTTE.piliers=null;
  GROTTE.puits=null;GROTTE.lac=null;GROTTE.eau=null;GROTTE.lacs=null;GROTTE.eaux=null;GROTTE.deco=null;GROTTE.geoW=0;GROTTE.geoC=null;GROTTE.dec=null;GROTTE.LL=null;GROTTE.heurt='';}
function buildGrotte(seed){jadeFini(buildGrotteG(seed));} // d'un trait au passage ; en tranches d'avance (prebDecorG)
function* buildGrotteG(seed){ // ses rendez-vous (JF.lim) ne rendent la main qu'au pré-bâti
  grotteVide();
  if(PARK.on||!LVL.cur||LVL.cur.id!=='grotte'||!(NP>1)||!GROTTE.salles)return;
  const t0=performance.now(),direct=JF.lim===Infinity,fr=mulberry32((seed^0x6A07E)>>>0),MOB=TEL_NATIF?.75:1;
  const DC=GRT_DECO?grtDecoTire(mulberry32((seed^0x0DEC0A7E)>>>0)):null,gT=DC?DC.geode.teinte:0;GROTTE.deco=DC;GROTTE.geoW=gT;GROTTE.geoC=gT?GRT_GEO[gT].c:null; /* LE DÉCOR AU HASARD : son tirage, à part */
  GROTTE.met=GRT_MET[LVL.cur.meteo]?LVL.cur.meteo:'matin';GROTTE.n={};
  const root=new THREE.Group();root.matrixAutoUpdate=false;scene.add(root);GROTTE.root=root;trackMeshes.push(root);
  const R=grtEchantillons();GROTTE.R=R;if(DC&&!DC.luxe.lac){GROTTE.eaux=[];GROTTE.eau=null;} /* (au hasard : la grotte luxuriante sans son lac) */
  let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;
  for(let q=0;q<R.n;q++){const r=R.RH[q]*1.4+20;x0=Math.min(x0,R.X[q]-r);x1=Math.max(x1,R.X[q]+r);z0=Math.min(z0,R.Z[q]-r);z1=Math.max(z1,R.Z[q]+r);
    y0=Math.min(y0,R.Y[q]-R.DN[q]*1.4-20);y1=Math.max(y1,R.Y[q]+R.UP[q]*1.4+20);}
  const P=GROTTE.puits;if(P){const r=Math.max(P.R0,P.R1)+GRV.ent*1.12+60;x0=Math.min(x0,P.cx-r);x1=Math.max(x1,P.cx+r);z0=Math.min(z0,P.cz-r);z1=Math.max(z1,P.cz+r);y0=Math.min(y0,P.yB-40);y1=Math.max(y1,P.yT+40);}
  const V=grtMonde(x0,y0,z0,x1,y1,z1);GROTTE.V=V;
  if(performance.now()>JF.lim)yield;
  const tm={ech:Math.round(performance.now()-t0)};let t9=performance.now();
  /* (le pas de creusement suit la largeur : un ellipsoïde tous les rh/3,2 m — entre deux, le creux des parois fait ~1,5 m, sous la facette et le bruit) */
  for(let q=0,ac=1e9,nq=0;q<R.n;q++){ac+=6;if(ac<Math.max(6,R.RH[q]/3.2)&&!R.EXT[q])continue;ac=0;grtCreuse1(V,R,q);if((++nq&7)===7&&performance.now()>JF.lim)yield;}
  tm.creuse=Math.round(performance.now()-t9);t9=performance.now();
  grtPuits(V,R);tm.puits=Math.round(performance.now()-t9);if(performance.now()>JF.lim)yield;
  t9=performance.now();grtLacs(V,R);GROTTE.piliers=grtPiliers(V,R,fr,DC);V.nzc=null;tm.lacs=Math.round(performance.now()-t9);if(performance.now()>JF.lim)yield; // (le cache du bruit ne sert plus)
  t9=performance.now();const dec=grtDecors(V,R,fr,MOB,DC);tm.decors=Math.round(performance.now()-t9);GROTTE.tm=tm;
  GROTTE.dec=dec.D;GROTTE.LL=grtLumListes(V,dec.T,dec.P);Object.assign(GROTTE.n,dec.n);GROTTE.n.lumieres=dec.P.length;GROTTE.n.piliers=GROTTE.piliers.length;
  GROTTE.n.troncons=V.pool.length;GROTTE.n.air=V.nAir;GROTTE.n.col=GROTTE.col.n;GROTTE.msCreuse=tm.creuse+tm.puits;
  if(performance.now()>JF.lim)yield;t9=performance.now();
  const ord=[];for(let c=0;c<V.pool.length;c++)ord.push(c);ord.sort(function(a,b){return V.chS[a]-V.chS[b];});GROTTE.file=ord;GROTTE.fi=0;
  while(GROTTE.fi<ord.length){const c=ord[GROTTE.fi];if(direct&&R.S[Math.min(R.n-1,V.chS[c])]>1100)break;grtTroncon(c);GROTTE.fi++;if(performance.now()>JF.lim)yield;}
  GROTTE.pret=GROTTE.fi>=ord.length;tm.mailles=Math.round(performance.now()-t9);
  GROTTE.ms=Math.round(performance.now()-t0);
  grotteMeteo(GROTTE.met,started?bioPortDur():.01);
}
function grtTroncon(c){const V=GROTTE.V,d=V.cle[c],ci=d%V.CX,cj=((d/V.CX)|0)%V.CY,ck=(d/(V.CX*V.CY))|0,C=16*V.B,M=grtMats(),LL=GROTTE.LL&&GROTTE.LL.get(d)||null;
  const g=new THREE.Group();g.position.set(V.ox+ci*C,V.oy+cj*C,V.oz+ck*C);g.matrixAutoUpdate=false;g.updateMatrix();
  const mk=function(p){const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(p.P,3));ge.setAttribute('aF',new THREE.BufferAttribute(p.F,4));ge.setAttribute('aL',new THREE.BufferAttribute(p.L,4,true));
    if(p.I)ge.setIndex(new THREE.BufferAttribute(p.I,1));ge.computeBoundingSphere();const me=new THREE.Mesh(ge,M.roche);me.matrixAutoUpdate=false;me.updateMatrix();me.userData.jeter=1;g.add(me);};
  const m=grtMailleNets(V,c,LL);GROTTE.n.triangles=(GROTTE.n.triangles|0)+m.nt;if(m.nt)mk(m);
  const L9=GROTTE.dec&&GROTTE.dec.get(d);
  if(L9&&L9.length){const qs=V.chS[c],sal=qs<1e9&&GROTTE.R?GROTTE.R.SAL[Math.min(GROTTE.R.n-1,qs)]:0,p=grtMailleDecor(V,c,L9,LL,sal);if(p.nv){mk(p);GROTTE.n.decors=(GROTTE.n.decors|0)+L9.length;GROTTE.n.triangles+=p.I.length/3;}}
  g.userData.c=new THREE.Vector3(g.position.x+C/2,g.position.y+C/2,g.position.z+C/2);GROTTE.root.add(g);GROTTE.grp.push(g);}
function grtTranches(ms){const F=GROTTE.file;if(!F||GROTTE.fi>=F.length)return;const t0=performance.now();
  while(GROTTE.fi<F.length&&performance.now()-t0<ms){grtTroncon(F[GROTTE.fi]);GROTTE.fi++;}
  GROTTE.msFile+=performance.now()-t0;if(GROTTE.fi>=F.length)GROTTE.pret=true;}
/* ---------------- LES MÉTÉOS : la grotte glisse d'un temps à l'autre au même fondu que l'ambiance ---------------- */
function grotteMeteo(m,dur){grtDecoActive();const T9=GRT_MET[m]||GRT_MET.matin;GROTTE.met=GRT_MET[m]?m:'matin';
  if(!GROTTE.cur)GROTTE.cur=JSON.parse(JSON.stringify(T9));
  GROTTE.de=JSON.parse(JSON.stringify(GROTTE.cur));GROTTE.to=T9;GROTTE.k=0;GROTTE.dur=Math.max(.01,dur||1.2);}
function grtPas(dt){if(!GROTTE.cur||GROTTE.k>=1)return;GROTTE.k=Math.min(1,GROTTE.k+dt/GROTTE.dur);const e=GROTTE.k*GROTTE.k*(3-2*GROTTE.k),a=GROTTE.de,b=GROTTE.to,o=GROTTE.cur;
  for(const k in b)o[k]=a[k]+(b[k]-a[k])*e;}
function grtBioNom(met,k){return 'grt-'+(GRT_MET[met]?met:'matin')+'-'+GRT_SALLES[k|0];}
function grtSalleIci(sc){const R=GROTTE.R;if(!R)return 0;let lo=R.i0,hi=R.n-21;while(lo<hi){const m=(lo+hi+1)>>1;if(R.S[m]<=sc)lo=m;else hi=m-1;}return R.SAL[lo];}
const GRT_V=new THREE.Vector3();
function grotteTick(dt){
  const on=!!GROTTE.root&&!!LVL.cur&&LVL.cur.id==='grotte'&&!PARK.on;
  if(!on){if(GRT_FX.part&&GRT_FX.part.visible)GRT_FX.part.visible=false;if(GROTTE.root&&!GROTTE.root.parent)grotteVide();return;} // (la grotte quittée : ses mailles rendues à la carte graphique tout de suite, pas au prochain passage)
  if(GROTTE.file&&GROTTE.fi<GROTTE.file.length)grtTranches(paused?12:4); // LES TRANCHES : la grotte se finit quelques millisecondes par image
  const U=GRT_U,c=GROTTE.cur||(grotteMeteo(GROTTE.met,.01),GROTTE.cur),vit=!paused;grtPas(dt);if(vit)U.uTime.value+=dt;
  U.uTorch.value=c.torche;U.uLieu.value=c.lieu;U.uAmb.value.setRGB(c.amb*.85,c.amb*.9,c.amb*1.15);U.uEmi.value=c.emi;U.uLav.value=c.lav;U.uFlam.value=c.flam;
  U.uLant.value=c.lant*(mode==='boom'||!carGroup.visible?0:1);
  GRT_V.set(0,0,1).applyQuaternion(carGroup.quaternion);U.uLantP.value.copy(carGroup.position).addScaledVector(GRT_V,12);U.uLantP.value.y+=2;
  // LA SALLE : sous la caisse (en vol, la route survolée) ; en entrant, l'ambiance de la salle (2,4 s)
  const k=grtSalleIci(mode==='fall'?lastNearS:s);
  if(k!==GROTTE.salle){const nm=grtBioNom(GROTTE.met,k);if(!BIOMES[nm]||BIO.name===nm)GROTTE.salle=k;else if(BIO.k>=1){bioGo(nm,2.4);GROTTE.salle=k;}} // (pendant le fondu du portail : on attend qu'il finisse)
  // LES TRONÇONS : cachés au-delà du brouillard
  {const ff=((scene.fog&&scene.fog.far)||800)+GRV.cull,cp=camera.position,f2=ff*ff;for(const g of GROTTE.grp){const b=g.userData.c,v=(cp.x-b.x)**2+(cp.y-b.y)**2+(cp.z-b.z)**2<f2;if(g.visible!==v)g.visible=v;}}
  // LES POUSSIÈRES
  {const P=grtPartObj(),cur=GRT_FX.p,to=GRT_PART[k]||GRT_PART[0],a=Math.min(1,dt*1.2);
   for(const f of ['w','z','k'])cur[f]+=(to[f]-cur[f])*a;for(let i=0;i<3;i++){cur.c[i]+=(to.c[i]-cur.c[i])*a;cur.v[i]+=(to.v[i]-cur.v[i])*a;}
   const u=GRT_PU;u.uK.value=cur.k*c.part*(GROTTE.deco?GROTTE.deco.brume:1);u.uSz.value=cur.z;u.uSw.value=cur.w;u.uVel.value.fromArray(cur.v);u.uPC.value.setRGB(cur.c[0],cur.c[1],cur.c[2]);u.uPx.value=renderer.getPixelRatio();
   u.uBoxC.value.copy(camera.position);P.visible=u.uK.value>.01;}
}
/* ---------------- CE QUI TUE EN VOL : la roche (la densité au point, la surface qu'on voit), la lave, l'eau, et les gros décors (boîtes orientées) ---------------- */
function grotteHeurt(p){const V=GROTTE.V;if(!V)return '';
  if(grtDensIci(V,p.x,p.y,p.z)<=0){const a=grtIci(V,p.x,p.y,p.z),b=grtIci(V,p.x,p.y-4,p.z);return a===4||b===4?'lave':a===5||b===5?'eau':'roche';}
  const G=GROTTE.col;if(G){const a=G.G.get(Math.floor(p.x/64)+','+Math.floor(p.z/64));
    if(a)for(let i=0;i<a.length;i++){const o=a[i],dx=p.x-o.x,dz=p.z-o.z,lx=dx*o.c-dz*o.s,lz=dx*o.s+dz*o.c;
      if(Math.abs(lx)<o.hx+1&&Math.abs(p.y-o.y)<o.hy+1&&Math.abs(lz)<o.hz+1)return o.k;}}
  return '';}
/* ---------------- LA CHAUFFE AU MENU : la roche et les poussières ---------------- */
function grotteChauffe(){const M=grtMats(),g9=new THREE.BufferGeometry();
  g9.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,0,1],3));g9.setAttribute('aF',new THREE.BufferAttribute(new Uint8Array(12),4));g9.setAttribute('aL',new THREE.BufferAttribute(new Uint8Array(12),4,true));
  const me=new THREE.Mesh(g9,M.roche),P=grtPartObj();me.frustumCulled=false;const g=new THREE.Group();g.add(me);scene.add(g);
  const v=P.visible;P.visible=true;try{chauffeRendu([g,P]);}finally{scene.remove(g);P.visible=v;g9.dispose();}}
/* ---------------- LA CONSOLE ---------------- */
window.dbgGrotte=function(k,o){
  if(k==='test'){ // LA RÈGLE D'OR : de l'air tous les 6 m au bord et au milieu de la route, sous la dalle (−THICK−1,5), dessus (+1,5) et à hauteur de saut (+14) ; aucun décor dur
    if(!GROTTE.V)return 'pas de grotte bâtie';let roc=0,dec=0;const ou=[],F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},p=new THREE.Vector3();
    for(let s9=0;s9<L;s9+=6){frameAt(s9,F9);for(const lt of [-ROAD_HALF,0,ROAD_HALF])for(const h of [-THICK-1.5,1.5,14]){p.copy(F9.p).addScaledVector(F9.b,lt).addScaledVector(F9.n,h);
      if(!grotteHeurt(p))continue;if(grtDensIci(GROTTE.V,p.x,p.y,p.z)<=0){roc++;if(ou.length<30)ou.push('R'+Math.round(s9)+'('+lt+','+h+')');}else{dec++;if(ou.length<30)ou.push('D'+Math.round(s9));}}}
    return {roche:roc,decors:dec,ou:ou.join(' ')};}
  if(k==='meteo'){grotteMeteo(o||'nuit',.01);GROTTE.cur=JSON.parse(JSON.stringify(GRT_MET[GROTTE.met]));GROTTE.k=1;const nm=grtBioNom(GROTTE.met,Math.max(0,GROTTE.salle));
    if(BIOMES[nm]){bioGo(nm,.01);BIO.k=0;bioStep(1);}grotteTick(0);return GROTTE.met;} // (tout de suite, même en pause : les photos)
  if(k==='reprend'){if(paused)togglePause();return 'reprise';}
  if(k==='vue'&&o){if(started&&!gameOver&&!paused)togglePause();camera.position.fromArray(o.p);camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3().fromArray(o.c));camera.updateMatrixWorld();
    if(o.fov){camera.fov=o.fov;camera.updateProjectionMatrix();}skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);
    {const ff=((scene.fog&&scene.fog.far)||800)+GRV.cull,cp=camera.position;for(const g of GROTTE.grp){const b=g.userData.c;g.visible=(cp.x-b.x)**2+(cp.y-b.y)**2+(cp.z-b.z)**2<ff*ff;}}
    if(scene.fog){scene.fog.color.copy(FOG_BASE);scene.fog.near=FOG_N;scene.fog.far=FOG_F;} // (2026-10-19) la brume de la salle : en pause la boucle ne la recopie pas — les photos du banc avaient toutes celle de la mine
    GRT_PU.uBoxC.value.copy(camera.position);if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'ok';}
  /* les PHOTOS (en pause) : 'salle' (o.k = mine|luxe|geode|stal|lave|abysse|fin, o.d m après l'entrée, o.h m de haut, o.r m en arrière) · 'puits' : du bord
     intérieur du premier tour, le regard sur le tour d'en dessous et la géode — le raccourci tel qu'on le voit avant de sauter */
  if(k==='salle'){const R=GROTTE.R;if(!R)return 'pas de grotte';const sb=o&&o.s!=null?o.s:R.bornes[(o&&o.k)||'luxe']; /* (o.s : une abscisse de la route, au lieu d'une salle) */if(sb==null)return 'pas de salle';
    const s9=Math.max(0,Math.min(L-1,sb+((o&&o.d)||60))),F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};frameAt(s9,F9);
    const r=(o&&o.r)||22,h=(o&&o.h)||9,p=F9.p.clone().addScaledVector(F9.t,-r).addScaledVector(F9.n,h),c=F9.p.clone().addScaledVector(F9.t,120).addScaledVector(F9.n,h*.4);
    const k9=grtSalleIci(s9),nm=grtBioNom(GROTTE.met,k9);if(BIOMES[nm]){bioGo(nm,.01);BIO.k=0;bioStep(1);}GROTTE.salle=k9;
    return window.dbgGrotte('vue',{p:p.toArray(),c:c.toArray(),fov:o&&o.fov});}
  if(k==='puits'){const P=GROTTE.puits;if(!P)return 'pas de puits';const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
    frameAt(Math.min(L-1,P.s0+((o&&o.d)||300)),F9);const dx=P.cx-F9.p.x,dz=P.cz-F9.p.z,l=Math.hypot(dx,dz);
    const p=[F9.p.x+dx/l*(ROAD_HALF*.6),F9.p.y+((o&&o.h)||16),F9.p.z+dz/l*(ROAD_HALF*.6)],c=[F9.p.x+dx/l*90+F9.t.x*120,F9.p.y-70,F9.p.z+dz/l*90+F9.t.z*120];
    const nm=grtBioNom(GROTTE.met,2);if(BIOMES[nm]){bioGo(nm,.01);BIO.k=0;bioStep(1);}GROTTE.salle=2;
    return window.dbgGrotte('vue',{p:p,c:c,fov:o&&o.fov});}
  return {on:!!GROTTE.root,met:GROTTE.met,salle:GROTTE.salle,ms:GROTTE.ms,msCreuse:GROTTE.msCreuse,msFile:Math.round(GROTTE.msFile||0),pret:GROTTE.pret,tm:GROTTE.tm,
    file:GROTTE.file?GROTTE.file.length-GROTTE.fi:0,n:GROTTE.n,conflits:GROTTE.conflits,croise:GROTTE.croise,L:Math.round(L),
    salles:GROTTE.R?GROTTE.R.bornes:null,spi:GROTTE.spi&&{R0:Math.round(GROTTE.spi.R0),R1:Math.round(GROTTE.spi.R1),tours:GROTTE.spi.tours,pas:Math.round(GROTTE.spi.pas),descente:Math.round(GROTTE.spi.y0-GROTTE.spi.y1)},
    lac:GROTTE.lac&&Math.round(GROTTE.lac.y),eau:GROTTE.eau&&Math.round(GROTTE.eau.y),geode:GROTTE.puits&&Math.round(GROTTE.puits.rg),
    lacs:GROTTE.lacs&&GROTTE.lacs.length,ponts:GROTTE.R&&GROTTE.R.ponts,portes:GROTTE.R&&GROTTE.R.portes,hz:GROTTE.hz||null,deco:grtDecoTexte(GROTTE.deco)};}; /* (20/10) hz : LE TRACÉ AU HASARD · deco : LE DÉCOR AU HASARD */
/* ---------------- LES AMBIANCES : une par salle et par météo (appelée après les biomes du volcan, une fois BIOMES né) ----------------
   La grammaire des nuits de la bible (deux températures : la brume froide et sombre, la lumière du lieu chaude ou colorée), la brume est la
   couleur de la grotte AU LOIN (jamais un gris : un teal profond, un violet, un ambre, un pourpre, un noir bleuté). Ciel = brume (on ne le voit
   jamais : la roche est partout). Puis LA RECETTE COMMUNE des maps (`grtConti`, après CONTI) : saturation, contraste, vignette, contre-jour
   rose, bitume commun, par temps — la grotte parle la langue des six autres. */
const GRT_BIO_S={mine:{fog:[.07,.048,.033],hemiS:[.40,.32,.26],hemiG:[.34,.20,.10],fillC:[1,.58,.26],kickC:[1,.46,.30]},
    luxe:{fog:[.028,.088,.074],hemiS:[.28,.48,.40],hemiG:[.22,.42,.14],fillC:[1,.58,.20],kickC:[.50,1,.70]},
    geode:{fog:[.074,.032,.13],hemiS:[.46,.32,.70],hemiG:[.36,.16,.52],fillC:[.78,.40,1],kickC:[1,.45,1]},
    stal:{fog:[.094,.066,.042],hemiS:[.50,.42,.32],hemiG:[.36,.26,.16],fillC:[1,.72,.40],kickC:[1,.56,.40]},
    lave:{fog:[.15,.04,.022],hemiS:[.38,.22,.30],hemiG:[.70,.18,.04],fillC:[1,.36,.08],kickC:[1,.30,.12]},
    abysse:{fog:[.01,.045,.06],hemiS:[.12,.30,.36],hemiG:[.04,.20,.24],fillC:[.12,.80,.90],kickC:[.30,.90,1]}};
const GRT_BIO_M={matin:{k:1,fogN:50,fogF:680,hemiI:.52,fillI:.34,expo:1,bloomS:.55,bloomT:.86},midi:{k:.9,fogN:60,fogF:740,hemiI:.46,fillI:.42,expo:1,bloomS:.66,bloomT:.82},
    soir:{k:1.05,fogN:50,fogF:640,hemiI:.5,fillI:.42,expo:.98,bloomS:.62,bloomT:.84},nuit:{k:.5,fogN:30,fogF:460,hemiI:.3,fillI:.26,expo:1,bloomS:.6,bloomT:.84}};
function grtHx(c,k){return '#'+c.map(function(v){return ('0'+Math.round(Math.min(1,Math.pow(Math.max(0,v*k),1/2.2))*255).toString(16)).slice(-2);}).join('');}
function grtBiomes(){if(typeof BIOMES==='undefined'||!BIOMES.nuagesNuit)return;
  const S=GRT_BIO_S,M=GRT_BIO_M,hx=grtHx;
  for(const m in M)for(const k of GRT_SALLES){const a=S[k],b=M[m],kc=GRV.fogS[GRT_SALLES.indexOf(k)]*(k==='mine'?1:GRV.fogC),f=a.fog.map(function(v){return v*b.k*kc;}),sky=f.map(function(v){return v*.8;});
    BIOMES['grt-'+m+'-'+k]=bioMet(BIOMES.nuagesNuit,{nm:'GROTTE · '+k.toUpperCase()+' · '+m.toUpperCase(),jour:1,jZen:sky,jMid:sky,jHor:f,jSol:f,sunTint:[.5,.5,.6],sunHalo:0,stars:0,moon:0,city:0,
      fog:f,fogN:b.fogN*(k==='mine'?1:GRV.fog*GRV.fogN),fogF:b.fogF*(k==='mine'?1:GRV.fog),fogCj:f, /* (GROTTE VASTE) la mine, étroite, garde sa brume : au-delà, des tronçons cachés en moins */fogIn:f.map(function(v){return v*1.6;}),hemiS:a.hemiS,hemiG:a.hemiG,hemiI:b.hemiI,sunC:[.5,.5,.62],sunI:.12,fillC:a.fillC,fillI:b.fillI,kickC:a.kickC,kickI:.22,
      expo:b.expo,sat:1.04,con:1.16,rtK:1,wb:[1,1,1],sh:[0,.006,.02],hi:[.01,.004,-.004],daSh:.4,vigK:.46,vigC:[.01,.01,.03],bloomS:b.bloomS,bloomT:b.bloomT,rimK:.8,
      env:[[0,hx(f,.6)],[.3,hx(f,1.6)],[.48,hx(a.fillC,.35)],[.58,hx(a.fillC,.55)],[.66,hx(f,1.2)],[1,hx(f,.5)]],
      eS1:a.fillC.map(function(v){return Math.round(Math.min(1,v)*255);}).concat([.42]),eS2:a.kickC.map(function(v){return Math.round(Math.min(1,v)*255);}).concat([.26])});}}
/* (LE DÉCOR AU HASARD) la géode d'une autre teinte : les COULEURS de ses quatre ambiances (brume, ciel, lumières, reflets) refaites en place — le reste
   (la recette commune, la bulle de contre-jour) ne bouge pas ; g = null : celles de l'améthyste d'avant */
function grtBioGeode(g){if(typeof BIOMES==='undefined')return;const a=g||GRT_BIO_S.geode,k='geode',kc=GRV.fogS[GRT_SALLES.indexOf(k)]*GRV.fogC;
  for(const m in GRT_BIO_M){const B9=BIOMES['grt-'+m+'-'+k];if(!B9)continue;const b=GRT_BIO_M[m],f=a.fog.map(function(v){return v*b.k*kc;}),sky=f.map(function(v){return v*.8;});
    Object.assign(B9,{jZen:sky,jMid:sky.slice(),jHor:f,jSol:f.slice(),fog:f.slice(),fogCj:f.slice(),fogIn:f.map(function(v){return v*1.6;}),hemiS:a.hemiS.slice(),hemiG:a.hemiG.slice(),fillC:a.fillC.slice(),
      env:[[0,grtHx(f,.6)],[.3,grtHx(f,1.6)],[.48,grtHx(a.fillC,.35)],[.58,grtHx(a.fillC,.55)],[.66,grtHx(f,1.2)],[1,grtHx(f,.5)]],
      eS1:a.fillC.map(function(v){return Math.round(Math.min(1,v)*255);}).concat([.42]),eS2:a.kickC.map(function(v){return Math.round(Math.min(1,v)*255);}).concat([.26])});}}
let GRT_GEO_ACT=0;
function grtDecoActive(){if(!GRT_DECO)return;const D=GROTTE.deco,w=D?D.geode.teinte:0;if(GRT_GEO_ACT===w)return;GRT_GEO_ACT=w;const g=GRT_GEO[w]; /* la géode de CETTE grotte entre en scène */
  const mu=g?g.mur:GRT_MUR[2],so=g?g.sol:GRT_SOL[2];GRT_U.uMur.value[2].set(mu[0],mu[1],mu[2]);GRT_U.uSol.value[2].set(so[0],so[1],so[2]);
  GRT_PART[2].c=(g?g.pa:[1,.55,1]).slice();grtBioGeode(g);}
function grtConti(){for(const m of ['matin','midi','soir','nuit']){const r=CONTI.temps[m];if(!r)continue;for(const k of GRT_SALLES){const b=BIOMES['grt-'+m+'-'+k];if(!b)continue;
  for(const f in r)if(f!=='stars')b[f]=Array.isArray(r[f])?r[f].slice():r[f];}}}
function grtTextes(){Object.assign(I18N,{'LES PROFONDEURS':'THE DEPTHS','LA ROCHE NE PARDONNE PAS':'THE ROCK NEVER FORGIVES','TORCHES':'TORCHES','CRISTAUX':'CRYSTALS','MAGMA':'MAGMA','NOIR COMPLET':'PITCH BLACK',
  'SUIS LES TORCHES':'FOLLOW THE TORCHES','LES CRISTAUX T ECLAIRENT':'THE CRYSTALS LIGHT YOUR WAY','LA LAVE MONTE':'THE LAVA IS RISING','TES PHARES, TA SEULE LUMIERE':'YOUR HEADLIGHTS, YOUR ONLY LIGHT',
  'AU FOND DE L EAU':'AT THE BOTTOM OF THE WATER'});} // (2026-10-18) LES PROFONDEURS — appelée avec grtBiomes (I18N naît plus bas que ce bloc)
/* <<<FIN GROTTE>>> */
