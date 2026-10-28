/* ---------------- LE VERGLAS (2026-10-15) ----------------
   D'abord des plaques de 80-150 m dans les courbes ; puis (même jour, Sacha : « toute la route doit être verglacée », « enlève la figure
   ICE SKATE ») UNE seule plaque, du départ à l'arrivée, sur les deux faces. Flux aléatoire à PART (graine ^ 0x1CE5).
   · DESSUS (`banqVerglas`, la boucle de conduite, après les flaques) : le volant ne mord plus qu'à BK_VG.grip, la caisse PART SUR LE CÔTÉ
     — vers l'EXTÉRIEUR du virage (lu sur `routeLacet`), et elle flotte un peu dans les droites — jusqu'à BK_VG.der rad/s de cap à pleine
     vitesse : on contre-braque. La carrosserie se met en CRABE et ondule comme un patineur (`BKV.yaw`, appliqué après le power-slide), les
     roues jettent du givre et rayent la glace (traces type 1).
   · La figure ICE SKATE n'existe plus (`bkSkateRaz` reste, inerte, là où on l'appelait).
   · (2026-10-15 soir, Sacha : « la glace ne glisse pas assez, il faut une animation et des particules de glace ») LA VRAIE GLISSE.
     Avant, le verglas ne faisait que rogner le volant : le cap restait la trajectoire, la caisse tournait moins, elle ne GLISSAIT pas
     (le défaut déjà noté au drift de conduite abandonné, plus bas dans la boucle). Désormais `BKV.gl` = l'angle entre le NEZ et la
     TRAJECTOIRE : le pouce tourne le nez (BK_VG.grip, presque plein), la trajectoire le rejoint en BK_VG.tau s (`gl` s'éteint en
     exp(−t/tau), ÷spdMult comme VOL_TAU : la caisse glisse le même nombre de MÈTRES à toute vitesse). Dans un virage, la caisse file
     donc en CRABE vers l'extérieur, le nez dans la courbe — il faut braquer TÔT. Les deux lignes de l'avance (vL, s) lisent
     `psi-slipB-BKV.gl`. L'ANIMATION : le crabe réel, grossi de 80 % à l'image, plus la QUEUE QUI CHASSE (une onde lente qui
     grandit avec la glisse) ; un craquement de glace quand elle décroche, la boucle `banq.glisse` tant qu'elle glisse. LES PARTICULES :
     `fx.eclat` (éclats étirés, jetés du côté où la caisse glisse — la gerbe du carveur), `fx.brume` (le voile de givre qui reste
     derrière), le givre des roues, et une rayure de glace qui s'élargit avec l'angle. `BKV.gk` (0-1) = la glisse ressentie.
   Console : dbgBanq('verglas') (l'état, avec gl et gk), dbgBanq('verglas',{s,v}) pose la caisse au mètre s (à v km/h). */
