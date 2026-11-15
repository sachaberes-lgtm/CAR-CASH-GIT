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
arPaysDef('se',{nom:'Suède — mötesfri väg',plan:function(K){
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
