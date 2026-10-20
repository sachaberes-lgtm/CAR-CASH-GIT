/* ===== LES FEUX EN LED — L'ÉTUDE (2026-10-20, Léo : « fais une étude des lumières des voitures, que je trouve encore un peu jaunes et pas très
   stylées ; inspire-toi encore une fois des physiques d'ARC Raiders » → au questionnaire : les FEUX des caisses, pas la lumière posée dessus) =====
   MESURÉ au banc avant de toucher (garage, ville la nuit, pixels lus sur la vraie image) : le jaune vient de QUATRE endroits, empilés —
   · le HALO des phares (`HALO.hM`, sprite 0xffe2a8 à ,95, allumé en grand au garage) : sur LE CAÏD la nuit, le cœur du phare sort #f7bd48 (or) ;
   · les pièces lumineuses elles-mêmes : 30 caisses ont des phares crème (#fff3d6, #f6e6c6, #fff6e6), 14 seulement un blanc froid ; les vieux
     gabarits posent des feux-boîtes 0xfff6c8 (jaune pâle) ; 42 caisses portent de l'ambre, dont des ambres JAUNES (#ffc84a, #ffd23a, #ffe08a) ;
   · le faisceau sur la route (`LUMK.hlC` [1, ,88, ,7] ≈ une ampoule halogène de 3 000 K) et la nappe peinte du garage (0xffd9a6) ;
   · les feux arrière, dont le halo tire sur l'ORANGE (0xff2818, 0xff5a36 au frein) — et la boule molle de `lampTex` autour de chaque feu.
   La LEÇON d'ARC Raiders (ses images sont à Embark : rien n'en est copié) : une lumière NATURELLE et FROIDE — des blancs neutres, des sources
   NETTES (c'est la forme de la lampe qui brille, pas une boule autour), un rouge franc, et de l'AIR ÉPAIS qui montre la lumière la nuit.
   Trois lectures sur les planches (`?feux=1` · `?feux=2` · `?feux=3`) — Léo a choisi la 2 puis demandé la lumière DANS le phare : c'est la 3, LE JEU
   depuis le 20/10 (`?feux=0` = les feux d'avant l'étude) :
   · 1 LED NETTE : blanc 6 500 K sur les pièces, les halos et le faisceau ; la lampe brille un peu au-delà du blanc (le bloom naît de sa forme) ;
     halos 30 % plus petits, en point LED serré ; rouge LED franc ; les ambres jaunes ramenés à l'ambre orangé d'un vrai clignotant.
   · 2 LUMIÈRE DANS L'AIR : la 1, plus froide (7 500 K) et plus vive, halos réduits de moitié, les ambres en veilleuse (un clignotant éteint),
     et LE FAISCEAU DANS L'AIR : un cône de lumière part de chaque phare, la nuit, dans la brume (l'air épais d'ARC).
   · 3 LA LUMIÈRE DANS LE PHARE (le jeu) : la 2 SANS AUCUN HALO, ni devant ni derrière ; la lampe s'allume elle-même, sa lueur suit sa forme (voir
     plus bas, les coques).
   Rien n'est retouché dans les fiches ni dans les formes : la couleur des pièces 'l' est relue APRÈS la construction (`feuxLed`, fin de buildCar),
   seulement aux deux BOUTS de la caisse (les décors lumineux d'un flanc — le pelage du DOGE — restent tels quels). */
const FEUX_DOSES={ /* blanc : la teinte des LED blanches · kB : leur éclat (> 1 : le bloom naît de la FORME de la lampe) · rouge/kR · ambre/kA (,55 = un
   clignotant en veilleuse) · halo, kH : la teinte et la taille des halos · hlC : le faisceau sur la route · tC/tF : le halo des feux arrière, au frein ·
   nappe : la nappe peinte du garage et la teinte du faisceau dans l'air · fais : la force du faisceau dans l'air (0 = aucun) */
  1:{blanc:[.93,.96,1],kB:1.3,rouge:[1,.05,.11],kR:1.15,ambre:[1,.5,.08],kA:1,halo:0xf0f5ff,kH:.7,hlC:[.93,.97,1],tC:0xff1a2c,tF:0xff3646,nappe:0xe9f0ff,fais:0},
  2:{blanc:[.85,.93,1],kB:1.6,rouge:[1,.04,.12],kR:1.4,ambre:[1,.5,.08],kA:.55,halo:0xe6efff,kH:.5,hlC:[.82,.92,1],tC:0xff0f2a,tF:0xff2a40,nappe:0xdfeaff,fais:.4}};
