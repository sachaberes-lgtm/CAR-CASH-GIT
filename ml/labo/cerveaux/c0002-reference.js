/* ===== LE BOT DE REFERENCE (2026-11-23, etape 1 BOTS-ML : « un bot ecrit a la main sert de reference ») =====
   Un programme LISIBLE, ecrit a la main, sans rien d'appris : c'est le point de depart que les cerveaux ecrits par Claude devront battre,
   et l'exemple du contrat (decide(vue, memoire) → un ordre ; voir README.md).
   Ce qu'il sait faire : tenir la route, suivre les pieces et les plaques, eviter les flaques, pousser la NITRO dans les droites,
   lancer une figure sur la route quand la jauge le permet, se reposer sur la route apres une sortie, tourner une figure en vol quand
   il a le temps. Ce qu'il ne fait PAS : chercher un raccourci (il ne quitte jamais la route expres), le drift, les combos. */
const REGLAGES={
  marge:9,          /* m gardes entre la caisse et le bord de la route */
  virageDoux:.22,   /* rad : en dessous, a 150 m, la route est « droite » */
  nitroMin:.45,     /* part de jauge au-dessus de laquelle on pousse la NITRO dans une droite */
  figureMin:.6,     /* part de jauge pour lancer une figure sur la route (elle coute 35 %, sa pose en rend 40 %) */
  figureTous:4,     /* s au moins entre deux figures sur la route */
  sautVirage:.12,   /* rad : la route doit tourner moins que ca a 300 m pour qu'on ose sauter */
  sautDevers:.2,    /* rad : …et se pencher moins que ca jusqu'a 550 m */
  sautPente:.07,    /* rad : …et ne pas descendre plus que ca (7 %) */
  piqueDelai:2,     /* s : en vol, au-dela de ce delai avant de retrouver la route, on pique */
  volFigure:1.1     /* s de vol qu'il doit rester pour lancer une figure en l'air */
};
const cl=(v,a,b)=>v<a?a:v>b?b:v;

function auSol(vue,m){
  const R=REGLAGES,max=vue.demi-R.marge;
  const v100=vue.route[2].virage,v150=vue.route[3].virage,v300=vue.route[5].virage;
  /* LA LIGNE : l'interieur du virage qui vient (on y arrive avant lui), sinon le milieu */
  let ligne=cl(v150*60,-max*.7,max*.7);
  /* ce qui se ramasse, du plus proche au plus loin : la file de pieces, puis les plaques, les fruits et les orbes a portee de volant */
  const portee=d=>Math.max(4,d*.22);
  const prend=(o)=>Math.abs(o.lat-vue.lat)<portee(o.d)&&Math.abs(o.lat)<max;
  const file=vue.piecesDevant.find(p=>p.d>20&&p.d<160&&prend(p));
  if(file)ligne=file.lat;
  for(const liste of [vue.fruits,vue.orbes,vue.plaques]){const o=liste.find(x=>x.d>25&&x.d<220&&prend(x));if(o){ligne=o.lat;break;}}
  /* une flaque sur la ligne : on passe a cote, du cote ou il y a le plus de place */
  for(const f of vue.flaques){if(f.d<5||f.d>140)continue;if(Math.abs(f.lat-ligne)<f.rayon+3)ligne=f.lat+(f.lat>0?-1:1)*(f.rayon+5);}
  ligne=cl(ligne,-max,max);
  const droit=Math.abs(v100)<R.virageDoux*.7&&Math.abs(v150)<R.virageDoux&&Math.abs(v300)<R.virageDoux*2.2;
  const pose=Math.abs(vue.lat)<max&&Math.abs(vue.cap)<.18&&!vue.glisse&&!vue.rebond&&!vue.dessous;
  const ordre={ligne:ligne,nitro:droit&&pose&&(vue.nitroLibre||vue.nitro+vue.reserve>R.nitroMin)};
  /* UNE FIGURE SUR LA ROUTE : dans une droite, bien pose, la jauge assez pleine, pas trop souvent, pas juste avant le portail.
     UN SAUT a la place, une fois sur deux, si la route reste droite et ne remonte pas sur 400 m (de quoi se reposer dessus). */
  if(droit&&pose&&!vue.figureRoute&&vue.fin>600&&vue.vitesse>45&&vue.nitro>R.figureMin&&vue.t-(m.tFigure||-99)>R.figureTous){
    /* …et ne se penche pas : devant une route qui se vrille ou passe a l'envers, un saut ne retombe sur rien (MESURE : canyon, mort « vide ») */
    const v400=vue.route[6].virage,aPlat=Math.abs(vue.devers)<R.sautDevers&&vue.route.every(r=>!r.envers&&Math.abs(r.devers)<R.sautDevers);
    /* …et ne plonge pas : sur une forte descente, un petit saut pris vite ne retombe plus (MESURE : jade et canyon, morts « air ») */
    const pentu=vue.pente<-R.sautPente||vue.route[6].monte<-400*R.sautPente;
    const libre=aPlat&&!pentu&&Math.abs(v300)<R.sautVirage&&Math.abs(v400)<R.sautVirage*1.6&&vue.route[6].monte<2&&!vue.route.some(r=>r.trou);
    m.tFigure=vue.t;m.n=(m.n|0)+1;
    if(libre&&Math.abs(vue.lat)<vue.demi*.5&&m.n%2===0){ordre.geste='saut';ordre.direction='avant';}
    else{ordre.geste='figure';ordre.direction=m.n%4<2?'gauche':'droite';}
    ordre.nitro=false;}
  return ordre;
}

