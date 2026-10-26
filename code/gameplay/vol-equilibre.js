/* LE VOL ÉQUILIBRÉ (2026-10-14, Léo : « en vol, la voiture tourne dans le sens de la route qu'elle a quittée ; il faudrait qu'elle QUITTE la
   route, avec un effet réaliste de BALANCE dans l'air — équilibré ; selon l'endroit du joystick, la voiture se pivote et se dirige »).
   Ce qui tournait : (1) le volant TENU dans le virage continuait de tourner la trajectoire en l'air, au lacet du sol — la caisse suivait la
   courbe qu'elle venait de quitter ; (2) la VRILLE visuelle permanente (3 rad/s autour du nez, vers le vide après le bord) ; (3) le haut du
   vol partait de la normale de la route (penchée dans les virages relevés) et y restait.
   · LE VOLANT SE RÉ-ARME AU DÉCOLLAGE (`veqVolant`) : la part du braquage tenue depuis la route s'efface sur VIRVOL.latch s — la caisse part
     TOUT DROIT, sur son élan ; tout geste NOUVEAU (pousser plus, changer de côté) agit tout de suite, un pouce gardé finit par tourner.
     Sortie par le BORD : le verrou ne part qu'à la fin de la bascule (roues encore sur la lèvre = on braque comme au sol : le sauvetage).
     Le TAUX de virage en vol ne change pas (verdict de Sacha du 09/10) — (2026-10-18) jusqu'au VIRAGE SERRÉ EN VOL : voir `VIRVOL` juste dessous.
   · L'ÉQUILIBRE (`veqNiveau`) : le haut du vol (FLY_U) se redresse vers la verticale du monde autour de la trajectoire (l'hémisphère où il
     est : partie à l'envers sous la dalle, elle reste à l'envers) — caisse et caméra reviennent à l'horizontale.
   · LA BALANCE (`veqCorps`) : plus de vrille. La caisse est un corps sur ressorts amortis autour de son assiette de vol : elle PIVOTE devant
     la trajectoire du côté du pouce, s'INCLINE dans le virage, lève / baisse le nez avec le manche ; le redressement et le décollage lui
     laissent un retard qu'elle rattrape en se balançant. Sortie par le bord : un coup de roulis vers le vide, rattrapé.
   · À LA POSE (`veqPose`), l'assiette qui reste passe à la conduite (roulis de caisse, lacet visuel, tangage) : elle se balance sur ses ressorts.
   · LE DÉCOLLAGE : la suspension se DÉTEND (la caisse monte sur ses roues pendantes, `ext`), un tremplin lève le nez.
   · L'ATTERRISSAGE (`veqCorps`, `veqPose`, `veqContact`) : à l'approche de la dalle (temps avant contact < `posB` s) la caisse PRÉPARE sa pose :
     elle se met dans le plan de la route, les roues dessous, le nez dans sa trajectoire. Au contact : la suspension détendue CLAQUE et s'écrase,
     le nez PLONGE puis rebondit (`VEQ.sp`, ressort), la caméra s'enfonce un instant (`VEQ.cam*`), un anneau de poussière sur les grosses poses ;
     ce qui reste d'assiette passe aux ressorts de la conduite (roulis, lacet, tangage — calculé sur la VRAIE orientation de la caisse).
   · LES FIGURES AU DOUBLE-TAP NITRO (`veqDouble`, deux appuis brefs) — elles s'ACCUMULENT (Léo, 14/10 : « au lieu de supprimer les tricks, on
     va les accumuler ») : le catalogue vit dans figures.js (`FIG`, partagé avec la BOÎTE BLANCHE boite-figures.html), on les ACHÈTE au shop
     (catégorie FIGURES), on les garde dans l'inventaire (`SAVE.d.figs`, le TONNEAU offert) ; le double-tap en joue UNE AU HASARD parmi celles
     qu'on possède (jamais deux fois la même d'affilée), et un double-tap pendant une figure ENCHAÎNE la suivante (le lecteur `FIG.Lecteur` la
     lance à 70 % de la précédente : les rotations se composent, la caisse ne s'arrête jamais). « Ça les pose automatiquement » : la figure
     se RACCOURCIT pour finir avant la pose (le viseur dit quand on touche, `CAMV.eta`) ; trop bas, rien ne part.
     AU SOL = LE SAUT NITRO (`veqSaut`) : le booster plaque la route, la caisse DÉCOLLE (~1,2 s, ~2,5 m) et sa figure part toute seule — il coûte
     du nitro, et sa pose en rend moins qu'un vrai saut (on ne fabrique pas de nitro en sautant sur place).
     Chaque figure finie entre dans la CHAÎNE (son aura, payée à la pose ; des figures DIFFÉRENTES font monter le multiplicateur). Posée en plein
     tour : à moins de 20° de la fin elle compte ; au-delà de 50° c'est une POSE RATÉE (« FIGURE RATÉE ! », le flow tombe).
   `?vol=ancien` (ou `dbgVol('ancien')`) rend le vol d'avant au chiffre près (le tonneau reste). Console : `dbgVol()`, `dbgVol('tonneau')`. */
