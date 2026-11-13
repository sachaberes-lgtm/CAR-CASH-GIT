/* ===== POUVOIRS v2 — LE MOTEUR (2026-09-28) ===== voir la fiche PWR_DEFS. Un seul endroit lit et écrit les cinq minuteurs
   (`pwrT`/`pwrSet`) : la plaque du HUD, les bords d'écran, le ramassage et le tirage passent par ici. */
const PWR_ORDRE=['n','a','v','m','x']; // l'ordre des plaques dans le HUD (toujours le même : l'œil apprend où regarder)
function pwrT(k){return k==='n'?pwrNitroT:k==='a'?pwrAirT:k==='v'?pwrSpdT:k==='m'?pwrMagT:k==='x'?pwrAurT:0;}
function pwrSet(k,v){if(k==='n')pwrNitroT=v;else if(k==='a')pwrAirT=v;else if(k==='v')pwrSpdT=v;else if(k==='m')pwrMagT=v;else if(k==='x')pwrAurT=v;}
function pwrVu(k){return pwrT(k)>0&&!(k==='a'&&TUTO.on);} // (l'airtime PRÊTÉ par l'auto-école n'est pas un pouvoir ramassé)
/* (2026-09-30) AIR MAX promet « 14 S DE VOL » mais fondait au sol comme en l'air : pris sur une ligne droite, il en restait 5 s au premier
   saut. Au sol il s'use au QUART (il attend le décollage), en vol à plein. L'airtime prêté par l'auto-école garde son temps réel. */
function pwrAirK(){return mode==='fall'||TUTO.pa?1:.25;}
const PWR_V2={bt:null}; // (le tic-tac de fin, une fois par pouvoir)
function pwrV2Raz(){PWR_V2.bt=null;}
/* LE TIRAGE (spawnPickups) : UN seul tirage `r` du flux seedé choisit le pouvoir — autant d'appels que l'ancien `kinds[⌊r·3⌋]`, la
   suite de la génération ne bouge pas. Les poids suivent l'expérience du joueur (`SAVE.d.ex.runs`) : le débutant tombe surtout sur ce
   qui le fait jouer tout de suite (AIMANT, AIR MAX) ; le vétéran sur ce qui fait monter le score (AURA ×2, VITESSE). ⚠ En CAMPAGNE (pistes
   identiques à chaque essai) les poids restent FIXES : la même graine donne les mêmes cristaux, quel que soit le joueur. */
/* (2026-10-18, Sacha : « met pas de power up vitesse x2 dans le canyon ») LE CANYON SANS VITESSE ×2 : entre des parois qui ne pardonnent
   pas, le ×2 n'était qu'un ticket pour le mur. Sa part du tirage est rendue aux quatre autres AU PRORATA (somme 1) — toujours UN seul
   `rnd()` par cristal : la génération en aval ne bouge pas, seul le cristal change de nature. Le parc freestyle n'est pas le canyon. */
function pwrPoids(){const W=pwrPoids0();if(LVL.cur&&LVL.cur.id==='canyon'&&!PARK.on&&W.v>0){const k9=1/(1-W.v);W.v=0;for(const q in W)W[q]*=k9;}return W;}
function pwrPoids0(){
  const runs=(SAVE.d.ex&&SAVE.d.ex.runs)|0;
  if(PWR_EGAUX)return {n:.2,a:.2,v:.2,m:.2,x:.2}; // (2026-10-20, Léo : « tous les spéciaux apparaissent à la même fréquence ») les cinq fruits-pouvoirs à ÉGALITÉ
  if(runs<8)return {n:.2,a:.22,v:.12,m:.3,x:.16}; // (29/09) les parts du BOUCLIER retiré sont rendues aux autres
  if(runs<30)return {n:.21,a:.19,v:.18,m:.21,x:.21};
  return {n:.21,a:.17,v:.16,m:.19,x:.27}; // (2026-09-30) VITESSE .22 → .16 : chez un vétéran NITROOO passe vite +30 %, et le plafond commun vitMult (×2,6) avale alors le ×2 — ses parts vont à l'AURA ×2 et à l'AIMANT (somme 1, un seul tirage)
}
function pwrTire(r,W){let acc=0;for(const k of PWR_ORDRE){acc+=W[k];if(r<acc)return k;}return 'n';}
// le tout PREMIER cristal de la partie, pour qui débute (moins de 5 parties, hors campagne) : un AIMANT près de l'axe — le 1er pouvoir se prend sans le chercher et l'or vient tout seul (un BOUCLIER jusqu'au 29/09)
function pwrPremier(){return !TUTO.on&&!PARK.on&&(runStats.zones|0)===(LVL.tutoZ|0)&&((SAVE.d.ex&&SAVE.d.ex.runs)|0)<5;} // (2026-09-29) après le permis, la 1re VRAIE zone (celle d'après la piste de l'école) a son cristal offert
/* LE RAMASSAGE — tout ce qui se passe quand la caisse éclate un cristal. `pos` = où il éclate. */
function pwrPrend(k,pos){
  const d=PWR_DEFS[k];if(!d)return;
  const t0=pwrT(k),reprise=t0>0;
  let autres=0;for(const q of PWR_ORDRE)if(q!==k&&pwrVu(q))autres++;
  pwrSet(k,Math.min(d.t*2,t0+d.t)); // LE MÊME POUVOIR SE CUMULE : il ajoute sa durée, plafond 2 × t
  if(k==='a')airFlash=.6;
  /* (2026-09-29, Sacha : « pas de texte quand on ramasse un pouvoir, juste le nom du pouvoir, mais plus petit ») : plus de sous-titre
     (« L'OR VIENT À TOI »…), plus de « +6 S » ni de « DOUBLE POUVOIR ! » — le NOM, de sa couleur, 40 → 26 */
  const cal9=HUD_CALME.on; /* (2026-11-13, Sacha : « en HUD calme… pareil pour les pouvoirs et tout ») au HUD calme le pouvoir s'arme en silence et sans rien montrer : ni nom, ni éclat d'écran, ni secousse, ni gerbe (le son est coupé au bus, sonCalme) */
  if(!reprise&&!cal9){showMsg(d.msg,d.tint);trickMsg((d.ico?d.ico+' ':'')+TR(d.hud),2);} // (#msg et #trickBox : desktop seulement)
  /* (2026-10-15, Sacha : « trop d'info affichée ») plus de NOM au centre non plus : la plaque du pouvoir, à droite, le dit (voir <style id="hudAllege">) */
  if(!SONV2)boostSnd();pwrPrisSnd(k); // (console) chaque pouvoir a sa signature entière : plus le souffle d'un pad dessous
 if(!cal9){shake=Math.max(shake,.35);flashEcran(d.fx);}hap([14,40,24]);
  if(!cal9)sparkBurst(d.sp==='bleu'?sparkBlue:d.sp==='rose'?sparkPink:sparkGold,pos,14,9); // là où le cristal éclate
  addStyle(10);RUNX.pwr=(RUNX.pwr|0)+1;try{m2Pu(k);}catch(e){}
  if(autres>=1){ // DEUX POUVOIRS À LA FOIS : la chasse aux cristaux paie
    const tri=autres>=2;
    chaineAuraMuette(tri?'TRIPLE POUVOIR':'DOUBLE POUVOIR',tri?150:70,'pwrCombo',true,SONV2); // (2026-09-29, Sacha) l'aura compte, rien ne s'écrit
    try{if(SONV2)sfx(tri?'pwr.triple':'pwr.double');else{chimeNote(noteP(4,1),.2,.06,.3);chimeNote(noteP(7,1),.28,.06,.34);if(tri)chimeNote(noteP(11,1),.36,.07,.45);}}catch(e){} // la session SON sonorise ; sinon le carillon de repli
    hap(tri?[20,30,20,30,40]:[16,30,24]);
  }
}
/* LES MINUTEURS DES NOUVEAUX POUVOIRS (boucle, à côté de ceux d'origine) — la fin se dit à l'oreille (pwrFinSnd). */
const PWR_MX=['m','x']; // (2026-10-14, passe perf mobile) la liste des deux minuteurs, bâtie UNE fois (un tableau neuf par image avant)
function pwrTick(dt){
  if(SONV2){const B9=PWR_V2.bt||(PWR_V2.bt={});for(const k of PWR_ORDRE){const t9=pwrT(k);if(t9>0&&t9<1.5){if(!B9[k]&&pwrVu(k)){B9[k]=1;sfx('pwr.bientot');}}else B9[k]=0;}} // (console de son) le tic-tac de fin de pouvoir, une fois
  for(const k of PWR_MX){const t0=pwrT(k);if(t0>0){const t1=Math.max(0,t0-dt);pwrSet(k,t1);if(t1<=0)pwrFinSnd(k);}}
}
/* ===== LES PETITS TRUCS GRISANTS (2026-09-28, Sacha : « pousse un max de petites modifs en game designer senior pour augmenter le
   fun, l'adrénaline et surtout l'accessibilité ») — trois moments qui n'existaient pas, chacun branché sur ce qui est déjà là :
   · MIRACULÉ — la chute était PERDUE D'AVANCE (sous la route, en train de tomber, aucune réception en vue depuis `MIR.min` s) et
     pourtant on se pose : au nitro, ou sur la dalle d'en dessous. Le plus grand frisson du jeu n'était pas récompensé.
   · SANS FAUTE — les poses propres d'affilée (ni lourde, ni ratée, ni chute) : ×3, ×5, ×8, ×12, puis toutes les 5. La régularité
     devient un score à part — le débutant la vise, le vétéran la tient.
   · LES PALIERS DE VITESSE — chaque centaine de km/h franchie pour la 1re fois de la partie se crie (« 400 KM/H ! »), et le
     RECORD de vitesse de toute ta vie aussi. Sur téléphone l'écran est NU (pas de compteur) : c'était la seule vitesse qu'on ne
     SENTAIT pas en chiffres. */
