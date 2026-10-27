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
  } }catch(err){window.__loopErr=err.message+' | '+(err.stack||'').split('\n').slice(0,3).join(' ¶ ');try{window.__ccNote('boucle',err.message,(err.stack||'').split('\n').slice(1,3).join(' ¶ '));}catch(_){} /* (2026-10-27) la BOÎTE NOIRE */if(!loop._warned){console.error('loop error',err);loop._warned=true;}}
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
