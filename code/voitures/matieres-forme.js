/* ================= L'ATELIER DE MATIÈRES (2026-08-03, d'après références réelles) =================
   ⚠ LA FONTE ROUILLÉE NE CONVIENT QU'À L'ÉPAVE. Elle a été validée sur le palier 1, puis appliquée
   aux 30 — résultat : trente moteurs en terre cuite. Sur les photos de vrais moteurs, ce qu'on voit
   c'est de l'ALUMINIUM DE FONDERIE clair, de l'INOX POLI qui réfléchit tout (les collecteurs
   tubulaires), et de la FIBRE DE CARBONE. La rouille est donc réservée au TOUT PREMIER palier ;
   au-delà, la matière devient propre, métallique et BRILLANTE.
   Quatre familles, toutes peintes par le code, toutes calculées UNE fois et partagées :
     fonte    — l'épave : rouille, cloques, coulures
     alu      — fonderie alu : grain fin, micro-piqûres, presque neutre pour se laisser teinter
     carbone  — sergé 2/2 tissé par le code, avec le reflet qui court le long des mèches
     inox     — pas de texture : c'est l'envMap + une brillance énorme qui FONT le chrome.
   ⚠ La teinte du palier reste portée par `material.color`, qui MULTIPLIE la carte : on garde
   l'identité couleur de `E.col` sans régénérer un pixel. */
