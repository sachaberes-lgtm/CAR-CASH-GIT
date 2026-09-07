/* =============================================================================
 *  CAR CRASH — MODE SURVIVANT  ·  module autonome
 *  -----------------------------------------------------------------------
 *  Extrait de index.html (lignes 8483-8981 et 8984-8989 de la révision
 *  md5 936d3675e86b47cce1e8869870fa7982, 10 806 lignes).
 *
 *  ⚠ EXTRACTION VERBATIM (2026-08-18) : le corps du mode est recopié À
 *  L'IDENTIQUE. Les seules lignes ajoutées sont l'instrumentation de mesure,
 *  toutes marquées `/*M*\/` en début de ligne. Elles ne LISENT que l'état et
 *  n'écrivent QUE dans SURV_M : retirer toutes les lignes `/*M*\/` rend ce
 *  fichier rigoureusement identique au bloc d'origine.
 *
 *  CHARGEMENT : script CLASSIQUE, après le script principal du jeu.
 *      <script src="survivant.js"></script>
 *  PAS un module ES : `type="module"` casserait l'ouverture en file://
 *  (CORS), et le jeu doit rester ouvrable d'un double-clic.
 *  Les `const`/`let` de haut niveau sont partagés entre scripts classiques :
 *  ce fichier voit donc SPD, mode, pts[], frameAt, etc. sans rien exporter.
 *
 *  ---------------------------------------------------------------------
 *  CONTRAT — ce que le module ATTEND du jeu (lecture seule sauf mention)
 *  ---------------------------------------------------------------------
 *  three.js  : THREE
 *  scène     : scene, camera, carGroup
 *  piste     : L, NP, pts[], T[], Nn[], B[], ROAD_HALF, frameAt(s,out),
 *              holeAtS(s), CONES[], OILS[], PADS[], FLYCONES[]
 *  physique  : SPD, GRAV, TURN_HS, CARS[], ENGINE_TIERS[], engTier, lateMul()
 *  joueur    : mode, s, lat, vA, gameOver, started, vmaxShow(), nitroOn
 *  effets    : sparkBurst, sparkGold, sparkBlue, spawnP, smokePool, flameCore,
 *              subBoom, thud, shake (ÉCRIT), trickMsg, chimeNote, showMsg,
 *              fanfare, addStyle, explode, flashEl, duckT (ÉCRIT),
 *              mkTrail(), trailStep(), landBoom
 *  textures  : lampTex, jetTex, jetGeo, poolTex, beamTex
 *  audio     : AC, MASTER, SND
 *  divers    : SAVE, $, runStats (ÉCRIT .surv), PARK, parkBtnEl,
 *              rebuildMenuScene()
 *
 *  ---------------------------------------------------------------------
 *  CONTRAT — ce que le module EXPOSE au jeu (les points d'accroche)
 *  ---------------------------------------------------------------------
 *  SURV, SURV_PILOTS, AIP, survStart(), survTick(dt), survRender(),
 *  botBoom(b), gyroLights[], botJetLight, botTrails[], sirG
 *  + window.dbgSurv()  — bilan de mesure (voir bas de fichier)
 *
 *  ---------------------------------------------------------------------
 *  SURFACE DE FUSION — les 11 endroits d'index.html qui appellent le module
 *  ---------------------------------------------------------------------
 *   2576  libellé i18n du bouton         SURV.armed
 *   6513  dbgAudio()                     sirG
 *   6515  dbgAudio()                     SURV.on
 *   7971  minimap                        SURV.bots, SURV.pBase, SURV.ph
 *   8389  resetGame()                    AIP.resetRun()
 *   8390  resetGame()                    survStart()
 *   8417  endGame()                      lastAlertEl, gyroLights
 *   8418  endGame()                      botJetLight, botTrails
 *   8419  endGame()                      sirG
 *   8420  endGame()                      SURV.on → survRender()
 *   8430  endGame()                      AIP.commit()
 *   8463  start()                        survStart()
 *   8994  bouton PARC                    SURV.armed, survBtnEl
 *   9377  portail                        SURV.pBase += s
 *  10039  éclairage caisse               SURV.last
 *  10340  loop()                         survTick(dt)
 *  10341  loop()                         AIP.tick(dt)
 *  DOM    #survHud · #survBtn · #lastAlert
 *
 *  ⚠ `rebuildMenuScene()` (8982-8983) est RESTÉ dans index.html : il est
 *  appelé aussi par le bouton PARC (8995), ce n'est pas du code SURVIVANT.
 * ============================================================================= */

