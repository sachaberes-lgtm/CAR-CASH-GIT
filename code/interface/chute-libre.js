/* LA CHUTE LIBRE DOUCE (2026-10-14, Léo : « quand on est — et quand on revient — dans le menu ciel, un bruit de chute libre doux ») : au ciel la
   musique joue loin derrière (MUS_CIEL, elle plonge sous ses rafales : voir CHDOUX.h dans musicTick) — on entend l'air qui glisse autour de la caisse qui tombe. Deux souffles :
   un GRAND, grave et rond (bruit passé deux fois sous ~350 Hz), et un plus CLAIR et léger (une bande autour de 900 Hz) qui passe lentement
   d'une oreille à l'autre ; tous deux RESPIRENT (des houles de 2 à 15 s), jamais le claquement des tôles de `chute.vent` (gardé pour le
   piqué de JOUER). Bus des effets (MASTER : curseur EFFETS, interrupteur SON). Créé au 1er passage au ciel, éteint 0,4 s après qu'on le quitte. */
const CHDOUX={n:null,off:0,h:.78},CHDOUX_VOL=.06; // (même soir, Léo : « le vent est fort ») .15 → .06 (−8 dB)
function chuteDoux(t,u){
  if(!AC||AC.state!=='running'||!SND.sfx)return;
  let n=CHDOUX.n;
  if(!n){
    const g=AC.createGain();g.gain.value=0;g.connect(MASTER);
    const s1=AC.createBufferSource();s1.buffer=noiseBuf(3.1);s1.loop=true;
    const f1=AC.createBiquadFilter();f1.type='lowpass';f1.frequency.value=350;f1.Q.value=.4;
    const f1b=AC.createBiquadFilter();f1b.type='lowpass';f1b.frequency.value=700;f1b.Q.value=.3;
    const s2=AC.createBufferSource();s2.buffer=noiseBuf(2.3);s2.loop=true;
    const f2=AC.createBiquadFilter();f2.type='bandpass';f2.frequency.value=900;f2.Q.value=.8;
    const g2=AC.createGain();g2.gain.value=.22;
    const pan=AC.createStereoPanner?AC.createStereoPanner():null;
    s1.connect(f1);f1.connect(f1b);f1b.connect(g);s2.connect(f2);f2.connect(g2);
    if(pan){g2.connect(pan);pan.connect(g);}else g2.connect(g);
    s1.start();s2.start();n=CHDOUX.n={g:g,s1:s1,s2:s2,f1:f1,f2:f2,g2:g2,pan:pan};
  }
  clearTimeout(CHDOUX.off);CHDOUX.off=0;
  const now=AC.currentTime,houle=.78+.16*Math.sin(t*.41)+.08*Math.sin(t*1.07+1.3);CHDOUX.h=houle; // (la musique du ciel la lit : elle plonge sous les rafales)
  stt(n.g.gain,CHDOUX_VOL*houle*(1+.6*u),now,.5);                  // au piqué de JOUER il gonfle (+4 dB ; +8 avant le 16/10 : voir LE PIQUÉ QUI NE CRIE PLUS)…
  stt(n.f1.frequency,330+70*Math.sin(t*.29)+300*u,now,.6);         // …et s'éclaircit un peu
  stt(n.f2.frequency,820+260*Math.sin(t*.53+2)+500*u,now,.6);
  stt(n.g2.gain,.2+.08*Math.sin(t*.67),now,.6);
  if(n.pan)stt(n.pan.pan,.45*Math.sin(t*.23),now,.8);
}
function chuteDouxCoupe(d){const n=CHDOUX.n;if(!n||!AC)return;
  try{n.g.gain.cancelScheduledValues(AC.currentTime);n.g.gain.setTargetAtTime(0,AC.currentTime,d/3);n.g.gain._s9=0;}catch(e){} // (_s9 : la mémoire de stt, pour qu'un retour au ciel le rallume aussitôt)
  clearTimeout(CHDOUX.off);CHDOUX.off=setTimeout(function(){if(CHDOUX.n!==n)return;try{n.s1.stop();n.s2.stop();n.g.disconnect();}catch(e){}CHDOUX.n=null;},d*1000+400);}
