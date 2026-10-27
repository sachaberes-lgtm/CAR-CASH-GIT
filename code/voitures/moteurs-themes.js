/* ================= L'IDENTITÉ DE CHAQUE MOTEUR (2026-10-26, Léo : « chaque moteur aura une identité à lui — aquatique,
   élémentaire, animaux, des références familières avec une touche d'originalité ; toujours une intensité plus grande : le
   premier a de la gueule, le 30e mille fois plus » ; « même plus drôle, des rêves, n'importe ») =================
   QUATRE CHAPITRES : le VIVANT (2-11) → la PUISSANCE (12-16 : électrique, grenade, vitrail, soleil, roquette) → les LÉGENDES (17-25) → l'AU-DELÀ (26-30 : alien, porte de distorsion, comète, naissance, l'infini). Chaque palier a sa
   PALETTE (`TH30` remplace la laque et la flamme du palier) et sa SIGNATURE (`theme30`), posée sur le moteur — ⚠ RÈGLE : chaque
   pièce TOUCHE le moteur (aucun bout en l'air), aucune matière transparente hors du verre voulu. */
const TH30=[null,
 [0x1f8a6a,0x9affc8],[0x1fb8b0,0xc8a8ff],[0x2a1c14,0xffb030],[0x9a6430,0xffc040],[0x4a6680,0x9ad8ff],   // 2 scarabée · 3 colibri · 4 scorpion · 5 hibou · 6 requin
 [0xff6a3c,0xffb070],[0xff5f8a,0xffe0ea],[0x15171c,0xd8f4ff],[0x5f7d3c,0xd8ff90],[0xd8282a,0xffa030],   // 7 étoile de mer · 8 corail · 9 orques · 10 tortue · 11 roquette
 [0x1f4aff,0x9af0ff],[0x4f5f2a,0xffb030],[0x2a3a8a,0xffe08a],[0xffb000,0xfff0a0],[0x1f5a3a,0xff5030],   // 12 électrique · 13 grenade · 14 vitrail · 15 soleil · 16 dragon
 [0xc0201e,0xffd070],[0x3a2a6a,0x6affd8],[0xd9a441,0x5a8aff],[0xff4a1a,0xffc040],[0x13a8a8,0x8affff],   // 17 pagode · 18 kraken · 19 sphinx · 20 phénix · 21 atlantide
 [0x7a8aa0,0x8ad8ff],[0xb81a3a,0xff6a80],[0x16161c,0xff4a14],[0xffc030,0xfff6c0],[0x2adf8a,0xb0ffe0],   // 22 lance d'Odin · 23 cœur battant · 24 dragon cosmique · 25 Hélios · 26 alien
 [0xb4bccb,0xbfe8ff],[0x9ad8ff,0xff9a40],[0xff6ea0,0xffd0f0],[0xf5f6fa,0xffd780]];                        // 27 ouroboros · 28 Halley · 29 naissance · 30 l'infini
