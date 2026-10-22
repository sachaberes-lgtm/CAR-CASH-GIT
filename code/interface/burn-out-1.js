/* ===== LE PREMIER BURN-OUT, REVENU (2026-10-08, Léo : « reviens sur le premier burn-out, celui où on ne pouvait pas faire de donuts ;
   reviens sur celui-là et laisse-moi juste faire des donuts avec lui aussi ; reviens sur les premiers petits carrés transparents ; si tu y
   arrives, intègre quelques cubes blancs comme tu as fait là ; remets-le sur le main — la fumée ET le mouvement, les deux »). Ce bloc est
   celui du 05/10 au soir (commit 683984d : la fumée en GROS PIXELS transparents qui s'émiettent, le dérapage au ressort vif ω 7 / ζ ,5, la
   poupe qui chasse, la gomme en pixels, le rupteur), RECOPIÉ tel quel. Ce qui s'y ajoute, et rien d'autre :
   · LES DONUTS (voir LE DOIGT QU'ELLE SUIT, plus bas) : le doigt qui tourne autour d'elle la fait tourner tour pour tour, un petit cercle
     n'importe où aussi (à la vitesse du doigt) ; le ressort d'origine les suit ; en donut le pivot glisse au milieu du plateau, la vue
     recule pour le cadrer ; « DONUT ×n » et un anneau de fumée à chaque tour ;
   · LE VOLUME DE LA FUMÉE (`burnCubes`) : chaque bouffée en pixels porte en elle quelques petits cubes, à sa couleur et sa transparence ;
   · ce qui a été réglé depuis et qui n'est ni la fumée ni le mouvement : 0,8 s de maintien (`BURN_TENU`), le pouce qui peut glisser
     pendant la charge (`BURN_GLISSE`), « PAS ENCORE À TOI », la console de Sacha (`garAtelierLibre`), les feux stop, les pixels du chat.
   Tout le reste du burn-out d'après le 05/10 (fumée en volumes puis en cubes, voile, jet sous la roue, poids, flou des roues…) est dans
   l'historique git (dernier état : commit d6fea98).
   ----- LE BURN-OUT (2026-10-05, Léo : « lorsque j'appuie sur la voiture, au lieu d'ouvrir l'inventaire — qui va être ajouté à côté du
   bouton jouer —, la voiture va booster de manière satisfaisante : c'est un burn-out, puisque sinon elle foncerait. Un effet un peu
   stylé, travaillé, design. Avec des pixels. De la transparence, parce qu'il y aura de la fumée. Maintenue longtemps, la fumée disparaît
   mais peut s'accumuler, et le joueur peut jouer avec. Accordé à ce qu'on a déjà ; si tu surpasses, encore mieux. ») =====
   LE GESTE : le doigt TENU sur la caisse, en vitrine — 0,28 s sans bouger (0,14 s au premier jet), et ça part ; tant qu'il tient, ça brûle. Il peut alors
   GLISSER : la vue tourne autour de la caisse qui fume (et le doigt pousse la fumée). Un tap bref reste le « tonk » de tôle. Lâché : le
   moteur retombe en pétaradant. L'INVENTAIRE a son bouton, COFFRE, à côté de JOUER (et la touche I).
   LA CAISSE : les roues ARRIÈRE patinent (les essieux soudés de l'arrière, voir ESSIEUX), l'avant reste planté ; l'arrière s'écrase, le nez
   se lève, la carrosserie tremble, la poupe chasse de deux degrés ; le plateau s'arrête de tourner ; la caméra vibre à peine.
   LA FUMÉE (BURN.fum) : des bouffées EN PIXELS — chaque quad face caméra est une grille de 7 × 7 cases, ronde aux bords dentelés, dense
   au cœur ; en vieillissant elle s'ÉMIETTE case par case (le pixel art qui se dissout). Éclairée d'en haut, rosie par le feu près de la
   porte, bleuie par l'anneau du plateau au ras du sol. Elle monte, s'étale sous le plafond, vit 6 à 10 s : tenue longtemps, elle REMPLIT
   l'atelier (320 bouffées, recyclées de la plus vieille — le remplissage d'écran d'un téléphone). Le doigt qui GLISSE la pousse (le rayon du doigt dans la salle) ; un tap dans
   la fumée la SOUFFLE. Des quads et non des points WebGL : certains téléphones plafonnent `gl_PointSize` à 64 px.
   LE FEU (BURN.feu) : des pixels ADDITIFS de 3 × 3 (cœur blanc) — pétarades à l'échappement (le rupteur qui bégaie, les crépitements du
   lâcher) et, quand les gommes chauffent (`chaud`, ~3 s), des braises qui giclent des pneus. LES TRACES : deux bandes de gomme sur le
   plateau, qui foncent avec la durée et s'effacent en ~40 s.
   LE SON : le VRAI moteur du palier (ENG_SND — chaque palier son timbre, celui de la course) poussé au RUPTEUR (l'allumage coupe ~8 fois
   par seconde : le « brap-brap »), le crissement de la course (skid) ; au lâcher, ses crépitements (crackle). Aucun nœud neuf : les mêmes
   chaînes, leurs portes s'ouvrent et se referment (voir LES PORTES DU GRAPHE AUDIO).
   Console : dbgBurn() → l'état · dbgBurn(s) → un burn-out de s secondes (sans doigt) · dbgBurn(0) → coupé. */
