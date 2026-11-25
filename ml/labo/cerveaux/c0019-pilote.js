/* ===== LE PREMIER PILOTE DE L'ECURIE (2026-11-25, etape C — Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   VARIANTE « LA VITESSE AVANT LES VIRAGES » : une seule idee changee par rapport au parent c0017, la decision de la NITRO au sol.
   Le parent jugeait la nitro sur le virage sous les roues (et le prochain s'il etait a moins de 3 s), a la vitesse du moment. Deux defauts :
   · ALLUMER la nitro fait bondir la vitesse (MESURE, graine 910666, jade : 116 → 131 m/s en 0,1 s a l'allumage, puis la caisse sort a 36 s) ;
     un virage « sur » a 116 m/s ne l'est plus a 131, et la main met 0,2 s a corriger ;
   · le virage qui compte est celui ou la caisse SERA quand la vitesse aura pris effet, pas celui sous ses roues.
   Donc : la route est jugee a la vitesse PREVUE (vitesse × boost), sur tout l'horizon de 2,5 s (vue.route), et la marge de vSure aussi.
   La nitro est lachee AVANT le virage, plus dedans. Et on ne l'allume pas au milieu d'un changement de ligne (c'est un virage aussi).
   SA STRATEGIE, EN CLAIR (inchangee pour le reste).
   Le palier, c'est des pieces, et les pieces, c'est du temps de course : ce pilote cherche d'abord a NE PAS MOURIR, ensuite a ramasser.
   Sa main est un clavier (modele `clavier`) : un ordre met 0,2 s a partir, le volant part par coups a fond de duree tiree au hasard, la main
   voit la route avec 0,15 s de retard.
   1. AU SOL, LA LIGNE. Il vise ce qui se ramasse de LOIN (la ligne parfaite, puis les pieces, puis les pouvoirs) ; sa ligne GLISSE vers sa cible.
   2. LE VIRAGE D'APRES. Il se place du cote INTERIEUR du virage qui vient, et donne a la main un cap d'AVANCE sur le changement de sens.
   3. LA NITRO LA OU ELLE SERT — jugee a la vitesse qu'elle donnera, sur les 2,5 s qui viennent (cette variante).
   4. EN VOL, LE RADAR (inchange).
   5. PAS DE RISQUE GRATUIT : ni saut, ni figure, ni raccourci cherche, ni drift, ni frein.
   La seconde chance est prise comme dans les deux meilleures parties des joueurs : une fois, dans une longue partie (palier 12 et plus). */
const PROFIL={
  modele:'clavier',graine:1,                 /* la main mesuree sur les joueurs au clavier (doigts.js, MAIN_CLAVIER), sans rien y ecrire par-dessus */
  chance:{prend:1,palierMin:12}              /* la seconde chance : dans les longues parties seulement (les joueurs : aux paliers 14 et 28) */
};
const REGLAGES={
  marge:10,          /* m gardes entre la ligne visee et le bord (la reference : 9, avec une main de machine) */
  bandeDecor:99,     /* m : sur une map a decor, la ligne visee ne s'ecarte pas plus de l'axe (99 = pas de limite) */
  nitroDecor:.62,    /* sur une map a decor, les seuils de virage de la nitro sont multiplies par ca (0 = jamais de nitro) */
  margeCouloir:15,   /* m gardes dans un couloir : le bord y est un mur */
  avance:.3,         /* s : on ne vise rien de plus proche (la reaction du volant : 0,2 s) */
  glisse:.12,        /* rad : la ligne visee ne se deplace pas plus vite que ce cap-la */
  glisseUrgence:.3,  /* le meme quand la route lache */
  ligneLoin:320,     /* m : un objet de la ligne parfaite se vise jusque-la */
  piecesLoin:180,    /* m : une tranche de pieces se vise jusque-la */
  capLigne:.3,       /* rad : le cap le plus fort demande pour rejoindre la ligne */
  avanceCap:.25,     /* s : le cap prend cette avance sur le changement de lacet de la route */
  capAvance:.25,     /* rad : l'avance ne depasse pas ca */
  braqueDoux:.15,    /* part de volant que demande un virage : en dessous, toute la largeur est permise */
  braqueFort:.5,     /* au-dessus, on se tient au moins a mi-largeur du cote INTERIEUR */
  braqueNitro:.4,    /* au-dessus, pas de nitro (.3 pour l'allumer) ; sur les maps a decor : multiplie par nitroDecor */
  margeAllumer:.2,   /* part de la vitesse PREVUE : vSure doit la depasser d'autant pour ALLUMER la nitro… */
  margeTenir:.05,    /* …et d'autant pour la GARDER (la vitesse prevue contient deja le bond de la nitro) */
  boost:1.12,        /* MESURE (910666) : 116 → 131 m/s a l'allumage. La route est jugee a vitesse × ca */
  horizonNitro:[.4,.7,1,1.4,1.9,2.5],   /* s : les instants ou l'on regarde le lacet de la route a venir */
  horizonVirage:3.5, /* s : un virage annonce (vue.virage) plus proche que ca compte pour la nitro */
  capCalme:.12,      /* rad : au-dela, la caisse change de ligne — on n'allume pas la nitro au milieu */
  jaugeAllume:.45,   /* jauge + reserve au-dessus de laquelle la nitro s'allume… */
  jaugeCoupe:.25,    /* …et en dessous de laquelle elle se coupe (le fond garde pour planer en vol) */
  capMax:.22,        /* rad : au-dela, la caisse est de travers, pas de nitro */
  bascule:10,        /* points qu'un rayon doit avoir de plus que la facon tenue pour qu'on en change */
  tenirFacon:.35,    /* s au moins sur une facon avant d'en changer (sauf si elle mene a la mort) */
  derive:.3          /* s : apres la pose, la caisse glisse dans son axe ce temps-la avant que le volant morde */
};
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const cote=o=>o.latC!=null?o.latC:o.lat;     /* sous la dalle, le lat des pieces, fruits et orbes est en miroir : latC */

