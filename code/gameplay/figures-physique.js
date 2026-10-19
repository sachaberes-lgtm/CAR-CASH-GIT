/* ===== LES FIGURES v2 — LA PHYSIQUE (2026-10-14, Sacha : « refonte totale du système de figures : on doit pouvoir en équiper jusqu'à 3,
   mais c'est surtout la PHYSIQUE qui doit être exceptionnelle et super fun ; quand on est dans les airs la voiture garde l'inertie de son
   mouvement » · « inspiration Asphalt 8 : les figures dans les airs rapportent du nitro, et de l'aura en les cumulant comme un jeu de BMX —
   front flip, spin ×2… — si tu te poses » · « le double-tap n'exécute pas juste une animation, ça donne une IMPULSION : le front flip, une
   petite explosion au niveau des roues arrière qui propulse l'arrière vers l'avant ; la figure d'après, un spin, s'ADDITIONNE à l'impulsion
   du front flip, de manière fun, réaliste et jouissive »).
   Le moteur vit dans figures.js (`FIG.Corps` : l'état, les explosions, l'inertie, la prise, le planté — voir son commentaire). Ici, le jeu :
   · TROIS EMPLACEMENTS — DEUX depuis le 15/10 (`FIG_NB`, Sacha : « 2 figures à la fois, pas 3 ») — (`SAVE.d.figEq`, `figEquipees`, `figEquipe`, `figRetire`) : on choisit à l'inventaire (onglet FIGURES : toucher =
     équiper / retirer, le numéro de l'emplacement sur la tuile) ou à la boutique (ÉQUIPER) ; pleins, la plus ancienne laisse sa place. Jamais
     choisis : le TONNEAU + les deux dernières achetées.
   · EN VOL, TROIS BOUTONS — RETIRÉS le 15/10 : le double-tap NITRO + le joystick choisit l'emplacement (`FDIR`, `?figdir=0` les rend) — (`#tFig`, à côté de NITRO ; au clavier 1 · 2 · 3) : toucher = l'EXPLOSION de la figure ; TENIR = la poussée
     continue (la toupie accélère : ×2, ×3…), lâcher = elle va se planter. Le double-tap NITRO joue l'emplacement suivant ; au sol, il fait
     le SAUT NITRO et sa figure. Toupies et tonneaux partent du côté où l'on braque (sinon, chacun son tour).
   · L'INERTIE (`figMemo`, `figDepart`) : au décollage la caisse EMPORTE son écart à la trajectoire et sa rotation de route, mesurée entre ses
     deux dernières images de conduite (le lacet du virage, la crête qui fait plonger le nez, la route qui vrille), moins la rotation du vol
     lui-même — elle continue de tourner, se balance, se range (l'air : `FIG.PHY.aero`). Un DRIFT qui décolle part en TOUPIE DE DRIFT (le flat
     spin d'Asphalt 8) si le vol est assez long. La sortie par le BORD garde la bascule de Léo (VEQ), qui a sa physique à elle.
   · LES EXPLOSIONS (`figBoum`, `figJet`) : la flamme au point qui pousse, le souffle à l'opposé, une gerbe d'or, la secousse ; une poussée vers
     le haut donne un petit coup de rein (un peu de vol en plus, jamais vers le bas). Tenue : le jet brûle et le son monte.
   · LA PAIE (`figPaye`) : une figure PLANTÉE (revenue à l'endroit) entre dans la chaîne d'aura avec ses tours (TOUPIE 360 ×2 : son aura
     × 2,25) et rend du NITRO tout de suite (`NITRO2.figAir`, de moins en moins dans un même vol). Comme au BMX, l'aura n'est GAGNÉE qu'à la
     pose : posée en plein tour (> 52°), c'est la CHUTE — les figures de ce vol quittent la chaîne (`figChute`) et le flow tombe.
   Console : `dbgFig()`. */
const FIGV2={on:true}; // les figures v2 (la physique) sont les SEULES : plus de lecteur de Léo (?fig=ancien) ni de figures libres (?fig=libre)
if(window.FIG&&FIG.PHY&&/[?&]elan=0/.test(location.search))FIG.PHY.elan=false; // (2026-10-15 soir, Sacha : « là, on dirait une animation ») L'ÉLAN de figures.js (le coup, la glissade freinée par l'air, le retour souple) ; ?elan=0 = la physique d'avant (prise sèche, planté)
function figDose(f,bud){return window.FIG&&FIG.PHY&&FIG.PHY.elan?Math.min(f.D*1.35,(bud-.35)*.72):Math.min(f.D,(bud-.3)/.85);} // (LE COUP NET) la durée d'une figure : elle OCCUPE le saut — 72 % du vol qui reste (moins la pose), jusqu'à 1,35 × sa durée de catalogue (avant : bouclée en 0,35 s, puis la caisse à plat les deux tiers du saut)
const FIG_NB=3; // (2026-10-15, Sacha : « on doit pouvoir sélectionner seulement 2 figures à la fois, pas 3 » — puis le soir, avec la direction ARRIÈRE : « 3, une par geste ») — les EMPLACEMENTS : ↑ avant (1), ↓ arrière (2), ◄► côté (3)
const FX2={corps:window.FIG&&FIG.Corps?new FIG.Corps():null,slots:[null,null,null],tenus:[false,false,false],ptr:[null,null,null],btOn:[false,false,false],bts:null,
  cv:{n:0,dist:0,ids:{},noms:[],cle:'',finT:0},redP:0,cyc:0,sensAlt:1,nPay:0,nitF:0,nitL:0,pts:0,aura:0,deriveArm:0,drift:false,driftS:1,qm0:new THREE.Quaternion(),qm1:new THREE.Quaternion(),dm:0,memo:false,memoN:false,
  qf:new THREE.Quaternion(),qr:new THREE.Quaternion(),qd:new THREE.Quaternion(),m4:new THREE.Matrix4(),v:new THREE.Vector3(),d:new THREE.Vector3(),
  n:0,payees:0,chutes:0,vis:null,cle:'',wPose:0,jetS:0,herite:null,img:0,att:null,redresse:0};
/* UN EMPLACEMENT PAR DIRECTION (2026-10-15, Sacha : « séparer les figures qui se font sur les côtés de celles qui se font vers l'avant ; dans
   la boutique, classe toutes les figures selon ces deux catégories » · puis « mets aussi une catégorie vers l'ARRIÈRE ; une même figure doit
   avoir marqué à quelle direction elle peut aller : le tonneau, c'est que les côtés, mais le rodéo peut être mis à l'avant ou à l'arrière »
   · « 3, une par geste »). Les directions d'une figure viennent de figures.js (`FIG.dirs`) ; trois emplacements, un par geste du double-tap
   NITRO : ↑ pouce en AVANT (0), ↓ pouce en ARRIÈRE (1), ◄► pouce sur un CÔTÉ (2, elle part de ce côté). Une figure ne va que dans un
   emplacement qu'elle accepte (`figPeut`) ; une figure à deux sens (rodéo, tire-bouchon, cosmique) peut tenir l'avant ET l'arrière — le geste
   choisit alors le sens de son salto (`FIG.oriente`). Équiper prend la place de celle de CET emplacement, jamais d'un autre.
   `SAVE.d.figEq3` = les trois id, à leur place ('' = vide) ; une sauvegarde d'avant (`figEq`, deux id) se range d'elle-même : chaque figure
   dans la 1re direction libre qu'elle accepte. Un emplacement vide se remplit avec la dernière figure possédée qui y va (une qui n'est pas
   déjà ailleurs d'abord) ; le côté a toujours au moins le TONNEAU (offert) — depuis le 15/10, le TAIL WHIP.
   Un emplacement vide : son geste ne fait RIEN (le refus, `o.strict`) — Sacha : « le tonneau est typiquement une figure latérale ». Deux
   exceptions, qui ne sont pas le geste du joueur : l'étape FIGURE de l'auto-école (« tape 2 fois NITRO », pouce au repos — un débutant n'a
   que le tonneau, la leçon serait bloquée) et la figure AUTOMATIQUE du saut nitro au sol : elles prennent un emplacement qui existe. */
const FIG_DIR=['avant','arriere','cote'];
const FIG_FAM=[["VERS L'AVANT",'POUCE EN AVANT','haut'],["VERS L'ARRIÈRE",'POUCE EN ARRIÈRE','bas'],['SUR LES CÔTÉS','POUCE À GAUCHE OU À DROITE','fleches']]; // le nom de chaque direction, le geste qui la joue, son pictogramme (ceux du rappel #fhLeg)
function figPeut(id){const f=window.FIG&&FIG.par[id];if(!f||!FIG.dirs)return [2]; // les emplacements que la figure accepte (0 avant · 1 arrière · 2 côté)
  return FIG.dirs(f).map(function(d){return FIG_DIR.indexOf(d);}).filter(function(i){return i>=0;});}
