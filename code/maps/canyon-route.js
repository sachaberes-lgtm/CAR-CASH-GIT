/* =========================== LE CANYON DES GÉANTS (2026-10-14, Sacha) ===========================
   Sacha : « fais une map façon canyon Monument Valley mais genre géant, avec des grandes gorges où la route passe entre, au-dessus des
   lits de rivière, entre deux grandes parois de pierre ; il faut quand même que la route descende vers le bas, pas comme la map montagne
   chinoise ; fais quelque chose de magnifique où tu t'amuses sur les couleurs de la roche, avec des teintes jaune et rose ; la map doit
   avoir le même niveau d'exigence que les autres, et toutes les météos et heures de la journée parfaitement gérées et adaptées à un biome
   désertique ».
   · LA ROUTE (`genCanyon`) : elle PLONGE comme celle des nuages (MESURÉ sur la MER DE NUAGES : pente médiane ~30°, 7,8 km de dénivelé
     sur 18 km — les Pics de jade, eux, restent à plat) le long d'une rivière qui serpente : la vallée des MITAINES au départ, LA BRÈCHE (le
     grand plongeon dans la gorge), les méandres et leurs bosses, LE FER À CHEVAL, LES ÉTROITS, L'ARCHE, L'AMPHITHÉÂTRE, le DOS DE CHAMEAU,
     la finale. Jamais deux tronçons trop proches (contrôle à la génération, nouvel essai sinon) ; son propre flux de hasard (UN tirage de rnd).
   · LE MONDE (`buildCanyon`) : un relief calculé autour de la route — la rivière en VASQUES et en CASCADES sous la dalle (une rivière ne
     remonte jamais : le lit suit le minimum de la route moins sa hauteur), ses berges, les PAROIS (un profil par section : gorge en U,
     étroits presque verticaux, amphithéâtre en gradins), le PLATEAU en ESCALIER qui descend avec la route (des escarpements tous les
     ~250 m de dénivelé), les BUTTES de Monument Valley posées dessus (une grille de 760 m, loin de la route). Quatre textures de données :
     la TAILLE fine (le creusement et l'eau, 9 m), le PLATEAU (48 m, jusqu'au plan lointain), la hauteur d'OMBRE (le soleil de l'heure,
     balayé une fois sur la grille), et deux bruits partagés avec le processeur (la collision lit EXACTEMENT les mêmes données que la puce).
   · LE RENDU (`CY_VS`/`CY_FS`) : un terrain GPU à niveaux de détail continus (CDLOD : UN maillage de grille en instances, choisi par un
     quadtree à chaque image, qui se MORPHE d'un niveau à l'autre — ni fissure ni saut) ; la hauteur se lit dans les textures et se taille
     en CORNICHES (marches de 15-26 m, contremarches franches) ; les STRATES (une colonne de 1 024 couches : crème, jaune beurre, saumon,
     rose, corail, ocre, lavande, brique), le litage oblique des grès, le VERNIS du désert qui coule sous les corniches, le sable et le
     maquis sur les replats, la ripisylve verte au bord de l'eau ; la lumière : le soleil (et l'ombre portée des parois), le ciel qui
     s'assombrit au fond de la gorge, le REBOND chaud des parois éclairées dans l'ombre, l'eau turquoise (vasques, reflets de la gorge,
     cascades blanches), la brume du matin au fond, la boue de l'orage, l'éclair.
   · L'HEURE : c'est le seul niveau où le SOLEIL BOUGE (`cyA` de chaque ambiance : hauteur et azimut) — bas et rose à l'aube, haut à midi
     (la gorge s'allume), rasant le soir, la lune la nuit. `canyonSoleil` pose SUN_DIR dans la boucle ; ailleurs il revient à sa valeur
     d'origine AU BIT PRÈS (SUN_DIR0). Le ciel est à lui (`canyonCiel`, un programme dédié : dégradé du désert, ceinture de Vénus, soleil,
     nuages, mesas à l'horizon, Voie lactée et lune la nuit, plafond de pluie, enclumes d'orage).
   · RÈGLE D'OR : aucun relief ne touche la route, dessus ni dessous (`dbgCanyon('test')`). En vol, la roche, l'eau et le fond TUENT
     (`canyonHeurt` → « ENCASTRÉ DANS LA PAROI », « AU FOND DU CANYON »).
   Console : `dbgCanyon()` (état, temps de construction) · `dbgCanyon('test')` (la règle d'or) · `dbgCanyon('vue',d,h,cap)` (photo figée)
   · `?carte=canyon&meteo=soir` (ou `dbgClassique('canyon','orage')` puis `dbgSaut()`). */
const NIV_CANYON={id:'canyon',nm:'CANYON DES GÉANTS',bio:['canyonSoir'],planete:0,espace:0,pluie:0,cielMusical:false,route:.30,sheen:.12,piste:'canyon',pr:'LES PAROIS NE PARDONNENT PAS'};
const CANYON_OK=!!(renderer.capabilities&&renderer.capabilities.isWebGL2); // les textures de données en flottants et la lecture de textures au sommet
PAL.B.cyFin=[16,14,12];PAL.B.cyPlat=[96,80,64];PAL.B.cyOmbre=[36,32,27];PAL.B.cyGrille=[16,16,32];PAL.B.cyR0=[85,100,118];PAL.B.cyChem=[120,200,300];PAL.B.cyArbres=[260,450,700]; // (2026-10-14, CANYON) la finesse du relief par palier [ancien, moyen, récent]
const SUN_DIR0=SUN_DIR.clone(),CY_UP=new THREE.Vector3(0,1,0),CY_SD=new THREE.Vector3(); // le soleil d'origine : il revient au bit près hors du canyon
const CY={Q:null,on:false,ms:{},yMin:-1e4,yMax:1e4,ombre:1,prof:0,mesh:null,mat:null,geo:null,aN:null,maxN:900,G:32,S0:64,R0:118,lods:7,
  F:null,Z:null,O:null,fr:new THREE.Frustum(),pm:new THREE.Matrix4(),box:new THREE.Box3(),n:0,v:new THREE.Vector3(),sol:null};
/* LA ROUTE v2 (2026-10-14 soir, Sacha : « le but du jeu est de prendre des RACCOURCIS en coupant la route quand une autre la croise plus
   bas » + « c'est un jeu de COURSE, pas de balade : plus de virages ») — droites et arcs (≤ 8° par point), la PENTE en grade (dy/dx).
   Le cap reste dans ±58° de l'axe (la piste ne revient jamais sur elle-même… SAUF dans les BOUCLES, faites pour ça). LV élargit les rayons.
   LA BOUCLE (le raccourci) — un TROMBONE qui descend : l'APPROCHE (droite, la zone de saut), un demi-tour R1, le RETOUR, un demi-tour R2
   plus serré, la SORTIE. R2 = R1 − e/2 : la sortie court PARALLÈLE à l'approche, décalée de e (~90 m d'axe à axe, ~35 m de vide entre
   les bords) et PLUS BAS de `dh` (~120 m) — puis elle passe SOUS le premier demi-tour (la route repasse sous elle-même). Celui qui sort
   par le bord de l'approche retombe sur la sortie : il saute ~2 km de route. Les repères `racX0/racX1` (approche) et `racX2/racX3`
   (la sortie, sous l'approche) sont relus par buildCanyon → `CY.rac`. */
