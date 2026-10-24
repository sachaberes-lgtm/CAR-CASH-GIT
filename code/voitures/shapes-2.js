  /* ============================================================================================
     LES TROIS FANTASTIQUES — d'après les planches de référence. Matières GÉNÉRATIVES (`MATV`).
     ========================================================================================== */
  // 13. ACIDE — compacte japonaise kittée : CAPOT VITRÉ sur le bloc, aileron de table à repasser,
  //     pare-chocs proéminent, peinture à paillettes. Le trait qui la vend : on voit le moteur.
  tuner(K){
    const {W,H,L,y0,box:B,spec}=K;
    const vernis=new THREE.MeshPhongMaterial({color:spec.color,map:MATV.get('flake'),emissive:spec.color,
      emissiveIntensity:.26,shininess:220,specular:0xffffff,envMap:envTex,reflectivity:.72,combine:THREE.MixOperation});
    rimify(vernis,[.083,.5,3,.2]); // (2026-09-26) le vernis : 72 % de ciel de face noyaient le vert acide — (vague 2) même contrat que toute la gamme : ~6 % de face, ~36 % en rasant, teinté
    // trois volumes de hatch : capot court, pare-brise très incliné, toit, hayon coupé net
    /* ===== LE RELIEF DU FLANC (2026-10-20, Léo : « le relief visible quand on tourne autour » ; l'étude de la gamme au garage : n° 6 des plus
       plates, « une porte en dalle entre deux jupes ») ===== la caisse n'est plus le profil EXTRUDÉ (des flancs plans par construction) mais un
       LOFT de sections qui garde la MÊME silhouette de profil (le biseau de 9 cm de carProfile compris : la poupe, le nez, le toit restent où
       les pièces les attendent) : le BAS qui rentre (il regarde le sol), la porte qui penche jusqu'à l'ARÊTE, l'ÉPAULE qui rentre sous les
       vitres (elle regarde le ciel), la HANCHE arrière qui gonfle devant l'aile rivetée, l'aile avant un peu bombée. `xFl(z,y)` : le flanc à
       une hauteur (stickers, fentes de portières, poignée s'y posent, en décalques). */
    const BEV=Math.min(.09,W*.94*.055),xb=W*.94/2,lis=t=>{t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
    const OF=(()=>{const U=[[.5*L,0],[.5*L,.34*H],[.34*L,.42*H],[.16*L,.46*H],[.02*L,.90*H],[-.34*L,.94*H],[-.44*L,.62*H],[-.5*L,.56*H],[-.5*L,0]],
        lg=[];for(let i=0;i<U.length-1;i++){const a=U[i],b=U[i+1],dz=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dz,dy),n=[dy/l,-dz/l];lg.push([[a[0]+n[0]*BEV,a[1]+n[1]*BEV],[dz,dy]]);}
        const o=[[.5*L+BEV,-BEV]];for(let i=0;i<lg.length-1;i++){const [p,d]=lg[i],[q,e]=lg[i+1],den=d[0]*e[1]-d[1]*e[0],t=((q[0]-p[0])*e[1]-(q[1]-p[1])*e[0])/den;o.push([p[0]+d[0]*t,p[1]+d[1]*t]);}
        o.push([-.5*L-BEV,-BEV]);return o;})();
    const topY=z=>{for(let i=1;i<OF.length-2;i++){const a=OF[i],b=OF[i+1];if(z<=a[0]&&z>=b[0])return a[1]+(b[1]-a[1])*(z-a[0])/((b[0]-a[0])||1);}return z>0?OF[1][1]:OF[OF.length-2][1];};
    const hanche=z=>.028*lis((-.40-z)/.30)*lis((z+.5*L+BEV)/.20),aileAv=z=>.012*lis((z-.45)/.25)*lis((.5*L+BEV-z)/.20);
    const sec=(z,e)=>{const t=topY(z)-(e?.03:0),b=-BEV+(e?.03:0),x0=xb-(e?.05:0),f=hanche(z)+aileAv(z),yBl=Math.min(t-.004,.30),
        k=lis((t-yBl-.06)/.25),y6=Math.max(yBl+.004,t-.01-.04*k),y7=Math.max(y6+.002,t);
      /* (le pan d'habitacle en DEUX : d'un seul tenant, incliné de 12° sous un vernis aussi brillant, il prenait la lampe du plafond en entier
         et virait au crème — une dalle claire au lieu d'une dalle plate ; le bas reste presque droit, seul le haut rentre) */
      const yM=yBl+(y6-yBl)*.55;
      return [[0,b],[x0-.07,b],[x0-.035,b+.07],[x0+.004+.8*f,.09],[x0+.014+f,.18],[x0-.025,yBl],[x0-.029-.004*k,Math.max(yBl+.002,yM)],[x0-.06-.035*k,Math.max(yBl+.003,y6)],[x0-.12-.05*k,y7],[0,y7+.001]];};
    const xFl=(z,y)=>{const q=sec(z);for(let i=2;i<8;i++)if(y<=q[i+1][1])return q[i][0]+(q[i+1][0]-q[i][0])*Math.min(1,Math.max(0,(y-q[i][1])/((q[i+1][1]-q[i][1])||1)));return q[8][0];};
    {const zE=.5*L+BEV,zs=[-zE,-zE+.045,zE-.045,zE];for(const p of OF)if(Math.abs(p[0])<zE-.05)zs.push(p[0]);
     for(let z=-zE+.2;z<zE-.1;z+=.22)zs.push(z);zs.push(-.40,-.70,-1.6,-1.85,.45,.70,1.85,.07*L,-.17*L);
     zs.sort((a,b)=>a-b);for(let i=zs.length-1;i>0;i--)if(zs[i]-zs[i-1]<.02)zs.splice(i,1);
     const S=zs.map(z=>sec(z,Math.abs(z)>zE-.001)),N=S[0].length,P9=[],UV=[],put=(a,b,c)=>{for(const p of [a,b,c]){P9.push(p[0],p[1],p[2]);UV.push(p[2]*.5,p[1]*.5+p[0]*.25);}},mx=p=>[-p[0],p[1],p[2]];
     for(let i=0;i<zs.length-1;i++){const A=S[i],C=S[i+1];
       for(let j=0;j<N-1;j++){const a=[A[j][0],A[j][1],zs[i]],b=[A[j+1][0],A[j+1][1],zs[i]],c=[C[j+1][0],C[j+1][1],zs[i+1]],d=[C[j][0],C[j][1],zs[i+1]];
         put(a,b,c);put(a,c,d);put(mx(a),mx(c),mx(b));put(mx(a),mx(d),mx(c));}}
     for(const [q,z,dir] of [[S[0],zs[0],-1],[S[S.length-1],zs[zs.length-1],1]]){const ct=[];for(let j=0;j<N;j++)ct.push(new THREE.Vector2(q[j][0],q[j][1]));
       for(let j=N-2;j>=1;j--)ct.push(new THREE.Vector2(-q[j][0],q[j][1]));
       for(const f of THREE.ShapeUtils.triangulateShape(ct,[])){let a=ct[f[0]],b=ct[f[1]],c=ct[f[2]];if((((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))>0)!==(dir>0)){const t=b;b=c;c=t;}
         put([a.x,a.y,z],[b.x,b.y,z],[c.x,c.y,z]);}}
     const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P9,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.computeVertexNormals();
     const caisse=new THREE.Mesh(g,vernis);caisse.position.y=y0;K.add(caisse);}
    /* un DÉCALQUE posé sur le flanc (à 3 mm), de z0 à z1 (dans le sens de lecture), de y0r à y1r (repère de la caisse, au-dessus de y0) */
    const decalque=(sd,z0,z1,ya,yb,mat,nz,ny)=>{const P9=[],UV=[],pt=(u,v)=>{const z=z0+(z1-z0)*u,y=ya+(yb-ya)*v;return [sd*(xFl(z,y)+.003),y0+y,z];};
      for(let i=0;i<nz;i++)for(let j=0;j<ny;j++){const q=[[i/nz,j/ny],[(i+1)/nz,j/ny],[(i+1)/nz,(j+1)/ny],[i/nz,(j+1)/ny]],v=q.map(([u,w])=>pt(u,w));
        const T=[[0,1,2],[0,2,3]];for(const t of T){const o=sd*(z1-z0)>0?[t[0],t[2],t[1]]:t;for(const k of o){P9.push(...v[k]);UV.push(q[k][0],q[k][1]);}}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P9,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.computeVertexNormals();
      const m=new THREE.Mesh(g,mat);carGroup.add(m);return m;};
    K.prof([[.02*L,.52*H],[-.04*L,.88*H],[-.32*L,.90*H],[-.40*L,.60*H]],W*.78,K.glass);
    // LE CAPOT VITRÉ : une vitre à plat au-dessus d'un bloc moteur sommaire — c'est ça, la caisse
    B(W*.62,.03,L*.26,K.glass,0,y0+H*.47,L*.28).rotation.x=.06;
    B(W*.44,H*.20,L*.18,K.dark,0,y0+H*.34,L*.28);                // le bloc
    for(const xx of [-.13,0,.13])K.cyl(.045,.045,H*.22,K.acc,xx*W,y0+H*.42,L*.28,8); // 4 bougies alignées
    K.cyl(.05,.05,L*.20,K.chrome,W*.16,y0+H*.40,L*.28,8).rotation.x=Math.PI/2;       // durite
    // L'AILERON GT : deux pylônes droits + un plan qui dépasse largement du hayon
    for(const sd of [-1,1]){
      B(.06,H*.52,L*.07,K.acc,sd*W*.34,y0+H*1.06,-L*.42);
      B(.15,H*.20,L*.66,K.acc,sd*(W/2+.00),y0+H*.14,-L*.02);     // JUPES larges — (relief) plus profondes vers la caisse : le bas rentre, rien ne se voit au travers
      B(.10,.09,.16,K.acc,sd*(W/2+.10),y0+H*.78,L*.14);
    }
    const carb=new THREE.MeshPhongMaterial({map:MATV.get('carbone'),shininess:150,specular:0xbfc6d2,
      envMap:envTex,reflectivity:.34,combine:THREE.MixOperation});
    B(W*1.06,.06,L*.20,carb,0,y0+H*1.32,-L*.42);                 // LE PLAN de l'aileron : en carbone
    B(W*1.02,.035,L*.07,carb,0,y0+H*1.24,-L*.50).rotation.x=.34;  // et son volet Gurney
    B(W*1.02,H*.18,.16,K.acc,0,y0+H*.16,L/2+.10);                // pare-chocs kitté + lame
    B(W*.98,.05,.30,K.dark,0,y0+H*.04,L/2+.18);
    // LES CANARDS : quatre petites lames de chaque côté du bouclier. C'est le détail le plus « kitté »
    // qui soit, et il ne coûte que quatre boîtes — bien plus rentable qu'un aileron de plus.
    for(const sd of [-1,1])for(const cz of [0,1]){
      const cn=B(W*.16,.028,L*.055,K.acc,sd*W*(.36+cz*.06),y0+H*(.22+cz*.16),L/2+.02);
      cn.rotation.set(0,sd*-.30,sd*.42);}
    // STICKERS : une bande sur chaque flanc, à hauteur de bas de caisse — (relief) un décalque qui épouse l'arête
    {const stM=new THREE.MeshBasicMaterial({map:MATV.get('stickers'),transparent:true,side:THREE.DoubleSide});
     for(const sd of [-1,1]){const zc=-L*.04,hl=L*.26;decalque(sd,sd>0?zc+hl:zc-hl,sd>0?zc-hl:zc+hl,H*.34-H*.11,H*.34+H*.11,stM,16,4);}}
    // L'INTERCOOLER dans la bouche du pare-chocs : c'est LE détail qui dit « préparée », pas « peinte »
    B(W*.54,H*.17,.08,K.dark,0,y0+H*.26,L/2+.055);
    for(let i9=0;i9<7;i9++)B(W*.052,H*.13,.03,K.chrome,(i9/6-.5)*W*.46,y0+H*.26,L/2+.10);
    // ---- LA LEÇON DES MOTEURS : on ne POSE pas les détails un par un, on les SÈME. Chaque boucle
    // ci-dessous rend une pièce entière (extracteurs, grille, sorties d'échappement, boulons) et
    // c'est cette DENSITÉ régulière — pas un accessoire de plus — qui fait « caisse préparée ».
    for(let v9=0;v9<4;v9++){                                       // EXTRACTEURS de capot
      const zz=L*(.18+v9*.045);
      B(W*.30,.022,L*.030,K.dark,0,y0+H*.492,zz).rotation.x=-.36;
      B(W*.30,.012,L*.012,K.chrome,0,y0+H*.502,zz-L*.014);
    }
    {const gN=7;for(let g9=0;g9<gN;g9++)                            // GRILLE de calandre, barre à barre
      B(W*.012,H*.14,.02,K.chrome,(g9/(gN-1)-.5)*W*.44,y0+H*.28,L/2+.075);}
    for(let b9=0;b9<9;b9++)                                        // BOULONS de lame avant
      K.cyl(.016,.016,.02,K.chrome,(b9/8-.5)*W*.86,y0+H*.055,L/2+.24,6).rotation.x=Math.PI/2;
    // LE BANDEAU de pare-brise : posé À PLAT sur la vitre, il attrape le regard avant la couleur
    const ban=new THREE.Mesh(new THREE.PlaneGeometry(W*.66,H*.20),
      new THREE.MeshBasicMaterial({map:MATV.get('banner'),transparent:true}));
    ban.position.set(0,y0+H*.80,L*.02);ban.rotation.x=-.62;carGroup.add(ban);
    for(const sd of [-1,1]){
      // ⚠ UNE ARCHE SE POSE SUR SON ESSIEU. Calée « à peu près à l'arrière » (-L*.24) elle tombait
      // au milieu du flanc, devant la roue : on lisait un pod accroché à la caisse, pas une aile
      // élargie. `zw` est la VRAIE position de roue — la même que celle du montage des roues.
      const zw=L/2-.75;
      for(const fz of [1,-1]){
        // (2026-10-19, l'affinement) L'AILE RAPPORTÉE EN FACETTES : une arche de tôle vernie de 10 cm, 8 pans, qui chevauche le pneu
        // (c'était une ellipsoïde de 1,4 m posée sur la roue : un ballon brillant, hors de la DA)
        const zc=fz*zw,yc=.40*.94,ar=[];for(let i=0;i<=8;i++){const t=(-10+i*25)*Math.PI/180;ar.push([zc+.53*Math.cos(t),yc+.53*Math.sin(t)-y0]);}
        for(let i=8;i>=0;i--){const t=(-10+i*25)*Math.PI/180;ar.push([zc+.43*Math.cos(t),yc+.43*Math.sin(t)-y0]);}
        K.prof(ar,.30,vernis).position.x=sd*.95;
        for(let rv=0;rv<5;rv++){const t=(30+rv*30)*Math.PI/180;      // et leurs RIVETS sur la face : le signe
          K.cyl(.017,.017,.02,K.chrome,sd*1.105,yc+.48*Math.sin(t),zc+.48*Math.cos(t),6)     // qu'une aile a été GREFFÉE,
            .rotation.z=Math.PI/2;}                                  // pas moulée avec la caisse
      }
      B(.05,H*.44,.05,K.chrome,sd*W*.24,y0+H*.72,-L*.06);           // arceau visible sous la vitre
    }
    B(W*.46,.05,.05,K.chrome,0,y0+H*.94,-L*.06);
    for(const sd of [-1,1]){                                       // DEUX canons d'échappement,
      K.cyl(.13,.15,.34,K.chrome,sd*W*.22,y0+.06,-L/2-.16,12).rotation.x=Math.PI/2; // chacun sa
      K.cyl(.105,.105,.06,K.dark,sd*W*.22,y0+.06,-L/2-.31,12).rotation.x=Math.PI/2; // gueule noire
    }
    for(const sd of [-1,1])                                        // ENDPLATES de l'aileron
      B(.035,H*.26,L*.19,carb,sd*W*.52,y0+H*1.30,-L*.42);
    // ---- LE COMPARTIMENT MOTEUR SOUS LA VITRE : c'est LÀ que se joue « préparée ». Un bloc nu
    // sous une vitre, c'est un carton ; il faut la TUYAUTERIE — l'escargot du turbo, la durite qui
    // fait le tour, la wastegate qui sort par le flanc. On les sème, elles ne se posent pas.
    {const esc=K.cyl(H*.15,H*.15,W*.13,K.dark,W*.19,y0+H*.36,L*.20,14);esc.rotation.z=Math.PI/2;
     K.cyl(H*.09,H*.06,W*.10,K.chrome,W*.28,y0+H*.36,L*.20,12).rotation.z=Math.PI/2;   // la turbine
     K.cyl(.048,.048,L*.30,K.chrome,W*.22,y0+H*.30,L*.10,8).rotation.x=Math.PI/2;      // ligne d'admission
     K.cyl(.048,.048,W*.40,K.chrome,-W*.02,y0+H*.30,-L*.04,8).rotation.z=Math.PI/2;    // sa traversée
     for(let c9=0;c9<4;c9++)                                                            // colliers
       K.cyl(.056,.056,.022,K.acc,W*.22,y0+H*.30,L*(.02+c9*.06),8).rotation.x=Math.PI/2;
     const wg=K.cyl(.052,.052,W*.22,K.chrome,W*.34,y0+H*.24,L*.16,8);wg.rotation.z=Math.PI/2.6;}
    for(const sd of [-1,1]){                                       // GOUJONS de capot (les 4 pions
      for(const gz of [1,-1])                                      // qui remplacent la serrure)
        K.cyl(.026,.026,.05,K.chrome,sd*W*.36,y0+H*.50,L*(gz>0?.40:.12),8);}
    for(let v9=0;v9<6;v9++)                                        // GÉNÉRATEURS DE VORTEX sur le toit :
      B(.02,.05,L*.045,K.acc,(v9/5-.5)*W*.52,y0+H*.96,-L*.30).rotation.y=(v9%2?.3:-.3);
    // FREINS : disque percé + étrier. Une caisse kittée se reconnaît AUSSI par les roues, et c'est
    // le seul endroit où on peut le dire ici (la jante, elle, est commune à toute la gamme).
    for(const sd of [-1,1])for(const fz of [1,-1]){
      const zw=L/2-.75;
      const dq=K.cyl(.27,.27,.035,K.chrome,sd*(W/2-.10),.40*.94,fz*zw,16);dq.rotation.z=Math.PI/2;
      for(let h9=0;h9<8;h9++){const a9=h9/8*6.283;                 // les PERÇAGES du disque
        K.cyl(.022,.022,.05,K.dark,sd*(W/2-.10),.40*.94+Math.cos(a9)*.17,fz*zw+Math.sin(a9)*.17,6).rotation.z=Math.PI/2;}
      const et=B(.07,.16,.09,K.acc,sd*(W/2-.10),.40*.94+.19,fz*zw);et.rotation.x=.2; // l'étrier
    }
    /* L'ARRIÈRE v2 (2026-10-17, Sacha : « il faut que chaque voiture, on ait envie de l'acheter » — la revue des poupes) : c'était un mur
       vert plat sous le grand aileron, deux traits rouges et une barre noire. Désormais :
       · LES FEUX sous un VERRE FUMÉ d'une aile à l'autre : deux LED en équerre, leur cœur sombre, le fil de LED qui les relie ;
       · le BOUCLIER dans le vernis de la caisse, creusé de deux ÉCOPES noires à lames, la plaque au milieu ;
       · le DIFFUSEUR noir à ailettes VERT ACIDE, où s'encastre le gros canon de Léo (ECH_POTS.tuner, inchangé).
       Le diffuseur commun de buildCar (`split`) ne passait plus derrière le bouclier : il est coupé (`split:0`) et sa LAME AVANT reposée
       ici telle quelle — l'avant ne bouge pas. Les feux-boîtes communs (`tl`) passent dans la caisse. */
    B(W*.96,.05,.3,K.dark,0,y0+H*.04,L/2+.12);                     // (la lame avant que posait `split`, à l'identique)
    {const zf=-L/2-.09,P=K.kit({k:{g:'m',c:0x101210},K:{g:'g',c:0x07080a},L:{g:'l',c:0xff1a2a},r:{g:'l',c:0x9a0f1a},  // zf : la VRAIE poupe (carProfile biseaute de 9 cm)
        v:{g:'l',c:0x8dff2a},w:{g:'l',c:0xd9dce0}}); // (les ailettes en néon acide, la plaque éclairée : aucune famille de matière de plus)
     P.box('K',1.66,.13,.02,0,.625,zf-.012);                      // le verre fumé
     P.sym(sd=>{
       P.plate('L',[[.46*sd,.672],[.80*sd,.672],[.80*sd,.582],[.73*sd,.582],[.73*sd,.636],[.46*sd,.636]],.014,zf-.036); // la LED en équerre
       P.plate('r',[[.50*sd,.630],[.70*sd,.630],[.70*sd,.594],[.50*sd,.594]],.01,zf-.03);                             // son cœur
       P.box('L',.04,.02,.01,sd*.63,.654,zf-.03);                  // (le repère des traînées, dans l'équerre : un `plate` ne se relève pas)
       P.box('K',.26,.10,.02,sd*.66,.43,zf-.096);                  // l'écope du bouclier…
       for(const x of [.58,.66,.74])P.box('k',.014,.09,.03,sd*x,.43,zf-.104); // …et ses lames
     });
     P.box('r',.88,.016,.012,0,.618,zf-.03);                       // le fil de LED d'une équerre à l'autre
     P.box('K',.44,.13,.012,0,.435,zf-.096);P.box('w',.40,.10,.012,0,.435,zf-.102); // la plaque
     P.box('k',1.52,.155,.16,0,.278,zf-.06);                      // le diffuseur…
     for(const x of [-.66,-.42,-.18,.06,.66])P.box('v',.016,.12,.18,x,.29,zf-.08); // …ses ailettes (le canon passe à droite)
     K.commit(P);}
    B(W*.90,.15,.10,vernis,0,.43,-L/2-.13);                        // le bouclier, dans le vernis de la caisse (9 cm devant la poupe biseautée)
    {// (2026-10-19, l'affinement) LES PORTIÈRES : la FENTE C plaquée sur la tôle (les lignes communes, des traits noirs, flottaient 6 cm hors du flanc) —
     // un mélange MULTIPLIER : la tôle × .5 sous toutes les lumières, le programme de toutes les lignes (aucun de plus)
     const fM=new THREE.MeshBasicMaterial({color:0x808080,transparent:true,blending:THREE.MultiplyBlending});
     for(const sd of [-1,1]){for(const zz of [L*.07,-L*.17])decalque(sd,zz-.003*sd,zz+.003*sd,H*.20,H*.70,fM,1,6);   // (relief) la fente suit la tôle pliée
       B(.03,.035,.16,K.chrome,sd*(xFl(L*.01,H*.66)+.012),y0+H*.66,L*.01);}}       // et la poignée, contre la portière
    return {hl:[W*.32,y0+H*.40,L/2+.06],tl:[W*.34,.55,-L/2+.10],wr:.94,doors:0,sp:0,split:0}; // tl : DANS la caisse (les LED font les feux)
  },
  // 14. LE CHAT POP-TART — refait en VOXELS le 2026-10-06 (voir « LE CHAT POP-TART EN VOXELS », juste avant SHAPES) : le gâteau
  //     couché en châssis, la tête dressée à l'avant, pattes et queue dessinées de profil, quatre roulettes pixel.
  //     (L'ancien — pavé texturé, boule de tête, oreilles en cônes — est dans l'historique git, avant ce commit.)
  poptart(K){
    NYAN.on=true;const n0=carGroup.children.length;
    const u=NY_U,o=[-u/2,0,-10*u],mats={},mat=g=>mats[g]||(mats[g]=g==='nyl'?nyLaque():lpMat(g)); // une matière par famille pour TOUT le chat
    /* ⚠ LES COULEURS NE PRENNENT PAS LA LUMIÈRE (2026-10-06, mesuré en course). Un gris NEUTRE renvoie fidèlement toutes les lumières
       colorées du niveau : la tête passait VERTE aux NUAGES, ROSE sous le baiser magenta, BEIGE sous la lampe chaude de l'atelier,
       ORANGE face au rideau de feu — plus rien du chat de l'image. L'image est du pixel art en cubes : des aplats, une face plus claire
       que l'autre, point. Les couleurs vont donc dans la famille SANS lumière (`l`, le programme des feux : rien de nouveau à compiler)
       avec l'ombrage CUIT par face : la face du DESSIN pleine (dessus du gâteau, visage et nuque, flancs des pattes et de la queue),
       le dessus un cran en dessous, les autres faces deux crans. Seul le NOIR reste laqué et éclairé : c'est lui qui accroche le ciel,
       comme les murs noirs de l'image. Les aplats sont relevés de 10 % : l'ACES les ternissait. */
    const COUL={C:0xf4d6a8,K:0x9a6038,Q:0xc9955c,X:0xc3c8d2,P:0xff9cf3,S:0xff3a94,G:0x8e8f99,W:0xffffff,R:0xff9aa6,N:0x2e2f3a,Y:0xffe25a,L:0x8a1424,T:0xff2a36},TEINTE=[['d',1.1],['h',1.0],['c',.86]],pal={B:{g:'nyl',c:0x14141c}},cc=new THREE.Color();
    for(const k in COUL)for(const [f,m] of TEINTE){cc.setHex(COUL[k]);cc.setRGB(Math.min(1,cc.r*m),Math.min(1,cc.g*m),Math.min(1,cc.b*m));pal[k+f]={g:'nyl',c:cc.getHex()};} // (v12) la LAQUE de la caisse sur tous les pixels : une seule matière, un seul brillant · ⚠ r128 : getHex() ne BORNE pas — un canal à 1,1 débordait sur ses voisins (le rose sortait vert)
    const pose=(V,par,plan,uu,oo)=>{const kt=lpKit(pal); // `plan` : l'axe de la face qui porte le DESSIN (0 = flancs, 1 = dessus, 2 = avant/arrière)
      V.emit(kt,uu||u,oo||o,(c,ax,sg)=>(c==='B'||(ax===1&&sg<0))?'B':c+(ax===plan?'d':(ax===1?'h':'c'))); // tout ce qui regarde le SOL est noir, comme le dessous du châssis (le bleu du ciel y faisait des rayures)
      const gs=kt.done();
      for(const g in gs){const m=new THREE.Mesh(gs[g],mat(g));m.userData.lp=1;par.add(m);}return par;};
    const bloc=()=>K.add(new THREE.Group()); // ce qui BOUGE vit dans un groupe : la soudure de la caisse n'y touche pas (voir caisseSoude)
    // 1. LA CAISSE (v10, Léo : « trop simple, on dirait un donut sur les bords, et on perd le côté poly »). La v9 était lisse et bouffie : on
    //    revient au POLY de la gamme — de GRANDES FACETTES franches à normale plate, chacune son ton (la lumière cuite par facette : l'art
    //    low-poly, et le biscuit reste biscuit sous toutes les lumières) — mais une caisse DESSINÉE : section à arêtes vives (bas de caisse
    //    noir, plan de porte, ARÊTE DE CARACTÈRE sur tout le flanc, épaule biseautée, ceinture, vitrage, rail de pavillon noir, marche du
    //    glaçage, pavillon), pavillon FLOTTANT (montants noirs), hanches facettées de GR Yaris, prise d'air sur la hanche, poignées, trappe
    //    à essence, ouïes d'aile avant, lame avant, aileron requin, troisième feu stop, catadioptres. Profil, poupe et aileron des versions
    //    d'avant ; glaçage et vermicelles sur le pavillon. La tête, les pattes et la queue restent en pixels.
    //    (v11, Léo : « le biscuit, ce sont les portes et le bas de la voiture ; enlève les petits carrés marron ; un beau beige marron
    //    appétissant, glossy métallique ; par-dessus, le glaçage ») : tout le bas en biscuit (bas de caisse, bouclier, portes — plus de
    //    noir dessous ni de lignes de portes marron), montants en verre fumé, le glaçage cerné d'un liseré de biscuit sur le pavillon
    //    (et sur capot et plage arrière), plus de rétroviseurs ni de trappe ; la laque brillante `nyLaque`.
    {const sm=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t);},hh=(a,b)=>{const x=Math.sin(a*12.9898+b*78.233)*43758.5453;return x-Math.floor(x);};
     const yB=z=>.98+.03*Math.min(1,Math.max(0,(1-z)/2));                                         // la ceinture : 0,98 m à l'avant, 1,01 à l'arrière (v11 : des portes plus hautes, un vitrage moins haut)
     const yT=z=>z>1.27?-1:z>.9?yB(z)+.006+(1.304-yB(z))*sm((1.27-z)/.37):z>-.6?1.31+.015*(1-Math.pow((z-.15)/.75,2)):z>-.9?yB(z)+.006+(1.304-yB(z))*sm((z+.9)/.3):-1; // pare-brise · pavillon · hayon — (2026-10-08) le pare-brise descend JUSQU'AU capot (il s'arrêtait 13 cm au-dessus : une marche dont les facettes tordues faisaient des pointes beiges et un reflet blanc contre la tête), la vitre du hayon jusqu'à la plage arrière (3,4 cm)
     const sx=z=>z<-.7?.62+.38*Math.sqrt(Math.max(0,1-Math.pow((-.7-z)/.3,2))):z>1.3?.86+.14*Math.sqrt(Math.max(0,1-Math.pow((z-1.3)/.15,2))):1; // les coins en plan (pris en quelques facettes)
     const ha=z=>.07*Math.max(0,1-Math.pow((z+.62)/.38,2));                                       // les hanches
     // (v13) LES PASSAGES DE ROUE — les pattes y logent (voir 3.) : une ouverture en demi-cercle facetté (centre, demi-longueur) jusqu'à
     // 0,74 m, juste sous l'arête ; dedans, la paroi du passage à 0,55 m de l'axe et le dessous de l'aile, en noir
     const ARC=[[.95,.32],[-.45,.32]],AH=.28,XIN=.55;
     const arc=z=>{for(const [c,a] of ARC){const d=(z-c)/a;if(Math.abs(d)<=1)return .5+AH*Math.sqrt(Math.max(0,1-d*d));}return -1;};
     const arcD=z=>{let m=9;for(const [c,a] of ARC)m=Math.min(m,Math.abs(z-c)-a);return m;}; // < 0 dans l'arche, 0-1,6 cm : son bord franc
     const S=(z,sansArc)=>{const yb=yB(z),t0=yT(z),yt=t0<0?yb+.006:t0,g=yt-yb,h=ha(z),wt=z<-.6?1-.25*sm((-.6-z)/.3):1,s=sx(z),ta=sansArc?-1:arc(z);
       const lo=[[.6,.5],[.79,.55],[.835,.6],[.86+h,.71]];                                              // fond, chanfrein, bas de caisse, plan de porte
       let xo=.865+h;for(let n=0;n<3;n++)if(ta<=lo[n+1][1]){xo=lo[n][0]+(lo[n+1][0]-lo[n][0])*(ta-lo[n][1])/(lo[n+1][1]-lo[n][1]);break;} // la peau de la caisse à la hauteur de l'arche
       return [[0,.5]].concat(ta<0?lo:[[XIN,.5],[XIN,ta],[xo,ta],ta<.71?lo[3]:[xo,ta]]).concat(            // — ou le PASSAGE : paroi, dessous d'aile, la peau qui reprend au bord de l'arche (pas d'arête qui dépasse)
               [[.865+h,.79],[.83+h*.4,.89],[.785,yb],                                                          // ARÊTE, épaule
               [.75*wt,yb+.45*g],[.665*wt,yt-.045],[.6*wt,yt-.008],[.56*wt,yt+.024],[.3*wt,yt+.036],[0,yt+.04]]) // vitrage, rail de pavillon, marche du glaçage, pavillon
         .map(p=>[p[0]*s,p[1]]).map((p,n,A)=>{if(n>=A.length-6)p[1]=Math.max(p[1],A[n-1][1]);return p;});}; /* (2026-10-08) au-dessus de l'épaule le profil ne REDESCEND
         jamais : sur le capot et la plage arrière (pas de pavillon, vitrage écrasé), le rail tombait 4 cm SOUS l'épaule — une rainure qui
         se repliait au pied du pare-brise (une pointe beige et un reflet blanc contre la tête, le trait noir gonflé en lame). */
     // des stations COMPTÉES (les cassures du profil, les coins pris en trois facettes) : chaque facette est voulue
     const zs=[-1,-.985,-.95,-.88,-.78,-.66,-.6,-.42,-.28,-.15,0,.03,.11,.3,.5,.7,.95,1.05,1.15,1.2,1.3,1.4,1.45];
     for(const [c,a] of ARC)for(const f of [-1.044,-1,-.7071,-.38,0,.38,.7071,1,1.044])zs.push(c+f*a); // l'arche en six facettes, ses deux bords francs
     zs.sort((a,b)=>a-b);
     const kt=lpKit({b:{g:'p',c:NY_COUL.b},f:{g:'p',c:NY_COUL.f,f:0},s:{g:'p',c:NY_COUL.s,f:0},v:{g:'p',c:NY_COUL.v,f:0},k:{g:'m',c:0x131317},c:{g:'c',c:0xd8dce4},e:{g:'l',c:0xa01424}});
     kt.loft(zs,S,(j,z)=>{
       if(j<0)return 'b';                                                                         // les bouchons (la poupe ; le nez est dans la tête)
       if(j===0)return 'k';                                                                       // le dessous
       {const ad=arcD(z);if((j<=2&&ad<0)||(j<=3&&ad>=0&&ad<.016))return 'k';}                    // (v13) le PASSAGE DE ROUE : paroi, dessous d'aile, bords francs — noirs
       if(j<=6)return 'b';                                                                        // (v11) TOUT LE BAS EN BISCUIT : chanfrein, bas de caisse, bouclier, portes, arête, épaule
       if(yT(z)<0)return 'b';                                                                     // capot et plage arrière
       if(z>.9||z<-.6||j<=8)return 'v';                                                           // pare-brise, vitre du hayon, vitres latérales — montants en verre fumé : le pavillon flotte
       return 'b';});                                                                             // le pavillon en BISCUIT : la pop-tart en pixels se pose dessus (voir NY_TOIT)
     // (v12, Léo : « mieux mimer, copier ») LA POP-TART DE L'IMAGE SUR LE PAVILLON, dans le pixel de la tête : le glaçage aux coins en
     // escalier, les vermicelles en cases (un cran plus hauts), le biscuit qui fait le bord — vu de la poursuite, c'est le dessin.
     // (2026-10-08, Léo : « les pixels plus propres ») le glaçage est fait de GRANDS PAVÉS au dessus À PLAT (les rangées de même largeur
     // fondues : 3 largeurs, l'escalier des coins), les vermicelles posés dessus. Rangée par rangée, chacune suivait le bombé du pavillon :
     // des marches d'un millimètre faisaient des traits sombres en travers du rose et des points clairs entre deux rangées.
     {const P=NY_P,NC=NY_TOIT[0].length,NR=NY_TOIT.length,x0=-NC*P/2,z0=.8-NR*P;let yM=-9;
      for(let r=0;r<NR;r++)yM=Math.max(yM,yT(z0+(r+.5)*P));
      const yF=yM+.058,bord=L=>[L.search(/[^.]/),NC-1-L.split('').reverse().join('').search(/[^.]/)];
      for(let r=0;r<NR;){const [a,b]=bord(NY_TOIT[r]);let r1=r,y0=yT(z0+(r+.5)*P);
        while(r1+1<NR&&bord(NY_TOIT[r1+1]).join()===[a,b].join()){r1++;y0=Math.min(y0,yT(z0+(r1+.5)*P));}
        y0+=.022;kt.box('f',(b-a+1)*P,yF-y0,(r1-r+1)*P,x0+(a+b+1)/2*P,(y0+yF)/2,z0+(r+r1+1)/2*P);r=r1+1;}
      for(let r=0;r<NR;r++)for(let c=0;c<NC;c++)if(NY_TOIT[r][c]==='s')kt.box('s',P,.017,P,x0+(c+.5)*P,yF+.0035,z0+(r+.5)*P);}
     // (v11) le flanc NU — ni prise d'air, ni poignées, ni ouïes, ni trappe, ni rétroviseurs : sur le biscuit, c'étaient des petits
     // carrés sombres ; la laque et les facettes font le dessin. (2026-10-08) L'aileron requin aussi : posé à z −0,45, il PERÇAIT le
     // glaçage du pavillon (une lame noire au milieu du rose).
     // le bouclier : diffuseur à ailettes, fentes des coins, catadioptres, deux sorties d'échappement
     kt.box('k',1,.09,.06,0,.555,-1.01);for(let f=-2;f<=2;f++)kt.box('k',.02,.08,.1,f*.18,.56,-1.03);
     for(const sd of [-1,1]){for(let a=0;a<3;a++)kt.box('k',.018,.13,.02,sd*(.38+a*.045),.71,-1.005);kt.box('e',.1,.025,.012,sd*.42,.62,-1.008);
       kt.cyl('c',.055,.1,8,sd*.5,.6,-1.04,'z');kt.cyl('k',.04,.104,8,sd*.5,.6,-1.04,'z');}
     // l'AILERON sur cols de cygne (biscuit dessous, glaçage dessus, dérives noires) et la lèvre du pavillon
     kt.box('b',1.42,.035,.26,0,1.47,-.76);kt.box('f',1.34,.02,.2,0,1.495,-.76);
     for(const sd of [-1,1]){kt.box('b',.025,.15,.32,sd*.72,1.45,-.77);kt.box('k',.04,.17,.05,sd*.32,1.39,-.665,-.35,0,0);} // (v12) dérives en biscuit : l'aileron est une petite pop-tart
     kt.box('k',1,.025,.1,0,1.325,-.625,.2,0,0);
     /* ⚠ LA LUMIÈRE EST CUITE PAR FACETTE dans la peinture (biscuit, glaçage, vermicelles) : laquée et éclairée, la caisse virait ORANGE à
        l'atelier (la lampe chaude, le rideau de feu). Une clé fixe (haut, avant, gauche), le ciel par le dessus, un lustre sur ce qui
        regarde le ciel — sur la normale PLATE de chaque facette : chaque pan a son ton, l'art low-poly. Noirs, vitres, chromes et
        catadioptres gardent leur matière. */
     const gs=kt.done();for(const g in gs)nyRallye(gs[g]); // (2026-10-09) la mini de rallye (voir nyRallye)
     for(const g in gs){if(g!=='l')lpOmbre(gs[g],1.5);let m9=g;
       if(g==='p'){const n=gs[g].attributes.normal.array,c=gs[g].attributes.color.array;
         for(let i=0;i<n.length;i+=3){const d=Math.max(0,n[i]*.33+n[i+1]*.82+n[i+2]*.47),k=.55+.42*d+.08*n[i+1]+.1*Math.pow(Math.max(0,n[i+1]),6);c[i]*=k;c[i+1]*=k;c[i+2]*=k;}
         m9='nyl';}
       const m=new THREE.Mesh(gs[g],mat(m9));m.userData.lp=1;carGroup.add(m);}
     // (v12, Léo : « merge mieux les deux, plus homogène, moins Frankenstein ») LE TRAIT NOIR DE L'IMAGE autour de la caisse : tout,
     // dans le dessin, est cerné de noir — la tête, les pattes et la queue l'étaient (leurs cases du bord), la caisse non : deux mondes.
     // Une coque RETOURNÉE (faces arrière seules) gonflée le long des normales MOYENNÉES par sommet : on ne la voit qu'au bord de la
     // silhouette, un trait de 4,5 cm, comme le contour d'un sprite. Un dessin, une matière nue ; l'explosion ne l'arrache pas.
     {const ko=lpKit({o:{g:'m',c:0}});ko.loft(zs,z=>S(z,1),()=>'o');ko.box('o',1.42,.035,.26,0,1.47,-.76);
      const g=nyRallye(ko.done().m),p=g.attributes.position.array,N=new Map(),cle=i=>Math.round(p[i]*1e4)+','+Math.round(p[i+1]*1e4)+','+Math.round(p[i+2]*1e4);
      for(let i=0;i<p.length;i+=9){const ux=p[i+3]-p[i],uy=p[i+4]-p[i+1],uz=p[i+5]-p[i+2],vx=p[i+6]-p[i],vy=p[i+7]-p[i+1],vz=p[i+8]-p[i+2];
        const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
        for(let v=0;v<9;v+=3){const k=cle(i+v),a=N.get(k);if(a){a[0]+=nx;a[1]+=ny;a[2]+=nz;}else N.set(k,[nx,ny,nz]);}}
      const e=.045,q=new Float32Array(p.length);
      for(let i=0;i<p.length;i+=3){const a=N.get(cle(i)),l=Math.hypot(a[0],a[1],a[2])||1;q[i]=p[i]+a[0]/l*e;q[i+1]=p[i+1]+a[1]/l*e;q[i+2]=p[i+2]+a[2]/l*e;}
      /* (2026-10-08, Léo : « les pixels plus propres ») LE TRAIT SANS PLI : dans un CREUX (le pied du pare-brise sur le capot), les deux
         pans gonflés se croisent et des triangles de la coque se RETOURNENT — leur face arrière, la seule dessinée, sortait de la caisse
         en ligne noire à travers le capot, finie en lame contre la tête. Un triangle dont la normale s'est inversée est écrasé en un point. */
      const nT=(A,i)=>[(A[i+4]-A[i+1])*(A[i+8]-A[i+2])-(A[i+5]-A[i+2])*(A[i+7]-A[i+1]),(A[i+5]-A[i+2])*(A[i+6]-A[i])-(A[i+3]-A[i])*(A[i+8]-A[i+2]),(A[i+3]-A[i])*(A[i+7]-A[i+1])-(A[i+4]-A[i+1])*(A[i+6]-A[i])];
      for(let i=0;i<p.length;i+=9){const n0=nT(p,i),n1=nT(q,i);if(n0[0]*n1[0]+n0[1]*n1[1]+n0[2]*n1[2]<=0)for(let v=3;v<9;v++)q[i+v]=q[i+v%3];}
      g.dispose();const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.BufferAttribute(q,3));
      const hm=new THREE.Mesh(hg,mats.trait||(mats.trait=new THREE.MeshBasicMaterial({color:0x07060c,side:THREE.BackSide})));
      hm.userData.lp=1;hm.userData.contour=1;hm.userData.noShadow=true;carGroup.add(hm);}
     // LES FEUX ARRIÈRE, en DEUX exemplaires (veilleuse, stop — le stop s'allume au freinage) : le bandeau sous le hayon, coupé au milieu
     // pour la queue, ses blocs d'angle qui s'enroulent sur la poupe, et le troisième feu stop sous la lèvre du pavillon
     for(const vif of [0,1]){const kf=lpKit({r:{g:'l',c:vif?0xff2a36:0x8a1424}});
       for(const sd of [-1,1]){kf.box('r',.34,.035,.02,sd*.33,.915,-1.012);kf.box('r',.12,.08,.025,sd*.47,.905,-1.01);
         let zp=-1,xp=S(-1)[6][0];for(const z of [-.985,-.95,-.88]){const x=S(z)[6][0];
           kf.box('r',.025,.075,Math.hypot(z-zp,x-xp)+.01,sd*((x+xp)/2+.012),.905,(z+zp)/2,0,sd*Math.atan2(x-xp,z-zp),0);zp=z;xp=x;}}
       kf.box('r',.3,.02,.02,0,1.305,-.68);
       const g9=bloc(),gf=kf.done();for(const g in gf)nyRallye(gf[g]);for(const g in gf){const m=new THREE.Mesh(gf[g],mat(g));m.userData.lp=1;g9.add(m);}g9.visible=!vif;NYAN.feux.push(g9);}}
    /* (2026-10-09, Léo : « la nyan cat doit faire plus voiture de rallye, genre mini rally : plus au ras du sol, moins voiture de ville ») L'ÉQUIPEMENT DE RALLYE, posé APRÈS la déformation (il ne bouge pas avec elle) : la LAME avant au ras du sol, sous
       le visage ; deux LONGUE-PORTÉE jaunes aux coins du bouclier ; des BAVETTES derrière les quatre roues (noires, la pop-tart rose au
       milieu) ; (la plaque de rallye « 61 » des portières : retirée le jour même, Léo). Les couleurs
       dans la famille sans lumière, comme le reste du chat. */
    {const kr=lpKit({k:{g:'m',c:0x131317},c:{g:'c',c:0xd8dce4},y:{g:'l',c:0xffe14a},p:{g:'l',c:0xff9cf3},w:{g:'l',c:0xf4f1ea},n:{g:'l',c:0x14141c}});
     kr.box('k',1.58,.025,.24,0,.40,1.42);                                                   // la lame
     for(const sd of [-1,1]){
       kr.cyl('c',.08,.05,10,sd*.73,.57,1.44,'z');kr.cyl('y',.064,.056,10,sd*.73,.57,1.442,'z'); // les longue-portée
       kr.box('k',.03,.03,.06,sd*.73,.49,1.42);                                              // leur pied
       for(const zc of [.95,-.45]){const zb=zc-.28;                                           // les bavettes, derrière chaque roue
         kr.box('k',.22,.25,.014,sd*NY_VOIE,.485,zb);kr.box('p',.13,.09,.006,sd*NY_VOIE,.50,zb-.01);}
       /* (2026-10-09, Léo : « enlève le 61 sur la nyan ») la plaque de rallye « 61 » des portières est retirée */}
     const gr=kr.done();for(const g in gr){const m=new THREE.Mesh(gr[g],mat(g));m.userData.lp=1;carGroup.add(m);}}
    // 2. LA TÊTE : le dessin de face sur la couche avant, deux couches derrière (gris cerclé de noir : l'arrière de la tête, vu de
    //    la poursuite, est un chat, pas un pavé noir). Elle HOCHE d'un voxel. (v11, Léo : « la tête un peu énorme, ou trop larges les
    //    côtés noirs ») : cases de 8,6 cm au lieu de 10 — 1,29 m de large dans une caisse de 1,73 (les ailes avant dépassent de chaque
    //    côté), les oreilles au ras du pavillon, le nez toujours à 1,5 m — et un bloc GRIS cerné de noir sur ses arêtes, comme les
    //    pattes : de profil, un trait noir devant, un derrière, plus un flanc noir de 30 cm.
    {const V=voxGrille(),vide=(r,c)=>r<0||r>10||c<0||c>14||NY_TETE[r][c]==='.',uT=NY_P;
     for(let r=0;r<11;r++)for(let c=0;c<15;c++){const ch=NY_TETE[r][c];if(ch==='.')continue;
       const bord=vide(r-1,c)||vide(r+1,c)||vide(r,c-1)||vide(r,c+1);
       for(let k=22;k<=24;k++)V.set(c-7,14-r,k,k===24?ch:(bord&&k===22?'B':'G'));} // (v7) trois couches : à cinq, la tête était trop épaisse
     NYAN.tete=pose(V,bloc(),2,uT,[-uT/2,.4-4*uT,1.5-25*uT]);}
    // 3. LA QUEUE, de profil : DEUX dessins (tombante, relevée) qui alternent — le battement du GIF, pas une rotation
    for(const [jh,L] of NY_QUEUE){const V=voxGrille();
      for(let a=0;a<L.length;a++)for(let b=0;b<5;b++){const c=L[a][b];if(c!=='.')for(let i=-1;i<=1;i++)V.set(i,jh-a,b-5,i===0&&c==='B'?'G':c);} // (v4) sans sa colonne k 0 : elle s'accroche à la poupe sans la traverser · (v12) la tranche du MILIEU grise : de dos, gris cerné de noir
      const q9=pose(V,bloc(),0);q9.traverse(o=>{o.userData.plqNon=1;});NYAN.queue.push(q9);}   // (19/10) la plaque ne se pose plus SUR la queue (les rayons du centre la touchaient avant la poupe)
    NYAN.queue[1].visible=false;NYAN.arc.set(0,.75-NY_BAS,-1.0);
    // 4. LA CAISSE DESCEND SUR SES ROUES (v13) : tout ce qui précède a été dessiné 25 cm plus haut (la caisse flottait sur ses pattes) —
    //    une voiture pose sur ses roues, dans ses passages. On descend la caisse, la tête, la queue et les feux d'un bloc.
    for(let n=n0;n<carGroup.children.length;n++)carGroup.children[n].traverse(o=>{if(o.isMesh)o.geometry.translate(0,-NY_BAS,0);});
    // 5. LES PATTES (v13, Léo : « les jambes deviennent les encoches — pas trop sur le côté, insérées dans la voiture, mais qu'on les
    //    voie ; dedans, les roues ; les pattes bougent selon comment les roues tournent, que ça fasse le geste de la Nyan Cat ») : le
    //    JOUET À TIRER. Dans chaque passage de roue, une roue pixel de 40 cm, et sur sa face extérieure, au ras de la caisse, une patte
    //    de l'image (grise cernée de noir, 20 × 40 cm en cases de 5) qui descend de l'aile jusqu'au moyeu, accrochée à la roue comme
    //    une bielle : quand la roue tourne, la patte tourne en rond par crans — le geste de la course. Ordre AVG, AVD, ARG, ARD (celui
    //    des roues) : chacune suit SA roue (voir nyanTick).
    //    (2026-10-08, avec les roues de 50 cm) 30 cm au lieu de 40 : elle descend de l'arche jusqu'au MOYEU et s'y accroche — le bas de la
    //    roue, sa jante et son enjoliveur, se voient dessous.
    /* (2026-10-15, Léo : un trait noir « glitché » au-dessus des roues avant) LE HAUT DE LA PATTE NE SORT PLUS DE L'AILE. Mesuré (rayons sur
       la vraie caisse) : la face extérieure d'une patte (x ,92) sort de la peau dès y ,46 à l'avant (pas de hanche : l'épaule de l'aile
       rentre), ,48-,51 à l'arrière ; or son haut montait à ,49 au repos et ,54 au cran « en haut » de la bielle — son bord noir traversait
       l'aile, un trait qui apparaissait et disparaissait avec la roue. Désormais chaque patte a TROIS images (6, 5 puis 4 cases de haut), une
       par cran de hauteur (en bas, au milieu, en haut : `userData.im`, choisie par nyanTick) : son haut reste où il était au cran « en bas »
       (,4465, caché sous l'aile — le dessous de l'arche est à ,39-,43, la peau à ,46 au plus bas) et seul le bas suit la roue. Les cases
       gardent les couleurs de la patte entière (le haut coupé, caché, n'a pas de cerne) : ce qu'on voit de la patte sous l'arche ne change pas. */
    for(const zc of [.95,-.45])for(const sd of [-1,1]){const U=NY_PATTE,NX=2,NY=6,NZ=4,g=bloc(),im=[];
      for(const n of [NY,NY-1,NY-2]){const V=voxGrille();
        for(let x=0;x<NX;x++)for(let j=0;j<n;j++)for(let k=0;k<NZ;k++){
          const bx=x===0||x===NX-1,by=j===0||j===NY-1,bz=k===0||k===NZ-1; // le cerne de la patte ENTIÈRE : coupée, elle ne gagne pas de bord noir sous l'arche
          V.set(x,j,k,((bx&&by)||(bx&&bz)||(by&&bz))?'B':'G');}
        const m=pose(V,new THREE.Group(),0,U,[sd>0?NY_VOIE+.08:-NY_VOIE-.08-NX*U,.22,zc-NZ*U/2]);m.visible=n===NY-1;g.add(m);im.push(m);} // (2026-10-09) la voie de rallye (,78 = ,7 + ,08 avant)
      g.userData.im=im;NYAN.pattes.push(g);}
    // 6. LES ROUES PIXEL (2026-10-08, Léo : « fais les pixels plus propres et des plus belles roues », puis « plus de détails, les pixels
    //    plus petits, des pneus plus ronds »). Les roulettes de 7 × 7 TOURNAIENT : un disque en escalier à n'importe quel angle n'est plus
    //    un dessin, c'est un losange dentelé. Désormais une roue de 50 cm (elle remplit son passage) dessinée sur 21 × 21 cases de 2,4 cm
    //    et 8 couches d'épaisseur, EN RELIEF : la bande de roulement et ses 30 sculptures sur des épaules ARRONDIES (deux couches de moins),
    //    le flanc plein, la jante en retrait d'une couche (un reflet fixe en haut à l'avant), cinq rayons en retrait de deux, le creux de
    //    quatre, le moyeu et ses cinq écrous, l'enjoliveur rose au ras du pneu. Et elle ne tourne JAMAIS : le dessin est REDESSINÉ case par
    //    case, tourné de 12° à la fois — six images pour l'écart entre deux rayons (les sculptures, au pas de 12°, restent en place) —, la
    //    vraie roue choisit la sienne (les `wheels` de buildCar sont des moyeux VIDES qui portent l'angle, voir nyanTick). Hors carrosserie
    //    (`sol`) : elle reste au sol quand la caisse roule sur ses ressorts. Ordre AVG, AVD, ARG, ARD (celui des roues).
    {const NR=21,vR=.5/NR,EP=8,C=(NR-1)/2,NS=5,NF=6,sec=2*Math.PI/NS;NYAN.rPas=sec/NF;
     const cas=(u,v,th)=>{const r=Math.hypot(u,v);if(r>10.45)return null; // u : vers l'avant, v : vers le haut, en cases ; [couleur, couche intérieure, couche extérieure]
       const uu=u*Math.cos(th)-v*Math.sin(th),vv=u*Math.sin(th)+v*Math.cos(th),phi=Math.atan2(vv,uu); // le dessin tourné de th : le haut part vers l'avant, comme la roue qui roule
       if(r>9.55)return [Math.cos(phi*30)>.35?'N':'B',1,EP-2];                                   // la bande de roulement, ses sculptures
       if(r>7.55)return ['B',0,EP-1];                                                             // le flanc
       if(r>6.55){const g=Math.atan2(v,u)*180/Math.PI;return [g>20&&g<75?'W':'X',0,EP-2];}         // la jante, son reflet (il ne tourne pas)
       if(r<=1.3)return ['P',0,EP-1];                                                             // l'enjoliveur
       if(r<=2.6){const a=((phi-sec/2)%sec+sec)%sec;return [r>1.6&&Math.min(a,sec-a)*r<.6?'N':'X',0,EP-2];} // le moyeu, ses écrous
       const a=(phi%sec+sec)%sec;return Math.min(a,sec-a)*r<.55+.05*r?['X',0,EP-3]:['N',0,EP-5];}; // les rayons · le creux
     for(const zc of [.95,-.45])for(const sd of [-1,1]){const g=new THREE.Group(),im=[];
       g.position.set(sd*NY_VOIE,NR*vR/2,zc);g.userData.sol=1;carGroup.add(g);
       for(let f=0;f<NF;f++){const V=voxGrille();
         for(let a=0;a<NR;a++)for(let b=0;b<NR;b++){const k=cas(b-C,C-a,f*NYAN.rPas);if(!k)continue;
           for(let d=k[1];d<=k[2];d++)V.set(sd>0?d:EP-1-d,NR-1-a,b,k[0]);} // la face dessinée regarde DEHORS (+x à droite, −x à gauche)
         const m=pose(V,new THREE.Group(),0,vR,[-EP*vR/2,-NR*vR/2,-NR*vR/2]);m.visible=!f;g.add(m);im.push(m);}
       NYAN.roues.push(im);}}
    // LA FICHE : roues pixel sous les pattes (voie ±0,55 m) ; pas de halos (phares et feux sont des voxels, l'arc-en-ciel est sa
    // lumière) ; ni flamme de réacteur (`tuyeres:0`) : sa nitro, c'est l'arc-en-ciel et les étoiles, nés au milieu de la poupe.
    /* (2026-10-09, Léo, fiche de la salle blanche) « la nyan cat : plus petite » — TOUT le chat ×NY_K d'un coup, comme la descente NY_BAS plus haut : chaque géométrie (une
       fois : les images des roues et la coque du trait en partagent) et chaque position sous la caisse (les groupes animés partent de
       zéro : leurs crans sont multipliés par NY_K dans la boucle) ; ses ancrages suivent. */
    {const vu=new Set();for(let n=n0;n<carGroup.children.length;n++)carGroup.children[n].traverse(o=>{o.position.multiplyScalar(NY_K);
      if(o.isMesh&&!vu.has(o.geometry)){vu.add(o.geometry);o.geometry.scale(NY_K,NY_K,NY_K);}});
     NYAN.arc.multiplyScalar(NY_K);}
    const kk=NY_K,mk=a=>a.map(v=>v*kk);
    return {hl:mk([.5,.45,2.5]),tl:mk([.65,.8-NY_BAS,-1.1]),lpw:{R:.25*kk,w:.18*kk,style:'nyan'},wx:NY_VOIE*kk,wzF:.95*kk,wzR:.45*kk,wy:0, // (v13) les roues sous les pattes, au centre des passages · (2026-10-08) 50 cm, dessinées par le gabarit (voir 6.)
            split:0,skirt:0,sp:0,doors:0,wings:'none',glowF:0,halos:0,tuyeres:0,pots:[mk([0,.75-NY_BAS,-1.03])]};
  },
  // 15. LE REQUIN — bulle de verre sur un corps rond, museau de grand blanc, et QUATRE BRAS
  //     D'HÉLICES repliés dans les flancs au sol / déployés en vol. Les bras réutilisent les
  //     pivots des mini-ailes (`wings:'props'`) : zéro nouvelle mécanique dans la boucle.
  requin(K){
    const {W,H,L,y0,box:B,spec}=K;
    // ---- LE CORPS EST LOFTÉ, plus empilé. Profil de cétacé : museau fin, thorax plein au tiers
    // avant, puis un long étranglement jusqu'au pédoncule. C'est CETTE ligne qui fait l'animal ;
    // la peau et les dents ne font que la décorer.
    const R=W*.50;
    const geo=loftBody([[0,.06],[.05,.16],[.11,.30],[.18,.52],[.27,.78],[.38,.96],
                        [.50,1.00],[.63,.86],[.75,.62],[.86,.38],[.94,.20],[1,.08]],
      // ⚠ arch/droop sont en unités de PROFIL (rayon max = 1), pas en mètres : le loft se met à
      // l'échelle APRÈS. Les avoir donnés en H (mètres) puis remis à l'échelle faisait un poisson
      // de deux mètres de haut pour une caisse d'un mètre.
      {len:L*1.02,rings:18,seg:10,arch:.16,droop:.52,wid:.92,flat:.82, // (2026-09-29) 52 × 24 → 18 × 10 : le corps se TAILLE en facettes (DA poly, voir facetteCaisse)
       top:0x1f4a7a,side:0x5f9fd0,bel:0xf4feff});
    const peau=new THREE.MeshPhongMaterial({vertexColors:true,shininess:150,specular:0xffffff,
      envMap:envTex,reflectivity:.62,combine:THREE.MixOperation});
    rimify(peau,[.1,.58,3,.2]); // (2026-09-26) le vernis : le contre-ombrage du requin ne se noie plus dans le ciel — (vague 2) ~6 % de face, ~36 % en rasant, teinté (contrat de toute la gamme)
    {const bd=new THREE.Mesh(geo,peau);bd.scale.set(R,.53,1);bd.position.set(0,y0+H*.46,-L*.02);carGroup.add(bd);}
    // LA BULLE : elle couvre presque tout le dos, comme sur la planche — c'est elle qui fait lire
    // « habitacle transparent » et pas « pare-brise ». Et on VOIT dedans : sans sièges, une bulle
    // vide ressemble à une verrière de maquette.
    K.sph(W*.40,H*.42,L*.32,K.glass,0,y0+H*.80,L*.00);
    for(const sd of [-1,1]){
      const as=new THREE.MeshPhongMaterial({color:0x2c4468,shininess:24,specular:0x556688});
      B(W*.24,H*.30,L*.09,as,sd*W*.15,y0+H*.74,-L*.06);          // dossier
      B(W*.24,H*.07,L*.16,as,sd*W*.15,y0+H*.60,L*.02);           // assise
    }
    // L'AILERON DORSAL, SUR PIVOT : rangé au ras du dos au sol, dressé en vol (voir carFins)
    {const DOR=finShape([[0,0],[.34,.08],[.30,.34],[.12,.60],[-.06,.66],[-.18,.40],[-.16,.10]],.055);
     const finM2=new THREE.MeshPhongMaterial({color:0x4a86bc,shininess:90,specular:0xdff4ff,
       envMap:envTex,reflectivity:.4,combine:THREE.MixOperation});
     const piv=new THREE.Group();piv.position.set(0,y0+H*.92,-L*.18);
     const f9=new THREE.Mesh(DOR,finM2);f9.scale.setScalar(W*.72);
     f9.position.y=W*.72*.33;f9.rotation.y=Math.PI/2;piv.add(f9);   // décalé pour pousser vers le HAUT
     carGroup.add(piv);carFins.push(piv);}
    // LES NAGEOIRES : des LAMES falciformes extrudées, comme dans l'aperçu des dauphins
    const finM=new THREE.MeshPhongMaterial({color:0x4a86bc,shininess:90,specular:0xdff4ff,
      envMap:envTex,reflectivity:.4,combine:THREE.MixOperation});
    {const PEC=finShape([[0,0],[.10,.05],[.44,.02],[.62,-.10],[.40,-.16],[.10,-.10]],.035);
     for(const sd of [-1,1]){const p9=new THREE.Mesh(PEC,finM);p9.scale.setScalar(W*.62);
       p9.position.set(sd*W*.42,y0+H*.34,L*.12);p9.rotation.set(sd*.55,sd*-1.15,-.30);carGroup.add(p9);}}
    {const FLU=finShape([[0,0],[.10,.06],[.46,.10],[.66,.02],[.50,-.06],[.14,-.06]],.04);
     for(const sd of [-1,1]){const f9=new THREE.Mesh(FLU,finM);f9.scale.setScalar(W*.60);
       f9.position.set(sd*W*.17,y0+H*.50,-L*.54);f9.rotation.set(0,sd*.35+Math.PI/2,sd*.34);carGroup.add(f9);}}
    // LE MUSEAU : la bouche court SOUS le nez (un requin mord par en dessous), deux rangées de dents
    const bou=B(W*.34,H*.07,L*.13,K.dark,0,y0+H*.30,L*.44);bou.rotation.x=-.24;
    for(let i9=0;i9<8;i9++){const t=(i9/7-.5)*W*.30;
      K.con(.028,.080,K.acc,t,y0+H*.345,L*.455,4);
      K.con(.024,.070,K.acc,t,y0+H*.265,L*.455,4).rotation.z=Math.PI;}
    for(const sd of [-1,1]){
      K.sph(W*.050,H*.05,L*.04,K.dark,sd*W*.24,y0+H*.54,L*.34);   // œil
      K.sph(W*.015,H*.014,L*.011,K.chrome,sd*W*.225,y0+H*.565,L*.356); // sa bille de lumière
      for(let f=0;f<5;f++)B(.020,H*.10,.020,K.dark,sd*W*.42,y0+H*.50,L*(.20-f*.05)); // fentes branchiales
      // CARÉNAGES DE ROUE : sans eux les roues pendent sous un corps qui s'affine à ses extrémités
      for(const fz of [1,-1])K.sph(W*.14,H*.26,L*.18,peau,sd*(W/2-.14),y0+H*.30,fz*(L/2-.72));
    }
    return {hl:[W*.22,y0+H*.34,L*.40],tl:[W*.26,y0+H*.56,-L*.42],wr:.90,wx:W/2-.02,wz:L/2-.72,
            split:0,skirt:0,sp:0,doors:0,wings:'props',glowX:W*.44,glowY:y0+H*.14,glowL:L*.62,glowF:0};
  }
};
