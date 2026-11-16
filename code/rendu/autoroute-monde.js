/* ===== LES AUTOROUTES DU MONDE : LES PLANS DU JEU (2026-11-15, Sacha : « une dizaine en plus, d'autres pays ; discret mais visible ; garde les mieux notées ») =====
   Un plan par pays, écrit avec l'outillage de rendu/autoroute-pays.js (K.trait, K.plot, K.motif, K.poteaux, K.dessin, K.decal…). `arpInscrit` le met dans le
   tirage de la piste (arpTirage) : à parts égales avec l'américaine, sur toutes les maps. ⚠ On AJOUTE À LA FIN : l'ordre est celui du tirage.
   Essayer : ?pays=xx (xx = se, ch, kr, uk, fr, no, jp, za, my, au ; us = l'américaine), dbgPays('xx') en course. Banc : outils/banc-autoroute/pays.cjs.
   Ce morceau est RECOLLÉ par outils/banc-autoroute/monde.cjs depuis outils/banc-autoroute/pays/ : retoucher là-bas, puis relancer. */
/* ===== SUÈDE — LA MÖTESFRI VÄG (maquette du 2026-11-15) =====
   Le vrai marquage (Transportstyrelsen, TSFS 2010:171 et les fiches M1-M3 — largeurs et rapport 1:2 de la kantlinje vérifiés ; longueurs
   3+9 et 9+3 de mémoire, le texte en ligne est ambigu) : tout BLANC ; körfältslinje M1 : 3 m peints, 9 m de vide, 15 cm ;
   kantlinje M2 : des dellinjer de 1 m, 2 m de vide, 10 à 30 cm (la rive « pointillée » des routes suédoises, motorvägar comprises) ;
   varningslinje M3 : 9 m peints, 3 m de vide, au moins aussi large que M1 (20-30 cm), avant un changement.
   La route 2+1 « mötesfri väg » : une mittremsa étroite entre deux kantlinjer, fraisée (mittfräsning, la räffla qui gronde), hérissée du
   vajerräcke : des câbles d'acier tendus à ~0,75 m sur des poteaux galvanisés gris, au catadioptre blanc. Et le 2+1 ALTERNE : tous
   les quelques kilomètres, le côté à deux voies change, la séparation passe de l'autre côté — une varningslinje l'annonce.
   LA SIGNATURE : la rangée de poteaux gris qui file à côté de la caisse, bordée de ses deux rives en pointillés de 1 m qui s'écartent
   autour d'elle ; et sur les bords de la route, les mêmes pointillés courts au lieu d'une rive pleine.
   LE TOUR DE LA PISTE : un épisode tous les P ≈ 1,9 km sur toute la longueur K.L (le premier s'ouvre à 300 m, pour que les poteaux
   filent dès la vue de jeu : la caisse est figée vers 430 m) ; 900 m de séparation ; il change de côté à chaque fois (la 4e séparation,
   puis la 6e, puis la 4e…). Toutes les marques sont des traits SUR TOUTE LA PISTE dont la place et la largeur suivent l'épisode
   (largeur nulle hors de lui) : 15 traits et fonds quelle que soit la longueur. Les poteaux : un paquet par épisode, leur pas (8 m au
   moins) s'élargit pour que la piste en compte au plus 390 (mesuré : 315 aux nuages, 340 en ville, 365-389 ailleurs).
   AUCUNE LIGNE PLEINE : les rives en 1+2, les séparations en 3+9, la varningslinje en 9+3 sur 70 m au plus.
   Libertés prises : la mötesfri sépare deux sens ; ici elle sépare deux groupes de voies d'une route à sens unique. LE CÂBLE EST RETIRÉ
   (2026-11-15) : un ruban plat ne pend pas ; même coupé entre les poteaux, il se lisait encore comme une ligne peinte de 900 m. La
   rangée de poteaux suffit à dire « vajerräcke ». Les poteaux sont espacés de 9 m environ (au lieu de ~2,5-3) pour rester légers, plus clairs (galvanisé neuf) et plus hauts (0,95 m) que les vrais pour se lire sur les routes sombres. */
