/* ===== CHINE — 高速公路 (maquette du 2026-11-15) =====
   Le vrai marquage (GB 5768.3-2009, de mémoire, dimensions non revérifiées en ligne) : séparation des voies BLANCHE en tirets de 6 m
   pour 9 m de vide (autoroute, 15 cm) ; rive droite blanche pleine (20 cm) ; rive gauche, le long du terre-plein central, JAUNE pleine ;
   plots (突起路标) blancs dans les vides des séparations, jaunes sur la rive gauche. La marque chinoise : les 车行道纵向减速标线, des
   « dents » en LOSANGES blancs posées dans la voie, de part et d'autre de chaque ligne de voie, avant une descente, un tunnel ou une
   sortie ; leur pas se resserre pour donner l'impression d'aller plus vite. Et sur les routes touristiques (Hainan, Xinjiang),
   la triple ligne ROUGE-JAUNE-BLEUE le long de la rive.
   LA SIGNATURE : les tirets 6/9 et, par épisodes, chaque ligne de voie bordée de ses deux rangées de losanges qui se resserrent ;
   plus loin sur la piste, un tronçon « touristique » où la rive droite devient la triple ligne. */
arPaysDef('cn',{nom:'Chine — 高速公路',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,B=0xf1efe8,J=K.JAUNE;
  /* les rives */
  K.trait(g,{l:.22,c:J,op:.86});
  const T0=1700,T1=3300; /* le tronçon touristique */
  K.trait(d,{l:.22,c:B,op:.86,s1:T0});K.trait(d,{l:.22,c:B,op:.86,s0:T1});
  /* la triple ligne : rouge à l'extérieur, jaune, bleu vers la route */
  K.trait(d+.24,{l:.16,c:0xd83a2c,op:.86,s0:T0,s1:T1});
  K.trait(d,{l:.16,c:0xf0c23a,op:.86,s0:T0,s1:T1});
  K.trait(d-.24,{l:.16,c:0x2f74d6,op:.88,s0:T0,s1:T1});
  /* les séparations 6/9 et leurs plots au milieu du vide */
  K.voies(g,d,N,{l:.16,c:B,op:.86,per:15,on:6,plots:{per:15,ph:10.5,c:0xf4f2ea,c2:0xd83a2c}});
  K.plot(g+.4,{per:15,c:0xf3c13a,c2:0xd83a2c});
  /* les losanges du ralentissement : un dessin, posé un par un (le pas se resserre de 15 m à 9 m le long de l'épisode) ;
     second regard : losanges plus courts et plus larges (1,6 m × 52 cm), sinon ils se lisaient comme des lances ou des pointes, op .58 */
  K.dessin('losange',function(c,W,H){c.beginPath();c.moveTo(W/2,4);c.lineTo(W-6,H/2);c.lineTo(W/2,H-4);c.lineTo(6,H/2);c.closePath();c.fill();});
  const EP=[[385,745],[2400,2700],[4300,4650]];
  for(const e of EP){let s=e[0];
    while(s<e[1]){const t=(s-e[0])/(e[1]-e[0]),pas=15-6*t;
      for(let i=1;i<N;i++){const x=g+i*lw;for(const sd of [-1,1])K.decal(s,x+sd*.9,{d:'losange',l:.26,long:1.6,c:B,op:.58});}
      s+=pas;}}
}});
