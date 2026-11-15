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
   vajerräcke : quatre câbles d'acier tendus à ~0,75 m sur des poteaux galvanisés gris, au catadioptre blanc. Et le 2+1 ALTERNE : tous
   les quelques kilomètres, le côté à deux voies change, le câble passe de l'autre côté — une varningslinje l'annonce.
   LA SIGNATURE : la séparation à câble grise qui file à côté de la caisse (les poteaux ET leur câble), bordée de ses deux rives en
   pointillés de 1 m ; et sur les bords de la route, les mêmes pointillés courts au lieu d'une rive pleine.
   Libertés prises : la mötesfri sépare deux sens ; ici elle sépare deux groupes de voies d'une route à sens unique ; le câble est UN
   ruban plat suspendu au-dessus des poteaux (au lieu de quatre) ; les poteaux sont espacés de 4 m (au lieu de ~2,5-3) pour rester légers. */
arpInscrit('se',{nom:'Suède — mötesfri väg',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,GR=0xa9b1b9,N=10,lw=(d-g)/N;
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  /* les épisodes : [annonce (varningslinje), ouverture, fin, numéro de la séparation] ; le 2+1 alterne : le câble change de côté
     (le premier s'ouvre avant la caisse, figée vers 430 m, pour que les poteaux filent dès la vue de jeu) */
  const EP=[[240,300,1500,4],[2500,2560,3600,6],[4500,4560,5400,4]],OUV=45,DEMI=.8,TR=[];
  for(const z of EP)TR[z[3]]=1;
  /* les rives : kantlinje 1+2, 30 cm (celle d'une motorväg) */
  K.trait(g,{l:.28,c:B,op:.86,per:3,on:1});
  K.trait(d,{l:.28,c:B,op:.86,per:3,on:1});
  /* les séparations ordinaires : körfältslinje 3+9 */
  for(let i=1;i<N;i++){if(TR[i])continue;K.trait(g+i*lw,{l:.15,c:B,op:.86,per:12,on:3});}
  /* les séparations à câble : körfältslinje, varningslinje 9+3 à l'approche, puis deux kantlinjer 1+2 qui s'écartent autour du câble */
  for(let i=1;i<N;i++){if(!TR[i])continue;const xm=g+i*lw;let s=0;
    for(const z of EP){if(z[3]!==i)continue;
      const ou=function(sv){return Math.min(lisse((sv-z[1])/OUV),lisse((z[2]+OUV-sv)/OUV));};
      K.trait(xm,{l:.15,c:B,op:.86,per:12,on:3,s0:s,s1:z[0]});
      K.trait(xm,{l:.24,c:B,op:.88,per:12,on:9,s0:z[0],s1:z[1]+8});
      K.trait(function(sv){return xm-DEMI*ou(sv);},{l:.2,c:B,op:.86,per:3,on:1,s0:z[1]+8,s1:z[2]+OUV-6});
      K.trait(function(sv){return xm+DEMI*ou(sv);},{l:.2,c:B,op:.86,per:3,on:1,s0:z[1]+8,s1:z[2]+OUV-6});
      K.trait(xm,{l:.24,c:B,op:.88,per:12,on:9,s0:z[2]+OUV-6,s1:z[2]+OUV+60});
      /* la räffla : des barreaux sombres et fins dans la mittremsa (aucun fond continu) */
      K.fond(xm-.3,xm+.3,{c:K.NOIR,op:.1,per:1,on:.4,s0:z[1]+30,s1:z[2]});
      /* le vajerräcke : les poteaux, et le câble tendu au-dessus d'eux */
      K.poteaux(xm,{per:4,c:GR,c2:0xf2f2ea,h:.78,s0:z[1]+30,s1:z[2]});
      K.trait(xm,{l:.045,c:0x9aa3ab,op:.5,h:.7,s0:z[1]+30,s1:z[2]});
      s=z[2]+OUV+60;}
    K.trait(xm,{l:.15,c:B,op:.86,per:12,on:3,s0:s});}
}});
/* ===== SUISSE — L'AUTOBAHN (maquette du 2026-11-15) =====
   Le vrai marquage (SSV art. 72-79, norme VSS SN 640 850a ; chantiers : directives cantonales, ex. Lucerne 653 201) : tout BLANC ;
   Leitlinien de 6 m tous les 18 m (6 m peints, 12 m de vide), 15 cm, sans plots ni ombre (du bitume) ; rives pleines de 20 cm.
   Dans un chantier, les marquages provisoires sont GELB-ORANGE (lignes, boutons « Markierungsknöpfe » à catadioptres, balises
   « Leitkörper ») et priment sur le blanc, qui reste dessous, à demi effacé ; les voies restent ouvertes mais se RESSERRENT et glissent
   de côté (la Verschwenkung, la circulation sur voies étroites).
   LA SIGNATURE : sur 700 m, les fines lignes orange glissent en biais par-dessus le blanc fantôme : dix voies serrées dans quarante
   mètres, la rive provisoire en boutons orange et balises.
   Libertés : l'orange tire un peu vers le rouge (le gelb-orange suisse est plus jaune) pour ne pas se confondre avec l'or des pièces ;
   une ombre courte derrière les tirets orange, pour qu'ils se lisent sur un béton pâle. */