const MAT9=(function(){
  const S=192;
  const rnd32=a=>function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const bruit=s=>{const G=256,r=rnd32(s),tab=new Float32Array(G*G);
    for(let i=0;i<G*G;i++)tab[i]=r();
    const sm=t=>t*t*(3-2*t);
    return function(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
      const a=tab[((yi&255)*G)+(xi&255)],b=tab[((yi&255)*G)+((xi+1)&255)];
      const c=tab[(((yi+1)&255)*G)+(xi&255)],d=tab[(((yi+1)&255)*G)+((xi+1)&255)];
      const u=sm(xf),v=sm(yf);return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;};};
  const fbm=(n,x,y,o,p)=>{let s=0,a=1,f=1,q=0;for(let i=0;i<o;i++){s+=n(x*f,y*f)*a;q+=a;a*=p;f*=2;}return s/q;};
  const cl=v=>v<0?0:v>1?1:v;
  const trio=fn=>{ // fabrique les 3 cartes (couleur / relief / spéculaire) d'une seule passe
    const cs=[0,1,2].map(()=>{const c=document.createElement('canvas');c.width=c.height=S;return c;});
    const ims=cs.map(c=>c.getContext('2d').createImageData(S,S));
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){
      const o=fn(x/S,y/S),j=(y*S+x)*4;
      ims[0].data[j]=cl(o[0])*255;ims[0].data[j+1]=cl(o[1])*255;ims[0].data[j+2]=cl(o[2])*255;ims[0].data[j+3]=255;
      ims[1].data[j]=ims[1].data[j+1]=ims[1].data[j+2]=cl(o[3])*255;ims[1].data[j+3]=255;
      ims[2].data[j]=ims[2].data[j+1]=ims[2].data[j+2]=cl(o[4])*255;ims[2].data[j+3]=255;
    }
    cs.forEach((c,i)=>c.getContext('2d').putImageData(ims[i],0,0));
    const mk=c=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;};
    return {map:mk(cs[0]),bump:mk(cs[1]),spec:mk(cs[2])};
  };
  // ---- ALUMINIUM DE FONDERIE : la matière de 90 % d'un vrai moteur ----
  // Presque neutre en couleur (elle doit se laisser teinter), mais VIVANTE en spéculaire : c'est le
  // grain de moulage et les micro-piqûres qui accrochent la lumière et empêchent l'effet plastique.
  const nA=bruit(31),nA2=bruit(97);
  const alu=trio((u,v)=>{
    const g=fbm(nA,u*9,v*9,3,.5), fin=fbm(nA2,u*38,v*38,2,.5);
    const base=.74+(g-.5)*.10+(fin-.5)*.07;
    const piq=Math.pow(fbm(nA2,u*26,v*26,2,.5),6);          // rares piqûres de fonderie
    return [base*1.00,base*1.01,base*1.04,                   // très léger bleuté : l'alu n'est pas gris neutre
            cl(.5+(g-.5)*.22+(fin-.5)*.30-piq*.5),
            cl(.62+(fin-.5)*.5-piq*.45)];                    // spéculaire haut : ça DOIT briller
  });
  // ---- FIBRE DE CARBONE : sergé 2/2 tissé par le code ----
  // Le motif seul ne suffit pas : ce qui fait lire le carbone, c'est que le reflet COURT le long des
  // mèches — donc le spéculaire suit l'orientation du fil, pas la couleur.
  const carbone=trio((u,v)=>{
    const N=10, fx=u*N, fy=v*N;
    const ix=Math.floor(fx), iy=Math.floor(fy);
    const sens=((ix+iy)%4<2)?0:1;                            // le pas du sergé 2/2
    const t=sens?(fx-ix):(fy-iy);
    const arr=Math.abs(t-.5)*2;                              // bombé du fil
    const lum=.13+(1-arr)*(1-arr)*.30;
    return [lum*.92,lum*.96,lum*1.06,
            cl(.5+(1-arr)*.28),
            cl((1-arr)*(1-arr)*.95)];                        // le fil brille en son milieu
  });
  // ---- FONTE ROUILLÉE : réservée à l'épave ----
  const fonte=(function(){
  const S=192,seed=7;
  const rnd32=a=>function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const bruit=s=>{const G=256,r=rnd32(s),tab=new Float32Array(G*G);
    for(let i=0;i<G*G;i++)tab[i]=r();
    const sm=t=>t*t*(3-2*t);
    return function(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
      const a=tab[((yi&255)*G)+(xi&255)],b=tab[((yi&255)*G)+((xi+1)&255)];
      const c=tab[(((yi+1)&255)*G)+(xi&255)],d=tab[(((yi+1)&255)*G)+((xi+1)&255)];
      const u=sm(xf),v=sm(yf);return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;};};
  const fbm=(n,x,y,o,p)=>{let s=0,a=1,f=1,q=0;for(let i=0;i<o;i++){s+=n(x*f,y*f)*a;q+=a;a*=p;f*=2;}return s/q;};
  const cl=v=>v<0?0:v>1?1:v, mx=(A,B,t)=>[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t];
  const nR=bruit(seed),nG=bruit(seed+977),nC=bruit(seed+4231);
  const cvC=document.createElement('canvas'),cvB=document.createElement('canvas'),cvS=document.createElement('canvas');
  cvC.width=cvC.height=cvB.width=cvB.height=cvS.width=cvS.height=S;
  const iC=cvC.getContext('2d').createImageData(S,S),iB=cvB.getContext('2d').createImageData(S,S),
        iS=cvS.getContext('2d').createImageData(S,S);
  // teintes NEUTRES : la carte doit rester quasi grise pour que `material.color` la teinte proprement
  const FER=[150,148,152],ROU=[152,96,58],ROUC=[204,140,84],NU=[212,214,220];
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const u=x/S*5.5,v=y/S*5.5;
    let r=fbm(nR,u,v,5,.55);
    const coul=fbm(nC,u*3.5,v*.35,3,.5);
    r=Math.max(r,(r>.47?1:0)*coul*.92);                 // la rouille PLEURE depuis une plaque installée
    const t=cl((r-.52)*3.2), g=fbm(nG,u*7,v*7,2,.52);
    let col=mx(FER,ROU,cl(t*1.6));col=mx(col,ROUC,cl((t-.55)*2.2)*.85);
    if(t<.12)col=mx(col,NU,cl((.12-t)*7)*.5*cl(g*1.4));
    const gg=(g-.5)*.30*46*(1-cl(t)*.55);               // le grain ne mord pas la rouille : elle est MATE
    const j=(y*S+x)*4;
    iC.data[j]=cl((col[0]+gg)/255)*255;iC.data[j+1]=cl((col[1]+gg)/255)*255;
    iC.data[j+2]=cl((col[2]+gg)/255)*255;iC.data[j+3]=255;
    const piq=Math.pow(fbm(nG,u*13,v*13,2,.5),5);
    const h=cl(.5+t*.26+(g-.5)*.13-piq*.30);
    iB.data[j]=iB.data[j+1]=iB.data[j+2]=h*255;iB.data[j+3]=255;
    const sp=cl((1-t)*(.55+g*.5)-piq*.3);
    iS.data[j]=iS.data[j+1]=iS.data[j+2]=sp*255;iS.data[j+3]=255;
  }
  cvC.getContext('2d').putImageData(iC,0,0);cvB.getContext('2d').putImageData(iB,0,0);
  cvS.getContext('2d').putImageData(iS,0,0);
  const mk=c=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;};
  return {map:mk(cvC),bump:mk(cvB),spec:mk(cvS)};
  })();
  return {fonte:fonte,alu:alu,carbone:carbone};
})();
// ---- LE COLLECTEUR CHAUFFÉ : sur une photo de vrai moteur, l'inox BLEUIT près de la culasse,
// vire paille, puis redevient poli. C'est ce dégradé qui vend la pièce — pas sa forme.
const T_CHAUD9=(function(){const c=document.createElement('canvas');c.width=128;c.height=8;
  const x=c.getContext('2d'),g=x.createLinearGradient(0,0,128,0);
  g.addColorStop(0,'#5f74b4');g.addColorStop(.12,'#8878ac');g.addColorStop(.30,'#c9a870');
  g.addColorStop(.50,'#dccfb2');g.addColorStop(.74,'#b6c0cc');g.addColorStop(1,'#e2e9f0');
  x.fillStyle=g;x.fillRect(0,0,128,8);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
// ---- LES SAIGNÉES USINÉES : à partir des moteurs de course, le couvre-culasse porte des
// rainures qui S'ALLUMENT à la couleur du palier. Une saignée d'usinage suit la LONGUEUR de la
// pièce : rainures parallèles, largeurs tirées, coupées de loin en loin par une traverse. C'est
// la régularité qui fait la machine ; le tirage sert juste à ce que deux paliers n'aient pas la
// même partition. (Des gribouillis à coudes liraient « autocollant de circuit imprimé ».)
const CAN9={};
function texCan9(col){
  if(CAN9[col])return CAN9[col];
  const N=256,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');
  x.fillStyle='#000';x.fillRect(0,0,N,N);
  let a=col|0;const r=function(){a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  x.fillStyle='#'+(col>>>0).toString(16).padStart(6,'0');
  let y=10+r()*14;
  while(y<N-12){const w=3+r()*7;x.fillRect(0,y,N,w);y+=w+9+r()*26;}
  for(let k=0;k<3;k++)x.fillRect(N*(k+.5)/3+(r()-.5)*30,0,2+r()*3,N);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;CAN9[col]=t;return t;
}
/* ---- LA CROÛTE ÉRODÉE : la matière des SIX DERNIERS paliers ----
   À partir du CŒUR À FUSION, ce n'est plus une pièce de mécanique : c'est un objet impossible.
   Basalte fendu, veines qui prennent la lumière. ⚠ Une roche N'EST PAS BRILLANTE : la première
   version avait un relief à .055 et un pic spéculaire sur chaque fissure — un banc de paillettes.
   Le relief est calmé et le spéculaire plafonné bas. */
const T_CROUTE9=(function(){
  const S2=192,rr=a=>function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const br=s0=>{const G=256,r=rr(s0),tb=new Float32Array(G*G);
    for(let i=0;i<G*G;i++)tb[i]=r();
    const sm=t=>t*t*(3-2*t);
    return function(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
      const a=tb[((yi&255)*G)+(xi&255)],b=tb[((yi&255)*G)+((xi+1)&255)];
      const c=tb[(((yi+1)&255)*G)+(xi&255)],d=tb[(((yi+1)&255)*G)+((xi+1)&255)];
      const u=sm(xf),v=sm(yf);return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;};};
  const fb=(n,x,y,o,p2)=>{let t=0,a=1,f=1,q=0;for(let i=0;i<o;i++){t+=n(x*f,y*f)*a;q+=a;a*=p2;f*=2;}return t/q;};
  const c2=v=>v<0?0:v>1?1:v,nR=br(311),nF=br(913);
  const cs=[0,1,2].map(()=>{const c=document.createElement('canvas');c.width=c.height=S2;return c;});
  const im=cs.map(c=>c.getContext('2d').createImageData(S2,S2));
  for(let y=0;y<S2;y++)for(let x=0;x<S2;x++){
    const u=x/S2,v=y/S2,j=(y*S2+x)*4;
    const g=fb(nR,u*6,v*6,5,.55),f=fb(nF,u*17,v*17,3,.5);
    const fis=Math.pow(1-Math.abs(f-.5)*2,9),l=.11+(g-.5)*.10;
    im[0].data[j]=c2(l+fis*.10)*255;im[0].data[j+1]=c2(l*.95+fis*.06)*255;
    im[0].data[j+2]=c2(l*1.28+fis*.17)*255;im[0].data[j+3]=255;
    const h=c2(.5+(g-.5)*.35-fis*.22);im[1].data[j]=im[1].data[j+1]=im[1].data[j+2]=h*255;im[1].data[j+3]=255;
    const sp=c2(.10+fis*.26);im[2].data[j]=im[2].data[j+1]=im[2].data[j+2]=sp*255;im[2].data[j+3]=255;
  }
  cs.forEach((c,i)=>c.getContext('2d').putImageData(im[i],0,0));
  const mk=c=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;};
  return {map:mk(cs[0]),bump:mk(cs[1]),spec:mk(cs[2])};
})();
// ---- LES MATÉRIAUX : c'est là que se joue le « métallique brillant », pas dans la géométrie ----
// ⚠ EN r128 (MeshPhong, pas de PBR) le chrome ne vient PAS d'une texture : il vient d'une
// `shininess` très haute + une `envMap` fortement réfléchissante. Le ciel du jeu sert de sonde —
// c'est lui qu'on voit couler sur les collecteurs, et c'est ce qui les rend crédibles.
const M9={
  alu:(c,sh)=>new THREE.MeshPhongMaterial({color:c==null?0xd8dce2:c,map:MAT9.alu.map,bumpMap:MAT9.alu.bump,
    bumpScale:.010,specularMap:MAT9.alu.spec,shininess:sh||165,specular:0xf2f6ff,
    envMap:envTex,reflectivity:.40,combine:THREE.MixOperation}),
  inox:(c)=>new THREE.MeshPhongMaterial({color:c==null?0xeef3f9:c,shininess:340,specular:0xffffff,
    envMap:envTex,reflectivity:.90,combine:THREE.MixOperation}),   // le collecteur tubulaire : miroir
  carbone:()=>new THREE.MeshPhongMaterial({color:0xffffff,map:MAT9.carbone.map,bumpMap:MAT9.carbone.bump,
    bumpScale:.006,specularMap:MAT9.carbone.spec,shininess:250,specular:0xc8dcf0,
    envMap:envTex,reflectivity:.26,combine:THREE.MixOperation}),
  anod:(c)=>new THREE.MeshPhongMaterial({color:c,map:MAT9.alu.map,bumpMap:MAT9.alu.bump,bumpScale:.008,
    shininess:230,specular:0xffffff,envMap:envTex,reflectivity:.34,combine:THREE.MixOperation}),
  fonte:(c)=>new THREE.MeshPhongMaterial({color:c==null?0x9a8f84:c,map:MAT9.fonte.map,bumpMap:MAT9.fonte.bump,
    bumpScale:.026,specularMap:MAT9.fonte.spec,shininess:70,specular:0xc8d0d8,
    envMap:envTex,reflectivity:.20,combine:THREE.MixOperation}),
  noir:()=>new THREE.MeshPhongMaterial({color:0x14161b,shininess:120,specular:0x6a7480,envMap:envTex,reflectivity:.18,combine:THREE.MixOperation}),
  chaud:()=>new THREE.MeshPhongMaterial({color:0xffffff,map:T_CHAUD9,shininess:290,specular:0xffffff,
    envMap:envTex,reflectivity:.52,combine:THREE.MixOperation}),          // collecteurs : inox bleui
  canaux:(c)=>new THREE.MeshPhongMaterial({color:0x8a94a6,map:MAT9.alu.map,bumpMap:MAT9.alu.bump,
    bumpScale:.008,emissive:0xffffff,emissiveMap:texCan9(c),shininess:280,specular:0xffffff,
    envMap:envTex,reflectivity:.30,combine:THREE.MixOperation}),          // couvre-culasse de course
  croute:(c)=>new THREE.MeshPhongMaterial({color:c==null?0x8d95b4:c,map:T_CROUTE9.map,bumpMap:T_CROUTE9.bump,
    bumpScale:.022,specularMap:T_CROUTE9.spec,shininess:26,specular:0x7d88a8,
    envMap:envTex,reflectivity:.14,combine:THREE.MixOperation}),          // les six derniers paliers
  cristal:(c)=>new THREE.MeshPhongMaterial({color:c,emissive:c,emissiveIntensity:.5,shininess:400,
    specular:0xffffff,transparent:true,opacity:.72,envMap:envTex,reflectivity:.78,combine:THREE.MixOperation})
};
/* ================= LES DEUX OUTILS DE FORME (2026-08-05) =================
   ⚠ POURQUOI LES MOTEURS ÉTAIENT LAIDS — ce n'était pas la finition. TOUT était une primitive
   ÉTIRÉE : un cube mis à l'échelle reste un cube (arêtes vives, faces plates, zéro accroche de
   lumière), et un cône ne remplace pas un cornet d'admission — il en donne la caricature.
     · `profX` — on décrit la SECTION de la pièce (carter, culasse, couvre-culasse) et on
       l'extrude AVEC BISEAU. Sur une pièce coulée il n'existe pas d'angle vif : c'est cette
       arête cassée qui attrape un filet de lumière sur toute la longueur, et c'est elle qui
       sépare « pièce de mécanique » de « boîte ».
     · `tourX` — les pièces TOURNÉES (cloche d'embrayage, fûts, cornets, turbos, carters de
       turbine, tuyères) sont des profils de RÉVOLUTION, pas des cylindres redimensionnés.
   ⚠ `tourX` rend une pièce d'axe X. Lui ajouter un `rotation.z=PI/2` la met DEBOUT — c'est
   exactement ce qui transformait la turbine à gaz en vase posé sur la table. */
function profX(pts,len,bev){
  const sh=new THREE.Shape();sh.moveTo(-pts[0][0],pts[0][1]);
  for(let k=1;k<pts.length;k++)sh.lineTo(-pts[k][0],pts[k][1]);
  sh.closePath();
  const b=bev==null?.022:bev;
  const g=new THREE.ExtrudeGeometry(sh,{depth:len,bevelEnabled:b>0,bevelSize:b,bevelThickness:b,
    bevelSegments:2,curveSegments:4,steps:1});
  g.translate(0,0,-len/2);g.rotateY(Math.PI/2);return g;
}
function tourX(pts,seg){
  const v=[];for(let k=0;k<pts.length;k++)v.push(new THREE.Vector2(Math.max(.0006,pts[k][0]),pts[k][1]));
  const g=new THREE.LatheGeometry(v,seg||20);g.rotateZ(-Math.PI/2);return g;
}
/* ---- L'ÉROSION : on déforme une géométrie par un bruit haché, pour les objets impossibles ----
   ⚠ le sommet se hache par sa POSITION, jamais par son index : une géométrie non indexée donne
   à chaque triangle ses propres sommets, et un hachage par index la déchire en confettis. */
function hash9(x,y,z){let h=Math.imul(((x*7349)^(y*15731)^(z*24593))|0,668265263);
  h^=h>>>13;h=Math.imul(h,1274126177);return((h^h>>>16)>>>0)/4294967296;}
function eroder9(geo,amp,freq,graine){
  const p=geo.attributes.position;geo.computeVertexNormals();
  const n=geo.attributes.normal,q=v=>Math.round(v*freq*40);
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const d=(hash9(q(x)+graine,q(y),q(z))*.62+hash9(q(x)*2+graine,q(y)*2,q(z)*2)*.38-.5)*amp;
    p.setXYZ(i,x+n.getX(i)*d,y+n.getY(i)*d,z+n.getZ(i)*d);}
  p.needsUpdate=true;geo.computeVertexNormals();return geo;
}
// un ÉCLAT en lévitation : un caillou taillé, tiré, qui ne touche rien
function eclat9(g,mat,rnd,x,y,z,t){
  const e=new THREE.Mesh(eroder9(new THREE.IcosahedronGeometry(t,0),t*.7,3,(x*97+y*31+z*13)|0),mat);
  e.position.set(x,y,z);e.rotation.set(rnd()*3,rnd()*3,rnd()*3);g.add(e);return e;
}
// L'ALÉA SEMÉ : une graine par palier. Boulons, durites, nervures et accessoires sont TIRÉS —
// chaque moteur a son propre désordre, reproductible, et aucun n'est placé à la main.
function rngT(a){a|=0;return function(){a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const put9=(g,geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);g.add(m);return m;};
const GBOU9=new THREE.CylinderGeometry(1,1,1,6);
const bou9=(g,mat,x,y,z,r)=>{const m=new THREE.Mesh(GBOU9,mat);m.scale.set(r||.028,.030,r||.028);
  m.position.set(x,y,z);g.add(m);return m;};
// un tube qui SERPENTE d'un point à l'autre : durite, faisceau, tube d'admission de turbo
function serp9(g,p0,p1,mat,r,rnd,mou){
  const pts=[];
  for(let k=0;k<=4;k++){const t=k/4,w=Math.sin(t*Math.PI);
    pts.push(new THREE.Vector3(p0[0]+(p1[0]-p0[0])*t+(rnd()-.5)*.10*w,
      p0[1]+(p1[1]-p0[1])*t-(mou==null?.14:mou)*w+(rnd()-.5)*.06*w,
      p0[2]+(p1[2]-p0[2])*t+(rnd()-.5)*.10*w));}
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),14,r,7,false),mat));
}
/* ================= LE SQUELETTE : la forme SORT du moteur =================
   ⚠ (2026-08-05) Avant, le bloc faisait 1,5 × 0,9 × 1,1 pour TOUT LE MONDE, du bicylindre au
   V16, et les fûts, minuscules, étaient noyés dedans. Pire : ils étaient inclinés autour de Z
   alors que le vilebrequin court sur X — un V s'ouvre dans le plan Y-Z, donc le V ne POUVAIT
   PAS se lire, quel que soit l'angle de caméra. Mesuré sur la planche contact de `moteurs.html`
   (recouvrement des silhouettes) : les paliers 3 à 18 se recouvraient à 85-99 %, V10/V12/W12 à
   99 %. SEIZE paliers pour une seule forme.
   Désormais la LONGUEUR sort du nombre de cylindres et les BANCS sortent de l'architecture. */
