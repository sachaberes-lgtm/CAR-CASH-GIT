/* ===== ÉMIRATS — SHEIKH ZAYED ROAD, DUBAÏ (maquette du 2026-11-15) =====
   Le vrai marquage (de mémoire, le manuel de la RTA n'est pas en ligne ; convention héritée du Royaume-Uni, on roule à droite) :
   rive GAUCHE (côté terre-plein) JAUNE pleine, rive DROITE (côté bande d'arrêt) BLANCHE pleine ; séparations BLANCHES en tirets
   courts (3 m peints, 9 m de vide) ; des plots partout et serrés : AMBRE le long de la rive jaune, ROUGES le long de la rive blanche,
   BLANCS sur les séparations ; et, avant un radar, une sortie ou un péage Salik, des BARRES SONORES transversales jaunes en paquets
   qui se resserrent.
   LA SIGNATURE : les deux colliers de plots (ambre à gauche, rouge à droite) et, par épisodes, les paquets de barres jaunes qui
   traversent toute la chaussée. */
arPaysDef('ae',{nom:'Émirats — Sheikh Zayed Road',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,B=0xf1efe8,JA=0xf0bd34,AM=0xf5a623,RO=0xe0262a;
  /* les rives */
  K.trait(g,{l:.22,c:JA,op:.88});
  K.trait(d,{l:.22,c:B,op:.86});
  /* les séparations : 3 m / 9 m, un plot blanc dans chaque vide */
  K.voies(g,d,N,{l:.16,c:B,op:.86,per:12,on:3,plots:{per:12,ph:7.5,c:0xfbfaf4,c2:RO}});
  /* les colliers de plots des rives, serrés (un tous les 6 m), juste en dedans du trait */
  K.plot(g+.35,{per:6,c:AM,c2:RO});
  K.plot(d-.35,{per:6,c:RO,c2:RO});
  /* les barres sonores : des paquets de 3 barres (40 cm, une tous les 4 m, jaune crème et voilées pour ne pas rappeler le doré des plaques turbo) qui se resserrent à l'approche d'un radar ou d'une
     sortie ; un épisode dans la fenêtre du banc, puis deux autres sur la piste. Les paquets commencent sur une barre (multiples de
     4 m) et le ruban s'ouvre et se ferme au milieu d'un vide : jamais de barre coupée par les rangées (2 m) de la piste. */
  const PAS=4,PAQ=[],ep=function(s0){[0,72,132,180,220,248].forEach(function(k){PAQ.push(s0+k);});};
  ep(420);ep(2600);ep(4700);
  const W=(d-g)-1.4,M=1.8,EP=.4;
  const dans=function(s){for(let k=0;k<PAQ.length;k++)if(s>=PAQ[k]-M&&s<=PAQ[k]+2*PAS+EP+M)return true;return false;};
  K.trait((g+d)*.5,{l:function(s){return dans(s)?W:0;},c:0xeacf7a,op:.4,per:PAS,on:EP,s0:400,s1:5000});
}});
