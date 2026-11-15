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
arPaysDef('au',{nom:'Australie — freeway',plan:function(K){
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