const BURN={on:false,hold:null,bouge:false,k:0,t:0,chaud:0,rpm:0,son:false,cut:0,pops:[],fum:null,feu:null,gom:null,yaw:0,yawV:0,cib:0,pivK:0,drz:.8,rr:2.4,
  hapT:0,auto:0,autoW:0,ar:[],arW:[],roues:[],pots:[],corps:false,tE:0,tF:0,tP:0, // (2026-10-09) arW déclaré : absent, la 1re CHARGE (doigt tenu avant tout burn-out) jetait « arW is not iterable » à chaque image
  don:0,donK:0,donM:0,acc:0,n:0,nT:0,scx:0,scy:0,fA:null,fR:0,tx:null,ty:0,th:null,tT:0,sT:0,sAu:0,kc:0,mc:0,aideT:0,cad:0,Rs:3, // (2026-10-08) LE DONUT AU DOIGT
  qx:0,qz:0,qvx:0,qvz:0,fsx:0,fsz:0,fsOk:false,sv:null,so:null,sp:null,
  chg:0,nitro:false,recul:false,nk:0,rk:0,rkP:0,dzP:null,nE:0,btn:null, // (2026-10-08) LA CHARGE qui se voit · LA NITRO et LA MARCHE ARRIÈRE (boutons, clavier) // (2026-10-08) LA CAISSE SE BALADE : où elle est partie sur le plateau, sa vitesse, le doigt au sol
  kick:0,feuxK:0,pix:null,gr:null, // ce que le reste du jeu lit (la caméra, les feux stop, le chat) · les cubes blancs
  c:new THREE.Vector3(),
  v:new THREE.Vector3(),w:new THREE.Vector3(),u:new THREE.Vector3(),r:new THREE.Vector3(),q:new THREE.Vector3()};
const BURN_VS='attribute vec3 iP;attribute float iA;attribute float iS;attribute float iG;attribute float iSd;attribute vec3 iC;\n'+
  'varying vec2 vUv;varying float vA;varying float vG;varying float vSd;varying vec3 vC;varying float vY;\n'+
  'void main(){vec4 mv=modelViewMatrix*vec4(iP,1.);mv.xy+=position.xy*iS;gl_Position=projectionMatrix*mv;vUv=uv;vA=iA;vG=iG;vSd=iSd;vC=iC;vY=iP.y;}';
/* LA GRILLE D'ÉCRAN : chaque bouffée est dessinée en GROS PIXELS de `uPx` pixels d'écran (5 px CSS), les MÊMES pour toutes, près ou
   loin — la fumée se lit comme du pixel art, pas comme des tampons flous. On lit l'UV au CENTRE du gros pixel (dérivées : dFdx/dFdy), le
   bruit reste celui de la bouffée (6 × 6 cases) : rien ne scintille quand elle bouge. */
const BURN_FS_FUM='uniform float uY0;uniform vec3 uBleu;uniform float uPx;\n'+
  'varying vec2 vUv;varying float vA;varying float vG;varying float vSd;varying vec3 vC;varying float vY;\n'+
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+vSd*91.7)*43758.5453);}\n'+
  'void main(){if(vA<.003)discard;\n'+
  ' vec2 fc=(floor(gl_FragCoord.xy/uPx)+.5)*uPx-gl_FragCoord.xy;vec2 u=vUv+dFdx(vUv)*fc.x+dFdy(vUv)*fc.y;\n'+
  ' const float G=6.;vec2 c=floor(u*G);float d=length(u-.5)*2.;float r=h(c);\n'+
  ' if(d>.7+.3*r)discard;\n'+                       // le bord dentelé : une bouffée ronde, en cases
  ' if(r<vG*vG*.9)discard;\n'+                      // elle s'émiette case par case en vieillissant
  ' float dens=(1.-d*d*.55)*(.8+.2*h(c+7.3));\n'+
  ' vec3 col=vC*(.74+.34*u.y);\n'+                  // la lumière vient d'en haut
  ' float yb=clamp(1.-(vY-uY0)/1.7,0.,1.);col=mix(col,uBleu,yb*.32*(1.-u.y*.6));\n'+ // au ras du sol, l'anneau du plateau la bleuit
  ' gl_FragColor=vec4(col,vA*dens);}';
const BURN_FS_FEU='varying vec2 vUv;varying float vA;varying float vG;varying float vSd;varying vec3 vC;varying float vY;\n'+
  'void main(){if(vA<.003)discard;vec2 c=floor(vUv*3.);float e=(c.x==1.&&c.y==1.)?1.:.5;gl_FragColor=vec4(vC*e,vA*e);}';
