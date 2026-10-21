/* ============================================================================================
   ATCHOUM (2026-10-06, Léo : « la voiture tuning McQueen orange qui crache du feu et éternue des flammes, elle ressemble un peu à la
   cabossée ») — un STOCK-CAR de piste ovale : long capot qui plonge, pare-brise couché, toit court, lunette en pente douce, malle
   courte, gros aileron. La silhouette seulement — ni nom, ni numéro, ni regard sur le pare-brise. TUNÉ : ailes élargies au-dessus des
   roues, jupes noires, lame avant, écope de capot, aileron sur montants, pots latéraux devant les roues arrière, deux sorties sous le
   pare-chocs. CABOSSÉ comme LA HONTE : la tôle est vraiment ENFONCÉE (aile avant droite, custode gauche, capot froissé, coup de poing
   sur le toit, coin du pare-chocs — `creux`, appliqué à chaque sommet après le chantier), une PORTIÈRE GAUCHE EN APPRÊT GRIS récupérée à
   la casse, des plaques de ROUILLE, du scotch en croix sur un phare, le pare-chocs arrière de travers, un rétro rouillé. Les FLAMMES de
   hot-rod sont peintes sur les ailes avant case par case (4 cm), POSÉES SUR LA TÔLE (`peint` lit la section au point près) et enfoncées
   avec elle. Le feu qu'elle crache et ses éternuements : voir ATCH / atchTick.
   ========================================================================================== */
SHAPES.atchoum=function(K){
  ATCH.on=true;
  const U=LPU,R=.34,ZF=1.38,ZR=-1.32,ZN=2.16,ZT=-2.16;
  const P=K.kit({p:{g:'p',c:0xff9020},Y:{g:'p',c:0xffe23a,f:0},F:{g:'p',c:0xe8261a,f:0},G:{g:'s',c:0xb9bdc3},R:{g:'s',c:0x6a3216},
    k:{g:'m',c:0x141417},K:{g:'g',c:0x0c0d10},g:{g:'g',c:0x182230},c:{g:'c',c:0xd9dde3},W:{g:'l',c:0xfff1c8},L:{g:'l',c:0xff2030}});
  const bosse=d=>Math.max(0,1-d*d);
  const T=z=>U.lin([[ZT,.84],[-2.02,.93],[-1.45,.95],[-.72,1.21],[.02,1.23],[.78,.88],[1.98,.74],[ZN,.62]],z), // le DESSUS : malle, lunette, toit, pare-brise, capot
        Bt=z=>U.lin([[ZT,.80],[-1.45,.85],[.78,.84],[1.98,.70],[ZN,.57]],z),                                  // l'ÉPAULE
        XW=z=>U.lin([[ZT,.86],[-1.98,.95],[1.92,.95],[ZN,.80]],z)+.05*(bosse((z-ZF)/.62)+bosse((z-ZR)/.62)); // la demi-largeur, AILES ÉLARGIES
  const AR=[[0,2*R+.07],[R*.55,2*R+.05],[R*.92,R*1.35],[R+.11,.24]];                                         // l'arche hexagonale
  const zs=[ZT,-2.08,-2.02,-1.75,-1.45,-1.1,-.72,-.45,-.2,.02,.3,.55,.78,1.0,1.98,2.08,ZN];
  for(const w of [ZF,ZR])for(const d of [R*.55,R*.92,R+.11])zs.push(w-d,w+d);
  for(const z of [1.5,1.6,1.7,1.8,-.9,-1.0,-1.2,-.35,-.25,1.15,1.3])zs.push(z);                              // de quoi FROISSER la tôle là où elle est enfoncée
  zs.sort((a,b)=>a-b);
  const S=z=>{const yb=U.arch(z,[ZF,ZR],AR,.24),xw=XW(z),t=T(z),b=Bt(z),h=Math.max(0,t-b-.03),g=Math.min(1,h/.2);
    const y2=Math.max(yb+.03,.32),y3=Math.max(y2+.03,.55),y4=Math.max(y3+.03,b);
    return [[0,yb],[xw-.08,yb],[xw,y2],[xw+.02,y3],[xw-.03,y4],[xw-.10,y4+.03],[xw-.17-.10*g,y4+.03+h*.45],[.62-.06*g,Math.max(t-.02*g,y4+.04)],[0,Math.max(t,y4+.04)+.015]];};
  P.loft(zs,S,(j,z)=>{
    if(j<0)return 'p';
    if(j<=1)return 'k';                                                         // le dessous, la JUPE noire
    if(j<=4||z<=-1.42||z>=.76)return 'p';                                       // flancs, épaules, capot, malle
    if(j===7)return ((z>.1&&z<.74)||z<-.76)?'g':'p';                            // pare-brise, lunette ; le toit
    return (z>.66||z<-1.02||(z>-.22&&z<-.12))?'p':'g';});                       // les vitres latérales, montants de carrosserie
  // ---- CE QUI SE PEINT SUR LA TÔLE : une case de 4 cm posée SUR le flanc (la section lue au point près), décollée de 6 mm ----
  const cote=(z,y)=>{const q=S(z);if(y<q[2][1])return -1;for(let i=2;i<5;i++){const a=q[i],b=q[i+1];if(y<=b[1]){const t=(y-a[1])/((b[1]-a[1])||1);return a[0]+(b[0]-a[0])*t;}}return -1;};
  const peint=(k,sd,z0,y0,c)=>{const q=[[z0,y0],[z0+c,y0],[z0+c,y0+c],[z0,y0+c]].map(([z,y])=>{const x=cote(z,y);return x<0?null:[sd*(x+.006),y,z];});
    if(q.some(v=>!v))return;if(sd>0){P.tri(k,q[0],q[2],q[1]);P.tri(k,q[0],q[3],q[2]);}else{P.tri(k,q[0],q[1],q[2]);P.tri(k,q[0],q[2],q[3]);}};
  const LANG=[[.44,1.15],[.53,1.6],[.62,1.3],[.71,.85]];                        // quatre LANGUES de feu : hauteur au départ, longueur
  const flamme=(z,y)=>{const d=.98-z;if(d<0)return 0;let r=0;                   // nées derrière la roue avant, elles filent sur la portière · 1 = le bord rouge, 2 = le cœur jaune
    for(const [y0,Lg] of LANG){if(d>Lg)continue;const yc=y0+.12*d/Lg,u=Math.abs(y-yc)/.07;  // elle MONTE en filant vers l'arrière
      const lu=Lg*(1-Math.pow(u,1.6));if(u>=1)continue;if(d<lu)r=Math.max(r,(u<.5&&d<lu*.72)?2:1);}                      // et s'effile en pointe
    return r;};
  const rouille=[[-1,-.86,.40,.09],[-1,-1.92,.48,.07],[-1,-.3,.36,.06],[1,-1.02,.38,.08],[1,-2.0,.52,.06],[1,1.9,.40,.05]];
  for(const sd of [-1,1])for(let z=-2.1;z<2.1;z+=.04)for(let y=.30;y<.86;y+=.04){const zc=z+.02,yc=y+.02;
    if(sd<0&&zc>1.0&&zc<2.08&&yc>.30&&yc<.84){peint('G',sd,z,y,.04);continue;}  // l'AILE AVANT GAUCHE de la casse, en apprêt
    if(rouille.some(r=>r[0]===sd&&Math.hypot((zc-r[1])/r[3],(yc-r[2])/(r[3]*.8))<1+.25*Math.sin(zc*61+yc*37))){peint('R',sd,z,y,.04);continue;}
    const f=flamme(zc,yc);if(f)peint(f===2?'Y':'F',sd,z,y,.04);}
  // ---- LE NEZ : la bouche, les phares (un scotché en croix), la lame ----
  P.box('K',1.12,.15,.02,0,.41,ZN+.006);P.box('k',1.2,.03,.03,0,.335,ZN+.01);
  for(const sd of [-1,1])P.box('W',.30,.09,.02,sd*.52,.535,ZN+.008);
  P.box('c',.30,.025,.012,.52,.535,ZN+.02,0,0,.42);P.box('c',.30,.025,.012,.52,.535,ZN+.022,0,0,-.42); // le scotch
  P.box('k',1.7,.03,.26,0,.24,ZN-.03);                                          // la lame
  // ---- LE CAPOT : (2026-10-09) l'écope a laissé la place au V8 À COMPRESSEUR, posé après la tôle enfoncée (voir plus bas) ----
  // ---- LES RÉTROS (le gauche rouillé) ----
  for(const sd of [-1,1]){P.box(sd<0?'R':'p',.1,.075,.14,sd*.86,Bt(.62)+.12,.62);P.box('k',.11,.025,.04,sd*.80,Bt(.62)+.08,.62);}
  // ---- LES POTS LATÉRAUX (devant les roues arrière) et les sorties sous la poupe ----
  for(const sd of [-1,1]){P.cyl('c',.05,.52,8,sd*.97,.29,-.56,'z');P.cyl('k',.036,.524,8,sd*.97,.29,-.56,'z');
    P.cyl('c',.058,.16,8,sd*.42,.30,ZT-.05,'z');P.cyl('k',.042,.165,8,sd*.42,.30,ZT-.05,'z');}
  // ---- LA POUPE : feux, diffuseur, le pare-chocs DE TRAVERS ----
  for(const sd of [-1,1])P.box('L',.32,.085,.02,sd*.58,.66,ZT-.008);
  P.box('k',1.74,.10,.14,0,.30,ZT-.04,0,0,.06);                                // il pend d'un côté
  // ---- L'AILERON sur montants ----
  const yA=T(-1.92);
  for(const sd of [-1,1]){P.box('K',.05,.22,.08,sd*.55,yA+.11,-1.92);P.box('K',.03,.2,.40,sd*.91,yA+.24,-1.96);}
  P.box('K',1.8,.04,.34,0,yA+.24,-1.96,-.08,0,0);
  // ---- LA TÔLE ENFONCÉE : chaque sommet de la caisse (peintures comprises) poussé par les coups, puis les facettes recalculées ----
  const creux=(x,y,z,o)=>{const f=(cz,cy,r,zz,yy)=>{const d=Math.hypot((zz-cz)/r,(yy-cy)/(r*.8));return d<1?Math.pow(1-d*d,2):0;};
    o[0]=o[1]=o[2]=0;
    if(x>.3)o[0]-=.12*f(1.62,.60,.36,z,y);                                      // l'aile avant droite
    if(x<-.3)o[0]+=.10*f(-1.0,.62,.38,z,y);                                     // la custode gauche
    if(y>.7&&z>1.0&&z<1.9)o[1]-=.055*Math.max(0,1-Math.abs(z-1.45)/.45)*Math.max(0,1-Math.abs(x-.15)/.5)*(.55+.45*Math.sin(z*38)); // le capot froissé
    if(y>1.1)o[1]-=.05*f(-.3,.15,.36,z,x);                                      // le coup de poing sur le toit
    if(z<-2.0&&x<-.2&&y<.62)o[2]+=.05*Math.min(1,(-.2-x)/.6);};                // le coin de la poupe
  const fin=P.done,o9=[0,0,0];
  P.done=()=>{const gs=fin();for(const g in gs){const a=gs[g].attributes.position.array;
    for(let i=0;i<a.length;i+=3){creux(a[i],a[i+1],a[i+2],o9);a[i]+=o9[0];a[i+1]+=o9[1];a[i+2]+=o9[2];}
    gs[g].attributes.position.needsUpdate=true;gs[g].computeVertexNormals();}return gs;};
  K.commit(P);
  /* (2026-10-09, Léo, fiche de la salle blanche) « ajoute un moteur Dodge thermique sur le capot » — LE V8 À COMPRESSEUR qui SORT DU CAPOT, façon dragster américain
     (l'esprit seulement, aucune marque) : à la place de l'écope, le collecteur noir noyé dans le capot, les deux CULASSES ROUGES du V qui
     en dépassent (reniflards chromés), le CARTER DU COMPRESSEUR strié de nervures, sa courroie et ses deux poulies devant, et dessus la
     PRISE D'AIR chromée, sa gueule noire grillagée face à la route. Un kit À PART, posé APRÈS `creux` : le capot froissé ne le cabosse pas. */
  {const E=K.kit({c:{g:'c',c:0xd9dde3},G:{g:'s',c:0x9ea3ab},k:{g:'m',c:0x141417},K:{g:'g',c:0x0c0d10},F:{g:'p',c:0xd8261a,f:0}}),
     zM=1.24,yC=T(zM),yB=yC+.195,yH=yB+.11,zP=zM+.32;                          // le centre du bloc, le capot à cet endroit, le carter, la prise d'air, la façade
   E.box('k',.58,.16,.74,0,yC+.005,zM);                                        // le collecteur, noyé dans le capot (le capot penche : il dépasse plus à l'avant)
   for(const sd of [-1,1]){E.box('F',.17,.075,.64,sd*.37,yC+.02,zM,0,0,sd*.42); // les culasses du V, couchées vers l'extérieur
     for(const z of [-.18,.14])E.cyl('c',.032,.06,8,sd*.40,yC+.075,zM+z,'y');}   // les reniflards
   E.box('G',.44,.22,.60,0,yB,zM);                                              // LE CARTER DU COMPRESSEUR
   for(let i=0;i<7;i++)E.box('c',.465,.17,.018,0,yB-.005,zM-.255+i*.085);      // ses nervures
   E.cyl('c',.085,.05,12,0,yB+.02,zP,'z');E.cyl('k',.03,.055,8,0,yB+.02,zP+.003,'z'); // la poulie du haut et son moyeu
   E.cyl('c',.065,.05,12,0,yC+.10,zP+.02,'z');                                 // celle du vilebrequin
   for(const sd of [-1,1])E.box('k',.022,yB-yC-.08,.045,sd*.075,(yB+yC+.12)/2,zP+.012); // la courroie
   E.box('k',.32,.03,.44,0,yH+.015,zM);                                        // LA PRISE D'AIR : son embase
   E.box('c',.30,.13,.30,0,yH+.095,zM-.02);E.box('c',.33,.022,.33,0,yH+.17,zM-.02); // le corps chromé, sa lèvre
   E.box('K',.25,.09,.012,0,yH+.095,zM+.135);                                  // la gueule, face à la route
   for(let i=0;i<4;i++)E.box('G',.012,.085,.014,-.09+i*.06,yH+.095,zM+.142);   // sa grille
   K.commit(E);}
  return {hl:[.52,.535,ZN+.03],tl:[.58,.66,ZT-.03],wx:.82,wzF:ZF,wzR:-ZR,
          pots:[[.97,.29,-.83],[-.97,.29,-.83],[.42,.30,ZT-.14],[-.42,.30,ZT-.14]],
          lpw:{R:R,w:.26,style:'multi',jante:0x26282d,accent:0xff9020}};
};
/* LE SQUALE (2026-10-08, Léo) — HISTOIRE : né du sketch du garage de Léo (IMG_5559 : la caisse au sourire en dents de requin), d'abord
   un petit coupé carré bleu clair à la gueule calquée sur le dessin, puis (même jour, Léo, une PHOTO de grand requin blanc gueule ouverte :
   « voilà l'effet recherché, couleurs pareil, mais en mode GTR ») : LE GRAND BLANC EN GRAND TOURISME.
   · LA CAISSE : un grand coupé de sport japonais — long capot, ailes larges sur grosses roues, toit qui file vers une malle HAUTE, le coude
     de la vitre arrière (la vitre du bas va plus loin que celle du haut), quatre feux RONDS, quatre sorties, l'aileron sur la malle.
     (Aucun nom ni insigne de marque : l'esprit seulement.)
   · LES COULEURS DU REQUIN : gris ardoise dessus, plus sombre vers le dos ; VENTRE BLANC qui remonte sur les flancs et autour de la gueule
     (sur la face avant, le blanc monte en pointe vers le museau, comme sur la photo) ; gencives roses, gorge rouge sombre, dents blanches.
   · LA GUEULE OUVERTE (la grande calandre) : mâchoire du haut presque droite, celle du bas en U, coins qui remontent ; lèvre de peau blanche
     en relief ; onze dents en haut plantées dans la gencive, pointe en bas ; neuf en bas, couchées vers l'intérieur selon le U ; les plus
     grandes au milieu. Chaque dent est une pyramide à facettes (le relief).
   · LES YEUX : les phares en amande, effilés vers le nez, et dedans l'ŒIL NOIR du requin, brillant, avec son éclat.
   · Gardés du dessin et des retouches : l'aileron dorsal sur le toit, les nageoires pectorales en guise de rétros, les trois ouïes (la
     prise d'air derrière la roue avant), l'aileron arrière aux flasques en queue, le vernis dur (K.mats.p). */