window.dbgChuteDoux=function(){return {ciel:!!CHUTE.on,garage:!!garageOn,tait:MUS_TAIT,douxOn:!!CHDOUX.n,douxGain:CHDOUX.n?+CHDOUX.n.g.gain.value.toFixed(4):0,musique:musicEl?{pause:musicEl.paused,vol:+musicEl.volume.toFixed(3),src:(musicEl.src||'').split('/').pop(),t:+musicEl.currentTime.toFixed(2)}:null,mode:musicMode};}; // (dev) le ciel muet, la chute douce, le lobby au garage
function chuteEntre(){ // de l'atelier (ou de rien) au ciel
  MUSAP.t=0; /* (2026-10-15) les RÉGLAGES (écran opaque, la musique au niveau du garage) refermés moins de 1,4 s après un relâcher du curseur : l'extrait levait encore MUS_CIEL au ciel — la musique restait forte une seconde puis retombait d'un coup */
  if(!CHUTE.lc)CHUTE.lc=new THREE.Color();CHUTE.lc.copy(carLight.color);CHUTE_TAP.p.set(0,0,0);CHUTE_TAP.v.set(0,0,0);CHUTE_TAP.Q.identity();CHUTE_TAP.w.set(0,0,0);CHUTE_TAP.tient=null;CHUTE_TAP.sh=0;
  CHUTE.on=true;CHUTE.t=0;CHUTE.sndT=0;TITRE_HF.tc=0;CHUTE.bioPas=-1;CHUTE.bioT=null; /* (2026-10-07) sndT et tc vivaient sur l'horloge d'AVANT (CHUTE.t repart de 0) : le vent restait muet et l'heure périmée jusqu'à 20 s */
  document.body.classList.add('titreCiel');if(!CHUTE.mz)CHUTE.mz=[skyU.uMzA.value.clone(),skyU.uMzB.value.clone(),skyU.uMzT.value.clone(),skyU.uMzO.value.clone(),skyU.uMzH.value.clone(),skyU.uMerLoin.value];CHUTE.oA=CHUTE.oAc=CHUTE.oW=CHUTE.oP=CHUTE.oPc=0;CHUTE.tk=0; // (2026-09-30) l'orbite repart du plan de face — (LE TOUR SANS FIN) et le tour lent s'y engage en douceur
  if(!CHUTE.av)CHUTE.av={c:new THREE.Color()};CHUTE.av.e=acesPass?acesPass.uniforms.uExposure.value:null;if(scene.fog){CHUTE.av.c.copy(scene.fog.color);CHUTE.av.n=scene.fog.near;CHUTE.av.f=scene.fog.far;} // (2026-09-30) l'exposition et la brume d'avant (l'atelier les retrouve)
  if(!CHUTE.w)chuteMonte();
  if(GAR.root)GAR.root.visible=false;garageFloor.visible=false;gEl.classList.add('ciel'); /* (niveau 1 v2) le bandeau du bas prend l'azur profond du ciel (voir #garage.menu.ciel::after) */
  try{if(openGarage._amb){openGarage._amb.stop(.35);openGarage._amb=null;}if(openGarage._feu){openGarage._feu.stop(.35);openGarage._feu=null;}}catch(e){} // l'atelier se tait : là-haut, c'est le vent
  if(CHUTE.entree){const v=chuteVoileEl();v.style.transition='none';v.style.transform='none';v.style.opacity='1';void v.offsetWidth;v.style.transition='opacity .45s ease-out';v.style.opacity='0';} // revenu de la boutique : on sort de l'atelier PAR un nuage
  CHUTE.entree=1;
}
function chuteSort(ferme){ // on quitte le ciel : l'atelier (boutique, missions) ou la course (ferme)
  if(!CHUTE.on&&!CHUTE.go)return;
  try{chuteDoigtMontre(false);}catch(_){} /* (2026-10-15 soir) le doigt de bienvenue ne reste pas sur l'atelier ni sur la course */
  if(CHUTE.corps){carBody.position.set(0,0,0);carBody.rotation.set(0,0,0);CHUTE.corps=false;} // (LA CHUTE LIBRE RÉALISTE) la carrosserie se repose sur ses ressorts
  CHUTE.on=false;CHUTE.go=null;CHUTE.sous=null;titreCiel(false);gEl.classList.remove('ciel');document.body.classList.remove('titreCiel');if(CHUTE.mz){skyU.uMzA.value.copy(CHUTE.mz[0]);skyU.uMzB.value.copy(CHUTE.mz[1]);skyU.uMzT.value.copy(CHUTE.mz[2]);skyU.uMzO.value.copy(CHUTE.mz[3]);skyU.uMzH.value.copy(CHUTE.mz[4]);skyU.uMerLoin.value=CHUTE.mz[5];}if(COTON.root)COTON.root.visible=COTON.n>0;if(CHUTE.nu)for(const c of CHUTE.nu)c.m.visible=false; /* (titre v3) les cumulus du titre se rangent */
  if(CHUTE.snd){try{CHUTE.snd.stop(ferme?.5:.3);}catch(e){}CHUTE.snd=null;} /* (niveau 1 v2) la chute libre se tait */
  try{chuteDouxCoupe(ferme?.5:.35);}catch(e){} // (2026-10-14) …la douce aussi
  trailLight.intensity=0;if(CHUTE.lc)carLight.color.copy(CHUTE.lc);{const BT=BIOMES.titre||BIOMES[MENU_BIO];if(BT.hemiI!=null)hemi.intensity=BT.hemiI;if(BT.sunI!=null)sun.intensity=BT.sunI;} // (2026-10-03) le studio du titre rend l'ambiance (il la baisse sur la caisse), puis la lumière du rebond (à 0 partout ailleurs) et la couleur de la lampe de caisse
  if(CHUTE.w)for(const w of CHUTE.w){w.sp.visible=false;}
  {const T9=CHUTE_TAP;T9.tient=null;T9.sh=0;if(T9.fl)T9.fl.visible=false;if(T9.deb)for(const D of T9.deb)D.m.visible=false;}richRange(); // (la caisse au doigt v2) l'éclat et les morceaux de tôle restent au ciel
  if(CHUTE.fil)CHUTE.fil.m.visible=false;
  if(CHUTE.sol)for(const sp of CHUTE.sol)sp.visible=false;
  trailApercu(0,false);
  if(CHUTE.vent&&AC){try{stt(windG.gain,0,AC.currentTime,.25);stt(whG.gain,0,AC.currentTime,.25);}catch(e){}}CHUTE.vent=false;
  if(ferme)return;
  MENUV.bio=false;bioApply(BIOMES.atelier);if(FSTU.on){paintEnvStudio();finLaque(true);}else paintEnvAtelier();                    // l'atelier reprend sa lumière et son reflet
  if(CHUTE.av){if(acesPass&&CHUTE.av.e!=null)acesPass.uniforms.uExposure.value=CHUTE.av.e;if(scene.fog&&CHUTE.av.n!=null){scene.fog.color.copy(CHUTE.av.c);scene.fog.near=CHUTE.av.n;scene.fog.far=CHUTE.av.f;}} // (2026-09-30) …et son exposition, sa brume
  if(GAR.root)GAR.root.visible=true;
  try{if(SONV2&&!openGarage._amb)openGarage._amb=sfx('garage.ambiance',{loop:true,vol:GAR_AMB_DB});if(SONV2&&!openGarage._feu)openGarage._feu=sfx('garage.feu',{loop:true});}catch(e){}
}
function chuteLance(){ // JOUER, depuis le ciel : elle pique
  CHUTE_TAP.tient=null; // (la caisse au doigt v2) un doigt qui la tenait la lâche
  CHUTE.go=GAR.go={t:0,chute:true,son:false,voile:false};
  gEl.classList.add('launching');document.body.classList.remove('garMenuH');
  pbjDepart(); // (15/10) POUCE BLEU : le morceau de la course entre pendant le piqué (son intro)
  garLacherSon();
}
/* LA CHUTE LIBRE RÉALISTE (2026-10-08, Léo : « la voiture doit avoir davantage un effet de chute libre réaliste »). MESURÉ avant (film de
   24 images) : quatre sinus purs (tangage .9 et 2,3 rad/s, roulis .53 et 1,7) — un balancement de manège, régulier, prévisible ; la caisse
   CLOUÉE au centre de l'image (la caméra visait le même point qu'elle) ; les roues à 7 rad/s, comme si elle roulait encore. Une caisse
   qui tombe à sa vitesse limite, c'est autre chose :
   · L'AIR LA BALLOTTE PAR RAFALES (`chuteRafale` : 0 → 1, une bourrasque toutes les 5 à 10 s) : tangage de fléchette (le nez, plus lourd,
     revient vers le bas et dépasse), roulis qui se cherche, lacet qui dérive — du BRUIT LISSE (`chuteBr`), pas des sinus : rien ne se répète.
   · LE TREMBLEMENT DU VENT : une vibration rapide (9-13 Hz) de la caisse, plus forte dans la rafale.
   · ELLE FLOTTE DANS LE CADRE : deux corps qui tombent ne restent pas collés — la caméra vise une ancre lisse, la caisse dérive autour
     (±25-30 cm) et tressaute ; la vue, elle, garde son tour.
   · LES SUSPENSIONS DÉTENDUES : plus rien ne pèse sur les ressorts — la carrosserie se soulève de ses roues (`det` m) et tressaute dessus.
   · LES ROUES EN ROUE LIBRE : le vent les fait tourner lentement, chacune à son rythme (`roue` rad/s) ; au piqué de JOUER, elles s'emballent.
   Tout est une fonction de `t` (CHUTE.t) : `dbgChute({fige})` fige aussi la chute. `dbgChute({cl:0})` = le balancement d'avant (A/B),
   `cl` dose le tout (1 = le réglage choisi). « Réduire les animations » : ni tremblement ni tressaut. */