const MIR={t:0,max:0,min:.6};            // t = secondes « perdu d'avance » (lissé), max = le pire du vol
function mirTick(dt){ // dans la branche 'fall', après le viseur (LM.vu vient d'être posé)
  const perdu=!LM.vu&&fallT>.4&&(VOLR.on?(volVu(fallVel)<-4&&tryLand._bi>=0&&VOLR.c.subVectors(fallPos,pts[tryLand._bi]).dot(VOLR_FIGE?VOLR.b.copy(Nn[tryLand._bi]).multiplyScalar(Nn[tryLand._bi].dot(VOLR.u)<0?-1:1):VOLR.u)<-10):(fallVel.y<-4&&fallPos.y<lastNearY-10)); // (LE VOL QUI SUIT LA ROUTE) sur la route sans haut ni bas : 10 m sous la dalle survolée, en tombant vers son dessous
  MIR.t=perdu?MIR.t+dt:Math.max(0,MIR.t-dt*2);if(MIR.t>MIR.max)MIR.max=MIR.t;
}
function mirPose(){ // la pose a réussi (tryLand vrai)
  const m=MIR.max;MIR.t=0;MIR.max=0;
  if(m<MIR.min||PARK.on||TUTO.on)return;
  RUNX.miracles=(RUNX.miracles|0)+1;
  chaineAura('MIRACULE',m>1.5?240:160,'miracle',false,true);
  flowAdd(10,'risque','p'); // se rattraper au nitro : PSYCHO
  setTimeout(function(){try{if(running&&!gameOver)popTexte(sansAcc(TR('MIRACULE !')),'#7dffec',3);}catch(e){}},420); // après le verdict de la pose (sa priorité le laisse passer)
  flashEcran('rgba(125,255,236,.7)');hap([18,30,18,30,50]);shake=Math.max(shake,.45);
  sparkBurst(sparkBlue,carGroup.position,22,14);sparkBurst(sparkGold,carGroup.position,12,10);
  try{if(SONV2)sfx('jeu.miracule');else{chimeNote(noteP(0,1),.05,.07,.3);chimeNote(noteP(4,1),.12,.07,.34);chimeNote(noteP(7,1),.19,.07,.38);chimeNote(noteP(12,1),.26,.09,.55);}}catch(e){}
}
const SFA={n:0};                          // SANS FAUTE : poses propres d'affilée
function sfaPose(propre){ // appelé au verdict d'une VRAIE pose (fallT > .7)
  SFA.dern=propre; // (banc) la dernière pose jugée
  if(PARK.on||TUTO.on)return;
  if(!propre){if(SFA.n>=3)popTexte(sansAcc(TR('SERIE CASSEE')),'#ff5e7a',1);SFA.n=0;return;}
  SFA.n++;const n=SFA.n;RUNX.sfMax=Math.max(RUNX.sfMax|0,n);
  if(n===3||n===5||n===8||n===12||(n>12&&n%5===0)){
    chaineAura('SANS FAUTE ×'+n,30+Math.min(20,n)*8,'sansfaute',true,true);
    nitroGain(.12,'sansfaute');
    setTimeout(function(){try{if(running&&!gameOver)popTexte(sansAcc(TR('SANS FAUTE'))+' ×'+n,'#7dff9a',2);}catch(e){}},700);
    try{if(SONV2)sfx('jeu.sansFaute',{st:n});else chimeNote(noteP(Math.min(9,2+Math.floor(n/3)),1),.7,.06,.3);}catch(e){}
  }
}
const VPAL={n:0,rec:false,c0:3};          // paliers de vitesse de la partie (n = dernière centaine criée) · rec = record de vie déjà crié · c0 = 1re centaine criée
/* MESURÉ (banc gp.js, pilote auto, moteur de départ) : 120 km/h au départ, 300 à ~10 s, 400 à ~40 s. Crier « 300 » à chaque partie
   deviendrait un tic : on ne crie qu'à partir d'une centaine sous TON record de vie (`c0`, relu à chaque partie) — le débutant entend
   300, 400… ; le vétéran n'entend que ce qui s'approche de son record, puis « RECORD DE VITESSE » quand il tombe. */
function vpalTick(kmh){
  if(PARK.on||TUTO.on||!(kmh>0))return;
  const c=Math.floor(kmh/100);
  if(c>=VPAL.c0&&c>VPAL.n){VPAL.n=c;
    popTexte((c*100)+(LANG==='fr'?' KM/H !':' KM/H!'),c>=8?'#ff5ec8':c>=5?'#ffd75e':'#9fe8ff',1);
    fovPunch=Math.max(fovPunch,5+Math.min(8,c));hap(c>=6?[12,20,18]:10);
    try{if(SONV2)sfx('jeu.palierVitesse',{st:Math.max(0,c-4),vol:-8}); /* (2026-10-12) −8 dB : un mur d'air à chaque centaine, trois dans les premières secondes */else chimeNote(noteP(Math.min(11,c),1),0,.05,.22);}catch(e){}}
  const ex=SAVE.d.ex,r=ex?(ex.kmh|0):0;
  if(!VPAL.rec&&r>=250&&kmh>r+5){VPAL.rec=true;
    setTimeout(function(){try{if(running&&!gameOver){slam('RECORD DE VITESSE',Math.round(Math.max(kmh,runStats.vmax||0))+' KM/H','#ffd75e','#ff3924',40,2,14);hap([12,30,20]);}}catch(e){}},250);}
}
function grisantRaz(){MIR.t=0;MIR.max=0;SFA.n=0;VPAL.n=0;VPAL.rec=false;
  try{VPAL.c0=Math.max(3,Math.floor(((SAVE.d.ex&&SAVE.d.ex.kmh)|0)/100)-1);}catch(e){VPAL.c0=3;}}
// console : dbgPwr('m') prend un pouvoir (n a v m x) · dbgPwr() l'état des cinq minuteurs et du grisant
window.dbgPwr=function(k,n){try{if(k&&PWR_DEFS[k]){for(let i=0;i<(n||1);i++)pwrPrend(k,carGroup.position);}
  if(k==='mir'){MIR.max=n==null?1:n;return MIR.max;} // (banc) la prochaine pose est un MIRACULÉ
  if(k==='cristaux'){const o9={};for(const p of pickups)if(p.pow&&p.face===1)o9[p.pow]=(o9[p.pow]|0)+1;return o9;} // (banc) les cristaux posés sur la piste, par pouvoir
  if(k==='sf'){sfaPose(n!==false);return SFA.n;} // (banc) une pose jugée propre (ou pas : dbgPwr('sf',false))
  if(k==='devant'){const L9=[];for(const p of pickups)if(!p.taken&&!p.pow&&p.face===side&&p.s>s+5&&p.s<s+50)L9.push(p);window.__dv=L9;return L9.length;} // (banc) l'or à portée d'AIMANT…
  if(k==='devantPris'){return (window.__dv||[]).filter(function(p){return p.taken;}).length;} // …et ce qui en a été ramassé
  if(k==='sphere'){const f9=mode==='fall'?RAM.face:side,s9=mode==='fall'?lastNearS:s,L9=[];for(const p of pickups)if(!p.taken&&!p.pow&&(p.face===f9||p.air)&&p.mesh.position.distanceTo(carGroup.position)<MAG_R)L9.push(p);window.__sp=L9;return {n:L9.length,air:L9.filter(function(p){return p.air;}).length,derriere:L9.filter(function(p){return p.s<s9;}).length};} // (banc) tout ce que l'AIMANT v3 doit prendre… — (2026-09-30) en vol : la face du VOL (RAM.face) et le couloir du vol (lastNearS)
  if(k==='spherePris'){return (window.__sp||[]).filter(function(p){return p.taken;}).length;} // …et ce qu'il a pris
  const o={};for(const q of PWR_ORDRE)o[q]=+pwrT(q).toFixed(2);return {pwr:o,poids:pwrPoids(),runs:(SAVE.d.ex&&SAVE.d.ex.runs)|0,mir:{t:+MIR.t.toFixed(2),max:+MIR.max.toFixed(2)},sansFaute:SFA.n,sfDern:SFA.dern,poseA:FLOW.poseA,vol:+fallT.toFixed(2),vpal:VPAL.n,c0:VPAL.c0,pieces:RUNX.coins|0,aura:Math.round(auraRun),lieu:FLOW2.lieu,cristaux:pickups.filter(function(p){return p.pow&&!p.taken;}).map(function(p){return p.pow;}).join(''),tutoZ:LVL.tutoZ|0,psyQ:FLOW2.psy.q[0]};}catch(e){return e.message;}};
const pickups=[];
const mat4b=new THREE.Matrix4(),FLIP_B=new THREE.Vector3(),FLIP_N=new THREE.Vector3(); // FLIP_* : le repère retourné des fruits d'en dessous
/* LES PIÈCES SE RECYCLENT (2026-09-28, chasse aux gels) — une piste pose 2 000 à 4 000 pièces, et chacune était un `new THREE.Mesh`
   (uuid tiré au hasard, vecteurs, matrices, propriétés définies une à une) jeté au portail suivant : MESURÉ, ~7 ms par portail sur PC et
   autant de déchets pour le ramasse-miettes. Les pièces de la piste d'avant (et elles seules : `userData.pi` — le fourgon de la campagne
   glisse les siennes dans `pickups`) attendent ici et reprennent du service : la pose (position, orientation, matrice) est refaite comme
   pour une neuve, la visibilité et l'échelle remises à neuf (le couloir d'affichage et l'aimant les avaient touchées). */
const PIECES_LIBRES=[];
/* (2026-11-11, Sacha : « réduis la taille des pièces aussi ») COIN_K : la pièce de la route à 66 % (rayon 1,31 → 0,86 m : elle était plus large que la caisse ; la 2 € suit). C'est l'échelle du FANTÔME, donc de l'instance :
   toutes les formes (euro, sapèque, bitcoin) rapetissent ensemble, la portée du ramassage et l'argent ne bougent pas ; la tirelire et les photos gardent la forme entière. `?piecek=1` = avant. */
const COIN_K=(function(){const m=/[?&]piecek=([\d.]+)/.exec(location.search);return m?Math.max(.3,Math.min(1.5,+m[1]||.66)):.66;})();
function pieceNeuve(){const m=PIECES_LIBRES.pop();if(m){m.visible=true;m.scale.set(COIN_K,COIN_K,COIN_K);return m;}
  const n=new THREE.Object3D();n.userData.pi=1;n.scale.set(COIN_K,COIN_K,COIN_K);return n;} // (2026-09-28) un FANTÔME : l'or est peint par coinIM (voir plus bas)
/* LES PIÈCES SONT INSTANCIÉES (2026-09-28, porté de la lignée car-crash) : une pièce
   était un Mesh = un appel de dessin, et le couloir LOD en montre ~100-250 en fin de partie. Désormais UNE InstancedMesh les dessine
   toutes, en UN appel. Chaque pièce garde un FANTÔME (Object3D hors scène, recyclé par PIECES_LIBRES, `pk.ci=1`) qui porte position,
   rotation, visibilité : aimant, ramassage, LOD et rotation lui parlent EXACTEMENT comme à un Mesh (`scene.remove` d'un non-enfant
   est un no-op). À chaque image, le LOD RANGE EN TÊTE les seules pièces du couloir (`coinPose`), et `count` = leur nombre : le GPU
   ne traite QUE celles-là. ⚠ MESURÉ au banc : une zone 7 porte ~9 100 pièces (2 faces) — les laisser toutes dans l'instance, même
   écrasées à zéro, faisait passer 2,1 M de triangles DÉGÉNÉRÉS par le vertex shader à chaque image. Les pièces du FOURGON de la
   campagne restent de vrais maillages. ⚠ `frustumCulled=false` : la sphère englobante d'une InstancedMesh r128 ne couvre pas ses
   instances. */
