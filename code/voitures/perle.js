/* LA PERLE (2026-10-16 ; ex-L'ONYX noire). Léo : « Taycan 4S », « blanche, laquée comme une vraie », « lissée », « tous les traits du plan ».
   (2026-10-26, 2e onglet « FIDÈLE ET PROPRE ») Léo, devant la 1re version poly : « tu m'as mélangé deux ou trois voitures différentes ». Refaite
   À LA MAIN, en poly, au niveau de la Rosso 40 et de La Honte : UNE voiture, la Taycan, rien d'autre. Les cotes viennent du plan coté de
   l'ancienne Perle (largeurs, toit, ceinture, vitres, pare-brise, lunette) ; la forme en est un loft de grands pans plans ; les détails sont
   POSÉS sur la tôle (projetés sur elle, à fleur, en pièces plates). Repère : x à droite, y en haut, z vers l'avant, mètres. */
SHAPES.perle=function(K){
  const U=LPU,L=(t,z)=>U.lin(t,z),mix=(a,b,t)=>a+(b-a)*t;
  const R=.364,ZF=1.484,ZR=-1.439,ZE=2.48,ZB=-2.475,AP=-2.30,RW=-2.063,ZT=.30,ZA=.86,CW=1.171,AV=2.25;
  const PAL={p:{g:'p',c:0xf3f3f1},k:{g:'m',c:0x141317},K:{g:'g',c:0x0b0b0e},g:{g:'g',c:0x16202c},c:{g:'c',c:0xd2d6dc},
    s:{g:'s',c:0x2a2b30},e:{g:'s',c:0xd31f2a},W:{g:'l',c:0xf4f7ff},L:{g:'l',c:0xff1a3a},r:{g:'l',c:0x8a0c22},O:{g:'l',c:0xffa21a}};
  const F=SHAPES.perle;
  if(!F._coque){
    /* ---- LES COTES (le plan coté de l'ancienne Perle, ramené aux seules coupes du loft) ---- */
    const XM=[[AP,.81],[-2.2,.875],[-2.1,.925],[-2.0,.96],[-1.9,.985],[-1.8,.998],[-1.6,1.003],[-1.3,.998],[-1.1,.988],[-.95,.975],[-.75,.963],[-.5,.957],
              [.9,.957],[1.05,.975],[1.25,.984],[1.85,.982],[1.95,.972],[2.05,.94],[2.15,.89],[AV,.81]],
          YB0=[[AP,.23],[-2.0,.20],[-1.1,.165],[1.1,.16],[1.9,.15],[AV,.17]],
          AR=[[0,.805],[.18,.785],[.30,.715],[.37,.60],[.42,.42],[.45,.20],[.46,0]],          // le passage de roue, serré sur le pneu
          YC=[[AP,.955],[-2.2,.972],[RW,1.0],[-1.955,1.044],[-1.75,1.119],[-1.543,1.186],[-1.334,1.246],[-1.122,1.297],[-.907,1.333],[-.691,1.36],
              [-.474,1.375],[-.256,1.38],[-.039,1.375],[.178,1.355],[.389,1.303],[.524,1.249],[.654,1.185],[.782,1.117],[.909,1.046],[1.034,.973],
              [CW,.937],[1.42,.905],[1.8,.83],[2.05,.75],[AV,.665]],                           // le profil au milieu : malle, lunette, toit, pare-brise, capot
          Y5=[[AP,.90],[-2.1,.95],[-1.9,.972],[-1.66,.99],[-1.44,.995],[-1.23,.988],[-1.06,.965],[-.85,.86],[-.65,.815],[-.3,.805],[.4,.80],[1.0,.787],
              [1.15,.775],[1.3,.79],[1.6,.80],[1.9,.78],[2.1,.72],[AV,.67]],                    // l'ÉPAULE : la hanche arrière, puis le pli des portes
          // la CEINTURE (le haut de la hanche à l'arrière, le bas des vitres, puis la crête de l'aile avant)
          Y6=[[AP,.955],[-2.2,.97],[RW,.99],[-1.95,.995],[-1.6,1.0],[-1.30,1.0],[-1.10,1.0],[-.95,.99],[-.647,.975],[-.282,.962],[.084,.950],[.45,.942],
              [.62,.945],[.86,.950],[1.06,.955],[1.46,.93],[1.75,.895],[1.89,.865],[2.02,.82],[2.16,.765],[AV,.715]],
          X6=[[AP,.70],[-2.1,.74],[-1.9,.76],[-1.6,.765],[-1.3,.77],[-1.1,.78],[-.9,.80],[-.5,.815],[.45,.825],[.86,.835],[1.06,.85],[1.6,.85],[2.0,.80],[AV,.72]],
          // le BAS DES VITRES (la custode pointue derrière, la portière, la pointe avant)
          Y7=[[-1.95,1.004],[-1.6,1.032],[-1.277,1.069],[-1.20,1.043],[-1.10,1.029],[-.97,1.012],[-.623,.99],[.031,.958],[.45,.946],[.62,.948]],
          X7=[[-1.95,.70],[-1.6,.71],[-1.277,.70],[-1.15,.722],[-.88,.762],[-.34,.80],[.07,.81],[.45,.818],[.62,.825]],
          // le HAUT DES VITRES (et, devant, le montant de pare-brise vu de l'extérieur)
          Y8=[[-1.95,1.004],[-1.6,1.10],[-1.277,1.069],[-1.213,1.127],[-1.078,1.173],[-.949,1.207],[-.789,1.24],[-.647,1.261],[-.495,1.276],[-.311,1.285],
              [-.178,1.286],[-.076,1.279],[.025,1.266],[.116,1.248],[.194,1.225],[.251,1.202],[.324,1.166],[.404,1.12],[.544,1.036],[.62,1.02]],
          X8=[[-1.95,.68],[-1.6,.66],[-1.277,.69],[-1.25,.666],[-1.2,.661],[-1.046,.65],[-.841,.643],[-.534,.644],[-.186,.654],[-.043,.66],[.12,.676],[.24,.698],[.449,.75],[.62,.79]],
          // le BORD DU PAVILLON vitré : la lunette, la gouttière du toit, le montant A, la base du pare-brise (vue de dessus)
          X9=[[RW,0],[-2.057,.17],[-2.048,.234],[-2.032,.304],[-2.01,.372],[-1.99,.419],[-1.96,.46],[-1.93,.489],[-1.90,.50],[-1.87,.509],[-1.74,.522],
              [-1.27,.548],[-1.222,.524],[-.853,.53],[-.4335,.5446],[-.0347,.5679],[ZT,.595],[ZA,.79],[.893,.776],[.925,.75],[.954,.72],[.98,.69],
              [1.012,.649],[1.039,.605],[1.067,.55],[1.088,.504],[1.109,.446],[1.124,.397],[1.149,.287],[1.165,.165],[CW,0]],
          Y9=[[RW,1.0],[-1.943,1.004],[-1.8165,1.045],[-1.2509,1.2205],[-1.2324,1.24],[-.98,1.29],[-.75,1.327],[-.57,1.344],[-.39,1.353],[-.18,1.3525],
              [.01,1.34],[.17,1.315],[ZT,1.28],[ZA,.94],[CW,.937]];
    const yC=z=>L(YC,z),xm=z=>L(XM,z);
    // la section (demi-coupe, du bas-milieu au haut-milieu, 12 points) ENTRE les deux bouts
    const corps=z=>{
      const x=xm(z),yb=U.arch(z,[ZF,ZR],AR,L(YB0,z)),c=yC(z);
      const s=[[0,yb],[x-.13,yb],[x-.055,L(YB0,z)+.05],[x-.018,.33],[x,.585],[x-.02,L(Y5,z)]];
      let p6=[L(X6,z),L(Y6,z)],p7,p8,p9=[L(X9,z),L(Y9,z)];
      if(z<RW){                                                         // LA MALLE : courte, plate, la lèvre du becquet au bout
        p7=[mix(p6[0],0,.18),p6[1]+.012];p8=[mix(p6[0],0,.40),mix(p6[1],c,.6)];p9=[mix(p6[0],0,.62),mix(p6[1],c,.85)];}
      else if(z<-1.95){                                                 // le pied de la lunette
        p7=[mix(p6[0],p9[0],.35),mix(p6[1],p9[1],.4)];p8=[mix(p6[0],p9[0],.7),mix(p6[1],p9[1],.75)];}
      else if(z<=.62){p7=[L(X7,z),L(Y7,z)];p8=[L(X8,z),L(Y8,z)];}      // LES VITRES de côté
      else if(z<=ZA){const q=[p9[0]+.035,p9[1]-.015];p7=[mix(p6[0],q[0],.5),mix(p6[1],q[1],.5)];p8=q;}   // l'aile qui monte au montant A
      else if(z<=CW){p8=[mix(p6[0],p9[0],.55),mix(p6[1],p9[1],.6)];p7=[mix(p6[0],p8[0],.5),mix(p6[1],p8[1],.5)];}  // l'auvent : la base du pare-brise
      else{                                                             // LE CAPOT, plus bas que les deux ailes
        const xh=L([[CW,.74],[1.6,.70],[2.0,.60],[AV,.50]],z);
        p7=[p6[0]-.07,p6[1]-.02];p8=[xh,c-.014];p9=[xh*.6,c-.004];}
      s.push(p6,p7,p8,p9);
      // (Léo, 26/10 : « rends plus lisse la vitre ») le PARE-BRISE et la LUNETTE en pans PLANS : leur ligne du milieu droite, un panneau central
      // plat entre deux plis droits, deux pans de côté — plus d'éventail. Les coupes du bord (montant, base, toit) ne bougent pas : la tôle reste la même.
      const q=s[s.length-1],VA=z>ZT-1e-9&&z<CW,VR=z>RW&&z<-1.26;
      // (le pan de côté du pare-brise est PLAN : le plan qui porte le montant A — une droite au plan — et le pli au pied, à 60 cm de l'axe ;
      // le pli suit l'intersection de ce plan et du panneau central)
      const plA=(z9,y9)=>{const A0=[L(X9,ZT),L(Y9,ZT),ZT],A1=[L(X9,ZA),L(Y9,ZA),ZA],F1=[.60,mix(yC(ZT),yC(CW),(1.10-ZT)/(CW-ZT)),1.10],
          u9=[A1[0]-A0[0],A1[1]-A0[1],A1[2]-A0[2]],v9=[F1[0]-A0[0],F1[1]-A0[1],F1[2]-A0[2]],
          n9=[u9[1]*v9[2]-u9[2]*v9[1],u9[2]*v9[0]-u9[0]*v9[2],u9[0]*v9[1]-u9[1]*v9[0]];
        return A0[0]-(n9[1]*(y9-A0[1])+n9[2]*(z9-A0[2]))/n9[0];};
      if(VA||VR){const yl=VA?mix(yC(ZT),yC(CW),(z-ZT)/(CW-ZT)):mix(yC(RW),yC(ZR+.18),(z-RW)/(ZR+.18-RW)),
          xp=Math.min(q[0],VA?plA(z,yl):mix(.34,.37,(z+1.95)/.70));
        s.push([xp,yl],[0,yl]);}
      else s.push([q[0]*.48,mix(q[1],c,.82)],[0,c]);
      for(let i=2;i<=5;i++)s[i][1]=Math.max(s[i][1],yb+.025*(i-1));     // l'aile passe AU-DESSUS du passage de roue
      for(let i=1;i<s.length;i++)s[i][1]=Math.max(s[i][1],s[i-1][1]+(i<=5?.002:0));
      return s;};
    // le NEZ et la POUPE : la section du bout rétrécie (vue de dessus) et rognée (vue de côté)
    const NEZ={z:[AV,2.33,2.40,2.44,2.465,ZE],x:[1,.86,.70,.53,.37,.17],t:[.715,.645,.59,.55,.51,.47],b:[.17,.178,.196,.26,.35,.43]},
          POU={z:[ZB,-2.455,-2.43,-2.40,-2.36,-2.32,AP],x:[.57,.70,.80,.865,.925,.975,1],t:[.56,.60,.63,.70,.80,.93,.955],b:[.47,.40,.33,.29,.26,.24,.23]};
    const bout=(E,z)=>{const s=corps(E===NEZ?AV:AP),T=a=>L(E.z.map((v,i)=>[v,a[i]]),z),kx=T(E.x),t=T(E.t),b=T(E.b);
      return s.map(p=>[p[0]*kx,Math.min(t,Math.max(b,p[1]))]);};
    const S=z=>z>AV?bout(NEZ,z):z<AP?bout(POU,z):corps(z);
    const zs0=[ZB,-2.455,-2.43,-2.40,-2.36,-2.32,AP,-2.2,-2.12,RW,-2.0,-1.95,-1.80,-1.277,-1.20,-1.10,-.95,-.75,-.45,-.15,.15,ZT,.45,.544,.62,.75,ZA,1.0,CW,
               1.30,1.75,1.95,2.10,AV,2.33,2.40,2.44,2.465,ZE];
    for(const w of [ZF,ZR]){zs0.push(w);for(const d of [.18,.30,.37,.42,.45])zs0.push(w-d,w+d);}
    zs0.sort((a,b)=>a-b);const zs=zs0.filter((z,i)=>i===0||z-zs0[i-1]>.006);
    /* ---- LA PEINTURE DES PANS ---- j : 0 dessous · 1 bas de caisse · 2 seuil · 3-5 flanc · 6 sous la vitre · 7 vitre · 8 montant/rive · 9-10 pavillon */
    const peint=(j,z,y)=>{
      if(j<=1)return 'k';
      if(j===2)return (z>ZR+.45&&z<ZF-.45)?'k':(y<.30?'k':'p');
      if(j<=4&&z>2.36&&y<.30)return 'k';                                 // la lame avant
      if(j<=4&&z<-2.38)return 'k';                                       // le bas du bouclier arrière, noir (le diffuseur)
      if(j===7&&z>-1.277&&z<.544)return 'g';                             // les vitres de côté
      if(j>=9&&z>RW&&z<-1.25)return 'g';                                 // la lunette
      if(j>=9&&z>ZT&&z<CW)return 'g';                                    // le pare-brise
      return 'p';};
    const sh=[],T=(k,a,b,c)=>sh.push([k,a,b,c]);
    {const sec=zs.map(S),N=sec[0].length;
      for(let i=0;i<zs.length-1;i++){const z0=zs[i],z1=zs[i+1],A=sec[i],C=sec[i+1];
        for(let j=0;j<N-1;j++){const a=A[j],b=A[j+1],c=C[j+1],d=C[j],k=peint(j,(z0+z1)/2,(a[1]+b[1]+c[1]+d[1])/4);
          T(k,[a[0],a[1],z0],[b[0],b[1],z0],[c[0],c[1],z1]);T(k,[a[0],a[1],z0],[c[0],c[1],z1],[d[0],d[1],z1]);
          T(k,[-a[0],a[1],z0],[-c[0],c[1],z1],[-b[0],b[1],z0]);T(k,[-a[0],a[1],z0],[-d[0],d[1],z1],[-c[0],c[1],z1]);}}
      for(const [s9,z,dir] of [[sec[0],zs[0],-1],[sec[sec.length-1],zs[zs.length-1],1]]){
        const ct=[];for(let j=0;j<N;j++)ct.push(new THREE.Vector2(s9[j][0],s9[j][1]));for(let j=N-2;j>=1;j--)ct.push(new THREE.Vector2(-s9[j][0],s9[j][1]));
        for(const f of THREE.ShapeUtils.triangulateShape(ct,[])){let a=ct[f[0]],b=ct[f[1]],c=ct[f[2]];
          if((((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))>0)!==(dir>0)){const t=b;b=c;c=t;}
          T((a.y+b.y+c.y)/3<.40?'k':'p',[a.x,a.y,z],[b.x,b.y,z],[c.x,c.y,z]);}}}
    /* ---- POSER À FLEUR : un rayon trouve la tôle, la pièce s'y couche (sa normale), épaisse de quelques millimètres ---- */
    const nb=sh.length,pos=new Float32Array(nb*9);for(let i=0;i<nb;i++){const t=sh[i];for(let v=0;v<3;v++)for(let a=0;a<3;a++)pos[i*9+v*3+a]=t[v+1][a];}
    const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const ME=new THREE.Mesh(G,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})),RC=new THREE.Raycaster(),O=new THREE.Vector3(),D=new THREE.Vector3();
    const nrm=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];},cro=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
          dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],ad=(a,b,s)=>[a[0]+b[0]*s,a[1]+b[1]*s,a[2]+b[2]*s];
    const tire=(o,d)=>{O.set(o[0],o[1],o[2]);D.set(d[0],d[1],d[2]).normalize();RC.set(O,D);const h=RC.intersectObject(ME,false)[0];if(!h)return null;
      const n=h.face.normal.clone();if(n.dot(D)>0)n.negate();return {p:[h.point.x,h.point.y,h.point.z],n:[n.x,n.y,n.z]};};
    // une PIÈCE PLATE : un contour (points 3D approchés) projeté le long de `d`, levé de `e` ; posée des deux côtés si `sym`
    const pose=(k,pts,d,e,sym)=>{for(const sd of (sym?[1,-1]:[1])){
      const P9=pts.map(p=>[p[0]*sd,p[1],p[2]]),d9=nrm([d[0]*sd,d[1],d[2]]),u=nrm(cro(d9,Math.abs(d9[1])<.9?[0,1,0]:[1,0,0])),v=cro(u,d9);
      const H=P9.map(p=>tire(ad(p,d9,-2),d9));if(H.some(q=>!q)){console.warn('perle : pièce hors tôle',k,JSON.stringify(pts[0]));continue;}
      if(F._dbg)F._dbg.push([k,H.map(q=>q.p.map(v=>+v.toFixed(3)))]);
      const top=H.map(q=>ad(q.p,q.n,e)),bas=H.map(q=>ad(q.p,q.n,-.003)),n=P9.length;
      for(const f of THREE.ShapeUtils.triangulateShape(P9.map(p=>new THREE.Vector2(dot(p,u),dot(p,v))),[]))T(k,top[f[0]],top[f[1]],top[f[2]]);
      for(let i=0;i<n;i++){const j=(i+1)%n;T(k,bas[i],bas[j],top[j]);T(k,bas[i],top[j],top[i]);}}};
    /* une PLAQUE : le contour projeté sur la tôle, puis un dessus PLAN (le plan moyen des points touchés, levé juste au-dessus de la tôle
       la plus haute qu'il couvre) et des flancs qui redescendent dans la tôle — une pièce posée, nette, sans facettes qui se battent.
       `sub` : des pièces sur la plaque [clé, contour, hauteur au-dessus de son dessus]. */
    const plaque=(k,pts,d,e,sym,sub)=>{for(const sd of (sym?[1,-1]:[1])){
      const M9=p=>[p[0]*sd,p[1],p[2]],P9=pts.map(M9),d9=nrm([d[0]*sd,d[1],d[2]]),u=nrm(cro(d9,Math.abs(d9[1])<.9?[0,1,0]:[1,0,0])),v=cro(u,d9);
      const H=P9.map(p=>tire(ad(p,d9,-2),d9));if(H.some(q=>!q)){console.warn('perle : pièce hors tôle',k,JSON.stringify(pts[0]));continue;}
      const Q2=P9.map(p=>[dot(p,u),dot(p,v)]),dn=dot(P9[0],d9)-2,dans=(x,y)=>{let c=false;for(let i=0,j=Q2.length-1;i<Q2.length;j=i++){const a=Q2[i],b=Q2[j];
        if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
      let n=[0,0,0],c=[0,0,0];for(const q of H){n=ad(n,q.n,1);c=ad(c,q.p,1/H.length);}n=nrm(n);
      const smp=H.slice();let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const q of Q2){u0=Math.min(u0,q[0]);u1=Math.max(u1,q[0]);v0=Math.min(v0,q[1]);v1=Math.max(v1,q[1]);}
      for(let i=1;i<8;i++)for(let j=1;j<8;j++){const x=u0+(u1-u0)*i/8,y=v0+(v1-v0)*j/8;if(!dans(x,y))continue;const h=tire(ad(ad(ad([0,0,0],u,x),v,y),d9,dn),d9);if(h)smp.push(h);}
      let hm=-1e9;for(const q of smp)hm=Math.max(hm,dot([q.p[0]-c[0],q.p[1]-c[1],q.p[2]-c[2]],n));
      const dd=dot(d9,n),plan=(p,x)=>{const t=(hm+e+x-dot([p[0]-c[0],p[1]-c[1],p[2]-c[2]],n))/dd;return ad(p,d9,t);},
            vers=(q2,x)=>plan(ad(ad(ad([0,0,0],u,q2[0]),v,q2[1]),d9,dn),x);   // un point du dessin (u, v) sur le dessus, levé de x
      const top=Q2.map(q=>vers(q,0)),bas=H.map(q=>ad(q.p,q.n,-.004)),N9=P9.length;
      for(const f of THREE.ShapeUtils.triangulateShape(Q2.map(q=>new THREE.Vector2(q[0],q[1])),[]))T(k,top[f[0]],top[f[1]],top[f[2]]);
      for(let i=0;i<N9;i++){const j=(i+1)%N9;T(k,bas[i],bas[j],top[j]);T(k,bas[i],top[j],top[i]);}
      for(const s9 of (sub||[])){const R2=s9[1].map(M9).map(p=>[dot(p,u),dot(p,v)]),a=R2.map(q=>vers(q,s9[2])),b=R2.map(q=>vers(q,-.002)),m=R2.length;
        for(const f of THREE.ShapeUtils.triangulateShape(R2.map(q=>new THREE.Vector2(q[0],q[1])),[]))T(s9[0],a[f[0]],a[f[1]],a[f[2]]);
        for(let i=0;i<m;i++){const j=(i+1)%m;T(s9[0],b[i],b[j],a[j]);T(s9[0],b[i],a[j],a[i]);}}}};
    // un RUBAN : deux bords relevés point par point (rayons), levé de `e`
    const ruban=(k,A,B,e)=>{const a=A.map(q=>ad(q.p,q.n,e)),b=B.map(q=>ad(q.p,q.n,e)),a0=A.map(q=>ad(q.p,q.n,-.003)),b0=B.map(q=>ad(q.p,q.n,-.003)),n=a.length;
      for(let i=0;i<n-1;i++){T(k,a[i],b[i],b[i+1]);T(k,a[i],b[i+1],a[i+1]);T(k,a0[i],a0[i+1],a[i+1]);T(k,a0[i],a[i+1],a[i]);T(k,b0[i],b[i+1],b0[i+1]);T(k,b0[i],b[i],b[i+1]);}
      for(const i of [0,n-1]){T(k,a0[i],b0[i],b[i]);T(k,a0[i],b[i],a[i]);}};
    // une ceinture à une hauteur, tirée de l'intérieur en éventail (θ = 0 : dans l'axe, vers l'arrière si s = −1, vers l'avant si s = 1)
    const anneau=(y,t0,t1,n,zc,s)=>{const o=[];for(let i=0;i<=n;i++){const t=(t0+(t1-t0)*i/n)*Math.PI/180,h=tire([0,y,zc],[Math.sin(t),0,s*Math.cos(t)]);if(h){h.n=h.n.map(v=>-v);o.push(h);}}return o;};   // (tiré du dedans : la normale ressort)
    const bande=(k,y0,y1,t0,t1,n,zc,e,s)=>{const A=anneau(y1,t0,t1,n,zc,s||-1),B=anneau(y0,t0,t1,n,zc,s||-1);if(A.length!==B.length||A.length<2)return console.warn('perle : bande',k);
      const M=q=>({p:[-q.p[0],q.p[1],q.p[2]],n:[-q.n[0],q.n[1],q.n[2]]});ruban(k,A,B,e);if(t0>0||true)ruban(k,A.map(M),B.map(M),e);};
    /* ---- LE NEZ : les phares (le verre fumé en goutte, les QUATRE POINTS, l'optique, le sourcil lumineux), le rideau d'air, la bouche ---- */
    const DF=[-.25,-.12,-1],fz=(x,y)=>[x,y,2.34-.36*(x-.53)-1.2*(y-.64)];   // on regarde le coin avant droit de face ; fz : la tôle, à peu près
    const LED=(x,y)=>[fz(x-.032,y-.009),fz(x+.032,y-.004),fz(x+.032,y+.009),fz(x-.032,y+.004)];
    plaque('K',[[.53,.635],[.63,.648],[.83,.655],[.90,.70],[.895,.77],[.85,.795],[.66,.787],[.59,.72]].map(q=>fz(q[0],q[1])),DF,.004,1,
      [['W',LED(.675,.745),.004],['W',LED(.845,.762),.004],['W',LED(.672,.680),.004],['W',LED(.835,.688),.004],
       ['c',[[.742,.703],[.778,.703],[.788,.718],[.776,.734],[.744,.734],[.732,.718]].map(q=>fz(q[0],q[1])),.003],
       ['W',[[.64,.780],[.84,.787],[.835,.793],[.645,.787]].map(q=>fz(q[0],q[1])),.003]]);
    plaque('k',[[.825,.40],[.865,.395],[.905,.50],[.912,.62],[.90,.655],[.865,.65],[.845,.53]].map(q=>fz(q[0],q[1])),DF,.003,1);   // le rideau d'air
    bande('k',.24,.37,0,46,9,1.9,.004,1);                                // la bouche, d'un coin à l'autre
    bande('s',.297,.313,0,40,8,1.9,.009,1);                              // sa lame
    /* ---- LE FLANC : l'ouïe derrière la roue avant, les poignées affleurantes ---- */
    plaque('k',[[1.6,.69,1.00],[1.6,.69,1.13],[1.6,.745,1.19],[1.6,.80,1.17],[1.6,.80,1.00]],[-1,0,0],.003,1);
    for(const z of [.04,-1.00])plaque('K',[[1.6,.815,z-.11],[1.6,.815,z+.11],[1.6,.833,z+.11],[1.6,.833,z-.11]],[-1,0,0],.004,1);
    /* ---- LA POUPE : la bande noire pleine largeur, le trait rouge, les feux aux coins ; la plaque, le diffuseur ---- */
    bande('K',.815,.915,0,78,13,-1.85,.006);
    bande('L',.882,.898,0,78,13,-1.85,.011);
    bande('L',.838,.892,52,78,4,-1.85,.012);
    plaque('s',[[-.24,.47,-2.6],[.24,.47,-2.6],[.24,.59,-2.6],[-.24,.59,-2.6]],[0,0,1],.004,0);
    F._coque=sh;
  }
  const P=K.kit(PAL);for(const t of F._coque)P.tri(t[0],t[1],t[2],t[3]);
  // les PIÈCES POSÉES en volume : rétroviseurs, étriers, joues des passages de roue
  P.sym(sd=>{
    P.prism('p',[[.46,.955],[.67,.955],[.70,.99],[.68,1.06],[.50,1.07],[.45,1.02]],.20,sd*.985);          // la coque du rétroviseur
    P.prism('k',[[.47,.95],[.66,.95],[.67,.965],[.47,.965]],.20,sd*.985);
    P.prism('k',[[.50,.94],[.62,.94],[.60,.99],[.52,.99]],.14,sd*.88);                                      // son pied
    for(const w of [ZF,ZR]){const ph=2.55,rr=.19;P.box('e',.06,.075,w>0?.20:.16,sd*.8525,R+Math.sin(ph)*rr,w+Math.cos(ph)*rr,Math.PI/2-ph,0,0);
      P.prism('k',[[w-.45,.17],[w-.42,.42],[w-.37,.60],[w-.30,.715],[w-.18,.785],[w,.805],[w+.18,.785],[w+.30,.715],[w+.37,.60],[w+.42,.42],[w+.45,.17]],.02,sd*.66);}
  });
  K.commit(P);
  // LA LAQUE BLANCHE : un point chaud large, un voile de ciel doux de face, franc en rasant, non teinté
  {const mP=K.mats&&K.mats.p;if(mP){mP.shininess=90;mP.specular.setHex(0x8a8a8a);mP.reflectivity=.45;
    if(mP.userData.uG)mP.userData.uG.value=.05;if(mP.userData.uV)mP.userData.uV.value.set(.16,1.15,3,0);}}
  // ---- LA JANTE AÉRO : cinq branches larges, le moyeu ; le pneu bas ----
  const JW=.285,hw=JW/2,fx=hw-.035,RJ=.272,J=lpKit({k:{g:'m',c:0x16171a},c:{g:'c',c:0xd9dde3},d:{g:'m',c:0x101114},s:{g:'s',c:0x3a3b40}});
  J.lathe('k',[[RJ,-hw],[R*.92,-hw],[R,-hw*.6],[R,hw*.6],[R*.92,hw],[RJ,hw]],16,0,0,0,'x');
  J.lathe('d',[[RJ,-hw+.02],[RJ,fx-.01],[0,fx-.01]],16,0,0,0,'x');
  J.lathe('s',[[.20,fx-.06],[.10,fx-.06]],16,0,0,0,'x');
  J.lathe('c',[[RJ,fx],[RJ-.022,fx+.004]],16,0,0,0,'x');
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2,pt=(r,t)=>[fx+.006,Math.sin(a+t)*r,Math.cos(a+t)*r];
    J.tri('c',pt(.06,-.30),pt(RJ-.02,-.24),pt(RJ-.02,.24));J.tri('c',pt(.06,-.30),pt(RJ-.02,.24),pt(.06,.30));}
  J.cyl('c',.07,.02,8,fx+.008,0,0,'x');
  const JG=J.done();
  return {hl:[.75,.71,2.24],tl:[.80,.86,-2.34],wx:.83,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xd9dde3}};
};
// (2026-10-26) la préchauffe du menu (`chauffeDivers`) appelait la projection des traits du plan : la Perle poly n'en a plus besoin.
function perleTraits(){}