function chuteH(i){let h=Math.imul(i^0x9E3779B9,0x85EBCA6B);h^=h>>>13;h=Math.imul(h,0xC2B2AE35);h^=h>>>16;return (h>>>0)/2147483648-1;} // un nombre au hasard FIXE par entier, dans [−1, 1]
function chuteBr(x,k){x+=k*71.37;const i=Math.floor(x),f=x-i,u=f*f*f*(f*(f*6-15)+10),a=chuteH(i+k*7919);return a+(chuteH(i+1+k*7919)-a)*u;} // bruit lisse (quintique : la vitesse ne casse jamais), canal k
function chuteBr2(x,k){return (chuteBr(x,k)+.5*chuteBr(x*2.07+5.3,k+40))/1.5;} // deux octaves
function chuteRafale(t){const g=chuteBr(t*.16,90)*.6+chuteBr(t*.41,91)*.4;return THREE.MathUtils.smoothstep(g,-.15,.55);} // 0 → 1 : la bourrasque
const CHUTE_CL={pa:.09,po:.065,ra:.2,ya:.14,tr:.02,dx:.35,dy:.35,sh:.05,det:.075,ressort:.022,cass:.03,roue:1.1}; /* pa/po tangage lent/oscillation de fléchette (rad), ra roulis, ya lacet, tr tremblement, dx/dy dérive dans le cadre (m), sh tressaut (m), det soulèvement des ressorts (m), ressort tressaut sur les roues (m), cass la carrosserie qui bascule sur ses ressorts (rad), roue rad/s */
function chuteRender(dt){
  if(!CHUTE.on)chuteEntre();
  titreHeureTick(dt); /* (2026-10-05) LES HEURES DU TITRE : l'ambiance de l'heure du téléphone (voir TITRE_H) */
  CHUTE.t=CHUTE_P.fige!=null?CHUTE_P.fige:CHUTE.t+dt;const t=CHUTE.t,P=CHUTE_P,G=CHUTE.go; /* (P.fige : la caisse et la vue figées à cet instant — comparer deux réglages sur la MÊME image) */
  // LE CIEL DU JOUR DES NUAGES (celui de l'accueil d'avant : MENU_BIO), repeint si le voyage BIO est passé derrière
  {const BT=BIOMES.titre||BIOMES[MENU_BIO]; /* (titre v3) l'ambiance du titre */
   if(!MENUV.bio||CHUTE.bioPas!==BIO.pas||CHUTE.bioT!==BT){if(!MENUV.bio||CHUTE.bioT!==BT)paintEnv(BT.env,BT.eS1,BT.eS2);MENUV.bio=true;CHUTE.bioPas=BIO.pas;CHUTE.bioT=BT;bioApply(BT);
     if(!(BT.sunHalo>0)){sunSprite.material.opacity=0;horizonGlow.material.opacity=0;for(const r9 of RAYS)r9.material.opacity=0;}}} /* (les heures du titre) la NUIT n'a pas de soleil : bioApply laissait le disque à 15 % */
  skyU.uMer.value=1;if(P.mzA)skyU.uMzA.value.fromArray(P.mzA);if(P.mzB)skyU.uMzB.value.fromArray(P.mzB);if(P.mzT)skyU.uMzT.value.fromArray(P.mzT);if(P.mzO)skyU.uMzO.value.fromArray(P.mzO);if(P.mzH)skyU.uMzH.value.fromArray(P.mzH);if(P.merLoin)skyU.uMerLoin.value=P.merLoin; /* (titre v3) la mer de nuages du titre (rendue par chuteSort) */
  if(CHUTE.nuM){CHUTE.nuM.uniforms.uK.value.fromArray(P.K);CHUTE.nuM.uniforms.uR.value.fromArray(P.R);}
  /* (2026-09-30) LA BRUME ET L'EXPOSITION DE L'AMBIANCE : seule la course les réécrit (updateClouds) — au menu la brume restait le violet
     de départ du jeu (#5e3254) et l'exposition .71 : la mer de nuages et les cumulus s'y noyaient en violet. chuteSort rend celles d'avant. */
  if(scene.fog){const bz9=P.brume*(P.cielT?P.brumeT:1);scene.fog.color.copy(FOG_BASE);scene.fog.near=FOG_N*bz9;scene.fog.far=FOG_F*bz9; /* (titre v5) la brume recule : les tours de l'horizon, à 5 km, restent lisibles */skyU.uFogCol.value.copy(FOG_BASE);} // (P.brume : de là-haut, la brume s'éloigne — la mer de nuages fait sa propre perspective)
  if(acesPass)acesPass.uniforms.uExposure.value=POST_EXPO*P.expo;
  {const T9=titreCiel(!!P.cielT);if(P.cielT&&scene.fog)scene.fog.color.fromArray(T9.h);} /* (titre v4) le ciel du titre, et la brume des cumulus = son horizon */
  if(GAR.root&&GAR.root.visible)GAR.root.visible=false;
  if(COTON.root){const v9=!!P.coton&&COTON.n>0;if(COTON.root.visible!==v9)COTON.root.visible=v9;} /* (CHUTE_P.coton : 1 = les cumulus du niveau au menu) (niveau 1 v2) au menu, de 1 500 m, les cumulus du niveau passaient en BOULES translucides devant la caisse (le « fantôme » de la capture de Sacha) : la mer de nuages suffit — chuteSort les rend */
  if(CHUTE.L!==L)chutePlan();
  // L'ANCRE : au-dessus du début de piste, en retrait, à P.alt mètres
  frameAt(CHUTE.s,F);const lh=CHUTE.lh,sw=Math.sin(t*.11)*.07+Math.sin(t*.047+1.1)*.04; // la vue BALANCE lentement autour de la caisse
  const cA=Math.cos(sw),sA=Math.sin(sw);const lx=lh.x*cA-lh.z*sA,lz=lh.x*sA+lh.z*cA;
  {const ct9=P.cote*(camera.aspect>1?1:.12);CHUTE.C.set(CHUTE.G.x-lh.x*P.avant+lh.z*ct9,CHUTE.G.y+P.alt,CHUTE.G.z-lh.z*P.avant-lh.x*ct9);} // (titre v3) au-dessus du sommet de la piste, en retrait ; la piste un peu à DROITE de la caisse (couché : la caisse est à gauche)
  // LE CAP : de trois-quarts, vers la droite de l'écran et vers la route (P.cap) — le nez plonge de P.pitch
  const rx=-lz,rz=lx;                                                             // la droite de l'écran (regard × haut) : le nez pique vers la DROITE, la traînée file en haut à gauche
  const cl=P.cl!=null?+P.cl:1,K=CHUTE_CL,raf=chuteRafale(t),vib=document.documentElement.getAttribute('data-reduced-motion')!=='1'?cl:0; /* (LA CHUTE LIBRE RÉALISTE) la rafale du moment, et le tremblement (coupé sous « Réduire les animations ») */
  const ya=cl*K.ya*chuteBr2(t*.11,4)+vib*K.tr*.6*(.3+.7*raf)*chuteBr(t*9.3,24),cap9=P.cap+ya; // le lacet dérive (la caisse se cherche une route dans l'air)
  CHUTE.fh.set(rx*Math.cos(cap9)+lx*Math.sin(cap9),0,rz*Math.cos(cap9)+lz*Math.sin(cap9)).normalize();
  /* LA CAISSE EN DIAGONALE (2026-10-08, Léo : « dans le menu ciel du début la voiture nous tourne trop le dos » puis « plus diagonale, qu'on
     voie un peu l'avant et le profil ») — MESURÉ (planche de 8 angles) : la caisse était fixe dans le monde et le regard en faisait le tour,
     elle montrait ses feux arrière et son dessous la MOITIÉ du tour (0° → 180°). Le regard garde son tour (le ciel, le soleil, les cumulus
     tournent comme avant, au doigt aussi) mais la caisse pivote avec lui : toujours vue de trois-quarts avant, nez à droite (303° ↔ 327°, un
     aller-retour par tour). Au piqué (JOUER) le tour s'arrête, son cap aussi : la caméra passe derrière elle comme avant. */
  if(P.face!=null){const h9=P.face+(P.faceA||0)*Math.sin(CHUTE.oA),ps9=CHUTE.oA-h9,c9=Math.cos(ps9),s9=Math.sin(ps9),x9=CHUTE.fh.x,z9=CHUTE.fh.z;CHUTE.fh.x=x9*c9-z9*s9;CHUTE.fh.z=x9*s9+z9*c9;}
  let u=0,pi,ro,dy=0,fwd=0; /* (titre v3) P.gite : elle montre son TOIT à la caméra */
  if(cl>0){const fl=Math.sin(t*2.05+2.2*chuteBr(t*.13,3))*(.35+.65*raf); // la FLÉCHETTE : le nez lourd revient vers le bas et dépasse, plus fort dans la rafale
    pi=P.pitch+cl*(K.pa*chuteBr2(t*.19,1)+K.po*fl)+vib*K.tr*(.3+.7*raf)*chuteBr(t*11.1,21);
    ro=(P.gite||0)+cl*K.ra*chuteBr2(t*.23,2)+cl*.04*Math.sin(t*1.45+1.7*chuteBr(t*.17,5))*(.4+.6*raf)+vib*K.tr*1.3*(.3+.7*raf)*chuteBr(t*12.7,22);}
  else{pi=P.pitch+.06*Math.sin(t*.9)+.03*Math.sin(t*2.3);ro=(P.gite||0)+P.roule*Math.sin(t*.53)+.07*Math.sin(t*1.7);} // (cl 0) le balancement d'avant
  if(G){G.t+=dt;u=Math.min(1,G.t/1.75);const e=u*u*(3-2*u);
    /* (2026-10-15, Sacha : « améliore l'animation du lancement ») L'ÉLAN AVANT LE PIQUÉ : le nez plongeait en ligne droite dès la 1re image
       (rampe linéaire, partie à pleine vitesse). Maintenant elle PREND SON ÉLAN — le nez se cabre et la caisse se soulève (~0,25 s, an9),
       puis bascule en piqué sur une courbe sans à-coup (smootherstep, d9) : on lit le geste avant qu'il parte. */
    const an9=Math.sin(Math.min(1,u/.16)*Math.PI),k9=Math.min(1,Math.max(0,(u-.06)/.34)),d9=k9*k9*k9*(k9*(k9*6-15)+10);
    pi+=(1.3-pi)*d9-.22*an9*(1-d9);ro*=1-e;                                        // le nez PLONGE
    dy=-Math.pow(u,2.3)*150+1.4*an9*(1-u);fwd=Math.pow(u,2)*25;}                   // elle accélère vers la route
  const f=CHUTE.f.copy(CHUTE.fh).multiplyScalar(Math.cos(pi));f.y=-Math.sin(pi);f.normalize();
  const C=CHUTE.v3.copy(CHUTE.C).addScaledVector(CHUTE.fh,fwd);C.y+=dy; // L'ANCRE de la caméra : lisse (la caméra la vise)
  const Ck=CHUTE.ck||(CHUTE.ck=new THREE.Vector3());Ck.copy(C);           // LA CAISSE : elle flotte autour de l'ancre (LA CHUTE LIBRE RÉALISTE)
  if(cl>0){const sh9=vib*K.sh*(.25+.75*raf)*(1+u*2);
    Ck.x+=cl*K.dx*chuteBr2(t*.15,6)+sh9*chuteBr(t*10.3,26);Ck.y+=cl*K.dy*chuteBr2(t*.18,7)+sh9*chuteBr(t*9.1,27);Ck.z+=cl*K.dx*chuteBr2(t*.14,8)+sh9*chuteBr(t*11.7,28);}
  else{Ck.y+=Math.sin(t*2.1)*.12;Ck.x+=Math.sin(t*1.3)*.1;}
  // l'assiette : axes de la caisse (x = haut × avant, y = haut, z = avant), le roulis autour de l'avant
  const up=CHUTE.v1.set(0,1,0).addScaledVector(f,-f.y).normalize(),sd=CHUTE.v2.crossVectors(up,f).normalize();
  const cr=Math.cos(ro),sr=Math.sin(ro);const ux=up.x*cr+sd.x*sr,uy=up.y*cr+sd.y*sr,uz=up.z*cr+sd.z*sr;up.set(ux,uy,uz);sd.crossVectors(up,f).normalize();
  CHUTE.m.makeBasis(sd,up,f);carGroup.quaternion.setFromRotationMatrix(CHUTE.m);
  const sp=CARS[garageI]||CARS[0],sc=P.echelle;carGroup.scale.set(sc,sc,sc);
  carGroup.position.copy(Ck).addScaledVector(up,-.45*sc);carGroup.visible=P.caisse!==0;chuteTapeTick(dt,Ck,up,sc); /* (2026-10-03) le coup du tapotement : poussée et pivot autour du CENTRE, qui reviennent en ressort */ /* (atelier des nuages) P.caisse = 0 : les nuages seuls */   // (le centre de la caisse, pas ses roues, sur l'ancre)
  if(cl>0){ // (LA CHUTE LIBRE RÉALISTE) LES ROUES EN ROUE LIBRE : le vent les fait tourner lentement, chacune à son rythme ; au piqué, elles s'emballent
    for(let i=0;i<wheels.length;i++)wheels[i].rotation.x+=dt*(K.roue*cl*(1+.9*chuteBr(t*.27,30+(i>>1)))+u*30);
    for(let i=0;i<ESSIEUX.length;i++)ESSIEUX[i].rotation.x+=dt*(K.roue*cl*(1+.9*chuteBr(t*.27,30+i))+u*30);
    /* LES SUSPENSIONS DÉTENDUES : rien ne pèse sur les ressorts — la carrosserie se soulève de ses roues et tressaute dessus, bascule un peu */
    const rs9=vib*(.35+.65*raf);carBody.position.set(0,K.det*cl+K.ressort*rs9*chuteBr(t*3.4,31),0);carBody.rotation.set(K.cass*rs9*chuteBr(t*2.7,32),0,K.cass*1.2*rs9*chuteBr(t*3.1,33));CHUTE.corps=true;}
  else{for(const w of wheels)w.rotation.x+=dt*(7+u*30);for(const e of ESSIEUX)e.rotation.x+=dt*(7+u*30);if(CHUTE.corps){carBody.position.set(0,0,0);carBody.rotation.set(0,0,0);CHUTE.corps=false;}} // les roues tournent dans le vide
  // LA CAMÉRA : dans l'axe de la route, un peu au-dessus, la caisse dans la place libre (menuCadre)
  const Cd=menuCadre(),R9=.5*Math.hypot(sp.l||4.2,sp.w||1.9,(sp.h||.8)+.6)*sc,fov0=G?44-5*Math.sin(Math.min(1,u/.16)*Math.PI)+30*u*u:44; /* (2026-10-15) pendant l'élan le champ se resserre un instant, puis il s'ouvre en grand avec la vitesse : le coup de zoom du départ */
  const nx=Cd.nx+(camera.aspect<1?-.07:0); // debout « un peu à gauche » (Sacha) — à −0,16 la caisse plongeante du titre v3 (vue de trois-quarts dessus) touchait le bord gauche de l'écran (31 px, banc cadrage.mjs) : −0,07 la garde un rien à gauche du milieu
  if(Math.abs(camera.fov-fov0)>.01){camera.fov=fov0;camera.updateProjectionMatrix();}
  /* ⚠ (titre v3) LE DÉCENTREMENT DE L'ATELIER : le garage décale l'objectif (`setViewOffset`) pour sa mise en page et ne le rendait pas en
     revenant au ciel — mesuré (banc retour.js, sur main aussi) : après une visite au garage, la caisse du titre sortait du cadre à gauche
     (−1,08 NDC au lieu de −0,58). Le ciel n'a pas de décentrement : on l'efface. */
  if(camera.view&&camera.view.enabled){GAR.dec=GAR.decX=0;GAR.cdx=GAR.cdy=GAR.cvx=GAR.cvy=0;camera.clearViewOffset();}
  const tV=Math.tan(camera.fov*Math.PI/360),tH=tV*camera.aspect;
  const d=Math.max(R9*P.taille*(camera.aspect>1?1.75:1)/(Cd.fr*tH),R9*.8/(Cd.fh*tV))*(1+.03*Math.sin(t*.37));
  /* L'ORBITE AU DOIGT (2026-09-30, Sacha : « rajoute un moyen de déplacer la caméra autour de la voiture avec le doigt ») — glisser tourne
     le regard autour de la caisse (le tour complet), de haut en bas il monte ou plonge ; la vue rejoint le doigt en douceur (~0,1 s) et,
     lâchée en mouvement, elle garde son élan (frottement ×e^−3t) — le même geste que l'atelier (« le glissé fondu »). Pas de retour
     automatique : c'est JOUER qui ramène la caméra derrière elle pour le piqué. La caisse, elle, ne bouge pas dans le monde. */
  /* LE TOUR SANS FIN (2026-10-07, Léo : « l'écran menu ciel, dans le même angle, tourne en 360 constamment — pas trop rapide, faut pas que
     ce soit vomitif, plutôt lent ; on doit pouvoir tourner la voiture ; faut que ça ait l'air d'être en chute ») — le regard fait le tour
     complet de la caisse, à la hauteur du menu (oP ne bouge pas), un tour en `P.tour` secondes : le CAMÉRAMAN DE CHUTE LIBRE qui spirale
     autour d'elle pendant que l'air et les cumulus montent. C'est l'orbite au doigt avec un PLANCHER de vitesse : le doigt la saisit (elle
     s'arrête dessous, `CHUTE.tk` = 0), la lance (l'élan retombe vers le tour lent, dans le SENS du lancer, `CHUTE.tSens`) ; lâchée sans élan,
     elle repart en douceur (`tk` revient à 1 en ~3 s). Coupé : « Réduire les animations », image figée (P.fige), l'atelier des nuages. */
  /* LE CIEL NE SE TOUCHE PLUS (2026-10-08, Léo : « on ne doit plus pouvoir toucher le ciel avec les doigts ; ça tourne dans le sens dans lequel
     ça devrait tourner ») — le doigt ne saisit plus le tour, ne le lance plus, ne l'inverse plus, et un doigt posé (sur la caisse) ne l'arrête plus :
     il continue dessous, toujours dans le sens `P.sens`. Le doigt garde la CAISSE (la taper, la tourner, la tirer, la balancer). */
  if(!G){const tw9=P.tour>0&&P.fige==null&&document.documentElement.getAttribute('data-reduced-motion')!=='1'?(P.sens||1)*6.2832/P.tour:0;
    {CHUTE.tk+=(1-CHUTE.tk)*(1-Math.exp(-dt*.7));const w9=tw9*CHUTE.tk;CHUTE.oW=w9+(CHUTE.oW-w9)*Math.exp(-dt*3);if(!w9&&Math.abs(CHUTE.oW)<.015)CHUTE.oW=0;CHUTE.oAc+=CHUTE.oW*dt;}
    const kS=1-Math.exp(-dt*10);CHUTE.oA+=(CHUTE.oAc-CHUTE.oA)*kS;CHUTE.oP+=(CHUTE.oPc-CHUTE.oP)*kS;}
  const oc=Math.cos(CHUTE.oA),os=Math.sin(CHUTE.oA),ox=lx*oc-lz*os,oz=lx*os+lz*oc,el9=THREE.MathUtils.clamp((camera.aspect<1&&P.elevP!=null?P.elevP:P.elev)+CHUTE.oP,-.45,1.25); /* (2026-10-03, Léo, deux captures : « voici le point de vue vertical souhaité ») le regard presque à niveau — couché (elev) un rien SOUS la caisse, on voit son dessous — (2026-10-05, Léo : « en paysage le point de vue un tout petit plus haut, ou juste la coupure blanc/bleu au même niveau que le haut de la barre MISSIONS ») elev −,08 → −,035 : la ligne blanche de l'horizon passe AU RAS du haut de MISSIONS (banc horizon.mjs, 844 × 390 : y 217 → 194, la caisse ne bouge pas dans le cadre) ; debout (elevP) à peine au-dessus : l'horizon à ~40 % — (2026-10-07, Léo : « le ciel un tout petit plus haut, cadré au centre de l'écran ») couché, elev −,035 → ,015 : la coupure blanc/bleu de la mer de nuages remonte au MILIEU de l'écran (844 × 390, image figée : y 218 → 194, aux six heures du titre) ; la caisse garde sa place dans le cadre ; debout inchangé */
  const ce=Math.cos(el9),se=Math.sin(el9);
  CHUTE.cam.set(C.x-ox*ce*d,C.y+se*d,C.z-oz*ce*d);
  if(G){const k=Math.min(1,u/.5),e9=k*k*(3-2*k);                                   // la caméra passe DERRIÈRE elle (poursuite plongeante)
    /* (2026-10-07, LE TOUR SANS FIN) elle y passe EN TOURNANT autour de la caisse (cap, hauteur, distance interpolés) et plus en ligne droite :
       le regard tourne sans cesse, JOUER peut partir du côté opposé — la corde passait alors À TRAVERS la caisse. Même arrivée qu'avant. */
    const ax9=CHUTE.cam.x-C.x,ay9=CHUTE.cam.y-C.y,az9=CHUTE.cam.z-C.z,la9=Math.hypot(ax9,ay9,az9)||1,bx9=-f.x*9,by9=-f.y*9+3.2,bz9=-f.z*9,lb9=Math.hypot(bx9,by9,bz9);
    const h0=Math.atan2(az9,ax9);let dh=Math.atan2(bz9,bx9)-h0;dh-=6.2832*Math.round(dh/6.2832);
    const h9=h0+dh*e9,e0=Math.asin(THREE.MathUtils.clamp(ay9/la9,-1,1)),v9=e0+(Math.asin(THREE.MathUtils.clamp(by9/lb9,-1,1))-e0)*e9,l9=la9+(lb9-la9)*e9,c9=Math.cos(v9)*l9;
    CHUTE.cam.set(C.x+Math.cos(h9)*c9,C.y+Math.sin(v9)*l9,C.z+Math.sin(h9)*c9);}
  camera.position.copy(CHUTE.cam);camera.up.set(0,1,0);camera.lookAt(C);
  /* (titre v3) L'HORIZON DROIT : le décadrage tournait autour de l'axe de la caméra, déjà penchée vers le bas — l'horizon basculait de 10°.
     Il tourne autour de la VERTICALE DU MONDE (÷ cos de la plongée : la caisse garde sa place à l'écran). */
  {const k=G?1-Math.min(1,u/.5):1,ce9=Math.max(.5,Math.cos(el9));camera.rotateOnWorldAxis(AXIS_Y,Math.atan(nx*tH)/ce9*k);camera.rotateX(-Math.atan(Cd.ny*tV)*k);}   // la caisse glisse dans la zone libre
  if(G&&u>.2&&vib>0){const a=(u-.2)*.9,tg=G.t;camera.position.x+=.07*a*chuteBr(tg*19,60);camera.position.y+=.07*a*chuteBr(tg*17,61);camera.rotateZ(.014*a*chuteBr(tg*6,62));} // l'air qui cogne — (2026-10-15) un tremblement LISSE qui monte (le tirage au hasard par image grésillait), et la vue qui roule un peu ; rien sous « Réduire les animations »
  if(CHUTE_TAP.sh>0){const k9=CHUTE_TAP.sh;camera.position.x+=(Math.random()-.5)*.5*k9;camera.position.y+=(Math.random()-.5)*.5*k9;camera.position.z+=(Math.random()-.5)*.5*k9;camera.rotateZ((Math.random()-.5)*.06*k9); // (LA CAISSE AU DOIGT v2) le coup secoue la caméra…
    camera.fov=fov0-9*Math.min(1,k9);camera.updateProjectionMatrix();} // (14/10) le coup de zoom ×1,8 // …et la fait cogner d'un coup de zoom (la ligne du champ, plus haut, le rend à l'image suivante)
  camera.updateMatrixWorld();
  try{chuteDoigtTick(dt,Ck,G);}catch(_){} /* (2026-10-15 soir, Sacha) LE DOIGT DE BIENVENUE : la main suit la caisse, la caméra posée */
  // LA LUMIÈRE : le soleil du ciel fait le gros ; une clé douce du côté caméra, un contre-jour bleu ciel qui détoure la caisse
  if(P.studio){chuteStudio(Ck,up,P);}else{trailLight.intensity=0;if(CHUTE.lc)carLight.color.copy(CHUTE.lc);{const BT=BIOMES.titre||BIOMES[MENU_BIO];if(BT.hemiI!=null)hemi.intensity=BT.hemiI;if(BT.sunI!=null)sun.intensity=BT.sunI;} // (2026-10-03) LE MODELÉ DE LA CAISSE (voir chuteStudio) ; P.studio = 0 : l'éclairage d'avant
  stallKey.color.setHex(P.cleC);stallKey.intensity=.9*P.cle;stallKey.distance=60;stallKey.position.copy(CHUTE.cam).addScaledVector(up,4);
  camera.getWorldDirection(CHUTE.v2).multiplyScalar(1-P.rimS).addScaledVector(SUN_DIR,P.rimS).normalize();
  stallRim.color.setHex(P.rimC);stallRim.intensity=P.rim;stallRim.distance=40;stallRim.position.copy(Ck).addScaledVector(CHUTE.v2,7).addScaledVector(up,2.5);
  carLight.position.copy(CHUTE.cam).addScaledVector(up,2.5);carLight.intensity=1.6*P.cle*P.lampe;carLight.distance=60;}
  headSpot.intensity=0;if(CARPOOL.head)CARPOOL.head.visible=false; // en plein jour, en l'air : ni phares (leur tache bleue sur les nuages au piqué), ni la nappe de 15 m des faisceaux (un plan qui flotte devant le nez)
  {const s9=!P.cielT;sunSprite.visible=s9&&sunSprite.material.opacity>.02;horizonGlow.visible=s9&&horizonGlow.material.opacity>.02;for(const r9 of RAYS)r9.visible=s9&&r9.material.opacity>.002;} /* (titre v4) le sprite de lueur d horizon dessinait la RAYURE : le ciel du titre fait sa lumière lui-même */
  if(pigGroup)pigGroup.visible=false;if(landMark)landMark.visible=false;
  // SA TRAÎNÉE monte derrière elle (celle de la boutique) ; L'AIR MONTE : les bancs de nuage et les filets de vent
  trailApercu(dt,P.trainee>0,P.trainee);
  for(const sp of CHUTE.sol)sp.visible=!!P.plancher;
  const vk=1+(G?u*u*7:0),cp=camera.position,dC=cp.distanceTo(C);
  for(const w of CHUTE.w){w.y+=P.vit*w.v*vk*dt;if(w.y>70)chuteNuageNeuf(w,false);
    const s=w.sp;s.visible=!!P.voiles; /* (titre v4) les bancs-sprites flous (des taches dans le ciel) : éteints, les cumulus 3D font la chute */s.position.set(C.x+w.x,C.y+w.y,C.z+w.z);s.scale.set(w.s*1.35,w.s,1);
    let o=Math.min(1,(w.y+110)/35)*Math.min(1,(70-w.y)/30);                          // fondu à la naissance et à la sortie
    const dW=cp.distanceTo(s.position);o*=Math.min(1,Math.max(0,(dW-w.s*.35)/(w.s*.6))); // on ne se prend pas un nuage dans l'objectif au repos
    if(dW<dC+w.s){CHUTE.v1.copy(s.position).project(camera);CHUTE.v2.copy(C).project(camera);
      const e=Math.hypot((CHUTE.v1.x-CHUTE.v2.x)*camera.aspect,CHUTE.v1.y-CHUTE.v2.y),tV9=Math.tan(camera.fov*Math.PI/360),
            rW=w.s*.62/(Math.max(1,dW)*tV9),rC=R9*1.2/(Math.max(1,dC)*tV9);
      o*=Math.max(0,Math.min(1,(e-(rW*.75+rC))/(rW*.5+.08)));}                       // …et jamais une ouate DEVANT la caisse (son disque projeté contre celui de la caisse)
    s.material.opacity=o*(G?1:.78);}
  if(CHUTE.nu){const on9=!!P.nuages,C0=CHUTE.C,rx0=-lh.z,rz0=lh.x; // (titre v3) LES CUMULUS : ils montent, la caisse tombe
    for(const c of CHUTE.nu){c.y+=P.vit*c.v*vk*dt;if(c.y>c.hi)c.y=c.lo;c.m.visible=on9&&!c.off&&!!c.e.g;c.m.position.set(C0.x+rx0*c.a+lh.x*c.b,C0.y+c.y,C0.z+rz0*c.a+lh.z*c.b);}}
  {const Fi=CHUTE.fil,pos=Fi.pos,col=Fi.col,cd=camera.getWorldDirection(CHUTE.v1);
   const ax=-cd.z,az=cd.x,an=Math.hypot(ax,az)||1;                                // la largeur des filets : horizontale, face caméra
   for(let i=0;i<Fi.S.length;i++){const S9=Fi.S[i];S9.y+=P.vit*S9.v*vk*dt;if(S9.y>44)chuteFilNeuf(S9,false);
     const x0=C.x+S9.x,z0=C.z+S9.z,y0=C.y+S9.y,y1=y0-S9.l*(G?1+u*2:1),hw=S9.w*.5,wx=ax/an*hw,wz=az/an*hw,o=i*12;
     pos[o]=x0-wx;pos[o+1]=y0;pos[o+2]=z0-wz;pos[o+3]=x0+wx;pos[o+4]=y0;pos[o+5]=z0+wz;
     pos[o+6]=x0-wx;pos[o+7]=y1;pos[o+8]=z0-wz;pos[o+9]=x0+wx;pos[o+10]=y1;pos[o+11]=z0+wz;
     const cp9=camera.position,dc9=Math.hypot(x0-cp9.x,(y0+y1)*.5-cp9.y,z0-cp9.z); /* (niveau 1 v2) un filet qui frôle la CAMÉRA devenait un rayon de lumière vertical sur tout l'écran (lu comme un bug) : il s'efface avant */
     const a=S9.a*Math.min(1,(S9.y+44)/10)*Math.min(1,(44-S9.y)/10)*(G?1.3:.3)*Math.min(1,Math.max(0,(dc9-6)/8));   // la tête du filet blanche, la queue éteinte
     const tc9=TITRE_HF.tcol;col[o]=col[o+3]=a*tc9.r;col[o+1]=col[o+4]=a*tc9.g;col[o+2]=col[o+5]=a*tc9.b;col[o+6]=col[o+9]=0;col[o+7]=col[o+10]=0;col[o+8]=col[o+11]=0;}
   Fi.m.visible=true;Fi.m.geometry.attributes.position.needsUpdate=true;Fi.m.geometry.attributes.color.needsUpdate=true;}
  // LE VENT : le souffle et le sifflement de la chute (les nœuds du moteur de son, au repos hors course)
  /* (niveau 1 v2) LA CHUTE LIBRE a sa boucle (`chute.vent` : grondement, rafales, l'air qui claque sur les tôles) ; retentée tant que le son
     n'est pas prêt (premier geste). Au piqué de JOUER, elle monte de 4 dB et s'accélère de 25 % : l'air hurle. */
  /* (2026-10-14, Léo : « quand on est — et quand on revient — dans le menu ciel, un bruit de chute libre doux ») AU REPOS, le ciel n'a plus que
     LA CHUTE LIBRE DOUCE (`chuteDoux`, la musique du lobby loin derrière : MUS_CIEL) ; le grondement claquant de `chute.vent` et le vent du
     moteur ne servent plus qu'au PIQUÉ de JOUER, où l'air se met à hurler (comme avant). */
/* (2026-10-16, Léo : « un bug audio que tu n'as jamais su régler, qui pourrait défoncer les oreilles des joueurs en plein début de partie —
   un mélange entre un souffle, un bruit aigu, et un boom ; dans mes écouteurs Bluetooth, et parfois sur l'ordi ») LE PIQUÉ QUI NE CRIE PLUS.
   MESURÉ au banc (sortie enregistrée, effets seuls, bandes grave < 160 Hz et aigu 2,5-8 kHz, un son retiré à la fois) : au ciel tout est doux
   (grave −50, aigu −62 dB) ; au JOUER, en 200 ms, le LÂCHER (garage.lacher) fait bondir le grave de +18 dB (le BOOM), puis pendant le piqué le
   VENT du moteur (windG/whG, filtre ouvert jusqu'à 3,3 kHz) et la chute douce gonflée montent l'aigu de +27 dB en 1,5 s (le SOUFFLE AIGU) ;
   le logo du départ remet un coup de sub. Le joueur règle son volume sur le ciel, calme : le piqué lui arrivait 20-27 dB plus fort, d'un
   coup — au casque, où l'aigu et le sub passent entiers, c'était la gifle. Désormais le piqué monte d'environ 10 dB au plus : le vent reste
   sombre (filtre ≤ 1,7 kHz), le sifflet discret, le V8 du JOUER −9 dB, le lâcher −8, le logo −4 ; sans la banque de sons (pas encore chargée), le vieux souffle
   de secours est −10 dB (il partait en 50 ms à −5 dBFS de crête). */
  try{chuteDoux(t,G?u:0);}catch(e){}
  if(G){
    if(SONV2&&!CHUTE.snd&&t>(CHUTE.sndT||0)){CHUTE.sndT=t+1;try{CHUTE.snd=sfx('chute.vent',{loop:true,vol:-22});}catch(e){}}
    if(CHUTE.snd){CHUTE.snd.gain(2*u,.25);CHUTE.snd.rate(1+.2*u,.25);} // (2026-10-16) +2 dB au piqué (était +4), −22 (était −20)
    if(AC&&windG&&whG){try{CHUTE.vent=true;stt(windG.gain,.025+.02*u,AC.currentTime,.4);stt(windF.frequency,800+900*u,AC.currentTime,.4);stt(whG.gain,.008+.01*u,AC.currentTime,.4);}catch(e){}}} // (2026-10-16) le vent du piqué : .05→.10 / 900→3 300 Hz / sifflet .02→.07 avant
  // JOUER : le banc de nuage traversé (voile blanc), puis la course sous le voile
  if(G){if(!G.voile&&u>.74){G.voile=true;try{sfx('nuage.entre');}catch(e){}}
    /* (2026-10-15) LE NUAGE QU'ON TRAVERSE : le voile montait en rampe droite, plat ; il arrive maintenant en courbe douce et EN APPROCHE
       (il grossit vers nous, ×1,25 → 1), puis il se DÉCHIRE autour de la caisse (s'ouvre ×1,6 en s'effaçant) — transform/opacity seulement. */
    const v=chuteVoileEl();v.style.transition='none';{const w9=Math.max(0,Math.min(1,(u-.72)/.22)),s9=w9*w9*(3-2*w9);v.style.opacity=String(s9);v.style.transform='scale('+(1.25-.25*s9).toFixed(3)+')';}
    if(u>=1){
      if(CHUTE.sous){const f9=CHUTE.sous;CHUTE.sous=null;try{f9();}catch(e){console.warn('chute: piste sous le voile',e);}} // (2026-10-15) la piste tirée par JOUER se bâtit ICI, sous le nuage blanc (voir classiqueJouer)
      const wasStarted=started;GAR.go=null;CHUTE.go=null;carGroup.scale.set(1,1,1);
      closeGarage();
      if(wasStarted)resetGame();else{start();fireLaunchBoost();}
      /* le nuage se déchire SUR la piste — (2026-10-15) après la 1re image de la course RENDUE (deux rAF, au lieu d'un minuteur de 60 ms qui
         pouvait découvrir une image pas encore dessinée), en s'ouvrant vers nous */
      requestAnimationFrame(function(){requestAnimationFrame(function(){v.style.transition='opacity .6s var(--ease,cubic-bezier(.32,.72,0,1)),transform .6s var(--ease,cubic-bezier(.32,.72,0,1))';v.style.opacity='0';v.style.transform='scale(1.6)';});});
    }}
}
/* LE GARAGE SOBRE (2026-09-29, Léo : « le point de vue est bizarre, on dirait un effet loupe ; je veux un garage plus sobre, la voiture au
   milieu, qui tourne grâce à la plateforme ») : la caméra ne tourne plus autour de la caisse. Elle est FIXE, côté établi, et regarde la
   porte en feu ; c'est le PLATEAU qui tourne, la caisse dessus. `garageAng` garde son sens (l'angle d'où l'on regarde la caisse : les
   préréglages .42, 3,5 aux TRAÎNÉES, le glissé du doigt n'ont pas bougé) — il fait tourner la caisse de `GAR_CAM_A − garageAng`. */