const COIN_CAP=4096; // pièces VISIBLES à la fois (le couloir, les deux faces en vol) — au-delà, les plus lointaines attendent l'image suivante
const coinIM=new THREE.InstancedMesh(pickGeo,pickMat,COIN_CAP);
coinIM.name='pièces 1 €';coinIM.frustumCulled=false;coinIM.matrixAutoUpdate=false;coinIM.instanceMatrix.setUsage(THREE.DynamicDrawUsage);coinIM.count=0;scene.add(coinIM);
/* (2026-11-05, Sacha : « à la place des pièces sur la route met des pièces de 1 et 2 euros ») DEUX instances : coinIM = les 1 €, coinIM2 = les 2 €
   (anneau d'argent, cœur d'or, un peu plus grandes). Deux appels de dessin au lieu d'un — la pièce se tire 1 € ou 2 € à sa pose (`pk.deux`, même
   tirage sur les deux faces) ; hors euros (sapèque de Jade, bitcoin) tout reste dans coinIM. */
const COIN_CAP2=COIN_CAP;
const coinIM2=new THREE.InstancedMesh(pickGeo2,pickMat2,COIN_CAP2);
coinIM2.name='pièces 2 €';coinIM2.frustumCulled=false;coinIM2.matrixAutoUpdate=false;coinIM2.instanceMatrix.setUsage(THREE.DynamicDrawUsage);coinIM2.count=0;scene.add(coinIM2);
let coinN=0,coinN2=0;
function coinPose(p){if(p.deux&&COIN_DEUX){if(coinN2<COIN_CAP2)coinIM2.setMatrixAt(coinN2++,p.mesh.matrix);return;}
  if(coinN<COIN_CAP)coinIM.setMatrixAt(coinN++,p.mesh.matrix);} // une pièce du couloir, rangée en tête
function coinFlush(){const a=coinIM.instanceMatrix;coinIM.count=coinN;
  a.updateRange.offset=0;a.updateRange.count=Math.max(1,coinN)*16;a.needsUpdate=true;coinN=0;
  const a2=coinIM2.instanceMatrix;coinIM2.count=coinN2;
  a2.updateRange.offset=0;a2.updateRange.count=Math.max(1,coinN2)*16;a2.needsUpdate=true;coinN2=0;}
/* ===== LES PIÈCES ENTRENT DANS LA CAISSE (2026-11-10, Sacha : « retravaille l'animation quand on ramasse des pièces, il faut qu'elle aille dans la voiture, mieux que ça, surtout avec l'aimant ») =====
   AVANT : la pièce était comptée et RETIRÉE à moins de 3,8 m du centre de la caisse (ramassage.js) — elle s'éteignait devant le capot, et l'étincelle partait là-bas.
   MAINTENANT l'ARGENT ne change pas d'un cheveu (même portée, même image, même combo, même banc) : à la prise, la pièce devient une PIÈCE VOLANTE qui finit sa course
   DANS la caisse, en ~0,16 s (~0,22 s sous l'aimant, ±20 % par pièce : un flot, pas un bloc). Elle voyage dans le REPÈRE DE LA CAISSE (sa position locale = la
   rotation inverse de la caisse appliquée à l'écart) : à 500 km/h elle ne traîne plus derrière, et en figure (salto, vrille) elle reste collée à la tôle.
   Le mouvement : départ vif, elle accélère en approchant, grossit d'un tiers puis fond dans la carrosserie, tourne de plus en plus vite, passe par un petit arc ;
   sous l'aimant elle tourbillonne autour de l'axe haut de la caisse. L'étincelle d'or part à l'ARRIVÉE, sur la caisse (au plus 3 gerbes par image : la réserve
   sparkGold n'a que 140 particules). Rien n'est alloué : tout vit dans UN Float32Array (CVOL.f, 16 flottants par pièce) et quelques vecteurs de travail ; les
   pièces volantes sont dessinées par coinIM / coinIM2, rangées à la suite de celles du couloir (coinVolTick, appelée juste avant coinFlush) : aucun appel de
   dessin de plus. `?pvol=0` = avant (la pièce s'éteint à la prise). Banc : dbgPiecesVol(). Champs d'une pièce : 0-2 écart de départ (repère caisse) · 3 âge ·
   4 durée · 5-8 son orientation (quaternion local) · 9 vaut 1 si c'est une 2 € · 10 le tourbillon (rad, signé ; 0 hors aimant). */
const CVOL_N=128,CVOL={n:0,f:new Float32Array(128*16),lances:0,arr:0,plein:0,mag:0,derriere:0,devant:0,vit:0,tr:null,fige:-1,on:!/[?&]pvol=0\b/.test(location.search)};
const CV_Y=.8,CV_Z=.15; /* la cible : le cœur de la caisse (repère caisse : y = au-dessus du bitume, z = vers le nez) — dans la carrosserie, la pièce y est cachée par la tôle */
const CV_IQ=new THREE.Quaternion(),CV_Q=new THREE.Quaternion(),CV_QS=new THREE.Quaternion(),CV_P=new THREE.Vector3(),CV_S=new THREE.Vector3(),CV_M=new THREE.Matrix4(),CV_UP=new THREE.Vector3(0,1,0),CV_D=new THREE.Vector3();
function coinVolLance(p,mag){ /* faux = pas de pièce volante (?pvol=0, mouvement réduit, hors course, réserve pleine) : l'appelant garde l'ancienne gerbe */
  if(!CVOL.on||REDUCED_MOTION||(mode!=='drive'&&mode!=='fall'))return false;
  if(CVOL.n>=CVOL_N){CVOL.plein++;return false;}
  const F=CVOL.f,o=CVOL.n*16,r1=Math.random(),r2=Math.random();
  CV_IQ.copy(carGroup.quaternion).invert();
  CV_P.copy(p.mesh.position).sub((mag&&mode==='drive'&&MAGB.port&&RAM.Bp)?RAM.Bp:carGroup.position).applyQuaternion(CV_IQ); /* la pièce, dans le repère de la caisse — sous l'aimant au sol, de la place où la caisse SERA dessinée (RAM.Bp : la traction y a mené la pièce ; carGroup.position est celle de l'image d'avant) */
  /* (2026-11-11, grande vitesse) LE COLLIER. Au sol, la pièce est comptée DEVANT (la prise anticipée, ramassage.js) ; sa course part d'un PLAN DE CAPTURE devant le capot (3,8 m + jusqu'à 3 m
     avec la vitesse) et son ÂGE de départ = le temps écoulé depuis qu'elle a croisé ce plan (une fraction d'image) : à 900 km/h, 35 pièces par seconde entrent à intervalles ÉGAUX quel que soit
     le nombre d'images par seconde — un collier d'or régulier qui coule dans la caisse, au lieu de paquets. Une pièce comptée en retard (derrière) est remise devant dès 150 km/h. */
  let a0=0;const v9=RAM.dv||0;
  if(!mag&&mode==='drive'&&RAM.av&&v9>15&&RAM.dC){const zr=CV_P.z-RAM.dC.length(),zc=Math.min(3,v9*.012); /* zr : devant la caisse TELLE QU'ELLE SERA DESSINÉE */
    a0=Math.max(0,Math.min(.05,(3.8-zr)/v9));CV_P.z=zr+a0*v9+zc;if(v9>40&&CV_P.z<1.5+zc)CV_P.z=1.5+zc;}
  const l9=CV_P.length(),lm=7+Math.min(4,v9*.016);if(l9>lm)CV_P.multiplyScalar(lm/l9); /* prise « après coup » (trajet balayé à 30 i/s) : elle ne vient pas de 20 m derrière */
  CV_QS.copy(CV_IQ).multiply(p.mesh.quaternion); /* son orientation, dans ce même repère */
  F[o]=CV_P.x;F[o+1]=CV_P.y;F[o+2]=CV_P.z;F[o+3]=a0>0?a0-(RAM.dT||0):0;F[o+15]=1.3-.18*Math.min(1,v9/200); /* 15 : l'exposant de sa course (à grande vitesse elle part plus franchement : le collier est mieux réparti) */
  if(mag){CVOL.mag++;if(CV_P.z<-1.5)CVOL.derriere++;else if(CV_P.z>1.5)CVOL.devant++;} /* (banc) où la pièce est prise sous l'aimant : derrière la caisse = la traction l'a laissée traîner */
  F[o+4]=(mag?.22:.26)*(.96+.08*r1); /* ± 4 % seulement : les arrivées gardent le RYTHME des prises (une file = un tic-tic-tic régulier) */ /* (2026-11-11, LA GORGÉE) .16 s ne se LISAIT pas (5 images au téléphone) : .26 s, dont un septième de saut sur place (filmé image par image : à .30 s et un cinquième, elle FLOTTAIT à côté de la caisse) */ /* (2026-11-10) sous l'aimant la pièce arrive déjà près de la caisse (portage) : une fin de course plus courte, pas de tourbillon de plus */
  F[o+5]=CV_QS.x;F[o+6]=CV_QS.y;F[o+7]=CV_QS.z;F[o+8]=CV_QS.w;
  F[o+9]=(p.deux&&COIN_DEUX)?1:0;
  F[o+10]=mag?(r2<.5?-1:1)*(.3+r2*.3):0; /* un souffle seulement : le tourbillon se fait AVANT la prise (magSpirale) ; autour de l'axe vertical il aurait glissé la pièce derrière la caisse */
  F[o+11]=CV_P.z<-.8?-.7:1.1*Math.max(.55,Math.min(1,1.25-CGOR.fx/40)); /* (grande vitesse) à plus de 10 pièces par seconde elles se chevauchent sur leur course (une tous les 70 cm à 900 km/h) : la pièce en vol rapetisse avec le DÉBIT (jusqu'à 55 %), le collier reste lisible */ /* LE SAUT : elle gonfle d'un tiers à la prise — jamais derrière la caisse (elle est alors entre la caméra et la caisse : valeur NÉGATIVE = ni saut, ni étirement, ni fantôme, et plus petite) */
  F[o+12]=(mag?.35:.6)+.08*r2; /* la hauteur de l'arc (m) */
  F[o+13]=(CV_P.x>=0?1:-1)*Math.min(.5,.05+.12*Math.abs(CV_P.x)); /* (le ventre suit l'écart de côté, sans hasard : les pièces d'une file prennent la MÊME courbe) */F[o+14]=Math.max(1,Math.min(1.4,((p.mesh.scale&&p.mesh.scale.x)||COIN_K)/COIN_K)); /* 14 : sa taille à la prise (elle s'était éveillée, voir coinEveil) — le saut repart de là */ /* le ventre de la courbe, du côté d'où elle vient (m) */
  CVOL.n++;CVOL.lances++;return true;}
