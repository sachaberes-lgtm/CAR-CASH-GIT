// ---- LES FORMES ----
function richPlat(g){ // non indexée, normales PLATES tournées vers l'extérieur, uv au centre (le métal uni)
  const ng=g.index?g.toNonIndexed():g,p=ng.attributes.position.array,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),m=new THREE.Vector3();
  for(let i=0;i<p.length;i+=9){a.fromArray(p,i);b.fromArray(p,i+3);c.fromArray(p,i+6);m.copy(a).add(b).add(c);
    const n=b.clone().sub(a).cross(c.clone().sub(a));if(n.dot(m)<0){p[i+3]=c.x;p[i+4]=c.y;p[i+5]=c.z;p[i+6]=b.x;p[i+7]=b.y;p[i+8]=b.z;}}
  ng.computeVertexNormals();const uv=new Float32Array(p.length/3*2).fill(.5);ng.setAttribute('uv',new THREE.BufferAttribute(uv,2));if(ng!==g)g.dispose();return ng;}
function richPepite(k){ // une pépite : un icosaèdre cabossé (le même creux pour le même sommet : pas de fissure)
  const g=new THREE.IcosahedronGeometry(1,1),p=g.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const h=Math.sin(v.x*12.9+v.y*78.2+v.z*37.7+k*9.1)*43758.5453,r=.72+.42*(h-Math.floor(h));v.multiplyScalar(r);v.y*=.68;p.setXYZ(i,v.x,v.y,v.z);}
  return richPlat(g);}
function richLingot(){const g=new THREE.BoxGeometry(1,.42,.5),p=g.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>0){p.setX(i,p.getX(i)*.78);p.setZ(i,p.getZ(i)*.7);}return richPlat(g);}
function richDiamant(){ // la taille BRILLANT : la table, la couronne (8 + 16 facettes), le rondiste, la culasse jusqu'à la pointe
  const T=[],G=[],P=[],tY=.3,tR=.54,n=8;
  for(let i=0;i<n;i++){const a=i/n*6.2832;T.push([Math.cos(a)*tR,tY,Math.sin(a)*tR]);}
  for(let i=0;i<2*n;i++){const a=i/(2*n)*6.2832;G.push([Math.cos(a),0,Math.sin(a)]);}
  const ctr=[0,tY,0],cu=[0,-.95,0],tri=(a,b,c)=>P.push(...a,...b,...c);
  for(let i=0;i<n;i++){const t0=T[i],t1=T[(i+1)%n],g0=G[2*i],gm=G[2*i+1],g1=G[(2*i+2)%(2*n)]; // la table, puis la couronne : t0 au-dessus de g0, t1 au-dessus de g1
    tri(ctr,t0,t1);tri(t0,g0,gm);tri(t0,gm,t1);tri(t1,gm,g1);}
  for(let i=0;i<2*n;i++){const g0=G[i],g1=G[(i+1)%(2*n)],mid=[(g0[0]+g1[0])*.5*.6,-.42,(g0[2]+g1[2])*.5*.6];tri(g0,g1,mid);tri(g0,mid,cu);tri(mid,g1,cu);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3));return richPlat(g);}
function richPiece(){ // la pièce : un cylindre ; ses deux faces lisent les deux disques de l'image, la tranche lit la bande du bas (son cordon)
  // (2026-10-10) une VRAIE épaisseur (2,2 mm pour 25,75 : .16 du rayon, elle en avait la moitié) — la tranche striée accroche la lumière quand la pièce tourne
  const g=new THREE.CylinderGeometry(1,1,.16,40,1),uv=g.attributes.uv,gr=g.groups,vu=new Uint8Array(uv.count);
  for(const G9 of gr){for(let k=G9.start;k<G9.start+G9.count;k++){const i=g.index.getX(k);if(vu[i])continue;vu[i]=1; // (un sommet servi par deux triangles ne se recale qu'une fois)
    const u=uv.getX(i),v=uv.getY(i);
    if(G9.materialIndex===0)uv.setXY(i,u,.008+v*.031);else if(G9.materialIndex===1)uv.setXY(i,.0156+u*.46875,.0547+v*.9375);else uv.setXY(i,.5156+u*.46875,.0547+v*.9375);}}
  g.clearGroups();return g;}

function richRond(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();}
function richTexCarte(){return richCv(512,656,function(x){ // la carte NOIRE : recto (0-322) et verso (334-656), un trait noir entre les deux (la tranche y lit sa couleur)
  x.fillStyle='#08080b';x.fillRect(0,0,512,656);
  const face=function(y0,dos){const G=x.createLinearGradient(0,y0,512,y0+322);G.addColorStop(0,'#17171d');G.addColorStop(.5,'#0b0b10');G.addColorStop(1,'#1b1b23');x.fillStyle=G;x.fillRect(0,y0,512,322);
    x.strokeStyle='rgba(255,255,255,.035)';x.lineWidth=1;for(let i=-322;i<512;i+=5){x.beginPath();x.moveTo(i,y0+322);x.lineTo(i+322,y0);x.stroke();} // le métal BROSSÉ
    if(!dos){const cg=x.createLinearGradient(52,y0+112,116,y0+160);cg.addColorStop(0,'#fff0b5');cg.addColorStop(1,'#b8892c');x.fillStyle=cg;richRond(x,52,y0+110,66,50,9);x.fill(); // la puce
      x.strokeStyle='rgba(90,60,10,.7)';x.lineWidth=2;x.beginPath();x.moveTo(52,y0+135);x.lineTo(118,y0+135);x.moveTo(74,y0+110);x.lineTo(74,y0+160);x.moveTo(96,y0+110);x.lineTo(96,y0+160);x.stroke();
      x.strokeStyle='rgba(225,228,235,.75)';x.lineWidth=3;for(let k=0;k<3;k++){x.beginPath();x.arc(150,y0+135,10+k*9,-.7,.7);x.stroke();} // sans contact
      x.font='19px "Press Start 2P",monospace';x.textBaseline='middle';x.fillStyle='#dfe2ea';x.fillText('CASH CAR',36,y0+58);
      x.textAlign='right';x.font='11px "Press Start 2P",monospace';x.fillStyle='#a7adb8';x.fillText('BLACK',476,y0+58);x.textAlign='left';
      x.font='18px "Press Start 2P",monospace';x.fillStyle='rgba(0,0,0,.8)';x.fillText('4000 1234 5678 9010',38,y0+218);x.fillStyle='#d9dce4';x.fillText('4000 1234 5678 9010',36,y0+215); // en RELIEF
      x.font='9px "Press Start 2P",monospace';x.fillStyle='#b9bec8';x.fillText('L. CASH',38,y0+272);x.fillText('12/99',250,y0+272);
      x.globalAlpha=.9;x.fillStyle='#d9a63a';x.beginPath();x.arc(420,y0+266,24,0,6.2832);x.fill();x.fillStyle='#c9ccd4';x.beginPath();x.arc(450,y0+266,24,0,6.2832);x.fill();x.globalAlpha=1;}
    else{x.fillStyle='#232328';x.fillRect(0,y0+30,512,58);x.fillStyle='#ddd8cb';x.fillRect(36,y0+120,300,40);x.font='11px "Press Start 2P",monospace';x.fillStyle='#444';x.fillText('777',300,y0+142);
      const H=x.createLinearGradient(380,0,470,0);H.addColorStop(0,'#ff9ad8');H.addColorStop(.5,'#8ffcff');H.addColorStop(1,'#fff08a');x.fillStyle=H;x.globalAlpha=.75;x.beginPath();x.arc(425,y0+250,34,0,6.2832);x.fill();x.globalAlpha=1;}};
  face(0,false);face(334,true);});}
function richCarteGeo(){const g=new THREE.BoxGeometry(1,.63,.018),uv=g.attributes.uv;
  for(const G9 of g.groups)for(let k=G9.start;k<G9.start+G9.count;k++){const i=g.index.getX(k),u=uv.getX(i),v=uv.getY(i);
    if(G9.materialIndex===4)uv.setXY(i,u,.509+v*.491);else if(G9.materialIndex===5)uv.setXY(i,u,v*.491);else uv.setXY(i,.5,.5);}
  g.clearGroups();return g;}
