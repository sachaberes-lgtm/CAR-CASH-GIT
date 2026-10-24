// <<< fin SHAPES.bulle (RONDES) >>>
// · · ·
// · · ·
// · · ·
// <<< SHAPES.cinq (RONDES) >>>
SHAPES.cinq=function(K){
  /* LA 500 « 1957 » (2026-10-18, discussion RONDES — Léo a envoyé la photo d'une 500 de 2007 en finition « 1957 Edition » : bleu ciel pâle,
     TOIT BLANC, coques de rétro blanches, moustache et baguettes chromées, phares ronds + antibrouillards ronds, jantes rétro couleur caisse
     à large cercle crème, moyeu chromé — pas de logo chez nous). Tout vient du PLAN COTÉ de la 500 (2007-2015, 4 vues, 154,67 unités par
     mètre, étalon : l'empattement de 2,30 m), relevé en mètres dans le repère du jeu (x à droite, y en haut, z vers l'avant, z = 0 au milieu
     de la longueur). Une seule coque (la 500 est un œuf) en loft, la tôle DÉCOUPÉE au plan (`bulleOutils.decoupe`). */
  const U=LPU,O=bulleOutils,L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lis=t=>t*t*(3-2*t);
  const R=.29,ZF=1.072,ZR=-1.228;
  const PAL={p:{g:'p',c:0x8eb2df},C:{g:'c',c:0x8a9098},R:{g:'p',c:0xf3f1ea,f:0},w:{g:'p',c:0xf0e8d2,f:0},k:{g:'m',c:0x161719},K:{g:'g',c:0x0c0d10},c:{g:'c',c:0xe2e6eb},
    g:{g:'g',c:0x182330},W:{g:'l',c:0xf6f4ec},L:{g:'l',c:0xd0182a},r:{g:'l',c:0x7a0d18},O:{g:'l',c:0xffa21a},d:{g:'m',c:0x101114}};
  // ---- LES COURBES DU PLAN (mètres) ----
  // le dessus dans l'axe (côté) : la jupe arrière, le hayon, le becquet, le pavillon, le pare-brise, le capot, le nez
  const yTop=z=>L([[-1.752,.40],[-1.745,.47],[-1.72,.60],[-1.709,.668],[-1.69,.734],[-1.617,.869],[-1.60,.922],[-1.543,.956],[-1.526,.973],[-1.40,1.115],[-1.30,1.227],
    [-1.20,1.338],[-1.164,1.378],[-1.15,1.43],[-1.139,1.452],[-.986,1.461],[-.827,1.476],[-.663,1.489],[-.452,1.495],[-.204,1.49],[-.004,1.471],[.113,1.451],[.216,1.427],
    [.273,1.41],[.322,1.388],[.612,1.229],[.843,1.085],[1.017,.964],[1.10,.963],[1.169,.949],[1.385,.89],[1.517,.837],[1.585,.79],[1.654,.71],[1.70,.68],[1.738,.617],
    [1.763,.567],[1.778,.50],[1.795,.44],[1.805,.38],[1.81,.33]],z);
  const yBas=z=>L([[-1.752,.30],[-1.72,.24],[-1.62,.22],[-1.50,.205],[-.95,.20],[.74,.18],[1.46,.18],[1.73,.192],[1.78,.24],[1.81,.27]],z);
  // la plus grande largeur (dessus), à ~0,6 m du sol (face et dos)
  const xM=z=>L([[-1.752,.04],[-1.745,.152],[-1.72,.452],[-1.705,.525],[-1.68,.609],[-1.656,.668],[-1.625,.722],[-1.582,.767],[-1.539,.792],[-1.49,.804],[-1.39,.813],[-.964,.818],
    [1.082,.822],[1.345,.813],[1.407,.802],[1.443,.79],[1.571,.712],[1.676,.623],[1.709,.585],[1.729,.553],[1.765,.46],[1.792,.312],[1.803,.174],[1.81,.04]],z),
        yM=z=>L([[-1.75,.55],[-1.6,.66],[-1.3,.64],[1.2,.60],[1.6,.56],[1.81,.42]],z);
  // le PLI D'ÉPAULE (côté : 181 ; dessus : 89) qui court du feu au phare, et sa suite sur l'aile avant
  const xS=z=>L([[-1.62,.40],[-1.55,.48],[-1.435,.572],[-1.348,.622],[-1.195,.675],[-1.048,.711],[-.867,.736],[-.624,.755],[-.236,.772],[.136,.779],[.477,.78],[1.05,.776],[1.30,.74],[1.45,.67],[1.57,.58],[1.68,.46],[1.76,.30],[1.81,.03]],z),
        yS=z=>L([[-1.62,.89],[-1.543,.94],[-1.473,.937],[1.051,.807],[1.221,.788],[1.45,.747],[1.60,.70],[1.70,.64],[1.81,.52]],z);
  // la CEINTURE (le bas du cadre des vitres : côté 140, dessus 116)
  const yB=z=>L([[-1.30,1.10],[-1.07,1.052],[-.897,1.037],[-.349,1.011],[.472,.954],[.80,.95],[.95,.93]],z),
        xB=z=>L([[-1.30,.62],[-1.026,.674],[-.922,.685],[-.586,.707],[-.102,.731],[.216,.74],[.738,.732],[.95,.72]],z);
  // le BORD DU PAVILLON (dessus : 53 ; côté : 160) — devant, le montant du pare-brise ; derrière, le bord du hayon qui descend
  const xR=z=>L([[-1.62,.30],[-1.519,.40],[-1.448,.546],[-1.319,.539],[-1.109,.512],[-.961,.504],[-.454,.507],[-.14,.517],[.099,.533],[.246,.549],[.553,.614],[.935,.677],[1.0,.70]],z),
        yR=z=>L([[-1.62,.89],[-1.475,.937],[-1.295,1.129],[-1.144,1.275],[-1.057,1.345],[-.971,1.39],[-.852,1.425],[-.706,1.444],[-.419,1.454],[-.191,1.451],[-.028,1.435],
          [.132,1.408],[.248,1.378],[.345,1.338],[.482,1.258],[.716,1.098],[.837,1.008],[.95,.94],[1.03,.90]],z);
  // le CAPOT (coquille) : son bord (dessus : 75 ; côté : 161), jusqu'au nez (dessus : 131)
  // (le bord avant de la coquille ne rentre PAS dans la tôle : il est un joint découpé au plan ; la tôle, elle, plonge en douceur vers le
  // bouclier — le bord du capot qui rentrait vers l'axe en 7 cm froissait les tranches du nez)
  const xH=z=>L([[.95,.76],[1.094,.741],[1.333,.695],[1.40,.676],[1.473,.649],[1.55,.60],[1.62,.545],[1.68,.475],[1.75,.37],[1.81,.03]],z),
        yH=z=>L([[.95,.965],[1.051,.965],[1.132,.958],[1.301,.915],[1.412,.881],[1.495,.848],[1.562,.809],[1.60,.776],[1.667,.72],[1.72,.66],[1.81,.50]],z);
  const AR=[[0,.66],[.15,.64],[.25,.59],[.32,.51],[.355,.41],[.372,.30],[.38,.19]];
  // ---- LA COQUE : une section par tranche, 22 points du bas (axe) au faîte (axe) ----
  const NS=22;
  const brut=z=>{
    const yb0=yBas(z),yb=Math.max(yb0,U.arch(z,[ZF,ZR],AR,yb0)),yt=yTop(z),s=[];
    const hk=lis(cl((z-.98)/.12,0,1)),fk=lis(cl((z-1.60)/.10,0,1)),rk=lis(cl((-1.06-z)/.14,0,1));
    let xm=xM(z),ym=Math.min(yM(z),yt-.06),xs=Math.min(xS(z),xm-.012),ys=Math.min(yS(z),yt-.03);
    let xb=Math.min(xB(z),xs-.01),yb2=Math.min(yB(z),yt-.02),xr=Math.min(xR(z),xb-.02),yr=Math.min(yR(z),yt-.004);
    // derrière la vitre de custode : le panneau plein monte jusqu'au bord du hayon
    if(rk>0){yb2=mix(yb2,Math.max(ys+.02,yr-.04),rk);xb=mix(xb,Math.max(xr+.02,(xs+xr)/2),rk);}
    // le capot : la ceinture et le bord du pavillon se posent sur le bord du capot
    if(hk>0){const xh=Math.min(xH(z),xs-.005),yh=Math.max(Math.min(yH(z),yt-.004),ys+.005);xb=mix(xb,xh,hk);yb2=mix(yb2,yh,hk);xr=mix(xr,xh*.99,hk);yr=mix(yr,yh+.001,hk);}
    yb2=Math.max(yb2,ys+.006);yr=Math.max(yr,yb2+.002);
    const xl=Math.min(xm-.08,.74),yl=Math.max(yb,yb0+.02);
    s.push([0,yb],[xl*.9,yb],[xl,Math.min(yl+.02,ym-.01)]);
    for(const t of [.35,.7])s.push([mix(xl,xm,Math.sin(t*Math.PI/2)),mix(yl+.02,ym,t)]);
    s.push([xm,ym]);
    for(const t of [.4,.75])s.push([mix(xm,xs,Math.pow(t,1.6)),mix(ym,ys,t)]);
    s.push([xs,ys],[mix(xs,xb,.55),mix(ys,yb2,.5)],[xb,yb2]);
    for(const t of [.33,.66])s.push([mix(xb,xr,t)+.012*Math.sin(t*Math.PI),mix(yb2,yr,t)]);
    s.push([xr,yr]);
    const p=mix(mix(3.2,2.3,hk),2.6,rk);
    for(const t of [.88,.72,.54,.36,.18])s.push([t*xr,yt-(yt-yr)*Math.pow(t,p)]);
    s.push([0,yt]);
    for(let i=1;i<s.length-1;i++)if(s[i][1]<s[i-1][1]-.0001)s[i][1]=s[i-1][1];
    return s;};
  /* LE NEZ ET LA POUPE ARRONDIS (la méthode de LA PERLE) : au-delà de AV et en deçà de AP, la dernière section complète est RÉDUITE en
     largeur (la plus grande largeur du plan, vue de dessus) et ROGNÉE au profil (haut et bas vus de côté) — rétrécies point par point, les
     tranches finissaient en pointe et le bouclier se pinçait en losange. */
  const AV=1.68,AP=-1.62,S_AV=brut(AV),S_AP=brut(AP);
  const sect=z=>{if(z<=AV&&z>=AP)return brut(z);const s0=z>AV?S_AV:S_AP,kx=xM(z)/xM(z>AV?AV:AP),t=yTop(z),b=yBas(z);
    return s0.map(p=>[p[0]*kx,Math.min(t,Math.max(b,p[1]))]);};
  const zs0=[-1.752,-1.745,-1.735,-1.72,-1.705,-1.69,-1.67,-1.645,-1.617,-1.60,-1.57,-1.543,-1.526,-1.48,-1.43,-1.38,-1.33,-1.28,-1.23,-1.18,-1.15,-1.139,-1.10,-1.06,-1.0,
    -.94,-.86,-.78,-.70,-.62,-.54,-.46,-.38,-.30,-.20,-.10,0,.10,.20,.27,.322,.40,.48,.56,.64,.72,.80,.87,.93,.98,1.017,1.06,1.10,1.17,1.24,1.31,1.385,1.45,1.517,
    1.56,1.60,1.63,1.654,1.68,1.70,1.72,1.738,1.752,1.765,1.778,1.79,1.80,1.81];
  for(let z=1.40;z<1.81;z+=.025)zs0.push(+z.toFixed(3));for(let z=-1.75;z<-1.50;z+=.025)zs0.push(+z.toFixed(3));
  for(const w of [ZF,ZR])for(const d of [.15,.25,.32,.355,.372,.38])zs0.push(+(w-d).toFixed(3),+(w+d).toFixed(3));
  const zs=zs0.sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.004);
  const PL=K.kit(PAL);PL.loft(zs,sect,(j,z)=>j<0?'p':j<=1?'k':'p');
  /* LA TÔLE DÉCOUPÉE AU PLAN : vitres et leur cadre noir, le montant central noir, la custode ; la baguette chromée de porte ; la coquille du
     capot, la porte, le hayon (joints) ; devant, les phares ronds et les antibrouillards cerclés de chrome, la MOUSTACHE, la baguette du bas,
     la bouche ; derrière, les feux (rouges, l'îlot couleur caisse au milieu), la poignée chromée du hayon, la lunette ; le TOIT BLANC. */
  const PP=typeof peintPal==='function'?peintPal(PAL):PAL,GP=PP.p.g,Z=[],zo=(v,P9,k,o)=>Z.push(O.poly(P9,k,v,o));
  const DLO=[[.454,.977],[-.351,1.032],[-.858,1.056],[-1.043,1.07],[-1.052,1.086],[-1.045,1.103],[-.992,1.176],[-.945,1.229],[-.868,1.292],[-.774,1.338],[-.673,1.365],[-.541,1.381],
    [-.371,1.385],[-.186,1.38],[.027,1.36],[.149,1.341],[.239,1.312],[.337,1.263],[.58,1.107],[.765,.966],[.765,.962],[.751,.96],[.533,.972]],
    CADRE=[[.472,.954],[-.349,1.011],[-.897,1.037],[-1.051,1.047],[-1.07,1.052],[-1.082,1.067],[-1.077,1.091],[-1.031,1.162],[-.981,1.224],[-.938,1.265],[-.895,1.299],[-.848,1.328],
    [-.794,1.353],[-.688,1.383],[-.565,1.40],[-.371,1.407],[-.181,1.401],[.037,1.38],[.179,1.355],[.286,1.314],[.425,1.235],[.636,1.094],[.767,.994],[.807,.956],[.802,.943],[.767,.94],[.543,.95]],
    CUS=[[-.592,1.322],[-.589,1.268],[-.605,1.13],[-.617,1.094],[-.639,1.072],[-.676,1.063],[-.749,1.063],[-.954,1.078],[-.98,1.084],[-.992,1.093],[-.996,1.108],[-.992,1.127],
    [-.968,1.166],[-.892,1.243],[-.826,1.291],[-.756,1.322],[-.669,1.342],[-.612,1.344],[-.598,1.336]],
    PORTE=[[.636,.964],[.655,.905],[.664,.852],[.672,.623],[.669,.503],[.658,.38],[.646,.307],[.632,.284],[.591,.277],[.467,.278],[-.203,.302],[-.319,.309],[-.383,.324],[-.422,.341],
    [-.458,.365],[-.486,.391],[-.51,.421],[-.536,.481],[-.552,.589],[-.563,.774],[-.562,.914],[-.549,.978],[-.522,1.042],[-.482,1.381]],
    JONC=[[.557,.411],[.564,.42],[.567,.435],[.563,.442],[.548,.446],[-.723,.499],[-.742,.497],[-.749,.489],[-.745,.474],[-.731,.451],[-.706,.443],[.538,.408]],
    HAYON=[[-1.149,1.401],[-1.171,1.369],[-1.357,1.167],[-1.527,.971],[-1.551,.951],[-1.599,.926],[-1.608,.886],[-1.692,.729],[-1.698,.687]],
    FEUC=[[-1.446,.936],[-1.437,.919],[-1.451,.887],[-1.569,.744],[-1.607,.718],[-1.661,.711],[-1.671,.714],[-1.675,.721],[-1.671,.747],[-1.577,.89],[-1.541,.924],[-1.512,.934],[-1.485,.938]];
  const vit=(x,y,z)=>y>.9;
  zo('cote',CADRE,'K',{al:.45,ou:vit});zo('cote',DLO,'g',{al:.45,ou:vit});
  zo('cote',[[.528,.95],[.546,.95],[.546,1.16],[.528,1.16]],'K',{al:.45,ou:vit});                                    // la barre noire du déflecteur (le trait 174 du plan), le rétro dessous
  zo('cote',[[-.605,1.035],[-.415,1.025],[-.415,1.41],[-.605,1.41]],'K',{al:.45,ou:vit});zo('cote',CUS,'g',{al:.45,ou:vit});   // le montant central NOIR, puis la custode
  zo('cote',JONC,'c',{al:.55,ou:(x,y,z)=>z>-.8&&z<.6});                                                                 // la baguette chromée de porte
  zo('cote',O.bande(PORTE,.0035),'j',{al:.55});zo('cote',O.bande(HAYON,.0035),'j',{al:.45,ou:(x,y,z)=>z<-1.1});
  zo('cote',FEUC,'L',{al:.62,ou:(x,y,z)=>z<-1.4});                                                                      // le feu qui tourne sur le flanc
  /* LA COQUILLE DU CAPOT, retracée sur la photo de 3/4 avant (Léo : « les traits noirs se mélangent un peu ») : UN seul trait de chaque côté
     — il descend du pied du montant de pare-brise (le trait 160 du plan, dans le prolongement du montant), rejoint le PLI D'ÉPAULE et le suit
     jusque sous le phare (côté) ; devant, UN seul trait entre les phares (face) ; derrière, la grille d'auvent noire sous les essuie-glaces
     (dessus). Plus de bord de capot tracé dans deux vues à la fois : les deux traits ne tombaient pas au même endroit et se croisaient. */
  zo('cote',O.bande([[.842,1.004],[.90,.955],[.97,.896],[1.03,.846],[1.099,.803],[1.221,.788],[1.33,.768],[1.45,.744],[1.53,.722],[1.60,.70],[1.65,.672]],.0035),'j',{al:.3,ou:(x,y,z)=>z>.8&&y>.6});
  zo('dessus',[[.955,0],[.955,.30],[.945,.48],[.925,.58],[.965,.58],[1.002,.48],[1.02,.30],[1.026,0]],'K',{al:.5,ou:(x,y,z)=>z>.85&&z<1.1&&y>.9});
  // le TOIT BLANC (le pavillon et le becquet)
  zo('dessus',[[.305,0],[.305,.66],[-1.03,.66],[-1.045,.507],[-1.073,.383],[-1.09,.268],[-1.103,.129],[-1.106,0]],'R',{al:0,ou:(x,y,z)=>y>yR(z)-.003&&y>1.25});   // (le BORD DU PAVILLON est un point de chaque section : la limite tombe sur une arête, sans dents)
  // face : pare-brise, phares, antibrouillards, moustache, baguette, bouche, clignotants
  const PBR=[[0,1.339],[.038,1.344],[.073,1.39],[.094,1.397],[.354,1.385],[.469,1.369],[.51,1.358],[.529,1.345],[.543,1.327],[.561,1.276],[.60,1.094],[.599,1.063],[.591,1.037],[.576,1.019],[.556,1.008],[.471,.999],[0,.999]],
        pare=(x,y,z)=>z>.3&&y>.95,avant=(x,y,z)=>z>1.3;
  zo('face',O.gonfle(PBR.concat(PBR.slice(1,-1).reverse().map(p=>[-p[0],p[1]])),.022).map(p=>[Math.abs(p[0]),p[1]]),'K',{al:.3,ou:pare});zo('face',PBR,'g',{al:.3,ou:pare});
  zo('face',[[0,.625],[.278,.626],[.333,.629],[.343,.633],[.335,.641],[.309,.644],[0,.644]],'c',{al:.3,ou:avant});   // la MOUSTACHE : les deux lames reliées par UNE barre chromée (Léo : « une barre de fer au lieu du logo »)
  zo('face',O.bande([[0,.553],[.30,.555],[.362,.556],[.374,.548],[.36,.532],[.342,.523]],.0065),'c',{al:.3,ou:avant});      // la baguette du bas (le « sourire »)
  zo('face',[[0,.394],[.495,.404],[.527,.394],[.536,.381],[.538,.362],[.53,.328],[.51,.304],[.48,.288],[.438,.281],[0,.27]],'K',{al:.3,ou:avant});
  zo('face',[[.544,.387],[.694,.394],[.709,.392],[.714,.382],[.698,.367],[.666,.354],[.544,.336]],'O',{al:.3,ou:avant});
  zo('face',O.bande([[0,.745],[.468,.745]],.0035),'j',{al:.3,ou:(x,y,z)=>z>1.55});                                  // le bord avant de la coquille (le plan, vu de face)
  // dos : lunette, joint du hayon, feux (l'îlot couleur caisse), poignée chromée, catadioptres, 3e feu stop
  const LUN=[[0,1.134],[.07,1.132],[.11,1.111],[.129,1.106],[.377,1.109],[.411,1.115],[.429,1.13],[.438,1.155],[.426,1.313],[.406,1.336],[.364,1.355],[.307,1.369],[.242,1.375],[.192,1.373],[.133,1.353],[.091,1.348],[0,1.348]],
        arr=(x,y,z)=>z<-1.3;
  zo('dos',O.gonfle(LUN.concat(LUN.slice(1,-1).reverse().map(p=>[-p[0],p[1]])),.02).map(p=>[Math.abs(p[0]),p[1]]),'K',{al:.25,ou:(x,y,z)=>z<-1.0&&y>1.05});zo('dos',LUN,'g',{al:.25,ou:(x,y,z)=>z<-1.0&&y>1.05});
  zo('dos',[[.602,.941],[.63,.928],[.645,.902],[.669,.765],[.667,.742],[.652,.73],[.625,.725],[.525,.72],[.463,.724],[.50,.80],[.54,.90],[.57,.935]],'L',{al:.26,ou:arr});
  zo('dos',[[.623,.796],[.616,.858],[.608,.883],[.581,.898],[.566,.898],[.552,.892],[.542,.879],[.537,.861],[.528,.796],[.531,.777],[.555,.765],[.597,.764],[.618,.774]],'p',{al:.26,ou:arr});   // (19/10) le feu vu de dos mord jusqu'au coin (al ,42 → ,26) : entre lui et le feu du flanc, des facettes n'étaient à personne — le feu cassé en morceaux
  zo('dos',O.bande([[0,.888],[.117,.879],[.237,.881]],.007),'c',{al:.25,ou:arr});
  zo('dos',O.bande([[0,.956],[.302,.952],[.597,.942],[.682,.932],[.76,.911]],.0035),'j',{al:.25,ou:arr});
  zo('dos',O.bande([[0,.449],[.622,.453],[.715,.457],[.785,.468]],.007),'c',{al:.3,ou:arr});                         // la baguette chromée du bouclier (la finition)
  zo('dos',[[.507,.346],[.653,.347],[.668,.351],[.679,.362],[.475,.413],[.467,.403],[.477,.374],[.49,.355]],'r',{al:.25,ou:arr});
  zo('dos',[[0,1.385],[.07,1.385],[.07,1.395],[0,1.395]],'L',{al:.2,ou:(x,y,z)=>z<-1.0&&y>1.3});
  const MEMO=(typeof SHAPES==='object'&&SHAPES.cinq&&SHAPES.cinq.length===1)?(SHAPES.cinq._tole||(SHAPES.cinq._tole={})):null;
  K.commit({ech:true,prims:[],done:()=>O.decoupe(PL.done(),GP,Z,PP,MEMO,['g'])});
  // ---- LES DÉTAILS ----
  const P=K.kit(PAL);P.ech=true;
  // une barre de section w × d tendue de a à b (le pied du rétro, les bras d'essuie-glace)
  const barre=(k,a,b,w,d)=>{const v=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),l=v.length(),g=new THREE.BoxGeometry(w,l,d);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize())));
    P.put(k,g,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);};
  /* les RÉTROS, à leur place du plan (côté 171-173, face, dessus : la coque de z ,41 à ,55, de x ,75 à ,955, de y 1,01 à 1,12) et des
     photos : une COQUE BLANCHE en savon (un carré aux coins ronds, plus haute au bout), la glace vers l'arrière, et le PIED noir qui sort de
     la porte SOUS la ceinture (le trait 173) et monte vers la coque — l'œuf posé sur la vitre flottait. */
  const coque=sd=>{const g=new THREE.SphereGeometry(1,16,10),a=g.attributes.position;
    for(let i=0;i<a.count;i++){let x=a.getX(i),y=a.getY(i),z=a.getZ(i);const f=v=>Math.sign(v)*Math.pow(Math.abs(v),.55);x=f(x);y=f(y);z=f(z);
      y*=.80+.20*(x+1)/2;a.setXYZ(i,sd*x,y,z);}
    if(sd<0)g.index.array.reverse();g.computeVertexNormals();return g;};
  P.sym(sd=>{P.put('R',coque(sd),sd*.852,1.066,.482,0,0,0,.103,.054,.066);
    P.put('g',new THREE.PlaneGeometry(1,1),sd*.858,1.066,.414,0,Math.PI,0,.17,.078,1);
    barre('k',[sd*.80,1.03,.50],[sd*.748,.895,.548],.042,.032);});
  // les ESSUIE-GLACES couchés au pied du pare-brise, sur la grille d'auvent (la photo)
  for(const [x0,y0,x1,y1] of [[-.47,.978,.04,.995],[.0,.995,.44,.982]])barre('k',[x0,y0,.986],[x1,y1,.974],.012,.012);
  // LES PHARES RONDS et les ANTIBROUILLARDS : cerclage chromé, glace bombée, réflecteur — chacun tourné comme sa face du plan
  // (vu de dessus, l'optique est en biais à ~40° : elle regarde devant ET dehors, sur le coin arrondi du nez)
  // (le centre de chaque optique est posé SUR la tôle : la tranche la plus en avant dont la section contient le point)
  const dansS=(s,x,y)=>{let c=false;const n=s.length;for(let i=0,j=n-1;i<n;j=i++){const a=s[i],b=s[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;},
        zAvant=(x,y)=>{for(let z=1.81;z>.9;z-=.003)if(dansS(sect(z),x,y))return z;return 1.5;};
  const zPh=zAvant(.565,.702),zAb=zAvant(.618,.53);
  P.sym(sd=>{const ph=[sd*.565,.702,zPh-.012],dp=[sd*.60,.08,.80],ab=[sd*.618,.53,zAb-.008],da=[sd*.55,.0,.84];
    O.tour(P,'c',[[.105,-.03],[.106,0],[.099,.014],[.084,.019],[.078,.014]],22,ph,dp);O.tour(P,'C',[[.078,.006],[.03,.0],[.02,-.01]],18,ph,dp);
    O.tour(P,'W',[[.078,.014],[.066,.024],[.04,.03],[0,.033]],22,ph,dp);   // (19/10) la glace d'un seul verre : le cache chromé du milieu renvoyait le ciel en point bleu (un œil)
    O.tour(P,'c',[[.068,-.025],[.069,0],[.063,.011],[.05,.015]],18,ab,da);O.tour(P,'W',[[.05,.012],[.04,.02],[0,.025]],18,ab,da);});
  // les POIGNÉES chromées
  P.sym(sd=>P.box('c',.016,.03,.21,sd*.785,.826,-.42));
  // l'ANTENNE, au fond du pavillon
  P.put('k',new THREE.CylinderGeometry(.005,.012,.22,6),0,1.57,-.92,-.25,0,0);
  // la plaque dessinée : la vraie s'y pose (voir plqDessinee)
  P.box('l',.42,.105,.012,0,.825,-1.725,.2,0,0);
  // les passages de roue : une joue sombre derrière chaque roue
  const joue=w=>{const o=[[w-.38,.18]];for(let k=0;k<=12;k++){const a=Math.PI*k/12;o.push([w-Math.cos(a)*.38,.20+Math.sin(a)*.45]);}o.push([w+.38,.18]);return o;};
  P.sym(sd=>{P.prism('d',joue(ZF),.02,sd*.60);P.prism('d',joue(ZR),.02,sd*.60);});
  K.commit(P);
  /* ---- LES ROUES : la jante « 1957 » vue de près (la photo) — un pneu à flanc bas, au bord de la jante un LARGE CERCLE CRÈME bombé,
     une gorge sombre, le grand DISQUE couleur caisse légèrement creusé, l'embase du moyeu couleur caisse en relief avec ses quatre
     crans, et le MOYEU CHROMÉ bombé (sans logo) ---- */
  const JW=.185,hw=JW/2,fx=hw-.02,cJ=PP.p.c!=null?PP.p.c:PAL.p.c,J=lpKit({k:{g:'m',c:0x18191b},w:{g:'p',c:0xf0e8d2,f:0},p:{g:'p',c:cJ,f:0},c:{g:'c',c:0xe4e8ed},d:{g:'m',c:0x101114}});
  J.lathe('k',[[.214,-hw],[R*.86,-hw],[R*.97,-hw*.72],[R,-hw*.3],[R,hw*.3],[R*.97,hw*.72],[R*.86,hw],[.214,hw]],24,0,0,0,'x');
  J.lathe('w',[[.216,hw-.002],[.212,fx+.012],[.200,fx+.016],[.188,fx+.012],[.184,fx+.006]],28,0,0,0,'x');   // le cercle crème, bombé
  J.lathe('d',[[.184,fx+.006],[.180,fx-.002],[.176,fx]],28,0,0,0,'x');                                       // la gorge
  J.lathe('p',[[.176,fx],[.15,fx+.002],[.128,fx+.005]],24,0,0,0,'x');                                         // le disque couleur caisse
  J.lathe('p',[[.128,fx+.005],[.126,fx+.016],[.104,fx+.019]],24,0,0,0,'x');                                     // l'embase du moyeu
  J.lathe('d',[[.128,fx+.005],[.131,fx+.004],[.134,fx+.005]],24,0,0,0,'x');                                  // l'ombre au pied de l'embase
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;J.box('p',.016,.03,.042,fx+.012,Math.cos(a)*.14,Math.sin(a)*.14,a,0,0);   // ses quatre crans
    for(const s of [-1,1]){const b=a+s*.19;J.box('d',.008,.022,.012,fx+.008,Math.cos(b)*.14,Math.sin(b)*.14,b,0,0);}}
  J.lathe('d',[[.214,-hw+.02],[.214,fx-.04],[0,fx-.04]],20,0,0,0,'x');
  J.lathe('c',[[.104,fx+.019],[.10,fx+.028],[.088,fx+.037],[.066,fx+.043],[.036,fx+.047],[0,fx+.048]],22,0,0,0,'x');   // le moyeu chromé bombé (sans logo)
  const JG=J.done();
  return {hl:[.56,.70,1.66],tl:[.60,.82,-1.68],wx:.70,wzF:ZF,wzR:-ZR,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe4e8ed}};
};
ECH_POTS.cinq={p:[{t:'rond',r:.032,ev:1.2,k:'c',pts:[[-.418,.255,-1.765]]}]}; // (2026-10-18, LA DOLCE VITA) une seule sortie, à gauche sous le bouclier (le plan)
Object.assign(I18N,{"LA DOLCE VITA":"LA DOLCE VITA",
 "Toit blanc, robe céleste, moustache chromée. Elle se gare dans un mouchoir de poche, et elle repart avec le mouchoir.":"White roof, sky-blue dress, chrome moustache. She parks on a handkerchief, and drives off with the handkerchief."});
