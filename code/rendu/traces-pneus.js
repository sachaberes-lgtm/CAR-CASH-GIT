/* LES TRACES DE PNEUS v2 (2026-09-26, user : « lors des virages il faut laisser des traces noires » puis « moins foncées, avec un
   MOTIF de pneu et une légère transparence pour le motif de la route ; il faut aussi qu'elles SORTENT DIRECTEMENT des roues de
   chaque voiture »).
   · UN ruban par roue ARRIÈRE, de la LARGEUR de SON pneu (lu dans les roues de la caisse montée), posé au ras du bitume dès que la
     caisse tourne fort ou glisse (même mesure que la fumée et le crissement : `glisse9`, plus la charge latérale).
   · LE BOUT VIVANT : le dernier quad de chaque ruban est RÉÉCRIT à chaque image, du dernier point posé jusqu'au contact actuel du
     pneu — la trace part donc DE la roue, sans le trou d'un demi-mètre de la v1. Un nouveau point se fige tous les 50 cm.
   · LE MOTIF : une bande de roulement en pavés décalés (texture 32 × 64 peinte une fois) sert d'alphaMap ; les UV courent le long
     de la distance parcourue (un motif tous les 90 cm) → on lit la sculpture du pneu, et le bitume se voit à travers les rainures.
     Gomme gris-noir à 55 % : une trace, pas un trait de marqueur.
   · UN seul mesh : un anneau de 900 quads (les plus anciens réécrits), seule la tranche touchée remonte vers la carte graphique.
     Le ruban se coupe quand la gomme lâche ou au décollage ; tout s'efface au portail (les traces restent sur l'ancienne route). */
