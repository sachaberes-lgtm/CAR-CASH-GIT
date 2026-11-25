/* ===== LE PILOTE, VARIANTE « poser droit et au centre » (etape C) =====
   SA STRATEGIE, EN CLAIR (celle du parent, une seule idee changee).
   Le palier, c'est des pieces, et les pieces, c'est du temps de course : ce pilote cherche d'abord a NE PAS MOURIR, ensuite a ramasser.
   Sa main est un clavier (modele `clavier`) : un ordre met 0,2 s a partir, le volant part par coups a fond de duree tiree au hasard, la main
   voit la route avec 0,15 s de retard. A 400 km/h un coup long tourne la caisse d'un demi-radian : elle SORT par le bord plusieurs fois par
   minute, quoi que le pilote decide. Comme un joueur. Il est donc ecrit pour deux choses : sortir moins, et surtout REVENIR.
   1. AU SOL, LA LIGNE. Il vise ce qui se ramasse de LOIN (ligne parfaite, pieces, pouvoirs) ; sa ligne GLISSE vers sa cible.
   2. LE VIRAGE D'APRES : il se place du cote interieur du virage qui vient et donne a la main un cap d'avance.
   3. LA NITRO LA OU ELLE SERT : partout ou la route se tient, coupee avant les virages, un fond de jauge garde pour planer.
   4. EN VOL, LE RADAR : au decollage la loi « vers la route » ; la facon tenue n'est changee que si elle mene au decor / a la jauge vide.
   5. PAS DE RISQUE GRATUIT : ni saut, ni figure, ni raccourci, ni drift, ni frein.

   CE QUI CHANGE DANS CETTE VARIANTE (une seule idee : POSER DROIT ET AU CENTRE).
   Une pose compte pour le radar « sauvee » meme quand la caisse arrive en travers (axe 0,5 a 1 rad, tolere par le jeu jusqu'a 55 degres) ou
   tout au bord : elle ressort alors par l'autre cote dans la seconde (sortie en chaine), ou rate la dalle d'un rien. Donc :
   · la note d'une pose pese davantage l'axe (25 par rad au lieu de 20) et l'ecart a l'axe de la pose (0,6 point par metre, +5 si le radar
     dit « centre ») : une pose droite et au milieu vaut nettement mieux qu'une pose de travers sur le bord ;
   · une facon tenue dont la pose annoncee est mauvaise (note sous 58, pose a plus de 0,5 s) peut etre quittee pour une facon mieux notee,
     avec la meme hysteresis qu'avant (tenirFacon, bascule) : on ne zigzague pas. */
const PROFIL={
  modele:'clavier',graine:1,                 /* la main mesuree sur les joueurs au clavier (doigts.js, MAIN_CLAVIER), sans rien y ecrire par-dessus */
  chance:{prend:1,palierMin:12}              /* la seconde chance : dans les longues parties seulement */
};
const REGLAGES={
  marge:10,          /* m gardes entre la ligne visee et le bord */
  bandeDecor:99,     /* m : sur une map a decor, la ligne visee ne s'ecarte pas plus de l'axe (99 = pas de limite) */
  nitroDecor:.62,    /* sur une map a decor, les seuils de virage de la nitro sont multiplies par ca */
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
  braqueNitro:.4,    /* au-dessus, pas de nitro (.3 pour l'allumer) ; sur les maps a decor : .25 et .18 */
  margeAllumer:.3,   /* part de ma vitesse : vSure doit la depasser d'autant pour ALLUMER la nitro… */
  margeTenir:.1,     /* …et d'autant pour la GARDER */
  jaugeAllume:.45,   /* jauge + reserve au-dessus de laquelle la nitro s'allume… */
  jaugeCoupe:.25,    /* …et en dessous de laquelle elle se coupe */
  capMax:.22,        /* rad : au-dela, la caisse est de travers, pas de nitro */
  bascule:10,        /* points qu'un rayon doit avoir de plus que la facon tenue pour qu'on en change */
  tenirFacon:.35,    /* s au moins sur une facon avant d'en changer (sauf si elle mene a la mort) */
  derive:.3,         /* s : apres la pose, la caisse glisse dans son axe ce temps-la avant que le volant morde */
  poidsAxe:25,       /* points perdus par radian d'axe d'une pose (20 chez le parent) */
  poidsCentre:.6,    /* points perdus par metre d'ecart a l'axe d'une pose */
  bonusCentre:5,     /* points gagnes si le radar dit « pile au centre » */
  poseMediocre:58,   /* sous cette note, une pose tenue peut etre remplacee par une meilleure facon */
  poseImminente:.5   /* s : a moins de ca de la pose, on ne change plus rien (la main est trop lente) */
};
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const cote=o=>o.latC!=null?o.latC:o.lat;     /* sous la dalle, le lat des pieces, fruits et orbes est en miroir : latC */

