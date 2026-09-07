/* ---------------------------------------------------------------------------
 *  BANC D'ESSAI SURVIVANT — le monde factice
 *  ---------------------------------------------------------------------
 *  Fournit à survivant.js EXACTEMENT les globales qu'il attend (cf. le CONTRAT
 *  en tête de survivant.js), sans three.js, sans DOM, sans rendu.
 *
 *  ⚠ CE QUI EST FIDÈLE (recopié à l'identique depuis index.html) :
 *      frameAt(), holeAtS(), holeAtI(), ROAD_HALF, THICK, SPD, GRAV, TURN_HS,
 *      FALL_G, AIR_MAX, la structure de HOLES/RAMPS/CONES/OILS/PADS,
 *      la construction du repère de piste (T/Nn/B par transport parallèle).
 *
 *  ⚠ CE QUI EST APPROCHÉ — et donc la source n°1 de divergence banc/jeu :
 *      1. LA PISTE. genCtrl() tire 13 motifs (loops, hélices, tire-bouchons…) ;
 *         ici on génère droites + arcs + dénivelé. La courbure est du bon ordre
 *         de grandeur, mais la piste du banc est PLUS SAGE que la vraie.
 *      2. LE JOUEUR. Remplacé par une politique scriptée (BenchPlayer).
 *         Or le joueur pilote les jumpZones, le classement et le couperet :
 *         c'est LUI qui décide de ce que la meute voit. À calibrer avant de
 *         se fier aux chiffres absolus.
 *   Les COMPARAISONS avant/après sur le même banc restent valides même si les
 *   absolus divergent du jeu : c'est l'usage prévu.
 * ------------------------------------------------------------------------- */
'use strict';

// ---------- constantes recopiées d'index.html ----------
const ROAD_HALF=14, THICK=2.6;                 // 1155
const SPD=0.5;                                 // 7829
const GRAV=9.8*.55, FALL_G=33, AIR_MAX=6;      // 7823
const TURN_HS=.0035;                           // 7830

// ---------- état de piste (mêmes noms qu'index.html, 1156) ----------
let pts=[],T=[],Nn=[],B=[],L=0,NP=0,trackMinY=-1e9;
let PADS=[],BUMPS=[],CONES=[],FLYCONES=[],OILS=[],RAMPS=[],HOLES=[];

// 1170 / 1174 — verbatim
const holeAtS=sv=>{if(!HOLES.length)return null;for(const h of HOLES)if(sv>h.s0&&sv<h.s1)return h;return null;};
const holeAtI=i=>{if(!HOLES.length)return false;for(const h of HOLES)if(i>h.i0&&i<h.i1)return true;return false;};

// 2267 — verbatim
function frameAt(s,out){
  s=THREE.MathUtils.clamp(s,0,L-.01);
  const f=s/L*(NP-1),i=Math.floor(f),j=Math.min(i+1,NP-1),u=f-i;
  out.p.lerpVectors(pts[i],pts[j],u);
  out.t.lerpVectors(T[i],T[j],u).normalize();
  out.n.lerpVectors(Nn[i],Nn[j],u);
  out.n.addScaledVector(out.t,-out.n.dot(out.t)).normalize();
  out.b.crossVectors(out.n,out.t);
}
const F={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};

// mulberry32 — le même PRNG que le jeu, pour des pistes reproductibles
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