arpInscrit('se',{nom:'Suède — mötesfri väg',plan:function(K){
  const g=K.g,d=K.d,L=K.L,B=0xf1efe8,GR=0xd3d9de,N=10,lw=(d-g)/N;
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  /* l'épisode : A0 = la première annonce ; dans chaque cycle de P m, u = 0 l'annonce (varningslinje), u = AN l'ouverture, LEN m de
     séparation, OUV m pour se refermer, puis la varningslinje de sortie ; COTES = les deux séparations qui alternent */
  const A0=240,AN=60,LEN=900,OUV=45,DEMI=.8,COTES=[4,6],P0=1900;
  let nEp=0;for(let s=A0;s+AN+60<L-40;s+=P0)nEp++;
  const PER=Math.max(8,Math.ceil(nEp*(LEN-30)/390)),P=Math.round(P0/PER)*PER,FIN=AN+LEN+OUV;
  const ep=function(sv){if(sv<A0)return null;const k=Math.floor((sv-A0)/P);return {k:k,u:sv-A0-k*P,i:COTES[k%2]};};
  const ou=function(sv){const e=ep(sv);if(!e||e.u<AN||e.u>FIN)return 0;return Math.min(lisse((e.u-AN)/OUV),lisse((FIN-e.u)/OUV));};
  const xm=function(sv){const e=ep(sv);return g+(e?e.i:COTES[0])*lw;};
  /* la séparation i est « prise » par l'épisode : de l'annonce à la fin de la varningslinje de sortie */
  const prise=function(sv,i){const e=ep(sv);return !!e&&e.i===i&&e.u<FIN+60;};
  /* les rives : kantlinje 1+2, 30 cm (celle d'une motorväg) */
  K.trait(g,{l:.28,c:B,op:.86,per:3,on:1});
  K.trait(d,{l:.28,c:B,op:.86,per:3,on:1});
  /* les séparations ordinaires : körfältslinje 3+9 (les deux qui portent l'épisode s'effacent quand il est là) */
  for(let i=1;i<N;i++){const lq=COTES.indexOf(i)<0?.15:function(sv){return prise(sv,i)?0:.15;};
    K.trait(g+i*lw,{l:lq,c:B,op:.86,per:12,on:3});}
  /* la varningslinje 9+3 : avant l'ouverture et après la fermeture (70 m au plus) */
  K.trait(xm,{l:function(sv){const e=ep(sv);if(!e)return 0;return (e.u<AN+8||(e.u>FIN-6&&e.u<FIN+60))?.24:0;},c:B,op:.88,per:12,on:9});
  /* les deux kantlinjer 1+2 qui s'écartent autour de la séparation */
  const kl=function(sv){return ou(sv)>.03?.2:0;};
  K.trait(function(sv){return xm(sv)-DEMI*ou(sv);},{l:kl,c:B,op:.86,per:3,on:1});
  K.trait(function(sv){return xm(sv)+DEMI*ou(sv);},{l:kl,c:B,op:.86,per:3,on:1});
  /* la räffla : des barreaux sombres et fins dans la mittremsa (aucun fond continu) */
  K.fond(function(sv){return xm(sv)-.3*ou(sv);},function(sv){return xm(sv)+.3*ou(sv);},{c:K.NOIR,op:.1,per:1,on:.4});
  /* le vajerräcke : la rangée de poteaux gris au catadioptre blanc, un paquet par épisode */
  for(let k=0;k<nEp;k++){const s0=A0+k*P+AN+30;K.poteaux(g+COTES[k%2]*lw,{per:PER,c:GR,c2:0xf2f2ea,h:.95,s0:s0,s1:s0+LEN-30});}
}});
/* ===== SUISSE — L'AUTOBAHN (maquette du 2026-11-15, reprise le même jour : « la plus chargée, rends-la discrète ») =====
   Le vrai marquage (SSV art. 72-79, norme VSS SN 640 850a ; chantiers : directives cantonales, ex. Lucerne 653 201) : tout BLANC ;
   Leitlinien de 6 m tous les 18 m (6 m peints, 12 m de vide), 15 cm, sans plots ni ombre (du bitume) ; rives pleines de 20 cm.
   Dans un chantier, les marquages provisoires sont GELB-ORANGE (lignes, boutons « Markierungsknöpfe » à catadioptres, balises
   « Leitkörper ») et priment sur le blanc, qui reste dessous, à demi effacé ; les voies restent ouvertes mais se RESSERRENT et glissent
   de côté (la Verschwenkung, la circulation sur voies étroites).
   LA SIGNATURE : le blanc suisse sobre (6 m peints, 12 m vides, aucun plot) sur toute la piste ; et, tous les 1 300 m, un court chantier
   de 290 m (biseaux de 80 m compris) : une voie se ferme d'un côté (gauche, puis droite, en alternance), la rive provisoire en boutons orange et balises, et
   SEULEMENT les trois séparations du milieu (là où roule la caisse) passent à l'orange par-dessus leur blanc fantôme ; les autres restent
   blanches et glissent avec elles.
   Libertés : l'orange tire un peu vers le rouge (le gelb-orange suisse est plus jaune) pour ne pas se confondre avec l'or des pièces ;
   une ombre courte derrière les tirets orange, pour qu'ils se lisent sur un béton pâle ; une seule voie fermée (le vrai chantier en
   rend souvent deux) et un chantier court, pour que l'orange reste un épisode et pas le sol. */
arpInscrit('ch',{nom:'Suisse — Autobahn',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,BL=0xf1efe8,OR=0xee8a2e;
  /* les chantiers en boucle sur K.L : le premier à A0, puis tous les P m ; long de LC m ; le biseau fait B m ; une voie rendue */
  const A0=370,P=1300,LC=290,B=80,W=lw,MIL=[4,5,6];
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  const zone=function(sv){const k=Math.floor((sv-A0)/P);if(k<0)return null;const a=A0+k*P;
    if(sv>a+LC||a+LC>K.L-40)return null;return [a,a+LC,k%2?1:-1];};
  const f=function(z,sv){return Math.min(lisse((sv-z[0])/B),lisse((z[1]-sv)/B));};
  const gY=function(sv){const z=zone(sv);return z&&z[2]<0?g+W*f(z,sv):g;},dY=function(sv){const z=zone(sv);return z&&z[2]>0?d-W*f(z,sv):d;};
  const rive=function(sv){const z=zone(sv);return z&&z[2]>0?dY(sv):gY(sv);};
  const coeur=function(sv,m){const z=zone(sv);return !!z&&sv>z[0]+m&&sv<z[1]-m;};
  /* LE BLANC : rives pleines ; Leitlinien 6/12 qui suivent le resserrement */
  K.trait(g,{l:.2,c:BL,op:.84});
  K.trait(d,{l:.2,c:BL,op:.84});
  for(let i=1;i<N;i++){const mil=MIL.indexOf(i)>=0,xi=function(sv){return gY(sv)+i*(dY(sv)-gY(sv))/N;};
    K.trait(xi,{l:mil?function(sv){return coeur(sv,20)?0:.15;}:.15,c:BL,op:.84,per:18,on:6});
    if(!mil)continue;
    /* au milieu : le fantôme blanc à sa place d'origine, et l'orange qui glisse (décalé d'un demi-pas) */
    const x=g+i*lw;
    K.trait(x,{l:function(sv){return coeur(sv,20)?.13:0;},c:BL,op:.18,per:18,on:6});
    K.trait(xi,{l:function(sv){return coeur(sv,20)?.14:0;},c:OR,op:.45,per:18,on:6,ph:9,ombre:.35});} /* (16/11) plus doux : au téléphone, de près, ils se lisaient comme des traînées de vitesse */
  /* la rive provisoire : des boutons orange tous les 4 m (orange aussi à contresens), seulement dans les chantiers */
  K.plot(rive,{per:4,long:.45,l:function(sv){return coeur(sv,B*.25)?.42:0;},c:OR,c2:OR});
  /* la surface interdite (dans les biseaux) : une hachure par côté et par bout, nulle hors des biseaux */
  const bis=function(sv,cote,fin){const z=zone(sv);if(!z||z[2]!==cote)return false;const u=fin?z[1]-sv:sv-z[0];return u>B*.3&&u<B*1.05;};
  for(const cote of [-1,1])for(const fin of [0,1]){
    const x0=function(sv){if(!bis(sv,cote,fin))return 0;return cote<0?g+.5:rive(sv)+.5;};
    const x1=function(sv){if(!bis(sv,cote,fin))return 0;return cote<0?rive(sv)-.5:d-.5;};
    K.motif(x0,x1,{type:'hachure',pas:6,ep:.4,pente:(cote<0)!==!!fin?.9:-.9,c:OR,op:.45});}
  /* les balises sur la rive provisoire, chantier par chantier */
  for(let a=A0;a+LC<=K.L-40;a+=P){const cote=zone(a+1)[2];
    K.poteaux(function(sv){return rive(sv)+cote*.8;},{per:14,c:0xe8641c,c2:0xf2f2ea,h:1.0,s0:a+B*.5,s1:a+LC-B*.5});}
}});
/* ===== CORÉE DU SUD — LE GYEONGBU (maquette du 2026-11-15, revue le même jour) =====
   Le vrai marquage : lignes de voie BLANCHES en tirets de 10 m pour 10 m de vide (autoroutes coréennes), 15-20 cm ; rive droite blanche
   pleine ; rive gauche (côté terre-plein) JAUNE pleine ; la voie de gauche du Gyeongbu est la voie de BUS (버스전용차로), séparée par une
   ligne BLEUE et marquée « 버스전용 » au sol ; et la marque coréenne : les LIGNES DE GUIDAGE COLORÉES (노면색깔유도선, loi : règlement
   d'application du code de la route, annexe 6 ; manuel du ministère, 2017) : une ligne ROSE et une ligne VERTE (vert clair) peintes AU
   MILIEU des voies avant un échangeur ou une bifurcation, qui s'écartent chacune vers sa branche. Couleurs vérifiées (law.go.kr, presse) ;
   largeur des lignes de guidage et motif de la ligne bleue de mémoire (≈ 45 cm ; bleu en tirets au rythme des voies).
   LA SIGNATURE : par épisodes, deux lignes rose et verte côte à côte au milieu des voies, qui se séparent en Y ; en permanence, les longs
   tirets 10/10 et le liseré bleu de la voie de bus.
   LIBERTÉS PRISES : les vraies lignes de guidage sont PLEINES ; ici elles sont en LONGS TIRETS (11 m peints, 7 m de vide), le rose et le
   vert décalés d'un demi-pas, plus étroites (15 cm) et plus pâles (opacité .25-.28, ×1,5 la nuit car le moteur les assombrit), pour rester
   la marque du pays sans devenir l'objet le plus voyant de l'image ; épisodes de 350 m tous les 950 m sur toute la piste (le premier dans
   la fenêtre du banc). Second regard : à 1 900 m, 1 550 m sans signature (s=1500, s=3000 : rien que le liseré bleu) ; la nuit, en grotte,
   la double atténuation les effaçait.
   Revue : les deux lignes de guidage étaient pleines, larges et vives près de la caisse (la moins discrète du lot) : longs tirets, pâles,
   fines ; 22 rubans et 182 000 sommets au canyon : les plots seulement sur une séparation sur trois (3 lignes au lieu de 9). */