/* LE VIRAGE SERRÉ EN VOL (2026-10-18, Sacha : « augmente la maniabilité dans les airs, on a du mal à faire des virages serrés »). Deux freins :
   (1) le LACET plafonnait à 1,75 rad/s dès 260 km/h — passé ce cap, le rayon grandissait avec la vitesse (48 m à 300 km/h, 95 m à 600) ;
   (2) le VERROU du volant (`veqVolant`) effaçait pendant 0,7 s le braquage tenu depuis la route — un saut dure ~1 s : on y tournait à moitié.
   Désormais le lacet vaut ×1,5 et son plafond monte (3,1 rad/s, atteint vers 390 km/h) : le rayon fond d'un bon tiers (19 m à 150 km/h, 30 m
   à 300, 54 m à 600) ; le verrou s'efface en 0,35 s (la caisse quitte toujours la route TOUT DROIT, mais le pouce tenu reprend vite la main).
   UNE formule pour tout le vol (`lacetVol`) : le vol, la mousse, la poudreuse du glacier et le lacet emporté à la pose. `?virvol=0` = avant. */
const VIRVOL=/[?&]virvol=0\b/.test(location.search)?{k:1,cap:.6,latch:.7}:{k:1.5,cap:.9,latch:.35};
function lacetVol(v){return VIRVOL.k*(1.15+Math.min(VIRVOL.cap,v*.004));} // rad/s au plein pouce, v = |fallVel|
function lacetVolK(v){return lacetVol(v)/(1.15+Math.min(.6,v*.004));} /* le rapport au virage d'AVANT le 18/10 : la caméra de vol suit d'autant plus vite
   (mesuré : à lacet ×1,6 et suivi inchangé, la caméra restait 28° à l'EXTÉRIEUR du virage contre 16° — on voyait moins où l'on tourne) */
window.dbgVirVol=function(k,cap,latch){if(k!=null)VIRVOL.k=k;if(cap!=null)VIRVOL.cap=cap;if(latch!=null)VIRVOL.latch=latch;return Object.assign({},VIRVOL);};
const VEQ_K={niv:2.6,iner:.8,lacet:.26,roulis:.38,tangage:.2,w:9.5,z:.42,wR:8,zR:.36,houle:.024,
  ext:.11,posA:.05,posB:.45,    // la suspension pendante en vol · la pose se prépare entre ,45 s et ,05 s avant qu'elle soit déclarée
  saut:21,sautCout:.2,sautNit:.3,sautCd:.9}; // LE SAUT NITRO : impulsion, coût (part de la jauge), part du nitro rendu à sa pose, attente (s)
const VEQ={on:!/[?&]vol=ancien\b/.test(location.search),l0:0,lT:0,lArm:false,u:0,by:0,byV:0,bp:0,bpV:0,br:0,brV:0,tf:0,ext:0,
  qb:new THREE.Quaternion(),qp:new THREE.Quaternion(),qo:new THREE.Quaternion(),qd:new THREE.Quaternion(),eu:new THREE.Euler(0,0,0,'YXZ'),
  tv:new THREE.Vector3(),tc:new THREE.Vector3(),n9:new THREE.Vector3(),f9:new THREE.Vector3(),g9:new THREE.Vector3(),m4:new THREE.Matrix4(),
  si:-1,sh:0,sl:0,sd:1e9,pose:0,      // le radar de la dalle (tryLand) · pose : l'alignement de pose en cours (0-1)
  sautT:-9,sautF:-1,rate:false,dReq:false,dDn:0,dUp:0,n:0,
  sp:0,spV:0,camT:-1,camA:0,volT:0,   // le nez qui rebondit à la pose · la caméra qui s'enfonce
  pv:new THREE.Vector3(),pv2:new THREE.Vector3(),ax:new THREE.Vector3(),qr:new THREE.Quaternion()};