function enVol(vue,m){
  const R=REGLAGES,f=vue.vol,ordre={volant:0,manche:0,nitro:false};
  /* REVENIR SE POSER : l'anneau de pose quand le jeu le montre, sinon la route la plus proche (se remettre dans son axe, au-dessus d'elle) */
  if(f.anneau)ordre.volant=cl(f.anneau.gisement*2.2,-1,1);
  else if(f.proche&&Math.abs(f.proche.axe)<1.6){
    const versAxe=cl(-f.proche.lat/40,-.6,.6);            /* le cap qui ramene au-dessus de la route */
    ordre.volant=cl((versAxe-f.proche.axe)*1.6,-1,1);
    /* sous le niveau de la route et a cote d'elle : planer pour ne pas passer dessous */
    if(Math.abs(f.proche.lat)>vue.demi&&f.proche.haut<4&&f.proche.haut>-12&&vue.nitro>.1)ordre.nitro=true;
  }
  /* TROP HAUT : la route descend sous la caisse plus vite qu'elle ne tombe (MESURE : jade, 198 m au-dessus de la route apres 5 s, mort « air »).
     Si on n'y sera pas dans les 2 s, ou pas avant la fin du temps d'air : piquer (↑), le nez vers la route. */
  if(f.proche&&f.proche.haut>10&&Math.abs(f.proche.lat)<vue.demi*2){
    const delaiRoute=f.proche.haut/Math.max(1,f.proche.versRoute);
    if(delaiRoute>R.piqueDelai||delaiRoute>f.reste-1)ordre.manche=-1;}
  /* UNE FIGURE EN VOL : si le jeu annonce assez de temps avant la pose, et que rien ne tourne deja */
  const delai=f.anneau?f.anneau.delai:0;
  if(!f.figure&&delai>R.volFigure&&f.reste>delai+.5&&vue.nitro>.4&&vue.t-(m.tVol||-99)>1.2){
    m.tVol=vue.t;m.nv=(m.nv|0)+1;
    ordre.geste='figure';ordre.direction=['avant','gauche','arriere','droite'][m.nv%4];}
  return ordre;
}

module.exports={
  nom:'reference',
  REGLAGES:REGLAGES,
  decide:function(vue,m){return vue.mode==='sol'?auSol(vue,m):vue.mode==='vol'?enVol(vue,m):{};}
};
