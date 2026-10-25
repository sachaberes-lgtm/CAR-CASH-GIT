/* L'ICEBERG (2026-10-10, Léo : « une nouvelle abstraite, en glace, genre iceberg » → « plus voiture » → « plus irrégulière, la glace »
   → « une forme originale, loin de celles qu'on a » → « plus originale, mais une voiture de SPORT quand même : là on dirait un truc de
   famille ») — UN ICEBERG FENDU EN TROIS. Au milieu, un fuselage étroit et sa BULLE de chasseur (une seule place) ; de chaque côté, un
   BLOC DE GLACE posé sur les roues, qui monte en RAMPE vers l'arrière et finit COUPÉ NET (la falaise d'un iceberg qui vêle) ; entre eux,
   des CANAUX D'AIR ouverts — le vent passe à travers la voiture —, un fil de lumière bleue au fond, deux ARCS-BOUTANTS de glace par côté ;
   derrière, un grand AILERON en lame de glace posé sur les deux blocs ; devant, une lame de béquet. La glace est BRUTE (arêtes bousculées,
   gauche ≠ droite, sept nuances par facette, neige par plaques), quelques cristaux et stalactites. Aucune caisse de la gamme n'est
   fendue ainsi. La glace = la matière CHROME du kit, transparente, sans profondeur (`userData.g='ice'`, zéro programme de plus) ; la
   neige = le satiné ; le plancher, opaque. Des ÉCLATS DE GIVRE scintillent (`BLING`). */
  iceberg:function(K){
    const U=LPU,R=.36,ZF=1.5,ZR=-1.5,V=new THREE.Vector3(),V2=new THREE.Vector3(),V3=new THREE.Vector3();
    const P=K.kit({N:{g:'s',c:0xeaf4fb},B:{g:'p',c:0x0d2d4a,f:0},G:{g:'s',c:0x23272e},C:{g:'l',c:0x46d2ff},
      W:{g:'l',c:0xeafaff},L:{g:'l',c:0xff1838},k:{g:'m',c:0x0c1a26},
      r:{g:'l',c:0x8a0c18},R:{g:'l',c:0xff7a8c}}); // (17/10, l'arrière v2) r, R : les facettes des éclats rouges — aucune famille de plus
    const I=K.kit({i:{g:'c',c:0x1479b8},o:{g:'c',c:0x1f95cf},j:{g:'c',c:0x2fb2e6},m:{g:'c',c:0x48c4ee},h:{g:'c',c:0x7ad8f7},n:{g:'c',c:0x9ae2fa},v:{g:'c',c:0x0b3f66}});
    const hs=(a,b)=>{const x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x);};             // un hasard FIXE (la même glace à chaque construction)
    // UNE FACETTE : `cle` la force ; sinon, à plat c'est de la NEIGE (par plaques), ailleurs une nuance de GLACE plus profonde vers le bas
    const fac=(a,b,c,cle)=>{V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);V2.set(c[0]-a[0],c[1]-a[1],c[2]-a[2]);V.cross(V2).normalize();
      const y=(a[1]+b[1]+c[1])/3,r=hs((a[0]+b[0]+c[0])*7.3+(a[2]+b[2]+c[2])*3.1,y*5.7);
      if(cle==='N'||(!cle&&V.y>.86&&r>.25))P.tri('N',a,b,c);
      else I.tri(cle||(V.y>.86?'n':y<.46?(r<.5?'i':'o'):y<.72?(r<.35?'j':r<.7?'m':'o'):(r<.5?'h':'n')),a,b,c);};
    const dehors=(a,b,c,o,cle)=>{V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);V2.set(c[0]-a[0],c[1]-a[1],c[2]-a[2]);V.cross(V2);
      V3.set((a[0]+b[0]+c[0])/3-o[0],(a[1]+b[1]+c[1])/3-o[1],(a[2]+b[2]+c[2])/3-o[2]);if(V.dot(V3)<0)fac(a,c,b,cle);else fac(a,b,c,cle);};
    // UN VOLUME DE GLACE : une section FERMÉE par station (bousculée), les pans tournés vers le dehors, les deux bouts en éventail
    const volume=(zs,anneau,cle)=>{const A=zs.map((z,i)=>anneau(z,i)),n=A[0].length,ctr=A.map(r=>[r.reduce((s9,p)=>s9+p[0],0)/n,r.reduce((s9,p)=>s9+p[1],0)/n]);
      for(let i=0;i<zs.length-1;i++){const z0=zs[i],z1=zs[i+1],o=[(ctr[i][0]+ctr[i+1][0])/2,(ctr[i][1]+ctr[i+1][1])/2,(z0+z1)/2];
        for(let k=0;k<n;k++){const k2=(k+1)%n,a=A[i][k],b=A[i][k2],c=A[i+1][k2],d=A[i+1][k],K9=cle?cle(k,(z0+z1)/2):null;
          dehors([a[0],a[1],z0],[b[0],b[1],z0],[c[0],c[1],z1],o,K9);dehors([a[0],a[1],z0],[c[0],c[1],z1],[d[0],d[1],z1],o,K9);}}
      for(const [i,dz] of [[0,1],[zs.length-1,-1]]){const z=zs[i],c9=[ctr[i][0],ctr[i][1],z],o=[ctr[i][0],ctr[i][1],z+dz*.3];
        for(let k=0;k<n;k++){const a=A[i][k],b=A[i][(k+1)%n];dehors(c9,[a[0],a[1],z],[b[0],b[1],z],o);}}};
    const bous=(p,i,k,g9,a)=>[p[0]+(hs(i,k+g9)-.5)*a,p[1]+(hs(i+.5,k*1.3+g9)-.5)*a*.85];                    // la glace brute : quelques cm
    const AR=[[0,2*R+.06],[R*.6,2*R+.06],[R+.15,.26]],arches=z=>U.arch(z,[ZF,ZR],AR,.26);
    // LE FUSELAGE : étroit, en goutte, du nez au dard
    const wF=z=>U.lin([[-2.3,.10],[-2.0,.24],[-1.2,.38],[0,.42],[1.2,.36],[2.0,.22],[2.42,.06]],z),
          tF=z=>U.lin([[-2.3,.40],[-1.6,.62],[-.6,.72],[.2,.74],[1.2,.62],[2.0,.42],[2.42,.30]],z);
    volume([-2.3,-2.0,-1.6,-1.2,-.6,0,.6,1.2,1.7,2.1,2.42],(z,i)=>{const w=wF(z),t=tF(z),b=.26,m=b+(t-b)*.55;
      const D=[[w*.75,b],[w,m],[w*.82,t-(t-b)*.15],[w*.4,t]];
      return [[0,b-.005]].concat(D.map((p,k)=>bous(p,i,k,0,.05)),[[0,t+.01]],D.slice().reverse().map((p,k)=>{const q=bous(p,i,k,17,.05);return [-q[0],q[1]];}));});
    // LA BULLE : une seule place, glace sombre, posée sur le fuselage
    const cwB=z=>U.lin([[-.45,.02],[-.1,.27],[.5,.31],[1.0,.22],[1.3,.02]],z),ctB=z=>U.lin([[-.45,.74],[.1,1.03],[.55,1.07],[1.0,.93],[1.3,.70]],z);
    volume([-.45,-.1,.2,.55,.8,1.0,1.3],(z)=>{const c=cwB(z),t=ctB(z),b=tF(z)-.03;return [[0,b],[c,b],[c*.86,b+(t-b)*.6],[c*.45,t-.01],[0,t],[-c*.45,t-.01],[-c*.86,b+(t-b)*.6],[-c,b]];},()=>'v');
    P.box('G',.30,.30,.07,0,.86,.05,-.3,0,0);P.box('G',.30,.06,.34,0,.74,.3);                              // le baquet, sous la bulle
    // LES DEUX BLOCS : sur les roues, en rampe vers l'arrière, coupés net (la falaise), arches découpées dessous
    const xo=z=>U.lin([[-2.25,.92],[-1.5,1.03],[0,.97],[1.5,1.03],[2.3,.84]],z),
          tP=z=>U.lin([[-2.25,1.0],[-1.5,1.0],[-.7,.86],[.4,.80],[1.5,.95],[2.05,.70],[2.3,.48]],z),
          zP=[-2.25,-2.1,-1.8,-1.0,-.5,0,.5,1.0,1.8,2.05,2.2,2.3];
    for(const w of [ZF,ZR])for(const d of [R*.6,R+.15])zP.push(w-d,w+d);zP.sort((a,b)=>a-b);
    for(const sd of [1,-1])volume(zP,(z,i)=>{const b=arches(z),t=tP(z),o=xo(z),xi=.55,g9=sd>0?0:17;
      const Q=[[xi,b],[o-.06,b],[o,b+(t-b)*.45],[o-.05,t-.06],[o-.2,t],[xi+.05,t-.03],[xi,b+(t-b)*.5]].map((p,k)=>k<2?p:bous(p,i,k,g9,.06));
      return Q.map(p=>[sd*p[0],p[1]]);});
    // LES ARCS-BOUTANTS : deux ponts de glace par côté, du fuselage au bloc, par-dessus le canal
    for(const sd of [1,-1])for(const z of [1.75,-1.05]){const y0=tF(z)-.06,y1=tP(z)-.05,x0=wF(z)*.9,x1=.58,l=Math.hypot(x1-x0,y1-y0);
      I.put('h',new THREE.BoxGeometry(l,.05,.14),sd*(x0+x1)/2,(y0+y1)/2,z,0,0,sd*Math.atan2(y1-y0,x1-x0));}
    // L'AILERON : une lame de glace qui court d'un bloc à l'autre, sa neige dessus, son bord d'attaque cassé
    I.put('h',new THREE.BoxGeometry(2.06,.045,.40),0,1.10,-2.06,.14,0,0);
    P.put('N',new THREE.BoxGeometry(1.5,.012,.24),.08,1.13,-2.05,.14,0,0);
    for(let k=0;k<7;k++){const x=-.9+k*.3+(hs(k,3)-.5)*.1,l=.08+hs(k,5)*.1;I.tri(k%2?'n':'m',[x-.06,1.115,-1.86],[x+.06,1.115,-1.86],[x,1.12,-1.86+l]);}
    for(const sd of [1,-1])I.put('m',new THREE.BoxGeometry(.05,.14,.10),sd*.82,1.04,-2.04);
    // LE BÉQUET : une lame sous le nez, d'un bloc à l'autre
    I.put('j',new THREE.BoxGeometry(1.86,.03,.30),0,.23,2.30);
    // LE PLANCHER (bleu nuit) et les CANAUX : un fil de lumière bleue au fond de chacun
    P.box('B',1.86,.05,4.3,0,.245,0);
    P.sym(sd=>P.box('C',.06,.012,3.8,sd*.485,.275,0));
    // LES CRISTAUX (flancs des blocs, pas les mêmes des deux côtés) et LES STALACTITES (sous les blocs)
    const crist=(sd,z,y,l)=>{const x=sd*xo(z)*.99,p1=[x,y+.06,z+.05],p2=[x,y-.05,z+.07],p3=[x,y,z-.08],A=[x+sd*l*.55,y+l*.35,z-l*.85],o=[x-sd*.3,y,z];
      dehors(p1,p2,A,o,'n');dehors(p2,p3,A,o,'h');dehors(p3,p1,A,o,'m');};
    for(const q of [[1,.2,.62,.18],[1,-.7,.70,.14],[1,2.0,.56,.12],[-1,.6,.60,.13],[-1,-.3,.68,.20],[-1,-2.0,.80,.15]])crist(q[0],q[1],q[2],q[3]);
    for(const t of [[.78,.5,.14],[.74,-.4,.10],[-.76,.1,.16],[-.80,-.7,.11],[.85,-2.2,.12],[-.82,2.25,.09]]){
      const yb=arches(t[1]),l=t[2],r9=.04,x=t[0],z=t[1],A=[x+.01,yb-l,z-.02],B9=[[x+r9,yb,z],[x-r9*.6,yb,z+r9*.8],[x-r9*.6,yb,z-r9*.8]];
      dehors(B9[0],B9[1],A,[x,yb-l*.3,z],'h');dehors(B9[1],B9[2],A,[x,yb-l*.3,z],'n');dehors(B9[2],B9[0],A,[x,yb-l*.3,z],'m');}
    // LES PHARES (des fentes au nez des blocs), LES FEUX (sur les falaises), les tuyères (au bout du fuselage)
    P.sym(sd=>{P.box('W',.26,.035,.03,sd*.78,.44,2.31,0,sd*.25,0);P.box('L',.34,.045,.02,sd*.78,.86,-2.265);});
    /* L'ARRIÈRE v2 (2026-10-17, Sacha : « refais aussi l'arrière de : ROSSO 40, LE SAMOURAÏ, LA DAYTONA, LA FÉLINE, L'ICEBERG » — la revue des poupes, 2e tour) : les feux étaient deux bâtons rouges. Désormais LES FEUX EN ÉCLATS DE GLACE ROUGE : sur
       chaque falaise, une gerbe de cinq aiguilles, chacune trois facettes (claire, vive, sombre) — on lit un cristal. Le fil rouge reste
       dessous : il donne leur place aux traînées (un `tri` ne se relève pas). */
    {const ec=(x,y,z,l,r,dx,dy)=>{const A=[x+dx*l,y+dy*l,z-l],B=[[x+r,y-r*.6,z],[x,y+r,z],[x-r,y-r*.6,z]],o=[x,y,z+.2];
       for(let k=0;k<3;k++){const a=B[k],b=B[(k+1)%3],cle=k===0?'R':k===1?'L':'r';
         V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);V2.set(A[0]-a[0],A[1]-a[1],A[2]-a[2]);V.cross(V2);
         V3.set((a[0]+b[0]+A[0])/3-o[0],(a[1]+b[1]+A[1])/3-o[1],(a[2]+b[2]+A[2])/3-o[2]);if(V.dot(V3)<0)P.tri(cle,a,A,b);else P.tri(cle,a,b,A);}};
     P.sym(sd=>{for(const q of [[.70,.88,.16,.035,-.15,.25],[.78,.90,.22,.04,0,.35],[.86,.87,.15,.032,.25,.2],[.74,.83,.12,.03,-.1,-.15],[.83,.82,.13,.03,.2,-.2]])
       ec(sd*q[0],q[1],-2.262,q[2],q[3],sd*q[4],q[5]);});}
    P.box('L',.12,.035,.02,0,.36,-2.315);
    P.sym(sd=>P.cyl('k',.045,.04,10,sd*.11,.31,-2.30,'z'));
    K.commit(P);
    // LA GLACE : un maillage à part, transparent, dessiné après le reste
    const g=K.add(new THREE.Group());g.userData.ice=1;
    let gm;try{gm=lpMat('c');}catch(e){gm=new THREE.MeshPhongMaterial({vertexColors:true,side:THREE.DoubleSide,shininess:160});}
    gm.transparent=true;gm.opacity=.80;gm.depthWrite=false;gm.userData.g='ice';
    const gl9=new THREE.Mesh(I.done().c,gm);gl9.renderOrder=2;g.add(gl9);
    // LES ÉCLATS DE GIVRE : trois aiguilles croisées (une étoile vue de partout) ; ils scintillent
    const E=K.kit({s:{g:'l',c:0xffffff}});
    for(const sc of [[1,.09,.09],[.09,1,.09],[.09,.09,.7]])E.put('s',new THREE.OctahedronGeometry(.17,0),0,0,0,0,0,0,sc[0],sc[1],sc[2]);
    E.put('s',new THREE.OctahedronGeometry(.035,0),0,0,0);
    const par=g.parent,n0=par.children.length;K.commit(E);const em=par.children[n0];par.remove(em);
    const eg=K.add(new THREE.Group()),et=[];eg.userData.etoiles=et;const em2=em.material.clone();em2.transparent=true;
    for(const q of [[1.0,1.13,-2.06],[-.95,1.12,-2.06],[.2,1.07,.55],[.85,.96,1.5],[-.9,1.0,-1.5],[.6,.82,.4],[-.3,.75,1.4]]){
      const m=new THREE.Mesh(em.geometry,em2);m.position.set(q[0],q[1],q[2]);m.renderOrder=3;
      m.userData.ph=et.length*2.39;m.userData.r=1.3+(et.length*.37)%1.1;m.userData.s=.8+(et.length%3)*.25;eg.add(m);et.push(m);}
    if(typeof BLING==='object'&&BLING)BLING.s=et;
    return {hl:[.78,.44,2.34],tl:[.78,.86,-2.28],wx:.82,wzF:ZF,wzR:-ZR,pots:[[.11,.31,-2.32],[-.11,.31,-2.32]],
            lpw:{R:R,w:.26,style:'multi',n:10,jante:0xd8f3ff,accent:0xd8f3ff,pneu:0x0e1a24}};
  },
