function buildCar(spec){
  // ⚠ LES PIÈCES LOW-POLY SE LIBÈRENT : chaque caisse a SA géométrie (plusieurs milliers de facettes)
  // et ses matières. Sans ce passage, chaque aller-retour au garage laisserait une caisse en VRAM.
  // (2026-09-26, passe fuites) MESURÉ : seules les pièces du kit étaient libérées — une caisse hors kit laissait ~45 géométries sur le GPU,
  // une caisse du kit 4 géométries et 13 matières, et la caisse se reconstruit 3 fois par partie (+ chaque caisse feuilletée, chaque
  // photo de la boutique) : les tampons GPU grossissaient d'une partie à l'autre. Tout part, SAUF le partagé (boule des gabarits,
  // tuyères) et la géométrie commune des sprites ; les MATIÈRES attendent une construction de plus avant d'être libérées : leurs
  // programmes restent chauds, pas de recompilation à chaque caisse.
  for(const m of CAR_VIEUX)if(!carGarde(m))m.dispose();CAR_VIEUX.length=0; // (chasse aux gels) sauf la gardienne de chaque programme
  carGroup.traverse(o=>{if(o.geometry&&!o.isSprite&&o.geometry!==SPH9&&o.geometry!==jetGeo)o.geometry.dispose();
    if(o.isInstancedMesh)o.dispose(); // (2026-10-12, passe qualité) les tampons d'INSTANCES (flammes de LA FOURNAISE, écume de LA DÉFERLANTE, gouttes de LA MERCURE) partaient au ramasse-miettes, pas au GPU
    const mm=Array.isArray(o.material)?o.material:[o.material];
    for(const m of mm)if(m&&m!==jetShellM&&m!==jetCoreM&&m!==jetGlowM&&!(m.userData&&m.userData.plq)&&CAR_VIEUX.indexOf(m)<0)CAR_VIEUX.push(m);}); // (2026-10-17) les deux matières de LA PLAQUE sont partagées par toutes les caisses : jamais libérées (voir PLQ)
  for(const pc of CAR_PIECES)if(!pc[0].parent)pc[0].traverse(o=>{if(o.geometry&&!o.isSprite&&o.geometry!==SPH9&&o.geometry!==jetGeo)o.geometry.dispose();}); // (2026-09-27) les pièces d'origine SOUDÉES (détachées) : leurs matières sont celles des soudures, déjà relevées
  CAR_PIECES.length=0;ESSIEUX.length=0;
  while(carGroup.children.length)carGroup.remove(carGroup.children[0]);
  while(carBody.children.length)carBody.remove(carBody.children[0]);
  wheels.length=0;
  JETS.shells.length=0;JETS.cores.length=0;JETS.glows.length=0; // les plumes de l'ancienne caisse partent avec elle
  // ⚠ LES AILERONS SE VIDENT ICI, PAS PLUS BAS. Le bloc des mini-ailes tourne APRÈS le gabarit :
  // y remettre ce reset effaçait l'aileron que le gabarit venait tout juste d'enregistrer, et il
  // ne se déployait jamais. Tout ce qu'un GABARIT peut remplir doit être vidé AVANT qu'il ne tourne.
  carFins.length=0;
  ATCH.on=false;ATCH.ph=0;ATCH.k=0;ATCH.t=3+Math.random()*2; // (2026-10-06) ATCHOUM s'allume dans son gabarit
  BLING.s=[];BLING.anim=[]; // (2026-10-10) L'ICEBERG pose ses éclats, LA FOURNAISE son feu, pendant leur gabarit
  WOWT.caisse=false;NYAN.on=false;NYAN.tete=null;NYAN.pattes.length=0;NYAN.queue.length=0;NYAN.feux.length=0;NYAN.roues.length=0;NYAN.rf='';NYAN.pas=-1;NYAN.hb=-1; // (2026-10-06) le chat pop-tart remplit ses pièces animées pendant son gabarit
  HALO.h.length=0;HALO.t.length=0;ROUES.flou=null;CAR_PHK=null; // (2026-09-26) halos et flou de jante de l'ancienne caisse · (2026-10-18) ses escamotables (voir CAR_PHK)
  const lvl=CARS.indexOf(spec),wreck=lvl===0;
  // brillance qui explose avec le niveau — l'épave est mate et rouillée
  // (2026-09-26, audit rendu) PLAFONNÉS : `lvl` est l'INDEX de la caisse (0-65), plus une progression — la formule donnait un reflet à .98
  // et une brillance > 2 000 à presque toute la gamme : en MixOperation la peinture disparaissait sous un ciel uniforme, et les reflets
  // sous-pixel scintillaient. Au-delà de .45 / 300, la tôle ne gagne plus rien.
  const shin=wreck?16:Math.min(300,50+lvl*34);         // la brillance GRIMPE par niveau… jusqu'à un plafond
  const refl=wreck?.04:Math.min(.45,.10+lvl*.085);     // ...et le reflet du ciel aussi — la COULEUR de la caisse reste lisible
  const specC=wreck?0x777777:(lvl>=10?0xffffff:(lvl>=6?0xeaf2fa:0xc4ccd4));
  // (2026-09-26, vague 2) la LUEUR des classiques (pop-tart → acide) tombe de .2 à .07, comme le plancher `gl` du kit : 20 % de peinture
  // rendue sans lumière, c'était une caisse qui ÉMET (la bible : la laque reflète, elle n'émet pas) et un voile qui effaçait ses ombres.
  // L'épave garde sa valeur (« ne rien changer »).
  const bodyM=new THREE.MeshPhongMaterial({color:spec.color,emissive:spec.color,emissiveIntensity:wreck?Math.min(.2,.08+lvl*.02):.07,shininess:shin,specular:specC,envMap:envTex,reflectivity:refl,combine:THREE.MixOperation});
  const accM=new THREE.MeshPhongMaterial({color:spec.accent,emissive:spec.accent,emissiveIntensity:.08,shininess:Math.max(12,shin*.8),specular:0xdddddd,envMap:envTex,reflectivity:refl*.8,combine:THREE.MixOperation});
  const glassM=new THREE.MeshPhongMaterial({color:0x0d1620,shininess:300,specular:0xffffff,envMap:envTex,reflectivity:wreck?.2:.75,combine:THREE.MixOperation});
  const chromeM=new THREE.MeshPhongMaterial({color:0xe8ecf0,shininess:280,specular:0xffffff,envMap:envTex,reflectivity:.85,combine:THREE.MixOperation});
  const darkM=new THREE.MeshPhongMaterial({color:0x14161a,shininess:60,specular:0x333333});
  const rustM=new THREE.MeshPhongMaterial({color:0x5a3a20,shininess:5,specular:0x111111});
  {const pd=cosmSur('peinture');if(pd&&pd.id!=='usine'){const pc=pd.c!=null?pd.c:pd.grad[1];bodyM.color.setHex(pd.mot?0xffffff:pc);bodyM.emissive.setHex(pc);if(pd.mot)bodyM.userData.mot=pd.mot;}} // (2026-10-16) un MOTIF : la tôle blanche, le motif la colore (greffé après rimify)
  // le liseré (rim), c'est pour la tôle. (2026-09-26) + LE VERNIS des caisses « classiques » (pop-tart, requin, comète, formule, le
  // mans, patron, acide) : à .45 de reflet FIXE, la FORMULE OR sortait jaune pâle et ses vitres couleur de ciel. Le verre et le chrome
  // prennent le vernis SANS le liseré. L'épave garde l'ancien mélange au bit près (« ne rien changer »).
  // (2026-09-26, vague 2) le vernis se règle en PART DE CIEL, pas en multiple du reflet : à `refl` .45, [.25,1.45] donnait 65 % de ciel en
  // rasant (plus que la laque du kit, qui vient de passer à ~36 %). Même contrat pour toutes les caisses : ~6 % de face, ~36 % en rasant,
  // teinté à 20 % par la peinture.
  const VN9=wreck?null:[.06/refl,.36/refl,3,.2];
  rimify(bodyM,VN9);rimify(accM,VN9);bodyM.userData.g='p'; // (le banc des laques reconnaît la tôle des gabarits hors kit)
  if(bodyM.userData.mot)try{motGreffe(bodyM,bodyM.userData.mot);}catch(e){console.warn('motif',e);} // (2026-10-16) le MOTIF d'un gabarit hors kit (voir MOTIFS)
  if(!wreck){rimify(glassM,[.1,.95,3,.35],0,1);rimify(chromeM,[.7,1.1,2,1],0,.6);glassM.specular.setHex(0x5c5c5c);glassM.shininess=260;} // (vague 2) la vitre ne s'allume plus en boule sous la lampe de carrosserie (voir LP_MAT.g)
  const y0=.35,W9=spec.w,H9=spec.h,L9=spec.l;
  // ---- LA BOÎTE À OUTILS DES GABARITS : sans ces six raccourcis, 15 silhouettes feraient 1500 lignes.
  const add=m=>{carGroup.add(m);return m;};
  const box=(w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x||0,y||0,z||0);return add(m);};
  const prof=(pts,w,mat,yy)=>{const m=new THREE.Mesh(carProfile(pts,w),mat);m.position.y=(yy===undefined?y0:yy);return add(m);};
  const cyl=(rt,rb,hh,mat,x,y,z,sg)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,hh,sg||12),mat);m.position.set(x||0,y||0,z||0);return add(m);};
  const sph=(sx,sy,sz,mat,x,y,z)=>{const m=new THREE.Mesh(SPH9,mat);m.scale.set(sx,sy,sz);m.position.set(x||0,y||0,z||0);return add(m);};
  const con=(r,hh,mat,x,y,z,sg)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(r,hh,sg||12),mat);m.position.set(x||0,y||0,z||0);return add(m);};
  // L'ATELIER LOW-POLY : `K.kit(pal)` ouvre un chantier (voir lpKit), `K.commit` le pose — une
  // géométrie par matière, et les matières PARTAGÉES par toute la caisse, roues comprises.
  const lpM={},lpMatC=g=>lpM[g]||(lpM[g]=lpMat(g));
  const kit=pal=>lpKit(peintPal(pal)); // la PEINTURE de la boutique passe par la palette (voir `peintPal`)
  const lpPrims=[];let lpZmin=1e9; // (pots) les pièces simples de la caisse et sa poupe réelle, relevées au passage
  const commit=kt=>{const gs=kt.ech?kt.done():echRetire(kt.done(),kt.prims,spec.shape||'gt');for(const g in gs){gs[g].computeBoundingBox();lpZmin=Math.min(lpZmin,gs[g].boundingBox.min.z);
    if(g!=='l')lpOmbre(gs[g],H9); // (2026-09-26, vague 2) l'ombre cuite (voir lpOmbre) — les feux émettent, ils n'en prennent pas
    const m=new THREE.Mesh(gs[g],lpMatC(g));m.userData.lp=1;add(m);}if(kt.prims)for(const p of kt.prims)lpPrims.push(p);};
  const K={W:W9,H:H9,L:L9,y0:y0,spec:spec,wreck:wreck,add:add,box:box,prof:prof,cyl:cyl,sph:sph,con:con,kit:kit,commit:commit,mats:lpM, // mats : les matières posées (un gabarit peut régler SON vernis, voir le SQUALE)
           body:bodyM,acc:accM,glass:glassM,chrome:chromeM,dark:darkM,rust:rustM};
  // LE GABARIT EST DÉCLARÉ PAR LA CAISSE, jamais deviné. Le repli sur 'gt' n'est pas une règle de
  // secours confortable : c'est un filet pour qu'une fiche mal saisie se voie tout de suite à l'écran
  // au lieu de faire disparaître la carrosserie. Une caisse sans `shape`, c'est un oubli, pas un choix.
  const shape=spec.shape||'gt';
  carGroup.userData.shape=shape;carGroup.userData.lvl=lvl; // l'étal LIT le gabarit ici (voir voitures.html)
  carGroup.userData.gen=(carGroup.userData.gen||0)+1; // (2026-09-26) une caisse neuve : l'empreinte au sol se recalcule (voir EMPR)
  // LA FICHE D'ANCRAGES : chaque gabarit dit où sont ses phares, ses feux, ses roues, et ce qu'il
  // veut des accessoires communs. Les valeurs par défaut couvrent la berline moyenne.
  const A=Object.assign({
    hl:[W9*.32,y0+H9*.50,L9/2+.16],   // phare (demi-écart, hauteur, avancée)
    tl:[W9*.30,y0+H9*.55,-L9/2-.10],  // feu arrière
    wr:1,wx:W9/2,wz:L9/2-.75,wy:0,    // roues : rayon, voie, empattement, relèvement
    glowX:W9/2+.02,glowY:y0+H9*.42,glowL:L9*.82,glowF:1, // où court le néon (position, longueur, barre avant)
    sp:1,skirt:1,split:1,doors:0,slats:0,wings:'panel'
  },(SHAPES[shape]||(console.warn('CASH CAR : gabarit inconnu « '+shape+' » sur '+spec.name+' — repli sur gt'),SHAPES.gt))(K)||{});
  // UNE CAISSE DU KIT LOW-POLY NE PREND AUCUN ACCESSOIRE COMMUN : ni feux-boîtes, ni pots, ni lame,
  // ni aileron générique — tout ce qui se voit est posé par son gabarit.
  if(A.lpw)Object.assign(A,{lamps:0,pipes:0,sp:0,split:0,doors:0,slats:0});
  if(A.split){ // lame avant + diffuseur arrière à ailettes — (2026-10-15) posés AVANT le pot : son encastrement doit les voir (le diffuseur dépasse de 8 cm derrière le pare-chocs ; posé après, il cachait le bas des encoches)
    box(W9*.96,.05,.3,darkM,0,y0+H9*.04,L9/2+.12);
    box(W9*.86,.09,.26,darkM,0,y0+H9*.06,-L9/2-.10);
    for(const fx of [-1,0,1])box(.03,.13,.24,darkM,fx*W9*.26,y0+H9*.10,-L9/2-.10);
  }
  echappement(K,shape,A); // (2026-10-10) LE POT de la caisse, dessiné pour elle (voir « LES POTS D'ÉCHAPPEMENT ») — il déclare ses bouches
  const hlX=A.hl[0],hlY=A.hl[1],hlZ=A.hl[2],tlX=A.tl[0],tlY=A.tl[1],tlZ=A.tl[2];
  carGroup.userData.capot=[0,y0+H9*.78,L9*.28]; // (2026-09-28) le CAPOT, en repère caisse : c'est là que le nouveau moteur RENTRE (voir engBigSuit)
  try{const tD=cosmSur('trainee'); // LA TRAÎNÉE DE LA BOUTIQUE : elle se pose PAR-DESSUS la signature de la caisse
   FX_EFF=(tD&&tD.id!=='nitro')?Object.assign({},spec.fx||{},tD.rainbow?{rainbow:true,trail:null,wow:false}:tD.wow?{wow:true,rainbow:false,trail:tD.rgb}:{trail:tD.rgb,rainbow:false,wow:false,pop:tD.pop||null,rubOff:!!tD.rubOff,sil:tD.sil||null}):null; if(FX_EFF&&!FX_EFF.rainbow)FX_EFF.teinte=tD.rgb||(tD.col?[parseInt(tD.col.slice(1,3),16)/176,parseInt(tD.col.slice(3,5),16)/176,parseInt(tD.col.slice(5,7),16)/176]:null); /* (2026-10-15 soir) la TEINTE de la traînée achetée : le feu de pixels du nitro la prend (voir nfeuPalTrainee) */ // (2026-10-14) une traînée POP : son moteur (TRX) et, ou non, son ruban
  }catch(e){} // ⚠ 1er buildCar à l'init : `FX_EFF` n'est pas encore déclaré (zone morte) — il vaut null de toute façon
  /* (2026-10-14, session PERF) LA TRAÎNÉE WOW CHOISIE AU GARAGE. chauffeDivers ne prépare la traînée WOW que pour la caisse équipée AU
     CHARGEMENT : une caisse ou une traînée WOW prise ensuite au garage peignait ses 12 toiles et créait ses 18 sprites à la 1re NITRO,
     en pleine course. On les prépare ici, hors course, une image plus tard (la même préparation que l'étape de chauffeDivers). */
  try{if(FX_EFF&&FX_EFF.wow&&!WOWT.sp.length&&(!started||gameOver))setTimeout(function(){try{if(started&&!gameOver)return;wowPool();for(const q9 of wowTex())renderer.initTexture(q9.tx);}catch(e){}},60);}catch(e){}
  // ---- MINI-AILES / PLANEURS : repliées dans le flanc au sol, déployées en vol (la boucle les anime
  // via carWingL/carWingR). Le REQUIN remplace les panneaux par ses QUATRE BRAS D'HÉLICES sur les
  // MÊMES pivots : rien à ajouter dans la boucle, la caisse volante était déjà prévue par le jeu.
  carWingL=carWingR=null;wingT=0;carProps.length=0;
  // LES AILES DE LA BOUTIQUE (2026-09-25) : le style équipé remplace celui du gabarit (sauf `none`)
  const aD=cosmSur('aile'),wSt=A.wings==='none'?'none':((aD&&aD.id!=='panneaux')?aD.id:(A.wings==='props'?'helices':'panneaux'));
  if(wSt!=='none'){
    const props=wSt==='helices';
    for(const sd of [1,-1]){
      const piv=new THREE.Group();
      piv.position.set(sd*W9*.36,y0+H9*(props?.44:.55),-L9*.14);
      if(props){
        /* (2026-10-16, LES AILES VIVANTES) chaque rotor dans SON groupe : il penche le nez au boost (un drone qui fonce), un disque de flou
           dit le régime, l'anneau de lumière de son carénage s'allume */
        const flouM=new THREE.MeshBasicMaterial({color:0xdfe8ff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),
          ledM=new THREE.MeshBasicMaterial({color:new THREE.Color(.3,1.1,2.2)}),rots=[];
        for(const fz of [1,-1]){ // deux bras par côté = les quatre hélices de la planche de référence
          const brasG=new THREE.BoxGeometry(W9*.62,.055,.10);
          const bras=new THREE.Mesh(brasG,accM);bras.position.set(sd*W9*.44,0,fz*L9*.20);piv.add(bras);
          const moy=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.09,8),darkM);
          moy.position.set(sd*W9*.78,.05,fz*L9*.20);piv.add(moy);
          const rg=ailB(new THREE.Group());rg.position.set(sd*W9*.78,.09,fz*L9*.20);piv.add(rg);rots.push(rg);
          const rot=new THREE.Mesh(new THREE.TorusGeometry(.26,.022,6,16),chromeM); // le carénage d'hélice
          rot.rotation.x=Math.PI/2;rg.add(rot);
          const led=new THREE.Mesh(new THREE.TorusGeometry(.245,.009,4,24),ledM);led.rotation.x=Math.PI/2;led.position.y=-.014;rg.add(led); // son anneau de lumière
          const fl=new THREE.Mesh(new THREE.CircleGeometry(.25,20),flouM);fl.rotation.x=-Math.PI/2;fl.position.y=.006;fl.userData.fx=1;rg.add(fl); // le disque de flou
          for(const pa of [0,1]){ // deux pales par hélice — recensées pour que la boucle les fasse tourner
            const p9=new THREE.Mesh(new THREE.BoxGeometry(.52,.016,.085),accM);
            p9.rotation.y=pa*Math.PI/2;rg.add(p9);
            carProps.push({m:p9,b:pa*Math.PI/2});}
        }
        ailAnime(function(t,e){const n=AILV.n,r=3.5+e*36+n*40;flouM.opacity=Math.max(0,Math.min(.36,(r-12)/95)); // le régime (voir propSpin)
          for(const rg of rots)rg.rotation.x=.3*n*e;ledM.color.setRGB(.3+1.8*n,1.1+.7*n,2.2);});
      }else if(AILES_POP&&AILES_POP[wSt]){
        AILES_POP[wSt](piv,sd,W9,L9,H9,y0,{acc:accM,body:bodyM}); // (2026-10-14) LES AILES POP · (2026-10-16) LES AILES VIVANTES : PANNEAUX, PLUMES D'ANGE et CHAUVE-SOURIS aussi (voir AILES_POP)
      }else{ // repli : la planche d'origine (AILES_POP n'est pas encore posé au tout premier buildCar)
        const wing=new THREE.Mesh(new THREE.BoxGeometry(W9*.92,.05,L9*.32),accM);wing.position.set(sd*W9*.5,0,0);piv.add(wing);
        const tip=new THREE.Mesh(new THREE.BoxGeometry(W9*.28,.04,L9*.14),bodyM);
        tip.position.set(sd*W9*.92,.06,-L9*.08);tip.rotation.x=.2;piv.add(tip);
      }
      carGroup.add(piv);
      {const k9=AILE_K_ON?(AILE_K[wSt]||1):1;piv.userData.k=k9;piv.scale.set(1,k9,k9);} /* (2026-10-15 soir) LA TAILLE DE L'AILE (voir AILE_K) */
      if(sd>0)carWingL=piv;else carWingR=piv;
    }
  }
  // ---- AILERON GÉNÉRIQUE : seulement pour les gabarits qui n'ont pas le leur (`sp`) ----
  if(spec.spoiler&&A.sp){
    box(W9*.98,.09,.5,accM,0,y0+H9+.42,-L9/2+.12);
    for(const sd of [-1,1])box(.09,.34,.12,darkM,sd*W9*.36,y0+H9+.22,-L9/2+.12);
  }
  // ---- BANDES LUMINEUSES (caisses de l'au-delà) ----
  if(spec.glow){
    const glowM=new THREE.MeshBasicMaterial({color:spec.glow});
    for(const sd of [-1,1])box(.05,.06,A.glowL,glowM,sd*A.glowX,A.glowY,0);
    if(A.glowF)box(W9*.7,.06,.05,glowM,0,y0+H9*.5,L9/2+.02);
  }
  // ---- PROPULSEURS D'APPOINT (spec.rocket) ----
  if(spec.rocket){
    const boostM=new THREE.MeshPhongMaterial({color:0x3a3f48,shininess:200,specular:0xffffff,envMap:envTex,reflectivity:.5,combine:THREE.MixOperation});
    const nozzM=new THREE.MeshBasicMaterial({color:spec.glow||0x66c8ff});
    for(const sd of [-1,1]){
      cyl(.24,.3,.9,boostM,sd*W9*.26,y0+H9*.55,-L9/2-.32,10).rotation.x=Math.PI/2;
      cyl(.16,.2,.1,nozzM,sd*W9*.26,y0+H9*.55,-L9/2-.82,10).rotation.x=Math.PI/2;
    }
  }
  // ---- ROUES : pneu + jante chromée à rayons. Le RAYON suit le gabarit (`wr`) — une kei-car sur
  // des roues de muscle car, et toute la silhouette ment sur sa taille.
  if(A.lpw){
    // ROUES DU KIT : la géométrie est calculée UNE fois et partagée par les quatre. La jante est
    // dessinée sur la face +X : les roues de gauche (x<0) sont posées en MIROIR (scale.x −1, three
    // retourne l'ordre des faces tout seul). La boucle les fait tourner par `rotation.x`, l'essieu.
    const W9=A.lpw,gs=lpWheel(W9),gs1=A.w1F?lpWheel(Object.assign({},W9,A.lpwF||{},{deux:1})):null; // `lpwF` : ce qui change sur la roue du milieu (SQUALE : crampons)
    for(const sxz of [[-1,1],[1,1],[-1,-1],[1,-1]]){
      const w=new THREE.Group(),seule=gs1&&sxz[1]>0; // `w1F` (2026-10-08, SQUALE) : UNE seule roue avant, AU MILIEU, jante des deux côtés — la
      if(!(seule&&sxz[0]<0)){const g9=seule?gs1:gs;  // place de gauche garde un moyeu VIDE (rien à dessiner) : `wheels` reste à quatre, comme
        for(const g in g9){const m=new THREE.Mesh(g9[g],lpMatC(g));m.userData.lp=1;w.add(m);}} // le lisent l'empreinte, les traces, le burn-out
      const kF=sxz[1]>0&&A.wRF?A.wRF:1; // `wRF` : l'échelle des roues AVANT (SQUALE : la grande roue du milieu)
      w.scale.set((sxz[0]<0&&!seule?-1:1)*kF,kF,kF);w.userData.large=W9.w*kF; // (2026-09-26) la largeur du pneu : les traces la reprennent
      w.userData.R=W9.R*kF; // (2026-09-26) le rayon : la boucle fait tourner la roue à sa VRAIE vitesse (v / R)
      if(seule)w.userData.deux=1;
      if(A.roueDeco)A.roueDeco(w,sxz[0],sxz[1]); // (2026-10-10, LA DÉFERLANTE) le gabarit ajoute ses pièces DANS la roue (le pneu d'eau) : elles tournent avec elle
      w.position.set(seule?0:sxz[0]*(sxz[1]>0&&A.wxF!=null?A.wxF:A.wx),W9.R*kF+A.wy,sxz[1]>0?(A.wzF!=null?A.wzF:A.wz):-(A.wzR!=null?A.wzR:A.wz)); // `wxF` : la voie avant
      carGroup.add(w);wheels.push(w);
    }
  }else if(A.rouesEpave){
    // (2026-10-15) LA HONTE : ses roues au KIT (roueEpave), posées comme celles du kit (jante sur +X, miroir à gauche), la gauche arrière
    // toujours rouillée et VOILÉE (rotation.y ,16), comme les roues d'avant
    const R9=.40*A.wr,w9=.32*A.wr,gN=roueEpave(R9,w9,0),gR=roueEpave(R9,w9,1);let wi=0;
    for(const sxz of [[-1,1],[1,1],[-1,-1],[1,-1]]){const w=new THREE.Group(),g9=wi===2?gR:gN;
      for(const g in g9){const m=new THREE.Mesh(g9[g],lpMatC(g));m.userData.lp=1;w.add(m);}
      w.scale.x=sxz[0]<0?-1:1;w.userData.large=w9;w.userData.R=R9;
      if(wi===2)w.rotation.y=.16;
      w.position.set(sxz[0]*A.wx,R9+A.wy,sxz[1]*A.wz);carGroup.add(w);wheels.push(w);wi++;}
  }else{
    const R9=.40*A.wr,wG=new THREE.CylinderGeometry(R9,R9,.32*A.wr,14),rimG=new THREE.CylinderGeometry(R9*.6,R9*.6,.34*A.wr,10),
          spokeG=new THREE.BoxGeometry(R9*1.05,R9*.9,.05),hubG=new THREE.CylinderGeometry(.075,.075,.37*A.wr,8);
    let wi=0;
    for(const sxz of [[-1,1],[1,1],[-1,-1],[1,-1]]){
      const w=new THREE.Group();
      w.add(new THREE.Mesh(wG,darkM));
      w.add(new THREE.Mesh(rimG,wreck?(wi===2?rustM:darkM):chromeM));
      for(let sk9=0;sk9<5;sk9++){const spk=new THREE.Mesh(spokeG,wreck?(wi===2?rustM:darkM):chromeM);
        spk.rotation.y=sk9*Math.PI*2/5;w.add(spk);}
      w.add(new THREE.Mesh(hubG,wreck?rustM:chromeM));
      w.rotation.z=Math.PI/2;w.userData.large=.32*A.wr; // (2026-09-26) la largeur du pneu : les traces la reprennent
      w.userData.R=R9;
      if(wreck&&wi===2)w.rotation.y=.16;
      w.position.set(sxz[0]*A.wx,R9+A.wy,sxz[1]*A.wz);
      carGroup.add(w);wheels.push(w);wi++;
    }
  }
  // LE FLOU DE JANTE (voir flouRoueTex) : quatre disques plaqués SUR les jantes (au-delà des rayons et du moyeu), un seul maillage,
  // hors carrosserie (`sol` : il reste avec les roues quand la caisse penche). L'enjoliveur est déjà un dôme lisse (rien à flouter) ;
  // l'épave garde ses roues telles quelles.
  {let fx9=null,r9=0,col9=0xe8ecf0;
   if(A.lpw){if(A.lpw.style!=='enjoliveur'&&A.lpw.style!=='nyan'){fx9=A.wx+A.lpw.w/2-.035+.024;r9=A.lpw.R*.655;col9=A.lpw.jante||0xe6e9ee;}}
   else if(!wreck){fx9=A.wx+.2*A.wr;r9=.40*A.wr*.62;}
   if(fx9!=null&&wheels.length){
     const cg=new THREE.CircleGeometry(1,20).toNonIndexed(),cp=cg.attributes.position.array,cu=cg.attributes.uv.array,P=[],U=[];
     for(const w of wheels){if(!w.children.length&&A.lpw)continue; // (le moyeu vide de la roue unique)
       const k8=A.lpw&&w.userData.R?w.userData.R/A.lpw.R:1,r8=r9*k8,y9=w.position.y,z9=w.position.z;
       for(const sd of w.userData.deux?[1,-1]:[w.position.x>0?1:-1]){const x9=sd*((fx9-A.wx)*k8+Math.abs(w.position.x)); // le disque suit SA roue (voie, échelle) ; la roue du milieu en a deux
         for(let i=0;i<cp.length;i+=3)P.push(x9,y9+cp[i+1]*r8,z9-sd*cp[i]*r8); // le disque XY tourné de ±90° autour de Y : sa face regarde DEHORS
         for(let i=0;i<cu.length;i++)U.push(cu[i]);}}
     cg.dispose();
     const g9=new THREE.BufferGeometry();g9.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g9.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
     // (2026-09-26, vague 2) LE FLOU PREND LA COULEUR DE LA JANTE : la texture est un gris clair commun à toutes — sur une jante noire ou
     // dorée, la roue lancée devenait un ENJOLIVEUR BLANC. Une jante sombre donne un voile anthracite (gris × .35), une jante colorée sa teinte.
     const jc9=new THREE.Color(col9),lj9=jc9.r*.3+jc9.g*.59+jc9.b*.11;
     if(lj9<.22)jc9.setRGB(.35,.35,.37);
     const m9=new THREE.MeshBasicMaterial({map:flouRoueTex,color:jc9,transparent:true,opacity:0,depthWrite:false,fog:false});m9.userData.lp=1;
     const fl9=new THREE.Mesh(g9,m9);fl9.userData.lp=1;fl9.userData.sol=1;fl9.userData.noShadow=true;fl9.visible=false;fl9.renderOrder=1;
     carGroup.add(fl9);ROUES.flou=fl9;}}
  // ---- PHARES, FEUX, POTS ET PLUMES DE RÉACTEUR ----
  // les pots CANONIQUES (±w*.22, y0+.08, -l/2-.14) ne sont plus dessinés que par les gabarits sans kit ; les TUYÈRES se posent
  // plus bas sur les VRAIS pots de la caisse (voir « LES POTS »).
  const hlM=new THREE.MeshBasicMaterial({color:0xfff6c8}),tlM=new THREE.MeshBasicMaterial({color:0xff2a2a});
  for(const sd of [-1,1]){
    // les caisses en briques dessinent leurs feux et leurs pots elles-mêmes (`lamps:0`, `pipes:0`) :
    // une boîte lisse et un cylindre au milieu des voxels casseraient la trame
    if(A.lamps!==0){box(.30,.13,.06,(wreck&&sd>0)?darkM:hlM,sd*hlX,hlY,hlZ);box(.34,.10,.05,tlM,sd*tlX,tlY,tlZ);}
    if(A.pipes!==0)cyl(.09,.11,.34,wreck?rustM:chromeM,sd*W9*.22,y0+.08,-L9/2-.14,10).rotation.x=Math.PI/2;
  }
  /* ---- LES POTS (2026-09-26) : où sortent VRAIMENT les gaz de cette caisse ----
     1. la fiche les DÉCLARE (`A.pots`, repère caisse, point de sortie) — c'est le dernier mot, pour les cas que le relevé rate ;
     2. sinon on les RETROUVE dans les pièces du kit : cylindres/tours couchés dans l'axe (z) de petit rayon, et boîtes chromées
        pas plus grosses qu'une sortie, dont le bout arrière est dans les 70 cm de la poupe — ni verre ni feux ;
     3. sinon (caisse sans pots dessinés) : sous le pare-chocs, AU RAS de la poupe réelle — plus jamais dans le vide derrière. */
  CAR_POTS.length=0;CAR_POT_SRC='canon';
  const zPoupe=lpZmin<1e8?lpZmin:-L9/2-(A.pipes!==0?.31:0);
  if(A.pots){for(const p of A.pots)CAR_POTS.push(new THREE.Vector3(p[0],p[1],p[2]));CAR_POT_SRC='fiche';}
  else if(spec.rocket){for(const sd of [-1,1])CAR_POTS.push(new THREE.Vector3(sd*W9*.26,y0+H9*.55,-L9/2-.87));CAR_POT_SRC='fusee';} // les tuyères des propulseurs d'appoint
  else if(lpPrims.length){
    const cand=[];
    for(const p of lpPrims){
      if(p.g==='l'||p.g==='g'||p.g==='p'||String(p.g).indexOf('pm:')===0)continue; // ni feux, ni verre, ni tôle (à motif comprise)
      // ⚠ PLUS BAS QUE 60 cm : mesuré sur les 66, les vrais pots sortent entre 26 et 52 cm ; au-dessus, le relevé prenait les FEUX RONDS
      // cerclés de chrome (Stratos, Raie, Trône, Spectre, Étalon, Daytona, Vette, Hot Rod) et le moyeu de la roue de secours du Caïd
      if((p.t==='cyl'||p.t==='lathe')&&p.ax==='z'&&p.r<=.2&&p.z0<=zPoupe+.7&&p.y>.08&&p.y<=.6)cand.push([p.x,p.y,p.z0,p.r]);
      // une boîte-sortie : plus LARGE que haute (bouche plate, centrale) ou petit TUBE carré et profond — pas un butoir (plus haut que
      // large), pas une lame de pare-chocs (5 cm de haut) : mesuré sur la Bulle, le Tout-terrain soviétique, la Taurine
      else if(p.t==='box'&&!p.rot&&p.g==='c'&&p.w<=.4&&p.h<=.25&&p.z-p.d/2<=zPoupe+.15&&p.y<=.6&&
              ((p.w>=p.h&&p.h>=.07)||(p.w<=.12&&p.h<=.12&&p.w>=.04&&p.h>=.04&&p.d>=.08)))cand.push([p.x,p.y,p.z-p.d/2,Math.min(p.w,p.h)/2]);
    }
    for(const c of cand){ // une sortie = un point : le tube chromé et son âme noire se confondent, on garde le bout le plus en arrière
      let o=null;for(const q of CAR_POTS)if(Math.abs(q.x-c[0])<.1&&Math.abs(q.y-c[1])<.14){o=q;break;}
      if(o){if(c[2]<o.z)o.z=c[2];}else CAR_POTS.push(new THREE.Vector3(c[0],c[1],c[2]));}
    if(CAR_POTS.length>6){CAR_POTS.sort((a,b)=>a.z-b.z);CAR_POTS.length=6;} // garde-fou : un relevé trop bavard garde les plus en arrière
    if(CAR_POTS.length)CAR_POT_SRC='releve';
  }
  if(!CAR_POTS.length)for(const sd of [-1,1])CAR_POTS.push(new THREE.Vector3(sd*W9*.22,y0+.08,A.pipes!==0&&!(lpZmin<1e8)?-L9/2-.31:zPoupe-.02));
  { // la traînée : un ruban par côté (moyenne des pots de ce côté) — un seul si les pots sont d'un côté ou au centre
    const g=[],d=[];CAR_POT_C.set(0,0,0);
    for(const p of CAR_POTS){CAR_POT_C.add(p);if(p.x<-.05)g.push(p);else if(p.x>.05)d.push(p);}
    CAR_POT_C.multiplyScalar(1/CAR_POTS.length);
    const moy=(a,o)=>{let zm=1e9;for(const p of a)zm=Math.min(zm,p.z);let n=0;o.set(0,0,0); // la moyenne des pots LES PLUS EN ARRIÈRE du côté
      for(const p of a)if(p.z<zm+.25){o.add(p);n++;}return o.multiplyScalar(1/n);};
    CAR_POT_1=!(g.length&&d.length);
    if(CAR_POT_1){CAR_POT_L.copy(CAR_POT_C);CAR_POT_R.copy(CAR_POT_C);}else{moy(g,CAR_POT_L);moy(d,CAR_POT_R);}
  }
  { // (2026-10-15) LES FEUX ARRIÈRE : d'où partent les TRAÎNÉES DE LUMIÈRE (voir CAR_FEUX)
    CAR_FEUX.length=0;CAR_FEUX_SRC='gabarit';
    const rouge=c=>{if(c==null)return false;const r=c>>16&255,g=c>>8&255,b=c&255;return r>=130&&g<=110&&b<=120&&r>=g*1.9;}; // rouge feu : ni l'ambre des clignotants, ni le blanc des phares, ni le rose néon
    const g9=[],d9=[],c9=[];
    for(const p of lpPrims){if(p.g!=='l'||!rouge(p.c)||p.z>0)continue;
      const zr=p.t==='box'?p.z-p.d/2:(p.ax==='z'?p.z0:p.z);if(zr>zPoupe+.9)continue; // un rouge sur le flanc avant ou sur le toit n'est pas un feu arrière
      (p.x<-.05?g9:p.x>.05?d9:c9).push([p.x,p.y,zr,p.t==='box'?p.w:0]);}
    const moy=a=>{let zm=1e9;for(const q of a)zm=Math.min(zm,q[2]);const o=new THREE.Vector3();let n=0; // les pièces les plus en arrière du côté
      for(const q of a)if(q[2]<zm+.3){o.x+=q[0];o.y+=q[1];o.z+=q[2];n++;}return o.multiplyScalar(1/n);};
    if(g9.length&&d9.length){CAR_FEUX.push(moy(g9),moy(d9));CAR_FEUX_SRC='releve';}
    else if(g9.length||d9.length){const m=moy(g9.length?g9:d9);CAR_FEUX.push(m.clone().setX(-Math.abs(m.x)),m.setX(Math.abs(m.x)));CAR_FEUX_SRC='releve';} // un seul côté relevé : la caisse est symétrique
    else if(c9.length){const m=moy(c9);let w=0;for(const q of c9)w=Math.max(w,q[3]);CAR_FEUX_SRC='releve';
      if(w>.5)CAR_FEUX.push(m.clone().setX(-w*.38),m.setX(w*.38));else CAR_FEUX.push(m);} // une RAMPE d'un seul tenant : ses deux bouts ; un feu central : un seul trait
    else for(const sd of [-1,1])CAR_FEUX.push(new THREE.Vector3(sd*tlX,tlY,tlZ-.03));
  }
  for(const pt of (A.tuyeres===0?[]:CAR_POTS.slice(0,4))){ // une TUYÈRE par pot (sauf `tuyeres:0` : le chat pop-tart ne crache pas de feu) (4 au plus : chacune coûte deux maillages et un halo)
    const js9=new THREE.Mesh(jetGeo,jetShellM),jc9=new THREE.Mesh(jetGeo,jetCoreM);
    js9.position.set(pt.x,pt.y,pt.z+.03);jc9.position.copy(js9.position); // la flamme NAÎT dans la bouche du pot
    js9.scale.set(.1,.1,.02);jc9.scale.set(.05,.05,.02);
    js9.visible=jc9.visible=false;
    js9.userData.noShadow=jc9.userData.noShadow=true;js9.renderOrder=jc9.renderOrder=3;
    carGroup.add(js9);carGroup.add(jc9);JETS.shells.push(js9);JETS.cores.push(jc9);
    const jg9=new THREE.Sprite(jetGlowM);
    jg9.scale.set(.3,.3,1);jg9.position.copy(js9.position);jg9.visible=false;
    carGroup.add(jg9);JETS.glows.push(jg9);
  }
  // ---- DÉTAILS COMMUNS, demandés par la fiche d'ancrages ----
  if(A.doors){ // lignes de portières + poignées : sur une pâtisserie ou un missile, ça n'aurait rien à faire
    const seamM=new THREE.MeshBasicMaterial({color:0x0a0c10,transparent:true,opacity:.55});
    for(const sd of [-1,1]){
      for(const zz of [L9*.07,-L9*.17])box(.012,H9*.5,.03,seamM,sd*(W9/2+.005),y0+H9*.45,zz);
      box(.03,.035,.16,wreck?rustM:chromeM,sd*(W9/2+.02),y0+H9*.66,L9*.01);
    }
  }
  if(A.slats)for(const gy of [-1,1])box(W9*.5,.02,.02,chromeM,0,y0+H9*.42+gy*.045,L9/2+.145);
  // PRESQUE NUIT : phares allumés (halo chaud élargi) + feux arrière braise — sauf le gabarit qui n'en veut pas (`halos:0`, le chat)
  for(const sd of (A.halos===0?[]:[-1,1])){
    if(!(wreck&&sd>0)){
      const hg=new THREE.Sprite(HALO.hM); // (2026-09-26) matière PARTAGÉE, pilotée par la boucle (voir HALO)
      hg.scale.set(.85,.85,1);hg.userData.k=.85;hg.position.set(sd*hlX,hlY,hlZ+.08);carGroup.add(hg);HALO.h.push(hg); // les halos suivent les phares du gabarit
    }
    const tg=new THREE.Sprite(HALO.tM);
    tg.scale.set(.62,.62,1);tg.userData.k=.62;tg.position.set(sd*tlX,tlY,tlZ-.06);if(CAR_FEUX_SRC==='releve'&&CAR_FEUX.length===2)tg.position.copy(CAR_FEUX[sd<0?0:1]).z-=.04;carGroup.add(tg);HALO.t.push(tg); // (2026-10-15) le halo sur le VRAI feu, là où naît la traînée
  }
    // FLAQUES DE LUMIÈRE AU SOL — la caisse ÉCLAIRE la route (même recette que le néon : plan additif qui épouse le bitume).
  // Le SpotLight/PointLight font répondre le spéculaire ; ces flaques garantissent la LECTURE, même sur bitume mat ou au loin.
  function mkPoolPlane(wid,len,zc,col,op,tex){
    const m9=new THREE.Mesh(new THREE.PlaneGeometry(wid,len),
      new THREE.MeshBasicMaterial({map:tex||poolTex,color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    m9.rotation.x=-Math.PI/2;m9.position.set(0,.062,zc);m9.userData.noShadow=true;m9.userData.sol=1;m9.renderOrder=2;
    carGroup.add(m9);return m9;
  }
  // PHARES : les deux FAISCEAUX peints partent du pare-chocs et fondent vers l'avant (beamTex : le bord haut = la caisse)
  CARPOOL.head=mkPoolPlane(spec.w*2.9,spec.l*3.3,spec.l/2+spec.l*1.62,0xffd9a6,wreck?.24:.55,beamTex);CARPOOL.head.userData.op=wreck?.24:.55; // (2026-09-26) l'opacité de base : la boucle la dose jour/nuit (voir carVit)
  CARPOOL.tail=null; // (2026-09-26, audit rendu) la flaque rouge des feux et le halo nitro plaqués au sol faisaient les taches rondes rouges/orangées derrière la caisse — retirés ; seuls les FAISCEAUX des phares restent
  CARPOOL.jet=null;  // (2026-09-25) 5×19 m → 3,4×11 m : le halo de nitro ne peint plus la moitié de l'écran              // le halo de la nitro/traînée (opacité pilotée par JETS.k dans la boucle)
  if(FACETTE.on&&(FACET_SHAPES[shape]||spec.facette))facetteCaisse(); // (2026-09-29) les classiques de la boutique, taillées en facettes comme la gamme (voir facetteCaisse)
  try{if(typeof plqPose==='function')plqPose(lvl,A,W9,H9,L9,y0,wheels.concat([carWingL,carWingR],carFins).filter(Boolean),glassM,lpPrims);}catch(e){console.warn('plaque',e);} // (2026-10-17) LA PLAQUE D'IMMATRICULATION, derrière et devant, sur TOUTES les caisses (voir PLQ)
  // LA CARROSSERIE PENCHE (voir carBody) : on y range tout, sauf les roues et ce qui épouse le bitume (néon, flaques)
  for(const ch of carGroup.children.slice())if(wheels.indexOf(ch)<0&&!(ch.userData&&ch.userData.sol))carBody.add(ch);
  carGroup.add(carBody);carBody.rotation.set(0,0,0);carBody.position.set(0,0,0);carBody.userData.pivY=wheels.length?wheels[wheels.length-1].position.y:.45; // pivot = hauteur des moyeux (⚠ pas de carRoll9=0 ici : buildCar tourne AVANT leur déclaration — zone morte)
  carGroup.traverse(o9=>{if(o9.isMesh&&!o9.userData.noShadow)o9.castShadow=true;}); // toute la caisse porte son ombre LONGUE — sauf la nappe néon (un carré d'ombre, non merci)
  if(bodyM.userData.mot)carGroup.traverse(function(o9){const m9=o9.material;if(o9.isMesh&&m9&&!Array.isArray(m9)&&m9.userData&&m9.userData.mot&&!MOT_FAIT.has(m9))try{motGreffe(m9,m9.userData.mot);}catch(e){}}); // (2026-10-16) un gabarit qui CLONE la tôle (l'épave : K.body.clone()) : le clone garde la couleur blanche, il reprend le motif
  caisseSoude(); // (2026-09-27, passe perf iPhone) ce qui ne bouge jamais est soudé par matière — voir « LA CAISSE EN UN MINIMUM DE DESSINS »
  try{feuxLed(spec,hlM,tlM);}catch(e){console.warn('feux',e);} // (2026-10-20) l'étude des feux en LED, `?feux=1|2` (voir FEUXL) — sans paramètre, rien ne change
}
/* <<<FIN VOITURES>>> */