function* genCanyon(rnd){ // (LE PRÉ-BÂTI) un générateur : il rend la main entre deux essais et pendant la mesure des écarts
  CAMPM.length=0;MODMARK.length=0;FILETMARK.length=0;
  const LV=lvPiste(),RS=1.25+.3*(LV-1),LL=1+Math.min(1.3,(LV-1)*.5),SQ=Math.sqrt(LV),g0=(rnd()*4294967296)>>>0;
  // LE RAYON MINIMAL TENABLE à la vitesse du palier (règle RACCOURCIS de GAMEPLAY : 40 + 0,3 × la croisière du palier en m/s — le vrai
  // plafond du joueur, lacetMax ; dessous un virage est INFRANCHISSABLE) : rayonPalier() du jeu s'il est là, ×1,08 de marge
  const VW=typeof vPalier==='function'?vPalier():70+(LV-1)*100,RMIN=1.08*(typeof rayonPalier==='function'?rayonPalier():40+.3*VW);CY.rmin=Math.round(RMIN);
  let best=null,bestSep=-1;
  for(let essai=0;essai<14;essai++){if(essai)yield;
    const r=mulberry32((g0+essai*0x9E3779B1)>>>0),C=[],Q={},P=new THREE.Vector3(0,0,0),BO=[];let phi=0;const LIM=58*Math.PI/180;
    const push=()=>C.push(P.clone()),ici=k=>{Q[k]={p:P.clone(),phi:phi};};
    const droite=(l,pe,n)=>{n=n||Math.max(2,Math.round(l/90));for(let k=0;k<n;k++){P.x+=Math.sin(phi)*l/n;P.z+=Math.cos(phi)*l/n;P.y+=pe*l/n;push();}};
    const arc=(aDeg,R,pe)=>{R=Math.max(R,RMIN);const n=Math.max(3,Math.ceil(Math.abs(aDeg)/8)),st=aDeg*Math.PI/180/n,ch=2*R*Math.sin(Math.abs(st)/2);
      for(let k=0;k<n;k++){phi+=st/2;P.x+=Math.sin(phi)*ch;P.z+=Math.cos(phi)*ch;P.y+=pe*ch;phi+=st/2;push();}};
    const recentre=pe=>{if(Math.abs(phi)>.06)arc(-phi*57.2958,(300+r()*150)*RS,pe);}; // (2026-10-15) R 300-450 : à 520-720 le retour au cap faisait 900 m qu on prenait pour une droite
    // LES VIRAGES DE COURSE (règle RACCOURCIS de GAMEPLAY : ≥ 2,5 virages/km de rayon < 250 m, enchaînés) : gauche-droite, presque plus de droites
    // LE GRAND VIRAGE (2026-10-15, Sacha : « plus de virages larges, la plupart de la map fait du tout droit ») : une longueur donnée
    // posée en COURBE ample (R 300-520 m) au lieu d'une droite — le côté se choisit d'après la place qui reste dans les ±58°
    const large=(len,pe,R)=>{R=R||(300+r()*220)*RS;let sg=r()<.5?-1:1;const a=len/R*57.2958;
      if((LIM-sg*phi)*57.2958<a*.6)sg=-sg;const lib=Math.max(4,(LIM-sg*phi)*57.2958);
      if(a<=lib){arc(sg*a,R,pe);return;}arc(sg*lib,R,pe);arc(-sg*Math.min(a-lib,(LIM+sg*phi)*57.2958),R,pe);}; // trop long d'un côté : il repart en S
    const virages=(len,p0,p1)=>{let fait=0,sg=r()<.5?-1:1;
      while(fait<len){if(r()<.8)sg=-sg;const lg=r()<.4;let a=lg?40+r()*35:30+r()*45;const R=(lg?240+r()*180:85+r()*105)*RS; // 4 sur 10 sont des GRANDS virages (R 240-420 m) : on tient l'appui longtemps
        const lib=(LIM-sg*phi)*57.2958;if(lib<18){sg=-sg;a=Math.min(a,(LIM-sg*phi)*57.2958);}else a=Math.min(a,lib);
        const pe=-(p0+r()*(p1-p0));arc(sg*a,R,pe);fait+=R*a/57.2958;
        if(r()<.12){const l=(50+r()*70)*LL,p2=-(p0+r()*(p1-p0))*.8;droite(l,p2);fait+=l;}}};
    const bosses=n=>{for(let k=0;k<n;k++){const l1=(70+r()*25)*LL,l2=(105+r()*30)*LL,h=(14+r()*8)*SQ,h2=(26+r()*14)*SQ;droite(l1,h/l1,2);droite(l2,-(h+h2)/l2,3);}};
    /* LES MODULES DU CANYON (2026-10-18, LES MODULES DE CHAQUE MAP — voir MODC_ON). 5 ou 6 des 6 « virages » de liaison (tirés au sort) deviennent
       un module — jamais les boucles à raccourci, la route 67, les étroits, l'arche, l'amphithéâtre, la mine ni la finale. Paquet mélangé, jamais
       deux fois de suite ; leur hasard `rm` naît de la graine de l'essai (aucun tirage de plus, ni dans `rnd` ni dans `r`) :
         cSlalom  · LE SLALOM DES CAIRNS : 4-5 virages alternés de 35-55° à 1,25-1,6 × RMIN — plus vif que les étroits, entre des parois larges
         cCorde   · LA DOUBLE CORDE : deux appuis du même côté autour d'une butte (95-110° en tout), le second plus serré, une courte droite entre
         cWhoops  · LES WHOOPS DE LA GORGE : 3-4 bosses rondes (une montée douce, une plongée franche), chacune un virage de 55-70°, en slalom — on décolle à chaque crête
         cChicane · LA CHICANE DES BUTTES : gauche-droite-gauche SERRÉE (1,1-1,3 × RMIN)
       Le cap reste dans ± LIM (on recentre avant s'il le faut) ; les pentes sont celles de la liaison qu'ils remplacent. */
    const rm=MODC_ON?mulberry32(((g0^0x6D0D5EED)+Math.imul(essai+1,0x85EBCA6B))>>>0):null,MM=[],cmPaq=[],cmCase=new Set();let cmK=0,cmLast=-1;
    if(rm){const t=[0,1,2,3,4,5];for(let i=5;i>0;i--){const j=(rm()*(i+1))|0,x9=t[i];t[i]=t[j];t[j]=x9;}const nb=5+(rm()<.5?1:0);for(let i=0;i<nb;i++)cmCase.add(t[i]);}
    const cmPe=(p0,p1)=>-(p0+rm()*(p1-p0)),cmRe=(lim,pe)=>{if(Math.abs(phi)>lim)arc(-(phi-Math.sign(phi)*lim*.3)*57.2958,(260+rm()*120)*RS,pe);};
    const cSlalom=(p0,p1)=>{const n=4+(rm()<.5?1:0),a=35+rm()*20,R=RMIN*(1.25+rm()*.35);cmRe(LIM-a/57.3*.6,cmPe(p0,p1));let sg=phi>0?-1:1;arc(sg*a*.5,R,cmPe(p0,p1));
      for(let k=0;k<n;k++){sg=-sg;arc(sg*a,R,cmPe(p0,p1));}arc(-sg*a*.5,R,cmPe(p0,p1));};
    const cCorde=(p0,p1)=>{const T=95+rm()*15,sg=phi>0?-1:1,a1=T*(.5+rm()*.1),R=RMIN*(1.5+rm()*.4);{const d=(-sg*T/2/57.2958-phi)*57.2958;if(Math.abs(d)>3)arc(d,(260+rm()*80)*RS,cmPe(p0,p1));}
      arc(sg*a1,R,cmPe(p0,p1));droite((40+rm()*40)*LL,cmPe(p0,p1)*.8);arc(sg*(T-a1),Math.max(RMIN*1.15,R*.8),cmPe(p0,p1));};
    const cWhoops=(p0,p1)=>{const n=3+(rm()<.5?1:0);cmRe(.5,cmPe(p0,p1));let sg=phi>0?-1:1;
      for(let k=0;k<n;k++){const lu=(80+rm()*20)*LL,ld=(110+rm()*30)*LL,a=(k?55+rm()*15:30+rm()*8)/57.2958,R=Math.max(RMIN*1.4,(lu+ld)/a),au=lu/R*57.2958,ad=ld/R*57.2958;arc(sg*au,R,.12+rm()*.05);arc(sg*ad,R,-(.38+rm()*.1));sg=-sg;}};
    const cChicane=(p0,p1)=>{const a=30+rm()*10,R=RMIN*(1.1+rm()*.2);cmRe(LIM-a/57.3-.05,cmPe(p0,p1));const sg=phi>0?-1:1;droite(50*LL,cmPe(p0,p1)*.6);
      arc(sg*a,R,cmPe(p0,p1));arc(-sg*2*a,R,cmPe(p0,p1));arc(sg*a,R,cmPe(p0,p1));droite(50*LL,cmPe(p0,p1)*.6);};
    const cmJ=[cSlalom,cCorde,cWhoops,cChicane];
    const lien=(len,p0,p1)=>{const k=cmK++;if(!rm||!cmCase.has(k)){virages(len,p0,p1);return;}  // (2026-10-18) une liaison : des virages… ou un MODULE (voir cSlalom)
      let m=0;for(let e=0;e<6;e++){if(!cmPaq.length){const t=[0,1,2,3];for(let i=3;i>0;i--){const j=(rm()*(i+1))|0,x9=t[i];t[i]=t[j];t[j]=x9;}for(const x9 of t)cmPaq.push(x9);}m=cmPaq.shift();if(m!==cmLast)break;}
      cmLast=m;const i0=C.length-1;cmJ[m](p0,p1);MM.push({i0:i0,i1:C.length-1});};
    // LA BOUCLE (le raccourci) : approche ~220 m · demi-tour R1 ~135 m · retour · demi-tour SERRÉ R2 = R1 − e/2 (~80 m) · la SORTIE, 94 m à côté
    // de l'approche et 55 à 90 m plus bas (2,6 à 3,4 s de vol : à 70-140 m/s on retombe de 180 à 480 m plus loin — la sortie file droit
    // sous l'approche puis sous le premier demi-tour, et s'incurve à peine : elle est là où la caisse arrive)
    const boucle=(nm,sg)=>{const k0=C.length;if(Math.abs(phi)>.06)arc(-phi*57.2958,(200+r()*80)*RS,-.25);
      const e=2*ROAD_HALF+32+r()*12,R1=Math.max((100+r()*20)*RS,RMIN+e/2),R2=R1-e/2,La=(200+r()*50)*LL,Lb=(140+r()*30)*LL,pa=.10,dh=55+r()*35,
        pl=Math.max(.02,(dh-pa*Lb)/(Math.PI*(R1+R2)+Lb));
      ici(nm+'0');droite(La,-pa,Math.max(3,Math.round(La/70)));ici(nm+'1');               // l'APPROCHE : la zone de saut
      arc(sg*180,R1,-pl);droite(Lb,-pl,Math.max(2,Math.round(Lb/70)));arc(sg*180,R2,-pl);phi-=sg*2*Math.PI; // demi-tour, retour, demi-tour serré (le cap a fait un tour : on le ramène)
      ici(nm+'2');droite(Lb,-pa,Math.max(2,Math.round(Lb/70)));                          // la SORTIE : droite sous l'approche…
      {const R3=(400+r()*100)*RS;arc(-sg*150*LL/R3*57.2958,R3,-pa);}ici(nm+'3');          // …puis elle tourne déjà sous le 1er demi-tour (150 m sur R 400-500 : 28 m d'écart au bout, la pose reste sur la dalle)
      arc(-sg*(18+r()*14),(380+r()*120)*RS,-pa);                                          // …et elle finit son GRAND virage (R 380-500 m : la pose de ceux qui volent loin reste douce)
      BO.push([k0,C.length-1]);};
    let sg0=r()<.5?1:-1;const sens=()=>(sg0=-sg0);                            // les boucles alternent de côté : la piste ne dérive pas
    /* (LA DURÉE DES MAPS) au JOUER (LC9 > 0) : la Route 66 (moitié), la brèche, le raccourci A, les étroits, l'arche, l'amphithéâtre et la finale
       restent ; les raccourcis B à H, les bosses, la mine et le dos de chameau n'entrent que si la longueur visée les tient (`tient`) */
    const LC9=typeof longueurCible==='function'?longueurCible():0,kC=LC9?.4:1,fait=()=>{let a=0;for(let k=1;k<C.length;k++)a+=Math.hypot(C[k].x-C[k-1].x,C[k].z-C[k-1].z);return a;},tient=f=>!LC9||fait()<LC9*f;
    push();ici('depart');
    r();r();{const l9=820*LL*(LC9?.35:1);droite(l9,-.025,Math.max(2,Math.round(l9/90)));}ici('breche0'); /* (2026-10-15 soir, Sacha : « le niveau dans le canyon doit commencer par une longue ligne droite, une vieille station-service et un panneau ROUTE 66 ») LA ROUTE 66 : la vallée des Mitaines en LONGUE LIGNE DROITE (820 m, à peine en pente) — les deux tirages de l'ancienne courbe sont gardés : la suite du canyon ne bouge pas. Avant : large(340*LL,-.05,(480+r()*200)*RS) */
    {const a=(r()<.5?-1:1)*(5+r()*6);arc(a,700*RS,-.2);}
    large(330*LL,-.62);ici('breche1');droite(90*LL,-.25,2);                 // LA BRÈCHE : le grand plongeon dans la gorge — en virage
    lien(380*LL*kC,.30,.55);
    {ici('fer0');boucle('racA',sens());ici('fer1');}                          // les RACCOURCIS, un tous les ~1,5 km
    if(tient(.3)){lien(300*LL,.28,.5);boucle('racB',sens());}
    if(tient(.38)){ici('bosses');bosses(2);boucle('racC',sens());}
    lien(300*LL*kC,.30,.55);recentre(-.3);
    if(tient(.45)){ici('etroit0');let sg=sens();for(let k=0;k<(LC9?4:6);k++){arc(sg*(24+r()*16),(150+r()*60)*RS,-.30);sg=-sg;}ici('etroit1');} // LES ÉTROITS : le COULOIR — ça serpente entre deux murs collés à la route
    if(tient(.5)){large(260*LL,-.28);boucle('racD',sens());}else large(160*LL,-.28);  // (2026-10-15) un grand virage de sortie : la zone de saut du raccourci D sort du fondu de la fente (sinon une crête de roche coupait le saut)
    droite(90*LL,-.2,2);ici('arche0');large(360*LL*(LC9?.6:1),-.14,(560+r()*200)*RS);ici('arche1');  // L'ARCHE (une courbe douce : l'arche se pose au milieu, en travers)
    if(tient(.62)){const sg=sens();arc(-sg*40,300*RS,-.35);ici('amphi0');arc(sg*96,(230+r()*40)*RS,-.42);ici('amphi1');} // L'AMPHITHÉÂTRE
    if(tient(.68)){boucle('racE',sens());ici('mine0');large(300*LL,-.16);large(300*LL,-.16);ici('mine1');}  // LA MINE abandonnée : deux grandes courbes sous la roche (cyMine)
    if(tient(.74))boucle('racF',sens());
    if(tient(.78)){const l1=(150+r()*40)*LL,h=(24+r()*10)*SQ,l2=(250+r()*60)*LL;ici('chameau');droite(l1,h/l1,3);large(l2,-(h+80*SQ)/l2);} // LE DOS DE CHAMEAU (la descente tourne)
    if(tient(.8)){lien(260*LL,.30,.55);boucle('racG',sens());}
    if(tient(.84)){lien(260*LL,.30,.55);boucle('racH',sens());}
    lien(240*LL*kC,.30,.55);recentre(-.4);
    ici('finale0');large(300*LL*(LC9?.6:1),-.75);large(320*LL*(LC9?.6:1),-.12);ici('fin');droite(150,-.05,2); // la finale : deux grandes courbes, seule la ligne d'arrivée reste droite
    // LE CONTRÔLE : deux tronçons à plus de 1,2 km l'un de l'autre sur la route ne passent jamais à moins de ~560 m — SAUF à l'intérieur
    // d'une même boucle (c'est le raccourci, voulu)
    const n=C.length,acc=new Float32Array(n),bo=new Int16Array(n).fill(-1);for(let k=1;k<n;k++)acc[k]=acc[k-1]+Math.hypot(C[k].x-C[k-1].x,C[k].z-C[k-1].z);
    BO.forEach(function(q,m){for(let k=q[0];k<=q[1];k++)bo[k]=m;});
    let sep=1e9;for(let i=0;i<n;i++){if((i&63)===63)yield;for(let j=i+1;j<n;j++){if(acc[j]-acc[i]<1200*LL||(bo[i]>=0&&bo[i]===bo[j]))continue;const d=Math.hypot(C[i].x-C[j].x,C[i].z-C[j].z);if(d<sep)sep=d;}}
    if(sep>bestSep){bestSep=sep;best={C:C,Q:Q,MM:MM};}
    if(sep>560*SQ)break;}
  lisserRaccords(best.C);adoucirCretes(best.C,1);
  for(const k in best.Q){const o=best.Q[k];let bi=0,bd=1e18;for(let j=0;j<best.C.length;j++){const d=best.C[j].distanceToSquared(o.p);if(d<bd){bd=d;bi=j;}}o.p.copy(best.C[bi]);}
  CY.Q=best.Q;CY.sep=Math.round(bestSep);
  for(const m of best.MM||[])MODMARK.push(m); // (2026-10-18) LES MODULES DE CHAQUE MAP : ceux de l'essai gardé (voir cSlalom)
  return best.C;
}
/* LES BRUITS PARTAGÉS (une fois par session) — deux textures RGBA8 256², et les MÊMES octets côté processeur : `CY.rnd` (des tirages bruts,
   lus au texel près : les buttes) et `CY.nz` (quatre bruits fbm qui se répètent, lus en bilinéaire : les corniches, le grain). */