/* LA FOURNAISE (2026-10-10, Léo : « une voiture FLAMME — vas-y dur ; une autre technique ; une forme de voiture originale, associée au feu »
   → (essai en porcelaine blanche, refusé : « je préférais avant, avec les roues noires et les cubes noirs ; fais VIBRER un peu plus la
   voiture — pas au sens littéral ») — UNE VOITURE DE LAVE QUI VIT. Le VITRAIL de Léo, en trois couches :
   · la CROÛTE : des cubes de BASALTE de 11 cm à 86 % (les joints laissent passer la lumière), posés en surface d'un volume (`dedans` :
     superellipse, ailes bombées, capot creusé, arches seulement sur les flancs, un PUITS dans la malle, huit TROUS ouverts) ; cockpit en
     obsidienne ; des BRAISES (un maillage à part : elles PALPITENT) ;
   · dessous, la LAVE (le cœur lisse, rouge sombre → orange → jaune) qui RESPIRE ;
   · entre les deux, un FEU QUI COULE (un programme : bruit qui monte et file vers l'arrière) et une ONDE de lumière qui parcourt la caisse
     de l'avant vers l'arrière — les joints scintillent, la voiture VIBRE de lumière ;
   · dans le puits, de PETITES FLAMMES EN CUBES qui vacillent par crans (Léo : « plus pixel, les flammes ; des petites flammes »).
   Pots : deux gueules de forge carrées. Ce qui bouge : `BLING.anim` (jeu), `userData.anime` (salle blanche). */
  fournaise:function(K){
    const U=LPU,R=.38,ZF=1.45,ZR=-1.45,S9=.11,hs=(a,b)=>{const x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x);};
    // LA FORME : bas (arches comprises), dessus, demi-largeur le long de la caisse ; la section se resserre en haut (le pavillon)
    const AR=[[0,2*R+.06],[R*.62,2*R+.06],[R+.16,.30]],
          B=(z,x)=>x!=null&&Math.abs(x)<.46?.30:U.arch(z,[ZF,ZR],AR,.30),                                 // l'arche ne creuse QUE les flancs (au milieu, le capot)
          T=z=>U.lin([[-2.3,.80],[-2.0,.94],[-1.3,1.0],[-.8,1.04],[-.25,1.15],[.4,1.12],[.85,.88],[1.5,.74],[2.1,.58],[2.36,.42]],z),
          W=z=>U.lin([[-2.3,.66],[-2.0,.84],[-1.45,.90],[-.6,.84],[.3,.83],[1.45,.88],[2.0,.78],[2.36,.36]],z)
                +.07*Math.exp(-Math.pow((z-ZF)/.42,2))+.09*Math.exp(-Math.pow((z-ZR)/.45,2)),            // les ailes bombées sur les roues
          Wy=(z,y)=>{const b=.30,t=T(z),u=(y-b)/Math.max(.05,t-b),cab=z>-.75&&z<.86?.52:.30;return W(z)*(1-cab*Math.pow(Math.max(0,u-.5)/.5,1.4));},
          cratere=(x,y,z)=>z>-2.0&&z<-1.26&&Math.abs(x)<.44&&y>T(z)-.34,                              // la fournaise : un puits dans la malle
          creux=(x,z)=>z>.86?.07*Math.max(0,1-Math.abs(x)/.5):0,                                     // le capot creusé entre les ailes
          dedans=(x,y,z)=>{if(z<-2.3||z>2.36)return false;const b=B(z,x),t=T(z)-creux(x,z);if(y<b||y>t)return false;if(cratere(x,y,z))return false;
            const w=Wy(z,y),yc=(b+t)/2,hh=(t-b)/2,ux=Math.abs(x)/w,uy=Math.abs(y-yc)/hh;return Math.pow(ux,3)+Math.pow(uy,6)<=1;},
          cabine=(y,z)=>z>-.75&&z<.86&&y>.30+(T(z)-.30)*.62;
    // LA CROÛTE : un cube par case de surface (une case dedans dont une voisine est dehors), à 89 % — les joints laissent passer la lave
    const P=K.kit({a:{g:'s',c:0x231a17},b:{g:'s',c:0x2e221d},c:{g:'s',c:0x1a1311},v:{g:'s',c:0x0b0808},q:{g:'s',c:0x4a1608},
      W:{g:'l',c:0xfff1c8},R:{g:'l',c:0xff1a1a},f:{g:'m',c:0x141010},k:{g:'m',c:0x050404}}),
          E=K.kit({L:{g:'l',c:0xff5a14},Y:{g:'l',c:0xffb02e}});                                        // les braises, à part : elles palpitent
    // LES TROUS DE FLAMMES (Léo : « rajoute quelques petits trous de flammes ») : la croûte s'ouvre — on y voit couler le feu
    const TROUS=[],trou=(x,z,s9)=>TROUS.push({p:[x,T(z)-creux(x,z),z],s:s9}),trouF=(sd,y,z,s9)=>TROUS.push({p:[sd*Wy(z,y),y,z],s:s9});
    trou(.26,1.62,.12);trou(-.30,1.30,.10);trou(.64,1.48,.10);trou(-.60,1.40,.11);
    trouF(1,.62,-.20,.11);trouF(-1,.56,.30,.10);trouF(1,.70,-1.02,.10);trouF(-1,.66,-1.12,.12);
    const ouvert=(x,y,z)=>{for(const h of TROUS){const d=Math.hypot(x-h.p[0],y-h.p[1],z-h.p[2]);if(d<h.s*1.05)return true;}return false;};
    const geo=new THREE.BoxGeometry(S9*.86,S9*.86,S9*.86);                                             // (86 % : des joints un peu plus larges, plus de lueur)
    for(let z=-2.3+S9/2;z<2.36;z+=S9)for(let y=.30+S9/2;y<1.2;y+=S9)for(let x=S9/2;x<1.0;x+=S9){
      if(!dedans(x,y,z))continue;
      if(dedans(x+S9,y,z)&&dedans(x-S9,y,z)&&dedans(x,y+S9,z)&&dedans(x,y-S9,z)&&dedans(x,y,z+S9)&&dedans(x,y,z-S9))continue;
      for(const sd of [1,-1]){const X=sd*x,r=hs(X*7.1+z*3.3,y*5.9);if(ouvert(X,y,z))continue;
        if(cabine(y,z)){if(r>.93)E.put('L',geo,X,y,z);else P.put(r<.55?'v':'q',geo,X,y,z);continue;}   // le cockpit : obsidienne et braise sombre
        const pr=Math.abs(z+1.63)<.48&&Math.abs(X)<.62&&y>T(z)-.32;                                    // la margelle du puits : elle rougeoie
        if(r>.94||(pr&&r>.55)){E.put(r>.97?'Y':'L',geo,X,y,z);continue;}
        P.put(r<.33?'a':r<.66?'b':'c',geo,X,y,z);}}
    // LES PHARES (des cubes blancs-jaunes au nez), LES FEUX (des cubes rouges à la poupe)
    for(const sd of [1,-1]){P.box('W',.12,.06,.04,sd*.24,.50,2.33);P.box('W',.08,.05,.04,sd*.36,.53,2.27);
      P.box('R',.22,.05,.04,sd*.40,.78,-2.33);}
    // LES POTS : deux gueules de forge carrées dans la poupe, cerclées de fer, le feu au fond
    for(const sd of [1,-1]){const x=sd*.30,y=.48,z=-2.36;
      P.box('f',.16,.025,.18,x,y+.068,z+.09);P.box('f',.16,.025,.18,x,y-.068,z+.09);P.box('f',.025,.16,.18,x-.068,y,z+.09);P.box('f',.025,.16,.18,x+.068,y,z+.09);
      P.box('k',.11,.11,.03,x,y,z+.15);P.box('L',.08,.08,.01,x,y,z+.12);P.box('f',.012,.11,.012,x,y,z+.004);}
    K.commit(P);
    // LE CŒUR DE LAVE : la forme lisse, rentrée d'une demi-case sous les cubes ; rouge sombre en bas, jaune en haut — il RESPIRE
    const C=K.kit({r:{g:'l',c:0x8a1a08},o:{g:'l',c:0xff5a10},y:{g:'l',c:0xffb23a}});
    const zs=[-2.24,-2.01,-1.99,-1.7,-1.45,-1.27,-1.25,-.8,-.4,0,.4,.85,1.2,1.45,1.8,2.1,2.3];
    C.loft(zs,z=>{const b=.30+S9*.5,t=T(z)-creux(0,z)-(z>-2.0&&z<-1.26?.28:S9*1.15)/* (dans le puits, la lave est plus bas) */,yc=(b+t)/2,hh=(t-b)/2,pts=[];          // une case sous la croûte : jamais à fleur
      for(let i=0;i<=8;i++){const a=-Math.PI/2+i/8*Math.PI,y=yc+Math.sin(a)*hh,ux=Math.pow(Math.max(0,1-Math.pow(Math.abs(Math.sin(a)),6)),1/3);
        pts.push([Math.max(.001,(Wy(z,y)-S9*1.1)*ux)*(i===0||i===8?0:1),y]);}return pts;},
      (j,z,y)=>y<.55?'r':y<.85?'o':'y');
    const cg=C.done().l;let cm;try{cm=lpMat('l');}catch(e){cm=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});}
    cm.userData.g='l';const coeur=new THREE.Mesh(cg,cm);coeur.userData.brut=1;
    const g=K.add(new THREE.Group());g.add(coeur);
    // LES BRAISES : leur propre matière (elle palpite)
    let em;try{em=lpMat('l');}catch(e){em=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});}
    em.userData.g='l';const braises=new THREE.Mesh(E.done().l,em);braises.userData.brut=1;g.add(braises);
    // LE FEU QUI COULE et L'ONDE : un programme — un bruit qui monte et file vers l'arrière ; une vague de lumière (uW) qui court de l'avant
    // vers l'arrière ; la hauteur (uY0, uH) l'efface vers le haut ; `uB` le rend plus présent sans le blanchir
    const FEU_VS='varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
          FEU_FS='uniform float uT,uF,uY0,uH,uA,uB,uW,uPx;varying vec3 vP;'+
      'float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}'+
      'float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),'+
      'mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}'+
      'void main(){vec3 P=floor(vP/uPx)*uPx+uPx*.5;'+                                     /* (Léo : « plus pixel, les flammes ») : des cases nettes */
      'float u=clamp((P.y-uY0)/uH,0.,1.);vec3 q=vec3(P.x*4.,P.y*5.-uT*(2.4+uF*1.6),P.z*3.+uT*.7);'+
      'float n=n3(q)*.6+n3(q*2.1)*.3+n3(q*4.3)*.1;float w=pow(max(0.,sin(P.z*1.7+uT*(3.+uF*2.))),10.)*uW;'+
      'float f=clamp(n*1.25+(1.-u)*.5-u*.45+uF*.12+w*.45,0.,1.);f=floor(f*7.)/7.;float a=step(.42,f+uB)*uA;'+
      'vec3 c=mix(vec3(.85,.12,.02),vec3(1.,.6,.1),smoothstep(.45,.75,f));c=mix(c,vec3(1.,.95,.75),smoothstep(.8,.96,f));gl_FragColor=vec4(c,a);}';
    const UF={uT:{value:0},uF:{value:0}};
    const feuMat=(y0,h,a,b,w9,px)=>{const m=new THREE.ShaderMaterial({uniforms:{uT:UF.uT,uF:UF.uF,uY0:{value:y0},uH:{value:h},uA:{value:a},uB:{value:b||0},uW:{value:w9||0},uPx:{value:px||.05}},
      vertexShader:FEU_VS,fragmentShader:FEU_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});m.userData.g='feu';return m;};
    // LA PEAU DE FEU : entre la lave et la croûte (une demi-case sous les cubes) — c'est elle qu'on voit scintiller dans les joints
    const D=K.kit({r:{g:'l',c:0xffffff}});
    D.loft(zs,z=>{const b=.30+S9*.4,t=T(z)-creux(0,z)-(z>-2.0&&z<-1.26?.26:S9*.7),yc=(b+t)/2,hh=(t-b)/2,pts=[];
      for(let i=0;i<=8;i++){const a=-Math.PI/2+i/8*Math.PI,y=yc+Math.sin(a)*hh,ux=Math.pow(Math.max(0,1-Math.pow(Math.abs(Math.sin(a)),6)),1/3);
        pts.push([Math.max(.001,(Wy(z,y)-S9*.7)*ux)*(i===0||i===8?0:1),y]);}return pts;},()=>'r');
    const peau=new THREE.Mesh(D.done().l,feuMat(.3,.95,.95,.18,1,.05));peau.userData.brut=1;peau.renderOrder=2;g.add(peau);
    // LES PETITES FLAMMES EN PIXELS (Léo : « plus pixel, les flammes ; des petites flammes ») : dans le puits, des flammes de pixel art EN
    // VOLUME — des tas de petits cubes de feu (un InstancedMesh, un appel de dessin) : base blanche, cœur jaune, corps orange, pointe
    // rouge, la couronne extérieure plus rouge ; chaque colonne vacille par CRANS (12 images/s), la pointe penche d'une case, une
    // étincelle se détache et monte ; plus hautes à la nitro. Les couleurs sont écrites telles quelles (même rendu jeu / salle).
    const e9=.056,FL=[[0,-1.64,10],[.20,-1.46,7],[-.21,-1.50,8],[.17,-1.84,7],[-.18,-1.82,7],[.0,-1.36,5]],NF=420;
    const mF=new THREE.ShaderMaterial({vertexShader:'varying vec3 vC;varying float vS;void main(){vec3 n=normalize(mat3(instanceMatrix)*normal);'+
      'vS=.72+.28*max(n.y,0.)+.14*abs(n.x);vC=instanceColor;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',
      fragmentShader:'varying vec3 vC;varying float vS;void main(){gl_FragColor=vec4(vC*vS,1.);}'});mF.userData.g='feu';
    const flammes=new THREE.InstancedMesh(new THREE.BoxGeometry(e9*.84,e9*.84,e9*.84),mF,NF);
    flammes.frustumCulled=false;flammes.userData.brut=1;flammes.userData.noShadow=1;flammes.renderOrder=3;g.add(flammes);
    const PAL9=[[1,.93,.62],[1,.74,.16],[1,.42,.05],[.86,.13,.03]],M9=new THREE.Matrix4(),C9=new THREE.Color();
    let rs=0x9e3779b9;const rnd9=()=>{rs^=rs<<13;rs^=rs>>>17;rs^=rs<<5;return (rs>>>0)/4294967296;};
    const ET9=FL.map(f=>({s:0,h:new Array(9).fill(0),k:0}));                                   // par flamme : la pente, les 9 colonnes, l'étincelle
    const pasFeu=F=>{let n=0;const pose=(x,y,z,sc,c)=>{if(n>=NF)return;M9.makeScale(sc,sc,sc).setPosition(x,y,z);flammes.setMatrixAt(n,M9);
        C9.setRGB(c[0],c[1],c[2]);flammes.setColorAt(n,C9);n++;};
      FL.forEach((f,q)=>{const E9=ET9[q],yB=T(f[1])-.26,Hc=f[2]*(1+.45*F);
        if(rnd9()<.35)E9.s=Math.max(-1,Math.min(1,E9.s+(rnd9()<.5?-1:1)));                      // la pointe change de côté
        for(let c=0;c<9;c++){const dx=c%3-1,dz=(c/3|0)-1,w=dx===0&&dz===0?1:dx===0||dz===0?.62:.34;
          const H=Math.max(0,Math.round(Hc*w*(.68+.32*rnd9())));E9.h[c]=H;
          for(let j=0;j<H;j++){if(w===1&&j===H-2&&rnd9()<.22)continue;                            // la pointe se détache d'une case
            const u=j/Math.max(1,Hc)+(w<1?.28:0),pi=u<.2?0:u<.45?1:u<.75?2:3,sh=j>=H*.5?E9.s:0;
            pose(f[0]+(dx+sh)*e9,yB+(j+.5)*e9,f[1]+dz*e9,1,PAL9[pi]);}}
        E9.k+=1;if(E9.k>Math.round(Hc*.7)+3)E9.k=0;                                              // l'étincelle : monte d'une case par cran
        if(E9.k>0){const j=E9.h[4]+E9.k;pose(f[0]+E9.s*e9,yB+(j+.5)*e9,f[1],.62,PAL9[E9.k>3?3:2]);}});
      flammes.count=n;flammes.instanceMatrix.needsUpdate=true;if(flammes.instanceColor)flammes.instanceColor.needsUpdate=true;};
    pasFeu(0);let acc9=0;
    // LA VIE : le feu coule, l'onde court, la lave respire, les braises palpitent ; tout s'emballe à la nitro
    let t=0;const anime=dt=>{t+=dt;UF.uT.value=t;const fort=(typeof nitroOn!=='undefined'&&nitroOn)?1:0;UF.uF.value+=(fort-UF.uF.value)*Math.min(1,dt*4);
      const k=1+.22*Math.sin(t*2.3)*Math.sin(t*.8+1.3)+.15*UF.uF.value;cm.color.setRGB(k,k*.97,k*.94);
      const e=.72+.28*Math.abs(Math.sin(t*5.3)*Math.sin(t*3.1+.7))+.2*UF.uF.value;em.color.setRGB(e,e,e);acc9+=dt;if(acc9>=1/12){acc9=0;pasFeu(UF.uF.value);}};
    g.userData.anime=anime;anime(1/30);
    if(typeof BLING==='object'&&BLING&&BLING.anim)BLING.anim.push(anime);
    return {hl:[.30,.51,2.36],tl:[.40,.78,-2.36],wx:.80,wzF:ZF,wzR:-ZR,pots:[[.30,.48,-2.37],[-.30,.48,-2.37]],
            lpw:{R:R,w:.26,style:'multi',n:8,jante:0xff7a24,accent:0xff7a24,pneu:0x120d0c}}; // (Léo : « je préférais avant, avec les roues noires »)
  },
