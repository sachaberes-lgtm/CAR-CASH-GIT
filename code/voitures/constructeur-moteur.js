/* ================= LE CONSTRUCTEUR =================
   ⚠ RÈGLE 1 : deux paliers voisins doivent DIFFÉRER VISIBLEMENT. Vérifiable par script.
   ⚠ RÈGLE 2 : un moteur à pistons a TOUJOURS un échappement — la garantie est dans le CODE,
   pas dans la table (11 paliers sur 30 n'en avaient aucun, dont le MOTEUR ROUILLÉ ; un oubli
   par entrée se serait reproduit à la retouche suivante).
   ⚠ RÈGLE 3 (nouvelle) : chaque palier a sa SIGNATURE, traitée une par une dans le bloc
   `switch(i)` en fin de fonction. C'est volontairement du cas par cas : une pièce marquante
   par moteur, c'est ce qui fait qu'on reconnaît le sien. */
function mkEngine(i){
  const E=ENGINE_TIERS[i]||ENGINE_TIERS[0],K=ENG_LOOK[i]||ENG_LOOK[0],g=new THREE.Group();
  const rnd=rngT(i*7919+11),S=squel9(K),L=S.L,XE=L*.5;
  /* ⚠ LA ROUILLE, C'EST LE PREMIER PALIER ET LUI SEUL (2026-08-05, demande de Sacha).
     Elle a d'abord été validée sur l'épave, puis appliquée aux 30 : trente moteurs en terre
     cuite. Repliée sur DEUX, elle donnait encore deux carcasses jumelles au démarrage — et un
     joueur qui paie son 2e palier doit voir qu'il a acheté du MÉTAL, pas une deuxième ruine.
     Le BICYLINDRE est donc en alu brut. ⚠ Mais brut ne veut pas dire NEUF : la finition monte
     avec l'échelle — fonderie mate et terne jusqu'au 4 EN LIGNE, puis alu clair et poli. */
  const ep=i===0;
  const bloc=ep?M9.fonte(E.col):M9.alu(i<4?0x8c96a6:0xa4adba,i<4?100:150); // (vague 2, H7) alu foncé d'un cran (0xbcc3cc / 0xd0d5de) : sous le ciel rose, il renvoyait de la MOUSSE rose
  const sombre=ep?M9.fonte(0x6a6259):M9.noir();
  const chrome=M9.inox();
  const chaud=ep?M9.fonte(0x8f7f6c):M9.chaud();                 // les collecteurs, bleuis par la chauffe
  // dès les moteurs de course, le couvre-culasse passe aux SAIGNÉES qui s'allument : c'est ce
  // qui fait lire la montée en gamme d'un coup d'œil, à la taille de la vignette en jeu.
  const habit=ep?M9.fonte(E.col):(i>=12?M9.canaux(E.col):M9.anod(E.col));
  const carbo=M9.carbone();
  const feu=new THREE.MeshBasicMaterial({color:E.flam});
  const lueur=function(c,o){return new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,
    blending:THREE.AdditiveBlending,depthWrite:false});};
  const a=K.a,has=function(n){return K.x.indexOf(n)>=0;};
  const piston=(a==='in'||a==='v'||a==='fl'||a==='w'||a==='h');
  /* ⚠ LES SIX DERNIERS PALIERS CHANGENT DE LANGAGE (2026-08-05). À partir du CŒUR À FUSION, ce
     n'est plus une pièce de mécanique — c'est un OBJET IMPOSSIBLE : croûte érodée, cristal,
     morceaux en lévitation, rien qui tienne rien. Ils n'ont donc pas de corps générique : leur
     `case` construit TOUT. C'est volontaire, et ça n'a de sens que parce que c'est la FIN de
     l'échelle : la même recette appliquée aux 30 donnerait trente cailloux. */
  const relique=i>=24;
  const croute=M9.croute(),cristal=M9.cristal(E.col);
  const MT={bloc:bloc,sombre:sombre,chrome:chrome,habit:habit};

  // ---------- LE CORPS, par architecture ----------
  if(piston){
    corps9(g,K,S,MT,rnd,ep,carbo);
    // LA CHAMBRE INCANDESCENTE, sous chaque culasse : à 200 px (la vignette en jeu) c'est ELLE
    // qui dit « ça brûle là-dedans », bien mieux qu'un détail de géométrie.
    if(!ep)for(let b=0;b<S.BK.length;b++){
      const gr=new THREE.Group();gr.position.y=S.BK[b][1]*.28;gr.rotation.x=S.BK[b][0];
      put9(gr,profX([[-.20,0],[.20,0],[.20,.05],[-.20,.05]],L*.90,0),lueur(E.flam,.34),0,.46,0);
      g.add(gr);
    }
  }else if(a==='ro'){                                     // ROTATIF : des lobes, pas des cylindres
    put9(g,tourX([[.06,0],[.56,.03],[.60,.10],[.60,1.24],[.56,1.31],[.06,1.34]],22),bloc,-.67,0,0);
    for(let k=0;k<K.c;k++)
      put9(g,tourX([[.62,0],[.66,.02],[.66,.09],[.62,.11]],20),chrome,-.45+k*.44,0,0);
  }else if(a==='tu'){                                     // TURBINE À GAZ : un fuseau + un compresseur
    put9(g,geoTurb9(),bloc,-.78,0,0);
  }else if(a==='pl'){                                     // PLASMA : un tube MINCE, plus rien de mobile
    put9(g,tourX([[.04,0],[.17,.03],[.19,.10],[.19,1.9],[.17,1.97],[.04,2.0]],20),bloc,-1.0,0,0);
  }else if(a==='ra'){                                     // STATORÉACTEUR : long et fin
    put9(g,tourX([[.05,0],[.28,.06],[.33,.20],[.34,2.1],[.30,2.24],[.05,2.3]],22),bloc,-1.15,0,0);
  }else if(a==='pu'){                                     // PULSORÉACTEUR : grosse tête, tuyau fin
    put9(g,tourX([[.05,0],[.40,.04],[.44,.16],[.44,.78],[.34,.92],[.22,1.0],[.05,1.02]],22),chrome,-.10,0,0);
    put9(g,tourX([[.04,0],[.19,.02],[.19,1.45],[.04,1.5]],18),bloc,-1.60,0,0);
  }else if(relique){                                      // les six derniers : leur `case` fait tout
  }else if(a==='re'){                                     // RÉACTEUR : cœur trapu et blindé
    put9(g,tourX([[.06,0],[.62,.05],[.72,.18],[.74,.92],[.66,1.06],[.06,1.10]],26),bloc,-.55,0,0);
    put9(g,tourX([[.30,0],[.86,.03],[.86,.14],[.30,.17]],26),sombre,-.36,0,0);
    put9(g,tourX([[.30,0],[.86,.03],[.86,.14],[.30,.17]],26),sombre,.22,0,0);
  }else{                                                  // EXOTIQUE : un noyau qui flotte
    put9(g,fgSph,bloc,0,0,0).scale.set(.56,.56,.56);
    put9(g,tourX([[.04,0],[.17,.03],[.17,1.44],[.04,1.5]],16),sombre,-.75,0,0);
  }

  // ---------- AILETTES DE REFROIDISSEMENT ----------
  // ⚠ elles étaient posées à plat SUR le bloc, à ±.30 en Z : donc À L'INTÉRIEUR de son
  // gabarit, donc invisibles au recadrage. Une culasse à air a ses ailettes qui DÉBORDENT —
  // c'est ce débord qui fait la silhouette du bicylindre et du boxer.
  if(K.f&&piston)for(let b=0;b<S.BK.length;b++){
    const n2=Math.min(S.pb,K.c-b*S.pb);if(n2<=0)break;
    const gr=new THREE.Group();gr.position.y=S.BK[b][1]*.28;gr.rotation.x=S.BK[b][0];
    // ⚠ DEUX FAÇONS D'ÊTRE REFROIDI À L'AIR, et elles ne se dessinent pas pareil. Un boxer porte
    // une NAPPE d'ailettes sur toute la longueur du banc ; une moto a des ailettes CARRÉES
    // empilées autour de chaque fût. Une seule recette pour les deux donnait au bicylindre la
    // silhouette d'un boxer miniature — et donc un jumeau de plus.
    if(K.c<=2)for(let c=0;c<n2;c++){
      const u=(n2>1?c/(n2-1)-.5:0)*(L-.42);
      for(let k=0;k<K.f;k++){const w=.30-Math.abs(k-K.f/2)*.012;
        put9(gr,profX([[-w,0],[w,0],[w,.026],[-w,.026]],w*2,.006),chrome,u,.11+k*.075,0);}
    }else for(let k=0;k<K.f;k++)
      put9(gr,profX([[-.42,0],[.42,0],[.42,.026],[-.42,.026]],L*.86,.006),chrome,0,.13+k*.082,0);
    g.add(gr);
  }else for(let k=0;k<(K.f||0);k++)
    put9(g,profX([[-.34,0],[.34,0],[.34,.028],[-.34,.028]],1.15,.008),chrome,0,.16+k*.115,0);
  // ---------- TURBOS : de vrais escargots, répartis sur les flancs ----------
  for(let k=0;k<(K.t||0);k++){
    const s=(k%2)?1:-1,r=Math.floor(k/2);
    turbo9(g,chrome,sombre,XE-.10-r*.46,.06+r*.18,s*.46);
    serp9(g,[XE-.32-r*.46,.06+r*.18,s*.46],[0,.62,s*.20],sombre,.045,rnd,.10);
  }

  /* ================= L'ÉCHAPPEMENT — GARANTI PAR LE CODE =================
     Si une architecture à pistons ne déclare aucun tuyau, elle reçoit un collecteur. La règle
     est ici et pas dans la table : c'est le seul endroit où elle ne peut pas être oubliée. */
  // ⚠ `potMoto` compte comme un échappement : le mégaphone du BICYLINDRE est dessiné par sa
  // signature, pas par la table. S'il n'était pas listé ici, la garantie lui collerait un
  // collecteur EN PLUS et le moteur sortirait avec deux lignes d'échappement.
  const aEch=has('collecteur')||has('pot')||has('potMoto')||has('tuyere');
  if(has('collecteur')||(piston&&!aEch)){
    for(let b=0;b<S.BK.length;b++)collect9(g,K,S,chaud,b);
  }
  if(has('pot')){                                          // LE POT : un tube tourné, pas un cylindre
    const t=put9(g,tourX([[.09,0],[.105,.05],[.105,.80],[.135,.86],[.15,.92]],16),chaud,XE*.5,-.30,.42);
    t.rotation.z=-.30;t.rotation.y=-.35;echap9(g,t,.92);
  }

  // ================= LA SIGNATURE DE CHAQUE PALIER =================
  // Volontairement du cas par cas : UNE pièce marquante par moteur, c'est ce qui fait qu'on
  // reconnaît le sien. Ajouter un palier = ajouter un `case`, rien d'autre ne bouge.
  switch(i){
  case 0:{ // MOTEUR ROUILLÉ — la courroie nue et une durite qui pendouille
    const c=new THREE.Mesh(new THREE.TorusGeometry(.28,.032,7,20),sombre);
    c.position.set(-(XE+.02),.04,0);c.rotation.y=Math.PI/2;c.scale.set(1,1.35,1);g.add(c);
    serp9(g,[-XE*.4,.30,.32],[XE*.5,-.18,.36],sombre,.030,rnd,.26);
    break;}
  case 1:{ /* BICYLINDRE — LE PREMIER MOTEUR EN MÉTAL. Il ne doit ressembler NI à l'épave qu'on
    vient de quitter, ni au 3 CYLINDRES qui suit : c'est un twin de moto, donc des TIGES DE
    CULBUTEUR à l'air libre entre carter et culasse (personne d'autre n'en a), un cache-culbuteurs
    à ailettes, un kick, et un pot en mégaphone chromé qui remonte. */
    for(let c=0;c<2;c++){const u=(c-.5)*(L-.42);
      for(let s2=0;s2<2;s2++)                                        // les tiges de culbuteur
        put9(g,tourX([[.024,0],[.024,.40]],8),chrome,u,.12,(s2?1:-1)*.20).rotation.z=Math.PI/2;
      put9(g,tourX([[.10,0],[.125,.03],[.125,.13],[.10,.16]],14),M9.anod(E.col),u,.74,0)
        .rotation.z=Math.PI/2;                                       // le cache-culbuteurs
    }
    const kk=put9(g,tourX([[.028,0],[.032,.28]],10),chrome,-(XE+.10),-.14,.30);kk.rotation.z=.95;
    put9(g,tourX([[.05,0],[.085,.03],[.085,.09]],12),sombre,-(XE+.30),.02,.30);
    const mg=put9(g,tourX([[.075,0],[.085,.06],[.085,.62],[.135,.76],[.155,.82]],16),chrome,XE*.35,-.26,.44);
    mg.rotation.y=-.55;mg.rotation.z=.22;echap9(g,mg,.82);           // le mégaphone qui remonte
    break;}
  case 4:{ // 4 SOUPAPES — DEUX BOSSAGES d'arbre à cames qui ÉLARGISSENT le haut du moteur.
    // De simples tubes de came ne suffisaient pas : trop fins, ils disparaissaient au recadrage.
    for(let s=0;s<2;s++){const z=(s?1:-1)*.155;
      put9(g,tourX([[.10,0],[.115,.03],[.115,L*.88],[.10,L*.91]],16),habit,-L*.455,.84,z);
      for(let k=0;k<6;k++)bou9(g,chrome,(k/5-.5)*(L-.30),.94,z,.024);}
    break;}
  case 5:{ // 4 EN LIGNE TURBO — L'ÉCHANGEUR devant : la masse qui dit « turbo » de loin
    echang9(g,M9.anod(E.col),chrome,XE+.34,.02,.86,.52);
    serp9(g,[XE-.10,.30,-.46],[XE+.30,.16,-.30],chrome,.055,rnd,.06);
    break;}
  case 8:{ // V6 BITURBO — DEUX échangeurs, un par flanc, et les tubes qui les alimentent
    for(let s=0;s<2;s++){const z=(s?1:-1);
      echang9(g,M9.anod(E.col),chrome,XE+.26,z*.20,.62,.40);
      serp9(g,[XE-.10,.06,z*.46],[XE+.22,z*.20,z*.16],chrome,.050,rnd,.05);}
    break;}
  case 6: case 14:{ // 5 CYLINDRES / W12 — le PLÉNUM d'admission, une boîte tournée sur le dessus
    put9(g,tourX([[.06,0],[.19,.03],[.21,.10],[.21,L*.62],[.19,L*.69],[.06,L*.72]],20),
      i===14?carbo:chrome,-L*.36,.92,0);
    break;}
  case 9:{ // BOXER — le VENTILO de refroidissement, la signature du flat air-cooled
    const v=new THREE.Mesh(new THREE.TorusGeometry(.30,.05,8,24),sombre);
    v.position.set(-(XE+.14),0,0);v.rotation.y=Math.PI/2;g.add(v);
    for(let k=0;k<8;k++){const an=k/8*6.2832;
      const p=put9(g,profX([[-.02,.26],[.02,.26],[.02,-.26],[-.02,-.26]],.06,.006),chrome,
        -(XE+.14),Math.sin(an)*.15,Math.cos(an)*.15);p.rotation.x=an;}
    break;}
  case 10:{ // V8 ATMO — LE FILTRE À AIR ROND CHROMÉ. L'icône. Il se voit de dos, de loin, partout.
    const f=put9(g,tourX([[.02,0],[.34,.02],[.36,.06],[.36,.14],[.34,.18],[.02,.20]],26),chrome,0,.72,0);
    f.rotation.z=Math.PI/2;
    put9(g,profX([[-.16,0],[.16,0],[.16,.14],[-.16,.14]],.34,.02),sombre,0,.56,0);
    break;}
  case 11:{ // V8 COMPRESSÉ — le ROOTS qui SORT DU CAPOT, coiffé de sa trompe d'admission.
    // Il doit monter HAUT : c'est la seule façon de ne pas être un V8 ATMO de plus une fois la
    // vignette recadrée. Sur les vraies caisses, c'est exactement ce qui dépasse du capot.
    put9(g,profX([[-.22,0],[.22,0],[.22,.34],[-.22,.34]],L*.54,.03),chrome,0,.66,0);
    put9(g,profX([[-.26,0],[.26,0],[.24,.12],[-.24,.12]],L*.60,.03),sombre,0,1.00,0);
    put9(g,tourX([[.05,0],[.20,.03],[.22,.10],[.22,.30],[.19,.36]],20),chrome,-L*.16,1.28,0)
      .rotation.z=Math.PI/2;
    put9(g,tourX([[.04,0],[.16,.02],[.16,.09],[.04,.11]],18),chrome,L*.30,.83,0);
    const c=new THREE.Mesh(new THREE.TorusGeometry(.19,.028,7,20),sombre);
    c.position.set(L*.33,.56,0);c.rotation.y=Math.PI/2;c.scale.set(1,1.9,1);g.add(c);
    break;}
  case 13:{ // V12 — le vé FERMÉ par un couvercle en carbone : les cornets sont DESSOUS.
    // Volontairement l'inverse du V10, qui les montre à nu — deux paliers voisins ne doivent
    // pas partager leur topologie, pas seulement leur nombre de cylindres.
    const n=6,geo=tourX([[.05,0],[.05,.18],[.07,.24],[.10,.28]],16);
    for(let k=0;k<n;k++){const m=new THREE.Mesh(geo.clone(),chrome);
      m.rotation.z=Math.PI/2;m.position.set((k/(n-1)-.5)*(L-.44),.52,0);g.add(m);}
    put9(g,profX([[-.30,0],[.30,0],[.26,.16],[-.26,.16]],L*.86,.03),carbo,0,.84,0);
    for(let k=0;k<7;k++)bou9(g,chrome,(k/6-.5)*(L-.30),1.00,0,.026);
    break;}
  case 12: case 15:{ // V10 / V16 — LES CORNETS D'ADMISSION à nu dans le V
    // ⚠ ils DOIVENT dépasser du vé : posés trop bas ils passent sous les couvre-culasses et on
    // ne voit plus rien de la seule pièce qui fait rêver sur une photo de moteur.
    const n=Math.min(8,Math.max(3,Math.round(K.c/2)));
    const geo=tourX([[.052,0],[.052,.24],[.070,.31],[.105,.36],[.140,.39]],20);
    for(let k=0;k<n;k++){const u=(k/(n-1)-.5)*(L-.44);
      const m=new THREE.Mesh(geo.clone(),chrome);m.rotation.z=Math.PI/2;m.position.set(u,.56,0);g.add(m);}
    break;}
  case 16:{ // H16 F1 — la boîte de renvoi entre les deux étages, ce que personne d'autre n'a
    put9(g,profX([[-.13,0],[.13,0],[.13,.52],[-.13,.52]],.26,.02),carbo,-(XE+.14),-.26,0);
    break;}
  case 18:{ // ROTATIF — le hurlement sort par UN tube unique, énorme, sur le flanc
    const t=put9(g,tourX([[.12,0],[.135,.05],[.135,1.0],[.175,1.06],[.19,1.12]],18),chaud,.30,-.20,.46);
    t.rotation.y=-.5;t.rotation.z=-.16;echap9(g,t,1.12);
    break;}
  case 19:{ // TURBINE À GAZ — les étages du compresseur axial, l'un derrière l'autre
    for(let k=0;k<8;k++)
      put9(g,tourX([[.04,0],[.38-k*.027,.015],[.38-k*.027,.045],[.04,.06]],22),chrome,.50-k*.125,0,0);
    break;}
  case 20:{ // TURBINE À PLASMA — les ANNEAUX MAGNÉTIQUES : plus une pièce en mouvement
    for(let k=0;k<5;k++){const t=new THREE.Mesh(new THREE.TorusGeometry(.27,.045,8,26),k%2?feu:chrome);
      t.rotation.y=Math.PI/2;t.position.x=.62-k*.36;g.add(t);}
    break;}
  case 21:{ // STATORÉACTEUR — LE SPIKE d'entrée : le cône qui casse l'onde de choc
    const c=put9(g,tourX([[.005,0],[.30,.62]],22),chrome,.78,0,0);c.rotation.y=Math.PI;
    break;}
  case 22:{ // PULSORÉACTEUR — la GRILLE de valves, en pleine face
    for(let k=0;k<7;k++){const an=k/7*6.2832;
      put9(g,profX([[-.02,.16],[.02,.16],[.02,-.16],[-.02,-.16]],.30,.006),chrome,
        .60,Math.sin(an)*.20,Math.cos(an)*.20).rotation.x=an;}
    break;}
  case 23:{ // RÉACTEUR NUCLÉAIRE — le dôme, les barres de contrôle et l'échangeur à ailettes
    put9(g,tourX([[.02,0],[.44,.30],[.50,.44]],24),chrome,0,.34,0).rotation.z=-Math.PI/2;
    for(let k=0;k<4;k++)put9(g,tourX([[.045,0],[.045,.42]],10),feu,-.30+k*.20,.74,0).rotation.z=Math.PI/2;
    for(let k=0;k<6;k++)put9(g,profX([[-.42,0],[.42,0],[.42,.025],[-.42,.025]],.05,.006),
      chrome,-.62+k*.16,0,0);
    break;}
  case 24:{ // CŒUR À FUSION — UNE PETITE ÉTOILE, sanglée par rien. Le blindage a EXPLOSÉ en
    // quartiers qui tiennent en lévitation autour d'elle, et le tore les traverse.
    put9(g,fgSph,feu,0,0,0).scale.set(.22,.22,.22);
    for(let k=0;k<7;k++){const an=k/7*6.2832+rnd()*.2,r=.62+rnd()*.10;
      const q=eclat9(g,croute,rnd,Math.cos(an)*r*.55,Math.sin(an)*r,Math.cos(an*1.7)*r*.5,.20+rnd()*.13);
      q.scale.set(1,1,.55);}
    const t=new THREE.Mesh(new THREE.TorusGeometry(.80,.10,12,34),feu);t.rotation.y=Math.PI/2;g.add(t);
    for(let k=0;k<8;k++){const an=k/8*6.2832;
      const d=new THREE.Mesh(new THREE.TorusGeometry(.28,.030,6,16),cristal);
      d.position.set(0,Math.sin(an)*.80,Math.cos(an)*.80);d.rotation.x=an+Math.PI/2;g.add(d);}
    break;}
  case 25:{ // ANTIMATIÈRE — le NÉGATIF : un cœur qui n'émet rien au milieu d'un halo, et deux
    // anneaux qui tournent à l'envers l'un de l'autre. Un gramme, et il ne touche aucune paroi.
    put9(g,fgSph,new THREE.MeshBasicMaterial({color:0x05040a}),0,0,0).scale.set(.20,.20,.20);
    put9(g,fgSph,lueur(E.flam,.30),0,0,0).scale.set(.44,.44,.44);
    for(let k=0;k<2;k++){const t=new THREE.Mesh(new THREE.TorusGeometry(.60+k*.22,.055,10,30),
      k?cristal:feu);t.rotation.set(k?.9:-.9,Math.PI/2,k?.5:-.5);g.add(t);}
    for(let k=0;k<10;k++){const an=k/10*6.2832;                       // les éclats du piège
      eclat9(g,croute,rnd,Math.cos(an)*.95,Math.sin(an)*.42,Math.sin(an*1.3)*.60,.09+rnd()*.07);}
    break;}
  case 26:{ // MOTEUR À DISTORSION — CE N'EST PAS LUI QUI AVANCE, C'EST LA ROUTE QUI RECULE.
    // Donc le moteur est TRANCHÉ : des rondelles décalées les unes des autres, comme si l'espace
    // ne se recollait plus entre deux, avec de l'énergie dans chaque fente.
    for(let k=0;k<7;k++){
      const d=(k-3)/3, dec=Math.sin(k*1.9)*.30*Math.abs(d);
      const r=.52-Math.abs(d)*.16;
      const q=new THREE.Mesh(eroder9(new THREE.CylinderGeometry(r,r,.14,20,1),.05,2,k*37),croute);
      q.rotation.z=Math.PI/2;q.position.set(d*.72,dec,dec*.6);
      q.rotation.x=dec*.9;g.add(q);
      if(k<6)put9(g,fgSph,lueur(E.flam,.34),(d+.166)*.72,dec*.5,dec*.3).scale.set(r*.9,r*.9,r*.9);
    }
    for(let s2=0;s2<2;s2++){const z=(s2?1:-1)*.78;                    // les deux nacelles, à part
      put9(g,tourX([[.04,0],[.14,.03],[.15,.12],[.15,.92],[.12,1.02],[.04,1.06]],18),croute,-.53,.12,z);
      put9(g,tourX([[.13,0],[.17,.12],[.23,.30]],16),feu,-.53,.12,z).rotation.y=Math.PI;}
    break;}
  case 27:{ // COMÈTE — un noyau de roche EN FEU, et une queue de débris qui le suit
    const n=new THREE.Mesh(eroder9(new THREE.IcosahedronGeometry(.48,2),.26,2.2,77),croute);
    g.add(n);
    put9(g,fgSph,lueur(E.flam,.30),0,0,0).scale.set(.72,.72,.72);
    for(let k=0;k<7;k++){const an=k/7*6.2832;                          // la couronne de tuyères
      const t=put9(g,tourX([[.04,0],[.10,.10],[.16,.36]],14),feu,-.42,Math.sin(an)*.44,Math.cos(an)*.44);
      t.rotation.y=Math.PI;t.rotation.z=an*.06;}
    for(let k=0;k<14;k++){const t=k/13;                                // la queue
      eclat9(g,croute,rnd,-.75-t*1.15,(rnd()-.5)*.5*t,(rnd()-.5)*.6*t,.055+rnd()*.075*(1-t));}
    break;}
  case 28:{ // SUPERNOVA — l'instant est FIGÉ : le cœur vient d'éclater, les morceaux sont encore
    // en vol et les ondes n'ont pas fini de passer. Rien ne tient plus ensemble.
    put9(g,fgSph,feu,0,0,0).scale.set(.26,.26,.26);
    put9(g,fgSph,lueur(E.flam,.34),0,0,0).scale.set(.60,.60,.60);
    for(let k=0;k<18;k++){const an=k/18*6.2832,r=.52+rnd()*.72;
      eclat9(g,croute,rnd,Math.cos(an)*r,Math.sin(an*1.7)*r*.62,Math.sin(an)*r,.06+rnd()*.10);}
    for(let k=0;k<4;k++){const t=new THREE.Mesh(new THREE.TorusGeometry(.66+k*.32,.028,8,30),
      lueur(E.flam,.85-k*.19));t.rotation.y=Math.PI/2;t.position.x=-k*.20;g.add(t);}
    break;}
  case 29:{ // TROU NOIR — PLUS RIEN NE S'ÉCHAPPE, MÊME PAS TOI. La cage qui devait le contenir
    // est ASPIRÉE : ses barreaux se courbent vers le centre, et les débris tombent en spirale.
    put9(g,fgSph,new THREE.MeshBasicMaterial({color:0x030206}),0,0,0).scale.set(.40,.40,.40);
    const d=new THREE.Mesh(new THREE.TorusGeometry(.94,.075,10,48),feu);
    d.rotation.x=Math.PI/2.15;d.scale.set(1,1,.20);g.add(d);
    const d2=new THREE.Mesh(new THREE.TorusGeometry(.66,.045,10,44),lueur(E.flam,.6));
    d2.rotation.x=Math.PI/2.15;d2.scale.set(1,1,.20);g.add(d2);
    for(let k=0;k<9;k++){                                              // les barreaux happés
      const an=k/9*6.2832,pts=[];
      for(let j=0;j<=5;j++){const t=j/5,r=.86-t*t*.48,y=(t-.5)*1.25*(1-t*.45);
        pts.push(new THREE.Vector3(Math.cos(an+t*.9)*r,y,Math.sin(an+t*.9)*r));}
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.030,6,false),croute));}
    for(let k=0;k<12;k++){const an=k/12*6.2832*2.4,r=1.05-k*.055;      // la spirale de débris
      eclat9(g,croute,rnd,Math.cos(an)*r,(rnd()-.5)*.16,Math.sin(an)*r*.55,.04+rnd()*.05);}
    break;}
  }

  // ---------- LES PIÈCES COMMUNES DÉCLARÉES DANS LA TABLE ----------
  if(has('tuyere')){
    const t=put9(g,geoTuy9(),feu,a==='pu'?-2.30:(a==='ra'?-2.36:(a==='pl'?-2.06:-.80)),0,0);
    t.rotation.y=Math.PI;echap9(g,t,.78);                  // la tuyère : le feu sort DU col, vers l'arrière
  }
  if(has('coneEntree'))put9(g,tourX([[.005,0],[.32,.52]],22),chrome,1.15,0,0).rotation.y=Math.PI;
  if(has('cellules'))for(let s=0;s<2;s++)
    put9(g,profX([[-.13,0],[.13,0],[.13,.42],[-.13,.42]],.16,.02),feu,-.30,-.21,(s?1:-1)*.26);
  if(has('anneaux2'))for(let k=0;k<2;k++){
    const t=new THREE.Mesh(new THREE.TorusGeometry(.24-k*.05,.04,7,20),feu);
    t.rotation.y=Math.PI/2;t.position.x=-1.95-k*.26;g.add(t);}
  if(has('filtre')){                                       // le filtre à huile, tourné, sur le flanc
    const f=put9(g,tourX([[.02,0],[.115,.02],[.125,.06],[.125,.28],[.11,.31]],16),sombre,XE*.30,-.22,.44);
    f.rotation.y=-.4;}
  if(has('wastegate'))put9(g,tourX([[.05,0],[.10,.02],[.10,.18],[.06,.21]],14),chrome,XE-.34,.30,.36);
  // L'ALTERNATEUR et le faisceau, semés : c'est ce désordre contrôlé qui fait qu'un vrai moteur
  // n'est jamais symétrique ni propre.
  if(piston&&!ep){
    const ax=-XE*.5+(rnd()-.5)*.12;
    const al=put9(g,tourX([[.03,0],[.135,.02],[.145,.06],[.145,.28],[.135,.32]],16),bloc,ax,.24,.46);
    al.rotation.y=.35;
    serp9(g,[ax,.38,.46],[XE*.2,.56,.30],sombre,.026,rnd,.18);
    for(let k=0;k<7;k++)bou9(g,chrome,(rnd()-.5)*L*.9,-.06-rnd()*.26,.315,.026);
  }
  /* ⚠ GARANTI PAR LE CODE, comme l'échappement lui-même : un moteur sort TOUJOURS avec une
     ancre de flamme. Les exotiques (nacelles, couronne, disque d'accrétion) n'ont pas de tuyau
     nommé ; à défaut, le feu sort par l'arrière de la pièce. Sans ce filet, la vignette
     retomberait sur une position par défaut et on retrouverait la flamme décrochée. */
  if(!g.userData.echap)g.userData.echap={p:[-(piston?S.L*.5+.12:1.05),0,0],d:[-1,0,0]};
  return g;
}
/* <<<FIN MOTEURS>>> */
function fruitPick(rnd){ // tirage PONDÉRÉ par la fréquence (un brocoli reste rare, une pomme court les rues)
  const J=!!((JADE_JEU||(LVL.cur&&LVL.cur.sansFin))&&LVL.cur&&LVL.cur.id==='jade'),CN=!!(LVL.cur&&(LVL.cur.id==='canyon'||LVL.cur.id==='dunes')&&!PARK.on),fq=f=>J?(f.jf||0):CN?(f.cf||0):((f.jf!=null||f.cs)?0:Math.max(0,f.freq)); /* (2026-10-14) au CANYON : SES fruits (la figue, la datte, le melon, la grenade) */ // (2026-10-12) au SOLEIL DE JADE : SES fruits, et seulement eux
  let tot=0;for(const f of FRUIT_DEFS)tot+=fq(f);
  if(tot<=0)return 0;
  let r=(rnd?rnd():Math.random())*tot;
  let der=0;for(let i=0;i<FRUIT_DEFS.length;i++){const q=fq(FRUIT_DEFS[i]);if(q<=0)continue;der=i;r-=q;if(r<=0)return i;}
  return der;
}
function mkFruit(i){ const g=new THREE.Mesh(fruitGeo(i),FRUIT_MAT);g.scale.setScalar(2.7);g.userData.fruit=i;return g; } // (2026-09-26) ×2,7 // 1,15 → 1,9 : on les repère de loin · UN mesh par fruit
/* (2026-09-26, user : « parfois les fruits sont en collision avec la route ») — MESURÉ : posés à 1,3 m du bitume, mais grossis ×2,7
   (et ×1,08 au battement), certains descendent à 2,3 m sous leur centre : un bon mètre DANS la dalle. `fruitLeve(i)` = la hauteur du
   centre qui garde le plus bas du fruit ~45 cm au-dessus du bitume, battement compris (calculée une fois, sur la vraie géométrie). */
const FRUIT_LEVE=[];
function fruitLeve(i){if(FRUIT_LEVE[i]==null){const g=fruitGeo(i);if(!g.boundingBox)g.computeBoundingBox();FRUIT_LEVE[i]=Math.max(1.3,-g.boundingBox.min.y*2.7*1.1+.45);}return FRUIT_LEVE[i];}
