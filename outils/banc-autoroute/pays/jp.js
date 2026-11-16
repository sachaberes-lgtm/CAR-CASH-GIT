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
arPaysDef('jp',{nom:'Japon — Shuto',plan:function(K){
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