function burnPool(N,additif,frag){
  const base=new THREE.PlaneGeometry(1,1),g=new THREE.InstancedBufferGeometry();
  g.index=base.index;g.setAttribute('position',base.attributes.position);g.setAttribute('uv',base.attributes.uv);
  const P=new Float32Array(N*3),A=new Float32Array(N),S=new Float32Array(N),G=new Float32Array(N),Sd=new Float32Array(N),C=new Float32Array(N*3);
  for(let i=0;i<N;i++){P[i*3+1]=-1e4;Sd[i]=Math.random();}
  const ia=function(a,n){const x=new THREE.InstancedBufferAttribute(a,n);x.setUsage(THREE.DynamicDrawUsage);return x;};
  g.setAttribute('iP',ia(P,3));g.setAttribute('iA',ia(A,1));g.setAttribute('iS',ia(S,1));g.setAttribute('iG',ia(G,1));
  g.setAttribute('iSd',new THREE.InstancedBufferAttribute(Sd,1));g.setAttribute('iC',ia(C,3));g.instanceCount=N;
  const m=new THREE.ShaderMaterial({uniforms:{uY0:{value:GARAGE_Y},uBleu:{value:new THREE.Color(.34,.8,1)},uPx:{value:5}},vertexShader:BURN_VS,fragmentShader:frag,
    transparent:true,depthWrite:false,blending:additif?THREE.AdditiveBlending:THREE.NormalBlending,extensions:{derivatives:true}});
  const o=new THREE.Mesh(g,m);o.frustumCulled=false;o.renderOrder=additif?9:8;o.visible=false;scene.add(o);
  return {o:o,g:g,N:N,P:P,A:A,S:S,G:G,C:C,V:new Float32Array(N*3),age:new Float32Array(N).fill(1e9),life:new Float32Array(N).fill(1),
    s0:new Float32Array(N),s1:new Float32Array(N),op:new Float32Array(N),c0:new Float32Array(N*3),i:0,n:0,feu:!!additif};
}
function burnEmet(F,x,y,z,vx,vy,vz,life,s0,s1,op,r,gg,b){
  const i=F.i;F.i=(F.i+1)%F.N;const j=i*3;if(F===BURN.fum&&F.age[i]<F.life[i]&&F.A[i]>.05)BURN.brusque=(BURN.brusque|0)+1; // (le banc) une bouffée ENCORE VISIBLE reprise d'un coup
  F.P[j]=x;F.P[j+1]=y;F.P[j+2]=z;F.V[j]=vx;F.V[j+1]=vy;F.V[j+2]=vz;F.age[i]=0;F.life[i]=life;F.s0[i]=s0;F.s1[i]=s1;F.op[i]=op;
  F.c0[j]=r;F.c0[j+1]=gg;F.c0[j+2]=b;F.o.visible=true;
}
function burnPas(F,dt,t){ // fait vivre un réservoir : âge, mouvement, taille, opacité, couleur — rend le nombre de vivants
  const ay=GARAGE_Y,yMax=ay+GAR.H-.45,hw=GAR.W/2-.5,hd=GAR.D/2-.4;let n=0;
  const dr=Math.exp(-dt*(F.feu?2.4:1.15));
  for(let i=0;i<F.N;i++){
    const j=i*3;if(F.age[i]>=F.life[i]){if(F.P[j+1]>-1e3){F.P[j+1]=-1e4;F.A[i]=0;}continue;}
    n++;const a=F.age[i]+=dt,g=Math.min(1,a/F.life[i]);
    let vx=F.V[j]*dr,vy=F.V[j+1],vz=F.V[j+2]*dr;
    if(F.feu)vy=vy*dr-(F.arc?1.6:5.5)*dt;                             // les braises retombent (les pixels du chat flottent)
    else{vy+=(.38-vy)*Math.min(1,dt*.7);                              // la fumée MONTE, sans se presser
      vx+=Math.sin(t*.8+F.S[i]*3.1+F.P[j+1]*.9+i)*.34*dt;vz+=Math.cos(t*.67+i*.37+F.P[j]*.7)*.34*dt;} // et tourbillonne
    let x=F.P[j]+vx*dt,y=F.P[j+1]+vy*dt,z=F.P[j+2]+vz*dt;
    if(y>yMax){y=yMax;if(vy>0)vy=0;vx+=x*.05*dt;vz+=z*.05*dt;}         // sous le plafond, elle s'étale
    if(y<ay+.04){y=ay+.04;if(vy<0)vy*=F.feu?-.35:0;}
    if(x>hw||x<-hw){x=Math.max(-hw,Math.min(hw,x));vx*=-.3;}
    if(z>hd||z<-hd){z=Math.max(-hd,Math.min(hd,z));vz*=-.3;}
    F.P[j]=x;F.P[j+1]=y;F.P[j+2]=z;F.V[j]=vx;F.V[j+1]=vy;F.V[j+2]=vz;F.G[i]=g;
    if(F.arc){F.S[i]=F.s0[i];F.A[i]=(Math.random()<.2?0:1)*Math.pow(1-g,.7)*F.op[i];F.C[j]=F.c0[j];F.C[j+1]=F.c0[j+1];F.C[j+2]=F.c0[j+2];} // le chat : ils SCINTILLENT et gardent leur couleur
    else if(F.feu){F.S[i]=F.s0[i]*(1-.5*g);F.A[i]=Math.pow(1-g,1.4)*F.op[i];
      F.C[j]=F.c0[j]+(1-F.c0[j])*g*.2;F.C[j+1]=F.c0[j+1]*(1-.75*g);F.C[j+2]=F.c0[j+2]*(1-.9*g);}   // blanc-jaune → orange → rouge
    else{F.S[i]=F.s0[i]+(F.s1[i]-F.s0[i])*(1-Math.exp(-a*.55));
      F.A[i]=Math.min(1,a/.25)*Math.pow(1-g,1.3)*F.op[i];
      if(F===BURN.fum&&BURN.hor&&a>.6*BURN.hor)F.A[i]*=Math.max(0,1-(a-.6*BURN.hor)/(.4*BURN.hor)); // près d'être reprise : elle s'efface (L'HORIZON)
      const w=Math.max(0,Math.min(1,(z-4)/8))*.5;                     // près de la porte, le feu la rosit
      F.C[j]=F.c0[j]+(1-F.c0[j])*w;F.C[j+1]=F.c0[j+1]+(.6-F.c0[j+1])*w;F.C[j+2]=F.c0[j+2]+(.46-F.c0[j+2])*w;}
  }
  F.n=n;const at=F.g.attributes;at.iP.needsUpdate=true;at.iA.needsUpdate=true;at.iS.needsUpdate=true;at.iG.needsUpdate=true;at.iC.needsUpdate=true;
  if(!n)F.o.visible=false;
  return n;
}
function burnMonde(x,y,z,out){out.set(x,y,z);carGroup.localToWorld(out);return out;} // un point de la caisse, dans la salle
/* LA FUMÉE QUI S'EFFACE (2026-10-08, Léo : « la fumée disparaît progressivement ; là, à un certain niveau, il y en a qui disparaît très
   rapidement — équilibre : que le joueur puisse faire pas mal de fumée, mais que ce ne soit pas trop facile de tout remplir »). Le réservoir
   recyclait la plus vieille bouffée d'un coup : avec 320 bouffées et ~116 par seconde quand les pneus sont chauds, une bouffée vivait 2,8 s
   au lieu de ses 6-10 s, et DISPARAISSAIT d'une image à l'autre. Désormais `N` bouffées, et L'HORIZON : le débit lissé (`BURN.deb`) dit dans
   combien de temps une bouffée sera reprise (`BURN.hor` ≈ ,92 N / débit — il raccourcit vite, s'allonge lentement) ; passé 60 % de cet
   horizon elle s'EFFACE, et n'est plus là quand on la reprend. Au repos du pied, l'horizon dépasse sa vie : rien ne change. Au plus fort, ~4 s
   de fumée visible : beaucoup, sans remplir tout l'atelier. */