function richTexLiasse(){const b=RICH.texBillet.image;return richCv(512,512,function(x){ // la LIASSE : le billet du dessus et sa BANDE ; les feuilles empilées sur la tranche
  x.drawImage(b,0,0,512,236);x.fillStyle='#efe6cf';x.fillRect(228,0,56,236);x.fillStyle='rgba(150,110,40,.6)';x.fillRect(228,0,3,236);x.fillRect(281,0,3,236);
  x.save();x.translate(256,118);x.rotate(-Math.PI/2);x.font='14px "Press Start 2P",monospace';x.fillStyle='#7a5a1a';x.textAlign='center';x.textBaseline='middle';x.fillText('$ 10 000',0,0);x.restore();
  for(let y=256;y<512;y+=4){x.fillStyle=(y/4)%2?'#cfe9e1':'#0c5a66';x.fillRect(0,y,512,4);}x.fillStyle='#efe6cf';x.fillRect(228,256,56,256);});}
function richLiasseGeo(){const g=new THREE.BoxGeometry(1,.46,.12),uv=g.attributes.uv;
  for(const G9 of g.groups)for(let k=G9.start;k<G9.start+G9.count;k++){const i=g.index.getX(k),u=uv.getX(i),v=uv.getY(i);
    if(G9.materialIndex>=4)uv.setXY(i,u,.539+v*.461);else if(G9.materialIndex>=2)uv.setXY(i,u,v*.5);else uv.setXY(i,.04+v*.12,u*.5);} // les grandes tranches portent la bande ; sur toutes, les feuilles s'empilent dans l'épaisseur
  g.clearGroups();return g;}
function richTexChampagne(){return richCv(128,512,function(x){const Y=function(v){return (1-v)*512;}; // la bouteille, de bas (v 0) en haut (v 1)
  x.fillStyle='#062a12';x.fillRect(0,0,128,512);x.fillStyle='rgba(140,210,160,.22)';x.fillRect(22,Y(.72),7,Y(.06)-Y(.72)); // le verre vert et son reflet
  x.fillStyle='#efe3c2';x.fillRect(0,Y(.46),74,Y(.22)-Y(.46));x.fillStyle='#c9a24a';x.fillRect(0,Y(.46),74,6);x.fillRect(0,Y(.22)-6,74,6);x.fillRect(30,Y(.38),16,Y(.3)-Y(.38)); // l'étiquette
  const G=x.createLinearGradient(0,0,128,0);G.addColorStop(0,'#b8862c');G.addColorStop(.45,'#ffe6a0');G.addColorStop(1,'#a87a22');x.fillStyle=G;x.fillRect(0,0,128,Y(.71)); // la COIFFE dorée
  x.fillStyle='rgba(90,60,10,.35)';for(let i=0;i<14;i++)x.fillRect(Math.random()*128,Math.random()*Y(.8),2,30+Math.random()*60);
  x.fillStyle='#efe3c2';x.fillRect(0,Y(.71),128,8);});}
/* (2026-10-16, Léo : « les bouteilles, on dirait des sodas, des potions Fortnite — reviens sur la bouteille de vin cher, juste deux, trois,
   quatre en plus, mais dans le vin ») LES COUSINS DU CHAMPAGNE : le bordeaux grand cru, le bourgogne, le champagne rosé, le vin liquoreux
   doré — faits comme lui : un profil tourné (richVinGeo), une toile peinte de bas en haut (le verre et son reflet, l'étiquette sur une face,
   la capsule), le programme du métal (le studio du bijoutier s'y reflète comme sur le verre). Sans nom ni marque. */
function richVinStrie(x,Y,c,v0,v1){x.fillStyle=c;x.fillRect(22,Y(v1),7,Y(v0)-Y(v1));x.fillRect(31,Y(v1),2,Y(v0)-Y(v1));} // le reflet du verre
function richVinCoiffe(x,Y,v0,c0,c1,c2){const G=x.createLinearGradient(0,0,128,0);G.addColorStop(0,c0);G.addColorStop(.42,c1);G.addColorStop(1,c2);x.fillStyle=G;x.fillRect(0,0,128,Y(v0));} // la capsule, éclairée de biais
function richVinEtiq(x,Y,v0,v1,fond,fil,enc,l1,l2,deco){ // l'étiquette sur une face (0 → 80 de la toile) : le papier, deux filets, l'emblème, deux lignes de texte
  const a=Y(v1),b=Y(v0);x.fillStyle=fond;x.fillRect(0,a,80,b-a);x.fillStyle=fil;x.fillRect(0,a+5,80,2);x.fillRect(0,b-7,80,2);x.fillRect(4,a+5,1.5,b-a-10);x.fillRect(74,a+5,1.5,b-a-10);
  if(deco)deco(x,40,a+(b-a)*.36);x.textAlign='center';x.textBaseline='middle';x.fillStyle=enc;x.font='7px "Press Start 2P",monospace';x.fillText(l1,40,a+(b-a)*.7);
  x.font='5px "Press Start 2P",monospace';x.fillText(l2,40,a+(b-a)*.84);}
function richVinChateau(x,cx,cy){x.strokeStyle='#5b3a1e';x.lineWidth=1.4;x.beginPath();x.moveTo(cx-22,cy+8);x.lineTo(cx+22,cy+8);x.moveTo(cx-16,cy+8);x.lineTo(cx-16,cy-2);x.lineTo(cx,cy-10);x.lineTo(cx+16,cy-2);x.lineTo(cx+16,cy+8);
  x.moveTo(cx-22,cy+8);x.lineTo(cx-22,cy-6);x.lineTo(cx-19,cy-11);x.lineTo(cx-16,cy-6);x.moveTo(cx+22,cy+8);x.lineTo(cx+22,cy-6);x.lineTo(cx+19,cy-11);x.lineTo(cx+16,cy-6);x.stroke();
  x.fillStyle='#5b3a1e';x.fillRect(cx-3,cy+1,6,7);} // le château, gravé
function richVinBlason(x,cx,cy){x.fillStyle='#c9a24a';x.beginPath();x.moveTo(cx-11,cy-10);x.lineTo(cx+11,cy-10);x.lineTo(cx+11,cy+2);x.quadraticCurveTo(cx,cy+13,cx-11,cy+2);x.closePath();x.fill();
  x.fillStyle='#7a1420';x.fillRect(cx-2,cy-10,4,19);x.fillRect(cx-11,cy-4,22,3);} // le blason
const RICH_VINS=[
  {nom:'bordeaux',p:[[0,0],[.3,0],[.33,.03],[.34,.06],[.34,.72],[.33,.77],[.27,.83],[.17,.88],[.13,.93],[.12,1],[.12,1.2],[.13,1.22],[.13,1.28],[.1,1.3],[0,1.3]],
   peint:function(x,Y){x.fillStyle='#120a0b';x.fillRect(0,0,128,512);richVinStrie(x,Y,'rgba(210,140,150,.16)',.08,.7);   // LE BORDEAUX GRAND CRU : le verre presque noir
     richVinEtiq(x,Y,.2,.48,'#efe6cf','#b8923e','#5a1a1e','GRAND CRU','CLASSE 1982',richVinChateau);
     richVinCoiffe(x,Y,.79,'#3c0810','#8a1a26','#2a050b');x.fillStyle='#c9a24a';x.fillRect(0,Y(.8),128,4);}},                   // la capsule bordeaux, son anneau d'or
  {nom:'bourgogne',p:[[0,0],[.33,0],[.36,.03],[.37,.07],[.37,.42],[.35,.55],[.29,.7],[.21,.84],[.15,.96],[.13,1.04],[.13,1.2],[.14,1.22],[.14,1.28],[.1,1.3],[0,1.3]],
   peint:function(x,Y){x.fillStyle='#16200e';x.fillRect(0,0,128,512);richVinStrie(x,Y,'rgba(170,210,140,.17)',.08,.6);   // LE BOURGOGNE : épaules tombantes, verre vert sombre
     richVinEtiq(x,Y,.16,.4,'#f2ead6','#9c7a34','#3d2a12','GRAND VIN','DE BOURGOGNE',richVinBlason);
     x.fillStyle='#f2ead6';x.fillRect(0,Y(.62),60,Y(.56)-Y(.62));x.fillStyle='#9c7a34';x.fillRect(0,Y(.62),60,2);            // la collerette
     richVinCoiffe(x,Y,.8,'#8a6a22','#f4dc8e','#6e5216');}},                                                                     // la capsule dorée
  {nom:'rose',p:[[0,0],[.33,0],[.36,.03],[.37,.08],[.37,.6],[.34,.7],[.24,.82],[.15,.92],[.13,1],[.13,1.16],[.145,1.18],[.145,1.27],[.1,1.3],[0,1.3]],shin:110,
   peint:function(x,Y){x.fillStyle='#6e2432';x.fillRect(0,0,128,512);x.fillStyle='rgba(255,170,180,.12)';x.fillRect(0,Y(.6),128,Y(.04)-Y(.6));richVinStrie(x,Y,'rgba(255,215,222,.34)',.06,.7);    // LE CHAMPAGNE ROSÉ : le verre clair, le rosé qui se voit
     richVinEtiq(x,Y,.22,.46,'#f7f1ea','#d49a82','#8a4a40','BRUT ROSE','MILLESIME',function(x9,cx,cy){x9.fillStyle='#d49a82';x9.beginPath();x9.arc(cx,cy,9,0,6.2832);x9.fill();x9.fillStyle='#f7f1ea';x9.beginPath();x9.arc(cx,cy,5,0,6.2832);x9.fill();});
     richVinCoiffe(x,Y,.71,'#a8604e','#f6cdbd','#8a4a3c');x.fillStyle='#f7f1ea';x.fillRect(0,Y(.71),128,6);}},                   // la coiffe or rose
  {nom:'liquoreux',p:[[0,0],[.27,0],[.3,.03],[.3,.74],[.29,.79],[.23,.85],[.15,.9],[.115,.95],[.105,1.02],[.105,1.22],[.115,1.24],[.115,1.3],[0,1.3]],shin:120,
   peint:function(x,Y){x.fillStyle='#6a4206';x.fillRect(0,0,128,512);x.fillStyle='rgba(255,200,90,.12)';x.fillRect(0,Y(.64),128,Y(.04)-Y(.64));richVinStrie(x,Y,'rgba(255,236,180,.34)',.06,.72);  // LE VIN LIQUOREUX : fin, le vin couleur d'or au travers du verre clair
     richVinEtiq(x,Y,.24,.5,'#f8f5ec','#c9a24a','#6e5216','PREMIER CRU','VIN DOUX',function(x9,cx,cy){x9.strokeStyle='#c9a24a';x9.lineWidth=1.5;x9.beginPath();x9.arc(cx,cy,10,0,6.2832);x9.stroke();x9.fillStyle='#c9a24a';x9.font='8px "Press Start 2P",monospace';x9.textAlign='center';x9.textBaseline='middle';x9.fillText('1',cx,cy+1);});
     richVinCoiffe(x,Y,.82,'#8a6a22','#f8e6a6','#6e5216');}}];
