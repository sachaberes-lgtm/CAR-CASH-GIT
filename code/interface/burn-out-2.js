/* LA CAISSE DANS LA FUMÉE (2026-10-08, Léo : « ce n'est plus le doigt qui agit sur la fumée, mais bien la voiture elle-même »). Chaque image,
   la carrosserie (une boîte à sa taille, `garGabarit`, élargie de `m`) agit sur les bouffées qu'elle touche : (1) elle les ÉCARTE — une
   bouffée entrée dans la boîte en sort par la face la plus proche, d'autant plus vite qu'elle y est enfoncée (la fumée ne traverse plus la
   caisse) ; (2) elle les ENTRAÎNE — la vitesse de la carrosserie à cet endroit (son glissement + sa ROTATION : ω × r, plus vive au bout de la
   caisse qu'au pivot) passe dans la bouffée : en dérapage la poupe la balaie, en donut la caisse la fait tourner autour d'elle. Les cubes
   du volume suivent leurs bouffées. */
const BURN_CAISSE={suit:.65,pousse:3.5};
const BURN_NUAGE={arriere:3,v0:2.2,v1:2,cote:.7,flanc:.3,fa0:.3,fa1:1.1,fc0:1.4,fc1:1.6}; // (même soir, Léo : « de la fumée aussi sur le côté ») 30 % des bouffées sortent PAR LE FLANC de leur roue (1,4-3 m/s vers l'extérieur, ,3-1,4 vers l'arrière : deux panaches de côté, comme un vrai burn-out), les autres comme avant (côté ≤ ,7), et la poupe ne pousse plus que ×3 vers l'arrière (×4). Avant : (2026-10-08, Léo : « le nuage plus orienté vers l'arrière, mais c'est bien un peu sur le côté ») MESURÉ avant : les jeunes bouffées filaient à 1,7 m/s sur le côté pour 0,55 vers l'arrière (la caisse les sortait par ses flancs, les roues y sont) — à l'arrière de la caisse la sortie penche ×4 vers l'arrière ; au pneu, lancées à 2,2-4,2 m/s vers l'arrière et ≤ ,55 m/s sur le côté (c'était 1,5-3,2 et ≤ ,9) // (même jour, Léo : « pas autant que le doigt, mais assez pour que ça ait du dynamisme ») la fumée prend 65 % de la vitesse de la carrosserie (elle la balaie sans la coller), et en est écartée en douceur
function burnCaisse(dt){
  const F=BURN.fum;if(!F||!F.o.visible||!(dt>0)||!carGroup.visible)return;
  carGroup.updateMatrixWorld();const p=carGroup.getWorldPosition(BURN.w),ry=carGroup.rotation.y;
  if(!BURN.cp0){BURN.cp0=new THREE.Vector3().copy(p);BURN.cr0=ry;return;}
  const vx=Math.max(-12,Math.min(12,(p.x-BURN.cp0.x)/dt)),vz=Math.max(-12,Math.min(12,(p.z-BURN.cp0.z)/dt));
  let dr=ry-BURN.cr0;dr=Math.atan2(Math.sin(dr),Math.cos(dr));const w=Math.max(-14,Math.min(14,dr/dt));BURN.cp0.copy(p);BURN.cr0=ry;
  if(GAR.go)return;
  let G=null;try{G=garGabarit();}catch(_){}if(!G||!G.a)return;
  const sc=carGroup.scale.x||1,m=.35,ha=G.a*sc+m,hb=G.b*sc+m,ht=p.y+(G.H||1.3)*sc+.25,R2=(ha*ha+hb*hb),c=Math.cos(ry),sn=Math.sin(ry),ke=Math.min(1,dt*6),K9=BURN_CAISSE;
  for(let i=0;i<F.N;i++){if(F.age[i]>=F.life[i])continue;const j=i*3,dx=F.P[j]-p.x,dz=F.P[j+2]-p.z;
    if(dx*dx+dz*dz>R2||F.P[j+1]>ht)continue;
    const lx=dx*c-dz*sn,lz=dx*sn+dz*c,qx=hb-Math.abs(lx),qz=ha-Math.abs(lz);if(qx<=0||qz<=0)continue; // dehors : rien
    const f=Math.min(1,Math.min(qx,qz)/m);                                 // enfoncée de combien
    const wx=1/(qx+.05),wz=(lz<0?BURN_NUAGE.arriere:1)/(qz+.05),sx=lx<0?-1:1,sz=lz<0?-1:1,nl=Math.hypot(wx,wz); // la face la plus proche — et, à l'ARRIÈRE de la caisse, surtout l'arrière (le nuage part derrière)
    const nx=(sx*wx*c+sz*wz*sn)/nl,nz=(-sx*wx*sn+sz*wz*c)/nl;              // (repère caisse → salle)
    const cvx=(vx+w*dz)*K9.suit,cvz=(vz-w*dx)*K9.suit;                       // la carrosserie à cet endroit : glissement + rotation (ω × r) — la fumée en prend une PART
    const pu=(1.2+.35*Math.hypot(cvx,cvz))*f;                               // (1) elle l'écarte
    F.V[j]+=(cvx-F.V[j])*ke*f+nx*pu*ke*K9.pousse;F.V[j+2]+=(cvz-F.V[j+2])*ke*f+nz*pu*ke*K9.pousse; // (2) elle l'entraîne
    F.V[j+1]+=.25*f*ke;}
}
function burnTick(dt){ // chaque image du garage (après la pose de la caisse, avant la caméra)
  const now=performance.now(),t=now*.001;
  if(!BURN.pret){BURN.pret=true;try{chauffeRendu(burnPools());}catch(e){}} // (2026-10-08) à la 1re image du garage : la fumée en pixels et ses cubes compilés pendant l'entrée — la chauffe de l'atelier au menu ne tourne plus toujours (mesuré : jamais sur l'écran titre de la chute), et le 1er burn-out compilait
  if(BURN.hold&&!BURN.on&&!BURN.bouge&&now-BURN.hold.t0>BURN_TENU){if(!BURN.hold.non){const b9=!!BURN.hold.bouge;burnPart();if(b9){BURN.bouge=true;GAR.platW=0;}}else if(!BURN.hold.dit){BURN.hold.dit=1;burnRefus();}} // (2026-10-08) parti en tournant le plateau : le doigt qui bouge DÉRAPE aussitôt
  {const c9=BURN.hold&&!BURN.on&&!BURN.hold.non&&!GAR.go?Math.max(0,Math.min(1,(now-BURN.hold.t0-BURN_TENU*.25)/(BURN_TENU*.75))):0; // LA CHARGE : le dernier ¾ du maintien, le moteur monte
    if(c9>0&&!BURN.chg)burnPrepare(); // (2026-10-09) la charge démarre : les essieux de LA caisse du moment (elle a pu changer depuis le dernier burn-out) — sinon l'arrière ne patinait pas pendant la charge
    BURN.chg=c9>BURN.chg?c9:BURN.chg+(c9-BURN.chg)*Math.min(1,dt*6);
    if(c9>0&&!REDUCED_MOTION&&now>BURN.hapT){BURN.hapT=now+200-130*c9;hap(c9>.7?6:3);}}   // le pouce la sent venir : des tics de plus en plus serrés // (même soir) 0,28 s, (2026-10-08) 0,8 s : un glissé lent qui démarre doucement reste le PLATEAU
  if(BURN.auto>0&&dt>0){BURN.auto-=dt;if(BURN.autoW)burnVolant(BURN.autoW*dt);if(BURN.auto<=0)burnFin();} // (le banc) un doigt qui tourne à autoW rad/s
  if(GAR.go||!garAtelierLibre())if(BURN.on)burnFin();
  {const kc=BURN.on?1:BURN.chg*.42;BURN.k+=(kc-BURN.k)*Math.min(1,dt*(kc>BURN.k?5:2.6));if(BURN.k<.002&&!BURN.on&&!BURN.chg)BURN.k=0;} // (la charge) elle tremble déjà, les pneus patinent et fument un peu, les feux stop s'allument
  burnNitroTick(dt,now);
  if(BURN.on)BURN.t+=dt;
  BURN.chaud=Math.max(0,Math.min(1,BURN.chaud+(BURN.on?dt*.34:-dt*.22)));
  const k=BURN.k;
  burnDerape(dt);try{burnTours(dt);}catch(_){}
  if(BURN.on&&!BURN.bouge&&BURN.t>1.4&&!BURN.aideT&&!((SAVE.d.ast|0)&16)){BURN.aideT=1;burnTxt('TOURNE AUTOUR · DONUT','#b9a8ff',true);} // l'astuce, une fois par session, tant qu'aucun donut n'a tourné
  BURN.cad+=(((BURN.on||Math.abs(BURN.yawV)>1)&&!GAR.go?Math.max(BURN.donH||0,Math.min(1,BURN.pivK*Math.hypot(BURN.qx,BURN.qz)/1.2)):0)-BURN.cad)*Math.min(1,dt*(BURN.nk>.05||BURN.rk>.05?4.5:2.2)); /* (la nitro) elle bondit vers l'objectif : la vue recule aussi vite */if(BURN.cad<1e-3)BURN.cad=0; // en donut, la vue recule (garBurnR)
  BURN.feuxK=GAR.go?0:k;                                                  // on tient le frein : les feux stop s'allument (carVit)
  // LA CAISSE
  if(k>0&&!GAR.go){
    const sp=46*k*dt*(1+.6*BURN.nk)*(1-2*BURN.rk);for(const E of BURN.ar)E.rotation.x+=sp;for(const w of BURN.arW)w.rotation.x+=sp; // l'arrière patine, l'avant est planté — plus vite à la NITRO, à l'envers en MARCHE ARRIÈRE
    const tr=REDUCED_MOTION?.3:1;
    carBody.rotation.x=-.042*k+Math.sin(t*37)*.004*k*tr;               // le cul s'écrase, le nez se lève
    carBody.rotation.z=Math.sin(t*29+1.3)*.007*k*tr;                    // elle tremble sur ses pneus
    carBody.position.y=-.025*k+(Math.random()-.5)*.012*k*tr;
    carGroup.rotation.y+=Math.sin(t*2.3+Math.sin(t*5.1))*.036*k*tr;     // la poupe chasse
    BURN.corps=true;
    if(BURN.on&&!REDUCED_MOTION&&now>BURN.hapT){BURN.hapT=now+150;hap(4);}
  }else if(BURN.corps){carBody.rotation.set(0,0,0);carBody.position.set(0,0,0);BURN.corps=false;}
  // LA FUMÉE ET LE FEU
  if(k>.02&&BURN.fum&&!GAR.go){
    carGroup.updateMatrixWorld();
    const ry=carGroup.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry);
    const db9=(BURN_FUM.deb[0]+BURN_FUM.deb[1]*BURN.chaud)*(1+BURN_NITRO.fumee*BURN.nk),av9=1-2*BURN.rk;BURN.tE+=dt*k*db9;BURN.deb=(BURN.deb||0)+(k*db9-(BURN.deb||0))*Math.min(1,dt*2); // le débit lissé (l'horizon)
    while(BURN.tE>=1){BURN.tE-=1;const r=BURN.roues[(Math.random()*BURN.roues.length)|0],o=burnMonde(r.x+(Math.random()-.5)*r.l,r.y+.08,r.z-r.R*.55,BURN.q),
        sd=r.x<0?-1:1,sx=fz*sd,sz=-fx*sd,N9=BURN_NUAGE,fl=Math.random()<N9.flanc,                // (2026-10-08) plus vers l'arrière, un peu sur le côté — et une part qui sort PAR LE FLANC
        v=fl?N9.fa0+Math.random()*N9.fa1:N9.v0+Math.random()*N9.v1,l=fl?N9.fc0+Math.random()*N9.fc1:Math.random()*N9.cote,gr=.84+Math.random()*.12;
      burnEmet(BURN.fum,o.x,o.y,o.z,-fx*v*av9+sx*l,.25+Math.random()*.75,-fz*v*av9+sz*l,5.8+Math.random()*4.2,.34+Math.random()*.24,1.05+Math.random()*.5+.45*BURN.chaud,
        .2+Math.random()*.16,gr*.86,gr*.84,gr*.93);}
    if(NYAN.on&&BURN.pix){BURN.tP+=dt*k*(240+170*BURN.chaud); // (2026-10-06) LE CHAT : à la place des braises, les roues giclent des PIXELS multicolores qui scintillent
      while(BURN.tP>=1){BURN.tP-=1;const r=BURN.roues[(Math.random()*BURN.roues.length)|0],o=burnMonde(r.x+(Math.random()-.5)*r.l,r.y+.1,r.z-r.R*.5,BURN.q),v=1.5+Math.random()*3,c=nyanPixC();
        burnEmet(BURN.pix,o.x,o.y,o.z,-fx*v+(Math.random()-.5)*2.6,1.2+Math.random()*3.2,-fz*v+(Math.random()-.5)*2.6,.8+Math.random()*.9,.15+Math.random()*.14,0,1,c[0],c[1],c[2]);}}
    else BURN.tF+=dt*k*(BURN.chaud>.45?(BURN.chaud-.45)*70:0);
    while(BURN.tF>=1){BURN.tF-=1;const r=BURN.roues[(Math.random()*BURN.roues.length)|0],o=burnMonde(r.x,r.y+.05,r.z-r.R*.3,BURN.q),v=2+Math.random()*4;
      burnEmet(BURN.feu,o.x,o.y,o.z,-fx*v+(Math.random()-.5)*2,1+Math.random()*2.2,-fz*v+(Math.random()-.5)*2,.35+Math.random()*.4,.05+Math.random()*.05,0,1,1,.5+Math.random()*.4,.15);}
  }
  while(BURN.pops.length&&now>=BURN.pops[0]){BURN.pops.shift();burnPop(.8);try{if(sfxOk()){const e=ENG_SND[engLvl<0?0:engLvl]||ENG_SND[0];crackle(Math.max(.35,e.crk));}}catch(_){}}
  if(BURN.fum)BURN.fum.o.material.uniforms.uPx.value=Math.max(2,Math.round(5*renderer.getPixelRatio()));
  try{burnCaisse(dt);}catch(e){if(!burnTick._k){burnTick._k=1;console.warn('burn-out : caisse',e);}} // la CAISSE pousse la fumée (plus le doigt)
  if(!(k>.02&&BURN.fum&&!GAR.go))BURN.deb=(BURN.deb||0)*Math.exp(-dt*1.5);   // plus de pneus : le débit retombe
  {const h9=BURN.fum?.92*BURN.fum.N/Math.max(1,BURN.deb||0):1e9;BURN.hor=BURN.hor||h9;BURN.hor+=(h9-BURN.hor)*Math.min(1,dt*(h9<BURN.hor?3:.25));} // L'HORIZON : vite plus court, lentement plus long
  for(const F of [BURN.fum,BURN.feu,BURN.pix])if(F&&F.o.visible)burnPas(F,dt,t);
  try{burnCubes();}catch(e){if(!burnTick._c){burnTick._c=1;console.warn('burn-out : cubes',e);}} // le VOLUME de la fumée : ses cubes
  try{burnGomme(dt);}catch(e){}
  try{burnSon(dt);}catch(e){if(!burnTick._w){burnTick._w=1;console.warn('burn-out : son',e);}}
}
/* LE DÉRAPAGE (même soir, Léo : « seulement si on appuie longtemps sur la voiture et qu'ensuite on glisse le doigt, la voiture commence à
   déraper en fonction, mais ne tombe jamais vraiment de la plateforme »). En burn-out, le glissé du doigt fait tourner la caisse SUR le
   plateau (`BURN.cib`, ,009 rad par pixel, dans le sens du plateau au doigt) ; elle suit par un ressort MOU, un peu sous-amorti (ω 7 — 9 depuis le 08/10, `BURN_RESSORT` —, ζ ,5 :
   elle part, dépasse, revient — ça glisse), autour d'un PIVOT vers l'avant (`drz` : l'arrière balaie, comme un donut) ; sa vitesse de
   rotation la pousse un peu dehors (±,35 m). BORNÉE : le centre ne s'écarte jamais de plus de 4,3 m − le rayon de la caisse — ses coins
   restent sur le disque. Lâchée, elle se RECENTRE en ~0,7 s en gardant le cap qu'on lui a donné ; puis ce cap est VERSÉ dans le plateau
   (`garageAng` et `GAR.podSpin` bougent d'autant : à l'écran rien ne saute) — JOUER repart d'une caisse alignée. */