function th30Kit(E,i){const t=TH30[i];return t?Object.assign({},E,{col:t[0],flam:t[1]}):E;}
function theme30(B,i,K,c,g){
  const L=c.L||2,XE=L*.5,top=c.top||.85,tw=c.tw||.18;
  const P=(x,y,z)=>new THREE.Vector3(x,y,z),D=(x,y,z)=>new THREE.Vector3(x,y,z).normalize();
  const tige=(a,b,r,m)=>B.add(tube10([[a.x,a.y,a.z],[b.x,b.y,b.z]],r,1,8),m,0,0,0);                                   // un fût droit entre deux points
  const corne=(p,d,r,l,m)=>vers10(B,cone10(r,l,10),m,p,d,1);                                   // une pointe le long de d
  const boule=(m,x,y,z,sx,sy,sz)=>B.add(G10.sph,m,x,y,z,0,0,0,sx,sy||sx,sz||sx);
  const plume=(m,x,y,z,len,larg,rx,ry,rz)=>B.add(plan10([[0,-larg*.5],[len*.75,-larg*.35],[len,0],[len*.75,larg*.35],[0,larg*.5]],.02,.004),m,x,y,z,rx||0,ry||0,rz||0);
  const oeil=(x,y,z,r,ry)=>{B.add(new THREE.CylinderGeometry(r,r,.02,14),K.or,x,y,z,0,0,PI10/2+0,1,1,1);};
  B.plat();
  switch(i){
  case 1:{ // LE SCARABÉE — deux élytres émeraude bombées sur le couvre-culasse, la corne de rhinocéros, six pattes d'or articulées
    for(let sd=-1;sd<=1;sd+=2){B.add(G10.sph,K.col,-L*.04,top+.04,sd*.105,0,sd*.06,0,L*.46,.15,.125);
      B.add(G10.axeX8,K.or,-L*.46,top+.17,sd*.002,0,0,0,L*.86,.010,.010);}
    corne(P(XE-.10,top+.10,0),D(.55,1,0),.08,.50,K.lame);corne(P(XE-.02,top+.04,0),D(1,.35,0),.05,.22,K.lame);
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<3;k++){const x=(k-1)*L*.32,a=P(x,.0,sd*.33),b=P(x+.06,-.18,sd*.55),e=P(x+.14,-.40,sd*.62);
      tige(a,b,.035,K.or);tige(b,e,.028,K.or);boule(K.or,b.x,b.y,b.z,.045);corne(e,D(.3,-1,sd*.2),.03,.08,K.or);}
    break;}
  case 2:{ // LE COLIBRI — trois paires d'ailes irisées qui battent en éventail, un long bec d'or, une queue en ciseaux
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<3;k++)plume(k%2?K.col:K.colD,-L*.10+k*.03,top-.06,sd*.24,.70-k*.12,.20,sd*(.9-k*.35),0,PI10/2.6+k*.28);
    corne(P(XE+.02,top-.05,0),D(1,-.08,0),.035,.75,K.or);boule(K.colD,XE-.02,top-.04,0,.10,.09,.09);
    for(let sd=-1;sd<=1;sd+=2)plume(K.colD,-XE,top-.10,sd*.04,.55,.12,0,PI10,sd*.25);
    break;}
  case 3:{ // LE SCORPION — la queue articulée qui se dresse au-dessus du moteur, le dard d'ambre, deux pinces devant
    const pts=[P(-XE+.05,top-.12,0),P(-XE-.22,top+.12,0),P(-XE-.20,top+.48,0),P(-XE+.08,top+.74,0),P(-XE+.42,top+.82,0),P(-XE+.70,top+.70,0)];
    for(let k=0;k<pts.length;k++){const q=pts[k],r=.16-k*.016;boule(K.col,q.x,q.y,q.z,r,r*.85,r);if(k>0)tige(pts[k-1],q,r*.6,K.col);B.add(new THREE.TorusGeometry(r*.9,.014,4,16),K.or,q.x,q.y,q.z,0,PI10/2,0);}
    corne(pts[5],D(.6,-1,0),.07,.38,K.or);boule(K.glow,pts[5].x+.20,pts[5].y-.33,0,.035);
    for(let sd=-1;sd<=1;sd+=2){const a=P(XE,.05,sd*.22),b=P(XE+.36,.16,sd*.40);tige(a,b,.07,K.col);boule(K.col,b.x,b.y,b.z,.11);
      corne(b,D(1,.3,sd*.2),.09,.40,K.col);corne(b,D(1,-.2,sd*.4),.07,.32,K.col);}
    break;}
  case 4:{ // LE HIBOU — deux grands yeux d'ambre en façade, aigrettes de plumes, ailes repliées sur les flancs
    for(let sd=-1;sd<=1;sd+=2){const z=sd*.24,x=L*.485+.08;
      B.add(tourX([[.001,0],[.24,0],[.27,.04],[.24,.07],[.001,.07]],20),K.or,x,.90,z);B.add(tourX([[.001,0],[.19,0],[.19,.02],[.001,.02]],20),K.glow,x+.06,.90,z);
      B.add(tourX([[.001,0],[.08,0],[.08,.02],[.001,.02]],14),K.noir,x+.075,.90,z);
      plume(K.colD,-L*.40,top+.05,sd*.12,.48,.12,0,0,1.25);}
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<4;k++)plume(k%2?K.col:K.colD,XE*.6,.35-k*.10,sd*.40,L*.75,.13,0,PI10,-.12+k*.04);
    break;}
  case 5:{ // LE REQUIN, PILOTE HYBRIDE (Léo : « pas un objet décoré : l'animal doit être l'objet lui-même, presque transformeur ») — LE MOTEUR EST le
    //   requin : le bloc = le corps, la cloche d'embrayage (-X) = le museau (gueule, dents, yeux), l'échappement (+X) = la queue (deux lames de
    //   nageoire caudale autour de la tuyère), le ventre blanc = le carter d'huile, l'aileron = sur le dos, les ouïes sur les flancs
    const yC=.20,hx=-XE-.04;
    TX(B,K.col,[[.42,0],[.38,.18],[.24,.55],[.08,.92],[.001,1.02]],hx,yC,0,PI10,22);                                   // le museau
    BXg(B,K.blanc,-XE-.30,yC-.18,0,0,0,.16,.70,.05,.50);                                                              // le dessous du museau, blanc
    BXg(B,K.noir,-XE-.44,yC-.28,0,0,0,.16,.62,.05,.40);                                                               // la mâchoire inférieure
    for(let sd=-1;sd<=1;sd+=2){for(let k=0;k<6;k++){const x=-XE-.16-k*.10;corne(P(x,yC-.17,sd*(.20-k*.012)),D(0,-1,0),.032,.13,K.blanc);corne(P(x-.04,yC-.27,sd*(.18-k*.012)),D(0,1,0),.028,.11,K.blanc);}
      boule(K.noir,-XE-.36,yC+.12,sd*.27,.05);boule(K.glow,-XE-.385,yC+.13,sd*.285,.022);
      B.add(plan10([[0,0],[.42,-.08],[.14,-.22],[0,-.12]],.03,.006),K.col,-XE+.28,yC-.06,sd*.36,PI10/2,0,-.5*sd);}  // nageoires pectorales
    B.add(plan10([[-.40,0],[.45,0],[-.02,.80],[-.30,.72]],.05,.012),K.col,-L*.04,top+.01,0);                           // l'aileron dorsal
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<5;k++)BXg(B,K.noir,-XE+.30+k*.09,.10,sd*.355,0,0,0,.022,.32-k*.02,.02);   // les ouïes
    BXg(B,K.blanc,0,-.345,0,0,0,0,L*.96,.04,.54);                                                                      // le ventre blanc
    const tx=L*.46+.50;B.add(plan10([[0,0],[.30,.55],[.12,.0],[.30,-.55]],.05,.012),K.col,tx,.30,.50,0,0,0);          // la queue en croissant, autour de la tuyère
    break;}
  case 6:{ // L'ÉTOILE DE MER — cinq bras corail en façade, granuleux, un cœur doré
    const cx=XE+.12,cy=.32;boule(K.or,cx,cy,0,.14,.14,.08);
    for(let k=0;k<5;k++){const a=PI10/2+k*2*PI10/5,d=D(.10,Math.sin(a),Math.cos(a));corne(P(cx,cy,0),d,.13,.72,K.col);
      for(let j=1;j<6;j++){const q=P(cx,cy,0).addScaledVector(d,j*.11);boule(K.or,q.x+.05,q.y,q.z,.024);}}
    break;}
  case 7:{ // LE CORAIL — des branches roses qui poussent au-dessus du vé, perles de nacre au bout
    const br=(p,d,l,n)=>{const q=p.clone().addScaledVector(d,l);tige(p,q,.022+.016*n,K.col);if(n<=1){boule(K.blanc,q.x,q.y,q.z,.05);return;}
      br(q,D(d.x+.35,d.y,d.z+.45),l*.78,n-1);br(q,D(d.x-.35,d.y,d.z-.45),l*.78,n-1);};
    for(let k=0;k<3;k++)br(P((k-1)*L*.30,top-.02,(k-1)*.04),D(0,1,0),.30,3);
    break;}
  case 8:{ // L'ORQUE, PILOTE HYBRIDE — LE MOTEUR EST l'orque : le bloc noir = le corps, la cloche = la tête ronde (melon), les taches blanches sur
    //   les flancs, le ventre blanc = le carter, le grand aileron au dos, les nageoires larges, et l'échappement (+X) = la queue à nageoires horizontales
    const yC=.18,hx=-XE-.02;
    boule(K.col,hx-.14,yC,0,.46,.38,.40);                                                                              // la tête ronde
    BXg(B,K.blanc,hx-.22,yC-.20,0,0,0,.14,.60,.05,.46);                                                                // la gorge blanche
    for(let sd=-1;sd<=1;sd+=2){boule(K.blanc,hx-.30,yC+.14,sd*.30,.13,.06,.03);boule(K.noir,hx-.40,yC+.10,sd*.30,.035);   // tache et œil
      B.add(plan10([[0,0],[.50,-.10],[.46,-.30],[.06,-.24]],.04,.01),K.col,-XE+.20,yC-.06,sd*.36,PI10/2,0,-.4*sd);      // nageoires larges
      boule(K.blanc,-XE+.60,.60,sd*.265,.20,.07,.02);}                                                                  // taches blanches sur les flancs
    B.add(plan10([[-.40,0],[.40,0],[.05,.95],[-.20,.80]],.05,.012),K.col,-L*.02,top+.01,0);                            // le grand aileron
    BXg(B,K.blanc,0,-.345,0,0,0,0,L*.96,.04,.54);                                                                      // le ventre blanc
    const tx=L*.46+.46;for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[0,0],[.42,.22*sd],[.30,.0],[.42,-.22*sd]],.04,.01),K.col,tx,.30+(sd>0?.16:-.16),.50,PI10/2,0,0);   // flukes horizontales
    break;}
  case 9:{ // LA TORTUE — une carapace d'écailles hexagonales posée sur le boxer, la tête qui sort, quatre nageoires
    B.add(new THREE.SphereGeometry(1,18,8,0,PI10*2,0,PI10/2),K.colD,0,.30,0,0,0,0,L*.52,.38,.62);
    for(let k=0;k<11;k++){const a=k/11*2*PI10,r=k===0?0:(k<5?.45:.85),aa=k*2.4;const x=Math.cos(aa)*r*L*.40,z=Math.sin(aa)*r*.50,y=.30+.38*Math.sqrt(Math.max(0,1-(x/(L*.52))**2-(z/.62)**2))+.005;
      B.add(new THREE.CylinderGeometry(.11,.12,.03,6),K.col,x,y,z,0,0,0);}
    boule(K.col,XE+.30,.20,0,.16,.13,.13);tige(P(XE,.18,0),P(XE+.22,.20,0),.08,K.col);boule(K.noir,XE+.40,.24,.08,.025);boule(K.noir,XE+.40,.24,-.08,.025);
    for(let sx=-1;sx<=1;sx+=2)for(let sd=-1;sd<=1;sd+=2)plume(K.col,sx*L*.32,.05,sd*.55,.45,.18,0,sd>0?-.6:PI10+.6,0);
    break;}
  case 10:{ // LA ROQUETTE — quatre fusées blanches à nez rouge montées sur rails le long du bloc, une ogive en proue, des ailerons
    for(let sd=-1;sd<=1;sd+=2)for(let h=0;h<2;h++){const y=.05+h*.30,z=sd*(.48+h*.06);
      B.add(G10.axeX8,K.blanc,-L*.38,y,z,0,0,0,L*.70,.10,.10);corne(P(L*.32,y,z),D(1,0,0),.10,.28,K.col);
      for(let f=0;f<4;f++){const a=f/4*2*PI10+PI10/4;B.add(plan10([[0,0],[.22,0],[.05,.14],[0,.14]],.015,.004),K.col,-L*.38,y+Math.sin(a)*.10,z+Math.cos(a)*.10,a-PI10/2,PI10,0);}
      TX(B,K.chrome,[[.06,0],[.08,.04],[.11,.12]],-L*.38,y,z,PI10,10);TX(B,K.glow,[[.001,0],[.08,0],[.08,.01]],-L*.38-.10,y,z,0,10);
      BXg(B,K.chrome,0,y,sd*(.37+h*.03),0,0,0,L*.5,.04,(z*sd)-.33);}
    corne(P(XE+.04,.30,0),D(1,0,0),.30,.55,K.col);B.add(new THREE.TorusGeometry(.30,.03,6,24),K.blanc,XE+.05,.30,0,0,PI10/2,0);
    break;}
  case 11:{ // L'ÉLECTRIQUE — deux bobines Tesla de cuivre dressées sur le moteur, leurs tores chromés, des arcs bleus qui claquent
    for(let sd=-1;sd<=1;sd+=2){const x=sd*L*.36;tige(P(x,top,0),P(x,top+.75,0),.06,K.noir);
      for(let k=0;k<12;k++)B.add(new THREE.TorusGeometry(.09,.018,5,16),K.cu,x,top+.08+k*.055,0,PI10/2,0,0);
      B.add(new THREE.TorusGeometry(.20,.07,10,28),K.chrome,x,top+.82,0,PI10/2,0,0);boule(K.glow,x,top+.82,0,.06);}
    const arc=(a,b,n)=>{const p=[];for(let k=0;k<=n;k++){const t=k/n,j=k%2?1:-1;p.push([a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t+(k&&k<n?j*.06:0),a.z+(b.z-a.z)*t+(k&&k<n?(k%3-1)*.06:0)]);}B.add(tube10(p,.016,n*2,4),K.glow,0,0,0);};
    arc(P(-L*.36+.2,top+.82,0),P(L*.36-.2,top+.82,0),9);arc(P(-L*.36,top+.62,.18),P(-L*.36+.30,top+.02,.15),5);arc(P(L*.36,top+.62,-.18),P(L*.36-.30,top+.02,-.15),5);
    for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[0,0],[.14,.20],[.06,.20],[.20,.42],[.02,.16],[.10,.16],[-.04,-.04]],.02,.004),K.or,0,.05,sd*.37,0,sd>0?0:PI10,0);
    break;}
  case 12:{ // LA GRENADE — le bloc quadrillé comme un ananas kaki, le grand levier qui l'enjambe, la goupille et son anneau d'or
    for(let sd=-1;sd<=1;sd+=2)for(let r=0;r<3;r++)for(let k=0;k<7;k++)BXg(B,K.col,(k/6-.5)*L*.82,-.14+r*.13,sd*.35,0,0,0,L*.09,.10,.04);
    const lv=[[XE+.10,top-.05,0],[XE+.25,top+.35,0],[0,top+.62,0],[-XE+.10,top+.45,0],[-XE-.05,top+.10,0]];B.add(tube10(lv,.05,24,4),K.colD,0,0,0);
    for(const q of [lv[0],lv[4]])BXg(B,K.colD,q[0],q[1],0,0,0,0,.14,.10,.16);
    tige(P(XE+.12,top-.08,.10),P(XE+.30,top-.08,.10),.022,K.or);B.add(new THREE.TorusGeometry(.17,.03,8,28),K.or,XE+.46,top-.08,.10,0,0,0);
    break;}
  case 13:{ // LE VITRAIL — une rosace de verre coloré dressée en proue, cerclée de plomb et d'or, sur son pied
    const V=[0xff3a4a,0x3a6aff,0xffc030,0x2ad08a,0xb04aff,0xff7a2a],X=XE+.02,Y=top+.62;
    for(let k=0;k<12;k++){const m=new THREE.MeshPhongMaterial({color:V[k%6],emissive:V[k%6],emissiveIntensity:.5,shininess:300,specular:0xffffff,side:THREE.DoubleSide});
      B.add(new THREE.CircleGeometry(.50,6,k/12*2*PI10,2*PI10/12-.03),m,X,Y,0,0,PI10/2,0);}
    B.add(new THREE.TorusGeometry(.51,.035,6,32),K.or,X,Y,0,0,PI10/2,0);B.add(new THREE.TorusGeometry(.17,.022,6,24),K.or,X,Y,0,0,PI10/2,0);
    for(let k=0;k<12;k++){const a=k/12*2*PI10;tige(P(X+.01,Y+Math.sin(a)*.17,Math.cos(a)*.17),P(X+.01,Y+Math.sin(a)*.50,Math.cos(a)*.50),.01,K.noir);}
    tige(P(X,top,0),P(X,Y-.50,0),.05,K.or);B.add(tourY10([[.001,0],[.14,0],[.10,.06],[.001,.08]],10),K.or,X,top,0);
    break;}
  case 14:{ // LE SOLEIL — un disque d'or rayonnant dressé derrière l'étoile, vingt-quatre rayons alternés
    B.add(tourX([[.001,0],[.40,0],[.42,.03],[.40,.06],[.001,.06]],24),K.or,-.03,1.60,0,0,PI10/2,0);
    for(let k=0;k<24;k++){const a=k/24*2*PI10,l=k%2?.30:.55;B.add(plan10([[-.05,0],[.05,0],[0,l]],.03,.004),k%2?K.or:K.col,0,1.60+Math.sin(a)*.40,Math.cos(a)*.40,a-PI10/2,0,0);}
    B.add(tourX([[.001,0],[.24,0],[.24,.02],[.001,.02]],20),K.glow,.03,1.60,0,0,PI10/2,0);tige(P(0,1.18,0),P(0,1.20,0),.04,K.or);
    break;}
  case 15:{ // LE DRAGON (artiste 3) — le V16 EST le dragon : la tête sculptée forme l'avant du bloc (crâne, arcades, mâchoire ouverte sur la braise, crocs,
    //   naseaux fumants, cornes d'or), l'épine dorsale court dans la vallée du V, deux ailes de chauve-souris aux doigts d'or, la queue finit en tuyère
    const dr=-1,X0=XE+.02,hx=s=>-(X0+s);
    const crane=[{s:0,yt:.92,yb:-.20,w:.36,yw:.56},{s:.28,yt:1.04,yb:-.17,w:.42,yw:.66},{s:.60,yt:.92,yb:-.14,w:.41,yw:.56,wt:.30},{s:.92,yt:.72,yb:-.08,w:.31,yw:.42,wt:.19},
      {s:1.28,yt:.60,yb:-.02,w:.27,wt:.16},{s:1.52,yt:.58,yb:.02,w:.25,wt:.16},{s:1.68,yt:.50,yb:.07,w:.16,wt:.10}];
    B.add(h3_loft(crane.map(c=>({x:X0+c.s,r:h3_ring(c)})),dr),K.col,0,0,0);
    const mach=[{s:.30,yt:-.02,yb:-.40,w:.33},{s:.80,yt:-.14,yb:-.48,w:.28},{s:1.25,yt:-.23,yb:-.54,w:.22},{s:1.58,yt:-.30,yb:-.54,w:.13}];
    B.add(h3_loft(mach.map(c=>({x:X0+c.s,r:h3_ring(c)})),dr),K.colD,0,0,0);
    boule(K.glow,hx(.62),-.10,0,.17,.07,.20);boule(K.glow,hx(1.05),-.17,0,.16,.025,.12);                 // la braise au fond de la gueule
    for(let sd=-1;sd<=1;sd+=2){
      for(let k=0;k<7;k++){const s=.62+k*.14,yy=-.05+(s-.62)*.05,l=(k===3?.27:.15)-k*.004;corne(P(hx(s),yy,sd*(.20-k*.015)),D(0,-1,0),.032,l,K.blanc);                  // crocs du haut
        corne(P(hx(s+.05),-.38-(s-.30)*.12,sd*(.16-k*.012)),D(0,1,0),.026,k===4?.24:.13,K.blanc);}                                                          // crocs du bas
      B.add(h3_tube([[hx(.95),.84,sd*.19],[hx(.62),1.02,sd*.34],[hx(.34),.98,sd*.38]].map(q=>[-q[0],q[1],q[2]]),.06,.05,{dir:dr,sides:6}),K.or,0,0,0);          // l'arcade sourcilière
      B.add(G10.sph,K.glow,hx(.60),.76,sd*.385,0,0,0,.075,.06,.045);B.add(new THREE.TorusGeometry(.085,.016,5,10),K.or,hx(.60),.76,sd*.38,0,0,0);          // l'œil de braise
      B.add(h3_tube([[X0+.34,.92,sd*.30],[X0+.02,1.22,sd*.42],[X0-.38,1.52,sd*.62],[X0-.88,1.62,sd*.62]],.10,.012,{dir:dr,sides:6}),K.or,0,0,0);              // la grande corne
      B.add(h3_tube([[X0+.14,.46,sd*.36],[X0-.10,.52,sd*.58],[X0-.40,.40,sd*.72],[X0-.62,.22,sd*.74]],.065,.01,{dir:dr,sides:6}),K.col,0,0,0);               // la corne de joue
      B.add(h3_tube([[X0+1.05,-.40,sd*.20],[X0+.88,-.62,sd*.22],[X0+.70,-.80,sd*.20]],.04,.008,{dir:dr,sides:5}),K.or,0,0,0);                                 // l'épine du menton
      corne(P(hx(1.70),.50,sd*.07),D(-1,.02,0),.05,.08,K.noir);
      boule(K.halo(0xe8f0ff,.22),hx(1.86),.68,sd*.08,.09,.07,.07);boule(K.halo(0xe8f0ff,.14),hx(2.02),.86,sd*.12,.12,.09,.09);                  // la fumée des naseaux
    }
    for(let k=0;k<6;k++){const s=.10+k*.20;B.add(plan10([[-.10,0],[.10,0],[.05,.18-k*.014]],.035,.005),k%2?K.col:K.or,hx(s)+.0,.915+(s>.4?-(s-.28)*.30:.08),0);}  // la crête de la tête
    const ep=(k)=>-1.12+k*.27;                                            // l'ÉPINE : un rail dans la vallée du V, onze plaques d'or et de laque
    B.add(G10.axeX8,K.chrome,-1.12+.0,.62,0,0,0,0,2.60,.05,.05);
    for(let k=0;k<11;k++){const x=ep(k),h=.84-Math.abs(k-3)*.07;B.add(plan10([[-.11,0],[.11,0],[.09,h*.95],[.0,h]],.04,.006),k%2?K.col:K.or,x,.60,0);
      if(k%2===0)tige(P(x,.62,0),P(x,.18,0),.035,K.chrome);}
    for(let sd=-1;sd<=1;sd+=2){                                          // LES AILES : bras d'or, quatre doigts, membrane laquée, veines de braise
      const Sh=[-.62,.70,sd*.26],El=[-.42,1.28,sd*.56],Wr=[-.05,1.90,sd*1.00],T=[[-.60,2.25,sd*1.55],[.55,2.40,sd*1.95],[1.50,1.85,sd*1.90],[2.15,1.05,sd*1.40]],Rr=[1.70,.62,sd*.30];
      const N=[0,1,2].map(k=>[(T[k][0]+T[k+1][0])*.5-.12,(T[k][1]+T[k+1][1])*.5-.34,(T[k][2]+T[k+1][2])*.5-.12*sd]);
      const tr=[[Wr,T[0],N[0]],[Wr,N[0],T[1]],[Wr,T[1],N[1]],[Wr,N[1],T[2]],[Wr,T[2],N[2]],[Wr,N[2],T[3]],[Wr,T[3],Rr],[Wr,Rr,Sh],[Sh,Rr,[Rr[0],.50,sd*.20]]];
      B.add(h3_tris(tr),K.col,0,0,0);
      B.add(h3_tube([Sh,El,Wr],.07,.045,{sides:6}),K.or,0,0,0);boule(K.or,Wr[0],Wr[1],Wr[2],.075);boule(K.or,El[0],El[1],El[2],.06);
      for(const t of T)B.add(h3_tube([Wr,[ (Wr[0]+t[0])/2,(Wr[1]+t[1])/2+.06,(Wr[2]+t[2])/2],t],.04,.008,{sides:5}),K.or,0,0,0);
      for(const n of N)B.add(h3_tube([Wr,n],.014,.012,{sides:4}),K.glow,0,0,0);
      B.add(h3_tube([Sh,[0.4,.76,sd*.30],Rr],.03,.03,{sides:5}),K.or,0,0,0);}
    {const tq=[[XE-.1,.14,0],[XE+.40,.10,.10],[XE+.90,.18,-.10],[XE+1.40,.26,.04],[XE+1.62,.28,0]];                       // LA QUEUE : elle s'effile puis s'évase en tuyère
      B.add(h3_tube(tq,.30,.085,{sides:8}),K.col,0,0,0);
      for(let k=0;k<5;k++){const t=tq[k+0],h=.30-k*.045;B.add(plan10([[-.09,0],[.09,0],[.07,h]],.035,.005),k%2?K.col:K.or,t[0]+.05,t[1]+.22-k*.032,t[2]);}
      B.add(tourX([[.085,0],[.12,.04],[.22,.18],[.30,.30]],10),K.chrome,XE+1.62,.28,0,0,0,0);B.add(new THREE.TorusGeometry(.30,.014,4,16),K.or,XE+1.92,.28,0,0,PI10/2,0);
      B.add(tourX([[.001,0],[.26,0],[.26,.02],[.001,.02]],10),K.glow,XE+1.90,.28,0,0,0,0);
      for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[0,0],[.50,0],[.0,.30]],.03,.005),K.or,XE+.95,.12,sd*.14,sd*1.0,0,-.15);}
    break;}
  case 16:{ // LA PAGODE (artiste 3) — le temple-GARDIEN : la façade du H16 est un lion-gardien (shishi) à la crinière de flammes d'or qui tient la perle de feu dans la
    //   gueule ; la tour de quatre toits aux coins relevés est son chapeau, les lanternes ses boucles d'oreille
    const dr=-1,X0=XE-.02,hx=s=>-(X0+s),cy=.22;
    const face=[{s:0,yt:cy+.74,yb:cy-.62,w:.54,yw:cy+.16},{s:.22,yt:cy+.88,yb:cy-.64,w:.62,yw:cy+.24},{s:.44,yt:cy+.70,yb:cy-.54,w:.54,yw:cy+.12,wt:.42},
      {s:.62,yt:cy+.40,yb:cy-.38,w:.42,wt:.30},{s:.76,yt:cy+.30,yb:cy-.32,w:.34,wt:.24},{s:.84,yt:cy+.22,yb:cy-.26,w:.26,wt:.18}];
    B.add(h3_loft(face.map(c=>({x:X0+c.s,r:h3_ring(c)})),dr),K.col,0,0,0);
    const gu=[{s:.34,yt:cy-.44,yb:cy-.74,w:.46},{s:.62,yt:cy-.46,yb:cy-.80,w:.38},{s:.82,yt:cy-.44,yb:cy-.78,w:.26}];
    B.add(h3_loft(gu.map(c=>({x:X0+c.s,r:h3_ring(c)})),dr),K.colD,0,0,0);                                 // la mâchoire
    boule(K.glow,hx(.60),cy-.42,0,.20);B.add(new THREE.TorusGeometry(.22,.03,5,12),K.or,hx(.62),cy-.42,0,0,PI10/2,0);   // la PERLE de feu tenue entre les crocs
    for(let sd=-1;sd<=1;sd+=2){
      for(let k=0;k<4;k++){corne(P(hx(.46+k*.11),cy-.28,sd*(.22-k*.02)),D(0,-1,0),.04,k%3===1?.30:.18,K.blanc);corne(P(hx(.50+k*.11),cy-.56,sd*(.20-k*.02)),D(0,1,0),.032,.15,K.blanc);}
      B.add(h3_tris(h3_prism([hx(.36),cy+.46,sd*.20],[hx(.74),cy+.50,sd*.34],[hx(.68),cy+.28,sd*.14],[0,.05,0])),K.or,0,0,0);   // le sourcil lourd
      B.add(G10.sph,K.glow,hx(.60),cy+.28,sd*.27,0,0,0,.10,.15,.15);B.add(new THREE.TorusGeometry(.17,.032,5,12),K.or,hx(.62),cy+.28,sd*.27,0,PI10/2,0);boule(K.noir,hx(.69),cy+.28,sd*.27,.03,.11,.04);   // l'œil rond
      B.add(h3_tube([[X0+.50,cy+.04,sd*.50],[X0+.36,cy-.06,sd*.72],[X0+.28,cy-.30,sd*.84]],.07,.03,{dir:dr,sides:6}),K.or,0,0,0);boule(K.glow,hx(.28),cy-.34,sd*.84,.07);   // l'oreille et son pendant de feu
      boule(K.noir,hx(.84),cy+.02,sd*.08,.05);}
    B.add(h3_tube([[X0+.30,cy+.78,0],[X0+.16,cy+1.04,0],[X0-.06,cy+1.30,0]],.08,.012,{dir:dr,sides:6}),K.or,0,0,0);        // la corne du front
    for(let k=0;k<14;k++){const a=k/14*2*PI10+.22,ca=Math.cos(a),sa=Math.sin(a),rw=.78,rh=.84,l=k%2?.40:.64;       // LA CRINIÈRE : quatorze flammes autour du visage
      const A1=[hx(.06),cy+sa*rh*.80-.04,ca*rw*.80],B1=[hx(.06),cy+Math.sin(a+.40)*rh*.80-.04,Math.cos(a+.40)*rw*.80],tip=[hx(-.06),cy+Math.sin(a+.20)*(rh+l)-.04,Math.cos(a+.20)*(rw+l*.8)];
      B.add(h3_tris(h3_prism(A1,B1,tip,[.07,0,0])),k%2?K.colD:K.or,0,0,0);}
    // LA TOUR : quatre étages, chacun son toit relevé, ses fenêtres de braise, ses lanternes
    tige(P(0,.70,0),P(0,2.70,0),.07,K.or);
    for(let k=0;k<4;k++){const y0=1.02+k*.40,r=.78-k*.12,w=.34-k*.05;
      BXg(B,K.col,0,y0+.10,0,0,0,0,w*2.0,.22,w*2.0);BXg(B,K.glow,0,y0+.10,0,0,0,0,w*2.0+.02,.07,.10);BXg(B,K.glow,0,y0+.10,0,0,0,0,.10,.07,w*2.0+.02);
      const T=h3_toit(r,.20,.15);B.add(h3_tris(T.top),k%2?K.or:K.col,0,y0+.22,0);B.add(h3_tris(T.under),K.colD,0,y0+.22,0);
      for(let q=0;q<8;q++){const a=T.ring[q],b=T.ring[(q+1)%8];B.add(h3_tube([[a[0],a[1]+y0+.22,a[2]],[b[0],b[1]+y0+.22,b[2]]],.016,.016,{sides:4,seg:2}),K.or,0,0,0);}
      for(const q of [0,2,4,6]){const c=T.ring[q];tige(P(c[0],c[1]+y0+.22,c[2]),P(c[0],c[1]+y0+.10,c[2]),.008,K.or);boule(K.glow,c[0],c[1]+y0+.06,c[2],.05,.06,.05);}}   // les lanternes aux coins relevés
    corne(P(0,2.50,0),D(0,1,0),.05,.50,K.or);for(let k=0;k<5;k++)B.add(new THREE.TorusGeometry(.065-k*.007,.014,4,10),K.or,0,2.56+k*.08,0,PI10/2,0,0);boule(K.glow,0,3.10,0,.05);
    break;}
  case 17:{ // LE KRAKEN (artiste 3) — le quadriturbo EST le kraken : un grand MANTEAU laqué couvre le V8 (arête d'or, taches de bioluminescence, deux nageoires), la tête à bec
    //   forme l'avant du bloc, deux YEUX dont l'iris est une roue de turbo, huit tentacules en spirale à ventouses d'or, le tuyau d'échappement est son siphon
    const dr=-1,X0=XE-.04,hx=s=>-(X0+s);
    const man=[{x:-.62,yt:1.04,yb:.50,w:.34,yw:.78},{x:-.20,yt:1.52,yb:.44,w:.52,yw:.92},{x:.40,yt:1.78,yb:.46,w:.58,yw:1.02},{x:.95,yt:1.60,yb:.50,w:.50,yw:.96},{x:1.45,yt:1.30,yb:.56,w:.33,yw:.86},{x:1.92,yt:1.08,yb:.70,w:.10,yw:.88}];
    B.add(h3_loft(man.map(c=>({x:c.x,r:h3_ring(c)})),1),K.col,0,0,0);
    const yTop=x=>{for(let k=0;k<man.length-1;k++)if(x<=man[k+1].x){const t=(x-man[k].x)/(man[k+1].x-man[k].x);return man[k].yt+(man[k+1].yt-man[k].yt)*Math.max(0,t);}return man[man.length-1].yt;};
    const wAt=x=>{for(let k=0;k<man.length-1;k++)if(x<=man[k+1].x){const t=(x-man[k].x)/(man[k+1].x-man[k].x);return man[k].w+(man[k+1].w-man[k].w)*Math.max(0,t);}return .1;};
    {const pr=[];for(let k=0;k<=12;k++){const x=-.55+k*.2;pr.push([x,yTop(x)+.012,0]);}B.add(h3_tube(pr,.028,.014,{sides:6}),K.or,0,0,0);}                    // l'arête d'or du manteau
    for(let sd=-1;sd<=1;sd+=2){
      for(let k=0;k<5;k++){const x=-.10+k*.38;const ww=wAt(x),yy=.88+(k===2?.12:0)-k*.03;boule(K.glow,x,yy,sd*(ww*.98),.05,.05,.045);boule(K.or,x,yy,sd*(ww*1.0),.07,.07,.025);}   // les taches de bioluminescence cerclées d'or
      B.add(plan10([[0,0],[.60,.18],[.92,.02],[.52,-.24]],.035,.006),K.colD,.62,1.02,sd*.56,sd*.55,0,0);                                                    // les nageoires du manteau
      B.add(h3_tube([[.62,1.02,sd*.52],[1.05,1.12,sd*.82],[1.52,1.04,sd*.96]],.030,.012,{sides:5}),K.or,0,0,0);
      const E=bat10();E.f=true;E.plat();                                     // L'ŒIL : une boule de braise, une roue de turbo pour iris, une pupille en fente, des lids d'or
      E.add(G10.sph,K.colD,0,0,0,0,0,0,.30,.28,.28);E.add(G10.sph,K.glow,.15,0,0,0,0,0,.24,.24,.24);
      E.add(new THREE.TorusGeometry(.27,.036,6,16),K.or,.0,0,0,0,PI10/2,0);
      E.add(new THREE.TorusGeometry(.16,.016,5,16),K.or,.27,0,0,0,PI10/2,0);
      for(let q=0;q<10;q++){const a=q/10*2*PI10;E.add(plan10([[0,-.02],[.15,-.045],[.17,.02]],.012,.002),K.chrome,.285,Math.sin(a)*.12,Math.cos(a)*.12,a-PI10/2,PI10/2,.5);}
      E.add(G10.box,K.noir,.385,0,0,0,0,0,.02,.05,.34);
      E.add(plan10([[-.30,.10],[.22,.34],[.34,.22],[-.10,.10]],.03,.004),K.or,0,.04,0,0,0,0);                                                            // le sourcil
      const eg=new THREE.Group();E.fin(eg);eg.position.set(hx(.22),.22,sd*.46);eg.rotation.y=-sd*(PI10-1.0);eg.scale.setScalar(1.3);g.add(eg);}
    B.add(h3_loft([{x:X0-.10,r:h3_ring({yt:.64,yb:-.26,w:.36,yw:.22})},{x:X0+.22,r:h3_ring({yt:.60,yb:-.24,w:.42,yw:.18})},{x:X0+.48,r:h3_ring({yt:.46,yb:-.20,w:.36,yw:.14})},{x:X0+.64,r:h3_ring({yt:.30,yb:-.10,w:.22,yw:.10})}],dr),K.col,0,0,0);   // la tête
    corne(P(hx(.62),.12,0),D(-1,-.55,0),.11,.26,K.or);corne(P(hx(.62),.04,0),D(-1,.55,0),.09,.20,K.or);              // le bec
    for(let k=0;k<8;k++){const a=k/8*2*PI10+.2,swirl=k%2?1:-1,pts=[],sk=[];
      const pt=t=>{const ra=.24+t*.70,an=a+swirl*t*1.5;return [hx(.50+t*1.15),.04+Math.sin(an)*ra*.8-t*t*.16+(t>.8?(t-.8)*1.2:0),Math.cos(an)*ra];};
      for(let j=0;j<=7;j++)pts.push(pt(j/7));
      B.add(h3_tube(pts,.13,.014,{sides:6,seg:28,prof:t=>.15*(1-t)+.016*t+.02*Math.sin(t*3)}),K.col,0,0,0);
      for(let j=1;j<7;j++){const q=pt(j/7);boule(K.or,q[0],q[1]-.09*(1-j/7)-.02,q[2],.045+.022*(1-j/7));}}
    break;}
  }
  B.plat();
}
/* LES LÉGENDES ET LE COSMOS (19-30) : les mêmes règles, posées sur les objets d'`orig10` */
function theme30b(B,i,K,g){   // (B est réassignable : le dragon noir bâtit sa tête à part)
  const P=(x,y,z)=>new THREE.Vector3(x,y,z),D=(x,y,z)=>new THREE.Vector3(x,y,z).normalize();
  const tige=(a,b,r,m)=>B.add(tube10([[a.x,a.y,a.z],[b.x,b.y,b.z]],r,1,8),m,0,0,0),corne=(p,d,r,l,m)=>vers10(B,cone10(r,l,10),m,p,d,1);
  const boule=(m,x,y,z,sx,sy,sz)=>B.add(G10.sph,m,x,y,z,0,0,0,sx,sy||sx,sz||sx);
  const plume=(m,x,y,z,len,larg,rx,ry,rz)=>B.add(plan10([[0,-larg*.5],[len*.75,-larg*.35],[len,0],[len*.75,larg*.35],[0,larg*.5]],.02,.004),m,x,y,z,rx||0,ry||0,rz||0);
  B.plat();
  switch(i){
  case 18:{ // LE SPHINX (artiste 3) — les trois chambres de verre sont son dos, trois pyramides de Gizeh y dorment ; la TÊTE (nemès rayé or et lapis, visage fin aux yeux de kohl, uræus,
    //   fausse barbe) regarde droit devant, les pattes de lion s'allongent sous elle, la poitrine tient tout le corps au rotor
    for(let k=0;k<3;k++){const x=-.52+k*.52;B.add(new THREE.ConeGeometry(.42,.50,4),K.or,x,.86,0,0,PI10/4,0);
      for(let j=0;j<4;j++)B.add(new THREE.TorusGeometry(.64,.025,5,32),j%2?K.or:K.colD,x-.11+j*.075,0,0,0,PI10/2,0);}
    const HX=1.00,hy=.46;                                                    // le plan arrière du visage, le centre du visage
    BXg(B,K.colD,HX-.06,hy-.55,0,0,0,0,.60,.90,.62);                          // la poitrine
    B.add(h3_loft([{x:HX-.30,r:h3_ring({yt:hy+.22,yb:hy-.60,w:.30})},{x:HX+.05,r:h3_ring({yt:hy+.30,yb:hy-.48,w:.30})}],1),K.col,0,0,0);                 // le cou
    B.add(h3_loft([{x:HX,r:h3_ring({yt:hy+.50,yb:hy-.42,w:.34,yw:hy+.05})},{x:HX+.20,r:h3_ring({yt:hy+.52,yb:hy-.40,w:.33,yw:hy+.05})},{x:HX+.27,r:h3_ring({yt:hy+.44,yb:hy-.36,w:.27,yw:hy+.0,wt:.22})}],1),K.col,0,0,0);   // le visage
    {const nm=[{x:HX-.52,yt:hy+.72,yb:hy-.66,w:.62,yw:hy-.10,wt:.40,wb:.28},{x:HX-.12,yt:hy+.74,yb:hy-.70,w:.58,yw:hy-.10,wt:.42,wb:.24},{x:HX+.14,yt:hy+.66,yb:hy-.76,w:.46,yw:hy-.15,wt:.34,wb:.20},{x:HX+.20,yt:hy+.60,yb:hy-.78,w:.34,yw:hy-.20,wt:.32,wb:.16}];
      B.add(h3_loft(nm.map(c=>({x:c.x,r:h3_ring(c)})),1),K.colD,0,0,0);                                 // le NEMÈS : un trapèze sombre qui s'évase derrière le visage
      const zp=y=>{const d=y-hy;return d>=-.10?.58-(d+.10)/.84*.16:d>=-.46?.51+(d+.46)/.36*.07:.24+(d+.70)/.24*.27;};      // la demi-largeur du nemès à la hauteur y
      for(let k=0;k<9;k++){const yy=hy-.62+k*.17;for(let sd=-1;sd<=1;sd+=2)BXg(B,k%2?K.glow:K.or,HX-.30,yy,sd*(zp(yy)*1.0+.012),0,0,0,.52,.07,.045);}   // les rayures or et lapis, posées sur les pans
      BXg(B,K.or,HX-.26,hy+.74,0,0,0,0,.50,.04,.76);}                                                   // le dessus du nemès, un filet d'or
    for(let sd=-1;sd<=1;sd+=2){BXg(B,K.colD,HX+.04,hy-.64,sd*.42,0,0,0,.12,.84,.24);for(let k=0;k<4;k++)BXg(B,k%2?K.glow:K.or,HX+.105,hy-.30-k*.17,sd*.42,0,0,0,.03,.075,.24);   // les pans du nemès qui tombent sur la poitrine
      B.add(plan10([[0,-.07],[.20,-.095],[.34,0],[.20,.095],[0,.07]],.025,.004),K.or,HX+.12,hy+.18,sd*.265,0,sd*.18,0);   // l'œil de kohl, en amande
      B.add(G10.sph,K.glow,HX+.30,hy+.18,sd*.23,0,0,0,.035,.04,.04);
      B.add(plan10([[0,0],[.46,.04],[.50,.075],[0,.07]],.03,.004),K.or,HX+.10,hy+.31,sd*.265,0,sd*.18,0);                // le sourcil allongé
      B.add(plan10([[0,0],[.30,-.02],[.36,-.07],[0,-.06]],.02,.004),K.or,HX+.12,hy+.08,sd*.265,0,sd*.18,0);}            // le fard sous l'œil
    B.add(h3_tris(h3_prism([HX+.20,hy+.14,0],[HX+.34,hy-.08,.075],[HX+.34,hy-.08,-.075],[0,0,0]).concat(h3_prism([HX+.20,hy+.14,0],[HX+.34,hy-.14,.075],[HX+.20,hy-.14,0],[0,0,0]))),K.col,0,0,0);   // le nez
    BXg(B,K.colD,HX+.27,hy-.24,0,0,0,0,.04,.035,.30);BXg(B,K.or,HX+.28,hy-.31,0,0,0,0,.035,.03,.24);                      // les lèvres
    B.add(h3_tube([[HX+.25,hy-.40,0],[HX+.31,hy-.62,0],[HX+.30,hy-.92,0],[HX+.44,hy-1.08,0]],.06,.04,{sides:4}),K.or,0,0,0);BXg(B,K.glow,HX+.44,hy-1.10,0,0,0,0,.10,.10,.10);   // la fausse barbe
    B.add(h3_tube([[HX+.18,hy+.50,0],[HX+.30,hy+.62,0],[HX+.34,hy+.80,0],[HX+.32,hy+.92,0]],.045,.03,{sides:6}),K.or,0,0,0);                 // l'uræus
    B.add(h3_tris(h3_prism([HX+.30,hy+.84,.0],[HX+.36,hy+.74,.07],[HX+.36,hy+.74,-.07],[0,0,0])),K.or,0,0,0);boule(K.glow,HX+.38,hy+.80,0,.025);
    for(let sd=-1;sd<=1;sd+=2){
      BXg(B,K.col,HX+.50,-.52,sd*.30,0,0,0,.72,.20,.22);BXg(B,K.col,HX+.48,-.38,sd*.30,0,0,0,.50,.14,.20);                                         // l'avant-bras et la patte
      for(let q=0;q<3;q++)corne(P(HX+.86,-.52,sd*.30+(q-1)*.07),D(1,-.1,0),.026,.10,K.blanc);
      tige(P(.62,-.30,sd*.30),P(HX+.2,-.5,sd*.30),.07,K.or);}
    break;}
  case 19:{ // LE PHÉNIX (artiste 3) — la turbine ouverte est le corps de l'oiseau de feu : une TÊTE sculptée (crête de plumes, bec crochu, œil de braise) remplace le cône d'entrée,
    //   deux ailes de plumes aux couleurs de la flamme jaillissent des longerons, la queue est une gerbe de plumes autour de la tuyère
    const y0=0;
    B.add(h3_loft([{x:.86,r:h3_ring({yt:.42,yb:-.42,w:.42,yw:.04})},{x:1.12,r:h3_ring({yt:.44,yb:-.34,w:.36,yw:.06})},{x:1.38,r:h3_ring({yt:.40,yb:-.22,w:.28,yw:.08,wt:.18})},{x:1.60,r:h3_ring({yt:.26,yb:-.10,w:.18,wt:.12})},{x:1.76,r:h3_ring({yt:.18,yb:-.04,w:.10,wt:.07})}],1),K.col,0,0,0);
    B.add(h3_tube([[1.70,.12,0],[1.98,.12,0],[2.20,-.02,0],[2.28,-.26,0]],.11,.012,{sides:4}),K.or,0,0,0);                                                       // le bec crochu
    B.add(h3_tube([[1.68,-.04,0],[1.90,-.07,0],[2.02,-.14,0]],.07,.012,{sides:4}),K.or,0,0,0);
    for(let sd=-1;sd<=1;sd+=2){
      B.add(G10.sph,K.glow,1.44,.14,sd*.24,0,0,0,.07,.07,.05);B.add(new THREE.TorusGeometry(.085,.018,5,12),K.or,1.45,.14,sd*.24,0,PI10/2,0);                              // l'œil de braise, cerclé d'or
      B.add(h3_tube([[1.62,.28,sd*.10],[1.40,.34,sd*.22],[1.20,.30,sd*.28]],.045,.03,{sides:5}),K.or,0,0,0);                                                                 // l'arcade
      boule(K.noir,1.72,.12,sd*.04,.025);
      for(let k=0;k<7;k++){const t=k/6,len=1.35-Math.abs(k-3)*.10-(k>3?.1:0);                                                                                             // L'AILE : sept plumes en éventail
        const m=k<2?K.or:(k<5?K.col:K.glow),rx=.50-k*.10,tz=sd*(.95+.78*Math.sin(t*2.4+.1)*.7+k*.14),tx=.55-k*.34-.15,ty=.15+.55*Math.cos(t*2.0)*.8-k*.07;
        h3_leaf(B,m,[[rx,.0,sd*.50],[rx-.15,.12+.2*(1-t),sd*(.80+k*.04)],[tx,ty,tz]],.17+.018*(6-k),{ribMat:K.or});}
      for(let k=0;k<5;k++){const x0=-.5+k*.22;h3_leaf(B,k%2?K.glow:K.or,[[x0,.04,sd*.56],[x0-.2,.10,sd*.82],[x0-.46,.18-k*.02,sd*(.98+k*.03)]],.12,{ribMat:K.or});}}          // les couvertures de l'aile
    for(let k=0;k<5;k++){const z=(k-2)*.10,up=1-Math.abs(k-2)*.22;                                                                                                     // LA CRÊTE : cinq plumes qui se couchent vers l'arrière
      h3_plume(B,k%2?K.or:K.glow,[[1.34,.40,z*.6],[1.10,.68+.12*up,z*1.4],[.66,.96+.3*up,z*2.2],[.20,.96+.22*up,z*3.0]],.075);}
    for(let k=0;k<12;k++){const a=k/12*2*PI10,A1=[.90,Math.cos(a)*.40,Math.sin(a)*.40],B1=[.90,Math.cos(a+.52)*.40,Math.sin(a+.52)*.40],T=[.64,Math.cos(a+.26)*.56,Math.sin(a+.26)*.56];
      B.add(h3_tris(h3_prism(A1,B1,T,[.03,0,0])),k%2?K.or:K.col,0,0,0);}                                                                                              // la collerette de plumes
    for(let k=0;k<7;k++){const a=k/7*2*PI10+.2,ca=Math.cos(a),sa=Math.sin(a);                                                                                        // LA QUEUE : des plumes de feu autour de la tuyère
      h3_leaf(B,k%3===0?K.or:(k%3===1?K.col:K.glow),[[-1.0,ca*.40,sa*.40],[-1.55,ca*.78,sa*.78+.1],[-2.15,ca*1.05+.12*Math.sin(k),sa*1.15],[-2.85,ca*1.12,sa*1.26+.2]],.17,{side:[0,-sa,ca],ribMat:K.or});}
    break;}
  case 20:{ // L'ATLANTIDE (artiste 3) — POSÉIDON : le tube de plasma est sa nuque, quatre colonnes doriques l'encadrent, son visage de bronze marin (cheveux et barbe de vagues, yeux
    //   de glace) regarde devant lui, et le TRIDENT forme sa couronne
    const HX=1.12;
    for(let k=0;k<4;k++){const a=k/4*2*PI10+PI10/4,y=Math.sin(a)*.42,z=Math.cos(a)*.42;B.add(new THREE.CylinderGeometry(.05,.05,1.6,10).rotateZ(PI10/2),K.or,0,y,z);
      B.add(new THREE.CylinderGeometry(.08,.08,.06,10).rotateZ(PI10/2),K.or,.80,y,z);B.add(new THREE.CylinderGeometry(.08,.08,.06,10).rotateZ(PI10/2),K.or,-.80,y,z);}
    B.add(h3_loft([{x:HX-.10,r:h3_ring({yt:.54,yb:-.54,w:.48,yw:.08})},{x:HX+.20,r:h3_ring({yt:.58,yb:-.56,w:.50,yw:.10})},{x:HX+.46,r:h3_ring({yt:.54,yb:-.58,w:.46,yw:.04,wt:.30})},{x:HX+.60,r:h3_ring({yt:.44,yb:-.58,w:.36,yw:.0,wt:.26})}],1),K.cu,0,0,0);   // le visage
    for(let sd=-1;sd<=1;sd+=2){
      B.add(h3_tube([[HX+.62,.30,sd*.06],[HX+.58,.30,sd*.22],[HX+.46,.34,sd*.36]],.05,.04,{sides:5}),K.or,0,0,0);                                                             // l'arcade
      B.add(G10.sph,K.glow,HX+.56,.18,sd*.22,0,0,0,.05,.055,.07);B.add(new THREE.TorusGeometry(.085,.02,5,12),K.or,HX+.59,.18,sd*.22,0,PI10/2,0);                              // l'œil de glace
      B.add(h3_tube([[HX+.62,-.14,sd*.10],[HX+.78,-.30,sd*.34],[HX+.70,-.60,sd*.40],[HX+.82,-.80,sd*.30]],.07,.02,{sides:5}),K.col,0,0,0);                                     // la moustache de vagues
      for(let k=0;k<4;k++){const z=sd*(.08+k*.11);B.add(h3_tube([[HX+.52,-.50,z],[HX+.74,-.78,z*1.2],[HX+.58,-1.00,z*.9],[HX+.80,-1.20-.06*k,z*.5],[HX+.66,-1.40-.05*k,z*.3]],.08,.012,{sides:5}),k%2?K.col:K.colD,0,0,0);
        boule(K.glow,HX+.66,-1.42-.05*k,z*.3,.03);}}                                                                                                                               // la barbe : des vagues qui finissent en perles
    B.add(h3_tris(h3_prism([HX+.62,.16,0],[HX+.78,-.12,.07],[HX+.78,-.12,-.07],[0,0,0]).concat(h3_prism([HX+.62,.16,0],[HX+.78,-.16,.07],[HX+.62,-.16,0],[0,0,0]))),K.cu,0,0,0);   // le nez
    for(let k=0;k<8;k++){const z=(k-3.5)*.115,w=Math.abs(k-3.5);                                                                                                                    // LES CHEVEUX : des vagues rejetées en arrière
      B.add(h3_tube([[HX+.50,.46,z*.9],[HX+.15,.70+.1*(3.5-w)/3.5,z*1.3],[HX-.35,.62,z*1.8],[HX-.85,.28,z*2.2]],.08,.012,{sides:5}),k%2?K.col:K.colD,0,0,0);}
    for(const [x,w] of [[HX+.46,0],[HX+.52,.30],[HX+.52,-.30]]){const hy=w===0?1.55:1.30;                                                                                         // LE TRIDENT : la couronne
      B.add(h3_tube([[HX+.40,.50,w],[HX+.40,.80,w],[HX+.40,hy-.1,w]],.045,.03,{sides:6}),K.or,0,0,0);corne(P(HX+.40,hy-.12,w),D(0,1,0),.07,.30,K.or);}
    B.add(h3_tube([[HX+.40,.74,-.34],[HX+.40,.68,0],[HX+.40,.74,.34]],.03,.03,{sides:5}),K.or,0,0,0);
    for(const w of [-.30,.30])B.add(h3_tube([[HX+.40,.50,w],[HX+.40,.60,w*.0+w*.9],[HX+.40,.64,0]],.03,.03,{sides:4}),K.or,0,0,0);
    break;}
  case 21:{ // LA LANCE D'ODIN (artiste 3) — Munin le corbeau borgne : son bec est la pointe de Gungnir, sa collerette de plumes ceint l'épaule, ses ailes sont les empennages,
    //   les runes brillent sur le fût, l'orbite vide porte une rune
    B.add(h3_loft([{x:.56,r:h3_ring({yt:.40,yb:-.40,w:.40,yw:.0})},{x:.88,r:h3_ring({yt:.42,yb:-.36,w:.38,yw:.02})},{x:1.14,r:h3_ring({yt:.36,yb:-.22,w:.30,yw:.04,wt:.20})},{x:1.36,r:h3_ring({yt:.24,yb:-.10,w:.18,wt:.12})}],1),K.col,0,0,0);
    B.add(h3_loft([{x:1.30,r:h3_ring({yt:.20,yb:-.04,w:.14,wt:.10})},{x:1.72,r:h3_ring({yt:.14,yb:-.05,w:.10,wt:.07})},{x:2.10,r:h3_ring({yt:.06,yb:-.07,w:.05,wt:.04})},{x:2.50,r:h3_ring({yt:-.02,yb:-.09,w:.012,wt:.01})}],1),K.chrome,0,0,0);   // le bec = la pointe
    B.add(h3_loft([{x:1.30,r:h3_ring({yt:-.06,yb:-.20,w:.10,wt:.07})},{x:1.70,r:h3_ring({yt:-.10,yb:-.19,w:.06,wt:.04})},{x:1.96,r:h3_ring({yt:-.12,yb:-.16,w:.012,wt:.01})}],1),K.alu,0,0,0);
    B.add(new THREE.TorusGeometry(.12,.022,5,12),K.or,1.34,.0,0,0,PI10/2,0);
    for(let sd=-1;sd<=1;sd+=2){
      B.add(h3_tube([[1.34,.24,sd*.10],[1.12,.32,sd*.22],[.92,.28,sd*.30]],.05,.03,{sides:5}),K.or,0,0,0);
      if(sd>0){B.add(G10.sph,K.glow,1.08,.12,.27,0,0,0,.065,.065,.045);B.add(new THREE.TorusGeometry(.08,.018,5,12),K.or,1.09,.12,.27,0,PI10/2,0);}   // l'œil de glace
      else{B.add(G10.box,K.noir,1.08,.12,-.28,0,0,0,.12,.14,.03);BXg(B,K.glow,1.08,.12,-.30,0,0,0,.02,.12,.012);BXg(B,K.glow,1.08,.14,-.30,0,0,.9,.02,.08,.012);}      // l'orbite vide et sa rune
      B.add(h3_tube([[.70,.28,sd*.12],[.40,.52,sd*.34],[.10,.70,sd*.40]],.08,.012,{sides:5}),K.colD,0,0,0);                                                                          // les plumes de la nuque
      for(let k=0;k<7;k++){const t=k/6,rx=.30-k*.20,m=k%2?K.col:K.colD;                                                                                                                 // L'AILE : sept rémiges
        h3_leaf(B,m,[[rx,.0,sd*.44],[rx-.22,.06+.10*t,sd*(.80+k*.04)],[rx-.62-.1*k,.14-.18*t,sd*(1.20+.55*Math.cos(t*1.5)-k*.07)]],.15,{ribMat:K.chrome});}}
    for(let r=0;r<3;r++)for(let k=0;k<10;k++){const a=k/10*2*PI10+r*.3,A1=[.62+r*.10,Math.cos(a)*.38,Math.sin(a)*.38],B1=[.62+r*.10,Math.cos(a+.62)*.38,Math.sin(a+.62)*.38],T=[.30+r*.10,Math.cos(a+.31)*(.52+r*.04),Math.sin(a+.31)*(.52+r*.04)];
      B.add(h3_tris(h3_prism(A1,B1,T,[.03,0,0])),(k+r)%2?K.colD:K.col,0,0,0);}                                                                                                           // la collerette
    for(let k=0;k<4;k++){const x=-.85+k*.42;for(let j=0;j<6;j++){const a=j/6*2*PI10;B.add(G10.box,K.glow,x+.12,Math.sin(a)*.448,Math.cos(a)*.448,a,0,0,.08,.012,.012);}}
    break;}
  case 22:{ // LE CŒUR BATTANT — un cœur laqué à la tête, aorte et veines qui courent jusqu'à la tuyère
    boule(K.col,1.18,.12,.12,.26);boule(K.col,1.18,.12,-.12,.26);corne(P(1.18,0,0),D(0,-1,0),.33,.48,K.col);tige(P(.95,0,0),P(1.10,0,0),.12,K.colD);
    tige(P(1.18,.32,0),P(1.02,.58,0),.08,K.colD);B.add(new THREE.TorusGeometry(.18,.08,8,16,PI10),K.colD,.84,.58,0,0,0,0);
    for(let k=0;k<4;k++){const a=k/4*2*PI10;B.add(tube10([[.70,Math.sin(a)*.2,Math.cos(a)*.2],[.2,Math.sin(a)*.27,Math.cos(a)*.27],[-.6,Math.sin(a+.5)*.35,Math.cos(a+.5)*.35],[-1.1,Math.sin(a)*.20,Math.cos(a)*.20]],.02,20,5),K.colD,0,0,0);}
    break;}
  case 23:{ // LE DRAGON NOIR (Léo : « un dragon noir, la tête qui fait la tête du réacteur, pas besoin de corps, une tête de T-rex avec des
    //   cornes ») — la gueule REMPLACE le dôme : crâne massif, museau long et carré, mâchoire inférieure ouverte sur la braise du cœur,
    //   rangées de crocs, arcades sourcilières lourdes, yeux de braise, deux grandes cornes qui balaient vers l'arrière, crête de pointes
    const B0=B;B=bat10();B.f=true;B.plat();                                             // la tête est bâtie à part puis GRANDIE (×1,6) devant le dôme
    const X0=.62,noir=K.col;
    BXg(B,noir,X0+.30,.12,0,0,0,-.08,.72,.66,.70);                                      // le crâne
    BXg(B,noir,X0+.88,.10,0,0,0,-.04,.62,.36,.46);                                      // le museau
    BXg(B,noir,X0+1.20,.09,0,0,0,0,.18,.30,.40);
    for(let sd=-1;sd<=1;sd+=2)boule(K.or,X0+1.27,.18,sd*.12,.04);                       // les naseaux cerclés d'or
    BXg(B,noir,X0+.80,-.36,0,0,0,-.42,.80,.14,.40);                                     // la mâchoire inférieure, ouverte
    B.add(tourX([[.001,0],[.22,0],[.22,.02],[.001,.02]],12),K.glow,X0+.95,-.12,0,0,0,-.21);   // la braise au fond de la gueule
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<6;k++){const x=X0+.62+k*.11;
      corne(P(x,-.08,sd*.20),D(0,-1,0),.028,.13-k*.008,K.blanc);                      // crocs du haut
      corne(P(x-.02,-.40+(k*.11)*.45,sd*.18),D(0,1,0),.024,.10,K.blanc);}              // crocs du bas
    for(let sd=-1;sd<=1;sd+=2){
      BXg(B,noir,X0+.52,.44,sd*.24,0,0,-.25,.40,.12,.16);                              // l'arcade sourcilière
      boule(K.glow,X0+.62,.34,sd*.30,.06,.045,.045);                                   // l'œil de braise
      const c0=P(X0+.30,.46,sd*.30),c1=P(X0-.05,.85,sd*.55);tige(c0,c1,.08,K.or);       // la grande corne
      corne(c1,D(-1,.55,sd*.35),.075,.55,K.or);
      corne(P(X0+.05,.20,sd*.36),D(-1,-.1,sd*.6),.05,.35,noir);                         // les cornes de joue
      corne(P(X0+.55,-.30,sd*.22),D(-.3,-1,sd*.5),.035,.20,noir);}                      // les épines de mâchoire
    for(let k=0;k<5;k++)corne(P(X0+.55-k*.16,.46-k*.02,0),D(-.4,1,0),.05,.26-k*.03,K.or);    // la crête
    {const hg=new THREE.Group();B.fin(hg);hg.scale.setScalar(1.6);hg.position.set(-.45,.02,0);g.add(hg);}B=B0;
    break;}


  case 24:{ // HÉLIOS — une couronne de rayons d'or plantés tout autour du tore : le soleil captif
    const TL=.55,ct=Math.cos(TL),st=Math.sin(TL);
    for(let k=0;k<28;k++){const a=k/28*2*PI10,cx=Math.cos(a),sy=Math.sin(a),d=D(cx,sy*ct,sy*st);corne(P(cx*.84,sy*.84*ct,sy*.84*st),d,.05,k%2?.30:.55,k%2?K.or:K.blanc);}
    break;}
  case 25:{ // L'ALIEN — la soucoupe qui ceinture le noyau, son dôme de verre, ses feux de bord, des glyphes inconnus, trois pattes souples
    B.add(tourY10([[.001,-.08],[.70,-.03],[1.05,0],[.70,.05],[.30,.10],[.001,.12]],32),K.col,0,-.02,0);
    B.add(new THREE.TorusGeometry(1.04,.035,6,48),K.chrome,0,-.02,0,PI10/2,0,0);
    for(let k=0;k<16;k++){const a=k/16*2*PI10;boule(k%2?K.glow:K.blanc,Math.cos(a)*1.04,-.02,Math.sin(a)*1.04,.045);
      BXg(B,K.glow,Math.cos(a)*.62,.05,Math.sin(a)*.62,0,-a,(k%3)*.5,.12,.012,.03);}
    B.add(new THREE.SphereGeometry(.46,20,10,0,PI10*2,0,PI10/2),K.verre,0,.10,0);
    for(let k=0;k<3;k++){const a=k/3*2*PI10+.4,c=Math.cos(a),sn=Math.sin(a);
      B.add(tube10([[c*.45,-.06,sn*.45],[c*.75,-.40,sn*.75],[c*.60,-.80,sn*.60],[c*.80,-1.0,sn*.80]],.035,16,6),K.colD,0,0,0);boule(K.glow,c*.80,-1.0,sn*.80,.06);}
    break;}
  case 26:{ // L'OUROBOROS D'ARGENT (Léo : « un moteur argenté en boucles infinies ») — trois NŒUDS DE CHROME imbriqués autour de la nacelle (trèfle,
    //   cinq lobes, anneau), et sur la boucle extérieure un serpent d'argent qui se mord la queue ; un cœur blanc, un rayon de plasma, quatre haubans
    const R=.90,tk=(p,q,r,rad,m,rx,ry,rz)=>B.add(new THREE.TorusKnotGeometry(r,rad,90,8,p,q),m,0,0,0,rx,ry,rz);
    tk(2,3,R*.88,.10,K.chrome,0,PI10/2,0);B.add(new THREE.TorusGeometry(R*.40,.045,8,48),K.alu,0,0,0,0,PI10/2,0);   // UN grand trèfle net + son anneau de cœur
    B.add(new THREE.TorusGeometry(R*1.30,.022,6,64),K.or,0,0,0,0,PI10/2,0);
    const RS=R*1.30,N=44;for(let k=0;k<N;k++){const t=k/(N-1),a=t*2*PI10*.93,r=.05+.075*Math.sin(Math.min(1,t*1.6)*PI10/2);
      B.add(G10.sph,K.chrome,0,Math.sin(a)*RS,Math.cos(a)*RS,0,0,0,r,r,r);}
    {const ah=2*PI10*.955,hp=P(0,Math.sin(ah)*RS,Math.cos(ah)*RS),fw=D(0,Math.cos(ah),-Math.sin(ah)),up=D(0,Math.sin(ah),Math.cos(ah));
      boule(K.chrome,hp.x,hp.y,hp.z,.13,.10,.10);corne(hp.clone().addScaledVector(fw,.08),fw,.07,.20,K.chrome);
      for(let sd=-1;sd<=1;sd+=2){boule(K.glow,hp.x+sd*.07,hp.y+up.y*.05,hp.z+up.z*.05,.03);corne(hp.clone().addScaledVector(up,.06).add(P(sd*.06,0,0)),up.clone().addScaledVector(fw,-.7),.025,.2,K.or);}
      const tl=P(0,Math.sin(2*PI10*.93)*RS,Math.cos(2*PI10*.93)*RS);corne(tl,D(0,Math.cos(2*PI10*.93),-Math.sin(2*PI10*.93)),.04,.12,K.chrome);}
    TX(B,K.chrome,[[.001,0],[.16,.02],[.20,.22],[.18,.60],[.10,.92],[.001,1.0]],-.60,0,0,0,18);BAR(B,K.chrome,.06,-1.2,1.1,0,0);
    boule(K.blanc,0,0,0,.14);boule(K.haloF,0,0,0,.26);B.add(cone10(.06,2.4,12),K.haloC,.14,0,0,0,0,0);B.add(cone10(.06,2.4,12),K.haloC,-.14,0,0,0,PI10,0);
    for(let k=0;k<4;k++){const a=k/4*2*PI10+PI10/4;tige(P(0,0,0),P(0,Math.sin(a)*R,Math.cos(a)*R),.03,K.chrome);}
    break;}



  case 27:{ // HALLEY — des aiguilles de glace hérissent le noyau, une 2e queue d'ions bleue, et ses deux anneaux (tenus par des rayons)
    for(const d of dirs10(14))corne(P(.60,0,0).addScaledVector(d,.30),d,.04,.28,K.blanc);
    B.add(cone10(.16,2.5,16),K.halo(0x6ab8ff,.40),.60,.05,.05,0,PI10*.97,.06);
    B.add(new THREE.TorusGeometry(.62,.032,8,40),K.or,.60,0,0,.5,PI10/2,0);B.add(new THREE.TorusGeometry(.52,.022,8,40),K.chrome,.32,0,0,0,PI10/2,0);
    for(let k=0;k<4;k++){const a=k/4*2*PI10;tige(P(.60,Math.sin(a)*.30,Math.cos(a)*.30),P(.60+Math.sin(a)*.62*Math.sin(.5)*0,Math.sin(a)*.62*Math.cos(.5),Math.cos(a)*.62),.012,K.or);
      tige(P(.45,Math.sin(a)*.25,Math.cos(a)*.25),P(.32,Math.sin(a)*.52,Math.cos(a)*.52),.010,K.chrome);}
    break;}
  case 28:{ // LA NAISSANCE — la double corolle, et les grands anneaux de l'ancienne supernova, en lumière
    for(let r=0;r<2;r++)for(let k=0;k<12;k++){const a=k/12*2*PI10+r*.26;
      B.add(plan10([[0,-.13],[.55+r*.35,-.11],[.85+r*.40,0],[.55+r*.35,.11],[0,.13]],.025,.006),r?K.or:K.blanc,0,Math.sin(a)*.26,Math.cos(a)*.26,a,PI10/2,0);}
    for(let k=0;k<3;k++){B.add(new THREE.TorusGeometry(1.15+k*.28,.03,6,64),K.halo(k%2?0xffd780:0xff8ac0,.75),-.12*k,0,0,0,PI10/2,0);
      B.add(new THREE.TorusGeometry(1.15+k*.28,.010,4,64),K.blanc,-.12*k,0,0,0,PI10/2,0);}
    break;}
  case 29:{ // L'INFINI (Léo : « le trou noir était mieux comme avant… fais encore mieux dans cette version ») — la CAGE de l'ancien,
    //   en grand : douze méridiens d'acier sombre qui enserrent la bille ET son disque, couronnes d'or aux pôles avec leurs flèches,
    //   l'anneau de photons blanc bien net au ras du disque, des braises accrochées aux arcs
    for(let k=0;k<6;k++){const a=k/6*PI10;B.add(new THREE.TorusGeometry(1.0,.026,6,64),k%3?K.noir:K.or,0,0,0,0,a,0);}   // six grands cercles verticaux = douze méridiens
    for(let sd=-1;sd<=1;sd+=2){B.add(new THREE.TorusGeometry(.12,.035,6,20),K.or,0,sd*1.0,0,PI10/2,0,0);corne(P(0,sd*1.03,0),D(0,sd,0),.06,.55,K.or);
      B.add(new THREE.TorusGeometry(.70,.018,6,48),K.noir,0,sd*.71,0,PI10/2,0,0);}
    B.add(new THREE.TorusGeometry(1.0,.024,6,72),K.or,0,0,0,PI10/2,0,0);
    for(let k=0;k<12;k++){const a=k/12*PI10*2+.13;boule(K.glow,Math.cos(a)*.71,(k%2?1:-1)*.71,Math.sin(a)*.71,.03);}
    break;}

  }
  B.plat();
}