/* LECTURE 3 (même jour, Léo, après la planche : « intègre la lumière à l'intérieur des phares, efface cette forme de boule » — « je dirai 2 ») : la 2, SANS
   aucun halo (ni devant ni derrière) ; c'est la lampe qui s'allume, et le bloom naît de SA forme (la barre du CAÏD, les ronds du SCARABÉE). */
/* ⚠ MESURÉ : une lampe poussée au-delà du blanc ne brille PAS plus — le bloom lit la scène écrêtée à [0,1] (son seuil plié, voir PLIAGE). La
   lumière doit donc venir d'une LUEUR À LA FORME DU PHARE : les triangles de chaque lampe (regroupés par voisinage) sont recopiés en trois
   COQUES de plus en plus larges (chaque sommet poussé vers l'extérieur de SA lampe, axe par axe, de 1/3, 2/3 puis toute la marge : 4 à 12 cm),
   de plus en plus faibles, additives. La barre du CAÏD luit en barre, les ronds du SCARABÉE en ronds, un feu qui tourne autour du coin aussi
   (une carte plate devant lui faisait une plaque : essai écarté). Même programme que les lampes (vertexColors, additif : le noir n'ajoute rien). */
FEUX_DOSES[3]=Object.assign({},FEUX_DOSES[2],{kH:0,carte:[.75,.8],ambre:null});  /* carte : l'éclat de la lueur (devant, derrière) · ambre:null : les ambres
   gardent LEUR couleur — au balayage de la gamme, la veilleuse éteignait les étoiles d'or du DRAGON D'OR et les phares de rallye de LA STRATOS */
/* LES CAISSES-PERSONNAGES gardent leurs pièces lumineuses telles quelles (ce sont des YEUX, un pelage, de la lave, de la glace — pas des phares) :
   relevé au balayage de la gamme (le CHAT : les yeux bleuissaient ; LE DOGE : les sourcils). Les halos et le faisceau suivent la lecture. */
const FEUX_SAUF=['CHAT POP-TART','LE DOGE','LA FOURNAISE',"L'ICEBERG"];
/* ⚠ LA 3 EST LE JEU (oui de Léo, 20/10) : `?feux=0` rend les feux d'avant l'étude (halos crème), `?feux=1`/`?feux=2` les deux autres lectures. */
var FEUXL=(function(){let n=3;try{const q=new URLSearchParams(location.search).get('feux');if(q==='0'||q==='1'||q==='2')n=+q;}catch(e){}
  return {n:n,d:FEUX_DOSES[n]||null,fais:[],cartes:[],cM:null,stats:null,hlM:null,tlM:null,spec:null};})();
const FEUX_0={halo:0xffe2a8,tC:0xff2818,tF:0xff5a36,hlC:LUMK.hlC.slice(),nappe:0xffd9a6}; /* le main d'avant l'étude, pour revenir à chaud */
/* le POINT LED : un cœur blanc serré qui tombe vite (lampTex garde une traîne molle jusqu'à 74 % du rayon : la « boule de lumière ») */
const ledTex=(function(){
  const s=128,cv=document.createElement('canvas');cv.width=cv.height=s;const c=cv.getContext('2d');
  const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.09,'rgba(255,255,255,1)');g.addColorStop(.17,'rgba(255,255,255,.55)');
  g.addColorStop(.32,'rgba(255,255,255,.16)');g.addColorStop(.55,'rgba(255,255,255,.03)');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.fillRect(0,0,s,s);const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;return t;})();
function feuxGlobal(){ /* ce qui ne dépend pas de la caisse : les halos, les feux arrière, le faisceau sur la route */
  const D=FEUXL.d;HALO.hM.map=HALO.tM.map=D?ledTex:lampTex;HALO.hM.color.setHex(D?D.halo:FEUX_0.halo);
  VIT9.tC.setHex(D?D.tC:FEUX_0.tC);VIT9.tF.setHex(D?D.tF:FEUX_0.tF);LUMK.hlC=(D?D.hlC:FEUX_0.hlC).slice();}
if(FEUXL.d)feuxGlobal();
/* LE FAISCEAU DANS L'AIR (lecture 2) : un cône ouvert par phare, additif, qui s'éteint vers le bout et sur ses bords (|N·V| : épais au milieu,
   transparent sur la silhouette, comme un vrai volume de brume éclairée) — de nuit seulement (`VIT9.ph`, la même règle que les halos). */
