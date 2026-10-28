/* LE DOIGT SUR LA SCÈNE (2026-10-15, bug : un lancer parti juste à droite de la bande « CETTE SEMAINE » ne lançait pas la caisse — la bande
   prend le doigt jusque dans son blanc, et c'était le doigt du GARAGE, sans élan planifié, qui la tournait). Pour la boutique, la scène c'est
   le canevas ET ce que la page de vente pose dessus sans être un bouton : le titre, l'argent, le nom, le blanc entre les cartes de la bande.
   Les vrais boutons (cartes, onglets, coloris, liens) gardent leur clic ; le panneau des voitures garde son doigt (il défile). */
function bqScene(t){if(t===renderer.domElement)return true;if(!t||!t.closest||!t.closest('#gBq'))return false;
  return !t.closest('#gBqPan,button,a,input,select,textarea,[role=button],[role=tab],.bqU,.bqK');}
(function(){
  addEventListener('pointerdown',function(e){if(!GBQ.on||!garageOn||GAR.go||!bqScene(e.target))return;if(GBQ.drag)return;
    const t0=performance.now();GBQ.drag={id:e.pointerId,x:e.clientX,y:e.clientY,t:t0,k:bqPrise(e),x0:e.clientX,y0:e.clientY,t0:t0,loin:false,attrape:!!GBQ.lan||Math.abs(GBQ.yawV)>.3};GBQ.lan=null;GBQ.yawV=0;GBQ.pitV=0;GBQ.rolV=0;e.stopPropagation();},true);
  addEventListener('pointermove',function(e){const d=GBQ.drag;if(!d||d.id!==e.pointerId)return;e.stopPropagation();
    if(!d.loin&&Math.hypot(e.clientX-d.x0,e.clientY-d.y0)>8){d.loin=true;bqPoseTient();} // (2026-10-15) LA POSE TENUE : elle a glissé → posée à la main
    const now=performance.now(),dx=e.clientX-d.x,dy=e.clientY-d.y,ds=Math.max(.008,(now-d.t)/1000);d.x=e.clientX;d.y=e.clientY;d.t=now;
    GBQ.yaw+=dx*.011;{const k=d.k||{kp:1,kr:0};GBQ.pit=THREE.MathUtils.clamp(GBQ.pit+k.kp*dy*.008,-.75,.75);GBQ.rol=THREE.MathUtils.clamp((GBQ.rol||0)+k.kr*dy*.008,-.55,.55);}GBQ.yawV=GBQ.yawV*.5+dx*.011/ds*.5;},true);
  const fin=function(e){const d=GBQ.drag;if(!d||d.id!==e.pointerId)return;e.stopPropagation();GBQ.drag=null;if(performance.now()-d.t>90)GBQ.yawV=0;bqLance(GBQ.yawV); // (2026-10-15) LE LANCER DOSÉ
    if(e.type==='pointerup'&&!d.loin&&!d.attrape&&performance.now()-d.t0<300&&d.k&&d.k.sur){if(GBQ.pose){bqPoseLache();try{uiClic('nav');hap(6);}catch(er){}}try{bqTape();}catch(er){}}}; /* (2026-10-20) …et le coup + l'action spéciale de la caisse (voir bqTape) */ // (2026-10-15) un toucher bref SUR elle : la pose de vitrine, le plateau repart
  addEventListener('pointerup',fin,true);addEventListener('pointercancel',fin,true);})();
try{Object.assign(I18N,{'COLORIS':'SKINS','ORIGINAL':'ORIGINAL','PEINTURES':'PAINTS','AILES':'WINGS','TRAÎNÉES':'TRAILS','À LA UNE':'FEATURED','SEMAINE':'WEEKLY','OFFRES':'OFFERS','VOITURES':'CARS','CETTE SEMAINE':'THIS WEEK','ACHAT':'BUY','TOUT VOIR':'SEE ALL','TRAÎNÉE':'TRAIL','AILE':'WING','CAISSE':'CAR','ÉDITIONS LIMITÉES':'LIMITED EDITIONS','TOUTES LES VOITURES':'ALL CARS','LIMITÉE':'LIMITED','À TOI':'YOURS','Dans ton garage':'In your garage','Exclusivité boutique — introuvable en jeu':'Shop exclusive — not obtainable in game','Exclusivité boutique — revient en édition limitée':'Shop exclusive — returns as a limited edition','En vente':'For sale','Se gagne aux défis':'Earned through challenges'});}catch(e){}
window.dbgBqIndus=function(){return {cam:[+camera.position.x.toFixed(2),+camera.position.y.toFixed(2),+camera.position.z.toFixed(2),+camera.fov.toFixed(1)],grpY:GBQ.grp?+GBQ.grp.position.y.toFixed(2):null,veut:GBQ.veut,on:GBQ.on,lev:+GBQ.lev.toFixed(2),k:+GBQ.k.toFixed(2),yaw:+GBQ.yaw.toFixed(2),pit:+GBQ.pit.toFixed(2),rol:+(GBQ.rol||0).toFixed(2),pose:GBQ.pose,platK:+GBQ.platK.toFixed(2),lan:GBQ.lan?[+GBQ.lan.D.toFixed(3),+GBQ.lan.T.toFixed(3),+GBQ.lan.q.toFixed(2)]:null,ang:+garageAng.toFixed(3),cap:+(function(){const v=new THREE.Vector3(0,0,1).applyQuaternion(carGroup.quaternion);return Math.atan2(v.x,v.z);})().toFixed(4),capV:+(function(){const v=new THREE.Vector3(0,0,1).applyQuaternion(carGroup.quaternion).applyQuaternion(camera.quaternion.clone().invert());return Math.atan2(v.x,v.z);})().toFixed(4),ecr:(function(){const v=new THREE.Vector3(0,.55,0);carGroup.updateMatrixWorld(true);carGroup.localToWorld(v);v.project(camera);const r=renderer.domElement.getBoundingClientRect();return [Math.round(r.left+(v.x+1)/2*r.width),Math.round(r.top+(1-v.y)/2*r.height)];})(),ong:GBQ.ong||'eph',eph:GBQ.eph?GBQ.eph.l:null,caisse:garageI,reste:bqHebdoReste(),
  rail:[...document.querySelectorAll('#gBqPan .bqK')].map(function(el){const r=el.getBoundingClientRect();return [+el.getAttribute('data-i'),Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height),el.classList.contains('sel')];}),zone:GBQ.zone};};