function richTexVin(V){return richCv(128,512,function(x){V.peint(x,function(v){return (1-v)*512;});});}
function richVinGeo(P){const g=new THREE.LatheGeometry(P.map(function(a){return new THREE.Vector2(a[0],a[1]);}),16),p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setY(i,p.getY(i)/1.3);g.translate(0,-.62,0);g.computeVertexNormals();return g;}
function richChampagneGeo(){const P=[[0,0],[.33,0],[.36,.03],[.37,.08],[.37,.6],[.34,.7],[.24,.82],[.15,.92],[.13,1],[.13,1.16],[.145,1.18],[.145,1.27],[.1,1.3],[0,1.3]].map(function(a){return new THREE.Vector2(a[0],a[1]);});
  const g=new THREE.LatheGeometry(P,14),p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setY(i,p.getY(i)/1.3);g.translate(0,-.62,0);g.computeVertexNormals();return g;}
function richEmeraude(){ // la taille ÉMERAUDE : table rectangulaire, gradins, rondiste octogonal allongé, culasse en carène
  const oct=function(w,l,c,y){return [[-w+c,y,-l],[w-c,y,-l],[w,y,-l+c],[w,y,l-c],[w-c,y,l],[-w+c,y,l],[-w,y,l-c],[-w,y,-l+c]];};
  const T=oct(.5,.78,.16,.32),S=oct(.78,1.06,.24,.16),G=oct(.9,1.2,.28,0),B=oct(.55,.85,.18,-.32),K0=[0,-.62,-.45],K1=[0,-.62,.45];
  const P=[],tri=function(a,b,c){P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);},quad=function(a,b,c,d){tri(a,b,c);tri(a,c,d);};
  for(let i=0;i<8;i++)tri([0,.32,0],T[i],T[(i+1)%8]);
  for(let i=0;i<8;i++){const j=(i+1)%8;quad(T[i],S[i],S[j],T[j]);quad(S[i],G[i],G[j],S[j]);quad(G[i],B[i],B[j],G[j]);}
  tri(B[0],B[1],K0);tri(B[1],B[2],K0);quad(B[2],B[3],K1,K0);tri(B[3],B[4],K1);tri(B[4],B[5],K1);tri(B[5],B[6],K1);quad(B[6],B[7],K0,K1);tri(B[7],B[0],K0);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3));g.scale(.72,1,.72);return richPlat(g);}
function richFusion(L){ // des primitives (géométrie, matrice) → UNE géométrie non indexée, normales plates (chaque primitive garde son sens)
  let n=0;const parts=[];for(const e of L){const gg=e[0].index?e[0].toNonIndexed():e[0].clone();gg.applyMatrix4(e[1]);parts.push(gg);n+=gg.attributes.position.count;e[0].dispose();}
  const pos=new Float32Array(n*3);let o=0;for(const gg of parts){pos.set(gg.attributes.position.array,o);o+=gg.attributes.position.array.length;gg.dispose();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.computeVertexNormals();g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(n*2).fill(.5),2));return g;}
function richM4(x,y,z,sx,sy,sz){return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(sx,sy==null?sx:sy,sz==null?sx:sz));}
function richCraneGeo(){ // (2026-10-08, Léo : « des crânes pastel, plus petits, les yeux en creux, pas de pierre, réaliste ») LE CRÂNE :
  // la voûte (reculée : elle ne bouche pas la face), les arcades sourcilières, les pommettes, les bords externes des orbites, la cloison du
  // nez, le maxillaire et ses dents, la mandibule (ses branches, ses dents, le menton). Les ORBITES, le NEZ et la bouche sont de VRAIES
  // ouvertures entre ces os : derrière, un creux sombre posé plus loin (« noir ») — on voit le relief, pas une pastille.
  const I=function(r,d){return new THREE.IcosahedronGeometry(r,d);},B=function(a,b,c){return new THREE.BoxGeometry(a,b,c);};
  const os=[[I(1,2),richM4(0,.38,-.32,.95,.9,1)],                                                    // la voûte
    [I(1,1),richM4(0,.32,.62,.66,.1,.2)],                                                             // les arcades sourcilières
    [I(1,1),richM4(.42,-.3,.56,.22,.12,.22)],[I(1,1),richM4(-.42,-.3,.56,.22,.12,.22)],              // les pommettes
    [I(1,1),richM4(.6,0,.42,.11,.3,.2)],[I(1,1),richM4(-.6,0,.42,.11,.3,.2)],                        // le bord externe des orbites
    [I(1,1),richM4(0,.04,.66,.07,.2,.12)],                                                            // la cloison du nez
    [I(1,1),richM4(0,-.38,.46,.42,.16,.32)],                                                          // le maxillaire
    [I(1,1),richM4(0,-.7,.36,.38,.12,.34)],[I(1,1),richM4(0,-.8,.6,.17,.09,.12)],                     // la mandibule, le menton
    [B(.1,.32,.2),richM4(.38,-.5,.18,1)],[B(.1,.32,.2),richM4(-.38,-.5,.18,1)]];                      // ses branches
  for(let k=0;k<8;k++){const x=-.245+k*.07,z=.74-x*x*1.1;os.push([B(.06,.1,.07),richM4(x,-.47,z,1)]);os.push([B(.06,.08,.07),richM4(x*.9,-.575,z-.06,1)]);} // les dents, en arc
  const noir=[[I(1,2),richM4(.29,.03,.5,.22,.22,.15)],[I(1,2),richM4(-.29,.03,.5,.22,.22,.15)],     // le fond des orbites
    [I(1,1),richM4(.045,-.17,.64,.06,.1,.06)],[I(1,1),richM4(-.045,-.17,.64,.06,.1,.06)],[new THREE.ConeGeometry(.07,.16,3),richM4(0,-.1,.64,1)], // le nez (un cœur renversé)
    [B(.55,.16,.06),richM4(0,-.52,.58,1)]];                                                           // l'ombre de la bouche, entre les dents
  return {or:richFusion(os),noir:richFusion(noir)};}