/* ================= ARTISTE 3 — les HYBRIDES des paliers 16-22 (dragon, pagode, kraken, sphinx, phénix, atlantide, lance d'Odin) =================
   Les outils de sculpture `h3_*` : une géométrie bâtie triangle par triangle (normales plates : facettes), jamais d'indexation ; les
   pièces sont des fonctions pures qui rendent une BufferGeometry à poser avec `B.add(geo,mat,0,0,0)`. `dir` = -1 : la pièce regarde vers -x. */
function h3_geo(T){const p=[],u=[];for(const t of T)for(const v of t){p.push(v[0],v[1],v[2]);u.push(.3,.3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));g.computeVertexNormals();return g;}
function h3_ring(st){      // une SECTION de crâne = huit points [y,z] : dessus plat, flanc haut, joue, mâchoire, dessous plat
  const yt=st.yt,yb=st.yb,w=st.w,yw=st.yw==null?yb+(yt-yb)*.62:st.yw,wt=st.wt==null?w*.55:st.wt,wb=st.wb==null?w*.5:st.wb,y2=yb+(yw-yb)*.4;
  return [[yt,wt],[yw,w],[y2,w*.88],[yb,wb],[yb,-wb],[y2,-w*.88],[yw,-w],[yt,-wt]];}
function h3_loft(S,dir){   // S = [{x,r}] sections de même nombre de points, fermées aux deux bouts
  dir=dir||1;const T=[],n=S[0].r.length,V=(s,j)=>{const q=s.r[j%n];return [s.x*dir,q[0],q[1]];};
  for(let k=0;k<S.length-1;k++)for(let j=0;j<n;j++){const a=V(S[k],j),b=V(S[k],j+1),c=V(S[k+1],j+1),d=V(S[k+1],j);T.push([a,b,c],[a,c,d]);}
  for(const s of [S[0],S[S.length-1]]){const c=[s.x*dir,0,0];for(const q of s.r){c[1]+=q[0]/n;c[2]+=q[1]/n;}for(let j=0;j<n;j++)T.push([c,V(s,j),V(s,j+1)]);}
  return h3_geo(T);}