arpInscrit('kr',{nom:'Corée du Sud — Gyeongbu',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,B=0xf1efe8,J=0xeec23c,BLEU=0x3f86e8,ROSE=0xdc78a8,VERT=0x7cc690;
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  /* les rives : jaune à gauche (terre-plein), blanche à droite */
  K.trait(g,{l:.22,c:J,op:.86});
  K.trait(d,{l:.22,c:B,op:.86});
  /* les séparations : la première (la voie de bus) en bleu, les autres en blanc ; 10 m peints, 10 m de vide ;
     un plot au milieu du vide, sur une séparation sur trois */
  for(let i=1;i<N;i++){const x=g+i*lw;
    K.trait(x,{l:i===1?.22:.18,c:i===1?BLEU:B,op:.86,per:20,on:10,ombre:i===1?0:1.2});
    if(i%3===0)K.plot(x,{per:20,ph:15,c:0xf4f2ea,c2:0xf4f2ea});}
  /* la voie de bus : « 버스전용 », un tous les ~650 m (au plus 28) */
  K.texte('bus','버스전용',{police:'sans-serif',gras:true,taille:52});
  for(let s=500,n=0;s<K.L-200&&n<28;s+=650,n++)K.decal(s,g+lw*.5,{d:'bus',l:1.7,long:7.5,c:0xeef0f4,op:.8});
  /* LES LIGNES DE GUIDAGE : un épisode tous les 950 m = [début, point où elles s'écartent, fin, voie de départ du vert, sens] ;
     le vert et le rose partent côte à côte (deux voies voisines), puis chacun glisse de deux voies vers sa branche */
  const EP=[],VO=[4,5,3],SE=[1,-1,1];
  for(let s=380,k=0;s<K.L-400;s+=950,k++)EP.push([s,s+70,s+350,VO[k%3],SE[k%3]]);
  const guide=function(rose){return {x:function(s){for(const e of EP)if(s>=e[0]-1&&s<=e[2]+1){
        const v=e[3]+(rose?(e[4]>0?1:0):(e[4]>0?0:1)),x0=g+(v+.5)*lw,sens=(rose?1:-1)*e[4];
        return x0+sens*2*lw*lisse((s-e[1])/150);}return 0;},
      l:function(s){for(const e of EP)if(s>=e[0]&&s<=e[2])return .15*Math.min(lisse((s-e[0])/10),lisse((e[2]-s)/24));return 0;}};};
  const gr=guide(true),gv=guide(false),nu=1+.5*(K.nuit||0); /* revue du second regard : le moteur assombrit déjà la couleur la nuit (x.6) ; atténuées en plus, elles disparaissaient en grotte : on compense */
  K.trait(gr.x,{l:gr.l,c:ROSE,op:.25*nu,per:18,on:11});
  K.trait(gv.x,{l:gv.l,c:VERT,op:.28*nu,per:18,on:11,ph:9});
}});
/* ROYAUME-UNI — LE MOTORWAY (maquette du 2026-11-15, remise dans le budget le même jour)
   Le vrai marquage (Traffic Signs Manual, chapitre 5, de mémoire pour les chiffres) : lignes de voie diagramme 1005.1 (au-dessus de 40 mph),
   tirets COURTS de 2 m tous les 9 m (7 m de vide), 150 mm de large sur autoroute ; rives pleines 1012.1 (150-200 mm) ;
   les CAT'S EYES (plots réfléchissants, un vide sur deux = 18 m) : BLANCS entre les voies, ROUGES à la rive gauche (côté bande d'arrêt),
   AMBRE à la rive droite (le terre-plein central) ; VERTS là où une bretelle rejoint ; et par endroits les chevrons de distance
   (« keep apart 2 chevrons », un chevron pointé vers l'avant tous les 40 m au milieu de chaque voie).
   Sens unique, voie lente à GAUCHE (comme là-bas), la rapide contre le terre-plein, à droite.
   LA SIGNATURE : les tirets très courts et serrés (2 sur 9 m) piqués de cat's eyes, la rive gauche aux plots rouges, la droite aux plots ambre,
   et, par épisodes, les chevrons « keep apart » sous la caisse.
   LES LIBERTÉS PRISES (le budget : 30 rubans, 5 motifs) :
   · les chevrons ne sont peints que sur les QUATRE voies autour de la caisse (la vraie route les a sur toutes) : quatre motifs ;
   · les cat's eyes blancs ne sont que sur une séparation sur deux (là-bas, sur toutes) ;
   · les bretelles (rive « 1010 » aux plots verts) et les épisodes de chevrons reviennent EN BOUCLE sur toute la piste (K.L), aux mêmes pas ;
     chaque rive est UN ruban dont la largeur s'annule là où l'autre prend le relais (pas un ruban par tronçon). */