const BURN_FUM={N:680,deb:[60,90]}; // (2026-10-08, Léo : « un peu plus de fumée ») débit ×1,3 (46 + 70·chaud → 60 + 90·chaud bouffées/s) ET réservoir ×1,3 (520 → 680) : ~30 % de fumée en plus à l'écran, le même horizon (~4 s au plus fort) — pas plus facile de remplir l'atelier
function burnPools(){ // les réservoirs (la fumée en pixels, le feu, les pixels du chat, les cubes blancs) — créés par la chauffe de l'atelier : rien ne compile au 1er burn-out
  if(!BURN.fum){BURN.fum=burnPool(BURN_FUM.N,false,BURN_FS_FUM);BURN.feu=burnPool(180,true,BURN_FS_FEU);}
  if(!BURN.pix){BURN.pix=burnPool(520,true,BURN_FS_FEU);BURN.pix.arc=true;} // (2026-10-06) les PIXELS du chat pop-tart (voir NY_PIX)
  burnCubesInit();
  return [BURN.fum.o,BURN.feu.o,BURN.pix.o].concat(BURN.gr.M);
}
function burnPrepare(){ // à chaque départ : les essieux de l'arrière, les pneus, les pots — la caisse a pu changer
  burnPools();
  BURN.ar=ESSIEUX.filter(function(E){return E.position.z<0;});
  BURN.roues=[];
  for(const w of wheels)if(w.position.z<0)BURN.roues.push({x:w.position.x,y:w.position.y-(w.userData.R||.4),z:w.position.z,R:w.userData.R||.4,l:w.userData.large||.3});
  const G=garGabarit();
  if(!BURN.roues.length)for(const sx of [-1,1])BURN.roues.push({x:sx*G.b*.75,y:0,z:-G.a*.6,R:.4,l:.3});
  if(!BURN.ar.length)BURN.arW=wheels.filter(function(w){return w.position.z<0&&w.parent;});else BURN.arW=[];
  const px=Math.min(.42,G.b*.32);BURN.pots=[[-px,.3,-G.a+.08],[px,.3,-G.a+.08]];
  BURN.drz=Math.min(.9,G.a*.4);BURN.rr=Math.hypot(G.a,G.b);BURN.ga=G.a;BURN.gb=G.b; // le PIVOT du dérapage (vers l'avant : l'arrière balaie) · le rayon de la caisse
  BURN.Rs=Math.min(4.4,BURN.drz*(2-DON_PIV.donMax)+DON_PIV.glisse+BURN.rr+.2); // (le donut) le cercle le plus large que balaie un coin (pivot devant, glisse comprise) — la vue recule pour le cadrer (`garBurnR`)
  burnGommeInit();
}
/* LA PISTE DE GOMME (même soir, avec le DÉRAPAGE) : une toile de 128 × 128 sur tout le plateau (un texel ≈ 7 cm : des traces en PIXELS),
   posée sur `GAR.pod` (elle tourne avec lui) ; chaque image de burn-out, les roues arrière y déposent de la gomme là où elles SONT — sur place
   ça noircit sous les pneus, en dérapage ça dessine les DONUTS. Elle s'efface en ~45 s (alpha décrémenté une fois par seconde : la
   composition `destination-out` resterait bloquée par l'arrondi sur 8 bits). */
function burnGommeInit(){
  if(BURN.gom||!GAR.pod)return;const N=128,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');
  const tex=new THREE.CanvasTexture(cv);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;
  const m=new THREE.Mesh(new THREE.CircleGeometry(4.4,48),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,fog:false,opacity:.9}));
  m.rotation.x=-Math.PI/2;m.position.y=GAR.POD+.004;m.renderOrder=1;GAR.pod.add(m);
  BURN.gom={cv:cv,x:x,tex:tex,m:m,N:N,sale:false,tF:0};
}
/* LA GOMME DU TAIL WHIP (2026-10-22, Sacha : « une trace de pneus sur le sol, comme pour les donuts ») : l'essai d'une figure À PLAT à l'inventaire pose la
   caisse sur le plateau ; les QUATRE pneus y laissent la même gomme que le donut (même toile), d'un point à l'autre (rien ne saute quand ça va vite). */