// ---------- génération de piste ----------
// ⚠ CALIBRÉ SUR LE VRAI JEU (2026-08-18). 14 pistes réelles relevées dans probe.html
// (index.html + three.js local, sondes __track/__stats, aucune modif d'index.html) :
//     L≈9194 · NP≈8828 · κ méd 6,10e-3 rad/m · κ p90 1,55e-2
//     |T.y| méd 0,441 · p90 0,724 · max ~0,99   ← la piste est un GRAND HUIT VERTICAL
//     trous 0,36/piste (9 pistes sur 14 n'en ont AUCUN) · largeur ~93 quand il y en a un
//     pads 21,1 · huiles 0,3 · plots 98
//
// ⚠ LEÇON DE LA MESURE (2026-08-18) — je me suis trompé DEUX FOIS sur le relief :
//   v1 : pentes jusqu'à 0,5 → j'ai vu 5,7 morts/7 en 60 s et j'ai accusé le relief.
//   v2 : j'ai « corrigé » à 0,12… alors que la VRAIE piste est à 0,44 de médiane.
//   La mesure a tranché contre mes deux intuitions : le relief réel est BIEN PLUS raide
//   que ma v1 déjà jugée excessive. Le taux de mort élevé n'était donc pas un artefact
//   de relief — il reste à expliquer. Ne pas re-« corriger » ce générateur à l'intuition.
function buildBenchTrack(seed){
  const rnd=mulberry32(seed);
  PADS=[];BUMPS=[];CONES=[];FLYCONES=[];OILS=[];RAMPS=[];HOLES=[];
  // squelette 3D : cap (az) + assiette (pitch) évoluant par segments, pas d'unité ≈ 1,04
  const TARGET_L=8500+rnd()*2050, STEP=1.04;
  const raw=[];const P=new THREE.Vector3(0,0,0);raw.push(P.clone());
  let az=0,pit=0,dAz=0,dPit=0,segLeft=0;
  let dist=0;
  while(dist<TARGET_L){
    if(segLeft<=0){ // nouveau motif
      segLeft=60+rnd()*260;
      const r=rnd();
      // courbure horizontale : médiane ~6e-3, queue à ~2e-2 (rayons 165 m → 50 m)
      dAz=(rnd()<.5?-1:1)*(r<.55?(2+rnd()*6)*1e-3:(8+rnd()*14)*1e-3);
      if(rnd()<.18)dAz=0;                       // vraie ligne droite
      // assiette : la piste MONTE et PLONGE en permanence (|T.y| méd 0,44)
      const tgt=(rnd()<.5?-1:1)*(.22+rnd()*.74); // pitch visé, jusqu'à ~1 rad (0,84 de sinus)
      dPit=(tgt-pit)/segLeft;
    }
    az+=dAz*STEP; pit+=dPit*STEP; segLeft-=STEP; dist+=STEP;
    if(pit> 1.25)pit= 1.25; if(pit<-1.25)pit=-1.25;
    const cp=Math.cos(pit);
    P.x+=Math.sin(az)*cp*STEP; P.y+=Math.sin(pit)*STEP; P.z+=Math.cos(az)*cp*STEP;
    raw.push(P.clone());
  }
  pts=raw;NP=pts.length;
  L=0;for(let i=1;i<NP;i++)L+=pts[i].distanceTo(pts[i-1]);
  trackMinY=Infinity;for(let i=0;i<NP;i++)if(pts[i].y<trackMinY)trackMinY=pts[i].y;
  T=[];Nn=[];B=[];
  for(let i=0;i<NP;i++){const j=Math.min(i+1,NP-1),k=Math.max(i-1,0);
    T.push(new THREE.Vector3().subVectors(pts[j],pts[k]).normalize());}
  let n=new THREE.Vector3(0,1,0);
  n.addScaledVector(T[0],-n.dot(T[0])).normalize();
  for(let i=0;i<NP;i++){
    Nn.push(n.clone());
    B.push(new THREE.Vector3().crossVectors(n,T[i]));
    if(i<NP-1){ n=n.clone(); n.addScaledVector(T[i+1],-n.dot(T[i+1]));
      if(n.lengthSq()<1e-9){n.set(0,1,0);n.addScaledVector(T[i+1],-T[i+1].y);}
      n.normalize(); }
  }
  // LES TROUS : 0,36 par piste en moyenne, largeur ~93 (mesuré)
  if(rnd()<.36){
    const s0=900+rnd()*(L-2600), w=88+rnd()*12;
    const i0=Math.round(s0/L*(NP-1)),i1=Math.round((s0+w)/L*(NP-1));
    if(i0>14&&i1<NP-16)HOLES.push({i0,i1,lip:i0,v:rnd()<.3?1:0,s0:i0/(NP-1)*L,s1:i1/(NP-1)*L});
  }
  for(const h of HOLES){ // 2071-2074
    const sL=h.lip/(NP-1)*L;
    RAMPS.push({s:sL,v:h.v,s0:Math.max(0,sL-340),s1:Math.min(L,h.s1+300)});
    if(sL-95>40)PADS.push(sL-95);
  }
  const inGap=sp=>{for(const r of RAMPS)if(sp>r.s0&&sp<r.s1)return true;return false;};
  for(let sp=180+rnd()*150;sp<L-100;sp+=280+rnd()*280){if(inGap(sp))continue;PADS.push(sp);} // ~21 pads
  if(rnd()<.15){ // huiles : quasi absentes du vrai jeu (0,3/piste)
    const sp=600+rnd()*(L-1200),r9=2+rnd()*1.1,lo=(rnd()*2-1)*(ROAD_HALF-4.5);
    for(const of9 of [1,-1])OILS.push({s:sp,lat:lo,r:r9,face:of9});
  }
  // plots : ~98 au total, par groupes de 3 sur les deux faces
  for(let sp=300+rnd()*300;sp<L-140;sp+=335+rnd()*410){
    if(inGap(sp))continue;
    const w9=3+rnd()*5;
    for(const f9 of [1,-1])for(let k=0;k<3;k++)
      CONES.push({s:sp+k*13,lat:(k%2?-1:1)*w9,mesh:{position:new THREE.Vector3(),userData:{}},hit:false,face:f9});
  }
}

