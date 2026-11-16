/* ===== ESPAGNE — L'AUTOVÍA (2026-11-15, maquette : « discret mais visible, le même niveau de rendu ») =====
   Le vrai marquage (Norma 8.2-IC) : tout est BLANC ; séparation de voies M-1.1 (V > 100 km/h) : trazo 5 m, vano 12 m, 15 cm ;
   rives M-2.6 continues, « con resaltos » (des bossettes qui grondent sous la roue) ; et la signature des autovías : les GALONES,
   des chevrons blancs dans les voies, pointe vers l'avant, pour « garder la distance de sécurité » (en voir deux devant soi).
   Ici : voies de 5 m (la route fait 56 m), traits mis à l'échelle (15 cm → 20 cm), galones en épisodes de quelques centaines de mètres. */
arPaysDef('es',{nom:'Espagne — l\'autovía',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,N=10,lw=(d-g)/N;
  /* les rives continues, et leurs resaltos : des bossettes courtes juste à l'extérieur */
  K.trait(g,{l:.26,c:B,op:.88});
  K.trait(d,{l:.26,c:B,op:.88});
  K.trait(g-.3,{l:.22,c:B,op:.62,per:1.2,on:.3});
  K.trait(d+.3,{l:.22,c:B,op:.62,per:1.2,on:.3});
  /* M-1.1 : 5 m peints, 12 m vides */
  K.voies(g,d,N,{l:.2,c:B,op:.86,per:17,on:5,ph:2});
  /* LES GALONES : épisodes où quatre voies portent un chevron tous les 40 m ; des V allongés (pente 2 : bras de 1,7 m en travers,
     3,4 m le long), comme les vrais, sinon la caméra basse les écrase en simple trait */
  const ep=[[380,800],[2100,2500],[3900,4300]],dans=function(s){for(const e of ep)if(s>=e[0]&&s<=e[1])return true;return false;};
  [3,4,5,6].forEach(function(i){const a=g+i*lw+.8,b=g+(i+1)*lw-.8,m=(a+b)*.5;
    K.motif(function(s){return dans(s)?a:m;},function(s){return dans(s)?b:m;},{type:'chevron',pas:40,ep:.62,pente:-2,c:B,op:.82});});
}});