const GFGOM={p:null};
function garFigGomme(dt,marque){
  if(!GAR.pod)return;if(!BURN.gom)burnGommeInit();const G=BURN.gom;if(!G)return;
  if(!marque){GFGOM.p=null;return;}
  GAR.pod.updateMatrixWorld();const L=[];
  for(const w of wheels){if(!w||!w.position)continue;const R=w.userData.R||.4,v=new THREE.Vector3(w.position.x,w.position.y-R+.02,w.position.z);carGroup.localToWorld(v);GAR.pod.worldToLocal(v);L.push([v.x,v.z,Math.max(2,Math.round((w.userData.large||.3)/.069))]);}
  const P=GFGOM.p;GFGOM.p=L;
  G.x.fillStyle='rgba(12,9,14,.42)';
  for(let i=0;i<L.length;i++){const a=P&&P.length===L.length?P[i]:L[i],b=L[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.05));
    for(let k=1;k<=n;k++){const t=k/n,px=((a[0]+(b[0]-a[0])*t)/8.8+.5)*G.N,py=((a[1]+(b[1]-a[1])*t)/8.8+.5)*G.N;G.x.fillRect(Math.round(px-b[2]/2),Math.round(py-b[2]/2),b[2],b[2]);}}
  G.sale=true;G.tex.needsUpdate=true;
}
function burnGomme(dt){
  const G=BURN.gom;if(!G)return;
  if(BURN.k>.25&&!GAR.go&&BURN.roues.length){GAR.pod.updateMatrixWorld();
    G.x.fillStyle='rgba(12,9,14,'+(.1+.14*BURN.k).toFixed(3)+')';
    for(const r of BURN.roues){const w=burnMonde(r.x,r.y+.02,r.z,BURN.q);GAR.pod.worldToLocal(w);
      const px=(w.x/8.8+.5)*G.N,py=(w.z/8.8+.5)*G.N,t9=Math.max(2,Math.round(r.l/.069));G.x.fillRect(Math.round(px-t9/2),Math.round(py-t9/2),t9,t9);}
    G.sale=true;G.tex.needsUpdate=true;}
  G.tF+=dt;if(G.sale&&G.tF>1){G.tF=0;const im=G.x.getImageData(0,0,G.N,G.N),d=im.data;let reste=0;
    for(let i=3;i<d.length;i+=4)if(d[i]){d[i]=Math.max(0,d[i]-5);reste|=d[i];}
    G.x.putImageData(im,0,0);G.tex.needsUpdate=true;if(!reste)G.sale=false;}
}
function burnPop(f){ // une PÉTARADE : du feu en pixels qui crache des pots, et une bouffée sombre
  if(!BURN.feu||!BURN.pots.length)return;
  const fw=BURN.u.set(Math.sin(carGroup.rotation.y),0,Math.cos(carGroup.rotation.y));
  for(const p of BURN.pots){const o=burnMonde(p[0],p[1],p[2],BURN.q);
    const n=Math.round(10+14*f);for(let i=0;i<n;i++){const v=3+Math.random()*5*f;
      if(NYAN.on&&BURN.pix){const c=nyanPixC();burnEmet(BURN.pix,o.x,o.y,o.z,-fw.x*v+(Math.random()-.5)*2,.4+Math.random()*1.6,-fw.z*v+(Math.random()-.5)*2,.4+Math.random()*.45,.07+Math.random()*.06,0,1,c[0],c[1],c[2]);continue;} // le chat pétarade en PIXELS
      burnEmet(BURN.feu,o.x,o.y,o.z,-fw.x*v+(Math.random()-.5)*1.6,.3+Math.random()*1.3,-fw.z*v+(Math.random()-.5)*1.6,.2+Math.random()*.26,.12+Math.random()*.12,0,1,1,.86+Math.random()*.14,.5+Math.random()*.35);}
    burnEmet(BURN.fum,o.x,o.y,o.z,-fw.x*1.4,.3,-fw.z*1.4,2.8+Math.random()*1.5,.28,.8,.3,.42,.4,.47);}
}
/* (2026-10-07, Léo : « il n'y a que les voitures qu'on possède qui peuvent faire le burn-out ») — la caisse du plateau doit être À TOI ou
   celle que tu as ÉQUIPÉE ; sinon le doigt tenu ne fait pas partir le moteur : le cadenas parle et le relâcher est avalé. */
