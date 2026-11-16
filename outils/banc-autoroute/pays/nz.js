/* ===== NOUVELLE-ZÉLANDE — LE MOTORWAY (maquette du 2026-11-15, revue par le second regard) =====
   Le vrai marquage (NZTA, Traffic Control Devices Manual, partie 5) : tout BLANC sur les voies ; lignes de voie des routes à plusieurs
   voies : 3 m peints, 7 m de vide (un pas de 10 m, plus serré que les 3/12 de Floride) ; rives blanches ; la LIGNE D'INTERDICTION DE
   DÉPASSER est JAUNE, continue, 100 mm, à ~100 mm de la ligne qu'elle double, du côté de la circulation qu'elle retient ; des plots
   JAUNES l'accompagnent.
   LA SIGNATURE : le jaune qui longe un tiret blanc serré (une seule séparation, à droite de la caisse), par épisodes de 500 à 600 m.
   Libertés : la ligne d'interdiction est une règle des routes à double sens ; ici elle double une seule séparation du motorway.
   Retiré à la revue : le triangle jaune des bouches d'incendie et son plot bleu (invisibles en vue jeu, mais lus de haut comme une
   flèche ou un objet à ramasser à côté des pièces). On roule à GAUCHE : la rapide est à droite. */
arPaysDef('nz',{nom:'Nouvelle-Zélande — motorway',plan:function(K){
  const g=K.g,d=K.d,B=0xf2f0e8,JAU=0xeec24e,ROUGE=0xd8402e,N=10,lw=(d-g)/N;
  /* les rives : blanches et pleines */
  K.trait(g,{l:.2,c:B,op:.86});
  K.trait(d,{l:.2,c:B,op:.86});
  /* les lignes de voie : 3 m / 7 m, et un plot blanc au milieu d'un vide sur deux (tous les 20 m) */
  for(let i=1;i<N;i++){const x=g+i*lw;
    K.trait(x,{l:.17,c:B,op:.86,per:10,on:3,ombre:1});
    K.plot(x,{per:20,ph:6.5,c:0xffffff,c2:ROUGE,l:.26,long:.26});}
  /* LA LIGNE D'INTERDICTION : la séparation i = 6 (à droite de la caisse) se double d'un jaune continu, à sa gauche, et de plots jaunes,
     par épisodes (le premier couvre le départ) */
  const xi=g+6*lw,xj=xi-.31,EPI=[[380,960],[2500,3050],[4400,4950]];
  for(const e of EPI){
    K.trait(xj,{l:.17,c:JAU,op:.8,s0:e[0],s1:e[1]});
    K.plot(xj-.3,{per:20,ph:16.5,c:JAU,c2:JAU,l:.22,long:.22,s0:e[0],s1:e[1]});}
}});
