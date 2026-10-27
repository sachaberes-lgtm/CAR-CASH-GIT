/* ===== LES FIGURES SUR LA ROUTE (2026-10-17, Sacha : « toutes les figures doivent pouvoir être exécutées sur route, c'est-à-dire sans
   s'envoler » — au questionnaire : « la caisse reste sur la route et tu gardes le volant ; seule la carrosserie fait un petit bond le temps de
   la figure, puis retombe sur ses roues ; pas de mode vol »). Avant : au sol, le double-tap NITRO faisait le SAUT NITRO (startFall : la caisse
   décolle, vole ~0,85 s, se pose) et la figure tournait EN VOL — ailes, chrono, viseur, et la route qui pouvait filer sous la caisse.
   · S'il y a une figure dans la direction tenue (▲ ou rien = l'avant, ▼ l'arrière, ◄► le côté), elle se fait SUR LA ROUTE : la conduite ne
     change pas (mode 'drive' : volant, vitesse, obstacles, pièces — la physique ne voit rien, comme les figures au sol du GLISSER) ; seule
     l'IMAGE de la caisse tourne, menée par le même moteur que le vol (`FIG.Corps`, dans un corps à elle : `FR.C`, le coup net et son planté),
     et fait un BOND le long de la normale de la route : un arc de saut (`FR.H`, la hauteur qu'il faut à la figure : salto ~1,9 m, tonneau
     ~0,7 m, toupie 0,35 m — `frHaut`) et jamais moins que ce qui garde la carrosserie hors du bitume (`frDegage` : le coin le plus bas de la
     boîte tournée). La caméra ne suit que 20 % du bond (`FR_K.cam`) : on VOIT la caisse quitter la route.
   · La durée (`frDuree`) : 65 % du catalogue, entre 0,4 et 0,72 s (le salto du saut tournait en ~0,36 s) ; le bond dure ×1,12 + le planté.
   · Le prix et la paie ne bougent pas : 20 % de la jauge au lancement (comme le saut, offert sous NITRO INFINIE, au parc, à
     l'auto-école ; à sec : le « tchk ») ; plantée = `figPaye` (l'aura, le HUD des figures, les missions, la leçon) ; la caisse retombée, la
     POSE d'un vol est rejouée pour la figure (`frEncaisse` : le combo, les 40 % rendus, les pièces du MOTEUR, le flow, la frénésie armée).
   · Rien dans la direction tenue : le SAUT NITRO d'avant, sans figure. Une figure sur la route à la fois. Décollage en pleine figure (une
     crête, le bord) : son corps passe au vol (`frDecolle`/`frVersVol`, dans startFall) et elle finit en l'air.
   · Le GLISSER de Léo n'est pas changé : au sol, slide 360 / wheelie / stoppie, et son salto part toujours avec le saut (joystick en avant).
   `?froute=0` = le saut nitro d'avant. Console : `dbgFRoute()` (l'état), `dbgFRoute(x,y)` (un double-tap au sol, le joystick en x, y). */
const FR_K={k:.65,dMin:.4,dMax:.72,hMin:.35,hMax:2.4,marge:.1,cam:.8};
const FR={ok:!/[?&]froute=0\b/.test(location.search),on:false,C:window.FIG&&FIG.Corps?new FIG.Corps():null,t:0,D:0,T:0,H:0,s:-1,r:null,f:null,pivK:0,lift:0,liftMax:0,n:0,fini:0,vols:0,
  qr:new THREE.Quaternion(),dq:new THREE.Quaternion(),pv:new THREE.Vector3(),pv2:new THREE.Vector3(),dv:new THREE.Vector3(),dv2:new THREE.Vector3(),cv:new THREE.Vector3(),
  p0:new THREE.Vector3(),p0ok:false,vel:new THREE.Vector3()};
function frDegage(q,zp){const sp=CARS[level]||CARS[0],w=(sp.w||2)*.5,h=sp.h||1.3,l=(sp.l||4.4)*.5,hc=h*.5;let m=0; // de combien le coin le plus bas de la boîte tournée (autour du milieu, ou du nez : zp) passe SOUS le bitume
  for(let i=0;i<8;i++){FR.dv.set(i&1?w:-w,(i&2?h:0)-hc,(i&4?l:-l)-zp).applyQuaternion(q);const y=FR.dv.y+hc;if(y<m)m=y;}
  return -m;}