/* ranger les figures L (de la plus récente à la plus ancienne) dans les emplacements VIDES de S : d'abord celles à UN sens, puis celles à deux
   sens qui ne sont pas déjà ailleurs, puis (reuse) n'importe laquelle qui y va — avec SALTO AVANT + RODÉO, le salto devant, le rodéo derrière
   (MESURÉ au banc Node : rangé dans l'ordre, le rodéo prenait les deux places et le salto disparaissait) */
function figRange(S,L,reuse){for(let passe=0;passe<(reuse?3:2);passe++)for(let k=0;k<FIG_NB;k++)if(S[k]==null)
  for(let i=0;i<L.length;i++){const P=figPeut(L[i]);if(P.indexOf(k)>=0&&(passe===2||(S.indexOf(L[i])<0&&(passe===1||P.length===1)))){S[k]=L[i];break;}}
  return S;}
function figSlots(){if(!window.FIG)return [null,null,'tailwhip'];
  const own=function(id){return !!FIG.par[id]&&figPossede(id);},S=[null,null,null],E3=SAVE.d.figEq3;
  if(Array.isArray(E3)){for(let k=0;k<FIG_NB;k++){const id=E3[k];if(id&&own(id)&&figPeut(id).indexOf(k)>=0)S[k]=id;}}
  else if(Array.isArray(SAVE.d.figEq))figRange(S,SAVE.d.figEq.filter(own).reverse(),false); // une sauvegarde d'avant les trois directions
  if(S[0]==null||S[1]==null||S[2]==null){figRange(S,(cousin()?FIG.liste.map(function(f){return f.id;}):(Array.isArray(SAVE.d.figs)?SAVE.d.figs.slice():[])).filter(own).reverse(),true);
    if(S[2]==null)S[2]='tailwhip';} // (2026-10-15) le côté a toujours au moins le TAIL WHIP (offert)
  return S;}
function figEquipees(){return figSlots().filter(function(id,i,S){return id&&S.indexOf(id)===i;});} // les figures équipées (une fois chacune), l'avant d'abord
/* équiper `id` dans l'emplacement k (0-2) ; sans k (l'inventaire) : le 1er qu'elle accepte et qui ne l'a pas déjà, un vide d'abord */
function figEquipe(id,k){if(!window.FIG||!FIG.par[id]||!figPossede(id))return null;const S=figSlots(),P=figPeut(id);
  if(k==null||P.indexOf(k)<0){k=null;for(let j=0;j<P.length&&k==null;j++)if(S[P[j]]==null)k=P[j];for(let j=0;j<P.length&&k==null;j++)if(S[P[j]]!==id)k=P[j];if(k==null)return {deja:true,slot:P[0]};}
  if(S[k]===id)return {deja:true,slot:k};
  const parti=S[k];S[k]=id;SAVE.d.figEq3=S.map(function(x){return x||'';});SAVE.d.figEq=figEquipees().slice(0,2);SAVE.flush();FX2.cle='';return {parti:parti,slot:k};}
function figMemo(dt){FX2.qm1.copy(FX2.qm0);FX2.qm0.copy(carGroup.quaternion);FX2.dm=dt;FX2.memo=FX2.memoN;FX2.memoN=true;} // (conduite, chaque image) l'assiette des deux dernières images
function figDepart(bord){const C=FX2.corps;FX2.memoN=false;FX2.herite=null;FX2.nitF=0;FX2.nitL=0; /* (loi 6) un vol neuf : rien à rendre */if(!C)return;
  C.vide();FX2.slots[0]=FX2.slots[1]=FX2.slots[2]=null;FX2.nPay=0;FX2.pts=0;if(FX2.cv.cle!=='fin')figCvRaz();else{FX2.cv.n=0;FX2.cv.dist=0;FX2.cv.ids={};FX2.cv.noms.length=0;}FX2.redP=0;FX2.trio=[]; /* (COMBOS À TROIS : un vol neuf, un trio neuf) */FX2.deriveArm=0;FX2.img=0;FX2.att=null;CAMV.eta=99; // (le viseur de l'image d'avant date du vol précédent)
  if(!FIGV2.on||bord||!VEQ.on){FX2.memo=false;return;} // le BORD garde la bascule de Léo (VEQ)
  tmp.copy(fallVel).normalize();FX2.m4.makeBasis(FLY_R,FLY_U,tmp);FX2.qf.setFromRotationMatrix(FX2.m4);
  FX2.qr.copy(FX2.qf).invert().multiply(carGroup.quaternion); // l'écart de la caisse à sa trajectoire : elle l'EMPORTE
  const w=[0,0,0];
  if(FX2.memo&&FX2.dm>0&&FX2.dm<.1){const d=FX2.qd.copy(FX2.qm1).invert().multiply(FX2.qm0); // ce qu'elle a tourné à la dernière image, dans SON repère
    if(d.w<0){d.x=-d.x;d.y=-d.y;d.z=-d.z;d.w=-d.w;}const s9=Math.hypot(d.x,d.y,d.z),a9=2*Math.atan2(s9,d.w);
    if(s9>1e-7&&a9<.5){const k9=a9/s9/FX2.dm;w[0]=d.x*k9;w[1]=d.y*k9;w[2]=d.z*k9;}}
  const v2=fallVel.lengthSq();if(v2>4)w[0]-=FALL_G*gK()*volH(fallVel)/v2; // …moins la rotation du VOL lui-même (la trajectoire plonge, le repère la suit) : on garde l'élan RELATIF
  FX2.memo=false;
  C.herite([FX2.qr.x,FX2.qr.y,FX2.qr.z,FX2.qr.w],w);FX2.herite=w.map(function(x){return +x.toFixed(2);});
  VEQ.qb.copy(FX2.qf); // (le vol équilibré de Léo) son assiette lissée part de celle du VOL : l'écart est dans le corps, il ne compte pas deux fois
  if(FX2.drift)FX2.deriveArm=w[1]>.15?1:w[1]<-.15?-1:FX2.driftS; // LA TOUPIE DE DRIFT : armée — lancée quand on sait combien de temps on vole
}
function figCoup(k,auto){k=Math.min(1.5,k); // l'explosion se SENT : le son, la main, la caméra
  try{if(SONV2)sfx('fig.explose',{var:k>.95?1:0,vol:-4+4*Math.min(1,k)});}catch(e){} /* (2026-10-14, session SON — étape 3) l'explosion de figure a SON son (avant : turbo.super / turbo.mini, ceux du drift) */
  hap(auto?[8,16]:[12,26,12]);shake=Math.max(shake,.16+.14*k);fovPunch=Math.max(fovPunch,3+3*k);}
function figPoint(e){const sp=CARS[level]||CARS[0],hc=(sp.h||1.3)*.5; // le point d'explosion (repère caisse normé → monde) et sa poussée (monde)
  FX2.v.set(e.p[0]*sp.w*.5,hc+e.p[1]*hc,e.p[2]*sp.l*.5);carGroup.localToWorld(FX2.v);FX2.d.set(e.f[0],e.f[1],e.f[2]).applyQuaternion(carGroup.quaternion);}
