/* ---- LE MOTEUR QUI AVANCE + LE NITRO EN FEU DE PIXELS (2026-10-15, pôle TECHNIQUE — Léo : « le nitro et la flamme du moteur, c'est
   un peu fade : on n'arrive pas à distinguer le nitro du moteur » · « pas trop régulier, comme le moteur d'une voiture qui avance : qu'on
   ne voie pas une séquence qui se répète ; en réaction à comment la voiture bouge, inspiré de la physique » · « le nitro : un classique,
   en feu pixelisé, bien vénère, un mélange du burn-out et des flammes en cubes de la porte ; pas la forme de l'arc-en-ciel, sa grandeur,
   en moins gros »). MESURÉ avant : moteur et nitro étaient la MÊME plume (0,35 m → 3,15 m au nitro), battue par des sinus fixes.
   LE MOTEUR (`FLM`, `flmPas`) — la plume lisse des pots (JETS) suit un MOTEUR SIMULÉ, celui que l'oreille entend : la table `ENG_SND`
   du palier (ses rapports `gr`, sa cadence `fHz`, son irrégularité `fJit`, ses crépitements `crk`) et les seuils de la boîte du son.
   · la COMBUSTION : des bouffées à la cadence du moteur (qui monte avec le régime), chacune d'une force tirée au hasard (± fJit), un
     raté de temps en temps ; une HOULE lente (Ornstein-Uhlenbeck : jamais périodique) ; chaque pot a ses bouffées à lui ;
   · la CHARGE (lue dans l'accélération réelle, comme le son) : en reprise la flamme est longue et jaune, stabilisée elle est courte ;
   · la BOÎTE : au passage de rapport l'allumage est coupé ~0,12 s — la flamme s'étouffe — puis le carburant non brûlé SAUTE (un pop
     gras, plus fort aux derniers rapports) ;
   · le LÂCHER (le drift lève le pied du gaz auto) : la flamme tombe, l'échappement pétarade au hasard, de plus en plus espacé ;
   · EN VOL les roues tournent dans le vide : le moteur bat contre le RUPTEUR (~11 coupures/s, chaque demi-période tirée) + des pops ;
   · la POSE : un coup de feu ; la COULEUR suit la chaleur (rouge-orangé au repos, orange en charge, jaune-blanc dans un pop).
   LE NITRO (`NFEU`) — un FEU DE PIXELS qui sort des pots : des cubes (la matière des flammes de la porte et de l'arc-en-ciel : zéro
   programme de plus), nés blancs dans la bouche du pot, qui jaillissent, s'ouvrent, montent, et vieillissent blanc → jaune → orange →
   vermillon → rouge → braise → SUIE (des cubes sombres au bout : le pixel art du feu) ; ils sautent de case en case dans le repère de
   la flamme ; des LANGUES tournent autour de l'axe (celles de la porte), des COUPS de feu tombent au hasard, des étincelles giclent dans
   le monde. ~3,5 à 5 m derrière la caisse, ~1,3 m de large au bout. La plume lisse devient la TORCHE blanche dans la bouche du pot.
   Réserve bleue = feu bleu, nitro infinie = feu violet (des SIGNAUX de jeu). `?flamme=ancien` = la plume d'avant ; `dbgFlamme()`. */
const FLM_ON=!/[?&]flamme=ancien\b/.test(location.search);
function flmGauss(){return (Math.random()+Math.random()+Math.random()-1.5)*1.41;} // une gaussienne réduite (à peu près), sans Math.log
const FLM={tier:-1,g:1,shT:0,shift:0,rpm:0,sN0:-1,ch:.3,ov:0,thr0:0,limOn:true,limT:0,limA:1,surge:0,heat:.4,pop:0,glow:1,mode0:'drive',
  P:[0,1,2,3].map(function(){return {ph:Math.random(),iv:1,env:1,tr:0,pop:0,popQ:0,popT:0};}),L:new Float32Array(4).fill(1),R:new Float32Array(4).fill(1),
  cF:new THREE.Color(0xd8461a),cB:new THREE.Color(0xff8c30),cC:new THREE.Color(0xffcf6a),kF:new THREE.Color(0xffd29a),kC:new THREE.Color(0xffffff)};
function flmPop(i,q){const p=FLM.P[i&3];if(q>p.pop)p.pop=q;} // un pop sur ce pot
function flmPops(q,suite){for(let i=0;i<4;i++){const p=FLM.P[i];flmPop(i,q*(.75+.5*Math.random()));if(suite){p.popQ+=suite;p.popT=.04+.1*Math.random();}}} // tous les pots, et des pops qui suivent
function flmPas(dt,speedKmh){ // speedKmh : celle de la boucle (le compteur)
  const F=FLM,eng=ENG_SND[Math.max(0,Math.min(ENG_SND.length-1,engTier|0))]||ENG_SND[0];
  const hz0=eng.fHz||40,ji=eng.fJit==null?.3:eng.fJit,crk=eng.crk||0;
  const spd=Math.abs(speedKmh),sN=Math.min(1.06,spd/Math.max(1,vCroisiere())),sol=mode==='drive',vol=mode==='fall';
  const thr=sol&&gasOn&&!(AUTO_GAS&&(keys.KeyS||keys.ArrowDown||driftEnCours))?1:0; // la recette du son : le drift lève le pied du gaz auto
  // LA BOÎTE (les seuils du son) ; un palier neuf reprend le rapport de la vitesse, sans cérémonie
  if(F.tier!==engTier){F.tier=engTier;F.g=1;if(eng.gr>1)for(;F.g<eng.gr;F.g++){const l9=Math.pow((F.g-1)/eng.gr,1.3),h9=Math.pow(F.g/eng.gr,1.3)*1.05;if((sN-l9)/Math.max(.01,h9-l9)<=.99)break;}}
  let tgt=sN;
  if(eng.gr>1&&sol){const gn=eng.gr,lo=Math.pow((F.g-1)/gn,1.3),hi=Math.pow(F.g/gn,1.3)*1.05,pos=Math.min(1.05,Math.max(0,(sN-lo)/Math.max(.01,hi-lo)));
    if(pos>.99&&F.g<gn&&thr&&F.shT<=0){F.g++;F.shT=.12;F.shift=.35+.65*F.g/gn;}
    else if(F.g>1&&sN<lo*.95)F.g--;
    tgt=Math.pow(Math.min(1,pos),.9);if(spd<8)tgt=thr*.72;}
  if(F.shT>0){F.shT-=dt;tgt*=.66;if(F.shT<=0&&F.shift>0){flmPops(.5+.7*F.shift,F.shift>.8&&Math.random()<.6?1:0);F.shift=0;}} // la coupure finie : le carburant non brûlé SAUTE
  if(vol)tgt=.86+.12*Math.random();
  F.rpm+=(tgt-F.rpm)*Math.min(1,dt*(tgt>F.rpm?8:5.5));
  // LA CHARGE et LE LÂCHER (la charge se lit dans l'accélération réelle, comme le son)
  const dv=F.sN0<0?0:(sN-F.sN0)/Math.max(.001,dt);F.sN0=sN;
  const cC=thr?Math.max(0,Math.min(1,.26+dv*2.6)):0,oC=(!thr&&sol&&F.rpm>.2)?Math.min(1,(F.rpm-.2)*2.4):0;
  F.ch+=(cC-F.ch)*Math.min(1,dt*(cC>F.ch?9:3.4));F.ov+=(oC-F.ov)*Math.min(1,dt*(oC>F.ov?10:4.5));
  if(sol&&F.thr0&&!thr&&F.rpm>.42&&crk>0)flmPops(.75,1+((Math.random()*3*crk)|0)); // le pied se lève : POP, pop-pop
  else if(F.ov>.25&&crk>0&&Math.random()<dt*7*crk*F.ov*F.ov)flmPop((Math.random()*4)|0,.5+.5*Math.random()); // la traîne, au hasard
  F.thr0=thr;
  if(sol&&F.mode0==='fall')flmPops(.95,1);F.mode0=mode; // la POSE : le carburant secoué
  F.surge+=-F.surge*dt/.35+.55*Math.sqrt(dt)*flmGauss(); // la HOULE (τ ,35 s)
  for(let i=0;i<4;i++){const p=F.P[i];p.tr+=-p.tr*dt/.07+.6*Math.sqrt(dt)*flmGauss();} // le TREMBLÉ de chaque pot (τ 70 ms) : il casse le battement image sur deux
  let limK=1;
  if(vol&&!nitroOn){F.limT-=dt;if(F.limT<=0){F.limOn=!F.limOn;F.limT=(F.limOn?.05:.034)*(.45+1.1*Math.random())*(Math.random()<.15?2.2:1); // le RUPTEUR : chaque demi-période tirée, parfois un coup qui traîne
      if(F.limOn)F.limA=.55+.65*Math.random();else if(Math.random()<.12+.4*crk)flmPop((Math.random()*4)|0,.55+.45*Math.random());}
    limK=F.limOn?(F.limA||1):.16;}
  // LA COMBUSTION, pot par pot
  const hz=hz0*(.5+.7*F.rpm),dec=Math.exp(-dt*hz*.8),ld=sol?.62+.55*F.ch-.45*F.ov:vol?.85:.5; /* MESURÉ au banc : à ~37 bouffées/s vues à 60 images/s,
     une extinction rapide faisait battre la flamme une image sur deux (un motif) — elle s'éteint donc plus lentement, et l'INTERVALLE entre deux
     bouffées est tiré à chaque fois (± 40 %) : plus de battement régulier */
  let hot=0;
  for(let i=0;i<4;i++){const p=F.P[i];
    p.ph+=dt*hz/p.iv;p.env*=dec;
    while(p.ph>=1){p.ph-=1;p.iv=.6+.8*Math.random();let a=1+ji*.55*flmGauss();if(Math.random()<ji*.05)a=.12;else if(Math.random()<.05)a+=.45;p.env=Math.max(.1,a);p.pz=Math.min(4,(p.pz|0)+1);p.pa=a;} // pz/pa : les bouffées de l'image (le feu du moteur crépite dessus) // une bouffée : son intervalle et sa force tirés (± fJit) ; un raté, ou une grosse, de temps en temps
    if(p.popQ>0){p.popT-=dt;if(p.popT<=0){p.popQ--;p.popT=.05+.12*Math.random();flmPop(i,.45+.55*Math.random());}} // les pops qui suivent, égrenés
    p.pop*=Math.exp(-dt*13); // un pop vit ~70 ms
    F.L[i]=Math.max(.05,ld*(.8+.2*p.env)*(1+.3*F.surge+.55*p.tr)*limK*(F.shT>0?.3:1)+.6*p.pop);
    F.R[i]=1+.9*p.pop+.12*(p.env-1);
    if(p.pop>hot)hot=p.pop;}
  F.heat+=((Math.min(1,.25+.55*F.ch+.25*F.rpm)*(1-.6*F.ov))-F.heat)*Math.min(1,dt*6);
  F.pop=Math.min(1,hot);F.glow=(.7+.3*Math.min(1.4,F.L[0]))*(1+.9*F.pop);
  return F;}