/* (2026-10-08, Léo : « dans le premier essai la voiture bougeait un peu plus, elle s'éloignait un peu sur le bord, et c'était stylé — peut-on
   le récupérer sans tout casser ? ») Au premier essai le PIVOT restait DEVANT la caisse : en tournant, son centre décrit un cercle autour de
   ce point et part vers le bord (jusqu'à ~2·`drz`, ~1,8 m). Les donuts l'avaient fait glisser au CENTRE du plateau (`donM` → 1 : la caisse
   restait au milieu). Désormais il n'y glisse qu'au quart (`DON_PIV.donMax`), la vitesse la pousse un peu plus dehors (`glisse` ,35 → ,55 m),
   et la vue recule d'après l'état « donut » (`donH`) pour la garder dans le cadre (`BURN.Rs`). La borne du disque reste (4,3 m − son rayon). */
const DON_PIV={donMax:.25,glisse:.42,kGlisse:.16}; // glisse ,55 → ,42 (même soir : des donuts moins violents)
const BURN_RESSORT={om:8,ze:.5,genou:4,frein:40}; // (même soir, Léo : « moins violent, les tours de donuts ») au-delà de `genou` rad/s un FREIN progressif (`frein` /s sur l'excès) : MESURÉ avant, un doigt rapide la faisait tourner à 11 rad/s (près de 2 tours/s), le centre balayant à 12-14 m/s ; le doigt plus vite que ça : ce qui dépasse est perdu (`DON.avance`)
/* LA CAISSE SE BALADE (2026-10-08, Léo : « quand on le fait vite, ça fait un peu générique, un peu la même chose » · « la voiture ne se
   balade plus assez avec le burn-out »). MESURÉ avant : six gestes rapides (cercle, petits cercles, zigzag, huit, fouet, gribouillis) — la
   caisse tournait autour d'un pivot FIXE (,9 m devant elle) et touchait chaque fois le même bord (1,74 m du centre) : un seul cercle,
   quel que soit le geste. Désormais le pivot VOYAGE (`BURN.qx/qz`, un ressort lourd, ω `om`, ζ `ze`) : (1) vers la MOITIÉ (`suit`) de
   l'endroit où le doigt touche le plateau (`burnSol`) — on l'emmène où on veut, elle traîne et glisse derrière ; (2) les roues arrière la
   POUSSENT dans son axe d'autant plus qu'elle tourne (`pousse` m/s², pleine à 4 rad/s) : le donut MARCHE, il ne reste plus sur place ;
   (3) au bord du plateau elle RENCONTRE le bord, y perd sa vitesse vers l'extérieur et en rebondit un peu (`rebond`). Tenue sans bouger :
   elle reste sur place (le burn-out d'origine). Lâchée : elle revient au centre avec le reste (`pivK`). */