function h3_tube(P,r0,r1,o){   // un tube qui s'effile le long d'une courbe (queue, corne, tentacule, bec) — P = [[x,y,z]…]
  o=o||{};const dir=o.dir||1,sd=o.sides||6,seg=o.seg||Math.max(6,P.length*4),
    cv=new THREE.CatmullRomCurve3(P.map(p=>new THREE.Vector3(p[0]*dir,p[1],p[2]))),fr=cv.computeFrenetFrames(seg,false),T=[],R=[];
  for(let k=0;k<=seg;k++){const t=k/seg,c=cv.getPoint(t),r=(o.prof?o.prof(t):r0+(r1-r0)*t),N=fr.normals[k],Bn=fr.binormals[k],row=[];
    for(let j=0;j<sd;j++){const a=j/sd*2*PI10+(o.ph||0),ca=Math.cos(a),sa=Math.sin(a);row.push([c.x+(ca*N.x+sa*Bn.x)*r,c.y+(ca*N.y+sa*Bn.y)*r,c.z+(ca*N.z+sa*Bn.z)*r]);}R.push(row);}
  for(let k=0;k<seg;k++)for(let j=0;j<sd;j++){const a=R[k][j],b=R[k][(j+1)%sd],c=R[k+1][(j+1)%sd],d=R[k+1][j];T.push([a,b,c],[a,c,d]);}
  const c0=cv.getPoint(0),c1=cv.getPoint(1);for(let j=0;j<sd;j++){T.push([[c0.x,c0.y,c0.z],R[0][(j+1)%sd],R[0][j]]);T.push([[c1.x,c1.y,c1.z],R[seg][j],R[seg][(j+1)%sd]]);}
  return h3_geo(T);}