const BK_VG={grip:.86,der:.21,tau:.38,tau0:.15,glMax:.5,base:6,v:24,tMin:.4,lache:.2,kmhMin:30}; // la piste de glace : elle part un cran plus // (2026-10-15) toute la route gèle : la dérive .30 → .16 (au banc, .62/.20 : le pilote sortait à 455 km/h après 1 km) · (soir) le volant remonte à 92 % : c'est la TRAJECTOIRE qui traîne (tau s, tau0 à l'arrêt), plus le volant qui manque — glMax ≈ 29° de crabe ; au banc, tau .55 : le pilote de mesure (qui vise avec le NEZ) sortait en 3 s à 390 km/h — 0,5 s de glisse = 50 m
const BKV={sur:false,v:null,yaw:0,ph:0,t:0,aura:0,hors:0,k:0,etiq:null,dix:0,eg:0,gl:0,gk:0,ee:0,eb:0,cr:0,crT:0};
const BKV_A=new THREE.Vector3(),BKV_B=new THREE.Vector3(),BKV_C=new THREE.Vector3();
function bkVerglasPose(root,seed){ // (2026-10-15, Sacha : « toute la route doit être verglacée ») UNE plaque, du départ à l'arrivée
  BANQ.verg=[];const vr=mulberry32((seed^0x1CE5)>>>0),ds=L/(NP-1);
  BANQ.verg.push({s0:-1e9,s1:1e9,a:0,b:L,sd:1}); // de bout en bout : la glace est TOUTE la piste
  if(!BANQ.verg.length)return;
  const P=[],N=[],A=[],I=[],COL=[-1,-.75,-.5,-.25,0,.25,.5,.75,1],W=ROAD_HALF+1.2,NC=COL.length;let n=0; // un peu plus large que la piste : sa frange de givre se fond dans le bourrelet
  for(const v of BANQ.verg){const sdg=vr()*10,va=v.a,vb=v.b;
    for(const fy of [1,-1]){const nk=Math.max(2,Math.ceil((vb-va)/3.5));
      for(let k=0;k<=nk;k++){const s9=va+(vb-va)*k/nk,d0=s9-va,d1=vb-s9,tv=d0<d1?Math.min(.5,d0/200):1-Math.min(.5,d1/200);frameAt(s9,F); // (le long : les bouts fondent sur ~30 m, pas sur 15 % de 9 km)
        for(const c of COL){const l=c*W,o=fy>0?.06:-THICK-.06;P.push(F.p.x+F.b.x*l+F.n.x*o,F.p.y+F.b.y*l+F.n.y*o,F.p.z+F.b.z*l+F.n.z*o);N.push(F.n.x*fy,F.n.y*fy,F.n.z*fy);A.push(c,tv,sdg,0);}
        if(k>0){const r0=n+(k-1)*NC,r1=n+k*NC;for(let q=0;q<NC-1;q++){if(fy>0)I.push(r0+q,r1+q,r0+q+1,r0+q+1,r1+q,r1+q+1);else I.push(r0+q,r0+q+1,r1+q,r0+q+1,r1+q+1,r1+q);}}}
      n+=(nk+1)*NC;}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  g.setAttribute('aV',new THREE.Float32BufferAttribute(A,4));g.setIndex(n>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,BANQ.mats.vg);m.name='banquise verglas';m.matrixAutoUpdate=false;m.userData.jeter=true;m.renderOrder=1;m.frustumCulled=false;root.add(m);BANQ.n.verglas=BANQ.verg.length;}
function banqVerglas(dt){ // la boucle de conduite, chaque image, après les flaques
  let v=null;
  if(mode==='drive'&&BANQ.verg&&BANQ.verg.length&&banqOk()&&hopY<=.05&&!introD&&Math.abs(lat)<ROAD_HALF)for(const o of BANQ.verg)if(s>o.s0&&s<o.s1){v=o;break;} // (toute la route : une plaque sans bornes)
  BKV.sur=!!v;BKV.v=v;
  const kmh=Math.abs(vA)*3.6*SPD,kv=Math.min(1,kmh/Math.max(60,vmaxShow()));
  let tg=0;
  if(v){
    // LA TRAJECTOIRE REJOINT LE NEZ (le pouce a tourné le nez au lacet de la boucle : `BKV.gl` y grandit) — en tau s, ÷spdMult comme VOL_TAU
    const tau=BK_VG.tau0+(BK_VG.tau-BK_VG.tau0)*kv;
    BKV.gl*=Math.exp(-dt*vitMult()/tau);
    BKV.gk+=(THREE.MathUtils.clamp(Math.abs(BKV.gl)/.2,0,1)*Math.min(1,kmh/120)-BKV.gk)*Math.min(1,dt*8);
    BKV.ph+=dt*(2.6+2.2*kv);
    const dr=THREE.MathUtils.clamp(-routeLacet*2.5,-1,1),sd=THREE.MathUtils.clamp(dr*.85+Math.sin(BKV.ph*.23)*.30,-1,1); // (toute la route) elle part vers l'EXTÉRIEUR du virage, et flotte un peu dans les droites
    psi=THREE.MathUtils.clamp(psi+sd*BK_VG.der*kv*dt,-1.1,1.1);                                                 // ELLE PART SUR LE CÔTÉ
    tg=THREE.MathUtils.clamp(BKV.gl*.8,-.28,.28)+Math.sin(BKV.ph)*(.05+.15*BKV.gk)*kv+sd*.10*kv;                                                  // L'ANIMATION : le crabe réel grossi de 80 % à l'image, +16° au plus (la physique reste jouable, l'image glisse) + la QUEUE QUI CHASSE (elle grandit avec la glisse) + le flottement
    if(Math.abs(dr)>.35)driftT=Math.max(driftT,.25);                                                             // la gomme ne chante que dans les virages
    // ELLE DÉCROCHE : un craquement de glace, un petit coup dans la main (une fois par glissade)
    BKV.crT=Math.max(0,BKV.crT-dt);
    if(BKV.gk>.55&&!BKV.cr&&BKV.crT<=0){BKV.cr=1;BKV.crT=1.4;try{if(SONV2&&window.CCSON&&window.CCSON.existe('banq.craque'))sfx('banq.craque',{vol:-15+5*kv});}catch(e){}hap(8);}
    else if(BKV.gk<.25)BKV.cr=0;
    // LES PARTICULES : des ÉCLATS jetés du côté où la caisse glisse (la gerbe du carveur), un VOILE de givre qui reste derrière
    const fx=BANQ.fx,cg=carGroup;
    if(fx.eclat&&kmh>20&&cg.visible){
      const vc=PT_U.uVc.value,q=cg.quaternion,gk=BKV.gk,w=CARS[level].w*.46,l=CARS[level].l*.38;
      BKV_A.set(0,0,1).applyQuaternion(q);BKV_C.set(0,1,0).applyQuaternion(q);                                // le nez · le haut de la caisse
      BKV_B.copy(vc).addScaledVector(BKV_A,-vc.dot(BKV_A));BKV_B.addScaledVector(BKV_C,-BKV_B.dot(BKV_C));     // la vitesse de CÔTÉ : la glisse
      const vl=BKV_B.length();if(vl>.5)BKV_B.multiplyScalar(1/vl);else BKV_B.set(0,0,0);
      BKV_C.set(1,0,0).applyQuaternion(q);const sgL=BKV_B.dot(BKV_C)>=0?1:-1;BKV_C.set(0,1,0).applyQuaternion(q); // le flanc qui MÈNE la glisse jette le plus
      BKV.ee+=dt*(14+26*kv+330*gk);
      while(BKV.ee>=1){BKV.ee-=1;const sg=Math.random()<.5+.35*gk?sgL:-sgL,av=Math.random()<.3*gk;
        DRIFT_V.set(sg*w,.1,av?l*.95:-l);cg.localToWorld(DRIFT_V);
        const k=.62+.2*Math.random(),la=(2+10*Math.random())*(.25+gk),up=2.5+6*Math.random()*(.5+gk),bk=2+5*Math.random(); // (haut : sur la glace blanche, on les voit surtout contre la montagne et le ciel)
        spawnP(fx.eclat,DRIFT_V.x,DRIFT_V.y,DRIFT_V.z,vc.x*k+BKV_B.x*la+BKV_C.x*up-BKV_A.x*bk+(Math.random()-.5)*2,vc.y*k+BKV_B.y*la+BKV_C.y*up-BKV_A.y*bk,vc.z*k+BKV_B.z*la+BKV_C.z*up-BKV_A.z*bk+(Math.random()-.5)*2,.3+Math.random()*.45);}
      BKV.eb+=dt*(2+42*gk)*Math.max(.3,kv);
      while(BKV.eb>=1){BKV.eb-=1;const sg=Math.random()<.5?-1:1;DRIFT_V.set(sg*w,.25,-l);cg.localToWorld(DRIFT_V);
        const k=.55+.2*Math.random(),la=(2+4*Math.random())*gk,up=.8+1.6*Math.random();
        spawnP(fx.brume,DRIFT_V.x,DRIFT_V.y,DRIFT_V.z,vc.x*k+BKV_B.x*la+BKV_C.x*up,vc.y*k+BKV_B.y*la+BKV_C.y*up,vc.z*k+BKV_B.z*la+BKV_C.z*up,.7+Math.random()*.6);}}
    // la RAYURE des patins sur la glace (face du dessus) : elle s'élargit et se creuse avec l'angle de glisse
    if(side>0){const i=Math.max(0,Math.min(NP-1,Math.round(s/Math.max(1,L)*(NP-1)))),t=T[i],hl=Math.hypot(t.x,t.z)||1,cp=carGroup.position;bkTrace(cp.x,cp.z,t.x/hl,t.z/hl,1,.5+.5*BKV.gk,1.3+1.9*BKV.gk,cp.y);}}
  else{BKV.gl*=Math.exp(-dt*10);BKV.gk*=Math.exp(-dt*8);BKV.cr=0;}
  BKV.yaw+=(tg-BKV.yaw)*Math.min(1,dt*(v?4.5:3));if(!v&&Math.abs(BKV.yaw)<.002)BKV.yaw=0;}
function bkSkateRaz(){BKV.t=0;BKV.hors=0;BKV.aura=0;BKV.dix=0;} // (2026-10-15, Sacha : « enlève la figure ICE SKATE ») la figure est partie ; ses remises à zéro restent, inertes
/* ---------------- LA CONGÈRE : LA NEIGE PROFONDE DU BORD (2026-10-18) ----------------
   (Sacha : « quand on touche le bord on y reste collé » puis « quand on touche le bord on doit pas mourir : on s'enfonce dans la neige, ce qui
   ralentit beaucoup, mais ça tue pas ».) Le bord de la piste était le MUR des couloirs du canyon (murCote : coup d'épaule, mort au-delà de 30°
   et 200 km/h) ; et sur la glace la caisse part vers l'extérieur des virages (banqVerglas) : elle y revenait à chaque image, collée au mur.
   Désormais, au-delà de la glace, une bande de NEIGE PROFONDE de `BK_CG.w` m de chaque côté — un ruban posé sur le repère de la piste
   (`bkCongerePose`), car la grille de neige, en cases de 34-40 m, ne savait pas dessiner un bord net (et passait par endroits AU-DESSUS de la
   glace). La caisse y ENTRE (gerbe, plouf), s'y ENFONCE (`BKB.enf`, jusqu'à `BK_CG.prof` m), y FREINE fort (vers `BK_CG.vMin` × la vmax, d'autant
   plus qu'on est loin dans la neige ; la nitro laboure mieux), la neige la remet dans l'axe et la REPOUSSE doucement vers la glace ; le volant y
   mord entier (pas de verglas dans la neige). Jamais de mort, jamais de mur : au bout de la bande, le bourrelet arrête la caisse (lat bornée).
   En vol, la congère prolonge la piste (tryLand s'y pose) et la grille de neige ne joue plus au-dessus de la piste (banqSolVol). */
/* (2026-10-20, Sacha : « quand tu rentres dans la neige, on rentre pas vraiment dedans ») la congère était un ruban de 45 cm au plus avec 38 cm
   d'enfoncement : on la survolait. Désormais un VRAI banc : 1,3 m à la limite (BK_CG_Y), la caisse s'y enfonce de .95 m, freine plus fort, et la
   gerbe est jetée plus haut. `?sans=glaceneige` = l'ancien profil. */
const BK_NEIGE=!/[?&]sans=([^&]*,)?glaceneige(,|&|$)/.test(location.search);
const BK_CG={w:16,prof:BK_NEIGE?.95:.38,fr0:BK_NEIGE?1.1:.7,fr1:BK_NEIGE?3.4:2.4,vMin:BK_NEIGE?.26:.32,pousse:6,redresse:2.2,fx:1},BKB={k:0,enf:0,em:0,dans:false}; // fx : la gerbe (banc : dbgBanq('cg',{fx:0}))
const BK_CG_X=[-1.5,.4,3,9,16,22,30,36],BK_CG_Y=BK_NEIGE?[-.5,.2,.5,.85,1.3,2.2,3.4,-1.5]:[-.5,.14,.22,.28,.45,1.4,3.0,-1.5]; // (au banc : .75 m d'enfoncement + .45 de neige, on ne voyait plus la caisse — désormais les roues et le bas de caisse) // le profil : x m au-delà du bord de la glace → hauteur de la neige au-dessus du plan de la piste (le bout plonge sous la grille)
function bkCgH(x){const X=BK_CG_X,Y=BK_CG_Y;if(x<=X[0])return Y[0];for(let i=1;i<X.length;i++)if(x<=X[i])return Y[i-1]+(Y[i]-Y[i-1])*(x-X[i-1])/(X[i]-X[i-1]);return Y[Y.length-1];}
function bkCgBord(){return banqOk()?BK_CG.w:0;} // la largeur de neige où l'on peut rouler (et se poser) au-delà de la glace
function bkCongerePose(root){ // les deux rubans de neige du bord, du départ à l'arrivée (même pas de 4 m que le verglas)
  const P=[],A=[],I=[],X=BK_CG_X,NC=X.length,nk=Math.max(2,Math.ceil(L/4));let n=0;
  for(const sd of [1,-1]){
    for(let k=0;k<=nk;k++){frameAt(L*k/nk,F);
      for(let q=0;q<NC;q++){const l=sd*(ROAD_HALF+X[q]),h=BK_CG_Y[q];P.push(F.p.x+F.b.x*l+F.n.x*h,F.p.y+F.b.y*l+F.n.y*h,F.p.z+F.b.z*l+F.n.z*h);A.push(ROAD_HALF+X[q],0);}
      if(k>0){const r0=n+(k-1)*NC,r1=n+k*NC;for(let q=0;q<NC-1;q++){if(sd>0)I.push(r0+q,r1+q,r0+q+1,r0+q+1,r1+q,r1+q+1);else I.push(r0+q,r0+q+1,r1+q,r0+q+1,r1+q+1,r1+q);}}}
    n+=(nk+1)*NC;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,2));
  g.setIndex(n>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1));g.computeVertexNormals();
  {const Nm=g.attributes.normal.array;for(let i=0;i<Nm.length;i+=3){Nm[i+1]+=.6;const l=Math.hypot(Nm[i],Nm[i+1],Nm[i+2])||1;Nm[i]/=l;Nm[i+1]/=l;Nm[i+2]/=l;}} // (au banc : à 45°, parallèle à la glace, elle restait dans l'ombre bleue — presque la couleur de la glace) la neige du bord regarde un peu le ciel : plus claire, on la distingue
  g.computeBoundingSphere();
  const m=new THREE.Mesh(g,BANQ.mats.sol);m.name='glacier congere';m.matrixAutoUpdate=false;m.userData.jeter=true;m.frustumCulled=false;root.add(m);BANQ.n.congere=I.length/3;}