const TRACE={N:900,i:0,pos:null,uv:null,geo:null,mesh:null,r:[null,null],V:[new THREE.Vector3(),new THREE.Vector3()],lo:-1,hi:-1};
function traceTex(){ // la bande de roulement : pavés décalés en chevrons, bords adoucis (blanc = gomme, noir = rainure transparente)
  const W=32,H=64,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  x.fillStyle='#000';x.fillRect(0,0,W,H);x.fillStyle='#fff';
  for(let y=0;y<H;y+=16){x.fillRect(2,y,12,10);x.fillRect(18,y+8,12,10);x.fillRect(18,y-8,12,10);} // deux colonnes de pavés, décalées d'une demi-maille
  x.fillStyle='#bbb';x.fillRect(15,0,2,H);                                                        // la nervure centrale, plus claire
  const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(0,0,0,.7)');g.addColorStop(.12,'rgba(0,0,0,0)');g.addColorStop(.88,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.7)');
  x.fillStyle=g;x.fillRect(0,0,W,H);                                                              // les flancs s'estompent
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
function traceInit(){
  const N=TRACE.N,pos=new Float32Array(N*12),uv=new Float32Array(N*8),idx=new Uint32Array(N*6);
  for(let q=0;q<N;q++){const b=q*4,o=q*6;idx[o]=b;idx[o+1]=b+2;idx[o+2]=b+1;idx[o+3]=b+1;idx[o+4]=b+2;idx[o+5]=b+3;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setIndex(new THREE.BufferAttribute(idx,1));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x2c2a33,alphaMap:traceTex(),transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide,
    polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));
  m.frustumCulled=false;m.renderOrder=1;scene.add(m);TRACE.pos=pos;TRACE.uv=uv;TRACE.geo=g;TRACE.mesh=m;
}
function traceVide(){if(!TRACE.pos)return;TRACE.pos.fill(0);for(const n of ['position','uv']){const a=TRACE.geo.attributes[n];a.updateRange.offset=0;a.updateRange.count=-1;a.needsUpdate=true;}TRACE.r[0]=TRACE.r[1]=null;}
function traceQuad(q,A0,A1,B0,B1,v0,v1){ // écrit le quad q : (A0,A1) = bord arrière du morceau, (B0,B1) = bord avant, v = distance/motif
  const P=TRACE.pos,U=TRACE.uv,o=q*12,u=q*8;
  P[o]=A0.x;P[o+1]=A0.y;P[o+2]=A0.z;P[o+3]=A1.x;P[o+4]=A1.y;P[o+5]=A1.z;P[o+6]=B0.x;P[o+7]=B0.y;P[o+8]=B0.z;P[o+9]=B1.x;P[o+10]=B1.y;P[o+11]=B1.z;
  U[u]=0;U[u+1]=v0;U[u+2]=1;U[u+3]=v0;U[u+4]=0;U[u+5]=v1;U[u+6]=1;U[u+7]=v1;
  if(TRACE.lo<0||q<TRACE.lo)TRACE.lo=q;if(q>TRACE.hi)TRACE.hi=q;
}
// (bord v2) LA LÈVRE RACCROCHÉE — voir tryLand. La caisse repasse en conduite là où elle touche la lèvre, cap = direction de sa
// trajectoire (aucun redressement), sa vitesse moins le choc. Le roulis pris en basculant repart dans le RESSORT de la carrosserie
// (elle se repose, elle ne se redresse pas d'un coup) et la marche sous la lèvre se remonte en ~0,15 s (`levreY`).
function levreRattrape(bI,latOff,hOff,tOff){
  secBord(); // (2026-10-14) LES DÉFIS SECRETS : FANTÔME — la lèvre rattrapée, c'est le bord
  tmp.set(0,1,0).applyQuaternion(carGroup.quaternion);
  const r9=Math.atan2(-tmp.dot(B[bI]),tmp.dot(Nn[bI])); // le roulis VISIBLE, dans la convention de carRoll9 (+ = toit vers −B)
  const vm9=vitMult(),vTan=fallVel.dot(T[bI])/vm9,vLat=fallVel.dot(B[bI])/vm9; // (30/09) le vol porte la vitesse RÉELLE (× vitMult) : ramenée au vA d'avant le multiplicateur, comme à la pose
  s=THREE.MathUtils.clamp(bI/(NP-1)*L+THREE.MathUtils.clamp(tOff,-2,2),0,L-1);
  side=1;lat=Math.sign(latOff)*(ROAD_HALF-.05);
  psi=THREE.MathUtils.clamp(Math.atan2(vLat,Math.abs(vTan)+1),-1.4,1.4);yawR=steer*lacetVol(fallVel.length());slipB=0;driftYaw=0;veqPose(bI,1); /* (2026-10-09) yawR = le lacet du VOL (même formule que yawIn) : volant tenu, la caisse ne « s'arrête » plus de tourner à la pose avant de repartir — elle rejoint le lacet du sol en VOL_TAU */
  vA=(vTan>0?Math.hypot(vTan,vLat):vTan)*.94;vL=0; // le choc de la lèvre coûte 6 % · (2026-10-15) toute la vitesse à plat, comme à la pose : le cap EST la trajectoire
  if(PARK.on){driveDir=vA<0?-1:1;vA=Math.abs(vA);}else driveDir=1;
  levreY=Math.min(0,hOff);carRoll9=THREE.MathUtils.clamp(r9,-.42,.42);rollV=0;
  mode='drive';prevTvalid=false;bascOn=false;
  {const g9=figNitRend(!VEQ.rate);if(SONV2&&g9>.01)sfx('nitro.plein',{t:.2});} /* (loi 6) rattrapée à la lèvre : les figures lancées rendent leurs 40 % (le trop-plein dans la réserve bleue) */
  if(FIGV2.on){if(VEQ.rate)figChute();else figComboEncaisse();} /* (2026-10-15, HUD des figures v3 — vu au banc) la LÈVRE rattrapée est une pose : le combo du vol s'y encaisse
     (ou s'y perd), comme sur la dalle — avant, il disparaissait sans un mot (tryLand sort ici avant l'encaissement) */
  if(chain===0&&chainVal>0)rollover=chainVal; // le REPORT d'un PARFAIT, consommé au décollage, n'est pas perdu pour autant
  chainHud.style.opacity=0;caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  squashT=Math.max(squashT,.14);shake=Math.max(shake,.28);hap(18);
  sparkBurst(sparkGold,carGroup.position,8,7);
  try{thud(3.5);if(!SONV2)noiseBurst(.1,.08,900);pneuMord(.35);}catch(e){}
}
const TRACE_ATT=['position','uv']; // (2026-10-14, passe perf mobile) bâtie UNE fois (un tableau par image de trace avant)
function traceTick(actif){
  if(!actif||wheels.length<4){TRACE.r[0]=TRACE.r[1]=null;return;}
  if(!TRACE.pos)traceInit();
  TRACE.lo=-1;TRACE.hi=-1;
  for(let k=0;k<2;k++){const w=wheels[2+k];if(!w)continue; // les deux roues ARRIÈRE
    const hw=THREE.MathUtils.clamp(((w.userData.large)||.30)*.5,.12,.34);          // la LARGEUR du pneu de CETTE caisse
    const L9=TRACE.V[0].set(w.position.x-hw,.025,w.position.z),R9=TRACE.V[1].set(w.position.x+hw,.025,w.position.z);
    carGroup.localToWorld(L9);carGroup.localToWorld(R9);
    let r=TRACE.r[k];
    if(r&&r.a0.distanceToSquared(L9)>36)r=null;                                    // un saut (repli, portail) : on ne relie pas
    if(!r){r=TRACE.r[k]={a0:L9.clone(),a1:R9.clone(),d:0,q:TRACE.i};TRACE.i=(TRACE.i+1)%TRACE.N;}
    const dd=r.a0.distanceTo(L9),v0=r.d/.9,v1=(r.d+dd)/.9;
    traceQuad(r.q,r.a0,r.a1,L9,R9,v0,v1);                                            // LE BOUT VIVANT : jusqu'au pneu, à chaque image
    if(dd>=.5){r.a0.copy(L9);r.a1.copy(R9);r.d+=dd;r.q=TRACE.i;TRACE.i=(TRACE.i+1)%TRACE.N;} // on fige, et un nouveau bout part de là
  }
  if(TRACE.lo>=0)for(const n of TRACE_ATT){const a=TRACE.geo.attributes[n],st=n==='uv'?8:12;
    if(TRACE.hi-TRACE.lo<40){a.updateRange.offset=TRACE.lo*st;a.updateRange.count=(TRACE.hi-TRACE.lo+1)*st;}else{a.updateRange.offset=0;a.updateRange.count=-1;}
    a.needsUpdate=true;}
}
/* (2026-10-14, session PERF — pour les voiles d'INTERFACE) LES SIGNAUX DE CONSTRUCTION, sur `document` (même famille que `cc:chance`) :
   · `cc:portail`      — le voile du portail vient d'être posé (portPasseNiveau) : la construction part DEUX rAF plus tard (tout de suite en vol) ;
   · `cc:construction` — detail.etape = 'debut' | 'fin' (newTrack, synchrone : entre les deux, aucune image ne se peint ; detail.ms à la fin)
                         puis 'chauffe' (chauffeRendu de la piste neuve, ~120 ms après 'fin' : la dernière image lourde du changement de niveau).
   Un voile qui couvre de `cc:portail` (ou du geste JOUER) jusqu'à 'chauffe' cache TOUT le gel du changement de niveau, à tous les portails. */
