/* ===== L'ARGENT DE L'ATELIER (2026-10-01, Sacha : « plus on gagne d'argent, plus il doit y avoir des tas de billets sur le sol du garage,
   un peu placés partout dans le garage, sur les meubles et tout ») =====
   Le COMPTE (bank()) se voit : des liasses VERTES (tranche vert-de-gris, face vert billet, bande kraft) en TAS bas dans le couloir de
   la caméra (33 cm : sous les 45 cm de la règle des 8,3 m), en GROS TAS au pied des murs, en piles sur les meubles (fûts, distributeur,
   étagères du rack, servante, établi), et — quand on devient riche — en PALETTES contre les murs, loin de l'orbite. Rien entre la
   caméra et la caisse (c'est la vedette), rien dans l'allée de la porte (elle sort par là), rien de haut devant l'affiche du record.
   · TOUT EST BÂTI UNE FOIS (à la 1re visite, avec l'atelier) dans UN seul mesh en couleurs de sommets, dans la matière MATE des meubles
     (le même programme : zéro programme de plus). Les objets sont rangés dans l'ORDRE où ils apparaissent ; le compte règle seulement
     combien on en dessine (`setDrawRange`) — gagner, dépenser : rien ne se reconstruit, une comparaison par image.
   · L'ORDRE : chaque place s'ouvre à un seuil (`a`), puis c'est la place la MOINS remplie qui reçoit l'objet suivant — les tas montent
     ensemble, du bas vers le haut (jamais une liasse en l'air) ; une palette qui s'ouvre avale d'un coup ce qui tombe, puis tout
     repart ensemble. Les places VUES de la caméra (fixe, côté établi, qui regarde la porte) passent d'abord.
   · LA COURBE : n = 12 × (compte / 50)^0,4 — 100 $ → 16 objets, 1 k → 40, 10 k → 100, 100 k → 250, 1 M → 630, 2,5 M (la plus chère de
     la boutique) → 910 ; ~1 100 au plus (six palettes pleines). Dépenser fait donc FONDRE les tas : l'argent part de l'atelier.
   `dbgArgent(compte)` force un compte (sans toucher la sauvegarde) · `dbgArgent()` rend l'état · `dbgArgent(null)` relâche. */
