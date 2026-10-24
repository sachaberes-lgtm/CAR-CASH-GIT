/* ===== LE RAMASSAGE — pickupsTick, AU SOL ET EN VOL (2026-09-30) =====
   ⚠ BUG DE STRUCTURE : cette boucle vivait DANS la branche `if(mode==='drive'){…}` de `loop`. Sa garde (`mode==='drive'||mode==='fall'`)
   et tout son code de vol (couloir `lastNearS`, face du vol, AIMANT v3 « au sol comme en vol ») ne tournaient donc qu'à l'image EXACTE du
   décollage : en vol, RIEN ne se ramassait — ni l'or frôlé en DAUPHIN, ni un cristal traversé, ni l'aimant. Le correctif du 2026-08-18
   (plus bas) n'a jamais marché : vérifié au 1er commit du dossier (6541278), la boucle y était déjà dans la branche du sol. Elle est
   appelée des DEUX branches : au sol au même endroit (mêmes effets, même ordre), en vol juste après la pose de la caisse
   (`carGroup.position=fallPos`) et AVANT les figures, qui remettent `curNear` à zéro — le radar de dalle de tryLand (image d'avant),
   comme `lastNearS`.
   EN VOL, CE QUI EST ATTIRÉ ARRIVE — L'ACCROCHE (`p.hk` = secondes d'accroche, `p.hkD` = écart garanti). Au sol, une pièce tirée puis
   lâchée reste sur le bitume, ça ne se voit pas ; en vol la même loi aurait laissé, après chaque dauphin, des pièces SUSPENDUES entre
   la route et la trajectoire. Une pièce, un fruit, un cristal qui entre EN VOL dans la sphère d'attraction s'accroche : il file droit
   sur la caisse et l'écart fond d'au moins (1−f) par image quoi que fasse la caisse (f = dt·(RAM_K + RAM_A·accroche)). SIMULÉ (banc
   node ram-sim.js) : ≤ 0,13 s depuis 11 m, ≤ 0,25 s depuis les 50 m de l'aimant, de 144 à 1 900 km/h, sans jamais toucher le filet
   (posé sur la caisse à RAM_T s) ; une pièce DEVANT ne s'enfuit jamais vers l'avant, elle attend la caisse. Ça ferme aussi le TUNNEL :
   à 1 500 km/h la caisse fait 8 m par image, la fenêtre de 3,8 m tombait entre deux images — l'accroche à 11 m ne se rate pas.
   Accrochée, elle finit sa course même si l'on se pose ; un SAUT de caisse (> 150 m d'un appel à l'autre : replacement, portail) la décroche.
   Rien n'est alloué : deux nombres par objet, un vecteur (RAM.p0).
   LE DOSAGE — 11 m (14 avec la capacité moteur), GARDÉ après mesure contre le sol (banc node ram-banc.js : même route, pièces sur toute
   la largeur) : au sol dans l'axe à 500 km/h la caisse prend 28 % des pièces ; en dauphin à 4 m, 41 % ; à 8 m, 32 % ; à 12 m (le haut
   de la bande), 9 %. Voler BAS rapporte un peu plus que rouler — la prime du risque, à 4 m on est à une image de se poser — et voler
   haut, bien moins : le rouleur n'est pas lésé, le dauphin a enfin sa récolte. ⚠ À 1 900 km/h le SOL tombe à 18 % (sa fenêtre de 3,8 m
   tombe entre deux images, 8,8 m par image — pas touché ici : au sol rien ne change) ; le vol, accroché, reste à 40 %.
   LE JUMEAU : en longeant la tranche, la face du vol bascule d'une image à l'autre ; avec l'accroche, les deux copies d'une pièce
   pouvaient s'accrocher tour à tour et payer DEUX fois (ce que la passe qualité interdit, voir plus bas). Les jumeaux sont posés côte à
   côte dans `pickups` (face +1 puis −1 : `place`, cristaux, `ligneFruit`) → `pickups[i+face]` : EN VOL, un objet dont le jumeau est
   pris ou accroché est ignoré. AU SOL, RIEN NE CHANGE.
   Banc : `dbgRamasse()` (pris au sol / en vol, accrochés, filet), `dbgRamasse('raz')`. */