function ccConstr(etape,ms){try{document.dispatchEvent(new CustomEvent('cc:construction',{detail:{etape:etape,ms:ms||0}}));}catch(e){}}
function newTrack(){
  const t0NT=performance.now();ccConstr('debut');try{newTrack0();}finally{ccConstr('fin',Math.round(performance.now()-t0NT));}}
function newTrack0(){
  const leger9=PREB.ntLeger;PREB.ntLeger=false; // (LE DÉPART D'AVANCE) la piste que resetGame rebâtit dans la même image : jamais dessinée, seul son ciel compte (voir sous9)
  SVOL.t=0;SVOL.k=0; // (2026-10-14, session SON) portail / nouvelle piste : la tension du vol repart de zéro
  PADCH.sL=0; /* (LE TRAIN DE BOOSTS) il traverse le portail — mais les pads de la nouvelle piste comptent dès son début */
  traceVide(); // (2026-09-26) les traces de pneus restent sur l'ancienne route
  for(const t9 of SILS)t9.init=false;rainbowCoupe();nfeuCoupe(); // (2026-09-26) sinon le ruban de nitro se tendait de l'ancien ovule à la nouvelle piste
  loop._rebuildT=performance.now();loop._rebuildD=3500; // la construction d'une zone fait un pic : la qualité auto ne doit pas le prendre pour de la faiblesse
  CHAUFFE_R.t=performance.now()+120; // (tour 2) la nouvelle piste, sa ville, ses nuages : dessinés une fois hors écran dans la foulée (voir chauffeRendu)
  let sd=(Math.random()*1e9)|0;{const g9=+((/[?&]pistegraine=(\d+)/.exec(location.search)||[])[1])||0;if(g9)sd=g9;} // (banc, 2026-10-18) ?pistegraine=n : la MÊME piste à chaque chargement (comparer deux versions au pixel)
  const niv=lvlChoisir(); // LE NIVEAU D'ABORD : buildClouds et buildVoxCity le lisent pendant la construction
  try{flowLieu(niv&&niv.id==='ville'?'ville':'');}catch(e){} // (2026-09-28, FLOW2 loi 15) en VILLE, la triade se gagne sur la route
  {const id9=niv&&niv.id,av9=ORBFX.prev;ORBFX.prev=id9; // (2026-09-28) L'ORBITE A SES PORTES : tunnel en y entrant, feu en en sortant (portail franchi en course)
   if(started&&!gameOver&&runStats.zones>0&&!PARK.on&&av9&&id9&&av9!==id9){if(id9==='espace')orbWarp();else if(av9==='espace')orbFeu();}}
  if(!leger9){const s9=prebGraine(niv);if(s9!=null)sd=s9;} // (2026-10-17) LE PRÉ-BÂTI : au passage du portail, la piste d'en face bâtie d'avance garde SA graine (voir PREB)
  if(niv&&niv.graine)sd=niv.graine; // (2026-09-27) CAMPAGNE : la même piste, les mêmes pièces, les mêmes nuages à chaque essai
  if(!leger9){const e9=prebPalier();try{buildTrack(sd);}finally{if(e9!=null)engTier=e9;} // (LE PRÉ-BÂTI) le décor d'une piste bâtie d'avance se bâtit à son palier (prebPalier)
  padsInstancier();} // (2026-09-27, passe perf iPhone) …et les plaques turbo : 82 appels de dessin → 1
  // LE CIEL : chaque NIVEAU tire le sien dans sa propre liste (voir NIVEAUX). Hors niveaux (parc
  // freestyle), l'ancien CYCLE DU CIEL : une heure du jour au hasard, jamais deux fois la même de
  // suite, et la VRAIE NUIT au 3e portail (runStats.zones est ++ AVANT newTrack, remis à 0 par resetGame).
  let nb9;
  if(niv)nb9=lvlBiome();
  else if(runStats.zones>=3)nb9='nuit';
  else do{nb9=BIO_DAY[(Math.random()*BIO_DAY.length)|0];}while(nb9===BIO.name);
  const nightFalls=!niv&&started&&nb9==='nuit'&&BIO.name!=='nuit'; // capturé AVANT bioGo (qui écrase BIO.name)
  bioGo(nb9,started?bioPortDur():.01); // (2026-09-26, vague 2) 1,2 s au portail (et au replay) en passant par le sombre (voir bioStep) — c'était 4 s de brume laiteuse ; instantané au boot
  if(started&&!PCV.fen)BIO.dip=1;
  lvlGo(started?bioPortDur():.01);     // …et le monde (étoiles de l'orbite, taille de la planète) bascule avec lui
  if(niv&&started&&!gameOver&&runStats.zones>0)lvlAnnonce(); // « NIVEAU 2 — MER DE NUAGES » (le niveau 1, lui, s'annonce après le logo du départ : voir fireLaunchBoost)
  else if(nightFalls)showMsg('LA NUIT TOMBE…','#9ac8ff'); // le déblocage s'annonce
  if(!leger9)computeMinimap();
  try{musicSuitLieu();}catch(e){} // LA MUSIQUE PAR MONDE : change si le lieu en réclame une autre
  if(!leger9)spawnPickups(mulberry32(sd^0x9e3779b9));
  dmtCoupe();s=0;lat=0;psi=0;side=1;driveDir=1;prevTvalid=false;safeS=0;loop._camDriveT=0; // (2026-09-28) la caméra repart de sa place sur la NOUVELLE piste (la coupe se cache sous le flash du portail)
  if(vA<20)vA=20;
  mode='drive';
  campDebut(); // (2026-09-27) la zone qui commence : l'orage repart, la caisse-nuage se range, l'événement rare se pose
}
// (2026-09-30, revue PISTE) console : dbgPas() → le PAS réel de la piste (écart réel/supposé p1/p50/p99, extrêmes, sauts ≥ ×1,5), les
// tronçons de MODULES et les bancs de route.
window.dbgPas=function(){const ds=L/(NP-1),r=[];let sauts=0;for(let i=1;i<NP;i++){r.push(pts[i].distanceTo(pts[i-1])/ds);if(i>1){const k=r[i-1]/r[i-2];if(k>=1.5||k<=1/1.5)sauts++;}}
  r.sort(function(a,b){return a-b;});const q=function(p){return +r[Math.floor(p*(r.length-1))].toFixed(3);},vC=70+(lvPiste()-1)*100;
  const Z=[];for(const c of CLOUDS)if(c.onRoad){let bi=0,bd=1e18;for(let i=0;i<NP;i+=4){const d2=pts[i].distanceToSquared(c.c);if(d2<bd){bd=d2;bi=i;}}const sB=bi*ds;Z.push([sB-c.r-10,sB+c.r+vC]);}
  return {L:Math.round(L),NP:NP,pas:{p1:q(.01),p50:q(.5),p99:q(.99),min:+r[0].toFixed(3),max:+r[r.length-1].toFixed(3),sauts:sauts},vC:Math.round(vC),
    modules:MODS.map(function(m){return [Math.round(m.s0),Math.round(m.s1)];}),flaques:OILS.length,bancs:Z.length,sas:Math.round(2.5*vC)};};