function squel9(K){
  const BK=K.a==='in'?[[0,0]]:K.a==='v'?[[-.44,0],[.44,0]]
    :K.a==='fl'?[[-1.50,0],[1.50,0]]
    :K.a==='w'?[[-.80,0],[-.28,0],[.28,0],[.80,0]]
    :K.a==='h'?[[-1.50,-1],[1.50,-1],[-1.50,1],[1.50,1]]:[[0,0]];
  const pb=Math.max(1,Math.ceil((K.c||1)/BK.length));
  return {BK:BK,pb:pb,L:.52+pb*.30};
}
// ---- LE CORPS À PISTONS : carter coulé, bancs de fûts, culasses, couvre-culasses ----
function corps9(g,K,S,MT,rnd,ep,carbo,nv){
  const L=S.L,plat=K.a==='fl',haut=K.a==='h';
  // LE CARTER : une vraie section de pièce coulée — flancs qui rentrent, semelle étroite
  const sec=plat?[[-.30,.20],[.30,.20],[.26,-.10],[.16,-.24],[-.16,-.24],[-.26,-.10]]
    :haut?[[-.24,.50],[.24,.50],[.22,-.50],[-.22,-.50]]
    :[[-.34,.26],[.34,.26],[.30,-.02],[.20,-.26],[-.20,-.26],[-.30,-.02]];
  put9(g,profX(sec,L,.026),MT.carter||MT.bloc,0,-.02,0);
  // LES NERVURES DE RENFORT, semées : c'est ce qui dit « pièce coulée sous contrainte »
  if(!ep&&!plat){const nb=3+Math.floor(rnd()*3);
    for(let k=0;k<nb;k++){const u=(k/(nb-1)-.5)*(L-.30)+(rnd()-.5)*.06;
      for(let si=0;si<2;si++)put9(g,profX([[-.03,.22],[.03,.22],[.03,-.20],[-.03,-.20]],.05,.012),
        MT.carter||MT.bloc,u,-.02,(si?1:-1)*.31);}}
  put9(g,profX([[-.22,.02],[.22,.02],[.17,-.20],[-.17,-.20]],L*.88,.018),MT.sombre,0,-.30,0); // carter d'huile
  // LA CLOCHE D'EMBRAYAGE, tournée. L'ancien « volant moteur » était un palet plat : à l'écran
  // il lisait comme une roue posée contre le bloc, et il mangeait toute la composition.
  put9(g,tourX([[.06,0],[.26,0],[.30,.05],[.32,.16],[.26,.22],[.08,.24],[.06,.24]],20),
    MT.sombre,-(L*.5+.02),-.02,0);
  put9(g,tourX([[.05,0],[.20,0],[.22,.04],[.20,.09],[.22,.13],[.20,.17],[.05,.17]],18),
    MT.chrome,L*.5,-.02,0);                                                     // poulie de vilebrequin
  for(let b=0;b<S.BK.length;b++){
    const n=Math.min(S.pb,K.c-b*S.pb);if(n<=0)break;
    const bk=new THREE.Group();bk.position.y=S.BK[b][1]*.28;bk.rotation.x=S.BK[b][0];
    // LE FÛT : un profil tourné avec sa collerette. `tourX` sort un axe X, le fût est vertical.
    for(let c=0;c<n;c++){
      const u=(n>1?c/(n-1)-.5:0)*(L-.42);
      const f=new THREE.Mesh(tourX([[.005,0],[.155,.02],[.175,.05],[.175,.30],[.205,.33],[.205,.40],[.005,.40]],16),MT.bloc);
      f.rotation.z=Math.PI/2;f.position.set(u,.10,0);bk.add(f);
    }
    put9(bk,profX([[-.25,0],[.25,0],[.235,.15],[-.235,.15]],L*.93,.022),MT.bloc,0,.52,0);   // culasse
    // LE COUVRE-CULASSE : c'est LUI qui porte la couleur du palier — teindre tout le bloc
    // donnerait un moteur en plastique coloré.
    put9(bk,profX([[-.235,0],[.235,0],[.20,.13],[-.20,.13]],L*.97,.026),MT.habit,0,.67,0);
    if(!ep){
      for(let k=0;k<8;k++){const u=(k/7-.5)*(L-.24);bou9(bk,MT.chrome,u,.68,.215);bou9(bk,MT.chrome,u,.68,-.215);}
      if(n>=3&&nv!==1)for(let c=0;c<n;c++){                                   // les bobines d'allumage, en rang
        const u=(n>1?c/(n-1)-.5:0)*(L-.46);
        put9(bk,profX([[-.07,0],[.07,0],[.06,.13],[-.06,.13]],.12,.012),MT.habit,u,.80,0);
        put9(bk,tourX([[.045,0],[.045,.11]],10),MT.sombre,u,.68,0);}
    }
    g.add(bk);
  }
}
/* ---- L'ANCRE D'ÉCHAPPEMENT : où sort le feu, et dans quelle direction ----
   ⚠ C'est LE MOTEUR qui la déclare, parce que c'est lui qui sait où est son tuyau. La vignette
   ne devine plus : elle accroche la flamme là, comme FILLE du moteur, donc la flamme tourne
   avec lui. Avant, la flamme était posée dans la SCÈNE à une position fixe calculée sur le
   rayon d'encombrement : le moteur tournait, elle non — on la voyait flotter à côté du bloc,
   détachée du pot. Le correctif d'alors (« la sortir du gabarit pour qu'elle ne disparaisse
   jamais derrière le bloc ») traitait le symptôme et fabriquait celui-ci.
   `p` et `d` sont en coordonnées LOCALES du groupe : la mise à l'échelle du cadrage s'applique
   ensuite toute seule, puisque la flamme est accrochée dessous. */