function richCoeurCubes(){ // (2026-10-16) LE CŒUR EN MINUSCULES CUBES : la surface de Taubin, (x² + 9/4·y² + z² − 1)³ − x²z³ − 9/80·y²z³ = 0
  // (z en haut, y l'épaisseur ×.82 : un cœur de bonbon, pas une balle), lue sous sa forme « racine cubique » — même surface :
  // H = (x² + 9/4·y² + z² − 1) − z·∛(x² + 9/80·y²), dont le gradient ne s'annule que sur l'axe (écrite telle quelle, il s'annule sur tout
  // l'équateur : une ligne en travers du cœur). Le cœur est REMPLI À LA GRILLE (13 cubes sur sa largeur) — (2026-10-16, Léo : « le cœur rempli de
  // cubes ») TOUS les cubes du dedans sont gardés, ceux de la PEAU marqués (aK.w = 1 : un voisin est dehors) ; chaque cube fait 72 % de sa case (des joints où passe le ciel). Rangés du DOS vers l'AVANT : le cœur se
  // tourne toujours vers toi (richTick), le fond se peint donc avant le devant — le transparent sans tri. aN = la normale LISSE du cœur à la
  // place du cube (le gradient), aR = (la hauteur 0 → 1, un hasard) : ce que lit RICH_FS_COEUR. 1 de large, centré.
  const E=.82,H=function(x,y,z){return x*x+2.25*y*y+z*z-1-z*Math.cbrt(x*x+.1125*y*y);};
  const ray=function(X,Y,Z){let hi=.04;while(hi<3&&H(X*hi,Y*hi,Z*hi)<0)hi+=.04;let lo=hi-.04;for(let k=0;k<24;k++){const m=(lo+hi)*.5;if(H(X*m,Y*m,Z*m)<0)lo=m;else hi=m;}return (lo+hi)*.5;};
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;                                                  // son gabarit : la forme est étoilée depuis le centre, on la tire en rayons
  for(let a=0;a<72;a++)for(let b=0;b<=36;b++){const th=b/36*Math.PI,ph=a/72*6.2832,X=Math.sin(th)*Math.cos(ph),Z=Math.cos(th),Y=Math.sin(th)*Math.sin(ph),r=ray(X,Y,Z),x=X*r,z=Z*r;
    if(x<x0)x0=x;if(x>x1)x1=x;if(z<y0)y0=z;if(z>y1)y1=z;}
  const k=1/(x1-x0),cy=(y0+y1)*.5,hh=(y1-y0)*k*.5,zz=E*k*.7,st=1/13,hc=st*.36;
  const dans=function(x,y,z){return H(x/k,z/(E*k),y/k+cy)<0;};                       // (x largeur, y hauteur, z épaisseur) du cœur
  const L=[],nx=Math.ceil(.5/st)+1,ny=Math.ceil(hh/st)+1,nz=Math.ceil(zz/st)+1;
  for(let iz=-nz;iz<nz;iz++)for(let iy=-ny;iy<ny;iy++)for(let ix=-nx;ix<nx;ix++){const x=(ix+.5)*st,y=(iy+.5)*st,z=(iz+.5)*st;if(!dans(x,y,z))continue;
    let peau=false;for(let a=-1;a<=1&&!peau;a++)for(let b=-1;b<=1&&!peau;b++)for(let c=-1;c<=1&&!peau;c++)if((a||b||c)&&!dans(x+a*st,y+b*st,z+c*st))peau=true;
    L.push([x,y,z,peau?1:0]);}
  L.sort(function(p,q){return p[2]-q[2];});                                           // du dos vers l'avant
  const FA=[[1,0,0,0,1,0,0,0,1],[-1,0,0,0,0,1,0,1,0],[0,1,0,0,0,1,1,0,0],[0,-1,0,1,0,0,0,0,1],[0,0,1,1,0,0,0,1,0],[0,0,-1,0,1,0,1,0,0]]; // n, u, v (u × v = n : les faces regardent dehors)
  const n=L.length,pos=new Float32Array(n*72),nor=new Float32Array(n*72),an=new Float32Array(n*72),ar=new Float32Array(n*48),ak=new Float32Array(n*96),idx=new Uint16Array(n*36),SG=[[-1,-1],[1,-1],[1,1],[-1,1]];
  for(let i=0;i<n;i++){const P=L[i],X=P[0]/k,Y=P[2]/(E*k),Z=P[1]/k+cy,q=X*X+.1125*Y*Y;let gx=P[0],gy=P[1],gz=P[2];
    if(q>1e-9){const k3=Z/(3*Math.pow(q,2/3));gx=2*X-k3*2*X;gz=(4.5*Y-k3*.225*Y)/E;gy=2*Z-Math.cbrt(q);} // la normale lisse (sur l'axe : la direction depuis le centre)
    const gl=Math.hypot(gx,gy,gz)||1,hs=(P[1]+hh)/(2*hh),rs=(function(){const h=Math.sin(P[0]*127.1+P[1]*311.7+P[2]*74.7)*43758.5453;return h-Math.floor(h);})();
    for(let f=0;f<6;f++){const F9=FA[f];for(let j=0;j<4;j++){const o=((i*6+f)*4+j),su=SG[j][0],sv=SG[j][1];
        for(let d=0;d<3;d++){pos[o*3+d]=P[d]+hc*(F9[d]+su*F9[3+d]+sv*F9[6+d]);nor[o*3+d]=F9[d];}
        an[o*3]=gx/gl;an[o*3+1]=gy/gl;an[o*3+2]=gz/gl;ar[o*2]=hs;ar[o*2+1]=rs;ak[o*4]=P[0];ak[o*4+1]=P[1];ak[o*4+2]=P[2];ak[o*4+3]=P[3];}
      const b9=(i*6+f)*4,t9=(i*6+f)*6;idx[t9]=b9;idx[t9+1]=b9+1;idx[t9+2]=b9+2;idx[t9+3]=b9;idx[t9+4]=b9+2;idx[t9+5]=b9+3;}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  g.setAttribute('aN',new THREE.BufferAttribute(an,3));g.setAttribute('aR',new THREE.BufferAttribute(ar,2));g.setAttribute('aK',new THREE.BufferAttribute(ak,4));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeBoundingSphere();g.userData.cubes=n;return g;}
/* (2026-10-16, Léo : « et des petites fleurs — hibiscus tropical, rose, lilas, lotus, LYS, tulipes rose pâle » ; le style choisi : « pétales
   lisses, translucides ») LES SIX FLEURS. Un pétale = une GRILLE (u : du pied à la pointe, v : d'un bord à l'autre) le long d'une NERVURE
   qui se courbe (a0 : l'élévation au pied, cu : de combien elle tourne jusqu'à la pointe — négatif : le pétale se recourbe, comme le lys) ;
   sa largeur suit une FORME (f, u → 0..1 : rond, en éventail, pointu), ses bords se relèvent (cup : le creux) et peuvent friser (ruf) ;
   couleur du pied (c0) à la pointe (c1) entre k0 et k1, le bord vers c2, l'opacité al. Les cœurs de fleur (étamines, pistil, gousse du
   lotus) sont des primitives teintées (richFlPrim). Tout est fusionné en UNE géométrie par fleur (aC = rgba par sommet), 1 de grand,
   centrée, l'axe de la fleur en +y : richTick la penche vers toi de userData.vue (une corolle se lit de face, une tulipe de profil). */
function richFlPart(P,pos,idx,col){P.push({p:pos,i:idx,c:col});}
function richPetale(P,o){
  const nu=o.nu||8,nv=o.nv||6,cph=Math.cos(o.phi||0),sph=Math.sin(o.phi||0),pos=[],col=[],idx=[],c0=o.c0,c1=o.c1||o.c0,c2=o.c2,ds=o.L/nu,v3=new THREE.Vector3();
  let sx=o.r0||0,sy=o.y0||0;
  for(let i=0;i<=nu;i++){const u=i/nu;if(i>0){const tm=o.a0+o.cu*(u-.5/nu);sx+=Math.cos(tm)*ds;sy+=Math.sin(tm)*ds;}
    const th=o.a0+o.cu*u,nX=-Math.sin(th),nY=Math.cos(th),w=o.W*o.f(u),kk=Math.min(1,Math.max(0,(u-(o.k0||0))/((o.k1||1)-(o.k0||0))));
    for(let j=0;j<=nv;j++){const v=-1+2*j/nv,h=(o.cup||0)*w*v*v+(o.ruf||0)*o.W*Math.sin(v*6.5+u*4+(o.rp||0))*u*u,lx=sx+nX*h,ly=sy+nY*h,lz=v*w;
      v3.set(lx*cph-lz*sph,ly,lx*sph+lz*cph);if(o.m)v3.applyMatrix4(o.m);pos.push(v3.x,v3.y,v3.z);
      const e=c2?Math.pow(Math.abs(v),3)*(o.ke!=null?o.ke:.35):0;for(let d=0;d<3;d++){const c=c0[d]+(c1[d]-c0[d])*kk*kk*(3-2*kk);col.push(c2?c+(c2[d]-c)*e:c);}col.push(o.al!=null?o.al:.8);}}
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;idx.push(a,b,a+1,a+1,b,b+1);}
  richFlPart(P,pos,idx,col);}