function veqDepart(bord,impU,roll0,qDep){ // au décollage (startFall)
  VEQ.l0=steer;VEQ.lT=0;VEQ.lArm=!bord;VEQ.u=0;VEQ.tf=0;VEQ.ext=0;VEQ.pose=0;VEQ.si=-1;VEQ.rate=false;VEQ.sp=0;VEQ.spV=0;
  VEQ.by=0;VEQ.byV=0;VEQ.bp=0;VEQ.bpV=bord?0:-1.1*THREE.MathUtils.clamp((impU==null?.9:impU)/30,0,1); // un tremplin lève un peu le nez : la balance commence
  VEQ.br=roll0;VEQ.brV=bord?bascDir*4:0; // bord : la caisse BASCULE vers le vide, les ressorts la rattrapent — (2026-10-17) tout décollage emporte son roulis (il retombait à 0 en une image hors du bord)
  VEQ.qb.copy(qDep);
}
function veqVolant(){ // LE VOLANT EN L'AIR : la part tenue depuis la route s'efface, tout geste nouveau agit
  if(!VEQ.on)return steer;
  if(!VEQ.lArm){if(bascOn&&bascT<BASC_T)return VEQ.u=steer;VEQ.lArm=true;VEQ.l0=steer;VEQ.lT=0;}
  const g=Math.max(0,1-VEQ.lT/VIRVOL.latch);
  if(g<=0||steer*VEQ.l0<=0){VEQ.l0=0;return VEQ.u=steer;}
  if(Math.abs(steer)<Math.abs(VEQ.l0))VEQ.l0=steer; // le pouce revient vers le centre : le verrou descend avec lui (jamais de contre-braquage)
  return VEQ.u=Math.sign(steer)*Math.max(0,Math.abs(steer)-Math.abs(VEQ.l0)*g);
}
function veqNiveau(dt,dir){ // L'ÉQUILIBRE : le haut du vol se redresse vers la verticale, autour de la trajectoire `dir`
  const U9=TBORD.on?TBORD.u:VOLR.on?VOLR.u:null,sg= /* (LE VOL QUI SUIT LA ROUTE) sur la route sans haut ni bas, l'équilibre se fait sur le ciel de la dalle survolée */(U9?FLY_U.dot(U9):FLY_U.y)>=0?1:-1; // (LE BORD DE LA ROUTE TORDUE) au bord, l'équilibre se fait sur le ciel de LA ROUTE : le volant reste dans le plan de la dalle, on peut revenir cogner sa tranche
  if(U9)VEQ.tv.copy(U9).multiplyScalar(sg).addScaledVector(dir,-sg*U9.dot(dir));else VEQ.tv.set(0,sg,0).addScaledVector(dir,-sg*dir.y);
  const L=VEQ.tv.length();if(L<.15)return; // trajectoire presque verticale : pas d'horizon à retrouver
  VEQ.tv.multiplyScalar(1/L);
  const e=Math.atan2(VEQ.tc.crossVectors(FLY_U,VEQ.tv).dot(dir),THREE.MathUtils.clamp(FLY_U.dot(VEQ.tv),-1,1));
  const a=e*(1-Math.exp(-dt*VEQ_K.niv*Math.min(1,(L-.15)/.35)*(1-JEAU.wB)));
  if(Math.abs(a)<1e-7)return;
  FLY_U.applyAxisAngle(dir,a);VEQ.br-=a*VEQ_K.iner; // la caisse a de l'INERTIE : le repère se redresse, elle traîne un peu… et se balance pour le rattraper
}
function veqRoute(bI,sd,f,q){ // l'assiette de CONDUITE sur la dalle bI, face sd, nez vers f (dans le plan) → q
  const n=VEQ.n9.copy(Nn[bI]).multiplyScalar(sd);
  VEQ.g9.copy(f).addScaledVector(n,-f.dot(n));if(VEQ.g9.lengthSq()<1e-6)VEQ.g9.copy(T[bI]);VEQ.g9.normalize();
  VEQ.tc.crossVectors(n,VEQ.g9).normalize();VEQ.m4.makeBasis(VEQ.tc,n,VEQ.g9);return q.setFromRotationMatrix(VEQ.m4);
}
function veqCorps(dt){ // LA BALANCE : qTmp = l'assiette de vol (repère) → la caisse, sur ses ressorts, autour
  const d=Math.min(dt,1/30),K=VEQ_K,m=1-JEAU.wB,u=VEQ.u;
  VEQ.tf+=dt;const h=REDUCED_MOTION?0:K.houle*Math.min(1,VEQ.tf/.6)*m;
  const byT=u*K.lacet*m,brT=(-u*K.roulis+h*Math.sin(VEQ.tf*5.3))*m,bpT=(-pitchS*K.tangage+h*.7*Math.sin(VEQ.tf*3.7+1.1))*m;
  VEQ.byV+=(K.w*K.w*(byT-VEQ.by)-2*K.z*K.w*VEQ.byV)*d;VEQ.by=THREE.MathUtils.clamp(VEQ.by+VEQ.byV*d,-.6,.6);
  VEQ.bpV+=(K.w*K.w*(bpT-VEQ.bp)-2*K.z*K.w*VEQ.bpV)*d;VEQ.bp=THREE.MathUtils.clamp(VEQ.bp+VEQ.bpV*d,-.6,.6);
  VEQ.brV+=(K.wR*K.wR*(brT-VEQ.br)-2*K.zR*K.wR*VEQ.brV)*d;VEQ.br=THREE.MathUtils.clamp(VEQ.br+VEQ.brV*d,-1.2,1.2);
  VEQ.eu.set(VEQ.bp,VEQ.by,VEQ.br,'YXZ');VEQ.qo.setFromEuler(VEQ.eu);qTmp.multiply(VEQ.qo);
  /* LA POSE SE PRÉPARE : le temps avant de toucher la face visée (hauteur ÷ vitesse d'approche, en mètres du monde) — sous `posB` s la caisse
     se met dans le plan de la route, nez dans sa trajectoire, roues dessous ; à `posA` s elle y est. Hors de la largeur (+6 m) : rien. */
  let a=0;
  if(VEQ.si>=0&&VEQ.sd<1600&&Math.abs(VEQ.sl)<ROAD_HALF+6){
    const i=VEQ.si,dessus=VEQ.sh>-THICK*.5,hs=dessus?VEQ.sh:-THICK-VEQ.sh,sd=dessus?1:-1,vN=-fallVel.dot(Nn[i])*sd*SPD;
    if(hs>-1.5&&vN>.4)a=1-THREE.MathUtils.smoothstep(Math.max(0,hs-2.8)/vN,K.posA,K.posB); // ⚠ la pose est DÉCLARÉE à 3 m (tryLand) : à 2,8 m la caisse doit être prête
    if(a>.001){veqRoute(i,sd,fallVel,VEQ.qp);qTmp.slerp(VEQ.qp,a*m);}}
  VEQ.pose+=(a-VEQ.pose)*Math.min(1,dt*10);
  VEQ.qb.slerp(qTmp,Math.min(1,dt*(12+10*a)));carGroup.quaternion.copy(VEQ.qb);airRoll=VEQ.br;
  // LES ROUES PENDENT : en l'air la suspension se détend (la carrosserie monte au-dessus de ses roues)
  VEQ.ext+=(K.ext-VEQ.ext)*Math.min(1,dt*9);carBody.position.y=VEQ.ext;
}
function veqPose(bI,sd){ // la caisse se pose (tryLand, lèvre) : ce qui reste d'assiette passe aux ressorts de la conduite
  VEQ.rate=false;VEQ.volT=fallTR;
  let rx=0,ry=0,rz=0;
  if(VEQ.on&&bI!=null&&bI>=0){ // l'écart RÉEL entre la caisse et sa place de conduite (nez = cap de la pose)
    VEQ.f9.copy(T[bI]).multiplyScalar(Math.cos(psi)).addScaledVector(B[bI],Math.sin(psi)*sd);
    veqRoute(bI,sd,VEQ.f9,VEQ.qp);VEQ.qd.copy(VEQ.qp).invert().multiply(VEQ.qb);VEQ.eu.setFromQuaternion(VEQ.qd,'YXZ');
    rx=VEQ.eu.x;ry=VEQ.eu.y;rz=VEQ.eu.z;}
  let corps=false;
  if(FIGV2.on&&FX2.corps){const C=FX2.corps,j=C.pose(); /* (2026-10-14, LES FIGURES v2) près de l'endroit, les figures finies comptent ; à plus de 52°, CHUTE */
    for(let i=0;i<j.payees.length;i++)figPaye(j.payees[i]);if(j.ratee)VEQ.rate=true;FX2.trio=[]; /* (COMBOS À TROIS) la pose ferme le vol : un trio entamé ne passe pas au vol suivant */
    corps=j.ecart>.002;if(corps){VEQ.qd.set(C.q[0],C.q[1],C.q[2],C.q[3]);VEQ.eu.setFromQuaternion(VEQ.qd,'YXZ');rx+=VEQ.eu.x;ry+=VEQ.eu.y;rz+=VEQ.eu.z;}
    FX2.wPose=C.w[2];C.vide();}
  if(!VEQ.on&&!corps)return;
  driftYaw=THREE.MathUtils.clamp(ry,-.35,.35);carRoll9=THREE.MathUtils.clamp(rz,-.42,.42);
  if(VEQ.on){rollV=THREE.MathUtils.clamp(VEQ.brV*.5+FX2.wPose*.4,-4,4);FX2.wPose=0;pitch9=0;VEQ.sp=THREE.MathUtils.clamp(rx,-.35,.35);VEQ.spV=0;}
}
function veqContact(imp,nI,sd){ // LE CONTACT (touche9 : quand les roues touchent vraiment) — la suspension claque, le nez plonge, la caméra s'enfonce
  if(!VEQ.on)return;
  const k=THREE.MathUtils.clamp(imp/14,0,1),gros=imp>6||VEQ.volT>1.2;
  susY=Math.min(.12,VEQ.ext);susV=Math.min(susV,-.6-imp*.32);VEQ.ext=0; // détendue en l'air, elle s'ÉCRASE
  VEQ.spV+=.9+k*2.4; // le nez plonge (avant chargé), le ressort le relève
  if(!REDUCED_MOTION){VEQ.camT=0;VEQ.camA=.12+k*.5+(gros?.12:0);}
  if(gros&&nI!=null&&nI>=0){ // L'ANNEAU DE POUSSIÈRE : la route a pris le coup
    const n=VEQ.n9.copy(Nn[nI]).multiplyScalar(sd),p=carGroup.position,nb=Math.round(14+k*14);
    VEQ.f9.copy(T[nI]);VEQ.g9.crossVectors(n,VEQ.f9).normalize();
    for(let j=0;j<nb;j++){const a=j/nb*6.2832,c=Math.cos(a),s9=Math.sin(a),v=7+k*9+Math.random()*3;
      spawnP(dust,p.x+(VEQ.f9.x*c+VEQ.g9.x*s9)*1.4,p.y+(VEQ.f9.y*c+VEQ.g9.y*s9)*1.4+n.y*.2,p.z+(VEQ.f9.z*c+VEQ.g9.z*s9)*1.4,
        (VEQ.f9.x*c+VEQ.g9.x*s9)*v+n.x*1.2,(VEQ.f9.y*c+VEQ.g9.y*s9)*v+n.y*1.2,(VEQ.f9.z*c+VEQ.g9.z*s9)*v+n.z*1.2,.45+Math.random()*.25);}}
}
function veqConduite(d9){ // au sol, chaque image : le nez qui rebondit après la pose (ressort ω 13)
  if(VEQ.sp===0&&VEQ.spV===0)return 0;
  VEQ.spV+=(-169*VEQ.sp-2*.32*13*VEQ.spV)*d9;VEQ.sp=THREE.MathUtils.clamp(VEQ.sp+VEQ.spV*d9,-.4,.4);
  if(Math.abs(VEQ.sp)<1e-4&&Math.abs(VEQ.spV)<1e-3){VEQ.sp=0;VEQ.spV=0;}
  return VEQ.sp;
}
function veqCamera(dt){ // au sol : la caméra s'enfonce sous le choc de la pose, puis revient
  if(VEQ.camT<0)return;VEQ.camT+=dt;const x=VEQ.camT/.36;
  if(x>=1){VEQ.camT=-1;return;}
  if(!window.dbgNoShake)camera.position.addScaledVector(F.n,-VEQ.camA*Math.sin(Math.PI*x)*(1-.4*x));
}
function veqNitK(){return VEQ.sautF===flightId?VEQ_K.sautNit:1;} // la pose d'un SAUT NITRO rend moins de nitro
function veqDoigt(bas){ /* LE DOUBLE-TAP (2026-10-14, Léo : « un trick qui s'actionne quand j'appuie deux fois rapidement sur le booster ») : deux appuis BREFS
   sur NITRO — le 1er de moins de 240 ms, le 2e moins de 320 ms après le 1er. Lu aux événements (clavier, doigt, souris), joué par la boucle (`VEQ.dReq`). */
  const n=performance.now();
  if(!bas){VEQ.dUp=n;return;}
  if(VEQ.dDn>0&&n-VEQ.dDn<320&&VEQ.dUp>=VEQ.dDn&&VEQ.dUp-VEQ.dDn<240){VEQ.dDn=0;VEQ.dReq=true;VEQ.dReqT=n;FX2.redP=0;}
  else{VEQ.dDn=n;if(FIGV2.on&&mode==='fall')FX2.redP=n;} /* (2026-10-14, Sacha : « 1 seul tap permet de redresser la voiture ») — (2026-10-15, L'IMPULSION) le redressement ATTEND
     que la fenêtre du double-tap se ferme (figRedP, 330 ms) : avant, le 1er appui d'un double-tap redressait la figure qu'on voulait EMPILER */
}
function figRedP(){if(!FX2.redP||performance.now()-FX2.redP<330)return;FX2.redP=0; // un appui SEUL sur NITRO pendant une figure : la caisse se remet face à la route (FIG.Corps.redresse)
  if(FIGV2.on&&mode==='fall'&&FX2.corps&&!paused&&!gameOver&&FX2.corps.redresse()){FX2.redresse++;try{if(SONV2)sfx('turbo.mini',{vol:-8});}catch(e){}hap(8);}}
