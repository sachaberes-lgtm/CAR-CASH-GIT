/* ===== MALAISIE — LEBUHRAYA (maquette du 2026-11-15) =====
   Le vrai marquage (JKR, Arahan Teknik (Jalan) 2D/85 « Road Marking and Delineation » ; le texte n'a pas pu être lu en ligne : les cotes
   sont de mémoire ou estimées) : lignes de voie BLANCHES en tirets (environ 3 m peints, 9 m de vide, 15 cm) ; rives blanches continues ;
   on roule à GAUCHE. LE TRAIT DU PAYS : les BARRES JAUNES TRANSVERSALES (« garisan kuning melintang ») peintes en travers de toutes les
   voies avant un péage, un virage dangereux ou une aire, par groupes de plus en plus SERRÉS pour donner l'impression d'accélérer et faire
   lever le pied ; souvent suivies d'un « AWAS » (attention) ou d'un « PERLAHAN » (ralentir) au sol. Et, le long de la rive gauche de
   certaines routes (la Lebuhraya Persekutuan, la Federal Highway), la VOIE DES MOTOS : étroite, séparée par un trait blanc, « MOTOSIKAL »
   peint dedans.
   LA SIGNATURE : un groupe de barres jaunes qui se resserrent devant la caisse, et la voie étroite des motos à gauche.
   Libertés prises : la voie des motos est bordée d'un trait en tirets longs (et non continu), avec des plots ambre, et seule la moto peinte (sans le mot « MOTOSIKAL ») ; les barres jaunes
   (40 cm) épargnent la voie des motos, s'arrêtent à la rive droite et restent translucides (un sol de jeu : rien qui ressemble à une
   plaque à ramasser) ; trois épisodes sur la piste (vers 405, 2450 et 4300 m). */
arPaysDef('my',{nom:'Malaisie — lebuhraya',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,J=0xf0bb2e,MOTO=3.6*K.kH,xm=g+MOTO,N=10,lw=(d-xm)/N;
  /* les rives, blanches et continues */
  K.trait(g,{l:.2,c:B,op:.86});
  K.trait(d,{l:.2,c:B,op:.86});
  /* la voie des motos : un trait gras en tirets longs (8 m sur 10), plots ambre */
  K.trait(xm,{l:.26,c:B,op:.88,per:10,on:8});
  K.plot(xm,{per:20,ph:9,c:0xffb21e,c2:0xd8261e});
  /* les séparations des voies : 3 m sur 12 (3 + 9) */
  K.voies(xm,d,N,{l:.15,c:B,op:.86,per:12,on:3});
  /* dans la voie des motos, un tous les ~650 m : la moto peinte (de profil, couchée le long de la voie, roue avant vers l'avant)
     (le mot « MOTOSIKAL », trop fin à 9 lettres dans 3,6 m, est retiré : il faisait code-barres) */
  K.dessin('moto',function(c,W,H){c.lineWidth=20;c.lineCap='round';c.lineJoin='round';
    c.beginPath();c.arc(W*.5,H*.8,54,0,7);c.stroke();c.beginPath();c.arc(W*.5,H*.22,54,0,7);c.stroke();
    c.beginPath();c.moveTo(W*.5,H*.8);c.lineTo(W*.62,H*.6);c.lineTo(W*.62,H*.4);c.lineTo(W*.5,H*.22);c.stroke();
    c.beginPath();c.moveTo(W*.62,H*.52);c.lineTo(W*.78,H*.55);c.moveTo(W*.62,H*.36);c.lineTo(W*.8,H*.3);c.stroke();});
  for(let s=470;s<K.L-200;s+=650){K.decal(s,g+MOTO*.5,{d:'moto',l:1.3,long:7,c:B,op:.8});}
  /* LES BARRES JAUNES : des épisodes ; dans chacun trois groupes, le pas se resserre (14 m, puis 9 m, puis 5,5 m) ;
     second regard : 40 cm à .5 (à 60 cm et .72 elles faisaient grille d'arrivée et se confondaient avec les plaques turbo) */
  const EP=[405,2450,4300].filter(function(s){return s<K.L-400;}),
    G=[[0,84],[84,147],[147,191]],dans=function(sv,k){for(const e of EP)if(sv>=e+G[k][0]&&sv<e+G[k][1])return true;return false;};
  const x0=xm+.45,pas=[14,9,5.5];
  for(let k=0;k<3;k++)K.motif(x0,function(sv){return dans(sv,k)?d-.45:x0;},{type:'hachure',pas:pas[k],ep:.4,pente:0,c:J,op:.5});
  /* « AWAS » au bout des barres, dans les deux voies devant la caisse */
  K.texte('awas','AWAS',{taille:60});
  for(const e of EP){K.decal(e+204,xm+lw*4.5,{d:'awas',l:1.9,long:12,c:B,op:.82});K.decal(e+204,xm+lw*5.5,{d:'awas',l:1.9,long:12,c:B,op:.82});}
}});
