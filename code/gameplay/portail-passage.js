/* LE PASSAGE DU PORTAIL (2026-09-26) — une seule fonction, deux entrées : au SOL (bout de piste ou entrée dans l'ovule) et en VOL
   (l'ovule se traverse d'où qu'on vienne, y compris en tombant du ciel). Le test ne vivait que dans la branche « au sol » de la
   boucle : en l'air, on traversait l'ovule sans rien déclencher. */
/* L'ORBITE A SES PORTES (2026-09-28, Sacha — idée reprise d'une session cloud) : on n'arrive plus dans l'espace par un simple fondu.
   ENTRÉE = un TUNNEL DE DISTORSION (1,9 s) : le monde s'incurve à fond (la distorsion du boost, poussée au maximum), le champ se
   déchire, des traits de lumière filent le long de la caisse, éclair bleu à l'entrée et à la SORTIE du tunnel.
   SORTIE = une RENTRÉE ATMOSPHÉRIQUE EN FEU (2,6 s) : la caisse retombe dans le ciel enveloppée de plasma — flammes au nez qui
   lèchent la carrosserie et traînent derrière, braises, tremblement, grondement, éclair orange.
   Déclenché par newTrack au passage d'un monde à l'autre, seulement quand on FRANCHIT un portail en course (pas au départ d'une
   partie ni au menu). Rien ne se construit : traits, particules et éclairs sont ceux du jeu. */