function coinVolPose(o,age,u,kf){ /* la pièce volante au fil `o` (CVOL.f), à l'âge `age` (u = âge / durée) : sa matrice monde dans CV_M, sa place dans CV_P ; kf = l'échelle d'un fantôme de traînée (1 = la pièce) */
  /* (2026-11-11, Sacha : « ça fait trop brut comment ça arrive […] faut qu'elle rapetisse et qu'il y ait une mini animation quand elle rentre dans la voiture ») LA GORGÉE, en trois temps :
     1. LE SAUT (le premier septième) : touchée, la pièce gonfle (× 1,1) et saute de 40 cm — l'œil la voit « prise » ;
     2. LA COMÈTE : elle avance dès la prise et accélère un peu (e = u^1,3 ; u^1,12 à grande vitesse) sur une courbe (arc + ventre de côté), RAPETISSE sans à-coup jusqu'à 14 %, s'ÉTIRE dans le sens de sa course
        (× 1,4 au plus, amincie d'autant) et tourne de plus en plus vite ;
     3. LA CAISSE L'AVALE (coinVolTick, à l'arrivée) : l'éclat d'or (CGOR) et le hoquet de la carrosserie. */
  const F=CVOL.f,cp=carGroup.position,cq=carGroup.quaternion,A=.14,arr=F[o+11]<0,pk=arr?-F[o+11]:F[o+11],hp=arr?0:.4;
  let e,sc,hop,et=1;
  if(u<0)u=0;
  const s0=F[o+14]||1,pk2=arr||pk<1?pk:Math.max(pk,s0*1.03);
  e=Math.pow(u,F[o+15]||1.3); /* (2026-11-11, filmé à 300 et 900 km/h) elle AVANCE dès la prise : tenue sur place le temps du saut puis lâchée, les pièces d'une file s'entassaient en paquet devant le capot ; une course presque régulière les espace en collier */
  if(u<A){const w=u/A,q=1-(1-w)*(1-w);hop=hp*q;sc=arr?pk:s0+(pk2-s0)*q;}
  else{const v=(u-A)/(1-A);hop=hp*(1-v);sc=pk2*(1-.86*Math.pow(v,.9));if(!arr)et=1+1.5*v*(1-v);}
  const k=1-e,sw=F[o+10]*e,c=Math.cos(sw),s=Math.sin(sw),dx=F[o],dz=F[o+2]-CV_Z,b=Math.sin(e*Math.PI);
  CV_P.set((dx*c-dz*s)*k+b*F[o+13],CV_Y+(F[o+1]-CV_Y)*k+b*F[o+12]+hop,CV_Z+(dx*s+dz*c)*k);
  CV_D.set(-CV_P.x,CV_Y-CV_P.y,CV_Z-CV_P.z); /* vers le cœur de la caisse (repère caisse) : l'axe de l'étirement */
  CV_QS.set(F[o+5],F[o+6],F[o+7],F[o+8]);
  CV_Q.setFromAxisAngle(CV_UP,2.5*age+70*age*age).multiply(CV_QS).premultiply(cq); /* elle tournait à 2,5 rad/s sur la route : elle s'emballe */
  CV_P.applyQuaternion(cq).add(cp);
  sc*=COIN_K*(kf||1);
  CV_S.set(sc,sc,sc);CV_M.compose(CV_P,CV_Q,CV_S);
  if(et>1.02){const l=CV_D.length();if(l>1e-4){CV_D.multiplyScalar(1/l).applyQuaternion(cq);const m=CV_M.elements,sp=1/Math.sqrt(et),g=et-sp,x=CV_D.x,y=CV_D.y,z=CV_D.z;
    for(let a=0;a<12;a+=4){const d=(m[a]*x+m[a+1]*y+m[a+2]*z)*g;m[a]=m[a]*sp+d*x;m[a+1]=m[a+1]*sp+d*y;m[a+2]=m[a+2]*sp+d*z;}}} /* étirée le long de sa course, amincie en travers (volume gardé à peu près) */
}
/* L'ÉCLAT ET LE HOQUET (2026-11-11) — la « mini animation » de l'entrée. CGOR : le battement (les arrivées s'accumulent, un battement toutes les 75 ms au plus) qui lance les ÉTINCELLES EN PIXELS (PXO, plus bas ; avant : une étoile au cœur de la caisse) et le hoquet. Une file de pièces = un battement d'or.
   Le HOQUET : la carrosserie (carBody, pas les roues) gonfle de 3 à 6 % et revient sur un ressort (ω 40, amorti) — personne d'autre ne touche carBody.scale. Un appel de dessin, seulement pendant l'éclat. */
const CGOR={gy:0,gv:0,n:0,c5:0,acc:0,tb:1,fx:0};
/* (2026-11-11, « paufine-la encore, objectif vidéo satisfaisante ») L'ÉVEIL : au sol, les pièces de TA voie qui arrivent (26 m devant → la caisse) se dressent — elles grossissent jusqu'à +15 % et tournent jusqu'à
   4,5 fois plus vite à mesure que la caisse approche ; une file s'allume en vague devant le capot, et chaque pièce est au plus vif quand on la prend. Dépassée sans être prise, elle se rendort.
   Appelée par le LOD pour chaque pièce visible ; rend l'angle de rotation de plus pour cette image. */
/* ===== L'ÉCLAIR QUI COURT SUR LA FILE (2026-11-11, Sacha : « oui, fais-le ») ===== Les pièces sont devenues mates (« Trésor ») : toutes les 1,7 s un reflet part de devant la caisse et FILE le long de la route
   (110 m/s de plus qu'elle, de 12 à 200 m) ; chaque pièce qu'il croise s'allume 0,24 s — elle gonfle de 24 %, fait un quart de tour de plus, et un « + » blanc de pixels (PXO, sorte 3 : fixe dans le monde) claque
   sur elle. Une file se lit comme une vague de lumière qui s'éloigne : elle montre où aller. Au sol seulement, 8 éclats par image au plus ; `?eclair=0` = sans. ECLF.a → ECLF.b : la tranche de route balayée à cette image. */
const ECLF={t:0,a:0,b:0,n:0,on:!/[?&]eclair=0\b/.test(location.search)};
function eclfTick(dt){ECLF.n=0;if(mode!=='drive'||paused){ECLF.a=ECLF.b=0;return;}
  ECLF.t+=dt;const w=12+((ECLF.t*110)%188);ECLF.a=w<ECLF.b?12:ECLF.b;ECLF.b=w;}
function coinEveil(pk,cS,dt){
  let k=0,e=0;
  if(mode==='drive'&&CVOL.on&&!REDUCED_MOTION){const ds=pk.s-cS;const R=Math.min(110,Math.max(26,(RAM.dv||0)*.4)); /* (grande vitesse) elles s'éveillent 0,4 s avant la caisse, pas 26 m : à 900 km/h, 100 m */if(ds>-3&&ds<R&&Math.abs(pk.lat-side*lat)<7){k=ds<0?1:1-ds/R;k*=k;}
    if(ECLF.on&&ds>ECLF.a&&ds<=ECLF.b&&!(pk.ecl>0)){pk.ecl=.24; /* l'éclair la croise */
      if(ECLF.n<8){ECLF.n++;const P=pk.mesh.position;pxoMonde(P.x+pk.ax.x*.8,P.y+pk.ax.y*.8,P.z+pk.ax.z*.8,Math.min(.34,.07+.0022*ds)); /* sur le HAUT de la pièce, petit de près (filmé : à 14 cm il la recouvrait d'une tache orange), plus gros au loin pour rester lisible */}}}
  if(pk.ecl>0){pk.ecl-=dt;if(pk.ecl>0)e=Math.sin((1-pk.ecl/.24)*Math.PI);}
  if(k>0||e>0){const sc=COIN_K*(1+.15*k)*(1+.24*e);pk.mesh.scale.set(sc,sc,sc);pk.ev=1;return dt*(9*k+7*e);}
  if(pk.ev){pk.ev=0;pk.mesh.scale.set(COIN_K,COIN_K,COIN_K);}
  return 0;}
/* (2026-11-11, grande vitesse) LE BATTEMENT. À 900 km/h il entre 35 pièces par seconde : un éclat par pièce = un éclat par image, l'étoile restait allumée et tremblait, la carrosserie
   restait gonflée. Les arrivées s'ACCUMULENT (CGOR.acc) et l'éclat bat au plus toutes les 75 ms (13 par seconde, régulier) : à basse vitesse chaque pièce a toujours le sien, tout de suite ;
   à grande vitesse c'est un pouls d'or. Le DÉBIT (CGOR.fx, pièces par seconde, lissé sur 0,3 s) tient une lueur de fond entre deux battements et, au-delà de 10 pièces/s, la caisse sème une
   traînée d'étincelles derrière elle (2 à 4 par battement, lâchées un peu moins vite qu'elle). */
function cgorCoup(){CGOR.acc++;CGOR.fx+=3.33; /* une pièce entre : UNE étincelle, à son point de la caisse (2026-11-11, Sacha : « une étincelle par pièce, et plus transparentes, on les voit trop ») ; au palier de 5 (la RÉCOLTE) celle-là est grande */
  const c5=(combo/5)|0,gr=combo>=5&&c5!==CGOR.c5;CGOR.c5=c5;pxoNaitre(0,gr,Math.random()*.05);}
/* ===== LES ÉTINCELLES EN PIXELS (2026-11-11, Sacha : « j'aime bien l'animation d'étincelle, mais fais-la en pixels légers, transparents, comme les gouttes d'eau de Jade, avec les mêmes pixels que le reste du jeu, comme le nitro […]
   et mets-les à différents endroits de la voiture, comme si elle brillait de partout, pas d'un point fixe ») =====
   L'étoile et la gerbe de traits d'or sont REMPLACÉES par de petits CUBES (la matière des gouttes de Jade et du feu du nitro : une InstancedMesh de BoxGeometry, un seul appel de dessin), additifs : la couleur de chaque pixel
   est teinte × transparence, donc plus il s'éteint, plus il est transparent (pas de bord dur, jamais de bord dur). Trois sortes :
   · l'ÉCLAT (k 0) : un « + » de pixels qui s'ouvre par paliers, comme du pixel art — un point, une croix de 3, une croix de 5 (7 pour le grand), puis il se referme ; durée 0,34 à 0,48 s ;
   · le GRAIN (k 1) : un seul cube qui se détache de la tôle et monte en s'éteignant ;
   · la TRAÎNÉE (k 2, au-delà de 10 pièces/s) : des cubes lâchés à l'arrière, dans le repère du MONDE (ils restent derrière, un peu moins vite que la caisse).
   OÙ : pas un point fixe. Chaque éclat naît sur un point tiré AU HASARD de la surface de la boîte de la caisse (dessus, flancs, arrière ; le capot avant peu) et s'y accroche dans SON repère (il suit la caisse en virage,
   en figure), décalé de 0 à 15 cm vers l'extérieur, à un instant tiré dans les 0,12 s du battement : la voiture scintille partout, pas d'un coup. Les cubes sont alignés sur la caisse (comme le feu du nitro) et leur « + » fait
   face à la caméra. Réserve : 110 éclats, 640 cubes. ⚠ Créée AU CHARGEMENT (visible, vide) pour que son programme se compile au menu ; elle se cache ensuite quand plus rien ne vit. `?pixel=0` = l'ancien reflet n'existe plus (coupe les étincelles). */