function echap9(g,m,len){
  const q=m.quaternion;
  const v=new THREE.Vector3(len,0,0).applyQuaternion(q).add(m.position);
  const d=new THREE.Vector3(1,0,0).applyQuaternion(q);
  g.userData.echap={p:[v.x,v.y,v.z],d:[d.x,d.y,d.z]};
}
// ---- LE COLLECTEUR : des tubes qui sortent du FLANC de la culasse, s'écartent, plongent et se
// rejoignent — et qui suivent l'inclinaison du banc, sinon un V a ses tuyaux dans le vide.
function collect9(g,K,S,mat,b){
  const inc=S.BK[b][0],et=S.BK[b][1],n=S.pb,L=S.L;
  // ⚠ le collecteur ne suit PAS l'inclinaison au pied de la lettre : à plat (boxer, H) un banc
  // couché à 86° enverrait ses tubes faire une ANSE par-dessus le moteur. On plafonne le
  // basculement — les tubes sortent sur le flanc puis plongent, comme sur une vraie voiture.
  const gr=new THREE.Group();gr.position.y=et*.28;
  gr.rotation.x=Math.abs(inc)>1?(inc<0?-1:1)*.62:inc;
  for(let k=0;k<n;k++){
    const u=((n>1?k/(n-1):.5)-.5)*(L-.42),ph=k/Math.max(1,n);
    gr.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(u,.58,.24),
      new THREE.Vector3(u*.94,.40+ph*.10,.56+ph*.12),
      new THREE.Vector3(u*.52,.04-ph*.05,.66+ph*.10),
      new THREE.Vector3(u*.18,-.24,.56),
      new THREE.Vector3(0,-.32,.42)]),18,.055,9,false),mat));
  }
  gr.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,-.32,.42),new THREE.Vector3(L*.34,-.38,.46),
    new THREE.Vector3(L*.64,-.42,.36)]),14,.095,10,false),mat));
  // la sortie du PREMIER banc sert d'ancre : c'est de là que sort le feu (les autres bancs
  // sortent au même endroit à la symétrie près, une seule flamme suffit à le raconter)
  if(b===0){
    const e=new THREE.Vector3(L*.64,-.42,.36).applyAxisAngle(new THREE.Vector3(1,0,0),gr.rotation.x);
    e.y+=et*.28;
    const d=new THREE.Vector3(.92,-.14,-.08).normalize().applyAxisAngle(new THREE.Vector3(1,0,0),gr.rotation.x);
    g.userData.echap={p:[e.x,e.y,e.z],d:[d.x,d.y,d.z]};
  }
  g.add(gr);
}
// ---- L'ESCARGOT DE TURBO : carter en volute + tube. Deux cylindres croisés ne font pas un turbo.
function turbo9(g,chrome,sombre,x,y,z){
  put9(g,tourX([[.05,0],[.19,.015],[.215,.055],[.215,.15],[.19,.19],[.05,.205]],18),chrome,x,y,z);
  const t=new THREE.Mesh(new THREE.TorusGeometry(.175,.075,8,20),chrome);
  t.rotation.y=Math.PI/2;t.position.set(x+.10,y,z);g.add(t);
  put9(g,tourX([[.055,0],[.055,.22]],10),sombre,x-.22,y,z);
}
/* ---- L'ÉCHANGEUR (intercooler) : une dalle nervurée EN AVANT du moteur ----
   ⚠ LEÇON DE LA MESURE (2026-08-05). J'ai d'abord distingué les paliers turbo par leurs
   escargots. Résultat mesuré : 4 EN LIGNE TURBO recouvrait encore le 4 SOUPAPES à 98 %, et
   V6 BITURBO recouvrait le V6 à 100 %. La raison est bête et vaut pour TOUT le reste : la
   vignette RECADRE chaque moteur pour qu'il remplisse la case (en jeu comme à l'atelier).
   Donc ni la taille, ni la longueur, ni une petite pièce collée au flanc ne se voient — seules
   comptent les PROPORTIONS et la TOPOLOGIE. Pour qu'un palier se distingue, il lui faut une
   masse qui sorte du volume : dessus, dessous, ou devant. D'où cette dalle. */