/* ---------- AU SOL ---------- */
function aRamasser(v,max){
  const R=REGLAGES,dmin=Math.max(15,v.vitesse*R.avance);
  const prend=(d,lat)=>d>=dmin&&Math.abs(lat)<=max&&Math.abs(lat-v.lat)<Math.max(3,(d-v.vitesse*.25)*R.glisse*.85);
  const L=v.ligne&&Array.isArray(v.ligne.objets)?v.ligne.objets:[];
  const obj=L.find(o=>o.d<R.ligneLoin&&prend(o.d,o.lat));
  const P=Array.isArray(v.piecesDevant)?v.piecesDevant:[];
  const file=P.find(p=>p.d<R.piecesLoin&&prend(p.d,cote(p)));
  const O=Array.isArray(v.orbes)?v.orbes:[];
  const orbe=O.find(o=>o.d<220&&prend(o.d,cote(o)));
  if(obj&&(!file||obj.d<=file.d+10||obj.d<v.vitesse*1.2))return obj.lat;
  if(orbe&&(!file||orbe.d<=file.d+10))return cote(orbe);
  if(file)return cote(file);
  if(obj)return obj.lat;
  return null;
}
function tourne(v,d){
  const rt=Array.isArray(v.route)?v.route:[];
  let d0=0,a0=0;
  for(const p of rt){if(!p)continue;if(d<=p.d)return a0+(p.virage-a0)*(d-d0)/Math.max(1,p.d-d0);d0=p.d;a0=p.virage;}
  return a0;
}
function lacetDans(v,t,vit){return (tourne(v,vit*(t+.15))-tourne(v,vit*Math.max(0,t-.15)))/(t<.15?t+.15:.3);}
const DECOR={canyon:1,grotte:1,jade:1,ville:1};   /* les maps ou une sortie par le bord finit contre le decor */
function auSol(v,m){
  const R=REGLAGES,vg=v.virage,tn=v.tenue,vit=Math.max(6,v.vitesse),lmax=Math.max(.05,v.lacetMax||1);
  const couloir=(v.mur&&v.mur.ici)||(Array.isArray(v.couloirs)&&v.couloirs.some(c=>c.d0<vit*2&&c.d1>0));
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
  for(const f of F){if(f.d<5||f.d>160)continue;if(Math.abs(f.lat-cible)<f.rayon+4)cible=f.lat+(f.lat>0?-1:1)*(f.rayon+6);}
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
  const pose=Math.abs(v.lat)<v.demi-6&&Math.abs(v.cap)<R.capMax&&!v.glisse&&!v.rebond;
  const jauge=(v.nitro||0)+(v.reserve||0);
  if(jauge>R.jaugeAllume)m.plein=true;else if(jauge<R.jaugeCoupe)m.plein=false;
  const proche=!!(vg&&vg.d<vit*3),margeV=proche?vg.marge/vit:9;
  const k=decor?R.nitroDecor:1,seuil=(m.nitro?R.braqueNitro:R.braqueNitro-.1)*k;
  const sur=margeV>(m.nitro?R.margeTenir:R.margeAllumer)&&Math.max(force,Math.abs(lIci)/lmax)<seuil;
  m.nitro=!lache&&pose&&sur&&(v.nitroLibre||!!m.plein);
  m.facon=null;
  return {ligne:ligne,nitro:m.nitro};
}

/* ---------- EN VOL ---------- */
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
/* ce que vaut l'issue d'un rayon : 100 = une pose droite et au centre tout de suite ; sous 35 = on y reste.
   (CHANGE) Une pose vaut par son AXE (poids plus fort), par l'endroit ou la caisse sera 0,3 s apres, et par son ECART A L'AXE : une pose au
   bord ou de travers est une sortie en chaine en attente. */
function vaut(r,long,v){
  if(!r)return -1;
  const R=REGLAGES,t=+r.t||0;
  if(r.issue==='pose'){
    const axe=+r.axe||0,lat=Math.abs(+r.lat||0),glisse=(+r.lat||0)+v.vitesse*Math.sin(cl(axe,-1.5,1.5))*R.derive;
    return 100-R.poidsAxe*Math.abs(axe)-3*t-R.poidsCentre*Math.min(lat,v.demi)+(r.centre?R.bonusCentre:0)
      -Math.min(20,Math.max(0,Math.abs(glisse)-(v.demi-4)))-(r.propre===false?20:0);}
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
    /* (CHANGE) une pose tenue mais mediocre (de travers, au bord) et pas imminente compte comme « a ameliorer » */
    const mediocre=!!mien&&mien.issue==='pose'&&sMien<R.poseMediocre&&(+mien.t||0)>R.poseImminente;
    if((!sauve(mien)||mediocre)&&(depuis>R.tenirFacon||(mien&&(+mien.t||0)<1&&!mediocre))){
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