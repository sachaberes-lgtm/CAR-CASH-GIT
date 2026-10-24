    if(mode==='drive'){
      landMark.visible=false;LM.a=0; // (au sol : le prochain vol repart d'un viseur éteint)
      // ANTI-IDLE : la musique n'avance pas sans toi — reste quasi à l'arrêt trop longtemps et la caisse explose
      const idleKmh=Math.abs(vA)*3.6*SPD;
      if(!introD&&!PARK.on&&!BALADE&&graceT<=0&&idleKmh<22){
        idleT+=dt;
        if(idleT>1.6){
          showMsg(TR('⚠ ROULE OU CRÈVE — ')+decFr(Math.max(0,6-idleT),1)+' s','#ff4d4d'); // compte à rebours vivant
          loop._tickT=(loop._tickT||0)-dt; // TIC d'amorce qui S'ACCÉLÈRE vers le boom
          if(loop._tickT<=0){loop._tickT=Math.max(.10,(6-idleT)*.22);if(SONV2)sfx('arret.tic',{st:6-idleT<1?7:0,vol:6-idleT<1?2:0});else{chimeNote(660+ (6-idleT<1?900:0),0,.05,.22);subBoom(.05);}}
        }
        if(idleT>=6){idleT=0;explode('arret');}
      }else{idleT=Math.max(0,idleT-dt*2.5);loop._tickT=0;}
      frameAt(s,F);
      if(side<0){F.n.multiplyScalar(-1);F.b.multiplyScalar(-1);}
      // cap MONDE : la route tourne sous la voiture
      if(prevTvalid){
        tmp.crossVectors(prevTv,F.t);
        const dyaw=Math.atan2(tmp.dot(F.n),prevTv.dot(F.t));
        /* ⚠ LA CONDUITE v2 (2026-09-25, user : « retravaille la conduite, il faut que ce soit plus fun et cool »).
           AVANT : tout le virage de la route était reporté sur le cap de la caisse (`psi -= dyaw`) — dans CHAQUE courbe il
           fallait contre-braquer en continu, sinon on filait au bord et on tombait ; conduire, c'était corriger la route.
           La v2 faisait suivre 78 % du virage à la caisse (`ASSIST_VIRAGE`) — (conduite v6) REVENU À ZÉRO : c'était l'aimant
           (« quand je ne touche à rien je reste quand même sur la route »). La route tourne SOUS la caisse ; c'est le pouce qui
           prend le virage — et `lacetMax` + des virages à l'échelle de la vitesse (`lvPiste`) le rendent faisable. */
        // (piste v7) LE HAUT DES LOOPINGS : quand la dalle dépasse 60° d'inclinaison (mur, plafond), la caisse SUIT le ruban comme sur des
        // rails — le vrillage du ruban y fabrique un « virage » qui n'en est pas un (mesuré : 8 % des loopings infaisables pouce à fond,
        // 1 % hors de ces parties). Sur la route (dalle < 60°), l'aide reste à ZÉRO.
        const nyR9=side<0?-F.n.y:F.n.y,rails9=TORD.on?0:THREE.MathUtils.clamp((.5-nyR9)/.3,0,1); /* (2026-10-15) sur la route SANS HAUT NI BAS la dalle couchée n'est pas un looping : ses virages sont de vrais virages (pisteTord), le pouce les prend */
        psi=THREE.MathUtils.clamp(psi-dyaw*(1-Math.max(ASSIST_VIRAGE,rails9,0)),-1.4,1.4);routeLacet=dt>0?dyaw/dt:0; // (le pilote de mesure s'en sert pour anticiper)
      }
      prevTv.copy(F.t);prevTvalid=true;
      // MOMENTUM : tenir la ligne droite fait monter la puissance en exponentiel
      // MOMENTUM v2 (2026-09-25) : tenir sa ligne REMPLIT la réserve, manœuvrer la GÈLE (frôlé, slalom, pièce visée ne coûtent plus rien —
      // avant, un slalom de frôlés coûtait jusqu'à 38 % de vitesse) ; seuls la glisse, le gros coup de volant et le pied levé la VIDENT.
      // Plafond 4,3 s = saturation de momF : plus de braquage « en banque ».
      if(up&&!driftEnCours&&Math.abs(psi)<.6){if(Math.abs(psi)<.25)momT=Math.min(4.3,momT+dt);} // (conduite v6) tenir sa ligne DANS un virage compte aussi (on y braque forcément : le pouce ne gèle plus la réserve)
      else momT=Math.max(0,momT-dt*2);
      const momF=1+Math.min(1.8,momT*momT*.1);
      let a=0;
      if(up)a=acc9*(vA<maxSp*(1+FLOW.lv*.05)?1:.55)*(boost>0?1.5:1)*momF*(1+FLOW.lv*.06); // ça pousse TOUJOURS sur la route — et le FLOW pousse plus loin
      if(dn&&!driftEnCours)a=vA>2?-acc9*1.5:-acc9*.75; /* (2026-10-14, Sacha : « la MARCHE ARRIÈRE doit être plus rapide ») en recul .5 → .75 : 1,5× plus vive */ /* (2026-10-09) au clavier ↓ est AUSSI le geste du drift : en drift il ne freine plus — au doigt et à la souris le drift ne freinait pas, au clavier il coûtait ~3× plus de vitesse */
      vA+=a*dt;
      if(nitroOn)vA+=(nitroBlue?48:30)*(ENGINE_TIERS[engTier]?ENGINE_TIERS[engTier].push:1)*dt; // LE MOTEUR pousse : le palier multiplie la nitro
      else if(startBoostT>0)vA+=30*(ENGINE_TIERS[engTier]?ENGINE_TIERS[engTier].push:1)*dt; // (2026-10-08) L'ÉLAN DU DÉPART : la poussée de la nitro, sans la nitro — de la vitesse, rien d'autre
      vA+=-GRAV*F.t.y*hautPente()*Math.cos(psi)*driveDir*dt; // la pente accélère/freine selon le SENS réel de marche
      // pas de plafond : seule la traînée résiste (terminal ≈ 2,4x la vitesse max de la caisse)
      vA-=vA*Math.abs(vA)*(acc9/(maxSp*maxSp*5.8))*dt;
      vA*=Math.max(0,1-.03*dt);
      if(FREIN_L<0){const f9=FREIN_L*(1-Math.exp(-dt/FREIN_TAU));vA*=Math.exp(f9);FREIN_L-=f9;if(FREIN_L>-1e-4){vA*=Math.exp(FREIN_L);FREIN_L=0;}} // (2026-10-17) LE FREIN ÉTALÉ : la perte d'un choc ou d'une pose, en ~0,2 s (voir FREIN_L)
      if(!up&&!dn&&!nitroOn)vA*=Math.max(0,1-.4*dt);
      if(PARK.on&&vA>PARK_VCAP)vA=PARK_VCAP; // PARC : gouverneur de vitesse — la nitro infinie POUSSE mais ne s'emballe pas (contrôlable)
      if(vA<-16)vA=-16; // (2026-10-14, Sacha : « la MARCHE ARRIÈRE doit être plus rapide ») -8 → -16 : 13,8 → 27,6 km/h affichés en recul (×3,6×SPD)
      if(introD){vA=0;momT=0;steer=0;psi=0;} // LARGAGE : chute verticale, contrôles gelés
      if(Math.abs(target)>.1)steerHold=Math.min(.3,steerHold+dt);else steerHold=0;
      // LE DRIFT : braquage FORT à bonne vitesse, ou pouce tiré vers le bas (le geste du frein) en braquant
      const tireBas=TCTL.act&&(TCTL.dy||0)>(driftEnCours?DRIFT_PX:Math.max(DRIFT_PX,TCTL.dyS)),vitOk=Math.abs(vA)>maxSp*.42; // (2026-09-28) en PIXELS : 34,9 px = l'ancien sv < -0,45 — la sensibilité de l'assiette ne change pas le geste du drift — (2026-09-30) pour ENTRER à droite, au moins le seuil de l'ARC du pouce (`dyS`, ≤ 42,5) ; pour TENIR, 34,9 px comme avant : on en sort au même geste
      // (conduite v3) HYSTÉRÉSIS : on ENTRE en drift à 0,85 de braquage (ou pouce tiré), on n'en SORT que sous 0,45 — il ne clignote plus
      // (2026-09-25) le braquage À FOND doit être TENU 0,12 s pour décrocher : un grand glissé de changement de ligne ne part plus
      // en drift (ni au vide). Le geste du frein (pouce tiré vers le bas, ↓) décroche tout de suite.
      // (conduite v6) UNIQUEMENT le geste : pouce tiré vers le bas (↓ au clavier) EN braquant. Braquer fort ne décroche plus tout
      // seul (mesuré : 16 drifts involontaires par minute, 0 mini-turbo). On en sort en relâchant le geste.
      const veut9=!introD&&!PARK.on&&vitOk&&(tireBas||dn)&&Math.abs(steer)>.35;
      driftArm=veut9?driftArm+dt:0;
      if(veut9)driftEnCours=true;
      else if(!vitOk||!(tireBas||dn)||Math.abs(steer)<.2)driftEnCours=false;
      const drifte=driftEnCours;
      if(TCTL.on&&!TUTO.on&&!(SAVE.d.ast&1)){ // (2026-09-26, audit UX) le geste du drift n'était enseigné nulle part
        if(drifte){SAVE.d.ast|=1;SAVE.mark();}
        else if(vitOk&&Math.abs(steer)>.8){loop._astD=(loop._astD||0)+dt;if(loop._astD>1.2){loop._astD=0;SAVE.d.ast|=1;SAVE.mark();misBanniere('ASTUCE',TR('Tire le pouce vers le BAS en tournant : DRIFT !'),'','volant');}}
        else loop._astD=0;}
      // (conduite v6) LE POUCE FAIT TOURNER (voir lacetMax) : il commande un LACET, la caisse le prend en VOL_TAU ; lâché, le lacet
      // retombe à 0 et le cap reste figé dans le monde. En DRIFT : la TRAJECTOIRE tourne 15 % plus serré, et le NEZ pivote en plus
      // (slipB, jusqu'à 24°) — ⚠ la glisse s'AJOUTE au nez, elle ne se retire pas de la trajectoire : sinon, le temps qu'elle
      // s'installe, la caisse partait tout droit (mesuré : décrochée à 1,4 rad/s, elle ne tournait plus du tout pendant 0,2 s).
      /* (2026-09-30, HAUTE VITESSE) LE LACET SUIT L'AVANCE. `spdMult` (NITROOO ×1,10/s, VITESSE ×2 — plafond ×2,6) multiplie l'AVANCE : la
         route tournait donc sous la caisse ×spdMult plus vite, le lacet non — le rayon mini de braquage était ×spdMult. CALCUL : l'épingle
         TECH du 1er moteur (R 68 m ; rayon mini 61 m à 253 km/h) = 89 % de pouce à ×1 → 233 % à ×2,6 : impossible, sortie forcée (le banc
         ntrx.js : « la caisse sort et s'envole »). Le lacet commandé ET l'inertie (VOL_TAU) suivent spdMult : même pouce = même TRAJECTOIRE,
         parcourue plus vite. √spdMult écarté : 144 % sur cette épingle ; au banc node (pilote de mesure), 0,15 à 0,7 sortie/km restaient
         à ×2,6 au 1er moteur (0 avec ×spdMult). VOL_TAU ÷ spdMult : la caisse PÈSE le même nombre de MÈTRES qu'à ×1 — au moteur 10 sous nitro,
         ×2,6 (1 700 km/h), 0,36 → 0,01 sortie/km. Les EFFETS (power-slide, roulis, fumée, traces, VIRAGE SERRÉ) lisent le lacet de BASE
         `yawR/spdMult` : mêmes images et mêmes paiements qu'à ×1 dans le même virage (sinon, à ×2,6, la caisse restait en travers en
         permanence et VIRAGE SERRÉ sonnait dans des courbes molles). Rien ne tourne tout seul : pouce lâché, yawR retombe à 0 comme avant. */
      const spdMult=vitMult(); // (NITROOO) ×1,10/s tenue, et avec VITESSE ×2 : PLAFOND COMMUN ×2,6 (voir vitMult) — SPEED UP : le sol défile DEUX FOIS plus vite (2026-09-26, user : « le power-up vitesse doit faire ×2 »), sans casser la physique
      {const rT=steer*lacetMax(vA)*spdMult*(drifte?1.15:1)*THREE.MathUtils.clamp(vA/8,-1,1)*(slipT>0?.18:BKV.sur?BK_VG.grip:1); // flaque : la direction ne mord presque plus · (2026-10-15) verglas du glacier : elle mord à moitié
       yawR+=(rT-yawR)*(1-Math.exp(-dt*spdMult/VOL_TAU));
       const b0=slipB,bT=drifte?Math.sign(steer)*.42*Math.min(1,Math.abs(steer)):0;
       slipB+=(bT-slipB)*(1-Math.exp(-dt*(drifte?4:6)));
       psi+=yawR*dt+(slipB-b0); // le nez = la trajectoire + la glisse
       if(MURC.psiK>0){MURC.psiK=Math.max(0,MURC.psiK-dt/.06);psi+=(MURC.psiR-psi)*(1-Math.exp(-dt*50));} // (2026-10-17) LE COUP D'ÉPAULE : le renvoi de la paroi en ~50 ms (voir murCote)
       if(BKV.sur)BKV.gl=THREE.MathUtils.clamp(BKV.gl+yawR*dt,-BK_VG.glMax,BK_VG.glMax); // (2026-10-15 soir) SUR LE VERGLAS le pouce tourne le NEZ, la trajectoire ne suit qu'en BK_VG.tau s (voir banqVerglas) : la caisse GLISSE
       const aB9=Math.abs(yawR/spdMult*vA)*SPD; // (HAUTE VITESSE) la charge latérale de BASE : celle qu'aurait le même virage à ×1
       glisse9=THREE.MathUtils.clamp(Math.abs(slipB)*2.6+driftT*.5+Math.max(0,aB9-22)/70,0,1)*Math.min(1,Math.abs(vA)/35); // (2026-09-26) la gomme fume et crisse dès que la caisse chasse (power-slide)
       // (aura v2) LE VIRAGE SERRÉ : tenir une grosse charge latérale 0,9 s sur la route — prendre un virage À FOND, ça se paie
       {const aL9=aB9;FRONDE.cd=Math.max(0,FRONDE.cd-dt);if(aL9>32){virT+=dt*spdMult;if(lat*yawR*driveDir>ROAD_HALF*.2*Math.abs(yawR))virC+=dt*spdMult;if(drifte||slipT>0)virD=true;}else if(aL9<12){if(virPaye&&!virD)frondeLache(virT,virC);virT=0;virC=0;virD=false;virPaye=false;} /* (LA FRONDE) la corde = la moitié INTÉRIEURE du virage (lat du côté où l'on tourne) ; une glisse (drift, flaque) désarme la fronde */ // (HAUTE VITESSE) les 0,9 s se comptent en temps ×1 : le même virage paie, pris à ×1 comme à ×2,6
        if(virT>.9&&!virPaye){virPaye=true;if(SONV2)sfx('virage');chaineAuraMuette('VIRAGE SERRÉ',45,'virage',false,SONV2);}} // (2026-09-29, Sacha) ne s'écrit plus
       filetTick();} // (2026-09-29) LA ROUTE QUI TE RATTRAPE : le VIRAGE À FOND (voir FILET)
      driftTick(dt,drifte);
      if(SENS)try{sensCaisse();}catch(e){} // (2026-10-14, sensations · caisse) le coup de volant sec, la roue qui passe la lèvre et qui remonte : dans la tôle et la main
      // (conduite v3) RASE-BORD : frôler le vide à pleine vitesse RECHARGE le nitro — le risque paie
      if(!introD&&!PARK.on&&Math.abs(lat)>ROAD_HALF*.8&&Math.abs(vA)>maxSp*.5){raseT+=dt;if(!nitroOn)nitroGain(NITRO2.rase*dt,'rase'); /* (LA LOI DU RÉSERVOIR) le rase-bord ne remplit que nitro COUPÉE */flowAdd(6*dt,'route'); // bande du RASE-BORD : les 20 % extérieurs de la demi-route (3 à 4,8 m sur la route large)
        if(raseT>.6&&!raseAnn){raseAnn=true;hap(12);try{chaineAuraMuette('RASE-BORD',40,'rase');}catch(e){}} // (2026-09-29, Sacha) ne s'écrit plus
        if(Math.random()<dt*14){DRIFT_V.set(Math.sign(lat)*CARS[level].w*.5,.1,-.3);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkBlue,DRIFT_V,1,4);}}
      else{raseT=0;raseAnn=false;}
      slideTick(dt); // (2026-10-14 soir) LA FIGURE SLIDE (voir SLD)
      // ---- DRIFT : FREIN + BRAQUAGE à bonne vitesse = le train arrière décroche ----
      // (mobile OK : le frein = tirer le pad vers le bas, déjà mappé sur ArrowDown)
      // Le CAP part plus vite que la TRAJECTOIRE (psi grimpe) mais la caisse continue de filer
      // vers l'avant (vL atténué) : c'est exactement la sensation de glisse. Zéro nouvelle physique.
      // DRIFT DE CONDUITE ABANDONNÉ (2026-07-30) : la glisse ne se RESSENTAIT pas — dans ce modèle le cap
      // EST la trajectoire (vL=vA·sin psi), donc « décrocher » ne fait que tourner plus, sans sensation.
      // Il faudrait une vraie vitesse latérale indépendante du cap : refonte à part, pas un réglage.
      // (la RÉCEPTION EN GLISSE à l'atterrissage, elle, reste — c'est un effet ponctuel bien visible)
      driftT=Math.max(0,driftT-dt*2.2); // retombe après un atterrissage en travers
      psi=THREE.MathUtils.clamp(psi,-1.4,1.4);
      if(DMT.act)dmtConduite(dt); // (LE DEMI-TOUR) la manœuvre tient le volant, la vitesse et la ligne pendant ~1 s
      vL=vA*Math.sin(psi-slipB-BKV.gl); // la TRAJECTOIRE : le cap moins la glisse (0 hors drift) · moins la glissade du verglas (BKV.gl, 0 hors du glacier)
      const lat09=lat; // (BALAYAGE, voir balEcart) la ligne de la caisse AVANT l'avance : plots, pads, dos d'âne et flaques se testent sur le trajet
      lat+=vL*driveDir*dt*SPD*spdMult; // (spdMult : calculé avant le lacet, voir HAUTE VITESSE)
      const sPrev9=s; // ⚠ mémorisé AVANT l'avance : les tremplins se testent sur le SEGMENT parcouru, pas sur un point
      s+=vA*Math.cos(psi-slipB-BKV.gl)*driveDir*dt*SPD*spdMult; // avance le long du ruban dans le SENS de conduite (parc : avant OU arrière)
      const vF=vA;
      boost=Math.max(0,boost-dt);
      speedKmh=Math.abs(vF)*3.6*SPD*spdMult;
      vpalTick(speedKmh); // (2026-09-28) les PALIERS DE VITESSE : chaque centaine franchie se crie (écran nu : pas de compteur sur téléphone)
      {const f9=Math.min(.42,speedKmh/3.6*Math.max(dt,1/120)/Math.max(1,LIGNE_PER.v));LIGNE_U.uFile.value+=(f9-LIGNE_U.uFile.value)*Math.min(1,dt*12);} /* (LES TIRETS FILENT) la route parcourue pendant cette image, en part de période */
      // point de respawn sûr
      if(side>0&&F.n.y>.5&&Math.abs(lat)<ROAD_HALF-2&&Math.abs(psi)<.5)safeS=s;
      // BORD : si la voiture dépasse le côté de la route, elle bascule et tombe dans le vide.
      if(cyCouloirIci()&&Math.abs(lat)>ROAD_HALF-1.15){murCote(dt,'paroi');slideContact();} // (2026-10-14, CANYON) LE COULOIR des Étroits : les parois touchent la route — même mur que Paris
      else if(banqOk())bkCongere(dt); // (2026-10-18, GLACIER) LA CONGÈRE : au-delà de la glace, la neige profonde — on s'enfonce, on ralentit, on ne meurt pas (était : le mur murCote, où la caisse restait collée)
      else if(Math.abs(lat)>ROAD_HALF){
        const out=Math.sign(lat);
        // (bord v2) le CENTRE DE GRAVITÉ passe la lèvre : elle BASCULE — ni saut (était +3,4 vers le haut), ni poussée (+4 %) : on ne
        // décolle pas d'un bord plat, on en tombe. Elle garde sa vitesse et sa dérive ; la gravité fait le reste (voir startFall).
        if(graceT<=0)startFall(0,1,true);
        else{lat=out*ROAD_HALF;if(vL*out>0)vL=0;}
      }
      if(graceT<=0&&!volrOn()&&F.n.y*1<-.15&&Math.abs(vF)<7)startFall(); // (LE VOL QUI SUIT LA ROUTE) sur la route sans haut ni bas, pas de plafond d'où l'on décroche au ralenti : la dalle à l'envers est un sol comme un autre
      // PORTAIL : fin de zone
      if(mode==='drive'&&PARK.on&&((s>L-32&&driveDir>0)||(s<6&&driveDir<0))){ // FREESTYLE : on ne régénère QUE si on sort par le bout vers lequel on roule (les deux sens sont valides, s=0 au spawn ne déclenche rien)
        portalSnd();shake=.35;nitroR=2;
        showMsg('✦ NOUVEAU SECTEUR','#7dffec');
        newTrack();
      }else if(!PARK.on&&portalMesh&&mode==='drive'&&(PCUBE.on?(s>L-24||pcubeFranchi(carGroup.position)):(s>L-32||carGroup.position.distanceToSquared(PORTAL.c)<PORTAL.R*PORTAL.R*.9))){ /* (2026-10-17) le portail de cubes : on passe en TRAVERSANT la fenêtre */ // (2026-09-26) on ENTRE dans l'ovule — par la route ou par le côté (en vol : voir la branche 'fall')
        if(PORTV.att){if(s>L-2)s=L-2;} // (le passage en deux temps) le voile est posé, la construction part à l'image suivante
        else portailPasse();
      }
      // pads turbo
      padCd=Math.max(0,padCd-dt);
      LIGNE.sPd0=LIGNE.sPd;LIGNE.sPd=s; // (LIGNE PARFAITE) le pad de la file se teste sur le TRAJET de l'image (à 600 km/h et 30 i/s, 5,6 m par image)
      const bal9=Math.abs(s-sPrev9)<60,sDe9=bal9?sPrev9:s,lDe9=bal9?lat09:lat; // (BALAYAGE) le trajet de l'image — un saut de `s` (portail, replacement) retombe sur le test en un point
      if(mode==='drive')for(let i9=0;i9<PADS.length;i9++){
        const pl9=LIGNE.padI.has(i9);if(pl9?LIGNE.padPris.has(i9):padCd>0)continue; // (LIGNE PARFAITE) le pad de la file ne se bloque pas sur la recharge du précédent : il ne se prend qu'UNE fois
        if(pl9?((Math.abs(s-PADS[i9])<6||(Math.abs(s-LIGNE.sPd0)<60&&(PADS[i9]-LIGNE.sPd0)*(PADS[i9]-s)<=0))&&Math.abs(side*lat-PADL[i9])<4.1) /* le pad de la LIGNE : son test à lui, inchangé */
          :balEcart(PADS[i9],6,sDe9,s,side*lDe9,side*lat,PADL[i9])<4.1){ // 2,75 de pad + ~1,35 de caisse : il faut MORDRE dessus — (BALAYAGE) sur le trajet : à 30 i/s il sautait par-dessus au-delà de ~1 300 km/h
          const tr9=padTrain(PADS[i9]),trk9=Math.min(5,tr9)-1; /* (LE TRAIN DE BOOSTS) 1, 2, 3… les pads pris à la suite, sans en rater un */
          vA+=18+5*trk9;boost=Math.max(boost,1.5+.2*trk9);if(!pl9)padCd=1.5; /* (LIGNE PARFAITE, audit GAMEPLAY) un pad de la file ne met plus la recharge : au niveau 12 il bloquait le 1er pad de la LIGNE DE NÉON au-delà de ~470 km/h (« LIGNE CASSÉE ») */ // viser paie plus qu'avant (14 → 18)
          if(SONV2)sfx('pad',{st:sonPd(trk9)});else boostSnd(1+.1*trk9);shake=Math.max(shake,.3+.04*trk9);hap(trk9?[10,16,10]:10);
          if(SENS)try{sensCoup(0,-1.7-.25*trk9,-.9);DRIFT_V.set(0,.12,-CARS[level].l*.42);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,5+trk9,7);}catch(e){} // (2026-10-14, sensations) la plaque POUSSE : le nez se lève, le cul s'écrase sur ses ressorts, une gerbe d'or part de sous la poupe — plus fort à chaque pad du train
          slam(tr9>1?TR('BOOST')+' ×'+tr9:'BOOST','','#ffb000','#ff3924',28); /* (2026-09-29, Sacha : « BOOST écrit plus petit ») 46 → 28 */flashEcran('rgba(255,150,0,.5)');fovPunch=Math.max(fovPunch,10+2*trk9); // (HUD v3) « quand tu roules sur un boost, BOOST en gros »
          if(pl9){LIGNE.pris[1]++;LIGNE.padPris.add(i9);}nitroGain(LIGNE.padI.has(i9)?LIGNE.don:.12,LIGNE.padI.has(i9)?'pad.ligne':'pad');flowAdd(6+2*trk9,'route','p');momT=Math.min(4.3,momT+.8); // (LIGNE PARFAITE) le pad de la file rend de quoi tenir jusqu'au fruit
          break;
        }
      }
      rampCd=Math.max(0,rampCd-dt);
      if(mode==='drive')banqPisteHeurt(); // (v4) un pic de la piste, percuté au sol : L'IMPACT
      if(mode==='drive'&&DN.on&&DN.lev&&DN.lev.length)dnLevre(sPrev9); // (2026-10-19) LES DUNES D'OR : on décolle à la crête des vagues, même sans nitro
      if(mode==='drive'&&BANQ.kick&&BANQ.kick.length&&banqOk())for(const k9 of BANQ.kick){ // (v4) LES TREMPLINS DE GLACE — (2026-10-18) une vraie rampe de BK_BEC.lg m : on la MONTE, on décolle à la LÈVRE (k9.s)
        if(lat<k9.l0-.5||lat>k9.l1+.5||s<k9.s-k9.lg-2||Math.min(sPrev9,s)>k9.s+2)continue;
        if(s<k9.s){if(rampCd<=0){const u=Math.max(0,(s-k9.s+k9.lg)/k9.lg),hR=k9.h*Math.pow(u,1.7);if(hR>hopY-.6){hopY=Math.max(hR-.8,hopY+(hR-hopY)*Math.min(1,dt*25));hopV=0;}}break;} // sur la rampe : la caisse en suit la courbe (hopY)
        if(rampCd>0||k9.s<Math.min(sPrev9,s))break;                                                     // la lèvre franchie pendant cette image
        hopY=Math.max(hopY,k9.h);hopV=0;                                                                 // on part du HAUT de la lèvre
        if(Math.abs(vA)*3.6*SPD<70)break;                                                                // au pas : on tombe de la lèvre, sans décoller
        rampCd=1.2;startFall(THREE.MathUtils.clamp(BK_BEC.pop*Math.abs(vA)*vitMult(),14,60),1.04);fallVel.addScaledVector(F.b,-fallVel.dot(F.b)*BK_BEC.axe);boost=Math.max(boost,1.2);shake=Math.max(shake,.5);try{hap([10,18]);}catch(e){}break;} /* (BK_BEC.axe) le tremplin envoie DANS L'AXE de la piste : au banc, la glisse de travers emportée en vol (3-5 s à 45°) sortait la caisse des 196 m — 2 vols sur 9 finissaient hors piste */
      if(hopY>0||hopV!==0){
        hopY+=hopV*dt;hopV-=26*GRAV_K*gK()*dt;
        if(hopY<=0){hopY=0;hopV=0;squashT=Math.max(squashT,.15);if(introD)smashPig();if(POSE_F){const f9=POSE_F;POSE_F=null;try{f9();}catch(e){}}} // SPLAT. — (2026-10-01) et le CONTACT d'une pose (gerbe, choc, gomme)
      }
      /* (2026-10-14, sensations) LA RETOMBÉE D'UN PETIT SAUT. Un dos d'âne, un replacement : la caisse retombait et se tassait (squashT),
         rien d'autre. Désormais, à proportion de la hauteur du saut : deux bouffées de poussière aux roues arrière, le nez qui pique
         un instant, un tic dans la main. Une POSE déclarée en l'air (POSE_F) a déjà sa gerbe et son choc à elle : on ne double pas. */
      if(SENS){if(hopY>0){if(hopY>SCOUP.hop)SCOUP.hop=hopY;if(POSE_F)SCOUP.hopP=true;}
        else if(SCOUP.hop>0){const k9=Math.min(1,SCOUP.hop/1.1),po9=SCOUP.hopP;SCOUP.hop=0;SCOUP.hopP=false;
          if(!po9&&k9>.12&&!introD&&mode==='drive')try{sensCoup(0,.5+.9*k9,0);sensHap(8+Math.round(10*k9),1);
            for(let w9=-1;w9<=1;w9+=2){DRIFT_V.set(w9*CARS[level].w*.45,.06,-CARS[level].l*.32);carGroup.localToWorld(DRIFT_V);sparkBurst(dust,DRIFT_V,1+Math.round(2*k9),2+2*k9);}}catch(e){}}}
      if(SENS&&JEAU.sorti<2.6&&mode==='drive'&&!introD&&jadeEauOk())try{sensMouille(dt);}catch(e){} // (2026-10-14, sensations) sortie de l'eau, elle se pose TREMPÉE : les pneus crachent ~2,5 s (voir SEAU)
      FROLE.t=Math.max(0,FROLE.t-dt);if(FROLE.t<=0)FROLE.n=0;
      // FLAQUES D'HUILE : passer dessus fait GLISSER (contrôle coupé un instant, la caisse chasse)
      oilCd=Math.max(0,oilCd-dt);
      if(mode==='drive'&&oilCd<=0)for(const o9 of OILS){
        if(o9.face!==side)continue; // chaque flaque vit sur SA face
        if(balEcart(o9.s,o9.r+2,sDe9,s,lDe9,lat,side*o9.lat)<o9.r+.6){ // même repère que les plots (posées côté dessus) — (BALAYAGE) sur le trajet de l'image : à 30 i/s, une flaque de 2 m sautait au-delà de ~860 km/h
          slipT=.75;oilCd=1.2;
          if(SENS)try{const e9=!!o9.eau;for(let w9=-1;w9<=1;w9+=2){DRIFT_V.set(w9*CARS[level].w*.5,.1,CARS[level].l*.25);carGroup.localToWorld(DRIFT_V);sparkBurst(e9?spray:dust,DRIFT_V,e9?7:3,e9?9:3.5);}sensCoup(lat>side*o9.lat?1.3:-1.3,.4,0);}catch(e){} // (2026-10-14, sensations) on ENTRE dans la flaque : l'eau gicle des deux roues avant (l'huile soulève un voile), la caisse se couche du côté où elle part
          shake=Math.max(shake,.2);
          if(SONV2)sfx(o9.eau?'flaque.eau':'flaque.huile');else noiseBurst(.35,.12,1900); // long crissement (console de son : l'eau de la ville ne sonne plus comme l'huile)
          hap(60); // (2026-09-26) par hap() : l'interrupteur et le Taptic d'iOS s'appliquent
          break;
        }
      }
      try{banqVerglas(dt);}catch(e){} // (2026-10-15) LE VERGLAS du glacier : la caisse part sur le côté (voir BKV)
      if(slipT>0){ // la voiture chasse : direction quasi coupée + embardée aléatoire
        slipT-=dt;driftT=Math.max(driftT,.7); // (2026-09-28) on VOIT la glisse : fumée de gomme + crissement (au téléphone, le message « huile » est masqué)
        if(SENS)rollV+=Math.sin(slipT*26)*20*Math.min(dt,1/30); // (2026-10-14, sensations) elle LOUVOIE : la carrosserie balance d'un flanc sur l'autre (~2°, une onde lisse — jamais du hasard par image) tant que les pneus ne mordent plus
        psi+=(Math.random()-.5)*2.6*Math.sqrt(dt/60)*Math.min(1,Math.abs(vA)/12); /* (2026-10-09) une marche aléatoire grandit en √dt : ×√(dt/60) = la même embardée à toutes les cadences (à 30 i/s elle était +41 %) */
        psi=THREE.MathUtils.clamp(psi,-1.4,1.4);
      }
      // des petits bouts se détachent par moments (réalisme, surtout l'épave)
      chipT-=dt;
      if(chipT<=0){
        chipT=5+Math.random()*9-(level===0?2.5:0);
        if(Math.abs(vF)>18&&Math.random()<(level===0?.85:.4))dropChip(level===0?1+Math.floor(Math.random()*2):1);
      }
      pickupsTick(dt); // LE RAMASSAGE (au sol ET en vol, 2026-09-30) — voir pickupsTick : même endroit, mêmes effets, même ordre qu'avant
