/* ===== PAYS-BAS — LA SNELWEG (maquette du 2026-11-15) =====
   Le vrai marquage (Rijkswaterstaat / CROW, de mémoire, vérifié en partie) : tout BLANC ; deelstreep des voies 3 m peints, 9 m de vide,
   15 cm ; kantstreep de rive gauche pleine ; kantstreep de rive droite ONDERBROKEN (9 m peints, 3 m de vide : l'eau s'écoule du ZOAB) ;
   aux in- et uitvoegstroken et aux weefvakken : la BLOKMARKERING, des blocs larges et courts (≈ 1 m peint, 3 m de vide, 30-40 cm) ;
   sur les autowegen (N-wegen à 100 km/h) : la double ligne d'axe remplie de VERT.
   LA SIGNATURE : à gauche de la caisse, la double ligne au FILET VERT (ses deux traits et le vert en longs tirets 9/3, pour ne jamais faire
   de longue ligne continue) ; à droite, un weefvak : la séparation devient BLOKMARKERING, des pavés blancs de 1 m × 50 cm tous les 4 m.
   Libertés prises : le vert (axe des autowegen à double sens) sépare ici deux groupes de voies d'une route à sens unique, par tronçons de
   ≈ 500 m ; le weefvak est posé près du milieu (là où roule la caisse) au premier épisode, à droite (sa vraie place) au second ; blocs
   élargis à 50 cm (voies de 5 m). */
arPaysDef('nl',{nom:'Pays-Bas — snelweg',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,VE=0x4cc46a,N=10,lw=(d-g)/N;
  const xv=g+4*lw; /* la double ligne verte : entre la 4e et la 5e voie (juste à gauche de la caisse, dans la vue de jeu) */
  /* les rives : gauche pleine, droite onderbroken 9/3 */
  K.trait(g,{l:.22,c:B,op:.86});
  K.trait(d,{l:.22,c:B,op:.88,per:12,on:9,ph:2});
  /* LE FILET VERT, par tronçons (comme une autoweg qui va et vient) : la deelstreep s'ouvre en double ligne sur 60 m, le vert se pose
     entre les deux, puis tout se referme ; hors des tronçons, une deelstreep ordinaire */
  const VT=[[340,900],[2500,3000],[4300,4800]],OUV=60;
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  const ou=function(sv){let f=0;for(const z of VT)f=Math.max(f,Math.min(lisse((sv-z[0])/OUV),lisse((z[1]-sv)/OUV)));return f;};
  K.fond(function(sv){return xv-.26*ou(sv);},function(sv){return xv+.26*ou(sv);},{c:VE,op:.2,per:12,on:9}); /* le vert, coupé tous les 12 m comme ses deux traits */
  /* les deux traits du filet : 9 m peints, 3 m de vide dans les tronçons (calés sur le vert) ; une deelstreep 3/9 ailleurs */
  let s9=0;for(const z of VT){
    K.trait(xv,{l:.15,c:B,op:.86,per:12,on:3,s0:s9,s1:z[0]});
    K.trait(function(sv){return xv-.4*ou(sv);},{l:.15,c:B,op:.86,per:12,on:9,s0:z[0],s1:z[1]});
    K.trait(function(sv){return xv+.4*ou(sv);},{l:.15,c:B,op:.86,per:12,on:9,s0:z[0],s1:z[1]});s9=z[1];}
  K.trait(xv,{l:.15,c:B,op:.86,per:12,on:3,s0:s9});
  /* les weefvakken : [début, fin, numéro de la séparation] */
  const WV=[[380,1000,6],[3200,3800,9]];
  for(let i=5;i<N;i++){const x=g+i*lw,w=WV.filter(function(z){return z[2]===i;});
    if(!w.length){K.trait(x,{l:.15,c:B,op:.86,per:12,on:3});continue;}
    let s=0;for(const z of w){K.trait(x,{l:.15,c:B,op:.86,per:12,on:3,s0:s,s1:z[0]});
      K.trait(x,{l:.5,c:B,op:.88,per:4,on:1,s0:z[0],s1:z[1]});s=z[1];}
    K.trait(x,{l:.15,c:B,op:.86,per:12,on:3,s0:s});}
  K.trait(g+lw,{l:.15,c:B,op:.86,per:12,on:3});
  K.trait(g+2*lw,{l:.15,c:B,op:.86,per:12,on:3});
  K.trait(g+3*lw,{l:.15,c:B,op:.86,per:12,on:3});
}});
