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
  /* LA GRANDE ANGLAISE — la Bentley Continental GT de 2003 (1re génération), refaite AU PLAN (2026-10-18, discussion RONDES ; Léo :
     « dans la direction qu'on a prise jusque-là, améliorer, amplifier l'effet de THE ENGLISH DAME »). Pas de plan coté libre de la 2003 :
     le PROFIL vient du dessin de la 2004 (the-blueprints.com, 245 px/m en long, 251 en haut — étalonné sur la longueur, 4,804 m, et la
     hauteur, 1,39 m), la VUE DE DESSUS de la GTC de 2012 (même plate-forme, ramenée à 1,918 m) ; tout est recomposé à 250 px/m
     (`plans/anglaise/plan.png`) et relu en mètres du jeu : z = (628,7 − px)/250, y = (373,6 − py)/250, x = (680 − py)/250.
     Les détails (calandre maille, quatre phares ronds, feux ovales, jantes à six branches, chromes) : les photos de la 1re génération
     (Wikimedia Commons, « Bentley Continental GT (1st gen.) »). */
  const U=LPU,O=bulleOutils,L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lis=t=>t*t*(3-2*t);
  const R=.352,ZF=1.343,ZR=-1.378;
  const PAL={p:{g:'p',c:0x1a3d2a},k:{g:'m',c:0x141518},K:{g:'g',c:0x0b0c10},g:{g:'g',c:0x1c2733},c:{g:'c',c:0xeef0f3},C:{g:'c',c:0x8a9098},
    W:{g:'l',c:0xf6f2e4},w:{g:'l',c:0xd9dce0},L:{g:'l',c:0xd0182a},r:{g:'l',c:0x7e0a14},O:{g:'l',c:0xffa21a},d:{g:'m',c:0x101114},n:{g:'m',c:0x1c1d20},F:{g:'c',c:0xbfc4cb}};   // (19/10) F : le chrome du cadre de calandre, moins blanc
  // ---- LE PLAN (mètres du jeu) ----
  // le profil dans l'axe (le haut de la silhouette de côté) : bouclier, calandre, capot, pare-brise, pavillon, lunette, malle, bouclier
  const yC=z=>L([[-2.40,.62],[-2.393,.674],[-2.36,.76],[-2.313,.846],[-2.27,.93],[-2.233,.978],[-2.153,1.006],[-2.073,1.03],[-1.993,1.05],[-1.913,1.066],
    [-1.833,1.084],[-1.78,1.10],[-1.673,1.122],[-1.593,1.146],[-1.513,1.166],[-1.433,1.19],[-1.353,1.21],[-1.273,1.23],[-1.193,1.25],[-1.113,1.272],
    [-1.033,1.30],[-.953,1.326],[-.873,1.342],[-.793,1.354],[-.713,1.366],[-.633,1.372],[-.553,1.378],[-.473,1.385],[-.393,1.388],[-.313,1.39],[-.233,1.39],
    [-.153,1.386],[-.073,1.382],[.007,1.378],[.087,1.366],[.167,1.352],[.247,1.33],[.327,1.296],[.407,1.262],[.487,1.23],[.567,1.194],[.647,1.158],[.727,1.122],
    [.807,1.082],[.887,1.046],[.97,1.022],[1.047,1.016],[1.127,1.01],[1.207,1.006],[1.287,1.002],[1.367,.99],[1.447,.986],[1.527,.978],[1.607,.97],[1.687,.962],
    [1.767,.95],[1.847,.938],[1.927,.926],[2.007,.91],[2.087,.894],[2.167,.88],[2.215,.86],[2.247,.826],[2.287,.74],[2.327,.634],[2.37,.52],[2.407,.40]],z);
  // la plus grande largeur (la vue de dessus) : un rien de taille aux portières, les HANCHES au-dessus des roues arrière
  const xM=z=>L([[-2.40,.04],[-2.396,.14],[-2.385,.24],[-2.345,.328],[-2.297,.466],[-2.249,.538],[-2.201,.65],[-2.153,.736],[-2.105,.802],[-2.057,.83],[-1.961,.852],[-1.865,.87],
    [-1.769,.886],[-1.673,.904],[-1.577,.926],[-1.481,.942],[-1.385,.95],[-1.193,.95],[-1.097,.942],[-1.001,.934],[-.857,.926],[-.713,.916],[-.617,.904],
    [-.473,.912],[-.329,.916],[-.137,.92],[.055,.926],[.199,.93],[.343,.936],[.631,.938],[.727,.942],[1.0,.946],[1.4,.946],[1.591,.94],[1.687,.936],
    [1.735,.926],[1.783,.908],[1.831,.888],[1.879,.878],[1.927,.864],[1.975,.844],[2.023,.81],[2.071,.768],[2.119,.71],[2.167,.648],[2.215,.57],[2.263,.492],
    [2.311,.422],[2.359,.30],[2.395,.22],[2.403,.12],[2.407,.04]],z);   // (le nez se referme en BANDES : un bouchon faisait des éventails)
  // la hauteur de la plus grande largeur (les vues de face et de dos) : à mi-portière, plus haute aux hanches arrière
  const yM=z=>L([[-2.3,.56],[-1.9,.62],[-1.4,.62],[-1.0,.58],[-.5,.56],[.6,.56],[1.3,.58],[2.0,.56],[2.35,.52]],z);
  // la CEINTURE (le bas des vitres, côté) et sa largeur (la tôle rentre de la hanche à la vitre : la coupe des vues de face et de dos)
  const yBelt=z=>L([[-1.80,1.10],[-1.40,1.08],[-1.117,1.084],[-1.045,1.052],[-.885,1.012],[-.605,.976],[-.285,.96],[.115,.952],[.515,.94],[.70,.92],[.95,.95],[1.3,.97],[1.8,.93],[2.1,.88]],z),
        xBelt=z=>L([[-2.0,.70],[-1.6,.79],[-1.3,.80],[-1.0,.785],[-.6,.775],[0,.77],[.5,.77],[.75,.79],[1.2,.80],[1.7,.78],[2.1,.70]],z);
  // la GOUTTIÈRE (le haut des vitres : le cadre de côté, à 1,27 m au milieu) et sa largeur (la vue de face : le pavillon à 0,58)
  const yRail=z=>L([[-1.117,1.12],[-1.045,1.17],[-.925,1.20],[-.605,1.255],[-.285,1.272],[.035,1.272],[.235,1.252],[.335,1.21],[.515,1.06],[.675,.93]],z),
        xRail=z=>L([[-1.117,.62],[-.925,.60],[-.605,.585],[-.285,.58],[.035,.58],[.235,.585],[.335,.60],[.515,.64],[.675,.70]],z);
  // LE PARE-BRISE (sa base cintrée en plan : au milieu à z 0,97, au pied du montant à 0,70) et la LUNETTE (de 1,30 m à 1,10 m, z −1,04 → −1,78)
  const ZPB=.97,ZBPB=.70,ZTOIT=.25,ZLUN=-1.04,ZMALLE=-1.78;
  const xBasePB=z=>L([[.70,.70],[.78,.66],[.86,.58],[.92,.48],[.955,.36],[.97,.20]],z),yBasePB=z=>L([[.70,.93],[.80,.96],[.90,.99],[.97,1.012]],z);
  const xLun=z=>L([[-1.80,.62],[-1.60,.60],[-1.40,.585],[-1.20,.575],[-1.04,.57]],z);
  // l'avant : la crête des ailes (le phare s'y loge) et le bord du capot ; l'arrière : la crête des hanches, le bord de la malle
  const xAile=z=>L([[.97,.79],[1.3,.80],[1.7,.79],[2.0,.74],[2.15,.66]],z),xCap=z=>L([[.97,.60],[1.3,.60],[1.7,.58],[2.0,.52],[2.15,.46]],z);
  const yAileAr=z=>L([[-2.30,.90],[-2.15,.98],[-1.95,1.03],[-1.78,1.06],[-1.40,1.08],[-1.117,1.084]],z),xAileAr=z=>L([[-2.30,.62],[-2.15,.72],[-1.95,.79],[-1.6,.82],[-1.2,.81]],z),
        xMalle=z=>L([[-2.30,.50],[-2.15,.56],[-1.95,.60],[-1.78,.62]],z);
  // le dessous (le bas de caisse à 0,17 m, les boucliers plus hauts) et les passages de roue (le plan : r 0,41 devant, 0,42 derrière)
  const yBas=z=>L([[-2.40,.36],[-2.34,.27],[-2.0,.24],[-1.80,.20],[-.95,.17],[.95,.17],[1.80,.19],[2.25,.22],[2.40,.30]],z);
  const arc=(r,c)=>{const o=[];for(const t of [0,.25,.45,.6,.72,.82,.9,.96,1])o.push([+(r*Math.sin(t*Math.PI/2)).toFixed(4),+(c+r*Math.cos(t*Math.PI/2)).toFixed(4)]);o.push([r+.004,.16]);return o;};
  const ARF=arc(.395,.35),ARR=arc(.405,.35);
  const archY=(z,yb)=>Math.max(yb,U.arch(z,[ZF],ARF,yb),U.arch(z,[ZR],ARR,yb));
  // ---- LA SECTION : du bas (axe) au faîte (axe), toujours le MÊME nombre de points ----
  const bez=(a,c,b,t)=>[(1-t)*(1-t)*a[0]+2*(1-t)*t*c[0]+t*t*b[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*c[1]+t*t*b[1]];
  const brut=z=>{
    const yb=archY(z,yBas(z)),xm=xM(z),yt=yC(z),ym=Math.min(yM(z),yt-.25),s=[];
    let S,E,cuv=0;
    if(z>=ZPB){S=[Math.min(xAile(z),xm-.05),yt-L([[.97,.012],[1.6,.012],[1.9,.02],[2.1,.05],[2.2,.075]],z)];E=[xCap(z),yt-.008];cuv=1;}    // l'avant : ailes (elles descendent vers les phares), capot    // l'avant : ailes, capot
    else if(z>=ZLUN){S=[Math.min(xBelt(z),xm-.05),yBelt(z)];                                                                  // l'habitacle
      E=z>=ZBPB?[xBasePB(z),yBasePB(z)]:[xRail(z),Math.min(yRail(z),yt-.035)];}
    else if(z>=ZMALLE){S=[Math.min(mix(xAileAr(z),xBelt(z),lis(cl((z+1.30)/.26,0,1))),xm-.05),yAileAr(z)];E=[xLun(z),yt-.03];}  // la lunette entre les hanches
    else{S=[Math.min(xAileAr(z),xm-.05),Math.min(yAileAr(z),yt-L([[-2.2,.06],[-2.0,.02],[-1.78,.012]],z))];E=[xMalle(z),yt-.01];}                                // la malle
    // les raccords : l'aile avant fond dans la ceinture au pied du montant ; la ceinture dans la hanche à la custode
    const fA=lis(cl((z-ZPB)/.15,0,1));if(z>=ZPB&&fA<1)S=[mix(xBelt(z),S[0],fA),mix(yBelt(z),S[1],fA)];
    S[1]=Math.max(S[1],ym+.12);E[1]=Math.min(E[1],yt-.002);if(E[0]>S[0]-.03)E[0]=S[0]-.03;
    const xl=Math.min(xm-.10,.76);
    s.push([0,yb],[xl*.9,yb]);
    for(const t of [0,.3,.55,.78])s.push([mix(xl,xm,Math.sin(t*Math.PI/2)),mix(yb+.02,ym,t*t*(3-2*t))]);
    s.push([xm,ym]);
    // le flanc : il rentre de plus en plus vite jusqu'à la ceinture (la coupe des vues de face et de dos)
    for(const u of [.24,.48,.68,.83,.93]){const f=L([[0,0],[.24,.06],[.48,.17],[.68,.33],[.83,.55],[.93,.78],[1,1]],u);s.push([xm-(xm-S[0])*f,ym+(S[1]-ym)*u]);}
    s.push(S);
    // de l'épaule au bord : la vitre (elle rentre — la gouttière à 0,58), ou le dessus des ailes vers le capot
    {const c2=cuv?[mix(S[0],E[0],.45),Math.max(S[1],E[1])+.006]:[mix(S[0],E[0],.5)+.018,mix(S[1],E[1],.5)];for(const t of [.3,.6,.85])s.push(bez(S,c2,E,t));}
    s.push(E);
    // le bombé jusqu'à l'axe
    for(const t of [.86,.70,.52,.34,.17])s.push([t*E[0],yt-(yt-E[1])*Math.pow(t,2.2)]);
    s.push([0,yt]);
    for(let i=1;i<=12;i++)if(s[i][1]<s[i-1][1])s[i][1]=s[i-1][1];
    return s;};
  // le nez et la poupe : la dernière section complète, réduite en largeur et rognée au profil (la méthode de LA PERLE)
  const AV=2.33,AP=-2.32,S_AV=brut(AV),S_AP=brut(AP);
  const sect=z=>{if(z<=AV&&z>=AP)return brut(z);const s0=z>AV?S_AV:S_AP,kx=xM(z)/xM(z>AV?AV:AP),t=yC(z),b=yBas(z);
    if(z<AP){const b0=s0[0][1],ky=(t-b)/(s0[s0.length-1][1]-b0);return s0.map(p=>[p[0]*kx,b+(p[1]-b0)*ky]);} // (19/10) la poupe se resserre en BANDES : rognée au profil, ses points s'écrasaient sur la même hauteur et tordaient les facettes (l'éventail au-dessus du feu)
    return s0.map(p=>[p[0]*kx,Math.min(t,Math.max(b,p[1]))]);};
  const zs0=[];for(let z=-2.30;z<=2.30;z+=.10)zs0.push(+z.toFixed(3));
  for(const z of [2.33,2.36,2.38,2.395,2.403,2.407,-2.33,-2.36,-2.38,-2.385,-2.396,-2.40,ZPB,ZBPB,ZTOIT,ZLUN,ZMALLE,.78,.86,.92,.955,-1.10,-1.20,-2.275,-2.25,-2.225,-2.175,-2.15,-2.125,-2.05])zs0.push(z); // (19/10) sept tranches de plus aux hanches arrière : la poupe s'y arrondit vite en plan (0,47 → 0,80 m en 20 cm), une tranche tous les 10 cm y tordait les facettes
  for(const w of [ZF,ZR])for(const d of [.08,.17,.25,.32,.37,.40,.415,.43])zs0.push(+(w-d).toFixed(3),+(w+d).toFixed(3));
  const zs=zs0.filter(z=>z>=-2.40&&z<=2.407).sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.006);
  const PL=K.kit(PAL);PL.loft(zs,sect,(j,z)=>j<0?'p':j<=1?'k':'p');
  /* LA TÔLE DÉCOUPÉE (`bulleOutils.decoupe`, une zone = UNE vue) : les vitres sans cadre et leur joint noir, le montant fin entre la vitre de
     porte et la custode, le pare-brise et la lunette, la baguette chromée sous les vitres et celle du bas de caisse, les joints (portes,
     capot, malle) ; devant, la CALANDRE MAILLE (cadre chromé, barre verticale, losanges) et les trois prises d'air maille du bouclier ;
     derrière, les FEUX OVALES (le cœur rouge sombre, le bord) et l'encadrement de la plaque. */
  const PZ=X=>(628.7-X)/250,PY=Y=>(373.6-Y)/250;
  const PP=typeof peintPal==='function'?peintPal(PAL):PAL,GP=PP.p.g,Z=[],zo=(v,P9,k,o)=>Z.push(O.poly(P9,k,v,o));
  const miroir=P9=>P9.concat(P9.slice(1,-1).reverse().map(q=>[-q[0],q[1]]));
  const cadre=P9=>O.gonfle(miroir(P9),.022).map(q=>[Math.abs(q[0]),q[1]]);
  // côté : les vitres (le plan : le haut sur la gouttière, la custode qui finit en pointe vers la lunette)
  const DLO=[[460,141],[480,124],[500,110],[525,88],[545,72],[570,62],[620,57],[700,57],[780,62],[860,75],[893,86],[905,94],[903,101],[890,108],[850,118],[780,127],[700,131],[600,133],[500,136]].map(q=>[PZ(q[0]),PY(q[1])]);
  const vit=(x,y,z)=>y>.9;
  zo('cote',O.gonfle(DLO,.02),'K',{al:.5,ou:vit});zo('cote',DLO,'g',{al:.5,ou:vit});
  zo('cote',[[PZ(770),PY(129)],[PZ(780),PY(129)],[PZ(808),PY(64)],[PZ(798),PY(63)]],'K',{al:.5,ou:vit});                                   // le montant fin
  zo('cote',O.bande(DLO.slice(14).concat([[PZ(460),PY(141)]]).map(q=>[q[0],q[1]-.016]),.006),'c',{al:.5,ou:(x,y,z)=>y>.86&&z>-.95&&z<.72});   // la baguette chromée sous les vitres
  // les portes (leur bord avant juste derrière l'aile, l'arrière qui descend en biais), le bas de caisse chromé
  zo('cote',O.bande([[.78,.93],[.785,.70],[.775,.45],[.76,.30],[.70,.255],[-.35,.255],[-.48,.30],[-.58,.50],[-.625,.75],[-.63,.95]],.0035),'j',{al:.55,ou:(x,y,z)=>y>.24&&y<1.0});
  zo('cote',O.bande([[.80,.235],[-.88,.235]],.007),'c',{al:.55,ou:(x,y,z)=>y<.3&&z>-.95&&z<.85});
  // dessus : le pare-brise (sa base cintrée) et la lunette, cerclés de noir ; le capot (ses bords sur les ailes, son nez) ; la malle
  const PB=[[.97,0],[.97,.20],[.955,.36],[.92,.48],[.86,.58],[.78,.66],[.70,.70],[.52,.645],[.335,.60],[.25,.585],[.235,.40],[.23,0]].map(q=>[q[0],q[1]]),
        LU=[[-1.05,0],[-1.05,.40],[-1.07,.52],[-1.16,.565],[-1.40,.58],[-1.60,.595],[-1.74,.585],[-1.78,.50],[-1.785,0]];
  const cad=P9=>O.gonfle(P9.concat(P9.slice(1,-1).reverse().map(q=>[q[0],-q[1]])),.026).map(q=>[q[0],Math.abs(q[1])]);
  const pbOu=(x,y,z)=>y>.9&&z>.1&&z<1.02,luOu=(x,y,z)=>y>1.0&&z<-.95&&z>-1.85;
  zo('dessus',cad(PB),'K',{al:.3,ou:pbOu});zo('dessus',PB,'g',{al:.3,ou:pbOu});
  zo('dessus',cad(LU),'K',{al:.3,ou:luOu});zo('dessus',LU,'g',{al:.3,ou:luOu});
  zo('dessus',O.bande([[1.03,0],[1.03,.56],[1.30,.60],[1.70,.585],[2.0,.52],[2.15,.40],[2.20,.20],[2.21,0]],.0035),'j',{al:.35,ou:(x,y,z)=>z>1.0});
  zo('dessus',O.bande([[-1.83,0],[-1.83,.58],[-1.95,.60],[-2.15,.555],[-2.25,.45],[-2.29,.25],[-2.30,0]],.0035),'j',{al:.35,ou:(x,y,z)=>z<-1.8});
  // face : la CALANDRE — un rectangle aux coins ronds, le haut cintré, un cadre chromé épais, une barre verticale, la maille en losanges
  const nez=(x,y,z)=>z>2.0;
  const rr=(x0,y0,x1,y1,r,n)=>{const o=[],c=[[x1-r,y1-r,0],[x0+r,y1-r,1],[x0+r,y0+r,2],[x1-r,y0+r,3]];for(const [cx,cy,q] of c)for(let i=0;i<=(n||4);i++){const a=(q+i/(n||4))*Math.PI/2;o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return o;};
  // une ligne coupée à un rectangle (Liang-Barsky) : la maille ne déborde jamais de son cadre
  const clip=(a,b,x0,y0,x1,y1)=>{let t0=0,t1=1;const dx=b[0]-a[0],dy=b[1]-a[1];for(const [p,q] of [[-dx,a[0]-x0],[dx,x1-a[0]],[-dy,a[1]-y0],[dy,y1-a[1]]]){if(p===0){if(q<0)return null;continue;}const r=q/p;if(p<0){if(r>t1)return null;if(r>t0)t0=r;}else{if(r<t0)return null;if(r<t1)t1=r;}}return [[a[0]+t0*dx,a[1]+t0*dy],[a[0]+t1*dx,a[1]+t1*dy]];};
  const maille=(v,x0,y0,x1,y1,pas,k,w,ou)=>{const h=y1-y0;for(let x=x0-h;x<=x1+h;x+=pas)for(const s of [1,-1]){const L9=clip([x,y0],[x+s*h,y1],x0,y0,x1,y1);if(L9&&Math.hypot(L9[1][0]-L9[0][0],L9[1][1]-L9[0][1])>.01)zo(v,O.bande(L9,w),k,{al:.3,ou});}};
  const GR=rr(-.425,.505,.425,.815,.055,5).map(q=>[q[0],q[1]+.02*(1-(q[0]/.425)**2)*(q[1]>.7?1:0)]);
  const GRi=O.gonfle(GR,-.022);   // (19/10) le cadre 2,2 cm (3,4 : un tube de plastique)
  // (la calandre elle-même est un VOLUME, plus bas : son cadre chromé dépasse du nez comme sur la vraie)
  // les prises d'air du bouclier : la grande au milieu, deux sur les côtés (la maille noire)
  const bas=(x,y,z)=>z>2.1&&y<.48;
  for(const P9 of [rr(-.47,.25,.47,.37,.04,3),rr(.56,.26,.86,.41,.05,3)]){zo('face',P9,'K',{al:.3,ou:bas});}
  zo('face',rr(-.86,.26,-.56,.41,.05,3),'K',{al:.3,ou:bas});
  maille('face',-.44,.265,.44,.355,.05,'n',.003,bas);for(const s of [1,-1])maille('face',s>0?.585:-.835,.28,s>0?.835:-.585,.39,.05,'n',.003,bas);
  // dos : les FEUX OVALES (le contour, la lentille rouge, le cœur sombre) au coin, sous la ligne de la malle ; l'encadrement de la plaque
  const ov=(cx,cy,rx,ry,a,n)=>{const o=[];for(let i=0;i<(n||20);i++){const t=i/(n||20)*Math.PI*2,x=Math.cos(t)*rx,y=Math.sin(t)*ry;o.push([cx+x*Math.cos(a)-y*Math.sin(a),cy+x*Math.sin(a)+y*Math.cos(a)]);}return o;};
  const feu=(x,y,z)=>z<-2.0&&y>.6&&y<1.05;
  zo('dos',ov(.66,.84,.215,.095,.20,24),'c',{al:.25,ou:feu});zo('dos',ov(.66,.84,.20,.082,.20,24),'L',{al:.25,ou:feu});zo('dos',ov(.66,.84,.10,.04,.20,18),'r',{al:.25,ou:feu});
  zo('dos',[[-.25,.47],[.25,.47],[.25,.62],[-.25,.62]].map(q=>[q[0],q[1]]),'k',{al:.25,ou:(x,y,z)=>z<-2.2&&y<.66});
  const MEMO=(typeof SHAPES==='object'&&SHAPES.e_anglaise&&SHAPES.e_anglaise.length===1)?(SHAPES.e_anglaise._tole||(SHAPES.e_anglaise._tole={})):null;
  K.commit({ech:true,prims:[],done:()=>O.decoupe(PL.done(),GP,Z,PP,MEMO,['g'])});
  if(K.muet)return;
  // ---- LES DÉTAILS (plantés dans la tôle ou posés à plus de 2 cm : rien ne clignote) ----
  const P=K.kit(PAL);P.ech=true;
  const dansS=(s,x,y)=>{let c=false;const n=s.length;for(let i=0,j=n-1;i<n;j=i++){const a=s[i],b=s[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;},
        zAv=(x,y)=>{let a=1.95,b=2.41;if(!dansS(sect(a),x,y))return a;for(let i=0;i<16;i++){const m=(a+b)/2;if(dansS(sect(m),x,y))a=m;else b=m;}return a;},
        zAr=(x,y)=>{let a=-1.95,b=-2.41;if(!dansS(sect(a),x,y))return a;for(let i=0;i<16;i++){const m=(a+b)/2;if(dansS(sect(m),x,y))a=m;else b=m;}return a;};
  /* LES QUATRE PHARES RONDS (les photos : l'intérieur plus grand, l'extérieur plus petit, chacun dans son cerclage chromé, une optique
     ronde au centre de la glace) — chacun posé SUR la tôle (la tranche la plus en avant qui contient son centre) et tourné comme le coin. */
  P.sym(sd=>{for(const [x,y,r,dx] of [[.565,.685,.098,.16],[.79,.70,.085,.42]]){const z0=zAv(x,y),c=[sd*x,y,z0-.008],d=[sd*dx,.06,1];
      O.tour(P,'p',[[r+.012,-.10],[r+.013,-.01],[r+.010,0]],24,c,d);
      O.tour(P,'c',[[r+.010,0],[r+.011,.010],[r+.004,.020],[r-.006,.022]],24,c,d);
      O.tour(P,'C',[[r-.006,.022],[r*.80,.026],[r*.62,.030]],22,c,d);                              // la cuvette chromée du réflecteur
      O.tour(P,'W',[[r*.62,.030],[r*.50,.033]],20,c,d);                                              // l'anneau clair
      O.tour(P,'c',[[r*.50,.033],[r*.46,.040],[r*.40,.044]],18,c,d);                                 // la bague de l'optique
      O.tour(P,'C',[[r*.40,.044],[r*.30,.054],[r*.16,.060],[0,.062]],18,c,d);}});                   // l'optique ronde (chrome fumé : une lentille sombre faisait des yeux de dessin animé)
  /* LA CALANDRE MAILLE, en volume : un plan penché comme le nez (21° : le nez recule de 0,39 m par mètre de haut), posé 1,5 cm devant la
     tôle au milieu — le fond noir et le cadre chromé (un anneau extrudé) s'enfoncent dans le nez, la maille en losanges sur deux
     épaisseurs (1,6 cm d'écart : les barres se croisent sans jamais se toucher à plat), la barre verticale chromée devant. */
  {const a9=Math.atan(.39),y0=.66,z0=zAv(0,y0)+.016,forme=P9=>{const s=new THREE.Shape();P9.forEach((q,i)=>i?s.lineTo(q[0],q[1]-y0):s.moveTo(q[0],q[1]-y0));return s;};
    const ext=(sh,d,w0)=>{const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false});g.translate(0,0,w0);return g;};
    const fond=ext(forme(GRi),.14,-.15);P.put('K',fond,0,y0,z0,-a9,0,0);
    // (le cadre : une bande entre le contour et le contour rentré, ses deux parois — construite à la main, la triangulation à trou le remplissait)
    {const n=GR.length,v=[],q=(x,y,w)=>v.push(x,y-y0,w),quad=(a,b,c,d)=>{q(...a);q(...b);q(...c);q(...a);q(...c);q(...d);};
      for(let i=0;i<n;i++){const j=(i+1)%n,A=GR[i],B=GR[j],C=GRi[j],D=GRi[i];
        quad([A[0],A[1],.014],[D[0],D[1],.014],[C[0],C[1],.014],[B[0],B[1],.014]);
        quad([A[0],A[1],-.09],[A[0],A[1],.014],[B[0],B[1],.014],[B[0],B[1],-.09]);
        quad([D[0],D[1],.014],[D[0],D[1],-.09],[C[0],C[1],-.09],[C[0],C[1],.014]);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));
      const A0=GR.slice(0,3),ar=(A0[1][0]-A0[0][0])*(A0[2][1]-A0[0][1])-(A0[1][1]-A0[0][1])*(A0[2][0]-A0[0][0]);if(ar<0)g.index=null;
      if(ar<0){const p9=g.attributes.position.array;for(let k=0;k<p9.length;k+=9)for(let m=0;m<3;m++){const s=p9[k+3+m];p9[k+3+m]=p9[k+6+m];p9[k+6+m]=s;}}
      g.computeVertexNormals();P.put('F',g,0,y0,z0,-a9,0,0);}
    const vy=.79-.53,pas=.06;for(const [s9,w9] of [[1,-.004],[-1,.012]])for(let x=-.398-vy;x<=.398+vy;x+=pas){const L9=clip([x,.53],[x+s9*vy,.79],-.398,.53,.398,.79);if(!L9)continue;
      const dx=L9[1][0]-L9[0][0],dy=L9[1][1]-L9[0][1],l=Math.hypot(dx,dy);if(l<.012)continue;const g=new THREE.BoxGeometry(.007,l,.008);g.rotateZ(-Math.atan2(dx,dy));
      g.translate((L9[0][0]+L9[1][0])/2,(L9[0][1]+L9[1][1])/2-y0,w9);P.put('C',g,0,y0,z0,-a9,0,0);}
    const bar=new THREE.BoxGeometry(.016,.30,.012);bar.translate(0,.66-y0,.02);P.put('c',bar,0,y0,z0,-a9,0,0);}
  // les rétros (couleur caisse, glace noire vers l'arrière), les poignées chromées, la trappe à essence chromée sur la hanche droite
  const xTole=(z,y)=>{const s=sect(z);for(let i=1;i<=13;i++){const a=s[i-1],b=s[i];if((a[1]-y)*(b[1]-y)<=0&&a[1]!==b[1])return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);}return xM(z);};
  P.sym(sd=>{const xb=xTole(.62,.95);const g=new THREE.SphereGeometry(1,16,10),a=g.attributes.position;
    for(let i=0;i<a.count;i++){const f=v=>Math.sign(v)*Math.pow(Math.abs(v),.62);a.setXYZ(i,f(a.getX(i)),f(a.getY(i)),f(a.getZ(i)));}
    P.put('p',g,sd*(xb+.13),1.02,.60,0,sd*.12,0,.10,.055,.065);P.put('K',new THREE.PlaneGeometry(1,1),sd*(xb+.135),1.02,.534,0,Math.PI,0,.17,.085,1);
    P.box('k',.05,.04,.08,sd*(xb+.03),.985,.62);
    const xh=xTole(-.32,.84);P.box('c',.02,.026,.17,sd*(xh+.009),.84,-.32);});
  {const xf=xTole(-1.70,1.0),n=[1,-(xTole(-1.70,1.03)-xTole(-1.70,.97))/.06,-(xTole(-1.67,1.0)-xTole(-1.73,1.0))/.06];   // (19/10) la trappe POSÉE sur la hanche, tournée comme elle (un disque droit qui débordait)
    O.tour(P,'c',[[.055,-.012],[.055,.001],[.05,.005],[.02,.007],[0,.007]],16,[xf-.002,1.0,-1.70],n);}
  // les essuie-glaces couchés au pied du pare-brise
  const barre=(k,a,b,w,d)=>{const v=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),l=v.length(),g=new THREE.BoxGeometry(w,l,d);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize())));
    P.put(k,g,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);};
  for(const [x0,x1] of [[-.55,.05],[.0,.55]])barre('k',[x0,1.018,.985-Math.abs(x0)*.15],[x1,1.024,.985-Math.abs(x1)*.15],.012,.012);
  // la plaque (la vraie s'y pose : plqDessinee), dans son encadrement du bouclier arrière
  P.box('l',.42,.10,.012,0,.545,zAr(0,.545)-.012);
  K.commit(P);
  /* ---- LES ROUES : la jante de 19 pouces de la 1re génération — six branches qui se TORDENT en hélice vers la jante, une lèvre rivetée,
     le cache central sombre (sans logo) ; pneu bas ---- */
  const JW=.26,hw=JW/2,fx=hw-.02,J=lpKit({k:{g:'m',c:0x18191b},s:{g:'m',c:0xa9aeb6},c:{g:'c',c:0xe4e8ed},d:{g:'m',c:0x101114},n:{g:'m',c:0x24262b}});
  J.lathe('k',[[.245,-hw],[R*.88,-hw],[R*.98,-hw*.7],[R,-hw*.3],[R,hw*.3],[R*.98,hw*.7],[R*.88,hw],[.245,hw]],26,0,0,0,'x');
  J.lathe('c',[[.245,hw-.004],[.242,fx+.012],[.232,fx+.010],[.226,fx+.004]],30,0,0,0,'x');                    // la lèvre polie
  J.lathe('s',[[.226,fx+.004],[.222,fx-.004],[.214,fx-.006]],30,0,0,0,'x');                                     // la marche rivetée
  for(let i=0;i<12;i++){const a=i*Math.PI/6;J.box('c',.008,.008,.008,fx-.002,Math.cos(a)*.218,Math.sin(a)*.218,a,0,0);}
  J.lathe('d',[[.245,-hw+.02],[.245,fx-.06],[0,fx-.06]],20,0,0,0,'x');
  J.lathe('s',[[.07,fx-.01],[.064,fx+.008],[.052,fx+.012],[.034,fx+.013]],20,0,0,0,'x');                       // le moyeu (19/10 : argent jusqu'au petit cache)
  J.lathe('n',[[.034,fx+.013],[.02,fx+.016],[0,fx+.017]],18,0,0,0,'x');                                        // le cache sombre, petit
  for(let i=0;i<6;i++){const a=i*Math.PI/3,pt=(r,d)=>[r*Math.cos(a+d),r*Math.sin(a+d)];
    J.prism('s',[pt(.06,-.20),pt(.12,-.13),pt(.19,-.03),pt(.229,.04),pt(.229,.22),pt(.17,.17),pt(.11,.10),pt(.06,.20)],.03,fx-.012);}   // les six branches en hélice (19/10 : jusqu'à la marche de la jante, elles s'arrêtaient 1 cm avant)
  const JG=J.done();
  return {hl:[.565,.685,2.33],tl:[.66,.84,-2.32],wx:.80,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe4e8ed}};
};