function veqDouble(){ // le double-tap : au sol, le SAUT NITRO (et sa figure) ; en vol, une FIGURE (enchaînée)
  if(!started||gameOver||paused||introD||(TUTO.on&&!tutoFigOuverte()))return false; // (2026-10-14) fermé pendant l'auto-école… sauf à son étape FIGURE
  let ok=false;if(mode==='drive'){const r9=frLance();ok=r9===null?veqSaut():r9;}else if(mode==='fall')ok=veqFigure(); // (2026-10-17, Sacha) au sol, LA FIGURE SUR LA ROUTE ; rien dans cette direction : le saut nitro
  if(ok&&TUTO.on)TUTO.sauts=(TUTO.sauts|0)+1;
  return ok;
}
/* LES FIGURES LANCÉES EN ROULANT (2026-10-15 soir, Sacha : « le salto avant ne marche pas quand on le lance en roulant sur la route ;
   vérifie que chaque figure est lançable en roulant, sans être dans les airs ») — MESURÉ au banc (double-tap au sol, `dbgSautFig`, mer de
   nuages) : le saut nitro donne ~1 s de vol sur du plat, mais quand la route REMONTE sous la caisse il ne dure que 0,24-0,40 s — le salto
   (avant comme arrière) restait à 0,3-0,6 tour, posé sans être payé ; le tonneau aussi (1 sur 5). Et un double-tap fait pendant un petit
   rebond (dos d'âne, la pose qui se tasse : hopY/hopV/POSE_F) était jeté sans un bruit.
   · LE SAUT À LA TAILLE DE LA FIGURE : quand une figure part avec le saut, `sautAllonge` intègre la VRAIE trajectoire (la loi de la chute,
     comme le viseur) contre la VRAIE route devant (dalleProche) et, si la pose arrive avant `sautBesoin(f)` (de quoi planter la figure — au
     vol MINIMUM depuis le 17/10, plus à sa durée de catalogue), ajoute juste ce qu'il faut de poussée le long de la normale (+19 m/s au plus : ~11 m de haut au lieu de 5).
     Sur du plat rien ne change (le saut fait déjà son vol) ; c'est la route qui remonte qui allonge le saut.
   · LE DOUBLE-TAP GARDÉ : pendant un rebond, la demande attend la fin du rebond (0,4 s au plus, `VEQ.sautAtt`) au lieu d'être perdue.
   Banc : `dbgSautFig(x,y)` (un double-tap, le joystick en x, y), `dbgSautFig('cause')`. ?saut=fixe = le saut d'avant (21 m/s toujours). */