/* ---------- AU SOL ---------- */
function aRamasser(v,max){
  const R=REGLAGES,dmin=Math.max(15,v.vitesse*R.avance);
  const prend=(d,lat)=>d>=dmin&&Math.abs(lat)<=max&&Math.abs(lat-v.lat)<Math.max(3,(d-v.vitesse*.25)*R.glisse*.85);
  const L=v.ligne&&Array.isArray(v.ligne.objets)?v.ligne.objets:[];
  const obj=L.find(o=>o&&o.d<R.ligneLoin&&prend(o.d,o.lat));
  const P=Array.isArray(v.piecesDevant)?v.piecesDevant:[];
  const file=P.find(p=>p&&p.d<R.piecesLoin&&prend(p.d,cote(p)));
  const O=Array.isArray(v.orbes)?v.orbes:[];
  const orbe=O.find(o=>o&&o.d<220&&prend(o.d,cote(o)));
  if(obj&&(!file||obj.d<=file.d+10||obj.d<v.vitesse*1.2))return obj.lat;
  if(orbe&&(!file||orbe.d<=file.d+10))return cote(orbe);
  if(file)return cote(file);
  if(obj)return obj.lat;
  return null;
}
/* DE COMBIEN LA ROUTE AURA TOURNE a d metres devant (rad, + a gauche) */
function tourne(v,d){
  const rt=Array.isArray(v.route)?v.route:[];
  let d0=0,a0=0;
  for(const p of rt){if(!p)continue;if(d<=p.d)return a0+(p.virage-a0)*(d-d0)/Math.max(1,p.d-d0);d0=p.d;a0=p.virage;}
  return a0;
}
/* LE LACET DE LA ROUTE DANS t SECONDES (rad/s), a la vitesse vit */
function lacetDans(v,t,vit){return (tourne(v,vit*(t+.15))-tourne(v,vit*Math.max(0,t-.15)))/(t<.15?t+.15:.3);}
/* LE VIRAGE LE PLUS SERRE DES SECONDES QUI VIENNENT, a la vitesse prevue (part de volant qu'il demandera) :
   c'est lui que la nitro doit respecter, pas celui sous les roues — la vitesse prise maintenant y sera encore. */