/* ===========================================================================
 *  HARNAIS DE MESURE — PHASE 1  (2026-08-18)
 *  ---------------------------------------------------------------------
 *  ⚠ RÈGLE : ce harnais ne CHANGE RIEN au gameplay. Il ne fait que LIRE
 *  l'état de la meute et écrire dans SURV_M. Aucune ligne d'instrumentation
 *  n'assigne une variable de jeu. Toutes sont préfixées `/*M*\/` dans le
 *  corps du module : les supprimer restaure le bloc d'origine à l'octet près.
 *
 *  Ce qu'on mesure, et POURQUOI (cf. classement des leviers) :
 *   · décollages par cause (bord / trou / zone) → levier 2 et 3 : aujourd'hui
 *     le bot ne décolle que par accident ou par imitation, jamais par choix.
 *   · taux d'atterrissage réussi                → levier 1 : ce que le rollout
 *     doit faire monter.
 *   · cause de mort                             → où la meute se saborde.
 *   · distance en vol vs au sol                 → le vol rapporte-t-il un mètre ?
 *   · écart médian/final au joueur              → la mesure qui juge TOUT.
 *   · zones enregistrées, seconde de la première, et COMBIEN sont consommées
 *                                               → l'hypothèse « quasi jamais »
 *                                                  du rapport de phase 0.
 * =========================================================================== */
const SURV_M={
  on:true,            // false = harnais muet (coût nul hors mesure)
  run:null,
  runs:[],            // historique des runs de la session
  _cause:null,        // cause de mort en attente, posée juste avant botBoom()
  _sampleCd:0,
  SAMPLE_HZ:2,        // échantillonnage des écarts (hors boucle chaude)

  reset(bots){
    this.run={
      t0:0,t:0,
      zones:0,zoneFirstT:-1,zoneUsed:0,zoneOffered:0,
      curve:{},           // {seconde arrondie à 10 : nb de bots vivants} — courbe de survie

      couperet:0,           // nb d'éliminations par le couperet des 60 s
      playerD:0,
      bots:bots.map(b=>({
        name:b.name,agro:+b.agro.toFixed(2),appJump:+b.appJump.toFixed(2),
        toEdge:0,toHole:0,toZone:0,      // décollages par cause
        landOk:0,landDead:0,             // verdicts d'atterrissage
        death:null,deathT:-1,
        dAir:0,dGround:0,
        gaps:[],gapFinal:0,
        airT:0,flights:0
      }))
    };
    for(let i=0;i<bots.length;i++){
      bots[i]._m=this.run.bots[i];
      bots[i]._mDA=0;bots[i]._mDG=0;bots[i]._mAirT=0;
    }
    this._cause=null;this._sampleCd=0;
  },

  takeoff(b,cause){
    if(!this.on||!b._m)return;
    if(cause==='edge')b._m.toEdge++;else if(cause==='hole')b._m.toHole++;else b._m.toZone++;
    b._m.flights++;
  },
  zoneOffered(){ if(this.on&&this.run)this.run.zoneOffered++; },
  zoneUsed(){ if(this.on&&this.run)this.run.zoneUsed++; },
  land(b,ok){ if(!this.on||!b._m)return; if(ok)b._m.landOk++;else b._m.landDead++; },
  death(b,cause,t){ if(!this.on||!b._m)return; b._m.death=cause;b._m.deathT=+t.toFixed(2); },
  zone(t){ if(!this.on||!this.run)return; this.run.zones++; if(this.run.zoneFirstT<0)this.run.zoneFirstT=+t.toFixed(2); },
  couperet(){ if(this.on&&this.run)this.run.couperet++; },

  // échantillonnage des écarts — 2 Hz, jamais dans la boucle chaude
  sample(dt,bots,pTot,t){
    if(!this.on||!this.run)return;
    this.run.t=t;this.run.playerD=pTot;
    this._sampleCd-=dt;
    if(this._sampleCd>0)return;
    this._sampleCd=1/this.SAMPLE_HZ;
    {const bucket=Math.round(t/10)*10;                       // courbe de survie, pas de 10 s
     if(this.run.curve[bucket]==null)this.run.curve[bucket]=bots.filter(b=>b.alive).length;}
    for(const b of bots){
      if(!b._m||!b.alive)continue;   // un bot mort fige son écart : sinon il « recule » avec le joueur
      const g=b.totD-pTot;
      b._m.gapFinal=Math.round(g);
      b._m.gaps.push(Math.round(g));
      b._m.dAir=Math.round(b._mDA);b._m.dGround=Math.round(b._mDG);
      b._m.airT=+b._mAirT.toFixed(2);
    }
  },

  finish(){
    if(!this.run)return null;
    const med=a=>{if(!a.length)return 0;const s=a.slice().sort((x,y)=>x-y);const h=s.length>>1;
      return s.length%2?s[h]:Math.round((s[h-1]+s[h])/2);};
    const r=this.run;
    r.summary=r.bots.map(b=>({
      nom:b.name,
      decol:b.toEdge+b.toHole+b.toZone,
      bord:b.toEdge,trou:b.toHole,zone:b.toZone,
      poses:b.landOk,morts:b.landDead,
      tauxPose:(b.landOk+b.landDead)?+(b.landOk/(b.landOk+b.landDead)).toFixed(3):null,
      mort:b.death||'—',tMort:b.deathT<0?null:b.deathT,
      dVol:b.dAir,dSol:b.dGround,
      partVol:(b.dAir+b.dGround)?+(b.dAir/(b.dAir+b.dGround)).toFixed(4):0,
      ecartMed:med(b.gaps),ecartFinal:b.gapFinal
    }));
    r.totaux={
      duree:+r.t.toFixed(1),
      zones:r.zones,zonePremiereT:r.zoneFirstT,
      zoneProposees:r.zoneOffered,zoneConsommees:r.zoneUsed,
      couperet:r.couperet,
      decolTotal:r.summary.reduce((a,b)=>a+b.decol,0),
      bordTotal:r.summary.reduce((a,b)=>a+b.bord,0),
      trouTotal:r.summary.reduce((a,b)=>a+b.trou,0),
      zoneTotal:r.summary.reduce((a,b)=>a+b.zone,0),
      mortsTotal:r.summary.filter(b=>b.mort!=='—').length,
      partVolMoy:+(r.summary.reduce((a,b)=>a+b.partVol,0)/Math.max(1,r.summary.length)).toFixed(4),
      survie:r.curve
    };
    this.runs.push(r);
    return r;
  },

  dump(){
    const r=this.finish();
    if(!r)return;
    console.log('%c=== BILAN SURVIVANT ===','font-weight:bold');
    console.table(r.summary);
    console.log(r.totaux);
  }
};
if(typeof window!=='undefined'){
  window.dbgSurv=function(){ // console : dbgSurv() → bilan JSON de la run en cours
    const snap=JSON.parse(JSON.stringify(SURV_M.run||{}));
    const keep=SURV_M.runs.length;
    const r=SURV_M.finish();SURV_M.runs.length=keep; // finish() est non destructif ici
    return r?{totaux:r.totaux,bots:r.summary}:snap;
  };
  window.dbgSurvRuns=function(){return SURV_M.runs.map(r=>r.totaux);};
}