const SAUT_FIXE=/[?&]saut=fixe\b/.test(location.search),SAUT_P=new THREE.Vector3(),SAUT_V=new THREE.Vector3(),SAUT_N=new THREE.Vector3(),SAUT_D=new THREE.Vector3();
/* (2026-10-17, Sacha : « on doit retomber sur la route plus vite ») LE VOL MINIMUM, PLUS LE VOL DE CATALOGUE : on visait 90 % de la durée
   de catalogue (≥ 1 s) — sur du plat aussi, si bien que CHAQUE saut nitro à figure montait à 1,1-1,9 s et que la gravité ×1,3 n'y changeait
   rien. On ne vise plus que le plus court vol où figLance accepte la figure (`figDMin`, figDose D = (vol − 0,35) × 0,72), + 0,06 s de
   marge : la figure tourne plus vite, la caisse retombe. La route qui remonte reste rattrapée.
   LA FIGURE DU SAUT, PLUS NERVEUSE : celle-là (`douce` : partie toute seule avec le saut) peut se boucler en max(0,25 s ; 40 % du catalogue)
   au lieu de max(0,32 s ; la moitié) — c'est ce plancher qui fixe la durée du saut. MESURÉ (banc cc-banc/sautgrav.cjs, ville, 32 sauts,
   toutes les figures dans toutes leurs directions) : la veille 1,27 s de vol moyen (1,03 s sur du plat), 1,85 s au plus, 6,5 m de haut,
   26 figures payées ; aujourd'hui (×1,45) 1,08 s (0,85 s sur du plat), 1,58 s au plus, 5,6 m, 30 payées, 0 chute. Les figures lancées
   EN VOL gardent leur plancher. */
