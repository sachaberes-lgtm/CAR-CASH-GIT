/* ===== VARIANTE « LE FIL DES PIECES » (boucle, c0004 — parent c0003) =====
   UNE SEULE IDEE : le palier se compte en pieces, et seules les pieces et les figures en donnent. Le parent
   prenait un fruit ou une plaque de la ligne parfaite des qu'il etait proche, meme loin du fil des pieces :
   la nitro se gagne, mais aucune piece ; et il ne visait les pieces qu'a 180 m, quand la caisse file a 120 m/s.
   Ici :
   1. LE FIL D'ABORD : une piece a portee se vise avant un fruit ou une plaque. Un objet de la ligne parfaite
      n'est pris que s'il est sur le chemin du fil (meme cote, a moins de 4 m de la piece visee, et pas plus loin).
   2. VISER PLUS LOIN A GRANDE VITESSE : la portee des pieces passe de 180 m a 1,8 s de route (1,8 x vitesse),
      pour que la ligne du fil soit prise avant le virage qui suit, et non pendant.
   Le profil (la main) et tout le reste de la conduite sont ceux du parent. */
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
  glisse:.12,        /* rad : la ligne visee ne se deplace pas plus vite que ce cap-la (a 115 m/s : 14 m de cote par seconde) */
  glisseUrgence:.3,  /* le meme quand la route lache : la, on ne menage plus rien */
  ligneLoin:320,     /* m : un objet de la ligne parfaite se vise jusque-la */
  piecesLoin:180,    /* m : une tranche de pieces se vise jusque-la (au moins) */
  piecesVitesse:1.8, /* s : et au-dela, jusqu'a 1,8 s de route a la vitesse du moment (variante : viser le fil plus tot) */
  surLeFil:4,        /* m : un fruit ou une plaque n'est pris que s'il est a moins de ca du fil des pieces (variante) */
  capLigne:.3,       /* rad : le cap le plus fort demande pour rejoindre la ligne */
  avanceCap:.25,     /* s : le cap prend cette avance sur le changement de lacet de la route (celui de dans 0,4 s moins celui d'ici) */
  capAvance:.25,     /* rad : l'avance ne depasse pas ca */
  braqueDoux:.15,    /* part de volant que demande un virage : en dessous, toute la largeur est permise */
  braqueFort:.5,     /* au-dessus, on se tient au moins a mi-largeur du cote INTERIEUR */
  braqueNitro:.4,    /* au-dessus, pas de nitro (.3 pour l'allumer) ; sur les maps a decor (une sortie y tue) : .25 et .18 */
  margeAllumer:.3,   /* part de ma vitesse : vSure doit la depasser d'autant pour ALLUMER la nitro… */
  margeTenir:.1,     /* …et d'autant pour la GARDER */
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
/* ce qu'on vise : d'abord le fil des pieces (a portee, plus loin a grande vitesse) ; un fruit ou une plaque seulement
   s'il est sur ce fil ; sinon un pouvoir ; sinon, a defaut, la ligne parfaite seule */
function aRamasser(v,max){
  const R=REGLAGES,dmin=Math.max(15,v.vitesse*R.avance);
  const prend=(d,lat)=>d>=dmin&&Math.abs(lat)<=max&&Math.abs(lat-v.lat)<Math.max(3,(d-v.vitesse*.25)*R.glisse*.85);
  const L=v.ligne&&Array.isArray(v.ligne.objets)?v.ligne.objets:[];
  const obj=L.find(o=>o.d<R.ligneLoin&&prend(o.d,o.lat));
  const P=Array.isArray(v.piecesDevant)?v.piecesDevant:[];
  const portee=Math.max(R.piecesLoin,v.vitesse*R.piecesVitesse);   /* le fil se voit plus loin quand on file vite */
  const file=P.find(p=>p.d<portee&&prend(p.d,cote(p)));
  const O=Array.isArray(v.orbes)?v.orbes:[];
  const orbe=O.find(o=>o.d<220&&prend(o.d,cote(o)));
  /* un fruit ou une plaque sur le chemin du fil : on le prend en passant (il ne fait pas quitter le fil) */
  if(file&&obj&&obj.d<=file.d+10&&Math.abs(obj.lat-cote(file))<R.surLeFil)return obj.lat;
  if(orbe&&(!file||orbe.d<=file.d+10))return cote(orbe);
  if(file)return cote(file);
  if(obj)return obj.lat;
  return null;
}
/* DE COMBIEN LA ROUTE AURA TOURNE a d metres devant (rad, + a gauche) : vue.route le donne a 30, 60, 100, 150, 220… m ; entre deux, en ligne droite */
function tourne(v,d){
  const rt=Array.isArray(v.route)?v.route:[];
  let d0=0,a0=0;
  for(const p of rt){if(!p)continue;if(d<=p.d)return a0+(p.virage-a0)*(d-d0)/Math.max(1,p.d-d0);d0=p.d;a0=p.virage;}
  return a0;
}
/* LE LACET DE LA ROUTE DANS t SECONDES (rad/s) : ce que la main devra suivre a ce moment-la. La loi `ligne` de la main ne connait que le lacet
   sous les roues, percu 0,15 s plus tard : dans un S, elle braque encore a droite quand la route est deja repartie a gauche (MESURE, tour 3,
   canyon : cap −0,6 rad en 0,4 s au changement de sens, la paroi 0,5 s apres). C'est au pilote de voir le virage d'apres. */
