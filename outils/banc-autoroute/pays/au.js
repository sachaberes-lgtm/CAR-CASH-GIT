/* ===== AUSTRALIE — LE FREEWAY (maquette du 2026-11-15, reprise le 2026-11-16 : « discrète mais peu visible ») =====
   Le vrai marquage (AS 1742.2, de mémoire pour les chiffres ; la recherche confirme les plots JAUNES à la rive droite depuis 2009 et la
   ligne de continuité large de 200 mm) : tout BLANC ; lignes de voie 3 m peints, 9 m de vide (au-dessus de 80 km/h), 100-150 mm ;
   rives pleines de 150-200 mm, souvent AUDIO-TACTILES (des nervures en relief posées sur le trait, qui grondent sous les pneus) ;
   plots réfléchissants (RRPM) blancs entre les voies, JAUNES à la rive droite (le terre-plein) ; et là où une voie naît, finit ou se
   sépare (bretelle, échangeur où le freeway se partage en deux directions), la LIGNE DE CONTINUITÉ : des tirets COURTS et GRAS,
   1 m peint, 3 m de vide, 200 mm.
   LA SIGNATURE : la ligne de continuité qui pointille court et gras à la place des longs tirets, des DEUX côtés de la voie de la caisse
   (une voie auxiliaire entre deux échangeurs), et un peu plus loin à gauche (la bretelle d'entrée) ; les rives nervurées (chaque nervure
   son ombre : elles ont l'air en relief) ; les plots JAUNES serrés contre la rive droite.
   On roule à GAUCHE : la voie lente est à gauche (la bretelle y entre), la rapide à droite, contre les plots jaunes.
   LES LIBERTÉS PRISES :
   · la ligne de continuité est plus grasse que la vraie (36 cm contre 15 pour les lignes de voie, le vrai rapport est 200/100-150 mm)
     et plus espacée : 1,2 m peint, 4,8 m de vide (20 %), au lieu de 1 m / 3 m (25 %) ; à 25 % et 4 m de pas, le créneau filtré la
     fondait au loin en une ligne presque continue ; avec 6 m de pas et 20 %, les trous tiennent deux fois plus loin, et elle reste
     plus pâle de loin qu'une ligne de voie (jamais une ligne pleine) ;
   · les épisodes reviennent EN BOUCLE sur K.L (des voies auxiliaires toutes les ~1,6 km, la bretelle toutes les ~2,1 km) ; la ligne de
     voie s'efface là où la ligne de continuité la remplace (une largeur qui dépend de s : zéro ruban, zéro sommet hors de l'épisode) ;
   · les plots jaunes de rive tous les 10 m (au lieu de 24) et plus gros, pour qu'on les voie depuis la caisse ;
   · les plots blancs sur une séparation sur trois seulement (le budget de sommets : une ligne de plots en coûte autant qu'un trait) ;
   · aucune ligne pleine entre les voies : seules les deux rives sont pleines (comme l'américaine). */
arPaysDef('au',{nom:'Australie — freeway',plan:function(K){
  const g=K.g,d=K.d,B=0xf2f0e8,JAU=0xf0c23a,N=10,lw=(d-g)/N;
  /* un épisode en boucle : vrai si s, ramené dans le pas P, tombe dans [a, b] */
  const dans=function(s,a,b,P){const m=((s%P)+P)%P;return m>=a&&m<=b;};
  /* les rives : pleines, et leurs nervures audio-tactiles (un pavé de 18 cm tous les 60 cm, débordant le trait, son ombre derrière) */
  for(const x of [g,d]){
    K.trait(x,{l:.2,c:B,op:.86});
    K.trait(x,{l:.5,c:B,op:.82,per:.6,on:.18,ombre:.14});}
  /* les plots JAUNES de la rive droite (le terre-plein), serrés et gros : rouges à contresens */
  K.plot(d-.7,{per:10,ph:5,c:JAU,c2:0xd8402e,l:.6,long:.6});
  /* LES ÉPISODES DE CONTINUITÉ : [début, fin, pas] dans la boucle ; i = 4 et 6 bordent la voie de la caisse (i = 5 au milieu),
     i = 1 = la bretelle d'entrée, décalée pour ne pas tomber toujours en même temps */
  /* (second regard, 2026-11-16 : à [300,1150] et [300,1250] la piste restait 47 % du temps sans signature, s = 1500 et 3000 = l'américaine
     sans cônes ; i = 4 et 6 décalés se relaient : au moins l'une des deux sur 1550 m de 1600, les deux ensemble sur [250,1300]) */
  const EPI={1:[1250,1750,2100],4:[0,1300,1600],6:[250,1550,1600]};
  for(let i=1;i<N;i++){const x=g+i*lw,e=EPI[i];
    if(e){
      K.trait(x,{l:function(s){return dans(s,e[0],e[1],e[2])?0:.15;},c:B,op:.84,per:12,on:3,ombre:1.2});
      K.trait(x,{l:function(s){return dans(s,e[0],e[1],e[2])?.36:0;},c:B,op:.92,per:6,on:1.2,ombre:.6});}
    else K.trait(x,{l:.15,c:B,op:.84,per:12,on:3,ombre:1.2});
    /* les plots blancs sur une séparation sur trois (2, 5, 8) : une ligne de plots coûte autant de sommets qu'un trait entier */
    if(i%3===2)K.plot(x,{per:24,ph:7.5,c:0xffffff,c2:0xd8402e,l:.28,long:.28});}
}});
