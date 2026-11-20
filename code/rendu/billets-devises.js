/* LES BILLETS EN UN APPEL DE DESSIN (2026-09-26, vague 2) : chaque billet était un `Mesh` NEUF (un appel de dessin chacun) — à la mort,
   8 à 60 billets + ceux de la signature, soit jusqu'à ~100 appels sur l'image la plus chargée du jeu. Désormais UN `InstancedMesh` de 150
   places et 150 repères (`Object3D` hors scène) créés une fois ; `billsTick` pose leurs matrices. CHAUFFE : il reste visible (0 instance)
   jusqu'à sa première image dessinée — son programme (instancié) existe avant la première mort. */
const BILL_N=150,BILL_IM=new THREE.InstancedMesh(billGeo,billNoteM,BILL_N),BILL_O=[];
for(let i=0;i<BILL_N;i++)BILL_O.push(new THREE.Object3D());
BILL_IM.instanceMatrix.setUsage(THREE.DynamicDrawUsage);BILL_IM.count=0;BILL_IM.frustumCulled=false;scene.add(BILL_IM);
BILL_IM.onAfterRender=function(){BILL_IM.userData.chaud=true;delete BILL_IM.onAfterRender;};
// crâne pixelisé (éjecté à l'explosion)
const skullTex=(function(){
  const cv=document.createElement('canvas');cv.width=16;cv.height=16;
  const c=cv.getContext('2d');
  c.fillStyle='#ffffff';
  c.fillRect(4,2,8,7);                       // crâne
  c.fillRect(3,4,10,4);                      // tempes
  c.fillRect(5,9,6,2);                       // mâchoire
  c.fillRect(5,11,6,2);                      // dents
  c.fillStyle='#000000';
  c.fillRect(5,4,2,2);c.fillRect(9,4,2,2);   // orbites
  c.fillRect(7,7,2,1);                       // nez
  c.fillRect(6,11,1,2);c.fillRect(8,11,1,2);c.fillRect(10,11,1,2); // séparations dents
  const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;return t;
})();
const skulls=[];
const bills=[];
let billT=0;
function spawnBill(pos,v,life){
  if(bills.length>=BILL_N)return;
  let b=null;for(const o of BILL_O)if(!o.userData.pris){b=o;break;}if(!b)return; // un repère libre (jamais de `new` ici)
  b.userData.pris=true;b.position.copy(pos);b.rotation.set(0,0,0);b.scale.setScalar(1);
  bills.push({m:b,v:v,rx:(Math.random()-.5)*9,ry:(Math.random()-.5)*9,life:life,ph:Math.random()*6.2832}); // ph : la phase de son VOLETTEMENT
}
function billsTick(dt){
  let n=0;
  for(let i9=bills.length-1;i9>=0;i9--){
    const b9=bills[i9];
    b9.life-=dt;b9.v.y-=4.5*dt;b9.v.multiplyScalar(Math.max(0,1-.6*dt));
    b9.m.position.addScaledVector(b9.v,dt);
    // (2026-09-26, passe graphique) LE BILLET VOLETTE : un billet ne tombe pas comme une pierre, il se balance de gauche à droite
    // (feuille morte) et se couche dans le vent ; en fin de vie il se REPLIE au lieu de disparaître d'un coup
    {const sw9=Math.sin(b9.ph+b9.life*6.5);b9.m.position.x+=sw9*1.5*dt;b9.m.position.z+=Math.cos(b9.ph*1.7+b9.life*5.1)*1.1*dt;
     b9.m.rotation.x+=b9.rx*dt*(.55+.45*sw9);b9.m.rotation.y+=b9.ry*dt;b9.m.scale.setScalar(Math.min(1,Math.max(.001,b9.life/.3)));}
    if(b9.life<=0){b9.m.userData.pris=false;bills.splice(i9,1);continue;}
    b9.m.updateMatrix();BILL_IM.setMatrixAt(n++,b9.m.matrix);
  }
  if(n||BILL_IM.count){BILL_IM.count=n;imEnvoi(BILL_IM,n);} // (2026-10-14) n premières seulement (150 places) ; rien quand la dernière vient de s'éteindre
  const v=n>0||!BILL_IM.userData.chaud;if(BILL_IM.visible!==v)BILL_IM.visible=v;
}
function billsClear(){for(const b of bills)b.m.userData.pris=false;bills.length=0;BILL_IM.count=0;if(BILL_IM.userData.chaud)BILL_IM.visible=false;}
// petits bouts qui se détachent de la caisse
const chips=[];
let chipT=6;
function dropChip(n){
  if(SONV2&&n>0){const n9=performance.now();if(n9>(dropChip._t||0)){dropChip._t=n9+450;sfx('debris.tole',{vol:Math.min(4,(n-1)*1.5)});}} // (console de son) la tôle qui part s'entend — un cliquetis au plus toutes les 0,45 s
  const spec=CARS[level];
  for(let k=0;k<n;k++){
    const d=new THREE.Mesh(new THREE.BoxGeometry(.07+Math.random()*.14,.04+Math.random()*.07,.07+Math.random()*.14),
      new THREE.MeshPhongMaterial({color:Math.random()<.6?spec.color:spec.accent,shininess:60}));
    d.position.copy(carGroup.position);d.position.y+=.4;
    chips.push({m:d,v:new THREE.Vector3((Math.random()-.5)*6,2+Math.random()*3,(Math.random()-.5)*6),
      rx:(Math.random()-.5)*10,ry:(Math.random()-.5)*10,life:1.6});
    scene.add(d);
  }
}
const TRL=38,trailQ=[];
const trailGeo=new THREE.BufferGeometry();
trailGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(TRL*2*3),3));
trailGeo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(TRL*2*3),3));
(function(){const idx=[];for(let i=0;i<TRL-1;i++){const a=2*i,b=2*i+1,c=2*i+2,e=2*i+3;idx.push(a,c,b,b,c,e);}trailGeo.setIndex(idx);})();
const trailMesh=new THREE.Mesh(trailGeo,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
trailMesh.frustumCulled=false;trailMesh.visible=false;scene.add(trailMesh); // (2026-09-26) éteinte : voir la boucle (le TAPIS orange)
function spawnP(pool,x,y,z,vx,vy,vz,life){
  const i=pool.head;pool.head=(i+1)%pool.n;
  pool.pos[i*3]=x;pool.pos[i*3+1]=y;pool.pos[i*3+2]=z;
  pool.vel[i*3]=vx;pool.vel[i*3+1]=vy;pool.vel[i*3+2]=vz;
  pool.life[i]=life;
  if(pool.fa){pool.l0[i]=life>0?life:1;pool.fa[i]=1;} // (particules v2) la vie de naissance : la courbe de fondu s'y mesure
  if(!pool.mesh.visible&&!pool.masque)pool.mesh.visible=true; // (vague 2) la réserve endormie se réveille
  pool.dort=false; // (2026-09-27) …et updatePool recommence à la parcourir
}
function updatePool(pool,dt,grav){
  // (2026-09-27, passe perf iPhone) une réserve ENDORMIE (tout est mort, rangé, mesh éteint) n'a plus rien à faire : on ne
  // reparcourt plus ses centaines de cases à chaque image. Seul `spawnP` la réveille (il est le seul à redonner de la vie).
  if(pool.dort)return;
  let vivant=false;const fa=pool.fa,tr=pool.drag||0,ac=(pool.acc||0)*dt; // `acc` : une VRAIE gravité (m/s²) — l'étincelle monte puis retombe en arc // (particules v2) `drag` : la fumée FREINE dans l'air (elle ne file plus comme une balle)
  const kd=tr>0?Math.exp(-tr*dt):1;
  for(let i=0;i<pool.n;i++){
    if(pool.life[i]>0){vivant=true;
      pool.life[i]-=dt;
      if(tr>0){pool.vel[i*3]*=kd;pool.vel[i*3+1]*=kd;pool.vel[i*3+2]*=kd;}
      if(ac)pool.vel[i*3+1]-=ac;
      pool.pos[i*3]+=pool.vel[i*3]*dt;
      pool.pos[i*3+1]+=(pool.vel[i*3+1]+grav)*dt;
      pool.pos[i*3+2]+=pool.vel[i*3+2]*dt;
      if(fa)fa[i]=pool.life[i]>0?pool.life[i]/pool.l0[i]:0;
      if(pool.life[i]<=0)pool.pos[i*3+1]=-99999;
    }
  }
  if(vivant||pool._vivant){const at=pool.mesh.geometry.attributes;at.position.needsUpdate=true; // (2026-09-26) un pool vide n'est plus renvoyé au GPU à chaque image (une dernière fois pour ranger les morts)
    if(fa){at.aF.needsUpdate=true;if(at.aVel){at.aVel.needsUpdate=true;pool.fx.uG.value=grav;}}} // (la « gravité » d'updatePool est une vitesse constante : le trait la suit)
  if(!vivant&&!pool._vivant&&pool.chaud&&pool.mesh.visible)pool.mesh.visible=false; // (vague 2) vide depuis une image (les morts sont rangés) : plus un appel de dessin
  pool._vivant=vivant;
  if(!vivant&&!pool.mesh.visible)pool.dort=true; // rien de vivant, rien à ranger, rien à dessiner : exactement l'état qu'un tour de plus laisserait intact
}
// ---------- PLUIE DE DEVISES : à 4 000 € (puis ×2,6), les monnaies du monde défilent ----------
/* (2026-09-26, vague 2 « L'ENCRE ET L'OR ») LA PLUIE EN UN APPEL DE DESSIN. Elle fabriquait 3 sprites NEUFS par image pendant 3 s — 540
   `SpriteMaterial` créés puis jetés, et jusqu'à ~540 appels de dessin à la fin de l'averse : l'à-coup garanti sur iPhone, pile pendant la
   fête — en 15 couleurs pastel. Désormais : UN atlas cuit une fois (15 glyphes en OR de l'argent — clair en haut, ombre en bas — cerclés
   d'un LISERÉ d'encre #1c0430, comme tout ce qui rapporte), 600 panneaux instanciés (`mkPanneaux`), tableaux fixes, zéro allocation.
   Le mouvement est celui d'avant (ça tournoie en tombant, fondu la dernière seconde). */
const CURR=['€','€','¥','£','€']; // (2026-10-15, UNE SEULE POLICE) les cinq que la police pixel DESSINE — ₹ ₩ ₽ ฿ ₺ ₪ ₫ ₴ ₦ ₱ tombaient dans une police de secours (mesuré)
/* ===== LA PLUIE EN VOLUME QUI REBONDIT (2026-11-20, Léo : « un peu plus beau, un peu plus 3D, et ça tombe sur la route et rebondit ») =====
   Trois choses, sans un triangle ni un appel de dessin de plus (mêmes 600 panneaux, même programme, même atlas 256 × 256) :
   · LE VOLUME : chaque glyphe est cuit en BLOC — une tranche de 6 px qui part en bas à droite, plus sombre que la face (facettes : voir plus bas).
   · LA ROTATION : le panneau s'écrase en largeur (cos de son angle) — il TOURNE sur lui-même comme une pièce, et sa face ÉCLATE quand elle
     passe devant l'œil (couleur > 1 : le bloom la prend là où il existe).
   · LA CHUTE : une vraie gravité, dans le repère de la ROUTE (sa normale, prise à la naissance du glyphe par `frameAt`) : il tombe sur la
     dalle, REBONDIT deux ou trois fois, glisse et s'éteint. Ceux qui naissent hors de la chaussée tombent dans le vide.
   La couleur reste le RGB d'instance (un tour d'arc-en-ciel en ~2,5 s). `dbgPluie()` la lance en course. */
/* ===== LES FACETTES, SANS LISERÉ (2026-11-20, Léo : « une teinte un peu moins jouet · enlève les bords pour faire des trucs 3D facette ») =====
   Plus de cerne d'encre : le glyphe est un SOLIDE CISELÉ — un plat et quatre chanfreins (voir LA FACE EN BISEAU), et la tranche a deux pans
   (le dessous plus sombre que le côté).
   La teinte : un MÉTAL IRISÉ — l'arc-en-ciel d'instance à demi-saturé, plus lent, avec un éclat BLANC quand la face passe devant l'œil. */
const MONN_TEX=(function(){
  const S=64,cv=document.createElement('canvas');cv.width=cv.height=S*4;const c=cv.getContext('2d'),tx=new THREE.CanvasTexture(cv);
  const tc=document.createElement('canvas');tc.width=tc.height=S;const q=tc.getContext('2d'); /* la toile d'UN glyphe : on y taille (source-atop), puis on la pose dans l'atlas */
  apresPolice(function(){c.clearRect(0,0,S*4,S*4);
  q.textAlign='center';q.textBaseline='middle';q.font='38px "Press Start 2P",monospace';
  for(let i=0;i<CURR.length;i++){const x=S/2-3,y=S/2-1,E=6,ox=(i&3)*S,oy=(i>>2)*S;
    /* LA TRANCHE : six couches vers le bas à droite, puis deux pans — tout ce qui est sous la diagonale (le dessous) s'assombrit */
    q.globalCompositeOperation='source-over';q.clearRect(0,0,S,S);
    for(let k=E;k>=1;k--){const v9=58+((E-k)*7)|0;q.fillStyle='rgb('+v9+','+v9+','+v9+')';q.fillText(CURR[i],x+k,y+k);}
    q.globalCompositeOperation='source-atop';q.fillStyle='rgba(0,0,0,.42)';q.beginPath();q.moveTo(0,S*.2);q.lineTo(S*.8,S);q.lineTo(0,S);q.closePath();q.fill();
    c.drawImage(tc,ox,oy);
    /* LA FACE EN BISEAU (2026-11-20, Léo : « facetté pas comme ça, pas de point au milieu ») : plus d'éventail. Le glyphe est CISELÉ comme une
       lettre gravée — un plat au centre, et quatre chanfreins de 2 px sur ses bords, chacun sa lumière : le haut blanc, la gauche claire,
       la droite dans l'ombre, le bas sombre. Un chanfrein = le glyphe MOINS le glyphe décalé de 2 px du côté opposé. */
    q.globalCompositeOperation='source-over';q.clearRect(0,0,S,S);q.fillStyle='rgb(196,196,196)';q.fillText(CURR[i],x,y);
    q.globalCompositeOperation='source-atop';q.fillStyle='#ffffff';q.beginPath();q.moveTo(0,S*.50);q.lineTo(S,S*.16);q.lineTo(S,S*.34);q.lineTo(0,S*.68);q.closePath();q.fill(); /* (2026-11-20, Léo : « plus vif, jouet moderne ») LE VERNIS : une bande de reflet en travers du plat, comme sur un plastique brillant */
    c.drawImage(tc,ox,oy); /* le plat verni */
    const CH=[[2,0,232],[-2,0,124],[0,2,255],[0,-2,92]]; /* gauche · droite · haut · bas : (décalage du glyphe qu'on retire, gris du pan) */
    for(let k=0;k<4;k++){q.globalCompositeOperation='source-over';q.clearRect(0,0,S,S);q.fillStyle='rgb('+CH[k][2]+','+CH[k][2]+','+CH[k][2]+')';q.fillText(CURR[i],x,y);
      q.globalCompositeOperation='destination-out';q.fillText(CURR[i],x+CH[k][0],y+CH[k][1]);c.drawImage(tc,ox,oy);}
    q.globalCompositeOperation='source-over';}
  tx.needsUpdate=true;});
  return tx;
})();
const MONN_N=600,MONN=mkPanneaux(MONN_N,MONN_TEX,4,4,false,1,2);
const MR={x:new Float32Array(MONN_N),y:new Float32Array(MONN_N),z:new Float32Array(MONN_N),vx:new Float32Array(MONN_N),vy:new Float32Array(MONN_N),
  vz:new Float32Array(MONN_N),ph:new Float32Array(MONN_N),rs:new Float32Array(MONN_N),rot:new Float32Array(MONN_N),life:new Float32Array(MONN_N),
  sc:new Float32Array(MONN_N),f:new Uint8Array(MONN_N),head:0,viv:0,acc:0,reb:0,choc:0,cx:0,cy:0,cz:0,cok:false,tap:new Uint8Array(MONN_N), /* choc : les glyphes percutés par la caisse · cx,cy,cz : où elle était l'image d'avant · tap : déjà percuté (une seule fois chacun) */
  nx:new Float32Array(MONN_N),ny:new Float32Array(MONN_N),nz:new Float32Array(MONN_N),d0:new Float32Array(MONN_N),   /* le plan de SA dalle : la normale, et n·p */
  bx:new Float32Array(MONN_N),by:new Float32Array(MONN_N),bz:new Float32Array(MONN_N),b0:new Float32Array(MONN_N)};  /* le travers de la route, et b·p (la chaussée s'arrête à ROAD_HALF) */
PAL.B.pluieDens=[.6,.8,1]; /* la part de l'averse par palier (téléphone ancien · téléphone · ordi et téléphone récent) : moins de glyphes à animer et à dessiner, le même spectacle */
const MRF={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},MR_G=22; /* le repère de route d'un glyphe qui naît · la gravité de l'averse (m/s²) */
let moneyRainT=0,nextRainAt=4e3*ECO3.gain; /* calé sur l'éco ×2,5 : ~une pluie par niveau (l'ancien 1e4/×10 suivait l'éco ×10) · ×ECO3.gain (vague 3) : la pluie tombe au même moment de la partie */
function startMoneyRain(){
  moneyRainT=3;MR.acc=0; /* (2026-10-26, Sacha : « la pluie de billets, là, elle était mieux avant » — retour à l'averse de glyphes, avant la PLUIE D'ARGENT v2 du 13/10 (PLA reste pour CRYPTOCITY) */
  try{son('pluie.billets',fanfare);}catch(e){} /* (console de son) la pluie FROISSE : billets qui tombent partout + pièces (plus la fanfare d'une caisse débloquée) */
}
function updateMoneyRain(dt,t){
  if(moneyRainT>0){
    moneyRainT-=dt;
    /* (2026-09-30) 180 GLYPHES PAR SECONDE, pas 3 par image : l'averse dépendait de la cadence — 270 glyphes à 30 i/s, 540 à 60,
       1 080 à 120 Hz pour 600 places en anneau (des glyphes encore en l'air étaient écrasés et réapparaissaient ailleurs). Un
       accumulateur, comme nfxVent : 540 sur les 3 s, vivants 3,2-5 s → jamais plus de ~540 à la fois, l'anneau tient. */
    MR.acc+=dt*180*PAL.b('pluieDens',1); /* (2026-11-20, Léo : « que tout appareil puisse le retranscrire avec la qualité possible ») la densité suit le palier : 324 / 432 / 540 glyphes */
    const v9=Math.min(140,Math.abs(vA)*SPD*vitMult()); /* la vitesse de la caisse le long de la route (m/s) : l'averse naît là où elle SERA dans 0,35 à 1,85 s — le temps de toucher la dalle et de rebondir devant elle */
    while(MR.acc>=1){MR.acc-=1;
      const i=MR.head;MR.head=(i+1)%MONN_N;
      const g9=(Math.random()*CURR.length)|0,d9=10+Math.random()*20+v9*(.35+Math.random()*1.5);
      MR.f[i]=(3-(g9>>2))*4+(g9&3); /* la case de l'atlas (la toile a y vers le BAS, les UV vers le HAUT) */
      MR.sc[i]=1.1+Math.random()*1.7;
      try{frameAt(s+d9*driveDir,MRF);}catch(e){moneyRainT=0;MR.acc=0;break;} /* GARDE-FOU : pas de route lisible (un mode sans tracé) → l'averse s'arrête, la partie continue */
      if(!(MRF.p.x===MRF.p.x&&MRF.n.x===MRF.n.x&&MRF.b.x===MRF.b.x)){moneyRainT=0;MR.acc=0;break;} /* un repère cassé (NaN) : pareil */
      if(side<0){MRF.n.multiplyScalar(-1);MRF.b.multiplyScalar(-1);} /* la dalle où il tombera (dessous de la route : le repère se retourne, comme la caisse) */
      const N=MRF.n,Bv=MRF.b,T9=MRF.t,l9=lat+(Math.random()-.5)*(Math.random()<.35?9:46),h9=(side<0?THICK:0)+3+Math.random()*13;
      MR.nx[i]=N.x;MR.ny[i]=N.y;MR.nz[i]=N.z;MR.d0[i]=N.dot(MRF.p)+(side<0?THICK:0);
      MR.bx[i]=Bv.x;MR.by[i]=Bv.y;MR.bz[i]=Bv.z;MR.b0[i]=Bv.dot(MRF.p);
      MR.x[i]=MRF.p.x+Bv.x*l9+N.x*h9;MR.y[i]=MRF.p.y+Bv.y*l9+N.y*h9;MR.z[i]=MRF.p.z+Bv.z*l9+N.z*h9;
      const vn9=-(1+Math.random()*4),vb9=(Math.random()-.5)*5,vt9=(Math.random()-.5)*5;
      MR.vx[i]=N.x*vn9+Bv.x*vb9+T9.x*vt9;MR.vy[i]=N.y*vn9+Bv.y*vb9+T9.y*vt9;MR.vz[i]=N.z*vn9+Bv.z*vb9+T9.z*vt9;
      MR.ph[i]=Math.random()*6;MR.rs[i]=(Math.random()<.5?-1:1)*(3+Math.random()*6);MR.rot[i]=Math.random()*6.28; /* rot : l'angle de la pièce qui tourne sur elle-même */
      MR.life[i]=3.2+Math.random()*1.8;MR.tap[i]=0;
    }
  }
  if(!MR.viv&&moneyRainT<=0){if(MONN.cnt||!MONN.chaud){MONN.cnt=0;panPousse(MONN);}MR.cok=false;return;} /* rien ne tombe : rien n'est dessiné */
  /* ===== ON FONCE DEDANS (2026-11-20, Léo : « ça défile sur nous et ça rebondit sur la route ET la voiture — le même effet de on fonce dedans ») =====
     Les glyphes ne suivent PAS la caisse : ils tombent à un endroit du monde et y restent, on traverse le rideau (un tiers naît dans notre
     couloir). Et la caisse les PERCUTE : une sphère de 2,5 m balayée sur son trajet de l'image (elle fait plus de 2 m par image à fond) —
     le glyphe touché est chassé de côté et vers le haut avec une part de notre élan, une seule fois, puis il retombe et rebondit derrière. */
  const cp=carGroup.position,pcx=MR.cx,pcy=MR.cy,pcz=MR.cz;let sx=cp.x-pcx,sy=cp.y-pcy,sz=cp.z-pcz,s2=sx*sx+sy*sy+sz*sz;
  const cOn=MR.cok&&dt>0&&s2<3600; /* une image d'avant connue, et pas un saut (réapparition, portail) */
  if(!cOn){sx=sy=sz=s2=0;}
  const kv=cOn?.55/dt:0; /* la part de la vitesse de la caisse que prend le glyphe percuté */
  MR.cx=cp.x;MR.cy=cp.y;MR.cz=cp.z;MR.cok=true;
  const P=MONN.P,S=MONN.S,C=MONN.C,F=MONN.F,gdt=MR_G*dt;let n=0;
  for(let i=0;i<MONN_N;i++){if(MR.life[i]<=0)continue;
    MR.life[i]-=dt;if(MR.life[i]<=0)continue;
    const nx=MR.nx[i],ny=MR.ny[i],nz=MR.nz[i],r9=MR.sc[i]*.36; /* r9 : la demi-hauteur du glyphe, son point de contact */
    let vx=MR.vx[i]-nx*gdt,vy=MR.vy[i]-ny*gdt,vz=MR.vz[i]-nz*gdt; /* la gravité tire vers SA dalle */
    let x=MR.x[i]+vx*dt,y=MR.y[i]+vy*dt,z=MR.z[i]+vz*dt;
    const h9=nx*x+ny*y+nz*z-MR.d0[i];
    if(!(h9===h9)||h9<-60){MR.life[i]=0;continue;} /* GARDE-FOU : un glyphe devenu fou (NaN) ou tombé 60 m sous sa dalle est rangé, il ne part jamais au GPU */
    if(h9<r9&&h9>-1.5){const vn9=vx*nx+vy*ny+vz*nz;
      if(vn9<0&&Math.abs(MR.bx[i]*x+MR.by[i]*y+MR.bz[i]*z-MR.b0[i])<ROAD_HALF){ /* LE REBOND : sur la chaussée seulement (au-delà du bord, il file dans le vide) */
        const e9=vn9<-2.2?1.72:1,k9=r9-h9; /* un choc franc rend ~56 % de sa vitesse ; un choc mou se POSE (plus de micro-rebonds) */
        x+=nx*k9;y+=ny*k9;z+=nz*k9;vx-=nx*vn9*e9;vy-=ny*vn9*e9;vz-=nz*vn9*e9;
        vx*=.78;vy*=.78;vz*=.78;MR.rs[i]*=e9>1?-.72:.9;if(e9>1)MR.reb++;} /* il repart en tournant dans l'autre sens, un peu moins vite · posé : il ralentit */
    }else if(h9>=r9){const w9=Math.min(1,(h9-r9)*.5);x+=Math.sin(t*3+MR.ph[i])*1.1*w9*dt;z+=Math.cos(t*2.6+MR.ph[i])*1.1*w9*dt;} /* en l'air : il flotte un peu (rien au ras du sol) */
    if(cOn&&!MR.tap[i]){ /* LA CAISSE : le point de son trajet (image d'avant → maintenant) le plus proche du glyphe, relevé de 0,8 m */
      let ex=x-pcx-nx*.8,ey=y-pcy-ny*.8,ez=z-pcz-nz*.8;const u9=s2>1e-6?Math.min(1,Math.max(0,(ex*sx+ey*sy+ez*sz)/s2)):1;
      ex-=sx*u9;ey-=sy*u9;ez-=sz*u9;const d2=ex*ex+ey*ey+ez*ez,R9=2.5+r9;
      if(d2<R9*R9){const d9=Math.sqrt(d2)||1,k9=9/d9;MR.tap[i]=1;MR.choc++;
        vx=sx*kv+ex*k9+nx*7;vy=sy*kv+ey*k9+ny*7;vz=sz*kv+ez*k9+nz*7;MR.rs[i]=(MR.rs[i]<0?-1:1)*(9+Math.random()*6);} /* chassé : notre élan + l'écart + un coup vers le haut · il part en vrille */
    }
    MR.x[i]=x;MR.y[i]=y;MR.z[i]=z;MR.vx[i]=vx;MR.vy[i]=vy;MR.vz[i]=vz;
    MR.rot[i]+=MR.rs[i]*dt;
    const c9=Math.cos(MR.rot[i]),a9=Math.abs(c9),l9=c9>0?.82+.26*a9:.5+.3*a9; /* la face éclate quand elle passe devant l'œil · le dos reste dans l'ombre */
    P[n*3]=x;P[n*3+1]=y;P[n*3+2]=z;
    S[n*4]=MR.sc[i]*(c9<0?-1:1)*Math.max(.16,a9);S[n*4+1]=MR.sc[i];S[n*4+2]=Math.sin(t*2.2+MR.ph[i])*.22;S[n*4+3]=0; /* la largeur = le cos de l'angle (jamais moins que la TRANCHE) · un léger balancement */
    /* LA PLUIE RGB (2026-11-20, Léo : « que la pluie de currencies soit RGB ») : chaque glyphe fait le tour de l'arc-en-ciel (~2,5 s), décalé par sa phase.
       Coût : zéro — la couleur d'instance (`iC`) partait déjà au GPU à chaque image. */
    const u9=(t*.16+MR.ph[i]/6)%1*6,e9=c9>0?.2*a9*a9*a9*a9*a9*a9*a9*a9:0; /* un tour en ~6 s · e9 : l'éclat du métal, face à l'œil — discret (2026-11-20, Léo : « moins clair, couleurs plus vivantes, les lettres sont trop fantomatiques » : .55 → .14, le bloom ne les noie plus) */
    C[n*4]=l9*(.05+.95*Math.min(1,Math.max(0,Math.abs(u9-3)-1)))+e9;C[n*4+1]=l9*(.05+.95*Math.min(1,Math.max(0,2-Math.abs(u9-2))))+e9;C[n*4+2]=l9*(.05+.95*Math.min(1,Math.max(0,2-Math.abs(u9-4))))+e9; /* la teinte de JOUET MODERNE : la couleur presque pure (95 %), franche et lumineuse */
    const qx=x-camera.position.x,qy=y-camera.position.y,qz=z-camera.position.z,q2=qx*qx+qy*qy+qz*qz; /* (2026-11-20) un glyphe chassé par la caisse passait devant l'OBJECTIF et couvrait un tiers de l'écran : il s'efface à moins de 9 m de la caméra, il a disparu à 3,5 m */
    C[n*4+3]=Math.min(1,MR.life[i])*(q2<81?Math.max(0,(Math.sqrt(q2)-3.5)/5.5):1);
    F[n*2]=MR.f[i];F[n*2+1]=0;n++;
  }
  MR.viv=n;MONN.cnt=n;panPousse(MONN);
}
function moneyRainClear(){MR.cok=false;MR.life.fill(0);MR.viv=0;moneyRainT=0;MONN.cnt=0;panPousse(MONN);} // nouvelle partie : l'averse s'arrête net
window.dbgPluie=function(q){if(q==='etat')return {vivants:MR.viv,rebonds:MR.reb,chocs:MR.choc,reste:+moneyRainT.toFixed(2)};startMoneyRain();return 'pluie de devises lancée';}; /* (2026-11-20) le crochet de test de la pluie RGB : en course, `dbgPluie()` la lance, `dbgPluie('etat')` compte les vivants et les rebonds */
// ---------- AUDIO ----------
let AC=null,osc=null,osc2=null,filt=null,gainN=null,engDose=null,windG=null,windF=null,skidG=null,jetG=null,jetF=null,jetLowG=null,jetOsc=null,jetOscG=null,whF=null,whG=null;
// LA CHARGE — l'état interne du moteur. ⚠ Ce n'est PAS la position de l'accélérateur : c'est ce
// que le moteur ENDURE. Pied au plancher à 300 sur le plat, la charge est faible ; pied au
// plancher en reprise, elle est maximale. Sans cette distinction, « à fond » et « stabilisé »
// sonnent pareil — c'est exactement le défaut qu'on corrige.
let charge9=0,ovr9=0,drift9=0;
let engPre=null,engPost=null,engEq=null,engFmt=null,engTickG=null,engTickO=null,
    transO=null,transG=null,diffO=null,diffG=null,pinkG=null,ovrF=null,ovrG=null;
let MASTER=null,BUSOUT=null,engMix=null,engSub=null,engSubG=null,engNzF=null,engNzG=null,engShaper=null,engLfo=null,engLfoG=null,engWhine=null,engWhineG=null,
    skF1=null,skF2=null,skLfo=null,skD1=null,skD2=null,jcFb=null,jcDep=null,jetDist=null,jrG=null,jrF=null,jrDep=null;
let engLvl=-1,engGear=1,engRpm=0,engShiftT=0,engWasUp=false,nA=0,duckT=0;const LANCEE={a:[0,0,0]}; /* (2026-10-07) les paliers d'élan déjà sonnés (voir « LA LANCÉE S'ENTEND ») */
/* (2026-10-14, session SON) LE VOL QUI MONTE : `SVOL.t` = secondes VÉCUES du vol en cours (jamais rendues par un bump ni par la mer,
   contrairement à fallTR), `SVOL.k` = la TENSION 0 → 1, lissée par dt (même courbe à 30, 60, 120 i/s : banc son/banc/vol/tension.cjs).
   Elle monte avec la durée du vol (~2,5 s) et un peu avec les figures (ECH), ouvre le vent et fait chanter le moteur en vol ; à la
   pose elle retombe en ~0,2 s : c'est la RÉSOLUTION, le verdict claque sur un mix qui se relâche. Remis à zéro par startFall (t),
   respawn / newTrack / resetGame (t et k). */
const SVOL={t:0,k:0};
/* (2026-10-14, session SON) LA TURBULENCE DU JET, TIRÉE À INTERVALLE FIXE : le hasard de jrG / jetLowG était retiré À CHAQUE IMAGE —
   l'écart dépassait toujours la garde de `stt` (setTargetAtTime à chaque image) et le grain allait deux fois plus vite à 120 Hz.
   On retire `r` (×.84-1.16) et `l` (×.7-1.3) toutes les 90 ms (horloge par dt) ; entre deux, la consigne ne bouge pas. */
const JETN={t:0,r:1,l:1};