function richFlPrim(P,g,M,c,al){ // une primitive de three (sphère, cylindre, boîte), placée par la matrice M, d'une couleur
  g.applyMatrix4(M);const p=g.attributes.position,pos=Array.from(p.array),idx=g.index?Array.from(g.index.array):pos.map(function(_,i){return i;}).slice(0,p.count),col=[];
  for(let i=0;i<p.count;i++)col.push(c[0],c[1],c[2],al==null?1:al);g.dispose();richFlPart(P,pos,idx,col);}
function richFlM(x,y,z,dx,dy,dz,sx,sy,sz){ // matrice : posée en (x,y,z), son axe +y tourné vers (dx,dy,dz), mise à l'échelle
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx,dy,dz).normalize());
  return new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx||1,sy||1,sz||1));}
function richFlFin(P){ // fusion, centrage, 1 de grand
  let n=0,m=0;for(const q of P){n+=q.p.length/3;m+=q.i.length;}
  const pos=new Float32Array(n*3),col=new Float32Array(n*4),idx=n>65535?new Uint32Array(m):new Uint16Array(m);let o=0,oi=0;
  for(const q of P){const b=o/3;pos.set(q.p,o);col.set(q.c,b*4);for(let k=0;k<q.i.length;k++)idx[oi+k]=q.i[k]+b;o+=q.p.length;oi+=q.i.length;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aC',new THREE.BufferAttribute(col,4));g.setIndex(new THREE.BufferAttribute(idx,1));
  g.computeBoundingBox();const B=g.boundingBox,c=B.getCenter(new THREE.Vector3()),sz=B.getSize(new THREE.Vector3()),k=1/Math.max(sz.x,sz.y,sz.z);
  g.translate(-c.x,-c.y,-c.z);g.scale(k,k,k);g.computeVertexNormals();g.computeBoundingSphere();return g;}
const RICH_FF={ // les formes de pétale
  rond:function(u){return Math.pow(Math.sin(Math.PI*Math.pow(u,1.15)),.45);},
  eventail:function(u){return Math.pow(Math.sin(Math.PI*Math.pow(u,1.7)),.55);},
  pointu:function(u){return Math.pow(Math.sin(Math.PI*Math.pow(u,.85)),.75);},
  lance:function(u){return Math.pow(Math.sin(Math.PI*Math.pow(u,.75)),.8);},
  oeuf:function(u){return Math.pow(Math.sin(Math.PI*Math.pow(u,1.25)),.5);}};
function richFleurs(){const F=RICH_FF,V=[],S=function(r){return new THREE.SphereGeometry(r,8,6);},C=function(r0,r1,h){return new THREE.CylinderGeometry(r1,r0,h,7,1);},TAU=6.2832;
  // 1. L'HIBISCUS TROPICAL : cinq larges pétales corail en éventail, l'œil cramoisi au pied, le bord qui frise ; la longue colonne d'étamines, pollen d'or, stigmates rouges
  {const P=[];for(let i=0;i<5;i++)richPetale(P,{phi:i*TAU/5+.2,a0:.38,cu:-.3,L:.5,W:.215,f:F.eventail,cup:.22,ruf:.05,rp:i*1.7,r0:.03,c0:[.42,0,.1],c1:[1,.36,.36],c2:[1,.7,.62],k0:.04,k1:.46,ke:.5,al:.84,nu:9,nv:8});
   const d=[.38,1,.1],L9=.5;richFlPrim(P,C(.026,.018,L9),richFlM(d[0]*L9*.5/1.08,L9*.5,d[2]*L9*.5/1.08,d[0],d[1],d[2]),[1,.45,.55],1);
   const tx=.38*L9/1.08,ty=L9*.96,tz=.1*L9/1.08;for(let k=0;k<7;k++){const a=k*TAU/7;richFlPrim(P,S(.024),richFlM(tx+Math.cos(a)*.04,ty-.04+(k%2)*.025,tz+Math.sin(a)*.04,0,1,0),[1,.84,.18],1);}
   for(let k=0;k<5;k++){const a=k*TAU/5;richFlPrim(P,S(.02),richFlM(tx+.025+Math.cos(a)*.022,ty+.045,tz+Math.sin(a)*.022,0,1,0),[.85,.02,.12],1);}
   V.push(richFlFin(P));V[0].userData.vue=1.15;}
  // 2. LA ROSE : quatre couronnes de pétales ronds qui s'ouvrent de plus en plus (le cœur serré, le bord qui se roule), velours rouge ; cinq sépales verts dessous
  {const P=[],R=[[3,1.45,.25,.15,.13,.9,0,.02],[5,1.22,-.1,.21,.16,.8,.02,.015],[5,.98,-.35,.26,.19,.65,.035,.01],[6,.68,-.6,.3,.21,.5,.05,0]];
   R.forEach(function(r,ri){for(let i=0;i<r[0];i++)richPetale(P,{phi:i*TAU/r[0]+ri*.9,a0:r[1],cu:r[2],L:r[3],W:r[4],f:F.rond,cup:r[5],r0:r[6],y0:r[7],c0:[.36,0,.05],c1:[.86,.03,.13],c2:[.98,.3,.38],k0:0,k1:1,ke:.45,al:.9});});
   for(let i=0;i<5;i++)richPetale(P,{phi:i*TAU/5+.3,a0:-.85,cu:.3,L:.17,W:.045,f:F.pointu,cup:.2,r0:.03,c0:[.12,.38,.12],c1:[.25,.58,.2],al:1,nu:5,nv:2});
   V.push(richFlFin(P));V[1].userData.vue=0.9;}
  // 3. LE LILAS : une grappe en cône de petites fleurs à quatre pétales (lilas, du mauve profond au presque blanc), sur sa tige
  {const P=[];const N=62;for(let i=0;i<N;i++){const t=(i+.5)/N,y=t*.62,R9=.23*(1-t*.82)+.04,a=i*2.39996,cx=Math.cos(a)*R9,cz=Math.sin(a)*R9,h=Math.sin(i*12.9898)*43758.5453,rr=h-Math.floor(h);
     const M=richFlM(cx,y,cz,cx,.55,cz),c0=rr<.2?[.86,.74,1]:rr<.6?[.62,.4,.9]:[.72,.52,.96],c1=[Math.min(1,c0[0]+.18),Math.min(1,c0[1]+.2),1];
     for(let j=0;j<4;j++)richPetale(P,{phi:j*TAU/4+a,a0:.28,cu:-.35,L:.058,W:.042,f:F.rond,cup:.3,c0:c0,c1:c1,al:.86,nu:3,nv:2,m:M});}
   richFlPrim(P,C(.012,.008,.8),richFlM(0,.24,0,0,1,0),[.3,.55,.25],1);
   for(let k=0;k<4;k++){const a=k*TAU/4+.4;richFlPrim(P,S(.018),richFlM(Math.cos(a)*.025,.66+(k%2)*.03,Math.sin(a)*.025,0,1,0),[.78,.62,.98],1);} // les boutons du sommet
   V.push(richFlFin(P));V[2].userData.vue=0.35;}
  // 4. LE LOTUS : trois couronnes de pétales pointus en coupe, blancs au pied, roses à la pointe ; la gousse jaune et sa couronne d'étamines
  {const P=[],R=[[7,.35,.25,.36,.15,.45,.05],[8,.8,.3,.34,.14,.5,.04],[8,1.18,.2,.28,.12,.6,.03]];
   R.forEach(function(r,ri){for(let i=0;i<r[0];i++)richPetale(P,{phi:i*TAU/r[0]+ri*.4,a0:r[1],cu:r[2],L:r[3],W:r[4],f:F.pointu,cup:r[5],r0:r[6],c0:[1,.96,.97],c1:[1,.4,.66],c2:[1,.78,.9],k0:.3,k1:1,al:.78});});
   richFlPrim(P,C(.07,.078,.06),richFlM(0,.05,0,0,1,0),[.86,.84,.32],1);
   for(let k=0;k<7;k++){const a=k*TAU/7;richFlPrim(P,S(.011),richFlM(Math.cos(a)*.04,.082,Math.sin(a)*.04,0,1,0),[.95,.72,.18],1);}
   for(let k=0;k<18;k++){const a=k*TAU/18;richFlPrim(P,new THREE.BoxGeometry(.008,.07,.008),richFlM(Math.cos(a)*.09,.06,Math.sin(a)*.09,Math.cos(a)*.6,1,Math.sin(a)*.6),[1,.86,.3],1);}
   V.push(richFlFin(P));V[3].userData.vue=0.8;}
  // 5. LE LYS : six longs tépales blancs qui se recourbent en arrière, une rougeur rose au fond de la gorge ; six étamines aux anthères orange, le pistil
  {const P=[];for(let i=0;i<6;i++)richPetale(P,{phi:i*TAU/6,a0:.92,cu:-1.7,L:.46,W:i%2?.12:.145,f:F.lance,cup:.28,r0:.02,c0:[1,.42,.68],c1:[1,1,1],c2:[1,.97,.98],k0:0,k1:.52,al:.9,nu:10,nv:6});
   for(let k=0;k<6;k++){const a=k*TAU/6+.5,dx=Math.cos(a)*.38,dz=Math.sin(a)*.38,L9=.3;richFlPrim(P,C(.006,.005,L9),richFlM(dx*L9*.5,L9*.46,dz*L9*.5,dx,.92,dz),[.78,.9,.62],1);
     richFlPrim(P,new THREE.BoxGeometry(.065,.022,.026),richFlM(dx*L9,L9*.93,dz*L9,dz,0,-dx),[.86,.38,.1],1);}
   richFlPrim(P,C(.009,.007,.34),richFlM(0,.17,0,0,1,0),[.7,.86,.55],1);richFlPrim(P,S(.02),richFlM(0,.345,0,0,1,0),[.6,.8,.4],1);
   V.push(richFlFin(P));V[4].userData.vue=0.95;}
  // 6. LA TULIPE ROSE PÂLE : six pétales en coupe fermée (trois dehors, trois dedans), les bords plus blancs ; sa tige et une feuille
  {const P=[];for(let i=0;i<3;i++)richPetale(P,{phi:i*TAU/3,a0:1.45,cu:.5,L:.42,W:.22,f:F.oeuf,cup:.62,r0:.06,c0:[.98,.76,.82],c1:[1,.86,.91],c2:[1,.97,.98],ke:.5,al:.8});
   for(let i=0;i<3;i++)richPetale(P,{phi:i*TAU/3+TAU/6,a0:1.5,cu:.48,L:.4,W:.2,f:F.oeuf,cup:.65,r0:.035,c0:[.96,.72,.8],c1:[1,.84,.9],c2:[1,.96,.97],ke:.5,al:.8});
   richFlPrim(P,C(.018,.015,.36),richFlM(0,-.17,0,0,1,0),[.3,.6,.26],1);
   richPetale(P,{phi:.5,a0:1.15,cu:-.25,L:.3,W:.06,f:F.lance,cup:.4,r0:.02,y0:-.34,c0:[.22,.5,.2],c1:[.38,.7,.3],al:1,nu:7,nv:3});
   V.push(richFlFin(P));V[5].userData.vue=0.3;}
  // 7. LA MARGUERITE (2026-10-16) : une vingtaine de pétales blancs en lanière, presque à plat, sur deux rangs ; le cœur jaune bombé
  {const P=[],lan=function(u){return Math.min(1,u*7)*(u>.8?Math.sqrt(Math.max(0,1-Math.pow((u-.8)/.2,2))):1);};
   for(let i=0;i<22;i++)richPetale(P,{phi:i*TAU/22+(i%2)*.07,a0:.14+(i%2)*.12,cu:-.16,L:.42,W:.05,f:lan,cup:.18,r0:.075,c0:[.98,.96,.88],c1:[1,1,1],al:.9,nu:6,nv:2});
   richFlPrim(P,new THREE.SphereGeometry(.095,14,8),richFlM(0,.015,0,0,1,0,1,.5,1),[1,.76,.1],1);
   for(let k=0;k<12;k++){const a=k*2.39996,r9=.02+.05*Math.sqrt((k+.5)/12);richFlPrim(P,S(.012),richFlM(Math.cos(a)*r9,.055-r9*.35,Math.sin(a)*r9,0,1,0),[.92,.55,.05],1);}
   V.push(richFlFin(P));V[6].userData.vue=1.1;}
  return V;}
function richTexMontre(){return richCv(512,512,function(x){ // l'atlas de la MONTRE : le cadran (en haut à gauche), l'or (en haut à droite), le bracelet à maillons (en bas)
  x.fillStyle='#e8b33a';x.fillRect(0,0,512,512);const Go=x.createLinearGradient(256,0,512,256);Go.addColorStop(0,'#ffe9a8');Go.addColorStop(1,'#c58b22');x.fillStyle=Go;x.fillRect(256,0,256,256);
  const c=128;x.fillStyle='#d9a63a';x.beginPath();x.arc(c,c,127,0,6.2832);x.fill();                                   // la lunette
  for(let i=0;i<60;i++){const a=i/60*6.2832;x.strokeStyle=i%2?'rgba(120,80,15,.5)':'rgba(255,240,190,.6)';x.lineWidth=3;x.beginPath();x.moveTo(c+Math.cos(a)*112,c+Math.sin(a)*112);x.lineTo(c+Math.cos(a)*127,c+Math.sin(a)*127);x.stroke();} // cannelée
  const D=x.createRadialGradient(c-20,c-26,8,c,c,110);D.addColorStop(0,'#2c5bb8');D.addColorStop(.7,'#0f2a66');D.addColorStop(1,'#081a44');x.fillStyle=D;x.beginPath();x.arc(c,c,110,0,6.2832);x.fill(); // le cadran BLEU soleillé
  x.strokeStyle='rgba(255,255,255,.06)';x.lineWidth=1;for(let i=0;i<90;i++){const a=i/90*6.2832;x.beginPath();x.moveTo(c,c);x.lineTo(c+Math.cos(a)*110,c+Math.sin(a)*110);x.stroke();}
  for(let h=0;h<12;h++){const a=h/12*6.2832-Math.PI/2;x.save();x.translate(c+Math.cos(a)*88,c+Math.sin(a)*88);x.rotate(a+Math.PI/2);x.fillStyle='#ffdf8a'; // les index d'or
    if(h===0){x.beginPath();x.moveTo(-10,-10);x.lineTo(10,-10);x.lineTo(0,8);x.fill();}else if(h===3){}else x.fillRect(-4,-11,8,22);x.restore();}
  x.fillStyle='#f4f0e6';x.fillRect(c+66,c-9,24,18);x.font='12px "Press Start 2P",monospace';x.fillStyle='#111';x.textAlign='center';x.textBaseline='middle';x.fillText('8',c+78,c+1); // le guichet de la date
  x.font='8px "Press Start 2P",monospace';x.fillStyle='#ffe9b0';x.fillText('CASH CAR',c,c-42);x.font='6px "Press Start 2P",monospace';x.fillText('AUTOMATIC',c,c+44);
  const aig=function(a,l,w){x.save();x.translate(c,c);x.rotate(a);x.fillStyle='#ffe28f';x.beginPath();x.moveTo(-w,6);x.lineTo(0,-l);x.lineTo(w,6);x.fill();x.restore();};
  aig(-Math.PI/3,54,6);aig(Math.PI/3,82,4.5); // 10 h 10 (0 = midi, dans le sens des aiguilles)
  x.fillStyle='#ffe28f';x.beginPath();x.arc(c,c,7,0,6.2832);x.fill();
  const B=x.createLinearGradient(0,400,0,502);B.addColorStop(0,'#c48c26');B.addColorStop(.5,'#ffe7a0');B.addColorStop(1,'#b47c1e');x.fillStyle=B;x.fillRect(0,399,512,104); // le bracelet
  x.fillStyle='rgba(90,55,8,.75)';for(let i=0;i<34;i++)x.fillRect(i*512/34,399,3,104);x.fillRect(0,432,512,3);x.fillRect(0,468,512,3); // les maillons : trois rangs (le maillon central bombé)
});}
function richFusionUV(L){ // comme richFusion, mais chaque primitive garde ses uv, recalées par sa fonction (l'atlas)
  let n=0;const parts=[];for(const e of L){const gg=e[0].index?e[0].toNonIndexed():e[0].clone();gg.applyMatrix4(e[1]);const uv=gg.attributes.uv;if(e[2])for(let i=0;i<uv.count;i++){const r=e[2](uv.getX(i),uv.getY(i),i,gg);uv.setXY(i,r[0],r[1]);}
    parts.push(gg);n+=gg.attributes.position.count;e[0].dispose();}
  const pos=new Float32Array(n*3),uvs=new Float32Array(n*2);let o=0,u=0;for(const gg of parts){pos.set(gg.attributes.position.array,o);o+=gg.attributes.position.array.length;uvs.set(gg.attributes.uv.array,u);u+=gg.attributes.uv.array.length;gg.dispose();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uvs,2));g.computeVertexNormals();return g;}