const ORBFX={warp:0,feu:0,prev:null,sortie:false,f:new THREE.Vector3(),r:new THREE.Vector3(),u:new THREE.Vector3(),p:new THREE.Vector3()};
function orbWarp(){
  ORBFX.warp=1;ORBFX.feu=0;ORBFX.sortie=false;
  flashEcran('rgba(140,210,255,.85)');hap([20,30,20,30,60]);shake=Math.max(shake,.45);
  try{if(SONV2)sfx('orbite.entre');else{whoosh();boostSnd(2.2);subBoom(.14);noiseBurst(1.1,.12,1800);}}catch(e){}
}
function orbFeu(){
  ORBFX.feu=1;ORBFX.warp=0;
  flashEcran('rgba(255,120,40,.85)');hap([30,40,30,40,80]);shake=Math.max(shake,.6);
  try{if(SONV2)sfx('orbite.sort');else{crackle(1);subBoom(.18);noiseBurst(1.6,.2,420);}}catch(e){}
}
function orbFxTick(dt){
  if(!(ORBFX.warp>0||ORBFX.feu>0)){if(ORBFX.halo&&ORBFX.halo.visible)ORBFX.halo.visible=ORBFX.halo2.visible=false;return;}
  if(gameOver||!running||!started){ORBFX.warp=ORBFX.feu=0;if(ORBFX.halo)ORBFX.halo.visible=ORBFX.halo2.visible=false;return;}
  const q=carGroup.quaternion,c=carGroup.position,F9=ORBFX.f.set(0,0,1).applyQuaternion(q),R9=ORBFX.r.set(1,0,0).applyQuaternion(q),U9=ORBFX.u.set(0,1,0).applyQuaternion(q);
  if(ORBFX.warp>0){
    ORBFX.warp=Math.max(0,ORBFX.warp-dt/1.9);const w=ORBFX.warp;
    fovPunch=Math.max(fovPunch,34*Math.sqrt(w)); // le champ se DÉCHIRE (la caméra relâche fovPunch toute seule)
    if(!REDUCED_MOTION)for(let k=0;k<2;k++){ // les parois du tunnel : des traits sur un anneau autour de la caisse, qui filent vers l'arrière
      const a=Math.random()*6.2832,R=7+Math.random()*12,d=25+Math.random()*70,ln=18+50*w;
      ORBFX.p.copy(c).addScaledVector(F9,d).addScaledVector(R9,Math.cos(a)*R).addScaledVector(U9,Math.sin(a)*R*.8);
      spawnStreak(ORBFX.p.x,ORBFX.p.y,ORBFX.p.z,-F9.x*ln,-F9.y*ln,-F9.z*ln);}
    if(!ORBFX.sortie&&w<.18){ORBFX.sortie=true;flashEcran('rgba(200,235,255,.65)');try{if(!SONV2)chimeNote(1320,0,.06,.4);}catch(e){}} // la SORTIE du tunnel : l'espace s'ouvre
  }
  if(ORBFX.feu>0){
    ORBFX.feu=Math.max(0,ORBFX.feu-dt/2.6);const f9=ORBFX.feu,sp=CARS[level];
    shake=Math.max(shake,.28*f9);
    if(!REDUCED_MOTION){ // le PLASMA : né au nez et sur les flancs, il hérite de la vitesse de la caisse (EXV) et LÈCHE la carrosserie vers l'arrière
      const n=Math.ceil(6*f9);for(let k=0;k<n;k++){
        // (vu en capture : nées au nez, la caisse les CACHAIT à la caméra de poursuite) — 30 % au nez, 70 % sur la SILHOUETTE vue de
        // derrière : les deux flancs et le toit, juste au bord de la carrosserie, d'où elles filent vers l'objectif
        const bout=Math.random()<.3,cote=Math.random()<.5?-1:1,toit=!bout&&Math.random()<.4;
        ORBFX.p.copy(c).addScaledVector(F9,bout?sp.l*.55+Math.random()*.5:(Math.random()-.2)*sp.l*.7)
          .addScaledVector(R9,bout?(Math.random()-.5)*sp.w:toit?(Math.random()-.5)*sp.w*.8:cote*sp.w*(.52+Math.random()*.15))
          .addScaledVector(U9,toit?sp.h+.15+Math.random()*.35:.3+Math.random()*sp.h*.8);
        const v=9+Math.random()*12;
        spawnP(flames,ORBFX.p.x,ORBFX.p.y,ORBFX.p.z,EXV.x*.92-F9.x*v+(Math.random()-.5)*3,EXV.y*.92-F9.y*v+Math.random()*2,EXV.z*.92-F9.z*v+(Math.random()-.5)*3,.2+Math.random()*.18);
        if(k<2)spawnP(flameCore,ORBFX.p.x,ORBFX.p.y,ORBFX.p.z,EXV.x*.95-F9.x*v*.6,EXV.y*.95+.5,EXV.z*.95-F9.z*v*.6,.12+Math.random()*.1);
        if(Math.random()<.35)spawnP(embers,ORBFX.p.x,ORBFX.p.y,ORBFX.p.z,EXV.x*.8-F9.x*v*.8+(Math.random()-.5)*7,EXV.y*.8+Math.random()*4,EXV.z*.8-F9.z*v*.8+(Math.random()-.5)*7,.4);}}
    { // LE BOUCLIER DE PLASMA : un halo orange vif au NEZ, une lueur rouge qui ENVELOPPE la caisse — deux sprites additifs (le programme
      // des halos de pouvoirs : aucune compilation), posés dans la scène et non dans la caisse (buildCar la vide à chaque changement)
      if(!ORBFX.halo){const m9=new THREE.SpriteMaterial({map:lampTex,color:0xff7a2a,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
        ORBFX.halo=new THREE.Sprite(m9);ORBFX.halo2=new THREE.Sprite(m9.clone());ORBFX.halo2.material.color.setHex(0xff3a12);
        for(const h9 of [ORBFX.halo,ORBFX.halo2]){h9.renderOrder=5;h9.visible=false;scene.add(h9);}}
      const tt=performance.now()/1000,fl=.78+.22*Math.sin(tt*41)*Math.sin(tt*17); // (`t` n'existe que dans la boucle)
      ORBFX.halo.visible=ORBFX.halo2.visible=f9>0;
      ORBFX.halo.position.copy(c).addScaledVector(F9,sp.l*.52).addScaledVector(U9,sp.h*.45);ORBFX.halo.scale.set(sp.w*2.6,sp.h*2.4,1);
      ORBFX.halo.material.opacity=Math.min(1,1.1*f9)*fl;
      ORBFX.halo2.position.copy(c).addScaledVector(U9,sp.h*.5);ORBFX.halo2.scale.set(sp.l*1.7,sp.l*1.2,1);
      ORBFX.halo2.material.opacity=.55*f9*fl;
    }
    ORBFX.pouls=(ORBFX.pouls||0)-dt;
    if(f9>.3&&ORBFX.pouls<=0){ORBFX.pouls=.45;flashEcran('rgba(255,110,30,'+(.35+.4*f9).toFixed(2)+')');} // les bords de l'écran BATTENT en orange tant que ça brûle
    if(!SONV2&&f9>.4&&Math.random()<dt*5)try{crackle(.3*f9);}catch(e){} /* (débogage son 2026-09-29) orbite.sort porte déjà le feu de la rentrée */
  }
}
/* LE PLAFOND DE VITESSE COMMUN (2026-09-29, nuit — trouvé par DEBUGGING, mesuré) : ×2,6 est la vitesse d'avance la plus haute qui reste pilotable
   (mesuré : au-delà de ×4,6 la caisse décolle à chaque relief et meurt « TROP LONGTEMPS EN L'AIR »). C'est le plafond de TOUT ce qui multiplie
   l'avance (VITESSE ×2 aujourd'hui). Un seul endroit : la boucle (spdMult) et la LIGNE PARFAITE (ligneTick) lisent vitMult(). */
function vitMult(){return Math.min(2.6,1+pwrSpdK);} /* (2026-10-17) pwrSpdK : le ×2 de VITESSE monte et retombe en ~0,4 s (voir pwrSpdK) */
function portailPasse(){
  if((BALADE||JADE_JEU)&&LVL.cur&&LVL.cur.id==='jade'&&JADE.root){jadeFinale();return;} // (v14) la balade de jade a une FIN : l'arrivée, puis le départ
  const sP=survPortS(); // (2026-09-30) ce que la course du Survivant avance au passage (en vol : voir survPortS)
  if(TUTO.on&&!PARK.on){SURV.pBase+=sP;newTrack();return;} // (2026-09-28) l'auto-école ne s'échappe pas par le portail (le débutant qui n'osait pas sauter finissait la leçon dans la VILLE) : la piste d'apprentissage repart
  evtPortail(); // (2026-10-14, GAMEPLAY) LES ÉVÉNEMENTS RARES : la caisse-nuage encore en course quand on passe le portail, c'est raté
  if(mode==='fall'){airPie.style.display='none';vA=Math.max(vA,Math.hypot(fallVel.x,fallVel.z)/vitMult()); // traversé en VOL : le vol s'arrête proprement, l'élan est gardé (inertie) — (2026-09-30) ÷ vitMult : le vol porte la vitesse réelle
    /* (2026-09-28, Sacha : « quand on coupe la route pour rejoindre le portail plus vite, ça doit quand même rapporter du machiavélisme »)
       LE RACCOURCI VERS LE PORTAIL : on n'atterrit pas, donc tryLand ne le voyait jamais. Même mesure qu'à la pose — la piste qu'il
       restait à rouler jusqu'à l'entrée de l'ovule (son centre est à L−25, son rayon 55 : ~L−80) moins la ligne droite volée. */
    if(!PARK.on&&!TUTO.on){const gagne=(L-80-FLOW.s0)-FLOW.p0.distanceTo(fallPos);if(gagne>=60)flowRaccourci(gagne);else if(gagne>=25)frenTrait('m',gagne/60);}
    // (2026-09-26) …et la CHAÎNE est ENCAISSÉE comme à une pose : avant, l'argent de la mallette disparaissait sans un mot et le HUD restait affiché
    if(chain>0)runStats.tricks++; // (2026-09-29) les figures ne rapportent plus d'argent : la figure du vol compte, rien n'est versé (l'aura ouverte, elle, continue sa chaîne)
    chain=0;chainVal=0;chainMult=1;chainSeen={};chainHud.style.opacity=0;caseHud.style.opacity=0;caseHud.className='';caseHot=false;}
  flashEcran('rgba(255,79,216,.6)'); // l'annonce, c'est « NIVEAU n — LIEU » (lvlAnnonce, couloir des annonces) : une seule voix au centre
  portalSnd();if(!SONV2)boostSnd();shake=.5; /* (console de son) `portail` porte tout le passage : plus le souffle d'un pad dessous */
  if(SENS)try{sensHap([22,36,12],3);}catch(e){} // (2026-10-14, sensations · passages) le portail CLAQUE dans la main : un coup lourd puis son écho — le plus gros passage du jeu avait son flash, son souffle et sa secousse, mais pas une vibration (les finales et l'auto-école sortent plus haut : rien)
  const zb=denom()*120*(fever>0?2:1)*flowMult(); /* (2026-10-14, équilibrage) 24 → 120 : un portail paie 15-20 s de pièces, un vrai jalon (+3-5 % sur une bonne partie) */money+=zb;levelCash+=zb;livre('$:portail',zb);checkUpgrade();frenCash(zb,carGroup.position); // portail : 40→24 (régulation 2026-07-30) · (2026-09-29) × le FLOW comme les pièces : franchi en FRÉNÉSIE, il paie ×3
  runStats.zones++;secPorte(); // (2026-10-14) LES DÉFIS SECRETS : LUNAIRE
  if(SONV2&&nitroR<nitroCap()-.05)sfx('nitro.plein',{t:.45}); // (console de son) le portail refait le plein : on l'entend, après l'aspiration
  nitroR=Math.max(nitroR,nitroCap()); // le portail regonfle la nitro : chaque zone repart pied au plancher — au plein du MOTEUR (en dur à 2, il vidait un réservoir de 3,6)
  trickMsg(TR(pickL(ZONE_LINES))+' +'+fmtC(zb),true);
  flyCash(carGroup.position,8);
  SURV.pBase+=sP; // la course traverse le portail : les écarts restent vrais (téléportation invisible) — (2026-09-30) même franchi en vol
  portPasseNiveau();
}
/* LE PASSAGE EN DEUX TEMPS (2026-10-05, Léo : « rends plus smooth la transition entre deux niveaux qui se suivent, avec le portail »).
   MESURÉ (banc, dbgSaut) : construire le niveau suivant = 300 à 460 ms de calcul, puis la 1re image du nouveau monde 1,3 à 2,9 s (ses
   programmes se compilent) contre 0,2 s pour une image ordinaire — sur téléphone c'est plus court, mais c'est CE gel qu'on sentait : l'image
   restait figée sur l'ancien portail, puis tout sautait (piste, caméra, ciel, musique) sous un flash qui ne colorait que les BORDS.
   Désormais : le VOILE (#portV) se pose à l'instant du passage, l'image est PEINTE, et la construction part à l'image d'après (deux rAF) ;
   le voile tient ~0,28 s (la chauffe des programmes, CHAUFFE_R à +120 ms, tombe dessous) puis s'ouvre en 0,5 s. Pendant l'attente (1 à 2
   images) la caisse reste à la bouche du portail (s ≤ L − 2 : 32 m de marge, mais à 1 900 km/h une image en avale 9). En VOL, la
   construction reste immédiate (la chute continuerait) : le voile cache la coupe. Le temps du jeu, lui, ne ralentit JAMAIS (règle du 26/09). */
const PORTV={el:null,att:0,n:0,tS:0,t0:0};
/* LE PASSAGE PAR LA FENÊTRE (2026-10-17, Léo : « revoir tout le système de transition entre chaque map »). Avec le portail de cubes, le voile
   du passage n'est plus un écran à part (les feux du départ) : c'est L'IMAGE MÊME qu'on traverse. À l'instant du passage la scène est rendue
   une fois et recopiée dans une toile plein écran (la fenêtre couvre déjà tout l'écran : on y voit la map d'en face) ; la toile AVANCE (un
   zoom joué par le compositeur : il continue pendant que newTrack bloque le script) ; le monde neuf bâti, elle se DÉFAIT EN CUBES — des
   carrés qui rétrécissent, du centre vers les bords — sur la vraie map d'arrivée, qui est la vue même de la carte postale. Aucun calcul
   pendant la construction ; ~500 petits dessins par image pendant 0,44 s ensuite. */
const PCV={el:null,cv:null,g:null,src:null,sg:null,t0:0,raf:0,tS:0,fen:false,copie:false}; // fen : un passage par la fenêtre est en cours (newTrack bascule le ciel d'un coup)
function pcVoile(rendre){
  let e=PCV.el;
  if(!e){e=document.createElement('div');e.id='portC';e.setAttribute('aria-hidden','true');const cv=document.createElement('canvas');e.appendChild(cv);document.body.appendChild(e);
    PCV.el=e;PCV.cv=cv;PCV.g=cv.getContext('2d');PCV.src=document.createElement('canvas');PCV.sg=PCV.src.getContext('2d');
    const st=document.createElement('style');st.id='portailCubes';
    st.textContent='#portC{position:fixed;inset:0;z-index:8;pointer-events:none;opacity:0;overflow:hidden;contain:strict}'+
      '#portC canvas{position:absolute;inset:0;width:100%;height:100%;transform-origin:50% 44%;will-change:transform}'+
      '#portC.go canvas{animation:pcAvance 1.5s cubic-bezier(.25,.55,.35,1) both}@keyframes pcAvance{from{transform:scale(1)}to{transform:scale(1.16)}}';
    document.head.appendChild(st);}
  cancelAnimationFrame(PCV.raf);clearTimeout(PCV.tS);
  const k=Math.min(1.5,window.devicePixelRatio||1),w=Math.max(2,Math.round(VP.w*k)),h=Math.max(2,Math.round(VP.h*k));
  if(PCV.cv.width!==w||PCV.cv.height!==h){PCV.cv.width=w;PCV.cv.height=h;PCV.src.width=w;PCV.src.height=h;}
  PCV.fen=true;
  /* (3e tour) PAS DE RENDU EN PLUS : au sol, l'image qu'on traverse est recopiée juste APRÈS le rendu normal de cette image (pcCopie, appelée
     par la boucle) — un rendu complet de moins au moment le plus chargé. En vol, newTrack part tout de suite : là, on rend une fois. */
  if(rendre){try{if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}catch(er){}pcCopie();}else PCV.copie=true;}
function pcCopie(){PCV.copie=false;const e=PCV.el,w=PCV.cv.width,h=PCV.cv.height;
  try{PCV.sg.drawImage(renderer.domElement,0,0,w,h);}catch(er){PCV.sg.fillStyle='#0b0920';PCV.sg.fillRect(0,0,w,h);} // l'image qu'on traverse, telle qu'à l'écran
  PCV.g.clearRect(0,0,w,h);PCV.g.drawImage(PCV.src,0,0);
  e.style.opacity='1';e.classList.remove('go');void e.offsetWidth;if(!REDUCED_MOTION)e.classList.add('go');PCV.t0=performance.now();}
function pcPrepare(){ // la grille des cubes de l'image et l'ordre où ils partent : du centre (un peu au-dessus du milieu : la route y file) vers les bords, avec du hasard
  const W=PCV.cv.width,H=PCV.cv.height,B=Math.max(12,Math.round(Math.min(W,H)/15)),nx=Math.ceil(W/B),ny=Math.ceil(H/B),th=new Float32Array(nx*ny);
  const cx=W*.5,cy=H*.44,dm=Math.hypot(Math.max(cx,W-cx),Math.max(cy,H-cy));
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)th[j*nx+i]=.62*Math.hypot((i+.5)*B-cx,(j+.5)*B-cy)/dm+.38*Math.random();
  PCV.W=W;PCV.H=H;PCV.B=B;PCV.nx=nx;PCV.ny=ny;PCV.th=th;}
function pcDessine(p){ // p 0 → 1 : chaque cube rétrécit sur lui-même puis s'en va
  const g=PCV.g,src=PCV.src,W=PCV.W,H=PCV.H,B=PCV.B,nx=PCV.nx,ny=PCV.ny,th=PCV.th,q=p*1.3-.14;g.clearRect(0,0,W,H);
  if(REDUCED_MOTION){g.globalAlpha=1-p;g.drawImage(src,0,0);g.globalAlpha=1;return;}
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=(th[j*nx+i]-q)/.16;if(a<=0)continue;const z=a>=1?B:B*a,o=(B-z)*.5,x=i*B,y=j*B;g.drawImage(src,x,y,B,B,x+o,y+o,z,z);}}
/* (2026-10-17, 3e tour — Léo : « la pause est beaucoup trop longue ; je préférais la première, qui donnait l'impression qu'on changeait de
   dimension, et on reprenait la main ensuite » — la traversée en paliers de pixels + tunnel est RETIRÉE, la 1re revient, plus COURTE) : le
   voile attendait 220 ms après la construction, puis 120 ms de plus pour la chauffe des programmes, qui tombait PENDANT les cubes (un à-coup
   au milieu). Désormais la chauffe du monde neuf part TOUT DE SUITE, sous l'image (CHAUFFE_R.t = maintenant), les cubes partent une image
   plus tard, sur un monde déjà prêt, et se défont en 0,30 s (0,44) ; au sol, plus de rendu en plus ni d'image d'attente de trop (pcCopie). Mesuré au banc : voir le JOURNAL. */
