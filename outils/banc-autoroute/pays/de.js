/* ALLEMAGNE — l'Autobahn (marquage RMS / StVO) : tout blanc ; rives en BREITSTRICH (trait large, plein) ; Leitlinie de 6 m tous les 18 m
   (6 m peints, 12 m de vide) ; pas de plots sur le blanc. LA SIGNATURE : la BAUSTELLE (chantier) — les lignes blanches s'effacent, des
   lignes JAUNES (RAL 1023) prennent le relais, une voie de rive se ferme en biseau derrière une rangée de Leitbaken rouge et blanc, les
   voies se resserrent, des plots jaunes (Markierungsknöpfe) jalonnent la rive jaune ; puis tout se rouvre et le blanc revient. */
arPaysDef('de',{nom:'Allemagne — Autobahn',plan:function(K){
  const g=K.g,d=K.d,N=9,lw=(d-g)/N,BL=0xf1efe8,JA=0xf3d15c;
  /* les chantiers : [début, fin, côté fermé (−1 : la voie de gauche, 1 : celle de droite)] ; le biseau d'entrée et de sortie fait B m */
  const B=160,CH=[[430,1040,-1],[3300,3850,1]];
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  const dans=function(sv){for(const z of CH)if(sv>=z[0]&&sv<=z[1])return true;return false;};
  /* LE BLANC : rives pleines, Leitlinien qui s'effacent dans le chantier */
  K.trait(g,{l:.3,c:BL,op:.86});
  K.trait(d,{l:.3,c:BL,op:.86});
  for(let i=1;i<N;i++)K.trait(g+i*lw,{l:function(sv){return dans(sv)?0:.17;},c:BL,op:.84,per:18,on:6});
  /* LE JAUNE : les mêmes Leitlinien, qui se resserrent avec la fermeture ; la rive jaune ; ses plots ; les Leitbaken côté fermé */
  for(const z of CH){const s0=z[0],s1=z[1],cote=z[2];
    const f=function(sv){return Math.min(lisse((sv-s0)/B),lisse((s1-sv)/B));};
    const gY=function(sv){return cote<0?g+lw*f(sv):g;},dY=function(sv){return cote>0?d-lw*f(sv):d;};
    const rive=function(sv){return cote<0?gY(sv)+.25:dY(sv)-.25;};
    for(let i=1;i<N;i++)K.trait(function(sv){return gY(sv)+i*(dY(sv)-gY(sv))/N;},{l:.17,c:JA,op:.78,per:18,on:6,s0:s0,s1:s1});
    K.trait(rive,{l:.3,c:JA,op:.8,s0:s0+B*.35,s1:s1-B*.35});
    K.plot(rive,{per:12,c:JA,c2:JA,s0:s0+B*.35,s1:s1-B*.35});
    K.poteaux(function(sv){return rive(sv)+cote*.7;},{per:12,c:0xd8261c,c2:0xf2f2ea,h:1.15,s0:s0+B*.5,s1:s1-B*.5});}
}});
