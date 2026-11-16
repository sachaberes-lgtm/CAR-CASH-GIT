/* ===== SUÈDE — LA MÖTESFRI VÄG (maquette du 2026-11-15) =====
   Le vrai marquage (Transportstyrelsen, TSFS 2010:171 et les fiches M1-M3 — largeurs et rapport 1:2 de la kantlinje vérifiés ; longueurs
   3+9 et 9+3 de mémoire, le texte en ligne est ambigu) : tout BLANC ; körfältslinje M1 : 3 m peints, 9 m de vide, 15 cm ;
   kantlinje M2 : des dellinjer de 1 m, 2 m de vide, 10 à 30 cm (la rive « pointillée » des routes suédoises, motorvägar comprises) ;
   varningslinje M3 : 9 m peints, 3 m de vide, au moins aussi large que M1 (20-30 cm), avant un changement.
   La route 2+1 « mötesfri väg » : une mittremsa étroite entre deux kantlinjer, fraisée (mittfräsning, la räffla qui gronde), hérissée du
   vajerräcke : des câbles d'acier tendus à ~0,75 m sur des poteaux galvanisés gris, au catadioptre blanc. Et le 2+1 ALTERNE : tous
   les quelques kilomètres, le côté à deux voies change, la séparation passe de l'autre côté — une varningslinje l'annonce.
   LA SIGNATURE : la rangée de poteaux gris qui file à côté de la caisse, bordée de ses deux rives en pointillés de 1 m qui s'écartent
   autour d'elle ; et sur les bords de la route, les mêmes pointillés courts au lieu d'une rive pleine.
   LE TOUR DE LA PISTE : un épisode tous les P ≈ 1,9 km sur toute la longueur K.L (le premier s'ouvre à 300 m, pour que les poteaux
   filent dès la vue de jeu : la caisse est figée vers 430 m) ; 900 m de séparation ; il change de côté à chaque fois (la 4e séparation,
   puis la 6e, puis la 4e…). Toutes les marques sont des traits SUR TOUTE LA PISTE dont la place et la largeur suivent l'épisode
   (largeur nulle hors de lui) : 15 traits et fonds quelle que soit la longueur. Les poteaux : un paquet par épisode, leur pas (8 m au
   moins) s'élargit pour que la piste en compte au plus 390 (mesuré : 315 aux nuages, 340 en ville, 365-389 ailleurs).
   AUCUNE LIGNE PLEINE : les rives en 1+2, les séparations en 3+9, la varningslinje en 9+3 sur 70 m au plus.
   Libertés prises : la mötesfri sépare deux sens ; ici elle sépare deux groupes de voies d'une route à sens unique. LE CÂBLE EST RETIRÉ
   (2026-11-15) : un ruban plat ne pend pas ; même coupé entre les poteaux, il se lisait encore comme une ligne peinte de 900 m. La
   rangée de poteaux suffit à dire « vajerräcke ». Les poteaux sont espacés de 9 m environ (au lieu de ~2,5-3) pour rester légers, plus clairs (galvanisé neuf) et plus hauts (0,95 m) que les vrais pour se lire sur les routes sombres. */
arPaysDef('se',{nom:'Suède — mötesfri väg',plan:function(K){
  const g=K.g,d=K.d,L=K.L,B=0xf1efe8,GR=0xd3d9de,N=10,lw=(d-g)/N;
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  /* l'épisode : A0 = la première annonce ; dans chaque cycle de P m, u = 0 l'annonce (varningslinje), u = AN l'ouverture, LEN m de
     séparation, OUV m pour se refermer, puis la varningslinje de sortie ; COTES = les deux séparations qui alternent */
  const A0=240,AN=60,LEN=900,OUV=45,DEMI=.8,COTES=[4,6],P0=1900;
  let nEp=0;for(let s=A0;s+AN+60<L-40;s+=P0)nEp++;
  const PER=Math.max(8,Math.ceil(nEp*(LEN-30)/390)),P=Math.round(P0/PER)*PER,FIN=AN+LEN+OUV;
  const ep=function(sv){if(sv<A0)return null;const k=Math.floor((sv-A0)/P);return {k:k,u:sv-A0-k*P,i:COTES[k%2]};};
  const ou=function(sv){const e=ep(sv);if(!e||e.u<AN||e.u>FIN)return 0;return Math.min(lisse((e.u-AN)/OUV),lisse((FIN-e.u)/OUV));};
  const xm=function(sv){const e=ep(sv);return g+(e?e.i:COTES[0])*lw;};
  /* la séparation i est « prise » par l'épisode : de l'annonce à la fin de la varningslinje de sortie */
  const prise=function(sv,i){const e=ep(sv);return !!e&&e.i===i&&e.u<FIN+60;};
  /* les rives : kantlinje 1+2, 30 cm (celle d'une motorväg) */
  K.trait(g,{l:.28,c:B,op:.86,per:3,on:1});
  K.trait(d,{l:.28,c:B,op:.86,per:3,on:1});
  /* les séparations ordinaires : körfältslinje 3+9 (les deux qui portent l'épisode s'effacent quand il est là) */
  for(let i=1;i<N;i++){const lq=COTES.indexOf(i)<0?.15:function(sv){return prise(sv,i)?0:.15;};
    K.trait(g+i*lw,{l:lq,c:B,op:.86,per:12,on:3});}
  /* la varningslinje 9+3 : avant l'ouverture et après la fermeture (70 m au plus) */
  K.trait(xm,{l:function(sv){const e=ep(sv);if(!e)return 0;return (e.u<AN+8||(e.u>FIN-6&&e.u<FIN+60))?.24:0;},c:B,op:.88,per:12,on:9});
  /* les deux kantlinjer 1+2 qui s'écartent autour de la séparation */
  const kl=function(sv){return ou(sv)>.03?.2:0;};
  K.trait(function(sv){return xm(sv)-DEMI*ou(sv);},{l:kl,c:B,op:.86,per:3,on:1});
  K.trait(function(sv){return xm(sv)+DEMI*ou(sv);},{l:kl,c:B,op:.86,per:3,on:1});
  /* la räffla : des barreaux sombres et fins dans la mittremsa (aucun fond continu) */
  K.fond(function(sv){return xm(sv)-.3*ou(sv);},function(sv){return xm(sv)+.3*ou(sv);},{c:K.NOIR,op:.1,per:1,on:.4});
  /* le vajerräcke : la rangée de poteaux gris au catadioptre blanc, un paquet par épisode */
  for(let k=0;k<nEp;k++){const s0=A0+k*P+AN+30;K.poteaux(g+COTES[k%2]*lw,{per:PER,c:GR,c2:0xf2f2ea,h:.95,s0:s0,s1:s0+LEN-30});}
}});