/* LE DOGE (2026-10-14, Léo : « fais une voiture tête de doge » · « dans le même esprit que la nyan cat ») — après les essais (gros voxels ;
   coupé puis muscle car avec la tête qui sort de la calandre — « nickel la tête » — ; visage peint dans le pare-brise ; tête au pare-brise ;
   visage réparti sur la caisse : « terrifiant »), Léo tranche : « LA GROSSE TÊTE DE SHIBA, mais avec des roues, les mêmes roues, un peu plus
   jaune le truc au milieu du pneu ». La voiture EST la tête :
   · LA TÊTE (`dogeTete`, sculptée : champ de distance lissé, couleurs de Kabosu, paupières lourdes, sourire en coin), en grand (×1,75) ;
   · LE REGARD : de vrais yeux (sphères : blanc, iris brun, pupille, éclat) qui suivent la caméra, un coup d'œil de l'autre côté par moments ;
     les deux points crème des SOURCILS se lèvent ; la tête PENCHÉE (le mème) hoche en roulant ; la LANGUE sort à la nitro ;
   · DESSOUS : un châssis sombre, deux essieux, les roues de bronze à cinq branches (centre jaune or), deux sorties d'or sous la nuque ;
   · SA TRAÎNÉE : « WOW » (les phrases du mème sortent des pots à la nitro, voir LA TRAÎNÉE WOW).
   Ce qui bouge : `BLING.anim` (jeu) et `userData.anime` (salle blanche). */
  doge:function(K){
    const R=.37,ZF=.62,ZR=-.62,KT=1.75,HY=1.02,HZ=.06;
    if(typeof WOWT==='object'&&WOWT)WOWT.caisse=true;
    const pal={k:{g:'nyl',c:0x111015},o:{g:'nyl',c:0xe0a83a},D:{g:'nyl',c:0x2a2830}};
    const mL=nyLaque(),mesh=(geo,par)=>{const m=new THREE.Mesh(geo,mL);m.userData.lp=1;(par||K).add(m);return m;};
    const g=K.add(new THREE.Group());
    // ---- 1. LE CHÂSSIS : une plaque sombre sous la tête, deux essieux, deux sorties d'or sous la nuque ----
    {const P=lpKit(pal);P.box('D',1.0,.12,1.10,0,.40,-.30);                                  // (la plaque recule : la langue pend devant, rien ne la coupe)
     P.cyl('k',.07,1.60,10,0,R,ZR,'x');
     P.sym(sd=>{P.cyl('o',.075,.30,14,sd*.24,.42,-.73,'z');P.cyl('k',.055,.31,14,sd*.24,.42,-.735,'z');}); // (2026-10-15, Léo : les pots « encastrés… comme les vraies voitures », sur toutes) elles dépassaient de 25 cm derrière la plaque : elles s'arrêtent à 3 cm (voir LES POTS ENCASTRÉS)
     const gs=P.done();for(const k in gs)mesh(gs[k],g);}
    // ---- 2. LA GROSSE TÊTE ----
    if(!SHAPES.doge._tete)SHAPES.doge._tete=dogeTeteObtient(); // (OPTIMISATION) celle de l'OUVRIER DU DOGE si elle est prête
    const DT=SHAPES.doge._tete,tete=new THREE.Group();tete.position.set(0,HY,HZ);tete.scale.setScalar(KT);g.add(tete);
    const pivot=new THREE.Group();tete.add(pivot);
    /* (2026-10-14, OPTIMISATION — relevé par GENERAL dans le code de Léo : « poseGueule renvoie 18 907 sommets à la carte graphique PAR IMAGE
       pour en bouger 673 ») LA LÈVRE DU HAUT EN QUEUE DU TAMPON : les sommets qui bougent (poidsU) sont rangés à la FIN, l'index renuméroté —
       mêmes sommets, mêmes triangles dans le même ordre : la même image. À chaque image, seule la queue repart (updateRange : ~16 Ko au lieu
       de ~450 Ko, position + normale). Rangé une fois par session (DT.U) ; `d0` = le premier sommet qui bouge. */
    if(!DT.U){const n=DT.P.length/3,W=DT.poidsU,bouge=new Uint8Array(n);for(let k=0;k<W.length;k+=2)bouge[W[k]]=1;
      const ord=new Int32Array(n),neu=new Int32Array(n);let q=0;for(let i=0;i<n;i++)if(!bouge[i])ord[q++]=i;const d0=q;for(let i=0;i<n;i++)if(bouge[i])ord[q++]=i;
      const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3),I=new Uint32Array(DT.I.length),WU=new Float32Array(W.length);
      for(let k=0;k<n;k++){neu[ord[k]]=k;const i=ord[k]*3,j=k*3;P[j]=DT.P[i];P[j+1]=DT.P[i+1];P[j+2]=DT.P[i+2];N[j]=DT.N[i];N[j+1]=DT.N[i+1];N[j+2]=DT.N[i+2];C[j]=DT.C[i];C[j+1]=DT.C[i+1];C[j+2]=DT.C[i+2];}
      for(let k=0;k<I.length;k++)I[k]=neu[DT.I[k]];for(let k=0;k<W.length;k+=2){WU[k]=neu[W[k]];WU[k+1]=W[k+1];}
      DT.U={P:P,N:N,C:C,I:I,WU:WU,d0:d0};}
    const U9=DT.U;
    {const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(U9.P,3));geo.setAttribute('normal',new THREE.BufferAttribute(U9.N,3));
     geo.setAttribute('color',new THREE.BufferAttribute(U9.C,3));geo.setIndex(new THREE.BufferAttribute(U9.I,1));geo.computeBoundingSphere();mesh(geo,pivot);}
    // les YEUX : blanc, iris brun, pupille, éclat — la sphère TOURNE (le regard)
    const oeilGeo=(()=>{const s=new THREE.SphereGeometry(1,28,20),p=s.attributes.position,c=new Float32Array(p.count*3);
      for(let i=0;i<p.count;i++){const z=p.getZ(i),x=p.getX(i),y=p.getY(i);let col=[1,1,1];
        if(z>.70)col=[.42,.24,.10];if(z>.86)col=[.07,.05,.05];if(z>.86&&x<-.12&&y>.12)col=[1,1,1];c.set(col,i*3);}
      s.setAttribute('color',new THREE.BufferAttribute(c,3));return s;})();
    const YEUX=DT.yeux.map(e=>{const o=new THREE.Group();o.position.set(e[0],e[1],e[2]);pivot.add(o);const m=mesh(oeilGeo,o);m.scale.setScalar(e[3]);return o;});
    // les SOURCILS : les deux points crème
    const sGeo=new THREE.SphereGeometry(1,16,10),sc=new Float32Array(sGeo.attributes.position.count*3);for(let i=0;i<sc.length;i+=3){sc[i]=.97;sc[i+1]=.91;sc[i+2]=.78;}
    sGeo.setAttribute('color',new THREE.BufferAttribute(sc,3));
    const SOUR=DT.sourcils.map(e=>{const m=mesh(sGeo,pivot);m.position.set(e[0],e[1],e[2]);m.scale.set(.078,.044,.034);m.rotation.z=e[0]>0?-.25:.25;m.userData.y0=e[1];return m;});
    // LA GUEULE : la lèvre du bas s'ouvre en se DÉFORMANT (rotation autour de la charnière, pondérée sommet par sommet : les coins restent
    // attachés), la lèvre du haut se retrousse un peu, la LANGUE (un ruban recalculé à chaque image) pend sur le côté et flotte au vent
    const geoN=G9=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(G9.P,3));geo.setAttribute('normal',new THREE.BufferAttribute(G9.N,3));
      geo.setAttribute('color',new THREE.BufferAttribute(G9.C,3));geo.setIndex(new THREE.BufferAttribute(G9.I,1));geo.computeBoundingSphere();return geo;};
    const CH=DT.charniere,YC=DT.YC,fJ=DT.fJ;
    const geoU=pivot.children[0].geometry,PU0=U9.P,NU0=U9.N,PU=new Float32Array(PU0),NU=new Float32Array(NU0),WU=U9.WU;   // le crâne : ses sommets de la lèvre du haut bougent (rangés en queue : U9.d0)
    geoU.setAttribute('position',new THREE.BufferAttribute(PU,3).setUsage(THREE.DynamicDrawUsage));geoU.setAttribute('normal',new THREE.BufferAttribute(NU,3).setUsage(THREE.DynamicDrawUsage));
    const DJ=DT.machoire,PJ=new Float32Array(DJ.P),NJ=new Float32Array(DJ.N),WJ=DT.poidsJ,geoJ=geoN({P:PJ,N:NJ,C:DJ.C,I:DJ.I});
    geoJ.attributes.position.setUsage(THREE.DynamicDrawUsage);geoJ.attributes.normal.setUsage(THREE.DynamicDrawUsage);mesh(geoJ,pivot);
    const tourne=(p,a,o)=>{const c=Math.cos(a),sn=Math.sin(a),dy=p[1]-CH[1],dz=p[2]-CH[2];o[0]=p[0];o[1]=CH[1]+dy*c-dz*sn;o[2]=CH[2]+dy*sn+dz*c;return o;}; // autour de la charnière (+ = vers le bas)
    let thPose=-1;
    const poseGueule=(th)=>{if(Math.abs(th-thPose)<1e-4)return;thPose=th;
      for(let i=0;i<WJ.length;i++){const a=th*WJ[i],c=Math.cos(a),sn=Math.sin(a),j=i*3,dy=DJ.P[j+1]-CH[1],dz=DJ.P[j+2]-CH[2],ny=DJ.N[j+1],nz=DJ.N[j+2];
        PJ[j+1]=CH[1]+dy*c-dz*sn;PJ[j+2]=CH[2]+dy*sn+dz*c;NJ[j+1]=ny*c-nz*sn;NJ[j+2]=ny*sn+nz*c;}
      geoJ.attributes.position.needsUpdate=true;geoJ.attributes.normal.needsUpdate=true;
      for(let k=0;k<WU.length;k+=2){const i=WU[k],a=-th*.32*WU[k+1],c=Math.cos(a),sn=Math.sin(a),j=i*3,dy=PU0[j+1]-CH[1],dz=PU0[j+2]-CH[2],ny=NU0[j+1],nz=NU0[j+2];
        PU[j+1]=CH[1]+dy*c-dz*sn;PU[j+2]=CH[2]+dy*sn+dz*c;NU[j+1]=ny*c-nz*sn;NU[j+2]=ny*sn+nz*c;}
      {const o9=U9.d0*3,c9=PU.length-o9,aP=geoU.attributes.position,aN=geoU.attributes.normal; // (OPTIMISATION) seule la queue qui bouge repart à la carte graphique
       aP.updateRange.offset=aN.updateRange.offset=o9;aP.updateRange.count=aN.updateRange.count=c9;aP.needsUpdate=true;aN.needsUpdate=true;}
      for(const d of DENTS){tourne(d.p,d.s*th*fJ(d.p[0],d.p[2])*(d.s<0?.32:1),d.q);d.m.position.set(d.q[0],d.q[1],d.q[2]);d.m.rotation.x=d.r+(d.s<0?-.32:1)*th*fJ(d.p[0],d.p[2]);}};
    const dentG=(()=>{const c=new THREE.ConeGeometry(1,1,8),n=c.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set([.98,.96,.91],i*3);
      c.setAttribute('color',new THREE.BufferAttribute(a,3));return c;})();
    const DENTS=[];
    for(const d of DT.dentsH){const m=mesh(dentG,pivot);m.scale.set(d[2],d[3],d[2]);DENTS.push({m,s:-1,r:Math.PI,p:[d[0],YC(d[0])-d[3]/2+.006,d[1]],q:[0,0,0]});}  // en haut : la pointe en bas
    for(const d of DT.dentsB){const m=mesh(dentG,pivot);m.scale.set(d[2],d[3],d[2]);DENTS.push({m,s:1,r:0,p:[d[0],YC(d[0])+d[3]/2-.006,d[1]],q:[0,0,0]});}       // en bas : la pointe en haut
    // LA LANGUE : posée sur le plancher de la lèvre du bas, elle sort par le côté gauche de la bouche et pend ; au vent elle file en arrière et claque
    const TN=20,TM=10,tPos=new Float32Array(TN*TM*3),tCol=new Float32Array(TN*TM*3),tIx=[];
    for(let i=0;i<TN-1;i++)for(let j=0;j<TM;j++){const a=i*TM+j,b=i*TM+(j+1)%TM;tIx.push(a,a+TM,b,b,a+TM,b+TM);}
    {const q=new THREE.Color();for(let i=0;i<TN;i++)for(let j=0;j<TM;j++){q.setHex(j===TM/4?0xe2506c:0xff7393);tCol.set([q.r,q.g,q.b],(i*TM+j)*3);}}
    const tGeo=new THREE.BufferGeometry();tGeo.setAttribute('position',new THREE.BufferAttribute(tPos,3).setUsage(THREE.DynamicDrawUsage));
    tGeo.setAttribute('color',new THREE.BufferAttribute(tCol,3));tGeo.setIndex(tIx);
    const langue=mesh(tGeo,pivot);langue.frustumCulled=false;langue.userData.noShadow=1;langue.visible=false;
    const LIN=[[-.01,YC(-.01)+.012,.32],[-.04,YC(-.04)+.014,.44],[-.07,YC(-.07)+.012,.53],[-.095,YC(-.095)+.006,.585]],NIN=6,PL=[],LT=[0,0,0];   // dans la bouche, jusqu'au bord de la lèvre
    for(let i=0;i<TN;i++)PL.push([0,0,0]);
    const nz3=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;v[0]/=l;v[1]/=l;v[2]/=l;return v;};
    const posLangue=(lk,sv,F9,t9,th)=>{
      for(let i=0;i<NIN;i++){const u=i/(NIN-1)*(LIN.length-1),k=Math.min(LIN.length-2,Math.floor(u)),f=u-k,A=LIN[k],B=LIN[k+1];
        LT[0]=A[0]+(B[0]-A[0])*f;LT[1]=A[1]+(B[1]-A[1])*f;LT[2]=A[2]+(B[2]-A[2])*f;tourne(LT,th*fJ(LT[0],LT[2]),PL[i]);}       // elle suit la lèvre du bas
      const R0=PL[0],wind=.25+1.9*sv+F9*.7,ex=nz3([-.55,-.25,.80]),ha=nz3([-.30,-1,-wind]),d=[0,0,0],Ls=.042;
      for(let i=NIN;i<TN;i++){const u=(i-NIN)/(TN-NIN-1),w=Math.min(1,u*1.7),e=w*w*(3-2*w);
        d[0]=ex[0]+(ha[0]-ex[0])*e;d[1]=ex[1]+(ha[1]-ex[1])*e;d[2]=ex[2]+(ha[2]-ex[2])*e;nz3(d);
        const fl=(.18+.55*sv+.3*F9)*u;d[0]+=.30*Math.sin(t9*(13+6*sv)-i*.8)*fl;d[2]+=.22*Math.cos(t9*(10+5*sv)-i*.6)*fl;nz3(d);   // elle CLAQUE au vent
        const P0=PL[i-1];PL[i][0]=P0[0]+d[0]*Ls;PL[i][1]=P0[1]+d[1]*Ls;PL[i][2]=P0[2]+d[2]*Ls;}
      for(const P of PL){P[0]=R0[0]+(P[0]-R0[0])*lk;P[1]=R0[1]+(P[1]-R0[1])*lk;P[2]=R0[2]+(P[2]-R0[2])*lk;}                       // elle rentre quand la bouche se ferme
      let W=null,o=0;const T=[0,0,0];
      for(let i=0;i<TN;i++){const a=PL[Math.max(0,i-1)],b=PL[Math.min(TN-1,i+1)];T[0]=b[0]-a[0];T[1]=b[1]-a[1];T[2]=b[2]-a[2];nz3(T);
        if(!W)W=nz3([T[2],0,-T[0]]);else{const k=W[0]*T[0]+W[1]*T[1]+W[2]*T[2];W[0]-=T[0]*k;W[1]-=T[1]*k;W[2]-=T[2]*k;nz3(W);}   // la largeur, transportée le long de la langue
        const N=nz3([T[1]*W[2]-T[2]*W[1],T[2]*W[0]-T[0]*W[2],T[0]*W[1]-T[1]*W[0]]);
        const bout=i>TN-4?Math.sqrt(Math.max(0,1-Math.pow((i-(TN-4))/3,2))):1,wi=.075*bout*(i<2?.8+.1*i:1),th2=.024*Math.max(.35,bout);
        for(let j=0;j<TM;j++){const ph=j/TM*Math.PI*2,c=Math.cos(ph)*wi,sn=Math.sin(ph)*th2;
          tPos[o++]=PL[i][0]+W[0]*c+N[0]*sn;tPos[o++]=PL[i][1]+W[1]*c+N[1]*sn;tPos[o++]=PL[i][2]+W[2]*c+N[2]*sn;}}
      tGeo.attributes.position.needsUpdate=true;tGeo.computeVertexNormals();};
    // ---- 3. LA VIE ----
    let rs=0x0d06e5;const rnd=()=>{rs^=rs<<13;rs^=rs>>>17;rs^=rs<<5;return (rs>>>0)/4294967296;};
    let t=0,F=0,sV=0,pPrev=null,regard=1,gz=1,coupT=2+rnd()*3,coupD=0,sourT=2,sourD=0,sourD0=0,sourY=0,oreT=3,oreD=0,ouv=0,lk=0;
    const V9=new THREE.Vector3();
    const anime=dt=>{dt=Math.min(dt,.1);t+=dt;
      const fort=(typeof nitroOn!=='undefined'&&nitroOn)?1:0;F+=(fort-F)*Math.min(1,dt*6);
      const e=g.matrixWorld.elements;
      if(pPrev){const d=Math.hypot(e[12]-pPrev[0],e[13]-pPrev[1],e[14]-pPrev[2])/Math.max(dt,1e-3);sV+=(Math.min(1,d/40)-sV)*Math.min(1,dt*3);}else pPrev=[0,0,0];
      pPrev[0]=e[12];pPrev[1]=e[13];pPrev[2]=e[14];
      // le REGARD : du côté de la caméra, et un coup d'œil de l'autre côté par moments (l'œil saute, il ne glisse pas)
      try{if(typeof camera!=='undefined'&&camera&&camera.isCamera){V9.copy(camera.position);pivot.worldToLocal(V9);if(V9.x>.4)regard=1;else if(V9.x<-.4)regard=-1;}}catch(_){}
      coupT-=dt;if(coupT<=0){coupD=.6;coupT=3+rnd()*4;}const vise=coupD>0?-regard:regard;if(coupD>0)coupD-=dt;
      gz+=(vise-gz)*Math.min(1,dt*22);
      for(const o of YEUX){o.rotation.y=gz*.62;o.rotation.x=-.10;}
      // les SOURCILS se lèvent (deux fois de suite, parfois), et restent levés à la nitro
      sourT-=dt;if(sourT<=0){sourD=rnd()<.35?.9:.5;sourD0=sourD;sourT=2+rnd()*3.5;}if(sourD>0)sourD-=dt;
      const lev=F>.5||(sourD>0&&!(sourD0>.6&&sourD>.40&&sourD<.52));sourY+=((lev?.035:0)-sourY)*Math.min(1,dt*20);
      for(const m of SOUR)m.position.y=m.userData.y0+sourY;
      // LA GUEULE : fermée au repos (le sourire en coin) ; il HALÈTE quand il roule et au BURN-OUT, grande ouverte à la nitro — la langue pend et ballotte
      let bk=0;try{if(typeof BURN!=='undefined'&&BURN&&typeof garageOn!=='undefined'&&garageOn)bk=BURN.k||0;}catch(_){}
      let vise9=Math.max(sV>.10?.85:0,bk>.03?.85:0,F>.3?1:0);if(typeof DOGE_GUEULE==='number')vise9=DOGE_GUEULE;   // (console) dbgDoge(1) : la gueule ouverte
      ouv+=(vise9-ouv)*Math.min(1,dt*(vise9>ouv?3.2:4));                                          // PROGRESSIVEMENT
      const hal=ouv>.05?Math.sin(t*(F>.5?16:11))*.06*ouv:0,th=Math.max(0,ouv*.75+hal);poseGueule(th);   // la bouche s'ouvre depuis le trait, en se déformant ; le halètement
      lk+=((ouv>.3?1:0)-lk)*Math.min(1,dt*6);langue.visible=lk>.02;if(langue.visible)posLangue(lk,sV,F,t,th);
      // la tête PENCHÉE du mème, qui hoche en roulant ; un à-coup d'oreille de temps en temps
      oreT-=dt;if(oreT<=0){oreD=.14;oreT=2.5+rnd()*4;}if(oreD>0)oreD-=dt;
      pivot.rotation.z=.10+(oreD>0?.05:0)+Math.sin(t*(F>.5?14:7))*.025*Math.max(sV,F);
      pivot.position.y=Math.abs(Math.sin(t*(F>.5?14:7)))*.025*Math.max(sV,F);};
    anime(1/30);
    g.userData.anime=anime;
    if(typeof BLING==='object'&&BLING&&BLING.anim)BLING.anim.push(anime);
    return {hl:[.32,1.1,1.05],tl:[.30,.70,-.90],lamps:0,halos:0,wx:.82,wzF:ZF,wzR:-ZR,pots:[[.24,.42,-.89],[-.24,.42,-.89]],
            lpw:{R:R,w:.34,style:'rayons',n:5,jante:0xffc42e,accent:0xffc42e,pneu:0x141118}};   // (« un peu plus jaune le truc au milieu du pneu »)
  }
});
/* ===== LA GAMME DES 50 — FIN ===== */
/* ============================================================================================
   L'ORIGAMI (2026-10-02, Sacha, photo du pick-up d'inox : « mets cette voiture dans le jeu, fais-la exceptionnellement belle et
   parfaite ») — le pick-up plié dans UNE feuille d'acier : zéro courbe, un toit en TRIANGLE dont la pointe est au-dessus du
   conducteur, deux barres de feux d'un bord à l'autre (blanche devant, rouge derrière), des élargisseurs noirs taillés en trapèze,
   un couvre-benne en lames d'acier. Sans son nom ni son logo, comme toute la gamme. Cotes réelles : 5,68 × 2,03 × 1,79 m.
   ⚠ CE QUI LA REND JUSTE : CHAQUE PAN EST UN VRAI PLAN. Sur de l'inox (matière chrome), un quadrilatère gauchi se voit tout de
   suite : ses deux triangles prennent deux reflets, et la diagonale apparaît en travers de la portière. Ici les pans sont des plans
   EXACTS, écrits comme tels :
     · le FLANC BAS  : x = xW(z) − KL·(yS(z) − y)   — il rentre vers le bas de caisse ;
     · le FLANC HAUT : x = xW(z) − TB·(y − yS(z))   — vitres ET montants, il rentre vers le toit ;
     · le DESSUS     : y = T(z), plat d'un bord à l'autre (capot, pare-brise, toit de verre, couvre-benne) ;
     · la face et la poupe : les deux bouchons du loft.
   `yS` (L'ARÊTE qui court du phare au feu), `xW` et `T` sont affines par morceaux, et chaque cassure est une station du loft : entre
   deux stations tout reste coplanaire. Ce qui se pose DESSUS (vitres, lames, joints de portes) s'écrit dans le repère du pan (`SU`,
   `SL`, `TP`), décollé de 6 mm : un polygone dans le plan, jamais une boîte qu'il faudrait incliner à la main.
   ⚠ `TB` .64 (33° de dévers) n'est pas qu'une cote : à 27° (.50) comme à 30° (.58), le flanc haut renvoyait pile le contre-jour
   ROSE du studio photo dans l'objectif (carPhoto) — vitre et montant sortaient d'un seul aplat blanc, puis magenta, sur la vignette
   du garage : un plan n'a qu'une normale, il s'allume en entier. À 33°, la vitre reste sombre.
   ⚠ LE COUVRE-BENNE EST EN ACIER, pas noir : en poursuite on voit SURTOUT le dessus de la caisse — tout noir (verre + rideau noir),
   elle perdait son inox. Neuf lames, un ton sur deux ; pas de rainure fine (de loin elle scintille en pointillé).
   Électrique : pas de pot. Les tuyères sortent sous le bouclier arrière (fiche `pots`).
   ========================================================================================== */
