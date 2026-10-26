/* LES PIÈCES. Chacune dessine dans le kit E et RENVOIE ses bouches [[x,y,z],…]. `o` : options de la fiche. */
const ECHP=(()=>{
  const PI=Math.PI;
  // UNE PIÈCE POSÉE À LA BOUCHE : la géométrie est écrite dans le repère de la bouche (axe +z = vers l'intérieur de la caisse), puis
  // tournée AUTOUR DE LA BOUCHE (rx penche vers le sol, ry vers le dehors, rz tourne la section) et posée en (x,y,z)
  const pose=(E,k,g,q,sx,sy)=>E.put(k,g,q.x,q.y,q.z,q.rx||0,q.ry||0,q.rz||0,sx||1,sy||1,1);
  const tubeG=(r1,r2,len,n,z0)=>{const g=new THREE.CylinderGeometry(r2,r1,len,n||12,1,false);g.rotateX(PI/2);g.translate(0,0,(z0||0)+len/2);return g;};
  const bagueG=(r,e,n,z0)=>{const g=new THREE.TorusGeometry(r,e,4,n||14);g.translate(0,0,z0||0);return g;};
  // LA SORTIE RONDE : tube, âme noire en retrait (sauf `ame:0`), bague au bord ; `ev` évase la sortie, `dbl` double paroi, `bout` = un
  // manchon teinté à la bouche (titane brûlé), `lueur` = un feu au fond
  const rond=(E,x,y,z,o)=>{const r=o.r||.05,n=o.n||12,k=o.k||'c',L=o.len||.32,ev=o.ev||1,q={x,y,z,rx:o.rx,ry:o.ry,rz:o.rz},sx=o.sx,sy=o.sy;
    pose(E,k,tubeG(r*ev,r,L,n),q,sx,sy);
    if(o.bout)pose(E,o.bout,tubeG(r*ev*1.03,r*1.03,.06,n,-.002),q,sx,sy);
    if(o.dbl)pose(E,o.k2||'C',tubeG(r*ev*.74,r*ev*.74,.06,n,.012),q,sx,sy);
    if(o.ame!==0)pose(E,'k',tubeG(r*ev*(o.dbl?.58:.80),r*ev*(o.dbl?.58:.80),.05,n,o.dbl?.03:.008),q,sx,sy);
    if(o.bague!==0)pose(E,o.kb||k,bagueG(r*ev*.94,Math.max(.006,r*.12),n),q,sx,sy);
    if(o.lueur)pose(E,o.lueur,tubeG(r*ev*.45,r*ev*.45,.01,n,.06),q,sx,sy);
    return [x,y,z];};
  // LA BOUCHE RECTANGULAIRE (boîte creuse) : largeur w, hauteur h ; `cloison` = deux sorties dans la même bouche
  const rect=(E,x,y,z,o)=>{const w=o.w||.16,h=o.h||.07,L=o.len||.3,k=o.k||'c',e=o.e||.016;
    E.box(k,w,e,L,x,y+h/2-e/2,z+L/2);E.box(k,w,e,L,x,y-h/2+e/2,z+L/2);E.box(k,e,h,L,x-w/2+e/2,y,z+L/2);E.box(k,e,h,L,x+w/2-e/2,y,z+L/2);
    if(o.cloison)E.box(k,e,h,L,x,y,z+L/2);
    E.box('k',w-2*e,h-2*e,.04,x,y,z+.02);
    if(o.lueur)E.box(o.lueur,(w-2*e)*.7,(h-2*e)*.5,.01,x,y,z+.05);
    return [x,y,z];};
  const P={
    rond:(E,o)=>o.pts.map(q=>rond(E,q[0],q[1],q[2],Object.assign({},o,q[3]||{}))),
    /* (2026-10-15, pôle TECHNIQUE — Léo : « un pot d'échappement plus réaliste, métallique… refonte du pot, sur LA HONTE, et toutes les voitures qui
       ont un pot aussi peu bien fait ») LE POT RÉEL : un vrai embout d'échappement — le tube à peine évasé, le BORD ROULÉ, la double paroi plus
       sombre, la SUIE puis le fond noir, la chaleur derrière le bord (une bande DORÉE, puis BLEUIE), un cordon de soudure, le tuyau qui repart
       sous la caisse vers son silencieux et le collier qui le tient. Remplace le pot générique des gabarits sans fiche et les tubes fins et nus. */
    reel:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,o2=Object.assign({},o,q[3]||{}),r=o2.r||.045,k=o2.k||'c',L=o2.len||.3,n=16,Q={x,y,z,rx:o2.rx,ry:o2.ry,rz:o2.rz};
      pose(E,k,tubeG(r*1.06,r,L,n),Q);                                    // le tube, à peine évasé vers la bouche
      pose(E,k,bagueG(r*1.03,Math.max(.004,r*.16),n,.004),Q);             // le BORD ROULÉ
      pose(E,'C',tubeG(r*.8,r*.8,.07,n,.01),Q);                           // la double paroi
      pose(E,'f',tubeG(r*.68,r*.68,.05,n,.028),Q);                        // la suie
      pose(E,'k',tubeG(r*.64,r*.64,.02,n,.07),Q);                         // le fond
      pose(E,o2.kc||'x',tubeG(r*1.075,r*1.07,.045,n,.03),Q);              // la chaleur : la bande DORÉE derrière le bord…
      pose(E,'h',tubeG(r*1.07,r*1.065,.05,n,.075),Q);                     // …puis BLEUIE
      pose(E,k,bagueG(r*1.03,Math.max(.003,r*.07),n,L*.72),Q);            // le cordon de soudure
      {const g=new THREE.CylinderGeometry(r*.8,r*.8,.4,10);g.rotateX(PI/2);g.rotateX(-.22);g.translate(0,-.03,L+.17);pose(E,'f',g,Q);} // le tuyau qui repart sous la caisse
      {const g=new THREE.BoxGeometry(r*.7,r*1.6,.024);g.translate(0,r*1.2,L*.86);pose(E,'s',g,Q);} // le collier de fixation
      return [x,y,z];}),
    rect:(E,o)=>o.pts.map(q=>rect(E,q[0],q[1],q[2],Object.assign({},o,q[3]||{}))),
    // UN ÉCRIN derrière les sorties (feuille d'or, laque noire…) : x,y,z centre, w,h
    plaque:(E,o)=>{E.box(o.k||'o',o.w,o.h,.012,o.x||0,o.y,o.z);return [];},
    // LA FENTE : une bouche large et mince, une lueur dedans
    fente:(E,o)=>o.pts.map(q=>{const w=o.w,h=o.h;E.box(o.k||'s',w+.03,h+.03,.06,q[0],q[1],q[2]+.03);E.box('k',w,h,.02,q[0],q[1],q[2]-.002);
      if(o.lueur)E.box(o.lueur,w*.9,h*.55,.01,q[0],q[1],q[2]-.008);return [q[0],q[1],q[2]];}),
    // LA TUYÈRE À PÉTALES : n pétales autour d'une bouche de rayon r ; des aubes dedans (`aubes`), une lueur au fond
    turbine:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,r=o.r,n=o.n||10,Q={x,y,z};
      pose(E,o.k||'C',tubeG(r*1.04,r*1.12,.2,n,.02),Q);pose(E,'k',tubeG(r*.86,r*.86,.04,n,.03),Q);
      for(let i=0;i<n;i++){const a=(i+.5)/n*PI*2,g=new THREE.BoxGeometry(r*.58,.012,.17);g.rotateX(-.22);g.translate(0,r*1.0,-.03);g.rotateZ(a-PI/2);pose(E,o.kp||'a',g,Q);}
      for(let i=0;i<(o.aubes||0);i++){const g=new THREE.BoxGeometry(r*1.65,.014,.03);g.rotateZ(i/o.aubes*PI);g.translate(0,0,.07);pose(E,'s',g,Q);}
      if(o.lueur)pose(E,o.lueur,tubeG(r*.5,r*.5,.01,n,.1),Q);
      return [x,y,z];}),
    // LA CLOCHE de tuyère de fusée
    cloche:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,r=o.r,n=o.n||12;
      E.lathe(o.k||'C',[[r*.55,.32],[r*.6,.2],[r*.8,.1],[r,0]],n,x,y,z,'z');E.lathe('k',[[r*.5,.3],[r*.55,.18],[r*.75,.08],[r*.93,.004]],n,x,y,z+.003,'z');
      pose(E,o.kb||'b',bagueG(r*.98,.012,n),{x,y,z});if(o.lueur)pose(E,o.lueur,tubeG(r*.4,r*.4,.01,n,.2),{x,y,z});return [x,y,z];}),
    // LES OUÏES : trois fentes superposées par côté, le feu au fond
    ouies:(E,o)=>o.pts.map(q=>{for(let i=0;i<3;i++){const y=q[1]+(i-1)*o.pas,w=o.w*(1-.12*Math.abs(i-1));
        E.box(o.k||'C',w+.02,o.h+.02,.05,q[0],y,q[2]+.025);E.box('k',w,o.h,.02,q[0],y,q[2]-.002);if(o.lueur)E.box(o.lueur,w*.8,o.h*.35,.01,q[0],y,q[2]-.006);}
      return [q[0],q[1],q[2]];}),
    // LA GUEULE : une sortie ronde et ses crocs
    gueule:(E,o)=>o.pts.map(q=>{const m=rond(E,q[0],q[1],q[2],o),r=(o.r||.06)*(o.ev||1),c=o.crocs||6;
      for(let i=0;i<c;i++){const a=PI/2+i/c*PI*2,g=new THREE.ConeGeometry(.02,.08,4);g.rotateZ(PI);g.translate(0,r*1.12,-.015);g.rotateZ(a-PI/2);pose(E,o.kc||'w',g,{x:q[0],y:q[1],z:q[2]});}
      return m;}),
    // LA SORTIE LATÉRALE : un tube qui sort du flanc (axe x), juste devant la roue arrière
    lateral:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,sd=Math.sign(x)||1,r=o.r||.05,L=o.len||.4;
      const g=tubeG(r,r,L,o.n||12);E.put(o.k||'c',g,x,y,z,0,-sd*PI/2,0);
      E.put('k',tubeG(r*.78,r*.78,.05,o.n||12,.008),x,y,z,0,-sd*PI/2,0);E.put(o.k||'c',bagueG(r*.95,Math.max(.006,r*.12),o.n||12),x,y,z,0,-sd*PI/2,0);
      return [x+sd*.01,y,z-.02];}),
    // LE POT LATÉRAL : un long tube chromé le long du bas de caisse, son écran perforé, la sortie devant la roue arrière
    sidepipe:(E,o)=>o.pts.map(q=>{const [x,y,z1,z0]=q,sd=Math.sign(x)||1,r=o.r,L=z1-z0,X=x+sd*(r+.012);
      pose(E,o.k||'c',tubeG(r,r,L,12),{x:X,y,z:z0});pose(E,'k',tubeG(r*.78,r*.78,.04,12,.008),{x:X,y,z:z0});pose(E,o.k||'c',bagueG(r*.95,.007,12),{x:X,y,z:z0});
      E.box(o.kb||'a',.012,r*1.5,L*.6,X+sd*(r+.004),y,(z0+z1)/2);                                   // l'écran
      for(let i=0;i<9;i++)E.box('k',.006,.016,.03,X+sd*(r+.011),y+(i%2?.012:-.012),z0+L*.22+i*L*.064); // ses trous
      for(const zz of [z0+.06,z1-.04])E.box(o.k||'c',.03,.03,.05,x+sd*.012,y,zz);                     // ses pattes
      return [X,y,z0];}),
    // LES CHEMINÉES : deux tubes debout derrière la cabine, un clapet sur chacune
    cheminee:(E,o)=>o.pts.map(q=>{const [x,y0,z]=q,h=q[3]&&q[3].h||o.h,r=o.r;
      E.cyl(o.k||'c',r,h,12,x,y0+h/2,z,'y');E.cyl('k',r*.8,.04,12,x,y0+h-.015,z,'y');
      E.put(o.kc||'C',new THREE.BoxGeometry(r*2.3,.012,r*2.3),x,y0+h+.035,z-r*.6,-.55,0,0);
      for(const dy of [.25,.55])E.cyl('C',r*1.15,.03,12,x,y0+h*dy,z,'y');
      return [x,y0+h,z-r];}),
    // LE HOT ROD : ses quatre collecteurs par flanc (posés par son gabarit) gagnent un bout brûlé et une gueule noire
    hotrod:(E)=>{const M=[],v=new THREE.Vector3(),eu=new THREE.Euler();
      for(const sd of [1,-1])for(let i=0;i<4;i++){const z=.82+i*.16;eu.set(-.35,0,-sd*.45);
        v.set(0,.17,0).applyEuler(eu);const x=sd*.31+v.x,y=.85+v.y,zz=z+v.z;
        const g1=new THREE.CylinderGeometry(.036,.036,.05,6,1,true);g1.translate(0,-.022,0);E.put('x',g1,x,y,zz,-.35,0,-sd*.45);
        const g2=new THREE.CylinderGeometry(.026,.026,.012,6);E.put('k',g2,x,y-.002,zz,-.35,0,-sd*.45);
        {const d=[v.x/.17,v.y/.17,v.z/.17],t=(Math.abs(x)-.23)/Math.abs(d[0]);   // (2026-10-15) LES POTS ENCASTRÉS : le collecteur entre dans le flanc du bloc (x ±0,23) par sa LUMIÈRE,
          P.encoche(E,{f:'r',x:sd*.23,y:y-d[1]*t,z:zz-d[2]*t,rx:.034,ry:.062,d:[sd,0,0]});   // une encoche rectangulaire à jonc, comme la bride d'un vrai V8 (le tube la traverse en biais)
          E.box('k',.006,2*(.062+ECH_ENC.jeu),2*(.034+ECH_ENC.jeu),sd*.233,y-d[1]*t,zz-d[2]*t);}  // et son FOND NOIR : la face du bloc n'est pas percée, sans lui la lumière restait rouge
        if(i===1||i===3)M.push([x,y,zz]);}
      return M;},
    // LE NUAGE : une bouche sombre dans une couronne de petits nuages
    nuage:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,r=o.r,Q={x,y,z};pose(E,'C',tubeG(r*.8,r*.8,.2,10,.02),Q);pose(E,'k',tubeG(r*.62,r*.62,.04,10,.01),Q);
      for(let i=0;i<7;i++){const a=i/7*PI*2+.3,s=r*(.42+.12*((i*37)%3));E.put('w',new THREE.IcosahedronGeometry(s,1),x+Math.cos(a)*r*1.05,y+Math.sin(a)*r*1.05,z+.03);}
      return [x,y,z];}),
    // LE PIXEL : un tube CARRÉ bagué des six couleurs de l'arc-en-ciel
    pixel:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,a=o.a;E.box('C',a,a,.2,x,y,z+.12);E.box('k',a*.6,a*.6,.03,x,y,z+.01);
      for(let i=0;i<6;i++)E.box(String(i+1),a+.02,a/6+.004,.03,x,y+a/2-a/12-i*a/6,z+.04);return [x,y,z];}),
    // LE TRIANGLE : une bouche triangulaire pliée dans l'inox, une lueur
    triangle:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,w=o.w,h=o.h,sd=Math.sign(x)||1,L=.18,P3=[[x-w/2,y-h/2],[x+w/2,y-h/2],[x+sd*w*.28,y+h/2]];
      for(let i=0;i<3;i++){const a=P3[i],b=P3[(i+1)%3];E.tri(o.k||'a',[a[0],a[1],z],[b[0],b[1],z],[b[0],b[1],z+L]);E.tri(o.k||'a',[a[0],a[1],z],[b[0],b[1],z+L],[a[0],a[1],z+L]);}
      const c=[(P3[0][0]+P3[1][0]+P3[2][0])/3,(P3[0][1]+P3[1][1]+P3[2][1])/3];
      for(let i=0;i<3;i++){const a=P3[i],b=P3[(i+1)%3],s9=.72;E.tri('k',[c[0]+(a[0]-c[0])*s9,c[1]+(a[1]-c[1])*s9,z+.02],[c[0]+(b[0]-c[0])*s9,c[1]+(b[1]-c[1])*s9,z+.02],[c[0],c[1],z+.02]);}
      if(o.lueur)E.tri(o.lueur,[c[0]-w*.12,c[1]-h*.12,z+.03],[c[0]+w*.12,c[1]-h*.12,z+.03],[c[0],c[1]+h*.14,z+.03]);
      return [x,y,z];}),
    // LE CRISTAL : un tube de glace à six pans, une lueur bleue au fond, trois éclats autour
    cristal:(E,o)=>o.pts.map(q=>{const [x,y,z]=q,r=o.r,Q={x,y,z,rz:PI/6};pose(E,'i',tubeG(r*1.12,r*.9,.26,6),Q);pose(E,'n',tubeG(r*.86,r*.86,.03,6,.012),Q);
      pose(E,'G',tubeG(r*.6,r*.6,.01,6,.03),Q);for(let i=0;i<3;i++){const a=PI/6+i*PI*2/3,g=new THREE.ConeGeometry(.02,.09,4);g.rotateX(-PI/2+.5);g.translate(0,r*1.15,.04);g.rotateZ(a-PI/2);pose(E,'i',g,{x,y,z});}
      return [x,y,z];}),
    // L'ÉPAVE : un tuyau tordu qui pend, rouillé, ficelé au fil de fer
    epave:(E,o)=>{const [x,y,z]=o.pt,r=o.r,seg=[[x,y+.06,z+.5],[x,y+.02,z+.18],[x-.04,y-.06,z-.02],[x-.07,y-.16,z-.12]];
      for(let i=0;i<seg.length-1;i++){const a=seg[i],b=seg[i+1],dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz);
        const g=new THREE.CylinderGeometry(r,r,l,8);g.rotateX(PI/2);E.put(i%2?'R':'r',g,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,-Math.asin(dy/l),Math.atan2(dx,dz),0);}
      const e=seg[3];E.put('k',new THREE.CylinderGeometry(r*.8,r*.8,.02,8),e[0],e[1],e[2],PI/2-.6,0,0);
      E.put('C',new THREE.TorusGeometry(r*1.25,.006,3,8),x,y+.04,z+.3);E.box('C',.006,.18,.006,x,y+.13,z+.3);
      return [[e[0],e[1]+.02,e[2]]];},
  };
  // L'ENCOCHE (voir LES POTS ENCASTRÉS) : la poche noire percée dans le pare-chocs, à la forme de l'embout plus le jeu, et son jonc sombre
  P.encoche=(E,o)=>{const J=Object.assign({},ECH_ENC,o.jeu?{jeu:o.jeu}:{},o.jonc?{jonc:o.jonc}:{}),ex=o.rx+J.jeu,ey=o.ry+J.jeu,D=o.d||[0,0,-1];
    // bâtie dans son repère (l'ouverture regarde −z, la poche s'enfonce vers +z), puis tournée vers la sortie et posée sur la tôle
    const eu=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,-1),new THREE.Vector3(D[0],D[1],D[2]).normalize())),
      M9=new THREE.Matrix4(),Q9=new THREE.Quaternion(),pose=(k,g,px,py,pz,sx,sy,sz,rx)=>{Q9.setFromEuler(new THREE.Euler(rx||0,0,0));
        g.applyMatrix4(M9.compose(new THREE.Vector3(px,py,pz),Q9,new THREE.Vector3(sx||1,sy||1,sz||1)));E.put(k,g,o.x,o.y,o.z,eu.x,eu.y,eu.z);},zp=-.004+J.poche/2;
    if(o.f==='o'){pose('k',new THREE.CylinderGeometry(1,1,1,20,1,true),0,0,zp,ex,J.poche,ey,PI/2);pose('k',new THREE.CircleGeometry(1,20),0,0,-.004+J.poche,ex,ey,1);
      pose('f',new THREE.RingGeometry(1,1+J.jonc/Math.min(ex,ey),20),0,0,-.006,ex,ey,1);}
    else{const j=J.jonc,e=.006,B=(k,w,h,d,x,y,z)=>pose(k,new THREE.BoxGeometry(w,h,d),x,y,z);
      B('k',2*ex,e,J.poche,0,ey-e/2,zp);B('k',2*ex,e,J.poche,0,-ey+e/2,zp);B('k',e,2*ey,J.poche,-ex+e/2,0,zp);B('k',e,2*ey,J.poche,ex-e/2,0,zp);B('k',2*ex,2*ey,e,0,0,-.004+J.poche);
      B('f',2*ex+2*j,j,.006,0,ey+j/2,-.006);B('f',2*ex+2*j,j,.006,0,-ey-j/2,-.006);B('f',j,2*ey,.006,-ex-j/2,0,-.006);B('f',j,2*ey,.006,ex+j/2,0,-.006);}
    return [];};
  P.ovale=(E,o)=>P.rond(E,Object.assign({sx:1.45,sy:.72},o));
  return P;})();