function figBoum(e){const k=Math.min(1.6,e.k||1),n=Math.round(18+20*k),vx=fallVel.x*SPD*.86,vy=fallVel.y*SPD*.86,vz=fallVel.z*SPD*.86;figPoint(e);
  for(let i=0;i<n;i++){const s9=8+Math.random()*16*k; // LE SOUFFLE part à l'OPPOSÉ de la poussée, et suit un peu la caisse (sinon il resterait planté dans le ciel)
    spawnP(i%2?flames:flameCore,FX2.v.x,FX2.v.y,FX2.v.z,vx-FX2.d.x*s9+(Math.random()-.5)*6,vy-FX2.d.y*s9+(Math.random()-.5)*6,vz-FX2.d.z*s9+(Math.random()-.5)*6,.14+Math.random()*.2);}
  // L'ANNEAU : l'onde de l'explosion s'étale dans le plan perpendiculaire à la poussée (on VOIT que ça a pété là, pas un pot d'échappement)
  tmp2.set(FX2.d.y,-FX2.d.x,0);if(tmp2.lengthSq()<.04)tmp2.set(0,FX2.d.z,-FX2.d.y);tmp2.normalize();tmp3.crossVectors(FX2.d,tmp2).normalize();
  for(let j=0,nb=Math.round(10+6*k);j<nb;j++){const a=j/nb*6.2832,c=Math.cos(a),s9=Math.sin(a),v=10+6*k;
    spawnP(j%2?embers:flameCore,FX2.v.x,FX2.v.y,FX2.v.z,vx+(tmp2.x*c+tmp3.x*s9)*v-FX2.d.x*3,vy+(tmp2.y*c+tmp3.y*s9)*v-FX2.d.y*3,vz+(tmp2.z*c+tmp3.z*s9)*v-FX2.d.z*3,.16+Math.random()*.08);}
  sparkBurst(sparkGold,FX2.v,Math.round(8+8*k),12);
  {const du9=volVu(FX2.d);if(du9>.2&&mode==='fall')volMonte(fallVel,du9*2.4*k);} // le COUP DE REIN : poussée vers le haut, un peu de vol en plus
}
function figJet(r,dt){const n=emiN('figJet',dt),vx=fallVel.x*SPD*.85,vy=fallVel.y*SPD*.85,vz=fallVel.z*SPD*.85; // la poussée TENUE : le jet brûle tant qu'on tient
  for(let b=0;b<r.boums.length;b++){figPoint(r.boums[b]);
    for(let i=0;i<n*2;i++){const s9=12+Math.random()*10;spawnP(i%2?flames:flameCore,FX2.v.x,FX2.v.y,FX2.v.z,vx-FX2.d.x*s9+(Math.random()-.5)*2.5,vy-FX2.d.y*s9+(Math.random()-.5)*2.5,vz-FX2.d.z*s9+(Math.random()-.5)*2.5,.06+Math.random()*.08);}}
  FX2.jetS+=dt;if(FX2.jetS>.28){FX2.jetS=0;try{if(SONV2)sfx('nitrooo.palier',{vol:-10,st:echSt()});}catch(e){}}} // le son MONTE pendant que ça accélère
/* LE TEMPS QU'IL RESTE EN L'AIR : le viseur (CAMV.eta) — sauf quand la caisse S'ÉLOIGNE encore de la route : au décollage elle est à 60 cm
   du bitume et le viseur, qui cherche la dalle à moins de 3 m, annonçait une pose dans 0,12 s (MESURÉ au banc : le salto du saut nitro était
   annulé à la 1re image, ou ne partait pas). Tant qu'elle s'éloigne de SA dalle (le radar de tryLand), c'est la parabole qui compte, le long de
   la normale de la route : le temps d'y revenir (plané nitro compris). */
function figBudget(){let vn,gn,h;
  /* (relecture, MESURÉ au banc du jeu fusionné : un saut nitro sur deux finissait en CHUTE) le max(viseur, parabole) gardait la parabole quand la
     ROUTE REMONTE devant : la pose arrivait plus tôt que prévu et la prise n'avait plus le temps. Le viseur intègre la vraie trajectoire contre la
     vraie route : il fait FOI — sauf tant qu'il voit encore la dalle qu'on vient de quitter (moins de 0,35 s de vol et une pose « dans 0,12-0,36 s »,
     la fenêtre où tryLand ne pose de toute façon pas). Sans pose en vue : la parabole si l'on s'éloigne de la route, sinon 9 s. */
  const raw=CAMV.eta<90?Math.max(0,+CAMV.eta):-1,faux=raw>=0&&fallTR<.35&&raw<=.36;
  if(raw>=0&&!faux)return raw;
  const e=9,i=VEQ.si;
  if(i>=0&&Nn[i]){const n=Nn[i],sd=VEQ.sh>-THICK*.5?1:-1;vn=fallVel.dot(n)*sd;gn=FALL_G*gK()*Math.max(.2,volVu(n)*sd);h=Math.max(0,sd>0?VEQ.sh:-THICK-VEQ.sh)/SPD;}
  else{vn=volVu(fallVel);gn=FALL_G*gK();h=Math.max(0,fallPos.y-lastNearY)/SPD;}
  if(!(vn>1))return faux?.4:e;if(nitroOn)gn*=nitroBlue?.25:.4;
  return (vn+Math.sqrt(vn*vn+2*gn*h))/gn;}
