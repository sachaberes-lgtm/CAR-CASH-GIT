    // ---- LOD DE PROXIMITÉ : on ne s'occupe QUE du couloir utile ----
    // La scène porte ~1550 meshes (≈550 pièces + ≈590 plots). Avant, CHAQUE frame faisait tourner les
    // 600 pièces à l'autre bout de la piste : 600 quaternions + 600 matrices monde recalculées pour des
    // objets invisibles, plus autant de tests de frustum. Tout ce qui est hors du couloir est masqué
    // (`visible=false` = ni draw call, ni frustum, ni matrice). Le rayon s'élargit avec la vitesse pour
    // que rien n'apparaisse sous le nez, et en VOL on se recentre sur la portion de piste survolée
    // (`lastNearS`) — sinon le couloir resterait figé au point de décollage et la zone d'arrivée
    // se retrouverait vide pendant tout le saut.
    {
      const cS=(mode==='fall'?lastNearS:s),lodR=620+Math.abs(vA)*1.1;
      for(const pk of pickups){
        if(pk.taken)continue;
        // ⚠ LA FACE D'EN DESSOUS NE SE DESSINE PAS AU SOL (2026-09-25) : chaque pickup existe en miroir sous la
        // route, invisible derrière la dalle mais DESSINÉ quand même — la moitié des appels de dessin pour rien.
        const vis=Math.abs(pk.s-cS)<lodR&&(mode==='fall'||pk.face===side);
        if(pk.mesh.visible!==vis)pk.mesh.visible=vis;
        if(!vis)continue; // hors couloir : on ne l'anime même pas (une pièce instanciée n'est tout simplement pas rangée)
        pk.mesh.rotateOnWorldAxis(pk.ax,dt*(pk.pow?1.4:2.5));
        if(pk.nitro||pk.pow){if(pk.sc0==null)pk.sc0=pk.mesh.scale.x;pk.mesh.scale.setScalar(pk.sc0*(1+(pk.pow?.10:.08)*Math.sin(t*6+pk.s)));} // (2026-09-26) le battement RESPECTE l'échelle (il ramenait les fruits de ×1,9 à ×1)
        pk.mesh.updateMatrix(); // (perf) les objets sont GELÉS : on recalcule à la main ceux qui tournent (et ceux que l'aimant a tirés plus haut)
        if(pk.ci)coinPose(pk); // la pièce : sa matrice est rangée en tête de l'instance
      }
      coinFlush(); // le couloir de l'image part au GPU d'un bloc — et `count` s'y arrête
    }
    updateMoneyRain(dt,t);
    updatePigeons(dt,t);
    updateClouds(dt,t);
    pluieCaisseTick(dt); // (2026-10-21) la pluie éclabousse la caisse
    for(let i9=skulls.length-1;i9>=0;i9--){ // crânes qui tournoient puis s'estompent
      const k9=skulls[i9];
      k9.life-=dt;k9.v.y-=18*dt;
      k9.m.position.addScaledVector(k9.v,dt);
      k9.m.material.rotation+=k9.rs*dt;
      if(k9.life<.6)k9.m.material.opacity=Math.max(0,k9.life/.6);
      if(k9.life<=0){scene.remove(k9.m);k9.m.material.dispose();skulls.splice(i9,1);}
    }
    carLight.position.copy(carGroup.position);carLight.position.y+=3;carLight.distance=12;carLight.decay=2; // ⚠ le menu la passe à 60 : on la reprend à chaque image de course
    if(SURV.last&&!gameOver){carLight.color.setHex(Math.sin(t*18)>0?0xff3030:0x7a1010);carLight.intensity=1.6+Math.sin(t*18)*.9;} // DERNIER : la caisse clignote rouge
    else if(fever>0){carLight.color.setHex(0xffd75e);carLight.intensity=.9+Math.sin(t*12)*.45;}
    else{carLight.color.setHex(0xfff2ea);carLight.intensity=1;}
    // PHARES : le spot suit le nez de la caisse et pose sa flaque chaude 30 m devant (éteint quand la caisse explose)
    carGroup.getWorldDirection(hsF);
    headSpot.position.copy(carGroup.position).addScaledVector(hsF,1.6);headSpot.position.y+=1.5;
    headSpot.target.position.copy(carGroup.position).addScaledVector(hsF,30);headSpot.target.position.y-=1.2;
    headSpot.intensity=(mode==='boom')?0:1.85; // phares qui MORDENT le bitume (la flaque CARPOOL.head assure la lecture, le spot fait répondre le spéculaire)
    {const nu9=LVL.nuit,ok9=nu9>.02&&mode!=='boom'&&!garageOn;PHARE_FX.m.opacity=ok9?.16*nu9*(LUMK.air[0]+LUMK.air[1]*Math.min(1,Math.max(LVL.pluie||0,LVL.brume||0))):0; // (2026-10-17) le faisceau dans l'AIR ne se voit que s'il y a de quoi l'attraper : la pluie, le brouillard (LUMK.air) // (2026-09-30) MINUIT EN VILLE : les faisceaux
     for(let j=0;j<2;j++){const o=PHARE_FX.L[j];o.visible=ok9;if(!ok9)continue;hsU.set(0,1,0).applyQuaternion(carGroup.quaternion);PHARE_FX.r.set(j?1:-1,0,0).applyQuaternion(carGroup.quaternion);
       o.position.copy(carGroup.position).addScaledVector(hsF,1.9).addScaledVector(hsU,.72).addScaledVector(PHARE_FX.r,.62);o.quaternion.copy(carGroup.quaternion);}}
    if(CARPOOL.head)CARPOOL.head.visible=(mode==='drive'); // (2026-09-28) en VOL la nappe de 15 m flottait dans le ciel devant la caisse et tournait avec la vrille comme une pale // (2026-09-26) la flaque rouge et le halo nitro au sol n'existent plus : seuls les faisceaux restent
    // REFLET NITRO/BOOST : le pool de lumière colle à l'échappement (repère caisse : marche aussi sous la dalle)
    hsU.set(0,1,0).applyQuaternion(carGroup.quaternion);
    potMonde(CAR_POT_C,nitroLight.position).addScaledVector(hsF,-.3).addScaledVector(hsU,.1); // (2026-09-26) au droit des POTS, plus au milieu de la poupe
    nfxTick(dt); // (vague 3) NITRO : l'onde d'allumage, les bords de l'image, les enveloppes du coup (voir NFX)
    const nTgt=((mode==='boom')?0:(nitroOn?(nitroBlue?1.5:1.25):(boost>0?.8:0)))*(1+NFX.ign*NFX.ignK*.5); // (vague 3) l'allumage ÉCLAIRE la poupe un instant — un éclair, pas une flaque qui reste // (2026-09-26, audit rendu) AU REPOS : 0 — le reflet rouge permanent était la « tache rouge » derrière la caisse // (2026-09-25) ÷1,5 à ÷2 : additionnée aux flaques et au bloom, elle faisait la « tache violette » // .68 au repos (était .8) : les FEUX ARRIÈRE posent leur reflet rouge en permanence — braise posée, plus le point chaud qui perçait
    nitroLight.intensity+=(nTgt*(.82+.18*Math.sin(t*43))-nitroLight.intensity)*Math.min(1,dt*14); // flamme qui tremble, fondu doux
    {const FL9=CARS[level].fx,fxL=(FL9&&FL9.light!=null&&!nitroBlue)?FL9.light:null; // la signature n'éclaire QUE sous poussée
     if(nitroOn)nitroLight.color.setHex(nitroBlue?NFX_C.b:(pwrNitroT>0?(NFX_C.i):(fxL!=null?fxL:0xff7a24))); // orange nitro / bleu réserve (mêmes teintes que les particules) / VIOLET de la nitro infinie
     else if(boost>0)nitroLight.color.setHex(fxL!=null?fxL:0xffd75e); // pad turbo : coup d'or (vague 3 : l'or de la bible)
     else nitroLight.color.setHex(0xf21808);} // repos : rouge feux arrière PROFOND (la signature ne vit qu'à la nitro)
    if(NYAN.on&&!FX_EFF&&(nitroOn||boost>0)&&!nitroBlue&&!(pwrNitroT>0))nitroLight.color.setHSL((t*.55)%1,1,.6); // (2026-10-07) LE BOOST DU CHAT : son reflet passe par toutes les couleurs de l'arc-en-ciel
    if(ORBFX.feu>0&&mode!=='boom'){ // (2026-09-28) LA RENTRÉE EN FEU : le reflet quitte les pots pour le NEZ, rouge-orange, fort et vacillant — la caisse brûle
      nitroLight.color.setHex(0xff5a1e);nitroLight.position.copy(carGroup.position).addScaledVector(hsF,CARS[level].l*.5).addScaledVector(hsU,.9);
      nitroLight.intensity=Math.max(nitroLight.intensity,3.4*ORBFX.feu*(.8+.2*Math.sin(t*37)));}
    // PLUME DE RÉACTEUR : court au filage, long et affûté à la nitro — flicker haute fréquence, la flamme VIT
    /* (2026-10-07) LA LANCÉE SE VOIT : tenir sa ligne remplit l'élan (`momT`, jusqu'à ×2,8 de reprise) — un mécanisme invisible jusqu'ici. Au sol,
       la plume de croisière (.34) s'allonge avec lui jusqu'à .56 : on VOIT la caisse se charger quand on conduit propre, et retomber au coup de volant. */
    const lanc9=mode==='drive'&&!nitroOn?THREE.MathUtils.clamp(momT/4.2,0,1):0;
    const jTgt=(mode==='boom')?0:((nitroOn?(nitroBlue?1.35:1.05):((mode!=='drive'||loop._wasUp)&&Math.abs(speedKmh)>20?.34+.22*lanc9*lanc9:0))+(boost>0?.4:0));
    JETS.k+=(jTgt-JETS.k)*Math.min(1,dt*11);
    const FM9=FLM_ON?flmPas(dt,speedKmh):null,nfK9=FLM_ON&&NFEU.on?NFEU.k:0,ecl9=!!FM9&&MOTEUR_MINI&&!nitroOn&&!(boost>0)&&!(pwrNitroT>0); // ecl9 : hors nitro, la flamme EST le feu de pixels en minuscule (la goutte lisse se cache, la lueur du pot reste) // (2026-10-15) LE MOTEUR QUI AVANCE (FLM) et le FEU DE PIXELS du nitro (NFEU) — voir près de JET_DIR
    if(JETS.shells.length){
      const jOn=JETS.k>.05,fl9=FM9?1:.82+.18*Math.sin(t*57+Math.sin(t*33)*2.1);
      const iK9=NFX.ign*NFX.ignK; // (vague 3) le COUP d'allumage : la plume jaillit (+1,6 m, plus large) puis se pose
      const jl=Math.max(.03,((.5+Math.min(engTier,15)*.035)*JETS.k*2.1*fl9*(1+NFX.len*.85)+iK9*1.6*Math.min(1,JETS.k))*(1-.62*nfK9)),jr=(.09+.07*JETS.k+NFX.len*.05+iK9*.09)*(1-.25*nfK9); /* (2026-10-15) au nitro la plume n'est plus que la TORCHE dans la bouche du pot : le feu de pixels porte la longueur */ // (2026-09-26) la plume grandit avec le MOTEUR, plus avec l'index de la caisse — (vague 3) et s'ALLONGE à la nitro (×1,85 : 2 à 4 m, Asphalt) : vue à 45° par la poursuite, 2 m ne faisaient qu'un cornet
      // LA SIGNATURE DE LA CAISSE EST UN EFFET DE **NITRO**, pas une peinture permanente (décision
      // du user, 2026-08-05). Au filage la plume reste l'orange commun à tout le monde ; c'est en
      // appuyant que la caisse montre ce qu'elle a dans le ventre — le vert acide, le rose de la
      // pop-tart, l'eau du requin. Une signature qui est TOUJOURS là ne récompense plus rien.
      // ⚠ la RÉSERVE BLEUE garde la priorité absolue : c'est un SIGNAL de jeu (« tu tapes dans la
      // réserve »), et aucune identité de caisse n'a le droit d'effacer un signal.
      const FX9=CARS[level].fx,fxOn=(nitroOn||boost>0)&&!nitroBlue,inf9=pwrNitroT>0&&!nitroBlue; // (2026-09-28) NITRO INFINIE = VIOLET : un SIGNAL, il passe devant la signature de la caisse (comme la réserve bleue)
      if(inf9){jetShellM.color.setHex(NINF.jet);jetCoreM.color.setHex(NINF.core);}else{
      jetShellM.color.setHex(nitroBlue?0x5b7dff:(fxOn&&FX9&&FX9.jet!=null?FX9.jet:(nitroOn?0xff7a24:(boost>0?0xffd75e:0xff8c30)))); // (vague 2) le pad turbo souffle OR : la poussée qui vient de l'argent — (vague 3) les teintes EXACTES de la bible : feu #ff7a24, réserve #5b7dff, or #ffd75e
      jetCoreM.color.setHex(nitroBlue?0xe2ebff:(fxOn&&FX9&&FX9.core!=null?FX9.core:(nitroOn?0xfff2da:0xffe6b0)));} // (vague 3) à la nitro le cœur brûle BLANC : les diamants de choc se lisent sur le corps orange
      if(FM9&&!inf9&&!nitroBlue&&!nitroOn&&!(boost>0)){jetShellM.color.copy(FM9.cF).lerp(FM9.cB,FM9.heat).lerp(FM9.cC,FM9.pop);jetCoreM.color.copy(FM9.kF).lerp(FM9.kC,FM9.pop);} // (2026-10-15) la couleur suit la CHALEUR : rouge-orangé stabilisé, orange en charge, jaune-blanc dans un pop
      else if(nfK9>.02&&!inf9&&!nitroBlue)jetShellM.color.lerp(NFX.blanc,.35*nfK9); // (2026-10-15) au nitro, la torche chauffée à blanc
      jetGlowM.color.copy(jetShellM.color).lerp(NFX.blanc,NFX.len*.45);jetGlowM.opacity=Math.min(1,JETS.k*.95*(FM9?FM9.glow:fl9)+iK9*.5); // (vague 3) à la nitro la tuyère est chauffée à BLANC : le point le plus chaud de la flamme
      JET_T.value=t; // (2026-09-28) la flamme vivante : son bruit coule avec le temps de jeu (figé en pause)
      jetCoreM.uniforms.uRac.value.setHex(nitroBlue?(0xc6d0e6):inf9?NINF.rac:0x6f8cff); // la racine de brûleur : bleue sous le feu, lilas sous la réserve (et sous la nitro infinie)
      JET_QI.copy(carGroup.quaternion).invert();
      for(let i9=0;i9<JETS.shells.length;i9++){ // chaque pot VIT pour lui : sa longueur bat à son rythme (deux pots en phase = un décor)
        const f9=FM9?FM9.L[i9&3]:.84+.16*Math.sin(t*31+i9*2.4)*Math.sin(t*13.7+i9*1.7),m9=JETS.shells[i9],c9=JETS.cores[i9],rr9=FM9?FM9.R[i9&3]:1.1-.1*f9; // (2026-10-15) les bouffées du MOTEUR SIMULÉ, pot par pot (plus de sinus)
        m9.visible=jOn&&!ecl9;m9.scale.set(jr*rr9,jr*rr9,jl*f9);
        /* (sillage v5) LA FLAMME SUIT LA LIGNE : l'axe de la plume se couche vers les premiers mètres de SON sillage (ramenés dans le repère
           caisse), lissé, et jamais à plus de 70° de la poupe ; sans sillage (filage, repos), elle reprend l'axe de la caisse */
        const sl9=SILS[CAR_FEUX.length<2?0:(CAR_POTS[i9]&&CAR_POTS[i9].x<0?0:1)],dl9=JET_DIR[i9]||JET_DIR[0]; // (2026-10-15) la traînée part des FEUX : la plume suit celle de son côté
        if(jOn&&sl9&&sl9.dOk){JET_V.set(sl9.dX,sl9.dY,sl9.dZ).applyQuaternion(JET_QI);
          if(JET_V.z>-.34){const q9=Math.sqrt((1-.34*.34)/Math.max(1e-6,JET_V.x*JET_V.x+JET_V.y*JET_V.y));JET_V.x*=q9;JET_V.y*=q9;JET_V.z=-.34;}}
        else JET_V.copy(JET_NZ);
        dl9.lerp(JET_V,Math.min(1,dt*16)).normalize();
        m9.quaternion.setFromUnitVectors(JET_NZ,dl9).multiply(JET_QS.setFromAxisAngle(JET_Z,t*7.3)); // (plume v2) l'enveloppe TOURNE sur son axe
        if(c9){c9.visible=jOn&&!ecl9;c9.scale.set(jr*.48*(FM9?rr9:1),jr*.48*(FM9?rr9:1),jl*.72*(FM9?f9:.9+.1*f9));c9.quaternion.setFromUnitVectors(JET_NZ,dl9);}}
      const g9=.2+.55*JETS.k*(FM9?FM9.glow:fl9)+iK9*1.1+NFX.off*NFX.off*.35; // (vague 3) la tuyère FLASHE à l'allumage, hoquette à l'extinction
      for(const s9 of JETS.glows){s9.visible=jOn;s9.scale.set(g9,g9,1);}
    }
    if(FLM_ON)try{nfeuPas(dt,nitroOn&&!(NYAN.on&&!FX_EFF),nitroBlue,pwrNitroT>0&&!nitroBlue,speedKmh,FM9,ecl9&&JETS.k>.05);}catch(e){loopWarn(1048576,'feu du nitro',e);} // (2026-10-15) LE NITRO EN FEU DE PIXELS
    // LE DÉPART EN ARC-EN-CIEL (2026-09-05) : les premières secondes de chaque run brillent d'une
    // teinte qui TOURNE — signature du LANCEMENT, pas de la caisse (elle n'efface donc RIEN de la
    // réserve bleue ni des signatures par caisse : elle s'applique APRÈS leur calcul, seulement
    // pendant `startBoostT`, une fenêtre bien plus courte que la moindre partie). `setHSL` plutôt que
    // choisir des hex à la main : la teinte balaie tout le spectre sans jamais tomber sur une valeur
    // qui jure avec le bleu de réserve ou l'orange de repos qui reprennent la main juste après.
    // (2026-10-08, Léo : « le départ n'est pas de la nitro ») RETIRÉ : le départ ne tient plus la touche, il n'a plus de flamme à teinter —
    // une vraie nitro prise dans ces 3 s garde la couleur de SA caisse.
    // TRAÎNÉE DE NITRO : les rubans collent aux tuyères — orange nitro, bleu réserve, or pad turbo
    const tTgt=(mode==='boom')?0:(nitroOn?1:(boost>0?.5:0));
    trailK+=(tTgt-trailK)*Math.min(1,dt*(tTgt>trailK?16:6)); // s'allume sec, s'éteint en douceur
    hsR.set(1,0,0).applyQuaternion(carGroup.quaternion);
    const spec9=CARS[level],tz9=-(spec9.l/2+.32);
    let tcr,tcg,tcb;
    const FXT=FX_EFF||spec9.fx; // la traînée de la boutique a le dernier mot
    const trSig9=TRAINEE_SIGNAL||!FX_EFF; /* (2026-10-15 soir) une traînée ACHETÉE ne se tait plus en réserve bleue ni en nitro infinie (voir TRAINEE_SIGNAL) */
    if(!trSig9&&FXT&&FXT.trail){tcr=FXT.trail[0];tcg=FXT.trail[1];tcb=FXT.trail[2];}
    else if(nitroBlue){tcr=.52;tcg=.72;tcb=1.5;}                       // la réserve bleue reste un SIGNAL — (vague 3) calée sur #5b7dff
    else if(pwrNitroT>0){tcr=NINF.trail[0];tcg=NINF.trail[1];tcb=NINF.trail[2];} // (2026-09-28) la NITRO INFINIE aussi : son ruban est VIOLET, comme sa plume et sa jauge
    else if(FXT&&FXT.trail){tcr=FXT.trail[0];tcg=FXT.trail[1];tcb=FXT.trail[2];} // la signature de la caisse
    else if(nitroOn){tcr=1.38;tcg=.62;tcb=.17;}else{tcr=1.25;tcg=.9;tcb=.26;} // couleurs FRANCHES : le ruban doit rester orange/bleu, jamais blanc — (vague 2) le pad turbo : OR #ffd75e (il était orange, on ne le distinguait pas de la nitro) — (vague 3) la nitro calée sur le feu #ff7a24 (elle tirait au rouge)
    silBraises.mesh.material.color.setRGB(Math.min(1,tcr*.8),Math.min(1,tcg*.8),Math.min(1,tcb*.8)); // (sillage v6) les braises ont la couleur du feu du sillage
    const tw9=nitroOn?1.3+NFX.ign*NFX.ignK*.7:1; // (vague 3) à la nitro le sillage s'épaissit (et gicle à l'allumage — la tête seulement, voir sillageStep)
    { // (2026-10-15) LES TRAÎNÉES DE LUMIÈRE (voir LUMT) : une par FEU ARRIÈRE — toujours là quand on roule, embrasées par le nitro
      const nf9=Math.min(2,CAR_FEUX.length),wu9=nf9===1?SIL.un:1,ku9=.74; // ×.74 (2026-09-25) : additif + bloom, le ruban faisait un faisceau AVEUGLANT sur la route
      const arc9=(NYAN.on&&!FX_EFF)||!!(FXT&&FXT.rainbow)||!!(FXT&&FXT.rubOff),sig9=trSig9&&(nitroBlue||pwrNitroT>0); // (2026-10-07) l'ARC-EN-CIEL est la traînée de nitro du chat : la lumière se tait au nitro (sauf réserve bleue / nitro infinie, des SIGNAUX)
      const fx9=(arc9&&!sig9)?0:trailK,roule9=running&&mode!=='boom'&&Math.abs(speedKmh)>12,fr9=VIT9.frein*(1-fx9);
      VIT9.trK=DMT.act?0:fx9;if(fx9>.01){const m9=Math.max(tcr,tcg,tcb,1e-4);VIT9.trC.setRGB(tcr/m9,tcg/m9,tcb/m9);} // (2026-10-18) le halo du feu prend la couleur de sa traînée (voir carVit)
      const kB=(arc9&&!sig9&&trailK>.05)?0:roule9?LUMT.k*(1+LUMT.kF*fr9):0,kT=kB+(1-kB)*fx9; // la lumière des feux, puis l'énergie du nitro par-dessus
      const lr=LUMT.r[0]+(LUMT.rF[0]-LUMT.r[0])*fr9,lg=LUMT.r[1]+(LUMT.rF[1]-LUMT.r[1])*fr9,lb=LUMT.r[2]+(LUMT.rF[2]-LUMT.r[2])*fr9; // rouge des feux, plus vif au frein
      /* (2026-10-18, traînées) LA TRAÎNÉE GARDE SA COULEUR : le passage du rouge des feux à la couleur de la traînée était un mélange RGB à la mesure
         de l'énergie — or après le nitro elle reste à mi-énergie tant que dure le boost (trailK vise ,5) : MENTHE + rouge = un JAUNE doré, HYPERESPACE
         + rouge = un violet, la traînée en avait l'air d'une autre (VU au banc). La couleur bascule désormais vite (`cw9` : pleine dès 38 % d'énergie)
         et le court passage creuse l'éclat au lieu de montrer la teinte boueuse ; l'ÉNERGIE (longueur, chaleur, pouls) suit toujours fx9. */
      const cw9=THREE.MathUtils.smoothstep(fx9,.03,.38),cl9=(1-cw9)*(1-cw9),ct9=cw9*cw9;
      const cr9=(lr*cl9+tcr*ct9)*ku9,cg9=(lg*cl9+tcg*ct9)*ku9,cb9=(lb*cl9+tcb*ct9)*ku9,wm9=1+(tw9-1)*fx9,wl9=wu9*(LUMT.w+(1-LUMT.w)*fx9);
      loop._nOnT=nitroOn?(loop._nOnT||0)+dt:0;let kT9=DMT.act?0:kT; /* (LE DEMI-TOUR) pendant la manœuvre les traînées se taisent : accrochées aux feux, elles dessinaient une boucle sur la route */if(FXT&&FXT.pop==='neon'&&!sig9&&fx9>.05)kT9*=neonAllume(loop._nOnT); // (2026-10-16, TRAÎNÉES) ROSE NÉON : l'enseigne qui s'allume en clignotant
      SIL_STY=(FXT&&FXT.sil&&!sig9&&fx9>.4)?FXT.sil:null;
      const lgT=LUMT.lg+(SIL.LONG-LUMT.lg)*fx9;
      for(let i9=0;i9<4;i9++){const tr9=SILS[i9];
        tr9.hk=fx9;tr9.lg=lgT>tr9.lg?lgT:Math.max(lgT,tr9.lg-LUMT.rDn*dt); // la queue de nitro s'allonge d'un coup, et se fait AVALER en douceur
        if(i9<nf9){potMonde(CAR_FEUX[i9],tmp2);sillageStep(tr9,tmp2.x,tmp2.y,tmp2.z,cr9,cg9,cb9,kT9,wm9,dt,wl9);}
        else sillageStep(tr9,0,0,0,0,0,0,0,1,dt);} // un feu de moins (changement de caisse) : ce sillage s'éteint
      SIL_STY=null;
    }
    // L'ARC-EN-CIEL EST LA TRAÎNÉE DE NITRO DE CETTE CAISSE — pas un décor permanent. Il suit donc
    // `trailK`, exactement comme les rubans des autres : il se déclenche à l'appui, s'éteint en
    // douceur, et le joueur le MÉRITE. (Première version : toujours visible dès qu'on roulait ;
    // le user a tranché — les effets spéciaux de caisse sont des effets de nitro.)
    { // (2026-10-07) L'ARC-EN-CIEL EN FEU DE PIXELS (voir ARC_*) : le CHAT à la nitro (et plus en vol : 2026-10-08), ou toute caisse qui porte la
      // traînée ARC-EN-CIEL de la boutique, à la nitro. ⚠ Il s'efface en réserve bleue et en nitro infinie, comme la plume : sinon la caisse
      // arborerait ses six couleurs pendant que le reste dit « tu tapes dans la réserve » — deux messages, et le signal se perd dans la fête.
      const nyan9=NYAN.on&&!FX_EFF,arcOn9=nyan9||!!(FXT&&FXT.rainbow);
      /* (2026-10-08, Léo : « l'arc-en-ciel ne se déclenche qu'à la NITRO, pas aux boosts au sol ») il a SA propre intensité, branchée sur la
         seule nitro (au sol comme en l'air) : `trailK` s'allumait à moitié sur une plaque turbo et dans le boost qui suit la nitro, et le
         chat le sortait aussi en vol. S'allume sec, s'éteint en ~0,5 s (l'extinction : il raccourcit en étincelles, voir rainbowStep). */
      loop._arcK=(loop._arcK||0)+((nitroOn&&mode!=='boom'?1:0)-(loop._arcK||0))*Math.min(1,dt*(nitroOn?16:6));
      if(arcOn9){const rk=(DMT.act||mode==='boom'||((trSig9||nyan9)&&(nitroBlue||pwrNitroT>0)))?0:loop._arcK;
        if(nyan9)nyanPixNitro(dt,rk*.45); // ses PIXELS scintillent toujours autour, moins nombreux : l'arc-en-ciel mène
        if(nyan9)potMonde(NYAN.arc,tmp2);else potMonde(CAR_POT_C,tmp2).addScaledVector(hsU,.19); // le chat : la poupe de la pop-tart, à mi-hauteur
        rainbowStep(tmp2.x,tmp2.y,tmp2.z,rk,t,dt,-hsF.x,-hsF.y,-hsF.z);
      }else if(rainbow.m.visible&&!rainbow.apercu)rainbowCoupe();
    }
    { // (2026-10-14) LES TRAÎNÉES POP (voir TRX) : à la nitro, comme l'arc-en-ciel et WOW — `dbgTrx('grille')` en force une sur n'importe quelle caisse
      const pop9=(FXT&&FXT.pop)||TRX_FORCE;
      if(pop9||(TRX&&TRX.n)){const pk=(!pop9||mode==='boom'||(trSig9&&!TRX_FORCE&&(nitroBlue||pwrNitroT>0)))?0:(loop._arcK||0);trxStep(pop9,pk,dt);}
    }
    { // (2026-10-14) LA TRAÎNÉE WOW (voir wowStep) : le DOGE, ou toute caisse qui porte la traînée WOW — à la nitro, comme l'arc-en-ciel
      const wow9=!!(FXT&&FXT.wow);
      if(wow9||WOWT.n){const wk=(!wow9||mode==='boom'||(trSig9&&(nitroBlue||pwrNitroT>0)))?0:(loop._arcK||0);potMonde(CAR_POT_C,tmp2).addScaledVector(hsU,.25);wowStep(tmp2.x,tmp2.y,tmp2.z,wk,dt,1);}
    }
    // LA GERBE D'EAU : la caisse qui déclare `fx.spray` ne crache pas du feu mais de l'EAU. On sème
    // à la tuyère, en cône, avec une composante latérale franche — une gerbe s'ÉVASE, un jet de
    // réacteur non. Comme le reste des signatures : uniquement sous poussée, jamais en réserve bleue.
    if(FXT&&FXT.spray&&trailK>.05&&mode!=='boom'&&!nitroBlue){
      const nj=(1+(Math.random()*3|0));
      for(let q9=0;q9<nj;q9++){
        potAuHasard(tmp2); // (2026-09-26) l'eau jaillit des pots
        const bx=tmp2.x,by=tmp2.y,bz=tmp2.z;
        const pw=10+Math.random()*16,ev=(Math.random()-.5)*7; // ev = l'évasement, la signature de la gerbe
        spawnP(spray,bx,by,bz,
          -hsF.x*pw+hsR.x*ev+(Math.random()-.5)*2,
          -hsF.y*pw+hsU.y*(1.5+Math.random()*3),
          -hsF.z*pw+hsR.z*ev+(Math.random()-.5)*2,
          .22+Math.random()*.26);
      }
      if(Math.random()<.5)spawnP(foam,
        carGroup.position.x-hsF.x*3.2,carGroup.position.y-hsF.y*3.2+.2,carGroup.position.z-hsF.z*3.2,
        -hsF.x*4+(Math.random()-.5)*3,-hsF.y*4+1.2,-hsF.z*4+(Math.random()-.5)*3,
        .45+Math.random()*.5);
    }
    // LES HÉLICES DU REQUIN : elles brassent doucement au sol et s'emballent en vol (`wingT` est
    // déjà le taux de déploiement des bras — une seule variable pilote la sortie ET le régime).
    if(carProps.length){
      propSpin+=dt*(3.5+wingT*36+AILV.n*40); /* (2026-10-16) et s'emballent au boost (AILV.n) */
      for(const p9 of carProps)p9.m.rotation.y=p9.b+propSpin;
    }
    // L'AILERON DORSAL SORT AVEC LES BRAS : couché dans le dos au sol, dressé en vol. Même `wingT`,
    // donc la caisse a UN seul geste — elle s'ouvre — au lieu de deux animations qui se cherchent.
    if(carFins.length)for(const f9 of carFins)f9.scale.y=.07+.93*wingT;
    // le reflet de la traînée GLISSE sur la route derrière la caisse (même couleur que le ruban)
    trailLight.position.copy(carGroup.position).addScaledVector(hsF,-9).addScaledVector(hsU,1.1);
    trailLight.intensity=0; // (2026-09-26, audit rendu) son reflet rond sur le bitume derrière la caisse est retiré — la lumière reste en scène à 0 (retirer une lumière recompile tout) // ×1.7→1.5 : le RUBAN garde la vedette, son reflet accompagne sans s'additionner brutalement au reste
    trailLight.color.setRGB(Math.min(1,tcr),Math.min(1,tcg),Math.min(1,tcb));