/* LES POTS ENCASTRÉS (2026-10-15, Léo : « le pot d'échappement de la honte est un peu bizarre et mal. Il devrait être encastré, puis
   passer à travers une encoche qui a été faite exprès, un peu comme les vraies voitures » · « fais pareil pour toutes les voitures
   (seulement pot échappement) »). Sur une vraie voiture, le pare-chocs est percé d'une OUVERTURE à la forme de la sortie, un peu plus
   grande (le jeu : le pot vibre et chauffe), souvent bordée d'un jonc ; l'embout y est centré, à fleur ou dépassant d'un ou deux
   centimètres. Ici, pour chaque bouche qui sort par l'ARRIÈRE (rond, ovale, rect, fente, ouïes, turbine, cloche, cristal, gueule,
   pixel, triangle, nuage) : un rayon tiré de l'arrière trouve la tôle à la hauteur de la bouche (la caisse vient d'être montée, le pot
   pas encore) ; si elle est là, à moins de 70 cm, et qu'elle entoure la bouche (6 rayons sur 8 en anneau), l'embout est recalé à
   1,6 cm devant elle et une ENCOCHE est posée : une poche noire CREUSE à la forme de l'embout + 1,2 cm de jeu (ses parois et un fond à
   14 cm : ce qui est dessiné au fond des sorties — âmes, lueurs, aubes — reste visible) et un jonc sombre de 1,4 cm. Deux encoches d'une même pièce qui se touchent n'en font qu'une (rectangulaire). Une bouche qui sort SOUS la caisse (ou plus
   grosse que la tôle qu'elle perce) n'a pas d'encoche, comme sur les vraies : son embout s'arrête à 3 cm derrière la ligne du pare-chocs
   au-dessus d'elle, il ne pend plus derrière la voiture. Les sorties latérales, les cheminées et les collecteurs ne bougent pas. `enc:0`
   sur une fiche : ses pots restent tels quels (LA SILENCIEUSE : son silencieux est son dessin). Les flammes suivent (elles naissent aux
   bouches). */