/* (2026-10-14, session SON) LA MATIÈRE DU TOUR : chaque axe a son souffle, accordé sur la gamme du vol — x tangage = fig.salto (le wouomp qui passe par-dessus), y lacet = fig.toupie (le frrrt qui tournoie à plat), z roulis = fig.tonneau (l'air qui s'enroule d'une oreille à l'autre) ; un axe penché prend sa composante la plus forte */
function figMat(a){const x=Math.abs(a[0]),y=Math.abs(a[1]),z=Math.abs(a[2]);return x>=y&&x>=z?'fig.salto':y>=z?'fig.toupie':'fig.tonneau';}
function figPose(dt){const C=FX2.corps;if(!C)return; // en vol, chaque image, une fois l'assiette de vol posée (veqCorps) : le CORPS tourne par-dessus, autour du MILIEU de la caisse
  if(gameOver||mode!=='fall'){C.vide();return;}
  FX2.img++;C.budget=figBudget();C.poseK=VEQ.pose;
  if(FX2.att&&FX2.img>=2){const a=FX2.att;FX2.att=null;figLance(a.s,a.o);} // la figure demandée À L'IMAGE DU DÉCOLLAGE part maintenant que le viseur a mesuré le vol
  if(FX2.deriveArm&&window.FIG&&FIG.auto&&(CAMV.eta<90||fallTR>.1)){const s9=FX2.deriveArm;FX2.deriveArm=0; // la TOUPIE DE DRIFT : seulement si on a le temps de la planter
    if(C.budget>.95&&C.occupe()<3){C.lance(FIG.auto.derive,s9,Math.min(1.05,Math.max(.62,(C.budget-.3)/.85)),{vise:true,douce:true});C.evts.length=0; // pas d'explosion : c'est le DRIFT qui la lance — une bouffée de gomme aux roues arrière
      const sp9=CARS[level]||CARS[0];for(const sd of [-1,1]){FX2.v.set(sd*sp9.w*.45,.3,-sp9.l*.38);carGroup.localToWorld(FX2.v);
        for(let k9=0;k9<7;k9++)spawnP(dust,FX2.v.x,FX2.v.y,FX2.v.z,fallVel.x*SPD*.7+(Math.random()-.5)*6,fallVel.y*SPD*.7+(Math.random()-.5)*4,fallVel.z*SPD*.7+(Math.random()-.5)*6,.35+Math.random()*.25);}
      try{if(SONV2)sfx('turbo.mini',{vol:-6});}catch(e){}hap([8,16]);}}
  for(let i=0;i<3;i++){const r=FX2.slots[i];if(r&&r.tient&&!FX2.tenus[i])C.tiens(r,false);}
  const fin=C.tick(dt);
  for(let i=0;i<C.evts.length;i++)figBoum(C.evts[i]);C.evts.length=0;
  for(let i=0;i<C.figs.length;i++){const r=C.figs[i];if(r.tient&&!r.paye)figJet(r,dt);
    if(!r.paye&&!r.mv.length&&r.osc&&r.t<r.D){const nb=Math.floor(r.t*r.osc.w/Math.PI);if(nb>(r.batDit|0)){r.batDit=nb;const ch9=r.osc.z>.3; /* (2026-10-14, session SON — étape 3) LES BATTEMENTS SE SENTENT : SHIMMY (un « wik » par aller-retour, gauche / droite) et CHANDELLE (au sommet) n'ont pas de tour, donc pas de tic — fig.battement, sur l'échelle du vol sans la consommer */
      try{if(SONV2)sfx('fig.battement',{var:ch9?1:0,vol:-4,st:sonPdAR(ECH+(nb&1)),pan:ch9?0:(nb&1?.5:-.5)});}catch(e){}hap(5);}} /* (2026-10-15) −8 → −4 : le « wom » grave sort à −34, juste au-dessus d'une pièce */
    if(!r.paye&&r.mv.length){let mm=r.mv[0];for(let j=1;j<r.mv.length;j++)if(r.mv[j].tours>mm.tours)mm=r.mv[j]; // CHAQUE TOUR SE SENT : le souffle qui tourne, un tic dans la main (tenue, le rythme accélère)
      const n9=Math.floor(Math.max(0,mm.th)/6.2832+.08);if(n9>(r.tourDit|0)){r.tourDit=n9;try{if(SONV2&&!sfx(figMat(mm.a),{vol:-2,st:echSt()}))sfx('fig.vrille',{vol:-6});}catch(e){} /* (session SON) repli : l'ancien tic tant que la banque n'a pas les trois matières — (2026-10-15, Sacha : « que les figures fassent plus de bruit que quand tu ramasses une pièce ») −8 → −2 : un tour sortait à −39, 9 dB SOUS une pièce ; le DOUM d'un tour sort à −32, 3 dB au-dessus */hap(6);if(n9>=2)sparkBurst(sparkGold,carGroup.position,6,7);}}}
  {const gl9=figGlisseOn(),b9=gl9?64:FDIR.on?128:32;if(FX2.img===8&&TCTL.on&&!((SAVE.d.ast|0)&b9)&&figTutoOk()&&!TUTO.on){SAVE.d.ast=(SAVE.d.ast|0)|b9;SAVE.mark();misBanniere('ASTUCE',TR(gl9?'Depuis NITRO, glisse puis lâche : ◄► un tail whip, ▲ ▼ un salto. Au sol, pousse le joystick en avant pour sauter.':FDIR.on?'En vol, tape 2 fois NITRO : pouce en AVANT, en ARRIÈRE ou sur le CÔTÉ — chaque geste a sa figure.':'En vol, touche une FIGURE : elle explose et fait tourner la caisse. Tiens pour un tour de plus !'),'','rotation');}} // (une fois) le geste des figures, dit au 1er vol — (2026-10-15) le joystick : un bit neuf, ceux qui ont lu l'ancienne la relisent — (le soir) les TROIS directions : encore un bit neuf (128)
  {let pv9=0;for(let i=0;i<C.figs.length;i++){const r=C.figs[i];if(!r.paye&&r.f&&r.f.piv){pv9=r.f.piv;break;}}FX2.pivK=(FX2.pivK||0)+(pv9-(FX2.pivK||0))*Math.min(1,dt*14);} // (2026-10-15) LE TAIL WHIP : le point fixe glisse du milieu vers le NEZ
  const q=C.q;if(q[3]<.9999995){const hc=(CARS[level].h||1.3)*.5,zp=(FX2.pivK||0)*(CARS[level].l||4.4)*.5;VEQ.pv.set(0,hc,zp).applyQuaternion(carGroup.quaternion);
    VEQ.qr.set(q[0],q[1],q[2],q[3]);carGroup.quaternion.multiply(VEQ.qr);
    VEQ.pv2.set(0,hc,zp).applyQuaternion(carGroup.quaternion);carGroup.position.add(VEQ.pv).sub(VEQ.pv2);FX2.pivD=VEQ.pv.distanceTo(VEQ.pv2);}else FX2.pivD=0; // pivD (banc) : de combien le milieu s'écarte pour garder le nez en place
  for(let i=0;i<fin.length;i++)figPaye(fin[i]);
}
/* L'AUTO-ÉCOLE : les figures y sont fermées, SAUF à l'étape FIGURE — la leçon (GENERAL) l'ouvre par `tutoFigOuverte()` (nom convenu, ne pas renommer) */
function figTutoOk(){return !TUTO.on||(typeof tutoFigOuverte==='function'&&!!tutoFigOuverte());}
function figLance(s,o){o=o||{};const C=FX2.corps;if(!FIGV2.on||!C||!window.FIG)return null;
  if(!started||gameOver||paused||introD||!figTutoOk()||mode!=='fall')return null;
  const S=figSlots();let f;if(o.f){f=o.f;s=-1;}else{s=Math.abs(s|0)%FIG_NB;if(!S[s]){if(o.strict){if(!o.muet)figRefus(s);return null;}for(let k=1;k<FIG_NB&&!S[s];k++)if(S[(s+k)%FIG_NB])s=(s+k)%FIG_NB;}if(!S[s])return null;f=FIG.par[S[s]];if(f&&FIG.oriente&&s<2)f=FIG.oriente(f,FIG_DIR[s]);}if(!f)return null; // o.f : une figure hors emplacement (L'IMPULSION du double-tap) — s = −1, aucun bouton · (2026-10-15, les directions) s = l'EMPLACEMENT (0 avant, 1 arrière, 2 côté) ; vide : le GESTE (o.strict) est refusé — jamais un tonneau au pouce en avant —, le reste prend un emplacement qui existe (voir figSlots) ; à l'avant / à l'arrière, la figure est ORIENTÉE (son salto dans ce sens : le rodéo avant ≠ le rodéo arrière)
  if(o.dispo!=null)o.douce=true; // la figure du SAUT NITRO part toute seule : le joueur ne l'a pas risquée (pas finie = pas payée, jamais une CHUTE)
  /* À L'IMAGE DU DÉCOLLAGE (le saut nitro, un doigt déjà posé) le viseur n'a pas encore mesuré le vol : une route qui plonge sous la caisse
     reprend la caisse en 0,1 s (MESURÉ au banc : le salto du saut nitro partait, puis s'annulait). La demande attend UNE image (16 ms). */
  if(FX2.img<2&&!o.attendu){FX2.att={s:s,o:Object.assign({},o,{attendu:true,dispo:null})};if(s>=0)FX2.cyc=(s+1)%FIG_NB;return {attente:true};}
  const nc9=figNitCout(o);if(nc9>0&&nitroR+nitroX+(o.double&&FLC.ok&&performance.now()-FLC.t<450?FLC.c:0)<nc9){figRefus(s);return null;} // (2026-10-17, LA FIGURE SE PAIE — loi 6 du réservoir) pas 20 % dans la jauge (le coup de réacteur du double-tap, qui sera rendu, compté) : elle ne part pas
  const bud=o.dispo!=null?o.dispo:figBudget(),D=figDose(f,bud);
  let ax=0;for(let i=0;i<f.m.length;i++){const m=f.m[i];if(!(m.a[0]!==0&&m.a[1]===0&&m.a[2]===0)){ax=Math.abs(m.a[2])>Math.abs(m.a[1])?2:1;break;}}
  const st9=o.dx!=null&&Math.abs(o.dx)>=.3?o.dx:steer; // (2026-10-15, les deux familles) le geste de CÔTÉ donne le pouce LUI-MÊME (figDirSlot) : la figure part de ce côté, sans attendre que le volant lissé l'ait rejoint
  let enC=null;if(o.sens==null&&Math.abs(st9)<=.25)for(let i=0;i<C.figs.length;i++){const r9=C.figs[i];if(r9.f===f&&!r9.paye&&r9.mv.length){enC=r9;break;}} // (L'IMPULSION) pouce au neutre pendant que la même figure tourne (même le tonneau AUTOMATIQUE du saut nitro) : on CONTINUE dans son sens — alterner l'ÉTEIGNAIT (MESURÉ au banc : tonneau ×3 annulé par le bouton TONNEAU)
  const sens=o.sens!=null?o.sens:Math.abs(st9)>.25?(ax===2?(st9>0?-1:1):(st9>0?1:-1))*(f.piv?-1:1):enC?enC.s:(FX2.sensAlt=-FX2.sensAlt); // (2026-10-15) f.piv, le TAIL WHIP : la POUPE part du côté du pouce (comme au GLISSER) // du côté où l'on braque (steer > 0 = à gauche) — o.sens : le GLISSER de Léo l'impose
  const bm9=C.mode==='prise'; // (COMBOS À TROIS) lancée pendant la PRISE de la précédente : l'enchaînement PILE
  let r=null;if(o.empile)for(let i=0;i<C.figs.length;i++){const r9=C.figs[i];if(r9.f===f&&!r9.paye&&r9.s===sens&&r9.mv.length){r=r9;break;}} // (L'IMPULSION) la même figure tourne encore dans ce sens : on EMPILE un tour (sur le tonneau du saut nitro aussi : le joueur le reprend en main, il n'est plus « automatique »)
  if(r){const el9=FIG.PHY&&FIG.PHY.elan,D2=el9?Math.min(f.D*1.35+Math.max(0,r.D-r.t),(bud-.35)*.72):figDose(f,bud-C.reste());if(r.mv[0].tours>=IMPU.max||D2<Math.max(.32,f.D*.5)){figRefus(s);return null;} /* (le coup net) le tour EMPILÉ se dose sur ce qui reste à CETTE figure (D2 = le temps pour TOUT finir) — MESURÉ : réserver le temps des autres figures refusait le DOUBLE SALTO du saut nitro */C.empile(r,D2);r.douce=false;}
  else{if(C.occupe()>=3||D<figDMin(f,o.douce)){figRefus(s);return null;} // trop tard pour la planter : rien ne part (« ça les pose automatiquement ») — (le coup net) jamais en moins de 0,32 s : le coup serait un flou
    r=C.lance(f,sens,D,{tient:s>=0&&!!o.tient&&!!FX2.tenus[s],douce:!!o.douce});if(r)r.bm=bm9;}
  if(s>=0){FX2.slots[s]=r;FX2.cyc=(s+1)%FIG_NB;}FX2.n++;VEQ.n++;
  {const D9=FIG.dirs?FIG.dirs(f):[];r.flD=f.sens==='avant'||(D9.length===1&&D9[0]==='avant')?'haut':f.sens==='arriere'||(D9.length===1&&D9[0]==='arriere')?'bas':((ax===2||f.piv)?(sens<0?'gauche':'droite'):(sens>0?'gauche':'droite'));} /* (le TAIL WHIP : la flèche montre le côté où part la POUPE, celui du pouce) */ // (HUD v4) la flèche du geste : ▲ ▼, ou le CÔTÉ où elle part (tonneau : sens −1 = à gauche ; toupie, hélico : +1 = à gauche)
  /* LE DOUBLE-TAP N'EST PAS UN BOOST (la règle des FIGURES LIBRES de GAMEPLAY, gardée) : son 1er appui avait allumé le réacteur en vol (+46,
     12 % de la jauge) — rendu, vitesse et nitro. Un appui seul reste le boost ; marteler fait tourner, pas filer. */
  if(o.double&&FLC.ok&&performance.now()-FLC.t<450){FLC.ok=false;if(FLC.k<1)fallVel.multiplyScalar(FLC.k);nitroR=Math.min(nitroCap(),nitroR+FLC.c);} // (le FLC des FIGURES LIBRES, posé au coup de réacteur)
  if(nc9>0)figNitPaye(nc9);r.nitN=(r.nitN|0)+1;FX2.nitL=(FX2.nitL|0)+1; /* (POSER UNE FIGURE RAPPORTE) le lancement compte pour la pose, plantée ou pas */ // (loi 6) les 20 % partent ; la figure (celle du SAUT NITRO aussi : le saut a payé) comptera pour la pose — un tour EMPILÉ compte pour une de plus
  // le SAUT NITRO a déjà son souffle et son motif dans la main (Léo) : l'explosion de la figure ne revibre pas par-dessus (une seule voix par événement)
  const sautN=performance.now()-VEQ.sautT<120;
  if(sautN){try{if(SONV2)sfx('fig.explose',{var:0,vol:-6});}catch(e){}}else figCoup(Math.hypot(r.imp[0],r.imp[1],r.imp[2])/10,false);figBtFx(s,'boum');fhLance(s,r,o); // (HUD des figures v3) son nom tombe en grand
  return r;}