/* LE TREMPLIN DE GLACE (2026-10-18, Sacha : « les tremplins doivent être plus beaux, gros et visibles ») — le « bec » d'avant était un coin de 8 m
   sur 1,1 m, blanc sur glace blanche : on ne le voyait pas venir. Désormais une RAMPE de BK_BEC.lg m qui monte en courbe (u^1,7 : ~18° à la
   lèvre) jusqu'à BK_BEC.h m, en glace blanche à CHEVRONS ORANGE qui montent vers la lèvre, une LÈVRE blanche qui brille, des flancs bleu
   nuit, et deux BALISES orange de BK_BEC.poteau m aux coins de la lèvre (lisibles de loin, sur toutes les météos : matière sans lumière).
   (1er essai au banc : 26 × 4,5 m, chevrons blancs sur bleu clair — invisible à 100 m sur une piste de 196 m.)
   La caisse MONTE la rampe (hopY suit la courbe) et décolle à la lèvre, poussée de BK_BEC.pop × sa vitesse (,2 avant ; ,26 puis ,22 essayés : 3-6 s de vol à 45°, 450 m parcourus — la piste tournait dessous). */
const BK_BEC={lg:36,h:7,pop:.18,poteau:15,axe:.65,droit:260,retombe:500}; /* droit : la piste presque droite (< 31° de cap) qu'il faut devant la lèvre ; axe : la part de la vitesse de travers que la rampe redresse au décollage ; retombe : la piste LIBRE après la lèvre, sur toute sa largeur (voir BK_RETOMBE) */
let BK_BEC_TEX=null; // (2026-10-19) sur SA ligne : collée derrière le « // » de la ligne du dessus, elle était avalée (piège n° 1) — « BK_BEC_TEX is not defined » à chaque glacier : ni tremplins, ni pics, ni fin du décor, ni météo
/* LA RETOMBÉE DES TREMPLINS (2026-10-19, même demande) : libreK ne dégageait que 260 m après la lèvre, et dans la seule bande du tremplin.
   MESURÉ en course (29 vols, 255 à 414 km/h au décollage) : la caisse se pose de 160 à 511 m plus loin, et le pilote de vol la ramène vers
   l'axe, hors de la bande ; 2 morts sur 10 courses « aux tremplins » : posée à 516 km/h au pied d'un pic de FOURCHE (380 m après la lèvre),
   ou à 32 m d'un pic. Désormais aucun pic sur TOUTE la largeur pendant BK_BEC.retombe m après la lèvre (vols mesurés avec banqLacet : 84 à
   705 m, 450 m au plus jusqu'à 500 km/h), et la figure qui suit un tremplin attend la fin de sa retombée. `?sans=glaceretombe` = avant
   (même graine, même piste). */
const BK_RETOMBE=!/[?&]sans=([^&]*,)?glaceretombe(,|&|$)/.test(location.search);
/* (2026-10-20, Sacha : « exactement la même texture que le verglas, une aspérité de la route, pas un élément greffé dessus ») LE TREMPLIN EST LA ROUTE
   QUI SE SOULÈVE : la même matière que le verglas (BANQ.mats.vg, texture en coordonnées monde : les fêlures et le ciel reflété passent de la route
   à la bosse sans couture), aucun flanc, aucune balise, aucun cristal. La surface monte dans la courbe de hopY (la rampe) et se fond dans la route
   sur les côtés ; la lèvre retombe d'un coup au niveau de la route. Les normales sont calculées : la bosse prend la lumière et le reflet du ciel. */