function h3_poly(V,dir){   // une feuille facettée (membrane, voile) : polygone en éventail depuis son centre
  dir=dir||1;const c=[0,0,0],n=V.length,T=[];for(const v of V){c[0]+=v[0]*dir/n;c[1]+=v[1]/n;c[2]+=v[2]/n;}
  for(let k=0;k<n;k++){const a=V[k],b=V[(k+1)%n];T.push([c,[a[0]*dir,a[1],a[2]],[b[0]*dir,b[1],b[2]]]);}return h3_geo(T);}
function h3_tris(L,dir){dir=dir||1;return h3_geo(L.map(t=>t.map(v=>[v[0]*dir,v[1],v[2]])));}

function h3_prism(A,Bq,C,d){   // une plaque PLEINE (triangle épaissi le long de d) : une écaille, un pétale, une flamme de crinière
  const f=v=>[v[0]+d[0],v[1]+d[1],v[2]+d[2]];
  return [[A,Bq,C],[f(A),f(C),f(Bq)],[A,Bq,f(Bq)],[A,f(Bq),f(A)],[Bq,C,f(C)],[Bq,f(C),f(Bq)],[C,A,f(A)],[C,f(A),f(C)]];}
function h3_toit(r,hh,lift,m){   // un TOIT de pagode : quatre coins relevés, quatre creux, une arête vive ; rend [dessus, dessous, anneau]
  m=m||.80;const R=[[r,r,lift],[r*m,0,0],[r,-r,lift],[0,-r*m,0],[-r,-r,lift],[-r*m,0,0],[-r,r,lift],[0,r*m,0]],T=[],U=[],A=[0,hh,0],C0=[0,-.04,0];
  for(let k=0;k<8;k++){const a=R[k],b=R[(k+1)%8],pa=[a[0],a[2],a[1]],pb=[b[0],b[2],b[1]];T.push([A,pa,pb]);U.push([C0,[pb[0],pb[1]-.035,pb[2]],[pa[0],pa[1]-.035,pa[2]]]);}
  return {top:T,under:U,ring:R.map(q=>[q[0],q[2],q[1]])};}