function figDMin(f,douce){return douce?Math.max(.25,f.D*.4):Math.max(.32,f.D*.5);}
function sautBesoin(f){return f&&f.D?.35+figDMin(f,true)/.72+.06:0;}
function sautVolPredit(dv){ // la durée (s) du vol qui vient de partir, avec dv m/s de plus le long de la normale de la route au décollage — 2,4 = pas de pose en vue
  SAUT_P.copy(fallPos);SAUT_V.copy(fallVel).addScaledVector(SAUT_N,dv);volPlafU(SAUT_V,70); /* (LE VOL QUI SUIT LA ROUTE) la montée et la chute le long du haut du vol */
  const g=FALL_G*gK(),h=1/30;let gi=-1;
  for(let k=1;k<=72;k++){volMonte(SAUT_V,-g*h);SAUT_P.addScaledVector(SAUT_V,h*SPD);if(k<3)continue;
    const bi=dalleProche(SAUT_P.x,SAUT_P.y,SAUT_P.z,8,400,gi);if(bi<0)continue;gi=bi-bi%8;
    SAUT_D.subVectors(SAUT_P,pts[bi]);const hh=SAUT_D.dot(Nn[bi]),l=SAUT_D.dot(B[bi]),vn=SAUT_V.dot(Nn[bi]);
    /* (2026-10-17) + LA FENÊTRE DE tryLand : passé 0,35 s, la caisse à moins de 3 m du bitume qui monte à moins de 4,5 m/s est POSÉE — un
       petit saut est rattrapé au SOMMET. MESURÉ (banc cc-banc/sautgrav.cjs, ville) : à ×1,5 le saut de 21 m/s culmine à 2,1 m, posé à 0,33 s
       au lieu des 0,85 s prédits — la figure n'avait pas le temps (16 payées sur 32). À ×1,3 le plancher d'1 s le cachait. */
    if(Math.abs(l)<ROAD_HALF+1&&((hh>-THICK-1&&hh<.35&&vn<0)||(k*h>.35&&hh>-1.2&&hh<3&&vn<4.5)))return k*h;}
  return 2.4;}
