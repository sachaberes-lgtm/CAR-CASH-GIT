/* ===== LES YEUX DU BOT (2026-11-23, etape 1 BOTS-ML : « des yeux corrects — le cerveau voit ce que le joueur voit ») =====
   Une porte de LECTURE posee dans le vrai jeu (ml/reel) : `voir(J)` rend LA VUE, un objet de nombres simples, sans rien de three.js.
   Elle LIT, elle ne pose rien : ses propres vecteurs, aucun tirage au hasard, aucune variable du jeu ecrite.
   Reperes (ceux du jeu) : distances en METRES, temps en SECONDES, angles en RADIANS ; tout ce qui est lateral est POSITIF A GAUCHE
   (lat, cap, volant, virage, gisement). `d` = la distance le long de la route, devant la caisse.
   Le detail de chaque champ : ml/bot/README.md (« Ce que le bot voit »). */
/* ===== LES YEUX V2 : LE RADAR (2026-11-24, Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   Ce qui s'AJOUTE a la vue (aucun champ d'avant ne change, ni valeur, ni arrondi, ni ordre) :
     · EN VOL, `vue.vol.radar` : pour plusieurs facons de piloter (les touches telles qu'elles sont, ne rien toucher, tourner, cabrer, piquer,
       planer nitro tenue, revenir vers la route), l'ISSUE prevue — pose (ou, quand, dans quel axe, quel choc), levre, choc contre le decor
       (lequel, dans combien de temps), jauge d'air vide, fond du monde, portail. Le vol est rejoue image par image (1/60 s) sur un etat PRIVE :
       les memes lois que le jeu (boucle-1, boucle-3-physique, la pose de demi-tour.js), recopiees en nombres simples ;
     · AU SOL : `tenue` (la route se tient-elle 3 s ?), `sorties` (le meme radar lance depuis le bord, et a la demande depuis une sortie a
       gauche, a droite, ou un saut), `virage` (rayon, vitesse sure), `couloirs` et `mur`, `ligne` (la ligne parfaite), `sautRefuse`, `arret` ;
     · TOUJOURS : `vitMult`, `palier`, `aimant`, `invulnerable`.
   LES REGLES TENUES ICI (controlees par verifier.js, sections 6 et 7) :
     · rien du jeu n'est ecrit, aucun tirage de son hasard. Les fonctions du jeu qui ecrivent (la pose, le decollage, la jauge d'air, le radar de
       dalle, le portail de cubes, le verrou du volant, le repere de route) sont RECOPIEES, jamais appelees ; les heurts du decor sont appeles
       (une recopie deriverait a chaque mise a jour du jeu) : ils n'ecrivent que leurs brouillons, poses avant d'etre relus ;
     · la vue ne depend que de l'etat du jeu a l'appel et de la demande : aucun compteur, aucun resultat garde d'une vue a l'autre. Seules
       memoires : les index d'une piste immuable (cles sur l'identite de `pts` et sur `NP`) ;
     · le cout est borne par des COMPTES d'images et de sondes (`budget`), jamais par l'horloge ;
     · chaque bloc est dans un try/catch : en cas d'erreur le champ vaut { erreur }, la course continue.
   `voir(J, demande)` : demande = rien | { sorties:true } (les sorties a la demande) | { radar:false } (la vue d'avant, sans rien de neuf) ;
   { doigts:{G,D,H,B,N} } : dans combien d'images la main pourra changer chaque touche (piloter.js le lit dans les doigts) — le radar en tient compte. */
/* ===== LA RELECTURE DES YEUX V2 (2026-11-25, Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   Quinze defauts confirmes par des relecteurs ; ce qui change ici (rien dans la course d'un cerveau sans profil : les yeux ne font que lire) :
     · LE DECOR EST SONDE A CHAQUE IMAGE, comme le jeu le juge (grotte, jade, ville, espace) : une image sur deux laissait passer une roche ;
     · LE SAUT VU DU SOL suit la main image par image : 24 images de route, puis NITRO et manche tenus 5 images de vol, la NITRO relachee jusqu'a
       la 27e (la main ne peut pas la reprendre avant), et la fleche que la main pose 4 images a la fin du geste (`saut.fleche`) ;
     · `sautRefuse` compte aussi le refus de la FIGURE qui porte le saut (jauge sous 35 %, moins de 0,9 s apres la figure d'avant) ; une figure
       deja en cours : `sorties.saut` vaut { issue:'figure' } (non prevu) ;
     · LA LOI « versRoute » braque dans le bon sens tete en bas (`vol.proche.envers`) ;
     · LES SORTIES A GAUCHE ET A DROITE portent aussi le rayon `versRoute` sur 6 s (LISTE_COTE) : survit-on ?
     · UNE MAIN A PROFIL : au sol sa reaction est roulee avant la sortie ; en vol le coup de volant en cours finit a son heure, puis la part de
       braquage de l'ordre en vigueur (doigts.js, delais : `r`, `vol`, `Nb`, `aide`, `saut`) ;
     · CHAMPS NEUFS : `latC` (pieces, fruits, orbes : le cote dans le repere du conducteur, juste aussi sous la dalle ; `lat` ne change pas). */
