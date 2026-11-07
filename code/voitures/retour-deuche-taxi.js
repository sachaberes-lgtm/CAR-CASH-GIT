/* ===== LA DEUCHE ET LE TAXI JAUNE REVIENNENT (2026-11-07, Léo : « la douche a disparu… le taxi remets ») =====
   Leurs dessins (`a_deuche`, `a_taxi`) avaient été supprimés du code à la gamme resserrée du 07/10 : repris tels quels de l'index.html d'avant (commit ccfbb021^). Leurs fiches sont dans CARS (cars.js), leurs prix dans CAR_UNLOCK (deblocage.js). */
SHAPES.a_deuche=function(K){
  /* LA DEUCHE — la 2 CV Charleston : caisse étroite et haute, bordeaux dessus, NOIR dessous en coup de
     pinceau ; ailes galbées posées À PART sur les roues, phares ronds perchés sur leurs tiges, capot à
     nervures, et le toit de toile ROULÉ à l'arrière (on voit les sièges). */
  const U=LPU,R=.30,ZF=1.18,ZR=-1.22;
  const P=K.kit({p:{g:'p',c:0x7a1426},n:{g:'p',c:0x121212,f:0},s:{g:'s',c:0x1e1e22},S:{g:'s',c:0x3a3438},
    k:{g:'m',c:0x141518},c:{g:'c',c:0xe9ecf0},g:{g:'g',c:0x1b2733},W:{g:'l',c:0xfff3d6},L:{g:'l',c:0xff1f2e},O:{g:'l',c:0xffa21a}});
  const AR=[[0,2*R+.06],[R*.70,2*R+.04],[R+.10,R*1.10],[R+.16,.34]];
  const zs=[-1.88,-1.76,-1.55,-1.35,-1.12,-.92,-.71,-.70,-.62,-.02,.04,.38,.40,.72,1.40,1.72,1.88];
  for(const w of [ZF,ZR])for(const d of [R*.70,R+.16])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const CW=.72,HD=.40,
        yC=z=>U.lin([[-1.88,.62],[-1.76,.86],[-1.55,1.10],[-1.35,1.27],[-1.10,1.40],[-.71,1.50],[-.30,1.53],[HD,1.52],[CW,1.03],[1.40,.93],[1.88,.82]],z),
        xW=z=>U.lin([[-1.88,.50],[-1.72,.58],[-1.35,.62],[CW,.62],[1.00,.56],[1.88,.44]],z),
        open=z=>z<.385&&z>-.705;
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.32),c=yC(z),xw=xW(z);
    if(z>CW){return [[0,yb],[xw-.04,yb],[xw,yb+.04],[xw,Math.max(yb+.05,c-.16)],[xw-.02,c-.09],[xw*.80,c-.04],[xw*.55,c-.015],[xw*.30,c-.004],[xw*.12,c],[0,c+.002]];}
    const bl=Math.min(.98,c-.14),xg=xw-.03,xr=xw-.09;
    const s=[[0,yb],[xw-.04,yb],[xw,yb+.04],[xw,bl],[xg,bl+.02],[xr,Math.max(bl+.03,c-.08)],[xr-.05,Math.max(bl+.04,c-.01)]];
    if(open(z))s.push([xr-.09,c-.07],[xr-.12,.80],[0,.78]);
    else s.push([xr*.62,c+.004],[xr*.30,c+.012],[0,c+.015]);
    return s;
  },(j,z,y)=>{
    if(j===0)return 'k';
    if(j<0)return j===-1?'k':'p';
    if(z>CW)return 'n';                                              /* le capot noir */
    if(j===1)return 'n';
    if(j===4){if(z>.04&&z<.70)return 'g';if(z>-.60&&z<-.02)return 'g';if(z>-1.12&&z<-.66&&y>1.02)return 'g';return 'p';}
    if(j<=5)return 'p';
    if(z>HD)return 'g';                                              /* pare-brise */
    if(open(z))return j===6?'p':'S';                                 /* l'habitacle, à ciel ouvert */
    if(z>-.72)return 'p';
    if(z>-1.36){if(j>=8&&z<-.91&&z>-1.13)return 'g';return 's';}   /* la toile et sa petite lunette */
    return 'p';});
  /* LES AILES À PART : deux lofts ouverts, galbés sur les roues */
  const wing=(z0,z1,zsW,top,lo,xo)=>{P.loft(zsW,z=>{const t=U.lin(top,z),l=Math.min(lo(z),t-.05),x=U.lin(xo,z);
      return [[.47,l],[x-.03,l],[x,l+.03],[x,t-.07],[x-.07,t],[.47,t-.01]];},(j)=>j<0?'x':'n');};
  const zF=[.40,.52,.70,ZF-R-.10,ZF-R*.7,ZF+R*.7,ZF+R+.10,1.70,1.84,1.92];
  wing(.40,1.95,zF,[[.40,.36],[.52,.50],[.70,.66],[ZF,.84],[1.55,.80],[1.84,.62],[1.92,.44]],
       z=>U.arch(z,[ZF],[[0,2*R+.07],[R*.70,2*R+.05],[R+.10,R*1.10],[R+.17,.34]],.33),[[.40,.66],[.70,.73],[1.60,.73],[1.92,.62]]);
  const zR=[-1.80,-1.70,-1.52,ZR-R*.7,ZR+R*.7,-.78,-.66,-.60];
  wing(-1.80,-.60,zR,[[-1.80,.50],[-1.70,.64],[-1.50,.76],[ZR,.80],[-.80,.70],[-.66,.54],[-.60,.40]],
       z=>U.arch(z,[ZR],[[0,.56],[R*.75,.54],[R+.06,.42]],.40),[[-1.80,.64],[-1.60,.74],[-.78,.74],[-.60,.70]]);
  /* le coup de pinceau noir de la Charleston, et le bas de caisse */
  P.sym(sd=>{
    P.prism('n',[[.72,.99],[.40,.96],[.10,.89],[-.20,.77],[-.42,.62],[-.62,.46],[-.62,.33],[.72,.33]],.008,sd*.624);
    P.box('k',.10,.06,1.06,sd*.60,.33,-.10);
    for(const z of [.72,.02,-.62])P.box('k',.01,.62,.012,sd*.623,.66,z);
    P.box('c',.03,.12,.03,sd*.63,.70,.66);P.box('c',.03,.12,.03,sd*.63,.70,.08);
    P.box('c',.03,.025,.10,sd*.63,.90,.10);P.box('c',.03,.025,.10,sd*.63,.90,-.54);
    /* LES PHARES RONDS SUR LEURS TIGES */
    P.box('n',.04,.12,.04,sd*.52,.84,1.60);
    P.lathe('c',[[0,-.09],[.07,-.08],[.10,-.02],[.10,.06]],10,sd*.52,.94,1.60,'z');
    P.cyl('W',.085,.02,10,sd*.52,.94,1.665,'z');
    P.box('O',.05,.04,.06,sd*.64,.76,1.70);
    /* rétro rond sur la portière */
    P.box('k',.02,.10,.02,sd*.64,1.04,.64);P.cyl('c',.05,.02,8,sd*.66,1.12,.64,'z');
    /* feux arrière sur la poupe */
    P.box('L',.10,.12,.04,sd*.42,.74,-1.80,.55);P.box('O',.10,.05,.04,sd*.42,.65,-1.83,.55);
    /* butoirs */
    P.box('c',.05,.12,.05,sd*.36,.40,1.945);P.box('c',.05,.12,.05,sd*.36,.40,-1.935);
  });
  /* LE CAPOT À NERVURES : cinq côtes d'acier */
  for(let i=-2;i<=2;i++){const x=i*.10,zc=1.30;P.box('n',.03,.03,1.02,x,yC(zc)+.012-.035*Math.abs(i)*Math.abs(i)*.25,zc,.19);}
  /* la calandre à lamelles, cerclée de chrome */
  P.plate('c',[[-.30,.44],[.30,.44],[.33,.76],[-.33,.76]],.02,1.88);
  P.plate('k',[[-.26,.47],[.26,.47],[.29,.73],[-.29,.73]],.02,1.89);
  for(let i=0;i<5;i++)P.box('c',.54,.018,.02,0,.50+i*.055,1.91);
  /* pare-chocs tubulaires */
  P.cyl('c',.03,1.30,8,0,.40,1.94,'x');P.cyl('c',.03,1.30,8,0,.40,-1.93,'x');
  /* le toit ouvert : banquette, sièges hamac, volant, et la TOILE ROULÉE */
  P.sym(sd=>{P.box('s',.40,.40,.08,sd*.24,.98,-.10,-.20);P.box('s',.40,.08,.40,sd*.24,.80,.08);});
  P.box('s',.96,.36,.08,0,.96,-.62,-.18);
  P.lathe('k',[[.14,-.012],[.14,.012]],10,.26,1.00,.34,'z');
  P.cyl('s',.075,1.02,10,0,1.52,-.70,'x');
  P.cyl('c',.035,.10,8,.40,.33,-1.90,'z');
  K.commit(P);
  return {hl:[.52,.94,1.68],tl:[.42,.74,-1.84],wx:.62,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.15,style:'enjoliveur',jante:0x8a1a2c}};
};
SHAPES.a_taxi=function(K){
  /* LE TAXI JAUNE — la grosse propulsion de Manhattan : trois volumes interminables, calandre chromée
     en caisson, le lumineux sur le toit, le DAMIER noir et blanc sur les flancs, pare-chocs de tank. */
  const U=LPU,R=.34,ZF=1.62,ZR=-1.29;
  const P=K.kit({p:{g:'p',c:0xffc61a},n:{g:'p',c:0x141414,f:0},w:{g:'p',c:0xf4f2ec,f:0},k:{g:'m',c:0x141518},
    K:{g:'g',c:0x0c0d10},c:{g:'c',c:0xe9ecf0},g:{g:'g',c:0x1b2733},W:{g:'l',c:0xfff3d6},T:{g:'l',c:0xfff0b8},
    L:{g:'l',c:0xff1f2e},r:{g:'l',c:0x8a0d16},O:{g:'l',c:0xffa21a}});
  const AR=[[0,2*R+.05],[R*.60,2*R+.03],[R*.98,R*1.18],[R+.12,.32]];
  const CW=1.32,RF=.52,RR=-.78,RB=-1.46;
  const zs=[-2.62,-2.54,-2.34,RB,RR,-.52,-.02,.08,RF,CW,2.26,2.54,2.62];
  for(const w of [ZF,ZR])for(const d of [R*.60,R*.98,R+.12])zs.push(w-d,w+d);
  zs.sort((a,b)=>a-b);
  const yC=z=>U.lin([[-2.62,.94],[-2.54,1.00],[-2.34,1.02],[RB,1.04],[RR,1.42],[-.60,1.44],[RF,1.44],[CW,1.00],[2.26,.96],[2.54,.92],[2.62,.82]],z),
        xW=z=>U.lin([[-2.62,.92],[-2.48,.96],[2.40,.96],[2.62,.90]],z),cab=z=>z>RB-.001&&z<CW+.001;
  P.loft(zs,z=>{
    const yb=U.arch(z,[ZF,ZR],AR,.32),c=yC(z),xw=xW(z),y2=Math.max(.58,yb+.06);
    if(cab(z)){const xr=U.lin([[RB,.84],[RR,.74],[RF,.74],[CW,.84]],z);
      return [[0,yb],[xw-.07,yb],[xw,y2],[xw,.90],[xw-.03,1.00],[xw-.08,1.02],[xr,Math.max(1.03,c-.06)],[xr-.10,c],[0,c+.015]];}
    const y4=Math.min(1.00,c-.03);
    return [[0,yb],[xw-.07,yb],[xw,y2],[xw,Math.min(.90,c-.10)],[xw-.03,y4],[xw-.10,Math.max(y4+.002,c-.01)],[xw-.30,c],[xw-.62,c+.006],[0,c+.01]];
  },(j,z)=>{
    if(j===0)return 'k';
    if(j===5&&cab(z)){if(z>.08&&z<1.26)return 'g';if(z>-.52&&z<-.02)return 'g';if(z>-.02&&z<.08)return 'K';return 'p';}
    if(j===7&&((z>RF&&z<CW)||(z>RB&&z<RR)))return 'g';
    return 'p';});
  /* LE DAMIER : bande blanche, carreaux noirs posés à plat sur le flanc */
  const sq=.09,z0=-1.02,nC=24;
  P.sym(sd=>{const x=sd*.966;
    P.box('w',.004,2*sq+.02,nC*sq+.02,sd*.960,.80,z0+nC*sq/2);
    for(let i=0;i<nC;i++)for(let r=0;r<2;r++){if((i+r)%2)continue;
      const za=z0+i*sq,zb=za+sq,ya=.80-sq+r*sq,yb2=ya+sq;
      P.tri('n',[x,ya,za],[x,ya,zb],[x,yb2,zb]);P.tri('n',[x,ya,za],[x,yb2,zb],[x,yb2,za]);}
  });
  /* LA FACE : calandre-caisson chromée, phares rectangulaires, pare-chocs de tank */
  P.plate('c',[[-.44,.60],[.44,.60],[.50,.66],[.50,.88],[.44,.94],[-.44,.94],[-.50,.88],[-.50,.66]],.03,2.61);
  P.plate('K',[[-.42,.63],[.42,.63],[.46,.68],[.46,.86],[.42,.90],[-.42,.90],[-.46,.86],[-.46,.68]],.02,2.635);
  for(let i=0;i<2;i++)P.box('c',.90,.02,.02,0,.72+i*.09,2.655);
  for(let i=-2;i<=2;i++)P.box('c',.02,.26,.02,i*.18,.77,2.655);
  P.box('p',1.90,.26,.20,0,.44,2.60);P.box('n',1.94,.08,.04,0,.48,2.695);P.box('k',1.50,.08,.03,0,.34,2.702);
  P.box('p',1.88,.28,.20,0,.46,-2.60);P.box('n',1.92,.08,.04,0,.50,-2.695);
  P.sym(sd=>{
    P.box('k',.36,.18,.02,sd*.72,.80,2.622);P.box('W',.32,.14,.03,sd*.72,.80,2.625);
    P.box('O',.03,.12,.20,sd*.955,.80,2.48);P.box('O',.10,.06,.02,sd*.60,.62,2.705);
    /* feux arrière enveloppants et le catadioptre central */
    P.box('L',.44,.20,.03,sd*.70,.86,-2.625);P.box('L',.03,.20,.18,sd*.935,.86,-2.52);
    P.box('W',.12,.08,.035,sd*.58,.86,-2.628);
    P.box('K',.08,.30,.03,sd*.80,1.16,.54,0,0,0);
    /* rétros, poignées, joncs chromés de caisse */
    P.box('k',.06,.05,.10,sd*.93,1.05,1.18);P.box('k',.08,.13,.18,sd*.97,1.08,1.16);
    P.box('c',.03,.03,.16,sd*.965,.98,.62);P.box('c',.03,.03,.16,sd*.965,.98,-.36);
    P.box('c',.012,.02,2.66,sd*.958,.975,-.08);
    for(const z of [1.30,.06,-.52])P.box('k',.012,.36,.012,sd*.962,.84,z);
    P.cyl('c',.05,.10,8,sd*.44,.36,-2.67,'z');
  });
  P.box('r',.46,.16,.02,0,.86,-2.625);
  /* LE LUMINEUX DE TOIT, sur son socle noir */
  P.box('n',.86,.05,.30,0,1.475,-.10);
  P.prism('T',[[-.16,1.50],[.16,1.50],[.10,1.68],[-.10,1.68]],.78,0);
  P.prism('n',[[-.11,1.68],[.11,1.68],[.10,1.70],[-.10,1.70]],.80,0);
  P.sym(sd=>P.prism('n',[[-.16,1.50],[.16,1.50],[.10,1.68],[-.10,1.68]],.02,sd*.40));
  K.commit(P);
  return {hl:[.72,.80,2.64],tl:[.70,.86,-2.64],wx:.83,wzF:ZF,wzR:-ZR,
          lpw:{R:R,w:.24,style:'enjoliveur',jante:0xd6dade}};
};