function cyBruits(){ if(CY.nz)return;
  const N=256,rd=new Uint8Array(N*N*4),r=mulberry32(0xC4A170);for(let i=0;i<rd.length;i++)rd[i]=(r()*256)|0;
  const nz=new Uint8Array(N*N*4),g=mulberry32(0x5A4D);
  for(let c=0;c<4;c++){const F=[4,8,16,32][c],lat=[];for(let o=0;o<4;o++){const f=F<<o,a=new Float32Array(f*f);for(let i=0;i<a.length;i++)a[i]=g();lat.push([f,a]);}
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=0,am=.5,tt=0;
      for(const L9 of lat){const f=L9[0],a=L9[1],u=x/N*f,w=y/N*f,i=Math.floor(u),j=Math.floor(w),fu=u-i,fw=w-j,su=fu*fu*(3-2*fu),sw=fw*fw*(3-2*fw);
        const A=a[(j%f)*f+(i%f)],B9=a[(j%f)*f+((i+1)%f)],C9=a[((j+1)%f)*f+(i%f)],D9=a[((j+1)%f)*f+((i+1)%f)];
        v+=am*(A+(B9-A)*su+(C9-A)*sw+(A-B9-C9+D9)*su*sw);tt+=am;am*=.5;}
      nz[(y*N+x)*4+c]=Math.max(0,Math.min(255,Math.round(((v/tt-.5)*1.7+.5)*255)));}}
  const mk=(d,lin)=>{const t=new THREE.DataTexture(d,N,N,THREE.RGBAFormat,THREE.UnsignedByteType);t.wrapS=t.wrapT=THREE.RepeatWrapping;
    t.magFilter=t.minFilter=lin?THREE.LinearFilter:THREE.NearestFilter;t.generateMipmaps=false;if(lin){t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;}t.needsUpdate=true;return t;};
  CY.rnd=rd;CY.nz=nz;CY.tRnd=mk(rd,false);CY.tNz=mk(nz,true);
  CY.tStr=cyStrates();}