const FAIS_M=new THREE.ShaderMaterial({uniforms:{uC:{value:new THREE.Color(0xdfeaff)},uK:{value:0},uL:{value:13}},
  vertexShader:'uniform float uL;varying float vL;varying vec3 vN;varying vec3 vV;void main(){vL=clamp(position.z/uL,0.,1.);vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform vec3 uC;uniform float uK;varying float vL;varying vec3 vN;varying vec3 vV;void main(){float f=abs(dot(normalize(vN),normalize(vV)));float a=pow(f,2.)*pow(1.-vL,1.6)*smoothstep(0.,.06,vL)*uK;gl_FragColor=vec4(uC*a,1.);}',
  transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
FAIS_M.userData.plq=1; /* partagée par toutes les caisses (la règle de LA PLAQUE dans buildCar : jamais libérée, pas de recompilation) */
const FAIS_G=(function(){const L=13,g=new THREE.CylinderGeometry(1.9,.16,L,18,6,true);g.translate(0,L/2,0);g.rotateX(Math.PI/2);return g;})(); /* l'axe le long de +z (l'avant de la caisse) */
function feuxCaisse(){ /* la caisse posée : ses pièces lumineuses, ses feux-boîtes, ses halos, sa nappe, ses faisceaux — relus depuis l'ORIGINE à chaque fois */
  const D0=FEUXL.d,spec=FEUXL.spec||CARS[level]||{l:4.4},D=D0&&FEUX_SAUF.indexOf(spec.name)>=0?null:D0; /* D : les pièces · D0 : les halos, la nappe, les faisceaux */
  const st={pieces:0,blanc:0,rouge:0,ambre:0,hors:0};
  const FV=[],RV=[]; /* (lecture 3) les TRIANGLES des lampes blanches (avant) et rouges (arrière), 9 nombres chacun, dans le repère de la caisse */
  const tris=function(G,Mi,L,K){const pa=G.attributes.position,ix=G.index,n=ix?ix.count:pa.count,q=new THREE.Vector3(); /* K(i) : le sommet i en est-il ? (null : tous) */
    for(let t=0;t+2<n;t+=3){const a=ix?ix.getX(t):t,b=ix?ix.getX(t+1):t+1,c=ix?ix.getX(t+2):t+2;if(K&&!(K(a)&&K(b)&&K(c)))continue;
      for(const i of [a,b,c]){q.set(pa.getX(i),pa.getY(i),pa.getZ(i)).applyMatrix4(Mi);L.push(q.x,q.y,q.z);}}};
  carGroup.updateMatrixWorld(true);
  const lim=(spec.l||4.4)*.26,inv=new THREE.Matrix4().copy(carGroup.matrixWorld).invert(),M=new THREE.Matrix4(),p=new THREE.Vector3();
  carGroup.traverse(function(m){
    const mt=m.material;if(!m.isMesh||!mt||Array.isArray(mt)||!mt.isMeshBasicMaterial)return;
    if(mt===FEUXL.hlM||mt===FEUXL.tlM){if(mt.userData.feuxC0==null)mt.userData.feuxC0=mt.color.getHex(); /* les feux-boîtes des vieux gabarits */
      if(!D)mt.color.setHex(mt.userData.feuxC0);else{const c=mt===FEUXL.hlM?D.blanc:D.rouge,k=mt===FEUXL.hlM?D.kB:D.kR;mt.color.setRGB(c[0]*k,c[1]*k,c[2]*k);}
      if(D&&D.carte)tris(m.geometry,new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld),mt===FEUXL.hlM?FV:RV,null);return;}
    if(!mt.vertexColors||!mt.userData.lp)return;
    const G=m.geometry,ca=G&&G.attributes.color,pa=G&&G.attributes.position;if(!ca||!pa)return;
    if(!G.userData.feuxC0){const a=new Float32Array(ca.count*3);for(let i=0;i<ca.count;i++){a[i*3]=ca.getX(i);a[i*3+1]=ca.getY(i);a[i*3+2]=ca.getZ(i);}G.userData.feuxC0=a;
      if(!(ca.array instanceof Float32Array))G.setAttribute('color',new THREE.BufferAttribute(a.slice(),3));}
    const C=G.attributes.color,O=G.userData.feuxC0;st.pieces++;
    M.multiplyMatrices(inv,m.matrixWorld);const KL=D&&D.carte?new Uint8Array(C.count):null; /* 1 : lampe blanche de l'avant · 2 : feu rouge de l'arrière */
    for(let i=0;i<C.count;i++){
      const r=O[i*3],g=O[i*3+1],b=O[i*3+2];C.setXYZ(i,r,g,b);if(!D)continue;
      p.set(pa.getX(i),pa.getY(i),pa.getZ(i)).applyMatrix4(M);if(Math.abs(p.z)<lim){st.hors++;continue;} /* seulement aux deux bouts */
      const mx=Math.max(r,g,b),mn=Math.min(r,g,b),sat=mx>0?(mx-mn)/mx:0;if(mx<.55)continue; /* les boîtiers sombres restent */
      let h=0;if(mx>mn){if(mx===r)h=((g-b)/(mx-mn))%6;else if(mx===g)h=(b-r)/(mx-mn)+2;else h=(r-g)/(mx-mn)+4;h*=60;if(h<0)h+=360;}
      let c=null,k=1;
      if(sat<.3&&mx>=.82){c=D.blanc;k=mx>=.93?D.kB:1;st.blanc++;if(KL&&p.z>0&&mx>=.93)KL[i]=1;}                        /* le blanc des phares : 6 500 / 7 500 K, et l'éclat */
      else if(sat>=.45&&(h<=14||h>=335)){c=D.rouge;k=mx>=.75?D.kR:1;st.rouge++;if(KL&&p.z<0&&mx>=.75)KL[i]=2;}         /* le rouge des feux : un rouge LED franc */
      else if(D.ambre&&sat>=.45&&h>14&&h<=62){c=D.ambre;k=D.kA;st.ambre++;}                       /* l'ambre : celui d'un vrai clignotant, pas un jaune */
      if(c)C.setXYZ(i,c[0]*mx*k,c[1]*mx*k,c[2]*mx*k);}
    if(KL){tris(G,M,FV,function(i){return KL[i]===1;});tris(G,M,RV,function(i){return KL[i]===2;});}
    C.needsUpdate=true;});
  if(CARPOOL.head)CARPOOL.head.material.color.setHex(D0?D0.nappe:FEUX_0.nappe);
  for(const s of HALO.h.concat(HALO.t)){if(s.userData.k0==null)s.userData.k0=s.userData.k;const k=s.userData.k0*(D0?D0.kH:1),k1=s.userData.k; /* ⚠ k1 vaut 0 après la 3 (pas de halo) : diviser donnait des NaN, et le bloom les étalait sur TOUT l'écran (image noire) */
    if(k1>1e-6)s.scale.multiplyScalar(k/k1);else s.scale.set(k,k,1);s.userData.k=k;}
  for(const f of FEUXL.fais){if(f.parent)f.parent.remove(f);f.geometry.dispose();}FEUXL.fais.length=0;
  if(D0&&D0.fais>0)for(const s of HALO.h){const f=new THREE.Mesh(FAIS_G.clone(),FAIS_M);f.onBeforeRender=function(){}; /* (une géométrie à elle : buildCar libère tout à la caisse suivante) */
    f.position.copy(s.position);f.position.z-=.1;f.rotation.x=.07; /* un peu vers la route */
    f.userData.noShadow=true;f.renderOrder=3;f.frustumCulled=false;carGroup.add(f);FEUXL.fais.push(f);}
  for(const c of FEUXL.cartes){if(c.parent)c.parent.remove(c);c.geometry.dispose();}FEUXL.cartes.length=0;
  if(D&&D.carte){if(!FEUXL.cM)FEUXL.cM=[0,1].map(function(){const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});m.userData.plq=1;return m;});
    FEUXL.cM[0].userData.c=D.blanc;FEUXL.cM[1].userData.c=D.rouge;
    feuxCartes(FV,1,FEUXL.cM[0]);feuxCartes(RV,-1,FEUXL.cM[1]);st.cartes=FEUXL.cartes.length;}
  FEUXL.stats=st;}