function ramD(P,Q,ax,R){ // (2026-10-14, chasse aux bugs) la distance caisse ↔ objet sur le TRAJET de l'image : Q (l'objet AVANT l'attraction de l'image) au segment RAM.pA → la caisse,
  // et P (après) à la caisse comme avant — la plus petite, comparée ensuite au MÊME rayon R. Un point si le trajet n'est pas balayé (RAM.bal).
  const B=carGroup.position,d0=P.distanceTo(B);if(!RAM.bal)return d0;
  const A=RAM.pA,dx=B.x-A.x,dy=B.y-A.y,dz=B.z-A.z,l2=dx*dx+dy*dy+dz*dz;
  if(ax){const hv=(Q.x-B.x)*ax.x+(Q.y-B.y)*ax.y+(Q.z-B.z)*ax.z,c=R*R-hv*hv;if(c>0&&l2<=4*c)return d0;} // le pas tient dans la corde d'un objet PILE dans l'axe (à sa hauteur) : le test en un point ne pouvait pas le sauter — rien ne change (60/120 i/s identiques)
  let t=((Q.x-A.x)*dx+(Q.y-A.y)*dy+(Q.z-A.z)*dz)/l2;t=t<0?0:t>1?1:t;
  const x=A.x+dx*t-Q.x,y=A.y+dy*t-Q.y,z=A.z+dz*t-Q.z;return Math.min(d0,Math.sqrt(x*x+y*y+z*z));}
const RAM_K=5.5,RAM_A=30,RAM_T=.5; // l'accroche : tirage de base (/s), sa montée par seconde d'accroche, le filet (s)
/* LA FACE DU VOL (2026-10-20, Sacha : « la voiture dans les airs, quand on passe près de la route, le jeu n'arrive pas à savoir où est le
   dessus et le dessous » — il y a toujours une sorte d'aimant bizarre avec la route tordue du niveau NUAGES). MESURÉ au banc (dbgPose + dbgStep) :
   la face se lisait au seul SIGNE de la hauteur au point de piste le plus proche (`curHOff < −THICK/2`), sans regarder où l'on est : une caisse
   qui passe à 45 m du bord (demi-route 28) et descend sous le plan de la dalle passait « SOUS la route » à −1,8 m et y restait à −120 m. Chaque
   passage du plan (une pente, un virage relevé, un saut qui longe la route) retournait la face, et l'aimant / l'accroche prenait les pièces
   du JUMEAU de l'autre face — à travers le bitume. Désormais UNE face par vol, avec mémoire : elle part de la face du décollage et ne change
   que si la caisse est vraiment AU-DESSUS ou EN DESSOUS de la dalle (dans sa largeur + VOLF.m), et d'au moins VOLF.h de l'autre côté du plan
   qu'elle quitte (hystérésis : plus d'aller-retour sur la tranche). Loin sur le côté : on garde la face d'avant. Même notion que `fallUnder`. */