function frHaut(f){let H=FR_K.hMin; // le sommet du bond : ce qu'il faut à la figure pour tourner sans toucher (chaque axe essayé sur son tour, ou sur l'amplitude d'un battement)
  for(let i=0;i<f.m.length;i++){const m=f.m[i],a=m.a,L=Math.hypot(a[0],a[1],a[2])||1,amp=m.t!=null?6.2832:Math.abs(m.b||0)*6.2832;FR.dv2.set(a[0]/L,a[1]/L,a[2]/L);
    for(let k=1;k<=16;k++){FR.dq.setFromAxisAngle(FR.dv2,amp*k/16);H=Math.max(H,frDegage(FR.dq,0)+FR_K.marge);}}
  return Math.min(FR_K.hMax,H);}
function frDuree(f){return Math.min(FR_K.dMax,Math.max(FR_K.dMin,figDMin(f,true),f.D*FR_K.k));}
function frLance(){ // le double-tap au sol : la figure de la direction tenue, SUR LA ROUTE — true lancée · false refusée · null rien dans cette direction (le saut nitro)
  if(!FR.ok||!FIGV2.on||!FR.C||!window.FIG||mode!=='drive')return null;
  const S=figSlots();let s=FDIR.on?figDirSlot():FX2.cyc;
  if(!S[s]){if(FDIR.on&&!TUTO.on)return null;for(let k=1;k<FIG_NB&&!S[s];k++)if(S[(s+k)%FIG_NB])s=(s+k)%FIG_NB;if(!S[s])return null;} // (comme le saut) l'auto-école et ?figdir=0 prennent un emplacement qui existe
  let f=FIG.par[S[s]];if(f&&FIG.oriente&&s<2)f=FIG.oriente(f,FIG_DIR[s]);if(!f)return null;
  if(FR.on||GSOL.k||DMT.act||performance.now()-VEQ.sautT<VEQ_K.sautCd*1000)return false; // une à la fois ; pas pendant un geste du GLISSER ni le demi-tour ; l'attente du saut
  const libre=pwrNitroT>0||PARK.on||startBoostT>0||TUTO.on,cout=libre?0:NITRO2.figN.cout*nitroCap();
  if(!libre&&nitroR+nitroX<cout){figRefus(s);return false;}
  if(cout>0)figNitPaye(cout);
  let ax=0;for(let i=0;i<f.m.length;i++){const m=f.m[i];if(!(m.a[0]!==0&&m.a[1]===0&&m.a[2]===0)){ax=Math.abs(m.a[2])>Math.abs(m.a[1])?2:1;break;}}
  const st9=FDIR.on&&Math.abs(FDIR.x)>=.3?FDIR.x:steer,sens=Math.abs(st9)>.25?(ax===2?(st9>0?-1:1):(st9>0?1:-1))*(f.piv?-1:1):(FX2.sensAlt=-FX2.sensAlt); // (comme figLance) elle part du côté du pouce
  const D=frDuree(f),C=FR.C;
  FX2.pts=0;FX2.nPay=0;if(FX2.cv.cle!=='fin')figCvRaz();else{FX2.cv.n=0;FX2.cv.dist=0;FX2.cv.ids={};FX2.cv.noms.length=0;}FX2.trio=[];FX2.nitF=0;FX2.nitL=0; // un « vol » neuf, sur la route (voir figDepart)
  C.vide();C.budget=9;C.poseK=0;const r=C.lance(f,sens,D,{douce:true});if(!r)return false; // douce : comme celle du saut — jamais une chute, pas de trio
  r.nitN=1;FX2.nitL=1;FX2.n++;VEQ.n++;FR.n++;FX2.cyc=(s+1)%FIG_NB;VEQ.sautT=performance.now();
  {const D9=FIG.dirs?FIG.dirs(f):[];r.flD=f.sens==='avant'||(D9.length===1&&D9[0]==='avant')?'haut':f.sens==='arriere'||(D9.length===1&&D9[0]==='arriere')?'bas':((ax===2||f.piv)?(sens<0?'gauche':'droite'):(sens>0?'gauche':'droite'));} // la flèche du HUD (voir figLance)
  FR.on=true;FR.t=0;FR.D=D;FR.T=D*1.12+FIG.PHY.retT+.08;FR.H=frHaut(f);FR.s=s;FR.r=r;FR.f=f;FR.pivK=0;FR.lift=0;FR.liftMax=0;FDC.a=frNez()<FDC.arme; /* (2026-10-19) LE DÉCOLLAGE AU MANCHE : le pouce qui a CHOISI la figure (en haut) doit revenir avant de faire décoller */
  figCoup(Math.hypot(r.imp[0],r.imp[1],r.imp[2])/10,false);fhLance(s,r,{}); // le coup de la figure (son, main, caméra) ; son nom tombe en grand, dans la couleur de son emplacement
  const p9=carGroup.position,sp9=CARS[level]||CARS[0];for(let k=0;k<14;k++){const a=Math.random()*6.2832; // le souffle contre la route, sous la caisse
    spawnP(k%3?flames:flameCore,p9.x+Math.cos(a)*sp9.w*.5,p9.y+.2,p9.z+Math.sin(a)*sp9.l*.4,FR.vel.x*.8+Math.cos(a)*(3+Math.random()*5),-1-Math.random()*2,FR.vel.z*.8+Math.sin(a)*(3+Math.random()*5),.16+Math.random()*.14);}
  sparkBurst(sparkGold,p9,8,8);
  return true;}