arpInscrit('ch',{nom:'Suisse — Autobahn',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,BL=0xf1efe8,OR=0xee8a2e;
  /* les chantiers : [début, fin, côté fermé (−1 : à gauche, 1 : à droite)] ; le biseau fait B m ; on rend deux voies de large */
  const B=150,W=2*lw,CH=[[395,1120,-1],[3300,3900,1]];
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  const zone=function(sv){for(const z of CH)if(sv>=z[0]&&sv<=z[1])return z;return null;};
  const f=function(z,sv){return Math.min(lisse((sv-z[0])/B),lisse((z[1]-sv)/B));};
  const gY=function(sv){const z=zone(sv);return z&&z[2]<0?g+W*f(z,sv):g;},dY=function(sv){const z=zone(sv);return z&&z[2]>0?d-W*f(z,sv):d;};
  const rive=function(sv){const z=zone(sv);return z&&z[2]>0?dY(sv):gY(sv);};
  /* dans le chantier, loin des bouts (pour les lignes orange) */
  const coeur=function(sv,m){const z=zone(sv);return !!z&&sv>z[0]+m&&sv<z[1]-m;};
  /* LE BLANC : rives pleines ; Leitlinien 6/12, à demi effacées dans un chantier */
  K.trait(g,{l:.2,c:BL,op:.84});
  K.trait(d,{l:.2,c:BL,op:.84});
  for(let i=1;i<N;i++){const x=g+i*lw;
    K.trait(x,{l:function(sv){return coeur(sv,20)?0:.15;},c:BL,op:.84,per:18,on:6});
    /* le fantôme seulement sur les voies ouvertes : rien sous la hachure ni derrière les balises */
    K.trait(x,{l:function(sv){return coeur(sv,20)&&x>gY(sv)+1&&x<dY(sv)-1?.13:0;},c:BL,op:.18,per:18,on:6});}
  /* L'ORANGE : les voies serrées (décalées d'un demi-pas : elles ne recouvrent pas les fantômes) */
  for(let i=1;i<N;i++)K.trait(function(sv){return gY(sv)+i*(dY(sv)-gY(sv))/N;},{l:function(sv){return coeur(sv,20)?.15:0;},c:OR,op:.66,per:18,on:6,ph:9,ombre:1});
  /* la rive provisoire : des boutons orange tous les 4 m (orange aussi à contresens) */
  K.plot(rive,{per:4,long:.45,l:.42,c:OR,c2:OR,s0:CH[0][0]+B*.25,s1:CH[0][1]-B*.25});
  K.plot(rive,{per:4,long:.45,l:.42,c:OR,c2:OR,s0:CH[1][0]+B*.25,s1:CH[1][1]-B*.25});
  /* la surface interdite (seulement dans les deux biseaux) et les balises */
  for(const z of CH){const s0=z[0],s1=z[1],cote=z[2];
    const x0=cote<0?g+.5:function(sv){return rive(sv)+.5;},x1=cote<0?function(sv){return rive(sv)-.5;}:d-.5;
    K.motif(x0,x1,{type:'hachure',pas:6,ep:.45,pente:cote<0?.9:-.9,c:OR,op:.55,s0:s0+B*.4,s1:s0+B*1.1});
    K.motif(x0,x1,{type:'hachure',pas:6,ep:.45,pente:cote<0?-.9:.9,c:OR,op:.55,s0:s1-B*1.1,s1:s1-B*.4});
    K.poteaux(function(sv){return rive(sv)+cote*.8;},{per:12,c:0xe8641c,c2:0xf2f2ea,h:1.05,s0:s0+B*.5,s1:s1-B*.5});}
}});
/* ===== CORÉE DU SUD — LE GYEONGBU (maquette du 2026-11-15) =====
   Le vrai marquage : lignes de voie BLANCHES en tirets de 10 m pour 10 m de vide (autoroutes coréennes), 15-20 cm ; rive droite blanche
   pleine ; rive gauche (côté terre-plein) JAUNE pleine ; la voie de gauche du Gyeongbu est la voie de BUS (버스전용차로), séparée par une
   ligne BLEUE et marquée « 버스전용 » au sol ; et la marque coréenne : les LIGNES DE GUIDAGE COLORÉES (노면색깔유도선, loi : règlement
   d'application du code de la route, annexe 6 ; manuel du ministère, 2017) : une ligne ROSE et une ligne VERTE (vert clair) peintes AU
   MILIEU des voies avant un échangeur ou une bifurcation, qui s'écartent chacune vers sa branche. Couleurs vérifiées (law.go.kr, presse) ;
   largeur des lignes de guidage et motif de la ligne bleue de mémoire (≈ 45 cm ; bleu en tirets au rythme des voies).
   LA SIGNATURE : par épisodes, deux lignes rose et verte côte à côte au milieu des voies, qui se séparent en Y ; en permanence, les longs
   tirets 10/10 et le liseré bleu de la voie de bus. */
