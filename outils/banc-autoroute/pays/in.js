/* ===== INDE — L'EXPRESSWAY (maquette du 2026-11-15) =====
   Le vrai marquage (IRC:35-2015, code des marquages de l'Indian Roads Congress ; chiffres de mémoire, le PDF officiel n'a pas pu être lu) :
   on roule à GAUCHE, le terre-plein est à DROITE ; la rive du côté du terre-plein est JAUNE continue, la rive de gauche BLANCHE continue ;
   lignes de voie blanches en tirets de 3 m (vide d'environ 6 m sur route rapide), 15-20 cm ; les « transverse bar markings » : des groupes
   de barres blanches en travers des voies (bandes d'alerte en thermoplastique, ~6 par groupe ; ici 6, plus grasses) avant un péage, une
   bretelle, un pont ; plots
   réfléchissants ambre côté terre-plein, rouges côté gauche (de mémoire) ; la bordure du terre-plein peinte en damier JAUNE et NOIR.
   Sens unique : voie rapide à droite, rive jaune à droite (l'inverse de la Floride).
   LA SIGNATURE : les groupes de barres en travers, coupés au droit de chaque ligne de voie, et le damier jaune et noir le long du bord droit. */
arPaysDef('in',{nom:'Inde — expressway',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,B=0xf1efe8,J=0xf0bd34;
  /* les rives : blanche à gauche, jaune à droite (le terre-plein) */
  K.trait(g,{l:.22,c:B,op:.86});
  K.trait(d,{l:.24,c:J,op:.88});
  /* le damier de la bordure du terre-plein : 1 m jaune, 1 m noir, au ras du vrai bord */
  K.trait(K.H-.7*K.kH,{l:.32,c:J,op:.86,per:2,on:1,ombre:1});
  /* les lignes de voie : 3 m peints, 6 m de vide */
  K.voies(g,d,N,{l:.18,c:B,op:.86,per:9,on:3});
  /* les plots : ambre au bord jaune, rouges au bord blanc */
  K.plot(d-.4,{per:18,c:0xffb21e});
  K.plot(g+.4,{per:18,c:0xe8322a});
  /* les barres transversales : six barres de 50 cm tous les 1,2 m (plus grasses que les vraies, ~30 cm, pour qu'elles tiennent au ras
     du sol), coupées de 80 cm de part et d'autre de chaque ligne de voie */
  const NB=6,EB=.5,PB=1.2,MG=1.5,LG=NB*PB-PB+EB+2*MG; /* MG : une marge vide à chaque bout (la première et la dernière rangée du
     dessin s'étirent au pas de la piste : rien n'y est peint) */
  K.dessin('barres',function(c,W,Hc){const pm=Hc/LG,cw=W/N,gap=.8/lw*cw;
    for(let b=0;b<NB;b++){const y=Hc-(MG+b*PB+EB)*pm;
      for(let v=0;v<N;v++)c.fillRect(v*cw+(v?gap:3),y,cw-(v?gap:3)-(v<N-1?gap:3),EB*pm);}});
  /* trois groupes qui se resserrent, par épisodes : le premier dans la fenêtre du banc */
  const EP=[446,2350,4300]; /* 446 : le premier groupe juste devant la caisse du banc (à 436 il passait sous la caisse) */
  for(const s0 of EP)for(const ds of [0,45,80])K.decal(s0+ds,(g+d)/2,{d:'barres',l:(d-g)/2,long:LG,c:B,op:.84});
}});