function richMontreGeo(){ // la MONTRE fermée : le boîtier (cadran sur le dessus, couronne à 3 h, cornes), la lunette, le bracelet qui fait le tour sous le boîtier
  const OR=function(){return [.875,.875];},M=function(x,y,z,rx,ry,rz){return new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)).setPosition(x,y,z);};
  const boite=new THREE.CylinderGeometry(1,1,.42,32,1),gr=boite.groups,cap=new Uint8Array(boite.attributes.uv.count);
  for(const G9 of gr)for(let k=G9.start;k<G9.start+G9.count;k++)cap[boite.index.getX(k)]=G9.materialIndex; // (avant de perdre l'index : qui est le DESSUS)
  const ni=boite.toNonIndexed(),capN=new Uint8Array(ni.attributes.uv.count);{const ix=boite.index;for(let k=0;k<ix.count;k++)capN[k]=cap[ix.getX(k)];}boite.dispose();
  const R=1.828,c=-1.47,a0=129*Math.PI/180,arc=(360-78)*Math.PI/180;
  const bande=new THREE.TorusGeometry(R,.1,6,40,arc);bande.rotateZ(a0);bande.rotateY(-Math.PI/2);bande.scale(5.5,1,1);bande.translate(0,c,0);
  const L=[[ni,new THREE.Matrix4(),function(u,v,i){return capN[i]===1?[u*.5,.5+v*.5]:OR();}],
    [new THREE.TorusGeometry(1,.12,6,32),M(0,.2,0,Math.PI/2),OR],                                      // la lunette
    [new THREE.CylinderGeometry(.16,.16,.22,10),M(1.08,0,0,0,0,Math.PI/2),OR],                        // la couronne
    [bande,new THREE.Matrix4(),function(u,v){return [u,.02+v*.2];}]];                                // le bracelet : les maillons courent le long
  for(const sx of [-.5,.5])for(const sz of [-1.02,1.02])L.push([new THREE.BoxGeometry(.24,.28,.36),M(sx,-.04,sz),OR]); // les cornes
  return richFusionUV(L);}
