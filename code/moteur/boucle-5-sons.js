    // sons continus
    if(AC){
      const spd3=speedKmh;
      if(duckT>0)duckT=Math.max(0,duckT-dt*2.6); // les gros événements creusent le mix, puis il respire
      const dk=(1-.5*duckT);
      nA+=((nitroOn&&mode!=='boom'?1:0)-nA)*Math.min(1,dt*6); // rampe nitro : le moteur gonfle, ne saute pas
      /* (2026-10-14, session SON) LA TENSION DU VOL (voir SVOL) : en l'air elle vise 85 % à 2,5 s de vol + 6 % par geste (30 % au plus),
         plafonnée à 1, et y monte en douceur (taux 2,6/s) ; hors du vol elle retombe (taux 5/s ≈ 0,2 s). Rien d'aléatoire : du lisse. */
      if(mode==='fall'){SVOL.t+=dt;const kT9=Math.min(1,.85*Math.min(1,SVOL.t/2.5)+Math.min(.3,ECH*.06));SVOL.k+=(kT9-SVOL.k)*(1-Math.exp(-dt*2.6));}
      else if(SVOL.k>0)SVOL.k=SVOL.k<.002?0:SVOL.k*Math.exp(-dt*5);
      if(osc&&gainN&&mode==='drive'){
        // LE BRUIT DU MOTEUR, C'EST LE MOTEUR — jamais la caisse (règle posée par le user, 2026-08-03).
        // ⚠ le timbre était bien RECHARGÉ depuis le palier moteur (engSetTier ci-dessous), mais la
        // ligne suivante lisait encore `ENGINES[level]` : la BOÎTE DE VITESSES, le ralenti et les
        // crépitements venaient donc toujours de la carrosserie choisie au garage. Deux sources
        // pour un seul son. On lit désormais `engLvl`, l'index réellement chargé.
        // ⚠ et on recharge AVANT de lire, sinon la boîte a une frame de retard au changement de palier.
        // ⚠ LA RÈGLE DE TROIS EST MORTE (2026-08-05). On projetait 30 paliers sur les 24 voix de
        // `ENGINES` : six doublons GARANTIS par construction, et surtout le nombre de cylindres
        // — ce qui fait la hauteur d'un moteur — n'entrait pas dans le calcul. `ENG_SND` a une
        // ligne PAR PALIER : l'index, c'est `engTier`, sans conversion.
        let resync9=false;{if(engLvl!==engTier){engSetTier(engTier);resync9=true;}}
        const eng=ENG_SND[engLvl<0?0:engLvl]||ENG_SND[0];
        const thr=(up&&!(AUTO_GAS&&(dn||driftEnCours)))?1:0,sN=Math.min(1.06,spd3/Math.max(1,vCroisiere())); // (2026-09-25) gaz auto : le DRIFT lève le pied du SON (frein moteur, pop-corn) — la physique garde `up` · régime sur la CROISIÈRE réelle : la boîte ne passe plus tous ses rapports en 3 s pour rester au rupteur toute la partie // régime = part de la vitesse RÉELLEMENT atteignable (la fiche de la carrosserie n'a plus rien à voir avec ce que la caisse fait)
        // BOÎTE VIRTUELLE : rapports courts en bas, longs en haut. Montée → CHUNK → chute →
        // remontée : la respiration qui rend l'accélération grisante (une rampe nue est monotone)
        let tgt;
        if(eng.gr>1){
          const gn=eng.gr;
          // RECALAGE MUET (2026-09-25) : un palier neuf remet la boîte en 1re (engSetTier) alors qu'on roule vite — on reprend le
          // rapport de la vitesse SANS jouer les autres (sinon 4 à 7 passages en autant d'images, par-dessus la scène de montage)
          if(resync9)for(;engGear<gn;engGear++){const l9=Math.pow((engGear-1)/gn,1.3),h9=Math.pow(engGear/gn,1.3)*1.05;if((sN-l9)/Math.max(.01,h9-l9)<=.99)break;}
          const lo=Math.pow((engGear-1)/gn,1.3),hi=Math.pow(engGear/gn,1.3)*1.05;
          const pos=Math.min(1.05,Math.max(0,(sN-lo)/Math.max(.01,hi-lo)));
          if(pos>.99&&engGear<gn&&up&&engShiftT<=0){engGear++;engShiftT=.12;
            const T9=performance.now();if(T9-(loop._shT||0)>500){loop._shT=T9; // UN passage = UNE cérémonie (la boîte pompait : rafales de pétarades)
              /* (2026-10-14, session SON) LA CÉRÉMONIE À LA TAILLE DU RAPPORT. Au départ la boîte monte 6-7 rapports en ~3 s (0,17 · 0,42 · 0,76 ·
                 1,22 · 1,85 · 2,8 s en 8 rapports, audit n°3 §9) : six claquements pleins = une mitrailleuse, pile sur le piqué, la musique et le
                 boost offert. Désormais les premiers rapports sont des TICS (q = .35 + .65·rapport/gn : ~.5 au 2e, 1 au dernier), la pétarade est
                 réservée aux deux derniers, le garde-temps passe de 350 à 500 ms. La vibration et le coup de champ (le ressenti) gardent leur
                 FORCE mais s'espacent : 900 ms au moins entre deux. Rien ne touche la vitesse : la boîte est sonore. */
              const q9=.35+.65*engGear/gn;
              subBoom((.06+.07*engGear/gn)*q9);noiseBurst(.05,.07*q9,3000);if(engGear>=gn-1&&!MV.use)crackle(Math.max(.3,eng.crk));
              if(T9-(loop._shR||0)>900){loop._shR=T9;hap(5);fovPunch=Math.max(fovPunch,1.8);}}} // (2026-09-25, dosé le 14/10 : voir ci-dessus) LE PASSAGE CLAQUE : coupure, thump, pétarade À CHAQUE rapport, un tic dans le pouce, un coup de champ — c'est le RYTHME de l'accélération (le gaz est automatique : sans ça, on n'entendait qu'une rampe)
          else if(engGear>1&&sN<lo*.95)engGear--; // (2026-09-25) VRAIE hystérésis : on ne rétrograde qu'à 5 % sous le bas du rapport (l'ancien seuil tombait AU-DESSUS du seuil de montée)
          tgt=Math.pow(Math.min(1,pos),.9);
          if(spd3<8)tgt=thr*.72; // sur place : vroum-vroum libre
          if(engShiftT>0){engShiftT-=dt;tgt*=.66;} // gaz coupés le temps du passage
        }else tgt=sN; // turbine/onduleur : montée continue, zéro rupture
        engRpm+=(tgt-engRpm)*Math.min(1,dt*(tgt>engRpm?8:5.5)); // monte nerveux, retombe un peu plus lent
        /* ================= LA CHARGE : les trois états du moteur =================
           ⚠ LA CHARGE N'EST PAS LA PÉDALE. Pied au plancher à 300 km/h sur le plat, un moteur
           travaille peu — il tient une vitesse. Pied au plancher en reprise, il donne tout.
           Ce sont deux sons TRÈS différents, et jusqu'ici le jeu ne connaissait que `thr` (0/1),
           donc les deux sonnaient pareil. La charge se lit dans l'ACCÉLÉRATION RÉELLE : si le
           régime normalisé monte, le moteur pousse contre quelque chose.
           Trois états, un seul continuum : 1 = pleine charge · ~.3 = stabilisé · 0 = lâché. */
        /* ================= LA CHARGE : les trois états du moteur =================
           ⚠ LA CHARGE N'EST PAS LA PÉDALE. Pied au plancher à 300 km/h sur le plat, un moteur
           travaille peu — il tient une vitesse. Pied au plancher en reprise, il donne tout.
           Ce sont deux sons TRÈS différents, et le jeu ne connaissait que `thr` (0/1) : les deux
           sonnaient pareil. La charge se lit dans l'ACCÉLÉRATION RÉELLE.
           ⚠ Le calcul vit dans le bloc balisé <<<SON-MOTEUR>>> : `moteurs.html` l'exécute tel
           quel pour son aperçu, donc l'atelier ne peut pas mentir sur la dynamique. */
        const dv9=(sN-(loop._sN==null?sN:loop._sN))/Math.max(.001,dt);loop._sN=sN;
        {const L9=engLoadStep({charge:charge9,ovr:ovr9,drift:drift9},thr,engRpm,dv9,dt);
         charge9=L9.charge;ovr9=L9.ovr;drift9=L9.drift;}
        /* LE POP-CORN D'ÉCHAPPEMENT. Il existait déjà mais ne se déclenchait qu'à l'INSTANT du
           lâcher. Un vrai échappement continue de péter pendant toute la décélération, de plus
           en plus espacé — c'est la traîne qui fait le plaisir, pas le premier pop. */
        if(MV.use){}else if(engWasUp&&!thr&&engRpm>.42&&eng.crk>0&&Math.random()<eng.crk)crackle(eng.crk);
        else if(ovr9>.25&&eng.crk>0&&Math.random()<dt*(AUTO_GAS?3.5:7)*eng.crk*ovr9*ovr9)crackle(eng.crk*.55); // gaz auto : la traîne dure tout le drift, égrenée deux fois moins pour laisser le « brrrr » de charge
        engWasUp=!!thr;
        const wob=eng.wob?Math.sin(t*12.7)*Math.sin(t*3.1)*eng.wob*Math.max(0,1-engRpm*3.5):0; // l'épave respire au ralenti
        /* ---- TOUS LES RÉGLAGES EN UN APPEL ----
           Les formules sont dans <<<SON-MOTEUR>>>, la boucle ne fait plus que les APPLIQUER.
           ⚠ C'est ce découpage qui permet à l'atelier de faire entendre les 30 voix sans en
           recopier une ligne. Une palette de 30 timbres qu'on ne peut pas écouter côte à côte
           n'est pas une palette, c'est un tableau de nombres. */
        const P9=engSndParams(eng,{rpm:engRpm,charge:charge9,ovr:ovr9,drift:drift9,nA:nA,thr:thr,
          vsp:Math.min(1.15,spd3/Math.max(1,vmaxShow())),wob:wob,resp:engSouffle(t,engRpm),boost:boost>0,cloudIn:cloudInS,dk:dk,nB:TEL_NATIF?1:0,gE:VOL_LOCKED?1:.72,lpMin:TEL_NATIF?700:0});
        /* (2026-10-07) LA LANCÉE S'ENTEND : l'élan GONFLE le ventre du moteur (sub + corps, jusqu'à +35 % / +12 %) — jamais sa note (le « moustique ») ;
           et chaque palier d'élan (1,5 · 3 · 4,2 s de ligne tenue) allume un CYLINDRE (`moteur.cylindre`, un degré plus haut à chaque palier), réarmé
           seulement quand l'élan est retombé de 0,8 s sous le palier : conduire propre a un rythme qu'on entend. */
        {const m9=THREE.MathUtils.clamp(momT/4.2,0,1);P9.subG*=1+.35*m9;P9.mix*=1+.12*m9;
         const L9=LANCEE;for(let k9=0;k9<3;k9++){const sx9=k9===0?1.5:k9===1?3:4.2;/* (2026-10-14, passe perf mobile) mêmes seuils, sans 3 tableaux par image */if(!L9.a[k9]&&momT>=sx9&&running&&!gameOver){L9.a[k9]=1;if(SONV2&&thr)try{sfx('moteur.cylindre',{st:sonPd(2+k9*2),vol:-4});}catch(e){}if(k9===2)hap(6);}else if(L9.a[k9]&&momT<sx9-.8)L9.a[k9]=0;}}
        engApplique(P9); // (2026-10-05) les réglages appliqués aux nœuds : partagés avec le BURN-OUT du garage
        if(MV.on)MV.drive(dt,engRpm,engShiftT>0?0:thr,charge9,nA,dk,false); // (2026-10-22) LE MOTEUR VIVANT : prend la place de la chaîne d'oscillateurs (palier à pistons) — le passage de rapport COUPE les gaz
      }else if(gainN){
        // en vol : un souffle de moteur résiduel ; MORT ('boom') : coupé NET — et on retombe au
        // ralenti pour que la reprise ne reparte pas d'un régime fantôme aigu
        if(mode==='fall'&&!nitroOn){ // (2026-09-25) ROUES LIBRES : le moteur s'emballe doucement en vol (il était figé et muet), rupteur par le LFO déjà branché
          const e0=ENG_SND[engLvl<0?0:engLvl]||ENG_SND[0],T0=AC.currentTime,k9=SVOL.k;
          /* (2026-10-14, session SON) LE MOTEUR CHANTE AVEC LA TENSION : la roue libre vise .85 → .98 du régime (jamais au-delà du
             plafond du sol, 1 : pas de « moustique »), le gain gonfle de 35 % au plus (reste sous le moteur au sol en croisière),
             le battement se resserre (9 → 13 Hz). Lissage du régime en exp(dt) : même montée à 30 et 120 i/s. */
          engRpm+=((.85+.13*k9)-engRpm)*(1-Math.exp(-dt*2.2));
          const f0=engGenou((e0.i+engRpm*e0.r)*.62)*(1+(ENG_DOUX?engSouffle(t,engRpm):0)); // (2026-10-14, session SON) le genou vaut aussi en vol : à .98 du régime le palier 30 sifflait à 2 040 Hz ; et il respire (engSouffle)
          stt(osc.frequency,f0,T0,.05);stt(osc2.frequency,f0,T0,.06);
          stt(engSub.frequency,Math.max(22,f0*.5),T0,.06);
          /* (2026-10-14, session SON) LE DÉCOLLAGE SANS TROU : le moteur ne tombe plus en tc .08 (un décrochage en ~0,25 s) mais en .18,
             et son plancher en vol passe de .013 à .02 — toujours SOUS le moteur au sol à la vitesse d'un décollage (ev ≈ .032×vol sur
             ordi, .045 sur iPhone ; ici ≤ .027×vol, tension comprise). Le battement suit la même pente (il s'ajoute au gain). */
          stt(gainN.gain,.02*(1+.35*k9)*e0.vol*dk,T0,.18);
          stt(engLfo.frequency,9+4*k9,T0,.05);stt(engLfoG.gain,.009*(1+.35*k9)*e0.vol*dk,T0,.18);
          if(MV.on)MV.drive(dt,engRpm,.4,.25,0,dk,true); // (2026-10-22) en vol, le moteur vivant s'emballe doucement
        }else{stt(gainN.gain,mode==='fall'?.004:0,AC.currentTime,mode==='boom'?.05:.1);stt(engLfoG.gain,0,AC.currentTime,.1);}
        if(mode==='boom'){engRpm=0;const e0=ENG_SND[engLvl<0?0:engLvl]||ENG_SND[0]; // idem : le ralenti de la mort suit le MOTEUR
          stt(osc.frequency,e0.i,AC.currentTime,.3);stt(osc2.frequency,e0.i,AC.currentTime,.3);}
        if(MV.on&&!(mode==='fall'&&!nitroOn))MV.mute(mode==='boom'); // (2026-10-22) la mort coupe net, le nitro en l'air couvre
        stt(engWhineG.gain,0,AC.currentTime,.1);
        // en vol il n'y a plus ni charge, ni boîte, ni frein moteur : les roues ne touchent rien
        {const G9=loop._gn||(loop._gn=[0,0,0,0,0]);G9[0]=transG;G9[1]=diffG;G9[2]=ovrG;G9[3]=engTickG;G9[4]=pinkG;for(let i9=0;i9<5;i9++){const n9=G9[i9];if(n9)stt(n9.gain,0,AC.currentTime,.12);}}
        charge9+=(0-charge9)*Math.min(1,dt*4);ovr9+=(0-ovr9)*Math.min(1,dt*4);
      }
      if(windG){
        // MORT ('boom') : coupé NET — sinon spd3 (=speedKmh figé au crash) laisse le vent souffler à fond pour toujours
        /* (2026-10-07, Sacha : « des moyens soft pour augmenter la sensation de vitesse ») LE VENT NE PLAFONNE PLUS : il saturait à 500 km/h
           (gain .05) — au-delà, l'oreille ne recevait plus rien de la vitesse (le moteur, lui, s'arrête à la croisière : sa note ne doit pas
           monter, Sacha l'avait trouvé « moustique »). Il continue en LOGARITHME jusqu'à 1 800 km/h (.05 → .075 : l'oreille entend les
           rapports, pas les écarts) et, passé la croisière, il RAFALE : deux ondes lentes (2,1 et 3,3 Hz) qui creusent jusqu'à 22 % — l'air
           qui frappe la carrosserie. Sous 500 km/h, rien ne change. */
        {const vg9=spd3<500?spd3*.0001:.05+.025*Math.log(spd3/500)/Math.log(3.6),vC9=Math.max(1,vCroisiere()),rf9=.22*THREE.MathUtils.clamp((spd3-vC9)/vC9,0,1)*(mode==='drive'?1:.5),
               raf9=1+rf9*(.6*Math.sin(t*13.19)+.4*Math.sin(t*20.73+1.7));
         stt(windG.gain,mode==='boom'?0:Math.min(.075,vg9+(mode==='fall'?.018:0)+.016*SVOL.k+cloudInS*.02)*raf9*(nitroOn&&!NIT_ANC?.25:1)*dk*(SONV2?1-Math.min(1,LVL.espace):1)*(1-.85*JEAU.k),AC.currentTime,mode==='boom'?.08:rf9>.01?.06:.15);} // coef ÷2 (SPD .25→.5 : spd3 a doublé) — le vent garde sa montée progressive au lieu de saturer dès le mid-game
        stt(windF.frequency,Math.min(16000,(280+spd3*1.25)*(1-.6*cloudInS)+(mode==='fall'?260:0)+340*SVOL.k),AC.currentTime,.15); // (2026-10-14, session SON) +340 Hz × la tension du vol : le vent S'AIGUISE à mesure que le vol dure (et son gain +.016×k au-dessus, sous le plafond .075) ; à la pose k retombe en ~0,2 s — le vent se relâche au lieu de couper // ⚠ plafonné : au-delà de 24 kHz le navigateur crachait un avertissement PAR IMAGE // le nuage étouffe le vent, l'air libre l'aère (coef ÷2 : même pitch au même état-caisse)
      }
      if(whG){ // sifflement d'air : la signature des vitesses folles (>330 km/h)
        // MORT : coupé NET (même piège que le vent : sinon le sifflement reste bloqué à fond après le crash)
        stt(whG.gain,mode==='boom'?0:(spd3<824?Math.max(0,(spd3-560)/4400):Math.min(.085,.06+.025*Math.log(spd3/824)/Math.log(2.2)))*(1-.7*cloudInS)*(1-(NIT_ANC?.5:.9)*nA)*dk*(SONV2?1-Math.min(1,LVL.espace):1),AC.currentTime,mode==='boom'?.08:.12); /* (2026-10-07) le sifflement, saturé à 824 km/h, continue lui aussi (logarithme, .085 à 1 800) */ // seuil+pente ×2 (SPD .25→.5 : spd3 a doublé) — le sifflement reste la signature des VITESSES FOLLES, pas un fond permanent
        stt(whF.frequency,2000+spd3*1.2,AC.currentTime,.1); // coef ÷2 : même pitch au même état-caisse
      }
      if(pluieG){ /* (2026-10-14, session SON, audit oreille-neuve §7) LA PLUIE : suit ce que le rideau montre (LVL.pluie, fondu du portail ; la bruine de Paris), se tait à la
        mort, sous l'eau (comme le vent) et s'étouffe dans un nuage (comme le sifflement). Coupée sous .02 : la porte se ferme, zéro coût hors pluie. Elle respecte le creux des
        grands moments (dk). Fondu .4 s (l'orage qui s'installe ne saute pas) ; PLUIE_SON=false la rend muette. */
        const pl9=PLUIE_SON&&mode!=='boom'&&!gameOver?(LVL.pluie||0):0;
        stt(pluieG.gain,pl9<.02?0:PLUIE_NIV*Math.min(1,pl9)*dk*(1-.85*JEAU.k)*(1-.6*cloudInS),AC.currentTime,mode==='boom'?.08:.4);
      }
      if(cloudInS>.45&&!loop._cldWas&&!SONV2)noiseBurst(.45,.08,520); // percée dans la ouate : fwoosh de coton
      loop._cldWas=cloudInS>.45;
      if(skidG){ // crissement v2 : ZONE MORTE (il signale LA LIMITE, pas la conduite normale), pitch qui monte avec la glisse
        const drift=(mode==='drive')?glisse9:0; // …et il CRISSE (même mesure que la fumée)
        // (2026-10-14, session SON) il était 10 à 20 dB SOUS le moteur (−46 dBFS à drift .4, −36 à plein drift, le moteur seul −29) : l'exposant 1,3 l'éteignait pile où le joueur en a besoin.
        // Courbe linéaire en drift, gain .20, cap .30 : +5,6 dB à drift .4 (300 km/h), +4,9 dB à plein drift. Le burn-out du garage réécrit skidG lui-même (burnSon) : NON touché. (audit oreille-neuve n°3 §5)
        if(CRISSE_DOUX)gomPas(drift,spd3,dk,AC.currentTime); // (2026-10-16, Sacha : « moins agressif et plus ASMR ») LA GOMME DOUCE à sa place — l'ancien se tait en course (`?crisse=ancien` le rend)
        stt(skidG.gain,drift>0&&!CRISSE_DOUX?Math.min(.30,drift*.20*(.5+Math.min(1,spd3/380)))*dk:0,AC.currentTime,.05);
        if(drift>0&&!CRISSE_DOUX){
          const sq=900+drift*430+spd3*.35;
          stt(skF1.frequency,sq,AC.currentTime,.05);stt(skF2.frequency,sq*1.56,AC.currentTime,.05);
          stt(skD1.gain,40+130*drift,AC.currentTime,.1);stt(skD2.gain,60+200*drift,AC.currentTime,.1); // le broutage stick-slip suit la glisse
          stt(skLfo.frequency,9+drift*7,AC.currentTime,.1);
        }
      }
      try{driftChargeSnd();raseSnd(dt,speedKmh);}catch(e){if(!loop._sndE){loop._sndE=1;console.warn('sons de conduite',e);}} // (2026-09-25) la charge du drift et le rase-bord s'entendent — une panne se DIT une fois en console
      if(jetG){ // réacteur : AU SOL la flamme rugit (peigne serré + gros grave, le sol porte),
        // EN L'AIR le jet fend l'air (whoosh flangé + turbine, le grave s'évapore)
        const air9=mode==='fall';
        // LA FLAMME = le rumble brown, sol COMME air. Rond, chaud, PRÉSENT — aucun aigu à arracher.
        // (2026-09-26) la flamme ne vit QUE manette en main : pendant l'explosion (un tap NITRO pour la passer tient `keys.Space`)
        // et après `endGame` dans la même image, elle réécrivait ses gains — le souffle restait figé sur l'écran de mort
        const nOn9=nitroOn&&mode!=='boom'&&!gameOver&&BTEST!=='feu0';
        // (2026-10-12, Léo : « le bruit dont je parle tout le temps au début… le boost en l'air ») MESURÉ au banc (dbgVu) : ce grondement sortait
        // à −14/−16 dB RMS, 12 dB AU-DESSUS de tout le reste (moteur −28, mélange −26) — dès qu'on tient le boost, il couvrait le jeu. ×,4 (−8 dB).
        const jb=nOn9?(nitroBlue?.52:.4)*NIT_GRONDE*(RUG_SON&&RUG.pret?RUG_CORPS:1):0;
        if(nOn9&&!loop._jrP)loop._jrT=AC.currentTime;loop._jrP=nOn9; // (2026-10-12) l'ALLUMAGE en fondu (~0,35 s) : plus un mur de bruit d'un coup
        JETN.t+=dt;if(JETN.t>=.09){JETN.t%=.09;JETN.r=.84+.32*Math.random();JETN.l=.7+.6*Math.random();} // (2026-10-14, session SON) la turbulence change toutes les 90 ms, plus à chaque image (voir JETN)
        stt(jrG.gain,jb*(air9?1.1:1.05)*JETN.r*dk,AC.currentTime,nOn9&&AC.currentTime-(loop._jrT||0)<.45?.18:.08); // turbulence lente
        stt(jrDep.gain,jb*(air9?.22:.16)*dk,AC.currentTime,.1); // flutter 5 Hz : la flamme respire
        stt(jrF.frequency,nOn9?(air9?310+spd3*.3:430+spd3*.35)+(nitroBlue?80:0):240,AC.currentTime,.1); // un poil plus mordante au sol
        // PLUS AUCUNE couche de bruit blanc continue : souffle médium coupé, grave blanc réduit
        // à un fond — tout le caractère vient du rumble brown + des pops bruns
        stt(jetG.gain,nOn9&&air9?.01*dk:0,AC.currentTime,.06);
        stt(jetLowG.gain,NIT_ANC?(TEL_NATIF?0:(nOn9?(air9?.08:.05):0)*JETN.l*dk):(nOn9?(air9?.14:.12):0)*(TEL_NATIF?.5:1)*JETN.l*dk,AC.currentTime,.07); // téléphone : un grave à 150 Hz inaudible qui ne faisait que pousser le compresseur
        stt(jetOscG.gain,nOn9&&!air9?.003:0,AC.currentTime,.09); // pointe de turbine au sol
        stt(jcFb.gain,.12,AC.currentTime,.1);stt(jcDep.gain,.0002,AC.currentTime,.12); // peigne+flanger au repos (ils chuintaient)
        if(nOn9){
          stt(jetF.frequency,320+spd3*.6+(nitroBlue?180:0),AC.currentTime,.07);
          stt(jetOsc.frequency,900+spd3*3.5+(nitroBlue?400:0),AC.currentTime,.08);
          // pétillement en pops BRUNS, discrets et distincts : ça crépite, ça ne souffle pas.
          // (moins denses qu'avant : 25/s de pops ronds > 50/s de pops blancs qui fusionnent en tapis)
          // (2026-10-16) LE FEU QUI RUGIT : ces pops-là sont remplacés par sa boucle de crépitement (RUG.crep, zéro nœud créé) — le POK reste
          if(!(RUG_SON&&RUG.pret)&&Math.random()<dt*(air9?(TEL_NATIF?4:9):(TEL_NATIF?6:25)))flamePop(.02+Math.random()*.05,air9?.05+Math.random()*.06:.1+Math.random()*.14,(air9?300:380)+Math.random()*260+(TEL_NATIF?500:0)); // téléphone : moins de pops, plus hauts (audibles) — (2026-10-14, session SON) 10 → 6/s au sol et 9 → 4/s en l'air sur iPhone : chaque pop alloue 4 nœuds WebAudio, la cadence était un coût CPU ; le timbre ne change pas
          if(!air9&&Math.random()<dt*2.4){flamePop(.05+Math.random()*.04,.3,520);subBoom(.05);} // le POK : plop + mini coup de poitrine
        }
        if(nOn9&&air9&&!loop._jetWas&&NFX.ign<.5){ // ALLUMAGE : FWOOM rond — souffle grave + coup de poitrine (le sifflet strident a dégagé) — (vague 3) seulement quand on DÉCOLLE nitro tenue : un allumage frais a déjà son WHOOMP (nitroAllume)
          noiseBurst(.35,.2,300);subBoom(.15);
        }
        loop._jetWas=nOn9&&air9;
        if(RUG_SON)rugPas(dt,{on:nOn9,air:air9,bleu:nitroBlue,v:spd3,dk:dk}); // (2026-10-16) LE FEU QUI RUGIT : la gorge, la montée, la pulsation, le crépitement
      }
    }
    // portail qui pulse + pads RGB qui défilent
    if(PCUBE.on)pcubeTick(t,speedKmh,dt); // (2026-10-17) LE PORTAIL DE CUBES : l'onde, les flotteurs, l'aspiration
    // (console de son) LE PORTAIL APPROCHE : un bourdon qui monte, UNE fois par portail (portalMesh est neuf à chaque piste), ~2 s avant l'ovule — et près du BOUT de la piste (un ruban qui repasse sous l'ovule ne le déclenche pas)
    if(SONV2&&portalMesh&&PORTAL.son!==portalMesh&&!PARK.on&&mode!=='boom'){const v9=Math.max(10,speedKmh/3.6),d9=carGroup.position.distanceTo(PORTAL.c)-PORTAL.R*.95;if(d9<v9*2&&L-(mode==='fall'?lastNearS:s)<v9*3+120){PORTAL.son=portalMesh;sfx('portail.proche');}}
    // pads turbo : on n'anime la texture (dessin canvas + upload GPU) que si un pad est réellement en vue
    {let pv9=false;for(const p9 of PADS)if(p9>s-80&&p9<s+520){pv9=true;break;}if(pv9)updatePadTex(t);}
    // HUD
    // FILÉS DE VITESSE — RÉTABLIS (2026-09-05) : ce commentaire prétendait qu'« un warp du shader »
    // avait pris leur place, mais ce warp n'a JAMAIS existé dans ce fichier (0 occurrence de `warp`
    // ailleurs, `drawSpeedLines` restait déclarée mais plus jamais appelée) — la sensation de vitesse
    // a donc été perdue en silence, sans rien pour la remplacer. Le user l'a réclamée sans savoir
    // qu'elle avait disparu : « remets un peu de zoom ou de flou… puis encore plus au boost » décrit
    // EXACTEMENT ce que fait déjà `drawSpeedLines` (filés radiaux, cyan et deux fois plus denses sous
    // `nitroOn`) — il ne manquait qu'un appelant.
    if(!REDUCED_MOTION){drawSpeedLines(speedKmh,nitroOn,dt);nfxFiles(dt);} // reduced-motion : speed lines coupées (la garde avait sauté au rétablissement du 2026-09-05) — (vague 3) + la gerbe de l'allumage
    if(speedKmh>runStats.vmax)runStats.vmax=speedKmh;
    secTick(dt,speedKmh);m2Tick(dt,speedKmh); /* (2026-10-16) LES MISSIONS v2 */ // (2026-10-14) LES DÉFIS SECRETS : vitesse, bords, distances, maps traversées
    // ⚠ EN VOL, LA VITESSE NE SE « TIENT » PAS : on subit une parabole, il n'y a aucun mérite à
    // afficher 900 km/h en tombant. L'aura de vitesse ne compte donc qu'au sol, manette en main.
    auraComboTick(dt); // la fenêtre du combo de figures se referme toute seule
    fruitRafTick(dt);  // …et celle de la rafale de fruits
    if(!paused){misTick(dt);tutoTick(dt);flowTick(dt);chaineTick(dt);orbFxTick(dt);} // …les CONTRATS se cochent en direct, l'AUTO-ÉCOLE suit tes gestes
    /* LA CHARGE D'AURA. Trois choses à l'écran, et chacune répond à une question :
       le CHIFFRE (« combien j'ai »), la JAUGE (« où je vais » — le rang suivant), le MAX (« quoi
       battre »). Sans la troisième, il n'y a aucune raison de vouloir monter. */
    if(loop._auraVu===undefined&&auraHudEl)loop._auraVu=getComputedStyle(auraHudEl).display!=='none'; // (perf) l'ancienne jauge est masquée pour de bon (#auraHud display:none!important) : on ne lui écrit plus rien
    if(!loop._auraVu){if(auraPop>0)auraPop=Math.max(0,auraPop-dt*2.4);if(auraFlash>0)auraFlash=Math.max(0,auraFlash-dt*1.5);}
    else if(auraHudEl){
      auraValEl.textContent=Math.round(auraRun);
      const tot=(SAVE.d.aura||0)+auraRun, r=auraRank(tot);
      const bas=AURA_RANKS[r].v, haut=r<AURA_RANKS.length-1?AURA_RANKS[r+1].v:bas+1;
      auraBarEl.style.width=(r>=AURA_RANKS.length-1?100:Math.min(100,(tot-bas)/(haut-bas)*100)).toFixed(1)+'%';
      auraSubEl.textContent='MAX '+(SAVE.d.auraMax||0);
      // LE HALO : il enfle au gain puis retombe. C'est lui qui fait « énergie » plutôt que « score ».
      if(auraPop>0)auraPop=Math.max(0,auraPop-dt*2.4);
      if(auraFlash>0)auraFlash=Math.max(0,auraFlash-dt*1.5);
      auraGlowEl.style.opacity=Math.min(1,auraPop*.55+auraFlash*.75).toFixed(3);
      auraHudEl.style.transform='scale('+(1+auraPop*.20).toFixed(3)+')';
      // LE COMBO ne s'affiche que tant que la fenêtre est ouverte — un compteur figé à ×0 est du bruit
      if(figComboT>0&&figCombo>=2){
        auraComboEl.textContent='COMBO ×'+figCombo;
        auraComboEl.style.opacity=Math.min(1,figComboT/1.2).toFixed(2);
      }else if(auraComboEl.style.opacity!=='0')auraComboEl.style.opacity='0';
    }
    // (perf, lot 4) chaque écriture DOM se paie d'un recalcul de style — et `textContent=` remplace le nœud texte même à valeur égale :
    // on n'écrit que ce qui a CHANGÉ (sur téléphone ces éléments sont masqués : on leur écrivait quatre fois par image pour rien)
    // (2026-09-27, passe perf iPhone) écran nu : #speedo est masqué sous body.touch — plus un texte ni un style par image pour lui
    if(loop._nu===undefined)loop._nu=document.body.classList.contains('touch');
    if(!loop._nu){
    {const k9=Math.round(speedKmh);if(loop._spK!==k9){loop._spK=k9;elSpeed.textContent=k9;}}
    // le compteur VIT : il gonfle et vire au rouge quand ça devient déraisonnable
    const spdP=Math.min(.24,Math.max(0,(speedKmh-760)/1300)+(nitroOn?.05:0)); // seuils ×2 (SPD .25→.5 : km/h affichés doublés) — le compteur gonfle/rougit au même RÉGIME RESSENTI qu'avant
    {const tr9='scale('+(1+spdP).toFixed(3)+')',co9=speedKmh>920?'#ff5040':'';
     if(loop._spT!==tr9){loop._spT=tr9;elSpeed.style.transform=tr9;}if(loop._spC!==co9){loop._spC=co9;elSpeed.style.color=co9;}}
    }
    if(!REDUCED_MOTION){const o9=Math.max(0,Math.min(.6,(speedKmh-280)/560)).toFixed(2);if(loop._sfO!==o9){loop._sfO=o9;speedFx.style.opacity=o9;}} // reduced-motion : vignette vitesse coupée
    // panneaux HUD MASQUÉS (#carInfo/#cpInfo/#record en display:none) : on ne reconstruit leur texte (fmtC/fmt alloue) QUE quand la valeur change
    paintCarHud();
    if(TCTL.on)cashHudTick(dt); // (2026-09-29) le compteur d'argent du téléphone (#cashHud) · (2026-09-30) la colonne de droite s'empile
    if(loop._money!==money){loop._money=money;elMoney.innerHTML=fmtGta(money); // un parse HTML seulement quand le compte bouge
      for(const u of unitsL())if(money>=u[0]){ // on vient de changer d'ordre de grandeur ? ça se FÊTE (une fois par session)
        if(u[0]>unitSeen){unitSeen=u[0];if(SONV2)sfx('argent.palier');showMsg(TR('💸 TU COMPTES EN ')+u[2]+TR(' MAINTENANT !'),'#7dff9a');}
        break;}
    }
    if(!gameOver&&money>=nextRainAt){nextRainAt*=2.6;startMoneyRain();showMsg(pickL(RAIN_LINES),'#7dff9a');}
    if(money>best){if(SONV2&&started&&!gameOver&&!SANDBOX&&!TUTO.on&&best>START_CASH+.5&&!runStats.recSon){runStats.recSon=1;sfx('aura.record',{vol:-6});}best=money;SAVE.d.best=best;SAVE.mark();} // mark : le filet des 30 s (ou la fin de run) écrira
    if(loop._bestHud!==best){loop._bestHud=best;elRecord.textContent=TR('record : ')+fmt(best);}
    // ⚠ on n'écrit la jauge QUE si elle a bougé d'un demi-pour-cent : un style par image, c'est un recalcul de style par image
    // (2026-09-28, HUD v5) la rampe dit la MÊME chose que le disque NITRO : la part du RÉSERVOIR du moteur (orange), puis la réserve bleue
    // par-dessus, plafonnées à la rampe entière — elle comptait sur 4 unités : réservoir plein = rampe à moitié, disque plein (contradiction)
    {VOLG.n.r=Math.min(VOLG.n.r,nitroR);VOLG.n.x=Math.min(VOLG.n.x,nitroX); // (2026-10-12) la barre MONTRE la nitro moins celle qui vole encore vers elle
     const nR8=Math.max(0,nitroR-VOLG.n.r),nX8=Math.max(0,nitroX-VOLG.n.x),mx8=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2,fR8=Math.min(1,nR8/mx8),fX8=Math.min(1-fR8,nX8/2);volgRessort(dt,fR8,fX8);const qB9=PAL.b('hudBarQ',200),w1=Math.round(VOLG.fR*qB9)*100/qB9,w2=Math.round(VOLG.fX*qB9)*100/qB9; // (2026-10-12) elle se remplit en RESSORT
     if(loop._nw1!==w1){loop._nw1=w1;elNR.style.width=w1+'%';}
     if(loop._nw2!==w2){loop._nw2=w2;elNX.style.width=w2+'%';}
     const pl=(nR8+nX8)>=mx8-.01;
     if(loop._npl!==pl){loop._npl=pl;elNR.parentNode.classList.toggle('plein',pl);if(elNB)elNB.classList.toggle('plein',pl);}
     {const inf=pwrNitroT>0;if(loop._ninf!==inf){loop._ninf=inf;elNR.parentNode.classList.toggle('inf',inf);if(elNB)elNB.classList.toggle('inf',inf);}} // (2026-09-28) le bouton NITRO porte l'état lui aussi (violet)
     // LA JAUGE VIT : elle file quand on boost (rayures qui défilent, halo), vire au bleu en réserve, clignote rouge à sec
     {const st=(nitroOn?(nitroBlue?'bleu':'boost'):'')+((nR8+nX8)<.35?' bas':'');
      if(loop._nst!==st){loop._nst=st;const nb=elNR.parentNode;nb.classList.toggle('boost',nitroOn&&!nitroBlue);nb.classList.toggle('bleu',nitroOn&&nitroBlue);nb.classList.toggle('bas',(nR8+nX8)<.35);
       if(elNB){elNB.classList.toggle('bleu',nitroOn&&nitroBlue);elNB.classList.toggle('bas',(nR8+nX8)<.35);}}} // (2026-09-28) …et le bouton NITRO : réserve bleue, à sec
     // L'ANNEAU DU BOUTON NITRO : la même réserve, en arc autour du pouce
     const qN9=PAL.b('hudNitroQ',100),r9=Math.round(Math.min(1,nR8/mx8)*qN9)/qN9,x9=Math.round(Math.min(1,nX8/2)*qN9)/qN9; // (2026-10-24, passe perf) par crans de 1/qN9 (voir hudNitroQ)
     if(elNB&&(loop._nbr!==r9||loop._nbx!==x9)){loop._nbr=r9;loop._nbx=x9;elNB.style.setProperty('--nr',r9);elNB.style.setProperty('--nx',x9);}}
    try{nx3Tick(dt,speedKmh);}catch(e){loopWarn(256,'nitro',e);}
    try{ajTick(dt);}catch(e){loopWarn(512,'jauge aura',e);} // (2026-10-12, Léo) LA JAUGE D'AURA (le flow passe en petit dessous) // (2026-10-12, Léo) LE BOUTON NITRO v3 : l'éclair en pixels qui s'enfonce, la vitesse à droite de la barre de boost
    // chip des POUVOIRS actifs : compte à rebours coloré au-dessus de la jauge nitro
    let pch='';
    // (2026-09-26, user : « le power-up affiché EN GROS avec un timer en temps réel ») : une plaque par pouvoir — bâtie quand la liste change,
    // puis mise à jour à CHAQUE image (le minuteur au dixième, la jauge en continu, le clignotement de la fin)
    // (pouvoirs v2) les plaques naissent de la fiche (PWR_DEFS : px, plq) dans l'ordre fixe PWR_ORDRE — (2026-09-28) pendant l'auto-école,
    // l'airtime est PRÊTÉ par la leçon : pas de plaque « AIR MAX » pour un pouvoir jamais ramassé (pwrVu)
    const pwL=loop._pwL||(loop._pwL=[]);let nPw=0;for(const k9 of PWR_ORDRE)if(pwrVu(k9)){const d9=PWR_DEFS[k9],r9=pwL[nPw]||(pwL[nPw]=[0,0,0,0]);r9[0]=k9;r9[1]=pwrT(k9);r9[2]=d9.px;r9[3]=d9.plq;nPw++;}pwL.length=nPw; /* (OPTIMISATION) la liste et ses rangs sont gardés d'une image à l'autre (plus d'allocation par image) */ // (2026-10-14, passe perf mobile) le libellé (traduction + normalisation NFD) ne se calcule plus à chaque image : seulement quand la plaque se bâtit
    for(let j9=0;j9<pwL.length;j9++)pch+=pwL[j9][0]; // (2026-10-14, passe perf mobile) la même clé, sans map + fermeture + join par image
    if(pch!==loop._pch){loop._pch=pch;
      pwrChip.innerHTML=pwL.map(function(x){return '<div class="pw" data-k="'+x[0]+'" style="--pc:'+PWR_DEFS[x[0]].tint+'">'+pxi(x[2])+'<span><small>'+sansAcc(TR(x[3]))+'</small><b>0.0</b></span><u></u></div>';}).join('');
      pwrChip.style.display=pch?'block':'none';pwrChip.classList.toggle('pw3',pwL.length>=3);loop._pwEl=Array.prototype.slice.call(pwrChip.querySelectorAll('.pw'));hudReveil('pwrChip');} /* un pouvoir de plus : le HUD discret le rallume */
    if(loop._pwEl)for(let j=0;j<pwL.length&&j<loop._pwEl.length;j++){const el=loop._pwEl[j],t9=pwL[j][1],tx=t9.toFixed(1);
      if(el._t!==tx){el._t=tx;el.querySelector('b').textContent=tx+'s';}
      el.style.setProperty('--p',Math.min(1,t9/PWR_DEFS[pwL[j][0]].t).toFixed(3));const f9=t9<1.5*(pwL[j][0]==='a'?pwrAirK():1); /* (2026-09-30) AIR MAX au sol s'use au quart : il clignote dans sa DERNIÈRE seconde et demie réelle */if(el._f!==f9){el._f=f9;el.classList.toggle('fin',f9);}
      const x9=t9>PWR_DEFS[pwL[j][0]].t+.05;if(el._x!==x9){el._x=x9;el.classList.toggle('cumul',x9);}} // (pouvoirs v2) cumulé au-delà d'une durée : la jauge déborde (pleine) et la plaque le montre
    {const sp9=airPie.style.display==='block';if(sp9!==loop._psp){loop._psp=sp9;pwrChip.classList.toggle('sousPie',sp9);}}
    {const k9=(mode==='boom'||gameOver)?'':pwrNitroT>0?'n':pwrSpdT>0?'v':pwrAurT>0?'x':pwrMagT>0?'m':pwrAirT>0&&!TUTO.on?'a':''; // (HUD v3) les BORDS de l'écran battent à la couleur du pouvoir actif — (2026-09-28) pas l'airtime prêté par l'auto-école · (pouvoirs v2) le plus « chaud » d'abord
     if(k9!==loop._pfx){loop._pfx=k9;let e9=avE('pwrFx');if(!e9){e9=document.createElement('div');e9.id='pwrFx';e9.setAttribute('aria-hidden','true');document.body.appendChild(e9);avEl.pwrFx=e9;}
       if(k9){e9.style.setProperty('--pf',PWR_DEFS[k9].bd||PWR_DEFS[k9].fx);e9.style.setProperty('--pf2',PWR_DEFS[k9].bd2||PWR_DEFS[k9].fx2);} /* (2026-10-14, passe graphismes) bd/bd2 = le voile dosé (÷ 2,5) */e9.classList.toggle('on',!!k9);}}
    if(pwrNitroT>0&&!(mode==='boom'||gameOver)){const e9=avE('pwrFx');if(e9&&Math.abs(NINF.h-(loop._pfh||0))>.012){loop._pfh=NINF.h;const r9=NINF.rgb;e9.style.setProperty('--pf','rgba('+r9[0]+','+r9[1]+','+r9[2]+','+(.2+.18*NINF.h).toFixed(3)+')');e9.style.setProperty('--pf2','rgba('+r9[0]+','+r9[1]+','+r9[2]+','+(.08+.12*NINF.h).toFixed(3)+')');}} // (2026-10-20, piment) les bords d'écran de la nitro infinie suivent la TEMPÉRATURE du feu : discrets au début, plus forts ensuite
    // JAUGE DE PROGRESSION — elle suivait le cash vers la prochaine VOITURE ; les voitures ne se
    // gagnent plus à l'argent de la partie. Elle suit désormais les PIÈCES vers le prochain MOTEUR,
    // la seule progression qui court pendant une partie. (elCp, le texte, est géré plus haut.)
    {const iT=Math.min(engTier,ENGINE_TIERS.length-1),
       prevT=ENGINE_TIERS[iT].coins,nextT=(ENGINE_TIERS[iT+1]||ENGINE_TIERS[iT]).coins;
     const w9=(iT>=ENGINE_TIERS.length-1?100:Math.round(1000*Math.min(1,(coinsGot-prevT)/Math.max(1,nextT-prevT)))/10)+'%';
     if(loop._fiW!==w9){loop._fiW=w9;elFill.style.width=w9;}} // (perf) écrite seulement quand elle bouge d'un pour-mille
    if(fever>0)fever-=dt;
    else if(feverArmed){styleM=Math.max(0,styleM-2*dt);if(styleM<=0)feverArmed=false;} // armé : la jauge FUIT — sers-toi ou perds-le
    else styleM=Math.max(0,styleM-13*dt); // LÂCHER le boost fait retomber la jauge vite : c'est « sans lâcher » qui paye
    survTick(dt); // SURVIVANT : la meute roule, saute, et le couperet de la minute tombe
    AIP.tick(dt); // …et pendant ce temps, les IA T'OBSERVENT (même hors mode Survivant)
    evtTick(dt); // (2026-10-14, GAMEPLAY) LES ÉVÉNEMENTS RARES : la caisse-nuage — par surprise, une fois par partie au plus
    if(!PARK.on&&LVL.cur&&(LVL.cur.id==='orage'||LVL.cur.orage))orageTick(dt); /* (2026-10-13) + l'ORAGE du mode classique, sur la ville et la jade */ // (2026-09-29) L'ORAGE du mode principal : les éclairs du niveau 9 (ECL) — l'éclair RÉVÈLE : il ouvre la brume (CAMP_FOG), le tonnerre suit ; remis à zéro à chaque piste par campDebut
    { // (perf, lot 4) la jauge de style : écrite seulement quand elle change (classe au changement d'état, largeur au pour-mille)
     const cl9=fever>0?'fever':feverArmed?'armed':'',w9=(Math.round((fever>0?Math.min(1,fever/10)*100:styleM)*10)/10)+'%';
     if(elStyleF.className!==cl9)elStyleF.className=cl9;if(loop._stW!==w9){loop._stW=w9;elStyleF.style.width=w9;}}
    if(fever>0){if(feverGlow.style.display!=='block')feverGlow.style.display='block';if(feverGlow.className)feverGlow.className='';}
    else{
      // ARMÉ : le halo s'allume DÈS que la jauge est pleine — c'est lui qui réclame le double-tap
      {const d9=feverArmed?'block':'none';if(feverGlow.style.display!==d9)feverGlow.style.display=d9;}
      if(feverGlow.className!==(feverArmed?'armed':''))feverGlow.className=feverArmed?'armed':'';}
    if(comboT>0){comboT-=dt;if(comboT<=0)combo=0;}
    if(msgT>0){msgT-=dt;if(msgT<=0)elMsg.style.opacity=0;}
  } }catch(err){window.__loopErr=err.message+' | '+(err.stack||'').split('\n').slice(0,3).join(' ¶ ');if(!loop._warned){console.error('loop error',err);loop._warned=true;}}
  // ciel : dôme, soleil « 1.61 », lueur d'horizon et rayons crépusculaires suivent la caméra
  vhdBascule((!garageOn||(!!gEl&&!gEl.classList.contains('quiet')&&!GAR.go))&&(!started||(gameOver&&!!PAL.b('vhdMort',1)&&!PCM_ON)||MENUV.retour)&&!(typeof stallOn!=='undefined'&&stallOn)); // (2026-09-28) l'ACCUEIL en haute définition — tant que la vitrine tourne (voir VHD) — (2026-10-10, Léo : « assure-toi que la voiture soit de bonne qualité dans le menu ciel et tout ») depuis le 30/09 l'accueil EST le garage (mode menu, le ciel) : `!garageOn` éteignait la HD sur tout l'accueil et le garage — mesuré : DPR 1, ombre 1024, aniso 4, la qualité de course. Allumée désormais au menu et à l'atelier, hors course (ni le garage « quiet » du départ rapide, ni l'envol GAR.go)
  if(garageOn)garageRender(dt);
  else if(!started||MENUV.retour)menuVitrine(dt); else if(MENUV.bio)menuVitrineFin(); // L'ACCUEIL (au couchant — rendu au niveau dès qu'on le quitte) : la caisse en vitrine sur la route de la ville // GARAGE : place la caisse + oriente la caméra AVANT que le ciel suive
  else if(stallOn)stallRender(dt); // ÉTAL : même showroom, mais c'est un fruit qui tourne
  try{nyanTick(dt);}catch(e){loopWarn(32,'chat pop-tart',e);}
  try{atchTick(dt);}catch(e){loopWarn(4096,'atchoum',e);} // (2026-10-06) ATCHOUM crache et éternue (voir atchTick) // (2026-10-06) le pas du GIF et l'arc-en-ciel du chat (voir nyanTick)
  skyDome.position.copy(camera.position);
  skyU.uTime.value=t;
  skyU.uVille.value=LVL.ville;skyU.uPluie.value=Math.max(LVL.pluie,LVL.brume);skyU.uFogCol.value.copy(scene.fog.color);skyU.uCam.value.copy(camera.position); // LE CIEL DE LA VILLE
  if(!nuageChaud&&t>2.6)nuageChauffe(); // (2026-09-26) les deux programmes de nuage (endroit / dedans) compilés au menu
  {const rY9=CITY.n&&CITY.n.routeY,vy9=rY9?Math.max(-.3,Math.min(.12,((rY9[0]+rY9[1])*.5-70-camera.position.y)/3500)):skyU.uVilleY.value;skyU.uVilleY.value+=(vy9-skyU.uVilleY.value)*Math.min(1,dt*2);} // (2026-09-26) la skyline peinte suit l'altitude des toits (voir villeCiel)
  // (2026-09-26) éteints = plus dessinés : le sprite additif du soleil couvre 2 000 unités, même à opacité nulle il se paie (garage et étal gardent la main)
  if(!garageOn&&!stallOn){sunSprite.visible=sunSprite.material.opacity>.02;horizonGlow.visible=horizonGlow.material.opacity>.02;for(const r9 of RAYS)r9.visible=r9.material.opacity>.002;}
  if(acesPass){ // EFFETS DE VITESSE (aberration + flou radial + tunnel) — SUR LE BOOST, pas sur le simple fait d'avancer
    const volK9=mode==='fall'?.5:mode==='boom'?0:1; // (2026-09-29, passe « jeu pro » — deux critiques : la moitié de l'image étalée en vol, la lune en copies à la mort) : EN VOL on VISE la réception, à la MORT on regarde
    const sfxT=(running&&!gameOver&&!REDUCED_MOTION&&FLOU_OK)?Math.max(ORBFX.warp*.95,Math.min(1,(nitroOn?0.72:0)+Math.min(1,boost)*0.6+(CAM_HEROS.on&&mode==='drive'?CAM_HEROS.flou*THREE.MathUtils.clamp((speedKmh/Math.max(1,vCroisiere())-.7)/.8,0,1):0))*volK9):0; /* (CAM_HEROS) un voile de flou sur les BORDS en croisière rapide : la vitesse se lit sans ouvrir le champ */ // (2026-09-28) + le TUNNEL de l'orbite // rouler normalement = image nette ; booster = ça FUSE
    loop._sfx=(loop._sfx||0)+(sfxT-(loop._sfx||0))*Math.min(1,dt*(sfxT>(loop._sfx||0)?7:mode==='boom'?9:3)); // montée franche, retombée douce (sèche à l'explosion)
    acesPass.uniforms.uSpeed.value=loop._sfx;acesPass.uniforms.uJit.value=(acesPass.uniforms.uJit.value+.618034)%1;
    if(loop._sfx>.004)postCaisse(acesPass.uniforms); /* LA CAISSE RESTE NETTE : le centre et le disque net du flou suivent la caisse à l'écran */
    renderer.getDrawingBufferSize(acesPass.uniforms.uRes.value);acesPass.uniforms.uRes.value.set(1/Math.max(1,acesPass.uniforms.uRes.value.x),1/Math.max(1,acesPass.uniforms.uRes.value.y)); // la taille d'un texel pour le FXAA (suit la résolution adaptative)
  }
  lvlPlanete(dt); // la planète tient sa place dans le ciel — et en ORBITE elle passe sous la route (voir NIVEAUX)
  try{canyonSoleil();}catch(e){loopWarn(131072,'canyon soleil',e);} // (2026-10-14) LE CANYON : le soleil de l'heure (SUN_DIR0 partout ailleurs, au bit près)
  try{orbiteTick(t);}catch(e){window.__orbErr=e;} // (vague 3) …la lune, les Starlink et la lumière de l'orbite (invisibles ailleurs)
  pluieTick(t);   // la pluie de la VILLE tombe autour de la caméra (invisible ailleurs)
  planetGroup.userData.globe.rotation.y=t*.014;                                 // …et tourne lentement sur son axe
  sunSprite.position.copy(camera.position).addScaledVector(SUN_DIR,3600);
  sunSprite.userData.chif.material.opacity=Math.min(1,sunSprite.material.opacity*1.6)*(1-Math.min(1,skyU.uJour.value)); /* (2026-09-30, niveau 1 v2) au JOUR D'ALTITUDE le soleil est un astre, pas un logo : les chiffres « 1.61 », lus comme un bug au-dessus de la mer de nuages (capture de Sacha), s'effacent — les autres niveaux les gardent */ // (vague 2) les chiffres d'or suivent le halo du biome, mais NETS : pleins dès .62
  horizonGlow.position.copy(camera.position).addScaledVector(SUN_DIR,3650);
  horizonGlow.position.y-=GLOW_DROP;
  for(let r9=0;r9<RAYS.length;r9++){
    RAYS[r9].position.copy(camera.position).addScaledVector(SUN_DIR,3500).addScaledVector(SUN_PERP,RAY_OFF[r9]);
    RAYS[r9].position.y+=RAY_LIFT;
  }
  if(!sunSprite.parent){scene.add(sunSprite);scene.add(horizonGlow);for(const r9 of RAYS)scene.add(r9);}
  // fenêtre d'ombre : le soleil suit la caisse, snappé au texel dans le plan lumière (zéro scintillement en roulant)
  const ts9=68/sun.shadow.mapSize.x;
  L_PERP.crossVectors(L_DIR,ORB.haut).normalize();L_UP.crossVectors(L_PERP,L_DIR).normalize(); // (2026-09-27) la fenêtre d'ombre suit LA lumière du niveau : le couchant (L_DIR = SUN_DIR, au bit près) ou le soleil de l'ORBITE (posé par orbiteLumiere)
  shadV.copy(carGroup.position);
  shadV.addScaledVector(L_PERP,Math.round(shadV.dot(L_PERP)/ts9)*ts9-shadV.dot(L_PERP));
  shadV.addScaledVector(L_UP,Math.round(shadV.dot(L_UP)/ts9)*ts9-shadV.dot(L_UP));
  sun.target.position.copy(shadV);
  sun.position.copy(shadV).addScaledVector(L_DIR,160);
  sun.target.updateMatrixWorld();
  // rim golden hour : direction de LA source du niveau en espace vue (soleil le jour, néon du kick la nuit : RIM_DIR/RIM_C0, posés par bioApply) + teinte par état
  {const nf9=GFX_U.uNearF.value,v9=mode==='fall'?1:0;nf9.x+=((v9?30:10)-nf9.x)*Math.min(1,dt*3);nf9.y+=((v9?110:40)-nf9.y)*Math.min(1,dt*3);} // en VOL, le coton s'efface plus loin de l'objectif : la réception se lit
  {const fk9=mode==='fall'?1:0;loop._rimF=(loop._rimF||0)+(fk9-(loop._rimF||0))*Math.min(1,dt*(fk9?5:2.5)); // (2026-09-29, passe « jeu pro ») EN VOL la caisse se DÉTACHE : le liseré ×1,9
   RIM_U.uRimStr.value=RIM_S0*(1+.9*loop._rimF);} // — vue de dessous, sur les fenêtres de la VILLE ou le noir de l'ORBITE, elle n'était plus qu'une silhouette sombre
  RIM_U.uSunV.value.copy(RIM_DIR);if(LVL.espace>.001)RIM_U.uSunV.value.lerp(ORB.terre,LVL.espace).normalize(); // (2026-09-27) en ORBITE le liseré vient de la TERRE : la silhouette s'ourle du bleu de la planète
  RIM_U.uSunV.value.transformDirection(camera.matrixWorldInverse);
  GFX_U.uUpV.value.set(0,1,0).transformDirection(camera.matrixWorldInverse); // (Dragons) le haut en espace vue : ventre lavande / flancs bleu ciel
  if(fever>0)RIM_U.uRimC.value.setHex(0xffc55e);
  else if(nitroOn)RIM_U.uRimC.value.setHex(nitroBlue?(0xb9c5dc):0xffb886); // (vague 3) la caisse prend le liseré de SA flamme (il était cyan : un néon, pas la nitro de la bible)
  else{RIM_U.uRimC.value.copy(RIM_C0);if(LVL.espace>.001)RIM_U.uRimC.value.lerp(ESP_RIM,LVL.espace);}
  updateContactShadow();
  carVit(dt); // (2026-09-26) roues, flou de jante, halos des phares et des feux (frein)
  // MUSIQUE + CRÉATURES : hors du try/catch gameplay → protégés à part pour ne jamais casser le rendu
  // mouvement 0..1 : le filtre suit la VITESSE en parallèle — on ralentit, le son se referme progressivement (plein vers ~65 % vmax)
  const musMvt=(running&&!gameOver)?Math.max(0,Math.min(1,(speedKmh/Math.max(1,vmaxShow()))/0.65)):0;
  // MINI-AILES : déployées en vol, repliées au sol (lissé)
  if(carWingL){const tgt=((mode==='fall'&&!garageOn)||(garageOn&&(SHOP.tab==='aile'||(INV&&INV.on&&INV.cat==='aile')))||!!(AILV.force&&AILV.force.ouvre))?1:0; /* (banc) dbgAilesForce({ouvre:1}) : dépliées en roulant */ // boutique, onglet AILES : on les montre ouvertes
    wingT+=(tgt-wingT)*Math.min(1,dt*6);
    const sc=.05+.95*wingT;carWingL.scale.x=sc*(carWingL.userData.k||1);carWingR.scale.x=sc*(carWingR.userData.k||1); // RÉTRACTÉES dans la caisse au sol → DÉPLOYÉES en vol (fini les ailerons parasites)
    carWingL.rotation.z=.16*wingT;carWingR.rotation.z=-.16*wingT;  // léger dièdre de planeur une fois sorties
    if(carWingL.userData.recale){carWingL.userData.recale();carWingR.userData.recale();} // (2026-10-18) SANS AILES : les buses annulent l'étirement et le dièdre du pivot (voir AILES_POP.air)
    /* (2026-10-13, Léo : « ces barres chelou blanches et d'autres couleurs, check chaque voiture ») RENTRÉES, ELLES DISPARAISSENT : écrasées à
       5 % de leur largeur, les ailes restaient un panneau de 8 cm × 1,5 m à la couleur d'ACCENT de la caisse, posé à mi-hauteur du flanc — tant
       que la coque était large, il y était caché ; depuis que les vitres rentrent (les vrais modèles), il sortait à travers la ceinture et les
       vitres en BARRE blanche, crème, rose… Repliées, on ne les dessine plus du tout. */
    const vu9=wingT>.04;if(carWingL.visible!==vu9){carWingL.visible=vu9;carWingR.visible=vu9;}}
  // COMÈTE : la caisse BRÛLE en permanence — la boucle est bouclée, on repart en feu (les 3 derniers paliers la gardent allumée)
  if(engTier>=ENG_CAP.comete&&running&&!gameOver&&mode!=='boom'){
    const p9=carGroup.position;
    for(let k=0;k<2;k++)if(Math.random()<dt*30)
      spawnP(k?flames:flameCore,p9.x+(Math.random()-.5)*1.7,p9.y+.25+Math.random()*.9,p9.z+(Math.random()-.5)*2.4,
        (Math.random()-.5)*3.5,2.5+Math.random()*4.5,(Math.random()-.5)*3.5,.2+Math.random()*.22);
    if(Math.random()<dt*10)spawnP(embers,p9.x+(Math.random()-.5)*2,p9.y+.4,p9.z+(Math.random()-.5)*2.6,
        (Math.random()-.5)*4,3+Math.random()*5,(Math.random()-.5)*4,.5+Math.random()*.4);
  }
  /* ---- ON BRICOLE SOUS LE CAPOT : le changement de palier se voit SUR LA CAISSE ----
     Le message texte disait ce qui se passait, rien ne le MONTRAIT. Ici une gerbe d'étincelles de
     soudure jaillit du capot pendant que la clé à chocs tourne — c'est ce qui fait comprendre en
     périphérie, sans lire, qu'on vient de monter autre chose.
     ⚠ elles partent du CAPOT (devant l'habitacle) et non du centre de la caisse : au centre on
     croirait à une explosion, à l'avant on lit un atelier. Débit fort au début puis qui retombe,
     calé sur la même courbe que le son (la visseuse ralentit, les étincelles se raréfient). */
  /* ---- LA SCÈNE EN TROIS TEMPS. C'est la structure qui fait la satisfaction, pas la quantité
     d'effets : on MONTE (bruit d'atelier, étincelles), la pièce SE POSE (le creux, le clank), puis
     on RÉVÈLE (l'onde s'ouvre, la caisse s'illumine, les étincelles montent en spirale). Sans le
     temps mort de la pose, la révélation n'arrive de nulle part et ne récompense rien. */
  if(engSwapT>0&&running&&!gameOver&&mode!=='boom'){
    const p8=carGroup.position,q8=engSwapT/T_SWAP,u8=1-q8;
    sw1.set(1,0,0).applyQuaternion(carGroup.quaternion);   // droite de la caisse
    sw2.set(0,1,0).applyQuaternion(carGroup.quaternion);   // son HAUT — c'est lui qui fait que
    sw3.set(0,0,1).applyQuaternion(carGroup.quaternion);   // tout marche aussi sous la dalle
    // ---- 1. LE MONTAGE : la soudure au CAPOT (jamais au centre : au centre on lit une explosion,
    // à l'avant on lit un atelier). Débit contenu et vie COURTE — c'est la BRIÈVETÉ qui fait
    // l'étincelle ; le premier réglage (70/s, .5 s de vie) noyait la caisse dans un nuage doré.
    const mo=Math.max(0,1-u8/.40),V8=PT_U.uVc.value; // (2026-09-28) V8 : la VRAIE vitesse de la caisse — lancées sur place pendant qu'elle file à 40 m/s,
    if(Math.random()<dt*24*mo*mo)                    // la soudure et la spirale restaient 12 m derrière en 0,3 s : une traînée qu'on ne lisait pas
      spawnP(sparkGold,
        p8.x+sw3.x*1.5+(Math.random()-.5)*.5, p8.y+.60+Math.random()*.18, p8.z+sw3.z*1.5+(Math.random()-.5)*.5,
        V8.x+(Math.random()-.5)*5, V8.y+2.6+Math.random()*3.4, V8.z+(Math.random()-.5)*5, .12+Math.random()*.12);
    if(Math.random()<dt*5*mo*mo)
      spawnP(embers,p8.x+sw3.x*1.4,p8.y+.58,p8.z+sw3.z*1.4,
        V8.x+(Math.random()-.5)*3,V8.y+1.4+Math.random()*2,V8.z+(Math.random()-.5)*3,.18+Math.random()*.16);
    // ---- 3. LA RÉVÉLATION (la pose, elle, est un SILENCE visuel : le creux de la vignette)
    if(u8>.38){
      const rv=Math.min(1,(u8-.38)/.44);
      // L'ONDE : elle s'ouvre VITE puis freine (racine), comme une onde de choc qui perd son
      // énergie. À vitesse constante on lirait un cerceau qu'on écarte à la main.
      const ray=.5+Math.sqrt(rv)*3.8; // (v5) 5 → 3,8 m : au sol la caméra colle la caisse, l'onde couvrait la moitié de l'écran
      swapRing.visible=true;
      swapRing.position.set(p8.x+sw2.x*.10,p8.y+sw2.y*.10,p8.z+sw2.z*.10);
      swapRing.quaternion.copy(carGroup.quaternion);swapRing.rotateX(-Math.PI/2);
      swapRing.scale.set(ray,ray,1);
      swapRing.material.opacity=.95*(1-rv)*(1-rv);
      // LE FLASH : il tape d'un coup à la pose et retombe. La lumière sur la CAISSE est ce qui
      // fait que la scène se passe dans le monde et pas dans le HUD.
      const fl=Math.exp(-rv*5.2);
      swapLight.position.set(p8.x+sw2.x*.8,p8.y+sw2.y*.8,p8.z+sw2.z*.8);
      swapLight.intensity=3.4*fl;
      // LA SPIRALE : les étincelles TOURNENT autour de la caisse en montant. Un jet vertical ne
      // dirait rien ; c'est la rotation qui raconte « on visse, c'est fini, ça brille ».
      for(let k=0;k<2;k++)if(Math.random()<dt*46*(1-rv*.55)){
        const an=rv*13+k*3.14+Math.random()*.4, r9=1.55-rv*.45, h9=rv*2.3+Math.random()*.35;
        const cx=Math.cos(an)*r9,cz=Math.sin(an)*r9;
        spawnP(sparkGold,
          p8.x+sw1.x*cx+sw3.x*cz+sw2.x*h9, p8.y+sw1.y*cx+sw3.y*cz+sw2.y*h9+.2, p8.z+sw1.z*cx+sw3.z*cz+sw2.z*h9,
          V8.x+sw2.x*3.2-sw1.x*cz*.9, V8.y+sw2.y*3.2+2.0, V8.z+sw2.z*3.2-sw1.z*cz*.9, .26+Math.random()*.20);
      }
    }
  }else if(swapRing.visible){swapRing.visible=false;swapLight.intensity=0;}
  juiceScreenTick(dt); // les taches de jus s'effacent, meme en pause
  fxTick(dt); // ⚠ hors du gate de sim : un refractaire fige en pause rejoue le son au retour
  /* (2026-09-30) UN try PAR APPEL : dans un seul bloc, une exception de musicTick ou de villeApres sautait les suivants — le banc de
     dauphins, le serpent et la BOULE DE FEU restaient figés en l'air. Chacun son filet, chacun son avertissement (une fois : loopWarn) */
  try{musicTick(dt,musMvt);}catch(e){loopWarn(1,'musique',e);}
  try{villeApres();}catch(e){loopWarn(2,'ville',e);}
  const mortS9=mortSaute(dt); // (2026-10-14, passe perf mobile) écran de mort, paliers ANCIEN et MOYEN : la scène n'est redessinée qu'une image sur N (voir mortSaute)
  /* (2026-10-14, passe perf mobile) …et sur une image SAUTÉE, l'AMBIANCE ne tourne pas non plus : dauphins, Paris, jade (lumières, eau, mer,
     monuments), grues ne font que de l'affichage — remplir des tampons et des uniformes pour une image qui n'est pas dessinée, c'est du
     processeur (et de la chaleur) pour rien. Leur temps est CUMULÉ (MORT_IMG.dt) et rendu à l'image dessinée suivante : mêmes vitesses.
     Borné à 0,1 s (2× le pas maximal de la boucle : 4 images à 60 i/s = 0,067 s).
     mortSaute est remontée ici depuis le rendu (rien entre les deux ne touche ce qu'elle lit : écran, toile, dprT, sonde). Palier RÉCENT :
     mortS9 toujours faux, dtA9 = dt — rien ne change. */
  let dtA9=dt;if(mortS9)MORT_IMG.dt=Math.min(.1,MORT_IMG.dt+dt);else if(MORT_IMG.dt>0){dtA9=Math.min(.1,MORT_IMG.dt+dt);MORT_IMG.dt=0;}
  try{updateBoomArt(dt);}catch(e){loopWarn(16,'boule de feu',e);}
  if(JADE.root&&!mortS9){jadeTick(dtA9);try{jadeSousTick(dtA9);}catch(e){loopWarn(16384,'sous la mer',e);}} // (2026-10-09) LES PICS DE JADE : lumières de la matière, vent des pins, brume
  try{jsgTick(dt);}catch(e){loopWarn(64,'singes de jade',e);}
  try{jdmTick(dt);}catch(e){loopWarn(1<<22,'dauphins de la mer',e);} // (2026-10-15, Léo) LES DAUPHINS DE LA MER DE JADE (au bout de 5 s dans l'eau ; sautent avec la caisse une fois sur deux) // (2026-10-15, Léo) LES SINGES DU SOLEIL DE JADE (décor : coucou, mangue, course, au bord)
  if(!mortS9)try{foretTick(dtA9);}catch(e){window.__foretErr=e;loopWarn(131072,'forêt',e);} // (2026-10-14) LA FORÊT NOIRE : lumière, météo, papillons, feux follets, le loup-garou, les voix du bois
  if(!mortS9)try{grotteTick(dtA9);}catch(e){window.__grotteErr=e;loopWarn(1<<26,'grotte',e);} // (2026-10-18) LES PROFONDEURS : les tranches, la lumière, la salle (son ambiance), les poussières
  if(!mortS9)try{banqTick(dtA9);}catch(e){window.__banqErr=e;loopWarn(524288,'banquise',e);} // (2026-10-14) LA BANQUISE : lumière, météo, traces, gerbes, flocons, aurores, le vent
  if(!JADE.geos)try{jadeGabFond();}catch(e){loopWarn(131072,'gabarits',e);} // (2026-10-14, OPTIMISATION) les gabarits de la jade, taillés au menu (voir LES GABARITS TAILLÉS AU MENU)
  try{cryptoTick(dt,running&&!paused&&!gameOver&&!BANC_FIGE);}catch(e){loopWarn(32768,'crypto',e);}
  try{vitreTick(dt,running&&!paused&&!gameOver&&!BANC_FIGE);}catch(e){loopWarn(8388608,'vitre',e);} // (2026-10-17) LA VILLE VITRÉE : les nuages et leur reflet, l'éclat du soleil, les bureaux la nuit // (2026-10-13) CRYPTO CITY : la lune ₿, les pièces, les fusées, les feux, l'ATH
  try{plaTick(dt,running&&!paused&&!BANC_FIGE);}catch(e){loopWarn(65536,'pluie d argent',e);} // (2026-10-13) LA PLUIE D'ARGENT v2
  try{canyonTick(dt);cyVautours(dt);}catch(e){loopWarn(262144,'canyon',e);}try{dunesTick(dt);}catch(e){loopWarn(33554432,'dunes',e);} /* (2026-10-18) LES DUNES D'OR : après canyonTick (l'ombre des crêtes sur la caisse) */ // (2026-10-14) LE CANYON DES GÉANTS : les lumières du relief, l'ombre des parois sur la caisse
  if((GRUE.L.length||JADE.root)&&!mortS9)grueTick(dtA9); // …et les vols de grues // (Paris) le scintillement et le phare
  try{lumTick(dt,speedKmh);}catch(e){loopWarn(1<<23,'lumières',e);} // (2026-10-17) LES LUMIÈRES DE LA CAISSE v2 : phares, feux, nitro, traînées (voir LUM_GLSL)
  if(mortS9){}else
  if(PCV.fen&&PORTV.att&&!PCV.copie){}else // (2026-10-17, 3e tour) l'image d'attente du passage : l'écran est COUVERT par la fenêtre recopiée — on ne dessine pas l'ancien monde pour rien
  if(POST_ON&&composer)composer.render(); // ACES + bloom
  else renderer.render(scene,camera);      // repli si le post n'a pas pu se charger
  if(window.__introPrise){const f9=window.__introPrise;window.__introPrise=null;try{f9(renderer.domElement);}catch(e){}} // (2026-10-22) l'intro du studio demande une photo de la scène 3D, prise ici, juste après son rendu (le tampon est encore plein) : les éclats de l'écran en font des loupes — voir moteur/intro-161.js
  if(PCV.copie&&!mortS9)pcCopie(); // (2026-10-17) LE PASSAGE PAR LA FENÊTRE : l'image qu'on traverse, recopiée APRÈS ce rendu (pas de rendu en plus)
  try{if(!mortS9)homeCielPrise(now);}catch(e){} // (2026-10-11) le CIEL DU MENU, recopié en vignette pour le HOME du garage (voir homeCielPrise)
  matSursisTick(); // (perf) les matières de la piste d'avant partent une fois la neuve rendue
  if(CHAUFFE_R.t&&now>CHAUFFE_R.t){CHAUFFE_R.t=0;jadeChauffeNiveau();chauffeRendu();ccConstr('chauffe');} // (tour 2) niveau neuf : la puce le voit une fois en entier, hors écran
  if(!started||gameOver)engChauffe(); // (perf) au menu et à l'écran de mort : les shaders des moteurs se préparent, un palier par image
  // VIGNETTE MOTEUR — RÉACTIVÉE (2026-08-02) : elle passe désormais par un RenderTarget dédié puis un
  // quad ortho recollé par-dessus. Elle ne touche plus au viewport de la passe finale — c'était ça,
  // la déformation de l'image. ⚠ APRÈS le composer, jamais avant : il écrase le framebuffer.
  try{engVigRender(dt);}catch(e){if(!loop._vigWarn){console.warn('vignette moteur',e);loop._vigWarn=1;}}
  if(PREB.on)prebTick(now); // (2026-10-17) LE PRÉ-BÂTI : la piste d'en face, quelques ms par image (voir PREB)
  if(CAD.ok)cadFin(now); // (2026-10-14, passe perf mobile) LA CADENCE STABLE : le travail de l'image et la décision 30/60 — voir CAD
  if(COUT.on)coutFin(); // (banc perf-iphone7)
  if(BANC_CB)window.__bancSync(); // (banc ?banc=1) la puce finit l'image, on relève le chrono
  else if(QLR.sN>0)qlSonde(); // (tour 2) la règle de qualité veut le VRAI coût d'une image avant de baisser quoi que ce soit
}
// ---------- INIT ----------
newTrack();
respawn();
setupIntroPig();
frameAt(0,F);
camera.position.copy(F.p).addScaledVector(F.t,-9).addScaledVector(F.n,4);
elRecord.textContent=TR('record : ')+fmt(best);
carSnapshot();   // photo des caisses DÉJÀ acquises : sans elle, le 1er scan les annoncerait toutes d'un coup
level=equippedCar();buildCar(CARS[level]); // on se présente au menu dans la caisse choisie au garage
paintMoney(); // LE MENU AFFICHE LA MISE : $1.61 visible AVANT de lancer (le HTML disait « $00000000 »)
paintCarHud(); // et la fiche de caisse porte le bon nom/palier dès l'écran d'accueil
applyLangDOM(); // la langue sauvegardée s'applique AU CHARGEMENT (elle ne prenait qu'en cliquant le sélecteur)
setBestChip();
renderLeaders(-1);
/* (2026-10-21, Léo : « une nouvelle intro beaucoup plus moderne et stylée pour le label 1.61, du style Xbox ou PlayStation ») l'intro est
   désormais celle de moteur/intro-161.js (blips, noir, gros logo qui casse l'écran). `?intro=ancien` rend celle d'avant, juste dessous. */