arpInscrit('uk',{nom:'Royaume-Uni — motorway',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,L=K.L;
  const ROUGE=0xd8402e,AMBRE=0xf0a020,VERT=0x3fd27a;
  /* LES BRETELLES : de 540 à 700 m, puis toutes les 3360 m */
  const BP=3360,BA=540,BB=700;
  const bret=function(s){const m=((s-BA)%BP+BP)%BP;return s>=BA&&m<=BB-BA;};
  /* la rive gauche : pleine, blanc cassé, ses cat's eyes ROUGES (un tous les 18 m, juste à l'intérieur) ;
     là où une bretelle rejoint, elle se fait « 1010 » (traits larges de 1 m tous les 2 m) et ses plots VERTS */
  K.trait(g,{l:function(s){return bret(s)?0:.2;},op:.86});
  K.plot(g+.42,{per:18,ph:14.5,c:ROUGE,l:function(s){return bret(s)?0:.4;},long:.4});
  K.trait(g,{l:function(s){return bret(s)?.28:0;},op:.86,per:2,on:1});
  K.plot(g+.48,{per:9,ph:5,c:VERT,l:function(s){return bret(s)?.4:0;},long:.4});
  /* la rive droite (le terre-plein) : pleine, ses cat's eyes AMBRE */
  K.trait(d,{l:.2,op:.86});
  K.plot(d-.42,{per:18,ph:14.5,c:AMBRE,l:.4,long:.4});
  /* les voies : tirets courts de 2 m sur 9 m ; un plot blanc au milieu d'un vide sur deux, sur une séparation sur deux (la 2e, la 4e, la 6e, la 8e : quatre lignes, pour tenir les sommets) */
  K.voies(g,d,N,{l:.15,per:9,on:2,op:.84});
  for(let i=2;i<N;i+=2)K.plot(g+i*lw,{per:18,ph:14.5,c:0xffffff,l:.32,long:.32});
  /* LES CHEVRONS DE DISTANCE : un V pointé vers l'avant au milieu de la voie, tous les 40 m, par épisodes de 320 m qui reviennent toutes les 2900 m
     (le premier de 390 à 710 m : dans la fenêtre photographiée). Sur les QUATRE voies autour de la caisse (x de −2 lw à +2 lw).
     En MOTIFS et pas en dessins : les dessins collés point par point disparaissaient sous le béton de la grotte et de Jade ; un motif suit
     la route comme les traits. Hors des épisodes la bande se ferme (largeur nulle). Pâle (.58) et ouvert : un marquage, pas un signal ; .90 la nuit (le moteur assombrit la peinture de 40 %) ;
     épais de 85 cm le long de la route (16/11, la grotte vue au ras : une branche de V plus mince tombe sous le pixel au-delà de ~40 m de l'œil,
     le matériau des motifs n'ayant pas l'épaisseur minimale à l'écran des traits ; il ne restait qu'un rang, il en reste deux, le troisième pâlit) ;
     un mètre d'air de chaque côté du V (vus de haut, des V plus larges se touchaient en une seule ligne en zigzag). */
  const EP=2900,E0=390,EL=320;
  const dedans=function(s){if(s<E0-1)return false;const m=(s-E0)%EP;return m<=EL;};
  const mil=Math.floor(N/2);
  for(let i=mil-2;i<mil+2;i++){const xa=g+i*lw+1,xb=g+(i+1)*lw-1,xm=(xa+xb)*.5;
    K.motif(function(s){return dedans(s)?xa:xm;},function(s){return dedans(s)?xb:xm;},
      {type:'chevron',pas:40,ep:.85,pente:-1.2,op:.58+.32*K.nuit,s0:E0-5,s1:L-40});}
}});
/* ===== FRANCE — L'AUTOROUTE (maquette du 2026-11-15 ; reprise du même jour : chevrons en quinconce, îlot refermé en biseau, épisodes en boucle) =====
   Le vrai marquage (IISR, 7e partie ; u = 7,5 cm sur autoroute) : tout BLANC ; séparation des voies T1 (3 m peints, 10 m de vide) ;
   rive droite T4 (39 m peints, 13 m de vide : deux traits et un vide ≈ 91 m, « un trait danger, deux traits sécurité ») ; rive gauche
   continue ; zones de rappel des distances : des chevrons blancs, pointe vers l'avant (« deux chevrons sécurité ») ; sortie : ligne
   d'affectation T3 (3 m / 1,33 m), plus grasse, puis un îlot de zébras.
   LA SIGNATURE : la longue rive hachée à droite et, sur ~900 m, les chevrons blancs qui filent devant la caisse.
   Libertés prises :
     · les chevrons sont peints dans les deux voies du milieu (là où roule la caisse), pas dans celle de droite, et EN QUINCONCE : un seul
       chevron par rangée, qui saute d'une voie à l'autre tous les 14 m (chaque voie : un tous les 28 m). Jamais deux
       ni trois chevrons côte à côte : rien qui rappelle la plaque turbo (une dalle sombre bordée de rails d'or, chevrons d'or serrés tous
       les 2,25 m). Ici : blancs pâles, ouverts, sans cadre, très espacés ;
     · l'îlot de la sortie ne mène nulle part (la route ne se divise pas) : il s'ouvre, puis se REFERME EN BISEAU sur la séparation ;
       son bord gauche reste en T3 (pointillé serré) pour qu'il n'y ait qu'UNE ligne pleine à la fois (le bord droit, 150 m) ;
     · le tout revient en boucle tous les 3 200 m (chevrons à 380-1 300 m du cycle, sortie à 2 300-3 000 m), sans un trait de plus :
       les épisodes sont des LARGEURS qui s'annulent hors de leur fenêtre. */
