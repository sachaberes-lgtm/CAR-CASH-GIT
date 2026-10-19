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
function corps9(g,K,S,MT,rnd,ep,carbo){
  const L=S.L,plat=K.a==='fl',haut=K.a==='h';
  // LE CARTER : une vraie section de pièce coulée — flancs qui rentrent, semelle étroite
  const sec=plat?[[-.30,.20],[.30,.20],[.26,-.10],[.16,-.24],[-.16,-.24],[-.26,-.10]]
    :haut?[[-.24,.50],[.24,.50],[.22,-.50],[-.22,-.50]]
    :[[-.34,.26],[.34,.26],[.30,-.02],[.20,-.26],[-.20,-.26],[-.30,-.02]];
  put9(g,profX(sec,L,.026),MT.bloc,0,-.02,0);
  // LES NERVURES DE RENFORT, semées : c'est ce qui dit « pièce coulée sous contrainte »
  if(!ep&&!plat){const nb=3+Math.floor(rnd()*3);
    for(let k=0;k<nb;k++){const u=(k/(nb-1)-.5)*(L-.30)+(rnd()-.5)*.06;
      for(let si=0;si<2;si++)put9(g,profX([[-.03,.22],[.03,.22],[.03,-.20],[-.03,-.20]],.05,.012),
        MT.bloc,u,-.02,(si?1:-1)*.31);}}
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
      if(n>=3)for(let c=0;c<n;c++){                                   // les bobines d'allumage, en rang
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