const ECH_ENC={jeu:.012,jonc:.014,dep:.016,poche:.14,portee:.7};
function echTaille(t,o){ // le demi-gabarit d'un embout vu de l'arrière : [forme, demi-largeur, demi-hauteur] — null : la pièce ne sort pas par l'arrière
  const r=(o.r||.05)*(o.ev||1);
  switch(t){
    case 'rond':return ['o',r*(o.sx||1),r*(o.sy||1)];
    case 'reel':return ['o',r*1.12,r*1.12]; // (le pot réel : le bord roulé compris)
    case 'ovale':return ['o',r*(o.sx||1.45),r*(o.sy||.72)];
    case 'gueule':return ['o',r*1.3,r*1.3];
    case 'turbine':return ['o',o.r*1.14,o.r*1.14];
    case 'cloche':return ['o',o.r,o.r];
    case 'cristal':return ['o',o.r*1.16,o.r*1.16];
    case 'nuage':return ['o',o.r*1.6,o.r*1.6];
    case 'rect':return ['r',(o.w||.16)/2,(o.h||.07)/2];
    case 'fente':return ['r',(o.w+.03)/2,(o.h+.03)/2];
    case 'ouies':return ['r',(o.w+.02)/2,o.pas+(o.h+.02)/2];
    case 'pixel':return ['r',o.a/2+.01,o.a/2];
    case 'triangle':return ['r',o.w/2,o.h/2];
    case 'lateral':return ['o',o.r||.05,o.r||.05];
  }
  return null;}