function sautAllonge(f){ // juste après startFall : le saut assez long pour planter `f`
  const need=sautBesoin(f);if(!need||SAUT_FIXE)return 0;
  const t0=sautVolPredit(0);VEQ.tPred=t0;if(t0>=need)return 0;
  let dv=0;for(let d=1.5;d<=19.5;d+=1.5){dv=Math.min(19,d);if(sautVolPredit(dv)>=need)break;} // (2026-10-17) par pas de 1,5 m/s (étaient 3) : pas un dixième de vol de trop
  fallVel.addScaledVector(SAUT_N,dv);volPlafU(fallVel,70);VEQ.allonge=(VEQ.allonge|0)+1;VEQ.dvDer=dv;return dv;}
function sautFigVisee(fo){ // la figure qui partira avec ce saut (celle du glissé, sinon celle de la direction tenue)
  if(!FIGV2.on||!window.FIG)return null;if(fo&&fo.f)return fo.f;
  const S=figSlots();let k=FDIR.on?figDirSlot():0;if(!S[k]&&!(FDIR.on&&!TUTO.on))for(let j=1;j<FIG_NB&&!S[k];j++)k=(k+1)%FIG_NB;return S[k]?FIG.par[S[k]]:null;}
function veqSaut(fo){ // LE SAUT NITRO : le booster plaque la route, la caisse décolle — `fo` (LA FIGURE AU GLISSÉ) : la figure du sens glissé au lieu de l'emplacement suivant
  if(hopY>0||hopV!==0||POSE_F){if(!fo&&mode==='drive'&&!(VEQ.sautAtt>0))VEQ.sautAtt=performance.now();return false;} // (2026-10-15 soir) un rebond : le double-tap ATTEND (veqSautAttente)
  if(performance.now()-VEQ.sautT<VEQ_K.sautCd*1000)return false;
  /* (2026-10-14, GAMEPLAY — bug relevé par GENERAL : « saut nitro au double-tap sur la FACE CACHÉE : startFall(21) part vers le BAS, chute
     mortelle ») SOUS LA DALLE, la caisse est pendue à la route : la pousser « vers le haut de la caisse », c'est la lâcher dans le VIDE (et la
     pose d'après, quand il y en a une, sortait POSÉ LOURD ~10,5 : momentum ÷ 2, une faute, des zones Survivant et des singes semés sur du plat).
     Pas de saut dessous : le « tchk » de la nitro à vide, et rien n'est payé. */
  if(side<0){try{if(SONV2)sfx('nitro.vide');}catch(e){}hap(6);return false;}
  const libre=pwrNitroT>0||PARK.on||startBoostT>0,cout=libre?0:VEQ_K.sautCout*nitroCap();
  if(!libre&&nitroR+nitroX<cout){try{if(SONV2)sfx('nitro.vide');}catch(e){}hap(6);return false;}
  if(cout>0){if(nitroR>=cout)nitroR-=cout;else{nitroX=Math.max(0,nitroX-(cout-nitroR));nitroR=0;}}
  VEQ.sautT=performance.now();
  const p9=carGroup.position.clone();VEQ.sautAtt=0;
  SAUT_N.copy(F.n);const fV9=sautFigVisee(fo); /* (2026-10-15 soir) la normale de la route au décollage et la figure qui partira */
  startFall(VEQ_K.saut,1);VEQ.sautF=flightId;VEQ.l0=0; // un saut VOULU : le volant tenu continue de tourner (pas de verrou), on reste sur sa route
  try{sautAllonge(fV9);}catch(e){} /* (2026-10-15 soir, Sacha : « chaque figure lançable en roulant ») le saut assez long pour la planter, quand la route remonte */
  if(fo&&FIGV2.on)figLance(-1,Object.assign({dispo:2*VEQ_K.saut/(FALL_G*gK())-.15},fo));else // (2026-10-15) le glissé : la figure de SON sens
  veqFigure(2*VEQ_K.saut/(FALL_G*gK())-.15); // la figure part TOUTE SEULE, à la taille du saut
  for(let k=0;k<26;k++){const a=Math.random()*6.2832,r=Math.random()*1.2; // le souffle du booster contre la route
    spawnP(k%3?flames:flameCore,p9.x+Math.cos(a)*r,p9.y+.2,p9.z+Math.sin(a)*r,Math.cos(a)*(3+Math.random()*6),-2-Math.random()*3,Math.sin(a)*(3+Math.random()*6),.18+Math.random()*.16);}
  sparkBurst(sparkGold,p9,10,9);shake=Math.max(shake,.45);fovPunch=Math.max(fovPunch,8);hap([12,30,18]);
  try{if(SONV2)sfx('nitro.plein',{vol:-6});}catch(e){}
  VEQ.n++;return true;
}
const FLC={t:-9e9,k:1,n:0,c:0,ok:false}; // le coup de réacteur du 1er appui, à rendre si l'appui était le début d'un double-tap (voir figLance)
function veqFigsAMoi(){if(cousin()&&window.FIG)return FIG.liste.map(function(f){return f.id;});const L=SAVE.d.figs;return Array.isArray(L)&&L.length?L:['tailwhip'];}
function veqFigure(dispo){ // EN VOL : une figure AU HASARD parmi celles qu'on possède — enchaînée derrière celle en cours
  if(dispo==null&&FDIR.on)return !!figLance(figDirSlot(),{double:true,empile:true,dx:FDIR.x,strict:!TUTO.on}); // (2026-10-15, les deux familles) strict : sans figure avant, le pouce en avant ne fait rien (sauf à l'auto-école) // (2026-10-15, Sacha) LE CHOIX AU JOYSTICK : avant = l'emplacement 1, côté = le 2 (voir FDIR)
    if(dispo==null&&IMPU.on)return !!figImpulsion(); // (2026-10-15) le double-tap EN VOL : L'IMPULSION de flanc (voir figImpulsion)
    if(FDIR.on&&dispo!=null)return !!figLance(figDirSlot(),{dispo:dispo,dx:FDIR.x,strict:!TUTO.on,muet:true}); // (2026-10-15 soir, Sacha : « la figure qui se lance doit dépendre de la touche directionnelle pressée au moment du double-tap : sur la route, on ne peut pas lancer un rodéo placé sur la flèche arrière si on avance ») le SAUT NITRO aussi : la figure de la direction tenue — rien dans cette direction : le saut part sans figure, sans bruit de refus
    return !!figLance(FX2.cyc,{dispo:dispo,double:dispo==null});} // (2026-10-14, LES FIGURES v2) l'emplacement SUIVANT, en vraie physique (le saut nitro ; ?impu=0 : aussi le double-tap en vol)