const PXO={im:null,L:[],max:640,cap:110,acc:0,M:new THREE.Matrix4(),V:new THREE.Vector3(),Sv:new THREE.Vector3(),I:new THREE.Quaternion(),C:new THREE.Color(),
  T:[new THREE.Color(1,.97,.82),new THREE.Color(1,.86,.42),new THREE.Color(1,.94,.64)],on:!/[?&]pixel=0\b/.test(location.search)};
(function(){const m=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});m.dispose=function(){};
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,PXO.max);im.setColorAt(0,PXO.T[0]);im.count=0;im.frustumCulled=false;im.renderOrder=41;im.name='étincelles en pixels';
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.instanceColor.setUsage(THREE.DynamicDrawUsage);
  im.onAfterRender=function(){delete im.onAfterRender;if(!im.count)im.visible=false;}; /* chauffé au menu, puis il dort */
  scene.add(im);PXO.im=im;})();
function pxoSurface(p){ /* un point au hasard sur la boîte de la caisse (repère caisse : x gauche, y haut, z nez) et sa normale */
  const C=CARS[level]||CARS[0],hw=C.w*.38,hl=C.l*.42,H=Math.max(.7,C.h*.94),y0=.28*H;
  const wt=hw*hl*3.2,ws=hl*(H-y0)*.5,wb=hw*(H-y0)*2.2,wf=hw*(H-y0)*.3; /* la caméra est derrière et au-dessus : le DESSUS et l'ARRIÈRE d'abord, les flancs et le capot avant peu */let r=Math.random()*(wt+2*ws+wb+wf);
  p.nx=p.ny=p.nz=0;
  if((r-=wt)<0){p.lx=(Math.random()*2-1)*hw;p.ly=H;p.lz=(Math.random()*2-1)*hl;p.ny=1;}
  else if((r-=2*ws)<0){const sd=Math.random()<.5?-1:1;p.lx=sd*hw;p.ly=y0+Math.random()*(H-y0);p.lz=(Math.random()*2-1)*hl;p.nx=sd;}
  else if((r-=wb)<0){p.lx=(Math.random()*2-1)*hw;p.ly=y0+Math.random()*(H-y0);p.lz=-hl;p.nz=-1;}
  else{p.lx=(Math.random()*2-1)*hw;p.ly=y0+Math.random()*(H-y0);p.lz=hl;p.nz=1;}
  p.o=Math.random()*.15;}
function pxoNaitre(k,grand,delai){ /* k : 0 l'éclat « + », 1 le grain, 2 la traînée (monde) */
  if(!PXO.on||REDUCED_MOTION||PXO.L.length>=PXO.cap)return;
  const p={k:k,t:-(delai||0),l:k===0?(grand?.48:.34)+.1*Math.random():.3+.2*Math.random(),px:(.105+.06*Math.random())*(grand?1.35:1),c:(Math.random()*3)|0,g:grand?1:0};
  if(k===2){const C=CARS[level]||CARS[0];pxoSurface(p);p.lx=(Math.random()*2-1)*C.w*.4;p.lz=-C.l*.46;p.ly=.3+Math.random()*.5*C.h;
    PXO.V.set(p.lx,p.ly,p.lz).applyQuaternion(carGroup.quaternion).add(carGroup.position);p.wx=PXO.V.x;p.wy=PXO.V.y;p.wz=PXO.V.z;
    const V=PT_U.uVc.value,r=.74+.16*Math.random();p.vx=V.x*r+(Math.random()-.5)*4;p.vy=V.y*r+.8+Math.random()*2.4;p.vz=V.z*r+(Math.random()-.5)*4;p.px*=.9;}
  else pxoSurface(p);
  PXO.L.push(p);}
function pxoMonde(x,y,z,px){if(!PXO.on||PXO.L.length>=PXO.cap)return;PXO.L.push({k:3,t:0,l:.3,px:px,c:0,g:0,wx:x,wy:y,wz:z});} /* un « + » fixe dans le monde (l'éclair sur une pièce) */
function pxoTick(dt,actif){
  const im=PXO.im,L=PXO.L;
  if(!actif)L.length=0;
  if(!L.length){if(im.count||im.visible){im.count=0;im.visible=false;}return;}
  const cq=carGroup.quaternion,cp=carGroup.position,me=camera.matrixWorld.elements,rx=me[0],ry=me[1],rz=me[2],ux=me[4],uy=me[5],uz=me[6],M=PXO.M,V=PXO.V,S=PXO.Sv,Cc=PXO.C;
  /* le « + » face à la caméra, exprimé dans le repère de la caisse (les cubes sont alignés sur la caisse) */
  PXO.cr=PXO.cr||new THREE.Vector3();PXO.cu=PXO.cu||new THREE.Vector3();PXO.iq=PXO.iq||new THREE.Quaternion();
  PXO.iq.copy(cq).invert();PXO.cr.set(rx,ry,rz).applyQuaternion(PXO.iq);PXO.cu.set(ux,uy,uz).applyQuaternion(PXO.iq);
  const R=PXO.cr,U=PXO.cu;let n=0;
  for(let i=L.length-1;i>=0;i--){const p=L[i];
    if(!paused)p.t+=dt;
    if(p.t<0)continue;
    const u=p.t/p.l;if(u>=1){L[i]=L[L.length-1];L.pop();continue;}
    const al=(u<.14?u/.14:Math.pow(1-(u-.14)/.86,1.2))*(p.k===3?.7:.55),T=PXO.T[p.c];Cc.setRGB(T.r*al,T.g*al,T.b*al);
    if(p.k===2){p.vy-=9*dt;p.wx+=p.vx*dt;p.wy+=p.vy*dt;p.wz+=p.vz*dt;V.set(p.wx,p.wy,p.wz);
      const sz=p.px*(1-.55*u);S.set(sz,sz,sz);M.compose(V,PXO.I,S);if(n<PXO.max){im.setMatrixAt(n,M);im.setColorAt(n,Cc);n++;}continue;}
    const W=p.k===3,d=W?0:p.o+(p.k===1?.55*u:.12*u);
    const bx=W?p.wx:p.lx+p.nx*d,by=W?p.wy:p.ly+p.ny*d,bz=W?p.wz:p.lz+p.nz*d,Rx=W?rx:R.x,Ry=W?ry:R.y,Rz=W?rz:R.z,Ux=W?ux:U.x,Uy=W?uy:U.y,Uz=W?uz:U.z;
    if(p.k===1){V.set(bx,by,bz).applyQuaternion(cq).add(cp);const sz=p.px*(1-.5*u);S.set(sz,sz,sz);M.compose(V,cq,S);if(n<PXO.max){im.setMatrixAt(n,M);im.setColorAt(n,Cc);n++;}continue;}
    /* l'éclat : un point · une croix de 3 · une croix de 5 (7 pour le grand) · une croix de 3 · un point */
    const arms=u<.14?0:u<.4?1:u<.7?(p.g?3:2):u<.88?1:0,px=p.px;
    for(let a=-arms;a<=arms;a++)for(let b=0;b<2;b++){
      if(a===0&&b===1)continue; /* le centre n'est posé qu'une fois */
      const ax=b===0?a:0,ay=b===0?0:a; /* b = 0 : le bras horizontal (et le centre) · b = 1 : le bras vertical */
      if(b===1&&a===0)continue;
      const o=Math.abs(a),sz=px*(o===0?1.15:1-.16*o);
      V.set(bx+(Rx*ax+Ux*ay)*px*1.05,by+(Ry*ax+Uy*ay)*px*1.05,bz+(Rz*ax+Uz*ay)*px*1.05);if(!W)V.applyQuaternion(cq).add(cp);
      S.set(sz,sz,sz);M.compose(V,W?PXO.I:cq,S);if(n<PXO.max){im.setMatrixAt(n,M);if(o===0)Cc.setRGB(Math.min(1,T.r*al*1.2+.04*al),Math.min(1,T.g*al*1.15+.05*al),Math.min(1,T.b*al*1.2+.1*al));else Cc.setRGB(T.r*al,T.g*al,T.b*al);im.setColorAt(n,Cc);n++;}}
  }
  im.count=n;im.visible=n>0;imEnvoi(im,n,true);}
function cgorBat(n9){
  CGOR.n++;CGOR.gv=Math.min(2.6,CGOR.gv+Math.min(2.2,1.2+.3*n9)); /* le hoquet de la carrosserie */}
function cgorTick(dt){
  const actif=(mode==='drive'||mode==='fall');
  CGOR.tb+=dt;CGOR.fx*=Math.exp(-dt/.3);if(CGOR.fx<.05)CGOR.fx=0;
  if(!actif){CGOR.acc=0;CGOR.fx=0;}
  else if(CGOR.acc>0&&CGOR.tb>=.075){const n9=CGOR.acc;CGOR.acc=0;CGOR.tb=0;cgorBat(n9);}
  if(CGOR.gy!==0||CGOR.gv!==0){ /* le hoquet */
    if(!actif){CGOR.gy=CGOR.gv=0;carBody.scale.set(1,1,1);}
    else{const d=Math.min(dt,1/30);CGOR.gv+=(-CGOR.gy*1600-CGOR.gv*34)*d;CGOR.gy+=CGOR.gv*d;
      if(Math.abs(CGOR.gy)<4e-4&&Math.abs(CGOR.gv)<.02){CGOR.gy=CGOR.gv=0;carBody.scale.set(1,1,1);}
      else{const y=Math.max(-.04,Math.min(.07,CGOR.gy));carBody.scale.set(1+y*.7,1+y,1+y*.4);}}}
  pxoTick(dt,actif);}