const ECH_RC={rc:null,v:new THREE.Vector3(),w:new THREE.Vector3(),q:new THREE.Quaternion(),m:[]};
function echRayon(o,d){ // un rayon dans le repère caisse (origine o, direction d) : le premier pan touché [x,y,z], ou null
  const T=ECH_RC;T.v.set(o[0],o[1],o[2]);carGroup.localToWorld(T.v);T.w.set(d[0],d[1],d[2]).normalize().applyQuaternion(T.q);T.rc.set(T.v,T.w);
  const h=T.rc.intersectObjects(T.m,false)[0];if(!h)return null;const p=carGroup.worldToLocal(h.point);return [p.x,p.y,p.z];}
function echTole(x,y){const h=echRayon([x,y,-60],[0,0,1]);return h?h[2]:null;} // la tôle derrière (x, y) : son z, ou null
function echPrep(){ // la caisse telle qu'elle est (le pot n'est pas encore là) : ce que les rayons voient
  const T=ECH_RC;T.rc=T.rc||new THREE.Raycaster();carGroup.updateMatrixWorld(true);carGroup.getWorldQuaternion(T.q);
  T.m.length=0;carGroup.traverse(o=>{if(!o.isMesh||(o.userData&&o.userData.sol))return;for(let q=o;q&&q!==carGroup;q=q.parent)if(!q.visible)return;
    const mt=Array.isArray(o.material)?o.material[0]:o.material;if(mt&&(mt.transparent||mt.blending===THREE.AdditiveBlending))return;T.m.push(o);});}
const ECH_V=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],ECH_N=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
function echSortie(t,o,q){ // la direction où regarde une bouche (vers le DEHORS), dans le repère caisse
  if(t==='lateral')return [Math.sign(q[0])||1,0,0];
  if(o.rx||o.ry||o.rz){const v=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(o.rx||0,o.ry||0,o.rz||0));if(v.z<-.7)return [0,0,-1];return [v.x,v.y,v.z];} // un tube à peine biais (PIZZA, GROUPE B : 26°) se règle comme les autres, le long de z : tels que Léo les a validés (v468)
  return [0,0,-1];}
function echEncastre(P){
  echPrep();const J=ECH_ENC,out=[],N=[];let dzPrec=0;
  for(const pc of P){
    if(pc.t==='plaque'){const z=echTole(pc.x||0,pc.y);out.push(z!=null&&z-pc.z<J.portee&&z-pc.z>-.3?Object.assign({},pc,{z:z-.004}):pc);continue;}
    // LES CHEMINÉES : elles montent à travers une encoche percée dans ce qui est dessous (elles y plongent de 8 cm)
    if(pc.t==='cheminee'&&pc.pts){out.push(Object.assign({},pc,{pts:pc.pts.map(q=>{const H=echRayon([q[0],q[1]+.3,q[2]],[0,-1,0]);
      if(!H||H[1]<q[1]-1||H[1]>q[1]+.3)return q;const y0=H[1]-.08;
      N.push({f:'o',x:q[0],y:H[1],z:q[2],rx:pc.r,ry:pc.r,d:[0,1,0],jeu:pc.jeu,jonc:pc.jonc});
      return [q[0],y0,q[2],Object.assign({},q[3]||{},{h:(q[3]&&q[3].h||pc.h)+q[1]-y0})];})}));continue;}
    if(!pc.pts){out.push(pc);continue;}
    const q2=pc.pts.map(q=>q.slice()),G=[];
    // `lie` : la pièce suit la précédente (l'embout du silencieux de LA SILENCIEUSE)
    if(pc.lie){for(const q of q2)q[2]+=dzPrec;out.push(Object.assign({},pc,{pts:q2}));continue;}
    const pres=t=>t>=-.4&&t<=J.portee;                                                 // la tôle est à portée (t : ce que la bouche dépasse)
    pc.pts.forEach((q,i)=>{const o=Object.assign({},pc,q[3]||{}),tl=echTaille(pc.t,o);if(!tl)return;
      const S=echSortie(pc.t,o,q),U=Math.abs(S[1])>.9?[1,0,0]:ECH_N(ECH_V(S,[0,1,0])),V=ECH_V(U,S);
      const tir=(du,dv)=>{const O=[q[0]+U[0]*du+V[0]*dv+S[0]*60,q[1]+U[1]*du+V[1]*dv+S[1]*60,q[2]+U[2]*du+V[2]*dv+S[2]*60];return echRayon(O,[-S[0],-S[1],-S[2]]);};
      const dep=H=>(q[0]-H[0])*S[0]+(q[1]-H[1])*S[1]+(q[2]-H[2])*S[2];               // de combien la bouche dépasse de la tôle
      const H=tir(0,0);let n=0;
      if(H&&pres(dep(H))){const e9=(pc.jeu||J.jeu)+(pc.jonc||J.jonc)+.01,ax=tl[1]+e9,ay=tl[2]+e9; // l'anneau : la tôle entoure-t-elle la bouche ?
        for(let a=0;a<8;a++){const H2=tir(Math.cos(a*Math.PI/4)*ax,Math.sin(a*Math.PI/4)*ay);if(H2&&Math.abs(dep(H2)-dep(H))<.12)n++;}}
      if(n>=6||(pc.force&&H&&pres(dep(H)))){G.push({i:i,f:tl[0],x:q[0],y:q[1],z:q[2],h:H,s:S,rx:tl[1],ry:tl[2],jeu:pc.jeu,jonc:pc.jonc});return;}
      // SOUS LA CAISSE (ou plus grosse que la tôle qu'elle perce) : pas d'encoche, mais l'embout s'arrête à 3 cm de la ligne de la tôle
      // au-dessus de lui — il ne pend plus
      let t9=H&&pres(dep(H))?dep(H):null;for(let k=1;k<=12&&t9==null;k++){const H2=tir(0,k*.03);if(H2&&pres(dep(H2)))t9=dep(H2);}
      if(t9!=null&&t9>.03)for(let c=0;c<3;c++)q2[i][c]-=S[c]*(t9-.03);});
    // les encoches de la pièce : celles qui regardent vers l'ARRIÈRE et se touchent n'en font qu'une (un rectangle, la face au plus en arrière)
    const grp=G.map(g=>[g]),arr=g=>g.s[2]<-.99;
    for(let a=0;a<grp.length;a++)for(let b=a+1;b<grp.length;b++){const A9=grp[a],B9=grp[b];if(!A9.length||!B9.length)continue;
      const tou=A9.some(g=>B9.some(h=>arr(g)&&arr(h)&&Math.abs(g.x-h.x)<g.rx+h.rx+2*(J.jeu+J.jonc)+.01&&Math.abs(g.y-h.y)<g.ry+h.ry+2*(J.jeu+J.jonc)+.01));
      if(tou){A9.push(...B9);B9.length=0;b=a;}}
    for(const L9 of grp){if(!L9.length)continue;
      if(L9.length===1){const g=L9[0];for(let c=0;c<3;c++)q2[g.i][c]=g.h[c]+g.s[c]*J.dep;
        N.push({f:g.f,x:g.h[0],y:g.h[1],z:g.h[2],rx:g.rx,ry:g.ry,d:g.s,jeu:g.jeu,jonc:g.jonc});continue;}
      const z=Math.min(...L9.map(g=>g.h[2]));for(const g of L9)q2[g.i][2]=z-J.dep;
      const x0=Math.min(...L9.map(g=>g.x-g.rx)),x1=Math.max(...L9.map(g=>g.x+g.rx)),y0=Math.min(...L9.map(g=>g.y-g.ry)),y1=Math.max(...L9.map(g=>g.y+g.ry));
      N.push({f:'r',x:(x0+x1)/2,y:(y0+y1)/2,z:z,rx:(x1-x0)/2,ry:(y1-y0)/2,jeu:L9[0].jeu,jonc:L9[0].jonc});}
    dzPrec=q2.length?q2[0][2]-pc.pts[0][2]:0;
    out.push(Object.assign({},pc,{pts:q2}));}
  for(const n of N)out.push(Object.assign({t:'encoche',bouche:0},n));
  return out;}
