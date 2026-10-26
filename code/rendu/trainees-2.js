/* LES DIX TRAÎNÉES : (T, C, k, dt, on = nitro allumée, debut = elle vient de s'allumer). Elles sèment des particules (trxNait) et posent
   leurs quads directs (trxQ) ; le chemin, les fantômes et la foudre vivent dans T. */
const TRX_EMET={
  grille:function(T,C,k,dt,on){ // LA GRILLE — le mur de lumière des motos de néon : un pan par pas du chemin, du bitume à 1,05 m, et son liseré couché
    const H=T.H,hm=1.3;let px=C.B.x,py=C.B.y,pz=C.B.z,ux=C.U.x,uy=C.U.y,uz=C.U.z,kp=k;
    for(let i=0;i<H.n;i++){const o=i*3,qx=H.b[o],qy=H.b[o+1],qz=H.b[o+2],age=T.t-H.t[i];if(age>TRX_MUR)break;
      const kk=Math.min(kp,H.k[i]),dx=qx-px,dy=qy-py,dz=qz-pz,l=Math.hypot(dx,dy,dz);
      if(kk>.03&&l>.02&&l<8){const f=kk*(1-Math.pow(age/TRX_MUR,2)),hx=dx*.51,hy=dy*.51,hz=dz*.51,cx=(px+qx)*.5,cy=(py+qy)*.5,cz=(pz+qz)*.5,h2=hm*.5;
        if(age>TRX_MUR*.62&&dt>0&&Math.random()<dt*(C.pv?2.2:3.2)){const d=trxNait(1);if(d){const hh=Math.random()*hm,w=Math.random(); /* (2026-10-17, TRAÎNÉES) LE MUR SE DÉFAIT EN PIXELS : au bout de sa vie, il s'émiette en carrés cyan qui dérivent et clignotent (« celui qui te colle finit en pixels ») */
          d.x=px+dx*w+ux*hh;d.y=py+dy*w+uy*hh;d.z=pz+dz*w+uz*hh;d.vx=(Math.random()-.5)*.8+ux*.5;d.vy=(Math.random()-.5)*.8+uy*.5;d.vz=(Math.random()-.5)*.8+uz*.5;
          d.l=.4+Math.random()*.45;d.w=d.h=.06+Math.random()*.07;d.c=36;d.cr=.35;d.cg=1.35;d.cb=2.1;d.fo=.12;d.bk=.25;}}
        trxQ(1,2,cx+ux*h2,cy+uy*h2,cz+uz*h2,hx,hy,hz,0,ux*h2,uy*h2,uz*h2,3,.3*f,1.5*f,2.4*f,1); /* (2026-10-17) plus haut (1,3 m) et plus franc : de la poursuite on ne voyait qu'un trait */
        let rx=uy*dz-uz*dy,ry=uz*dx-ux*dz,rz=ux*dy-uy*dx;const rw=.09/(Math.hypot(rx,ry,rz)||1);rx*=rw;ry*=rw;rz*=rw; // vu de la poursuite (d'en haut), le mur se lit comme un trait de néon
        trxQ(1,2,cx+ux*hm,cy+uy*hm,cz+uz*hm,hx,hy,hz,0,rx,ry,rz,1,.45*f,1.5*f,2.2*f,1);}
      px=qx;py=qy;pz=qz;kp=H.k[i];ux=H.u[o];uy=H.u[o+1];uz=H.u[o+2];}
    if(!on)return;
    trxQ(1,0,C.B.x+C.U.x*.5,C.B.y+C.U.y*.5,C.B.z+C.U.z*.5,0,.7*k,.7*k,0,0,0,0,0,.35,1.3,2,.8*k); // l'éclat de la tête, au pied du mur
    T.acc+=dt*26*k;while(T.acc>=1){T.acc-=1;const p=trxNait(1);if(!p)break;p.x=C.B.x;p.y=C.B.y;p.z=C.B.z;
      p.vx=(Math.random()-.5)*3+C.U.x*(1+Math.random()*2.5);p.vy=(Math.random()-.5)*3+C.U.y*(1+Math.random()*2.5);p.vz=(Math.random()-.5)*3+C.U.z*(1+Math.random()*2.5);
      trxVit(p,.3);p.g=-9;p.l=.25+Math.random()*.3;p.w=p.h=.06+Math.random()*.05;p.c=0;p.cr=.5;p.cg=1.6;p.cb=2.2;p.fo=.15;}},
  matrice:function(T,C,k,dt,on,debut){if(!on)return; // MATRICE — des colonnes de code qui tombent : la tête blanche, la traîne verte
    T.acc+=dt*(C.pv?13:22)*k;if(debut)T.acc+=C.pv?6:10; /* (2026-10-17, TRAÎNÉES) LE RIDEAU : à l'appui, une averse de colonnes d'un coup (le code « tombe » sur la route) */
    while(T.acc>=1){T.acc-=1;const n=3+((Math.random()*4)|0),lat=(Math.random()-.5)*2.4,up=.15+Math.random()*1.1,ar=Math.random()*.8,l0=.95+Math.random()*.5,vd=1.4+Math.random()*1.2;
      for(let j=0;j<n;j++){const p=trxNait(1);if(!p)return;const h=up+j*.34;
        p.x=C.P.x+C.R.x*lat+C.U.x*h-C.F.x*ar;p.y=C.P.y+C.R.y*lat+C.U.y*h-C.F.y*ar;p.z=C.P.z+C.R.z*lat+C.U.z*h-C.F.z*ar;
        p.vx=-C.U.x*vd;p.vy=-C.U.y*vd;p.vz=-C.U.z*vd;trxVit(p,.86);
        p.l=l0-j*.07;p.w=p.h=.15;p.c0=4;p.cn=8;p.c=4+((Math.random()*8)|0);p.cf=.05+Math.random()*.1;p.fo=.35;p.fi=.04;
        if(j===0){p.cr=1.3;p.cg=2.1;p.cb=1.4;}else{const f=1-j*.13;p.cr=.12*f;p.cg=1.45*f;p.cb=.35*f;}}}},
  anneaux:function(T,C,k,dt,on,debut){if(!on)return; // ANNEAUX D'OR — ils s'échappent comme d'un hérisson qui vient de se cogner, tournent, rebondissent dans l'air, CLIGNOTENT et disparaissent
    let nb=0;T.acc+=dt*(C.pv?9:TRX_DENSE?17:12)*k;while(T.acc>=1){T.acc-=1;nb++;}const fan=debut?(C.pv?10:16):0;nb+=fan; /* (2026-10-17, TRAÎNÉES) LA FONTAINE : à l'appui, les anneaux jaillissent en ÉVENTAIL RÉGULIER (un demi-cercle parfait, le vrai « perdre ses anneaux ») au lieu d'une poignée au hasard */
    for(let q=0;q<nb;q++){const p=trxNait(0);if(!p)return;const fq=q<fan,ang=fq?(q/(fan-1)-.5)*2.8:0;
      const sl=fq?Math.sin(ang)*5.2:(Math.random()-.5)*7,su=fq?2.2+Math.cos(ang)*4.2:2.5+Math.random()*3.5,sa=fq?1.1:1+Math.random()*2,ol=fq?0:(Math.random()-.5)*.6;
      p.x=C.P.x+C.R.x*ol+C.U.x*.25;p.y=C.P.y+C.R.y*ol+C.U.y*.25;p.z=C.P.z+C.R.z*ol+C.U.z*.25;
      p.vx=C.R.x*sl+C.U.x*su-C.F.x*sa;p.vy=C.R.y*sl+C.U.y*su-C.F.y*sa;p.vz=C.R.z*sl+C.U.z*su-C.F.z*sa;trxVit(p,.88);
      p.g=-11;p.dr=.25;p.l=1.15+Math.random()*.5;p.w=p.h=.21;p.c=12;p.fl=7+Math.random()*5;p.bk=.45;p.fo=.12;
      if(Math.random()<.35){const s=trxNait(1);if(s){s.x=p.x;s.y=p.y;s.z=p.z;s.vx=p.vx*.4;s.vy=p.vy*.4;s.vz=p.vz*.4;s.l=.28;s.w=s.h=.24;s.c=2;s.cr=1.7;s.cg=1.4;s.cb=.5;s.fo=.2;s.vr=6;}}}},
  glouton:function(T,C,k,dt,on,debut){ // GLOUTON — une ligne de pastilles posée sur le chemin (une SUPER tous les huit), et quatre fantômes qui la suivent
    if(debut)T.cnt=7; // (2026-10-17, TRAÎNÉES) la ligne COMMENCE par une super-pastille : à l'appui, le premier objet posé est celle qui clignote
    if(on){T.dist+=C.dp;const pas=Math.max(1.05,(dt>0?C.dp/dt:0)*.028);let m=0;while(T.dist>=pas&&m<8){T.dist-=pas;m++;T.cnt++;const p=trxNait(0);if(!p)break;const gros=T.cnt%8===0;
      p.x=C.P.x-C.U.x*.1;p.y=C.P.y-C.U.y*.1;p.z=C.P.z-C.U.z*.1;trxVit(p,0);p.l=2.6;p.c=gros?14:13;p.w=p.h=gros?.2:.15;p.fo=.35;if(gros)p.bk=2.6;}}
    if(on){T.gk=Math.min(1,T.gk+dt*3);T.peur=0;}else if(T.gk>0){T.peur+=dt;if(T.peur>1.1){T.gk=0;T.peur=0;}} // nitro lâchée : ils virent au BLEU, clignotent… et filent
    if(T.gk<=0)return;const v=T.v1,peur=T.peur>0,bl=peur&&T.peur>.7&&((T.t*12)|0)%2;
    const gz=C.pv?(silBlanc()?.48:.3):.4; // (2026-10-17) en boutique les fantômes ×1,6, comme les objets
    for(let i=0;i<4;i++){if(T.gk*4<i+.5)break;trxLe(1.4+i*.95,v,false);const b=.38+Math.sin(T.t*9+i*1.7)*.07,l=i%2?.55:-.55; // en quinconce, au-dessus du ruban de pastilles
      trxQ(0,0,v.x+C.U.x*b+C.R.x*l,v.y+C.U.y*b+C.R.y*l,v.z+C.U.z*b+C.R.z*l,0,gz,gz,0,0,0,0,peur?19:15+i,1,1,1,(bl?.25:1)*Math.min(1,T.gk*4-i));}},
  hyper:function(T,C,k,dt,on,debut){if(!on)return; // HYPERESPACE — les étoiles s'étirent en filés autour de la caisse, un cœur bleu à la tuyère (v2 du 2026-10-18 : voir trxHyFile)
    const pv=C.pv,sk=pv?1:Math.max(.75,Math.min(2,C.V.length()/75)),t=T.t; /* (2026-10-17, TRAÎNÉES) en course, 80 filés fins de 4 cm se confondaient avec les lignes de vitesse du jeu : 130/s, deux fois plus épais, plus longs, et ils gardent plus d'élan (on reste DANS le tunnel) */
    if(debut){ /* LE SAUT (v2) : l'éclair blanc qui se resserre sur la tuyère, l'onde bleue qui s'ouvre, l'ÉCLAT horizontal d'une optique de cinéma, et toutes les étoiles qui s'étirent d'un coup */
      const f=trxNait(1);if(f){f.x=C.P.x;f.y=C.P.y;f.z=C.P.z;trxVit(f,1);f.l=.3;f.w=f.h=pv?1.6:2.6;f.s1=.3;f.c=0;f.cr=1.6;f.cg=1.85;f.cb=2.6;f.fo=.25;}
      const h=trxNait(1);if(h){h.x=C.P.x;h.y=C.P.y;h.z=C.P.z;trxVit(h,1);h.l=.32;h.w=h.h=pv?1.5:2.4;h.s1=1.5;h.c=0;h.cr=.3;h.cg=.62;h.cb=2.4;h.ca=.55;h.fo=.28;}
      const e=trxNait(1);if(e){const hl=pv?2.6:4.8;e.md=1;e.dx=C.R.x;e.dy=C.R.y;e.dz=C.R.z;e.x=C.P.x+C.R.x*hl;e.y=C.P.y+C.R.y*hl;e.z=C.P.z+C.R.z*hl;trxVit(e,1);
        e.ln=hl*2;e.gr=.001;e.w=pv?.08:.16;e.s1=.25;e.c=38;e.l=.3;e.fo=.24;e.cr=1.2;e.cg=1.7;e.cb=2.8;e.cw=.3;e.kr=1.8;e.kg=1.9;e.kb=2.3;}
      for(let i=0;i<(pv?22:56);i++)trxHyFile(C,sk,true);}
    /* LE CŒUR À LA TUYÈRE (v2) : un halo bleu, un point chauffé à blanc, et le JET — une aiguille de lumière qui sort du pot, plus longue avec la vitesse ;
       le moteur de saut BAT (des pouls rapides, un frémissement) */
    const pu=1+.35*Math.pow(Math.max(0,Math.sin(t*15.7)),6)+.06*Math.sin(t*61);
    trxQ(1,0,C.P.x,C.P.y,C.P.z,0,.75*k*pu,.75*k*pu,0,0,0,0,0,.3,.6,2.3,.62*k);
    trxQ(1,0,C.P.x,C.P.y,C.P.z,0,.3*k*pu,.3*k*pu,0,0,0,0,0,1.6,1.8,2.3,.95*k);
    {const hl=(pv?.6:1.15)*Math.sqrt(sk)*k,jx=C.P.x-C.F.x*hl,jy=C.P.y-C.F.y*hl,jz=C.P.z-C.F.z*hl;
      trxQ(1,1,jx,jy,jz,-C.F.x*hl,-C.F.y*hl,-C.F.z*hl,(pv?.07:.12)*pu,0,0,0,37,.32,.7,2.4,.85*k);
      trxQ(1,1,jx,jy,jz,-C.F.x*hl,-C.F.y*hl,-C.F.z*hl,(pv?.025:.04)*pu,0,0,0,37,1.6,1.8,2.3,k);}
    T.acc+=dt*(pv?36:165*(.8+.2*sk))*k;while(T.acc>=1){T.acc-=1;trxHyFile(C,sk,false);}},
  retour:function(T,C,k,dt,on,debut){ // 88 À L'HEURE — deux sillons de feu qui restent sur le bitume, et les arcs bleus du départ
    if(debut){const f=trxNait(1);if(f){f.x=C.P.x+C.U.x*.6;f.y=C.P.y+C.U.y*.6;f.z=C.P.z+C.U.z*.6;trxVit(f,1);f.l=.22;f.w=f.h=C.pv?2.6:3.8;f.s1=1.4;f.c=0;f.cr=1.6;f.cg=1.9;f.cb=2.6;f.fo=.18;}} /* (2026-10-17, TRAÎNÉES) L'ÉCLAIR DU DÉPART : à l'appui, le flash blanc-bleu du saut dans le temps, avant les arcs et les sillons */
    if(debut)for(let q=0;q<16;q++){const p=trxNait(1);if(!p)break;const a=Math.cos(Math.random()*6.283)*1.2,h=.3+Math.random()*.9;
      p.x=C.P.x+C.R.x*a+C.U.x*h;p.y=C.P.y+C.R.y*a+C.U.y*h;p.z=C.P.z+C.R.z*a+C.U.z*h;p.vx=(Math.random()-.5)*4;p.vy=(Math.random()-.5)*4;p.vz=(Math.random()-.5)*4;trxVit(p,.9);
      p.l=.25+Math.random()*.25;p.w=p.h=.35+Math.random()*.3;p.c=2;p.vr=(Math.random()-.5)*10;p.cr=.6;p.cg=1.4;p.cb=2.4;p.fo=.15;}
    if(on&&C.sol){if(C.dp>20)T.dist=0;else T.dist+=C.dp;let m=0;
      const pas=Math.max(.3,(dt>0?C.dp/dt:0)*.011); // ~0,9 m entre deux flammes à 80 m/s : des sillons continus, ~200 flammes en vie au lieu de 550
      while(T.dist>=pas&&m<12){T.dist-=pas;m++;const f=C.dp>1e-4?Math.min(1,T.dist/C.dp):0; // le long du pas de l'image : des sillons CONTINUS même à pleine vitesse
        for(let sd=0;sd<2;sd++){const W=sd?C.WR:C.WL,W0=sd?T.wr0:T.wl0,p=trxNait(1);if(!p)break;
          p.x=W.x+(W0.x-W.x)*f;p.y=W.y+(W0.y-W.y)*f;p.z=W.z+(W0.z-W.z)*f;trxVit(p,0);p.an=true;p.ux=C.U.x;p.uy=C.U.y;p.uz=C.U.z;
          p.w=.28;p.h=.5;p.s1=.2;p.l=(1+Math.random()*.4)*Math.max(.5,k);p.c0=32; /* (2026-10-17) 30 → 50 cm : de la poursuite, les sillons étaient une ligne */p.c2=33;p.c=Math.random()<.5?32:33;p.cf=.07;p.cr=1.5;p.cg=1.15;p.cb=.9;p.fo=.25;}}}
    else if(on){T.acc+=dt*30;while(T.acc>=1){T.acc-=1;for(let sd=0;sd<2;sd++){const W=sd?C.WR:C.WL,p=trxNait(1);if(!p)break; // en vol : les roues lâchent des braises
        p.x=W.x;p.y=W.y;p.z=W.z;p.vx=(Math.random()-.5)*1.5;p.vy=-1-Math.random()*2;p.vz=(Math.random()-.5)*1.5;trxVit(p,.7);p.g=-6;p.l=.4+Math.random()*.3;p.w=p.h=.1;p.c=0;p.cr=1.6;p.cg=.8;p.cb=.25;p.fo=.2;}}}
    T.wl0.copy(C.WL);T.wr0.copy(C.WR);},
  foudre:function(T,C,k,dt,on,debut){ // FOUDRE DIVINE — des éclairs tordus le long du chemin, une branche à chaque coup, accrochés à la tuyère
    const v=T.v1;
    if(on&&debut){let B=null;for(const b of T.bolts)if(!b.on){B=b;break;} /* (2026-10-17, TRAÎNÉES) LA FRAPPE : à l'appui, la foudre TOMBE DU CIEL sur la caisse — un éclair épais de 14 m,
       une branche, un éclair blanc-violet qui inonde la poupe et une gerbe d'étincelles au sol. La mythique a enfin son coup de tonnerre. */
      if(B){B.on=true;B.a=0;B.l=.42;B.n=11;B.wk=2.4;T.boltT=.2;const H=C.pv?4.2:8; /* à l'aperçu, la frappe tombe du haut du CADRE (9 m sortaient de l'image) */
        for(let i=0;i<11;i++){const h=.35+H*(1-i/10),ox=(i&&i<10)?(Math.random()-.5)*1.6:0,oz=(i&&i<10)?(Math.random()-.5)*1.2:0,o=i*3;
          B.p[o]=C.R.x*ox+C.U.x*h-C.F.x*(.4+oz);B.p[o+1]=C.R.y*ox+C.U.y*h-C.F.y*(.4+oz);B.p[o+2]=C.R.z*ox+C.U.z*h-C.F.z*(.4+oz);}
        const sx=Math.random()<.5?-1:1;let bx=B.p[12],by=B.p[13],bz=B.p[14];B.bn=0;
        for(let i=0;i<5;i++){const o=B.bn*3;B.q[o]=bx;B.q[o+1]=by;B.q[o+2]=bz;B.bn++;const dl=.6+Math.random()*.7,dh=-.7-Math.random()*.9;
          bx+=C.R.x*sx*dl+C.U.x*dh;by+=C.R.y*sx*dl+C.U.y*dh;bz+=C.R.z*sx*dl+C.U.z*dh;}}
      const f=trxNait(1);if(f){f.x=C.P.x+C.U.x*.7;f.y=C.P.y+C.U.y*.7;f.z=C.P.z+C.U.z*.7;trxVit(f,1);f.l=.24;f.w=f.h=C.pv?2.4:3.6;f.c=0;f.cr=1.3;f.cg=1.05;f.cb=2.6;f.fo=.2;f.cu=TC_ON?4:0;}
      for(let q=0;q<(C.pv?10:16);q++){const p=trxNait(1);if(!p)break;const a=Math.random()*6.283,sp=2+Math.random()*3;
        p.x=C.P.x;p.y=C.P.y;p.z=C.P.z;p.vx=C.R.x*Math.cos(a)*sp+C.U.x*(1+Math.random()*2.5)-C.F.x*Math.sin(a)*sp;p.vy=C.R.y*Math.cos(a)*sp+C.U.y*(1+Math.random()*2.5)-C.F.y*Math.sin(a)*sp;p.vz=C.R.z*Math.cos(a)*sp+C.U.z*(1+Math.random()*2.5)-C.F.z*Math.sin(a)*sp;
        trxVit(p,.9);p.g=-7;p.l=.3+Math.random()*.3;p.w=p.h=.12+Math.random()*.1;p.c=2;p.vr=(Math.random()-.5)*12;p.cr=1.5;p.cg=1.3;p.cb=2.4;p.fo=.15;p.cu=TC_ON?3:0;}}
    if(on){T.boltT-=dt;if(T.boltT<=0){T.boltT=.06+Math.random()*.07;let B=null;for(const b of T.bolts)if(!b.on){B=b;break;}
      if(B){B.on=true;B.a=0;B.l=.1+Math.random()*.08;B.n=0;B.wk=1;const n=10,L=Math.min(9.5,4+6*k);
        for(let i=0;i<=n;i++){trxLe(L*i/n,v,false);const am=i?(.1+.5*i/n)*(C.pv?1:1.9):0,ox=(Math.random()-.5)*2*am,oy=(Math.random()-.5)*1.4*am,o=B.n*3;
          B.p[o]=v.x+C.R.x*ox+C.U.x*oy-C.P.x;B.p[o+1]=v.y+C.R.y*ox+C.U.y*oy-C.P.y;B.p[o+2]=v.z+C.R.z*ox+C.U.z*oy-C.P.z;B.n++;}
        const j=3+((Math.random()*5)|0),sx=Math.random()<.5?-1:1;let bx=B.p[j*3],by=B.p[j*3+1],bz=B.p[j*3+2];B.bn=0; // la BRANCHE, d'un coude
        for(let i=0;i<4;i++){const o=B.bn*3;B.q[o]=bx;B.q[o+1]=by;B.q[o+2]=bz;B.bn++;const s=.25+Math.random()*.35,u=(Math.random()-.4)*.5;
          bx+=C.R.x*sx*s+C.U.x*u-C.F.x*.3;by+=C.R.y*sx*s+C.U.y*u-C.F.y*.3;bz+=C.R.z*sx*s+C.U.z*u-C.F.z*.3;}
        const s=trxNait(1);if(s){s.x=B.p[j*3]+C.P.x;s.y=B.p[j*3+1]+C.P.y;s.z=B.p[j*3+2]+C.P.z;trxVit(s,.5);s.l=.22;s.w=s.h=.35;s.c=2;s.cr=1.2;s.cg=1;s.cb=2.4;s.fo=.15;s.vr=8;s.cu=TC_ON?3:0;}}}
      if(TC_ON)tcGlow(C.P.x,C.P.y,C.P.z,.9*k,.7,.5,1.6);else trxQ(1,0,C.P.x,C.P.y,C.P.z,0,.55,.55,0,0,0,0,0,.7,.5,2,.6*k);}
    const wb=C.pv?(silBlanc()?2:1):1.7; // (2026-10-17) en boutique, sur le blanc, un éclair de 5 cm de cœur ne se voyait pas : ×2 ; en course il se noyait dans le ruban violet : ×1,7 et deux fois plus écarté
    for(const B of T.bolts){if(!B.on)continue;B.a+=dt;if(B.a>=B.l){B.on=false;continue;} // chaque éclair vit 0,1-0,18 s : il éclate à sa naissance et vacille
      const f=(1-B.a/B.l)*(.7+Math.random()*.3);if(TC_ON){tcBolt(B.p,B.n,f,(B.wk||1)*wb);tcBolt(B.q,B.bn,f*.8,.6*(B.wk||1)*wb);}else{trxBolt(B.p,B.n,f,(B.wk||1)*wb);trxBolt(B.q,B.bn,f*.8,.6*(B.wk||1)*wb);}}},
  blocs:function(T,C,k,dt,on,debut){if(!on)return; // PLUIE DE BLOCS — les sept pièces tombent en tournant PAR QUARTS, comme dans le puits
    let nb=0;T.acc+=dt*(C.pv?7:TRX_DENSE?12:8)*k;while(T.acc>=1){T.acc-=1;nb++;}const fan=debut?7:0;nb+=fan; /* (2026-10-17, TRAÎNÉES) à l'appui, les SEPT pièces jaillissent ensemble en éventail, une de chaque couleur */
    for(let q=0;q<nb;q++){const p=trxNait(0);if(!p)return;const fq=q<fan,ang=fq?(q/6-.5)*2.4:0,lat=fq?0:(Math.random()-.5)*1.4,up=fq?.55:.3+Math.random()*.8,sl=fq?Math.sin(ang)*4.2:(Math.random()-.5)*3,su=fq?2.4+Math.cos(ang)*2.6:1.5+Math.random()*2.5;
      p.x=C.P.x+C.R.x*lat+C.U.x*up;p.y=C.P.y+C.R.y*lat+C.U.y*up;p.z=C.P.z+C.R.z*lat+C.U.z*up;
      p.vx=C.R.x*sl+C.U.x*su-C.F.x*1.5;p.vy=C.R.y*sl+C.U.y*su-C.F.y*1.5;p.vz=C.R.z*sl+C.U.z*su-C.F.z*1.5;trxVit(p,.86);
      p.g=-8;p.l=1.5+Math.random()*.4;p.w=p.h=.32;p.c=fq?20+q:20+((Math.random()*7)|0);p.r=((Math.random()*4)|0)*1.5708;p.sn=.2;p.sg=Math.random()<.5?1:-1;p.fo=.3;}},
  sakura:function(T,C,k,dt,on,debut){if(!on)return; // SAKURA — une pluie de pétales qui volettent, tournoient et se balancent en tombant
    if(debut){const nb=C.pv?18:30;for(let q=0;q<nb;q++){const p=trxNait(0);if(!p)break; /* (2026-10-17, TRAÎNÉES) L'ÉCLOSION : à l'appui, une COROLLE de pétales s'ouvre derrière la poupe (un cercle régulier face à la poursuite), puis retombe en pluie */
      const a=q/nb*6.2832+Math.random()*.15,sp=2.6+Math.random()*.8,ca=Math.cos(a),sa=Math.sin(a);
      p.x=C.P.x+C.U.x*.45;p.y=C.P.y+C.U.y*.45;p.z=C.P.z+C.U.z*.45;
      p.vx=C.R.x*ca*sp+C.U.x*(sa*sp+.8)-C.F.x*.6;p.vy=C.R.y*ca*sp+C.U.y*(sa*sp+.8)-C.F.y*.6;p.vz=C.R.z*ca*sp+C.U.z*(sa*sp+.8)-C.F.z*.6;trxVit(p,.95);
      p.g=-1.4;p.dr=1.6;p.sw=.9;p.sf=3+Math.random()*2;p.sx=C.R.x;p.sy=C.R.y;p.sz=C.R.z;p.vr=(Math.random()-.5)*6;p.fl=3+Math.random()*5;
      p.l=1.6+Math.random()*.7;p.w=p.h=.12+Math.random()*.05;p.c=27+((Math.random()*3)|0);p.fi=.04;p.fo=.6;p.cu=TC_ON?1:0;}}
    T.acc+=dt*(C.pv?20:TRX_DENSE?50:32)*k; /* (2026-10-15 soir) une vraie pluie de pétales en course */
    while(T.acc>=1){T.acc-=1;const p=trxNait(0);if(!p)return;const lat=(Math.random()-.5)*1.6,up=Math.random()*.9,ar=Math.random()*.5,sl=(Math.random()-.5)*2.6,su=.4+Math.random()*1.4,sa=Math.random()*1.2;
      p.x=C.P.x+C.R.x*lat+C.U.x*up-C.F.x*ar;p.y=C.P.y+C.R.y*lat+C.U.y*up-C.F.y*ar;p.z=C.P.z+C.R.z*lat+C.U.z*up-C.F.z*ar;
      p.vx=C.R.x*sl+C.U.x*su-C.F.x*sa;p.vy=C.R.y*sl+C.U.y*su-C.F.y*sa;p.vz=C.R.z*sl+C.U.z*su-C.F.z*sa;trxVit(p,.88);
      p.g=-1.2;p.dr=.9;p.sw=1.1;p.sf=3+Math.random()*2;p.sx=C.R.x;p.sy=C.R.y;p.sz=C.R.z;p.vr=(Math.random()-.5)*5;p.fl=3+Math.random()*5;
      p.l=1.8+Math.random()*.9;p.w=p.h=.1+Math.random()*.06;p.c=27+((Math.random()*3)|0);p.fi=.12;p.fo=.6;p.cu=TC_ON?1:0;}},
  billets:function(T,C,k,dt,on,debut){if(!on)return; // FAIS PLEUVOIR — des billets qui jaillissent, tournoient (recto, verso) et planent
    let nb=0;T.acc+=dt*(C.pv?8:TRX_DENSE?19:12)*k;while(T.acc>=1){T.acc-=1;nb++;}if(debut)nb+=C.pv?10:18;
    for(let q=0;q<nb;q++){const p=trxNait(0);if(!p)return;const lat=(Math.random()-.5)*.8,up=.3+Math.random()*.7,sl=(Math.random()-.5)*7,su=2+Math.random()*3.5,sa=1+Math.random()*2.5;
      p.x=C.P.x+C.R.x*lat+C.U.x*up;p.y=C.P.y+C.R.y*lat+C.U.y*up;p.z=C.P.z+C.R.z*lat+C.U.z*up;
      p.vx=C.R.x*sl+C.U.x*su-C.F.x*sa;p.vy=C.R.y*sl+C.U.y*su-C.F.y*sa;p.vz=C.R.z*sl+C.U.z*su-C.F.z*sa;trxVit(p,.86);
      p.g=-5.5;p.dr=1.4;p.sw=.8;p.sf=4+Math.random()*3;p.sx=C.R.x;p.sy=C.R.y;p.sz=C.R.z;p.vr=(Math.random()-.5)*6;p.fl=6+Math.random()*6;
      p.l=1.8+Math.random()*.6;p.w=p.h=.3;p.c=30;p.c2=31;p.fo=.5;p.cu=TC_ON?2:0;p.bi=tcBilTire();p.wr=tcBilWear();
      if(Math.random()<(debut&&q<10?.8:.28)){const s=trxNait(1);if(s){s.x=p.x;s.y=p.y;s.z=p.z;s.vx=p.vx*.6;s.vy=p.vy*.6;s.vz=p.vz*.6;s.dr=1;s.l=.35+Math.random()*.25;s.w=s.h=.16+Math.random()*.08;s.c=2;s.vr=7;s.cr=1.7;s.cg=1.55;s.cb=.7;s.fo=.2;s.tw=14+Math.random()*8;s.cu=TC_ON?3:0;}}}}, /* (2026-10-17, TRAÎNÉES) l'ÉCLAT DE L'ARGENT : un billet sur quatre lâche une étincelle d'or qui scintille (presque tous à l'allumage) */
  /* (2026-10-16, session TRAÎNÉES — Sacha : « il faut qu'elle donne toute envie d'acheter ») LES TROIS RUBANS ONT ENFIN LEUR SIGNATURE.
     En course on voit ~3 m de traînée dans l'axe : MENTHE, ROSE NÉON et POUDRE D'OR n'étaient qu'un fil d'une autre couleur à côté du
     feu orange. Chacun gagne ses éclats, lancés SUR LES CÔTÉS et VERS LE HAUT (là où la caméra de poursuite les voit), élan gardé ~0,93. */
  bulles:function(T,C,k,dt,on,debut){if(!on)return; // MENTHE — des bulles de savon irisées qui montent de la poupe, se dandinent et CRÈVENT
    let nb=0;T.acc+=dt*(C.pv?6:10)*k;while(T.acc>=1){T.acc-=1;nb++;}if(debut)nb+=C.pv?5:9;
    for(let q=0;q<nb;q++){const p=trxNait(0);if(!p)return;const sd=Math.random()<.5?-1:1,lat=sd*(.35+Math.random()*.6),up=.15+Math.random()*.5,sl=sd*(.5+Math.random()*1.4),su=.7+Math.random()*1.3,sa=.1+Math.random()*.4;
      p.x=C.P.x+C.R.x*lat+C.U.x*up;p.y=C.P.y+C.R.y*lat+C.U.y*up;p.z=C.P.z+C.R.z*lat+C.U.z*up;
      p.vx=C.R.x*sl+C.U.x*su-C.F.x*sa;p.vy=C.R.y*sl+C.U.y*su-C.F.y*sa;p.vz=C.R.z*sl+C.U.z*su-C.F.z*sa;trxVit(p,.975);
      p.g=.5;p.dr=.9;p.sw=.7;p.sf=2+Math.random()*2.5;p.sx=C.R.x;p.sy=C.R.y;p.sz=C.R.z;
      p.l=1.1+Math.random()*1.2;p.w=p.h=C.pv?.17+Math.random()*.2:.09+Math.random()*.1;p.s1=1.3;p.c=34; /* (2026-10-17) en course les objets sont grossis ×2,3 (TRX_GROS) : une bulle de 85 cm couvrait la poupe — 20 à 45 cm */p.fi=.12;p.fo=.06;p.mo=1;}},
  neon:function(T,C,k,dt,on,debut){if(!on)return; // ROSE NÉON — des cœurs d'enseigne en tube de néon, qui grésillent ; à l'allumage, une volée
    let nb=0;T.acc+=dt*(C.pv?3.2:4.5)*k;while(T.acc>=1){T.acc-=1;nb++;}if(debut)nb+=C.pv?3:5;
    for(let q=0;q<nb;q++){const p=trxNait(1);if(!p)return;const sd=(T.cnt++%2)?1:-1,lat=sd*(.45+Math.random()*.55),up=.45+Math.random()*.7;
      p.x=C.P.x+C.R.x*lat+C.U.x*up;p.y=C.P.y+C.R.y*lat+C.U.y*up;p.z=C.P.z+C.R.z*lat+C.U.z*up;
      p.vx=C.R.x*sd*(.5+Math.random())+C.U.x*(.5+Math.random()*.8)-C.F.x*.6;p.vy=C.R.y*sd*(.5+Math.random())+C.U.y*(.5+Math.random()*.8)-C.F.y*.6;p.vz=C.R.z*sd*(.5+Math.random())+C.U.z*(.5+Math.random()*.8)-C.F.z*.6;trxVit(p,.975);
      p.dr=.6;p.l=.9+Math.random()*.6;p.w=p.h=.2+Math.random()*.12;p.s1=1.15;p.c=35;p.r=(Math.random()-.5)*.5;p.vr=(Math.random()-.5)*.8;
      p.cr=1.75;p.cg=.28;p.cb=1.2;p.fi=.05;p.fo=.25;p.fk=.07;p.bk=.3;}
    T.boltT-=dt;if(T.boltT<=0){T.boltT=.05+Math.random()*.12;const p=trxNait(1);if(p){const sd=Math.random()<.5?-1:1; // le tube qui CRÉPITE : une petite étincelle rose à un feu
      p.x=C.P.x+C.R.x*sd*.5;p.y=C.P.y+C.R.y*sd*.5;p.z=C.P.z+C.R.z*sd*.5;trxVit(p,.97);p.l=.09;p.w=p.h=.22;p.c=2;p.vr=9;p.cr=1.9;p.cg=.9;p.cb=1.6;p.fo=.06;}}},
  paillettes:function(T,C,k,dt,on,debut){if(!on)return; // POUDRE D'OR — des paillettes qui SCINTILLENT et retombent en pluie fine, et la poussière d'or qui luit
    let nb=0;T.acc+=dt*(C.pv?30:55)*k;while(T.acc>=1){T.acc-=1;nb++;}if(debut)nb+=C.pv?14:28;
    for(let q=0;q<nb;q++){const p=trxNait(1);if(!p)return;const lat=(Math.random()-.5)*2.1,up=.05+Math.random()*1.1,ar=Math.random()*1.2;
      p.x=C.P.x+C.R.x*lat+C.U.x*up-C.F.x*ar;p.y=C.P.y+C.R.y*lat+C.U.y*up-C.F.y*ar;p.z=C.P.z+C.R.z*lat+C.U.z*up-C.F.z*ar;
      const sl=lat*.9,su=.3+Math.random()*1.2;p.vx=C.R.x*sl+C.U.x*su;p.vy=C.R.y*sl+C.U.y*su;p.vz=C.R.z*sl+C.U.z*su;trxVit(p,.96);
      p.g=-1.6;p.dr=1.2;p.l=.8+Math.random()*1;p.w=p.h=(C.pv?.08:.13)+Math.random()*(C.pv?.1:.15);p.c=2;p.vr=(Math.random()-.5)*6;p.tw=9+Math.random()*12;
      const bl=Math.random();p.cr=2.2+bl*.4;p.cg=1.75+bl*.6;p.cb=.5+bl*.8;p.fi=.05;p.fo=.3;
      if(Math.random()<.2){const h=trxNait(1);if(h){h.x=p.x;h.y=p.y;h.z=p.z;h.vx=p.vx;h.vy=p.vy;h.vz=p.vz;h.g=-.6;h.dr=1.5;h.l=.6+Math.random()*.5;h.w=h.h=.22+Math.random()*.2;h.c=0;h.cr=.9;h.cg=.6;h.cb=.12;h.ca=.55;h.fi=.1;h.fo=.4;}}}}
};
/* (2026-10-16, TRAÎNÉES) L'ENSEIGNE QUI S'ALLUME : à l'appui de nitro, ROSE NÉON ne s'allume pas d'un coup — le tube CLIGNOTE comme une
   enseigne qu'on branche (allumé, noir, allumé, noir, puis pour de bon), en 0,42 s. `t` = le temps depuis l'allumage. */
function neonAllume(t){return t>=.42?1:t<.06?1:t<.13?.08:t<.18?.85:t<.29?.05:t<.34?.6:t<.37?.15:1;}
function trxCoeur(type,k,dt){const T=TRX,C=T.C,t0=performance.now();T.t+=dt;
  if(type!==T.type){if(C.pv){for(const p of T.P)p.v=false;T.kp=0;} /* (2026-10-17, TRAÎNÉES) à l'aperçu, une autre traînée essayée chasse les objets de la précédente (les bulles de MENTHE flottaient encore sur ROSE NÉON) et REJOUE son allumage : on voit le coup de chacune */T.type=type;T.H.n=0;T.gk=0;T.peur=0;T.acc=0;T.dist=0;T.cnt=0;for(const b of T.bolts)b.on=false;T.wl0.copy(C.WL);T.wr0.copy(C.WR);}
  const on=k>.05,debut=on&&T.kp<=.05;if(debut){T.wl0.copy(C.WL);T.wr0.copy(C.WR);T.dist=0;}T.kp=k;
  if(!C.pv&&TRX_HIST[type])trxHist(on?k:0);
  T.L[0].n=T.L[1].n=0;tcRaz();
  const E=TRX_EMET[type];if(E&&dt>0)E(T,C,k,dt,on,debut);
  const np=trxParts(dt);let nb=0;for(const b of T.bolts)if(b.on)nb++;
  { /* (2026-10-16, TRAÎNÉES) LA SALLE BLANCHE : la lumière additive s'y effaçait (matrice, filés, foudre, néon) — le maillage qui brille
       passe en ENCRE (mélange 0, 1 − src ; couleur = la teinte pure × l'intensité) : sur le blanc on lit la couleur de la traînée */
    const enc=C.pv&&silBlanc(),Y=T.L[1],M=Y.m.material;
    if(!!M._encre!==enc){M._encre=enc;M.blendSrc=enc?THREE.ZeroFactor:THREE.OneFactor;M.blendDst=enc?THREE.OneMinusSrcColorFactor:THREE.OneFactor;}
    if(enc){const c=Y.a.iC;for(let i=0;i<Y.n;i++){const o=i*4,r=c[o],g=c[o+1],b=c[o+2],m=Math.max(r,g,b,1e-4),s=Math.min(1,m*.85);
      c[o]=Math.min(1,1.1-r/m)*s;c[o+1]=Math.min(1,1.1-g/m)*s;c[o+2]=Math.min(1,1.1-b/m)*s;}}}
  {const Yi=T.L[1];if(Yi.mi){const ik=(TRJ.on&&!C.pv&&running&&!garageOn)?(1-LUM.nuit)*TRJ.trx:0;Yi.mi.material.uniforms.uInk.value=ik;Yi.mi.visible=ik>.02;}} // (2026-10-18) LE VOILE DE JOUR de ce qui brille (voir TRJ)
  for(const Y of T.L){const n=Y.n;Y.g.instanceCount=n;Y.m.visible=n>0;
    if(n)for(const nm of ['iP','iA','iB','iC']){const at=Y.g.attributes[nm];at.updateRange.offset=0;at.updateRange.count=n*4;at.needsUpdate=true;}}
  tcFin();
  T.n=np+T.L[0].n+T.L[1].n+nb+(T.gk>0?1:0); // tant qu'il reste quelque chose (même un mur qui s'éteint), la boucle continue d'appeler
  T.ms=T.ms*.95+(performance.now()-t0)*.05;}
function trxCoupe(){if(!TRX)return;const T=TRX;for(const p of T.P)p.v=false;for(const b of T.bolts)b.on=false;
  T.H.n=0;T.gk=0;T.peur=0;T.acc=0;T.dist=0;T.kp=0;T.n=0;for(const Y of T.L){Y.n=0;Y.g.instanceCount=0;Y.m.visible=false;}tcCoupe();}
function trxStep(type,k,dt){ // en course (la boucle, à côté de l'arc-en-ciel et de WOW)
  if(!type&&!(TRX&&TRX.n))return;const T=trxBati(),C=T.C;if(T.apercu){T.apercu=false;trxCoupe();}
  C.pv=false;C.F.copy(hsF);C.U.copy(hsU);C.R.copy(hsR);potMonde(CAR_POT_C,C.P).addScaledVector(hsU,.15);C.V.copy(EXV);trxRoues(CARS[level]);
  C.dp=T.pP.distanceTo(C.P);if(C.dp>20)C.dp=0;T.pP.copy(C.P);C.sol=mode==='drive';
  trxCoeur(type||T.type,type?k:0,dt);}
function trxApercu(dt,type,k9){ // au garage : la caisse est posée, la traînée « roule » quand même
  if(!type){if(!TRX||!TRX.apercu)return;if(!dt){TRX.apercu=false;trxCoupe();return;}trxCoeur(TRX.type,0,dt);if(!TRX.n)TRX.apercu=false;return;}
  const T=trxBati(),C=T.C;if(!T.apercu){T.apercu=true;trxCoupe();}C.pv=true;
  const A=wowAxes();C.F.set(A[0],A[1],A[2]).normalize();C.R.set(A[3],A[4],A[5]).normalize();C.U.set(A[6],A[7],A[8]).normalize();
  potMonde(CAR_POT_C,C.P).addScaledVector(C.U,.15);C.V.copy(C.F).multiplyScalar(14);trxRoues(CARS[garageI]||CARS[0]);C.dp=14*dt;C.sol=true;
  const k=k9==null?1:k9;if(TRX_HIST[type])trxHistApercu(k);
  trxCoeur(type,k,dt);}
window.dbgTrx=function(t){if(t!==undefined){TRX_FORCE=t||null;return TRX_FORCE;}
  return TRX?{type:TRX.type,force:TRX_FORCE,vivants:TRX.P.filter(function(p){return p.v;}).length,quads:[TRX.L[0].n,TRX.L[1].n],cubes:TC?[TC.s.n,TC.o.n,TC.g.n]:null,chemin:TRX.H.n,ms:+TRX.ms.toFixed(3),apercu:TRX.apercu}:null;};
window.dbgArc=function(q){const R=rainbow;
  if(q==='obj')return R; // (banc) l'objet lui-même
  if(q==='banc'){const T=performance.now.bind(performance),t9=T()*.001;for(let i=0;i<ARC_NS;i++){R.k0[i]=1;R.age[i]=i*.01;}let a9=T();for(let i=0;i<60;i++)arcPose(0,0,1,camera,t9+i*.016,.016);return {pose:(T()-a9)/60,cubes:R.m.count};} // (banc) ms par image, traînée pleine
  if(q==='pose'){const t9=performance.now()*.001;R.up.copy(hsU);R.dr.copy(hsR);arcPose(0,0,1,camera,t9,0);} // (photo) la traînée se tourne vers l'objectif de `dbgView` — en pause elle regardait encore la caméra de poursuite
  let vv=0;for(let i=0;i<ARC_NS;i++)if(R.k0[i]>=.03&&R.age[i]<ARC_VIE)vv++;
  return {visible:R.m.visible,init:R.init,apercu:R.apercu,cubes:R.m.count,tranchesVives:vv,etincelles:R.ne,ms:+R.ms.toFixed(3),sens:R.sg,
    tete:R.P[0].toArray().map(v=>+v.toFixed(1)),queue:R.P[ARC_NS-1].toArray().map(v=>+v.toFixed(1))};};

const rbD=new THREE.Vector3(),rbS=new THREE.Vector3(),rbV=new THREE.Vector3();
/* ---- LES PIXELS DU CHAT (v2, 2026-10-06, Léo : « enlève aussi l'arc-en-ciel ; le burn-out de la Nyan Cat fait des pixels
   multicolores qui scintillent, fumée grise ») ---------------------------------------------------------------------------------
   Le ruban d'arc-en-ciel (et ses étoiles) est RETIRÉ. La signature du chat devient des PIXELS aux six couleurs de l'arc-en-ciel (et
   un peu de blanc) qui SCINTILLENT — une case sur cinq s'éteint à chaque image, au hasard :
   · au GARAGE, pendant le BURN-OUT, ils giclent des roues et des pots à la place du feu, dans la fumée grise (voir `BURN.pix`) ;
   · en COURSE, ils jaillissent de la poupe à la NITRO et en VOL (la caisse ne crache pas de flamme : `tuyeres:0`).
   Mêmes quads et même programme que le feu du burn-out (`burnPool`, compilé au menu) ; en course en mélange NORMAL (sur le ciel
   clair, l'additif devenait pastel), au garage en additif (la salle est sombre, ils y brillent). */
const NY_PIX=[[1,.1,.12],[1,.55,.05],[1,.92,.1],[.25,.95,.2],[.1,.6,1],[.55,.25,1]],NY_BLANC=[1,1,1]; // rouge orange jaune vert bleu violet
const NY_V=new THREE.Vector3();
function nyanPixC(){return Math.random()<.12?NY_BLANC:NY_PIX[(Math.random()*6)|0];}
function nyanPixPool(){if(!NYAN.pix)NYAN.pix=burnPool(240,false,BURN_FS_FEU);return NYAN.pix;} // ⚠ jamais à l'init : BURN_FS_FEU est déclaré plus bas
function nyanPixPas(dt){ // la course : les pixels ralentissent (ils restent derrière), retombent à peine, et scintillent
  const F=NYAN.pix;if(!F||!F.o.visible||dt<=0)return;let n=0;const dr=Math.exp(-dt*1.6);
  for(let i=0;i<F.N;i++){const j=i*3;if(F.age[i]>=F.life[i]){if(F.P[j+1]>-1e3){F.P[j+1]=-1e4;F.A[i]=0;}continue;}
    n++;const g=Math.min(1,(F.age[i]+=dt)/F.life[i]);
    F.V[j]*=dr;F.V[j+1]=F.V[j+1]*dr-2.2*dt;F.V[j+2]*=dr;
    F.P[j]+=F.V[j]*dt;F.P[j+1]+=F.V[j+1]*dt;F.P[j+2]+=F.V[j+2]*dt;F.G[i]=g;F.S[i]=F.s0[i];
    F.A[i]=(Math.random()<.2?0:1)*Math.pow(1-g,.7)*F.op[i];F.C[j]=F.c0[j];F.C[j+1]=F.c0[j+1];F.C[j+2]=F.c0[j+2];}
  F.n=n;const at=F.g.attributes;at.iP.needsUpdate=at.iA.needsUpdate=at.iS.needsUpdate=at.iG.needsUpdate=at.iC.needsUpdate=true;
  if(!n)F.o.visible=false;
}
function nyanPixNitro(dt,k){ // la course : la poupe crache des pixels, ~150 par seconde à pleine nitro, avec l'élan de la caisse
  NYAN.pixT+=dt*150*k;if(NYAN.pixT<1)return;const F=nyanPixPool();
  while(NYAN.pixT>=1){NYAN.pixT-=1;NY_V.set((Math.random()-.5)*1.4,.55+Math.random()*.4,-1.05);potMonde(NY_V,tmp2);
    const c=nyanPixC(),v=3+Math.random()*6;
    burnEmet(F,tmp2.x,tmp2.y,tmp2.z,EXV.x*.88-hsF.x*v+(Math.random()-.5)*2.4,EXV.y*.88-hsF.y*v+Math.random()*1.6,EXV.z*.88-hsF.z*v+(Math.random()-.5)*2.4,
      .45+Math.random()*.4,.1+Math.random()*.08,0,1,c[0],c[1],c[2]);}
}
/* LE PAS DU GIF (appelé à chaque image, après le rendu de l'atelier / de la vitrine) : les pattes pédalent en diagonale d'un voxel,
   la queue alterne ses deux dessins, la tête hoche d'un voxel à 142 à la noire (le tempo du morceau d'origine) — TOUT en pas
   entiers (son allure suit l'accélération, voir plus bas). Et ses PIXELS de course vivent ici (voir NY_PIX). */
function nyRoue(w){ /* (2026-10-08) l'angle de la roue qu'on VOIT. Depuis la soudure des caisses (voir ESSIEUX), les `wheels` sont des
  FANTÔMES hors scène : les pattes suivaient leur angle, pas celui des roulettes à l'écran — au burn-out du garage seul l'essieu arrière
  patine (BURN.ar), et les pattes arrière restaient plantées pendant que leurs roues tournaient dessous. */
  if(!w.parent)for(const E of ESSIEUX)if(Math.abs(E.position.z-w.position.z)<1e-4&&Math.abs(E.position.y-w.position.y)<1e-4)return E.rotation.x;
  return w.rotation.x;}
function nyanTick(dt){
  if(NYAN.photo){const f=NYAN.photo,r=carGroup.rotation.y+f.a; // (banc) dbgNyan('photo',a,d,h) — vaut pour toute caisse : a = angle autour de la caisse (0 = de face)
    camera.position.set(carGroup.position.x+Math.sin(r)*f.d,carGroup.position.y+f.h,carGroup.position.z+Math.cos(r)*f.d);
    camera.lookAt(carGroup.position.x,carGroup.position.y+.7,carGroup.position.z);camera.updateMatrixWorld();
    if(camera.view&&camera.view.enabled){NYAN.vue=Object.assign({},camera.view);camera.clearViewOffset();}} // l'objectif décentré de l'atelier : rendu en sortant
  const vole=NYAN.on&&running&&!gameOver&&mode==='fall';
  NYAN.volK+=((vole?1:0)-NYAN.volK)*Math.min(1,dt*(vole?7:3));
  const fige=paused&&running&&!gameOver;
  nyanPixPas(fige?0:dt);
  if(!NYAN.on||fige||(running&&mode==='boom'))return;
  /* (v2, Léo : « les jambes bougent en fonction de comment tu accélères ») L'ALLURE suit l'ACCÉLÉRATION (km/h par seconde, lissée) :
     à l'ARRÊT les pattes se posent · en COURSE la cadence suit la vitesse et MONTE avec l'accélération · en SPRINT (forte poussée,
     nitro) la foulée double (deux voxels) et la queue se dresse au vent · au FREINAGE plus de foulée : les quatre pattes se
     plantent en avant, la queue tombe, les feux stop s'allument · en VOL elles pédalent dans le vide. Au garage il trottine. */
  const v=running&&!gameOver?vKmh():0,ac=dt>1e-4?(v-NYAN.v0)/dt:0; // (la vitesse affichée, `speedKmh`, est locale à la boucle)
  NYAN.v0=v;NYAN.acc+=(Math.max(-500,Math.min(500,ac))-NYAN.acc)*Math.min(1,dt*5);
  const enCourse=running&&!gameOver,frein=enCourse&&!vole&&v>15&&(NYAN.acc<-30||keys.ArrowDown||keys.KeyS);
  let al;
  if(vole)al='vol';
  else if(!enCourse)al='garage';
  else if(frein)al='frein';
  else if(v<4&&NYAN.acc<8)al='arret';
  else al=(NYAN.acc>32||nitroOn)?'sprint':'course'; // la NITRO : toujours le sprint
  /* (v13, Léo : « les pattes bougent en fonction de comment les roues tournent, que ça fasse le geste de la Nyan Cat ») CHAQUE PATTE
     SUIT SA ROUE (même ordre : AVG, AVD, ARG, ARD) : un cran par QUART DE TOUR, la patte tourne en rond comme une bielle, les diagonales en
     opposition (le trot). La roue est la vérité : arrêtée, la patte se fige ; au burn-out l'arrière patine — les pattes arrière
     courent sur place, celles de devant restent plantées ; en vol elles ralentissent avec les roues. La cadence est bornée par
     celle des roues (pas d'image borné à .3 rad, voir carVit) : au plus ~11 pas/s, l'œil suit. Au freinage, les quatre se plantent. */
  NYAN.bat+=dt*142/60;
  const hb=Math.floor(NYAN.bat)&1,q=Math.PI/2,st=NYAN.st||(NYAN.st=[0,0,0,0]);let cle=0;
  for(let i=0;i<4;i++){const w=wheels[i];st[i]=w?((Math.floor(nyRoue(w)/q)%4)+4)%4:0;cle=cle*4+st[i];}
  if(NYAN.roues.length===4){let rf='';for(let i=0;i<4;i++){const w=wheels[i],n=NYAN.roues[i].length;rf+=w?((Math.floor(nyRoue(w)/NYAN.rPas)%n)+n)%n:0;} // (2026-10-08) LES ROUES PIXEL : l'image de la roue, une tous les 12°
    if(rf!==NYAN.rf){NYAN.rf=rf;for(let i=0;i<4;i++){const im=NYAN.roues[i],k=+rf[i];for(let j=0;j<im.length;j++)im[j].visible=j===k;}}}
  if(cle===NYAN.pas&&hb===NYAN.hb&&al===NYAN.allure)return;
  NYAN.pas=cle;NYAN.hb=hb;NYAN.allure=al;
  const Z=[1,0,-1,0],Y=[0,1,0,-1]; // le tour de la bielle, par crans : devant, en haut, derrière, en bas
  for(let i=0;i<NYAN.pattes.length;i++){const s9=(st[i]+((i===0||i===3)?0:2))&3,g=NYAN.pattes[i];
    if(al==='frein')g.position.set(0,0,NY_PATTE*NY_K);else g.position.set(0,Y[s9]*NY_PATTE*NY_K,Z[s9]*NY_PATTE*NY_K);
    const im=g.userData.im,h9=al==='frein'?1:Y[s9]+1;if(im)for(let j=0;j<im.length;j++)im[j].visible=j===h9;} // (2026-10-15) l'image du cran de hauteur : le haut de la patte reste sous l'aile (voir LES PATTES dans le gabarit poptart)
  if(NYAN.queue.length===2){const h=al==='sprint'||al==='vol'?1:al==='frein'?0:(al==='course')?(st[2]>>1)&1:(Math.floor(NYAN.bat/2)&1); // à l'arrêt elle bat doucement
    NYAN.queue[0].visible=!h;NYAN.queue[1].visible=!!h;}
  if(NYAN.feux.length===2){NYAN.feux[0].visible=!frein;NYAN.feux[1].visible=frein;}
  if(NYAN.tete)NYAN.tete.position.y=hb*NY_U*NY_K;
}
/* ATCHOUM — LE FEU (2026-10-06, Léo : « elle crache du feu et éternue des flammes »). Deux gestes, en course seulement (les réserves
   de particules ne vivent que là) :
   · ELLE CRACHE : toutes les 0,4-1,4 s dès qu'elle roule, une langue de feu courte sort d'un de ses pots au hasard (les deux pots
     latéraux devant les roues arrière, les deux sorties sous le pare-chocs) — en plus du retour de flamme au lâcher et de la nitro ;
   · ELLE ÉTERNUE : toutes les 3-7,5 s, elle prend sa respiration (le nez se lève 0,4 s) puis ATCHOUM — le nez pique, et une gerbe de
     flammes part DROIT DEVANT du museau ; la caisse, plus rapide, la rattrape et la traverse. « ATCHOUM ! » au-dessus d'elle, un souffle.
   Le corps se penche par-dessus la pose de la boucle (elle repose `carBody` à chaque image : rien ne s'accumule). */
const ATCH={on:false,reste:0,t:4,ph:0,k:0,n:0,crache:1,P:new THREE.Vector3(),F:new THREE.Vector3(),R:new THREE.Vector3(),H:new THREE.Vector3(),V:new THREE.Vector3(),Z:new THREE.Vector3(),N:new THREE.Vector3(0,.47,2.2)};
const VIT_EXV=()=>EXV; // la vitesse monde de la caisse (déclarée plus bas)
function atchFeu(course){
  const P=ATCH.P,F=ATCH.F,R=ATCH.R,H=ATCH.H,EXV=course?ATCH.V:ATCH.Z;potMonde(ATCH.N,P);if(course)ATCH.V.copy(VIT_EXV()); // au garage, la caisse est à l'arrêt
  for(let i=0;i<30;i++){const s9=11+Math.random()*13,a=(Math.random()-.5)*5,b=(Math.random()-.25)*3.4;
    spawnP(flames,P.x,P.y,P.z,EXV.x+F.x*s9+R.x*a+H.x*b,EXV.y+F.y*s9+R.y*a+H.y*b,EXV.z+F.z*s9+R.z*a+H.z*b,.22+Math.random()*.25);}
  for(let i=0;i<12;i++){const s9=9+Math.random()*9,a=(Math.random()-.5)*2.4,b=(Math.random()-.3)*1.8;
    spawnP(flameCore,P.x,P.y,P.z,EXV.x+F.x*s9+R.x*a+H.x*b,EXV.y+F.y*s9+R.y*a+H.y*b,EXV.z+F.z*s9+R.z*a+H.z*b,.16+Math.random()*.16);}
  for(let i=0;i<14;i++){const s9=6+Math.random()*10,a=(Math.random()-.5)*6;
    spawnP(embers,P.x,P.y,P.z,EXV.x+F.x*s9+R.x*a+H.x*(2+Math.random()*4),EXV.y+F.y*s9+R.y*a+H.y*(2+Math.random()*4),EXV.z+F.z*s9+R.z*a+H.z*(2+Math.random()*4),.3+Math.random()*.3);}
  if(course){popTexte(TR('ATCHOUM !'),'#ffb030',0);hap&&hap(18);}else ATCH.reste=2.5; // (audit) au garage : ses flammes vivent encore 2,5 s, même si on change de caisse
  if(!(typeof sfx==='function'&&(sfx('caisse.atchoum')||sfx('nitro.sec',{st:5,vol:2}))))noiseBurst(.2,.09,620); // (2026-10-14, session SON) « caisse.atchoum » cuit le 14/10 : la flamme qui TOUSSE de la panne sèche (« a… TCHOUM »). Le repli sur nitro.sec n'est plus qu'un filet
}
function atchTick(dt){
  if(!ATCH.on){if(ATCH.reste>0){ATCH.reste-=dt;if(garageOn&&!running)for(const q of [flames,flameCore,embers])updatePool(q,dt,q===embers?4.5:1);}return;} /* (2026-10-07, audit) on a changé de caisse au garage : ses dernières flammes finissent leur vie au lieu de rester plantées */
  const course=running&&!gameOver&&!paused&&mode!=='boom'&&!garageOn,vitrine=garageOn&&!running; // au garage aussi elle éternue (la vitrine)
  if(!course&&!vitrine){ATCH.ph=0;ATCH.k=0;return;}
  const F=ATCH.F.set(0,0,1).applyQuaternion(carGroup.quaternion);ATCH.R.set(1,0,0).applyQuaternion(carGroup.quaternion);ATCH.H.set(0,1,0).applyQuaternion(carGroup.quaternion);
  if(vitrine)for(const q of [flames,flameCore,embers])updatePool(q,dt,q===embers?4.5:1); // (en course la boucle les fait vivre ; au garage, c'est elle)
  if(course&&(ATCH.crache-=dt)<=0){ATCH.crache=.4+Math.random();                          // ELLE CRACHE
    if(vKmh()>25&&CAR_POTS.length){const P=ATCH.P;potMonde(CAR_POTS[(Math.random()*CAR_POTS.length)|0],P);
      for(let i=0;i<5;i++)spawnP(flames,P.x,P.y,P.z,EXV.x-F.x*(5+Math.random()*7)+(Math.random()-.5)*1.6,EXV.y+Math.random()*1.3,EXV.z-F.z*(5+Math.random()*7)+(Math.random()-.5)*1.6,.08+Math.random()*.09);
      spawnP(flameCore,P.x,P.y,P.z,EXV.x-F.x*8,EXV.y+.4,EXV.z-F.z*8,.07);
      if(Math.random()<.6)spawnP(embers,P.x,P.y,P.z,EXV.x-F.x*4+(Math.random()-.5)*3,EXV.y+1.5+Math.random()*2,EXV.z-F.z*4+(Math.random()-.5)*3,.25);}}
  ATCH.t-=dt;                                                                               // ELLE ÉTERNUE
  if(ATCH.ph===0&&ATCH.t<=.4)ATCH.ph=1;
  const corps=course&&mode==='drive'; // (la boucle repose `carBody` à chaque image en course ; au garage on n'y touche pas)
  if(ATCH.ph===1){ATCH.k=Math.min(1,ATCH.k+dt/.4);if(corps)carBody.rotation.x-=.07*ATCH.k*ATCH.k; // la respiration : le nez se lève
    if(ATCH.t<=0){ATCH.ph=2;ATCH.n=.32;atchFeu(course);}}
  else if(ATCH.ph===2){ATCH.n-=dt;if(corps)carBody.rotation.x+=.1*Math.sin(Math.max(0,ATCH.n/.32)*Math.PI); // ATCHOUM : le nez pique
    if(ATCH.n<=0){ATCH.ph=0;ATCH.k=0;ATCH.t=3+Math.random()*4.5;}}
}
const TR_PJ=new THREE.Vector3(),TR_Q=new THREE.Vector3(),TR_CUT={a:.08,b:.26}; // (2026-09-29) la projection d'un point du ruban, le point où on le COUPE, et la descente à l'écran tolérée (voir « plus de fils de marionnette »)
function trailStep(tr,px,py,pz,cr,cg,cb,k,wMul){
  if(k<.03){tr.m.visible=false;tr.init=false;return;}
  const h=tr.hist;
  if(!tr.init){for(const q of h)q.set(px,py,pz);tr.init=true;} // réveil : pas de trait fantôme depuis l'ancienne position
  const tail=h.pop();tail.set(px,py,pz);h.unshift(tail);       // la tête colle à la tuyère, la queue s'efface
  /* RUBANS v2 (2026-09-26, passe graphique) : la caméra de poursuite est à ~4 m des tuyères, 3,5 m au-dessus — le fondu de 6 à 14 m
     effaçait donc TOUT le ruban vu de derrière (on ne le voyait qu'en vol). Désormais c'est un FIL de lumière : effilé (trait franc à la
     tuyère, fil à la queue), jamais plus épais qu'~1° d'angle à l'écran (`dC*.009` : près de l'objectif il s'amincit au lieu de
     grossir — plus de voile possible), tête qui BLANCHIT, et il s'efface quand on le regarde PILE dans l'axe (sinus de l'angle
     ruban/regard `sA` : vu de bout, un ruban devient une nappe — c'était le « tapis »). Le fondu près de l'objectif se resserre à
     2,4-3,6 m : le fil vit sous la caméra, de la tuyère jusqu'au bas de l'écran (← c'était ça, les « fils » : voir juste dessous). */
  const P=tr.pos,C=tr.col,wm=wMul||1;
  /* PLUS DE « FILS DE MARIONNETTE » (2026-09-29, Sacha : « les trois », après deux critiques : « en nitro et en vol, les deux traînées
     descendent jusqu'au bas de l'écran, la caisse semble pendue à deux fils »). L'historique n'a qu'UN point par image : à pleine
     vitesse ils sont espacés de plusieurs mètres, le 2e ou le 3e est déjà sous (ou derrière) l'objectif, et la couleur s'étirait
     sur tout ce segment — un fondu par sommet n'y peut rien. Le ruban est donc COUPÉ géométriquement : dès qu'un point descend à
     l'écran de plus de TR_CUT.b (0,26 de hauteur normalisée, ~13 % de l'écran) sous sa tuyère, on place un dernier sommet, éteint,
     pile au franchissement, et tout le reste s'y replie. Il s'estompe dès TR_CUT.a ; il file toujours sur les côtés et au loin ;
     sa queue fond plus tôt. (0,32 essayé : encore un trait jusqu'aux deux tiers de l'écran.) */
  TR_PJ.copy(h[0]).project(camera);const yh9=TR_PJ.y;
  let cut9=false,dp9=0;
  for(let i=0;i<TRAIL_N;i++){
    const p=h[i],pn=h[Math.min(i+1,TRAIL_N-1)],pp=h[Math.max(i-1,0)];
    if(cut9){P.copyWithin(i*6,(i-1)*6,i*6);C.fill(0,i*6,i*6+6);continue;} // replié sur le point de coupe, éteint
    rbD.subVectors(pn,pp);rbV.subVectors(p,camera.position);
    rbS.crossVectors(rbD,rbV);
    const l2=rbS.lengthSq(),dC=rbV.length(),lD=rbD.length();
    let sA=0;
    if(l2>1e-9){const l9=Math.sqrt(l2);sA=(lD>1e-5&&dC>1e-5)?l9/(lD*dC):0;rbS.multiplyScalar(1/l9);}else rbS.set(0,0,0);
    const u=1-i/(TRAIL_N-1),w=Math.min((.012+.075*u*u)*wm,dC*.009);
    let f=u*u*k;
    f*=THREE.MathUtils.smoothstep(dC,2.4,3.6)*THREE.MathUtils.smoothstep(sA,.1,.32);
    TR_PJ.copy(p).project(camera);const d9=TR_PJ.z>1?9:yh9-TR_PJ.y; // (2026-09-29) de combien il est descendu à l'écran (derrière l'objectif : « tout en bas »)
    let q9=p;
    if(i>0&&d9>=TR_CUT.b){cut9=true;f=0;q9=TR_Q.lerpVectors(pp,p,THREE.MathUtils.clamp((TR_CUT.b-dp9)/Math.max(1e-4,d9-dp9),0,1));} // LA COUPE, au franchissement
    else f*=(1-THREE.MathUtils.smoothstep(d9,TR_CUT.a,TR_CUT.b))*THREE.MathUtils.smoothstep(u,0,.45); // il s'estompe en descendant, et sa queue fond plus tôt
    dp9=d9;
    const hot=u*u*u*u*.55*f; // le cœur chaud de la tête
    P[i*6]=q9.x+rbS.x*w;P[i*6+1]=q9.y+rbS.y*w;P[i*6+2]=q9.z+rbS.z*w;
    P[i*6+3]=q9.x-rbS.x*w;P[i*6+4]=q9.y-rbS.y*w;P[i*6+5]=q9.z-rbS.z*w;
    C[i*6]=cr*f+hot;C[i*6+1]=cg*f+hot;C[i*6+2]=cb*f+hot;
    C[i*6+3]=C[i*6];C[i*6+4]=C[i*6+1];C[i*6+5]=C[i*6+2];
  }
  tr.m.visible=true;
  tr.m.geometry.attributes.position.needsUpdate=true;
  tr.m.geometry.attributes.color.needsUpdate=true;
}
const SV=new THREE.Vector3(),SD=new THREE.Vector3(),SS=new THREE.Vector3(),SP=new THREE.Vector3(); // (sillage) réutilisés : zéro allocation
function silPousse(tr){for(const a of [tr.X,tr.Y,tr.Z,tr.T,tr.K,tr.CR,tr.CG,tr.CB])a.copyWithin(1,0,SIL.N-1);tr.n=Math.min(SIL.N,tr.n+1);} // un cran : la case 0 se libère pour la tête
function silPose(tr,i,x,y,z,k,r,g,b){tr.X[i]=x;tr.Y[i]=y;tr.Z[i]=z;tr.T[i]=tr.clk;tr.K[i]=k;tr.CR[i]=r;tr.CG[i]=g;tr.CB[i]=b;}
function sillageStep(tr,px,py,pz,cr,cg,cb,k,wm,dt,wu){ // wm : l'élargissement de la TÊTE (nitro, allumage) · wu : la largeur de TOUT le sillage (un pot seul : plus large)
  tr.clk+=dt||0;
  if(!tr.init){tr.n=0;tr.emit=false;tr.init=true;tr.g=0;} // réveil, portail, replacement : on repart de RIEN (pas de trait tendu depuis l'ancienne position)
  const emet=k>=.03;
  if(emet){
    if(tr.n===0){silPose(tr,0,px,py,pz,k,cr,cg,cb);tr.n=1;silPousse(tr);} // la graine : un point fixe, puis la tête
    else if(!tr.emit){ // on RALLUME sous l'ancien sillage qui s'éteignait : il garde l'éclat où il en était, et une COUPURE (deux points éteints) le sépare du neuf
      for(let i=0;i<tr.n;i++)tr.K[i]*=tr.g;tr.K[0]=0;silPousse(tr);silPose(tr,0,px,py,pz,0,cr,cg,cb);silPousse(tr);}
    else{const dx=px-tr.X[1],dy=py-tr.Y[1],dz=pz-tr.Z[1];if(dx*dx+dy*dy+dz*dz>SIL.PAS*SIL.PAS&&tr.clk-tr.T[1]>=SIL.DTM)silPousse(tr);} // la tête se FIXE : un point de plus
    silPose(tr,0,px,py,pz,k,cr,cg,cb);tr.g=1; // la tête colle à la bouche du pot
  }else if(tr.emit)tr.tOff=tr.clk; // on vient de lâcher : le sillage entier s'éteint à partir de maintenant
  tr.emit=emet;
  if(!emet&&tr.n>0){tr.g=Math.max(0,1-(tr.clk-tr.tOff)/SIL.OFF);if(tr.g<=0)tr.n=0;}
  // 50 MÈTRES : on garde le chemin jusqu'au premier point au-delà de LONG (il sert au fondu de la queue), et rien de plus vieux que VMAX
  {let acc=0;const X=tr.X,Y=tr.Y,Z=tr.Z;for(let i=1;i<tr.n;i++){const dx=X[i]-X[i-1],dy=Y[i]-Y[i-1],dz=Z[i]-Z[i-1];acc+=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(acc>tr.lg||tr.clk-tr.T[i]>SIL.VMAX){tr.n=i+1;break;}}tr.long=acc;} // (traînées de lumière) la longueur VIT : courte au roulage, 100 m au nitro
  if(tr.n<2){tr.m.visible=false;if(!emet)tr.n=0;return;}
  // 1) LA COURBE : Catmull-Rom entre les points (jamais à travers une coupure), intensité et couleur interpolées
  const Q=SIL_Q,S=SIL.SUB,n=tr.n,X=tr.X,Y=tr.Y,Z=tr.Z,K=tr.K;let R9=0;
  for(let i=0;i<n-1;i++){
    const a=(i>0&&K[i]!==0)?i-1:i,d=(i+2<n&&K[i+1]!==0)?i+2:i+1,b=i+1;
    for(let q=0;q<S;q++){
      const u=q/S,u2=u*u,u3=u2*u,c0=-.5*u3+u2-.5*u,c1=1.5*u3-2.5*u2+1,c2=-1.5*u3+2*u2+.5*u,c3=.5*u3-.5*u2,o=R9*8;
      Q[o]=c0*X[a]+c1*X[i]+c2*X[b]+c3*X[d];Q[o+1]=c0*Y[a]+c1*Y[i]+c2*Y[b]+c3*Y[d];Q[o+2]=c0*Z[a]+c1*Z[i]+c2*Z[b]+c3*Z[d];
      Q[o+3]=K[i]+(K[b]-K[i])*u;Q[o+4]=tr.CR[i]+(tr.CR[b]-tr.CR[i])*u;Q[o+5]=tr.CG[i]+(tr.CG[b]-tr.CG[i])*u;Q[o+6]=tr.CB[i]+(tr.CB[b]-tr.CB[i])*u;R9++;}
  }
  {const o=R9*8,l=n-1;Q[o]=X[l];Q[o+1]=Y[l];Q[o+2]=Z[l];Q[o+3]=K[l];Q[o+4]=tr.CR[l];Q[o+5]=tr.CG[l];Q[o+6]=tr.CB[l];R9++;}
  // (v5) OÙ FILE LA TÊTE : la direction de ses ~1,8 premiers mètres — la plume du pot s'y couche (plus de flamme droite sur un sillage qui tourne)
  tr.dOk=false;
  if(emet){let ac=0,r2=0;for(let r=1;r<R9;r++){const o=r*8;ac+=Math.hypot(Q[o]-Q[o-8],Q[o+1]-Q[o-7],Q[o+2]-Q[o-6]);r2=r;if(ac>=SIL.tete)break;}
    const dx=Q[r2*8]-Q[0],dy=Q[r2*8+1]-Q[1],dz=Q[r2*8+2]-Q[2],l9=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(l9>.25){tr.dX=dx/l9;tr.dY=dy/l9;tr.dZ=dz/l9;tr.dOk=true;}}
  // (v6) LES BRAISES : le sillage crache des étincelles sur toute sa longueur (plus serrées près de la tuyère), qui s'écartent et montent
  if(emet&&R9>6&&dt>0&&tr.hk>.15){let nb=SIL.braise*dt*60*tr.g*tr.hk; // (2026-10-15) au nitro seulement : un feu arrière ne crache pas de braises
    while(nb>0){if(nb<1&&Math.random()>nb)break;nb--;
      const r=2+Math.floor(Math.pow(Math.random(),1.6)*(R9-3)),o=r*8,a=Math.random()*6.2832,sp=.8+Math.random()*2.2;
      if(nfeuGicle(Q[o]+(Math.random()-.5)*.3,Q[o+1]+(Math.random()-.5)*.3,Q[o+2]+(Math.random()-.5)*.3,Math.cos(a)*sp*.8,Math.abs(Math.sin(a))*sp+1.2,Math.sin(a)*sp*.5,.09+.07*Math.random()))continue; // (2026-10-15) des CUBES du feu de pixels (repli : les braises rondes)
      spawnP(silBraises,Q[o]+(Math.random()-.5)*.3,Q[o+1]+(Math.random()-.5)*.3,Q[o+2]+(Math.random()-.5)*.3,Math.cos(a)*sp,Math.abs(Math.sin(a))*sp+.6,Math.sin(a)*sp*.6,.35+Math.random()*.4);}}
  silRuban(tr,R9,emet,dt,wm,wu);
}
/* (2026-10-16, session TRAÎNÉES — Sacha : « améliore chaque traînée, il faut qu'elle donne toute envie d'acheter ») LE RUBAN À PART :
   la courbe (SIL_Q, R9 rangées x y z k r g b) devient le ruban face caméra. Séparé de sillageStep pour que l'APERÇU du garage dessine la
   VRAIE traînée de lumière (silApercu) — avant, l'atelier montrait une bande plate qui sortait des pots.
   SIL_ENCRE : dans la SALLE BLANCHE de la boutique, une lumière additive ne se voit pas sur le blanc. Le ruban y passe en ENCRE : même
   géométrie, mélange (0, 1 − src) et couleur inversée — le blanc se teinte de la couleur de la traînée, à la même intensité. Le mélange
   n'entre pas dans la clé des programmes de three r128 : zéro recompilation. */
let SIL_ENCRE=false,SIL_STY=null; // SIL_STY : le TEMPÉRAMENT d'un ruban de la boutique (`sil` sur sa fiche) — c : le cœur ×, h : le halo ×, f : le refroidissement (0 = garde sa couleur jusqu'au bout), p : les pouls ×
function silEncre(m,on){const M=m.material;if(!!M._encre===on)return;M._encre=on;
  if(on){M.blending=THREE.CustomBlending;M.blendEquation=THREE.AddEquation;M.blendSrc=THREE.ZeroFactor;M.blendDst=THREE.OneMinusSrcColorFactor;}
  else M.blending=THREE.AdditiveBlending;}
function silRuban(tr,R9,emet,dt,wm,wu){
  const Q=SIL_Q;silEncre(tr.m,SIL_ENCRE);
  const dk=(TRJ.on&&!SIL_ENCRE&&running&&!garageOn)?(1-LUM.nuit)*TRJ.k:0,CI=tr.coli; // (2026-10-18) LE VOILE DE JOUR (voir TRJ) : nul la nuit, au garage et en salle blanche
  // 2) LE RUBAN : face caméra, halo + cœur ; en vol, coupé à l'écran quand il PEND sous sa tuyère
  const P=tr.pos,C=tr.col,cam=camera.position,SM=THREE.MathUtils.smoothstep,wv=wm||1,wa=wu||1,LG=Math.max(4,tr.lg),QU=SIL.QUEUE*LG/SIL.LONG;
  TR_PJ.set(Q[0],Q[1],Q[2]).project(camera);const yh=TR_PJ.y,xh=TR_PJ.x,asp=camera.aspect||.5;
  /* CE QUI PEND EST COUPÉ, CE QUI S'ÉCARTE VIT : la « descente » d'un point, c'est sa chute à l'écran sous la tuyère MOINS son écart sur
     le côté (`kx`). Au sol (`cutB` 9 : jamais) le sillage file jusqu'au bas de l'écran ; en vol (`cutV`) il ne pend qu'un tiers d'écran,
     le cœur s'éteignant avant le halo (`cutK`). Le seuil glisse d'un régime à l'autre en ~0,4 s. */
  const cut=(tr.cut+=((mode==='fall'?SIL.cutV:SIL.cutB)-tr.cut)*Math.min(1,(dt||0)*2.5)),cutA=cut*SIL.cutA,cutK=cut*SIL.cutK;
  let arc=0,dp=0,Rf=R9,depP=1e9;camera.getWorldDirection(SIL_CD);const CD=SIL_CD;
  for(let r=0;r<R9;r++){
    const o=r*8,ra=Math.max(0,r-1)*8,rb=Math.min(R9-1,r+1)*8;let x=Q[o],y=Q[o+1],z=Q[o+2];
    if(r>0){const ex=x-Q[o-8],ey=y-Q[o-7],ez=z-Q[o-6];arc+=Math.sqrt(ex*ex+ey*ey+ez*ez);}
    SD.set(Q[rb]-Q[ra],Q[rb+1]-Q[ra+1],Q[rb+2]-Q[ra+2]);SV.set(x-cam.x,y-cam.y,z-cam.z);SS.crossVectors(SD,SV);
    const l2=SS.lengthSq(),dC=SV.length(),lD=SD.length();let sA=0;
    if(l2>1e-12){const l9=Math.sqrt(l2);sA=(lD>1e-6&&dC>1e-6)?l9/(lD*dC):0;SS.multiplyScalar(1/l9);
      if(r>0&&SS.x*SP.x+SS.y*SP.y+SS.z*SP.z<0)SS.negate();SP.copy(SS);}else SS.set(0,0,0); /* (2026-10-18) le côté GARDE son sens d'une rangée à l'autre : là où le ruban passe dans l'axe du regard (vol, vrilles, sous l'objectif), le côté s'inversait et la bande se pinçait en nœud papillon */
    const al=Math.min(1,arc/LG);
    let f=Q[o+3]*tr.g*(1-.22*al)*SM(arc,0,.35)*(mode==='fall'?SM(sA,SIL.axeV*.25,SIL.axeV):SM(sA,.05,.22))*(1-SM(arc,LG-QU,LG)); // (v6) en vol, vu dans l'axe il RESTE (la caméra suit le vol) // RÉGULIER sur 40 m, la queue s'éteint sur les 10 derniers ; la tête naît sous la plume ; vu PILE dans l'axe, il s'efface (le « tapis »)
    let fin=r>0&&arc>=LG;
    /* (v6) DERRIÈRE L'OBJECTIF : le ruban va jusqu'au plan de la caméra (il y fond, `dC`) au lieu de s'arrêter en plein écran — avant, un
       point passé derrière valait « 9 » et la coupe s'interpolait entre ce 9 factice et le point d'avant : la bande finissait au MILIEU
       de l'image (MESURÉ en vol, où la caméra suit le sillage). On coupe au vrai plan (profondeur `pres`), interpolé dans l'espace. */
    const dep=(x-cam.x)*CD.x+(y-cam.y)*CD.y+(z-cam.z)*CD.z;
    if(!fin&&r>0&&dep<SIL.pres){fin=true;const t9=THREE.MathUtils.clamp((depP-SIL.pres)/Math.max(1e-4,depP-dep),0,1);x=Q[o-8]+(x-Q[o-8])*t9;y=Q[o-7]+(y-Q[o-7])*t9;z=Q[o-6]+(z-Q[o-6])*t9;}
    depP=dep;
    TR_PJ.set(x,y,z).project(camera);const d=dep<SIL.pres?dp:(yh-TR_PJ.y)-SIL.kx*Math.abs(TR_PJ.x-xh)*asp; // de combien il PEND à l'écran sous sa tuyère
    if(!fin&&r>0&&d>=cut){fin=true;const t9=THREE.MathUtils.clamp((cut-dp)/Math.max(1e-4,d-dp),0,1);x=Q[o-8]+(x-Q[o-8])*t9;y=Q[o-7]+(y-Q[o-7])*t9;z=Q[o-6]+(z-Q[o-6])*t9;} // LA COUPE, au franchissement
    if(fin)f=0;
    const fK=1-SM(d,cutA*.5,cutK);if(!fin)f*=1-SM(d,cutA,cut);
    dp=d;
    const fC=f*fK*SM(dC,1.4,2.7),fG=f*SM(dC,1.9,3.8), /* (2026-10-16, TRAÎNÉES) le fondu près de l'objectif RESSERRÉ (cœur 2,4-4,2 → 1,4-2,7 m, halo 3-6,5 → 1,9-3,8 m) : la poursuite est à 2,5-4,5 m des feux, donc TOUT ce qu'on voyait de la traînée en course était dans le fondu — deux fils pâles. Les plafonds de largeur (capC/capG) gardent l'écran sans voile. */wk=1+(wv-1)*Math.exp(-arc*.3); // l'élargissement de l'allumage ne gonfle que la TÊTE ; près de l'objectif tout s'efface (jamais de voile)
    const wc=Math.min(SIL.wC*wa*(1+.25*al)*wk,dC*SIL.capC*wa),wg=Math.min((SIL.wG+SIL.wGa*al)*wa*wk,dC*SIL.capG*wa); // le cœur garde sa largeur, le halo s'élargit au loin (v5 : plafonds près de l'objectif réglables)
    const pu=1+SIL.pouls*(SIL_STY&&SIL_STY.p?SIL_STY.p:1)*tr.hk*Math.pow(Math.max(0,Math.sin(arc*.5-tr.clk*SIL.poulsV)),4); // (v6) les POULS : des perles d'énergie filent de la tuyère vers la queue
    const hot=SIL.chaud*(.12+.88*tr.hk)*fC*Math.exp(-arc*.4)*pu; // (traînées de lumière) un feu arrière ne blanchit presque pas ; le nitro, si // la tête BLANCHIT
    /* LE FEU REFROIDIT : blanc à la tuyère, la couleur franche sur le corps, puis elle tire vers le ROUGE-MAGENTA vers le bout */
    /* (2026-10-15) …comme les CUBES du feu de pixels : la teinte GARDE sa famille et s'assombrit en se serrant un peu sur sa couleur dominante —
       l'orange tombe à la braise (pas au rouge : « trop rouge par rapport à la barre », Sacha), le bleu de réserve au bleu nuit, le rouge des feux
       au rouge sang. Plus de virage magenta. */
    const c0=Q[o+4],c1=Q[o+5],c2=Q[o+6],m9=Math.max(c0,c1,c2,1e-4),fr=(SIL_STY&&SIL_STY.f!=null?SIL_STY.f:SIL.froid)*SM(al,.08,.85),
      qr=c0+(c0*.5*Math.pow(c0/m9,.4)-c0)*fr,qg=c1+(c1*.5*Math.pow(c1/m9,.4)-c1)*fr,qb=c2+(c2*.5*Math.pow(c2/m9,.4)-c2)*fr;
    const hk=SIL.halo*(SIL_STY?SIL_STY.h:1)*(1+(pu-1)*.4),ck=SIL.coeur*(SIL_STY?SIL_STY.c:1)*pu,v=r*12;let gr=qr*fG*hk,gg=qg*fG*hk,gb=qb*fG*hk,kr=qr*fC*ck+hot,kg=qg*fC*ck+hot,kb=qb*fC*ck+hot;
    if(SIL_ENCRE){const mq=Math.max(qr,qg,qb,1e-4),hr=1-qr/mq,hg=1-qg/mq,hb=1-qb/mq,sg=Math.min(1,fG*hk*1.15),sc=Math.min(1,fC*ck*1.1); // l'ENCRE : la teinte pure, posée à l'intensité de la lumière (le cœur « blanc » se lit en couleur dense)
      gr=hr*sg;gg=hg*sg;gb=hb*sg;kr=Math.min(1,(hr+.18)*sc);kg=Math.min(1,(hg+.18)*sc);kb=Math.min(1,(hb+.18)*sc);}
    P[v]=x+SS.x*wg;P[v+1]=y+SS.y*wg;P[v+2]=z+SS.z*wg;P[v+3]=x-SS.x*wg;P[v+4]=y-SS.y*wg;P[v+5]=z-SS.z*wg;
    P[v+6]=x+SS.x*wc;P[v+7]=y+SS.y*wc;P[v+8]=z+SS.z*wc;P[v+9]=x-SS.x*wc;P[v+10]=y-SS.y*wc;P[v+11]=z-SS.z*wc;
    C[v]=C[v+3]=gr;C[v+1]=C[v+4]=gg;C[v+2]=C[v+5]=gb;C[v+6]=C[v+9]=kr;C[v+7]=C[v+10]=kg;C[v+8]=C[v+11]=kb;
    if(dk>0){const mq=Math.max(qr,qg,qb,1e-4),s9=Math.min(TRJ.max,fG*hk*dk*(.3+.7*tr.hk)); // le voile sous le HALO — surtout au nitro : le simple trait des feux arrière reste discret de jour : le fond perd ce qui n'est pas la couleur de la traînée (le cœur n'en a pas : il brille par-dessus)
      CI[v]=CI[v+3]=(1-qr/mq)*s9;CI[v+1]=CI[v+4]=(1-qg/mq)*s9;CI[v+2]=CI[v+5]=(1-qb/mq)*s9;CI[v+6]=CI[v+7]=CI[v+8]=CI[v+9]=CI[v+10]=CI[v+11]=0;}
    if(fin){Rf=r+1;break;}
  }
  tr.m.geometry.setDrawRange(0,Math.max(0,Rf-1)*12);tr.m.visible=Rf>1;
  {const a9=tr.m.geometry.attributes,c9=Math.max(1,Rf)*12;a9.position.updateRange.offset=0;a9.position.updateRange.count=c9;a9.color.updateRange.offset=0;a9.color.updateRange.count=c9; // (revue GAMEPLAY) on n'envoie que les rangées dessinées — sans updateRange, three renvoyait les 2 × 19 Ko du tampon à chaque image, par pot
   a9.position.needsUpdate=true;a9.color.needsUpdate=true;}
  tr.mi.visible=dk>0&&Rf>1;if(tr.mi.visible){const gi=tr.mi.geometry,ci=gi.attributes.color;gi.setDrawRange(0,Math.max(0,Rf-1)*12);ci.updateRange.offset=0;ci.updateRange.count=Math.max(1,Rf)*12;ci.needsUpdate=true;}
}
/* <<<VOITURES>>> ---------------------------------------------------------------------------
   LA CARROSSERIE — tout ce qui fabrique une caisse, des matériaux jusqu'aux flaques au sol.
   Ces balises servent à `voitures.html` (L'ÉTAL DES VOITURES), qui LIT ce fichier au chargement
   et exécute le bloc tel quel : la planche contact et les silhouettes montrent donc les VRAIES
   caisses du jeu, pas une copie qui aurait dérivé à la première retouche.
   ⚠ Le bloc ne doit dépendre QUE de : THREE · envTex · CARS · carGroup. Tout le reste (RIM_U,
   rimify, wheels, les textures de halo, la plume de réacteur, JETS/CARPOOL) est déclaré DEDANS.
   Ajouter ici une référence à un global du jeu (scene, level, SND…) casserait l'étal en silence.
   -------------------------------------------------------------------------------------------- */
// ---- RIM GOLDEN HOUR : liseré doré sur les arêtes exposées au soleil (fresnel masqué côté lumière).
// Uniforms PARTAGÉS entre toutes les caisses — une seule source de vérité, teinte pilotée par l'état dans loop().
const RIM_U={uRimC:{value:new THREE.Color(0xffd9a0)},uRimStr:{value:.40},uRimPow:{value:3.0},uSunV:{value:new THREE.Vector3()}};
/* LES FEUX ÉCLAIRENT LA CAISSE (2026-10-17, « les lumières de la caisse v2 » — Sacha : « comment la lumière des feux arrière se reflète dans le pare-brise
   arrière ») : les deux feux arrière (repère VUE : uFvA/uFvB = position + rayon², uFvC = rouge × intensité, posés par lumVue) allument la tôle qui les
   entoure — le pare-chocs, la malle, la jupe — en diffus vrai (cosinus, inverse du carré), et le VERRE (la lunette arrière, juste au-dessus) en prend le
   REFLET : un voile rouge qui monte du bas de la vitre, plus fort en rasant (Fresnel) — la lunette, sombre et lisse, renvoie la lueur des feux. `uFvK` =
   la part de ce reflet par matière (verre 1, chrome .6, laque .2, mat .05). Une branche UNIFORME (feux éteints de jour : rien n'est calculé), quelques
   opérations par pixel de caisse, zéro lumière three de plus. Hors course (garage, boutique, étal), uFvC vaut 0. */
const FEU_U={uFvA:{value:new THREE.Vector4(0,0,0,1)},uFvB:{value:new THREE.Vector4(0,0,0,1)},uFvC:{value:new THREE.Color(0,0,0)}};
const FEU_GLSL='uniform vec4 uFvA,uFvB;uniform vec3 uFvC;uniform float uFvK;\n'+
  'vec3 fvFeu(vec4 a,vec3 P,vec3 N,vec3 V,vec3 al){vec3 L=a.xyz-P;float d2=dot(L,L);'+
  'return (max(dot(N,L),0.)*inversesqrt(d2)*al*exp(-d2*1.6)+uFvK*(.3+.7*pow(1.-abs(dot(N,V)),2.))*exp(-d2*.9))/(d2+a.w);}\n'; // exp(-d²·1,6) : la lueur reste AUTOUR du feu (à 1/d² seul, toute la poupe virait au rouge uni) ; le reflet du verre porte un peu plus haut
const FEU_APPEL='if(uFvC.r+uFvC.g+uFvC.b>0.){vec3 P9=-vViewPosition,N9=normalize(normal),V9=normalize(vViewPosition);gl_FragColor.rgb+=uFvC*(fvFeu(uFvA,P9,N9,V9,diffuseColor.rgb)+fvFeu(uFvB,P9,N9,V9,diffuseColor.rgb));}\n';
/* ---- LE VERNIS (2026-09-26) — la laque garde sa COULEUR, le ciel se pose PAR-DESSUS selon l'angle -------------------------
   ⚠ POURQUOI. En `MixOperation`, three MÉLANGE peinture et reflet dans une proportion FIXE (`reflectivity`) : à .45 (le plafond
   de la passe de finition), une caisse jaune vue de face était à 45 % le ciel violet — une peinture délavée sous TOUS les angles,
   et des vitres couleur de ciel qu'on lisait comme de la tôle claire. Une vraie laque est un VERNIS : de face on voit la couleur
   (quelques % de reflet), en RASANT le vernis devient miroir (Fresnel). Les flancs vus de la poursuite, le toit, les vitres
   couchées attrapent le ciel ; ce qu'on regarde en face reste franc et saturé.
   `uVern` = (part du reflet DE FACE, part EN RASANT — en multiples de `reflectivity` —, dureté de la courbe, teinte MÉTAL 0-1 :
   le chrome et l'or teintent leur reflet de leur propre couleur, une laque non). (1,1,1,0) = l'ancien mélange au bit près :
   l'épave (« ne rien changer ») et les fruits le gardent. Zéro programme de plus : tout vit dans un uniform, le code est le même
   pour toutes les matières (three r128 réutilise le programme d'une matière à l'autre — un `if` par matière y casserait tout). */
const ENV_VERNIS=THREE.ShaderChunk.envmap_fragment.replace(
  'outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );',
  'float vnF=pow(1.-saturate(dot(normal,normalize(vViewPosition))),uVern.z);\n'+
  '\t\toutgoingLight=mix(outgoingLight,envColor.xyz*mix(vec3(1.),diffuseColor.rgb,uVern.w),saturate(specularStrength*reflectivity*mix(uVern.x,uVern.y,vnF)));');
if(ENV_VERNIS===THREE.ShaderChunk.envmap_fragment)console.warn('CASH CAR : vernis non greffé (chunk envmap inattendu) — reflets à l\'ancienne');
/* LE LISERÉ CÔTÉ SOURCE (2026-09-26, vague 2 — la bible : « toute caisse a un liseré du côté de la source »). Le liseré d'origine
   (Fresnel ^uRimPow, gardé sur le flanc qui fait face au soleil) disparaissait dans le cas qui compte le plus : le CONTRE-JOUR — soleil
   bas devant, caméra de poursuite derrière (golden, couchant). La caisse n'y était plus qu'une masse sombre découpée sur un ciel en feu.
   Le 2e terme ajoute ce que fait un vrai contre-jour : les ARÊTES de la silhouette (Fresnel ^5 — un trait, pas un halo) s'allument du
   côté du soleil À L'ÉCRAN, d'autant plus que le soleil est face à la caméra (`-uSunV.z`). Mêmes uniformes (couleur et force pilotées
   ailleurs, par état et par niveau), quelques opérations par pixel de caisse, zéro programme de plus. Partagé par rimify et lpMat. */
const RIM_GLSL=cj=>'vec3 nR9=normalize(normal);float nv9=1.-saturate(dot(nR9,normalize(vViewPosition)));\n'+ // `cj` : le poids du contre-jour (les fruits de lpMat n'en veulent pas)
  'float rimF=pow(nv9,uRimPow)*smoothstep(-.25,.55,dot(nR9,uSunV));\n'+
  'rimF+='+cj+'*pow(nv9,5.)*1.6*smoothstep(.1,.8,-uSunV.z)*smoothstep(-.2,.6,dot(nR9.xy,uSunV.xy));\n';
/* LA CAISSE NE CALCULE PLUS LES LAMPES ÉTEINTES (2026-09-27, passe perf iPhone, tour 2). En course, le programme de la tôle compte DIX
   lumières ponctuelles (lampe de carrosserie, reflets nitro/traînée, flash de pose, gyrophares, nitro du bot, lampes de l'étal…) et r128
   les évalue TOUTES, dans chaque pixel de la caisse — atténuation, puissance, Blinn-Phong — même éteintes : presque toujours neuf sur dix.
   MESURÉ (caisse seule, image figée, GPU 1170×2532) : 0,95 → 0,64 ms. Chaque lampe est désormais sautée quand sa couleur vaut zéro (un test
   UNIFORME : toute la caisse prend la même branche) ou quand elle n'atteint pas ce pixel (portée) ; le phare hors de son cône et les
   directionnelles dos à la face aussi. Exact : l'apport sauté valait 0. Dépend de THREE seul (le bloc VOITURES est relu par l'étal). */
const LFB_CAISSE=(function(){
  const L0=THREE.ShaderChunk.lights_fragment_begin,
        po=/(pointLight = pointLights\[ i \];)(\s*getPointDirectLightIrradiance\( pointLight, geometry, directLight \);)([\s\S]*?RE_Direct\( directLight, geometry, material, reflectedLight \);)/,
        sp=/(getSpotDirectLightIrradiance\( spotLight, geometry, directLight \);)([\s\S]*?RE_Direct\( directLight, geometry, material, reflectedLight \);)/,
        di=/(getDirectionalDirectLightIrradiance\( directionalLight, geometry, directLight \);)([\s\S]*?RE_Direct\( directLight, geometry, material, reflectedLight \);)/;
  if(!po.test(L0)||!sp.test(L0)||!di.test(L0)){console.warn('CASH CAR : lumières de la caisse non greffées (chunk inattendu)');return L0;}
  return L0.replace(po,'$1\n\t\tif ( any( notEqual( pointLight.color, vec3( 0.0 ) ) ) ) {$2\n\t\tif ( directLight.visible ) {$3\n\t\t}\n\t\t}')
    .replace(sp,'$1\n\t\tif ( directLight.visible && directLight.color.r + directLight.color.g + directLight.color.b > 0.0 ) {$2\n\t\t}')
    .replace(di,'$1\n\t\tif ( dot( geometry.normal, directLight.direction ) > 0.0 && directLight.color.r + directLight.color.g + directLight.color.b > 0.0 ) {$2\n\t\t}');})();
/* ⚠ Greffé SEULEMENT là où la matière avait déjà son programme à elle (rimify, lpMat). Les Phong « nues » de la caisse (sombre, rouille,
   matières des gabarits) partagent le programme Phong générique de la scène : leur donner le leur ajoutait 1 à 7 programmes à relier AU
   DÉPART de la course (mesuré — le nombre de lumières ponctuelles change entre le garage et la course, tout se relie à ce moment-là). */
// `v` : le vernis (voir ENV_VERNIS) · `rimK` : part du liseré doré (0 = aucun — le verre et le chrome n'en veulent pas)
function rimify(m,v,rimK,fvK){ // fvK : la part du REFLET DES FEUX (voir FEU_U) — la tôle .2, le verre 1
  const uV={value:new THREE.Vector4().fromArray(v||[1,1,1,0])},uK={value:rimK==null?1:rimK},uF={value:fvK==null?.2:fvK};
  m.userData.uVr=uV;m.userData.rimK=uK.value; // (2026-10-20) LA FINITION STUDIO (finition.js) règle ce vernis au garage : rimify ne sert qu'aux caisses (LA HONTE, REQUIN, ACIDE, la tôle des gabarits hors kit)
  m.onBeforeCompile=function(sh){
    sh.uniforms.uStuHdr=FSTU.uHdr; // (2026-10-20) les reflets qui éclatent au garage, comme la tôle du kit (voir finition.js) — 0 en course : rien ne change
    sh.uniforms.uRimC=RIM_U.uRimC;sh.uniforms.uRimStr=RIM_U.uRimStr;sh.uniforms.uRimPow=RIM_U.uRimPow;sh.uniforms.uSunV=RIM_U.uSunV;
    sh.uniforms.uVern=uV;sh.uniforms.uRimK=uK;sh.uniforms.uFvA=FEU_U.uFvA;sh.uniforms.uFvB=FEU_U.uFvB;sh.uniforms.uFvC=FEU_U.uFvC;sh.uniforms.uFvK=uF;
    sh.fragmentShader=sh.fragmentShader
      .replace('#include <common>','#include <common>\nuniform vec3 uRimC;uniform vec3 uSunV;uniform float uRimStr;uniform float uRimPow;uniform vec4 uVern;uniform float uRimK;\n'+FEU_GLSL+FSTU_HDR)
      .replace('#include <envmap_fragment>',ENV_VERNIS.replace('envColor.xyz*mix(vec3(1.),diffuseColor.rgb,uVern.w)','fstuHdr(envColor.xyz)*mix(vec3(1.),diffuseColor.rgb,uVern.w)')).replace('#include <lights_fragment_begin>',LFB_CAISSE) // (tour 2) les lampes éteintes sautent (voir LFB_CAISSE)
      .replace('#include <dithering_fragment>',RIM_GLSL('1.')+ // seulement le flanc au soleil : un liseré, pas un halo cartoon (+ le contre-jour : voir RIM_GLSL)
        'gl_FragColor.rgb+=uRimC*rimF*uRimStr*uRimK;\n'+FEU_APPEL+'#include <dithering_fragment>'); // (2026-10-17) + la lueur des feux arrière (voir FEU_U)
  };
}
const wheels=[];
/* (2026-09-25, user : « la voiture doit vraiment pencher sur le côté lors des virages ») LA CARROSSERIE : tout ce qui n'est ni roue ni
   flaque au sol vit dans `carBody`, qui ROULE autour de l'axe des roues (buildCar l'y range). Les roues restent au sol, la caisse
   s'écrase dans le virage. Avant, le roulis faisait pencher tout le groupe, roues comprises, de 7° au plus. */
const carBody=new THREE.Group();carBody.name='carrosserie';
// halo doux pour phares/feux (défini AVANT buildCar)
// ⚠ était en 32×32 avec une chute LINÉAIRE : de près, un phare n'était qu'une bouillie pixelisée et
// fade. En 128 px avec un CŒUR BLANC net qui s'éteint vite, l'ampoule a enfin un point chaud —
// c'est ce contraste (foyer dur / halo doux) qui fait lire une source de lumière plutôt qu'une tache.
const lampTex=(function(){
  const s=128,cv=document.createElement('canvas');cv.width=cv.height=s;
  const c=cv.getContext('2d');
  const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(255,255,255,1)');
  g.addColorStop(.14,'rgba(255,255,255,1)');    // le FOYER : franc, saturé
  g.addColorStop(.26,'rgba(255,255,255,.72)');
  g.addColorStop(.48,'rgba(255,255,255,.30)');  // la chute rapide = le contraste
  g.addColorStop(.74,'rgba(255,255,255,.08)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.fillRect(0,0,s,s);
  const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;return t;
})();
/* LES FEUX QUI VIVENT (2026-09-26) — les halos des phares et des feux partagent UNE matière par famille (au lieu d'une par
   sprite, jamais libérée) : la boucle (`carVit`) les fait répondre à l'ANGLE — un phare n'éblouit que celui qui le regarde en
   face, vu de profil il n'est plus qu'un point — et au FREIN : pouce tiré vers le bas (drift) ou ↓, les feux s'embrasent.
   `userData.k` = la taille d'origine du sprite, que la boucle module sans jamais la perdre. */
const HALO={hM:new THREE.SpriteMaterial({map:lampTex,color:0xffe2a8,transparent:true,opacity:.95,depthWrite:false}),
            tM:new THREE.SpriteMaterial({map:lampTex,color:0xff2818,transparent:true,opacity:.85,depthWrite:false}),h:[],t:[]};
/* LES PHARES ESCAMOTABLES ALLUMÉS SEULEMENT LEVÉS (2026-10-18, LA VETTE) : `CAR_PHK` = combien les phares de la caisse sont levés, de 0 (rangés)
   à 1 ; null = une caisse aux phares fixes (toutes les autres). La caisse qui a des escamotables le pose chaque image (son `BLING.anim`) ; il
   multiplie le halo des phares, leur nappe au sol (carVit) et leur lumière sur la route (lumTick). buildCar le remet à null. */
var CAR_PHK=null;
/* L'ACTION SPÉCIALE DE LA CAISSE (2026-10-20, Léo : « la Cerise, quand elle fait le clin d'œil, c'est une action spéciale ; ce genre d'action
   sera attribué à quelques voitures, et ça s'activera en cliquant sur la voiture — toutes les caisses, quand tu tapes, ça fait taper ; la
   Cerise, en plus, ses deux phares se lèvent et se baissent ») : `CAR_ACTION` = la fonction que le gabarit de la caisse équipée a posée
   (null = une caisse sans action : le tap ne fait que taper). `caisseAction()` la joue — appelée par le TAP du garage (garageImpact) et
   par le COUP du menu ciel (chuteTape), APRÈS l'effet commun à toutes. buildCar la remet à null. Console : dbgAction(). */
var CAR_ACTION=null;
function caisseAction(){if(typeof CAR_ACTION!=='function')return false;try{return CAR_ACTION()!==false;}catch(e){console.warn('caisseAction',e);return false;}}
window.dbgAction=function(){return caisseAction();};
/* LE FLOU DE JANTE (2026-09-26) — au-delà de ~20 km/h, cinq rayons tournent plus vite que l'image : l'œil voit la roue
   BÉGAYER, repartir en arrière (effet stroboscopique). Un disque peint par-dessus la jante — ce qu'une photo voit d'une roue
   lancée : moyeu clair, voile gris des rayons moyennés, lèvre brillante, stries concentriques — monte en opacité avec la
   vitesse. Symétrique de révolution : il ne tourne pas, les QUATRE vivent dans UN seul maillage (un appel de dessin, éteint
   à l'arrêt). Motif DÉTERMINISTE (pas de Math.random : les photos avant/après restent comparables). */
const flouRoueTex=(function(){
  const s=128,h=s/2,cv=document.createElement('canvas');cv.width=cv.height=s;const c=cv.getContext('2d');
  const g=c.createRadialGradient(h,h,0,h,h,h);
  g.addColorStop(0,'rgba(240,242,246,1)');g.addColorStop(.2,'rgba(205,210,218,.95)');          // le moyeu
  g.addColorStop(.28,'rgba(92,96,104,.88)');g.addColorStop(.62,'rgba(128,132,140,.84)');        // le voile des rayons (clair + fond sombre, moyennés)
  g.addColorStop(.8,'rgba(96,100,108,.9)');g.addColorStop(.87,'rgba(250,251,253,1)');           // la lèvre qui accroche la lumière
  g.addColorStop(.95,'rgba(170,175,184,.9)');g.addColorStop(1,'rgba(60,62,70,0)');
  c.fillStyle=g;c.beginPath();c.arc(h,h,h,0,7);c.fill();
  c.globalCompositeOperation='source-atop';                                                     // le FILÉ : stries concentriques
  for(let i=0;i<14;i++){const r=h*(.3+.5*i/13)+Math.sin(i*7.3)*1.5;
    c.strokeStyle=(i&1)?'rgba(255,255,255,.14)':'rgba(0,0,0,.16)';c.lineWidth=1+(i%3)*.5;c.beginPath();c.arc(h,h,r,0,7);c.stroke();}
  return new THREE.CanvasTexture(cv);
})();
const ROUES={v:0,flou:null}; // `v` : vitesse du sol sous les pneus (m/s, posée par la boucle) · `flou` : le maillage des 4 disques de la caisse
// FLAQUE AU SOL : dégradé radial à EXTINCTION FRANCHE, éteint bien avant le bord du canvas —
// avec lampTex (chute molle) les nappes additives saturaient en PAVÉ de couleur visible.
const poolTex=(function(){
  const cv=document.createElement('canvas');cv.width=cv.height=128;
  const c=cv.getContext('2d');
  const g=c.createRadialGradient(64,64,2,64,64,56);
  g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.35,'rgba(255,255,255,.38)');
  g.addColorStop(.7,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.beginPath();c.arc(64,64,56,0,7);c.fill();
  return new THREE.CanvasTexture(cv);
})();
// FAISCEAUX DE PHARES : DEUX cônes peints qui partent du pare-chocs (haut du canvas) et
// s'évasent en fondant vers l'avant — posés à plat sur la route, ILS SONT la lumière des phares.
// Blanc neutre : la teinte vient du matériau (chaud joueur / blanc-bleu police).
const beamTex=(function(){
  const cv=document.createElement('canvas');cv.width=cv.height=256;
  const c=cv.getContext('2d');
  try{c.filter='blur(7px)';}catch(e){}
  for(const sd of [-1,1]){
    const x0=128+sd*30;
    const g=c.createLinearGradient(0,8,0,236);
    g.addColorStop(0,'rgba(255,248,238,.95)');g.addColorStop(.38,'rgba(255,244,228,.42)');
    g.addColorStop(.8,'rgba(255,240,220,.07)');g.addColorStop(1,'rgba(255,240,220,0)');
    c.fillStyle=g;
    c.beginPath();c.moveTo(x0-12,10);c.lineTo(x0+12,10);c.lineTo(x0+sd*14+46*sd+14,238);c.lineTo(x0+sd*14-46*sd-14,238);c.closePath();c.fill();
  }
  flou2dRepli(c,256,256,7); /* (24/10) Safari n'a pas `ctx.filter` : le même flou, après coup (voir LE FLOU DES TOILES SANS ctx.filter, rendu/soleil-planete.js) */
  return new THREE.CanvasTexture(cv);
})();
// ---- PLUME DE RÉACTEUR (façon fusée) : cône incandescent à la tuyère — dégradé + ANNEAUX DE CHOC bakés.
// Blanc pur dans la texture, la teinte vient du matériau (orange nitro / bleu réserve). Partagé par toutes les caisses.
/* (2026-09-26, passe graphique) PLUME v2 — deux textures au lieu d'une :
   · l'ENVELOPPE (jetTex) : chute exponentielle de la tuyère vers la pointe + LANGUES DE FLAMME (bandes le long du cône, qui s'élargissent
     vers la pointe) — la boucle fait TOURNER le cône sur son axe, les langues ondulent ; plus de cornet orange uniforme ;
   · le CŒUR (jetCoreTex) : blanc brûlant, court, rythmé de DIAMANTS DE CHOC nets (les disques de Mach des réacteurs) séparés par des
     creux sombres — en additif double face, chaque anneau se lit comme une barre lumineuse en travers du jet.
   Toujours du blanc : la teinte vient des matériaux (orange nitro / bleu réserve / signature). Cuites une fois, partagées.
   ⚠ (2026-09-28) la plume est désormais CALCULÉE (voir « LA FLAMME VIVANTE » plus bas), pour la caisse comme pour la meute : les deux
   textures cuites (`jetTex`, `jetCoreTex`) ont disparu — ce paragraphe ne reste que pour l'histoire. */
const jetGeo=(function(){ // (2026-09-28) un PROFIL de flamme tourné (étroit à la tuyère, ventre, pointe effilée) au lieu d'un cône : un cône se lit comme une pointe de crayon
  const P=[[.5,0],[.8,.07],[.98,.2],[1,.32],[.86,.5],[.62,.68],[.36,.84],[.13,.95],[0,1]].map(function(q){return new THREE.Vector2(q[0],q[1]);});
  const g=new THREE.LatheGeometry(P,12);
  g.rotateX(-Math.PI/2); // base à la tuyère (z 0), pointe vers l'ARRIÈRE (-Z caisse) — uv.y : 0 à la tuyère, 1 à la pointe
  return g;
})();
/* LA FLAMME VIVANTE (2026-09-28, Sacha : « les animations du nitro pourraient faire beaucoup plus FLAMME, façon Asphalt 9 ») — MESURÉ
   en capture avant : vue de la poursuite, la plume était deux BOUDINS orange lisses (une texture fixe qui tournait sur un cône : aucune
   langue ne naissait ni ne mourait). Désormais la flamme est CALCULÉE à chaque image : un bruit qui COULE de la tuyère vers la pointe
   ronge la matière (les langues se détachent et s'éteignent en route), une racine BLEUE de brûleur à gaz sous le cœur blanc — la
   signature des flammes de nitro —, un corps à la couleur de la poussée qui rougit vers la pointe, et un bord qui s'efface avec
   l'angle (plus de cornet à arête dure). UN seul programme pour l'enveloppe et le cœur (mêmes sources, uniforms à part), sans
   brouillard ni lumières : il est compilé au chargement avec le reste (`renderer.compile` parcourt aussi le caché) et ne dépend
   d'aucun nombre de lumières. `color` reste une vraie THREE.Color (la boucle, l'arc-en-ciel et dbgNitro la lisent/écrivent). */
const JET_VS='uniform float uT;varying vec2 vUv;varying float vE;varying float vZ;void main(){vUv=uv;vec3 p=position;float w=uv.y*uv.y;'
  +'p.x+=sin(uT*23.+uv.y*9.)*.2*w;p.y+=cos(uT*19.+uv.y*7.)*.2*w;'                // la pointe LÈCHE l'air : elle erre, la racine reste dans le pot
  +'vec4 mv=modelViewMatrix*vec4(p,1.);vE=abs(dot(normalize(normalMatrix*normal),normalize(-mv.xyz)));vZ=-mv.z;gl_Position=projectionMatrix*mv;}';
const JET_FS='uniform vec3 uCol;uniform vec3 uHot;uniform vec3 uRac;uniform float uT;uniform float uA;uniform float uRonge;uniform float uLong;uniform vec3 uPres;'
  +'varying vec2 vUv;varying float vE;varying float vZ;'
  +'float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'
  +'float nn(vec2 p,float P){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);'           // bruit de valeur PÉRIODIQUE autour du cône (pas de couture)
  +'return mix(mix(hh(vec2(mod(i.x,P),i.y)),hh(vec2(mod(i.x+1.,P),i.y)),f.x),mix(hh(vec2(mod(i.x,P),i.y+1.)),hh(vec2(mod(i.x+1.,P),i.y+1.)),f.x),f.y);}'
  +'void main(){float v=vUv.y,a=vUv.x;'
  +'float n=nn(vec2(a*6.,v*3.2*uLong-uT*11.),6.)*.62+nn(vec2(a*12.,v*7.*uLong-uT*17.+3.1),12.)*.38;' // le bruit COULE vers la pointe
  +'float d=smoothstep(0.,.42,(1.-v)*1.3-n*(.18+.9*v)*uRonge);'                   // les langues : la pointe est rongée, la racine tient
  +'d*=smoothstep(0.,.05,v);'                                                     // la flamme naît DANS la bouche du pot
  +'vec3 c=mix(uRac,uHot,smoothstep(.05,.26,v));'                                 // racine bleue → cœur blanc
  +'c=mix(c,uCol,smoothstep(.12,.5,v));'                                          // → la couleur de la poussée
  +'c=mix(c,uCol*vec3(.95,.42,.3),smoothstep(.55,1.,v));'                         // → qui rougit vers la pointe
  +'c+=uHot*.35*smoothstep(.55,.95,n)*(1.-v);'                                    // les crêtes du bruit s'embrasent
  +'gl_FragColor=vec4(c,d*smoothstep(.02,.5,vE)*uA*mix(1.,smoothstep(uPres.x,uPres.y,vZ),uPres.z));}'; // uPres : près de l'objectif la flamme s'efface (x → y m de profondeur, part z) — 0 pour les pots, la comète de NITROOO s'en sert debout
function jetMat(col,hot,rac,a,ronge,lng){
  const u={uCol:{value:new THREE.Color(col)},uHot:{value:new THREE.Color(hot)},uRac:{value:new THREE.Color(rac)},uT:JET_T,uA:{value:a},uRonge:{value:ronge},uLong:{value:lng},uPres:{value:new THREE.Vector3(0,1,0)}};
  const m=new THREE.ShaderMaterial({uniforms:u,vertexShader:JET_VS,fragmentShader:JET_FS,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  m.color=u.uCol.value;return m;}
const JET_T={value:0}; // l'horloge des flammes (partagée par l'enveloppe et le cœur), avancée par la boucle
const jetShellM=jetMat(0xff8c30,0xfff4dc,0x6f8cff,.95,1,1);
const jetCoreM=jetMat(0xffe6b0,0xffffff,0xa9c0ff,1,.7,1.35);
const jetGlowM=new THREE.SpriteMaterial({map:lampTex,color:0xff9040,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
const JETS={shells:[],cores:[],glows:[],k:0}; // rempli par buildCar, animé chaque frame
const JET_DIR=[0,1,2,3].map(function(){return new THREE.Vector3(0,0,-1);}),JET_NZ=new THREE.Vector3(0,0,-1),JET_Z=new THREE.Vector3(0,0,1),JET_V=new THREE.Vector3(),JET_QI=new THREE.Quaternion(),JET_QS=new THREE.Quaternion(); // (sillage v5) l'axe de chaque plume, dans le repère caisse
/* ===== LES FEUX EN LED — L'ÉTUDE (2026-10-20, Léo : « fais une étude des lumières des voitures, que je trouve encore un peu jaunes et pas très
   stylées ; inspire-toi encore une fois des physiques d'ARC Raiders » → au questionnaire : les FEUX des caisses, pas la lumière posée dessus) =====
   MESURÉ au banc avant de toucher (garage, ville la nuit, pixels lus sur la vraie image) : le jaune vient de QUATRE endroits, empilés —
   · le HALO des phares (`HALO.hM`, sprite 0xffe2a8 à ,95, allumé en grand au garage) : sur LE CAÏD la nuit, le cœur du phare sort #f7bd48 (or) ;
   · les pièces lumineuses elles-mêmes : 30 caisses ont des phares crème (#fff3d6, #f6e6c6, #fff6e6), 14 seulement un blanc froid ; les vieux
     gabarits posent des feux-boîtes 0xfff6c8 (jaune pâle) ; 42 caisses portent de l'ambre, dont des ambres JAUNES (#ffc84a, #ffd23a, #ffe08a) ;
   · le faisceau sur la route (`LUMK.hlC` [1, ,88, ,7] ≈ une ampoule halogène de 3 000 K) et la nappe peinte du garage (0xffd9a6) ;
   · les feux arrière, dont le halo tire sur l'ORANGE (0xff2818, 0xff5a36 au frein) — et la boule molle de `lampTex` autour de chaque feu.
   La LEÇON d'ARC Raiders (ses images sont à Embark : rien n'en est copié) : une lumière NATURELLE et FROIDE — des blancs neutres, des sources
   NETTES (c'est la forme de la lampe qui brille, pas une boule autour), un rouge franc, et de l'AIR ÉPAIS qui montre la lumière la nuit.
   Trois lectures sur les planches (`?feux=1` · `?feux=2` · `?feux=3`) — Léo a choisi la 2 puis demandé la lumière DANS le phare : c'est la 3, LE JEU
   depuis le 20/10 (`?feux=0` = les feux d'avant l'étude) :
   · 1 LED NETTE : blanc 6 500 K sur les pièces, les halos et le faisceau ; la lampe brille un peu au-delà du blanc (le bloom naît de sa forme) ;
     halos 30 % plus petits, en point LED serré ; rouge LED franc ; les ambres jaunes ramenés à l'ambre orangé d'un vrai clignotant.
   · 2 LUMIÈRE DANS L'AIR : la 1, plus froide (7 500 K) et plus vive, halos réduits de moitié, les ambres en veilleuse (un clignotant éteint),
     et LE FAISCEAU DANS L'AIR : un cône de lumière part de chaque phare, la nuit, dans la brume (l'air épais d'ARC).
   · 3 LA LUMIÈRE DANS LE PHARE (le jeu) : la 2 SANS AUCUN HALO, ni devant ni derrière ; la lampe s'allume elle-même, sa lueur suit sa forme (voir
     plus bas, les coques).
   Rien n'est retouché dans les fiches ni dans les formes : la couleur des pièces 'l' est relue APRÈS la construction (`feuxLed`, fin de buildCar),
   seulement aux deux BOUTS de la caisse (les décors lumineux d'un flanc — le pelage du DOGE — restent tels quels). */
const FEUX_DOSES={ /* blanc : la teinte des LED blanches · kB : leur éclat (> 1 : le bloom naît de la FORME de la lampe) · rouge/kR · ambre/kA (,55 = un
   clignotant en veilleuse) · halo, kH : la teinte et la taille des halos · hlC : le faisceau sur la route · tC/tF : le halo des feux arrière, au frein ·
   nappe : la nappe peinte du garage et la teinte du faisceau dans l'air · fais : la force du faisceau dans l'air (0 = aucun) */
  1:{blanc:[.93,.96,1],kB:1.3,rouge:[1,.05,.11],kR:1.15,ambre:[1,.5,.08],kA:1,halo:0xf0f5ff,kH:.7,hlC:[.93,.97,1],tC:0xff1a2c,tF:0xff3646,nappe:0xe9f0ff,fais:0},
  2:{blanc:[.85,.93,1],kB:1.6,rouge:[1,.04,.12],kR:1.4,ambre:[1,.5,.08],kA:.55,halo:0xe6efff,kH:.5,hlC:[.82,.92,1],tC:0xff0f2a,tF:0xff2a40,nappe:0xdfeaff,fais:.4}};
/* LECTURE 3 (même jour, Léo, après la planche : « intègre la lumière à l'intérieur des phares, efface cette forme de boule » — « je dirai 2 ») : la 2, SANS
   aucun halo (ni devant ni derrière) ; c'est la lampe qui s'allume, et le bloom naît de SA forme (la barre du CAÏD, les ronds du SCARABÉE). */
/* ⚠ MESURÉ : une lampe poussée au-delà du blanc ne brille PAS plus — le bloom lit la scène écrêtée à [0,1] (son seuil plié, voir PLIAGE). La
   lumière doit donc venir d'une LUEUR À LA FORME DU PHARE : les triangles de chaque lampe (regroupés par voisinage) sont recopiés en trois
   COQUES de plus en plus larges (chaque sommet poussé vers l'extérieur de SA lampe, axe par axe, de 1/3, 2/3 puis toute la marge : 4 à 12 cm),
   de plus en plus faibles, additives. La barre du CAÏD luit en barre, les ronds du SCARABÉE en ronds, un feu qui tourne autour du coin aussi
   (une carte plate devant lui faisait une plaque : essai écarté). Même programme que les lampes (vertexColors, additif : le noir n'ajoute rien). */
FEUX_DOSES[3]=Object.assign({},FEUX_DOSES[2],{kH:0,carte:[.75,.8],ambre:null});  /* carte : l'éclat de la lueur (devant, derrière) · ambre:null : les ambres
   gardent LEUR couleur — au balayage de la gamme, la veilleuse éteignait les étoiles d'or du DRAGON D'OR et les phares de rallye de LA STRATOS */
/* LES CAISSES-PERSONNAGES gardent leurs pièces lumineuses telles quelles (ce sont des YEUX, un pelage, de la lave, de la glace — pas des phares) :
   relevé au balayage de la gamme (le CHAT : les yeux bleuissaient ; LE DOGE : les sourcils). Les halos et le faisceau suivent la lecture. */
const FEUX_SAUF=['CHAT POP-TART','LE DOGE','LA FOURNAISE',"L'ICEBERG"];
/* ⚠ LA 3 EST LE JEU (oui de Léo, 20/10) : `?feux=0` rend les feux d'avant l'étude (halos crème), `?feux=1`/`?feux=2` les deux autres lectures. */
var FEUXL=(function(){let n=3;try{const q=new URLSearchParams(location.search).get('feux');if(q==='0'||q==='1'||q==='2')n=+q;}catch(e){}
  return {n:n,d:FEUX_DOSES[n]||null,fais:[],cartes:[],cM:null,stats:null,hlM:null,tlM:null,spec:null};})();
const FEUX_0={halo:0xffe2a8,tC:0xff2818,tF:0xff5a36,hlC:LUMK.hlC.slice(),nappe:0xffd9a6}; /* le main d'avant l'étude, pour revenir à chaud */
/* le POINT LED : un cœur blanc serré qui tombe vite (lampTex garde une traîne molle jusqu'à 74 % du rayon : la « boule de lumière ») */
const ledTex=(function(){
  const s=128,cv=document.createElement('canvas');cv.width=cv.height=s;const c=cv.getContext('2d');
  const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.09,'rgba(255,255,255,1)');g.addColorStop(.17,'rgba(255,255,255,.55)');
  g.addColorStop(.32,'rgba(255,255,255,.16)');g.addColorStop(.55,'rgba(255,255,255,.03)');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.fillRect(0,0,s,s);const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;return t;})();
function feuxGlobal(){ /* ce qui ne dépend pas de la caisse : les halos, les feux arrière, le faisceau sur la route */
  const D=FEUXL.d;HALO.hM.map=HALO.tM.map=D?ledTex:lampTex;HALO.hM.color.setHex(D?D.halo:FEUX_0.halo);
  VIT9.tC.setHex(D?D.tC:FEUX_0.tC);VIT9.tF.setHex(D?D.tF:FEUX_0.tF);LUMK.hlC=(D?D.hlC:FEUX_0.hlC).slice();}
if(FEUXL.d)feuxGlobal();
/* LE FAISCEAU DANS L'AIR (lecture 2) : un cône ouvert par phare, additif, qui s'éteint vers le bout et sur ses bords (|N·V| : épais au milieu,
   transparent sur la silhouette, comme un vrai volume de brume éclairée) — de nuit seulement (`VIT9.ph`, la même règle que les halos). */
const FAIS_M=new THREE.ShaderMaterial({uniforms:{uC:{value:new THREE.Color(0xdfeaff)},uK:{value:0},uL:{value:13}},
  vertexShader:'uniform float uL;varying float vL;varying vec3 vN;varying vec3 vV;void main(){vL=clamp(position.z/uL,0.,1.);vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform vec3 uC;uniform float uK;varying float vL;varying vec3 vN;varying vec3 vV;void main(){float f=abs(dot(normalize(vN),normalize(vV)));float a=pow(f,2.)*pow(1.-vL,1.6)*smoothstep(0.,.06,vL)*uK;gl_FragColor=vec4(uC*a,1.);}',
  transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
FAIS_M.userData.plq=1; /* partagée par toutes les caisses (la règle de LA PLAQUE dans buildCar : jamais libérée, pas de recompilation) */
const FAIS_G=(function(){const L=13,g=new THREE.CylinderGeometry(1.9,.16,L,18,6,true);g.translate(0,L/2,0);g.rotateX(Math.PI/2);return g;})(); /* l'axe le long de +z (l'avant de la caisse) */
function feuxCaisse(){ /* la caisse posée : ses pièces lumineuses, ses feux-boîtes, ses halos, sa nappe, ses faisceaux — relus depuis l'ORIGINE à chaque fois */
  const D0=FEUXL.d,spec=FEUXL.spec||CARS[level]||{l:4.4},D=D0&&FEUX_SAUF.indexOf(spec.name)>=0?null:D0; /* D : les pièces · D0 : les halos, la nappe, les faisceaux */
  const st={pieces:0,blanc:0,rouge:0,ambre:0,hors:0};
  const FV=[],RV=[]; /* (lecture 3) les TRIANGLES des lampes blanches (avant) et rouges (arrière), 9 nombres chacun, dans le repère de la caisse */
  const tris=function(G,Mi,L,K){const pa=G.attributes.position,ix=G.index,n=ix?ix.count:pa.count,q=new THREE.Vector3(); /* K(i) : le sommet i en est-il ? (null : tous) */
    for(let t=0;t+2<n;t+=3){const a=ix?ix.getX(t):t,b=ix?ix.getX(t+1):t+1,c=ix?ix.getX(t+2):t+2;if(K&&!(K(a)&&K(b)&&K(c)))continue;
      for(const i of [a,b,c]){q.set(pa.getX(i),pa.getY(i),pa.getZ(i)).applyMatrix4(Mi);L.push(q.x,q.y,q.z);}}};
  carGroup.updateMatrixWorld(true);
  const lim=(spec.l||4.4)*.26,inv=new THREE.Matrix4().copy(carGroup.matrixWorld).invert(),M=new THREE.Matrix4(),p=new THREE.Vector3();
  carGroup.traverse(function(m){
    const mt=m.material;if(!m.isMesh||!mt||Array.isArray(mt)||!mt.isMeshBasicMaterial)return;
    if(mt===FEUXL.hlM||mt===FEUXL.tlM){if(mt.userData.feuxC0==null)mt.userData.feuxC0=mt.color.getHex(); /* les feux-boîtes des vieux gabarits */
      if(!D)mt.color.setHex(mt.userData.feuxC0);else{const c=mt===FEUXL.hlM?D.blanc:D.rouge,k=mt===FEUXL.hlM?D.kB:D.kR;mt.color.setRGB(c[0]*k,c[1]*k,c[2]*k);}
      if(D&&D.carte)tris(m.geometry,new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld),mt===FEUXL.hlM?FV:RV,null);return;}
    if(!mt.vertexColors||!mt.userData.lp)return;
    const G=m.geometry,ca=G&&G.attributes.color,pa=G&&G.attributes.position;if(!ca||!pa)return;
    if(!G.userData.feuxC0){const a=new Float32Array(ca.count*3);for(let i=0;i<ca.count;i++){a[i*3]=ca.getX(i);a[i*3+1]=ca.getY(i);a[i*3+2]=ca.getZ(i);}G.userData.feuxC0=a;
      if(!(ca.array instanceof Float32Array))G.setAttribute('color',new THREE.BufferAttribute(a.slice(),3));}
    const C=G.attributes.color,O=G.userData.feuxC0;st.pieces++;
    M.multiplyMatrices(inv,m.matrixWorld);const KL=D&&D.carte?new Uint8Array(C.count):null; /* 1 : lampe blanche de l'avant · 2 : feu rouge de l'arrière */
    for(let i=0;i<C.count;i++){
      const r=O[i*3],g=O[i*3+1],b=O[i*3+2];C.setXYZ(i,r,g,b);if(!D)continue;
      p.set(pa.getX(i),pa.getY(i),pa.getZ(i)).applyMatrix4(M);if(Math.abs(p.z)<lim){st.hors++;continue;} /* seulement aux deux bouts */
      const mx=Math.max(r,g,b),mn=Math.min(r,g,b),sat=mx>0?(mx-mn)/mx:0;if(mx<.55)continue; /* les boîtiers sombres restent */
      let h=0;if(mx>mn){if(mx===r)h=((g-b)/(mx-mn))%6;else if(mx===g)h=(b-r)/(mx-mn)+2;else h=(r-g)/(mx-mn)+4;h*=60;if(h<0)h+=360;}
      let c=null,k=1;
      if(sat<.3&&mx>=.82){c=D.blanc;k=mx>=.93?D.kB:1;st.blanc++;if(KL&&p.z>0&&mx>=.93)KL[i]=1;}                        /* le blanc des phares : 6 500 / 7 500 K, et l'éclat */
      else if(sat>=.45&&(h<=14||h>=335)){c=D.rouge;k=mx>=.75?D.kR:1;st.rouge++;if(KL&&p.z<0&&mx>=.75)KL[i]=2;}         /* le rouge des feux : un rouge LED franc */
      else if(D.ambre&&sat>=.45&&h>14&&h<=62){c=D.ambre;k=D.kA;st.ambre++;}                       /* l'ambre : celui d'un vrai clignotant, pas un jaune */
      if(c)C.setXYZ(i,c[0]*mx*k,c[1]*mx*k,c[2]*mx*k);}
    if(KL){tris(G,M,FV,function(i){return KL[i]===1;});tris(G,M,RV,function(i){return KL[i]===2;});}
    C.needsUpdate=true;});
  if(CARPOOL.head)CARPOOL.head.material.color.setHex(D0?D0.nappe:FEUX_0.nappe);
  for(const s of HALO.h.concat(HALO.t)){if(s.userData.k0==null)s.userData.k0=s.userData.k;const k=s.userData.k0*(D0?D0.kH:1),k1=s.userData.k; /* ⚠ k1 vaut 0 après la 3 (pas de halo) : diviser donnait des NaN, et le bloom les étalait sur TOUT l'écran (image noire) */
    if(k1>1e-6)s.scale.multiplyScalar(k/k1);else s.scale.set(k,k,1);s.userData.k=k;}
  for(const f of FEUXL.fais){if(f.parent)f.parent.remove(f);f.geometry.dispose();}FEUXL.fais.length=0;
  if(D0&&D0.fais>0)for(const s of HALO.h){const f=new THREE.Mesh(FAIS_G.clone(),FAIS_M);f.onBeforeRender=function(){}; /* (une géométrie à elle : buildCar libère tout à la caisse suivante) */
    f.position.copy(s.position);f.position.z-=.1;f.rotation.x=.07; /* un peu vers la route */
    f.userData.noShadow=true;f.renderOrder=3;f.frustumCulled=false;carGroup.add(f);FEUXL.fais.push(f);}
  for(const c of FEUXL.cartes){if(c.parent)c.parent.remove(c);c.geometry.dispose();}FEUXL.cartes.length=0;
  if(D&&D.carte){if(!FEUXL.cM)FEUXL.cM=[0,1].map(function(){const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});m.userData.plq=1;return m;});
    FEUXL.cM[0].userData.c=D.blanc;FEUXL.cM[1].userData.c=D.rouge;
    feuxCartes(FV,1,FEUXL.cM[0]);feuxCartes(RV,-1,FEUXL.cM[1]);st.cartes=FEUXL.cartes.length;}
  FEUXL.stats=st;}
function feuxCartes(V,sens,mat){ /* (lecture 3) les triangles regroupés par lampe (casiers 3D de 8 cm) → trois coques de lueur par lampe */
  const nt=V.length/9;if(!nt)return;const C=.08,cas=new Map(),cle=function(x,y,z){return Math.floor(x/C)+'|'+Math.floor(y/C)+'|'+Math.floor(z/C);};
  for(let t=0;t<nt;t++){const o=t*9,k=cle((V[o]+V[o+3]+V[o+6])/3,(V[o+1]+V[o+4]+V[o+7])/3,(V[o+2]+V[o+5]+V[o+8])/3);let L=cas.get(k);if(!L)cas.set(k,L=[]);L.push(t);}
  const vu=new Set(),P=[],Cc=[],COU=[[1/3,.3],[2/3,.17],[1,.08]];
  for(const k0 of cas.keys()){if(vu.has(k0))continue;const pile=[k0],T=[];vu.add(k0);
    while(pile.length){const k=pile.pop();for(const t of cas.get(k))T.push(t);const a=k.split('|').map(Number);
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){const kk=(a[0]+dx)+'|'+(a[1]+dy)+'|'+(a[2]+dz);if(cas.has(kk)&&!vu.has(kk)){vu.add(kk);pile.push(kk);}}}
    let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;
    for(const t of T)for(let j=0;j<3;j++){const o=t*9+j*3;x0=Math.min(x0,V[o]);x1=Math.max(x1,V[o]);y0=Math.min(y0,V[o+1]);y1=Math.max(y1,V[o+1]);z0=Math.min(z0,V[o+2]);z1=Math.max(z1,V[o+2]);}
    const cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2,m=Math.min(.12,.04+.3*Math.min(x1-x0,y1-y0))*((z1-z0)>.12?.22:1) /* un feu BOMBÉ (épais en z : LA BÊTE, LA DOLCE VITA, LA GRANDE ANGLAISE…) : coques collées à sa forme, poussées de 12 cm elles faisaient une boule */,sg=function(d,e){return d>e?1:d<-e?-1:0;};
    for(const [f,v] of COU){const mm=m*f;
      for(const t of T)for(let j=0;j<3;j++){const o=t*9+j*3,x=V[o],y=V[o+1],z=V[o+2];
        P.push(x+sg(x-cx,.004)*mm,y+sg(y-cy,.004)*mm,z+sg(z-cz,.004)*mm*.5+sens*mm*.35);Cc.push(v,v,v);}}}
  if(!P.length)return;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
  const c=new THREE.Mesh(g,mat);c.userData.noShadow=true;c.renderOrder=4;c.onBeforeRender=function(){};carBody.add(c);FEUXL.cartes.push(c);}
function feuxLed(spec,hlM,tlM){FEUXL.hlM=hlM;FEUXL.tlM=tlM;FEUXL.spec=spec;FEUXL.fais.length=0;FEUXL.cartes.length=0;if(FEUXL.d)feuxCaisse();} /* fin de buildCar, après la soudure (l'ancienne caisse est partie avec ses lueurs) */
{const av9=scene.onBeforeRender; /* ⚠ chaîné, jamais réassigné (pisteLoin, conesVus, la ville l'utilisent) */
  scene.onBeforeRender=function(a,b,c,d,e,f){if(av9)av9.call(this,a,b,c,d,e,f);
    if(FEUXL.cartes.length&&FEUXL.cM&&FEUXL.d&&FEUXL.d.carte){const D=FEUXL.d,boom=mode==='boom',ph=(VIT9.ph==null?1:VIT9.ph)*(CAR_PHK==null?1:CAR_PHK),fr=VIT9.frein||0;
      const ka=boom?0:D.carte[0]*ph,kr=boom?0:D.carte[1]*(.75+.6*fr),ca=FEUXL.cM[0].userData.c,cr=FEUXL.cM[1].userData.c; /* devant : la nuit seulement (les phares s'éteignent au soleil) · derrière : toujours, et le frein l'embrase */
      FEUXL.cM[0].color.setRGB(ca[0]*ka,ca[1]*ka,ca[2]*ka);FEUXL.cM[1].color.setRGB(cr[0]*kr,cr[1]*kr,cr[2]*kr);}
    if(!FEUXL.fais.length)return;
    const bq=garageOn&&typeof GBQ!=='undefined'&&(GBQ.on||GBQ.veut);
    FAIS_M.uniforms.uK.value=(mode==='boom'||bq||!FEUXL.d)?0:FEUXL.d.fais*(VIT9.ph==null?1:VIT9.ph)*(CAR_PHK==null?1:CAR_PHK);
    FAIS_M.uniforms.uC.value.setHex(FEUXL.d?FEUXL.d.nappe:FEUX_0.nappe);};}
window.dbgFeuxLed=function(a,b){ /* (banc) dbgFeuxLed('mode',0|1|2|3) : change de lecture À CHAUD (même image, même instant) · ('fais',x) la force du faisceau dans l'air */
  if(a==='mode'){FEUXL.n=b|0;FEUXL.d=FEUX_DOSES[FEUXL.n]||null;feuxGlobal();feuxCaisse();}
  else if(a==='fais'&&FEUXL.d)FEUXL.d.fais=+b;
  return {lecture:FEUXL.n,stats:FEUXL.stats,cartes:FEUXL.cartes.length,ph:VIT9.ph==null?null:+VIT9.ph.toFixed(2),faisceaux:FEUXL.fais.length,uK:+FAIS_M.uniforms.uK.value.toFixed(2)};};
/* ---- LE MOTEUR QUI AVANCE + LE NITRO EN FEU DE PIXELS (2026-10-15, pôle TECHNIQUE — Léo : « le nitro et la flamme du moteur, c'est
   un peu fade : on n'arrive pas à distinguer le nitro du moteur » · « pas trop régulier, comme le moteur d'une voiture qui avance : qu'on
   ne voie pas une séquence qui se répète ; en réaction à comment la voiture bouge, inspiré de la physique » · « le nitro : un classique,
   en feu pixelisé, bien vénère, un mélange du burn-out et des flammes en cubes de la porte ; pas la forme de l'arc-en-ciel, sa grandeur,
   en moins gros »). MESURÉ avant : moteur et nitro étaient la MÊME plume (0,35 m → 3,15 m au nitro), battue par des sinus fixes.
   LE MOTEUR (`FLM`, `flmPas`) — la plume lisse des pots (JETS) suit un MOTEUR SIMULÉ, celui que l'oreille entend : la table `ENG_SND`
   du palier (ses rapports `gr`, sa cadence `fHz`, son irrégularité `fJit`, ses crépitements `crk`) et les seuils de la boîte du son.
   · la COMBUSTION : des bouffées à la cadence du moteur (qui monte avec le régime), chacune d'une force tirée au hasard (± fJit), un
     raté de temps en temps ; une HOULE lente (Ornstein-Uhlenbeck : jamais périodique) ; chaque pot a ses bouffées à lui ;
   · la CHARGE (lue dans l'accélération réelle, comme le son) : en reprise la flamme est longue et jaune, stabilisée elle est courte ;
   · la BOÎTE : au passage de rapport l'allumage est coupé ~0,12 s — la flamme s'étouffe — puis le carburant non brûlé SAUTE (un pop
     gras, plus fort aux derniers rapports) ;
   · le LÂCHER (le drift lève le pied du gaz auto) : la flamme tombe, l'échappement pétarade au hasard, de plus en plus espacé ;
   · EN VOL les roues tournent dans le vide : le moteur bat contre le RUPTEUR (~11 coupures/s, chaque demi-période tirée) + des pops ;
   · la POSE : un coup de feu ; la COULEUR suit la chaleur (rouge-orangé au repos, orange en charge, jaune-blanc dans un pop).
   LE NITRO (`NFEU`) — un FEU DE PIXELS qui sort des pots : des cubes (la matière des flammes de la porte et de l'arc-en-ciel : zéro
   programme de plus), nés blancs dans la bouche du pot, qui jaillissent, s'ouvrent, montent, et vieillissent blanc → jaune → orange →
   vermillon → rouge → braise → SUIE (des cubes sombres au bout : le pixel art du feu) ; ils sautent de case en case dans le repère de
   la flamme ; des LANGUES tournent autour de l'axe (celles de la porte), des COUPS de feu tombent au hasard, des étincelles giclent dans
   le monde. ~3,5 à 5 m derrière la caisse, ~1,3 m de large au bout. La plume lisse devient la TORCHE blanche dans la bouche du pot.
   Réserve bleue = feu bleu, nitro infinie = feu violet (des SIGNAUX de jeu). `?flamme=ancien` = la plume d'avant ; `dbgFlamme()`. */
const FLM_ON=!/[?&]flamme=ancien\b/.test(location.search);
function flmGauss(){return (Math.random()+Math.random()+Math.random()-1.5)*1.41;} // une gaussienne réduite (à peu près), sans Math.log
const FLM={tier:-1,g:1,shT:0,shift:0,rpm:0,sN0:-1,ch:.3,ov:0,thr0:0,limOn:true,limT:0,limA:1,surge:0,heat:.4,pop:0,glow:1,mode0:'drive',
  P:[0,1,2,3].map(function(){return {ph:Math.random(),iv:1,env:1,tr:0,pop:0,popQ:0,popT:0};}),L:new Float32Array(4).fill(1),R:new Float32Array(4).fill(1),
  cF:new THREE.Color(0xd8461a),cB:new THREE.Color(0xff8c30),cC:new THREE.Color(0xffcf6a),kF:new THREE.Color(0xffd29a),kC:new THREE.Color(0xffffff)};
function flmPop(i,q){const p=FLM.P[i&3];if(q>p.pop)p.pop=q;} // un pop sur ce pot
function flmPops(q,suite){for(let i=0;i<4;i++){const p=FLM.P[i];flmPop(i,q*(.75+.5*Math.random()));if(suite){p.popQ+=suite;p.popT=.04+.1*Math.random();}}} // tous les pots, et des pops qui suivent
function flmPas(dt,speedKmh){ // speedKmh : celle de la boucle (le compteur)
  const F=FLM,eng=ENG_SND[Math.max(0,Math.min(ENG_SND.length-1,engTier|0))]||ENG_SND[0];
  const hz0=eng.fHz||40,ji=eng.fJit==null?.3:eng.fJit,crk=eng.crk||0;
  const spd=Math.abs(speedKmh),sN=Math.min(1.06,spd/Math.max(1,vCroisiere())),sol=mode==='drive',vol=mode==='fall';
  const thr=sol&&gasOn&&!(AUTO_GAS&&(keys.KeyS||keys.ArrowDown||driftEnCours))?1:0; // la recette du son : le drift lève le pied du gaz auto
  // LA BOÎTE (les seuils du son) ; un palier neuf reprend le rapport de la vitesse, sans cérémonie
  if(F.tier!==engTier){F.tier=engTier;F.g=1;if(eng.gr>1)for(;F.g<eng.gr;F.g++){const l9=Math.pow((F.g-1)/eng.gr,1.3),h9=Math.pow(F.g/eng.gr,1.3)*1.05;if((sN-l9)/Math.max(.01,h9-l9)<=.99)break;}}
  let tgt=sN;
  if(eng.gr>1&&sol){const gn=eng.gr,lo=Math.pow((F.g-1)/gn,1.3),hi=Math.pow(F.g/gn,1.3)*1.05,pos=Math.min(1.05,Math.max(0,(sN-lo)/Math.max(.01,hi-lo)));
    if(pos>.99&&F.g<gn&&thr&&F.shT<=0){F.g++;F.shT=.12;F.shift=.35+.65*F.g/gn;}
    else if(F.g>1&&sN<lo*.95)F.g--;
    tgt=Math.pow(Math.min(1,pos),.9);if(spd<8)tgt=thr*.72;}
  if(F.shT>0){F.shT-=dt;tgt*=.66;if(F.shT<=0&&F.shift>0){flmPops(.5+.7*F.shift,F.shift>.8&&Math.random()<.6?1:0);F.shift=0;}} // la coupure finie : le carburant non brûlé SAUTE
  if(vol)tgt=.86+.12*Math.random();
  F.rpm+=(tgt-F.rpm)*Math.min(1,dt*(tgt>F.rpm?8:5.5));
  // LA CHARGE et LE LÂCHER (la charge se lit dans l'accélération réelle, comme le son)
  const dv=F.sN0<0?0:(sN-F.sN0)/Math.max(.001,dt);F.sN0=sN;
  const cC=thr?Math.max(0,Math.min(1,.26+dv*2.6)):0,oC=(!thr&&sol&&F.rpm>.2)?Math.min(1,(F.rpm-.2)*2.4):0;
  F.ch+=(cC-F.ch)*Math.min(1,dt*(cC>F.ch?9:3.4));F.ov+=(oC-F.ov)*Math.min(1,dt*(oC>F.ov?10:4.5));
  if(sol&&F.thr0&&!thr&&F.rpm>.42&&crk>0)flmPops(.75,1+((Math.random()*3*crk)|0)); // le pied se lève : POP, pop-pop
  else if(F.ov>.25&&crk>0&&Math.random()<dt*7*crk*F.ov*F.ov)flmPop((Math.random()*4)|0,.5+.5*Math.random()); // la traîne, au hasard
  F.thr0=thr;
  if(sol&&F.mode0==='fall')flmPops(.95,1);F.mode0=mode; // la POSE : le carburant secoué
  F.surge+=-F.surge*dt/.35+.55*Math.sqrt(dt)*flmGauss(); // la HOULE (τ ,35 s)
  for(let i=0;i<4;i++){const p=F.P[i];p.tr+=-p.tr*dt/.07+.6*Math.sqrt(dt)*flmGauss();} // le TREMBLÉ de chaque pot (τ 70 ms) : il casse le battement image sur deux
  let limK=1;
  if(vol&&!nitroOn){F.limT-=dt;if(F.limT<=0){F.limOn=!F.limOn;F.limT=(F.limOn?.05:.034)*(.45+1.1*Math.random())*(Math.random()<.15?2.2:1); // le RUPTEUR : chaque demi-période tirée, parfois un coup qui traîne
      if(F.limOn)F.limA=.55+.65*Math.random();else if(Math.random()<.12+.4*crk)flmPop((Math.random()*4)|0,.55+.45*Math.random());}
    limK=F.limOn?(F.limA||1):.16;}
  // LA COMBUSTION, pot par pot
  const hz=hz0*(.5+.7*F.rpm),dec=Math.exp(-dt*hz*.8),ld=sol?.62+.55*F.ch-.45*F.ov:vol?.85:.5; /* MESURÉ au banc : à ~37 bouffées/s vues à 60 images/s,
     une extinction rapide faisait battre la flamme une image sur deux (un motif) — elle s'éteint donc plus lentement, et l'INTERVALLE entre deux
     bouffées est tiré à chaque fois (± 40 %) : plus de battement régulier */
  let hot=0;
  for(let i=0;i<4;i++){const p=F.P[i];
    p.ph+=dt*hz/p.iv;p.env*=dec;
    while(p.ph>=1){p.ph-=1;p.iv=.6+.8*Math.random();let a=1+ji*.55*flmGauss();if(Math.random()<ji*.05)a=.12;else if(Math.random()<.05)a+=.45;p.env=Math.max(.1,a);p.pz=Math.min(4,(p.pz|0)+1);p.pa=a;} // pz/pa : les bouffées de l'image (le feu du moteur crépite dessus) // une bouffée : son intervalle et sa force tirés (± fJit) ; un raté, ou une grosse, de temps en temps
    if(p.popQ>0){p.popT-=dt;if(p.popT<=0){p.popQ--;p.popT=.05+.12*Math.random();flmPop(i,.45+.55*Math.random());}} // les pops qui suivent, égrenés
    p.pop*=Math.exp(-dt*13); // un pop vit ~70 ms
    F.L[i]=Math.max(.05,ld*(.8+.2*p.env)*(1+.3*F.surge+.55*p.tr)*limK*(F.shT>0?.3:1)+.6*p.pop);
    F.R[i]=1+.9*p.pop+.12*(p.env-1);
    if(p.pop>hot)hot=p.pop;}
  F.heat+=((Math.min(1,.25+.55*F.ch+.25*F.rpm)*(1-.6*F.ov))-F.heat)*Math.min(1,dt*6);
  F.pop=Math.min(1,hot);F.glow=(.7+.3*Math.min(1.4,F.L[0]))*(1+.9*F.pop);
  return F;}
const MOTEUR_MINI=FLM_ON&&!/[?&]moteur=goutte\b/.test(location.search); // (2026-10-15) la flamme du MOTEUR = ce feu-ci, en MINUSCULE (voir NFEU_MINI) ; ?moteur=goutte : la goutte lisse
const NFEU_MINI={t:.42,va:2.6,r:2.1,vie:.85,taux:260,pas:.4,et:0,bleu:.05,crq:.07}; /* (15/10 soir, Léo : « reste sur les petits crépitements, mais que ça aille plus DANS TOUS LES SENS, un peu comme les cristaux de flammes d'avant, mais avec les petits cubes ») va : la poussée dans l'axe, plus faible · r : la GERBE — chaque cube part dans une direction tirée tout autour de l'axe, à 0,7-2,6 m/s (×1,7 aux bouffées qui claquent), comme les éclats · et 0 : des cubes, pas des traits */ // (crépitant) taille, VITESSE PROPRE (m/s : le moteur ne suit pas le jet du nitro, 13-26 m/s, sinon des aiguilles), écart, vie, débit (cubes/s/pot, × la bouffée du moteur), grille, étirement, pied bleu, CRÉPITEMENT (part des bouffées qui claquent) — en part du nitro
const NFEU_N=1600,NFEU_PAS=.06,NFEU_SEUIL=[.08,.24,.46,.66,.8,.9],NFEU_TAILLE=[.9,.98,1,1,.9,.74,.6];
/* la palette est pensée APRÈS la courbe ACES de la passe finale : elle écrase le rouge plus que le vert au-delà de 1 — l'orange de la porte
   (1,75 · ,78 · ,14) y sortait JAUNE (mesuré sur la capture). Ici le vert est tenu bas : l'orange reste orange, le rouge rouge. */
/* (2026-10-15, pôle TECHNIQUE — Léo : « le nitro pas mal, essaie d'affiner : pixels plus fins, plus de nuances » · le feu du moteur « très bien,
   approfondis le tout : fluide, accordé au vent, au mouvement ») LE FEU AFFINÉ :
   · 10 NUANCES au lieu de 7 (`NFEU_P10`, seuils `NFEU_B10`, tailles `NFEU_T10`) : blanc chaud → jaune pâle → jaune d'or → or orangé → orange →
     orange profond → vermillon → rouge → braise → fumée ; chaque cube a son éclat (± 8 %, tiré de sa graine) ;
   · des PIXELS PLUS FINS (`NFEU_FIN`) : des cubes ×0,73, 1,7 fois plus nombreux, sur une grille ×0,6 — le feu GLISSE au lieu de sauter ;
   · FLUIDE AU SOL AUSSI (`NFEU_SOL`) : chaque cube garde une part de l'assiette de sa naissance (jusqu'à 85 %, qui monte avec son âge) — dans un
     virage la flamme TRAÎNE et s'incurve au lieu de pivoter d'un bloc avec la caisse — et en fin de vie il se couche dans le VENT de la
     trajectoire (une glisse, un drift : le feu part du côté où l'air le pousse). En vol, le feu détaché de Sacha (genre 3) garde sa règle.
   Le DRAGON garde NFEU_PAL / NFEU_SEUIL / NFEU_TAILLE (7 nuances). `?nfeu=colle` coupe aussi la part fluide au sol. */
const NFEU_B10=[.06,.14,.24,.35,.47,.59,.71,.82,.9],NFEU_T10=[.88,.96,1,1,1,.96,.9,.82,.72,.6];
/* (2026-10-15, Sacha : « le feu du nitro est trop rouge ou trop bleu par rapport aux couleurs de la barre de nitro ») LES TEINTES DE LA BARRE,
   sur les 10 nuances du feu affiné (nombre de nuances, seuils, tailles, jet, feu du MOTEUR `m` : rien ne bouge). La passe finale des courses
   (ACES qui garde la chroma — vivid 1 —, saturation 1,3 à 1,6, contraste 1,2 à 1,4) pousse à fond tout canal déjà dominant : MESURÉ sur les
   pixels pleins du feu, l'ancienne palette sortait ROUGE (#f15309 → #ec1c18 → #e8171b), BLEU-INDIGO (#1131f4 → #2317f4 → #331aef) et MAGENTA
   (#ac12f2). Chaque nuance est ici MESURÉE À L'ENVERS DANS LE JEU (banc « teinte », 2026-10-16) : course figée, tout le feu peint d'une seule
   valeur, couleur moyenne de ses pixels PLEINS relue après la passe finale (pas ceux que le flou de vitesse mêle au bitume : leur bleu-gris
   faisait jaunir les cœurs), puis une descente (Newton amorti, en Lab) — UNE valeur pour QUATRE ambiances à la fois (nuages midi et nuit,
   ville au soir, glacier midi), plafonnée à 3, vérifiée sur une autre image. Écart Lab moyen, avant → après : feu 21-34 → 3-11, réserve 30-69 →
   4-13, infinie 19-57 → 3-13. Couleurs visées, rapportées au blanc du bas d'écran (~,88) — feu : #fff0d0 → --nL #ffd58f → #ffc070 → #ffa449 →
   --nP #ff8d2e → #ff8020 → --nS #ff7415 → #d85a0c → --nO #ad4200 ; réserve : #eef2ff → --bL #b5c4ff → #93a8fc → #7088fa → --bP #4a68f0 → #3a56dc
   → --bS #2a44c8 → #1f3398 → --bO #16247a ; infinie : #fbf3ff → --vL #f1dcff → #d6a6ff → #c38aff → --vP #b06bff → #9d54ff → --vS #8a3dff →
   #6526c6 → --vO #3e1287. La fumée (10e nuance) reste celle de Léo. */
const NFEU_P10={f:[[2.95,2.87,2.58],[2.3,2.03,1.51],[1.91,1.53,.99],[1.82,1.25,.68],[1.55,.88,.49],[1.99,1.06,.52],[1.7,.78,.4],[.43,.27,.14],[.32,.2,.12],[.2,.17,.17]],
  b:[[2.63,2.67,2.67],[1.89,2.02,2.37],[.67,.74,1],[.48,.54,.8],[.35,.4,.66],[.28,.32,.51],[.22,.23,.38],[.16,.15,.22],[.12,.11,.15],[.17,.17,.22]],
  v:[[2.9,2.5,2.45],[2.8,1.5,1.4],[2.4,.62,.5],[2.1,.3,.22],[1.8,.16,.1],[1.9,.2,.12],[1.5,.12,.08],[.5,.08,.06],[.2,.05,.04],[.2,.16,.16]],
  m:[[1.5,1.75,2.5],[2.2,1.95,1.5],[2.3,1.55,.6],[2.15,1.05,.22],[1.95,.78,.12],[1.85,.6,.08],[1.62,.42,.06],[1.3,.24,.04],[.7,.1,.03],[.2,.17,.17]]}; // m : le feu du MOTEUR — un pied BLEUTÉ, comme un vrai échappement, puis l'orange (qui tient : un retour de flamme est orange, pas rouge)
const NFEU_FIN={taille:.73,taux:1.7,pas:0},NFEU_SOL={det:.45,vent:.9};
/* (2026-10-15 soir, Sacha : « retravaille toutes les traînées, il faut qu'elles soient toutes désirables ») LE FEU À LA COULEUR DE LA TRAÎNÉE — VU au
   banc : derrière la caisse, le plus gros, c'est le FEU DE PIXELS du nitro, et il restait orange (bleu en réserve, violet en infini) quelle que soit la
   traînée achetée : MENTHE, ROSE, POUDRE D'OR… ne se voyaient qu'en un filet. Avec une traînée de la boutique, le feu prend SA couleur : dix nuances
   tirées d'elle, comme celles du feu orange (le cœur chauffé à blanc, la couleur pleine, la braise, la fumée). La réserve et l'infini restent lisibles :
   le feu y tire vers le bleu / le violet (le cœur 8 %, la braise et la fumée 30 %). `?trainee=signal` = le feu d'avant. */
const NFEU_TR={cle:'',pal:null,b:null,v:null};
function nfeuPalTrainee(){if(TRAINEE_SIGNAL||typeof FX_EFF==='undefined'||!FX_EFF||!FX_EFF.teinte)return null;const c=FX_EFF.teinte,cle=c.join(',');if(NFEU_TR.cle===cle)return NFEU_TR;
  const m=Math.max(c[0],c[1],c[2],.05),n=[c[0]/m,c[1]/m,c[2]/m],LV=[2.4,2.3,2.2,2.05,1.85,1.62,1.38,1.08,.6],W=[.3,.55,.78,.92,1,1,1,1,1],P=[];
  for(let i=0;i<9;i++){const l=LV[i],w=W[i];P.push([l*(1-w+w*n[0]),l*(1-w+w*n[1]),l*(1-w+w*n[2])]);}P.push([.2,.17,.17]);
  const mix=(A,B,k)=>A.map(function(a,i){return [a[0]+(B[i][0]-a[0])*k,a[1]+(B[i][1]-a[1])*k,a[2]+(B[i][2]-a[2])*k];});
  NFEU_TR.cle=cle;NFEU_TR.pal=P;NFEU_TR.b=mix(P,NFEU_P10.b,.3);NFEU_TR.v=mix(P,NFEU_P10.v,.3);for(let i=0;i<3;i++){NFEU_TR.b[i]=mix([P[i]],[NFEU_P10.b[i]],.08)[0];NFEU_TR.v[i]=mix([P[i]],[NFEU_P10.v[i]],.08)[0];}return NFEU_TR;} /* le CŒUR garde la couleur achetée (8 %), la braise et la fumée disent la réserve (30 %) */
/* (2026-10-15, Léo : « ce qui manque, c'est la physique de la vitesse : là on dirait du slime ; ça devrait avoir l'air PROPULSÉ, plus dynamique, mais
   smooth le mouvement ») LE JET PROPULSÉ (`NFEU_JET`) : le feu SORT du pot à 13-26 m/s (×3-4), freine fort (le gaz s'étale dans l'air), vit moins
   longtemps ; serré à la sortie, il ne s'ouvre et ne tourbillonne qu'en vieillissant ; chaque cube s'ÉTIRE le long du jet tant qu'il file (une
   traînée de vitesse qui redevient un pixel en ralentissant) ; plus de grille (le mouvement est lisse) ; au sol, il traîne moins (det ,45) et le
   vent de la trajectoire le couche plus franchement (vent ,9). */
const NFEU_JET={v0:13,vK:.025,vMax:26,frein:3.2,vie:.72,serre:.7,etire:.075,etMax:2.2,chaud:.06}; // chaud : le cœur blanc-jaune tient plus loin de la tuyère
const NFEU=(function(){
  const bx=new THREE.BoxGeometry(1,1,1),ps=bx.attributes.position,nm=bx.attributes.normal,cl=new Float32Array(ps.count*3);
  for(let i=0;i<ps.count;i++){const ny=nm.getY(i),nz=nm.getZ(i),v=ny>.5?1:ny<-.5?.42:nz<-.5?.6:nz>.5?.5:.78;cl[i*3]=cl[i*3+1]=cl[i*3+2]=v;} // l'ombrage de la porte, face par face
  bx.setAttribute('color',new THREE.BufferAttribute(cl,3));
  const A=new THREE.InstancedMesh(bx,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false}),NFEU_N); // ⚠ les réglages EXACTS des cubes de l'arc-en-ciel : même programme
  const B=new THREE.InstancedMesh(new THREE.BoxGeometry(1.5,1.5,1.5),new THREE.MeshBasicMaterial({fog:false,toneMapped:false,transparent:true,opacity:.06,
    blending:THREE.AdditiveBlending,depthWrite:false}),NFEU_N); // le HALO : là où les cubes s'entassent, la lumière s'accumule
  A.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(NFEU_N*3),3);
  A.instanceMatrix.setUsage(THREE.DynamicDrawUsage);A.instanceColor.setUsage(THREE.DynamicDrawUsage);
  B.instanceMatrix=A.instanceMatrix;B.instanceColor=A.instanceColor;
  A.count=B.count=0;A.frustumCulled=B.frustumCulled=false;A.visible=B.visible=false;B.renderOrder=2;scene.add(A);scene.add(B);
  const V=function(){return [0,1,2,3].map(function(){return new THREE.Vector3();});};
  return {m:A,h:B,P:new Float32Array(NFEU_N*12),n:0,k:0,vs:9,T:0,acc:new Float32Array(4),ou:new Float32Array(4),tg:new Float32Array([0,2.1,4.2,1]),cp:new Float32Array(4),
    pw:V(),D:V(),R:V(),U:V(),dp:4,kd:1,lp:new Float32Array(4),am:new Float32Array(4),up:new THREE.Vector3(),M:new THREE.Matrix4(),pp:new THREE.Vector3(),pOk:false,v:new THREE.Vector3(),pal:null,ms:0,on:FLM_ON,
    Q:new Float32Array(NFEU_N*4),vh:new THREE.Vector3(),r9:new THREE.Vector3(),d9:new THREE.Vector3(),libre:!/[?&]nfeu=colle\b/.test(location.search)}; // Q, libre : LE FEU QUI SE DÉTACHE en vol (voir nfeuPas)
})();
/* (2026-10-15, Sacha : « quand on fait des figures, il faut que les gerbes pixel du nitro soient bien gérées ») LE FEU SE DÉTACHE EN VOL.
   Chaque cube était recalculé à CHAQUE image dans le repère de la caisse d'ALORS : pendant un salto, une toupie ou un tonneau, tout le
   panache (4 à 10 m en vol, la caméra recule) et les boules de feu des appuis NITRO tournaient d'un bloc avec elle — une hélice de cubes
   vissée au pare-chocs, qui balayait l'écran. Désormais, en vol, un cube garde l'ASSIETTE de la caisse à l'instant où il est sorti du pot
   (genre 3, son quaternion dans `Q`) : il suit la caisse en translation, mais sa direction est celle du pot quand il en est sorti. La
   figure dessine une SPIRALE de feu, la gerbe de l'allumage reste là où elle a éclaté, et les cubes en fin de vie se couchent dans le
   vent relatif (l'arrière de la trajectoire, `vh`). Chaque cube garde aussi son orientation de naissance (ils ne pivotent plus tous
   ensemble). Au sol rien ne change : le feu reste collé au repère de la caisse, au pixel près (le réglage mesuré du 15/10).
   `?nfeu=colle` = l'ancien comportement ; `dbgFlamme('libre',0|1)`. */
function nfeuRot(qx,qy,qz,qw,vx,vy,vz,o){const tx=2*(qy*vz-qz*vy),ty=2*(qz*vx-qx*vz),tz=2*(qx*vy-qy*vx); // v tourné par le quaternion q (sans allocation)
  o.x=vx+qw*tx+qy*tz-qz*ty;o.y=vy+qw*ty+qz*tx-qx*tz;o.z=vz+qw*tz+qx*ty-qy*tx;return o;}
function nfeuNp(){return Math.min(4,CAR_POTS.length,JETS.shells.length);}
function nfeuNait(i,b,gros,suie,mi){ // une flamme-cube dans la bouche du pot i ; layout : s u v · vs vu vv · âge vie taille graine pot genre (0 nitro · 2 étincelle · 3 MOTEUR, en minuscule)
  const N=NFEU;if(N.n>=NFEU_N)return;const o=N.n*12,P=N.P,M9=NFEU_MINI;N.n++;
  const a=!mi&&Math.random()<.62?N.tg[i]+flmGauss()*.75:Math.random()*6.2832,r0=(.05+.07*Math.random())*(mi?.5:1),vr=mi?M9.r*(.35+.9*Math.random())*(gros?1.7:1)*(1+.5*(N.kd-1)):(.6+.8*Math.random())*(1+.45*b)*(gros?2.4:1)*(1+.5*(N.kd-1))*(gros?1:NFEU_JET.serre),ca=Math.cos(a),sa=Math.sin(a); // mi : la GERBE du moteur (dans tous les sens)
  const pt=CAR_POTS[i],sd9=!pt?0:pt.x>.06?1:pt.x<-.06?-1:(Math.random()<.5?-1:1); // le pot de droite crache à droite, celui de gauche à gauche (un pot central : des deux côtés)
  P[o]=Math.random()*.12;P[o+1]=ca*r0;P[o+2]=sa*r0;
  P[o+3]=(mi?M9.va*(1+.45*(N.kd-1)):N.vs)*(.75+.5*Math.random())*(gros?1.1:suie?.6:1);P[o+4]=ca*vr+(mi?0:sd9*(.3+.7*Math.random()));P[o+5]=sa*vr+(mi?.15*Math.random():gros?0:.2+.5*Math.random()); // un peu vers l'extérieur, à peine vers le haut (voir N.vs)
  P[o+6]=0;P[o+7]=(.22+.2*Math.random()+.07*b)*(gros?1.35:1)*(mi?M9.vie:1)*NFEU_JET.vie;P[o+8]=(.13+.07*Math.random())*(1+.25*b)*(gros?1.3:1)*N.kd*(mi?M9.t:1)*NFEU_FIN.taille;
  P[o+9]=(suie?Math.random()*.4:Math.random())+(mi?2:0);P[o+10]=i;P[o+11]=0; // mi : la GRAINE +2 marque le feu du MOTEUR (le genre 3 est le feu DÉTACHÉ en vol, celui de Sacha)
  {const q=carGroup.quaternion,q4=o/3;N.Q[q4]=q.x;N.Q[q4+1]=q.y;N.Q[q4+2]=q.z;N.Q[q4+3]=q.w;if(N.libre&&mode==='fall')P[o+11]=3;}} // l'assiette de sa NAISSANCE, toujours (le feu fluide au sol la lit aussi) ; né en vol : DÉTACHÉ
function nfeuEtincelle(i,k9){ // un petit cube qui gicle DANS LE MONDE (il garde l'élan de la caisse, retombe, refroidit) ; k9 : sa taille (le crépitement du moteur : ,4)
  k9=k9||1;const N=NFEU;if(N.n>=NFEU_N||!N.pOk)return;const o=N.n*12,P=N.P,w=N.pw[i],D=N.D[i],r=(6+6*Math.random())*(k9<1?.6:1);N.n++;
  P[o]=w.x;P[o+1]=w.y;P[o+2]=w.z;
  P[o+3]=N.v.x-D.x*r+(Math.random()-.5)*3.2;P[o+4]=N.v.y-D.y*r+1.5+2.5*Math.random();P[o+5]=N.v.z-D.z*r+(Math.random()-.5)*3.2;
  P[o+6]=0;P[o+7]=(.3+.25*Math.random())*(k9<1?.7:1);P[o+8]=(.06+.05*Math.random())*k9;P[o+9]=Math.random();P[o+10]=i;P[o+11]=2;}
function nfeuGicle(x,y,z,vx,vy,vz,s){ // (2026-10-15) un cube de feu craché par la TRAÎNÉE DE LUMIÈRE, n'importe où sur sa longueur
  const N=NFEU;if(!N.on||N.n>=NFEU_N-80)return false;const o=N.n*12,P=N.P;N.n++; // ⚠ on laisse 80 places : le feu des pots passe d'abord
  P[o]=x;P[o+1]=y;P[o+2]=z;P[o+3]=vx;P[o+4]=vy;P[o+5]=vz;P[o+6]=0;P[o+7]=.35+.35*Math.random();P[o+8]=s;P[o+9]=Math.random();P[o+10]=0;P[o+11]=2;return true;}
function nfeuCoup(k){ // L'ALLUMAGE : une boule de feu par pot + une gerbe d'étincelles (appelé par nitroAllume)
  if(!NFEU.on)return;const np=nfeuNp();
  for(let i=0;i<np;i++){for(let j=0,n=(30*k)|0;j<n;j++)nfeuNait(i,1.4,true,false);for(let j=0,n=(10*k)|0;j<n;j++)nfeuEtincelle(i);}}
function nfeuFin(){ // L'EXTINCTION : la dernière bouffée, lente et sale (appelé par nitroEteint)
  if(!NFEU.on)return;const np=nfeuNp();
  for(let i=0;i<np;i++)for(let j=0;j<16;j++)nfeuNait(i,.3,false,true);}
function nfeuCoupe(){const N=NFEU;N.n=0;N.k=0;N.pOk=false;N.m.count=N.h.count=0;N.m.visible=N.h.visible=false;} // replacement, explosion : rien ne reste figé
function nfeuPas(dt,on,bleu,inf,speedKmh,F,mot){ // F : le moteur simulé (FLM) · mot : la flamme du MOTEUR doit se voir (hors nitro)
  const N=NFEU;if(!N.on)return;
  const np=nfeuNp(),vise=on&&np>0&&mode!=='boom'?1:0;
  N.k+=(vise-N.k)*Math.min(1,dt*(vise>N.k?14:7));
  if(!N.n&&N.k<.01&&!mot){if(N.m.visible)N.m.visible=N.h.visible=false;N.pOk=false;return;}
  const t0=performance.now();dt=Math.min(dt,.05);N.T+=dt;
  const cp=carGroup.position;
  if(N.pOk&&dt>0)N.v.subVectors(cp,N.pp).multiplyScalar(1/dt);else N.v.set(0,0,0);N.pp.copy(cp);N.pOk=true;
  if(N.v.lengthSq()>4e4)N.v.set(0,0,0); // un replacement (téléport) n'est pas une vitesse
  N.up.set(0,1,0).applyQuaternion(carGroup.quaternion);
  for(let i=0;i<np;i++){potMonde(CAR_POTS[i],N.pw[i]);const D=N.D[i].copy(JET_DIR[i]).applyQuaternion(carGroup.quaternion).normalize();
    const R=N.R[i].crossVectors(D,N.up);if(R.lengthSq()<1e-4)R.set(1,0,0);R.normalize();N.U[i].crossVectors(R,D).normalize();}
  N.vs=Math.min(NFEU_JET.vMax,NFEU_JET.v0+Math.abs(speedKmh)*NFEU_JET.vK); /* (le JET PROPULSÉ) — avant : 3,2 à 7 m/s, la vitesse d'un slime */ /* plus la caisse file, plus le vent étire le feu (1,3 à 2 m). MESURÉ (dbgFlamme('proj')) : debout, la caméra de poursuite
     regarde la poupe presque d'AU-DESSUS (les pots à −0,6 de la hauteur d'écran, à 3,8 m) — un feu qui MONTE fonce dans l'objectif et fait un mur, un feu qui
     s'ÉLARGIT barre tout le bas de l'écran : il file donc à plat sur la route, pas plus large que la caisse, et c'est sa matière qui le rend vénère */
  {let T9=null;try{T9=nfeuPalTrainee();}catch(e9){}N.pal=T9?(bleu?T9.b:inf?T9.v:T9.pal):bleu?NFEU_P10.b:inf?NFEU_P10.v:NFEU_P10.f;} /* (2026-10-15 soir) le feu à la couleur de la traînée achetée */
  N.dp=np?camera.position.distanceTo(N.pw[0]):4;N.kd=Math.pow(Math.min(3.2,Math.max(1,N.dp/3.8)),.75); // la caméra RECULE (en vol : ~21 m) : le feu grossit, sinon il n'est plus que trois points
  N.vs*=1+.45*(N.kd-1);
  if(N.k>.02&&np){const q=(QUAL_LOW?.6:1)*(REDUCED_MOTION?.5:1);
    for(let i=0;i<np;i++){
      N.ou[i]+=-N.ou[i]*dt/.25+.7*Math.sqrt(dt)*flmGauss(); // le souffle de ce pot : jamais périodique
      if(N.cp[i]>0)N.cp[i]-=dt;else if(Math.random()<dt*.9)N.cp[i]=.1+.12*Math.random(); // un COUP de feu, au hasard (~1 par seconde)
      const b=Math.max(0,Math.min(1.6,.5+.7*N.ou[i]+(N.cp[i]>0?.9:0)));
      N.tg[i]+=dt*(2.2+2.5*N.ou[i]); // la LANGUE tourne autour de l'axe, jamais au même pas
      N.acc[i]+=dt*430*NFEU_FIN.taux*N.k*(.55+.75*b)*q/Math.sqrt(Math.max(1,np)/2);
      while(N.acc[i]>=1){N.acc[i]-=1;nfeuNait(i,b,false,false);}
      if(Math.random()<dt*22*N.k*q)nfeuEtincelle(i);}}
  /* (2026-10-15, Léo : « fais vraiment juste comme le NITRO, mais vraiment en minuscule ») LA FLAMME DU MOTEUR : le même feu de pixels, en
     minuscule (NFEU_MINI) — son débit suit les BOUFFÉES du moteur simulé (FLM : la cadence, la charge, la houle, le rupteur en vol, le pied
     levé qui l'éteint), et chaque POP (passage de rapport, pied levé, pose) lâche une petite boule de feu. */
  if(mot&&np&&F&&N.k<.5){const q=(QUAL_LOW?.6:1)*(REDUCED_MOTION?.5:1),vol9=mode==='fall',crk9=(ENG_SND[Math.max(0,Math.min(ENG_SND.length-1,engTier|0))]||ENG_SND[0]).crk||0; // crk9 : le crépitement du moteur (la table du SON, lue seulement)
    for(let i=0;i<np;i++){const p=F.P[i];
      N.ou[i]+=-N.ou[i]*dt/.25+.7*Math.sqrt(dt)*flmGauss();N.tg[i]+=dt*(2.2+2.5*N.ou[i]); // ses langues tournent comme celles du nitro
      if(p.pop>N.lp[i]+.25){const n9=Math.round((5+9*p.pop)*q);for(let k=0;k<n9;k++)nfeuNait(i,1.2,true,false,true);for(let k=0,ne=2+((Math.random()*4)|0);k<ne;k++)nfeuEtincelle(i,.42);} // un POP : une petite boule de feu, et ses étincelles qui CRÉPITENT
      N.lp[i]=p.pop;
      const ou9=(1-.85*F.ov)*(vol9&&!F.limOn?0:1);
      N.am[i]+=dt*NFEU_MINI.taux*.35*Math.min(1.6,F.L[i])*ou9*q; // un filet continu (le tiers)…
      while(N.am[i]>=1){N.am[i]-=1;nfeuNait(i,.25+.5*F.ch,false,false,true);}
      if(p.pz){const nb=p.pz;p.pz=0; /* …et LES BOUFFÉES : chacune crache sa petite rafale, au rythme tiré du moteur simulé — le feu CRÉPITE (une forte : une étincelle) */
        for(let k=0;k<nb;k++){const n9=Math.round((1+2.2*(p.pa||1))*(.55+.7*F.ch)*ou9*q*Math.random()*2);for(let j9=0;j9<n9;j9++)nfeuNait(i,.3+.4*F.ch,false,false,true);
          if((p.pa||1)>1.3&&Math.random()<.5*ou9)nfeuEtincelle(i,.4);
          if(Math.random()<NFEU_MINI.crq*(1+crk9)*(.4+.6*ou9)){const n8=Math.round((3+4*Math.random())*q);for(let j9=0;j9<n8;j9++)nfeuNait(i,.9,true,false,true);if(Math.random()<.6)nfeuEtincelle(i,.35);}}}}} // LE CRÉPITEMENT : une bouffée sur ~14 CLAQUE (une petite boule et son éclat) — plus souvent sur un moteur qui crépite (crk du son)
  const P=N.P,cam=camera.position,col=N.m.instanceColor.array,ar=N.m.instanceMatrix.array,pal=N.pal;
  const dp=N.dp,fA=dp*.6,fB=dp*.35; /* LE PIXEL GARDE SA TAILLE À L'ÉCRAN (la fumée du burn-out : des gros pixels « les MÊMES près ou loin ») :
     la caméra de poursuite est HAUTE et PROCHE (3,6-4 m des pots, mesuré) ; un cube qui file vers elle grossissait jusqu'à faire un mur au bas
     de l'écran. Sa taille suit donc sa distance à l'objectif, rapportée à celle des pots — et tout près, il s'efface */
  N.M.makeRotationFromQuaternion(carGroup.quaternion);const e=N.M.elements; // les cubes s'alignent sur la caisse
  const K=.92+.18*N.k;let n=0;
  const Q=N.Q,qc=carGroup.quaternion,C=carGroup.position,vol9=N.libre&&mode==='fall',ix=-qc.x,iy=-qc.y,iz=-qc.z,iw=qc.w,r9=N.r9,d9v=N.d9; // (le feu qui se détache) ix…iw : l'assiette d'à présent, inversée
  const vl9=N.v.length(),vh=N.vh;if(vl9>2)vh.copy(N.v).multiplyScalar(-1/vl9);else vh.set(0,0,0); // le VENT RELATIF : l'arrière de la trajectoire (rien si la caisse est arrêtée)
  const HB9=N.hist||(N.hist=new Float32Array(10));HB9.fill(0); // (2026-10-18, Sacha) LA PART DE CHAQUE NUANCE dans le feu de cette image (voir bmapTrainee : les bords de la route clignotent pareil)
  for(let j=0;j<N.n;j++){const o=j*12,q4=j*4;
    P[o+6]+=dt;const a=P[o+6]/P[o+7];if(a>=1)continue; // morte : pas recopiée
    let x,y,z,b,sz,e0=e[0],e1=e[1],e2=e[2],e4=e[4],e5=e[5],e6=e[6],e8=e[8],e9=e[9],e10=e[10];
    if(vol9&&P[o+11]===0)P[o+11]=3; // né au sol, encore vivant au décollage : il se détache à son tour (Q : l'assiette de sa naissance, posée par nfeuNait — le feu fluide du sol s'en servait déjà)
    if(P[o+11]===2){P[o+4]-=9*dt;P[o]+=P[o+3]*dt;P[o+1]+=P[o+4]*dt;P[o+2]+=P[o+5]*dt;x=P[o];y=P[o+1];z=P[o+2];b=a<.3?1:a<.65?3:5;sz=P[o+8]*(1-.5*a);} /* les étincelles : jaune d'or → orange → orange profond (les 10 nuances) */
    else{const i=P[o+10]|0,s=P[o],mi9=P[o+9]>=2,sd=mi9?P[o+9]-2:P[o+9],dr=Math.exp(-1.1*dt); // mi9 : le feu du MOTEUR (graine +2)
      const a9=a+.18*Math.min(1,Math.sqrt(P[o+1]*P[o+1]+P[o+2]*P[o+2])/.55)+(sd-.5)*.14-(mi9?NFEU_MINI.bleu:NFEU_JET.chaud); /* le feu du MOTEUR : un pied bleu très court à la bouche, puis le jaune et l'orange ; le NITRO garde plus longtemps son cœur blanc-jaune (la postcombustion) */ // le CŒUR du jet reste chaud, ses bords refroidissent plus tôt ; un peu de hasard par cube (le bord dentelé)
      b=0;while(b<9&&a9>=NFEU_B10[b])b++; // les 10 NUANCES
      if((b===8&&sd>.55)||(b===9&&sd>.3))continue;
      if(sd<.13&&b>0&&b<8)b-=b>3?2:1; // des POCHES CHAUDES : un cube sur huit brûle plus jaune que ses voisins (le feu classique scintille) // la plupart s'éteignent avant : quelques braises sombres, et moins encore de cubes de FUMÉE finissent le feu
      P[o+3]*=Math.exp(-NFEU_JET.frein*dt);P[o+4]*=dr;P[o+5]*=dr;const tb9=4*Math.min(1,a*2.2); // (le JET) serré à la sortie, il ne tourbillonne qu'en vieillissant
      P[o+4]+=Math.sin(s*2.7+sd*6.3+N.T*9.1)*tb9*dt;P[o+5]+=(Math.cos(s*2.3+sd*5.1-N.T*7.7)*tb9+2)*dt; // le tourbillon, et le feu monte un peu
      P[o]+=P[o+3]*dt;P[o+1]+=P[o+4]*dt;P[o+2]+=P[o+5]*dt;
      const pa9=(mi9?NFEU_PAS*NFEU_MINI.pas:NFEU_PAS)*NFEU_FIN.pas,qs=pa9?Math.round(P[o]/pa9)*pa9:P[o],qu=pa9?Math.round(P[o+1]/pa9)*pa9:P[o+1],qv=pa9?Math.round(P[o+2]/pa9)*pa9:P[o+2]; // (pas 0 : plus de grille, le mouvement est lisse) // de case en case (le feu du moteur : une grille plus fine)
      const w=N.pw[i],D=N.D[i],R=N.R[i],U=N.U[i];
      x=w.x+D.x*qs+R.x*qu+U.x*qv;y=w.y+D.y*qs+R.y*qu+U.y*qv;z=w.z+D.z*qs+R.z*qu+U.z*qv;sz=P[o+8]*NFEU_T10[b];
      if(P[o+11]===0&&N.libre){ /* FLUIDE AU SOL : une PART de l'assiette de naissance (jusqu'à NFEU_SOL.det, qui monte avec l'âge) — le feu traîne dans les virages —
           et en fin de vie le cube se couche dans le vent de la trajectoire (une glisse, un drift) */
        const bx=Q[q4],by=Q[q4+1],bz=Q[q4+2],bw=Q[q4+3];
        let dw=bw*iw-bx*ix-by*iy-bz*iz,dqx=bw*ix+bx*iw+by*iz-bz*iy,dqy=bw*iy-bx*iz+by*iw+bz*ix,dqz=bw*iz+bx*iy-by*ix+bz*iw;
        if(dw<0){dw=-dw;dqx=-dqx;dqy=-dqy;dqz=-dqz;}
        const wt=Math.min(1,a*1.6)*NFEU_SOL.det;dqx*=wt;dqy*=wt;dqz*=wt;dw=1-wt+dw*wt;const l9=Math.hypot(dqx,dqy,dqz,dw)||1;dqx/=l9;dqy/=l9;dqz/=l9;dw/=l9;
        nfeuRot(dqx,dqy,dqz,dw,x-C.x,y-C.y,z-C.z,r9);x=C.x+r9.x;y=C.y+r9.y;z=C.z+r9.z;
        if(vl9>2){const w9=NFEU_SOL.vent*a*a*qs;nfeuRot(dqx,dqy,dqz,dw,D.x,D.y,D.z,d9v);x+=w9*(vh.x-d9v.x);y+=w9*(vh.y-d9v.y);z+=w9*(vh.z-d9v.z);}}
      if(P[o+11]===3){ /* DÉTACHÉ : le point calculé dans le repère d'à présent est ramené dans celui de sa naissance, autour du centre de la caisse
           (Δ = q_naissance · q_présent⁻¹) — il suit la caisse en translation, pas en rotation */
        const bx=Q[q4],by=Q[q4+1],bz=Q[q4+2],bw=Q[q4+3];
        const dw=bw*iw-bx*ix-by*iy-bz*iz,dqx=bw*ix+bx*iw+by*iz-bz*iy,dqy=bw*iy-bx*iz+by*iw+bz*ix,dqz=bw*iz+bx*iy-by*ix+bz*iw;
        nfeuRot(dqx,dqy,dqz,dw,x-C.x,y-C.y,z-C.z,r9);x=C.x+r9.x;y=C.y+r9.y;z=C.z+r9.z;
        if(vl9>2){const w9=.75*a*a*qs;nfeuRot(dqx,dqy,dqz,dw,D.x,D.y,D.z,d9v); // en fin de vie, le cube se couche dans le vent : son élan quitte l'axe du pot pour l'arrière de la trajectoire
          x+=w9*(vh.x-d9v.x);y+=w9*(vh.y-d9v.y);z+=w9*(vh.z-d9v.z);}
        const x2=bx+bx,y2=by+by,z2=bz+bz,xx=bx*x2,xy=bx*y2,xz=bx*z2,yy=by*y2,yz=by*z2,zz=bz*z2,wx=bw*x2,wy=bw*y2,wz=bw*z2; // et le cube garde l'orientation de sa naissance
        e0=1-(yy+zz);e1=xy+wz;e2=xz-wy;e4=xy-wz;e5=1-(xx+zz);e6=yz+wx;e8=xz+wy;e9=yz-wx;e10=1-(xx+yy);}}
    const dx=x-cam.x,dy=y-cam.y,dz=z-cam.z,d9=Math.sqrt(dx*dx+dy*dy+dz*dz);sz*=Math.min(1.25,Math.max(.3,d9/dp));if(d9<fA)sz*=Math.max(0,(d9-fB)/(fA-fB));
    const g9=P[o+11]===2,mi8=!g9&&P[o+9]>=2,st9=g9?0:Math.min(NFEU_JET.etMax,P[o+3]*NFEU_JET.etire*(mi8?NFEU_MINI.et:1)); // (le JET) st9 : l'étirement le long du jet, tant que le cube file
    if(n!==j){P.copyWithin(n*12,o,o+12);Q.copyWithin(n*4,q4,q4+4);}
    if(st9>.02){const Dj=N.D[P[n*12+10]|0],dx9=Dj.x,dy9=Dj.y,dz9=Dj.z; // chaque colonne c de la matrice devient c + st9·D·(D·c) : le cube s'allonge sur l'axe du jet, pas sur celui de la caisse
      let t9=dx9*e0+dy9*e1+dz9*e2;e0+=st9*dx9*t9;e1+=st9*dy9*t9;e2+=st9*dz9*t9;t9=dx9*e4+dy9*e5+dz9*e6;e4+=st9*dx9*t9;e5+=st9*dy9*t9;e6+=st9*dz9*t9;
      t9=dx9*e8+dy9*e9+dz9*e10;e8+=st9*dx9*t9;e9+=st9*dy9*t9;e10+=st9*dz9*t9;}
    const m=n*16;ar[m]=e0*sz;ar[m+1]=e1*sz;ar[m+2]=e2*sz;ar[m+3]=0;ar[m+4]=e4*sz;ar[m+5]=e5*sz;ar[m+6]=e6*sz;ar[m+7]=0;
    ar[m+8]=e8*sz;ar[m+9]=e9*sz;ar[m+10]=e10*sz;ar[m+11]=0;ar[m+12]=x;ar[m+13]=y;ar[m+14]=z;ar[m+15]=1;
    const c=(mi8?NFEU_P10.m:pal)[b],kk=K*(.92+.16*((P[n!==j?n*12+9:o+9]*7.31)%1));col[n*3]=c[0]*kk;col[n*3+1]=c[1]*kk;col[n*3+2]=c[2]*kk;if(on&&!mi8)HB9[b]+=sz*sz;n++;} /* kk : chaque cube son éclat (± 8 %) — HB9 : sa nuance, au poids de sa surface, pendant le nitro (le feu et le crépitement du MOTEUR ne sont pas la traînée) */
  {let s9=0;for(let i=0;i<10;i++)s9+=HB9[i];const PT9=N.part||(N.part=Float32Array.from(BMAP_PART0));if(s9>0){const k9=Math.min(1,dt*8);for(let i=0;i<10;i++)PT9[i]+=(HB9[i]/s9-PT9[i])*k9;}} // lissée sur ~0,12 s ; sans feu, la dernière part reste
  N.n=n;N.m.count=N.h.count=n;N.m.visible=N.h.visible=n>0;if(n){N.m.instanceMatrix.needsUpdate=true;N.m.instanceColor.needsUpdate=true;}
  N.ms=N.ms*.95+(performance.now()-t0)*.05;}
window.dbgFlamme=function(o){ // (banc) l'état du moteur simulé et du feu ; dbgFlamme('nfeu',0|1) coupe / rend le feu de pixels
  if(o==='nfeu'){NFEU.on=!!arguments[1];if(!NFEU.on)nfeuCoupe();return NFEU.on;}
  if(o==='libre'){if(arguments.length>1)NFEU.libre=!!arguments[1];let c=0;for(let j=0;j<NFEU.n;j++)if(NFEU.P[j*12+11]===3)c++;return {libre:NFEU.libre,detaches:c,n:NFEU.n,mode:mode};} // (banc) le feu qui se détache en vol : 1 = détaché, 0 = collé à la caisse (l'ancien)
  if(o==='proj'){const ar=NFEU.m.instanceMatrix.array,v=new THREE.Vector3(),r=[];for(let j=0;j<NFEU.n;j++){const m=j*16;v.set(ar[m+12],ar[m+13],ar[m+14]);const d=v.distanceTo(camera.position),sz=Math.hypot(ar[m],ar[m+1],ar[m+2]);v.project(camera);r.push([+d.toFixed(2),+(v.y).toFixed(2),+sz.toFixed(2),NFEU.P[j*12+11]]);}
    const w=new THREE.Vector3();potMonde(CAR_POTS[0],w);const pw9=w.toArray().map(x=>+x.toFixed(2)),dpot=w.distanceTo(camera.position);w.project(camera);return {dir:JET_DIR.map(function(d){return d.toArray().map(x=>+x.toFixed(2));}),pots:CAR_POTS.map(function(d){return d.toArray().map(x=>+x.toFixed(2));}),parPot:[0,1,2,3].map(function(i){let c=0;for(let j=0;j<NFEU.n;j++)if((NFEU.P[j*12+10]|0)===i&&(NFEU.P[j*12+11]===0||NFEU.P[j*12+11]===3))c++;return c;}),pot:[+dpot.toFixed(2),+w.y.toFixed(2),+w.x.toFixed(3)],pw:pw9,cam:camera.position.toArray().map(x=>+x.toFixed(1)),car:carGroup.position.toArray().map(x=>+x.toFixed(1)),cubes:r};} // (banc) où tombent les cubes : distance, hauteur à l'écran (−1 bas, +1 haut), taille
  const F=FLM;return {on:FLM_ON,rpm:+F.rpm.toFixed(2),rapport:F.g,charge:+F.ch.toFixed(2),lacher:+F.ov.toFixed(2),chaleur:+F.heat.toFixed(2),pop:+F.pop.toFixed(2),
    L:Array.from(F.L).map(function(x){return +x.toFixed(2);}),mini:MOTEUR_MINI,feu:{n:NFEU.n,k:+NFEU.k.toFixed(2),ms:+NFEU.ms.toFixed(3),pots:nfeuNp(),cam:+camera.position.distanceTo(NFEU.pw[0]).toFixed(2)}};};
/* LES POTS DE LA CAISSE (2026-09-26, user : « pour chaque skin, les flammes des pots d'échappement et la traînée de nitro au bon
   endroit ») — MESURÉ : toutes les flammes, la traînée et la lueur sortaient d'une formule unique (±22 % de la largeur, 43 cm,
   au bout de la fiche), alors que 58 caisses sur 66 dessinent LEURS pots : d'un seul côté, au centre, par quatre, en turbine,
   en tuyères… La flamme sortait sous le pare-chocs ou dans le vide. Désormais `buildCar` relève les VRAIS pots (repère caisse,
   point de sortie) : `CAR_POTS` ; la traînée s'accroche à la moyenne des pots de chaque côté (`CAR_POT_L/R`), ou à un SEUL
   ruban si les pots sont d'un côté ou au centre (`CAR_POT_1`) ; `potMonde` les suit à travers le roulis de la carrosserie. */
const CAR_POTS=[],CAR_POT_L=new THREE.Vector3(),CAR_POT_R=new THREE.Vector3(),CAR_POT_C=new THREE.Vector3();
let CAR_POT_1=false,CAR_POT_SRC='canon';
/* LES FEUX ARRIÈRE (2026-10-15, Sacha : « les traînées doivent maintenant partir des feux arrière — ce sont des TRAÎNÉES DE LUMIÈRE ; adapte
   cette règle au feu arrière de toutes les voitures ») : `buildCar` relève les VRAIS feux rouges de la caisse (les pièces `l` rouges du kit,
   dans les 90 cm de la poupe), un point par côté (`CAR_FEUX`, repère caisse) ; sinon la place des feux du gabarit (`A.tl`). Les sillages
   (`SILS`) et les halos des feux (`HALO.t`) s'y accrochent ; `potMonde` les suit à travers le roulis. */
const CAR_FEUX=[];let CAR_FEUX_SRC='gabarit';
window.dbgFeux=function(){const d9=new THREE.Vector3();carGroup.getWorldDirection(d9);return {cap:+Math.atan2(d9.x,d9.z).toFixed(3),src:CAR_FEUX_SRC,feux:CAR_FEUX.map(function(v){return v.toArray().map(function(x){return +x.toFixed(2);});}),pots:CAR_POTS.length,sils:SILS.map(function(t){return {n:t.n,lg:+t.lg.toFixed(1),hk:+t.hk.toFixed(2),vis:t.m.visible};})};}; // (banc) où naissent les traînées de lumière
function potMonde(v,out){ // un point du repère caisse → monde, À TRAVERS la carrosserie qui penche (carBody) : le pot bouge avec elle
  return out.copy(v).applyEuler(carBody.rotation).add(carBody.position).multiply(carGroup.scale).applyQuaternion(carGroup.quaternion).add(carGroup.position);}
function potAuHasard(out){return potMonde(CAR_POTS.length?CAR_POTS[(Math.random()*CAR_POTS.length)|0]:CAR_POT_C,out);}
const CARPOOL={head:null,tail:null,jet:null}; // FLAQUES DE LUMIÈRE AU SOL (phares AV / feux AR / halo nitro) — rempli par buildCar, le halo nitro est piloté par JETS.k
let carWingL=null,carWingR=null,wingT=0;
let carProps=[],propSpin=0; // LES PALES (gabarit `requin`) : recensées ici, tournées par la boucle
// LES AILERONS QUI SORTENT EN VOL : chacun est un PIVOT posé à sa base, dont la boucle étire le Y
// avec `wingT`. ⚠ le pivot est indispensable : `finShape` centre sa géométrie, donc un scale.y
// appliqué au mesh ferait pousser l'aileron des DEUX côtés — moitié dans la carrosserie.
let carFins=[];
// ---- MATIÈRES GÉNÉRATIVES DES CAISSES (`MATV`) — jumelles de `MAT9` côté moteurs -------------
// Trois peaux peintes PAR LE CODE, jamais un fichier image : peinture à paillettes, pâtisserie
// industrielle et peau de requin. ⚠ calculées UNE fois et partagées (comme MAT9) — sans ce cache,
// chaque ouverture du garage repeindrait trois canvas. La TEINTE reste portée par `material.color`
// qui MULTIPLIE la carte : la carte donne le grain, la fiche donne la couleur.
const MATV={_c:{},get(k){return this._c[k]||(this._c[k]=this['_'+k]());},
  _tex(cv){const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;},
  // PEINTURE À PAILLETTES : ce qui fait lire « vernis tuning » n'est pas la couleur, c'est le
  // SCINTILLEMENT — des milliers de micro-éclats qui n'accrochent la lumière que sous un angle.
  // Fond quasi blanc pour se laisser teindre, marbrure très douce pour que le plat ne soit pas plat.
  _flake(){
    const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');
    c.fillStyle='#f2f2f2';c.fillRect(0,0,256,256);
    for(let i=0;i<170;i++){ // marbrure : nuages sombres à peine perceptibles (la tôle n'est jamais uniforme)
      c.globalAlpha=.05;c.fillStyle='#9aa0a6';
      c.beginPath();c.arc(Math.random()*256,Math.random()*256,8+Math.random()*22,0,7);c.fill();}
    c.globalAlpha=1;
    for(let i=0;i<2600;i++){ // LES PAILLETTES
      const x=Math.random()*256,y=Math.random()*256,r=Math.random()<.12?1.6:.75;
      c.fillStyle=Math.random()<.5?'rgba(255,255,255,.95)':'rgba(190,200,210,.7)';
      c.beginPath();c.arc(x,y,r,0,7);c.fill();}
    return this._tex(cv);
  },
  // LA POP-TART, FACE GLAÇAGE : croûte dorée piquée, glaçage rose en retrait, pépites semées.
  // ⚠ le glaçage NE VA PAS jusqu'au bord — c'est ce liseré de pâte nue qui fait lire « pâtisserie »
  // et pas « rectangle rose ». Les pépites sont semées par boucle, jamais dessinées à la main.
  _icing(){
    const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');
    c.fillStyle='#e8b473';c.fillRect(0,0,256,256);                       // la pâte
    for(let i=0;i<900;i++){c.fillStyle='rgba(150,102,52,'+(.05+Math.random()*.18)+')'; // piqûres de cuisson
      c.beginPath();c.arc(Math.random()*256,Math.random()*256,.7+Math.random()*1.6,0,7);c.fill();}
    c.fillStyle='#f4a0c4';c.fillRect(26,26,204,204);                     // le glaçage, en retrait
    c.fillStyle='rgba(255,255,255,.16)';c.fillRect(26,26,204,26);        // reflet mou en haut du glaçage
    const SPR=['#7fd8ff','#ffe45e','#ff6f91','#8dff9a','#c48dff','#ffffff'];
    for(let i=0;i<130;i++){                                              // LES PÉPITES
      const x=36+Math.random()*184,y=36+Math.random()*184,a=Math.random()*3.14;
      c.save();c.translate(x,y);c.rotate(a);
      c.fillStyle=SPR[(Math.random()*SPR.length)|0];c.fillRect(-4,-1.4,8,2.8);c.restore();}
    return this._tex(cv);
  },
  // LA TRANCHE de la pop-tart : pâte nue, festonnée sur ses bords (l'empreinte de la fourchette).
  _crust(){
    const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');
    c.fillStyle='#e0a869';c.fillRect(0,0,64,64);
    for(let i=0;i<220;i++){c.fillStyle='rgba(146,96,48,'+(.06+Math.random()*.22)+')';
      c.beginPath();c.arc(Math.random()*64,Math.random()*64,.6+Math.random()*1.5,0,7);c.fill();}
    for(let i=0;i<16;i++){c.fillStyle='rgba(120,78,38,.42)';c.fillRect(i*4+1,0,2,7);c.fillRect(i*4+1,57,2,7);} // festons
    return this._tex(cv);
  },
  // LE BANDEAU DE PARE-BRISE du tuner : bande sombre en haut de la vitre + lettrage suggéré.
  // ⚠ on ne DESSINE PAS de texte : à 40 px de haut en jeu, des lettres lisibles seraient du bruit.
  // Des barres de largeurs irrégulières lisent « autocollant de team » beaucoup mieux qu'un mot.
  _banner(){
    const cv=document.createElement('canvas');cv.width=256;cv.height=64;const c=cv.getContext('2d');
    c.fillStyle='#0c1408';c.fillRect(0,0,256,64);
    let x=14;
    while(x<242){const w=6+Math.random()*22,h=16+Math.random()*14;
      c.fillStyle=Math.random()<.22?'#ffffff':'#9dff42';
      c.fillRect(x,32-h/2,w,h);x+=w+5+Math.random()*7;}
    c.fillStyle='rgba(157,255,66,.28)';c.fillRect(0,54,256,4);
    return this._tex(cv);
  },
  // CARBONE, SERGÉ 2/2, TISSÉ PAR LE CODE. ⚠ ce qui fait lire le carbone n'est pas la couleur
  // (du noir reste du noir) mais le fait que le REFLET COURT LE LONG DES MÈCHES : d'où des tuiles
  // alternées où le dégradé change de sens d'une case à l'autre. Sans cette alternance, on obtient
  // du damier gris — un tissu, pas de la fibre.
  _carbone(){
    const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');
    c.fillStyle='#141519';c.fillRect(0,0,128,128);
    const T=16;
    for(let y=0;y<128;y+=T)for(let x=0;x<128;x+=T){
      const sens=(((x/T)+(y/T))&2)===0;                    // sergé 2/2 : deux cases dans un sens, deux dans l'autre
      const g=sens?c.createLinearGradient(x,y,x+T,y+T):c.createLinearGradient(x+T,y,x,y+T);
      g.addColorStop(0,'#3a3d47');g.addColorStop(.5,'#191b21');g.addColorStop(1,'#3a3d47');
      c.fillStyle=g;c.fillRect(x,y,T,T);
      c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.strokeRect(x+.5,y+.5,T-1,T-1);
    }
    return this._tex(cv);
  },
  // STICKERS DE FLANC : des blocs et des chevrons, pas du texte. À 60 px de haut en course, un
  // lettrage lisible n'existe pas — ce qu'on reconnaît d'une caisse kittée, c'est le RYTHME.
  _stickers(){
    const cv=document.createElement('canvas');cv.width=256;cv.height=64;const c=cv.getContext('2d');
    c.clearRect(0,0,256,64);
    c.fillStyle='rgba(255,255,255,.90)';
    for(let i=0;i<5;i++){const x=18+i*46,w=8+Math.random()*16;
      c.beginPath();c.moveTo(x,10);c.lineTo(x+w,10);c.lineTo(x+w-11,54);c.lineTo(x-11,54);c.closePath();c.fill();}
    c.fillStyle='rgba(20,26,14,.92)';c.fillRect(0,26,256,5);
    c.fillStyle='rgba(255,255,255,.75)';c.fillRect(0,33,256,2);
    return this._tex(cv);
  },
  // PEAU DE REQUIN : le CONTRE-OMBRAGE. Un requin n'est pas bleu, il est sombre dessus et blanc
  // dessous — c'est ce dégradé (et lui seul) qui le fait lire comme un animal marin. Le grain fin
  // par-dessus, ce sont les denticules : sans eux la bulle ressort en plastique de jouet.
  _skin(){
    const cv=document.createElement('canvas');cv.width=64;cv.height=256;const c=cv.getContext('2d');
    const g=c.createLinearGradient(0,0,0,256); // v=1 en haut de la texture = le DOS sur une sphère
    g.addColorStop(0,'#ffffff');g.addColorStop(.30,'#eaf2f8');g.addColorStop(.52,'#9dbcd8');
    g.addColorStop(.66,'#5d86b4');g.addColorStop(1,'#2f5a86');
    c.fillStyle=g;c.fillRect(0,0,64,256);
    for(let i=0;i<2200;i++){const y=Math.random()*256;
      c.fillStyle='rgba('+(Math.random()<.5?'255,255,255,':'20,40,70,')+(.04+Math.random()*.10)+')';
      c.fillRect(Math.random()*64,y,1.4,1);}
    return this._tex(cv);
  }};
const SPH9=new THREE.SphereGeometry(1,16,12); // la boule partagée par les gabarits (bulles, museaux, têtes)
// SILHOUETTE DE PROFIL : la « gueule » de chaque gabarit — points (z=longueur,y=hauteur) extrudés
// sur la largeur. Capots plongeants, fastbacks, coins furtifs : impossibles en boîtes, gratuits ici.
/* ---- LE LOFT : un corps ANIMAL, pas un tas de boules ------------------------------------------
   ⚠ POURQUOI. Les caisses fantastiques étaient montées en sphères aplaties empilées : ça donne un
   galet, jamais un être vivant. Un animal se lit à sa LIGNE — un rayon qui enfle au thorax puis
   s'étrangle au pédoncule — et à son CONTRE-OMBRAGE, sombre dessus, clair dessous. Les deux se
   fabriquent d'un coup en loftant des anneaux le long d'une épine, avec la couleur peinte DANS les
   sommets (donc gratuite : ni texture, ni deuxième matériau).
   La recette vient de `dauphins.html`, écrite pour la figure LE DAUPHIN — on la rapatrie ici au
   lieu d'en refaire une approximation.
   `prof` = [[u,rayon],…] de u=0 (le nez) à u=1 (la queue). Nez vers +Z, comme toute caisse.
   ---------------------------------------------------------------------------------------------- */
function loftBody(prof,o){
  o=o||{};
  const LEN=o.len||1,RINGS=o.rings||44,SEG=o.seg||22,
        arch=o.arch||0,droop=o.droop||0,wid=o.wid||1,flat=o.flat||.88;
  // ⚠ `flat` (l'aplatissement du ventre) et `bel` (sa COULEUR) sont deux clés DISTINCTES. Les avoir
  // toutes deux nommées `belly` faisait gagner la seconde : le bas de chaque anneau se multipliait
  // par 16 055 551 et la caisse mesurait 16 000 km de haut, hors champ, écran vide.
  const cT=new THREE.Color(o.top!=null?o.top:0x2f5a86),
        cS=new THREE.Color(o.side!=null?o.side:0x7fb8dc),
        cB=new THREE.Color(o.bel!=null?o.bel:0xf2ffff);
  const rad=u=>{ // interpolation DOUCE entre les points du profil (une lerp droite fait des angles)
    for(let i=0;i<prof.length-1;i++)if(u<=prof[i+1][0]){
      const a=prof[i],b=prof[i+1];let t=(u-a[0])/(b[0]-a[0]||1);
      t=.5-.5*Math.cos(t*Math.PI);
      return a[1]+(b[1]-a[1])*t;}
    return prof[prof.length-1][1];
  };
  const pos=[],col=[],idx=[],tmpC=new THREE.Color();
  for(let i=0;i<RINGS;i++){
    const u=i/(RINGS-1),z=LEN*.5-u*LEN,r=rad(u);
    const sy=arch*Math.sin(Math.PI*Math.min(1,u*1.02))-(u<.18?(.18-u)*droop:0);
    for(let j=0;j<=SEG;j++){
      const a=j/SEG*Math.PI*2;
      let py=Math.cos(a)*r;const px=Math.sin(a)*r*wid;
      if(py<0)py*=flat;                                   // ventre aplati : c'est ce qui pose l'animal
      pos.push(px,sy+py,z);
      const t=(Math.cos(a)+1)/2;                          // 1 = dos, 0 = ventre
      tmpC.copy(cB).lerp(cS,Math.min(1,t*1.5)).lerp(cT,Math.max(0,t-.55)*2.2);
      col.push(tmpC.r,tmpC.g,tmpC.b);
    }
  }
  const rw=SEG+1;
  for(let i=0;i<RINGS-1;i++)for(let j=0;j<SEG;j++){
    const a=i*rw+j,b=a+1,c=a+rw,d=c+1;idx.push(a,c,b,b,c,d);}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setIndex(idx);g.computeVertexNormals();
  return g;
}
// AILERON : un contour 2D extrudé et biseauté. Une nageoire est une LAME, pas un cône — c'est sa
// silhouette falciforme qui la fait lire, et un cône n'en a aucune.
function finShape(pts,depth){
  const sh=new THREE.Shape();
  sh.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)sh.lineTo(pts[i][0],pts[i][1]);
  const g=new THREE.ExtrudeGeometry(sh,{depth:depth,bevelEnabled:true,bevelThickness:depth*.6,
    bevelSize:depth*.5,bevelSegments:2,steps:1});
  g.center();g.computeVertexNormals();return g;
}
function carProfile(pts,w){
  const s=new THREE.Shape();
  s.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);
  // BISEAU : arrondit la silhouette ET les flancs → fini l'effet « bloc » (arêtes vives) sur toutes les caisses profilées
  const bev=Math.min(.09,w*.055);
  const g=new THREE.ExtrudeGeometry(s,{depth:w-2*bev,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:2,steps:1});
  g.rotateY(-Math.PI/2);g.translate(w/2-bev,0,0); // longueur → Z (avant en +Z), largeur centrée sur X (bev compris)
  return g;
}
/* ---- LE KIT LOW-POLY (2026-09-24) — la gamme se MODÈLE, elle ne se maçonne plus --------------
   Premier jet du jour en voxels ; verdict du user : « on vise un style POLY, Rocket League — les
   plis de pixels dérangent et ENFERMENT les futurs modèles dans un design limité ». Il avait
   raison : une brique ne sait faire que des marches, et toute pente devenait un escalier.
   Ici, une caisse = UN LOFT (des sections le long de l'axe, reliées par des facettes planes) + des
   PIÈCES low-poly (boîtes, prismes, cylindres à peu de pans, tours). Tout est à FACETTES FRANCHES :
   chaque triangle porte sa propre normale et sa propre couleur — c'est ce qui fait « Rocket
   League » : des volumes nets, des pans qui attrapent la lumière un par un, jamais de lissage mou.
   ⚠ LE LOFT, C'EST LA LIBERTÉ : `S(z)` rend la DEMI-section (x ≥ 0) du bas-centre au haut-centre ;
   les stations `zs` décident où tombent les arêtes. Un passage de roue n'est pas un trou découpé :
   c'est le bas de caisse qui MONTE aux stations de la roue — arche hexagonale, trapézoïdale ou
   carrée selon les stations qu'on donne. Capot en creux, flancs rentrants, fastback : un chiffre.
   ⚠ UNE GÉOMÉTRIE PAR MATIÈRE (laque, chrome, or, satiné, mat, verre, feux), la COULEUR dans les
   sommets : bicolore, liseré et calandre ne coûtent pas un draw call de plus.
   ⚠ MATIÈRES EN DOUBLE FACE : un tour ou un prisme peut sortir retourné selon l'ordre de ses
   points, et une face retournée ne se voit pas (culling) — elle ne plante pas, elle DISPARAÎT. Le
   double face rend le kit incassable : le shader retourne la normale vers l'œil.
   LA HONTE n'est PAS concernée (demande explicite : « ne rien changer »).
   -------------------------------------------------------------------------------------------- */
const LPU={
  cl:(v,a,b)=>v<a?a:v>b?b:v,
  // table affine par morceaux [[z,v],…] (z croissants), bornée aux extrémités
  lin(t,z){if(z<=t[0][0])return t[0][1];
    for(let i=1;i<t.length;i++)if(z<=t[i][0]){const p=t[i-1],q=t[i];return p[1]+(q[1]-p[1])*(z-p[0])/((q[0]-p[0])||1);}
    return t[t.length-1][1];},
  // hauteur du bas de caisse autour des roues : l'ARCHE est donnée par ses stations (dz → y)
  arch(z,wz,prof,base){let y=base;for(const w of wz){const d=Math.abs(z-w);y=Math.max(y,LPU.lin(prof,d));}return y;}
};
/* ---- LES POTS D'ÉCHAPPEMENT ---- (bloc posé par l'atelier des pots) */
/* ---- LES POTS D'ÉCHAPPEMENT (2026-10-10, Léo : « une grosse révision très précise sur chacune des voitures — fais attention, ne
   change rien, garde toutes les voitures telles qu'elles sont : juste un pot d'échappement pour chacune, adapté au modèle ; fais la
   différence ») — chaque caisse de la liste a SON pot, dessiné pour elle (`ECH_POTS`, par gabarit). Deux temps :
   1. `echRetire(gs,prims,shape)` (dans le `commit` du kit) ÔTE l'ancien embout : les tubes et boîtes que le relevé des pots reconnaît
      (les MÊMES critères que CAR_POTS dans buildCar) et les boîtes `ote` de la fiche — triangle par triangle, seulement ce qui tient EN
      ENTIER dans l'embout : le pare-chocs autour reste intact ;
   2. `echappement(K,shape,A)` (juste après le gabarit) DESSINE le nouveau pot avec les pièces `ECHP` et DÉCLARE ses bouches (`A.pots`) :
      flammes, tuyères et traînées sortent de là. Rien d'autre de la caisse ne bouge. La salle blanche appelle les deux pareil.
   Repère caisse : x à droite, y en haut, z vers l'AVANT ; une bouche est donnée par son point le plus en ARRIÈRE (z le plus petit), le
   tube rentre dans la caisse vers +z. */
const ECH_PAL={c:{g:'c',c:0xe8ecf0},C:{g:'c',c:0x9aa2ab},a:{g:'c',c:0xc9ced6},b:{g:'c',c:0x6157c9},v:{g:'c',c:0x9a62c8},x:{g:'c',c:0xc89a52},
  o:{g:'o',c:0xd9a520},k:{g:'m',c:0x08080a},s:{g:'s',c:0x1c1d21},f:{g:'s',c:0x2a2c31},r:{g:'m',c:0x6a3b1e},R:{g:'m',c:0x8f5a33},
  w:{g:'s',c:0xf6f8fc},i:{g:'c',c:0xc4ecfb},n:{g:'c',c:0x2f8fc4},h:{g:'c',c:0x7884c8}, /* h : l'acier BLEUI par la chaleur (le pot réel) */
  g:{g:'l',c:0xff7a24},G:{g:'l',c:0x46d2ff},V:{g:'l',c:0x6dff5a},P:{g:'l',c:0xff3ea0},Y:{g:'l',c:0xffc84a},
  1:{g:'s',c:0xff2a2a},2:{g:'s',c:0xff9a1f},3:{g:'s',c:0xffe23a},4:{g:'s',c:0x3cdc4a},5:{g:'s',c:0x2f8cff},6:{g:'s',c:0x8a4dff}};
/* LES PIÈCES. Chacune dessine dans le kit E et RENVOIE ses bouches [[x,y,z],…]. `o` : options de la fiche. */
const ECHP=(()=>{
  const PI=Math.PI;
  // UNE PIÈCE POSÉE À LA BOUCHE : la géométrie est écrite dans le repère de la bouche (axe +z = vers l'intérieur de la caisse), puis
  // tournée AUTOUR DE LA BOUCHE (rx penche vers le sol, ry vers le dehors, rz tourne la section) et posée en (x,y,z)
  const pose=(E,k,g,q,sx,sy)=>E.put(k,g,q.x,q.y,q.z,q.rx||0,q.ry||0,q.rz||0,sx||1,sy||1,1);
  const tubeG=(r1,r2,len,n,z0)=>{const g=new THREE.CylinderGeometry(r2,r1,len,n||12,1,false);g.rotateX(PI/2);g.translate(0,0,(z0||0)+len/2);return g;};
  const bagueG=(r,e,n,z0)=>{const g=new THREE.TorusGeometry(r,e,4,n||14);g.translate(0,0,z0||0);return g;};
  // LA SORTIE RONDE : tube, âme noire en retrait (sauf `ame:0`), bague au bord ; `ev` évase la sortie, `dbl` double paroi, `bout` = un
  // manchon teinté à la bouche (titane brûlé), `lueur` = un feu au fond
  const rond=(E,x,y,z,o)=>{const r=o.r||.05,n=o.n||12,k=o.k||'c',L=o.len||.32,ev=o.ev||1,q={x,y,z,rx:o.rx,ry:o.ry,rz:o.rz},sx=o.sx,sy=o.sy;
    pose(E,k,tubeG(r*ev,r,L,n),q,sx,sy);
    if(o.bout)pose(E,o.bout,tubeG(r*ev*1.03,r*1.03,.06,n,-.002),q,sx,sy);
    if(o.dbl)pose(E,o.k2||'C',tubeG(r*ev*.74,r*ev*.74,.06,n,.012),q,sx,sy);
    if(o.ame!==0)pose(E,'k',tubeG(r*ev*(o.dbl?.58:.80),r*ev*(o.dbl?.58:.80),.05,n,o.dbl?.03:.008),q,sx,sy);
    if(o.bague!==0)pose(E,o.kb||k,bagueG(r*ev*.94,Math.max(.006,r*.12),n),q,sx,sy);
    if(o.lueur)pose(E,o.lueur,tubeG(r*ev*.45,r*ev*.45,.01,n,.06),q,sx,sy);
    return [x,y,z];};
  // LA BOUCHE RECTANGULAIRE (boîte creuse) : largeur w, hauteur h ; `cloison` = deux sorties dans la même bouche
  const rect=(E,x,y,z,o)=>{const w=o.w||.16,h=o.h||.07,L=o.len||.3,k=o.k||'c',e=o.e||.016;
    E.box(k,w,e,L,x,y+h/2-e/2,z+L/2);E.box(k,w,e,L,x,y-h/2+e/2,z+L/2);E.box(k,e,h,L,x-w/2+e/2,y,z+L/2);E.box(k,e,h,L,x+w/2-e/2,y,z+L/2);
    if(o.cloison)E.box(k,e,h,L,x,y,z+L/2);
    E.box('k',w-2*e,h-2*e,.04,x,y,z+.02);
    if(o.lueur)E.box(o.lueur,(w-2*e)*.7,(h-2*e)*.5,.01,x,y,z+.05);
    return [x,y,z];};
  const P={
    rond:(E,o)=>o.pts.map(q=>rond(E,q[0],q[1],q[2],Object.assign({},o,q[3]||{}))),
    /* (2026-10-15, pôle TECHNIQUE — Léo : « un pot d'échappement plus réaliste, métallique… refonte du pot, sur LA HONTE, et toutes les voitures qui
       ont un pot aussi peu bien fait ») LE POT RÉEL : un vrai embout d'échappement — le tube à peine évasé, le BORD ROULÉ, la double paroi plus
       sombre, la SUIE puis le fond noir, la chaleur derrière le bord (une bande DORÉE, puis BLEUIE), un cordon de soudure, le tuyau qui repart
       sous la caisse vers son silencieux et le collier qui le tient. Remplace le pot générique des gabarits sans fiche et les tubes fins et nus. */
    reel:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,o2=Object.assign({},o,q[3]||{}),r=o2.r||.045,k=o2.k||'c',L=o2.len||.3,n=16,Q={x,y,z,rx:o2.rx,ry:o2.ry,rz:o2.rz};
      pose(E,k,tubeG(r*1.06,r,L,n),Q);                                    // le tube, à peine évasé vers la bouche
      pose(E,k,bagueG(r*1.03,Math.max(.004,r*.16),n,.004),Q);             // le BORD ROULÉ
      pose(E,'C',tubeG(r*.8,r*.8,.07,n,.01),Q);                           // la double paroi
      pose(E,'f',tubeG(r*.68,r*.68,.05,n,.028),Q);                        // la suie
      pose(E,'k',tubeG(r*.64,r*.64,.02,n,.07),Q);                         // le fond
      pose(E,o2.kc||'x',tubeG(r*1.075,r*1.07,.045,n,.03),Q);              // la chaleur : la bande DORÉE derrière le bord…
      pose(E,'h',tubeG(r*1.07,r*1.065,.05,n,.075),Q);                     // …puis BLEUIE
      pose(E,k,bagueG(r*1.03,Math.max(.003,r*.07),n,L*.72),Q);            // le cordon de soudure
      {const g=new THREE.CylinderGeometry(r*.8,r*.8,.4,10);g.rotateX(PI/2);g.rotateX(-.22);g.translate(0,-.03,L+.17);pose(E,'f',g,Q);} // le tuyau qui repart sous la caisse
      {const g=new THREE.BoxGeometry(r*.7,r*1.6,.024);g.translate(0,r*1.2,L*.86);pose(E,'s',g,Q);} // le collier de fixation
      return [x,y,z];}),
    rect:(E,o)=>o.pts.map(q=>rect(E,q[0],q[1],q[2],Object.assign({},o,q[3]||{}))),
    // UN ÉCRIN derrière les sorties (feuille d'or, laque noire…) : x,y,z centre, w,h
    plaque:(E,o)=>{E.box(o.k||'o',o.w,o.h,.012,o.x||0,o.y,o.z);return [];},
    // LA FENTE : une bouche large et mince, une lueur dedans
    fente:(E,o)=>o.pts.map(q=>{const w=o.w,h=o.h;E.box(o.k||'s',w+.03,h+.03,.06,q[0],q[1],q[2]+.03);E.box('k',w,h,.02,q[0],q[1],q[2]-.002);
      if(o.lueur)E.box(o.lueur,w*.9,h*.55,.01,q[0],q[1],q[2]-.008);return [q[0],q[1],q[2]];}),
    // LA TUYÈRE À PÉTALES : n pétales autour d'une bouche de rayon r ; des aubes dedans (`aubes`), une lueur au fond
    turbine:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,r=o.r,n=o.n||10,Q={x,y,z};
      pose(E,o.k||'C',tubeG(r*1.04,r*1.12,.2,n,.02),Q);pose(E,'k',tubeG(r*.86,r*.86,.04,n,.03),Q);
      for(let i=0;i<n;i++){const a=(i+.5)/n*PI*2,g=new THREE.BoxGeometry(r*.58,.012,.17);g.rotateX(-.22);g.translate(0,r*1.0,-.03);g.rotateZ(a-PI/2);pose(E,o.kp||'a',g,Q);}
      for(let i=0;i<(o.aubes||0);i++){const g=new THREE.BoxGeometry(r*1.65,.014,.03);g.rotateZ(i/o.aubes*PI);g.translate(0,0,.07);pose(E,'s',g,Q);}
      if(o.lueur)pose(E,o.lueur,tubeG(r*.5,r*.5,.01,n,.1),Q);
      return [x,y,z];}),
    // LA CLOCHE de tuyère de fusée
    cloche:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,r=o.r,n=o.n||12;
      E.lathe(o.k||'C',[[r*.55,.32],[r*.6,.2],[r*.8,.1],[r,0]],n,x,y,z,'z');E.lathe('k',[[r*.5,.3],[r*.55,.18],[r*.75,.08],[r*.93,.004]],n,x,y,z+.003,'z');
      pose(E,o.kb||'b',bagueG(r*.98,.012,n),{x,y,z});if(o.lueur)pose(E,o.lueur,tubeG(r*.4,r*.4,.01,n,.2),{x,y,z});return [x,y,z];}),
    // LES OUÏES : trois fentes superposées par côté, le feu au fond
    ouies:(E,o)=>o.pts.map(q=>{for(let i=0;i<3;i++){const y=q[1]+(i-1)*o.pas,w=o.w*(1-.12*Math.abs(i-1));
        E.box(o.k||'C',w+.02,o.h+.02,.05,q[0],y,q[2]+.025);E.box('k',w,o.h,.02,q[0],y,q[2]-.002);if(o.lueur)E.box(o.lueur,w*.8,o.h*.35,.01,q[0],y,q[2]-.006);}
      return [q[0],q[1],q[2]];}),
    // LA GUEULE : une sortie ronde et ses crocs
    gueule:(E,o)=>o.pts.map(q=>{const m=rond(E,q[0],q[1],q[2],o),r=(o.r||.06)*(o.ev||1),c=o.crocs||6;
      for(let i=0;i<c;i++){const a=PI/2+i/c*PI*2,g=new THREE.ConeGeometry(.02,.08,4);g.rotateZ(PI);g.translate(0,r*1.12,-.015);g.rotateZ(a-PI/2);pose(E,o.kc||'w',g,{x:q[0],y:q[1],z:q[2]});}
      return m;}),
    // LA SORTIE LATÉRALE : un tube qui sort du flanc (axe x), juste devant la roue arrière
    lateral:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,sd=Math.sign(x)||1,r=o.r||.05,L=o.len||.4;
      const g=tubeG(r,r,L,o.n||12);E.put(o.k||'c',g,x,y,z,0,-sd*PI/2,0);
      E.put('k',tubeG(r*.78,r*.78,.05,o.n||12,.008),x,y,z,0,-sd*PI/2,0);E.put(o.k||'c',bagueG(r*.95,Math.max(.006,r*.12),o.n||12),x,y,z,0,-sd*PI/2,0);
      return [x+sd*.01,y,z-.02];}),
    // LE POT LATÉRAL : un long tube chromé le long du bas de caisse, son écran perforé, la sortie devant la roue arrière
    sidepipe:(E,o)=>o.pts.map(q=>{const [x,y,z1,z0]=q,sd=Math.sign(x)||1,r=o.r,L=z1-z0,X=x+sd*(r+.012);
      pose(E,o.k||'c',tubeG(r,r,L,12),{x:X,y,z:z0});pose(E,'k',tubeG(r*.78,r*.78,.04,12,.008),{x:X,y,z:z0});pose(E,o.k||'c',bagueG(r*.95,.007,12),{x:X,y,z:z0});
      E.box(o.kb||'a',.012,r*1.5,L*.6,X+sd*(r+.004),y,(z0+z1)/2);                                   // l'écran
      for(let i=0;i<9;i++)E.box('k',.006,.016,.03,X+sd*(r+.011),y+(i%2?.012:-.012),z0+L*.22+i*L*.064); // ses trous
      for(const zz of [z0+.06,z1-.04])E.box(o.k||'c',.03,.03,.05,x+sd*.012,y,zz);                     // ses pattes
      return [X,y,z0];}),
    // LES CHEMINÉES : deux tubes debout derrière la cabine, un clapet sur chacune
    cheminee:(E,o)=>o.pts.map(q=>{const [x,y0,z]=q,h=q[3]&&q[3].h||o.h,r=o.r;
      E.cyl(o.k||'c',r,h,12,x,y0+h/2,z,'y');E.cyl('k',r*.8,.04,12,x,y0+h-.015,z,'y');
      E.put(o.kc||'C',new THREE.BoxGeometry(r*2.3,.012,r*2.3),x,y0+h+.035,z-r*.6,-.55,0,0);
      for(const dy of [.25,.55])E.cyl('C',r*1.15,.03,12,x,y0+h*dy,z,'y');
      return [x,y0+h,z-r];}),
    // LE HOT ROD : ses quatre collecteurs par flanc (posés par son gabarit) gagnent un bout brûlé et une gueule noire
    hotrod:(E)=>{const M=[],v=new THREE.Vector3(),eu=new THREE.Euler();
      for(const sd of [1,-1])for(let i=0;i<4;i++){const z=.82+i*.16;eu.set(-.35,0,-sd*.45);
        v.set(0,.17,0).applyEuler(eu);const x=sd*.31+v.x,y=.85+v.y,zz=z+v.z;
        const g1=new THREE.CylinderGeometry(.036,.036,.05,6,1,true);g1.translate(0,-.022,0);E.put('x',g1,x,y,zz,-.35,0,-sd*.45);
        const g2=new THREE.CylinderGeometry(.026,.026,.012,6);E.put('k',g2,x,y-.002,zz,-.35,0,-sd*.45);
        {const d=[v.x/.17,v.y/.17,v.z/.17],t=(Math.abs(x)-.23)/Math.abs(d[0]);   // (2026-10-15) LES POTS ENCASTRÉS : le collecteur entre dans le flanc du bloc (x ±0,23) par sa LUMIÈRE,
          P.encoche(E,{f:'r',x:sd*.23,y:y-d[1]*t,z:zz-d[2]*t,rx:.034,ry:.062,d:[sd,0,0]});   // une encoche rectangulaire à jonc, comme la bride d'un vrai V8 (le tube la traverse en biais)
          E.box('k',.006,2*(.062+ECH_ENC.jeu),2*(.034+ECH_ENC.jeu),sd*.233,y-d[1]*t,zz-d[2]*t);}  // et son FOND NOIR : la face du bloc n'est pas percée, sans lui la lumière restait rouge
        if(i===1||i===3)M.push([x,y,zz]);}
      return M;},
    // LE NUAGE : une bouche sombre dans une couronne de petits nuages
    nuage:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,r=o.r,Q={x,y,z};pose(E,'C',tubeG(r*.8,r*.8,.2,10,.02),Q);pose(E,'k',tubeG(r*.62,r*.62,.04,10,.01),Q);
      for(let i=0;i<7;i++){const a=i/7*PI*2+.3,s=r*(.42+.12*((i*37)%3));E.put('w',new THREE.IcosahedronGeometry(s,1),x+Math.cos(a)*r*1.05,y+Math.sin(a)*r*1.05,z+.03);}
      return [x,y,z];}),
    // LE PIXEL : un tube CARRÉ bagué des six couleurs de l'arc-en-ciel
    pixel:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,a=o.a;E.box('C',a,a,.2,x,y,z+.12);E.box('k',a*.6,a*.6,.03,x,y,z+.01);
      for(let i=0;i<6;i++)E.box(String(i+1),a+.02,a/6+.004,.03,x,y+a/2-a/12-i*a/6,z+.04);return [x,y,z];}),
    // LE TRIANGLE : une bouche triangulaire pliée dans l'inox, une lueur
    triangle:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,w=o.w,h=o.h,sd=Math.sign(x)||1,L=.18,P3=[[x-w/2,y-h/2],[x+w/2,y-h/2],[x+sd*w*.28,y+h/2]];
      for(let i=0;i<3;i++){const a=P3[i],b=P3[(i+1)%3];E.tri(o.k||'a',[a[0],a[1],z],[b[0],b[1],z],[b[0],b[1],z+L]);E.tri(o.k||'a',[a[0],a[1],z],[b[0],b[1],z+L],[a[0],a[1],z+L]);}
      const c=[(P3[0][0]+P3[1][0]+P3[2][0])/3,(P3[0][1]+P3[1][1]+P3[2][1])/3];
      for(let i=0;i<3;i++){const a=P3[i],b=P3[(i+1)%3],s9=.72;E.tri('k',[c[0]+(a[0]-c[0])*s9,c[1]+(a[1]-c[1])*s9,z+.02],[c[0]+(b[0]-c[0])*s9,c[1]+(b[1]-c[1])*s9,z+.02],[c[0],c[1],z+.02]);}
      if(o.lueur)E.tri(o.lueur,[c[0]-w*.12,c[1]-h*.12,z+.03],[c[0]+w*.12,c[1]-h*.12,z+.03],[c[0],c[1]+h*.14,z+.03]);
      return [x,y,z];}),
    // LE CRISTAL : un tube de glace à six pans, une lueur bleue au fond, trois éclats autour
    cristal:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,r=o.r,Q={x,y,z,rz:PI/6};pose(E,'i',tubeG(r*1.12,r*.9,.26,6),Q);pose(E,'n',tubeG(r*.86,r*.86,.03,6,.012),Q);
      pose(E,'G',tubeG(r*.6,r*.6,.01,6,.03),Q);for(let i=0;i<3;i++){const a=PI/6+i*PI*2/3,g=new THREE.ConeGeometry(.02,.09,4);g.rotateX(-PI/2+.5);g.translate(0,r*1.15,.04);g.rotateZ(a-PI/2);pose(E,'i',g,{x,y,z});}
      return [x,y,z];}),
    // L'ÉPAVE : un tuyau tordu qui pend, rouillé, ficelé au fil de fer
    epave:(E,o)=>{const [x,y,z]=o.pt,r=o.r,seg=[[x,y+.06,z+.5],[x,y+.02,z+.18],[x-.04,y-.06,z-.02],[x-.07,y-.16,z-.12]];
      for(let i=0;i<seg.length-1;i++){const a=seg[i],b=seg[i+1],dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz);
        const g=new THREE.CylinderGeometry(r,r,l,8);g.rotateX(PI/2);E.put(i%2?'R':'r',g,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,-Math.asin(dy/l),Math.atan2(dx,dz),0);}
      const e=seg[3];E.put('k',new THREE.CylinderGeometry(r*.8,r*.8,.02,8),e[0],e[1],e[2],PI/2-.6,0,0);
      E.put('C',new THREE.TorusGeometry(r*1.25,.006,3,8),x,y+.04,z+.3);E.box('C',.006,.18,.006,x,y+.13,z+.3);
      return [[e[0],e[1]+.02,e[2]]];},
  };
  // L'ENCOCHE (voir LES POTS ENCASTRÉS) : la poche noire percée dans le pare-chocs, à la forme de l'embout plus le jeu, et son jonc sombre
  P.encoche=(E,o)=>{const J=Object.assign({},ECH_ENC,o.jeu?{jeu:o.jeu}:{},o.jonc?{jonc:o.jonc}:{}),ex=o.rx+J.jeu,ey=o.ry+J.jeu,D=o.d||[0,0,-1];
    // bâtie dans son repère (l'ouverture regarde −z, la poche s'enfonce vers +z), puis tournée vers la sortie et posée sur la tôle
    const eu=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,-1),new THREE.Vector3(D[0],D[1],D[2]).normalize())),
      M9=new THREE.Matrix4(),Q9=new THREE.Quaternion(),pose=(k,g,px,py,pz,sx,sy,sz,rx)=>{Q9.setFromEuler(new THREE.Euler(rx||0,0,0));
        g.applyMatrix4(M9.compose(new THREE.Vector3(px,py,pz),Q9,new THREE.Vector3(sx||1,sy||1,sz||1)));E.put(k,g,o.x,o.y,o.z,eu.x,eu.y,eu.z);},zp=-.004+J.poche/2;
    if(o.f==='o'){pose('k',new THREE.CylinderGeometry(1,1,1,20,1,true),0,0,zp,ex,J.poche,ey,PI/2);pose('k',new THREE.CircleGeometry(1,20),0,0,-.004+J.poche,ex,ey,1);
      pose('f',new THREE.RingGeometry(1,1+J.jonc/Math.min(ex,ey),20),0,0,-.006,ex,ey,1);}
    else{const j=J.jonc,e=.006,B=(k,w,h,d,x,y,z)=>pose(k,new THREE.BoxGeometry(w,h,d),x,y,z);
      B('k',2*ex,e,J.poche,0,ey-e/2,zp);B('k',2*ex,e,J.poche,0,-ey+e/2,zp);B('k',e,2*ey,J.poche,-ex+e/2,0,zp);B('k',e,2*ey,J.poche,ex-e/2,0,zp);B('k',2*ex,2*ey,e,0,0,-.004+J.poche);
      B('f',2*ex+2*j,j,.006,0,ey+j/2,-.006);B('f',2*ex+2*j,j,.006,0,-ey-j/2,-.006);B('f',j,2*ey,.006,-ex-j/2,0,-.006);B('f',j,2*ey,.006,ex+j/2,0,-.006);}
    return [];};
  P.ovale=(E,o)=>P.rond(E,Object.assign({sx:1.45,sy:.72},o));
  return P;})();
/* LES POTS ENCASTRÉS (2026-10-15, Léo : « le pot d'échappement de la honte est un peu bizarre et mal. Il devrait être encastré, puis
   passer à travers une encoche qui a été faite exprès, un peu comme les vraies voitures » · « fais pareil pour toutes les voitures
   (seulement pot échappement) »). Sur une vraie voiture, le pare-chocs est percé d'une OUVERTURE à la forme de la sortie, un peu plus
   grande (le jeu : le pot vibre et chauffe), souvent bordée d'un jonc ; l'embout y est centré, à fleur ou dépassant d'un ou deux
   centimètres. Ici, pour chaque bouche qui sort par l'ARRIÈRE (rond, ovale, rect, fente, ouïes, turbine, cloche, cristal, gueule,
   pixel, triangle, nuage) : un rayon tiré de l'arrière trouve la tôle à la hauteur de la bouche (la caisse vient d'être montée, le pot
   pas encore) ; si elle est là, à moins de 70 cm, et qu'elle entoure la bouche (6 rayons sur 8 en anneau), l'embout est recalé à
   1,6 cm devant elle et une ENCOCHE est posée : une poche noire CREUSE à la forme de l'embout + 1,2 cm de jeu (ses parois et un fond à
   14 cm : ce qui est dessiné au fond des sorties — âmes, lueurs, aubes — reste visible) et un jonc sombre de 1,4 cm. Deux encoches d'une même pièce qui se touchent n'en font qu'une (rectangulaire). Une bouche qui sort SOUS la caisse (ou plus
   grosse que la tôle qu'elle perce) n'a pas d'encoche, comme sur les vraies : son embout s'arrête à 3 cm derrière la ligne du pare-chocs
   au-dessus d'elle, il ne pend plus derrière la voiture. Les sorties latérales, les cheminées et les collecteurs ne bougent pas. `enc:0`
   sur une fiche : ses pots restent tels quels (LA SILENCIEUSE : son silencieux est son dessin). Les flammes suivent (elles naissent aux
   bouches). */
const ECH_ENC={jeu:.012,jonc:.014,dep:.016,poche:.14,portee:.7};
function echTaille(t,o){ // le demi-gabarit d'un embout vu de l'arrière : [forme, demi-largeur, demi-hauteur] — null : la pièce ne sort pas par l'arrière
  const r=(o.r||.05)*(o.ev||1);
  switch(t){
    case 'rond':return ['o',r*(o.sx||1),r*(o.sy||1)];
    case 'reel':return ['o',r*1.12,r*1.12]; // (le pot réel : le bord roulé compris)
    case 'ovale':return ['o',r*(o.sx||1.45),r*(o.sy||.72)];
    case 'gueule':return ['o',r*1.3,r*1.3];
    case 'turbine':return ['o',o.r*1.14,o.r*1.14];
    case 'cloche':return ['o',o.r,o.r];
    case 'cristal':return ['o',o.r*1.16,o.r*1.16];
    case 'nuage':return ['o',o.r*1.6,o.r*1.6];
    case 'rect':return ['r',(o.w||.16)/2,(o.h||.07)/2];
    case 'fente':return ['r',(o.w+.03)/2,(o.h+.03)/2];
    case 'ouies':return ['r',(o.w+.02)/2,o.pas+(o.h+.02)/2];
    case 'pixel':return ['r',o.a/2+.01,o.a/2];
    case 'triangle':return ['r',o.w/2,o.h/2];
    case 'lateral':return ['o',o.r||.05,o.r||.05];
  }
  return null;}
const ECH_RC={rc:null,v:new THREE.Vector3(),w:new THREE.Vector3(),q:new THREE.Quaternion(),m:[]};
function echRayon(o,d){ // un rayon dans le repère caisse (origine o, direction d) : le premier pan touché [x,y,z], ou null
  const T=ECH_RC;T.v.set(o[0],o[1],o[2]);carGroup.localToWorld(T.v);T.w.set(d[0],d[1],d[2]).normalize().applyQuaternion(T.q);T.rc.set(T.v,T.w);
  const h=T.rc.intersectObjects(T.m,false)[0];if(!h)return null;const p=carGroup.worldToLocal(h.point);return [p.x,p.y,p.z];}
function echTole(x,y){const h=echRayon([x,y,-60],[0,0,1]);return h?h[2]:null;} // la tôle derrière (x, y) : son z, ou null
function echPrep(){ // la caisse telle qu'elle est (le pot n'est pas encore là) : ce que les rayons voient
  const T=ECH_RC;T.rc=T.rc||new THREE.Raycaster();carGroup.updateMatrixWorld(true);carGroup.getWorldQuaternion(T.q);
  T.m.length=0;carGroup.traverse(o=>{if(!o.isMesh||(o.userData&&o.userData.sol))return;for(let q=o;q&&q!==carGroup;q=q.parent)if(!q.visible)return;
    const mt=Array.isArray(o.material)?o.material[0]:o.material;if(mt&&(mt.transparent||mt.blending===THREE.AdditiveBlending))return;T.m.push(o);});}
const ECH_V=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],ECH_N=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
function echSortie(t,o,q){ // la direction où regarde une bouche (vers le DEHORS), dans le repère caisse
  if(t==='lateral')return [Math.sign(q[0])||1,0,0];
  if(o.rx||o.ry||o.rz){const v=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(o.rx||0,o.ry||0,o.rz||0));if(v.z<-.7)return [0,0,-1];return [v.x,v.y,v.z];} // un tube à peine biais (PIZZA, GROUPE B : 26°) se règle comme les autres, le long de z : tels que Léo les a validés (v468)
  return [0,0,-1];}
function echEncastre(P){
  echPrep();const J=ECH_ENC,out=[],N=[];let dzPrec=0;
  for(const pc of P){
    if(pc.t==='plaque'){const z=echTole(pc.x||0,pc.y);out.push(z!=null&&z-pc.z<J.portee&&z-pc.z>-.3?Object.assign({},pc,{z:z-.004}):pc);continue;}
    // LES CHEMINÉES : elles montent à travers une encoche percée dans ce qui est dessous (elles y plongent de 8 cm)
    if(pc.t==='cheminee'&&pc.pts){out.push(Object.assign({},pc,{pts:pc.pts.map(q=>{const H=echRayon([q[0],q[1]+.3,q[2]],[0,-1,0]);
      if(!H||H[1]<q[1]-1||H[1]>q[1]+.3)return q;const y0=H[1]-.08;
      N.push({f:'o',x:q[0],y:H[1],z:q[2],rx:pc.r,ry:pc.r,d:[0,1,0],jeu:pc.jeu,jonc:pc.jonc});
      return [q[0],y0,q[2],Object.assign({},q[3]||{},{h:(q[3]&&q[3].h||pc.h)+q[1]-y0})];})}));continue;}
    if(!pc.pts){out.push(pc);continue;}
    const q2=pc.pts.map(q=>q.slice()),G=[];
    // `lie` : la pièce suit la précédente (l'embout du silencieux de LA SILENCIEUSE)
    if(pc.lie){for(const q of q2)q[2]+=dzPrec;out.push(Object.assign({},pc,{pts:q2}));continue;}
    const pres=t=>t>=-.4&&t<=J.portee;                                                 // la tôle est à portée (t : ce que la bouche dépasse)
    pc.pts.forEach((q,i)=>{const o=Object.assign({},pc,q[3]||{}),tl=echTaille(pc.t,o);if(!tl)return;
      const S=echSortie(pc.t,o,q),U=Math.abs(S[1])>.9?[1,0,0]:ECH_N(ECH_V(S,[0,1,0])),V=ECH_V(U,S);
      const tir=(du,dv)=>{const O=[q[0]+U[0]*du+V[0]*dv+S[0]*60,q[1]+U[1]*du+V[1]*dv+S[1]*60,q[2]+U[2]*du+V[2]*dv+S[2]*60];return echRayon(O,[-S[0],-S[1],-S[2]]);};
      const dep=H=>(q[0]-H[0])*S[0]+(q[1]-H[1])*S[1]+(q[2]-H[2])*S[2];               // de combien la bouche dépasse de la tôle
      const H=tir(0,0);let n=0;
      if(H&&pres(dep(H))){const e9=(pc.jeu||J.jeu)+(pc.jonc||J.jonc)+.01,ax=tl[1]+e9,ay=tl[2]+e9; // l'anneau : la tôle entoure-t-elle la bouche ?
        for(let a=0;a<8;a++){const H2=tir(Math.cos(a*Math.PI/4)*ax,Math.sin(a*Math.PI/4)*ay);if(H2&&Math.abs(dep(H2)-dep(H))<.12)n++;}}
      if(n>=6||(pc.force&&H&&pres(dep(H)))){G.push({i:i,f:tl[0],x:q[0],y:q[1],z:q[2],h:H,s:S,rx:tl[1],ry:tl[2],jeu:pc.jeu,jonc:pc.jonc});return;}
      // SOUS LA CAISSE (ou plus grosse que la tôle qu'elle perce) : pas d'encoche, mais l'embout s'arrête à 3 cm de la ligne de la tôle
      // au-dessus de lui — il ne pend plus
      let t9=H&&pres(dep(H))?dep(H):null;for(let k=1;k<=12&&t9==null;k++){const H2=tir(0,k*.03);if(H2&&pres(dep(H2)))t9=dep(H2);}
      if(t9!=null&&t9>.03)for(let c=0;c<3;c++)q2[i][c]-=S[c]*(t9-.03);});
    // les encoches de la pièce : celles qui regardent vers l'ARRIÈRE et se touchent n'en font qu'une (un rectangle, la face au plus en arrière)
    const grp=G.map(g=>[g]),arr=g=>g.s[2]<-.99;
    for(let a=0;a<grp.length;a++)for(let b=a+1;b<grp.length;b++){const A9=grp[a],B9=grp[b];if(!A9.length||!B9.length)continue;
      const tou=A9.some(g=>B9.some(h=>arr(g)&&arr(h)&&Math.abs(g.x-h.x)<g.rx+h.rx+2*(J.jeu+J.jonc)+.01&&Math.abs(g.y-h.y)<g.ry+h.ry+2*(J.jeu+J.jonc)+.01));
      if(tou){A9.push(...B9);B9.length=0;b=a;}}
    for(const L9 of grp){if(!L9.length)continue;
      if(L9.length===1){const g=L9[0];for(let c=0;c<3;c++)q2[g.i][c]=g.h[c]+g.s[c]*J.dep;
        N.push({f:g.f,x:g.h[0],y:g.h[1],z:g.h[2],rx:g.rx,ry:g.ry,d:g.s,jeu:g.jeu,jonc:g.jonc});continue;}
      const z=Math.min(...L9.map(g=>g.h[2]));for(const g of L9)q2[g.i][2]=z-J.dep;
      const x0=Math.min(...L9.map(g=>g.x-g.rx)),x1=Math.max(...L9.map(g=>g.x+g.rx)),y0=Math.min(...L9.map(g=>g.y-g.ry)),y1=Math.max(...L9.map(g=>g.y+g.ry));
      N.push({f:'r',x:(x0+x1)/2,y:(y0+y1)/2,z:z,rx:(x1-x0)/2,ry:(y1-y0)/2,jeu:L9[0].jeu,jonc:L9[0].jonc});}
    dzPrec=q2.length?q2[0][2]-pc.pts[0][2]:0;
    out.push(Object.assign({},pc,{pts:q2}));}
  for(const n of N)out.push(Object.assign({t:'encoche',bouche:0},n));
  return out;}
/* ÔTER L'ANCIEN EMBOUT : `gs` = les géométries d'un kit ({famille: BufferGeometry} non indexées), `prims` = ses pièces simples */
function echRetire(gs,prims,shape){
  const F=ECH_POTS[shape];if(!F||F.garde)return gs;
  let zMin=1e9;for(const g in gs){gs[g].computeBoundingBox();zMin=Math.min(zMin,gs[g].boundingBox.min.z);}
  const B=[];
  if(prims)for(let i=prims.length-1;i>=0;i--){const p=prims[i];if(p.g==='l'||p.g==='g'||p.g==='p'||String(p.g).indexOf('pm:')===0)continue;let bx=null; // (2026-10-16) 'pm:…' : la tôle à motif (voir MOTIFS)
    if((p.t==='cyl'||p.t==='lathe')&&p.ax==='z'&&p.r<=.2&&p.z0<=zMin+.7&&p.y>.08&&p.y<=.6)bx=[p.x-p.r-.012,p.y-p.r-.012,p.z0-.012,p.x+p.r+.012,p.y+p.r+.012,p.z1+.012];
    else if(p.t==='box'&&!p.rot&&p.g==='c'&&p.w<=.4&&p.h<=.25&&p.z-p.d/2<=zMin+.15&&p.y<=.6&&((p.w>=p.h&&p.h>=.07)||(p.w<=.12&&p.h<=.12&&p.w>=.04&&p.h>=.04&&p.d>=.08)))
      bx=[p.x-p.w/2-.01,p.y-p.h/2-.01,p.z-p.d/2-.01,p.x+p.w/2+.01,p.y+p.h/2+.01,p.z+p.d/2+.01];
    if(bx){B.push(bx);prims.splice(i,1);}}
  for(const o of (F.ote||[]))B.push(o);
  if(!B.length)return gs;
  const dedans=(a,i)=>{for(const b of B)if(a[i]>=b[0]&&a[i]<=b[3]&&a[i+1]>=b[1]&&a[i+1]<=b[4]&&a[i+2]>=b[2]&&a[i+2]<=b[5])return true;return false;};
  for(const g in gs){const pa=gs[g].attributes.position.array,ca=gs[g].attributes.color.array,P2=[],C2=[];let ote=0;
    for(let i=0;i<pa.length;i+=9){if(dedans(pa,i)&&dedans(pa,i+3)&&dedans(pa,i+6)){ote++;continue;}
      for(let k=0;k<9;k++){P2.push(pa[i+k]);C2.push(ca[i+k]);}}
    if(!ote)continue;
    const n=new THREE.BufferGeometry();n.setAttribute('position',new THREE.Float32BufferAttribute(P2,3));n.setAttribute('color',new THREE.Float32BufferAttribute(C2,3));
    n.computeVertexNormals();gs[g].dispose();gs[g]=n;}
  return gs;}
/* DESSINER LE NOUVEAU POT, et déclarer ses bouches (la flamme naît là) */
function echappement(K,shape,A){
  let F=ECH_POTS[shape];
  if(!F&&A.pipes!==0){const W=K.W,L=K.L,y=A.split?K.y0+K.H*.06:K.y0+.08;F={p:[{t:'reel',r:.042,k:'c',len:.34,jeu:.008,jonc:.008,pts:[[W*.22,y,-L/2-.31],[-W*.22,y,-L/2-.31]]}]};} /* (2026-10-15) le POT RÉEL (voir ECHP.reel) au lieu du tube nu */ // (2026-10-15) les deux pots « canoniques » des gabarits sans fiche (des boîtes chromées de 22 cm qui pendaient 31 cm derrière) : deux vrais tubes de 7 cm, ENCASTRÉS dans le diffuseur (ou la tôle)
  if(!F||!F.p)return;
  if(F.vieux){const g=K.add(new THREE.Group()),car=g.parent;car.remove(g);   // les gabarits d'avant le kit : leurs canons sont des maillages à part
    for(const o of car.children.slice()){const p=o.geometry&&o.geometry.parameters;
      if(o.isMesh&&o.geometry.type==='CylinderGeometry'&&Math.abs(o.rotation.x-Math.PI/2)<.05&&o.position.y<.6&&o.position.z<-K.L/2+.6&&Math.max(p.radiusTop,p.radiusBottom)<=.2)car.remove(o);}}
  if(!F.p)return;
  const E=K.kit(ECH_PAL),M=[];E.ech=1;                            // (le kit du pot ne passe pas par echRetire)
  for(const pc of (F.enc===0?F.p:echEncastre(F.p))){const f=ECHP[pc.t];if(f){const m9=f(E,pc);if(pc.bouche!==0)for(const m of m9)M.push(m);}} // (2026-10-15) LES POTS ENCASTRÉS
  K.commit(E);
  A.pipes=0;                                                       // plus de cylindres « canoniques » (les gabarits d'avant le kit)
  if(F.bouches!==0&&M.length)A.pots=M.slice(0,4);                 // 4 bouches au plus portent une flamme (voir les tuyères de buildCar)
}
const ECH_POTS={  // (⚠ pas `ECH` : le banc du téléphone a déjà le sien)
 epave:{p:[{t:'reel',k:'C',r:0.046,len:0.45,jeu:.007,jonc:.008,pts:[[0.55,0.3955,-2.4]]}]}, /* (2026-10-15, Léo : « un pot plus réaliste à LA HONTE, métallique, côté GAUCHE, et ça devrait ne sortir que d'un pot ») UN SEUL pot RÉEL, en acier, à gauche (x > 0 = la gauche de la caisse : la gauche de l'écran vue de derrière) — la flamme ne sort plus que de lui ; avant : */ // (2026-10-15, Léo : « il devrait être encastré, puis passer à travers une encoche ») deux pots ROUILLÉS de 5-6 cm (pas tout à fait pareils), chacun dans son encoche percée dans le DIFFUSEUR, entre ses ailettes — avant : un tuyau tordu qui traversait le pare-chocs sans trou et pendait, ficelé, et un bout de tube qui flottait derrière
 eldorado:{p:[{t:'ovale',r:0.06,sx:1.7,sy:0.62,k:'c',dbl:1,pts:[[0.68,0.4,-3.08],[-0.68,0.4,-3.08]]}]},  // (2026-10-14, passe graphismes · pots) recalé sur le pare-chocs reculé de Léo (face à z -3,06) : bouches de -3,06 à -3,08, elles dépassent de 2 cm au lieu d'affleurer (z-fighting chrome)
 a_chargeur:{p:[{t:'rect',w:0.24,h:0.075,k:'c',e:0.015,pts:[[0.56,0.33,-2.58],[-0.56,0.33,-2.58]]}]},
 a_defieur:{p:[{t:'rond',r:0.068,k:'c',ev:1.06,pts:[[0.62,0.33,-2.584],[-0.62,0.33,-2.584]]}]},
 b_bavaroise:{p:[{t:'rond',r:0.038,k:'a',dbl:1,pts:[[0.28,0.27,-2.39],[0.38,0.27,-2.39]]}]},  // (2026-10-14, passe graphismes · pots) recalé sur la poupe de Léo : son bouclier recule à z -2,29 (bouches de -2,26 à -2,39, elles dépassent de 10 cm comme avant)
 caid:{ote:[[0.94,0.38,-1.04,1.06,0.5,-0.8],[-1.06,0.38,-1.04,-0.94,0.5,-0.8]],p:[{t:'lateral',r:0.045,len:0.3,k:'c',jeu:.006,jonc:.008,pts:[[0.99,0.64,-0.66],[0.99,0.64,-0.8],[-0.99,0.64,-0.66],[-0.99,0.64,-0.8]]}]}, // (2026-10-15, les pots encastrés « même les originales ») les quatre sorties latérales montent de 40 à 64 cm : dans le bas de caisse, chacune dans son encoche (avant : sous le flanc) ; `ote` retire les deux sorties que son gabarit dessinait en plus (z −,86/−,98, un doublon depuis le 10/10)
 c_silencieuse:{p:[{t:'rond',r:0.11,sx:1.6,sy:0.72,len:0.6,k:'a',ame:0,bague:0,bouche:0,jeu:.008,jonc:.01,pts:[[0,0.44,-2.535]]},{t:'rond',r:0.03,k:'c',len:0.1,lie:1,pts:[[0,0.44,-2.605]]}]}, // (2026-10-15, les pots encastrés « même les originales ») le silencieux remonte de 24 à 44 cm : son cul ovale dans une encoche du panneau arrière, l'embout devant lui (avant : il pendait dessous)
 d_samourai:{p:[{t:'rond',r:0.078,k:'b',kb:'v',ev:1.1,dbl:1,k2:'x',pts:[[0.42,0.28,-2.44]]}]},
 d_vette:{p:[{t:'rond',r:0.044,k:'c',dbl:1,pts:[[-0.24,0.3,-2.32],[-0.09,0.3,-2.32],[0.09,0.3,-2.32],[0.24,0.3,-2.32]]}]},
 e_anglaise:{p:[{t:'ovale',r:0.05,sx:1.9,sy:0.6,k:'c',dbl:1,pts:[[0.55,0.33,-2.44],[-0.55,0.33,-2.44]]}]},
 d_corbillard:{p:[{t:'reel',r:0.04,k:'s',kc:'f',len:0.3,pts:[[-0.56,0.38,-3.04]]}]}, // (2026-10-15) le pot réel, noir (le corbillard)
 a_chargeur69:{p:[{t:'rond',r:0.045,ev:1.4,k:'c',pts:[[0.32,0.3,-2.66],[-0.32,0.3,-2.66]]}]},
 b_canard:{p:[{t:'rond',r:0.05,k:'C',dbl:1,k2:'c',pts:[[-0.4,0.28,-2.13]]}]},
 e_aigle:{p:[{t:'rond',r:0.034,ev:1.18,k:'c',pts:[[0.36,0.28,-2.502],[0.46,0.28,-2.502],[-0.36,0.28,-2.502],[-0.46,0.28,-2.502]]}]},  // (2026-10-14, passe graphismes · pots) recalé sur la jupe reculée de Léo (rampe du dessous, tôle à z -2,452 au bord haut des bouches) : de -2,60 à -2,502, elles dépassent de 5 cm comme avant
 d_batmobile:{p:[{t:'rond',r:0.04,k:'C',bague:0,len:0.45,bout:'x',pts:[[-0.34,0.3,-2.435],[-0.44,0.3,-2.435]]}]},
 e_zed:{p:[{t:'rond',r:0.046,ev:1.28,k:'c',pts:[[0.38,0.28,-2.19]]}]},
 b_daytona:{p:[{t:'plaque',k:'s',w:0.27,h:0.1,x:0.32,y:0.35,z:-2.216},{t:'plaque',k:'s',w:0.27,h:0.1,x:-0.32,y:0.35,z:-2.216},{t:'rond',r:0.036,k:'c',dbl:1,pts:[[0.27,0.33,-2.31],[0.37,0.33,-2.31],[-0.27,0.33,-2.31],[-0.37,0.33,-2.31]]}]},  // (2026-10-14, passe graphismes · pots) recalé sur la poupe de Léo : le dessous remonte en rampe sous y 0,30 (la tôle y recule jusqu'à 25 cm) → écrin et bouches montés sur la face verticale (z -2,21), écrin collé à 0,4 cm
 c_taurine:{p:[{t:'rond',n:6,r:0.072,rz:0.5236,k:'a',dbl:1,k2:'C',pts:[[0.1,0.36,-2.26],[-0.1,0.36,-2.26]]}]},
 squale:{ote:[[0.285,0.285,-2.44,0.435,0.435,-2.2],[-0.435,0.285,-2.44,-0.285,0.435,-2.2],[0.477,0.285,-2.44,0.627,0.435,-2.2],[-0.627,0.285,-2.44,-0.477,0.435,-2.2]],p:[{t:'ouies',w:0.16,h:0.022,pas:0.05,k:'C',lueur:'g',pts:[[0.46,0.36,-2.408],[-0.46,0.36,-2.408]]}]},
 tuner:{vieux:1,p:[{t:'rond',r:0.105,ev:1.12,k:'c',dbl:1,k2:'C',lueur:'V',len:0.42,pts:[[0.42,0.33,-2.56]]}]},
 c_stratos:{p:[{t:'rond',r:0.056,k:'C',bague:0,len:0.45,bout:'x',pts:[[0.1,0.34,-2.097],[-0.1,0.34,-2.097]]}]},
 atchoum:{ote:[[0.33,0.21,-2.32,0.51,0.39,-1.9],[-0.51,0.21,-2.32,-0.33,0.39,-1.9],[0.9,0.22,-0.85,1.04,0.36,-0.27],[-1.04,0.22,-0.85,-0.9,0.36,-0.27]],p:[{t:'rond',r:0.056,ev:1.2,k:'x',kb:'x',lueur:'g',len:0.25,jeu:.008,jonc:.01,pts:[[0.97,0.47,-0.83,{ry:-1.5708}],[-0.97,0.47,-0.83,{ry:1.5708}]]}]}, // (2026-10-15, les pots encastrés « même les originales ») les sorties de stock-car sortent DROIT du flanc, devant la roue arrière, chacune dans son encoche ; `ote` retire le long tube que son gabarit faisait courir sous le bas de caisse (avant : un tube qui pendait dessous, l'embout en biais)
 origami:{p:[{t:'triangle',w:0.17,h:0.09,k:'a',lueur:'G',pts:[[0.52,0.47,-2.768],[-0.52,0.47,-2.768]]}]},
 rosso:{p:[{t:'rond',r:0.05,k:'C',dbl:1,k2:'c',pts:[[-0.15,0.4,-2.3],[0,0.4,-2.3],[0.15,0.4,-2.3]]}]},
 abstraite:{p:[{t:'rond',r:0.05,k:'s',kb:'o',len:0.08,lueur:'Y',pts:[[0.22,0.36,-2.22],[-0.22,0.36,-2.22]]}]},
 iceberg:{p:[{t:'cristal',r:0.055,pts:[[0.11,0.31,-2.2681],[-0.11,0.31,-2.3239]]}]},
 e_murduson:{p:[{t:'turbine',r:0.11,n:10,k:'C',kp:'b',aubes:6,lueur:'g',force:1,pts:[[0.48,0.45,-3],[-0.48,0.45,-3]]},{t:'turbine',r:0.235,n:12,k:'C',kp:'b',aubes:0,force:1,pts:[[0.7,0.66,-0.8],[-0.7,0.66,-0.8]]}]},
 e_feline:{p:[{t:'reel',r:0.034,k:'c',len:0.5,pts:[[0.06,0.27,-2.465],[-0.06,0.27,-2.465]]}]},
 b_trone:{p:[{t:'plaque',k:'o',w:0.56,h:0.22,x:0,y:0.46,z:-2.226},{t:'ovale',r:0.065,sx:1.4,sy:0.85,k:'C',dbl:1,k2:'o',pts:[[0,0.46,-2.269]]}]},
 c_spectre:{p:[{t:'fente',w:0.56,h:0.05,k:'s',lueur:'V',pts:[[0,0.4,-2.262]]}]},
 poptart:{ote:[[0.4,0.15,-1.06,0.56,0.32,-0.92],[-0.56,0.15,-1.06,-0.4,0.32,-0.92]],p:[{t:'pixel',a:0.1,pts:[[0.48,0.235,-1.045],[-0.48,0.235,-1.045]]}]},
 d_chevalier:{p:[{t:'turbine',r:0.205,n:12,k:'C',kp:'a',aubes:0,pts:[[0,0.8,-2.46]]}]},
 e_dragon:{p:[{t:'gueule',r:0.06,k:'o',ev:1.1,crocs:6,kc:'w',lueur:'g',pts:[[0.46,0.4,-2.41],[-0.46,0.4,-2.41]]}]},
 b_pizza:{p:[{t:'reel',r:0.034,k:'c',rx:0.45,len:0.25,pts:[[0.36,0.24,-1.845]]}]},
 bulle:{p:[{t:'rond',r:0.03,ev:1.45,k:'c',pts:[[-0.26,0.42,-2.185]]}]},
 combi:{p:[{t:'reel',r:0.032,k:'C',len:0.42,pts:[[0.32,0.31,-2.42],[-0.32,0.31,-2.42]]}]},
 dolores:{p:[{t:'rect',w:0.12,h:0.05,k:'a',e:0.012,pts:[[0.38,0.3,-2.17],[-0.38,0.3,-2.17]]}]},
 d_puce:{p:[{t:'reel',r:0.026,k:'c',pts:[[-0.045,0.22,-1.55],[0.045,0.22,-1.55],[-0.045,0.3,-1.55],[0.045,0.3,-1.55]]}]},
 b_groupeb:{p:[{t:'rond',r:0.058,k:'C',bague:0,len:0.5,bout:'x',ry:-0.45,pts:[[0.6,0.26,-2.1572]]}]},
 c_hotrod:{p:[{t:'reel',r:.034,k:'C',len:.30,jeu:.006,jonc:.006,pts:[[.32,.29,-1.81],[-.32,.29,-1.81]]}]}, // (2026-10-19, LE HOT ROD v2) deux sorties sous la poupe (les collecteurs du V8 courent sous la caisse ; les cheminées sont parties)
 a_mastodonte:{ote:[[0.47,0.42,-2.43,0.67,1.27,-1.74],[-0.67,0.42,-2.43,-0.47,1.27,-1.74]],p:[{t:'cheminee',h:1.35,r:0.075,k:'c',pts:[[0.8,1.62,-0.46],[-0.8,1.62,-0.46]]}]},
 poster:{p:[{t:'rect',w:0.19,h:0.085,k:'c',e:0.014,cloison:1,pts:[[0.4,0.38,-2.15],[-0.4,0.38,-2.15]]}]},
 requin:{p:[{t:'rond',r:0.07,k:'s',kb:'C',dbl:1,k2:'n',lueur:'G',len:0.4,pts:[[0.44,0.43,-2.12],[-0.44,0.43,-2.12]]}]},
 proto:{p:[{t:'cloche',r:0.24,k:'C',kb:'b',lueur:'g',n:12,pts:[[0.54,0.55,-3.4],[-0.54,0.55,-3.4]]}]},
 e_raie:{p:[{t:'sidepipe',r:0.045,k:'c',kb:'a',pts:[[0.8905,0.3,0.8,-0.78],[-0.8905,0.3,0.8,-0.78]]}]},
 a_eternelle:{p:[{t:'rond',r:0.04,k:'b',kb:'x',dbl:1,k2:'x',pts:[[-0.23,0.47,-2.349],[-0.08,0.47,-2.349],[0.08,0.47,-2.349],[0.23,0.47,-2.349]]}]},
 nuage:{p:[{t:'nuage',r:0.075,pts:[[0.46,0.42,-2.43],[-0.46,0.42,-2.43]]}]},
 lingot:{p:[{t:'rect',w:0.11,h:0.11,k:'o',e:0.018,pts:[[0.46,0.42,-2.56],[-0.46,0.42,-2.56]]}]},
 poupee:{p:[{t:'rond',r:0.045,k:'c',dbl:1,pts:[[0.52,0.40,-2.485],[0.63,0.40,-2.485],[-0.52,0.40,-2.485],[-0.63,0.40,-2.485]]}]}, // (2026-10-16) LA POUPÉE : les quatre sorties de la Cayenne, deux paires aux coins du diffuseur
 perle:{p:[{t:'fente',w:0.30,h:0.035,k:'s',lueur:'G',pts:[[0.42,0.33,-2.495],[-0.42,0.33,-2.495]]}]}, // (2026-10-16) LA PERLE : électrique — pas de pots, deux fentes qui luisent bleu au bas du diffuseur
};
/* ---- FIN DES POTS D'ÉCHAPPEMENT ---- */
/* LES MATIÈRES. La couleur vient des SOMMETS ; la matière ne dit que comment la surface répond.
   ⚠ `uGlow` : une part de la couleur rendue SANS lumière — le jeu se joue de nuit (hemi .40,
   expo .71), et sans ce plancher un jaune sort moutarde et un bleu roi sort noir.
   ⚠ LE CHROME NE SE FAIT PAS AU REFLET PUR : le ciel du jeu est nuit violette ; à 80 % de reflet,
   pare-chocs et jantes sortent en plomb. Presque-blanc + 45 % de ciel + plancher lumineux.
   ⚠ SPÉCULAIRE DE LAQUE LARGE (shininess bas) : une facette est un plan parfait, et un point chaud
   serré l'allume en entier d'un coup quand la caisse tourne. */
/* (2026-09-26) `v` = LE VERNIS de chaque matière (voir ENV_VERNIS) : [de face, en rasant, dureté, métal]. La laque passe de
   24 % de ciel PARTOUT à ~7 % de face / ~60 % en rasant : la couleur revient, le reflet court sur les pans qui fuient.
   Le verre devient SOMBRE de face et miroir couché. Le chrome et l'or reflètent le ciel TEINTÉ de leur métal. */
/* (2026-09-26, vague 2 « L'ENCRE ET L'OR ») LA LAQUE REDEVIENT UNE COULEUR. Mesuré au pixel en vue de POURSUITE (la caméra est à ~4,6 m
   derrière et 3,6 m au-dessus : elle voit toit, malle et flancs en rasant) : à [.3,2.6] le vernis montait à 62 % de ciel lavande sur les
   pans qui fuient, et le vert de L'ÉTALON sortait #77ab98 à midi (#467155 à l'atelier) — la couleur signature perdue 95 % du temps.
   Désormais [.25,1.5,3,.2] : le reflet rasant plafonne à ~36 %, et il est TEINTÉ à 20 % par la laque (un bonbon, pas un miroir gris).
   Le plancher lumineux `gl` .13 → .06 : il relevait les ombres d'un voile uniforme — c'est lui qui aplatissait les volumes. La nuit, la
   caisse garde sa lampe de carrosserie (carLight) : elle reste lisible sans ce voile. */
const LP_MAT={p:{sh:44,sp:0x4a4a4a,rf:.24,gl:.06,v:[.25,1.5,3,.2]},   // LAQUE
              c:{sh:140,sp:0xffffff,rf:.45,gl:.16,v:[1.25,2,2,1]},   // CHROME
              o:{sh:120,sp:0xffd488,rf:.30,gl:.12,v:[1.5,2.8,2,1]},  // OR
              s:{sh:22, sp:0x333333,rf:0,  gl:.10}, // CUIR, TOILE, SATINÉ
              m:{sh:10, sp:0x1c1c1c,rf:0,  gl:0},   // MAT : pneus, grilles, plastiques
              // (2026-09-26, vague 2) spéculaire du verre 0xffffff/160 → 0x5c5c5c/260 : la lampe de carrosserie (3 m au-dessus) allumait sur
              // la lunette arrière une BOULE blanche qui passait au bloom — une vitre qui ÉMET. Le reflet du ciel (et l'éclat du soleil, peint
              // dans le cube) reste : c'est lui qui fait la vitre.
              g:{sh:260,sp:0x5c5c5c,rf:.55,gl:.04,v:[.15,1.3,3,.35]}, // VERRE et laqué noir (vernis teinté : le reflet s'assombrit d'un tiers, la vitre reste une vitre)
              k:{sh:90, sp:0x8a8a8a,rf:.34,gl:.07,v:[.6,1.8,2.4,1]},   // (2026-10-14, passe graphismes · palette) MÉTALLISÉ : plus de reflet de face qu'une laque, reflet TEINTÉ À 100 % par la couleur comme le chrome et l'or (à 55 %, le ciel blanc-bleu éclaircissait un BORDEAUX 6c0e1e en fd213b : plus aucune teinte profonde) — même programme que p/c/o/g
              n:{sh:70, sp:0xfff4fa,rf:.30,gl:.12,v:[.4,2.6,1.6,.1]},   // (2026-10-14, passe graphismes · palette) NACRE : un voile de ciel LARGE et doux en rasant (courbe 1,6), à peine teinté — même programme
              f:{sh:34, sp:0x5c5c5c,rf:.12,gl:.32}};// FRUITS : vernis + plancher lumineux haut (lisibles de nuit) — (2026-09-26) reflet adouci : les grosses taches BLANCHES mangeaient les fruits redessinés — (vernis : aucun, les fruits ne sont pas des caisses)
function lpMat(g,ar){ // `ar` : (2026-10-20, FINITION STUDIO) une matière de CAISSE en finition studio (reflets qui éclatent, arêtes à l'essai) — voir finition.js
  if(typeof g==='string'&&g.indexOf('pm:')===0){const m=lpMat('p');try{motGreffe(m,g.slice(3));}catch(e){console.warn('motif',e);}return m;} // (2026-10-16) LA TÔLE À MOTIF : la laque, et le motif par-dessus (voir MOTIFS)
  if(g==='l'){const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});m.userData.lp=1;return m;}
  const P=LP_MAT[g]||LP_MAT.m;
  const m=new THREE.MeshPhongMaterial({vertexColors:true,shininess:P.sh,specular:P.sp,side:THREE.DoubleSide});
  if(P.rf>0){m.envMap=envTex;m.reflectivity=P.rf;m.combine=THREE.MixOperation;}
  const uG={value:P.gl},uV={value:new THREE.Vector4().fromArray(P.v||[1,1,1,0])},uC={value:g==='f'?0:1}, // uC : le contre-jour du liseré (voir RIM_GLSL) — pas sur les fruits
        uF={value:g==='g'?1:g==='c'||g==='o'?.6:g==='k'||g==='n'?.3:g==='m'?.05:g==='f'?0:.2}; // (2026-10-17) la part du REFLET DES FEUX par famille (voir FEU_U)
  if(ar){m.userData.arete=1;m.customProgramCacheKey=function(){return 'finArete|'+this.onBeforeCompile.toString();};} // un programme à part : les meubles de l'atelier (lpMat aussi) ne le voient pas
  m.onBeforeCompile=function(sh){
    if(ar&&FSTU.aretes){sh.uniforms.uArK=FSTU.uArK;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+FSTU_V).replace('#include <begin_vertex>','#include <begin_vertex>\n'+FSTU_VM);}
    sh.uniforms.uGlow=uG;sh.uniforms.uRimC=RIM_U.uRimC;sh.uniforms.uRimStr=RIM_U.uRimStr;sh.uniforms.uRimPow=RIM_U.uRimPow;sh.uniforms.uSunV=RIM_U.uSunV;
    sh.uniforms.uVern=uV;sh.uniforms.uCj=uC;sh.uniforms.uFvA=FEU_U.uFvA;sh.uniforms.uFvB=FEU_U.uFvB;sh.uniforms.uFvC=FEU_U.uFvC;sh.uniforms.uFvK=uF;
    sh.fragmentShader=sh.fragmentShader
      .replace('#include <common>','#include <common>\nuniform float uGlow;uniform vec3 uRimC;uniform vec3 uSunV;uniform float uRimStr;uniform float uRimPow;uniform vec4 uVern;uniform float uCj;\n'+FEU_GLSL)
      .replace('#include <envmap_fragment>',ENV_VERNIS).replace('#include <lights_fragment_begin>',LFB_CAISSE) // (tour 2) les lampes éteintes sautent (voir LFB_CAISSE)
      .replace('#include <dithering_fragment>',RIM_GLSL('uCj')+ // le liseré, contre-jour compris (voir RIM_GLSL)
        'gl_FragColor.rgb+=uRimC*rimF*uRimStr*.6+vColor*uGlow;\n'+FEU_APPEL+'#include <dithering_fragment>'); // (2026-10-17) + la lueur des feux arrière (voir FEU_U)
    if(ar){sh.uniforms.uStuHdr=FSTU.uHdr;sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+FSTU_HDR).replace('envColor.xyz*mix(vec3(1.),diffuseColor.rgb,uVern.w)','fstuHdr(envColor.xyz)*mix(vec3(1.),diffuseColor.rgb,uVern.w)');
      if(FSTU.aretes)sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+FSTU_F).replace('#include <dithering_fragment>',FSTU_FM+'#include <dithering_fragment>');}
  };
  m.userData.lp=1;m.userData.g=g;m.userData.uG=uG;m.userData.uV=uV;return m; // `g` : la famille de matière (le banc des laques y reconnaît la tôle) · `uG` : le plancher lumineux (l'atelier le relève pour ses meubles)
}
/* ===== LES FACETTES LARGES (2026-10-22, Léo : « les facettes scintillantes sont magnifiques mais certaines ont des facettes trop petites — la queue de canard, la dolce vita, la fidèle, la Mazda, le GMC… un peu trop réaliste : rends-les comme la Rosso, le hot rod, le shark, le trône central, en gardant le charme ; je ne veux pas que tu les changes, il faut juste traduire : des facettes plus larges, mieux calculées, pour éviter les amas de petits pixels de lumière ») =====
   Les caisses « au plan » posent une tranche tous les 2 à 8 cm (jusqu'à 170 tranches de 25 points) : chaque case de tôle ne mesure que 6 cm de côté et sa lumière
   devient un grain (un damier de petits points clairs sur l'aile et la portière). `lpLarges` RETAILLE la grille d'un loft sans toucher au dessin :
   · une rangée (une tranche) ne reste que si, ôtée, la tôle bouge de plus de `e` mètres par rapport à la droite tendue entre ses voisines — la facette
     s'allonge où la ligne est droite (pavillon, capot, flanc) et se resserre dans les courbes (nez, hanches, pare-brise) : « mieux calculées » ;
   · une colonne (un point de section) de même ; l'épaule, la ceinture, l'arête du toit, le plancher — là où la section plie — restent d'elles-mêmes ;
   · une rangée ou une colonne où la MATIÈRE change (`paint`) est toujours gardée : aucune arête de peinture ne se déplace ; les caps (le nez, la poupe) sont gardés.
   Rien n'est modifié dans les gabarits : `lpKit.loft` passe ici tout seul quand le gabarit est dans `LP_LARGES` (`K.forme` = son nom, posé par buildCar) ;
   les roues, les détails et les gabarits hors du tableau gardent leurs facettes. `?facettes=ancien` rend la grille d'avant ; `?fl=2` règle la tolérance
   à 2 cm pour toutes les caisses du tableau (banc) ; `dbgLarges()` lit ce qui a été retaillé (rangées et colonnes, avant → après). */
var FACETTES_LARGES=true,FL_FORCE=0;try{if(/[?&]facettes=ancien/.test(location.search))FACETTES_LARGES=false;const m9=/[?&]fl=([0-9.]+)/.exec(location.search);if(m9)FL_FORCE=+m9[1]/100;}catch(e){}
var LP_LARGES={ /* gabarit : {e : tolérance (m) · ec : tolérance des colonnes si autre · eo : tolérance vers l'EXTÉRIEUR (m, 4 mm) · fin : [d1 (m), coefficient, d2 (m)] tolérance × coefficient sur les d1 premiers mètres des deux bouts, rampe jusqu'à d2 (0 = non) · hi : [hauteur (m) ou null, tolérance (m)] au-dessus de cette hauteur, dans la cabine (les vitres : la découpe y est exigeante), la tolérance ne dépasse pas la valeur — 0 : la cabine garde toutes ses tranches (hi:0 = aucune protection) · col : [indices de colonnes à garder : une arête de couleur dessinée à la main] · L : longueur maximale d'une facette (m)} */
  /* (23/10) VIDE EN LIGNE : seule La Fidèle change (par ses couches), les autres caisses gardent leurs facettes tant que Léo n'a pas dit oui — le banc les règle à chaud (dbgLarges) */};
var LP_LARGES_BILAN={};
function lpLarges(zs,sec,paint,o){
  const M=zs.length,N=sec[0].length;if(M<6||N<5)return null;
  for(const s of sec)if(s.length!==N)return null;   /* (un loft dont les sections n'ont pas toutes le même nombre de points : on n'y touche pas) */
  let yMax=0;for(const s of sec)for(const q of s)if(q[1]>yMax)yMax=q[1];
  const e=FL_FORCE||o.e,eC=FL_FORCE||o.ec||e,Lmax=o.L||.6,z0=zs[0],z1=zs[M-1],
    fin=o.fin===0?null:o.fin||[.45,.2,.9],                          /* (les bouts : les 45 cm du nez et de la poupe à 20 % de la tolérance, puis la rampe jusqu'à 90 cm) */
    yH=o.hi===0?1e9:o.hi&&o.hi[0]!=null?o.hi[0]:.62*yMax,eH=o.hi&&o.hi[1]!=null?o.hi[1]:.012;     /* (la cabine : au-dessus de 62 % de la hauteur, la tolérance ne dépasse pas 1,2 cm) */
  const eo=o.eo||Math.min(e,.01);   /* (la tolérance vers l'EXTÉRIEUR : 1 cm au plus — la tôle retaillée ne déborde jamais de plus de 1 cm de la vraie, aucune pièce posée dessus, essuie-glaces, lamelles, optiques, ne s'enterre ; vers l'intérieur elle peut rentrer jusqu'à `e`) */
  const nrm=sec.map(s=>s.map((q,j)=>{const a=s[Math.max(0,j-1)],b=s[Math.min(N-1,j+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.sqrt(dx*dx+dy*dy);return l>1e-9?[dy/l,-dx/l]:[0,0];}));   /* (la normale SORTANTE de la demi-section : à droite du sens de marche, du dessous vers le toit) */
  const tolZ=z=>{if(!fin)return 1;const d=Math.min(z-z0,z1-z);return d<=fin[0]?fin[1]:d>=fin[2]?1:fin[1]+(1-fin[1])*(d-fin[0])/(fin[2]-fin[0]);};   /* (nez et poupe : c'est là que les phares, la calandre et les feux, découpés dans la tôle, s'appuient sur ses facettes) */
  const cab=[];for(let i=0;i<M;i++){let t=0;for(const q of sec[i])if(q[1]>t)t=q[1];cab.push(t>yH+.2);}   /* (les tranches de la CABINE : leur haut dépasse la ceinture de 20 cm — le capot et la malle n'en sont pas) */
  const cabM=cab.map((c,i)=>{if(c)return true;for(let k=i-1;k>=0&&zs[i]-zs[k]<.15;k--)if(cab[k])return true;for(let k=i+1;k<M&&zs[k]-zs[i]<.15;k++)if(cab[k])return true;return false;});
  const tolY=(y,i)=>y>yH&&cabM[i]?Math.min(1,eH/e):1;   /* (au-dessus de `hi`, dans la cabine seulement — les vitres, les montants, le pavillon, dont la découpe en dépend — la tolérance ne dépasse pas `eH`) */
  // la CLÉ DE PEINTURE de chaque case d'origine (rangée i entre les tranches i et i+1, colonne j entre les points j et j+1)
  const K0=[];for(let i=0;i<M-1;i++){const A=sec[i],C=sec[i+1],r=[];
    for(let j=0;j<N-1;j++){const a=A[j],b=A[j+1],c=C[j+1],d=C[j];r.push(paint(j,(zs[i]+zs[i+1])/2,(a[1]+b[1]+c[1]+d[1])/4,(a[0]+b[0]+c[0]+d[0])/4));}K0.push(r);}
  const crit=new Array(M).fill(false);   /* (une tranche où une matière change de l'une à l'autre case : sa frontière doit rester là) */
  for(let i=1;i<M-1;i++)for(let j=0;j<N-1;j++)if(K0[i-1][j]!==K0[i][j]){crit[i]=true;break;}
  // ---- LES RANGÉES : coupe récursive (Douglas-Peucker) de la suite des sections, l'écart se lit sur le point de section qui bouge le plus
  const garde=new Array(M).fill(false);garde[0]=garde[M-1]=true;
  const ecart=(a,b,i)=>{const t=(zs[i]-zs[a])/((zs[b]-zs[a])||1),A=sec[a],B=sec[b],C=sec[i],kz=tolZ(zs[i]);let m=0;   /* (l'écart de chaque point est rapporté à SA tolérance : 1 = la limite) */
    for(let j=0;j<N;j++){const dx=C[j][0]-(A[j][0]+(B[j][0]-A[j][0])*t),dy=C[j][1]-(A[j][1]+(B[j][1]-A[j][1])*t),n=nrm[i][j],sg=dx*n[0]+dy*n[1],   /* sg > 0 : la tôle retaillée rentre ; sg < 0 : elle déborde */
        d=sg>=0?sg/(e*kz*tolY(C[j][1],i)):-sg/(eo*kz);if(d>m)m=d;}return m;};
  const coupe=(a,b)=>{if(b-a<2)return;let bi=-1,bd=-1;
    for(let i=a+1;i<b;i++){if(crit[i]){bi=i;bd=1e9;break;}const d=ecart(a,b,i);if(d>bd){bd=d;bi=i;}}
    if(bd>1||zs[b]-zs[a]>Lmax){garde[bi]=true;coupe(a,bi);coupe(bi,b);}};
  coupe(0,M-1);
  const rows=[];for(let i=0;i<M;i++)if(garde[i])rows.push(i);
  // ---- LES COLONNES : on retire, une à une, celle qui coûte le moins, tant que la tôle reste à `eC` près et que la matière est la même des deux côtés
  const seg=(P,A,B,n)=>{const dx=B[0]-A[0],dy=B[1]-A[1],l2=dx*dx+dy*dy;let t=l2>1e-12?((P[0]-A[0])*dx+(P[1]-A[1])*dy)/l2:0;t=t<0?0:t>1?1:t;
    const ex=P[0]-A[0]-t*dx,ey=P[1]-A[1]-t*dy;return ex*n[0]+ey*n[1];};   /* (l'écart du point P à la corde AB, lu sur la normale sortante n : > 0 la corde rentre, < 0 elle déborde) */
  const meme=(l,r)=>{for(let q=0;q+1<rows.length;q++){const k0=K0[rows[q]][l];for(let j=l+1;j<r;j++)if(K0[rows[q]][j]!==k0)return false;}return true;};
  const cout=(l,r)=>{let m=0;for(let k=l+1;k<r;k++)for(const i of rows){const sg=seg(sec[i][k],sec[i][l],sec[i][r],nrm[i][k]),kz=tolZ(zs[i]),d=sg>=0?sg/(eC*kz*tolY(sec[i][k][1],i)):-sg/(eo*kz);if(d>m)m=d;}return m;};   /* (rapporté à la tolérance du point : 1 = la limite) */
  const tient=o.col||[];
  const cols=[];for(let j=0;j<N;j++)cols.push(j);
  for(;;){let bc=-1,bv=1e9;
    for(let c=1;c<cols.length-1;c++){if(tient.indexOf(cols[c])>=0)continue;const l=cols[c-1],r=cols[c+1];if(!meme(l,r))continue;const v=cout(l,r);if(v<=1&&v<bv){bv=v;bc=c;}}
    if(bc<0)break;cols.splice(bc,1);}
  return {zs:rows.map(i=>zs[i]),sec:rows.map(i=>cols.map(k=>sec[i][k])),
          paint:(j,z,y,x)=>j<0?paint(j,z,y,x):paint(cols[j],z,y,x),   /* (la bande j de la nouvelle grille porte la clé de la bande d'origine qu'elle commence) */
          bilan:[M,N,rows.length,cols.length]};
}
/* LA MÊME RETAILLE POUR LES CAISSES EN GRILLE (le Caïd, le Combi : `G[c][j]` = le point [x, y, z] de la colonne c — le long de la caisse — et de la rangée j —
   la hauteur). Une rangée ou une colonne ne reste que si, ôtée, ses points bougent de plus de `e` mètres par rapport à la droite tendue entre ses voisines
   (distance du point à la corde, en 3D) ; `jtient` : les rangées à garder (le dessous, repéré par son indice), `ctient(c)` : les colonnes à garder (le nez et la
   poupe, où la découpe au plan s'appuie sur la tôle). Rend {G, js, cs} : la grille retaillée et les indices d'origine des rangées et des colonnes gardées. */
var LP_GRILLES={};   /* (vide en ligne, voir LP_LARGES) */
function lpGrilleLarge(G,o){
  const NC=G.length,NR=G[0].length,e=FL_FORCE||o.e;if(NC<4||NR<4)return null;
  const d3=(P,A,B)=>{const dx=B[0]-A[0],dy=B[1]-A[1],dz=B[2]-A[2],l2=dx*dx+dy*dy+dz*dz;let t=l2>1e-12?((P[0]-A[0])*dx+(P[1]-A[1])*dy+(P[2]-A[2])*dz)/l2:0;t=t<0?0:t>1?1:t;
    const ex=P[0]-A[0]-t*dx,ey=P[1]-A[1]-t*dy,ez=P[2]-A[2]-t*dz;return Math.sqrt(ex*ex+ey*ey+ez*ez);};
  const gj=new Array(NR).fill(false),gc=new Array(NC).fill(false);gj[0]=gj[NR-1]=gc[0]=gc[NC-1]=true;
  for(const j of o.jtient||[])if(j<NR)gj[j]=true;
  if(o.ctient)for(let c=0;c<NC;c++)if(o.ctient(c))gc[c]=true;
  const rj=(a,b)=>{if(b-a<2)return;let bi=-1,bd=-1;
    for(let j=a+1;j<b;j++){if(gj[j]){bi=j;bd=1e9;break;}let m=0;for(let c=0;c<NC;c++){const d=d3(G[c][j],G[c][a],G[c][b]);if(d>m)m=d;}if(m>bd){bd=m;bi=j;}}
    if(bd>e){gj[bi]=true;rj(a,bi);rj(bi,b);}};
  rj(0,NR-1);
  const js=[];for(let j=0;j<NR;j++)if(gj[j])js.push(j);
  const cc=(a,b)=>{if(b-a<2)return;let bi=-1,bd=-1;
    for(let c=a+1;c<b;c++){if(gc[c]){bi=c;bd=1e9;break;}let m=0;for(const j of js){const d=d3(G[c][j],G[a][j],G[b][j]);if(d>m)m=d;}if(m>bd){bd=m;bi=c;}}
    if(bd>e){gc[bi]=true;cc(a,bi);cc(bi,b);}};
  cc(0,NC-1);
  const cs=[];for(let c=0;c<NC;c++)if(gc[c])cs.push(c);
  return {G:cs.map(c=>js.map(j=>G[c][j])),js:js,cs:cs,bilan:[NC,NR,cs.length,js.length]};
}
window.dbgLarges=function(o){if(o)for(const k in o){const T=k.charAt(0)==='_'?LP_GRILLES:LP_LARGES,n=k.charAt(0)==='_'?k.slice(1):k;if(o[k]===null)delete T[n];else T[n]=o[k];}   /* (« _caid » règle la grille du Caïd) */   /* (banc : dbgLarges({corolla:{e:.03,hi:[.9,.4]}}) règle à chaud, puis refaire la caisse) */
  return {actif:FACETTES_LARGES,force:FL_FORCE,bilan:LP_LARGES_BILAN,gabarits:LP_LARGES,grilles:LP_GRILLES};};
/* L'ATELIER. `pal` : clé → {g: matière, c: couleur, f: 0 pour couper le fondu vertical}.
   Toutes les pièces sont versées dans des tampons par matière, à facettes (non indexé) ; `done()`
   rend {matière: BufferGeometry} avec des normales PAR FACE. */
function lpKit(pal){
  const B={},col=new THREE.Color(),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),
        V1=new THREE.Vector3(),V2=new THREE.Vector3();
  // LE FONDU VERTICAL de la laque : le bas de caisse un ton plus sombre que les pans hauts. C'est
  // l'éclairage de studio des jeux de voitures — il pose la caisse au sol sans une ombre de plus.
  const fondu=y=>.80+.20*LPU.cl((y-.25)/1.0,0,1);
  const tri=(k,a,b,c)=>{
    const e=pal[k];if(!e)return;
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
    if(nx*nx+ny*ny+nz*nz<1e-12)return;                     // facette dégénérée (section qui se referme)
    const t=B[e.g]||(B[e.g]={P:[],C:[]});col.setHex(e.c);
    for(const p of [a,b,c]){t.P.push(p[0],p[1],p[2]);if(e.grad)lpGrad(e.grad,p[1],col); // PEINTURE en dégradé : une couleur par sommet
      const s=((e.g==='p'||e.g.charAt(0)==='p')&&e.f!==0)?fondu(p[1]):1;t.C.push(col.r*s,col.g*s,col.b*s);} // ('pm:…' : la tôle à motif garde son fondu)
  };
  const put=(k,g,x,y,z,rx,ry,rz,sx,sy,sz)=>{               // verse une géométrie THREE, posée et tournée
    if(g.type==='CylinderGeometry'&&Math.abs(Math.abs(rx||0)-Math.PI/2)<.05&&!ry&&!rz&&K.prims){ // (pots) un cylindre COUCHÉ dans l'axe par rotation
      const q=g.parameters,h=q.height*(sy||1);K.prims.push({t:'cyl',g:pal[k]?pal[k].g:null,c:pal[k]?pal[k].c:null,r:Math.max(q.radiusTop,q.radiusBottom)*Math.max(sx||1,sz||1),z0:(z||0)-h/2,z1:(z||0)+h/2,x:x||0,y:y||0,z:z||0,ax:'z'});}
    E.set(rx||0,ry||0,rz||0);Q.setFromEuler(E);V1.set(x||0,y||0,z||0);V2.set(sx||1,sy||1,sz||1);
    M.compose(V1,Q,V2);
    const gg=g.index?g.toNonIndexed():g;gg.applyMatrix4(M);
    const p=gg.attributes.position.array,flip=(V2.x*V2.y*V2.z)<0;
    for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],b=[p[i+3],p[i+4],p[i+5]],c=[p[i+6],p[i+7],p[i+8]];
      if(flip)tri(k,a,c,b);else tri(k,a,b,c);}
    gg.dispose();if(gg!==g)g.dispose();
  };
  const prims=[],gOf=k=>pal[k]?pal[k].g:null,cOf=k=>pal[k]?pal[k].c:null; // (2026-09-26) le RELEVÉ des pièces simples : buildCar y retrouve les POTS d'échappement
  const K={
    tri:tri,put:put,prims:prims,
    box(k,w,h,d,x,y,z,rx,ry,rz){prims.push({t:'box',g:gOf(k),c:cOf(k),w:w,h:h,d:d,x:x||0,y:y||0,z:z||0,rot:!!(rx||ry||rz)});put(k,new THREE.BoxGeometry(w,h,d),x,y,z,rx,ry,rz);},
    // cylindre (ou cône si r2) à `n` pans, couché selon `ax` ('x','y','z')
    cyl(k,r,len,n,x,y,z,ax,r2){prims.push({t:'cyl',g:gOf(k),c:cOf(k),r:Math.max(r,r2!=null?r2:r),z0:(z||0)-len/2,z1:(z||0)+len/2,x:x||0,y:y||0,z:z||0,ax:ax||'y'});
      const g=new THREE.CylinderGeometry(r2!=null?r2:r,r,len,n||8);
      if(ax==='x')g.rotateZ(-Math.PI/2);else if(ax==='z')g.rotateX(Math.PI/2);put(k,g,x,y,z);},
    // tour : points [rayon, position le long de l'axe], révolution à `n` pans autour de `ax`
    lathe(k,pts,n,x,y,z,ax){let rm=0,a0=1e9,a1=-1e9;for(const p of pts){rm=Math.max(rm,p[0]);a0=Math.min(a0,p[1]);a1=Math.max(a1,p[1]);}
      prims.push({t:'lathe',g:gOf(k),c:cOf(k),r:rm,z0:(z||0)+a0,z1:(z||0)+a1,x:x||0,y:y||0,z:z||0,ax:ax||'y'});
      const g=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),n||12);
      if(ax==='x')g.rotateZ(-Math.PI/2);else if(ax==='z')g.rotateX(Math.PI/2);put(k,g,x,y,z);},
    // prisme : un contour de PROFIL [z,y] extrudé sur `wid` en X, centré sur `x` (ailerons, dérives, lames)
    prism(k,pts,wid,x,rx,ry,rz){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);
      for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);
      const g=new THREE.ExtrudeGeometry(s,{depth:wid,bevelEnabled:false});
      g.rotateY(-Math.PI/2);g.translate(wid/2,0,0);put(k,g,x,0,0,rx,ry,rz);},
    // plaque : un contour de FACE [x,y] extrudé sur `ep` vers +Z, posé en z (calandres, feux, bandeaux)
    plate(k,pts,ep,z){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);
      for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);
      put(k,new THREE.ExtrudeGeometry(s,{depth:ep,bevelEnabled:false}),0,0,z);},
    sym(fn){fn(1);fn(-1);},
    /* LE LOFT. `zs` : stations croissantes (de la poupe au nez). `S(z)` : demi-section, points [x,y]
       du bas-centre au haut-centre, TOUJOURS le même nombre. `paint(j,z,y,x)` : clé de la facette —
       j = n° de bande (0 = plancher … N-2 = toit), −1 bouchon avant, −2 bouchon arrière. */
    loft(zs,S,paint){
      let sec=zs.map(z=>S(z)),N=sec[0].length;
      const lg=FACETTES_LARGES&&K.forme&&LP_LARGES[K.forme];   /* (2026-10-22, les facettes larges : la grille retaillée, le dessin intact — voir facettes-larges.js) */
      if(lg){const r=lpLarges(zs,sec,paint,lg);if(r){zs=r.zs;sec=r.sec;paint=r.paint;N=sec[0].length;(LP_LARGES_BILAN[K.forme]||(LP_LARGES_BILAN[K.forme]=[])).push(r.bilan);}}
      for(let i=0;i<zs.length-1;i++){const z0=zs[i],z1=zs[i+1],A=sec[i],C=sec[i+1];
        for(let j=0;j<N-1;j++){const a=A[j],b=A[j+1],c=C[j+1],d=C[j];
          const k=paint(j,(z0+z1)/2,(a[1]+b[1]+c[1]+d[1])/4,(a[0]+b[0]+c[0]+d[0])/4);
          tri(k,[a[0],a[1],z0],[b[0],b[1],z0],[c[0],c[1],z1]);tri(k,[a[0],a[1],z0],[c[0],c[1],z1],[d[0],d[1],z1]);
          tri(k,[-a[0],a[1],z0],[-c[0],c[1],z1],[-b[0],b[1],z0]);tri(k,[-a[0],a[1],z0],[-d[0],d[1],z1],[-c[0],c[1],z1]);}}
      for(const [s9,z,dir] of [[sec[0],zs[0],-1],[sec[sec.length-1],zs[zs.length-1],1]]){
        const ct=[];for(let j=0;j<N;j++)ct.push(new THREE.Vector2(s9[j][0],s9[j][1]));
        for(let j=N-2;j>=1;j--)ct.push(new THREE.Vector2(-s9[j][0],s9[j][1]));
        for(const f of THREE.ShapeUtils.triangulateShape(ct,[])){
          let a=ct[f[0]],b=ct[f[1]],c=ct[f[2]];
          if((((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))>0)!==(dir>0)){const t=b;b=c;c=t;}
          tri(paint(dir>0?-1:-2,z,(a.y+b.y+c.y)/3,(a.x+b.x+c.x)/3),[a.x,a.y,z],[b.x,b.y,z],[c.x,c.y,z]);}
      }
    },
    done(){const out={};
      for(const g in B){const geo=new THREE.BufferGeometry();
        geo.setAttribute('position',new THREE.Float32BufferAttribute(B[g].P,3));
        geo.setAttribute('color',new THREE.Float32BufferAttribute(B[g].C,3));
        geo.computeVertexNormals();out[g]=geo;}           // non indexé → une normale PAR FACE : les facettes
      return out;}
  };
  return K;
}
/* L'OMBRE CUITE (2026-09-26, vague 2 « L'ENCRE ET L'OR ») — les caisses du kit se lisaient comme des BOÎTES uniformes : aucune occlusion,
   le bas de caisse aussi clair que le toit, la caisse flottait sur le bitume. On cuit une fois, à la construction, une occlusion dans la
   couleur des sommets : le bas s'enfonce dans l'ENCRE (#1c0430 — la couleur de toute ombre du jeu), les pans hauts gardent leur laque.
   Ce n'est pas un gris : l'encre est une multiplication TEINTÉE (le vert s'éteint plus vite que le rouge et le bleu) — une orange
   s'assombrit vers le brun-pourpre, un vert vers le canard, jamais vers la boue. Zéro coût en course (des sommets, déjà là), zéro
   programme de plus. Ni les feux (ils émettent), ni les roues (elles tournent : une ombre cuite tournerait avec elles).
   `H` = la hauteur de la caisse ; l'ombre vit dans ses 55 % du bas. */
const LP_OMBRE=[.60,.50,.72]; // l'encre en MULTIPLICATION (r, g, b) au ras du sol — #1c0430 éclairci pour rester une teinte, pas un trou
function lpOmbre(geo,H){
  const p=geo.attributes.position.array,c=geo.attributes.color.array,h=Math.max(.45,H*.55);
  for(let i=0;i<p.length;i+=3){
    const u=Math.min(1,Math.max(0,p[i+1]/h)),t=u*u*(3-2*u);                          // 0 au sol → 1 à 55 % de la hauteur
    c[i]*=LP_OMBRE[0]+(1-LP_OMBRE[0])*t;c[i+1]*=LP_OMBRE[1]+(1-LP_OMBRE[1])*t;c[i+2]*=LP_OMBRE[2]+(1-LP_OMBRE[2])*t;}
  geo.attributes.color.needsUpdate=true;
}
/* LES ROUES, façon Rocket League : un pneu GROS et facetté (16 pans, épaules chanfreinées), une
   jante dessinée sur la face EXTÉRIEURE (+X) — les roues de gauche sont posées en miroir.
   Styles : 'rayons' (n branches), 'multi' (rayons fins et nombreux), 'cadran' (disque percé),
   'enjoliveur' (dôme chromé), 'plis' (flasque plié en étoile). `blanc` = flanc blanc, `crampons` = pavés de tout-terrain. */
var ROUES_VRAIES=true;try{if(/[?&]roues=ancien/.test(location.search))ROUES_VRAIES=false;}catch(e){} // (2026-10-19, Léo : « applique la correction des jantes à toutes les voitures ») EN MARCHE ; `?roues=ancien` = l'ancien dessin // (2026-10-19) la correction GLOBALE des rayons (voir crW), ÉTEINTE : Léo décide
window.dbgRoues=function(on){if(on!=null){ROUES_VRAIES=!!on;try{buildCar(CARS[equippedCar()]);}catch(e){return e.message;}}return ROUES_VRAIES;};
function lpWheel(o){
  if(o.style==='nyan')return {}; // (2026-10-08) le chat pop-tart dessine ses roues lui-même (voir « LES ROUES PIXEL » dans son gabarit) : ici, des moyeux VIDES qui portent l'angle
  // (2026-10-19) la correction GLOBALE (ROUES_VRAIES) sur une fiche qui ne demande rien : des branches couleur `accent` trop sombre se perdraient sur le
  // fond sombre (l'anneau se lisait contre la lèvre, une branche non) → l'accent sombre s'éclaircit vers la jante. Sans la correction : rien ne change.
  let acc=o.accent||0xe6e9ee;
  if(ROUES_VRAIES&&!o.branches&&!o.creux&&o.branches!==0&&o.style!=='multi'&&o.style!=='cadran'&&o.style!=='enjoliveur'&&o.style!=='plis'){
    const lu=h=>(.3*(h>>16&255)+.59*(h>>8&255)+.11*(h&255))/255,j=o.jante||0xe6e9ee;
    if(lu(acc)<.25){const m=(x,y)=>Math.round(x+(y-x)*.55);acc=(m(acc>>16&255,j>>16&255)<<16)|(m(acc>>8&255,j>>8&255)<<8)|m(acc&255,j&255);}}
  const R=o.R,hw=o.w/2,K=lpKit({k:{g:'m',c:o.pneu||0x16171a},w:{g:'s',c:0xf4f1ea},
    c:{g:'c',c:o.jante||0xe6e9ee},d:{g:'m',c:o.fond||0x1b1c21},o:{g:'o',c:0xffc24a},a:{g:'p',c:acc,f:0},b:{g:'p',c:o.bande||0xffffff,f:0}});
  if(!o.sansPneu)K.lathe('k',[[R*.64,-hw],[R*.88,-hw],[R,-hw*.55],[R,hw*.55],[R*.88,hw],[R*.64,hw]],16,0,0,0,'x'); // `sansPneu` : le gabarit pose le sien (`roueDeco`)
  if(o.crampons)for(let i=0;i<14;i++){const a=i/14*Math.PI*2;
    K.box('k',o.w*.84,.05,.11,0,Math.sin(a)*R,Math.cos(a)*R,Math.PI/2-a);}
  if(o.bande&&!o.sansPneu)K.lathe('b',[[R+.004,-hw*.16],[R+.004,hw*.16]],16,0,0,0,'x'); // (2026-10-08, SQUALE) une BANDE claire au milieu de la bande de roulement : vue d'en dessous, la roue se lit
  const fx0=hw-.035,FACES=o.deux?[1,-1]:[1];                 // le plan de la jante, en retrait du pneu
  // la profondeur des VRAIES BRANCHES (0 = l'ancien dessin) : `creux` (BOÎTES : jusqu'à 60 % de la demi-largeur — au-delà de 4 cm le fond recule
  // d'autant) ou `branches` (JAPONAISES : 4 cm) ; ou, pour les styles à rayons qui ne disent rien, la correction GLOBALE `ROUES_VRAIES` (éteinte :
  // `?roues=vraies`, `dbgRoues(1)`) — `branches:0` dans une fiche la refuse pour elle
  const crW=o.creux?Math.min(o.creux,hw*.6):(o.style==='cadran'||o.style==='enjoliveur'||o.style==='plis')?0:(o.branches||(ROUES_VRAIES&&o.branches!==0))?.04:0,
        fdd=Math.max(0,crW-.04);
  // (2026-10-08, SQUALE) `deux` : la roue du MILIEU, qu'on voit des deux côtés — un tambour FERMÉ et une jante sur CHAQUE face (miroir en x)
  if(o.deux)K.lathe('d',[[0,-(fx0-.05)],[R*.64,-(fx0-.05)],[R*.64,fx0-.05],[0,fx0-.05]],16,0,0,0,'x');
  else K.lathe('d',[[R*.64,-hw+.02],[R*.64,fx0-.05-fdd],[0,fx0-.05-fdd]],16,0,0,0,'x'); // fût + fond sombre (il recule derrière une jante creusée de plus de 4 cm)
  for(const e of FACES){const fx=e*fx0;
  if(o.blanc)K.lathe('w',[[R*.70,e*(hw+.004)],[R*.86,e*(hw+.004)]],16,0,0,0,'x');
  if(o.style==='cadran'){
    K.lathe('c',[[R*.64,fx],[0,fx]],16,0,0,0,'x');
    for(let h=0;h<5;h++){const a=h/5*Math.PI*2;K.cyl('d',R*.13,.012,8,fx+e*.004,Math.sin(a)*R*.40,Math.cos(a)*R*.40,'x');}
  }else if(o.style==='enjoliveur'&&o.chapeau){ // (2026-10-19, le HOT ROD) `chapeau:c` : la JANTE TÔLE peinte (`fond`), l'anneau poli au bord et un petit
    // enjoliveur au moyeu (c × le rayon de la jante) — sans l'option, le dôme couvre toute la face (inchangé)
    const c=o.chapeau,rc=R*.64*c;
    K.lathe('d',[[R*.64,fx],[R*.58,fx+e*.004],[rc,fx+e*.012]],16,0,0,0,'x');                        // la tôle peinte, en léger cône
    K.lathe('c',[[R*.64,fx+e*.002],[R*.60,fx+e*.007]],16,0,0,0,'x');                                // l'anneau poli
    K.lathe('c',[[rc,fx+e*.012],[rc*.80,fx+e*.03],[rc*.40,fx+e*.05],[0,fx+e*.054]],16,0,0,0,'x');    // le chapeau chromé
    K.cyl('o',rc*.22,.02,8,fx+e*.058,0,0,'x');
  }else if(o.style==='enjoliveur'){
    K.lathe('c',[[R*.64,fx],[R*.52,fx+e*.025],[R*.24,fx+e*.055],[0,fx+e*.06]],16,0,0,0,'x');
    K.cyl('o',R*.13,.02,8,fx+e*.064,0,0,'x');
  }else if(o.style==='plis'){
    // (2026-10-02, L'ORIGAMI) LE FLASQUE PLIÉ : un disque plein, `n` plis en étoile — une crête, un creux, et chaque pan attrape SA
    // lumière (un pan sur deux en `jante`, l'autre en `accent` : la roue qui tourne se lit). Les pointes débordent sur le flanc du pneu.
    // ⚠ rien ne dépasse fx + 0,022 : le flou de jante (voir ROUES.flou) se pose à fx + 0,024, par-dessus.
    const n=o.n||7,N=n*2,r=R*.64,ct=[fx+e*.012,0,0],pt=(a,rr,x)=>[x,Math.sin(a)*rr,Math.cos(a)*rr];
    for(let s=0;s<N;s++){const a0=s/N*Math.PI*2,a1=(s+1)/N*Math.PI*2;
      K.tri(s%2?'a':'c',ct,pt(a0,r,s%2?fx-e*.006:fx+e*.02),pt(a1,r,s%2?fx+e*.02:fx-e*.006));}
    for(let s=0;s<n;s++){const a=s/n*Math.PI*2,d=Math.PI/N*.62;
      K.tri('a',pt(a-d,R*.655,e*(hw+.004)),pt(a+d,R*.655,e*(hw+.004)),pt(a,R*.85,e*(hw+.004)));}
    K.cyl('d',R*.10,.012,7,fx+e*.016,0,0,'x');                                // le cache-moyeu
  }else{
    const n=o.n||5,multi=o.style==='multi';
    if(crW){ /* (2026-10-19) LES VRAIES BRANCHES — UN SEUL outil pour `creux` (BOÎTES, « des jantes en disques plats » : la jante CREUSÉE) et
       `branches` (JAPONAISES, = un creux de 4 cm) : la lèvre plonge, chaque rayon est une ARÊTE (deux pans qui prennent chacun leur lumière) qui
       descend, LE LONG du rayon, du bord vers le moyeu enfoncé. Mêmes matières : 0 programme de plus. */
      K.lathe('c',[[R*.64,fx],[R*.60,fx-e*crW*.3],[R*.55,fx-e*crW*.45]],16,0,0,0,'x');
      const k=multi?'c':'a',x1=fx-e*crW*.45,x0=fx-e*crW,r0=R*.17,r1=R*.57,w0=R*(multi?.036:.06),w1=R*(multi?.055:.09),hz=.014,
        T=(A,B,C)=>{const nx=(B[1]-A[1])*(C[2]-A[2])-(B[2]-A[2])*(C[1]-A[1]);if(nx*e<0)K.tri(k,A,C,B);else K.tri(k,A,B,C);};
      for(let s=0;s<n;s++){const a=s/n*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),Q=(r,t,x)=>[x,sa*r+ca*t,ca*r-sa*t],
        A=Q(r0,-w0,x0),B=Q(r1,-w1,x1),C=Q(r1,w1,x1),D=Q(r0,w0,x0),M0=Q(r0,0,x0+e*hz),M1=Q(r1,0,x1+e*hz);
        T(A,B,M1);T(A,M1,M0);T(M0,M1,C);T(M0,C,D);}
    }else{
    // ⚠ l'ancien dessin : les planches sont posées EN TRAVERS du rayon (rotation −a : la longueur part en tangente) — les n planches font un ANNEAU à
    // n pans, aucune branche ne part du moyeu (les « disques à cercles »). Gardé tel quel : toute caisse qui ne demande rien ne change pas.
    K.lathe('c',[[R*.64,fx],[R*.55,fx]],16,0,0,0,'x');                     // la lèvre
    for(let s=0;s<n;s++){const a=s/n*Math.PI*2;
      K.box(multi?'c':'a',.03,R*.46,multi?R*.07:R*.13,fx-e*.012,Math.sin(a)*R*.33,Math.cos(a)*R*.33,-a);}}
  }
  if(o.style!=='enjoliveur'&&o.style!=='plis')K.cyl('c',R*.16,.05,8,fx-e*(crW?crW+.012:.01),0,0,'x'); // le moyeu (enfoncé dans la jante creusée)
  if(o.ecrous&&crW)for(let i=0;i<o.ecrous;i++){const a=i/o.ecrous*Math.PI*2+.3;K.cyl('c',R*.028,.024,6,fx-e*(crW-.02),Math.sin(a)*R*.10,Math.cos(a)*R*.10,'x');} // (19/10, BOÎTES) les ÉCROUS sur le moyeu
  if(o.pique&&e>0){K.cyl('c',R*.15,.14,6,fx+.07,0,0,'x',R*.07);K.cyl('w',R*.07,.12,6,fx+.20,0,0,'x',.004);} // (2026-10-16, LE BLINDÉ NOIR) LE PIC DE MOYEU : le char de Ben-Hur — dans l'axe, il ne tourne pas à l'œil
  }
  return K.done();
}
/* LA HONTE, UN CRAN PLUS BELLE (2026-10-15, Léo : « un tout petit plus de détail au niveau de la brillance et de la texture de sa
   carcasse ; si tu y arrives, plus de définition ; des roues refaites, plus réalistes »). Sa silhouette de boîtes ne bouge pas ; ses
   tôles deviennent des BOÎTES USÉES (boiteUsee) : les arêtes CHANFREINÉES (une facette de 3 cm où court le reflet), les grandes faces
   CABOSSÉES par facettes (des creux de quelques millimètres, rien ne dépasse), et une couleur PAR FACETTE, multipliée par la peinture —
   la laque marbrée, la crasse du bas, des plaques de rouille (plus souvent en bas), la poussière sur ce qui regarde le ciel, l'arête usée
   plus claire. Tout reste à facettes (normales par face : la DA poly). */
function boiteUsee(w,h,d,o){o=o||{};
  const H3=[w/2,h/2,d/2],c=Math.min(o.c==null?.03:o.c,w*.22,h*.22,d*.22),cs=o.cell||.34,de=o.dent||0,sd=o.seed||1,yc=o.yc||0,ru=o.rouille||0,P=[],C=[],
    hh=(a,b,e)=>{const x=Math.sin(a*12.9898+b*78.233+e*37.719+sd*4.17)*43758.5453;return x-Math.floor(x);},
    sm=t=>{t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
  const coul=(yw,ny,arete,i,j,f)=>{let k=.95+.08*hh(j,i,f+7);              // la marbrure : la laque n'a plus le même ton partout
    k*=.80+.20*sm((yw-.25)/.6);                                              // la crasse : le bas plus sombre
    if(arete)return [k*1.13,k*1.09,k*1.03];                                  // l'arête usée : la laque est partie, le reflet y court
    if(hh(i,j,f)<ru*(1.4-sm((yw-.3)/.7)))return [k*.68,k*.50,k*.38];         // la rouille, plus fréquente en bas
    if(ny>.7)return [k*1.05,k*1.03,k*.98];                                   // la poussière, sur ce qui regarde le ciel
    return [k,k,k];};
  const tri=(a,b,e,k,dir)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=e[0]-a[0],vy=e[1]-a[1],vz=e[2]-a[2]; // tourné vers `dir` (le dehors)
    if((uy*vz-uz*vy)*dir[0]+(uz*vx-ux*vz)*dir[1]+(ux*vy-uy*vx)*dir[2]<0){const t=b;b=e;e=t;}
    P.push(a[0],a[1],a[2],b[0],b[1],b[2],e[0],e[1],e[2]);for(let n=0;n<3;n++)C.push(k[0],k[1],k[2]);};
  const pt=(ax,va,u,uv,v,vv)=>{const p=[0,0,0];p[ax]=va;p[u]=uv;p[v]=vv;return p;};
  /* (2026-10-20, LE RELIEF — l'étude de la gamme au garage : LA HONTE n° 5 des plus plates, une épave en aplats dont les coups étaient
     PEINTS) `cellC` : des cases plus fines sur les deux FLANCS seulement (la grande caisse n'avait qu'une rangée sur sa hauteur : rien à
     creuser) ; `creux` : de VRAIS COUPS, [{s: côté ±1, y, z: le centre (repère de la boîte), ry, rz: les rayons, p: la profondeur}] — les
     sommets intérieurs du flanc reculent, les facettes autour penchent et prennent la lumière chacune à leur tour. */
  const CR=o.creux||[],coup=(s,y,z)=>{let d=0;for(const q of CR){if(q.s!==s)continue;const r=Math.hypot((y-q.y)/q.ry,(z-q.z)/q.rz);if(r<1)d=Math.max(d,q.p*sm(1-r));}return d;};
  // les six faces, rentrées de c, quadrillées en cases d'environ `cell`, les sommets intérieurs creusés (jamais le bord : il touche le chanfrein)
  for(let ax=0;ax<3;ax++)for(const s of [-1,1]){const u=(ax+1)%3,v=(ax+2)%3,eu=H3[u]-c,ev=H3[v]-c,dir=[0,0,0];dir[ax]=s;const cf=ax===0&&o.cellC?o.cellC:cs;
    const dessous=ax===1&&s<0,nu=dessous?1:Math.max(1,Math.round(2*eu/cf)),nv=dessous?1:Math.max(1,Math.round(2*ev/cf)),f=ax*2+(s>0?1:0);
    const V=(i,j)=>{const bord=i===0||j===0||i===nu||j===nv,uu=-eu+2*eu*i/nu,vv=-ev+2*ev*j/nv;
      return pt(ax,s*(H3[ax]-(bord?0:de*hh(i*7+f,j*3,f+1)+(ax===0?coup(s,uu,vv):0))),u,uu,v,vv);};
    for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=V(i,j),b=V(i+1,j),e=V(i+1,j+1),g=V(i,j+1),k=dessous?[.55,.5,.47]:coul(yc+(a[1]+e[1])/2,ax===1?s:0,false,i,j,f);
      tri(a,b,e,k,dir);tri(a,e,g,k,dir);}}
  // les douze chanfreins et les huit coins
  for(let a=0;a<3;a++)for(let b=a+1;b<3;b++){const t=3-a-b;for(const sa of [-1,1])for(const sb of [-1,1]){
    const q=(ta,tb,tt)=>{const p=[0,0,0];p[a]=ta;p[b]=tb;p[t]=tt;return p;},dir=[0,0,0];dir[a]=sa;dir[b]=sb;
    const A0=q(sa*H3[a],sb*(H3[b]-c),-H3[t]+c),A1=q(sa*H3[a],sb*(H3[b]-c),H3[t]-c),B0=q(sa*(H3[a]-c),sb*H3[b],-H3[t]+c),B1=q(sa*(H3[a]-c),sb*H3[b],H3[t]-c),
      k=coul(yc+(A0[1]+B1[1])/2,(dir[1]||0)*.7,true,a*5+b,sa+sb*3,9);
    tri(A0,A1,B1,k,dir);tri(A0,B1,B0,k,dir);}}
  for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1]){const dir=[sx,sy,sz],k=coul(yc+sy*H3[1],sy*.6,true,sx,sz,11);
    tri([sx*H3[0],sy*(H3[1]-c),sz*(H3[2]-c)],[sx*(H3[0]-c),sy*H3[1],sz*(H3[2]-c)],[sx*(H3[0]-c),sy*(H3[1]-c),sz*H3[2]],k,dir);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  g.computeVertexNormals();return g;} // non indexée : une normale par facette
/* SES ROUES (même demande) : au kit, en facettes, comme celles de la gamme — mais une épave : un pneu au FLANC bombé, l'épaule, la bande et
   ses deux SILLONS, des SCULPTURES en quinconce, un cordon sur le flanc ; une JANTE EN TÔLE emboutie (la lèvre, le voile percé de six trous,
   la cuvette), cinq ÉCROUS. `rouille` : la roue arrière gauche, voilée, en rouille (son caractère d'origine). */
function roueEpave(R,w,rouille){const hw=w/2,fx=hw-.03,
  K=lpKit({k:{g:'m',c:0x18191c},f:{g:'m',c:0x303136},j:{g:'s',c:rouille?0x6a3f22:0x24211e},t:{g:'m',c:0x08080a},e:{g:'s',c:rouille?0x5a3a20:0x6b655c}});
  K.lathe('k',[[R*.66,-hw],[R*.88,-hw],[R*.97,-hw*.78],[R,-hw*.5],[R,-hw*.2],[R*.97,-hw*.14],[R*.97,hw*.14],[R,hw*.2],[R,hw*.5],[R*.97,hw*.78],[R*.88,hw],[R*.66,hw]],16,0,0,0,'x');
  for(let i=0;i<16;i++){const a=(i+.5)/16*Math.PI*2;K.box('k',hw*.34,.02,.07,(i%2?1:-1)*hw*.36,Math.sin(a)*(R+.005),Math.cos(a)*(R+.005),Math.PI/2-a);} // les sculptures
  K.lathe('f',[[R*.79,hw+.003],[R*.84,hw+.003]],16,0,0,0,'x');                                   // le cordon du flanc
  K.lathe('j',[[R*.66,fx-.04],[R*.64,fx],[R*.56,fx+.006],[R*.50,fx-.01],[R*.27,fx-.01],[R*.20,fx+.012],[0,fx+.012]],14,0,0,0,'x'); // la jante emboutie
  K.lathe('t',[[R*.64,-hw+.02],[R*.64,fx-.05],[0,fx-.05]],14,0,0,0,'x');                        // le fond : on ne voit pas au travers
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;K.box('t',.01,R*.09,R*.13,fx-.009,Math.sin(a)*R*.385,Math.cos(a)*R*.385,-a);} // les trous du voile
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.3;K.cyl('e',.017,.03,6,fx+.022,Math.sin(a)*R*.15,Math.cos(a)*R*.15,'x');} // les écrous
  return K.done();}
/* ---- LES 6 SILHOUETTES (LA HONTE + LES CINQ, 2026-09-24) ---------------------------------------
   UNE ENTRÉE = UNE CAISSE. Chaque gabarit monte son corps avec la boîte à outils `K` et rend une
   FICHE D'ANCRAGES : où vont les phares, les feux, les roues, et quels accessoires communs il veut.
   ⚠ POURQUOI CETTE FORME. L'ancien `buildCar` choisissait le gabarit par SEUILS de niveau
   (`lvl>=14?'rocket':lvl>=11?'proto':…`) : entre deux seuils, RIEN ne changeait, et 10 caisses sur
   24 sortaient du même moule. Mesuré dans `voitures.html` : 20 paires au-dessus de 90 % de
   recouvrement de silhouette. C'est la même erreur, et le même remède, que pour les moteurs.
   ⚠ LA RÈGLE : deux caisses ne doivent JAMAIS partager un gabarit. Vérifiable d'un clic (bouton
   DOUBLONS de l'étal) ; le constructeur, lui, refuse de deviner — pas de `shape`, pas de caisse.
   LES POTS (2026-09-26) : les tuyères (JETS), les flammes, la traînée et `nitroLight` ne sont plus aux ancres canoniques — buildCar
   RELÈVE les pots que le gabarit dessine (voir CAR_POTS). Un gabarit dont les pots échappent au relevé les DÉCLARE : `pots:[[x,y,z],…]`
   dans sa fiche (repère caisse, point de sortie). Banc : `dbgPots()` sur la caisse montée.
   -------------------------------------------------------------------------------------------- */
/* ---- LE CHAT POP-TART EN VOXELS (2026-10-06, Léo : « je mise tout sur cette image, fais-en une voiture — impressionne-moi sur le
   mimétisme et l'adaptation ») ------------------------------------------------------------------------------------------------
   L'IMAGE est un sprite de 2011 EXTRUDÉ en cubes : chaque pixel devient un voxel, le contour noir devient un MUR noir sur toute
   l'épaisseur, et tout ce qui regarde vers le bas prenait le BLEU du ciel (dessous des pattes, du gâteau, de la tête) — (2026-10-08,
   Léo : « corrige les bugs en dessous de la voiture ») il est NOIR comme le châssis : l'écran titre fait tourner la caisse dans le
   ciel et la montre par en dessous, où le bleu ne restait que sur la couche du milieu de la tête et de la queue — des rayures bleues
   entre deux bandes noires, lues comme des trous dans la caisse. On garde cette grammaire au pixel près — mais une voiture n'est pas
   un sprite de profil : pour chaque pièce, il a fallu choisir LE PLAN du dessin.
   · le GÂTEAU se couche, c'est le châssis : croûte, glaçage et éclats de sucre DESSUS (la caméra de poursuite voit le dessus), murs
     noirs sur la tranche — l'épaisseur noire de l'image ;
   · la TÊTE se dresse à l'avant, visage DEVANT : il regarde la route, et au garage (trois-quarts avant) c'est lui qu'on voit ;
   · les PATTES et la QUEUE restent dessinées DE PROFIL : vue de côté, la caisse EST le chat de l'image ;
   · les quatre pattes finissent sur des ROULETTES pixel — le chat fait du roller, c'est ça la voiture.
   L'animation est celle du GIF, en PAS ENTIERS, jamais interpolée : les pattes pédalent d'un voxel, la queue bat entre deux dessins,
   la tête hoche d'un voxel sur le tempo — et à la nitro, des pixels multicolores qui scintillent (voir NY_PIX). Unité `NY_U` = 10 cm ; repère
   caisse : i → x (centré), j → y (sol = 0), k → z (k = 10 ↔ z = 0, l'avant en +z). Console : `dbgNyan()`. */
const NY_U=.1;
const NY_K=.95; // (2026-10-09, Léo : « encore un peu petite comparée aux autres ») ,86 → ,95 · (2026-10-09, Léo : « rends-la un peu plus volumineuse ») ,8 → ,86 · (2026-10-09, Léo, fiche de la salle blanche) « la nyan cat : plus petite » — TOUT le chat ×,8 à la fin de son gabarit (géométries et positions) ; les crans de l'animation suivent (pattes, hochement)
const NY_PATTE=.05,NY_BAS=.33; // (v13) la case des pattes (accrochées aux roues) — c'est aussi un cran de leur tour · la descente de la caisse sur ses roues — (2026-10-09, Léo : « la nyan cat doit faire plus voiture de rallye, genre mini rally : plus au ras du sol, moins voiture de ville ») ,25 → ,33 : le pneu rentre dans l'aile
/* (2026-10-09, Léo : « la nyan cat doit faire plus voiture de rallye, genre mini rally : plus au ras du sol, moins voiture de ville »)
   LA MINI DE RALLYE : une déformation CONTINUE de toute la caisse (coque, pop-tart du pavillon, aileron, feux, trait noir — jamais la tête,
   les pattes ni les roues), appliquée à la sortie de chaque chantier :
   · le vitrage et le pavillon TASSÉS au-dessus de ,9 m (×NY_TASSE : le pavillon descend de 8 cm, le pare-brise se couche), de plus en
     plus vers l'arrière (×,74 au haut du pare-brise → ×,56 à la poupe : le pavillon plonge vers le hayon, l'aileron descend avec lui) ;
   · les AILES ÉLARGIES autour des deux roues (+NY_AILE : plateau au-dessus de la roue, fondu vers la porte et vers la ceinture) ;
   · les JUPES qui descendent de 7 cm (tout ce qui est sous ,62 m s'étire vers le sol).
   Continue = rien ne se décolle (l'aileron reste sur ses cols de cygne, la pop-tart sur son pavillon, le trait noir sur la coque). Avec la
   descente NY_BAS et la voie élargie NY_VOIE (,7 → ,76 : roues, pattes, ancrages), la caisse est basse, large, sur ses roues. */
const NY_TASSE=.84,NY_AILE=.12,NY_VOIE=.79; // (2026-10-09, Léo : « rends-la un peu plus volumineuse ») moins tassée (,74 → ,84 ; vers la poupe ,56 → ,70), ailes plus gonflées (+8 → +12 cm), voie ,76 → ,79 : la roue remplit l'aile
function nyRallye(g){const a=g.attributes.position.array,sm=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t);};
  for(let i=0;i<a.length;i+=3){const x=a[i],y=a[i+1],z=a[i+2];let b=0;
    for(const zc of [.95,-.45])b=Math.max(b,sm((1-Math.abs(z-zc)/.62)/.4));        // au-dessus des roues, et le fondu vers la porte
    a[i]=x+Math.sign(x)*NY_AILE*b*sm((Math.abs(x)-.45)/.3)*sm((.98-y)/.14);        // les ailes (ni le plancher, ni au-dessus de la ceinture)
    a[i+1]=y>.9?.9+(y-.9)*(NY_TASSE-.08*(.8-z)):y-.07*sm((.62-y)/.12);}            // le pavillon tassé, qui PLONGE vers l'arrière (hayon de rallye) · les jupes vers le sol
    // ⚠ la pente est LINÉAIRE en z : une face plane le reste (les grands pavés de glaçage du pavillon ne couvrent qu'avec leurs 4 coins —
    //   une pente courbe faisait passer le pavillon au travers, une bande de biscuit en travers du rose)
  g.attributes.position.needsUpdate=true;g.computeVertexNormals();return g;}
const NY_P=.086; // (v12) LE PIXEL DU DESSIN : la tête et la pop-tart du pavillon ont la même case (une seule image, pas deux)
/* (v12) LA POP-TART DU PAVILLON, de l'arrière (rangée 0) vers l'avant : `.` biscuit, `f` glaçage, `s` vermicelle — les coins du glaçage
   en ESCALIER et les vermicelles semés comme sur l'image (une case chacun). */
const NY_TOIT=['..fffffff..',
               '.fffsffffs.',
               'fffffffffff',
               'fsfffffsfff',
               'ffffsffffff',
               'ffffffffsff',
               'fffsfffffff',
               'ffffffsffff',
               'fsfffffffff',
               'ffffsffffsf',
               'fffffffffff',
               'ffsffffsfff',
               'fffffffffff',
               '.ffffsffff.',
               '..fffffff..'];
var BLING={s:[],t:0,anim:[]}; // (2026-10-10) L'ICEBERG : ses éclats de givre (voir SHAPES.iceberg)
/* LES ÉCLATS DE GIVRE de L'ICEBERG : chacune s'allume à SON rythme (une pointe très brève, sinus à la puissance 12), puis s'éteint ; rien d'autre ne
   bouge. Quelques écritures d'échelle par image, et rien quand la caisse n'a pas d'étoiles. */
function blingTick(dt){for(const f of BLING.anim)f(dt); // (2026-10-10) ce qui VIT dans la caisse (le feu de LA FOURNAISE…)
  const L=BLING.s;if(!L.length)return;BLING.t+=dt;
  for(const m of L){const u=m.userData,v=Math.sin(BLING.t*u.r+u.ph),k=v>0?Math.pow(v,12):0,sc=k*u.s;m.visible=sc>.03;if(m.visible)m.scale.setScalar(sc);}}
const NYAN={on:false,tete:null,pattes:[],queue:[],feux:[],roues:[],rf:'',rPas:1,pix:null,pixT:0,arc:new THREE.Vector3(0,.75,-1),ph:0,pas:-1,bat:0,hb:-1,volK:0,v0:0,acc:0,allure:''};
const NY_GATEAU=(function(){const L=['BBBBBBBBBBBBBBBBBBBBBB','BCCCCCCCCCCCCCCCCCCCCB','BCCCCCCCCCCCCCCCCCCCCB','BCCCPPPPPPPPPPPPPPCCCB']; // (v2) coins CARRÉS : un caisson de voiture, plus une galette — le glaçage garde ses coins arrondis
  for(let i=0;i<9;i++)L.push('BCCPPPPPPPPPPPPPPPPCCB');
  return L.concat(L.slice(0,4).reverse());})(); // vu du DESSUS : une rangée par i (−8 … 8), une colonne par k (0 = l'arrière … 21 = l'avant)
const NY_TETE=[ // de FACE, rangée du haut d'abord (j = 14 − rangée) — W : l'éclat de l'œil (en haut à gauche, comme l'image), R : la joue
 '.BB.........BB.',
 '.BGB.......BGB.',
 '.BGGBBBBBBBGGB.',
 'BGGGGGGGGGGGGGB',
 'BGGWBGGGGGWBGGB',
 'BGGBBGGBGGBBGGB',
 'BGGGGGGGGGGGGGB',
 'BRRGBGGBGGBGRRB',
 'BRRGBBBBBBBGRRB',
 '.BGGGGGGGGGGGB.',
 '..BBBBBBBBBBB..'];
const NY_QUEUE=[[10,['...BBB','..BGGB','BBGGB.','BGGB..','BBB...']],     // tombante (colonnes k −5 … 0, rangée du haut = j 10)
                [12,['BBB...','BGGB..','BBGGB.','.BBGGB','...BBB']]];  // relevée (rangée du haut = j 12)
/* LA GRILLE DE VOXELS : une clé de palette par case → seules les faces À L'AIR libre, fusionnées en RECTANGLES par couleur (le
   glouton classique, plan par plan) : ~3 000 cases de chat = quelques centaines de triangles. `fk(c,axe,sens)` choisit la clé de
   chaque FACE (axe 0/1/2 = x/y/z, sens ±1, et la case elle-même) : c'est là que les dessous virent au bleu, et que la caisse prend ses ombres. Les faces vont dans un chantier `lpKit`. */
function voxGrille(){
  const M=new Map(),cle=(i,j,k)=>((i+512)*1024+(j+512))*1024+(k+512); // une clé NUMÉRIQUE (la caisse fine a ~25 000 cases : les chaînes coûtaient)
  return {M,
    set(i,j,k,c){M.set(cle(i,j,k),c);},
    has(i,j,k){return M.has(cle(i,j,k));},
    del(i,j,k){M.delete(cle(i,j,k));},
    emit(kt,u,o,fk){
      const lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9],p=[0,0,0],q=[0,0,0];
      for(const c of M.keys()){p[2]=c%1024-512;p[1]=Math.floor(c/1024)%1024-512;p[0]=Math.floor(c/1048576)-512;
        for(let a=0;a<3;a++){if(p[a]<lo[a])lo[a]=p[a];if(p[a]>hi[a])hi[a]=p[a];}}
      const lit=r=>M.get(cle(r[0],r[1],r[2]));
      for(let ax=0;ax<3;ax++){const a1=(ax+1)%3,a2=(ax+2)%3; // le plan de la face : a1 × a2 = ax (base directe : la face regarde DEHORS)
        const n1=hi[a1]-lo[a1]+1,n2=hi[a2]-lo[a2]+1,mask=new Array(n1*n2);
        for(const sg of [1,-1])for(let d=lo[ax];d<=hi[ax];d++){
          for(let x=0;x<n1;x++)for(let y=0;y<n2;y++){p[ax]=d;p[a1]=lo[a1]+x;p[a2]=lo[a2]+y;q[ax]=d+sg;q[a1]=p[a1];q[a2]=p[a2];
            const c=lit(p);mask[x+y*n1]=(c&&!lit(q))?fk(c,ax,sg,p):null;} // `p` : la case (le choix de la teinte peut regarder ses voisines)
          for(let y=0;y<n2;y++)for(let x=0;x<n1;){const c=mask[x+y*n1];if(!c){x++;continue;}
            let w=1;while(x+w<n1&&mask[x+w+y*n1]===c)w++;
            let h=1;haut:while(y+h<n2){for(let e=0;e<w;e++)if(mask[x+e+(y+h)*n1]!==c)break haut;h++;}
            for(let yy=0;yy<h;yy++)for(let e=0;e<w;e++)mask[x+e+(y+yy)*n1]=null;
            const C=(xx,yy)=>{const r=[0,0,0];r[ax]=o[ax]+(d+(sg>0?1:0))*u;r[a1]=o[a1]+(lo[a1]+xx)*u;r[a2]=o[a2]+(lo[a2]+yy)*u;return r;};
            const a=C(x,y),b=C(x+w,y),cc=C(x+w,y+h),dd=C(x,y+h);
            if(sg>0){kt.tri(c,a,b,cc);kt.tri(c,a,cc,dd);}else{kt.tri(c,a,cc,b);kt.tri(c,a,dd,cc);}
            x+=w;}
        }
      }
    }};
}
/* LA LAQUE DU CHAT POP-TART (v11, Léo : « un beau beige marron comme un biscuit appétissant, mais glossy métallique comme une voiture,
   et par-dessus le glaçage »). La COULEUR reste cuite et sans lumière (le biscuit garde son beige sous la lampe chaude de l'atelier, le
   rideau de feu et les ciels des niveaux : voir la v2) ; le BRILLANT est un studio dessiné dans le shader, dans le repère de la CAMÉRA
   (il suit l'objectif, comme la clé et le contre de l'atelier) : un HORIZON — le pan qui renvoie le ciel s'éclaire, celui qui renvoie le
   sol fonce, c'est ce qui fait le métallisé —, deux BOÎTES À LUMIÈRE qui glissent de facette en facette quand la caisse tourne, et un
   VERNIS blanc en rasant. Rien à texturer ; une MeshBasicMaterial (le brouillard suit) au même onBeforeCompile pour toutes les
   constructions : un seul programme, compilé à la première image de la caisse (au garage, jamais en course). */
const NY_COUL={b:0xd0b092,f:0xff8fe6,s:0xff2f8a,v:0x17223a}; // biscuit · glaçage · vermicelles · vitres (un objet : le banc peut les changer puis dbgCar(9))
function nyLaque(){
  const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
  m.onBeforeCompile=function(sh){
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vNyN;varying vec3 vNyP;')
      .replace('#include <fog_vertex>','#include <fog_vertex>\nvNyN=normalize(normalMatrix*normal);vNyP=mvPosition.xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vNyN;varying vec3 vNyP;')
      .replace('#include <envmap_fragment>',
        'vec3 nN=normalize(vNyN);if(!gl_FrontFacing)nN=-nN;vec3 nV=normalize(-vNyP),nR=reflect(-nV,nN);\n'+
        'float nH=smoothstep(-.12,.22,nR.y),nF=pow(1.-clamp(dot(nN,nV),0.,1.),4.);\n'+ // l'horizon renvoyé · le rasant
        'float nS=pow(max(0.,dot(nR,vec3(-.42,.78,.46))),28.)*.55+pow(max(0.,dot(nR,vec3(.62,.52,.58))),10.)*.18\n'+ // les deux boîtes à lumière
        '  +smoothstep(.30,.40,nR.y)*(1.-smoothstep(.56,.68,nR.y))*smoothstep(-.35,.2,nR.z)*.42;\n'+ // et la RAMPE au plafond : la bande claire qui court sur les pans en biais
        'float nD=clamp(dot(nN,nV),0.,1.);\n'+                                                  // le FLOP du métallisé : pleine de face, sombre en fuyant
        'outgoingLight=outgoingLight*(.66+.5*nD)*(.84+.3*nH)+vec3(1.,.96,.9)*nS+vec3(.92,.94,1.)*nF*.34*(.35+.65*nH);');
  };
  m.userData.lp=1;return m;}
/* (2026-10-14) LE DOGE v2 — LES PIÈCES SCULPTÉES (voir SHAPES.doge). Un champ de distance → un maillage LISSE (surface nets : un sommet par
   case traversée, normales = gradient du champ), coloré par une fonction de la position. Calculé UNE fois par session (SHAPES.doge._tete). */
function dogeNets(F,X0,Y0,Z0,h,nx,ny,nz,coul){
  const N=nx*ny*nz,V=new Float32Array(N);
  for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)V[i+nx*(j+ny*k)]=F(X0+i*h,Y0+j*h,Z0+k*h);
  const CI=new Int32Array((nx-1)*(ny-1)*(nz-1)).fill(-1),P=[],Nn=[],C=[],IX=[],c3=[0,0,0];
  const EDG=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],CO=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]],v8=new Float32Array(8);
  const OFF=CO.map(o=>o[0]+nx*(o[1]+ny*o[2])); // (2026-10-14, OPTIMISATION) le décalage de chaque coin dans V, calculé une fois (mêmes cases lues)
  for(let k=0;k<nz-1;k++)for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){let m=0;const b0=i+nx*(j+ny*k);
    for(let c=0;c<8;c++){v8[c]=V[b0+OFF[c]];if(v8[c]<0)m|=1<<c;}
    if(m===0||m===255)continue;let sx=0,sy=0,sz=0,n=0;
    for(const e of EDG){const a=v8[e[0]],b=v8[e[1]];if((a<0)===(b<0))continue;const t=a/(a-b),A=CO[e[0]],B=CO[e[1]];
      sx+=A[0]+(B[0]-A[0])*t;sy+=A[1]+(B[1]-A[1])*t;sz+=A[2]+(B[2]-A[2])*t;n++;}
    const x=X0+(i+sx/n)*h,y=Y0+(j+sy/n)*h,z=Z0+(k+sz/n)*h;CI[i+(nx-1)*(j+(ny-1)*k)]=P.length/3;P.push(x,y,z);
    const e9=h*.35,gx=F(x+e9,y,z)-F(x-e9,y,z),gy=F(x,y+e9,z)-F(x,y-e9,z),gz=F(x,y,z+e9)-F(x,y,z-e9),l=Math.hypot(gx,gy,gz)||1;Nn.push(gx/l,gy/l,gz/l);
    coul(x,y,z,c3);C.push(c3[0],c3[1],c3[2]);}
  const ci=(i,j,k)=>(i<0||j<0||k<0||i>=nx-1||j>=ny-1||k>=nz-1)?-1:CI[i+(nx-1)*(j+(ny-1)*k)];
  const quad=(a,b,c,d,fl)=>{if(a<0||b<0||c<0||d<0)return;if(fl)IX.push(a,b,c,a,c,d);else IX.push(a,c,b,a,d,c);};
  for(let k=1;k<nz-1;k++)for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){const in0=V[i+nx*(j+ny*k)]<0;
    if(in0!==(V[(i+1)+nx*(j+ny*k)]<0))quad(ci(i,j-1,k-1),ci(i,j,k-1),ci(i,j,k),ci(i,j-1,k),in0);
    if(in0!==(V[i+nx*((j+1)+ny*k)]<0))quad(ci(i-1,j,k-1),ci(i-1,j,k),ci(i,j,k),ci(i,j,k-1),in0);
    if(in0!==(V[i+nx*(j+ny*(k+1))]<0))quad(ci(i-1,j-1,k),ci(i,j-1,k),ci(i,j,k),ci(i-1,j,k),in0);}
  return {P:new Float32Array(P),N:new Float32Array(Nn),C:new Float32Array(C),I:new Uint32Array(IX)};}
function dogeSdf(){ // (2026-10-14, OPTIMISATION) une fonction nommée, plus une IIFE : l'OUVRIER DU DOGE se bâtit depuis sa source (voir DOGE_OUV)
  const sm=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;},sM=(a,b,k)=>-sm(-a,-b,k);
  const ell=(x,y,z,cx,cy,cz,rx,ry,rz)=>{const px=(x-cx)/rx,py=(y-cy)/ry,pz=(z-cz)/rz,k0=Math.sqrt(px*px+py*py+pz*pz),
    k1=Math.sqrt(px*px/(rx*rx)+py*py/(ry*ry)+pz*pz/(rz*rz))||1e-6;return k0*(k0-1)/k1;};
  const rcone=(x,y,z,ax,ay,az,bx,by,bz,r1,r2)=>{const bax=bx-ax,bay=by-ay,baz=bz-az,l2=bax*bax+bay*bay+baz*baz,rr=r1-r2,a2=l2-rr*rr,il2=1/l2,
    pax=x-ax,pay=y-ay,paz=z-az,yy=pax*bax+pay*bay+paz*baz,zz=yy-l2,qx=pax*l2-bax*yy,qy=pay*l2-bay*yy,qz=paz*l2-baz*yy,x2=qx*qx+qy*qy+qz*qz,
    y2=yy*yy*l2,z2=zz*zz*l2,k=Math.sign(rr)*rr*rr*x2;
    if(Math.sign(zz)*a2*z2>k)return Math.sqrt(x2+z2)*il2-r2;if(Math.sign(yy)*a2*y2<k)return Math.sqrt(x2+y2)*il2-r1;return (Math.sqrt(x2*a2*il2)+yy*rr)*il2-r1;};
  const capsule=(x,y,z,a,b,r)=>{const bax=b[0]-a[0],bay=b[1]-a[1],baz=b[2]-a[2],pax=x-a[0],pay=y-a[1],paz=z-a[2],
    h=Math.max(0,Math.min(1,(pax*bax+pay*bay+paz*baz)/(bax*bax+bay*bay+baz*baz))),dx=pax-bax*h,dy=pay-bay*h,dz=paz-baz*h;return Math.sqrt(dx*dx+dy*dy+dz*dz)-r;};
  /* (2026-10-14, OPTIMISATION — « le DOGE fige 3-4 s un iPhone 7 à sa 1re construction ») LA SPHÈRE ENGLOBANTE. Un cône arrondi (ou un
     trait) tient dans la sphère centrée au milieu de ses bouts, de rayon demi-longueur + le plus grand rayon : sa distance vaut AU MOINS
     « distance au centre − rayon ». Quand ce plancher dépasse déjà ce qu'un mélange peut prendre (sm(f, d, k) avec d ≥ f + k rend f tel
     quel, h = 0), la pièce est trop loin pour compter : `loin` le prouve sans racine carrée, et la pièce rend 1e9 au lieu de se calculer —
     le mélange rend alors EXACTEMENT le même f, au bit près (vérifié : même empreinte du maillage, banc node doge-banc). `sph` : [cx,cy,cz,R]
     (+1e-6 de marge sur les arrondis). */
  const sph=(ax,ay,az,bx,by,bz,r1,r2)=>[(ax+bx)/2,(ay+by)/2,(az+bz)/2,Math.hypot(bx-ax,by-ay,bz-az)/2+Math.max(r1,r2)+1e-6];
  const loin=(x,y,z,S,lim)=>{const t=lim+S[3];if(t<=0)return true;const dx=x-S[0],dy=y-S[1],dz=z-S[2];return dx*dx+dy*dy+dz*dz>=t*t;};
  /* `ellG` = ell, avec le même `lim` : hors de l'ellipsoïde (k0 ≥ 1), ell = k0(k0−1)/k1 ≥ (k0−1)·rmin (k1 ≤ k0/rmin) et k0 ≥ |p−c|/rmax —
     donc |p−c| ≥ rmax·(1 + lim/rmin) suffit à prouver ell ≥ lim : rend 1e9 sans racine. */
  const ellG=(x,y,z,cx,cy,cz,rx,ry,rz,lim)=>{const rM=Math.max(rx,ry,rz),T=rM*(1+Math.max(lim,0)/Math.min(rx,ry,rz))+1e-6,dx=x-cx,dy=y-cy,dz=z-cz;
    return dx*dx+dy*dy+dz*dz>=T*T?1e9:ell(x,y,z,cx,cy,cz,rx,ry,rz);};
  return {sm,sM,ell,rcone,capsule,sph,loin,ellG};}
const DOGE_SDF=dogeSdf();
function dogeTete(pre){ // pre (facultatif) = {tete, mach} : les deux maillages déjà calculés par l'OUVRIER DU DOGE (les mêmes, au bit près) — le reste se refait ici, il ne coûte rien
  const {sm,sM,ell,rcone,capsule,sph,loin,ellG}=DOGE_SDF;
  const EYE=[[.185,.075,.312],[-.185,.075,.312]],RE=.086;
  // les oreilles : un cône aplati (épaisseur ÷2,4), creusé devant — ORE = [plein, creux] : zc, x et y des deux bouts, leurs rayons
  // (2026-10-14, OPTIMISATION) `lim` (facultatif) : au-delà, prouvé par la sphère englobante (ORB, dans l'espace aplati), elle rend 1e9 (voir loin)
  const ORE=[[-.05,.255,.24,.36,.67,.175,.016],[.005,.255,.27,.335,.60,.10,.012]],ORB=ORE.map(o=>[1,-1].map(s=>sph(s*o[1],o[2],o[0],s*o[3],o[4],o[0],o[5],o[6])));
  const oreille=(x,y,z,s,creux,lim)=>{const o=ORE[creux?1:0],zc=o[0],zz=zc+(z-zc)*2.4;
    if(lim!==undefined&&loin(x,y,zz,ORB[creux?1:0][s>0?0:1],2*lim))return 1e9;
    return rcone(x,y,zz,s*o[1],o[2],zc,s*o[3],o[4],zc,o[5],o[6])/2;};
  const MUS=[0,-.10,.20,0,-.15,.50,.22,.12],MUSB=sph(MUS[0],MUS[1],MUS[2],MUS[3],MUS[4],MUS[5],MUS[6],MUS[7]);
  const museau=(x,y,z,lim)=>lim!==undefined&&loin(x,y,z,MUSB,lim)?1e9:rcone(x,y,z,MUS[0],MUS[1],MUS[2],MUS[3],MUS[4],MUS[5],MUS[6],MUS[7]);
  const base=(x,y,z)=>{const ax=Math.abs(x),s=x<0?-1:1;
    let f=ell(x,y,z,0,.06,0,.47,.40,.40);                                         // le crâne
    f=sm(f,ellG(ax,y,z,.25,-.15,.17,.25,.21,.23,f+.10),.10);                       // les joues bombées
    f=sm(f,museau(x,y,z,f+.10),.10);                                               // le museau effilé
    f=sm(f,ellG(x,y,z,0,-.29,.18,.22,.13,.20,f+.08),.08);                          // le menton
    f=sm(f,oreille(x,y,z,s,false,f+.06),.06);f=sM(f,-oreille(x,y,z,s,true,.02-f),.02); // l'oreille, et son creux (sM(f,-o,k) = -sm(-f,o,k) : o compte en deçà de k − f)
    const e=EYE[x<0?1:0],ex=x-e[0],ey=y-e[1],ez=z-e[2],T9=Math.max(RE+.032-f,RE+.028+f)+1e-6; // (OPTIMISATION) l'œil ne touche f qu'en deçà de T9 (orbite : de < RE+.032−f · paupière : de < RE+.028+f)
    if(T9>0&&ex*ex+ey*ey+ez*ez<T9*T9){const de=Math.hypot(ex,ey,ez);
    f=sM(f,-(de-RE-.012),.02);                                                     // l'orbite
    f=sm(f,Math.max(de-RE-.016,(e[1]+.032-.22*(ax-.185))-y),.012);}                // la PAUPIÈRE : le haut de l'œil couvert (le regard blasé)
    f=sm(f,ellG(x,y,z,0,-.072,.585,.072,.05,.045,f+.02),.02);                      // la truffe
    return f;};
  // la BOUCHE EN COIN : la ligne est posée sur la surface (lancer de rayon), puis creusée
  const trace=(x,y)=>{let z=1;for(let i=0;i<220;i++){const d=base(x,y,z);if(d<.0015)return z;z-=Math.max(d*.6,.002);if(z<-.2)break;}return null;};
  const LIG=[[0,-.118],[0,-.19],[-.125,-.215],[-.06,-.222],[0,-.21],[.07,-.20],[.135,-.155]],PTS=LIG.map(([x,y])=>{const z=trace(x,y);return z==null?null:[x,y,z+.004];});
  const SEG=[[0,1],[2,3],[3,4],[4,5],[5,6]].filter(([a,b])=>PTS[a]&&PTS[b]).map(([a,b])=>[PTS[a],PTS[b]]);
  // (2026-10-14, OPTIMISATION) BOUB : la sphère qui tient tout le trait — `lim` comme pour les oreilles (1e9 quand le trait est trop loin pour compter)
  const BOUB=(()=>{if(!SEG.length)return [0,0,0,-1e9];const a=[1e9,1e9,1e9],b=[-1e9,-1e9,-1e9];for(const s of SEG)for(const p of s)for(let i=0;i<3;i++){a[i]=Math.min(a[i],p[i]);b[i]=Math.max(b[i],p[i]);}
    const c=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];let R=0;for(const s of SEG)for(const p of s)R=Math.max(R,Math.hypot(p[0]-c[0],p[1]-c[1],p[2]-c[2]));return [c[0],c[1],c[2],R+1e-6];})();
  const bouche=(x,y,z,lim)=>{if(lim!==undefined&&loin(x,y,z,BOUB,lim))return 1e9;let d=1e9;for(const s of SEG)d=Math.min(d,capsule(x,y,z,s[0],s[1],0));return d;};
  const F=(x,y,z)=>{const a=base(x,y,z);return sM(a,-(bouche(x,y,z,.019-a)-.011),.008);}; // le trait ne creuse qu'en deçà de .011 + .008 − a
  const HC=new Map(),H=(c,o)=>{let q=HC.get(c);if(!q){const k=new THREE.Color(c);HC.set(c,q=[k.r,k.g,k.b]);}o[0]=q[0];o[1]=q[1];o[2]=q[2];return o;}; // (OPTIMISATION) une couleur lue une fois (il en naissait ~260 000)
  const coul=(x,y,z,o)=>{const ax=Math.abs(x),s=x<0?-1:1,e=EYE[x<0?1:0],de=Math.hypot(x-e[0],y-e[1],z-e[2]);
    if(ell(x,y,z,0,-.072,.585,.072,.05,.045)<.012)return H(0x121014,o);              // la truffe
    if(bouche(x,y,z,.024)<.024)return H(0x3a1f14,o);                                  // la bouche
    if(de<RE+.03&&y<e[1]+.03)return H(0x2a1810,o);                                    // le tour des yeux, sombre (le trait du shiba)
    if(oreille(x,y,z,s,true,.03)<.03&&z>-.06&&y>.30)return H(0xf0b0a2,o);             // le dedans des oreilles
    const mu=museau(x,y,z,.03)<.03,arete=ax<.075&&y>-.11&&z>.22;
    if((mu&&!arete)||y<-.14||(ell(ax,y,z,.25,-.15,.17,.25,.21,.23)<.03&&y<.0)||(ax>.08&&ax<.34&&y<e[1]-.06&&y>e[1]-.2&&z>.18))return H(0xf6e6c6,o); // le MASQUE crème
    if(y>.30&&ax<.20&&z>-.1)return H(0xb8702e,o);                                     // le front, plus sombre
    return H(0xd99545,o);};
  // les couleurs : la moyenne de 7 prises autour du point — les bords des taches se fondent au lieu de faire des dents de scie
  const c1=[0,0,0],coulD=(x,y,z,o)=>{o[0]=o[1]=o[2]=0;const e=.009;for(const d of [[0,0,0],[e,0,0],[-e,0,0],[0,e,0],[0,-e,0],[0,0,e],[0,0,-e]]){coul(x+d[0],y+d[1],z+d[2],c1);o[0]+=c1[0]/7;o[1]+=c1[1]/7;o[2]+=c1[2]/7;}return o;};
  // (2026-10-14, Léo : « qu'il ouvre la bouche, des dents, la langue tirée » · « sa bouche, c'est le TRAIT NOIR : ça doit s'ouvrir depuis là » ·
  // « progressivement, pas découpé brutalement de manière permanente ») LA GUEULE : seule la BOUCHE est découpée — le long du trait (`YC(x)`,
  // la ligne du sourire), entre ses deux coins, sur la profondeur du museau (un cylindre elliptique `ell9` sous le trait) : c'est la LÈVRE DU BAS
  // et le menton (`G.machoire`). Elle s'ouvre en se DÉFORMANT (`G.poidsJ` : 1 au milieu de la lèvre, 0 au bord du cylindre) : les coins restent
  // attachés, la peau s'étire, l'ouverture grandit depuis le trait en forme d'amande ; la lèvre du HAUT se retrousse un peu (`G.poidsU`). Fermée,
  // rien ne se voit que le trait.
  const LB=LIG.slice(2),YC=x=>{if(x<=LB[0][0])return LB[0][1];for(let i=1;i<LB.length;i++)if(x<=LB[i][0]){const a=LB[i-1],b=LB[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return LB[LB.length-1][1];};
  const EC=.46,EA=.15,EZ=.34,ell9=(x,z)=>Math.hypot(x/EA,(z-EC)/EZ),J=(x,y,z)=>Math.max(y-YC(x),(ell9(x,z)-1)*EA),
        Fu=(x,y,z)=>Math.max(F(x,y,z),-J(x,y,z)),Fj=(x,y,z)=>Math.max(F(x,y,z),J(x,y,z));
  const D7=[[0,0,0],[.009,0,0],[-.009,0,0],[0,.009,0],[0,-.009,0],[0,0,.009],[0,0,-.009]]; // (OPTIMISATION) les 7 prises, posées une fois
  const moy=f=>(x,y,z,o)=>{o[0]=o[1]=o[2]=0;for(const d of D7){f(x+d[0],y+d[1],z+d[2],c1);o[0]+=c1[0]/7;o[1]+=c1[1]/7;o[2]+=c1[2]/7;}return o;};
  const dedans=(x,y,z)=>Math.abs(y-YC(x))<.02&&ell9(x,z)<1.02&&F(x,y,z)<-.004,levre=(x,y,z)=>F(x,y,z)>-.022;   // une COUPE (l'intérieur) ; son bord = les BABINES noires — (OPTIMISATION) les tests bon marché d'abord : F ne se calcule plus que près du trait
  const coulU=moy((x,y,z,o)=>dedans(x,y,z)?H(levre(x,y,z)?0x1e1214:0x5a1820,o):coul(x,y,z,o)),       // le palais
        coulJ=moy((x,y,z,o)=>dedans(x,y,z)?H(levre(x,y,z)?0x1e1214:0x9a3040,o):coul(x,y,z,o));       // le plancher de la bouche
  const h=.016,X0=-.62,Y0=-.47,Z0=-.47,nx=78,ny=78,nz=74,G=pre&&pre.tete||dogeNets(Fu,X0,Y0,Z0,h,nx,ny,nz,coulU);
  G.machoire=pre&&pre.mach||dogeNets(Fj,-.20,-.47,EC-EZ-.04,h,27,23,49,coulJ);G.charniere=[0,-.23,EC-EZ+.02];G.YC=YC;
  const fJ=(x,z)=>{const e=Math.min(1,ell9(x,z));return Math.pow(1-e*e,1.4);};                        // le poids de la lèvre du bas : 1 au milieu, 0 au bord
  G.poidsJ=(()=>{const P=G.machoire.P,w=new Float32Array(P.length/3);for(let i=0;i<w.length;i++)w[i]=fJ(P[i*3],P[i*3+2]);return w;})();
  G.poidsU=(()=>{const P=G.P,L=[];for(let i=0;i<P.length/3;i++){const x=P[i*3],y=P[i*3+1],z=P[i*3+2],e=ell9(x,z);if(e>=1)continue;const dy=y-YC(x);   // la lèvre du HAUT, juste au-dessus du trait
      if(dy<-.004||dy>.07)continue;const w=(1-e*e)*(1-dy/.07);if(w>.02)L.push(i,w);}return new Float32Array(L);})();
  G.fJ=fJ;
  // les DENTS, au bord de la coupe (lancées depuis le milieu de la bouche, rentrées de 2,5 cm) : en haut deux crocs et quatre incisives, en bas deux crocs et deux
  const bord=a=>{const dx=Math.sin(a),dz=Math.cos(a);let t=0;for(let i=0;i<200;i++){const x=dx*t,z=.36+dz*t;if(F(x,YC(x),z)>0||ell9(x,z)>.93)break;t+=.003;}t=Math.max(0,t-.025);return [dx*t,.36+dz*t];};
  G.dentsH=[[-.95,.015,.055],[.95,.015,.055],[-.45,.010,.032],[-.16,.010,.032],[.16,.010,.032],[.45,.010,.032]].map(([a,r,l])=>bord(a).concat([r,l]));
  G.dentsB=[[-.85,.013,.045],[.85,.013,.045],[-.25,.009,.026],[.25,.009,.026]].map(([a,r,l])=>bord(a).concat([r,l]));
  G.yeux=EYE.map(e=>[e[0],e[1],e[2]+.004,RE]);
  G.sourcils=EYE.map(e=>[e[0]*.92,e[1]+.13,(trace(e[0]*.92,e[1]+.13)||.33)+.006]);
  G.bouche=[0,-.215,(trace(0,-.215)||.55)-.01];
  return G;}
/* L'OUVRIER DU DOGE (2026-10-14, OPTIMISATION — Sacha via PILOTAGE : « les idées de Léo bien intégrées » ; passation perf : « dogeTete ~1 s de
   processeur sur Mac = ~3-4 s figées sur iPhone 7 à sa 1re construction »). La tête sculptée se calculait d'un bloc sur le fil principal à la
   PREMIÈRE apparition du DOGE (atelier, boutique, photo d'inventaire) : l'écran gelait. Désormais :
   · ses deux maillages (la tête, la mâchoire : les deux surface nets, ~99 % du coût) se calculent dans un Web Worker bâti depuis la source
     même (dogeSdf, dogeNets, dogeTete : un seul code, pas de copie — le modèle de L'OUVRIER DES NUAGES), lancé UNE fois par session, au menu,
     DOGE_OUV_MS après le démarrage ; three n'y entre pas : son `THREE.Color` y est l'équivalent exact de celui de r128 (setHex) ;
   · le DOGE demandé avant la fin (ou l'ouvrier refusé) : calcul sur place, comme avant — et l'ouvrier, devenu inutile, s'arrête ;
   · même moteur JavaScript des deux côtés : les mêmes nombres au bit près. `dbgDoge()` : l'état · `dbgDoge('compare')` : recalcule sur place
     et compare octet par octet. La forme et les couleurs de Léo ne changent pas d'un bit ; la tête elle-même calcule aussi ~1,6× plus vite
     (sphères englobantes, voir dogeSdf) : le repli coûte moins. */
const DOGE_OUV={w:null,pret:null,etat:'',ms:0,t0:0,msFil:0,u:''};const DOGE_OUV_MS=5000;
function dogeOuvFin(){if(DOGE_OUV.w){try{DOGE_OUV.w.terminate();}catch(e){}DOGE_OUV.w=null;}if(DOGE_OUV.u){try{URL.revokeObjectURL(DOGE_OUV.u);}catch(e){}DOGE_OUV.u='';}}
function dogeOuvrier(){
  if(DOGE_OUV.w||DOGE_OUV.pret||DOGE_OUV.etat||SHAPES.doge._tete)return;
  try{const src='"use strict";const THREE={Color:function(h){h=Math.floor(h);this.r=(h>>16&255)/255;this.g=(h>>8&255)/255;this.b=(h&255)/255;}};'
      +'const DOGE_SDF=('+dogeSdf.toString()+')();'+dogeNets.toString()+';'+dogeTete.toString()+';'
      +'self.onmessage=function(){const G=dogeTete(),t={P:G.P,N:G.N,C:G.C,I:G.I},m=G.machoire,j={P:m.P,N:m.N,C:m.C,I:m.I};'
      +'self.postMessage({tete:t,mach:j},[t.P.buffer,t.N.buffer,t.C.buffer,t.I.buffer,j.P.buffer,j.N.buffer,j.C.buffer,j.I.buffer]);};';
    DOGE_OUV.u=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));const w=new Worker(DOGE_OUV.u);
    DOGE_OUV.w=w;DOGE_OUV.etat='calcul';DOGE_OUV.t0=performance.now();
    w.onmessage=function(e){DOGE_OUV.ms=Math.round(performance.now()-DOGE_OUV.t0);dogeOuvFin();if(SHAPES.doge._tete)return;DOGE_OUV.pret=e.data;DOGE_OUV.etat='pret';};
    w.onerror=function(ev){try{ev.preventDefault();}catch(e9){}dogeOuvFin();DOGE_OUV.etat='refuse';};
    w.postMessage(0);
  }catch(e){dogeOuvFin();DOGE_OUV.etat='refuse';}}
function dogeTeteObtient(){ // la tête pour SHAPES.doge : celle de l'ouvrier si elle est prête, sinon calculée ici
  if(DOGE_OUV.pret){const p=DOGE_OUV.pret;DOGE_OUV.pret=null;DOGE_OUV.etat='servi';return dogeTete(p);}
  if(DOGE_OUV.w){dogeOuvFin();DOGE_OUV.etat='devance';}
  const t0=performance.now(),G=dogeTete();DOGE_OUV.msFil=Math.round(performance.now()-t0);return G;}
setTimeout(dogeOuvrier,DOGE_OUV_MS);
window.dbgDoge=function(q){ // (banc) l'OUVRIER DU DOGE — voir plus haut
  const T=SHAPES.doge._tete;
  if(q==='compare'){if(!T)return 'pas encore de tete';const R=dogeTete(),oct=a=>new Uint8Array(a.buffer,a.byteOffset,a.byteLength),
      eq=(a,b)=>{if(!a||!b||a.byteLength!==b.byteLength)return false;const x=oct(a),y=oct(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return false;return true;};
    return {tete:['P','N','C','I'].every(k=>eq(T[k],R[k])),machoire:['P','N','C','I'].every(k=>eq(T.machoire[k],R.machoire[k])),poids:eq(T.poidsU,R.poidsU)&&eq(T.poidsJ,R.poidsJ)};}
  return {etat:DOGE_OUV.etat||'attente',msOuvrier:DOGE_OUV.ms,msFil:DOGE_OUV.msFil,tete:!!T,sommets:T?T.P.length/3:0};};
const SHAPES={
  // 1. L'ÉPAVE — tôle froissée, une roue voilée, un phare mort. Le point de départ de chaque run.
  epave(K){
    const {W,H,L,y0,box:B}=K;
    // (2026-10-15, Léo : « plus de détail au niveau de la brillance et de la texture de sa carcasse ») ses tôles : des BOÎTES USÉES (voir