/* (2026-10-14, BANC RACCOURCIS — LECTURE SEULE) dbgTrace(o) → la piste COURANTE échantillonnée, pour les mesures en Node (cc-banc/raccourcis.cjs).
   · o.pas    : écart des échantillons en mètres (4 par défaut ; les points du jeu sont équidistants, on en saute k = pas/ds).
   · o.graine : REBÂTIT la piste de la carte courante avec CETTE graine, par la fonction du jeu elle-même (newTrack). newTrack tire sa graine
                sd=(Math.random()*1e9)|0 (campagne exceptée : niv.graine) et la passe à buildTrack(sd) : on lui sert (graine+.5)/1e9 pour CE seul
                appel — reconnu à sa pile (l'appelant direct est newTrack0), jamais un autre Math.random — puis Math.random redevient le vrai.
   · o.carte / o.meteo : impose le couple du mode classique comme `?carte=&meteo=` (même au menu : SF.pret le temps de l'appel). Sans eux, la carte en cours.
   · o.palier : pose `engTier` le temps du newTrack (la piste se bâtit à l'échelle de CE palier moteur, comme à un portail), puis le restaure.
   ⚠ Rebâtir = newTrack() ENTIER (piste, décor, pièces) : s repart de 0 — pas au milieu d'une vraie course. La piste est celle de la zone 0, au palier moteur courant (ou o.palier).
   Rend {carte,meteo,piste,L,NP,half,thick,minY,g,spd,airMax,pas,p,t,n,b,trou,graine,graineOk,lv,eng,vPal,rMin} : vPal = vPalier(), rMin = rayonPalier() AU PALIER DE LA PISTE ; p en mètres (2 décimales), t/n/b = le repère de la dalle
   (tangente, normale, binormale ; 3 décimales), trou[i]=0 (il n'y a plus de vide : le champ reste pour les bancs).
   graineOk=false : la graine n'a pas pris (niveau à graine FIXE, ou newTrack ne l'a pas tirée) — la piste n'est alors pas celle de la graine demandée. */