/* LA FIGURE SE PAIE (2026-10-17, Sacha — loi 6 du réservoir, réglages dans NITRO2.figN) : 20 % de la jauge au lancement, 40 % par
   figure plantée rendus à la pose RÉUSSIE (figNitRend, appelée par tryLand et levreRattrape), perdus sinon. Offerte (rien à payer, elle
   rapporte quand même) : la figure du SAUT NITRO (le saut a déjà payé ses 20 %), sous NITRO INFINIE, au parc, à l'auto-école.
   `dbgFigNit()` : le prix, ce qui attend la pose, la jauge.
   POSER UNE FIGURE RAPPORTE DU NITRO (2026-10-17 soir, Sacha : « poser une figure doit rapporter du nitro ») — MESURÉ au banc (fignit.cjs,
   vraie partie) : la règle tournait, mais deux fuites l'avalaient. (1) LE PLAFOND : à la pose la jauge est souvent presque pleine (la pose
   elle-même la remplit d'abord) — 1,2 à rendre, 0,57 crédités, le reste s'évaporait. Le trop-plein passe désormais dans la RÉSERVE BLEUE
   (`nitroX`, plafond 2 comme les fruits) : rien n'est perdu, et il vole vers la partie bleue de la barre. (2) LA FIGURE PAS BOUCLÉE : un tour
   empilé, ou relayé, qui n'avait pas fini son dernier quart au contact (fréquent depuis la gravité ×1,45) était payé 20 % et ne rendait RIEN,
   sans un mot — 3 lancements, 1 rendu. Le compte de la pose est maintenant celui des LANCEMENTS du vol (`FX2.nitL`, celui qui a payé) :
   chaque figure lancée rend ses 40 % à une pose réussie. Pose ratée (en plein tour, de travers, à contresens) : rien, comme avant. La toupie
   automatique du drift ne passe pas par figLance : ni coût ni gain. Rend le nitro crédité (jauge + réserve). */
function figNitCout(o){return o.douce||pwrNitroT>0||PARK.on||TUTO.on?0:NITRO2.figN.cout*nitroCap();}
function figNitPaye(q){const av=nitroR+nitroX;if(nitroR>=q)nitroR-=q;else{nitroX=Math.max(0,nitroX-(q-nitroR));nitroR=0;}if(LIVRE.on)livre('n-:figure',av-nitroR-nitroX);} // (la réserve bleue après la jauge, comme le saut nitro)
function figNitRend(ok){const n=FX2.nitL|0;FX2.nitF=0;FX2.nitL=0;if(!ok||n<=0)return 0;
  const cap=nitroCap(),q=NITRO2.figN.rend*n*cap,av=nitroR,ax=nitroX;
  nitroGain(Math.min(q,Math.max(0,cap-nitroR)),'figure'); // la jauge d'abord
  const reste=q-(nitroR-av);if(reste>.001){nitroX=Math.min(2,nitroX+reste);const dx=nitroX-ax;if(LIVRE.on){livre('n+:figure.reserve',dx);livre('n0:figure',reste-dx);}if(dx>.03&&!volgNitro('x',dx))nbPrend('x');} // …le trop-plein dans la réserve bleue
  return (nitroR-av)+(nitroX-ax);}
window.dbgFigNit=function(){return {cout:+(NITRO2.figN.cout*nitroCap()).toFixed(3),aRendre:FX2.nitL|0,plantees:FX2.nitF|0,rendSiPose:+(NITRO2.figN.rend*(FX2.nitL|0)*nitroCap()).toFixed(3),jauge:+nitroR.toFixed(3),reserve:+nitroX.toFixed(3),cap:nitroCap(),mode:mode};};
function figRefus(s){try{if(SONV2)sfx('nitro.vide');}catch(e){}hap(6);figBtFx(s,'non');fhLegFx(s,true);}
/* LES COMBOS À TROIS (2026-10-14, Sacha à GAMEPLAY — « réfléchis à comment ça peut être parfait, peu de jeux l'ont fait ; jouissif ; plein
   de combinaisons de trois figures à partir des moves existants » — repris par GENERAL). Chaque TROISIÈME figure plantée d'un même vol
   ferme un TRIO (1-2-3, puis 4-5-6…). Son NOM dépend des AXES des trois figures, dans n'importe quel ordre : T le tonneau (l'axe de la
   caisse), P la toupie (l'axe vertical), S le salto (l'axe des roues), M le mixte (deux axes, un axe penché, un battement). Cela donne
   20 familles (COMBO_NOMS) : on les découvre avec ses trois emplacements, et chaque figure achetée en ouvre d'autres.
   · LA PRIME : de l'AURA = la moitié des trois figures. ×1,5 pour LE GYROSCOPE (les trois axes purs), +25 % par enchaînement PILE
     (la figure suivante lancée pendant la PRISE de la précédente : `r.bm`, posé par figLance), ×2 à la 1re fois. Elle entre dans la
     chaîne comme une figure (FX2.pts) : une pose ratée (figChute) l'emporte avec les autres. (Plus de nitro depuis la loi 6 : la pose paie.)
   · LE CARNET : `SAVE.d.combos` {famille: nombre}. Une famille neuve → bandeau « NOUVEAU COMBO » avec le compte « n / 20 ».
   `?combo=0` les éteint. `dbgCombo()` : le carnet, le trio en cours. */