const VOLF={m:6,h:.8};
function volFaceTick(){
  if(RAM.fv===0)RAM.fv=fallStartSide<0?-1:1;
  if(curNear&&Math.abs(curLatOff)<ROAD_HALF+VOLF.m){
    if(RAM.fv>0&&curHOff<-THICK-VOLF.h)RAM.fv=-1;
    else if(RAM.fv<0&&curHOff>VOLF.h)RAM.fv=1;
  }
  return RAM.fv;
}
function pickupsTick(dt){
  ninfTick(dt);fauraGlobalTick(dt);dragonDecor(dt);zapTick(dt);raisinTick(dt); // (2026-10-20) le temps PARTAGÉ des auras des fruits-pouvoirs : une écriture par image pour tous les fruits de la route
  const enVol=(mode==='fall');
  // (LIGNE PARFAITE) le fruit de la file se teste aussi sur le TRAJET de l'image — (2026-09-30) le trajet AU SOL seulement : en vol `s`
  // ne décrit plus la caisse ; le balayage repart de zéro au décollage (startFall) et reprend à la pose
  const sA9=LIGNE.sPk==null?s:LIGNE.sPk;if(!enVol)LIGNE.sPk=s;
  if(!enVol&&mode!=='drive')return;
  const sg9=RAM.ok?RAM.p0.distanceTo(carGroup.position):0,saut9=sg9>150;(RAM.pA||(RAM.q=new THREE.Vector3(),RAM.pA=new THREE.Vector3())).copy(RAM.p0);RAM.p0.copy(carGroup.position);RAM.ok=true; // > 150 m d'un appel à l'autre : la caisse a SAUTÉ (replacement, portail) — le plus grand pas légitime, 2 images à 0,05 s et 2 500 km/h, fait ~70 m
  /* (2026-10-14, chasse aux bugs, cadence 30 i/s) LE RAMASSAGE BALAYÉ — comme traficTick/satHard : tout se testait en UN point par image ; à 30 i/s (dt jusqu'à 0,05)
     la caisse fait 10-28 m par image, la portée de 3,8 m tombait entre deux images (au sol l'ancien code ratait dès ~1 080 km/h à 30 i/s, ~720 à 20 i/s ; preuve :
     banc/preuve-ramasse.cjs). On teste la distance de l'objet (avant l'attraction de l'image) au SEGMENT parcouru (ramD), même rayon, et seulement quand le pas dépasse la corde d'un objet dans l'axe (60/120 i/s inchangés). Seulement si ce segment est un trajet LÉGITIME : pas plus de 2 pas
     d'image à la vitesse du moment (+2 m) — un replacement (vA 26), un portail, un saut de 150 m retombent sur le test en un point, rien ne se ramasse en route. */
  RAM.bal=sg9>1e-6&&sg9<=(enVol?fallVel.length()*AIR_RATE:Math.abs(vA)*vitMult())*SPD*Math.max(dt,.05)*2+2;
  /* ⚠ BUG CORRIGÉ (2026-08-18) — ON NE POUVAIT PAS ATTRAPER LES FRUITS EN L'AIR, et c'était
     une CONTRADICTION DANS LE CODE, pas un réglage : le tour de boucle entier était gardé par
     `mode==='drive'`, et une ligne plus bas les grappes du ciel exigeaient `mode==='fall'`.
     Les deux conditions ne pouvaient jamais être vraies ensemble — les pickups aériens étaient
     donc INRAMASSABLES depuis toujours, silencieusement.
     La boucle tourne maintenant AUSSI en vol (⚠ faux jusqu'au 2026-09-30, voir en tête) :
       · AU SOL, la caisse est SUR le ruban : `s`, `lat` et `side` la décrivent, on s'en sert
         pour ne pas aspirer toute la route.
       · EN VOL, elle n'y est plus : ces trois valeurs ne veulent plus rien dire. Seule la
         distance 3D a du sens, et on pré-filtre sur `lastNearS` (où l'on en est le long de la
         piste pendant le vol) pour ne pas tester 550 objets par frame. */
  const MAG9=pwrMagT>0; // (pouvoirs v2) L'AIMANT : tout l'or et les fruits de la route viennent à toi (les cristaux restent à viser)
  /* L'AIMANT v3 — UNE SPHÈRE DE MAG_R MÈTRES (2026-09-29, Sacha : « l'aimant doit aimanter toutes les pièces, augmente grandement son
     rayon, genre 50 mètres »). La v2 ne prenait que ce qui était DEVANT (55 m, jamais derrière), laissait l'or du CIEL au sol, et en
     vol s'arrêtait à 34 m ; loin, elle tirait mollement (3/s). Désormais : tout ce qui est à moins de MAG_R m de la caisse, devant,
     derrière, sur les côtés, au-dessus — sur TA face de la route (l'autre face est le miroir de celle-ci, la prendre paierait deux
     fois). La traction est une loi FORTE (5 + 25·(1−d/R)² par seconde) : une pièce dépassée, à 4 m derrière une caisse à 200 km/h,
     doit encore la RATTRAPER — à 13/s elle s'arrêtait à 4,3 m, juste hors de portée du ramassage (3,8 m). */
  /* (2026-09-29, passe qualité) EN VOL, UNE SEULE FACE : chaque pièce, chaque fruit a son JUMEAU sous la dalle (miroir des deux faces). Au sol
     `side` départage ; en vol rien ne le faisait — sous AIMANT (sphère de 50 m) les deux copies étaient aspirées, l'une À TRAVERS le bitume,
     et les deux encaissées : argent, pièces moteur, séries et nitro des fruits comptés DEUX fois. La face du vol = le côté de la dalle où
     l'on vole (radar de tryLand : sous la dalle → −1, sinon +1). Les grappes du CIEL (`p.air`) n'ont pas de jumeau. (2026-09-30) Sans radar (1re image du vol) : la face du DÉCOLLAGE, plus +1 d'office. */
  const fV9=enVol?volFaceTick():(RAM.fv=0,side);RAM.face=fV9; // (2026-10-20) la face du vol : voir VOLF
  for(let i9=0;i9<pickups.length;i9++){
    const p=pickups[i9];
    if(p.taken)continue;
    const mag=engTier>=ENG_CAP.aimant?1:0,gros9=MAG9&&!p.pow&&!p.nitro; /* (2026-10-20, Léo : « l'aimant attire les PIÈCES seulement ») la pomme dorée n'attire plus les fruits */ // (2026-10-14, chasse aux bugs) RAM.q = l'objet AVANT l'attraction de l'image (ramD) — (OPTIMISATION) copié dans chaque branche APRÈS ses filtres bon marché : ~9 000 copies de moins par image en fin de partie, même valeur là où elle est lue
    if(p.hk>0){RAM.q.copy(p.mesh.position);if(saut9){p.hk=0;continue;}} // un saut de caisse DÉCROCHE : rien ne traverse la carte pour payer
    else if(enVol){ // EN VOL : le couloir, TA face, pas de jumeau — puis la sphère ACCROCHE
      if(Math.abs(p.s-lastNearS)>(gros9?MAG_R+40:70))continue; // pré-filtre bon marché le long de la piste, AVANT toute distance 3D
      if(p.face!==fV9&&!p.air)continue;                         // (passe qualité) pas le jumeau de l'autre face…
      if(!p.air){const tw=pickups[i9+p.face];if(tw&&tw.face===-p.face&&tw.s===p.s&&tw.lat===p.lat&&(tw.taken||tw.hk>0))continue;} // …ni celui dont le jumeau est pris ou en route (voir LE JUMEAU)
      // EN VOL L'AIMANT EST PLUS LARGE : viser une grappe en pleine parabole, sans volant, est déjà difficile — sans coup de pouce on
      // ne les attrape jamais. (v3) sous L'AIMANT, la sphère de MAG_R m.
      RAM.q.copy(p.mesh.position);const d9=p.mesh.position.distanceTo(carGroup.position);
      if(ramD(p.mesh.position,RAM.q,p.ax,gros9?MAG_R:11+mag*3)>=(gros9?MAG_R:11+mag*3))continue; // (2026-10-14, chasse aux bugs) le TRAJET de l'image (ramD), même rayon ; hkD reste l'écart réel
      p.hk=1e-4;p.hkD=d9;RAM.n[6]++; // ACCROCHÉ
    }else if(gros9){ // (v3) L'AIMANT AU SOL : la sphère
      if(Math.abs(p.s-s)>MAG_R+8)continue; // pré-filtre bon marché le long de la piste
      if(p.face!==fV9&&!p.air)continue; // (passe qualité) TA face seulement
      RAM.q.copy(p.mesh.position);const d9=p.mesh.position.distanceTo(carGroup.position);
      if(d9<MAG_R){const q9=1-d9/MAG_R;p.mesh.position.lerp(carGroup.position,Math.min(1,dt*(5+25*q9*q9)));magSpirale(p,d9,dt);}
    }else{
      if(p.face!==side)continue;
      const ds9=Math.abs(p.s-s);
      if(ds9>22+(RAM.bal?Math.abs(s-sA9)+sg9:0))continue; // (2026-10-14, chasse aux bugs) + le trajet balayé : sans lui, à 30 i/s et grande vitesse, la pièce sortait du couloir avant d'être testée
      if(p.air)continue;                        // les grappes du CIEL ne s'attrapent qu'en vol
      RAM.q.copy(p.mesh.position);
      // CAPACITÉ MOTEUR (V12 atmosphérique) : L'AIMANT À PIÈCES — elles viennent à toi de bien plus
      // loin, et plus vite. Sans lui, on garde l'attraction d'origine, discrète.
      if(ds9<15+mag*2&&Math.abs(p.lat-side*lat)<9+mag*2) // (2026-09-26) plus de `level` ici : c'est l'index de la caisse (66), l'aimant faisait 33 m sur les dernières // portée LATÉRALE de l'aimant à pièces (route large)
        p.mesh.position.lerp(carGroup.position,Math.min(1,dt*(6+mag*1.5)));
    }
    if(p.hk>0){ // ACCROCHÉ : il file sur la caisse — l'écart fond d'au moins (1−f) par image, quoi que fasse la caisse
      const f9=Math.min(1,dt*(RAM_K+RAM_A*p.hk)),P9=p.mesh.position;p.hk+=dt;
      P9.lerp(carGroup.position,f9);if(MAG9&&!p.nitro&&!p.pow)magSpirale(p,P9.distanceTo(carGroup.position),dt); // (pomme dorée) la pièce accrochée en vol tourne aussi
      const d9=P9.distanceTo(carGroup.position),dM=p.hkD*(1-f9);
      if(d9>dM&&d9>1e-6)P9.lerp(carGroup.position,1-dM/d9); // la caisse le distance : il est tiré sur la ligne qui les relie
      p.hkD=Math.min(d9,dM);
      if(p.hk>RAM_T){P9.copy(carGroup.position);RAM.n[7]++;} // le filet (jamais atteint en simulation)
    }
    if(ramD(p.mesh.position,RAM.q,p.ax,3.8+mag*.5)<3.8+mag*.5||(p.ligne&&mode==='drive'&&p.face===side&&Math.abs(p.lat-side*lat)<4.5&&Math.abs(s-sA9)<60&&(p.s-sA9)*(p.s-s)<=0)){ // (2026-09-26) portée FIXE (les objets ont grossi)
      const vol9=enVol||p.hk>0;p.taken=true;p.hk=0;scene.remove(p.mesh); // (une pièce instanciée sort d'elle-même du couloir au prochain LOD)
      RAM.n[(vol9?3:0)+(p.pow?2:p.nitro?1:0)]++; // (banc) pris au sol ou EN VOL — accroché en vol et arrivé après la pose, il compte en vol
      if(p.spin)spinPrend(p); /* (2026-10-14) LE FINAL SPIN : le jeton entre dans la sauvegarde */
      else if(p.pow){ // POUVOIR : le minuteur démarre (ou se CUMULE), l'écran l'annonce en couleur — (pouvoirs v2) tout vit dans pwrPrend
        pwrPrend(p.pow,p.mesh.position);
      }
      else if(p.nitro){ // chaque fruit rend SA dose de nitro (réglable dans l'ÉTAL)
        const fd=FRUIT_DEFS[p.fruit]||FRUIT_DEFS[0],pw=Math.min(1,fd.boost/2);
        // (2026-09-26, user : « les fruits donnent du nitro BLEU ») : chaque fruit remplit la RÉSERVE BLEUE (la nitro la plus forte : poussée
        // 48 contre 30) de 20 % de la jauge — le bleu se voit sur la barre et sur l'anneau du bouton
        {const mx9=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2,av9=nitroX;nitroX=Math.min(2,nitroX+(p.ligne?(p.don||LIGNE.don):.2*mx9)); /* (2026-10-21, Sacha : « l'ancien système ») comme avant : le fruit remplit la RÉSERVE BLEUE */if(LIVRE.on){livre('n+:'+(p.ligne?'fruit.ligne':'fruit'),nitroX-av9);livre('n0:'+(p.ligne?'fruit.ligne':'fruit'),(p.ligne?LIGNE.don:.2*mx9)-(nitroX-av9));}if(p.ligne)LIGNE.pris[0]++; // (LIGNE PARFAITE) le fruit de la file rend de quoi tenir jusqu'au pad
         if(nitroX>av9+.01){if(SONV2)sfx('nitro.plein',{t:.14});nbPrend('x');}} /* (2026-10-21, Léo : « on voit directement la barre monter ») le fruit ne vole plus vers la barre : elle monte tout de suite */
        RUNX.fruits++;try{m2Fruit(fd.n);}catch(e){}hap(fd.boost>=1.5?[20,40,30]:11);
        if(SENS&&!REDUCED_MOTION)try{sensCoup(0,-(.45+.6*pw),-(.3+.35*pw));}catch(e){} // (2026-10-14, sensations · passages) LE COUP DE REINS du plein : le fruit rend sa nitro, la caisse S'ASSOIT d'un coup sur son train arrière (nez levé ≈ 1,2° la myrtille → 2,7° la pastèque, ≈ 1 à 2,5 cm) puis se repose — le jus, le croc et la main existaient, la tôle ne bronchait pas. Au sol seulement (sensCoup dort en vol).
        fruitCroque(carGroup.position,fd.jus||0xffd75e,pw,fd.n,!!p.ligne&&PADS_OFF); // ON CROQUE : jus, crunch, et la rafale qui monte
        // (le fruit ne touche PAS au moteur : il ne sert qu'au boost — ce sont les pièces qui l'améliorent)
        if(fd.boost>=1.5){ // LE GRAAL : la pastèque, ça se fête
          trickMsg('🍉 '+fd.n+' !',2);sparkBurst(sparkGold,carGroup.position,18,14);shake=Math.max(shake,.3);
        }else sparkBurst(fd.boost>=.8?sparkGold:sparkBlue,carGroup.position,fd.boost>=.8?8:5,7);
      }
      else{
        sparkBurst(sparkGold,p.mesh.position,FLOW.lv===4?14:8,FLOW.lv===4?11:8); // (2026-09-28) là où la pièce disparaît · (×3) en FRÉNÉSIE la gerbe grossit : la pièce vaut trois fois plus
        combo++;comboT=3;
        /* LA RÉCOLTE EN SÉRIE. Une pièce isolée ne donne RIEN en aura — sinon on récompense
           encore le simple fait d'avancer. C'est tous les 5 ramassages SANS laisser retomber le
           combo (fenêtre de 3 s) que la salve tombe, et elle grossit à chaque palier. */
        if(combo%5===0)chaineAura('RÉCOLTE ×'+combo,20,'recolte',true,SONV2,true); /* (console) muet : blip() joue piece.recolte */
        // ÉCONOMIE RÉGULÉE (2026-07-30) : on montait de caisse BEAUCOUP trop vite. La pièce vaut
        // ~2,3× moins et le combo se mérite (un palier toutes les 5 pièces, plafond ×4 au lieu de ×5)
        // → rendement max 8,8×denom contre 25×denom avant. La CHAÎNE DE FIGURES reste la vraie fortune.
        // LE MOTEUR MONTE À LA PIÈCE : c'est la ferraille ramassée qui paye le turbo
        addCoins(1);RUNX.coins++;flowAdd(.7,'route');if(p.grp)coinSerie(p);try{piece1Plus();}catch(e){} /* (2026-10-14) le « +1 » à côté de la caisse */
        /* (2026-10-14, sensations · passages) LA RÉCOLTE SE SENT. La 5e, la 10e, la 15e — celles où la salve d'aura tombe et où
           `piece.recolte` sonne — soulèvent la caisse d'un rien (≈ 1 → 2 cm : elle s'allège).
           (2026-10-15, Sacha : « enlève les vibrations à chaque fois qu'on ramasse des pièces ») LA PIÈCE NE VIBRE PLUS : ni le tic de
           chaque pièce, ni le tic net de la récolte. Le son et le soulèvement restent ; le téléphone ne vibre que pour ce qui compte. */
        if(SENS&&combo%5===0&&!REDUCED_MOTION)try{sensCoup(0,0,.15+.07*Math.min(4,combo/5));}catch(e){}
        const mult=Math.min(ECO3.recolte,1+.5*Math.floor(combo/5)); // (vague 3) ×1 · ×1,5 · ×2 · ×2,5 : sur une route dense la récolte ne retombait jamais — ×4 permanent
        const g=denom()*2.2*mult*(fever>0?2:1)*flowMult(); // × le FLOW
        money+=g;levelCash+=g;livre('$:piece',g);blip();addStyle(5);frenCash(g,p.mesh.position); // (×3) en frénésie : le « ×3 » jaillit de la pièce, la bande frappe
        checkUpgrade();
      }
    }
  }
}