window.dbgTrace=function(o){o=o||{};let graineOk=null,graine=null;const eT9=engTier,pal9=o.palier!=null?(o.palier|0):eT9;
  if(o.graine!=null||o.carte||o.palier!=null){
    const raV=Math.random,sv={p:SF.pret},v=o.graine!=null?Math.abs(Math.floor(+o.graine))%1e9:-1;let pris=false;
    const randGraine=function randGraine(){ // nommée : sa pile la trahit
      if(v>=0&&!pris&&/^\s*at newTrack0\b/.test(String(new Error().stack).split('\n')[2]||'')){pris=true;Math.random=raV;return (v+.5)/1e9;}
      return raV();};
    try{
      if(o.carte){SF.force={carte:String(o.carte),meteo:o.meteo?String(o.meteo):null};SF.tirage=[];SF.der=null;SF.pret=true;}
      if(v>=0)Math.random=randGraine;
      engTier=pal9;
      newTrack();
    }finally{Math.random=raV;engTier=eT9;if(o.carte){SF.pret=sv.p;SF.force=null;}}
    if(v>=0){graine=v;graineOk=pris&&!(LVL.cur&&LVL.cur.graine);}
  }
  const ds=L/(NP-1),k=Math.max(1,Math.round((o.pas||4)/ds)),nb=Math.floor((NP-1)/k)+1,r2=function(x){return Math.round(x*100)/100;},r3=function(x){return Math.round(x*1000)/1000;};
  const p=new Array(nb*3),t=new Array(nb*3),n=new Array(nb*3),b=new Array(nb*3),trou=new Array(nb);
  for(let j=0;j<nb;j++){const i=j*k,P=pts[i],a=T[i],c=Nn[i],d=B[i],q=j*3;
    p[q]=r2(P.x);p[q+1]=r2(P.y);p[q+2]=r2(P.z);t[q]=r3(a.x);t[q+1]=r3(a.y);t[q+2]=r3(a.z);
    n[q]=r3(c.x);n[q+1]=r3(c.y);n[q+2]=r3(c.z);b[q]=r3(d.x);b[q+1]=r3(d.y);b[q+2]=r3(d.z);trou[j]=0;}
  let lv9=0,vp9=0,rm9=0;engTier=pal9;try{lv9=lvPiste();vp9=vPalier();rm9=rayonPalier();}finally{engTier=eT9;} // les trois se lisent AU PALIER de la piste
  return {carte:LVL.cur?(LVL.cur.carte||LVL.cur.id):null,meteo:LVL.cur?LVL.cur.meteo||null:null,piste:LVL.cur?LVL.cur.piste||null:null,L:r2(L),NP:NP,half:ROAD_HALF,thick:THICK,minY:r2(trackMinY),
    g:FALL_G*SPD,spd:SPD,airMax:airMax(),pas:r2(k*ds),graine:graine,graineOk:graineOk,lv:r2(lv9),eng:pal9,vPal:r2(vp9),rMin:r2(rm9),p:p,t:t,n:n,b:b,trou:trou,
    mods:MODS.map(function(m){return [r2(m.s0),r2(m.s1)];})};}; // (2026-10-18) les tronçons des MODULES (voir MODC_ON)