function h3_plume(B,m,P,r,o){   // une PLUME : un tube en losange qui s'épaissit au milieu et s'effile en pointe (feu, corbeau, phénix)
  o=o||{};B.add(h3_tube(P,r,r,Object.assign({sides:4,prof:t=>r*(.55+.45*Math.sin(PI10*Math.pow(t,.7)))*(1-.9*t*t*t)},o)),m,0,0,0);}

function h3_leaf(B,m,P,wd,o){   // une PLUME PLATE : un ruban qui s'élargit puis s'effile le long d'une courbe, avec sa nervure (aile, queue, rémige)
  o=o||{};const sg=o.seg||14,cv=new THREE.CatmullRomCurve3(P.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),T=[],A=[],Bq=[],up=o.up?new THREE.Vector3(o.up[0],o.up[1],o.up[2]):new THREE.Vector3(0,1,0);
  for(let k=0;k<=sg;k++){const t=k/sg,c=cv.getPoint(t),tg=cv.getTangent(t);let sd=o.side?new THREE.Vector3(o.side[0],o.side[1],o.side[2]):new THREE.Vector3().crossVectors(tg,up);
    sd.addScaledVector(tg,-sd.dot(tg));if(sd.length()<.05)sd.set(1,0,0);sd.normalize();
    const w=wd*(.18+.82*Math.pow(Math.sin(PI10*Math.min(1,.10+t*.9)),.75))*(1-.3*t);A.push([c.x+sd.x*w,c.y+sd.y*w,c.z+sd.z*w]);Bq.push([c.x-sd.x*w,c.y-sd.y*w,c.z-sd.z*w]);}
  for(let k=0;k<sg;k++){T.push([A[k],Bq[k],Bq[k+1]],[A[k],Bq[k+1],A[k+1]]);}
  B.add(h3_geo(T),m,0,0,0);B.add(h3_tube(P,(o.rib||.035),.008,{sides:4}),m===K_NULL?m:(o.ribMat||m),0,0,0);}
const K_NULL=null;