function cyNz(u,v,c){ // le bruit `CY.nz` lu comme la puce (bilinéaire, répété) — u, v en tuiles (1 = 256 texels)
  const N=256,x=u*N-.5,y=v*N-.5,i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,d=CY.nz,i0=((i%N)+N)%N,j0=((j%N)+N)%N,i1=(i0+1)%N,j1=(j0+1)%N;
  const a=d[(j0*N+i0)*4+c],b=d[(j0*N+i1)*4+c],e=d[(j1*N+i0)*4+c],f=d[(j1*N+i1)*4+c];
  return ((a+(b-a)*fx)*(1-fy)+(e+(f-e)*fx)*fy)/255;}
/* LES STRATES — une colonne de 1 024 couches (un texel = 2,3 m : ~2,4 km de roche, répétée) : des GRÈS MASSIFS (crème, jaune beurre,
   saumon, corail, blanc de calcaire : les falaises) séparés de LITS MINCES (rose, brique, lavande, ocre, magenta : les talus). Le jaune et le
   rose d'abord (Sacha) ; le corail et la brique en accents. sRGB dans la texture (décodé au carré dans le shader) ; A = « massif » (le litage oblique). */
function cyStrates(){
  const N=1024,d=new Uint8Array(N*4),r=mulberry32(0x57A7A);
  /* (2026-10-17, continuité des maps — « la colorimétrie et les textures ») LA ROCHE EN TERRES : les lits ROSE, MAGENTA et ROSE PÂLE, poussés au fluo par
     la chaîne de saturation (×1,55), faisaient des rayures roses sur toutes les falaises ; ils deviennent VIEUX ROSE, LIE-DE-VIN et PÊCHE, la lavande
     un GRIS-VIOLET froid (l'ombre commune des maps), le corail une TERRE CUITE. Mêmes lits, mêmes épaisseurs (le tirage ne bouge pas). */
  const MAS=[[244,228,204,16,38],[240,204,132,12,30],[236,172,138,10,24],[232,190,152,8,20],[212,126,88,7,16],[246,236,224,6,14],[236,212,166,10,26]];
  const MIN=[[208,150,138,3,10],[166,82,62,3,9],[156,148,166,2,7],[214,166,92,3,10],[164,96,90,1,3],[230,170,142,2,6]];
  let y=0,mas=true;
  while(y<N){
    const L9=mas?MAS[Math.floor(r()*MAS.length)]:MIN[Math.floor(r()*MIN.length)],t=Math.max(!mas?4:0,Math.round(L9[3]+r()*(L9[4]-L9[3]))); // (matière) un lit mince n'est plus un trait de 2 m
    const sub=2+Math.floor(r()*3);
    for(let k=0;k<t&&y<N;k++,y++){const v=1+(mas?.04*Math.sin(k/sub*3.1+r()*.6):.03*(r()-.5)),o=y*4;
      d[o]=Math.min(255,Math.round(L9[0]*v));d[o+1]=Math.min(255,Math.round(L9[1]*v));d[o+2]=Math.min(255,Math.round(L9[2]*v));d[o+3]=mas?255:0;}
    mas=mas?false:(r()<.55);} // après une falaise : un ou deux lits minces
  const t=new THREE.DataTexture(d,1,N,THREE.RGBAFormat,THREE.UnsignedByteType);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;{t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;}t.needsUpdate=true;
  return t;}
/* ---- LE MONDE : appelé en fin de buildTrack (no-op hors du canyon) ---- */
function cyEteindre(){CY.on=false;if(CY.mesh)CY.mesh.visible=false;if(CY.grp)CY.grp.visible=false;}
/* LA CONSTRUCTION EN DEUX TEMPS (2026-10-14, CANYON) — MESURÉ (banc processeur, piste de 19 km au palier 0) : ~0,65 s de calcul (le
   plateau ~0,16, la taille fine ~0,28, l'ombre ~0,06…), 1,1 s pour la piste de 40 km de fin de partie — au portail, c'était un GEL (la
   règle d'OPTIMISATION : ≤ 250 ms). Désormais : les échantillons de la route ici (~20 ms), le MONDE (plateau, taille, ombre, monuments)
   dans un TRAVAILLEUR à part (`cyTravailleur` : les mêmes fonctions, recopiées par leur source — la collision et la puce lisent les MÊMES
   données), puis `cyMondePose` (textures, maillages) quand il répond. En course, le relief apparaît ~0,6 s après le portail, pendant le
   fondu sombre ; hors course (sous le voile du JOUER, au banc) ou sans travailleur, le calcul se fait tout de suite, ici. */
