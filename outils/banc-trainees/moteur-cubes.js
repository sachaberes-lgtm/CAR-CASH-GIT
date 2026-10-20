/* ============================================================================
   LES TRAÎNÉES EN CUBES (2026-10-20, Sacha : « passer les traînées en un joli jeu de pixels, comme le nitro ou toutes les flammes du jeu : les
   billets, les éclairs, les feuilles de sakura… toutes les traînées du jeu faites avec le même style pixel qui bouge ») — ÉTAPE 1 : SAKURA,
   BILLETS, FOUDRE DIVINE.
   ----------------------------------------------------------------------------
   Le feu du nitro, l'arc-en-ciel et la porte sont faits de CUBES (faces ombrées, couleurs au-delà de 1, un halo qui s'accumule). Les traînées
   POP, elles, étaient des quads lisses peints sur une planche. Elles prennent la même matière : TROIS piscines de cubes (`TC`), réglées comme
   NFEU / l'arc-en-ciel — donc les MÊMES programmes, zéro compilation de plus :
     · `TC.s` — les cubes PLEINS (opaques, faces ombrées : dessus clair, flancs, dessous sombre) : pétales, billets, cœur des éclairs ;
     · `TC.o` — le CONTOUR : des cubes un peu plus gros, d'une couleur plate, dessinés par leurs faces de DERRIÈRE (la géométrie a ses faces
       retournées : aucun `BackSide`, donc aucun programme de plus). Le cube plein les couvre, il ne reste que le liseré — un cœur blanc sans
       contour disparaît sur un ciel de jour ou dans la salle blanche de la boutique ;
     · `TC.g` — les cubes de LUEUR (additifs, translucides) : l'aura des éclairs, le halo de la tuyère, l'éclair blanc de la frappe.
   Le LANGAGE PIXEL, commun à toutes les traînées :
     · des cubes alignés sur la grille du MONDE, qui sautent de case en case (`TC_K.pas`) — jamais de fondu : le fondu est une TAILLE qui
       fond par crans (1 · ,84 · ,68 · ,5, comme la porte), et près de l'objectif aussi ; une lueur est faite de BANDES de cubes emboîtés ;
     · le mouvement est une SUITE d'images : le pétale bascule (à plat, debout, à plat tourné, debout de côté), le billet se retourne par quarts
       de tour (`TC_PERM`, `TC_SEQ`) — jamais une rotation lisse ;
     · des teintes en PALIERS (trois roses, trois verts), pas de dégradé.
   Chaque particule garde sa physique (`trxParts` : vent, balancement, gravité) : seul son DESSIN change, `p.cu` (1 pétale · 2 billet · 3 étincelle ·
   4 éclair blanc). L'aperçu du garage et la boutique passent par les mêmes émetteurs. `?trainee=lisse` (ou `signal`) rend les quads d'avant.
   Console : `dbgTrx()` rend aussi `cubes` (pleins, contours, lueurs).
   ========================================================================== */
const TC_ON=!/[?&]trainee=(lisse|signal)\b/.test(location.search);
const TC_K={pet:.105,bil:.1,bolt:.09,pas:.5}; // le CÔTÉ d'un cube (m, au garage ; ×2,3 en course pour les objets) : pétale · billet · éclair (× la largeur `wk` de l'éclair) — `pas` : la grille, en part du côté
var TC=null;
const TC_O=new Float32Array(3),TC_S=new Float32Array(3);
const TC_PERM=[[0,2,1],[0,1,2],[2,0,1],[2,1,0]]; // (long, court, épaisseur) en axes du monde : à plat · debout face à z · à plat tourné d'un quart · debout face à x
const TC_SEQ=[0,1,0,2,3,2]; // le billet : à plat, sur la tranche, à plat (le verso), tourné d'un quart…
const TC_PET=[[0,0,0],[1,0,1],[0,1,2]]; // les trois cellules du pétale : (a, b, teinte)
const TC_PETC=[[1.08,.68,.84],[1,.5,.7],[.9,.3,.55]]; // clair · rose · foncé (tops à 1, flancs ombrés par la face)
function tcPool(N,kind,op){ // kind : 's' plein · 'o' contour · 'g' lueur
  const bx=new THREE.BoxGeometry(1,1,1);
  if(kind==='s'){const ps=bx.attributes.position,nm=bx.attributes.normal,cl=new Float32Array(ps.count*3);
    for(let i=0;i<ps.count;i++){const ny=nm.getY(i),nz=nm.getZ(i),v=ny>.5?1:ny<-.5?.42:nz<-.5?.6:nz>.5?.5:.78;cl[i*3]=cl[i*3+1]=cl[i*3+2]=v;} // l'ombrage de la porte, face par face
    bx.setAttribute('color',new THREE.BufferAttribute(cl,3));}
  if(kind==='o'){const ix=bx.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t;}} // faces retournées : seul le DERRIÈRE du cube se dessine
  const mt=kind==='s'?new THREE.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false})
    :kind==='o'?new THREE.MeshBasicMaterial({fog:false,toneMapped:false})
    :new THREE.MeshBasicMaterial({fog:false,toneMapped:false,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}); // ⚠ les réglages EXACTS de NFEU.m / NFEU.h (et de l'arc-en-ciel) : mêmes programmes
  const m=new THREE.InstancedMesh(bx,mt,N);
  m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(N*3),3);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.instanceColor.setUsage(THREE.DynamicDrawUsage);
  m.count=0;m.frustumCulled=false;m.visible=false;if(kind==='g')m.renderOrder=2;scene.add(m);
  return {m:m,M:m.instanceMatrix.array,C:m.instanceColor.array,n:0,N:N};}