function echang9(g,mat,chrome,x,y,w,h){
  put9(g,profX([[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]],.11,.016),mat,x,y,0);
  for(let k=0;k<7;k++)
    put9(g,profX([[-w/2+.03,-.012],[w/2-.03,-.012],[w/2-.03,.012],[-w/2+.03,.012]],.14,0),
      chrome,x,y-h/2+.06+k*(h-.12)/6,0);
}
// ---- LES DEUX PIÈCES TOURNÉES DE L'ENDGAME. Un cône étiré ne fait pas une tuyère : il faut
// le col qui se PINCE puis la corolle qui s'ouvre.
const geoTurb9=()=>tourX([[.05,0],[.24,.04],[.33,.14],[.39,.34],[.42,.70],[.41,1.06],[.36,1.34],[.27,1.50],[.05,1.56]],26);
const geoTuy9 =()=>tourX([[.15,0],[.19,.08],[.155,.24],[.20,.42],[.30,.62],[.40,.78]],24);

/* ================= LA NOUVELLE MAIN DES MOTEURS (2026-10-26, Léo : « refonte de tous les moteurs, tout en mieux :
   matière, texture, formes et complexité ») — PAR VAGUES : `ENG_VAGUE` = nombre de paliers déjà passés à cette main
   (10 : les paliers 1-10 ; puis 20 ; puis 30). Une vague ne change QUE les paliers < ENG_VAGUE : les autres gardent leur
   dessin d'avant tant que Léo n'a pas dit oui à la planche.
   TROIS OUTILS : (1) des textures neuves, calculées PARESSEUSEMENT (la 1re fois qu'un palier de la vague est bâti) ;
   (2) `bat10`, un ASSEMBLEUR : chaque petite pièce (boulon, collerette, durite, canal…) est cuite dans UNE géométrie par
   matière — 300 détails ne coûtent que 6-8 appels de dessin ; (3) des constructeurs de pièces vraies (courroie, escargot
   de turbo, tubulure, bobines) qui ne dépendent que de leurs arguments. */