function buildCanyon(seed){
  cyEteindre();CY.job=(CY.job||0)+1;
  if(PARK.on||!LVL.cur||LVL.cur.piste!=='canyon'||!(NP>1)||!CANYON_OK)return;
  const t0=performance.now(),LV=lvPiste(),K=Math.sqrt(LV),r=mulberry32((seed^0xCA4F0A)>>>0);
  cyBruits();cyTerrain();
  // ---- 1. LES ÉCHANTILLONS : la route tous les 8 m ----
  const DS=8,NS=Math.max(3,Math.floor(L/DS)+1),st9=L/(NP-1),A=n=>new Float32Array(n);
  const S={n:NS,ds:DS,x:A(NS),z:A(NS),y:A(NS),tx:A(NS),tz:A(NS),wF:A(NS),wW:A(NS),wR:A(NS),H:A(NS),D:A(NS),F:A(NS),R:A(NS),V:A(NS),zS:A(NS),zA:A(NS),zH:A(NS),as:A(NS),aw:A(NS),fo:A(NS),st:A(NS),RE:A(NS)};
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(let i=0;i<NS;i++){const s9=Math.min(L,i*DS),f=s9/st9,k=Math.min(NP-2,Math.floor(f)),u=f-k,a=pts[k],b=pts[k+1];
    S.x[i]=a.x+(b.x-a.x)*u;S.y[i]=a.y+(b.y-a.y)*u;S.z[i]=a.z+(b.z-a.z)*u;const tx=b.x-a.x,tz=b.z-a.z,tl=Math.hypot(tx,tz)||1;S.tx[i]=tx/tl;S.tz[i]=tz/tl;
    if(S.x[i]<x0)x0=S.x[i];if(S.x[i]>x1)x1=S.x[i];if(S.z[i]<z0)z0=S.z[i];if(S.z[i]>z1)z1=S.z[i];}
  S.bb=[x0,x1,z0,z1];
  // ---- 2. LES SECTIONS (repères de genCanyon → leur abscisse) et le profil de chaque tronçon, fondu d'une clé à l'autre ----
  const sQ={};if(CY.Q)for(const k in CY.Q){const p=CY.Q[k].p;let bi=0,bd=1e18;for(let i=0;i<NS;i++){const d=(S.x[i]-p.x)**2+(S.y[i]-p.y)**2+(S.z[i]-p.z)**2;if(d<bd){bd=d;bi=i;}}sQ[k]=bi*DS;}
  const KEYS=[],q=k=>sQ[k]!=null?sQ[k]:null,key=(s9,o)=>{if(s9!=null&&isFinite(s9))KEYS.push([Math.max(0,Math.min(L,s9)),o]);};
  const B0={wF:140,H:0,st:.4,V:1,D:78,zS:0,zA:0,zH:0,aw:30},G=o=>Object.assign({},B0,{V:0},o);
  key(0,B0);key(q('breche0'),B0);
  {const a=q('breche0'),b=q('breche1');if(a!=null&&b!=null)key(a+(b-a)*.55,G({wF:150,H:280,st:.34,V:.35,D:96}));}
  key(q('breche1'),G({wF:118,H:460,st:.30,V:.12,D:110}));key(q('bosses'),G({wF:112,H:640,st:.30,V:.06}));
  key(q('fer0'),G({wF:130,H:700,st:.28}));key(q('fer1'),G({wF:128,H:760,st:.28}));
  {const e0=q('etroit0'),e1=q('etroit1');if(e0!=null){key(e0-280,G({wF:108,H:640,st:.30}));key(e0,G({wF:46,H:420,st:.07,D:74,zS:1,aw:8}));}
   if(e1!=null){key(e1,G({wF:46,H:420,st:.07,D:74,zS:1,aw:8}));key(e1+220,G({wF:104,H:600,st:.26}));}}
  key(q('arche0'),G({wF:98,H:620,st:.22,zA:1}));key(q('arche1'),G({wF:98,H:620,st:.22,zA:1}));
  {const a0=q('amphi0'),a1=q('amphi1');if(a0!=null){key(a0-170,G({wF:118,H:600,st:.30}));key(a0+140,G({wF:235,H:560,st:.92,V:.30,zH:1,aw:60}));}
   if(a1!=null){key(a1,G({wF:235,H:560,st:.92,V:.30,zH:1,aw:60}));key(a1+260,G({wF:124,H:820,st:.32,V:.08}));}}
  key(q('chameau'),G({wF:136,H:940,st:.32}));key(q('finale0'),G({wF:132,H:1050,st:.30}));key(L,G({wF:140,H:1150,st:.30}));
  KEYS.sort(function(a,b){return a[0]-b[0];});CY.sQ=sQ;
  const ph=[r()*6.28,r()*6.28,r()*6.28,r()*6.28,r()*6.28],K6=Math.pow(LV,.3),K4=Math.pow(LV,.2);let kk=0;
  // LA GARDE DES RACCOURCIS (2026-10-15) : l'approche, le 1er demi-tour et la sortie de chaque boucle gardent les parois d'avant — serrées là,
  // une arête de roche monterait entre la zone de saut et la sortie, 94 m plus loin, et le raccourci deviendrait un mur. Fondu sur 120 m.
  const GD=new Float32Array(NS);
  for(const k0 in sQ){const m=/^(rac[A-Z])0$/.exec(k0);if(!m)continue;const nm=m[1],iv=[[sQ[nm+'0']-60,sQ[nm+'1']+450],[sQ[nm+'2']-60,sQ[nm+'3']+60]];
    for(const v9 of iv){if(!isFinite(v9[0])||!isFinite(v9[1]))continue;const i0=Math.max(0,Math.floor((v9[0]-120)/DS)),i1=Math.min(NS-1,Math.ceil((v9[1]+120)/DS));
      for(let i=i0;i<=i1;i++){const s9=i*DS,d=s9<v9[0]?v9[0]-s9:s9>v9[1]?s9-v9[1]:0,g=Math.max(0,1-d/120);if(g>GD[i])GD[i]=g;}}}
  for(let i=0;i<NS;i++){const s9=i*DS;while(kk<KEYS.length-2&&KEYS[kk+1][0]<s9)kk++;const a=KEYS[kk],b=KEYS[Math.min(KEYS.length-1,kk+1)];
    let u=b[0]>a[0]?(s9-a[0])/(b[0]-a[0]):1;u=Math.max(0,Math.min(1,u));u=u*u*u*(u*(u*6-15)+10);const v=f=>a[1][f]+(b[1][f]-a[1][f])*u;
    const zS=v('zS'),zA=v('zA'),zH=v('zH');S.zS[i]=zS;S.zA[i]=zA;S.zH[i]=zH;S.V[i]=v('V');S.st[i]=v('st');S.aw[i]=v('aw')*K;
    S.wF[i]=(v('wF')*(1-zS)*K+v('wF')*zS*(1+.45*(K-1)))*(1+(.16*Math.sin(s9/530+ph[0])+.08*Math.sin(s9/173+ph[1]))*(1-zS));
    S.H[i]=v('H')*K6*(1+.12*Math.sin(s9/910+ph[2]));S.D[i]=v('D')*K4;S.as[i]=.24*Math.sin(s9/760+ph[3])*(1-zS)*(1-.5*zA);
    let kS=0;
    {kS=(1-zS)*(1-GD[i])*(1-zH); // (2026-10-15, 2e serrage, Sacha : « encore plus proche de la route ») hors Étroits, raccourcis et amphithéâtre : pied à 24 m, excès gardé à 6 %, parois DEUX fois plus raides
      const b9=CY_SERRE.pied+(CY_SERRE.pied2-CY_SERRE.pied)*kS,ex=Math.max(0,S.wF[i]-b9)*(CY_SERRE.k+(CY_SERRE.k2-CY_SERRE.k)*kS)/Math.sqrt(K); // (2026-10-15, Sacha : « les parois doivent être plus proches encore de la route ») LE CANYON SERRÉ : le pied des parois à 30 m de l'axe (2 m du bord), seul l'EXCÈS se garde au quart — et il ne gonfle plus avec le palier (les rayons, eux, si)
      const k9=1-zS;S.as[i]*=1-k9+k9*ex/Math.max(1,b9+ex);S.wF[i]+=(b9+ex-S.wF[i])*k9;S.aw[i]*=1-.7*k9-.15*kS;} // les ÉTROITS (zS) gardent leur fente : elle ondule de ±8 m et monte à pic, son couloir a déjà ses murs collés // les alcôves (le bruit qui recule la roche) : 9 m au lieu de 30
    S.wR[i]=Math.min(S.wF[i]-5,(16+9*Math.sin(s9/310+ph[4]))*K*(1-zS)+(S.wF[i]-5)*zS);S.wW[i]=Math.max(10,S.H[i]*S.st[i]*(1-(1-CY_SERRE.raide)*kS));} // (raide : la paroi atteint la hauteur de la route ~8 m après le bord au lieu de ~30)
  if(TUN2_ON){const a=L-CY_TUN2.ev0-60,b=L-CY_TUN2.ev1; /* (2026-10-19) LE TUNNEL DE GRÈS : la roche s'écarte de la SALLE DU PORTAIL (le dôme fait 78 m de large) — le pied des parois à 106 m de l'axe, sans asymétrie ni alcôve, sur 140 m de fondu (rien ne la traverse : dbgTunnel('test')) */
    for(let i=Math.max(0,Math.floor(a/DS));i<NS;i++){let u=(i*DS-a)/(b-a);u=u<0?0:u>1?1:u;u=u*u*(3-2*u);if(u<=0)continue;S.wF[i]+=(Math.max(S.wF[i],CY_TUN2.A+28)-S.wF[i])*u;S.as[i]*=1-u;S.aw[i]*=1-u;}}
  // ---- 3. LA RIVIÈRE : jamais plus haut qu'en amont, en vasques et en cascades ----
  {let mn=1e9,Lp=null,p0=0;const stepH=22*K;
   for(let i=0;i<NS;i++){mn=Math.min(mn,S.y[i]-S.D[i]);
     if(Lp===null||mn<Lp-stepH||(i-p0>Math.round(420/DS)&&mn<Lp-2)){if(Lp!==null&&Lp-mn>3){for(let k=Math.max(0,i-1);k<Math.min(NS,i+4);k++)S.fo[k]=1;}Lp=mn;p0=i;} // une CASCADE : l'écume au pied
     S.F[i]=Lp;}}
  // le PLATEAU voulu (le haut des parois), lissé sur ±300 m ; la PORTÉE de chaque échantillon (jusqu'où il creuse)
  {const w=Math.round(300/DS),c=new Float64Array(NS+1);for(let i=0;i<NS;i++)c[i+1]=c[i]+S.F[i]+S.H[i];
   for(let i=0;i<NS;i++){const a=Math.max(0,i-w),b=Math.min(NS,i+w+1);S.R[i]=(c[b]-c[a])/(b-a);}}
  let reach=0;for(let i=0;i<NS;i++){S.RE[i]=S.wF[i]*(1+Math.abs(S.as[i]))+S.wW[i]+160*K+S.aw[i];if(S.RE[i]>reach)reach=S.RE[i];}S.reach=reach;
  CY.rac=[];for(const nm of Object.keys(sQ).filter(function(k){return /^rac[A-Z]0$/.test(k);}).map(function(k){return k.slice(0,4);}).sort()){const a0=sQ[nm+'0'],a1=sQ[nm+'1'],b0=sQ[nm+'2'],b1=sQ[nm+'3'];if(a0==null||a1==null||b0==null||b1==null)continue;
    const o={nm:nm,haut:[a0,a1],bas:[b0,b1],gain:Math.round(b0-a1),dh:1e9,lat:0,ecart:[]};
    for(let s9=a0;s9<=a1;s9+=40){const i=Math.min(NS-1,Math.round(s9/DS));let bj=-1,bd=1e18;for(let j=Math.round(b0/DS);j<=Math.min(NS-1,Math.round(b1/DS));j++){const d=(S.x[j]-S.x[i])**2+(S.z[j]-S.z[i])**2;if(d<bd){bd=d;bj=j;}}
      if(bj<0)continue;const lat=Math.sqrt(bd),dh=S.y[i]-S.y[bj];o.ecart.push([Math.round(s9),Math.round(lat),Math.round(dh)]);if(lat<120&&dh<o.dh){o.dh=Math.round(dh);o.lat=Math.round(lat);o.cote=Math.sign((S.x[bj]-S.x[i])*-S.tz[i]+(S.z[bj]-S.z[i])*S.tx[i]);}}
    CY.rac.push(o);}
  CY.cou=(sQ.etroit0!=null&&sQ.etroit1!=null)?[sQ.etroit0,sQ.etroit1]:null;CY.couT=null;
  CY.mine=(sQ.mine0!=null&&sQ.mine1!=null&&sQ.mine1-sQ.mine0>200)?[sQ.mine0,sQ.mine1]:null;CY.mineT=null; // LA MINE abandonnée (cyMine)
  CY.tun=[Math.max(0,L-CY_TUN.l),L+60];CY.tunT=null; // LE TUNNEL d'arrivée : ses derniers mètres de route (et un peu au-delà du bout)
  CY.S=S;CY.ms={ech:Math.round(performance.now()-t0)};
  const bio9=BIOMES[(LVL.cur.bio&&LVL.cur.bio[0])||'canyonSoir']||BIOMES.canyonSoir,cA=bio9.cyA||[6,-110,0,0];
  const opt={K:K,seed:seed,L:L,RH:ROAD_HALF,sQ:sQ,sun:[cA[0],cA[1]],pal:{cyPlat:PAL.b('cyPlat',64),cyFin:PAL.b('cyFin',12),cyOmbre:PAL.b('cyOmbre',27),cyChem:PAL.b('cyChem',300)}};
  CY.t0=t0;
  const W=started&&!/[?&]cyw=0\b/.test(location.search)?cyTravailleur():null;
  if(W){const job=CY.job;CY.attente={job:job,S:S,opt:opt};try{W.postMessage({job:job,S:S,opt:opt,nz:CY.nz,rnd:CY.rnd});return;}catch(e){console.warn('canyon : travailleur',e);CY.attente=null;}}
  cyMondePose(cyMondeCalc(S,opt));
}
/* le travailleur : les fonctions du MONDE recopiées par leur source (une seule écriture : elles servent aussi ici, à la collision) */
function cyTravailleur(){if(CY.w!==undefined)return CY.w;
  try{const fns=[mulberry32,cyNz,cyBil,cyButteDe,cyButtesH,cyHauteur,cyHauteurVite,cyProfil,cyOmbre,cyMitaines,cyMonuPrevoir,cyMondeCalc].map(function(f){return f.toString();}).join('\n');
    const code="'use strict';var CY={},CY_O9={},L=0,ROAD_HALF=28,PAL={B:{},b:function(k,d){return PAL.B[k]!=null?PAL.B[k]:d;}};\n"+fns+
      "\nonmessage=function(e){var m=e.data;CY={nz:m.nz,rnd:m.rnd};PAL.B=m.opt.pal;L=m.opt.L;ROAD_HALF=m.opt.RH;var R=cyMondeCalc(m.S,m.opt);R.job=m.job;"+
      "postMessage(R,[R.Z.d.buffer,R.F.c.buffer,R.F.m.buffer,R.O.h.buffer,R.qw.d.buffer,R.bg.i.buffer]);};";
    const W=new Worker(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));
    W.onmessage=function(e){const R=e.data;if(!CY.attente||R.job!==CY.job)return;CY.attente=null;try{cyMondePose(R);}catch(er){console.warn('canyon : pose',er);}};
    W.onerror=function(e){console.warn('canyon : travailleur en erreur',e.message);CY.w=null;const a=CY.attente;CY.attente=null;if(a&&a.job===CY.job)try{cyMondePose(cyMondeCalc(a.S,a.opt));}catch(er){console.warn('canyon',er);}};
    CY.w=W;}catch(e){CY.w=null;}
  return CY.w;}
