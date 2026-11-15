/* ===== FRANCE — L'AUTOROUTE (maquette du 2026-11-15) =====
   Le vrai marquage (IISR, 7e partie ; u = 7,5 cm sur autoroute) : tout BLANC ; séparation des voies T1 (3 m peints, 10 m de vide) ;
   rive droite T4 (39 m peints, 13 m de vide : deux traits et un vide ≈ 91 m, « un trait danger, deux traits sécurité ») ; rive gauche
   continue ; zones de rappel des distances : des chevrons blancs, pointe vers l'avant (« deux chevrons sécurité ») ; sortie : ligne
   d'affectation T3 (3 m / 1,33 m), plus grasse, puis un îlot de zébras.
   LA SIGNATURE : la longue rive hachée à droite et, sur un kilomètre, les chevrons qui filent devant la caisse.
   Liberté prise : les chevrons sont peints dans les trois voies du milieu (là où roule la caisse), pas seulement dans celle de droite. */
arPaysDef('fr',{nom:'France — autoroute',plan:function(K){
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