const MOTEUR_MINI=FLM_ON&&!/[?&]moteur=goutte\b/.test(location.search); // (2026-10-15) la flamme du MOTEUR = ce feu-ci, en MINUSCULE (voir NFEU_MINI) ; ?moteur=goutte : la goutte lisse
const NFEU_MINI={t:.42,va:2.6,r:2.1,vie:.85,taux:260,pas:.4,et:0,bleu:.05,crq:.07}; /* (15/10 soir, Léo : « reste sur les petits crépitements, mais que ça aille plus DANS TOUS LES SENS, un peu comme les cristaux de flammes d'avant, mais avec les petits cubes ») va : la poussée dans l'axe, plus faible · r : la GERBE — chaque cube part dans une direction tirée tout autour de l'axe, à 0,7-2,6 m/s (×1,7 aux bouffées qui claquent), comme les éclats · et 0 : des cubes, pas des traits */ // (crépitant) taille, VITESSE PROPRE (m/s : le moteur ne suit pas le jet du nitro, 13-26 m/s, sinon des aiguilles), écart, vie, débit (cubes/s/pot, × la bouffée du moteur), grille, étirement, pied bleu, CRÉPITEMENT (part des bouffées qui claquent) — en part du nitro
const NFEU_N=1600,NFEU_PAS=.06,NFEU_SEUIL=[.08,.24,.46,.66,.8,.9],NFEU_TAILLE=[.9,.98,1,1,.9,.74,.6];
/* la palette est pensée APRÈS la courbe ACES de la passe finale : elle écrase le rouge plus que le vert au-delà de 1 — l'orange de la porte
   (1,75 · ,78 · ,14) y sortait JAUNE (mesuré sur la capture). Ici le vert est tenu bas : l'orange reste orange, le rouge rouge. */
/* (2026-10-15, pôle TECHNIQUE — Léo : « le nitro pas mal, essaie d'affiner : pixels plus fins, plus de nuances » · le feu du moteur « très bien,
   approfondis le tout : fluide, accordé au vent, au mouvement ») LE FEU AFFINÉ :
   · 10 NUANCES au lieu de 7 (`NFEU_P10`, seuils `NFEU_B10`, tailles `NFEU_T10`) : blanc chaud → jaune pâle → jaune d'or → or orangé → orange →
     orange profond → vermillon → rouge → braise → fumée ; chaque cube a son éclat (± 8 %, tiré de sa graine) ;
   · des PIXELS PLUS FINS (`NFEU_FIN`) : des cubes ×0,73, 1,7 fois plus nombreux, sur une grille ×0,6 — le feu GLISSE au lieu de sauter ;
   · FLUIDE AU SOL AUSSI (`NFEU_SOL`) : chaque cube garde une part de l'assiette de sa naissance (jusqu'à 85 %, qui monte avec son âge) — dans un
     virage la flamme TRAÎNE et s'incurve au lieu de pivoter d'un bloc avec la caisse — et en fin de vie il se couche dans le VENT de la
     trajectoire (une glisse, un drift : le feu part du côté où l'air le pousse). En vol, le feu détaché de Sacha (genre 3) garde sa règle.
   Le DRAGON garde NFEU_PAL / NFEU_SEUIL / NFEU_TAILLE (7 nuances). `?nfeu=colle` coupe aussi la part fluide au sol. */
const NFEU_B10=[.06,.14,.24,.35,.47,.59,.71,.82,.9],NFEU_T10=[.88,.96,1,1,1,.96,.9,.82,.72,.6];
/* (2026-10-15, Sacha : « le feu du nitro est trop rouge ou trop bleu par rapport aux couleurs de la barre de nitro ») LES TEINTES DE LA BARRE,
   sur les 10 nuances du feu affiné (nombre de nuances, seuils, tailles, jet, feu du MOTEUR `m` : rien ne bouge). La passe finale des courses
   (ACES qui garde la chroma — vivid 1 —, saturation 1,3 à 1,6, contraste 1,2 à 1,4) pousse à fond tout canal déjà dominant : MESURÉ sur les
   pixels pleins du feu, l'ancienne palette sortait ROUGE (#f15309 → #ec1c18 → #e8171b), BLEU-INDIGO (#1131f4 → #2317f4 → #331aef) et MAGENTA
   (#ac12f2). Chaque nuance est ici MESURÉE À L'ENVERS DANS LE JEU (banc « teinte », 2026-10-16) : course figée, tout le feu peint d'une seule
   valeur, couleur moyenne de ses pixels PLEINS relue après la passe finale (pas ceux que le flou de vitesse mêle au bitume : leur bleu-gris
   faisait jaunir les cœurs), puis une descente (Newton amorti, en Lab) — UNE valeur pour QUATRE ambiances à la fois (nuages midi et nuit,
   ville au soir, glacier midi), plafonnée à 3, vérifiée sur une autre image. Écart Lab moyen, avant → après : feu 21-34 → 3-11, réserve 30-69 →
   4-13, infinie 19-57 → 3-13. Couleurs visées, rapportées au blanc du bas d'écran (~,88) — feu : #fff0d0 → --nL #ffd58f → #ffc070 → #ffa449 →
   --nP #ff8d2e → #ff8020 → --nS #ff7415 → #d85a0c → --nO #ad4200 ; réserve : #eef2ff → --bL #b5c4ff → #93a8fc → #7088fa → --bP #4a68f0 → #3a56dc
   → --bS #2a44c8 → #1f3398 → --bO #16247a ; infinie : #fbf3ff → --vL #f1dcff → #d6a6ff → #c38aff → --vP #b06bff → #9d54ff → --vS #8a3dff →
   #6526c6 → --vO #3e1287. La fumée (10e nuance) reste celle de Léo. */
const NFEU_P10={f:[[2.95,2.87,2.58],[2.3,2.03,1.51],[1.91,1.53,.99],[1.82,1.25,.68],[1.55,.88,.49],[1.99,1.06,.52],[1.7,.78,.4],[.43,.27,.14],[.32,.2,.12],[.2,.17,.17]],
  b:[[2.63,2.67,2.67],[1.89,2.02,2.37],[.67,.74,1],[.48,.54,.8],[.35,.4,.66],[.28,.32,.51],[.22,.23,.38],[.16,.15,.22],[.12,.11,.15],[.17,.17,.22]],
  v:[[2.9,2.5,2.45],[2.8,1.5,1.4],[2.4,.62,.5],[2.1,.3,.22],[1.8,.16,.1],[1.9,.2,.12],[1.5,.12,.08],[.5,.08,.06],[.2,.05,.04],[.2,.16,.16]],
  m:[[1.5,1.75,2.5],[2.2,1.95,1.5],[2.3,1.55,.6],[2.15,1.05,.22],[1.95,.78,.12],[1.85,.6,.08],[1.62,.42,.06],[1.3,.24,.04],[.7,.1,.03],[.2,.17,.17]]}; // m : le feu du MOTEUR — un pied BLEUTÉ, comme un vrai échappement, puis l'orange (qui tient : un retour de flamme est orange, pas rouge)
const NFEU_FIN={taille:.73,taux:1.7,pas:0},NFEU_SOL={det:.45,vent:.9};
/* (2026-10-15 soir, Sacha : « retravaille toutes les traînées, il faut qu'elles soient toutes désirables ») LE FEU À LA COULEUR DE LA TRAÎNÉE — VU au
   banc : derrière la caisse, le plus gros, c'est le FEU DE PIXELS du nitro, et il restait orange (bleu en réserve, violet en infini) quelle que soit la
   traînée achetée : MENTHE, ROSE, POUDRE D'OR… ne se voyaient qu'en un filet. Avec une traînée de la boutique, le feu prend SA couleur : dix nuances
   tirées d'elle, comme celles du feu orange (le cœur chauffé à blanc, la couleur pleine, la braise, la fumée). La réserve et l'infini restent lisibles :
   le feu y tire vers le bleu / le violet (le cœur 8 %, la braise et la fumée 30 %). `?trainee=signal` = le feu d'avant. */
