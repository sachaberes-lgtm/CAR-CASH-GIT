/* ===== IRLANDE — LE MOTORWAY (maquette du 2026-11-15) =====
   Le vrai marquage. Vérifié : le règlement de 1983 (S.I. 276/1983) donne au motorway une rive gauche « continuous yellow line » d'environ
   150 mm (la bande d'arrêt est « marquée par une ligne jaune », AA Ireland) ; une ligne JAUNE EN TIRETS borde l'accotement des routes
   nationales, où l'on se range pour laisser doubler (le marquage que tout le monde reconnaît en Irlande) ; les lignes de voie sont des
   tirets BLANCS. Le texte de 1983 dit la rive droite blanche ; les motorways d'aujourd'hui la peignent jaune elle aussi (de mémoire,
   comme les longueurs : tirets de voie 3 m / 6 m de vide, tirets jaunes 3 m / 3 m — le chapitre 7 du Traffic Signs Manual de 2024 n'a pas
   pu être lu, le site refuse les robots). Les plots (« cat's eyes ») : ROUGES contre la bande d'arrêt, AMBRE contre le terre-plein,
   BLANCS entre les voies.
   LA SIGNATURE : les deux rives JAUNES et, par épisodes, la voie de gauche qui devient accotement derrière les tirets jaunes (avec un
   plot rouge), comme sur une « N road » — rien d'autre.
   On roule à gauche : l'accotement à GAUCHE, la voie rapide contre le terre-plein, à droite. */
arPaysDef('ie',{nom:'Irlande — motorway',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,B=0xf1efe8,J=0xf0bc32;
  const ROUGE=0xd8402e,AMBRE=0xf0a020;
  /* les épisodes « N road » : la première séparation passe en tirets jaunes (le premier couvre la fenêtre de jeu) */
  const EP=[[370,780],[3000,3400]];
  /* les rives : jaunes et pleines, leurs plots */
  K.trait(g,{l:.3,c:J,op:.9});
  K.plot(g+.42,{per:18,ph:9,c:ROUGE,l:.34,long:.34});
  K.trait(d,{l:.3,c:J,op:.9});
  K.plot(d-.42,{per:18,ph:9,c:AMBRE,l:.34,long:.34});
  /* les voies : tirets blancs de 3 m tous les 9 m, un plot blanc dans un vide sur deux */
  const ln={l:.16,c:B,op:.84,per:9,on:3};
  const pb={per:18,ph:15,c:0xffffff,l:.24,long:.24};
  for(let i=2;i<N;i++){K.trait(g+i*lw,ln);K.plot(g+i*lw,pb);}
  /* la première séparation : blanche hors des épisodes ; dedans, jaune en tirets (3 m / 3 m), plus grasse, plots rouges */
  const x1=g+lw;let s9=0;
  for(const ep of EP){
    K.trait(x1,Object.assign({},ln,{s0:s9,s1:ep[0]}));
    K.plot(x1,Object.assign({},pb,{s0:s9,s1:ep[0]}));
    K.trait(x1,{l:.34,c:J,op:.9,per:6,on:3,ombre:.8,s0:ep[0],s1:ep[1]});
    K.plot(x1-.45,{per:18,ph:9,c:ROUGE,l:.34,long:.34,s0:ep[0],s1:ep[1]});
    s9=ep[1];}
  K.trait(x1,Object.assign({},ln,{s0:s9}));
  K.plot(x1,Object.assign({},pb,{s0:s9}));
}});