// ---------- caisses / moteur (mêmes champs que CARS[0] et ENGINE_TIERS) ----------
const CARS=[{name:'LA HONTE',maxKmh:230,accel:9.5,turn:1.0,l:4.2,w:1.9,h:1.2}];
const ENGINE_TIERS=[{push:1.0,res:2},{push:1.12,res:2.2},{push:1.25,res:2.5}];
let engTier=0, level=0;
const lateMul=()=>1;
const vmaxShow=()=>CARS[0].maxKmh*lateMul()*(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).push;

// ---------- état joueur ----------
let mode='drive', s=0, lat=0, vA=26, psi=0, side=1, driveDir=1;
let gameOver=false, started=true, running=true, paused=false, nitroOn=false, nitroBlue=false;
let shake=0, duckT=0, slowT=0, boost=0, money=0, levelCash=0;
let runStats={tricks:0,bumps:0,zones:0,vmax:0,chainMax:0,gaps:0,surv:0};
const carGroup=new THREE.Object3D();
const PARK={on:false};

// ---------- sons, effets, HUD : tous inertes ----------
const AC=null, MASTER=null, SND={sfx:true,music:false};
const scene={add(){},remove(){}};
const camera=new THREE.Object3D();
const sparkGold={},sparkBlue={},smokePool={},flameCore={},dust={},flames={},embers={};
function sparkBurst(){} function spawnP(){} function subBoom(){} function thud(){}
function trickMsg(){} function chimeNote(){} function showMsg(){} function fanfare(){}
function addStyle(){} function landBoom(){} function whoosh(){} function noiseBurst(){}
function boostSnd(){} function portalSnd(){} function dieSnd(){} function annSpeak(){return '';}
function explode(){gameOver=true;mode='boom';}
function mkTrail(){return {init:false,m:{visible:false},k:0};}
function trailStep(tr){if(tr)tr.init=true;}
function rebuildMenuScene(){}
const lampTex={},jetTex={},poolTex={},beamTex={},jetGeo={};