// ---------- MODE SURVIVANT v2 : 7 VRAIES voitures de police sur la piste — la POURSUITE ----------
// Chaque IA est incarnée : elle roule, dépasse, défend, se rate, revient. Le classement = la DISTANCE
// parcourue (SURV.pBase+s pour le joueur : les écarts survivent aux portails, téléportation invisible).
// Couperet toutes les 60 s : le DERNIER explose. LOD partout : sim 1D permanente, mesh+gyros seulement
// à portée de vue, 2 vraies lumières (pool) pour les plus proches, sirène unique dosée à la distance.
const SURV={armed:false,on:false,t:0,over:false,_r:0,pBase:0,ph:0,last:false};
SURV.bots=[];
// personnalités : plus PERSONNE n'a de bonus de vitesse — tout le monde a TA caisse et TES lois.
// La différence se joue au CERVEAU : agro = dépasse/bloque · err = fréquence des fautes ·
// rea = délai de réaction (s, comme un humain) · line = propreté de trajectoire et des points de corde
const SURV_PILOTS=[
 {n:'RICO',agro:.92,err:.20,rea:.13,line:.60}, // le chien fou : réflexes de chat, trajectoires de poivrot
 {n:'JADE',agro:.30,err:.03,rea:.16,line:.97}, // la métronome : propre, implacable — la référence à battre
 {n:'MOMO',agro:.62,err:.11,rea:.14,line:.78}, // l'opportuniste : surgit sur les erreurs
 {n:'ZAZA',agro:.80,err:.28,rea:.10,line:.86}, // la fusée fautive : réagit au quart de tour, se rate en grand
 {n:'LULU',agro:.42,err:.07,rea:.26,line:.82}, // la prudente : longue à la détente, mais sûre
 {n:'KIKI',agro:.72,err:.14,rea:.17,line:.72}, // la teigneuse : défend chaque mètre
 {n:'BOB', agro:.52,err:.10,rea:.21,line:.76}, // le régulier : jamais brillant, jamais loin
];
// ---------- APPRENTISSAGE : les IA t'observent et adoptent ton style (façon Drivatar) ----------
// Deux mémoires. (1) Un PROFIL persistant (localStorage via SAVE) qui agrège TA manière de jouer sur
// toutes tes parties — appétit de saut, usage nitro, prudence en virage, niveau, agressivité. Il biaise
// tous les bots au départ : run après run, ils prennent ta patte. (2) Des ZONES DE SAUT enregistrées
// EN DIRECT sur la piste courante : là où TU décolles, un bot qui repasse au même endroit décolle aussi.
const AIP={
  air:.5,boost:.35,caution:.5,skill:.86,aggr:.55,airDur:1.1,runs:0, // profil courant
  _drv:0,_jumps:0,_airT:0,_boost:0,_spd:0,_spdN:0,_lat:0,_latN:0,_committed:false,_pm:'', // accus de la run
  load(){const a=SAVE.d.ai;if(a){this.air=a.air;this.boost=a.boost;this.caution=a.caution;this.skill=a.skill;this.aggr=a.aggr;this.airDur=a.airDur;this.runs=a.runs;}},
  resetRun(){this._drv=0;this._jumps=0;this._airT=0;this._boost=0;this._spd=0;this._spdN=0;this._lat=0;this._latN=0;this._committed=false;this._pm=mode;},
  tick(dt){ // appelé chaque frame de jeu : on t'observe même hors mode Survivant
    if(mode==='drive'){this._drv+=dt;
      const mx=vmaxShow();if(mx>0){this._spd+=(Math.abs(vA)*3.6*SPD)/mx;this._spdN++;} // part de TA vitesse atteignable, pas de la fiche de carrosserie
      this._lat+=Math.abs(lat)/ROAD_HALF;this._latN++;
      if(nitroOn)this._boost+=dt;
    }else if(mode==='fall')this._airT+=dt;
    if(mode==='fall'&&this._pm!=='fall')this._jumps++; // un décollage de plus
    this._pm=mode;
  },
  commit(){ // fin de run : on fond les mesures dans le profil (adoption totale la 1re fois, EMA ensuite)
    if(this._committed||this._drv<3)return;this._committed=true;
    const cl=THREE.MathUtils.clamp;
    const air=cl(this._jumps/Math.max(6,this._drv)*7,0,1);          // ~1 saut / 7 s → plein appétit
    const boost=cl(this._boost/Math.max(6,this._drv)*3,0,1);
    const skill=this._spdN?cl(this._spd/this._spdN,.5,1.08):this.skill;
    const line=this._latN?this._lat/this._latN:.4;
    const caution=cl(1-line,.15,.95);                                // collé au centre = prudent
    const airDur=this._jumps?cl(this._airT/this._jumps,.4,4):this.airDur;
    const aggr=cl(air*.55+line*.55,.15,1);
    const w=this.runs<1?1:.35,mix=(o,n)=>o+(n-o)*w;                   // 1re run : on adopte tout ; ensuite EMA douce
    this.air=mix(this.air,air);this.boost=mix(this.boost,boost);this.skill=mix(this.skill,skill);
    this.caution=mix(this.caution,caution);this.airDur=mix(this.airDur,airDur);this.aggr=mix(this.aggr,aggr);
    this.runs++;
    SAVE.d.ai={air:this.air,boost:this.boost,caution:this.caution,skill:this.skill,aggr:this.aggr,airDur:this.airDur,runs:this.runs};
    SAVE.flush();
  }
};
AIP.load();
// ⚠ EXTRACTION (2026-08-18) : `parkBtnEl` est RESTÉ dans index.html. La ligne d'origine (8540)
// le déclarait ici, mais il est lu par le bouton PARC (8992-8996), qui n'est pas du code SURVIVANT.
// Le laisser ici casserait index.html ; le dupliquer lèverait un « already declared ».
const survHudEl=$('survHud'),survBtnEl=$('survBtn'),lastAlertEl=$('lastAlert');
let svClkCtx=null,svRowsEl=null,svSecsEl=null;
// ---- carrosserie police : géométries/matériaux PARTAGÉS, 3 livrées pour casser les clones ----
const pcGlassM=new THREE.MeshPhongMaterial({color:0x0d1620,shininess:280,specular:0xffffff});
const pcBarM=new THREE.MeshPhongMaterial({color:0x101018,shininess:60,specular:0x444444});
const pcLiv=[ // [carrosserie, capot/accents]
  [new THREE.MeshPhongMaterial({color:0xf2f4f8,shininess:130,specular:0xdde6ff}),new THREE.MeshPhongMaterial({color:0x14161d,shininess:90,specular:0x8899aa})],
  [new THREE.MeshPhongMaterial({color:0x191b22,shininess:110,specular:0x99a6bb}),new THREE.MeshPhongMaterial({color:0xe8ecf2,shininess:120,specular:0xffffff})],
  [new THREE.MeshPhongMaterial({color:0x1c2a4a,shininess:110,specular:0x99aadd}),new THREE.MeshPhongMaterial({color:0xe8ecf2,shininess:120,specular:0xffffff})]];