// <<< fin SHAPES.cinq (RONDES) >>>
// · · ·
// · · ·
// · · ·
// <<< SHAPES.robin (RONDES) >>>
SHAPES.robin=function(K){
  /* LA RELIANT ROBIN Mk1 (2026-10-18, discussion RONDES — « la trois-roues anglaise, une roue AVANT, la Mk1 des années 70, fibre de verre »).
     Pas de plan vectoriel libre : la coque vient du plan de the-blueprints.com (côté et dessus, raster, étalonné sur l'EMPATTEMENT de
     2,159 m — 170 px/m), relu à la grille en mètres du repère du jeu (x à droite, y en haut, z vers l'avant), les cotes officielles de la Mk1
     (3,33 × 1,42 × 1,37 m) et les photos de Mk1 de Wikimedia Commons pour le nez et la poupe (phares ronds, calandre à lames, pare-chocs
     chromés fins, feux rectangulaires — le plan est celui d'une Robin plus tardive, à pare-chocs enveloppants). */
  const U=LPU,O=bulleOutils,L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lis=t=>t*t*(3-2*t);
  const R=.265,ZF=1.294,ZR=-.865;
  const PAL={p:{g:'p',c:0x2289dc},k:{g:'m',c:0x161719},K:{g:'g',c:0x0c0d10},c:{g:'c',c:0xe2e6eb},C:{g:'c',c:0x8a9098},g:{g:'g',c:0x182330},
    W:{g:'l',c:0xf6f2e4},L:{g:'l',c:0xd0182a},O:{g:'l',c:0xff9a1a},d:{g:'m',c:0x101114},s:{g:'s',c:0x2a2b30}};
  // ---- LES COURBES DU PLAN (mètres) ----
  // (la poupe de la Mk1 : 8 cm plus courte que le plan — une Robin plus tardive — et la lunette-hayon plus couchée, comme sur les photos)
  const yTop=z=>L([[-1.645,.40],[-1.635,.62],[-1.626,.80],[-1.52,.985],[-1.42,1.14],[-1.32,1.27],[-1.25,1.325],[-1.18,1.347],[.07,1.347],[.15,1.336],[.245,1.32],
    [.40,1.18],[.55,1.04],[.618,.975],[.667,.93],[.775,.90],[1.01,.863],[1.30,.815],[1.598,.77],[1.67,.752],[1.696,.74],[1.712,.70],[1.722,.60],[1.725,.45]],z);
  const yBas=z=>L([[-1.645,.33],[-1.60,.31],[-1.46,.30],[-1.25,.24],[-.52,.19],[1.05,.24],[1.50,.28],[1.725,.32]],z);
  const xM=z=>L([[-1.645,.04],[-1.6435,.24],[-1.64,.42],[-1.636,.58],[-1.62,.655],[-1.58,.69],[-1.52,.705],[-1.32,.71],[0,.71],[.50,.69],[1.0,.675],[1.50,.66],[1.62,.648],[1.68,.62],[1.70,.585],[1.714,.50],[1.72,.40],[1.7235,.24],[1.725,.04]],z);   // (les faces avant et arrière, planes, se referment en bandes : un bouchon rogné se chevauchait)
  // la ceinture (le bas des vitres) et le bord du pavillon ; derrière, le bord du hayon qui descend ; devant, le bord du capot
  const yBelt=z=>L([[-1.62,.80],[-1.47,.86],[-1.36,.90],[.60,.90],[.70,.89],[1.0,.86],[1.40,.81],[1.70,.75]],z),
        xR=z=>L([[-1.62,.58],[-1.32,.60],[-1.20,.60],[.10,.585],[.245,.555],[.40,.575],[.618,.62],[.70,.63]],z),
        yR=z=>L([[-1.626,.79],[-1.52,.975],[-1.42,1.125],[-1.32,1.25],[-1.20,1.305],[.10,1.305],[.245,1.29],[.40,1.15],[.55,1.01],[.618,.95],[.68,.90]],z);
  // la roue AVANT, seule, au milieu : un tunnel au fond de la caisse ; les roues arrière dans des passages découpés dans les flancs
  const ARF=[[0,.60],[.15,.58],[.24,.52],[.29,.44],[.31,.34],[.32,.22]],ARR=[[0,.59],[.15,.565],[.22,.52],[.27,.45],[.30,.36],[.31,.24]];
  const NS=20;
  const brut=z=>{
    const yb=yBas(z),yt=yTop(z),xm=xM(z),s=[];
    const ybA=U.arch(z,[ZR],ARR,yb),ybT=U.arch(z,[ZF],ARF,yb);         // passage arrière (flancs), tunnel avant (axe)
    const hk=lis(cl((z-.62)/.10,0,1)),rk=lis(cl((-1.30-z)/.10,0,1));
    let yc=Math.min(.71,yt-.06),xbt=xm-.025,ybt=Math.min(yBelt(z),yt-.03),xr=Math.min(xR(z),xbt-.02),yr=Math.min(yR(z),yt-.006);
    if(hk>0){const xh=xm-.07,yh=yt-.035;xr=mix(xr,xh,hk);yr=mix(yr,yh,hk);xbt=mix(xbt,xm-.03,hk);ybt=Math.min(mix(ybt,yh-.02,hk),yh-.012);}
    yr=Math.max(yr,ybt+.008);yc=Math.min(yc,ybt-.02);
    if(rk>0)xr=mix(xr,xbt-.21*(yr-ybt),rk);   // le montant du hayon garde la pente des vitres : il ne se couche pas en corniche vers la poupe
    const xl=xm-.05;
    s.push([0,ybT],[.17,ybT],[.21,Math.max(yb,Math.min(ybT,yb+.06))],[xl,ybA],[xm-.018,Math.max(ybA+.06,yb+.08)]);
    s.push([xm,Math.max(ybA+.12,.42)],[xm,Math.max(ybA+.14,.58)],[xm,yc],[xm-.008,mix(yc,ybt,.5)],[xbt,ybt]);
    for(const t of [.35,.7])s.push([mix(xbt,xr,t),mix(ybt,yr,t)]);
    s.push([xr,yr]);
    for(const t of [.93,.80,.55,.28])s.push([t*xr,yt-(yt-yr)*Math.pow(t,6)]);
    s.push([0,yt]);
    for(let i=1;i<s.length-1;i++)if(s[i][1]<s[i-1][1]-.0001&&i>3)s[i][1]=s[i-1][1];
    return s;};
  // le nez et la poupe : la dernière section complète, réduite en largeur et rognée au profil (la méthode de LA PERLE)
  const AV=1.66,AP=-1.58,S_AV=brut(AV),S_AP=brut(AP);
  const sect=z=>{if(z<=AV&&z>=AP)return brut(z);const s0=z>AV?S_AV:S_AP,kx=xM(z)/xM(z>AV?AV:AP),t=yTop(z),b=yBas(z);
    return s0.map(p=>[p[0]*kx,Math.min(t,Math.max(b,p[1]))]);};
  const zs0=[-1.645,-1.64,-1.634,-1.626,-1.61,-1.595,-1.58,-1.52,-1.42,-1.32,-1.25,-1.18,-1.10,-1.00,-.90,-.80,-.70,-.60,-.50,
    -.40,-.30,-.20,-.10,0,.07,.15,.245,.32,.40,.48,.55,.618,.667,.72,.775,.85,.93,1.01,1.10,1.20,1.30,1.40,1.50,1.56,1.60,1.63,1.66,1.68,1.696,1.705,1.712,1.718,1.72,1.722,1.7235,1.725,-1.6435,-1.642];
  for(const w of [ZF,ZR])for(const d of [.15,.24,.29,.31,.32])zs0.push(+(w-d).toFixed(3),+(w+d).toFixed(3));
  const zs=zs0.sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.001);
  const PL=K.kit(PAL);PL.loft(zs,sect,(j,z)=>j<0?'p':j<=1?'k':'p');
  /* LA TÔLE DÉCOUPÉE AU PLAN (côté et dessus) et aux photos (nez, poupe) : vitres et joints caoutchouc noirs, pare-brise, lunette-hayon,
     portes, capot ; devant, la calandre à lames et les clignotants ; derrière, les feux rectangulaires. */
  const PP=typeof peintPal==='function'?peintPal(PAL):PAL,GP=PP.p.g,Z=[],zo=(v,P9,k,o)=>Z.push(O.poly(P9,k,v,o));
  const VPOR=[[.484,.984],[.108,1.282],[-.343,1.282],[-.32,.896],[.484,.896]],
        VCUS=[[-.461,1.263],[-1.15,1.263],[-1.20,1.245],[-1.33,1.004],[-1.32,.93],[-1.29,.916],[-.47,.916]];
  const vit=(x,y,z)=>y>.86;
  for(const W9 of [VPOR,VCUS]){zo('cote',O.gonfle(W9,.018),'K',{al:.5,ou:vit});zo('cote',W9,'g',{al:.5,ou:vit});}
  for(const J9 of [[[.667,.885],[.69,.75],[.71,.60],[.725,.45],[.735,.30],[.735,.25]],[[-.39,1.30],[-.37,.90],[-.35,.25]],[[.74,.255],[-.36,.25]]])
    zo('cote',O.bande(J9,.0035),'j',{al:.6});
  const PBR=[[.635,0],[.635,.555],[.625,.585],[.60,.595],[.33,.555],[.255,.53],[.235,.50],[.235,0]],pbr=(x,y,z)=>z>.19&&z<.71&&y>.88;   // le pare-brise (vu de dessus)
  zo('dessus',[[.685,0],[.685,.575],[.66,.612],[.60,.625],[.32,.585],[.235,.558],[.212,.52],[.212,0]],'K',{al:.35,ou:pbr});zo('dessus',PBR,'g',{al:.35,ou:pbr});
  zo('dessus',O.bande([[.78,0],[.78,.57],[1.33,.57],[1.33,0]],.0035),'j',{al:.4,ou:(x,y,z)=>z>.7});                                        // le capot
  // la lunette-HAYON (vue de dos : les photos) et son joint
  const LUN=[[0,1.27],[.42,1.26],[.52,1.22],[.56,1.12],[.57,.94],[.55,.86],[.48,.83],[0,.83]];
  zo('dos',O.gonfle(LUN.concat(LUN.slice(1,-1).reverse().map(p=>[-p[0],p[1]])),.02).map(p=>[Math.abs(p[0]),p[1]]),'K',{al:.3,ou:(x,y,z)=>z<-1.2&&y>.78});
  zo('dos',LUN,'g',{al:.3,ou:(x,y,z)=>z<-1.2&&y>.78});
  zo('dos',[[.40,.68],[.66,.68],[.66,.58],[.40,.58]],'L',{al:.3,ou:(x,y,z)=>z<-1.42});zo('dos',[[.56,.68],[.66,.68],[.66,.58],[.56,.58]],'O',{al:.3,ou:(x,y,z)=>z<-1.42});
  zo('dos',O.bande([[0,.72],[.62,.72]],.0035),'j',{al:.3,ou:(x,y,z)=>z<-1.42});
  // le nez (les photos) : la calandre noire à lames chromées entre les phares, les clignotants sous les phares
  const nez=(x,y,z)=>z>1.55;
  zo('face',[[0,.52],[.31,.52],[.31,.615],[0,.615]],'K',{al:.4,ou:nez});
  for(const y9 of [.545,.567,.589])zo('face',O.bande([[0,y9],[.30,y9]],.0045),'c',{al:.4,ou:nez});
  zo('face',[[.38,.445],[.52,.445],[.52,.475],[.38,.475]],'O',{al:.4,ou:nez});
  const MEMO=(typeof SHAPES==='object'&&SHAPES.robin&&SHAPES.robin.length===1)?(SHAPES.robin._tole||(SHAPES.robin._tole={})):null;
  K.commit({ech:true,prims:[],done:()=>O.decoupe(PL.done(),GP,Z,PP,MEMO,['g'])});
  // ---- LES DÉTAILS ----
  const P=K.kit(PAL);P.ech=true;
  const dansS=(s,x,y)=>{let c=false;const n=s.length;for(let i=0,j=n-1;i<n;j=i++){const a=s[i],b=s[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;},
        // (la tôle la plus en avant / en arrière qui contient le point : par dichotomie entre une tranche pleine et le bout)
        zBout=(x,y,s)=>{let a=s*1.15,b=s>0?1.7255:-1.6455;if(!dansS(sect(a),x,y)){for(let z=b;s*z>s*a;z-=s*.005)if(dansS(sect(z),x,y))return z;return s*1.6;} /* (19/10) au milieu, le tunnel de la roue avant laisse un vide à z 1,15 : on cherche alors depuis le bout (le pare-chocs était coupé en deux) */for(let i=0;i<16;i++){const m=(a+b)/2;if(dansS(sect(m),x,y))a=m;else b=m;}return a;},
        zAvant=(x,y)=>zBout(x,y,1),zArriere=(x,y)=>zBout(x,y,-1);
  // LES PHARES RONDS cerclés de chrome, aux coins du nez
  P.sym(sd=>{const z9=zAvant(.47,.57),c=[sd*.47,.57,z9-.006],d=[sd*.18,.04,1];
    O.tour(P,'c',[[.095,-.03],[.097,0],[.09,.014],[.077,.019],[.071,.014]],22,c,d);O.tour(P,'W',[[.071,.014],[.06,.024],[.035,.03],[0,.032]],22,c,d);});
  // LES PARE-CHOCS : une lame chromée fine devant et derrière (la Mk1), qui tourne un peu sur les coins
  const LAME=[[-.01,-.03],[.012,-.03],[.022,-.018],[.024,0],[.022,.018],[.012,.03],[-.01,.03]];
  {const av=[],ar=[];for(let i=0;i<=12;i++){const x=-.60+1.2*i/12,zf=zAvant(Math.min(.58,Math.abs(x)),.41),zr=zArriere(Math.min(.60,Math.abs(x)),.41);av.push([x,.41,zf+.012]);ar.unshift([x,.41,zr-.012]);}
   O.tube(P,'c',av,LAME,true);O.tube(P,'c',ar,LAME,true);}
  // les RÉTROS (petits, noirs, sur les portes), les POIGNÉES chromées, les ESSUIE-GLACES
  P.sym(sd=>{bulleOutils.tube(P,'k',[[sd*.712,.855,.50],[sd*.745,.905,.495]],[[.011,0],[0,.011],[-.011,0],[0,-.011]],true);P.lathe('k',[[0,.015],[.04,.015],[.046,.005],[.046,-.007],[.04,-.013],[0,-.013]],12,sd*.755,.945,.49,'z');P.cyl('g',.035,.004,12,sd*.755,.945,.476,'z');P.box('c',.016,.022,.13,sd*.718,.82,-.27);   // (19/10) le rétro : une tête ronde sur son bras (deux boîtes avant)
    P.box('k',.30,.012,.014,sd*.20,.985,.60,-.6,0,sd*.12);});
  // les passages de roue arrière : une joue sombre ; le tunnel de la roue avant : deux joues
  const joue=(w,r,y0)=>{const o=[[w-r,y0]];for(let k=0;k<=12;k++){const a=Math.PI*k/12;o.push([w-Math.cos(a)*r,y0+.02+Math.sin(a)*(r+.04)]);}o.push([w+r,y0]);return o;};
  P.sym(sd=>{P.prism('d',joue(ZR,.32,.20),.02,sd*.50);P.prism('d',joue(ZF,.32,.22),.02,sd*.12);});
  P.box('l',.33,.08,.012,0,.56,-1.642,0,0,0);   // la plaque dessinée (la vraie s'y pose)
  K.commit(P);
  // ---- LES ROUES : jantes tôle de 10 pouces argent, petit enjoliveur chromé ; la roue AVANT, seule au milieu, a sa jante des deux côtés ----
  const JW=.14,hw=JW/2,fx=hw-.018,J=lpKit({k:{g:'m',c:0x18191b},a:{g:'s',c:0xb9bec6},c:{g:'c',c:0xe4e8ed},d:{g:'m',c:0x101114}});
  J.lathe('k',[[.135,-hw],[R*.84,-hw],[R*.96,-hw*.72],[R,-hw*.3],[R,hw*.3],[R*.96,hw*.72],[R*.84,hw],[.135,hw]],22,0,0,0,'x');
  J.lathe('d',[[.135,-hw+.015],[.135,-(fx-.03)],[0,-(fx-.03)]],18,0,0,0,'x');
  for(const e of [1,-1]){J.lathe('a',[[.135,e*(hw-.004)],[.128,e*(fx+.004)],[.075,e*fx]],20,0,0,0,'x');J.lathe('c',[[.075,e*fx],[.065,e*(fx+.014)],[.035,e*(fx+.02)],[0,e*(fx+.022)]],16,0,0,0,'x');}
  const JG=J.done();
  return {hl:[.47,.57,1.72],tl:[.55,.63,-1.64],wx:.62,wzF:ZF,wzR:-ZR,w1F:1,
          roueDeco:(w,sx,sz)=>{if(sz>0&&sx<0)return;for(const g in JG){const m=new THREE.Mesh(JG[g],K.mats[g]||K.mats.c);m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xe4e8ed}};
};
ECH_POTS.robin={p:[{t:'rond',r:.022,ev:1.25,k:'c',pts:[[.36,.24,-1.635]]}]}; // (2026-10-18, LE ROUGE-GORGE) une sortie, à droite sous la lame arrière
Object.assign(I18N,{"LE ROUGE-GORGE":"THE REDBREAST",
 "Trois roues, de la fibre de verre et une confiance aveugle. Dans les virages, elle penche ; toi, tu pries.":"Three wheels, fibreglass and blind faith. In the corners she leans; you pray."});