// DOM minimal : tout élément répond `style`, `innerHTML`, `textContent`, `getContext`
const _grad={addColorStop(){return this;}};
const _ctx2d=new Proxy({},{get:(t,k)=>{ if(k==='canvas')return {width:20,height:20};
  return typeof k==='string'?(()=>_grad):undefined; },set:()=>true});
function _el(){return new Proxy({style:{},classList:{add(){},remove(){}},
  getContext:()=>_ctx2d,addEventListener(){},appendChild(){}},
  {get:(t,k)=>k in t?t[k]:(k==='innerHTML'||k==='textContent'?'':undefined),
   set:(t,k,v)=>{t[k]=v;return true;}});}
const _els={};
function $(id){return _els[id]||(_els[id]=_el());}
const flashEl=_el(), parkBtnEl=_el(); // survBtnEl/survHudEl/lastAlertEl sont déclarés par survivant.js
const document={createElement:()=>({width:0,height:0,getContext:()=>_ctx2d})};

// ---------- sauvegarde en mémoire ----------
const SAVE={d:{ai:null,ex:{},best:0},flush(){},export(){return '';},import(){return false;}};

// =====================================================================
//  LE JOUEUR SCRIPTÉ
//  ---------------------------------------------------------------
//  ⚠ C'EST L'APPROXIMATION LA PLUS LOURDE DU BANC. Le joueur pilote les
//  jumpZones, le classement et le couperet — donc tout ce que la meute voit.
//  Politique : conduite type-bot (mêmes équations), + décollage sur trou et
//  sur tremplin, + vol BALISTIQUE au modèle JOUEUR (FALL_G, ×SPD, AIR_RATE).
//  `skill` ∈ [0,1] règle la marge en virage, l'appétit de saut et la nitro.
// =====================================================================
const BenchPlayer={
  skill:.8, jumpApp:.6, rnd:Math.random,
  fallT:0, fallVy:0, fallVx:0, AIR_RATE:1, rampCd:0, think:0, cornerV:1e9, latT:0, steer:0, sHold:0, phi:0,
  reset(rnd){this.rnd=rnd;mode='drive';s=0;lat=0;vA=26;this.phi=0;this.steer=0;this.sHold=0;
    this.fallT=0;this.rampCd=0;this.think=0;this.cornerV=1e9;this.latT=0;},

  step(dt){
    const spec=CARS[0],late=lateMul(),push=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).push,
          maxSp=spec.maxKmh/3.6*late*push,acc=spec.accel*late*(1+(push-1)*.6),tc=spec.turn*.75,
          segL=L/(NP-1);
    if(mode==='fall'){ // vol balistique, modèle JOUEUR (9660-9768 simplifié au plan vertical)
      const dtF=dt*this.AIR_RATE;
      this.fallT+=dtF;
      this.fallVy-=FALL_G*dtF;
      s+=this.fallVx*dtF*SPD;
      if(this.fallVy<0&&this.fallT>.15){
        // retombée : on se pose si on n'est pas au-dessus du vide
        const h=holeAtS(s);
        if(!h&&this.fallT*this.fallVy<0){ /* continue */ }
        if(!h){mode='drive';vA=this.fallVx;this.fallT=0;}
        else if(s>L-40){mode='drive';vA=this.fallVx;this.fallT=0;}
      }
      if(this.fallT>AIR_MAX){mode='drive';vA=this.fallVx;this.fallT=0;} // jauge d'airtime
      return;
    }
    const bi=Math.floor(THREE.MathUtils.clamp(s/L,0,1)*(NP-1));
    this.think-=dt;
    if(this.think<=0){
      this.think=.12;
      const dBrk=(vA*vA*SPD)/(2*acc*1.5)+vA*SPD*.12;
      const look=THREE.MathUtils.clamp(dBrk*1.4+16,24,230);
      let vSafe=1e9,crv=0;const tv=new THREE.Vector3();
      for(let k=1;k<=3;k++){
        const d9=look*k/3,j9=Math.min(NP-1,bi+Math.max(1,Math.round(d9/segL)));
        const kap=Math.acos(THREE.MathUtils.clamp(T[bi].dot(T[j9]),-1,1))/Math.max(1,d9);
        if(kap>1e-4){const kS=kap*SPD,vs=(-kS+Math.sqrt(kS*kS+4*kS*TURN_HS*tc))/(2*kS*TURN_HS);
          if(vs<vSafe){vSafe=vs;tv.crossVectors(T[bi],T[j9]);crv=Math.sign(tv.dot(Nn[bi]))*kap;}}
      }
      this.cornerV=vSafe*(.74+this.skill*.22);
      this.latT=Math.abs(crv)>.004?Math.sign(crv)*(ROAD_HALF-3.4)*(.5+this.skill*.45):0;
    }
    const brk=vA>this.cornerV*1.05, lift=vA>this.cornerV*.96;
    let a=0;
    if(brk)a=vA>2?-acc*1.5:-acc*.5; else if(!lift)a=acc*(vA<maxSp?1:.55);
    vA+=a*dt;
    vA+=-GRAV*T[bi].y*Math.cos(this.phi)*dt;
    vA-=vA*Math.abs(vA)*(acc/(maxSp*maxSp*5.8))*dt;
    vA*=Math.max(0,1-.03*dt);
    if(!brk&&lift)vA*=Math.max(0,1-.4*dt);
    if(vA<0)vA=0;
    const dL=this.latT-lat;
    const phiT=THREE.MathUtils.clamp(dL/(Math.max(6,vA*SPD)*.9),-.62,.62);
    const st=THREE.MathUtils.clamp((phiT-this.phi)*4,-1,1);
    this.steer+=(st-this.steer)*Math.min(1,dt*18);
    if(Math.abs(this.steer)>.1)this.sHold=Math.min(.3,this.sHold+dt);else this.sHold=0;
    this.phi+=this.steer*(.55+.45*(this.sHold/.3))*tc*THREE.MathUtils.clamp(vA/8,-1,1)*(1/(1+Math.abs(vA)*TURN_HS))*dt;
    this.phi=THREE.MathUtils.clamp(this.phi,-1.4,1.4);
    lat+=vA*Math.sin(this.phi)*dt*SPD;
    const sPrev=s;
    s+=vA*Math.cos(this.phi)*dt*SPD;
    if(Math.abs(lat)>ROAD_HALF)lat=Math.sign(lat)*ROAD_HALF; // le banc ne fait pas mourir le joueur au bord
    // pads
    for(const p of PADS)if(Math.abs(s-p)<6){vA+=14;break;}
    // CATAPULTE (9394-9412) : le joueur saute les tremplins s'il va assez vite
    this.rampCd=Math.max(0,this.rampCd-dt);
    if(this.rampCd<=0)for(const r of RAMPS){
      const sA=Math.min(sPrev,s)-7,sB=Math.max(sPrev,s)+7;
      if(r.s<sA||r.s>sB)continue;
      if(Math.abs(vA)*3.6*SPD<110)break;
      if(this.rnd()>this.jumpApp)break;             // il ne les prend pas toujours
      this.rampCd=1.4;this.takeoff(6.6+(r.v===1?1.4:0),1.14);
      break;
    }
    // LE VIDE SOUS LES ROUES (9416)
    if(mode==='drive'&&holeAtS(s))this.takeoff(1.1,1);
  },

  takeoff(impU,impF){ // startFall (8159-8199) réduit au plan (vy, vx)
    mode='fall';this.fallT=0;
    this.AIR_RATE=THREE.MathUtils.clamp(1+Math.max(0,Math.abs(vA)*3.6*SPD-450)/1800,1,1.35);
    this.fallVx=vA*(impF||1);
    this.fallVy=Math.min(70,impU||.9);
  }
};

if(typeof module!=='undefined')module.exports={buildBenchTrack,BenchPlayer};