/* ÔTER L'ANCIEN EMBOUT : `gs` = les géométries d'un kit ({famille: BufferGeometry} non indexées), `prims` = ses pièces simples */
function echRetire(gs,prims,shape){
  const F=ECH_POTS[shape];if(!F||F.garde)return gs;
  let zMin=1e9;for(const g in gs){gs[g].computeBoundingBox();zMin=Math.min(zMin,gs[g].boundingBox.min.z);}
  const B=[];
  if(prims)for(let i=prims.length-1;i>=0;i--){const p=prims[i];if(p.g==='l'||p.g==='g'||p.g==='p'||String(p.g).indexOf('pm:')===0)continue;let bx=null; // (2026-10-16) 'pm:…' : la tôle à motif (voir MOTIFS)
    if((p.t==='cyl'||p.t==='lathe')&&p.ax==='z'&&p.r<=.2&&p.z0<=zMin+.7&&p.y>.08&&p.y<=.6)bx=[p.x-p.r-.012,p.y-p.r-.012,p.z0-.012,p.x+p.r+.012,p.y+p.r+.012,p.z1+.012];
    else if(p.t==='box'&&!p.rot&&p.g==='c'&&p.w<=.4&&p.h<=.25&&p.z-p.d/2<=zMin+.15&&p.y<=.6&&((p.w>=p.h&&p.h>=.07)||(p.w<=.12&&p.h<=.12&&p.w>=.04&&p.h>=.04&&p.d>=.08)))
      bx=[p.x-p.w/2-.01,p.y-p.h/2-.01,p.z-p.d/2-.01,p.x+p.w/2+.01,p.y+p.h/2+.01,p.z+p.d/2+.01];
    if(bx){B.push(bx);prims.splice(i,1);}}
  for(const o of (F.ote||[]))B.push(o);
  if(!B.length)return gs;
  const dedans=(a,i)=>{for(const b of B)if(a[i]>=b[0]&&a[i]<=b[3]&&a[i+1]>=b[1]&&a[i+1]<=b[4]&&a[i+2]>=b[2]&&a[i+2]<=b[5])return true;return false;};
  for(const g in gs){const pa=gs[g].attributes.position.array,ca=gs[g].attributes.color.array,P2=[],C2=[];let ote=0;
    for(let i=0;i<pa.length;i+=9){if(dedans(pa,i)&&dedans(pa,i+3)&&dedans(pa,i+6)){ote++;continue;}
      for(let k=0;k<9;k++){P2.push(pa[i+k]);C2.push(ca[i+k]);}}
    if(!ote)continue;
    const n=new THREE.BufferGeometry();n.setAttribute('position',new THREE.Float32BufferAttribute(P2,3));n.setAttribute('color',new THREE.Float32BufferAttribute(C2,3));
    n.computeVertexNormals();gs[g].dispose();gs[g]=n;}
  return gs;}