function coinVolTick(dt){ /* appelée par la boucle (LOD) juste avant coinFlush */
  eclfTick(dt); /* (2026-11-11) l'éclair qui court sur la file : la tranche balayée à l'image suivante */
  if(CVOL.vit&&mode==='drive'){vA=CVOL.vit/(3.6*SPD);graceT=Math.max(graceT,.3);} /* (banc) dbgPiecesVol('vitesse',kmh) : la vitesse tenue (et la caisse protégée : le pilote automatique ne esquive rien à 900 km/h) — le défaut de l'aimant grandit avec elle */
  if(CVOL.tr&&mode==='drive'){ /* (banc) dbgPiecesVol('trace',1) : la trajectoire de chaque pièce à moins de 40 m, dans le repère de la caisse (temps, x, z) — lue par dbgPiecesVol('trace',0) */
    CV_IQ.copy(carGroup.quaternion).invert();const T9=CVOL.tr,t9=performance.now(),dC=RAM.dC,l9=dC.lengthSq(),il=l9>1e-8?1/Math.sqrt(l9):0; /* z = le long de la TRAJECTOIRE de la caisse (comme le portage) : le nez peut être de travers de quelques degrés */
    for(let i=0;i<pickups.length;i++){const p=pickups[i];if(p.taken||!p.ci||p.face!==side)continue;
      CV_P.copy(p.mesh.position).sub(carGroup.position);if(CV_P.lengthSq()>1600)continue;
      const zv=il?(CV_P.x*dC.x+CV_P.y*dC.y+CV_P.z*dC.z)*il:CV_P.applyQuaternion(CV_IQ).z;
      (T9[i]||(T9[i]=[])).push(t9,Math.sqrt(CV_P.lengthSq()),zv);}} /* (t, distance à la caisse, z le long de la trajectoire) */
  if(HUD_CALME.on)CVOL.n=0; /* (2026-11-13, Sacha : « en HUD calme on doit même plus voir les pièces ou les ramasser ») une pièce qui volait encore dans la caisse au moment où le HUD s'éteint disparaît avec lui, sans éclat d'or */
  if(CVOL.n===0){cgorTick(dt);return;} /* (2026-11-11) cgorTick : l'éclat d'or et le hoquet de la caisse, APRÈS les arrivées de l'image */
  if(mode!=='drive'&&mode!=='fall'){CVOL.n=0;cgorTick(dt);return;} /* mort, menu, portail : plus rien ne vole */
  const F=CVOL.f,fige=CVOL.fige;let n=CVOL.n;
  for(let i=0;i<n;){
    const o=i*16,age=fige>=0?fige*F[o+4]:F[o+3]+dt,u=age/F[o+4]; /* (banc) fige : toutes les pièces tenues au même point de leur course */
    if(u>=1){ /* ARRIVÉE : l'étincelle d'or naît sur la caisse */
      cgorCoup();
      CVOL.arr++;n--;if(i<n)F.copyWithin(o,n*16,n*16+16); /* la dernière prend sa place */
      continue;}
    F[o+3]=age;
    coinVolPose(o,age,u,1);
    if(F[o+9]){if(coinN2<COIN_CAP2)coinIM2.setMatrixAt(coinN2++,CV_M);}else if(coinN<COIN_CAP)coinIM.setMatrixAt(coinN++,CV_M);
    i++;}
  CVOL.n=n;cgorTick(dt);}
window.dbgPiecesVol=function(k,n9,mag,av){ /* (banc) dbgPiecesVol() = l'état · 'raz' · 'lance',n,aimant,devant = n pièces factices posées autour de la caisse (repère caisse : 2 à 7 m ; devant = vrai : seulement dans les ±70° du nez, comme une pièce de la route) · 'fige',u (0 → 1, -1 = libère) · 'actif',0/1 (avant / après) · 'pos',i = la pièce i : distance à la caisse, échelle */
  if(k==='raz'){CVOL.n=0;CVOL.lances=CVOL.arr=CVOL.plein=CVOL.mag=CVOL.derriere=CVOL.devant=0;return 1;}
  if(k==='vitesse'){CVOL.vit=+n9||0;return CVOL.vit;}
  if(k==='trace'){ /* (banc) 1 = enregistre ; 0 = rend le bilan des pièces PRISES : combien, parties de DEVANT (z > 3 m) qui sont passées DERRIÈRE la caisse (z < −1,5 m) avant d'être prises, et la durée de leur traction (de 40 m à la prise) */
    if(n9){CVOL.tr={};return 1;}
    const T9=CVOL.tr||{},R=[];CVOL.tr=null;
    const EX=[];
    for(const i in T9){if(!pickups[i]||!pickups[i].taken)continue;const a=T9[i];let mn=1e9,t0=a[0],t1=a[a.length-3];for(let j=2;j<a.length;j+=3)if(a[j]<mn)mn=a[j];R.push({z0:a[2],mn:mn,dur:(t1-t0)/1000,fr:a.length/3});
      if(mn<-4&&EX.length<4){const q=[];for(let j=0;j<a.length;j+=3)q.push(Math.round((a[j]-t0))+'ms d'+a[j+1].toFixed(1)+' z'+a[j+2].toFixed(1)+' lat'+Math.sqrt(Math.max(0,a[j+1]*a[j+1]-a[j+2]*a[j+2])).toFixed(1));EX.push(q.join(' | '));}}
    const dev=R.filter(function(r){return r.z0>3;}),pas=dev.filter(function(r){return r.mn<-1.5;}),loin=dev.filter(function(r){return r.mn<-4;}),du=R.map(function(r){return r.dur;}).sort(function(x,y){return x-y;});
    return {exemples:EX,prises:R.length,parties_devant:dev.length,passees_derriere:pas.length,part:dev.length?+(pas.length/dev.length).toFixed(2):0,loin_derriere:loin.length,part_loin:dev.length?+(loin.length/dev.length).toFixed(2):0,dur_med:+(du[du.length>>1]||0).toFixed(3),dur_p90:+(du[Math.floor(du.length*.9)]||0).toFixed(3)};}
  if(k==='semis'){let ok=0;const H9=ROAD_HALF-1.8; /* (banc) n VRAIES pièces posées sur la route, devant la caisse (60 à 500 m), sur toute la largeur : l'aimant les prend comme celles de la piste, quelle que soit la route tirée */
    if(mode!=='drive')return 0;
    for(let i=0;i<(n9||1);i++){const sp=mag==='ligne'?s+45+i*7:s+60+Math.random()*440,lt=mag==='ligne'?Math.max(-H9,Math.min(H9,side*lat)):(Math.random()*2-1)*H9; /* 'ligne' : une file droite devant la caisse, une pièce tous les 7 m */
      frameAt(sp,F);mat4b.makeBasis(F.b,F.n,F.t);
      const m=pieceNeuve();m.position.copy(F.p).addScaledVector(F.b,lt).addScaledVector(F.n,1.3);m.quaternion.setFromRotationMatrix(mat4b);m.rotateOnWorldAxis(F.n,sp*.11);m.updateMatrix();m.matrixAutoUpdate=false;
      pickups.push({s:sp,lat:lt,face:1,nitro:false,fruit:-1,mesh:m,taken:false,ax:F.n.clone(),deux:false,ci:1});ok++;}
    return ok;}
  if(k==='portage'){MAGB.port=!!n9;return MAGB.port;} /* (banc) le portage de l'aimant : 1 = après, 0 = avant (la traction dans le repère du monde) */
  if(k==='avant'){RAM.av=!!n9;return RAM.av;} /* (banc) la prise anticipée : 1 = après, 0 = avant */
  if(k==='eclat'){cgorCoup();return CGOR.n;} /* (banc) une gorgée à vide : l'éclat et le hoquet */
  if(k==='fige'){CVOL.fige=n9==null?-1:n9;return CVOL.fige;}
  if(k==='actif'){CVOL.on=!!n9;return CVOL.on;}
  if(k==='pos'){const i=n9|0;if(i>=CVOL.n)return null;const o=i*16;coinVolPose(o,CVOL.f[o+3],CVOL.f[o+3]/CVOL.f[o+4],1);return {dist:+CV_P.distanceTo(carGroup.position).toFixed(2),u:+(CVOL.f[o+3]/CVOL.f[o+4]).toFixed(2),echelle:+CV_S.x.toFixed(2),deux:CVOL.f[o+9]};}
  if(k==='lance'){let ok=0;for(let i=0;i<(n9||1);i++){const a=(av?(i/(n9||1)-.5)*2.4:i/(n9||1)*6.2832),r=2+5*((i*0.618)%1),f={mesh:{position:new THREE.Vector3(Math.sin(a)*r,.9,Math.cos(a)*r),quaternion:new THREE.Quaternion()},deux:i%3===0};
    f.mesh.position.applyQuaternion(carGroup.quaternion).add(carGroup.position);if(coinVolLance(f,!!mag))ok++;}return ok;}
  return {n:CVOL.n,lances:CVOL.lances,arrivees:CVOL.arr,pleine:CVOL.plein,actif:CVOL.on,mode:mode,aimant:CVOL.mag,derriere:CVOL.derriere,devant:CVOL.devant,portage:MAGB.port,kmh:Math.round(Math.abs(vA)*3.6*SPD)};};
window.dbgPieces=function(){ /* (banc, 2026-11-09) le bilan des pièces de la piste : combien, 2 €, fruits, séries (entières posées), au km, et la liste des pièces d'une série (dbgPieces(n)) */
  const c=pickups.filter(function(p){return !p.nitro&&!p.pow&&!p.spin&&p.face===1;}),f=pickups.filter(function(p){return p.nitro&&p.face===1;}),S=serieEtat();
  const o={pieces:c.length,deux:c.filter(function(p){return p.deux;}).length,fruits:f.length,series:S.tot.filter(function(n){return n>0;}).length,L:Math.round(L),auKm:+(c.length/L*1000).toFixed(1),
    petites:S.tot.filter(function(n){return n>0&&n<4;}).length,maxSerie:Math.max.apply(null,S.tot.filter(function(n){return n>0;}).concat([0])),zones:runStats.zones|0};
  const mauvais=pickups.filter(function(p){return !isFinite(p.s)||!isFinite(p.lat)||Math.abs(p.lat)>ROAD_HALF+.01||(p.mesh&&!isFinite(p.mesh.position.x));}).length;o.mauvais=mauvais;
  return o;};