function frBoum(e){const k=Math.min(1.6,e.k||1),n=Math.round(14+16*k),vx=FR.vel.x*.86,vy=FR.vel.y*.86,vz=FR.vel.z*.86;figPoint(e); // l'explosion de la figure (figBoum, au sol : le souffle suit la caisse qui roule)
  for(let i=0;i<n;i++){const s9=8+Math.random()*14*k;spawnP(i%2?flames:flameCore,FX2.v.x,FX2.v.y,FX2.v.z,vx-FX2.d.x*s9+(Math.random()-.5)*6,vy-FX2.d.y*s9+(Math.random()-.5)*6,vz-FX2.d.z*s9+(Math.random()-.5)*6,.14+Math.random()*.2);}
  sparkBurst(sparkGold,FX2.v,Math.round(8+8*k),12);}
function frPaye(r){const c0=chainSeen['fig_'+r.f.id]|0;figPaye(r); // plantée : comme en vol — et le FLOW qu'addTrick ne donne qu'en l'air (celle du saut le nourrissait)
  if(mode==='drive'){const reps=Math.max(1,r.reps|0),a=(r.f.aura||60)*(reps>1?1+(reps-1)*1.25:1);flowAdd((a>=120||reps>=2?9:6)*Math.pow(.6,c0),'risque');}}
function frEncaisse(){ // la caisse est retombée sur ses roues : ce que la POSE d'un vol fait pour ses figures (tryLand), sans le vol — grade ordinaire
  const q=chainVal*Math.min(6,chainMult)*(1+FLOW.lv*.5)*(fever>0?2:1);
  if(chain>0&&q>0){flowAdd(4,'style','n');runStats.tricks++;poseSndT=performance.now();addCoins(Math.max(2,Math.min(18,Math.round(2+q/6))));boost=Math.max(boost,1.2);
    if(FREN.arme&&FLOW.lv<4)frenDeclenche();} // jauge pleine + figure posée : la FRÉNÉSIE part (comme à la pose)
  chain=0;chainVal=0;chainMult=1;chainSeen={};chainHud.style.opacity=0;caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  figComboEncaisse();const g=figNitRend(true);if(SONV2&&g>.01)try{sfx('nitro.plein',{t:.2});}catch(e){}}