const NFEU_TR={cle:'',pal:null,b:null,v:null};
function nfeuPalTrainee(){if(TRAINEE_SIGNAL||typeof FX_EFF==='undefined'||!FX_EFF||!FX_EFF.teinte)return null;const c=FX_EFF.teinte,cle=c.join(',');if(NFEU_TR.cle===cle)return NFEU_TR;
  const m=Math.max(c[0],c[1],c[2],.05),n=[c[0]/m,c[1]/m,c[2]/m],LV=[2.4,2.3,2.2,2.05,1.85,1.62,1.38,1.08,.6],W=[.3,.55,.78,.92,1,1,1,1,1],P=[];
  for(let i=0;i<9;i++){const l=LV[i],w=W[i];P.push([l*(1-w+w*n[0]),l*(1-w+w*n[1]),l*(1-w+w*n[2])]);}P.push([.2,.17,.17]);
  const mix=(A,B,k)=>A.map(function(a,i){return [a[0]+(B[i][0]-a[0])*k,a[1]+(B[i][1]-a[1])*k,a[2]+(B[i][2]-a[2])*k];});
  NFEU_TR.cle=cle;NFEU_TR.pal=P;NFEU_TR.b=mix(P,NFEU_P10.b,.3);NFEU_TR.v=mix(P,NFEU_P10.v,.3);for(let i=0;i<3;i++){NFEU_TR.b[i]=mix([P[i]],[NFEU_P10.b[i]],.08)[0];NFEU_TR.v[i]=mix([P[i]],[NFEU_P10.v[i]],.08)[0];}return NFEU_TR;} /* le CŒUR garde la couleur achetée (8 %), la braise et la fumée disent la réserve (30 %) */
/* (2026-10-15, Léo : « ce qui manque, c'est la physique de la vitesse : là on dirait du slime ; ça devrait avoir l'air PROPULSÉ, plus dynamique, mais
   smooth le mouvement ») LE JET PROPULSÉ (`NFEU_JET`) : le feu SORT du pot à 13-26 m/s (×3-4), freine fort (le gaz s'étale dans l'air), vit moins
   longtemps ; serré à la sortie, il ne s'ouvre et ne tourbillonne qu'en vieillissant ; chaque cube s'ÉTIRE le long du jet tant qu'il file (une
   traînée de vitesse qui redevient un pixel en ralentissant) ; plus de grille (le mouvement est lisse) ; au sol, il traîne moins (det ,45) et le
   vent de la trajectoire le couche plus franchement (vent ,9). */
const NFEU_JET={v0:13,vK:.025,vMax:26,frein:3.2,vie:.72,serre:.7,etire:.075,etMax:2.2,chaud:.06}; // chaud : le cœur blanc-jaune tient plus loin de la tuyère
const NFEU=(function(){
  const bx=new THREE.BoxGeometry(1,1,1),ps=bx.attributes.position,nm=bx.attributes.normal,cl=new Float32Array(ps.count*3);
  for(let i=0;i<ps.count;i++){const ny=nm.getY(i),nz=nm.getZ(i),v=ny>.5?1:ny<-.5?.42:nz<-.5?.6:nz>.5?.5:.78;cl[i*3]=cl[i*3+1]=cl[i*3+2]=v;} // l'ombrage de la porte, face par face
  bx.setAttribute('color',new THREE.BufferAttribute(cl,3));
  const A=new THREE.InstancedMesh(bx,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false}),NFEU_N); // ⚠ les réglages EXACTS des cubes de l'arc-en-ciel : même programme
  const B=new THREE.InstancedMesh(new THREE.BoxGeometry(1.5,1.5,1.5),new THREE.MeshBasicMaterial({fog:false,toneMapped:false,transparent:true,opacity:.06,
    blending:THREE.AdditiveBlending,depthWrite:false}),NFEU_N); // le HALO : là où les cubes s'entassent, la lumière s'accumule
  A.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(NFEU_N*3),3);
  A.instanceMatrix.setUsage(THREE.DynamicDrawUsage);A.instanceColor.setUsage(THREE.DynamicDrawUsage);
  B.instanceMatrix=A.instanceMatrix;B.instanceColor=A.instanceColor;
  A.count=B.count=0;A.frustumCulled=B.frustumCulled=false;A.visible=B.visible=false;B.renderOrder=2;scene.add(A);scene.add(B);
  const V=function(){return [0,1,2,3].map(function(){return new THREE.Vector3();});};
  return {m:A,h:B,P:new Float32Array(NFEU_N*12),n:0,k:0,vs:9,T:0,acc:new Float32Array(4),ou:new Float32Array(4),tg:new Float32Array([0,2.1,4.2,1]),cp:new Float32Array(4),
    pw:V(),D:V(),R:V(),U:V(),dp:4,kd:1,lp:new Float32Array(4),am:new Float32Array(4),up:new THREE.Vector3(),M:new THREE.Matrix4(),pp:new THREE.Vector3(),pOk:false,v:new THREE.Vector3(),pal:null,ms:0,on:FLM_ON,
    Q:new Float32Array(NFEU_N*4),vh:new THREE.Vector3(),r9:new THREE.Vector3(),d9:new THREE.Vector3(),libre:!/[?&]nfeu=colle\b/.test(location.search)}; // Q, libre : LE FEU QUI SE DÉTACHE en vol (voir nfeuPas)
})();
/* (2026-10-15, Sacha : « quand on fait des figures, il faut que les gerbes pixel du nitro soient bien gérées ») LE FEU SE DÉTACHE EN VOL.
   Chaque cube était recalculé à CHAQUE image dans le repère de la caisse d'ALORS : pendant un salto, une toupie ou un tonneau, tout le
   panache (4 à 10 m en vol, la caméra recule) et les boules de feu des appuis NITRO tournaient d'un bloc avec elle — une hélice de cubes
   vissée au pare-chocs, qui balayait l'écran. Désormais, en vol, un cube garde l'ASSIETTE de la caisse à l'instant où il est sorti du pot
   (genre 3, son quaternion dans `Q`) : il suit la caisse en translation, mais sa direction est celle du pot quand il en est sorti. La
   figure dessine une SPIRALE de feu, la gerbe de l'allumage reste là où elle a éclaté, et les cubes en fin de vie se couchent dans le
   vent relatif (l'arrière de la trajectoire, `vh`). Chaque cube garde aussi son orientation de naissance (ils ne pivotent plus tous
   ensemble). Au sol rien ne change : le feu reste collé au repère de la caisse, au pixel près (le réglage mesuré du 15/10).
   `?nfeu=colle` = l'ancien comportement ; `dbgFlamme('libre',0|1)`. */
function nfeuRot(qx,qy,qz,qw,vx,vy,vz,o){const tx=2*(qy*vz-qz*vy),ty=2*(qz*vx-qx*vz),tz=2*(qx*vy-qy*vx); // v tourné par le quaternion q (sans allocation)
  o.x=vx+qw*tx+qy*tz-qz*ty;o.y=vy+qw*ty+qz*tx-qx*tz;o.z=vz+qw*tz+qx*ty-qy*tx;return o;}
function nfeuNp(){return Math.min(4,CAR_POTS.length,JETS.shells.length);}
function nfeuNait(i,b,gros,suie,mi){ // une flamme-cube dans la bouche du pot i ; layout : s u v · vs vu vv · âge vie taille graine pot genre (0 nitro · 2 étincelle · 3 MOTEUR, en minuscule)
  const N=NFEU;if(N.n>=NFEU_N)return;const o=N.n*12,P=N.P,M9=NFEU_MINI;N.n++;
  const a=!mi&&Math.random()<.62?N.tg[i]+flmGauss()*.75:Math.random()*6.2832,r0=(.05+.07*Math.random())*(mi?.5:1),vr=mi?M9.r*(.35+.9*Math.random())*(gros?1.7:1)*(1+.5*(N.kd-1)):(.6+.8*Math.random())*(1+.45*b)*(gros?2.4:1)*(1+.5*(N.kd-1))*(gros?1:NFEU_JET.serre),ca=Math.cos(a),sa=Math.sin(a); // mi : la GERBE du moteur (dans tous les sens)
  const pt=CAR_POTS[i],sd9=!pt?0:pt.x>.06?1:pt.x<-.06?-1:(Math.random()<.5?-1:1); // le pot de droite crache à droite, celui de gauche à gauche (un pot central : des deux côtés)
  P[o]=Math.random()*.12;P[o+1]=ca*r0;P[o+2]=sa*r0;
  P[o+3]=(mi?M9.va*(1+.45*(N.kd-1)):N.vs)*(.75+.5*Math.random())*(gros?1.1:suie?.6:1);P[o+4]=ca*vr+(mi?0:sd9*(.3+.7*Math.random()));P[o+5]=sa*vr+(mi?.15*Math.random():gros?0:.2+.5*Math.random()); // un peu vers l'extérieur, à peine vers le haut (voir N.vs)
  P[o+6]=0;P[o+7]=(.22+.2*Math.random()+.07*b)*(gros?1.35:1)*(mi?M9.vie:1)*NFEU_JET.vie;P[o+8]=(.13+.07*Math.random())*(1+.25*b)*(gros?1.3:1)*N.kd*(mi?M9.t:1)*NFEU_FIN.taille;
  P[o+9]=(suie?Math.random()*.4:Math.random())+(mi?2:0);P[o+10]=i;P[o+11]=0; // mi : la GRAINE +2 marque le feu du MOTEUR (le genre 3 est le feu DÉTACHÉ en vol, celui de Sacha)
  {const q=carGroup.quaternion,q4=o/3;N.Q[q4]=q.x;N.Q[q4+1]=q.y;N.Q[q4+2]=q.z;N.Q[q4+3]=q.w;if(N.libre&&mode==='fall')P[o+11]=3;}} // l'assiette de sa NAISSANCE, toujours (le feu fluide au sol la lit aussi) ; né en vol : DÉTACHÉ