const GAR_CAM_A=Math.PI;
function garRot(){return GAR_CAM_A-garageAng;}
/* LE RESSORT CRITIQUE (2026-10-06, Léo : « parfois pour se replacer l'écran a des petits déclics qui se voient corrigés, rends smooth le fait de
   bouger dans le garage »). Mesuré (banc lisse/cam.mjs : la caméra du garage rejouée image par image, horloge figée à 60 i/s) : chaque
   « déclic » était un mouvement qui PARTAIT À PLEINE VITESSE dans une seule image — un lissage du 1er ordre (x += (cible − x)·k) ou un
   asservissement allumé d'un coup. Ce ressort amorti critique rejoint sa cible SANS jamais partir d'un coup ni dépasser : la vitesse est
   continue (elle part de zéro, monte, retombe). Solution exacte (pas d'intégration pas à pas) : stable à toutes les cadences. `om` = sa
   raideur (rad/s) — il a rejoint 90 % du chemin en ~3,9/om s. o[kx] la valeur, o[kv] sa vitesse. */
function garRessort(o,kx,kv,c,om,dt){const y=(o[kx]||0)-c,v=o[kv]||0,e=Math.exp(-om*dt),a=v+om*y;o[kx]=c+(y+a*dt)*e;o[kv]=(v-om*a*dt)*e;}
function garCamA(){return GAR_CAM_A+(GAR.vA||0)+(GAR.swO||0)+(GAR.vD||0);} // (2026-10-05) + vD : le décalage qui pose la caisse à gauche de l'entrée (vitrine) // (2026-09-30) l'azimut RÉEL de la caméra : l'axe + le regard du doigt + le balancement (voir « LE GARAGE QUI VIT »)
/* (2026-10-05, Léo : « un peu plus doux l'effet tourner dans le garage — c'est pas mal le flottement, juste ça tourne trop la tête ») LE TOUR AU
   DOIGT, ADOUCI en vitrine : dPx rad par pixel (,007 au menu), l'élan plafonné à dElan rad/s (7 au menu), la caméra penche quatre fois moins
   dans le virage, le balancement au repos ×(1 − dSway).
   (2026-10-05, Léo : « effet flottant à revoir, restructurer pour que ce soit satisfaisant — là c'est un peu brut ») LE TOUR RESTRUCTURÉ :
   · la vue suit le doigt par un RESSORT AMORTI CRITIQUE (dLisse s ≈ le temps pour rejoindre le doigt) : elle accélère puis freine, sans
     dépasser — avant, un suivi du 1er ordre partait à pleine vitesse et s'arrêtait net ;
   · lâchée, elle GLISSE et freine en douceur (dFrein /s : un glissé moyen ajoute ~80 % du geste, un lancer au plus dElan/dFrein rad) ;
   · rattrapée en vol, elle ralentit sous le doigt sans revenir en arrière (la cible = la position + vitesse × dLisse/2) ;
   · la visée est RIGIDE : la caméra regarde toujours l'entrée par-dessus la caisse, elle ne fouette plus de la porte au fond pendant le tour ;
   · le glissé qui pose la caisse à gauche (vD) démarre en douceur avec la vitrine et se pose en ~1 s, au lieu de partir net et de traîner ;
   · (même soir, Léo : « arrête de faire tourner automatiquement le garage ; le pdv un peu plus proche ; l'effet doit moins basculer et suivre
     la voiture un tout petit peu plus, pas trop ») : AU REPOS la caméra ne tourne plus d'elle-même (balancement latéral coupé, dSway 1 ;
     le glissé vD ne recadre qu'au-delà de 3 % d'écart), le balancement vertical moitié moins (dSwayV), roulis ×,15 (dRoulis ,85), rebond
     plus sage (dAmorti ,78), la visée suit un peu mieux (dRegard 4,5 : ~0,22 s), la caméra ~10 % plus près (fw ,98 · fwP ,88 · fh ,88) ;
   · (même jour, « un peu générique — un juste milieu entre les deux ») : ressort un peu sous-amorti (dAmorti), visée qui traîne (dRegard),
     un peu plus de roulis (dRoulis : ×(1 − ,6) au lieu de ×,25) et de balancement (dSway ,35), un peu plus d'élan (dElan 2, dFrein 3) ;
   · le zoom ne respire plus avec l'angle du doigt (seulement avec le plateau) ; le recadrage de l'image se lisse dans le temps, plus par image. */
