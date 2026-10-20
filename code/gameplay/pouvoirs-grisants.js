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
  if(!reprise){showMsg(d.msg,d.tint);trickMsg((d.ico?d.ico+' ':'')+TR(d.hud),2);} // (#msg et #trickBox : desktop seulement)
  /* (2026-10-15, Sacha : « trop d'info affichée ») plus de NOM au centre non plus : la plaque du pouvoir, à droite, le dit (voir <style id="hudAllege">) */
  if(!SONV2)boostSnd();pwrPrisSnd(k); // (console) chaque pouvoir a sa signature entière : plus le souffle d'un pad dessous
 shake=Math.max(shake,.35);flashEcran(d.fx);hap([14,40,24]);
  sparkBurst(d.sp==='bleu'?sparkBlue:d.sp==='rose'?sparkPink:sparkGold,pos,14,9); // là où le cristal éclate
  addStyle(10);RUNX.pwr=(RUNX.pwr|0)+1;
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
function pieceNeuve(){const m=PIECES_LIBRES.pop();if(m){m.visible=true;m.scale.set(1,1,1);return m;}
  const n=new THREE.Object3D();n.userData.pi=1;return n;} // (2026-09-28) un FANTÔME : l'or est peint par coinIM (voir plus bas)
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
coinIM.frustumCulled=false;coinIM.matrixAutoUpdate=false;coinIM.instanceMatrix.setUsage(THREE.DynamicDrawUsage);coinIM.count=0;scene.add(coinIM);
let coinN=0;
function coinPose(p){if(coinN<COIN_CAP)coinIM.setMatrixAt(coinN++,p.mesh.matrix);} // une pièce du couloir, rangée en tête
function coinFlush(){const a=coinIM.instanceMatrix;coinIM.count=coinN;
  a.updateRange.offset=0;a.updateRange.count=Math.max(1,coinN)*16;a.needsUpdate=true;coinN=0;}