function nfeuEtincelle(i,k9){ // un petit cube qui gicle DANS LE MONDE (il garde l'élan de la caisse, retombe, refroidit) ; k9 : sa taille (le crépitement du moteur : ,4)
  k9=k9||1;const N=NFEU;if(N.n>=NFEU_N||!N.pOk)return;const o=N.n*12,P=N.P,w=N.pw[i],D=N.D[i],r=(6+6*Math.random())*(k9<1?.6:1);N.n++;
  P[o]=w.x;P[o+1]=w.y;P[o+2]=w.z;
  P[o+3]=N.v.x-D.x*r+(Math.random()-.5)*3.2;P[o+4]=N.v.y-D.y*r+1.5+2.5*Math.random();P[o+5]=N.v.z-D.z*r+(Math.random()-.5)*3.2;
  P[o+6]=0;P[o+7]=(.3+.25*Math.random())*(k9<1?.7:1);P[o+8]=(.06+.05*Math.random())*k9;P[o+9]=Math.random();P[o+10]=i;P[o+11]=2;}
function nfeuGicle(x,y,z,vx,vy,vz,s){ // (2026-10-15) un cube de feu craché par la TRAÎNÉE DE LUMIÈRE, n'importe où sur sa longueur
  const N=NFEU;if(!N.on||N.n>=NFEU_N-80)return false;const o=N.n*12,P=N.P;N.n++; // ⚠ on laisse 80 places : le feu des pots passe d'abord
  P[o]=x;P[o+1]=y;P[o+2]=z;P[o+3]=vx;P[o+4]=vy;P[o+5]=vz;P[o+6]=0;P[o+7]=.35+.35*Math.random();P[o+8]=s;P[o+9]=Math.random();P[o+10]=0;P[o+11]=2;return true;}
function nfeuCoup(k){ // L'ALLUMAGE : une boule de feu par pot + une gerbe d'étincelles (appelé par nitroAllume)
  if(!NFEU.on)return;const np=nfeuNp();
  for(let i=0;i<np;i++){for(let j=0,n=(30*k)|0;j<n;j++)nfeuNait(i,1.4,true,false);for(let j=0,n=(10*k)|0;j<n;j++)nfeuEtincelle(i);}}
function nfeuFin(){ // L'EXTINCTION : la dernière bouffée, lente et sale (appelé par nitroEteint)
  if(!NFEU.on)return;const np=nfeuNp();
  for(let i=0;i<np;i++)for(let j=0;j<16;j++)nfeuNait(i,.3,false,true);}