const ENG_VAGUE=30;
const OUT10=(function(){
  const rnd32=a=>function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const bruit=s=>{const G=256,r=rnd32(s),tab=new Float32Array(G*G);for(let i=0;i<G*G;i++)tab[i]=r();
    const sm=t=>t*t*(3-2*t);
    return function(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
      const a=tab[((yi&255)*G)+(xi&255)],b=tab[((yi&255)*G)+((xi+1)&255)];
      const c=tab[(((yi+1)&255)*G)+(xi&255)],d=tab[(((yi+1)&255)*G)+((xi+1)&255)];
      const u=sm(xf),v=sm(yf);return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;};};
  const fbm=(n,x,y,o,p)=>{let s=0,a=1,f=1,q=0;for(let i=0;i<o;i++){s+=n(x*f,y*f)*a;q+=a;a*=p;f*=2;}return s/q;};
  return {bruit:bruit,fbm:fbm,cl:v=>v<0?0:v>1?1:v};
})();
const T10={};
function tex10(nom){
  if(T10[nom])return T10[nom];
  const bruit=OUT10.bruit,fbm=OUT10.fbm,cl=OUT10.cl,S=256;
  const mk=(c,rx,ry)=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;
    if(rx)t.repeat.set(rx,ry||1);return t;};
  const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const trio=fn=>{const cs=[cv(S,S),cv(S,S),cv(S,S)],im=cs.map(c=>c.getContext('2d').createImageData(S,S));
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){const o=fn(x/S,y/S),j=(y*S+x)*4;
      im[0].data[j]=cl(o[0])*255;im[0].data[j+1]=cl(o[1])*255;im[0].data[j+2]=cl(o[2])*255;im[0].data[j+3]=255;
      im[1].data[j]=im[1].data[j+1]=im[1].data[j+2]=cl(o[3])*255;im[1].data[j+3]=255;
      im[2].data[j]=im[2].data[j+1]=im[2].data[j+2]=cl(o[4])*255;im[2].data[j+3]=255;}
    cs.forEach((c,i)=>c.getContext('2d').putImageData(im[i],0,0));
    return {map:mk(cs[0]),bump:mk(cs[1]),spec:mk(cs[2])};};
  if(nom==='brosse'){ // ALU BROSSÉ / TOURNÉ : des stries fines qui courent le long de la pièce, une brillance qui les suit
    const n1=bruit(5),n2=bruit(61),n3=bruit(203);
    T10[nom]=trio((u,v)=>{const st=fbm(n1,u*2.5,v*64,2,.5),gr=fbm(n2,u*7,v*7,3,.5),tache=fbm(n3,u*3,v*3,2,.5);
      const b=.72+(st-.5)*.13+(gr-.5)*.07+(tache-.5)*.08;
      return [b*.99,b,b*1.035,cl(.5+(st-.5)*.30+(gr-.5)*.15),cl(.60+(st-.5)*.34-Math.pow(tache,5)*.2)];});
  }else if(nom==='ride'){ // PEINTURE RIDÉE (« wrinkle ») des couvre-culasses de course : des crêtes serrées qui piègent la lumière
    const n1=bruit(17),n2=bruit(71);
    T10[nom]=trio((u,v)=>{const f=fbm(n1,u*14,v*14,3,.6),w=1-Math.abs(f*2-1),h=cl(w*w*.9+(fbm(n2,u*40,v*40,1,.5)-.5)*.12);
      const b=.72+h*.18;return [b,b,b,h,cl(.35+h*.30)];});
  }else if(nom==='sable'){ // FONTE SABLÉE du carter : grain gros, creux sombres, aucun poli
    const n1=bruit(29),n2=bruit(83);
    T10[nom]=trio((u,v)=>{const g=fbm(n1,u*22,v*22,3,.6),f=fbm(n2,u*60,v*60,2,.5),cr=Math.pow(fbm(n2,u*40,v*40,2,.5),4);
      const b=.56+(g-.5)*.18+(f-.5)*.10-cr*.10;return [b*.98,b,b*1.04,cl(.5+(g-.5)*.55),cl(.30+(f-.5)*.3)];});
  }else if(nom==='chaud2'){ // COLLECTEUR INOX CHAUFFÉ + SOUDURES TIG « EMPILÉES » : le dégradé bleu→paille→poli, des croissants de soudure irisés
    const W=512,H=64,c=cv(W,H),g=c.getContext('2d'),gr=g.createLinearGradient(0,0,W,0);
    gr.addColorStop(0,'#5a6fb4');gr.addColorStop(.10,'#8a76b0');gr.addColorStop(.24,'#cfae72');gr.addColorStop(.40,'#e4d6b8');
    gr.addColorStop(.62,'#b9c3cf');gr.addColorStop(.85,'#dde5ee');gr.addColorStop(1,'#a8b6d6');
    g.fillStyle=gr;g.fillRect(0,0,W,H);
    const b=cv(W,H),h=b.getContext('2d');h.fillStyle='#808080';h.fillRect(0,0,W,H);
    const zones=[.17,.50,.83];
    for(const z of zones){const x0=z*W;
      const ha=g.createLinearGradient(x0-40,0,x0+40,0);ha.addColorStop(0,'rgba(120,90,200,0)');ha.addColorStop(.5,'rgba(110,100,220,.22)');ha.addColorStop(1,'rgba(120,90,200,0)');
      g.fillStyle=ha;g.fillRect(x0-40,0,80,H);
      for(let k=-3;k<=3;k++){const x=x0+k*4.2,dx=(k%2?2.4:-2.4);
        g.strokeStyle='rgba(54,56,120,.40)';g.lineWidth=3.0;g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x+dx,H/2,x,H);g.stroke();
        g.strokeStyle='rgba(255,238,196,.85)';g.lineWidth=1.5;g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x+dx,H/2,x,H);g.stroke();
        h.strokeStyle='#d8d8d8';h.lineWidth=2.4;h.beginPath();h.moveTo(x,0);h.quadraticCurveTo(x+dx,H/2,x,H);h.stroke();}}
    T10[nom]={map:mk(c,1,1),bump:mk(b,1,1)};
  }else if(nom==='tresse'){ // DURIT TRESSÉE : le croisé de l'inox, en bosse
    const c=cv(128,128),g=c.getContext('2d'),b=cv(128,128),h=b.getContext('2d');
    g.fillStyle='#8c929c';g.fillRect(0,0,128,128);h.fillStyle='#404040';h.fillRect(0,0,128,128);
    for(let k=-16;k<32;k++){const p=k*8;
      g.strokeStyle='#e4e8ee';g.lineWidth=2.6;g.beginPath();g.moveTo(p,0);g.lineTo(p+128,128);g.stroke();
      g.strokeStyle='#4a4e58';g.lineWidth=1.2;g.beginPath();g.moveTo(p+4,0);g.lineTo(p+132,128);g.stroke();
      h.strokeStyle='#fff';h.lineWidth=3;h.beginPath();h.moveTo(p,0);h.lineTo(p+128,128);h.stroke();
      h.strokeStyle='#000';h.lineWidth=2;h.beginPath();h.moveTo(p+4,0);h.lineTo(p+132,128);h.stroke();}
    T10[nom]={map:mk(c,8,1),bump:mk(b,8,1)};
  }else if(nom==='or'){ // FEUILLE D'OR DE BOUCLIER THERMIQUE : froissée, brillante
    const n1=bruit(41),n2=bruit(131);
    T10[nom]=trio((u,v)=>{const f=fbm(n1,u*7,v*7,4,.55),f2=fbm(n2,u*24,v*24,2,.5);
      const b=.80+(f-.5)*.36+(f2-.5)*.10;return [b,b*.86,b*.50,cl(.5+(f-.5)*1.3),cl(.7+(f2-.5)*.4)];});
  }
  return T10[nom];
}
const PL10={};
function plaque10(txt,col){ // une PLAQUE gravée : fond tourné sombre, filet, lettres de la couleur du palier
  const k=txt+col;if(PL10[k])return PL10[k];
  const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,64);gr.addColorStop(0,'#2a2c34');gr.addColorStop(.5,'#16171c');gr.addColorStop(1,'#24262d');
  g.fillStyle=gr;g.fillRect(0,0,256,64);
  g.strokeStyle='rgba(235,240,250,.55)';g.lineWidth=2;g.strokeRect(3,3,250,58);
  g.strokeStyle='rgba(235,240,250,.18)';g.lineWidth=1;g.strokeRect(8,8,240,48);
  g.fillStyle='#'+(col>>>0).toString(16).padStart(6,'0');g.textAlign='center';g.textBaseline='middle';
  let fs=30;g.font='900 '+fs+'px "Arial Narrow",Arial,sans-serif';
  while(g.measureText(txt).width>214&&fs>11){fs-=2;g.font='900 '+fs+'px "Arial Narrow",Arial,sans-serif';}
  g.fillText(txt,128,34);
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;PL10[k]=t;return t;
}
const M10={
  alu:(c,sh)=>{const T=tex10('brosse');return new THREE.MeshPhongMaterial({color:c==null?0xd8dce2:c,map:T.map,bumpMap:T.bump,
    bumpScale:.012,specularMap:T.spec,shininess:sh||170,specular:0xf4f7ff,envMap:envTex,reflectivity:.42,combine:THREE.MixOperation});},
  sable:(c)=>{const T=tex10('sable');return new THREE.MeshPhongMaterial({color:c==null?0x7c8492:c,map:T.map,bumpMap:T.bump,
    bumpScale:.018,specularMap:T.spec,shininess:46,specular:0x9aa4b4,envMap:envTex,reflectivity:.16,combine:THREE.MixOperation});},
  ride:(c)=>{const T=tex10('ride');return new THREE.MeshPhongMaterial({color:c,map:T.map,bumpMap:T.bump,bumpScale:.010,
    specularMap:T.spec,shininess:55,specular:0xd8dce8,envMap:envTex,reflectivity:.20,combine:THREE.MixOperation});},
  soudure:()=>{const T=tex10('chaud2');return new THREE.MeshPhongMaterial({color:0xffffff,map:T.map,bumpMap:T.bump,bumpScale:.02,
    shininess:300,specular:0xffffff,envMap:envTex,reflectivity:.55,combine:THREE.MixOperation});},
  tresse:()=>{const T=tex10('tresse');return new THREE.MeshPhongMaterial({color:0xffffff,map:T.map,bumpMap:T.bump,bumpScale:.03,
    shininess:130,specular:0xdfe6f0,envMap:envTex,reflectivity:.38,combine:THREE.MixOperation});},
  caout:()=>new THREE.MeshPhongMaterial({color:0x1d1e23,shininess:22,specular:0x2c2e34,envMap:envTex,reflectivity:.06,combine:THREE.MixOperation}),
  silico:(c)=>new THREE.MeshPhongMaterial({color:c,shininess:70,specular:0x8a8f9a,envMap:envTex,reflectivity:.10,combine:THREE.MixOperation}),
  laiton:()=>new THREE.MeshPhongMaterial({color:0xd0a448,shininess:140,specular:0xffe8a0,envMap:envTex,reflectivity:.50,combine:THREE.MixOperation}),
  or:()=>{const T=tex10('or');return new THREE.MeshPhongMaterial({color:0xffffff,map:T.map,bumpMap:T.bump,bumpScale:.03,specularMap:T.spec,
    shininess:200,specular:0xfff0c0,envMap:envTex,reflectivity:.55,combine:THREE.MixOperation,side:THREE.DoubleSide});},
  plaque:(txt,col)=>new THREE.MeshPhongMaterial({color:0xffffff,map:plaque10(txt,col),shininess:140,specular:0xffffff,
    envMap:envTex,reflectivity:.22,combine:THREE.MixOperation})
};
/* L'ASSEMBLEUR : bat10().add(géométrie, matière, x,y,z, rx,ry,rz, sx,sy,sz) cuit la pièce dans la géométrie de sa matière ;
   `cadre(y,rx)` pose le repère d'un BANC incliné (tout ce qui suit est dans le repère de la culasse) ; `fin(g)` livre les meshes. */
