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
// ---------- PLUIE DE DEVISES : à 4 000 $ (puis ×2,6), les monnaies du monde défilent ----------
/* (2026-09-26, vague 2 « L'ENCRE ET L'OR ») LA PLUIE EN UN APPEL DE DESSIN. Elle fabriquait 3 sprites NEUFS par image pendant 3 s — 540
   `SpriteMaterial` créés puis jetés, et jusqu'à ~540 appels de dessin à la fin de l'averse : l'à-coup garanti sur iPhone, pile pendant la
   fête — en 15 couleurs pastel. Désormais : UN atlas cuit une fois (15 glyphes en OR de l'argent — clair en haut, ombre en bas — cerclés
   d'un LISERÉ d'encre #1c0430, comme tout ce qui rapporte), 600 panneaux instanciés (`mkPanneaux`), tableaux fixes, zéro allocation.
   Le mouvement est celui d'avant (ça tournoie en tombant, fondu la dernière seconde). */
const CURR=['$','€','¥','£','¢']; // (2026-10-15, UNE SEULE POLICE) les cinq que la police pixel DESSINE — ₹ ₩ ₽ ฿ ₺ ₪ ₫ ₴ ₦ ₱ tombaient dans une police de secours (mesuré)
const MONN_TEX=(function(){
  const S=64,cv=document.createElement('canvas');cv.width=cv.height=S*4;const c=cv.getContext('2d'),tx=new THREE.CanvasTexture(cv);
  apresPolice(function(){c.clearRect(0,0,S*4,S*4);
  c.textAlign='center';c.textBaseline='middle';c.font='40px "Press Start 2P",monospace';c.lineJoin='round';
  for(let i=0;i<CURR.length;i++){const x=(i&3)*S+S/2,y=(i>>2)*S+S/2+2;
    c.lineWidth=7;c.strokeStyle='#1c0430';c.strokeText(CURR[i],x,y);                 // le liseré d'encre
    const g=c.createLinearGradient(0,y-20,0,y+20);g.addColorStop(0,'#fff3b0');g.addColorStop(.5,'#ffd75e');g.addColorStop(1,'#b8860b');
    c.fillStyle=g;c.fillText(CURR[i],x,y);}                                          // l'or : clair #fff3b0 · or #ffd75e · ombre #b8860b
  tx.needsUpdate=true;});
  return tx;
})();
const MONN_N=600,MONN=mkPanneaux(MONN_N,MONN_TEX,4,4,false,1,2);
const MR={x:new Float32Array(MONN_N),y:new Float32Array(MONN_N),z:new Float32Array(MONN_N),vx:new Float32Array(MONN_N),vy:new Float32Array(MONN_N),
  vz:new Float32Array(MONN_N),ph:new Float32Array(MONN_N),rs:new Float32Array(MONN_N),rot:new Float32Array(MONN_N),life:new Float32Array(MONN_N),
  sc:new Float32Array(MONN_N),f:new Uint8Array(MONN_N),head:0,viv:0,acc:0};
let moneyRainT=0,nextRainAt=4e3*ECO3.gain; // calé sur l'éco ×2,5 : ~une pluie par niveau (l'ancien 1e4/×10 suivait l'éco ×10) · ×ECO3.gain (vague 3) : la pluie tombe au même moment de la partie
function startMoneyRain(){
  plaSurge(4.5);MR.acc=0; // (2026-10-13) la PLUIE D'ARGENT v2 (billets, pièces, confettis : voir PLA) remplace l'averse de glyphes — moneyRainT reste à 0 (l'ancienne se rallume avec moneyRainT=3)
  try{son('pluie.billets',fanfare);}catch(e){} // (console de son) la pluie FROISSE : billets qui tombent partout + pièces (plus la fanfare d'une caisse débloquée)
}
function updateMoneyRain(dt,t){
  if(moneyRainT>0){
    moneyRainT-=dt;
    tmp3.set(0,0,1).applyQuaternion(carGroup.quaternion);
    /* (2026-09-30) 180 GLYPHES PAR SECONDE, pas 3 par image : l'averse dépendait de la cadence — 270 glyphes à 30 i/s, 540 à 60,
       1 080 à 120 Hz pour 600 places en anneau (des glyphes encore en l'air étaient écrasés et réapparaissaient ailleurs). Un
       accumulateur, comme nfxVent : 540 sur les 3 s, vivants 3,2-5 s → jamais plus de ~540 à la fois, l'anneau tient. */
    MR.acc+=dt*180;
    while(MR.acc>=1){MR.acc-=1; // le défilé : ça pleut devant et autour, on traverse le rideau
      const i=MR.head;MR.head=(i+1)%MONN_N;
      const g9=(Math.random()*CURR.length)|0,d9=12+Math.random()*60;
      MR.f[i]=(3-(g9>>2))*4+(g9&3); // la case de l'atlas (la toile a y vers le BAS, les UV vers le HAUT)
      MR.sc[i]=.9+Math.random()*1.7;
      MR.x[i]=carGroup.position.x+tmp3.x*d9+(Math.random()-.5)*44;
      MR.y[i]=carGroup.position.y+tmp3.y*d9+7+Math.random()*18;
      MR.z[i]=carGroup.position.z+tmp3.z*d9+(Math.random()-.5)*44;
      MR.ph[i]=Math.random()*6;MR.rs[i]=(Math.random()-.5)*4.5;MR.rot[i]=0;
      MR.vx[i]=(Math.random()-.5)*2;MR.vy[i]=-(2.5+Math.random()*3.5);MR.vz[i]=(Math.random()-.5)*2;
      MR.life[i]=3.2+Math.random()*1.8;
    }
  }
  if(!MR.viv&&moneyRainT<=0){if(MONN.cnt||!MONN.chaud){MONN.cnt=0;panPousse(MONN);}return;} // rien ne tombe : rien n'est dessiné
  const P=MONN.P,S=MONN.S,C=MONN.C,F=MONN.F;let n=0;
  for(let i=0;i<MONN_N;i++){if(MR.life[i]<=0)continue;
    MR.life[i]-=dt;if(MR.life[i]<=0)continue;
    MR.x[i]+=(MR.vx[i]+Math.sin(t*3+MR.ph[i])*1.7)*dt;   // ça tournoie
    MR.y[i]+=MR.vy[i]*dt;
    MR.z[i]+=(MR.vz[i]+Math.cos(t*2.6+MR.ph[i])*1.7)*dt;
    MR.rot[i]+=MR.rs[i]*dt;
    P[n*3]=MR.x[i];P[n*3+1]=MR.y[i];P[n*3+2]=MR.z[i];
    S[n*4]=S[n*4+1]=MR.sc[i];S[n*4+2]=MR.rot[i];S[n*4+3]=0;
    C[n*4]=C[n*4+1]=C[n*4+2]=1;C[n*4+3]=Math.min(1,MR.life[i]);
    F[n*2]=MR.f[i];F[n*2+1]=0;n++;
  }
  MR.viv=n;MONN.cnt=n;panPousse(MONN);
}
function moneyRainClear(){MR.life.fill(0);MR.viv=0;moneyRainT=0;MONN.cnt=0;panPousse(MONN);} // nouvelle partie : l'averse s'arrête net
// ---------- AUDIO ----------
let AC=null,osc=null,osc2=null,filt=null,gainN=null,windG=null,windF=null,skidG=null,jetG=null,jetF=null,jetLowG=null,jetOsc=null,jetOscG=null,whF=null,whG=null;
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