function bkBecMesh(root,KK){
  const P=[],A=[],I=[];let n=0;
  const V=(s9,la,h,c,sd9)=>{frameAt(s9,F);P.push(F.p.x+F.b.x*la+F.n.x*h,F.p.y+F.b.y*la+F.n.y*h,F.p.z+F.b.z*la+F.n.z*h);A.push(c,.5,sd9,0);return n++;};
  const ss=x=>x*x*(3-2*x);
  for(const k of KK){const NR=22,NL=16,s0=k.s-k.lg,H=k.h,w=k.l1-k.l0,hR=u=>H*Math.pow(u,1.7)+.06,sd=k.s*.013,sg=(k.s*.0071)%10,fl=3.2; /* fl : la largeur sur laquelle la bosse se fond dans la route, de chaque côté */
    const prof=t=>{const la=k.l0-fl+(w+2*fl)*t,o=la<k.l0?(k.l0-la)/fl:la>k.l1?(la-k.l1)/fl:0;return{la:la,f:1-ss(Math.min(1,o))};}; /* f : 1 sur la piste du tremplin, 0 à la route */
    let b0=n;for(let r=0;r<=NR;r++){const u=r/NR,s9=s0+k.lg*u;for(let a=0;a<=NL;a++){const q=prof(a/NL);V(s9,q.la,.06+(hR(u)-.06)*q.f,0,sg);}} /* la bosse */
    for(let r=0;r<NR;r++)for(let a=0;a<NL;a++){const q=b0+r*(NL+1)+a;I.push(q,q+NL+1,q+1,q+1,q+NL+1,q+NL+2);}
    b0=n;for(const dh of [0,1])for(let a=0;a<=NL;a++){const q=prof(a/NL);V(k.s+.04*dh,q.la,dh?.06:.06+(hR(1)-.06)*q.f,0,sg);} /* la lèvre : la paroi qui retombe sur la route */
    for(let a=0;a<NL;a++){const q=b0+a;I.push(q,q+1,q+NL+1,q+1,q+NL+2,q+NL+1);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aV',new THREE.Float32BufferAttribute(A,4));
  g.setIndex(n>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1));g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.Mesh(g,BANQ.mats.vg);m.name='glacier becs';m.matrixAutoUpdate=false;m.userData.jeter=true;m.renderOrder=1;m.frustumCulled=false;root.add(m);}
function bkCgEntre(kmh){ // l'entrée dans la neige : le plouf, la gerbe, un coup dans la main
  const k=Math.min(1,kmh/300);shake=Math.max(shake,(BK_NEIGE?.4:.22)+.3*k);fovPunch=Math.max(fovPunch,3+5*k);hap(k>.5?[14,22]:[10]);
  try{if(SONV2){if(!(window.CCSON&&window.CCSON.existe('banq.plouf')&&sfx('banq.plouf',{vol:-8+6*k})))sfx('nuage.entre',{vol:-4+4*k});}else noiseBurst(.35,.08+.08*k,700);}catch(e){}
  const fx=BANQ.fx;if(fx&&fx.poudre&&BK_CG.fx>0){const p=carGroup.position,vc=PT_U.uVc.value;for(let i=0;i<10+18*k;i++){const a=Math.random()*6.2832,r=Math.random();
    spawnP(fx.poudre,p.x+(Math.random()-.5)*3,p.y+.3,p.z+(Math.random()-.5)*3,vc.x*.7+Math.cos(a)*(3+r*9),vc.y*.7+5+Math.random()*12*(.5+k),vc.z*.7+Math.sin(a)*(3+r*9),.6+Math.random()*.8);}}}
function bkCongere(dt){ // la boucle de conduite (glacier v4), chaque image, à la place du mur du bord
  const x=Math.abs(lat)-ROAD_HALF,out=Math.sign(lat)||1,W=BK_CG.w;let k=0;
  if(mode==='drive'&&side>0&&x>-.6){                                                           // (le flanc de la caisse touche la neige 60 cm avant son centre)
    if(x>W)lat=out*(ROAD_HALF+W);                                                              // le bourrelet : on ne va pas plus loin (ni mur qui tue, ni chute)
    k=THREE.MathUtils.smoothstep(x,-.6,W*.55);
    const kmh=Math.abs(vA)*3.6*SPD,vmin=Math.max(80,vmaxShow()*BK_CG.vMin)/(3.6*SPD);
    if(Math.abs(vA)>vmin)vA=Math.sign(vA)*(vmin+(Math.abs(vA)-vmin)*Math.exp(-dt*(BK_CG.fr0+BK_CG.fr1*k)*(nitroOn?.55:1))); // la neige FREINE
    lat-=out*BK_CG.pousse*k*dt;                                                                 // le bourrelet REPOUSSE vers la glace
    if(psi*driveDir*out>0)psi*=Math.exp(-dt*BK_CG.redresse*k);                                  // et remet la caisse dans l'axe : elle ne file plus vers l'extérieur
    if(!BKB.dans&&k>.08){BKB.dans=true;bkCgEntre(kmh);}
    if(BK_NEIGE&&kmh>60)shake=Math.max(shake,.14*k*Math.min(1,kmh/250)); /* la neige profonde secoue la caisse tant qu'on y laboure */
    const fx=BANQ.fx;
    if(fx&&fx.poudre&&kmh>15&&carGroup.visible){const vc=PT_U.uVc.value,w=CARS[level].w*.5,l=CARS[level].l*.4; // LA POUDRE : deux rideaux jetés par les roues, plus hauts loin dans la neige
      BKB.em+=dt*(6+22*k)*Math.min(1,kmh/150)*BK_CG.fx;
      BKV_A.set(1,0,0).applyQuaternion(carGroup.quaternion);const sO=BKV_A.dot(F.b)*out>=0?1:-1; // le flanc de la caisse côté neige
      while(BKB.em>=1){BKB.em-=1;const sg=sO;DRIFT_V.set(sg*w,.15,-l*(.2+.5*Math.random()));carGroup.localToWorld(DRIFT_V);const ou=out*(8+Math.random()*10)*(.6+.4*k),k1=.82+.14*Math.random();
        spawnP(fx.poudre,DRIFT_V.x,DRIFT_V.y,DRIFT_V.z,vc.x*k1+F.b.x*ou,vc.y*k1+2.5+Math.random()*(4+7*k),vc.z*k1+F.b.z*ou,.35+Math.random()*.45);}} // (elle file AVEC la caisse, jetée vers l'extérieur : à ,35 de la vitesse, la caméra la traversait — un mur blanc)
    if(side>0){const i=Math.max(0,Math.min(NP-1,Math.round(s/Math.max(1,L)*(NP-1)))),t=T[i],hl=Math.hypot(t.x,t.z)||1,cp=carGroup.position; // LA TRACE dans la poudre
      bkTrace(cp.x,cp.z,t.x/hl,t.z/hl,0,Math.min(1,.35+k),1.7+.7*k,F.p.y+F.b.y*lat+F.n.y*bkCgH(Math.max(0,x)));}}
  else if(BKB.dans&&x<-.9)BKB.dans=false;
  BKB.k=k;BKB.enf+=(BK_CG.prof*k-BKB.enf)*Math.min(1,dt*7);if(BKB.enf<.003)BKB.enf=0;}
/* ---------------- LES TRACES : un anneau de quads (4 sommets chacun : aucun pont entre deux traces) ---------------- */
const BK_TR={N:1100,i:0,mesh:null,pos:null,at:null,on:false,lx:0,lz:0,lpx:0,lpz:0,lw:1,ty:0,lo:1e9,hi:-1};
function bkTraceMesh(){if(BK_TR.mesh)return BK_TR.mesh;const N=PAL_BK('banqTrace',1100);BK_TR.N=N;
  const pos=new Float32Array(N*12),at=new Float32Array(N*16),I=new Uint16Array(N*6);
  for(let k=0;k<N;k++){const b=k*4;I.set([b,b+2,b+1,b+1,b+2,b+3],k*6);at[k*16+1]=at[k*16+5]=at[k*16+9]=at[k*16+13]=-1e9;}
  const g=new THREE.BufferGeometry(),pa=new THREE.BufferAttribute(pos,3),aa=new THREE.BufferAttribute(at,4);pa.setUsage(THREE.DynamicDrawUsage);aa.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('position',pa);g.setAttribute('aT',aa);g.setIndex(new THREE.BufferAttribute(I,1));
  const m=new THREE.Mesh(g,banqMats().tr);m.name='banquise traces';m.frustumCulled=false;m.matrixAutoUpdate=false;m.renderOrder=2;m.visible=false;scene.add(m);
  BK_TR.mesh=m;BK_TR.pos=pos;BK_TR.at=at;return m;}
function bkTraceVide(){if(!BK_TR.mesh)return;const A=BK_TR.at;for(let k=0;k<BK_TR.N*4;k++)A[k*4+1]=-1e9;const aa=BK_TR.mesh.geometry.attributes.aT;aa.updateRange.offset=0;aa.updateRange.count=-1;aa.needsUpdate=true;BK_TR.on=false;}
function bkTraceCoupe(){BK_TR.on=false;}
function bkSurfY(x,z){const S=banqSurf(x,z);return S.ok?S.h:-1e9;}
// un pas de trace : du dernier point à (x, z), dans la direction (hx, hz), de demi-largeur w — ty 0 poudreuse · 1 glace ; pr = la profondeur (0-1)
function bkTrace(x,z,hx,hz,ty,pr,w,yo){ // yo : une hauteur imposée (les rayures sur le VERGLAS de la route) — sinon, la neige ou la glace sous le point
  const px=-hz,pz=hx;
  if(!BK_TR.on||BK_TR.ty!==ty||(yo==null)!==(BK_TR.ly==null)){BK_TR.on=true;BK_TR.ty=ty;BK_TR.lx=x;BK_TR.lz=z;BK_TR.lpx=px;BK_TR.lpz=pz;BK_TR.lw=w;BK_TR.ly=yo==null?null:yo;return;}
  const dl=Math.hypot(x-BK_TR.lx,z-BK_TR.lz);if(dl<1.4)return;
  if(dl>16){BK_TR.lx=x;BK_TR.lz=z;BK_TR.lpx=px;BK_TR.lpz=pz;BK_TR.lw=w;BK_TR.ly=yo==null?null:yo;return;}
  const k=BK_TR.i;BK_TR.i=(k+1)%BK_TR.N;const P=BK_TR.pos,A=BK_TR.at,t=BK_U.uTime.value,b=k*4,w0=BK_TR.lw,y0=BK_TR.ly;
  const put=(v,x9,z9,u,yy)=>{let y=yy!=null?yy-.04:bkSurfY(x9,z9);if(y<-1e8)y=bkSurfY(x,z);P[v*3]=x9;P[v*3+1]=y+.10;P[v*3+2]=z9;A[v*4]=u;A[v*4+1]=t;A[v*4+2]=pr;A[v*4+3]=ty;};
  put(b,BK_TR.lx-BK_TR.lpx*w0,BK_TR.lz-BK_TR.lpz*w0,-1,y0);put(b+1,BK_TR.lx+BK_TR.lpx*w0,BK_TR.lz+BK_TR.lpz*w0,1,y0);
  put(b+2,x-px*w,z-pz*w,-1,yo);put(b+3,x+px*w,z+pz*w,1,yo);BK_TR.ly=yo==null?null:yo;
  BK_TR.lo=Math.min(BK_TR.lo,b);BK_TR.hi=Math.max(BK_TR.hi,b+4);
  BK_TR.lx=x;BK_TR.lz=z;BK_TR.lpx=px;BK_TR.lpz=pz;BK_TR.lw=w;}
function bkTraceEnvoi(){if(BK_TR.hi<0)return;const g=BK_TR.mesh.geometry,pa=g.attributes.position,aa=g.attributes.aT,lo=BK_TR.lo,n=BK_TR.hi-lo;
  pa.updateRange.offset=lo*3;pa.updateRange.count=n*3;pa.needsUpdate=true;aa.updateRange.offset=lo*4;aa.updateRange.count=n*4;aa.needsUpdate=true;BK_TR.lo=1e9;BK_TR.hi=-1;}
/* ---------------- LES GERBES ---------------- */
// la POUDRE : une explosion de neige (entrée, mort) — n grains, l'élan hv, k la force
function banqGerbe(p,n,hv,k){const fx=BANQ.fx;if(!fx.poudre)return;const y=bkSurfY(p.x,p.z)+.4,h=Math.hypot(fallVel.x,fallVel.z)||1,dx=fallVel.x/h,dz=fallVel.z/h,v9=hv*SPD;
  for(let i=0;i<n;i++){const a=Math.random()*6.2832,r=Math.random();spawnP(fx.poudre,p.x+(Math.random()-.5)*3,y,p.z+(Math.random()-.5)*3,
    Math.cos(a)*(4+r*12)*k+dx*v9*.35*Math.random(),(6+Math.random()*16)*k,Math.sin(a)*(4+r*12)*k+dz*v9*.35*Math.random(),.9+Math.random()*1.2);}}
// le GIVRE : des éclats de glace qui jaillissent (le contact, la glisse)
function banqGivre(p,n,v9){const fx=BANQ.fx;if(!fx.givre)return;
  for(let i=0;i<n;i++){const a=Math.random()*6.2832;spawnP(fx.givre,p.x+(Math.random()-.5)*2.4,p.y+.2,p.z+(Math.random()-.5)*2.4,Math.cos(a)*(3+Math.random()*9)+fallVel.x*SPD*.3,3+Math.random()*7,Math.sin(a)*(3+Math.random()*9)+fallVel.z*SPD*.3,.35+Math.random()*.5);}}
/* ---------------- LES EFFETS QUI VIVENT AUTOUR DE LA CAISSE (bâtis une fois, cachés hors de la banquise) ---------------- */
function banqFx(){const fx=BANQ.fx;if(fx.flo)return fx;const M=banqMats(),R=mulberry32(0xB10C);
  const pts9=(n,mat,nom)=>{const g=new THREE.BufferGeometry(),aR=new Float32Array(n*4);for(let k=0;k<n*4;k++)aR[k]=R();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('aR',new THREE.BufferAttribute(aR,4));
    const o=new THREE.Points(g,mat);o.name=nom;o.frustumCulled=false;o.matrixAutoUpdate=false;o.visible=false;o.renderOrder=8;scene.add(o);return o;};
  fx.flo=pts9(PAL_BK('banqFlo',2400),M.flo,'banquise neige qui tombe');
  fx.dd=pts9(PAL_BK('banqDD',500),M.dd,'banquise poussière de diamant');
  { // LES AURORES : quatre rideaux, à 5,8-6,8 km, de 10° à 35° au-dessus de l'horizon
    const P=[],U=[],I=[],NS=150,RI=[[-1.55,1.1,6300,1150],[-.55,1.3,6800,1450],[.55,1.15,6000,1000],[1.55,1.2,6500,1300]];let n=0;
    for(let c=0;c<RI.length;c++){const r=RI[c];for(let i=0;i<=NS;i++){const u=i/NS,a=r[0]+u*r[1],rr=r[2]*(1+.07*Math.sin(u*8.+c*1.3)),x=Math.sin(a)*rr,z=Math.cos(a)*rr,y0=r[3]+280*Math.sin(u*5.3+c*2.),h=2500+600*Math.sin(u*3.7+c);
      P.push(x,y0,z,x,y0+h,z);U.push(u,0,c*1.7,u,1,c*1.7);if(i>0){const b=n-2;I.push(b,b+2,b+1,b+1,b+2,b+3);}n+=2;}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aU',new THREE.Float32BufferAttribute(U,3));g.setIndex(I);
    fx.aur=new THREE.Mesh(g,M.aur);fx.aur.name='banquise aurores';fx.aur.frustumCulled=false;fx.aur.renderOrder=-1;fx.aur.visible=false;scene.add(fx.aur);}
  fx.poudre=makePool(PAL_BK('banqPoudre',520),2.3,0xf4f8ff,.78,true,{a:[.06,.6,.75,1.35],pr:[2,6,26,0]});fx.poudre.drag=1.6;fx.poudre.acc=12;fx.poudre.mesh.name='banquise poudre';
  fx.givre=makePool(240,1.1,0xe4fbff,1,true,{a:[.02,.3,.6,1],pr:[2,6,26,0]});fx.givre.drag=2.4;fx.givre.acc=9;fx.givre.mesh.name='banquise givre';
  // (2026-10-15 soir) LA GLISSE SUR LE VERGLAS : des éclats ÉTIRÉS (le trait suit leur vitesse, voir ptShader) et un voile de givre qui gonfle en s'effaçant
  fx.eclat=makePool(PAL_BK('banqEclat',700),.8,0x8fe4ff,1,true,{a:[.02,.35,1,.35],pr:[1.2,3.5,30,90],etire:true,str:.05,v:.6}); /* cyan glacier : blanc sur la glace blanche, on ne les voyait pas — (2026-10-15 soir) ce commentaire en // avalait la suite (drag, acc, nom) : rendu */fx.eclat.drag=1.4;fx.eclat.acc=14;fx.eclat.mesh.name='banquise eclats';
  fx.brume=makePool(PAL_BK('banqBrume',220),3.4,0xe2f2ff,.5,true,{a:[.10,.75,.45,1.7],pr:[2.5,7,120,0]}); /* (plafond 120 px : à 46, le voile n'était qu'un point blanc sur la glace blanche) — (2026-10-18, DEBUGGING : ce commentaire en // avalait la suite : le voile de givre filait avec la caisse, sans frein) */fx.brume.drag=2.4;fx.brume.mesh.name='banquise brume';
  fx.eclat.mesh.renderOrder=fx.brume.mesh.renderOrder=9; // ⚠ APRÈS la plaque de verglas (renderOrder 1, transparente) et les traces (2) : dessinées avant, elles étaient repeintes par la glace — invisibles au banc
  bkTraceMesh();bkCretes(fx); /* (2026-10-21, LE GLACIER EMBELLI) les crêtes lointaines et leurs panaches : voir glacier-embelli.js */
  return fx;}
function banqFxCache(){if(BKV.t>0)bkSkateRaz();BKV.sur=false;BKV.yaw=0;BKV.gl=0;BKV.gk=0;const fx=BANQ.fx;if(!fx.flo||!fx.on)return;fx.on=false;fx.flo.visible=fx.dd.visible=fx.aur.visible=false;bkCretesCache(fx);if(BK_TR.mesh)BK_TR.mesh.visible=false;
  try{updatePool(fx.poudre,10,0);updatePool(fx.givre,10,0);updatePool(fx.eclat,10,0);updatePool(fx.brume,10,0);}catch(e){}
  for(const k in BANQ.boucles)if(BANQ.boucles[k]&&BANQ.boucles[k].stop){try{BANQ.boucles[k].stop(.5);}catch(e){}BANQ.boucles[k]=null;}
  BANQ.sur=0;BANQ.glisse=false;BANQ.pou=false;}
/* ---------------- LES MÉTÉOS : la banquise glisse d'un temps à l'autre au même fondu que le ciel ---------------- */
function banqMeteo(m,dur){const T9=BK_MET[m]||BK_MET.midi;BANQ.met=BK_MET[m]?m:'midi';
  if(!BANQ.cur)BANQ.cur=JSON.parse(JSON.stringify(T9));
  BANQ.de=JSON.parse(JSON.stringify(BANQ.cur));BANQ.to=T9;BANQ.k=0;BANQ.dur=Math.max(.01,dur||1.2);}
function banqPas(dt){if(!BANQ.cur||BANQ.k>=1)return;BANQ.k=Math.min(1,BANQ.k+dt/BANQ.dur);const e=BANQ.k*BANQ.k*(3-2*BANQ.k),a=BANQ.de,b=BANQ.to,o=BANQ.cur;
  for(const k in b){const v=b[k];if(typeof v==='number')o[k]=a[k]+(v-a[k])*e;else if(Array.isArray(v))for(let i=0;i<v.length;i++)o[k][i]=a[k][i]+(v[i]-a[k][i])*e;else o[k]=v;}}
/* ---------------- LA BOUCLE DE LA BANQUISE (chaque image, après la caméra, juste avant le rendu) ---------------- */
function banqTick(dt){
  const on=!!BANQ.root&&!!LVL.cur&&LVL.cur.id==='banquise'&&!PARK.on;
  if(!on){banqFxCache();return;}
  const fx=banqFx(),U=BK_U,c=BANQ.cur||(banqMeteo(BANQ.met,.01),BANQ.cur);fx.on=true;
  const vit=!paused;banqPas(dt);if(vit)U.uTime.value+=dt;
  if(BANQ.file.length)bkTranches(paused||!started?8:(ALLEGE?3:6)); // LA SUITE DE LA CONSTRUCTION : ~3 ms par image, du plus proche au plus loin
  // LA LUMIÈRE : l'azimut du soleil du ciel, la hauteur de la météo ; la nuit, la LUNE
  {const a=Math.atan2(SUN_DIR.x,SUN_DIR.z),el=c.el*Math.PI/180;BK_V.set(Math.sin(a)*Math.cos(el),Math.sin(el),Math.cos(a)*Math.cos(el));
   U.uSunDir.value.copy(BK_V).lerp(BK_V2.copy(BK_LUNE).setY(Math.max(.45,BK_LUNE.y)).normalize(),c.lune).normalize();}
  U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity);U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity);
  U.uFillC.value.copy(fill.color).multiplyScalar(fill.intensity);U.uFillD.value.copy(fill.position).normalize().negate();
  U.uCam.value.copy(camera.position);
  {const cg=carGroup;U.uCarP.value.copy(cg.position);U.uCarF.value.set(0,0,1).applyQuaternion(cg.quaternion);}
  U.uPhare.value=c.phare*(mode==='boom'||!carGroup.visible?0:1);U.uFlash.value=(LVL.cur&&LVL.cur.orage)?(CAMP_FLASH||0):0;
  U.uSpark.value=c.spark;U.uAlp.value=c.alp;U.uAlpC.value.setRGB(c.alpC[0],c.alpC[1],c.alpC[2]);U.uAur.value=c.aur;U.uIceT.value.set(c.ice[0],c.ice[1],c.ice[2]);
  U.uMistK.value=c.mist;
  {const Z=BANQ.dz; /* (2026-10-20, LE DÉCOR AU HASARD) la glace, les aurores, la brume, l'alpenglow de CETTE piste (sans tirage : les valeurs d'avant) */
   if(Z){U.uIceT.value.x*=Z.glace[0];U.uIceT.value.y*=Z.glace[1];U.uIceT.value.z*=Z.glace[2];U.uAur.value=c.aur*Z.aur.k;U.uMistK.value=c.mist*Z.brume;U.uAlp.value=c.alp*Z.alp.k;if(Z.alp.c)U.uAlpC.value.setRGB(Z.alp.c[0],Z.alp.c[1],Z.alp.c[2]);
     U.uAurC.value.setRGB(Z.aur.c[0],Z.aur.c[1],Z.aur.c[2]);U.uAurC2.value.setRGB(Z.aur.c2[0],Z.aur.c2[1],Z.aur.c2[2]);}
   else{U.uAurC.value.setRGB(.25,1,.62);U.uAurC2.value.setRGB(.75,.30,1);}}U.uMistC.value.setRGB(c.mC[0],c.mC[1],c.mC[2]);if(scene.fog)U.uMistC.value.lerp(scene.fog.color,.3);
  {const i=Math.max(0,Math.min(NP-1,Math.round(s/Math.max(1,L)*(NP-1))));const y9=pts[i]?pts[i].y:0;U.uMistY.value+=(y9-U.uMistY.value)*Math.min(1,dt*1.5+(BANQ.yRaz?1:0));BANQ.yRaz=false;}
  U.uNeige.value=c.neige;U.uDD.value=c.dd*(BANQ.dz?BANQ.dz.dd:1);U.uVent.value=c.vent;U.uPx.value=renderer.getPixelRatio();
  {const ff=(scene.fog&&scene.fog.far)||5000;if(scene.fog)U.uHazeC.value.copy(scene.fog.color);U.uHazeK.value=1.6/Math.max(600,ff);U.uHazeM.value=c.neige>.3?.82+.15*Math.min(1,c.neige):.80;}
  {camera.getWorldDirection(BK_V);U.uBoxC.value.copy(camera.position).addScaledVector(BK_V,22);}
  fx.flo.visible=c.neige>.01;fx.dd.visible=U.uDD.value>.01&&c.neige<.2;
  fx.aur.visible=c.aur>.01;if(fx.aur.visible){fx.aur.position.copy(camera.position);fx.aur.rotation.y=BANQ.axe||0; /* (2026-10-19) les aurores tournent avec la montagne (LE GLACIER AU HASARD) */fx.aur.updateMatrix();fx.aur.updateMatrixWorld(true);}
  bkCretesTick(fx);
  if(BK_TR.mesh)BK_TR.mesh.visible=true;
  if(BANQ.solM){const ff=(scene.fog&&scene.fog.far)||6000,cp=camera.position;for(const m of BANQ.solM){const b=m.geometry.boundingSphere,v=cp.distanceTo(b.center)-b.radius<ff+60;if(m.visible!==v)m.visible=v;}}
  if(BANQ.picM){const ff=(scene.fog&&scene.fog.far)||6000,cp=camera.position;for(const m of BANQ.picM){const b=m.geometry.boundingSphere,v=cp.distanceTo(b.center)-b.radius<ff+60;if(m.visible!==v)m.visible=v;}}
  if(vit){try{updatePool(fx.poudre,dt,0);updatePool(fx.givre,dt,0);updatePool(fx.eclat,dt,0);updatePool(fx.brume,dt,0);}catch(e){}}
  if(BANQ.fid!==flightId){BANQ.fid=flightId;BANQ.figs={};BANQ.lent=0;}
  if(mode!=='drive'){BKB.k=0;BKB.enf=0;BKB.dans=false;} // (2026-10-18) la congère ne suit pas la caisse en vol
  if(mode==='fall'&&vit&&started&&!gameOver)banqVolFx(dt);
  else{if(BANQ.sur||BANQ.glisse||BANQ.pou){BANQ.sur=0;BANQ.glisse=false;BANQ.pou=false;}if(!BKV.sur&&!BKB.dans)bkTraceCoupe();
    bkBoucle('banq.glisse',vit&&started&&!gameOver&&mode==='drive'&&BKV.sur&&BKV.gk>.12,-22+14*BKV.gk,.85+.4*BKV.gk);bkBoucle('banq.poudre',vit&&started&&!gameOver&&mode==='drive'&&BKB.dans,-16+10*BKB.k,.85+.3*BKB.k);} /* (2026-10-18) dans la congère, la poudre chante */ // (2026-10-15 soir) sur le verglas, la glisse CHANTE tant que la caisse est en crabe
  bkTraceEnvoi();
  // LA CAMÉRA NE PASSE JAMAIS SOUS LA NEIGE (en rasant la poudre, elle suivait la trajectoire jusque dedans : écran blanc)
  if(mode==='fall'||mode==='boom'){const cp=camera.position,S=banqSurf(cp.x,cp.z);if(S.ok&&cp.y<S.h+2.4){cp.y=S.h+2.4;camera.lookAt(carGroup.position);camera.updateMatrixWorld();}}
  banqSons(dt,c);
}
/* EN VOL, CE QUI SE VOIT ET S'ENTEND : les traces, la gerbe, le givre, les figures, la montagne qui ramène */
function banqVolFx(dt){
  const fx=BANQ.fx,p=fallPos,v=fallVel,hv=Math.hypot(v.x,v.z),d=BANQ.dNow,t=BANQ.tNow,fg=BANQ.figs,hx=hv>1?v.x/hv:0,hz=hv>1?v.z/hv:1,v9=hv*SPD;
  // LES TRACES
  if(BANQ.glisse)bkTrace(p.x,p.z,hx,hz,1,.5,1.2);
  else if(t===1&&d>-.35)bkTrace(p.x,p.z,hx,hz,0,Math.min(1,(d+.35)/1.6),2.05+Math.min(.9,Math.max(0,d)*.55)); // (2026-10-15) la tranchée v2 : plus large
  else bkTraceCoupe();
  // LA GERBE : au ras, une crête de poudre derrière la caisse (la « queue de coq ») ; plus haut, le souffle lève un voile
  if(t===1&&d>-2.8&&hv>12){const ras=d>-.35,k=Math.min(1,hv/110)*(ras?1:.22*(1+d/2.8));BANQ.em=(BANQ.em||0)+dt*64*k; // (2026-10-15) la gerbe v2 : plus fournie, et un VOILE de poudre qui traîne derrière (ci-dessous)
    const y=(BANQ.hNow||p.y)+.3;
    while(BANQ.em>=1){BANQ.em-=1;const sd=Math.random()<.5?-1:1,l=sd*(1+Math.random()*1.2); // deux RIDEAUX qui partent sur les côtés (derrière la caisse, la caméra regarde à travers : jamais un mur blanc)
      spawnP(fx.poudre,p.x-hx*1.4-hz*l,y,p.z-hz*1.4+hx*l,hx*v9*(.15+Math.random()*.2)+(-hz)*sd*(6+Math.random()*9),(ras?4:2)+Math.random()*(ras?8:3)*k,hz*v9*(.15+Math.random()*.2)+hx*sd*(6+Math.random()*9),.55+Math.random()*.75);
      if(ras&&Math.random()<.35)spawnP(fx.poudre,p.x-hx*(3+Math.random()*3)+(Math.random()-.5)*2.5,y+.4,p.z-hz*(3+Math.random()*3)+(Math.random()-.5)*2.5,hx*v9*.08,1.2+Math.random()*2.2,hz*v9*.08,1.5+Math.random()*1.2);}} // LE VOILE : de la poudre lente qui reste en suspens dans la trace
  else BANQ.em=0;
  // LE GIVRE de la glisse : les patins jettent des éclats
  if(BANQ.glisse&&hv>10){BANQ.eg=(BANQ.eg||0)+dt*36*Math.min(1,hv/90);while(BANQ.eg>=1){BANQ.eg-=1;const sd=Math.random()<.5?-1:1;
    spawnP(fx.givre,p.x-hx*1.6+(-hz)*sd*1.1,p.y+.15,p.z-hz*1.6+hx*sd*1.1,-hx*v9*.15+(-hz)*sd*(2+Math.random()*4),1.5+Math.random()*4,-hz*v9*.15+hx*sd*(2+Math.random()*4),.25+Math.random()*.35);}}
  // LES FIGURES : la trace tenue, la glisse tenue, la dérive
  if(t===1&&d>-.35){BANQ.trT=(BANQ.trT||0)+dt;if(BANQ.trT>1.2&&!fg.trace){fg.trace=1;try{addTrick('bk_trace',sansAcc(TR('TRACE PARFAITE !')),12,2);flowAdd(8,'style');hap([8,14,8]);}catch(e){}}}
  else BANQ.trT=0;
  if(BANQ.glisse){ // (2026-10-15) l'ancienne PATINOIRE (1,4 s de glisse) est devenue ICE SKATE, payée à la durée et à la vitesse (bkSkate)
    if(Math.abs(BANQ.drift)>.6){BANQ.dT=(BANQ.dT||0)+dt;if(BANQ.dT>.8&&!fg.der){fg.der=1;try{addTrick('bk_der',sansAcc(TR('DERAPAGE GLACE !')),10,1);flowAdd(6,'style');hap([6,10]);}catch(e){}}}else BANQ.dT=0;}
  // LE SON de la glisse et de la poudre
  bkBoucle('banq.glisse',BANQ.glisse&&hv>6,-16+12*Math.min(1,hv/120),.8+.5*Math.min(1,hv/150));
  bkBoucle('banq.poudre',t===1&&d>-1.2&&hv>10,-18+14*Math.min(1,hv/110)*(d>-.35?1:.4),.85+.35*Math.min(1,hv/140));
  // LA MONTAGNE TE RAMÈNE : arrêté au contact plus de rameneT s, sans nitro
  if((BANQ.sur||(t===1&&d>-.8))&&hv<BK_PH.rameneV&&!nitroOn){BANQ.lent+=dt;if(BANQ.lent>BK_PH.rameneT)banqRamene();}else BANQ.lent=Math.max(0,BANQ.lent-dt*2);
}
/* LES BOUCLES DE SON (la glisse, la poudre, le vent) : une poignée par son, le gain et la vitesse suivent */
function bkBoucle(id,on,vol,rate){const B9=BANQ.boucles;let h=B9[id];
  if(on&&SONV2&&window.CCSON&&window.CCSON.existe(id)){
    if(!h){if(performance.now()>(B9['_'+id]||0)){B9['_'+id]=performance.now()+600;try{h=B9[id]=sfx(id,{loop:true,vol:vol||0});}catch(e){B9[id]=null;}}}
    else{try{h.gain(vol||0,.08);if(rate)h.rate(rate,.12);}catch(e){}}}
  else if(h){try{h.stop(.3);}catch(e){}B9[id]=null;}}
