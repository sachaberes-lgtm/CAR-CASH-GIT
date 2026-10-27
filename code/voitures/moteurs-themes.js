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
/* ---- h2_ : les OUTILS de l'artiste 2 (hybrides 9-15 : orque, tortue, roquette, électrique, grenade, vitrail, soleil) ----
   h2_loft : un SOLIDE SCULPTÉ — des sections elliptiques (ou carrées arrondies) tenues le long de X : [[x, yCentre, demiHauteur, demiLargeur, boxité?]…]
   (boxité 2 = ellipse, 4 = presque un carré) : c'est ce qui fait un crâne, un fuselage, une carapace — pas un cône ni une boîte. */
function h2_loft(S,seg,cap,half){
  seg=seg||10;const pos=[],idx=[],R=half?seg+1:seg;   // half : seulement la moitié HAUTE (un dôme à fond plat, pour la carapace)
  for(let k=0;k<S.length;k++){const s=S[k],ex=2/(s[4]||2);
    for(let j=0;j<R;j++){const a=half?-Math.PI/2+j/seg*Math.PI:j/seg*2*Math.PI,c=half?Math.sin(a+Math.PI/2):Math.cos(a),n=half?Math.sin(a):Math.sin(a);
      pos.push(s[0],s[1]+Math.sign(c)*Math.pow(Math.abs(c),ex)*s[2],Math.sign(n)*Math.pow(Math.abs(n),ex)*s[3]);}}
  for(let k=0;k<S.length-1;k++)for(let j=0;j<R;j++){const a=k*R+j,b=k*R+(j+1)%R,c=a+R,d=b+R;idx.push(a,b,c,b,d,c);}
  if(cap!==false){const n0=pos.length/3,o=(S.length-1)*R;pos.push(S[0][0],S[0][1],0,S[S.length-1][0],S[S.length-1][1],0);
    for(let j=0;j<R;j++){idx.push(n0,(j+1)%R,j);idx.push(n0+1,o+j,o+(j+1)%R);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
/* h2_pose : pose une pièce (axe Y local = sa normale) à la position p, tournée sur la direction n — les écailles hexagonales d'une carapace */
const H2_Q=new THREE.Quaternion(),H2_E=new THREE.Euler(),H2_Y=new THREE.Vector3(0,1,0);
function h2_pose(B,geo,mat,p,n,sx,sy,sz){H2_Q.setFromUnitVectors(H2_Y,n.clone().normalize());H2_E.setFromQuaternion(H2_Q,'XYZ');B.add(geo,mat,p.x,p.y,p.z,H2_E.x,H2_E.y,H2_E.z,sx,sy,sz);}
/* h2_orient : pose une pièce à plat dans un plan — son axe X sur `ex`, sa normale (l'épaisseur d'un plan10) sur `ez` : les lancettes d'une aile */
function h2_orient(B,geo,mat,p,ex,ez){const X=ex.clone().normalize(),Y=new THREE.Vector3().crossVectors(ez,X).normalize(),Z=new THREE.Vector3().crossVectors(X,Y).normalize();
  H2_E.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,Z),'XYZ');B.add(geo,mat,p.x,p.y,p.z,H2_E.x,H2_E.y,H2_E.z,1,1,1);}
const h2_ANN=(B,m,R,r,x,y,z,rx,ry)=>B.add(new THREE.TorusGeometry(R,r,5,Math.max(16,Math.min(30,Math.round(R*44)))),m,x,y,z,rx||0,ry==null?PI10/2:ry,0);   // un anneau d'axe X, léger (les 40 pans d'ANN coûtaient 640 triangles pièce)
function h2_poli(c,sh,rf){return new THREE.MeshPhongMaterial({color:c,shininess:sh||220,specular:0xffffff,envMap:envTex,side:THREE.DoubleSide,reflectivity:rf==null?.35:rf,combine:THREE.MixOperation});}
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
  case 8:{ // L'ORQUE (h2) — LE MOTEUR EST l'orque : le bloc = le corps (dos noir laqué, ventre blanc), la cloche d'embrayage = la tête sculptée (melon bombé,
    //   rostre, ligne de bouche, tache blanche, œil de glace, dents), le grand aileron au dos, les palettes pectorales, et l'échappement = le PÉDONCULE
    //   qui finit en queue à nageoires horizontales autour de la tuyère à braise
    const W=h2_poli(0xf4f8ff,160,.28),G=h2_poli(0x8e9aae,200,.4),hx=-XE-.02,T=K.col;
    // la tête : le melon (front bombé qui monte), puis le rostre court
    B.add(h2_loft([[hx+.30,.0,.38,.40,2.6],[hx+.04,.04,.42,.43,2.6],[hx-.22,.09,.41,.41,2.5],[hx-.46,.08,.32,.33,2.4],[hx-.66,.02,.20,.23,2.4],[hx-.82,-.03,.09,.13,2.4]],12),T,0,0,0);
    // la mâchoire inférieure et la gorge : BLANCHES, plus basses que le crâne
    B.add(h2_loft([[hx+.30,-.23,.17,.34,2.6],[hx+.0,-.24,.16,.35,2.6],[hx-.30,-.22,.13,.30,2.5],[hx-.56,-.17,.10,.21,2.4],[hx-.76,-.12,.05,.11,2.4]],12),W,0,0,0);
    // le torse noir qui habille le carter, et le ventre blanc qui le déborde par le bas et les flancs
    B.add(h2_loft([[-XE+.05,.0,.30,.36,2.8],[-L*.3,.08,.35,.43,2.8],[L*.2,.08,.35,.43,2.8],[XE-.02,.04,.30,.36,2.8],[XE+.20,.04,.22,.25,2.5]],12),T,0,0,0);
    B.add(h2_loft([[-XE+.02,-.22,.26,.34,2.7],[-L*.3,-.22,.30,.455,2.7],[L*.2,-.22,.30,.455,2.7],[XE-.02,-.20,.26,.37,2.7],[XE+.22,-.10,.16,.24,2.5],[XE+.34,-.03,.07,.12,2.4]],12),W,0,0,0);
    B.add(h2_loft([[hx+.10,.22,.38,.43,2.6],[hx+.50,.44,.50,.52,2.7],[-L*.20,.52,.42,.57,2.9],[L*.25,.52,.42,.57,2.9],[XE+.04,.30,.36,.42,2.6]],12),T,0,0,0);   // la bosse du dos : la nuque monte jusqu'au dos, la culasse en sort comme une armure
    for(let sd=-1;sd<=1;sd+=2){B.add(G10.sph,W,L*.20,-.02,sd*.43,0,0,sd*.1,.34,.10,.05);}                                                  // la tache blanche de la hanche
    for(let sd=-1;sd<=1;sd+=2){
      // la tache blanche derrière l'œil (oblique, comme l'orque), l'œil de glace, le sourcil
      B.add(G10.sph,W,hx-.28,.20,sd*.375,0,0,sd*.30,.20,.068,.04);
      B.add(G10.sph,K.noir,hx-.47,.11,sd*.315,0,0,0,.045,.045,.034);B.add(G10.sph,K.glow,hx-.475,.115,sd*.332,0,0,0,.026,.026,.022);
      // la ligne de bouche : un trait sombre du rostre aux joues
      B.add(tube10([[hx-.80,-.07,sd*.08],[hx-.56,-.09,sd*.20],[hx-.28,-.10,sd*.35],[hx+.02,-.07,sd*.42]],.012,12,4),K.noir,0,0,0);
      // les dents : une rangée blanche, haut et bas
      for(let k=0;k<6;k++){const x=hx-.12-k*.11,z=sd*(.36-k*.04);vers10(B,cone10(.022,.085,5),W,P(x,-.115,z),D(0,-1,0),1);vers10(B,cone10(.020,.075,5),W,P(x-.03,-.085,z*.96),D(0,1,0),1);}
      // la selle grise derrière l'aileron
      B.add(G10.sph,G,L*.22,.80,sd*.34,0,0,sd*.55,.36,.06,.17);
      // la palette pectorale : large, arrondie, qui part du flanc
      B.add(plan10([[0,0],[.20,.40],[.46,.70],[.70,.58],[.62,.24],[.32,-.02]],.05,.01),T,-XE+.50,-.12,sd*.36,sd*PI10/2,0,-.35);
    }
    B.add(G10.sph,K.noir,hx+.02,.46,0,0,0,0,.08,.016,.035);                                                              // l'évent
    // le grand aileron dorsal, en faucille, planté dans la vallée du V
    B.add(plan10([[-.40,0],[-.20,.55],[.14,1.30],[.17,.78],[.52,0]],.07,.012),T,-L*.04,top-.40,0);
    B.add(plan10([[-.40,.02],[-.20,.55],[.14,1.30],[.125,1.22],[-.17,.55],[-.34,.05]],.09,.004),K.glow,-L*.04,top-.40,0);       // le liseré de glace du bord d'attaque
    // la queue : le pédoncule qui s'affine, les deux nageoires horizontales, la tuyère à braise au milieu
    B.add(h2_loft([[XE-.10,.0,.32,.30,2.6],[XE+.18,.03,.24,.22,2.5],[XE+.42,.05,.13,.14,2.4]],10),T,0,0,0);
    const tx=XE+.40;
    for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[0,0],[.18,.46],[.40,.80],[.52,.70],[.34,.30],[.38,0]],.05,.01),T,tx,.05,0,sd*PI10/2,0,0);
    TX(B,K.chrome,[[.10,0],[.15,.06],[.25,.24],[.31,.34]],tx+.06,.05,0,0,12);B.add(new THREE.TorusGeometry(.31,.012,4,20),K.or,tx+.40,.05,0,0,PI10/2,0);
    TX(B,K.glow,[[.001,0],[.23,0],[.23,.02],[.001,.02]],tx+.38,.05,0,0,12);
    c.echap=[tx+.42,.05,0];
    break;}
  case 9:{ // LA TORTUE (h2) — LE MOTEUR EST la tortue : les deux couvre-culasses du boxer = les écailles marginales de la carapace (dôme + écailles hexagonales),
    //   la cloche d'embrayage = la TÊTE qui sort du carter (crâne, bec, arcade, œil), les quatre nageoires = des bras de piston articulés à l'épaule chromée,
    //   la queue = l'échappement : petite queue d'écailles et tuyère à braise
    const hx=-XE,DM=[[-XE-.02,.14,.16,.38],[-XE+.22,.17,.42,.82],[-XE+.55,.18,.54,.98],[-.04,.18,.58,1.02],[XE-.32,.18,.52,.98],[XE-.02,.16,.38,.80],[XE+.20,.14,.16,.44]];
    B.add(h2_loft(DM,16,true,true),K.colD,0,0,0);                                                     // la carapace : un dôme à fond plat
    const sec=x=>{for(let k=0;k<DM.length-1;k++){const a=DM[k],b=DM[k+1];if(x>=a[0]&&x<=b[0]){const t=(x-a[0])/(b[0]-a[0]);return [a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t];}}return DM[DM.length-1].slice(1);};
    const ecaille=(x,z,r)=>{const q=sec(x),yc=q[0],ry=q[1],rz=q[2],f=Math.sqrt(Math.max(0,1-(z/rz)*(z/rz)));if(f<.15)return;const y=yc+ry*f,n=new THREE.Vector3(0,1,z*ry/(rz*rz*f));
      h2_pose(B,G10.cyl6,K.col,P(x,y+.012,z),n,r,.045,r);h2_pose(B,G10.cyl6,K.or,P(x,y+.034,z),n,r*.5,.02,r*.5);};
    for(let k=0;k<4;k++)ecaille(-XE+.35+k*(L-.55)/3,0,.17);                                           // la colonne vertébrale : quatre grandes
    for(let sd=-1;sd<=1;sd+=2){for(let k=0;k<3;k++)ecaille(-XE+.46+k*(L-.74)/2,sd*.42,.15);for(let k=0;k<4;k++)ecaille(-XE+.30+k*(L-.40)/3,sd*.70,.11);}   // les côtes, puis les marginales
    // la tête : un crâne en plusieurs plans (voûte, arcade, joues, bec) qui sort du carter
    const H=[[hx+.12,.0,.27,.29,2.4],[hx-.14,.02,.27,.28,2.4],[hx-.36,.06,.23,.28,2.4],[hx-.54,.07,.22,.28,2.3],[hx-.70,.03,.17,.21,2.3],[hx-.82,-.01,.09,.12,2.3]];
    B.add(h2_loft(H,10),K.col,0,0,0);
    B.add(h2_loft([[hx-.56,-.10,.08,.19,2.4],[hx-.74,-.09,.06,.12,2.4],[hx-.86,-.06,.03,.06,2.4]],8),K.colD,0,0,0);                    // le bec inférieur
    vers10(B,cone10(.07,.20,5),K.or,P(hx-.78,.0,0),D(-1,-.55,0),1);                                                             // le crochet du bec, en or
    B.add(h2_loft([[hx-.32,.23,.05,.22],[hx-.56,.26,.06,.24],[hx-.72,.18,.05,.15]],8),K.colD,0,0,0);                              // l'arcade sourcilière
    for(let sd=-1;sd<=1;sd+=2){B.add(G10.sph,K.noir,hx-.55,.11,sd*.265,0,0,0,.065,.065,.045);B.add(G10.sph,K.glow,hx-.57,.115,sd*.285,0,0,0,.038,.038,.024);   // l'œil : braise
      B.add(G10.sph,K.noir,hx-.85,.01,sd*.04,0,0,0,.02,.02,.02);                                                             // la narine
      B.add(tube10([[hx-.82,-.04,sd*.05],[hx-.60,-.04,sd*.2],[hx-.32,-.02,sd*.29]],.01,8,4),K.noir,0,0,0);                       // la ligne de la bouche
      // les nageoires : épaule chromée (le turbo), tige de piston, palette en V
      const ax=sd>0?1:1;
      for(let r=0;r<2;r++){const xr=r?XE-.20:-XE+.36,big=r?.62:1,z0=sd*.84;
        B.add(G10.sph,K.chrome,xr,.02,z0,0,0,0,.15*big+.03,.15*big+.03,.15*big+.03);B.add(new THREE.TorusGeometry(.16*big+.03,.016,5,16),K.or,xr,.02,z0,0,PI10/2,0);
        B.add(plan10(r?[[-.18,0],[-.04,.22],[.12,.52],[.30,.58],[.26,.22],[.18,0]]:[[-.20,0],[-.02,.30],[.30,.68],[.54,.76],[.56,.54],[.40,.24],[.26,0]],.06,.012),K.col,xr,.0,z0,sd*PI10/2,0,r?0:0);
        tige(P(xr,.02,z0),P(xr+(r?.2:.40),.05,z0+sd*(r?.36:.62)),.032,K.chrome);}}
    // la queue et l'échappement : une petite queue d'écailles, la tuyère à braise au bout
    B.add(h2_loft([[XE-.10,.0,.17,.20,2.4],[XE+.18,.02,.12,.14,2.4],[XE+.34,.04,.08,.09,2.4]],8),K.col,0,0,0);
    const tx=XE+.26;TX(B,K.chrome,[[.07,0],[.11,.05],[.19,.18],[.24,.26]],tx,.05,0,0,12);B.add(new THREE.TorusGeometry(.24,.012,4,18),K.or,tx+.28,.05,0,0,PI10/2,0);TX(B,K.glow,[[.001,0],[.18,0],[.18,.02],[.001,.02]],tx+.26,.05,0,0,12);
    c.echap=[tx+.30,.05,0];
    break;}
  case 10:{ // LA ROQUETTE (h2) — LE MOTEUR EST la fusée vivante : le V8 est le fuselage blanc, la cloche d'embrayage = le NEZ-VISAGE (hublots-yeux de braise,
    //   sourcils en colère, large sourire à dents de requin), les deux nacelles latérales = ses poumons (tenues au fuselage par des bras), l'échappement =
    //   la grande tuyère à braise cernée de quatre ailerons
    const Wh=h2_poli(0x8791b0,110,.10),yc=.30,nx=-XE-.80;
    const FS=[[nx,yc,.02,.02],[nx+.12,yc,.13,.13],[nx+.32,yc,.26,.26],[nx+.55,yc,.37,.37],[-XE+.12,yc,.52,.52]];
    B.add(h2_loft(FS,14),K.col,0,0,0);                                                              // l'ogive rouge, qui bombe
    const rN=x=>{for(let k=0;k<FS.length-1;k++){const a=FS[k],b=FS[k+1];if(x>=a[0]&&x<=b[0])return a[2]+(b[2]-a[2])*(x-a[0])/(b[0]-a[0]);}return FS[FS.length-1][2];};
    B.add(h2_loft([[-XE+.10,yc,.52,.52],[-XE+.35,yc,.60,.60],[0,yc,.62,.62],[XE-.15,yc,.60,.60],[XE+.10,yc,.48,.48]],14),Wh,0,0,0);   // le fuselage blanc
    for(const x of [-XE+.24,-L*.18,L*.14,XE-.12])TX(B,K.col,[[.625,0],[.625,.07]],x,yc,0,0,14);        // les bandes rouges
    for(const x of [-XE+.12,XE+.08])h2_ANN(B,K.or,.56,.014,x,yc,0);
    // le visage : yeux-hublots, sourcils, sourire
    for(let sd=-1;sd<=1;sd+=2){const ex=-XE-.30,ey=yc+.12,ez=sd*Math.sqrt(Math.max(.01,rN(ex)*rN(ex)-.0144))+sd*.01;
      B.add(new THREE.TorusGeometry(.115,.022,6,14),K.chrome,ex,ey,ez,0,sd*.30,0);B.add(G10.sph,K.glow,ex,ey,ez+sd*.01,0,0,0,.10,.10,.04);B.add(G10.sph,K.noir,ex-.03,ey-.01,ez+sd*.03,0,0,0,.045,.05,.02);
      BXg(B,K.colD,ex+.02,ey+.15,ez-sd*.02,0,sd*.30,-.45,.26,.055,.08);                              // le sourcil en colère
      const gp=[];for(let k=0;k<=6;k++){const x=nx+.22+k*.11,dy=-.17+(k/6)*.02,r=rN(x);gp.push([x,yc+dy,sd*(Math.sqrt(Math.max(.002,r*r-dy*dy))+.012)]);}
      B.add(tube10(gp,.016,16,5),K.noir,0,0,0);
      for(let k=0;k<7;k++){const q=gp[k];vers10(B,cone10(.026,.095,5),K.blanc,P(q[0],q[1],q[2]),D(0,-1,sd*.15),1);}
      // la nacelle-poumon, tenue par deux bras
      const bz=sd*.86,by=yc-.10;
      B.add(h2_loft([[-XE+.05,0,.02,.02],[-XE+.20,0,.12,.12],[-XE+.50,0,.17,.17],[XE-.20,0,.17,.17],[XE+.05,0,.12,.12]],10),Wh,0,by,bz);
      B.add(h2_loft([[-XE-.28,0,.02,.02],[-XE-.15,0,.10,.10],[-XE+.05,0,.17,.17]],10),K.col,0,by,bz);
      for(const x of [-XE+.45,XE-.35])tige(P(x,yc-.02,sd*.42),P(x,by,sd*.80),.035,K.chrome);
      TX(B,K.chrome,[[.08,0],[.12,.05],[.19,.16]],XE+.05,by,bz,0,10);TX(B,K.glow,[[.001,0],[.15,0],[.15,.02]],XE+.20,by,bz,0,10);
    }
    // les quatre ailerons de la queue
    for(let k=0;k<4;k++)B.add(plan10([[-.30,.40],[.38,.40],[.10,1.00],[-.06,1.00]],.05,.01),K.col,XE-.10,yc,0,k*PI10/2,0,0);
    // la tuyère : un grand pavillon évasé, le disque de braise
    const tx=XE+.02;TX(B,K.chrome,[[.20,0],[.25,.08],[.38,.34],[.50,.50]],tx,yc,0,0,14);h2_ANN(B,K.or,.50,.018,tx+.50,yc,0);TX(B,K.glow,[[.001,0],[.40,0],[.40,.02],[.001,.02]],tx+.48,yc,0,0,14);
    c.echap=[tx+.54,yc,0];
    break;}
  case 11:{ // L'ÉLECTRIQUE (h2) — LA BÊTE D'ORAGE : le V8 est son corps (flancs bobinés de cuivre = ses muscles), la cloche d'embrayage = la tête de taureau
    //   d'orage — deux BOBINES TESLA en guise de cornes, un arc qui claque entre leurs boules, yeux d'éclair, mâchoire à éclateurs — et l'échappement = sa
    //   queue en éclairs autour de la tuyère
    const hx=-XE,yc=.30;
    const coil=(p,d,len,r)=>{const pts=[[r*.7,0],[r*.7,.03]];const n=Math.round(len/.075);for(let k=0;k<n;k++){const x=.03+k*.075;pts.push([r*.9,x+.01],[r*1.18,x+.03],[r*1.18,x+.055],[r*.9,x+.07]);}pts.push([r*.7,len]);vers10(B,tourX(pts,10),K.cu,p,d,1);
      const e=p.clone().addScaledVector(d,len);B.add(G10.sph,K.chrome,e.x,e.y,e.z,0,0,0,r*1.7,r*1.7,r*1.7);B.add(G10.sph,K.glow,e.x,e.y,e.z,0,0,0,r*1.0,r*1.0,r*1.0);return e;};
    const arc=(a,b,n,amp,r)=>{const p=[];for(let k=0;k<=n;k++){const t=k/n,j=(k&&k<n)?(k%2?1:-1):0;p.push([a.x+(b.x-a.x)*t+j*amp*.5,a.y+(b.y-a.y)*t+j*amp,a.z+(b.z-a.z)*t+(k&&k<n?(k%3-1)*amp*.6:0)]);}B.add(tube10(p,r||.016,n*3,4),K.glow,0,0,0);};
    // le corps : le torse laqué, bobiné de cuivre
    B.add(h2_loft([[hx+.10,yc,.36,.40,2.5],[hx+.40,yc,.52,.54,2.5],[-L*.2,yc,.55,.58,2.6],[L*.2,yc,.55,.58,2.6],[XE-.05,yc,.46,.48,2.5],[XE+.25,yc,.30,.32,2.5]],12),K.col,0,0,0);
    for(let k=0;k<8;k++){const x=hx+.38+k*(L-.50)/7;h2_ANN(B,K.cu,.575,.032,x,yc,0);}
    // la tête de taureau : crâne, arcade, museau large, mâchoire d'acier à éclateurs
    B.add(h2_loft([[hx+.22,yc+.10,.40,.42,2.5],[hx-.08,yc+.17,.40,.43,2.4],[hx-.34,yc+.19,.34,.40,2.4],[hx-.58,yc+.12,.26,.34,2.4],[hx-.80,yc+.03,.19,.28,2.4],[hx-.93,yc-.02,.13,.21,2.4]],12),K.col,0,0,0);
    B.add(h2_loft([[hx-.20,yc-.22,.09,.31,2.5],[hx-.50,yc-.19,.08,.28,2.5],[hx-.80,yc-.14,.07,.21,2.5],[hx-.92,yc-.11,.04,.14,2.5]],10),K.chrome,0,0,0);
    for(let sd=-1;sd<=1;sd+=2){
      BXg(B,K.colD,hx-.34,yc+.40,sd*.20,0,sd*.28,0,.50,.10,.14);                                          // l'arcade
      B.add(G10.sph,K.glow,hx-.50,yc+.27,sd*.33,0,sd*.35,-.5*sd,.17,.045,.04);B.add(G10.sph,K.blanc,hx-.52,yc+.27,sd*.345,0,sd*.35,-.5*sd,.095,.02,.025);   // l'œil d'éclair
      B.add(plan10([[0,0],[.22,.14],[.30,-.02],[.10,-.10]],.03,.006),K.col,hx+.02,yc+.28,sd*.40,sd*PI10/2*.0,sd*.9,0);   // l'oreille
      h2_ANN(B,K.or,.05,.016,hx-.94,yc-.01,sd*.10);
      B.add(G10.sph,K.noir,hx-.93,yc-.02,sd*.10,0,0,0,.04,.035,.035);                                    // la narine
      for(let k=0;k<5;k++){const x=hx-.28-k*.11;vers10(B,cone10(.018,.09,5),K.chrome,P(x,yc-.12,sd*(.28-k*.03)),D(0,1,0),1);}   // les éclateurs : des dents de conducteur
      const base=P(hx-.08,yc+.50,sd*.22);coil(base,D(-.25,1,sd*.55),.78,.07);                            // la corne : une bobine Tesla
      B.add(G10.cyl6,K.or,base.x,base.y-.02,base.z,0,0,0,.13,.08,.13);}
    // l'arc qui claque entre les deux boules, et l'étincelle de la gueule
    const eL=P(hx-.08,yc+.50,-.22).addScaledVector(D(-.25,1,-.55),.78),eR=P(hx-.08,yc+.50,.22).addScaledVector(D(-.25,1,.55),.78);
    arc(eL,eR,8,.09,.02);
    arc(P(hx-.62,yc-.17,-.14),P(hx-.62,yc-.17,.14),4,.04,.012);
    // l'échine : cinq petites bobines sur le dos, reliées par des arcs
    const tops=[];for(let k=0;k<5;k++){const x=-L*.36+k*L*.20,b=P(x,.86,0);tops.push(coil(b,D(0,1,0),.30+.04*Math.sin(k/4*PI10),.045));}
    for(let k=0;k<4;k++)arc(tops[k],tops[k+1],4,.05,.012);
    // la queue : deux éclairs de tôle, la tuyère
    for(let sd=-1;sd<=1;sd+=2)B.add(plan10([[0,0],[.34,.46],[.20,.46],[.60,1.0],[.26,.60],[.40,.60],[.10,.0]],.05,.01),K.col,XE-.05,yc+(sd>0?.30:-.30),0,sd>0?0:PI10,0,0);
    const tx=XE+.12;TX(B,K.chrome,[[.12,0],[.17,.06],[.27,.22],[.34,.34]],tx,yc,0,0,12);h2_ANN(B,K.or,.34,.014,tx+.35,yc,0);TX(B,K.glow,[[.001,0],[.26,0],[.26,.02],[.001,.02]],tx+.33,yc,0,0,12);
    c.echap=[tx+.38,yc,0];
    break;}
  case 12:{ // LA GRENADE (h2) — LA GRENADE VIVANTE : le V10 est le corps ovoïde quadrillé en ananas, la cloche d'embrayage = la FACE (yeux jaunes de braise, sourcils,
    //   sourire à crocs), le col de fusée sur le dos porte la goupille et son anneau d'or, le grand levier épouse tout le dos jusqu'à la queue — et l'échappement
    //   est le culot de la grenade : la tuyère à braise
    const yc=.30,hx=-XE,FS=[[hx-.34,yc,.16,.16],[hx-.22,yc,.36,.36],[hx+.05,yc,.55,.55],[hx+.40,yc,.68,.68],[0,yc,.72,.72],[XE-.40,yc,.68,.68],[XE-.05,yc,.50,.50],[XE+.15,yc,.32,.32]];
    const rA=x=>{for(let k=0;k<FS.length-1;k++){const a=FS[k],b=FS[k+1];if(x>=a[0]&&x<=b[0])return a[2]+(b[2]-a[2])*(x-a[0])/(b[0]-a[0]);}return FS[FS.length-1][2];};
    B.add(h2_loft(FS,16),K.col,0,0,0);
    // l'ananas : des anneaux et des méridiens en relief, cernés d'or
    for(let k=0;k<10;k++){const x=hx-.10+k*(L+.10)/9,r=rA(x);TX(B,K.colD,[[r+.028,0],[r+.028,.065]],x,yc,0,0,16);}
    for(let k=0;k<12;k++){const a=k/12*2*PI10,pp=[];for(let j=0;j<=9;j++){const x=hx-.16+j*(L+.2)/9,r=rA(x)+.028;pp.push([x,yc+Math.cos(a)*r,Math.sin(a)*r]);}B.add(tube10(pp,.020,18,4),K.colD,0,0,0);}
    for(let k=0;k<12;k++){const x=hx+.25+(k%6)*(L-.6)/5,r=rA(x),a=(Math.floor(k/6)?.28:-.28)+(k%2)*PI10;B.add(G10.sph,K.or,x,yc+Math.cos(a)*(r+.03),Math.sin(a)*(r+.03),0,0,0,.022,.022,.022);}   // les rivets d'or
    // la face : yeux jaunes en colère, sourcils, sourire à crocs
    for(let sd=-1;sd<=1;sd+=2){const ex=hx-.10,ey=yc+.20,ez=sd*(Math.sqrt(Math.max(.01,rA(ex)*rA(ex)-.04))+.01);
      B.add(new THREE.TorusGeometry(.17,.03,6,14),K.chrome,ex,ey,ez,0,sd*.55,0);B.add(G10.sph,K.glow,ex,ey,ez+sd*.012,0,0,0,.15,.15,.055);BXg(B,K.noir,ex-.03,ey,ez+sd*.06,0,sd*.55,0,.04,.20,.02);
      BXg(B,K.colD,ex+.0,ey+.24,ez-sd*.02,0,sd*.55,-.42,.42,.08,.13);
      const gp=[];for(let k=0;k<=7;k++){const x=hx-.28+k*.12,dy=-.16-(k/7)*.04,r=rA(x);gp.push([x,yc+dy,sd*(Math.sqrt(Math.max(.002,r*r-dy*dy))+.012)]);}
      B.add(tube10(gp,.018,16,5),K.noir,0,0,0);
      for(let k=0;k<8;k++){const q=gp[k];vers10(B,cone10(.03,.11,5),K.blanc,P(q[0],q[1],q[2]),D(0,k%2?-1:1,sd*.1),1);}}
    // le col de fusée, la goupille, l'anneau d'or
    const nx=hx+.55,ny=yc+rA(nx)-.04;
    B.add(tourY10([[.001,0],[.17,0],[.20,.05],[.17,.30],[.12,.42],[.001,.44]],12),K.chrome,nx,ny,0);
    B.add(new THREE.TorusGeometry(.17,.03,6,24),K.or,nx,ny+.30,.0,0,0,0);
    tige(P(nx,ny+.26,-.24),P(nx,ny+.26,.16),.03,K.or);B.add(new THREE.TorusGeometry(.14,.028,6,22),K.or,nx,ny+.26,.30,PI10/2,0,0);
    // le levier : une cuillère d'acier qui épouse le dos jusqu'au culot
    const LV=[];for(let k=0;k<=8;k++){const x=nx+.05+k*(XE-nx+.12)/8,r=rA(Math.min(x,XE+.1));LV.push([x,yc+r*(1-.0008*k*k)+.035-(k>6?(k-6)*.09:0),.022,.15,2.6]);}
    B.add(h2_loft(LV,8),K.metal,0,0,0);
    for(const q of [LV[0],LV[4],LV[8]])BXg(B,K.or,q[0],q[1]-.01,0,0,0,0,.05,.03,.2);
    // le culot : la tuyère
    const tx=XE+.10;TX(B,K.chrome,[[.12,0],[.18,.06],[.30,.22],[.38,.34]],tx,yc,0,0,12);ANN(B,K.or,.38,.014,tx+.35,yc,0);TX(B,K.glow,[[.001,0],[.30,0],[.30,.02],[.001,.02]],tx+.34,yc,0,0,12);
    c.echap=[tx+.38,yc,0];
    break;}
  case 13:{ // LE VITRAIL (h2) — L'OISEAU-CATHÉDRALE : le V12 est la nef (voûte bleue nervurée d'or), la cloche d'embrayage = la tête d'oiseau (bec d'or, œil de verre rouge,
    //   huppe de lancettes), les deux ailes = des éventails de lancettes de verre sertis de plomb et d'or, plantés dans les épaules, et l'échappement perce
    //   la GRANDE ROSACE qui lui sert de queue en roue — tenue au corps par quatre haubans d'or
    const yc=.30,hx=-XE,V=[0xff3a4a,0x3a6aff,0xffc030,0x2ad08a,0xb04aff,0xff7a2a];
    const GL=V.map(c=>new THREE.MeshPhongMaterial({color:c,emissive:c,emissiveIntensity:.55,shininess:300,specular:0xffffff,side:THREE.DoubleSide}));
    const lanc=(l,w)=>[[0,-w],[l*.55,-w*.95],[l*.82,-w*.55],[l,0],[l*.82,w*.55],[l*.55,w*.95],[0,w]];     // une lancette : un arc brisé
    // le corps : la nef, ses nervures d'or
    B.add(h2_loft([[hx+.10,yc,.34,.40,2.5],[hx+.40,yc,.52,.56,2.5],[-L*.2,yc,.56,.60,2.6],[L*.2,yc,.56,.60,2.6],[XE-.10,yc,.46,.50,2.5],[XE+.20,yc,.24,.26,2.5]],12),K.col,0,0,0);
    for(let k=0;k<9;k++){const x=hx+.40+k*(L-.60)/8;h2_ANN(B,K.or,.585,.022,x,yc,0);}
    // la tête : crâne d'oiseau sculpté, bec d'or, œil de verre, huppe
    B.add(h2_loft([[hx+.22,yc+.08,.34,.36,2.5],[hx-.10,yc+.14,.34,.34,2.4],[hx-.34,yc+.14,.28,.28,2.4],[hx-.54,yc+.08,.18,.19,2.4],[hx-.66,yc+.02,.09,.10,2.4]],12),K.col,0,0,0);
    vers10(B,cone10(.13,.34,6),K.or,P(hx-.58,yc+.06,0),D(-1,-.28,0),1);vers10(B,cone10(.10,.26,6),K.or,P(hx-.56,yc-.03,0),D(-1,.18,0),1);        // le bec : mandibule haute et basse
    for(let sd=-1;sd<=1;sd+=2){B.add(new THREE.TorusGeometry(.085,.022,6,14),K.or,hx-.34,yc+.20,sd*.265,0,sd*.25,0);B.add(G10.sph,GL[0],hx-.34,yc+.20,sd*.275,0,0,0,.07,.07,.03);B.add(G10.sph,K.noir,hx-.36,yc+.20,sd*.29,0,0,0,.032,.032,.02);
      B.add(G10.sph,K.noir,hx-.70,yc+.10,sd*.05,0,0,0,.018,.018,.018);}
    for(let k=0;k<5;k++){const rz=.45+k*.20,len=.50-k*.04,x=hx+.0-k*.06,y=yc+.38;
      B.add(plan10(lanc(len+.05,.075),.05,.006),K.or,x,y,0,0,0,rz);B.add(plan10(lanc(len,.060),.065,.004),GL[(k*2+1)%6],x+.01,y+.008,0,0,0,rz+.01);}   // la huppe de lancettes
    // les ailes : un éventail de sept lancettes de verre par épaule
    const tau=.80;
    for(let sd=-1;sd<=1;sd+=2){const S=P(-.10,.72,sd*.50);
      B.add(G10.sph,K.or,S.x,S.y,S.z,0,0,0,.13,.13,.13);                                                                          // l'épaule d'or
      for(let k=0;k<7;k++){const th=.05+k*.20,l=1.45-k*.12,d=new THREE.Vector3(Math.sin(th),Math.sin(tau)*Math.cos(th),sd*Math.cos(tau)*Math.cos(th)).normalize();
        const n=new THREE.Vector3(0,-sd*Math.cos(tau),Math.sin(tau)).normalize();
        h2_orient(B,plan10(lanc(l+.05,l*.12),.03,.006),K.or,S,d,n);
        h2_orient(B,plan10(lanc(l,l*.102),.044,.004),GL[(k+(sd>0?0:3))%6],S.clone().addScaledVector(n,.002*(k%2)),d,n);}}
    // la rosace-queue : douze secteurs de verre, des rayons de plomb, deux couronnes d'or ; elle est percée par la tuyère
    const rx=XE+.46,R=.74;
    for(let k=0;k<12;k++)B.add(new THREE.CircleGeometry(R,5,k/12*2*PI10,2*PI10/12-.025),GL[k%6],rx,yc,0,0,PI10/2,0);
    for(let k=0;k<12;k++){const a=k/12*2*PI10,ca=Math.cos(a),sa=Math.sin(a);tige(P(rx+.012,yc+sa*.25,ca*.25),P(rx+.012,yc+sa*R,ca*R),.011,K.noir);
      B.add(G10.sph,K.or,rx+.01,yc+sa*.50,ca*.50,0,0,0,.06,.06,.025);B.add(G10.sph,GL[(k+3)%6],rx+.03,yc+sa*.50,ca*.50,0,0,0,.038,.038,.02);}
    B.add(new THREE.TorusGeometry(R+.01,.04,6,36),K.or,rx,yc,0,0,PI10/2,0);B.add(new THREE.TorusGeometry(.25,.03,6,24),K.or,rx,yc,0,0,PI10/2,0);
    for(let k=0;k<4;k++){const a=(k+.5)/4*2*PI10,ca=Math.cos(a),sa=Math.sin(a);tige(P(XE-.12,yc+sa*.40,ca*.40),P(rx,yc+sa*R,ca*R),.026,K.or);}   // les haubans d'or : la rosace tient au corps
    const tx=XE+.08;TX(B,K.chrome,[[.12,0],[.16,.06],[.22,.34],[.30,.56]],tx,yc,0,0,12);TX(B,K.glow,[[.001,0],[.24,0],[.24,.02],[.001,.02]],tx+.54,yc,0,0,12);
    c.echap=[tx+.58,yc,0];
    break;}
  case 14:{ // LE SOLEIL (h2) — LE SOLEIL-LION : le W12 est son torse d'ambre, la cloche d'embrayage = le VISAGE d'or du soleil (arcade, yeux blancs-chauds, nez, bouche
    //   à crocs), et sa crinière EST la couronne : deux rangs de rayons flammés plantés autour de la face ; l'échappement = un petit soleil de queue autour de
    //   la tuyère à braise
    const yc=.30,hx=-XE,GOLD=h2_poli(0xf3dc96,240,.45);
    const ray=(x,R,len,a,m,w,t)=>{const rh=new THREE.Vector3(0,Math.cos(a),Math.sin(a)),d=rh.clone().multiplyScalar(Math.cos(t)).add(new THREE.Vector3(Math.sin(t),0,0)).normalize(),td=new THREE.Vector3(0,-Math.sin(a),Math.cos(a)),n=new THREE.Vector3().crossVectors(d,td);
      h2_orient(B,plan10([[0,-w],[0,w],[len*.62,w*.55],[len,0],[len*.62,-w*.55]],.045,.008),m,P(x,yc+Math.cos(a)*R,Math.sin(a)*R),d,n);};
    // le torse
    B.add(h2_loft([[hx+.06,yc,.42,.46,2.5],[hx+.34,yc,.52,.56,2.5],[-L*.1,yc,.55,.58,2.6],[L*.2,yc,.54,.57,2.6],[XE-.05,yc,.44,.47,2.5],[XE+.22,yc,.27,.28,2.5]],12),K.col,0,0,0);
    for(let k=0;k<7;k++){const x=hx+.42+k*(L-.55)/6;h2_ANN(B,K.or,.58,.022,x,yc,0);}
    // la couronne : un grand disque d'or gravé de cercles, cerclé de rayons flammés (un long, un court)
    const cx=hx-.02;
    B.add(tourX([[.46,.02],[.60,0],[.88,0],[.96,.035],[.88,.07],[.60,.07],[.46,.05]],28),K.col,cx,yc,0,0,0,0);
    for(const R of [.62,.76,.88])h2_ANN(B,K.or,R,.014,cx-.005,yc,0);h2_ANN(B,K.or,.97,.036,cx+.035,yc,0);
    for(let k=0;k<28;k++){const a=k/28*2*PI10;ray(cx+.035,.96,k%2?.34:.62,a,k%2?K.col:K.or,k%2?.075:.12,.10);}
    // le visage : crâne sculpté, arcade, yeux, nez, bouche
    B.add(h2_loft([[hx+.24,yc,.50,.52,2.4],[hx-.10,yc,.54,.54,2.3],[hx-.34,yc,.50,.50,2.3],[hx-.50,yc-.01,.36,.36,2.3],[hx-.55,yc-.02,.24,.24,2.3]],14),GOLD,0,0,0);
    const fx=hx-.46;
    for(let sd=-1;sd<=1;sd+=2){
      BXg(B,K.col,fx-.04,yc+.19,sd*.17,0,0,-sd*.22,.07,.07,.24);                                                                         // l'arcade, en colère
      B.add(G10.sph,K.blanc,fx-.07,yc+.09,sd*.17,0,0,0,.035,.065,.095);B.add(G10.sph,K.noir,fx-.10,yc+.09,sd*.17,0,0,0,.02,.04,.04);   // l'œil blanc-chaud, sa pupille
      B.add(G10.sph,K.col,fx-.04,yc-.07,sd*.27,0,0,0,.07,.10,.10);                                                                       // la pommette
      B.add(tube10([[fx-.08,yc-.19,sd*.02],[fx-.05,yc-.22,sd*.14],[fx+.02,yc-.14,sd*.28]],.014,10,4),K.noir,0,0,0);                         // le sourire
      for(let k=0;k<3;k++)vers10(B,cone10(.022,.075,5),K.blanc,P(fx-.08+k*.02,yc-.195-k*.012,sd*(.05+k*.07)),D(-.1,-1,0),1);}               // les crocs
    vers10(B,cone10(.085,.26,5),K.col,P(fx-.04,yc-.03,0),D(-1,-.15,0),1);                                                                   // le nez
    // la queue : un petit soleil autour de la tuyère
    const tx=XE+.14;h2_ANN(B,K.or,.30,.026,tx,yc,0);
    for(let k=0;k<12;k++){const a=k/12*2*PI10;B.add(plan10([[-.05,0],[.05,0],[0,.30]],.04,.006),k%2?K.or:K.col,tx,yc+Math.cos(a)*.30,Math.sin(a)*.30,a,PI10/2,0);}
    for(let k=0;k<4;k++){const a=(k+.5)/4*2*PI10;tige(P(XE-.05,yc+Math.cos(a)*.26,Math.sin(a)*.26),P(tx,yc+Math.cos(a)*.30,Math.sin(a)*.30),.022,K.or);}
    TX(B,K.chrome,[[.10,0],[.14,.05],[.21,.20],[.26,.30]],tx,yc,0,0,12);TX(B,K.glow,[[.001,0],[.20,0],[.20,.02],[.001,.02]],tx+.30,yc,0,0,12);
    c.echap=[tx+.34,yc,0];
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