const INTRO_NEUVE=!/[?&]intro=ancien\b/.test(location.search);
(function(){ // ---------- INTRO STUDIO « 1.61 » : accumulation… battements… FISSION ----------
  const sp9=document.getElementById('splash');
  if(!sp9||INTRO_NEUVE)return;
  window.__intro='attente'; // (la mise à jour toute seule) l'écran titre attend son toucher : rien n'a sonné, on peut recharger
  const cv9=document.getElementById('fxCv'),ctx9=cv9.getContext('2d');
  const stage=document.getElementById('spStage'),num=document.getElementById('spNum'),
        ttl=document.getElementById('spTitle'),fl9=document.getElementById('spFlash');
  cv9.width=innerWidth;cv9.height=innerHeight;
  addEventListener('resize',function(){if(!done){cv9.width=innerWidth;cv9.height=innerHeight;}}); // (2026-10-14, chasse aux bugs) iPhone tourné sur l'écran titre : le canvas gardait l'ancienne taille, étiré par le CSS (poussière et halo écrasés) ; draw9 repose son style à chaque image
  let done=false,ph9=0,launched=false,iAC=null,master=null,tLaunch=0;
  const timers=[];const T9=(fn,ms)=>timers.push(setTimeout(fn,ms));
  const P9=[],RG=[];
  const CX=()=>cv9.width/2,CY=()=>cv9.height/2;
  for(let i=0;i<240;i++){ // poussière d'or : en dérive pendant le teaser, aspirée après le clic
    const a=Math.random()*Math.PI*2,r=Math.max(cv9.width,cv9.height)*(.5+Math.random()*.8);
    P9.push({x:CX()+Math.cos(a)*r,y:CY()+Math.sin(a)*r,s:.8+Math.random()*2.4,k:.012+Math.random()*.03,o:.4+Math.random()*.6,
      dx:(Math.random()-.5)*14,dy:(Math.random()-.5)*14});
  }
  // ⚠ \uFE0E : même raison que pour les jetons — sans lui macOS remplace ♥ ♣ ☠ ♦ par ses emoji couleur.
  const SYMS=[['$','#ffd75e'],['♥\uFE0E','#ff5e8a'],['♣\uFE0E','#54e07a'],['☠\uFE0E','#e8e8f0'],['€','#9ad8ff'],['¥','#ffc46b'],['1.61','#fff2be'],['♦\uFE0E','#ff9d2e']];
  function beat(k){ // battement de cœur du logo : pulsation + micro-flash + onde
    if(done)return;
    /* (2026-10-15) le battement faisait pulser « 1.61 »… encore INVISIBLE à ce moment-là (il ne se lève qu'après la fission, depuis l'ordre
       inversé) : les trois coups ne se voyaient pas. C'est CASH CAR, à l'écran, qui bat — `scale` (propriété à part : la pente skewX du
       logo reste intacte), un coup sec puis le retour, de plus en plus fort jusqu'à l'explosion. */
    try{if(ttl.animate&&document.documentElement.getAttribute('data-reduced-motion')!=='1')ttl.animate([{scale:'1'},{scale:String(1+.06*k),offset:.22},{scale:'1'}],{duration:340,easing:'cubic-bezier(.32,.72,0,1)'});}catch(e){}
    fl9.style.opacity=(.10*k);
    RG.push({r:30,v:900+k*300,w:3,a:.5,col:'255,214,110'});
    T9(function(){if(done)return;fl9.style.opacity=0;},130);
  }
  function fission(){ // TOUT explose EN MÊME TEMPS : cœurs, trèfles, dollars, crânes…
    if(done)return;
    ph9=1;
    fl9.style.opacity=1;
    ttl.classList.add('boom');   // ⚠ C'EST LE TITRE qui explose (ordre inverse) — meme classe, meme effet qu'avant
    P9.length=0;
    // ⚠ 120→70 ET LE `shadowBlur` PAR PARTICULE A SAUTÉ (2026-09-05, plainte du user : « ça lague »).
    // `ctx.shadowBlur` force une passe de flou À PART pour CHAQUE forme dessinée — à 120 glyphes/frame
    // c'est 120 passes de flou, chaque frame, pendant que le titre anime en même temps un `filter`
    // CSS tout aussi coûteux : deux effets chers au même instant, c'est ça le décrochage d'images.
    // Le halo est maintenant UNE SEULE dégradé radiale dessinée une fois par frame (voir plus bas),
    // pas 120 — l'ambiance reste, le coût s'effondre.
    for(let i=0;i<70;i++){
      const a=Math.random()*Math.PI*2,v=(160+Math.random()*820)*(Math.min(cv9.width,900)/900);
      const sy=SYMS[Math.floor(Math.random()*SYMS.length)];
      P9.push({x:CX(),y:CY(),vx:Math.cos(a)*v,vy:Math.sin(a)*v*.72,s:13+Math.random()*30,
        rot:Math.random()*6,vr:(Math.random()-.5)*5,sym:sy[0],col:sy[1],life:1.5+Math.random()*.9});
    }
    for(let i=0;i<3;i++)RG.push({r:10,v:1400-i*300,w:7-i*2,a:.9,col:i===1?'255,120,180':'255,224,150'});
    T9(function(){if(done)return;fl9.style.opacity=0;},130);
    // LA SIGNATURE SE LEVE DANS LA FUMEE, a la place exacte du titre : 1.61 GAMING apparait…
    T9(function(){if(done)return;num.classList.add('on');shakeStage(10);},300);
    // …et DISPARAIT avant que l'ecran ne s'ouvre. ⚠ elle s'efface, elle ne re-explose pas : deux
    // detonations de suite et la premiere ne vaut plus rien.
    T9(function(){if(done)return;num.classList.add('out');},2450);
  }
  function shakeStage(n){
    if(done)return;
    if(n<=0){stage.style.transform='';return;}
    stage.style.transform='translate('+((Math.random()-.5)*16)+'px,'+((Math.random()-.5)*16)+'px)';
    T9(function(){shakeStage(n-1);},34);
  }
  // ---- LANCEMENT : le son exige un geste utilisateur (politique navigateur) → teaser « CLIQUE » ----
  function kd9(){if(!launched&&!done)launch();}
  addEventListener('keydown',kd9);
  function launch(){
    if(launched||done)return;launched=true;tLaunch=performance.now();window.__intro='joue'; // l'intro passe : pas de rechargement
    ttl.classList.remove('tease');
    const nt=document.getElementById('spNote');
    if(nt)nt.style.display='none';
    T9(function(){ttl.classList.add('on');},60);   // CASH CAR se plante net, puis les trois coups montent
    T9(function(){beat(1);},1050);
    T9(function(){beat(1.35);},1650);
    T9(function(){beat(1.8);},2150);
    T9(fission,2650);
    T9(hide,(SAVE&&SAVE.d&&SAVE.d.tuto)?4600:6400); // (2026-09-26) 6,4 s à CHAQUE lancement : complète la 1re fois, écourtée ensuite
    /* (2026-10-06, Léo : « il y a encore des versions où l'intro CASH CAR qui explose : la musique commence même avant ça — il faut enlever
       COMPLÈTEMENT toute musique qui arrive avant le ciel ») : la composition de l'intro (accords « nombre d'or », compteuse qui monte,
       battements de cœur, sub) ne joue plus — l'intro est muette, la musique du lobby part avec le ciel (hide, 420 ms). */
    if(INTRO_SON)try{introSound();}catch(e){} // le son ne doit JAMAIS bloquer les visuels
  }
  // PAS de lancement auto : on attend le geste (seul moyen d'avoir le son — règle navigateur).
  // ⚠ LA PLAQUE ARRIVE EN 900 ms, PAS EN 4 s. L'ancien « CLIQUE » se faisait attendre quatre secondes
  // devant un écran noir : le joueur croyait que le jeu était planté. On ne fait pas mariner quelqu'un
  // devant la porte d'entrée — le nombre a le temps de respirer, et la plaque tombe juste derrière.
  T9(function(){if(!launched&&!done){
    const n=document.getElementById('spNote');if(n)n.classList.add('on');
  }},900);
  if(BALADE||SIMU_JEU)T9(hide,80); // (atelier des nuages) droit à l'écran titre, sans l'intro ni son clic — (2026-10-12) le simulateur aussi
  // ---- SOUND DESIGN « 1.61 » : tout est accordé sur le NOMBRE D'OR φ=1,618 ----
  // Échelle inouïe (intervalles de φ : ni octaves ni quintes — le son littéral de 1.61),
  // compteuse à billets en guise de riser, sub qui bat à 0,618 Hz, jackpot de pièces à la fission.
  /* (2026-10-07, Sacha : « pour l'animation 1.61 au début, il n'y a plus le son ») : la composition REVIENT — Léo l'avait coupée la nuit du
     6/10 (c135414, « plus aucune musique avant le ciel »). La musique du LOBBY, elle, part toujours avec le ciel (hide) ; ici, c'est
     le sound design de l'intro, qui s'éteint en fondu quand le voile s'ouvre. false = l'intro muette de Léo. */
  /* (2026-10-16, pôle SON — Léo, sur l'appli : « c'est quoi cette première musique de merde ? » puis « il faut que la musique ne commence qu'au
     menu ciel ») MESURÉ au banc muet, du toucher de l'écran titre au ciel : la SEULE chose qui sonne avant le ciel, c'est cette composition
     (4,5 s, jusqu'à −14 dB, quand la musique du ciel part à −40). Les deux demandes tiennent ensemble : l'animation GARDE SON SON (Sacha, 7/10)
     mais plus une NOTE — on garde les bruitages (le clic, la compteuse à billets, les spirales de souffle, les coups de cœur, l'aspiration, le
     canon de la fission, l'impact du titre : tout ce qui chute en hauteur) et on retire tout ce qui CHANTE (les tintements sur l'échelle d'or,
     la poussière d'or, le double sub qui tient sa note, l'accord des battements, le chœur de la fission, la pluie de pièces accordée, l'accord du
     titre, la nappe de traîne). La musique ne commence qu'au ciel. `?intro=musique` = la composition entière (celle du 7/10), `?intro=muet` =
     l'intro muette (celle du 6/10). */
  const INTRO_SON=/[?&]intro=muet\b/.test(location.search)?0:/[?&]intro=musique\b/.test(location.search)?2:1, INTRO_NOTES=INTRO_SON===2;
  function introSound(){
    if(!SND.sfx||!(VOL.sfx>0))return; // mute SON : l'intro reste muette aussi — (2026-09-28) et le curseur EFFETS à zéro aussi
    try{iAC=(function(){const C=window.AudioContext||window.webkitAudioContext;try{return new C({sampleRate:48000});}catch(e){return new C();}})();}catch(e){return;}
    const A=iAC;try{A.resume();}catch(e){}
    const t0=A.currentTime+.05,PHI=1.6180339;
    const phi=k=>110*Math.pow(PHI,k); // l'échelle d'or : 110·φ^k
    const comp=A.createDynamicsCompressor();
    /* (2026-09-28) L'INTRO OBÉIT AU CURSEUR EFFETS. Elle vit dans son propre contexte, branché en direct sur la sortie : le bus
       MASTER (qui porte `VOL.sfx`) ne la voyait pas. Le volume se pose APRÈS le compresseur — posé avant, il changerait la dose de
       compression, donc le son lui-même ; après, c'est un vrai bouton de volume, et à 100 % rien ne bouge. */
    const vol9=A.createGain();vol9.gain.value=(typeof sfxVol==='function'?sfxVol():VOL.sfx);vol9.connect(A.destination);
    comp.threshold.value=-14;comp.ratio.value=5;comp.connect(vol9);
    master=A.createGain();master.gain.value=1;master.connect(comp);
    const nzBuf=(function(){const n=A.sampleRate*2,b=A.createBuffer(1,n,A.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=Math.random()*2-1;return b;})();
    const pan=x=>{const p=A.createStereoPanner?A.createStereoPanner():A.createGain();if(p.pan)p.pan.value=x;return p;};
    function tone(f0,f1,t,dur,vol,type,px){ // ton glissant enveloppé
      if(!INTRO_NOTES&&f1&&f1/f0>.9)return; // (2026-10-16) une NOTE (hauteur tenue) : seulement avec ?intro=musique — les coups qui chutent (×0,2 à ×0,35) restent
      const o=A.createOscillator(),g=A.createGain(),p=pan(px||0);
      o.type=type||'sine';
      o.frequency.setValueAtTime(Math.max(1,f0),t0+t);
      if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t0+t+dur);
      const atk=Math.min(.012,dur*.4);
      g.gain.setValueAtTime(0,t0+t);g.gain.linearRampToValueAtTime(vol,t0+t+atk);
      g.gain.exponentialRampToValueAtTime(.0008,t0+t+dur);
      o.connect(g);g.connect(p);p.connect(master);
      o.start(t0+t);o.stop(t0+t+dur+.06);
    }
    function puffN(t,dur,vol,type,f,f1,q,px){ // souffle filtré
      const s=A.createBufferSource();s.buffer=nzBuf;s.loop=true;
      const fl=A.createBiquadFilter();fl.type=type;fl.Q.value=q||1;
      fl.frequency.setValueAtTime(f,t0+t);
      if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t0+t+dur);
      const g=A.createGain(),p=pan(px||0);
      const atk=Math.min(.02,dur*.5);
      g.gain.setValueAtTime(0,t0+t);g.gain.linearRampToValueAtTime(vol,t0+t+atk);
      g.gain.exponentialRampToValueAtTime(.0008,t0+t+dur);
      s.connect(fl);fl.connect(g);g.connect(p);p.connect(master);
      s.start(t0+t);s.stop(t0+t+dur+.06);
    }
    // 0) ALLUMAGE : le CLIC sonne immédiatement — pièce d'or + whoosh + thump
    tone(phi(5),phi(5),.02,.55,.20,'triangle',.2);
    tone(phi(6),phi(6)*.99,.06,.6,.12,'sine',-.2);
    tone(phi(3),phi(3),.02,.7,.14,'sine');
    puffN(.02,.5,.18,'bandpass',900,2600,1.5);
    tone(150,46,.02,.45,.34);
    // 1) LA COMPTEUSE À BILLETS : frottements de papier qui s'accélèrent (le riser)
    let tt=.15,iv=.15;
    while(tt<2.42){
      puffN(tt,.028,.03+tt*.045,'highpass',2200+tt*1200,0,1,(Math.random()-.5)*.9);
      iv=Math.max(.021,iv*.952);tt+=iv;
    }
    // 2) POUSSIÈRE D'OR : grains aigus qui se rangent peu à peu sur l'échelle d'or (chaos → ordre)
    for(let i=0;i<46;i++){
      const t=.2+Math.random()*2.1,ord=t/2.3;
      const f=phi(4+Math.floor(Math.random()*4))*(1+(Math.random()-.5)*.5*(1-ord));
      tone(f,f,t,.09+Math.random()*.13,.022+ord*.04,'sine',(Math.random()-.5)*1.4);
    }
    // 3) DOUBLE SUB : 38 + 38,618 Hz → battement de 0,618 Hz. Harmoniques ×2 pour
    //    rester audible sur petites enceintes (les portables ne sortent pas le 38 Hz)
    if(INTRO_NOTES)for(const fh of [[38,.16],[38.618,.16],[76,.07],[77.236,.07]]){ // (2026-10-16) une note tenue : seulement avec ?intro=musique
      const o=A.createOscillator(),g=A.createGain();
      o.type='sine';o.frequency.value=fh[0];
      g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(fh[1],t0+2.1);
      g.gain.setValueAtTime(fh[1],t0+2.5);g.gain.linearRampToValueAtTime(0,t0+2.62); // aspiré
      o.connect(g);g.connect(master);o.start(t0);o.stop(t0+2.66);
    }
    // 4) SPIRALES : deux souffles résonants qui grimpent en proportions d'or
    for(const k of [0,1]){
      const s=A.createBufferSource();s.buffer=nzBuf;s.loop=true;
      const fl=A.createBiquadFilter();fl.type='bandpass';fl.Q.value=9;
      const f0=240*Math.pow(PHI,k);
      fl.frequency.setValueAtTime(f0,t0+.3);
      fl.frequency.exponentialRampToValueAtTime(f0*10,t0+2.6);
      const g=A.createGain(),p=pan(k?-.5:.5);
      g.gain.setValueAtTime(0,t0+.3);g.gain.linearRampToValueAtTime(.09,t0+2.3);
      g.gain.setValueAtTime(.09,t0+2.55);g.gain.linearRampToValueAtTime(0,t0+2.63);
      s.connect(fl);fl.connect(g);g.connect(p);p.connect(master);
      s.start(t0+.3);s.stop(t0+2.7);
    }
    // 5) BATTEMENTS DE CŒUR (sync pulsations du logo) : kick + thump médium + accord d'or
    [[1.05,1],[1.65,1.35],[2.15,1.8]].forEach(function(bk){
      const t=bk[0],k=bk[1];
      tone(96,27,t,.24,.30*k);
      tone(230,70,t,.14,.14*k);
      tone(phi(1),phi(1)*.994,t,.17,.09*k,'triangle');
      tone(phi(2),phi(2)*.994,t,.16,.08*k,'triangle');
      tone(phi(3),phi(3)*.994,t,.14,.07*k,'triangle');
      puffN(t,.03,.10*k,'highpass',5200,0,1);
    });
    // 6) ASPIRATION (2.35→2.63) : tout se fait avaler… puis 70 ms de VIDE total
    puffN(2.35,.28,.30,'bandpass',800,3400,2);
    tone(340,64,2.35,.28,.09);
    // 7) FISSION (2.65) : canon de sub + souffle + chœur métallique d'or qui retombe
    tone(64,21,2.65,1.5,.55);
    tone(128,42,2.65,.8,.22);
    puffN(2.65,.9,.38,'lowpass',3800,140,1);
    for(let k=0;k<5;k++)tone(phi(k)*2,phi(k)*1.94,2.65,2.1-k*.22,.07,k%2?'triangle':'sine',(k-2)*.3);
    // 8) JACKPOT : pluie de pièces qui descend l'échelle d'or (dense → clairsemée)
    for(let i=0;i<26;i++){
      const t=2.72+Math.pow(i/26,1.35)*1.5;
      const f=phi(6-Math.floor(i/5))*(1+(Math.random()-.5)*.06);
      tone(f,f*.99,t,.22+Math.random()*.1,.07-.035*(i/26),'triangle',(Math.random()-.5)*1.2);
      puffN(t,.02,.03,'highpass',6000,0,1);
    }
    // 9) LE TITRE CLAQUE (2.95, sync visuel) : impact + accord brillant
    tone(120,30,2.95,.32,.50);
    for(let k=0;k<4;k++)tone(phi(k)*4,phi(k)*4,2.95,.5,.07,'triangle',(k-1.5)*.35);
    puffN(2.95,.18,.22,'highpass',1800,0,1);
    // 10) TRAÎNE : nappe d'or qui s'éteint doucement vers le menu
    tone(phi(2),phi(2),3.05,2.8,.04,'sine',-.4);
    tone(phi(3),phi(3),3.1,2.7,.035,'sine',.4);
  }
  let last9=performance.now();
  function draw9(now){
    if(done)return;
    requestAnimationFrame(draw9);
    const dt9=Math.max(0,Math.min((now-last9)/1000,.05));last9=Math.max(last9,now); // ⚠ jamais < 0 : la 1re image de rAF peut être datée AVANT `last9` — l'onde de choc prenait un rayon négatif et `arc()` levait à CHAQUE image (478 erreurs mesurées)
    ctx9.clearRect(0,0,cv9.width,cv9.height);
    if(ph9===0){
      ctx9.fillStyle='#ffd75e';
      if(!launched){ // TEASER : poussière d'or en dérive lente, en attente du clic
        for(const p of P9){
          p.x+=p.dx*dt9;p.y+=p.dy*dt9;
          if(p.x<0)p.x+=cv9.width;if(p.x>cv9.width)p.x-=cv9.width;
          if(p.y<0)p.y+=cv9.height;if(p.y>cv9.height)p.y-=cv9.height;
          ctx9.globalAlpha=p.o*.16;
          ctx9.beginPath();ctx9.arc(p.x,p.y,p.s,0,7);ctx9.fill();
        }
        ctx9.globalAlpha=1;
      }else{ // phase accumulation : spirale d'étincelles dorées
        for(const p of P9){
          p.x+=(CX()-p.x)*p.k*(dt9*60);p.y+=(CY()-p.y)*p.k*(dt9*60);
          const dd=Math.hypot(p.x-CX(),p.y-CY());
          if(dd<24){const a=Math.random()*Math.PI*2,r=Math.max(cv9.width,cv9.height)*(.5+Math.random()*.7);p.x=CX()+Math.cos(a)*r;p.y=CY()+Math.sin(a)*r;}
          ctx9.globalAlpha=p.o*(.35+.65*Math.min(1,240/Math.max(dd,1)));
          ctx9.beginPath();ctx9.arc(p.x,p.y,p.s,0,7);ctx9.fill();
        }
        ctx9.globalAlpha=1;
      }
    }else{ // phase fission : symboles éjectés qui tournoient
      // ⚠ UN SEUL HALO, PAS UN PAR PARTICULE (2026-09-05) : une dégradé radiale bon marché à la place
      // de 70 passes de `shadowBlur` — même ambiance dorée, sans le coût qui faisait laguer l'instant
      // le plus chargé de l'intro (voir la note sur le spawn des particules, juste au-dessus).
      const glow9=ctx9.createRadialGradient(CX(),CY(),0,CX(),CY(),Math.max(cv9.width,cv9.height)*.5);
      glow9.addColorStop(0,'rgba(255,215,140,.20)');glow9.addColorStop(1,'rgba(255,215,140,0)');
      ctx9.fillStyle=glow9;ctx9.fillRect(0,0,cv9.width,cv9.height);
      ctx9.textAlign='center';ctx9.textBaseline='middle';
      for(let i=P9.length-1;i>=0;i--){
        const p=P9[i];
        p.life-=dt9;p.vy+=260*dt9;
        p.x+=p.vx*dt9;p.y+=p.vy*dt9;p.rot+=p.vr*dt9;
        if(p.life<=0){P9.splice(i,1);continue;}
        ctx9.save();ctx9.translate(p.x,p.y);ctx9.rotate(p.rot);
        ctx9.globalAlpha=Math.min(1,p.life);
        ctx9.font='700 '+p.s+'px "Press Start 2P",monospace';
        ctx9.fillStyle=p.col;ctx9.fillText(p.sym,0,0);
        ctx9.restore();
      }
    }
    for(let i=RG.length-1;i>=0;i--){ // ondes de choc
      const g9=RG[i];g9.r+=g9.v*dt9;g9.a-=dt9*1.1;
      if(g9.a<=0){RG.splice(i,1);continue;}
      ctx9.strokeStyle='rgba('+g9.col+','+g9.a+')';ctx9.lineWidth=g9.w;
      ctx9.beginPath();ctx9.arc(CX(),CY(),Math.max(0,g9.r),0,7);ctx9.stroke();
    }
  }
  requestAnimationFrame(draw9);
  function hide(){
    if(done)return;done=true;setTimeout(function(){window.__intro=null;},1500); // (le voile s'ouvre, la musique du lobby part : on attend encore)
    for(const t9 of timers)clearTimeout(t9);
    removeEventListener('keydown',kd9);
    if(iAC){ // fondu audio rapide puis fermeture du contexte de l'intro
      try{master.gain.setTargetAtTime(0,iAC.currentTime,.06);}catch(e){}
      setTimeout(function(){try{iAC.close();}catch(e){}},400);
    }
    // ---- LE RACCORD : ON N'ATTERRIT PLUS SUR UN MENU, ON ATTERRIT DANS LE GARAGE ----------------
    // ⚠ L'ORDRE EST TOUT : on OUVRE l'atelier PENDANT que le voile est encore opaque, puis on retire
    // le voile par-dessus. Le joueur ne voit donc jamais la bascule — il voit un fondu qui decouvre
    // une piece deja allumee, avec sa caisse dessus. Ouvrir APRES le fondu montrerait un ecran nu
    // pendant que buildGarageRoom() fabrique ses 6 geometries et ses 7 canvas a la premiere visite.
    // ⚠ et c'est pour ca que #splash est passe en z-index 80 : #garage est a 60, il serait sinon
    // apparu D'UN COUP par-dessus le voile au lieu d'etre decouvert par lui.
    // Le titre, lui, n'a plus rien a raccorder : il a explose, il n'existe plus.
    // ⚠ L'INTRO EST FINIE ICI, PAS DANS 1,15 s : on lui retire son ID AVANT d'ouvrir le garage.
    // `start()` se garde par `document.getElementById('splash')` — tant que le voile gardait son
    // identite pendant son fondu, un JOUER AVEC CELLE-CI lance dans cette fenetre faisait
    // closeGarage() (qui rouvre le menu) suivi d'un start() qui REFUSAIT de le refermer : le joueur
    // se retrouvait planté au menu. Le noeud, lui, part en fondu comme avant.
    // ⚠ BUG TROUVÉ 2026-09-04 (mesuré, pas deviné) : retirer l'ID détache AUSSI toute la règle CSS
    // `#splash{position:fixed;inset:0;…}` — le voile retombe en `position:static`, DANS LE FLUX DU
    // DOCUMENT, avec la hauteur de son contenu (mesuré : 86px). Le canvas WebGL, dernier enfant de
    // `<body>` en flux normal lui aussi, se fait POUSSER de 86px vers le bas pendant toute la durée
    // de vie du nœud détaché (jusqu'à `sp9.remove()`, 1,15 s) : bande BLANCHE (fond de `<body>`) en
    // haut d'écran, bas de l'image rogné d'autant. On fige donc en dur, sur l'élément lui-même,
    // exactement ce que l'ID lui donnait — il reste hors du flux jusqu'à sa suppression.
    // ⚠ `pointer-events:none` (le CSS d'origine avait `cursor:pointer`, pour le double-clic « passer »
    // — mais ce clic n'a plus de sens ICI, `hide()` a déjà tourné) : sans lui, le voile invisible
    // continuait à AVALER les clics sur le garage fraîchement révélé pendant tout son fondu.
    sp9.classList.add('spVoile'); /* (2026-10-15) le halo qui respire reste sur le voile jusqu'à son effacement (il tenait à l'id) */
    sp9.id='';
    sp9.style.cssText='position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;pointer-events:none;background:radial-gradient(900px 600px at 50% 46%,#191024,#000 75%);transition:opacity .7s;overflow:hidden;opacity:1';
    // ⚠ LE GARAGE ÉTAIT MUET (2026-09-05) : `chimeNote`/`noiseBurst` (chime de changement de caisse,
    // impact au tap…) se posent en garde `if(!AC)return` — silencieuses tant que `AC` n'existe pas.
    // Or `AC` ne se créait QUE dans `start()`, c'est-à-dire APRÈS avoir déjà joué avec le garage
    // (premier écran vu depuis que le splash y atterrit direct) : toute la session de shopping se
    // déroulait sans le moindre retour sonore. Le clic qui ferme CE splash EST déjà le geste
    // utilisateur qu'un `AudioContext` réclame — autant s'en servir tout de suite. `if(!AC)` : même
    // garde que `playMusic`/`musicStartRun`, zéro risque de double contexte avec le garde ajouté
    // dans `start()`.
    if(!AC){try{if(typeof initAudio==='function')initAudio();}catch(e){}}
    // (2026-10-03, Léo : « pour toutes les musiques, fais démarrer au moment du menu ciel ») : la musique du lobby part à l'instant où le
    // voile s'ouvre sur le CIEL (420 ms, le fondu ci-dessous), et du DÉBUT du morceau — le 1er toucher l'avait lancée en silence une fraction
    // de seconde pour libérer le lecteur. Avant : 700 ms, au milieu du fondu.
    setTimeout(function(){try{if(!started){if(musicEl&&musicEl.paused&&musicMenuUrl()&&musicEl.src.indexOf(musicMenuUrl())>=0)musicEl.currentTime=0;musicMenu();}}catch(e){}},420); // la musique du menu arrive avec le ciel
    // (2026-09-24, audit UX) sur TÉLÉPHONE on atterrit sur le MENU (JOUER · CARRIÈRE · GARAGE…) : le garage était le 1er écran
    // avec trois actions concurrentes (PLAY, CARRIÈRE, ✕) et une croix qui menait… au menu. Il redevient le lieu du CHOIX de la caisse.
    try{if(typeof openGarage==='function'&&!IS_MOBILE)openGarage();}catch(e){}
    setTimeout(function(){ // (2026-09-25) le voile s'OUVRE sur le menu — léger zoom-avant sur la courbe unique — et le menu joue son entrée dessous
      sp9.style.transition='opacity .6s cubic-bezier(.32,.72,0,1),transform .6s cubic-bezier(.32,.72,0,1)';sp9.style.transform='scale(1.06)';sp9.style.opacity=0;
      try{document.dispatchEvent(new Event('cc:revele'));}catch(e){} },420);
    setTimeout(function(){sp9.remove();},1150);
  }
  sp9.addEventListener('click',function(){ // 1er clic = lancer, 2e = passer
    try{musicDeverrouille();}catch(e){} // ⚠ LE geste qui libère la musique pour toute la session (voir le lecteur unique)
    if(!launched)launch();
    else if(performance.now()-tLaunch>600)hide(); // ⚠ un DOUBLE-CLIC sur la plaque sautait tout
  });
})();
/* ============ MOBILE / TACTILE / PAUSE / PWA — ajout non intrusif (rien de la physique n'est réécrit) ============ */
// PAUSE commune : clavier P, bouton tactile ⏸ et pause auto passent tous par ici (gère aussi le son)
function busPlein(){busPlein.n=(busPlein.n|0)+1;clearTimeout(togglePause._t); /* (2026-10-16) compté : LE CLIC DANS LA PAUSE (pauseSon) sait que la partie a repris la sortie */if(AC&&BUSOUT){const t9=AC.currentTime;BUSOUT.gain.cancelScheduledValues(t9);BUSOUT.gain.setValueAtTime(1,t9);}} // (2026-09-28) la sortie commune à plein (voir le fondu de la pause)
function togglePause(){ if(!started||gameOver)return;
  paused=!paused; showMsg(paused?'PAUSE':'GO !');
  if(!paused)slowT=Math.max(slowT,.8); // (2026-09-25) reprise au RALENTI : le temps de reposer les pouces
  /* (2026-09-28) LES BOUCLES SE TAISENT AVEC LA PAUSE. Suspendre le contexte FIGE les sons continus à leur gain du moment : dès que
     le compte 3-2-1 le réveille (0,9 s, jeu encore gelé, boucle qui ne règle plus rien), moteur, vent, sifflement, crissement et
     nitro rejouaient plein pot sur une image arrêtée. On les coupe NET avant de suspendre, et on vide le cache de `stt` (`_s9`) :
     sans ça, à la reprise, la boucle croirait la cible déjà envoyée et laisserait tout à zéro. `jrDep`/`engLfoG` en font partie :
     ce sont des LFO branchés sur un gain, ils rendraient un trémolo audible même gain principal à zéro. */
  if(paused&&AC){ try{ const T9=AC.currentTime;
    for(const n9 of [gainN,windG,whG,pluieG,skidG,jrG,jrDep,jetG,jetLowG,jetOscG,engLfoG,engWhineG,transG,diffG,ovrG,engTickG,pinkG,DRS&&DRS.g,RSN&&RSN.g,sirG,RUG.rgG,RUG.thG,RUG.crG,GOM.sG,GOM.gG,GOM.respG])
      if(n9){const p9=n9.gain;p9.cancelScheduledValues(T9);p9.setTargetAtTime(0,T9,.012);p9._s9=undefined;} }catch(e){} }
  /* (2026-09-28) …et en FONDU : un `suspend()` sec coupait le moteur en plein cycle — un « tic » à chaque pause. La sortie commune
     (`BUSOUT`) descend en ~40 ms, le contexte s'endort derrière ; la reprise (ou le compte 3-2-1) remet la sortie à plein. */
  try{ if(AC){ const T8=AC.currentTime;clearTimeout(togglePause._t);
    if(paused){ /* (2026-09-28, console de son) le clic ⏸ et la feuille qui s'ouvre (ui.feuille, posée à 0,36 s) sonnent JUSQU'AU BOUT : la sortie attend `d9` pour descendre et le contexte s'endort
       d'autant plus tard. Le JEU est gelé tout de suite (paused) et les boucles (moteur, vent, nitro…) sont coupées net juste au-dessus :
       pendant ces 0,42 s ne sonnent que les sons ponctuels déjà partis. Une reprise dans l'intervalle annule tout
       (busPlein efface la rampe programmée, clearTimeout la suspension). Onglet caché (retour d'appli) : ni son ni délai. */
      let d9=0;try{if(SONV2&&!document.hidden)d9=.42;if(SONV2){window.CCSON.annuleFutur(d9);window.CCSON.stopJeu();}}catch(e){}try{instruCoupe(0);}catch(e){} /* (2026-10-07) la phrase du nitro se tait TOUT DE SUITE (le clic ⏸ et la feuille, eux, sonnent jusqu'au bout) */ /* (débogage son 2026-09-29) les queues longues (explosion, fanfare, scène moteur) ne repartent plus pendant le 3-2-1 */
      if(BUSOUT)BUSOUT.gain.setTargetAtTime(0,T8+d9,.012);togglePause._t=setTimeout(function(){try{if(paused&&AC.state==='running')AC.suspend();}catch(e){}},70+d9*1000);}
    else{busPlein();if(SND.sfx||musGraphe())AC.resume();} } }catch(e){} // (2026-10-14, session SON) musique branchée : SON coupé, le contexte doit quand même se réveiller (les effets restent fermés par musWaSon)
  if(paused){fxStop();deathStop();} // (2026-09-26) les voix et les samples sont des HTMLAudio : suspendre le contexte ne les arrêtait pas — (2026-09-28) le son de MORT non plus : une pause pendant l'explosion le laissait hurler par-dessus le panneau
  musicPause(paused); // la musique ne passe plus par l'AudioContext : elle se met en pause elle-même
}
// applique la résolution adaptative (reconfigure le renderer et le canvas des speed-lines)
/* (2026-09-26, passe perf, lot 4) chaque changement de résolution réallouait TOUT DEUX FOIS : `setPixelRatio` redimensionne déjà (le
   canvas 3D, puis les 11 cibles du bloom), et on redimensionnait derrière à la même taille. Désormais le second passage n'a lieu que si
   la FENÊTRE a changé. Et les deux canvas 2D ne sont retaillés que si leur taille change : retailler un canvas l'EFFACE (les taches de
   jus disparaissaient à chaque cran de résolution adaptative). */