const gyroRedOn=new THREE.MeshBasicMaterial({color:0xff3030}),gyroRedOff=new THREE.MeshBasicMaterial({color:0x4a0808});
const gyroBluOn=new THREE.MeshBasicMaterial({color:0x3f7dff}),gyroBluOff=new THREE.MeshBasicMaterial({color:0x081a4a});
const pcBodyG=new THREE.BoxGeometry(1.9,.58,4.3),pcCabG=new THREE.BoxGeometry(1.62,.52,2.0),
      pcHoodG=new THREE.BoxGeometry(1.7,.1,1.2),pcBaseG=new THREE.BoxGeometry(1.15,.09,.4),pcLampG=new THREE.BoxGeometry(.42,.17,.34);
const gloCv=document.createElement('canvas');gloCv.width=gloCv.height=64;
(()=>{const gc=gloCv.getContext('2d'),gr=gc.createRadialGradient(32,32,2,32,32,30);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');
  gc.fillStyle=gr;gc.fillRect(0,0,64,64);})();
const gloTex=new THREE.CanvasTexture(gloCv);
const sprRedM=new THREE.SpriteMaterial({map:gloTex,color:0xff3030,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
const sprBluM=new THREE.SpriteMaterial({map:gloTex,color:0x3f7dff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
const sprJetM=new THREE.SpriteMaterial({map:gloTex,color:0xff9a2a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}); // flamme réacteur (partagée)
// ROUES : la meute réutilisait la géométrie/le matériau des épaves — feature épave retirée ailleurs,
// donc la police porte désormais SES propres roues (mêmes valeurs, plus de dépendance fantôme wkWhG/wkWheelM).
const wkWhG=new THREE.CylinderGeometry(.34,.34,.24,10);
const wkWheelM=new THREE.MeshPhongMaterial({color:0x14161c,shininess:8});
// MÊME KIT LUMIÈRE QUE LE JOUEUR : halos de phares/feux + cônes de réacteur (matériaux PARTAGÉS par la meute)
const pcHeadM=new THREE.SpriteMaterial({map:lampTex,color:0xffe2a8,transparent:true,opacity:.95,depthWrite:false});
const pcTailM=new THREE.SpriteMaterial({map:lampTex,color:0xff2818,transparent:true,opacity:.85,depthWrite:false});
const pcJetShellM=new THREE.MeshBasicMaterial({map:jetTex,color:0x4f76ff,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
const pcJetCoreM=new THREE.MeshBasicMaterial({map:jetTex,color:0xd6e4ff,transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
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
    m9.rotation.x=-Math.PI/2;m9.position.set(0,.062,zc);m9.userData.noShadow=true;m9.renderOrder=2;
    g.add(m9);return m9;
  }
  pool9(6.0,14.5,9.4,0xcfe0ff,.5,beamTex);pool9(4.2,4.4,-4.3,0xff2418,.22); // faisceaux blanc-bleu police + rouge AR
  const jetPool=pool9(5.2,15.5,-10.2,0x5b7dff,0);
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
    sirO.start();wl.start();vb.start();
  }catch(e){sirG=null;}
}
const FB={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
const svM4=new THREE.Matrix4(),svT1=new THREE.Vector3(); // temp partagé de la meute (jamais d'alloc chaude)
function survStart(){
  for(const b of SURV.bots)if(b.mesh)scene.remove(b.mesh.g); // grand ménage de l'escadron précédent
  SURV.on=SURV.armed&&!PARK.on;SURV.t=0;SURV.over=false;SURV.bots=[];SURV._r=0;SURV.pBase=0;SURV.ph=0;SURV.last=false; // FREESTYLE : jamais de police dans le parc
  SURV.jumpZones=[];SURV.pMode=mode;SURV._launchD=0;SURV._launchT=0; // mémoire de tes décollages sur CETTE piste
  survHudEl.style.display=SURV.on?'block':'none';
  lastAlertEl.style.display='none';
  for(const l of gyroLights)l.intensity=0;
  botJetLight.intensity=0;
  for(const tr9 of botTrails){tr9.init=false;tr9.m.visible=false;} // pas de rubans fantômes d'une meute à l'autre
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
/*M*/SURV_M.reset(SURV.bots); // harnais : compteurs neufs pour cette run
  survRender();
}
function svClockDraw(){ // minuteur circulaire PIXEL-ART : 20×20 upscalé net — cadran rétro, aiguille fluide
  if(!svClkCtx)return;
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
  if(svSecsEl){const sLeft=Math.max(0,Math.ceil(left));svSecsEl.textContent='0:'+String(sLeft).padStart(2,'0');
    svSecsEl.style.color=left<10?'#ff5040':'#ffd75e';}
}
function botBoom(b){ // une unité saute : gerbe or+bleu, champignon, et le son si c'est proche
/*M*/SURV_M.death(b,SURV_M._cause||'couperet',SURV.t);SURV_M._cause=null;
  b.alive=false;b.mesh.g.visible=false;
  const rel=THREE.MathUtils.clamp(b.totD-SURV.pBase,1,L-2);
  frameAt(rel,FB);FB.p.addScaledVector(FB.n,.8);
  sparkBurst(sparkGold,FB.p,36,20);sparkBurst(sparkBlue,FB.p,28,16);
  for(let k=0;k<18;k++)spawnP(smokePool,FB.p.x,FB.p.y+k*.22,FB.p.z,(Math.random()-.5)*2.5,5+Math.random()*4,(Math.random()-.5)*2.5,1.2+Math.random()*.7);
  if(Math.abs(rel-s)<220){subBoom(.3);thud(11);shake=Math.max(shake,.5);}
  trickMsg('💥 '+b.name+' EXPLOSE !',2);chimeNote(196,0,.3,.25);
}
function survTick(dt){
  if(!SURV.on)return;
  if(SURV.over){for(const l of gyroLights)l.intensity=0;botJetLight.intensity=0;for(const tr9 of botTrails){tr9.init=false;tr9.m.visible=false;}if(sirG)sirG.gain.setTargetAtTime(0,AC.currentTime,.3);return;}
  SURV.t+=dt;SURV.ph=(SURV.ph+dt*2.7)%1;
  svClockDraw();
  const pTot=SURV.pBase+s;
  // MÊME MOTEUR QUE TOI : la meute roule avec TA caisse (specs + overdrive), pas un pouce de plus.
  // Zéro triche : plus d'élastique, plus de garde-fou, plus d'aspiration magique — que du pilotage.
  // ⚠ CARS[0] + TON MOTEUR, comme toi (2026-08-03) : la meute lisait CARS[level], or `level` est
  // désormais la carrosserie CHOISIE au garage. Équiper la dernière caisse aurait lancé sept
  // poursuivantes à 1900 km/h contre un joueur plafonné par son palier moteur — course injouable.
  const spec9=CARS[0],late9=lateMul(),push9=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).push,
        maxSp9=spec9.maxKmh/3.6*late9*push9,acc9=spec9.accel*late9*(1+(push9-1)*.6),tc9=spec9.turn*.75,segL9=L/(NP-1);
  // ---- ON T'OBSERVE EN DIRECT : chaque décollage grave une ZONE que les bots imiteront sur CETTE piste ----
  if(mode==='fall'&&SURV.pMode!=='fall'){SURV._launchD=pTot;SURV._launchT=SURV.t;}
  else if(mode!=='fall'&&SURV.pMode==='fall'){
    const dur=SURV.t-SURV._launchT;
    if(dur>.4&&SURV.jumpZones.length<48){SURV.jumpZones.push({d:SURV._launchD,dur:Math.min(dur,4)});/*M*/SURV_M.zone(SURV.t);} // là où TU sautes
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
      for(const c9 of CONES){if(c9.hit||c9.face!==1)continue;const d9=c9.s-rel;
        if(d9>2&&d9<oLook&&d9<obD&&Math.abs(c9.lat-lT)<2.4){obD=d9;obLat=c9.lat;obW=2.4;}}
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
      else if(!lift)a9=acc9*(b.v<maxSp9?1:.55)*(b.padB>0?1.5:1)*momF;
      b.v+=a9*dt;
      b.v+=-GRAV*T[bi].y*Math.cos(b.phi)*dt;               // la pente pousse ou retient, comme toi
      b.v-=b.v*Math.abs(b.v)*(acc9/(maxSp9*maxSp9*5.8))*dt; // même traînée, même terminal
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
/*M*/if(SURV_M.on){const d9m=b.v*Math.cos(b.phi)*dt*SPD;if(b.air){b._mDA+=d9m;b._mAirT+=dt;}else b._mDG+=d9m;}
    b.totD+=b.v*Math.cos(b.phi)*dt*SPD;
    // ============ VOL & BORD : mêmes règles — la roue sort, la caisse décolle ============
    if(b.air){
      b.vy-=26*dt;b.airH+=b.vy*dt;
      b.spin+=b.spinV*dt;b.spinV*=Math.max(0,1-dt*.5);
      if(b.airH<=0){ // la retombée
        b.air=false;b.airH=0;b.vy=0;b.spin=0;b.spinV=0;b.jumpCD=1+Math.random()*1.6;
        if(Math.abs(b.lat)>ROAD_HALF){/*M*/SURV_M.land(b,false);/*M*/SURV_M._cause='bord';botBoom(b);continue;} // retombé À CÔTÉ : le vide ne pardonne pas, même à eux
        if(rel>0&&rel<L&&holeAtS(rel)){/*M*/SURV_M.land(b,false);/*M*/SURV_M._cause='trou';botBoom(b);continue;} // retombé DANS le trou : il n'a pas passé le gap, point
/*M*/   SURV_M.land(b,true);
        if(b.mesh.g.visible)sparkBurst(sparkGold,b.mesh.g.position,7,7);
      }
    }else{
      const hb9=(rel>0&&rel<L)?holeAtS(rel):null;
      if(hb9){ // LE TROU : la dalle a disparu sous ses roues — il s'envoie, exactement comme toi
        b.air=true;b.airH=.01;b.spinV=(Math.random()-.5)*2.5;/*M*/SURV_M.takeoff(b,'hole');
        b.vy=13*Math.min(3.5,1.15*(hb9.s1-hb9.s0)/Math.max(20,b.v*SPD)); // vy calé sur la LARGEUR du trou : il vise l'autre bord
      }else if(Math.abs(b.lat)>ROAD_HALF){ // le BORD : même sanction que toi — ça décolle, à lui de revenir
        b.air=true;b.airH=.01;b.vy=6;b.spinV=(Math.random()-.5)*2;/*M*/SURV_M.takeoff(b,'edge');
      }else{
        b.jumpCD-=dt;
        if(b.jumpCD<=0){ // « il a vu où tu sautes » : TES spots sont leurs SEULS tremplins — plus de saut sorti de nulle part
          for(let zi=0;zi<SURV.jumpZones.length;zi++){
            const z=SURV.jumpZones[zi];
            if(zi!==b.zoneMark&&Math.abs(z.d-b.totD)<8){
              b.zoneMark=zi;/*M*/SURV_M.zoneOffered(); // une zone S'EST PRÉSENTÉE à ce bot
              if(Math.random()<.25+b.appJump*.6){ // l'appétit hérité de TOI décide s'il OSE
                const air9=z.dur*(.7+b.appJump*.5);
/*M*/           SURV_M.takeoff(b,'zone');SURV_M.zoneUsed();
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
      for(const c9 of CONES){ // plots : il les mange comme toi (et tu VOIS le plot valser devant)
        if(c9.hit||c9.face!==1||Math.abs(rel-c9.s)>2.6)continue;
        if(Math.abs(b.lat-c9.lat)<1.6){
          c9.hit=true;
          const kv=new THREE.Vector3().copy(T[bi]).multiplyScalar(Math.max(8,b.v*.55))
            .addScaledVector(B[bi],(b.lat-c9.lat>0?-1:1)*(2+Math.random()*4))
            .addScaledVector(Nn[bi],5+Math.random()*5);
          FLYCONES.push({m:c9.mesh,v:kv,rx:(Math.random()-.5)*16,rz:(Math.random()-.5)*16,life:1.6});
          b.v*=.985;
          if(b.mesh.g.visible)sparkBurst(sparkGold,c9.mesh.position,5,6);
        }
      }
      if(!b.alive)continue;
      b.oilCd=Math.max(0,b.oilCd-dt);
      if(b.oilCd<=0)for(const o9 of OILS){ // flaques : ça chasse pareil
        if(o9.face!==1||Math.abs(rel-o9.s)>o9.r+2)continue;
        if(Math.abs(b.lat-o9.lat)<o9.r+.6){b.slipT=.75;b.oilCd=1.2;break;}
      }
      b.padCd=Math.max(0,b.padCd-dt);
      if(b.padCd<=0)for(const p9 of PADS){ // pads turbo : même coup de pied
        if(Math.abs(rel-p9)<6&&Math.abs(b.lat)<ROAD_HALF){b.v+=14;b.padB=Math.max(b.padB,1.2);b.padCd=1.5;break;}
      }
    }
  }
/*M*/SURV_M.sample(dt,SURV.bots,pTot,SURV.t);
  // ---- incarnation : mesh + gyros SEULEMENT à portée de vue (LOD), 2 vraies lumières pour les proches ----
  const ph5=SURV.ph%1<.5;
  let li=0,bjD=1e9,bjOn=false;
  for(const b of SURV.bots){
    if(!b.alive){b.trailK=0;trailStep(b.trail,0,0,0,0,0,0,0);continue;}
    const rel=b.totD-SURV.pBase;
    const gap=Math.abs(rel-s);
    if(rel>2&&rel<L-4){
      frameAt(rel,FB);
      // TRAÎNÉE BLEUE : mise à jour SANS limite de distance — la grosse signature de la meute se voit de LOIN (fog:false)
      b.trailK+=((b.boostT>0?1:0)-b.trailK)*Math.min(1,dt*(b.boostT>0?16:5));
      svT1.copy(FB.p).addScaledVector(FB.b,b.lat).addScaledVector(FB.n,1.05+b.airH).addScaledVector(FB.t,-2.5);
      trailStep(b.trail,svT1.x,svT1.y,svT1.z,.5,.62,1.55,b.trailK,1.7);
      if(gap<340){
      const m=b.mesh.g;
      m.position.copy(FB.p).addScaledVector(FB.b,b.lat).addScaledVector(FB.n,.56+b.airH); // la hauteur de VOL soulève la caisse
      m.quaternion.setFromRotationMatrix(svM4.makeBasis(FB.b,FB.n,FB.t));
      m.rotateY(b.phi); // le cap RÉEL de la sim : on VOIT les braquages, contre-braquages et embardées
      if(b.spin)m.rotateZ(b.spin); // la vrille policière : barrel roll autour de l'axe de route
      m.visible=true;
      const bph=((SURV.ph+b.ph)%1)<.5; // chaque rampe bat sur SA phase — la meute scintille
      b.mesh.lampR.material=bph?gyroRedOn:gyroRedOff;
      b.mesh.lampB.material=bph?gyroBluOff:gyroBluOn;
      b.mesh.sR.visible=bph;b.mesh.sB.visible=!bph;
      const gsc=(2.1+Math.sin((SURV.ph+b.ph)*Math.PI*2)*.5)*(1-gap/400); // le halo respire, s'éteint au loin
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
  SURV.last=alive.length>0&&pRank>alive.length;
  if(SURV.last&&!gameOver){
    const left=Math.max(0,Math.ceil(60-SURV.t));
    lastAlertEl.innerHTML='⚠ ATTENTION !<br>VOUS ÊTES DERNIER<br>EXPLOSION DANS : 00:'+String(left).padStart(2,'0');
    lastAlertEl.style.display='block';
  }else lastAlertEl.style.display='none';
  if(SURV.t>=60){ // ---- LE COUPERET ----
    SURV.t-=60;
    if(SURV.last){ // le joueur est bon dernier : feu d'artifice funèbre
      SURV.over=true;lastAlertEl.style.display='none';
      showMsg('🪦 ÉLIMINÉ — DERNIER DE LA MINUTE !','#ff5e5e');
      flashEl.style.opacity=.85;setTimeout(function(){flashEl.style.opacity=0;},300);
      sparkBurst(sparkGold,carGroup.position,60,26);sparkBurst(sparkBlue,carGroup.position,40,20);
      shake=2.2;duckT=Math.max(duckT,.8);
      survRender();explode();
    }else{
      const low=racers[racers.length-1];
      if(low&&low.totD<pTot){/*M*/SURV_M.couperet();botBoom(low); // la meute s'ÉNERVE : pas plus vite que toi, mais plus téméraire
        for(const b of SURV.bots)if(b.alive){b.agro=Math.min(1,b.agro+.08);b.appBoost=Math.min(1.2,b.appBoost+.1);b.marg=Math.min(.97,b.marg+.02);}}
      if(!SURV.bots.some(b=>b.alive)){
        SURV.over=true;fanfare();addStyle(100);
        runStats.surv=1; // toute la meute au tapis : ça débloque une caisse (versé dans endGame)
        showMsg('🏆 CHAMPION SURVIVANT — JAUGE OFFERTE !','#ffd75e');
      }
    }
  }
  SURV._r-=dt;if(SURV._r<=0){SURV._r=.25;survRender();} // le panneau, lui, se contente de 4 Hz
}
function survRender(){
  if(!svRowsEl)return;
  const pTot=SURV.pBase+s;
  const rows=[{name:'TOI',totD:pTot,alive:!gameOver,me:true},...SURV.bots]
    .sort((a,b)=>(b.alive-a.alive)||(b.totD-a.totD));
  const leadD=rows.length&&rows[0].alive?rows[0].totD:pTot;
  let h='',rk=0;
  for(const r of rows){
    const gap=r.alive?(rk===0?'EN TÊTE':'+'+Math.round(leadD-r.totD)+' m'):'';
    h+='<div class="svRow'+(r.me?' me':'')+(r.alive?'':' dead')+'">'
      +(r.alive?(++rk)+'. ':'🪦 ')+r.name+' <span>'+gap+'</span></div>';
  }
  svRowsEl.innerHTML=h;
}
survBtnEl.addEventListener('click',e=>{e.stopPropagation();
  SURV.armed=!SURV.armed;
  if(SURV.armed&&PARK.on){PARK.on=false;parkBtnEl.textContent='🛝 Parc freestyle · OFF';if(!started)rebuildMenuScene();} // course + police : on quitte le parc
  survBtnEl.textContent='🏁 Survivant · '+(SURV.armed?'ON':'OFF');
  if(started&&!gameOver)showMsg(SURV.armed?'MODE SURVIVANT AU PROCHAIN DÉPART':'SURVIVANT DÉSARMÉ');
});