/* LE MONDE (ici ou dans le travailleur) : n'utilise que CY.nz, CY.rnd, ses arguments et les fonctions recopiées — rend tout ce que la pose
   et la collision lisent */
function cyMondeCalc(S,opt){
  const K=opt.K,sQ=opt.sQ,NS=S.n,DS=S.ds,x0=S.bb[0],x1=S.bb[1],z0=S.bb[2],z1=S.bb[3],reach=S.reach,RE=S.RE,ms={},r=mulberry32((opt.seed^0x51ED7A)>>>0);
  // ---- 4. LE PLATEAU (grossier, jusqu'à 7,5 km) : la marche de l'escalier, le fond (pour la brume et l'ombre du ciel), la densité de buttes, la roche des escarpements ----
  const t1=performance.now(),TZ=PAL.b('cyPlat',64),MZ=7500,STP=250*Math.sqrt(K);
  const Z={ts:TZ,x0:x0-MZ,z0:z0-MZ},znx=Math.ceil((x1-x0+2*MZ)/TZ)+1,znz=Math.ceil((z1-z0+2*MZ)/TZ)+1;Z.nx=znx;Z.nz=znz;
  const zi=new Int32Array(znx*znz).fill(-1),zd=new Float32Array(znx*znz).fill(1e18),RZ=1500;
  for(let i=0;i<NS;i+=6){const cx=(S.x[i]-Z.x0)/TZ,cz=(S.z[i]-Z.z0)/TZ,rr=Math.ceil(RZ/TZ);
    for(let jz=Math.max(0,Math.floor(cz-rr));jz<=Math.min(znz-1,Math.ceil(cz+rr));jz++)for(let jx=Math.max(0,Math.floor(cx-rr));jx<=Math.min(znx-1,Math.ceil(cx+rr));jx++){
      const ex=jx-cx,ez=jz-cz,d2=(ex*ex+ez*ez)*TZ*TZ;if(d2>RZ*RZ)continue;const o=jz*znx+jx;if(d2<zd[o]){zd[o]=d2;zi[o]=i;}}}
  for(let o=0;o<zd.length;o++)if(zi[o]>=0)zd[o]=Math.sqrt(zd[o]);
  {let X9=0,Z9=0;const pr=(o,o2)=>{const i=zi[o2];if(i<0||i===zi[o])return;const ex=X9-S.x[i],ez=Z9-S.z[i],d=ex*ex+ez*ez;if(d<zd[o]*zd[o]){zd[o]=Math.sqrt(d);zi[o]=i;}}; // le plus proche, propagé à tout le plateau (deux passes)
   for(let jz=0;jz<znz;jz++){Z9=Z.z0+jz*TZ;for(let jx=0;jx<znx;jx++){X9=Z.x0+jx*TZ;const o=jz*znx+jx;if(jx>0)pr(o,o-1);if(jz>0){pr(o,o-znx);if(jx>0)pr(o,o-znx-1);if(jx<znx-1)pr(o,o-znx+1);}}}
   for(let jz=znz-1;jz>=0;jz--){Z9=Z.z0+jz*TZ;for(let jx=znx-1;jx>=0;jx--){X9=Z.x0+jx*TZ;const o=jz*znx+jx;if(jx<znx-1)pr(o,o+1);if(jz<znz-1){pr(o,o+znx);if(jx<znx-1)pr(o,o+znx+1);if(jx>0)pr(o,o+znx-1);}}}}
  const zdat=new Float32Array(znx*znz*4),rq=new Float32Array(znx*znz);
  let yMax=-1e9;
  for(let jz=0;jz<znz;jz++)for(let jx=0;jx<znx;jx++){const o=jz*znx+jx,i=Math.max(0,zi[o]),x=Z.x0+jx*TZ,z=Z.z0+jz*TZ,d=zd[o];
    const hp=S.R[i]-S.F[i],wq=hp<150?0:hp>420?1:(hp-150)/270,Rd=S.R[i]+(150*(cyNz(x/5200,z/5200,0)-.5)+60*(cyNz(x/1700,z/1700,1)-.5))*wq,u=(Rd+STP*.5)/STP,fu=u-Math.floor(u),e=fu<.86?0:(fu-.86)/.14;
    rq[o]=Math.max(S.F[i]+4,Rd+((Math.floor(u)+e*e*(3-2*e))*STP-Rd)*wq); // L'ESCALIER : une marche tous les ~250 m (l'escarpement dans les derniers 14 %), seulement là où les parois sont hautes — la vallée reste plate, le plateau jamais sous la rivière
    zdat[o*4]=rq[o];zdat[o*4+1]=S.F[i]; // (l'ondulation du plateau, ±16 m et ±6 m, est ajoutée au SOMMET et dans cyHauteur : deux lectures de bruit de moins par case)
    zdat[o*4+2]=S.V[i]*(d>650*K?1:d<330*K?0:(d-330*K)/(320*K))+.07*(d>2400?1:d<1200?0:(d-1200)/1200);if(zdat[o*4]>yMax)yMax=zdat[o*4];}
  for(let jz=0;jz<znz;jz++)for(let jx=0;jx<znx;jx++){const o=jz*znx+jx,gx=(rq[jz*znx+Math.min(znx-1,jx+1)]-rq[jz*znx+Math.max(0,jx-1)])/(2*TZ),gz=(rq[Math.min(znz-1,jz+1)*znx+jx]-rq[Math.max(0,jz-1)*znx+jx])/(2*TZ);
    zdat[o*4+3]=Math.min(1,Math.sqrt(gx*gx+gz*gz)/.9);}
  Z.d=zdat;CY.Z=Z;
  // les BUTTES : chaque case de 760 m où il en naît une marque son voisinage (le shader ne les cherche que là où la densité est > 0,3 %)
  const CS=760,cx0=Math.floor(Z.x0/CS)-1,cx1=Math.floor((Z.x0+znx*TZ)/CS)+1,cz0=Math.floor(Z.z0/CS)-1,cz1=Math.floor((Z.z0+znz*TZ)/CS)+1;CY.buttes=[];
  const BG={cx0:cx0,cz0:cz0,nx:cx1-cx0+1,nz:cz1-cz0+1};BG.i=new Int32Array(BG.nx*BG.nz).fill(-1);CY.bg=BG;
  for(let cz=cz0;cz<=cz1;cz++)for(let cx=cx0;cx<=cx1;cx++){const b=cyButteDe(cx,cz);if(!b)continue;BG.i[(cz-cz0)*BG.nx+(cx-cx0)]=CY.buttes.length;CY.buttes.push(b);const rr=b.rad*1.95;
    for(let jz=Math.max(0,Math.floor((b.z-rr-Z.z0)/TZ));jz<=Math.min(znz-1,Math.ceil((b.z+rr-Z.z0)/TZ));jz++)for(let jx=Math.max(0,Math.floor((b.x-rr-Z.x0)/TZ));jx<=Math.min(znx-1,Math.ceil((b.x+rr-Z.x0)/TZ));jx++){const o=(jz*znx+jx)*4+2;if(zdat[o]<.004)zdat[o]=.004;}
    if(b.z0+b.ht>yMax)yMax=b.z0+b.ht;}
  ms.plat=Math.round(performance.now()-t1);
  // ---- 5. LA TAILLE FINE (12 m) : le lit, l'eau, les berges, les parois — et la ripisylve, l'écume ----
  const t2=performance.now(),TF=PAL.b('cyFin',12),ME=reach+80;
  const F={ts:TF,x0:x0-ME,z0:z0-ME},fnx=Math.ceil((x1-x0+2*ME)/TF)+1,fnz=Math.ceil((z1-z0+2*ME)/TF)+1;F.nx=fnx;F.nz=fnz;
  const fc=new Float32Array(fnx*fnz*2),fm=new Uint8Array(fnx*fnz*4);for(let o=0;o<fnx*fnz;o++){fc[o*2]=1e5;fc[o*2+1]=-1e5;}
  // la grille d'accès (32 m) : pour chaque case, les deux échantillons les plus proches de deux BRAS différents de la route
  const TQ=32,qnx=Math.ceil((fnx*TF)/TQ)+1,qnz=Math.ceil((fnz*TF)/TQ)+1,q1=new Int32Array(qnx*qnz).fill(-1),q2=new Int32Array(qnx*qnz).fill(-1),d1=new Float32Array(qnx*qnz).fill(1e9),d2=new Float32Array(qnx*qnz).fill(1e9),LEG=Math.round(560/DS);
  for(let i=0;i<NS;i+=4){const cx=(S.x[i]-F.x0)/TQ,cz=(S.z[i]-F.z0)/TQ,R9=RE[i]+48,rr=Math.ceil(R9/TQ);
    for(let jz=Math.max(0,Math.floor(cz-rr));jz<=Math.min(qnz-1,Math.ceil(cz+rr));jz++)for(let jx=Math.max(0,Math.floor(cx-rr));jx<=Math.min(qnx-1,Math.ceil(cx+rr));jx++){
      const ex=jx-cx,ez=jz-cz,dq=(ex*ex+ez*ez)*TQ*TQ;if(dq>R9*R9)continue;const d=Math.sqrt(dq),o=jz*qnx+jx;
      if(q1[o]<0||Math.abs(i-q1[o])<LEG){if(d<d1[o]){d1[o]=d;q1[o]=i;}}
      else if(d<d1[o]){q2[o]=q1[o];d2[o]=d1[o];q1[o]=i;d1[o]=d;}
      else if((q2[o]<0||Math.abs(i-q2[o])<LEG||d<d2[o])&&d<d2[o]){q2[o]=i;d2[o]=d;}}}
  const qw=new Float32Array(qnx*qnz);for(let jz=0;jz<qnz;jz++)for(let jx=0;jx<qnx;jx++){const x=F.x0+jx*TQ,z=F.z0+jz*TQ;qw[jz*qnx+jx]=(cyNz(x/260,z/260,1)-.5)*2+(cyNz(x/90,z/90,2)-.5)*.6;}
  CY.qw={d:qw,nx:qnx,nz:qnz,ts:TQ,x0:F.x0,z0:F.z0};
  const prof={};let nc=0;
  for(let jz=0;jz<fnz;jz++)for(let jx=0;jx<fnx;jx++){const qo=Math.min(qnz-1,Math.round(jz*TF/TQ))*qnx+Math.min(qnx-1,Math.round(jx*TF/TQ));
    if(q1[qo]<0)continue;const x=F.x0+jx*TF,z=F.z0+jz*TF;let best=1e9,bo=0,bdep=0,brk=0,bveg=0,bfo=0;
    for(let c=0;c<2;c++){const i0=c?q2[qo]:q1[qo];if(i0<0||(c&&d2[qo]>RE[i0]+48))continue;if(!cyProfil(S,RE,i0,x,z,prof))continue;
      if(prof.C<best){best=prof.C;bo=1;bdep=prof.dep;brk=prof.rk;bveg=prof.veg;bfo=prof.fo;}}
    if(!bo)continue;nc++;const o=jz*fnx+jx;fc[o*2]=best;
    fm[o*4]=Math.min(255,Math.round(bdep*10));fm[o*4+1]=Math.round(brk*255);fm[o*4+2]=Math.round(bveg*255);fm[o*4+3]=Math.round(bfo*255);}
  F.c=fc;F.m=fm;CY.F=F;ms.fin=Math.round(performance.now()-t2);ms.texels=nc;
  cyMonuPrevoir(S,sQ,K,r);try{cyMitaines(S,F,sQ,K,r);}catch(e){}
  // ---- 6. L'OMBRE : la hauteur sous laquelle on est à l'ombre, balayée une fois dans le sens du soleil de l'heure ----
  const t3=performance.now();cyOmbre(opt.sun[0],opt.sun[1]);ms.ombre=Math.round(performance.now()-t3);
  let fMin=1e9;for(let i=0;i<NS;i++)if(S.F[i]<fMin)fMin=S.F[i];
  return {Z:Z,F:F,O:CY.O,qw:CY.qw,bg:BG,buttes:CY.buttes,arche:CY.arche,chem:CY.chem,mit:CY.mit,yMin:fMin-60,yMax:Math.max(yMax,CY.yMaxM)+60,ms:ms};
}
/* LA POSE : les données du monde dans CY (la collision), à la puce (quatre textures), les monuments — et le relief s'allume */
function cyMondePose(R){
  if(!CY.mat||!(LVL.cur&&LVL.cur.piste==='canyon'))return;const t4=performance.now();
  CY.Z=R.Z;CY.F=R.F;CY.O=R.O;CY.qw=R.qw;CY.bg=R.bg;CY.buttes=R.buttes;CY.arche=R.arche;CY.chem=R.chem||[];CY.mit=R.mit;CY.yMin=R.yMin;CY.yMax=R.yMax;Object.assign(CY.ms,R.ms);
  const F=R.F,Z=R.Z,O=R.O;
  const dt=(d,w,h,fmt,typ,inf)=>{const t=new THREE.DataTexture(d,w,h,fmt,typ);if(inf)t.internalFormat=inf;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;return t;};
  for(const k of ['tC','tM','tZ','tS'])if(CY[k])CY[k].dispose();
  CY.tC=dt(F.c,F.nx,F.nz,THREE.RGFormat,THREE.FloatType,'RG32F'); /* r128 ne connaît pas RG + flottant : sans le format nommé, la texture n'arrive JAMAIS à la puce (les parois disparaissaient) */CY.tM=dt(F.m,F.nx,F.nz,THREE.RGBAFormat,THREE.UnsignedByteType);
  CY.tZ=dt(Z.d,Z.nx,Z.nz,THREE.RGBAFormat,THREE.FloatType);CY.tS=dt(O.h,O.nx,O.nz,THREE.RedFormat,THREE.FloatType,'R32F');
  const U=CY.mat.uniforms;U.uTC.value=CY.tC;U.uTM.value=CY.tM;U.uTZ.value=CY.tZ;U.uTS.value=CY.tS;
  U.uFD.value.set(F.x0-F.ts*.5,F.z0-F.ts*.5,1/(F.nx*F.ts),1/(F.nz*F.ts));U.uFN.value.set(F.nx,F.nz);
  U.uZD.value.set(Z.x0-Z.ts*.5,Z.z0-Z.ts*.5,1/(Z.nx*Z.ts),1/(Z.nz*Z.ts));U.uZN.value.set(Z.nx,Z.nz);
  U.uSD.value.set(O.x0-O.ts*.5,O.z0-O.ts*.5,1/(O.nx*O.ts),1/(O.nz*O.ts));U.uSN.value.set(O.nx,O.nz);
  CY.on=true;CY.mesh.visible=true;
  try{cyMonuments(CY.job);}catch(e){console.warn('canyon : monuments',e);}
  CY.ms.pose=Math.round(performance.now()-t4);CY.ms.total=Math.round(performance.now()-(CY.t0||t4));
}
/* le profil en travers à la position (x, z), vu depuis l'échantillon i0 (affiné ±6 échantillons) — renvoie faux hors de portée */
function cyProfil(S,RE,i0,x,z,o){
  let bd=1e18,bj=-1,bu=0;const a=Math.max(0,i0-4),b=Math.min(S.n-2,i0+4);
  for(let j=a;j<=b;j++){const ax=S.x[j],az=S.z[j],dx=S.x[j+1]-ax,dz=S.z[j+1]-az,l2=dx*dx+dz*dz||1;let u=((x-ax)*dx+(z-az)*dz)/l2;u=u<0?0:u>1?1:u;
    const px=ax+dx*u-x,pz=az+dz*u-z,d=px*px+pz*pz;if(d<bd){bd=d;bj=j;bu=u;}}
  if(bj<0)return false;const j=bj,u=bu,j1=j+1,d=Math.sqrt(bd);
  if(d>RE[j]+20)return false;
  const tx=S.tx[j],tz=S.tz[j],side=((x-S.x[j])*tz-(z-S.z[j])*tx)>0?1:-1; // +1 = à droite de la route
  const v=1-u,wF0=(S.wF[j]*v+S.wF[j1]*u)*(1+side*(S.as[j]*v+S.as[j1]*u)),wR=S.wR[j]*v+S.wR[j1]*u,Fl=S.F[u<.5?j:j1],H=S.H[j]*v+S.H[j1]*u,wW=S.wW[j]*v+S.wW[j1]*u,zS=S.zS[j]*v+S.zS[j1]*u,zH=S.zH[j]*v+S.zH[j1]*u,aw=S.aw[j]*v+S.aw[j1]*u,s9=(j+u)*S.ds;
  const wF=zS<.5?Math.max(wF0,ROAD_HALF+5):wF0; // (2026-10-15) LE PIED DE PAROI ne passe jamais sous le bord + 5 m (sauf la fente des Étroits) : l'asymétrie, les alcôves et le 2e serrage s'additionnaient, la roche mordait la dalle
  const Q9=CY.qw,dd=d+(d>wR+4?cyBil(Q9.d,Q9.nx,Q9.nz,1,0,(x-Q9.x0)/Q9.ts+.5,(z-Q9.z0)/Q9.ts+.5)*aw:0)+zS*8*Math.sin(s9/36+side*1.3);
  o.dep=0;o.rk=0;o.veg=0;o.fo=0;
  if(dd<wR){const q=dd/wR;o.C=Fl-(1.2+2.6*(1-q*q));o.dep=Math.max(0,Fl-.7-o.C);o.fo=S.fo[j]*(1-q*.3);}
  else if(dd<wF){o.C=Fl+.10*(dd-wR)+1.6*(cyNz(x/40,z/40,3)-.5)*(1-zS);
    const vb=(dd>wR+1?1:0)*(dd<wR+34?1:Math.max(0,1-(dd-wR-34)/14))*(1-zS);o.veg=vb*(cyNz(x/60,z/60,0)>.42?1:.35);}
  else{const t=(dd-wF)/Math.max(8,wW),tt=Math.min(1,t);
    const gor=.5*Math.pow(tt,.75)+.5*(1-Math.pow(1-tt,1.8)),slot=Math.pow(tt,.45);
    o.C=Fl+H*(gor*(1-zS-zH)+slot*zS+tt*zH)+Math.max(0,dd-wF-wW)*2.4;o.rk=Math.min(1,t/.06);}
  return true;
}
/* la butte de la case (cx, cz) de 760 m — ou null : mêmes octets que le shader (CY.rnd au texel, la densité du plateau au texel du centre) */
function cyButteDe(cx,cz){const Z=CY.Z,R=CY.rnd,N=256,i0=((cx%N)+N)%N,j0=((cz%N)+N)%N,o=(j0*N+i0)*4;
  const ctx=(cx+.22+.56*R[o+1]/255)*760,ctz=(cz+.22+.56*R[o+2]/255)*760;
  const zx=Math.max(0,Math.min(Z.nx-1,Math.floor((ctx-(Z.x0-Z.ts*.5))/Z.ts))),zz=Math.max(0,Math.min(Z.nz-1,Math.floor((ctz-(Z.z0-Z.ts*.5))/Z.ts))),dc=Z.d[(zz*Z.nx+zx)*4+2];
  if(dc<.01||R[o]/255>dc*.85)return null;
  const i2=(((cx+101)%N)+N)%N,j2=(((cz+37)%N)+N)%N,o2=(j2*N+i2)*4,r1=R[o2]/255,r2=R[o2+1]/255;
  const rad=70+200*r1*r1,ht=(150+300*r2)*(rad<115?1.3:1);
  return {x:ctx,z:ctz,rad:rad,ht:ht,z0:Z.d[(zz*Z.nx+zx)*4],p3:R[o2+2]/255,p4:R[o2+3]/255};}
