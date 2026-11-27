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
      Sur les maps SANS decor (nuages, espace) une sortie ne coute que de l'air : la nitro allumee y est tenue plus longtemps dans les virages
      (seuil de volant x1,25, vitesse jusqu'a 5 % au-dessus de vSure), les joueurs l'ayant 78 % du sol.
   4. EN VOL, LE RADAR. Au decollage : la loi « vers la route » (la seule mesuree apres une sortie par le bord). Tant que le radar annonce que la
      facon tenue mene a une pose, a la levre ou au portail, il n'en change pas (la main met 0,2 a 0,3 s a obeir et le vol tourne de 3 rad/s :
      changer a chaque vue, c'est zigzaguer jusqu'a la jauge vide). Si elle mene au decor, a la jauge vide ou au fond, il prend la facon du rayon
      dont l'issue vaut le plus : une pose droite et qui reste sur la dalle d'abord, la levre, sinon ce qui meurt le plus tard.
      Il donne toujours `ensuite` : la fleche du vol est lachee des la pose.
   5. PAS DE RISQUE GRATUIT : ni saut, ni figure, ni raccourci cherche, ni drift, ni frein.
   CE QU'IL NE SAIT PAS FAIRE (pour les tours suivants) : rester sur la route au CANYON (1,5 sortie par minute, et la paroi est a 10 m du bord :
   presque toutes ses courses qui y passent y meurent) ; se poser DROIT (une sortie sur trois au moins est une sortie en chaine, la caisse reposee en
   travers) ; freiner ; voler expres comme un joueur ; poser des figures.
   La seconde chance est prise comme dans les deux meilleures parties des joueurs : une fois, dans une longue partie (palier 12 et plus). */