function spawnPickups(rnd){
  sceneRetire(pickups.map(function(p){return p.mesh;})); // (chasse aux gels) d'un seul passage : un par un, c'était ~15 ms par portail (voir sceneRetire)
  for(const p of pickups){const m9=p.mesh;if(m9&&m9.userData.pi===1&&!m9.parent)PIECES_LIBRES.push(m9);} // (chasse aux gels) nos pièces, hors scène, se recyclent
  pickups.length=0;coinN=0;coinN2=0;CVOL.n=0;{const S9=serieEtat();S9.n=0;S9.g=0;S9.tot.length=0;S9.got={};}
  if(BALADE||(LVL.cur&&LVL.cur.piste==='tuto')){coinFlush();return;} // (2026-10-09) LA BALADE : rien à ramasser, que la route — (2026-11-11, Sacha : « pas d'objet sur la route dans le tuto nitro infini ») L'AUTO-ÉCOLE AUSSI : ni pièce ni fruit, la nitro y est offerte et la leçon se lit sur une route nue // (v5) les séries repartent de zéro
  const HALF=ROAD_HALF-1.8;
  /* (2026-09-28, porté de la lignée car-crash) DEUX RÉGLAGES QUI NE TOUCHENT NI AU FLUX `rnd` NI À L'ÉCONOMIE :
     · L'ÉCART D'OBSTACLE : des pièces et des fruits tombaient PILE sur un plot ou une flaque (mesuré là-bas : 1-2 par zone) —
       prendre la pièce, c'était subir l'obstacle sans l'avoir choisi. On les pousse de côté. Les deux faces étant en MIROIR
       STRICT (mêmes s, mêmes lat), la face du dessus suffit.
     · LE PAS DES MOTIFS SUIT LE MOTEUR : les motifs sont dessinés pour le départ ; au moteur de fin de partie un zigzag défilait
       en 0,7 s, plus personne ne le suivait. Le pas s'allonge en √(poussée × surmultipliée) — 1 au départ, plafond 2,1 : on
       garde un vrai slalom. ⚠ Pas en CAMPAGNE : ses pistes sont identiques à chaque essai, ses pièces aussi. */
  const STR=THREE.MathUtils.clamp(Math.sqrt(((ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).push||1)*lateMul()),1,2.1);
  const dodge=(sp,lt)=>{
    for(const o of OILS){
      if(o.face!==1||Math.abs(o.s-sp)>o.r+2.4||Math.abs(o.lat-lt)>o.r+1.4)continue;
      let n9=o.lat+(lt>=o.lat?1:-1)*(o.r+1.8);if(Math.abs(n9)>HALF)n9=o.lat+(lt>=o.lat?-1:1)*(o.r+1.8);lt=n9;
    }
    if(BANQ.obst&&LVL.cur&&LVL.cur.id==='banquise')for(const o of BANQ.obst){ // (2026-10-17, GLACIER v4) jamais une pièce dans un pic de la piste
      if(Math.abs(o.s-sp)>o.r+3||Math.abs(o.lat-lt)>o.r+2)continue;let n9=o.lat+(lt>=o.lat?1:-1)*(o.r+3);if(Math.abs(n9)>HALF)n9=o.lat+(lt>=o.lat?-1:1)*(o.r+3);lt=n9;}
    if(BANQ.kick&&LVL.cur&&LVL.cur.id==='banquise')for(const k of BANQ.kick){if(sp<k.s-(k.lg||8)-3||sp>k.s+3||lt<k.l0-2||lt>k.l1+2)continue;let n9=lt-k.l0<k.l1-lt?k.l0-4:k.l1+4;if(Math.abs(n9)>HALF)n9=lt-k.l0<k.l1-lt?k.l1+4:k.l0-4;lt=n9;} // (2026-10-18) ni sous un tremplin
    return THREE.MathUtils.clamp(lt,-HALF,HALF);
  };
  // pose UNE pièce (mirroir deux faces, saute les trous, s'écarte des obstacles, clamp sur la route)
  const place=(sp,lt,isN,deux9)=>{
    if(sp<120||sp>L-50||enTrou(sp,6))return; // (LES TROUS) pas de pièce dans le vide entre deux segments
    frameAt(sp,F);mat4b.makeBasis(F.b,F.n,F.t);
    const cl=dodge(sp,lt);
    const fi=isN?fruitPick():-1; // MÊME fruit sur les deux faces (miroir strict) — tiré hors du rnd seedé
    const deux=!isN&&!!deux9; // (2026-11-05) une pièce sur trois est une 2 € ; (2026-11-09) tirée par le fil (motifs entiers en 2 €), la MÊME sur les deux faces
    const lv=isN?fruitLeve(fi):1.3; // les fruits : posés AU-DESSUS du bitume d'après leur vraie taille (voir fruitLeve)
    for(const face of [1,-1]){
      const m=isN?mkFruit(fi):pieceNeuve(); // (chasse aux gels) une pièce recyclée de la piste d'avant, ou neuve — un FANTÔME
      m.position.copy(F.p).addScaledVector(F.b,cl).addScaledVector(F.n,face>0?lv:-(THICK+lv));
      // SOUS la route, le fruit est RETOURNÉ (repère −b, −n, t) : sinon il pendait tête en bas, feuilles plantées dans la dalle
      if(isN&&face<0){mat4b.makeBasis(FLIP_B.copy(F.b).negate(),FLIP_N.copy(F.n).negate(),F.t);m.quaternion.setFromRotationMatrix(mat4b);mat4b.makeBasis(F.b,F.n,F.t);}
      else m.quaternion.setFromRotationMatrix(mat4b);
      if(!isN)m.rotateOnWorldAxis(F.n,sp*.11); /* (2026-11-11, LA VAGUE) chaque pièce part décalée d'un cran (≈ 44° tous les 7 m) : une file ne tourne plus en bloc, une ondulation la parcourt */
      m.updateMatrix();m.matrixAutoUpdate=false; // (perf) gelé : seuls les objets du couloir visible se recalculent (voir le LOD)
      if(isN)scene.add(m); // la pièce n'entre pas dans la scène : coinIM la dessine
      const pk={s:sp,lat:cl,face:face,nitro:isN,fruit:fi,mesh:m,taken:false,ax:F.n.clone().multiplyScalar(face),deux:deux};
      {const S9=serieEtat();if(!isN&&S9.g){pk.grp=S9.g;if(face>0)S9.tot[S9.g]=(S9.tot[S9.g]|0)+1;}} // (v5) la pièce appartient à SA série
      if(!isN){pk.ci=1;if(face>0&&sp<760)coinPose(pk);} // au MENU le LOD ne tourne pas : on montre d'emblée le couloir du départ
      pickups.push(pk);
    }
  };
  /* ---- LE FLUX DE PIÈCES SUIT LA PROGRESSION (2026-08-03) ----------------------------------
     ⚠ LE PROBLÈME : la densité était IDENTIQUE dans toutes les zones, alors que l'échelle des
     paliers ACCÉLÈRE (60, 125, 200 … 4385 pièces). Avec un flux constant, les premiers paliers
     tombaient en quelques secondes et le dernier tiers de la liste restait hors d'atteinte : on
     affichait 30 paliers pour n'en jouer qu'une dizaine.
     LE PRINCIPE : la route devient plus RICHE à mesure qu'on avance. Zone 1 = route maigre, il
     faut slalomer pour chaque pièce et les premiers paliers se méritent ; passé quelques portails
     les figures se resserrent et le débit suit la marche des paliers.
     COMMENT : on ne change pas les motifs (ils sont bons), on resserre les ESPACES entre eux. Un
     tapis de pièces uniforme serait plus dense mais moins intéressant à conduire.
     ⚠ `rnd` est la suite seedée de la piste : on SCALE des résultats, on n'ajoute ni ne retire
     aucun appel — sinon toute la génération en aval se décale (voir CLAUDE.md). */
  const rich=THREE.MathUtils.clamp(.88+(runStats.zones||0)*.52,.88,3.4); // maigre au départ, généreuse plus tard
  /* (2026-11-09, Sacha : « plus de pièces, des générations fun et variées, toutes récupérables d'un coup ») LE FIL DE PIÈCES (voir filPlan,
     gameplay/pieces-fil.js) remplace les cinq anciens motifs. Il a SON flux `rc`, dérivé du `rnd` de la piste par UN SEUL tirage : la même
     piste donne les mêmes pièces, et le reste de la fonction (pouvoirs) lit le `rnd` comme avant. Le flux d'or suit la progression
     (`rich`, voir plus haut) : ×2,2 de l'ancien au départ, ×1,8 vers la zone 2, ×1,2 en fin de partie (le plafond des motifs). Chaque
     motif est une SÉRIE (numéro posé sans toucher à `rnd`) ; le motif « libre » (3-5 pièces éparses, fruits) n'en est pas une. */
  const rc9=mulberry32((rnd()*4294967296)>>>0);
  const plan=filPlan(rc9,{L:L,HALF:HALF,STR:STR,rich:rich,fruits:!LIGNE.on,s0:200,
    bloque:(sp,lt)=>{ /* un obstacle (flaque, pic de la glace, tremplin) ou un trou : ni pièce, ni trajet de caisse entre deux pièces */
      if(enTrou(sp,8))return true;
      for(const o of OILS)if(o.face===1&&Math.abs(o.s-sp)<=o.r+2.6&&Math.abs(o.lat-lt)<=o.r+2.2)return true;
      if(LVL.cur&&LVL.cur.id==='banquise'){
        if(BANQ.obst)for(const o of BANQ.obst)if(Math.abs(o.s-sp)<=o.r+3.4&&Math.abs(o.lat-lt)<=o.r+2.4)return true;
        if(BANQ.kick)for(const k of BANQ.kick)if(sp>=k.s-(k.lg||8)-4&&sp<=k.s+4&&lt>=k.l0-2.5&&lt<=k.l1+2.5)return true;}
      return false;}});
  {let g9=0,id9=0;
   for(const c of plan){
     if(c.g!==g9){g9=c.g;id9=g9?++serieEtat().n:0;}
     serieEtat().g=id9;
     place(c.s,c.l,c.f,c.deux);}}
  serieEtat().g=0; // (v5) hors des motifs, plus de série
  // ---- FRUITS EN VOL — RETIRÉS (2026-09-25, demande du user : « rien à ramasser dans les airs »). Tout se
  // ramasse désormais AU SOL. ⚠ La boucle reste, à vide : `rnd` est la suite seedée de la piste, et
  // supprimer ses tirages décalerait toute la génération qui suit (portails, pouvoirs, tremplins).
  for(let ss=520+rnd()*700;ss<L-160;ss+=520+rnd()*760){
    frameAt(ss,F);mat4b.makeBasis(F.b,F.n,F.t);
    const fi=fruitPick(),n9=3+((rnd()*3)|0);
    const cote=(rnd()<.5?-1:1)*(rnd()<.45?0:1);          // au-dessus de l'axe, ou décalé sur un flanc
    const haut=9+rnd()*16;                                // à hauteur de saut, jamais hors de portée
    for(let k=0;k<n9;k++){
      const sp=ss+k*10,lt=cote*(6+rnd()*10),hh=haut+Math.sin(k/(n9-1||1)*Math.PI)*5; // en arc, comme un chapelet
      if(sp>L-60)continue;
      frameAt(sp,F);mat4b.makeBasis(F.b,F.n,F.t);
      void lt;void hh;void fi; // (plus rien n'est posé en l'air)
    }
  }
  // POUVOIRS : orbes rares, hautes et brillantes — on les voit de loin, on les vise (miroir deux faces, intervalle doublé)
  // (pouvoirs v2) CINQ pouvoirs tirés par `pwrTire` sur le MÊME tirage (poids selon l'expérience : voir pwrPoids) ; le 1er cristal
  // d'un débutant est un AIMANT (pwrPremier) — le BOUCLIER est retiré (29/09)
  const W9=pwrPoids();let prem9=pwrPremier();
  for(let ss=380+rnd()*260;ss<L-140;ss+=860+rnd()*760){
    let kind=pwrTire(rnd(),W9);
    let lt=(rnd()*2-1)*(ROAD_HALF-4);
    if(prem9){kind='m';prem9=false;lt*=.2;} // le 1er AIMANT d'un débutant est posé PRÈS DE L'AXE : il le prend sans le chercher
    if(PWR_LIGNE)continue; // (2026-10-20) les fruits-pouvoirs ne sont plus semés au hasard : ils tombent AU BOUT D'UNE LONGUE FILE de fruits (ligneTick) — tirages ci-dessus consommés, le flux seedé ne bouge pas
    if(LVL.cur&&LVL.cur.piste==='tuto')continue; // (2026-09-29, audit) PAS DE CRISTAUX À L'ÉCOLE : « AURA ×2 — CHAQUE FIGURE COMPTE DOUBLE » tombait en pleine consigne TOURNE (tirages consommés au-dessus : le flux ne bouge pas)
    frameAt(ss,F);
    mat4b.makeBasis(F.b,F.n,F.t);
    for(const face of [1,-1]){
      const m=mkPower(kind,face),lev9=m.userData.lev||2.1;
      m.position.copy(F.p).addScaledVector(F.b,lt).addScaledVector(F.n,face>0?lev9:-(THICK+lev9));
      if(face<0&&m.userData.fruit){mat4b.makeBasis(FLIP_B.copy(F.b).negate(),FLIP_N.copy(F.n).negate(),F.t);m.quaternion.setFromRotationMatrix(mat4b);mat4b.makeBasis(F.b,F.n,F.t);} // SOUS la route le fruit est RETOURNÉ (comme les fruits)
      else m.quaternion.setFromRotationMatrix(mat4b);
      m.updateMatrix();m.matrixAutoUpdate=false; // (perf) gelé, comme les pièces
      scene.add(m);
      pickups.push({s:ss,lat:lt,face:face,nitro:false,pow:kind,mesh:m,taken:false,ax:F.n.clone().multiplyScalar(face)});
    }
  }
  try{espFilsOr();}catch(e){}try{espAstPieces();}catch(e){} /* (v5.4) les pièces des modules des astéroïdes */ /* (2026-11-12) LES FILS D'OR DE L'ORBITE : la file de pièces du saut */
  try{spinPose();}catch(e){} /* (2026-10-14) LE FINAL SPIN : un jeton, rarement (voir SPIN) */
  coinFlush();
}
/* ===== LES FILS D'OR DE L'ORBITE (2026-11-12, L'ORBITE VERS L'AVANT — passation/ESPACE-GRAVITY.md § 4.2 : « une ligne de pièces dans l'axe du vol : c'est ce qui incite sans forcer ») =====
   Au-dessus de chaque lèvre de LA FAILLE, de LA CASCADE et des TERRASSES, et dans le prolongement de l'entrée du GRAND ÉCART, une file de pièces EN L'AIR (`p.air` : prises en vol
   seulement, à 30 m — le mécanisme des sentiers de lucioles) dessine le saut nitro : lancé à la croisière de conception de la piste, intégré comme le vrai vol (FALL_G × gK, le haut du
   monde : voir ESP_VOLM), jusqu'à sa pose sur la route. Pas de pose en vue avant 4,6 s (la jauge de vol tuerait) : pas de file. Qui roule voit l'or filer au-dessus du vide ; qui saute le
   cueille. `?filsor=0` = sans. */