const DPR_V9=new THREE.Vector2();
const PIQUE_ON=!/[?&]pique=0/.test(location.search),PIQUE_NAT=(function(){const m=/[?&]piquen=([\d.]+)/.exec(location.search);return m?+m[1]:.4;})(); // `?pique=0` : sans l'accentuation, pour comparer · `?piquen=.5` : la force du piqué natif (banc)
function applyDPR(){ try{ const W=innerWidth,H=innerHeight;
  renderer.getSize(DPR_V9);const neuve=DPR_V9.x!==W||DPR_V9.y!==H;
  renderer.setPixelRatio(curDPR);if(neuve)renderer.setSize(W,H);if(PT_U)PT_U.uPxMax.value=26*curDPR; // le plafond des particules suit la résolution
  if(composer){composer.setPixelRatio(curDPR);if(neuve)composer.setSize(W,H);}
  /* LE PIQUÉ NATIF (2026-09-28, « plus beau sur iPhone sans coût en plus »). L'iPhone a 3 pixels par point, la 3D en calcule 1,5 (NETTE) :
     c'est le NAVIGATEUR qui agrandit l'image ×2 en bilinéaire au moment de l'afficher — un flou de plus, même au plafond, que l'ancien
     piqué (qui ne regardait que la descente sous le plafond) ne compensait jamais. `up9` = cet agrandissement ; au-delà de ×1,05 le
     piqué rend d'avance le contraste que l'agrandissement va prendre (×2 → .40 ; `?piquen=` pour comparer). Mêmes 4 lectures que le FXAA : coût nul. On garde le
     plus fort des deux. Sur l'ordi à l'accueil (VHD, sur-échantillonné : up9 < 1) rien ne change. */
  if(acesPass&&acesPass.uniforms.uSharp){const up9=Math.min(3,devicePixelRatio||1)/Math.max(.01,curDPR),piqN=up9>1.05?Math.min(PIQUE_NAT,(up9-1)*PIQUE_NAT):0;
    acesPass.uniforms.uSharp.value=PIQUE_ON?Math.max(piqN,Math.min(.45,(DPR_CAP-curDPR)/Math.max(.01,DPR_CAP)*1.5)):0;} // (tour 2) sous le plafond, le piqué compense (1,25/1,5 → .25 · 1,0/1,5 → .45)
  if(slCv.width!==W||slCv.height!==H){slCv.width=W;slCv.height=H;}
  if(juiceCv&&(juiceCv.width!==W||juiceCv.height!==H)){juiceCv.width=W;juiceCv.height=H;} }catch(e){} }
