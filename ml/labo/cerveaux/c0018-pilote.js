/* ===== LE PREMIER PILOTE DE L'ECURIE (2026-11-25, etape C — Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   SA STRATEGIE, EN CLAIR.
   Le palier, c'est des pieces, et les pieces, c'est du temps de course : ce pilote cherche d'abord a NE PAS MOURIR, ensuite a ramasser.
   Sa main est un clavier (modele `clavier`) : un ordre met 0,2 s a partir, le volant part par coups a fond de duree tiree au hasard, la main
   voit la route avec 0,15 s de retard. A 400 km/h un coup long (0,3 a 0,45 s, un sur dix) tourne la caisse d'un demi-radian : elle SORT par le
   bord plusieurs fois par minute, quoi que le pilote decide (MESURE sur cinq tours : 1,5 a 3,5 sorties par minute de route). Comme un joueur.
   Il est donc ecrit pour deux choses : sortir moins, et surtout REVENIR.
   1. AU SOL, LA LIGNE. Il vise ce qui se ramasse de LOIN (la ligne parfaite — fruit, plaque, fruit… — qui recharge la nitro, puis les pieces,
      puis les pouvoirs), jamais un objet qui demande un coup de volant a la derniere image ; sa ligne GLISSE vers sa cible, elle n'y saute pas.
   2. LE VIRAGE D'APRES. La loi `ligne` de la main ne connait que le virage sous les roues. Le pilote lit la route devant (`vue.route`) : il se
      place du cote INTERIEUR du virage qui vient dans une seconde (dans un S, l'interieur du premier est l'exterieur du second), et il donne
      a la main un cap d'AVANCE sur le changement de sens, pour que la caisse tourne deja quand le virage commence.
   3. LA NITRO LA OU ELLE SERT. Demandee partout ou la route se tient (`vue.tenue`), ou le prochain virage garde de la marge (`vue.virage`) et
      demande peu de volant ; coupee AVANT le virage, de travers, en glisse. Moins volontiers sur les maps a decor (canyon, grotte, jade, ville :
      une sortie y finit contre un mur). Un fond de jauge est garde : c'est lui qui fait planer la caisse quand il faut revenir.
   4. EN VOL, LE RADAR — CE QUI CHANGE DANS CETTE VARIANTE (une seule idee : ne garder une facon que si elle finit par une BONNE pose).
      Le parent gardait la facon tenue tant que le radar disait « pose », meme :
      · une pose de travers qui fait ressortir la caisse par l'autre bord (MESURE, graine 910111, canyon : pose a 0,74 rad, ressortie en 0,4 s,
        la paroi) ;
      · une pose annoncee a la toute fin de l'air par la loi « vers la route », qui, dosee par la main clavier, glisse toujours un peu plus tard
        que prevu (MESURE, graine 910592, nuages : versRoute « pose » annoncee 0,5 s avant la jauge vide, puis 0,3, puis 0 — mort « air » ;
        le rayon `pique`, un ordre franc, promettait une pose avec 1,2 s d'air de marge pendant toute la seconde).
      Le README le dit (§ 2 bis) : avec une main a profil, seuls les ordres pleins tenus sont prevus au plus juste ; les lois redecidees sont
      `approx`. Donc ici :
      · une pose n'est BONNE que droite (axe sous 0,6 rad), sur la dalle une fois la glisse comptee, et avec de l'air de marge (0,4 s pour un
        ordre franc, 0,8 s pour une loi « vers la route ») ; la levre et le portail restent bons ;
      · si la pose annoncee pour la facon tenue RECULE de plus de 0,3 s depuis qu'on la suit, elle n'est plus crue ;
      · tant que la facon tenue mene a une bonne pose, on n'en change pas (la main met 0,2 a 0,3 s a obeir : zigzaguer tue) ; sinon on prend le
        rayon qui vaut le plus, les ordres francs passant devant les lois a issue egale ;
      · le choix se fait des la premiere vue du vol (le rayon versRoute n'y est que le point de depart), et un nouveau vol sans decision au sol
        entre deux (rebond, levre) repart de zero.
      Il donne toujours `ensuite` : la fleche du vol est lachee des la pose.
   5. PAS DE RISQUE GRATUIT : ni saut, ni figure, ni raccourci cherche, ni drift, ni frein. Il ne decolle donc jamais expres : ses vols sont
      des sorties par le bord.
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
  glisse:.12,        /* rad : la ligne visee ne se deplace pas plus vite que ce cap-la (a 115 m/s : 14 m de cote par seconde) */
  glisseUrgence:.3,  /* le meme quand la route lache : la, on ne menage plus rien */
  ligneLoin:320,     /* m : un objet de la ligne parfaite se vise jusque-la */
  piecesLoin:180,    /* m : une tranche de pieces se vise jusque-la */
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
  basculeDebut:4,    /* le meme a la premiere vue du vol : rien n'est encore tenu, versRoute n'est qu'un point de depart */
  tenirFacon:.35,    /* s au moins sur une facon avant d'en changer (sauf si elle mene a la mort) */
  derive:.3,         /* s : apres la pose, la caisse glisse dans son axe ce temps-la avant que le volant morde */
  axeBon:.6,         /* rad : une pose plus de travers n'est pas « bonne » (MESURE 910111 : 0,74 rad, ressortie dans la seconde) */
  airFranc:.4,       /* s d'air qu'une pose annoncee par un ordre franc doit laisser pour etre crue */
  airLoi:.8,         /* le meme pour une loi « vers la route » : dosee par coups, sa pose glisse plus tard (MESURE 910592) */
  peineAir:25,       /* points perdus par seconde d'air qui manque sous ces marges */
  peineLoi:4,        /* points perdus par une loi redecidee (approx avec cette main) face a un ordre franc */
  peineBump:4,       /* points perdus par un rayon qui rebondit sur la tranche avant de se poser */
  fuite:.3,          /* s : si la pose annoncee pour la facon tenue recule de plus que ca, elle n'est plus crue */
  peineFuite:15      /* points perdus par une pose qui fuit */
};
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const cote=o=>o.latC!=null?o.latC:o.lat;     /* sous la dalle, le lat des pieces, fruits et orbes est en miroir : latC */