arpInscrit('fr',{nom:'France — autoroute',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,N=10,lw=(d-g)/N,xs=d-lw,P=3200; /* xs : la séparation de la voie de droite ; P : le cycle des épisodes */
  const u=function(sv){return ((sv%P)+P)%P;};
  /* la sortie (dans le cycle) : T3 de S0 à S1, puis l'îlot de S1 à S2 (il s'ouvre en 65 m, se referme en biseau sur les 55 derniers) */
  const S0=2300,S1=2850,S2=3000;
  const t3=function(sv){const w=u(sv);return w>=S0&&w<S2;},ilot=function(sv){const w=u(sv);return w>=S1&&w<S2;};
  const ouv=function(sv){const w=u(sv)-S1;if(w<0||w>S2-S1)return 0;
    const a=Math.min(1,w/65),f=Math.min(1,(S2-S1-w)/55);return Math.min(a*a*(3-2*a),f)*2.4;};
  /* les rives : à gauche continue, à droite la T4 */
  K.trait(g,{l:.22,c:B,op:.86});
  K.trait(d,{l:.24,c:B,op:.88,per:52,on:39,ph:6});
  /* les séparations T1 ; la dernière passe en T3 à l'approche de la sortie et le long de l'îlot (bord gauche) */
  for(let i=1;i<N-1;i++)K.trait(g+i*lw,{l:.17,c:B,op:.86,per:13,on:3});
  K.trait(xs,{l:function(sv){return t3(sv)?0:.17;},c:B,op:.86,per:13,on:3});
  K.trait(function(sv){return ilot(sv)?xs-.1:xs;},{l:function(sv){return t3(sv)?.24:0;},c:B,op:.88,per:4.33,on:3});
  /* le bord droit de l'îlot, plein (150 m), qui revient sur la séparation en biseau, et ses zébras */
  K.trait(function(sv){return xs+.1+ouv(sv);},{l:function(sv){return ilot(sv)?.22:0;},c:B,op:.88});
  K.motif(xs+.25,function(sv){return ilot(sv)?xs+ouv(sv)-.05:xs+.25;},{type:'hachure',pas:4,ep:.7,pente:.8,c:B,op:.78});
  /* les chevrons de rappel des distances : en quinconce dans les voies 4 et 5, un par rangée tous les 14 m (pointe à s ≡ 0 mod 14,
     le saut de voie au milieu du vide, à s ≡ 7) */
  const zc=function(sv){const w=u(sv);return w>=300&&w<2100;},vc=function(sv){return g+(4+(Math.floor((sv+7)/14)&1))*lw;};
  K.motif(function(sv){return zc(sv)?vc(sv)+.65:0;},function(sv){return zc(sv)?vc(sv)+lw-.65:0;},{type:'chevron',pas:14,ep:.65,pente:-2.2,c:B,op:.5});
}});
/* ===== NORVÈGE — LA MOTORVEG (maquette du 2026-11-15, reprise le même jour : « la double jaune rappelle l'américaine », puis le 2026-11-16 : sillon renforcé, jaunes en quinconce, jalons plus hauts) =====
   Le vrai marquage (Statens vegvesen, håndbok N302 Vegoppmerking ; Lærebok vegoppmerking, rapport 452 — vérifiés : sur motorveg la
   kantlinje de GAUCHE est JAUNE, celle de droite BLANCHE ; le jaune dit « l'autre sens est de ce côté » ; la forsterket midtoppmerking
   (FMO) = deux lignes jaunes posées dans un sillon fraisé en sinus (nedfrest sinusrille) de 0,5 à 1 m, qui fait vibrer la voiture ; dans
   le sillon de 1 m, la paire peut être une varsellinje). Les pas, vérifiés (catalogue NVDB, au-dessus de 50 km/h) : kjørefeltlinje 3 m peints,
   9 m de vide ; varsellinje 9 m peints, 3 m de vide. Largeurs de mémoire : 15 cm pour les traits, 20 cm pour la kantlinje. Le long des routes, l'hiver : les brøytestikker, les jalons de
   déneigement orange plantés tous les ~50 m sur les deux bords.
   LA SIGNATURE : le SILLON — une bande sombre de 1,2 m (un voile noir léger sur toute la largeur, et dedans une échelle de barreaux fraisés
   serrés, bien noirs) — qui file à gauche de la caisse, avec sur ses lèvres des tirets jaunes courts EN QUINCONCE (jamais côte à côte) ;
   et, sur les deux rives, les grands jalons orange vif (3,2 m, bien plus hauts que les poteaux américains, et sans leur bande blanche).
   Libertés prises : la FMO sépare deux sens ; ici elle sépare deux moitiés d'une route à sens unique, un épisode d'environ 700 m qui revient
   tous les 1 000 m (toute la piste, en boucle) ; ses deux lignes jaunes sont des tirets COURTS (4 m peints, 8 m de vide, au lieu des 9+3 de
   la varsellinje), DÉCALÉS d'un demi-pas l'un par rapport à l'autre (sur la vraie route ils sont alignés) : la paire se lit en zigzag
   de part et d'autre de l'échelle sombre, jamais comme la double ligne jaune américaine ; les
   ondes du sillon sont des barreaux droits de 0,6 m ; les jalons mesurent 3,2 m (un peu plus que les vrais, pour la vue de jeu), tous les 32 m (davantage sur les pistes de plus de 6,2 km, pour rester sous 390 jalons), et portent une bague sombre au lieu du
   catadioptre. */