function bat10(){
  const L=new Map(),M=new THREE.Matrix4(),M0=new THREE.Matrix4(),Mf=new THREE.Matrix4(),Q=new THREE.Quaternion(),
        E=new THREE.Euler(),P=new THREE.Vector3(),Sc=new THREE.Vector3(),N=new THREE.Matrix3(),V=new THREE.Vector3();
  const o={
    cadre(y,rx){M0.makeRotationX(rx||0);M0.setPosition(0,y||0,0);return o;},
    plat(){M0.identity();return o;},
    add(geo,mat,x,y,z,rx,ry,rz,sx,sy,sz){
      if(o.f&&geo.index){geo=geo.toNonIndexed();geo.computeVertexNormals();}   // `f` : FACETTES — normales plates, comme les voitures (`facetteCaisse`)
      let e=L.get(mat);if(!e){e={p:[],n:[],u:[],i:[],c:0};L.set(mat,e);}
      E.set(rx||0,ry||0,rz||0,'XYZ');Q.setFromEuler(E);P.set(x||0,y||0,z||0);Sc.set(sx==null?1:sx,sy==null?1:sy,sz==null?1:sz);
      Mf.compose(P,Q,Sc);M.multiplyMatrices(M0,Mf);N.getNormalMatrix(M);
      const pa=geo.attributes.position,na=geo.attributes.normal,ua=geo.attributes.uv,n=pa.count;
      for(let k=0;k<n;k++){V.set(pa.getX(k),pa.getY(k),pa.getZ(k)).applyMatrix4(M);e.p.push(V.x,V.y,V.z);
        V.set(na.getX(k),na.getY(k),na.getZ(k)).applyMatrix3(N).normalize();e.n.push(V.x,V.y,V.z);
        if(ua)e.u.push(ua.getX(k),ua.getY(k));else e.u.push(0,0);}
      if(geo.index){const ix=geo.index.array;for(let k=0;k<ix.length;k++)e.i.push(ix[k]+e.c);}
      else for(let k=0;k<n;k++)e.i.push(k+e.c);
      e.c+=n;return o;},
    fin(g){L.forEach((e,mat)=>{const bg=new THREE.BufferGeometry();
      bg.setAttribute('position',new THREE.Float32BufferAttribute(e.p,3));bg.setAttribute('normal',new THREE.Float32BufferAttribute(e.n,3));
      bg.setAttribute('uv',new THREE.Float32BufferAttribute(e.u,2));bg.setIndex(e.i);bg.computeBoundingSphere();
      g.add(new THREE.Mesh(bg,mat));});L.clear();return o;}
  };
  return o;
}
// primitives de détail, partagées (jamais modifiées : l'assembleur les COPIE dans sa géométrie)
const G10={
  cyl6:new THREE.CylinderGeometry(1,1,1,6),cyl10:new THREE.CylinderGeometry(1,1,1,10),cyl14:new THREE.CylinderGeometry(1,1,1,14),
  tor:new THREE.TorusGeometry(1,.5,6,14),box:new THREE.BoxGeometry(1,1,1),sph:new THREE.SphereGeometry(1,10,8)
};
function tourY10(pts,seg){const v=[];for(let k=0;k<pts.length;k++)v.push(new THREE.Vector2(Math.max(.0006,pts[k][0]),pts[k][1]));
  return new THREE.LatheGeometry(v,seg||14);}