/* DESSINER LE NOUVEAU POT, et déclarer ses bouches (la flamme naît là) */
function echappement(K,shape,A){
  let F=ECH_POTS[shape];
  if(!F&&A.pipes!==0){const W=K.W,L=K.L,y=A.split?K.y0+K.H*.06:K.y0+.08;F={p:[{t:'reel',r:.042,k:'c',len:.34,jeu:.008,jonc:.008,pts:[[W*.22,y,-L/2-.31],[-W*.22,y,-L/2-.31]]}]};} /* (2026-10-15) le POT RÉEL (voir ECHP.reel) au lieu du tube nu */ // (2026-10-15) les deux pots « canoniques » des gabarits sans fiche (des boîtes chromées de 22 cm qui pendaient 31 cm derrière) : deux vrais tubes de 7 cm, ENCASTRÉS dans le diffuseur (ou la tôle)
  if(!F||!F.p)return;
  if(F.vieux){const g=K.add(new THREE.Group()),car=g.parent;car.remove(g);   // les gabarits d'avant le kit : leurs canons sont des maillages à part
    for(const o of car.children.slice()){const p=o.geometry&&o.geometry.parameters;
      if(o.isMesh&&o.geometry.type==='CylinderGeometry'&&Math.abs(o.rotation.x-Math.PI/2)<.05&&o.position.y<.6&&o.position.z<-K.L/2+.6&&Math.max(p.radiusTop,p.radiusBottom)<=.2)car.remove(o);}}
  if(!F.p)return;
  const E=K.kit(ECH_PAL),M=[];E.ech=1;                            // (le kit du pot ne passe pas par echRetire)
  for(const pc of (F.enc===0?F.p:echEncastre(F.p))){const f=ECHP[pc.t];if(f){const m9=f(E,pc);if(pc.bouche!==0)for(const m of m9)M.push(m);}} // (2026-10-15) LES POTS ENCASTRÉS
  K.commit(E);
  A.pipes=0;                                                       // plus de cylindres « canoniques » (les gabarits d'avant le kit)
  if(F.bouches!==0&&M.length)A.pots=M.slice(0,4);                 // 4 bouches au plus portent une flamme (voir les tuyères de buildCar)
}
const ECH_POTS={  // (⚠ pas `ECH` : le banc du téléphone a déjà le sien)
 epave:{p:[{t:'reel',k:'C',r:0.046,len:0.45,jeu:.007,jonc:.008,pts:[[0.55,0.3955,-2.4]]}]}, /* (2026-10-15, Léo : « un pot plus réaliste à LA HONTE, métallique, côté GAUCHE, et ça devrait ne sortir que d'un pot ») UN SEUL pot RÉEL, en acier, à gauche (x > 0 = la gauche de la caisse : la gauche de l'écran vue de derrière) — la flamme ne sort plus que de lui ; avant : */ // (2026-10-15, Léo : « il devrait être encastré, puis passer à travers une encoche ») deux pots ROUILLÉS de 5-6 cm (pas tout à fait pareils), chacun dans son encoche percée dans le DIFFUSEUR, entre ses ailettes — avant : un tuyau tordu qui traversait le pare-chocs sans trou et pendait, ficelé, et un bout de tube qui flottait derrière
 eldorado:{p:[{t:'ovale',r:0.06,sx:1.7,sy:0.62,k:'c',dbl:1,pts:[[0.68,0.4,-3.08],[-0.68,0.4,-3.08]]}]},  // (2026-10-14, passe graphismes · pots) recalé sur le pare-chocs reculé de Léo (face à z -3,06) : bouches de -3,06 à -3,08, elles dépassent de 2 cm au lieu d'affleurer (z-fighting chrome)
 a_chargeur:{p:[{t:'rect',w:0.24,h:0.075,k:'c',e:0.015,pts:[[0.56,0.33,-2.58],[-0.56,0.33,-2.58]]}]},
 a_defieur:{p:[{t:'rond',r:0.068,k:'c',ev:1.06,pts:[[0.62,0.33,-2.584],[-0.62,0.33,-2.584]]}]},
 b_bavaroise:{p:[{t:'rond',r:0.038,k:'a',dbl:1,pts:[[0.28,0.27,-2.39],[0.38,0.27,-2.39]]}]},  // (2026-10-14, passe graphismes · pots) recalé sur la poupe de Léo : son bouclier recule à z -2,29 (bouches de -2,26 à -2,39, elles dépassent de 10 cm comme avant)
 caid:{p:[{t:'fente',w:.34,h:.04,k:'s',lueur:'G',pts:[[.52,.66,-2.845],[-.52,.66,-2.845]]}]}, // (2026-10-26, LE CAÏD MONOLITHE) électrique : pas de pots, deux fentes qui luisent bleu au bas du pare-chocs (comme LA PERLE) — avant : les sorties latérales du G (le Caïd d'avant le Hummer), puis la fente posée dans caid.js
 c_silencieuse:{p:[{t:'rond',r:0.11,sx:1.6,sy:0.72,len:0.6,k:'a',ame:0,bague:0,bouche:0,jeu:.008,jonc:.01,pts:[[0,0.44,-2.535]]},{t:'rond',r:0.03,k:'c',len:0.1,lie:1,pts:[[0,0.44,-2.605]]}]}, // (2026-10-15, les pots encastrés « même les originales ») le silencieux remonte de 24 à 44 cm : son cul ovale dans une encoche du panneau arrière, l'embout devant lui (avant : il pendait dessous)
 d_samourai:{p:[{t:'rond',r:0.078,k:'b',kb:'v',ev:1.1,dbl:1,k2:'x',pts:[[0.42,0.28,-2.44]]}]},
 d_vette:{p:[{t:'rond',r:0.044,k:'c',dbl:1,pts:[[-0.24,0.3,-2.32],[-0.09,0.3,-2.32],[0.09,0.3,-2.32],[0.24,0.3,-2.32]]}]},
 e_anglaise:{p:[{t:'ovale',r:0.05,sx:1.9,sy:0.6,k:'c',dbl:1,pts:[[0.55,0.33,-2.44],[-0.55,0.33,-2.44]]}]},
 d_corbillard:{p:[{t:'reel',r:0.04,k:'s',kc:'f',len:0.3,pts:[[-0.56,0.38,-3.04]]}]}, // (2026-10-15) le pot réel, noir (le corbillard)
 a_chargeur69:{p:[{t:'rond',r:0.045,ev:1.4,k:'c',pts:[[0.32,0.3,-2.66],[-0.32,0.3,-2.66]]}]},
 b_canard:{p:[{t:'rond',r:0.05,k:'C',dbl:1,k2:'c',pts:[[-0.4,0.28,-2.13]]}]},
 e_aigle:{p:[{t:'rond',r:0.034,ev:1.18,k:'c',pts:[[0.36,0.28,-2.502],[0.46,0.28,-2.502],[-0.36,0.28,-2.502],[-0.46,0.28,-2.502]]}]},  // (2026-10-14, passe graphismes · pots) recalé sur la jupe reculée de Léo (rampe du dessous, tôle à z -2,452 au bord haut des bouches) : de -2,60 à -2,502, elles dépassent de 5 cm comme avant
 d_batmobile:{p:[{t:'rond',r:0.04,k:'C',bague:0,len:0.45,bout:'x',pts:[[-0.34,0.3,-2.435],[-0.44,0.3,-2.435]]}]},
 e_zed:{p:[{t:'rond',r:0.046,ev:1.28,k:'c',pts:[[0.38,0.28,-2.19]]}]},
 b_daytona:{p:[{t:'plaque',k:'s',w:0.27,h:0.1,x:0.32,y:0.35,z:-2.216},{t:'plaque',k:'s',w:0.27,h:0.1,x:-0.32,y:0.35,z:-2.216},{t:'rond',r:0.036,k:'c',dbl:1,pts:[[0.27,0.33,-2.31],[0.37,0.33,-2.31],[-0.27,0.33,-2.31],[-0.37,0.33,-2.31]]}]},  // (2026-10-14, passe graphismes · pots) recalé sur la poupe de Léo : le dessous remonte en rampe sous y 0,30 (la tôle y recule jusqu'à 25 cm) → écrin et bouches montés sur la face verticale (z -2,21), écrin collé à 0,4 cm
 c_taurine:{p:[{t:'rond',n:6,r:0.072,rz:0.5236,k:'a',dbl:1,k2:'C',pts:[[0.1,0.36,-2.26],[-0.1,0.36,-2.26]]}]},
 squale:{ote:[[0.285,0.285,-2.44,0.435,0.435,-2.2],[-0.435,0.285,-2.44,-0.285,0.435,-2.2],[0.477,0.285,-2.44,0.627,0.435,-2.2],[-0.627,0.285,-2.44,-0.477,0.435,-2.2]],p:[{t:'ouies',w:0.16,h:0.022,pas:0.05,k:'C',lueur:'g',pts:[[0.46,0.36,-2.408],[-0.46,0.36,-2.408]]}]},
 tuner:{vieux:1,p:[{t:'rond',r:0.105,ev:1.12,k:'c',dbl:1,k2:'C',lueur:'V',len:0.42,pts:[[0.42,0.33,-2.56]]}]},
 c_stratos:{p:[{t:'rond',r:0.056,k:'C',bague:0,len:0.45,bout:'x',pts:[[0.1,0.34,-2.097],[-0.1,0.34,-2.097]]}]},
 atchoum:{ote:[[0.33,0.21,-2.32,0.51,0.39,-1.9],[-0.51,0.21,-2.32,-0.33,0.39,-1.9],[0.9,0.22,-0.85,1.04,0.36,-0.27],[-1.04,0.22,-0.85,-0.9,0.36,-0.27]],p:[{t:'rond',r:0.056,ev:1.2,k:'x',kb:'x',lueur:'g',len:0.25,jeu:.008,jonc:.01,pts:[[0.97,0.47,-0.83,{ry:-1.5708}],[-0.97,0.47,-0.83,{ry:1.5708}]]}]}, // (2026-10-15, les pots encastrés « même les originales ») les sorties de stock-car sortent DROIT du flanc, devant la roue arrière, chacune dans son encoche ; `ote` retire le long tube que son gabarit faisait courir sous le bas de caisse (avant : un tube qui pendait dessous, l'embout en biais)
 origami:{p:[{t:'triangle',w:0.17,h:0.09,k:'a',lueur:'G',pts:[[0.52,0.47,-2.768],[-0.52,0.47,-2.768]]}]},
 rosso:{p:[{t:'rond',r:0.05,k:'C',dbl:1,k2:'c',pts:[[-0.15,0.4,-2.3],[0,0.4,-2.3],[0.15,0.4,-2.3]]}]},
 zagato:{p:[{t:'rond',r:.05,n:8,k:'C',dbl:1,k2:'k',bague:0,pts:[[.545,.35,-2.075],[.695,.35,-2.075],[-.545,.35,-2.075],[-.695,.35,-2.075]]}]}, // (2026-10-26, LA ZAGAIE figée « juste avant ») les QUATRE sorties d'origine de la 5-95, deux paires aux coins bas de la poupe (la ligne vit ICI : la liste des voitures ne lit que la table)
 abstraite:{p:[{t:'rond',r:0.05,k:'s',kb:'o',len:0.08,lueur:'Y',pts:[[0.22,0.36,-2.22],[-0.22,0.36,-2.22]]}]},
 iceberg:{p:[{t:'cristal',r:0.055,pts:[[0.11,0.31,-2.2681],[-0.11,0.31,-2.3239]]}]},
 e_murduson:{p:[{t:'turbine',r:0.11,n:10,k:'C',kp:'b',aubes:6,lueur:'g',force:1,pts:[[0.48,0.45,-3],[-0.48,0.45,-3]]},{t:'turbine',r:0.235,n:12,k:'C',kp:'b',aubes:0,force:1,pts:[[0.7,0.66,-0.8],[-0.7,0.66,-0.8]]}]},
 e_feline:{p:[{t:'reel',r:0.034,k:'c',len:0.5,pts:[[0.06,0.27,-2.465],[-0.06,0.27,-2.465]]}]},
 b_trone:{p:[{t:'plaque',k:'o',w:0.56,h:0.22,x:0,y:0.46,z:-2.226},{t:'ovale',r:0.065,sx:1.4,sy:0.85,k:'C',dbl:1,k2:'o',pts:[[0,0.46,-2.269]]}]},
 c_spectre:{p:[{t:'fente',w:0.56,h:0.05,k:'s',lueur:'V',pts:[[0,0.4,-2.262]]}]},
 poptart:{ote:[[0.4,0.15,-1.06,0.56,0.32,-0.92],[-0.56,0.15,-1.06,-0.4,0.32,-0.92]],p:[{t:'pixel',a:0.1,pts:[[0.48,0.235,-1.045],[-0.48,0.235,-1.045]]}]},
 d_chevalier:{p:[{t:'turbine',r:0.205,n:12,k:'C',kp:'a',aubes:0,pts:[[0,0.8,-2.46]]}]},
 e_dragon:{p:[{t:'gueule',r:0.06,k:'o',ev:1.1,crocs:6,kc:'w',lueur:'g',pts:[[0.46,0.4,-2.41],[-0.46,0.4,-2.41]]}]},
 b_pizza:{p:[{t:'reel',r:0.034,k:'c',rx:0.45,len:0.25,pts:[[0.36,0.24,-1.845]]}]},
 bulle:{enc:0,p:[{t:'rond',r:.022,ev:1.3,n:8,k:'c',len:.22,pts:[[.165,.335,-1.985],[-.165,.335,-1.985]]}]}, /* (2026-10-26, LE SCARABÉE en poly) les deux « sarbacanes » de la 1962, sous le pare-chocs, un peu derrière lui — `enc:0` : elles pendent sous la jupe, rien à percer */
 combi:{p:[{t:'reel',r:0.032,k:'C',len:0.42,pts:[[0.32,0.31,-2.42],[-0.32,0.31,-2.42]]}]},
 dolores:{p:[{t:'rect',w:0.12,h:0.05,k:'a',e:0.012,pts:[[0.38,0.3,-2.17],[-0.38,0.3,-2.17]]}]},
 d_puce:{p:[{t:'reel',r:0.026,k:'c',pts:[[-0.045,0.22,-1.55],[0.045,0.22,-1.55],[-0.045,0.3,-1.55],[0.045,0.3,-1.55]]}]},
 b_groupeb:{p:[{t:'rond',r:0.058,k:'C',bague:0,len:0.5,bout:'x',ry:-0.45,pts:[[0.6,0.26,-2.1572]]}]},
 c_hotrod:{p:[{t:'reel',r:.034,k:'C',len:.30,jeu:.006,jonc:.006,pts:[[.32,.29,-1.81],[-.32,.29,-1.81]]}]}, // (2026-10-19, LE HOT ROD v2) deux sorties sous la poupe (les collecteurs du V8 courent sous la caisse ; les cheminées sont parties)
 a_mastodonte:{ote:[[0.47,0.42,-2.43,0.67,1.27,-1.74],[-0.67,0.42,-2.43,-0.47,1.27,-1.74]],p:[{t:'cheminee',h:1.35,r:0.075,k:'c',pts:[[0.8,1.62,-0.46],[-0.8,1.62,-0.46]]}]},
 poster:{p:[{t:'rect',w:0.19,h:0.085,k:'c',e:0.014,cloison:1,pts:[[0.4,0.38,-2.15],[-0.4,0.38,-2.15]]}]},
 requin:{p:[{t:'rond',r:0.07,k:'s',kb:'C',dbl:1,k2:'n',lueur:'G',len:0.4,pts:[[0.44,0.43,-2.12],[-0.44,0.43,-2.12]]}]},
 proto:{p:[{t:'cloche',r:0.24,k:'C',kb:'b',lueur:'g',n:12,pts:[[0.54,0.55,-3.4],[-0.54,0.55,-3.4]]}]},
 e_raie:{p:[{t:'sidepipe',r:0.045,k:'c',kb:'a',pts:[[0.8905,0.3,0.8,-0.78],[-0.8905,0.3,0.8,-0.78]]}]},
 a_eternelle:{p:[{t:'rond',r:0.04,k:'b',kb:'x',dbl:1,k2:'x',pts:[[-0.23,0.47,-2.349],[-0.08,0.47,-2.349],[0.08,0.47,-2.349],[0.23,0.47,-2.349]]}]},
 nuage:{p:[{t:'nuage',r:0.075,pts:[[0.46,0.42,-2.43],[-0.46,0.42,-2.43]]}]},
 lingot:{p:[{t:'rect',w:0.11,h:0.11,k:'o',e:0.018,pts:[[0.46,0.42,-2.56],[-0.46,0.42,-2.56]]}]},
 poupee:{p:[{t:'rond',r:0.045,k:'c',dbl:1,pts:[[0.52,0.40,-2.485],[0.63,0.40,-2.485],[-0.52,0.40,-2.485],[-0.63,0.40,-2.485]]}]}, // (2026-10-16) LA POUPÉE : les quatre sorties de la Cayenne, deux paires aux coins du diffuseur
 perle:{p:[{t:'fente',w:0.30,h:0.035,k:'s',lueur:'G',pts:[[0.42,0.33,-2.495],[-0.42,0.33,-2.495]]}]}, // (2026-10-16) LA PERLE : électrique — pas de pots, deux fentes qui luisent bleu au bas du diffuseur
};
/* ---- FIN DES POTS D'ÉCHAPPEMENT ---- */
/* LES MATIÈRES. La couleur vient des SOMMETS ; la matière ne dit que comment la surface répond.
   ⚠ `uGlow` : une part de la couleur rendue SANS lumière — le jeu se joue de nuit (hemi .40,
   expo .71), et sans ce plancher un jaune sort moutarde et un bleu roi sort noir.
   ⚠ LE CHROME NE SE FAIT PAS AU REFLET PUR : le ciel du jeu est nuit violette ; à 80 % de reflet,
   pare-chocs et jantes sortent en plomb. Presque-blanc + 45 % de ciel + plancher lumineux.
   ⚠ SPÉCULAIRE DE LAQUE LARGE (shininess bas) : une facette est un plan parfait, et un point chaud
   serré l'allume en entier d'un coup quand la caisse tourne. */