function pcVoileSort(){PCV.fen=false;cancelAnimationFrame(PCV.raf);clearTimeout(PCV.tS);
  try{CHAUFFE_R.t=performance.now();}catch(e){}
  let n=0;const go=function(){if(++n<2){PCV.raf=requestAnimationFrame(go);return;}
    pcPrepare();const D=(REDUCED_MOTION?260:300)*(PCV.lent||1),t0=performance.now();PCV.tD=t0;
    const f=function(){const p=Math.min(1,(performance.now()-t0)/D);pcDessine(p);
      if(p<1)PCV.raf=requestAnimationFrame(f);else{PCV.el.style.opacity='0';PCV.el.classList.remove('go');PCV.tF=performance.now();}};
    PCV.raf=requestAnimationFrame(f);};
  PCV.raf=requestAnimationFrame(go);}
window.dbgPassage=function(p,k){if(p==='lent'){PCV.lent=k||1;return PCV.lent;}if(p==null){pcVoile();PCV.fen=false;return 'voile posé';}pcPrepare();pcDessine(+p);return {B:PCV.B,cubes:PCV.nx*PCV.ny};}; // (banc) la toile du passage figée à p
function portVoile(){
  let e=PORTV.el;if(!e){e=document.createElement('div');e.id='portV';e.setAttribute('aria-hidden','true');
    e.innerHTML='<div class="pfxW"><div class="pfx"><i></i><i></i><i></i></div></div>';document.body.appendChild(e);PORTV.el=e;} // les FEUX DU DÉPART (voir le CSS de #portV)
  clearTimeout(PORTV.tS);e.style.transition='none';e.style.opacity=REDUCED_MOTION?'.45':'.94';e.classList.remove('go');void e.offsetWidth;e.classList.add('go');PORTV.t0=performance.now();}