window.dbgVol=function(a){
  if(a==='ancien'||a==='neuf'){VEQ.on=a==='neuf';return VEQ.on?'vol équilibré':'vol d’avant';}
  if(a==='double')return veqDouble();
  if(a==='tout'){SAVE.d.figs=FIG.liste.map(function(f){return f.id;});SAVE.flush();return SAVE.d.figs;} // (banc) toutes les figures
  if(a==='rien'){SAVE.d.figs=['tailwhip'];SAVE.d.figT0=0;SAVE.d.figS0=0;SAVE.flush();return SAVE.d.figs;}
  return {on:VEQ.on,mode:mode,u:+VEQ.u.toFixed(3),steer:+steer.toFixed(3),verrou:+VEQ.l0.toFixed(3),lT:+VEQ.lT.toFixed(2),
    lacet:+(VEQ.by*57.3).toFixed(1),tangage:+(VEQ.bp*57.3).toFixed(1),roulis:+(VEQ.br*57.3).toFixed(1),pose:+VEQ.pose.toFixed(2),ext:+VEQ.ext.toFixed(3),
    haut:FLY_U.toArray().map(function(v){return +v.toFixed(3);}),aMoi:veqFigsAMoi(),
    figures:VEQ.n,rate:VEQ.rate,nez:+(VEQ.sp*57.3).toFixed(1),camT:+VEQ.camT.toFixed(2),hopY:+hopY.toFixed(2),carRoll:+(carRoll9*57.3).toFixed(1),
    cap:+(Math.atan2(fallVel.x,fallVel.z)*57.3).toFixed(1),radar:[VEQ.si,+VEQ.sh.toFixed(1),+VEQ.sl.toFixed(1),Math.round(VEQ.sd)],vy:+fallVel.y.toFixed(1),eta:+(+CAMV.eta).toFixed(2),hautCaisse:+VEQ.pv.set(0,1,0).applyQuaternion(carGroup.quaternion).y.toFixed(3),fallT:+fallTR.toFixed(2),nitro:+(nitroR+nitroX).toFixed(2)};};
