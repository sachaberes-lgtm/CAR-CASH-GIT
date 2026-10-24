/* ===== LE DEMI-TOUR (2026-10-17, Léo : « le moment où tu ratterris sur la route, mais dans le mauvais sens : la voiture ne reste pas sur la
   route et ne perd pas juste de vitesse, elle continue juste de tomber — qu'elle arrive à l'envers, "mauvais sens" écrit discrètement mais de
   manière stylée, une sorte de dérapage demi-tour un peu en burn-out, mais pas trop, qu'elle revienne sur la route automatiquement, et ça reprend »).
   MESURÉ AVANT (banc, pose forcée à 149°) : la caisse gardait un cap de 30° vers le BORD (psi = atan2(vLat,|vT|)), le moteur la relançait
   vers l'avant et elle sortait par le côté en ~1 s : chute, mort. À 180° pile, elle virait face à la route en UNE image.
   Toute pose À CONTRESENS (> 90°, hors PARC où les deux sens roulent) joue désormais LE DEMI-TOUR (~1,45 s) :
   · la caisse garde le cap de son ARRIVÉE (le nez du vol, à plat dans la dalle) et GLISSE sur son élan, les quatre pneus fument ;
   · elle pivote en 1,1 s sur une courbe douce (smootherstep : ça part en douceur, ça tourne, ça se pose sans dépasser) jusqu'à faire face
     à la route ; presque pile à l'envers, le nez part vers le MILIEU de la route ;
   · BURN-OUT léger : l'arrière patine et crache sa fumée, la caisse s'accroupit et repart (la moitié de l'élan, entre 40 et 80 % de la vmax
     du moteur — le moteur reprend ensuite comme d'habitude) ;
   · pendant la manœuvre les commandes dorment et elle ne peut pas tomber (graceT) : ramenée dans la largeur s'il le faut ;
   · la CAMÉRA tourne autour d'elle avec elle (elle part d'où était la caméra de vol) au lieu de la traverser ;
   · « MAUVAIS SENS » : le texte seul, petit (8 px), rouge cerné d'encre, au-dessus de la caisse ; il s'efface quand elle repart. Il remplace
     « À CONTRESENS ! » (flowCasse ne l'écrit plus pendant un demi-tour) ;
   · les TRAÎNÉES DE LUMIÈRE des feux (et l'arc-en-ciel) se TAISENT pendant la manœuvre : accrochées aux feux, elles dessinaient une boucle
     sur la route pendant le pivot. Elles s'éteignent en 0,9 s (SIL.OFF) et repartent, coupées net, quand la caisse repart.
   2e ESSAI (même jour) — Léo, après l'avoir vu en vrai : « le pivot, le panneau, les lumières faisaient un tour bugué, c'était un peu bizarre »
   → pivot « trop sec, trop rapide » (le ressort ω 6,5 tournait 180° en 0,43 s et dépassait de 17°), panneau « plus petit et discret » (la plaque
   rouge à double liseré est partie), traînées coupées.
   La RÈGLE ne bouge pas (Sacha, v4 : pose ratée = flow à zéro, pas de PARFAIT) : on a raté, mais on repart en beauté.
   Le lacet visuel est une rotation de carGroup autour de la normale de la dalle, posée APRÈS la caisse (comme le power-slide et le SLIDE 360) :
   la physique roule dans l'axe de la route, cap 0. `?demitour=0` = l'ancienne pose. Banc : `dbgDemiTour(angle°, vitesse, lat, hauteur)` envoie
   la caisse se poser à contresens (nez dans le sens du vol) ; `dbgDemiTour()` = l'état. */
var DMT={on:!/[?&]demitour=0\b/.test(location.search),act:false,t:0,D:1.45,tS:.8,TR:1.1,y0:0,y:0,yV:0,cam:0,camP:0,dc:0,vb:0,vo:0,vl:0,sg:1,burn:false,force:false,n:0,
  g:new THREE.Vector3(),f:new THREE.Vector3(),c:new THREE.Vector3(),nn:new THREE.Vector3(),v:new THREE.Vector3(),w:new THREE.Vector3(),fw:new THREE.Vector3(),
  el:null,eW:0,eTop:'',eLeft:''};