function tcBati(){if(!TC)TC={s:tcPool(1500,'s'),o:tcPool(500,'o'),g:tcPool(900,'g',.2)};return TC;}
function tcRaz(){if(TC)TC.s.n=TC.o.n=TC.g.n=0;}
function tcFin(){if(!TC)return;for(const Y of [TC.s,TC.o,TC.g]){const n=Y.n;Y.m.count=n;Y.m.visible=n>0;
  if(n){Y.m.instanceMatrix.updateRange.count=n*16;Y.m.instanceMatrix.needsUpdate=true;Y.m.instanceColor.updateRange.count=n*3;Y.m.instanceColor.needsUpdate=true;}}}
function tcCoupe(){if(!TC)return;for(const Y of [TC.s,TC.o,TC.g]){Y.n=0;Y.m.count=0;Y.m.visible=false;}}
function tcBox(Y,x,y,z,sx,sy,sz,r,g,b){if(Y.n>=Y.N)return;const o=Y.n*16,M=Y.M,c=Y.n*3; // un cube posé dans le MONDE : centre, côtés sur les axes du monde, couleur
  M[o]=sx;M[o+1]=M[o+2]=M[o+3]=M[o+4]=0;M[o+5]=sy;M[o+6]=M[o+7]=M[o+8]=M[o+9]=0;M[o+10]=sz;M[o+11]=0;M[o+12]=x;M[o+13]=y;M[o+14]=z;M[o+15]=1;
  Y.C[c]=r;Y.C[c+1]=g;Y.C[c+2]=b;Y.n++;}
function tcGlow(x,y,z,s,r,g,b){ // une LUEUR en pixels : trois cubes emboîtés qui s'additionnent — des bandes, pas un dégradé
  const G=TC.g;tcBox(G,x,y,z,s,s,s,r*.8,g*.8,b*.8);tcBox(G,x,y,z,s*.62,s*.62,s*.62,r,g,b);tcBox(G,x,y,z,s*.3,s*.3,s*.3,r,g,b);}
function tcLocal(Y,pm,ox,oy,oz,la,lb,ln,sa,sb,sn,r,g,b){ // un cube dans le repère (long, court, épaisseur) d'une pièce, dont `pm` donne les axes du monde
  TC_O[0]=ox;TC_O[1]=oy;TC_O[2]=oz;TC_O[pm[0]]+=la;TC_O[pm[1]]+=lb;TC_O[pm[2]]+=ln;TC_S[pm[0]]=sa;TC_S[pm[1]]=sb;TC_S[pm[2]]=sn;
  tcBox(Y,TC_O[0],TC_O[1],TC_O[2],TC_S[0],TC_S[1],TC_S[2],r,g,b);}