function garageRender(dt){ // la caisse sur son plateau, la caméra tourne à 360° DANS l'atelier
  GAR.dtR=dt;try{hubSync();gTourneMaj();gHomePlace();}catch(e){} // (2026-10-06) LE HUB : la barre suit l'onglet — (2026-10-09) la jauge suit la vue
  if(chuteVoulue()||CHUTE.go){chuteRender(dt);return;}if(CHUTE.on)chuteSort(); // (2026-09-30) LA CHUTE : au MENU, la caisse tombe du ciel (voir « LA CHUTE ») ; la boutique et les missions rouvrent l'atelier
  {const ti9=SHOP.tab==='trainee'?1:(INV&&INV.on&&INV.cat==='trainee')?.55:0;let kc9=ti9||1;if(SHOP.tab==='trainee'){const id9=(cosmSur('trainee')||{}).id;if(id9!==SILPV.cyId){SILPV.cyId=id9;SILPV.cy=0;} /* une traînée qu'on vient de toucher a ses 3,85 s pleines avant la première coupure */SILPV.cy=(SILPV.cy||0)+dt;if(SILPV.cy>4.3)SILPV.cy=0;if(SILPV.cy>3.85)kc9=0;}else SILPV.cy=0;trailApercu(dt,ti9>0,kc9);} /* (2026-10-17, TRAÎNÉES) LE VROMBISSEMENT DE VITRINE : en boutique, la traînée essayée se coupe 0,45 s toutes les 4,3 s et se RALLUME — on revoit son coup d'allumage (la corolle, la fontaine, la frappe, l'enseigne qui clignote…) au lieu de ne le voir qu'une fois */ // (2026-10-04) l'INVENTAIRE ouvert sur ses traînées les montre aussi — plus doucement : la caméra de la vitrine est plus près
  const ay=GARAGE_Y,t9=performance.now()*.001;
  if(!GAR.root)buildGarageRoom();
  GAR.root.position.y=ay;GAR.root.visible=true;garArgentMaj(); // (2026-10-01) les tas de billets suivent le compte (une comparaison par image)
  garPorte(dt);garFeu(dt);garBeaute(dt,t9); // (2026-09-30) la PORTE (fermée au menu, ouverte au JOUER) ; le rideau de flammes : il brûle au repos, il RUGIT pendant le lâcher
  carGroup.position.set(0,ay+GAR.POD,0);carGroup.rotation.set(0,garRot(),0);carGroup.visible=!(GBQ.sec!=null&&GBQ.panOn&&SHOP.tab==='voiture'); /* (2026-10-16, missions v2) une SECRÈTE regardée en boutique : le plateau vide, jamais sa caisse */try{garBqIndus(dt,ay,t9);}catch(e){}try{garFigTick(dt);}catch(e){} /* (essai) LA BOUTIQUE INDUSTRIELLE · (2026-10-14) la FIGURE essayée */ // posée SUR le plateau — (2026-09-29, Léo) et c'est ELLE qui tourne, avec lui (voir GAR_CAM_A)
  garageFloor.visible=false;                       // l'ancienne nappe de brume : l'atelier a un vrai sol
  // CIEL CYAN étoilé — ce qu'on voit par la porte relevée (poussé après bioStep : ça gagne cette frame)
  skyU.uSkyMul.value.set(.62,.92,1.34);skyU.uStars.value=1.7;skyU.uMoon.value=1.5;skyU.uSunHalo.value=.12;
  sunSprite.visible=false;horizonGlow.visible=false;for(const r9 of RAYS)r9.visible=false;
  // ÉCLAIRAGE D'ATELIER : on RECYCLE les deux lampes de l'étal — clé chaude au plafond, contre-jour
  // froid côté porte. Aucune PointLight ajoutée à la scène : chacune se paierait sur toutes les
  // frames du jeu, course comprise (voir la note en tête de buildGarageRoom).
  // ⚠ DOSAGE : à 2,9 + 1,9 tout partait en pastel délavé — quatre sources qui s'additionnent sur un
  // Lambert, ça sature à blanc. Un atelier, c'est DEUX lampes et beaucoup d'ombre autour.
  // Les deux lampes SUIVENT la caméra (clé à 40° devant, contre-jour derrière) : la caisse est
  // toujours prise sous son meilleur angle et le reflet COURT sur la tôle pendant qu'on tourne.
  // C'est le vieux truc du photographe de studio, et ça vaut mille lumières fixes.
  atelierLampes(true);stallKey.color.setHex(0xffdca8);stallKey.intensity=gEl.classList.contains('menu')?1.25:1.6;stallKey.distance=gEl.classList.contains('menu')?30:22; /* (garage v7) BOUTIQUE : la clé plus forte mais plus COURTE (portée 22) — la caisse se détache, la pièce garde son ombre */ // (chasse aux gels) les lampes entrent, les gyrophares sortent : 8 lumières, les programmes de la course
  /* (2026-09-30, L'ATELIER v2) les lampes suivent la CAMÉRA (garCamA), plus le plateau : depuis que la caméra est fixe et que c'est le
     plateau qui tourne (« le garage sobre »), elles tournaient AVEC la caisse — elle montrait toujours le même côté éclairé et aucun reflet
     ne courait sur la tôle. Et le CONTRE-JOUR, c'est le FEU : face à la porte (au menu, au lâcher) il passe du cyan à la braise et vacille
     avec les flammes — la caisse se découpe sur le rideau de feu, bordée d'orange. Dos à la porte, il redevient le cyan d'avant. */
  {const cA9=garCamA(),wF=Math.max(0,-Math.cos(cA9))*(.25+.75*(GAR.porte?Math.max(0,GAR.porte.e):1)),fl9=1+.13*Math.sin(t9*9.1)+.08*Math.sin(t9*23.7);
   stallKey.position.set(Math.sin(cA9+.72)*5.2,ay+4.1,Math.cos(cA9+.72)*5.2);
   stallRim.color.setRGB(.62+.38*wF,.74-.34*wF,1-.86*wF);garRessort(GAR,'vitL','vitLv',GAR.vit||0,4.8,dt);stallRim.intensity=(.5+.6*wF)*(wF>0?fl9:1)+VITRINE_CAM.rim*(GAR.vitL||0);stallRim.distance=26;stallKey.intensity+=VITRINE_CAM.cle*(GAR.vitL||0); /* (LA MISE EN PLACE) les lampes gardent leur FONDU quand le plan se pose d'un coup (`vitL`) */ // (vitrine v2) la clé et le contre-jour montent d'un cran : la caisse se DÉTACHE
   stallRim.position.set(Math.sin(cA9+Math.PI+.35)*6,ay+2.3,Math.cos(cA9+Math.PI+.35)*6);}
  {const V9=GAR.V||(GAR.V={cle:1.3,rim:1.5});stallKey.intensity*=V9.cle;stallRim.intensity*=V9.rim;} // (2026-10-14, passe graphismes · garage-lumiere) la clé et le contre-jour : deux gains (la caisse se détache) réglables au banc par dbgGarObj().V
  try{garAtelierTick(dt,ay);}catch(e){}try{garBqLumiere();}catch(e){} // (2026-10-12) L'ATELIER FERMÉ de l'INVENTAIRE : porte, lampe, pinces (après les lampes : la clé passe au-dessus de la caisse)
  // LE TUBE AU MAUVAIS STARTER : un néon sur six grésille. C'est ce seul détail qui fait passer le
  // décor de « maquette bien rangée » à « garage » — un atelier neuf, ça n'existe pas.
  if(GAR.flick){const b9=Math.sin(t9*13.7)*Math.sin(t9*4.3)+Math.sin(t9*31.1)*.4;
    const on9=b9>-.55||Math.random()<.02;
    GAR.flick.t.visible=on9;GAR.flick.h.visible=on9;}
  for(let i=0;i<GAR.neons.length;i++) // le néon respire (le tube rose bat un peu plus fort que le $)
    GAR.neons[i].material.opacity=.8+.2*Math.sin(t9*(2.1+i*1.7)+i)+(Math.random()<.006?-.5:0);
  if(GAR.drop){GAR.drop.rotation.z=Math.sin(t9*.83)*.045;GAR.drop.rotation.x=Math.cos(t9*.61)*.035;} // la baladeuse balance
  if(GAR.dust){ // la poussière monte dans les cônes de lumière, et repart d'en bas
    const a9=GAR.dust.geometry.attributes.position,ar=a9.array;
    for(let i=0;i<GAR.dustV.length;i++){const j=i*3;
      ar[j+1]+=GAR.dustV[i]*dt;ar[j]+=Math.sin(t9*.6+i)*dt*.08;
      if(ar[j+1]>GAR.H-.4){ar[j+1]=.3;ar[j]=(Math.random()-.5)*GAR.W*.86;ar[j+2]=(Math.random()-.5)*GAR.D*.86;}}
    a9.needsUpdate=true;}
  // ================= LE RETOURNEUR =================
  // Trois temps, et le remplacement du modèle tombe PILE entre les deux premiers :
  //   1. l'AVALAGE  — le scanner monte, la caisse s'écrase dans le plateau (0 → .34 s)
  //   2. l'ÉCHANGE  — invisible, sous le scanner à son point haut
  //   3. la SORTIE  — le scanner redescend, la nouvelle se déploie avec un petit dépassement
  // ⚠ l'écrasement va à .001 et JAMAIS à 0 : une échelle nulle rend la matrice non inversible et
  // three râle en console à chaque frame (et certains pilotes affichent alors n'importe quoi).
  const SW=GAR.sw;
  if(SW&&GAR.pod){
    SW.t+=dt; const A=.34,B=1.06;
    if(SW.t<A){ const k=SW.t/A,e=k*k;
      carGroup.scale.set(1-.22*e,Math.max(.001,1-e),1-.22*e);
      GAR.scan.visible=true;GAR.scan.position.y=GAR.POD+.02+e*2.35;
      GAR.scan.material.opacity=Math.min(1,k*2.2);
    }else{
      if(!SW.fait){SW.fait=true;garageShow(SW.to);}        // L'ÉCHANGE, sous le rideau
      const u=Math.min(1,(SW.t-A)/(B-A)),o9=1-Math.pow(1-u,3);
      const bk=1+.14*Math.sin(Math.PI*Math.min(1,u*1.25))*(1-u); // le dépassement : elle « claque » en place
      carGroup.scale.set(1-.22*(1-o9),Math.max(.001,o9*bk),1-.22*(1-o9));
      GAR.scan.position.y=GAR.POD+.02+(1-o9)*2.35;
      GAR.scan.material.opacity=Math.max(0,1-u*1.15);
      if(SW.t>=B){GAR.sw=null;GAR.scan.visible=false;carGroup.scale.set(1,1,1);}
    }
    // LE PLATEAU S'EMBALLE puis retrouve son ralenti — une cloche, pas une rampe : ce qui se lit
    // comme « une machine s'est mise en marche », c'est l'accélération PUIS la décélération.
    const bo=Math.sin(Math.PI*Math.min(1,SW.t/B));
    GAR.podSpin=(GAR.podSpin||0)+dt*bo*11;GAR.pod.rotation.y=garRot()+GAR.podSpin; // l'échange fait encore tourbillonner le plateau
    GAR.ring.material.opacity=.8+bo*1.7;GAR.ring.scale.setScalar(1+bo*.05);
    // ⚠ FLASH DOSÉ TRÈS BAS. Premier essai à +1,6/+1,3 : tout l'atelier virait au pastel délavé —
    // exactement le défaut noté en tête de garageRender (quatre sources qui s'additionnent sur un
    // Lambert, ça sature à blanc). Le scanner est DÉJÀ additif et fait le gros du travail lumineux ;
    // les lampes ne font que confirmer, elles ne doivent pas éclairer la scène une deuxième fois.
    stallKey.intensity+=bo*.45;stallRim.intensity+=bo*.35;
  }else if(GAR.pod){
    GAR.pod.rotation.y=garRot()+(GAR.podSpin||0)+BRB.yaw; /* (2026-10-19) le bras des figures fait tourner le plateau (rodéo, shimmy) */ // (2026-09-29, Léo) le plateau PORTE la caisse : ils tournent ensemble
    // ---- LE TOUCHER (2026-09-05) : la caisse ACCUSE le clic/tap avant même qu'on ait glissé quoi
    // que ce soit — sans ça le geste de swipe n'a rien à répondre à la PRESSION, seulement au
    // déplacement. Un aplatissement bref (fonction sinus : 0→creux→0, jamais de à-coup) qui s'éteint
    // tout seul — `GAR.pressT` compte à rebours depuis `PRESS_D`, posé au pointerdown.
    if(GAR.pressT>0&&BRB.p>0)GAR.pressT=0; // (2026-10-19) le bras des figures est là : la caisse ne s'écrase pas sous le doigt (le patin la tient, ou va la tenir)
    if(GAR.pressT>0){
      GAR.pressT=Math.max(0,GAR.pressT-dt);
      const k=1-GAR.pressT/GAR.PRESS_D,sq=1-Math.sin(Math.min(1,k)*Math.PI)*.07;
      carGroup.scale.set(1/sq,sq,1/sq);
    }else if(carGroup.scale.x!==1)carGroup.scale.set(1,1,1);
    if(GAR.ring){GAR.ring.material.opacity=.8+1.1*GFIG.pulse;GAR.ring.scale.setScalar(1+.04*GFIG.pulse);} // (2026-10-23) la pose d'une figure fait battre l'anneau du plateau (voir garage-saut.js)
    // ---- LE TAP (2026-09-05) : recul bref + pluie de blocs (voir `garageImpact`) — même minuteur
    // pour les deux, ils naissent et retombent ENSEMBLE, c'est un seul geste, pas deux effets qui se
    // chevauchent par hasard.
    if(GAR.impactT>0&&BRB.joue)GAR.impactT=0; // (2026-10-19) tenue par le bras : pas de recul
    if(GAR.impactT>0){
      GAR.impactT=Math.max(0,GAR.impactT-dt);
      const ik=1-GAR.impactT/GAR.IMPACT_D;
      carGroup.position.z-=Math.sin(Math.min(1,ik)*Math.PI)*.16;
      for(let i=0;i<GAR.impactMeshes.length;i++){
        const m=GAR.impactMeshes[i],v=GAR.impactVel[i];
        if(!m.visible)continue;
        v.y-=9*dt;
        m.position.x+=v.x*dt;m.position.y+=v.y*dt;m.position.z+=v.z*dt;
        m.rotation.x+=v.rx*dt;m.rotation.y+=v.ry*dt;
        m.material.opacity=Math.max(0,GAR.impactT/GAR.IMPACT_D);
        if(GAR.impactT<=0)m.visible=false;
      }
    }
  }
  try{burnTick(dt);}catch(e){if(!garageRender._bw){garageRender._bw=1;console.warn('burn-out',e);}}
  try{atlTick(dt);}catch(e){if(!garageRender._aw){garageRender._aw=1;console.warn('atelier',e);}} // (même soir) LE BOUTON ROUGE ET SES OUTILS // (2026-10-05) LE BURN-OUT : la caisse, la fumée, le feu, le son
  const menu9=!!(gEl&&gEl.classList.contains('menu'));
  /* LA VITRINE v2 — LE PLAN DE PRÉSENTATION (2026-10-04, Léo : « je veux avoir un beau point de vue sur la voiture ») : en vitrine la caméra
     descend vers la hauteur des phares, se rapproche, l'objectif se resserre (un peu de téléobjectif : la caisse se tasse moins, elle a du
     poids), la visée remonte (le regard presque à niveau) et le plateau tourne plus lentement — `GAR.vit` (0 → 1) fond le tout, à l'aller
     comme au retour (SHOP déplie la console : on revient au cadrage de la boutique en douceur). Réglages à chaud : `VITRINE_CAM`. */
  /* LA MISE EN PLACE (2026-10-06, Léo : « corrige le bug de mise en point »). MESURÉ : la porte GARAGE de l'accueil passe l'atelier du menu
     à la console SOUS le volet, mais le plan se réglait ensuite à vue — 3 s de ressorts après le lever du volet (la caméra tournait de 38°,
     reculait de 8,8 à 11 m, l'image glissait de 88 px). Désormais, quand la vue de Léo s'allume pendant que l'écran est CACHÉ (volet, ou
     atelier qui vient de s'ouvrir), le plan est RÉSOLU sur-le-champ : six passes de garageRender(0) (rien n'avance, rien n'est dessiné) où
     fondu, recul, décalage de caméra et décentrement d'image prennent leur valeur au lieu de la rejoindre (`GAR.vuePose`), puis une image
     de plus pour affiner. Le volet se lève sur un plan déjà posé. Une entrée À VUE (MISSIONS → ATELIER, sans volet) garde son vol. */
  {if(!garageRender._cale&&GAR.vuePose>0)GAR.vuePose--;
   const vT=garVueLeo()?1:0;
   const vu9=!(ecranWipe._on||GAR.vueNeuve)&&(GMIS.mk||0)>.02; // À VUE : le retour des MISSIONS (le vol de la vue d'ensemble est en cours)
   if(vT&&!GAR.vueT&&(ecranWipe._on||GAR.vueNeuve||vu9)&&!garageRender._cale){GAR.vueT=1;GAR.vuePose=2;garLibre._r=null;GAR.ret=null;GAR.vAv=0;GAR.vDon=true;
     const mk9=GMIS.mk;if(vu9)GMIS.mk=0; // le plan de l'ATELIER se résout sans la vue d'ensemble (elle fausse l'écart mesuré) ; le vol de retour se pose ensuite DESSUS, d'un seul mouvement
     garageRender._cale=true;try{for(let i=0;i<6;i++)garageRender(0);}finally{garageRender._cale=false;if(vu9){GMIS.mk=mk9;GAR.vuePose=0;GAR.vDw=0;GAR.vDv=0;}}}
   if(!garageRender._cale){GAR.vueT=vT;GAR.vueNeuve=false;}}
  if(GAR.vuePose){GAR.vit=1;GAR.vitV=0;}else garRessort(GAR,'vit','vitV',garVueLeo()?1:0,4.8,dt); /* (2026-10-06) LA VUE DE LÉO : la vitrine OU la console de Sacha (voir garVueLeo) */if(GAR.vit<0||GAR.vit>1){GAR.vit=Math.min(1,Math.max(0,GAR.vit));GAR.vitV=0;} // (2026-10-06) le fondu vitrine ⇄ boutique en RESSORT : il partait à pleine vitesse (1er ordre ×2,4/s) — la caméra, l'objectif et le recul démarraient d'un coup
  const VK=GAR.vit,VC=VITRINE_CAM;
  if(GAR.angTw){const T9=GAR.angTw;T9.t+=dt;const e9=Math.min(1,T9.t/T9.D),s9=e9*e9*(3-2*e9);if(garageDrag||GAR.go)GAR.angTw=null;else{garageAng=T9.a0+T9.d*s9;if(e9>=1)GAR.angTw=null;}} // (2026-10-11) un onglet TOURNE la caisse vers ce qu'il montre
  else if(!GAR.fige&&(!garageDrag||menu9||VK>.5))garageAng+=dt*(.24+(VC.rot-.24)*VK)*(1-BURN.k)*(garageDrag&&GAR.doigt==='caisse'?0:1)*(GBQ.platK<1?GBQ.platK*GBQ.platK*(3-2*GBQ.platK):1); /* (2026-10-15) LA POSE TENUE : en boutique, posée à la main, le plateau s'arrête ; rendue, il repart en douceur */if(GAR.go)GAR.platW=0;if(!garageDrag&&GAR.platW){garageAng+=GAR.platW*dt;GAR.platW*=Math.exp(-dt*1.2);if(Math.abs(GAR.platW)<.03)GAR.platW=0;} // (même soir) le PLATEAU tenu ne tourne plus tout seul ; lancé, il file et ralentit // (le plateau tourne toujours : en vitrine le doigt tourne la VUE) // le tour de piste automatique, lent : on a le temps de regarder (au MENU le doigt bouge la VUE, pas le plateau : il continue de tourner)
  /* LE GARAGE QUI VIT (2026-09-30, Léo : « on est censé pouvoir tourner autour — soit le garage en rotation sans qu'on touche, soit
     avec le doigt on glisse et on voit légèrement ; inspire-toi de ma branche ») : LES DEUX. (1) Au repos la VUE balance doucement
     autour de la caisse — les deux sinus lents de sa branche (±~11°, ~22 s) et un souffle de hauteur ; elle s'efface dès qu'on touche
     (le balancement est VERSÉ dans le regard : aucun saut sous le doigt) et revient en fondu. (2) Au MENU, glisser fait TOURNER LE REGARD
     autour de l'atelier (`GAR.vA`) — le TOUR COMPLET depuis que Léo a dit « on doit pouvoir voir derrière » (d'abord borné à ±20°), hauteur
     .08-.42. (3) LE GLISSÉ FONDU (même soir, Léo : « une retouche game design : quand tu pivotes, que ce soit agréable, un effet de
     mouvement fondu ; enlève le retour automatique vers la porte, fais-le (mieux) quand on appuie sur PLAY ») : le doigt pose une CIBLE
     (`GAR.vAc`, `GAR.pT`) que la vue rejoint en douceur (constante de ~80 ms) ; lâché en mouvement, le regard GARDE SON ÉLAN
     (`GAR.vW`, frottement ×e^−3t : un coup de pouce vif glisse encore ~1/3 de sa vitesse en radians) ; saisi, il s'arrête net ; la
     caméra PENCHE un peu dans le virage (`GAR.roll`, ≤ 2,3°, lissé). Plus AUCUN retour automatique : c'est JOUER qui ramène la vue
     derrière la caisse, face au feu, avant le lâcher (voir `GAR.go.pre`). En BOUTIQUE glisser fait toujours tourner la caisse. Le plateau
     tourne toujours. `GAR.fige` (dbgGarage) gèle tout pour les captures. */
  GAR.swK=(GAR.swK||0)+(((garageDrag||GAR.go||GAR.fige||gEl.classList.contains('missions'))?0:1)-(GAR.swK||0))*Math.min(1,dt*.7);
  GAR.swO=(Math.sin(t9*.28)*.15+Math.sin(t9*.117+1.3)*.05)*GAR.swK*(1-VITRINE_CAM.dSway*VK); // (2026-10-05, Léo : « plus doux, ça tourne trop la tête ») en vitrine le balancement au repos est réduit
  GAR.swP=Math.sin(t9*.21)*.025*GAR.swK*(1-VITRINE_CAM.dSwayV*VK); // (même soir, Léo : « l'effet doit moins basculer ») en vitrine, moitié moins · (2026-10-05) ⚠ la v109 l'avait collé au bout du commentaire ci-dessus : la caméra avait perdu son balancement VERTICAL (menu compris)
  if(VDEP.etal)vdepEtalTick(dt,t9); // (2026-10-19) LA VITESSE DE DÉPART : l'étal du moteur soulevé
  if(GAR.affiches)for(const a of GAR.affiches){ // LES AFFICHES (branche de Léo) : elles s'allument au survol, sautent au tap
    a.hv+=((GAR.affH===a?1:0)-a.hv)*Math.min(1,dt*8);
    if(a.pop>0)a.pop=Math.max(0,a.pop-dt);
    const p9=a.pop>0?Math.sin((1-a.pop/.45)*Math.PI*3)*a.pop*.16:0;
    a.g.scale.setScalar((a.s0||1)*(1+a.hv*.03+Math.abs(p9)));a.g.rotation.z=p9*.5;
    a.toile.material.color.setScalar(.84+a.hv*.16);
    a.cadre.material.emissiveIntensity=.25+a.hv*.5+Math.abs(p9)*2;a.lueur.material.opacity=.3+a.hv*.25;}
  if(!GAR.fige&&!GAR.go){ // LE GLISSÉ FONDU : l'élan, puis la vue qui rejoint sa cible
    if(!garageDrag&&GAR.vW){const gl9=typeof GTN!=='undefined'&&GTN&&GTN.glisse,fr9=gl9?GT_FREIN:(VK>.5?VITRINE_CAM.dFrein:3);
      if(gl9){const b9=GTN.k0+(GAR.vW>0?Math.PI:-Math.PI),cap9=(b9-(GAR.vAc||0))*fr9;if(GAR.vW>0?GAR.vW>cap9:GAR.vW<cap9)GAR.vW=cap9;} // (2026-10-10) la jauge lancée vers le bout du rail y FREINE et s'y pose (elle butait net)
      GAR.vAc=(GAR.vAc||0)+GAR.vW*dt;GAR.vW*=Math.exp(-dt*fr9);if(Math.abs(GAR.vW)<.015)GAR.vW=0;}
    const vA0=GAR.vA||0,kS=1-Math.exp(-dt*12),cib9=GAR.vAc!=null?GAR.vAc:vA0;
    /* LE RETOUR À LA PORTE (même soir, Léo : « après 3 s sans action du joueur sur le joystick invisible qui gère le point de vue du garage,
       le champ de vision se replace vers la porte, agréablement »). En vitrine, `retAttente` s après le dernier toucher ET l'élan retombé,
       la vue revient face à l'entrée par le chemin le PLUS COURT (jamais plus d'un demi-tour), en une courbe en S (sinus) de `retDuree` +
       `retPente` × (angle / π) s — ~1,5 s pour un quart de tour, 2 s pour un demi. Le doigt qui touche la RATTRAPE : la saisie reprend sa
       vitesse et elle ralentit sous lui (~5° au banc), sans à-coup. Arrivée, l'angle est ramené dans [−π, π] (le regard qui traîne aussi). */
    if(VK>.5&&!GAR.ret&&!garageDrag&&!GAR.vW&&!GAR.go&&!(typeof GTN!=='undefined'&&GTN&&GTN.fixe)&&performance.now()-(GAR.tDoigt||0)>VITRINE_CAM.retAttente*1000&&Math.abs(GAR.vAv||0)<.02){ // (2026-10-10, Léo : « moins d'effet glissade ») la vue posée À LA JAUGE reste où on l'a mise (GTN.fixe) : 3 s après, elle repartait seule vers la porte et le curseur glissait au milieu — le retour ne suit plus que le glissé du doigt sur le décor
      const w9=Math.atan2(Math.sin(vA0),Math.cos(vA0));
      if(Math.abs(w9)>.004)GAR.ret={a0:vA0,a1:vA0-w9,v0:GAR.vAv||0,t0:performance.now(),d:(VITRINE_CAM.retDuree+VITRINE_CAM.retPente*Math.abs(w9)/Math.PI)*1000};} // (2026-10-06) v0 : la vitesse qu'avait encore la vue — la courbe la reprend (elle repartait de zéro)
    if(GAR.ret&&(VK<=.5||GAR.go))GAR.ret=null;
    if(GAR.ret){const R9=GAR.ret,k9=Math.min(1,(performance.now()-R9.t0)/R9.d);
      const D9=R9.d/1000,h9=(R9.v0||0)*D9;GAR.vA=R9.a0+(R9.a1-R9.a0)*(.5-.5*Math.cos(Math.PI*k9))+h9*k9*(1-k9)*(1-k9);GAR.vAc=GAR.vA;GAR.vAv=(R9.a1-R9.a0)*.5*Math.PI*Math.sin(Math.PI*k9)/D9+(R9.v0||0)*(1-k9)*(1-3*k9);
      if(k9>=1){GAR.ret=null;GAR.vAv=0;GAR.vA=GAR.vAc=R9.a1;const n9=Math.round(R9.a1/(2*Math.PI));
        if(n9){const s9=2*Math.PI*n9;GAR.vA-=s9;GAR.vAc-=s9;if(GAR.aVl!=null)GAR.aVl-=s9;}}}
    else if(VK>.5||gtMene()){ /* (2026-10-10, Léo : « encore plus smooth, la jauge ») quand la JAUGE mène la vue, elle aussi suit ce ressort, AMORTI
         CRITIQUE (GT_LISSE, sans rebond) : elle accélère, file, puis se pose — au lieu du rattrapage du 1er ordre qui partait à pleine vitesse.
         (2026-10-05, Léo : « l'effet flottant à revoir, que ce soit satisfaisant ; là c'est un peu brut le mouvement caméra ») LE RESSORT : la
         vue n'est plus tirée au 1er ordre vers le doigt (elle partait à pleine vitesse au premier pixel et s'arrêtait sec) mais suit un
         ressort AMORTI CRITIQUE (le « SmoothDamp » des moteurs de jeu) : elle ACCÉLÈRE, file, puis FREINE en douceur, sans rebond, et garde sa
         vitesse quand le doigt la relâche (elle ralentit, elle ne cale pas). Temps de réponse `dLisse`. */
      /* (même jour, Léo : « maintenant c'est un peu générique — fais un juste milieu entre les deux ») le ressort est un peu SOUS-amorti
         (dAmorti ,72 au lieu de 1) : la vue suit plus vivement et se pose avec un soupçon de rebond (< 1°), au lieu de s'arrêter « au cordeau ».
         Intégré en pas de 8 ms (Euler semi-implicite : stable à toutes les cadences). */
      const gm9=gtMene(),om=2/(gm9?GT_LISSE:VITRINE_CAM.dLisse),z9=gm9?1:VITRINE_CAM.dAmorti,d9=Math.min(dt,.1),n9=Math.max(1,Math.ceil(d9/.008)),h9=d9/n9;let x9=vA0,v9=GAR.vAv||0;
      for(let i=0;i<n9;i++){v9+=(om*om*(cib9-x9)-2*z9*om*v9)*h9;x9+=v9*h9;}
      GAR.vAv=v9;GAR.vA=x9;if(gm9&&GTN.id==null&&!GTN.glisse&&Math.abs(cib9-x9)<.0015&&Math.abs(v9)<.02){GTN.gt=0;GAR.vAv=0;GAR.vA=cib9;}}
    else{GAR.vAv=0;GAR.vA=vA0+(cib9-vA0)*kS;}
    if(menu9&&GAR.pT!=null)garagePitch+=(GAR.pT-garagePitch)*kS;
    const w9=dt>0?(GAR.vA-vA0)/dt:0;const r9=1-VITRINE_CAM.dRoulis*VK;GAR.roll=(GAR.roll||0)+(THREE.MathUtils.clamp(w9*.016*r9,-.04*r9,.04*r9)-(GAR.roll||0))*Math.min(1,dt*6);
  }else GAR.roll=(GAR.roll||0)*(1-Math.min(1,dt*6));
  // CADRAGE PORTRAIT : le `fov` de three est VERTICAL — sur un téléphone à la verticale le champ
  // horizontal s'effondre et la caisse sort du cadre par les côtés. On rouvre l'angle (FOV_K), on
  // RECULE un peu, et on vise plus BAS pour la faire remonter au-dessus de la fiche. Les trois se
  // règlent ENSEMBLE : reculer rapetisse, viser bas remonte.
  // ================= LE LÂCHER : il prend la main sur tout le reste =================
  if(GAR.go&&GAR.go.pre){ // LE RETOUR AU FEU (voir garageLaunch) : la vue d'orbite revient dans l'axe, le plateau remet la caisse face à la porte
    const P=GAR.go.pre;P.t+=dt;const u=Math.min(1,P.t/P.D),e=u*u*u*(u*(u*6-15)+10);
    GAR.vA=GAR.vAc=P.v0*(1-e);garageAng=P.g0+P.gd*e;garagePitch=P.p0+(.2-P.p0)*e;GAR.pT=garagePitch;GMIS.mk=(P.mk0||0)*(1-e);GAR.vD=(P.vd0||0)*(1-e);GAR.preE=e;
    if(u>=1){GAR.go.pre=null;GAR.vA=GAR.vAc=0;GAR.vD=0;garageAng=GAR_CAM_A;GMIS.mk=0;} // (la caméra de cette image se pose dans l'axe ; le lâcher la relève à l'image suivante)
  }else if(GAR.go){
    const G=GAR.go;
    if(!G.p0){G.p0=camera.position.clone();G.lx0=-Math.sin(garCamA())*1.5;G.lz0=-Math.cos(garCamA())*1.5;G.r0=Math.atan2(Math.sin(garRot()),Math.cos(garRot()));garLacherSon();}
    G.t+=dt;
    const D=1.7,u=Math.min(1,G.t/D);
    const appui=Math.max(0,1-u/.20);                       // l'assiette qui s'écrase au premier quart
    const cz=u*u*17;                                       // ⚠ u² : elle ACCÉLÈRE, elle ne glisse pas
    carGroup.position.set(0,ay+GAR.POD-appui*.055,cz);
    {const e0=Math.min(1,u/.3),r9=G.r0*(1-e0*e0*(3-2*e0));carGroup.rotation.set(appui*.035,r9,0);} // le nez qui se lève sous la charge — et le plateau la remet face à la porte (0,5 s)
    if(GAR.ring){GAR.ring.material.opacity=.8+appui*2.2;GAR.ring.scale.setScalar(1+appui*.06);}
    if(GAR.pod)GAR.pod.rotation.y+=dt*.35;
    // la caméra glisse de l'orbite jusqu'à la place de poursuite, et l'y reste
    const k=Math.min(1,u/.42),e9=k*k*(3-2*k);              // lissage : pas de départ brutal
    /* (2026-09-30, le tour complet) la caméra REJOINT la place de poursuite en tournant autour de la caisse (angle, rayon, hauteur
       interpolés) : en ligne droite depuis le côté de la porte, elle traversait la caisse. Dans l'axe (a0 = π) c'est la ligne droite d'avant. */
    if(G.a0===undefined){G.a0=Math.atan2(G.p0.x,G.p0.z);G.r0p=Math.hypot(G.p0.x,G.p0.z);}
    {let da=Math.PI-G.a0;da=Math.atan2(Math.sin(da),Math.cos(da));
     const a9=G.a0+da*e9,r9=G.r0p+((6.4-Math.min(cz,6.3))-G.r0p)*e9;
     if(e9<1)GAR._v.set(Math.sin(a9)*r9,G.p0.y+(ay+1.72-G.p0.y)*e9,Math.cos(a9)*r9);else GAR._v.set(0,ay+1.72,cz-6.4);}
    camera.up.set(0,1,0);camera.position.copy(GAR._v);
    // (2026-09-26, vague 2) le REGARD aussi glisse de la visée de l'orbite à celle de la poursuite (il sautait d'un coup à la 1re image),
    // et le décentrement de l'objectif (voir garageDecale) revient à zéro sur le même geste
    {const v9=(garageRender._v||0)*POR,yv=ay+1.0-POR*.65-v9*1.35;camera.lookAt(G.lx0*(1-e9),yv+(ay+.85-yv)*e9,G.lz0+(cz+3.2-G.lz0)*e9);garCadre(1-e9);}
    const fovL=(56+u*10)*FOV_K;                            // le champ s'ouvre : c'est ça, la vitesse
    if(Math.abs(camera.fov-fovL)>.01){camera.fov=fovL;camera.updateProjectionMatrix();}
    if(!G.voile&&u>.90){G.voile=true;const f=$('gFade');if(f)f.classList.add('on');} // (2026-09-29) .80 → .90 : la caisse ENTRE dans le rideau de flammes (la porte est à cz 13, atteinte à u .875) avant la coupure
    if(u>=1){
      if(departAttend(G))return; /* (2026-10-28) LE DÉPART ATTEND LA CHAUFFE : à froid, le voile tient tant que la course compilerait (voir departAttend) */
      GAR.go=null;carGroup.rotation.set(0,0,0);
      // ⚠ `resetGame()` fait DÉJÀ tout le travail de relance (piste neuve, meute, `fireLaunchBoost()`)
      // — la caisse a QUITTÉ le garage sur cette piste-menu, une VRAIE course en a besoin d'une autre.
      // `start()` reste réservé au TOUT premier lancement (pas de run précédente à remettre à zéro,
      // `respawn()` du chargement de la page suffit) : `resetGame()` appelée trop tôt y attendrait un
      // `started` déjà vrai que rien n'a encore posé.
      if(GAR.sous){const f9=GAR.sous;GAR.sous=null;try{f9();}catch(e){console.warn('lâcher : piste sous le voile',e);}} // (2026-10-15) la piste tirée par le JOUER de l'atelier se bâtit ICI, sous le voile chaud (voir classiqueJouer)
      const wasStarted=started;
      closeGarage(wasStarted);
      if(wasStarted)resetGame();else{start();fireLaunchBoost();}
      const f=$('gFade');if(f)setTimeout(function(){f.classList.remove('on');},60); // il se retire SUR la piste
    }
    return;                                                // ⚠ on ne rejoue pas l'orbite derrière
  }
  let fovG=52*FOV_K*(1+(VC.fov-1)*VK);
  // (2026-09-26) l'onglet VOITURES porte la barre des familles et la bande de vignettes : la caisse doit monter dans le cadre
  // (visée plus basse, un peu de recul) — sinon elle tourne DERRIÈRE les vignettes. Transition douce entre les onglets.
  garageRender._v=(garageRender._v||0)+(((SHOP.tab==='voiture'&&gEl&&!gEl.classList.contains('quiet')&&!gEl.classList.contains('menu')&&!gEl.classList.contains('vitrine'))?1:0)-(garageRender._v||0))*.12; // (2026-10-04) en VITRINE non plus : pas de bande de vignettes // (2026-09-30) pas au MENU : il n'a pas de bande de vignettes (la caméra reculait pour elle, la caisse flottait dans le vide en portrait)
  const vG=garageRender._v*POR;
  let dG0=garageDist*(1+POR*.34)*(1+vG*.12)*(gEl&&gEl.classList.contains('menu')?.8+.02*POR:1); // (debout ×.82 et plus de recul pour la bande de vignettes : la caisse de PROFIL — le plateau la tourne — tient encore dans la largeur) // (2026-09-30) au MENU il n'y a plus d'onglets en bas : la caméra s'approche, la caisse est le sujet
  // (2026-09-26, audit rendu) le recul pouvait atteindre ~12 m alors que rien de haut n'est garanti libre au-delà de 8,3 m : la caméra
  // traversait le décor. On plafonne le rayon HORIZONTAL à 8 m et on rend le cadrage par l'objectif (même taille de caisse à l'écran).
  const cA=garCamA(),cPit=garagePitch+(GAR.swP||0)+VC.p*VK+(BURN.cad||0)*DON.pitch*VK; /* (BURN-OUT v2) en donut la vue prend un peu de hauteur : les cercles de gomme */GAR.vDcam=GAR.vD||0; // (LA MISE EN PLACE) le décalage avec lequel la caméra est posée À CETTE IMAGE (l'écart mesuré par garCadre est le sien)
  /* (vitrine v2) LE RECUL SE CALCULE SUR LA CAISSE : le plateau la montre de dos (2 m de large) puis de PROFIL (jusqu'à 6 m) — un recul fixe
     la coupait aux bords debout (mesuré : 30 px de chaque côté à 3/4). On fait comme un plateau photo : le rayon de son empreinte au sol
     (`garGabarit`, l'empreinte la plus large qu'elle montre en tournant) doit tenir dans `fw` de la largeur LIBRE (garLibre : tiroir ouvert
     compris), sa hauteur dans `fh` de la hauteur libre. Lissé (la place libre se relit tous les 250 ms). */
  /* (même soir) …mais debout, calé sur le PROFIL, la caisse vue de dos ne faisait plus qu'un tiers de la largeur, sur un grand sol vide. Le
     cadrage suit donc AUSSI la largeur qu'elle montre à cet instant (`w` : son empreinte vue sous l'angle du moment), à moitié
     (`adapt`) : la caméra s'approche quand elle montre l'arrière, recule quand elle passe de profil — un travelling lent (lissé ~1 s),
     comme un cadreur qui garde son sujet. Jamais plus près que ce qui la garde entière. */
  if(VK>.001){const G=garGabarit(),lb=garLibre(),tv=Math.tan(fovG*Math.PI/360),th=tv*VP.w/Math.max(1,VP.h),
      zw=Math.max(.3,2*Math.min(lb.cx-lb.x0,lb.x1-lb.cx)/VP.w),zh=Math.max(.25,(lb.y1-lb.y0)/VP.h),fw=VC.fw+(VC.fwP-VC.fw)*POR, /* (même soir, Léo) la caisse décalée à gauche : la place qui compte est la plus petite des deux moitiés ; debout un peu plus de recul (fwP) */
      q=carGroup.rotation.y-(GAR_CAM_A+(GAR.vD||0)),sq=Math.abs(Math.sin(q)),cq=Math.abs(Math.cos(q)),
      w=G.a*sq+G.b*cq,pr=G.a*cq+G.b*sq,wE=garBurnR(G.R+(w-G.R)*VC.adapt),pE=garBurnR(G.R+(pr-G.R)*VC.adapt), /* (BURN-OUT v2) en donut : le cercle balayé */
      dW=wE/(fw*zw*th)+pE,dH=(G.H*.5+pE*Math.sin(Math.max(.05,cPit))+.25)/((VC.fh+(VC.fhP-VC.fh)*POR)*zh*tv)+pE, /* (2026-10-06, Léo : « le point de vue couché d'avant, un peu plus éloigné, c'est mieux ») couché : fw ,9 · fh ,8, le recul d'avant la v112 ; debout inchangé (fwP · fhP ,88) */dV=Math.max(dW,dH,3.2)*(1+.14*Math.max(0,GBQ.k)*(VP.w>VP.h*1.2?0:1))*(1+BRB.cK); /* (2026-10-19) le bras des figures : du recul */ /* (2026-10-12, Léo : « la voiture un tout petit peu éloignée ») */
    if(GAR.dVs&&!GAR.vuePose)garRessort(GAR,'dVs','dVv',dV,1.8,dt);else{GAR.dVs=dV;GAR.dVv=0;}dG0=dG0*(1-VK)+GAR.dVs*VK;} /* (2026-10-06) le recul en RESSORT (même retard, ~1,1 s) : l'inventaire qui s'ouvre changeait la place libre d'un coup, le travelling partait à pleine vitesse */ /* (même soir) le zoom ne dépend plus de l'angle du DOIGT (il zoomait pendant le glissé) : seulement de la caisse qui tourne, vue de la place de repos ; lissé ~1,1 s */
  const capH=8+2.5*Math.pow(Math.max(0,-Math.cos(cA)),2)+3.5*Math.max(0,GBQ.k); /* (essai) au magasin, un peu plus de recul */ // (2026-09-30, le tour complet) 10,5 m seulement dans l'axe libre (côté établi) ; ailleurs le décor est rangé pour 8 m (la règle des 8,3 m)
  const dG=Math.min(dG0,capH/Math.max(.2,Math.cos(garagePitch))); // (2026-09-29) 8 → 10,5 m : la caméra est FIXE, dans l'axe libre de l'atelier (côté établi) — elle recule au lieu d'ouvrir l'objectif jusqu'à ~87° (« l'effet loupe »)
  if(dG<dG0)fovG=Math.min(88,2*Math.atan(Math.tan(fovG*Math.PI/360)*dG0/dG)*180/Math.PI);
  if(Math.abs(camera.fov-fovG)>1e-4){camera.fov=fovG;camera.updateProjectionMatrix();} // (2026-10-06) seuil ,01° → 1e-4 : le zoom lent avançait par CRANS (une image sur deux), le bord de l'image tremblait
  const cp=Math.cos(cPit)*dG,h=Math.sin(cPit)*dG;
  camera.up.set(0,1,0);
  // GARDE-FOU : la caméra reste DANS l'atelier. On tourne à 360° dedans — jamais à travers un mur,
  // jamais au-dessus du plafond. Le clamp est la seule chose qui rende l'orbite libre SÛRE.
  camera.position.set(
    THREE.MathUtils.clamp(Math.sin(cA)*cp,-GAR.W/2+1.2-20*Math.max(0,GBQ.k),GAR.W/2-1.2+20*Math.max(0,GBQ.k)),
    THREE.MathUtils.clamp(ay+h+1.0+VC.y*VK,ay+.75,ay+GAR.H-1.05),
    THREE.MathUtils.clamp(Math.cos(cA)*cp,-GAR.D/2+1.2-20*Math.max(0,GBQ.k),GAR.D/2-1.2+20*Math.max(0,GBQ.k)));
  /* (2026-10-05, Léo : « c'est avec le doigt qu'on bouge le garage à 360°, mais sinon centré sur l'entrée, sans la porte ») AU REPOS la vitrine
     REGARDE L'ENTRÉE (le centre de l'ouverture, `VC.porteY` au-dessus du sol) : elle reste au milieu de l'image ; la caisse se pose à gauche par
     la PLACE de la caméra (`GAR.vD`, un décalage d'azimut réglé image après image pour qu'elle tombe sur `garLibre().cx`), plus par un
     décentrement d'objectif. Le doigt fait le tour (GAR.vA) : la visée revient au-delà de la caisse (`wD` → 0 quand on regarde ailleurs). */
  /* (même soir, Léo : « c'est un peu brut ») LA VISÉE TOURNE D'UN BLOC AVEC LA CAMÉRA : au repos elle vise l'entrée ; quand le doigt tourne la
     vue, la visée tourne du même angle autour de la caisse (le point visé reste à la même distance, de l'autre côté) — la composition (la caisse
     en bas à gauche, le fond au milieu) ne bouge plus ; avant, la visée basculait de l'entrée vers la caisse en cours de geste : un coup de fouet. */
  /* (même jour, « un peu générique — un juste milieu ») la visée n'est plus tout à fait rigide : elle TRAÎNE derrière le geste (dRegard /s,
     ~0,3 s) — la caisse glisse un peu dans le cadre pendant le tour et y revient quand la vue se pose : le flottement de la v109, sans son fouet. */
  {const aV0=cA-(GAR.vD||0);if(GAR.aVl==null||VK<.5||GAR.fige||GAR.vuePose||gtMene()||(typeof GTN!=='undefined'&&GTN&&GTN.id!=null))GAR.aVl=aV0;else GAR.aVl+=(aV0-GAR.aVl)*(1-Math.exp(-dt*VITRINE_CAM.dRegard)); /* (2026-10-10, Léo : « moins d'effet glissade : qu'elle tourne autour de la voiture ») quand la JAUGE mène, la visée tourne d'un bloc avec la caméra — la caisse reste CLOUÉE dans l'image, c'est le garage qui tourne autour. ⚠ (même jour, Léo : « quand j'active l'œil et que je tourne, ça fait n'importe quoi ») v227 avait posé ce commentaire en // AU MILIEU de la ligne : il avalait le `else` — la visée ne suivait plus le glissé du doigt sur le décor, la caisse partait au bord de l'écran */
   const aV=GAR.aVl,wD=VK*(1-(GAR.preE||0)),Lv=1.5+(GAR.D/2-1.5)*wD;GAR.wD=wD;
   const ty0=ay+1.0-POR*.65-vG*1.35+(VC.vise+VC.viseP*POR)*VK;
   (GAR.lk||(GAR.lk=new THREE.Vector3())).set(-Math.sin(aV)*Lv,ty0+(ay+VC.porteY-ty0)*wD,-Math.cos(aV)*Lv);camera.lookAt(GAR.lk); // (LA MISE EN PLACE) le point visé est gardé : le vol des MISSIONS part de LUI
   const e9=Math.abs(GAR.cErr||0);if(e9>.03)GAR.vDon=true;else if(e9<.006)GAR.vDon=false; /* (même soir, Léo : « arrête de faire tourner automatiquement le garage ») le glissé ne court plus après les petits écarts (le zoom qui respire avec le plateau le faisait tourner sans fin, lentement) : il recadre au-delà de 3 % de l'écran, jusqu'à 0,6 %, puis se tait */
   /* (2026-10-06, Léo : « parfois pour se replacer l'écran a des petits déclics qui se voient corrigés ») LE RECADRAGE EN DOUCEUR. Mesuré au banc
      (lisse/cam.mjs) : vD était un asservissement du 1er ordre ALLUMÉ d'un coup — il partait à pleine vitesse (debout, la caisse passait de 0,7 à
      1,6 px/image d'une image à l'autre juste après le retour à la porte, quand la visée finissait de rattraper) et s'arrêtait net à 0,6 %. vD devient un RESSORT
      (`GAR.vDv`, sa vitesse, toujours continue ; ~1 s pour se poser) ; ce qui l'allume ou l'éteint (l'hystérésis, la vue qui tourne encore, la
      visée qui traîne, le doigt) ne fait que monter ou descendre son POIDS `GAR.vDw` — jamais sa vitesse. Sa cible : l'écart mesuré ÷ ce qu'un
      radian de vD déplace la caisse à l'écran (`S9`, la géométrie de la vue : la visée à Lv derrière la caisse, la caméra à cp devant). */
   if(GAR.go||GAR.fige||VK<.02){GAR.vDv=0;GAR.vDw=0;if(VK<.02&&!GAR.go&&!gEl.classList.contains('missions'))GAR.vD=(GAR.vD||0)*(1-Math.min(1,dt*4));} // (2026-10-06, LA MISE EN PLACE) aux MISSIONS le décalage est GARDÉ : la vue d'ensemble ne le lit pas, et le retour à l'atelier se pose sur le bon plan (il se réglait 2-3 s après, 36° à vue)
   else{const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
     const cib=(GAR.vDon&&!garageDrag&&GAR.cErr!=null&&!((GMIS.e||0)>.005)?1:0)*ss(.5,1,wD)*(1-ss(.03,.1,Math.abs(GAR.vAv||0)))*(1-ss(.02,.06,Math.abs(aV0-aV))); // (LA MISE EN PLACE) pas pendant le vol des MISSIONS : la caméra y est mêlée à la vue d'ensemble, l'écart mesuré ne veut rien dire (il envoyait vD en butée)
     GAR.vDw=(GAR.vDw||0)+(cib-(GAR.vDw||0))*Math.min(1,dt*5);
     const S9=Math.min(2,Math.max(.15,(Lv/(Math.max(.5,cp)+Lv))/(2*Math.tan(camera.fov*Math.PI/360)*VP.w/Math.max(1,VP.h)))),om=VITRINE_CAM.dRecadre,
       d9=Math.min(dt,.1),n9=Math.max(1,Math.ceil(d9/.008)),h9=d9/n9,x0=GAR.vD||0,c9=x0+(GAR.cErr||0)/S9;let x9=x0,v9=GAR.vDv||0;
     if(GAR.vuePose){x9=(GAR.cErrVD!=null?GAR.cErrVD:x0)+(GAR.cErr||0)/S9;v9=0;GAR.vDw=1;}else /* (pas c9 : l'écart a été mesuré avec la caméra de l'image d'avant — repartir de vD le comptait deux fois, la pose oscillait) */ // (LA MISE EN PLACE) l'écran est caché : la caméra prend sa place, elle ne la rejoint pas
     for(let i=0;i<n9;i++){v9+=(GAR.vDw*om*om*(c9-x9)-2*om*v9)*h9;x9+=v9*h9;} // la caisse à droite de sa place → la caméra glisse (la caisse part à gauche)
     GAR.vD=THREE.MathUtils.clamp(x9,-.9,.9);GAR.vDv=x9===GAR.vD?v9:0;}}
  if(GAR.roll)camera.rotateZ(GAR.roll);
  if((BURN.k>.02||BURN.kick>.01)&&!REDUCED_MOTION){const a9=BURN.k*(.8+.5*BURN.chaud+.6*BURN.donK);camera.rotateZ((Math.sin(t9*47.1)*.6+Math.sin(t9*73.3+1.7)*.4)*.0015*a9);camera.position.y+=(Math.sin(t9*53.9+.5)*.6+Math.sin(t9*81.7+2.9)*.4)*.005*a9-.07*BURN.kick;} /* (BURN-OUT v2) la secousse suit la chaleur et le donut ; au DÉPART la caméra encaisse (BURN.kick) */ // (2026-10-06) même amplitude, en BRUIT LISSE (7-13 Hz) : tiré au hasard à chaque image, il grésillait (et deux fois plus vite à 120 Hz) // (BURN-OUT) la caméra vibre à peine // (le glissé fondu) la caméra penche un peu dans le sens où elle tourne
  if(GFIG.kick>.01&&!REDUCED_MOTION)camera.position.y-=.04*GFIG.kick; // (2026-10-23) la pose d'une figure : la caméra encaisse le choc (4 à 5 cm, ça retombe en 0,3 s)
  { // LES MISSIONS : la caméra s'élève sous la porte relevée et regarde tout l'atelier (fondu en S ; le départ la ramène, voir GAR.go.pre)
    if(!GAR.go)GMIS.mk+=(((gEl.classList.contains('missions'))?1:0)-GMIS.mk)*Math.min(1,dt*2.4);
    const u9=Math.min(1,Math.max(0,GMIS.mk)),e=u9*u9*u9*(u9*(u9*6-15)+10);GMIS.e=e;
    if(e>.0005){const L9=GAR.lk,tx=L9?L9.x:-Math.sin(cA)*1.5,ty=L9?L9.y:ay+1.0-POR*.65-vG*1.35,tz=L9?L9.z:-Math.cos(cA)*1.5,cp9=camera.position; /* (2026-10-06, LA MISE EN PLACE) le vol part du VRAI regard de l'atelier : il visait la caisse (le regard d'avant la vitrine) — au retour, la visée sautait de la caisse à la porte quand le vol s'achevait (le « déclic ») */
      cp9.set(cp9.x+(0-cp9.x)*e,cp9.y+(ay+4.4-cp9.y)*e,cp9.z+(11-cp9.z)*e); // ⚠ y 4,4 : les panneaux de la porte relevée sont empilés à 4,92-5,05 m
      camera.up.set(0,1,0);camera.lookAt(tx*(1-e),ty+(ay+.6-ty)*e,tz+(-3.6-tz)*e);if(GAR.roll)camera.rotateZ(GAR.roll*(1-e));
      const fM=camera.fov+((POR>.5?66:58)*FOV_K-camera.fov)*e;if(Math.abs(camera.fov-fM)>.01){camera.fov=fM;camera.updateProjectionMatrix();}}
  }
  if(GAR.dbgAff&&GAR.affiches){const a9=GAR.affiches.find(a=>a.k===GAR.dbgAff); // `dbgAffiche('perso'|'monde')` : face à l'affiche (banc)
    if(a9){const p9=a9.g.getWorldPosition(GAR._af||(GAR._af=new THREE.Vector3()));camera.position.set(p9.x,p9.y,p9.z-3.4);camera.lookAt(p9.x,p9.y,p9.z);}} // (balancement) la visée reste AU-DELÀ de la caisse, du côté opposé à la caméra — dans l'axe (cA = π) : (0, …, 1,5), la visée d'avant // (2026-09-30, Léo) la visée passe AU-DELÀ de la caisse, vers la porte, à 1 m (couché) : la caisse s'assoit en bas du cadre, l'atelier et le feu au-dessus — le cadrage de sa branche. Debout : même hauteur qu'avant (.35), l'interface du bas l'exige
  /* (2026-09-26, vague 2) LA CAISSE MONTE AU-DESSUS DES FLÈCHES — PAR UN DÉCENTREMENT, PAS EN PIQUANT. À l'onglet VOITURES la caisse
     tombait PILE sur la ligne des flèches ◀ ▶ (y ≈ 330 px sur 844) : LE MUR DU SON (6 m) avait nez et poupe coupés par les boutons, et le
     haut de l'écran n'était que plafond et tubes. Piquer la caméra (1er essai) la remontait bien, mais au BORD d'un grand angle de ~87°
     (le recul est borné à 8 m) : étirée de 10-20 %, elle débordait de l'écran de profil. On décentre donc l'OBJECTIF (`setViewOffset`,
     le « décentrement » des chambres photo) : même visée, même perspective, l'image glisse de 13 % vers le haut — la caisse s'installe
     dans le vide entre le compteur et les flèches, le plafond sort par le haut. Portrait + onglet VOITURES seulement (`vG`) ; le lâcher le
     ramène à zéro, closeGarage l'efface (la caméra est celle de la course). */
  /* (2026-09-28, charte v5) EN PAYSAGE, les commandes de l'atelier forment une COLONNE à droite (onglets, familles, vignettes, barre
     d'action) : la caisse centrée passait dessous. Le même décentrement d'objectif, en largeur cette fois — l'image glisse vers la
     gauche, la caisse s'installe dans la moitié libre. Fondu comme l'autre ; zéro en portrait, à la séquence de départ, au lâcher. */
  garageRender._h=(garageRender._h||0)+(((gEl&&!gEl.classList.contains('quiet')&&!gEl.classList.contains('launching')&&VP.w>VP.h*1.25)?1:0)-(garageRender._h||0))*.12;
  try{bqPovApplique();}catch(e){} // (2026-10-13) le CADRAGE de la boutique, par-dessus la vue (voir BQ_POV)
  garCadre(1-(GMIS.e||0),1-(GAR.wD||0)); // (missions) le décentrement du menu s'efface pendant le vol vers la vue d'ensemble · (vitrine) face à l'entrée, pas de décentrement en largeur : c'est la place de la caméra qui pose la caisse
  if(GAR.misCible)GAR.misCible.rotation.y+=dt*1.1; // la cible des missions tourne sur elle-même
  if(GMIS.holo.length)gmHoloTick(t9);
  if(gEl.classList.contains('missions'))gmSuit();
}