function portVoileSort(ms){ms=Math.max(ms,560-(performance.now()-(PORTV.t0||0))); // le voile ne s'ouvre qu'une fois le VERT allumé (450 ms) et vu un instant
  clearTimeout(PORTV.tS);PORTV.tS=setTimeout(function(){const e=PORTV.el;if(!e)return;
  e.style.transition='opacity .5s cubic-bezier(.3,.6,.3,1)';e.style.opacity='0';},ms);}
function portPasseNiveau(){
  const cub=PCUBE.on; // (2026-10-17) le portail de cubes : on passe PAR LA FENÊTRE (pcVoile) au lieu des feux du départ
  if(cub)pcVoile(mode!=='drive');else portVoile();try{document.dispatchEvent(new Event('cc:portail'));}catch(e){} // (PERF) voir LES SIGNAUX DE CONSTRUCTION
  if(mode!=='drive'){PORTV.att=0;prebPorte(newTrack);if(cub)pcVoileSort(220);else portVoileSort(280);return;} // (LE PRÉ-BÂTI) prebPorte : c'est le portail qui construit
  const tok=PORTV.att=++PORTV.n;
  // (2026-10-17, 3e tour) avec la fenêtre, UNE image d'attente suffit : la copie et le voile sont posés à la fin de CETTE image (pcCopie), peints avant la suivante
  const r1=cub?function(f){f();}:requestAnimationFrame;
  requestAnimationFrame(function(){r1(function(){
    if(PORTV.att!==tok)return;PORTV.att=0;
    if(started&&!gameOver&&!PARK.on&&mode!=='boom')prebPorte(newTrack); // (LE PRÉ-BÂTI) prebPorte : c'est le portail qui construit · (2026-10-14, chasse aux bugs) mode!=='boom' : morte dans les 2 images d'attente, la caisse explose ENCORE (gameOver ne tombe qu'à endGame, 1,8 s plus tard) — newTrack lui remettait mode='drive' : plus d'endGame, elle roulait après sa mort
    if(cub)pcVoileSort(220);else portVoileSort(280);});});
}
/* L'ÉTAT DE CAMÉRA DU VOL (2026-09-28). La v2 de l'après-midi (écart tenu court, plan de trois-quarts) a été RETIRÉE le soir même :
   elle rendait la visée impossible — voir le bloc « CAMÉRA DE VOL — RETOUR À LA CAMÉRA DE POURSUITE » dans la boucle. Restent : `t`
   (dernière image de vol : détecte le décollage), `eta` (secondes avant la réception prédite, posé par le viseur, 99 = rien en vue) ·
   `zoom`/`zp` = le COUP DE ZOOM d'une pose PARFAITE (lu par la caméra au sol) · `s0` = la taille de la caisse à l'écran au décollage
   (le « bras » de la caméra de vol l'y garde) · `off` = vecteur de travail du bras. `look/hang/side/soon` ne servent plus. */