function spawnPickups(rnd){
  sceneRetire(pickups.map(function(p){return p.mesh;})); // (chasse aux gels) d'un seul passage : un par un, c'était ~15 ms par portail (voir sceneRetire)
  for(const p of pickups){const m9=p.mesh;if(m9&&m9.userData.pi===1&&!m9.parent)PIECES_LIBRES.push(m9);} // (chasse aux gels) nos pièces, hors scène, se recyclent
  pickups.length=0;coinN=0;{const S9=serieEtat();S9.n=0;S9.g=0;S9.tot.length=0;S9.got={};}
  if(BALADE){coinFlush();return;} // (2026-10-09) LA BALADE : rien à ramasser, que la route // (v5) les séries repartent de zéro
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
  const place=(sp,lt,isN)=>{
    if(sp<120||sp>L-50)return;
    frameAt(sp,F);mat4b.makeBasis(F.b,F.n,F.t);
    const cl=dodge(sp,lt);
    const fi=isN?fruitPick():-1; // MÊME fruit sur les deux faces (miroir strict) — tiré hors du rnd seedé
    const lv=isN?fruitLeve(fi):1.3; // les fruits : posés AU-DESSUS du bitume d'après leur vraie taille (voir fruitLeve)
    for(const face of [1,-1]){
      const m=isN?mkFruit(fi):pieceNeuve(); // (chasse aux gels) une pièce recyclée de la piste d'avant, ou neuve — un FANTÔME
      m.position.copy(F.p).addScaledVector(F.b,cl).addScaledVector(F.n,face>0?lv:-(THICK+lv));
      // SOUS la route, le fruit est RETOURNÉ (repère −b, −n, t) : sinon il pendait tête en bas, feuilles plantées dans la dalle
      if(isN&&face<0){mat4b.makeBasis(FLIP_B.copy(F.b).negate(),FLIP_N.copy(F.n).negate(),F.t);m.quaternion.setFromRotationMatrix(mat4b);mat4b.makeBasis(F.b,F.n,F.t);}
      else m.quaternion.setFromRotationMatrix(mat4b);
      m.updateMatrix();m.matrixAutoUpdate=false; // (perf) gelé : seuls les objets du couloir visible se recalculent (voir le LOD)
      if(isN)scene.add(m); // la pièce n'entre pas dans la scène : coinIM la dessine
      const pk={s:sp,lat:cl,face:face,nitro:isN,fruit:fi,mesh:m,taken:false,ax:F.n.clone().multiplyScalar(face)};
      {const S9=serieEtat();if(!isN&&S9.g){pk.grp=S9.g;if(face>0)S9.tot[S9.g]=(S9.tot[S9.g]|0)+1;}} // (v5) la pièce appartient à SA série
      if(!isN){pk.ci=1;if(face>0&&sp<760)coinPose(pk);} // au MENU le LOD ne tourne pas : on montre d'emblée le couloir du départ
      pickups.push(pk);
    }
  };
  /* ---- LE FLUX DE PIÈCES SUIT LA PROGRESSION (2026-08-03) ----------------------------------
     ⚠ LE PROBLÈME : la densité était IDENTIQUE dans toutes les zones, alors que l'échelle des
     paliers ACCÉLÈRE (5, 12, 21 … 2854 pièces). Avec un flux constant, les premiers paliers
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
  // les respirations se resserrent quand la route s'enrichit. ⚠ Les motifs s'allongent de STR mais l'AVANCE d'un motif au suivant se
  // compte sur leur longueur d'ORIGINE (`/STR` ci-dessous) : le NOMBRE de pièces par zone ne bouge pas (l'économie de ce jeu est
  // calée dessus — mesuré au banc, écart < 2 %), seule leur lisibilité à haute vitesse change.
  const esp=v=>v/rich;
  let ss=200;
  while(ss<L-90){
    if(rnd()<.24/rich){ss+=esp(120+rnd()*160);continue;} // PORTIONS VIDES : plus rares quand ça s'enrichit
    const pat=rnd();
    serieEtat().g=pat<.80?++serieEtat().n:0; // (v5) zigzag, arc, cercle, jackpot : une SÉRIE ; l'éparpillé n'en est pas une
    if(pat<.30){ // ZIGZAG : serpente franchement d'un bord à l'autre (il FAUT slalomer pour tout prendre)
      const n=5+((rnd()*4)|0),amp=HALF*(.7+rnd()*.3),ph=1.1+rnd()*1.3,st=(10+rnd()*4)*STR;
      for(let i=0;i<n;i++)place(ss+i*st,Math.sin(i*ph)*amp,rnd()<.34&&!LIGNE.on);
      ss+=esp(n*st/STR+70+rnd()*50);
    }else if(pat<.52){ // ARC : une vague vers un côté puis retour
      const n=5+((rnd()*4)|0),amp=HALF*(.75+rnd()*.25),sd=rnd()<.5?-1:1,st=(11+rnd()*4)*STR;
      for(let i=0;i<n;i++){const u=i/(n-1);place(ss+i*st,sd*amp*Math.sin(u*Math.PI),rnd()<.34&&!LIGNE.on);}
      ss+=esp(n*st/STR+70+rnd()*50);
    }else if(pat<.70){ // CERCLE : un anneau posé à plat (il faut le contourner pour le boucler)
      const R=Math.min(HALF,5.5+rnd()*4),n=8+((rnd()*4)|0),Rs=R*STR; // (étiré dans le sens de la route à haute vitesse : une ellipse qu'on lit)
      for(let i=0;i<n;i++){const th=i/n*6.2832;place(ss+Rs+Rs*Math.sin(th),R*Math.cos(th),false);}
      ss+=esp(2*R+80+rnd()*50);
    }else if(pat<.80){ // JACKPOT : RARE — ligne dense, gros combo à rafler d'un coup (la récompense du slalom)
      const n=12+((rnd()*6)|0),st=6*STR;
      for(let i=0;i<n;i++)place(ss+i*st,Math.sin(i*.55)*2.4,false);
      ss+=esp(n*st/STR+140+rnd()*80); // suivi d'un grand vide : le jackpot se paie cher en distance
    }else{ // ÉPARPILLÉ : deux-trois pièces libres, largement espacées
      const n=2+((rnd()*3)|0),st=(20+rnd()*18)*STR;
      for(let i=0;i<n;i++)place(ss+i*st,(rnd()*2-1)*HALF,rnd()<.45&&!LIGNE.on); // (2026-09-29) les fruits vivent sur LA LIGNE PARFAITE (le tirage reste consommé)
      ss+=esp(n*st/STR+60+rnd()*50);
    }
  }
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
  try{spinPose();}catch(e){} /* (2026-10-14) LE FINAL SPIN : un jeton, rarement (voir SPIN) */
  coinFlush();
}