arpInscrit('kr',{nom:'Corée du Sud — Gyeongbu',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,B=0xf1efe8,J=0xeec23c,BLEU=0x3f86e8,ROSE=0xe4639c,VERT=0x6cc184;
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  /* les rives : jaune à gauche (terre-plein), blanche à droite */
  K.trait(g,{l:.22,c:J,op:.86});
  K.trait(d,{l:.22,c:B,op:.86});
  /* les séparations : la première (la voie de bus) en bleu, les autres en blanc ; 10 m peints, 10 m de vide ; un plot au milieu du vide */
  for(let i=1;i<N;i++){const x=g+i*lw;
    K.trait(x,{l:i===1?.22:.18,c:i===1?BLEU:B,op:.86,per:20,on:10,ombre:i===1?0:1.2});
    K.plot(x,{per:20,ph:15,c:0xf4f2ea,c2:0xf4f2ea});}
  /* la voie de bus : « 버스전용 », un tous les ~650 m */
  K.texte('bus','버스전용',{police:'sans-serif',gras:true,taille:52});
  for(let s=500;s<K.L-200;s+=650)K.decal(s,g+lw*.5,{d:'bus',l:1.7,long:7.5,c:0xeef0f4,op:.8});
  /* LES LIGNES DE GUIDAGE : un épisode = [début, point où elles s'écartent, fin, voie de départ du vert, sens] ;
     le vert et le rose partent côte à côte (deux voies voisines), puis chacun glisse de deux voies vers sa branche */
  const EP=[[380,450,730,4,1],[2380,2450,2730,5,-1],[4300,4370,4650,3,1]];
  const guide=function(rose){return {x:function(s){for(const e of EP)if(s>=e[0]-1&&s<=e[2]+1){
        const v=e[3]+(rose?(e[4]>0?1:0):(e[4]>0?0:1)),x0=g+(v+.5)*lw,sens=(rose?1:-1)*e[4];
        return x0+sens*2*lw*lisse((s-e[1])/150);}return 0;},
      l:function(s){for(const e of EP)if(s>=e[0]&&s<=e[2])return .25*Math.min(lisse((s-e[0])/10),lisse((e[2]-s)/24));return 0;}};};
  const gr=guide(true),gv=guide(false);
  K.trait(gr.x,{l:gr.l,c:ROSE,op:.5});
  K.trait(gv.x,{l:gv.l,c:VERT,op:.48});
}});
/* ROYAUME-UNI — LE MOTORWAY (maquette du 2026-11-15)
   Le vrai marquage (Traffic Signs Manual, chapitre 5, de mémoire pour les chiffres) : lignes de voie diagramme 1005.1 (au-dessus de 40 mph),
   tirets COURTS de 2 m tous les 9 m (7 m de vide), 150 mm de large sur autoroute ; rives pleines 1012.1 (150-200 mm) ;
   les CAT'S EYES (plots réfléchissants, un vide sur deux = 18 m) : BLANCS entre les voies, ROUGES à la rive gauche (côté bande d'arrêt),
   AMBRE à la rive droite (le terre-plein central) ; VERTS là où une bretelle rejoint ; et par endroits les chevrons de distance
   (« keep apart 2 chevrons », un chevron pointé vers l'avant tous les 40 m au milieu de chaque voie).
   Sens unique, voie lente à GAUCHE (comme là-bas), la rapide contre le terre-plein, à droite. */