function frCoupe(){if(FR.C)FR.C.vide();FR.on=false;FR.lift=0;FX2.nitL=0;} // (la course s'arrête, la caisse explose) rien à rendre
function frFin(){const C=FR.C,P=C.pose();for(let i=0;i<P.payees.length;i++)frPaye(P.payees[i]); // le bond fini : ce qui reste se juge (une figure presque finie compte)
  FR.ecFin=+(C.ecart()*57.3).toFixed(1);C.vide();FR.on=false;FR.lift=0;FR.fini++;frEncaisse(); // (FX2.nitL gardé : frEncaisse rend ses 40 %) — ecFin (banc) : de combien elle se recale à la dernière image (°)
  sensCoup(0,.6,-1.4);hap([8,18]);try{if(SONV2)sfx('pose.nette',{t:.02});}catch(e){} // elle retombe : la suspension encaisse, le petit son de la pose
  const sp9=CARS[level]||CARS[0];for(const sd of [-1,1]){FX2.v.set(sd*sp9.w*.45,.2,0);carGroup.localToWorld(FX2.v);for(let k=0;k<4;k++)spawnP(dust,FX2.v.x,FX2.v.y,FX2.v.z,FR.vel.x*.7+(Math.random()-.5)*5,1+Math.random()*2,FR.vel.z*.7+(Math.random()-.5)*5,.3+Math.random()*.25);}}
function frTick(dt){if(!FR.on)return; // (la boucle, en course) le corps de la figure avance
  if(!started||gameOver||mode!=='drive'){frCoupe();return;}
  if(paused)return;
  const C=FR.C;FR.t+=dt;C.budget=Math.max(.05,FR.T-FR.t);C.poseK=FR.t>FR.D?1:0; // poseK : sa durée jouée, l'air la range VITE (un battement — le shimmy — mettait 1,3 s à se calmer, puis se recalait d'un coup)
  const fin=C.tick(dt);
  for(let i=0;i<C.evts.length;i++)frBoum(C.evts[i]);C.evts.length=0;
  for(let i=0;i<C.figs.length;i++){const r=C.figs[i];if(r.paye)continue; // CHAQUE TOUR SE SENT (comme en vol : le souffle de son axe, un tic dans la main) ; un battement, à chaque aller-retour
    if(r.mv.length){let mm=r.mv[0];for(let j=1;j<r.mv.length;j++)if(r.mv[j].tours>mm.tours)mm=r.mv[j];
      const n9=Math.floor(Math.max(0,mm.th)/6.2832+.08);if(n9>(r.tourDit|0)){r.tourDit=n9;try{if(SONV2&&!sfx(figMat(mm.a),{vol:-2,st:echSt()}))sfx('fig.vrille',{vol:-6});}catch(e){}hap(6);}}
    else if(r.osc&&r.t<r.D){const nb=Math.floor(r.t*r.osc.w/Math.PI);if(nb>(r.batDit|0)){r.batDit=nb;try{if(SONV2)sfx('fig.battement',{var:r.osc.z>.3?1:0,vol:-4,st:sonPdAR(ECH+(nb&1))});}catch(e){}hap(5);}}}
  {let pv9=0;for(let i=0;i<C.figs.length;i++){const r=C.figs[i];if(!r.paye&&r.f&&r.f.piv){pv9=r.f.piv;break;}}FR.pivK+=(pv9-FR.pivK)*Math.min(1,dt*14);} // le TAIL WHIP : le point fixe glisse vers le nez
  for(let i=0;i<fin.length;i++)frPaye(fin[i]);
  if(frEnvol())return; // (2026-10-19, Léo) LE DÉCOLLAGE AU MANCHE : le nez tiré vers le haut pendant le bond, la caisse quitte la route
  if(FR.t>=FR.T&&(C.ecart()<.03||FR.t>FR.T+.6))frFin();}
function frPose(F,dt){const p=carGroup.position; // (conduite, chaque image, après la pose de la caisse sur la route) la figure tourne autour du MILIEU de la caisse, le bond la soulève
  if(FR.p0ok&&dt>0){FR.vel.subVectors(p,FR.p0).multiplyScalar(1/dt);if(FR.vel.lengthSq()>16e4)FR.vel.set(0,0,0);}FR.p0.copy(p);FR.p0ok=true; // la vitesse de la caisse dans le monde : le souffle des explosions la suit
  if(!FR.on||mode!=='drive'){FR.lift=0;return;}
  const q=FR.C.q,sp=CARS[level]||CARS[0],hc=(sp.h||1.3)*.5,zp=FR.pivK*(sp.l||4.4)*.5;let dg=0;
  if(q[3]<.9999995){FR.qr.set(q[0],q[1],q[2],q[3]);FR.pv.set(0,hc,zp).applyQuaternion(carGroup.quaternion);carGroup.quaternion.multiply(FR.qr);
    FR.pv2.set(0,hc,zp).applyQuaternion(carGroup.quaternion);p.add(FR.pv).sub(FR.pv2);dg=frDegage(FR.qr,zp);}
  const x=Math.min(1,FR.t/FR.T);FR.lift=Math.max(FR.H*4*x*(1-x),dg>0?dg+FR_K.marge:0);if(FR.lift>FR.liftMax)FR.liftMax=FR.lift;
  p.addScaledVector(F.n,FR.lift);}