// PAUSE AUTO : l'appli passe en arrière-plan (onglet caché, app minimisée) → on gèle + on coupe le son
addEventListener('visibilitychange',function(){ if(document.hidden&&started&&!gameOver&&!paused&&mode!=='boom')togglePause(); /* (2026-10-14, chasse aux bugs) PAS pendant l'EXPLOSION : la pause figeait la boule de feu, coupait le son de mort et rouvrait le panneau PAUSE au retour sur une partie déjà perdue — l'arrière-plan gèle déjà tout (plus d'images, contexte audio suspendu) ; au retour la mort avance comme au ⏸ (boomSkip, plus bas) */
  // (2026-09-26) au menu, au garage ou sur l'écran de mort, une vingtaine de sources en boucle tournaient encore en arrière-plan
  try{ if(AC){ if(document.hidden){if(AC.state==='running')AC.suspend();} else if((SND.sfx||musGraphe())&&!paused&&AC.state!=='running')AC.resume(); } }catch(e){} // (2026-10-14, session SON) …et au retour d'arrière-plan aussi
  if(document.hidden)try{enCoursPose();SAVE.flush();}catch(e){} // (2026-09-28) l'appli part en arrière-plan : ce qui attendait le filet de 30 s (record de frénésie, meilleur moteur…) est écrit TOUT DE SUITE — iOS peut la tuer sans prévenir · (2026-09-30) et la PARTIE en cours avec (enCoursPose)
  // (2026-09-30) au retour la partie continue : l'instantané part — SAUF contexte 3D perdu, que suit un rechargement (voir webglcontextlost) : il est alors le seul à porter la partie
  if(!document.hidden){let perdu=false;try{perdu=renderer.getContext().isContextLost();}catch(e){}if(!perdu)enCoursRetire();}
  if(!document.hidden){loop._pn=0;loop._rebuildT=performance.now();} }); // retour d'onglet : la frame « absente » n'est pas une lenteur