/* (2026-10-09, Léo : « lève un peu la voiture dans le POV ») cy .55 → .47 (debout), cyL .6 → .54 (couché) : la caisse remonte dans sa place. */
const VITRINE_CAM={dRecadre:3.6,retAttente:3,retDuree:1.1,retPente:.9,dPx:.0046,dLisse:.3,dAmorti:.78,dFrein:3,dElan:2,dSway:1,dSwayV:.5,dRegard:4.5,dRoulis:.85,porteY:1.9,fw:.9,fwP:.88,fh:.8,fhP:.88,cx:.43,cxL:.62,cy:.47,cyL:.54,adapt:.5,p:.08,y:0,vise:-.38,viseP:.6,fov:.9,rot:.15,cle:.3,rim:.35}; // LA VITRINE v2 : la caisse tient dans fw de la largeur libre et fh de sa hauteur, inclinaison +p rad, hauteur +y m, visée +vise (+viseP debout), objectif ×fov, plateau rot rad/s, lampes +cle/+rim
/* le GABARIT de la caisse vue en tournant : R = demi-diagonale de son empreinte au sol (la plus large qu'elle montre), H = sa hauteur. Mesuré
   caisse droite et à l'échelle 1 (la bascule l'écrase, le toucher la tasse), une fois par caisse et par construction. */
