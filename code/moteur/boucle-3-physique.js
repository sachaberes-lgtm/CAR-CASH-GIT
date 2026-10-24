      if(mode==='drive'){
        frameAt(s,F);
        if(side<0){F.n.multiplyScalar(-1);F.b.multiplyScalar(-1);}
        if(levreY<0){levreY*=Math.exp(-dt*16);if(levreY>-.005)levreY=0;} // (bord v2) la caisse qui a raccroché la LÈVRE finit de remonter sa marche (~0,15 s)
        carGroup.position.copy(F.p).addScaledVector(F.b,lat).addScaledVector(F.n,(side<0?THICK:0)+hopY+levreY-BKB.enf); /* (2026-10-18) -BKB.enf : enfoncée dans la congère du glacier (0 ailleurs) */
        fwdW.copy(F.t).multiplyScalar(Math.cos(psi)*driveDir).addScaledVector(F.b,Math.sin(psi)*driveDir).normalize(); // la caisse REGARDE son sens de marche (parc : peut faire face à -T)
        tmp.crossVectors(F.n,fwdW).normalize();
        mat4.makeBasis(tmp,F.n,fwdW);
        carGroup.quaternion.setFromRotationMatrix(mat4);
        // ---- TOKYO DRIFT (au BOOST) : la caisse se met EN TRAVERS, la trajectoire ne bouge PAS ----
        // C'est le découplage qui manquait au drift précédent : ici on ne touche QU'À L'IMAGE (rotation
        // du mesh autour de la normale). Le pilotage reste exactement celui du joueur → toujours jouable,
        // mobile compris — mais on VOIT enfin la caisse glisser en crabe, contre-braquée.
        {
          const tdKmh=Math.abs(vA)*3.6*SPD;
          /* (2026-09-26, user : « rajoute une animation où la voiture part VRAIMENT sur le côté pendant les virages ») LE POWER-SLIDE :
             l'arrière CHASSE à proportion de la charge du virage (lacet × vitesse) — le nez rentre dans la courbe jusqu'à ~18°, la
             trajectoire reste celle qu'on pilote. ⚠ À ne pas confondre avec l'ancien « Tokyo drift » retiré en v6 : lui pivotait dès
             qu'on touchait le pouce sous nitro, même en ligne droite — celui-ci n'existe QUE dans un virage, et grandit avec lui. */
          const aLat9=yawR/spdMult*Math.abs(vA)*SPD,tdWant=Math.sign(aLat9)*.32*(1-Math.exp(-Math.abs(aLat9)/38))*Math.min(1,tdKmh/90);
          driftYaw+=(tdWant-driftYaw)*Math.min(1,dt*(Math.abs(tdWant)>Math.abs(driftYaw)?5:3.2)); // départ franc, rattrapage plus doux
          if(Math.abs(driftYaw)>.003){
            qTmp.setFromAxisAngle(F.n,driftYaw);
            carGroup.quaternion.premultiply(qTmp); // rotation MONDE autour de la verticale de la route
          }
          if(BKV.yaw){qTmp.setFromAxisAngle(F.n,BKV.yaw);carGroup.quaternion.premultiply(qTmp);}
          if(DMT.y||DMT.act)dmtPose(F,dt); // (LE DEMI-TOUR) le lacet de la manœuvre, la gomme, le panneau // (2026-10-15) ICE SKATE : le crabe et la foulée du patineur sur le verglas
          gsolPose(F); // (2026-10-15) LES FIGURES AU SOL du GLISSER (slide 360, wheelie, stoppie)
          figMemo(dt); // (2026-10-14, LES FIGURES v2) l'assiette des deux dernières images : au décollage, la caisse emporte sa rotation
          frPose(F,dt); // (2026-10-17) LA FIGURE SUR LA ROUTE : elle tourne et bondit par-dessus la pose (après figMemo : l'élan emporté reste celui de la route)
          // (conduite v3) LE ROULIS : la caisse s'écrase sur l'extérieur du virage — elle a du POIDS
          // LE ROULIS (v2) : la CARROSSERIE s'écrase sur l'EXTÉRIEUR du virage, à proportion de la charge latérale (lacet × vitesse) —
          // 6° pour un petit virage, 13-15° en plein braquage, +4° en drift. Un RESSORT (ω 14, amortissement .55) : elle plonge, dépasse
          // à peine et se pose ; un gauche-droite la fait basculer d'un flanc sur l'autre. Les roues, elles, restent au sol.
          /* (bord v2) LES ROUES DEHORS : dès que les roues extérieures passent la lèvre, plus rien ne porte ce côté — la carrosserie
             s'affaisse vers le VIDE (jusqu'à ~9° quand le centre de gravité arrive au bord, où la bascule prend le relais) et le plancher
             RACLE la lèvre (étincelles). C'est l'avertissement physique : on SENT le bord avant d'y tomber. */
          const hw9=CARS[level].w*.5,dB9=Math.abs(lat)-(ROAD_HALF-hw9),pe9=dB9>0?Math.min(1,dB9/hw9):0;
          if(pe9>0&&Math.abs(vA)>12&&Math.random()<dt*28*pe9){DRIFT_V.set(Math.sign(lat)*Math.max(0,hw9-dB9),.08,(Math.random()-.5)*CARS[level].l*.7);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,1,6);}
          {const aLat=yawR/spdMult*Math.abs(vA)*SPD,d9=Math.min(dt,1/30), /* (HAUTE VITESSE) le lacet de BASE : le roulis du même virage qu'à ×1 */
                rollT=Math.sign(aLat)*.26*(1-Math.exp(-Math.abs(aLat)/35))+(driftEnCours?Math.sign(slipB)*.07:0)-Math.sign(lat)*.15*pe9*(2-pe9);
           rollV+=((rollT-carRoll9)*196-rollV*15.4)*d9;carRoll9=THREE.MathUtils.clamp(carRoll9+rollV*d9,-.42,.42);
           pitch9+=(((dn||driftEnCours)?.035:0)-((nitroOn||boost>0)?.03:0)-NFX.ign*NFX.ignK*.1-pitch9)*Math.min(1,dt*6); // plonge au frein/drift, s'accroupit à la poussée — (vague 3) et SE CABRE à l'allumage de la nitro (≈3° le temps du coup)
           const pv=carBody.userData.pivY||.45;
           if(SENS){SCOUP.pv+=(-SCOUP.p*169-SCOUP.pv*13)*d9;SCOUP.p=THREE.MathUtils.clamp(SCOUP.p+SCOUP.pv*d9,-.14,.14);} // (2026-10-14, sensations) le ressort des COUPS de tangage (ω 13, amorti .5) : voir sensCoup
           carBody.rotation.set(pitch9+SCOUP.p+veqConduite(d9),0,carRoll9);carBody.position.set(pv*Math.sin(carRoll9),pv-pv*Math.cos(carRoll9),0);}
        }
        /* (2026-09-28) LA SUSPENSION : la réception, le dos d'âne, le bump écrasaient TOUTE la caisse (`carGroup.scale`) — roues comprises,
           qui devenaient ovales, comme du caoutchouc. Désormais la CARROSSERIE plonge sur ses ressorts (ω ≈ 15, amortie) : elle se tasse,
           remonte en dépassant à peine et se pose ; les roues restent au sol et rondes. `squashT` garde son rôle : c'est l'appui du coup. */
        {const sq=Math.min(1,squashT/.28),d9=Math.min(dt,1/30);squashT=Math.max(0,squashT-dt);
         susV+=((-sq*.17-susY)*230-susV*16)*d9;susY=THREE.MathUtils.clamp(susY+susV*d9,-.26,.12);
         const pv=carBody.userData.pivY||.45;carBody.position.y=pv-pv*Math.cos(carRoll9)+susY;}
        carGroup.scale.set(1,1,1);
        ROUES.v=vF*SPD;if(DMT.act&&DMT.burn)ROUES.v=Math.max(ROUES.v,45); // (LE DEMI-TOUR) au burn-out, les roues patinent // (2026-09-26) la vitesse du SOL sous les pneus : carVit fait tourner chaque roue à v ÷ R (+ flou de jante)
        // ombre
        shadow.material.opacity=0; // (2026-09-25) .10 → 0 : ce disque à bord NET se lisait comme une tache sombre autour de la caisse — l'ombre portée (shadow map) et le blob de contact doux suffisent // en drive la shadow map fait le travail — le disque noir creusait un DONUT dans le néon/les flaques
        shadow.position.copy(carGroup.position).addScaledVector(F.n,.06-hopY); // l'ombre reste collée à la route (drop/dos d'âne)
        mat4.makeBasis(tmp3.copy(F.t),tmp2.copy(F.b),F.n);
        shadow.quaternion.setFromRotationMatrix(mat4);
        shadow.scale.setScalar(1);
        // fumée de gomme : SEULEMENT quand ça glisse (même zone morte que le crissement) —
        // la poussière permanente derrière les roues, c'était du bruit visuel, pas de la vitesse
        const drf9=glisse9; // (conduite v6) la fumée suit la VRAIE glisse (drift, grosse charge, réception) — plus l'angle à la route, qui n'est plus une glisse
        traceTick(Math.abs(vF)>10&&(glisse9>.08||Math.abs(yawR/spdMult*vA)*SPD>9)); // (2026-09-26) LES TRACES DE PNEUS : dès que ça tourne fort ou que ça glisse
        if(drf9>0&&Math.abs(vF)>14){
          const nD9=1+(drf9>.5?1:0),VC9=PT_U.uVc.value;
          for(let r9=0,rp9=emiN('fum',dt);r9<rp9;r9++)for(let k=0;k<nD9;k++){ // (2026-10-09) à la seconde : voir emiN
            const sd2=k?1:-1;
            tmp2.copy(carGroup.position).addScaledVector(fwdW,-spec.l/2).addScaledVector(tmp,sd2*spec.w/2);if(r9)tmp2.addScaledVector(VC9,-dt*r9/rp9); // la bouffée « d'entre deux images » naît là où était la roue
            spawnP(dust,tmp2.x,tmp2.y,tmp2.z, // (2026-09-26) la fumée HÉRITE de la vitesse de la caisse (EXV) : laissée sur place, la caméra la traversait → un grand disque mauve derrière la roue
              VC9.x*.9-fwdW.x*3+tmp.x*sd2*2.5*drf9+(Math.random()-.5)*1.5,VC9.y*.9+F.n.y*1.2+Math.random()*.8,VC9.z*.9-fwdW.z*3+tmp.z*sd2*2.5*drf9+(Math.random()-.5)*1.5,
              .3+Math.random()*.25); // (particules v2) elle hérite de la VRAIE vitesse de la caisse (VC9 : en glisse, le nez ne dit plus où l'on va — calée sur le cap, la fumée partait de côté hors de l'écran), colle à la roue et vit un peu plus : le fondu de vie l'efface en douceur
          }
        }
        // traits d'AIR : discrets, de plus en plus nombreux à mesure que ça accélère
        if(speedKmh>140){ // seuils ×2 (SPD .25→.5 : km/h doublés) — mêmes traits d'air au même état-caisse
          const nS9=speedKmh>640?4:speedKmh>460?3:speedKmh>280?2:1;
          for(let k9=0,n9=nS9*emiN('trS',dt);k9<n9;k9++)if(Math.random()<.85){ // (2026-10-09) à la seconde : voir emiN
            tmp2.copy(carGroup.position).addScaledVector(fwdW,10+Math.random()*40);
            tmp2.addScaledVector(tmp,(Math.random()-.5)*30);
            tmp2.addScaledVector(F.n,1+Math.random()*10);
            const ln9=4+speedKmh*.035;
            spawnStreak(tmp2.x,tmp2.y,tmp2.z,fwdW.x*ln9,fwdW.y*ln9,fwdW.z*ln9);
          }
        }
        if(nitroOn&&!REDUCED_MOTION)nfxVent(dt,fwdW,speedKmh); // (vague 3) NITRO : les stries de vent filent au ras de l'objectif
        // BRAISES d'échappement : fines, vie COURTE, jet serré — le plume mesh (JETS) et la traînée
        // font le spectacle, les particules ne sont plus que des étincelles qui giclent. Fini le mur
        // blanc : avant, des sprites géants restaient plantés dans le monde et la caméra les TRAVERSAIT.
        flames.mesh.material.size=Math.min(.62,.27+Math.min(engTier,15)*.022)*(nitroOn?1.2:1); // (2026-09-26) plus de tirage PAR IMAGE (toute la réserve palpitait d'un bloc) : chaque braise a sa taille (aR) ; et le feu grandit avec le MOTEUR, plus avec l'index de la caisse // PETIT : une étincelle, pas un ballon (le plume mesh fait le volume)
        flameCore.mesh.material.size=Math.min(.34,.14+Math.min(engTier,15)*.012)*(nitroOn?1.25:1);
        flames.mesh.material.color.set(nitroOn?(nitroBlue?0x5b7dff:pwrNitroT>0?NINF.jet:0xff7a24):0xff9030); // (vague 3) la bible : feu #ff7a24, réserve #5b7dff
        flameCore.mesh.material.color.set(nitroOn?(nitroBlue?0xd6e2ff:pwrNitroT>0?NINF.core:0xffe4bc):0xffe2a8); // le CŒUR blanchit (blanc chaud / blanc bleuté)
        const fl=(up||nitroOn)?(nitroOn?(FLM_ON&&NFEU.on&&NFEU.k>.3?1:5):2)+Math.min(3,Math.floor(level/5)):(Math.abs(vF)>8?1:0); /* (2026-10-15) au nitro le FEU DE PIXELS remplace les boules rondes : une braise par pot suffit */
        // (2026-09-25) Les étincelles HÉRITENT de la vitesse de la caisse (EXV) : lâchées à −22 m/s en MONDE alors que la caisse file
        // à 50+, elles fonçaient vers la caméra à ~70 m/s relatifs et gonflaient en gros ronds orange devant l'objectif. Le gaz
        // quitte le pot à −22 m/s PAR RAPPORT À LA CAISSE : c'est la physique, et elles meurent avant d'atteindre la caméra.
        EXV.copy(fwdW).multiplyScalar(Math.max(0,vA)*SPD);
        for(let r9=0,rp9=emiN('fl',dt);r9<rp9;r9++)for(let k=0;k<fl;k++){ // (2026-10-09) à la seconde : voir emiN
          potMonde(CAR_POTS[k%CAR_POTS.length],tmp2); // (2026-09-26) des VRAIS pots de la caisse (voir CAR_POTS)
          if(r9)tmp2.addScaledVector(EXV,-dt*r9/rp9); // (2026-10-09) la braise « d'entre deux images » sort du pot où il était
          const vsp=nitroOn?.6:.9; // flux SERRÉ le long de l'axe : un jet, pas un nuage
          spawnP(flames,tmp2.x+(Math.random()-.5)*.10,tmp2.y+(Math.random()-.5)*.10,tmp2.z+(Math.random()-.5)*.10,
            EXV.x-fwdW.x*(13+Math.min(level,15)*.3+(nitroOn?8:0))+(Math.random()-.5)*vsp,EXV.y+F.n.y*.5+(Math.random()-.5)*vsp,EXV.z-fwdW.z*(13+Math.min(level,15)*.3+(nitroOn?8:0))+(Math.random()-.5)*vsp, // ≤ 2,5 m derrière le pot : la caméra est 3 m plus loin
            .05+(nitroOn?.04:0)+Math.random()*.05);
          if(Math.random()<.3)spawnP(embers,tmp2.x,tmp2.y,tmp2.z,
            EXV.x-fwdW.x*(2+Math.random()*4)+(Math.random()-.5)*3,EXV.y+1+Math.random()*3,EXV.z-fwdW.z*(2+Math.random()*4)+(Math.random()-.5)*3,
            .15+Math.random()*.15);
          if(k<2)spawnP(flameCore,tmp2.x+(Math.random()-.5)*.06,tmp2.y+(Math.random()-.5)*.06,tmp2.z+(Math.random()-.5)*.06,
            EXV.x-fwdW.x*(16+Math.min(level,15)*.3+(nitroOn?8:0))+(Math.random()-.5)*.5,EXV.y+F.n.y*.3+(Math.random()-.5)*.5,EXV.z-fwdW.z*(16+Math.min(level,15)*.3+(nitroOn?8:0))+(Math.random()-.5)*.5,
            .04+Math.random()*.04+(nitroOn?.03:0));
        }
        // backfire : pop de flammes quand on relâche les gaz à haut régime
        if(!up&&loop._wasUp&&speedKmh>280){ // seuil ×2 (SPD .25→.5) : le backfire reste réservé au HAUT régime
          for(let k=0;k<6;k++){
            potMonde(CAR_POTS[k%CAR_POTS.length],tmp2); // (2026-09-26) le retour de flamme sort des pots
            spawnP(flames,tmp2.x,tmp2.y,tmp2.z,-fwdW.x*16+(Math.random()-.5)*2.5,Math.random()*1.6,-fwdW.z*16+(Math.random()-.5)*2.5,.12);
          }
          noiseBurst(.12,.07,900);
        }
        loop._wasUp=up;
        // les caisses de riche crachent des billets par les fenêtres
        if(engTier>=ENG_CAP.billets&&Math.abs(vF)>15){ // CAPACITÉ MOTEUR (V10) : la caisse crache des billets
          billT-=dt;
          if(billT<=0){
            billT=.28+Math.random()*.4;
            const sd9=Math.random()<.5?-1:1;
            tmp2.copy(carGroup.position).addScaledVector(tmp,sd9*spec.w*.55).addScaledVector(F.n,spec.h+.4);
            spawnBill(tmp2,new THREE.Vector3(tmp.x*sd9*2.5-fwdW.x*5+(Math.random()-.5)*3,1.5+Math.random()*2,tmp.z*sd9*2.5-fwdW.z*5+(Math.random()-.5)*3),1.4);
          }
        }
        // caméra COLLÉE à la caisse hors boost (elle remplit l'écran) → RECULE quand on boost (le monde s'ouvre)
        // ⚠ ANGLE : en rapprochant la caméra (5,6 → 4,1) sans baisser sa hauteur, l'assiette est passée
        // de 21,4° à 26° de plongée — la caméra regardait 5° trop vers le bas EN PERMANENCE.
        // La hauteur suit désormais la distance (même rapport qu'à l'origine) : on reste collé à la
        // caisse, mais l'œil retrouve exactement l'angle d'avant.
        const camBoost=Math.min(1,(nitroOn?.72:0)+Math.min(1,boost)*.5);
        // PORTRAIT : on COLLE à la caisse (×.70 — elle déborde volontairement un peu en bas) et on
        // MONTE (×1.72) — c'est la vue plongeante qui la fait tenir ENTIÈRE dans le cadre au lieu de
        // la laisser sortir par le bas. Ces deux valeurs et la visée (plus bas) se règlent ENSEMBLE.
        // ⚠ LA CAMERA RECULE À NOUVEAU (2026-09-05, demande du user : « trop zoomé ») : le 4,1 du
        // 2026-09-03 rapprochait pour mieux voir caisse et route, mais combiné à la dynamique de
        // caméra (lean/swing) ajoutée depuis, l'image est devenue trop serrée. Le recul de base
        // remonte à 5,3 — entre l'ancien 4,6 et le 4,1 récent — la HAUTEUR suit (même rapport ×.46),
        // donc l'angle de vue ne change pas, seule la distance augmente.
        /* ⚠ LA CAMÉRA DE CONDUITE DE SACHA, RÉTABLIE EN BLOC (2026-09-24, user : « la physique de conduite
           est beaucoup plus fun dans la version de Sacha, reprends-la »). Mesuré avant de toucher : les
           ÉQUATIONS de conduite (accélération, adhérence, braquage, `steer`) sont identiques dans les deux
           versions — ce qui change la sensation, c'est tout ce qui l'ENTOURE. Retour donc, à l'identique :
           recul 4,6 (et non 5,3) qui s'allonge avec la vitesse, hauteur ×.393, suivi `dt*5`, roulis 0,035,
           visée fixe — et surtout le CHAMP qui s'ouvre franchement (jusqu'à +38°, +22 en réserve bleue) :
           c'est lui qui dit « ça pousse ». Le glissement latéral (`camSwing`) et le coup de tête au boost
           (`camKick`) de la version de Léo sont retirés ; les variables restent à 0 pour `dbgCam9()`. */
        /* ⚠ LA CAMÉRA COLLE À LA CAISSE (2026-09-25, user, deux fois : « caméra plus proche de la voiture »). Le vrai
           coupable n'était pas le recul : c'était le SUIVI. `camera.position.lerp(cible, dt*5)` suit une cible qui AVANCE —
           le retard en régime établi vaut vitesse ÷ 5 : à fond, la caméra traînait des DIZAINES de mètres derrière la
           consigne, la caisse devenait un point au loin. On lisse désormais l'ÉCART caisse→caméra (dans le repère de la
           caisse), pas la position absolue : la caméra garde la douceur dans les virages et les bosses, mais la vitesse ne
           l'éloigne plus. Recul de base 2,9 (était 3,3), qui s'allonge à peine avec la vitesse et le boost. */
        const hC9=Math.max(0,(CARS[level].h||1.3)-1.5), // (2026-09-26) les HAUTES (monster truck, glacier, combi) : on recule et on monte d'autant — elles bouchaient la route
        ct9=camTailleOn(),H9=CAM_HEROS.on,vCam9=(ct9||H9)?Math.min(speedKmh,CAM_TAILLE.recMax/.0018):speedKmh,bCam9=H9?camBoost*CAM_HEROS.boost:ct9?camBoost*CAM_TAILLE.boost:camBoost, /* (CAM_HEROS) la nitro ne recule plus la caméra ; couché aussi, la vitesse n'éloigne plus au-delà de recMax */
        dz9=H9?CAM_HEROS.dolly(loop._fovB):1,hz9=H9?1-CAM_HEROS.bas*THREE.MathUtils.clamp(speedKmh/Math.max(1,vCroisiere())-.6,0,1):1, /* (CAM_HEROS) le VERTIGO : la caméra avance quand le champ s'ouvre · elle descend à haute vitesse */ // (2026-09-30) CAM_TAILLE : en portrait la vitesse n'éloigne plus la caméra au-delà de recMax (NITROOO ×2,6 l'envoyait à 9 m de haut)
        camBack=(3.6+CARS[level].l*.42+hC9*1.6+vCam9*.0018+bCam9*1.6)*(1-POR*.28)*dz9*(H9?1+(CAM_HEROS.recP-1)*POR:1)*camGlacierM(0), /* (CAM_HEROS) debout, un pas en arrière : le champ resserré suffit à grossir la caisse */ // le recul suit la LONGUEUR de la caisse : la Combi et la Bulle cadrées pareil
       camH=(camBack*.40+hC9*.9+vCam9*.0012+bCam9*.25)*(1+POR*.70)*hz9*camGlacierM(1); // (2026-10-19) ×camGlacierM : la vue qui plonge du glacier
        camLean=(loop._viseR==null||loop._viseR>=1)?steer*.065:camLean+(steer*.065-camLean)*(1-Math.exp(-dt*10));camSwing=0;camKick=0; // (conduite v3) la caméra penche avec toi (était .035) — (2026-10-17) à la POSE la penche (éteinte en vol) revient en ~0,1 s au lieu d'une image (jusqu'à 3,7°, volant tenu) ; ensuite elle colle au volant comme avant
        // (conduite v6) la caméra se place derrière un axe MI-ROUTE MI-CAISSE : avant, elle suivait le cap de la caisse et la clouait au
        // centre de l'image (mesuré : 0 % d'écart à l'écran à 15 m du centre) — on voyait le décor coulisser, pas la caisse bouger.
        if(!loop._camD)loop._camD=new THREE.Vector3();
        loop._camD.copy(F.t).multiplyScalar(driveDir).lerp(fwdW,.55).normalize();
        if(DMT.cam)loop._camD.applyAxisAngle(F.n,DMT.cam);dmtCamTick(dt); // (LE DEMI-TOUR) la caméra tourne autour de la caisse avec elle
        // (2026-09-25, user : « toujours aimantée au centre ») : la caméra suivait la position latérale AU CENTIMÈTRE — la caisse restait
        // plantée au milieu de l'image et c'est la route qui coulissait dessous. Elle suit désormais avec un RETARD (~0,35 s) : quand on
        // change de ligne, on VOIT la caisse partir vers le bord de l'écran, puis la caméra la rejoint. Pas de rappel vers l'axe : la cible
        // est TA position (×1), seul le rythme change.
        {const n9=performance.now();if(loop._camLat==null||n9-(loop._camLatT||0)>(window.dbgCamReprise||CAM_REPRISE))loop._camLat=lat;loop._camLatT=n9;
         loop._camLat+=(lat-loop._camLat)*(1-Math.exp(-dt/.22));}
        // ⚠ PLAFONNÉ à 30 % du recul : la caméra n'est qu'à ~4 m derrière — un retard de 4 m montrait la caisse DE PROFIL, collée au bord
        /* ⚠ (2026-09-30) SOUS LA DALLE, LA CAMÉRA DEVANÇAIT LA CAISSE : il y avait ici un `×(side<0?−1:1)` — mais `lat` et `_camLat` vivent
           déjà dans le repère RETOURNÉ (F.b est retourné plus haut, la caisse est posée à F.p + F.b·lat) : retourné deux fois. La caméra se
           posait à 2·lat − _camLat : au lieu de traîner, elle partait DEVANT la caisse du côté où l'on braque, et la caisse filait à l'écran
           du côté opposé à son mouvement. Le regard (FVISEE, repère NON retourné) avait, lui, le bon signe. */
        const cLag9=THREE.MathUtils.clamp(loop._camLat-lat,-camBack*.3,camBack*.3); // de combien la caméra est en retard sur la caisse (repère de la route, retourné sous la dalle comme F.b)
        tmp2.copy(carGroup.position).addScaledVector(loop._camD,-camBack).addScaledVector(F.n,camH).addScaledVector(F.b,cLag9);
        {const n9=performance.now(); // l'écart repart de la caméra RÉELLE à chaque reprise de conduite (après un vol, le garage, un respawn)
         if(!loop._camOff)loop._camOff=new THREE.Vector3();
         if(n9-(loop._camDriveT||0)>(window.dbgCamReprise||CAM_REPRISE)){ /* (banc) dbgCamReprise : en rendu logiciel (200-300 ms l'image) CHAQUE image passait pour une reprise de conduite et la caméra reculait de v·dt à chaque image */loop._camOff.subVectors(camera.position,loop._carPrev&&loop._carPrev.distanceToSquared(carGroup.position)<900?loop._carPrev:carGroup.position);CAM_ROUTE.phi=0;} /* (2026-10-01, LA POSE) l'écart repart de la caisse de l'image D'AVANT (`_carPrev`) : mesuré à la caisse de CETTE image, il clouait la caméra sur place une image entière (elle n'avançait que de 0,4 m au lieu de 0,8, de 0,6 au lieu de 2,5 à 540 km/h), puis elle rattrapait — l'à-coup de la pose */ // (vague 3) le pivot anticipé repart de zéro, lui aussi
         loop._camDriveT=n9;}
        {const off=loop._camOff,cibleOff=tmp2.sub(carGroup.position);        // l'écart VOULU (tmp2 redevient un écart)
         camRouteTonneau(cibleOff,loop._camD,dt); // (vague 3) dessus ↔ dessous : la caméra ROULE et orbite (voir CAM_ROUTE)
         if(off.distanceToSquared(cibleOff)>2500)off.copy(cibleOff);           // téléport (respawn, portail) : on ne lisse pas un saut de 50 m
         if(DMT.dc)off.applyAxisAngle(F.n,DMT.dc); /* (LE DEMI-TOUR) l'orbite : la caméra tourne d'un bloc autour de la caisse, puis se recale */
         {const r9=loop._viseR==null?1:loop._viseR;off.lerp(cibleOff,Math.min(1,dt*(CAM_ROUTE.vif?16:7*(.3+.7*r9*r9))));if(DMT.cam){const l9=cibleOff.length()*.9;if(off.lengthSq()<l9*l9)off.setLength(l9);}} /* (LE DEMI-TOUR) en orbite, la caméra ne coupe pas au plus court à travers la caisse */ /* (2026-10-01, LA POSE) la PLACE de la caméra reprend en douceur, comme sa visée (`_viseR`) : à ×7/s elle faisait 11 % du chemin entre la caméra de vol et celle de route dès la 1re image */ // (vague 3) pendant le tonneau, la caméra colle à son orbite (sinon elle coupe au travers de la dalle)
         camera.position.copy(carGroup.position).add(off);}
        (loop._carPrev||(loop._carPrev=new THREE.Vector3())).copy(carGroup.position);
        camUp.lerp(F.n,Math.min(1,dt*4)).normalize();
        qTmp2.setFromAxisAngle(fwdW,-camLean); // inclinaison caméra très légère dans les virages
        camera.up.copy(camUp).applyQuaternion(qTmp2); // ⚠ (conduite v6) BUG : la penche était ré-appliquée à camUp À CHAQUE IMAGE — elle s'additionnait (×15 à 60 i/s, ×30 à 120 Hz) : l'horizon penchait de 22 à 68° à chaque coup de pouce
        // PORTRAIT : on vise plus BAS (F.n 1,05 → 0,50) — la caméra pique du nez, donc la caisse
        // REMONTE dans le cadre au lieu de sortir par le bas. Reculer/monter/viser bas se règlent
        // ENSEMBLE : sans cette ligne, camBack et camH seuls laissaient une caisse minuscule en bas.
        tmp2.copy(carGroup.position).addScaledVector(dmtCamDir(fwdW,F.n),8.5+POR*1.2).addScaledVector(F.n,1.05-POR*.55-(H9?CAM_HEROS.vise*POR:0)).addScaledVector(F.b,cLag9*.5); /* (CAM_HEROS) debout, la visée descend : la caisse remonte */ // la visée prend une partie du retard : la caisse sort un peu du centre de l'image
        /* (route v2) LE REGARD SUIT LA ROUTE : la visée se tire à 35 % vers un point de la piste 35 m DEVANT (à la même
           distance du bord que la caisse). Dans une courbe, l'œil part vers la sortie du virage au lieu de fixer l'axe de
           la caisse — on voit où l'on va. */
        {const CR=CAM_REGARD,dR=CR.on?THREE.MathUtils.clamp(Math.abs(vA)*SPD*vitMult()*CR.k,Math.max(5,CR.min),CR.max):35, /* (2026-09-30) CAM_REGARD : le regard porte à k s d'avance réelle (voir CAM_REGARD) */
              sA=THREE.MathUtils.clamp(s+driveDir*dR,0,L-1);frameAt(sA,FVISEE);
         tmp3.copy(FVISEE.p).addScaledVector(FVISEE.b,lat*(side<0?-1:1)).addScaledVector(FVISEE.n,(side<0?-1:1)*1.2); // (conduite v4) le regard file sur TA ligne (×1) — à ×0,6 il tirait l'œil vers l'axe : un « aimant » visuel
         // ⚠ (conduite v3) plus de seuil de distance qui ALLUMAIT/ÉTEIGNAIT le regard d'un coup (c'était une saccade) : la part
         // de visée route s'estompe en continu avec l'écart, et la visée elle-même est LISSÉE dans le temps
         const dd=Math.sqrt(tmp3.distanceToSquared(tmp2)), // fenêtre de fondu ∝ D : 40 → 100 m à 35 m (à D=35 et CAM_REGARD éteint : la formule d'avant, au bit près)
               kV=(CR.on?.35*(1+CR.por*POR)*(CR.comp?CR.min/dR:1):.35)*THREE.MathUtils.clamp(1-(dd-dR*8/7)/(dR*12/7),0,1);
         CR.D=dR;CR.kV=kV;
         tmp2.lerp(tmp3,DMT.cam?kV*Math.max(0,Math.cos(DMT.cam)):kV); // (LE DEMI-TOUR) tournée vers l'arrière, la caméra ne cherche pas la route devant
         tmp2.sub(carGroup.position); // (conduite v6) lissée RELATIVEMENT à la caisse : lissée en position monde, elle traînait de v/9 — à 700 km/h on regardait le capot
         /* (2026-10-01, LA POSE) LA VISÉE REPREND EN DOUCEUR : en vol la caméra vise la caisse, au sol ~10 m devant — à la pose, la visée y repartait
            à plein régime (×9/s : 15 % du chemin dès la 1re image, la caisse glissait de 0,05 à 0,18 NDC en une image — MESURÉ au banc des poses,
            contre 0,005 à 0,04 pour un pas de vol). Elle part désormais lentement (×2,2/s) et retrouve son régime en 0,6 s (`_viseR`, remis à 0 en vol). */
         loop._viseR=Math.min(1,(loop._viseR==null?1:loop._viseR)+dt/.6);
         if(DMT.dc&&loop._vise)loop._vise.applyAxisAngle(F.n,DMT.dc); // (LE DEMI-TOUR) la visée tourne avec l'orbite
         if(!loop._vise||n9Saut(loop))loop._vise=tmp2.clone();else loop._vise.lerp(tmp2,Math.min(1,dt*(2.2+6.8*loop._viseR*loop._viseR)));
         tmp2.copy(loop._vise).add(carGroup.position);}
        /* (vague 3) LE CABRAGE ANTICIPÉ : tout le plan (place, visée, haut) pivote autour de la caisse d'une part du cabrage de la route
           à venir — la caisse reste à sa place à l'écran, c'est la route devant qui redevient lisible (voir CAM_ROUTE) */
        if(FR.lift>0){FR.cv.copy(F.n).multiplyScalar(-FR.lift*FR_K.cam);camera.position.add(FR.cv);tmp2.add(FR.cv);} // (2026-10-17, LA FIGURE SUR LA ROUTE) la caméra ne suit que 20 % du bond : on voit la caisse quitter le bitume
        camRouteCabrage(dt,camBack,camH);
        {const q9=CAM_ROUTE.q,c9=carGroup.position;camera.position.sub(c9).applyQuaternion(q9).add(c9);tmp2.sub(c9).applyQuaternion(q9).add(c9);camera.up.applyQuaternion(q9);}
        camera.lookAt(tmp2);
        fovPunch=Math.max(0,fovPunch-dt*18);
        const r9=speedKmh/Math.max(1,vCroisiere()), // (2026-09-25) le champ s'ouvre sur la CROISIÈRE réelle : il continue de réagir au momentum, au pad, au FLOW au lieu d'être collé au plafond
              fb9=H9?(()=>{const H=CAM_HEROS;if(H.v0<0||Math.abs(speedKmh-H.v0)>400)H.v0=speedKmh; /* (CAM_HEROS) « ça pousse » = la PRISE DE VITESSE : l'écart entre la vitesse et sa moyenne lente (≈1,2 s) — un pad, la nitro, une relance ouvrent le champ ; une vitesse stable ou une pente qui accélère doucement le laissent se refermer (la piste descend presque toujours : une accélération brute le tenait ouvert en permanence, mesuré) */
                H.v0+=(speedKmh-H.v0)*(1-Math.exp(-dt/H.tau));const a9=speedKmh-H.v0;
                H.acc+=(THREE.MathUtils.clamp(a9/H.accK,0,1)-H.acc)*(1-Math.exp(-dt*(a9>H.acc*H.accK?8:2)));
                return 72+FLOW.lv*1.1+Math.min(16,r9*10+Math.max(0,r9-1)*4)+(boost>0?4:0)+(nitroOn?(nitroBlue?10:7):0)+H.kick*H.acc*FOVP_K;})() /* (« Réduire les animations » : le coup à 30 %, comme fovPunch) */
               :FLOW.lv*2.2+72+Math.min(38,r9*28+Math.max(0,r9-1)*10)+(boost>0?8:0)+(nitroOn?(nitroBlue?22:15):0); // le tunnel s'ouvre : part RELATIVE + part absolue + GROS coup de FOV au boost (Sacha)
        CAM_HEROS.fb=fb9;CAM_HEROS.pu=fovPunch; // (banc) lus par dbgCamRoute
        let fovT=Math.min(160,fovPor(fovPunch*FOVP_K+fb9)); // (portrait : élargi par la tangente, voir fovPor)
        if(ct9){const f09=Math.min(160,fovPor(fb9));fovT=camTailleFov(f09)+(fovT-f09);}
        else if(H9){const H=CAM_HEROS,K=H.fovMaxL-H.genouL,f09=Math.min(160,fovPor(fb9));fovT=(f09<=K?f09:K+H.genouL*(1-Math.exp(-(f09-K)/H.genouL)))+(fovT-f09);} /* (CAM_HEROS) COUCHÉ aussi, le champ tenu passe par un genou (112°) — les coups passent par-dessus */ // (2026-09-30) CAM_TAILLE : le champ tenu passe par le genou, le COUP (fovPunch) passe par-dessus, intact
        {const n9=performance.now();if(loop._fovB==null||n9-(loop._fovBT||0)>(window.dbgCamReprise||CAM_REPRISE))loop._fovB=camera.fov;loop._fovBT=n9;} // le champ « de base » repart du vrai champ à chaque reprise de conduite
        loop._fovB+=(fovT-loop._fovB)*Math.min(1,dt*(NFX.off>0&&fovT<loop._fovB?2.4:6));
        CAMV.zoom=Math.max(0,CAMV.zoom-dt*2);CAMV.zp=24*CAMV.zoom*CAMV.zoom*FOVP_K; // (2026-09-28) le COUP DE ZOOM d'une pose PARFAITE : sec à l'impact (−24°), relâché en 0,5 s — (2026-09-30) à 30 % sous « Réduire les animations », comme fovPunch
        camera.fov=Math.max(20,loop._fovB-CAMV.zp); // (vague 3) à l'extinction de la nitro le champ RETOMBE en douceur (il s'ouvre toujours sec)
        camera.updateProjectionMatrix();CAM_HEROS.leveApplique(dt,1); // (CAM_HEROS) l'image monte : la caisse au-dessus des commandes
        /* (2026-09-28, chasse aux détails) LES SECOUSSES SONT DES COUPS, PLUS DE LA NEIGE : un tirage au hasard à CHAQUE image (±0,7 m à la
           réception) grésillait à 60 i/s et sautait franchement à 30 — la caméra de mort, elle, tremblait déjà en sinus lisses. Trois sinus
           désaccordés (un choc qui cogne vers le bas, puis roule) + un soupçon de roulis ; même enveloppe qu'avant (décroît de 3,5/s). */
        if(shake>0){
          if(!REDUCED_MOTION&&!window.dbgNoShake){const a9=Math.min(1.4,shake)*.3;
            camera.position.addScaledVector(F.n,a9*(Math.sin(t*31)-.6*Math.abs(Math.sin(t*17)))).addScaledVector(tmp,a9*.7*Math.sin(t*23+1.3));
            camera.rotateZ(a9*.03*Math.sin(t*27+.7));}
          shake=Math.max(0,shake-3.5*dt);
        }
        veqCamera(dt); // (2026-10-14) la caméra s'enfonce sous le choc de la pose
        // VIBRATION DE VITESSE — RELATIVE à la caisse : ça frémit dès ~45 % de TA vmax (une LA HONTE
        // à fond doit trembler autant qu'une COMÈTE à fond), puis le PLANÉ SUPERSONIQUE calme tout :
        // passé ~350 km/h affichés, l'air ne lutte plus, la caisse fend — les vibrations fondent à 30 %.
        const vmx9=vmaxShow(),
              spdN=THREE.MathUtils.clamp((speedKmh-vmx9*1.55*.35)/(vmx9*1.55*.9),0,1), // (2026-09-25) sur la CROISIÈRE (1,55×vmaxShow) : ≈.10 en croisière, et de la marge pour le momentum, le FLOW, la nitro
              calm9=1-.7*THREE.MathUtils.smoothstep(speedKmh,700,1800), // fenêtre DOUBLÉE (SPD .25→.5 : les km/h affichés ont doublé) — le plané supersonique calme au même état-caisse qu'avant, pas dès le mid-game
              spdSh=spdN*spdN*CAM_SHAKE_V*.42*calm9*(nitroOn?1.3:1); // FRISSON, pas séisme : à vmax de croisière ≈ .10 d'amplitude (la sensation vient du FOV + speed lines, le tremblement signale juste la LIMITE)
        if(spdSh>0&&!window.dbgNoShake){
          camera.position.addScaledVector(F.n,spdSh*.36*(Math.sin(t*41)+.5*Math.sin(t*67+2.1))); // (2026-09-28) un GRONDEMENT de sinus, plus un grésillement au hasard
          camera.position.addScaledVector(tmp,spdSh*.42*(Math.sin(t*37+.9)+.5*Math.sin(t*59)));
          camera.position.addScaledVector(fwdW,spdSh*.18*Math.sin(t*29+1.7));
          camera.rotateZ(spdSh*.016*Math.sin(t*33+.4)+Math.sin(t*27)*spdSh*.014);
        }
        // (vague 3) NITRO — LA CAISSE ARRACHE : la caméra DÉCROCHE (0 → pic à ~0,2 s → 0, elle recule et monte un peu) pendant que le
        // champ s'ouvre, puis revient ; tant qu'on tient, un frisson continu (deux sinus : un grondement, pas un grésillement)
        if(!REDUCED_MOTION&&!window.dbgNoShake){
          if(NFX.ign>0){const e9=NFX.ign*NFX.ign*(1-NFX.ign)*6.75*NFX.ignK,j9=Math.max(0,NFX.ign-.85)*.9*NFX.ignK; // + l'À-COUP des trois premières images (tirage PROPRE : `shake` puise dans le Math.random du jeu, et la physique aussi)
            camera.position.addScaledVector(fwdW,-1.05*e9).addScaledVector(F.n,.25*e9+(nfxR()-.5)*j9).addScaledVector(tmp,(nfxR()-.5)*j9);}
          if(nitroOn){const a9=nitroBlue?.05:.036;camera.position.addScaledVector(F.n,Math.sin(t*38.7)*a9).addScaledVector(tmp,Math.sin(t*29.3+1.7)*a9*.7);}
        }
        // indicateur de virage RETIRÉ du HUD épuré (#turnHint est display:none) : on n'évalue plus la courbe à l'avance (frameAt+trig) chaque frame pour rien
        if(airPie.style.display!=='none')airPie.style.display='none'; // (2026-09-27) une fois suffit (c'était à chaque image de conduite)
      }
    }else if(mode==='fall'){ // ---- VOL : maniabilité aérienne propre ----
      const dtF=dt*AIR_RATE; // temps de vol accéléré : même arc dans l'espace, moins de temps réel à flotter
      fallT+=dtF;fallTR+=dt; // fallT = temps-sim (figures/paiements) ; fallTR = temps RÉEL (jauge des 6 s — sinon le chrono file à ×1,6)
      NIT.vol+=dtF;if(nitroOn&&pwrNitroT<=0&&!PARK.on)NIT.nit+=dtF; /* (LA LOI DU RÉSERVOIR) la durée du vol et ce qu'on y a BRÛLÉ : la pose ne rend que la part volée nitro coupée */
      if(!nitroOn)loop._nAir=false; // (2026-09-26) l'impulsion se RÉARME au relâché
      if(bascOn){bascT+=dtF;if(bascT>1.1)bascOn=false;} /* (1/10, soir) la bascule dure UNE seconde au plus, puis c'est un vol comme un autre (ni portée, ni lèvre, ni gravité retenue) */
      const gB9=bascOn?Math.min(1,bascT/BASC_T):1; // (bord, 1/10) LA BASCULE : la caisse pivote sur la lèvre avant de tomber — la gravité s'installe en BASC_T
      volrSuit(dtF); // (LE VOL QUI SUIT LA ROUTE) le haut du vol suit la dalle survolée (route sans haut ni bas seulement)
      {const i9=tryLand._bi;if(TBORD.t>0&&(!TORD.on||Math.abs(curLatOff)>ROAD_HALF+20||Math.abs(curHOff)>20))TBORD.t=0; // (LE BORD DE LA ROUTE TORDUE) loin du bord : la gravité du monde reprend
       TBORD.on=TBORD.t>0&&i9>=0&&!!Nn[i9]; // le bas de LA ROUTE, pas celui du monde
       if(TBORD.on){TBORD.u.copy(Nn[i9]).multiplyScalar(fallStartSide).normalize();TBORD.t-=dtF;fallVel.addScaledVector(TBORD.u,-FALL_G*gK()*gB9*dtF);}else volMonte(fallVel,-FALL_G*gK()*gB9*dtF);} /* (LE VOL QUI SUIT LA ROUTE) sur la route sans haut ni bas, la gravité est celle de la dalle survolée (VOLR) ; ailleurs, celle du monde */ // gK : gravité LUNAIRE en orbite (÷2)
      // (vol libre, 2026-09-26) l'ANTI-BLOCAGE DU LACET a sauté : il rendait « un minimum d'horizontale » parce que le volant tournait
      // autour de l'axe VERTICAL du monde (mort en trajectoire verticale). Le volant tourne désormais autour du HAUT DE LA CAISSE
      // (FLY_U) : il mord à toutes les assiettes, piqué à pic compris, et il ne redresse plus rien.
      // chute pilotée : un peu de lacet, c'est tout — la voiture est LOURDE
      // (le lacet gagne un peu d'autorité à grande vitesse → vol simplifié)
      // chute pilotée : un peu de lacet, c'est tout — la voiture est LOURDE
      // (le lacet gagne un peu d'autorité à grande vitesse → vol simplifié)
      if(VEQ.lArm)VEQ.lT+=dt; // (vol équilibré) l'horloge du verrou du volant
      const yawIn=veqVolant()*lacetVol(fallVel.length())*dtF; // (2026-10-14) le braquage tenu depuis la route ne continue plus le virage en l'air (veqVolant)
      banqLacet(fallVel,yawIn); // (vol libre) autour du haut de la CAISSE — à gauche à l'écran, c'est à gauche, même sur le dos — (2026-10-19) au GLACIER, le CAP seulement (banqLacet)
      yawAcc+=yawIn;
      /* (2026-10-17, LE RÉACTEUR QUI S'INSTALLE) lâcher le nitro en vol (ou la jauge qui se vide) faisait passer EN UNE IMAGE la gravité de 40 %
         à 100 % et l'autorité du manche de 1,7 à 0,85 rad/s — la caisse « tombait comme une pierre » et le cabré cassait net. Le plané et
         l'autorité suivent désormais `nk9`, l'état du réacteur lissé en ~80 ms (τ 1/12 s), dans les deux sens ; le COUP d'allumage (+46 m/s)
         reste sec, c'est lui qui répond au doigt. Le décollage nitro tenu part réacteur plein (startFall pose `_nk`). */
      const nk9=loop._nk=(loop._nk||0)+((nitroOn?1:0)-(loop._nk||0))*(1-Math.exp(-dtF*12));
      if(nk9>.002){if(TBORD.on)fallVel.addScaledVector(TBORD.u,FALL_G*gK()*(nitroBlue?.75:.6)*gB9*dtF*nk9);else volMonte(fallVel,FALL_G*gK()*(nitroBlue?.75:.6)*gB9*dtF*nk9);} // (LE BORD DE LA ROUTE TORDUE : il plane contre la gravité de la route) (bord, 1/10 : au prorata de la bascule — jamais de remontée) (vol v7) le RÉACTEUR fait PLANER : il reprend 60 % de la gravité (75 % en réserve bleue)
      if(nitroOn){ // RÉACTEUR : il fait planer et donne l'assiette (piqué/cabré) — il n'accélère plus (vol v7 : inertie)
        /* (2026-09-26, user : « le boost nitro aérien doit VRAIMENT donner une impulsion, indépendamment de la vitesse de départ, qui s'y
           additionne, comme un propulseur ») : à l'ALLUMAGE en vol, un coup de réacteur de +32 m/s (× le palier moteur) dans l'axe du
           vol, quelle que soit la vitesse d'éjection. Un par allumage (0,5 s mini entre deux), et il coûte 12 % de réserve. */
        if(!loop._nAir&&nitroOn&&(performance.now()-(loop._nAirT||0))>500){loop._nAirT=performance.now();loop._nAir=true;
          const sp8=fallVel.length(),a8=46*(ENGINE_TIERS[engTier]?ENGINE_TIERS[engTier].push:1); // (2026-09-26, user : « dans l'air le nitro doit accélérer plus ») 32 → 46 m/s
          if(sp8>1)fallVel.multiplyScalar((sp8+a8)/sp8);else fallVel.addScaledVector(FLY_U,a8);
          FLC.t=performance.now();FLC.k=sp8>1?sp8/(sp8+a8):1;FLC.n=nitroR;FLC.ok=true; // (2026-10-14) noté : si c'est le 1er appui d'un DOUBLE-TAP, la figure le rend (figLance)
          fallVH0=Math.max(fallVH0,volH(fallVel));if(pwrNitroT<=0){const av9=nitroR;nitroR=Math.max(0,nitroR-NITRO2.coup*nitroCap()*(FLOW.lv===4?FLOW2.fren.nitro:1));if(LIVRE.on)livre('n-:coup',av9-nitroR);}
          FLC.c=Math.max(0,FLC.n-nitroR);fovPunch=Math.max(fovPunch,12);shake=Math.max(shake,.35);} // (vague 3) le reste du coup — onde, bords, WHOOMP, vibreur — vient de `nitroAllume`, qui part à la même image (il le doublait)
        { // (2026-09-26, user : « le nitro en l'air ne sert pas qu'à guider, il faut que ça ACCÉLÈRE vraiment ») : la MÊME poussée qu'au sol
          // (30 · 48 en réserve bleue × le palier moteur), dans l'axe du vol — et l'élan gagné au réacteur est GARDÉ (le plafond d'inertie suit)
          // (2026-09-26, user : « dans l'air le nitro doit accélérer plus ») : DEUX FOIS la poussée du sol (60 · 96 en réserve bleue) — rien ne
          // freine en l'air, mais un vol dure 2 à 4 s : à la poussée du sol, on ne sentait presque rien avant de se reposer
          const sp9=fallVel.length();if(sp9>1){const a9=(nitroBlue?96:60)*(ENGINE_TIERS[engTier]?ENGINE_TIERS[engTier].push:1)*dtF;
            fallVel.multiplyScalar((sp9+a9)/sp9);fallVH0=Math.max(fallVH0,volH(fallVel));}}
        // ↑/AVANT : PIQUÉ · ↓/FREIN : CABRÉ. On fait TOURNER la vitesse en tangage (pitch) au lieu
        // d'ajouter à .y : ajouter ±12 à un vecteur de 145 puis reclamper ne pliait la trajectoire que
        // de ~4°/s (« le nitro haut/bas ne marche plus » — surtout au plafond de vitesse du parc). La
        // ROTATION donne une autorité FORTE et INDÉPENDANTE de la vitesse (on plie autant à 260 qu'à 80).
        // BORNÉE à ±65° d'assiette → jamais vertical → pas de gimbal-lock, pas de vrille coincée.
        // VOLANT TACTILE : l'assiette devient ANALOGIQUE (2026-10-10, Léo : pouce vers le HAUT = MONTE (cabré), vers le BAS =
        // plonge, par défaut ; le réglage PLONGE rend le manche d'avion) — même levier, dosé. Zone morte large : tourner ne doit jamais cabrer par accident.
        const pitT=TCTL.act?TCTL.sv*volSens():0; // (2026-09-29) réglage « POUCE HAUT EN VOL : PLONGE / MONTE »
        const wPitch=pitT!==0?(Math.abs(pitT)<.05?0:-pitT):((keys.KeyW||keys.KeyZ||keys.ArrowUp)?-1:0)+(dn?1:0); // -1 = piqué, +1 = cabré
        // (vol libre, 2026-09-26) plus de plafond à ±65° ni de repli « à l'horizontale » : le manche fait tourner la trajectoire ET le
        // haut de la caisse autour de SA droite (FLY_R) — piqué, cabré, looping : aucune assiette n'est interdite, rien ne se bloque
        // (des vecteurs qui tournent autour d'un axe local : pas d'angle d'Euler, donc pas de gimbal-lock).
        pitchS+=(wPitch-pitchS)*(1-Math.exp(-dtF*(pitT!==0?VOL_LIS_D:VOL_LIS))); /* (2026-10-14, sensations) τ 30 ms quand c'est le pouce qui donne l'assiette · (2026-10-09) LE MANCHE LISSÉ COMME LE VOLANT (τ 47 ms) : le lacet passait par le lissage de steer, le tangage attaquait brut — 97°/s d'un coup au clavier, dosage aux petits coups. Plafonds inchangés (1,7 / 0,85 rad/s) */
        if(Math.abs(pitchS)>1e-4){const a9=-pitchS*(.85+.85*nk9)*dtF;fallVel.applyAxisAngle(FLY_R,a9);FLY_U.applyAxisAngle(FLY_R,a9);} // (2026-10-17) 1,7 rad/s réacteur plein (nk9 : voir LE RÉACTEUR QUI S'INSTALLE)
        // jet visible au point de poussée arrière : panache conique, jamais deux fois pareil
        flames.mesh.material.color.set(nitroBlue?0x5b7dff:pwrNitroT>0?NINF.jet:0xff7a24);    // (vague 3) le RÉACTEUR aux couleurs de la bible : feu #ff7a24, réserve #5b7dff
        flameCore.mesh.material.color.set(nitroBlue?0xd6e2ff:pwrNitroT>0?NINF.core:0xffe4bc); // cœur blanc chaud / blanc bleuté
        embers.mesh.material.color.set(nitroBlue?0x8ea4ff:pwrNitroT>0?0xc79bff:0xffa24a);
        tmp3.set(0,0,1).applyQuaternion(carGroup.quaternion);
        potAuHasard(tmp2); // (2026-09-26) en vol aussi, le feu sort des POTS (avant : 2,4 m derrière le centre, au milieu)
        if(Math.random()<.7)spawnP(embers,
          tmp2.x-tmp3.x*.1,tmp2.y-tmp3.y*.1,tmp2.z-tmp3.z*.1,
          -tmp3.x*(8+Math.random()*10)+(Math.random()-.5)*5,-tmp3.y*8+2+Math.random()*3,-tmp3.z*(8+Math.random()*10)+(Math.random()-.5)*5,
          .4+Math.random()*.45);
        for(let r9=0,rp9=emiN('jet',dt);r9<rp9;r9++)for(let j9=0;j9<5;j9++){ // (2026-10-09) à la seconde : voir emiN
          potMonde(CAR_POTS[j9%CAR_POTS.length],tmp2);
          tmp2.x+=(Math.random()-.5)*.14;tmp2.y+=(Math.random()-.5)*.14;tmp2.z+=(Math.random()-.5)*.14;if(r9)tmp2.addScaledVector(fallVel,-SPD*dtF*r9/rp9);
          const pw=21+Math.random()*9,spr=1.7; // vol : le jet reste un CRAYON de feu, pas une gerbe
          spawnP(flames,tmp2.x,tmp2.y,tmp2.z,
            -tmp3.x*pw+(Math.random()-.5)*spr,-tmp3.y*pw+(Math.random()-.5)*spr,-tmp3.z*pw+(Math.random()-.5)*spr,
            .07+Math.random()*.10);
          if(j9<3)spawnP(flameCore,tmp2.x,tmp2.y,tmp2.z,
            -tmp3.x*(pw+7)+(Math.random()-.5)*.9,-tmp3.y*(pw+7)+(Math.random()-.5)*.9,-tmp3.z*(pw+7)+(Math.random()-.5)*.9,
            .05+Math.random()*.07);
        }
        if(Math.random()<.5)spawnP(embers, // (vague 3) les braises du réacteur (elles étaient CYAN néon, même en nitro orange : deux signaux contradictoires)
          carGroup.position.x-tmp3.x*2.5,carGroup.position.y-tmp3.y*2.5,carGroup.position.z-tmp3.z*2.5,
          -tmp3.x*20+(Math.random()-.5)*6,-tmp3.y*20+(Math.random()-.5)*6,-tmp3.z*20+(Math.random()-.5)*6,.3);
      } else { // VOL SANS BOOST : léger pilotage haut/bas — assez pour infléchir la trajectoire, bien moins qu'au réacteur
        // (2026-09-27, user : « quand j'essaye de redresser dans les airs sans le nitro ça fait rien ») : cette branche ne lisait que le
        // CLAVIER — sur téléphone le pouce (axe Y du volant) était ignoré sans nitro. Même lecture qu'au réacteur : analogique, zone morte.
        const pitT=TCTL.act?TCTL.sv*volSens():0;
        const wPitch=pitT!==0?(Math.abs(pitT)<.05?0:-pitT):((keys.KeyW||keys.KeyZ||keys.ArrowUp)?-1:0)+(dn?1:0); // ↑ piqué · ↓ cabré
        pitchS+=(wPitch-pitchS)*(1-Math.exp(-dtF*(pitT!==0?VOL_LIS_D:VOL_LIS))); // (2026-10-14) τ 30 ms au pouce · (2026-10-09) le même manche lissé (voir le réacteur)
        if(Math.abs(pitchS)>1e-4){const a9=-pitchS*(.85+.85*nk9)*dtF;fallVel.applyAxisAngle(FLY_R,a9);FLY_U.applyAxisAngle(FLY_R,a9);} // (vol libre) même manche, sans plafond — 0,85 rad/s : on infléchit, on ne pilote pas — (2026-10-17) l'autorité du réacteur s'éteint en ~80 ms (nk9)
      }
      /* (vol v7, 2026-09-25, user : « l'airtime doit être basé sur un principe d'INERTIE, dépendre de la vitesse de la voiture au
         moment de l'éjection, et PAS de sa vitesse max ») : en l'air, la caisse garde la vitesse qu'elle avait en quittant la route —
         seule la GRAVITÉ agit (elle accélère en chute, freine en montée). Le volant et le piqué/cabré TOURNENT la vitesse sans
         l'augmenter, et la nitro ne pousse plus en avant (elle fait PLANER : voir plus haut). Garde-fou : l'avance HORIZONTALE ne
         dépasse jamais celle de l'éjection (un cabré qui convertirait la chute en élan ne crée pas de vitesse). Aucune lecture de
         maxSp : la portée d'un saut ne dépend que de la vitesse d'éjection. */
      {const hx9=volH(fallVel);if(fallVH0<0)fallVH0=Math.max(hx9,fallVel.length()); // (vol libre) plafond = la vitesse d'ÉJECTION entière : sortir d'un piqué à l'horizontale reste possible (le manche n'a plus de butée), jamais plus vite qu'au décollage
       if(hx9>fallVH0&&hx9>1){const f9=fallVH0/hx9;volHK(fallVel,f9);}} /* (LE VOL QUI SUIT LA ROUTE) « à plat » = perpendiculaire au haut du vol */
      try{jadeEauVol(dt,dtF);}catch(e){loopWarn(8192,'eau',e);} // (2026-10-13) LA MER COMME LE CIEL (voir EAU)
      try{banqSolVol(dt,dtF);}catch(e){loopWarn(262144,'banquise',e);} // (2026-10-14) LA BANQUISE : la poudreuse qui porte et qui avale, la glace où l'on glisse (voir banqSolVol)
      if(PARK.on&&fallVel.lengthSq()>PARK_VCAP*PARK_VCAP)fallVel.setLength(PARK_VCAP); // PARC : la nitro infinie ne t'emballe pas non plus EN L'AIR — vol rapide mais pilotable
      fallPos.addScaledVector(fallVel,dtF*SPD);
      carGroup.position.copy(fallPos);
      speedKmh=volH(fallVel)*3.6*SPD; // (vol v6) la vitesse d'AVANCE, comme sur la route — la chute verticale ne gonfle plus les filés ni le compteur
      pickupsTick(dt); // (2026-09-30) LE RAMASSAGE EN VOL — la caisse est posée à sa place de l'image ; AVANT les figures, qui remettent le radar de dalle (`curNear`) à zéro
      // ---- FIGURES EN VOL : chaque exploit se nomme à la seconde où il naît ----
      {
        const halfs=Math.floor(Math.abs(yawAcc)/Math.PI); // vrilles : un cri par demi-tour de lacet
        if(halfs>spinHalf&&fallT>.45){spinHalf=halfs;
          addTrick('vrille',halfs===1?'180°':halfs===2?'VRILLE 360 — LAVE-LINGE !':halfs===3?'540° !!':(halfs*180)+'° — '+TR('ESSOREUSE COSMIQUE !!'),3.5*halfs,halfs>=4?3:(halfs>=2?2:false),true);}
        if(!trkBigA&&fallTR>1.8){trkBigA=true;chaineAura('BIG AIR',50,'bigair',false,SONV2);if(SONV2)sfx('fig.bigair',{st:echSt()});flowAdd(6,'risque');}          // (aura v2) le temps passé EN L'AIR se paie
        if(!trkMonstre&&fallTR>3.4){trkMonstre=true;chaineAura('AIR MONSTRE',110,'monstre',false,SONV2);if(SONV2)sfx('fig.monstre',{st:echSt()});flowAdd(10,'risque');}
        if(curNear){ // radar de dalle (rempli par tryLand à la frame précédente)
          curNear=false;
        }
      }
      // ---- LA MALLETTE : RETIRÉE (2026-09-29, passe qualité) — les figures ne paient plus qu'en AURA (66ab228) : le montant « 💰 $ » (PC),
      // le tremblement et le BATTEMENT DE CŒUR (téléphone compris, `mallette.chaude`) annonçaient de l'argent qui n'existe plus. `heartBeat` reste défini.
      if(speedKmh>120){ // traits d'air aussi en vol (seuils ×2 : SPD .25→.5)
        tmp.copy(fallVel).normalize();
        const nS9=speedKmh>480?3:speedKmh>260?2:1;
        for(let k9=0,n9=nS9*emiN('trV',dt);k9<n9;k9++){ // (2026-10-09) à la seconde : voir emiN
          tmp2.copy(fallPos).addScaledVector(tmp,10+Math.random()*30);
          tmp2.x+=(Math.random()-.5)*22;tmp2.y+=(Math.random()-.5)*16;tmp2.z+=(Math.random()-.5)*22;
          const ln9=4+speedKmh*.035;
          spawnStreak(tmp2.x,tmp2.y,tmp2.z,tmp.x*ln9,tmp.y*ln9,tmp.z*ln9);
        }
      }
      if(nitroOn&&!REDUCED_MOTION&&fallVel.lengthSq()>1){NFX.d.copy(fallVel).normalize();nfxVent(dt,NFX.d,fallVel.length()*3.6*SPD);} // (vague 3) les stries de vent en vol : dans l'axe de la VITESSE, pas du nez qui vrille
      // orientation stable : le nez suit la trajectoire, PAS de vrille surprise
      carGroup.scale.set(1,1,1);
      tmp.copy(fallVel).normalize();
      if(JEAU.dans||JEAU.wB>.01)jadeEauNez(tmp,dt); // (2026-10-13) DANS L'EAU : le nez garde le cap, la caisse se redresse et suit la houle
      // (vol libre) le HAUT est transporté avec la trajectoire (on lui retire sa part le long de la vitesse) : aucun (0,1,0) du monde,
      // donc plus de repère qui dégénère en piqué à pic ni de caisse qui se remet d'elle-même à l'endroit
      FLY_U.addScaledVector(tmp,-FLY_U.dot(tmp));
      if(FLY_U.lengthSq()<1e-4)FLY_U.crossVectors(tmp,FLY_R); // (garde : trajectoire retournée d'un coup — on repart de la droite)
      FLY_U.normalize();
      if(VEQ.on)veqNiveau(dt,tmp); // (2026-10-14) L'ÉQUILIBRE : le haut du vol revient à la verticale
      FLY_R.crossVectors(FLY_U,tmp).normalize();
      tmp3.copy(FLY_R);tmp2.copy(FLY_U);
      mat4.makeBasis(tmp3,tmp2,tmp);
      qTmp.setFromRotationMatrix(mat4);
      /* ⚠ LA VRILLE EST VOULUE — NE PAS LA « CORRIGER » (tranché par le user, 2026-08-05).
         La caisse tourne sur elle-même en vol, en permanence. J'ai cru à une incohérence (des ailes
         déployées sur un engin qui fait le poulet rôti) et je l'ai remplacée par une inclinaison de
         virage : le user a essayé les deux et TRANCHÉ pour la vrille, deux fois. C'est un parti pris
         ARCADE, pas un oubli — la lisibilité aéronautique n'est pas le sujet de ce jeu.
         ⚠ à ne pas confondre avec la FIGURE « vrille » qui paye : celle-là se compte en demi-tours
         de LACET (`yawAcc`) et n'a rien à voir avec cette rotation visuelle. */
      // (bord v2) après une sortie par le BORD la vrille tourne du côté du vide (`bascDir`) et DÉMARRE comme une vraie bascule : le pivot sur
      // la lèvre l'accélère de 25 % à 100 % en ~0,4 s. Hors bord : bascDir = 1, facteur 1 → la formule de toujours, au chiffre près.
      if(VEQ.on)veqCorps(dt); // (2026-10-14) LA BALANCE : plus de vrille, la caisse pivote, s'incline et se balance sur ses ressorts (voir LE VOL ÉQUILIBRÉ)
      else{
      {const r9=(bascDir*(3.0+Math.min(2,fallT*.5))*(bascOn?Math.min(1,.25+bascT*1.9):1)+steer*2.2)*dtF;airRoll+=r9*(1-JEAU.wB); // VRILLE : la caisse tourne sur elle-même (suit le vol accéléré) — (2026-10-13) l'eau l'arrête et la remet à l'endroit
       if(JEAU.wB>.01){const r0=Math.round(airRoll/6.2832)*6.2832;airRoll+=(r0-airRoll)*Math.min(1,dt*3.5*JEAU.wB);}}
      qTmp2.setFromAxisAngle(tmp,airRoll);
      qTmp.premultiply(qTmp2);
      carGroup.quaternion.slerp(qTmp,Math.min(1,dt*8));
      }
      figPose(dt); // LES FIGURES, par-dessus l'assiette — (2026-10-14) v2 : la PHYSIQUE (explosions, inertie, planté)
      if(BANQ.glisse)try{banqAssiette(dt);}catch(e){} // (2026-10-14) LA BANQUISE : sur la glace, la caisse est posée sur la facette et DÉRIVE (voir banqAssiette)
      if(SENS&&(JEAU.dans||SEAU.pose))try{sensEau(dt);}catch(e){} // (2026-10-14, sensations) L'EAU SE SENT : le bouchon, le bouillon, le creux du plongeon (voir SEAU)
      shadow.position.y=-99999;
      /* ===== LA CAMÉRA DE VOL — RETOUR À LA CAMÉRA DE POURSUITE (2026-09-28, soir, Sacha : « la caméra en air time déconne
         complètement, ça devient beaucoup trop dur de viser juste ») =====
         La v2 de l'après-midi (écart TENU à 7-9 m + plan de TROIS-QUARTS à 57° sur tout vol de plus de 1,3 s) a été filmée au banc sur
         un gros saut : dès la 1re seconde, la caméra part sur le flanc et passe SOUS la caisse — on la voit de dessous, en gros plan, la
         route n'est plus qu'un trait en biais, et gauche/droite ne correspondent plus à l'écran. Viser devient impossible. On revient à
         la caméra avec laquelle on visait : elle SUIT la trajectoire PAR DERRIÈRE — le lissage en position monde la fait traîner (15 à
         30 m sur un gros air) et c'est justement ce retard qui aligne le regard sur la direction du VOL : on voit où l'on va, l'anneau
         devant la caisse — et le champ se resserre avec l'ampleur du saut (76° → 54°) pour que la caisse reste lisible.
         ⚠ NE PAS remettre de plan de côté ni d'écart tenu court en vol : c'est ce qui a cassé la visée (verdict du 28/09 au soir).
         Gardés de l'après-midi : les secousses calmes (sinus, vent ×.42), la remise à zéro du coup de zoom PARFAIT au décollage, et les
         CHOCS en vol (bump, nuage, catapulte) — mais en petit déplacement de la caméra, plus en coup dans le REGARD (il décadrait la visée). */
      const bigAir=THREE.MathUtils.clamp((fallT-0.5)/2.2,0,1); // 0 au décollage → 1 sur un gros air
      /* (2026-10-17, LA CAMÉRA SANS SURSAUT) au sol la visée pivote du CABRAGE ANTICIPÉ (CAM_ROUTE.q, jusqu'à 24° au sommet d'une crête) ; la
         caméra de vol gardait le pivot de sa PLACE mais pas celui de sa VISÉE — le regard sautait de 4 à 14° à la 1re image de chaque saut
         depuis une bosse. La visée de conduite emporte son pivot, puis fond vers la caisse comme avant. */
      if(!(loop._camAirT>0)&&loop._vise)loop._vise.applyQuaternion(CAM_ROUTE.q);
      {const n9=performance.now();if(n9-(CAMV.t||0)>400){CAMV.zoom=0;CAMV.vtg=0;CAMV.p0ok=false;CAMV.s0=THREE.MathUtils.clamp(volTaille(camera.position.distanceTo(fallPos),camera.fov),.1,.4);}CAMV.t=n9;} // 1re image du vol : un coup de zoom PARFAIT en cours ne survit pas au décollage · la TAILLE de la caisse au sol, mesurée à l'instant du décollage
      tmp2.copy(fallPos).addScaledVector(tmp,-(9.0-bigAir*2.6)*(1-POR*.16)).addScaledVector(FLY_U,(3.5+bigAir*2.4)*(1+POR*.12)); // derrière la trajectoire, au-dessus de la caisse — « au-dessus » = vers le HAUT DE LA CAISSE (vol libre), pas vers le ciel
      /* (bord v2) LE SUIVI SANS À-COUP : l'ancien `camera.position.lerp(cible)` suivait une cible qui file — à la 1re image de vol la caméra
         passait d'un coup de « roule AVEC la caisse » (conduite : écart lissé) à « reste presque sur place » : la caisse s'échappait. On
         lisse l'ÉCART caisse→caméra, et la TRAÎNE que produisait l'ancien lerp (l'avance de la caisse, `fallVel·SPD·dtF`) s'installe en
         0,6 s — une fois installée, c'est l'ancien suivi au chiffre près (même cible, même raideur, même retard en régime établi). */
      {const oA=CAMV.oA||(CAMV.oA=new THREE.Vector3());loop._camAirT=(loop._camAirT||0)+dt;
       const c09=CAMV.p0ok&&CAMV.p0.distanceToSquared(camera.position)<100?CAMV.p0:camera.position; /* (2026-10-17) l'écart se lit sur la place d'AVANT les secousses (CAMV.p0) : relu après elles, chaque coup et le vent étaient réinjectés dans le suivi — ×1,5 à 2 à 60 i/s, ×3 à 120 Hz, et le « vent ×.42 » voulu n'existait plus */
       oA.subVectors(c09,fallPos).addScaledVector(fallVel,SPD*dtF*(1-Math.min(1,loop._camAirT/.6))) // l'écart de l'image d'avant, moins la part de traîne pas encore installée
         .lerp(tmp2.sub(fallPos),Math.min(1,dt*(3+bigAir*4.5)*(1+Math.abs(VEQ.on?VEQ.u:steer)*(lacetVolK(fallVel.length())-1)))); // suivi plus vif en gros air : la caméra ne décroche pas — (2026-10-18) et dans le VIRAGE SERRÉ, au prorata du lacet gagné (`lacetVolK`) : elle garde son retard d'avant
       camera.position.copy(fallPos).add(oA);}
      /* LE BRAS DE LA CAMÉRA (2026-09-28, nuit, Sacha : « sur mobile la voiture devient trop petite en air time — il faut juste pas que ça
         complexifie »). MESURÉ en portrait : la poursuite décroche à 17-18 m dans la 1re seconde du vol, quand le champ est encore large —
         la caisse tombait à la MOITIÉ de sa taille au sol (0,12 contre 0,23 de la demi-hauteur), pile sur les sauts courts. Désormais la
         caméra reste où la poursuite la met (même direction : derrière la trajectoire), mais jamais plus loin que la distance qui garde la
         caisse à sa taille du DÉCOLLAGE (`CAMV.s0`, mesurée à la 1re image du vol) — au champ du moment. Aucun angle ne change.
         Mesuré : 0,17-0,19 tout le vol (75-85 % du sol) au lieu de 0,12 ; la course et l'atterrissage n'ont pas bougé. */
      {const dMx=volR()/(CAMV.s0*Math.tan(camera.fov*Math.PI/360));CAMV.off.subVectors(camera.position,fallPos);const d9=CAMV.off.length();if(d9>dMx)camera.position.copy(fallPos).addScaledVector(CAMV.off,dMx/d9);}
      (CAMV.p0||(CAMV.p0=new THREE.Vector3())).copy(camera.position);CAMV.p0ok=true; // (2026-10-17) la place du suivi, AVANT secousses et vent (lue à l'image suivante)
      camUp.lerp(FLY_U,Math.min(1,dt*3)).normalize(); // (vol libre) le haut de l'écran = le haut de la caisse : la caméra ne se remet plus « à l'endroit »
      camera.up.copy(camUp);
      /* (bord v2) LA VISÉE GLISSE — c'était LE « clic » du bord : au sol la caméra vise ~10 m DEVANT la caisse (`loop._vise`, la caisse en
         bas de l'image, décalée du côté où elle file), en vol elle vise la caisse ; le passage se faisait en UNE image. La visée de conduite
         fond désormais vers la caisse en ~0,4 s, la penche du virage aussi — et comme `n9Saut` reste nourri en vol, la visée repart EN
         DOUCEUR à l'atterrissage au lieu d'y sauter. */
      if(Math.abs(camLean)>.001){camLean*=Math.exp(-dt*5);qTmp2.setFromAxisAngle(tmp,-camLean);camera.up.applyQuaternion(qTmp2);}
      loop._viseR=0;(loop._carPrev||(loop._carPrev=new THREE.Vector3())).copy(fallPos); /* (2026-10-01) à la pose, la visée de conduite repartira en douceur — et la caméra de route, de la caisse de cette image */
      {const v9=loop._vise;if(v9){if(n9Saut(loop))v9.set(0,0,0);else v9.multiplyScalar(Math.exp(-dt*5));}
       camera.lookAt(fallPos.x+(v9?v9.x:0),fallPos.y+(v9?v9.y:0),fallPos.z+(v9?v9.z:0));}
      // LES CHOCS EN VOL SE SENTENT (bump sur la tranche, surf de nuage, catapulte) — un petit déplacement qui décroît ici, le regard reste sur la caisse
      if(shake>0){if(!REDUCED_MOTION&&!window.dbgNoShake){const a9=Math.min(1.3,shake)*.12;
        camera.position.addScaledVector(FLY_R,Math.sin(t*47)*a9).addScaledVector(camUp,Math.sin(t*37+1.3)*a9*.8);}
        shake=Math.max(0,shake-3*dt);}
      // (2026-09-26) la NITRO se VOIT en l'air : le champ s'ouvre sous la poussée (comme au sol) et le coup de réacteur de l'allumage
      // (`fovPunch`) claque ici aussi — avant, il n'était lu qu'au sol et partait en retard, à l'atterrissage
      fovPunch=Math.max(0,fovPunch-dt*18);
      /* LE VERTIGO DU PLONGEON (2026-10-15, Sacha : « un effet de caméra pour le fun et la sensation de vitesse de l'air time »). Dans la
         DESCENTE, le champ s'ouvre avec la vitesse de chute (jusqu'à +20°) — et comme le BRAS ci-dessus garde la caisse à sa taille du
         décollage, la caméra se RAPPROCHE d'elle-même : la caisse ne bouge pas, le décor s'étire, la route d'en bas file vers soi (le
         « vertigo » des films). Aucun angle ne change : la visée du 28/09 reste intacte. Montée et sommet : rien. Dans l'eau : rien. */
      CAMV.vtg+=((JEAU.dans?0:THREE.MathUtils.smoothstep(-volVu(fallVel),12,70))-CAMV.vtg)*Math.min(1,dt*5);
      const fovAir=fovPor(76-bigAir*22+CAMV.vtg*20*FOVP_K+fovPunch*FOVP_K+(nitroOn?(nitroBlue?18:13):0)); // le champ se resserre avec l'ampleur du saut (76° petit air → 54° gros air) — et se rouvre dans le plongeon (le vertigo)
      camera.fov+=(fovAir-camera.fov)*Math.min(1,dt*(NFX.off>0&&fovAir<camera.fov?2:4)); // (vague 3) la nitro coupée : le champ retombe en douceur
      camera.updateProjectionMatrix();CAM_HEROS.leveApplique(dt,0); // (CAM_HEROS) en vol le décentrement s'efface en douceur
      // (2026-09-28) le vent du VOL au même régime que celui du sol (×.42, le PLANÉ SUPERSONIQUE qui calme, « Réduire les animations ») :
      // en l'air la caméra tremblait 3 à 6 fois plus fort qu'au sol, en bruit blanc, pile sur le beau plan de trois-quarts des gros sauts
      const fshN=THREE.MathUtils.clamp((speedKmh-180)/360,0,1.2),fsh=(REDUCED_MOTION||window.dbgNoShake)?0:fshN*fshN*CAM_SHAKE_V*.42*(1-.7*THREE.MathUtils.smoothstep(speedKmh,700,1800));
      if(fsh>0){
        camera.position.addScaledVector(camUp,fsh*.36*(Math.sin(t*41)+.5*Math.sin(t*67+2.1)));
        camera.position.addScaledVector(FLY_R,fsh*.42*(Math.sin(t*37+.9)+.5*Math.sin(t*59)));
        camera.rotateZ(fsh*.02*Math.sin(t*33+.4)); // le vent secoue aussi l'horizon
      }
      if(nitroOn&&!REDUCED_MOTION&&!window.dbgNoShake)camera.position.addScaledVector(camUp,Math.sin(t*38.7)*(nitroBlue?.05:.036)); // (vague 3) le réacteur GRONDE dans l'image
      if(elTurn.style.opacity!=='0')elTurn.style.opacity=0; // (perf) une fois suffit
      // viseur : où vais-je atterrir ?
      LM.vu=false; // (la dernière pose trouvée reste en place pendant le fondu de sortie)
      tmp2.copy(fallPos);tmp3.copy(fallVel);
      CAMV.eta=99; // (caméra de vol v2) temps avant la réception prédite — 99 = rien en vue
      /* (2026-10-09) LE VISEUR HONNÊTE : il n'intégrait que la gravité pleine — nitro tenue, la vraie chute est 2,5× (orange) à 4× (bleue)
         plus lente et la poussée allonge le vol : l'anneau annonçait une pose trop COURTE et trop DURE (rouge au lieu d'or) pile quand on
         pilote au réacteur. Même loi que la chute : plané (60 / 75 %), poussée dans l'axe (60 / 96 × palier × NITROOO), bascule du bord. */
      const vg9=nitroOn?1-(nitroBlue?.75:.6):1,th9=nitroOn?(nitroBlue?96:60)*(ENGINE_TIERS[engTier]?ENGINE_TIERS[engTier].push:1)*.12:0;
      for(let st2=0;st2<14;st2++){ // même intégration que la vraie chute : vel par seconde, position ×SPD
        if(th9>0){const sp9=tmp3.length();if(sp9>1)tmp3.multiplyScalar((sp9+th9)/sp9);}
        volMonte(tmp3,-FALL_G*gK()*(bascOn?Math.min(1,(bascT+st2*.12)/BASC_T):1)*vg9*.12); // (LE VOL QUI SUIT LA ROUTE) le viseur tombe comme la caisse : vers la dalle survolée sur la route sans haut ni bas
        lmP.copy(tmp2);
        tmp2.addScaledVector(tmp3,.12*SPD);
        // le point le plus proche à moins de 20 m, 1 sur 8, trous exclus (le viseur ne promet jamais un atterrissage dans le vide)
        // (2026-09-27, passe perf iPhone) balayage en casiers (dalleProche) : même point élu, ~6× moins de distances
        const bi=dalleProche(tmp2.x,tmp2.y,tmp2.z,8,400,-1);
        if(bi>=0){
          dTmp.subVectors(tmp2,pts[bi]);
          const h2=dTmp.dot(Nn[bi]),l2=dTmp.dot(B[bi]);
          if(Math.abs(l2)<ROAD_HALF&&h2>-THICK-1&&h2<3){
            /* (2026-10-20) DESSUS OU DESSOUS : le côté d'où l'on ARRIVE (le pas d'avant, dans le repère de CETTE dalle), comme tryLand (prevH > −1,2 →
               dessus). Avant, le seul signe de h2 décidait : un pas tombé à mi-épaisseur posait l'anneau SOUS la route alors que la caisse allait se poser dessus. */
            const hP9=lmP.sub(pts[bi]).dot(Nn[bi]),dessus9=hP9>-1.2?true:hP9<-THICK+1.2?false:h2>-1.3;
            landMark.position.copy(pts[bi]).addScaledVector(B[bi],l2).addScaledVector(Nn[bi],dessus9?.3:-THICK-.3);
            landMark.quaternion.setFromRotationMatrix(mat4.makeBasis(T[bi],B[bi],Nn[bi]));
            LM.vu=true;CAMV.eta=(st2+1)*.12;
            const impP=Math.abs(tmp3.dot(Nn[bi])); // impact PRÉDIT — même unité que le verdict d'atterrissage
            LM.c.setHex(impP<4.5?0xffd75e:impP>=10?0xff5040:0xffffff);if(LM.a<.05)landMark.material.color.copy(LM.c); // or = fenêtre PARFAIT, rouge = posé lourd — la teinte GLISSE de l'une à l'autre
            landMark.scale.setScalar(impP<4.5?1+Math.sin(t*10)*.12:1); // l'anneau OR pulse : vas-y, c'est maintenant
            // assistance d'atterrissage : recentre doucement (d'autant plus qu'on va vite)
            const asF=AIR_ASSIST*THREE.MathUtils.clamp(fallVel.length()/60,.2,1.4);
            fallVel.addScaledVector(B[bi],-l2*asF*dt*.5);
            break;
          }
        }
      }
      mirTick(dt);if(JADE.root&&jadeEauOk()){MIR.t=0;MIR.max=0;} // (2026-10-13) au-dessus de la mer, aucune chute n'est perdue d'avance // (2026-09-28) MIRACULÉ : depuis combien de temps cette chute est-elle perdue d'avance ?
      LM.a+=((LM.vu?1:0)-LM.a)*Math.min(1,dt*(LM.vu?14:7));landMark.visible=LM.a>.02;landMark.material.opacity=.85*LM.a;
      landMark.material.color.lerp(LM.c,Math.min(1,dt*12));
      // camembert de temps de vol (cyan plein pendant AIRTIME INFINI : c'est le pouvoir qui s'égrène)
      if(airPie.style.display!=='block')airPie.style.display='block'; // (2026-09-27) une fois par vol, plus à chaque image
      const inf9=pwrAirT>0&&TUTO.pa; // l'airtime PRÊTÉ par l'auto-école reste INFINI ; le RAISIN, lui, DOUBLE la jauge (voir RAI)
      const fr=inf9?Math.min(1,pwrAirT/PWR_DEFS.a.t):Math.max(0,1-fallTR/airMax()); // jauge en temps RÉEL : 6 s affichées = 6 s vécues
      if(airFlash>0)airFlash=Math.max(0,airFlash-dt);
      const dbl9=pwrAirT>0&&!TUTO.pa; // (raisin) DEUX jauges : la 1re, puis — les ailes perdues — la 2e, de même durée
      airPieDraw(dbl9&&RAI.stage===1?0:fr,inf9?pwrAirT:Math.max(0,airMax()-fallTR),airFlash>0);
      raisinHud(dbl9,dbl9?(RAI.stage===1?fr:1):0);
      {const dg=!inf9&&airMax()-fallTR<1.5;if(dg!==loop._pdg){loop._pdg=dg;airPie.classList.toggle('danger',dg);} // (2026-09-26) il TREMBLE sous 1,5 s
       // …et il TIQUE : les yeux sont sur la caisse, pas sur le chrono — un tic dans la tonalité qui accélère, plus une micro-vibration
       if(dg){loop._atk=(loop._atk||0)-dt;if(loop._atk<=0){const r9=Math.max(0,airMax()-fallTR);loop._atk=.09+.25*r9/1.5;try{if(SONV2)sfx(r9<.5?'alerte.tac':'alerte.tic');else chimeNote(noteP(r9<.5?4:2,1),0,.06,.06);}catch(e){} /* (console) un danger sonne en BOIS, jamais en cloche de récompense */hap(5);}}else loop._atk=0;}
      if(TCTL.on&&!TUTO.on&&!(SAVE.d.ast&2)){loop._astV=(loop._astV||0)+dt;if(loop._astV>1){SAVE.d.ast|=2;SAVE.mark(); // ASTUCE (une fois à vie) : l'assiette au pouce
        misBanniere('ASTUCE',TR(volSens()<0?"En l'air : pouce en HAUT = monte, en BAS = plonge.":"En l'air : pouce en HAUT = plonge, en BAS = monte."),'','eclair');}}
      if(!PARK.on&&portalMesh&&(PCUBE.on?pcubeFranchi(fallPos):fallPos.distanceToSquared(PORTAL.c)<PORTAL.R*PORTAL.R*.9)&&!PORTV.att)portailPasse(); // (2026-09-26) l'ovule traversé EN VOL — du ciel, de côté, d'en dessous
      else if(FORET.root&&(FORET.heurt=foretHeurt(fallPos))){airPie.style.display='none';shake=Math.max(shake,1.2);impPrep(foretHeurt,FORET.heurt,1.1);explode(FORET.heurt);} // (2026-10-14) LA FORÊT NOIRE : un géant, une cime, le sous-bois
      else if(GROTTE.root&&(GROTTE.heurt=grotteHeurt(fallPos))){airPie.style.display='none';shake=Math.max(shake,1.2);impPrep(grotteHeurt,GROTTE.heurt,1);explode(GROTTE.heurt);} // (2026-10-18) LES PROFONDEURS : la roche, la lave, l'eau, les gros décors
      else if(BANQ.root&&(BANQ.heurt=banqHeurt(fallPos))){airPie.style.display='none';shake=Math.max(shake,1.2);impPrep(banqDans,BANQ.heurt,.3);explode(BANQ.heurt);} // (2026-10-14) LA BANQUISE : trop profond dans la poudreuse, la glace prise de face
      else if(JADE.col&&jadeHeurt(fallPos)){airPie.style.display='none';shake=Math.max(shake,1.2);impPrep(jadeHeurt,'pic',1.1);explode('pic');} // (2026-10-09) LES PICS DE JADE : un pilier, la muraille, l'arche
      else if(CY.on&&(CY.heurt=canyonHeurt(fallPos))){airPie.style.display='none';shake=Math.max(shake,1.2);impPrep(canyonHeurt,CY.heurt,1);explode(CY.heurt);} // (2026-10-14) LE CANYON DES GÉANTS : la paroi, la rivière, le fond
      else if(DN.on&&(DN.heurt=dunesHeurt(fallPos))){airPie.style.display='none';shake=Math.max(shake,1.2);impPrep(dunesHeurt,DN.heurt,1);explode(DN.heurt);} // (2026-10-18) LES DUNES D'OR : le sable, l'oasis, les obélisques, la pyramide
      else if(CITY.solY!=null&&LVL.cur&&LVL.cur.vitre&&fallPos.y<CITY.solY+1.4){airPie.style.display='none';shake=Math.max(shake,1.2);if(PARK.on)parkRespawn();else{impPrep(vitreSolDans,'sol',.6);explode('sol');}} // (2026-10-18) LA VILLE VITRÉE AU SOL : le sol est dur
      else if(CITY.col&&villeHeurt(fallPos)){airPie.style.display='none';shake=Math.max(shake,1.2);if(PARK.on)parkRespawn();else{impPrep(villeHeurt,'tour',.9);explode('tour');}} // (2026-10-15) L'IMPACT, le même partout (le cratère propre aux tours, villeImpact, n'est plus appelé : Sacha veut l'explosion de l'airtime sur la ville aussi) // (2026-09-26) DANS UNE TOUR : on meurt
      else if(tryLand(dtF)){airPie.style.display='none';mirPose();} // posé : le total du DAUPHIN se fige et s'encaisse — (v5) et s'ÉCRIT enfin
      else if((airDepasse()&&!BALADE)||jadeVide(fallPos.y)){airPie.style.display='none';if(PARK.on)parkRespawn();else explode(jadeVide(fallPos.y)||MIR.t>2.2?'vide':'air');} // FREESTYLE : trop long en l'air ou chute dans le vide = on repart, jamais de mort // plongeon fatal : sous le point le plus BAS de la piste — comparer à la route « la plus proche » tuait injustement en plein plongeon de crête (elle référençait la crête au-dessus)
    }else if(mode==='boom'){ // ---- EXPLOSION ----
      if(!impCoupTick(dt)){ // (2026-10-15, L'IMPACT) pendant le COUP (0,11 s), la caisse s'écrase contre la paroi : la détonation attend
      boomT+=dt;
      for(const d of debris){
        d.v.y-=22*dt;
        d.m.position.addScaledVector(d.v,dt);
        const sv9=SENS&&BOOM_SOL.ok?d.v.dot(BOOM_SOL.n):0; // (2026-10-14, sensations) la vitesse d'arrivée sur la dalle, AVANT le rebond
        if(BOOM_SOL.ok){tmp3.subVectors(d.m.position,BOOM_SOL.p);const h9=tmp3.dot(BOOM_SOL.n),vn9=d.v.dot(BOOM_SOL.n); // (2026-09-28) roue, capot, éclats REBONDISSENT sur la route
          if(h9<.15&&vn9<0&&h9>-2.5&&Math.abs(tmp3.dot(BOOM_SOL.b))<ROAD_HALF){d.m.position.addScaledVector(BOOM_SOL.n,.15-h9);d.v.addScaledVector(BOOM_SOL.n,-1.4*vn9).multiplyScalar(.55);d.rx*=.7;d.ry*=.7;}}
        if(sv9<-3&&d.v.dot(BOOM_SOL.n)>0)try{sensBoomRebond(d,-sv9);}catch(e){} // (2026-10-14, sensations) elle vient de REBONDIR : ça s'entend, ça se voit, la roue repart
        if(IMP.on&&impRebond(d.m.position,d.v,.5)){d.rx*=.7;d.ry*=.7;} // (2026-10-15, L'IMPACT) …et sur la PAROI percutée
        if(boomT<1.2&&Math.random()<.55)spawnP(boomEmbO,d.m.position.x,d.m.position.y,d.m.position.z,d.v.x*.12,d.v.y*.12,d.v.z*.12,.3+Math.random()*.3); // (2026-09-26) chaque éclat TRAÎNE ses braises
        d.m.rotation.x+=d.rx*dt;d.m.rotation.y+=d.ry*dt;d.m.visible=d.m.position.distanceToSquared(camera.position)>(d.hid||11.5); // (vague 2) à moins de 3,4 m (+ sa taille) de l'objectif, un éclat n'est plus qu'un aplat : masqué
        if(!d.part&&d.m.material)d.m.material.emissiveIntensity=Math.max(0,.6-boomT*.45);
      }
      // (vague 2) anneaux et cœur : animés par updateBoomArt (créés une fois)
      if(SENS&&BOOM_SOL.ok)try{sensBoomBraises(boomEmbO);sensBoomBraises(boomEmbY);}catch(e){} // (2026-10-14, sensations) la pluie de braises REBONDIT sur le bitume
      if(boomLight)boomLight.intensity=Math.max(0,4.5-boomT*3);
      /* (vague 2) LE CADRAGE DE L'EXPLOSION : la secousse s'AJOUTAIT à la position d'une image sur l'autre — une marche au hasard de
         5 à 10 m en 1,8 s : la caméra partait n'importe où, passait parfois AU-DESSUS du foyer et le monde se retournait.
         (vague 3) … puis le recul de 3,5 m laissait la poursuite figée à 7-14 m, grand-angle, monde parfois à l'envers : c'est
         désormais un PLAN de cinéma, voir BOOM_CAM / boomCamTick. */
      boomCamTick(dt);
      if(elTurn.style.opacity!=='0')elTurn.style.opacity=0;
      if(boomT<2.4){if(Math.random()<dt*11)spawnP(smokePool,boomPos.x+(Math.random()-.5)*2.4,boomPos.y+1+boomT*3.2+(Math.random()-.5)*1.5,boomPos.z+(Math.random()-.5)*2.4,(Math.random()-.5)*1.4,4.5+Math.random()*2.5,(Math.random()-.5)*1.4,1.6+Math.random()*.9); // (2026-09-29, passe « jeu pro ») LA COLONNE DE FUMÉE : à 1,4 s il ne restait rien à voir
        if(Math.random()<dt*7)spawnP(boomEmbO,boomPos.x+(Math.random()-.5)*1.6,boomPos.y+.6,boomPos.z+(Math.random()-.5)*1.6,(Math.random()-.5)*3,5+Math.random()*5,(Math.random()-.5)*3,.8+Math.random()*.6);} // …et les braises qui s'en échappent
      if(boomT>1.8&&!gameOver)endGame();
      }
    }
    // traînée nitro façon Asphalt 8 — (2026-09-26, passe graphique) ÉTEINTE : ce ruban PLAT de 1,9 m posé derrière la caisse, sans
    // fondu près de l'objectif, se voyait depuis la caméra de poursuite comme un TAPIS orange sur toute la moitié basse de l'écran à
    // la nitro (mesuré en capture) — la « nappe lumineuse derrière la caisse » du verdict. Les deux rubans des tuyères (trailL/R)
    // et la plume font ce travail. (Elle allouait aussi deux tableaux par image.) `trailPush` reste défini, plus appelé.
    tmp3.set(0,0,1).applyQuaternion(carGroup.quaternion);
    tmp.set(1,0,0).applyQuaternion(carGroup.quaternion);
    tmp2.set(0,1,0).applyQuaternion(carGroup.quaternion);
    // particules
    ptTick(dt); // (particules v2) la vitesse de la caisse : le repère des étincelles étirées
    updatePool(dust,dt,2);
    try{impTick(dt);}catch(e){loopWarn(4194304,'impact',e);} // (2026-10-15) L'IMPACT : le cratère, l'étoile, les éclats, le feu qui couve
    try{impMiniTick(dt);}catch(e){loopWarn(4194304,'impact mini',e);} // (2026-10-15 soir) L'IMPACT EN MINIATURE (le coup d'épaule contre une paroi)
    updateStreaks(dt);
    updatePool(flames,dt,1);
    updatePool(flameCore,dt,1);
    updatePool(embers,dt,4.5);
    updatePool(silBraises,dt,2); // (sillage v6) les braises du sillage montent doucement
    updatePool(ventN,dt,0); // (vague 3) les stries de vent de la nitro (posées fixes : la caisse les traverse)
    updatePool(boomPool,dt,3);
    updatePool(boomRed,dt,2.5);
    updatePool(boomYel,dt,3.5);
    updatePool(smokePool,dt,2.5);
    updatePool(sparkGold,dt,-2); // (2026-09-26) la chute vient désormais de la VRAIE gravité (acc) : l'étincelle part, monte, retombe en arc
    updatePool(sparkBlue,dt,-1);
    updatePool(sparkPink,dt,-1);
    updatePool(spray,dt,9);   // ⚠ gravité POSITIVE : l'eau retombe (c'est tout ce qui la sépare d'une étincelle)
    updatePool(foam,dt,2.4);
    updatePool(cloudBits,dt,-2.2); // les morceaux de nuage retombent doucement
    updatePool(gouttes,dt,9); // (2026-10-21) les gouttelettes de la pluie sur la caisse retombent
    updatePool(juicePool,dt,-16);  // le jus retombe VITE : c'est lourd, une goutte
    updatePool(boomTom,dt,-22);
    updatePool(boomEmbR,dt,1.2);
    updatePool(boomEmbO,dt,0);   // (2026-09-26) les braises orange et jaunes RETOMBENT (acc) — seules les rouges montent encore
    updatePool(boomEmbY,dt,0);
    updatePool(neonPool,dt,2.5);
    for(let i9=chips.length-1;i9>=0;i9--){
      const d=chips[i9];
      d.life-=dt;d.v.y-=20*dt;
      d.m.position.addScaledVector(d.v,dt);
      d.m.rotation.x+=d.rx*dt;d.m.rotation.y+=d.ry*dt;
      if(d.life<=0){scene.remove(d.m);if(!d.sh){if(d.m.material.dispose)d.m.material.dispose();if(d.m.geometry)d.m.geometry.dispose();}chips.splice(i9,1);} // géométrie unique des débris : libérer le GPU aussi
    }
    billsTick(dt); // (vague 2) billets volants : un seul appel de dessin (InstancedMesh)