function forceAVenir(v,vit,lmax){
  let f=0;
  for(const T of REGLAGES.horizonNitro){const x=Math.abs(lacetDans(v,T,vit))/lmax;if(x>f)f=x;}
  return f;
}
const DECOR={canyon:1,grotte:1,jade:1,ville:1};
function auSol(v,m){
  const R=REGLAGES,vg=v.virage,tn=v.tenue,vit=Math.max(6,v.vitesse),lmax=Math.max(.05,v.lacetMax||1);
  const couloir=(v.mur&&v.mur.ici)||(Array.isArray(v.couloirs)&&v.couloirs.some(c=>c&&c.d0<vit*2&&c.d1>0));
  const decor=!!DECOR[v.carte],max=Math.min(decor?R.bandeDecor:99,v.demi-(couloir?R.margeCouloir:R.marge));
  let cible=0;
  const but=aRamasser(v,max);
  if(but!=null)cible=but;
  const lIci=v.lacetRoute||0,lTot=lacetDans(v,.4,vit),lTard=lacetDans(v,1,vit);
  let lFort=lTard;
  if(Math.abs(lTot)>Math.abs(lFort))lFort=lTot;
  if(Math.abs(lIci)*.6>Math.abs(lFort))lFort=lIci;
  const force=Math.abs(lFort)/lmax,sens=lFort>0?1:-1,u=cl((force-R.braqueDoux)/(R.braqueFort-R.braqueDoux),0,1);
  if(u>0){const plancher=max*(-1+1.5*u);if(cible*sens<plancher)cible=sens*plancher;}
  const F=Array.isArray(v.flaques)?v.flaques:[];
  for(const f of F){if(!f||f.d<5||f.d>160)continue;if(Math.abs(f.lat-cible)<f.rayon+4)cible=f.lat+(f.lat>0?-1:1)*(f.rayon+6);}
  const lache=!!(tn&&tn.tient===false);
  if(lache)cible=-tn.cote*max*.5;
  cible=cl(cible,-max,max);
  if(m.ligne==null||m.tSol==null||v.t-m.tSol>.25)m.ligne=cl(v.lat,-max,max);
  m.tSol=v.t;
  const pas=(lache?R.glisseUrgence:R.glisse)*vit*.1;
  m.ligne=cl(m.ligne+cl(cible-m.ligne,-pas,pas),-max,max);
  let capVoulu=cl((m.ligne-v.lat)/(.9*vit),-R.capLigne,R.capLigne)+cl((lTot-lIci)*R.avanceCap,-R.capAvance,R.capAvance);
  if(v.lat>max)capVoulu=Math.min(capVoulu,-.05);else if(v.lat<-max)capVoulu=Math.max(capVoulu,.05);
  const ligne=v.lat+.9*vit*cl(capVoulu,-.4,.4);
  /* LA NITRO, JUGEE A LA VITESSE QU'ELLE DONNERA.
     · vPrevue = vitesse × boost : l'allumage fait bondir la caisse (MESURE 910666 : +13 % en 0,1 s) ;
     · le virage le plus serre des 2,5 s qui viennent, a cette vitesse, doit demander peu de volant (la main a clavier tient mal un fort braquage) ;
     · le prochain virage annonce (moins de 3,5 s) doit avoir une vSure au-dessus de vPrevue, avec une marge ;
     · on n'ALLUME pas pendant un changement de ligne (cap demande fort) : accelerer en plein deplacement, c'est elargir l'ondulation des coups.
     Tout cela coupe la nitro AVANT le virage : la vitesse prise maintenant y sera encore. */
  const pose=Math.abs(v.lat)<v.demi-6&&Math.abs(v.cap)<R.capMax&&!v.glisse&&!v.rebond;
  const jauge=(v.nitro||0)+(v.reserve||0);
  if(jauge>R.jaugeAllume)m.plein=true;else if(jauge<R.jaugeCoupe)m.plein=false;
  const vPrevue=vit*R.boost;
  let margeV=9,braqV=0;
  if(vg&&vg.d!=null&&vg.d<vPrevue*R.horizonVirage){
    if(vg.vSure!=null&&isFinite(vg.vSure))margeV=(vg.vSure-vPrevue)/vPrevue;
    if(vg.braquage!=null&&isFinite(vg.braquage))braqV=Math.abs(vg.braquage)*R.boost*R.boost;   /* le braquage croit avec la vitesse */
  }
  const fLoin=forceAVenir(v,vPrevue,lmax);
  const k=decor?R.nitroDecor:1,seuil=(m.nitro?R.braqueNitro:R.braqueNitro-.1)*k;
  const fMax=Math.max(force*R.boost,fLoin,Math.abs(lIci)/lmax,braqV);
  const calme=m.nitro||Math.abs(capVoulu)<R.capCalme;
  const sur=margeV>(m.nitro?R.margeTenir:R.margeAllumer)&&fMax<seuil&&calme;
  m.nitro=!lache&&pose&&sur&&(v.nitroLibre||!!m.plein);
  m.facon=null;
  return {ligne:ligne,nitro:m.nitro};
}