function nfeuCoupe(){const N=NFEU;N.n=0;N.k=0;N.pOk=false;N.m.count=N.h.count=0;N.m.visible=N.h.visible=false;} // replacement, explosion : rien ne reste figé
function nfeuPas(dt,on,bleu,inf,speedKmh,F,mot){ // F : le moteur simulé (FLM) · mot : la flamme du MOTEUR doit se voir (hors nitro)
  const N=NFEU;if(!N.on)return;
  const np=nfeuNp(),vise=on&&np>0&&mode!=='boom'?1:0;
  N.k+=(vise-N.k)*Math.min(1,dt*(vise>N.k?14:7));
  if(!N.n&&N.k<.01&&!mot){if(N.m.visible)N.m.visible=N.h.visible=false;N.pOk=false;return;}
  const t0=performance.now();dt=Math.min(dt,.05);N.T+=dt;
  const cp=carGroup.position;
  if(N.pOk&&dt>0)N.v.subVectors(cp,N.pp).multiplyScalar(1/dt);else N.v.set(0,0,0);N.pp.copy(cp);N.pOk=true;
  if(N.v.lengthSq()>4e4)N.v.set(0,0,0); // un replacement (téléport) n'est pas une vitesse
  N.up.set(0,1,0).applyQuaternion(carGroup.quaternion);
  for(let i=0;i<np;i++){potMonde(CAR_POTS[i],N.pw[i]);const D=N.D[i].copy(JET_DIR[i]).applyQuaternion(carGroup.quaternion).normalize();
    const R=N.R[i].crossVectors(D,N.up);if(R.lengthSq()<1e-4)R.set(1,0,0);R.normalize();N.U[i].crossVectors(R,D).normalize();}
  N.vs=Math.min(NFEU_JET.vMax,NFEU_JET.v0+Math.abs(speedKmh)*NFEU_JET.vK); /* (le JET PROPULSÉ) — avant : 3,2 à 7 m/s, la vitesse d'un slime */ /* plus la caisse file, plus le vent étire le feu (1,3 à 2 m). MESURÉ (dbgFlamme('proj')) : debout, la caméra de poursuite
     regarde la poupe presque d'AU-DESSUS (les pots à −0,6 de la hauteur d'écran, à 3,8 m) — un feu qui MONTE fonce dans l'objectif et fait un mur, un feu qui
     s'ÉLARGIT barre tout le bas de l'écran : il file donc à plat sur la route, pas plus large que la caisse, et c'est sa matière qui le rend vénère */
  {let T9=null;try{T9=nfeuPalTrainee();}catch(e9){}N.pal=T9?(bleu?T9.b:inf?T9.v:T9.pal):bleu?NFEU_P10.b:inf?NFEU_P10.v:NFEU_P10.f;} /* (2026-10-15 soir) le feu à la couleur de la traînée achetée */
  N.dp=np?camera.position.distanceTo(N.pw[0]):4;N.kd=Math.pow(Math.min(3.2,Math.max(1,N.dp/3.8)),.75); // la caméra RECULE (en vol : ~21 m) : le feu grossit, sinon il n'est plus que trois points
  N.vs*=1+.45*(N.kd-1);
  if(N.k>.02&&np){const q=(QUAL_LOW?.6:1)*(REDUCED_MOTION?.5:1)*(mobhChaud()?MOBH_R.feu:1);
    for(let i=0;i<np;i++){
      N.ou[i]+=-N.ou[i]*dt/.25+.7*Math.sqrt(dt)*flmGauss(); // le souffle de ce pot : jamais périodique
      if(N.cp[i]>0)N.cp[i]-=dt;else if(Math.random()<dt*.9)N.cp[i]=.1+.12*Math.random(); // un COUP de feu, au hasard (~1 par seconde)
      const b=Math.max(0,Math.min(1.6,.5+.7*N.ou[i]+(N.cp[i]>0?.9:0)));
      N.tg[i]+=dt*(2.2+2.5*N.ou[i]); // la LANGUE tourne autour de l'axe, jamais au même pas
      N.acc[i]+=dt*430*NFEU_FIN.taux*N.k*(.55+.75*b)*q/Math.sqrt(Math.max(1,np)/2);
      while(N.acc[i]>=1){N.acc[i]-=1;nfeuNait(i,b,false,false);}
      if(Math.random()<dt*22*N.k*q)nfeuEtincelle(i);}}
  /* (2026-10-15, Léo : « fais vraiment juste comme le NITRO, mais vraiment en minuscule ») LA FLAMME DU MOTEUR : le même feu de pixels, en
     minuscule (NFEU_MINI) — son débit suit les BOUFFÉES du moteur simulé (FLM : la cadence, la charge, la houle, le rupteur en vol, le pied
     levé qui l'éteint), et chaque POP (passage de rapport, pied levé, pose) lâche une petite boule de feu. */
  if(mot&&np&&F&&N.k<.5){const q=(QUAL_LOW?.6:1)*(REDUCED_MOTION?.5:1)*(mobhChaud()?MOBH_R.feu:1),vol9=mode==='fall',crk9=(ENG_SND[Math.max(0,Math.min(ENG_SND.length-1,engTier|0))]||ENG_SND[0]).crk||0; // crk9 : le crépitement du moteur (la table du SON, lue seulement)
    for(let i=0;i<np;i++){const p=F.P[i];
      N.ou[i]+=-N.ou[i]*dt/.25+.7*Math.sqrt(dt)*flmGauss();N.tg[i]+=dt*(2.2+2.5*N.ou[i]); // ses langues tournent comme celles du nitro
      if(p.pop>N.lp[i]+.25){const n9=Math.round((5+9*p.pop)*q);for(let k=0;k<n9;k++)nfeuNait(i,1.2,true,false,true);for(let k=0,ne=2+((Math.random()*4)|0);k<ne;k++)nfeuEtincelle(i,.42);} // un POP : une petite boule de feu, et ses étincelles qui CRÉPITENT
      N.lp[i]=p.pop;
      const ou9=(1-.85*F.ov)*(vol9&&!F.limOn?0:1);
      N.am[i]+=dt*NFEU_MINI.taux*.35*Math.min(1.6,F.L[i])*ou9*q; // un filet continu (le tiers)…
      while(N.am[i]>=1){N.am[i]-=1;nfeuNait(i,.25+.5*F.ch,false,false,true);}
      if(p.pz){const nb=p.pz;p.pz=0; /* …et LES BOUFFÉES : chacune crache sa petite rafale, au rythme tiré du moteur simulé — le feu CRÉPITE (une forte : une étincelle) */
        for(let k=0;k<nb;k++){const n9=Math.round((1+2.2*(p.pa||1))*(.55+.7*F.ch)*ou9*q*Math.random()*2);for(let j9=0;j9<n9;j9++)nfeuNait(i,.3+.4*F.ch,false,false,true);
          if((p.pa||1)>1.3&&Math.random()<.5*ou9)nfeuEtincelle(i,.4);
          if(Math.random()<NFEU_MINI.crq*(1+crk9)*(.4+.6*ou9)){const n8=Math.round((3+4*Math.random())*q);for(let j9=0;j9<n8;j9++)nfeuNait(i,.9,true,false,true);if(Math.random()<.6)nfeuEtincelle(i,.35);}}}}} // LE CRÉPITEMENT : une bouffée sur ~14 CLAQUE (une petite boule et son éclat) — plus souvent sur un moteur qui crépite (crk du son)
  const P=N.P,cam=camera.position,col=N.m.instanceColor.array,ar=N.m.instanceMatrix.array,pal=N.pal;
  const dp=N.dp,fA=dp*.6,fB=dp*.35; /* LE PIXEL GARDE SA TAILLE À L'ÉCRAN (la fumée du burn-out : des gros pixels « les MÊMES près ou loin ») :
     la caméra de poursuite est HAUTE et PROCHE (3,6-4 m des pots, mesuré) ; un cube qui file vers elle grossissait jusqu'à faire un mur au bas
     de l'écran. Sa taille suit donc sa distance à l'objectif, rapportée à celle des pots — et tout près, il s'efface */
  N.M.makeRotationFromQuaternion(carGroup.quaternion);const e=N.M.elements; // les cubes s'alignent sur la caisse
  const K=.92+.18*N.k;let n=0;
  const Q=N.Q,qc=carGroup.quaternion,C=carGroup.position,vol9=N.libre&&mode==='fall',ix=-qc.x,iy=-qc.y,iz=-qc.z,iw=qc.w,r9=N.r9,d9v=N.d9; // (le feu qui se détache) ix…iw : l'assiette d'à présent, inversée
  const vl9=N.v.length(),vh=N.vh;if(vl9>2)vh.copy(N.v).multiplyScalar(-1/vl9);else vh.set(0,0,0); // le VENT RELATIF : l'arrière de la trajectoire (rien si la caisse est arrêtée)
  const HB9=N.hist||(N.hist=new Float32Array(10));HB9.fill(0); // (2026-10-18, Sacha) LA PART DE CHAQUE NUANCE dans le feu de cette image (voir bmapTrainee : les bords de la route clignotent pareil)
  for(let j=0;j<N.n;j++){const o=j*12,q4=j*4;
    P[o+6]+=dt;const a=P[o+6]/P[o+7];if(a>=1)continue; // morte : pas recopiée
    let x,y,z,b,sz,e0=e[0],e1=e[1],e2=e[2],e4=e[4],e5=e[5],e6=e[6],e8=e[8],e9=e[9],e10=e[10];
    if(vol9&&P[o+11]===0)P[o+11]=3; // né au sol, encore vivant au décollage : il se détache à son tour (Q : l'assiette de sa naissance, posée par nfeuNait — le feu fluide du sol s'en servait déjà)
    if(P[o+11]===2){P[o+4]-=9*dt;P[o]+=P[o+3]*dt;P[o+1]+=P[o+4]*dt;P[o+2]+=P[o+5]*dt;x=P[o];y=P[o+1];z=P[o+2];b=a<.3?1:a<.65?3:5;sz=P[o+8]*(1-.5*a);} /* les étincelles : jaune d'or → orange → orange profond (les 10 nuances) */
    else{const i=P[o+10]|0,s=P[o],mi9=P[o+9]>=2,sd=mi9?P[o+9]-2:P[o+9],dr=Math.exp(-1.1*dt); // mi9 : le feu du MOTEUR (graine +2)
      const a9=a+.18*Math.min(1,Math.sqrt(P[o+1]*P[o+1]+P[o+2]*P[o+2])/.55)+(sd-.5)*.14-(mi9?NFEU_MINI.bleu:NFEU_JET.chaud); /* le feu du MOTEUR : un pied bleu très court à la bouche, puis le jaune et l'orange ; le NITRO garde plus longtemps son cœur blanc-jaune (la postcombustion) */ // le CŒUR du jet reste chaud, ses bords refroidissent plus tôt ; un peu de hasard par cube (le bord dentelé)
      b=0;while(b<9&&a9>=NFEU_B10[b])b++; // les 10 NUANCES
      if((b===8&&sd>.55)||(b===9&&sd>.3))continue;
      if(sd<.13&&b>0&&b<8)b-=b>3?2:1; // des POCHES CHAUDES : un cube sur huit brûle plus jaune que ses voisins (le feu classique scintille) // la plupart s'éteignent avant : quelques braises sombres, et moins encore de cubes de FUMÉE finissent le feu
      P[o+3]*=Math.exp(-NFEU_JET.frein*dt);P[o+4]*=dr;P[o+5]*=dr;const tb9=4*Math.min(1,a*2.2); // (le JET) serré à la sortie, il ne tourbillonne qu'en vieillissant
      P[o+4]+=Math.sin(s*2.7+sd*6.3+N.T*9.1)*tb9*dt;P[o+5]+=(Math.cos(s*2.3+sd*5.1-N.T*7.7)*tb9+2)*dt; // le tourbillon, et le feu monte un peu
      P[o]+=P[o+3]*dt;P[o+1]+=P[o+4]*dt;P[o+2]+=P[o+5]*dt;
      const pa9=(mi9?NFEU_PAS*NFEU_MINI.pas:NFEU_PAS)*NFEU_FIN.pas,qs=pa9?Math.round(P[o]/pa9)*pa9:P[o],qu=pa9?Math.round(P[o+1]/pa9)*pa9:P[o+1],qv=pa9?Math.round(P[o+2]/pa9)*pa9:P[o+2]; // (pas 0 : plus de grille, le mouvement est lisse) // de case en case (le feu du moteur : une grille plus fine)
      const w=N.pw[i],D=N.D[i],R=N.R[i],U=N.U[i];
      x=w.x+D.x*qs+R.x*qu+U.x*qv;y=w.y+D.y*qs+R.y*qu+U.y*qv;z=w.z+D.z*qs+R.z*qu+U.z*qv;sz=P[o+8]*NFEU_T10[b];
      if(P[o+11]===0&&N.libre){ /* FLUIDE AU SOL : une PART de l'assiette de naissance (jusqu'à NFEU_SOL.det, qui monte avec l'âge) — le feu traîne dans les virages —
           et en fin de vie le cube se couche dans le vent de la trajectoire (une glisse, un drift) */
        const bx=Q[q4],by=Q[q4+1],bz=Q[q4+2],bw=Q[q4+3];
        let dw=bw*iw-bx*ix-by*iy-bz*iz,dqx=bw*ix+bx*iw+by*iz-bz*iy,dqy=bw*iy-bx*iz+by*iw+bz*ix,dqz=bw*iz+bx*iy-by*ix+bz*iw;
        if(dw<0){dw=-dw;dqx=-dqx;dqy=-dqy;dqz=-dqz;}
        const wt=Math.min(1,a*1.6)*NFEU_SOL.det;dqx*=wt;dqy*=wt;dqz*=wt;dw=1-wt+dw*wt;const l9=Math.hypot(dqx,dqy,dqz,dw)||1;dqx/=l9;dqy/=l9;dqz/=l9;dw/=l9;
        nfeuRot(dqx,dqy,dqz,dw,x-C.x,y-C.y,z-C.z,r9);x=C.x+r9.x;y=C.y+r9.y;z=C.z+r9.z;
        if(vl9>2){const w9=NFEU_SOL.vent*a*a*qs;nfeuRot(dqx,dqy,dqz,dw,D.x,D.y,D.z,d9v);x+=w9*(vh.x-d9v.x);y+=w9*(vh.y-d9v.y);z+=w9*(vh.z-d9v.z);}}
      if(P[o+11]===3){ /* DÉTACHÉ : le point calculé dans le repère d'à présent est ramené dans celui de sa naissance, autour du centre de la caisse
           (Δ = q_naissance · q_présent⁻¹) — il suit la caisse en translation, pas en rotation */
        const bx=Q[q4],by=Q[q4+1],bz=Q[q4+2],bw=Q[q4+3];
        const dw=bw*iw-bx*ix-by*iy-bz*iz,dqx=bw*ix+bx*iw+by*iz-bz*iy,dqy=bw*iy-bx*iz+by*iw+bz*ix,dqz=bw*iz+bx*iy-by*ix+bz*iw;
        nfeuRot(dqx,dqy,dqz,dw,x-C.x,y-C.y,z-C.z,r9);x=C.x+r9.x;y=C.y+r9.y;z=C.z+r9.z;
        if(vl9>2){const w9=.75*a*a*qs;nfeuRot(dqx,dqy,dqz,dw,D.x,D.y,D.z,d9v); // en fin de vie, le cube se couche dans le vent : son élan quitte l'axe du pot pour l'arrière de la trajectoire
          x+=w9*(vh.x-d9v.x);y+=w9*(vh.y-d9v.y);z+=w9*(vh.z-d9v.z);}
        const x2=bx+bx,y2=by+by,z2=bz+bz,xx=bx*x2,xy=bx*y2,xz=bx*z2,yy=by*y2,yz=by*z2,zz=bz*z2,wx=bw*x2,wy=bw*y2,wz=bw*z2; // et le cube garde l'orientation de sa naissance
        e0=1-(yy+zz);e1=xy+wz;e2=xz-wy;e4=xy-wz;e5=1-(xx+zz);e6=yz+wx;e8=xz+wy;e9=yz-wx;e10=1-(xx+yy);}}
    const dx=x-cam.x,dy=y-cam.y,dz=z-cam.z,d9=Math.sqrt(dx*dx+dy*dy+dz*dz);sz*=Math.min(1.25,Math.max(.3,d9/dp));if(d9<fA)sz*=Math.max(0,(d9-fB)/(fA-fB));
    const g9=P[o+11]===2,mi8=!g9&&P[o+9]>=2,st9=g9?0:Math.min(NFEU_JET.etMax,P[o+3]*NFEU_JET.etire*(mi8?NFEU_MINI.et:1)); // (le JET) st9 : l'étirement le long du jet, tant que le cube file
    if(n!==j){P.copyWithin(n*12,o,o+12);Q.copyWithin(n*4,q4,q4+4);}
    if(st9>.02){const Dj=N.D[P[n*12+10]|0],dx9=Dj.x,dy9=Dj.y,dz9=Dj.z; // chaque colonne c de la matrice devient c + st9·D·(D·c) : le cube s'allonge sur l'axe du jet, pas sur celui de la caisse
      let t9=dx9*e0+dy9*e1+dz9*e2;e0+=st9*dx9*t9;e1+=st9*dy9*t9;e2+=st9*dz9*t9;t9=dx9*e4+dy9*e5+dz9*e6;e4+=st9*dx9*t9;e5+=st9*dy9*t9;e6+=st9*dz9*t9;
      t9=dx9*e8+dy9*e9+dz9*e10;e8+=st9*dx9*t9;e9+=st9*dy9*t9;e10+=st9*dz9*t9;}
    const m=n*16;ar[m]=e0*sz;ar[m+1]=e1*sz;ar[m+2]=e2*sz;ar[m+3]=0;ar[m+4]=e4*sz;ar[m+5]=e5*sz;ar[m+6]=e6*sz;ar[m+7]=0;
    ar[m+8]=e8*sz;ar[m+9]=e9*sz;ar[m+10]=e10*sz;ar[m+11]=0;ar[m+12]=x;ar[m+13]=y;ar[m+14]=z;ar[m+15]=1;
    const c=(mi8?NFEU_P10.m:pal)[b],kk=K*(.92+.16*((P[n!==j?n*12+9:o+9]*7.31)%1));col[n*3]=c[0]*kk;col[n*3+1]=c[1]*kk;col[n*3+2]=c[2]*kk;if(on&&!mi8)HB9[b]+=sz*sz;n++;} /* kk : chaque cube son éclat (± 8 %) — HB9 : sa nuance, au poids de sa surface, pendant le nitro (le feu et le crépitement du MOTEUR ne sont pas la traînée) */
  {let s9=0;for(let i=0;i<10;i++)s9+=HB9[i];const PT9=N.part||(N.part=Float32Array.from(BMAP_PART0));if(s9>0){const k9=Math.min(1,dt*8);for(let i=0;i<10;i++)PT9[i]+=(HB9[i]/s9-PT9[i])*k9;}} // lissée sur ~0,12 s ; sans feu, la dernière part reste
  N.n=n;N.m.count=N.h.count=n;N.m.visible=N.h.visible=n>0;if(n){N.m.instanceMatrix.needsUpdate=true;N.m.instanceColor.needsUpdate=true;}
  N.ms=N.ms*.95+(performance.now()-t0)*.05;}