function dmtVmax(){return CARS[0].maxKmh/3.6*lateMul()*(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).push;} // le maxSp de la boucle (local à loop)
function dmtAng(f,n,g){DMT.c.crossVectors(n,f);return Math.atan2(g.dot(DMT.c),g.dot(f));} // l'angle, autour de n, qui mène f sur g (même sens que setFromAxisAngle(n,·))
function dmtArme(bI,sd){ // (tryLand) posée à contresens sur la dalle bI, face sd — lat, psi, vA viennent d'être posés
  const D=DMT,n=D.nn.copy(Nn[bI]).multiplyScalar(sd),f=D.f.copy(T[bI]),vm=vitMult(),mx=Math.max(20,dmtVmax());
  // le cap d'ARRIVÉE : le nez de la caisse en vol, à plat dans la dalle — nez au ciel (ou au banc) : la direction du vol
  D.g.set(0,0,1).applyQuaternion(carGroup.quaternion);D.g.addScaledVector(n,-D.g.dot(n));
  if(D.force||D.g.lengthSq()<.09){D.g.copy(fallVel);D.g.addScaledVector(n,-D.g.dot(n));}
  let y0=dmtAng(f,n,D.g);
  if(Math.abs(y0)>2.6){const b=D.c.crossVectors(n,f).dot(B[bI])*sd; // presque pile à l'envers : le nez part vers le MILIEU de la route (lat vit le long de B·sd)
    y0=(Math.abs(lat)>.3?-Math.sign(lat)*Math.sign(b||1):(Math.random()<.5?1:-1))*Math.abs(y0);}
  // la caméra part d'où elle REGARDE (la caméra de vol, derrière le vol) : elle orbite ensuite avec la caisse, du même côté qu'elle
  D.g.subVectors(carGroup.position,camera.position);D.g.addScaledVector(n,-D.g.dot(n));
  let yc=D.g.lengthSq()>.25?dmtAng(f,n,D.g):y0;yc=y0+Math.atan2(Math.sin(yc-y0),Math.cos(yc-y0));
  const vT=fallVel.dot(T[bI])/vm,vB=fallVel.dot(B[bI])*sd/vm; // (vA : la vitesse d'avant le multiplicateur, comme la pose)
  D.vb=THREE.MathUtils.clamp(-vT,0,mx*.9);D.vl=THREE.MathUtils.clamp(vB*.35,-mx*.15,mx*.15);D.vo=THREE.MathUtils.clamp(Math.hypot(vT,vB)*.5,mx*.4,mx*.8);
  D.y=y0;D.y0=y0;D.yV=0;D.cam=yc;D.camP=yc;D.dc=0;D.sg=y0>=0?1:-1;D.t=0;D.burn=false;D.act=true;D.n++;
  psi=0;yawR=0;slipB=0;driftYaw=0;driftEnCours=false;driftC=0;driftLv=0;vA=-D.vb;vL=0;driftT=1;
  graceT=Math.max(graceT,D.D+.3); // ni le bord, ni le dessous de la dalle, ni « ROULE OU CRÈVE » pendant la manœuvre
  try{if(SONV2)sfx('fig.slide');}catch(e){}
  dmtSigne(true);
}
function dmtConduite(dt){const D=DMT; // (boucle de conduite, après le lacet du pouce) la manœuvre REMPLACE la conduite du joueur
  D.t+=dt;const d=Math.min(dt,1/30);
  {const r=Math.min(1,D.t/D.TR),e=r*r*r*(r*(r*6-15)+10);D.y=D.y0*(1-e);} // le PIVOT : smootherstep sur 1,1 s (pointe ~5 rad/s pour 180°), il part et se pose en douceur, sans dépasser
  D.cam+=(D.y-D.cam)*(1-Math.exp(-d/.16)); // la caméra suit le cap de la caisse avec un temps de retard (on voit son flanc pendant le pivot) : elle ORBITE
  const x=D.t/D.tS,u=x<1?0:Math.min(1,(D.t-D.tS)/(D.D-D.tS));
  if(x<1)vA=-D.vb*Math.pow(1-x,1.5); // la GLISSE en arrière, que les pneus mangent
  else{vA=D.vo*u*u; // le BURN-OUT : ça patine d'abord, puis ça mord
    if(!D.burn){D.burn=true;try{if(SONV2)sfx('turbo.mini',{vol:-5});}catch(e){}hap([10,24]);fovPunch=Math.max(fovPunch,5);if(typeof sensCoup==='function')sensCoup(0,1.6,-.8);}}
  if(vA<0&&s<6)vA=0;
  D.vl*=Math.exp(-dt*3.5);lat+=D.vl*dt*SPD; // un reste de dérive latérale, qui meurt vite
  const lim=ROAD_HALF-(CARS[level].w||2)*.5-.35;if(Math.abs(lat)>lim)lat+=(Math.sign(lat)*lim-lat)*(1-Math.exp(-dt*7)); // ramenée sur le bitume
  psi=0;yawR=0;slipB=0;driftEnCours=false;driftC=0;driftLv=0;
  glisse9=Math.max(glisse9,x<1?.95:.8*(1-.7*u)); // la gomme crie et fume (son du crissement, fumée et traces de la boucle)
  graceT=Math.max(graceT,.25);
  if(D.t>=D.D){D.act=false;driftYaw=THREE.MathUtils.clamp(D.y,-.35,.35);D.y=0;D.yV=0;dmtSigne(false);} // le reste du lacet passe au power-slide, qui le rend en douceur
}
function dmtPose(F,dt){const D=DMT; // (conduite, après la pose de la caisse sur la route) le lacet de la manœuvre, la fumée, le panneau
  if(D.y){qTmp.setFromAxisAngle(F.n,D.y);carGroup.quaternion.premultiply(qTmp);}
  if(!D.act)return;
  const sp=CARS[level]||CARS[0],bo=D.burn,VC=PT_U.uVc&&PT_U.uVc.value,rp=emiN('dmt',dt*(bo?2:.8));
  D.w.set(0,0,-1).applyQuaternion(carGroup.quaternion); // l'arrière de la caisse (le patinage crache par là)
  for(let r=0;r<rp;r++){const sd=r&1?1:-1,av=!bo&&(r&2);
    D.v.set(sd*sp.w*.45,.25,(av?.38:-.38)*sp.l).applyQuaternion(carGroup.quaternion).add(carGroup.position);
    const k=bo?6.5:1.5;
    spawnP(dust,D.v.x,D.v.y,D.v.z,(VC?VC.x*.85:0)+D.w.x*k+(Math.random()-.5)*3,(VC?VC.y*.85:0)+.8+Math.random()*1.6,(VC?VC.z*.85:0)+D.w.z*k+(Math.random()-.5)*3,(bo?.5:.35)+Math.random()*.3);}
  dmtSigneSuit();
}
function dmtCamDir(fw,n){const D=DMT; // (caméra de conduite) la direction de la caméra, tournée avec la caisse — et après la manœuvre, elle se recale en douceur
  if(!D.cam)return fw;
  return D.fw.copy(fw).applyAxisAngle(n,D.cam);}
function dmtCamTick(dt){const D=DMT;if(!D.act&&D.cam){D.cam*=Math.exp(-dt/.14);if(Math.abs(D.cam)<.003)D.cam=0;}D.dc=D.cam-D.camP;D.camP=D.cam;} // dc : de combien la caméra a tourné depuis l'image d'avant
function dmtCoupe(){if(typeof DMT==='undefined'||!DMT)return;DMT.act=false;DMT.y=0;DMT.yV=0;DMT.cam=0;DMT.camP=0;DMT.dc=0;dmtSigne(false,true);} // vol, explosion, portail, replacement, nouvelle partie
/* LE « MAUVAIS SENS » : le texte seul, petit (8 px, police pixel), rouge cerné d'encre comme les textes du HUD, au-dessus du toit ; il suit la
   caisse à l'écran, apparaît en fondu et s'efface quand elle repart. (1er essai : un panneau routier rouge à double liseré et sa flèche —
   « plus petit et discret », Léo.) */
function dmtSigne(on,net){const D=DMT;
  if(!D.el){if(!on)return;
    const st=document.createElement('style');st.id='demiTour';st.textContent=
      '#dmtSigne{position:fixed;left:50%;top:40%;z-index:40;pointer-events:none;font-family:var(--pix);font-size:8px;line-height:1;letter-spacing:1px;'+
      'white-space:nowrap;color:#ff5e7a;text-shadow:1px 0 0 #1c0430,-1px 0 0 #1c0430,0 1px 0 #1c0430,0 -1px 0 #1c0430,1px 1px 0 #1c0430,-1px 1px 0 #1c0430,0 2px 0 #1c0430;'+
      'transform:translate(-50%,-100%);opacity:0;visibility:hidden}'+
      '#dmtSigne.on{visibility:visible;animation:dmtVient .18s ease-out both}'+
      '#dmtSigne.sort{visibility:visible;animation:dmtPart .3s ease-in both}'+
      '@keyframes dmtVient{0%{opacity:0;translate:0 4px}100%{opacity:.92;translate:0 0}}'+
      '@keyframes dmtPart{0%{opacity:.92}100%{opacity:0}}'+
      'html[data-reduced-motion="1"] #dmtSigne.on,html[data-reduced-motion="1"] #dmtSigne.sort{animation:none}html[data-reduced-motion="1"] #dmtSigne.on{opacity:.92}'+
      'body.ebOn #dmtSigne,body.ftOn #dmtSigne{visibility:hidden!important}';
    document.head.appendChild(st);
    const e=D.el=document.createElement('div');e.id='dmtSigne';e.setAttribute('aria-hidden','true');document.body.appendChild(e);}
  const e=D.el;
  if(on){e.textContent=TR('MAUVAIS SENS');D.eW=e.textContent.length*9+4;D.eTop='';D.eLeft='';
    e.classList.remove('sort');e.classList.remove('on');void e.offsetWidth;e.classList.add('on');dmtSigneSuit();} // (une fois par demi-tour : la relance synchrone est sans conséquence)
  else if(net){e.classList.remove('on');e.classList.remove('sort');}
  else if(e.classList.contains('on')){e.classList.remove('on');e.classList.add('sort');}
}
function dmtSigneSuit(){const D=DMT,e=D.el;if(!e||!e.classList.contains('on'))return;
  POP_V9.copy(carGroup.position).addScaledVector(camera.up,2.2).project(camera);
  const y=THREE.MathUtils.clamp((-POP_V9.y*.5+.5)*VP.h-8,laneY()+40,VP.h*.7),hw=D.eW*.5+6,x=THREE.MathUtils.clamp((POP_V9.x*.5+.5)*VP.w,hw,VP.w-hw);
  const t9=y.toFixed(0)+'px',l9=x.toFixed(0)+'px';if(t9!==D.eTop){D.eTop=t9;e.style.top=t9;}if(l9!==D.eLeft){D.eLeft=l9;e.style.left=l9;}}