/* ---------- EN VOL (inchange) ---------- */
function versRoute(v,nitro){
  const f=v.vol,p=f.proche,o={volant:0,manche:0,nitro:nitro};
  if(!p)return o;
  if(Math.abs(p.axe)<1.6)o.volant=cl((cl(-p.lat/40,-.6,.6)-p.axe)*1.6,-1,1)*(p.envers?-1:1);
  if(p.haut>10&&Math.abs(p.lat)<v.demi*2){
    const air=f.air&&f.air.reste!=null?f.air.reste:f.reste,delai=p.haut/Math.max(1,p.versRoute);
    if(delai>2||delai>air-1)o.manche=p.envers?1:-1;}
  return o;
}
const FACONS={
  rien:()=>({volant:0,manche:0,nitro:false}),
  gauche:()=>({volant:1,manche:0,nitro:false}),
  droite:()=>({volant:-1,manche:0,nitro:false}),
  cabre:()=>({volant:0,manche:1,nitro:false}),
  pique:()=>({volant:0,manche:-1,nitro:false}),
  plane:()=>({volant:0,manche:0,nitro:true}),
  planeCabre:()=>({volant:0,manche:1,nitro:true}),
  versRoute:v=>versRoute(v,false),
  versRoutePlane:v=>versRoute(v,true)
};
const LONGS={rien:1,plane:1,versRoute:1,versRoutePlane:1};
function vaut(r,long,v){
  if(!r)return -1;
  const t=+r.t||0;
  if(r.issue==='pose'){
    const axe=+r.axe||0,glisse=(+r.lat||0)+v.vitesse*Math.sin(cl(axe,-1.5,1.5))*REGLAGES.derive;
    return 100-20*Math.abs(axe)-3*t-Math.min(20,Math.max(0,Math.abs(glisse)-(v.demi-4)))-(r.propre===false?20:0);}
  if(r.issue==='portail')return 94;
  if(r.issue==='levre')return 80-3*t;
  if(r.issue==='libre'||r.issue==='coupe'){
    if(long)return 12+2*t;
    return 34-Math.min(20,(Math.abs(+r.haut||0)+Math.abs(+r.lat||0))/10);}
  return Math.min(30,5*t);
}
const sauve=r=>!!r&&(r.issue==='pose'||r.issue==='levre'||r.issue==='portail');
function enVol(v,m){
  const R=REGLAGES,f=v.vol,Y=f.radar&&Array.isArray(f.radar.rayons)?f.radar.rayons:null;
  if(!m.facon){m.facon='versRoute';m.tFacon=v.t;}
  if(Y){
    const tenu=Y.find(x=>x&&x.m==='tenu'),depuis=v.t-m.tFacon,loi=m.facon.indexOf('versRoute')===0;
    const mien=!loi&&tenu&&depuis>.45?tenu:Y.find(x=>x&&x.m===m.facon),sMien=vaut(mien,true,v);
    if(!sauve(mien)&&(depuis>R.tenirFacon||(mien&&(+mien.t||0)<1))){
      let mieux=null,sMieux=-9;
      for(const nom in FACONS){
        if(nom===m.facon)continue;
        const s=vaut(Y.find(x=>x&&x.m===nom),!!LONGS[nom],v)+(nom==='versRoute'?3:nom==='versRoutePlane'?2:nom==='rien'?1:0);
        if(s>sMieux){sMieux=s;mieux=nom;}}
      if(mieux&&sMieux>sMien+R.bascule){m.facon=mieux;m.tFacon=v.t;}}
  }
  const o=FACONS[m.facon](v);
  o.ensuite={ligne:0};
  return o;
}

module.exports={
  nom:'pilote',
  profil:PROFIL,
  REGLAGES:REGLAGES,
  decide:function(vue,m){return vue.mode==='sol'?auSol(vue,m):vue.mode==='vol'?enVol(vue,m):{};}
};