const COMBO_ON=!/[?&]combo=0\b/.test(location.search);
const COMBO_NOMS={TTT:['LA PERCEUSE','THE DRILL'],PPP:['LE TOURBILLON','THE WHIRLWIND'],SSS:['LA GRANDE ROUE','THE FERRIS WHEEL'],MMM:['LE GRAND CHAOS','TOTAL CHAOS'],
  PTT:['LE TAILLE-CRAYON','THE SHARPENER'],STT:['LA CENTRIFUGEUSE','THE CENTRIFUGE'],MTT:['LE MIXEUR','THE BLENDER'],
  PPT:['LA TOUPIE FOLLE','THE MAD TOP'],PPS:['LE MOULINET','THE PINWHEEL'],MPP:['LE DERVICHE','THE DERVISH'],
  PSS:['LA MACHINE A LAVER','THE WASHER'],SST:['LA ROUE DU HAMSTER','THE HAMSTER WHEEL'],MSS:['LE CASCADEUR','THE STUNTMAN'],
  MMT:['LA TORNADE','THE TORNADO'],MMP:['LA BOULE DISCO','THE DISCO BALL'],MMS:['LE CRASH-TEST','THE CRASH TEST'],
  PST:['LE GYROSCOPE','THE GYROSCOPE'],MPT:['LE SATELLITE','THE SATELLITE'],MST:['LE BOOMERANG','THE BOOMERANG'],MPS:['LE KAMIKAZE','THE KAMIKAZE']};
const COMBO_K={part:.5,gyro:1.5,pile:.25,neuf:2};
function comboAxe(f){const m=f&&f.m||[];if(m.length!==1||!m[0].t)return 'M';const a=m[0].a;
  if(a[2]&&!a[0]&&!a[1])return 'T';if(a[1]&&!a[0]&&!a[2])return 'P';if(a[0]&&!a[1]&&!a[2])return 'S';return 'M';}
function comboNote(r){try{ // appelée par figPaye, figure plantée (en vol ou à la pose)
  if(!COMBO_ON||!r||!r.f||r.douce)return;const T=FX2.trio||(FX2.trio=[]); // (GAMEPLAY) jamais les figures AUTOMATIQUES (saut nitro, toupie de drift) : un saut nitro ne doit pas suffire
  T.push({ax:comboAxe(r.f),aura:Math.round(r.f.aura||60),bm:!!r.bm});
  if(T.length<3)return;
  const tr=T.splice(0,3),cle=tr.map(function(x){return x.ax;}).sort().join(''),nm=COMBO_NOMS[cle];if(!nm)return;
  const D=SAVE.d.combos||(SAVE.d.combos={}),neuf=!D[cle];D[cle]=Math.min(1e6,(D[cle]|0)+1);SAVE.mark();
  const pile=(tr[1].bm?1:0)+(tr[2].bm?1:0),K=COMBO_K,en=LANG==='en';
  const aura=Math.round((tr[0].aura+tr[1].aura+tr[2].aura)*K.part*(cle==='PST'?K.gyro:1)*(1+K.pile*pile)*(neuf?K.neuf:1));
  const txt=(en?nm[1]:nm[0])+(pile?(en?' · ON BEAT':' · PILE')+(pile>1?' ×2':''):'');
  FX2.aura=aura;const c0=CHA.pts;
  addTrick('fig_combo_'+cle,txt,Math.round(aura/16),3); // (dans la chaîne comme une figure : sa famille s'use à la redite, ×0,7)
  FX2.aura=0;FX2.pts+=Math.max(0,CHA.pts-c0);FX2.combos=(FX2.combos|0)+1;
  try{fhTrio(en?nm[1]:nm[0]);}catch(e){} // (2026-10-18, HUD des figures v5) le combo nommé s'ÉCRIT en grand, ses trois maillons soulignés — avant, seul le tout premier se voyait (la bannière NOUVEAU COMBO)
  hap([14,30,14,30,40]);
  try{sonCombo(cle,neuf);}catch(e){} // (SON) la signature sonore du combo : livrée par la session SON — muet tant qu'elle n'existe pas
  if(neuf){const n=Object.keys(D).filter(function(k){return COMBO_NOMS[k];}).length;
    try{misBanniere(en?'NEW COMBO':'NOUVEAU COMBO',(en?nm[1]:nm[0])+' · '+n+' / 20','+'+aura,'etoile');}catch(e){}
    try{if(SONV2)sfx('ui.debloque',{t:.6});}catch(e){}} // (SON) après le sceau de sonCombo, pas par-dessus
}catch(e){}}
function figPaye(r){const f=r&&r.f;if(!f)return;const reps=Math.max(1,r.reps|0),aura=Math.round((f.aura||60)*(reps>1?1+(reps-1)*1.25:1));
  FX2.aura=aura;const c0=CHA.pts;
  {const s9=CHA.sansPop;CHA.sansPop=true;try{addTrick('fig_'+f.id,figNom(f,reps,'fr'),Math.round(aura/16),aura>=120||reps>=2?2:1);}finally{CHA.sansPop=s9;}} // le nom français : TR le traduit (« TOUPIE 360 ×2 ») — (HUD des figures v3) plus de « TONNEAU +120 » au-dessus de la caisse : le HUD des figures le dit
  FX2.aura=0;FX2.pts+=Math.max(0,CHA.pts-c0);FX2.payees++;const neuf9=!FX2.cv.ids[f.id];figCvNote(f,reps);fhPlante(r,f,reps,neuf9); // (2026-10-15) LE COMBO DU VOL — (v4) une figure NEUVE dans le vol : sa pastille est plus grosse
  if(!r.douce){CAMV.zoom=Math.max(CAMV.zoom,.42);shake=Math.max(shake,.22);try{sparkBurst(sparkGold,carGroup.position,14,9);}catch(e){}} // (LE COUP NET) la plantée CLAQUE : un coup de zoom sec (le même que la pose PARFAITE, en petit), une gerbe d'or — pas de gel d'image (verdict du 26/09 : plus aucun ralenti)
  FX2.nitF+=r.nitN|0;FX2.nPay++; // (2026-10-17, loi 6) la figure plantée ne remplit plus le NITRO tout de suite (ASPHALT 8) : elle COMPTE, la pose réussie la rend — 40 % chacune
  hap([10,22,10]);
  comboNote(r);} // (2026-10-14) LES COMBOS À TROIS
function figChute(){if(FX2.pts>0&&CHA.n>0){CHA.pts=Math.max(0,CHA.pts-FX2.pts);chaHud(true,false);}FX2.pts=0;FX2.chutes++; // posée en plein tour : les figures du vol quittent la chaîne (BMX)
  if(FX2.cv.n>0)figCvFin(false,0);}
/* ===== L'IMPULSION + LE COMBO DU VOL (2026-10-15, Sacha : « refonte du système de figure : quand on fait une figure, le double-tap sur le
   nitro doit générer une sorte d'IMPULSION d'un côté de la voiture ; puis pour faire des figures, s'inspirer des jeux de BMX ou d'Asphalt 8
   pour pouvoir CUMULER plusieurs figures et faire des cumulés »).
   · L'IMPULSION (`figImpulsion`) : en vol, le double-tap NITRO ne joue plus « l'emplacement suivant » — il fait exploser UN FLANC de la caisse
     (le point d'explosion du tonneau, `FIG.boums`) : pouce à gauche, le flanc droit saute et elle roule vers la gauche ; à droite, l'inverse ;
     pouce au neutre, elle continue le tonneau en cours (à l'arrêt : un flanc, puis l'autre au vol suivant). Re-double-tap dans le MÊME sens pendant qu'elle roule : la poussée S'AJOUTE (`Corps.empile`) —
     TONNEAU ×2, ×3, ×4 (`IMPU.max`). Dans l'autre sens, l'explosion freine celle d'avant (la physique, pas une règle). Les trois boutons
     de figure restent : ce sont eux qui ajoutent une TOUPIE, un SALTO… par-dessus le tonneau — la caisse part en vrille composée.
     Un appui SEUL sur NITRO redresse toujours (après la fenêtre du double-tap : `figRedP`).
   · LE COMBO DU VOL (`FX2.cv`, `#figCombo`) — le BMX : chaque figure PLANTÉE du vol s'ajoute à la ligne (« TONNEAU×2 + TOUPIE + AVANT ») et
     fait monter le × : +0,5 par figure DIFFÉRENTE, +0,25 pour une redite (`IMPU.xVar`/`xRep`, plafond `xMax`) — varier paie, marteler la même
     ne paie presque pas. À la POSE propre, le combo s'ENCAISSE : la chaîne reçoit l'aura des figures du vol × (le × − 1), sous « COMBO ×2,5 ».
     Posée en plein tour (CHUTE) : « COMBO PERDU », tout s'envole (figChute). Le nitro à chaque figure plantée (Asphalt 8) ne change pas.
   `?impu=0` : le double-tap en vol rejoue l'emplacement suivant (les FIGURES v2 du 14/10). Console : `dbgImpu()`. */
