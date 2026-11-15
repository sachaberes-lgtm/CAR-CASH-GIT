/* ROYAUME-UNI — LE MOTORWAY (maquette du 2026-11-15)
   Le vrai marquage (Traffic Signs Manual, chapitre 5, de mémoire pour les chiffres) : lignes de voie diagramme 1005.1 (au-dessus de 40 mph),
   tirets COURTS de 2 m tous les 9 m (7 m de vide), 150 mm de large sur autoroute ; rives pleines 1012.1 (150-200 mm) ;
   les CAT'S EYES (plots réfléchissants, un vide sur deux = 18 m) : BLANCS entre les voies, ROUGES à la rive gauche (côté bande d'arrêt),
   AMBRE à la rive droite (le terre-plein central) ; VERTS là où une bretelle rejoint ; et par endroits les chevrons de distance
   (« keep apart 2 chevrons », un chevron pointé vers l'avant tous les 40 m au milieu de chaque voie).
   Sens unique, voie lente à GAUCHE (comme là-bas), la rapide contre le terre-plein, à droite. */
arPaysDef('uk',{nom:'Royaume-Uni — motorway',plan:function(K){
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