const BK_SONS={jour:[],soir:[['banq.chant',14,26,-18]],nuit:[['banq.chant',8,17,-15]],neige:[],blizzard:[]};
function banqSons(dt,c){
  const ok=SONV2&&started&&running&&!paused&&!gameOver&&!garageOn&&mode!=='boom';
  bkBoucle('banq.vent',ok,c.vent>1.5?-10:c.neige>.3?-17:-23,1);
  if(!ok)return;
  const L9=BK_SONS[c.sons]||[],T9=BANQ.son;T9.k=T9.k||{};
  for(const e of L9){if(T9.k[e[0]]==null)T9.k[e[0]]=e[1]*Math.random();T9.k[e[0]]-=dt;if(T9.k[e[0]]<=0){T9.k[e[0]]=e[1]+Math.random()*(e[2]-e[1]);try{sfx(e[0],{vol:e[3],pan:Math.random()*1.6-.8});}catch(x){}}}}
/* ---------------- LA CHAUFFE AU MENU : chaque matière compilée et dessinée une fois hors écran (0 programme en course) ---------------- */
function banqChauffe(){
  const M=banqMats(),fx=banqFx(),L9=[];
  const tri=at=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,0,1],3));g.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));
    for(const k in at)g.setAttribute(k,new THREE.Float32BufferAttribute(new Float32Array(3*at[k]),at[k]));return g;};
  L9.push(new THREE.Mesh(tri({aS:2}),M.sol),new THREE.Mesh(tri({aB:3,aP:4}),M.pic),new THREE.Mesh(tri({aB:3,aP:4}),M.loin),new THREE.Mesh(tri({aT:4}),M.tr),new THREE.Mesh(tri({aV:4}),M.vg));
  for(const o of L9)o.frustumCulled=false;
  const ex=[fx.flo,fx.dd,fx.aur,BK_TR.mesh,fx.poudre.mesh,fx.givre.mesh,fx.eclat.mesh,fx.brume.mesh].concat(bkCretesChauffe(fx)),vus=ex.map(function(o){return [o,o.visible];});
  for(const v of vus)v[0].visible=true;
  const g=new THREE.Group();for(const o of L9)g.add(o);scene.add(g);
  try{chauffeRendu([g].concat(ex));}finally{scene.remove(g);for(const v of vus)v[0].visible=v[1];for(const o of L9)o.geometry.dispose();}
}
/* ---------------- LA CONSOLE ---------------- */
function bkVie(P){if(!P)return -1;let n=0;for(let i=0;i<P.n;i++)if(P.life[i]>0)n++;return n;} // (console) les particules vivantes d'une réserve
window.dbgBanq=function(k,o){
  if(k==='cam'){if(o)Object.assign(CAM_GLACIER,o);const d9=camera.getWorldDirection(new THREE.Vector3());return {on:CAM_GLACIER.on,k:CAM_GLACIER.k,g:+(camGlacier()*57.3).toFixed(1),phi:+(CAM_ROUTE.phi*57.3).toFixed(1),site:+(Math.asin(THREE.MathUtils.clamp(d9.y,-1,1))*57.3).toFixed(1),POR:+POR.toFixed(2),caisseY:+carGroup.position.clone().project(camera).y.toFixed(3)};} // (banc, 2026-10-18) LA CAMÉRA DU GLACIER : {k} la règle à chaud ; g = la part de pente redressée, phi = le cabrage tenu, site = l'assiette du regard (°)
  if(k==='pente'){const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};let n=0,m=0,gm=0;for(let s9=300;s9<L-300;s9+=20){frameAt(s9,F9);const g=-F9.t.y/Math.max(1e-6,Math.hypot(F9.t.x,F9.t.z));m+=g;n++;if(g>gm)gm=g;} // (banc, 2026-10-17 nuit) la piste en chiffres : demi-largeur, longueur, dénivelé, pente moyenne et maxi (en %)
    frameAt(0,F9);const y0=F9.p.y;frameAt(L-1,F9);const R={RH:ROAD_HALF,L:Math.round(L),denivele:Math.round(y0-F9.p.y),moy:Math.round(m/Math.max(1,n)*100),max:Math.round(gm*100)};
    if(o&&o.cote!=null){frameAt(L*o.cote,F9);const h=Math.hypot(F9.t.x,F9.t.z),d=o.d||1100;R.vue=dbgBanq('vue',{p:[F9.p.x-F9.t.z/h*d,F9.p.y+(o.h||120),F9.p.z+F9.t.x/h*d],c:[F9.p.x,F9.p.y-(o.b||60),F9.p.z],fov:o.fov||55});} // la vue de CÔTÉ : la pente en profil
    return R;}
  if(k==='piste')return {pics:(BANQ.obst||[]).map(function(q){return [Math.round(q.s),Math.round(q.lat),Math.round(q.r)];}),becs:(BANQ.kick||[]).map(function(q){return [Math.round(q.s),Math.round(q.l0),Math.round(q.l1)];})}; // (v4) la piste : [s, lat, rayon] des pics, [s, l0, l1] des becs
  if(k==='verglas'){const V9=(BANQ.verg||[]).map(function(v){return [Math.round(v.a),Math.round(v.b)];});
    if(o&&(o.s!=null||o.n!=null)){safeS=o.s!=null?o.s:600+(o.n|0)*800;respawn();graceT=0;if(o.v)vA=o.v/(3.6*SPD);}
    return {plaques:V9,sur:BKV.sur,yaw:+BKV.yaw.toFixed(3),gl:+BKV.gl.toFixed(3),gk:+BKV.gk.toFixed(2),ecl:bkVie(BANQ.fx.eclat),bru:bkVie(BANQ.fx.brume),t:+BKV.t.toFixed(2),aura:Math.round(BKV.aura),s:Math.round(s),lat:+lat.toFixed(2),psi:+psi.toFixed(3),kmh:Math.round(Math.abs(vA)*3.6*SPD),mode:mode};}
  if(k==='regle'){if(!BANQ.root)return null;const ob=new Set();for(const o9 of BANQ.obst||[])for(const P of o9.L9)ob.add(P); /* (2026-10-20, banc) LA RÈGLE D'OR : aucun cristal du DÉCOR (hors des pics de la piste) ne crève la glace, ses bords, ni l'air de la caméra (14 m de chaque côté) */
    const ds=L/(NP-1),st=Math.max(1,Math.round(6/ds));let n=0,t=0,pire=-1e9;const ex=[];
    for(let i=0;i<NP;i+=st){const p=pts[i],b=B[i];for(let q=-1;q<=1;q+=.25){const la=q*(ROAD_HALF+14),x=p.x+b.x*la,z=p.z+b.z*la;t++;const G=BANQ.picG,A9=G&&G.G.get(Math.floor(x/G.CG)*100003+Math.floor(z/G.CG));if(!A9)continue;
      for(const P of A9){if(ob.has(P)||(x-P.cx)*(x-P.cx)+(z-P.cz)*(z-P.cz)>P.r2)continue;const h=bkPrimH(P,x,z),m=h-(p.y-THICK-5);if(m>pire)pire=m;if(m>0){n++;if(ex.length<6)ex.push([Math.round(i*ds),+q.toFixed(2),Math.round(m),P.fam]);}}}}
    return {essais:t,percees:n,pire:Math.round(pire),ex:ex};}
  if(k==='meteo'){banqMeteo(o||'nuit',.01);return BANQ.met;}
  if(k==='embelli'){const fx=BANQ.fx;return {on:BK_EMB,cre:!!fx.cre,cN:fx.cN||null,graine:fx.cG,progs:renderer.info.programs?renderer.info.programs.length:-1};} /* (2026-10-21, banc) LE GLACIER EMBELLI : les comptes de l'anneau de crêtes */
  if(k==='phys'&&o){Object.assign(BK_PH,o);return BK_PH;}
  if(k==='cg'){if(o)Object.assign(BK_CG,o);return {cg:BK_CG,k:+BKB.k.toFixed(2),enf:+BKB.enf.toFixed(2),dans:BKB.dans,lat:+lat.toFixed(1),kmh:Math.round(Math.abs(vA)*3.6*SPD),p:carGroup.position.toArray().map(function(v){return +v.toFixed(1);}),t:F.t.toArray().map(function(v){return +v.toFixed(3);}),b:F.b.toArray().map(function(v){return +v.toFixed(3);}),n:F.n.toArray().map(function(v){return +v.toFixed(3);}),mort:mortCause,pq:BANQ.pourquoi||'',latOff:+curLatOff.toFixed(1),hOff:+curHOff.toFixed(1)};} // (banc, 2026-10-18) LA CONGÈRE : réglages et état
  if(k==='vue'&&o){if(started&&!gameOver&&!paused)togglePause();camera.position.fromArray(o.p);camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3().fromArray(o.c));camera.updateMatrixWorld();
    if(o.fov){camera.fov=o.fov;camera.updateProjectionMatrix();}skyDome.position.copy(camera.position);skyU.uCam.value.copy(camera.position);banqTick(0);if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);return 'ok';}
  /* les PHOTOS (en pause) : 'pic' = le prochain pic où l'on glisse (o.d m avant, o.h m de haut) */
  if(k==='pic'){const ds=L/(NP-1),d=(o&&o.d)||90,h=(o&&o.h)||9;let i=-1,cible=null;
    {let bd=1e18;for(const P of BANQ.pics){if(P.fam!==0||P.H<25)continue;let bi=-1,b2=1e18;for(let j=Math.round((s+80)/ds);j<NP;j+=6){const q=(pts[j].x-P.cx)**2+(pts[j].z-P.cz)**2;if(q<b2){b2=q;bi=j;}}if(bi>=0&&bi<bd){bd=bi;i=bi;cible=[P.cx,P.A[1]-P.H*.4,P.cz];}}}
    if(i<0)return 'rien devant';const j=Math.max(0,i-Math.round(d/ds)),p=pts[j];banqTick(0);
    return window.dbgBanq('vue',{p:[p.x,p.y+h,p.z],c:cible,fov:o&&o.fov});}
  /* LÂCHER la caisse (en course) : 'poudre' = o.h m au-dessus de la neige à côté de la route ;
     o.v l'élan (unités de vol), o.pq le piqué (vitesse vers le bas / élan) */
  if(k==='poudre'||k==='pic9'){if(!started||gameOver||mode!=='drive')return 'pas en course';const ds=L/(NP-1),h=(o&&o.h!=null)?o.h:4,v=(o&&o.v)||90,pq=(o&&o.pq!=null)?o.pq:.12;
    let i=Math.min(NP-2,Math.round((s+70)/ds)),x,z,y;const t=T[i],hl=Math.hypot(t.x,t.z)||1;let hx=t.x/hl,hz=t.z/hl;
    if(k==='pic9'){const P=BANQ.pics.find(function(q){return q.fam===0&&q.H>25&&Math.hypot(q.cx-pts[i].x,q.cz-pts[i].z)<400;});if(!P)return 'pas de pic';x=P.cx-hx*P.r*.9;z=P.cz-hz*P.r*.9;y=P.A[1]+h;
      const dx=P.cx-x,dz=P.cz-z,dl=Math.hypot(dx,dz)||1;hx=dx/dl;hz=dz/dl;}
    else{const b=B[i];x=pts[i].x+b.x*(ROAD_HALF+45);z=pts[i].z+b.z*(ROAD_HALF+45);y=bkSolH(x,z)+h;}
    startFall(.9,1,false);fallPos.set(x,y,z);fallVel.set(hx*v,-v*pq,hz*v);fallVH0=v;carGroup.position.copy(fallPos);BANQ.mort='';
    return {x:+x.toFixed(1),y:+y.toFixed(1),z:+z.toFixed(1),sol:+bkSolH(x,z).toFixed(1)};}
  /* LE RACCOURCI (le GLACIER) : la caisse sort par le bord AVAL d'une spirale (o.n : laquelle, o.f : où dans le tour, 0-1), à o.v ; banc : lire dbgBanq('etat').s après la pose */
  if(k==='raccourci'){if(!started||gameOver||mode!=='drive')return 'pas en course';const sp=BANQ.spi[(o&&o.n)|0];if(!sp)return 'pas de spirale';const ds=L/(NP-1),i=Math.min(NP-2,Math.round((sp.s0+sp.lt*((o&&o.f!=null)?o.f:.15))/ds));
    let sd=1,best=1e18;for(const sg of [-1,1]){const x=pts[i].x+B[i].x*sg*40,z=pts[i].z+B[i].z*sg*40;for(let j=i+Math.round(300/ds);j<NP;j+=3){const q=pts[j];if(q.y>pts[i].y-15)continue;const d=(q.x-x)**2+(q.z-z)**2;if(d<best){best=d;sd=sg;}}}
    const v=(o&&o.v)||90;s=i*ds;startFall(.9,1,true);fallPos.copy(pts[i]).addScaledVector(B[i],sd*(ROAD_HALF+.5)).addScaledVector(Nn[i],.6);fallVel.copy(T[i]).multiplyScalar(v).addScaledVector(B[i],sd*6);fallVH0=v;carGroup.position.copy(fallPos);
    BANQ.racc={s0:Math.round(s),i:i};return {s0:Math.round(s),cote:sd,dessous:Math.round(Math.sqrt(best))};}
  if(k==='spirale'){const sp=BANQ.spi[(o&&o.n)|0];if(!sp)return 'pas de spirale';const ds=L/(NP-1);let cx=0,cy=0,cz=0,n=0,ym=1e9;for(let j=Math.round(sp.s0/ds);j<Math.round(sp.s1/ds);j+=20){cx+=pts[j].x;cy+=pts[j].y;cz+=pts[j].z;n++;ym=Math.min(ym,pts[j].y);}cx/=n;cy/=n;cz/=n;
    const j0=Math.round(sp.s0/ds),t=T[j0],a=(o&&o.a)||0,d=(o&&o.d)||520;return window.dbgBanq('vue',{p:[cx-Math.cos(a)*d*.7-t.x*d*.4,cy+(o&&o.h||300),cz-Math.sin(a)*d*.7-t.z*d*.4],c:[cx,ym+10,cz],fov:(o&&o.fov)||60});}
  if(k==='etat')return {s:Math.round(s),racc:BANQ.racc||null,mode:mode,sur:BANQ.sur,glisse:BANQ.glisse,pou:BANQ.pou,d:+(+BANQ.dNow).toFixed(2),t:BANQ.tNow,drift:+BANQ.drift.toFixed(2),lent:+BANQ.lent.toFixed(2),
    v:+Math.hypot(fallVel.x,fallVel.z).toFixed(1),vy:+fallVel.y.toFixed(1),y:+fallPos.y.toFixed(1),fallTR:+fallTR.toFixed(2),traces:BK_TR.i,figs:Object.keys(BANQ.figs)};
  if(k==='reprend'){if(paused)togglePause();return 'reprise';}
  if(k==='fini'){const t=performance.now(),n=bkTranches(1e9);return {taches:n,ms:Math.round(performance.now()-t)};}
  if(k==='ramene'){if(mode==='fall')banqRamene();return mode;}
  const triM=function(L9){return (L9||[]).reduce(function(a,m){return a+(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3;},0);};
  return {on:!!BANQ.root,deco:BANQ.deco||null,met:BANQ.met,ms:BANQ.ms,msSol:BANQ.msSol,tp:BANQ.tp,axe:BANQ.axe!=null?Math.round(BANQ.axe*57.3):null,plan:BANQ.plan||null,pres:BANQ.pres,essais:BANQ.essais, /* (2026-10-19) LE GLACIER AU HASARD : l'axe (°), les tronçons, le plus près que la piste passe d'elle-même */file:{reste:BANQ.file.length-BANQ.fi,total:BANQ.nFile,ms:Math.round(BANQ.msFile||0)},tri:{sol:triM(BANQ.solM),pics:triM(BANQ.picM),loin:triM(BANQ.loinM)},n:BANQ.n,cas:BANQ.cas.map(function(x){return Math.round(x);}),
    sol:BANQ.sol&&{nx:BANQ.sol.nx,nz:BANQ.sol.nz,C:BANQ.sol.C,morceaux:BANQ.solM&&BANQ.solM.length,vus:BANQ.solM&&BANQ.solM.filter(function(m){return m.visible;}).length},
    cur:BANQ.cur&&{aur:+BANQ.cur.aur.toFixed(2),neige:+BANQ.cur.neige.toFixed(2),alp:+BANQ.cur.alp.toFixed(2)},L:Math.round(L),yMin:Math.round(trackMinY),y0:pts[0]&&Math.round(pts[0].y)};};

/* <<<FIN BANQUISE>>> */
