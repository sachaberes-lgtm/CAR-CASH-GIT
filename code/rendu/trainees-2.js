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
      p.l=1.8+Math.random()*.6;p.w=p.h=.3;p.c=30;p.c2=31;p.fo=.5;p.cu=TC_ON?2:0;
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
  T.L[0].n=T.L[1].n=0;tcOn();
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
  T.n=np+T.L[0].n+T.L[1].n+nb+(T.gk>0?1:0)+(TC_ON?TC.s.n+TC.g.n:0); // tant qu'il reste quelque chose (même un mur qui s'éteint), la boucle continue d'appeler
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