arpInscrit('uk',{nom:'Royaume-Uni — motorway',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N;
  const ROUGE=0xd8402e,AMBRE=0xf0a020,VERT=0x3fd27a;
  /* la rive gauche : pleine, blanc cassé, ses cat's eyes ROUGES (un tous les 18 m, juste à l'intérieur) ;
     LES BRETELLES : là où une bretelle rejoint, la rive gauche se fait « 1010 » (traits larges de 1 m tous les 2 m) et ses plots VERTS */
  const BRET=[[540,700],[3900,4060]];
  let s9=0;
  for(const br of BRET){
    K.trait(g,{l:.2,op:.86,s0:s9,s1:br[0]});
    K.plot(g+.42,{per:18,ph:14.5,c:ROUGE,l:.4,long:.4,s0:s9,s1:br[0]});
    K.trait(g,{l:.28,op:.86,per:2,on:1,s0:br[0],s1:br[1]});
    K.plot(g+.48,{per:9,ph:5,c:VERT,l:.4,long:.4,s0:br[0],s1:br[1]});
    s9=br[1];}
  K.trait(g,{l:.2,op:.86,s0:s9});
  K.plot(g+.42,{per:18,ph:14.5,c:ROUGE,l:.4,long:.4,s0:s9});
  /* la rive droite (le terre-plein) : pleine, ses cat's eyes AMBRE */
  K.trait(d,{l:.2,op:.86});
  K.plot(d-.42,{per:18,ph:14.5,c:AMBRE,l:.4,long:.4});
  /* les voies : tirets courts de 2 m sur 9 m, et un plot blanc au milieu d'un vide sur deux */
  K.voies(g,d,N,{l:.15,per:9,on:2,op:.84,plots:{per:18,ph:14.5,c:0xffffff,l:.32,long:.32}});
  /* LES CHEVRONS DE DISTANCE : un V pointé vers l'avant au milieu de chaque voie, tous les 40 m, par épisodes.
     (second regard, 2026-11-15) en MOTIFS et plus en dessins : les dessins collés point par point disparaissaient sous le béton de la grotte
     et de Jade (seule la rangée sous la caisse restait) ; un motif suit la route comme les traits. Hors des épisodes la bande se ferme (largeur nulle).
     Pâle (.55 : à .45 il s'effaçait sur le béton violet des nuages) et ouvert : un marquage, pas un signal ; épais de 55 cm le long de la route (35 cm en travers du trait), sinon le filtre
     anti-scintillement l'efface dès 30 m en vue de jeu (testé : un trait de 25 cm ne se voyait que sous la caisse). */
  /* (second regard, 2e passe) les épisodes finissent entre deux chevrons (rien de rogné), le troisième, au-delà de la piste, est retiré ;
     un mètre d'air de chaque côté du V : à .7 m, vus de haut, les V voisins se touchaient en une seule ligne en zigzag. */
  const episodes=[[390,710],[3290,3615]];
  const dedans=function(s){for(const ep of episodes)if(s>=ep[0]&&s<=ep[1])return true;return false;};
  for(let i=0;i<N;i++){const xa=g+i*lw+1,xb=g+(i+1)*lw-1;
    K.motif(function(s){return dedans(s)?xa:(xa+xb)*.5;},function(s){return dedans(s)?xb:(xa+xb)*.5;},
      {type:'chevron',pas:40,ep:.55,pente:-1.2,op:.55,s0:episodes[0][0]-5,s1:Math.min(K.L-40,episodes[episodes.length-1][1]+5)});}
}});
/* ===== FRANCE — L'AUTOROUTE (maquette du 2026-11-15) =====
   Le vrai marquage (IISR, 7e partie ; u = 7,5 cm sur autoroute) : tout BLANC ; séparation des voies T1 (3 m peints, 10 m de vide) ;
   rive droite T4 (39 m peints, 13 m de vide : deux traits et un vide ≈ 91 m, « un trait danger, deux traits sécurité ») ; rive gauche
   continue ; zones de rappel des distances : des chevrons blancs, pointe vers l'avant (« deux chevrons sécurité ») ; sortie : ligne
   d'affectation T3 (3 m / 1,33 m), plus grasse, puis un îlot de zébras.
   LA SIGNATURE : la longue rive hachée à droite et, sur un kilomètre, les chevrons qui filent devant la caisse.
   Liberté prise : les chevrons sont peints dans les trois voies du milieu (là où roule la caisse), pas seulement dans celle de droite. */
