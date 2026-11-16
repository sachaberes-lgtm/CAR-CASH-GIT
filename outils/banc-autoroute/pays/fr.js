/* ===== FRANCE — L'AUTOROUTE (maquette du 2026-11-15 ; reprise du même jour : chevrons en quinconce, îlot refermé en biseau, épisodes en boucle) =====
   Le vrai marquage (IISR, 7e partie ; u = 7,5 cm sur autoroute) : tout BLANC ; séparation des voies T1 (3 m peints, 10 m de vide) ;
   rive droite T4 (39 m peints, 13 m de vide : deux traits et un vide ≈ 91 m, « un trait danger, deux traits sécurité ») ; rive gauche
   continue ; zones de rappel des distances : des chevrons blancs, pointe vers l'avant (« deux chevrons sécurité ») ; sortie : ligne
   d'affectation T3 (3 m / 1,33 m), plus grasse, puis un îlot de zébras.
   LA SIGNATURE : la longue rive hachée à droite et, sur ~900 m, les chevrons blancs qui filent devant la caisse.
   Libertés prises :
     · les chevrons sont peints dans les deux voies du milieu (là où roule la caisse), pas dans celle de droite, et EN QUINCONCE : un seul
       chevron par rangée, qui saute d'une voie à l'autre tous les 14 m (chaque voie : un tous les 28 m). Jamais deux
       ni trois chevrons côte à côte : rien qui rappelle la plaque turbo (une dalle sombre bordée de rails d'or, chevrons d'or serrés tous
       les 2,25 m). Ici : blancs pâles, ouverts, sans cadre, très espacés ;
     · l'îlot de la sortie ne mène nulle part (la route ne se divise pas) : il s'ouvre, puis se REFERME EN BISEAU sur la séparation ;
       son bord gauche reste en T3 (pointillé serré) pour qu'il n'y ait qu'UNE ligne pleine à la fois (le bord droit, 150 m) ;
     · le tout revient en boucle tous les 3 200 m (chevrons à 380-1 300 m du cycle, sortie à 2 300-3 000 m), sans un trait de plus :
       les épisodes sont des LARGEURS qui s'annulent hors de leur fenêtre. */
arPaysDef('fr',{nom:'France — autoroute',plan:function(K){
  const g=K.g,d=K.d,B=0xf1efe8,N=10,lw=(d-g)/N,xs=d-lw,P=3200; /* xs : la séparation de la voie de droite ; P : le cycle des épisodes */
  const u=function(sv){return ((sv%P)+P)%P;};
  /* la sortie (dans le cycle) : T3 de S0 à S1, puis l'îlot de S1 à S2 (il s'ouvre en 65 m, se referme en biseau sur les 55 derniers) */
  const S0=2300,S1=2850,S2=3000;
  const t3=function(sv){const w=u(sv);return w>=S0&&w<S2;},ilot=function(sv){const w=u(sv);return w>=S1&&w<S2;};
  const ouv=function(sv){const w=u(sv)-S1;if(w<0||w>S2-S1)return 0;
    const a=Math.min(1,w/65),f=Math.min(1,(S2-S1-w)/55);return Math.min(a*a*(3-2*a),f)*2.4;};
  /* les rives : à gauche continue, à droite la T4 */
  K.trait(g,{l:.22,c:B,op:.86});
  K.trait(d,{l:.24,c:B,op:.88,per:52,on:39,ph:6});
  /* les séparations T1 ; la dernière passe en T3 à l'approche de la sortie et le long de l'îlot (bord gauche) */
  for(let i=1;i<N-1;i++)K.trait(g+i*lw,{l:.17,c:B,op:.86,per:13,on:3});
  K.trait(xs,{l:function(sv){return t3(sv)?0:.17;},c:B,op:.86,per:13,on:3});
  K.trait(function(sv){return ilot(sv)?xs-.1:xs;},{l:function(sv){return t3(sv)?.24:0;},c:B,op:.88,per:4.33,on:3});
  /* le bord droit de l'îlot, plein (150 m), qui revient sur la séparation en biseau, et ses zébras */
  K.trait(function(sv){return xs+.1+ouv(sv);},{l:function(sv){return ilot(sv)?.22:0;},c:B,op:.88});
  K.motif(xs+.25,function(sv){return ilot(sv)?xs+ouv(sv)-.05:xs+.25;},{type:'hachure',pas:4,ep:.7,pente:.8,c:B,op:.78});
  /* les chevrons de rappel des distances : en quinconce dans les voies 4 et 5, un par rangée tous les 14 m (pointe à s ≡ 0 mod 14,
     le saut de voie au milieu du vide, à s ≡ 7) */
  const zc=function(sv){const w=u(sv);return w>=300&&w<2100;},vc=function(sv){return g+(4+(Math.floor((sv+7)/14)&1))*lw;};
  K.motif(function(sv){return zc(sv)?vc(sv)+.65:0;},function(sv){return zc(sv)?vc(sv)+lw-.65:0;},{type:'chevron',pas:14,ep:.65,pente:-2.2,c:B,op:.5});
}});