function garGabarit(){
  const k=garageI+':'+carBody.children.length+':gab2';if(GAR._gab&&GAR._gab.k===k)return GAR._gab;
  const ry=carGroup.rotation.y,sx=carGroup.scale.x,sy=carGroup.scale.y,sz=carGroup.scale.z,b=GAR._gb||(GAR._gb=new THREE.Box3()),v=GAR._gv||(GAR._gv=new THREE.Vector3());
  carGroup.rotation.y=0;carGroup.scale.set(1,1,1);carGroup.updateMatrixWorld(true);b.setFromObject(carBody);
  carGroup.rotation.y=ry;carGroup.scale.set(sx,sy,sz);carGroup.updateMatrixWorld(true);
  if(b.isEmpty())return GAR._gab||{R:2.4,H:1.4};b.getSize(v);
  return GAR._gab={k:k,R:Math.max(1,.5*Math.hypot(v.x,v.z)),a:Math.max(.8,v.z*.5),b:Math.max(.5,v.x*.5),H:Math.max(.8,v.y)};
}
/* LA BOUTIQUE INDUSTRIELLE (2026-10-12, Léo — ESSAI sur la copie `boutique-industrielle`, PAS sur main : « j'aime bien l'ambiance de
   cette photo — la nudité, la sobriété ; quand on appuie sur BOUTIQUE, la voiture décolle : pas qu'elle vole, un petit coup et boum, elle
   se met à léviter ; les noms, l'argent, tout ça est remplacé — on est dans une boutique, ça doit être mieux organisé ; un effet de glitch
   fait apparaître cet endroit, en mode boutique très industriel ; une boutique HEBDOMADAIRE avec les objets qu'on voit, reliés par des
   FILS à chaque partie qu'ils modifient — une couleur rouge, une voiture ; un bouton ACHETER ; la voiture, on peut la tourner dans tous
   les sens, elle est en l'air ; rapetisse un peu la voiture du point de vue ») :
   · BOUTIQUE touchée : la caisse s'enfonce une fraction de seconde (le petit coup), BOUM (onde au sol, son de choc), elle bondit et flotte
     à ~0,95 m (ressort sous-amorti, puis houle lente) ; au boum part le GLITCH (garGlitch), à son pic l'atelier s'éteint et L'ESPACE
     BLANC s'allume (GBQ.grp, même soir — Léo : « lâche le magasin, plutôt un carré blanc futuriste, hors du temps ») : une sphère blanche,
     un sol qui s'y fond, une grille en filigrane, deux anneaux fins sous la caisse ; la lumière passe au blanc de studio (bqBio) ;
   · le haut du garage (nom, rang, argent, aura) laisse la place à l'EN-TÊTE de la boutique (#gBqTete : BOUTIQUE · CETTE SEMAINE, le compte
     à rebours jusqu'au lundi, ton argent) ; la console ne garde que ◀ RETOUR et ACHETER ;
   · LA SEMAINE (bqHebdo : tirée par bqTire sur le numéro de la semaine, lundi UTC) : trois caisses à gauche, trois habillages à droite, en
     ÉTIQUETTES ; (même soir : remplacées par L'INTERFACE v2, voir garBqPanneau) chacune était reliée par un FIL à la partie qu'elle change —
     la caisse au toit, la peinture au flanc, l'aile à l'aileron, la traînée aux pots ; touchée, on l'ESSAIE (le fil s'allume en orange) ;
   · le doigt sur la scène TOURNE la caisse dans tous les sens (lacet libre avec élan, tangage ±60° qui revient doucement) ;
   · la caisse est plus petite à l'écran (les colonnes d'étiquettes la cadrent au milieu, la caméra recule).
   RETOUR : le glitch, l'atelier revient, la caisse se repose. Banc : dbgBqIndus(). */