/* LA POUPÉE (2026-10-16, Léo : « fais une belle Porsche Cayenne rose Barbie » · « un rose plus pâle, une Cayenne, vraiment Cayenne : le devant
   un peu arrondi, un peu gros ; elle a une forme unique, fais ce qu'il faut pour la retranscrire ; pas besoin du logo, va dans l'exactitude de
   la forme »). Calée sur des photos de la Cayenne 2018-2025 (profil, trois-quarts, face, poupe). Au kit low-poly, à facettes. */
SHAPES.poupee=function(K){
  /* LA POUPÉE — le grand SUV de luxe allemand (la ligne de la Cayenne 2018-2023), en rose poupée pâle. Calée sur des photos (profil,
     trois-quarts avant, gros plans du nez et des jantes). PEU DE PLIS : chaque arête tombe sur une vraie ligne de la voiture —
     le bas de caisse, la nervure basse des portières, l'ÉPAULE, la ceinture, la crête des ailes ; le nez s'arrondit en TROIS grandes
     facettes (en plan et en profil) ; les phares, les bouches et le bandeau de feux sont des facettes de la caisse peintes, pas des
     pièces posées : ils suivent la forme au millimètre. */
  const U=LPU,R=.385,ZF=1.48,ZR=-1.42,ZE=2.465,ZB=-2.465;
  const P=K.kit({p:{g:'p',c:0xf49bcb},k:{g:'m',c:0x161419},K:{g:'g',c:0x0c0b0f},c:{g:'c',c:0xeef0f4},
    g:{g:'g',c:0x1d1820},W:{g:'l',c:0xf4f7ff},L:{g:'l',c:0xff1a3a},r:{g:'l',c:0x7a0a1e},O:{g:'l',c:0xffa21a},m:{g:'s',c:0x2c2930},
    s:{g:'s',c:0xd9c9d2},e:{g:'s',c:0xeceef1}});
  const AR=[[0,2*R+.05],[R*.72,2*R+.025],[R+.05,R*1.12],[R+.17,.31]];
  const CW=.90,RF=-.10,BP=-.34,RD=-1.13,RR=-1.97,RB=-2.30,QT=-1.61; // pied de pare-brise · haut du pare-brise · montant B · fin de la portière arrière · becquet · bas de lunette · pointe de la custode
  const NZ=[ZE-.42,ZE-.30,ZE-.18,ZE-.06,ZE-.025,ZE], NB=[ZB,ZB+.05,ZB+.15,ZB+.30];  // les stations du NEZ et de la POUPE : peu, bien placées
  const zs=[...NB,RB,-2.14,RR,QT,RD-.02,RD+.02,BP-.04,BP+.04,RF,.86,CW,1.65,...NZ];
  for(const w of [ZF,ZR])for(const d of [R*.72,R+.05,R+.17])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const yC=z=>U.lin([[ZB,1.17],[-2.40,1.20],[RB,1.255],[-2.14,1.42],[RR,1.585],[-1.60,1.645],[RD,1.68],[BP,1.695],[RF,1.665],[.86,1.19],[CW,1.15],[1.65,1.075],[ZE-.42,1.005],[ZE,.975]],z),
        xW=z=>U.lin([[ZB,.93],[-2.30,.955],[-1.90,.965],[2.10,.965],[ZE,.955]],z),                    // la voie des flancs
        xF=z=>.018*U.cl(1-Math.abs(z-ZF)/.70,0,1)+.036*U.cl(1-Math.abs(z-ZR)/1.0,0,1),              // les ailes bombées sur les roues
        bL=z=>U.lin([[ZB,1.15],[-2.38,1.18],[RB,1.205],[QT,1.215],[RD,1.195],[BP,1.17],[RF,1.16],[CW,1.145],[1.65,1.085],[ZE-.42,1.0],[ZE-.18,.975],[ZE,.95]],z), // la ceinture · devant, le haut des phares
        crH=z=>U.lin([[CW,.02],[1.65,.04],[ZE-.42,.05],[ZE,.04]],z),                                 // la crête de l'aile au-dessus du capot
        yE=z=>U.lin([[RB,1.275],[-2.14,1.39],[RR,1.525],[QT,1.565],[RD,1.585],[BP,1.60],[RF,1.585],[.86,1.20],[CW,1.152]],z), // le rebord du pavillon (et les montants)
        xG=z=>U.lin([[RB,.80],[RR,.76],[BP,.74],[RF,.75],[.86,.88],[CW,.90]],z),
        yWin=(z,bl,ye)=>z<QT?bl:z<RD?U.lin([[QT,bl+.004],[RD,ye-.035]],z):ye-.035,          // le haut des vitres : la custode file en pointe
        cab=z=>z>RB-.001&&z<CW+.001;
  // LE NEZ ET LA POUPE S'ARRONDISSENT en trois facettes : en plan (x se resserre) et en profil (le haut se referme vers le bouclier)
  const kxF=z=>U.lin([[ZE-.42,1],[ZE-.30,.975],[ZE-.18,.915],[ZE-.06,.74],[ZE-.025,.58],[ZE,.44]],z),
        kTF=z=>U.lin([[ZE-.18,1],[ZE-.06,.90],[ZE-.025,.78],[ZE,.64]],z),
        kBF=z=>U.lin([[ZE-.18,1],[ZE-.06,.96],[ZE,.80]],z),
        kxR=z=>U.lin([[ZB,.70],[ZB+.05,.86],[ZB+.15,.95],[ZB+.30,1]],z),
        kTR=z=>U.lin([[ZB,.84],[ZB+.05,.94],[ZB+.15,.99],[ZB+.30,1]],z),
        kBR=z=>U.lin([[ZB,.70],[ZB+.05,.86],[ZB+.15,.96],[ZB+.30,1]],z);
  const raw=z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.31),c=yC(z),xw=xW(z),xf=xw+xF(z),bl=bL(z),
          ner=z>ZR+R+.12&&z<ZF-R-.12?U.cl(Math.min(z-(ZR+R+.12),(ZF-R-.12)-z)/.30,0,1):0,   // la NERVURE basse des portières (entre les roues)
          y2=Math.max(yb+.06,.42),
          y3=Math.max(y2+.01,z>ZE-.42?.62:U.lin([[ZF,.60],[ZR,.67]],z)),                     // devant : le haut des bouches · flanc : la nervure, qui monte vers l'arrière
          off=z>ZE-.42?U.lin([[ZE-.42,.10],[ZE-.30,.15],[ZE-.18,.16],[ZE-.06,.125],[ZE,.06]],z):z<RB?U.lin([[ZB,.045],[RB,.06]],z):U.lin([[RB,.06],[RD,.10]],z),
          y4=Math.max(y3+.02,bl-off),                                                         // l'ÉPAULE · devant : le bas des phares · derrière : le bas du bandeau
          s=[[0,yb],[xf-.08,yb],[xf-.004,y2],[xf+.006+.018*ner,y3],[xf+.014,y4],[xw-.04,bl]];
    const x5=xw-.04;
    if(cab(z)){const ye=Math.max(bl+.006,yE(z)),yw=Math.min(ye-.002,Math.max(bl+.002,yWin(z,bl,ye))),XV=y=>x5-(y-bl)*.42; // le PLAN des vitres
      const xe=Math.min(XV(ye),z>RF?9:xG(z)+.02);
      s.push([XV(yw),yw],[xe,ye],[xe-.14,Math.max(ye+.002,Math.min(c-.01,ye+.045))],[0,Math.max(ye+.006,c)]);}
    else if(z>CW){const cr=Math.max(bl+.03,c+crH(z));
      s.push([xw-.10,cr],[xw-.30,cr-.014],[xw-.52,Math.max(c+.004,cr-.04)],[0,c+.016]);}
    else{s.push([xw-.09,bl+.03],[xw-.20,Math.max(bl+.05,c-.01)],[xw-.50,c],[0,c+.006]);}
    return s;};
  const S=z=>{const s=raw(z);
    if(z>ZE-.43){const kx=kxF(z),kt=kTF(z),kb=kBF(z),ym=.58;for(const p of s){p[0]*=kx;p[1]=p[1]>ym?ym+(p[1]-ym)*kt:ym-(ym-p[1])*kb;}}
    if(z<ZB+.31){const kx=kxR(z),kt=kTR(z),kb=kBR(z),ym=.72;for(const p of s){p[0]*=kx;p[1]=p[1]>ym?ym+(p[1]-ym)*kt:ym-(ym-p[1])*kb;}}
    return s;};
  // ---- LA PEINTURE : chaque facette choisit sa matière d'après sa bande et sa place ----
  P.loft(zs,S,(j,z)=>{
    if(j<0)return 'p';                                                       // les deux bouchons : des pièces posées dessus (plus bas)
    if(j===0||j===1)return 'k';                                              // dessous, bas de caisse noir
    if(z>ZE-.43){                                                            // LA FACE
      if(j===2)return z>ZE-.30&&z<ZE-.026?'k':'p';                           // les BOUCHES des coins (la lame couleur caisse vers le milieu)
      if(j===4)return z>ZE-.35?'K':'p';                                      // LES PHARES : la facette sous la crête de l'aile, qui s'enroule
      return 'p';}
    if(z<ZB+.31){if(j===2)return 'k';if(j===4)return 'L';if(j===3)return 'p';} // LA POUPE : diffuseur, BANDEAU de feux qui s'enroule
    if(!cab(z))return 'p';
    if(j===5){if(z>BP+.04)return z>.86?'p':'g';if(z>BP-.04)return 'K';if(z>RD+.02)return 'g';if(z>RD-.02)return 'K';if(z>QT)return 'g';return 'p';} // vitres · montant B · montant C · custode
    if(j===6)return z>.86?'p':z>QT?'c':'p';                                  // le jonc chromé autour des vitres
    if(j>=7){if(z>RF+.02)return 'g';if(z<RR&&z>RB+.01)return 'g';return 'p';} // pare-brise, lunette, toit
    return 'p';});
  // ---- LES DÉTAILS POSÉS SUR LA PEAU ----
  const wAt=(z,y)=>{const s=S(z);for(let i=1;i<s.length-1;i++){const a=s[i],b=s[i+1];if(y>=a[1]&&y<=b[1]&&b[1]>a[1])return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);}return 0;};
  const zFace=(x,y,sg)=>{let lo=sg>0?1.6:ZB,hi=sg>0?ZE:-1.6;for(let i=0;i<30;i++){const m=(lo+hi)/2,ok=wAt(m,y)>=x;if(sg>0){if(ok)lo=m;else hi=m;}else{if(ok)hi=m;else lo=m;}}return sg>0?lo:hi;};
  const decal=(k,w,h,d,x,y,sg,e)=>{const z=zFace(Math.abs(x),y,sg),e9=.012,zx=(zFace(Math.abs(x)+e9,y,sg)-zFace(Math.max(0,Math.abs(x)-e9),y,sg))/(2*e9)*(x<0?-1:1),
      zy=(zFace(Math.abs(x),y+e9,sg)-zFace(Math.abs(x),y-e9,sg))/(2*e9);
    let n=sg>0?[-zx,-zy,1]:[zx,zy,-1];const l=Math.hypot(n[0],n[1],n[2]);n=n.map(v=>v/l);
    const o=d/2-(e||0);P.box(k,w,h,d,x+n[0]*o,y+n[1]*o,z+n[2]*o,Math.atan2(-n[1],n[2]),Math.asin(n[0]),0);};
  // le bouchon du nez : la grande bouche du milieu, ses lames ; la barre couleur caisse au-dessus reste la peau
  {const s=S(ZE),y0=s[0][1],y3=s[3][1],w=wAt(ZE,(y0+y3)/2)-.005;P.box('k',2*w,y3-y0,.004,0,(y0+y3)/2,ZE+.002);
   for(let i=0;i<3;i++)P.box('m',2*w-.04,.012,.01,0,y0+(y3-y0)*(.3+i*.22),ZE+.006);}
  P.sym(sd=>{
    for(let i=0;i<3;i++)decal('m',.13,.014,.03,sd*.69,.45+i*.055,1,.012);  // les lames des bouches des coins
    // les QUATRE POINTS de lumière et le projecteur, sur la facette du phare
    const s=S(ZE-.12),yh=(s[4][1]+s[5][1])/2;
    for(const q of [[.60,.012],[.66,.012],[.60,-.016],[.66,-.016]])decal('W',.04,.016,.03,sd*q[0],yh+q[1],1,.008);
    decal('c',.07,.045,.03,sd*.79,yh+.004,1,.008);decal('W',.05,.03,.03,sd*.79,yh+.004,1,.002);
    // les flancs : rétros couleur caisse sur pied noir, poignées, joints de portières
    P.prism('k',[[.88,1.12],[.70,1.12],[.74,1.17],[.84,1.17]],.07,sd*.925);P.box('p',.07,.05,.07,sd*.975,1.165,.78);
    P.box('p',.10,.115,.21,sd*1.025,1.19,.76,0,sd*.10,0);P.box('p',.06,.09,.16,sd*1.08,1.19,.73,0,sd*.18,0);
    P.box('K',.012,.085,.15,sd*1.105,1.19,.70,0,sd*.18,0);P.box('O',.012,.016,.12,sd*1.03,1.137,.76,0,sd*.10,0);
    P.box('c',.02,.022,.16,sd*.982,1.06,.42);P.box('c',.02,.022,.16,sd*.988,1.08,-.64);
    for(const z of [.86,BP,RD])P.box('k',.012,.58,.012,sd*.984,.84,z);
    decal('r',.10,.03,.02,sd*.78,.56,-1,.006);                               // les catadioptres
    // LES ÉTRIERS de frein, blancs, derrière les jantes (ils ne tournent pas)
    for(const w of [ZF,ZR]){const ph=2.55,rr=.215;P.box('e',.07,.085,w>0?.22:.18,sd*(.83+.12-.075),R+Math.sin(ph)*rr,w+Math.cos(ph)*rr,Math.PI/2-ph,0,0);}
  });
  // ---- LA POUPE ----
  {const s=S(ZB);P.box('L',2*s[4][0],s[5][1]-s[4][1],.004,0,(s[4][1]+s[5][1])/2,ZB-.002);              // le bandeau, sur le bouchon
   P.box('k',2*s[2][0],s[3][1]-s[0][1],.004,0,(s[0][1]+s[3][1])/2,ZB-.002);}                            // le diffuseur
  P.sym(sd=>{for(let i=0;i<4;i++)decal('r',.05,.02,.02,sd*(.60+i*.07),1.12,-1,.004);});                // les segments des feux
  decal('K',.50,.15,.02,0,.80,-1,.008);decal('s',.46,.11,.02,0,.80,-1,.0);  // la plaque
  {const H=[];for(let i=0;i<=24;i++){const t=i/24*Math.PI*2;H.push([.005*16*Math.pow(Math.sin(t),3),.005*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))]);}
   const zh=zFace(0,1.00,-1);P.plate('c',H.map(p=>[p[0],p[1]+1.00]),.02,zh-.014);}  // un petit CŒUR chromé à la place du blason
  // le becquet de pavillon qui déborde sur la lunette, le feu stop dessous
  P.prism('p',[[RR+.06,yC(RR+.06)-.004],[RR-.10,yC(RR)-.035],[RR-.12,yC(RR)-.018],[RR+.06,yC(RR+.06)+.014]],1.30,0);
  P.box('L',.50,.012,.05,0,yC(RR)-.03,RR-.08,.38,0,0);
  K.commit(P);
  // ---- LES JANTES : la « 5 doubles branches » de la Cayenne — dix branches argent en V, fond noir, la jante GRANDE (pneu bas),
  // le disque, le cache-moyeu ; posées DANS la roue (`roueDeco` : elles tournent avec elle, le miroir des roues de gauche suit).
  const JW=.31,hw=JW/2,fx=hw-.035,RJ=R*.74,J=lpKit({k:{g:'m',c:0x16171a},c:{g:'c',c:0xe4e8ed},d:{g:'m',c:0x141518},b:{g:'s',c:0x2e2925}});
  J.lathe('k',[[RJ,-hw],[R*.90,-hw],[R,-hw*.62],[R,hw*.62],[R*.90,hw],[RJ,hw]],20,0,0,0,'x');   // le pneu, bas
  J.lathe('d',[[RJ,-hw+.02],[RJ,fx-.004]],20,0,0,0,'x');J.lathe('d',[[RJ,-hw+.03],[R*.10,-hw+.03]],20,0,0,0,'x'); // le fût, le fond (au fond de la roue)
  J.lathe('d',[[R*.26,fx-.004],[R*.10,fx-.004]],16,0,0,0,'x');                                 // le voile du moyeu : entre les branches, on voit le disque et l'étrier
  J.lathe('b',[[R*.56,fx-.05],[R*.26,fx-.05]],20,0,0,0,'x');                                   // le disque de frein
  J.lathe('c',[[RJ+.002,fx-.006],[RJ*.94,fx+.012]],24,0,0,0,'x');                              // la lèvre
  const pt=(a,r,x)=>[x,Math.sin(a)*r,Math.cos(a)*r],XF=fx+.016,XB=fx-.004;
  const branche=(a0,a1,r0,r1,w0,w1)=>{const q=[],m=(a,r,dw)=>{const y=Math.sin(a)*r,z=Math.cos(a)*r,ty=Math.cos(a),tz=-Math.sin(a);return [y+ty*dw,z+tz*dw];};
    const A=m(a0,r0,-w0/2),B=m(a1,r1,-w1/2),C=m(a1,r1,w1/2),D=m(a0,r0,w0/2),F=(p,x)=>[x,p[0],p[1]];
    J.tri('c',F(A,XF),F(B,XF),F(C,XF));J.tri('c',F(A,XF),F(C,XF),F(D,XF));                 // la face usinée, argent
    for(const [p,q2] of [[A,B],[C,D]]){J.tri('d',F(p,XF),F(p,XB),F(q2,XB));J.tri('d',F(p,XF),F(q2,XB),F(q2,XF));}}; // les flancs, noirs
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2;for(const e of [-1,1])branche(a+e*.06,a+e*.24,R*.16,RJ*.95,.040,.030);}
  J.cyl('c',R*.17,.03,10,fx+.002,0,0,'x');J.cyl('d',R*.11,.012,10,fx+.018,0,0,'x');           // le moyeu, son cache
  const JG=J.done();
  return {hl:[.66,.90,2.42],tl:[.72,1.11,-2.47],wx:.83,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe4e8ed}};
};
