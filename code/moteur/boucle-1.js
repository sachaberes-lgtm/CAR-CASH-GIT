function loop(now){
  requestAnimationFrame(loop);
  if(window.__introCouvre){loop._pn=now;last=now;return;} // (2026-10-22, Léo : « ça bug ») l'INTRO DU STUDIO couvre tout l'écran : dessous, le jeu ne calcule ni ne dessine rien (il faisait saccader le film, surtout sur un Mac chargé) — voir moteur/intro-161.js
  if(lierDemarrage(now)){loop._pn=now;last=now;return;} /* (2026-10-27) LA LIAISON EN ARRIÈRE-PLAN : les programmes de la 1re image se lient à côté, le jeu ne dessine pas encore — voir interface/vignette-moteur.js */
  if(CAD.ok&&cadSaute(now))return; // (2026-10-14, passe perf mobile) LA CADENCE STABLE : cette image d'écran se saute, sans RIEN toucher — voir CAD
  if((CAD.ok||PFR_ON)&&hcSaute(now))return; /* (2026-10-24) le téléphone au frais aussi (voir PFR_ON) */ /* (2026-10-23, audit mobile) hors course (accueil, garage) : 30 i/s sur les vieux paliers — voir HC */
  /* (2026-10-20, Sacha : « Chrome à 94-96 % de CPU ») PLAFOND À 60 i/s : rAF suit la fréquence de l'écran — 120/144/240 Hz = 2 à 4× plus d'images
     calculées (physique, particules, bloom) pour rien. On saute l'image d'écran trop proche de l'échéance (horloge cumulée : pas de dérive,
     pas de « une sur deux » raté sur 144 Hz), sans RIEN toucher : le dt de la suivante absorbe l'écart, comme la cadence 30 Hz. Sur un
     écran 60 Hz (ou 30 Hz imposé) rien ne se saute. Coupé quand CAD cale déjà à 30 (même horloge, pas de double saut). `?fps=0` = sans plafond.
     (2026-10-20, même jour) une image d'écran sur n, n ENTIER — voir fpsSaute : l'horloge à 1000/60 hachait les écrans 75/90/100/144 Hz. */
  if(FPS_CAP&&!CAD.on&&!HC.on&&fpsSaute(now))return;
  if(BANC_ON)BANC_T0=performance.now(); // (banc ?banc=1) début de l'image chronométrée
  QLR.t0=performance.now(); // (tour 2) début de l'image, pour la sonde de la règle de qualité
  if(QLR.sN>0)qlSondeDebut(); // (2026-10-08) sonde armée : la puce chronomètre l'image (voir qlSonde)
  if(COUT.on)coutDebut(); // (2026-10-13, banc perf-iphone7) le coût de l'image entière — voir COUT
  // ⚠ dt JAMAIS NÉGATIF (2026-09-25) : l'horodatage de rAF est celui du DÉBUT de l'image, et `last` peut avoir été posé
  // par `performance.now()` un peu plus tard (reprise d'onglet, pas-à-pas) — un dt < 0 rendait négatif le rayon
  // des taches de jus, et `arc()` lève alors une IndexSizeError qui cassait l'image entière (mesuré).
  let dt=Math.max(0,Math.min((now-last)/1000,.05));last=Math.max(last,now);
  if(TCTL.on&&running&&!paused&&!gameOver)hudColonne(dt); // (2026-10-14) la colonne de droite se MESURE ici, avant toute écriture du HUD de l'image (voir hudColonne)
  // qualité auto : si le GPU peine (<45 fps soutenus après l'échauffement), on allège la ouate une fois pour toutes
  if(PERF_MON)loop._brut=now-(loop._pn||now); // (OPTIMISATION, ?perf=1) l'intervalle VRAI, non plafonné : le relevé des à-coups (perfAcoup)
  const rawMs=Math.min(100,now-(loop._pn||now));
  const ms9=(CAD.on||HC.on)?Math.max(0,rawMs-(CAD.per-CAD.ecran)):rawMs; // (2026-10-14, passe perf mobile) calé à 30 i/s : la durée RAMENÉE à une image d'écran, pour toute la règle de qualité — voir CAD (rawMs reste la durée vraie)
  loop._ms=(loop._ms||16)*.96+ms9*.04;loop._pn=now;
  // DÉTECTEUR D'À-COUPS : l'EMA (constante ~25 frames) lisse les PICS ponctuels (titan de nuage plein écran) —
  // ce compteur fuyant attrape la saccade VÉCUE : ~10 frames >26 ms sur les 2-3 dernières secondes = on allège.
  /* (2026-09-26, vague 2) L'IPHONE EN ÉCONOMIE D'ÉNERGIE bride l'affichage à 30 Hz : chaque image dure 33 ms PILE, GPU au repos. Lu
     comme de la lenteur, ça coupait le bloom (palier BAS), descendait la résolution à 0,5 et comptait chaque image comme un à-coup.
     Un rythme de 30 Hz STABLE (écart moyen à la moyenne < 2 ms) n'est pas un GPU qui peine : c'est une cadence imposée. On n'en tire
     plus aucune conclusion (ni palier, ni résolution) et un à-coup s'y mesure contre 45 ms. Un GPU qui rame, lui, n'est jamais régulier.
     Et la résolution peut y REMONTER : au chargement (images irrégulières) elle descendait au plancher, puis la remontée exigeait
     < 17,8 ms — impossible à 30 Hz, donc 0,5 pour toute la session. Si la remontée surcharge vraiment, les images sautent, la
     cadence n'est plus régulière et l'anti-yoyo (plafond mémorisé) reprend la main. Banc : scratchpad gfx2-etal/r30.js. */
  loop._jit=(loop._jit==null?4:loop._jit)*.95+Math.abs(ms9-(loop._ms||16))*.05;
  {const cad9=(loop._ms||16)>29.5&&(loop._ms||16)<37.5;if(cad9&&loop._jit<2)loop._r30T=now+2500; // tenu 2,5 s : une image sautée (66 ms) ne fait pas basculer
   loop._r30=cad9&&now<(loop._r30T||0);}
  loop._spk=(loop._spk||0)*.985+(ms9>(loop._r30?45:26)?1:0);
  QLR.a[QLR.i]=ms9;QLR.i=(QLR.i+1)%QLR.a.length;if(QLR.n<QLR.a.length)QLR.n++; // (tour 2) l'anneau des 60 dernières images, lu par les centiles
  /* ⚠ LENTEUR SOUTENUE, JAMAIS UN PIC (2026-09-24) — toujours vrai : on ne dégrade que « calme » (ni reconstruction de zone, ni retour
     d'onglet, ni cadence 30 Hz imposée). Mais les paliers ne sont plus DÉFINITIFS et la résolution n'est plus la PREMIÈRE sacrifiée :
     (2026-09-27, passe perf iPhone) paliers MOYEN/BAS et résolution adaptative ne font plus qu'UNE échelle, `QL` — voir « LA NETTETÉ EN
     DERNIER » près de qlPose. Même horloge (un pas toutes les 1,1 s), mêmes seuils (19 / 24 / 17,8 ms), même anti-yoyo (4 pas de marge
     pour remonter, mur mémorisé 45 s) — appliqués au cran de l'échelle au lieu du seul pixelRatio. */
  const calme9=!document.hidden&&now-(loop._rebuildT||0)>(loop._rebuildD||2500)&&!loop._r30; // ni reconstruction de zone, ni départ de partie, ni retour d'onglet, ni cadence 30 Hz imposée
  if(CAD.ok)CAD.calme=calme9; // (2026-10-14, passe perf mobile) la cadence stable ne décide que « calme », elle aussi
  const qb9=qlBornes();
  // EFFONDREMENT : au plancher, encore > 24 ms (< 42 i/s) pendant 6 s D'AFFILÉE → on s'autorise sous le plancher (puis le bloom)
  /* (2026-09-27, tour 2) LA MESURE, C'EST LA PART D'IMAGES RATÉES — plus la moyenne glissante. Sur un écran 60 Hz une image qui
     déborde d'un rien dure 33,3 ms : la moyenne mélangeait les à-coups (compilations, chargements, 1er vol) et la vraie lenteur, et un
     départ de partie un peu haché suffisait à faire dévaler toute l'échelle. Désormais, sur les 60 dernières images : `p50` (la
     médiane — plus de la moitié des images ratées = ça rame fort), `p75` (plus d'un quart ratées = ça tire), `p90` (moins d'une sur
     dix ratée = marge pour remonter). Un à-coup isolé ne bouge aucun des trois. */
  if(!loop._qlT||now-loop._qlT>250){loop._qlT=now;const n9=QLR.n,s9=QLR.s;for(let i=0;i<n9;i++)s9[i]=QLR.a[i];
    const v9=s9.subarray(0,n9).sort();QLR.p50=n9?v9[n9>>1]:16;QLR.p75=n9?v9[(n9*.75)|0]:16;QLR.p90=n9?v9[Math.min(n9-1,(n9*.9)|0)]:16;}
  QL.efT=(calme9&&QL.k>=qb9.kNet&&QLR.p50>24)?QL.efT+dt:0;if(QL.efT>6)QL.effondre=true;
  // ÉTAGE 1 : l'ombre en vol, une image sur deux — seulement LOIN de toute dalle (radar de tryLand), jamais au sol
  {const loin9=QL.k>=1&&mode==='fall'&&(lastNearH2+(fallPos.y-lastNearY)*(fallPos.y-lastNearY))>196;
   if(loin9){renderer.shadowMap.autoUpdate=false;QL.fr^=1;renderer.shadowMap.needsUpdate=QL.fr===0;}
   else if(renderer.shadowMap.autoUpdate===false)renderer.shadowMap.autoUpdate=true;}
  /* (historique conservé) RÉSOLUTION ADAPTATIVE v3 ANTI PING-PONG (2026-07-20) : l'ancienne remontée instantanée à <14,5 ms faisait
     OSCILLER la résolution sur les machines pile au seuil — chaque cran re-échantillonne TOUT l'écran, et les dégradés doux des NUAGES
     le montrent le plus. D'où (1) la remontée après ~4,5 s de marge CONSÉCUTIVE, (2) une montée qui retombe en < 6 s marque ce cran
     comme un MUR (45 s). ⚠ LA REMONTÉE À < 14,5 ms ÉTAIT IMPOSSIBLE SUR UN ÉCRAN 60 Hz (2026-09-24) : la synchro plafonne l'image à
     16,7 ms — le seuil est 17,8 ms (« on tient la synchro 60 »). */
  dprT-=dt;
  // (2026-09-28) L'ACCUEIL EN HAUTE DÉFINITION (VHD) : l'échelle dort, c'est la vitrine qui tient la résolution — et son FILET la
  // redescend (×0,8, jamais sous le plafond ordinaire) quand le téléphone ne suit vraiment pas
  /* LE FILET v2 (2026-10-13, Léo : « l'écran d'accueil ne baisse pas de qualité pour les tels qui peuvent ») — MESURÉ au banc : l'ancien
     filet était un CLIQUET. Un à-coup d'une seconde (une compilation, la pluie de richesse, un onglet voisin) suffisait à faire passer plus
     d'un quart des images au-dessus de 22 ms : la résolution perdait 20 %… et ne remontait JAMAIS tant qu'on restait sur l'accueil
     (×2,6 → ×1,0 en 10-20 s, 7 fois moins de pixels — le ciel flou). Désormais :
     · on ne baisse que sur une lenteur TENUE (2,5 s d'affilée, `lT`) — un à-coup passe sans rien coûter ;
     · avant de baisser, la SONDE de la course (qlSonde) mesure le VRAI coût d'une image : sous 14,5 ms, la puce tiendrait le 60 i/s,
       c'est l'ÉCRAN qui bride (économie d'énergie, chaleur) → on ne sacrifie rien, et ce qui avait été baissé remonte ;
     · la marge revenue (moins d'une image sur dix ratée pendant 3 s, `bT` — ou la sonde qui prouve qu'une image agrandie d'un cran
       tiendrait sous 14 ms), la résolution REMONTE d'un cran (×1,25) jusqu'à la pleine
       définition de l'écran (`max`) — sauf vers un cran qui vient d'échouer (remonté puis retombé en moins de 10 s : un MUR de 45 s,
       l'anti-yoyo de l'échelle de course). */
  if(VHD.on){VHD.t+=dt;
    VHD.lT=(calme9&&QLR.p75>22)?VHD.lT+dt:0;VHD.bT=(calme9&&QLR.p90<17.8)?VHD.bT+dt:0;
    const sonde9=VHD.sT&&QLR.vraiT>VHD.sT; // la sonde lancée par le filet a parlé
    if(VHD.lT>2.5&&VHD.t>1.5){
      if(!sonde9){if(!VHD.sT||now-VHD.sT>3000){VHD.sT=now;qlSondeArme();}} // la SONDE d'abord : on décide quand elle a parlé
      else{VHD.sT=0;VHD.lT=0;VHD.bT=0;
        if(QLR.vrai<14.5){VHD.bride=now;VHD.t=-6.5;vhdNote(now,'bride');vhdMonte(now,QLR.vrai);} // l'écran bride, pas la puce : rien n'est sacrifié (et la sonde se tait 8 s)
        else if(VHD.dpr>DPR_CAP+.02){VHD.t=0;if(VHD.monteT&&now-VHD.monteT<10000){VHD.mur=VHD.dpr;VHD.murT=now;}VHD.dpr=Math.max(DPR_CAP,VHD.dpr*.8);VHD.bas++;vhdNote(now,'baisse');curDPR=-1;qlPose(0);}
        else VHD.t=-6.5;}} // déjà au plancher : rien à baisser, la sonde se tait 8 s
    else if(VHD.dpr<VHD.max-.02&&VHD.t>1.5){
      if(VHD.bT>3){if(vhdMonte(now,0)){VHD.t=0;VHD.bT=0;}}
      /* entre les deux (quelques images ratées, pas assez pour baisser — souvent le reste de la machine, pas le jeu) : la sonde dit
         combien coûte VRAIMENT une image ; si, agrandie au cran du dessus (coût ∝ pixels), elle tient encore sous 14 ms, on remonte */
      else if(sonde9){VHD.sT=0;VHD.t=-10;if(vhdMonte(now,QLR.vrai))VHD.t=0;} // pas de marge : la sonde se tait ~12 s
      else if(!VHD.sT||now-VHD.sT>3000){VHD.sT=now;qlSondeArme();}}}
  else if(!RESPIN&&dprT<=0&&now>4000&&qlAuto()){dprT=1.1;const fort9=QLR.p50>24,tire9=QLR.p75>24||QLR.p50>18.5; /* (OPTIMISATION) voir L'IMAGE EN AUTOMATIQUE */
    /* LA NETTETÉ NE SE SACRIFIE QUE SI ÇA PAIE (tour 2) : un cran de RÉSOLUTION posé, on regarde 3 s plus tard si la médiane a
       baissé. Si non (le téléphone bute ailleurs : processeur, affichage), la résolution revient et ce cran devient un MUR — on ne
       floute pas l'image pour rien. */
    if(QL.essai&&now-QL.essai.t>3300){const e9=QL.essai;QL.essai=null;
      if(QLR.p50>e9.p50-1.5&&QLR.p75>e9.p75-1.5&&(loop._ms||16)>e9.ms*.92){QL.plafK=e9.k0;QL.plafT=now;QL.up=0;qlPose(e9.k0);}}
    else if(calme9&&tire9&&QL.k<qb9.kMax&&!QL.essai&&!(QLR.vraiT&&now-QLR.vraiT<(((QL.k>=qb9.kNet&&!QL.effondre)||(QL.k>=QL.N_EFF&&QL.plafT&&now-QL.plafT<45000&&QL.k>=QL.plafK))&&!qlChrono(renderer.getContext())?30000:8000))){qlSondeArme();QL.up=0;} // d'abord la SONDE : on décidera au pas suivant
    /* (2026-10-14, passe mobile — « jouer en NETTE sans que ça bug ») QUAND L'ÉCHELLE NE PEUT PLUS DESCENDRE, SUR IPHONE : au plancher net (on ne
       passe dessous que sur effondrement, qui a son propre chrono) ou sous un PLAFOND (un cran de résolution qui n'a rien rapporté : le
       téléphone bute sur le processeur), la sonde ne décide plus rien vers le bas — elle ne sert qu'à voir si l'écran bride. Or sans
       chronomètre de la puce (Safari) ce sont CINQ images synchronisées, le processeur qui attend la puce à chaque fois : MESURÉ au banc
       (Safari simulé, processeur ralenti ×6) — l'image se figeait ainsi toutes les 8 s, pour toujours. Là : toutes les 30 s. Ailleurs
       (chrono non bloquant, ou une échelle qui peut encore descendre) : inchangé. */
    else if(calme9&&tire9&&QL.k<qb9.kMax&&!QL.essai&&QLR.vrai<14.5){QL.bride=now;QL.up++; // l'ÉCRAN bride (économie d'énergie, chaleur) : on ne sacrifie rien…
      if(QL.k>0&&QL.up>=3){QL.up=0;QL.effondre=false;qlPose(QL.k-1);}} // …et ce qui aurait été baissé remonte
    else if(calme9&&tire9&&QL.k<qb9.kMax&&!QL.essai){
      const lim9=QL.effondre?qb9.kMax:qb9.kNet;
      let k9=Math.min(lim9,QL.k+(fort9?2:1));
      if(k9>QL.N_EFF&&QL.plafT&&now-QL.plafT<45000)k9=Math.max(QL.k,Math.min(k9,QL.plafK)); // un PLAFOND : ce cran de résolution n'a rien rapporté il y a peu
      if(k9>QL.k){if(QL.roseT&&now-QL.roseT<6000){QL.mur=k9;QL.murT=now;} // remonté puis retombé aussitôt → ce cran est un mur
        const res9=qlDpr(k9,qb9)<qlDpr(QL.k,qb9)-.001;if(res9)QL.essai={t:now,k0:QL.k,p50:QLR.p50,p75:QLR.p75,ms:loop._ms||16};
        QL.roseT=0;QL.up=0;qlPose(k9);}
      else QL.up=0;}
    else if((QLR.p90<17.8||loop._r30)&&!CAD.gel){const mur9=(QL.murT&&now-QL.murT<45000)?QL.mur:0;QL.up++;
      // la marge revient : la RÉSOLUTION remonte d'abord, et vite (2 crans d'un coup quand presque aucune image ne rate)
      if(QL.k>mur9&&QL.up>=3){QL.up=0;QL.roseT=now;const k9=Math.max(mur9,QL.k-(QLR.p90<16.9&&QL.k>QL.N_EFF+1?2:1));if(k9<=qb9.kNet)QL.effondre=false;qlPose(k9);}}
    else QL.up=0;
  }
  if(PERF_MON)perfMonTick(now,rawMs);
  lvlStep(dt);routeTick(); // NIVEAUX : le noir de l'orbite, la planète et la pluie suivent le même fondu — AVANT bioStep, qui lit LVL.espace
  ailvTick(dt); // (2026-10-16) LES AILES VIVANTES : le boost, le virage, la montée, la vitrine du garage — avant blingTick, qui les anime
  blingTick(dt); // (2026-10-10) L'ICEBERG : les éclats de givre scintillent (menu, garage, course)
  bioStep(dt); // BIOMES : le voyage d'ambiance avance même au menu/en pause de jeu (c'est le ciel qui vit, pas la sim)
  try{nuFondTick(dt);}catch(e){} // (2026-10-18) le fond peint de la mer de nuages
  if(mode!=='drive'||!running||gameOver)LIGNE_U.uFile.value*=Math.max(0,1-dt*6); /* (LES TIRETS FILENT) hors de la route, le filé retombe : pas de tirets flous au menu */
  cityTick(dt,camera.position.y); // LA VILLE : son altitude court après la caméra (hors gate de sim — le décor vit au menu, comme le ciel)
  try{portesTick();}catch(e){} // (optimisation) les chaînes muettes se débranchent, les chaînes appelées se rebranchent
  if(SONV2){ // (console de son) LE VIDE : en orbite, un bourdon qui respire remplace le vent (windG/whG se taisent, voir la boucle audio)
    const v9=LVL.espace>.5&&started&&running&&!paused&&!gameOver&&!garageOn&&mode!=='boom';
    if(v9&&!loop._vide&&now>(loop._videT||0)){loop._videT=now+500;loop._vide=sfx('espace.ambiance',{loop:true,vol:-24});if(loop._vide)loop._vide.gain(0,.8);}
    else if(!v9&&loop._vide){loop._vide.stop(.5);loop._vide=null;}
    /* (2026-10-08, Léo : « au départ de la première map, un son parasite — enlève ») : plus d'ambiance de la MER DE NUAGES en course (souffle, rafales, harpe éolienne : elle passait 11 à 26 dB au-dessus de la musique du ciel). Code et échantillons retirés au nettoyage du 14/10. */
    if(garageOn&&!(CHUTE&&CHUTE.on)&&(!openGarage._amb||!openGarage._feu)&&now>(loop._garT||0)){loop._garT=now+800;if(!openGarage._amb)openGarage._amb=sfx('garage.ambiance',{loop:true,vol:GAR_AMB_DB});if(!openGarage._feu)openGarage._feu=sfx('garage.feu',{loop:true});} // (débogage 2026-09-29) une ambiance ratée au premier essai est retentée — (2026-10-12, passe qualité) le FEU aussi : SON rallumé dans l'atelier, il restait muet jusqu'à la visite suivante
    else if(!garageOn&&openGarage._amb){openGarage._amb.stop(.35);openGarage._amb=null;}
  }
  // (2026-09-26, user : « enlève tous les modes ralentis du jeu ») : plus de slow-mo (atterrissage, gros air, bullet-time, reprise de
  // pause, ultra-turbo, explosion) ni de HIT-STOP. Les déclencheurs posent encore slowT/hitT : on les vide ici, le temps ne ralentit JAMAIS.
  slowT=0;hitT=0;
  dt=ralentiDt(dt); // (2026-09-29) …SAUF le ralenti de la FRÉNÉSIE, demandé par Sacha (voir RALENTI) — le dt RÉEL reste celui des mesures de perf ci-dessus
  const t=now/1000;
  let speedKmh=0;
  try{ if(running&&!paused&&!gameOver&&!BANC_FIGE){ // (banc ?banc=1) BANC_FIGE : la simulation s'arrête, le rendu continue
    // OVERDRIVE : passé le niveau 6, le jeu passe la surmultipliée — +8 %/niveau, jusqu'à +50 %
    // ⚠ JEU DE PROGRESSION : la VITESSE vient du MOTEUR, pas de la caisse équipée — sinon équiper une
    // caisse débloquée ferait démarrer la partie à 400 km/h et il n'y aurait plus rien à gagner.
    // ⚠ `spec` = CARS[0] et NON CARS[level] (2026-08-03) : il ne servait plus qu'à `spec.turn`, et
    // depuis que la caisse équipée s'applique, ce seul champ suffisait à donner à une caisse tardive
    // un rayon de braquage deux fois meilleur — de la performance déguisée en cosmétique. Toutes les
    // caisses PILOTENT donc pareil ; CARS[level] ne sert plus qu'à la carrosserie et au nom.
    const spec=CARS[0],late=lateMul(),
          eng9=ENGINE_TIERS[engTier]||ENGINE_TIERS[0],
          maxSp=CARS[0].maxKmh/3.6*late*eng9.push,acc9=CARS[0].accel*late*(1+(eng9.push-1)*.6);
    const up=AUTO_GAS||keys.KeyW||keys.KeyZ||keys.ArrowUp,dn=keys.KeyS||keys.ArrowDown;
    gasOn=up;
    const lf=keys.KeyA||keys.KeyQ||keys.ArrowLeft,rt=keys.KeyD||keys.ArrowRight;
    // POUVOIRS : les minuteurs s'égrènent, l'airtime infini rend une jauge neuve en expirant
    {const pn9=pwrNitroT>0,ps9=pwrSpdT>0;
    pwrNitroT=Math.max(0,pwrNitroT-dt);
    pwrSpdT=Math.max(0,pwrSpdT-dt);pwrSpdK+=((pwrSpdT>0?1:0)-pwrSpdK)*(1-Math.exp(-dt*6));if(pwrSpdT<=0&&pwrSpdK<.003)pwrSpdK=0; /* (2026-10-17) le ×2 de VITESSE se prend et se rend en douceur (voir pwrSpdK) */
    if(pn9&&pwrNitroT<=0)pwrFinSnd('n');else if(ps9&&pwrSpdT<=0)pwrFinSnd('v');} // (2026-09-26) la fin d'un pouvoir se dit aussi à l'oreille — (pouvoirs v2) avec sa clé (la session SON la lit)
    if(startBoostT>0)startBoostT=Math.max(0,startBoostT-dt); // LE BOOST DE DÉPART : décroît tout seul, même hors mode 'drive' ne l'arrête pas plus tôt que prévu
    if(pwrAirT>0){pwrAirT-=dt*pwrAirK();if(pwrAirT<=0){pwrAirT=0;if(!TUTO.on)pwrFinSnd('a');if(mode==='fall'){fallT=0;fallTR=0;airFlash=.6;}}} // (2026-09-28) l'airtime PRÊTÉ par l'auto-école n'est pas un pouvoir : il finit sans bruit
    pwrTick(dt); // (pouvoirs v2) aimant · aura ×2
    mortsTick(Math.min(.05,rawMs*.001)); // (2026-09-30) le temps de course par niveau — le temps RÉEL de l'image (le dt de sim passe au ralenti en frénésie)
    ligneTick(dt); // (2026-09-29) LA LIGNE PARFAITE s'allonge devant la caisse
    // nitro : 2s regen (10s de recharge) + 2s réserve (bidons bleus)
    // CAPACITÉ MOTEUR : la réserve de nitro s'élargit avec le palier (2,0 → 3,6 au réacteur)
    const NRMAX=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2;
    {const av9=nitroR;nitroR=Math.min(NRMAX,nitroR+NITRO2.regen*dt);if(LIVRE.on)livre('n+:seule',nitroR-av9);}
    if(pwrNitroT>0||PARK.on||startBoostT>0)nitroR=NRMAX; // NITRO INFINIE : jauge pleine, rien ne se consomme (pouvoir, parc freestyle, OU l'élan du départ — 2026-10-08 : le départ ne fait plus de nitro tout seul, mais une nitro APPUYÉE pendant ses 3 s reste offerte : sinon, tenue dès le départ, la jauge tombait à sec en 2,6 s et la nitro se coupait en PANNE SÈCHE) — pleine = la capacité du MOTEUR (à 2 en dur, la jauge restait à 55 % au palier max)
    {const fu9=nitroR>=NRMAX-.001,d9=nitroR-(loop._nR==null?nitroR:loop._nR);if(SONV2&&fu9&&loop._nFu===false&&d9<.06&&!(pwrNitroT>0||PARK.on||startBoostT>0)&&started&&!gameOver)sfx('nitro.pleine');loop._nFu=fu9;loop._nR=nitroR;} // (console de son) PLEINE : ding au franchissement — pas sous nitro infinie, ni quand un plein OFFERT (saut > .06 : portail, pose, bump, fruit) l'a remplie, il a son glouglou
    const wantN=keys.ShiftLeft||keys.ShiftRight||keys.Space||(DBG_AUTO.on&&(DBG_AUTO.nit===1||(DBG_AUTO.nit===2&&mode==='fall')||(DBG_AUTO.nit===3&&mode==='drive'))); // (2026-10-08, Léo : « l'accélération du début n'est pas du boost, c'est de la vitesse ; enlève tout ce qui a rapport au nitro ») le départ ne tient PLUS la touche : il pousse la caisse (voir `startBoostT` dans la conduite), sans flamme, ni son, ni traînée
    /* (2026-10-01, LA LOI DU RÉSERVOIR, loi 0) À SEC : le réacteur tenait tant qu'il restait plus de ,005 dans la jauge — or elle se refait
       de ,2 × dt à chaque image : sous ~40 images/s (dt > ,025 : un iPhone bridé à 30 i/s) la recharge d'UNE image suffisait, et le nitro
       tenu ne s'éteignait JAMAIS, jauge vide (poussée, NITROOO, PSYCHO, flow gelé). Il tient désormais tant que la jauge PAIE l'image. */
    const tk9=pwrNitroT>0||PARK.on||startBoostT>0?0:nitroConsoDe(dt,FLOW2.fren.nitro,FLOW.lv===4);
    nitroOn=wantN&&nitroTientDe(nitroR+nitroX,tk9,nitroOn); // hystérésis anti-clignotement (il se rallume à ,3)
    if(LIVRE.on){LIVRE.t+=dt;if(nitroOn)LIVRE.tN+=dt;if(mode==='fall')LIVRE.tV+=dt;}
    if(wantN&&!loop._nvW&&!nitroOn&&mode!=='boom'){try{if(SONV2)sfx('nitro.vide');else noiseBurst(.04,.06,2500);}catch(e){}hap(6);} // (2026-09-26, audit son) NITRO À VIDE : un « tchk » sec — l'appui répond toujours
    loop._nvW=wantN;
    const doigtN=!!(keys.ShiftLeft||keys.ShiftRight||keys.Space); // (2026-10-03, Léo) la phrase ne répond qu'au VRAI doigt : ni le boost de départ (startBoostT), ni le pilote auto
    if(VEQ.dReq){VEQ.dReq=false;if(performance.now()-(VEQ.dReqT||0)<150)veqDouble();}if(VEQ.sautAtt>0){const a9=performance.now()-VEQ.sautAtt;if(a9>400||mode!=='drive'||gameOver)VEQ.sautAtt=0;else if(!(hopY>0||hopV!==0||POSE_F)){VEQ.sautAtt=0;veqDouble();}} /* (2026-10-15 soir) le double-tap fait pendant un rebond part à la fin du rebond (0,4 s au plus) */if(GLI.req){const d9=GLI.req;GLI.req=null;if(performance.now()-GLI.reqT<150)figGJoue(d9);}gsolTick(dt);frTick(dt);figHud(); /* (2026-10-14, GAMEPLAY — bug relevé par GENERAL : « VEQ.dReq jamais remis à zéro : un double-tap fait en pause, au 3-2-1 ou à l'écran de mort part à la REPRISE ») la boucle ne lit la demande qu'en course : passé 150 ms (une pause, un compte, une mort), elle est PÉRIMÉE et tombe */ // LES FIGURES (2026-10-14) : le double-tap NITRO est lu aux ÉVÉNEMENTS (veqDoigt) — à 30 i/s un tap bref passait entre deux images
    {const iV=doigtN&&mode!=='boom'&&!gameOver;if(iV!==!!loop._iW){loop._iW=iV;try{if(iV)instruOn();else instruOff();}catch(e){}}} /* (2026-10-07, audit) on retient ce qu'on JOUE, pas le doigt : mort doigt posé, la partie suivante rejoue au 1er appui */ // (2026-10-03) LA PHRASE DU BOOST suit le DOIGT, pas la flamme (le réservoir vide la coupait)
    if(nitroOn&&pwrNitroT<=0&&!PARK.on&&startBoostT<=0){
      let take=tk9; // (v3, Sacha : « en frénésie le nitro baisse 2× plus lentement »)
      if(LIVRE.on)livre(mode==='fall'?'n-:vol':'n-:sol',Math.min(take,nitroR+nitroX));
      if(nitroR>=take)nitroR-=take;
      else{take-=nitroR;nitroR=0;nitroX=Math.max(0,nitroX-take);}
    }
    nitroBlue=nitroOn&&nitroR<=.01; // réserve bleue = plus puissante
    // TURBO v2 : spool à l'enclenchement (au sol), blow-off + flutter à la relâche (partout)
    if(!wantN){NSEC.sous=false;NSEC.etage=false;} // (2026-10-17) le doigt levé : le prochain allumage est un VRAI appui (voir NSEC)
    if(nitroOn&&!loop._nOn&&mode==='drive'&&!NSEC.sous)nitroSpool();
    if(nitroOn&&!loop._nOn&&mode!=='boom')nitroAllume(nitroBlue,false);            // (vague 3) LE COUP d'allumage — au sol comme en vol
    else if(nitroOn&&nitroBlue&&!loop._nBl&&mode!=='boom')nitroAllume(true,true); // …et le 2e étage : on bascule dans la réserve bleue
    loop._nBl=nitroBlue;
    if(nitroOn){nitroHeldT+=dt;styleFromBoost(dt);} // TENIR le boost remplit la jauge rose — la seule source
    if(!nitroOn&&loop._nOn&&nitroHeldT>.35&&mode!=='boom'&&!wantN)blowOff(); // (2026-10-17) pas sous le doigt : la panne sèche n'est pas une relâche (voir NSEC) — (2026-10-14, chasse aux bugs) pas de soupape de turbo sur la caisse qui EXPLOSE : la porte de simulation reste ouverte les 1,8 s de 'boom', un pouce levé (ou la panne sèche) y jouait le PSSHT + flutter par-dessus l'explosion — tous les autres sons de fin de nitro (nitroEteint, nitro.sec, sensNitro) sont déjà gardés mode!=='boom'
    if(SONV2&&!nitroOn&&loop._nOn&&wantN&&mode!=='boom')sfx('nitro.sec'); // (console de son) PANNE SÈCHE : la jauge lâche sous le doigt
    if(!nitroOn&&loop._nOn)nitroEteint(!!wantN); // (vague 3) la dernière bouffée (lit nitroHeldT : avant sa remise à zéro) — (2026-10-17) `wantN` : la jauge lâche SOUS le doigt, la pétarade se tait
    if(!nitroOn&&loop._nOn&&wantN)NSEC.sous=true;
    if(SENS)try{sensNitro(dt,!!wantN);}catch(e){} // (2026-10-14, sensations · nitro) la coupure, la panne sèche, les rapports, les paliers : dans la tôle et la main (lit nitroHeldT avant sa remise à zéro)
    if(SENS)try{sensPassages(dt);}catch(e){} // (2026-10-14, sensations · passages) l'arrivée d'un portail, le replacement : la caisse se pose sur ses ressorts
    if(!nitroOn)nitroHeldT=0;
    loop._nOn=nitroOn;
    if(keys.KeyR&&mode==='drive'){respawn();keys.KeyR=false;if(SONV2)sfx('respawn');}
    // PILOTE AUTO DE MESURE (`dbgAuto`) : le volant du bot de poursuite (mêmes équations) posé sur TA caisse —
    // sert à mesurer l'économie sur des dizaines de parties sans jouer à la main. Jamais armé en jeu.
    const mA9=DBG_AUTO.on&&mode==='drive'?vitMult():1; // (HAUTE VITESSE, 2026-09-30) le pilote de mesure connaît sa caisse : au sol, le lacet est ×spdMult, et l'écart latéral s'y referme en autant de SECONDES qu'à ×1
    const target=DBG_AUTO.on&&DBG_AUTO.vol&&mode==='fall'?dbgAutoVol(dt):DBG_AUTO.on?THREE.MathUtils.clamp((routeLacet+(THREE.MathUtils.clamp((DBG_AUTO.lat-lat)/(Math.max(6,Math.abs(vA)*SPD*mA9)*.9),-.4,.4)-(DBG_AUTO.gl?psi-BKV.gl:psi))*3)/(lacetMax(vA)*mA9),-1,1) // (conduite v6) le pilote de mesure corrige son CAP vers la ligne visée // (conduite v4) le pilote de mesure VISE un cap
      :TCTL.act?TCTL.st:(lf?1:0)-(rt?1:0); // VOLANT TACTILE : le pouce prend la main sur le tout-ou-rien (même lissage derrière)
    if(lf||rt)TCTL.doigt=false; // (2026-10-14, sensations) une flèche du clavier reprend la main : son lissage à elle (le dernier qui a tenu le volant décide)
    steer+=(target-steer)*(1-Math.exp(-dt*(TCTL.doigt?VOL_LIS_D:VOL_LIS))); /* (2026-10-14) τ 30 ms au pouce, 47 ms au clavier (voir VOL_LIS_D) · (2026-10-09) exponentielle EXACTE : à 60 i/s c'est l'ancien ×0,3 au millième ; à 30 i/s (l'iPhone bridé) le volant braquait plus sec que sur PC (τ 36 ms au lieu de 47) */
    graceT=Math.max(0,graceT-dt);
    if(CHANCE.inv>0)chanceTick(dt); // (2026-10-14) le bouclier de la SECONDE CHANCE
    sideCd=Math.max(0,sideCd-dt);
    if(DBG_AUTO.on&&DBG_AUTO.saut>0){if(mode==='drive'&&!introD&&graceT<=0){DBG_AUTO.tS+=dt;if(DBG_AUTO.tS>=DBG_AUTO.saut&&Math.abs(lat)<ROAD_HALF*.5&&Math.abs(vA)*3.6*SPD>110){DBG_AUTO.tS=0;DBG_AUTO.l0=null;startFall(DBG_AUTO.imp,1);}}else DBG_AUTO.tS=0;} /* banc : la boucle décoller / se poser */