function frDecolle(){ // (startFall, AVANT ses remises à zéro) la caisse décolle en pleine figure sur la route
  if(!FR.on)return null;const k={nitL:0,lift:FR.lift}; // (2026-10-19) lift : le vol part d'où la caisse EST, le bond compris (elle retombait d'un coup sur le bitume)
  if(FR.r&&FR.r.paye)frEncaisse();else k.nitL=FX2.nitL|0; // déjà plantée : elle est posée sur la route ; sinon elle part avec le vol (et se paiera à SA pose)
  return k;}
function frVersVol(k){ // (startFall, APRÈS figDepart) le corps de la figure devient celui du vol : elle continue de tourner, en l'air
  const C0=FX2.corps;FX2.corps=FR.C;FR.C=C0;if(C0)C0.vide();FX2.corps.budget=9;FX2.nitL=(FX2.nitL|0)+k.nitL;FR.on=false;FR.lift=0;FR.vols++;}
/* LE DÉCOLLAGE AU MANCHE (2026-10-19, Léo : « chaque figure qui fait un saut en l'air — seulement quand la voiture est en l'air — laisse au
   joueur l'opportunité de décoller de la route avec le joystick qui oriente le nez vers le haut » ; au questionnaire : un geste PENDANT le
   bond, puis la caisse monte COMME UN AVION). Pendant le bond d'une figure sur la route, le manche du VOL poussé au-delà de la moitié de sa
   course (`frNez` = la lecture de pitT/wPitch : pouce HAUT par défaut, BAS en réglage PLONGE, ↓ au clavier) fait DÉCOLLER : startFall part
   d'où la caisse EST (le bond compris, `k.lift` de frDecolle), avec la vitesse du bond ; la figure continue en l'air (frDecolle/frVersVol)
   et se paie à SA pose ; tenu, le même manche fait monter la caisse (le cabré du vol tourne la trajectoire) ; lâché, elle retombe. Un vrai vol.
   · LE GESTE NEUF : le pouce déjà poussé au double-tap (il CHOISIT la figure avant) ne compte pas — il doit repasser sous `arme` (30 %)
     avant de repousser au-delà de `seuil` (55 %). Sans geste, rien ne change : la figure reste sur la route (le choix de Sacha du 17/10).
   · Seulement EN L'AIR (le bond ≥ `haut`, 20 cm). Pas sous la dalle (pendue à la route, décoller = tomber dans le vide : comme le saut
     nitro), ni à l'auto-école, ni pendant un rebond (hopY, la pose qui se tasse), ni pendant le demi-tour.
   · Gratuit (la figure a payé ses 20 %) ; la pose rend la nitro d'un SAUT NITRO (`VEQ.sautF`) ; le volant n'est pas verrouillé.
   `?fdecolle=0` = sans. Console : `dbgFDecolle()` (l'état), `dbgFDecolle(v)` = le manche forcé à v (null : rend la main au pouce). */
const FDC={ok:!/[?&]fdecolle=0\b/.test(location.search),arme:.3,seuil:.55,haut:.2,imp:6,a:false,n:0,force:null,dv:0,lift:0};
function frNez(){if(FDC.force!=null)return FDC.force; // le manche du vol lu sur la route : +1 = le nez en HAUT (le cabré), comme pitT/wPitch en vol
  if(TCTL.act)return -TCTL.sv*volSens()*volInv();return volInv()*((keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.KeyZ||keys.ArrowUp?1:0));}
