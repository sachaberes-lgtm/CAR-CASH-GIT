/* ===== AFRIQUE DU SUD — LA FREEWAY (maquette du 2026-11-15, îlots revus le même jour) =====
   Le vrai marquage (SADC-RTSM vol. 4, ch. 12, mai 2012, le manuel que suit l'Afrique du Sud) : rive gauche RM4.1 JAUNE continue (100 mm),
   rive droite RM4.2 continue ; lignes de voie GM1 BLANCHES, module rural 12 m : 2 m peints, 10 m de vide (100 mm) ; îlots peints RM5 :
   barres JAUNES (bordure blanche ou jaune), barres à 30° du sens de marche, barre et vide dans le rapport 1 à 2.
   LA SIGNATURE : la route bordée de jaune des deux côtés, les tirets courts et espacés (2 m sur 12) et, aux bretelles, l'ÎLOT JAUNE
   hachuré en biais (au lieu des chevrons blancs américains), qui revient EN BOUCLE sur toute la piste (K.L).
   LES LIBERTÉS PRISES :
   · la rive droite est jaune elle aussi (la table de 2012 la dit blanche, mais les freeways sud-africaines la portent souvent jaune près du
     terre-plein) ; plots de rive ROUGES à gauche, JAUNES à droite (de mémoire, à la manière britannique) ;
   · l'îlot est COURT (150 m, la vraie route en peint de plus longs) et revient tous les 1 à 1,3 km (le premier à 440 m : dans la fenêtre de jeu) ;
   · ses bords ne sont peints que sur les BISEAUX (le nez et la queue, en V) : le flanc droit de l'îlot n'a que ses barres, pour ne jamais
     tirer deux longues lignes pleines côte à côte (Sacha a refusé les lignes continues) ;
   · un seul ruban par bord et un seul motif pour TOUS les îlots (la largeur s'annule hors des îlots), dans le budget.
   On roule à GAUCHE : la bretelle entre par la gauche, la voie rapide est à droite. */
arPaysDef('za',{nom:'Afrique du Sud — freeway',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,J=0xefbd36,N=10,lw=(d-g)/N,x1=g+3*lw,L=K.L;
  /* les deux rives jaunes et leurs plots */
  K.trait(g,{l:.22,c:J,op:.88});
  K.trait(d,{l:.22,c:J,op:.88});
  K.plot(g+.55,{per:24,c:0xd8402e,c2:0xd8402e,l:.3,long:.3});
  K.plot(d-.55,{per:24,c:J,c2:0xd8402e,l:.3,long:.3});
  /* LES ÎLOTS (RM5) : la troisième séparation s'ouvre en un îlot jaune hachuré, puis se referme ; 150 m : nez de NE m, plein, queue de QU m */
  const I0=440,IL=150,NE=55,QU=45,W=Math.min(1.9,lw*.4),P=Math.min(1300,Math.max(1000,(L-700)/3.6)); /* au plus 1,3 km entre deux îlots, même sur les longues pistes (canyon 14,5 km) */
  const pos=function(sv){if(sv<I0)return -1;const m=(sv-I0)%P;return (sv-m+IL>L-60)?-1:m;}; /* la position dans l'îlot (−1 : hors îlot) */
  const demi=function(sv){const m=pos(sv);if(m<0||m>IL)return 0;return W*Math.min(1,m/NE,(IL-m)/QU);};
  const biseau=function(sv){const m=pos(sv);return m>=0&&m<=IL&&(m<NE||m>IL-QU);};
  /* la séparation GM1 : coupée sur l'îlot */
  K.trait(x1,{l:function(sv){const m=pos(sv);return m>=0&&m<=IL?0:.17;},c:B,op:.86,per:12,on:2});
  /* les bords en biseau (le nez et la queue en V) */
  K.trait(function(sv){return x1-.1-demi(sv);},{l:function(sv){return biseau(sv)?.2:0;},c:J,op:.82+.12*K.nuit});
  K.trait(function(sv){return x1+.1+demi(sv);},{l:function(sv){return biseau(sv)?.2:0;},c:J,op:.82+.12*K.nuit});
  /* les barres à 30°, barre 1 / vide 2 */
  K.motif(function(sv){return x1-demi(sv)+.12;},function(sv){return x1+demi(sv)-.12;},{type:'hachure',pas:4.5,ep:1.5,pente:1.73,c:B,op:.5+.22*K.nuit}); /* plus franches la nuit : le moteur y assombrit la peinture de 40 %. (16/11) Rayures BLANCHES, bords jaunes : un îlot tout jaune rayé ressemblait à la plaque turbo (jaune à barres) */
  /* les autres séparations : GM1, 2 m peints sur 12 */
  for(let i=1;i<N;i++)if(i!==3)K.trait(g+i*lw,{l:.17,c:B,op:.86,per:12,on:2});
}});
