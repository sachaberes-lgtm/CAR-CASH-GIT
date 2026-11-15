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
arPaysDef('no',{nom:'Norvège — motorveg',plan:function(K){
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