const CAMV={off:new THREE.Vector3(),look:new THREE.Vector3(),t:0,hang:0,side:1,soon:0,eta:99,zoom:0,zp:0,s0:.2,vtg:0};
function volR(){const sp=CARS[level]||CARS[0];return .5*Math.hypot(sp.l||4.2,sp.w||1.9,(sp.h||.8)+.6);} // la sphère englobante de la caisse (roues et aileron compris)
function volTaille(d,fov){return volR()/(Math.max(.5,d)*Math.tan(fov*Math.PI/360));} // sa taille à l'écran : part de la demi-hauteur
window.dbgCamVol=function(){try{const b=new THREE.Box3().setFromObject(carGroup),v=new THREE.Vector3();let x0=9,x1=-9,y0=9,y1=-9;
  for(let i=0;i<8;i++){v.set(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).project(camera);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);}
  const c=carGroup.position.clone().project(camera),r=landMark.visible?landMark.position.clone().project(camera):null;
  return {mode,fallT:+(+fallT).toFixed(2),d:+camera.position.distanceTo(carGroup.position).toFixed(1),fov:+camera.fov.toFixed(1),vertigo:+CAMV.vtg.toFixed(2),
    taille:+volTaille(camera.position.distanceTo(carGroup.position),camera.fov).toFixed(3),ecart:r?+(Math.hypot(r.x-c.x,r.y-c.y)/Math.max(.01,volTaille(camera.position.distanceTo(carGroup.position),camera.fov))).toFixed(2):null,caisse:[+c.x.toFixed(2),+c.y.toFixed(2)],anneau:r?[+r.x.toFixed(2),+r.y.toFixed(2),r.z<1]:null};}catch(e){return e.message;}};
/* LA POSE PARFAITE SE VOIT (2026-09-28, Sacha) : en plus du gel d'image (hitT) et du « tchak », un COUP DE ZOOM — le champ se resserre
   sec à l'impact et se relâche en 0,5 s — et une COURONNE DORÉE qui éclate depuis les bords de l'écran (le centre reste net : on voit la
   caisse se poser). DIVIN (braquage) : plus fort, et la couronne bat deux fois. */
function poseParfaiteFx(divin){
  CAMV.zoom=divin?1.3:1;
  flashEcran(divin?'rgba(255,238,150,1)':'rgba(255,200,60,.95)');
  if(divin)setTimeout(function(){try{if(running&&!gameOver)flashEcran('rgba(255,215,110,.8)');}catch(e){}},200);
}
/* (2026-10-14, sensations · pose) LA CAISSE ENCAISSE LA POSE. Au contact elle se tassait bien droite (squashT), quelle que soit l'arrivée :
   une plume ou une enclume, dans l'axe ou en crabe, même geste. Désormais le NEZ plonge à proportion du choc (≈ 1° pour une plume, ≈ 5°
   pour un POSÉ LOURD) et, posée de travers, la carrosserie VERSE du côté où elle ripe (son élan la couche pendant que la gomme mord) —
   deux impulsions sur ses ressorts (sensCoup), elle se repose seule. Le débattement reste à squashT : on ne le double pas. */
function sensPose(imp,psi0,verdict){
  const k=Math.min(1,Math.max(0,imp||0)/10);
  /* (2026-10-14, gameplay · accord) LE NEZ NE PLONGE QU'UNE FOIS : le VOL ÉQUILIBRÉ de Léo le fait plonger au même contact (veqContact →
     VEQ.sp, ressort ω 13, dosé lui aussi par le choc) — les deux ressorts s'additionnaient (mesuré au banc, voir notes/accord.md). Sous le vol
     de Léo, seul son nez reste ; ce détail garde le DÉVERS du crabe (que veqContact ne fait pas). `?vol=ancien` : le nez d'ici revient. */
  sensCoup(THREE.MathUtils.clamp((psi0||0)*3,-2,2)*(.5+.5*k),VEQ.on?0:.35+1.5*k,0);
  /* LA MAIN : la vibration de pose vit dans le VERDICT (PARFAIT 15 · ordinaire 14 · LOURD 45) — qui ne juge que les vrais vols (> 0,7 s ou
     une chaîne). Une petite retombée (trou enjambé, crête, sortie courte) touchait le bitume sans que la main le sache. Celle-là, et elle
     seule, reçoit son coup au contact, dosé par le choc : plume · net · lourd. */
  if(!verdict)sensHap(imp>=10?45:imp>=4.5?16:9,imp>=10?3:imp>=4.5?2:1); // (2026-10-14, accord) lourde = 45, comme le POSÉ LOURD du verdict (34 ms passait pour un coup MOYEN sur le Taptic d'iOS)
}
/* (2026-10-14, sensations · pose) LE BUMP RACLE. Les étincelles du rebond naissaient au CENTRE de la caisse, en boule, et restaient sur
   place. Celles-ci partent du FLANC qui a touché (la tranche, une demi-largeur vers la route), giclent vers le vide et filent AVEC la
   caisse le long de la dalle (elles héritent de sa vitesse d'avance) : on lit de quel côté on a cogné. 4 à 10 selon la violence.
   (2026-10-14, accord) 8 à 14 : elle REMPLACE la boule de 12 du centre (tryLand) au lieu de s'y ajouter — une seule gerbe par bump. */
