// <<< fin SHAPES.robin (RONDES) >>>
// <<< SHAPES.b_canard (RONDES) >>>
SHAPES.b_canard=function(K){
  /* LA QUEUE DE CANARD — la 911 Carrera RS 2.7 de 1973, REFAITE À LA MAIN EN POLY (2026-10-26, « la plus belle voiture poly que tu
     puisses faire, au niveau de LA ROSSO 40 et de LA HONTE »). L'ancienne (tôle découpée au plan, 11 000 triangles) se perdait dans ses
     facettes : du bruit, des triangles noirs sur le capot, des phares qui flottaient. Celle-ci se lit en trois traits, comme une affiche :
     · LE PROFIL D'UNE GOUTTE — le pavillon qui tombe d'un seul jet du pare-brise jusqu'à la queue, et la QUEUE DE CANARD qui le relève
       au bout : une lèvre posée sur le capot moteur, ses deux bouts roulés jusqu'aux ailes (de dos, c'est LA signature) ;
     · LA GRENOUILLE — les ailes avant qui dominent le capot, chacune portant son PHARE ROND en dôme, penché comme sur la vraie ;
     · LES HANCHES — les ailes arrière qui gonflent au-dessus des roues (1,66 m), la bande BLEUE de bas de caisse posée comme une longue
       plaque d'une roue à l'autre, les Fuchs à cinq pétales polis sur fond bleu.
     LA COQUE : un loft de 13 points par demi-section, tiré de CLÉS (une section dessinée à la main par station, interpolée entre elles) —
     chaque facette a sa raison d'être : dessous noir, bas de caisse, filet blanc, bande bleue, flanc, épaule, crête d'aile / ceinture, vitre,
     gouttière, toit. Les vitres sont des pans PLANS (rangs parallèles d'une clé à l'autre : pas de pli dans le verre).
     Les passages de roue relèvent le bas des sections (un demi-octogone). Tout le reste est POSÉ : pare-chocs à jonc noir, phares, feux,
     la lèvre, sa grille, le rétro de course, les poignées. Repère : x à gauche (conducteur, +X), y en haut, z vers l'avant. */
  const U=LPU,R=.32,ZF=1.18,ZR=-1.09;
  const PAL={p:{g:'p',c:0xaca595},b:{g:'p',c:0x1440a8,f:0},k:{g:'m',c:0x141518},K:{g:'g',c:0x0c0e12},g:{g:'g',c:0x1c2733},
    c:{g:'c',c:0xe9ecf0},C:{g:'c',c:0x8a9098},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xd0182a},r:{g:'l',c:0x7a0c16},O:{g:'l',c:0xffa21a},o:{g:'c',c:0xd9b45a},w:{g:'l',c:0xd9dce0}};
  /* ---- LES CLÉS DE LA COQUE : z → 12 points [x,y], du bas (axe) au faîte (axe) — `sect` en fait 13 (le filet blanc, plus bas) ----
     0 axe du dessous · 1 bord du dessous · 2 l'arête du bas de caisse · 3 le bas du flanc · 4 la plus grande largeur · 5 haut du flanc ·
     6 l'épaule · 7 la CRÊTE de l'aile (avant) / le bas de la vitre (habitacle) / le haut de la hanche (arrière) · 8 le haut de la vitre /
     le pied du montant · 9 le bord du toit, du capot, du pare-brise, de la lunette · 10 le bombé · 11 l'axe du dessus */
  const CLE=[
    [-2.00,[[0,.33],[.52,.33],[.62,.35],[.665,.41],[.69,.49],[.685,.58],[.655,.665],[.585,.725],[.50,.775],[.42,.83],[.21,.855],[0,.86]]],
    [-1.92,[[0,.30],[.58,.30],[.70,.33],[.745,.41],[.765,.50],[.755,.61],[.72,.705],[.635,.77],[.54,.815],[.44,.86],[.22,.878],[0,.882]]],
    [-1.75,[[0,.27],[.62,.27],[.75,.30],[.785,.40],[.80,.52],[.79,.655],[.755,.765],[.67,.83],[.565,.85],[.452,.885],[.23,.902],[0,.906]]],
    [-1.28,[[0,.25],[.64,.25],[.76,.28],[.79,.40],[.795,.53],[.79,.69],[.755,.80],[.69,.86],[.59,.885],[.459,.9604],[.241,1.0004],[0,1.005]]],   // le pied de la lunette
    [-0.97,[[0,.25],[.64,.25],[.76,.28],[.79,.40],[.795,.53],[.79,.695],[.755,.802],[.685,.895],[.625,.93],[.4695,1.0802],[.2515,1.1202],[0,1.125]]],   // (la lunette : ses rangs restent PARALLÈLES d'une clé à l'autre — chaque pan est plan, pas de damier dans le verre)
    [-0.75,[[0,.25],[.64,.25],[.76,.28],[.79,.40],[.795,.53],[.79,.70],[.755,.805],[.68,.925],[.638,.958],[.477,1.1652],[.259,1.2052],[0,1.2102]]],   // la pointe de la custode
    [-0.66,[[0,.25],[.635,.25],[.758,.28],[.789,.40],[.794,.53],[.789,.70],[.754,.807],[.69,.91],[.60,1.12],[.48,1.20],[.262,1.24],[0,1.245]]],   // le haut de la lunette
    [-0.55,[[0,.25],[.63,.25],[.755,.28],[.787,.40],[.792,.53],[.787,.70],[.752,.81],[.70,.895],[.535,1.222],[.495,1.25],[.27,1.282],[0,1.29]]],
    [-0.40,[[0,.25],[.62,.25],[.75,.28],[.785,.40],[.79,.53],[.785,.70],[.75,.815],[.703,.885],[.522,1.252],[.498,1.27],[.27,1.302],[0,1.312]]],
    [-0.20,[[0,.25],[.62,.25],[.75,.28],[.785,.40],[.79,.53],[.785,.70],[.75,.815],[.705,.88],[.52,1.262],[.50,1.28],[.27,1.31],[0,1.32]]],
    [-0.02,[[0,.25],[.62,.25],[.75,.28],[.785,.40],[.79,.53],[.785,.70],[.75,.815],[.705,.88],[.523,1.248],[.503,1.266],[.27,1.296],[0,1.306]]],
    [ 0.14,[[0,.25],[.62,.25],[.75,.28],[.785,.40],[.79,.53],[.785,.70],[.75,.815],[.705,.88],[.528,1.222],[.5065,1.239],[.27,1.257],[0,1.265]]],   // (le haut du pare-brise : ses rangs parallèles à ceux du pied)
    [ 0.70,[[0,.255],[.62,.255],[.75,.285],[.785,.40],[.795,.53],[.79,.70],[.755,.815],[.705,.875],[.665,.88],[.62,.875],[.31,.8986],[0,.9078]]],   // le pied du pare-brise
    [ 0.82,[[0,.255],[.62,.255],[.75,.285],[.785,.40],[.795,.53],[.79,.70],[.755,.81],[.69,.875],[.62,.872],[.56,.865],[.30,.872],[0,.876]]],
    [ 1.00,[[0,.26],[.62,.26],[.75,.29],[.79,.40],[.80,.53],[.795,.69],[.76,.80],[.635,.875],[.53,.855],[.48,.815],[.25,.825],[0,.828]]],
    [ 1.45,[[0,.27],[.62,.27],[.75,.30],[.79,.40],[.80,.53],[.795,.68],[.755,.792],[.625,.862],[.515,.822],[.46,.74],[.24,.75],[0,.753]]],
    [ 1.74,[[0,.28],[.60,.28],[.735,.31],[.775,.40],[.79,.52],[.78,.65],[.745,.758],[.62,.843],[.505,.785],[.455,.672],[.235,.682],[0,.685]]],
    [ 1.82,[[0,.285],[.59,.285],[.73,.315],[.77,.40],[.785,.51],[.775,.575],[.745,.61],[.62,.63],[.52,.635],[.47,.66],[.235,.675],[0,.678]]],
    [ 1.90,[[0,.29],[.56,.29],[.70,.32],[.745,.40],[.76,.49],[.75,.545],[.72,.585],[.62,.60],[.52,.612],[.47,.632],[.24,.648],[0,.65]]],
    [ 2.00,[[0,.31],[.48,.31],[.60,.33],[.645,.40],[.66,.46],[.655,.51],[.63,.545],[.56,.565],[.48,.575],[.42,.585],[.21,.595],[0,.598]]]];
  const cle=z=>{let i=0;while(i<CLE.length-2&&z>CLE[i+1][0])i++;const a=CLE[i],b=CLE[i+1],t=U.cl((z-a[0])/(b[0]-a[0]),0,1);
    return a[1].map((p,j)=>[p[0]+(b[1][j][0]-p[0])*t,p[1]+(b[1][j][1]-p[1])*t]);};
  // LES PASSAGES DE ROUE : un demi-octogone (haut à 0,675 m, la roue de 0,32 m y loge avec 3,5 cm de jour) qui relève le bas des sections
  const ARC=[[0,.675],[.21,.606],[.315,.49],[.365,.25]];
  // LES HANCHES : la tôle gonfle au-dessus des roues — fort derrière (les ailes élargies de la RS), un rien devant
  const GALBE=[0,0,.5,.85,1,1,.75,.3,0,0,0,0],galbe=z=>U.lin([[-1.92,0],[-1.75,.03],[-1.28,.05],[-.97,.048],[-.75,.03],[-.55,0],[.82,0],[1.00,.010],[1.45,.010],[1.74,0]],z);   // (ses coudes tombent SUR les clés : la coque du haut n'a pas besoin d'autres stations)
  const arche=z=>Math.max(U.lin(ARC,Math.abs(z-ZF)),U.lin(ARC,Math.abs(z-ZR)));
  /* la section : la clé, gonflée aux hanches ; puis LE FILET BLANC sous la bande bleue — le point 3 cède la place à deux points pris sur le
     flanc (bas de la bande à 0,335 m, haut à 0,465 m) : de bas en haut, le bas de caisse, un filet blanc, la bande bleue (13 points) ;
     enfin le passage de roue relève le bas de la section */
  const sect=z=>{const s=cle(z),a=arche(z),gb=galbe(z);for(let j=2;j<=7;j++)s[j][0]+=gb*GALBE[j];
    const sur=y=>{const A=s[2],B=s[3],C=s[4];if(y<=A[1])return [A[0],A[1]];if(y<=B[1]){const t=(y-A[1])/((B[1]-A[1])||1);return [A[0]+(B[0]-A[0])*t,y];}
      if(y<=C[1]){const t=(y-B[1])/((C[1]-B[1])||1);return [B[0]+(C[0]-B[0])*t,y];}return [C[0],C[1]];};
    s.splice(3,1,sur(.335),sur(.465));
    for(let j=0;j<=6;j++)if(s[j][1]<a)s[j]=[s[j][0],a];
    for(let j=1;j<=7;j++)if(s[j][1]<s[j-1][1])s[j]=[s[j][0],s[j-1][1]];return s;};
  /* DEUX LOFTS QUI SE PARTAGENT UNE ARÊTE (le point 6, au-dessus des passages de roue : jamais relevé). En bas, les stations des clés + celles
     des passages de roue ; en haut, les seules stations des clés — sinon les arches découpaient les hanches et le pavillon en lamelles tordues
     (le « bruit de triangles »). L'arête commune est droite entre deux clés : pas une fente entre les deux. */
  const net=a=>a.sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.006);
  const zsH=net(CLE.map(c=>c[0]).concat([-.31,-.25,.66])),zs0=zsH.slice();
  for(const w of [ZF,ZR]){zs0.push(w);for(const d of [.21,.315,.365])zs0.push(+(w-d).toFixed(3),+(w+d).toFixed(3));}
  const zs=net(zs0);
  const ZS0=ZR+.365,ZS1=ZF-.365;   // la bande bleue, d'une roue à l'autre
  /* `q` : la tôle À L'OMBRE (le dessous de la lèvre) — la couleur de la caisse assombrie, PEINTURE DE LA BOUTIQUE COMPRISE (elle suit `p`) */
  {const pp=(typeof peintPal==='function'?peintPal(PAL):PAL).p,c=pp.c!=null?pp.c:(pp.grad?pp.grad[1]:0x808080),f=v=>Math.round(v*.74);
   PAL.q=pp.g&&pp.g.indexOf('pm:')===0?pp:{g:pp.g||'p',c:(f(c>>16&255)<<16)|(f(c>>8&255)<<8)|f(c&255)};}
  const P=K.kit(PAL);P.ech=true;
  const peint=(j,z,y)=>{
    if(j<0)return 'p';                                     // le nez et la poupe (les bouchons : un triangle noir y montait au-dessus des pare-chocs)
    if(j===0)return 'k';                                   // le dessous (le bas de caisse reste dans la tôle : pas de trait noir sur le flanc)
    if(j===3)return (z>ZS0&&z<ZS1)?'b':'p';                // LA BANDE BLEUE (j 2 : le filet blanc dessous)
    if(j===8)return (z>-.75&&z<.66)?((z>-.31&&z<-.25)?'K':'g'):'p';   // la vitre (montant B noir)
    if(j===9)return (z>-.60&&z<.14)?'c':'p';               // la gouttière CHROMÉE du pavillon
    if(j>=10)return ((z>.14&&z<.70)||(z>-1.28&&z<-.66))?'g':'p';       // pare-brise, lunette
    return 'p';};
  // chaque demi-section se ferme sur l'axe à la hauteur du point 6 (sinon les bouchons du nez et de la poupe se croisaient : des trous où l'on
  // voyait l'intérieur noir) — la bande intérieure qui ferme est peinte '_' (absente de la palette : elle n'est pas tracée)
  P.loft(zs,z=>{const s=sect(z).slice(0,7);s.push([0,s[6][1]]);return s;},(j,z,y)=>j===6?'_':peint(j,z,y));
  P.loft(zsH,z=>{const s=sect(z).slice(6);s.unshift([0,s[0][1]]);return s;},(j,z,y)=>j===0?'_':peint(j<0?j:j+5,z,y));
  // le flanc à la hauteur y dans la tranche z (poignées, rétro)
  const xFl=(z,y)=>{const s=sect(z);for(let j=1;j<=9;j++){const a=s[j-1],b=s[j];if(y>=a[1]&&y<=b[1]&&b[1]>a[1])return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);}return s[4][0];};
  // le dessus de la coque à la hauteur x, dans la tranche z (pour poser la lèvre et sa grille)
  const yDessus=(z,x)=>{const s=sect(z);for(let j=12;j>6;j--){const a=s[j],b=s[j-1];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/((b[0]-a[0])||1);}return s[6][1];};
  /* ---- LA QUEUE DE CANARD : une lèvre posée sur le capot moteur. Elle sort de la tôle à z −1,65, monte en pente douce, déborde de 8 cm
     derrière la poupe ; ses deux bouts ROULENT jusqu'aux hanches. Dessous, la lèvre remonte vers son bord : de dos, une ombre franche. ---- */
  const XD=z=>U.lin([[-2.085,.50],[-1.95,.50],[-1.80,.47],[-1.60,.39]],z),
        YT=z=>U.lin([[-2.085,.982],[-2.05,.972],[-2.00,.955],[-1.95,.933],[-1.88,.92],[-1.80,.912],[-1.70,.906],[-1.60,.912]],z),
        TH=z=>U.lin([[-2.085,.028],[-2.05,.042],[-2.02,.06]],z),EPS=z=>U.lin([[-1.95,.004],[-1.65,-.012]],z),
        US=[0,.55,.80,.93,1],DROP=u=>U.lin([[0,0],[.55,.005],[.80,.02],[.93,.05]],u);
  // les BOUTS de la lèvre : une face franche qui sort de la hanche à z −1,92 et monte jusqu'au bord de fuite (derrière la poupe, rien ne pend)
  const YE=z=>YT(z)-DROP(.93)-.02,KE=z=>U.lin([[-2.0,1],[-1.92,0]],z),
        lTop=(z,u)=>u<1?YT(z)-DROP(u):z<-2.0?YE(z):(yDessus(z,XD(z))+EPS(z))*(1-KE(z))+YE(z)*KE(z),
        lBas=(z,u)=>z>=-2.0?(u<1?yDessus(z,u*XD(z))-.03:yDessus(z,XD(z))-.01):(u<1?lTop(z,u)-TH(z)*(1-u*u*u):Math.min(lTop(z,.93)-TH(z)*.196,YE(z)-.015));
  const P2=K.kit(PAL);P2.ech=true;
  P2.loft([-2.085,-2.05,-2.02,-2.00,-1.97,-1.92,-1.84,-1.76,-1.68,-1.60],z=>{
    const xd=XD(z),o=[];
    for(const u of US)o.push([u*xd,lBas(z,u)]);
    for(let i=US.length-1;i>=0;i--){const u=US[i];o.push([u*xd,lTop(z,u)]);}
    return o;},(j)=>(j>=0&&j<=3)?'q':'p');   // le dessous dans la teinte à l'ombre (la même couleur, plus sombre) : de dos, la lèvre se détache par le relief
  K.commit(P2);
  // la GRILLE du capot moteur, sur la pente de la lèvre : une plaque noire qui épouse la tôle, ses lames
  {const g9=(z,x)=>{const u=x/XD(z);return YT(z)-DROP(u)+.004;},zz=[-1.79,-1.84,-1.89,-1.94],xx=[0,.16,.30];
   for(let i=0;i<zz.length-1;i++)for(let k=0;k<xx.length-1;k++)for(const sd of [1,-1]){const a=[sd*xx[k],g9(zz[i],xx[k]),zz[i]],b=[sd*xx[k+1],g9(zz[i],xx[k+1]),zz[i]],
     c=[sd*xx[k+1],g9(zz[i+1],xx[k+1]),zz[i+1]],d=[sd*xx[k],g9(zz[i+1],xx[k]),zz[i+1]];P.tri('k',a,b,c);P.tri('k',a,c,d);}
   for(let i=0;i<5;i++){const z=-1.805-i*.032,y=g9(z,0)+.004;P.box('C',.56,.005,.010,0,y,z,Math.atan2(g9(z-.01,0)-g9(z+.01,0),.02));}}
  /* (2026-10-26, règle de Léo : AUCUN trait sombre peint sur la tôle) les joints du capot et des portes, dessinés en ruban gris, sont
     RETIRÉS : la langue du capot se lit par le relief seul — le pli des ailes qui la dominent, le décroché de l'auvent. */
  /* ---- LES PARE-CHOCS DE 1973 : des joncs fins couleur caisse, tirés le long de leur tracé vu de dessus, et leur bande de caoutchouc noir ---- */
  const jonc=(k,half,prof)=>{const path=half.slice(1).reverse().map(q=>[-q[0],q[1]]).concat(half),n=path.length,N=[];
    for(let i=0;i<n;i++){const a=path[Math.max(0,i-1)],b=path[Math.min(n-1,i+1)],p=path[i];let tx=b[0]-a[0],tz=b[1]-a[1];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
      let nx=tz,nz=-tx;if(nx*p[0]+nz*p[1]<0){nx=-nx;nz=-nz;}let s=1;
      if(i>0&&i<n-1){const ax=p[0]-a[0],az=p[1]-a[1],la=Math.hypot(ax,az)||1;s=1/Math.max(.6,Math.abs((az/la)*nx+(-ax/la)*nz));}N.push([nx*s,nz*s]);}
    const V=(i,q)=>[path[i][0]+N[i][0]*prof[q][0],prof[q][1],path[i][1]+N[i][1]*prof[q][0]];
    for(let i=0;i<n-1;i++)for(let q=0;q<prof.length-1;q++){const a=V(i,q),b=V(i,q+1),c=V(i+1,q+1),d=V(i+1,q);P.tri(k,a,b,c);P.tri(k,a,c,d);}
    for(const i of [0,n-1])for(let q=1;q<prof.length-1;q++)P.tri(k,V(i,0),V(i,q),V(i,q+1));};
  const AVP=[[.756,1.62],[.758,1.72],[.745,1.84],[.705,1.94],[.62,2.01],[.47,2.047],[.24,2.065],[0,2.065]],
        ARP=[[.785,-1.535],[.805,-1.66],[.79,-1.80],[.745,-1.92],[.65,-1.995],[.48,-2.042],[.25,-2.062],[0,-2.062]];
  jonc('p',AVP,[[-.07,.31],[0,.31],[.022,.325],[.03,.37],[.028,.43],[.02,.455],[0,.465],[-.07,.465]]);
  jonc('k',AVP.slice(1),[[.04,.405],[.046,.418],[.046,.435],[.04,.448]]);
  jonc('p',ARP,[[-.07,.34],[0,.34],[.022,.355],[.03,.39],[.028,.44],[.02,.465],[0,.475],[-.07,.475]]);
  jonc('k',ARP.slice(1),[[.04,.425],[.046,.437],[.046,.452],[.04,.462]]);
  /* ---- LE NEZ : la lèvre noire de la RS (le becquet avant), les clignotants et les grilles d'avertisseur sous les phares, l'écusson ---- */
  P.prism('k',[[1.86,.31],[2.06,.31],[2.075,.295],[2.05,.27],[1.86,.27]],1.16,0);
  P.sym(sd=>{
    P.box('O',.13,.04,.02,sd*.57,.372,2.072,0,-sd*.30,0);
    P.box('K',.15,.042,.02,sd*.37,.372,2.083,0,-sd*.12,0);
    for(const y of [.365,.38])P.box('C',.135,.006,.008,sd*.37,y,2.094,0,-sd*.12,0);
  });
  P.box('o',.05,.04,.012,0,.612,1.97,-.50);P.box('c',.07,.012,.03,0,.588,2.008,-.50);   // l'écusson, la poignée du capot
  /* ---- LES PHARES : un DÔME rond dans le bout de chaque aile, son cerclage chromé, penché de 15° vers l'arrière comme la tôle qui le porte.
     La cuvette rentre dans l'aile (rien ne flotte), la glace bombe de 3 cm devant. ---- */
  const TILT=.30;
  P.sym(sd=>{const cx=sd*.62,cy=.722,cz=1.786;
    const geo=(pts,n)=>{const g=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),n);g.rotateX(Math.PI/2);return g;};
    P.put('p',geo([[.104,-.09],[.104,-.01]],12),cx,cy,cz,-TILT,0,0);
    P.put('c',geo([[.104,-.01],[.106,.006],[.096,.018],[.084,.02]],12),cx,cy,cz,-TILT,0,0);
    P.put('W',geo([[.084,.02],[.05,.038],[0,.046]],12),cx,cy,cz,-TILT,0,0);});
  /* ---- LA POUPE : les feux aux coins (rouge au-dedans, ambre au-dehors, sur leur cadre noir), le monogramme chromé entre eux ---- */
  P.sym(sd=>{P.box('c',.31,.135,.016,sd*.495,.625,-2.006);P.box('K',.29,.115,.01,sd*.495,.625,-2.012);
    P.box('L',.17,.10,.012,sd*.43,.625,-2.017);P.box('r',.12,.026,.008,sd*.43,.625,-2.024);
    P.box('O',.10,.10,.012,sd*.575,.625,-2.017);});
  P.box('c',.26,.016,.01,0,.655,-2.004);
  P.box('w',.40,.10,.012,0,.545,-2.008);   // la plaque (la vraie s'y pose : plqDessinee) — sans elle, les rayons de la plaque la posaient sur la lèvre
  /* ---- L'HABITACLE : essuie-glaces couchés, le RÉTRO DE COURSE côté pilote, les poignées chromées ---- */
  for(const sd of [1,-1])P.box('k',.46,.012,.016,sd*.24,.926,.68,0,0,sd*.04);
  {const xm=xFl(.42,.84),hx=xm+.085,hy=.905,hz=.43;
   P.box('c',.105,.014,.018,xm+.04,.868,hz,0,0,.62);                                                        // la tige, plantée dans la porte
   P.lathe('c',[[.058,-.012],[.058,.006],[.04,.03],[0,.041]],8,hx,hy,hz,'z');                 // la coque bombée vers l'avant
   P.cyl('K',.05,.006,8,hx,hy,hz-.014,'z');}                                                                 // la glace, vers l'arrière
  P.sym(sd=>P.box('c',.012,.022,.13,sd*(xFl(-.18,.785)+.004),.785,-.18));
  // les passages de roue : un panneau noir derrière chaque roue (on ne voit plus le jour à travers la caisse)
  P.sym(sd=>{for(const w of [ZF,ZR])P.box('k',.02,.42,.72,sd*.56,.47,w);});
  K.commit(P);
  /* ---- LES ROUES : les FUCHS de la RS — cinq pétales forgés polis sur le voile peint BLEU, la lèvre polie, le moyeu ; pneu haut des
     années 70 (16 pans, épaules chanfreinées). Dessinées ici (style 'nyan' : le jeu pose des moyeux vides, on y verse la roue). ---- */
  const JW=.21,hw=JW/2,fx=hw-.018,J=lpKit({k:{g:'m',c:0x18191b},c:{g:'c',c:0xe4e8ed},b:{g:'p',c:0x1745a8,f:0},d:{g:'m',c:0x101114}});   // (le bleu des jantes un ton plus bas : sans l'ombre cuite du bas de caisse, il sortait plus clair que la bande)
  J.lathe('k',[[.215,-hw],[R*.88,-hw],[R,-hw*.5],[R,hw*.5],[R*.88,hw],[.215,hw]],16,0,0,0,'x');
  J.lathe('c',[[.215,hw-.004],[.192,fx]],16,0,0,0,'x');
  J.lathe('b',[[.192,fx],[.06,fx-.03]],16,0,0,0,'x');
  J.lathe('d',[[.215,-hw+.02],[0,-hw+.02]],8,0,0,0,'x');
  for(let i=0;i<5;i++){const a=i*2*Math.PI/5,Q=(r,d,x)=>[x,r*Math.sin(a+d),r*Math.cos(a+d)];
    const c0=Q(.055,0,fx-.012),c1=Q(.19,0,fx+.008),l0=Q(.06,-.32,fx-.022),l1=Q(.19,-.28,fx-.004),r0=Q(.06,.32,fx-.022),r1=Q(.19,.28,fx-.004);
    J.tri('c',c0,l1,l0);J.tri('c',c0,c1,l1);J.tri('c',c0,r0,r1);J.tri('c',c0,r1,c1);}
  J.lathe('c',[[.062,fx-.02],[.045,fx+.008],[0,fx+.014]],8,0,0,0,'x');
  const JG=J.done();
  return {hl:[.62,.722,1.83],tl:[.50,.625,-2.02],wx:.70,wxF:.68,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe4e8ed}};
};
/* LA PRÉCHAUFFE (comme `perleTraits` / `japChauffe`) : la tôle de LA GRANDE ANGLAISE découpée au plan une fois, pendant la préchauffe du menu
   (`chauffeDivers`) — le gabarit tourne dans un chantier muet (`K.muet`) et garde sa découpe sur sa fonction (`_tole`). (2026-10-26) LA QUEUE
   DE CANARD n'en a plus besoin : refaite à la main en poly, elle n'a plus de tôle découpée (elle se construit en quelques millisecondes). */