const YEUX_CODE=`window.__YEUX=(function(){
  const V1=new THREE.Vector3(),V2=new THREE.Vector3(),V3=new THREE.Vector3(),VIT=new THREE.Vector3();
  const DEVANT=[30,60,100,150,220,300,400,550],POUV={n:'nitro',a:'air',v:'vitesse',m:'aimant',x:'x2'};
  const r1=function(x){return Math.round(x*10)/10;},r2=function(x){return Math.round(x*100)/100;},r3=function(x){return Math.round(x*1000)/1000;};
  const idx=function(sv){return Math.max(0,Math.min(NP-1,Math.round(sv/L*(NP-1))));};
  /* de combien la route tourne entre i et j, autour du haut de la route en i : + = a gauche */
  const virage=function(i,j,sd){const a=T[i],b=T[j],n=Nn[i];V1.crossVectors(a,b);return Math.atan2(V1.dot(n)*sd,a.dot(b));};
  /* les troncons de route EN CONTREBAS que la caisse peut atteindre en quittant la route (ou depuis son vol) : la matiere des raccourcis.
     gain = la piste sautee, moins la distance volee en ligne droite (la mesure du jeu : il crie RACCOURCI a partir de 60 m). */
  const troncons=function(P,sRef,reste){
    const g=FALL_G*gK()*SPD,vh=Math.hypot(VIT.x,VIT.z),out=[];
    if(vh<5)return out;
    const pas=Math.max(1,Math.round(25/(L/(NP-1)))),i0=idx(sRef+80),i1=idx(sRef+3500);
    let cur=null;
    for(let j=i0;j<=i1;j+=pas){
      const Q=pts[j],dy=P.y-Q.y;let ok=false,o=null;
      if(dy>8&&Nn[j].y>.35){
        const hx=Q.x-P.x,hz=Q.z-P.z,dist=Math.hypot(hx,hz),sj=j/(NP-1)*L,gain=(sj-sRef)-Math.hypot(dist,dy);
        if(gain>=60&&dist>20){
          const gis=Math.atan2(VIT.z*hx-VIT.x*hz,VIT.x*hx+VIT.z*hz);            /* + = le troncon est a gauche de ma trajectoire */
          const tx=T[j].x,tz=T[j].z,axe=Math.abs(Math.atan2(hx*tz-hz*tx,hx*tx+hz*tz)); /* l'angle d'arrivee sur son axe (pose propre : moins de 55 degres) */
          const tC=(VIT.y+Math.sqrt(VIT.y*VIT.y+2*g*dy))/g,tT=dist/vh;
          o={s:Math.round(sj),gain:Math.round(gain),dist:Math.round(dist),chute:Math.round(dy),gisement:r2(gis),axe:r2(axe),tChute:r2(tC),tTrajet:r2(tT)};
          ok=tC<reste-.3&&tT>tC*.55&&tT<tC*1.6&&Math.abs(gis)<.9&&axe<.95;}}
      if(ok){if(!cur){cur={m:o,s0:o.s,s1:o.s};out.push(cur);}else{cur.s1=o.s;if(o.gain>cur.m.gain)cur.m=o;}}else cur=null;}
    return out.map(function(c){c.m.longueur=c.s1-c.s0+25;return c.m;}).sort(function(a,b){return b.gain-a.gain;}).slice(0,4);};
  const vue1=function(){
    const sol=mode==='drive',vol=mode==='fall',sd=side<0?-1:1,cap9=nitroCap(),P=carGroup.position;
    const c=LVL&&LVL.cur,vm=vitMult();
    const v={
      mode:sol?'sol':vol?'vol':'boom',fini:!!(gameOver||mode==='boom'),mort:(gameOver||mode==='boom')?((typeof mortCause==='string'&&mortCause)||'?'):null,
      carte:c?(c.carte||c.piste||c.id||null):null,meteo:c?(c.meteo||null):null,
      nitro:r3(nitroR/cap9),reserve:r3(nitroX/cap9),nitroOn:!!nitroOn,nitroLibre:pwrNitroT>0||startBoostT>0,
      flow:r2(FLOW.v),flowNiveau:FLOW.lv|0,argent:r2(money),pieces:coinsGot|0,figures:runStats.tricks|0,chaine:CHA.n|0,moteur:engTier|0,
      pouvoirs:{nitro:r1(pwrNitroT),vitesse:r1(pwrSpdT),air:r1(pwrAirT),aimant:r1(pwrMagT)},
      L:Math.round(L),demi:ROAD_HALF};
    if(sol){
      const bi=idx(s),seg=L/(NP-1),vit=Math.abs(vA)*SPD*vm;
      v.s=r1(s);v.fin=Math.round(L-s);v.lat=r2(lat);v.cap=r3(psi);v.vitesse=r1(vit);v.volant=r2(steer);v.dessous=sd<0;
      v.drift=!!driftEnCours;v.glisse=slipT>0;v.sursis=r2(graceT);v.rebond=hopY>0||hopV!==0;v.figureRoute=!!FR.on;v.bond=r2(FR.on?FR.lift:0);
      v.lacetRoute=r3(routeLacet);v.lacetMax=r3(lacetMax(vA)*vm);
      v.pente=r3(Math.asin(Math.max(-1,Math.min(1,T[bi].y))));
      v.devers=r3(Math.asin(Math.max(-1,Math.min(1,B[bi].y))));
      /* devant : de combien la route tourne, monte, se PENCHE (devers : 0 = a plat, + = le bord gauche plus haut), si elle est a l'envers, s'il y a un trou */
      v.route=DEVANT.map(function(d){const j=idx(s+d);return {d:d,virage:r3(virage(bi,j,sd)),monte:r1(pts[j].y-pts[bi].y),
        devers:r3(Math.asin(Math.max(-1,Math.min(1,B[j].y)))),envers:Nn[j].y<0,trou:!!(typeof TROU!=='undefined'&&TROU&&TROU[j])};});
      v.plaques=[];for(let i=0;i<PADS.length;i++){const d=PADS[i]-s;if(d>0&&d<450)v.plaques.push({d:Math.round(d),lat:r1(sd*PADL[i])});}
      v.flaques=[];for(const o of OILS){if(o.face!==side)continue;const d=o.s-s;if(d>-5&&d<350)v.flaques.push({d:Math.round(d),lat:r1(sd*o.lat),rayon:r1(o.r)});}
      /* les pieces par tranches de 25 m (ou est la file, combien), les fruits et les bidons un par un */
      const tr={};v.fruits=[];v.orbes=[];
      for(let i=0;i<pickups.length;i++){const p=pickups[i];if(p.taken||p.face!==side||p.air)continue;const d=p.s-s;if(d<4||d>325)continue;
        /* (2026-11-25, relecture) latC : le cote DANS LE REPERE DU CONDUCTEUR (celui de vue.lat et de l'aide « ligne »). Le jeu ramasse quand
           p.lat = side × lat (gameplay/ramassage.js) : sous la dalle « lat » (garde tel quel) est donc en miroir, « latC » non. */
        if(p.pow){v.orbes.push({d:Math.round(d),lat:r1(p.lat),pouvoir:POUV[p.pow]||p.pow,latC:r1(sd*p.lat)});continue;}                       /* un orbe de pouvoir */
        if(p.fruit>=0){const fd=FRUIT_DEFS[p.fruit]||{};v.fruits.push({d:Math.round(d),lat:r1(p.lat),nom:fd.n||null,force:fd.boost||0,latC:r1(sd*p.lat)});continue;} /* un fruit : il remplit la reserve de nitro */
        const k=Math.floor(d/25),q=p.deux?2:1,t=tr[k]||(tr[k]={d:k*25+12,n:0,l:0});t.n+=q;t.l+=p.lat*q;}                 /* une piece (deux : elle compte double) */
      v.piecesDevant=Object.keys(tr).map(function(k){const t=tr[k];return {d:t.d,lat:r1(t.l/t.n),n:t.n,latC:r1(sd*t.l/t.n)};}).sort(function(a,b){return a.d-b.d;});
      v.modules=[];try{for(const m of (MODS||[])){if(m.s1<s)continue;if(m.s0-s>900)break;v.modules.push({nom:m.fig||null,d0:Math.round(m.s0-s),d1:Math.round(m.s1-s),climax:!!m.climax});if(v.modules.length>=2)break;}}catch(e){}
      VIT.copy(T[bi]).multiplyScalar(Math.cos(psi)).addScaledVector(B[bi],sd*Math.sin(psi)).multiplyScalar(vit);
      v.troncons=sd>0?troncons(P,s,airMax()):[];
    }else if(vol){
      const vit=fallVel.length()*SPD,reste=pwrAirT>0?99:Math.max(0,airMax()-fallTR);
      VIT.copy(fallVel).multiplyScalar(SPD);
      v.vitesse=r1(vit);v.volant=r2(steer);
      const f={t:r2(fallTR),reste:r2(reste),monte:r1(VIT.y),plancher:Math.round(fallPos.y-(trackMinY-120)),lacetMax:r3(lacetVol(fallVel.length()))};
      /* la route la plus proche (le radar de la pose) : ou j'en suis le long de la piste, de combien je suis a cote et au-dessus */
      const sN=curNear?lastNearS:s;v.s=r1(sN);v.fin=Math.round(L-sN);
      if(curNear){const bi=idx(lastNearS);f.proche={lat:r1(curLatOff),haut:r1(curHOff),avant:r1(VIT.dot(T[bi])),cote:r1(VIT.dot(B[bi])),versRoute:r1(-VIT.dot(Nn[bi])),
        axe:r3(Math.atan2(VIT.dot(B[bi]),VIT.dot(T[bi]))),
        envers:typeof FLY_U!=='undefined'&&FLY_U.dot(Nn[bi])<0};}else f.proche=null; /* (2026-11-25, relecture) envers : la caisse vole tete en bas par rapport a CETTE route — le volant y tourne a l'envers du repere de la route */
      /* l'anneau de pose que le joueur voit : ou il est par rapport a ma trajectoire, dans combien de temps j'y suis */
      if(LM.vu&&CAMV.eta<90){const hx=landMark.position.x-P.x,hz=landMark.position.z-P.z;
        f.anneau={delai:r2(CAMV.eta),dist:Math.round(Math.hypot(hx,hz)),dessous:r1(P.y-landMark.position.y),gisement:r2(Math.atan2(VIT.z*hx-VIT.x*hz,VIT.x*hx+VIT.z*hz))};}else f.anneau=null;
      /* la figure en cours : combien il en tourne, le temps qu'il lui faut encore, l'angle qui lui reste, l'ecart a l'endroit */
      const C=FX2.corps;f.figure=null;
      if(C&&C.figs.length){let n=0,ang=0;for(let i=0;i<C.figs.length;i++){const r=C.figs[i];if(r.paye)continue;n++;for(let j=0;j<r.mv.length;j++)ang=Math.max(ang,r.mv[j].tours*6.2832-r.mv[j].th);}
        if(n||C.ecart()>.05)f.figure={enCours:n,reste:r2(C.reste()),angle:r2(ang),ecart:r2(C.ecart()),budget:r2(Math.min(9,C.budget))};}
      f.figuresDuVol=FX2.payees|0;
      v.vol=f;
      v.troncons=troncons(P,sN,reste);
    }
    return v;};

  /* ===== LES YEUX V2 (2026-11-24, Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») ===== */
  /* LE BUDGET, en comptes (jamais en temps : l'horloge de la page est virtuelle). vol : images de vol integrees par vue en vol (5 rayons longs de 6 s
     et 5 courts de 2 s : 2 400 au pire) ; sol : par vue au
     sol (la sortie par le bord, d'office) ; demande : par vue au sol avec les sorties demandees ; route : images de conduite par vue au sol ;
     sondes : les appels au decor par vue (a chaque image au plus, et a l'image de chaque issue). A bout de budget, les derniers rayons rendent « coupe ». */
  /* (2026-11-25, relecture) demande : 2 200 → 2 900 — les sorties a gauche et a droite portent un rayon « versRoute » de 6 s de plus chacune (au pire :
     bord 1 080 + gauche 720 + droite 720 + saut 360 = 2 880) ; sondes : 2 420 → 2 920 — le decor est sonde a CHAQUE image (une sonde par image au plus). */
  const BUDGET={vol:2400,sol:1100,demande:2900,route:900,sondes:2920};
  const H60=1/60,PAS_MS=1000/60,COURT=2,LONG=6,TENUE=3,MOYEN=3;
  const COUT={pas:0,route:0,dalles:0,sondes:0,erreurs:0};
  const MANQUE=[];
  const SONDE=new THREE.Vector3();
  const M=Math;
  /* LES NOMS DU JEU LUS DANS LES BOUCLES : relus UNE fois par vue dans des variables d'ici (la piste, les fonctions pures du jeu) — un nom du jeu lu
     depuis ce texte passe par une recherche lente (le texte est evalue dans le jeu), et une image de vol en lit des dizaines */
  let gP=null,gT=null,gN=null,gB=null,gNP=0,gL=0,gTR=null,gSolY=0;
  let jLacetVol=null,jTient=null,jBump=null,jGrotte=null,jJade=null,jCanyon=null,jVille=null,jGeants=null;
  const lirePiste=function(){gP=pts;gT=T;gN=Nn;gB=B;gNP=NP;gL=L;gTR=TROU;if(BX.gP===gP&&BX.sig!==signe())BX.gP=null;if(CB.gP===gP&&CB.sig!==signe())CB.gP=null;};
  const cl=function(x,a,b){return x<a?a:x>b?b:x;};
  const fini=function(x,k){return (typeof x==='number'&&x===x&&x!==Infinity&&x!==-Infinity)?M.round(x*k)/k:null;};
  const n0=function(x){return fini(x,1);},n1=function(x){return fini(x,10);},n2=function(x){return fini(x,100);},n3=function(x){return fini(x,1000);};
  const dit=function(e){let m='?';try{m=String(e&&e.message||e).slice(0,120);}catch(x){}COUT.erreurs++;return {erreur:m};};
  /* LES NOMS QUI MANQUENT : chaque groupe de variables du jeu est cherche une fois, a la pose des yeux. Un nom retire par une mise a jour du jeu
     eteint SON champ (il vaut null) et s'inscrit dans __YEUX.manque, que verifier.js exige vide. */
  const present=function(groupe,noms){let ok=true;for(const n of noms.split(' ')){let la=false;try{la=eval('typeof '+n)!=='undefined';}catch(e){}if(!la){ok=false;MANQUE.push(groupe+':'+n);}}return ok;};
  const LA={
    palier:present('palier','ENGINE_TIERS engTier coinsGot lateMul CARS SPD vitMult'),
    aimant:present('aimant','ENG_CAP MAG_R pwrMagT engTier'),
    chance:present('invulnerable','CHANCE'),
    arret:present('arret','idleT'),
    route:present('route','pts T Nn B NP L TORD VOL_R0 VOL_RK VOL_TAU VOL_LIS lacetMax ROAD_HALF THICK side s lat psi vA steer yawR routeLacet driveDir graceT FREIN_L'),
    couloirs:present('couloirs','CY CITY'),
    ligne:present('ligne','LIGNE pickups PADS PADL'),
    saut:present('sautRefuse','jadeEnversRefuse villeEnversRefuse NUA_SS nua2On MODS hopY hopV POSE_F DMT TUTO nitroOn FDC FR GSOL VEQ VEQ_K NITRO2 nitroCap nitroR nitroX pwrNitroT startBoostT PARK'),
    vol:present('vol','fallPos fallVel FLY_U FLY_R VOLR VEQ VEQ_K VIRVOL pitchS fallVH0 fallT fallTR bascOn bascT fallStartSide sideCd bounceN nitroR nitroX nitroOn pwrNitroT startBoostT pwrAirT RAI TUTO FLOW FLOW2 JEAU tryLand loop keys FALL_G gK airMax volInv lacetVol nitroCap nitroTientDe nitroBumpDe NITRO2 NITRO_BLEU_K BASC_T LEVRE_H LEVRE_POSE BUMP_VY CARS level TROU trackMinY PARK TBORD VOLR_FIGE AIR_RATE TCTL MIR FX2 volrOn murRoule'),
    portail:present('portail','PORTAL PCUBE PORTV portalMesh'),
    decor:present('decor','GROTTE grotteHeurt JADE jadeHeurt CY canyonHeurt CITY villeHeurt GEANTS geantsHeurt LVL BANQ DN')};

  /* ---- L'INDEX PRIVE DES DALLES : le radar de dalle en casiers du jeu (portail-passage.js, « LE RADAR DE DALLE EN CASIERS ») sur ses propres tableaux —
     celui du jeu ecrit son resultat et rebatit son index. MEME POINT ELU que le jeu : les candidats sont balayes dans le meme ordre (indices croissants),
     avec la meme comparaison stricte, les memes trous exclus. Ce qui differe est le TRI des casiers, toujours prudent (une sphere a 1 mm de marge autour
     de ses points : un casier ecarte ne peut contenir aucun point qui gagne) : deux etages (8 casiers de 64 points sous une sphere), les coordonnees
     des points a plat, et la comparaison au carre (plus de racine par casier). ---- */
  const BK=64,SK=8,BX={gP:null,n:0,sig:0,nb:0,ns:0,p:null,c:null,r:null,sc:null,sr:null},PR={d2:0};
  /* la piste n'a pas bouge sous son index ? trois points temoins, relus une fois par vue (lirePiste) */
  const signe=function(){if(!(gNP>0))return 0;const a=gP[0],b=gP[gNP>>1],c=gP[gNP-1];return a.x+a.y*3+a.z*7+b.x*11+b.y*13+b.z*17+c.x*19+c.y*23+c.z*29;};
  const boule=function(P,i0,i1,C,RR,k){
    let x0=1e18,y0=1e18,z0=1e18,x1=-1e18,y1=-1e18,z1=-1e18;
    for(let i=i0;i<i1;i++){const x=P[i*3],y=P[i*3+1],z=P[i*3+2];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z;}
    const cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2;let r2=0;
    for(let i=i0;i<i1;i++){const dx=P[i*3]-cx,dy=P[i*3+1]-cy,dz=P[i*3+2]-cz,d=dx*dx+dy*dy+dz*dz;if(d>r2)r2=d;}
    C[k*3]=cx;C[k*3+1]=cy;C[k*3+2]=cz;RR[k]=M.sqrt(r2)+1e-3;};
  const bacs=function(){
    const X=BX;if(X.gP===gP&&X.n===gNP)return X;
    const nb=M.ceil(gNP/BK),ns=M.ceil(nb/SK),P=new Float64Array(gNP*3);
    for(let i=0;i<gNP;i++){const q=gP[i];P[i*3]=q.x;P[i*3+1]=q.y;P[i*3+2]=q.z;}
    X.gP=gP;X.n=gNP;X.sig=signe();X.nb=nb;X.ns=ns;X.p=P;X.c=new Float64Array(nb*3);X.r=new Float64Array(nb);X.sc=new Float64Array(ns*3);X.sr=new Float64Array(ns);
    for(let b=0;b<nb;b++)boule(P,b*BK,M.min(gNP,b*BK+BK),X.c,X.r,b);
    for(let q=0;q<ns;q++)boule(P,q*SK*BK,M.min(gNP,(q+1)*SK*BK),X.sc,X.sr,q);
    return X;};
  /* le point d'axe le plus proche parmi les indices multiples de « pas », a moins de bd0 (distance au carre), trous exclus ; « graine » : un indice
     qui borne deja le minimum ; exA, exB : indices ecartes. Rend l'indice (ou -1) et PR.d2. */
  const proche=function(x,y,z,pas,bd0,graine,exA,exB){
    const X=bacs(),TR=gTR,P=X.p,C=X.c,RR=X.r,SC=X.sc,SR=X.sr,nb=X.nb;let lim=bd0;COUT.dalles++;
    if(graine>=0&&graine<gNP&&graine%pas===0){const j=graine*3,dx=x-P[j],dy=y-P[j+1],dz=z-P[j+2],d=dx*dx+dy*dy+dz*dz;if(d<lim)lim=d;}
    let bi=-1,bd=bd0,thr=M.sqrt(lim);
    for(let q=0,b0=0;b0<nb;q++,b0+=SK){
      {const ex=x-SC[q*3],ey=y-SC[q*3+1],ez=z-SC[q*3+2],u=thr+SR[q];if(ex*ex+ey*ey+ez*ez>u*u)continue;}
      const b1=b0+SK<nb?b0+SK:nb;
      for(let b=b0;b<b1;b++){
        {const ex=x-C[b*3],ey=y-C[b*3+1],ez=z-C[b*3+2],u=thr+RR[b];if(ex*ex+ey*ey+ez*ez>u*u)continue;}
        const i0=b*BK,i1=M.min(gNP,i0+BK);if(exB!=null&&i0>exA&&i1-1<exB)continue;
        for(let i=i0;i<i1;i+=pas){
          if(exB!=null&&i>exA&&i<exB)continue;
          if(TR&&TR[i]&&(i<1||TR[i-1]))continue;
          const j=i*3,dx=x-P[j],dy=y-P[j+1],dz=z-P[j+2],dd=dx*dx+dy*dy+dz*dz;
          if(dd<bd){bd=dd;bi=i;if(dd<lim)thr=M.sqrt(dd);}}}}
    PR.d2=bd;return bi;};
  /* ---- LE REPERE DE LA ROUTE a l'abscisse sv (la copie en nombres du repere de route du jeu, ligne-parfaite.js), retourne sous la dalle (sd < 0)
     comme le fait la conduite (boucle-2-conduite.js:16). ---- */
  const CA={px:0,py:0,pz:0,tx:0,ty:0,tz:1,nx:0,ny:1,nz:0,bx:1,by:0,bz:0};
  const cadre=function(sv,o,sd){
    sv=M.max(0,M.min(gL-.01,sv));
    const f=sv/gL*(gNP-1),i=M.floor(f),j=M.min(i+1,gNP-1),u=f-i,a=gP[i],b=gP[j],ta=gT[i],tb=gT[j],na=gN[i],nb=gN[j];
    o.px=a.x+(b.x-a.x)*u;o.py=a.y+(b.y-a.y)*u;o.pz=a.z+(b.z-a.z)*u;
    let tx=ta.x+(tb.x-ta.x)*u,ty=ta.y+(tb.y-ta.y)*u,tz=ta.z+(tb.z-ta.z)*u,k=1/(M.sqrt(tx*tx+ty*ty+tz*tz)||1);tx*=k;ty*=k;tz*=k;
    let nx=na.x+(nb.x-na.x)*u,ny=na.y+(nb.y-na.y)*u,nz=na.z+(nb.z-na.z)*u;const q=-(nx*tx+ny*ty+nz*tz);
    nx+=tx*q;ny+=ty*q;nz+=tz*q;k=1/(M.sqrt(nx*nx+ny*ny+nz*nz)||1);nx*=k;ny*=k;nz*=k;
    let bx=ny*tz-nz*ty,by=nz*tx-nx*tz,bz=nx*ty-ny*tx;
    if(sd<0){nx=-nx;ny=-ny;nz=-nz;bx=-bx;by=-by;bz=-bz;}
    o.tx=tx;o.ty=ty;o.tz=tz;o.nx=nx;o.ny=ny;o.nz=nz;o.bx=bx;o.by=by;o.bz=bz;return o;};

  /* ---- CE QUI SE LIT UNE FOIS PAR VUE : les reglages du jeu (un reglage qui bouge ne casse rien ; seule une LOI qui change demande de recopier,
     et la mesure de justesse le voit) ---- */
  const K={SPD:.5,g:.5,RH:.5,TH:.5,w:.5,BASC_T:.5,LEVRE_H:.5,LEVRE_POSE:.5,bump:.5,lis:.5,l12:.5,push:.5,cap:.5,regen:.5,fren:.5,conso:.5,coup:.5,bleu:.5,
    veq:false,niv:.5,latch:.5,inv:.5,airM:.5,fond:.5,tutoPa:false,wB:.5,park:false,balade:false,vMin:.5,angle:.5,portOk:false,cube:false,cx:.5,cy:.5,cz:.5,pe:null,pR2:.5,
    dGrotte:false,dJade:false,dCanyon:false,dSol:false,dVille:false,dGeants:false,decor:false,cad:2,volrOn:false,approx:false,
    lvK:.5,lvC:.5,lvOk:false,seuil:.5,ntOk:false,nivF:.5,vLis:.5,hC:.5};
  /* DEUX PETITES LOIS DU JEU, appelees a chaque image de vol, RECOPIEES pour le cout (un appel au jeu depuis ce texte coute dix fois le calcul) :
     le lacet du vol au plein volant (vol-equilibre.js) et « le reacteur tient-il ? » (frole-contrats.js). A CHAQUE vue la copie est comparee a la
     fonction du jeu sur quelques valeurs : si le jeu a change sa loi, c'est SA fonction qui est appelee (plus lent, toujours juste). */
  const lacetV=function(v){return K.lvOk?K.lvK*(1.15+M.min(K.lvC,v*.004)):jLacetVol(v);};
  const tient=function(res,take,on){return K.ntOk?(on?res>M.max(.005,take):res>K.seuil):jTient(res,take,on);};
  const lireJeu=function(){
    const et=ENGINE_TIERS[engTier],gk=gK();
    lirePiste();jLacetVol=lacetVol;jTient=nitroTientDe;jBump=nitroBumpDe;
    K.lvK=VIRVOL.k;K.lvC=VIRVOL.cap;K.lvOk=true;K.lvOk=lacetV(37)===lacetVol(37)&&lacetV(180)===lacetVol(180)&&lacetV(900)===lacetVol(900);
    K.seuil=NITRO2.seuil;K.ntOk=true;K.ntOk=tient(1,.0166,true)===nitroTientDe(1,.0166,true)&&tient(.004,0,true)===nitroTientDe(.004,0,true)&&tient(.01,.0166,true)===nitroTientDe(.01,.0166,true)
      &&tient(K.seuil+.01,0,false)===nitroTientDe(K.seuil+.01,0,false)&&tient(K.seuil-.01,0,false)===nitroTientDe(K.seuil-.01,0,false);
    if(LA.decor){jGrotte=grotteHeurt;jJade=jadeHeurt;jCanyon=canyonHeurt;jVille=villeHeurt;jGeants=geantsHeurt;gSolY=CITY.solY;}
    K.SPD=SPD;K.g=FALL_G*gk;K.RH=ROAD_HALF;K.TH=THICK;K.w=CARS[level].w;
    K.BASC_T=BASC_T;K.LEVRE_H=LEVRE_H;K.LEVRE_POSE=LEVRE_POSE;K.bump=BUMP_VY*M.sqrt(gk);
    K.vLis=VOL_LIS;K.hC=H60;K.lis=1-M.exp(-H60*VOL_LIS);K.l12=1-M.exp(-H60*12);
    K.push=et?et.push:1;K.cap=nitroCap();K.regen=NITRO2.regen;K.fren=FLOW.lv===4?FLOW2.fren.nitro:1;K.conso=NITRO2.conso*K.fren;K.coup=NITRO2.coup*K.cap*K.fren;
    K.bleu=60*NITRO_BLEU_K;K.veq=!!VEQ.on;K.niv=VEQ_K.niv;K.nivF=1-M.exp(-H60*VEQ_K.niv*M.min(1,(.5-.15)/.35)*(1-JEAU.wB));K.latch=VIRVOL.latch;K.inv=volInv();K.airM=airMax();K.fond=trackMinY-120;
    K.tutoPa=!!TUTO.pa;K.wB=JEAU.wB;K.park=!!PARK.on;K.balade=(typeof BALADE!=='undefined')&&!!BALADE;
    K.vMin=FLOW2.pose.vMin;K.angle=FLOW2.pose.angle;
    K.portOk=LA.portail&&!PARK.on&&!!portalMesh&&!PORTV.att;K.cube=LA.portail&&!!PCUBE.on;
    if(LA.portail){K.cx=PORTAL.c.x;K.cy=PORTAL.c.y;K.cz=PORTAL.c.z;
      if(K.cube){K.pe=PCUBE.inv.elements;const R=PCUBE.Ro+6;K.pR2=R*R;}else{K.pe=null;K.pR2=PORTAL.R*PORTAL.R*.9;}}
    /* les gardes du decor, dans l'ordre du jeu (boucle-3-physique.js) : ecartees une fois par vue */
    const D=LA.decor;
    K.dGrotte=D&&!!GROTTE.root;K.dJade=D&&!!JADE.col;K.dCanyon=D&&!!CY.on;K.dSol=D&&CITY.solY!=null&&!!(LVL.cur&&LVL.cur.vitre);K.dVille=D&&!!CITY.col;K.dGeants=D&&!!GEANTS.col;
    K.decor=K.dGrotte||K.dJade||K.dCanyon||K.dSol||K.dVille||K.dGeants;
    /* LA CADENCE DES SONDES DU DECOR, en images. Le jeu juge un point par image : une sonde plus rare manque le coin d'une tour frolee (MESURE le 24/11 :
       a 6 m de maille, une tour sur huit n'etait pas vue ; a chaque image ou une image sur deux, toutes). Elle se regle donc sur le PRIX de la sonde,
       mesure dans le jeu : la ville (0,4 microseconde) et les geants de l'orbite a chaque image ; le canyon une sur huit (134 microsecondes : son
       relief se lit par cinq hauteurs de terrain a chaque sonde).
       (2026-11-25, relecture) LA GROTTE ET LES PICS DE JADE AUSSI A CHAQUE IMAGE (c'etait une sur deux). MESURE : grotte, graine 910037, 2e saut — le
       jeu touche la roche a la 65e image (impaire, non sondee) et pas aux images 64, 66, 67, 68 : le radar passait a travers et annoncait le choc
       87 images plus loin. ⚠ Le canyon, a une image sur huit, aura le meme defaut en pire le jour ou son relief sera allume dans le simulateur.
       (2026-11-25, simulateur fidele) LE RELIEF EST ALLUME (ml/reel/jeu-reel.js, cyw=0). MESURE (justesse.js --cartes canyon --graines 16, allege) :
       32 vols, l'issue juste 32 fois sur 32 a la premiere vue, les 16 chocs prevus avec la bonne cause (paroi, canyon, riviere), aucun choc non
       prevu ; et les yeux coutent moins de 3 % du temps d'une course entiere du bot de reference (radar coupe / ouvert, 4 graines). La cadence reste
       une image sur huit : un choc qui frole une paroi entre deux sondes n'est PAS exclu (pas de mesure image par image au canyon). */
    K.cad=K.dCanyon?8:1;
    K.volrOn=volrOn();
    K.approx=AIR_RATE!==1||TBORD.t>0||(VOLR.on&&!VOLR_FIGE)||K.park||!!(TCTL.act||TCTL.incl||TCTL.pad)||(typeof RALENTI!=='undefined'&&RALENTI.t>0);
  };
  const decorNom=function(){const o=[];if(K.dGrotte)o.push('grotte');if(K.dJade)o.push('jade');if(K.dCanyon)o.push('canyon');if(K.dSol||K.dVille)o.push('ville');if(K.dGeants)o.push('espace');return o.length?o.join('+'):null;};
  const aveugleNom=function(){const o=[];if(LA.decor&&BANQ.root)o.push('glacier');if(LA.decor&&DN.on)o.push('dunes');if(typeof ESP_SANS_GEANTS!=='undefined'&&!ESP_SANS_GEANTS)o.push('roches');return o.length?o.join('+'):null;};

  /* ---- L'ETAT PRIVE D'UN VOL : des nombres, rien du jeu. p, v : la place et la vitesse ; u, r : le haut et la droite de la caisse (FLY_U, FLY_R) ;
     h : le haut du vol (la face quittee sur la route sans haut ni bas, sinon le ciel) ; st, l0, lT, lArm : le volant et son verrou ; pit : le manche ;
     nk, nAir, nAirT : le reacteur ; hor : l'horloge du jeu (ms) ; vh0 : le plafond de vitesse a plat ; fT, fTR : les deux chronos du vol ;
     basc, bascT : la bascule du bord ; q : le point d'avant dans le repere du portail ; bi, dLow : le radar de dalle. ---- */
  const neuf=function(){return {px:0,py:0,pz:0,vx:0,vy:0,vz:0,ux:0,uy:1,uz:0,rx:1,ry:0,rz:0,hx:0,hy:1,hz:0,volr:false,st:0,l0:0,lT:0,lArm:false,pit:0,
    nk:0,nAir:false,nAirT:0,hor:0,h:.5,vh0:-1,fT:0,fTR:0,basc:false,bascT:0,side0:1,sideCd:0,bumps:0,nR:0,nX:0,nOn:false,pwrN:0,sB:0,pwrA:0,stage:0,
    bi:-1,dLow:0,qx:0,qy:0,qz:0,qOk:false,d:0,s0:0,p0x:0,p0y:0,p0z:0};};
  const E0=neuf(),E=neuf(),CLES=Object.keys(E0);
  const copie=function(a,b){for(let i=0;i<CLES.length;i++){const k=CLES[i];a[k]=b[k];}return a;};
  /* l'etat de depart EN VOL, lu dans le jeu */
  const lireVol=function(e){
    e.px=fallPos.x;e.py=fallPos.y;e.pz=fallPos.z;e.vx=fallVel.x;e.vy=fallVel.y;e.vz=fallVel.z;
    e.ux=FLY_U.x;e.uy=FLY_U.y;e.uz=FLY_U.z;e.rx=FLY_R.x;e.ry=FLY_R.y;e.rz=FLY_R.z;
    e.volr=!!VOLR.on;if(e.volr){e.hx=VOLR.u.x;e.hy=VOLR.u.y;e.hz=VOLR.u.z;}else{e.hx=0;e.hy=1;e.hz=0;}
    e.st=steer;e.l0=VEQ.l0;e.lT=VEQ.lT;e.lArm=!!VEQ.lArm;e.pit=pitchS;e.nk=loop._nk||0;e.nAir=!!loop._nAir;e.nAirT=loop._nAirT||0;e.hor=performance.now();
    e.vh0=fallVH0;e.fT=fallT;e.fTR=fallTR;e.basc=!!bascOn;e.bascT=bascT;e.side0=fallStartSide;e.sideCd=sideCd;e.bumps=bounceN|0;
    e.nR=nitroR;e.nX=nitroX;e.nOn=!!nitroOn;e.pwrN=pwrNitroT;e.sB=startBoostT;e.pwrA=pwrAirT;e.stage=RAI.stage|0;
    e.bi=typeof tryLand._bi==='number'?tryLand._bi:-1;e.dLow=0;e.d=0;
    e.qOk=K.cube&&PCUBE.zp!=null;if(e.qOk){e.qx=PCUBE.xp;e.qy=PCUBE.yp;e.qz=PCUBE.zp;}
    e.s0=FLOW.s0;e.p0x=FLOW.p0.x;e.p0y=FLOW.p0.y;e.p0z=FLOW.p0.z;};
  /* les touches telles qu'elles sont (ce que la boucle du jeu lira a l'image suivante : boucle-1.js) */
  const TEN={cv:0,cm:0,cn:false,G:0,D:0,H:0,B:0,N:0};
  const lireTouches=function(){
    const lf=keys.KeyA||keys.KeyQ||keys.ArrowLeft,rt=keys.KeyD||keys.ArrowRight,up=keys.KeyW||keys.KeyZ||keys.ArrowUp,dn=keys.KeyS||keys.ArrowDown;
    TEN.G=lf?1:0;TEN.D=rt?1:0;TEN.H=up?1:0;TEN.B=dn?1:0;TEN.N=(keys.ShiftLeft||keys.ShiftRight||keys.Space)?1:0;
    TEN.cv=TEN.G-TEN.D;TEN.cm=TEN.B-TEN.H;TEN.cn=!!TEN.N;};

  /* ---- UNE IMAGE DE VOL (1/60 s), les lois du jeu dans leur ordre : d'abord ce que la boucle fait avant la branche vol (boucle-1.js : les minuteurs
     des pouvoirs, la jauge de nitro, le reacteur qui tient ou non, le volant lisse), puis la branche vol (boucle-3-physique.js : les chronos, la
     bascule, la gravite le long du haut, le verrou du volant et le lacet, le plane, le coup et la poussee du reacteur, le manche, le plafond a plat,
     l'avance, le repere du vol et son equilibre). cv : le volant vise (-1..1) ; cm : le manche (-1 pique, +1 cabre) ; cn : la NITRO tenue. ---- */
  const avance=function(e,cv,cm,cn){
    /* LE PAS : celui que la boucle du jeu calcule sur son horloge (boucle-1.js : (maintenant − avant) / 1000), pas un 1/60 rond. Les seuils du jeu
       tombent pile sur des images (0,35 s = 21 images, 0,45 = 27, 0,5 s = 30, 6 s = 360) : un chrono cumule autrement bascule une image plus tot ou
       plus tard. Les lissages (une exponentielle du pas) sont recalcules quand le pas change d'un dernier chiffre. */
    const t1=e.hor+PAS_MS,h=M.max(0,M.min((t1-e.hor)/1000,.05));e.hor=t1;e.h=h;
    if(h!==K.hC){K.hC=h;K.lis=1-M.exp(-h*K.vLis);K.l12=1-M.exp(-h*12);K.nivF=1-M.exp(-h*K.niv*M.min(1,(.5-.15)/.35)*(1-K.wB));}
    e.pwrN=M.max(0,e.pwrN-h);if(e.sB>0)e.sB=M.max(0,e.sB-h);
    if(e.pwrA>0){e.pwrA-=h;if(e.pwrA<=0){e.pwrA=0;e.fT=0;e.fTR=0;}}
    e.nR=M.min(K.cap,e.nR+K.regen*h);
    const libre=e.pwrN>0||K.park||e.sB>0;
    if(libre)e.nR=K.cap;
    const tk=libre?0:h*K.conso;
    e.nOn=cn&&tient(e.nR+e.nX,tk,e.nOn);
    if(e.nOn&&!libre){let take=tk;if(e.nR>=take)e.nR-=take;else{take-=e.nR;e.nR=0;e.nX=M.max(0,e.nX-take);}}
    const bleu=e.nOn&&e.nR<=.01;
    e.st+=(cv-e.st)*K.lis;
    e.sideCd=M.max(0,e.sideCd-h);
    /* la branche vol */
    e.fT+=h;e.fTR+=h;
    if(!e.nOn)e.nAir=false;
    if(e.basc){e.bascT+=h;if(e.bascT>1.1)e.basc=false;}
    const gB=e.basc?M.min(1,e.bascT/K.BASC_T):1;
    {const d=-K.g*gB*h;if(e.volr){e.vx+=e.hx*d;e.vy+=e.hy*d;e.vz+=e.hz*d;}else e.vy+=d;}
    /* le verrou du volant (la part du braquage tenue depuis la route s'efface), puis le lacet autour du haut de la caisse */
    if(e.lArm)e.lT+=h;
    let u=e.st;
    if(K.veq){let libreU=false;
      if(!e.lArm){if(e.basc&&e.bascT<K.BASC_T)libreU=true;else{e.lArm=true;e.l0=e.st;e.lT=0;}}
      if(!libreU){const g=M.max(0,1-e.lT/K.latch);
        if(g<=0||e.st*e.l0<=0)e.l0=0;
        else{if(M.abs(e.st)<M.abs(e.l0))e.l0=e.st;u=M.sign(e.st)*M.max(0,M.abs(e.st)-M.abs(e.l0)*g);}}}
    {const a=u*lacetV(M.sqrt(e.vx*e.vx+e.vy*e.vy+e.vz*e.vz))*h;
      if(a!==0){const c=M.cos(a),s9=M.sin(a),kx=e.ux,ky=e.uy,kz=e.uz,x=e.vx,y=e.vy,z=e.vz,d=(kx*x+ky*y+kz*z)*(1-c);
        e.vx=x*c+(ky*z-kz*y)*s9+kx*d;e.vy=y*c+(kz*x-kx*z)*s9+ky*d;e.vz=z*c+(kx*y-ky*x)*s9+kz*d;}}
    /* le reacteur qui s'installe (12 par seconde) : il fait planer */
    const nk=e.nk=e.nk+((e.nOn?1:0)-e.nk)*K.l12;
    if(nk>.002){const d=K.g*(bleu?.75:.6)*gB*h*nk;if(e.volr){e.vx+=e.hx*d;e.vy+=e.hy*d;e.vz+=e.hz*d;}else e.vy+=d;}
    if(e.nOn){
      /* le COUP d'allumage : un par allumage, 500 ms au moins entre deux */
      if(!e.nAir&&(e.hor-e.nAirT)>500){e.nAirT=e.hor;e.nAir=true;
        const sp8=M.sqrt(e.vx*e.vx+e.vy*e.vy+e.vz*e.vz),a8=46*K.push;
        if(sp8>1){const f=(sp8+a8)/sp8;e.vx*=f;e.vy*=f;e.vz*=f;}else{e.vx+=e.ux*a8;e.vy+=e.uy*a8;e.vz+=e.uz*a8;}
        e.vh0=M.max(e.vh0,aPlat(e));
        if(e.pwrN<=0)e.nR=M.max(0,e.nR-K.coup);}
      /* la poussee dans l'axe du vol */
      {const sp9=M.sqrt(e.vx*e.vx+e.vy*e.vy+e.vz*e.vz);if(sp9>1){const a9=(bleu?K.bleu:60)*K.push*h,f=(sp9+a9)/sp9;e.vx*=f;e.vy*=f;e.vz*=f;e.vh0=M.max(e.vh0,aPlat(e));}}}
    /* le manche : la trajectoire ET le haut de la caisse tournent autour de sa droite */
    e.pit+=(K.inv*cm-e.pit)*K.lis;
    if(M.abs(e.pit)>1e-4){const a=-e.pit*(.85+.85*nk)*h,c=M.cos(a),s9=M.sin(a),kx=e.rx,ky=e.ry,kz=e.rz;
      {const x=e.vx,y=e.vy,z=e.vz,d=(kx*x+ky*y+kz*z)*(1-c);e.vx=x*c+(ky*z-kz*y)*s9+kx*d;e.vy=y*c+(kz*x-kx*z)*s9+ky*d;e.vz=z*c+(kx*y-ky*x)*s9+kz*d;}
      {const x=e.ux,y=e.uy,z=e.uz,d=(kx*x+ky*y+kz*z)*(1-c);e.ux=x*c+(ky*z-kz*y)*s9+kx*d;e.uy=y*c+(kz*x-kx*z)*s9+ky*d;e.uz=z*c+(kx*y-ky*x)*s9+kz*d;}}
    /* le plafond a plat : jamais plus vite qu'au decollage */
    {const hx9=aPlat(e);if(e.vh0<0)e.vh0=M.max(hx9,M.sqrt(e.vx*e.vx+e.vy*e.vy+e.vz*e.vz));
      if(hx9>e.vh0&&hx9>1){const f=e.vh0/hx9;
        if(!e.volr){e.vx*=f;e.vz*=f;}else{const k=e.vx*e.hx+e.vy*e.hy+e.vz*e.hz;e.vx=(e.vx-e.hx*k)*f+e.hx*k;e.vy=(e.vy-e.hy*k)*f+e.hy*k;e.vz=(e.vz-e.hz*k)*f+e.hz*k;}}}
    /* l'avance */
    const sp=M.sqrt(e.vx*e.vx+e.vy*e.vy+e.vz*e.vz),pas=h*K.SPD;
    e.px+=e.vx*pas;e.py+=e.vy*pas;e.pz+=e.vz*pas;e.d+=sp*pas;e.dLow-=sp*pas;
    /* le repere du vol : le haut transporte avec la trajectoire, redresse vers le haut du vol (l'equilibre), puis la droite */
    const ki=1/(sp||1),dx=e.vx*ki,dy=e.vy*ki,dz=e.vz*ki;
    {const q=-(e.ux*dx+e.uy*dy+e.uz*dz);e.ux+=dx*q;e.uy+=dy*q;e.uz+=dz*q;}
    if(e.ux*e.ux+e.uy*e.uy+e.uz*e.uz<1e-4){e.ux=dy*e.rz-dz*e.ry;e.uy=dz*e.rx-dx*e.rz;e.uz=dx*e.ry-dy*e.rx;}
    {const k=1/(M.sqrt(e.ux*e.ux+e.uy*e.uy+e.uz*e.uz)||1);e.ux*=k;e.uy*=k;e.uz*=k;}
    if(K.veq){
      const sg=(e.volr?(e.ux*e.hx+e.uy*e.hy+e.uz*e.hz):e.uy)>=0?1:-1;let tx,ty,tz;
      if(e.volr){const q=-sg*(e.hx*dx+e.hy*dy+e.hz*dz);tx=e.hx*sg+dx*q;ty=e.hy*sg+dy*q;tz=e.hz*sg+dz*q;}else{const q=-sg*dy;tx=dx*q;ty=sg+dy*q;tz=dz*q;}
      const Lt=M.sqrt(tx*tx+ty*ty+tz*tz);
      if(Lt>=.15){const k=1/Lt;tx*=k;ty*=k;tz*=k;
        const cx=e.uy*tz-e.uz*ty,cy=e.uz*tx-e.ux*tz,cz=e.ux*ty-e.uy*tx;
        const a=M.atan2(cx*dx+cy*dy+cz*dz,cl(e.ux*tx+e.uy*ty+e.uz*tz,-1,1))*(Lt>=.5?K.nivF:1-M.exp(-h*K.niv*M.min(1,(Lt-.15)/.35)*(1-K.wB)));
        if(M.abs(a)>=1e-7){const c=M.cos(a),s9=M.sin(a),x=e.ux,y=e.uy,z=e.uz,d=(dx*x+dy*y+dz*z)*(1-c);
          e.ux=x*c+(dy*z-dz*y)*s9+dx*d;e.uy=y*c+(dz*x-dx*z)*s9+dy*d;e.uz=z*c+(dx*y-dy*x)*s9+dz*d;}}}
    {const x=e.uy*dz-e.uz*dy,y=e.uz*dx-e.ux*dz,z=e.ux*dy-e.uy*dx,k=1/(M.sqrt(x*x+y*y+z*z)||1);e.rx=x*k;e.ry=y*k;e.rz=z*k;}
  };
  /* la vitesse « a plat » : perpendiculaire au haut du vol */
  const aPlat=function(e){if(!e.volr)return M.sqrt(e.vx*e.vx+e.vz*e.vz);const k=e.vx*e.hx+e.vy*e.hy+e.vz*e.hz;return M.sqrt(M.max(0,e.vx*e.vx+e.vy*e.vy+e.vz*e.vz-k*k));};

  /* ---- LE PORTAIL TRAVERSE EN VOL : la sphere de l'ovule, ou le plan de l'anneau de cubes (la copie du test du jeu, rendu/portails.js, sur un
     point d'avant PRIVE : celui du jeu s'ecrit a chaque appel) ---- */
  const portail=function(e){
    if(!K.cube){if(!K.portOk)return false;const x=e.px-K.cx,y=e.py-K.cy,z=e.pz-K.cz;return x*x+y*y+z*z<K.pR2;}
    const m=K.pe,ax=e.px-K.cx,ay=e.py-K.cy,az=e.pz-K.cz,x=m[0]*ax+m[3]*ay+m[6]*az,y=m[1]*ax+m[4]*ay+m[7]*az,z=m[2]*ax+m[5]*ay+m[8]*az;
    const ok0=e.qOk,x0=e.qx,y0=e.qy,z0=e.qz;e.qx=x;e.qy=y;e.qz=z;e.qOk=true;
    let passe;
    if(ok0&&((z0>0&&z<=0)||(z0<0&&z>=0))&&(x-x0)*(x-x0)+(y-y0)*(y-y0)+(z-z0)*(z-z0)<1600){const k=z0===z?0:z0/(z0-z),xc=x0+(x-x0)*k,yc=y0+(y-y0)*k;passe=xc*xc+yc*yc<=K.pR2;}
    else passe=M.abs(z)<.4&&x*x+y*y<=K.pR2;
    return passe&&K.portOk;};
  /* ---- LE DECOR QUI TUE, dans l'ordre du jeu, chacun derriere sa garde. Les heurts du jeu sont APPELES (lecture : ils n'ecrivent que leurs
     brouillons). Rend la cause, ou ''. Ni le glacier, ni les dunes, ni les roches de l'orbite (hors du jeu par defaut) : voir « aveugle ». ---- */
  const decor=function(e){
    COUT.sondes++;SONDE.set(e.px,e.py,e.pz);
    if(K.dGrotte){const c=jGrotte(SONDE);if(c)return c;}
    if(K.dJade&&jJade(SONDE))return 'pic';
    if(K.dCanyon){const c=jCanyon(SONDE);if(c)return c;}
    if(K.dSol&&e.py<gSolY+1.4)return 'sol';
    if(K.dVille&&jVille(SONDE))return 'tour';
    if(K.dGeants){const c=jGeants(SONDE);if(c)return c;}
    return '';};
  /* ---- LA POSE : la copie, sur l'etat prive et a 1/60 s, de la regle de pose du jeu (gameplay/demi-tour.js). Dans l'ordre : la dalle elue et la
     seconde recherche des routes superposees ; rien au-dela de 40 m ; la caisse PORTEE par la levre pendant la bascule ; la LEVRE rattrapee ;
     la tranche (levre de pose, ou BUMP : la caisse rebondit, le vol CONTINUE) ; les fenetres dessus / dessous et les plans perces ; le filet dans
     l'epaisseur ; le point de percee dans la largeur. Rend 0 (toujours en vol), 1 (posee : R.s, R.lat, R.cote, R.vN, R.axe) ou 2 (levre). ---- */
  const R={issue:'',k:0,d:0,s:0,lat:0,cote:0,vN:0,axe:0,cause:'',haut:0,bumps:0,nit:0,air:0,gain:0};
  const pose=function(e){
    if(e.dLow>41)return 0;
    const SP=K.SPD,RH=K.RH,TH=K.TH,w=K.w,h=e.h;
    let bi=proche(e.px,e.py,e.pz,2,1e9,e.bi),bd=PR.d2;
    e.dLow=bi<0?1e9:M.sqrt(bd);
    if(bi>=0&&bd<1600){const q=gP[bi],n=gN[bi],h09=(e.px-q.x)*n.x+(e.py-q.y)*n.y+(e.pz-q.z)*n.z;
      if(h09<-TH-3||h09>3){const ex=M.ceil(200*(gNP-1)/M.max(1,gL)),b2=proche(e.px,e.py,e.pz,2,1600,-1,bi-ex,bi+ex),d2=PR.d2;
        if(b2>=0){const q2=gP[b2],m2=gN[b2],c2=gB[b2],x=e.px-q2.x,y=e.py-q2.y,z=e.pz-q2.z,h29=x*m2.x+y*m2.y+z*m2.z,l29=x*c2.x+y*c2.y+z*c2.z;
          if(h29>-TH-3&&h29<3&&M.abs(l29)<RH+w+2){bi=b2;bd=d2;}}}}
    e.bi=bi;
    if(bi<0)return 0;
    const q=gP[bi],n=gN[bi],b=gB[bi],t=gT[bi],dx=e.px-q.x,dy=e.py-q.y,dz=e.pz-q.z;
    const hOff=dx*n.x+dy*n.y+dz*n.z,latOff=dx*b.x+dy*b.y+dz*b.z,tOff=dx*t.x+dy*t.y+dz*t.z;
    if(bd>1600)return 0;
    const vN=e.vx*n.x+e.vy*n.y+e.vz*n.z,vB=e.vx*b.x+e.vy*b.y+e.vz*b.z;
    const prevH=hOff-vN*h*SP,prevL=latOff-vB*h*SP,aL=M.abs(latOff),sL=M.sign(latOff);
    const mrg=w*.5+M.max(.2,M.abs(vB)*SP*h*1.5);
    const bumpIn=aL>=RH&&aL<RH+mrg&&vB*sL<-3,bumpThru=M.abs(prevL)>=RH&&aL<RH&&M.sign(prevL)*vB<-3;
    /* la caisse portee par la levre : pendant la bascule elle ne passe pas sous la surface */
    if(e.basc&&e.side0>0&&hOff>-K.LEVRE_H&&(e.bascT<K.BASC_T||(aL>=RH&&aL<RH+w*.5))){
      const hS=-.35*M.min(1,M.max(e.bascT/K.BASC_T,(aL-RH)/(w*.5)));
      if(hOff<hS){const d=hS-hOff;e.px+=n.x*d;e.py+=n.y*d;e.pz+=n.z*d;if(vN<0){e.vx-=n.x*vN;e.vy-=n.y*vN;e.vz-=n.z*vN;}}}
    /* la levre rattrapee : le pneu accroche, la caisse est de retour sur la route, au bord */
    if(e.basc&&e.side0>0&&e.sideCd<=0&&e.bascT<1&&hOff>-K.LEVRE_H&&hOff<.8&&aL<RH+w*.5&&vB*sL<-.5){
      R.s=cl(bi/(gNP-1)*gL+cl(tOff,-2,2),0,gL-1);R.cote=sL;R.lat=sL*(RH-.05);return 2;}
    const cdB=e.sideCd>0,tranche=hOff>-TH-.12&&hOff<.12&&(bumpIn||bumpThru);
    const levre=tranche&&!cdB&&hOff>-K.LEVRE_POSE&&e.fT>.35&&vN<4.5?(bumpThru?M.sign(prevL):sL):0;
    if(tranche&&cdB){ /* pendant le repit du bump : le flanc arrete la caisse, sans rien payer */
      const sg=bumpThru?M.sign(prevL):sL,k=-vB*1.3,d=sg*M.max(bumpThru?0:aL,RH+w*.5)-latOff;
      e.vx+=b.x*k;e.vy+=b.y*k;e.vz+=b.z*k;e.px+=b.x*d;e.py+=b.y*d;e.pz+=b.z*d;return 0;}
    if(tranche&&!levre){ /* LE BUMP : reflexion amortie, renvoi vers le haut du vol, une demi-jauge d'air rendue */
      const sg=bumpThru?M.sign(prevL):sL,k=-vB*1.65;
      e.vx+=b.x*k;e.vy+=b.y*k;e.vz+=b.z*k;e.vx*=.78;e.vy*=.78;e.vz*=.78;
      if(e.volr){const vu=e.vx*e.hx+e.vy*e.hy+e.vz*e.hz,a=M.max(vu+2.4,K.bump)-vu;e.vx+=e.hx*a;e.vy+=e.hy*a;e.vz+=e.hz*a;}
      else e.vy=M.max(e.vy+2.4,K.bump);
      {const d=sg*M.max(bumpThru?0:aL,RH+w*.5)-latOff;e.px+=b.x*d;e.py+=b.y*d;e.pz+=b.z*d;}
      e.sideCd=.35;e.basc=false;e.bumps++;
      {const g=jBump(e.bumps,e.nOn&&e.pwrN<=0&&!K.park);if(g>0)e.nR=M.min(K.cap,e.nR+g);}
      e.fT=M.max(0,e.fT-K.airM*.5);e.fTR=M.max(0,e.fTR-K.airM*.5);
      return 0;}
    let sideL=0;
    if(levre||(e.fT>.35&&hOff>-1.2&&hOff<3&&vN<4.5))sideL=1;
    else if(e.fT>.1&&prevH>-1.2&&hOff<=-1.2&&vN<4.5)sideL=1;
    else if(e.fT>.35&&hOff>-TH-3&&hOff<-TH+1.2&&vN>-4.5)sideL=-1;
    else if(e.fT>.1&&prevH<-TH+1.2&&hOff>=-TH+1.2&&vN>-4.5)sideL=-1;
    if(!sideL&&e.fT>.1&&aL<RH&&hOff<-1.2&&hOff>-TH+1.2){ /* le filet : une caisse dans le corps de la dalle sort par la face la plus proche */
      const dL=RH+w*.5-aL,dT=-hOff,dB=TH+hOff;
      if(dL<=dT&&dL<=dB){const sg=sL||1,vb=e.vx*b.x+e.vy*b.y+e.vz*b.z,d=sg*(RH+w*.5)-latOff;
        e.px+=b.x*d;e.py+=b.y*d;e.pz+=b.z*d;if(vb*sg<0){const k=-vb*1.3;e.vx+=b.x*k;e.vy+=b.y*k;e.vz+=b.z*k;}
        return 0;}
      sideL=dT<=dB?1:-1;}
    if(!sideL)return 0;
    const hS=sideL>0?0:-TH,dh=prevH-hOff,f=M.abs(dh)>1e-4?cl((prevH-hS)/dh,0,1):1,latX=levre?levre*(RH-.05):prevL+(latOff-prevL)*f;
    if(M.abs(latX)>=RH)return 0;
    const vT=e.vx*t.x+e.vy*t.y+e.vz*t.z,vL=e.vx*b.x+e.vy*b.y+e.vz*b.z;
    R.s=cl(bi/(gNP-1)*gL+cl(tOff,-2,2),0,gL-1);R.lat=cl(latX,-(RH-.02),RH-.02)*sideL;R.cote=sideL;R.vN=vN;
    R.axe=M.sqrt(vT*vT+vL*vL)>K.vMin?M.atan2(vL*sideL,vT):0;
    return 1;};
  /* ---- LA JAUGE D'AIR (la copie de la regle du jeu, gameplay/fruits-auras.js : le raisin double la jauge) et le fond du monde.
     Rend 0, 1 (jauge vide) ou 2 (fond : 120 m sous le point le plus bas de la piste). ---- */
  const air=function(e){
    let vide=false;
    if(e.fTR>K.airM){if(e.pwrA>0){if(!K.tutoPa){if(e.stage===0){e.stage=1;e.fTR=0;}else vide=true;}}else vide=true;}
    if(e.py<K.fond)return 2;
    return vide&&!K.balade?1:0;};
  /* ce qu'il reste d'air a cet etat (s) : la jauge, le raisin et sa seconde jauge, le pouvoir qui expire en vol et rend une jauge neuve */
  const resteAir=function(fTR,pwrA,stage){
    if(pwrA>0&&K.tutoPa)return 99;
    const r=K.airM-fTR;
    if(!(pwrA>0))return r;
    if(stage===0)return pwrA<r+K.airM?pwrA+K.airM:r+K.airM;
    return pwrA<r?pwrA+K.airM:r;};

  /* ---- LE PILOTE EN BOUCLE FERMEE (recalcule toutes les 6 images, comme un cerveau) : la loi du bot de reference vers la route la plus proche
     (ml/bot/reference.js) — le cap qui ramene au-dessus de l'axe, le volant qui tient ce cap, piquer si la route est a plus de 2 s dessous. ---- */
  const PIL={cv:0,cm:0};
  const versRoute=function(e){
    PIL.cv=0;PIL.cm=0;
    const bi=proche(e.px,e.py,e.pz,2,1e9,e.bi);if(bi<0)return;
    const q=gP[bi],n=gN[bi],b=gB[bi],t=gT[bi],dx=e.px-q.x,dy=e.py-q.y,dz=e.pz-q.z,SP=K.SPD;
    const lt=dx*b.x+dy*b.y+dz*b.z,ht=dx*n.x+dy*n.y+dz*n.z;
    const vT=(e.vx*t.x+e.vy*t.y+e.vz*t.z)*SP,vB=(e.vx*b.x+e.vy*b.y+e.vz*b.z)*SP,vR=-(e.vx*n.x+e.vy*n.y+e.vz*n.z)*SP,axe=M.atan2(vB,vT);
    /* (2026-11-25, relecture) le vol tourne autour du haut de la CAISSE (boucle-3-physique.js), lt et axe sont mesures dans le repere de la ROUTE :
       tete en bas par rapport a elle (une sortie depuis le dessous de la dalle), la fleche ← envoie vers sa droite — le volant de la loi se retourne */
    /* …et le manche aussi : « piquer » tourne le nez vers le BAS DE LA CAISSE ; tete en bas au-dessus de la route, c'est s'en eloigner (MESURE au banc du
       jeu, dbgLache, 12 m au-dessus de la ville : sans ce retournement le rayon finissait « air » apres 6 s, avec lui il se pose) */
    const sg9=(e.ux*n.x+e.uy*n.y+e.uz*n.z)>=0?1:-1;
    if(M.abs(axe)<1.6)PIL.cv=cl((cl(-lt/40,-.6,.6)-axe)*1.6,-1,1)*sg9;
    if(ht>10&&M.abs(lt)<K.RH*2){const delai=ht/M.max(1,vR);if(delai>2||delai>resteAir(e.fTR,e.pwrA,e.stage)-1)PIL.cm=-sg9;}};

  /* ---- UN RAYON : le vol rejoue image par image jusqu'a sa premiere issue, a l'horizon (« libre ») ou au budget (« coupe »). A chaque image, l'ordre du
     jeu : l'avance, le portail, le decor, la pose, la jauge. Le decor est sonde une image sur K.cad, a la derniere, et a l'image d'une autre issue
     (le jeu le juge avant la pose). loi : 0 = les commandes tenues (cv, cm, cn) ; 1 = vers la route ; 2 = vers la route, nitro tenue. ---- */
  let TRACE=null;
  /* LE PRELUDE : ce que la main tient encore. Un ordre ne passe pas a l'image suivante : une touche enfoncee le reste au moins 4 images, une touche
     relachee aussi (ml/bot/doigts.js, HUMAIN), et un geste tient ses touches jusqu'a sa fin. Pendant ses premieres images, chaque rayon garde donc
     l'etat du moment de chaque touche (G, D : le volant ; H, B : le manche ; N : la nitro) tant que son delai n'est pas passe (dG… : en images).
     Les delais viennent de la demande (« doigts », que piloter.js lit dans les doigts) ; sans eux : zero, l'ordre tenu des l'image suivante. */
  /* (2026-11-25, relecture) LE PRELUDE A PLUSIEURS TEMPS. Tous a zero (le cas d'un cerveau sans profil hors d'un saut) : les lignes d'avant, au nombre pres.
       · bN : la NITRO, une fois son delai passe, reste RELACHEE jusqu'a l'image bN — le geste « saut » la lache a sa fin et la main ne peut pas la
         reprendre avant 27 images comptees depuis son appui (doigts.js, veut : HUMAIN.seul). MESURE (nuages 910000) : appui a l'image du decollage,
         tenue 5 images de vol, reprise possible a la 28e ;
       · fS, f0, f1 : UNE FLECHE que la main posera toute seule (fS : +1 ←, -1 →) des images f0 + 1 a f1 — a la fin du geste « saut », la main sans
         profil applique le volant du dernier ordre donne au sol (« ligne ») : 4 images de fleche en plein vol ;
       · mOn, mF, mC, mA, mV : UNE MAIN A COUPS OU A SUIVI (doigts v2). La fleche du moment tient jusqu'a la fin de SON coup (mF), puis la part de
         braquage de l'ordre en vigueur (mC, une moyenne : les coups suivants sont tires au hasard de la main, que les yeux ne lisent pas), remplacee
         par celle des ordres deja en route a leur image d'arrivee (mA, mV), jusqu'a l'arrivee de l'ordre du rayon. Le rayon « tenu » devient alors
         « l'ordre en vigueur », et tous les rayons sont marques « approx ». */
  const PRE={n:0,G:0,D:0,H:0,B:0,N:0,dG:0,dD:0,dH:0,dB:0,dN:0,bN:0,fS:0,f0:0,f1:0,mOn:false,mF:0,mC:0,mA:[],mV:[]};
  const sansPrelude=function(){PRE.n=0;PRE.dG=0;PRE.dD=0;PRE.dH=0;PRE.dB=0;PRE.dN=0;PRE.bN=0;PRE.fS=0;PRE.f0=0;PRE.f1=0;PRE.mOn=false;PRE.mF=0;PRE.mC=0;PRE.mA.length=0;PRE.mV.length=0;};
  const img60=function(x){x=+x;return x>0?M.min(60,M.round(x)):0;};
  const prelude=function(d){
    const f=img60;
    PRE.G=TEN.G;PRE.D=TEN.D;PRE.H=TEN.H;PRE.B=TEN.B;PRE.N=TEN.N;PRE.dG=f(d.G);PRE.dD=f(d.D);PRE.dH=f(d.H);PRE.dB=f(d.B);PRE.dN=f(d.N);
    PRE.bN=f(d.Nb);if(PRE.bN<=PRE.dN)PRE.bN=0;
    const m=d.vol;
    if(m&&typeof m==='object'){PRE.mOn=true;PRE.mF=f(m.fin);PRE.mC=cl(+m.c||0,-1,1);
      const F=m.file;if(F&&F.length)for(let j=0;j<F.length&&j<4;j++){PRE.mA.push(f(F[j][0]));PRE.mV.push(cl(+F[j][1]||0,-1,1));}}
    PRE.n=M.max(PRE.dG,PRE.dD,PRE.dH,PRE.dB,PRE.dN,PRE.bN);};
  /* la part de braquage de l'ordre en vigueur a l'image k (une main a coups ou a suivi) */
  const braquage=function(k){let c=PRE.mC;for(let j=0;j<PRE.mA.length;j++)if(PRE.mA[j]<k)c=PRE.mV[j];return c;};
  const rayon=function(e,loi,cv,cm,cn,N,plafond,tenu){
    const b0=e.bumps;let k=0;R.issue='libre';R.cause='';
    while(k<N){
      if(COUT.pas>=plafond){R.issue='coupe';break;}
      k++;COUT.pas++;
      if(loi&&(k-1)%6===0&&(e.dLow<=60||(k-1)%30===0)){versRoute(e);cv=PIL.cv;cm=PIL.cm;cn=loi===2;} /* loin de la route (60 m) : la dalle n'est cherchee que deux fois par seconde */
      if(k<=PRE.n||tenu){ /* la main n'a pas fini de changer de touches (tenu : une main a coups, dont « tenu » est l'ordre en vigueur) */
        const g=k<=PRE.dG?PRE.G:(cv>0?1:0),d=k<=PRE.dD?PRE.D:(cv<0?1:0),hh=k<=PRE.dH?PRE.H:(cm<0?1:0),b=k<=PRE.dB?PRE.B:(cm>0?1:0);
        let vol=loi&&k>PRE.dG&&k>PRE.dD?cv:g-d;
        if(PRE.fS&&k>PRE.f0&&k<=PRE.f1)vol=PRE.fS;
        if(PRE.mOn&&k>PRE.mF&&(tenu||k<=PRE.dG))vol=braquage(k);
        avance(e,vol,b-hh,k<=PRE.dN?!!PRE.N:(k<=PRE.bN?false:cn));}
      else avance(e,cv,cm,cn);
      if(portail(e)){R.issue='portail';break;}
      const sonde=K.decor&&(k%K.cad===0||k===N);
      if(sonde){const c=decor(e);if(c){R.issue='choc';R.cause=c;break;}}
      const p=pose(e);
      if(p){if(K.decor&&!sonde){const c=decor(e);if(c){R.issue='choc';R.cause=c;break;}}R.issue=p===1?'pose':'levre';break;}
      const a=air(e);
      if(a){if(K.decor&&!sonde){const c=decor(e);if(c){R.issue='choc';R.cause=c;break;}}R.issue=a===2?'fond':'air';break;}
      if(TRACE)TRACE.push(e.px,e.py,e.pz);}
    R.k=k;R.d=e.d;R.bumps=e.bumps-b0;R.nit=e.nR/K.cap;
    if(R.issue==='pose'){R.air=resteAir(e.fTR,e.pwrA,e.stage);R.gain=(R.s-e.s0)-M.sqrt((e.px-e.p0x)*(e.px-e.p0x)+(e.py-e.p0y)*(e.py-e.p0y)+(e.pz-e.p0z)*(e.pz-e.p0z));}
    else if(R.issue==='libre'||R.issue==='coupe'){ /* ou en est-on par rapport a la route la plus proche */
      const bi=proche(e.px,e.py,e.pz,2,1e9,e.bi);
      if(bi>=0){const q=gP[bi],n=gN[bi],b=gB[bi],dx=e.px-q.x,dy=e.py-q.y,dz=e.pz-q.z;R.haut=dx*n.x+dy*n.y+dz*n.z;R.lat=dx*b.x+dy*b.y+dz*b.z;R.s=bi/(gNP-1)*gL;}
      else{R.haut=NaN;R.lat=NaN;R.s=NaN;}}};
  /* le rayon → des nombres simples. tFig : le temps qu'il faut encore aux figures en cours (une pose n'est propre que si elles ont fini) */
  const rendre=function(m,nitro,approx,tFig){
    const o={m:m,issue:R.issue,t:n2(R.k*H60),d:n0(R.d)};
    if(approx)o.approx=true;
    if(R.bumps>0)o.bumps=R.bumps;
    if(nitro)o.nitro=n2(R.nit);
    if(R.issue==='pose'){const imp=M.abs(R.vN);
      o.s=n1(R.s);o.lat=n1(R.lat);o.axe=n2(R.axe);o.impact=n1(imp*K.SPD);o.note=imp<4.5?'parfaite':imp>=10?'lourde':'bonne';
      if(R.cote<0)o.dessous=true;if(M.abs(R.lat)<.3*K.RH)o.centre=true;
      o.gain=n0(R.gain);o.air=n2(R.air);o.propre=M.abs(R.axe)*57.3<=K.angle&&!(tFig>R.k*H60);}
    else if(R.issue==='levre'){o.s=n1(R.s);o.cote=R.cote;}
    else if(R.issue==='choc')o.cause=R.cause;
    else if(R.issue==='libre'||R.issue==='coupe'){o.haut=n1(R.haut);o.lat=n1(R.lat);o.s=n1(R.s);}
    return o;};
  /* ---- L'EVENTAIL : depuis l'etat e0, les facons de piloter, toujours dans le meme ordre. Un rayon dont les commandes egalent celles de « tenu »
     recopie son resultat sans recalcul. liste : [nom, loi, volant, manche, nitro, horizon (s)]. ---- */
  const eventail=function(e0,liste,plafond,approx,tFig,long){ /* long : l'horizon (s) qui remplace LONG dans la liste (les sorties du sol : la jauge d'air entiere) */
    const out=[],main=PRE.mOn;let tenu=null; /* (2026-11-25, relecture) main : une main a coups ou a suivi — « tenu » n'est plus des touches figees, rien ne se recopie */
    for(let i=0;i<liste.length;i++){const q=liste[i];
      if(tenu&&!q[1]&&q[2]===tenu[2]&&q[3]===tenu[3]&&q[4]===tenu[4]){const o=JSON.parse(tenu[6]);o.m=q[0];out.push(o);continue;}
      copie(E,e0);
      rayon(E,q[1],q[2],q[3],q[4],M.max(1,M.round((long&&q[5]===LONG?long:q[5])*60)),plafond,main&&q[0]==='tenu');
      const o=rendre(q[0],q[4]||q[1]===2,approx||q[1]>0||main,tFig);out.push(o);
      if(i===0&&q[0]==='tenu'&&!main){tenu=q;tenu[6]=JSON.stringify(o);}}
    return out;};

  /* ---- LE RADAR DE VOL ---- */
  const radarVol=function(f,dem){
    if(LA.portail&&PORTV.vol&&PORTV.att)return null; /* la caisse est tenue en l'air au portail : le vol ne court pas */
    lireVol(E0);lireTouches();
    const C9=FX2.corps,tFig=C9&&C9.figs&&C9.figs.length?C9.reste():0;
    const long=M.min(M.max(0,f.air.reste)+.05,LONG),court=M.min(COURT,long);
    const liste=[['tenu',0,TEN.cv,TEN.cm,TEN.cn,long],['rien',0,0,0,false,long],['gauche',0,1,0,false,court],['droite',0,-1,0,false,court],
      ['cabre',0,0,1,false,court],['pique',0,0,-1,false,court],['plane',0,0,0,true,long],['planeCabre',0,0,1,true,court],
      ['versRoute',1,0,0,false,long],['versRoutePlane',2,0,0,true,long]];
    const sp=M.sqrt(E0.vx*E0.vx+E0.vy*E0.vy+E0.vz*E0.vz);
    const o={pas:n3(H60),court:n2(court),long:n2(long),maille:K.decor?n1(sp*K.SPD*H60*K.cad):null,decor:decorNom(),aveugle:aveugleNom(),approx:!!K.approx,rayons:null};
    if(dem&&dem.doigts)prelude(dem.doigts);
    try{o.rayons=eventail(E0,liste,BUDGET.vol,K.approx,tFig);}finally{sansPrelude();}
    return o;};

  /* ---- AU SOL : LA CINEMATIQUE DE LA ROUTE, APPROCHEE (la vitesse tenue, ni drift, ni flaque, ni verglas). Le volant lisse (boucle-1.js), le lacet
     vise pris en VOL_TAU, le cap, l'ecart et l'avance (boucle-2-conduite.js), le virage de la route retire du cap ; en couloir le bord est un mur.
     loi : 0 = tenir la route au mieux (la loi « ligne:0 » des doigts, volant analogique) ; 1 = plein volant a gauche ; 2 = a droite ; 3 = volant lache.
     Rend 'tient' (rien avant N images), 'bord', 'mur' ou 'portail' ; G.k = les images roulees. ---- */
  const G={s:0,lat:0,psi:0,st:0,yawR:0,vA:0,vm:1,sd:1,dir:1,k:0,vL:0,angle:0,lacet:0}; /* lacet : de combien la route tourne sous la caisse (rad/s), garde d'un appel de « rouler » au suivant */
  const COUL=[];
  const dansCouloir=function(sv){for(let i=0;i<COUL.length;i++){const c=COUL[i];if(c.mur&&sv>=c.s0&&sv<=c.s1)return true;}return false;};
  const lireSol=function(g){g.s=s;g.lat=lat;g.psi=psi-slipB-((typeof BKV!=='undefined'&&BKV.gl)||0);g.st=steer;g.yawR=yawR;g.vA=FREIN_L<0?vA*M.exp(FREIN_L):vA;g.vm=vitMult();g.sd=side<0?-1:1;g.dir=driveDir;g.k=0;g.vL=0;g.angle=0;g.lacet=routeLacet;};
  const rouler=function(g,loi,N){
    const h=H60,RH=K.RH,SP=K.SPD,lm=lacetMax(g.vA)*g.vm,vit=M.max(6,M.abs(g.vA)*SP*g.vm),tau=1-M.exp(-h*g.vm/VOL_TAU),gaz=cl(g.vA/8,-1,1);
    const fin=gL-(K.cube?24:32),tord=!!TORD.on;
    cadre(g.s,CA,g.sd);let tx=CA.tx,ty=CA.ty,tz=CA.tz,lacet=g.lacet;
    for(let k=1;k<=N;k++){
      if(COUT.route>=BUDGET.route)return 'tient';
      COUT.route++;g.k++;
      let cible=0;
      if(loi===0)cible=cl((lacet+(cl((0-g.lat)/(vit*.9),-.4,.4)-g.psi)*3)/M.max(.05,lm),-1,1);
      else if(loi===1)cible=1;else if(loi===2)cible=-1;
      g.st+=(cible-g.st)*K.lis;
      g.yawR+=(g.st*lm*gaz-g.yawR)*tau;
      g.psi=cl(g.psi+g.yawR*h,-1.4,1.4);
      g.vL=g.vA*M.sin(g.psi);
      g.lat+=g.vL*g.dir*h*SP*g.vm;
      g.s+=g.vA*M.cos(g.psi)*g.dir*h*SP*g.vm;
      cadre(g.s,CA,g.sd);
      {const cx=ty*CA.tz-tz*CA.ty,cy=tz*CA.tx-tx*CA.tz,cz=tx*CA.ty-ty*CA.tx,dy=M.atan2(cx*CA.nx+cy*CA.ny+cz*CA.nz,tx*CA.tx+ty*CA.ty+tz*CA.tz);
        const rails=tord?0:cl((.5-g.sd*CA.ny)/.3,0,1);
        g.psi=cl(g.psi-dy*(1-rails),-1.4,1.4);lacet=dy/h;g.lacet=lacet;tx=CA.tx;ty=CA.ty;tz=CA.tz;}
      if(K.portOk&&g.s>fin)return 'portail';
      if(M.abs(g.lat)>RH-1.15&&dansCouloir(g.s)){const out=M.sign(g.lat)||1,into=g.vL*g.dir*out;g.angle=into>0?M.asin(M.min(1,into/M.max(1,M.abs(g.vA)))):0;return 'mur';}
      if(M.abs(g.lat)>RH)return 'bord';}
    return 'tient';};
  /* ---- LE DECOLLAGE SIMULE : l'etat de vol au sortir de la route, la copie du decollage du jeu (portail-passage.js) sur l'etat prive. impU : l'impulsion
     vers le haut de la route (0 au bord, 6 pour le saut d'une figure) ; bord : la sortie par le cote (la bascule) ; voulu : un saut voulu (le volant
     n'est pas verrouille). ---- */
  const FM={t:{x:0,y:0,z:0},n:{x:0,y:0,z:0}};
  const lancer=function(e,g,impU,bord,voulu,nit,bond){
    cadre(g.s,CA,g.sd);
    const off=(g.sd<0?K.TH:0)+(bond||0),a=g.vA*M.cos(g.psi)*g.dir*g.vm,b=g.vA*M.sin(g.psi)*g.dir*g.vm;
    e.px=CA.px+CA.bx*g.lat+CA.nx*off;e.py=CA.py+CA.by*g.lat+CA.ny*off;e.pz=CA.pz+CA.bz*g.lat+CA.nz*off;
    e.vx=CA.tx*a+CA.bx*b+CA.nx*impU;e.vy=CA.ty*a+CA.by*b+CA.ny*impU;e.vz=CA.tz*a+CA.bz*b+CA.nz*impU;
    FM.t.x=CA.tx;FM.t.y=CA.ty;FM.t.z=CA.tz;FM.n.x=CA.nx;FM.n.y=CA.ny;FM.n.z=CA.nz;
    e.volr=K.volrOn&&murRoule(FM);
    if(e.volr){e.hx=CA.nx;e.hy=CA.ny;e.hz=CA.nz;const k=e.vx*e.hx+e.vy*e.hy+e.vz*e.hz;if(k>70){const d=70-k;e.vx+=e.hx*d;e.vy+=e.hy*d;e.vz+=e.hz*d;}}
    else{e.hx=0;e.hy=1;e.hz=0;if(e.vy>70)e.vy=70;}
    const ki=1/(M.sqrt(e.vx*e.vx+e.vy*e.vy+e.vz*e.vz)||1),dx=e.vx*ki,dy=e.vy*ki,dz=e.vz*ki,q=-(CA.nx*dx+CA.ny*dy+CA.nz*dz);
    e.ux=CA.nx+dx*q;e.uy=CA.ny+dy*q;e.uz=CA.nz+dz*q;
    if(e.ux*e.ux+e.uy*e.uy+e.uz*e.uz<1e-4){e.ux=CA.by*dz-CA.bz*dy;e.uy=CA.bz*dx-CA.bx*dz;e.uz=CA.bx*dy-CA.by*dx;}
    {const k=1/(M.sqrt(e.ux*e.ux+e.uy*e.uy+e.uz*e.uz)||1);e.ux*=k;e.uy*=k;e.uz*=k;}
    {const x=e.uy*dz-e.uz*dy,y=e.uz*dx-e.ux*dz,z=e.ux*dy-e.uy*dx,k=1/(M.sqrt(x*x+y*y+z*z)||1);e.rx=x*k;e.ry=y*k;e.rz=z*k;}
    e.st=g.st;e.l0=voulu?0:g.st;e.lT=0;e.lArm=!bord;e.pit=0;e.nOn=!!nit;e.nk=nit?1:0;e.nAir=!!nit;e.nAirT=loop._nAirT||0;e.hor=performance.now()+g.k*1000/60;
    e.vh0=-1;e.fT=0;e.fTR=0;e.basc=!!bord;e.bascT=0;e.side0=g.sd;e.sideCd=M.max(0,sideCd-g.k*H60);e.bumps=0;
    e.nR=nitroR;e.nX=nitroX;e.pwrN=pwrNitroT;e.sB=startBoostT;e.pwrA=pwrAirT;e.stage=0;e.bi=-1;e.dLow=0;e.d=0;e.qOk=false;
    if(K.cube){const m=K.pe,ax=e.px-K.cx,ay=e.py-K.cy,az=e.pz-K.cz;e.qx=m[0]*ax+m[3]*ay+m[6]*az;e.qy=m[1]*ax+m[4]*ay+m[7]*az;e.qz=m[2]*ax+m[5]*ay+m[8]*az;e.qOk=true;}
    e.s0=g.s;e.p0x=e.px;e.p0y=e.py;e.p0z=e.pz;};
  const GS=Object.assign({},G),ES=neuf();
  /* une sortie simulee : la route roulee selon « loi » jusqu'au bord (ou N images), puis l'eventail depuis le decollage */
  /* (2026-11-25, relecture) LA MAIN AU SOL. DG = les delais de la main donnes avec la demande (doigts.js, delais), ou null.
     · UNE MAIN A PROFIL (DG.r : la prochaine reaction de chaque canal, deja tiree) : la reaction est ROULEE avant la sortie (la main tient encore la
       route : loi 0), puis le plein volant ou le geste ; une fois en l'air, les touches du decollage tiennent encore le temps d'une reaction (celle
       d'apres n'est pas tiree : on reprend la meme, c'est une estimation). Sans profil, ou reactions nulles : rien de tout cela, les lignes d'avant.
     · LE SAUT, image par image (MESURE dans le jeu, nuages 910000, ordre a l'image 306 : figure lancee a la 321e, NITRO du decollage posee a la
       330e — la premiere image de VOL, le decollage part dans frTick avant la branche vol de la meme image —, NITRO et ↓ laches a la 335e, une fleche
       → de la 335e a la 338e, NITRO reprenable a la 357e) : 24 images de route ; en vol, NITRO et manche tenus 5 images, la NITRO relachee jusqu'a
       la 27e, et la fleche du dernier ordre du sol des images 6 a 9 (DG.aide : l'aide ou le volant de l'ordre en cours, retraduit sur l'etat de la
       caisse au decollage, comme le fera « traduire » a la derniere decision au sol). */
  let DG=null;
  const sortie=function(loi,N,impU,bord,voulu,liste,plafond,bond){
    const R9=DG&&DG.r&&typeof DG.r==='object'?DG.r:null,rv=R9?img60(R9.v):0,rm=R9?img60(R9.m):0,rn=R9?img60(R9.n):0,rg=R9?img60(R9.g):0;
    const att=loi===3?rg:(loi===1||loi===2)?rv:0;
    copieG(GS,G0);let r;
    if(att>0){r=rouler(GS,0,att);if(r==='tient')r=rouler(GS,loi,loi===3?N:M.max(1,N-att));}else r=rouler(GS,loi,N);
    if(r!==(bord?'bord':'tient'))return {issue:r,t:n2(GS.k*H60),s:n1(GS.s),approx:true}; /* la sortie n'a pas lieu : la route tient, un mur, le portail */
    const nit=bord?!!nitroOn:tient(nitroR+nitroX,0,!!nitroOn);
    lancer(ES,GS,impU,bord,voulu,nit,bond);
    /* t : l'image du decollage. Pour le saut, la premiere image de vol est celle qui suit les images de route (d'ou le + 1 : 0,42 s sans profil) */
    const o={t:n2((GS.k+(bord?0:1))*H60),s:n1(GS.s),cote:bord?(M.sign(GS.lat)||1):0,approx:true,rayons:null};
    if(!bord){
      let fl=0;const A9=DG&&DG.aide;
      if(A9&&typeof A9==='object'){let v9=0;
        if(typeof A9.ligne==='number'&&A9.ligne-A9.ligne===0){const vit=M.max(6,M.abs(GS.vA)*K.SPD*GS.vm),capV=cl((A9.ligne-GS.lat)/(vit*.9),-.4,.4);v9=cl((GS.lacet+(capV-GS.psi)*3)/M.max(.05,lacetMax(GS.vA)*GS.vm),-1,1);}
        else if(typeof A9.volant==='number'&&A9.volant-A9.volant===0)v9=A9.volant;
        fl=v9>=.08?1:v9<=-.08?-1:0;}
      PRE.G=0;PRE.D=0;PRE.H=0;PRE.B=1;PRE.N=1;PRE.dG=M.max(5,rv);PRE.dD=PRE.dG;PRE.dH=5;PRE.dB=5;PRE.dN=5;PRE.bN=M.max(27,rn);PRE.fS=fl;PRE.f0=5;PRE.f1=9;PRE.n=M.max(PRE.dG,PRE.bN);
      o.impulsion=n1(impU);o.fleche=fl;}
    else if(rv||rm||rn){PRE.G=loi===1?1:0;PRE.D=loi===2?1:0;PRE.H=0;PRE.B=0;PRE.N=nit?1:0;PRE.dG=rv;PRE.dD=rv;PRE.dH=rm;PRE.dB=rm;PRE.dN=rn;PRE.n=M.max(rv,rm,rn);}
    /* (2026-11-25, relecture) l'horizon long d'une sortie : la jauge d'air ENTIERE et 3 images (6,05 s ; 5,05 dans l'espace), pas 6 s rondes — a 6 s pile
       un vol qui meurt jauge vide a l'image suivante sortait « libre » (MESURE : 6 sorties franches sur 13 suivies de « versRoute ») ; il sort « air ». */
    try{o.rayons=eventail(ES,liste,plafond,true,0,M.min(LONG,M.max(0,resteAir(0,pwrAirT,0)))+.05);}finally{sansPrelude();}
    return o;};
  const G0=Object.assign({},G),GC=Object.keys(G);
  const copieG=function(a,b){for(let i=0;i<GC.length;i++){const k=GC[i];a[k]=b[k];}return a;};

  /* ---- LES COULOIRS ET PLAFONDS DEVANT (les tables du jeu : maps/canyon-relief.js, maps/ville-scenes.js) ---- */
  const lireCouloirs=function(){
    COUL.length=0;if(!LA.couloirs)return;
    if(CY.on){
      if(CY.cou)COUL.push({s0:CY.cou[0],s1:CY.cou[1],genre:'couloir',plafond:false,mur:true});
      if(CY.tun)COUL.push({s0:CY.tun[0],s1:L,genre:'tunnel',plafond:true,mur:true});
      if(CY.mineT&&CY.mine)COUL.push({s0:CY.mine[0],s1:CY.mine[1],genre:'mine',plafond:true,mur:true});}
    const C=CITY.couloirs;if(C&&C.length)for(let i=0;i<C.length;i++)COUL.push({s0:C[i][0],s1:C[i][1],genre:'ville',plafond:true,mur:true});};
  /* ---- LA COURBURE QUE LA CONDUITE SUBIT, par point de piste (une fois par piste) : de combien la route tourne autour de son haut, par metre,
     lissee sur 20 m. Signe : + = a gauche pour la face du dessus. ---- */
  const CB={gP:null,n:0,sig:0,k:null,pas:1};
  const courbes=function(){
    if(CB.gP===gP&&CB.n===gNP)return CB;
    const seg=gL/M.max(1,gNP-1),k=M.max(1,M.round(10/seg)),A=new Float32Array(gNP);
    for(let i=0;i<gNP;i++){const a=gT[M.max(0,i-k)],b=gT[M.min(gNP-1,i+k)],n=gN[i],long=(M.min(gNP-1,i+k)-M.max(0,i-k))*seg;
      const cx=a.y*b.z-a.z*b.y,cy=a.z*b.x-a.x*b.z,cz=a.x*b.y-a.y*b.x;
      A[i]=long>0?M.atan2(cx*n.x+cy*n.y+cz*n.z,a.x*b.x+a.y*b.y+a.z*b.z)/long:0;}
    CB.gP=gP;CB.n=gNP;CB.sig=signe();CB.k=A;CB.pas=k;return CB;};
  /* le prochain virage : le premier endroit ou la route tourne plus serre que 600 m de rayon, suivi jusqu'a ce qu'elle se redresse ou change de sens */
  const virageDevant=function(sd,vit,vm,rMin){
    const C=courbes(),seg=gL/M.max(1,gNP-1),i0=idx(s),i1=idx(s+M.max(400,4*vit)),tord=!!TORD.on,SEUIL=1/600;
    let deb=-1,sens=0,kMax=0,ang=0;
    for(let i=i0;i<=i1;i++){
      const kk=C.k[i]*sd*(tord?1:1-cl((.5-gN[i].y)/.3,0,1)),a=M.abs(kk);
      if(deb<0){if(a>SEUIL){deb=i;sens=kk>0?1:-1;kMax=a;ang=a*seg;}}
      else{if(a<=SEUIL||kk*sens<0)break;if(a>kMax)kMax=a;ang+=a*seg;}}
    if(deb<0)return null;
    const R9=1/kMax,w=M.max(0,ROAD_HALF-6),c=M.cos(M.min(M.PI,ang)/2),Rc=M.min(3000,c<.9999?(R9+w-(R9-w)*c)/(1-c):3000);
    const vS=M.max(0,vm*(R9-VOL_R0)/VOL_RK);
    return {d:n0(M.max(0,(deb-i0)*seg)),sens:sens,rayon:n0(R9),angle:n2(ang),vSure:n1(vS),vSureDrift:n1(M.max(0,vm*(1.15*R9-VOL_R0)/VOL_RK)),
      vCorde:n1(M.max(0,vm*(Rc-VOL_R0)/VOL_RK)),marge:n1(vS-vit),braquage:n2(rMin/R9)};};
  /* ---- LE SAUT REFUSE : la regle du decollage d'une figure sur la route (gameplay/figures-route.js). Les deux refus « tete en bas » du jeu sont
     appeles ; celui de la crete des nuages (route-sans-haut.js) ecrit sa derniere mesure : il est recopie sans cette ecriture. ---- */
  const creteRefuse=function(){
    if(!TORD.on||!(NP>2)||!(L>0)||typeof NUA_PC==='undefined'||!NUA_PC.on||!nua2On())return false;
    const pl=!!nitroOn,v=M.max(40,M.abs(vA)*SPD*vitMult()),b=s+v*(pl?NUA_SS.tn:NUA_SS.t);
    if(MODS)for(const m of MODS)if(m.ss)for(const e of m.ss)if(b>=e[0]&&s<=e[1])return true;
    const k=(NP-1)/L,i0=M.max(0,M.round(s*k)),i1=M.min(NP-2,M.round(b*k));let d=0;
    for(let i=i0;i<i1;i++){const a9=T[i],b9=T[i+1],n9=Nn[i],x=(b9.x-a9.x)*n9.x+(b9.y-a9.y)*n9.y+(b9.z-a9.z)*n9.z;if(x<0)d-=x;}
    return v*d>(pl?NUA_SS.evn:NUA_SS.ev);};
  /* (2026-11-25, relecture) LA FIGURE QUI PORTE LE SAUT : sans elle, pas de bond, donc pas de saut — la main joue quand meme le geste jusqu'au bout
     (↓ tenu au sol : le frein). Les refus de son lancement (gameplay/figures-route.js, frLance), juges a l'image ou le geste pose son 2e appui,
     15 images apres l'ordre : un geste du glisse, moins de 0,9 s apres la figure d'avant, et le PRIX — 35 % de la jauge (NITRO2.figN.cout), sauf
     nitro offerte ; la jauge se refait un peu en 15 images (comptee au plus : un « refuse » est sur, sauf fruit ou plaque ramasses entre-temps).
     UNE FIGURE DEJA EN COURS (FR.on) n'est PAS un refus : le geste peut faire decoller du bond en cours (frEnvol : un appui NITRO neuf et le manche
     vers soi) — sautRefuse reste faux, et les sorties rendent { issue:'figure' } : le radar ne prevoit pas ce saut-la. */
  const figRefuse=function(){
    if(GSOL.k||performance.now()+15*PAS_MS-VEQ.sautT<VEQ_K.sautCd*1000)return true;
    if(pwrNitroT>0||PARK.on||startBoostT>0)return false;
    const c9=nitroCap();return M.min(c9,nitroR+NITRO2.regen*.25)+nitroX<NITRO2.figN.cout*c9;};
  const sautRefuse=function(){return !!(side<0||jadeEnversRefuse()||villeEnversRefuse()||creteRefuse()||TUTO.on||hopY>0||hopV!==0||POSE_F||DMT.act||(!FR.on&&figRefuse()));};
  /* ---- LA LIGNE PARFAITE : les 4 prochains objets non pris de MA face (fruit, plaque, fruit, plaque…), dans le repere de la caisse ---- */
  const ligneDevant=function(sd){
    if(!LIGNE.on)return null;
    const o=[];
    for(let i=0;i<pickups.length;i++){const p=pickups[i];if(!p.ligne||p.taken||p.face!==side)continue;const d=p.s-s;if(d<=0||d>900)continue;o.push({d:n0(d),lat:n1(sd*p.lat),type:'fruit',don:n2(p.don||LIGNE.don)});}
    LIGNE.padI.forEach(function(i){if(LIGNE.padPris.has(i))return;const d=PADS[i]-s;if(d<=0||d>900)return;o.push({d:n0(d),lat:n1(sd*PADL[i]),type:'plaque',don:n2(LIGNE.don)});});
    o.sort(function(a,b){return a.d-b.d;});
    return {cadence:n2(LIGNE.dt),don:n2(LIGNE.don),prises:[4.5,5.6],objets:o.slice(0,4)};};

  /* ===== LA VUE ===== */
  const LISTE_BORD=[['rien',0,0,0,false,LONG],['versRoute',1,0,0,false,LONG],['plane',0,0,0,true,LONG]];
  const LISTE_DEM=[['rien',0,0,0,false,MOYEN],['plane',0,0,0,true,MOYEN]];
  /* (2026-11-25, relecture) LES SORTIES A GAUCHE ET A DROITE : « rien » et « plane » sur 3 s ne disaient jamais si la sortie est vivable (MESURE :
     16 issues justes sur 17, dont 15 « libre » pour des vols morts ensuite, jauge vide). S'y ajoute « versRoute » sur 6 s, la facon qu'un pilote
     jouera une fois en l'air. LISTE_DEM reste celle du saut. */
  const LISTE_COTE=[['rien',0,0,0,false,MOYEN],['plane',0,0,0,true,MOYEN],['versRoute',1,0,0,false,LONG]];
  const yeux=function(dem){
    const v=vue1();
    DG=dem&&dem.doigts&&typeof dem.doigts==='object'?dem.doigts:null;
    COUT.pas=0;COUT.route=0;COUT.dalles=0;COUT.sondes=0;COUT.erreurs=0;
    if(dem&&dem.radar===false)return v;
    const sol=v.mode==='sol',vol=v.mode==='vol';
    if(LA.route)lirePiste();
    /* toujours */
    try{v.vitMult=n3(vitMult());}catch(e){v.vitMult=dit(e);}
    if(LA.palier)try{const t=ENGINE_TIERS[engTier]||ENGINE_TIERS[0],sv=ENGINE_TIERS[engTier+1],el=lateMul();
      v.palier={n:(engTier|0)+1,pieces:coinsGot|0,manque:sv?M.max(0,sv.coins-coinsGot):null,pousse:n2(t.push),jauge:n2(t.res),elan:n3(el),vmax:n1(CARS[0].maxKmh/3.6*el*t.push*SPD)};}catch(e){v.palier=dit(e);}
    else v.palier=null;
    if(LA.aimant)try{const m=engTier>=ENG_CAP.aimant?1:0;v.aimant={moteur:!!m,sol:[15+2*m,9+2*m],prise:3.8+.5*m,vol:11+3*m,pomme:pwrMagT>0?MAG_R:0};}catch(e){v.aimant=dit(e);}
    else v.aimant=null;
    v.invulnerable=LA.chance?n2(CHANCE.inv||0):null;
    if(!sol&&!vol)return v;
    if(vol){
      const f=v.vol;
      if(!LA.vol||!LA.route){f.air=null;f.radar=null;return v;}
      try{lireJeu();}catch(e){f.radar=dit(e);return v;}
      try{f.air={reste:n2(M.max(0,resteAir(fallTR,pwrAirT,RAI.stage|0))),jauges:pwrAirT>0&&!TUTO.pa&&RAI.stage===0?2:1};}catch(e){f.air=dit(e);}
      f.perdu=n2(MIR.t);f.hautRoute=!!VOLR.on;f.bascule=bascOn?n2(bascT):null;f.bumps=bounceN|0;
      try{f.radar=f.air&&f.air.reste!=null?radarVol(f,dem):null;}catch(e){f.radar=dit(e);}
      return v;}
    /* au sol */
    v.arret=LA.arret?n2(idleT):null;
    if(!LA.route){v.rayonMin=null;v.virage=null;v.couloirs=null;v.mur=null;v.ligne=null;v.sautRefuse=null;v.tenue=null;v.sorties=null;return v;}
    const sd=side<0?-1:1,vm=vitMult(),vit=M.abs(vA)*SPD*vm;
    const rMin=VOL_R0+VOL_RK*M.max(8,M.abs(vA)*SPD);v.rayonMin=n1(rMin);
    try{v.virage=virageDevant(sd,vit,vm,rMin);}catch(e){v.virage=dit(e);}
    try{lireCouloirs();v.couloirs=[];for(let i=0;i<COUL.length;i++){const c=COUL[i],d0=c.s0-s,d1=c.s1-s;if(d1<0||d0>900)continue;v.couloirs.push({d0:n0(d0),d1:n0(d1),genre:c.genre,plafond:c.plafond});}
      v.mur={ici:dansCouloir(s),bord:n2(ROAD_HALF-1.15),angle:.52,mortel:M.abs(vA)*3.6*SPD>200};}catch(e){v.couloirs=dit(e);v.mur=null;}
    if(LA.ligne)try{v.ligne=ligneDevant(sd);}catch(e){v.ligne=dit(e);}else v.ligne=null;
    let refuse=null;
    if(LA.saut)try{refuse=sautRefuse();v.sautRefuse=refuse;}catch(e){v.sautRefuse=dit(e);}else v.sautRefuse=null;
    /* la route tenue au mieux pendant 3 s, puis les sorties */
    v.sorties=null;
    if(!LA.vol){v.tenue=null;return v;}
    try{
      lireJeu();lireSol(G0);copieG(G,G0);
      const r=rouler(G,0,TENUE*60);
      if(r==='bord'||r==='mur')v.tenue={tient:false,t:n2(G.k*H60),cote:M.sign(G.lat)||1,s:n1(G.s),mur:r==='mur',mortel:r==='mur'&&G.angle>.52&&M.abs(G.vA)*3.6*K.SPD>200,approx:true};
      else v.tenue={tient:true,approx:true};
      const dOff=r==='bord'&&G.k*H60<=1.5&&graceT<=0&&!(LA.portail&&PORTV.att),dDem=!!(dem&&dem.sorties);
      if(dOff||dDem){
        const S={pourquoi:dOff?'bord proche':'demande',bord:null,gauche:null,droite:null,saut:null},plaf=dDem?BUDGET.demande:BUDGET.sol;
        if(dOff)S.bord=sortie(0,TENUE*60,0,true,false,LISTE_BORD,plaf);
        if(dDem){
          S.gauche=sortie(1,TENUE*60,0,true,false,LISTE_COTE,plaf);
          S.droite=sortie(2,TENUE*60,0,true,false,LISTE_COTE,plaf);
          /* LE SAUT (le geste « saut » des doigts : une figure sur la route, puis manche vers soi et NITRO pendant son bond) : 24 images de route
             (une main a profil : le deroule de SON geste, DG.saut), puis le decollage. L'impulsion et la hauteur du bond dependent de la figure et
             de l'instant du dernier appui : celles du DERNIER saut de la course (le jeu les garde, FDC.dv et FDC.lift), ou, avant le premier, le
             plancher du jeu (FDC.imp : le saut monte au moins autant). Une figure deja en cours sur la route : non prevu (voir figRefuse). */
          if(refuse===false){
            if(FR.on)S.saut={issue:'figure',approx:true};
            else{const connu=FDC.n>0,nS=DG&&DG.saut>0?M.min(90,M.round(DG.saut)):24;S.saut=sortie(3,nS,connu?FDC.dv:FDC.imp,false,true,LISTE_DEM,plaf,connu?FDC.lift:FDC.haut);if(S.saut.rayons)S.saut.mesure=connu;}}}
        v.sorties=S;}
    }catch(e){v.tenue=dit(e);v.sorties=null;}
    return v;};
  yeux.manque=MANQUE;yeux.cout=COUT;yeux.budget=BUDGET;
  /* (banc de justesse) le vol rejoue image par image depuis l'etat du moment, commandes tenues : les places prevues [x, y, z, x, y, z…] et l'issue.
     L'outil de mesure les compare aux places que le jeu donne ensuite, image par image. */
  yeux.essai=function(cv,cm,cn,n){
    if(mode!=='fall'||!LA.vol||!LA.route)return null;
    lireJeu();lireVol(E0);copie(E,E0);COUT.pas=0;COUT.sondes=0;COUT.dalles=0;
    const P=[];TRACE=P;try{rayon(E,0,cv,cm,!!cn,n,1e9);}finally{TRACE=null;}
    return {places:P,issue:R.issue,k:R.k,cause:R.cause};};
  return yeux;
})();
window.__MODE=function(){return mode==='drive'?(FR.on?'bond':'sol'):mode==='fall'?'vol':'boom';};`;

function installer(J){ J.ev(YEUX_CODE); return J; }
/* dem : rien | { sorties:true } (les sorties a la demande) | { radar:false } (la vue d'avant, sans rien de neuf) | { doigts:{G,D,H,B,N} } (les delais de la main) */
function voir(J,dem){ return J.g.sandbox.__YEUX(dem); }
function modeDe(J){ return J.g.sandbox.__MODE(); }
/* (2026-11-24, yeux v2) ce que le dernier appel a coute, en comptes ; les noms du jeu qui manquent ; le budget */
function coutDe(J){ return J.g.sandbox.__YEUX.cout; }
function manqueDe(J){ return J.g.sandbox.__YEUX.manque.slice(); }
function budgetDe(J){ return Object.assign({},J.g.sandbox.__YEUX.budget); }
function essai(J,cv,cm,cn,n){ return J.g.sandbox.__YEUX.essai(cv,cm,cn,n); }
module.exports={installer,voir,modeDe,coutDe,manqueDe,budgetDe,essai,YEUX_CODE};
