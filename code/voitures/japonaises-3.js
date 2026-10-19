// <<< SHAPES.mx5na (JAPONAISES) — fin >>>
// · · ·
// · · ·
// · · ·
// <<< SHAPES.mx5rf (JAPONAISES) — début >>>
SHAPES.mx5rf=function(K){
  /* LA … — le petit roadster d'Hiroshima en TARGA « fastback » (la ligne de la Mazda MX-5 RF, 2016), ARGENT, toit fermé. La caisse vient du
     PLAN COTÉ VECTORIEL de la quatrième génération (dimensions.com, quatre vues, 140,77 unités/m — la RF partage toute la tôle sous la
     ceinture) ; le TOIT vient du plan de la RF (the-blueprints, 434 px/m) et des photos de presse : le pavillon à 1,235 m, les deux ARCEAUX
     (« fastback ») qui descendent jusqu'à la malle, la LUNETTE inclinée au fond du tunnel qu'ils forment, la petite custode. Découpés dans la
     tôle (`japDecoupe`), les contours mêmes du plan : les phares effilés et leur projecteur, la calandre en trapèze, les antibrouillards, les
     feux ronds et leur barre, les évents, les répétiteurs, la poignée ; les joints (portières, capot, malle) et les plis (la ligne de
     caractère qui plonge de l'aile arrière vers le bas de la portière, la crête des ailes avant). Repère : x à droite, y en haut, z vers
     l'avant, mètres. */
  const U=LPU,R=.3075,ZF=1.202,ZR=-1.111,ZE=1.9575,ZB=-1.9575;
  const L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lis=t=>t*t*(3-2*t);
  const ARGENT=0x868b92;
  const PAL={p:{g:'p',c:ARGENT},k:{g:'m',c:0x121316},K:{g:'g',c:0x0a0a0d},g:{g:'g',c:0x141c26},s:{g:'s',c:0x2a2b30},
    W:{g:'l',c:0xf2f6ff},L:{g:'l',c:0xd0101e},r:{g:'l',c:0x6a0612},c:{g:'c',c:0xd4d8de},O:{g:'g',c:0xe08414},q:{g:'g',c:0xc9cdd3},d:{g:'m',c:0x0d0e11}};
  const PLAN={"face":{"phare":[[0.406,0.595],[0.526,0.637],[0.622,0.663],[0.657,0.666],[0.685,0.665],[0.754,0.653],[0.738,0.613],[0.718,0.585],[0.696,0.566],[0.659,0.555],[0.624,0.552],[0.589,0.553],[0.54,0.56],[0.464,0.577],[0.415,0.578],[0.408,0.581]],"proj":[[0.579,0.606],[0.585,0.625],[0.595,0.635],[0.608,0.64],[0.621,0.639],[0.634,0.633],[0.643,0.622],[0.647,0.609],[0.645,0.596],[0.639,0.584],[0.628,0.575],[0.615,0.572],[0.601,0.574],[0.589,0.581],[0.581,0.592]],"calandre":[[-0.0,0.236],[-0.128,0.239],[-0.262,0.249],[-0.325,0.259],[-0.366,0.272],[-0.389,0.288],[-0.409,0.308],[-0.429,0.337],[-0.453,0.381],[-0.467,0.414],[-0.474,0.441],[-0.473,0.455],[-0.458,0.469],[-0.424,0.48],[-0.368,0.49],[-0.241,0.503],[-0.106,0.508],[0.092,0.508],[0.248,0.502],[0.361,0.491],[0.445,0.474],[0.464,0.466],[0.473,0.455],[0.474,0.441],[0.467,0.414],[0.429,0.337],[0.394,0.293],[0.359,0.269],[0.311,0.256],[0.234,0.246],[0.128,0.239]],"antib":[[0.566,0.41],[0.595,0.409],[0.615,0.405],[0.664,0.376],[0.695,0.348],[0.714,0.327],[0.725,0.301],[0.721,0.288],[0.708,0.282],[0.687,0.28],[0.581,0.277]],"lignes":{"j":[[[0,0.658],[0.169,0.657],[0.303,0.648],[0.323,0.643],[0.349,0.63],[0.399,0.592]]],"h":[[[0.751,0.241],[0.575,0.231],[0.512,0.231],[0.477,0.235],[0.437,0.247],[0.432,0.252],[0.435,0.258],[0.461,0.27],[0.508,0.285]],[[0.004,0.197],[0.576,0.198],[0.788,0.205]]]},"lames":[[[0,0.394],[0.459,0.394]],[[0.442,0.359],[0.004,0.359]],[[0.41,0.31],[0,0.31]]]},"dos":{"feu":[[0.373,0.72],[0.379,0.747],[0.395,0.77],[0.419,0.785],[0.44,0.789],[0.467,0.785],[0.491,0.77],[0.507,0.747],[0.513,0.72],[0.507,0.692],[0.491,0.669],[0.467,0.655],[0.447,0.65],[0.419,0.654],[0.395,0.669],[0.379,0.692]],"barre":[[0.502,0.757],[0.593,0.75],[0.632,0.738],[0.696,0.709],[0.682,0.685],[0.665,0.675],[0.49,0.668]],"event":[[0.426,0.438],[0.482,0.437],[0.531,0.431],[0.566,0.423],[0.605,0.406],[0.64,0.384],[0.676,0.35],[0.701,0.316],[0.7,0.302],[0.686,0.286],[0.664,0.269],[0.645,0.261],[0.631,0.26],[0.497,0.304],[0.421,0.322],[0.33,0.335],[0.246,0.338]],"stop":[[-0.0,0.915],[-0.184,0.915],[-0.204,0.918],[-0.187,0.929],[-0.159,0.934],[0.145,0.934],[0.186,0.929],[0.204,0.917],[0.198,0.915]],"lignes":{"j":[[[0.004,0.758],[0.385,0.758]],[[0.004,0.856],[0.231,0.852],[0.358,0.842],[0.484,0.819],[0.552,0.8],[0.612,0.779]],[[0.619,0.895],[0.539,0.865],[0.495,0.842],[0.482,0.825],[0.469,0.784]],[[0.004,0.501],[0.208,0.5],[0.243,0.496],[0.271,0.49],[0.296,0.477],[0.322,0.454],[0.35,0.422],[0.396,0.359]]],"h":[[[0,0.624],[0.291,0.623],[0.44,0.617],[0.531,0.602],[0.638,0.566]],[[0.006,0.245],[0.168,0.245]]]}},"cote":{"repet":[[0.825,0.656],[0.802,0.639],[0.788,0.636],[0.749,0.652],[0.738,0.66],[0.738,0.666],[0.758,0.67],[0.815,0.668],[0.827,0.662]],"marqAv":[[1.543,0.508],[1.537,0.511],[1.516,0.511],[1.51,0.507],[1.511,0.5],[1.534,0.457],[1.559,0.385],[1.565,0.38],[1.571,0.383],[1.585,0.398],[1.586,0.405],[1.568,0.458]],"catAr":[[-1.475,0.389],[-1.48,0.385],[-1.486,0.386],[-1.504,0.407],[-1.495,0.44],[-1.476,0.485],[-1.455,0.521],[-1.427,0.52],[-1.422,0.517],[-1.422,0.51],[-1.452,0.455]],"poignee":[[-0.593,0.729],[-0.628,0.733],[-0.646,0.742],[-0.651,0.755],[-0.648,0.768],[-0.628,0.774],[-0.557,0.773],[-0.473,0.766],[-0.439,0.76],[-0.426,0.754],[-0.422,0.748],[-0.423,0.741],[-0.428,0.736],[-0.461,0.725],[-0.474,0.728],[-0.484,0.738],[-0.512,0.741],[-0.568,0.741],[-0.586,0.73]],"lignes":{"j":[[[0.439,0.267],[0.461,0.37],[0.472,0.461],[0.477,0.574],[0.473,0.686],[0.465,0.735],[0.446,0.781],[0.416,0.82],[0.384,0.847]],[[0.834,0.262],[-0.264,0.278],[-0.37,0.288],[-0.425,0.3],[-0.479,0.318],[-0.518,0.335],[-0.555,0.356],[-0.588,0.383],[-0.617,0.414],[-0.643,0.447],[-0.673,0.495],[-0.726,0.604],[-0.742,0.65],[-0.751,0.685],[-0.754,0.72],[-0.752,0.748],[-0.744,0.783],[-0.735,0.802],[-0.718,0.824],[-0.686,0.853]]],"h":[[[-0.976,0.877],[-0.891,0.841],[-0.816,0.801],[-0.732,0.75],[-0.597,0.659],[-0.554,0.635],[-0.509,0.615],[-0.436,0.59],[-0.354,0.569],[-0.243,0.55],[-0.124,0.535]],[[-0.501,0.376],[0.744,0.305]],[[0.484,0.854],[0.704,0.854],[0.874,0.85],[1.029,0.839],[1.169,0.82],[1.287,0.795],[1.416,0.755],[1.52,0.712],[1.57,0.686],[1.612,0.659]],[[-1.797,0.779],[-1.789,0.813],[-1.781,0.833],[-1.771,0.842],[-1.758,0.846],[-1.364,0.895],[-1.258,0.906],[-1.144,0.908],[-1.003,0.899],[-0.624,0.846]],[[-0.702,0.254],[-0.703,0.339],[-0.709,0.381],[-0.719,0.422],[-0.748,0.494],[-0.77,0.531],[-0.795,0.565],[-0.85,0.62],[-0.89,0.65],[-0.92,0.668],[-0.965,0.689],[-0.999,0.7],[-1.075,0.715],[-1.118,0.717],[-1.16,0.714],[-1.236,0.699],[-1.283,0.681],[-1.315,0.666],[-1.345,0.647],[-1.384,0.618],[-1.415,0.588],[-1.443,0.556],[-1.463,0.527],[-1.488,0.484],[-1.504,0.445],[-1.517,0.405],[-1.529,0.328]],[[1.611,0.328],[1.601,0.398],[1.578,0.465],[1.563,0.497],[1.537,0.539],[1.492,0.594],[1.438,0.64],[1.371,0.679],[1.298,0.704],[1.228,0.716],[1.157,0.715],[1.081,0.7],[1.015,0.674],[0.955,0.638],[0.896,0.587],[0.848,0.526],[0.816,0.463],[0.792,0.389]],[[-1.925,0.637],[-1.877,0.629],[-1.837,0.614],[-1.796,0.588],[-1.765,0.559]]]}},"dessus":{"parebrise":[[0.486,0.0],[0.481,-0.177],[0.473,-0.24],[0.458,-0.31],[0.427,-0.411],[0.396,-0.491],[0.36,-0.56],[0.319,-0.618],[0.303,-0.632],[0.283,-0.638],[0.262,-0.638],[0.234,-0.633],[0.16,-0.609],[0.033,-0.563],[0.0,-0.549],[-0.01,-0.54],[-0.016,-0.527],[-0.018,-0.491],[0.003,-0.123],[0.009,-0.111],[0.061,-0.089],[0.078,-0.077],[0.083,-0.064],[0.085,-0.028],[0.085,0.05],[0.078,0.077],[0.061,0.09],[0.009,0.111],[0.003,0.123],[-0.018,0.499],[-0.016,0.527],[-0.005,0.545],[0.026,0.561],[0.113,0.593],[0.207,0.625],[0.248,0.636],[0.269,0.639],[0.29,0.637],[0.309,0.628],[0.324,0.613],[0.36,0.561],[0.396,0.491],[0.431,0.399],[0.458,0.31],[0.473,0.241],[0.481,0.177]],"lignes":{"j":[[[0.424,0.697],[0.521,0.717],[0.605,0.725],[0.697,0.728],[0.86,0.726],[1.15,0.708],[1.601,0.663]],[[1.784,-0.595],[1.737,-0.648],[1.704,-0.675],[1.669,-0.699],[1.599,-0.732],[1.551,-0.747],[1.522,-0.752],[1.634,-0.623],[1.728,-0.508],[1.78,-0.44],[1.79,-0.422],[1.794,-0.408],[1.761,-0.353],[1.756,-0.326],[1.763,-0.028],[1.756,0.334],[1.761,0.354],[1.791,0.402],[1.793,0.416],[1.767,0.458],[1.702,0.542],[1.522,0.752],[1.551,0.748],[1.598,0.733],[1.638,0.716],[1.675,0.696],[1.732,0.653],[1.762,0.623],[1.784,0.595]],[[1.801,0.475],[1.468,0.568],[1.29,0.614],[1.125,0.651],[0.972,0.678]],[[1.298,0.612],[1.328,0.459],[1.343,0.34],[1.351,0.184],[1.354,0.007],[1.351,-0.184],[1.343,-0.339],[1.328,-0.458],[1.298,-0.611]],[[1.831,0.504],[1.776,0.569],[1.712,0.626],[1.634,0.675],[1.608,0.686],[1.587,0.689],[1.68,0.62],[1.732,0.573],[1.78,0.511],[1.813,0.448],[1.837,0.374],[1.854,0.284],[1.862,0.178],[1.865,0.029],[1.863,-0.149],[1.856,-0.262],[1.84,-0.36],[1.818,-0.435],[1.784,-0.505],[1.737,-0.567],[1.685,-0.616],[1.587,-0.688],[1.608,-0.685],[1.634,-0.675],[1.712,-0.625],[1.776,-0.569],[1.831,-0.504]]],"h":[[[0.582,0.639],[0.829,0.659],[0.992,0.666],[1.097,0.662],[1.181,0.646],[1.254,0.62],[1.355,0.568],[1.488,0.488],[1.685,0.363]]]}}};
  // ---- LES COTES DU PLAN ----
  const XM=[[ZB,.12],[-1.95,.27],[-1.92,.403],[-1.88,.503],[-1.84,.565],[-1.80,.609],[-1.76,.642],[-1.72,.671],[-1.68,.696],[-1.64,.722],[-1.60,.748],[-1.56,.773],
            [-1.52,.798],[-1.48,.822],[-1.44,.840],[-1.40,.853],[-1.36,.861],[-1.32,.865],[-1.24,.866],[-1.12,.866],[-1.0,.864],[-.8,.862],[-.6,.860],[-.4,.857],[-.2,.854],
            [0,.851],[.2,.846],[.4,.840],[.6,.836],[.72,.841],[.8,.852],[.88,.861],[1.0,.865],[1.2,.866],[1.32,.865],[1.40,.863],[1.48,.855],[1.52,.847],[1.56,.833],
            [1.60,.812],[1.64,.784],[1.68,.751],[1.72,.711],[1.76,.665],[1.80,.611],[1.84,.546],[1.88,.464],[1.92,.349],[1.945,.24],[ZE,.12]],
        // le haut de la caisse : la CRÊTE des ailes avant, la ceinture des portières, l'épaule de l'aile arrière, le pont de la malle
        YT=[[ZB,.60],[-1.93,.67],[-1.90,.721],[-1.88,.80],[-1.865,.84],[-1.85,.861],[-1.80,.866],[-1.75,.874],[-1.70,.881],[-1.65,.888],[-1.60,.895],[-1.55,.902],[-1.50,.908],
            [-1.45,.915],[-1.40,.921],[-1.36,.924],[-1.30,.912],[-1.20,.908],[-1.10,.906],[-1.0,.899],[-.90,.887],[-.80,.871],[-.70,.855],[-.60,.844],[-.50,.840],[-.30,.838],
            [0,.840],[.15,.841],[.30,.844],[.40,.848],[.45,.851],[.50,.856],[.55,.86],[.60,.864],[.65,.867],[.75,.868],[.85,.866],[.90,.864],[.95,.861],[1.0,.858],[1.05,.853],
            [1.10,.848],[1.15,.843],[1.20,.835],[1.25,.827],[1.30,.818],[1.35,.808],[1.40,.796],[1.45,.783],[1.50,.769],[1.55,.752],[1.60,.734],[1.65,.714],[1.70,.691],
            [1.75,.664],[1.80,.634],[1.85,.601],[1.91,.565],[1.94,.535],[ZE,.512]],
        YB=[[ZB,.55],[-1.95,.517],[-1.93,.40],[-1.91,.32],[-1.90,.301],[-1.85,.221],[-1.75,.225],[-1.65,.224],[-1.55,.213],[-1.50,.211],[-1.45,.20],[-.80,.16],[-.70,.156],
            [.80,.156],[.85,.17],[1.55,.185],[1.60,.172],[1.70,.175],[1.80,.178],[1.85,.181],[1.91,.186],[1.93,.26],[1.945,.38],[ZE,.49]],
        AR=[[0,.664],[.05,.66],[.10,.648],[.15,.628],[.20,.599],[.25,.557],[.30,.493],[.33,.43],[.35,.36],[.37,.20],[.375,0]];
  const xM=z=>L(XM,z),yT=z=>L(YT,z),yB0=z=>L(YB,z);
  /* LA SERRE ET LE TOIT (z = .486 le pied du pare-brise au milieu, −.03 la traverse, −.875 l'arête arrière du pavillon) : le haut au milieu `yC`
     (pare-brise puis pavillon), le bord `xR/yR` (le montant de pare-brise, puis le bord du pavillon) ; les ARCEAUX (−.885 → −1.36) : la crête
     `yF`, ses bords `XFo/XFi`, le fond du tunnel `yTu` (la lunette, puis le couvre-toit). */
  const ZW=.486,ZH=-.03,ZRf=-.875,ZA=-.885,ZL=-1.025,ZM=-1.36;
  const YC=[[-.875,1.172],[-.8,1.19],[-.7,1.21],[-.6,1.225],[-.45,1.235],[-.3,1.232],[-.2,1.226],[-.1,1.212],[-.05,1.198],[0,1.165],[.05,1.138],[.10,1.111],[.15,1.083],
            [.20,1.054],[.25,1.025],[.30,.995],[.35,.965],[.40,.934],[.45,.902],[ZW,.875]],
        YF=[[ZM,.925],[-1.3,.95],[-1.2,.995],[-1.1,1.04],[-1.0,1.08],[-.95,1.098],[-.92,1.109],[ZA,1.15]],
        YTU=[[ZM,.93],[-1.2,.95],[ZL,.975],[ZA,1.135]],
        ZWS=[[0,.486],[.30,.46],[.43,.42],[.52,.38],[.59,.34],[.633,.30]];   // le pied du pare-brise, vu de dessus (|x| → z)
  const yC=z=>L(YC,z),yF=z=>L(YF,z),yTu=z=>L(YTU,z);
  const xg=z=>{for(let i=1;i<ZWS.length;i++){const a=ZWS[i-1],b=ZWS[i];if(z<=a[1]&&z>=b[1])return a[0]+(b[0]-a[0])*(a[1]-z)/(a[1]-b[1]);}return z>ZWS[0][1]?0:.633;};
  const zone=z=>z>ZW?'capot':z>ZRf?'serre':z>=ZM?'arceaux':'malle';
  // la coupe vue de face (la plus grosse section : demi-largeur .866, du bas .16 à la crête .874) — le flanc rentre vers le bas
  const COTE=[[.066,.911],[.326,.962],[.632,.997],[.741,.995],[.807,.977],[.891,.920]];
  const S0=z=>{const xm=xM(z),y0=yB0(z),zo=zone(z),yt=yT(z),H=Math.max(.04,yt-y0),yb=U.arch(z,[ZF,ZR],AR,y0),kx=Math.min(1,xm/.62);
    const s=[[0,yb],[xm-.11*kx,yb]];
    {const B9=Math.max(y0,yb),H9=Math.max(.04,yt-B9);for(const q of COTE)s.push([xm-(1-q[1])*.866*kx,B9+q[0]*H9]);}   // (affinement : au-dessus d'un passage de roue, le flanc se répartit entre l'arche et l'épaule — tassé sur l'arche, il faisait un damier)
    const xb=xm-.13*kx;   // le haut du flanc : la ceinture (ou la crête de l'aile)
    if(zo==='capot'){const dd=L([[1.40,.036],[1.62,.02],[1.80,.006]],z);
      s.push([xm-.06*kx,yt-.03],[xm-.10*kx,yt-.012],[xm-.13*kx,yt],[xm-.19*kx,yt-.012],[xm*.55,yt-dd*.8],[xm*.28,yt-dd*.97],[0,yt-dd]);}
    else if(zo==='serre'){const yc=yC(z);let xr,yr;
      if(z>.345){xr=Math.min(xb-.03,xg(z)+.05);yr=yt+.018;}                        // (le pied du pare-brise : le montant n'a pas encore commencé)
      else if(z>ZH){const t=(.345-z)/(.345-ZH);xr=mix(.69,.60,t);yr=mix(.868,1.15,t);}   // le montant de pare-brise
      else{xr=L([[ZRf,.582],[-.6,.585],[ZH,.60]],z);yr=yc-.048;}                      // le bord du pavillon
      s.push([xb,yt],[xb-.012,yt+.012],[mix(xb,xr,.5)+.01,mix(yt,yr,.5)],[xr,yr],[xr*.66,mix(yr,yc,.68)],[xr*.33,mix(yr,yc,.94)],[0,yc]);}
    else if(zo==='arceaux'){const yf=yF(z),yu=yTu(z),xo=L([[ZM,.60],[-1.2,.615],[ZA,.635]],z),xi=.49;
      s.push([xb,yt],[mix(xb,xo,.5),mix(yt,yf,.75)],[xo,yf],[xi,yf-.008],[xi-.014,yu+.012],[xi*.5,yu+.003],[0,yu]);}   // (sept points en haut, comme la serre)
    else{const yd=yt;s.push([xb,yt-.012],[xm-.17*kx,yt-.004],[xm-.22*kx,yd],[xm*.6,yd-.002],[xm*.4,yd-.004],[xm*.2,yd-.006],[0,yd-.006]);}
    for(let i=1;i<s.length-1;i++)s[i][1]=Math.max(s[i][1],s[i-1][1]+(i===1?0:.002));
    return s;};
  const SM=new Map(),S=z=>{const k=Math.round(z*2000);let s=SM.get(k);if(!s){s=S0(k/2000);SM.set(k,s);}return s;};
  const zs0=[ZB,-1.95,-1.93,-1.91,-1.90,-1.88,-1.865,-1.85,-1.80,-1.72,-1.64,-1.56,-1.48,-1.40,ZM,ZM-.004,-1.30,-1.22,-1.14,-1.06,ZL,-.96,ZA,ZRf,-.80,-.72,-.64,-.56,
    -.48,-.40,-.30,-.20,-.10,ZH,.06,.14,.22,.30,.345,.40,.45,ZW,ZW+.004,.56,.66,.80,.95,1.10,1.30,1.45,1.55,1.62,1.68,1.74,1.80,1.84,1.88,1.91,1.93,1.945,ZE];
  for(const w of [ZF,ZR])for(const d of [0,.05,.10,.15,.20,.25,.30,.33,.35,.37,.375])zs0.push(w-d,w+d);
  zs0.sort((a,b)=>a-b);const zs=zs0.filter((z,i)=>i===0||z-zs0[i-1]>.003);
  const NC=2+COTE.length;   // le 1er point du haut
  const peint=(j,z)=>{if(j<0)return 'p';if(j===0)return z>1.85||z<-1.86?'p':'k';
    if(zone(z)==='arceaux'&&z>ZL&&j>=NC+4)return 'g';                                   // la LUNETTE, au fond du tunnel
    return 'p';};
  const EP=(typeof peintPal==='function'?peintPal(PAL):PAL).p,GP=EP.g;
  const PL=K.kit(PAL);PL.loft(zs,S,peint);
  // ---- LA DÉCOUPE AU PLAN ----
  const MEM=(typeof SHAPES==='object'&&SHAPES.mx5rf)||null;
  const av=(x,y,z,nx,ny,nz)=>z>1.45&&nz>.15,ar=(x,y,z,nx,ny,nz)=>z<-1.6&&nz<-.15;
  const F9=PLAN.face,D9=PLAN.dos,C9=PLAN.cote,T9=PLAN.dessus;
  const ZN={
    face:japZones([
      {k:'K',p:F9.phare,gate:av},{k:'W',p:japRuban(F9.phare.slice(Math.floor(F9.phare.length/2)),.008),gate:av,axe:false},
      {k:'c',p:F9.proj,gate:av},{k:'W',p:japEchelle(F9.proj,.62),gate:av},
      {k:'K',p:F9.calandre,creux:.045,gate:av},{k:'K',p:F9.antib,creux:.03,gate:av}].concat(F9.lames.map(l=>({k:'s',p:japRuban(l,.012),gate:av,axe:false})))),
    dos:japZones([
      {k:'K',p:japEchelle(D9.feu,1.06),gate:ar},{k:'L',p:D9.feu,gate:ar},{k:'r',p:japEchelle(D9.feu,.45),gate:ar},
      {k:'q',p:D9.barre,gate:ar},{k:'K',p:D9.event,creux:.02,gate:ar},{k:'L',p:D9.stop,gate:(x,y,z,nx,ny,nz)=>z<-1.5}]),
    cote:japZones([
      {k:'c',p:C9.repet,gate:(x,y,z)=>z>.6},{k:'O',p:japEchelle(C9.repet,.7),gate:(x,y,z)=>z>.6},
      {k:'O',p:C9.marqAv,gate:(x,y,z)=>z>1.4},{k:'r',p:C9.catAr,gate:(x,y,z)=>z<-1.3},{k:'c',p:C9.poignee,gate:(x,y,z)=>z>-.8&&z<-.3},
      // les VITRES : la portière (son bord avant suit le montant), le montant noir, la petite custode — sur la seule serre
      {k:'g',p:[[.30,.852],[.20,.905],[.10,.98],[0,1.06],[-.05,1.10],[-.10,1.128],[-.20,1.14],[-.40,1.143],[-.595,1.138],[-.595,.848],[-.30,.845],[0,.846],[.30,.852]],gate:(x,y,z)=>y>.84&&z>-.62&&z<.36},
      {k:'K',p:[[-.595,.848],[-.595,1.138],[-.618,1.135],[-.618,.849]],gate:(x,y,z)=>y>.84},
      {k:'g',p:[[-.618,.849],[-.70,.851],[-.74,.856],[-.805,.873],[-.84,.899],[-.875,.938],[-.905,.995],[-.896,1.035],[-.874,1.06],[-.805,1.089],[-.736,1.112],[-.666,1.128],[-.618,1.135]],
       gate:(x,y,z)=>y>.84&&z<-.6&&z>-.93}]),
    dessus:japZones([{k:'g',p:T9.parebrise,gate:(x,y,z,nx,ny)=>y>.85&&z>-.06&&z<.52&&ny>.3}])};
  const lig=(L9,k,gate)=>(L9||[]).filter(p=>p.length>1).map(p=>({k:k,p:p,gate:gate}));
  const LGN={
    cote:japLignes(lig(C9.lignes.j,'j',(x,y)=>y<.86).concat(lig(C9.lignes.h,'h',(x,y)=>y<.93))),
    face:japLignes(lig(F9.lignes.j,'j',av).concat(lig(F9.lignes.h,'h',av))),
    dos:japLignes(lig(D9.lignes.j,'j',ar).concat(lig(D9.lignes.h,'h',ar))),
    dessus:japLignes(lig(T9.lignes.j,'j',(x,y,z)=>z>.4||z<-1.2))};
  const CODES={p:{g:GP},gap:{g:GP,c:0x26282c},K:{g:'g',c:PAL.K.c,lisse:1},g:{g:'g',c:PAL.g.c,lisse:1},c:{g:'c',c:PAL.c.c,lisse:1},W:{g:'l',c:PAL.W.c},
    L:{g:'l',c:PAL.L.c},r:{g:'l',c:PAL.r.c},O:{g:'g',c:PAL.O.c,lisse:1},q:{g:'g',c:PAL.q.c,lisse:1},s:{g:'s',c:0x3a3c42}};
  {const f2=PL.done;PL.done=()=>{const gs=f2(),G=gs[GP];if(!G)return gs;
    const ns=japLisse(G,32),out=japDecoupe(G,{zones:ZN,lignes:LGN,codes:CODES,ns:ns,GP:GP,colP:japColP(EP),cache:MEM,
      vue:(x,y,z,ax,ay,az,nx,ny,nz)=>z>1.5&&nz>.2&&y<.72?'face':z<-1.62&&nz<-.2&&y<.86?'dos':(y>.84&&z<.40&&z>-.95&&ax>.35&&ay<.85?'cote':null)});
    G.dispose();delete gs[GP];return japFusion(gs,out);};}
  K.commit(PL);if(K.muet)return {};   // (la préchauffe du menu : la tôle seule — voir japChauffe)
  // ---- LES DÉTAILS ----
  const P=K.kit(PAL);
  // LES RÉTROVISEURS (du plan : coque de 17 × 13 cm sur un pied noir au coin de la portière)
  P.sym(sd=>{P.box('k',.05,.04,.10,sd*.775,.835,.13);P.box('k',.04,.05,.035,sd*.80,.86,.10,0,0,-sd*.4);
    const g=new THREE.SphereGeometry(.065,8,3,0,Math.PI*2,0,Math.PI*.6);g.rotateX(Math.PI/2);P.put('p',g,sd*.88,.885,.075,0,0,0,1.35,1.0,1.1);
    P.put('K',new THREE.CircleGeometry(.064,8).scale(1.32,.98,1).rotateY(Math.PI),sd*.88,.885,.035);});   // (affinement : la coque en facettes, plus une bulle)
  // LA JOUE DES PASSAGES DE ROUE
  {const joue=w=>{const o=[];for(let i=AR.length-1;i>=0;i--){const p=AR[i];if(p[1]>=.17)o.push([w-p[0]*1.02,p[1]+.01]);}
      o.unshift([w-.375,.17]);for(let i=1;i<AR.length;i++){const p=AR[i];if(p[1]>=.17)o.push([w+p[0]*1.02,p[1]+.01]);}o.push([w+.375,.17]);return o;};
   P.sym(sd=>{for(const w of [ZF,ZR])P.prism('d',joue(w),.02,sd*.60);});}
  K.commit(P);
  // LE POT : deux sorties, à droite, sous le diffuseur (du plan)
  const pts9=[[.235,.24,-1.905],[.315,.24,-1.905]];
  if(typeof ECHP==='object'&&ECHP.reel&&typeof ECH_PAL==='object'){const E=K.kit(ECH_PAL);E.ech=1;ECHP.reel(E,{r:.034,k:'c',len:.30,pts:pts9});K.commit(E);}
  // ---- LA JANTE : 17 pouces, sept branches en Y, gris anthracite ; le pneu 205/45 ----
  const JW=.205,hw=JW/2,fx=hw-.03,RJ=.216,J=lpKit({k:{g:'m',c:0x161719},a:{g:'k',c:0x4a4e55},d:{g:'m',c:0x0f1013},b:{g:'m',c:0x34353a},e:{g:'c',c:0xb8bcc2}});
  J.lathe('k',[[RJ,-hw],[R*.92,-hw],[R,-hw*.6],[R,hw*.6],[R*.92,hw],[RJ,hw]],24,0,0,0,'x');
  J.lathe('a',[[RJ,fx-.01],[RJ+.004,fx+.002],[RJ-.012,fx+.006],[RJ-.02,fx-.004]],28,0,0,0,'x');
  J.lathe('d',[[RJ-.02,-hw+.02],[RJ-.02,fx-.012],[0,fx-.012]],20,0,0,0,'x');
  J.lathe('b',[[.15,fx-.06],[.07,fx-.06]],20,0,0,0,'x');                                     // le disque
  {const br=(a0,w0,w1,r0,r1)=>{const sh=new THREE.Shape();sh.moveTo(-w0,r0);sh.lineTo(w0,r0);sh.lineTo(w1,r1);sh.lineTo(-w1,r1);sh.lineTo(-w0,r0);
      const g=new THREE.ExtrudeGeometry(sh,{depth:.018,bevelEnabled:false});g.rotateY(-Math.PI/2);g.rotateX(a0);g.translate(fx+.006,0,0);J.put('a',g,0,0,0);};
   for(let q=0;q<7;q++){const a=q/7*Math.PI*2;br(a,.014,.012,.05,.13);br(a+.13,.006,.01,.12,.205);br(a-.13,.006,.01,.12,.205);}}
  J.lathe('a',[[.055,fx+.004],[.05,fx+.016],[0,fx+.02]],14,0,0,0,'x');J.lathe('e',[[.022,fx+.021],[0,fx+.022]],10,0,0,0,'x');
  const JG=J.done();
  return {hl:[.55,.62,1.80],tl:[.44,.72,-1.90],wx:.7475,wzF:ZF,wzR:-ZR,pots:pts9,lamps:0,halos:0,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null));m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0x4a4e55}};
};
// <<< SHAPES.mx5rf (JAPONAISES) — fin >>>
// · · ·
// · · ·
// · · ·
// <<< SHAPES.ae86 (JAPONAISES) — début >>>
/* LES PHARES ESCAMOTABLES DE L'AE86 : quand ils se lèvent — comme ceux de LA CERISE ('nitro' par défaut, le choix de Léo pour elle ; 'course',
   'toujours'). Console : dbgPhares(1|0|null) force les deux caisses. */