arpInscrit('fr',{nom:'France — autoroute',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,N=10,lw=(d-g)/N,xs=d-lw; /* xs : la séparation de la voie de droite */
  /* les rives : à gauche continue, à droite la T4 */
  K.trait(g,{l:.22,c:B,op:.86});
  K.trait(d,{l:.24,c:B,op:.88,per:52,on:39,ph:6});
  /* la sortie : la dernière séparation passe en T3, puis un îlot de zébras s'ouvre entre la voie qui part et la route */
  const S0=2300,S1=2850,S2=3030;
  for(let i=1;i<N;i++){const x=g+i*lw;
    if(i<N-1){K.trait(x,{l:.17,c:B,op:.86,per:13,on:3});continue;}
    K.trait(x,{l:.17,c:B,op:.86,per:13,on:3,s1:S0});
    K.trait(x,{l:.24,c:B,op:.88,per:4.33,on:3,s0:S0,s1:S1});
    K.trait(x,{l:.17,c:B,op:.86,per:13,on:3,s0:S2});}
  const ouv=function(sv){const t=Math.max(0,Math.min(1,(sv-S1)/110));return t*t*(3-2*t)*2.8;};
  K.trait(xs-.1,{l:.22,c:B,op:.88,s0:S1,s1:S2});
  K.trait(function(sv){return xs+.1+ouv(sv);},{l:.22,c:B,op:.88,s0:S1,s1:S2});
  K.motif(xs+.25,function(sv){return xs+ouv(sv)-.05;},{type:'hachure',pas:4,ep:.7,pente:.8,c:B,op:.78,s0:S1+12,s1:S2});
  /* les chevrons de rappel des distances : un kilomètre, trois voies, un tous les 36 m (à 130 km/h, deux chevrons ≈ 2 s) */
  for(let i=4;i<7;i++){const x0=g+i*lw;
    K.motif(x0+.65,x0+lw-.65,{type:'chevron',pas:36,ep:.8,pente:-2.2,c:B,op:.65,s0:380,s1:1300});}
}});
/* ===== NORVÈGE — LA MOTORVEG (maquette du 2026-11-15) =====
   Le vrai marquage (Statens vegvesen, håndbok N302 Vegoppmerking ; Lærebok vegoppmerking, rapport 452 — vérifiés : sur motorveg la
   kantlinje de GAUCHE est JAUNE, celle de droite BLANCHE ; le jaune dit « l'autre sens est de ce côté » ; la forsterket midtoppmerking
   (FMO) = deux lignes jaunes posées dans un sillon fraisé en sinus (nedfrest sinusrille) de 0,5 à 1 m, qui fait vibrer la voiture ; dans
   le sillon de 1 m, la paire peut être une varsellinje). Les pas, vérifiés (catalogue NVDB, au-dessus de 50 km/h) : kjørefeltlinje 3 m peints,
   9 m de vide ; varsellinje 9 m peints, 3 m de vide. Largeurs de mémoire : 15 cm pour les traits, 20 cm pour la kantlinje. Le long des routes, l'hiver : les brøytestikker, les jalons de
   déneigement orange plantés tous les ~50 m sur les deux bords.
   LA SIGNATURE : le sillon sombre et ses deux lignes JAUNES hachées qui filent à gauche de la caisse, et, sur les rives, la file clairsemée
   des jalons orange.
   Libertés prises : la FMO sépare deux sens ; ici elle sépare deux moitiés d'une route à sens unique ; ses lignes sont des varsellinjer
   (9+3) et non une double ligne pleine ; les jalons mesurent 2 m (au lieu de 2-3). */
arpInscrit('no',{nom:'Norvège — motorveg',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,J=0xeec247,N=10,lw=(d-g)/N,xm=g+4*lw; /* xm : la séparation à gauche de la caisse, où se creuse le sillon */
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  /* les épisodes de FMO : [annonce, ouverture, fermeture] */
  const EP=[[300,380,1000],[2700,2780,3500],[4700,4780,5400]],OUV=60,DEMI=.33;
  const ou=function(sv){let f=0;for(const z of EP)f=Math.max(f,Math.min(lisse((sv-z[1])/OUV),lisse((z[2]+OUV-sv)/OUV)));return f;};
  /* les rives : jaune à gauche, blanche à droite */
  K.trait(g,{l:.2,c:J,op:.86});
  K.trait(d,{l:.2,c:B,op:.86});
  /* les séparations : kjørefeltlinje 3+9 */
  for(let i=1;i<N;i++){if(i===4)continue;K.trait(g+i*lw,{l:.15,c:B,op:.86,per:12,on:3});}
  /* la séparation xm : kjørefeltlinje, varsellinje blanche à l'approche, puis le sillon et ses deux varsellinjer jaunes */
  let s=0;
  for(const z of EP){K.trait(xm,{l:.15,c:B,op:.86,per:12,on:3,s0:s,s1:z[0]});
    K.trait(xm,{l:.18,c:B,op:.88,per:12,on:9,s0:z[0],s1:z[1]+6});
    K.trait(function(sv){return xm-DEMI*ou(sv);},{l:.15,c:J,op:.76,per:12,on:9,s0:z[1]+6,s1:z[2]+OUV-4});
    K.trait(function(sv){return xm+DEMI*ou(sv);},{l:.15,c:J,op:.76,per:12,on:9,s0:z[1]+6,s1:z[2]+OUV-4});
    /* le sillon fraisé : une bande sombre hachée de ses ondes (la sinusrille), en barreaux lents de 1,2 m */
    K.fond(function(sv){return xm-(DEMI+.1)*ou(sv);},function(sv){return xm+(DEMI+.1)*ou(sv);},{c:K.NOIR,op:.2,per:1.2,on:.75,s0:z[1]+10,s1:z[2]+OUV-8});
    s=z[2]+OUV+60;
    K.trait(xm,{l:.18,c:B,op:.88,per:12,on:9,s0:z[2]+OUV-4,s1:s});}
  K.trait(xm,{l:.15,c:B,op:.86,per:12,on:3,s0:s});
  /* les brøytestikker : un jalon orange tous les 50 m sur chaque rive, décalés d'un côté à l'autre */
  K.poteaux(g,{per:50,c:0xe8641e,c2:0xf2f2ea,h:2});
  K.poteaux(d,{per:50,c:0xe8641e,c2:0xf2f2ea,h:2,s0:33});
}});
/* ===== JAPON — LE SHUTO (maquette du 2026-11-15, revue le même jour) =====
   Le vrai marquage : lignes de voie BLANCHES en tirets LONGS, 8 m peints pour 12 m de vide (autoroutes japonaises, de mémoire), 15-20 cm ;
   rives blanches pleines ; la ligne JAUNE-ORANGE pleine = interdiction de changer de voie (avant une jonction, dans les tunnels) ; et la
   marque du Shuto (Tokyo) : le « 減速レーンマーク » (dot line), deux rangées de pointillés blancs DANS la voie, le long de ses bords, posées
   avant les virages pour que la voie paraisse plus étroite (marquage hors code ; pas et longueurs des points estimés).
   Sens unique, on roule à GAUCHE : la voie rapide est à droite.
   LA SIGNATURE : les longs tirets 8/12 et, par épisodes, les trois voies du milieu resserrées par leurs pointillés, à côté d'un tronçon
   de ligne orange pleine.
   Revue : les pointillés étaient de part et d'autre des 8 séparations (24 lignes, trop chargé) : seulement les trois voies du milieu ;
   la ligne orange, tout à gauche, ne se voyait jamais : rapprochée de la caisse, bornée à 380-760 m, plus large. */