function richTexJeton(col,val){return richCv(512,288,function(x){ // un JETON : ses deux faces (0-256) et sa tranche (260-288)
  x.fillStyle=col;x.fillRect(0,0,512,288);
  for(const cx of [128,384]){x.fillStyle=col;x.beginPath();x.arc(cx,128,127,0,6.2832);x.fill();
    x.fillStyle='#f4f1ea';for(let k=0;k<8;k++){x.save();x.translate(cx,128);x.rotate(k/8*6.2832);x.fillRect(-13,-127,26,26);x.restore();} // les plots blancs du bord
    x.fillStyle='rgba(255,255,255,.14)';x.beginPath();x.arc(cx,128,84,0,6.2832);x.fill();
    x.strokeStyle='#f4f1ea';x.lineWidth=4;x.setLineDash([10,8]);x.beginPath();x.arc(cx,128,80,0,6.2832);x.stroke();x.setLineDash([]);
    x.fillStyle='#fff';x.font=(val.length>3?22:28)+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(val,cx,120);
    x.font='8px "Press Start 2P",monospace';x.fillStyle='rgba(255,255,255,.85)';x.fillText('CASH CAR',cx,160);}
  x.fillStyle='#f4f1ea';for(let k=0;k<8;k++)x.fillRect(k*64+25,260,14,28);});} // la tranche : les mêmes plots
function richJetonGeo(){const g=new THREE.CylinderGeometry(1,1,.17,32,1),uv=g.attributes.uv; // Ø 39 mm × 3,3 mm
  for(const G9 of g.groups)for(let k=G9.start;k<G9.start+G9.count;k++){const i=g.index.getX(k),u=uv.getX(i),v=uv.getY(i);
    if(G9.materialIndex===0)uv.setXY(i,u,v*.097);else if(G9.materialIndex===1)uv.setXY(i,u*.5,.111+v*.889);else uv.setXY(i,.5+u*.5,.111+v*.889);}
  g.clearGroups();return g;}