// console : dbgPortail(d) → la caisse à d mètres AVANT l'ovule (sur la route) ; dbgPortail('ciel') → lâchée à la verticale AU-DESSUS de lui
window.dbgPortail=function(d){if(!started||gameOver||PARK.on)return 'pas de course';
  if(d==='ciel'){s=Math.max(0,L-400);startFall(10,1);fallPos.copy(PORTAL.c);fallPos.y+=PORTAL.R*1.7;fallVel.set(0,-35,0);return {mode,c:PORTAL.c.toArray().map(Math.round),R:PORTAL.R};}
  s=Math.max(0,L-(d||300));lat=0;psi=0;prevTvalid=false;mode='drive';return {L:Math.round(L),s:Math.round(s),R:PORTAL.R};};
// console : dbgSaut() → franchit le portail tout de suite (niveau suivant), comme le vrai portail le fait
window.dbgSaut=function(){ if(!started||gameOver||PARK.on)return 'pas de course en cours';
  runStats.zones++;SURV.pBase+=survPortS();newTrack();return window.dbgNiveau(); }; // (2026-09-30) comme le vrai portail : en vol, au moins l'entrée de l'ovule
/* (2026-10-14, session SON) CE QUI SONNE ENCORE DE LA MORT QUAND ON REJOUE. L'explosion dure 3,35 s, la fanfare du record 1,87 s, le
   « compte » de l'écran de fin 1,1 s : un REJOUER pressé (le volet noir ne dure que 0,35 s) les laissait finir PAR-DESSUS le logo, le
   whoomp et le réacteur du départ de la partie suivante (ils sont dans le bus des effets, `stopJeu` ne les connaît que pour la pause).
   `resetGame` les éteint (CCSON.stop : rampe de 10 ms, jamais net) et annule ce qui était programmé en avance, UNIQUEMENT si l'on sort d'un
   écran de fin (`gameOver`) : les sons du départ qui précèdent resetGame (JOUER depuis le garage) ne sont jamais touchés. */
const FIN_SONS=['explosion','explosion.loin','impact.immeuble','mort.vide','mort.arret','mort.air','mort.police',
  'mort.enseigne','mort.compteFin','ui.debloque','ui.record','caisse.debloquee','aura.encaisse1','aura.encaisse2','aura.encaisse3'];