window.dbgFlamme=function(o){ // (banc) l'état du moteur simulé et du feu ; dbgFlamme('nfeu',0|1) coupe / rend le feu de pixels
  if(o==='nfeu'){NFEU.on=!!arguments[1];if(!NFEU.on)nfeuCoupe();return NFEU.on;}
  if(o==='libre'){if(arguments.length>1)NFEU.libre=!!arguments[1];let c=0;for(let j=0;j<NFEU.n;j++)if(NFEU.P[j*12+11]===3)c++;return {libre:NFEU.libre,detaches:c,n:NFEU.n,mode:mode};} // (banc) le feu qui se détache en vol : 1 = détaché, 0 = collé à la caisse (l'ancien)
  if(o==='proj'){const ar=NFEU.m.instanceMatrix.array,v=new THREE.Vector3(),r=[];for(let j=0;j<NFEU.n;j++){const m=j*16;v.set(ar[m+12],ar[m+13],ar[m+14]);const d=v.distanceTo(camera.position),sz=Math.hypot(ar[m],ar[m+1],ar[m+2]);v.project(camera);r.push([+d.toFixed(2),+(v.y).toFixed(2),+sz.toFixed(2),NFEU.P[j*12+11]]);}
    const w=new THREE.Vector3();potMonde(CAR_POTS[0],w);const pw9=w.toArray().map(x=>+x.toFixed(2)),dpot=w.distanceTo(camera.position);w.project(camera);return {dir:JET_DIR.map(function(d){return d.toArray().map(x=>+x.toFixed(2));}),pots:CAR_POTS.map(function(d){return d.toArray().map(x=>+x.toFixed(2));}),parPot:[0,1,2,3].map(function(i){let c=0;for(let j=0;j<NFEU.n;j++)if((NFEU.P[j*12+10]|0)===i&&(NFEU.P[j*12+11]===0||NFEU.P[j*12+11]===3))c++;return c;}),pot:[+dpot.toFixed(2),+w.y.toFixed(2),+w.x.toFixed(3)],pw:pw9,cam:camera.position.toArray().map(x=>+x.toFixed(1)),car:carGroup.position.toArray().map(x=>+x.toFixed(1)),cubes:r};} // (banc) où tombent les cubes : distance, hauteur à l'écran (−1 bas, +1 haut), taille
  const F=FLM;return {on:FLM_ON,rpm:+F.rpm.toFixed(2),rapport:F.g,charge:+F.ch.toFixed(2),lacher:+F.ov.toFixed(2),chaleur:+F.heat.toFixed(2),pop:+F.pop.toFixed(2),
    L:Array.from(F.L).map(function(x){return +x.toFixed(2);}),mini:MOTEUR_MINI,feu:{n:NFEU.n,k:+NFEU.k.toFixed(2),ms:+NFEU.ms.toFixed(3),pots:nfeuNp(),cam:+camera.position.distanceTo(NFEU.pw[0]).toFixed(2)}};};
/* LES POTS DE LA CAISSE (2026-09-26, user : « pour chaque skin, les flammes des pots d'échappement et la traînée de nitro au bon
   endroit ») — MESURÉ : toutes les flammes, la traînée et la lueur sortaient d'une formule unique (±22 % de la largeur, 43 cm,
   au bout de la fiche), alors que 58 caisses sur 66 dessinent LEURS pots : d'un seul côté, au centre, par quatre, en turbine,
   en tuyères… La flamme sortait sous le pare-chocs ou dans le vide. Désormais `buildCar` relève les VRAIS pots (repère caisse,
   point de sortie) : `CAR_POTS` ; la traînée s'accroche à la moyenne des pots de chaque côté (`CAR_POT_L/R`), ou à un SEUL
   ruban si les pots sont d'un côté ou au centre (`CAR_POT_1`) ; `potMonde` les suit à travers le roulis de la carrosserie. */
const CAR_POTS=[],CAR_POT_L=new THREE.Vector3(),CAR_POT_R=new THREE.Vector3(),CAR_POT_C=new THREE.Vector3();
let CAR_POT_1=false,CAR_POT_SRC='canon';
/* LES FEUX ARRIÈRE (2026-10-15, Sacha : « les traînées doivent maintenant partir des feux arrière — ce sont des TRAÎNÉES DE LUMIÈRE ; adapte
   cette règle au feu arrière de toutes les voitures ») : `buildCar` relève les VRAIS feux rouges de la caisse (les pièces `l` rouges du kit,
   dans les 90 cm de la poupe), un point par côté (`CAR_FEUX`, repère caisse) ; sinon la place des feux du gabarit (`A.tl`). Les sillages
   (`SILS`) et les halos des feux (`HALO.t`) s'y accrochent ; `potMonde` les suit à travers le roulis. */
const CAR_FEUX=[];let CAR_FEUX_SRC='gabarit';
window.dbgFeux=function(){const d9=new THREE.Vector3();carGroup.getWorldDirection(d9);return {cap:+Math.atan2(d9.x,d9.z).toFixed(3),src:CAR_FEUX_SRC,feux:CAR_FEUX.map(function(v){return v.toArray().map(function(x){return +x.toFixed(2);});}),pots:CAR_POTS.length,sils:SILS.map(function(t){return {n:t.n,lg:+t.lg.toFixed(1),hk:+t.hk.toFixed(2),vis:t.m.visible};})};}; // (banc) où naissent les traînées de lumière
function potMonde(v,out){ // un point du repère caisse → monde, À TRAVERS la carrosserie qui penche (carBody) : le pot bouge avec elle
  return out.copy(v).applyEuler(carBody.rotation).add(carBody.position).multiply(carGroup.scale).applyQuaternion(carGroup.quaternion).add(carGroup.position);}