function rondesChauffe(){for(const n of ['e_anglaise']){const F=typeof SHAPES==='object'&&SHAPES[n];if(!F||F.length!==1||(F._tole&&F._tole.G))continue;const t0=performance.now();
  F({kit:pal=>lpKit(typeof peintPal==='function'?peintPal(pal):pal),commit:kt=>{const gs=kt.done?kt.done():kt;if(gs)for(const g in gs)if(gs[g]&&gs[g].dispose)gs[g].dispose();},mats:{},add:o=>o,muet:1});
  F._ms=Math.round(performance.now()-t0);return true;}
  return false;}
window.dbgRondesChauffe=function(){const o={};for(const n of ['b_canard','e_anglaise']){const F=SHAPES[n];o[n]={decoupee:!!(F&&F._tole&&F._tole.G),ms:F&&F._ms||null};}return o;}; // (banc) la tôle de LA QUEUE DE CANARD est-elle déjà découpée (préchauffe du menu) ?
// <<< fin SHAPES.b_canard (RONDES) >>>
// <<< SHAPES.e_anglaise (RONDES) >>>
SHAPES.e_anglaise=function(K){
  /* LA GRANDE ANGLAISE — VERSION FINALE, EN POLY (2026-10-26). Léo : « une version qui prend TOUS LES BONS ÉLÉMENTS et les rassemble en une
     voiture imaginaire, belle et FINE — fine au sens délicat, raffiné ». La grande routière de luxe anglaise qu'aucune marque n'a faite :
     · l'ATTITUDE PENCHÉE du coupé du 18/10 (e66f25b2) : nez bas, ligne de puissance qui MONTE vers l'arrière, pavillon qui TOMBE en un seul
       arc par une lunette couchée, croupe qui se resserre en goutte (0,78 m à la poupe), longue porte de coupé, vitre de custode en pointe ;
     · les FACETTES ordonnées du 17/10 (d592cc20) : grands pans PLANS, arêtes nettes — la marche du capot à hauteur constante, les pentes
       constantes, la ceinture parallèle à la ligne de puissance, la gouttière tirée de la ceinture par une pente constante (la vitre de côté
       est un seul plan) : rien ne vrille ;
     · de la berline e13 : la CALANDRE-TEMPLE à maille chromée en losanges (chaque barre une arête à deux pans) et lame médiane, l'ESPRIT
       AILÉ, les DEUX PAIRES DE PHARES RONDS, le jonc de ceinture et celui du bas de caisse, l'ouïe d'aile, le plateau du capot en V, la jupe
       basse, les roues dessinées pour elle, deux grosses sorties ovales ; et derrière (Léo, après e18) UN FEU EN LIGNE d'un bord à l'autre ;
     · la FINESSE : chromes minces (jonc de ceinture 2,6 cm, montants de calandre 4,8 cm, fil chromé entre porte et custode), aile avant
       galbée par l'arche, flanc bas qui rentre (la caisse paraît légère), vert anglais franc 14532f.
     Règle de Léo : AUCUN trait sombre peint sur la tôle — le noir n'est que roues, dessous, vitres, vraies pièces de plastique.
     Repère : x à droite, y en haut, z vers l'avant, mètres, origine au milieu au sol. */
  if(K.muet)return;   // (la préchauffe du menu découpait la tôle de la version au plan ; celle-ci n'a rien à découper)
  const U=LPU,L=(t,z)=>U.lin(t,z);
  const R=.36,ZF=1.52,ZR=-1.38,ZW=.86,ZA=.98,ZT=.18,ZT2=-.62,ZL=-1.72,ZM=-1.86;   // roues · pied du pare-brise, fin de l'auvent · pavillon (avant, arrière) · pied de la lunette, début de la malle
  const PAL={p:{g:'p',c:0x0f4527},   // le VERT ANGLAIS — profond et franc : plus de chroma que l'ancien 1a3d2a (vert-de-gris sous la lampe du studio), un cran plus sombre que 14532f (vert émeraude sous les lampes du garage)
    k:{g:'m',c:0x131417},K:{g:'g',c:0x0a0c0f},g:{g:'g',c:0x131a22},c:{g:'c',c:0xe9ecf0},C:{g:'c',c:0x8d949d},
    W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xd0182a},r:{g:'l',c:0x6e0a12},O:{g:'l',c:0xffa21a},w:{g:'l',c:0xd9dce0}};
    const P=K.kit(PAL);
  // ---- LE PLAN ----
  // le dessous, et les passages de roue en OCTOGONE (r ≈ 0,41 autour de la roue : la DA poly)
  const yb0=z=>L([[-2.42,.30],[-2.30,.25],[-2.05,.21],[2.10,.21],[2.30,.24],[2.42,.28]],z),
        AR=[[0,.77],[.21,.75],[.34,.66],[.415,.515],[.445,.19]],
        ybz=z=>Math.max(yb0(z),U.arch(z,[ZF,ZR],AR,0));
  // la plus grande largeur (la HANCHE au-dessus de la roue arrière), la LIGNE DE PUISSANCE (son arête) et le pli bas du flanc
  const XW=z=>L([[-2.42,.78],[-2.36,.86],[-2.25,.915],[-2.0,.955],[-1.38,.982],[-.90,.955],[-.20,.945],[.60,.948],[1.10,.958],[1.52,.972],[2.05,.958],[2.28,.93],[2.37,.90],[2.42,.865]],z),   // (la CROUPE se resserre en goutte : 0,78 à la poupe)
        YS=z=>L([[-2.42,.81],[-2.30,.845],[-1.90,.865],[-1.38,.86],[-.80,.83],[0,.81],[.80,.795],[1.52,.79],[2.20,.775],[2.42,.755]],z),   // (elle MONTE vers l'arrière : la caisse se penche, nez bas ; au-dessus de la roue avant l'arche la soulève : l'aile galbée)
        YL=z=>L([[-2.42,.50],[-2.0,.53],[-1.0,.50],[0,.475],[1.2,.455],[2.42,.44]],z);   // le pli bas qui MONTE vers l'arrière (la « waft line » de Goodwood : la caisse file même à l'arrêt)
  // la CEINTURE (le bas des vitres) — la cabine s'y pose. Elle suit la ligne de puissance à distance CONSTANTE (le biseau d'épaule
  // garde sa largeur : un pan plat, jamais vrillé) et se relève donc avec elle au-dessus de la roue arrière
  const yBe=z=>YS(z)+.097,xBe=z=>XW(z)-.115;
  // le PLATEAU du capot : ses bords partent des montants de la calandre (0,40) et s'ouvrent en ligne droite jusqu'aux montants du pare-brise
  const XV=z=>L([[ZA,.78],[2.42,.42]],z),MARCHE=.035,AILE=.05,FAITE=.03;
  // la malle : son bord (il se resserre à la poupe) et sa hauteur
  const XT=z=>L([[-2.42,.52],[-2.30,.62],[-2.10,.70],[ZM,.76]],z),YT=z=>L([[-2.42,.865],[-2.36,.898],[-2.22,.925],[ZM,.945]],z);
  // LA SECTION DE LA CAISSE : sol · jupe · flanc bas qui rentre · FLANC-DALLE · biseau d'épaule · puis, selon l'endroit,
  // aile plate → marche → plateau (le capot) · biseau → ceinture (sous la cabine) · aile → malle
  const sectB=z=>{
    const yb=ybz(z),xw=XW(z),ys=YS(z);
    const y2=yb+L([[.21,.065],[.40,.025]],yb),y3=Math.max(YL(z),y2+.015),y4=Math.max(ys,y3+.015),y5=Math.max(ys+.055,y4+.03),x5=xw-.07;
    const s=[[0,yb],[xw-.13,yb],[xw-.06,y2],[xw,y3],[xw-.0115,y4-.013],[xw-.012,y4],[x5,y5]];   // (sous l'arête, un méplat de 13 mm : l'arête se lit en RELIEF — aucun filet peint)
    if(z>=ZA){const x6=XV(z),y6=y5+AILE*(x5-x6),x7=x6-.025,y7=y6+MARCHE;s.push([x6,y6],[x7,y7],[0,y7+FAITE*x7]);}  // l'aile, la marche, le plateau
    else if(z>=ZL){const x6=xBe(z),y6=Math.max(yBe(z),y5+.01);s.push([x6,y6],[x6-.03,y6+.002],[0,y6+.004]);}       // la ceinture (le reste est sous la cabine)
    else{const x6=XT(z),y6=Math.max(YT(z),y5+.01);s.push([x6,y6],[x6*.5,y6+.012],[0,y6+.024]);}                      // la malle, une arête au milieu
    return s;};
  const zsB=[-2.42,-2.40,-2.36,-2.30,-2.22,-2.10,-2.0,ZM,ZL,-.40,.30,ZW,ZA,2.10,2.22,2.32,2.38,2.42];
  for(const w of [ZF,ZR])for(const d of [0,.21,.34,.415,.445])zsB.push(+(w-d).toFixed(3),+(w+d).toFixed(3));
  const tri9=a=>a.sort((x,y)=>x-y).filter((z,i,q)=>i===0||z-q[i-1]>.004);
  P.loft(tri9(zsB),sectB,(j,z,y)=>j===0||(j===1&&y>.36)?'k':'p');   // (dans les passages de roue, la lèvre dessous est noire : le puits)
  // LA CABINE DU COUPÉ : du jonc de ceinture au faîte (1,30 m : basse et allongée), le pavillon qui TOMBE en un seul arc par une lunette couchée jusqu'à la malle
  const yRl=z=>L([[ZL,yBe(ZL)],[-1.40,1.06],[-1.05,1.165],[ZT2,1.235],[-.20,1.258],[ZT,1.255],[ZW,yBe(ZW)]],z),xRl=z=>xBe(z)-.016-.30*(yRl(z)-yBe(z)),   // (la gouttière tirée de la ceinture par une pente CONSTANTE : la vitre de côté est un seul plan, elle ne vrille plus là où la gouttière descend)
        
        yRc=z=>L([[ZL,yBe(ZL)+.004],[-1.40,1.10],[-1.05,1.21],[ZT2,1.28],[-.20,1.30],[ZT,1.295],[ZW,yBe(ZW)+.004]],z);   // (le pavillon en ARC, la lunette couchée qui file vers la malle courte : la ligne des coupés de Crewe)
  const sectG=z=>{const g0=[xBe(z)-.006,yBe(z)-.004],yr=yRl(z),xr=xRl(z),yc=yRc(z),
      g1=Math.min(yBe(z)+.026,g0[1]+(yr-g0[1])*.5),g2=Math.max(g1+.002,yr-.013),ye=yr+(yc-yr)*.62;
    const xe=xr-.065,y4=Math.max(ye,yr+.002),y5=Math.max(yc,yr+.003),cr=LUN[z.toFixed(3)]||[0,0];
    return [g0,[g0[0]-.01,g1],[xr+.012,g2],[xr,Math.max(yr,g2+.001)],[xe,y4],[xe*.5,(y4+y5)/2+cr[0]],[0,y5+cr[1]]];};   // (un cadre de 6,5 cm : le pare-brise et la lunette presque aussi larges que la cabine)
  /* LA LUNETTE EN FACETTES (Léo, avant le main : « les vitres comme les autres voitures ») : couchée d'un seul plan, elle renvoyait le plafond
     du studio en une grande plaque BLANCHE. Comme la Zagaie, chaque station de la lunette prend une COURONNE (le milieu de chaque moitié
     relevé de 1,2 à 4,6 cm, en alternance) et le milieu un pli de quelques millimètres : le verre sombre se casse en facettes qui n'ont pas
     toutes le même angle — quelques-unes seulement accrochent la lumière. Loft en miroir : reflets symétriques. La silhouette ne bouge pas. */
  const LUN={'-0.830':[.046,.008],'-1.040':[.012,-.006],'-1.250':[.042,.006],'-1.400':[.016,0]};
  const ZV0=-1.40,ZV1=.66,vitre=z=>z>ZV0&&z<ZV1,pilB=z=>z>-.775&&z<-.745;   // (une longue porte de coupé, la vitre de custode qui file en POINTE sous la lunette ; entre les deux, un fil chromé)
  P.loft([ZL,-1.45,ZV0,-1.25,-1.04,-.83,-.775,-.745,ZT2,-.20,ZT,ZV1,ZW],sectG,   // (la lunette : quatre stations à couronne, voir LUN)
    (j,z)=>{
    if(j<0)return 'p';
    if(j===0)return 'c';                                             // le jonc de ceinture
    if(j===1)return vitre(z)?(pilB(z)?'c':'g'):'p';                   // vitres et leur fil chromé ; montants A et custode dans la teinte
    if(j===2)return vitre(z)?'c':'p';                                 // le jonc du haut de vitre
    if(j===3)return 'p';                                             // le cadre : pavillon, montants (un verre de biais y faisait un éclat blanc)
    return (z>ZT||(z<ZT2&&z>-1.45))?'g':'p';});                      // pare-brise, lunette (elle s'arrête sur la pente : la croupe reprend, en tôle) ; le pavillon
  // le flanc à une hauteur donnée (les pièces posées s'y collent)
  const xAt=(z,y)=>{const s=sectB(z);let x=XW(z);for(let i=2;i<7;i++){const a=s[i-1],b=s[i];if(y>=a[1]&&y<=b[1]&&b[1]>a[1]){x=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);break;}}return x;};
  const forme=Q=>{const s=new THREE.Shape();Q.forEach((q,i)=>i?s.lineTo(q[0],q[1]):s.moveTo(q[0],q[1]));return s;},
        plat=(k,Q,z)=>P.put(k,new THREE.ShapeGeometry(forme(Q)),0,0,z),                   // une glace : une plaque sans épaisseur
        ov=(cx,cy,rx,ry,n)=>{const o=[];for(let i=0;i<n;i++){const t=i/n*Math.PI*2;o.push([cx+Math.cos(t)*rx,cy+Math.sin(t)*ry]);}return o;};
  /* ---- LA CALANDRE : le TEMPLE de Goodwood (haut, droit — 3° à peine —, un cadre épais, une corniche d'entablement qui déborde)
     rempli de la MAILLE de Crewe (des losanges chromés, chaque barre une ARÊTE à deux pans qui prend la lumière, sur deux plans pour
     se croiser sans se toucher), une lame debout au milieu ; posée sur le bouclier, tout entière devant la face, dans l'axe du plateau ---- */
  {const b=.03,O9=[0,.425,2.50],H=.47,cb=Math.cos(b),sb=Math.sin(b),
     M=(x,hh,dd)=>[O9[0]+x,O9[1]+hh*cb+dd*sb,O9[2]-hh*sb+dd*cb],
     G=(k,w,h,d,x,hh,dd,rz)=>{const q=M(x,hh,dd);P.box(k,w,h,d,q[0],q[1],q[2],-b,0,rz||0);};
    G('k',.63,H-.05,.05,0,H/2,-.065);                                                // le fond noir (mat : la maille s'y détache)
    {const X0=-.31,X1=.31,H0=.04,H1=H-.05,hh=H1-H0,pas=.088,w=.0065,hz=.008;          // la maille : losanges de 8,8 cm
      const arete=(x0,h0,x1,h1,d)=>{const dx=x1-x0,dh=h1-h0,l=Math.hypot(dx,dh),nx=-dh/l*w,nh=dx/l*w,
          A=M(x0-nx,h0-nh,d),B=M(x1-nx,h1-nh,d),C=M(x1+nx,h1+nh,d),D=M(x0+nx,h0+nh,d),E=M(x0,h0,d+hz),F=M(x1,h1,d+hz);
        P.tri('c',A,B,F);P.tri('c',A,F,E);P.tri('c',E,F,C);P.tri('c',E,C,D);};
      for(const sg of [1,-1])for(let x=X0-hh;x<=X1+hh;x+=pas){                          // une ligne à 45°, coupée au cadre
        let t0=Math.max(0,sg>0?(X0-x)/hh:(x-X1)/hh),t1=Math.min(1,sg>0?(X1-x)/hh:(x-X0)/hh);if(t1-t0<.04)continue;
        arete(x+sg*hh*t0,H0+hh*t0,x+sg*hh*t1,H0+hh*t1,sg>0?-.044:-.030);}}
    G('c',.018,H-.05,.05,0,H/2,-.028);                                               // la lame debout du milieu
    G('c',.048,H,.09,.334,H/2,-.03);G('c',.048,H,.09,-.334,H/2,-.03);               // les montants (minces : la finesse est dans le chrome)
    G('c',.716,.04,.09,0,.02,-.03);                                                  // le seuil
    G('c',.76,.055,.115,0,H-.022,-.024);G('c',.68,.016,.09,0,H+.013,-.03);           // la corniche qui déborde, et son gradin
    /* L'ESPRIT AILÉ sur la corniche — ni la dame de Goodwood ni le B de Crewe : une silhouette penchée en avant, deux ailes en flèche */
    const T=M(0,H+.03,-.03);
    P.box('c',.05,.03,.07,T[0],T[1]+.012,T[2]);
    P.box('c',.022,.085,.026,T[0],T[1]+.06,T[2]+.012,.42,0,0);                       // la silhouette, penchée dans le vent
    P.sym(sd=>P.box('c',.15,.011,.06,sd*.085,T[1]+.07,T[2]-.012,0,sd*.42,sd*.36));}
  // ---- LES DEUX PAIRES DE PHARES RONDS : la grande à l'intérieur, la petite au coin ; chacun dans sa bague chromée (une tranche, un
  //      biseau), une glace claire, un jonc chromé à mi-rayon, l'optique bombée — pas de pupille sombre : des phares, pas des yeux ----
  P.sym(sd=>{for(const [x,y,r] of [[.505,.60,.092],[.72,.605,.07]]){const X=sd*x;
      P.lathe('c',[[r+.016,-.03],[r+.016,.016],[r,.020]],14,X,y,2.43,'z');
      P.lathe('W',[[r,.018],[r*.58,.020]],12,X,y,2.43,'z');
      P.lathe('c',[[r*.58,.020],[r*.50,.026]],12,X,y,2.43,'z');
      P.lathe('W',[[r*.50,.026],[0,.033]],12,X,y,2.43,'z');}
    P.box('O',.10,.018,.02,sd*.72,.51,2.425);                                        // le clignotant
    // le bouclier : la bouche basse et sa lame chromée, les antibrouillards
    P.lathe('c',[[.034,-.02],[.034,.008]],12,sd*.66,.30,2.475,'z');P.lathe('W',[[.034,.008],[.022,.012],[0,.015]],12,sd*.66,.30,2.475,'z');});
  P.prism('p',[[2.30,.215],[2.44,.215],[2.475,.25],[2.475,.385],[2.45,.42],[2.30,.42]],1.62,0);   // le bouclier avant
  P.box('K',.96,.10,.02,0,.31,2.48);for(const y of [.292,.33])P.box('c',1.0,.011,.025,0,y,2.486);   // la prise basse à DEUX lames (celle de la toute première Anglaise)
  // ---- LE FLANC : le rétro couleur caisse, les poignées et le jonc de bas de caisse chromés, l'ouïe chromée d'aile avant ----
  P.sym(sd=>{const xm=xBe(.74),ym=yBe(.74);
    P.box('k',.10,.022,.045,sd*(xm+.045),ym+.012,.74);
    P.box('p',.075,.09,.16,sd*(xm+.12),ym+.04,.72,0,sd*.10,0);P.box('K',.063,.074,.01,sd*(xm+.121),ym+.04,.64,0,sd*.10,0);
    P.box('c',.014,.02,.14,sd*(xAt(-.30,.74)+.007),.74,-.30);                          // la poignée de la longue porte
    P.box('c',.010,.018,1.96,sd*(xAt(.07,.33)+.004),.33,.07);                          // le jonc de bas de caisse, mince
    const zv=.90,xv=xAt(zv,.62);P.box('c',.010,.085,.18,sd*(xv+.004),.62,zv);P.box('p',.012,.063,.15,sd*(xv+.006),.62,zv);   // l'ouïe : un cadre et des lames chromés sur un fond dans la teinte (pas de trou noir peint)
    for(const y of [.608,.632])P.box('c',.014,.008,.15,sd*(xv+.008),y,zv);});
  // ---- L'ARRIÈRE : le DOUBLE OVALE des feux (une bague chromée, la glace rouge, deux cœurs sombres), la barre chromée de malle, la
  //      plaque, le bouclier et son jonc ----
  /* LE FEU EN LIGNE (Léo : « un feu unifié en ligne, moderne et stylé ») : UNE barre rouge d'un bord à l'autre de la poupe, 4 cm au
     milieu, dont les extrémités REMONTENT et s'effilent en lame ; un liseré chromé de 7 mm la cerne (pas de trait noir) ; posée à plat */
  {const H=(k,o)=>{const T=[[.56,.742+o],[.67,.756+o],[.728+o*.9,.79+o]],B=[[.725+o*.6,.782-o*.6],[.65,.718-o],[.54,.699-o]],
       Q=[];for(let i=T.length-1;i>=0;i--)Q.push([-T[i][0],T[i][1]]);for(const q of T)Q.push(q);for(const q of B)Q.push(q);for(let i=B.length-1;i>=0;i--)Q.push([-B[i][0],B[i][1]]);return Q;};
    P.plate('c',H('c',.007),.02,-2.44);plat('L',H('L',0),-2.4445);}
  P.sym(sd=>P.box('r',.08,.02,.012,sd*.66,.33,-2.478));
  P.box('k',.44,.13,.01,0,.52,-2.425);P.box('w',.40,.095,.012,0,.52,-2.429);
  P.prism('p',[[-2.30,.235],[-2.445,.235],[-2.475,.27],[-2.475,.405],[-2.45,.44],[-2.30,.44]],1.44,0);   // le bouclier arrière (la croupe en goutte : plus étroit)
  P.box('c',1.28,.014,.02,0,.43,-2.462);
  P.box('k',1.14,.045,.02,0,.262,-2.476);P.box('c',.70,.016,.02,0,.315,-2.482);   // la jupe noire, et le jonc chromé qui relie les deux sorties (l'écho de la lame du bouclier avant)
  K.commit(P);
  /* ---- LES ROUES : la jante de 21 pouces (un pneu BAS : la limousine ne roule pas sur des ballons), sa lèvre polie, cinq paires de
     branches EN ARÊTE (deux pans chacune, qui prennent leur lumière tour à tour), le cache du moyeu à la couleur de la caisse ---- */
  const JW=.28,hw=JW/2,fx=hw-.02,RJ=.27,J=K.kit({k:{g:'m',c:0x18191b},c:{g:'c',c:0xe4e8ed},d:{g:'m',c:0x0e0f12},p:PAL.p});
  J.lathe('k',[[RJ,-hw],[R*.92,-hw],[R,-hw*.45],[R,hw*.45],[R*.92,hw],[RJ,hw]],16,0,0,0,'x');
  J.lathe('c',[[RJ,hw-.004],[RJ-.006,fx+.012],[RJ-.03,fx-.004]],16,0,0,0,'x');
  J.lathe('d',[[RJ-.03,fx-.06],[0,fx-.06]],16,0,0,0,'x');
  {const r0=.066,r1=RJ-.028,w0=.011,w1=.019,x0=fx-.022,x1=fx-.004,hz=.011,
     T=(A,B,C)=>{const nx=(B[1]-A[1])*(C[2]-A[2])-(B[2]-A[2])*(C[1]-A[1]);if(nx<0)J.tri('c',A,C,B);else J.tri('c',A,B,C);};
    for(let i=0;i<10;i++){const a=(Math.floor(i/2)+(i%2?.5+.085:.5-.085))*Math.PI*2/5,ca=Math.cos(a),sa=Math.sin(a),Q=(r,t,x)=>[x,sa*r+ca*t,ca*r-sa*t],
      A=Q(r0,-w0,x0),B=Q(r1,-w1,x1),C=Q(r1,w1,x1),D=Q(r0,w0,x0),M0=Q(r0,0,x0+hz),M1=Q(r1,0,x1+hz);
      T(A,B,M1);T(A,M1,M0);T(M0,M1,C);T(M0,C,D);}}
  J.lathe('c',[[.074,fx-.024],[.070,fx+.002],[.054,fx+.008]],12,0,0,0,'x');                     // le moyeu poli
  J.lathe('p',[[.054,fx+.008],[.032,fx+.014],[0,fx+.016]],12,0,0,0,'x');                         // son cache, à la couleur de la caisse
  const JG=J.done();
  return {hl:[.505,.60,2.47],tl:[.60,.73,-2.45],wx:.80,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe4e8ed}};
};