arpInscrit('jp',{nom:'Japon — Shuto',plan:function(K){
  const g=K.g,d=K.d,N=9,lw=(d-g)/N,B=0xf1efe8,OR=0xf29a18;
  /* les épisodes du 減速レーンマーク (le premier dans la fenêtre du banc), puis ailleurs sur la piste */
  const EP=[[380,760],[2150,2500],[4200,4560]];
  const dedans=function(s){for(let k=0;k<EP.length;k++)if(s>=EP[k][0]&&s<=EP[k][1])return true;return false;};
  /* les rives */
  K.trait(g,{l:.22,c:B,op:.86});
  K.trait(d,{l:.22,c:B,op:.86});
  /* la ligne orange : la séparation à gauche des voies du milieu, sur deux tronçons */
  const IO=3,OR1=[[380,760],[3300,3650]];
  for(let i=1;i<N;i++){const x=g+i*lw;
    if(i!==IO){K.trait(x,{l:.17,c:B,op:.86,per:20,on:8});continue;}
    K.trait(x,{l:.17,c:B,op:.86,per:20,on:8,s1:OR1[0][0]});
    K.trait(x,{l:.17,c:B,op:.86,per:20,on:8,s0:OR1[0][1],s1:OR1[1][0]});
    K.trait(x,{l:.17,c:B,op:.86,per:20,on:8,s0:OR1[1][1]});
    for(let k=0;k<OR1.length;k++)K.trait(x,{l:.24,c:OR,op:.9,s0:OR1[k][0],s1:OR1[k][1]});}
  /* les pointillés : dans les trois voies du milieu, à 1 m de chaque bord, seulement dans les épisodes ; de vrais points (30 × 60 cm,
     un tous les 2,4 m), pas des tirets qui doubleraient la ligne de voie */
  for(let v=3;v<6;v++){const x0=g+v*lw,x1=x0+lw;
    for(const x of [x0+1,x1-1])K.trait(x,{l:function(s){return dedans(s)?.3:0;},c:B,op:.7,per:2.4,on:.6});}
}});
/* ===== AFRIQUE DU SUD — LA FREEWAY (maquette du 2026-11-15) =====
   Le vrai marquage (SADC-RTSM vol. 4, ch. 12, mai 2012, le manuel que suit l'Afrique du Sud) : rive gauche RM4.1 JAUNE continue (100 mm),
   rive droite RM4.2 continue ; lignes de voie GM1 BLANCHES, module rural 12 m : 2 m peints, 10 m de vide (100 mm) ; îlots peints RM5 :
   barres JAUNES (bordure blanche ou jaune), barres à 30° du sens de marche, barre et vide dans le rapport 1 à 2.
   Liberté prise : la rive droite est jaune elle aussi (la table de 2012 la dit blanche, mais les freeways sud-africaines la portent souvent
   jaune près du terre-plein) ; plots de rive ROUGES à gauche, JAUNES à droite (de mémoire, à la manière britannique).
   LA SIGNATURE : la route bordée de jaune des deux côtés, les tirets courts et espacés (2 m sur 12) et, à l'entrée de bretelle, l'ÎLOT JAUNE
   hachuré en biais (au lieu des chevrons blancs américains).
   On roule à GAUCHE : la bretelle entre par la gauche, la voie rapide est à droite. */