function richInit(){
  if(RICH.pret)return;RICH.pret=true;
  const M={},Gm={};
  const metal=function(tex,shin){return richMat(RICH_FS_METAL,{uMap:{value:tex},uShin:{value:shin||90}});};
  const piece=function(T,shin){const m9=richMat(RICH_FS_METAL,{uMap:{value:T[0]},uBump:{value:T[1]},uBumpK:{value:RICH_BOSSE},uShin:{value:shin}},{PIECE:1});m9.extensions.derivatives=true;return m9;}; // (2026-10-10) les pièces : le métal + le relief frappé (un 4e programme, compilé lui aussi sous l'écran titre)
  M.piece2=piece(richTexPiece('2'),120);M.piece1=piece(richTexPiece('1'),120);M.piece50=piece(richTexPiece('50'),120);M.btc=piece(richTexBtc(),110);
  M.or=metal(richTexUni('#ffb52e'),140);M.lingot=metal(richTexUni('#ffbd3d'),170); // l'or : un jaune profond (F0 de l'or ≈ 1 · .71 · .29), c'est le reflet qui l'éclaire
  M.diamant=richMat(RICH_FS_GEMME,{uTint:{value:new THREE.Color(1,1,1)}});
  RICH.texBillets=RICH_BILLETS.map(richTexBillet);RICH.texBillet=RICH.texBillets[RICH_B100]; // (2026-10-10) la série des sept valeurs ; le 100 (sarcelle) habille aussi la liasse
  M.billets=RICH_BILLETS.map(function(B,i){return richMat(RICH_FS_SOUPLE,{uMap:{value:RICH.texBillets[i]},uSheen:{value:new THREE.Color(B.sh[0],B.sh[1],B.sh[2])},uSheenK:{value:.5},uBend:{value:.75}},{SOUPLE:1},THREE.DoubleSide);}); // (même programme : 0 compilé de plus)
  M.billet=M.billets[RICH_B100];
  M.trefle=richMat(RICH_FS_SOUPLE,{uMap:{value:richTexTrefle()},uSheen:{value:new THREE.Color(.55,1,.5)},uSheenK:{value:.35},uBend:{value:.7}},{SOUPLE:1},THREE.DoubleSide);
  M.rubis=richMat(RICH_FS_GEMME,{uTint:{value:new THREE.Color(1,.06,.16)}});M.emeraude=richMat(RICH_FS_GEMME,{uTint:{value:new THREE.Color(.08,.9,.38)}}); // les gemmes de couleur : le programme du diamant, teinté
  M.montre=metal(richTexMontre(),150);
  M.cranes=[['#ffcbe0',[1,.85,.92]],['#c4f5e1',[.85,1,.93]],['#ddd2ff',[.9,.87,1]],['#c9e6ff',[.86,.93,1]],['#ffdac6',[1,.9,.84]],['#fff4c4',[1,1,.86]]].map(function(P){const m9=metal(richTexUni(P[0]),130);m9.userData.gc=P[1];return m9;}); // les CRÂNES PASTEL : rose, menthe, lavande, ciel, pêche, citron — une laque nacrée (le métal du studio, teinté)
  M.jetons=[['#c61b2c','5'],['#1d8f3a','25'],['#18181d','100'],['#6a2a9a','500'],['#e09a12','1000']].map(function(J){return richMat(RICH_FS_SOUPLE,{uMap:{value:richTexJeton(J[0],J[1])},uSheen:{value:new THREE.Color(1,1,1)},uSheenK:{value:.28},uBend:{value:0}},{SOUPLE:1},THREE.DoubleSide);}); // la terre cuite des jetons : mate, un peu de lustre
  M.carte=metal(richTexCarte(),130);M.champagne=metal(richTexChampagne(),90);M.vins=[M.champagne].concat(RICH_VINS.map(function(V9){return metal(richTexVin(V9),V9.shin||100);})); // (2026-10-16) les vins : le programme du métal, comme le champagne (0 compilé de plus)M.noir=metal(richTexUni('#16121c'),60);
  M.liasse=richMat(RICH_FS_SOUPLE,{uMap:{value:richTexLiasse()},uSheen:{value:new THREE.Color(.49,1,.62)},uSheenK:{value:.2},uBend:{value:0}},{SOUPLE:1},THREE.DoubleSide); // la liasse ne plie pas
  Gm.piece=richPiece();Gm.billet=new THREE.PlaneGeometry(1,.46,10,3);Gm.trefle=new THREE.PlaneGeometry(1,1,6,6);
  M.coeur=new THREE.ShaderMaterial({uniforms:Object.assign({},RICH_U,{uRouge:{value:new THREE.Color(.86,.015,.08)},uFuch:{value:new THREE.Color(1,.16,.6)},uBlanc:{value:1},uA:{value:.2},uPop:{value:0}}),vertexShader:RICH_VS_COEUR,fragmentShader:RICH_FS_COEUR,
    transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,fog:false,lights:false}); // (2026-10-16) le cœur fantôme (voir RICH_FS_COEUR) : transparent, prémultiplié
  M.fleur=new THREE.ShaderMaterial({uniforms:RICH_U,vertexShader:RICH_VS_FLEUR,fragmentShader:RICH_FS_FLEUR,transparent:true,depthWrite:true,side:THREE.DoubleSide,
    blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,fog:false,lights:false}); // (2026-10-16) les pétales (voir RICH_FS_FLEUR)
  M.aura=new THREE.SpriteMaterial({map:richCv(64,64,function(x){const G=x.createRadialGradient(32,32,0,32,32,32);G.addColorStop(0,'rgba(255,215,228,.46)');G.addColorStop(.42,'rgba(255,170,200,.2)');G.addColorStop(1,'rgba(255,140,180,0)');x.fillStyle=G;x.fillRect(0,0,64,64);}),
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}); // l'aura des cœurs : un halo blanc rosé additif (2026-10-16 : rouge ET blanc) (le programme des éclats : 0 compilé de plus)
  Gm.carte=richCarteGeo();Gm.liasse=richLiasseGeo();Gm.champagne=richChampagneGeo();Gm.vins=[Gm.champagne].concat(RICH_VINS.map(function(V9){return richVinGeo(V9.p);}));Gm.emeraude=richEmeraude();Gm.crane=richCraneGeo();Gm.montre=richMontreGeo();Gm.jeton=richJetonGeo();Gm.coeur=richCoeurCubes();Gm.fleurs=richFleurs();
  Gm.or=[richPepite(1),richPepite(2),richPepite(3)];Gm.lingot=richLingot();Gm.diamant=richDiamant();
  RICH.M=M;RICH.G=Gm;
  for(const k9 in M)for(const m9 of [].concat(M[k9]))if(m9&&m9.uniforms)for(const u9 in m9.uniforms){const v9=m9.uniforms[u9].value;if(v9&&v9.isCanvasTexture)texLibere(v9);} // (2026-10-14, passe perf mobile) les ~30 toiles de la pluie de richesse (pièces, billets, jetons, carte, montre, liasse : ~14 Mo), peintes UNE fois ici et plus jamais relues (la liasse a déjà recopié son billet) : rendues après l'envoi (paliers 0-1)
  for(const t in RICH_CAP){RICH.libres[t]=[];for(let i=0;i<RICH_CAP[t];i++){let m;
      if(t==='fruit'){const fg=fruitGeo(i%FRUIT_DEFS.length);m=new THREE.Mesh(fg,FRUIT_MAT);} // les fruits de la piste, leur matière (déjà compilée)
      else if(t==='crane'){m=new THREE.Group();m.add(new THREE.Mesh(Gm.crane.or,M.cranes[i%M.cranes.length]),new THREE.Mesh(Gm.crane.noir,M.noir)); // le crâne : les os (pastel), les creux (sombres)
        m.traverse(function(c){c.frustumCulled=false;c.castShadow=c.receiveShadow=false;});}
      else if(t==='jeton')m=new THREE.Mesh(Gm.jeton,M.jetons[i%M.jetons.length]);
      else if(t==='coeur'){m=new THREE.Mesh(Gm.coeur,new THREE.ShaderMaterial({uniforms:Object.assign({},M.coeur.uniforms,{uPop:{value:0}}),vertexShader:RICH_VS_COEUR,fragmentShader:RICH_FS_COEUR, // (2026-10-16) chaque cœur sa matière (son pop à lui) : les mêmes réglages, le même programme
        transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,fog:false,lights:false}));}
      else if(t==='fleur'){m=new THREE.Mesh(Gm.fleurs[i%Gm.fleurs.length],M.fleur);const a9=new THREE.Sprite(M.aura);a9.scale.setScalar(1.6);a9.renderOrder=4;m.add(a9);m.renderOrder=5;} // (2026-10-16) la fleur et son aura
      else{const g=t==='or'?Gm.or[i%3]:t.indexOf('piece')===0||t==='btc'?Gm.piece:t==='rubis'?Gm.diamant:Gm[t];m=new THREE.Mesh(g,M[t]);}
      if(t==='coeur'){const a9=new THREE.Sprite(M.aura);a9.scale.setScalar(2.2);a9.renderOrder=4;m.add(a9);m.renderOrder=5;} // (2026-10-15) son AURA, derrière lui : elle grandit et bat avec lui (le cœur, transparent, se peint APRÈS elle)
      m.visible=false;m.castShadow=m.receiveShadow=false;m.frustumCulled=false;scene.add(m);
      RICH.libres[t].push({m:m,t:t,v:new THREE.Vector3(),w:new THREE.Vector3(),age:0,vie:1,s:1,ph:0,fd:0,nl:null,gl:null,on:false,
        pa:new THREE.Vector3(),pw:0,fv:.4,ec:0,mode:0,ax:new THREE.Vector3(),gd:new THREE.Vector3(),om:0,A:0,G:0,yr:0,kb:0});}} // (2026-10-10) pa/pw : la précession de la pièce · fv : son fondu de sortie · ec : l'heure où la liasse craque · mode… : le papier qui tombe (richPapier)
  // LES CHAÎNES D'OR : 9 nœuds, 8 maillons (des tores étirés, un sur deux tourné d'un quart), la physique d'une vraie chaîne (richChaine)
  const tg=new THREE.TorusGeometry(1,.36,6,14);tg.scale(1.4,1,1);RICH.ch=[];
  for(let c=0;c<3;c++){const K=9,L=[];for(let j=0;j<K-1;j++){const m=new THREE.Mesh(tg,M.or);m.visible=false;m.frustumCulled=false;m.castShadow=m.receiveShadow=false;scene.add(m);L.push(m);}
    RICH.ch.push({K:K,links:L,P:new Float32Array(K*3),Pp:new Float32Array(K*3),V:new Float32Array(K*3),kd:new Float32Array(K),on:false,age:0,vie:1,L:.15,gl:null});}
  // les éclats (bling) et la flamme : des sprites (programme déjà là), chacun sa matière (son opacité, sa teinte, sa rotation)
  const st=richTexEtoile(),ft=richTexFlamme();RICH.texEt=st;
  for(let i=0;i<36;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:st,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));s.visible=false;s.renderOrder=6;scene.add(s);RICH.gl.push({s:s,o:null});}
  for(let i=0;i<18;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:ft,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));s.visible=false;s.renderOrder=5;scene.add(s);
    RICH.fl.push({s:s,p:new THREE.Vector3(),v:new THREE.Vector3(),age:9,vie:1,r0:.2,r1:1,c:new THREE.Color()});}
  // LES ÉTINCELLES v2 : un maillage de traits (le programme des filets de vent)
  const N=200,g=new THREE.BufferGeometry(),pos=new Float32Array(N*12),col=new Float32Array(N*12),idx=[];
  for(let i=0;i<N;i++){const a=i*4;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);
  const sm=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  sm.frustumCulled=false;sm.renderOrder=7;sm.visible=false;scene.add(sm);
  RICH.sp={m:sm,pos:pos,col:col,n:N,P:new Float32Array(N*3),V:new Float32Array(N*3),L:new Float32Array(N),L0:new Float32Array(N),Hh:new Float32Array(N),Wd:new Float32Array(N),K:new Uint8Array(N),i:0,vivant:0};
  RICH.chauffe=3; // trois images : un exemplaire de chaque, minuscule, devant la caméra — les programmes se compilent sous l'écran titre
}
function richChauffeTick(C){
  if(!RICH.chauffe)return;RICH.chauffe--;const on=RICH.chauffe>0;
  for(const t in RICH.libres){const o=RICH.libres[t][0];if(o.on)continue;o.m.visible=on;if(on){o.m.position.copy(C);o.m.scale.setScalar(1e-4);}}
  if(RICH.ch){const c=RICH.ch[0];if(!c.on)for(const m of c.links){m.visible=on;if(on){m.position.copy(C);m.scale.setScalar(1e-4);}}}
  if(RICH.sp){RICH.sp.m.visible=on||RICH.sp.vivant>0;}
}