function potAuHasard(out){return potMonde(CAR_POTS.length?CAR_POTS[(Math.random()*CAR_POTS.length)|0]:CAR_POT_C,out);}
const CARPOOL={head:null,tail:null,jet:null}; // FLAQUES DE LUMIÈRE AU SOL (phares AV / feux AR / halo nitro) — rempli par buildCar, le halo nitro est piloté par JETS.k
let carWingL=null,carWingR=null,wingT=0;
let carProps=[],propSpin=0; // LES PALES (gabarit `requin`) : recensées ici, tournées par la boucle
// LES AILERONS QUI SORTENT EN VOL : chacun est un PIVOT posé à sa base, dont la boucle étire le Y
// avec `wingT`. ⚠ le pivot est indispensable : `finShape` centre sa géométrie, donc un scale.y
// appliqué au mesh ferait pousser l'aileron des DEUX côtés — moitié dans la carrosserie.
let carFins=[];
// ---- MATIÈRES GÉNÉRATIVES DES CAISSES (`MATV`) — jumelles de `MAT9` côté moteurs -------------
// Trois peaux peintes PAR LE CODE, jamais un fichier image : peinture à paillettes, pâtisserie
// industrielle et peau de requin. ⚠ calculées UNE fois et partagées (comme MAT9) — sans ce cache,
// chaque ouverture du garage repeindrait trois canvas. La TEINTE reste portée par `material.color`
// qui MULTIPLIE la carte : la carte donne le grain, la fiche donne la couleur.
const MATV={_c:{},get(k){return this._c[k]||(this._c[k]=this['_'+k]());},
  _tex(cv){const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;},
  // PEINTURE À PAILLETTES : ce qui fait lire « vernis tuning » n'est pas la couleur, c'est le
  // SCINTILLEMENT — des milliers de micro-éclats qui n'accrochent la lumière que sous un angle.
  // Fond quasi blanc pour se laisser teindre, marbrure très douce pour que le plat ne soit pas plat.
  _flake(){
    const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');
    c.fillStyle='#f2f2f2';c.fillRect(0,0,256,256);
    for(let i=0;i<170;i++){ // marbrure : nuages sombres à peine perceptibles (la tôle n'est jamais uniforme)
      c.globalAlpha=.05;c.fillStyle='#9aa0a6';
      c.beginPath();c.arc(Math.random()*256,Math.random()*256,8+Math.random()*22,0,7);c.fill();}
    c.globalAlpha=1;
    for(let i=0;i<2600;i++){ // LES PAILLETTES
      const x=Math.random()*256,y=Math.random()*256,r=Math.random()<.12?1.6:.75;
      c.fillStyle=Math.random()<.5?'rgba(255,255,255,.95)':'rgba(190,200,210,.7)';
      c.beginPath();c.arc(x,y,r,0,7);c.fill();}
    return this._tex(cv);
  },
  // LA POP-TART, FACE GLAÇAGE : croûte dorée piquée, glaçage rose en retrait, pépites semées.
  // ⚠ le glaçage NE VA PAS jusqu'au bord — c'est ce liseré de pâte nue qui fait lire « pâtisserie »
  // et pas « rectangle rose ». Les pépites sont semées par boucle, jamais dessinées à la main.
  _icing(){
    const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');
    c.fillStyle='#e8b473';c.fillRect(0,0,256,256);                       // la pâte
    for(let i=0;i<900;i++){c.fillStyle='rgba(150,102,52,'+(.05+Math.random()*.18)+')'; // piqûres de cuisson
      c.beginPath();c.arc(Math.random()*256,Math.random()*256,.7+Math.random()*1.6,0,7);c.fill();}
    c.fillStyle='#f4a0c4';c.fillRect(26,26,204,204);                     // le glaçage, en retrait
    c.fillStyle='rgba(255,255,255,.16)';c.fillRect(26,26,204,26);        // reflet mou en haut du glaçage
    const SPR=['#7fd8ff','#ffe45e','#ff6f91','#8dff9a','#c48dff','#ffffff'];
    for(let i=0;i<130;i++){                                              // LES PÉPITES
      const x=36+Math.random()*184,y=36+Math.random()*184,a=Math.random()*3.14;
      c.save();c.translate(x,y);c.rotate(a);
      c.fillStyle=SPR[(Math.random()*SPR.length)|0];c.fillRect(-4,-1.4,8,2.8);c.restore();}
    return this._tex(cv);
  },
  // LA TRANCHE de la pop-tart : pâte nue, festonnée sur ses bords (l'empreinte de la fourchette).
  _crust(){
    const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');
    c.fillStyle='#e0a869';c.fillRect(0,0,64,64);
    for(let i=0;i<220;i++){c.fillStyle='rgba(146,96,48,'+(.06+Math.random()*.22)+')';
      c.beginPath();c.arc(Math.random()*64,Math.random()*64,.6+Math.random()*1.5,0,7);c.fill();}
    for(let i=0;i<16;i++){c.fillStyle='rgba(120,78,38,.42)';c.fillRect(i*4+1,0,2,7);c.fillRect(i*4+1,57,2,7);} // festons
    return this._tex(cv);
  },
  // LE BANDEAU DE PARE-BRISE du tuner : bande sombre en haut de la vitre + lettrage suggéré.
  // ⚠ on ne DESSINE PAS de texte : à 40 px de haut en jeu, des lettres lisibles seraient du bruit.
  // Des barres de largeurs irrégulières lisent « autocollant de team » beaucoup mieux qu'un mot.
  _banner(){
    const cv=document.createElement('canvas');cv.width=256;cv.height=64;const c=cv.getContext('2d');
    c.fillStyle='#0c1408';c.fillRect(0,0,256,64);
    let x=14;
    while(x<242){const w=6+Math.random()*22,h=16+Math.random()*14;
      c.fillStyle=Math.random()<.22?'#ffffff':'#9dff42';
      c.fillRect(x,32-h/2,w,h);x+=w+5+Math.random()*7;}
    c.fillStyle='rgba(157,255,66,.28)';c.fillRect(0,54,256,4);
    return this._tex(cv);
  },
  // CARBONE, SERGÉ 2/2, TISSÉ PAR LE CODE. ⚠ ce qui fait lire le carbone n'est pas la couleur
  // (du noir reste du noir) mais le fait que le REFLET COURT LE LONG DES MÈCHES : d'où des tuiles
  // alternées où le dégradé change de sens d'une case à l'autre. Sans cette alternance, on obtient
  // du damier gris — un tissu, pas de la fibre.
  _carbone(){
    const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');
    c.fillStyle='#141519';c.fillRect(0,0,128,128);
    const T=16;
    for(let y=0;y<128;y+=T)for(let x=0;x<128;x+=T){
      const sens=(((x/T)+(y/T))&2)===0;                    // sergé 2/2 : deux cases dans un sens, deux dans l'autre
      const g=sens?c.createLinearGradient(x,y,x+T,y+T):c.createLinearGradient(x+T,y,x,y+T);
      g.addColorStop(0,'#3a3d47');g.addColorStop(.5,'#191b21');g.addColorStop(1,'#3a3d47');
      c.fillStyle=g;c.fillRect(x,y,T,T);
      c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.strokeRect(x+.5,y+.5,T-1,T-1);
    }
    return this._tex(cv);
  },
  // STICKERS DE FLANC : des blocs et des chevrons, pas du texte. À 60 px de haut en course, un
  // lettrage lisible n'existe pas — ce qu'on reconnaît d'une caisse kittée, c'est le RYTHME.
  _stickers(){
    const cv=document.createElement('canvas');cv.width=256;cv.height=64;const c=cv.getContext('2d');
    c.clearRect(0,0,256,64);
    c.fillStyle='rgba(255,255,255,.90)';
    for(let i=0;i<5;i++){const x=18+i*46,w=8+Math.random()*16;
      c.beginPath();c.moveTo(x,10);c.lineTo(x+w,10);c.lineTo(x+w-11,54);c.lineTo(x-11,54);c.closePath();c.fill();}
    c.fillStyle='rgba(20,26,14,.92)';c.fillRect(0,26,256,5);
    c.fillStyle='rgba(255,255,255,.75)';c.fillRect(0,33,256,2);
    return this._tex(cv);
  },
  // PEAU DE REQUIN : le CONTRE-OMBRAGE. Un requin n'est pas bleu, il est sombre dessus et blanc
  // dessous — c'est ce dégradé (et lui seul) qui le fait lire comme un animal marin. Le grain fin
  // par-dessus, ce sont les denticules : sans eux la bulle ressort en plastique de jouet.
  _skin(){
    const cv=document.createElement('canvas');cv.width=64;cv.height=256;const c=cv.getContext('2d');
    const g=c.createLinearGradient(0,0,0,256); // v=1 en haut de la texture = le DOS sur une sphère
    g.addColorStop(0,'#ffffff');g.addColorStop(.30,'#eaf2f8');g.addColorStop(.52,'#9dbcd8');
    g.addColorStop(.66,'#5d86b4');g.addColorStop(1,'#2f5a86');
    c.fillStyle=g;c.fillRect(0,0,64,256);
    for(let i=0;i<2200;i++){const y=Math.random()*256;
      c.fillStyle='rgba('+(Math.random()<.5?'255,255,255,':'20,40,70,')+(.04+Math.random()*.10)+')';
      c.fillRect(Math.random()*64,y,1.4,1);}
    return this._tex(cv);
  }};
const SPH9=new THREE.SphereGeometry(1,16,12); // la boule partagée par les gabarits (bulles, museaux, têtes)
// SILHOUETTE DE PROFIL : la « gueule » de chaque gabarit — points (z=longueur,y=hauteur) extrudés
// sur la largeur. Capots plongeants, fastbacks, coins furtifs : impossibles en boîtes, gratuits ici.
/* ---- LE LOFT : un corps ANIMAL, pas un tas de boules ------------------------------------------
   ⚠ POURQUOI. Les caisses fantastiques étaient montées en sphères aplaties empilées : ça donne un
   galet, jamais un être vivant. Un animal se lit à sa LIGNE — un rayon qui enfle au thorax puis
   s'étrangle au pédoncule — et à son CONTRE-OMBRAGE, sombre dessus, clair dessous. Les deux se
   fabriquent d'un coup en loftant des anneaux le long d'une épine, avec la couleur peinte DANS les
   sommets (donc gratuite : ni texture, ni deuxième matériau).
   La recette vient de `dauphins.html`, écrite pour la figure LE DAUPHIN — on la rapatrie ici au
   lieu d'en refaire une approximation.
   `prof` = [[u,rayon],…] de u=0 (le nez) à u=1 (la queue). Nez vers +Z, comme toute caisse.
   ---------------------------------------------------------------------------------------------- */