// IMMERSION : plein écran + verrou PORTRAIT + veille désactivée. Les trois exigent un GESTE
// utilisateur — on les redemande à chaque contact utile, et on ne râle jamais si elles sont refusées.
let wakeLock=null;
function wakeAsk(){ try{ if(navigator.wakeLock&&!wakeLock)navigator.wakeLock.request('screen').then(function(w){
  wakeLock=w;w.addEventListener('release',function(){wakeLock=null;}); },function(){}); }catch(e){} }
function goImmersive(){
  if(!IS_MOBILE)return;
  // Sous Capacitor (app native) : la WebView est déjà plein écran et requestFullscreen n'est pas
  // supporté — on le garde pour le web uniquement. Et pas sur l'ordi en `?tel=1` : cliquer JOUER
  // ne doit pas avaler l'écran entier sans qu'on l'ait demandé.
  if(!window.Capacitor&&!FORCE_TEL){ try{ const el=document.documentElement;
    if(el.requestFullscreen&&!document.fullscreenElement)el.requestFullscreen({navigationUI:'hide'}).catch(function(){});
    else if(el.webkitRequestFullscreen&&!document.webkitFullscreenElement)el.webkitRequestFullscreen();
  }catch(e){} }
  // Plus de verrou d'orientation : l'app accepte PORTRAIT ET PAYSAGE (décision 2026-09-03).
  // screen.orientation.lock n'est de toute façon pas supporté sous iOS ; on ne le tente plus.
  wakeAsk();
}
/* ===== L'INTRO DU JEU, VERSION FINALE (2026-10-23, validée par Léo : « c'est exactement ça ») =====
   Un seul film. Noir, puis une boule de « 1 . 6 1 » (quatre couleurs qui changent) se dessine point après point, tourne sans s'arrêter, pulse, et se tourne au doigt.
   Derrière : un pad infini (Ré, Si mineur, Sol, La) qui bat avec la boule, et des cloches pentatoniques qui suivent la couleur. Dès que la page est prête (≥ 4,6 s), un accord s'ouvre.
   L'APPUI (un vrai tap, pas un glissement) : la boule explose, CASH CAR claque (dActe3), le jeu se prépare dessous, puis le voile fond vers le jeu (fonduDoux).
   `?intro=ancien` = l'intro d'avant (init.js) · `?intro=muet` = sans son. Les anciens films (feu d'artifice, néon, poussière, luxe, hype, caisse, pluie, route, spirale PlayStation, sphère qui s'écroule) sont retirés
   de ce fichier : ils restent dans l'historique git (commit 254157dc). Ce qui suit, avant « LA BOULE », est l'ancien commentaire du film à calendrier (le gros logo, la casse en tuiles, l'horloge `TL`). */
/* ===== L'INTRO DU STUDIO 1.61, VERSION CONSOLE (2026-10-21, Léo : « une nouvelle intro beaucoup plus moderne et stylée pour le label 1.61, du style
   Xbox ou PlayStation : le logo qui apparaît avec une animation, des bruits intenses qui font blip blip blip, puis un silence, un fondu noir ;
   le gros logo CASH CAR doré qui se secoue, se casse en morceaux, casse l'écran noir et laisse voir le jeu ») =====
   L'ATTENTE (22/10, Léo : « le logo cash car tout début sur écran noir complet sans lumière, puis l'animation 1.61, puis cash car apparaît et n'explose pas :
   c'est l'écran qui s'explose quand je le touche ») : au chargement, le titre CASH CAR sur NOIR COMPLET (ni halo ni poussière ni lueur), AUCUN toucher demandé ;
   le film part TOUT SEUL (page chargée, police prête, fenêtre visible, ≥ 1,7 s ; `autoLance`). Le navigateur refuse le son sans toucher : le film passe alors
   MUET (la casse, elle, sonnera au toucher : le contexte attend, déjà construit) ; s'il l'autorise, ou si l'on touche l'écran avant, le film sonne en entier.
   LE FILM. Tout est piloté par UNE horloge, `t` en secondes depuis le départ ; chaque instant est dans `TL` (le son et l'image s'y lisent) :
     0,00  le titre s'éteint en un trait de lumière (le titre de l'attente s'aplatit dedans) ;
     0,30  LES BLIPS : « 1.61 », se dessine en dix temps, un par blip, de CINQ manières au choix :
           FEU D'ARTIFICE (défaut : deux têtes en spirale d'or qui sèment des pixels, explosion en « 1.61 » de petits cubes d'or qui tombent ensuite), NÉON (un tube que les blips allument), POUSSIÈRE (des grains qui affluent),
           LUXE (un trait fin qu'un fil de lumière révèle), HYPE (des coupes sèches sur des chiffres lourds) ;
     1,85  le coup final : le nombre claque ; il reste net un instant ;
     2,80  il S'ÉTEINT (fondu, ou les cubes qui tombent) et le SON COUPE ; 3,55 : noir complet ; SILENCE complet jusqu'à 3,95 (le jeu dessine quelques images dans ce noir) ;
     3,95  le gros logo CASH CAR claque (or métallique / coucher de soleil, comme celui de l'accueil), puis il ATTEND : un frémissement léger, un reflet qui repasse
           toutes les 2,8 s, et dès 5,15 s un « TOUCHE » très discret SOUS le logo (« TAP » en anglais) ; il peut attendre indéfiniment (le jeu est en pause dessous) ;
     AU TOUCHER  l'écran noir et le logo se brisent en ~80 tuiles carrées (petites autour du DOIGT, grandes aux bords) qui volent vers la caméra ; chacune est une
           LOUPE : le logo en gros pixels, puis le jeu agrandi et pixelisé — le voile ne prend plus les touchers, le jeu est jouable dessous. Un toucher PENDANT le 1.61
           coupe au noir : le logo claque aussitôt (`sauterAuLogo`).
   Tout est dessiné dans le canvas de l'écran titre (#fxCv) à la résolution de l'appareil ; rien n'est animé « au pas à pas » : chaque image se
   calcule d'après `t` seul (`window.dbgIntro.voir(t)` montre n'importe quel instant, sans son). Le son est fabriqué ici (WebAudio) : des blips
   de MÊME hauteur (aucune mélodie : toujours aucune musique avant le ciel, Léo 6/10 et 16/10), un grondement, des craquements, la casse.
   Réglages : `?label=neon|feu|poussiere|luxe|hype` choisit le « 1.61 » (par défaut feu), `?label=demo` les enchaîne en boucle (un toucher pour jouer) · `?depart=toucher` = l'ancien départ (le film attend un toucher, avec le son) ·
   `?intro=ancien` = l'intro d'avant (init.js) · `?intro=muet` = sans aucun son · « réduire les animations » = sans secousse ni
   éclats (le voile s'efface) · quelqu'un qui a déjà fini la leçon (SAVE.d.tuto) voit le même film en 20 % plus court · un 2e toucher passe. */
