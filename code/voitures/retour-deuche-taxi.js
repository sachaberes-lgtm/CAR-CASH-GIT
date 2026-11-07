/* ===== LE TAXI JAUNE REVIENT (2026-11-07, Léo : « le taxi remets ») =====
   Son dessin (`a_taxi`) avait été supprimé du code à la gamme resserrée du 07/10 : repris tel quel de l'index.html d'avant (commit ccfbb021^). Sa fiche est dans CARS (cars.js), son prix dans CAR_UNLOCK (deblocage.js). LA DEUCHE (THE TIN SNAIL), revenue le même jour, est retirée de nouveau (« enlève la tin snail ») : son dessin `a_deuche` est dans l'historique git. */
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