const PROFIL={
  modele:'clavier',graine:1,                 /* la main mesuree sur les joueurs au clavier (doigts.js, MAIN_CLAVIER), sans rien y ecrire par-dessus */
  chance:{prend:1,palierMin:12}              /* la seconde chance : dans les longues parties seulement (les joueurs : aux paliers 14 et 28) */
};
const REGLAGES={
  marge:10,          /* m gardes entre la ligne visee et le bord (la reference : 9, avec une main de machine) */
  bandeDecor:99,     /* m : sur une map a decor, la ligne visee ne s'ecarte pas plus de l'axe (99 = pas de limite) */
  nitroDecor:1,    /* sur une map a decor, les seuils de virage de la nitro sont multiplies par ca (0 = jamais de nitro) */
  nitroLibreK:1.25,  /* sur une map SANS decor (nuages, espace), seuil de volant de la nitro DEJA allumee multiplie par ca : une sortie n'y coute que de l'air */
  tenirLibre:.05,    /* sur une map sans decor, la nitro allumee tolere une vitesse de cette part au-dessus de vSure */
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
  braqueNitro:.7,    /* au-dessus, pas de nitro (.3 pour l'allumer) ; sur les maps a decor (une sortie y tue) : .25 et .18 */
  margeAllumer:.05,   /* part de ma vitesse : vSure doit la depasser d'autant pour ALLUMER la nitro… */
  margeTenir:0,     /* …et d'autant pour la GARDER */
  jaugeAllume:.45,   /* jauge + reserve au-dessus de laquelle la nitro s'allume… */
  jaugeCoupe:.25,    /* …et en dessous de laquelle elle se coupe (le fond garde pour planer en vol) */
  capMax:.35,        /* rad : au-dela, la caisse est de travers, pas de nitro */
  bascule:10,        /* points qu'un rayon doit avoir de plus que la facon tenue pour qu'on en change */
  tenirFacon:.35,    /* s au moins sur une facon avant d'en changer (sauf si elle mene a la mort) */
  derive:.3,         /* s : apres la pose, la caisse glisse dans son axe ce temps-la avant que le volant morde */
  /* --- LE DECOLLAGE NITRO ALLUMEE (sorties subies, maps sans decor) --- */
  bordNitro:.7,      /* s : si le bord est dans moins de ca et que la route lache, la nitro reste tenue jusqu'au decollage (les joueurs : 63 % des decollages nitro allumee, le parent 17 %) */
  bordJauge:.5,      /* jauge + reserve au moins pour ce decollage nitro allumee (le fond sert a planer ensuite) */
  /* --- LE RACCOURCI (sortir expres par le bord quand le radar promet une pose plus loin sur la piste) --- */
  raccVirage:.2,     /* rad : la route doit tourner d'au moins ca sur 400 m pour qu'on regarde les sorties (les joueurs : 86 % de leurs vols partent dans un virage) */
  raccGain:80,       /* m de piste gagnes au moins (le jeu crie RACCOURCI a 60) */
  raccAxe:.75,       /* rad : l'angle d'arrivee le plus fort accepte (la pose est ratee a 0,96) */
  raccTmin:.7,       /* s de vol au moins… */
  raccChute:120,     /* m : on ne plonge pas vers une cible plus basse que ca (MESURE, jade 910333 : a 350 m de chute la caisse atteint 300 m/s et ne s'aligne plus ;
                        les joueurs : 38 m en mediane, 147 m pour un vol sur dix) */
  raccTmax:3.6,      /* …et au plus (la jauge d'air : 6 s ; les joueurs : 2,3 s en mediane, 4 s pour un vol sur dix) */
  raccAir:1.2,       /* s de jauge d'air qui doivent rester a la pose annoncee */
  raccBord:5,        /* m : la pose annoncee doit tomber a plus de ca du bord */
  raccAttente:1.6,   /* s : on ne s'engage que si le bord est a moins de ca, volant a fond */
  raccCartes:{grotte:0,canyon:0,jade:0},   /* les maps ou l'on ne sort JAMAIS expres (0) ; absente = permis. MESURE (26/11, 12 courses) : a la grotte, 4 sorties
                        engagees sur 4 finissent contre la roche en 0,2 a 1,5 s (le rayon du sol annoncait une pose) ; au canyon la paroi est a 10 m du bord.
                        Les joueurs, eux, y coupent (grotte : 5 raccourcis par minute) : a rouvrir quand le rayon du sol y sera juste.
                        La JADE (26/11, 15 h) : sur 12 courses, 3 plongeons voulus sur 4 y finissent mal (2 jauge vide, 1 pic), contre 0 sur 13 aux nuages,
                        en ville et dans l'espace */
  raccJumeau:{jade:1,ville:1},      /* les maps a decor ou l'on exige que les DEUX rayons vers la cible (avec et sans reacteur) se posent */
  raccRepos:1.5,     /* s sans nouvelle sortie apres un engagement abandonne */
  figPlongeon:2.2,     /* s avant la pose annoncee pour une figure en plongeon (au lieu de figTemps) */
  /* --- LES FIGURES EN VOL --- */
  figTemps:1.5,      /* s avant la pose annoncee pour lancer une figure (reaction du geste 0,26 + double appui 0,27 + 0,84 que le jeu exige) */
  figJauge:.4,       /* jauge + reserve au moins (une figure coute 0,35 ; une pose propre en rend 0,40) */
  figEcart:.55,      /* s entre deux gestes (la main : 2 par seconde au plus) */
  /* --- LES FIGURES EN VOL SUBI, MARGE LARGE (maps sans decor) --- */
  largeHaut:4,       /* m au-dessus de la route la plus proche au moins (au lieu de figHaut). 9 avant : la loi « vers la route » pique des 10 m, la hauteur
                        etait la condition qui bloquait presque tout ; la vraie protection est la pose annoncee a plus de 2,2 s, avec les deux rayons qui se posent */
  largeT1:2.2,       /* s avant la pose pour la 1re figure (MESURE 26/11 : sous 2,2 s une figure dereglait le vol) */
  largeT2:1.8,       /* s avant la pose pour les suivantes */
  largeAxe:.5,       /* rad : les DEUX rayons vers la route doivent se poser sous cet angle d'arrivee */
  largeAir:1.5,      /* s d'air qui doivent rester a la pose annoncee */
  largeMax:3,        /* figures par vol au plus dans un vol a marge large */
  dessousMax:.4,     /* s sous la dalle avant de chercher a en sortir par le bord (MESURE, ml/ecurie/etude/realisme.md : les joueurs y roulent 3 % du sol,
                        par passages de 1,2 s ; le pilote d'avant 29 %, par passages de 4 a 60 s). Ici .4 au lieu de .8 : le parent y reste 4,1 % du sol,
                        par passages de 1,5 s (les joueurs : 2,2 %, 1 s) */
  dessousAveugle:1,  /* 1 = sous la dalle, on file au bord SANS attendre qu'un rayon promette une pose (les joueurs : 1,1 s dessous) ; 0 = on attend la promesse */
  dessousDecor:1,    /* sur les maps a decor (canyon, grotte, jade, ville) : 0 = on reste dessous · 1 = on sort si un rayon de ce cote sauve · 2 = on sort comme ailleurs */
  dessousNitro:0,    /* 1 = nitro tenue pendant la sortie du dessous (les joueurs decollent nitro allumee) */
  dessousFuir:1,     /* 1 = en vol, quitter une facon qui mene SOUS la dalle des qu'un autre rayon promet une pose propre dessus (maintenant sans attendre tenirFacon) */
  dessousPose:40,    /* points que perd une pose annoncee SOUS la dalle (25 chez le parent : une pose dessous valait presque une pose dessus) */
  departMin:1.5,     /* s : au depart, le pilote file droit au moins ce temps-la… */
  departMax:5.5,     /* …et au plus celui-la (tire de la piste, pas du hasard). MESURE (ml/ecurie/etude/realisme.md § 1.8) : le premier coup de volant
                        d'un joueur tombe a 3,8 s (il va tout droit jusqu'a la premiere piece, a 4,1 s) ; celui du pilote d'avant a 0,5 s, a chaque course */
  portailVol:1,      /* 1 = sortir par le bord pour passer le portail EN VOL quand un rayon du sol l'annonce (0 = jamais). MESURE (ml/ecurie/etude/realisme.md
                        § 1.8) : les joueurs passent 56 % des portails en vol, le pilote d'avant 16 % */
  volDemiTour:1,     /* 1 = la loi « vers la route » braque aussi quand la caisse est a plus de 1,6 rad de l'axe de la route (0 = elle lache le volant, comme les rayons) */
  volRetour:0,       /* s : le cap vise vers la route est -lat / (volRetour x vitesse), au lieu de -lat / 40 m (0 = 40 m, comme les rayons) */
  volAvance:.25,       /* s : la loi est appliquee a l'ecart et a l'axe qu'on aura dans ce temps-la (le retard de la main) ; 0 = a ceux du moment */
  figMax:2,          /* figures par vol au plus (le jeu : 3 a la fois) */
  figDepuis:.4,      /* s de vol avant la premiere figure (les joueurs : 0,56 s en mediane) */
  figHaut:15         /* m au-dessus de la route la plus proche pour une figure dans un vol subi (MESURE, grotte 910185 : une figure lancee a la 1re
                        vue d'une sortie au ras du bord — ↑ puis deux appuis NITRO — a envoye la caisse a 88 m au-dessus de la dalle, morte jauge vide) */
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
/* ---------- LE RACCOURCI ----------
   MESURE (les 10 parties au clavier, ml/bot/voltige.js) : 8,5 vols par minute, 94 % par le bord, 49 % du cote INTERIEUR d'un virage ; 43 % des poses
   sont des raccourcis (3,5 par minute), 413 m gagnes en mediane. Les joueurs ne « tombent » pas de la route : ils la coupent.
   vue.sorties (demande a la vue d'avant par regarder:'sorties') dit, pour une sortie a gauche et a droite volant a fond des maintenant, ou mene le vol
   pour trois facons de le piloter (rien, plane, versRoute). On s'engage quand l'une promet une pose propre, plus loin sur la piste. */
function raccourci(v,sortir){
  const R=REGLAGES,S=v.sorties;
  if(!S)return null;
  let mieux=null;
  for(const nom of ['gauche','droite']){
    const X=S[nom];if(!X||!Array.isArray(X.rayons)||!(X.t<=R.raccAttente))continue;
    for(const r of X.rayons){
      /* LE PORTAIL EN VOL : un rayon de cette sortie le traverse en moins de raccTmax secondes — c'est la plus belle fin de piste */
      if(r&&r.issue==='portail'&&R.portailVol>0&&!sortir&&(+r.t||0)<=R.raccTmax){const s8=400-25*(+r.t||0)-(/plane/i.test(r.m)?20:0);
        if(!mieux||s8>mieux.s)mieux={s:s8,cote:nom==='gauche'?1:-1,facon:r.m,cible:typeof r.cible==='number'?r.cible:null,gain:0,vol:+r.t||0,attente:+X.t||0};continue;}
      if(!r||r.issue!=='pose'||r.propre===false||r.dessous)continue;
      /* SORTIR DU DESSOUS : n'importe quelle pose propre SUR la dalle fait l'affaire, la plus courte et la plus droite d'abord (aucun gain exige) */
      if(sortir){const t9=+r.t||0,a9=Math.abs(+r.axe||0);if(t9>3.5||a9>R.raccAxe||(r.air!=null&&r.air<R.raccAir))continue;const s9=100-25*t9-100*a9;
        if(!mieux||s9>mieux.s)mieux={s:s9,cote:nom==='gauche'?1:-1,facon:r.m,cible:typeof r.cible==='number'?r.cible:null,gain:+r.gain||0,vol:t9,attente:+X.t||0};continue;}
      const gain=+r.gain||0,axe=Math.abs(+r.axe||0),t=+r.t||0;
      if((r.chute!=null&&r.chute>R.raccChute)||gain<R.raccGain||axe>R.raccAxe||t<R.raccTmin||t>R.raccTmax||Math.abs(+r.lat||0)>v.demi-R.raccBord||(r.air!=null&&r.air<R.raccAir))continue;
      /* sur une map a decor : l'autre rayon vers la meme cible (avec ou sans reacteur) doit se poser lui aussi — une pose qui ne tient qu'a une
         facon de piloter ne tient pas a la main d'un clavier */
      if(R.raccJumeau[v.carte]&&typeof r.cible==='number'){
        const j=X.rayons.find(q=>q&&q!==r&&q.cible===r.cible&&(q.m==='viser'||q.m==='viserPlane'));
        if(!j||j.issue!=='pose')continue;}
      /* ce que vaut la sortie : la piste gagnee, moins l'angle d'arrivee, la duree, le reacteur (il coute de la jauge), une pose lourde */
      const s=Math.min(gain,600)-250*axe-25*t-(r.m==='plane'?40:0)-(r.note==='lourde'?40:0);
      if(!mieux||s>mieux.s)mieux={s:s,cote:nom==='gauche'?1:-1,facon:r.m,cible:typeof r.cible==='number'?r.cible:null,gain:gain,vol:t,attente:+X.t||0};}}
  return mieux;
}
/* la sortie engagee tient-elle encore ? (le cote choisi garde au moins un rayon qui sauve) */
function tientEncore(v,cote){
  const S=v.sorties,X=S&&S[cote>0?'gauche':'droite'];
  if(!X||!Array.isArray(X.rayons))return null;            /* pas de reponse cette fois : on ne sait pas */
  return X.rayons.some(r=>r&&(r.issue==='pose'||r.issue==='levre'||r.issue==='portail'));
}
function auSol(v,m){
  /* LE DEPART : tout droit sur sa ligne, nitro tenue, le temps tire pour cette piste — sauf si la route lache avant */
  if(m.tDepart==null){const g=Math.round(+v.L||0)*7+Math.round((Array.isArray(v.piecesDevant)&&v.piecesDevant[0]?+v.piecesDevant[0].d:0)||0)*13;
    m.tDepart=REGLAGES.departMin+(REGLAGES.departMax-REGLAGES.departMin)*((g%41)/40);m.latDepart=v.lat;}
  if(v.t<m.tDepart&&!(v.tenue&&v.tenue.tient===false)){m.tSol=v.t;m.ligne=v.lat;m.facon=null;return {ligne:m.latDepart,nitro:true};}
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
  /* MAPS SANS DECOR : une sortie par le bord ne coute que de l'air (aucun choc mesure sur 13 plongeons) ; la nitro deja allumee y est donc
     gardee plus longtemps dans les virages (seuil de volant x nitroLibreK, vitesse jusqu'a tenirLibre au-dessus de vSure). Elle reste coupee
     quand la route lache, en glisse, de travers, en rebond ou jauge basse. */
  const k=decor?R.nitroDecor:(m.nitro?R.nitroLibreK:1),seuil=(m.nitro?R.braqueNitro:R.braqueNitro-.1)*k;
  const mTenir=decor?R.margeTenir:R.margeTenir-R.tenirLibre;
  const sur=margeV>(m.nitro?mTenir:R.margeAllumer)&&Math.max(force,Math.abs(lIci)/lmax)<seuil;
  m.nitro=!lache&&pose&&sur&&(v.nitroLibre||!!m.plein);
  /* LE DECOLLAGE NITRO ALLUMEE : sur une map sans decor, quand le bord est imminent (la sortie ne se discute plus), on garde la nitro tenue
     jusqu'au decollage au lieu de la couper : les joueurs partent nitro allumee 63 fois sur 100, le parent 17. En vol, la loi « vers la route » reprend. */
  if(!decor&&lache&&!v.dessous&&!v.glisse&&!v.rebond&&tn.t!=null&&tn.t<R.bordNitro&&jauge>R.bordJauge)m.nitro=true;
  m.facon=null;m.nFigVol=0;
  /* LE RACCOURCI : on regarde les sorties la ou la route tourne (ou quand un troncon s'offre en contrebas), hors des couloirs et du dessous */
  /* SOUS LA DALLE : on n'y reste pas. Apres dessousMax secondes, on regarde les sorties et l'on prend celle qui se pose DESSUS (hors des maps a decor). */
  if(v.dessous){if(m.tDessous==null)m.tDessous=v.t;}else m.tDessous=null;
  const sortir=!!v.dessous&&v.t-m.tDessous>R.dessousMax&&(!DECOR[v.carte]||R.dessousDecor>0);
  const permis=(sortir||(R.raccCartes[v.carte]!==0&&!v.dessous))&&!couloir&&!v.rebond&&!v.glisse&&!(v.invulnerable>0);
  const tourneLoin=Math.abs(tourne(v,400)),offre=Array.isArray(v.troncons)&&v.troncons.length>0;
  const regarde=permis&&(sortir||tourneLoin>R.raccVirage||offre||!!m.sortie);
  if(m.sortie){
    /* engage : volant a fond vers le bord choisi, jusqu'au decollage ; on renonce si plus aucun rayon de ce cote ne sauve, ou si le bord tarde */
    const tient=tientEncore(v,m.sortie.cote);
    /* on ne renonce que si le bord est encore a plus d'une demi-seconde : plus pres, la caisse sort de toute facon, en travers et sans cible
       (MESURE, ville 910370 : un engagement abandonne a 18 s, puis un vol subi de 10 s, mort jauge vide ; sans raccourci la meme course dure 236 s) */
    const X9=v.sorties&&v.sorties[m.sortie.cote>0?'gauche':'droite'],recuperable=!X9||!(X9.t<=.5);
    /* UNE SORTIE DU DESSOUS NE SE DISCUTE PAS : le rayon du sol y dit « air » une vue sur deux, et la caisse fait le tour de la dalle quand meme */
    const tetu=!!m.sortie.dessous&&!!v.dessous;
    if(!permis||(!tetu&&tient===false&&recuperable)||v.t-m.sortie.t0>m.sortie.attente+(tetu?2.5:.9)){m.sortie=null;m.tAbandon=v.t;}
    else return {volant:m.sortie.cote,nitro:m.sortie.facon==='plane'||m.nitro||(tetu&&R.dessousNitro>0),ensuite:{volant:0},regarder:'sorties'};}
  /* SOUS LA DALLE, AU BORD TOUT DE SUITE : le cote dont un rayon promet une pose DESSUS, sinon le bord le plus proche */
  if(sortir&&R.dessousAveugle>0&&permis&&!lache){
    const S=v.sorties||{},dec=!!DECOR[v.carte]&&R.dessousDecor<2;
    const cote9=k=>{const X=S[k],Y=X&&Array.isArray(X.rayons)?X.rayons:[];
      const dessus=Y.some(r=>r&&r.issue==='pose'&&!r.dessous),sauf=Y.some(r=>r&&(r.issue==='pose'||r.issue==='levre'||r.issue==='portail'));
      if(dec&&!sauf)return null;
      const att=X&&X.t!=null?+X.t:(v.demi-(k==='gauche'?1:-1)*v.lat)/Math.max(8,.25*vit);
      return {s:(dessus?10:sauf?4:0)-att,att:att};};
    const g9=cote9('gauche'),d9=cote9('droite'),c9=g9&&(!d9||g9.s>=d9.s)?1:d9?-1:0,q9=c9>0?g9:d9;
    if(c9&&q9.att<=4){m.vu=null;m.sortie={cote:c9,facon:'versRoute',cible:null,gain:0,attente:q9.att,t0:v.t,dessous:true};
      return {volant:c9,nitro:m.nitro||R.dessousNitro>0,ensuite:{volant:0},regarder:'sorties'};}}
  if(regarde&&!lache&&!(m.tAbandon!=null&&v.t-m.tAbandon<R.raccRepos)){
    const rc=raccourci(v,sortir);
    /* LA PROMESSE DOIT TENIR DEUX VUES DE SUITE (0,1 s) du meme cote avant qu'on s'engage : un rayon du sol qui dit « pose » une vue sur deux
       est une pose qui ne tient a rien */
    if(rc&&!(m.vu&&m.vu.cote===rc.cote&&v.t-m.vu.t<=.25))m.vu={cote:rc.cote,t:v.t};
    else if(rc){m.vu=null;m.sortie={cote:rc.cote,facon:rc.facon,cible:rc.cible,gain:rc.gain,attente:rc.attente,t0:v.t};m.nRacc=(m.nRacc|0)+1;
      return {volant:rc.cote,nitro:rc.facon==='plane'||m.nitro,ensuite:{volant:0},regarder:'sorties'};}}
  return regarde?{ligne:ligne,nitro:m.nitro,regarder:'sorties'}:{ligne:ligne,nitro:m.nitro};
}

/* ---------- EN VOL ---------- */
/* LA LOI « VERS LA ROUTE » (README § 2 bis), recopiee : c'est elle que jouent les rayons versRoute et versRoutePlane du radar */
function versRoute(v,nitro,m){
  const R=REGLAGES,f=v.vol,p=f.proche,o={volant:0,manche:0,nitro:nitro};
  if(!p)return o;
  let lat=p.lat,axe=p.axe;
  if(m){const q=m.pv;
    if(R.volAvance>0&&q&&v.t>q.t&&v.t-q.t<=.25){const dt=v.t-q.t,dl=(p.lat-q.lat)/dt,da=(p.axe-q.axe)/dt;
      if(Math.abs(dl)<400&&Math.abs(da)<6){lat+=dl*R.volAvance;axe+=da*R.volAvance;}}
    m.pv={t:v.t,lat:p.lat,axe:p.axe};}
  if(Math.abs(p.axe)<1.6||R.volDemiTour>0){
    const portee=R.volRetour>0?Math.max(40,R.volRetour*Math.max(1,+v.vitesse||0)):40;
    o.volant=cl((cl(-lat/portee,-.6,.6)-axe)*1.6,-1,1)*(p.envers?-1:1);}
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
  versRoute:(v,m)=>versRoute(v,false,m),
  versRoutePlane:(v,m)=>versRoute(v,true,m),
  /* VISER un troncon en contrebas (le raccourci) : la loi est celle des yeux (vue.vol.cible : son volant et son manche du moment) — tourner le vol
     vers la cible, regler la portee au manche, puis « vers la route » a l'approche. Sans cible en vue : vers la route. */
  viser:(v,m)=>{const c=v.vol.cible;return c?{volant:c.volant,manche:c.manche,nitro:false}:versRoute(v,false,m);},
  viserPlane:(v,m)=>{const c=v.vol.cible;return c?{volant:c.volant,manche:c.manche,nitro:true}:versRoute(v,true,m);}
};
const LONGS={rien:1,plane:1,versRoute:1,versRoutePlane:1,viser:1,viserPlane:1};   /* les rayons joues jusqu'au bout de l'air : « libre » y veut dire jauge vide */
/* ce que vaut l'issue d'un rayon : 100 = une pose droite tout de suite ; sous 35 = on y reste.
   Une pose vaut par son AXE et par l'endroit ou la caisse sera 0,3 s apres (elle glisse dans son axe avant que le volant morde). MESURE (tour 2,
   29 decollages d'une course) : la moitie etaient des sorties EN CHAINE — revenue en travers (axe 0,5 a 1 rad : « propre » pour le jeu, qui
   tolere 55°), la caisse se posait et ressortait par l'autre bord dans la seconde. */
function vaut(r,long,v){
  if(!r)return -1;
  const t=+r.t||0;
  if(r.issue==='pose'){
    const axe=+r.axe||0,glisse=(+r.lat||0)+v.vitesse*Math.sin(cl(axe,-1.5,1.5))*REGLAGES.derive;
    /* un raccourci vaut un peu plus qu'un simple retour (au plus 12 points : jamais assez pour preferer une pose de travers) */
    return 100-20*Math.abs(axe)-3*t-Math.min(20,Math.max(0,Math.abs(glisse)-(v.demi-4)))-(r.propre===false?20:0)-(r.dessous?REGLAGES.dessousPose:0)+Math.min(12,Math.max(0,+r.gain||0)/40);}
  if(r.issue==='portail')return 94;
  if(r.issue==='levre')return 80-3*t;
  if(r.issue==='libre'||r.issue==='coupe'){
    if(long)return 12+2*t;                                    /* rien avant la fin de l'air : la jauge vide suit */
    return 34-Math.min(20,(Math.abs(+r.haut||0)+Math.abs(+r.lat||0))/10);}   /* un rayon court : on ne sait pas ; mieux vaut finir pres de la route */
  return Math.min(30,5*t);                                    /* choc, air, fond : le plus tard possible */
}
const sauve=r=>!!r&&(r.issue==='pose'||r.issue==='levre'||r.issue==='portail');
/* une pose propre, dessus, sous l'angle donne : ce qu'on exige des DEUX rayons pour une figure a marge large */
const poseNette=(r,axeMax)=>!!r&&r.issue==='pose'&&r.propre!==false&&!r.dessous&&Math.abs(+r.axe||0)<axeMax;
/* LE VOL. Une facon de piloter est TENUE : la main met 0,2 a 0,3 s a obeir et le vol tourne de 3 rad par seconde — changer de facon a chaque
   vue, c'est zigzaguer d'un cote a l'autre de la route jusqu'a la jauge vide (MESURE, tour 3 : deux morts « air » sur quatre courses, la caisse
   passee quatre fois au-dessus de la dalle sans s'y poser). Donc :
   · au decollage, la loi « vers la route » (la seule mesuree : 9 retours sur 10 apres une sortie par le bord) ;
   · tant que le radar dit que la facon tenue mene a une pose (ou a la levre, au portail), on n'en change pas ;
   · sinon, et pas plus souvent que toutes les 0,35 s (sauf mort annoncee dans la seconde), on prend la facon du rayon qui vaut le plus.
   · EXCEPTION (dessous) : si la facon tenue mene a une pose SOUS la dalle et qu'un autre rayon se pose propre DESSUS, on change tout de suite. */
function enVol(v,m){
  const R=REGLAGES,f=v.vol,Y=f.radar&&Array.isArray(f.radar.rayons)?f.radar.rayons:null;
  /* sorti expres : la facon que le radar a promise au sol ; sinon la loi « vers la route » */
  if(!m.facon){m.facon=m.sortie&&FACONS[m.sortie.facon]?m.sortie.facon:'versRoute';m.tFacon=v.t;m.voulu=!!m.sortie;m.cible=m.sortie&&m.sortie.cible!=null?m.sortie.cible:null;m.sortie=null;m.nFigVol=0;m.tGeste=null;}
  let tenuPose=null;
  if(Y){
    const tenu=Y.find(x=>x&&x.m==='tenu'),depuis=v.t-m.tFacon,loi=m.facon.indexOf('versRoute')===0||m.facon.indexOf('viser')===0;
    /* le rayon d'une facon : pour « viser », celui de MA cible si j'en tiens une */
    const rayonDe=nom=>Y.find(x=>x&&x.m===nom&&(nom.indexOf('viser')!==0||m.cible==null||nom!==m.facon||x.cible===Math.round(m.cible)));
    /* ce que dit le radar de la facon tenue : son propre rayon, et une fois les doigts dessus depuis une reaction, le rayon `tenu` (MESURE : juste
       49 fois sur 50) — sauf pour les lois « vers la route », dont l'ordre change a chaque vue : `tenu` n'y dit que la vue du moment */
    let mien=!loi&&tenu&&depuis>.45?tenu:rayonDe(m.facon);
    /* EN PLONGEON, ON TIENT SA CIBLE. MESURE (nuages 910074) : le rayon d'un plongeon annonce « pose » neuf vues sur dix et « air » la dixieme (la
       main obeit avec 0,2 s de retard, le rayon n'en sait que la moyenne) ; changer de facon a la premiere mauvaise vue, c'etait abandonner la cible a
       150 m au-dessus d'elle. Donc : si l'autre rayon vers la MEME cible (avec ou sans reacteur) se pose, on le prend ; sinon on attend trois
       mauvaises vues de suite (0,3 s) avant de chercher ailleurs — sauf decor annonce dans la seconde. */
    m.mal=sauve(mien)?0:(m.mal|0)+1;
    if(!sauve(mien)&&m.facon.indexOf('viser')===0){
      const autre=m.facon==='viser'?'viserPlane':'viser',ra=Y.find(x=>x&&x.m===autre&&(m.cible==null||x.cible===Math.round(m.cible)));
      if(sauve(ra)){m.facon=autre;m.tFacon=v.t;m.mal=0;mien=ra;}}
    const patience=m.facon.indexOf('viser')===0&&m.mal<3&&!(mien&&mien.issue==='choc'&&(+mien.t||0)<1.2),sMien=vaut(mien,true,v);
    if(mien&&mien.issue==='pose'&&mien.propre!==false)tenuPose=mien;
    /* FUIR LE DESSOUS : la facon tenue se pose, mais sous la dalle — on cherche un rayon qui se pose dessus */
    const fuit=R.dessousFuir>0&&!!mien&&mien.issue==='pose'&&!!mien.dessous;
    if((!sauve(mien)||fuit)&&!patience&&(depuis>R.tenirFacon||fuit||(mien&&(+mien.t||0)<1))){
      let mieux=null,sMieux=-9,cibleMieux=null;
      for(const nom in FACONS){
        if(nom===m.facon)continue;
        /* en vol SUBI on ne se met pas a viser un morceau lointain : on revient. MESURE (26/11, 12 courses, memes graines) : avec cette bascule, des vols
           subis de 6 s finissaient jauge vide ou contre la roche (grotte 910148 : 106 s de course au lieu de 289) */
        if(!m.voulu&&nom.indexOf('viser')===0)continue;
        /* a issue egale : la loi vers la route d'abord, et sans nitro (un vol sans reacteur rend de la jauge) */
        const ry=rayonDe(nom);
        if(fuit&&!(ry&&ry.issue==='pose'&&ry.propre!==false&&!ry.dessous))continue;
        const s=vaut(ry,!!LONGS[nom],v)+(nom==='versRoute'?3:nom==='versRoutePlane'?2:nom==='rien'?1:0);
        if(s>sMieux){sMieux=s;mieux=nom;cibleMieux=ry&&typeof ry.cible==='number'?ry.cible:null;}}
      if(mieux&&sMieux>sMien+(fuit?4:R.bascule)){m.facon=mieux;m.tFacon=v.t;m.cible=mieux.indexOf('viser')===0?cibleMieux:null;}}
  }
  const o=FACONS[m.facon](v,m);
  /* LES FIGURES. MESURE (joueurs au clavier) : 2,8 figures lancees par minute, toutes en vol ; 18 % des vols en ont, 1,9 par vol a figure (5 au
     plus), la premiere 0,56 s apres le decollage, dans des vols de 2,8 s. On en lance une quand la facon tenue mene a une pose propre dans plus de
     figTemps secondes, que la jauge la paie et que le reacteur ne sert pas (tenir la NITRO redresse la figure). La direction : avant, arriere en
     alternance (↑ pique, ↓ cabre : 0,2 rad sur le geste) ; de cote seulement du cote ou le vol braque deja (la fleche tient 0,27 s : 0,8 rad). */
  const M=v.main||{},jauge=(v.nitro||0)+(v.reserve||0),enCours=f.figure?(f.figure.enCours|0):0;
  /* LA MARGE LARGE (maps sans decor, vol subi) : le parent exige 15 m de haut, que la loi « vers la route » (qui pique des 10 m) ne laisse presque
     jamais. A la place, on regarde ce qui compte : la facon tenue ET sa jumelle au reacteur se posent toutes deux, propres, dessus, droites ; la pose est
     lointaine (2,2 s pour la 1re figure : le seuil mesure sur) ; il reste de l'air a la pose. Un tel vol peut porter jusqu'a trois figures. */
  const parentOk=!!m.voulu||!!(f.proche&&f.proche.haut>R.figHaut&&!DECOR[v.carte]);
  let large=false;
  if(!parentOk&&tenuPose&&Y&&!DECOR[v.carte]&&m.facon==='versRoute'&&f.proche&&f.proche.haut>R.largeHaut){
    const jum=Y.find(x=>x&&x.m==='versRoutePlane');
    large=poseNette(tenuPose,R.largeAxe)&&poseNette(jum,R.largeAxe)&&(!f.air||f.air.reste>(+tenuPose.t||0)+R.largeAir)&&(tenuPose.air==null||tenuPose.air>=R.largeAir);}
  const nMax=parentOk?R.figMax:R.largeMax;
  const tSeuil=m.voulu?R.figPlongeon:parentOk?R.figTemps:((m.nFigVol|0)>0?R.largeT2:R.largeT1);
  if(tenuPose&&!o.nitro&&!M.geste&&(m.nFigVol|0)<nMax&&enCours<2&&(jauge>=R.figJauge||v.nitroLibre)
     &&(+tenuPose.t||0)>=tSeuil&&(m.tGeste==null||v.t-m.tGeste>=R.figEcart)&&(!f.air||f.air.reste>(+tenuPose.t||0)+.8)
     &&f.t>=R.figDepuis&&!(f.bumps>0)&&(parentOk||large)){
    /* LA DIRECTION DU GESTE EST CELLE QUE LE VOL DEMANDE DEJA. Le geste tient sa fleche 0,27 s : ↑ pique, ↓ cabre, ← → braquent (jusqu'a 0,8 rad).
       MESURE (26/11, 12 courses) : avec une direction prise en alternance, 5 plongeons voulus sur 23 finissaient mal (3 contre un pic de la jade) ;
       sans aucune figure, 2 sur 30. La fleche du geste est donc celle que la loi du vol tient a cet instant ; si elle n'en tient aucune : avant
       ou arriere, en alternance. */
    const n=m.nFig|0;
    o.geste='figure';o.direction=o.manche<0?'avant':o.manche>0?'arriere':o.volant>.5?'gauche':o.volant<-.5?'droite':(n%2?'arriere':'avant');
    m.nFig=n+1;m.nFigVol=(m.nFigVol|0)+1;m.tGeste=v.t;}
  if(m.cible!=null)o.cible=m.cible;   /* a la vue suivante, les rayons « viser » et vue.vol.cible portent sur MA cible */
  o.ensuite={ligne:0};   /* a la pose, la main lache la fleche du vol et reprend la route sans attendre la decision suivante */
  return o;
}

module.exports={
  nom:'pilote',
  profil:PROFIL,
  REGLAGES:REGLAGES,
  decide:function(vue,m){return vue.mode==='sol'?auSol(vue,m):vue.mode==='vol'?enVol(vue,m):{};}
};