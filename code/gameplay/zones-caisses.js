/* ============================================================================
   LES SYSTÈMES DE ZONE (2026-09-27, ex-campagne des NUAGES) — ce qui reste depuis le retrait de la carrière (2026-10-18) : la courbure
   de la route (campCourbure : les filets, la ligne de la caisse-nuage), L'ORAGE (éclairs, tonnerre), LA CAISSE-NUAGE de l'ÉVÉNEMENT RARE
   et les deux aiguillages de zone (campDebut, campStop).
   ⚠ Tout est créé À L'INIT (maillages, matières, tampons) : zéro compilation, zéro allocation dans la boucle.
   ========================================================================== */
let CAMP_FLASH=0,CAMP_FOG=0,KAPB=new Float32Array(1);
const CV1=new THREE.Vector3(),CV2=new THREE.Vector3(),CV3=new THREE.Vector3(),CV4=new THREE.Vector3(),CM4=new THREE.Matrix4(); // temporaires DU MODULE (jamais tmp/tmp2/tmp3)
const GF={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},
      GF2={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
function campCourbure(){ // la courbure LATÉRALE de la piste en chaque point (1/m, signée sur B : > 0 = le centre du virage est côté +B)
  if(KAPB.length!==NP)KAPB=new Float32Array(NP);
  for(let i=0;i<NP;i++){const a=Math.max(0,i-3),b=Math.min(NP-1,i+3),ds=Math.max(.5,pts[a].distanceTo(pts[b]));
    KAPB[i]=((T[b].x-T[a].x)*B[i].x+(T[b].y-T[a].y)*B[i].y+(T[b].z-T[a].z)*B[i].z)/ds;}
}
function portailVisible(v){for(const o of [portalMesh,PORTAL.noy,PORTAL.halo])if(o)o.visible=v;if(PCUBE.on){PCUBE.grp.visible=v;PCUBE.halo.visible=v;}if(PORTAL.lum)PORTAL.lum.intensity=v?(PCUBE.on?1.1:1.6):0;}
// ============ L'ORAGE : l'éclair RÉVÈLE, le tonnerre suit ============
const ECL=(function(){
  const N=34,pos=new Float32Array(N*12),col=new Float32Array(N*12),uv=new Float32Array(N*8),idx=[];
  for(let i=0;i<N;i++){const o=i*4;idx.push(o,o+1,o+2,o+2,o+1,o+3);uv.set([0,0,1,0,0,1,1,1],i*8);}
  for(let i=0;i<N*4;i++)pos[i*3+1]=-99999;
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:TRAIL_TEX,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  m.frustumCulled=false;m.renderOrder=2;scene.add(m);
  const P=[];for(let i=0;i<N+2;i++)P.push(new THREE.Vector3());
  return {m:m,pos:pos,col:col,N:N,P:P,seg:[],t:4,k:0,vie:0,tonT:-1,ton:0,dernier:false,viv:true};
})();
function eclVide(){ECL.vie=0;ECL.k=0;ECL.seg.length=0;ECL.tonT=-1;ECL.viv=true;eclEcrit();CAMP_FLASH=0;CAMP_FOG=0;
  if(acesPass)acesPass.uniforms.uExposure.value=POST_EXPO;if(scene.fog){scene.fog.near=FOG_N;scene.fog.far=FOG_F;}} // (2026-09-29, audit GAMEPLAY) l'exposition et la brume ne sont réécrites qu'en course : sans ça, l'écran de fin gardait le flash (×1,8) ou la brume du banc
function eclFrappe(){
  const fin=s>L-1700&&!ECL.dernier;
  if(fin){ECL.dernier=true;frameAt(Math.max(0,L-60),GF);const l=Math.hypot(GF.t.x,GF.t.z)||1;CV1.set(PORTAL.c.x+GF.t.z/l*150,PORTAL.c.y-140,PORTAL.c.z-GF.t.x/l*150);} // le DERNIER éclair tombe à côté du portail
  else{const sT=Math.min(L-10,s+380+Math.random()*520);frameAt(sT,GF);const l=Math.hypot(GF.t.x,GF.t.z)||1,d=(Math.random()<.5?-1:1)*(ROAD_HALF+90+Math.random()*420);
    CV1.set(GF.p.x+GF.t.z/l*d,GF.p.y-150,GF.p.z-GF.t.x/l*d);}
  // le tronc : 16 segments du ciel jusque sous la route, brisés ; deux branches
  const P=ECL.P,H=640,nT=16;ECL.seg.length=0;let q=0;
  P[0].set(CV1.x+(Math.random()-.5)*60,CV1.y+H,CV1.z+(Math.random()-.5)*60);
  for(let k=1;k<=nT;k++){const u=k/nT;P[k].set(P[0].x+(CV1.x-P[0].x)*u+(Math.random()-.5)*46,P[0].y-H*u,P[0].z+(CV1.z-P[0].z)*u+(Math.random()-.5)*46);ECL.seg.push(k-1,k,9);}
  q=nT+1;
  for(const [from,len] of [[5,6],[10,5]]){let prev=from;const ang=Math.random()*6.283;
    for(let k=1;k<=len&&q<P.length;k++){P[q].set(P[prev].x+Math.cos(ang)*28*k/len*3+(Math.random()-.5)*22,P[prev].y-34,P[prev].z+Math.sin(ang)*28*k/len*3+(Math.random()-.5)*22);
      ECL.seg.push(prev,q,4.2);prev=q;q++;}}
  ECL.vie=.34;ECL.k=1;
  const dd=CV2.subVectors(CV1,carGroup.position).length();
  ECL.tonT=.25+dd/1400;ECL.ton=Math.max(.25,1-dd/1400);if(SONV2)sfx('foudre.eclair',{vol:-14+14*ECL.ton}); // le tonnerre arrive après, et plus fort quand c'est près
  if(dd<700)hap(12);
}
function eclEcrit(){
  const P=ECL.pos,C=ECL.col,cam=camera.position,on=ECL.vie>0;let n=0;
  if(on){const fl=ECL.vie>.2?1:.2+.8*(ECL.vie/.2); /* (2026-10-14, WCAG 2.3.1) fondu continu : l'alternance à 14 Hz faisait 3 flashs en 0,2 s */ // il claque, puis vacille
    for(let j=0;j<ECL.seg.length&&n<ECL.N;j+=3,n++){const a=ECL.P[ECL.seg[j]],b=ECL.P[ECL.seg[j+1]],w=ECL.seg[j+2],o=n*12;
      CV3.subVectors(b,a);CV4.subVectors(cam,a);CV4.crossVectors(CV3,CV4);const l=CV4.length();if(l>1e-6)CV4.multiplyScalar(w/l);
      P[o]=a.x-CV4.x;P[o+1]=a.y-CV4.y;P[o+2]=a.z-CV4.z;P[o+3]=a.x+CV4.x;P[o+4]=a.y+CV4.y;P[o+5]=a.z+CV4.z;
      P[o+6]=b.x-CV4.x;P[o+7]=b.y-CV4.y;P[o+8]=b.z-CV4.z;P[o+9]=b.x+CV4.x;P[o+10]=b.y+CV4.y;P[o+11]=b.z+CV4.z;
      const f=fl*(w>6?1.5:1.05);for(let k=0;k<4;k++){C[o+k*3]=.95*f;C[o+k*3+1]=.97*f;C[o+k*3+2]=1.18*f;}}} // (2026-10-14, neon-residuel) l'éclair : blanc-bleu (la charte), plus lilas
  for(let i=n;i<ECL.N;i++){const o=i*12;if(P[o+1]===-99999)continue;for(let k=0;k<4;k++){P[o+k*3+1]=-99999;C[o+k*3]=C[o+k*3+1]=C[o+k*3+2]=0;}}
  if(on||ECL.viv){const at=ECL.m.geometry.attributes;at.position.needsUpdate=true;at.color.needsUpdate=true;}
  ECL.viv=on;
}
function orageTick(dt){
  ECL.t-=dt;if(ECL.t<=0){eclFrappe();ECL.t=3.4+Math.random()*4;}
  if(ECL.vie>0)ECL.vie-=dt;
  ECL.k=Math.max(0,ECL.k-dt*1.9);
  const e=ECL.k*ECL.k;
  CAMP_FLASH=.8*e; /* (2026-10-14, chasse aux bugs · WCAG 2.3.1) plus de vacillation à 11 Hz pendant la vie de l'éclair (plage des crises d'épilepsie, motif de refus Apple) : UN flash qui s'éteint en douceur */ // le ciel s'allume (et vacille avec l'éclair)
  CAMP_FOG=1900*e;                                            // …et le brouillard recule : la route, le portail se montrent
  eclEcrit();
  if(ECL.tonT>=0){ECL.tonT-=dt;if(ECL.tonT<0){try{if(SONV2)sfx('tonnerre',{vol:-10+10*ECL.ton});else{subBoom(.14+.16*ECL.ton);noiseBurst(1.5,.07+.1*ECL.ton,150);noiseBurst(.35,.05*ECL.ton,900);}}catch(e){}if(ECL.ton>.7)shake=Math.max(shake,.25);}}
}
// ============ LA CAISSE-NUAGE (la caisse du garage, et l'ÉVÉNEMENT RARE) ============
// La même ouate que le ciel (mergeSpheres : ventre lavande, sommet blanc, creux ombrés ; la matière des nuages et sa lisière d'argent),
// posée sur un vrai châssis, quatre roues, des feux sobres. UN jeu de boules pour la caisse du garage (SHAPES.nuage) et pour le fantôme.
const NUAGE_BLOBS=[ // (x, y, z, rayon, aplatissement) en MÈTRES, centre de caisse — nez en +z
  [-.52,-.16,-1.42,.5,.85],[.52,-.16,-1.42,.5,.85],[0,.05,-1.34,.58,.9],   // la poupe
  [0,.3,-.36,.56,1],[-.46,.2,-.24,.46,1],[.46,.2,-.24,.46,1],             // l'habitacle : le dôme du toit
  [-.3,.14,.32,.42,.9],[.3,.14,.32,.42,.9],                                // le pare-brise bombé
  [-.5,-.2,.78,.48,.8],[.5,-.2,.78,.48,.8],[0,-.07,.98,.54,.75],          // le capot, sur les roues avant
  [0,-.26,1.62,.42,.7],                                                     // le museau
  [-.72,-.3,-.1,.4,.7],[.72,-.3,-.1,.4,.7]];                               // les portières
const NUAGE_Y=.88,GH_K=1.1; // hauteur du centre de la ouate (le châssis dessous, les roues au sol)
function nuageMat(){ // la ouate OPAQUE : la matière des nuages (même modelé, même lisière d'argent), sans leur transparence
  const m=new THREE.MeshPhongMaterial({color:0xfff7f0,vertexColors:true,shininess:14,specular:0x8f89a4,emissive:0x2a2232,emissiveIntensity:.55});
  m.onBeforeCompile=nuageShader;m.customProgramCacheKey=function(){return 'nuageCaisse';};
  return m;
}
SHAPES.nuage=function(K){ // la caisse du garage — le châssis, la ouate ; buildCar pose les roues, les feux et les pots aux ancrages rendus
  const g=mergeSpheres(NUAGE_BLOBS,1,1,1),m=new THREE.Mesh(g,nuageMat());m.position.y=NUAGE_Y;K.add(m);
  K.box(1.86,.2,3.7,K.dark,0,.44,0);                                        // le châssis, qu'on devine sous le ventre de ouate
  K.box(1.7,.12,.16,K.chrome,0,.5,1.98);K.box(1.66,.12,.16,K.chrome,0,.52,-1.96); // les pare-chocs, fins
  return {hl:[.56,.6,1.98],tl:[.6,.66,-1.98],wr:.9,wx:.98,wz:1.28,split:0,skirt:0,sp:0,doors:0,slats:0,wings:'none',glowX:1.0,glowY:.5,glowL:3,glowF:0};
};
const GH=(function(){ // le fantôme : SA caisse, SON ruban — créés à l'init, cachés hors de l'événement rare
  const g=new THREE.Group(),dk=new THREE.MeshPhongMaterial({color:0x1a1c24,shininess:40,specular:0x333844}),
        cr=new THREE.MeshPhongMaterial({color:0xf3e9dc,shininess:160,specular:0xffffff}),
        pn=new THREE.MeshPhongMaterial({color:0x17181d,shininess:8});
  const corps=new THREE.Mesh(mergeSpheres(NUAGE_BLOBS,1,1,1),nuageMat());corps.position.y=NUAGE_Y;g.add(corps);
  const ch=new THREE.Mesh(new THREE.BoxGeometry(1.86,.2,3.7),dk);ch.position.y=.44;g.add(ch);
  for(const z of [1.98,-1.96]){const pc=new THREE.Mesh(new THREE.BoxGeometry(1.7,.12,.16),cr);pc.position.set(0,.51,z);g.add(pc);}
  const roues=[],pG=new THREE.CylinderGeometry(.36,.36,.3,16),jG=new THREE.CylinderGeometry(.22,.22,.32,10);
  for(const sx of [-1,1])for(const sz of [1,-1]){const w=new THREE.Group();
    const p=new THREE.Mesh(pG,pn);p.rotation.z=Math.PI/2;w.add(p);
    const j=new THREE.Mesh(jG,cr);j.rotation.z=Math.PI/2;w.add(j);
    w.position.set(sx*.98,.36,sz*1.28);g.add(w);roues.push(w);}
  const phM=new THREE.SpriteMaterial({map:lampTex,color:0xfff1d6,transparent:true,opacity:.95,depthWrite:false}),
        feM=new THREE.SpriteMaterial({map:lampTex,color:0xff7aa8,transparent:true,opacity:.85,depthWrite:false});
  for(const sx of [-1,1]){const a=new THREE.Sprite(phM);a.scale.set(.75,.75,1);a.position.set(sx*.56,.62,2.02);g.add(a);
    const r=new THREE.Sprite(feM);r.scale.set(.6,.6,1);r.position.set(sx*.6,.66,-2.02);g.add(r);}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  g.visible=false;scene.add(g);
  return {g:g,roues:roues,tr:mkTrail(),on:false,s:0,lat:0,v:0,momT:0,yaw:0,
    prise:0,pris:false,fini:false,accr:false,line:null,tmpL:null,noteT:0,latP:0};
})();
function campChauffe(){ // compile la caisse-nuage et une voiture de police AU MENU (renderer.compile ne voit que ce qui est visible)
  if(campChauffe.fait)return;campChauffe.fait=true;
  const v=GH.g.visible;GH.g.visible=true;GH.g.position.copy(camera.position).add(CV1.set(0,0,-8).applyQuaternion(camera.quaternion));GH.g.updateMatrixWorld(true);
  let pc=null;try{pc=mkPolice(0);pc.g.visible=true;pc.g.position.copy(GH.g.position);pc.g.updateMatrixWorld(true);}catch(e){}
  try{renderer.compile(scene,camera);}catch(e){}
  GH.g.visible=v;
  if(pc){scene.remove(pc.g);pc.g.traverse(o=>{if(o.userData&&o.userData.sol){if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();}});}
}
function ghIdx(sv){return Math.max(0,Math.min(NP-1,Math.round(sv/L*(NP-1))));}
function fantomeLigne(){ // LA LIGNE GRAVÉE : la corde de chaque virage, lissée sur ±60 m
  if(!GH.line||GH.line.length!==NP){GH.line=new Float32Array(NP);GH.tmpL=new Float32Array(NP);}
  const A=GH.tmpL,Bl=GH.line,Lh=ROAD_HALF-5;
  for(let i=0;i<NP;i++){const k=KAPB[i];A[i]=Math.sign(k)*Lh*Math.min(1,Math.abs(k)*260);}
  const w=Math.max(4,Math.round(60/Math.max(.1,L/(NP-1))));
  for(let pass=0;pass<2;pass++){const src=pass?Bl:A,dst=pass?A:Bl;let acc=0,cnt=0;
    for(let i=-w;i<NP;i++){const a=i+w,r=i-w-1;if(a<NP){acc+=src[a];cnt++;}if(r>=0){acc-=src[r];cnt--;}if(i>=0)dst[i]=acc/Math.max(1,cnt);}}
  Bl.set(A);
}
function fantomePrepare(){ // une zone commence : la caisse-nuage de la zone d'avant est rangée (evtDemarre la relance)
  GH.on=false;GH.g.visible=false;GH.tr.init=false;GH.tr.m.visible=false;
}
function fantomePose(dt){ // la caisse-nuage dans le monde : au sol sur sa ligne
  const g=GH.g;
  frameAt(GH.s,GF);
  g.position.copy(GF.p).addScaledVector(GF.b,GH.lat);
  CM4.makeBasis(GF.b,GF.n,GF.t);g.quaternion.setFromRotationMatrix(CM4);
  g.rotateY(GH.yaw);
  const rv=GH.v*SPD*dt/.36;for(const w of GH.roues)w.rotation.x+=rv;
  g.visible=Math.abs(GH.s-s)<1100;
  /* (2026-10-15, Sacha : « son sillage, je sais pas ce que c'est, supprime-le, c'est nul ») plus de ruban d'or rose derrière la
     caisse-nuage — il reste éteint (trailStep à 0 le cache) */
  trailStep(GH.tr,0,0,0,0,0,0,0);
}
function fantomeTick(dt){
  if(!GH.on||GH.pris||GH.fini){if(GH.on&&GH.fini)GH.g.visible=false;return;}
  // ---- SA COURSE : tes équations, TON moteur, jamais de nitro (voir la boucle : accélération, momentum, traînée, pente) ----
  // GH_K : 10 % de plus en POINTE que toi (mesuré : à armes égales un coup de nitro toutes les 6 s la cueillait en 11 s ; à +5 % et 125 m
  // d'avance, en 14 s) — on la rattrape au nitro et dans les nuages, pas en roulant tout droit
  const sp=CARS[0],late=lateMul(),eng=ENGINE_TIERS[engTier]||ENGINE_TIERS[0],mx=sp.maxKmh/3.6*late*eng.push*GH_K,acc=sp.accel*late*(1+(eng.push-1)*.6);
  GH.momT=Math.min(4.3,GH.momT+dt);const momF=1+Math.min(1.8,GH.momT*GH.momT*.1),i=ghIdx(GH.s);
  GH.v+=acc*(GH.v<mx?1:.55)*momF*dt;
  if(startBoostT>0)GH.v+=30*eng.push*dt; // le boost de départ vaut pour elle aussi (sinon on la cueillait dans les 3 premières secondes)
  GH.v+=-GRAV*T[i].y*dt;
  GH.v-=GH.v*Math.abs(GH.v)*(acc/(mx*mx*5.8))*dt;GH.v*=Math.max(0,1-.03*dt);
  {const gp=s-GH.s;if(gp>0&&gp<46&&mode==='drive')GH.v+=9*(1-gp/46)*dt;} // l'aspiration vaut pour elle aussi : dépassée de près, elle revient dans TON sillage
  const lT=GH.line[i],lat0=GH.lat;GH.lat+=(lT-GH.lat)*Math.min(1,dt*1.8);
  const ds=GH.v*dt*SPD;GH.s+=ds;
  GH.yaw+=(Math.atan2(GH.lat-lat0,Math.max(.01,ds))-GH.yaw)*Math.min(1,dt*8);
  if(GH.s>=L-45){fantomeSeme();return;} // ELLE PASSE LE PORTAIL LA PREMIÈRE
  fantomePose(dt);
  // ---- LE SILLAGE : tenir 1 s dans sa bulle (18 m autour d'elle — derrière, ou à sa hauteur quand on remonte) ----
  // (mesuré : une zone de 15 m derrière sa POUPE ne tenait pas 1 s à 17 m/s d'écart, et on la dépassait sans l'attraper — or sans frein
  // on ne revient plus derrière elle. La bulle laisse ~1,9 s à qui remonte dans sa ligne ; qui passe loin sur le côté ne l'a pas attrapée.)
  CV1.set(0,.6,-.8).applyQuaternion(GH.g.quaternion).add(GH.g.position); // le cœur de la caisse (un peu en arrière)
  const d=CV1.distanceTo(carGroup.position),sP=mode==='fall'?lastNearS:s;
  const derriere=mode==='fall'?true:(sP<=GH.s+2);
  if(d<46&&derriere&&mode==='drive'){ // L'ASPIRATION : dans son sillage, l'air te tire (et la ouate file autour de toi)
    const k=1-d/46;vA+=9*k*dt;} // (2026-10-15, Sacha) plus de ouate qui file autour de toi dans son sillage : l'aspiration tire toujours, sans rien montrer
  if(d<18){
    if(!GH.accr){GH.accr=true;popTexte('ACCROCHE !','#ffe7a8',2);hap(12);if(SONV2)sfx('fantome.accroche');}
    GH.prise+=dt;GH.noteT-=dt;
    if(GH.noteT<=0){GH.noteT=.2;try{if(SONV2)sfx('fantome.prise',{st:sonPd(Math.min(9,Math.floor(GH.prise*6)))});else chimeNote(noteP(Math.min(7,Math.floor(GH.prise*6)),1),0,.07,.2);}catch(e){}} // un carillon qui MONTE : le compteur, on l'entend
    if(GH.prise>=1){evtCnPris();return;} // (2026-10-14, GAMEPLAY) l'ÉVÉNEMENT RARE paie sa prime
  }else{GH.prise=Math.max(0,GH.prise-dt*1.5);if(GH.prise<=0)GH.accr=false;}
  if(GH.s-sP>EVT_FUITE){fantomeSeme();return;} // (2026-10-14, GAMEPLAY) ÉVÉNEMENT RARE : 600 m d'avance, elle s'est enfuie — on ne la poursuit pas une minute dans le vide
  vChip(''); // (2026-10-15, Sacha : « je sais pas ce que c'est, enlève-le complètement ») plus de plaque pour la caisse-nuage — l'ACCROCHE et le carillon disent la prise
}
function fantomeSeme(){ // elle a franchi le portail la première, ou elle s'est enfuie : c'est perdu
  if(GH.fini||GH.pris)return;GH.fini=true;GH.g.visible=false;trailStep(GH.tr,0,0,0,0,0,0,0);vChip('');
  flashEcran('rgba(255,120,190,.5)');try{if(SONV2)sfx('defaite');else portalSnd();}catch(e){}
  slam("ELLE T'A SEME",'','#ff9ee6','#ff5e7a',38,3);
  evtFin('rate'); // (2026-10-14, GAMEPLAY) l'ÉVÉNEMENT RARE perdu ne coûte rien : la partie continue
}
// ============ L'AIGUILLAGE ============
function campDebut(){ // une zone commence (newTrack, et le 1er départ de la session) : l'orage repart, la caisse-nuage se range, la plaque se tait
  eclVide();ECL.t=3;ECL.dernier=false;
  fantomePrepare();
  vChipK='';vChip('');
  evtZone(); // (2026-10-14, GAMEPLAY) LES ÉVÉNEMENTS RARES : la partie armée pose le sien sur la 1re zone qui a sa map
}
function campStop(){eclVide();if(GH.on){GH.g.visible=false;trailStep(GH.tr,0,0,0,0,0,0,0);}vChip('');}
/* LA ROUTE QUI TE RATTRAPE — LES DEUX PAIEMENTS (Sacha : « un virage bien pris paie PLUS qu'une chute rattrapée »).
   VIRAGE À FOND : traverser un virage à filet sans quitter la route, sans jamais descendre sous FILET.vFond × sa vitesse de calcul
   (120 d'aura, du flow de route, un peu de nitro) — en plus du VIRAGE SERRÉ s'il tombe. RATTRAPÉ : sortir de ce virage et retomber
   dans son filet (50 d'aura, un peu de flow) — la pose LOURDE et la vitesse perdue font le reste. Les figures du vol (BIG AIR, dauphin…)
   restent au voltigeur. */
const FILR={q:null,ok:false,vMin:0};
function filetTick(){ // appelée chaque image AU SOL (la boucle de conduite)
  if(!FILETS.length)return;
  let q=null;for(const f9 of FILETS)if(s>=f9.sC0&&s<=f9.sC1){q=f9;break;}
  const v9=Math.abs(vA)*SPD;
  if(q&&FILR.q!==q){FILR.q=q;FILR.ok=!q.paye;FILR.vMin=v9;}
  else if(q){FILR.vMin=Math.min(FILR.vMin,v9);}
  else if(FILR.q){const q9=FILR.q;FILR.q=null;
    if(FILR.ok&&s>q9.sC1&&s<q9.sC1+200&&FILR.vMin>=FILET.vFond*q9.vN){q9.paye=true;
      try{chaineAura('VIRAGE A FOND',120,'fond',true,false);flowAdd(14,'route');nitroGain(.25,'virage');hap([10,20,14]);}catch(e){}}
    FILR.ok=false;}
}
function filetRattrape(q){
  try{chaineAura('RATTRAPE',50,'filet',false,SONV2);flowAdd(6,'risque');hap([12,24,18]); // (un seul texte : celui de la chaîne — « moins de textes au milieu de l'écran », 661854a)
    if(SONV2)sfx('raccourci');}catch(e){}
}
function flowRaccourci(gagne,decl){ // decl : l'appelant fera partir la frénésie armée si le lieu l'accepte (tryLand, loi 20) — le portail, non : il a déjà son annonce de niveau
  (decl&&FLOW2.decl.racc?flowAddDecl:flowAdd)(Math.min(45,12+gagne*.06),'risque','m'); // (v4) couper la route : MACHIAVEL
  popTexte(TR('RACCOURCI')+' +'+Math.round(gagne)+' M','#7dffec',3);hap([12,24,18]);nitroGain(.3,'raccourci');
  try{chaineAura('RACCOURCI',Math.round(Math.min(250,60+gagne*.2)),'coupe',false,SONV2);}catch(e){}
  try{if(SONV2)sfx('raccourci');else{chimeNote(noteP(4,1),0,.09,.2);chimeNote(noteP(7,1),.08,.09,.26);}}catch(e){}
}
for(const [k,v] of Object.entries({'GRAVITE REDUITE : SAUTS 2 FOIS PLUS LONGS':'LOW GRAVITY: JUMPS LAST TWICE AS LONG','TRAVERSE LE NUAGE':'PIERCE THE CLOUD','PASSE LES PORTES':'THREAD THE GATES',
  'ET SI TU COUPAIS ?':'WHAT IF YOU CUT ACROSS?','DANSE AVEC LE RELIEF':'DANCE WITH THE HILLS','LE CIEL MENT':'THE SKY IS LYING',
  'TRAVERSE L\'ORAGE':'RIDE THROUGH THE STORM','ATTRAPE LA CAISSE-NUAGE':'CATCH THE CLOUD CAR','RACCOURCI !':'SHORTCUT!','RACCOURCI':'SHORTCUT',
  'ACCROCHE !':'LOCKED ON!','ELLE EST A TOI':'SHE IS YOURS','LA CAISSE-NUAGE':'THE CLOUD CAR',"ELLE T'A SEME":'SHE LOST YOU','NUAGES TERMINES':'CLOUDS COMPLETE',
  
  'FLIC AU TAPIS !':'COP DOWN!',
  'PERCE-NUAGE !':'CLOUD PIERCER!','PERCE-NUAGE':'CLOUD PIERCER',
  'Douce comme un nuage, elle file comme un orage. Un coucher de soleil, rien que pour toi.':'Soft as a cloud, fast as a storm. A whole sunset, just for you.'}))if(!(k in I18N))I18N[k]=v;
// (2026-09-30) les mots de la passe CAMPAGNE : la plaque de la caisse-nuage, les portes du niveau 4, les promesses de l'ESPACE — en anglais
for(const [k,v] of [['SILLAGE','SLIPSTREAM'],['DERRIERE TOI','BEHIND YOU'],
  
  ['LA CAISSE-NUAGE','THE CLOUD CAR'],['PORTES','GATES'],['PORTE','GATE'],['DANS','IN'],['RADAR','SPEED CAMERA'],
  ['MOUTONS','SHEEP'],['SAUTE-MOUTON','LEAPFROG'],['DOUBLE-TAP NITRO','DOUBLE-TAP NITRO'], // (2026-10-14, gameplay) SAUTE-MOUTON, le niveau 4 des NUAGES
  
  
  
  
  ]){if(!(k in I18N))I18N[k]=v;}
window.dbgOrage=function(q){ // (2026-09-29) L'ORAGE du mode principal : l'état des éclairs · dbgOrage('eclair') en fait tomber un tout de suite
  if(q==='eclair'){if(!(LVL.cur&&(LVL.cur.id==='orage'||LVL.cur.orage)))return 'pas au niveau orage';eclFrappe();ECL.t=6;}
  return {lieu:LVL.cur&&LVL.cur.id,flash:+CAMP_FLASH.toFixed(3),brumeOuverte:Math.round(CAMP_FOG),prochain:+ECL.t.toFixed(2),pluie:+LVL.pluie.toFixed(2),brume:[Math.round(scene.fog.near),Math.round(scene.fog.far)],bancs:CLOUDS.filter(function(c){return c.onRoad||c.mesh&&c.mesh.userData.trav;}).length,nuages:CLOUDS.length};};
function jadePlayOk(){return JADE_PLAY&&!PARK.on&&!SURV.armed&&!!(SAVE.d.tuto||SAVE.d.permis);} // un tout premier joueur passe d'abord par l'auto-école
function jadeJouer(){ // (2026-10-12) lancer le SOLEIL DE JADE : la piste sous le voile (si elle n'est pas déjà là), l'atelier, le lâcher
  if(pendingScore!=null||(started&&!gameOver))return 'en course';if(ecranWipe._on||(typeof GAR!=='undefined'&&GAR.go))return 'occupé';
  JADE_JEU=true;if(PARK.on){PARK.on=false;try{modeLbl();}catch(e){}}
  const ici=LVL.cur&&LVL.cur.id==='jade'&&!!JADE.root;
  ecranWipe(function(){runStats.zones=0;if(!started)vdepPose();if(!ici)rebuildMenuScene();if(!garageOn)openGarage(true);},function(){garageLaunch();});return JADE_NOM;} // (LA VITESSE DE DÉPART) le 1er départ de la session part du cran choisi : posé avant la piste
window.dbgNiveauJade=jadeJouer; // (le simulateur l'appelle)
window.dbgNiveauCrypto=function(m){SF.force={carte:'crypto',meteo:m||null};return classiqueJouer();};
window.dbgNiveauVitre=function(m){SF.force={carte:'vitree',meteo:m||null};return classiqueJouer();}; // (2026-10-17) LA VILLE VITRÉE tout de suite (matin, midi, soir, nuit) // (2026-10-15) CRYPTO CITY tout de suite (une météo : matin, midi, soir, nuit)
function classiqueJouer(){ // (2026-10-13, Sacha) JOUER = le MODE CLASSIQUE AU HASARD : la 1re map et sa météo tirées, la piste bâtie sous le voile (le chemin de jadeJouer)
  if(pendingScore!=null||(started&&!gameOver))return 'en course';if(ecranWipe._on||(typeof GAR!=='undefined'&&GAR.go))return 'occupé';
  JADE_JEU=false;if(PARK.on){PARK.on=false;try{modeLbl();}catch(e){}}
  if(typeof cielChoixImpose==='function')cielChoixImpose(); // (2026-10-21) le ciel choisi à l'accueil
  const t=SF.force?sfImpose(SF.der):(SF.prochain&&SF.prochainDer===SF.der?SF.prochain:sfTire(SF.der));SF.prochain=null;SF.tirage=[t];SF.der=t;SF.neuf=true;SF.pret=true; // neuf : le REJOUER de garageLaunch (resetGame) garde ce tirage · prochain : celui que la vignette du garage annonçait — (2026-10-19) le tirage D'AVANCE du départ (prebDepCible)
  /* (2026-10-19, LE DÉPART D'AVANCE) sous9 : au 1er JOUER de la session, la piste du départ bâtie au menu est PRISE (prebDepPrend) ; après une
     partie, sous le nuage blanc ou le voile chaud (leger : resetGame suit dans la même image), la piste de sous9 n'est jamais dessinée — elle se
     fait légère (son ciel seul) et resetGame prend la sienne, la caméra reposée comme closeGarage l'aurait fait (PREB.cam). */
  const sous9=function(leger){runStats.zones=0;if(!started)vdepPose();if(leger===true&&PREB.on&&started&&gameOver){PREB.ntLeger=true;PREB.cam=true;PREB.legers++;rebuildMenuScene();}else prebDepPrend(rebuildMenuScene);try{jadeGabarits();}catch(e){}};
  /* (2026-10-15, Sacha : « améliore l'animation du lancement ») MESURÉ (film du JOUER, accueil debout) : la caisse est DÉJÀ dans le ciel du
     menu, et le JOUER passait d'abord par le balayage pixel (≈ 0,45 s d'écran sombre) pour rebâtir la piste… puis rouvrait le MÊME ciel
     et lançait le piqué. Depuis le ciel, elle pique tout de suite : la piste tirée se bâtit sous le NUAGE BLANC de la fin du piqué
     (`CHUTE.sous`, juste avant start/resetGame — le voile tient jusqu'à la 1re image rendue). Ailleurs (atelier, boutique) : le balayage. */
  if(garageOn&&CHUTE.on&&!CHUTE.go){CHUTE.sous=function(){sous9(true);};garageLaunch();if(CHUTE.go)return t;CHUTE.sous=null;}
  /* (2026-10-15, Sacha : « une fois le bouton pressé dans le garage, il faut que tu retrouves l'animation où la voiture s'avance dans les
     flammes ») DEPUIS L'ATELIER, même principe : le balayage d'abord (écran sombre + la piste rebâtie : ≈ 0,5 s au PC, bien plus sur
     téléphone) passait AVANT le lâcher. Le LÂCHER part sur l'appui — la caisse roule dans le rideau de flammes — et la piste tirée se bâtit
     sous le VOILE CHAUD de la fin (`GAR.sous`, juste avant start/resetGame, voir garageRender). La boutique et l'accueil gardent le balayage. */
  if(garageOn&&!CHUTE.on&&!GAR.go&&GAR.root&&!GBQ.on&&!GBQ.veut&&gEl&&!gEl.classList.contains('menu')){GAR.sous=function(){sous9(true);};garageLaunch();if(GAR.go)return t;GAR.sous=null;}
  ecranWipe(function(){sous9();if(!garageOn)openGarage(true);},function(){garageLaunch();});return t;} // jadeGabarits : taillés une fois par session, sous le voile (≈ 0,7 s de moins au 1er portail vers la jade)
const NIT_GRONDE=.3; /* le grondement du nitro (4e passe, 12/10 : ,4 → ,3) — resté seul de l'ancien bloc de la musique du SOLEIL DE JADE */
window.dbgQuitte=function(){ // (2026-10-12, le simulateur) finir la course en cours SANS explosion — comme QUITTER du panneau ⏸
  if(!started||gameOver)return 'pas de course';if(TUTO.on)tutoQuitte();const sb=SANDBOX;SANDBOX=false;endGame();SANDBOX=sb;return 'fini';};
// ---- LES OUTILS DE ZONE (ex-campagne VILLE) : la place sur le ruban, la vitesse, la paie, les matières partagées, la plaque du haut ----
function vPos(){return mode==='fall'?lastNearS:s;}         // où l'on en est le long du ruban, même en vol
function vKmh(){return (mode==='fall'?volH(fallVel):Math.abs(vA)*vitMult())*3.6*SPD;} // (2026-09-30) au sol, la VRAIE vitesse d'avance (× vitMult : NITROOO, VITESSE ×2 — celle du compteur, speedKmh) : tenir NITROOO devant un radar ne changeait rien
function vPaie(k,n,src){const g=denom()*k*(fever>0?2:1)*flowMult();money+=g;levelCash+=g;livre(src||'$:ville',g);/* (2026-10-14, GAMEPLAY) src : la ligne du grand livre — LES ÉVÉNEMENTS RARES versent sous '$:evt' */try{checkUpgrade();}catch(e){}if(n)try{flyCash(carGroup.position,n);}catch(e){}frenCash(g,carGroup.position);return g;} // (×3) en frénésie, le butin de la ville se voit aussi
function vMat(m){m.dispose=function(){};return m;}          // une matière PARTAGÉE : la reconstruction ne la jette jamais
// ---- LA PLAQUE : ce qu'on LIT, en haut de l'écran (charte : le haut est pour lire, le bas pour toucher) ----
let vChipEl=null,vChipK='';
function vChip(txt,sous,col,alerte){
  if(!vChipEl){vChipEl=document.createElement('div');vChipEl.id='campChip';vChipEl.setAttribute('aria-hidden','true');vChipEl.innerHTML='<b></b><small></small>';document.body.appendChild(vChipEl);hasMaj();}
  const k=(txt||'')+'|'+(sous||'')+'|'+(col||'')+'|'+(alerte?1:0);if(k===vChipK)return;vChipK=k;
  if(!txt){vChipEl.classList.remove('on','alerte');return;}
  vChipEl.firstChild.textContent=txt;vChipEl.lastChild.textContent=sous||'';vChipEl.lastChild.style.display=sous?'':'none';
  vChipEl.style.setProperty('--cc',col||'#ffd75e');vChipEl.classList.add('on');vChipEl.classList.toggle('alerte',!!alerte);hudReveil('campChip'); /* l'objectif change : il se rallume (HUD discret) */
}
function villeApres(){ // crochet : APRÈS musicTick (qui repeint le néon de la route à chaque image depuis sa teinte de base)
  const nu=LVL.nuit; // (2026-09-30) MINUIT EN VILLE : 3 fenêtres sur 4 éteintes, les néons de la route à 40 %, des phares xénon qui portent à ~260 m
  /* (2026-10-14, passe graphismes · facades-jour) LE JOUR DES FAÇADES (CITY.uJ, lu par villeMatTours) : `uJour` seul ne dit pas le jour —
     minuit, la pluie et l'orage de la ville ont aussi jour:1 (le dégradé d'altitude). On le croise avec la ville PEINTE du ciel (`city` :
     matin .25, midi .12 · soir 1,1, pluie et orage 1,2) et avec la nuit du niveau. Fondu comme l'ambiance au portail (bioLerp). */
  CITY.uJ.value=CITY.uJf!=null?CITY.uJf:skyU.uJour.value*(1-nu)*(1-THREE.MathUtils.smoothstep(skyU.uCity.value,.45,.95));
  CITY.uC.value=1-.72*nu;
  const k=1-.6*nu;
  /* (2026-10-17, continuité) « néons pleins la nuit » : la baisse des néons de route de MINUIT EN VILLE ne touche plus les six maps de la continuité
     (elle tombait sur toutes les routes de nuit : rails roses à 44 %, nappe à 20 %) */
  if(k<.999&&!contiMap()){const kr=.07+.93*k; // on ne baisse QUE ce que musicTick repeint (userData.base) : rien ne s'accumule d'une image à l'autre
    for(let i=0;i<NEON_RAILS.length;i++){const m=NEON_RAILS[i];if(m.userData.base)m.color.multiplyScalar(kr);}
    for(let i=0;i<NEON_GLOW.length;i++){const m=NEON_GLOW[i];if(m.userData.base!=null)m.opacity*=kr*kr;}}
  if(k<.999||villeApres.ph){villeApres.ph=k<.999;headSpot.distance=72+64*(1-k)+120*nu;if(mode!=='boom')headSpot.intensity=1.85*(1+.9*(1-k)+1.6*nu);headSpot.angle=.5+.12*nu;} // 1,85 : la valeur que la boucle pose (phares de course)
  if(nu>.001||PHARE_FX.col){PHARE_FX.col=nu>.001;headSpot.color.setRGB(1-.12*nu,.85+.1*nu,.63+.37*nu);} // du jaune halogène au BLANC xénon
}
// ============ LE LINGOT — la caisse du garage ============
// Un lingot d'or monté sur roues — un tronc de pyramide (CylinderGeometry à quatre pans, tourné de 45°), facettes franches, une plaque
// POINÇONNÉE sur le dessus (999,9), une visière noire.
// (mesuré sur la planche du banc d'essai) à 0xffc33a le lingot sortait JAUNE PÂLE, presque blanc : l'or est un MÉTAL — peu de diffus, un
// spéculaire doré qui porte la couleur. Base cuivrée plus sombre, reflet or : il se lit « or » au soleil de midi comme dans la nuit.
const LINGOT_MAT=vMat(new THREE.MeshPhongMaterial({color:0xc08a1c,emissive:0x221300,specular:0xffe39a,shininess:85,flatShading:true,envMap:envTex,reflectivity:.22,combine:THREE.MixOperation}));
const LINGOT_PL=(function(){ // la plaque poinçonnée : or plus sombre, cadre, lettres pixel en creux
  const cv=document.createElement('canvas');cv.width=128;cv.height=256;const t=new THREE.CanvasTexture(cv);
  const des=function(){const x=cv.getContext('2d');x.fillStyle='#d99a1c';x.fillRect(0,0,128,256);x.strokeStyle='#8a5a06';x.lineWidth=6;x.strokeRect(8,8,112,240);
    x.fillStyle='#8a5a06';x.textAlign='center';x.textBaseline='middle';x.font='14px "Press Start 2P",monospace';
    x.fillText('CASH',64,60);x.fillText('CAR',64,84);x.font='18px "Press Start 2P",monospace';x.fillText('999',64,136);x.fillText(',9',64,162);x.font='10px "Press Start 2P",monospace';x.fillText('1 KG',64,206);t.needsUpdate=true;};
  des();try{if(document.fonts&&document.fonts.load)document.fonts.load('14px "Press Start 2P"').then(des).catch(function(){});}catch(e){}
  return vMat(new THREE.MeshPhongMaterial({map:t,specular:0xfff2c0,shininess:70,emissive:0x2a1a00}));
})();
function lingotGeo(){const g=new THREE.CylinderGeometry(.74,1,1,4,1);g.rotateY(Math.PI/4);g.scale(1.414,.95,2.97);g.translate(0,.475,0);return g;} // base 2 × 4,2 m, dessus 1,5 × 3,1 m, 95 cm de haut
SHAPES.lingot=function(K){ // la caisse du garage — buildCar pose les roues, les feux et les pots aux ancrages rendus
  const b=new THREE.Mesh(lingotGeo(),LINGOT_MAT);b.position.y=.5;K.add(b);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.4),LINGOT_PL);p.rotation.x=-Math.PI/2;p.position.set(0,1.452,-.2);K.add(p);
  K.box(1.2,.16,.5,K.glass,0,1.53,.95);                                        // la visière
  K.box(1.9,.2,3.9,K.dark,0,.42,0);                                            // le châssis
  K.box(1.76,.12,.16,K.chrome,0,.5,2.12);
  /* L'ARRIÈRE v2 (2026-10-17, Sacha : « il faut que chaque voiture, on ait envie de l'acheter » — la revue des poupes) : c'était un trapèze
     jaune nu, deux pavés rouges et une barre chromée, sur la 2e caisse la plus chère. Désormais, posés SUR la face penchée du lingot :
     · LES RUBIS TAILLÉS : deux feux en pierre taillée — la table, huit facettes en trois rouges (le haut attrape la lumière), un chaton
       d'or sombre ; une petite pièce `L` cachée sous la table donne leur place aux traînées de lumière (CAR_FEUX) ;
     · LE POINÇON : « 999,9 » frappé au milieu de la face, dans un cartouche d'or sombre — la même toile que le dessus (LINGOT_PL, la
       région du titre) : aucune matière neuve ;
     · LE BOUCLIER doré chanfreiné et sa rainure ; LE DIFFUSEUR sombre à ailettes d'or où s'encastrent les deux pots (ECH_POTS.lingot,
       inchangés). Les feux-boîtes communs (`tl`) passent DANS la caisse, invisibles : les rubis les remplacent. L'avant est intact. */
  {const al=Math.atan2(.546,.95),ca=Math.cos(al),sa=Math.sin(al),                   // la face arrière penche de 30° (1,554 m en haut, 2,10 m en bas)
        F=(u,v,n)=>[u,.5+v*ca+n*sa,-2.1+v*sa-n*ca],                                 // un point de la face : u en travers, v en montant la pente, n en dehors
        P=K.kit({o:{g:'o',c:0xd9a520},O:{g:'o',c:0x8a5a06},k:{g:'m',c:0x141418},K:{g:'g',c:0x0b0c0f},
          L:{g:'l',c:0xff1a2a},Q:{g:'l',c:0xc8101e},r:{g:'l',c:0x7e0a14},R:{g:'l',c:0xff7a84}});
   const T=(k,a,b,c)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2]; // une facette, tournée vers le dehors
     if((uz*vx-ux*vz)*sa-(ux*vy-uy*vx)*ca<0)P.tri(k,a,c,b);else P.tri(k,a,b,c);};
   const quad=(k,u0,v0,u1,v1,n)=>{const a=F(u0,v0,n),b=F(u1,v0,n),c=F(u1,v1,n),d=F(u0,v1,n);T(k,a,b,c);T(k,a,c,d);};
   const oct=(cu,cv,w,h,s,n)=>{const o=[],r=1/Math.cos(Math.PI/8);for(let i=0;i<8;i++){const a=(i+.5)/8*Math.PI*2;o.push([cu+Math.cos(a)*w/2*r*s,cv+Math.sin(a)*h/2*r*s,n,Math.sin(a)]);}return o;};
   P.sym(sd=>{const cu=sd*.60,cv=.29,w=.30,h=.16;
     const ch=oct(cu,cv,w,h,1.28,.003);for(let i=0;i<8;i++)T('O',F(cu,cv,.003),F(...ch[i]),F(...ch[(i+1)%8]));      // le chaton d'or sombre
     const b=oct(cu,cv,w,h,1,.006),t=oct(cu,cv,w,h,.56,.042);
     for(let i=0;i<8;i++){const j=(i+1)%8,m=(b[i][3]+b[j][3])/2;const k=m>.3?'R':m<-.3?'r':'Q';               // les facettes : le haut clair, le bas sombre
       T(k,F(...b[i]),F(...b[j]),F(...t[j]));T(k,F(...b[i]),F(...t[j]),F(...t[i]));
       T('L',F(cu,cv,.042),F(...t[i]),F(...t[j]));}                                                         // la table
     const q=F(cu,cv,.02);P.box('L',.04,.02,.01,q[0],q[1],q[2]);                                            // (le repère des traînées, sous la table)
   });
   /* le cartouche du poinçon : un cadre d'or sombre, et le titre en relief (la toile du dessus) */
   for(const [u0,v0,u1,v1] of [[-.36,.42,.36,.46],[-.36,.86,.36,.90],[-.36,.46,-.32,.86],[.32,.46,.36,.86]])quad('O',u0,v0,u1,v1,.004);
   {const g=new THREE.PlaneGeometry(.60,.38),uv=g.attributes.uv;                  // la région « 999 / ,9 » de LINGOT_PL (x 8-120, y 112-184 sur 128 × 256)
    for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)>.5?.9375:.0625,uv.getY(i)>.5?.5625:.28125);
    const m=new THREE.Mesh(g,LINGOT_PL),q=F(0,.66,.005);m.position.set(q[0],q[1],q[2]);m.rotation.set(al,Math.PI,0);K.add(m);}
   /* le bouclier chanfreiné, sa rainure, le diffuseur et ses ailettes */
   P.prism('o',[[-1.98,.34],[-2.18,.34],[-2.24,.40],[-2.24,.55],[-2.18,.61],[-2.04,.61]],1.84,0);
   P.box('K',1.80,.014,.012,0,.53,-2.243);
   P.box('k',1.40,.12,.02,0,.42,-2.248);
   for(const x of [-.66,-.26,-.13,0,.13,.26,.66])P.box('O',.014,.12,.03,x,.42,-2.262);
   K.commit(P);}
  return {hl:[.62,.66,2.16],tl:[.62,.62,-1.90],wr:.95,wx:1.0,wz:1.36,split:0,skirt:0,sp:0,doors:0,slats:0,wings:'none',glowX:1.02,glowY:.5,glowL:3.2,glowF:0}; // tl : DANS la caisse (les rubis font les feux)
};
function meuteTick(){ // la PLAQUE du Survivant au téléphone (2026-09-30) : ton rang, la minute — rouge et clignotante quand tu es dernier
  if(!SURV.on){vChip('');return;}
  const pT=survPTot();let rk=1,vv=0;for(const b of SURV.bots)if(b.alive){vv++;if(b.totD>pT)rk++;}
  const clk='0:'+String(Math.max(0,Math.ceil(60-SURV.t))).padStart(2,'0');
  if(SURV.over)vChip(TR(vv?'SURVIVANT':'CHAMPION !'),'','#ffd75e');
  else if(vv&&SURV.last)vChip(TR('DERNIER !'),TR('EXPLOSION DANS')+' '+clk,'#ff5e7a',true); // (2026-09-30) SURV.last, le verdict du couperet (rendu au sol) : la plaque et le bip disent la même chose
  else vChip(TR('RANG')+' '+rk+' / '+(vv+1),TR('COUPERET DANS')+' '+clk,rk===1?'#ffd75e':'#9fe8ff');
}
for(const [k,v] of Object.entries({'FAIS-TOI FLASHER':'GET FLASHED','LIS LES FLAQUES':'READ THE PUDDLES',
  'NE FINIS PAS DERNIER':"DON'T FINISH LAST",'ESQUIVE LA FOUDRE':'DODGE THE LIGHTNING','ROULE DANS LE NOIR':'DRIVE IN THE DARK','VIDE LE FOURGON':'EMPTY THE CASH TRUCK',
  "SAUTE D'UN ETAGE":'DROP A FLOOR','BATS LE BANQUIER':'BEAT THE BANKER',
  'RADAR':'SPEED CAMERA','DANS':'IN',
  'LIGNE':'LINE','LIGNE PARFAITE':'PERFECT LINE','PARFAITE !':'PERFECT!','CASSEE':'BROKEN',
  'A SEC':'BONE DRY','FLAQUES':'PUDDLES',
  'RANG':'RANK','DERNIER !':'LAST!','EXPLOSION DANS':'BLAST IN','COUPERET DANS':'ELIMINATION IN','SURVIVANT':'SURVIVOR','CHAMPION !':'CHAMPION!','LA MEUTE EST AU TAPIS':'THE WHOLE PACK IS DOWN',
  'ESQUIVE':'DODGE',
  
  
  'FOURGON':'CASH TRUCK','BANQUIER':'BANKER',
  'DEVANT':'AHEAD','BRAQUAGE':'HEIST',
  'BOUCHON':'TRAFFIC JAM',
  '1ER':'1ST','2E':'2ND','TU MENES !':'YOU LEAD!',
  
  'LE LINGOT':'THE GOLD BAR',
  'Il dormait au fond du coffre-fort. Tu viens de le sortir : 999,9 millièmes de pure arrogance.':'It slept at the back of the vault. You just took it out: 999.9 fine, and pure arrogance.'}))if(!(k in I18N))I18N[k]=v;