arpInscrit('no',{nom:'Norvège — motorveg',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,J=0xeec247,N=10,lw=(d-g)/N,xm=g+4*lw; /* xm : la séparation à gauche de la caisse, où se creuse le sillon */
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  /* les épisodes de FMO, en boucle sur toute la piste : dans chaque tour de P mètres, [annonce, ouverture, fermeture] */
  const P=1000,AN=140,OV=200,FE=820,OUV=60,APR=60,DEMI=.42,BORD=.2;
  const loc=function(sv){return ((sv%P)+P)%P;};
  const ou=function(sv){const u=loc(sv);return Math.min(lisse((u-OV)/OUV),lisse((FE+OUV-u)/OUV));};
  const brin=function(sv){const u=((sv%36)+36)%36;return Math.min(lisse(u/1.5),lisse((30-u)/1.5));}; /* le sillon par tronçons de 30 m, 6 m sans fraisage : jamais une bande sombre continue au loin */
  const dansSillon=function(sv){const u=loc(sv);return u>=OV+6&&u<=FE+OUV-4;};
  const annonce=function(sv){const u=loc(sv);return (u>=AN&&u<OV+6)||(u>FE+OUV-4&&u<=FE+OUV+APR);};
  /* les rives : jaune à gauche, blanche à droite */
  K.trait(g,{l:.2,c:J,op:.86});
  K.trait(d,{l:.2,c:B,op:.86});
  /* les séparations : kjørefeltlinje 3+9 */
  for(let i=1;i<N;i++){if(i===4)continue;K.trait(g+i*lw,{l:.15,c:B,op:.86,per:12,on:3});}
  /* la séparation xm : kjørefeltlinje hors des épisodes, varsellinje blanche (9+3) à l'approche et à la sortie */
  K.trait(xm,{l:function(sv){return dansSillon(sv)||annonce(sv)?0:.15;},c:B,op:.86,per:12,on:3});
  K.trait(xm,{l:function(sv){return annonce(sv)?.18:0;},c:B,op:.88,per:12,on:9});
  /* le sillon fraisé : une bande sombre d'un mètre, ses ondes en barreaux serrés de 0,6 m (la sinusrille) ; nulle hors des épisodes */
  K.fond(function(sv){return xm-(DEMI+BORD)*ou(sv)*brin(sv);},function(sv){return xm+(DEMI+BORD)*ou(sv)*brin(sv);},{c:K.NOIR,op:.24});
  K.fond(function(sv){return xm-(DEMI+BORD*.5)*ou(sv)*brin(sv);},function(sv){return xm+(DEMI+BORD*.5)*ou(sv)*brin(sv);},{c:K.NOIR,op:.62,per:.6,on:.36});
  /* ses deux lignes jaunes, sur les lèvres du sillon : tirets courts (4+8), en quinconce (la droite décalée d'un demi-pas) */
  K.trait(function(sv){return xm-DEMI*ou(sv);},{l:function(sv){return dansSillon(sv)?.14:0;},c:J,op:.84,per:12,on:4});
  K.trait(function(sv){return xm+DEMI*ou(sv);},{l:function(sv){return dansSillon(sv)?.14:0;},c:J,op:.84,per:12,on:4,ph:6});
  /* les brøytestikker : un grand jalon orange tous les 32 m sur chaque rive (plus espacés sur les très longues pistes : 390 jalons au plus), décalés d'un côté à l'autre */
  const PJ=Math.max(32,Math.ceil(2*K.L/390));
  K.poteaux(g,{per:PJ,c:0xff5a0a,c2:0x1a1714,h:3.2});
  K.poteaux(d,{per:PJ,c:0xff5a0a,c2:0x1a1714,h:3.2,s0:8+PJ*.5});
}});
/* ===== JAPON — LE SHUTO (maquette du 2026-11-15, revue trois fois) =====
   Le vrai marquage : lignes de voie BLANCHES en tirets LONGS, 8 m peints pour 12 m de vide (autoroutes japonaises, de mémoire), 15-20 cm ;
   rives blanches pleines ; la ligne JAUNE-ORANGE pleine = interdiction de changer de voie (avant une jonction, dans les tunnels) ; et la
   marque du Shuto (Tokyo) : le « 減速レーンマーク » (dot line), deux rangées de pointillés blancs DANS la voie, le long de ses bords, posées
   avant les virages pour que la voie paraisse plus étroite (marquage hors code ; pas et longueurs des points estimés).
   Sens unique, on roule à GAUCHE : la voie rapide est à droite.
   LA SIGNATURE : les longs tirets 8/12 partout et, par épisodes qui reviennent en boucle sur toute la piste (un tous les EP_PAS mètres,
   le premier dans la fenêtre du banc, s ≈ 400-720 m), une séparation passée à l'ORANGE et les trois voies du milieu resserrées par leurs
   pointillés.
   Libertés prises : la vraie ligne orange est pleine sur des centaines de mètres ; ici elle est coupée en tronçons de 120 m séparés de
   40 m de vide (règle de la maison : pas de longue ligne pleine entre les voies) ; les pointillés sont plus petits, plus espacés et plus
   pâles que les vrais (grossis par la perspective, ils faisaient des pavés juste derrière la caisse).
   Revues : 1) les pointillés de part et d'autre des 8 séparations (24 lignes) : seulement les trois voies du milieu ; l'orange tout à
   gauche ne se voyait pas : rapprochée de la caisse. 2) l'orange était pleine sur 380 m et n'existait qu'à deux abscisses fixes :
   tronçons de 120 m, épisodes en boucle sur K.L ; pointillés allégés ; l'orange passée à la séparation gauche de la voie CENTRALE
   (tout à gauche, elle sortait du cadre dans la ville en dévers) et affinée (16 cm, 80 %) pour ne pas crier près de la caisse.
   3) (tour des maps) l'orange encore la ligne la plus vive de l'image au soir des nuages : 14 cm, 64 % ; vue à s ≈ 426 et à s ≈ 1700
   (l'épisode suivant), sur nuages, Jade, grotte, canyon, ville, espace, dunes. Rien au glacier (sa route de glace n'a pas de peinture). */
arpInscrit('jp',{nom:'Japon — Shuto',plan:function(K){
  const g=K.g,d=K.d,N=9,lw=(d-g)/N,B=0xf1efe8,OR=0xf29a18;
  /* un épisode tous les EP_PAS m (un multiple de 160 : chaque épisode commence par un tronçon orange), de EP0 à EP0+EP_LG dans chaque
     période (le premier dans la fenêtre photographiée) */
  const EP_PAS=1280,EP0=400,EP_LG=320;
  const dedans=function(s){const m=((s-EP0)%EP_PAS+EP_PAS)%EP_PAS;return m<=EP_LG&&s<K.L-40;};
  /* les rives */
  K.trait(g,{l:.22,c:B,op:.86});
  K.trait(d,{l:.22,c:B,op:.86});
  /* les séparations blanches en tirets 8/12 ; celle à gauche de la voie centrale passe à l'orange dans les épisodes */
  const IO=4;
  for(let i=1;i<N;i++){const x=g+i*lw;
    if(i!==IO){K.trait(x,{l:.17,c:B,op:.86,per:20,on:8});continue;}
    K.trait(x,{l:function(s){return dedans(s)?0:.17;},c:B,op:.86,per:20,on:8});
    /* l'orange : des tronçons de 120 m pour 40 m de vide, calés sur le début de l'épisode */
    K.trait(x,{l:function(s){return dedans(s)?.14:0;},c:OR,op:.64,per:160,on:120,ph:-EP0});}
  /* les pointillés : dans les trois voies du milieu, à 1,1 m de chaque bord, seulement dans les épisodes ; petits points pâles
     (18 × 30 cm, un tous les 3,6 m) */
  for(let v=3;v<6;v++){const x0=g+v*lw,x1=x0+lw;
    for(const x of [x0+1.1,x1-1.1])K.trait(x,{l:function(s){return dedans(s)?.18:0;},c:B,op:.5,per:3.6,on:.3});}
}});
/* ===== AFRIQUE DU SUD — LA FREEWAY (maquette du 2026-11-15, îlots revus le même jour) =====
   Le vrai marquage (SADC-RTSM vol. 4, ch. 12, mai 2012, le manuel que suit l'Afrique du Sud) : rive gauche RM4.1 JAUNE continue (100 mm),
   rive droite RM4.2 continue ; lignes de voie GM1 BLANCHES, module rural 12 m : 2 m peints, 10 m de vide (100 mm) ; îlots peints RM5 :
   barres JAUNES (bordure blanche ou jaune), barres à 30° du sens de marche, barre et vide dans le rapport 1 à 2.
   LA SIGNATURE : la route bordée de jaune des deux côtés, les tirets courts et espacés (2 m sur 12) et, aux bretelles, l'ÎLOT JAUNE
   hachuré en biais (au lieu des chevrons blancs américains), qui revient EN BOUCLE sur toute la piste (K.L).
   LES LIBERTÉS PRISES :
   · la rive droite est jaune elle aussi (la table de 2012 la dit blanche, mais les freeways sud-africaines la portent souvent jaune près du
     terre-plein) ; plots de rive ROUGES à gauche, JAUNES à droite (de mémoire, à la manière britannique) ;
   · l'îlot est COURT (150 m, la vraie route en peint de plus longs) et revient tous les 1 à 1,3 km (le premier à 440 m : dans la fenêtre de jeu) ;
   · ses bords ne sont peints que sur les BISEAUX (le nez et la queue, en V) : le flanc droit de l'îlot n'a que ses barres, pour ne jamais
     tirer deux longues lignes pleines côte à côte (Sacha a refusé les lignes continues) ;
   · un seul ruban par bord et un seul motif pour TOUS les îlots (la largeur s'annule hors des îlots), dans le budget.
   On roule à GAUCHE : la bretelle entre par la gauche, la voie rapide est à droite. */