const IMPU={on:!/[?&]impu=0\b/.test(location.search),max:4,xVar:.5,xRep:.25,xMax:4};
/* LE CHOIX AU JOYSTICK (2026-10-15, Sacha : « quand le joystick est vers l'avant, ça déclenche la figure 1, et quand il est sur les côtés, la
   figure 2 » — choisi : au DOUBLE-TAP NITRO, et plus de boutons à l'écran). Le pouce gauche au moment du double-tap : sur un CÔTÉ (l'horizontale
   domine) = l'emplacement 2, qui part de ce côté (figLance lit le braquage) ; vers l'avant — ou au repos, ou en arrière — = l'emplacement 1.
   Re-double-tap dans la même direction pendant qu'elle tourne : le tour S'EMPILE (×2, ×3, ×4 : `IMPU.max`), comme l'impulsion de la veille.
   Au clavier : ← → = 2, sinon 1 (les touches 1 · 2 jouent toujours leur emplacement). `?figdir=0` rend le 15/10 (boutons + impulsion de flanc).
   Console : `dbgFigDir(x,y)` = un double-tap en vol, le pouce en (x : le côté, y : l'avant). */
const FDIR={on:!/[?&]figdir=0\b/.test(location.search),force:null,x:0};
if(FDIR.on)document.body.classList.add('figDir');
function figDirSlot(){let x,y;
  if(FDIR.force){x=FDIR.force[0];y=FDIR.force[1];}
  else if(TCTL.act){x=TCTL.st;y=TCTL.sv;}
  else{x=(keys.KeyA||keys.KeyQ||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0);y=(keys.KeyW||keys.KeyZ||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);}
  FDIR.x=x;if(Math.abs(x)>=.3&&Math.abs(x)>=Math.abs(y)*.85)return 2;return y<=-.3?1:0;} // FDIR.x : le pouce lui-même, que figLance lit pour le côté (o.dx) — (2026-10-15 soir, la direction ARRIÈRE) ◄► = 2 · pouce vers le BAS = 1 (arrière) · vers le haut ou au repos = 0 (avant)
window.dbgFigDir=function(x,y){FDIR.force=[+x||0,+y||0];try{const s=figDirSlot(),r=figLance(s,{double:true,empile:true,dx:FDIR.x,strict:!TUTO.on});return r?(r.attente?'attente':'ok geste '+(s+1)+' '+r.f.id+(r.f.sens?' '+r.f.sens:'')+(r.s>0?'+':'-')):'refus';}finally{FDIR.force=null;}};
function figImpulsion(){const f=window.FIG&&FIG.par.tonneau;if(!f)return null;return figLance(-1,{f:f,double:true,empile:true});}
window.dbgSautFig=function(x,y){if(x==='cause')return {cause:mortCause,mode:mode,go:gameOver};FDIR.force=[+x||0,+y||0];let r;try{r=veqDouble();}finally{setTimeout(function(){FDIR.force=null;},250);} /* (banc, 2026-10-15 soir) un double-tap NITRO, le joystick en (x : le côté, y : l'avant) — au sol : le SAUT NITRO et la figure de cette direction */
  return {ok:!!r,mode:mode,hopY:+hopY.toFixed(2),hopV:+hopV.toFixed(2),pose:!!POSE_F,cd:Math.round(performance.now()-VEQ.sautT),nit:+(nitroR+nitroX).toFixed(2),slot:figDirSlot(),allonge:VEQ.allonge|0,dv:VEQ.dvDer||0,tPred:VEQ.tPred||0};};
/* ===== LA FIGURE AU GLISSÉ (2026-10-15, Léo : « une nouvelle manière de faire les tricks, changeable dans les réglages, là où ça devrait
   être : la figure se fait par une GLISSE vers un sens puis LÂCHÉE, depuis le bouton NITRO — la nitro toujours présente »). Le réglage :
   RÉGLAGES › JEU › FIGURES (et la PAUSE) — 2 TAPS (le double-tap, d'origine) · GLISSER (`SAVE.d.figG`, écrit par `figGBascule` seul).
   · EN GLISSER, le pouce se pose sur NITRO (le boost part, comme toujours, et tient tant que le pouce reste posé), GLISSE d'au moins
     `GLI.seuil` px, puis LÂCHE : la figure de ce SENS (Léo a choisi « le côté / l'axe ») — ← → = le TONNEAU de ce côté (l'IMPULSION de
     flanc de Sacha ; on recommence dans le même sens pendant qu'elle roule : TONNEAU ×2, ×3…), ↑ = SALTO ARRIÈRE, ↓ = SALTO AVANT
     (offerts à tous, comme le tonneau de l'impulsion). AU SOL : le SAUT NITRO, avec la figure du sens (Léo : « comme le double-tap »).
   · Revenu près du point d'appui avant de lâcher = rien (on a changé d'avis). Pendant le glissé, `#figGl` dit la figure qui partira.
   · Le double-tap et le redressement à un tap du BOUTON sont coupés (taper NITRO = booster, rien d'autre) ; le CLAVIER garde son double-tap
     (une touche ne glisse pas, LE CHOIX AU JOYSTICK de Sacha y vit). Le rappel « ↑ 1 · ◄► 2 » (`#fhLeg`, celui du double-tap) se tait en
     GLISSER (`body.figGlisse`) : il dirait un geste qui ne marche plus au doigt.
   Lu aux événements (doigt, souris du cadre de l'ordi), joué par la boucle (`GLI.req`, comme `VEQ.dReq`). Console : `dbgGlisse()`,
   `dbgGlisse('l'|'r'|'u'|'d')` (un glissé sans doigt), `dbgGlisse('on'|'off')`. */
const GLI={seuil:38,coup:90,req:null,reqT:0,n:0,refus:0,der:null,id:null,x0:0,y0:0,vu:null,el:null,tq:0,fait:false,part:false,coups:0};
function figGlisseOn(){return !!(SAVE.d&&SAVE.d.figG==='glisse');}
function figGBascule(){SAVE.d.figG=figGlisseOn()?'tap':'glisse';SAVE.flush();figGClasse();}
function figGClasse(){try{document.body.classList.toggle('figGlisse',figGlisseOn());}catch(e){}}
figGClasse();
function figGDir(dx,dy){const ax=Math.abs(dx),ay=Math.abs(dy);if(Math.max(ax,ay)<GLI.seuil)return null;return ax>=ay?(dx<0?'l':'r'):(dy<0?'u':'d');}
function figGFig(d){const F=window.FIG&&FIG.par;return F?(d==='l'||d==='r'?(F.tailwhip||F.toupie):d==='u'?F.saltoa:F.saltov):null;} // (2e passe, Léo : « en l'air 360 aussi ») ← → = le 360 à plat — (2026-10-15, Léo par le MANAGER) ← → EN L'AIR = le TAIL WHIP de ce côté (le nez reste, la poupe fait le tour)
function figGOpts(d){const f=figGFig(d);if(!f)return null;
  return {f:f,sens:f.piv?(d==='l'?-1:d==='r'?1:1):(d==='l'?1:d==='r'?-1:1),empile:true};} // (figLance, toupie : pouce à GAUCHE → sens +1, le nez part à gauche ; un salto garde son sens) — le TAIL WHIP : glissé à GAUCHE → la POUPE part à gauche (sens −1 : le nez tient, la queue fouette du côté du pouce)
function figGNom(d){if(mode==='drive')return d==='l'||d==='r'?'SLIDE 360':d==='u'?'WHEELIE':'STOPPIE';const f=figGFig(d);return f?sansAcc(LANG==='en'?f.en:f.n):'';} // ce que dit la flèche
function figGJoue(d){ // (la boucle) le glissé lâché
  if(!started||gameOver||paused||introD||(TUTO.on&&!tutoFigOuverte())){GLI.refus++;return false;}
  const o=figGOpts(d);let ok=false;
  if(o){if(mode==='drive')ok=gsolLance(d);else if(mode==='fall')ok=!!(FIGV2.on?figLance(-1,o):veqFigure());} // (2e passe) AU SOL : la figure se fait AU SOL (voir GSOL)
  if(ok){GLI.n++;GLI.der=d;if(TUTO.on)TUTO.sauts=(TUTO.sauts|0)+1;}else GLI.refus++;
  return ok;}