/* LA RÉGIE ADMOB, CÔTÉ JEU (2026-10-19, Sacha : « prépare les emplacements de pub récompensée dans le jeu (sans module AdMob), on branchera
   AdMob en v1.1 ») — ÉTEINTE tant que le chargeur du <head> (« LA RÉGIE ADMOB DE L'APP iPHONE » : CC_ADMOB) n'a pas son identifiant ET que
   le module natif n'est pas dans l'app : aujourd'hui elle ne fait RIEN (AMOB.on faux), la pub maison joue comme avant.
   Allumée, elle devient la régie de TOUTES les pubs récompensées (seconde chance, ×2 du gain) par les deux crochets que pubRecompense
   connaît déjà : CC_PUB_PREPARE (l'offre s'ouvre → prepareRewardVideoAd) et CC_PUB_RECOMPENSE (le toucher → showRewardVideoAd).
   Au lancement de l'app : initialize, le message de consentement RGPD de Google (UMP : requestConsentInfo/showConsentForm, obligatoire en
   Europe), la fenêtre de suivi d'Apple (ATT : requestTrackingAuthorization), puis une pub préchargée. La fin d'une pub se lit aux
   ÉVÉNEMENTS du module (récompense gagnée, pub fermée, pub ratée) — pas à la promesse de showRewardVideoAd, qui selon les versions rend
   la main avant que la pub soit fermée. Rien de prêt au toucher → null → la pub maison. Une pub qui ne rend jamais la main : 150 s, puis
   « pas vue ». ⚠ ÉCRIT SANS LE MODULE SOUS LA MAIN (aucun Mac ici) : les noms d'événements et d'options sont ceux de
   @capacitor-community/admob v5-v7 — à vérifier contre la version installée, au banc ?pubtest=1 sur un vrai iPhone. Banc : dbgPub().admob. */
const AMOB={on:false,pret:false,charge:false,vu:false,res:null,tm:0,etat:'',n:0,init:false};
(function(){try{
  const C=window.Capacitor;if(!C)return;
  let A=C.Plugins&&C.Plugins.AdMob;
  if(!A&&typeof C.isPluginAvailable==='function'&&C.isPluginAvailable('AdMob')&&typeof C.registerPlugin==='function')A=C.registerPlugin('AdMob');
  const test=/[?&]pubtest=1\b/.test(location.search),cfg=window.CC_ADMOB||{};
  const id=test?'ca-app-pub-3940256099942544/1712485313':String(cfg.recompense||'');
  if(!A||typeof A.prepareRewardVideoAd!=='function'||typeof A.showRewardVideoAd!=='function'||!/^ca-app-pub-\d{10,20}\/\d{6,14}$/.test(id))return;
  AMOB.on=true;
  const fin=function(v){clearTimeout(AMOB.tm);const r=AMOB.res;AMOB.res=null;if(r)r(v);};
  const charge=function(){if(!AMOB.init||AMOB.pret||AMOB.charge||AMOB.res)return;AMOB.charge=true;
    Promise.resolve().then(function(){return A.prepareRewardVideoAd({adId:id,isTesting:test});})
      .then(function(){AMOB.charge=false;AMOB.pret=true;AMOB.etat='prête';},function(){AMOB.charge=false;AMOB.etat='pas chargée';});};
  const ecoute=function(n,f){try{A.addListener(n,f);}catch(e){}};
  ecoute('onRewardedVideoAdReward',function(){AMOB.vu=true;});
  ecoute('onRewardedVideoAdDismissed',function(){AMOB.etat='fermée';fin(AMOB.vu);});
  ecoute('onRewardedVideoAdFailedToShow',function(){AMOB.etat='ratée';fin(null);});
  const lance=async function(){
    try{await A.initialize({initializeForTesting:test});}catch(e){}
    try{if(typeof A.requestConsentInfo==='function'){const ci=await A.requestConsentInfo();
      if(ci&&ci.isConsentFormAvailable&&ci.status==='REQUIRED'&&typeof A.showConsentForm==='function')await A.showConsentForm();}}catch(e){}
    try{if(typeof A.trackingAuthorizationStatus==='function'&&typeof A.requestTrackingAuthorization==='function'){
      const t=await A.trackingAuthorizationStatus();if(t&&t.status==='notDetermined')await A.requestTrackingAuthorization();}}catch(e){}
    AMOB.init=true;charge();};
  if(document.readyState==='complete')setTimeout(lance,1500);else addEventListener('load',function(){setTimeout(lance,1500);});
  window.CC_PUB_PREPARE=function(nom){charge();};
  window.CC_PUB_RECOMPENSE=function(nom){
    if(!AMOB.pret||AMOB.res){charge();return null;} // rien de prêt : la pub maison
    AMOB.pret=false;AMOB.vu=false;AMOB.n++;AMOB.etat='montrée';
    const p=new Promise(function(res){AMOB.res=res;});
    AMOB.tm=setTimeout(function(){fin(false);},150000);
    Promise.resolve().then(function(){return A.showRewardVideoAd();}).then(function(r){if(r&&r.type!=null)AMOB.vu=true;},function(){AMOB.etat='ratée';fin(null);});
    p.then(function(){setTimeout(charge,1000);}); // la suivante se prépare dès que celle-ci a rendu la main
    return p;};
}catch(e){AMOB.on=false;}})();
/* LA RÉGIE ADSENSE, CÔTÉ JEU (2026-10-15 soir, Sacha : « branche les vraies pubs sur le site web avec Google AdSense (jeux H5) ») — le
   chargeur du <head> (« LA RÉGIE ADSENSE » : CC_ADSENSE, ?pubtest=1) a posé adBreak/adConfig ; on en fait la régie de LA PUB QUI RESSUSCITE.
   Le parcours de Google pour une pub RÉCOMPENSÉE : on DEMANDE une pub quand l'offre s'ouvre (adBreak type 'reward', depuis chanceOuvre :
   CC_PUB_PREPARE) ; Google rappelle beforeReward(showAdFn) SEULEMENT s'il en a une ; la plaque CONTINUER ▶ PUB est l'invitation, son toucher
   appelle showAdFn() DANS le geste (CC_PUB_RECOMPENSE) → adViewed = reprise, adDismissed = pas de reprise. Pas de pub prête au toucher (rien
   en stock, plafond de fréquence, bloqueur, mode test « pas chargée »…) → null → la pub maison de 5 s. adConfig dit à Google si le jeu a du
   son (`sound`, relu à chaque offre) et précharge (`preloadAdBreaks`, une seule fois). Une pub qui ne rend jamais la main : 150 s, puis
   « pas vue ». Banc : dbgPub().ads (on, pret, etat = le dernier breakStatus de Google, n, prete). */