arpInscrit('za',{nom:'Afrique du Sud — freeway',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,J=0xefbd36,N=10,lw=(d-g)/N,x1=g+3*lw,L=K.L;
  /* les deux rives jaunes et leurs plots */
  K.trait(g,{l:.22,c:J,op:.88});
  K.trait(d,{l:.22,c:J,op:.88});
  K.plot(g+.55,{per:24,c:0xd8402e,c2:0xd8402e,l:.3,long:.3});
  K.plot(d-.55,{per:24,c:J,c2:0xd8402e,l:.3,long:.3});
  /* LES ÎLOTS (RM5) : la troisième séparation s'ouvre en un îlot jaune hachuré, puis se referme ; 150 m : nez de NE m, plein, queue de QU m */
  const I0=440,IL=150,NE=55,QU=45,W=Math.min(1.9,lw*.4),P=Math.min(1300,Math.max(1000,(L-700)/3.6)); /* au plus 1,3 km entre deux îlots, même sur les longues pistes (canyon 14,5 km) */
  const pos=function(sv){if(sv<I0)return -1;const m=(sv-I0)%P;return (sv-m+IL>L-60)?-1:m;}; /* la position dans l'îlot (−1 : hors îlot) */
  const demi=function(sv){const m=pos(sv);if(m<0||m>IL)return 0;return W*Math.min(1,m/NE,(IL-m)/QU);};
  const biseau=function(sv){const m=pos(sv);return m>=0&&m<=IL&&(m<NE||m>IL-QU);};
  /* la séparation GM1 : coupée sur l'îlot */
  K.trait(x1,{l:function(sv){const m=pos(sv);return m>=0&&m<=IL?0:.17;},c:B,op:.86,per:12,on:2});
  /* les bords en biseau (le nez et la queue en V) */
  K.trait(function(sv){return x1-.1-demi(sv);},{l:function(sv){return biseau(sv)?.2:0;},c:J,op:.82+.12*K.nuit});
  K.trait(function(sv){return x1+.1+demi(sv);},{l:function(sv){return biseau(sv)?.2:0;},c:J,op:.82+.12*K.nuit});
  /* les barres à 30°, barre 1 / vide 2 */
  K.motif(function(sv){return x1-demi(sv)+.12;},function(sv){return x1+demi(sv)-.12;},{type:'hachure',pas:4.5,ep:1.5,pente:1.73,c:B,op:.5+.22*K.nuit}); /* plus franches la nuit : le moteur y assombrit la peinture de 40 %. (16/11) Rayures BLANCHES, bords jaunes : un îlot tout jaune rayé ressemblait à la plaque turbo (jaune à barres) */
  /* les autres séparations : GM1, 2 m peints sur 12 */
  for(let i=1;i<N;i++)if(i!==3)K.trait(g+i*lw,{l:.17,c:B,op:.86,per:12,on:2});
}});
/* ===== MALAISIE — LEBUHRAYA (maquette du 2026-11-15, reprise le même jour : barres adoucies, voie des motos retirée) =====
   Le vrai marquage (JKR, Arahan Teknik (Jalan) 2D/85 « Road Marking and Delineation » ; le texte n'a pas pu être lu en ligne : les cotes
   sont de mémoire ou estimées) : lignes de voie BLANCHES en tirets (environ 3 m peints, 9 m de vide, 15 cm) ; rives blanches continues ;
   on roule à GAUCHE. LE TRAIT DU PAYS : les BARRES JAUNES TRANSVERSALES (« garisan kuning melintang ») peintes en travers des voies
   avant un péage, un virage dangereux ou une aire, par groupes de plus en plus SERRÉS pour donner l'impression d'accélérer et faire
   lever le pied ; souvent suivies d'un « AWAS » (attention) ou d'un « PERLAHAN » (ralentir) au sol. (Le long de certaines routes, la
   Federal Highway, une voie étroite des motos borde la rive gauche : essayée, elle restait hors de l'image de jeu sur dix voies : retirée.)
   LA SIGNATURE : un épisode tous les 700 m (le premier devant la caisse, à 405 m) : trois petits groupes de barres jaunes qui se
   resserrent (13 m, 9 m, 7 m), puis « AWAS » peint dans les deux voies du milieu.
   Libertés prises : les barres ne couvrent que les QUATRE voies du milieu (là où roule la caisse ; d'un bord à l'autre elles faisaient
   grille d'arrivée), 38 cm, translucides (.5), d'un jaune CITRON pâle et un peu blanchi (l'or chaud des pièces et des plaques turbo est évité), quatre barres
   par groupe au plus, le pas le plus serré à 7 m (à 5,5 m elles se tassaient en grille au loin). */