/* LE BALAYAGE DE L'OMBRE (grille de 18 m sur le domaine fin) : hS(p) = max(H, hS) relu 2 cases plus près du soleil − 2 cases × tan(hauteur).
   On parcourt les colonnes (ou les rangées) depuis le côté du soleil : la case relue est toujours déjà faite. */
function cyOmbre(elDeg,azDeg){const F=CY.F,TS=PAL.b('cyOmbre',27),nx=Math.ceil(F.nx*F.ts/TS)+1,nz=Math.ceil(F.nz*F.ts/TS)+1,O={ts:TS,x0:F.x0,z0:F.z0,nx:nx,nz:nz};
  const H=new Float32Array(nx*nz),M=new Float32Array(nx*nz),hS=new Float32Array(nx*nz);
  for(let jz=0;jz<nz;jz++)for(let jx=0;jx<nx;jx++)H[jz*nx+jx]=cyHauteurVite(O.x0+jx*TS,O.z0+jz*TS);
  const lever=(x,z,rr,y)=>{const i0=Math.max(0,Math.floor((x-rr-O.x0)/TS)),i1=Math.min(nx-1,Math.ceil((x+rr-O.x0)/TS)),j0=Math.max(0,Math.floor((z-rr-O.z0)/TS)),j1=Math.min(nz-1,Math.ceil((z+rr-O.z0)/TS));
    for(let jz=j0;jz<=j1;jz++)for(let jx=i0;jx<=i1;jx++){const dx=O.x0+jx*TS-x,dz=O.z0+jz*TS-z;if(dx*dx+dz*dz<=rr*rr){const o=jz*nx+jx;if(y>H[o])H[o]=y;}}};
  if(CY.arche)for(const p of CY.arche.P)lever(p.x,p.z,CY.arche.W*.5,p.y+CY.arche.T*.5); // l'arche et les cheminées ombrent ce qui est dessous
  for(const c of CY.chem||[])lever(c.x,c.z,c.r,c.y+c.h);
  const el=Math.max(1,elDeg)*Math.PI/180,az=azDeg*Math.PI/180,sx=Math.sin(az),sz=Math.cos(az),te=Math.tan(el)*2*TS,sh=2;
  const bil=(fx,fz)=>{const i=Math.floor(fx),j=Math.floor(fz);if(i<0||j<0||i>=nx-1||j>=nz-1){const ci=Math.max(0,Math.min(nx-1,Math.round(fx))),cj=Math.max(0,Math.min(nz-1,Math.round(fz)));return H[cj*nx+ci];}
    const u=fx-i,v=fz-j,a=M[j*nx+i],b=M[j*nx+i+1],c=M[(j+1)*nx+i],d=M[(j+1)*nx+i+1];return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;};
  const fait=(jx,jz)=>{const o=jz*nx+jx,v=bil(jx+sx*sh,jz+sz*sh)-te;hS[o]=v;M[o]=Math.max(H[o],v);};
  if(Math.abs(sx)>=Math.abs(sz)){const dx=sx>0?-1:1;for(let jx=sx>0?nx-1:0;jx>=0&&jx<nx;jx+=dx)for(let jz=0;jz<nz;jz++)fait(jx,jz);}
  else{const dz=sz>0?-1:1;for(let jz=sz>0?nz-1:0;jz>=0&&jz<nz;jz+=dz)for(let jx=0;jx<nx;jx++)fait(jx,jz);}
  O.h=hS;CY.O=O;}