const ADS={on:!!(window.CC_ADS&&typeof window.adBreak==='function'&&typeof window.CC_PUB_RECOMPENSE!=='function'),pret:false,b:null,etat:'',n:0};
function adsSon(){return (SAVE.d.sfx||SAVE.d.mus)?'on':'off';}
if(ADS.on){
  try{adConfig({preloadAdBreaks:'on',sound:adsSon(),onReady:function(){ADS.pret=true;}});}catch(e){ADS.on=false;}
  window.CC_PUB_PREPARE=function(nom){
    if(ADS.b&&ADS.b.res)return; // une pub de Google est à l'écran : on n'en demande pas une autre
    const b={show:null,res:null,tm:0};ADS.b=b;ADS.n++;
    const fin=function(v){clearTimeout(b.tm);b.show=null;const r=b.res;b.res=null;if(r)r(v);};
    try{adConfig({sound:adsSon()});}catch(e){}
    try{adBreak({type:'reward',name:nom,
      beforeReward:function(showAdFn){if(ADS.b===b)b.show=showAdFn;},
      adDismissed:function(){fin(false);},
      adViewed:function(){fin(true);},
      adBreakDone:function(info){ADS.etat=String(info&&info.breakStatus||'');fin(ADS.etat==='viewed'?true:ADS.etat==='dismissed'?false:null);}});}
    catch(e){ADS.etat='erreur';}
  };
  window.CC_PUB_RECOMPENSE=function(nom){
    const b=ADS.b;if(!b||!b.show)return null; // rien de prêt : la pub maison
    const f=b.show;b.show=null;
    const p=new Promise(function(res){b.res=res;});
    b.tm=setTimeout(function(){const r=b.res;b.res=null;if(r)r(false);},150000);
    try{f();}catch(e){clearTimeout(b.tm);const r=b.res;b.res=null;if(r)r(null);}
    return p;
  };
}