arpInscrit('my',{nom:'Malaisie — lebuhraya',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,J=0xe2de8a,N=10,lw=(d-g)/N;
  /* les rives, blanches et continues */
  K.trait(g,{l:.2,c:B,op:.86});
  K.trait(d,{l:.2,c:B,op:.86});
  /* les séparations des voies : 3 m sur 12 (3 + 9) */
  K.voies(g,d,N,{l:.15,c:B,op:.86,per:12,on:3});
  /* LES BARRES JAUNES : un épisode tous les 700 m (quinze au plus : deux « AWAS » chacun, trente dessins) ; trois groupes de quatre
     barres au plus, un blanc de 10 m entre les groupes ; seulement sur les quatre voies du milieu, entre deux séparations */
  const EP=[];for(let s=405;s<K.L-300&&EP.length<15;s+=700)EP.push(s);
  const G=[[0,52],[62,98],[108,136]],pas=[13,9,7],
    dans=function(sv,k){for(const e of EP)if(sv>=e+G[k][0]&&sv<e+G[k][1])return true;return false;};
  const x0=g+3*lw+.35,x1=g+7*lw-.35;
  for(let k=0;k<3;k++)K.motif(x0,function(sv){return dans(sv,k)?x1:x0;},{type:'hachure',pas:pas[k],ep:.38,pente:0,c:J,op:.5});
  /* « AWAS » au bout des barres, dans les deux voies du milieu */
  K.texte('awas','AWAS',{taille:60});
  for(const e of EP){K.decal(e+150,g+lw*4.5,{d:'awas',l:1.9,long:12,c:B,op:.78});K.decal(e+150,g+lw*5.5,{d:'awas',l:1.9,long:12,c:B,op:.78});}
}});
/* ===== AUSTRALIE — LE FREEWAY (maquette du 2026-11-15, reprise le 2026-11-16 : « discrète mais peu visible ») =====
   Le vrai marquage (AS 1742.2, de mémoire pour les chiffres ; la recherche confirme les plots JAUNES à la rive droite depuis 2009 et la
   ligne de continuité large de 200 mm) : tout BLANC ; lignes de voie 3 m peints, 9 m de vide (au-dessus de 80 km/h), 100-150 mm ;
   rives pleines de 150-200 mm, souvent AUDIO-TACTILES (des nervures en relief posées sur le trait, qui grondent sous les pneus) ;
   plots réfléchissants (RRPM) blancs entre les voies, JAUNES à la rive droite (le terre-plein) ; et là où une voie naît, finit ou se
   sépare (bretelle, échangeur où le freeway se partage en deux directions), la LIGNE DE CONTINUITÉ : des tirets COURTS et GRAS,
   1 m peint, 3 m de vide, 200 mm.
   LA SIGNATURE : la ligne de continuité qui pointille court et gras à la place des longs tirets, des DEUX côtés de la voie de la caisse
   (une voie auxiliaire entre deux échangeurs), et un peu plus loin à gauche (la bretelle d'entrée) ; les rives nervurées (chaque nervure
   son ombre : elles ont l'air en relief) ; les plots JAUNES serrés contre la rive droite.
   On roule à GAUCHE : la voie lente est à gauche (la bretelle y entre), la rapide à droite, contre les plots jaunes.
   LES LIBERTÉS PRISES :
   · la ligne de continuité est plus grasse que la vraie (36 cm contre 15 pour les lignes de voie, le vrai rapport est 200/100-150 mm)
     et plus espacée : 1,2 m peint, 4,8 m de vide (20 %), au lieu de 1 m / 3 m (25 %) ; à 25 % et 4 m de pas, le créneau filtré la
     fondait au loin en une ligne presque continue ; avec 6 m de pas et 20 %, les trous tiennent deux fois plus loin, et elle reste
     plus pâle de loin qu'une ligne de voie (jamais une ligne pleine) ;
   · les épisodes reviennent EN BOUCLE sur K.L (des voies auxiliaires toutes les ~1,6 km, la bretelle toutes les ~2,1 km) ; la ligne de
     voie s'efface là où la ligne de continuité la remplace (une largeur qui dépend de s : zéro ruban, zéro sommet hors de l'épisode) ;
   · les plots jaunes de rive tous les 10 m (au lieu de 24) et plus gros, pour qu'on les voie depuis la caisse ;
   · les plots blancs sur une séparation sur trois seulement (le budget de sommets : une ligne de plots en coûte autant qu'un trait) ;
   · aucune ligne pleine entre les voies : seules les deux rives sont pleines (comme l'américaine). */
arpInscrit('au',{nom:'Australie — freeway',plan:function(K){
  const g=K.g,d=K.d,B=0xf2f0e8,JAU=0xf0c23a,N=10,lw=(d-g)/N;
  /* un épisode en boucle : vrai si s, ramené dans le pas P, tombe dans [a, b] */
  const dans=function(s,a,b,P){const m=((s%P)+P)%P;return m>=a&&m<=b;};
  /* les rives : pleines, et leurs nervures audio-tactiles (un pavé de 18 cm tous les 60 cm, débordant le trait, son ombre derrière) */
  for(const x of [g,d]){
    K.trait(x,{l:.2,c:B,op:.86});
    K.trait(x,{l:.5,c:B,op:.82,per:.6,on:.18,ombre:.14});}
  /* les plots JAUNES de la rive droite (le terre-plein), serrés et gros : rouges à contresens */
  K.plot(d-.7,{per:10,ph:5,c:JAU,c2:0xd8402e,l:.6,long:.6});
  /* LES ÉPISODES DE CONTINUITÉ : [début, fin, pas] dans la boucle ; i = 4 et 6 bordent la voie de la caisse (i = 5 au milieu),
     i = 1 = la bretelle d'entrée, décalée pour ne pas tomber toujours en même temps */
  /* (second regard, 2026-11-16 : à [300,1150] et [300,1250] la piste restait 47 % du temps sans signature, s = 1500 et 3000 = l'américaine
     sans cônes ; i = 4 et 6 décalés se relaient : au moins l'une des deux sur 1550 m de 1600, les deux ensemble sur [250,1300]) */
  const EPI={1:[1250,1750,2100],4:[0,1300,1600],6:[250,1550,1600]};
  for(let i=1;i<N;i++){const x=g+i*lw,e=EPI[i];
    if(e){
      K.trait(x,{l:function(s){return dans(s,e[0],e[1],e[2])?0:.15;},c:B,op:.84,per:12,on:3,ombre:1.2});
      K.trait(x,{l:function(s){return dans(s,e[0],e[1],e[2])?.36:0;},c:B,op:.92,per:6,on:1.2,ombre:.6});}
    else K.trait(x,{l:.15,c:B,op:.84,per:12,on:3,ombre:1.2});
    /* les plots blancs sur une séparation sur trois (2, 5, 8) : une ligne de plots coûte autant de sommets qu'un trait entier */
    if(i%3===2)K.plot(x,{per:24,ph:7.5,c:0xffffff,c2:0xd8402e,l:.28,long:.28});}
}});
