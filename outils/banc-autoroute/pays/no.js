/* ===== NORVÈGE — LA MOTORVEG (maquette du 2026-11-15, reprise le même jour : « la double jaune rappelle l'américaine », puis le 2026-11-16 : sillon renforcé, jaunes en quinconce, jalons plus hauts) =====
   Le vrai marquage (Statens vegvesen, håndbok N302 Vegoppmerking ; Lærebok vegoppmerking, rapport 452 — vérifiés : sur motorveg la
   kantlinje de GAUCHE est JAUNE, celle de droite BLANCHE ; le jaune dit « l'autre sens est de ce côté » ; la forsterket midtoppmerking
   (FMO) = deux lignes jaunes posées dans un sillon fraisé en sinus (nedfrest sinusrille) de 0,5 à 1 m, qui fait vibrer la voiture ; dans
   le sillon de 1 m, la paire peut être une varsellinje). Les pas, vérifiés (catalogue NVDB, au-dessus de 50 km/h) : kjørefeltlinje 3 m peints,
   9 m de vide ; varsellinje 9 m peints, 3 m de vide. Largeurs de mémoire : 15 cm pour les traits, 20 cm pour la kantlinje. Le long des routes, l'hiver : les brøytestikker, les jalons de
   déneigement orange plantés tous les ~50 m sur les deux bords.
   LA SIGNATURE : le SILLON — une bande sombre de 1,2 m (un voile noir léger sur toute la largeur, et dedans une échelle de barreaux fraisés
   serrés, bien noirs) — qui file à gauche de la caisse, avec sur ses lèvres des tirets jaunes courts EN QUINCONCE (jamais côte à côte) ;
   et, sur les deux rives, les grands jalons orange vif (3,2 m, bien plus hauts que les poteaux américains, et sans leur bande blanche).
   Libertés prises : la FMO sépare deux sens ; ici elle sépare deux moitiés d'une route à sens unique, un épisode d'environ 700 m qui revient
   tous les 1 000 m (toute la piste, en boucle) ; ses deux lignes jaunes sont des tirets COURTS (4 m peints, 8 m de vide, au lieu des 9+3 de
   la varsellinje), DÉCALÉS d'un demi-pas l'un par rapport à l'autre (sur la vraie route ils sont alignés) : la paire se lit en zigzag
   de part et d'autre de l'échelle sombre, jamais comme la double ligne jaune américaine ; les
   ondes du sillon sont des barreaux droits de 0,6 m ; les jalons mesurent 3,2 m (un peu plus que les vrais, pour la vue de jeu), tous les 32 m (davantage sur les pistes de plus de 6,2 km, pour rester sous 390 jalons), et portent une bague sombre au lieu du
   catadioptre. */
arPaysDef('no',{nom:'Norvège — motorveg',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,J=0xeec247,N=10,lw=(d-g)/N,xm=g+4*lw; /* xm : la séparation à gauche de la caisse, où se creuse le sillon */
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  /* les épisodes de FMO, en boucle sur toute la piste : dans chaque tour de P mètres, [annonce, ouverture, fermeture] */
  const P=1000,AN=140,OV=200,FE=820,OUV=60,APR=60,DEMI=.42,BORD=.2;
  const loc=function(sv){return ((sv%P)+P)%P;};
  const ou=function(sv){const u=loc(sv);return Math.min(lisse((u-OV)/OUV),lisse((FE+OUV-u)/OUV));};
  const brin=function(sv){const u=((sv%36)+36)%36;return Math.min(lisse(u/1.5),lisse((30-u)/1.5));}; /* le sillon par tronçons de 30 m, 6 m sans fraisage : jamais une bande sombre continue au loin */
  const dansSillon=function(sv){const u=loc(sv);return u>=OV+6&&u<=FE+OUV-4;};
  const annonce=function(sv){const u=loc(sv);return (u>=AN&&u<OV+6)||(u>FE+OUV-4&&u<=FE+OUV+APR);};
  /* les rives : jaune à gauche, blanche à droite */
  K.trait(g,{l:.2,c:J,op:.86});
  K.trait(d,{l:.2,c:B,op:.86});
  /* les séparations : kjørefeltlinje 3+9 */
  for(let i=1;i<N;i++){if(i===4)continue;K.trait(g+i*lw,{l:.15,c:B,op:.86,per:12,on:3});}
  /* la séparation xm : kjørefeltlinje hors des épisodes, varsellinje blanche (9+3) à l'approche et à la sortie */
  K.trait(xm,{l:function(sv){return dansSillon(sv)||annonce(sv)?0:.15;},c:B,op:.86,per:12,on:3});
  K.trait(xm,{l:function(sv){return annonce(sv)?.18:0;},c:B,op:.88,per:12,on:9});
  /* le sillon fraisé : une bande sombre d'un mètre, ses ondes en barreaux serrés de 0,6 m (la sinusrille) ; nulle hors des épisodes */
  K.fond(function(sv){return xm-(DEMI+BORD)*ou(sv)*brin(sv);},function(sv){return xm+(DEMI+BORD)*ou(sv)*brin(sv);},{c:K.NOIR,op:.24});
  K.fond(function(sv){return xm-(DEMI+BORD*.5)*ou(sv)*brin(sv);},function(sv){return xm+(DEMI+BORD*.5)*ou(sv)*brin(sv);},{c:K.NOIR,op:.62,per:.6,on:.36});
  /* ses deux lignes jaunes, sur les lèvres du sillon : tirets courts (4+8), en quinconce (la droite décalée d'un demi-pas) */
  K.trait(function(sv){return xm-DEMI*ou(sv);},{l:function(sv){return dansSillon(sv)?.14:0;},c:J,op:.84,per:12,on:4});
  K.trait(function(sv){return xm+DEMI*ou(sv);},{l:function(sv){return dansSillon(sv)?.14:0;},c:J,op:.84,per:12,on:4,ph:6});
  /* les brøytestikker : un grand jalon orange tous les 32 m sur chaque rive (plus espacés sur les très longues pistes : 390 jalons au plus), décalés d'un côté à l'autre */
  const PJ=Math.max(32,Math.ceil(2*K.L/390));
  K.poteaux(g,{per:PJ,c:0xff5a0a,c2:0x1a1714,h:3.2});
  K.poteaux(d,{per:PJ,c:0xff5a0a,c2:0x1a1714,h:3.2,s0:8+PJ*.5});
}});