function figGVoit(d,x,y){ // la flèche du glissé : ce qui partira si on lâche ici
  if(!(d&&started&&!gameOver&&!paused))d=null;
  let el=GLI.el;if(!el){if(!d)return;el=GLI.el=document.createElement('div');el.id='figGl';el.setAttribute('aria-hidden','true');el.innerHTML='<i class="pxi"></i><b></b>';document.body.appendChild(el);}
  if(!d){if(GLI.vu){GLI.vu=null;el.classList.remove('on');}return;}
  if(GLI.vu!==d){GLI.vu=d;
    el.firstChild.className='pxi pxi-'+(d==='l'?'gauche':d==='r'?'droite':d==='u'?'haut':'bas');
    el.lastChild.textContent=figGNom(d);el.classList.add('on');try{hap(5);}catch(e){}}
  const k=d==='l'||d==='r'?1:0,sx=d==='l'?-1:d==='r'?1:0,sy=d==='u'?-1:d==='d'?1:0,W=VP.w||innerWidth,H=VP.h||innerHeight;
  const px=Math.max(70,Math.min(W-70,GLI.x0+sx*86)),py=Math.max(40,Math.min(H-40,GLI.y0+sy*86-(k?44:0)));
  el.style.transform='translate('+Math.round(px)+'px,'+Math.round(py)+'px) translate(-50%,-50%)';}
window.dbgGlisse=function(a){if(a==='on'||a==='off'){SAVE.d.figG=a==='on'?'glisse':'tap';figGClasse();return SAVE.d.figG;}
  if(a==='l'||a==='r'||a==='u'||a==='d')return figGJoue(a);
  if(a==='save')return {figs:SAVE.d.figs,figT0:SAVE.d.figT0,achat:ecoDebutAchat(),slots:figSlots(),tonneau:figPossede('tonneau'),tailwhip:figPossede('tailwhip'),prix:window.FIG&&FIG.par.tonneau?FIG.par.tonneau.p:null}; // (banc, TAIL WHIP) ce que la sauvegarde possède
  if(a==='nez'){const L=(CARS[level].l||4.4)*.5,n9=new THREE.Vector3(0,.5,L*.92),p9=new THREE.Vector3(0,.5,-L*.9);carGroup.localToWorld(n9);carGroup.localToWorld(p9); // (banc, TAIL WHIP) le nez, la poupe et le milieu dans le monde
    return [n9.toArray(),p9.toArray(),carGroup.position.toArray(),fallPos.toArray()].map(function(v){return v.map(function(x){return +x.toFixed(3);});});}
  return {mode:figGlisseOn()?'glisser':'2 taps',lances:GLI.n,refus:GLI.refus,dernier:GLI.der,seuil:GLI.seuil,doigt:GLI.id,vu:GLI.vu,jeu:mode,figures:FX2.n,coups:GLI.coups|0,pivK:+(FX2.pivK||0).toFixed(2),pivD:+(FX2.pivD||0).toFixed(2),fig:FX2.corps&&FX2.corps.der||null,sol:GSOL.k,solT:+GSOL.t.toFixed(2),solFaits:GSOL.n,solSauts:GSOL.sauts};};
/* ===== LES FIGURES AU SOL (2026-10-15, 2e passe — Léo : « pas obligé d'être en l'air pour faire une figure ; certaines te lancent en l'air,
   seulement lorsque le joueur fait FLÈCHE AVANT pendant le trick ; faites sur le sol, la voiture reste au sol tant qu'il ne pousse pas vers
   l'avant ; d'autres, comme le SLIDE 360, se font au sol et restent au sol » ; choix cochés : flèche avant = le JOYSTICK poussé vers l'avant,
   au sol la figure se fait AU SOL, ← → = le slide 360 au sol et le 360 en l'air). En GLISSER, au sol :
   · ← → = SLIDE 360 : la caisse fait un tour complet à PLAT sur la route (autour de la normale de la dalle, comme le power-slide), la gomme
     fume aux roues arrière ; elle ne quitte JAMAIS le sol. Payé à la fin (« SLIDE 360 »).
   · ↑ = WHEELIE (le nez se lève, pivot sur l'essieu ARRIÈRE) · ↓ = STOPPIE (le cul se lève, pivot sur l'essieu AVANT) : l'AMORCE du salto,
     posée sur la route. JOYSTICK VERS L'AVANT pendant les 4/5 de l'amorce (ou ↑ / W fraîchement appuyé au clavier) → le SAUT NITRO (veqSaut :
     coût, attente) et le salto de ce sens, fini en l'air ; la caisse emporte l'angle de l'amorce (figDepart). Sinon elle se repose (coup de
     nez du ressort SCOUP) et c'est payé « WHEELIE » / « STOPPIE ».
   Pose = une rotation de carGroup autour d'un pivot, rejouée à chaque image APRÈS sa pose sur la route (gsolPose) : la physique ne voit rien.
   Jamais sous la dalle (side < 0), une seule à la fois. */
const GSOL={k:null,t:0,D:0,s:1,saute:false,k0:false,n:0,sauts:0,ax:new THREE.Vector3(),pv:new THREE.Vector3(),v:new THREE.Vector3(),q:new THREE.Quaternion()};
function gsolHaut(){return !!(keys.ArrowUp||keys.KeyW||keys.KeyZ);}
function gsolLance(d){const G=GSOL;
  if(mode!=='drive'||side<0||G.k||hopY>0||POSE_F){try{if(SONV2)sfx('nitro.vide');}catch(e){}hap(6);return false;}
  G.k=d==='l'||d==='r'?'p':d==='u'?'w':'s';G.t=0;G.D=G.k==='p'?.72:G.k==='w'?.78:.6;G.s=d==='l'?1:-1;G.saute=false;G.k0=gsolHaut();
  if(G.k==='p'){try{if(SONV2&&!sfx('fig.toupie',{st:echSt()}))sfx('turbo.mini',{vol:-6});}catch(e){}hap([8,16]);}
  else{try{if(SONV2)sfx('turbo.mini',{vol:-6});}catch(e){}hap([10,20]);if(typeof sensCoup==='function')sensCoup(0,0,G.k==='w'?1.4:-1.4);}
  return true;}
function gsolCoupe(){GSOL.k=null;GSOL.t=0;}
function gsolTick(dt){const G=GSOL;if(!G.k)return; // (la boucle, en course)
  if(mode!=='drive'||gameOver||!started){gsolCoupe();return;}
  if(paused)return;
  G.t+=dt;
  if(G.k==='p'){if(Math.random()<dt*34){const sp=CARS[level]||CARS[0],sd=Math.random()<.5?-1:1; // la gomme fume aux roues arrière pendant le tour
      G.v.set(sd*sp.w*.45,.25,-sp.l*.38).applyQuaternion(carGroup.quaternion).add(carGroup.position);
      for(let k=0;k<3;k++)spawnP(dust,G.v.x,G.v.y,G.v.z,(Math.random()-.5)*5,1+Math.random()*2,(Math.random()-.5)*5,.35+Math.random()*.3);}}
  else if(!G.saute&&G.t<G.D*.8){ // FLÈCHE AVANT pendant l'amorce : elle SAUTE et finit le salto en l'air
    const h=gsolHaut();if(!h)G.k0=false;
    if((TCTL.act&&TCTL.sv>.35)||(h&&!G.k0)){G.saute=true;const o=figGOpts(G.k==='w'?'u':'d');
      if(o&&veqSaut(o)){G.sauts++;gsolCoupe();return;}}} // refusé (attente, nitro à sec) : elle reste au sol, un seul essai
  if(G.t>=G.D){const k=G.k;gsolCoupe();G.n++;
    if(k==='p'){try{chaineAura('SLIDE 360',70,'gslide',false,false);}catch(e){}hap([10,22,10]);}
    else{try{chaineAura(k==='w'?'WHEELIE':'STOPPIE',40,k==='w'?'gwheelie':'gstoppie',false,false);}catch(e){}
      if(typeof sensCoup==='function')sensCoup(0,k==='w'?2.4:-2,-1.2);hap([8,18]);}}} // elle retombe sur ses roues : le nez claque
function gsolPose(F){const G=GSOL;if(!G.k||mode!=='drive')return; // (conduite, chaque image, après la pose de la caisse sur la route)
  const x=Math.min(1,G.t/G.D),q=carGroup.quaternion,p=carGroup.position;
  if(G.k==='p'){G.q.setFromAxisAngle(F.n,G.s*6.2832*x*x*(3-2*x));q.premultiply(G.q);return;}
  const sp=CARS[level]||CARS[0],b=Math.pow(Math.sin(Math.PI*x),.75),a=(G.k==='w'?-.46:.34)*b,zp=(G.k==='w'?-1:1)*(sp.l||4.4)*.36;
  G.ax.set(1,0,0).applyQuaternion(q);G.pv.set(0,0,zp).applyQuaternion(q).add(p); // l'axe des roues, le pivot : l'essieu qui reste au sol
  G.q.setFromAxisAngle(G.ax,a);q.premultiply(G.q);p.sub(G.pv).applyQuaternion(G.q).add(G.pv);}
