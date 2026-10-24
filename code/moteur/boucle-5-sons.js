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
              subBoom((.06+.07*engGear/gn)*q9);noiseBurst(.05,.07*q9,3000);if(engGear>=gn-1)crackle(Math.max(.3,eng.crk));
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
        if(engWasUp&&!thr&&engRpm>.42&&eng.crk>0&&Math.random()<eng.crk)crackle(eng.crk);
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
        }else{stt(gainN.gain,mode==='fall'?.004:0,AC.currentTime,mode==='boom'?.05:.1);stt(engLfoG.gain,0,AC.currentTime,.1);}
        if(mode==='boom'){engRpm=0;const e0=ENG_SND[engLvl<0?0:engLvl]||ENG_SND[0]; // idem : le ralenti de la mort suit le MOTEUR
          stt(osc.frequency,e0.i,AC.currentTime,.3);stt(osc2.frequency,e0.i,AC.currentTime,.3);}
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
    if(PCUBE.on)pcubeTick(t,speedKmh); // (2026-10-17) LE PORTAIL DE CUBES : l'onde, les flotteurs, l'aspiration
    // (console de son) LE PORTAIL APPROCHE : un bourdon qui monte, UNE fois par portail (portalMesh est neuf à chaque piste), ~2 s avant l'ovule — et près du BOUT de la piste (un ruban qui repasse sous l'ovule ne le déclenche pas)
    if(SONV2&&portalMesh&&PORTAL.son!==portalMesh&&!PARK.on&&mode!=='boom'){const v9=Math.max(10,speedKmh/3.6),d9=carGroup.position.distanceTo(PORTAL.c)-PORTAL.R*.95;if(d9<v9*2&&L-(mode==='fall'?lastNearS:s)<v9*3+120){PORTAL.son=portalMesh;sfx('portail.proche');}}
    // pads turbo : on n'anime la texture (dessin canvas + upload GPU) que si un pad est réellement en vue
    {let pv9=false;for(const p9 of PADS)if(p9>s-80&&p9<s+520){pv9=true;break;}if(pv9)updatePadTex(t);}