Object.assign(I18N,{'MAUVAIS SENS':'WRONG WAY'});
window.dbgDemiTour=function(ang,v,la,h){
  if(ang==null)return {actif:DMT.act,on:DMT.on,t:+DMT.t.toFixed(2),lacetDeg:Math.round(DMT.y*57.3),cameraDeg:Math.round(DMT.cam*57.3),vA:+vA.toFixed(1),lat:+lat.toFixed(2),
    glisse:+DMT.vb.toFixed(1),relance:+DMT.vo.toFixed(1),n:DMT.n,mode:mode,panneau:!!(DMT.el&&DMT.el.classList.contains('on'))};
  if(!started||gameOver)return 'pas de course en cours';if(mode!=='drive')return 'déjà en vol : '+mode;
  const a=(+ang||180)/57.3,V=v==null?70:+v;DMT.force=true;setTimeout(function(){DMT.force=false;},6000);
  return window.dbgDauphin(h==null?12:+h,V*Math.cos(a),V*Math.sin(a),la||0);};
function tryLand(dt){
  // LE VIDE : on ne se pose pas sur une dalle qui n'existe pas (trous exclus dans dalleProche) — (2026-09-27) balayage en casiers
  const bestI=dalleProche(fallPos.x,fallPos.y,fallPos.z,2,1e9,tryLand._bi),bd=dalleProche.bd;
  tryLand._bi=bestI;
  if(bestI<0)return false;
  lastNearY=pts[bestI].y; // altitude de la route la plus proche (référence du plongeon fatal)
  {const hx=fallPos.x-pts[bestI].x,hz=fallPos.z-pts[bestI].z;lastNearH2=hx*hx+hz*hz;} // à plat : sert à savoir si on survole du BITUME ou du VIDE
  lastNearS=bestI/(NP-1)*L; // position le long de la piste PENDANT le vol (le LOD de proximité s'y recentre)
  dTmp.subVectors(fallPos,pts[bestI]);
  const hOff=dTmp.dot(Nn[bestI]),latOff=dTmp.dot(B[bestI]);
  // radar de dalle AVANT le filtre des 40 m (dauphin v3) : le DAUPHIN compte le vol au-dessus de la route jusqu'à DOL_HMAX, à
  // toute largeur. curTOff = décalage LE LONG de la piste : au-dessus d'un TROU le point le plus proche est le bord, ça le trahit.
  curNear=true;curHOff=hOff;curLatOff=latOff;curTOff=dTmp.dot(T[bestI]);VEQ.si=bestI;VEQ.sh=hOff;VEQ.sl=latOff;VEQ.sd=bd; // (vol équilibré) la pose se prépare sur ce radar
  if(bd>(bkCgBord()?(ROAD_HALF+BK_CG.w+24)**2:1600))return false; // (2026-10-18, GLACIER) la piste fait 196 m : à 40 m du centre (la règle des routes de 56 m), une caisse qui retombait sur la glace la TRAVERSAIT et tombait dessous — « des problèmes de collision avec la glace elle-même » (Sacha)
  const vN=fallVel.dot(Nn[bestI]);
  // FLANC de la dalle : la caisse COGNE la tranche et REBONDIT — c'est le BUMP.
  // Demi-jauge d'airtime rendue + du STYLE + le feedback (message, son, secousse).
  // (2026-10-15 soir, Sacha : « bump doit compter comme une figure additionnable comme les autres ») il ENTRE dans la chaîne :
  // sa valeur s'ajoute à la mallette et il monte le multiplicateur, comme une figure. La redite s'use (×0,6 par rebond du même
  // vol, comme une figure refaite) : longer la tranche à l'infini ne rapporte pas plus de 12,5 par vol (l'exploit reste fermé).
  const vB=fallVel.dot(B[bestI]);
  // ANTI-TUNNEL : où était la caisse à la frame d'avant, dans le repère de la dalle ?
  // À grande vitesse le pas d'une frame dépasse les fenêtres de contact — on teste la TRAVERSÉE.
  const prevH=hOff-vN*dt*SPD,prevL=latOff-vB*dt*SPD;
  /* (2026-10-01, LA POSE — MESURÉ au banc da/pose-cote.js) LE MUR INVISIBLE DU BORD : le BUMP se déclenchait jusqu'à 2,6 m AVANT la tranche
     (la caisse y était ramenée d'un coup) et jusqu'à 80 cm AU-DESSUS du bitume — une caisse qui revenait se poser par le côté, plus haute
     que la route, rebondissait sur du vide et repartait dans le ciel (« BUMP (h 0,79) puis tombée »). Le BUMP est le choc contre la TRANCHE :
     il faut que le flanc de la caisse l'atteigne (sa demi-largeur + le pas de l'image) et que ses roues soient au niveau de la dalle ou
     dessous (12 cm de marge, dessus comme dessous). Plus haut, elle passe le bord et se pose ; les traversées en une image restent prises. */
  const mrgB9=CARS[level].w*.5+Math.max(.2,Math.abs(vB)*SPD*dt*1.5);
  const bumpIn=Math.abs(latOff)>=ROAD_HALF&&Math.abs(latOff)<ROAD_HALF+mrgB9&&vB*Math.sign(latOff)<-3;
  const bumpThru=Math.abs(prevL)>=ROAD_HALF&&Math.abs(latOff)<ROAD_HALF&&Math.sign(prevL)*vB<-3; // paroi percée en une frame
  /* (bord, 1/10) LA CAISSE PORTÉE PAR LA LÈVRE : le temps qu'elle BASCULE (BASC_T, 0,45 s) — et tant que ses roues intérieures sont
     encore sur la route (le centre à moins d'une demi-largeur au-delà du bord) — la caisse n'est pas en chute libre : elle PIVOTE sur la
     lèvre, en suit la courbe et s'affaisse vers le vide (jusqu'à 35 cm) sans passer dessous. Mesuré (banc rattrape.js, trace) : à 350, la
     caisse partie tout droit se retrouvait 1 m SOUS le plan de la route en 0,08 s (la route qui remonte dans un creux, pas la gravité) —
     et elle ne pouvait plus que cogner la tranche. Braquer pendant la bascule la fait RACCROCHER (la lèvre, juste en dessous). C'est le
     sursis que donnait l'ancien bond de sortie (≈ 0,6 s au-dessus de −1,2 m), en plus long (≈ 0,8 s) et sans à-coup. */
  /* ⚠ (1/10, soir, Sacha : « des bugs quand on essaie de se poser sur la route ») : la portée n'avait pas de borne — `fallT` rendu par un
     bump la réarmait, et toute caisse passant SOUS la route dans la largeur était remontée d'un coup à la surface. Désormais : le temps
     vécu (`bascT`), jamais plus bas que la lèvre (LEVRE_H), la bande = AU-DELÀ du bord seulement, et un bump met fin à la bascule. */
  if(bascOn&&fallStartSide>0&&hOff>-LEVRE_H&&(bascT<BASC_T||(Math.abs(latOff)>=ROAD_HALF&&Math.abs(latOff)<ROAD_HALF+CARS[level].w*.5))){
    const hS9=-.35*Math.min(1,Math.max(bascT/BASC_T,(Math.abs(latOff)-ROAD_HALF)/(CARS[level].w*.5)));
    if(hOff<hS9){fallPos.addScaledVector(Nn[bestI],hS9-hOff);if(vN<0)fallVel.addScaledVector(Nn[bestI],-vN);}}
  /* (bord v2) LA LÈVRE : juste après une BASCULE, les roues sont encore au ras du bitume. Si la caisse revient vers la route à cet
     instant (le côté intérieur encore au-dessus de la dalle, 0,8 s au plus), le pneu ACCROCHE la lèvre et remonte, comme sur un trottoir — au lieu de
     cogner la tranche et d'être renvoyé au ciel par le BUMP. Plus bas que LEVRE_H, c'est la carrosserie qui heurte la tranche : BUMP.
     Rien n'est payé ni rendu (ni nitro, ni figure) : on a juste sauvé sa peau. Dessus seulement (la face du dessous n'a pas de sol). */
  if(bascOn&&fallStartSide>0&&sideCd<=0&&bascT<1&&hOff>-LEVRE_H&&hOff<.8&&Math.abs(latOff)<ROAD_HALF+CARS[level].w*.5&&vB*Math.sign(latOff)<-.5){
    levreRattrape(bestI,latOff,hOff,dTmp.dot(T[bestI]));return true;}
  /* (2026-10-01, LA POSE) LA LÈVRE POUR TOUTE POSE : la caisse qui touche la tranche avec ses roues à moins de LEVRE_POSE (45 cm) sous le
     bitume ne REBONDIT plus (MESURÉ : « BUMP (h 0,06, à 25 cm du bord) puis tombée » — les trois quarts de la caisse au-dessus de la route,
     et elle repartait dans le vide) : le pneu monte la marche et elle se POSE au bord — une vraie pose (la chaîne s'encaisse, la vitesse
     se paie comme partout). Plus bas, c'est la carrosserie qui cogne la tranche : BUMP, comme avant. */
  const tranche9=!bkCgBord()&&sideCd<=0&&hOff>-THICK-.12&&hOff<.12&&(bumpIn||bumpThru),levre9=tranche9&&hOff>-LEVRE_POSE&&fallT>.35&&vN<4.5?(bumpThru?Math.sign(prevL):Math.sign(latOff)):0;
  if(tranche9&&!levre9){
    const sg=bumpThru?Math.sign(prevL):Math.sign(latOff),impB=Math.abs(vB);
    fallVel.addScaledVector(B[bestI],-vB*1.65); // réflexion amortie sur la paroi
    fallVel.multiplyScalar(.78);
    if(TBORD.on){const vu9=fallVel.dot(TBORD.u);fallVel.addScaledVector(TBORD.u,Math.max(vu9+2.4,BUMP_VY*Math.sqrt(gK()))-vu9);TBORD.t=1.1;} /* (LE BORD DE LA ROUTE TORDUE) vers le ciel de LA ROUTE, et sa gravité se réarme : le DOUBLE BUMP reste possible */
    else if(VOLR.on){const vu9=volVu(fallVel);volMonte(fallVel,Math.max(vu9+2.4,BUMP_VY*Math.sqrt(gK()))-vu9);} /* (LE VOL QUI SUIT LA ROUTE) vers le ciel de la dalle survolée */
    else fallVel.y=Math.max(fallVel.y+2.4,BUMP_VY*Math.sqrt(gK())); /* (2026-10-01, LA POSE) la tranche RENVOIE la caisse vers le ciel — POUR DE BON : le +2,4 d'origine (calé sur une autre échelle de vitesse) ne valait plus que 4 cm de montée et s'AJOUTAIT à la chute — un BUMP était une condamnation (relevé par GRAPHISME, MESURÉ au banc : « BUMP (h −0,95) puis tombée », à chaque fois). La vitesse verticale REPART à BUMP_VY : ~1,9 m de montée (gravité monde 15,8 m/s²), ~1 s en l'air — une caisse qui a cogné la tranche à moins de 1,3 m sous le bitume remonte AU-DESSUS de la route et peut revenir s'y poser (le volant commande le vol) ; plus bas, elle reste dessous. √gK : même hauteur en gravité lunaire. */
    // (bord v2) la caisse est remise CONTRE la tranche (sa demi-largeur), là où elle la touche : avant, elle était téléportée à 1,8 m du bord
    // ET recalée sur le point de piste le plus proche (jusqu'à 1,6 m le long du ruban) — un saut d'image, pas un choc
    fallPos.addScaledVector(B[bestI],sg*Math.max(bumpThru?0:Math.abs(latOff),ROAD_HALF+CARS[level].w*.5)-latOff);
    sideCd=.35;bascOn=false; /* (1/10, soir) la tranche touchée : la bascule est finie */
    // ---- BUMP / DOUBLE BUMP / TRIPLE BUMP : une FIGURE de la chaîne (2026-10-15 soir : elle s'additionne aux autres) ----
    bounceN++;runStats.bumps++;secBord(); /* (DÉFIS SECRETS) FANTÔME : la tranche touchée */
    hap(24);{const nv9=nitroR;nitroGain(nitroBumpDe(bounceN,nitroOn&&pwrNitroT<=0&&!PARK.on),'bump');if(SONV2&&nitroR>nv9+.01)sfx('nitro.plein',{t:.1});}flowAdd(6,'style'); // (LA LOI DU RÉSERVOIR : ,35 puis ×,6 par rebond du même vol, rien au-delà du 4e, rien nitro allumée) LE BUMP RECHARGE (2026-09-25, demande du user) : un quart de cellule… de plus à chaque rebond
    fallT=Math.max(0,fallT-airMax()*.5);fallTR=Math.max(0,fallTR-airMax()*.5);airFlash=.6; // DEMI-JAUGE d'airtime rendue (sim + réelle)
    {const bf9=FIGV2.on&&BUMP_FIG_ON,c09=CHA.pts,s09=CHA.sansPop;if(bf9)CHA.sansPop=true; // (2026-10-18, HUD des figures v5) LE BUMP EST UNE FIGURE DU COMBO : son nom s'écrit en haut (plus « BUMP +30 » sur la caisse), il compte au ×
    try{addTrick('bump',bounceN===1?'BUMP':bounceN===2?'DOUBLE BUMP':bounceN===3?'TRIPLE BUMP — LA DALLE EN PLEURE':'MEGA BUMP x'+bounceN+' 💥',
      BUMP_VAL*Math.pow(.6,bounceN-1),Math.min(3,bounceN),true);}finally{CHA.sansPop=s09;} // (2026-10-15 soir) plus `free` : il PAIE dans la chaîne (mallette + multiplicateur), la redite s'use ici (raw : le nom porte déjà le compte)
    if(bf9)try{figBumpNote(bounceN,CHA.pts-c09);}catch(e){}}
    bumpSfx(bounceN);
    thud(impB);if(!SONV2)noiseBurst(.14,.09,1100); // choc + froissement de tôle (console : pose.choc le porte)
    shake=Math.min(1.3,.3+impB*.03);
    dropChip(2+Math.floor(Math.min(4,impB*.12))); // ça casse ENCORE PLUS de bouts
    if(!SENS)sparkBurst(sparkGold,carGroup.position,12,10); // (2026-10-14, gameplay · accord) sous SENS, la gerbe naît au FLANC qui cogne (sensBumpFlanc, ligne suivante) : deux gerbes d'or à la même image — une boule au centre de la caisse ET une au flanc — n'en font plus qu'une, au bon endroit
    if(SENS)try{sensBumpFlanc(B[bestI],T[bestI],Nn[bestI],sg,impB);}catch(e){} // (2026-10-14, sensations · pose) le flanc RACLE la tranche : la gerbe part du point de contact
    squashT=Math.max(squashT,.22);
    return false; // toujours en vol — enchaîne les bumps !
  }
  let sideL=0;
  if(levre9||(fallT>.35&&hOff>-1.2&&hOff<3&&vN<4.5))sideL=1;                     // face du dessus (fenêtre élargie) — ou la LÈVRE (voir levre9)
  else if(fallT>.1&&prevH>-1.2&&hOff<=-1.2&&vN<4.5)sideL=1;      // dessus PERCÉ : TOUTE traversée du plan supérieur est rattrapée (plus de seuil d'amplitude → fini la caisse qui passe à travers la route)
  else if(fallT>.35&&hOff>-THICK-3&&hOff<-THICK+1.2&&vN>-4.5)sideL=-1; // face du dessous
  else if(fallT>.1&&prevH<-THICK+1.2&&hOff>=-THICK+1.2&&vN>-4.5)sideL=-1; // dessous percé en montant : idem, toute traversée compte
  // ⚠ LE DERNIER AXE SANS BALAYAGE (2026-08-03) — c'est LUI, « je passe à travers la route parfois ».
  // La traversée du plan de la dalle est rattrapée depuis longtemps (prevH, juste au-dessus), mais le
  // test LATÉRAL ne regardait que la position de CETTE frame. Une caisse qui perce le plan tout en
  // sortant sur le côté dans la même frame se retrouvait avec |latOff| déjà hors dalle : refusée par
  // l'atterrissage, et hors de la fenêtre du BUMP si elle s'éloignait — donc elle traversait le bitume.
  // `prevL` existait déjà (calculé pour le bump) : il suffisait de s'en servir. On accepte si la caisse
  // était SUR la dalle à un bout OU l'autre du segment, et on ramène `lat` dans la largeur.
  // (2026-09-25, user : « PAS DU TOUT d'assistance ») : on acceptait la pose si UN bout du segment touchait la dalle, puis on
  // RAMENAIT la caisse dans la largeur — un aimant de plus. Désormais : le point EXACT où la trajectoire traverse le plan de la
  // dalle (interpolé entre l'image d'avant et celle-ci) ; s'il est au-dessus du vide, on tombe. Aucun recentrage.
  if(!sideL)return false;
  const hS9=sideL>0?0:-THICK,dh9=prevH-hOff,f9=Math.abs(dh9)>1e-4?THREE.MathUtils.clamp((prevH-hS9)/dh9,0,1):1,latX9=levre9?levre9*(ROAD_HALF-.05):prevL+(latOff-prevL)*f9; /* (la LÈVRE : posée au bord, roues intérieures sur le bitume) */
  if(Math.abs(latX9)>=ROAD_HALF+(sideL>0?bkCgBord():0))return false; /* (2026-10-18, GLACIER) on se pose aussi dans la congère */
  s=THREE.MathUtils.clamp(bestI/(NP-1)*L+THREE.MathUtils.clamp(dTmp.dot(T[bestI]),-2,2),0,L-1);
  side=sideL;{const lm9=ROAD_HALF-.02+(sideL>0?bkCgBord():0);lat=THREE.MathUtils.clamp(latX9,-lm9,lm9)*sideL;}
  // RÉCEPTION EN GLISSE : la caisse se pose de travers et rattrape — petit drift au lieu d'un psi=0 sec
  {const vTan=fallVel.dot(T[bestI]),vLat=fallVel.dot(B[bestI])*sideL;
   psi=THREE.MathUtils.clamp(Math.atan2(vLat,Math.abs(vTan)+1),-1.4,1.4);yawR=steer*lacetVol(fallVel.length());slipB=0;driftYaw=0;veqPose(bestI,sideL); /* (2026-10-09) yawR = le lacet du VOL (même formule que yawIn) : volant tenu, la caisse ne « s'arrête » plus de tourner à la pose avant de repartir — elle rejoint le lacet du sol en VOL_TAU */ // (2026-09-25) le cap de la pose = la direction EXACTE du vol — plus de redressement (×0,6) : c'était une aide
   driftT=Math.max(driftT,Math.min(1,.45+Math.abs(psi)));} // …et la fumée/le crissement suivent tout seuls
  {const vm9=vitMult(),vT9=fallVel.dot(T[bestI])/vm9,vB9=fallVel.dot(B[bestI])/vm9;vA=vT9>0?Math.hypot(vT9,vB9):vT9;vL=vB9*.4*sideL;} /* (2026-10-15, Sacha : « quand on arrive sur la route en volant avec un certain angle on est ralenti d'un coup, on ne peut pas la couper ») LA COUPE GARDE SON ÉLAN : au sol vA est la vitesse le long du CAP (on avance de vA·cos psi, on dérive de vA·sin psi), et le cap posé juste au-dessus EST la direction du vol — vA = toute la vitesse à plat, plus sa seule part dans l'axe : le cosinus de l'angle était compté DEUX fois (45° → la moitié de l'avance envolée, 60° → les trois quarts). À contresens, inchangé. */ // (2026-09-30) le vol porte la vitesse RÉELLE (× vitMult) : à la pose, on la ramène au vA d'avant le multiplicateur — sans ça, le boost comptait DEUX fois
  if(PARK.on){driveDir=vA<0?-1:1;vA=Math.abs(vA);}else driveDir=1; // PARC : on repart dans le sens d'atterrissage (les deux directions roulent) ; COURSE : toujours vers l'avant
  // ATTERRISSAGE : l'impact ralentit la caisse — d'autant plus que le saut etait gros
  const nPose9=nitroR;{const nv9=nitroR;nitroGain(nitroPoseDe(nitroCap(),NIT.vol,NIT.nit)*veqNitK(),'pose');if(SONV2&&nitroR>nv9+.01)sfx('nitro.plein',{t:.2});} // (2026-09-26, user) TOUTE pose rend 20 % de nitro — parfaite, lourde, à l'arrachée · (2026-10-01, LA LOI DU RÉSERVOIR) au prorata du vol fait NITRO COUPÉE, et pleine à partir de 1,2 s de vol : ce qu'on brûle en l'air ne revient pas à la pose
  const impact=Math.abs(vN);
  /* (v4, Sacha : « en cas de mauvais atterrissage, de manière trop obtuse ou à contresens, le flow retourne à zéro ») L'ANGLE DE POSE :
     l'écart entre la trajectoire (à plat dans la dalle — c'est aussi le cap de la caisse, le volant tourne le vol lui-même) et l'axe de
     la route. 0° = axé, 90° = en crabe, 180° = à contresens. Au-delà de FLOW2.pose.angle : pose RATÉE — pas de PARFAIT possible, et le
     flow (frénésie comprise) tombe à zéro une fois la pose jugée. Une chute presque verticale (< vMin à plat) n'a pas de cap : jamais ratée. */
  const vT8=fallVel.dot(T[bestI]),vL8=fallVel.dot(B[bestI]),poseAng=Math.hypot(vT8,vL8)>FLOW2.pose.vMin?Math.atan2(Math.abs(vL8),vT8)*57.3:0;
  const poseRatee=(!PARK.on&&poseAng>FLOW2.pose.angle)||VEQ.rate; /* (2026-10-14) posée en plein SALTO / TOUPIE : ratée */ FLOW.poseA=Math.round(poseAng); // (banc) le dernier angle de pose — (2026-10-14, revue des idées de Léo) il était collé au commentaire d'avant, donc avalé : jamais écrit
  if(DMT.on&&!PARK.on&&poseAng>90)dmtArme(bestI,sideL); // (LE DEMI-TOUR) posée à contresens : la caisse glisse, pivote d'un coup de frein à main et repart — au lieu de filer vers le bord (voir DMT)
  const figN9=FX2.nitL|0;{const nf9=nitroR,g9=figNitRend(!poseRatee);if(SONV2&&g9>.01&&nf9<=nPose9+.01)sfx('nitro.plein',{t:.2});} /* (POSER UNE FIGURE RAPPORTE) le compte = les figures LANCÉES du vol ; le « plein » sonne aussi quand tout part dans la réserve bleue */ // (2026-10-17, LA FIGURE SE PAIE — loi 6) chaque figure plantée rend 30 % à la pose RÉUSSIE ; de travers, à contresens ou en plein tour : perdu — le « plein » sonne une fois, avec celui de la pose
  const bigness=Math.max(0,fallT*gK()-.8); // ×gK : en orbite un même saut dure 2× plus — il ne doit pas coûter 2× plus de vitesse à la pose
  const landLoss0=Math.min(.30,bigness*.15+impact*.008),dnS9=DN.on?dnSurf(bestI,fallVel,poseRatee):null,landLoss=dnS9?landLoss0*(1-.92*dnS9.a):landLoss0; /* (2026-10-23, DUNES, Léo : « comme le jeu du pingouin : il faut atterrir pour prendre la vitesse ») SE POSER SUR LA PENTE : une pose axée sur une descente ne coûte presque rien et DONNE de la vitesse (voir dnSurf) */ if(dnS9){vA*=1+dnS9.g;dnSurfFx(dnS9);} // un peu plus doux qu'avant — (2026-10-09, Sacha : « plus généreuse ») plafond .52 → .30 : un grand vol ne coûte plus la moitié de la vitesse à la pose
  /* (2026-10-17, LA POSE QUI MORD AU CONTACT) la perte de vitesse de la pose (même formule, même plafond de 30 %) ne tombe plus à la
     DÉCLARATION — jusqu'à 3 m au-dessus du bitume, 0,1 à 0,3 s avant les roues, en UNE image : la caisse freinait EN L'AIR. Elle part
     au contact (touche9, avec le choc, la gerbe et la gomme) et s'étale sur ~0,2 s (vFrein, LE FREIN ÉTALÉ). */
  if(landLoss>.2&&impact>=4.5)dropChip(2); // (2026-10-09) la tôle qui part = une pose DURE : un grand vol posé en douceur (PARFAIT) ne se casse plus
  if(landLoss>.28&&fallT>1.6)slowT=Math.max(slowT,.25);
  if(window.__poseJ)window.__poseJ.push({h:+hOff.toFixed(2),hAvant:+prevH.toFixed(2),lat:+latX9.toFixed(2),vN:+vN.toFixed(1),vT:+fallVel.dot(T[bestI]).toFixed(1),face:sideL,t:+fallT.toFixed(2),vA:+vA.toFixed(1),psi:+psi.toFixed(2)}); /* (banc) le journal des poses */
  prevTvalid=false;mode='drive';duckT=Math.max(duckT,.2*SVOL.k); /* (2026-10-14, session SON) LA RÉSOLUTION : la pose d'un vol tendu creuse les chaînes continues ~80 ms (dk ≥ .9, duckT retombe à 2,6/s) — le verdict (pose.parfait, choc) claque dans ce creux, puis la tension retombe en ~0,2 s (SVOL.k hors du vol) */
  /* LA POSE SANS SAUT (2026-10-01, Sacha : « il y a des bugs quand on essaye de se poser sur la route » — MESURÉ au banc des poses,
     da/pose-banc.js, 144 lâchers à 1/60 s) : la pose est DÉCLARÉE dès que la caisse passe sous 3 m de la dalle (la fenêtre élargie), et la
     conduite la posait SUR le bitume à l'image suivante — elle descendait de 2,1 à 2,6 m EN UNE IMAGE (le monde sautait à l'écran, 0,12 à
     0,20 NDC contre 0,01 à 0,06 pour un pas normal), et la gerbe, le choc et le tassement partaient en l'air, un quart de seconde trop tôt.
     Désormais la hauteur qui reste devient un SAUT de conduite (hopY / hopV, la mécanique du dos d'âne et du replacement) : la caisse FINIT
     sa descente à sa vitesse de chute, et la gerbe, le choc, la secousse, le tassement et la gomme partent AU CONTACT (POSE_F). La règle de
     pose (quand on est posé, où, à quelle vitesse, ce que ça paie) ne change pas d'une virgule. */
  const sensPsi9=psi,sensVer9=fallT>.7||chain>0||chainVal>0; // (2026-10-14, sensations · pose) le crabe de l'arrivée, et « cette pose aura-t-elle un verdict (donc sa vibration) ? » — lus ICI, rendus au contact (sensPose)
  {const hR9=sideL>0?hOff:-THICK-hOff,nI9=bestI,lL9=landLoss,vN9=vN,imp9=impact,sd9=sideL;
   const touche9=function(){
     vFrein(1-lL9); // (2026-10-17) la pose mord AU CONTACT, en ~0,2 s (voir plus haut)
     veqContact(imp9,nI9,sd9); // (2026-10-14) LE CONTACT : la suspension claque, le nez plonge, la caméra s'enfonce
     poseGerbe(carGroup.position,Nn[nI9],sd9,T[nI9],vA*SPD*driveDir,imp9); // (2026-09-26) la GERBE DE POSE : étincelles de châssis qui rasent le bitume + gomme
     thud(Math.abs(vN9)*(imp9<4.5&&lL9<.2?.75:1));shake=Math.min(1.4,.35+Math.abs(vN9)*.05+lL9*.6);squashT=Math.max(squashT,.1+Math.min(.2,imp9*.022)); // (2026-09-28) la caisse se TASSE sur ses ressorts à la pose // (2026-09-25) la pose PARFAITE ne cogne plus plus fort que la lourde
     if(SENS)try{sensPose(imp9,sensPsi9,sensVer9);}catch(e){} // (2026-10-14, sensations · pose) le nez plonge selon le choc, la caisse verse si elle arrive en crabe
     if(SENS&&SCOUP.vp)try{const p9=SCOUP.vp,n9=performance.now();SCOUP.vp=0;if(n9-SCOUP.vt<1200&&(n9-(hap._t||-1e9)>=70||(hap._k||0)<(p9>40?3:2)))hap(p9);}catch(e){} // (2026-10-14, accord) la vibration du VERDICT, gardée depuis la déclaration : elle tombe avec les roues (et se tait si une autre, aussi forte, vient de partir)
     if(SENS&&SCOUP.fp)try{const d9=SCOUP.fp===2;SCOUP.fp=0;if(performance.now()-SCOUP.vt<1200){hitT=Math.max(hitT,SCOUP.fh);poseParfaiteFx(d9);}SCOUP.fh=0;}catch(e){} /* (2026-10-14, gameplay · œil · pose — Sacha : « oui ») LE PARFAIT TOMBE AVEC LES ROUES : le gel (hitT), le flash, le coup de zoom et la couronne dorée partaient à la DÉCLARATION (3 m du bitume, 0,1-0,4 s avant le contact) ; ils attendent désormais le contact, comme la vibration du verdict (SCOUP.vp). Posée tout de suite : inchangé. `?sens=0` : comme avant. */
     engRpm*=.6;charge9=1;if(imp9>2)pneuMord(Math.min(1,imp9/10));}; // la gomme MORD : le moteur reprend en charge, et ça piaille
   if(hR9>.25){hopY=hR9;hopV=(sd9>0?vN9:-vN9)*SPD;POSE_F=touche9;}else{hopY=0;hopV=0;POSE_F=null;if(sd9>0&&hR9<0)levreY=Math.max(-.6,hR9);touche9();}} /* posée SOUS le niveau du bitume (lèvre, plan percé) : elle remonte sa marche en ~0,15 s (levreY) au lieu d'y sauter */
  /* ---- LA RÉCEPTION À L'ARRACHÉE (2026-08-18) -------------------------------------------------
     Se poser À UN CHEVEU du couperet des 6 secondes. C'est le geste le plus tendu du jeu : rester en
     l'air paye en chaîne, mais dépasser tue — donc le style consiste à frôler la limite.
     ⚠ mesuré sur `fallTR` (le temps VÉCU, celui du camembert), pas sur `fallT` (le temps-sim, qui
     court plus vite dans l'endgame) : le joueur joue contre le chrono qu'il VOIT.
     ⚠ et seulement si la jauge courait vraiment — sous pouvoir d'AIRTIME INFINI il n'y a aucun
     risque, donc aucun mérite. */
  if(pwrAirT<=0){
    const reste=airMax()-fallTR;
    if(reste>0&&reste<=.30){
      const extreme=reste<=.10;
      chaineAura(extreme?'AU CHEVEU':'ARRACHÉE',extreme?220:120,'cheveu',false,SONV2);if(SONV2)sfx('pose.cheveu');
      flowAdd(extreme?20:12,'risque'); // (FLOW v2) le geste le plus tendu du jeu : on a joué avec la mort — la triade adore
      if(TCTL.on)popTexte(extreme?'AU CHEVEU !!':'ARRACHÉE !','#ff5ec8',3); // (2026-09-25) le geste le plus tendu du jeu se LIT aussi sur téléphone
      trickMsg(TR(extreme?'⏱ AU CHEVEU —':'⏱ À L\'ARRACHÉE —')+' '+decFr(reste,2)+' s'+(extreme?(LANG==='fr'?' !!':'!!'):''),3);
      sparkBurst(sparkGold,carGroup.position,extreme?30:16,14);
    }
  }
  // ---- LE VERDICT : la CHAÎNE se cashe — grade de réception × face × série ----
  /* (2026-10-14, gameplay · accord) LA MAIN SENT LE CONTACT, PAS LA DÉCLARATION. La pose est déclarée à 3 m du bitume (voir LA POSE SANS
     SAUT) ; la caisse finit sa descente en hopY et TOUT le choc part au contact (touche9 : gerbe, thud, secousse, suspension, nez, caméra
     de Léo) — sauf la vibration du verdict, qui partait ici, un quart à un tiers de seconde AVANT les roues (mesuré au banc). Elle attend
     désormais le contact (SCOUP.vp, joué par touche9). Posée tout de suite (sans descente) : rien ne change. `?sens=0` : comme avant. */
  const hapV9=SENS&&POSE_F?function(p){SCOUP.vp=p;SCOUP.vt=performance.now();}:hap;
  if(fallT>.7||chain>0||chainVal>0){ // (2026-09-26) chainVal>0 : le REPORT annoncé au décollage se paie même sur une courte sortie
    // le grade juge tout le vol : pose soyeuse = jackpot, pose écrasée = décote
    let g=1,gTxt='';
    if(poseRatee){g=.65;gTxt='';} // (v4) de travers ou à contresens : la décote du POSÉ LOURD, et c'est la chute du flow qui parle
    else if(impact<4.5){g=1.5;gTxt='PARFAIT ! ';hitT=.08;hapV9(15);} // (2026-10-09, Sacha : « plus généreuse ») PARFAIT = douce ET dans l'axe, quelle que soit la durée du vol — `landLoss<.2` l'interdisait au-delà de ~2 s (AIR MONSTRE jamais PARFAIT) ; le remboursement de nitro reste au prorata du vol réacteur coupé
    else if(impact>=10){g=.65;gTxt='POSÉ LOURD — AÏE… ';hapV9(45);}
    else hapV9(14); // chaque pose se SENT dans la main (la parfaite a son coup sec plus haut, la lourde son choc)
    if(fever>0&&!poseRatee){ // BRAQUAGE : tous les grades montent d'un cran — même la casse pardonne (pas la pose ratée)
      if(g===1.5){g=2;gTxt='DIVIN !! ';}
      else if(g===1){g=1.5;gTxt='PARFAIT (BOOST ×2) ! ';hitT=.08;hapV9(15);}
      else{g=1;gTxt='';}
    }
    if(g>=1.5){if(SENS&&POSE_F){SCOUP.fp=g>=2?2:1;SCOUP.fh=hitT;hitT=0;}else try{poseParfaiteFx(g>=2);}catch(e){}} // (2026-09-28) coup de zoom + couronne dorée — (2026-10-14, œil · pose) sous SENS, AU CONTACT comme sa vibration : joués par touche9
    if(fallT>.7)sfaPose(!poseRatee&&g>=1); // (2026-09-28) SANS FAUTE : les poses propres d'affilée
    secPose(g,poseRatee,fallT,Math.hypot(fallVel.x,fallVel.z)*3.6*SPD);m2Pose(g,poseRatee,fallT); /* (2026-10-16) LES MISSIONS v2 : parfaites d'affilée, 5 s en l'air, chaque map */ // (2026-10-14) LES DÉFIS SECRETS : PRISME, OR ROSE, NACRE
    rollover=0; // (2026-09-29, passe qualité) plus de REPORT : il date de la mallette d'argent — les figures ne paient plus qu'en aura, et le report fabriquait une FAUSSE figure au vol suivant (verdict, voix, mission « figures » comptée sur une simple chute)
    if(g>=1.5)momT=Math.max(momT,3);else if(g<1)momT*=.5; // (momentum v2) PARFAIT relance la vitesse, POSÉ LOURD en coûte la moitié
    if(g<1){try{if(SONV2){/* (console) pose ratée : flowCasse */if(!poseRatee)sfx('pose.lourde');}else{clank9(0,190,.12);clank9(.05,135,.09);}}catch(e){}if(!poseRatee)flowFaute('n',FLOW2.faute.lourd,.5);} // (v5) POSÉ LOURD : -NARCISSE // (2026-09-25) POSÉ LOURD : la TÔLE, sans carillon
    if(Math.abs(latOff)<ROAD_HALF*.3){chainVal+=4;chainMult+=.2;trickMsg('PILE AU CENTRE 🎯',false);} // posé sur l'axe
    if(sideL<0&&chainVal>0)trickMsg('FACE CACHÉE ×2',2);
    streak++;
    // (vague 3) qG = la VALEUR DU GESTE, à l'échelle d'AVANT la vague 3 (FLOW +0,5/palier, SÉRIE jusqu'à ×2) : c'est elle qui décide
    // des pièces MOTEUR, des verdicts de l'annonceur et de la pose muette — rééquilibrer l'argent ne doit changer ni la montée du
    // moteur, ni les verdicts, ni quelle pose compte comme figure. Le GAIN, lui, suit ECO3 (et ne tombe jamais à 0 $ par arrondi).
    const qG=chainVal*Math.min(6,chainMult)*g*(sideL<0?2:1)*(1+FLOW.lv*.5)*(streak>=2?1+Math.min(1,streak*.1):1)*(fever>0?2:1);
    const gain=qG*DENOMS[Math.min(engTier,DENOMS.length-1)]<.5?0:Math.max(1,Math.round(flowMult()*denom()*chainVal*Math.min(6,chainMult)*g
      *(sideL<0?2:1)*ecoSerie()*(fever>0?2:1)));
    /* (2026-09-29, Sacha : « les figures ne doivent plus rapporter d'argent, seulement de l'aura ») — PLUS UN DOLLAR À LA POSE. `gain` ne
       sert plus qu'à dire si la pose porte une figure (sinon elle reste muette) : l'aura (chaineAura), le flow, le nitro, les verdicts de
       l'annonceur et les pièces du MOTEUR (une ressource de la partie, pas de l'argent) sont gardés ; l'argent, la caisse enregistreuse et
       les billets qui volent vers le compteur s'en vont. L'argent vient des pièces, du portail et de la campagne (les fruits ne donnent que du nitro). */
    // CONTRATS « POSE(S) PARFAITE(S) » (2026-09-30) : elle ne comptait que la parfaite qui ENCAISSE une figure — or une pose parfaite sans
    // figure a sa couronne et son zoom, et l'auto-école apprend « or = parfait ». Compte : tout VRAI vol (fallT>.7, le seuil de SANS FAUTE)
    // posé parfait, plus la courte sortie parfaite qui encaisse (elle comptait déjà) — une fois par pose, on est dans le verdict.
    if(g>=1.5&&!poseRatee&&(fallT>.7||gain>0))RUNX.perfect++;
    if(gain>0){ // l'airtime brut ne rapporte RIEN : sans chaîne à casher, la pose est muette
      flowAdd(g>=2?14:g>=1.5?10:4,g>=1.5?'risque':'style',sideL<0?'m':'n'); // (v5) posé sur la FACE CACHÉE : l'envers du décor, c'est MACHIAVEL // FLOW : une figure encaissée nourrit la montée — la pose PARFAITE est un RISQUE (on a visé), l'ordinaire du style
      if(!figN9)nitroGain(nitroFigDe(chainMult,g,NIT.vol,NIT.nit)*veqNitK(),'figure'); /* (loi 6) un vol à figures est payé par figNitRend, juste au-dessus */ // (LA LOI DU RÉSERVOIR : au prorata du vol nitro coupée) LA FIGURE RECHARGE LE NITRO — plus la chaîne est longue, plus ça remplit ; une pose parfaite ×1,5, DIVINE ×2 (l'échelle des grades monte aussi ici)
      // LA CAISSE ENREGISTREUSE : seulement sur un ENCAISSEMENT QUI COMPTE. Sur chaque pose,
      // meme minuscule, le son deviendrait un tic — et 9 samples n'y changeraient rien.
      runStats.tricks++;
      // ---- ANNOUNCER : la réplique la plus RARE l'emporte (chacune tombe 1 fois sur 3) ----
      const q=qG; // (vague 3) la valeur du GESTE, pas celle du dollar (voir qG)
      let vKey=q>=140?'m3':(q>=45?'m2':'m1');
      let vTier=q>=140?3:(q>=45?2:1);
      const vTxt=annSpeak(vKey)||'MONSTRE';
      trickMsg(gTxt+vTxt,vTier); // (2026-09-29) plus de « +$ » : la figure paie en aura (la chaîne le dit)
      // LES FIGURES RAPPORTENT DES PIÈCES : une belle chaîne fait progresser le MOTEUR, pas seulement
      // le portefeuille. 2 pièces pour une figure honnête, jusqu'à ~18 pour un enchaînement monstrueux.
      poseSndT=performance.now(); // la pose va sonner : un palier moteur franchi par ces pièces attendra son tour (voir addCoins)
      addCoins(Math.max(2,Math.min(18,Math.round(2+q/6))));
      rewardSfx(vKey,vTier); // signature sonore courte assortie à la récompense
      if(TCTL.on&&g>=1.5)popTexte(g>=2?'DIVIN !!':'PARFAIT !',g>=2?'#ff5ec8':'#ffd75e',2);
      if(g>=1.5)chaineAura(g>=2?'POSE DIVINE':'POSE PARFAITE',g>=2?120:70,'pose',false,true); // (aura v2) la pose PROLONGE la chaîne // (2026-09-25) la pose ×1,5 : LE geste à répéter — il faut qu'on le voie
      if(g>=1.5){try{if(SONV2)sfx(g>=2?'pose.divin':'pose.parfait',{t:.08});else{ /* (2026-10-14, session SON) la POSE DIVINE (×2) a SON son, pose.divin : le tchak de la PARFAITE, puis chœur, cloches et pluie d'or (avant : le tchak une quinte plus haut) */chimeNote(1980,.08,.055,.2);chimeNote(2640,.11,.04,.26);sparkle(.08,.06);if(g>=2)chimeNote(1320,.15,.06,.4);}}catch(e){}} // (2026-09-25) le « tchak » du PARFAIT : harmoniques 3 et 4 du 660, au-dessus de l'arpège
      landBoom(carGroup.position,vTier); // P'TIT BOOM D'ATTERRISSAGE : toute figure MONSTER+ éclate à la pose (calibré sur le tier)
      boost=Math.max(boost,1.2);
      addStyle(14+chain*4);
    }
    if(SONV2&&g>=1.5&&!(gain>0))sfx(g>=2?'pose.divin':'pose.parfait',{t:.08}); // (console de son) PARFAIT sans rien à encaisser : le tchak quand même, une fois
    if(SONV2&&g===1&&!poseRatee&&fallT>.35)sfx('pose.nette',{t:.06}); /* (2026-10-14, session SON — étape 3) la POSE ORDINAIRE a son petit son (pose.nette), sous la PARFAITE et la DIVINE — pas sur un saut de puce */
    if(fallT>2)slowT=.35; // slow-mo savoureux sur les gros airs
  }
  // (FLOW v2) LE RACCOURCI, DANS TOUS LES MODES : la piste parcourue entre le décollage et la pose, moins la distance VOLÉE en ligne
  // droite — un saut ordinaire donne ~0 (la route suit le vol), couper une boucle ou tomber sur la dalle d'en dessous donne des centaines
  // de mètres. C'est le geste que la triade réclame : on triche, et ça paie.
  let rc9=false;if(!PARK.on){const gagne=(s-FLOW.s0)-FLOW.p0.distanceTo(fallPos),fl9=filetDe(FLOW.s0,s);if(fl9)filetRattrape(fl9);else if(gagne>=60){flowRaccourci(gagne,true);rc9=true;}else if(gagne>=25)frenTrait('m',gagne/60);} // (2026-09-29) posé dans le FILET de son virage : RATTRAPÉ, pas RACCOURCI (voir FILET) // (v4) une PETITE coupe nourrit MACHIAVEL au prorata
  /* (2026-09-29, Sacha : « le son "low honor" de Red Dead, une petite note quand tu perds de l'honneur — pendant la frénésie, à chaque fois
     que le joueur atterrit ») LA NOTE DE LA POSE EN FRÉNÉSIE : un son ORIGINAL dans cet esprit (le fichier de Rockstar est protégé), fait par
     la console de son. Pas sur un petit saut (< 0,4 s), pas sur la pose ratée (elle a son son et éteint la frénésie), pas sur la pose qui
     DÉCLENCHE la frénésie (FLOW.lv lu avant). Après le « tchak » de la pose (t .15). */
  if(FLOW.lv===4&&!poseRatee&&!PARK.on&&fallT>.4&&SONV2)sfx('frenesie.pose',{t:.15});
  if(VEQ.rate&&FIGV2.on)figChute(); // (2026-10-14, LES FIGURES v2) la CHUTE : comme au BMX, les figures de ce vol ne sont pas gagnées
  else if(FIGV2.on)figComboEncaisse(); // (2026-10-15) …et posée propre, LE COMBO DU VOL s'encaisse
  if(poseRatee)flowCasse(poseAng>90,VEQ.rate?'FIGURE RATEE !':null); // (v4) la pose est jugée (chaîne encaissée, raccourci compté) : ENSUITE le flow tombe
  else if(FREN.arme&&FLOW.lv<4&&(chain>0||trkBigA||(rc9&&FLOW2.decl.racc)))frenDeclenche(); // (v4) jauge pleine + FIGURE POSÉE : la FRÉNÉSIE part, ici, au contact · (loi 20) en VILLE, le RACCOURCI posé aussi
  chainHud.style.opacity=0;
  caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  return true;
}