arpInscrit('za',{nom:'Afrique du Sud — freeway',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,J=0xefbd36,N=10,lw=(d-g)/N,x1=g+3*lw;
  /* les deux rives jaunes et leurs plots */
  K.trait(g,{l:.22,c:J,op:.88});
  K.trait(d,{l:.22,c:J,op:.88});
  K.plot(g+.55,{per:24,c:0xd8402e,c2:0xd8402e,l:.3,long:.3});
  K.plot(d-.55,{per:24,c:J,c2:0xd8402e,l:.3,long:.3});
  /* LES ÎLOTS D'ENTRÉE (une bretelle de trois voies rejoint par la gauche) : la troisième séparation s'ouvre en un îlot jaune hachuré (RM5), puis se referme */
  const ILOTS=[[380,680],[3300,3600]];
  const demi=function(sv){for(const e of ILOTS){if(sv<e[0]||sv>e[1])continue;
      const a=Math.min(1,(sv-e[0])/100),b=Math.min(1,(e[1]-sv)/140),t=Math.min(a,b);return t*t*(3-2*t)*2.3;}return 0;};
  let s9=0;
  for(const e of ILOTS){K.trait(x1,{l:.17,c:B,op:.86,per:12,on:2,s0:s9,s1:e[0]});s9=e[1];
    K.trait(function(sv){return x1-.1-demi(sv);},{l:.2,c:J,op:.82,s0:e[0],s1:e[1]});
    K.trait(function(sv){return x1+.1+demi(sv);},{l:.2,c:J,op:.82,s0:e[0],s1:e[1]});
    K.motif(function(sv){return x1-demi(sv)+.12;},function(sv){return x1+demi(sv)-.12;},{type:'hachure',pas:6,ep:.9,pente:1.73,c:J,op:.56,s0:e[0]+20,s1:e[1]-25});}
  K.trait(x1,{l:.17,c:B,op:.86,per:12,on:2,s0:s9});
  /* les autres séparations : GM1, 2 m peints sur 12 */
  for(let i=1;i<N;i++)if(i!==3)K.trait(g+i*lw,{l:.17,c:B,op:.86,per:12,on:2});
}});
/* ===== MALAISIE — LEBUHRAYA (maquette du 2026-11-15) =====
   Le vrai marquage (JKR, Arahan Teknik (Jalan) 2D/85 « Road Marking and Delineation » ; le texte n'a pas pu être lu en ligne : les cotes
   sont de mémoire ou estimées) : lignes de voie BLANCHES en tirets (environ 3 m peints, 9 m de vide, 15 cm) ; rives blanches continues ;
   on roule à GAUCHE. LE TRAIT DU PAYS : les BARRES JAUNES TRANSVERSALES (« garisan kuning melintang ») peintes en travers de toutes les
   voies avant un péage, un virage dangereux ou une aire, par groupes de plus en plus SERRÉS pour donner l'impression d'accélérer et faire
   lever le pied ; souvent suivies d'un « AWAS » (attention) ou d'un « PERLAHAN » (ralentir) au sol. Et, le long de la rive gauche de
   certaines routes (la Lebuhraya Persekutuan, la Federal Highway), la VOIE DES MOTOS : étroite, séparée par un trait blanc, « MOTOSIKAL »
   peint dedans.
   LA SIGNATURE : un groupe de barres jaunes qui se resserrent devant la caisse, et la voie étroite des motos à gauche.
   Libertés prises : la voie des motos est bordée d'un trait en tirets longs (et non continu), avec des plots ambre, et seule la moto peinte (sans le mot « MOTOSIKAL ») ; les barres jaunes
   (40 cm) épargnent la voie des motos, s'arrêtent à la rive droite et restent translucides (un sol de jeu : rien qui ressemble à une
   plaque à ramasser) ; trois épisodes sur la piste (vers 405, 2450 et 4300 m). */