/* LA NITRO ET LA MARCHE ARRIÈRE (2026-10-08, Léo : « ajoute dans les capacités du burn-out : en reculant, et la nitro »). Pendant le
   burn-out, deux touches tenues (l'autre pouce, comme NITRO en course ; au clavier ESPACE / N et ↓ / R) :
   · NITRO (`BURN.nk`, lissé) : le feu SORT DES POTS (bleu au cœur, orange au bout), la fumée ×(1 + `fumee`), les pneus patinent plus vite,
     le moteur au plafond, elle tourne plus fort (`tourne`) et BONDIT devant (`pousse` m/s², vitesse ×(1 + `vit`)) ; à l'appui un coup de
     souffle (boostSnd), au lâcher la pétarade.
   · MARCHE ARRIÈRE (`BURN.rk`) : les roues tournent à l'envers et soufflent la fumée vers l'AVANT, elle RECULE (`recul` m/s² — seule
     exception à « elle ne recule jamais »), le pivot passe derrière (c'est l'avant qui balaie : le donut en marche arrière). Les deux
     ensemble : elle recule fort. Le ressort du doigt se relâche pendant l'une ou l'autre : elle file, puis revient sous le doigt. */
const BURN_NITRO={fumee:.6,tourne:.2,pousse:1.8,recul:1.7,vit:.3,feu:110,lache:.45,boutons:false}; // (même soir, Léo : « enlève les boutons ») plus de touches à l'écran (`boutons` : true les rend) — restent ESPACE / N et ↓ / R au clavier // (même soir, Léo : « reviens sur celle d'avant, juste un peu moins violent, et le suivi moins dénaturé ») MESURÉ en v187 (pousse 3, recul 2,6, vit ,7, ressort relâché ×(1 − ,78), tour ajouté au CAP) : la NITRO jetait la caisse à 7-8 m/s jusqu'au bord, et après elle la caisse restait décalée de ~100° sur le doigt (le tour en plus s'ajoutait pour de bon au cap visé) — désormais `tourne` = une AVANCE passagère (rad, `BURN.nAv`) qui retombe au lâcher, poussées et vitesse plus douces, le ressort du doigt ne se relâche plus que de `lache`
function burnBtnsVoir(on){
  let b=BURN.btn;
  if(!b){if(!on)return;b=BURN.btn=document.createElement('div');b.id='gBurnBtns';b.setAttribute('aria-hidden','true');if(!TEL_NATIF)b.classList.add('clavier');
    b.innerHTML='<button type="button" class="gbB" id="gbRecul"><i class="pxi pxi-bas"></i><span data-fr="ARRIERE">'+TR('ARRIERE')+'</span><small>R</small></button>'+
      '<button type="button" class="gbB" id="gbNitro"><i class="pxi pxi-eclair"></i><span>NITRO</span><small>'+TR('ESPACE')+'</small></button>';
    document.body.appendChild(b);
    for(const [id,k] of [['gbNitro','nitro'],['gbRecul','recul']]){const el=b.querySelector('#'+id);
      const fin=function(e){if(el._p!=null&&e.pointerId===el._p){el._p=null;BURN[k]=false;el.classList.remove('on');}};
      el.addEventListener('pointerdown',function(e){e.stopPropagation();e.preventDefault();if(!BURN.on)return;el._p=e.pointerId;try{el.setPointerCapture(e.pointerId);}catch(_){}BURN[k]=true;el.classList.add('on');});
      el.addEventListener('pointerup',fin);el.addEventListener('pointercancel',fin);el.addEventListener('lostpointercapture',fin);
      el.addEventListener('click',function(e){e.stopPropagation();});}}
  if(b._on!==on){b._on=on;b.classList.toggle('on',on);if(!on)for(const el of b.children){el._p=null;el.classList.remove('on');}}
}
addEventListener('keydown',function(e){if(!garageOn||!BURN.on)return; // (en CAPTURE : un bouton du garage resté sous le focus ne prend pas l'ESPACE)
  const n9=e.code==='Space'||e.code==='KeyN',r9=e.code==='ArrowDown'||e.code==='KeyR'||e.code==='KeyS';if(!n9&&!r9)return;e.preventDefault();e.stopPropagation();if(e.repeat)return;
  if(n9)BURN.nitro=true;else BURN.recul=true;
  const el=BURN.btn&&BURN.btn.querySelector(n9?'#gbNitro':'#gbRecul');if(el)el.classList.add('on');},true);
