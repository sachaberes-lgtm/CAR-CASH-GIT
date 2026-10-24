// MÊME KIT LUMIÈRE QUE LE JOUEUR : halos de phares/feux + cônes de réacteur (matériaux PARTAGÉS par la meute)
const pcHeadM=new THREE.SpriteMaterial({map:lampTex,color:0xffe2a8,transparent:true,opacity:.95,depthWrite:false});
const pcTailM=new THREE.SpriteMaterial({map:lampTex,color:0xff2818,transparent:true,opacity:.85,depthWrite:false});
const pcJetShellM=jetMat(0x4f76ff,0xd6e4ff,0x9fb4ff,.85,1,1),pcJetCoreM=jetMat(0xd6e4ff,0xffffff,0xc9b8ff,.92,.7,1.35); // (2026-09-28) la meute brûle avec LA FLAMME VIVANTE du joueur (même programme), en bleu police
function mkPolice(liv){
  const g=new THREE.Group(),[bodyM,accM]=pcLiv[liv%3];
  const body=new THREE.Mesh(pcBodyG,bodyM);body.position.y=.62;g.add(body);
  const hood=new THREE.Mesh(pcHoodG,accM);hood.position.set(0,.93,1.45);g.add(hood);   // capot contrasté
  const trunk=new THREE.Mesh(pcHoodG,accM);trunk.position.set(0,.93,-1.5);g.add(trunk);
  const cab=new THREE.Mesh(pcCabG,pcGlassM);cab.position.set(0,1.14,-.25);g.add(cab);
  const base=new THREE.Mesh(pcBaseG,pcBarM);base.position.set(0,1.46,-.25);g.add(base); // rampe
  const lampR=new THREE.Mesh(pcLampG,gyroRedOn);lampR.position.set(-.3,1.56,-.25);g.add(lampR);
  const lampB=new THREE.Mesh(pcLampG,gyroBluOff);lampB.position.set(.3,1.56,-.25);g.add(lampB);
  for(const sd of[-1,1])for(const fz of[-1,1]){
    const w=new THREE.Mesh(wkWhG,wkWheelM);w.rotation.z=Math.PI/2;w.position.set(sd*.98,.34,fz*1.42);g.add(w);}
  const sR=new THREE.Sprite(sprRedM);sR.position.set(0,1.9,-.25);g.add(sR);            // halos additifs
  const sB=new THREE.Sprite(sprBluM);sB.position.set(0,1.9,-.25);sB.visible=false;g.add(sB);
  const jet=new THREE.Sprite(sprJetM);jet.position.set(0,.55,-2.55);jet.visible=false;g.add(jet); // réacteur nitro (halo)
  for(const sd of[-1,1]){ // MÊME KIT LUMIÈRE QUE TOI : halos de phares avant + feux arrière braise
    const hg=new THREE.Sprite(pcHeadM);hg.scale.set(.8,.8,1);hg.position.set(sd*.62,.72,2.42);g.add(hg);
    const tg=new THREE.Sprite(pcTailM);tg.scale.set(.6,.6,1);tg.position.set(sd*.58,.78,-2.35);g.add(tg);
  }
  // ...et les MÊMES FLAQUES AU SOL que le joueur : phares blanc-bleu police devant, feux rouges derrière, halo réacteur bleu (opacité pilotée par la poussée)
  function pool9(wid,len,zc,col,op,tex){
    const m9=new THREE.Mesh(new THREE.PlaneGeometry(wid,len),
      new THREE.MeshBasicMaterial({map:tex||poolTex,color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    m9.rotation.x=-Math.PI/2;m9.position.set(0,.062,zc);m9.userData.noShadow=true;m9.userData.sol=1;m9.renderOrder=2;
    g.add(m9);return m9;
  }
  pool9(6.0,14.5,9.4,0xcfe0ff,.5,beamTex); // faisceaux blanc-bleu police — (2026-09-28) la flaque rouge AR et le halo bleu au sol sont RETIRÉS,
  const jetPool={material:{opacity:0}};     // comme sur ta caisse (verdict « plus de taches rondes sur la route ») : ils volaient aussi avec la voiture qui saute
  const jets=[]; // plume de réacteur : les MÊMES cônes que la caisse du joueur, en BLEU police
  for(const sd of[-1,1]){
    const js9=new THREE.Mesh(jetGeo,pcJetShellM),jc9=new THREE.Mesh(jetGeo,pcJetCoreM);
    js9.position.set(sd*.5,.55,-2.45);jc9.position.copy(js9.position);
    js9.scale.set(.14,.14,.02);jc9.scale.set(.07,.07,.02);
    js9.visible=jc9.visible=false;js9.userData.noShadow=jc9.userData.noShadow=true;
    g.add(js9);g.add(jc9);jets.push(js9,jc9);
  }
  g.traverse(o9=>{if(o9.isMesh&&!o9.userData.noShadow)o9.castShadow=true;}); // la meute aussi étire son ombre — sauf les plumes additives
  g.visible=false;scene.add(g);
  return {g,lampR,lampB,sR,sB,jet,jets,jetPool};
}
// pool de VRAIES lumières : seules les 2 poursuivantes les plus proches éclairent la route et ta caisse
const gyroLights=[new THREE.PointLight(0xff3030,0,60),new THREE.PointLight(0x3f7dff,0,60)];
for(const l of gyroLights)scene.add(l);
const botJetLight=new THREE.PointLight(0x5b7dff,0,24);scene.add(botJetLight); // le reflet BLEU au sol de la nitro du bot le plus proche (1 seule lumière, jamais de recompilation)
const botTrails=[];for(let i9=0;i9<7;i9++)botTrails.push(mkTrail()); // 7 RUBANS BLEUS : la meute signe le ciel — visibles de LOIN (fog:false)
// sirène unique (LOD audio) : un WAIL doux et lointain — la fréquence RESPIRE au lieu de claquer
let sirG=null,sirO=null;
function sirenInit(){
  if(sirG||!AC)return;
  try{
    sirG=AC.createGain();sirG.gain.value=0;
    const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=880;f.Q.value=.7; // rond, jamais strident
    sirO=AC.createOscillator();sirO.type='sine';sirO.frequency.value=560;
    const wl=AC.createOscillator(),wg=AC.createGain(); // le wail : lent glissando sinusoïdal ±115 Hz
    wl.type='sine';wl.frequency.value=.27;wg.gain.value=115;
    wl.connect(wg);wg.connect(sirO.frequency);
    const vb=AC.createOscillator(),vg=AC.createGain(); // vibrato léger : la sirène VIT
    vb.type='sine';vb.frequency.value=5.3;vg.gain.value=5;
    vb.connect(vg);vg.connect(sirO.frequency);
    sirO.connect(f);f.connect(sirG);sirG.connect(MASTER);
    sirO.start();wl.start();vb.start();porte(sirG,MASTER);
  }catch(e){sirG=null;}
}
const FB={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
const svM4=new THREE.Matrix4(),svT1=new THREE.Vector3(); // temp partagé de la meute (jamais d'alloc chaude)
function survMenage(){ // grand ménage de l'escadron précédent (le départ suivant, ou le retour à l'ACCUEIL)
  for(const b of SURV.bots)if(b.mesh){scene.remove(b.mesh.g);
    b.mesh.g.traverse(o=>{if(o.userData&&o.userData.sol){if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();}});} // (2026-09-26) ses flaques, propres à chaque voiture
  SURV.bots=[];
}
function survStart(){
  survMenage();
  SURV.on=SURV.armed&&!PARK.on;
  SURV.t=0;SURV.over=false;SURV._r=0;SURV.pBase=0;SURV.ph=0;SURV.last=false; // (les bots sont vidés par survMenage) // FREESTYLE : jamais de police dans le parc
  SURV.jumpZones=[];SURV.pMode=mode;SURV._launchD=0;SURV._launchT=0; // mémoire de tes décollages sur CETTE piste
  survHudEl.style.display=SURV.on?'block':'none';
  lastAlertEl.style.display='none';vChip(''); // (2026-09-30) la plaque du Survivant (téléphone) repart vide : survTick la réécrit à 4 Hz
  for(const l of gyroLights)l.intensity=0;
  botJetLight.intensity=0;
  for(const tr9 of botTrails){tr9.init=false;tr9.m.visible=false;} // pas de rubans fantômes d'une meute à l'autre
  if(sirG&&AC)sirG.gain.setTargetAtTime(0,AC.currentTime,.3); // (2026-09-27) la sirène s'éteint au portail (survTick ne tourne plus pour la couper)
  if(!SURV.on)return;
  sirenInit();
  survHudEl.innerHTML='<div class="svHead"><canvas id="svClock" width="20" height="20"></canvas><span id="svSecs"></span></div><div id="svRows"></div>';
  svClkCtx=$('svClock').getContext('2d');svRowsEl=$('svRows');svSecsEl=$('svSecs');
  for(let i=0;i<7;i++){
    const p=SURV_PILOTS[i];
    // le PROFIL appris te déteint sur chaque bot — mais uniquement sur le CERVEAU, jamais sur le moteur
    const line=THREE.MathUtils.clamp(p.line*(.72+AIP.skill*.3),.25,.98),
      marg=THREE.MathUtils.clamp(.78+line*.18-AIP.caution*.04,.7,.96), // marge au point de corde : les fins freinent tard
      agro=THREE.MathUtils.clamp(p.agro*(.7+AIP.aggr*.7),0,1),
      appJump=THREE.MathUtils.clamp(AIP.air*(.5+p.agro*.9),0,1.1), // appétit de saut personnel
      appBoost=THREE.MathUtils.clamp(.45+AIP.boost*(.55+p.agro*.7),0,1.35); // appétit de nitro REMONTÉ : la meute doit cracher du bleu
    SURV.bots.push({name:p.n,agro:agro,err:p.err,rea:p.rea,line:line,marg:marg,alive:true,
      appJump:appJump,appBoost:appBoost,
      totD:s+(i-3)*34+(Math.random()*2-1)*12, // la meute encadre le joueur dès le départ
      v:24,lat:(Math.random()*2-1)*(ROAD_HALF-4),latT:0,lane:(Math.random()*2-1)*.6,
      phi:0,steer:0,sHold:0,momT:0,pbi:-1,cornerV:1e9,think:Math.random()*.25,
      nitroR:1.2,nT:0,boostT:0,padB:0,padCd:0,slipT:0,oilCd:0,errT:0,errK:0,ph:Math.random(),
      air:false,airH:0,vy:0,spin:0,spinV:0,jumpCD:1+Math.random()*2,zoneMark:-1,
      trail:botTrails[i],trailK:0, // son ruban bleu personnel
      mesh:mkPolice(i)});
    SURV.bots[i].latT=SURV.bots[i].lane*(ROAD_HALF-5);
  }
  survRender();
}
function svClockDraw(){ // minuteur circulaire PIXEL-ART : 20×20 upscalé net — cadran rétro, aiguille fluide
  if(!svClkCtx||TCTL.on)return; // (2026-09-30) invisible au téléphone : une soixantaine de dessins par image pour rien
  const c=svClkCtx;c.clearRect(0,0,20,20);
  const frac=Math.min(1,SURV.t/60),left=60-SURV.t;
  c.fillStyle='#141026';c.beginPath();c.arc(10,10,9.4,0,7);c.fill();
  c.fillStyle='#332a55';for(let k=0;k<12;k++){const a=k/12*Math.PI*2;
    c.fillRect(Math.round(9.5+Math.sin(a)*8),Math.round(9.5-Math.cos(a)*8),1,1);}
  const col=left<10?'#ff5040':left<25?'#ffb000':'#7dff9a';
  c.fillStyle=col;
  for(let k=0;k<36;k++){ // l'anneau se VIDE avec la minute
    if(k/36<frac)continue;
    const a=k/36*Math.PI*2;
    c.fillRect(Math.round(9.5+Math.sin(a)*6.6),Math.round(9.5-Math.cos(a)*6.6),1,1);
  }
  const na=frac*Math.PI*2; // l'aiguille balaie son tour de cadran
  c.fillStyle='#fff';
  for(let r=1.5;r<6;r+=1)c.fillRect(Math.round(9.5+Math.sin(na)*r),Math.round(9.5-Math.cos(na)*r),1,1);
  c.fillStyle='#ffd75e';c.fillRect(9,9,2,2);
  if(svSecsEl){const sLeft=Math.max(0,Math.min(59,Math.ceil(left)));svSecsEl.textContent='0:'+String(sLeft).padStart(2,'0'); /* (24/10, relecture : « 0:60 » toute la première seconde de chaque minute) la minute s'affiche 0:59 → 0:00, jamais 0:60 */
    svSecsEl.style.color=left<10?'#ff5040':'#ffd75e';}
}
function botBoom(b){ // une unité saute : gerbe or+bleu, champignon, et le son si c'est proche
  b.alive=false;b.mesh.g.visible=false;
  const rel=THREE.MathUtils.clamp(b.totD-SURV.pBase,1,L-2),dS9=Math.abs(b.totD-survPTot()); // (2026-09-30) la distance à TA vraie place, même en vol
  frameAt(rel,FB);FB.p.addScaledVector(FB.n,.8);
  sparkBurst(sparkGold,FB.p,36,20);sparkBurst(sparkBlue,FB.p,28,16);
  for(let k=0;k<18;k++)spawnP(smokePool,FB.p.x,FB.p.y+k*.22,FB.p.z,(Math.random()-.5)*2.5,5+Math.random()*4,(Math.random()-.5)*2.5,1.2+Math.random()*.7);
  if(dS9<220){if(SONV2)sfx('explosion.loin');else{subBoom(.3);thud(11);}shake=Math.max(shake,.5);}
  trickMsg('💥 '+b.name+' '+TR('EXPLOSE !'),2);if(SONV2){if(dS9>=220)sfx('rival.boum');}else chimeNote(196,0,.3,.25);
}
function survTick(dt){
  if(!SURV.on)return;
  if(SURV.over){for(const l of gyroLights)l.intensity=0;botJetLight.intensity=0;for(const tr9 of botTrails){tr9.init=false;tr9.m.visible=false;}if(sirG)sirG.gain.setTargetAtTime(0,AC.currentTime,.3);return;}
  SURV.t+=dt;SURV.ph=(SURV.ph+dt*2.7)%1;
  svClockDraw();
  const pTot=survPTot(),sP9=pTot-SURV.pBase; // (2026-09-30) le Survivant suit ta vraie position, même en vol ; sP9 = ta place sur CETTE piste
  // MÊME MOTEUR QUE TOI : la meute roule avec TA caisse (specs + overdrive), pas un pouce de plus.
  // Zéro triche : plus d'élastique, plus de garde-fou, plus d'aspiration magique — que du pilotage.
  // ⚠ CARS[0] + TON MOTEUR, comme toi (2026-08-03) : la meute lisait CARS[level], or `level` est
  // désormais la carrosserie CHOISIE au garage. Équiper la dernière caisse aurait lancé sept
  // poursuivantes à 1900 km/h contre un joueur plafonné par son palier moteur — course injouable.
  // (2026-09-27) LA POURSUITE : 6 % de moins en pointe — c'est l'OPPORTUNITÉ DE FUITE du brief : un pilote propre les distance, un pilote sale les garde au cul
  const spec9=CARS[0],late9=lateMul(),push9=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).push,
        maxSp9=spec9.maxKmh/3.6*late9*push9,acc9=spec9.accel*late9*(1+(push9-1)*.6),tc9=spec9.turn*.75,segL9=L/(NP-1);
  // ---- ON T'OBSERVE EN DIRECT : chaque décollage grave une ZONE que les bots imiteront sur CETTE piste ----
  if(mode==='fall'&&SURV.pMode!=='fall'){SURV._launchD=pTot;SURV._launchT=SURV.t;}
  else if(mode!=='fall'&&SURV.pMode==='fall'){
    const dur=SURV.t-SURV._launchT;
    if(dur>.4&&SURV.jumpZones.length<48)SURV.jumpZones.push({d:SURV._launchD,dur:Math.min(dur,4)}); // là où TU sautes
  }
  SURV.pMode=mode;
  // ---- classement vivant (8 entrées : tri à la main, zéro alloc chaude) ----
  const alive=SURV.bots.filter(b=>b.alive);
  const racers=alive.slice();racers.sort((a,b)=>b.totD-a.totD);
  let pRank=1;for(const b of alive)if(b.totD>pTot)pRank++;
  for(const b of alive){
    const rel=b.totD-SURV.pBase;
    const bi=Math.floor(THREE.MathUtils.clamp(rel/L,0,1)*(NP-1));
    // ============ LE CERVEAU : un tick à retard HUMAIN (100-300 ms selon le pilote) ============
    // Entre deux ticks, le bot roule sur ses dernières décisions — comme toi entre deux regards.
    b.think-=dt;
    if(b.think<=0){
      b.think=b.rea*(.8+Math.random()*.6);
      // fautes : chaque pilote a les siennes, et elles se VOIENT (0=coup de frein, 1=embardée, 2=corde ratée)
      if(b.errT<=0&&Math.random()<b.err*.4){b.errT=.5+Math.random()*.8;b.errK=Math.floor(Math.random()*3);}
      // POINT DE CORDE (waypoints) : distance de freinage réelle (mêmes freins que toi) + retard de réaction
      const dBrk=(b.v*b.v*SPD)/(2*acc9*1.5)+b.v*SPD*b.rea;
      const look=THREE.MathUtils.clamp(dBrk*1.4+16,24,230);
      let vSafe=1e9,crv=0;
      for(let k9=1;k9<=3;k9++){ // 3 échantillons de courbure devant : l'anticipation, pas la ligne droite bête
        const d9=look*k9/3;
        const j9=Math.min(NP-1,bi+Math.max(1,Math.round(d9/segL9)));
        const kap=Math.acos(THREE.MathUtils.clamp(T[bi].dot(T[j9]),-1,1))/Math.max(1,d9); // κ rad/m
        if(kap>1e-4){ // vitesse max de passage : résout κ·v·SPD = plafond de braquage (LE TIEN)
          const kS=kap*SPD,vs=(-kS+Math.sqrt(kS*kS+4*kS*TURN_HS*tc9))/(2*kS*TURN_HS);
          if(vs<vSafe){vSafe=vs;svT1.crossVectors(T[bi],T[j9]);crv=Math.sign(svT1.dot(Nn[bi]))*kap;}
        }
      }
      let m9=b.marg*(1+(Math.random()-.5)*.16*(.4+b.err)); // le point de frein n'est jamais deux fois le même
      if(b.errT>0&&b.errK===2)m9*=1.35;                    // corde RATÉE : il rentre trop vite et part large
      b.cornerV=vSafe*m9;
      // LIGNE : viser la corde du virage annoncé, sinon sa file préférée
      let lT=Math.abs(crv)>.004?Math.sign(crv)*(ROAD_HALF-3.4)*b.line:b.lane*(ROAD_HALF-5);
      // PERCEPTION BORNÉE : 75 m devant, 25 m derrière — et les écarts s'estiment à l'œil (±10 %)
      let ahead=null,aG=1e9,behind=null,bG=1e9;
      for(const o of alive){if(o===b)continue;const g9=(o.totD-b.totD)*(1+(Math.random()-.5)*.2);
        if(g9>0&&g9<75){if(g9<aG){aG=g9;ahead=o.lat;}}else if(g9<0&&-g9<25&&-g9<bG){bG=-g9;behind=o.lat;}}
      if(mode==='drive'){const g9=(pTot-b.totD)*(1+(Math.random()-.5)*.2); // toi aussi tu n'es qu'une silhouette
        if(g9>0&&g9<75){if(g9<aG){aG=g9;ahead=lat;}}else if(g9<0&&-g9<25&&-g9<bG){bG=-g9;behind=lat;}}
      if(ahead!=null&&aG<14&&Math.abs(b.lat-ahead)<3.2)      // bouchon : on DÉBOÎTE (au prochain tick, pas avant)
        lT=THREE.MathUtils.clamp(ahead+(b.lat>=ahead?4.6:-4.6),-(ROAD_HALF-2.6),ROAD_HALF-2.6);
      else if(behind!=null&&bG<9&&Math.random()<b.agro*.7)   // porte fermée sur le poursuivant
        lT=THREE.MathUtils.clamp(behind,-(ROAD_HALF-2.6),ROAD_HALF-2.6);
      // OBSTACLES à portée de phares : il ne voit QUE devant, et l'esquive attend son tick (retard humain)
      const oLook=Math.min(look,70);let obD=1e9,obLat=0,obW=0;
      for(const o9 of OILS){if(o9.face!==1)continue;const d9=o9.s-rel;
        if(d9>2&&d9<oLook&&d9<obD&&Math.abs(o9.lat-lT)<o9.r+1){obD=d9;obLat=o9.lat;obW=o9.r+1;}}
      if(obD<1e9)lT=obLat+(lT>=obLat?1:-1)*(obW+1.6);
      b.latT=THREE.MathUtils.clamp(lT,-(ROAD_HALF-2.4),ROAD_HALF-2.4);
      // NITRO : une RESSOURCE (même jauge, même recharge que toi) — il l'allume dès que la route se dégage
      if(b.nT<=0&&b.nitroR>.35&&b.slipT<=0&&b.cornerV>b.v*1.12&&(ahead==null||aG>10)){
        let env=b.appBoost*(ahead!=null?1.5:.9);           // même seul, il envoie : le spectacle des traînées bleues
        if(SURV.t>48)env*=1.7;                             // dernière ligne droite de la minute : tout le monde tape dedans
        if(racers[racers.length-1]===b)env*=1.6;           // le condamné du classement se bat
        if(Math.random()<env*.7)b.nT=.7+Math.random()*1.2; // plus souvent, plus longtemps — la jauge régule de toute façon
      }
    }
    if(b.errT>0)b.errT-=dt;
    // ============ LE MOTEUR : copie conforme de TES équations — rien de plus, rien de moins ============
    const brk=b.v>b.cornerV*1.05||(b.errT>0&&b.errK===0);  // frein réel ou coup de frein fautif
    const lift=b.v>b.cornerV*.96;                          // pied levé à l'approche : un humain ne freine pas sec
    if(!brk&&Math.abs(b.steer)<.2&&Math.abs(b.phi)<.25)b.momT+=dt;else b.momT=Math.max(0,b.momT-dt*3); // même MOMENTUM
    const momF=1+Math.min(1.8,b.momT*b.momT*.1);
    if(!b.air){
      let a9=0;
      if(brk)a9=b.v>2?-acc9*1.5:-acc9*.5;
      // (2026-09-27) LA POURSUITE garde le contact sans tricher : loin (> 160 m) elle roule à TA pointe (jamais plus), à l'approche de la
      // portée de tir elle retombe à −6 % — mesuré : à 150 m de départ elle abattait le pilote moyen en 29 s, à 200 m elle ne l'atteignait jamais
      const mx9=maxSp9;
      if(!lift&&!brk)a9=acc9*(b.v<mx9?1:.55)*(b.padB>0?1.5:1)*momF;
      b.v+=a9*dt;
      b.v+=-GRAV*T[bi].y*hautPente()*Math.cos(b.phi)*dt;               // la pente pousse ou retient, comme toi
      b.v-=b.v*Math.abs(b.v)*(acc9/(mx9*mx9*5.8))*dt; // même traînée, même terminal
      b.v*=Math.max(0,1-.03*dt);
      if(!brk&&lift)b.v*=Math.max(0,1-.4*dt);              // pied levé = même frein moteur
    }
    b.nT-=dt;
    const nOn=b.nT>0&&!brk&&b.nitroR>.005;
    if(nOn){b.v+=30*dt;b.nitroR=Math.max(0,b.nitroR-dt);}  // même poussée, même consommation
    b.nitroR=Math.min(2,b.nitroR+.2*dt);                   // même recharge que ta jauge
    b.boostT=nOn?1:0;                                      // la flamme du réacteur suit la VRAIE combustion
    b.padB=Math.max(0,b.padB-dt);
    if(b.v<0)b.v=0;
    // ============ LA DIRECTION : même volant, même inertie, même plafond TURN_HS ============
    const dL9=b.latT-b.lat;
    const phiT=THREE.MathUtils.clamp(dL9/(Math.max(6,b.v*SPD)*.9),-.62,.62);
    let st=THREE.MathUtils.clamp((phiT-b.phi)*4,-1,1);
    st+=(Math.random()-.5)*.1*(1.2-b.line);                // micro-corrections permanentes : une main humaine
    if(b.errT>0&&b.errK===1)st+=Math.sin(SURV.t*13+b.ph*9)*.7; // l'EMBARDÉE : ça se voit depuis derrière
    b.steer+=(st-b.steer)*Math.min(1,dt*18);               // même inertie de volant que la tienne
    if(Math.abs(b.steer)>.1)b.sHold=Math.min(.3,b.sHold+dt);else b.sHold=0;
    b.phi+=(b.slipT>0?.18:1)*b.steer*(.55+.45*(b.sHold/.3))*tc9*THREE.MathUtils.clamp(b.v/8,-1,1)*(1/(1+Math.abs(b.v)*TURN_HS))*dt;
    if(b.slipT>0){b.slipT-=dt;b.phi+=(Math.random()-.5)*2.6*dt*Math.min(1,Math.abs(b.v)/12);} // la flaque le fait chasser, LUI aussi
    if(b.pbi>=0&&bi!==b.pbi){ // la route tourne SOUS le bot : même rétroaction que ton psi
      svT1.crossVectors(T[b.pbi],T[bi]);
      const dy9=Math.atan2(svT1.dot(Nn[bi]),THREE.MathUtils.clamp(T[b.pbi].dot(T[bi]),-1,1));
      if(Math.abs(dy9)<.5)b.phi-=dy9; // (garde : saut de piste au portail = pas une vraie rotation)
    }
    b.pbi=bi;
    b.phi=THREE.MathUtils.clamp(b.phi,-1.4,1.4);
    // ============ L'AVANCE : mêmes intégrateurs (SPD compris) ============
    b.lat+=b.v*Math.sin(b.phi)*dt*SPD;
    b.totD+=b.v*Math.cos(b.phi)*dt*SPD;
    // ============ VOL & BORD : mêmes règles — la roue sort, la caisse décolle ============
    if(b.air){
      b.vy-=26*GRAV_K*gK()*dt;b.airH+=b.vy*dt; // la meute subit la même gravité (lunaire en orbite)
      b.spin+=b.spinV*dt;b.spinV*=Math.max(0,1-dt*.5);
      if(b.airH<=0){ // la retombée
        b.air=false;b.airH=0;b.vy=0;b.spin=0;b.spinV=0;b.jumpCD=1+Math.random()*1.6;
        if(Math.abs(b.lat)>ROAD_HALF){botBoom(b);continue;} // retombé À CÔTÉ : le vide ne pardonne pas, même à eux
                if(b.mesh.g.visible)sparkBurst(sparkGold,b.mesh.g.position,7,7);
      }
    }else{
      if(Math.abs(b.lat)>ROAD_HALF){ // le BORD : même sanction que toi — ça décolle, à lui de revenir
        b.air=true;b.airH=.01;b.vy=6;b.spinV=(Math.random()-.5)*2;
      }else{
        b.jumpCD-=dt;
        if(b.jumpCD<=0){ // « il a vu où tu sautes » : TES spots sont leurs SEULS tremplins — plus de saut sorti de nulle part
          for(let zi=0;zi<SURV.jumpZones.length;zi++){
            const z=SURV.jumpZones[zi];
            if(zi!==b.zoneMark&&Math.abs(z.d-b.totD)<8){
              b.zoneMark=zi;
              if(Math.random()<.25+b.appJump*.6){ // l'appétit hérité de TOI décide s'il OSE
                const air9=z.dur*(.7+b.appJump*.5);
                b.air=true;b.airH=.01;b.vy=13*Math.min(air9,4); // vy=G·t/2 : il reproduit la DURÉE de ton vol
                b.spinV=(Math.random()<.5?-1:1)*(1+b.agro*5.5)*(air9>1.5?1:.35);
                b.jumpCD=2.2;
              }
              break;
            }
          }
        }
      }
    }
    // ============ OBSTACLES : la piste cogne pareil pour tout le monde ============
    if(!b.air&&rel>0&&rel<L){
      if(!b.alive)continue;
      b.oilCd=Math.max(0,b.oilCd-dt);
      if(b.oilCd<=0)for(const o9 of OILS){ // flaques : ça chasse pareil
        if(o9.face!==1||Math.abs(rel-o9.s)>o9.r+2)continue;
        if(Math.abs(b.lat-o9.lat)<o9.r+.6){b.slipT=.75;b.oilCd=1.2;break;}
      }
      b.padCd=Math.max(0,b.padCd-dt);
      if(b.padCd<=0)for(let i9=0;i9<PADS.length;i9++){ // pads turbo : même coup de pied, même règle de VISÉE que le joueur
        if(Math.abs(rel-PADS[i9])<6&&Math.abs(b.lat-PADL[i9])<4.1){b.v+=18;b.padB=Math.max(b.padB,1.5);b.padCd=1.5;break;}
      }
    }
  }
  // ---- incarnation : mesh + gyros SEULEMENT à portée de vue (LOD), 2 vraies lumières pour les proches ----
  const ph5=SURV.ph%1<.5;
  let li=0,bjD=1e9,bjOn=false;
  for(const b of SURV.bots){
    if(!b.alive){b.trailK=0;trailStep(b.trail,0,0,0,0,0,0,0);continue;}
    const rel=b.totD-SURV.pBase;
    const gap=Math.abs(rel-sP9); // (2026-09-30) ta vraie place, même en vol : en long saut, les gyrophares éclairaient la meute restée au tremplin
    if(rel>2&&rel<L-4){
      frameAt(rel,FB);
      // TRAÎNÉE BLEUE : mise à jour SANS limite de distance — la grosse signature de la meute se voit de LOIN (fog:false)
      b.trailK+=((b.boostT>0?1:0)-b.trailK)*Math.min(1,dt*(b.boostT>0?16:5));
      svT1.copy(FB.p).addScaledVector(FB.b,b.lat).addScaledVector(FB.n,1.05+b.airH).addScaledVector(FB.t,-2.5);
      trailStep(b.trail,svT1.x,svT1.y,svT1.z,.5,.62,1.55,b.trailK,1.7);
      const lodP9=Math.max(340,FOG_N+120); // (2026-09-28) la voiture n'apparaît plus NETTE à 340 m quand la brume commence plus loin : elle naît dans la brume
      if(gap<lodP9){
      const m=b.mesh.g;m.scale.setScalar(Math.min(1,(lodP9-gap)/50)); // …et grandit sur les 50 derniers mètres au lieu de surgir
      m.position.copy(FB.p).addScaledVector(FB.b,b.lat).addScaledVector(FB.n,.56+b.airH); // la hauteur de VOL soulève la caisse
      m.quaternion.setFromRotationMatrix(svM4.makeBasis(FB.b,FB.n,FB.t));
      m.rotateY(b.phi); // le cap RÉEL de la sim : on VOIT les braquages, contre-braquages et embardées
      if(b.spin)m.rotateZ(b.spin); // la vrille policière : barrel roll autour de l'axe de route
      m.visible=true;
      const bph=((SURV.ph+b.ph)%1)<.5; // chaque rampe bat sur SA phase — la meute scintille
      b.mesh.lampR.material=bph?gyroRedOn:gyroRedOff;
      b.mesh.lampB.material=bph?gyroBluOff:gyroBluOn;
      b.mesh.sR.visible=bph;b.mesh.sB.visible=!bph;
      const gsc=(2.1+Math.sin((SURV.ph+b.ph)*Math.PI*2)*.5)*Math.max(0,1-gap/400); // le halo respire, s'éteint au loin (borné : la meute peut désormais s'afficher au-delà de 400 m)
      b.mesh.sR.scale.set(gsc*3,gsc*1.6,1);b.mesh.sB.scale.set(gsc*3,gsc*1.6,1);
      b.mesh.jet.visible=b.boostT>0; // NITRO VISIBLE : la flamme claque derrière la caisse qui pousse
      const jOn9=b.boostT>0; // PLUME DE RÉACTEUR bleue : les mêmes cônes que le joueur
      for(const j9 of b.mesh.jets)j9.visible=jOn9;
      if(jOn9){
        const fl9=.8+.2*Math.sin(SURV.t*57+b.ph*31),jl9=1.5*fl9,jr9=.13;
        b.mesh.jets[0].scale.set(jr9,jr9,jl9);b.mesh.jets[1].scale.set(jr9*.5,jr9*.5,jl9*.72);
        b.mesh.jets[2].scale.set(jr9,jr9,jl9);b.mesh.jets[3].scale.set(jr9*.5,jr9*.5,jl9*.72);
        b.mesh.jetPool.material.opacity=.34*fl9; // le halo bleu de SA nitro lèche la route, comme le tien
      }else b.mesh.jetPool.material.opacity=0;
      if(b.boostT>0){
        const js9=1.2+Math.random()*.6;b.mesh.jet.scale.set(js9,js9*.55,1);
        if(gap<130&&Math.random()<dt*24) // et quelques braises au ras du pare-chocs (LOD : proches seulement)
          spawnP(flameCore,m.position.x,m.position.y+.4,m.position.z,(Math.random()-.5)*2,.5+Math.random(),(Math.random()-.5)*2,.2);
        if(gap<bjD){bjD=gap;bjOn=true;botJetLight.position.copy(m.position).addScaledVector(FB.t,-2.4).addScaledVector(FB.n,.5);} // sa nitro éclaire AUSSI la route
      }
      if(li<2&&gap<170){ // les 2 plus proches allument VRAIMENT la route (et ta carrosserie)
        const l=gyroLights[li++];
        l.position.copy(m.position);l.position.addScaledVector(FB.n,2.2);
        l.color.setHex(bph?0xff3030:0x3f7dff);
        l.intensity=(1-gap/170)*2.6*(0.6+0.4*Math.abs(Math.sin((SURV.ph+b.ph)*Math.PI*4)));
      }
      }else b.mesh.g.visible=false;
    }else{b.mesh.g.visible=false;b.trailK=0;trailStep(b.trail,0,0,0,0,0,0,0);}
  }
  while(li<2)gyroLights[li++].intensity=0;
  botJetLight.intensity+=(((bjOn&&bjD<200)?(1-bjD/200)*2.2:0)-botJetLight.intensity)*Math.min(1,dt*10); // le reflet bleu suit la poussée la plus proche
  // ---- sirène : une seule voix, dosée sur la plus proche QUI POURSUIT (derrière toi) ----
  if(sirG){
    let near=1e9;for(const b of alive){const g9=pTot-b.totD;if(g9>0&&g9<near)near=g9;}
    const vol=near<170?(1-near/170)*.032:0; // basse, lointaine — la menace s'entend sans agresser
    sirG.gain.setTargetAtTime(SND.sfx?vol:0,AC.currentTime,.25);
  }
  // ---- DERNIER = CONDAMNÉ : la caisse clignote rouge, le HUD crie l'échéance ----
  if(mode!=='fall')SURV.last=alive.length>0&&pRank>alive.length; // (2026-09-30) le verdict se rend SUR LA ROUTE : en vol il garde celui du décollage (la dalle survolée peut être une autre branche de la piste), la pose le refait
  if(SONV2){ /* (console de son) TU ES DERNIER : le bip d'alarme, de plus en plus serré à mesure que la minute s'achève */
    if(SURV.last&&!gameOver){if(!SURV.alW&&performance.now()-(SURV.alQ||0)>500)SURV.alT=0;SURV.alT-=dt;if(SURV.alT<=0){const r9=Math.max(0,60-SURV.t);SURV.alT=Math.max(.18,Math.min(1.6,r9*.06));sfx('alerte.dernier',{vol:r9<10?2:0});}}
    if(SURV.alW&&!SURV.last)SURV.alQ=performance.now();SURV.alW=SURV.last&&!gameOver;} /* (débogage son 2026-09-29) une seconde place perdue puis reprise en moins de 0,5 s ne relance pas le bip */
  if(SURV.last&&!gameOver&&!TCTL.on){ // (2026-09-30) au téléphone, #lastAlert est masqué : on ne réécrit plus son HTML à chaque image
    const left=Math.max(0,Math.min(59,Math.ceil(60-SURV.t))); /* (24/10, relecture) jamais « 00:60 » (voir svClockDraw) */
    lastAlertEl.innerHTML=TR('⚠ ATTENTION !<br>TU ES DERNIER<br>EXPLOSION DANS : 00:')+String(left).padStart(2,'0');
    lastAlertEl.style.display='block';
  }else lastAlertEl.style.display='none';
  // (2026-09-30) LA MINUTE TOMBE EN VOL : le couperet ATTEND LA POSE — au plus airMax + ½ s (le pouvoir d'airtime infini n'est pas une cachette) ;
  // jamais sur une caisse qui explose déjà (l'attente d'une pose peut finir en explosion d'airtime : pas de « ÉLIMINÉ » par-dessus)
  if(SURV.t>=60&&mode!=='boom'&&!(mode==='fall'&&SURV.t<60.5+airMax())){ // ---- LE COUPERET ----
    SURV.t=SURV.t>60.5?0:SURV.t-60; // retardé par un vol : la minute suivante repart ENTIÈRE
    if(mode==='fall')SURV.last=alive.length>0&&pRank>alive.length; // vol trop long : on juge où il vole VRAIMENT
    if(SURV.last){ // le joueur est bon dernier : feu d'artifice funèbre
      SURV.over=true;lastAlertEl.style.display='none';
      showMsg('🪦 ÉLIMINÉ — DERNIER DE LA MINUTE !','#ff5e5e');
      flashEl.style.opacity=.85;setTimeout(function(){flashEl.style.opacity=0;},300);
      sparkBurst(sparkGold,carGroup.position,60,26);sparkBurst(sparkBlue,carGroup.position,40,20);
      shake=2.2;duckT=Math.max(duckT,.8);
      survRender();explode('police');
    }else{
      const low=racers[racers.length-1];
      if(low&&low.alive&&low.totD<pTot){botBoom(low); /* (24/10, relecture : « double explosion d'un policier ») `racers` est figé avant la boucle des policiers : celui qui vient d'y retomber à côté de la route (botBoom) ne resaute pas (preuve-police-double) */ // la meute s'ÉNERVE : pas plus vite que toi, mais plus téméraire
        for(const b of SURV.bots)if(b.alive){b.agro=Math.min(1,b.agro+.08);b.appBoost=Math.min(1.2,b.appBoost+.1);b.marg=Math.min(.97,b.marg+.02);}}
      if(!SURV.bots.some(b=>b.alive)){
        SURV.over=true;if(SONV2)sfx('victoire');else fanfare();
        runStats.surv=1; // toute la meute au tapis : ça débloque une caisse (versé dans endGame)
        // (2026-09-30) « JAUGE OFFERTE » n'offrait RIEN (addStyle est vide depuis le 2026-07-30) et le message passait par showMsg, muet au
        // téléphone : l'annonce passe au COULOIR (lisible partout), la nitro est VRAIMENT pleine, l'aura et la vibration saluent
        nitroR=Math.max(nitroR,nitroCap());
        slam('CHAMPION !','LA MEUTE EST AU TAPIS','#ffd75e','#5b7dff',44,3,26);
        try{chaineAura('CHAMPION',500,'survivant',false,SONV2);}catch(e){}
        hap([30,40,30,40,90]);
        vChip(''); // plus de meute, plus de plaque
      }
    }
  }
  SURV._r-=dt;if(SURV._r<=0){SURV._r=.25;survRender();if(TCTL.on&&!SURV.over)meuteTick();} // le panneau, lui, se contente de 4 Hz — (2026-09-30) au téléphone (#survHud et #lastAlert masqués), c'est la PLAQUE qui dit le rang, la minute et « DERNIER ! »
}
function survRender(){
  if(!svRowsEl||TCTL.on)return; // (2026-09-30) #survHud est masqué au téléphone : rien à repeindre
  const pTot=survPTot();
  const rows=[{name:TR('TOI'),totD:pTot,alive:!gameOver,me:true},...SURV.bots]
    .sort((a,b)=>(b.alive-a.alive)||(b.totD-a.totD));
  const leadD=rows.length&&rows[0].alive?rows[0].totD:pTot;
  let h='',rk=0;
  for(const r of rows){
    const gap=r.alive?(rk===0?TR('EN TÊTE'):'+'+Math.round(leadD-r.totD)+' m'):'';
    h+='<div class="svRow'+(r.me?' me':'')+(r.alive?'':' dead')+'">'
      +(r.alive?(++rk)+'. ':'🪦 ')+r.name+' <span>'+gap+'</span></div>';
  }
  svRowsEl.innerHTML=h;
}