function tcPart(p,al,E){const T=TC,pv=TRX.C.pv;
  let f=al>=.8?1:al>=.55?.84:al>=.36?.68:al>=.18?.5:0;if(!f)return; // l'ancienne OPACITÉ devient la TAILLE : les cubes fondent par crans
  if(!pv){const c=camera.position,dx=p.x-c.x,dy=p.y-c.y,dz=p.z-c.z,d=Math.sqrt(dx*dx+dy*dy+dz*dz);f*=d<1.8?0:d<2.7?.5:d<3.8?.8:1;if(!f)return;} // près de l'objectif : par crans aussi
  const k=p.cu;
  if(k===1){ // LE PÉTALE : trois cubes plats, qui basculent
    const u0=TC_K.pet*E*(p.c===29?1.45:1),gq=u0*TC_K.pas,ox=Math.round(p.x/gq)*gq,oy=Math.round(p.y/gq)*gq,oz=Math.round(p.z/gq)*gq,
      pm=TC_PERM[((p.a*p.fl*.6+p.fp)|0)&3],mir=((p.fp*13)|0)&1?-1:1,v=p.c-27,s=u0*f*.96;
    for(let i=0;i<3;i++){const c=TC_PET[i],pc=TC_PETC[(c[2]+v)%3];
      tcLocal(T.s,pm,ox,oy,oz,(c[0]-.33)*u0*mir,(c[1]-.33)*u0,0,s,s,s*.42,pc[0]*p.cr,pc[1]*p.cg,pc[2]*p.cb);}
  }else if(k===2){ // LE BILLET : un cadre, un panneau, le médaillon — il se retourne par quarts de tour
    const u=TC_K.bil*E,gq=u*TC_K.pas,ox=Math.round(p.x/gq)*gq,oy=Math.round(p.y/gq)*gq,oz=Math.round(p.z/gq)*gq,pm=TC_PERM[TC_SEQ[((p.a*p.fl*.5+p.fp)|0)%6]],uf=u*f;
    tcLocal(T.s,pm,ox,oy,oz,0,0,0,4.4*uf,2.4*uf,.5*uf,.12,.46,.26);
    tcLocal(T.s,pm,ox,oy,oz,0,0,0,3.6*uf,1.5*uf,.8*uf,.28,.8,.46);
    tcLocal(T.s,pm,ox,oy,oz,0,0,0,1.1*uf,1.1*uf,.98*uf,.8,1.15,.85);
  }else if(k===3){ // L'ÉTINCELLE : une croix de cubes, à la couleur de la particule
    const u=p.w*E*.3,gq=u*TC_K.pas*2,x=Math.round(p.x/gq)*gq,y=Math.round(p.y/gq)*gq,z=Math.round(p.z/gq)*gq,s=u*f,a=s*1.5,r=p.cr*1.1,g=p.cg*1.1,b=p.cb*1.1,s7=s*.7,r7=r*.8,g7=g*.8,b7=b*.8;
    tcBox(T.s,x,y,z,s,s,s,r,g,b);tcBox(T.s,x+a,y,z,s7,s7,s7,r7,g7,b7);tcBox(T.s,x-a,y,z,s7,s7,s7,r7,g7,b7);
    tcBox(T.s,x,y+a,z,s7,s7,s7,r7,g7,b7);tcBox(T.s,x,y-a,z,s7,s7,s7,r7,g7,b7);tcBox(T.s,x,y,z+a,s7,s7,s7,r7,g7,b7);tcBox(T.s,x,y,z-a,s7,s7,s7,r7,g7,b7);
  }else if(k===4)tcGlow(p.x,p.y,p.z,p.w*E*1.3*f,p.cr*.5,p.cg*.5,p.cb*.5);} // L'ÉCLAIR BLANC : une lueur en bandes
function tcBolt(A,n,f,wk){ // UN ÉCLAIR EN CUBES : la ligne brisée posée case par case sur la grille du monde — cœur clair, contour violet, aura
  const C=TRX.C,T=TC,u=TC_K.bolt*wk,gq=1/u,q=f>.75?1:f>.5?.8:f>.3?.62:0;if(!q)return;let lx=1e9,ly=0,lz=0;
  for(let i=0;i+1<n;i++){const o=i*3,ax=A[o]+C.P.x,ay=A[o+1]+C.P.y,az=A[o+2]+C.P.z,dx=A[o+3]+C.P.x-ax,dy=A[o+4]+C.P.y-ay,dz=A[o+5]+C.P.z-az,
      m=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz))*gq));
    for(let s=i?1:0;s<=m;s++){const t=s/m,x=Math.round((ax+dx*t)*gq)/gq,y=Math.round((ay+dy*t)*gq)/gq,z=Math.round((az+dz*t)*gq)/gq;
      if(x===lx&&y===ly&&z===lz)continue;lx=x;ly=y;lz=z;
      tcBox(T.s,x,y,z,u*q,u*q,u*q,1.9,1.75,2.4);tcBox(T.o,x,y,z,u*q*1.75,u*q*1.75,u*q*1.75,.38,.1,.95);tcBox(T.g,x,y,z,u*3.4,u*3.4,u*3.4,.5,.25,1.4);}}}
