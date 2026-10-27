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
  case 15:{ // LE DRAGON — la tête cornue aux yeux de braise et aux crocs, la queue en fer de lance, les ailes repliées
    const h=P(XE+.24,top-.02,0);BXg(B,K.col,h.x,h.y,0,0,0,0,.62,.30,.42);corne(P(XE+.55,top-.02,0),D(1,-.1,0),.17,.38,K.col);tige(P(XE-.05,top-.05,0),P(XE+.05,top-.04,0),.12,K.col);
    for(let sd=-1;sd<=1;sd+=2){corne(P(XE+.12,top+.12,sd*.14),D(-1,.8,sd*.35),.06,.55,K.or);boule(K.glow,XE+.40,top+.06,sd*.21,.05);
      for(let k=0;k<4;k++)corne(P(XE+.30+k*.09,top-.17,sd*.15),D(0,-1,0),.03,.12,K.blanc);
      B.add(plan10([[0,0],[L*.35,.05],[L*.30,.40],[L*.15,.18],[L*.05,.32]],.02,.004),K.colD,-L*.20,.30,sd*.40,sd*.4,0,0);}
    const tq=[P(-XE,.40,0),P(-XE-.35,.35,.15),P(-XE-.65,.25,-.10),P(-XE-.90,.30,.05)];B.add(tube10(tq.map(q=>[q.x,q.y,q.z]),.06,16,8),K.col,0,0,0);
    corne(tq[3],D(-1,.1,0),.11,.25,K.or);
    break;}
  case 16:{ // LA PAGODE — quatre toits laqués aux bords relevés empilés sur la tour, la flèche d'or, deux lanternes
    for(let k=0;k<4;k++){const r=.70-k*.12,y=1.10+k*.24;B.add(tourY10([[.001,.10],[r*.55,.08],[r,0],[r*1.05,.04],[r*1.02,.05],[.001,.13]],8),k%2?K.or:K.col,0,y,0);}
    corne(P(0,2.0,0),D(0,1,0),.05,.45,K.or);for(let k=0;k<5;k++)B.add(new THREE.TorusGeometry(.06-k*.006,.012,4,14),K.or,0,2.06+k*.07,0,PI10/2,0,0);
    for(let sd=-1;sd<=1;sd+=2){tige(P(0,1.13,sd*.70),P(0,1.00,sd*.70),.008,K.or);boule(K.col,0,.93,sd*.70,.07,.09,.07);}
    break;}
  case 17:{ // LE KRAKEN — huit tentacules qui s'enroulent depuis le nez, ventouses dorées, un œil immense
    for(let k=0;k<8;k++){const a=k/8*2*PI10,p=[];for(let j=0;j<=5;j++){const t=j/5;p.push([XE+.25+t*.15-Math.sin(t*3)*.25*t,.20+Math.sin(a)*(.30+t*.55)+(-t*t*.4),Math.cos(a)*(.30+t*.55)]);}
      B.add(tube10(p,.05,16,7),K.col,0,0,0);const e=p[5];corne(P(e[0],e[1],e[2]),D(-.4,-.6,Math.cos(a)*.3),.05,.20,K.col);
      for(let j=1;j<5;j++){const q=p[j];boule(K.or,q[0]+.02,q[1]-.04,q[2],.018);}}
    B.add(tourX([[.001,0],[.17,0],[.19,.03],[.001,.05]],16),K.or,XE+.48,.20,0);B.add(tourX([[.001,0],[.12,0],[.12,.02],[.001,.02]],16),K.glow,XE+.52,.20,0);
    BXg(B,K.noir,XE+.535,.20,0,0,0,0,.01,.16,.04);
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
  case 18:{ // LE SPHINX — une pyramide d'or sur chaque chambre, les bandes du némès or et lapis, l'œil d'Horus en façade
    for(let k=0;k<3;k++){const x=-.52+k*.52;B.add(new THREE.ConeGeometry(.42,.50,4),K.or,x,.86,0,0,PI10/4,0);
      for(let j=0;j<4;j++)B.add(new THREE.TorusGeometry(.64,.025,5,32),j%2?K.or:K.colD,x-.11+j*.075,0,0,0,PI10/2,0);}
    B.add(tourX([[.001,0],[.22,0],[.24,.03],[.001,.05]],16),K.colD,1.0,0,0);B.add(tourX([[.001,0],[.10,0],[.10,.02],[.001,.02]],14),K.or,1.04,0,0);
    tige(P(1.05,-.14,.08),P(1.05,-.32,.20),.02,K.colD);tige(P(1.05,-.14,-.10),P(1.05,-.26,-.28),.02,K.colD);
    break;}
  case 19:{ // LE PHÉNIX — deux grandes ailes de plumes de feu sur le cadre, une crête, une traîne de plumes
    for(let sd=-1;sd<=1;sd+=2)for(let k=0;k<9;k++){const m=k<3?K.or:(k<6?K.col:K.colD);plume(m,-.6+k*.12,.58,sd*.55,1.0-Math.abs(k-4)*.08,.16,sd*(.55+k*.06),0,PI10/2+.3-k*.11);}
    for(let k=0;k<3;k++)plume(K.or,.95,.50,(k-1)*.12,.45,.08,0,0,PI10/2.4-(k-1)*.3);
    for(let k=0;k<5;k++)plume(k%2?K.col:K.or,-1.15,0,(k-2)*.10,1.1,.10,0,PI10,(k-2)*.10);
    break;}
  case 20:{ // L'ATLANTIDE — quatre colonnes de bronze cannelées autour du cœur, une vague d'écume en cimier
    for(let k=0;k<4;k++){const a=k/4*2*PI10+PI10/4,y=Math.sin(a)*.42,z=Math.cos(a)*.42;B.add(new THREE.CylinderGeometry(.05,.05,1.6,10).rotateZ(PI10/2),K.or,0,y,z);
      B.add(new THREE.CylinderGeometry(.08,.08,.06,10).rotateZ(PI10/2),K.or,.80,y,z);B.add(new THREE.CylinderGeometry(.08,.08,.06,10).rotateZ(PI10/2),K.or,-.80,y,z);}
    tige(P(0,.15,0),P(0,1.15,0),.035,K.or);BXg(B,K.or,0,1.15,0,0,0,0,.06,.05,.46);           // le TRIDENT de Poséidon qui transperce le cœur
    for(const z of [-.22,0,.22]){tige(P(0,1.15,z),P(0,1.42,z),.025,K.or);corne(P(0,1.42,z),D(0,1,0),.05,.16,K.or);}
    break;}
  case 21:{ // LA LANCE D'ODIN — un fer de lance runique à la place de la pointe, les runes qui brillent, deux plumes de corbeau
    vers10(B,new THREE.OctahedronGeometry(.30,0).scale(1.8,.5,.18),K.or,P(1.95,0,0),D(1,0,0),1);
    for(let k=0;k<4;k++){const x=-.85+k*.42;for(let j=0;j<6;j++){const a=j/6*2*PI10;B.add(G10.box,K.glow,x+.12,Math.sin(a)*.448,Math.cos(a)*.448,a,0,0,.08,.012,.012);}}
    for(let sd=-1;sd<=1;sd+=2)plume(K.noir,-1.10,sd*.44,0,.80,.18,0,PI10,sd*.35);
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