function sensBumpFlanc(b,t,n,sg,impB){
  const k=Math.min(1,Math.max(0,impB||0)/20),nb=8+Math.round(6*k),w=CARS[level].w*.5,vt=fallVel.dot(t)*SPD;
  const px=fallPos.x-b.x*sg*w,py=fallPos.y-b.y*sg*w,pz=fallPos.z-b.z*sg*w;
  for(let i=0;i<nb;i++){const a=vt*(.72+Math.random()*.26),l=sg*(2+Math.random()*(4+5*k)),u=-1+Math.random()*3.5,o=(Math.random()-.5)*1.6;
    spawnP(sparkGold,px+t.x*o,py+t.y*o,pz+t.z*o,t.x*a+b.x*l+n.x*u,t.y*a+b.y*l+n.y*u,t.z*a+b.z*l+n.z*u,.2+Math.random()*.25);}
}
function startFall(impU,impF,bord){const fr9=frDecolle();dmtCoupe(); // (2026-10-17) fr9 : une figure SUR LA ROUTE en cours, qui part avec le vol // bord : sortie par le CÔTÉ de la route (physique du bord v2) — pas de pop, bascule vers le vide
  FX2.drift=FIGV2.on&&driftEnCours&&!bord;FX2.driftS=steer>=0?1:-1; // (2026-10-14, LES FIGURES v2) un DRIFT qui décolle part en toupie — lu AVANT la remise à zéro
  if(bord)secBord();m2Saut(); /* (2026-10-16) LES MISSIONS v2 : un saut neuf, des tours neuves à frôler */ // (2026-10-14) LES DÉFIS SECRETS : FANTÔME — sorti par le bord
  const roll0=carRoll9; // (bord v2) le roulis de la carrosserie AVANT la remise à zéro : la bascule part de là
  const cap0=psi-slipB-BKV.gl; /* (2026-10-17, LE DÉCOLLAGE SANS SURSAUT) la TRAJECTOIRE au sol, lue avant la remise à zéro : au sol on avance de vA·cos(cap) et l'on dérive de vA·sin(cap) (vL) ; l'éjection prenait vA ENTIER le long de la route PLUS la dérive — à 30° de cap, la caisse décollait 11 % plus vite qu'elle ne roulait, 3° à côté de sa trajectoire */
  if(FREIN_L<0){vA*=Math.exp(FREIN_L);FREIN_L=0;}PARIS.psiK=0; // (2026-10-17) un FREIN ÉTALÉ en cours se paie d'un coup au décollage ; la paroi lâche la caisse (voir parisMur)
  ECH=0;SVOL.t=0;/* (2026-10-14, session SON) le chrono de la tension repart : un vol neuf monte de zéro (k, lui, retombe tout seul) */figSnd._ess=0;pitchS=0;JEAU.dans=false;JEAU.wB=0;JEAU.vRef=0;JEAU.n=0;JEAU.t=0;JEAU.rico=0;JEAU.cd=0;JEAU.syF=NaN;JEAU.y0=carGroup.position.y; // (2026-10-13) la mer : un vol neuf, un premier plongeon neuf
  // (console de son) une gamme neuve à chaque vol — (2026-10-09) pitchS : le manche repart du neutre
  traceTick(false); // (2026-09-26) le ruban de gomme se coupe au décollage
  loop._nAir=nitroOn; // (2026-09-26) l'impulsion est celle de l'ALLUMAGE en vol : tenue depuis le sol, elle ne compte pas — mais elle ne dépend plus du vol d'avant
  lastNearS=s;        // (2026-09-26) le couloir de proximité (LOD, aimant) part d'ICI, pas de la fin du vol précédent (les pièces clignotaient une image)
  LIGNE.sPk=null;     // (2026-09-30) LIGNE PARFAITE : le balayage de trajet repart de la POSE — sinon la 1re image au sol balayait tout le vol (≤ 60 m) et prenait sans contact le fruit survolé. Ici plutôt qu'à la pose : UNE entrée en vol, plusieurs sorties (tryLand, portail, replacement, parc…)
  FROLE.n=0;FROLE.t=0;
  virT=0;virC=0;virD=false;virPaye=false; /* (LA FRONDE) un virage quitté par le bord ne se paie pas à la pose */
  MIR.t=0;MIR.max=0; // (2026-09-28) MIRACULÉ : chaque vol repart « pas perdu »
  FILR.ok=false; // (2026-09-29) on a quitté la route : ce virage à filet n'est plus « à fond »
  mode='fall';fallT=0;fallTR=0;yawAcc=0;airRoll=0;trkBigA=false;trkMonstre=false; // (momentum v2) le saut ne remet plus la réserve à zéro : c'est la POSE qui juge
  driftC=0;driftLv=0;driftEnCours=false;driftArm=0;yawR=0;slipB=0;glisse9=0;driftYaw=0;BKV.gl=0;carRoll9=0;rollV=0;pitch9=0;SCOUP.p=0;SCOUP.pv=0;SEAU.k=0;SEAU.pose=false;SEAU.vy0=0;carBody.rotation.set(0,0,0);carBody.position.set(0,0,0); // une glisse ne survit pas au décollage (pas de mini-turbo en l'air)
  // TEMPO DE VOL ∝ VITESSE (2026-07-20, dosage DOUX sur base V1) : =1 jusqu'à 450 km/h affichés
  // (basse/moyenne vitesse : rigoureusement l'existant), puis +1 tous les 1800 km/h, CAP 1.35 —
  // loin du 2.3 de l'ancienne ère (qui compensait SPD=.25) : l'endgame TRAVERSE sa phase aérienne
  // au lieu de flotter, sans virer missile. Parabole DANS L'ESPACE, viseur, seuils de figures et
  // paiements (fallT temps-sim) INCHANGÉS — seul le temps réel du vol se compresse un peu.
  AIR_RATE=1; /* (2026-09-30, Sacha, le soir : « l'air time est trop rapide, il faut que ce soit VRAIMENT lié de manière réaliste à la VITESSE D'EXPULSION ») :
     le vol se joue en TEMPS RÉEL (le ×1,3 du midi est retiré) et la caisse décolle à sa VRAIE vitesse d'avance (× vitMult, voir fallVel plus bas) —
     mesuré avant : sans boost, elle bondissait de +30 % au décollage ; en NITROOO ×2,6, elle y perdait la moitié de sa vitesse. */ /* (le midi : AIR_RATE=1.3, « qu'elle aille plus vite et qu'elle tombe plus vite ») */ // (vol v6, 2026-09-25, user : « la vitesse en airtime est trop importante proportionnellement à celle sur route ») : le vol se joue en TEMPS RÉEL, comme la route — il était compressé jusqu'à ×1,35 au-delà de 450 km/h
  fallVH0=-1; // la vitesse horizontale de décollage se relève à la 1re image de vol (la catapulte retouche fallVel APRÈS cet appel)
  NIT.vol=0;NIT.nit=0;fallStartSide=side; // côté de départ figé
  bounceN=0;flightId++; // nouveau vol : compteur de bumps et budget d'airtime des nuages remis à zéro
  frameAt(s,F);
  if(side<0){F.n.multiplyScalar(-1);F.b.multiplyScalar(-1);}
  // (bord v2) au BORD la caisse part d'où elle est (hopY) : le +0,6 d'origine la faisait monter de 60 cm en une image — le « déclic »
  /* (2026-10-17, LE DÉCOLLAGE SANS SURSAUT) …et plus aucun décollage ne fait ce bond : tremplin, saut nitro, crête, trou — MESURÉ au banc
     pas à pas (feel.cjs) : la caisse montait de 0,61 m entre deux images (la vitesse de 4 images de montée d'un coup), puis repartait
     à sa vitesse. Elle part désormais d'où elle roule ; l'impulsion seule la lève. La pose ne peut pas être déclarée avant 0,35 s de vol
     (0,1 s pour un plan percé) : la caisse a le temps de quitter la dalle. */
  fallPos.copy(F.p).addScaledVector(F.b,lat).addScaledVector(F.n,(side<0?THICK:0)+hopY+(fr9?fr9.lift:0)); /* (2026-10-19) fr9.lift : une figure sur la route décolle d'où elle EST, le bond compris */
  FLOW.s0=s;FLOW.p0.copy(fallPos); // (FLOW v2) d'où part le vol — la pose dira si c'était un RACCOURCI
  {const vm9=vitMult(); /* (2026-09-30) l'ÉJECTION = la vitesse d'avance RÉELLE : au sol, NITROOO et VITESSE ×2 multiplient l'avance (vitMult), pas vA — la caisse décollait sans eux */
  fallVel.copy(F.t).multiplyScalar(vA*Math.cos(cap0)*driveDir*(impF||1)*vm9).addScaledVector(F.b,vL*driveDir*vm9) /* (2026-10-17) ×cos(cap) : la vitesse et le cap du vol sont ceux de la route (voir cap0) */.addScaledVector(F.n,impU==null?.9:impU);} // driveDir : on décolle dans le sens où l'on roulait (le parc autorise les deux) — ⚠ (bord v2) `impU==null` et non `impU||` : le bord passe 0 (aucune impulsion), qui valait .9
  // INERTIE RÉELLE (2026-07-20) : fini le plafond TOTAL de 95 qui bridait l'éjection — éjecté à
  // 300 km/h, on VOLE à 300 km/h (le compteur ne s'effondre plus au décollage), et la gravité en
  // RAJOUTE en descente, comme une vraie chute. Seule la composante VERTICALE est bornée (70) :
  // une crête ALPIN prise à 1900 km/h ne catapulte plus en orbite et la jauge des 6 s reste tenable
  // (vol balistique max ≈ 4,2 s-sim). L'ancien 3e paramètre capV de la CATAPULTE est retiré : il ne
  // servait qu'à rendre la portée ∝ vitesse malgré le plafond total — l'horizontale conservée le
  // fait désormais NATIVEMENT (portée = vx·2vy/g, vx vrai).
  VOLR.on=volrOn();if(VOLR.on){VOLR.u.copy(F.n);tryLand._bi=Math.max(0,Math.min(NP-1,Math.round(s/L*(NP-1))));}else VOLR.u.set(0,1,0); // (LE VOL QUI SUIT LA ROUTE) le haut du vol part de la face quittée ; le radar part d'ici (sinon il parle encore du vol d'avant)
  volPlafU(fallVel,70);
  hopY=0;hopV=0;POSE_F=null; // un dos d'âne en cours ne doit pas laisser de décalage fantôme
  SCOUP.vp=0;SCOUP.fp=0;SCOUP.fh=0; // (2026-10-14, accord · œil) une pose qui n'a jamais touché (repartie en vol pendant sa descente) n'emporte pas sa vibration au vol suivant
  lastNearY=fallPos.y; // référence du plongeon fatal tant que tryLand n'a pas mieux
  {tmp.copy(fallVel).normalize();FLY_U.copy(F.n).addScaledVector(tmp,-F.n.dot(tmp)); // (vol libre) le haut du vol part de celui de la route
   if(FLY_U.lengthSq()<1e-4)FLY_U.copy(F.b).cross(tmp);FLY_U.normalize();FLY_R.crossVectors(FLY_U,tmp).normalize();}
  // (bord v2) LA BASCULE : la vrille part du côté du VIDE (le toit vers l'extérieur : signe opposé à `lat`, même convention que carRoll9),
  // et elle part du roulis que la carrosserie avait déjà — reporté sur la caisse entière, sinon il s'effaçait d'un coup à la sortie
  bascOn=!!bord;bascT=0;bascDir=bord?-(Math.sign(lat)||1):1;levreY=0;
  TBORD.t=bord&&TORD.on?1.1:0;TBORD.on=false; // (LE BORD DE LA ROUTE TORDUE) la gravité de la route, le temps de la bascule
  if(TBORD.t>0){tryLand._bi=Math.max(0,Math.min(NP-1,Math.round(s/L*(NP-1))));curLatOff=lat;curHOff=side<0?-THICK:0;} // le radar part du bord quitté (sinon, à la 1re image, il parle encore du vol d'avant)
  /* (2026-10-17, LE DÉCOLLAGE SANS SURSAUT) le roulis de la carrosserie (jusqu'à 24° dans un virage) passe AU VOL pour tout décollage, plus
     seulement au bord : sur un tremplin pris en courbe, un saut nitro au milieu d'un virage, la caisse se redressait d'un coup à plat en une
     image ; elle part penchée et les ressorts du VOL ÉQUILIBRÉ la rattrapent en se balançant (VEQ.br, voir veqDepart). */
  {airRoll=roll0;qTmp.setFromAxisAngle(tmp.set(0,0,1),roll0);carGroup.quaternion.multiply(qTmp);}
  veqDepart(bord,impU,roll0,carGroup.quaternion); // (2026-10-14) LE VOL ÉQUILIBRÉ : verrou du volant, ressorts de la caisse
  figDepart(bord); // (2026-10-14) LES FIGURES v2 : la caisse EMPORTE son élan de rotation (voir LES FIGURES v2)
  if(fr9)frVersVol(fr9); // (2026-10-17) …et la figure commencée SUR LA ROUTE continue en l'air (son corps devient celui du vol)
  /* (bord v2) L'IMAGE DU DÉCOLLAGE : elle ne passe ni par le placement de la conduite (le mode vient de changer) ni par celui du vol
     (il commence à l'image suivante) — la caisse et la caméra restaient FIGÉES une image puis rattrapaient deux pas d'un coup (2,7 m au
     banc). On les avance ici d'un même pas ; la caméra de vol repart de là (voir le suivi en vol), et la conduite, au retour, repartira
     de la caméra RÉELLE (`_camDriveT`/`_camLatT` périmés) au lieu d'un écart d'avant le saut. */
  {tmp.subVectors(fallPos,carGroup.position);if(tmp.lengthSq()<400){carGroup.position.copy(fallPos);camera.position.add(tmp);}
   loop._camAirT=0;loop._camDriveT=0;loop._camLatT=0;loop._fovBT=0;CAMV.p0ok=false;loop._nk=nitroOn?1:0;} /* (2026-10-17) _fovBT : un vol de moins de 0,4 s ne rend plus à la pose le champ d'AVANT le vol (+9° d'un coup) · p0ok : la caméra de vol repart de la vraie (voir CAMV.p0) · _nk : le plané du nitro part de l'état du sol (voir le réacteur) */
  // chaîne neuve : le vol commence, tout est à prouver
  chain=0;chainVal=rollover;chainMult=1;chainSeen={};spinHalf=0;
  heartBeat.vu=0; // (console de son) la mallette pourra chauffer — et le dire — une fois dans ce vol
  if(rollover>0){if(SONV2)sfx('report');trickMsg('REPORT +'+Math.round(rollover),false);rollover=0;} // le PARFAIT d'avant paye d'avance
  curNear=false;
  caseHot=false;heartT=0;ladderI=0;caseHud.style.opacity=0;caseHud.className='';
  chainHud.style.opacity=0;chainHud.classList.remove('pulse');
  // le boost se disperse en petites particules — (bord v2) sauf au BORD : une caisse qui bascule ne crache pas de flammes, son plancher RACLE la lèvre
  if(bord){sparkBurst(sparkGold,fallPos,10,6);if(!SONV2)try{noiseBurst(.12,.07,700);}catch(e){}}
  else for(let k=0;k<14;k++){
    spawnP(dust,fallPos.x,fallPos.y,fallPos.z,
      (Math.random()-.5)*7,-1-Math.random()*3,(Math.random()-.5)*7,.4+Math.random()*.3);
    if(k<8)spawnP(flameCore,fallPos.x,fallPos.y,fallPos.z,
      (Math.random()-.5)*9,-2-Math.random()*3,(Math.random()-.5)*9,.25);
  }
  /* (2026-10-14, sensations · pose) LE SOL LÂCHE DANS LA MAIN. Le décollage avait sa poussière et son souffle, mais le pouce ne sentait rien :
     on apprenait qu'on volait en le voyant. Un tic au moment où les roues quittent le bitume — léger pour une crête, un trou ou le bord,
     et le « ta-tac » des deux essieux (avant, puis arrière) sur la lèvre d'une CATAPULTE. Une seule vibration, par le limiteur commun. */
  /* (2026-10-14, gameplay · accord) …sauf le SAUT NITRO de Léo : il a son motif à lui ([12,30,18], dans veqSaut, juste après cet appel) —
     le « ta-tac » d'ici partait à la même image et se mêlait au sien. Le braquage qui arrache la caisse a déjà vibré : le limiteur le tait. */
  if(SENS&&running&&!gameOver&&!introD&&!(performance.now()-VEQ.sautT<60))try{if(!bord&&impU>=5)sensHap([10,26,14],2);else sensHap(9,1);}catch(e){}
  if(AC&&engRpm>.42){const e9=ENG_SND[Math.max(0,engLvl)];if(e9&&e9.crk)crackle(e9.crk*.8);} // (2026-09-25) le moteur se décharge en quittant le sol
  if(SONV2){ /* (console de son) tomber n'est pas décoller : chacun son son */
    /* (bord, 1/10, Sacha : « un son de merde quand on sort de la route et qu'on va dans les airs, deux petites notes ») : la sortie par le
       BORD passe désormais 0 d'impulsion (bord v2) et tombait donc sur `chute` — le sifflet + le « oh-oh » en deux notes, fait pour les
       TROUS. Elle garde le son qu'elle avait avant la v2 : le décollage, dosé comme avec l'ancienne impulsion (3,4). */
    if(!bord&&(impU||.9)<2)sfx('chute');
    else{const kv9=THREE.MathUtils.clamp((Math.max(bord?3.4:(impU||.9),fallVel.y)-3)/6,0,1),kh9=THREE.MathUtils.clamp(Math.abs(vA)*3.6*SPD/900,0,1);sfx('decollage',{vol:-8+11*Math.max(kv9,kh9*.7)});}
  }else whoosh();
}
const dTmp=new THREE.Vector3();
/* LE RADAR DE DALLE EN CASIERS (2026-09-27, passe perf iPhone) — en vol, deux recherches du point de piste le plus proche tournaient
   à CHAQUE image sur toute la piste : `tryLand` (1 point sur 2, ~4 500 distances) et le viseur d'atterrissage (1 sur 8, mais 14 pas
   d'intégration : ~15 700 distances). Sous processeur bridé c'était la moitié du temps PROPRE de la boucle.
   La piste est rangée en casiers de 64 points consécutifs, chacun dans une sphère (centre + rayon, marge d'un millimètre contre
   l'arrondi). Un casier dont la sphère est plus loin que le meilleur candidat déjà connu ne peut RIEN changer au résultat : on le
   saute. Les casiers restants sont balayés dans le MÊME ordre, avec la MÊME comparaison stricte et le même pas → même point élu au
   bit près (égalités comprises). Le casier se rebâtit seul quand la piste change (`pts` est un tableau neuf à chaque buildTrack). */