function lacetDans(v,t,vit){return (tourne(v,vit*(t+.15))-tourne(v,vit*Math.max(0,t-.15)))/(t<.15?t+.15:.3);}
const DECOR={canyon:1,grotte:1,jade:1,ville:1};   /* les maps ou une sortie par le bord finit contre le decor */
function auSol(v,m){
  const R=REGLAGES,vg=v.virage,tn=v.tenue,vit=Math.max(6,v.vitesse),lmax=Math.max(.05,v.lacetMax||1);
  const couloir=(v.mur&&v.mur.ici)||(Array.isArray(v.couloirs)&&v.couloirs.some(c=>c.d0<vit*2&&c.d1>0));
  const decor=!!DECOR[v.carte],max=Math.min(decor?R.bandeDecor:99,v.demi-(couloir?R.margeCouloir:R.marge));
  /* ce qui se ramasse a portee, sinon le milieu */
  let cible=0;
  const but=aRamasser(v,max);
  if(but!=null)cible=but;
  /* LA PLACE DANS LE VIRAGE : plus il demande de volant, plus la ligne reste du cote interieur — du virage QUI VIENT (dans 1 s, puis dans
     0,4 s) avant celui qu'on quitte : dans un S, l'interieur du premier est l'exterieur du second */
  const lIci=v.lacetRoute||0,lTot=lacetDans(v,.4,vit),lTard=lacetDans(v,1,vit);
  let lFort=lTard;
  if(Math.abs(lTot)>Math.abs(lFort))lFort=lTot;
  if(Math.abs(lIci)*.6>Math.abs(lFort))lFort=lIci;
  const force=Math.abs(lFort)/lmax,sens=lFort>0?1:-1,u=cl((force-R.braqueDoux)/(R.braqueFort-R.braqueDoux),0,1);
  if(u>0){const plancher=max*(-1+1.5*u);if(cible*sens<plancher)cible=sens*plancher;}
  /* une flaque sur la ligne : passer a cote, du cote ou il y a le plus de place */
  const F=Array.isArray(v.flaques)?v.flaques:[];
  for(const f of F){if(f.d<5||f.d>160)continue;if(Math.abs(f.lat-cible)<f.rayon+4)cible=f.lat+(f.lat>0?-1:1)*(f.rayon+6);}
  /* LA ROUTE NE SE TIENT PLUS (le bord dans moins de 3 s) : vers le cote oppose au bord annonce */
  const lache=!!(tn&&tn.tient===false);
  if(lache)cible=-tn.cote*max*.5;
  cible=cl(cible,-max,max);
  /* LA LIGNE GLISSE VERS SA CIBLE, elle n'y saute pas. Apres un vol, elle repart d'ou la caisse est. */
  if(m.ligne==null||m.tSol==null||v.t-m.tSol>.25)m.ligne=cl(v.lat,-max,max);
  m.tSol=v.t;
  const pas=(lache?R.glisseUrgence:R.glisse)*vit*.1;
  m.ligne=cl(m.ligne+cl(cible-m.ligne,-pas,pas),-max,max);
  /* LE CAP D'AVANCE : la main vise le cap (ligne − lat) / (0,9 × vitesse). On lui donne ce cap PLUS l'avance sur le virage qui arrive :
     la caisse tourne deja vers lui quand il commence, au lieu de le decouvrir 0,15 s apres. */
  let capVoulu=cl((m.ligne-v.lat)/(.9*vit),-R.capLigne,R.capLigne)+cl((lTot-lIci)*R.avanceCap,-R.capAvance,R.capAvance);
  if(v.lat>max)capVoulu=Math.min(capVoulu,-.05);else if(v.lat<-max)capVoulu=Math.max(capVoulu,.05);   /* jamais vers le bord quand on y est */
  const ligne=v.lat+.9*vit*cl(capVoulu,-.4,.4);
  /* LA NITRO : partout ou elle ne met pas la caisse dehors. Jamais de travers, en glisse, en rebond, quand la route lache, ni dans un virage
     qui demande du volant ; sur les maps a decor, encore moins. */
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
/* LA LOI « VERS LA ROUTE » (README § 2 bis), recopiee : c'est elle que jouent les rayons versRoute et versRoutePlane du radar */
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
const LONGS={rien:1,plane:1,versRoute:1,versRoutePlane:1};   /* les rayons joues jusqu'au bout de l'air : « libre » y veut dire jauge vide */
/* ce que vaut l'issue d'un rayon : 100 = une pose droite tout de suite ; sous 35 = on y reste.
   Une pose vaut par son AXE et par l'endroit ou la caisse sera 0,3 s apres (elle glisse dans son axe avant que le volant morde). MESURE (tour 2,
   29 decollages d'une course) : la moitie etaient des sorties EN CHAINE — revenue en travers (axe 0,5 a 1 rad : « propre » pour le jeu, qui
   tolere 55°), la caisse se posait et ressortait par l'autre bord dans la seconde. */
function vaut(r,long,v){
  if(!r)return -1;
  const t=+r.t||0;
  if(r.issue==='pose'){
    const axe=+r.axe||0,glisse=(+r.lat||0)+v.vitesse*Math.sin(cl(axe,-1.5,1.5))*REGLAGES.derive;
    return 100-20*Math.abs(axe)-3*t-Math.min(20,Math.max(0,Math.abs(glisse)-(v.demi-4)))-(r.propre===false?20:0);}
  if(r.issue==='portail')return 94;
  if(r.issue==='levre')return 80-3*t;
  if(r.issue==='libre'||r.issue==='coupe'){
    if(long)return 12+2*t;                                    /* rien avant la fin de l'air : la jauge vide suit */
    return 34-Math.min(20,(Math.abs(+r.haut||0)+Math.abs(+r.lat||0))/10);}   /* un rayon court : on ne sait pas ; mieux vaut finir pres de la route */
  return Math.min(30,5*t);                                    /* choc, air, fond : le plus tard possible */
}
const sauve=r=>!!r&&(r.issue==='pose'||r.issue==='levre'||r.issue==='portail');
/* LE VOL. Une facon de piloter est TENUE : la main met 0,2 a 0,3 s a obeir et le vol tourne de 3 rad par seconde — changer de facon a chaque
   vue, c'est zigzaguer d'un cote a l'autre de la route jusqu'a la jauge vide (MESURE, tour 3 : deux morts « air » sur quatre courses, la caisse
   passee quatre fois au-dessus de la dalle sans s'y poser). Donc :
   · au decollage, la loi « vers la route » (la seule mesuree : 9 retours sur 10 apres une sortie par le bord) ;
   · tant que le radar dit que la facon tenue mene a une pose (ou a la levre, au portail), on n'en change pas ;
   · sinon, et pas plus souvent que toutes les 0,35 s (sauf mort annoncee dans la seconde), on prend la facon du rayon qui vaut le plus. */
function enVol(v,m){
  const R=REGLAGES,f=v.vol,Y=f.radar&&Array.isArray(f.radar.rayons)?f.radar.rayons:null;
  if(!m.facon){m.facon='versRoute';m.tFacon=v.t;}
  if(Y){
    const tenu=Y.find(x=>x&&x.m==='tenu'),depuis=v.t-m.tFacon,loi=m.facon.indexOf('versRoute')===0;
    /* ce que dit le radar de la facon tenue : son propre rayon, et une fois les doigts dessus depuis une reaction, le rayon `tenu` (MESURE : juste
       49 fois sur 50) — sauf pour les lois « vers la route », dont l'ordre change a chaque vue : `tenu` n'y dit que la vue du moment */
    const mien=!loi&&tenu&&depuis>.45?tenu:Y.find(x=>x&&x.m===m.facon),sMien=vaut(mien,true,v);
    if(!sauve(mien)&&(depuis>R.tenirFacon||(mien&&(+mien.t||0)<1))){
      let mieux=null,sMieux=-9;
      for(const nom in FACONS){
        if(nom===m.facon)continue;
        /* a issue egale : la loi vers la route d'abord, et sans nitro (un vol sans reacteur rend de la jauge) */
        const s=vaut(Y.find(x=>x&&x.m===nom),!!LONGS[nom],v)+(nom==='versRoute'?3:nom==='versRoutePlane'?2:nom==='rien'?1:0);
        if(s>sMieux){sMieux=s;mieux=nom;}}
      if(mieux&&sMieux>sMien+R.bascule){m.facon=mieux;m.tFacon=v.t;}}
  }
  const o=FACONS[m.facon](v);
  o.ensuite={ligne:0};   /* a la pose, la main lache la fleche du vol et reprend la route sans attendre la decision suivante */
  return o;
}

module.exports={
  nom:'pilote-fil',
  profil:PROFIL,
  REGLAGES:REGLAGES,
  decide:function(vue,m){return vue.mode==='sol'?auSol(vue,m):vue.mode==='vol'?enVol(vue,m):{};}
};