const GARG={mesh:null,offs:null,n:-1,bank:-1,force:null,K:12,E:.4,places:0};
function garArgentN(b){return Math.max(0,Math.round(GARG.K*Math.pow(Math.max(0,b||0)/50,GARG.E)));}
function garArgentMaj(){
  if(!GARG.mesh)return;const b=GARG.force!=null?GARG.force:bank();if(b===GARG.bank)return;GARG.bank=b;
  const n=Math.min(GARG.offs.length-1,garArgentN(b));if(n===GARG.n)return;GARG.n=n;
  GARG.mesh.geometry.setDrawRange(0,GARG.offs[n]);GARG.mesh.visible=n>0;
}
function garArgent(g){
  const t00=performance.now(),T0=new THREE.BoxGeometry(1,1,1).toNonIndexed(),TP=T0.attributes.position.array;T0.dispose(); // le cube unité, 36 sommets
  const P=[],C=[],M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E9=new THREE.Euler(0,0,0,'YXZ'),V=new THREE.Vector3(),S=new THREE.Vector3(),co=new THREE.Color();
  let sd=0x5eed51;const rn=()=>{sd=(sd+0x6D2B79F5)|0;let q=Math.imul(sd^sd>>>15,1|sd);q=q+Math.imul(q^q>>>7,61|q)^q;return((q^q>>>14)>>>0)/4294967296;}; // à part : le rnd du jeu n'est pas touché
  const e=M.elements;
  // une boîte : taille (w,h,d), CENTRE (x,y,z), cap/tangage/roulis — une couleur, un grain de ±5 % (du papier, pas du plastique)
  const bx=(w,h,d,x,y,z,ry,rx,rz,hex,gr)=>{E9.set(rx||0,ry||0,rz||0);Q.setFromEuler(E9);M.compose(V.set(x,y,z),Q,S.set(w,h,d));
    co.setHex(hex);const k=1+((gr==null?rn():gr)-.5)*.1;
    for(let i=0;i<108;i+=3){const a=TP[i],b=TP[i+1],c=TP[i+2];
      P.push(e[0]*a+e[4]*b+e[8]*c+e[12],e[1]*a+e[5]*b+e[9]*c+e[13],e[2]*a+e[6]*b+e[10]*c+e[14]);C.push(co.r*k,co.g*k,co.b*k);}};
  /* LA LIASSE (v2, après capture : des bandes or / rose / cyan et une tranche crème se lisaient comme des CONFETTIS) : tout est VERT
     BILLET, sombre (SON règle la clé de la boutique : pas de fluo) — tranche vert-de-gris, face vert foncé, bande papier kraft doré
     éteint ; et plus grosse (×3,2 d'une vraie liasse : de la caméra, à 10 m, une vraie serait une miette). */
  const BAND=[0xbfa25c,0xbfa25c,0xa9884a],FACE=[0x28683c,0x245e37,0x2e7545],TRANCHE=0x668f62;
  const LL=.5,LT=.11,LW=.24;
  const liasse=(x,y,z,ry,rx,rz)=>{const u=rn(),f=FACE[(u*3)|0],b=BAND[(rn()*BAND.length)|0],c=Math.cos(ry),s=Math.sin(ry);
    const at=(lx,ly,lz)=>[x+c*lx+s*lz,y+ly,z-s*lx+c*lz]; // (tangage/roulis petits : la hauteur des pièces est prise au centre)
    let q=at(0,.048,0);bx(LL-.014,.096,LW-.014,q[0],q[1],q[2],ry,rx,rz,TRANCHE,u);   // la tranche : la pile de billets vue de côté
    q=at(0,.103,0);bx(LL,.014,LW,q[0],q[1],q[2],ry,rx,rz,f,u);                       // la face du billet du dessus
    q=at(0,.055,0);bx(.09,LT+.004,LW+.01,q[0],q[1],q[2],ry,rx,rz,b,u);};             // la bande
  const billet=(x,z,ry)=>bx(.24,.005,.11,x,.004,z,ry,(rn()-.5)*.06,(rn()-.5)*.06,0x3a8f55);
  const palette=(x,z,ry)=>{const c=Math.cos(ry),s=Math.sin(ry),at=(lx,lz)=>[x+c*lx+s*lz,z-s*lx+c*lz];
    for(const lz of [-.4,0,.4]){const q=at(0,lz);bx(1.12,.02,.12,q[0],.01,q[1],ry,0,0,0x6e4d2c);}
    for(const lx of [-.5,0,.5])for(const lz of [-.4,0,.4]){const q=at(lx,lz);bx(.12,.085,.12,q[0],.0625,q[1],ry,0,0,0x5f4226);}
    for(const lz of [-.39,-.195,0,.195,.39]){const q=at(0,lz);bx(1.12,.022,.14,q[0],.116,q[1],ry,0,0,0x86603a);}};
  /* ---- OÙ POSER : les meubles (rectangles de leurs ombres au sol, les mêmes que `F9`), le bazar du couloir, l'allée et la PORTE (la
     caisse sort par là), l'affiche du record (rien de haut devant), et rien ENTRE la caméra et la caisse (SON : « elle est la vedette ») ---- */
  const zB=-GAR.D/2+.9,RECT=[[-3,zB,9.8,1.5],[-9.4,-1.6,.8,1.5],[-9.5,2.6,.9,2.1],[-9.6,-7.2,.8,.8],[-9.6,-5.1,.8,.8],[-9.4,7.4,.8,.8],[-8.9,5.6,.7,.7],
     [-9.9,-9.4,1.2,1.0],[7.7,-6.4,3.4,1.8],[9.0,-2.2,1.9,1.2],[9.6,3.4,1.5,4.4],[10.3,8.4,.9,1.5],[-5.6,10.4,3.2,1.0],[9.9,-10.3,1.2,4.0],
     [-8.2,-5.4,.6,1.4],[-8.6,1.2,.5,1.5],[7.6,-4.2,.6,.6],[-8.16,9.2,1.3,.3],[-3.35,10.4,1.1,.9]];
  const ROND=[[5.9,3.3,.45],[6.5,2.62,.45],[-5.4,-5.6,.45],[-5.6,4.4,.5],[6.79,-3.48,.4],[7.2,1.4,.4],[-6.4,-2.6,.55],[5.2,5.6,.3],
     [-4.4,6.5,.4],[-3.6,6.2,.35],[-1.6,-6.4,.65],[4.6,-5.2,1.1],[-6.2,2.2,1.2],[-8.2,-3.6,.25],[-8.7,-3.0,.25],[5.8,-6.4,.9]];
  for(let i=0;i<9;i++){const a=1.1+i*.42,r9=5.4+((i*7)%5)*.5;ROND.push([Math.sin(a)*r9,Math.cos(a)*r9,.2]);}      // la rallonge
  for(let i=0;i<7;i++){const a=i*2.4,r9=5.2+((i*3)%5)*.6;ROND.push([Math.sin(a)*r9,Math.cos(a)*r9,.25]);}         // les clés semées
  const PAL=[[9.6,11.0,0],[-9.6,11.3,0],[-9.6,4.45,Math.PI/2],[9.7,-.2,Math.PI/2],[4.2,-11.5,0],[-9.4,-11.4,0]];
  for(const p9 of PAL)RECT.push([p9[0],p9[1],p9[2]?.92:1.12,p9[2]?1.12:.92]);
  const libre=(x,z,m)=>{if(Math.abs(x)>GAR.W/2-.7||Math.abs(z)>GAR.D/2-.7)return false;
    if(Math.abs(x)<2.4+m&&z>3)return false;                              // l'allée de la porte : la caisse sort par là (sa largeur + le tas)
    if(z>9.9&&x>4.4&&x<7.6)return false;                                 // (2026-10-19) l'ÉTAL du moteur, au mur de la porte (à gauche)
    if(z>11.2&&x<-4.9&&x>-8.2)return false;                              // l'affiche du record, au mur de la porte (passée à droite)
    if(z<-4.2&&Math.abs(x)<4.6)return false;                             // entre la caméra (côté établi) et la caisse : rien
    for(const r of RECT)if(Math.abs(x-r[0])<r[2]/2+m&&Math.abs(z-r[1])<r[3]/2+m)return false;
    for(const o of ROND)if(Math.hypot(x-o[0],z-o[1])<o[2]+m)return false;return true;};
  // l'ordre de ce que la caméra VOIT : elle est fixe côté établi (≈ 0, 3, −10,5) et regarde la caisse — puis la porte derrière elle
  const cam=new THREE.Vector3(0,3,-10.5),fw=new THREE.Vector3(0,.8,0).sub(cam).normalize(),vu=(x,z)=>{V.set(x,.2,z).sub(cam).normalize();return Math.acos(Math.max(-1,Math.min(1,V.dot(fw))));};
  const choisir=(r0,r1,m,ecart,nb,deja)=>{const cand=[];
    for(let x=-10;x<=10;x+=.5)for(let z=-12;z<=12;z+=.5){const r=Math.hypot(x,z);if(r<r0||r>r1||!libre(x,z,m))continue;cand.push([x,z,vu(x,z)]);}
    cand.sort((a,b)=>a[2]-b[2]);const pris=[];
    for(const c of cand){if(pris.length>=nb)break;if(pris.concat(deja).every(p=>Math.hypot(p[0]-c[0],p[1]-c[1])>=ecart))pris.push(c);}
    return pris;};
  // un TAS : des couches qui rétrécissent, de travers, et quelques billets échappés autour
  const tas=(x0,z0,couches)=>{const it=[];let y=0;
    const vole=()=>{const a=rn()*6.2832,d=.7+rn()*.45;it.push(()=>billet(x0+Math.cos(a)*d,z0+Math.sin(a)*d,rn()*6.2832));};
    couches.forEach((cc,l)=>{const n=cc[0],R=cc[1],y9=y,tilt=l?.12:.04,pts=[];
      for(let k=0;k<80&&pts.length<n;k++){const a=rn()*6.2832,d=Math.sqrt(rn())*R,px=x0+Math.cos(a)*d,pz=z0+Math.sin(a)*d;
        if(pts.every(q=>Math.hypot(q[0]-px,q[1]-pz)>.27))pts.push([px,pz]);}
      for(const q of pts)it.push(()=>liasse(q[0],y9,q[1],rn()*6.2832,(rn()-.5)*tilt,(rn()-.5)*tilt));
      vole();y+=LT*.96;});
    return {it:it,a:0};};
  // LES TAS BAS du couloir de la caméra (3 couches : 33 cm, sous les 45 cm de la règle) — puis LES GROS TAS au pied des murs (5 couches)
  const bas=choisir(5.1,8.1,.72,1.7,10,[]),gros=choisir(8.4,11.2,1.0,2.2,7,bas);
  const TB=bas.map(c=>tas(c[0],c[1],[[6,.55],[4,.4],[2,.22]])),TG=gros.map(c=>tas(c[0],c[1],[[9,.8],[7,.62],[5,.46],[3,.3],[1,.08]]));
  // LES MEUBLES : des piles bien rangées sur ce qui est plat (colonnes [dx, dz], couches)
  const pile=(x,y,z,ry,cols,couches)=>{const it=[];for(let l=0;l<couches;l++)for(const c9 of cols)
      it.push(()=>liasse(x+c9[0]+(rn()-.5)*.02,y+l*LT,z+c9[1]+(rn()-.5)*.02,ry+(rn()-.5)*.08,0,0));return {it:it,a:0};};
  const M9=[pile(-6.6,1.0,10.42,.35,[[0,0]],3),                               // sur les fûts
    pile(10.3,2.13,8.4,Math.PI/2,[[0,-.27],[0,.27]],4),                        // sur le distributeur
    pile(9.6,.57,2.93,0,[[0,0]],3),pile(9.6,1.72,3.8,0,[[0,0]],3),            // les étagères du rack (places libres entre bacs, cartons, jantes)
    pile(-4.6,1.0,10.42,-.3,[[0,0]],3),pile(-9.4,1.26,-1.6,Math.PI/2,[[0,-.36],[0,.36]],4), // l'autre fût · la servante
    pile(9.6,2.87,3.25,0,[[0,0]],3),pile(9.6,.57,5.2,0,[[0,0]],3),
    pile(-3.1,.98,-11.95,0,[[-.27,0],[.27,0]],5),pile(.95,.98,-11.95,0,[[-.27,0],[.27,0]],4),pile(-7.45,.98,-11.95,Math.PI/2,[[0,0]],4), // l'établi (derrière la caméra)
    pile(9.6,1.72,5.2,0,[[0,0]],3),pile(9.6,2.87,1.55,0,[[0,0]],3),pile(9.6,4.02,3.55,0,[[0,0]],2)];
  // LES PALETTES (riche) : contre les murs, au-delà de l'orbite — 1 palette + 10 couches de 8 liasses (1,23 m)
  const pal=(x,z,ry)=>{const it=[()=>palette(x,z,ry)],c=Math.cos(ry),s=Math.sin(ry);
    for(let l=0;l<10;l++)for(let j=0;j<4;j++)for(let i=0;i<2;i++){const lx=(i-.5)*.505+(rn()-.5)*.012,lz=(j-1.5)*.232+(rn()-.5)*.012;
      it.push(()=>liasse(x+c*lx+s*lz,.127+l*LT,z-s*lx+c*lz,ry+(rn()-.5)*.03,0,0));}
    return {it:it,a:0};};
  const P9=PAL.map(p9=>pal(p9[0],p9[1],p9[2]));
  // les seuils d'ouverture : tas bas et meubles entremêlés (ce qu'on voit d'abord), les gros tas, puis les palettes quand on devient riche
  const ord=[],A1=[0,1,3,6,8,11,14,17,21,25,29,33,38,43,48,54,60,66,72,80,88,96,104,112];
  for(let i=0,ti=0,mi=0;ti<TB.length||mi<M9.length;i++){const p9=(i%2===0&&ti<TB.length)||mi>=M9.length?TB[ti++]:M9[mi++];p9.a=A1[Math.min(i,A1.length-1)]+Math.max(0,i-A1.length+1)*8;ord.push(p9);}
  TG.forEach((p9,i)=>{p9.a=70+i*28;ord.push(p9);});
  const A2=[160,240,340,460,600,760];P9.forEach((p9,i)=>{p9.a=A2[i];ord.push(p9);});
  // ---- LA FILE : à chaque pas, la place ouverte la MOINS remplie reçoit l'objet suivant ----
  const offs=[0],fait=ord.map(()=>0);
  for(let n=0;;n++){let best=-1,bf=2;
    for(let k=0;k<ord.length;k++){const p9=ord[k];if(p9.a>n||fait[k]>=p9.it.length)continue;const f=fait[k]/p9.it.length;if(f<bf){bf=f;best=k;}}
    if(best<0){if(ord.every((p9,k)=>fait[k]>=p9.it.length))break;offs.push(P.length/3);continue;} // un seuil pas encore atteint : l'objet n (rien de neuf)
    ord[best].it[fait[best]++]();offs.push(P.length/3);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  geo.computeVertexNormals();lpOmbre(geo,.6); // l'ombre cuite au pied des tas (celle des meubles)
  let mt=null;for(const m9 of GAR.meubles||[])if(m9.material&&m9.material.userData&&m9.material.userData.g==='m'){mt=m9.material;break;}
  if(!mt){mt=lpMat('m');if(!mt.envMap){mt.envMap=envTex;mt.combine=THREE.MixOperation;mt.reflectivity=0;}}
  const me=new THREE.Mesh(geo,mt);me.matrixAutoUpdate=false;me.updateMatrix();me.visible=false;g.add(me);
  GARG.mesh=me;GARG.offs=offs;GARG.n=-1;GARG.bank=-1;GARG.places=ord.length;GARG.ms=Math.round(performance.now()-t00);GARG.pos={bas:bas.map(c=>[c[0],c[1]]),gros:gros.map(c=>[c[0],c[1]])};garArgentMaj();
}
