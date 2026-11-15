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
arPaysDef('jp',{nom:'Japon — Shuto',plan:function(K){
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
