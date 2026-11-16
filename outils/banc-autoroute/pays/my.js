/* ===== MALAISIE — LEBUHRAYA (maquette du 2026-11-15, reprise le même jour : barres adoucies, voie des motos retirée) =====
   Le vrai marquage (JKR, Arahan Teknik (Jalan) 2D/85 « Road Marking and Delineation » ; le texte n'a pas pu être lu en ligne : les cotes
   sont de mémoire ou estimées) : lignes de voie BLANCHES en tirets (environ 3 m peints, 9 m de vide, 15 cm) ; rives blanches continues ;
   on roule à GAUCHE. LE TRAIT DU PAYS : les BARRES JAUNES TRANSVERSALES (« garisan kuning melintang ») peintes en travers des voies
   avant un péage, un virage dangereux ou une aire, par groupes de plus en plus SERRÉS pour donner l'impression d'accélérer et faire
   lever le pied ; souvent suivies d'un « AWAS » (attention) ou d'un « PERLAHAN » (ralentir) au sol. (Le long de certaines routes, la
   Federal Highway, une voie étroite des motos borde la rive gauche : essayée, elle restait hors de l'image de jeu sur dix voies : retirée.)
   LA SIGNATURE : un épisode tous les 700 m (le premier devant la caisse, à 405 m) : trois petits groupes de barres jaunes qui se
   resserrent (13 m, 9 m, 7 m), puis « AWAS » peint dans les deux voies du milieu.
   Libertés prises : les barres ne couvrent que les QUATRE voies du milieu (là où roule la caisse ; d'un bord à l'autre elles faisaient
   grille d'arrivée), 38 cm, translucides (.5), d'un jaune CITRON pâle et un peu blanchi (l'or chaud des pièces et des plaques turbo est évité), quatre barres
   par groupe au plus, le pas le plus serré à 7 m (à 5,5 m elles se tassaient en grille au loin). */
arPaysDef('my',{nom:'Malaisie — lebuhraya',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,J=0xe2de8a,N=10,lw=(d-g)/N;
  /* les rives, blanches et continues */
  K.trait(g,{l:.2,c:B,op:.86});
  K.trait(d,{l:.2,c:B,op:.86});
  /* les séparations des voies : 3 m sur 12 (3 + 9) */
  K.voies(g,d,N,{l:.15,c:B,op:.86,per:12,on:3});
  /* LES BARRES JAUNES : un épisode tous les 700 m (quinze au plus : deux « AWAS » chacun, trente dessins) ; trois groupes de quatre
     barres au plus, un blanc de 10 m entre les groupes ; seulement sur les quatre voies du milieu, entre deux séparations */
  const EP=[];for(let s=405;s<K.L-300&&EP.length<15;s+=700)EP.push(s);
  const G=[[0,52],[62,98],[108,136]],pas=[13,9,7],
    dans=function(sv,k){for(const e of EP)if(sv>=e+G[k][0]&&sv<e+G[k][1])return true;return false;};
  const x0=g+3*lw+.35,x1=g+7*lw-.35;
  for(let k=0;k<3;k++)K.motif(x0,function(sv){return dans(sv,k)?x1:x0;},{type:'hachure',pas:pas[k],ep:.38,pente:0,c:J,op:.5});
  /* « AWAS » au bout des barres, dans les deux voies du milieu */
  K.texte('awas','AWAS',{taille:60});
  for(const e of EP){K.decal(e+150,g+lw*4.5,{d:'awas',l:1.9,long:12,c:B,op:.78});K.decal(e+150,g+lw*5.5,{d:'awas',l:1.9,long:12,c:B,op:.78});}
}});