/* (2026-09-26) `v` = LE VERNIS de chaque matière (voir ENV_VERNIS) : [de face, en rasant, dureté, métal]. La laque passe de
   24 % de ciel PARTOUT à ~7 % de face / ~60 % en rasant : la couleur revient, le reflet court sur les pans qui fuient.
   Le verre devient SOMBRE de face et miroir couché. Le chrome et l'or reflètent le ciel TEINTÉ de leur métal. */
/* (2026-09-26, vague 2 « L'ENCRE ET L'OR ») LA LAQUE REDEVIENT UNE COULEUR. Mesuré au pixel en vue de POURSUITE (la caméra est à ~4,6 m
   derrière et 3,6 m au-dessus : elle voit toit, malle et flancs en rasant) : à [.3,2.6] le vernis montait à 62 % de ciel lavande sur les
   pans qui fuient, et le vert de L'ÉTALON sortait #77ab98 à midi (#467155 à l'atelier) — la couleur signature perdue 95 % du temps.
   Désormais [.25,1.5,3,.2] : le reflet rasant plafonne à ~36 %, et il est TEINTÉ à 20 % par la laque (un bonbon, pas un miroir gris).
   Le plancher lumineux `gl` .13 → .06 : il relevait les ombres d'un voile uniforme — c'est lui qui aplatissait les volumes. La nuit, la
   caisse garde sa lampe de carrosserie (carLight) : elle reste lisible sans ce voile. */