const ESP_FILS=ESP_V3&&!/[?&]filsor=0\b/.test(location.search);
function espFilsOr(){
  if(!ESP_FILS||!espTordOn()||!TORD.on||!MODS||!MODS.length)return 0;
  const k=L/Math.max(1,NP-1),vc=(70+(lvPiste()-1)*100)/SPD,g=FALL_G*gK(),h=1/30,imN=VEQ_K.saut,P=new THREE.Vector3(),V=new THREE.Vector3(),D=new THREE.Vector3();let n=0;
  const iOf=function(s9){return Math.max(0,Math.min(NP-1,Math.round(s9/k)));};
  const vol=function(i,imp){ /* la trajectoire d'un vol parti de i (imp : l'impulsion du saut nitro, 0 = la sortie tout droit par le bord) : [{p, j}] tous les 1/30 s jusqu'à la pose, ou null (pas de pose en vue) */
    P.copy(pts[i]).addScaledVector(Nn[i],.6);V.copy(T[i]).multiplyScalar(vc).addScaledVector(Nn[i],imp);
    const t9=T[i],ux=-t9.y*t9.x,uy=1-t9.y*t9.y,uz=-t9.y*t9.z,ul=Math.sqrt(ux*ux+uy*uy+uz*uz)||1,Ur=uy<.04||(Nn[i].x*ux+Nn[i].y*uy+Nn[i].z*uz)/ul<.906?Nn[i]:null; /* (2026-11-13, L'ORBITE V5) le haut du vol, comme murRoule : la dalle quittée si elle est couchée de plus de 25° (la faille à l'envers), sinon le haut du monde */
    const out=[];let jc=i,sorti=false;
    for(let t=h;t<4.6;t+=h){if(Ur)V.addScaledVector(Ur,-g*h);else V.y-=g*h;P.addScaledVector(V,h*SPD);
      let bj=-1,bd=1e12;const j1=Math.min(NP-1,jc+Math.round(900/k));for(let j=jc;j<=j1;j+=4){const dd=P.distanceToSquared(pts[j]);if(dd<bd){bd=dd;bj=j;}} /* la dalle la plus proche, devant */
      for(let j=Math.max(jc,bj-4);j<=Math.min(NP-1,bj+4);j++){const dd=P.distanceToSquared(pts[j]);if(dd<=bd){bd=dd;bj=j;}}
      if(bj<0)return null;if(bj>jc+Math.round(60/k))jc=bj-Math.round(60/k);
      D.subVectors(P,pts[bj]);const hh=D.dot(Nn[bj]),la=Math.abs(D.dot(B[bj]));out.push({p:P.clone(),j:bj,t:t});
      if(hh>6||la>ROAD_HALF+2)sorti=true;
      if(sorti&&t>.4&&la<ROAD_HALF&&hh<1.5&&hh>-4)return out;
      if(hh<-60&&la<ROAD_HALF*4)return null;}
    return null;};
  const pose=function(arc){const tf=arc[arc.length-1].t;let der=null,c=0;
    for(const a of arc){if(a.t<.35||a.t>tf-.3)continue;if(der&&a.p.distanceTo(der)<16)continue;if(++c>14)break;der=a.p;
      const m=pieceNeuve();m.position.copy(a.p);mat4b.makeBasis(B[a.j],Nn[a.j],T[a.j]);m.quaternion.setFromRotationMatrix(mat4b);m.rotateOnWorldAxis(Nn[a.j],a.t*2.2);m.updateMatrix();m.matrixAutoUpdate=false;
      pickups.push({s:a.j*k,lat:0,face:1,nitro:false,fruit:-1,mesh:m,taken:false,ax:Nn[a.j].clone(),deux:false,ci:1,air:1});n++;}};
  for(const m of MODS){const f=m.fig;if(f!=='faille'&&f!=='cascade'&&f!=='terrasses'&&f!=='ecart'&&f!=='faille-envers')continue;const a=iOf(m.s0+60),b=iOf(m.s1),Nr=Nn[a],Tr=T[a];
    if(f==='faille-envers'){const d=Math.round(25/k);for(let i=a;i<b-d;i++)if(Nn[i].y<-.3&&T[i+d].dot(Nn[i])<-.1){const arc=vol(Math.max(a,i-Math.round(10/k)),imN);if(arc)pose(arc);break;}continue;} /* (2026-11-13, L'ORBITE V5) LA FAILLE À L'ENVERS : sa lèvre se lit dans le repère de la dalle retournée (la route plonge sous elle) — la première seulement */
    if(f==='ecart'){for(let i=a;i<b;i++)if(T[i].dot(Tr)<.9976){const arc=vol(i,0);if(arc)pose(arc);break;}continue;} /* l'écart : la sortie TOUT DROIT par le bord (le geste mesuré), pas le saut nitro */
    const d=Math.round(25/k);let der=-1e9;
    for(let i=a;i<b-d;i++){const p0=T[i].dot(Nr),p1=T[i+d].dot(Nr);if(p0>-.12&&p0<.06&&p1<p0-.1&&(i-der)*k>150){der=i;const arc=vol(Math.max(a,i-Math.round(10/k)),imN);if(arc)pose(arc);}}}
  return n;}
function espAstPieces(){ /* (v6) LES PIÈCES DES GÉANTS — dans la fronde et la ceinture, entre la route et chaque géant (qui vole de ce côté les cueille) : en l'air (`air` : prises en vol, à 30 m, comme les fils d'or) */
  if(!ESP_FILS||!MODS||!MODS.length||!(LVL.cur&&LVL.cur.id==='espace'))return 0;let n=0;
  const piece=function(s9,lat,h){if(s9<120||s9>L-60)return;frameAt(s9,F);const m=pieceNeuve();m.position.copy(F.p).addScaledVector(F.b,lat).addScaledVector(F.n,h);mat4b.makeBasis(F.b,F.n,F.t);m.quaternion.setFromRotationMatrix(mat4b);m.rotateOnWorldAxis(F.n,s9*.11);m.updateMatrix();m.matrixAutoUpdate=false;
    pickups.push({s:s9,lat:lat,face:1,nitro:false,fruit:-1,mesh:m,taken:false,ax:F.n.clone(),deux:false,ci:1,air:1});n++;};
  for(const m of MODS){if(!m.nu||(m.fig!=='ceinture'&&m.fig!=='fronde'))continue;for(const q of m.nu)if(q.t==='geant'){const ep=q.k==='epave';for(let j=-1;j<=1;j++)piece(q.s+j*26,q.s9*(ep?ROAD_HALF*.5:ROAD_HALF+14),(ep?13:9)+3*Math.abs(j));}} /* (2026-11-13) l'ÉPAVE : ses pièces DANS le hangar (à côté, elles tombaient dans la coque) */
  return n;}
window.dbgFilsOr=function(){let n=0,pr=0;for(const p of pickups)if(p.air&&p.ci){n++;if(p.taken)pr++;}return {on:ESP_FILS,pieces:n,prises:pr};}; /* (banc) les pièces des fils d'or de la piste en cours */