// un tube qui passe par des points (durite, tubulure, ligne d'huile)
function tube10(pts,r,seg,rad){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),seg||16,r,rad||8,false);}
// la courroie : le contour convexe de poulies (y,z,r) dans le plan YZ, creusé, extrudé sur X — une vraie boucle plate
function courroie10(poulies,ep,larg){
  const pts=[],cercle=(r)=>{const a=[];for(const p of poulies)for(let k=0;k<28;k++){const t=k/28*6.2832;a.push([-(p[1]+Math.cos(t)*(p[2]+r)),p[0]+Math.sin(t)*(p[2]+r)]);}return a;};
  const hull=(P)=>{P.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
    const lo=[],hi=[];for(const p of P){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
    for(let k=P.length-1;k>=0;k--){const p=P[k];while(hi.length>1&&cr(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop();hi.push(p);}
    lo.pop();hi.pop();return lo.concat(hi);};
  const ho=hull(cercle(ep)),hi2=hull(cercle(0));
  const sh=new THREE.Shape(ho.map(p=>new THREE.Vector2(p[0],p[1])));
  sh.holes.push(new THREE.Path(hi2.map(p=>new THREE.Vector2(p[0],p[1]))));
  const g=new THREE.ExtrudeGeometry(sh,{depth:larg,bevelEnabled:false,steps:1});
  g.rotateY(Math.PI/2);return g;
}
G10.axeX=tourX([[.0006,0],[1,0],[1,1],[.0006,1]],14);       // un cylindre plein d'axe X, rayon 1, longueur 1 (de x=0 à x=1)
G10.axeX8=tourX([[.0006,0],[1,0],[1,1],[.0006,1]],8);
G10.poulie=function(r){return tourX([[.02,0],[r+.03,0],[r+.03,.012],[r,.026],[r,.034],[r+.02,.044],[r+.02,.056],[r,.066],[r,.072],[r+.03,.086],[r+.03,.1],[.02,.1]],22);};
// L'ESCARGOT DE TURBO v2 (2026-10-26) : carter de compresseur en volute avec sa sortie tangentielle, cartouche centrale, carter
// chaud bleui + brides V-band, wastegate à tige, aubes visibles dans l'entrée, durite tressée d'huile. Axe X ; z>0 ou <0 = le flanc.
function turbo10(B,M,x,y,z,s){
  B.plat();
  // carter froid (aluminium) : entrée évasée → volute
  B.add(tourX([[.080,0],[.088,.02],[.12,.07],[.190,.10],[.222,.15],[.222,.20],[.185,.235],[.10,.255],[.06,.255]],22),M.alu,x-.255,y,z,0,0,0);
  // l'aube du compresseur, vue dans la gueule d'entrée
  for(let k=0;k<9;k++){const an=k/9*6.2832;
    B.add(G10.box,M.sombre,x-.250,y+Math.sin(an)*.052,z+Math.cos(an)*.052,an,0,0,.03,.018,.075);}
  B.add(G10.sph,M.sombre,x-.246,y,z,0,0,0,.024,.024,.024);
  // sortie tangentielle de la volute, vers le haut et l'extérieur
  B.add(tube10([[x-.12,y+.17,z+s*.02],[x-.12,y+.30,z+s*.06],[x-.04,y+.42,z+s*.10]],.052,10,10),M.alu,0,0,0);
  B.add(G10.tor,M.chrome,x-.04,y+.42,z+s*.10,0,Math.PI/2,0,.062,.062,.062);          // collier de la durite de sortie
  // cartouche centrale + bride V-band
  B.add(tourX([[.07,0],[.105,.02],[.105,.14],[.07,.16]],14),M.sombre,x-.02,y,z,0,0,0);
  B.add(G10.tor,M.chrome,x-.01,y,z,0,Math.PI/2,0,.205,.205,.17);
  // carter chaud : bleui, en escargot, bride carrée au collecteur
  B.add(tourX([[.06,0],[.16,.02],[.20,.07],[.205,.12],[.17,.18],[.09,.22],[.05,.24]],22),M.soudure,x+.075,y,z,0,0,0);
  B.add(G10.tor,M.soudure,x+.14,y,z,0,Math.PI/2,0,.19,.19,.21);
  B.add(G10.tor,M.chrome,x+.065,y,z,0,Math.PI/2,0,.18,.18,.15);
  B.add(G10.box,M.chrome,x+.14,y-.2,z,0,0,0,.20,.03,.20);
  for(let k=0;k<4;k++)B.add(G10.cyl6,M.chrome,x+.06+(k%2)*.16,y-.215,z+(k<2?-.07:.07),0,0,0,.016,.04,.016);
  // sortie des gaz, vers l'arrière
  B.add(tourX([[.095,0],[.10,.02],[.10,.20],[.115,.24]],16),M.soudure,x+.30,y,z,0,0,0);
  // wastegate : le pot, sa tige, sa patte
  B.add(tourX([[.001,0],[.052,0],[.056,.015],[.056,.10],[.04,.12],[.001,.12]],12),M.alu,x+.10,y+.19,z+s*.07,0,0,Math.PI/2,1,1,1);
  B.add(tourX([[.011,0],[.011,.12]],6),M.chrome,x+.10,y+.15,z+s*.06,0,0,Math.PI/2);
  // ligne d'huile tressée, du bloc à la cartouche
  B.add(tube10([[x-.02,y+.10,z-s*.02],[x-.10,y+.30,z-s*.20],[x-.30,y+.34,z-s*.34]],.022,14,8),M.chrome,0,0,0);
  B.add(G10.cyl6,M.chrome,x-.02,y+.115,z-s*.015,0,0,0,.035,.04,.035);
}