try{Object.assign(I18N,{'PAS ENCORE À TOI':'NOT YOURS YET'});}catch(e){}
function burnPermis(){const i=garageI|0;return carUnlockedVrai(i)||i===equippedCar();}
function burnRefus(){ // le doigt a tenu sur une caisse qui n'est pas à toi
  uiClic('refus');toast(pxi('verrou')+' '+TR('PAS ENCORE À TOI'));
  const b=[$('gBuy'),$('gEquip')].find(function(x){return x&&x.offsetParent;});if(b)gSecoue(b);else hap([8,40,8]);
}
function burnDebut(e){ // pointerdown : le doigt se pose sur la caisse
  if(BURN.hold||GAR.go||GAR.sw||!garAtelierLibre()||(INV&&INV.on)||GATL.on)return; /* (2026-10-12) l'ATELIER FERMÉ : la caisse tenue par les pinces se tourne, c'est tout */ /* (2026-10-06) aussi dans la console de Sacha */
  if(e.button>0||!garSurCaisse(e))return;
  BURN.hold={id:e.pointerId,x:e.clientX,y:e.clientY,t0:performance.now(),non:!burnPermis()};BURN.bouge=false; // `non` : pas à toi, pas de burn-out
}
function burnPart(){ // ça part : le doigt a tenu
  if(BURN.on)return;burnPrepare();BURN.on=true;BURN.t=0;BURN.pops.length=0;BURN.corps=true;
  BURN.acc=BURN.n=0;BURN.fA=null;BURN.tx=null;BURN.th=null;BURN.sT=BURN.sAu=BURN.kc=BURN.mc=0;BURN.fsOk=false;if(BURN.pivK<.01)BURN.qx=BURN.qz=BURN.qvx=BURN.qvz=0;try{burnCentre();}catch(_){} // (le donut) le centre du VOLANT du doigt : le milieu du plateau, à l'écran
  hap([14,30,10]);try{burnPop(.75);burnAnneau(.5);}catch(_){} // (2026-10-08) le départ se VOIT : une pétarade et un anneau de fumée
  if(!((SAVE.d.ast|0)&8)){SAVE.d.ast=(SAVE.d.ast|0)|8;try{SAVE.mark();}catch(_){}if(gEl)gEl.classList.remove('aideInv');} // l'astuce a servi
}
function burnFin(){ // le doigt se lève (ou la vitrine se ferme) : le moteur retombe en pétaradant
  const etait=BURN.on;BURN.hold=null;BURN.on=false;BURN.auto=0;BURN.autoW=0;BURN.nitro=BURN.recul=false;
  if(etait){const n=performance.now();BURN.pops=[n+70,n+250,n+450,n+720].slice(0,2+Math.round(2*Math.min(1,BURN.t/1.5)));}
}
function burnCoupe(){ // l'atelier se ferme : silence, plus rien à l'écran
  burnFin();BURN.k=0;BURN.rpm=0;BURN.pops.length=0;
  if(BURN.yaw){garageAng-=BURN.yaw;GAR.podSpin=(GAR.podSpin||0)-BURN.yaw;}BURN.yaw=BURN.yawV=BURN.cib=BURN.pivK=0;BURN.qx=BURN.qz=BURN.qvx=BURN.qvz=0;BURN.chg=BURN.nk=BURN.rk=0;BURN.dzP=null;burnBtnsVoir(false);
  BURN.don=BURN.donK=BURN.donM=BURN.acc=BURN.n=BURN.cad=BURN.feuxK=0;const bt=document.getElementById('gBurnTxt');if(bt)bt.classList.remove('on','on2');
  for(const F of [BURN.fum,BURN.feu,BURN.pix])if(F){F.age.fill(1e9);burnPas(F,0,0);F.o.visible=false;}
  if(BURN.gr)for(const im of BURN.gr.M){im.count=0;im.visible=false;}
  if(BURN.corps){carBody.rotation.set(0,0,0);carBody.position.set(0,0,0);BURN.corps=false;}
  if(AC&&BURN.son){const T=AC.currentTime;stt(gainN.gain,0,T,.06);stt(engLfoG.gain,0,T,.06);if(skidG)stt(skidG.gain,0,T,.05);BURN.son=false;}
}
const BURN_DOIGT=false; // (2026-10-08, Léo : « ce n'est plus le doigt qui agit sur la fumée, mais bien la voiture elle-même ») le GLISSÉ ne la pousse plus (`true` le rend) — voir LA CAISSE DANS LA FUMÉE
const BURN_SOUFFLE={on:true,vieillit:.45}; // (même soir, Léo : « quand on tapote avec le doigt, ça disperse la fumée ») le TAP revient seul : il souffle la fumée sous le doigt (elle s'écarte du point touché, file un peu vers le fond, monte) et la DISPERSE — chaque bouffée touchée avance vers la fin de sa vie de `vieillit` × ce qui lui reste (× la force du coup) : elle s'éclaircit et s'émiette au lieu de seulement bouger
function burnDoigt(cx,cy,dx,dy,souffle){ // le DOIGT dans la fumée : il la pousse (glissé) ou la souffle (tap)
  if(souffle?!BURN_SOUFFLE.on:!BURN_DOIGT)return false;
  const F=BURN.fum;if(!F||!F.n)return false;
  const o=camera.position,v=BURN.v.set(cx/VP.w*2-1,-(cy/VP.h)*2+1,.5).unproject(camera).sub(o).normalize();
  const R=BURN.r.setFromMatrixColumn(camera.matrixWorld,0),U=BURN.w.setFromMatrixColumn(camera.matrixWorld,1);
  const tg=Math.tan(camera.fov*Math.PI/360)*2/Math.max(1,VP.h);let touche=0;
  for(let i=0;i<F.N;i++){if(F.age[i]>=F.life[i])continue;const j=i*3;
    const px=F.P[j]-o.x,py=F.P[j+1]-o.y,pz=F.P[j+2]-o.z,t=px*v.x+py*v.y+pz*v.z;if(t<.4)continue;
    const qx=px-v.x*t,qy=py-v.y*t,qz=pz-v.z*t,d=Math.sqrt(qx*qx+qy*qy+qz*qz),rad=.9+.09*t+F.S[i]*.5;if(d>rad)continue;
    const f=1-d/rad;touche++;
    if(souffle){const k=3.2*f/Math.max(.05,d);F.V[j]+=qx*k+v.x*f*1.8;F.V[j+1]+=qy*k+v.y*f*1.8+.4*f;F.V[j+2]+=qz*k+v.z*f*1.8;F.age[i]+=(F.life[i]-F.age[i])*BURN_SOUFFLE.vieillit*f;}
    else{const k=f*t*tg*9;F.V[j]+=(R.x*dx-U.x*dy)*k;F.V[j+1]+=(R.y*dx-U.y*dy)*k;F.V[j+2]+=(R.z*dx-U.z*dy)*k;}}
  return touche>0;
}
/* LE DOIGT QU'ELLE SUIT — LES DONUTS (2026-10-08, sur le premier burn-out ; même lecture du doigt que la veille). Trois lectures du doigt,
   mélangées : (1) LE VOLANT — l'angle du doigt AUTOUR DU MILIEU DU PLATEAU, tour pour tour (le bout de la caisse le plus près du doigt le
   suit ; près du milieu, sous `DON.plein` px, la direction du trait le remplace) ; (2) LE DONUT À LA VITESSE DU DOIGT — le doigt qui tourne
   SUR LUI-MÊME ailleurs (un petit cercle, n'importe où) la fait tourner dans son sens à `DON.kv` rad par px parcouru ; (3) LE GLISSÉ
   D'ORIGINE (,009 rad par px, `DON.derape`) — ce qui ne tourne ni autour d'elle ni sur lui-même : le dérapage du premier burn-out. Le doigt
   ne pose qu'un CAP (`BURN.cib`) : c'est le ressort d'origine (burnDerape) qui la fait tourner, part, dépasse et revient. */
