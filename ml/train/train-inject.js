/* ========== MODE ENTRAÎNEMENT NEUROÉVOLUTION (CASH CAR) ==========
   CRITIQUE : ce bloc est INERTE tant que l'URL ne contient pas ?train=1.
   En mode normal train.html est un clone exact de la démo.            */
const IS_TRAIN=/train=1/.test(location.search);
if(IS_TRAIN){
(function(){
'use strict';

/* ---------- PETIT MLP 12 → 16 → 3 (pur JS, pas de lib) ---------- */
function MLP(w){ this.w=w||new Float32Array(MLP.SIZE); }
MLP.IN=12; MLP.HID=16; MLP.OUT=3;
MLP.SIZE=(MLP.IN+1)*MLP.HID + (MLP.HID+1)*MLP.OUT;
MLP.random=function(){ const w=new Float32Array(MLP.SIZE); for(let i=0;i<MLP.SIZE;i++) w[i]=(Math.random()*2-1)*0.8; return new MLP(w); };
MLP.crossover=function(a,b){ const w=new Float32Array(MLP.SIZE); for(let i=0;i<MLP.SIZE;i++) w[i]=Math.random()<0.5?a.w[i]:b.w[i]; return new MLP(w); };
MLP.prototype.forward=function(inArr,out){
  const w=this.w; let p=0;
  for(let i=0;i<MLP.HID;i++){
    let sum=w[p++];
    for(let j=0;j<MLP.IN;j++) sum+=w[p++]*inArr[j];
    out[i]=Math.tanh(sum);
  }
  for(let i=0;i<MLP.OUT;i++){
    let sum=w[p++];
    for(let j=0;j<MLP.HID;j++) sum+=w[p++]*out[j];
    out[MLP.HID+i]=Math.tanh(sum);
  }
  return out;
};
MLP.prototype.mutate=function(sigma,rate){
  for(let i=0;i<this.w.length;i++) if(Math.random()<rate) this.w[i]+=randGauss()*sigma;
};
function randGauss(){
  const u=Math.random(),v=Math.random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}

/* ---------- NAMESPACE TRAIN ---------- */
const TRAIN={
  POP:24, GEN:0, genSinceTrack:0, seed:1,
  bots:[], running:false, genTime:0, matchDuration:45, simSpeed:1,
  record:0, camBot:0,
  tmpV:new THREE.Vector3(),
  tmpF:{p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},
  inArr:new Float32Array(MLP.IN),
  outArr:new Float32Array(MLP.HID+MLP.OUT),
  dTmp:new THREE.Vector3()
};

TRAIN.init=function(){
  // HUD survie normal : on le cache (le mode train a son propre HUD)
  if(survHudEl) survHudEl.style.display='none';
  if(lastAlertEl) lastAlertEl.style.display='none';
  // Le joueur humain n'existe pas ici : on cache sa caisse
  carGroup.visible=false;
  // Performance : on coupe gyros, sirène et trails lourds dès le départ
  for(const l of gyroLights) l.intensity=0;
  botJetLight.intensity=0;
  try{ if(sirG) sirG.gain.setTargetAtTime(0,AC.currentTime,.1); }catch(e){}
  // HUD train
  TRAIN.makeHud();
  // Population initiale
  TRAIN.newGen(true);
  TRAIN.running=true;
  // On remplace les fonctions Survivant par nos versions
  TRAIN.origSurvStart=survStart;
  TRAIN.origSurvTick=survTick;
  survStart=function(){}; // rien à démarrer, tout est géré par TRAIN
  survTick=function(dt){ if(TRAIN.running) TRAIN.tick(dt); };
  TRAIN.origLoop=loop;
  loop=TRAIN.loop;
  // Contrôles
  addEventListener('keydown',TRAIN.key);
};

/* ---------- BOUCLE DE RENDU TRAIN ---------- */
TRAIN.loop=function(now){
  requestAnimationFrame(loop);
  if(document.hidden){ last=now; return; }
  let dt=Math.min((now-last)/1000,0.05); last=now;
  dt*=TRAIN.simSpeed;
  const t=now/1000;
  bioStep(dt);
  if(TRAIN.running){
    try{ TRAIN.tick(dt); }catch(e){ console.error('TRAIN.tick',e); }
    TRAIN.camTick(dt);
  }
  // Ciel et ambiance suivent la caméra
  skyDome.position.copy(camera.position);
  skyU.uTime.value=t;
  if(acesPass) acesPass.uniforms.uSpeed.value=0;
  planetGroup.position.copy(camera.position).addScaledVector(PLANET_DIR,PLANET_D);
  if(planetGroup.userData.globe) planetGroup.userData.globe.rotation.y=t*.014;
  sunSprite.position.copy(camera.position).addScaledVector(SUN_DIR,3600);
  horizonGlow.position.copy(camera.position).addScaledVector(SUN_DIR,3650);
  horizonGlow.position.y-=GLOW_DROP;
  for(let r9=0;r9<RAYS.length;r9++){
    RAYS[r9].position.copy(camera.position).addScaledVector(SUN_DIR,3500).addScaledVector(SUN_PERP,RAY_OFF[r9]);
    RAYS[r9].position.y+=RAY_LIFT;
  }
  // Ombre centrée sur le bot suivi
  const cb=TRAIN.bots[TRAIN.camBot];
  if(cb && cb.alive){
    if(cb.air) shadV.copy(cb.fPos); else { frameAt(cb.totD-SURV.pBase,TRAIN.tmpF); shadV.copy(TRAIN.tmpF.p); }
  }else shadV.copy(camera.position);
  const ts9=68/sun.shadow.mapSize.x;
  shadV.addScaledVector(SUN_PERP,Math.round(shadV.dot(SUN_PERP)/ts9)*ts9-shadV.dot(SUN_PERP));
  shadV.addScaledVector(SUN_UP,Math.round(shadV.dot(SUN_UP)/ts9)*ts9-shadV.dot(SUN_UP));
  sun.target.position.copy(shadV);
  sun.position.copy(shadV).addScaledVector(SUN_DIR,160);
  sun.target.updateMatrixWorld();
  if(POST_ON&&composer) composer.render(); else renderer.render(scene,camera);
  try{ engVigRender(dt); }catch(e){}
};

/* ---------- MOTEUR D'ENTRAÎNEMENT ---------- */
TRAIN.tick=function(dt){
  TRAIN.genTime+=dt;
  let aliveCount=0;
  for(const b of TRAIN.bots) if(b.alive){ aliveCount++; TRAIN.botStep(b,dt); }
  TRAIN.updateMeshes(dt);
  if(aliveCount===0 || TRAIN.genTime>=TRAIN.matchDuration) TRAIN.endGen();
  TRAIN.hudTick();
};

TRAIN.botStep=function(b,dt){
  // Cerveau : tick humain ~10 Hz, entre deux ticks on garde les décisions
  b.think-=dt;
  if(b.think<=0){
    b.think=0.1;
    TRAIN.brainInput(b);
    b.brain.forward(TRAIN.inArr,TRAIN.outArr);
    b.latT=TRAIN.outArr[MLP.HID+0]*ROAD_HALF;
    b.nitroWant=TRAIN.outArr[MLP.HID+1];
    b.jumpWant=TRAIN.outArr[MLP.HID+2];
  }
  if(!b.air) TRAIN.groundPhysics(b,dt);
  else TRAIN.airPhysics(b,dt);
  TRAIN.obstacles(b,dt);
};

/* ---------- PHYSIQUE SOL (inspirée de survTick, simplifiée) ---------- */
TRAIN.groundPhysics=function(b,dt){
  const spec9=CARS[0], late9=lateMul(), push9=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).push,
        maxSp9=spec9.maxKmh/3.6*late9*push9,
        acc9=spec9.accel*late9*(1+(push9-1)*.6),
        tc9=spec9.turn*.75;
  const rel=b.totD-SURV.pBase;
  const bi=Math.floor(THREE.MathUtils.clamp(rel/L,0,1)*(NP-1));
  b.pbi=bi;
  // Momentum ligne droite
  const brk=b.v>b.cornerV*1.05;
  const lift=b.v>b.cornerV*.96;
  if(!brk && Math.abs(b.steer)<.2 && Math.abs(b.phi)<.25) b.momT+=dt; else b.momT=Math.max(0,b.momT-dt*3);
  const momF=1+Math.min(1.8,b.momT*b.momT*.1);
  let a9=0;
  if(brk) a9=b.v>2?-acc9*1.5:-acc9*.5;
  else if(!lift) a9=acc9*(b.v<maxSp9?1:.55)*(b.padB>0?1.5:1)*momF;
  b.v+=a9*dt;
  b.v+=-GRAV*T[bi].y*Math.cos(b.phi)*dt;
  b.v-=b.v*Math.abs(b.v)*(acc9/(maxSp9*maxSp9*5.8))*dt;
  b.v*=Math.max(0,1-.03*dt);
  if(!brk && lift) b.v*=Math.max(0,1-.4*dt);
  if(b.v<0) b.v=0;
  // Nitro
  b.nT-=dt;
  const nOn=b.nT>0 && !brk && b.nitroR>.005 && b.nitroWant>0.5;
  if(nOn){ b.v+=30*dt; b.nitroR=Math.max(0,b.nitroR-dt); }
  b.nitroR=Math.min(2,b.nitroR+.2*dt);
  b.boostT=nOn?1:0;
  // Direction
  const dL9=b.latT-b.lat;
  const phiT=THREE.MathUtils.clamp(dL9/(Math.max(6,b.v*SPD)*.9),-.62,.62);
  let st=THREE.MathUtils.clamp((phiT-b.phi)*4,-1,1);
  b.steer+=(st-b.steer)*Math.min(1,dt*18);
  if(Math.abs(b.steer)>.1) b.sHold=Math.min(.3,b.sHold+dt); else b.sHold=0;
  b.phi+=b.steer*(.55+.45*Math.min(1,b.sHold/.3))*tc9*THREE.MathUtils.clamp(b.v/8,-1,1)*(1/(1+Math.abs(b.v)*TURN_HS))*dt;
  b.phi=THREE.MathUtils.clamp(b.phi,-1.4,1.4);
  // Intégration lat/long
  b.lat+=b.v*Math.sin(b.phi)*dt*SPD;
  b.totD+=b.v*Math.cos(b.phi)*dt*SPD;
  // Vitesse de passage des virages devant
  const segL9=L/(NP-1);
  const look=THREE.MathUtils.clamp((b.v*b.v*SPD)/(2*acc9*1.5)+30,24,230);
  let vSafe=1e9;
  for(let k9=1;k9<=3;k9++){
    const d9=look*k9/3;
    const j9=Math.min(NP-1,bi+Math.max(1,Math.round(d9/segL9)));
    const dot=T[bi].dot(T[j9]);
    if(dot>=0.9999) continue;
    const kap=Math.acos(THREE.MathUtils.clamp(dot,-1,1))/Math.max(1,d9);
    if(kap>1e-4){
      const kS=kap*SPD, vs=(-kS+Math.sqrt(kS*kS+4*kS*TURN_HS*tc9))/(2*kS*TURN_HS);
      if(vs<vSafe) vSafe=vs;
    }
  }
  b.cornerV=vSafe*0.85;
  // Déclenchement du vol
  const rel2=b.totD-SURV.pBase;
  if(rel2>0 && rel2<L && holeAtS(rel2)){
    TRAIN.startFallBot(b, 7 + Math.min(8, b.v*SPD*0.06));
  }else if(Math.abs(b.lat)>ROAD_HALF){
    TRAIN.startFallBot(b, 6.5);
  }else if(b.jumpWant>0.6 && b.jumpCD<=0){
    TRAIN.startFallBot(b, 9 + Math.min(6, b.v*SPD*0.05));
    b.jumpCD=1.5;
  }
  if(b.jumpCD>0) b.jumpCD-=dt;
};

/* ---------- DÉCOLLAGE (formules du joueur, simplifiées) ---------- */
TRAIN.startFallBot=function(b, impU){
  if(b.air) return;
  b.air=true; b.fT=0; b.fTR=0;
  const rel=b.totD-SURV.pBase;
  const bi=Math.floor(THREE.MathUtils.clamp(rel/L,0,1)*(NP-1));
  frameAt(rel,TRAIN.tmpF);
  b.fPos.copy(TRAIN.tmpF.p).addScaledVector(TRAIN.tmpF.b, b.lat).addScaledVector(TRAIN.tmpF.n, 0.6);
  const vLat=b.v*Math.sin(b.phi);
  b.fVel.copy(TRAIN.tmpF.t).multiplyScalar(b.v*SPD).addScaledVector(TRAIN.tmpF.b, vLat).addScaledVector(TRAIN.tmpF.n, impU||0.9);
  if(b.fVel.y>70) b.fVel.y=70;
  b.flyStartTotD=b.totD;
};

/* ---------- VOL VECTORIEL ---------- */
TRAIN.airPhysics=function(b,dt){
  const AIR_RATE=THREE.MathUtils.clamp(1+Math.max(0,Math.abs(b.v)*3.6*SPD-450)/1800,1,1.35);
  const dtF=dt*AIR_RATE;
  b.fT+=dtF; b.fTR+=dt;
  b.fVel.y-=FALL_G*dtF;
  // Nitro aérienne = poussée le long de fVel
  const nAir=b.nitroWant>0.5 && b.nT>0 && b.nitroR>.005;
  if(nAir){
    TRAIN.tmpV.copy(b.fVel);
    if(TRAIN.tmpV.lengthSq()>0.0001) TRAIN.tmpV.normalize(); else TRAIN.tmpV.copy(T[b.pbi]||AXIS_Y);
    const boost=b.nitroR<=0.01?70:52;
    b.fVel.addScaledVector(TRAIN.tmpV, boost*dtF);
    b.nitroR=Math.max(0,b.nitroR-dt);
    b.nT=Math.max(b.nT,0.25);
    b.boostT=1;
  }
  b.fPos.addScaledVector(b.fVel, dtF*SPD);
  b.v=Math.max(2,b.fVel.length());
  if(TRAIN.tryLandBot(b,dtF)) return;
  if(b.fTR>6.5){ TRAIN.kill(b,'airtime'); return; }
};

/* ---------- ATTERRISSAGE (logique tryLand du joueur, allégée) ---------- */
TRAIN.tryLandBot=function(b,dt){
  let bestI=-1,bd=1e9;
  for(let i=0;i<NP;i+=2){
    if(holeAtI(i)) continue;
    const dx=b.fPos.x-pts[i].x, dy=b.fPos.y-pts[i].y, dz=b.fPos.z-pts[i].z;
    const dd=dx*dx+dy*dy+dz*dz;
    if(dd<bd){ bd=dd; bestI=i; }
  }
  if(bestI<0) return false;
  if(bd>1600) return false;
  TRAIN.dTmp.subVectors(b.fPos,pts[bestI]);
  const hOff=TRAIN.dTmp.dot(Nn[bestI]);
  const latOff=TRAIN.dTmp.dot(B[bestI]);
  const vN=b.fVel.dot(Nn[bestI]);
  // Fenêtre de contact face DESSUS
  if(b.fT>.35 && hOff>-1.2 && hOff<3 && vN<9 && Math.abs(latOff)<ROAD_HALF){
    const rel=THREE.MathUtils.clamp(bestI/(NP-1)*L + THREE.MathUtils.clamp(TRAIN.dTmp.dot(T[bestI]),-2,2), 0, L-1);
    const gain=rel-(b.totD-SURV.pBase);
    b.totD=SURV.pBase+rel;
    b.lat=THREE.MathUtils.clamp(latOff,-ROAD_HALF+0.6,ROAD_HALF-0.6);
    b.phi=Math.atan2(b.fVel.dot(B[bestI]), b.fVel.dot(T[bestI]));
    b.v=Math.max(2,b.fVel.length());
    b.air=false;
    b.landings++;
    if(gain>20){ b.goodCuts++; b.cutGain+=gain; }
    // Perte de vitesse à l'atterrissage
    const impact=Math.abs(vN);
    const landLoss=Math.min(.52, Math.max(0,b.fT-.8)*.15 + impact*.008);
    b.v*=(1-landLoss);
    return true;
  }
  // Mort sous la piste
  if(hOff<-THICK-40){ TRAIN.kill(b,'under'); return true; }
  return false;
};

/* ---------- OBSTACLES (mêmes règles que la meute) ---------- */
TRAIN.obstacles=function(b,dt){
  const rel=b.totD-SURV.pBase;
  if(b.air || rel<=0 || rel>=L) return;
  const bi=b.pbi;
  for(const c9 of CONES){
    if(c9.hit || c9.face!==1 || Math.abs(rel-c9.s)>2.6) continue;
    if(Math.abs(b.lat-c9.lat)<1.6){
      c9.hit=true;
      const kv=new THREE.Vector3().copy(T[bi]).multiplyScalar(Math.max(8,b.v*.55))
        .addScaledVector(B[bi],(b.lat-c9.lat>0?-1:1)*(2+Math.random()*4))
        .addScaledVector(Nn[bi],5+Math.random()*5);
      FLYCONES.push({m:c9.mesh,v:kv,rx:(Math.random()-.5)*16,rz:(Math.random()-.5)*16,life:1.6});
      b.v*=.985;
    }
  }
  b.oilCd=Math.max(0,b.oilCd-dt);
  if(b.oilCd<=0) for(const o9 of OILS){
    if(o9.face!==1 || Math.abs(rel-o9.s)>o9.r+2) continue;
    if(Math.abs(b.lat-o9.lat)<o9.r+.6){ b.slipT=.75; b.oilCd=1.2; break; }
  }
  b.padCd=Math.max(0,b.padCd-dt);
  if(b.padCd<=0) for(const p9 of PADS){
    if(Math.abs(rel-p9)<6 && Math.abs(b.lat)<ROAD_HALF){ b.v+=14; b.padB=Math.max(b.padB,1.2); b.padCd=1.5; break; }
  }
  if(b.slipT>0){
    b.slipT-=dt;
    b.phi+=(Math.random()-.5)*2.6*dt*Math.min(1,Math.abs(b.v)/12);
  }
  b.padB=Math.max(0,b.padB-dt);
};

/* ---------- ENTRÉES DU CERVEAU (normalisées ~[-1,1]) ---------- */
TRAIN.brainInput=function(b){
  const rel=b.totD-SURV.pBase;
  const bi=Math.floor(THREE.MathUtils.clamp(rel/L,0,1)*(NP-1));
  const segL=L/(NP-1);
  const arr=TRAIN.inArr;
  arr[0]=THREE.MathUtils.clamp(b.v/80,-1,1);
  arr[1]=THREE.MathUtils.clamp(b.lat/ROAD_HALF,-1,1);
  // Courbure devant
  let crv=0;
  const j1=Math.min(NP-1,bi+Math.max(1,Math.round(40/segL)));
  const dot=T[bi].dot(T[j1]);
  if(dot<0.9999){
    const kap=Math.acos(THREE.MathUtils.clamp(dot,-1,1))/Math.max(1,40);
    TRAIN.tmpV.crossVectors(T[bi],T[j1]);
    crv=kap*Math.sign(TRAIN.tmpV.dot(Nn[bi]));
  }
  arr[2]=THREE.MathUtils.clamp(crv*300,-1,1);
  // Distance au prochain trou
  let holeD=999;
  for(let i=bi;i<NP;i+=2){ if(holeAtI(i)){ holeD=(i-bi)*segL; break; } }
  arr[3]=THREE.MathUtils.clamp(1-holeD/200,-1,1);
  // Meilleur croisement devant
  let bestGain=-999,bestJ=-1,bestDy=0,bestD3=0;
  const lookI=Math.min(NP-1,bi+Math.max(10,Math.round(430/segL)));
  for(let j=bi+6;j<lookI;j+=2){
    if(holeAtI(j)) continue;
    TRAIN.tmpV.subVectors(pts[bi],pts[j].clone().addScaledVector(B[j],ROAD_HALF)); const dL=TRAIN.tmpV.length();
    TRAIN.tmpV.subVectors(pts[bi],pts[j].clone().addScaledVector(B[j],-ROAD_HALF)); const dR=TRAIN.tmpV.length();
    const d3=Math.min(dL,dR);
    if(d3<8 || d3>60) continue;
    const dy=pts[bi].y-pts[j].y;
    if(dy<10 || dy>60) continue;
    const dArc=(j-bi)*segL;
    const gain=dArc-d3;
    if(gain>=25 && gain>bestGain){ bestGain=gain; bestJ=j; bestDy=dy; bestD3=d3; }
  }
  arr[4]=bestJ>=0?THREE.MathUtils.clamp(1-bestGain/300,-1,1):-1;
  arr[5]=bestJ>=0?THREE.MathUtils.clamp(bestDy/60,-1,1):0;
  arr[6]=bestJ>=0?THREE.MathUtils.clamp(bestGain/300,-1,1):-1;
  arr[7]=THREE.MathUtils.clamp(b.nitroR/2,-1,1);
  arr[8]=b.air?1:0;
  if(b.air){
    frameAt(rel,TRAIN.tmpF);
    arr[9]=THREE.MathUtils.clamp((b.fPos.y-TRAIN.tmpF.p.y)/40,-1,1);
    arr[10]=THREE.MathUtils.clamp(b.fVel.y/30,-1,1);
  }else{ arr[9]=0; arr[10]=0; }
  arr[11]=THREE.MathUtils.clamp(b.fVel.y/30,-1,1);
};

/* ---------- MISES À JOUR DES MESHES ---------- */
TRAIN.updateMeshes=function(dt){
  for(let i=0;i<TRAIN.bots.length;i++){
    const b=TRAIN.bots[i];
    const m=b.mesh.g;
    if(!b.alive){ m.visible=false; continue; }
    const rel=b.totD-SURV.pBase;
    if(rel<0 || rel>L){ m.visible=false; continue; }
    if(!b.air){
      frameAt(rel,TRAIN.tmpF);
      m.position.copy(TRAIN.tmpF.p).addScaledVector(TRAIN.tmpF.b,b.lat).addScaledVector(TRAIN.tmpF.n,0.56);
      m.quaternion.setFromRotationMatrix(svM4.makeBasis(TRAIN.tmpF.b,TRAIN.tmpF.n,TRAIN.tmpF.t));
      m.rotateY(b.phi);
    }else{
      m.position.copy(b.fPos);
      if(b.fVel.lengthSq()>0.0001){
        TRAIN.tmpV.copy(b.fVel).normalize();
        const up=AXIS_Y;
        const right=TRAIN.dTmp.crossVectors(up,TRAIN.tmpV).normalize();
        const fwd=TRAIN.tmpV;
        m.quaternion.setFromRotationMatrix(svM4.makeBasis(right,up,fwd));
      }
    }
    m.visible=true;
    const jOn=b.boostT>0;
    b.mesh.jet.visible=jOn;
    for(const j9 of b.mesh.jets) j9.visible=jOn;
    if(jOn){
      const jl9=1.4, jr9=.13;
      for(let k=0;k<b.mesh.jets.length;k++) b.mesh.jets[k].scale.set(k%2===0?jr9:jr9*.5, k%2===0?jr9:jr9*.5, jl9*(k%2===0?1:.72));
      b.mesh.jetPool.material.opacity=.3;
    }else b.mesh.jetPool.material.opacity=0;
  }
};

/* ---------- CAMÉRA : SUIT LE MEILLEUR BOT VIVANT ---------- */
TRAIN.camTick=function(dt){
  let cb=TRAIN.bots[TRAIN.camBot];
  if(!cb || !cb.alive) cb=TRAIN.bestAlive();
  if(!cb) return;
  TRAIN.camBot=TRAIN.bots.indexOf(cb);
  const rel=cb.totD-SURV.pBase;
  frameAt(rel,TRAIN.tmpF);
  let targetPos;
  if(cb.air) targetPos=cb.fPos;
  else targetPos=TRAIN.tmpF.p.clone().addScaledVector(TRAIN.tmpF.b,cb.lat).addScaledVector(TRAIN.tmpF.n,0.6);
  const camBack=8, camH=4.5;
  TRAIN.tmpV.copy(TRAIN.tmpF.p).addScaledVector(TRAIN.tmpF.b,cb.lat).addScaledVector(TRAIN.tmpF.n,camH).addScaledVector(TRAIN.tmpF.t,-camBack);
  camera.position.lerp(TRAIN.tmpV,Math.min(1,dt*4));
  camera.up.lerp(TRAIN.tmpF.n,Math.min(1,dt*4)).normalize();
  TRAIN.tmpV.copy(targetPos).addScaledVector(TRAIN.tmpF.t,12).addScaledVector(TRAIN.tmpF.n,1);
  camera.lookAt(TRAIN.tmpV);
};

TRAIN.bestAlive=function(){
  let best=null;
  for(const b of TRAIN.bots) if(b.alive && (!best || b.totD>best.totD)) best=b;
  return best;
};

/* ---------- NEUROÉVOLUTION ---------- */
TRAIN.makeBot=function(weights){
  const brain=weights?new MLP(new Float32Array(weights)):MLP.random();
  const mesh=mkPolice(TRAIN.bots.length%3);
  return {
    brain, mesh,
    alive:true, totD:0, v:24, lat:0, latT:0, phi:0, steer:0, sHold:0,
    nitroR:1.2, nT:0, boostT:0, padB:0, padCd:0, slipT:0, oilCd:0,
    air:false, fT:0, fTR:0,
    fPos:new THREE.Vector3(), fVel:new THREE.Vector3(),
    think:0, nitroWant:0, jumpWant:0, jumpCD:0,
    fitness:0, landings:0, goodCuts:0, cutGain:0,
    cornerV:1e9, momT:0, pbi:-1, flyStartTotD:0
  };
};

TRAIN.tournament=function(sorted){
  let best=null;
  for(let i=0;i<3;i++){
    const idx=Math.floor(Math.random()*Math.max(1,Math.floor(sorted.length*.5)));
    const cand=sorted[idx];
    if(!best || cand.fitness>best.fitness) best=cand;
  }
  return best;
};

TRAIN.newGen=function(first){
  if(!first){
    const sorted=TRAIN.bots.slice().sort((a,b)=>b.fitness-a.fitness);
    const newBots=[];
    for(let i=0;i<4;i++) newBots.push(TRAIN.makeBot(sorted[i].brain.w));
    while(newBots.length<TRAIN.POP){
      const p1=TRAIN.tournament(sorted), p2=TRAIN.tournament(sorted);
      const child=MLP.crossover(p1.brain,p2.brain);
      child.mutate(0.12,0.18);
      newBots.push(TRAIN.makeBot(child.w));
    }
    // Nettoyage anciens meshes
    for(const b of TRAIN.bots) if(b.mesh && b.mesh.g) scene.remove(b.mesh.g);
    TRAIN.bots=newBots;
  }else{
    TRAIN.bots=[];
    for(let i=0;i<TRAIN.POP;i++) TRAIN.bots.push(TRAIN.makeBot(null));
  }
  TRAIN.GEN++;
  TRAIN.genSinceTrack++;
  if(TRAIN.genSinceTrack>=5 || first){
    TRAIN.seed=Math.floor(Math.random()*1e9);
    buildTrack(TRAIN.seed);
    TRAIN.genSinceTrack=0;
  }
  SURV.pBase=0;
  for(let i=0;i<TRAIN.bots.length;i++){
    const b=TRAIN.bots[i];
    b.alive=true;
    b.totD=(Math.random()*2-1)*20;
    b.v=24;
    b.lat=(Math.random()*2-1)*(ROAD_HALF-4);
    b.latT=0; b.phi=0; b.steer=0; b.sHold=0;
    b.air=false; b.fT=0; b.fTR=0;
    b.nitroR=1.2; b.nT=0; b.boostT=0;
    b.padB=0; b.padCd=0; b.slipT=0; b.oilCd=0;
    b.think=0; b.nitroWant=0; b.jumpWant=0; b.jumpCD=0;
    b.fitness=0; b.landings=0; b.goodCuts=0; b.cutGain=0;
    b.cornerV=1e9; b.momT=0; b.pbi=-1; b.flyStartTotD=0;
    b.mesh.g.visible=true;
  }
  TRAIN.genTime=0;
};

TRAIN.endGen=function(){
  for(const b of TRAIN.bots) if(b.alive){
    b.fitness=b.totD + 150*b.goodCuts;
    if(b.fitness>TRAIN.record) TRAIN.record=b.fitness;
  }
  let best=0,alive=0;
  for(const b of TRAIN.bots){ if(b.fitness>best) best=b.fitness; if(b.alive) alive++; }
  console.log('TRAIN gen',TRAIN.GEN,'best',Math.round(best),'alive',alive,'record',Math.round(TRAIN.record));
  TRAIN.newGen(false);
};

TRAIN.kill=function(b,why){
  b.alive=false;
  b.mesh.g.visible=false;
  b.fitness=b.totD + 150*b.goodCuts;
  if(b.fitness>TRAIN.record) TRAIN.record=b.fitness;
};

/* ---------- HUD + CONTRÔLES ---------- */
TRAIN.makeHud=function(){
  const d=document.createElement('div');
  d.id='trainHud';
  d.style.cssText='position:fixed;top:10px;left:10px;z-index:100;color:#fff;font-family:var(--pix);font-size:11px;text-shadow:1px 1px 0 #000;pointer-events:none;line-height:1.6;';
  d.innerHTML='<div>GÉN <span id="thGen">0</span></div>'+
    '<div>best <span id="thBest">0</span> m</div>'+
    '<div>vivants <span id="thAlive">0</span>/'+TRAIN.POP+'</div>'+
    '<div>record <span id="thRec">0</span> m</div>'+
    '<div id="thSpeed" style="color:#7dff9a;cursor:pointer;pointer-events:auto;display:inline-block;margin-top:4px;">×1</div>';
  document.body.appendChild(d);
  TRAIN.hudEl=d;
  const sp=$('thSpeed');
  if(sp) sp.addEventListener('click',TRAIN.toggleSpeed);
};

TRAIN.hudTick=function(){
  if(!TRAIN.hudEl) return;
  $('thGen').textContent=TRAIN.GEN;
  let best=0,alive=0;
  for(const b of TRAIN.bots){ if(b.alive) alive++; if(b.fitness>best) best=b.fitness; }
  $('thBest').textContent=Math.round(best);
  $('thAlive').textContent=alive;
  $('thRec').textContent=Math.round(TRAIN.record);
};

TRAIN.toggleSpeed=function(){
  if(TRAIN.simSpeed===1) TRAIN.simSpeed=2;
  else if(TRAIN.simSpeed===2) TRAIN.simSpeed=4;
  else TRAIN.simSpeed=1;
  const sp=$('thSpeed'); if(sp) sp.textContent='×'+TRAIN.simSpeed;
};

TRAIN.key=function(e){
  if(e.code==='Space'){ e.preventDefault(); TRAIN.toggleSpeed(); }
  if(e.code==='KeyC'){
    for(let i=1;i<=TRAIN.bots.length;i++){
      const idx=(TRAIN.camBot+i)%TRAIN.bots.length;
      if(TRAIN.bots[idx].alive){ TRAIN.camBot=idx; break; }
    }
  }
};

/* ---------- DÉMARRAGE DU MODE TRAIN ---------- */
TRAIN.init();
})();
}
