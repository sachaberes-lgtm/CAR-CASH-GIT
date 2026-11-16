/* ===== BRÉSIL — LA RODOVIA DUPLICADA (maquette du 2026-11-15) =====
   Le vrai marquage (Manual Brasileiro de Sinalização de Trânsito, vol. IV, CONTRAN ; chiffres de mémoire, le PDF n'a pas pu être lu) :
   séparation des voies de même sens LMS-2 BLANCHE, 4 m peints, 12 m de vide au-dessus de 80 km/h, 15 cm ; rive droite (linha de bordo)
   blanche pleine, 20 cm ; à gauche, contre le terre-plein, la rive JAUNE des rodovias concédées (Dutra, Bandeirantes, Imigrantes) et ses
   TACHÕES : de gros plots jaunes, jaunes dans les deux sens, qui hérissent la rive ; « tachas » blanches au milieu de chaque vide (16 m) ;
   et, avant une praça de pedágio ou une descente, les LRV (linhas de estímulo à redução de velocidade) : des barres blanches en travers,
   40 cm (ici 60, pour qu'elles se lisent au ras du sol), de plus en plus serrées — le tambour des sonorizadores.
   LA SIGNATURE : la rive jaune hérissée de tachões et, deux fois sur la piste, les barres en travers qui se resserrent devant la caisse.
   Asphalte : pas d'ombre noire derrière les tirets (c'est le béton de Floride). */
arPaysDef('br',{nom:'Brésil — rodovia',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,JAU=0xf0bf34,N=10;
  /* les rives : jaune à gauche, blanche à droite */
  K.trait(g,{l:.22,c:JAU,op:.88});
  K.trait(d,{l:.2,c:B,op:.86});
  /* les tachões : gros, jaunes, contre la rive gauche, un tous les 8 m */
  K.plot(g+.5,{per:8,ph:2,c:JAU,c2:JAU,l:.36,long:.5});
  /* les voies : tirets 4 m / 12 m, une tacha blanche au milieu du vide */
  K.voies(g,d,N,{l:.16,c:B,op:.86,per:16,on:4,plots:{per:16,ph:10,c:0xffffff,c2:0xd8402e,l:.22,long:.22}});
  /* les LRV : des barres de 60 cm en travers, de rive à rive (un fond, sous les tirets), le pas qui se resserre : 18, 13, 9, 6 m */
  const LRV=function(s0){const pas=[18,13,9,6],lg=[108,91,72,54];let s=s0;
    for(let i=0;i<4;i++){K.fond(g+.6,d-.6,{c:B,op:.28,per:pas[i],on:.6,ph:-s,s0:s,s1:s+lg[i]});s+=lg[i];}};
  LRV(395);LRV(3400);
}});
