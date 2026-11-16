/* ROYAUME-UNI — LE MOTORWAY (maquette du 2026-11-15, remise dans le budget le même jour)
   Le vrai marquage (Traffic Signs Manual, chapitre 5, de mémoire pour les chiffres) : lignes de voie diagramme 1005.1 (au-dessus de 40 mph),
   tirets COURTS de 2 m tous les 9 m (7 m de vide), 150 mm de large sur autoroute ; rives pleines 1012.1 (150-200 mm) ;
   les CAT'S EYES (plots réfléchissants, un vide sur deux = 18 m) : BLANCS entre les voies, ROUGES à la rive gauche (côté bande d'arrêt),
   AMBRE à la rive droite (le terre-plein central) ; VERTS là où une bretelle rejoint ; et par endroits les chevrons de distance
   (« keep apart 2 chevrons », un chevron pointé vers l'avant tous les 40 m au milieu de chaque voie).
   Sens unique, voie lente à GAUCHE (comme là-bas), la rapide contre le terre-plein, à droite.
   LA SIGNATURE : les tirets très courts et serrés (2 sur 9 m) piqués de cat's eyes, la rive gauche aux plots rouges, la droite aux plots ambre,
   et, par épisodes, les chevrons « keep apart » sous la caisse.
   LES LIBERTÉS PRISES (le budget : 30 rubans, 5 motifs) :
   · les chevrons ne sont peints que sur les QUATRE voies autour de la caisse (la vraie route les a sur toutes) : quatre motifs ;
   · les cat's eyes blancs ne sont que sur une séparation sur deux (là-bas, sur toutes) ;
   · les bretelles (rive « 1010 » aux plots verts) et les épisodes de chevrons reviennent EN BOUCLE sur toute la piste (K.L), aux mêmes pas ;
     chaque rive est UN ruban dont la largeur s'annule là où l'autre prend le relais (pas un ruban par tronçon). */
arPaysDef('uk',{nom:'Royaume-Uni — motorway',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,L=K.L;
  const ROUGE=0xd8402e,AMBRE=0xf0a020,VERT=0x3fd27a;
  /* LES BRETELLES : de 540 à 700 m, puis toutes les 3360 m */
  const BP=3360,BA=540,BB=700;
  const bret=function(s){const m=((s-BA)%BP+BP)%BP;return s>=BA&&m<=BB-BA;};
  /* la rive gauche : pleine, blanc cassé, ses cat's eyes ROUGES (un tous les 18 m, juste à l'intérieur) ;
     là où une bretelle rejoint, elle se fait « 1010 » (traits larges de 1 m tous les 2 m) et ses plots VERTS */
  K.trait(g,{l:function(s){return bret(s)?0:.2;},op:.86});
  K.plot(g+.42,{per:18,ph:14.5,c:ROUGE,l:function(s){return bret(s)?0:.4;},long:.4});
  K.trait(g,{l:function(s){return bret(s)?.28:0;},op:.86,per:2,on:1});
  K.plot(g+.48,{per:9,ph:5,c:VERT,l:function(s){return bret(s)?.4:0;},long:.4});
  /* la rive droite (le terre-plein) : pleine, ses cat's eyes AMBRE */
  K.trait(d,{l:.2,op:.86});
  K.plot(d-.42,{per:18,ph:14.5,c:AMBRE,l:.4,long:.4});
  /* les voies : tirets courts de 2 m sur 9 m ; un plot blanc au milieu d'un vide sur deux, sur une séparation sur deux (la 2e, la 4e, la 6e, la 8e : quatre lignes, pour tenir les sommets) */
  K.voies(g,d,N,{l:.15,per:9,on:2,op:.84});
  for(let i=2;i<N;i+=2)K.plot(g+i*lw,{per:18,ph:14.5,c:0xffffff,l:.32,long:.32});
  /* LES CHEVRONS DE DISTANCE : un V pointé vers l'avant au milieu de la voie, tous les 40 m, par épisodes de 320 m qui reviennent toutes les 2900 m
     (le premier de 390 à 710 m : dans la fenêtre photographiée). Sur les QUATRE voies autour de la caisse (x de −2 lw à +2 lw).
     En MOTIFS et pas en dessins : les dessins collés point par point disparaissaient sous le béton de la grotte et de Jade ; un motif suit
     la route comme les traits. Hors des épisodes la bande se ferme (largeur nulle). Pâle (.58) et ouvert : un marquage, pas un signal ; .90 la nuit (le moteur assombrit la peinture de 40 %) ;
     épais de 85 cm le long de la route (16/11, la grotte vue au ras : une branche de V plus mince tombe sous le pixel au-delà de ~40 m de l'œil,
     le matériau des motifs n'ayant pas l'épaisseur minimale à l'écran des traits ; il ne restait qu'un rang, il en reste deux, le troisième pâlit) ;
     un mètre d'air de chaque côté du V (vus de haut, des V plus larges se touchaient en une seule ligne en zigzag). */
  const EP=2900,E0=390,EL=320;
  const dedans=function(s){if(s<E0-1)return false;const m=(s-E0)%EP;return m<=EL;};
  const mil=Math.floor(N/2);
  for(let i=mil-2;i<mil+2;i++){const xa=g+i*lw+1,xb=g+(i+1)*lw-1,xm=(xa+xb)*.5;
    K.motif(function(s){return dedans(s)?xa:xm;},function(s){return dedans(s)?xb:xm;},
      {type:'chevron',pas:40,ep:.85,pente:-1.2,op:.58+.32*K.nuit,s0:E0-5,s1:L-40});}
}});