arpInscrit('my',{nom:'Malaisie — lebuhraya',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,J=0xf0bb2e,MOTO=3.6*K.kH,xm=g+MOTO,N=10,lw=(d-xm)/N;
  /* les rives, blanches et continues */
  K.trait(g,{l:.2,c:B,op:.86});
  K.trait(d,{l:.2,c:B,op:.86});
  /* la voie des motos : un trait gras en tirets longs (8 m sur 10), plots ambre */
  K.trait(xm,{l:.26,c:B,op:.88,per:10,on:8});
  K.plot(xm,{per:20,ph:9,c:0xffb21e,c2:0xd8261e});
  /* les séparations des voies : 3 m sur 12 (3 + 9) */
  K.voies(xm,d,N,{l:.15,c:B,op:.86,per:12,on:3});
  /* dans la voie des motos, un tous les ~650 m : la moto peinte (de profil, couchée le long de la voie, roue avant vers l'avant)
     (le mot « MOTOSIKAL », trop fin à 9 lettres dans 3,6 m, est retiré : il faisait code-barres) */
  K.dessin('moto',function(c,W,H){c.lineWidth=20;c.lineCap='round';c.lineJoin='round';
    c.beginPath();c.arc(W*.5,H*.8,54,0,7);c.stroke();c.beginPath();c.arc(W*.5,H*.22,54,0,7);c.stroke();
    c.beginPath();c.moveTo(W*.5,H*.8);c.lineTo(W*.62,H*.6);c.lineTo(W*.62,H*.4);c.lineTo(W*.5,H*.22);c.stroke();
    c.beginPath();c.moveTo(W*.62,H*.52);c.lineTo(W*.78,H*.55);c.moveTo(W*.62,H*.36);c.lineTo(W*.8,H*.3);c.stroke();});
  for(let s=470;s<K.L-200;s+=650){K.decal(s,g+MOTO*.5,{d:'moto',l:1.3,long:7,c:B,op:.8});}
  /* LES BARRES JAUNES : des épisodes ; dans chacun trois groupes, le pas se resserre (14 m, puis 9 m, puis 5,5 m) ;
     second regard : 40 cm à .5 (à 60 cm et .72 elles faisaient grille d'arrivée et se confondaient avec les plaques turbo) */
  const EP=[405,2450,4300].filter(function(s){return s<K.L-400;}),
    G=[[0,84],[84,147],[147,191]],dans=function(sv,k){for(const e of EP)if(sv>=e+G[k][0]&&sv<e+G[k][1])return true;return false;};
  const x0=xm+.45,pas=[14,9,5.5];
  for(let k=0;k<3;k++)K.motif(x0,function(sv){return dans(sv,k)?d-.45:x0;},{type:'hachure',pas:pas[k],ep:.4,pente:0,c:J,op:.5});
  /* « AWAS » au bout des barres, dans les deux voies devant la caisse */
  K.texte('awas','AWAS',{taille:60});
  for(const e of EP){K.decal(e+204,xm+lw*4.5,{d:'awas',l:1.9,long:12,c:B,op:.82});K.decal(e+204,xm+lw*5.5,{d:'awas',l:1.9,long:12,c:B,op:.82});}
}});
/* ===== AUSTRALIE — LE FREEWAY (maquette du 2026-11-15) =====
   Le vrai marquage (AS 1742.2, de mémoire pour les chiffres ; la recherche confirme les plots JAUNES à la rive droite depuis 2009 et la
   ligne de continuité large de 200 mm) : tout BLANC ; lignes de voie 3 m peints, 9 m de vide (au-dessus de 80 km/h), 100-150 mm ;
   rives pleines de 150-200 mm, souvent AUDIO-TACTILES (des nervures en relief posées sur le trait, qui grondent sous les pneus) ;
   plots réfléchissants (RRPM) blancs entre les voies, JAUNES à la rive droite (le terre-plein) ; et là où une voie naît, finit ou se
   sépare (bretelle, échangeur où le freeway se partage en deux directions), la LIGNE DE CONTINUITÉ : des tirets COURTS et GRAS,
   1 m peint, 3 m de vide, 200 mm.
   LA SIGNATURE : la ligne de continuité qui pointille vite et gras à côté des longs tirets (un échangeur : la séparation des deux directions,
   près de la caisse, et la bretelle d'entrée à gauche), et les rives nervurées (chaque nervure son ombre : elles ont l'air en relief).
   On roule à GAUCHE : la voie lente est à gauche (la bretelle y entre), la rapide à droite, contre les plots jaunes. */
arpInscrit('au',{nom:'Australie — freeway',plan:function(K){
  const g=K.g,d=K.d,B=0xf2f0e8,JAU=0xf0c23a,N=10,lw=(d-g)/N;
  /* les rives : pleines, et leurs nervures audio-tactiles (un pavé de 18 cm tous les 60 cm, débordant le trait, son ombre derrière) */
  for(const x of [g,d]){
    K.trait(x,{l:.2,c:B,op:.86});
    K.trait(x,{l:.5,c:B,op:.82,per:.6,on:.18,ombre:.14});}
  K.plot(d-.55,{per:24,ph:18,c:JAU,c2:0xd8402e,l:.32,long:.32});
  /* LES ÉPISODES DE CONTINUITÉ (1 m / 3 m, 200 mm : le double des lignes de voie, ici 27 cm contre 16) : l'échangeur (la séparation des deux directions, i = 6, juste à droite du milieu) et la bretelle d'entrée (i = 1) */
  /* second regard : la voie de la caisse (entre i = 4 et i = 6, la caisse roule sur i = 5) est une voie auxiliaire, bordée des deux côtés
     par la ligne de continuité ; plus grasse (32 cm contre 15) pour qu'on la voie en vue de jeu */
  const EPI={1:[[380,900],[3300,3800]],4:[[380,1100],[4200,4800]],6:[[380,1250],[4200,4900]]};
  const voie=function(x,eps){let s9=0;
    for(const e of eps){
      K.trait(x,{l:.15,c:B,op:.84,per:12,on:3,ombre:1.2,s0:s9,s1:e[0]});
      K.trait(x,{l:.32,c:B,op:.88,per:4,on:1,ombre:.45,s0:e[0],s1:e[1]});
      s9=e[1];}
    K.trait(x,{l:.15,c:B,op:.84,per:12,on:3,ombre:1.2,s0:s9});};
  for(let i=1;i<N;i++){const x=g+i*lw;
    voie(x,EPI[i]||[]);
    K.plot(x,{per:24,ph:7.5,c:0xffffff,c2:0xd8402e,l:.28,long:.28});}
}});