const BURN_GLISSE=24; // tenu 0,8 s, un pouce posé GLISSE de plus de 12 px : pendant la charge on tolère 24 px (une fois parti, 12 px = « le doigt bouge »)
const BURN_TENU=950;  // (Léo, 2026-10-07/08) le maintien qui déclenche le burn-out : 280 ms → 500 → 1 500 → 1 000 → 800 → 950 (même soir, Léo : « dès qu'on appuie longtemps, ça fait le burn, même quand on tourne la voiture — ça prend un tout petit peu plus de temps, mais ça se voit et se ressent plus » : voir LA CHARGE)
const DON={mort:16,plein:44,gain:1,kv:1/70,avance:1.6,derape:.009,pitch:.06};
function burnCentre(){ // le centre du VOLANT : le milieu du plateau, à mi-hauteur de caisse, à l'écran
  const v=BURN.c;if(GAR.pod)GAR.pod.getWorldPosition(v);else carGroup.getWorldPosition(v);v.y=GARAGE_Y+.55;v.project(camera);
  BURN.scx=(v.x*.5+.5)*VP.w;BURN.scy=(.5-v.y*.5)*VP.h;
}
function burnVolant(v){ // le volant bridé : jamais plus de `avance` rad devant la caisse (ce qui dépasse est perdu, rien ne tourne longtemps après le doigt)
  const e=BURN.cib-BURN.yaw;if(v>0)v=Math.max(0,Math.min(v,DON.avance-e));else if(v<0)v=Math.min(0,Math.max(v,-DON.avance-e));BURN.cib+=v;
}
function burnSol(cx,cy){ // (2026-10-08) où le doigt touche le PLATEAU (à mi-hauteur de caisse), dans le repère de la caisse au repos (celui de `burnDerape`)
  const v=BURN.sv||(BURN.sv=new THREE.Vector3()),o=BURN.so||(BURN.so=new THREE.Vector3()),p=BURN.sp||(BURN.sp=new THREE.Vector3());
  v.set(cx/VP.w*2-1,1-cy/VP.h*2,.5).unproject(camera);camera.getWorldPosition(o);v.sub(o);if(v.y>-1e-4||!GAR.pod)return;
  const t=(GARAGE_Y+.55-o.y)/v.y;GAR.pod.getWorldPosition(p);const dx=o.x+v.x*t-p.x,dz=o.z+v.z*t-p.z,r=garRot(),cr=Math.cos(r),sr=Math.sin(r);
  BURN.fsx=dx*cr-dz*sr;BURN.fsz=dx*sr+dz*cr;BURN.fsOk=true;
}
function burnGeste(dx,dy,cx,cy){ // le doigt bouge pendant le burn-out (dx, dy : depuis le mouvement d'avant ; cx, cy : où il est)
  const n=performance.now();try{burnCentre();burnSol(cx,cy);}catch(_){} // le milieu du plateau à l'écran (la vue recule pendant le donut)
  const rx=cx-BURN.scx,ry=cy-BURN.scy,r=Math.hypot(rx,ry),a=Math.atan2(ry,rx);
  const w=BURN.fA==null?0:Math.max(0,Math.min(1,(Math.min(r,BURN.fR)-DON.mort)/(DON.plein-DON.mort)));
  const dA=BURN.fA==null?0:Math.atan2(Math.sin(a-BURN.fA),Math.cos(a-BURN.fA));BURN.fA=a;BURN.fR=r;
  const ds=Math.hypot(dx,dy),tg=Math.min(1,Math.abs(dA)*r/Math.max(1e-3,ds));   // la part du geste qui TOURNE autour du plateau
  if(BURN.tx==null){BURN.tx=cx;BURN.ty=cy;BURN.th=null;}
  const sx=cx-BURN.tx,sy=cy-BURN.ty;let dT=0;
  if(sx*sx+sy*sy>=16){const h=Math.atan2(sy,sx);                         // LE TRAIT, tous les 4 px
    if(BURN.th!=null){dT=Math.atan2(Math.sin(h-BURN.th),Math.cos(h-BURN.th));if(Math.abs(dT)>2.2)dT=0;} // un aller-retour n'est pas un virage
    BURN.th=h;BURN.tx=cx;BURN.ty=cy;}
  const dtm=Math.min(.25,(n-(BURN.tT||n))/1000),e9=Math.exp(-dtm/.3);BURN.tT=n;
  BURN.sT*=e9;BURN.sAu*=e9;const aT=Math.abs(BURN.sT);                    // ce que le trait a tourné, et le doigt autour d'elle, sur ~0,3 s
  const kT=Math.max(0,Math.min(1,(aT-.45)/.4)),gT=aT>.05?Math.max(0,Math.min(1,(Math.abs(BURN.sAu)/aT-.35)/.4)):1; // le trait TOURNE · … autour d'elle
  BURN.kc+=(kT-BURN.kc)*Math.min(1,dtm/.12);BURN.mc+=(kT*(1-gT)-BURN.mc)*Math.min(1,dtm/.12); // jugés AVANT ce pas (un coin n'est pas un cercle)
  const k=BURN.kc,m=BURN.mc;
  BURN.sT+=Math.max(-.35,Math.min(.35,dT));BURN.sAu+=dA;
  const P=dA*w+dT*(1-w),S=(BURN.sT<0?-1:1)*ds*DON.kv;                     // (1) le volant · (2) la vitesse du doigt
  const v=-((1-m)*P+m*S)*DON.gain;if(v)burnVolant(v);                     // le doigt dans le sens des aiguilles (à l'écran) = la caisse aussi, vue d'en haut
  BURN.cib+=dx*DON.derape*(1-w*tg)*(1-k);                                // (3) LE GLISSÉ D'ORIGINE : elle DÉRAPE — et tout, près du centre
}
function garBurnR(x){const c=BURN.cad||0;return c>.001?x+(Math.max(x,BURN.Rs*.92)-x)*c:x;} // le recul de l'atelier : en donut, le cercle balayé tient dans la place libre
function burnTxt(txt,col,lent){ // un mot qui jaillit au-dessus de la caisse, et s'envole
  let e=document.getElementById('gBurnTxt');
  if(!e){e=document.createElement('div');e.id='gBurnTxt';e.setAttribute('aria-hidden','true');document.body.appendChild(e);}
  let r=null;try{r=garCaisseRect();}catch(_){}
  const x=r?(r.x0+r.x1)/2:VP.w/2,y=r?Math.max(40,r.y0-8):VP.h*.4;
  e.textContent=TR(txt);e.style.setProperty('--bc',col||'#ffd75e');e.style.left=Math.round(Math.max(60,Math.min(VP.w-60,x)))+'px';e.style.top=Math.round(y)+'px';
  e.classList.toggle('lent',!!lent);e.classList.toggle('calme',!!REDUCED_MOTION);
  const k=burnTxt._k=!burnTxt._k;e.classList.remove(k?'on':'on2');e.classList.add(k?'on2':'on'); // deux animations jumelles : relance sans remise en page
}
function burnAnneau(f){ // un ANNEAU de fumée en pixels qui s'ouvre autour de la caisse
  const F=BURN.fum;if(!F)return;const c=BURN.c;carGroup.updateMatrixWorld();carGroup.getWorldPosition(c);
  const N=Math.round(16*f),R=BURN.rr*.65;
  for(let i=0;i<N;i++){const a=(i+Math.random()*.4)/N*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),v=(2.4+Math.random()*1.2)*f;
    burnEmet(F,c.x+ca*R,GARAGE_Y+.3,c.z+sa*R,ca*v,.12+Math.random()*.3,sa*v,3+Math.random()*1.6,.38,1.2+.4*f,.24,.8,.78,.88);}
}
function burnBravo(){ // un tour complet : le mot, l'anneau, la pétarade, le pouce
  const n=performance.now(),N=BURN.n;
  burnTxt(N>1?TR('DONUT')+' ×'+N:'DONUT !',N>=5?'#ff7ad9':N>=3?'#ff9a3c':'#ffd75e');burnAnneau(Math.min(1.5,.75+.12*N));BURN.pops.push(n+30);hap([10,24,10]);
  if(!((SAVE.d.ast|0)&16)){SAVE.d.ast=(SAVE.d.ast|0)|16;try{SAVE.mark();}catch(_){}} // le 1er donut : l'astuce a servi
  BURN.pops.sort(function(a,b){return a-b;});
}
function burnTours(dt){ // compte les tours complets du donut (dans un sens : repartir dans l'autre recommence le compte)
  if(BURN.donK>.12&&BURN.on){const sg=Math.sign(BURN.don);if(BURN.acc&&Math.sign(BURN.acc)!==sg){BURN.acc=0;BURN.n=0;}
    BURN.acc+=BURN.yawV*dt;BURN.nT=0;
    if(Math.abs(BURN.acc)>=2*Math.PI){BURN.acc-=sg*2*Math.PI;BURN.n++;burnBravo();}}
  else{BURN.nT+=dt;if(BURN.nT>.9){BURN.acc=0;BURN.n=0;}}
}
Object.assign(I18N,{'DONUT !':'DONUT!','TOURNE AUTOUR · DONUT':'CIRCLE AROUND · DONUT'});
/* LE VOLUME DE LA FUMÉE (2026-10-08, Léo : « les cubes blancs ne doivent pas être une entité séparée de la première fumée : qu'ils
   l'ENRICHISSENT, pour lui donner du volume — sinon ça fait deux fumées différentes ; une seule, avec les deux »). Les cubes n'ont plus de
   vie à eux : chaque image, chaque BOUFFÉE en pixels vivante porte en elle `BURN_CUB.par` petits cubes — placés DANS sa boule (des
   écarts tirés de sa graine, donc fixes pour elle : ils bougent avec elle), à SA couleur (le rose de la porte, le bleu du plateau au ras du
   sol compris), à SA transparence (une bande d'opacité par cran de son alpha) et à sa taille (un cinquième de la bouffée, ≤ 30 cm, sur une
   grille de 6 cm : des pixels en volume) ; quand la bouffée s'ÉMIETTE case par case, ses cubes s'en vont avec elle, par la même règle
   (hachage < âge² × ,9). Ombrés comme les flammes de la porte (dessus clair, flancs, dessous sombre) : la lumière d'en haut de la fumée.
   La même matière que les cubes de la porte : rien de compilé. */