const DALLE_K=64,DALLE_IX={pts:null,n:0,nb:0,c:null,r:null};
function dalleIx(){
  const X=DALLE_IX;if(X.pts===pts&&X.n===NP)return X;
  const nb=Math.ceil(NP/DALLE_K);X.pts=pts;X.n=NP;X.nb=nb;X.c=new Float64Array(nb*3);X.r=new Float64Array(nb);
  for(let b=0;b<nb;b++){const i0=b*DALLE_K,i1=Math.min(NP,i0+DALLE_K);
    let x0=1e18,y0=1e18,z0=1e18,x1=-1e18,y1=-1e18,z1=-1e18;
    for(let i=i0;i<i1;i++){const p=pts[i];if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.y<y0)y0=p.y;if(p.y>y1)y1=p.y;if(p.z<z0)z0=p.z;if(p.z>z1)z1=p.z;}
    const cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2;let r2=0;
    for(let i=i0;i<i1;i++){const p=pts[i],dx=p.x-cx,dy=p.y-cy,dz=p.z-cz,d=dx*dx+dy*dy+dz*dz;if(d>r2)r2=d;}
    X.c[b*3]=cx;X.c[b*3+1]=cy;X.c[b*3+2]=cz;X.r[b]=Math.sqrt(r2)+1e-3;}
  return X;
}
// distance² MINIMALE possible entre (x,y,z) et un point du casier b (0 si on est dans la sphère)
function dalleLb(X,b,x,y,z){const dx=x-X.c[b*3],dy=y-X.c[b*3+1],dz=z-X.c[b*3+2],g=Math.sqrt(dx*dx+dy*dy+dz*dz)-X.r[b];return g>0?g*g:0;}
// le point le plus proche parmi les indices multiples de `pas` (2 ou 8), dd < bd0 — identique au balayage complet.
// `graine` : un indice dont la distance borne déjà le minimum (le point élu à l'image d'avant) — on écarte tout casier plus loin.
function dalleProche(x,y,z,pas,bd0,graine){
  const X=dalleIx();let lim=bd0;
  if(graine>=0&&graine<NP&&graine%pas===0){const p=pts[graine],dx=x-p.x,dy=y-p.y,dz=z-p.z,d=dx*dx+dy*dy+dz*dz;if(d<lim)lim=d;}
  let bi=-1,bd=bd0;
  for(let b=0;b<X.nb;b++){
    const lb=dalleLb(X,b,x,y,z);if(lb>lim||lb>=bd)continue; // ni ce casier ni aucun de ses points ne peut battre le candidat
    const i1=Math.min(NP,b*DALLE_K+DALLE_K);
    for(let i=b*DALLE_K;i<i1;i+=pas){
      const p=pts[i],dx=x-p.x,dy=y-p.y,dz=z-p.z,dd=dx*dx+dy*dy+dz*dz;
      if(dd<bd){bd=dd;bi=i;}
    }
  }
  dalleProche.bd=bd;return bi;
}
