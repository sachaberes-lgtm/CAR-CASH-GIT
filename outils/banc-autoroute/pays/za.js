/* ===== AFRIQUE DU SUD — LA FREEWAY (maquette du 2026-11-15) =====
   Le vrai marquage (SADC-RTSM vol. 4, ch. 12, mai 2012, le manuel que suit l'Afrique du Sud) : rive gauche RM4.1 JAUNE continue (100 mm),
   rive droite RM4.2 continue ; lignes de voie GM1 BLANCHES, module rural 12 m : 2 m peints, 10 m de vide (100 mm) ; îlots peints RM5 :
   barres JAUNES (bordure blanche ou jaune), barres à 30° du sens de marche, barre et vide dans le rapport 1 à 2.
   Liberté prise : la rive droite est jaune elle aussi (la table de 2012 la dit blanche, mais les freeways sud-africaines la portent souvent
   jaune près du terre-plein) ; plots de rive ROUGES à gauche, JAUNES à droite (de mémoire, à la manière britannique).
   LA SIGNATURE : la route bordée de jaune des deux côtés, les tirets courts et espacés (2 m sur 12) et, à l'entrée de bretelle, l'ÎLOT JAUNE
   hachuré en biais (au lieu des chevrons blancs américains).
   On roule à GAUCHE : la bretelle entre par la gauche, la voie rapide est à droite. */
arPaysDef('za',{nom:'Afrique du Sud — freeway',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,J=0xefbd36,N=10,lw=(d-g)/N,x1=g+3*lw;
  /* les deux rives jaunes et leurs plots */
  K.trait(g,{l:.22,c:J,op:.88});
  K.trait(d,{l:.22,c:J,op:.88});
  K.plot(g+.55,{per:24,c:0xd8402e,c2:0xd8402e,l:.3,long:.3});
  K.plot(d-.55,{per:24,c:J,c2:0xd8402e,l:.3,long:.3});
  /* LES ÎLOTS D'ENTRÉE (une bretelle de trois voies rejoint par la gauche) : la troisième séparation s'ouvre en un îlot jaune hachuré (RM5), puis se referme */
  const ILOTS=[[380,680],[3300,3600]];
  const demi=function(sv){for(const e of ILOTS){if(sv<e[0]||sv>e[1])continue;
      const a=Math.min(1,(sv-e[0])/100),b=Math.min(1,(e[1]-sv)/140),t=Math.min(a,b);return t*t*(3-2*t)*2.3;}return 0;};
  let s9=0;
  for(const e of ILOTS){K.trait(x1,{l:.17,c:B,op:.86,per:12,on:2,s0:s9,s1:e[0]});s9=e[1];
    K.trait(function(sv){return x1-.1-demi(sv);},{l:.2,c:J,op:.82,s0:e[0],s1:e[1]});
    K.trait(function(sv){return x1+.1+demi(sv);},{l:.2,c:J,op:.82,s0:e[0],s1:e[1]});
    K.motif(function(sv){return x1-demi(sv)+.12;},function(sv){return x1+demi(sv)-.12;},{type:'hachure',pas:6,ep:.9,pente:1.73,c:J,op:.56,s0:e[0]+20,s1:e[1]-25});}
  K.trait(x1,{l:.17,c:B,op:.86,per:12,on:2,s0:s9});
  /* les autres séparations : GM1, 2 m peints sur 12 */
  for(let i=1;i<N;i++)if(i!==3)K.trait(g+i*lw,{l:.17,c:B,op:.86,per:12,on:2});
}});