const BURN_CUB={par:3,N:700,bandes:[.36,.26,.18,.12,.07],seuils:[.27,.19,.13,.085,.045],taille:[.24,.19,.15]};
function burnCubesInit(){
  if(BURN.gr)return;const bx=new THREE.BoxGeometry(1,1,1),ps=bx.attributes.position,nm=bx.attributes.normal,cl=new Float32Array(ps.count*3);
  for(let i=0;i<ps.count;i++){const v=nm.getY(i)>.5?1.06:nm.getY(i)<-.5?.6:Math.abs(nm.getX(i))>.5?.8:.9;cl[i*3]=cl[i*3+1]=cl[i*3+2]=v;}
  bx.setAttribute('color',new THREE.BufferAttribute(cl,3));
  const M=[];for(const op of BURN_CUB.bandes){const im=new THREE.InstancedMesh(bx,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false,transparent:true,opacity:op,depthWrite:false}),BURN_CUB.N);
    im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(BURN_CUB.N*3),3);im.count=0;im.frustumCulled=false;im.renderOrder=8;im.visible=false;scene.add(im);M.push(im);}
  BURN.gr={M:M,n:new Int32Array(M.length),m:new THREE.Matrix4()};
}
function burnCubes(){ // chaque image : les cubes DE la fumée, tirés des bouffées vivantes
  const G=BURN.gr,F=BURN.fum;if(!G)return;const Q=BURN_CUB,n=G.n,m=G.m,nb=G.M.length,y0=GARAGE_Y;n.fill(0);
  if(F&&F.o.visible){const sd=F.g.attributes.iSd.array;
    for(let i=0;i<F.N;i++){if(F.age[i]>=F.life[i])continue;const A=F.A[i];let b=-1;for(let q=0;q<nb;q++)if(A>Q.seuils[q]){b=q;break;}if(b<0)continue;
      const j=i*3,s=F.S[i],g=F.G[i],q=sd[i],yb=Math.max(0,Math.min(1,1-(F.P[j+1]-y0)/1.7))*.28;
      const r=F.C[j]+(.34-F.C[j])*yb,gg=F.C[j+1]+(.8-F.C[j+1])*yb,bl=F.C[j+2]+(1-F.C[j+2])*yb; // sa couleur (au ras du sol, le bleu du plateau)
      for(let c=0;c<Q.par;c++){let h=Math.sin(q*91.7+c*12.9898)*43758.5453;h-=Math.floor(h);if(h<g*g*.9)continue; // il s'émiette AVEC elle
        const a1=q*6.283+c*2.094,rr=s*(.08+.17*((h*7.3)%1)),S=Math.min(.3,s*Q.taille[c]),gp=.06;
        const x=F.P[j]+Math.cos(a1)*rr,y=F.P[j+1]+(((h*3.1)%1)-.45)*s*.3,z=F.P[j+2]+Math.sin(a1)*rr;
        const bb=Math.min(nb-1,b+(c>1?1:0)),im=G.M[bb],k=n[bb];if(k>=Q.N)continue;            // le plus petit, un cran plus pâle
        m.makeScale(S,S,S);const e=m.elements;e[12]=Math.round(x/gp)*gp;e[13]=Math.round(y/gp)*gp;e[14]=Math.round(z/gp)*gp;im.setMatrixAt(k,m);
        const ca=im.instanceColor.array;ca[k*3]=r;ca[k*3+1]=gg;ca[k*3+2]=bl;n[bb]=k+1;}}}
  for(let b=0;b<nb;b++){const im=G.M[b];im.count=n[b];im.visible=n[b]>0;if(n[b]){im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;}}
}