const LP_MAT={p:{sh:44,sp:0x4a4a4a,rf:.24,gl:.06,v:[.25,1.5,3,.2]},   // LAQUE
              c:{sh:140,sp:0xffffff,rf:.45,gl:.16,v:[1.25,2,2,1]},   // CHROME
              o:{sh:120,sp:0xffd488,rf:.30,gl:.12,v:[1.5,2.8,2,1]},  // OR
              s:{sh:22, sp:0x333333,rf:0,  gl:.10}, // CUIR, TOILE, SATINÉ
              m:{sh:10, sp:0x1c1c1c,rf:0,  gl:0},   // MAT : pneus, grilles, plastiques
              // (2026-09-26, vague 2) spéculaire du verre 0xffffff/160 → 0x5c5c5c/260 : la lampe de carrosserie (3 m au-dessus) allumait sur
              // la lunette arrière une BOULE blanche qui passait au bloom — une vitre qui ÉMET. Le reflet du ciel (et l'éclat du soleil, peint
              // dans le cube) reste : c'est lui qui fait la vitre.
              g:{sh:260,sp:0x5c5c5c,rf:.55,gl:.04,v:[.15,1.3,3,.35]}, // VERRE et laqué noir (vernis teinté : le reflet s'assombrit d'un tiers, la vitre reste une vitre)
              k:{sh:90, sp:0x8a8a8a,rf:.34,gl:.07,v:[.6,1.8,2.4,1]},   // (2026-10-14, passe graphismes · palette) MÉTALLISÉ : plus de reflet de face qu'une laque, reflet TEINTÉ À 100 % par la couleur comme le chrome et l'or (à 55 %, le ciel blanc-bleu éclaircissait un BORDEAUX 6c0e1e en fd213b : plus aucune teinte profonde) — même programme que p/c/o/g
              n:{sh:70, sp:0xfff4fa,rf:.30,gl:.12,v:[.4,2.6,1.6,.1]},   // (2026-10-14, passe graphismes · palette) NACRE : un voile de ciel LARGE et doux en rasant (courbe 1,6), à peine teinté — même programme
              f:{sh:34, sp:0x5c5c5c,rf:.12,gl:.32}};// FRUITS : vernis + plancher lumineux haut (lisibles de nuit) — (2026-09-26) reflet adouci : les grosses taches BLANCHES mangeaient les fruits redessinés — (vernis : aucun, les fruits ne sont pas des caisses)
function lpMat(g,ar){ // `ar` : (2026-10-20, FINITION STUDIO) une matière de CAISSE en finition studio (reflets qui éclatent, arêtes à l'essai) — voir finition.js
  if(typeof g==='string'&&g.indexOf('pm:')===0){const m=lpMat('p');try{motGreffe(m,g.slice(3));}catch(e){console.warn('motif',e);}return m;} // (2026-10-16) LA TÔLE À MOTIF : la laque, et le motif par-dessus (voir MOTIFS)
  if(g==='l'){const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});m.userData.lp=1;return m;}
  const P=LP_MAT[g]||LP_MAT.m;
  const m=new THREE.MeshPhongMaterial({vertexColors:true,shininess:P.sh,specular:P.sp,side:THREE.DoubleSide});
  if(P.rf>0){m.envMap=envTex;m.reflectivity=P.rf;m.combine=THREE.MixOperation;}
  const uG={value:P.gl},uV={value:new THREE.Vector4().fromArray(P.v||[1,1,1,0])},uC={value:g==='f'?0:1}, // uC : le contre-jour du liseré (voir RIM_GLSL) — pas sur les fruits
        uF={value:g==='g'?1:g==='c'||g==='o'?.6:g==='k'||g==='n'?.3:g==='m'?.05:g==='f'?0:.2}; // (2026-10-17) la part du REFLET DES FEUX par famille (voir FEU_U)
  if(ar){m.userData.arete=1;m.customProgramCacheKey=function(){return 'finArete|'+this.onBeforeCompile.toString();};} // un programme à part : les meubles de l'atelier (lpMat aussi) ne le voient pas
  m.onBeforeCompile=function(sh){
    if(ar&&FSTU.aretes){sh.uniforms.uArK=FSTU.uArK;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+FSTU_V).replace('#include <begin_vertex>','#include <begin_vertex>\n'+FSTU_VM);}
    sh.uniforms.uGlow=uG;sh.uniforms.uRimC=RIM_U.uRimC;sh.uniforms.uRimStr=RIM_U.uRimStr;sh.uniforms.uRimPow=RIM_U.uRimPow;sh.uniforms.uSunV=RIM_U.uSunV;
    sh.uniforms.uVern=uV;sh.uniforms.uCj=uC;sh.uniforms.uFvA=FEU_U.uFvA;sh.uniforms.uFvB=FEU_U.uFvB;sh.uniforms.uFvC=FEU_U.uFvC;sh.uniforms.uFvK=uF;
    sh.fragmentShader=sh.fragmentShader
      .replace('#include <common>','#include <common>\nuniform float uGlow;uniform vec3 uRimC;uniform vec3 uSunV;uniform float uRimStr;uniform float uRimPow;uniform vec4 uVern;uniform float uCj;\n'+FEU_GLSL)
      .replace('#include <envmap_fragment>',ENV_VERNIS).replace('#include <lights_fragment_begin>',LFB_CAISSE) // (tour 2) les lampes éteintes sautent (voir LFB_CAISSE)
      .replace('#include <dithering_fragment>',RIM_GLSL('uCj')+ // le liseré, contre-jour compris (voir RIM_GLSL)
        'gl_FragColor.rgb+=uRimC*rimF*uRimStr*.6+vColor*uGlow;\n'+FEU_APPEL+'#include <dithering_fragment>'); // (2026-10-17) + la lueur des feux arrière (voir FEU_U)
    if(ar){sh.uniforms.uStuHdr=FSTU.uHdr;sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+FSTU_HDR).replace('envColor.xyz*mix(vec3(1.),diffuseColor.rgb,uVern.w)','fstuHdr(envColor.xyz)*mix(vec3(1.),diffuseColor.rgb,uVern.w)');
      if(FSTU.aretes)sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+FSTU_F).replace('#include <dithering_fragment>',FSTU_FM+'#include <dithering_fragment>');}
  };
  m.userData.lp=1;m.userData.g=g;m.userData.uG=uG;m.userData.uV=uV;return m; // `g` : la famille de matière (le banc des laques y reconnaît la tôle) · `uG` : le plancher lumineux (l'atelier le relève pour ses meubles)
}