var AE86PH={mode:'nitro',force:null};
SHAPES.ae86=function(K){
  /* LE TOFU — le petit coupé à hayon de 1983 (la ligne de la Toyota Sprinter Trueno « AE86 », 3 portes GT-APEX, la caisse « zenki »), en
     LIVRÉE PANDA : le haut BLANC, le bas NOIR sous la ligne de 0,556 m (les boucliers, le bas des portières, le bandeau du nez), une
     BANDE BLANCHE dans le noir (0,448 → 0,503). Tout vient de son PLAN COTÉ (the-blueprints, quatre vues, 173 px/m, empattement 2,40 m) :
     la silhouette de côté (capot qui plonge vers le nez carré, pare-brise à 30°, pavillon à 1,275 m, HAYON qui descend de −0,85 à −1,75,
     la petite marche du becquet, le panneau des feux en pente), la largeur vue de dessus (1,68 m aux ailes, petits élargisseurs sur les
     passages de roue), la coupe vue de face (flanc droit, épaule à 0,79, vitres latérales rentrées de 29°). Découpés dans la tôle
     (`japDecoupe`) : les vitres et leur cadre noir, le pare-brise, la lunette du hayon, la grille d'auvent, les feux arrière et le bandeau
     noir de la plaque, les clignotants orange, le feu de coin, la calandre à lames, la poignée ; les joints (portières, capot, hayon) et
     les deux plis du capot. LES PHARES ESCAMOTABLES SE LÈVENT (`AE86PH`) : deux boîtiers noirs, la tôle du capot dessus, un phare rond
     derrière un verre carré. Jantes à huit bâtons, bronze (celles du plan). Repère : x à droite, y en haut, z vers l'avant, mètres. */
  const U=LPU,R=.297,ZF=1.251,ZR=-1.142,ZE=2.112,ZB=-2.108;
  const L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,lis=t=>t*t*(3-2*t);
  const BLANC=0xf2f2ee;
  const PAL={p:{g:'p',c:BLANC},k:{g:'m',c:0x121214},K:{g:'g',c:0x0b0b0e},g:{g:'g',c:0x141c26},s:{g:'s',c:0x2a2b30},
    W:{g:'l',c:0xf2f6ff},L:{g:'l',c:0xd0101e},c:{g:'c',c:0xd4d8de},O:{g:'g',c:0xe08414},q:{g:'g',c:0xd9dde2},d:{g:'m',c:0x0d0e11},
    n:{g:'g',c:0x101013},Q:{g:'l',c:0xe6e6e6}};
  // ---- LES COTES DU PLAN (mètres) ----
  // la demi-largeur vue de dessus : le nez CARRÉ (le bouclier), les ailes, les élargisseurs, la poupe carrée
  const XM=[[ZB,.68],[-2.10,.69],[-2.09,.70],[-2.072,.725],[-2.049,.752],[-2.02,.762],[-1.98,.772],[-1.93,.78],[-1.88,.789],[-1.81,.795],[-1.74,.803],
            [-1.64,.806],[-1.60,.815],[-1.535,.815],[-1.50,.824],[-1.43,.826],[-1.40,.841],[-1.22,.842],[-1.16,.847],[-.88,.847],[-.84,.841],[-.80,.829],
            [-.75,.827],[0,.824],[.65,.824],[.70,.818],[.89,.818],[.93,.829],[.97,.836],[1.0,.841],[1.48,.841],[1.52,.835],[1.55,.814],[1.59,.801],
            [1.66,.789],[1.72,.777],[1.79,.766],[1.86,.751],[1.93,.737],[1.99,.725],[2.03,.712],[2.055,.70],[2.078,.64],[2.09,.53],[2.10,.40],[ZE,.32]],
        // le haut du flanc : la crête des ailes (le capot), la ceinture (le bas des vitres), le pont du hayon, le panneau des feux
        YT=[[ZB,.53],[-2.10,.575],[-2.072,.588],[-2.05,.596],[-2.038,.678],[-2.003,.794],[-1.968,.875],[-1.93,.922],[-1.76,.926],[-1.70,.912],[-1.62,.895],
            [-1.50,.89],[-1.30,.884],[-1.0,.875],[-.62,.868],[-.45,.864],[.40,.858],[.62,.856],[.76,.862],[.95,.858],[1.09,.84],[1.23,.816],[1.37,.80],
            [1.51,.764],[1.65,.735],[1.79,.70],[1.90,.675],[2.0,.655],[2.03,.642],[2.045,.628],[2.052,.60],[2.06,.556],[2.07,.548],[2.09,.54],[ZE,.53]],
        // le milieu du capot (la silhouette de côté)
        YH=[[.70,.902],[.76,.90],[.95,.893],[1.02,.877],[1.09,.87],[1.16,.858],[1.23,.846],[1.30,.836],[1.37,.829],[1.44,.812],[1.51,.795],[1.58,.783],
            [1.65,.766],[1.72,.752],[1.79,.732],[1.90,.708],[2.0,.688],[2.03,.672],[2.045,.648],[2.052,.60],[2.06,.556],[2.07,.548],[2.09,.54],[ZE,.53]],
        // le bas (sans les passages de roue)
        YB=[[ZB,.30],[-2.09,.255],[-2.05,.21],[-2.0,.19],[-1.88,.19],[-1.82,.17],[-1.45,.165],[-1.40,.152],[-.86,.148],[.95,.148],[1.0,.156],
            [1.58,.195],[1.62,.203],[2.03,.205],[2.065,.215],[2.095,.25],[ZE,.29]],
        ARF=[[0,.645],[.08,.638],[.15,.618],[.21,.59],[.26,.555],[.30,.515],[.33,.47],[.355,.41],[.368,.33],[.372,0]],     // le passage de roue avant…
        ARR=[[0,.615],[.07,.608],[.13,.59],[.18,.565],[.225,.53],[.26,.49],[.29,.44],[.31,.38],[.322,.30],[.326,0]];     // …et l'arrière, plus serré
  // la LIVRÉE PANDA : la ligne (0,556 ; au nez, le bandeau noir monte sous le capot ; à la poupe, le bouclier monte à 0,59) et la bande blanche
  const YP=[[ZB,.592],[-2.05,.592],[-2.042,.556],[2.044,.556],[2.047,.66],[ZE,.66]],YS0=.448,YS1=.503;
  const xM=z=>L(XM,z),yT=z=>L(YT,z),yB0=z=>L(YB,z),yH=z=>L(YH,z),yP=z=>L(YP,z);
  /* LA SERRE (z = .76 le pied du pare-brise au milieu, −1.75 le bas du hayon) : le haut au milieu `yC` (pare-brise, pavillon, hayon), le bord
     `bordToit` (le montant de pare-brise, la gouttière, le haut des custodes), posé dans le PLAN DES VITRES (rentrée de 29°, relevée vue de face). */
  const ZW=.76,ZHT=-1.75,ZPa=.73,ZPb=.165;
  const YC=[[ZHT,.935],[-1.73,.941],[-1.66,.968],[-1.59,.997],[-1.52,1.026],[-1.45,1.055],[-1.38,1.084],[-1.31,1.107],[-1.24,1.136],[-1.17,1.165],[-1.10,1.188],
            [-1.03,1.217],[-.96,1.236],[-.89,1.253],[-.85,1.262],[-.75,1.271],[-.16,1.275],[-.09,1.27],[0,1.262],[.084,1.252],[.154,1.24],[.22,1.206],[.29,1.165],
            [.36,1.125],[.43,1.084],[.50,1.043],[.57,1.003],[.64,.968],[.71,.922],[ZW,.902]],
        YQ=[[ZHT,.93],[-1.569,.932],[-1.50,.962],[-1.40,.985],[-1.30,1.034],[-1.20,1.076],[-1.10,1.113],[-1.0,1.155],[-.90,1.188],[-.78,1.21],[-.70,1.215]];
  const yC=z=>L(YC,z),vitreX=y=>.78-.52*(y-.86);
  const zone=z=>z>ZW?'capot':z>=ZHT?'serre':'malle';
  const DX=[[0,.03],[.06,.006],[.15,0],[.60,0],[.68,.008],[.76,.02],[.84,.034],[.92,.05],[1.0,.065]];   // le flanc (vue de face) : droit, puis l'épaule
  const S0=z=>{const xm=xM(z),y0=yB0(z),yt=yT(z),zo=zone(z),kx=Math.min(1,xm/.62),H=Math.max(.04,yt-y0);
    const yb=Math.max(y0,L(ARF,Math.abs(z-ZF)),L(ARR,Math.abs(z-ZR)));
    const sx=y=>xm-L(DX,cl((y-y0)/H,0,1))*kx,yp=yP(z);
    const s=[[0,yb],[xm-.10*kx,yb]];
    // le flanc : hauteurs ABSOLUES (le bas, la bande blanche, la ligne panda : des arêtes, le trait reste net), puis relatives jusqu'à l'épaule
    const hs=[y0+.035,YS0,YS1,yp,yp+(yt-yp)*.22,yp+(yt-yp)*.46,yp+(yt-yp)*.70,yp+(yt-yp)*.88];
    let pr=yb;for(let i=0;i<hs.length;i++){let h=Math.max(hs[i],pr+.0015);h=Math.min(h,yt-(hs.length-i)*.0015);if(h<pr+.0005)h=pr+.0005;pr=h;s.push([sx(h),h]);}
    const xb=xm-.065*kx;
    if(zo==='capot'){const yh=Math.max(yH(z),yt);
      s.push([xb,yt],[xb-.02*kx,yt+.006],[xm*.74,yh-.014],[xm*.58,yh-.007],[xm*.38,yh-.002],[xm*.19,yh],[0,yh]);}
    else if(zo==='serre'){let xr,yr;
      if(z>ZPa){xr=xb-.03;yr=yt+.015;}                                                          // (le pied du pare-brise : le montant n'a pas commencé)
      else if(z>ZPb){yr=mix(.896,1.215,(ZPa-z)/(ZPa-ZPb));xr=vitreX(yr);}                        // le montant de pare-brise
      else if(z>-.70){yr=1.215;xr=vitreX(yr);}                                                   // la gouttière
      else{yr=L(YQ,z);xr=vitreX(yr);}                                                            // le haut des custodes
      yr=Math.max(yr,yt+.01);xr=Math.min(xr,xb-.012);const yc=Math.max(yC(z),yr+.004);
      s.push([xb,yt],[xb-.006,yt+.01],[mix(xb,xr,.5)+.004,mix(yt,yr,.5)],[xr,yr],[xr-.055,yr+(yc-yr)*.64],[xr*.58,yc-.004],[0,yc]);}
    else{const yd=yt+.004;s.push([xb,yt],[xb-.015*kx,yt+.003],[xm*.72,yd],[xm*.55,yd],[xm*.36,yd],[xm*.18,yd],[0,yd]);}
    for(let i=NC+1;i<s.length;i++)s[i][1]=Math.max(s[i][1],s[i-1][1]);   // (le dessus ne redescend jamais vers le milieu)
    // (aux deux bouts, la dernière tranche se replie sur l'axe : la face du nez et celle de la poupe sont des bandes du loft, chacune d'un côté
    //  de l'axe — un bouchon d'un seul tenant, à cheval sur l'axe, se découpait mal au plan)
    if(z>=ZE-1e-6||z<=ZB+1e-6)for(const q of s)q[0]*=.02;
    return s;};
  const NC=2+8;   // l'indice de l'épaule (le 1er point du dessus)
  const SM=new Map(),S=z=>{const k=Math.round(z*2000);let s=SM.get(k);if(!s){s=S0(k/2000);SM.set(k,s);}return s;};
  const zs0=[ZB,-2.10,-2.09,-2.08,-2.072,-2.06,-2.05,-2.046,-2.042,-2.038,-2.02,-2.003,-1.985,-1.968,-1.95,-1.93,-1.90,-1.86,-1.82,-1.78,-1.76,ZHT,ZHT-.004,
    -1.70,-1.66,-1.62,-1.58,-1.535,-1.50,-1.45,-1.40,-1.30,-1.20,-1.10,-1.0,-.94,-.88,-.84,-.80,-.75,-.70,-.62,-.55,-.45,-.30,-.15,0,.085,.165,.22,.29,.36,
    .43,.50,.57,.64,.70,ZPa,ZW,ZW+.004,.80,.86,.93,1.0,1.09,1.16,1.23,1.30,1.37,1.44,1.51,1.58,1.65,1.72,1.79,1.86,1.93,1.99,2.02,2.035,2.044,2.047,
    2.052,2.056,2.06,2.065,2.07,2.078,2.085,2.09,2.095,2.10,2.106,ZE-.003,ZE,ZB+.003];
  for(const [w,a] of [[ZF,.372],[ZR,.326]])for(const f of [0,.2,.4,.55,.7,.8,.88,.95,.99,1])zs0.push(w-a*f,w+a*f);
  zs0.sort((a,b)=>a-b);const zs=zs0.filter((z,i)=>i===0||z-zs0[i-1]>.002);
  const peint=(j,z)=>j===0?'k':'p';
  const EP=(typeof peintPal==='function'?peintPal(PAL):PAL).p,GP=EP.g;
  const PL=K.kit(PAL);PL.loft(zs,S,peint);let LIDG=null;
  // la couleur de la tôle, prise au centre de chaque triangle (`colTri`) : la peinture au-dessus de la ligne panda, le noir laqué dessous
  const cP0=japColP(EP),NOIR=[.043,.043,.048],RAYE=[.80,.80,.78];
  const colP=(y,x,z)=>{if(z!==undefined&&y<yP(z))return (y>YS0&&y<YS1&&z>-2.09&&z<2.075)?RAYE:NOIR;return cP0(y);};
  // ---- LA DÉCOUPE AU PLAN (`japDecoupe`) ----
  const MEM=(typeof SHAPES==='object'&&SHAPES.ae86)||null;
  const lid={z0:1.81,z1:2.042,x0:.375,x1:.685};
  const av=(x,y,z,nx,ny,nz)=>z>2.02&&nz>.3,ar=(x,y,z,nx,ny,nz)=>z<-1.9&&nz<-.3,cs=(x,y,z,nx,ny,nz)=>Math.abs(nx)>.5;
  const WB=[[0,.757],[.30,.752],[.50,.738],[.62,.712],[.70,.68]];                                  // le pied du pare-brise vu de dessus (|x| → z)
  const zWB=x=>L(WB,x);
  // LE NOIR DU BAS (livrée panda) : en tête de chaque vue, une zone « tout le plan » qui ne prend que les triangles sous la ligne panda (leur
  // centre — les arêtes y sont posées, le trait reste net), hors bande blanche : ils passent au NOIR LAQUÉ (la matière des vitres : le reflet
  // s'y assombrit — en laque de carrosserie le noir renvoyait tout le ciel du studio en rose)
  // (les BOUCLIERS et le bandeau du nez sont du plastique noir SATINÉ — du nez au passage de roue avant, du passage arrière à la poupe)
  const bas=(x,y,z)=>y<yP(z)&&!(y>YS0&&y<YS1&&z>-2.09&&z<2.075),pc=z=>z>1.61||z<-1.47,
        NB={k:'n',p:[[-3,-1],[3,-1],[3,2],[-3,2]],axe:false,gate:(x,y,z)=>bas(x,y,z)&&!pc(z)},
        NP={k:'b',p:[[-3,-1],[3,-1],[3,2],[-3,2]],axe:false,gate:(x,y,z)=>bas(x,y,z)&&pc(z)};
  const ZN={
    face:japZones([NB,NP,
      {k:'K',p:japDemi(.46,.458,.528,.012,3),creux:.018,gate:av},                                    // la CALANDRE (une fente à lames, en haut du bouclier)…
      {k:'s',p:japRect(.05,.476,.42,.484,.003,1),gate:av},{k:'s',p:japRect(.05,.499,.42,.507,.003,1),gate:av},   // …ses lames
      {k:'c',p:japDemi(.075,.484,.499,.003,1),gate:av},                                              // …le monogramme
      {k:'O',p:japRect(.56,.44,.735,.476,.008,2),gate:av},                                           // les CLIGNOTANTS (orange, aux coins du bouclier)
      {k:'K',p:japDemi(.20,.352,.39,.012,3),creux:.02,gate:av}]),                                    // la bouche du bas
    cote:japZones([
      NB,NP,
      {k:'K',p:[[.425,.849],[.43,.968],[.30,1.045],[.18,1.118],[.07,1.19],[-.10,1.205],[-.433,1.205],[-.46,1.09],[-.48,.92],[-.485,.852]],gate:cs},   // la vitre de portière : son cadre…
      {k:'g',p:[[.405,.862],[.41,.958],[.30,1.026],[.20,1.09],[.066,1.172],[-.10,1.19],[-.418,1.19],[-.443,1.08],[-.462,.92],[-.468,.866]],gate:cs},     // …le verre
      {k:'K',p:[[.415,.85],[.62,.85],[.415,.962]],gate:cs},                                         // le triangle de rétroviseur
      {k:'K',p:[[-.578,1.15],[-.585,1.198],[-.66,1.205],[-.78,1.203],[-.90,1.183],[-1.0,1.15],[-1.10,1.108],[-1.20,1.071],[-1.30,1.029],[-1.40,.98],[-1.50,.957],
               [-1.59,.92],[-1.585,.892],[-1.50,.882],[-1.40,.877],[-1.10,.872],[-.90,.856],[-.70,.857],[-.645,.868],[-.605,.95],[-.585,1.05]],gate:cs},          // la CUSTODE : son cadre…
      {k:'g',p:[[-.592,1.15],[-.60,1.185],[-.66,1.19],[-.78,1.188],[-.90,1.168],[-1.0,1.135],[-1.10,1.093],[-1.20,1.056],[-1.30,1.014],[-1.40,.966],[-1.50,.943],
               [-1.569,.912],[-1.565,.904],[-1.50,.896],[-1.40,.89],[-1.10,.884],[-.90,.868],[-.70,.869],[-.66,.88],[-.62,.95],[-.60,1.05]],gate:cs},              // …le verre
      {k:'K',p:japRect(-.505,.745,-.345,.778,.008,2),creux:.008,gate:cs},                            // la poignée
      {k:'q',p:japRect(1.79,.566,1.96,.613,.008,2),gate:(x,y,z,nx,ny,nz)=>z>1.7&&cs(x,y,z,nx,ny,nz)},  // le feu de coin (verre clair)
      {k:'n',p:[[-1.915,.79],[-1.99,.80],[-2.04,.70],[-2.055,.60],[-1.93,.58]],gate:(x,y,z,nx,ny,nz)=>z<-1.88}]),   // le retour noir des feux arrière
    dos:japZones([
      NB,NP,
      {k:'n',p:japDemi(.745,.596,.762,.01,3),gate:ar},                                               // le BANDEAU NOIR de la poupe…
      {k:'L',p:japRect(.305,.612,.725,.748,.008,2),gate:ar},                                         // …les FEUX (rouge)…
      {k:'O',p:japRect(.555,.618,.64,.742,.005,2),gate:ar},                                          // …leur clignotant…
      {k:'q',p:japRect(.47,.618,.545,.742,.005,2),gate:ar},                                          // …leur feu de recul
      {k:'P',p:japDemi(.145,.608,.734,.006,2),gate:ar},                                              // la plaque
      {k:'c',p:japOvale(0,.80,.012,.012,10),gate:ar},                                                // la serrure du hayon
      {k:'R',p:japDemi(.72,.488,.51,.004,1),gate:(x,y,z,nx,ny,nz)=>z<-2.05&&nz<-.3}]),               // la bande blanche du bouclier arrière
    dessus:japZones([
      NB,NP,
      {k:'d',p:japRect(lid.z0,lid.x0,lid.z1,lid.x1,.02,3),creux:.085,copie:'lid',gate:(x,y,z,nx,ny,nz)=>z>1.7&&ny>.4},                  // le LOGEMENT des phares (sous leurs capots)
      {k:'n',p:(()=>{const o=[];for(let i=0;i<=8;i++){const x=.66*i/8;o.push([zWB(x)+.012,x]);}for(let i=8;i>=0;i--){const x=.64*i/8;o.push([zWB(x)+.095,x]);}return o;})(),
        gate:(x,y,z,nx,ny,nz)=>z>.6&&z<.95&&ny>.5},                                                                                        // la grille d'auvent
      {k:'K',p:(()=>{const o=[];for(let i=0;i<=10;i++){const x=.705*i/10;o.push([zWB(x),x]);}o.push([ZPb+.005,.585],[.16,.40],[.145,0]);return o;})(),
        gate:(x,y,z,nx,ny,nz)=>z>.1&&z<.8&&ny>.2},                                                                                         // le PARE-BRISE : son cadre…
      {k:'g',p:(()=>{const o=[];for(let i=0;i<=10;i++){const x=.672*i/10;o.push([zWB(x)-.016,x]);}o.push([ZPb+.03,.555],[.175,.38],[.165,0]);return o;})(),
        gate:(x,y,z,nx,ny,nz)=>z>.1&&z<.8&&ny>.2},                                                                                         // …le verre
      {k:'K',p:[[-.905,0],[-.905,.555],[-.95,.575],[-1.30,.59],[-1.60,.60],[-1.735,.60],[-1.75,.58],[-1.75,0]],gate:(x,y,z,nx,ny,nz)=>z<-.8&&ny>.3},   // la LUNETTE : son cadre…
      {k:'g',p:[[-.925,0],[-.925,.535],[-.96,.555],[-1.30,.57],[-1.60,.58],[-1.72,.58],[-1.732,.56],[-1.732,0]],gate:(x,y,z,nx,ny,nz)=>z<-.8&&ny>.3}])}; // …le verre
  const LGN={
    cote:japLignes([
      {k:'j',p:[[.68,.231],[.69,.55],[.70,.85],[.66,.92],[.42,1.06],[.18,1.212],[-.10,1.215],[-.59,1.215],[-.59,.86],[-.63,.50],[-.60,.25],[-.575,.231],[.68,.231]]}]),        // la PORTIÈRE
    face:japLignes([{k:'h',p:[[0,.648],[.40,.648],[.62,.645]],gate:(x,y,z,nx,ny,nz)=>z>2.0}]),                                                                     // le bord du capot
    dos:japLignes([{k:'j',p:[[0,.765],[.40,.765],[.62,.768],[.70,.775]],gate:ar}]),                                                                                 // le bas du HAYON
    dessus:japLignes([
      {k:'j',p:[[.862,0],[.862,.60],[.85,.687],[1.0,.687],[1.40,.687],[lid.z0-.02,.687],[2.035,.687],[2.04,.60],[2.042,0]]},                                       // le CAPOT
      {k:'h',p:[[.90,.373],[1.20,.373],[1.50,.373],[lid.z0-.01,.373]]},                                                                                            // ses deux plis
      {k:'j',p:[[-.88,0],[-.88,.575],[-.92,.605],[-1.30,.615],[-1.60,.625],[-1.80,.63],[-1.93,.63]]}])};                                                           // le HAYON
  const CODES={p:{g:GP},gap:{g:GP,c:0x1a1a1e},K:{g:'g',c:PAL.K.c,lisse:1},g:{g:'g',c:PAL.g.c,lisse:1},d:{g:'m',c:PAL.d.c},s:{g:'s',c:0x2a2b30},
    c:{g:'c',c:0xd4d8de},O:{g:'g',c:PAL.O.c,lisse:1},q:{g:'g',c:0xd9dde2,lisse:1},L:{g:'l',c:0xc80e1c},n:{g:'g',c:PAL.n.c},b:{g:'s',c:0x141417},P:{g:'s',c:0xe6e7e1},R:{g:'s',c:0xd2d2ce}};
  {const f2=PL.done;PL.done=()=>{const gs=f2(),G=gs[GP];if(!G)return gs;
    const ns=japLisse(G,32);const out=japDecoupe(G,{zones:ZN,lignes:LGN,codes:CODES,ns:ns,GP:GP,colP:colP,colTri:1,cache:MEM,
      vue:(x,y,z,ax,ay,az,nx,ny,nz)=>{if(z>2.03&&nz>.25&&y<.66)return 'face';if(z<-1.9&&nz<-.25&&y<.93)return 'dos';
        // la serre : ce qui est en dedans du bord du toit est vu de dessus (pare-brise, pavillon, lunette), le reste de côté (les vitres)
        if(z<ZW&&z>ZHT&&y>.86&&ny>.2){const s9=S(z);if(Math.abs(x)<s9[NC+3][0]-.004)return 'dessus';}
        return null;}});
    LIDG=out.__lid||null;delete out.__lid;G.dispose();delete gs[GP];return japFusion(gs,out);};}
  K.commit(PL);if(K.muet)return {};
  // la hauteur de la tôle (le dessus) en (x, z) : sur la section de la tranche, interpolée entre deux tranches (la tôle telle qu'elle est)
  const ZS9=zs,SC9=ZS9.map(z=>S(z)),T=z=>{let i=0,j=ZS9.length-1;if(z<=ZS9[0])return SC9[0];if(z>=ZS9[j])return SC9[j];while(j-i>1){const m=(i+j)>>1;if(ZS9[m]<=z)i=m;else j=m;}
    const t=(z-ZS9[i])/(ZS9[j]-ZS9[i]),A=SC9[i],B=SC9[j];return A.map((p,q)=>[p[0]+(B[q][0]-p[0])*t,p[1]+(B[q][1]-p[1])*t]);};
  const yDessus=(x,z)=>{const s=T(z);for(let i=s.length-1;i>0;i--){const a=s[i],b=s[i-1];if((a[0]-x)*(b[0]-x)<=0&&a[0]!==b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return s[s.length-1][1];};
  // ---- LES DÉTAILS ----
  const P=K.kit(PAL);
  // LES RÉTROVISEURS : une coque noire sur le triangle de la portière, la glace vers l'arrière
  P.sym(sd=>{const x0=sd*.735,y0=.905,z0=.50;
    P.box('n',.05,.045,.10,x0+sd*.02,y0,z0);P.box('n',.06,.022,.035,x0+sd*.075,y0+.008,z0-.02,0,0,0);
    const cx=x0+sd*.165,cy=y0+.012,cz=z0-.045;
    P.box('n',.125,.088,.06,cx,cy,cz,0,sd*.10,0);P.box('K',.11,.074,.006,cx-sd*.003,cy,cz-.031,0,sd*.10,0);});
  // LES ESSUIE-GLACES, couchés sur la grille d'auvent
  for(const x of [-.32,.10])P.box('k',.46,.012,.018,x,yDessus(Math.abs(x),zWB(Math.abs(x))+.03)+.012,zWB(Math.abs(x))+.03,0,-.10,0);
  // LE SUPPORT DE PLAQUE, entre les feux : une boîte claire que la plaque du jeu reconnaît (`plqDessinee`) — elle s'y pose, pas sur le hayon
  P.box('Q',.40,.13,.006,0,.672,-2.036);
  // LA JOUE DES PASSAGES DE ROUE : du noir derrière la roue (on ne voit plus le ciel à travers l'aile)
  {const joue=(w,A9)=>{const o=[],a9=A9[A9.length-1][0];for(let i=A9.length-1;i>=0;i--){const p=A9[i];if(p[1]>=.17)o.push([w-p[0]*1.02,p[1]+.01]);}
      o.unshift([w-a9,.17]);for(let i=1;i<A9.length;i++){const p=A9[i];if(p[1]>=.17)o.push([w+p[0]*1.02,p[1]+.01]);}o.push([w+a9,.17]);return o;};
   P.sym(sd=>{P.prism('d',joue(ZF,ARF),.02,sd*.62);P.prism('d',joue(ZR,ARR),.02,sd*.62);});}
  K.commit(P);
  // ---- LE POT : un seul, à gauche, sous le bouclier ----
  let pots=[[.48,.24,-2.08]];
  if(typeof ECHP==='object'&&ECHP.reel&&typeof ECH_PAL==='object'){const E=K.kit(ECH_PAL);E.ech=1;ECHP.reel(E,{r:.03,k:'c',len:.30,pts:[[.48,.24,-2.08]]});K.commit(E);}
  /* ---- LES PHARES ESCAMOTABLES ----
     Comme ceux de LA CERISE : chaque boîtier est un coin fermé — dessus le CAPOT (les morceaux mêmes de la tôle découpés dans son logement :
     fermé, il affleure), deux joues noires, la FACE (un verre carré, le phare rond derrière, cerclé de chrome), le dessous et le dos noirs. Il
     PIVOTE de 40° autour d'un axe calculé pour que, levé, la face soit droite, son bas posé au ras du bord du capot (relevé sur le plan : le
     capot levé monte à 0,84 m au nez). Fermé, la face regarde vers le bas. */
  const TH=40*Math.PI/180,PH=[],PHG=K.add(new THREE.Group());
  {const xm9=(lid.x0+lid.x1)/2,zF=lid.z1-.006,H9=.18,F0=[zF,yDessus(xm9,zF)],B0=[zF-Math.sin(TH)*H9,F0[1]-Math.cos(TH)*H9],
         Bp=[lid.z1-.012,yDessus(xm9,lid.z1-.012)+.01],mz=(B0[0]+Bp[0])/2,my=(B0[1]+Bp[1])/2,dz9=Bp[0]-B0[0],dy9=Bp[1]-B0[1],d9=Math.hypot(dz9,dy9)||1e-6,
         h9=(d9/2)/Math.tan(TH/2),Pz=mz-dy9/d9*h9,Py=my+dz9/d9*h9;   // le centre de la rotation (sens direct dans le plan z-y) qui envoie le bas de la face B0 sur Bp
    for(const sd of [1,-1]){const Q=K.kit(PAL),L3=(x,y,z)=>[sd*x,y-Py,z-Pz];
      const xa=lid.x0+.01,xb=lid.x1-.01,ZR0=lid.z0+.02;
      const top=x=>{const o=[];for(let j=0;j<=8;j++){const z=lid.z0+.01+(zF-lid.z0-.01)*j/8;o.push(L3(x,yDessus(x,z)-.002,z));}return o;},
            fT=x=>L3(x,yDessus(x,zF),zF),fB=x=>{const t=fT(x);return [t[0],t[1]-Math.cos(TH)*H9,t[2]-Math.sin(TH)*H9];},
            r0=x=>L3(x,yDessus(x,ZR0)-.07,ZR0);
      for(const x of [xa,xb]){const T9=top(x),poly=T9.concat([fB(x),r0(x)]);let c=[0,0,0];for(const q of poly){c[0]+=q[0];c[1]+=q[1];c[2]+=q[2];}c=c.map(t=>t/poly.length);
        for(let q=0;q<poly.length;q++)Q.tri('K',c,poly[q],poly[(q+1)%poly.length]);}
      Q.tri('K',fB(xa),fB(xb),r0(xb));Q.tri('K',fB(xa),r0(xb),r0(xa));                                       // le dessous
      {const ta=top(xa)[0],tb=top(xb)[0];Q.tri('K',r0(xa),r0(xb),tb);Q.tri('K',r0(xa),tb,ta);}                 // le dos
      Q.tri('K',fT(xa),fB(xa),fB(xb));Q.tri('K',fT(xa),fB(xb),fT(xb));                                        // la face
      // le verre carré et le phare rond, dans le plan de la face
      const A9=fT(xa),B9=fT(xb),Ca=fB(xa),Cb=fB(xb),cen=[(A9[0]+B9[0]+Ca[0]+Cb[0])/4,(A9[1]+B9[1]+Ca[1]+Cb[1])/4,(A9[2]+B9[2]+Ca[2]+Cb[2])/4];
      const nz3=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];},cr3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
      const ux=nz3([B9[0]-A9[0],B9[1]-A9[1],B9[2]-A9[2]]),vH0=nz3([A9[0]-Ca[0],A9[1]-Ca[1],A9[2]-Ca[2]]);let nn=nz3(cr3(ux,vH0));if(nn[2]-nn[1]<0)nn=nn.map(t=>-t);
      const vH=nz3(cr3(nn,ux)),pq=(u,v,o2)=>[cen[0]+ux[0]*u+vH[0]*v+nn[0]*o2,cen[1]+ux[1]*u+vH[1]*v+nn[1]*o2,cen[2]+ux[2]*u+vH[2]*v+nn[2]*o2];
      const quad=(k,u0,v0,u1,v1,o2)=>{Q.tri(k,pq(u0,v0,o2),pq(u1,v0,o2),pq(u1,v1,o2));Q.tri(k,pq(u0,v0,o2),pq(u1,v1,o2),pq(u0,v1,o2));};
      const wq=Math.hypot(B9[0]-A9[0],B9[1]-A9[1],B9[2]-A9[2])/2-.022,hq=H9/2-.022;
      quad('c',-wq-.006,-hq-.006,wq+.006,hq+.006,.003);                                                        // le cerclage chromé du verre
      const disque=(r,k,o2,n,bom)=>{n=n||16;for(let q=0;q<n;q++){const a0=q/n*Math.PI*2,a1=(q+1)/n*Math.PI*2;
          Q.tri(k,pq(0,0,o2+(bom||0)),pq(Math.cos(a0)*r,Math.sin(a0)*r,o2),pq(Math.cos(a1)*r,Math.sin(a1)*r,o2));}};
      quad('K',-wq,-hq,wq,hq,.005);                                                                           // le fond du phare
      disque(.066,'c',.006,18);disque(.056,'W',.008,18,.01);                                                  // le phare rond : cerclage, glace bombée
      quad('q',-wq,-hq,wq,hq,.013);                                                                           // le verre carré (devant)
      const gs=Q.done(),piv=new THREE.Group(),bras=new THREE.Group();piv.position.set(0,Py,Pz);
      if(LIDG){const p9=LIDG.attributes.position.array,n9=LIDG.attributes.normal.array,c9=LIDG.attributes.color.array,PP=[],NN=[],CC=[];
        for(let t=0;t<p9.length;t+=9){if((p9[t]+p9[t+3]+p9[t+6])*sd<=0)continue;for(let q=0;q<9;q+=3){PP.push(p9[t+q],p9[t+q+1]-Py+.0012,p9[t+q+2]-Pz);NN.push(n9[t+q],n9[t+q+1],n9[t+q+2]);CC.push(c9[t+q],c9[t+q+1],c9[t+q+2]);}}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(PP,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(NN,3));g.setAttribute('color',new THREE.Float32BufferAttribute(CC,3));
        if(gs[GP])japFusion(gs,{[GP]:g});else gs[GP]=g;}
      for(const g in gs){const m=new THREE.Mesh(gs[g],(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null));m.userData.lp=1;bras.add(m);}
      piv.add(bras);PHG.add(piv);PH.push(bras);}}
  /* QUAND ILS SE LÈVENT (`AE86PH.mode`) — comme LA CERISE : 'nitro' (le choix de Léo pour elle : baissés, ils se lèvent à la nitro), 'course'
     (levés en course, un clin d'œil à l'arrivée au garage), 'toujours'. `dbgPhares(1|0|null)` les force (celui de LA CERISE, partagé). */
  {let k=0,t=0,cligne=0,vu=false,vu0=false;const anime=dt=>{dt=Math.min(dt||0,.1);t+=dt;
      let st=false,ga=false,ni=false;try{st=typeof started!=='undefined'&&started&&!gameOver;ga=typeof garageOn!=='undefined'&&garageOn;ni=typeof nitroOn!=='undefined'&&nitroOn;}catch(_){}
      const M9=(typeof AE86PH==='object'&&AE86PH)?AE86PH:{mode:'nitro',force:null},fo=typeof M9.force==='number'?M9.force:(typeof MX5PH==='object'&&MX5PH&&typeof MX5PH.force==='number')?MX5PH.force:null;
      if(ga&&!vu){cligne=1.4;}vu=ga;
      let vise=M9.mode==='toujours'?1:M9.mode==='nitro'?(ni?1:0):(st?1:0);
      let kG=null;if(cligne>0){cligne-=dt;const c=1.4-cligne;kG=c<.45?lis(c/.45):c<.75?1:c<1.2?1-lis((c-.75)/.45):0;}
      if(fo!=null)vise=fo;
      k+=(vise-k)*Math.min(1,dt*5.5);if(fo!=null&&!vu0){k=fo;}vu0=true;
      const kk=lis(cl(k,0,1));PH[0].rotation.x=-TH*(kG!=null&&fo==null?Math.max(kk,kG):kk);PH[1].rotation.x=-TH*kk;};
    anime(1/30);
    PHG.userData.anime=anime;
    if(typeof BLING==='object'&&BLING&&BLING.anim)BLING.anim.push(anime);}
  // ---- LA JANTE À HUIT BÂTONS (13 pouces), BRONZE : les bâtons droits du moyeu au rebord, le rebord poli, le cache-moyeu ; le pneu 185/70 ----
  const JW=.185,hw=JW/2,fx=hw-.03,RJ=.172,J=lpKit({k:{g:'m',c:0x161719},o:{g:'k',c:0x8a5a2c},a:{g:'c',c:0xb9bdc3},d:{g:'m',c:0x0f1013}});
  J.lathe('k',[[RJ,-hw],[R*.90,-hw],[R,-hw*.62],[R,hw*.62],[R*.90,hw],[RJ,hw]],24,0,0,0,'x');
  J.lathe('a',[[RJ,fx-.012],[RJ+.004,fx+.002],[RJ-.01,fx+.006],[RJ-.018,fx-.006]],24,0,0,0,'x');   // le rebord poli
  J.lathe('o',[[RJ-.018,-hw+.02],[RJ-.018,fx-.02],[.06,fx-.035],[0,fx-.035]],20,0,0,0,'x');        // le fond (bronze : on le voit entre les bâtons)
  J.lathe('d',[[RJ-.03,-hw+.03],[RJ-.03,fx-.03],[.07,fx-.04]],20,0,0,0,'x');
  {const sh=new THREE.Shape();sh.moveTo(-.014,.05);sh.lineTo(.014,.05);sh.lineTo(.009,.158);sh.lineTo(-.009,.158);sh.lineTo(-.014,.05);
   for(let q=0;q<8;q++){const g=new THREE.ExtrudeGeometry(sh,{depth:.022,bevelEnabled:true,bevelThickness:.004,bevelSize:.004,bevelSegments:1,curveSegments:1});
     g.rotateY(-Math.PI/2);g.rotateX(q/8*Math.PI*2+Math.PI/8);g.translate(fx+.002,0,0);J.put('o',g,0,0,0);}}
  J.lathe('o',[[.062,fx-.03],[.06,fx+.004],[.05,fx+.012],[0,fx+.014]],16,0,0,0,'x');               // le moyeu
  J.lathe('a',[[.03,fx+.012],[.026,fx+.022],[0,fx+.025]],12,0,0,0,'x');                            // le cache-moyeu
  const JG=J.done();
  return {hl:[.53,.76,2.03],tl:[.52,.68,-2.06],wx:.685,wzF:ZF,wzR:-ZR,pots:pots,lamps:0,halos:0,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null));m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0x8a5a2c}};
};