/* ---------- AU SOL ---------- */
/* ce qu'on vise : l'objet de la ligne parfaite s'il est proche et a portee, sinon la premiere tranche de pieces a portee, sinon un pouvoir */
function aRamasser(v,max){
  const R=REGLAGES,dmin=Math.max(15,v.vitesse*R.avance);
  const prend=(d,lat)=>d>=dmin&&Math.abs(lat)<=max&&Math.abs(lat-v.lat)<Math.max(3,(d-v.vitesse*.25)*R.glisse*.85);
  const L=v.ligne&&Array.isArray(v.ligne.objets)?v.ligne.objets:[];
  const obj=L.find(o=>o.d<R.ligneLoin&&prend(o.d,o.lat));
  const P=Array.isArray(v.piecesDevant)?v.piecesDevant:[];
  const file=P.find(p=>p.d<R.piecesLoin&&prend(p.d,cote(p)));
  const O=Array.isArray(v.orbes)?v.orbes:[];
  const orbe=O.find(o=>o.d<220&&prend(o.d,cote(o)));
  /* l'objet de la ligne d'abord quand il est le plus proche ou qu'il arrive dans 1,2 s ; les pieces sinon (elles font le palier) */
  if(obj&&(!file||obj.d<=file.d+10||obj.d<v.vitesse*1.2))return obj.lat;
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
  m.tVol=null;
  m.poseAbs=null;
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
const estLoi=nom=>!!nom&&nom.indexOf('versRoute')===0;      /* redecidee a chaque vue : prevue `approx` avec une main a profil */
/* ou la caisse sera 0,3 s apres la pose : elle glisse dans son axe avant que le volant morde */
function glissePose(r,v){const axe=+r.axe||0;return (+r.lat||0)+v.vitesse*Math.sin(cl(axe,-1.5,1.5))*REGLAGES.derive;}
/* l'air qu'il restera a la pose annoncee (s) : une pose qui arrive a la toute fin de l'air n'arrive souvent pas (MESURE 910592) */
function margeAir(r,air){return air-(+r.t||0);}
/* ce que vaut l'issue d'un rayon : 100 = une pose droite tout de suite, franche, avec de l'air de reste ; sous 35 = on y reste.
   Une pose vaut par son AXE, par l'endroit ou la caisse sera 0,3 s apres, par l'air qu'elle laisse et par la confiance qu'on peut avoir dans
   sa prevision (un ordre franc : juste ; une loi dosee par coups : approx). MESURE (tour 2, 29 decollages d'une course) : la moitie etaient des
   sorties EN CHAINE — revenue en travers, la caisse se posait et ressortait par l'autre bord dans la seconde. */
function vaut(r,long,v,nom,air){
  if(!r)return -1;
  const R=REGLAGES,t=+r.t||0,loi=estLoi(nom);
  if(r.issue==='pose'){
    const axe=+r.axe||0,g=glissePose(r,v),besoin=loi?R.airLoi:R.airFranc;
    return 100-20*Math.abs(axe)-3*t-Math.min(20,Math.max(0,Math.abs(g)-(v.demi-4)))-(r.propre===false?20:0)
      -(r.bumps?R.peineBump:0)-(loi?R.peineLoi:0)-Math.min(30,Math.max(0,besoin-margeAir(r,air))*R.peineAir);}
  if(r.issue==='portail')return 94;
  if(r.issue==='levre')return 80-3*t;
  if(r.issue==='libre'||r.issue==='coupe'){
    if(long)return 12+2*t;                                    /* rien avant la fin de l'air : la jauge vide suit */
    return 34-Math.min(20,(Math.abs(+r.haut||0)+Math.abs(+r.lat||0))/10);}   /* un rayon court : on ne sait pas ; mieux vaut finir pres de la route */
  return Math.min(30,5*t);                                    /* choc, air, fond : le plus tard possible */
}
/* une issue qu'on garde sans regarder ailleurs : la levre, le portail, ou une pose DROITE, SUR LA DALLE, avec de l'air de marge */
function bonne(r,v,nom,air){
  if(!r)return false;
  if(r.issue==='levre'||r.issue==='portail')return true;
  if(r.issue!=='pose'||r.propre===false)return false;
  const R=REGLAGES;
  return Math.abs(+r.axe||0)<R.axeBon&&Math.abs(glissePose(r,v))<v.demi-2&&margeAir(r,air)>=(estLoi(nom)?R.airLoi:R.airFranc);
}
/* LE VOL. Une facon de piloter est TENUE : la main met 0,2 a 0,3 s a obeir et le vol tourne de 3 rad par seconde — changer de facon a chaque
   vue, c'est zigzaguer d'un cote a l'autre de la route jusqu'a la jauge vide (MESURE, tour 3). Donc :
   · des la premiere vue du vol, le meilleur rayon (versRoute n'est que le point de depart, il garde un petit avantage) ;
   · tant que le radar dit que la facon tenue mene a une BONNE pose (ou a la levre, au portail) et que cette pose ne recule pas, on n'en change pas ;
   · sinon, et pas plus souvent que toutes les 0,35 s (sauf issue dans la seconde), on prend la facon du rayon qui vaut le plus. */
function enVol(v,m){
  const R=REGLAGES,f=v.vol,Y=f.radar&&Array.isArray(f.radar.rayons)?f.radar.rayons:null;
  /* un nouveau vol sans decision au sol entre deux (la caisse a touche puis rebondi) : on repart de zero */
  const tv=+f.t||0;
  if(m.facon&&m.tVol!=null&&tv<m.tVol-.05){m.facon=null;}
  m.tVol=tv;
  const debut=!m.facon;
  if(debut){m.facon='versRoute';m.tFacon=v.t;m.poseAbs=null;}
  if(Y){
    const air=f.air&&f.air.reste!=null?+f.air.reste:(f.reste!=null?+f.reste:6);
    const tenu=Y.find(x=>x&&x.m==='tenu'),depuis=v.t-m.tFacon,loi=estLoi(m.facon);
    /* ce que dit le radar de la facon tenue : son propre rayon, et une fois les doigts dessus depuis une reaction, le rayon `tenu` (MESURE : juste
       55 fois sur 55 avec la main clavier) — sauf pour les lois « vers la route », dont l'ordre change a chaque vue */
    const mien=!loi&&tenu&&depuis>.45?tenu:Y.find(x=>x&&x.m===m.facon);
    /* LA POSE QUI FUIT : son heure annoncee recule d'une vue a l'autre (la main ne fait pas ce que le rayon suppose) */
    let fuit=false;
    if(mien&&mien.issue==='pose'){
      const abs=v.t+(+mien.t||0);
      if(m.poseAbs==null)m.poseAbs=abs;else fuit=abs-m.poseAbs>R.fuite;
    }else m.poseAbs=null;
    const sMien=vaut(mien,true,v,m.facon,air)-(fuit?R.peineFuite:0);
    const tient=bonne(mien,v,m.facon,air)&&!fuit;
    if(!tient&&(debut||depuis>R.tenirFacon||(mien&&(+mien.t||0)<1))){
      let mieux=null,sMieux=-9;
      for(const nom in FACONS){
        if(nom===m.facon)continue;
        /* a issue egale : la loi vers la route d'abord, et sans nitro (un vol sans reacteur rend de la jauge) */
        const s=vaut(Y.find(x=>x&&x.m===nom),!!LONGS[nom],v,nom,air)+(nom==='versRoute'?3:nom==='versRoutePlane'?2:nom==='rien'?1:0);
        if(s>sMieux){sMieux=s;mieux=nom;}}
      if(mieux&&sMieux>sMien+(debut?R.basculeDebut:R.bascule)){m.facon=mieux;m.tFacon=v.t;m.poseAbs=null;}}
  }
  const o=FACONS[m.facon](v);
  o.ensuite={ligne:0};   /* a la pose, la main lache la fleche du vol et reprend la route sans attendre la decision suivante */
  return o;
}

module.exports={
  nom:'pilote',
  profil:PROFIL,
  REGLAGES:REGLAGES,
  decide:function(vue,m){return vue.mode==='sol'?auSol(vue,m):vue.mode==='vol'?enVol(vue,m):{};}
};