SHAPES.squale=function(K){
  const U=LPU,R=.41,ZF=1.40,ZR=-1.38,ZN=2.25,ZT=-2.25;
  /* (2026-10-08, Léo : « la bouche plus ouverte, abuse encore plus — comme si la voiture était cassée, mais c'est une bouche ouverte »)
     LA MÂCHOIRE : l'avant se FEND à hauteur de bouche (YS) — tout ce qui est au-dessus et devant la charnière (ZH) se relève en pliant comme
     une tôle froissée (l'angle croît de 0 à TH vers le nez) : capot, museau, yeux, crocs du haut ; le bas (bouclier, crocs du bas) reste.
     Ce qui chevauche la fente s'ÉTIRE (la peau des joues, la gorge) et une vraie CAVITÉ (plancher, palais, joues, fond de gorge) se tend
     entre les deux mâchoires. Tout est construit fermé, puis plié d'un coup au moment de poser la caisse (voir P.done, avant K.commit). */
  const YS=.52,ZH=1.25,TH=.62;
  const SC=1.2; // (Léo : « la voiture doit être plus grosse ») TOUTE la caisse ×1,2, posée d'un coup avec le pli (fin de P.done) ; roues, phares, feux, pots suivent dans la fiche
  const P=K.kit({p:{g:'p',c:0x5e666d,grad:[0x7e868c,0x5e666d,0x41484e]},b:{g:'p',c:0xf3f2ee,f:0},n:{g:'p',c:0x2a3036,f:0},
    k:{g:'m',c:0x15171c},V:{g:'g',c:0x171d27,f:0},g:{g:'g',c:0x161c26},G:{g:'g',c:0x0b0c10},N:{g:'m',c:0x1d2126},K:{g:'m',c:0x3a0a12},J:{g:'m',c:0x120306},T:{g:'m',c:0x6e1a26},Q:{g:'m',c:0x4a1018},R:{g:'p',c:0xd8707c,f:0},d:{g:'p',c:0xf5f2ea,f:0},e:{g:'p',c:0xe2d9c4,f:0},
    W:{g:'l',c:0xfffdf7},I:{g:'g',c:0x050608},L:{g:'l',c:0xff2236},c:{g:'c',c:0xd9dde3}});
  const bosse=d=>Math.max(0,1-d*d);
  const T=z=>U.lin([[ZT,.92],[-2.18,1.02],[-1.95,1.06],[-1.55,1.09],[-1.05,1.31],[-.35,1.38],[.25,1.37],[.80,1.09],[1.0,1.08],[1.9,1.07],[2.15,1.06],[ZN,1.03]],z),
        Bt=z=>U.lin([[ZT,.86],[-1.9,1.0],[-1.3,1.0],[.8,1.02],[1.9,1.01],[ZN,.98]],z),
        XW=z=>U.lin([[ZT,.90],[-2.0,1.0],[1.95,.99],[2.05,.96],[2.13,.91],[2.20,.84],[ZN,.77]],z)+.07*(bosse((z-ZF)/.66)+bosse((z-ZR)/.66)),
        YV=z=>U.lin([[ZT,.50],[-1.0,.54],[1.0,.60],[ZN,.66]],z);                                     // la ligne du VENTRE blanc
  const AR=[[0,2*R+.08],[R*.6,2*R+.05],[R*.95,R*1.35],[R+.12,.22]];
  const zs=[ZT,-2.20,-2.18,-1.95,-1.75,-1.55,-1.30,-1.07,-1.05,-.87,-.85,-.6,-.35,-.27,-.17,.05,.25,.5,.66,.72,.80,1.0,1.3,1.6,1.9,2.0,2.05,2.10,2.13,2.17,2.20,2.225,ZN];
  for(const w of [ZF,ZR])for(const d of [R*.6,R*.95,R+.12])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const S=z=>{const yb=U.arch(z,[ZF,ZR],AR,.22),xw=XW(z),t=T(z),b=Bt(z),h=Math.max(0,t-b-.03),g=Math.min(1,h/.2),kn=Math.max(0,Math.min(1,(z-1.9)/(ZN-1.9)));
    const y2=Math.max(yb+.07,.33),y3=Math.max(y2+.03,YV(z)),y4=Math.max(y3+.03,b),ys=Math.min(y3,Math.max(y2,YS)),xs=xw-.01+.03*(ys-y2)/((y3-y2)||1);
    return [[0,yb],[xw-.11-.10*kn,yb],[xw-.01-.03*kn,y2+.03*kn],[xs,ys],[xw+.02,y3],[xw-.02-.06*kn,y4-.03*kn],[xw-.12-.14*kn,y4+.05],[xw-.21-.10*g,y4+.05+h*.62],[.60-.07*g,Math.max(t-.03*g,y4+.06)],[0,Math.max(t,y4+.06)+.015]];};
  P.loft(zs,S,(j,z)=>{
    if(j===-1)return 'X';                                                         // la face avant : posée à la main (la gueule s'ouvre au milieu)
    if(j<0)return 'p';
    if(j===0)return (z>-.30&&z<1.50)?'X':Math.abs(z-ZR)<R+.12?'k':'b';           // (Léo : « le dessous, on le voit en l'air ») le plancher = le VENTRE blanc ; sombre dans les passages arrière ; OUVERT au-dessus de la grande roue (le ventre et son puits, plus bas, le referment)
    if((j===3||j===2)&&z>ZN-.20)return 'K';                                       // (Léo : « le truc rouge, rapetisse-le : il y a de la peau, mais elle ne fait pas cette longueur ») l'intérieur rouge, court, au coin de la gueule
    if(j===3&&z>1.88)return 'p';                                                  // …derrière, la peau étirée est GRISE (la joue du requin)                                                   // (Léo : « des dents sur le côté de la mâchoire, cachées par du blanc parasite ») la peau étirée entre les mâchoires = l'INTÉRIEUR de la gueule
    if(j<=3)return 'b';                                                           // le VENTRE blanc (deux bandes : la fente passe entre elles)
    if(j<=5||z<=-1.55||z>=.80)return 'p';                                         // flancs, épaules, capot, malle
    const pil=z>-.27&&z<-.17;                                                     // le montant du milieu
    if(j===8)return ((z>.27&&z<.78)||(z<-1.07&&z>-1.53))?'V':'p';                 // pare-brise, lunette ; le toit (verre LISSE `V` : voir le pli)
    if(j===7)return (z>-.85&&z<.66&&!pil)?'V':'p';                                // la vitre, en haut… (lisse : ses grandes facettes vrillées faisaient des éclats)
    return (z>-1.05&&z<.70&&!pil)?'V':'p';});                                     // …et en bas, qui va plus loin : le COUDE de la vitre arrière (lisse aussi)
  // ---- CE QUI SE POSE SUR LE FLANC (cases lues sur la section, décollées de 6 mm) ----
  const cote=(z,y)=>{const q=S(z);if(y<q[2][1])return -1;for(let i=2;i<6;i++){const a=q[i],c=q[i+1];if(y<=c[1]){const t=(y-a[1])/((c[1]-a[1])||1);return a[0]+(c[0]-a[0])*t;}}return -1;};
  const peint=(k,sd,z0,y0,c)=>{const q=[[z0,y0],[z0+c,y0],[z0+c,y0+c],[z0,y0+c]].map(([z,y])=>{const x=cote(z,y);return x<0?null:[sd*(x+.006),y,z];});
    if(q.some(v=>!v))return;if(sd>0){P.tri(k,q[0],q[2],q[1]);P.tri(k,q[0],q[3],q[2]);}else{P.tri(k,q[0],q[1],q[2]);P.tri(k,q[0],q[2],q[3]);}};
  for(const sd of [-1,1])for(let z=.12;z<.94;z+=.03)for(let y=.46;y<.98;y+=.03){const zc=z+.015,yc=y+.015; // LES OUÏES (la prise d'air derrière la roue avant)
    for(let i=0;i<5;i++){const z0=.82-i*.12,L9=.24+i*.045,d=zc-(z0-(yc-.52)*.25);if(Math.abs(d)<.032&&yc>.52-i*.01&&yc<.52+L9){peint('n',sd,z,y,.03);break;}}}
  for(const sd of [-1,1])for(let z=-1.62;z<.80;z+=.02)peint('c',sd,z,.935,.02);  // le jonc chromé sur la ligne de caisse
  // ---- LA GUEULE (même soir, Léo : « la bouche prend sur les côtés, pas un sourire, plus comme BAPE », puis « un peu buggée ; les dents
  //      encore plus requin, nombreuses, calées, éparpillées ») : une BANDE DROITE qui fait toute la face avant, tourne le coin et file sur
  //      les flancs jusqu'à l'aile avant en s'effilant. Tout est posé SUR la caisse le long de `s` : la face avant tant que |s| ≤ XF (le bord
  //      lu sur la section), puis le flanc (`cote`), en reculant d'autant. ⚠ LE BUG DU COIN : chaque couche était décalée le long de SA
  //      normale (z sur l'avant, x sur le flanc) et elles se croisaient au coin — désormais UNE normale qui tourne en douceur sur ±6 cm
  //      autour du coin (`Nn`), la même pour toutes les couches : elles restent parallèles.
  //      LES DENTS : deux rangées, une quarantaine de crocs devant et autant de petits derrière, tailles, inclinaisons et places tirées
  //      (hasard FIXE) — calés dans une LÈVRE de gencive épaisse (5 cm de relief, cernée de noir) d'où ils sortent, comme sur la photo.
  // ⚠ (bug des « éclats en étoile ») `cote` ne lit le flanc qu'au-dessus de son chanfrein bas (il rend −1 dessous) : les crocs du bas, plus
  //   bas que lui, voyaient leurs points RETOURNÉS de l'autre côté. `cote2` suit aussi le chanfrein du bas de caisse.
  const cote2=(z,y)=>{const q=S(z);for(let i=1;i<5;i++){const a=q[i],c=q[i+1];if(y<=c[1]){if(y<a[1])return a[0];const t=(y-a[1])/((c[1]-a[1])||1);return a[0]+(c[0]-a[0])*t;}}return q[5][0];};
  const YC=.52,XF=cote2(ZN,YC),SM=XF+.18,BL=.06,GL=.058;
  const Bp=(s9,y)=>{const a=Math.abs(s9),sg=s9<0?-1:1,xe=cote2(ZN,y);if(a<=XF)return [s9*Math.min(1,xe/XF),y,ZN];const z=ZN-(a-XF);return [sg*cote2(z,y),y,z];};
  const Nn=s9=>{const a=Math.abs(s9),sg=s9<0?-1:1,t=Math.max(0,Math.min(1,(a-(XF-BL))/(2*BL))),nx=sg*t,nz=1-t,l=Math.hypot(nx,nz);return [nx/l,nz/l];};
  const srf=(s9,y,off)=>{const b=Bp(s9,y),n=Nn(s9);return [b[0]+n[0]*off,y,b[2]+n[1]*off];};
  const HB=s9=>{const a=Math.abs(s9);return a<=XF?.30:.30-.16*Math.min(1,(a-XF)/(SM-XF));}; // (« plus grande, ouverte ») du bas du bouclier jusque sous les yeux // la demi-hauteur : droite sur l'avant, effilée sur le flanc
  const st=.03,quad=(k,a,b,c,d)=>{P.tri(k,a,b,c);P.tri(k,a,c,d);};
  const bande=(k,f0,f1,off,sA,sB)=>{for(let a=sA;a<sB-1e-6;a+=st){const b=Math.min(sB,a+st);quad(k,srf(a,f0(a),off),srf(b,f0(b),off),srf(b,f1(b),off),srf(a,f1(a),off));}};
  const jupe=(k,f,off,sA,sB)=>{for(let a=sA;a<sB-1e-6;a+=st){const b=Math.min(sB,a+st);quad(k,srf(a,f(a),0),srf(b,f(b),0),srf(b,f(b),off),srf(a,f(a),off));}};
  const yH=x=>YC+HB(x),yL=x=>YC-HB(x),LV=.045;                                // (« exagère ») la lèvre JAILLIT de 9 cm
  bande('K',yL,yH,.006,-SM,-XF);bande('K',yL,yH,.006,XF,SM);                    // la gorge des commissures (elle s'étire quand la gueule s'ouvre)
  { // LA CAVITÉ, derrière la face : plancher (reste), palais (se relève), joues et fond de gorge (s'étirent entre les deux)
    const xc=XF-.03,zf=ZN+.003,zb=1.96,yF=yL(0)+GL-.006,yR=yH(0)-GL+.006,NV=6;
    quad('T',[-xc,yF,zb],[xc,yF,zb],[xc,yF,zf],[-xc,yF,zf]);                     // le plancher (la langue, les gencives du bas)
    quad('Q',[-xc,yR,zf],[xc,yR,zf],[xc,yR,zb],[-xc,yR,zb]);                     // le palais
    for(let v=0;v<NV;v++){const ya=yF+(yR-yF)*v/NV,yb9=yF+(yR-yF)*(v+1)/NV;
      quad('J',[-xc,ya,zb],[xc,ya,zb],[xc,yb9,zb],[-xc,yb9,zb]);                 // le fond de la gorge
      for(const e of [-1,1])quad('K',[e*xc,ya,zf],[e*xc,ya,zb],[e*xc,yb9,zb],[e*xc,yb9,zf]);} // les joues
  }
  // LES CROCS (sous la lèvre) : place, taille, penchant tirés au hasard FIXE
  /* L'ACTION SPÉCIALE (2026-10-20, Léo : « les dents sortent un peu avec une mécanique brusque et reviennent lentement à leur place ») :
     les crocs ne sont plus soudés à la caisse — trois kits à part (`DK` : devant, flanc gauche, flanc droit), pliés et mis à l'échelle
     comme le reste (`pliGs`), posés dans trois groupes qui GLISSENT le long de leur normale (voir après K.commit : `CAR_ACTION`). */
  const PALD={d:{g:'p',c:0xf5f2ea,f:0},e:{g:'p',c:0xe2d9c4,f:0}},DK=[K.kit(PALD),K.kit(PALD),K.kit(PALD)];
  const hh=(i,k)=>{const v=Math.sin(i*12.9898+k*78.233)*43758.5453;return v-Math.floor(v);};
  /* (2026-10-20 soir, Léo : « chaque dent doit aller un peu à l'endroit où elle est orientée, pas juste tomber vers le bas ; et le bas des
     dents apparaît invisible ») chaque croc est désormais un tétraèdre FERMÉ (le dos B0-B1-T9 aussi : ouvert, il laissait voir au travers
     dès que le croc quittait la gencive) et NOTE sa direction (de sa base vers sa pointe) et ses triangles (`Kq.dents`) : l'action le
     fait glisser le long de cette direction, chacun la sienne (voir après K.commit). */
  const croc=(Kq,k,b0,b1,t,o0,oA)=>{const mx=(b0[0]+b1[0])/2,my=(b0[1]+b1[1])/2,A=srf(mx+(t[0]-mx)*.3,my+(t[1]-my)*.3,oA),B0=srf(b0[0],b0[1],o0),B1=srf(b1[0],b1[1],o0),T9=srf(t[0],t[1],o0+.006);
    const n0=Kq.nTri||0;let nb=0;
    for(const f of [[B0,T9,A],[T9,B1,A],[B1,B0,A],[B0,B1,T9]]){const [a,b,c]=f,ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],
        nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;if(nx*nx+ny*ny+nz*nz<1e-12)continue;Kq.tri(k,a,b,c);nb++;} // (le même tri des dégénérés que le kit : les comptes restent justes)
    Kq.nTri=n0+nb;(Kq.dents||(Kq.dents=[])).push({i0:n0,n:nb,d:[T9[0]-(B0[0]+B1[0])/2,T9[1]-(B0[1]+B1[1])/2,T9[2]-(B0[2]+B1[2])/2],y:(B0[1]+B1[1])/2,z:(B0[2]+B1[2])/2});};
  const PAS=.13;
  for(let r=0;r<3;r++)for(let i=-11;i<=11;i++)for(const haut of [1,0]){        // (« exagère ») trois rangées · r=0 : les grands crocs devant · r=1 : la rangée de derrière, plus petite, entre eux
    const id=i*6+haut*3+r,big=1,c=(i+(haut?.5:0)+(r===1?.5:r===2?.25:0))*PAS+(hh(id,1)-.5)*.045;let w=(r===0?.085:r===1?.055:.035)*(.8+.45*hh(id,2))*big; // quelques ÉNORMES crocs parmi les autres
    const ec=Math.abs(c)>XF?.55+.45*HB(c)/HB(0):1;w*=ec;                        // sur le flanc la gueule s'effile ; les crocs du côté restent FRANCS (Léo : « rajoute des dents sur le côté »)
    if(Math.abs(c)+w>SM-.035||Math.abs(c)>XF)continue;                           // (le flanc a sa propre rangée, plus serrée : voir plus bas)
    if(Math.abs(Math.abs(c)-XF)<w+.03)continue;                                  // (Léo : « une dent chelou sur les côtés ») aucune dent À CHEVAL sur le coin : elle s'y pliait en deux
    const yi=haut?yH(c)-GL:yL(c)+GL,ou=yH(c)-yL(c)-2*GL,L=Math.min(ou*(r===0?(haut?.37:.29):r===1?.22:.13)*(.78+.44*hh(id,3))*big*ec,haut?yi-YS-.008:YS-yi-.008),pen=(hh(id,4)-.5)*w*(ec<1?.4:1.4); // (« ouvre un peu la bouche ») plus courts : la gueule béante entre eux — OUVERTE : les crocs du haut et du bas ne se touchent plus
    const yb=haut?yi+.022:yi-.022,yt=haut?yi-L:yi+L;
    croc(DK[0],r?'e':'d',[c-w,yb],[c+w,yb],[c+pen,yt],r===0?.012:r===1?.009:.007,r===0?.046:r===1?.034:.022);} // (« merge ») ils restent DANS la bouche
  // (Léo : « rajoute des dents sur le côté de la mâchoire ») LES CROCS DU CÔTÉ : une rangée serrée le long des deux bords du flanc, du coin
  //   jusqu'au fond de la gueule, qui raccourcissent avec elle — et une petite rangée derrière ; aucun ne passe la fente (le pli l'étirerait)
  for(const sd of [-1,1])for(let r=0;r<2;r++)for(let k=0;;k++){const c=sd*(XF+.07+(k+(r?.5:0))*.062),a=Math.abs(c);if(a>SM-.04)break;
    for(const haut of [1,0]){const id=900+k*7+haut*3+r+(sd>0?50:0),e9=HB(c)/HB(0),w=(r?.022:.034)*(.85+.3*hh(id,2))*(.7+.3*e9);
      const yi=haut?yH(c)-GL:yL(c)+GL,Lm=haut?yi-YS-.008:YS-yi-.008,L=Math.min(Lm,(r?.07:.13)*(.75+.5*hh(id,3))*(.6+.4*e9));if(L<.02)continue;
      const yb=haut?yi+.022:yi-.022,yt=haut?yi-L:yi+L,pen=-sd*w*.35;              // la pointe couchée vers le fond de la gueule
      croc(DK[sd<0?1:2],r?'e':'d',[c-w,yb],[c+w,yb],[c+pen,yt],r?.009:.012,r?.034:.046);}}
  // (Léo : « enlève les énormes, gênantes ; la compo de la bouche grande ouverte ; merge voiture ») — plus de sabres ni de crocs géants ;
  //   la bouche se FOND dans la caisse : la lèvre devient un bourrelet de PEAU (le blanc du ventre) qui sort à peine (4,5 cm), cerné d'un
  //   joint sombre affleurant comme une ligne de carrosserie, et la gencive passe EN RETRAIT derrière elle.
  const jupe2=(k,f,o0,o1,sA,sB)=>{for(let a=sA;a<sB-1e-6;a+=st){const b=Math.min(sB,a+st);quad(k,srf(a,f(a),o0),srf(b,f(b),o0),srf(b,f(b),o1),srf(a,f(a),o1));}};
  const LP=.035,GO=.022;                                                         // LP : la largeur de la lèvre · GO : la gencive, en retrait
  { // LA FACE AVANT, en deux : sous la gueule et au-dessus (le blanc du ventre monte en pointe vers le museau)
    const q=S(ZN),tour=q.concat(q.slice(1,-1).reverse().map(p=>[-p[0],p[1]]));
    const coupe=(pl,y0,y1)=>{let o=pl;for(const [lim,dess] of [[y0,1],[y1,-1]]){const r=[];for(let i=0;i<o.length;i++){const A=o[i],B=o[(i+1)%o.length],ia=(A[1]-lim)*dess>=0,ib=(B[1]-lim)*dess>=0;
      if(ia)r.push(A);if(ia!==ib){const t=(lim-A[1])/((B[1]-A[1])||1);r.push([A[0]+(B[0]-A[0])*t,lim]);}}o=r;}return o;};
    const yLo=yL(0)-LP-.012,yHo=yH(0)+LP+.012,pose=(k,pl,ep,z)=>{if(pl.length>=3)P.plate(k,pl,ep,z);};
    pose('b',coupe(tour,-9,yLo),.003,ZN);
    pose('p',coupe(tour,yHo,9),.002,ZN);pose('b',coupe(tour,yHo,.875),.003,ZN+.001);P.plate('b',[[.30,.875],[0,.925],[-.30,.875]],.003,ZN+.001);
  }
  bande('R',x=>yH(x)-GL,x=>yH(x)-.012,GO,-SM,SM);bande('R',x=>yL(x)+.012,x=>yL(x)+GL,GO,-SM,SM);
  bande('b',x=>yH(x)-.012,x=>yH(x)+LP,LV,-SM,SM);bande('b',x=>yL(x)-LP,x=>yL(x)+.012,LV,-SM,SM); // la lèvre de peau
  jupe('b',x=>yH(x)+LP,LV,-SM,SM);jupe('b',x=>yL(x)-LP,LV,-SM,SM);              // elle naît de la caisse (dehors)…
  jupe2('b',x=>yH(x)-.012,GO,LV,-SM,SM);jupe2('b',x=>yL(x)+.012,GO,LV,-SM,SM);  // …et plonge vers la gencive (dedans)
  for(const e of [-1,1]){const a=e<0?-SM-LP:SM,b=e<0?-SM:SM+LP;bande('b',x=>yL(x)-LP,x=>yH(x)+LP,LV,a,b);} // les commissures
  bande('G',x=>yH(x)+LP,x=>yH(x)+LP+.012,.003,-SM-LP,SM+LP);bande('G',x=>yL(x)-LP-.012,x=>yL(x)-LP,.003,-SM-LP,SM+LP); // le joint, affleurant
  // ---- LES YEUX : les phares en amande, effilés vers le nez, et l'ŒIL NOIR du requin ----
  for(const sd of [-1,1]){const HL=[[.38,.928],[.62,.894],[.86,.906],[.89,.98],[.70,.996],[.48,.972]].map(([x,y])=>[sd*(.50+(x-.38)/.51*.20),y]); // (« plus pointu ») les yeux sur les CÔTÉS de la tête, le rostre au milieu // (museau plus étroit) les yeux se resserrent
    const cx=sd*.60,cy=.945,gros=HL.map(([x,y])=>[cx+(x-cx)*1.12,cy+(y-cy)*1.3]);
    P.plate('G',gros,.008,ZN);P.plate('g',HL,.010,ZN+.002);                       // le boîtier noir laqué, le verre fumé
    P.plate('W',[[sd*.543,.964],[sd*.688,.969],[sd*.688,.980],[sd*.543,.975]],.008,ZN+.006); // le trait de LED, en haut
    const ell=(x,y,r,n)=>{const q=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;q.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}return q;};
    P.plate('I',ell(sd*.625,.937,.042,14),.010,ZN+.006);P.plate('W',ell(sd*.636,.951,.010,8),.006,ZN+.012);} // (« merge ») plus de sourcils : ils dépassaient du coin de la face comme des bâtons // (« encore ») le SOURCIL : une barre épaisse qui plonge vers le nez // l'œil, et son éclat
  { // (« plus pointu, comme un requin blanc ») LE ROSTRE : un nez en ogive qui part du haut de la face, au-dessus de la gueule, et s'avance de
    // 45 cm jusqu'à une pointe arrondie — dessus gris, dessous blanc (le contre-ombrage) ; il est de la mâchoire du haut (il se relève avec elle)
    const NR=12,NM=16,A=.47,B=.094,C0=.966,C1=.79,LR=.56,YN=yH(0)+.004,WF=.66,ring=t=>{const f=Math.pow(Math.max(0,1-t*t),.55),bo=Math.sin(Math.PI*Math.min(1,t*1.25)),
      z=ZN+.002+LR*t,c=C0+(C1-C0)*t,q=[];                                       // une OGIVE : elle gonfle devant la face puis s'effile ; pointée vers le bas au repos,
      // (Léo : « rejoins le nez aux lèvres, bizarrement séparés ») LE NEZ SORT DE LA LÈVRE : près de la face (`w` → 1), la moitié basse
      // de l'anneau devient un CONGÉ — du flanc du nez, la peau s'évase et descend se fondre dans la lèvre du haut (fond enfoncé à mi-hauteur
      // du bourrelet, coins étalés jusqu'à WF, sous les yeux) ; il rejoint l'ogive à 55 % de sa longueur. Le haut ne bouge pas.
      const w=1-(t<=0?0:t>=.55?1:(t/.55)*(t/.55)*(3-2*t/.55)),ax=A*f*(1+.18*bo),byE=B*f*(1+.95*bo),
        CG=[[ax,c],[ax+.04,YN+.035],[WF,YN+.008],[WF*.55,YN],[0,YN]];                // le congé, du flanc au milieu (u = 0 → 1)
      for(let m=0;m<NM;m++){const ph=m/NM*Math.PI*2,cs=Math.cos(ph),sn=Math.sin(ph);
        if(sn>=-1e-9){q.push([cs*ax,c+sn*byE,z]);continue;}
        const u=(ph<Math.PI*1.5?ph-Math.PI:Math.PI*2-ph)/(Math.PI/2)*4,i9=Math.min(3,Math.floor(u)),r9=u-i9,P0=CG[i9],P1=CG[i9+1],
          xf=P0[0]+(P1[0]-P0[0])*r9,yf=P0[1]+(P1[1]-P0[1])*r9;
        q.push([cs*ax*(1-w)+(cs<0?-1:1)*xf*w,(c+sn*byE)*(1-w)+yf*w,z]);}return q;}; // elle vise DEVANT quand la gueule s'ouvre
    let r0=ring(0);
    for(let n=1;n<=NR;n++){const r1=ring(n/NR);
      for(let m=0;m<NM;m++){const m2=(m+1)%NM,ph=(m+.5)/NM*Math.PI*2,k=Math.sin(ph)>-.15?'p':'b';
        if(n<NR)quad(k,r0[m],r0[m2],r1[m2],r1[m]);else P.tri(k,r0[m],r0[m2],r1[0]);}
      r0=r1;}
  }
  P.box('k',1.36,.035,.24,0,.18,ZN-.06);                                         // la lame sous le menton, à la largeur du museau resserré                                        // la lame sous le menton
  // ---- L'AILERON DORSAL sur le toit, couché vers l'arrière ----
  P.prism('p',[[-.10,1.35],[-.40,1.55],[-.66,1.80],[-1.06,2.08],[-.98,1.80],[-.92,1.52],[-.90,1.35]],.085,0);
  // ---- LES NAGEOIRES PECTORALES, en guise de rétros (dessus couleur caisse, dessous gris nuit) ----
  {const NG=[[.94,.98],[1.40,.38],[1.22,.46],[1.06,.51],[.94,.55]],ny=x=>1.005-(x-.94)*.36,ep=x=>.012+.07*Math.max(0,1-(x-.94)/.46); // épaisse à la racine, effilée au bout : on la lit de profil
   for(const sd of [-1,1]){const H9=NG.map(([x,z])=>[sd*x,ny(x)+ep(x)/2,z]),B9=NG.map(([x,z])=>[sd*x,ny(x)-ep(x)/2,z]);
     for(let i=1;i<NG.length-1;i++){P.tri('p',H9[0],H9[i],H9[i+1]);P.tri('n',B9[0],B9[i+1],B9[i]);}
     for(let i=0;i<NG.length;i++){const j=(i+1)%NG.length;P.tri('n',H9[i],B9[i],B9[j]);P.tri('n',H9[i],B9[j],H9[j]);}}}
  // ---- LA POUPE : quatre feux RONDS, le diffuseur, quatre sorties ----
  {const ell=(x,y,r,n)=>{const q=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;q.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}return q;};
   for(const sd of [-1,1])for(const x of [.42,.68]){P.plate('G',ell(sd*x,.83,.098,16),.008,ZT-.012);P.plate('L',ell(sd*x,.83,.074,16),.008,ZT-.018);}}
  P.box('k',1.62,.13,.14,0,.30,ZT-.04);
  for(const sd of [-1,1])for(const x of [.30,.46]){P.cyl('c',.05,.16,8,sd*x,.30,ZT-.06,'z');P.cyl('k',.036,.165,8,sd*x,.30,ZT-.06,'z');}
  // ---- L'AILERON sur la malle, ses flasques taillés en QUEUE de requin ----
  const yA=T(-2.02);
  for(const sd of [-1,1]){P.box('n',.05,.20,.08,sd*.52,yA+.10,-1.98);
    P.prism('n',[[-1.84,yA+.16],[-2.06,yA+.22],[-2.24,yA+.38],[-2.18,yA+.22],[-2.24,yA+.10],[-2.06,yA+.14]],.03,sd*.93);}
  P.box('n',1.88,.04,.32,0,yA+.22,-2.06,-.07,0,0);
  { // (Léo : « voiture à deux roues — ou une roue en dessous qu'on ne voit pas devant ; mets une petite nageoire à la place ») LA JUPE D'AILE :
    // le passage de roue avant est FERMÉ par un panneau blanc affleurant le flanc (la roue reste dessous, rentrée : `wxF`), cerné d'un
    // joint sombre, et une petite NAGEOIRE pectorale en part, couchée vers l'arrière, à la place de la roue.
    const zA=ZF-(R+.12),zB=ZF+(R+.12),yBas=z=>.07+.10*Math.pow(Math.abs(z-ZF)/(R+.12),3);let pr=null;
    for(let z=zA;z<=zB+1e-6;z+=.04){const q=S(Math.min(z,zB)),x=q[2][0]-.012,yt=q[2][1],A=[x,yBas(z),z],B=[x,yt,z],C=[x+.004,yt-.035,z],D=[x+.004,yt-.012,z];
      if(pr){for(const sd of [-1,1]){const f=p=>[sd*p[0],p[1],p[2]];P.tri('b',f(pr[0]),f(A),f(pr[1]));P.tri('b',f(A),f(B),f(pr[1]));
        P.tri('N',f(pr[2]),f(C),f(pr[3]));P.tri('N',f(C),f(D),f(pr[3]));}}pr=[A,B,C,D];}
    const NG=[[1.03,ZF+.20],[1.20,ZF+.02],[1.40,ZF-.44],[1.15,ZF-.24],[1.03,ZF-.12]],ny=x=>.42-(x-1.03)*.55,ep=x=>.012+.05*Math.max(0,1-(x-1.03)/.37);
    for(const sd of [-1,1]){const H9=NG.map(([x,z])=>[sd*x,ny(x)+ep(x)/2,z]),B9=NG.map(([x,z])=>[sd*x,ny(x)-ep(x)/2,z]);
      for(let i=1;i<NG.length-1;i++){P.tri('p',H9[0],H9[i],H9[i+1]);P.tri('b',B9[0],B9[i+1],B9[i]);}
      for(let i=0;i<NG.length;i++){const j=(i+1)%NG.length;P.tri('p',H9[i],B9[i],B9[j]);P.tri('p',H9[i],B9[j],H9[j]);}}
  }
  // (Léo : « la voiture doit être plus courte ») L'AVANT RACCOURCI : passé l'arche arrière (Z0), tout se resserre de KZ en longueur
  //   (habitacle, capot, gueule, museau), puis la caisse est recentrée (DZ) — posé avec le pli, sur chaque sommet ; roues, phares, pots suivent
  const Z0=ZR+R+.13,KZ=.75,DZ=.38,MZ=z=>(z>Z0?Z0+(z-Z0)*KZ:z)+DZ;
  { // (Léo : « remplis intelligemment l'encoche vide : quelque chose de lisse, mais en relief, une tête de requin ») LE CRÂNE :
    // entre le museau relevé et le toit, le capot plongeait en V jusqu'au pare-brise — une coque lisse le comble : le dessus de la tête du
    // requin, qui file du rostre au pavillon d'une seule ligne (le profil du croquis), une arête douce au milieu (l'échine) ; vers l'arrière
    // elle devient VITRE (le pare-brise remonte en visière sur la tête), l'échine grise filant par-dessus. Dessinée en coordonnées FINALES
    // (après le pli) : chaque sommet est DÉPLIÉ (`deplie`, point fixe) avant d'être versé — le pli le remet exactement en place.
    const s3=t=>t<=0?0:t>=1?1:t*t*(3-2*t),c01=v=>v<0?0:v>1?1:v,thz=z=>TH*s3((z-ZH)/(ZN-ZH)),
      plie=(y,z)=>{if(y<=YS||z<=ZH)return [y,z];const th=thz(z),c9=Math.cos(th),s9=Math.sin(th),dy=y-YS,dz=z-ZH;return [YS+dy*c9+dz*s9,ZH-dy*s9+dz*c9];},
      deplie=(y,z)=>{if(z<=ZH||y<=YS)return [y,z];const dy1=y-YS,dz1=z-ZH;let zz=z;
        for(let k=0;k<30;k++){const th=thz(zz);zz=ZH+dz1*Math.cos(th)+dy1*Math.sin(th);}
        const th=thz(zz);return [YS-dz1*Math.sin(th)+dy1*Math.cos(th),zz];},
      V3=(x,y,z)=>{const q=deplie(y,z);return [x,q[0],q[1]];};
    const HD=[];for(let i=0;i<=30;i++){const z=ZH+(ZN-ZH)*i/30,p=plie(T(z)-.03,z);HD.push([p[1],p[0]]);} // le capot plié, vu de profil : [z final, y final]
    const yX=(q,x)=>{for(let i=7;i<9;i++){const A=q[i],B=q[i+1];if(x>=B[0]&&x<=A[0]){const t=(x-A[0])/((B[0]-A[0])||1);return A[1]+(B[1]-A[1])*t;}}return x>q[7][0]?q[7][1]:q[9][1];};
    const Z1=.27,Z2=1.80,NA=18,
      yHaut=z=>{const u=c01((z-Z1)/(Z2-Z1));return 1.372+(1.528-1.372)*s3(u)+.045*Math.sin(Math.PI*u);},   // la ligne du crâne : du pavillon au rostre, à peine bombée
      Wd=z=>{const u=c01((z-Z1)/(Z2-Z1));return Math.max(.50+.13*s3(u),.585*(1-s3((z-.78)/.20)));}, // (Léo : « la vitre, pas très cohérent ») au-dessus de l'habitacle, le coin du pare-brise et de la vitre du haut (x .53) dépassait de 2,5 cm de chaque côté de la visière : ses facettes la perçaient en DENTS claires — le crâne s'y élargit et le couvre
      yBas=(z,x)=>z<=ZH?yX(S(z),x)-.05:U.lin(HD,z)-.08,                          // le pied : noyé dans le capot (ou le toit) au-dessous
      crete=z=>.022*s3((z-.55)/.5)*(1-s3((z-1.62)/.18));                           // l'échine, qui naît sur la visière et meurt dans le rostre
    const anneau=z=>{const W=Wd(z),yt=yHaut(z),yb=Math.min(yt-.01,yBas(z,W)),q=[];
      for(let m=0;m<=NA;m++){const a=(-14+208*m/NA)*Math.PI/180,c9=Math.cos(a),s9=Math.sin(a),x=W*Math.sign(c9)*Math.pow(Math.abs(c9),2/2.5);
        let y=yb+(yt-yb)*Math.sign(s9)*Math.pow(Math.abs(s9),2/2.5);y+=crete(z)*Math.max(0,1-Math.abs(x)/(.22*W));q.push([x,y,z]);}
      return q;};
    const zsC=[];for(let z=Z1;z<Z2-1e-6;z+=.05)zsC.push(z);zsC.push(Z2);
    let r0=anneau(zsC[0]);
    {const C=[0,(r0[NA/2][1]+yBas(Z1,0))/2,Z1];for(let m=0;m<NA;m++)P.tri('p',V3(...C),V3(...r0[m+1]),V3(...r0[m]));} // le bout arrière, fermé
    for(let i=1;i<zsC.length;i++){const r1=anneau(zsC[i]),zm=(zsC[i-1]+zsC[i])/2;
      for(let m=0;m<NA;m++){const am=-14+208*(m+.5)/NA,dos=Math.abs(am-90)<16,k=(!dos&&zm<.86)?'V':'p';
        P.tri(k,V3(...r0[m]),V3(...r1[m]),V3(...r1[m+1]));P.tri(k,V3(...r0[m]),V3(...r1[m+1]),V3(...r0[m+1]));}
      r0=r1;}
    {const C=[0,(r0[NA/2][1]+r0[0][1])/2,Z2];for(let m=0;m<NA;m++)P.tri('p',V3(...C),V3(...r0[m]),V3(...r0[m+1]));} // le bout avant, fondu dans le rostre
  }
  { // (2026-10-08, Léo : « dans l'air on voit le dessous de la voiture : fais un dessous stylé — une GRANDE ROUE, le ventre du requin, et les
    //  deux derrière ») LE DESSOUS. Dessiné en coordonnées FINALES (après le raccourci : `Zp` rend la station d'origine, le pli ne touche
    //  rien sous la fente de la gueule). D'avant en arrière, vu d'en dessous :
    //  · LE VENTRE : une coque blanche de 17 cm, d'une jupe à l'autre, du menton jusque derrière la roue, où elle remonte en douceur se
    //    fondre dans le plancher (blanc lui aussi) ; au milieu, un CANAL remonté de 10 cm (marches sombres) où la roue dépasse de 16 cm —
    //    les bords, eux, restent bas : de côté on ne la voit pas, et le menton la cache de face ;
    //  · LA GRANDE ROUE (une seule, au milieu, ×1,46, crampons, jante blanc os : `w1F`, `lpwF`), juste après le ventre, sort d'une FENTE bordée d'une
    //    lèvre de peau blanche et d'un joint sombre ; le puits qui l'abrite est BLANC comme le ventre (Léo : « pas rouge le dessous » ;
    //    la roue noire s'y découpe en ombre chinoise) et l'épouse en arche. Son haut traverse le capot DANS le crâne (creux, opaque) : la roue ne se voit que dessous.
    //    De côté, le ventre la cache : à peine 6 cm ;
    //  · la LIGNE LATÉRALE : deux filets sombres qui filent vers la queue en se resserrant ;
    //  · les NAGEOIRES PELVIENNES, couchées vers l'arrière, juste devant les roues arrière ;
    //  · entre les roues arrière, une plaque blanche (les roues dans deux poches sombres) et, au milieu, la NAGEOIRE ANALE en quille ;
    //  · au bout, le diffuseur : quatre lames sombres, la fourche de la queue.
    const Zp=zf=>{const z=zf-DZ;return z>Z0?Z0+(z-Z0)/KZ:z;},s3=t=>t<=0?0:t>=1?1:t*t*(3-2*t),q4=(k,a,b,c,d)=>{P.tri(k,a,b,c);P.tri(k,a,c,d);};
    const V=(x,y,zf)=>[x,y,Zp(zf)];
    const RW=R*1.46,ZC=.65,RA=RW+.07,WX=.52,WV=.34,XC=.66,S0=ZC-RA,S1=ZC+RA,ZV0=-.32,ZV1=-.11,ZFR=MZ(ZN-.05),YT=.235,YV0=.06,YC=.16,LW=.05,LH=.022,
      yB=zf=>YT-(YT-YV0)*s3((zf-ZV0)/(ZV1-ZV0)),xo=zf=>S(Zp(zf))[2][0]-.025,
      yC=zf=>Math.max(yB(zf),YC-(YC-YV0)*s3((zf-S1-.05)/.20));                     // LE CANAL : le milieu du ventre remonte de 10 cm autour de la roue
    const zf9=[];for(let z=ZV0;z<ZFR-1e-6;z+=.04)zf9.push(z);zf9.push(S0,S1,S1+.05,S1+.25,ZFR);zf9.sort((a,b)=>a-b);
    const ZF9=zf9.filter((z,i)=>i===0||z-zf9[i-1]>.004);
    for(let i=1;i<ZF9.length;i++){const za=ZF9[i-1],zb=ZF9[i],ya=yB(za),yb=yB(zb),ca=yC(za),cb=yC(zb),xa=xo(za),xb=xo(zb),fente=za>=S0-1e-6&&zb<=S1+1e-6;
      for(const e of [-1,1]){
        q4('b',V(e*XC,ya,za),V(e*xa,ya,za),V(e*xb,yb,zb),V(e*XC,yb,zb));                                 // les BORDS du ventre (bas : de côté, ils cachent la roue)
        if(fente)q4('b',V(e*WX,ca,za),V(e*XC,ca,za),V(e*XC,cb,zb),V(e*WX,cb,zb));                      // le canal, de part et d'autre de la fente
        else if(e>0)q4('b',V(-XC,ca,za),V(XC,ca,za),V(XC,cb,zb),V(-XC,cb,zb));                         // …ou d'un bord à l'autre
        if(ca-ya>1e-4||cb-yb>1e-4)q4('N',V(e*XC,ya,za),V(e*XC,ca,za),V(e*XC,cb,zb),V(e*XC,yb,zb));      // les marches du canal (sombres : un trait net vu d'en dessous)
        q4('b',V(e*xa,ya,za),V(e*xa,YT,za),V(e*xb,YT,zb),V(e*xb,yb,zb));}}                             // le flanc du ventre
    {const x=xo(ZFR);q4('b',V(-x,YV0,ZFR),V(x,YV0,ZFR),V(x,YT,ZFR),V(-x,YT,ZFR));}                    // le menton
    // LA FENTE : le puits en ARCHE qui épouse la roue (7 cm autour), blanc ; la lèvre de peau qui jaillit de 2 cm, le joint affleurant.
    // ⚠ le haut de l'arche passe dans la zone du PLI (au-dessus de la fente, devant la charnière) : chaque sommet y est DÉPLIÉ (point fixe,
    //   comme le crâne) pour que le pli le remette exactement autour de la roue, qui, elle, ne se plie pas.
    const thz=z=>TH*s3((z-ZH)/(ZN-ZH)),dep=(y,z)=>{if(z<=ZH||y<=YS)return [y,z];const dy1=y-YS,dz1=z-ZH;let zz=z;
        for(let k=0;k<30;k++){const th=thz(zz);zz=ZH+dz1*Math.cos(th)+dy1*Math.sin(th);}
        const th=thz(zz),y0=YS-dz1*Math.sin(th)+dy1*Math.cos(th);return y0>YS?[y0,zz]:[y,z];},
      VW=(x,y,zf)=>{const q=dep(y,Zp(zf));return [x,q[0],q[1]];};
    // la fente est large (on voit les flancs et la jante de la roue) ; au-dessus du moyeu les parois se resserrent (WV) : la voûte qui
    // perce le capot reste DANS le crâne
    const yLv=YC-LH,yA=zf=>RW+Math.sqrt(Math.max(0,RA*RA-(zf-ZC)*(zf-ZC))),NA9=22;
    for(let i=0;i<NA9;i++){const za=S0+(S1-S0)*i/NA9,zb=S0+(S1-S0)*(i+1)/NA9;
      q4('b',VW(-WV,yA(za),za),VW(WV,yA(za),za),VW(WV,yA(zb),zb),VW(-WV,yA(zb),zb));                     // la voûte
      for(const e of [-1,1]){q4('b',VW(e*WX,RW,za),VW(e*WX,RW,zb),VW(e*WV,yA(zb),zb),VW(e*WV,yA(za),za)); // les parois : en haut, elles se resserrent…
        if(i===0)q4('b',VW(e*WX,yLv,S0),VW(e*WX,yLv,S1),VW(e*WX,RW,S1),VW(e*WX,RW,S0));}}                 // …en bas, droites
    for(const z of [S0,S1])q4('b',VW(-WX,yLv,z),VW(WX,yLv,z),VW(WX,RW,z),VW(-WX,RW,z));                  // les bouts de la fente
    { // la lèvre : un cadre autour de la fente (dessous plat, biseau vers le ventre), puis le joint
      const ring=(d,y)=>[[-WX-d,S0-d],[WX+d,S0-d],[WX+d,S1+d],[-WX-d,S1+d]].map(([x,z])=>V(x,y,z));
      const A=ring(0,yLv),B=ring(LW,yLv),C=ring(LW+.02,YC-.001),D=ring(LW+.02,YC-.002),E=ring(LW+.034,YC-.002);
      for(let i=0;i<4;i++){const j=(i+1)%4;q4('b',A[i],A[j],B[j],B[i]);q4('b',B[i],B[j],C[j],C[i]);q4('G',D[i],D[j],E[j],E[i]);}}
    // LA LIGNE LATÉRALE : deux filets sombres, sur le ventre, le plancher puis la plaque arrière, qui se resserrent vers la queue
    const xl=zf=>U.lin([[-1.50,.42],[-.32,.70],[1.70,.76]],zf),yS=zf=>zf>=ZV0?yB(zf):(Math.abs(Zp(zf)-ZR)<.50?.218:.22);
    for(let z=-1.50;z<1.70-1e-6;z+=.04){const za=z,zb=Math.min(1.70,z+.04);
      for(const e of [-1,1])q4('N',V(e*(xl(za)-.011),yS(za)-.003,za),V(e*(xl(za)+.011),yS(za)-.003,za),V(e*(xl(zb)+.011),yS(zb)-.003,zb),V(e*(xl(zb)-.011),yS(zb)-.003,zb));}
    // LES NAGEOIRES : une lame triangulaire épaisse (racine A-B collée au dessous, pointe C), décollée de `ep` en x
    const fin=(k,A,B,C,ep)=>{const o=p=>[p[0]+ep,p[1],p[2]],A2=o(A),B2=o(B),C2=o(C);
      P.tri(k,A,B,C);P.tri(k,A2,C2,B2);q4(k,A,A2,B2,B);q4(k,B,B2,C2,C);q4(k,C,C2,A2,A);};
    for(const e of [-1,1])fin('p',V(e*.30,.221,-.40),V(e*.30,.221,-.74),V(e*.47,.105,-.82),-.009);       // les pelviennes, écartées
    { // entre les roues arrière : la plaque blanche, les deux poches sombres, la quille
      const zA=ZR-.50,zB=ZR+.50,XP=.62;
      q4('b',[-XP,.218,zA],[XP,.218,zA],[XP,.218,zB],[-XP,.218,zB]);
      for(let z=zA;z<zB-1e-6;z+=.04){const z2=Math.min(zB,z+.04),h=v=>U.arch(v,[ZR],AR,.22)-.005;
        for(const e of [-1,1])q4('k',[e*XP,.218,z],[e*XP,.218,z2],[e*XP,h(z2),z2],[e*XP,h(z),z]);}
      fin('p',V(-.016,.219,-1.00),V(-.016,.219,-1.40),V(-.016,.125,-1.50),.032);}                         // la nageoire anale, en quille
    for(const x of [-.40,-.16,.16,.40])fin('k',V(x-.01,.219,-1.53),V(x-.01,.219,-1.87),V(x-.01,.13,-1.87),.02); // le diffuseur : la fourche de la queue
  }
  let pliGs=null; // le pli + l'échelle, partagés avec les crocs (DK)
  { // LE PLI DE LA MÂCHOIRE : chaque sommet au-dessus de la fente et devant la charnière tourne autour de (YS, ZH), d'autant plus qu'il est près du nez
    const ss=t=>t<=0?0:t>=1?1:t*t*(3-2*t),fin=P.done;
    pliGs=gs=>{for(const k9 in gs){const a=gs[k9].attributes.position.array;
      for(let i=0;i<a.length;i+=3){const y=a[i+1],z=a[i+2];
        if(y>YS&&z>ZH){const th=TH*ss((z-ZH)/(ZN-ZH)),c9=Math.cos(th),s9=Math.sin(th),dy=y-YS,dz=z-ZH;a[i+1]=YS+dy*c9+dz*s9;a[i+2]=ZH-dy*s9+dz*c9;}
        a[i+2]=MZ(a[i+2]);a[i]*=SC;a[i+1]*=SC;a[i+2]*=SC;}
      gs[k9].attributes.position.needsUpdate=true;gs[k9].computeVertexNormals();}};
    P.done=()=>{const gs=fin();pliGs(gs);
      // (Léo : « la vitre, pas très cohérent ») LA VISIÈRE DU CRÂNE en normales LISSES : à facettes, chaque triangle vrillé de la coque
      // renvoyait le ciel à sa façon — des DENTS de reflets claires sur la vitre noire. Lissée, elle se lit comme UNE vitre. Le kit range
      // par FAMILLE (elle partage le verre des vitres) : on la reconnaît à sa teinte exacte (`V`, sans fondu). Le haut des vitres latérales,
      // le pare-brise, la lunette et les vitres du bas aussi (là où l'habitacle plonge vers le capot, leurs facettes vrillées faisaient des éclats).
      if(gs.g&&gs.g.attributes.color){const a=gs.g.attributes.position.array,n=gs.g.attributes.normal.array,cl=gs.g.attributes.color.array,M=new Map(),
          T9=[0x17/255,0x1d/255,0x27/255],est=i=>Math.abs(cl[i]-T9[0])<2e-3&&Math.abs(cl[i+1]-T9[1])<2e-3&&Math.abs(cl[i+2]-T9[2])<2e-3,
          cle=i=>Math.round(a[i]*1e4)+','+Math.round(a[i+1]*1e4)+','+Math.round(a[i+2]*1e4);
        for(let i=0;i<a.length;i+=3)if(est(i)){const c9=cle(i);let v=M.get(c9);if(!v)M.set(c9,v=[0,0,0]);v[0]+=n[i];v[1]+=n[i+1];v[2]+=n[i+2];}
        for(let i=0;i<a.length;i+=3)if(est(i)){const v=M.get(cle(i)),l=Math.hypot(v[0],v[1],v[2])||1;n[i]=v[0]/l;n[i+1]=v[1]/l;n[i+2]=v[2]/l;}
        gs.g.attributes.normal.needsUpdate=true;}
      return gs;};
  }
  K.commit(P);
  { // LES CROCS QUI SORTENT (l'action spéciale) : trois groupes — devant (glisse en +z), flanc gauche (−x), flanc droit (+x) ; au tap,
    // ils JAILLISSENT d'un coup (une mécanique, ~50 ms, avec un petit rebond de butée) de `OUT`, restent une fraction de seconde, puis
    // RENTRENT lentement, à vitesse constante (un vérin qui se referme), les derniers millimètres amortis.
    const GD=[],OUT=.10*SC,lis=t=>t*t*(3-2*t),ssq=t=>t<=0?0:t>=1?1:t*t*(3-2*t); // (Léo, même soir : « fais-les sortir plus ») 5,5 → 10 cm (×1,2)
    /* (Léo : « chaque dent va à l'endroit où elle est orientée ») CHAQUE CROC SA DIRECTION : la direction notée par `croc` (base → pointe)
       subit le même pli que ses sommets (la rotation de la mâchoire à la hauteur de sa base, puis l'étirement MZ en z), puis chaque sommet
       du croc glisse de `OUT × k` le long d'elle — les crocs du haut descendent dans la gueule, ceux du bas montent, ceux des flancs
       suivent leur penchant. Positions de repos gardées (`P0`), direction par sommet (`DIR`), récrites seulement quand k bouge. */
    const SOM=[]; // [{att, P0, DIR}] par géométrie
    for(let q=0;q<3;q++){const gs=DK[q].done();pliGs(gs);const g=K.add(new THREE.Group());
      for(const k in gs){const m=new THREE.Mesh(gs[k],(K.mats&&K.mats[k])||(typeof lpMat==='function'?lpMat(k):null));m.userData.lp=1;g.add(m);
        const att=gs[k].attributes.position,P0=Float32Array.from(att.array),DIR=new Float32Array(att.array.length);
        for(const t of (DK[q].dents||[])){let [dx,dy,dz]=t.d;
          if(t.y>YS&&t.z>ZH){const th=TH*ssq((t.z-ZH)/(ZN-ZH)),c9=Math.cos(th),s9=Math.sin(th),vy=dy*c9+dz*s9,vz=-dy*s9+dz*c9;dy=vy;dz=vz;} // le pli de la mâchoire
          if(t.z>Z0)dz*=KZ;                                                                                                          // l'étirement MZ
          const l=Math.hypot(dx,dy,dz)||1;dx/=l;dy/=l;dz/=l;
          for(let i=t.i0*9;i<Math.min(DIR.length,(t.i0+t.n)*9);i+=3){DIR[i]=dx;DIR[i+1]=dy;DIR[i+2]=dz;}}
        SOM.push({att:att,P0:P0,DIR:DIR});}
      GD.push(g);}
    let k=0,tA=-1;const anime=dt=>{dt=Math.min(dt||0,.1);if(tA>=0){tA+=dt;
        if(tA<.05)k=tA/.05;                              // la sortie : sèche
        else if(tA<.14)k=1+.12*Math.sin((tA-.05)/.09*Math.PI); // la butée : un petit rebond
        else if(tA<.38)k=1;                              // tenues dehors
        else{const u=(tA-.38)/1.6;k=u>=1?0:1-(u<.85?u/.85*.9:.9+.1*lis((u-.85)/.15));if(u>=1)tA=-1;}} // le retour : lent, régulier, amorti sur la fin
      else k=0;
      if(k!==anime.k9){anime.k9=k;const o=OUT*k;for(const S of SOM){const a=S.att.array,P0=S.P0,D=S.DIR;for(let i=0;i<a.length;i++)a[i]=P0[i]+D[i]*o;S.att.needsUpdate=true;}}};
    const action=()=>{tA=0;try{if(typeof sfx==='function')sfx('squale.crocs');}catch(_){}return true;}; // (Léo : « clac mécanique quand ça sort ») le son de la session SON, cuit dans la banque
    anime(0);GD[0].userData.anime=anime;GD[0].userData.action=action;
    if(typeof CAR_ACTION!=='undefined')CAR_ACTION=action;
    if(typeof BLING==='object'&&BLING&&BLING.anim)BLING.anim.push(anime);}
  // LE VERNIS : dur et franc, sur la matière de cette caisse seulement (K.mats)
  {const mP=K.mats&&K.mats.p;if(mP){mP.shininess=86;mP.specular.setHex(0x8c8c8c);mP.reflectivity=.36;
    if(mP.userData.uG)mP.userData.uG.value=.035;if(mP.userData.uV)mP.userData.uV.value.set(.40,1.8,3,.30);}}
  return {hl:[.70*SC,.937*SC,MZ(ZN+.03)*SC],tl:[.55*SC,.83*SC,MZ(ZT-.03)*SC],lamps:0,pipes:0,halos:0, // les yeux SONT les phares : ni boîte blanche ni halo devant eux
          wx:.88*SC,w1F:1,wRF:1.46,wzF:.65*SC,wzR:-MZ(ZR)*SC,lpwF:{crampons:1,bande:0xe9e4da,jante:0xe9e4da,accent:0xe9e4da},                  // UNE grande roue avant, au milieu, sous le ventre (voir LE DESSOUS)
          pots:[[.30,.30,MZ(ZT-.14)],[-.30,.30,MZ(ZT-.14)],[.46,.30,MZ(ZT-.14)],[-.46,.30,MZ(ZT-.14)]].map(q=>q.map(v=>v*SC)),
          lpw:{R:R*SC,w:.36*SC,style:'rayons',n:6,jante:0x2b2e34,accent:0x2b2e34}};
};
const CAR_VIEUX=[]; // les matières de la caisse d'avant : libérées à la construction suivante
/* LA CAISSE NE DÉTRUIT PLUS SES PROGRAMMES (2026-09-28, chasse aux gels) — three DÉTRUIT un programme quand la dernière matière qui s'en
   sert est libérée. Le sursis d'une construction (`CAR_VIEUX`) suffisait tant que la caisse était DESSINÉE entre deux constructions ; le
   studio photo en enchaîne deux sans dessin (la caisse photographiée, puis la tienne) : MESURÉ, chaque photo tuait les programmes de ta
   caisse (5 recompilés à l'image suivante) et les siens (4 recompilés à la photo suivante), et au JOUER la 1re image de course recompilait
   ceux que le garage avait tués. Désormais la 1re matière vue de chaque programme n'est jamais libérée (`CAR_GARDE`, comme `ENG_GARDE`
   pour les moteurs) : un programme de caisse compilé une fois l'est pour la session. Coût : une poignée de matières gardées. */
const CAR_GARDE=new Map();
function carGarde(m){ // vrai si `m` est la 1re matière vue d'un de ses programmes : elle reste en vie, et le programme avec elle
  const pp=renderer.properties.get(m).programs;if(!pp)return false;
  let g=false;for(const k of pp.keys())if(!CAR_GARDE.has(k)){CAR_GARDE.set(k,m);g=true;}
  return g;}