var GBQ={veut:false,on:false,t:9,bascule:true,k:0,kv:0,lev:0,levV:0,coupT:-1,boum:0,yaw:0,yawV:0,pit:0,pitV:0,grp:null,drag:null,cartesOn:false,ck:'',zone:null,hebdo:null,chocT:9,lay:'',pose:false,platK:1}; // (2026-10-15) pose/platK : LA POSE TENUE (voir bqPoseLache)
function bqSem(){return Math.floor((Math.floor(Date.now()/864e5)+3)/7);} // les semaines commencent le LUNDI (UTC) — le 1er janvier 1970 était un jeudi
function bqHebdoReste(){const ms=Math.max(0,((bqSem()+1)*7-3)*864e5-Date.now()),t=Math.floor(ms/1000),d=Math.floor(t/86400),d2=function(n){return (n<10?'0':'')+n;};
  return (d>0?d+(LANG==='fr'?'J ':'D '):'')+d2(Math.floor(t/3600)%24)+':'+d2(Math.floor(t/60)%60)+':'+d2(t%60);}
function bqIndusVoulu(){const m=gModeM();return !!gEl&&garageOn&&(m==='shop'||m==='tous')&&!GAR.go&&!gEl.classList.contains('menu')&&!gEl.classList.contains('missions')&&!gEl.classList.contains('quiet')&&!gEl.classList.contains('launching');}
function bqBio(){if(!bqBio._b)bqBio._b=Object.assign({},ATELIER_V0,{nm:'MAGASIN',hemiS:[.98,.99,1],hemiG:[.62,.64,.68],hemiI:1.1,sunC:[1,1,1],sunI:.62,fillC:[.82,.84,.88],fillI:.2,
  kickC:[1,.62,.3],kickI:.05,expo:1.2,sat:.92,con:1.02,daHi:0,daSh:0,daCon:.5,bloomS:.16,bloomT:.98,vigK:0,vigC:[.05,.05,.06],wb:[1,1,1],sh:[0,0,.004],hi:[0,0,0],rimK:0,rimS:.22});return bqBio._b;}