function frEnvol(){ // (frTick, chaque image du bond) le manche tiré : la caisse quitte la route — true : elle vole
  const u=frNez();if(u<FDC.arme){FDC.a=true;return false;}
  if(!FDC.ok||!FDC.a||u<FDC.seuil||!FR.on||mode!=='drive'||FR.lift<FDC.haut||side<0||TUTO.on||hopY>0||hopV!==0||POSE_F||DMT.act)return false;
  const x=Math.min(1,FR.t/FR.T),vb=FR.H*4*(1-2*x)/Math.max(.1,FR.T)/SPD; // la vitesse du bond, dans les unités du vol (la position avance de fallVel × SPD)
  FDC.dv=Math.max(FDC.imp,vb);FDC.lift=FR.lift;FDC.a=false;FDC.n++;
  startFall(FDC.dv,1);VEQ.sautF=flightId;VEQ.l0=0; // un décollage VOULU : comme le saut nitro, le volant tenu continue de tourner, la pose rend la nitro d'un saut
  return true;}
window.dbgFDecolle=function(v){if(v!==undefined)FDC.force=v==null?null:+v;
  return {ok:FDC.ok,arme:FDC.a,nez:+frNez().toFixed(2),force:FDC.force,decolles:FDC.n,dv:+FDC.dv.toFixed(1),liftDecolle:+FDC.lift.toFixed(2),route:FR.on,lift:+FR.lift.toFixed(2),
    mode:mode,vol:mode==='fall'?+fallTR.toFixed(2):0,haut:mode==='fall'?+fallPos.y.toFixed(1):null};};
window.dbgFRoute=function(x,y){if(x!=null){FDIR.force=[+x||0,+y||0];let r;try{r=veqDouble();}finally{setTimeout(function(){FDIR.force=null;},250);}
    return {ok:!!r,route:FR.on,mode:mode,fig:FR.on&&FR.f?FR.f.id:null,saut:!FR.on&&mode==='fall',nit:+(nitroR+nitroX).toFixed(2)};}
  const C=FR.C;return {ok:FR.ok,on:FR.on,mode:mode,fig:FR.f?FR.f.id:null,t:+FR.t.toFixed(2),T:+FR.T.toFixed(2),H:+FR.H.toFixed(2),lift:+FR.lift.toFixed(2),liftMax:+FR.liftMax.toFixed(2),
    ecart:C?Math.round(C.ecart()*57.3):0,ecFin:FR.ecFin==null?null:FR.ecFin,lances:FR.n,finies:FR.fini,versVol:FR.vols,payees:FX2.payees|0,nit:+(nitroR+nitroX).toFixed(2)};};
function figCvX(){const c=FX2.cv;return c.n?Math.min(IMPU.xMax,1+IMPU.xVar*(c.dist-1)+IMPU.xRep*(c.n-c.dist)):1;}
function figCvTxtX(x){return '×'+String(Math.round(x*100)/100).replace('.',LANG==='en'?'.':',');}
function figCvNote(f,reps){if(!f)return;const c=FX2.cv;c.n++;if(!c.ids[f.id]){c.ids[f.id]=1;c.dist++;}
  c.noms.push(figNom(f,reps));c.cle=''; // (le maillon sonne déjà : addTrick → trickPop, et figPaye vibre)
  if(c.n>=2)fovPunch=Math.max(fovPunch,3+Math.min(4,figCvX()));}
function figCvRaz(){const c=FX2.cv;c.n=0;c.dist=0;c.ids={};c.noms.length=0;c.cle='raz';} // (≠ '' : le HUD repasse et s'éteint — MESURÉ au banc, il restait affiché après la pose)
function figComboEncaisse(){const c=FX2.cv;if(c.n<2||!(FX2.pts>0)){if(c.n===1&&FX2.pts>0)fhFin(true);figCvRaz();return;} // (à la pose propre) le combo du vol s'encaisse — (HUD v3) une figure seule s'envole aussi vers la chaîne
  const x=figCvX(),bonus=Math.round(FX2.pts*(x-1));let p=0;
  if(bonus>0)try{p=chaineAuraMuette('COMBO '+figCvTxtX(x),bonus,'combovol',true,false);}catch(e){} // (HUD v3) muette au-dessus de la caisse : la ligne du combo s'envole vers la chaîne, où « COMBO ×N +X » s'écrit
  hap([14,30,14,30,40]);figCvFin(true,p);}
function figCvFin(ok){fhFin(ok);figCvRaz();} // (HUD des figures v3) la pose : encaissé (la ligne s'envole) ou perdu (elle tombe)