function loftBody(prof,o){
  o=o||{};
  const LEN=o.len||1,RINGS=o.rings||44,SEG=o.seg||22,
        arch=o.arch||0,droop=o.droop||0,wid=o.wid||1,flat=o.flat||.88;
  // ⚠ `flat` (l'aplatissement du ventre) et `bel` (sa COULEUR) sont deux clés DISTINCTES. Les avoir
  // toutes deux nommées `belly` faisait gagner la seconde : le bas de chaque anneau se multipliait
  // par 16 055 551 et la caisse mesurait 16 000 km de haut, hors champ, écran vide.
  const cT=new THREE.Color(o.top!=null?o.top:0x2f5a86),
        cS=new THREE.Color(o.side!=null?o.side:0x7fb8dc),
        cB=new THREE.Color(o.bel!=null?o.bel:0xf2ffff);
  const rad=u=>{ // interpolation DOUCE entre les points du profil (une lerp droite fait des angles)
    for(let i=0;i<prof.length-1;i++)if(u<=prof[i+1][0]){
      const a=prof[i],b=prof[i+1];let t=(u-a[0])/(b[0]-a[0]||1);
      t=.5-.5*Math.cos(t*Math.PI);
      return a[1]+(b[1]-a[1])*t;}
    return prof[prof.length-1][1];
  };
  const pos=[],col=[],idx=[],tmpC=new THREE.Color();
  for(let i=0;i<RINGS;i++){
    const u=i/(RINGS-1),z=LEN*.5-u*LEN,r=rad(u);
    const sy=arch*Math.sin(Math.PI*Math.min(1,u*1.02))-(u<.18?(.18-u)*droop:0);
    for(let j=0;j<=SEG;j++){
      const a=j/SEG*Math.PI*2;
      let py=Math.cos(a)*r;const px=Math.sin(a)*r*wid;
      if(py<0)py*=flat;                                   // ventre aplati : c'est ce qui pose l'animal
      pos.push(px,sy+py,z);
      const t=(Math.cos(a)+1)/2;                          // 1 = dos, 0 = ventre
      tmpC.copy(cB).lerp(cS,Math.min(1,t*1.5)).lerp(cT,Math.max(0,t-.55)*2.2);
      col.push(tmpC.r,tmpC.g,tmpC.b);
    }
  }
  const rw=SEG+1;
  for(let i=0;i<RINGS-1;i++)for(let j=0;j<SEG;j++){
    const a=i*rw+j,b=a+1,c=a+rw,d=c+1;idx.push(a,c,b,b,c,d);}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setIndex(idx);g.computeVertexNormals();
  return g;
}
// AILERON : un contour 2D extrudé et biseauté. Une nageoire est une LAME, pas un cône — c'est sa
// silhouette falciforme qui la fait lire, et un cône n'en a aucune.
function finShape(pts,depth){
  const sh=new THREE.Shape();
  sh.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)sh.lineTo(pts[i][0],pts[i][1]);
  const g=new THREE.ExtrudeGeometry(sh,{depth:depth,bevelEnabled:true,bevelThickness:depth*.6,
    bevelSize:depth*.5,bevelSegments:2,steps:1});
  g.center();g.computeVertexNormals();return g;
}
function carProfile(pts,w){
  const s=new THREE.Shape();
  s.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);
  // BISEAU : arrondit la silhouette ET les flancs → fini l'effet « bloc » (arêtes vives) sur toutes les caisses profilées
  const bev=Math.min(.09,w*.055);
  const g=new THREE.ExtrudeGeometry(s,{depth:w-2*bev,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:2,steps:1});
  g.rotateY(-Math.PI/2);g.translate(w/2-bev,0,0); // longueur → Z (avant en +Z), largeur centrée sur X (bev compris)
  return g;
}
/* ---- LE KIT LOW-POLY (2026-09-24) — la gamme se MODÈLE, elle ne se maçonne plus --------------
   Premier jet du jour en voxels ; verdict du user : « on vise un style POLY, Rocket League — les
   plis de pixels dérangent et ENFERMENT les futurs modèles dans un design limité ». Il avait
   raison : une brique ne sait faire que des marches, et toute pente devenait un escalier.
   Ici, une caisse = UN LOFT (des sections le long de l'axe, reliées par des facettes planes) + des
   PIÈCES low-poly (boîtes, prismes, cylindres à peu de pans, tours). Tout est à FACETTES FRANCHES :
   chaque triangle porte sa propre normale et sa propre couleur — c'est ce qui fait « Rocket
   League » : des volumes nets, des pans qui attrapent la lumière un par un, jamais de lissage mou.
   ⚠ LE LOFT, C'EST LA LIBERTÉ : `S(z)` rend la DEMI-section (x ≥ 0) du bas-centre au haut-centre ;
   les stations `zs` décident où tombent les arêtes. Un passage de roue n'est pas un trou découpé :
   c'est le bas de caisse qui MONTE aux stations de la roue — arche hexagonale, trapézoïdale ou
   carrée selon les stations qu'on donne. Capot en creux, flancs rentrants, fastback : un chiffre.
   ⚠ UNE GÉOMÉTRIE PAR MATIÈRE (laque, chrome, or, satiné, mat, verre, feux), la COULEUR dans les
   sommets : bicolore, liseré et calandre ne coûtent pas un draw call de plus.
   ⚠ MATIÈRES EN DOUBLE FACE : un tour ou un prisme peut sortir retourné selon l'ordre de ses
   points, et une face retournée ne se voit pas (culling) — elle ne plante pas, elle DISPARAÎT. Le
   double face rend le kit incassable : le shader retourne la normale vers l'œil.
   LA HONTE n'est PAS concernée (demande explicite : « ne rien changer »).
   -------------------------------------------------------------------------------------------- */
const LPU={
  cl:(v,a,b)=>v<a?a:v>b?b:v,
  // table affine par morceaux [[z,v],…] (z croissants), bornée aux extrémités
  lin(t,z){if(z<=t[0][0])return t[0][1];
    for(let i=1;i<t.length;i++)if(z<=t[i][0]){const p=t[i-1],q=t[i];return p[1]+(q[1]-p[1])*(z-p[0])/((q[0]-p[0])||1);}
    return t[t.length-1][1];},
  // hauteur du bas de caisse autour des roues : l'ARCHE est donnée par ses stations (dz → y)
  arch(z,wz,prof,base){let y=base;for(const w of wz){const d=Math.abs(z-w);y=Math.max(y,LPU.lin(prof,d));}return y;}
};
/* ---- LES POTS D'ÉCHAPPEMENT ---- (bloc posé par l'atelier des pots) */
/* ---- LES POTS D'ÉCHAPPEMENT (2026-10-10, Léo : « une grosse révision très précise sur chacune des voitures — fais attention, ne
   change rien, garde toutes les voitures telles qu'elles sont : juste un pot d'échappement pour chacune, adapté au modèle ; fais la
   différence ») — chaque caisse de la liste a SON pot, dessiné pour elle (`ECH_POTS`, par gabarit). Deux temps :
   1. `echRetire(gs,prims,shape)` (dans le `commit` du kit) ÔTE l'ancien embout : les tubes et boîtes que le relevé des pots reconnaît
      (les MÊMES critères que CAR_POTS dans buildCar) et les boîtes `ote` de la fiche — triangle par triangle, seulement ce qui tient EN
      ENTIER dans l'embout : le pare-chocs autour reste intact ;
   2. `echappement(K,shape,A)` (juste après le gabarit) DESSINE le nouveau pot avec les pièces `ECHP` et DÉCLARE ses bouches (`A.pots`) :
      flammes, tuyères et traînées sortent de là. Rien d'autre de la caisse ne bouge. La salle blanche appelle les deux pareil.
   Repère caisse : x à droite, y en haut, z vers l'AVANT ; une bouche est donnée par son point le plus en ARRIÈRE (z le plus petit), le
   tube rentre dans la caisse vers +z. */
const ECH_PAL={c:{g:'c',c:0xe8ecf0},C:{g:'c',c:0x9aa2ab},a:{g:'c',c:0xc9ced6},b:{g:'c',c:0x6157c9},v:{g:'c',c:0x9a62c8},x:{g:'c',c:0xc89a52},
  o:{g:'o',c:0xd9a520},k:{g:'m',c:0x08080a},s:{g:'s',c:0x1c1d21},f:{g:'s',c:0x2a2c31},r:{g:'m',c:0x6a3b1e},R:{g:'m',c:0x8f5a33},
  w:{g:'s',c:0xf6f8fc},i:{g:'c',c:0xc4ecfb},n:{g:'c',c:0x2f8fc4},h:{g:'c',c:0x7884c8}, /* h : l'acier BLEUI par la chaleur (le pot réel) */
  g:{g:'l',c:0xff7a24},G:{g:'l',c:0x46d2ff},V:{g:'l',c:0x6dff5a},P:{g:'l',c:0xff3ea0},Y:{g:'l',c:0xffc84a},
  1:{g:'s',c:0xff2a2a},2:{g:'s',c:0xff9a1f},3:{g:'s',c:0xffe23a},4:{g:'s',c:0x3cdc4a},5:{g:'s',c:0x2f8cff},6:{g:'s',c:0x8a4dff}};