(function(){
  if(!INTRO_NEUVE)return;
  const sp=document.getElementById('splash'),cv=document.getElementById('fxCv');
  if(!sp||!cv)return;
  const ttl=document.getElementById('spTitle'),g=cv.getContext('2d');
  sp.classList.add('spNoir'); /* l'attente : NOIR COMPLET, sans lumière : le titre posé, ni halo ni lueur (Léo, 22/10) */
  {const st=document.createElement('style');st.textContent='html #splash.spNoir{background:#000}html #splash.spNoir::before{display:none}';document.head.appendChild(st);}
  if(ttl){ttl.classList.remove('tease');ttl.style.cssText+=';animation:none;filter:none;opacity:.92;transform:translateY('+(innerWidth<innerHeight*1.15?-.05*innerHeight:0).toFixed(1)+'px) scale(.88) skewX(var(--sk,0deg))';} /* (le titre se pose à la hauteur où le film dessine : 45 % de l'écran en portrait) */
  if(!/[?&]label=(?!boule)/.test(location.search)&&ttl)ttl.style.display='none'; /* plus de CASH CAR sur noir pendant le chargement : seule la boule */
  window.__intro='attente'; /* (la mise à jour toute seule) l'écran titre attend son toucher : rien n'a sonné, on peut recharger */
  const SANS_SON=/[?&]intro=muet\b/.test(location.search);
  const borne=(x,a,b)=>x<a?a:x>b?b:x;
  const lisse=(a,b,x)=>{x=borne((x-a)/(b-a),0,1);return x*x*(3-2*x);};
  const entre=(a,b,k)=>a+(b-a)*k;
  const sort3=x=>1-Math.pow(1-borne(x,0,1),3);
  const hasard=s=>function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const pique=(i,j)=>{let h=Math.imul(i|0,374761393)+Math.imul(j|0,668265263)|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296;}; /* un hasard FIXE par (i,j) : le scintillement d'une case */

  /* ---- LE CALENDRIER. Les heures de TL sont celles du film ; K les resserre pour qui a déjà fini la leçon. ---- */
  const tuto=!!(SAVE&&SAVE.d&&SAVE.d.tuto),K=tuto?.8:1;
  const BOULE=true; /* (un seul film depuis le 23/10 soir, validé par Léo : « c'est exactement ça ») */
  const TL=(function(k){const T=x=>x*k;return{
    blips:[.30,.544,.766,.959,1.118,1.252,1.349,1.422,1.495,1.556].map(T), /* (gardés : l'ancien code lit blips[0] et blips[9]) */
    plein:T(1.85),
    fondu:T(5.95),noir:T(6.55),slam:T(7.55),casse:T(9.2)};})(K); /* casse : l'instant NOMINAL (le banc) ; la vraie casse est celle du TOUCHER */
  const DUREE_CASSE=1.45; /* secondes d'éclats en vol avant d'ôter le voile */
  const reduit=()=>document.documentElement.getAttribute('data-reduced-motion')==='1'||(typeof REDUCED_MOTION!=='undefined'&&REDUCED_MOTION);

  let W=0,H=0,S=1,ku=1; /* taille logique du voile, échelle du canvas (pixels de l'appareil), unité d'écran (390 px = 1) */
  let pretT=null,tapT=null; /* la boule : l'instant où c'est prêt (elle s'arrête), l'instant de l'appui (elle explose) */
  let lance=false,fini=false,casse=false,doux=false,manuel=false,passee=false,ouvert=false,revele=false,RM=false;
  let TOUCH=null,preAC=null,filmMuet=false,tLance=0,latV=0,tCasse=0,raf=0,sonCasseFait=false,t0a=0,iAC=null,SON=null,SK0={x:0,y:0};
  let GAMECV=null,SNAPPIX=null,GLOSS=null,priseFaite=false; /* la photo du jeu et celle de la scène, en gros pixels ; le reflet des lentilles ; la photo est-elle demandée */
  let LOGO=null,MESH=null,SNAP=null,ECL=null,ETC=null,PXC=null,RAY=null,VIG=null;
  const SPR={};

  function tailleEcran(){return[Math.min(sp.clientWidth||1e5,innerWidth||1e5)||390,Math.min(sp.clientHeight||1e5,innerHeight||1e5)||844];}
  /* ===== LE FILM SANS TRAVAIL REFAIT (2026-10-24, passe perf PC : « le démarrage sur ordinateur ») =====
     Le film tourne PENDANT que le jeu se construit dessous : chaque ms qu'il prend par image retarde la construction. Trace du chef (Mac M4, cadre bureau,
     rechargement à chaud, 36 s) : 295 ms de temps propre dans `tailleEcran`, 672 ms dans `dBoule`.
     · LA TAILLE : `boucle` relisait sp.clientWidth/Height + innerWidth/Height à CHAQUE image, une mise en page FORCÉE de toute la page en construction.
       Elle n'est plus relue que si elle a pu changer (ResizeObserver du voile, `resize`) et, par prudence, une fois par seconde (le cas « sans que resize
       nous le dise » reste attrapé, en ≤ 1 s au lieu d'une image).
     · LA BOULE (`dBoule`) : même dessin au bit près, moins de calcul — l'heure d'apparition de chaque point est calculée une fois (plus de 1 040 Math.pow
       par image), la rotation une fois au lieu de deux (une par passe), et les 96 vignettes de « 1 . 6 1 » sont dessinées depuis des ImageBitmap (les mêmes
       pixels, sans la photo de la toile source que Chrome refait à chaque drawImage d'un canvas : ~520 par image).
     · LA CADENCE (`?pci60=0` pour l'ôter seule) : sur un écran de plus de ~110 Hz (MacBook Pro 120 Hz), la boule qui tourne au ralenti (0,5 rad/s, < 1 px par
       image) est redessinée une image d'écran sur deux, soit 60 i/s, jusqu'à l'appui ; chaque image dessinée est celle de son instant, à 60 Hz rien ne change.
     `?pcintro=0` = tout l'ancien comportement. `window.dbgPciIntro` : les compteurs (lectures de taille, images dessinées / sautées, pas d'écran). */
  const PCI_ON=!/[?&]pcintro=0\b/.test(location.search),PCI_60=PCI_ON&&!/[?&]pci60=0\b/.test(location.search);
  const PCI_N={lectures:0,rendus:0,sautees:0,ecranMs:0,pas:1,prepares:0,prepEvitees:0};window.dbgPciIntro=PCI_N;
  let pciSale=true,pciLu=-1e9,pciPrec=0,pciMin=99,pciNm=0,pciDer=-1e9,pciCourts=0;
  if(PCI_ON){try{new ResizeObserver(function(){pciSale=true;}).observe(sp,{box:'border-box'});}catch(e){} addEventListener('resize',function(){pciSale=true;});}
  function pciTaille(now){ /* la taille du voile, relue seulement si elle a pu changer (sinon : celle qu'on a, donc « rien n'a changé ») */
    if(pciSale||!(now-pciLu<1000)){pciSale=false;pciLu=now;PCI_N.lectures++;return tailleEcran();}
    return[W,H];
  }
  function pciSaute(now){ /* true = cette image d'écran garde le dessin de la précédente (écran de ~110 Hz et plus, régulier : une sur deux, jamais moins ; 60, 75, 90, 100 Hz : rien ne change) */
    const d=now-pciPrec;pciPrec=now;if(d>1&&d<9.4){pciCourts++;if(d<pciMin)pciMin=d;} /* un intervalle d'écran rapide (< 9,4 ms : plus de ~106 Hz) */
    if(++pciNm>=60){PCI_N.pas=pciCourts>=40?2:1;PCI_N.ecranMs=pciCourts?+pciMin.toFixed(2):0;pciNm=0;pciMin=99;pciCourts=0;} /* les deux tiers des 60 derniers intervalles : l'écran est rapide ET la page respire (sous la charge, tout est dessiné comme avant) */
    if(PCI_N.pas>1&&now-pciDer<1.5*PCI_N.ecranMs){PCI_N.sautees++;return true;}
    pciDer=now;PCI_N.rendus++;return false;
  }
  function mesure(){
    const t=tailleEcran();W=t[0];H=t[1]; /* ce qui se VOIT (la fenêtre du cadre), jamais plus : un voile plus large que la fenêtre décalait tout le dessin (vu le 23/10 : logo énorme, coupé à droite) */
    S=Math.max(.6,Math.min(devicePixelRatio||1,2,Math.sqrt(2.2e6/(W*H)))); /* net sur un téléphone, borné en pixels : un grand écran ne coûte pas plus */
    cv.width=Math.round(W*S);cv.height=Math.round(H*S);cv.style.width=W+'px';cv.style.height=H+'px';cv.style.left='0';cv.style.top='0'; /* le dessin et l'écran font EXACTEMENT la même taille */
    ku=Math.max(.75,Math.min(W,H)/390);
  }

  /* ---- LES PETITS OUTILS DE DESSIN ---- */
  function lueur(r,v,b){const n=128,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d'),d=x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);
    d.addColorStop(0,'rgba('+r+','+v+','+b+',1)');d.addColorStop(.22,'rgba('+r+','+v+','+b+',.5)');d.addColorStop(.55,'rgba('+r+','+v+','+b+',.14)');d.addColorStop(1,'rgba('+r+','+v+','+b+',0)');
    x.fillStyle=d;x.fillRect(0,0,n,n);return c;}
  function halo(c,s,x,y,rx,ry,a){if(a<=.004)return;c.globalAlpha=a;c.drawImage(s,x-rx,y-ry,2*rx,2*ry);} /* une lueur douce, étirable en ellipse (à poser en `lighter`) */
  function silhouette(src,couleur){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.drawImage(src,0,0);x.globalCompositeOperation='source-in';x.fillStyle=couleur;x.fillRect(0,0,c.width,c.height);return c;}
  function faitRessources(){
    SPR.bl=lueur(255,255,255);SPR.or=lueur(255,190,80);SPR.ch=lueur(255,238,196);
    {const c2=document.createElement('canvas');c2.width=c2.height=64;const x=c2.getContext('2d'),d=x.createLinearGradient(0,0,64,64);d.addColorStop(0,'rgba(255,255,255,.65)');d.addColorStop(.5,'rgba(255,255,255,0)');d.addColorStop(1,'rgba(255,255,255,.18)');x.fillStyle=d;x.fillRect(0,0,64,64);GLOSS=c2;} /* le reflet d'une lentille */
    {const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d'),d=x.createRadialGradient(48,48,20,48,48,70);d.addColorStop(0,'rgba(0,0,0,0)');d.addColorStop(1,'rgba(0,0,0,.62)');x.fillStyle=d;x.fillRect(0,0,96,96);VIG=c;}
    {const n=512,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d'),R=hasard(11);x.translate(n/2,n/2);x.globalCompositeOperation='lighter'; /* les rayons : dix-huit coins de lumière, une seule fois */
      for(let i=0;i<18;i++){const a=i*Math.PI*2/18+(R()-.5)*.25,w=.05+R()*.07,len=n/2*(.7+R()*.3),d=x.createRadialGradient(0,0,0,0,0,len);
        d.addColorStop(0,'rgba(255,225,150,.55)');d.addColorStop(.5,'rgba(255,190,80,.16)');d.addColorStop(1,'rgba(255,170,60,0)');
        x.fillStyle=d;x.beginPath();x.moveTo(0,0);x.arc(0,0,len,a-w,a+w);x.closePath();x.fill();}
      RAY=c;}
  }

  /* ---- LES LABELS : CINQ MANIÈRES D'ÉCRIRE « 1.61 » (2026-10-22, Léo : « regarde en ligne une série d'intro luxueuse ou hype minimaliste de truc très connu avec des designers identitaires de renom, et propose plusieurs 1.61 »).
     Ce que disent les cas lus : Pentagram pour MTV World (des logos en formes d'onde, étirées sur les battements, en noir et blanc), Netflix (un zoom sur le N qui ouvre un spectre, fond noir, le son en deux notes),
     Wolff Olins (une identité née du mouvement), FIFA 2026 (32 carrés en orbite qui se verrouillent), PlayStation (le son posé sur un logo animé déjà fini) : le mouvement sort de l'identité, une seule action majeure à la fois,
     la version muette tient déjà seule, le son tombe quand le logo se fige, la fin est figée et lisible. Et le nom du studio EST le nombre d'or (φ ≈ 1,618).
     ?label=neon · or · poussiere · luxe · hype ; ?label=demo les enchaîne en boucle (un toucher pour jouer le jeu). Tous partagent le même calendrier (`TL`) et le même son. ---- */
  const PENTE=.194; /* tan(11°) : la pente du logo de l'accueil */
  const LAB_ID='boule',DEMO=false;
  const ORDRE_LABELS=['feu','poussiere','luxe','hype','neon'],NOMS_LABELS={feu:"FEU D'ARTIFICE",poussiere:'POUSSIERE',luxe:'LUXE',hype:'HYPE',neon:'NEON'}; /* l'ordre de la démo, les noms à l'écran (la police pixel n'a pas d'accents) */
  const ETS={}; /* les données de chaque label, calculées à la taille de l'écran */
  function bez(p0,p1,p2,p3,n){const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push({x:u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],y:u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]});}return o;}
  function lig(p0,p1,n){const o=[];for(let i=0;i<=n;i++){const t=i/n;o.push({x:p0[0]+(p1[0]-p0[0])*t,y:p0[1]+(p1[1]-p0[1])*t});}return o;}
  function ell(cx,cy,rx,ry,a0,a1,n){const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push({x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry});}return o;}
  function glyphes(o){ /* les quatre signes « 1 . 6 1 » : chacun un tracé continu (le centre du trait) en hauteurs de chiffre, posés côte à côte, puis penchés. o : sw (l'épaisseur), pente, gaps (entre les signes), rx/ry (le ventre du 6), fx/fy (le drapeau du 1), dr (le rayon du point) */
    const sw=o.sw,t0=sw/2,rx=o.rx||.20,ry=o.ry||.29,fx=o.fx||.225,fy=o.fy||.1475,dr=o.dr||sw*.725,sx=fx+.045,NH=22,cyb=1-t0-ry,pente=o.pente||0;
    const UN=()=>lig([sx-fx,t0+fy],[sx,t0],7).concat(lig([sx,t0],[sx,1-t0],24).slice(1)); /* le 1 : un drapeau, une hampe (un tableau neuf à chaque appel : les deux 1 ne partagent pas leurs points) */
    const SIX=bez([2*rx,t0+.0875],[2*rx-.14,t0-.1525],[0,t0+.1375],[0,cyb],NH).concat(ell(rx,cyb,rx,ry,Math.PI,-Math.PI,52).slice(1)); /* le 6 : la crosse, qui descend et s'enroule en ventre (NH : où elle finit) */
    const signes=[{pl:UN()},{pt:{x:dr,y:1-dr},dr:dr},{pl:SIX},{pl:UN()}];
    let x0=0;
    signes.forEach(function(g,i){
      let m0=1e9,m1=-1e9;
      if(g.pt){m0=g.pt.x-dr;m1=g.pt.x+dr;}else for(const q of g.pl){m0=Math.min(m0,q.x-sw/2);m1=Math.max(m1,q.x+sw/2);}
      g.dx=x0-m0;x0+=m1-m0+(o.gaps[i]||0);
    });
    let bx0=1e9,bx1=-1e9,by0=1e9,by1=-1e9;
    const borne4=function(x,y,r){bx0=Math.min(bx0,x-r);bx1=Math.max(bx1,x+r);by0=Math.min(by0,y-r);by1=Math.max(by1,y+r);};
    for(const g of signes){
      if(g.pt){g.pt.x+=g.dx+pente*(.5-g.pt.y);borne4(g.pt.x,g.pt.y,dr);continue;}
      for(const q of g.pl){q.x+=g.dx+pente*(.5-q.y);borne4(q.x,q.y,sw/2);}
      g.cum=[0];for(let i=1;i<g.pl.length;i++)g.cum.push(g.cum[i-1]+Math.hypot(g.pl[i].x-g.pl[i-1].x,g.pl[i].y-g.pl[i-1].y));
      g.L=g.cum[g.cum.length-1];
    }
    return{signes:signes,sw:sw,dr:dr,NH:NH,bx0:bx0,bx1:bx1,by0:by0,by1:by1};
  }
  function morceau(sg,a,b,P,h,sw){ /* le bout de tracé entre les fractions a et b de sa longueur, en pixels : un Path2D, son point d'arrivée, deux jeux de taches de lumière (serrées, larges) et des points serrés avec leur normale (pour les grains) */
    const pl=sg.pl,cum=sg.cum,d0=a*sg.L,d1=b*sg.L,p=new Path2D();
    const pt=function(d){let i=0;while(i<cum.length-2&&cum[i+1]<d)i++;const k=(d-cum[i])/Math.max(1e-9,cum[i+1]-cum[i]);return P(pl[i].x+(pl[i+1].x-pl[i].x)*k,pl[i].y+(pl[i+1].y-pl[i].y)*k);};
    let q=pt(d0);p.moveTo(q[0],q[1]);
    for(let i=1;i<pl.length-1;i++)if(cum[i]>d0&&cum[i]<d1){q=P(pl[i].x,pl[i].y);p.lineTo(q[0],q[1]);}
    q=pt(d1);p.lineTo(q[0],q[1]);
    const tache=function(pas,avecN){const o=[],n=Math.max(1,Math.ceil((d1-d0)*h/pas));for(let i=0;i<=n;i++){const d=d0+(d1-d0)*i/n,r=pt(d);o.push(r[0],r[1]);
      if(avecN){const r2=pt(Math.min(sg.L,d+.004)),r1=pt(Math.max(0,d-.004)),tx=r2[0]-r1[0],ty=r2[1]-r1[1],l=Math.hypot(tx,ty)||1;o.push(-ty/l,tx/l);}}return o;};
    return{p:p,x:q[0],y:q[1],k:1,m:1,len:(d1-d0)*h,s1:tache(sw*h*.7),s2:tache(sw*h*1.6),ech:tache(2.4,true)};
  }
  function dixMorceaux(Gl,P,h){ /* le nombre en dix morceaux, un par blip : [signe, début, fin] en fraction de la longueur du tracé ; U[n] = l'union des n premiers (le point exclu) */
    const sg=Gl.signes,sw=Gl.sw,six=sg[2],fh=six.cum[Gl.NH]/six.L,t3=(1-fh)/3,fl=sg[0].cum[7]/sg[0].L;
    const SP=[[0,0,fl+.12],[0,fl+.12,1],[1,0,1],[2,0,fh],[2,fh,fh+t3],[2,fh+t3,fh+2*t3],[2,fh+2*t3,1],[3,0,fl-.015],[3,fl-.015,.62],[3,.62,1]];
    const G=SP.map(function(s){const g=sg[s[0]];
      if(g.pt){const q=P(g.pt.x,g.pt.y),p=new Path2D();p.moveTo(q[0]-.01,q[1]);p.lineTo(q[0]+.01,q[1]);return{p:p,x:q[0],y:q[1],k:g.dr*2/sw,m:3,len:g.dr*h*5,s1:[q[0],q[1]],s2:[q[0],q[1]],ech:[q[0],q[1],0,1]};} /* le point : un trait minuscule, rond, plus gros que le tube (sa lueur est triplée : une seule tache) */
      return morceau(g,s[1],s[2],P,h,sw);});
    const U=[];for(let n=0;n<=10;n++){const u=new Path2D();for(let j=0;j<n;j++)if(!sg[SP[j][0]].pt)u.addPath(G[j].p);U.push(u);}
    return{G:G,U:U};
  }
  function etoile(c,x,y,r,a){ /* une étoile à quatre branches effilées */
    const v=r*.62,q=r*.07;c.globalAlpha=a;c.fillStyle='#fff';c.beginPath();c.moveTo(x-r,y);c.quadraticCurveTo(x-q,y-q,x,y-v);c.quadraticCurveTo(x+q,y-q,x+r,y);c.quadraticCurveTo(x+q,y+q,x,y+v);c.quadraticCurveTo(x-q,y+q,x-r,y);c.fill();
  }
  function allumage(c,t,cx,cy,sw,h){ /* le trait de lumière de l'allumage (le titre faible s'aplatit dedans) ; à poser en addition */
    if(t>=.5)return;const L=W*.47*sort3(t/.2),a=1-lisse(.26,.5,t);
    if(a>0){halo(c,SPR.bl,cx,cy,L*1.02,sw*.8,.55*a);c.globalAlpha=a;c.fillStyle='#fff';c.fillRect(cx-L,cy-1,2*L,2);}
    halo(c,SPR.bl,cx,cy,h*.7,h*.7,Math.exp(-t/.09)*.4);
  }
  function coupFinal(c,t,cx,cy,sw,h,vg,anneau){ /* le coup final : traînée d'objectif, onde de choc (en addition) */
    if(t<TL.plein)return;const a=t-TL.plein,k=Math.exp(-a/.2);
    c.globalCompositeOperation='lighter';c.fillStyle='#fff';
    halo(c,SPR.bl,cx,cy,W*.5,sw*1.6,.7*k*vg);c.globalAlpha=.8*k*vg;c.fillRect(cx-W*.46,cy-1.5,W*.92,3);
    if(anneau){c.globalAlpha=Math.max(0,.6-a*1.4)*vg;c.strokeStyle='#fff';c.lineWidth=2*ku;c.beginPath();c.arc(cx,cy,h*.55+a*W*1.05,0,6.2832);c.stroke();}
    c.globalCompositeOperation='source-over';
  }
  function dNombre(c,M,sw,kc,kl,r1f,r2f){ /* un nombre tout allumé : la lueur (des taches de lumière en addition : un dégradé lisse) puis le cœur blanc, d'un seul coup */
    const r1=sw*r1f,r2=sw*r2f;
    c.lineCap='round';c.lineJoin='round';c.strokeStyle='#fff';
    if(kl>.01){c.globalCompositeOperation='lighter';
      for(const g of M.G){c.globalAlpha=Math.min(1,.14*g.m*kl);for(let i=0;i<g.s1.length;i+=2)c.drawImage(SPR.bl,g.s1[i]-r1,g.s1[i+1]-r1,2*r1,2*r1);
        c.globalAlpha=Math.min(1,.073*g.m*kl);for(let i=0;i<g.s2.length;i+=2)c.drawImage(SPR.bl,g.s2[i]-r2,g.s2[i+1]-r2,2*r2,2*r2);}
      c.globalCompositeOperation='source-over';}
    c.globalAlpha=kc;c.lineWidth=sw;c.stroke(M.U[10]);
    for(const g of M.G)if(g.k>1){c.lineWidth=sw*g.k;c.stroke(g.p);}
  }

  /* ---- 1. NÉON : le tube blanc que les blips allument morceau après morceau, dans le sens de l'écriture ---- */

  /* ---- 2. FEU D'ARTIFICE EN PIXELS (2026-10-22, Léo : « garde la rotation circulaire… au lieu d'un fil banal, un feu d'artifice qui suit le mouvement, un jaillissement de petits pixels minuscules colorés ; à la fin
     du mouvement ça explose et ça donne 1.61 en pixels ; puis les petits cubes se déconstruisent et tombent petit à petit, et ça laisse apparaître le gros logo CASH CAR qui explose » · puis : « le début de la spirale un tout petit
     peu plus lent, 1.61 plus petit, des pixels plus nobles, moins jouet »).
     DEUX têtes descendent en spirale d'or vers le centre (à chaque quart de tour le rayon est divisé par φ), comme avant ; mais plus de trait : elles SEMENT des étincelles (de petits carrés, snappés sur une grille de pixels,
     aux teintes douces : blanc chaud, or, glace, corail, lavande) qui jaillissent et retombent, et chaque blip fait éclater un cercle d'étincelles sur chaque tête. Au coup final le centre EXPLOSE : des centaines de cubes minuscules,
     d'un or champagne, partent du centre en arc et se posent en « 1.61 » (un trait fin, en pixels : 3 × 3 cubes par pixel) ; ils tiennent un instant, puis tombent un à un (au fondu, en silence) ; puis le noir, puis CASH CAR.
     Tout est une fonction de `t` (étincelles et cubes tirés d'avance), une poignée de carrés par image. ---- */
  const PHI=1.6180339887,PAL_FEU=['#fff1cf','#f4d27c','#e3a93c','#ffffff','#8fd4ff','#ff9f8a','#b79cff']; /* blanc chaud, or pâle, or, blanc, glace, corail, lavande */
  const MOTIFS={'1':['..#..','.##..','#.#..','..#..','..#..','..#..','..#..','..#..','.###.'],'.':['#'],'6':['..##.','.#...','#....','#....','####.','#...#','#...#','#...#','.###.']}; /* « 1.61 » en pixels, au trait d'un pixel */
  function bitmapsNombre(){ /* le nombre posé sur une même ligne de base : les cellules [colonne, ligne] de « 1 . 6 1 » */
    const G={},cells=[],gaps=[2,2,1],ordre=['1','.','6','1'];let hb=0;
    for(const ch of ordre){const L=MOTIFS[ch],pts=[];L.forEach(function(s,r){for(let c=0;c<s.length;c++)if(s[c]==='#')pts.push([c,r]);});G[ch]={w:L[0].length,h:L.length,pts:pts};hb=Math.max(hb,L.length);}
    let x0=0;ordre.forEach(function(ch,i){const gl=G[ch],dy=hb-gl.h;for(const p of gl.pts)cells.push([x0+p[0],dy+p[1]]);x0+=gl.w+(gaps[i]||0);});
    return{cols:x0,rows:hb,cells:cells};
  }

  /* ---- 3. POUSSIÈRE : des milliers de grains de lumière affluent et se posent au rythme des blips ; au coup final ils se figent en trait plein ; au fondu le nombre repart en poussière ---- */

  /* ---- 4. LUXE : un trait fin, droit, très espacé ; un fil de lumière avance d'un cran à chaque blip et laisse le nombre derrière lui ; au coup final un reflet le traverse, un filet se tire dessous ---- */

  /* ---- 5. HYPE : des chiffres lourds, penchés ; à chaque blip une COUPE sèche sur un autre morceau du nombre, de plus en plus large (écho, tranches décalées, traits de vitesse) ; au coup final l'image se pose en grand avec un éclair ---- */

  /* ---- 6-8. LES TROIS FILMS MOTEUR (2026-10-23, Léo : « refonte de toute l'intro du studio : luxe et cinéma, ~8 s, un toucher la saute, plus de wahou, plus cohérent avec le jeu, le son du moteur » ; « fais les trois »).
     `?label=caisse|pluie|route`. Même fin que les autres (le nombre en cubes d'or, le coup final, le fondu, le noir, CASH CAR), mais une montée de ~5 s sous un moteur qui prend des tours (trois changements de vitesse), coupée net par un freinage :
     CAISSE (des passages éclair d'une caisse dorée sur un filet d'or, puis elle freine en dévoilant « 1.61 » à mesure que ses phares passent), PLUIE (des pièces et des billets d'or tombent et s'empilent en « 1.61 », du bas vers le haut),
     ROUTE (la route suspendue file vers l'horizon, les étoiles s'étirent, la vitesse monte ; au freinage « 1.61 » se lève de l'horizon dans le ciel). ---- */

  /* 6. CAISSE */

  /* 7. PLUIE */

  /* 8. ROUTE */

  /* 9. SPHÈRE (2026-10-23, Léo : « l'effet éclaboussure étincelle artifice qui fait la courbe φ, explose et laisse paraître 1.61 en sphère, écrit en masse pour former une boule qui tourne sur elle-même, se désintègre, et toutes les lettres tombent, effet terre qui s'écroule ; puis CASH CAR surgit de l'ombre, zoom, et boom : ça explose en écran ciel »).
     Le feu d'artifice en spirale (dLabFeu, sans son nombre en cubes), puis les caractères « 1 . 6 1 » en masse jaillissent du centre et se posent en sphère (spirale de Fibonacci) qui tourne, penchée ; elle tremble, puis lâche : le bas d'abord, tout choit. */
  function geoLabSphere(){
    const land=W>H*1.15,R=Math.min(W*.24,H*(land?.27:.19)),cx=W/2,cy=H*(land?.5:.46),n=Math.round(Math.max(260,Math.min(520,W*H/420))),Rn=hasard(161),ga=Math.PI*(3-Math.sqrt(5));
    const F=()=>new Float32Array(n),px=F(),py=F(),pz=F(),dl=F(),tf=F(),fx=F(),gk=new Uint8Array(n),spr=[];
    for(let i=0;i<n;i++){const y=1-2*(i+.5)/n,r=Math.sqrt(1-y*y),th=i*ga;px[i]=r*Math.cos(th);py[i]=y;pz[i]=r*Math.sin(th);dl[i]=Rn()*.4;gk[i]=i%4;
      tf[i]=TL.fondu-.95+(1-(y+1)/2)*.4+Rn()*.18;fx[i]=(Rn()-.5)*120*ku;}
    const TEINTES=[['#fff0b0','#f0b030'],['#c8f0ff','#38b8ff'],['#ffc4d4','#ff4f86'],['#e4d4ff','#9a6bff']]; /* un « 1 . 6 1 » à quatre couleurs : or, bleu glace, rose, violet */
    ['1','.','6','1'].forEach(function(ch,ci){const cc=document.createElement('canvas');cc.width=48;cc.height=64;const x=cc.getContext('2d'),d=x.createLinearGradient(0,8,0,56);d.addColorStop(0,TEINTES[ci][0]);d.addColorStop(1,TEINTES[ci][1]);x.fillStyle=d;x.font='44px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(ch,24,34);spr.push(cc);});
    const sprH=[],HB=[42,200,340,265]; /* la boule qui change de couleur : 24 teintes par signe (départ : or, bleu glace, rose, violet), toutes décalées pareil au fil du temps */
    for(let ci=0;ci<4;ci++){sprH.push([]);for(let st=0;st<24;st++){const h=(HB[ci]+15*st)%360,cc=document.createElement('canvas');cc.width=48;cc.height=64;const x=cc.getContext('2d'),d=x.createLinearGradient(0,8,0,56);d.addColorStop(0,'hsl('+h+',100%,86%)');d.addColorStop(1,'hsl('+h+',95%,56%)');x.fillStyle=d;x.font='44px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(['1','.','6','1'][ci],24,34);sprH[ci].push(cc);}}
    return{sprH:sprH,R:R,cx:cx,cy:cy,n:n,px:px,py:py,pz:pz,dl:dl,tf:tf,fx:fx,gk:gk,spr:spr,gs:Math.max(9*ku,R*.2)};
  }
  /* 10. BOULE (2026-10-23 soir) : seulement la sphère de « 1.61 » ; elle tourne lentement tant que ça charge, s'arrête quand c'est prêt ; l'appui la fait exploser en CASH CAR (dActe3), puis le voile fond vers le jeu. */
  let pasSon=-1;
  let bYaw=0,bPit=0,bVy=0,bVp=0,bDown=false,bMove=0,bLx=0,bLy=0,bLt=0,bTP=null,bGlisse=false; /* la boule se tourne au doigt : angle et pente ajoutés, vitesse (inertie), le doigt est-il posé, la distance parcourue, un glissement vient-il d'avoir lieu */
  function boulePointeur(){
    if(!BOULE)return;
    sp.style.touchAction='none';
    sp.addEventListener('pointerdown',function(ev){
      bDown=true;bMove=0;bLx=ev.clientX;bLy=ev.clientY;bLt=performance.now();bVy=0;bVp=0;
      try{if(SON&&filmMuet&&iAC&&!SON.dr){ /* le film partait muet : ce premier geste libère le son, la suite sonne */
        iAC.resume();filmMuet=false;SON.suite();SON.charge(iAC.currentTime+.05,(performance.now()-tLance)/1000-latV,pretT!==null);}}catch(x){}
    },true);
    addEventListener('pointermove',function(ev){
      if(!bDown)return;
      const dx=ev.clientX-bLx,dy=ev.clientY-bLy,now=performance.now(),dtt=Math.max(.008,(now-bLt)/1000);
      bMove+=Math.abs(dx)+Math.abs(dy);bYaw+=dx*.012;bPit=borne(bPit+dy*.008,-1.1,1.1);bVy=borne(dx*.012/dtt,-8,8);bVp=borne(dy*.008/dtt,-5,5);bLx=ev.clientX;bLy=ev.clientY;bLt=now;
    });
    const lache=function(){if(!bDown)return;bDown=false;if(bMove>12){bGlisse=true;setTimeout(function(){bGlisse=false;},400);}if(performance.now()-bLt>120){bVy=0;bVp=0;}};
    addEventListener('pointerup',lache);addEventListener('pointercancel',lache);
  }
  function dBoule(c,t,e){
    const dtf=bTP===null?0:borne(t-bTP,0,.1);bTP=t;
    if(!bDown){bYaw+=bVy*dtf;bPit+=bVp*dtf;const f=Math.exp(-dtf*2.5);bVy*=f;bVp*=f;bPit*=Math.exp(-dtf*.8);}
    const W0=.5,tau=.7,pt=pretT,tp=tapT;
    const rot=.6+bYaw+W0*t; /* elle tourne sans jamais s'arrêter */
    const cr=Math.cos(rot),sr=Math.sin(rot),ct=Math.cos(.38+bPit),st=Math.sin(.38+bPit),pls=Math.sin(t*3.2),R=e.R*(1+.06*pls),gs=e.gs*(1+.05*pls),s=tp===null?-1:Math.max(0,t-tp); /* elle respire : un léger pouls */
    const ex=s>0?9*(1-Math.pow(1-borne(s/.7,0,1),3)):0,ea=s>0?1-lisse(.15,.75,s):1;
    c.save();
    c.globalCompositeOperation='lighter';halo(c,SPR.or,e.cx,e.cy,R*1.7,R*1.7,(.2*lisse(.8,4,t)+.08*pls)*ea+(s>0?.9*Math.exp(-s*7):0));c.globalCompositeOperation='source-over';
    const pas=Math.floor(t*2.2)%24; /* la teinte avance de 15° toutes les 0,45 s : un tour complet en 11 s */
    if(pasSon!==Math.floor(t*2.2)){pasSon=Math.floor(t*2.2);if(t>3&&tp===null&&pasSon%2===0){try{if(SON&&!filmMuet&&iAC&&SON.dr)SON.note(iAC.currentTime+.02,pasSon>>1);}catch(x){}}} /* une cloche tous les deux pas : elle suit la couleur */
    if(PCI_ON){if(ea>0){ /* (passe perf PC, voir LE FILM SANS TRAVAIL REFAIT) le même dessin au bit près : mêmes expressions, même ordre (les points de derrière, puis ceux de devant, par i croissant) */
      if(!e.pciT0){const T0=new Float64Array(e.n);for(let i=0;i<e.n;i++)T0[i]=.8+Math.pow(i/e.n,.9)*3.2;e.pciT0=T0;e.pciQ=new Float64Array(e.n*4);e.pciZ=new Int8Array(e.n);
        if(typeof createImageBitmap==='function')e.sprH.forEach(function(L,ci){L.forEach(function(cc,st){try{createImageBitmap(cc).then(function(b){if(e.sprH[ci][st]===cc)e.sprH[ci][st]=b;},function(){});}catch(x){}});});} /* les vignettes en ImageBitmap (mêmes pixels) dès qu'elles sont prêtes */
      const T0=e.pciT0,Q=e.pciQ,Z=e.pciZ,gr=1+.6*borne(s/.7,0,1);
      for(let i=0;i<e.n;i++){
        const k=borne((t-T0[i])/.55,0,1);if(k<=0){Z[i]=-1;continue;}
        const b=(1-Math.pow(1-k,3))*(1+ex),x1=e.px[i]*cr+e.pz[i]*sr,z1=-e.px[i]*sr+e.pz[i]*cr,y2=e.py[i]*ct-z1*st,z2=e.py[i]*st+z1*ct;
        const sx=e.cx+x1*R*b,sy=e.cy+y2*R*b;if(sx<-gs||sx>W+gs||sy<-gs||sy>H+gs){Z[i]=-1;continue;}
        const dp=z2*.5+.5,sz=gs*(.55+.45*dp)*gr;Z[i]=z2>=0?1:0;Q[4*i]=sx-sz*.35;Q[4*i+1]=sy-sz*.5;Q[4*i+2]=sz;Q[4*i+3]=(.5+.5*dp)*lisse(0,.15,k)*ea;
      }
      for(let pass=0;pass<2;pass++)for(let i=0;i<e.n;i++)if(Z[i]===pass){c.globalAlpha=Q[4*i+3];c.drawImage(e.sprH[e.gk[i]][pas],Q[4*i],Q[4*i+1],Q[4*i+2]*.7,Q[4*i+2]);}
    }}else
    if(ea>0)for(let pass=0;pass<2;pass++)for(let i=0;i<e.n;i++){
      const k=borne((t-(.8+Math.pow(i/e.n,.9)*3.2))/.55,0,1);if(k<=0)continue; /* noir d'abord, puis la boule se dessine point après point, en spirale du bas vers le haut */
      const b=(1-Math.pow(1-k,3))*(1+ex),x1=e.px[i]*cr+e.pz[i]*sr,z1=-e.px[i]*sr+e.pz[i]*cr,y2=e.py[i]*ct-z1*st,z2=e.py[i]*st+z1*ct;
      if((z2>=0?1:0)!==pass)continue;
      const sx=e.cx+x1*R*b,sy=e.cy+y2*R*b;if(sx<-gs||sx>W+gs||sy<-gs||sy>H+gs)continue;
      const dp=z2*.5+.5,sz=gs*(.55+.45*dp)*(1+.6*borne(s/.7,0,1));c.globalAlpha=(.5+.5*dp)*lisse(0,.15,k)*ea;c.drawImage(e.sprH[e.gk[i]][pas],sx-sz*.35,sy-sz*.5,sz*.7,sz);
    }
    c.globalAlpha=1;c.restore();
  }
  const LABELS={boule:{geo:geoLabSphere,dessin:dBoule}};

  /* ---- LE GROS LOGO CASH CAR : chaque lettre est peinte une fois (extrusion brune, face dorée ou couchant), puis posée/secouée à volonté ---- */
  function peintLettre(c,ch,mot,fs,dp,mg){
    c.setTransform(S,0,0,S,0,0);
    const base=mg+fs*.88,capH=fs*.875,cxm=(fs+2*mg)/2,cym=base-capH/2;
    c.translate(cxm,cym);c.transform(1,0,-.1944,1,0,0);c.translate(-cxm,-cym); /* la pente de la vitesse, −11° : celle du logo de l'accueil */
    c.font=fs+'px "Press Start 2P",monospace';c.textAlign='center';c.textBaseline='alphabetic';
    for(let k=dp;k>=1;k--){const q=dp>1?(k-1)/(dp-1):0;c.fillStyle='rgb('+Math.round(entre(110,42,q))+','+Math.round(entre(63,21,q))+',0)';c.fillText(ch,cxm,base+k);} /* l'épaisseur */
    c.lineJoin='miter';c.lineWidth=Math.max(1.5,fs*.045);c.strokeStyle='rgba(58,26,0,.95)';c.strokeText(ch,cxm,base);
    const d=c.createLinearGradient(0,base-capH,0,base);
    const st=mot===0?[[0,'#fffef6'],[.16,'#fff2bd'],[.34,'#ffd84f'],[.48,'#ffb000'],[.60,'#8f4c00'],[.70,'#c57800'],[.84,'#ffcf48'],[1,'#fff1ba']] /* CASH : l'or métallique, une bande ambrée à l'horizon */
      :[[0,'#fff5c8'],[.2,'#ffd75e'],[.4,'#ff9d3a'],[.58,'#ff5d5a'],[.76,'#ff2f8e'],[1,'#b13cff']]; /* CAR : le coucher de soleil */
    st.forEach(s=>d.addColorStop(s[0],s[1]));
    c.fillStyle=d;c.fillText(ch,cxm,base);
  }
  function faitLogo(){
    const lg0=W>H*1.15,fs=Math.min(.80*W/4,(lg0?.26:.32)*H),dp=Math.max(3,Math.round(fs*.09)),mg=Math.ceil(fs*.5),lw=fs+2*mg,lh=fs+dp+2*mg,cyL=H*(lg0?.43:.47),lg=fs*1.22,lettres=[];
    [['CASH',0],['CAR',1]].forEach(function(m,li){
      const yc=cyL+(li-.5)*lg,dx=-.1944*(yc-cyL); /* l'inclinaison décale la ligne du haut à droite, celle du bas à gauche */
      for(let i=0;i<m[0].length;i++){
        const c=document.createElement('canvas');c.width=Math.ceil(lw*S);c.height=Math.ceil(lh*S);
        peintLettre(c.getContext('2d'),m[0][i],li,fs,dp,mg);
        lettres.push({cv:c,sr:silhouette(c,'rgb(255,50,70)'),sc:silhouette(c,'rgb(40,210,255)'),x:W/2+dx+(i-(m[0].length-1)/2)*fs,y:yc,ox:-lw/2,oy:-(mg+fs*.4425),w:lw,h:lh,ph:lettres.length*1.9,mot:li,sw:null});
      }
    });
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    for(const l of lettres){x0=Math.min(x0,l.x+l.ox);y0=Math.min(y0,l.y+l.oy);x1=Math.max(x1,l.x+l.ox+l.w);y1=Math.max(y1,l.y+l.oy+l.h);}
    const gm=fs*.5,gx=x0-gm,gy=y0-gm,gw=x1-x0+2*gm,gh=y1-y0+2*gm,glow=document.createElement('canvas');glow.width=Math.ceil(gw*S);glow.height=Math.ceil(gh*S);
    const gc=glow.getContext('2d'),BIG=6000; /* le halo : l'ombre portée d'un logo posé HORS du canvas (seule son ombre y retombe) */
    for(const l of lettres){gc.save();gc.shadowOffsetX=BIG;gc.shadowColor=l.mot?'rgba(255,100,170,.95)':'rgba(255,190,70,.95)';gc.shadowBlur=fs*.3*S;
      gc.drawImage(l.cv,(l.x+l.ox-gx)*S-BIG,(l.y+l.oy-gy)*S,l.cv.width,l.cv.height);gc.restore();}
    const gt=document.createElement('canvas');gt.width=lettres[0].cv.width;gt.height=lettres[0].cv.height; /* la feuille où un reflet est découpé dans la lettre */
    for(const l of lettres)l.sw=silhouette(l.cv,'#fff');
    LOGO={lettres:lettres,glow:glow,gx:gx,gy:gy,gw:gw,gh:gh,cy:cyL,fs:fs,bw:x1-x0,bh:y1-y0,gt:gt};
  }

  /* ---- LES FISSURES ET LES ÉCLATS : une toile d'araignée (rais + anneaux, bosselée), clippée à l'écran ---- */
  function clipRect(P,x0,y0,x1,y1){
    let out=P;
    for(const b of [[0,1,x0],[0,-1,-x1],[1,1,y0],[1,-1,-y1]]){ /* garde les points où sens × coordonnée ≥ seuil */
      const inp=out;out=[];if(!inp.length)break;
      for(let i=0;i<inp.length;i++){const a=inp[i],c=inp[(i+1)%inp.length],da=b[1]*a[b[0]]-b[2],dc=b[1]*c[b[0]]-b[2];
        if(da>=0)out.push(a);
        if((da>=0)!==(dc>=0)){const k=da/(da-dc);out.push([a[0]+(c[0]-a[0])*k,a[1]+(c[1]-a[1])*k]);}}
    }
    return out;
  }
  function fracture(px,py){ /* l'écran se brise en TUILES carrées de tailles inégales (petites près du logo), comme une mosaïque de pixels : le style du jeu */
    const R=hasard(Math.floor(Math.random()*1e9)),cx=Math.round(px!=null?px:W/2),cy=Math.round(py!=null?py:LOGO.cy);
    const dMax=Math.max(Math.hypot(cx,cy),Math.hypot(W-cx,cy),Math.hypot(cx,H-cy),Math.hypot(W-cx,H-cy));
    const base=Math.max(64,Math.round(Math.max(W,H)/6.5/8)*8),tuiles=[];
    const decoupe=function(x,y,s,lv){
      const d=Math.hypot(x+s/2-cx,y+s/2-cy)/dMax,p=lv>=3?0:Math.max(0,1.05-d*2.2)*(1-.18*lv);
      if(s>=32&&R()<p){const h=s/2;decoupe(x,y,h,lv+1);decoupe(x+h,y,h,lv+1);decoupe(x,y+h,h,lv+1);decoupe(x+h,y+h,h,lv+1);}
      else tuiles.push({x:x,y:y,s:s,cx:x+s/2,cy:y+s/2,dn:d});
    };
    const gx0=cx-Math.ceil(cx/base)*base,gy0=cy-Math.ceil(cy/base)*base; /* le centre du logo est un sommet de la grille */
    for(let y=gy0;y<H;y+=base)for(let x=gx0;x<W;x+=base)decoupe(x,y,base,0);
    tuiles.sort((a,b)=>b.dn-a.dn); /* les plus éloignées d'abord : celles du centre passent par-dessus */
    MESH={tuiles:tuiles,cx:cx,cy:cy,dMax:dMax};
  }
  function dEtincelles(c,L,t){
    c.globalCompositeOperation='lighter';c.fillStyle='rgb(255,214,120)';
    for(let i=0;i<L.length;i++){const s=L[i],a=t-s.tb;if(a<0||a>s.life)continue;const k=a/s.life,al=(1-k)*(1-k),x=s.x+s.vx*a,y=s.y+s.vy*a+.5*520*ku*a*a,z=s.sz*(1-.5*k)*ku;
      c.globalAlpha=al;c.fillRect(x,y,z,z);if(s.w>.7)halo(c,SPR.or,x,y,z*5,z*5,.4*al);}
    c.globalCompositeOperation='source-over';c.globalAlpha=1;
  }

  /* ---- ACTE 3 : le logo (mode 1 = la photo, sans secousse ni fissures, pour les éclats) ---- */
  function secousse(t){ /* le logo ATTEND qu'on le touche : un frémissement léger, après le coup du claquement */
    const u=t-TL.slam;
    if(RM)return{x:0,y:0,r:0,k:.2,a:0};
    const k=.2+.05*Math.sin(u*2.1),a=(.4+.9*lisse(.3,1.4,u))*ku;
    let jx=0,jy=0;
    if(u>=0){const e=Math.exp(-u*14);jx+=Math.cos(.7)*16*e*ku;jy+=Math.sin(.7)*11*e*ku;}
    const f1=Math.sin(u*97+1.3)+Math.sin(u*151+.4)*.6+Math.sin(u*233+2.1)*.35,f2=Math.sin(u*89+2.2)+Math.sin(u*167+1.1)*.6+Math.sin(u*251+.7)*.35;
    return{x:f1*a*.5+jx,y:f2*a*.5+jy,r:(Math.sin(u*71)+Math.sin(u*123+1))*.5*(.003+.006*k),k:k,a:a};
  }
  function dLettres(c,t,u,s,alpha,sk,fantomes,reflet){
    const L=LOGO,cxL=W/2,cyL=L.cy,k=sk.k;
    c.save();c.translate(cxL,cyL);c.scale(s,s);c.translate(-cxL,-cyL);
    const ca=(1.2+sk.a*.8+16*Math.exp(-u*9))*ku;
    for(let i=0;i<L.lettres.length;i++){const l=L.lettres[i],ui=u-i*.004;if(ui<0)continue;
      const a=lisse(0,.05,ui)*alpha,jx=(Math.sin(u*61+l.ph)+Math.sin(u*107+l.ph*2))*sk.a*.45,jy=(Math.sin(u*67+l.ph*1.5)+Math.sin(u*113+l.ph))*sk.a*.45,jr=Math.sin(u*83+l.ph*3)*.012*k;
      c.save();c.translate(l.x+jx,l.y+jy);c.rotate(jr);
      if(fantomes){c.globalCompositeOperation='lighter';c.globalAlpha=.5*a*Math.max(Math.exp(-u*5),.2+.8*k);c.drawImage(l.sr,l.ox-ca,l.oy,l.w,l.h);c.drawImage(l.sc,l.ox+ca,l.oy,l.w,l.h);c.globalCompositeOperation='source-over';}
      c.globalAlpha=a;c.drawImage(l.cv,l.ox,l.oy,l.w,l.h);
      if(reflet>0&&reflet<1){ /* le reflet : la silhouette de la lettre, éclairée par une bande qui passe (découpée dans la feuille de travail) */
        const gt=L.gt,x=gt.getContext('2d'),bx=entre(L.gx,L.gx+L.gw,reflet)-(l.x+jx+l.ox),bw=L.fs*.55;
        x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,gt.width,gt.height);x.drawImage(l.sw,0,0);
        x.globalCompositeOperation='source-in';x.setTransform(S,0,0,S,0,0);
        const d=x.createLinearGradient(bx-bw,0,bx+bw,bw*.5);d.addColorStop(0,'rgba(255,255,255,0)');d.addColorStop(.5,'rgba(255,255,255,.95)');d.addColorStop(1,'rgba(255,255,255,0)');
        x.fillStyle=d;x.fillRect(0,0,l.w,l.h);x.globalCompositeOperation='source-over';
        c.globalCompositeOperation='lighter';c.globalAlpha=.85*a;c.drawImage(gt,l.ox,l.oy,l.w,l.h);c.globalCompositeOperation='source-over';}
      c.restore();}
    c.restore();
  }
  function dIndice(c,t){ /* l'invitation, très discrète : le logo attend qu'on le touche */
    const a=lisse(0,.8,t-TL.slam-1.2)*(.45+.25*Math.sin((t-TL.slam)*3.1));if(a<=.01)return;
    c.save();c.globalAlpha=a;c.fillStyle='#fff1cf';c.textAlign='center';c.textBaseline='middle';c.font=Math.max(9,Math.round(11*ku))+'px "Press Start 2P",monospace';
    c.fillText(LANG==='fr'?'TOUCHE':'TAP',W/2,Math.min(H-16*ku,LOGO.cy+1.55*LOGO.fs));c.restore();
  }
  function dActe3(c,t,mode){
    const u=t-TL.slam,L=LOGO,cxL=W/2,cyL=L.cy,sk=mode?{x:0,y:0,r:0,k:1,a:0}:secousse(t),k=sk.k,ap=lisse(0,.2,u);
    c.save();c.translate(cxL,cyL);c.rotate(sk.r);c.translate(-cxL+sk.x,-cyL+sk.y);
    c.globalCompositeOperation='lighter';
    const pulse=1+.08*Math.sin(u*38)*k;
    halo(c,SPR.or,cxL,cyL,W*.95*pulse,Math.max(H*.4,W*.8)*pulse,(.30+.34*k)*ap); /* la lumière derrière */
    {const rr=Math.hypot(W,H)*.62;c.save();c.translate(cxL,cyL);c.rotate(RM?0:u*.16);c.globalAlpha=(.10+.32*k)*lisse(0,.25,u);c.drawImage(RAY,-rr,-rr,2*rr,2*rr);c.restore();}
    c.globalAlpha=(.55+.4*k)*ap;c.drawImage(L.glow,L.gx,L.gy,L.gw,L.gh);
    c.globalCompositeOperation='source-over';
    const sl=u<.2?1+.16*(1-sort3(u/.2)):1+(u<.8?.035*Math.sin((u-.26)*26)*Math.exp(-(u-.26)*8):0);
    if(u<.2&&!mode){for(let m=4;m>=1;m--)dLettres(c,t,u,sl*(1+.03*m),.2/m,sk,false);} /* le claquement : les images de l'approche, en traînée */
    dLettres(c,t,u,sl,1,sk,!mode,mode?-1:((u-.42)%2.8)/.6); /* un reflet traverse le logo après le claquement, puis toutes les 2,8 s */
    /* l'éclair du claquement et son onde de choc */
    c.globalCompositeOperation='lighter';
    const rf=Math.hypot(W,H)*.5;halo(c,SPR.bl,cxL,cyL,rf,rf,Math.exp(-u*12)*.8*(u>=0?1:0));
    if(u<.55){c.globalAlpha=Math.max(0,.7-u*1.3);c.strokeStyle='rgb(255,224,150)';c.lineWidth=(6-9*u)*ku;c.beginPath();c.arc(cxL,cyL,u*W*1.2,0,6.2832);c.stroke();}
    c.restore();
  }

  /* LE « PRESENTS » (2026-10-24, Léo : « enlève le premier CASH CAR ; après l'explosion, PRESENTS, puis l'écran menu ciel avec la musique qui apparaît ») : la boule explose, le mot s'écrit
     lettre à lettre sur le noir (or, interlettrage qui se resserre), tient, s'éteint ; PUIS le voile fond sur le ciel, et c'est là, là seulement, que la musique du lobby démarre (`reveler`).
     Le gros logo CASH CAR du film (`dActe3`) n'est plus montré après l'appui : le premier CASH CAR du jeu est celui du menu. s = secondes depuis l'appui. */
  const PRES_FIN=4.1; /* l'instant (s après l'appui) où le texte est éteint ; le voile fond juste après (2026-10-24 : 2,5 → 4,1 s, Léo : « laisse le temps d'apprécier ») */
  function dPresente(c,s,e){
    const sor=1-lisse(PRES_FIN-.7,PRES_FIN,s);if(sor<=.004)return;
    /* (2026-10-24, Léo : « au lieu de PRESENTS, 1.61 STUDIO PRESENTS ») deux lignes : « 1.61 STUDIO » en grand (le « 1.61 » blanc chaud, STUDIO en or), un filet d'or qui s'ouvre depuis le centre,
       puis « PRESENTS » plus petit, très espacé, crème. La ligne du haut s'écrit lettre à lettre (0,7 s), le filet suit, le mot du bas arrive en dernier. */
    const t1='1.61 STUDIO',t2='PRESENTS',n1=t1.length,n2=t2.length;
    const px=Math.max(9,Math.round(Math.min(W/23,H/9,30))),px2=Math.max(8,Math.round(px*.5)),k=sort3((s-.7)/1.5),esp=px*(.95-.5*k);
    const tot=n1*px+(n1-1)*esp,y1=e.cy-px*.1,yR=e.cy+px*.62,y2=yR+px2*2.1;
    c.save();c.textAlign='left';c.textBaseline='alphabetic';c.font=px+'px "Press Start 2P",monospace';
    const grO=c.createLinearGradient(0,y1-px,0,y1);grO.addColorStop(0,'#fff2be');grO.addColorStop(.5,'#ffd75e');grO.addColorStop(1,'#e8a53a');
    const grB=c.createLinearGradient(0,y1-px,0,y1);grB.addColorStop(0,'#ffffff');grB.addColorStop(1,'#ffe9b8');
    let x=W/2-tot/2;
    for(let i=0;i<n1;i++){
      const la=lisse(.7+i*.07,1.15+i*.07,s)*sor;
      if(la>.004){c.globalAlpha=la;c.fillStyle='#1c0430';c.fillText(t1[i],x+px*.12,y1+px*.12);c.fillStyle=i<4?grB:grO;c.fillText(t1[i],x,y1);}
      x+=px+esp;
    }
    /* le filet d'or : il s'ouvre depuis le centre */
    const fl=sort3((s-1.55)/.9);
    if(fl>.004){const wl=tot*.62*fl,g=c.createLinearGradient(W/2-wl/2,0,W/2+wl/2,0);g.addColorStop(0,'rgba(255,215,94,0)');g.addColorStop(.5,'rgba(255,226,150,1)');g.addColorStop(1,'rgba(255,215,94,0)');
      c.globalAlpha=sor*.9;c.fillStyle=g;c.fillRect(W/2-wl/2,yR,wl,Math.max(1,Math.round(px*.1)));}
    /* « PRESENTS » : plus petit, l'interlettrage se resserre doucement */
    const k2=sort3((s-1.9)/1.5),esp2=px2*(2.4-1.3*k2),tot2=n2*px2+(n2-1)*esp2;
    c.font=px2+'px "Press Start 2P",monospace';x=W/2-tot2/2;
    for(let i=0;i<n2;i++){
      const la=lisse(1.9+i*.09,2.4+i*.09,s)*sor;
      if(la>.004){c.globalAlpha=la*.92;c.fillStyle='#1c0430';c.fillText(t2[i],x+px2*.12,y2+px2*.12);c.fillStyle='#ffe9c4';c.fillText(t2[i],x,y2);}
      x+=px2+esp2;
    }
    c.restore();
  }

  /* ---- LA CASSE : la photo de la scène, découpée en éclats qui volent (position = fonction du temps) ---- */
  function prepSnap(){ /* la photo du logo « au repos » (celle que les tuiles montrent) et sa version en gros pixels : prises un peu AVANT la casse, pour que l'image de l'impact n'ait pas à les fabriquer */
    if(SNAP)return;
    const sn=document.createElement('canvas');sn.width=cv.width;sn.height=cv.height;
    const sg=sn.getContext('2d');sg.setTransform(S,0,0,S,0,0);sg.fillStyle='#000';sg.fillRect(0,0,W,H);dActe3(sg,TL.casse,1);
    SNAP=sn;SNAPPIX=pixelise(sn,Math.max(4,Math.round(5*ku)));
  }
  function casser(tc,muet){
    if(casse)return;
    casse=true;tCasse=tc;
    try{
    SK0=muet?{x:0,y:0}:secousse(tc);
    if(TOUCH)fracture(TOUCH.x,TOUCH.y); /* la casse part de l'endroit TOUCHÉ */
    prepSnap(); /* la scène « au repos » (déjà prise un peu avant, sinon ici) */
    const R=hasard(Math.floor(Math.random()*1e9)),ku2=Math.hypot(W,H)/2/465,L=[];
    for(const s of MESH.tuiles){
      const dx=s.cx-MESH.cx,dy=s.cy-MESH.cy,d=Math.hypot(dx,dy),dn=d/MESH.dMax,ang=d>1?Math.atan2(dy,dx):R()*6.28;
      const vr=ku2*(1000/(1+3*dn)+140+R()*160),life=.8+R()*.45;
      L.push({x:s.x,y:s.y,s:s.s,cx:s.cx,cy:s.cy,dl:dn*.06+R()*.015,vx:Math.cos(ang)*vr,vy:Math.sin(ang)*vr,zs:.5+3.2*(1-dn)*(.6+.4*R()),Z:1.5+1.4*(1-dn),life:life,g:ku2*800}); /* Z : l'agrandissement de la loupe */
    }
    ECL=L;
    const E2=[],R2=hasard(21);for(let i=0;i<120;i++){const a=R2()*6.2832,v=(200+R2()*700)*ku;E2.push({tb:0,x:MESH.cx+(R2()-.5)*60,y:MESH.cy+(R2()-.5)*40,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80*ku,life:.5+R2()*.9,sz:1.2+R2()*3,w:R2()});}ETC=E2;
    const R3=hasard(61),uu=Math.max(2,Math.round(2.2*ku)),P3=[];for(let i=0;i<190;i++){const a=R3()*6.2832,v=(260+R3()*950)*ku;P3.push({x:MESH.cx+(R3()-.5)*50,y:MESH.cy+(R3()-.5)*30,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120*ku,sz:(1+Math.floor(R3()*3))*uu,col:R3()<.35?2:R3()<.6?1:R3()<.75?0:Math.floor(R3()*7),zs:1+R3()*3.2,life:.7+R3()*.85,dl:R3()*.05});}PXC=P3;
    }catch(e){window.__introErr=String(e&&e.stack||e).slice(0,400);if(!muet)secours();return;} /* les éclats n'ont pas pu se préparer : le jeu s'ouvre, sans casse */
    if(muet)return;
    ouvrir();reveler();
    programmerCasse(true); /* (le son de la casse : tout de suite, c'est le toucher) */
    setTimeout(finir,(DUREE_CASSE+.15)*1000);
  }
  function dEclats(c,t4){
    c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);c.setTransform(S,0,0,S,0,0);
    const gk=Math.exp(-t4*18),gx=SK0.x*gk,gy=SK0.y*gk;
    c.globalCompositeOperation='lighter'; /* le souffle de lumière, DERRIÈRE les éclats */
    const rr=entre(.18,1.25,sort3(t4/.55))*MESH.dMax;halo(c,SPR.ch,MESH.cx,MESH.cy,rr,rr,.85*(1-lisse(.05,.75,t4)));
    c.globalCompositeOperation='source-over';c.globalAlpha=1;
    const pq=Math.max(4,Math.round(5*ku)),fg=GAMECV?GAMECV.width/W:0;
    for(const s of ECL){ /* chaque tuile : la photo du logo, nette puis en gros pixels, et par-dessus une LOUPE sur le jeu (agrandi, en gros pixels) */
      const tt=Math.max(0,t4-s.dl);if(tt>=s.life)continue;
      const tm=tt<.03?0:tt-.03,a=1-lisse(.42*s.life,s.life,tt),sc=1+s.zs*tm*(1+.8*tm),w=s.s*sc,x=gx+s.cx+s.vx*tm,y=gy+s.cy+s.vy*tm+.5*s.g*tm*tm,l=x-w/2,tp=y-w/2;
      const ka=lisse(0,.2,tm),kb=lisse(.05,.3,tm)*a;
      if(a*(1-ka)>.01){c.imageSmoothingEnabled=true;c.globalAlpha=a*(1-ka);c.drawImage(SNAP,s.x*S,s.y*S,s.s*S,s.s*S,l,tp,w,w);}
      c.imageSmoothingEnabled=false;
      if(ka>.01&&SNAPPIX){c.globalAlpha=a*ka;c.drawImage(SNAPPIX,s.x/pq,s.y/pq,s.s/pq,s.s/pq,l,tp,w,w);}
      if(GAMECV&&kb>.02){const sw_=w/s.Z;c.globalAlpha=kb;c.drawImage(GAMECV,(x-sw_/2)*fg,(y-sw_/2)*fg,sw_*fg,sw_*fg,l,tp,w,w);}
      if(GLOSS){c.globalAlpha=.22*a;c.drawImage(GLOSS,l,tp,w,w);}
      c.globalAlpha=.75*a;c.strokeStyle='rgb(255,226,160)';c.lineWidth=ku;c.strokeRect(Math.round(l)+.5,Math.round(tp)+.5,Math.round(w)-1,Math.round(w)-1);
    }
    c.imageSmoothingEnabled=true;
    c.globalAlpha=1;
    dEtincelles(c,ETC,t4);
    if(PXC){c.imageSmoothingEnabled=false; /* les cubes-pixels de la casse */
      for(const q of PXC){const tt=t4-q.dl;if(tt<0||tt>q.life)continue;const f=tt/q.life,z=q.sz*(1+q.zs*tt),x=Math.round(MESH.cx+q.vx*tt-z/2),y=Math.round(MESH.cy+q.vy*tt+.5*900*ku*tt*tt-z/2);
        c.globalAlpha=f<.6?1:1-(f-.6)/.4;c.fillStyle=PAL_FEU[q.col];c.fillRect(x,y,z,z);}
      c.globalAlpha=1;}
    const fa=.9*Math.exp(-t4*9); /* le flash de l'impact */
    if(fa>.02){c.globalCompositeOperation='lighter';halo(c,SPR.bl,MESH.cx,MESH.cy,W*.7,H*.55,fa);c.globalCompositeOperation='source-over';}
    c.globalAlpha=1;
  }

  /* ---- LE SON : tout est fabriqué ici (WebAudio) ; `A` peut être un AudioContext ou un OfflineAudioContext (le banc de mesure).
     Le travail est ÉTALÉ, pour qu'aucune image ne soit sacrifiée : au toucher seulement l'allumage ; `suite()` juste après (réverbération, blips,
     coup final) ; `acte3()` dans le noir complet (claquement, tension) ; `casse(q)` à l'instant de la casse. ---- */
  let IR48=null; /* la réponse de la réverbération, calculée À L'ATTENTE du toucher (10 ms), à 48 kHz */
  function pixelise(src,pq){ /* une copie en petit (1 pixel pour pq × pq) : redessinée sans lissage, elle donne de gros pixels */
    const c2=document.createElement('canvas');c2.width=Math.max(1,Math.ceil(W/pq));c2.height=Math.max(1,Math.ceil(H/pq));const x=c2.getContext('2d');x.imageSmoothingEnabled=true;x.drawImage(src,0,0,c2.width,c2.height);return c2;
  }
  function demanderPrise(){ /* l'intro demande une photo de la scène 3D du jeu : la boucle du jeu la prend juste après son rendu (voir boucle-6-hud.js) ; on la verra, agrandie, à travers les tuiles */
    if(priseFaite)return;priseFaite=true;
    window.__introPrise=function(src){try{GAMECV=pixelise(src,Math.max(4,Math.round(5*ku)));}catch(e){GAMECV=null;}}; /* (aucune lecture de pixel : elle forcerait le processeur graphique à finir son image, un accroc juste avant la casse) */
  }
  function irPret(){
    if(IR48)return;
    const sr=48000,n=Math.floor(sr*2.4),c=[new Float32Array(n),new Float32Array(n)];
    for(let ch=0;ch<2;ch++){const d=c[ch];let y=0;for(let i=0;i<n;i++){const k=i/n,a=.9-.8*Math.pow(k,.35);y+=a*((Math.random()*2-1)-y);d[i]=y*Math.pow(1-k,2.4)*(k<.004?k/.004:1);}}
    IR48=c;
  }
  function construitSon(A,t0,dest){
    const comp=A.createDynamicsCompressor();comp.threshold.value=-11;comp.knee.value=10;comp.ratio.value=6;comp.attack.value=.003;comp.release.value=.2;
    const trim=A.createGain();trim.gain.value=.38;comp.connect(trim);trim.connect(dest); /* −8,4 dB APRÈS le compresseur : mesuré au banc, le claquement et la casse montaient à −0,1 dBFS (RMS −9,6 dB) ; ils tiennent maintenant vers −7,5, comme le plus fort de l'ancienne intro (la fission : −8,4 / −16,9) */
    const master=A.createGain();master.gain.value=1;master.connect(comp);
    const busB=A.createGain();busB.gain.value=1;busB.connect(master); /* la tension (grondement, craquements) : un seul fader pour la couper si on passe */
    const nz=A.createBuffer(1,A.sampleRate*2,A.sampleRate);{const d=nz.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
    const send=A.createGain();send.connect(master); /* (branché à la réverbération par `suite`) */
    const eco=A.createGain();eco.gain.value=1; /* l'écho en ping-pong des blips */
    {const dL=A.createDelay(.5),dR=A.createDelay(.5),fL=A.createGain(),fR=A.createGain(),lp=A.createBiquadFilter(),mg=A.createChannelMerger(2);
      dL.delayTime.value=.085;dR.delayTime.value=.127;fL.gain.value=.32;fR.gain.value=.32;lp.type='lowpass';lp.frequency.value=3200;
      eco.connect(lp);lp.connect(dL);lp.connect(dR);dL.connect(fL);fL.connect(dL);dR.connect(fR);fR.connect(dR);dL.connect(mg,0,0);dR.connect(mg,0,1);mg.connect(master);}
    const env=(t,pk,atk,dec)=>{const x=A.createGain();x.gain.setValueAtTime(.0001,t);x.gain.exponentialRampToValueAtTime(Math.max(.0003,pk),t+atk);x.gain.exponentialRampToValueAtTime(.0002,t+atk+dec);return x;};
    const pan=x=>{if(A.createStereoPanner){const p=A.createStereoPanner();p.pan.value=x||0;return p;}return A.createGain();};
    function oscil(sortie,type,f0,f1,t,d,pk,atk,dec,x,w){ /* un ton qui glisse de f0 à f1 en d secondes, enveloppé ; w = part envoyée à la réverbération */
      const o=A.createOscillator(),e=env(t,pk,atk,dec),p=pan(x);
      o.type=type;o.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+d);
      o.connect(e);e.connect(p);p.connect(sortie);
      if(w){const s=A.createGain();s.gain.value=w;p.connect(s);s.connect(send);}
      o.start(t);o.stop(t+atk+dec+.05);
    }
    function souffle(sortie,t,d,type,f0,f1,q,pk,atk,dec,x,w){ /* un souffle de bruit filtré, dont le filtre glisse de f0 à f1 */
      const s=A.createBufferSource();s.buffer=nz;s.loop=true;
      const fl=A.createBiquadFilter(),e=env(t,pk,atk,dec),p=pan(x);
      fl.type=type;fl.Q.value=q||1;fl.frequency.setValueAtTime(f0,t);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t+d);
      s.connect(fl);fl.connect(e);e.connect(p);p.connect(sortie);
      if(w){const m=A.createGain();m.gain.value=w;p.connect(m);m.connect(send);}
      s.start(t,Math.random()*1.5);s.stop(t+atk+dec+.05);
    }
    function blip(t,f,pk,x,court){ /* LE BLIP : deux carrés filtrés qui montent d'un bond, un clic ; même hauteur à chaque fois (pas une note) */
      const d=court?.04:.07;
      for(const dt of [1,1.006]){
        const o=A.createOscillator(),e=env(t,pk*.5,.0015,d),fl=A.createBiquadFilter(),p=pan(x);
        o.type='square';o.frequency.setValueAtTime(f*.78*dt,t);o.frequency.exponentialRampToValueAtTime(f*dt,t+.012);
        fl.type='lowpass';fl.frequency.value=f*4.2;fl.Q.value=.8;
        o.connect(fl);fl.connect(e);e.connect(p);p.connect(master);p.connect(eco);
        const s=A.createGain();s.gain.value=.16;p.connect(s);s.connect(send);
        o.start(t);o.stop(t+d+.03);
      }
      souffle(master,t,.006,'highpass',4500,0,1,pk*.45,.0008,.005,x,0);
    }
    const T=x=>t0+x;
    /* le silence : le son coupe quand le label se dissout, et ne revient qu'avec le claquement du logo */
    /* 0. l'allumage : un coup sourd, un souffle qui monte, un tic */
    const R={ctx:A,master:master,busB:busB,fait:{suite:false,acte3:false}};
    R.suite=function(){
      if(R.fait.suite)return;R.fait.suite=true;
      irPret();const rev=A.createConvolver(); /* un grand hall sombre : du bruit qui s'éteint en s'étouffant */
      {const n=Math.floor(IR48[0].length*A.sampleRate/48000),b=A.createBuffer(2,n,A.sampleRate);
        for(let ch=0;ch<2;ch++){if(A.sampleRate===48000)b.copyToChannel(IR48[ch],ch);else{const d=b.getChannelData(ch),src=IR48[ch],r=48000/A.sampleRate;for(let i=0;i<n;i++){const p=i*r,j=Math.floor(p),f=p-j;d[i]=src[j]*(1-f)+(src[j+1]||0)*f;}}}
        rev.buffer=b;}
      const revOut=A.createGain();revOut.gain.value=.62;rev.connect(revOut);revOut.connect(master);send.connect(rev);
    };
    R.acte3=function(){}; /* (plus de claquement programmé : il sonne à l'appui, `boum`) */
    const ACC=[73.42,110,146.83,220,293.66,440]; /* l'accord de la marque : Ré, quintes et octaves, net et ouvert (pas de notes serrées) */
    function accord(q,pk,att,dec,w){for(let i=0;i<ACC.length;i++){oscil(master,'sine',ACC[i],ACC[i],q,0,pk*(i<2?1.5:1),att,dec,(i-4)*.12,w);oscil(master,'triangle',ACC[i]*1.003,ACC[i]*1.003,q,0,pk*.6,att,dec,(4-i)*.12,w);}}
    R.charge=function(q,el,pret){ /* le chargement : un grave qui monte avec la boule, mais VIVANT : il bat au rythme du pouls de la boule (3,2 rad/s), un pad dont le filtre respire, un chœur de médiums qui s'ouvre en tremblant, un souffle, un voile qui scintille, et des étincelles à mesure que les chiffres apparaissent */
      el=el||0;const dur=Math.max(.8,4.6-el),top=pret?.45:1,gs=[],oc=[];
      const P=A.createGain();P.gain.value=.78;P.connect(master); /* le pouls : tout le chargement passe là, et la boule le fait battre */
      const lf=A.createOscillator(),lg=A.createGain();lf.type='sine';lf.frequency.value=3.2/6.2832;lg.gain.value=.22;lf.connect(lg);lg.connect(P.gain);lf.start(q);oc.push(lf);
      const sub=A.createOscillator(),sg=A.createGain(),s2=A.createOscillator(),s2g=A.createGain();sub.type='sine';sub.frequency.setValueAtTime(41.2,q);sub.frequency.exponentialRampToValueAtTime(73.42,q+dur);
      s2.type='triangle';s2.frequency.setValueAtTime(82.4,q);s2.frequency.exponentialRampToValueAtTime(146.83,q+dur);s2g.gain.value=.22;s2.connect(s2g);s2g.connect(sg); /* l'octave au-dessus, pour que le grave sonne aussi sur un petit haut-parleur */
      sg.gain.setValueAtTime(.0003,q);sg.gain.exponentialRampToValueAtTime(.4*top,q+dur);sub.connect(sg);sg.connect(P);sub.start(q);s2.start(q);gs.push(sg);oc.push(sub,s2);
      const lp=A.createBiquadFilter(),pg=A.createGain(),pr=A.createGain();lp.type='lowpass';lp.Q.value=2.5;lp.frequency.setValueAtTime(180,q);lp.frequency.exponentialRampToValueAtTime(2600,q+dur);
      const fl=A.createOscillator(),fg=A.createGain();fl.type='sine';fl.frequency.value=.11;fg.gain.value=320;fl.connect(fg);fg.connect(lp.frequency);fl.start(q);oc.push(fl); /* le filtre respire, lentement */
      pg.gain.setValueAtTime(.0003,q);pg.gain.exponentialRampToValueAtTime(.12*top,q+dur);pr.gain.value=.5;lp.connect(pg);pg.connect(P);pg.connect(pr);pr.connect(send);gs.push(pg);
      const CH=[{b:73.42,u:[146.83,220,293.66,369.99]},{b:61.74,u:[123.47,185,246.94,293.66]},{b:98,u:[196,246.94,293.66,392]},{b:55,u:[164.81,220,277.18,329.63]}]; /* la progression du pad : Ré, Si mineur, Sol, La, en boucle sans fin */
      const vo=[];CH[0].u.forEach(function(f,i){const o=A.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=[5,-8,6,-5][i];o.connect(lp);o.start(q);oc.push(o);vo.push(o);});
      let ci=0,iv=0;const suivant=function(){ /* l'accord suivant arrive en glissant (un cycle toutes les 7,85 s = quatre pulsations de la boule) */
        try{if(A.state==='closed'){clearInterval(iv);return;}ci=(ci+1)%CH.length;const tt=A.currentTime+.05,c=CH[ci];
          sub.frequency.setTargetAtTime(c.b,tt,.8);s2.frequency.setTargetAtTime(c.b*2,tt,.8);vo.forEach(function(o,i){o.frequency.setTargetAtTime(c.u[i],tt,.7);});}catch(x){clearInterval(iv);}};
      if(!(typeof OfflineAudioContext!=='undefined'&&A instanceof OfflineAudioContext))iv=setInterval(suivant,7850);
      const sh=A.createBufferSource(),bp=A.createBiquadFilter(),hg=A.createGain();sh.buffer=nz;sh.loop=true;bp.type='bandpass';bp.Q.value=2;bp.frequency.setValueAtTime(3500,q);bp.frequency.exponentialRampToValueAtTime(9000,q+dur);
      hg.gain.setValueAtTime(.0003,q);hg.gain.exponentialRampToValueAtTime(.05*top,q+dur);sh.connect(bp);bp.connect(hg);hg.connect(P);sh.start(q);oc.push(sh);gs.push(hg);
      /* le chœur : les notes hautes de l'accord (Ré, La, Ré, La), chacune doublée et désaccordée, qui s'ouvrent en tremblant, de gauche à droite */
      const cg=A.createGain(),cr=A.createGain();cg.gain.setValueAtTime(.0003,q);cg.gain.exponentialRampToValueAtTime(.06*top,q+dur*1.1);cr.gain.value=.55;cg.connect(P);cg.connect(cr);cr.connect(send);gs.push(cg);
      [293.66,440,587.33,880].forEach(function(f,k){for(const dc of [-6,6]){const o=A.createOscillator(),pn=pan(dc>0?.6-k*.2:-.6+k*.2),tg=A.createGain(),tl=A.createOscillator(),tq=A.createGain();
        o.type=k%2?'triangle':'sine';o.frequency.value=f;o.detune.value=dc;tg.gain.value=.5;tl.type='sine';tl.frequency.value=.23+.07*k+(dc>0?.04:0);tq.gain.value=.4;tl.connect(tq);tq.connect(tg.gain);
        o.connect(tg);tg.connect(pn);pn.connect(cg);o.start(q);tl.start(q);oc.push(o,tl);}});
      const br=A.createBufferSource(),bb=A.createBiquadFilter(),bg=A.createGain();br.buffer=nz;br.loop=true;bb.type='bandpass';bb.Q.value=.8;bb.frequency.setValueAtTime(600,q);bb.frequency.exponentialRampToValueAtTime(1500,q+dur);
      bg.gain.setValueAtTime(.0003,q);bg.gain.exponentialRampToValueAtTime(.035*top,q+dur);br.connect(bb);bb.connect(bg);bg.connect(P);br.start(q);oc.push(br);gs.push(bg); /* le souffle du médium : de l'air autour du grave */
      const PF=[1174.7,1318.5,1480,1760,2349.3,2960];
      for(let i=0;i<64;i++){const te=.8+Math.pow(i/64,.9)*3.2;if(te<el)continue;const f=PF[(i*5)%PF.length];oscil(master,'sine',f,f,q+(te-el),0,.045,.002,.35,(Math.random()-.5)*1.4,.55);}
      R.dr={g:gs,o:oc,get iv(){return iv;}};
    };
    const PENTA=[587.33,659.25,739.99,880,987.77,1174.66,987.77,880,739.99,659.25]; /* Ré majeur pentatonique, montée puis descente : jamais fausse avec l'accord */
    R.note=function(q,k){ /* une cloche douce à chaque pas de couleur de la boule */
      const f=PENTA[k%PENTA.length],x=((k*7)%5-2)*.3;
      oscil(master,'sine',f,f,q,0,.05,.004,1.1,x,.7);oscil(master,'triangle',f*2,f*2,q,0,.012,.004,.5,x,.7);
    };
    R.pret=function(q){ /* c'est prêt : l'accord de la marque s'ouvre en grand, un grave l'ancre, puis le chargement retombe en nappe douce */
      accord(q,.04,.15,1.5,.5);oscil(master,'sine',55,36,q,1,.4,.006,1,0,.3);oscil(master,'sine',2349.3,2349.3,q+.05,0,.04,.002,.6,0,.6);
      souffle(master,q,.6,'highpass',2000,9000,1,.08,.05,.6,0,.5);
    };
    R.boum=function(q){ /* l'appui : la boule explose en CASH CAR : un coup de grave énorme, un métal qui sonne, un grand souffle, et l'accord de la marque en pleine puissance */
      if(R.dr){clearInterval(R.dr.iv);for(const g of R.dr.g){g.gain.cancelScheduledValues(q);g.gain.setTargetAtTime(0,q,.08);}R.dr.o.forEach(function(o){try{o.stop(q+.5);}catch(e){}});R.dr=null;}
      oscil(master,'sine',70,28,q,1.8,1.4,.003,1.8,0,.45);oscil(master,'sine',140,50,q,.4,.7,.003,.4,0,.2);
      souffle(master,q,.7,'lowpass',12000,300,.8,.6,.001,.7,0,.4);souffle(master,q,.02,'highpass',3000,0,1,.4,.001,.015,0,0);
      [1,2.76,5.4,8.93].forEach(function(r,i){oscil(master,'sine',190*r,190*r,q,0,.16/(i+1),.002,1.7-.3*i,i%2?.4:-.4,.5);});
      souffle(master,q,.6,'bandpass',500,9000,1.4,.28,.01,.6,0,.5);souffle(master,q+.05,1,'highpass',5000,0,.8,.08,.05,1,0,.6);
      accord(q+.02,.13,.004,2.2,.6);
    };
    /* 5. LA CASSE (programmée au dernier moment par `programmerCasse` : on peut passer le film) */
    R.casse=function(q){
      souffle(master,q,.34,'lowpass',16000,900,.8,.80,.001,.32,0,.25);
      oscil(master,'sine',92,21,q,1.5,.85,.004,1.45,0,.35);oscil(master,'triangle',230,62,q,.3,.34,.003,.28,0,.2);
      souffle(master,q,.9,'bandpass',360,3800,1.1,.30,.12,.80,0,.3);
      for(let i=0;i<64;i++){const k=i/64;souffle(master,q+.02+Math.pow(k,1.6)*1.4,.03,'bandpass',2600+Math.random()*6800,0,14,.11*(1-.72*k)*(.45+.55*Math.random()),.0008,.028+Math.random()*.04,(Math.random()-.5)*1.6,.35);} /* la pluie de verre */
      master.gain.setTargetAtTime(0,q+2.2,.3);
    };
    return R;
  }
  let dSon=.2; /* la marge (s) entre le toucher et le départ du son : de quoi construire le son sans que l'image ne saccade (réglée sur la durée mesurée) */
  function son(geste){
    if(SANS_SON||!SND.sfx||!(VOL.sfx>0))return; /* mute SON ou curseur EFFETS à zéro : l'intro reste muette */
    try{iAC=preAC||new (window.AudioContext||window.webkitAudioContext)();}catch(e){iAC=null;preAC=null;return;}
    preAC=null;
    try{iAC.resume();}catch(e){}
    const vol9=iAC.createGain();vol9.gain.value=(typeof sfxVol==='function'?sfxVol():VOL.sfx);vol9.connect(iAC.destination); /* le curseur EFFETS, après le compresseur */
    if(!geste&&iAC.state!=='running'){ /* le film part SANS toucher et le navigateur refuse le son : il passe muet ; la casse, elle, sonnera au toucher (le contexte attend, déjà construit) */
      filmMuet=true;VOL9=vol9;SON=construitSon(iAC,0,vol9);latV=0;return;}
    t0a=iAC.currentTime+dSon;latV=.05+Math.min(.25,iAC.outputLatency||iAC.baseLatency||0); /* l'image attend le son : elle part quand on l'ENTEND */
    const b0=performance.now();
    VOL9=vol9;SON=construitSon(iAC,t0a,vol9);SONS_DEMO[0]=SON;
    SON.suite();if(BOULE)SON.charge(t0a,0,false); /* tout le premier acte se fabrique MAINTENANT, avant que l'image ne parte : plus d'à-coup pendant les blips */
    dSon=Math.min(.6,Math.max(.12,(performance.now()-b0)/1000*1.6));
    tLance=performance.now()+Math.max(0,t0a-iAC.currentTime)*1000; /* le film part quand le son part : l'horloge de l'image est calée sur celle de l'AudioContext */
  }
  function programmerCasse(vite){
    if(!SON||sonCasseFait)return;sonCasseFait=true;
    try{const A=iAC;if(vite)SON.busB.gain.setTargetAtTime(0,A.currentTime,.03);SON.casse(vite?A.currentTime+.02:Math.max(A.currentTime+.01,t0a+TL.casse));}catch(e){}
    const A2=iAC;setTimeout(function(){try{A2.close();}catch(e){}},4200);
  }

  /* ---- LE RACCORD AVEC LE JEU (celui de l'ancienne intro : voir `hide()` dans init.js) ---- */
  function ouvrir(){ /* à l'instant du noir complet, sous le voile : le jeu se prépare sans qu'on le voie (et se remet à dessiner : voir `loop`) */
    if(ouvert)return;ouvert=true;
    try{if(!AC&&typeof initAudio==='function')initAudio();}catch(e){}
    try{if(typeof openGarage==='function'&&!IS_MOBILE)openGarage();}catch(e){}
  }
  function reveler(){ /* à l'instant où l'écran noir casse : le voile n'est plus l'écran titre, il ne prend plus les touchers */
    window.__introCouvre=false;if(revele)return;revele=true;
    sp.id=''; /* ⚠ retire l'id AVANT tout : start() et les écrans d'accueil se gardent par `getElementById('splash')` ; et la règle CSS #splash part avec lui. z-index 1000 : les éclats volent PAR-DESSUS tout (la plaque du 1er accueil s'ouvre ~0,85 s après, à 200+) */
    sp.style.cssText='position:fixed;inset:0;z-index:1000;display:block;pointer-events:none;overflow:hidden;background:transparent';
    setTimeout(function(){try{window.dispatchEvent(new Event('resize'));}catch(e){}},30); /* le jeu était en pause sous le film : s'il a été retaillé entre-temps (cadre tourné, volet agrandi), il recalcule sa taille (un bandeau blanc à droite, vu le 23/10) */
    setTimeout(function(){try{document.dispatchEvent(new Event('cc:revele'));}catch(e){}},60); /* le menu joue son entrée dessous */
    setTimeout(function(){try{if(!started){if(musicEl&&musicEl.paused&&musicMenuUrl()&&musicEl.src.indexOf(musicMenuUrl())>=0)musicEl.currentTime=0;musicMenu();}}catch(e){}},260); /* la musique du ciel part avec le ciel */
    setTimeout(function(){window.__intro=null;},1500); /* (le voile s'ouvre : on ne recharge pas encore) */
  }
  function finir(){
    if(fini)return;fini=true;
    window.__introCouvre=false;cancelAnimationFrame(raf);removeEventListener('keydown',kd);removeEventListener('resize',remesure);document.removeEventListener('visibilitychange',introVis);
    try{sp.remove();}catch(e){}
    SNAP=null;SNAPPIX=null;GAMECV=null;ECL=null;ETC=null;PXC=null;LOGO=null;MESH=null;RAY=null;
  }
  function secours(){ /* l'intro a planté : le jeu s'ouvre sur-le-champ, quoi qu'il arrive (sans casse, sans fondu) */
    if(fini)return;
    try{ouvrir();}catch(e){}
    try{reveler();}catch(e){}
    try{if(SON){SON.master.gain.cancelScheduledValues(0);SON.master.gain.setTargetAtTime(0,iAC.currentTime,.05);}}catch(e){}
    finir();
  }
  function finRapide(){ /* qui passe avant le claquement du logo (ou le mode balade) : un fondu court, sans casse */
    if(fini||casse)return;
    ouvrir();reveler();
    if(SON){try{SON.master.gain.cancelScheduledValues(0);SON.master.gain.setTargetAtTime(0,iAC.currentTime,.05);const A2=iAC;setTimeout(function(){try{A2.close();}catch(e){}},500);}catch(e){}}
    sp.style.transition='opacity .4s ease-out';sp.style.opacity='0';
    setTimeout(finir,450);
  }
  function fonduDoux(){ /* « réduire les animations » : ni secousse ni éclats, le voile s'efface simplement */
    if(doux||fini)return;doux=true;
    ouvrir();reveler();
    sp.style.transition='opacity .7s ease-out';sp.style.opacity='0';
    if(SON){try{SON.master.gain.setTargetAtTime(0,iAC.currentTime+.3,.3);const A2=iAC;setTimeout(function(){try{A2.close();}catch(e){}},2500);}catch(e){}}
    setTimeout(finir,800);
  }
  function tapBoule(){ /* l'appui, une fois que c'est prêt : la boule explose en CASH CAR, le jeu se prépare dessous, puis le voile fond */
    if(!lance||fini||tapT!==null||pretT===null)return;
    tapT=(performance.now()-tLance)/1000-latV;passee=true;
    try{if(iAC&&iAC.state!=='running')iAC.resume();}catch(e){}
    try{if(SON){SON.suite();SON.boum(iAC.currentTime+.02);}}catch(e){}
    try{ouvrir();}catch(e){}
    setTimeout(function(){window.__introCouvre=false;},150);
    setTimeout(fonduDoux,PRES_FIN*1000+80);
  }
  function passer(){
    if(BOULE){tapBoule();return;}
    if(!lance||fini||casse||passee)return;passee=true;
    try{if(iAC&&iAC.state!=='running')iAC.resume();}catch(e){} /* le toucher libère le son (film muet) : la casse sonne */
    const t=(performance.now()-tLance)/1000-latV;
    if(!DEMO&&!RM&&t>=TL.slam+.3){programmerCasse(true);casser(t,false);}
    else if(!DEMO&&!RM&&t<TL.noir-.1){passee=false;sauterAuLogo(t);} /* pendant le 1.61 : on saute au noir juste avant le logo */
    else if(!DEMO&&!RM)passee=false; /* le logo claque : trop tôt pour casser */
    else finRapide();
  }
  function sauterAuLogo(t){
    const cible=TL.noir+.02;
    tLance=performance.now()-(cible+latV)*1000;
    if(SON&&!filmMuet&&iAC){ /* le son : l'ancien se tait, un neuf est calé sur la nouvelle heure (le claquement sonne à l'heure du logo) */
      try{SON.master.gain.cancelScheduledValues(0);SON.master.gain.setTargetAtTime(0,iAC.currentTime,.02);}catch(e){}
      try{t0a=iAC.currentTime-cible-latV;SON=construitSon(iAC,t0a,VOL9);}catch(e){}
    }
  }

  /* ---- LA BOUCLE, l'attente du toucher, et le lancement ---- */
  let TPS=[]; /* (banc) la durée de chaque étape de `prepare`, en ms */
  function etape(nom,f){const a=performance.now();f();TPS.push(nom+' '+(performance.now()-a).toFixed(1));}
  let prepEn=''; /* la taille pour laquelle tout est prêt */
  function prepare(){ /* les ressources qui dépendent de la taille ; la police pixel pour le gros logo (apresPolice redessine quand elle est chargée) */
    TPS=[];SNAP=null;SNAPPIX=null;PCI_N.prepares++; /* (la photo du logo se refait à la nouvelle taille) */
    etape('ressources',function(){if(!SPR.bl)faitRessources();});
    etape('etiquette',function(){const ids=DEMO?ORDRE_LABELS:[LABELS[LAB_ID]?LAB_ID:'neon'];for(const k of ids)ETS[k]=LABELS[k].geo();});
    etape('logo',function(){try{apresPolice(function(){faitLogo();});}catch(e){faitLogo();}});
    etape('fracture',fracture);
    prepEn=W+'x'+H+'x'+S;
  }
  let forceId=null; /* (banc) un label précis, quel que soit celui de l'adresse */
  const PERIODE_DEMO=()=>TL.noir+.55; /* la durée d'un tour de la démo */
  const SONS_DEMO={};let VOL9=null;
  function sonDemo(idx,tl){ /* la démo : le son de chaque tour est fabriqué juste avant (le tour suivant à 1,4 s du tour en cours) */
    if(!iAC||!VOL9||SANS_SON)return;
    for(const k of [idx,idx+1]){if(SONS_DEMO[k]||(k>idx&&tl<1.4))continue;try{const r=construitSon(iAC,t0a+k*PERIODE_DEMO(),VOL9);r.suite();SONS_DEMO[k]=r;}catch(e){}}
  }
  function rendu(t){
    g.setTransform(S,0,0,S,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
    if(casse){dEclats(g,t-tCasse);return;}
    g.fillStyle='#000';g.fillRect(0,0,W,H);
    if(BOULE){const e=ETS.boule||(ETS.boule=geoLabSphere());dBoule(g,t,e);if(tapT!==null){g.globalCompositeOperation='source-over';g.globalAlpha=1;dPresente(g,Math.max(0,t-tapT),e);}g.globalCompositeOperation='source-over';g.globalAlpha=1;return;}
    let tl=t,id=forceId||(LABELS[LAB_ID]?LAB_ID:'neon'),idx=0;
    if(DEMO){const T=PERIODE_DEMO(),n=ORDRE_LABELS.length;idx=Math.floor(Math.max(0,t)/T);tl=Math.max(0,t)-idx*T;id=forceId||ORDRE_LABELS[idx%n];} /* la démo : les labels s'enchaînent en boucle */
    if(tl<TL.noir){const e=ETS[id]||(ETS[id]=LABELS[id].geo());LABELS[id].dessin(g,tl,e);}else if(!DEMO&&t>=TL.slam)dActe3(g,t,0);;
    g.globalCompositeOperation='source-over';g.globalAlpha=1;if(!DEMO&&t>=TL.slam){g.drawImage(VIG,0,0,W,H);if(!casse)dIndice(g,t);}
    if(DEMO&&!forceId){g.textAlign='center';g.textBaseline='alphabetic';g.fillStyle='#fff';g.font='9px "Press Start 2P",monospace';g.globalAlpha=.55;g.fillText((idx%ORDRE_LABELS.length+1)+'/'+ORDRE_LABELS.length+'  '+NOMS_LABELS[id],W/2,H-36*ku);g.font='7px "Press Start 2P",monospace';g.globalAlpha=.3;g.fillText('TOUCHE = JOUER',W/2,H-20*ku);g.globalAlpha=1;}
  }
  let erreurs=0;
  function boucle(now){
    if(fini)return;
    raf=requestAnimationFrame(boucle);
    if(manuel)return;
    if(!casse){const t=PCI_ON?pciTaille(now):tailleEcran();if(t[0]!==W||t[1]!==H)remesure();} /* l'écran a changé de taille sans que `resize` nous le dise (cadre du volet, rotation) : tout se refait à la bonne taille (vu le 23/10 : logo énorme, coupé à droite) */
    if(!lance)return;
    try{
      const t=(now-tLance)/1000-latV;
      if(BOULE){if(pretT===null&&t>=4.6&&document.readyState==='complete'&&(!document.fonts||document.fonts.status!=='loading')){pretT=t;try{if(SON&&!filmMuet)SON.pret(iAC.currentTime+.02);}catch(e){}}if(PCI_60&&tapT===null&&pciSaute(now))return;rendu(t);return;} /* la boule : prête dès que la page est chargée (et après 2,6 s au moins) */
      if(DEMO){const T=PERIODE_DEMO(),idx=Math.floor(Math.max(0,t)/T);if(idx>0)sonDemo(idx,t-idx*T);else sonDemo(0,t);rendu(t);return;}
      if(!ouvert&&t>=TL.noir)ouvrir();
      if(!revele&&!doux&&!passee){ /* le jeu ne dessine rien derrière le film (voir `loop`), SAUF quelques images dans le NOIR COMPLET : ses accrocs du premier dessin (relecture du ciel, compilations) ne se voient pas là, et il reprend à chaud 0,5 s avant la casse */
        if(t>=TL.noir+.08&&t<TL.noir+.22){if(window.__introCouvre)window.__introCouvre=false;}
        else if(t>=TL.noir+.22){if(!window.__introCouvre)window.__introCouvre=true;} /* puis il se tait jusqu'au toucher */
      }
      if(!SNAP&&t>=TL.noir+.30)prepSnap(); /* (le logo au repos, pour les tuiles) */
      if(!priseFaite&&t>=TL.noir+.14)demanderPrise(); /* une photo du jeu, juste avant la casse : les tuiles en feront des loupes */ /* le jeu se remet à dessiner, juste avant que l'écran casse (il faut qu'il y ait une image dessous) */
      if(SON&&!filmMuet&&!SON.fait.acte3&&t>=TL.noir-.15)SON.acte3(); /* le claquement et la tension se fabriquent dans le noir complet */
      rendu(t);
    }catch(e){window.__introErr=String(e&&e.stack||e).slice(0,400);if(++erreurs>2)secours();} /* une image qui plante ne doit jamais laisser l'écran noir : on ouvre le jeu */
  }
  function eteintTitre(){ /* le titre faible de l'attente s'aplatit en trait, dans le trait de lumière de l'allumage */
    if(!ttl)return;
    ttl.classList.remove('tease');ttl.style.animation='none';ttl.style.transition='transform .15s cubic-bezier(.6,0,1,.4),opacity .15s linear';ttl.style.opacity='0';ttl.style.transform='scale(1.15,.02)';
    setTimeout(function(){ttl.style.display='none';},180);
  }
  function lancer(geste){
    if(lance||fini)return;lance=true;RM=reduit();tLance=performance.now();window.__intro='joue'; /* l'intro passe : pas de rechargement */
    eteintTitre();
    window.__introCouvre=true; /* le film couvre l'écran : le jeu ne calcule ni ne dessine plus rien dessous, jusqu'à 0,5 s avant la casse (voir `boucle`) */
    try{if(prepEn!==W+'x'+H+'x'+S)prepare();}catch(e){} /* (déjà prêt si on a attendu un peu sur l'écran titre) */
    try{son(geste);}catch(e){} /* le son ne doit JAMAIS bloquer les visuels */
    if(!iAC)tLance=performance.now(); /* (sans son : le film part tout de suite) */
  }
  function chauffe(){ /* pendant l'attente du toucher, hors de vue : tout ce qui est lourd la première fois (le calcul du film, le code du son) se fait maintenant, pas au toucher */
    if(lance||fini)return;
    try{if(!SPR.bl||prepEn!==W+'x'+H+'x'+S)prepare();}catch(e){}
    try{irPret();const b0=performance.now(),A=new OfflineAudioContext(2,4800,48000),r=construitSon(A,0,A.destination);r.suite();r.acte3();dSon=Math.min(.6,Math.max(.12,(performance.now()-b0)/1000*.8));}catch(e){} /* (la 1re construction est la plus lente : la marge en tient compte) */
  }
  function kd(){if(!lance&&!fini)lancer(true);else if(lance&&performance.now()-tLance>600)passer();}
  function pose(e){try{const r=cv.getBoundingClientRect();TOUCH={x:e.clientX-r.left,y:e.clientY-r.top};}catch(x){TOUCH=null;}}
  function remesure(){pciDer=-1e9;if(fini||casse)return;mesure();if(lance){if(PCI_ON&&prepEn===W+'x'+H+'x'+S){PCI_N.prepEvitees++;return;}try{prepare();}catch(e){}}} /* (passe perf PC) un `resize` qui ne change ni la taille ni l'échelle (le zoom du cadre bureau en envoie) ne refait plus tout le film : boule, logo, fracture étaient refaits À L'IDENTIQUE (même règle que `lancer` et `chauffe`) */

  mesure();
  setTimeout(irPret,500); /* pendant l'attente du toucher : 10 ms de calcul, hors de vue */
  setTimeout(chauffe,900); /* puis le reste (quelques dizaines de ms, hors de vue) */
  addEventListener('keydown',kd);addEventListener('resize',remesure);
  /* ===== L'INTRO SE TAIT EN ARRIÈRE-PLAN (24/10, relecture : « l'appli passe derrière pendant l'intro ») =====
     Le jeu endort SON contexte audio quand la page est cachée (voir init.js), pas celui de l'intro : la boule attend le toucher indéfiniment,
     son pad tourne en boucle — sur le site (Chrome Android), il continuait de jouer dans la poche. Caché : le contexte de l'intro s'endort ;
     revenu : il se réveille (le film muet, lui, attend toujours son toucher). */
  function introVis(){try{if(fini||!iAC||iAC.state==='closed')return;if(document.hidden){if(iAC.state==='running')iAC.suspend();}else if(lance&&!filmMuet&&iAC.state!=='running')iAC.resume();}catch(e){}}
  document.addEventListener('visibilitychange',introVis);
  sp.addEventListener('pointerdown',pose,true);boulePointeur();
  sp.addEventListener('click',function(){
    if(BOULE&&bGlisse){bGlisse=false;return;} /* un glissement qui tourne la boule n'est pas un appui */
    try{musicDeverrouille();}catch(e){} /* ⚠ LE geste qui libère la musique pour toute la session (voir le lecteur unique) */
    if(!lance)lancer(true);else if(performance.now()-tLance>600)passer(); /* le logo attend : le toucher CASSE l'écran (avant le logo : le film passe) */
  });
  function autoLance(){ /* le film part TOUT SEUL : le navigateur dit si le son est permis sans toucher (sinon le film passe muet, la casse sonnera au toucher) */
    if(lance||fini)return;
    let A=null;if(!SANS_SON&&SND.sfx&&VOL.sfx>0){try{A=new (window.AudioContext||window.webkitAudioContext)();}catch(e){A=null;}}
    if(!A){lancer(false);return;}
    preAC=A;let fait=false;const go=function(){if(fait)return;fait=true;if(lance){if(A!==iAC)try{A.close();}catch(e){}return;}lancer(false);}; /* (24/10, relecture : « le son de l'intro coupé net ») un toucher pendant l'attente de A.resume() (≤ 0,3 s) lance le film SUR A (son() prend preAC) : A n'est fermé que s'il n'a pas servi — avant, le film tapé tôt passait muet */
    try{A.resume().then(go,go);}catch(e){go();}
    setTimeout(go,300);
  }
  function essaiAuto(n){ /* attendre que la page soit chargée, la police prête et la fenêtre visible */
    if(lance||fini)return;
    if(document.hidden||document.readyState!=='complete'||(n<24&&document.fonts&&document.fonts.status==='loading')){setTimeout(function(){essaiAuto(n+1);},250);return;}
    autoLance();
  }
  if(!DEMO&&!BALADE&&!SIMU_JEU&&!/[?&]depart=toucher\b/.test(location.search))setTimeout(function(){essaiAuto(0);},BOULE?500:1700); /* (?depart=toucher : l'ancien départ au toucher) */
  if(BALADE||SIMU_JEU)setTimeout(finRapide,80); /* (atelier des nuages, simulateur) droit au jeu, sans l'intro */
  raf=requestAnimationFrame(boucle);
  let vuRev=false;
  window.dbgIntro={TL:TL,construitSon:function(A,t0,d){const r=construitSon(A,t0,d);r.suite();r.acte3();return r;},
    voir:function(t,id){manuel=true;forceId=id||null;if(!lance){lance=true;RM=reduit();eteintTitre();}if(!LOGO||!Object.keys(ETS).length){mesure();prepare();}
      if(t<TL.casse){casse=false;ECL=null;if(vuRev){vuRev=false;sp.id='splash';sp.style.cssText='';}}else if(!casse)casser(TL.casse,true);
      if(casse&&!vuRev){vuRev=true;sp.id='';sp.style.cssText='position:fixed;inset:0;z-index:1000;display:block;pointer-events:none;overflow:hidden;background:transparent';} /* (banc) le voile transparent : on voit le jeu dessous */
      rendu(t);return{W:W,H:H,S:S};},
    mesure:function(){mesure();prepare();return{W:W,H:H,S:S,etapes:TPS};},
    labels:Object.keys(LABELS),
    boule:function(o){if(o.pret!==undefined)pretT=o.pret;if(o.tap!==undefined)tapT=o.tap;}, /* (banc) l'instant où c'est prêt / où l'on appuie */
    toucher:function(x,y){TOUCH=x==null?null:{x:x,y:y};}, /* (banc) l'endroit où l'écran casse */
    prise:function(){priseFaite=false;GAMECV=null;demanderPrise();}, /* (banc) la photo du jeu pour les loupes : la boucle la prend à sa prochaine image */
    etat:function(){return{muet:filmMuet,label:LAB_ID,lentille:!!GAMECV,tuiles:MESH&&MESH.tuiles?MESH.tuiles.length:0,lance:lance,fini:fini,casse:casse,doux:doux,RM:RM,manuel:manuel,erreurs:erreurs,t:lance?(performance.now()-tLance)/1000-latV:null,K:K,son:iAC?iAC.state+'@'+iAC.currentTime.toFixed(2)+' lat='+latV.toFixed(3):null};}};
})();