function feuxCartes(V,sens,mat){ /* (lecture 3) les triangles regroupés par lampe (casiers 3D de 8 cm) → trois coques de lueur par lampe */
  const nt=V.length/9;if(!nt)return;const C=.08,cas=new Map(),cle=function(x,y,z){return Math.floor(x/C)+'|'+Math.floor(y/C)+'|'+Math.floor(z/C);};
  for(let t=0;t<nt;t++){const o=t*9,k=cle((V[o]+V[o+3]+V[o+6])/3,(V[o+1]+V[o+4]+V[o+7])/3,(V[o+2]+V[o+5]+V[o+8])/3);let L=cas.get(k);if(!L)cas.set(k,L=[]);L.push(t);}
  const vu=new Set(),P=[],Cc=[],COU=[[1/3,.3],[2/3,.17],[1,.08]];
  for(const k0 of cas.keys()){if(vu.has(k0))continue;const pile=[k0],T=[];vu.add(k0);
    while(pile.length){const k=pile.pop();for(const t of cas.get(k))T.push(t);const a=k.split('|').map(Number);
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){const kk=(a[0]+dx)+'|'+(a[1]+dy)+'|'+(a[2]+dz);if(cas.has(kk)&&!vu.has(kk)){vu.add(kk);pile.push(kk);}}}
    let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;
    for(const t of T)for(let j=0;j<3;j++){const o=t*9+j*3;x0=Math.min(x0,V[o]);x1=Math.max(x1,V[o]);y0=Math.min(y0,V[o+1]);y1=Math.max(y1,V[o+1]);z0=Math.min(z0,V[o+2]);z1=Math.max(z1,V[o+2]);}
    const cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2,m=Math.min(.12,.04+.3*Math.min(x1-x0,y1-y0)),sg=function(d,e){return d>e?1:d<-e?-1:0;};
    for(const [f,v] of COU){const mm=m*f;
      for(const t of T)for(let j=0;j<3;j++){const o=t*9+j*3,x=V[o],y=V[o+1],z=V[o+2];
        P.push(x+sg(x-cx,.004)*mm,y+sg(y-cy,.004)*mm,z+sg(z-cz,.004)*mm*.5+sens*mm*.35);Cc.push(v,v,v);}}}
  if(!P.length)return;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
  const c=new THREE.Mesh(g,mat);c.userData.noShadow=true;c.renderOrder=4;c.onBeforeRender=function(){};carBody.add(c);FEUXL.cartes.push(c);}