/* LE MAGASIN : bâti une fois (à la 1re visite de la boutique), dans un repère qui suit l'azimut de la caméra (+z = vers elle, l'allée file vers −z) */
/* LE CADRAGE DE LA BOUTIQUE (2026-10-13, Léo : « laisse-moi toucher, bouger le point de vue de la boutique pour bien cadrer, puis je te dirai
   de capturer le POV et l'appliquer ») : `BQ_POV` = le cadrage retenu, un par sens d'écran (couché / debout), appliqué PAR-DESSUS la vue de la
   boutique (au fondu de GBQ.k) : `a` tourne la vue autour de la caisse (rad), `h` monte la caméra (m), `d` recule (×), `ty` monte la visée (m),
   `f` ouvre l'objectif (°), `sx`/`sy` déplacent la place de la caisse à l'écran (part de la largeur / hauteur). Avec `?cadrage=1`, un panneau
   de curseurs le règle en direct (gardé dans ce navigateur) ; `dbgPov()` le relit pour le recopier ici. */
const BQ_POV={couche:null,debout:null}; /* (14/10) essayé {h −0,7, d 0,92} : « c'était mieux avant » */ /* (2026-10-14, Léo : « mieux placé sur la voiture, le plan, le point de vue ») la caméra descend et se rapproche */
const BQ_POV_DEF={a:0,h:0,d:1,ty:0,f:0,sx:0,sy:0},BQ_CADRAGE=/[?&]cadrage=1\b/.test(location.search);
function bqPovSens(){return VP.w>VP.h?'couche':'debout';}
function bqPovLu(){if(!BQ_CADRAGE)return null;if(bqPovLu._v)return bqPovLu._v;let v=null;try{v=JSON.parse(localStorage.getItem('ccCadrageBq')||'null');}catch(e){}return bqPovLu._v=(v&&typeof v==='object')?v:{};}
function bqPov(){const s=bqPovSens(),l=bqPovLu();return (l&&l[s])||BQ_POV[s]||null;}
function bqPovApplique(){const o=bqPov();if(!o||!GAR.lk)return;const w=Math.max(0,Math.min(1,GBQ.k||0));if(w<.001)return;
  const C=camera.position,T=(GBQ._pT||(GBQ._pT=new THREE.Vector3())).copy(GAR.lk);T.y+=(o.ty||0)*w;
  const a=(o.a||0)*w,ca=Math.cos(a),sa=Math.sin(a),tx=T.x*ca+T.z*sa,tz=-T.x*sa+T.z*ca;T.x=tx;T.z=tz; // la vue TOURNE autour de la caisse (au centre du plateau)
  let x=C.x*ca+C.z*sa,z=-C.x*sa+C.z*ca,y=C.y+(o.h||0)*w;const d=1+((o.d==null?1:o.d)-1)*w;
  C.set(T.x+(x-T.x)*d,T.y+(y-T.y)*d,T.z+(z-T.z)*d);camera.up.set(0,1,0);camera.lookAt(T);
  if(o.f){camera.fov=THREE.MathUtils.clamp(camera.fov+o.f*w,20,100);camera.updateProjectionMatrix();}}
function bqPovPanneau(){if(!BQ_CADRAGE||bqPovPanneau._el)return;
  const R=[['a','TOURNER',-1.6,1.6,.01],['h','HAUTEUR',-3,4,.05],['d','RECUL',.5,2,.01],['ty','VISÉE',-2,2,.05],['f','OBJECTIF',-25,25,.5],['sx','← →',-.35,.35,.005],['sy','↑ ↓',-.35,.35,.005]];
  const el=document.createElement('div');el.id='bqCadrage';
  el.innerHTML='<b class="cT">CADRAGE · <span class="cS"></span><i class="cO">▾</i></b><div class="cC">'+R.map(function(r){return '<label><span>'+r[1]+'</span><input type="range" data-k="'+r[0]+'" min="'+r[2]+'" max="'+r[3]+'" step="'+r[4]+'"><em></em></label>';}).join('')+'<button type="button" class="cZ">ZÉRO</button></div>';
  document.body.appendChild(el);bqPovPanneau._el=el;
  const st=document.createElement('style');st.textContent='#bqCadrage{position:fixed;z-index:2147483000;right:8px;top:calc(env(safe-area-inset-top,0px) + 8px);background:rgba(255,255,255,.95);color:#111;border:2px solid #111;box-shadow:0 3px 0 #111;font:8px/1.4 var(--pix);padding:5px 7px;display:none;user-select:none;-webkit-user-select:none;touch-action:none}'+
    '@media (orientation:portrait){#bqCadrage{right:auto;left:50%;top:auto;translate:-50% 0;bottom:calc(env(safe-area-inset-bottom,0px) + 96px)}}'+ /* (sur la grille de la boutique : la caisse reste à découvert) */
    '#bqCadrage.on{display:block}#bqCadrage .cT{display:flex;gap:6px;align-items:center;cursor:pointer;font-size:11px;letter-spacing:.06em}#bqCadrage .cO{margin-left:auto;font-style:normal;padding:0 4px}'+
    '#bqCadrage.ferme .cC{display:none}#bqCadrage label{display:grid;grid-template-columns:56px 112px 34px;gap:5px;align-items:center;margin-top:3px}#bqCadrage input{width:112px;margin:0;touch-action:auto}#bqCadrage em{font-style:normal;text-align:right;font-variant-numeric:tabular-nums}'+
    '#bqCadrage .cZ{margin-top:6px;font:8px var(--pix);border:1.5px solid #111;background:#fff;padding:3px 8px;cursor:pointer}';document.head.appendChild(st);
  ['pointerdown','pointermove','pointerup','touchstart','touchmove','wheel','click'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation();},{passive:true});});
  const lit=function(){const s=bqPovSens(),l=bqPovLu();return Object.assign({},BQ_POV_DEF,BQ_POV[s]||{},l[s]||{});};
  const garde=function(o){const l=bqPovLu();l[bqPovSens()]=o;try{localStorage.setItem('ccCadrageBq',JSON.stringify(l));}catch(e){}};
  const rend=function(){const o=lit();el.querySelector('.cS').textContent=bqPovSens()==='couche'?'COUCHÉ':'DEBOUT';
    el.querySelectorAll('input').forEach(function(i){const k=i.getAttribute('data-k');if(document.activeElement!==i)i.value=o[k];i.nextElementSibling.textContent=(+o[k]).toFixed(k==='f'?1:2);});};
  el.addEventListener('input',function(e){const i=e.target;if(!i||!i.getAttribute)return;const o=lit();o[i.getAttribute('data-k')]=+i.value;garde(o);rend();});
  el.querySelector('.cT').addEventListener('click',function(){el.classList.toggle('ferme');el.querySelector('.cO').textContent=el.classList.contains('ferme')?'▸':'▾';});
  el.querySelector('.cZ').addEventListener('click',function(){garde(Object.assign({},BQ_POV_DEF));rend();});
  rend();let s0=bqPovSens();setInterval(function(){const on=!!(GBQ.on&&garageOn);el.classList.toggle('on',on);if(on||bqPovSens()!==s0){s0=bqPovSens();rend();}},250);}
if(BQ_CADRAGE){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bqPovPanneau);else setTimeout(bqPovPanneau,0);}