addEventListener('keyup',function(e){
  if(e.code==='Space'||e.code==='KeyN'){BURN.nitro=false;const el=BURN.btn&&BURN.btn.querySelector('#gbNitro');if(el&&el._p==null)el.classList.remove('on');}
  else if(e.code==='ArrowDown'||e.code==='KeyR'||e.code==='KeyS'){BURN.recul=false;const el=BURN.btn&&BURN.btn.querySelector('#gbRecul');if(el&&el._p==null)el.classList.remove('on');}},true);
try{Object.assign(I18N,{'ARRIERE':'REVERSE','ESPACE':'SPACE'});}catch(e){}
function burnNitroTick(dt,now){
  burnBtnsVoir(BURN_NITRO.boutons&&BURN.on&&!GAR.go);
  const n0=BURN.nk>.5,nv=BURN.on&&BURN.nitro&&!GAR.go?1:0,rv=BURN.on&&BURN.recul&&!GAR.go?1:0;
  BURN.nk+=(nv-BURN.nk)*Math.min(1,dt*(nv?8:3.5));BURN.rk+=(rv-BURN.rk)*Math.min(1,dt*(rv?4:3));
  if(BURN.nk<.002&&!nv)BURN.nk=0;if(BURN.rk<.002&&!rv)BURN.rk=0;
  if(nv&&!BURN.nwas){BURN.nwas=true;BURN.chaud=Math.max(BURN.chaud,.75);try{burnPop(1.2);}catch(_){}try{if(sfxOk())boostSnd(1.15);}catch(_){}hap([12,20,14]);}
  else if(!nv&&BURN.nwas){BURN.nwas=false;const n=now;BURN.pops.push(n+60,n+210,n+400);BURN.pops.sort(function(a,b){return a-b;});}
  if(BURN.nk>.03&&nv)BURN.chaud=Math.min(1,BURN.chaud+dt*.8);
  {const av=BURN.on&&Math.abs(BURN.don)>.5?Math.sign(BURN.don)*BURN_NITRO.tourne*BURN.nk:0;BURN.nAv=(BURN.nAv||0)+(av-(BURN.nAv||0))*Math.min(1,dt*4);} // elle tourne un peu DEVANT le doigt — une avance qui retombe (jamais ajoutée au cap visé : le doigt reste le maître)
  if(BURN.nk>.02&&BURN.feu&&BURN.pots.length&&!GAR.go){const ry=carGroup.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry);carGroup.updateMatrixWorld(); // LE FEU DES POTS
    BURN.nE+=dt*BURN_NITRO.feu*BURN.nk;
    while(BURN.nE>=1){BURN.nE-=1;const p=BURN.pots[(Math.random()*BURN.pots.length)|0],o=burnMonde(p[0],p[1],p[2],BURN.q),v=5+Math.random()*6,bl=Math.random()<.35;
      burnEmet(BURN.feu,o.x,o.y,o.z,-fx*v+(Math.random()-.5)*1.2,.2+Math.random()*.9,-fz*v+(Math.random()-.5)*1.2,.16+Math.random()*.22,.14+Math.random()*.14,0,1,bl?.45:1,bl?.6:.62+Math.random()*.35,bl?1:.2);}
    if(!REDUCED_MOTION&&now>BURN.hapT){BURN.hapT=now+90;hap(5);}}
}
const BURN_BALADE={recentre:.9,tauR:.8,revient:.5,suit:.33,om:2.9, /* (même soir, Léo : « pourquoi la voiture s'avance sans cesse devant pendant le burn-out ») MESURÉ : 1-1,3 m vers l'avant en 3 s de balancé ou de donut, même sans poussée, sans doigt-cible, sans cliquet — c'est le PIVOT DEVANT : tournée de y, son centre passe à dz(1 − cos y) devant (,9 m à 90°, 1,8 m retournée). Le pivot reste devant (l'arrière balaie sur le moment), mais la balade le RAMÈNE : la cible retranche `recentre` × ce décalage moyen sur `tauR` s, et elle peut y revenir à `revient` m/s vers son arrière (sinon « elle ne recule jamais » bloquait le retour : un cliquet vers l'avant) */ ze:.8,pousse:2.2,rebond:0,bord:4.3,vmax:2.2}; // (même soir, Léo : « faut pas qu'elle recule non plus, là c'est trop violent ») ω 4,2 → 3,2, ζ ,5 → ,8 (plus de dépassement), suit ,5 → ,4, pousse 3,2 → 2,2, plus de rebond, vitesse ≤ 2,2 m/s — et JAMAIS vers l'arrière de la caisse ; puis (« le juste milieu ») suit ,4 → ,33, ω 3,2 → 2,9 : elle chasse un peu moins le doigt, un peu plus lourde
function burnBord(cx,cz,y){ // de combien rapprocher le centre (cx, cz) pour que les 4 coins de la caisse (cap y) restent à `bord` m du centre du plateau
  const a=BURN.ga||2.2,b=BURN.gb||1,R=BURN_BALADE.bord,co=Math.cos(y),si=Math.sin(y);
  const loin=function(f){let m=0;for(let i=0;i<4;i++){const x=(i&1?b:-b),z=(i&2?a:-a),px=f*cx+x*co+z*si,pz=f*cz-x*si+z*co,d=px*px+pz*pz;if(d>m)m=d;}return Math.sqrt(m);};
  if(loin(1)<=R)return 1;if(loin(0)>R)return 0;let lo=0,hi=1;for(let k=0;k<9;k++){const md=(lo+hi)/2;if(loin(md)<=R)lo=md;else hi=md;}return lo;
} // (2026-10-08, Léo : « la voiture qui suit encore un peu plus ») le ressort qui tire la caisse vers le doigt, ω 7 → 9 : MESURÉ, un doigt qui tourne à 3 rad/s la traînait de 27° (48° à 6 rad/s) — à ω 9, ~20° (~33°) ; puis (même soir, Léo : « ça suit presque TROP — le juste milieu entre satisfaisant et maniable ») ω 8 : le juste milieu entre 7 et 9 ; même amorti (ζ ,5 : elle dépasse un peu, ça glisse)
function burnDerape(dt){
  const d9=Math.min(dt,.1),n=Math.max(1,Math.ceil(d9/.008)),h=d9/n,om=BURN_RESSORT.om,ze=BURN_RESSORT.ze;
  const gn=BURN_RESSORT.genou,fr=BURN_RESSORT.frein;
  for(let i=0;i<n;i++){BURN.yawV+=(om*om*(BURN.cib+(BURN.nAv||0)-BURN.yaw)-2*ze*om*BURN.yawV)*h;const ex=Math.abs(BURN.yawV)-gn;if(ex>0)BURN.yawV-=Math.sign(BURN.yawV)*ex*Math.min(1,fr*h);BURN.yaw+=BURN.yawV*h;} // (les donuts) le frein au-delà du genou
  if(Math.abs(BURN.yaw)>Math.PI){const s2=2*Math.PI*Math.round(BURN.yaw/(2*Math.PI));BURN.yaw-=s2;BURN.cib-=s2;} // (le donut) les tours se replient : la caisse est la même
  BURN.don+=(BURN.yawV-BURN.don)*Math.min(1,dt*3);                       // (le donut) la rotation lissée : le compte des tours, la vue
  BURN.donK=BURN.on?Math.max(0,Math.min(1,(Math.abs(BURN.don)-.8)/2.2)):Math.max(0,BURN.donK-dt*2);
  BURN.donH=BURN.donH||0;BURN.donH+=((BURN.donK>.35?1:BURN.donK<.15?0:BURN.donH)-BURN.donH)*Math.min(1,dt*1.5);if(BURN.donH<1e-3&&BURN.donK<.15)BURN.donH=0; // l'état « donut » (la vue)
  BURN.donM=BURN.donH*DON_PIV.donMax;                                    // en donut, le pivot ne glisse plus qu'au QUART vers le centre : elle s'éloigne sur le bord
  const vise=BURN.on&&(BURN.bouge||BURN.nk>.05||BURN.rk>.05)&&!GAR.go?1:0; /* (2026-10-08) la NITRO et la MARCHE ARRIÈRE la font bouger même doigt immobile */BURN.pivK+=(vise-BURN.pivK)*Math.min(1,dt*(vise?6:(GAR.go?6:1.6)));
  {const B9=BURN_BALADE,lq=Math.max(0,B9.bord-(BURN.gb||1));let tx=0,tz=0;                // LA BALADE : le pivot voyage
    if(vise&&BURN.fsOk){tx=BURN.fsx*B9.suit;tz=BURN.fsz*B9.suit;const tl=Math.hypot(tx,tz);if(tl>lq){tx*=lq/tl;tz*=lq/tl;}}
    {const kR=Math.min(1,dt/B9.tauR);BURN.swAx=(BURN.swAx||0)+((BURN.swX||0)-(BURN.swAx||0))*kR;BURN.swAz=(BURN.swAz||0)+((BURN.swZ||0)-(BURN.swAz||0))*kR; // le décalage MOYEN du pivot devant…
      if(vise){tx-=B9.recentre*BURN.swAx;tz-=B9.recentre*BURN.swAz;}}                                                                         // …que la balade efface
    const N9=BURN_NITRO,tw=B9.pousse*Math.min(1,Math.abs(BURN.yawV)/4),ac=vise?(tw*(1+N9.tourne*BURN.nk)+N9.pousse*BURN.nk)*(1-BURN.rk)-BURN.rk*(N9.recul+N9.pousse*BURN.nk):0, // la NITRO pousse devant, la MARCHE ARRIÈRE tire derrière
      ax=Math.sin(BURN.yaw)*ac,az=Math.cos(BURN.yaw)*ac,lch=Math.max(BURN.nk,BURN.rk),om=B9.om*(1-N9.lache*lch),ze=B9.ze,vm=B9.vmax*(1+N9.vit*BURN.nk); // (le ressort du doigt se relâche : elle file vraiment, puis revient)
    const fx=Math.sin(BURN.yaw),fz=Math.cos(BURN.yaw);
    for(let i=0;i<n;i++){BURN.qvx+=(om*om*(tx-BURN.qx)-2*ze*om*BURN.qvx+ax)*h;BURN.qvz+=(om*om*(tz-BURN.qz)-2*ze*om*BURN.qvz+az)*h;
      if(vise){const vf=BURN.qvx*fx+BURN.qvz*fz,rm=-(B9.revient||0);if(vf<rm&&BURN.rk<.3){BURN.qvx-=(vf-rm)*fx;BURN.qvz-=(vf-rm)*fz;}                 // elle ne RECULE jamais : ce qui partirait vers son arrière est perdu (elle glisse de côté, ou avance)
        const vq=Math.hypot(BURN.qvx,BURN.qvz);if(vq>vm){BURN.qvx*=vm/vq;BURN.qvz*=vm/vq;}}
      BURN.qx+=BURN.qvx*h;BURN.qz+=BURN.qvz*h;}}
  if(BURN.yaw||BURN.pivK>=.001){
    const y=BURN.yaw,ar9=1-2*BURN.rk,dz=BURN.drz*ar9,s0=-Math.max(-DON_PIV.glisse,Math.min(DON_PIV.glisse,BURN.yawV*DON_PIV.kGlisse))*BURN.pivK,sl=s0*ar9; // (2026-10-08) EN MARCHE ARRIÈRE le pivot passe DERRIÈRE (c'est l'avant qui balaie) et la glisse s'inverse : elle tourne en reculant
    if(BURN.dzP!=null&&BURN.pivK>.05){const d9=dz-BURN.dzP,e9=s0*(ar9-(1-2*BURN.rkP)),pk=BURN.pivK;BURN.qx+=(d9*Math.sin(y)-e9*Math.cos(y)/pk);BURN.qz-=(d9*((1-BURN.donM)-Math.cos(y))-e9*Math.sin(y)/pk);} // le pivot change de bout SANS que la caisse saute : la balade absorbe le déplacement
    BURN.dzP=dz;BURN.rkP=BURN.rk; // (2026-10-08, Léo : « faut pas qu'elle recule ») la glisse de l'AUTRE côté du pivot : avant, ce décalage qui tourne avec la caisse la faisait partir EN MARCHE ARRIÈRE autour du cercle (glisse × rotation : 5,6 m/s en arrière à 10 rad/s) ; de ce côté-ci elle AVANCE et c'est l'arrière qui décroche — un vrai donut
    BURN.swX=-dz*Math.sin(y);BURN.swZ=dz*(1-BURN.donM)-dz*Math.cos(y);                                             // (le décalage du pivot devant, pour le recentrage)
    BURN.sl9=sl;
    let cx=BURN.pivK*(BURN.qx-dz*Math.sin(y))+Math.cos(y)*sl,cz=BURN.pivK*(BURN.qz+dz*(1-BURN.donM)-dz*Math.cos(y))-Math.sin(y)*sl; // le pivot : devant la caisse (le dérapage), au centre du plateau (le donut) — et là où la balade l'a emmené
    const c=Math.hypot(cx,cz),f9=burnBord(cx,cz,y);if(f9<1){cx*=f9;cz*=f9; // jamais hors du disque — ses QUATRE COINS (pas le cercle qui l'entoure : de côté elle va ~2,5 m au lieu de 1,74) : elle RENCONTRE le bord
      const ux=cx/Math.max(1e-6,c*f9),uz=cz/Math.max(1e-6,c*f9),vr=BURN.qvx*ux+BURN.qvz*uz;if(vr>0){const k9=1+BURN_BALADE.rebond;BURN.qvx-=k9*vr*ux;BURN.qvz-=k9*vr*uz;}
      const ex=c*(1-f9)/Math.max(.05,BURN.pivK);BURN.qx-=ux*ex*.5;BURN.qz-=uz*ex*.5;} // (et la balade n'insiste pas dehors)
    if(BURN.mes&&BURN.on){const M=BURN.mes;if(M.px!=null&&dt>0){const ym=M.py+Math.atan2(Math.sin(y-M.py),Math.cos(y-M.py))/2,vx=(cx-M.px)/dt,vz=(cz-M.pz)/dt,vf=vx*Math.sin(ym)+vz*Math.cos(ym),v=Math.hypot(vx,vz); // (le banc) recule-t-elle ? est-ce brutal ?
      M.n++;M.rec+=Math.max(0,-vf);M.recMax=Math.max(M.recMax,-vf);M.v+=v;M.vMax=Math.max(M.vMax,v);if(M.pv!=null)M.a.push(Math.hypot(vx-M.pvx,vz-M.pvz)/dt);M.pv=v;M.pvx=vx;M.pvz=vz;}M.px=cx;M.pz=cz;M.py=y;}
    const r=garRot(),cr=Math.cos(r),sr=Math.sin(r);
    carGroup.rotation.y+=y;carGroup.position.x+=cx*cr+cz*sr;carGroup.position.z+=-cx*sr+cz*cr;}
  if(GAR.go||(!BURN.on&&BURN.pivK<.01&&Math.abs(BURN.yawV)<.02)){ // APRÈS l'avoir posée : le cap est versé dans le plateau (à l'image suivante, rien ne saute)
    if(BURN.yaw){garageAng-=BURN.yaw;GAR.podSpin=(GAR.podSpin||0)-BURN.yaw;BURN.yaw=0;}
    BURN.cib=0;if(GAR.go)BURN.yawV=0;BURN.qx=BURN.qz=BURN.qvx=BURN.qvz=0;BURN.dzP=null;BURN.swX=BURN.swZ=BURN.swAx=BURN.swAz=0;}
}
function burnSon(dt){ // le VRAI moteur du palier, au rupteur, et le crissement de la course
  if(!AC||!osc||!gainN)return;
  const vivant=BURN.k>.004||BURN.rpm>.03||BURN.chg>0;
  if(!vivant||!sfxOk()){if(BURN.son){BURN.son=false;const T=AC.currentTime;stt(gainN.gain,0,T,.12);stt(engLfoG.gain,0,T,.12);if(skidG)stt(skidG.gain,0,T,.08);}return;}
  BURN.son=true;
  if(engLvl!==engTier)engSetTier(engTier);
  const e=ENG_SND[engLvl<0?0:engLvl]||ENG_SND[0],cib=BURN.on?.86+.12*BURN.nk-.08*BURN.rk:BURN.chg*.6; // (la charge) le moteur MONTE avant de partir · (la nitro) au plafond
  BURN.rpm+=(cib-BURN.rpm)*Math.min(1,dt*(cib>BURN.rpm?5.5:2.2));
  let rpm=BURN.rpm,cut=0;
  if(BURN.on&&BURN.t>.9){cut=Math.sin(BURN.t*2*Math.PI*8.2)>.35?1:0;rpm-=cut*.06;}   // LE RUPTEUR : l'allumage coupe, le régime bégaie
  if(cut&&!BURN.cut&&Math.random()<.2){try{crackle(Math.max(.25,e.crk*.6));}catch(_){}burnPop(.45);}
  BURN.cut=cut;
  engApplique(engSndParams(e,{rpm:rpm,charge:BURN.on?(cut?.35:.92):BURN.chg*.85,ovr:BURN.on||BURN.chg>.05?0:Math.min(1,BURN.rpm*1.8),drift:0,nA:BURN.nk,thr:(BURN.on&&!cut)||BURN.chg>.1?1:0,
    vsp:.6*BURN.k,wob:0,boost:false,cloudIn:0,dk:1,nB:TEL_NATIF?1:0,gE:VOL_LOCKED?1:.72,lpMin:TEL_NATIF?700:0}));
  if(skidG){const T=AC.currentTime,sk=BURN.k*(.75+.25*Math.sin(BURN.t*3.1)),sq=1050+380*BURN.chaud+110*Math.sin(BURN.t*1.7);
    stt(skidG.gain,Math.min(.17,.13*sk),T,.05);stt(skF1.frequency,sq,T,.06);stt(skF2.frequency,sq*1.56,T,.06);
    if(skD1)stt(skD1.gain,60+120*BURN.k,T,.1);if(skD2)stt(skD2.gain,90+180*BURN.k,T,.1);if(skLfo)stt(skLfo.frequency,13+5*BURN.chaud,T,.1);}
}
window.dbgBurn=function(s,a,b){
  if(s===0){burnFin();return 'coupé';}
  if(s==='permis'){let r=null;try{r=garCaisseRect();}catch(_){}return {caisse:garageI,permis:burnPermis(),rect:r};}
  if(s==='fumee'){const F=BURN.fum,p=carGroup.getWorldPosition(new THREE.Vector3());let n=0,vt=0,dans=0;let G=null;try{G=garGabarit();}catch(_){} // (le banc) la fumée autour de la caisse : tourne-t-elle avec elle ? en reste-t-il DANS la caisse ?
    if(F)for(let i=0;i<F.N;i++){if(F.age[i]>=F.life[i])continue;const j=i*3,dx=F.P[j]-p.x,dz=F.P[j+2]-p.z,r=Math.hypot(dx,dz);if(r>3.5||r<.2||F.P[j+1]>p.y+2)continue;n++;vt+=(F.V[j]*dz-F.V[j+2]*dx)/r;
      if(G){const c=Math.cos(carGroup.rotation.y),sn=Math.sin(carGroup.rotation.y),lx=dx*c-dz*sn,lz=dx*sn+dz*c;if(Math.abs(lx)<G.b&&Math.abs(lz)<G.a&&F.P[j+1]<p.y+(G.H||1.3))dans++;}}
    const pc=GAR.pod?GAR.pod.getWorldPosition(new THREE.Vector3()):p;let nj=0,ar=0,co=0;{const c=Math.cos(carGroup.rotation.y),sn=Math.sin(carGroup.rotation.y);if(F)for(let i=0;i<F.N;i++){if(F.age[i]>=F.life[i]||F.age[i]>1.2)continue;const j=i*3,vlx=F.V[j]*c-F.V[j+2]*sn,vlz=F.V[j]*sn+F.V[j+2]*c;nj++;ar+=-vlz;co+=Math.abs(vlx);}}
    return {proches:n,tourne:n?+(vt/n).toFixed(2):0,dansLaCaisse:dans,w:+BURN.yawV.toFixed(2),jeunes:nj,versArriere:nj?+(ar/nj).toFixed(2):0,surLeCote:nj?+(co/nj).toFixed(2):0,brusques:BURN.brusque|0,vivantes:F?F.n:0,horizon:+(BURN.hor||0).toFixed(1),ecart:+Math.hypot(p.x-pc.x,p.z-pc.z).toFixed(2)};}
  if(s==='mesure'){if(a){BURN.mes={n:0,rec:0,recMax:0,v:0,vMax:0,a:[],px:null};return 'go';}const M=BURN.mes;if(!M||!M.n)return null;const A=M.a.slice().sort(function(x,y){return x-y;});BURN.mes=null;return {recul:+(M.rec/M.n).toFixed(2),reculMax:+M.recMax.toFixed(2),vit:+(M.v/M.n).toFixed(2),vitMax:+M.vMax.toFixed(2),acc90:Math.round(A[(A.length*.9)|0]||0),images:M.n};}
  if(s==='autour'){const F=BURN.fum,R=b||50,v=new THREE.Vector3();let n=0,al=0,bx=0,by=0,bn=0; // (le banc) la fumée À L'ÉCRAN autour du point (x, y) de a : combien de bouffées, leur opacité ; et où est la plus dense
    if(F)for(let i=0;i<F.N;i++){if(F.age[i]>=F.life[i]||F.A[i]<.03)continue;const j=i*3;v.set(F.P[j],F.P[j+1],F.P[j+2]).project(camera);if(v.z>1)continue;const x=(v.x*.5+.5)*VP.w,y=(.5-v.y*.5)*VP.h;
      if(a&&Math.hypot(x-a[0],y-a[1])<R){n++;al+=F.A[i];}bx+=x*F.A[i];by+=y*F.A[i];bn+=F.A[i];}
    return {n:n,opacite:+al.toFixed(2),centre:bn?[Math.round(bx/bn),Math.round(by/bn)]:null};}
  if(s==='ressort'){if(a!=null)BURN_RESSORT.om=+a;if(b!=null)BURN_RESSORT.ze=+b;return Object.assign({},BURN_RESSORT);} // (le banc) le ressort du doigt à chaud
  if(s==='balade'){if(a&&typeof a==='object'){Object.assign(BURN_BALADE,a);return Object.assign({},BURN_BALADE);}if(a!=null)BURN_BALADE.suit=+a;if(b!=null)BURN_BALADE.pousse=+b;return Object.assign({},BURN_BALADE);} // (le banc) régler la balade à chaud : dbgBurn('balade',0,0) = le pivot fixe d'avant
  if(s==='tourne'){if(!garAtelierLibre())return 'atelier pas libre';if(!BURN.on)burnPart();BURN.bouge=true;BURN.auto=b>0?+b:3;BURN.autoW=a!=null?+a:3;} // un doigt qui tourne sans doigt : a rad/s pendant b secondes
  if(s>0){if(!garAtelierLibre())return 'atelier pas libre';burnPart();BURN.auto=+s;BURN.autoW=0;}
  return {on:BURN.on,k:+BURN.k.toFixed(2),t:+BURN.t.toFixed(2),chaud:+BURN.chaud.toFixed(2),rpm:+BURN.rpm.toFixed(2),fumee:BURN.fum?BURN.fum.n:0,feu:BURN.feu?BURN.feu.n:0,
    essieuxAr:BURN.ar.length,roues:BURN.roues.length,cap:+BURN.yaw.toFixed(2),cib:+BURN.cib.toFixed(2),w:+BURN.yawV.toFixed(2),donut:+BURN.don.toFixed(2),donM:+BURN.donM.toFixed(2),tours:BURN.n,
    pivot:+BURN.pivK.toFixed(2),balade:[+BURN.qx.toFixed(2),+BURN.qz.toFixed(2)],sw:[+(BURN.swAx||0).toFixed(2),+(BURN.swAz||0).toFixed(2)],swI:[+(BURN.swX||0).toFixed(2),+(BURN.swZ||0).toFixed(2)],sl9:+(BURN.sl9||0).toFixed(2),pos:(function(){const a=carGroup.getWorldPosition(new THREE.Vector3()),b=GAR.pod?GAR.pod.getWorldPosition(new THREE.Vector3()):a,r=garRot(),cr=Math.cos(r),sr=Math.sin(r),dx=a.x-b.x,dz=a.z-b.z;return [+(dx*cr-dz*sr).toFixed(2),+(dx*sr+dz*cr).toFixed(2)];})(),cad:+BURN.cad.toFixed(2),centre:[Math.round(BURN.scx),Math.round(BURN.scy)],geste:{tourne:+BURN.kc.toFixed(2),ailleurs:+BURN.mc.toFixed(2)},cubes:BURN.gr?BURN.gr.M.reduce(function(a,im){return a+im.count;},0):0,gomme:!!(BURN.gom&&BURN.gom.sale),plateau:+(GAR.platW||0).toFixed(2),doigt:GAR.doigt||null,son:BURN.son};
};