function feuxLed(spec,hlM,tlM){FEUXL.hlM=hlM;FEUXL.tlM=tlM;FEUXL.spec=spec;FEUXL.fais.length=0;FEUXL.cartes.length=0;if(FEUXL.d)feuxCaisse();} /* fin de buildCar, après la soudure (l'ancienne caisse est partie avec ses lueurs) */
{const av9=scene.onBeforeRender; /* ⚠ chaîné, jamais réassigné (pisteLoin, conesVus, la ville l'utilisent) */
  scene.onBeforeRender=function(a,b,c,d,e,f){if(av9)av9.call(this,a,b,c,d,e,f);
    if(FEUXL.cartes.length&&FEUXL.cM&&FEUXL.d&&FEUXL.d.carte){const D=FEUXL.d,boom=mode==='boom',ph=(VIT9.ph==null?1:VIT9.ph)*(CAR_PHK==null?1:CAR_PHK),fr=VIT9.frein||0;
      const ka=boom?0:D.carte[0]*ph,kr=boom?0:D.carte[1]*(.75+.6*fr),ca=FEUXL.cM[0].userData.c,cr=FEUXL.cM[1].userData.c; /* devant : la nuit seulement (les phares s'éteignent au soleil) · derrière : toujours, et le frein l'embrase */
      FEUXL.cM[0].color.setRGB(ca[0]*ka,ca[1]*ka,ca[2]*ka);FEUXL.cM[1].color.setRGB(cr[0]*kr,cr[1]*kr,cr[2]*kr);}
    if(!FEUXL.fais.length)return;
    const bq=garageOn&&typeof GBQ!=='undefined'&&(GBQ.on||GBQ.veut);
    FAIS_M.uniforms.uK.value=(mode==='boom'||bq||!FEUXL.d)?0:FEUXL.d.fais*(VIT9.ph==null?1:VIT9.ph)*(CAR_PHK==null?1:CAR_PHK);
    FAIS_M.uniforms.uC.value.setHex(FEUXL.d?FEUXL.d.nappe:FEUX_0.nappe);};}
window.dbgFeuxLed=function(a,b){ /* (banc) dbgFeuxLed('mode',0|1|2|3) : change de lecture À CHAUD (même image, même instant) · ('fais',x) la force du faisceau dans l'air */
  if(a==='mode'){FEUXL.n=b|0;FEUXL.d=FEUX_DOSES[FEUXL.n]||null;feuxGlobal();feuxCaisse();}
  else if(a==='fais'&&FEUXL.d)FEUXL.d.fais=+b;
  return {lecture:FEUXL.n,stats:FEUXL.stats,cartes:FEUXL.cartes.length,ph:VIT9.ph==null?null:+VIT9.ph.toFixed(2),faisceaux:FEUXL.fais.length,uK:+FAIS_M.uniforms.uK.value.toFixed(2)};};
