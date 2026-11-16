/* ===== CORÉE DU SUD — LE GYEONGBU (maquette du 2026-11-15, revue le même jour) =====
   Le vrai marquage : lignes de voie BLANCHES en tirets de 10 m pour 10 m de vide (autoroutes coréennes), 15-20 cm ; rive droite blanche
   pleine ; rive gauche (côté terre-plein) JAUNE pleine ; la voie de gauche du Gyeongbu est la voie de BUS (버스전용차로), séparée par une
   ligne BLEUE et marquée « 버스전용 » au sol ; et la marque coréenne : les LIGNES DE GUIDAGE COLORÉES (노면색깔유도선, loi : règlement
   d'application du code de la route, annexe 6 ; manuel du ministère, 2017) : une ligne ROSE et une ligne VERTE (vert clair) peintes AU
   MILIEU des voies avant un échangeur ou une bifurcation, qui s'écartent chacune vers sa branche. Couleurs vérifiées (law.go.kr, presse) ;
   largeur des lignes de guidage et motif de la ligne bleue de mémoire (≈ 45 cm ; bleu en tirets au rythme des voies).
   LA SIGNATURE : par épisodes, deux lignes rose et verte côte à côte au milieu des voies, qui se séparent en Y ; en permanence, les longs
   tirets 10/10 et le liseré bleu de la voie de bus.
   LIBERTÉS PRISES : les vraies lignes de guidage sont PLEINES ; ici elles sont en LONGS TIRETS (11 m peints, 7 m de vide), le rose et le
   vert décalés d'un demi-pas, plus étroites (15 cm) et plus pâles (opacité .25-.28, ×1,5 la nuit car le moteur les assombrit), pour rester
   la marque du pays sans devenir l'objet le plus voyant de l'image ; épisodes de 350 m tous les 950 m sur toute la piste (le premier dans
   la fenêtre du banc). Second regard : à 1 900 m, 1 550 m sans signature (s=1500, s=3000 : rien que le liseré bleu) ; la nuit, en grotte,
   la double atténuation les effaçait.
   Revue : les deux lignes de guidage étaient pleines, larges et vives près de la caisse (la moins discrète du lot) : longs tirets, pâles,
   fines ; 22 rubans et 182 000 sommets au canyon : les plots seulement sur une séparation sur trois (3 lignes au lieu de 9). */
arPaysDef('kr',{nom:'Corée du Sud — Gyeongbu',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,B=0xf1efe8,J=0xeec23c,BLEU=0x3f86e8,ROSE=0xdc78a8,VERT=0x7cc690;
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  /* les rives : jaune à gauche (terre-plein), blanche à droite */
  K.trait(g,{l:.22,c:J,op:.86});
  K.trait(d,{l:.22,c:B,op:.86});
  /* les séparations : la première (la voie de bus) en bleu, les autres en blanc ; 10 m peints, 10 m de vide ;
     un plot au milieu du vide, sur une séparation sur trois */
  for(let i=1;i<N;i++){const x=g+i*lw;
    K.trait(x,{l:i===1?.22:.18,c:i===1?BLEU:B,op:.86,per:20,on:10,ombre:i===1?0:1.2});
    if(i%3===0)K.plot(x,{per:20,ph:15,c:0xf4f2ea,c2:0xf4f2ea});}
  /* la voie de bus : « 버스전용 », un tous les ~650 m (au plus 28) */
  K.texte('bus','버스전용',{police:'sans-serif',gras:true,taille:52});
  for(let s=500,n=0;s<K.L-200&&n<28;s+=650,n++)K.decal(s,g+lw*.5,{d:'bus',l:1.7,long:7.5,c:0xeef0f4,op:.8});
  /* LES LIGNES DE GUIDAGE : un épisode tous les 950 m = [début, point où elles s'écartent, fin, voie de départ du vert, sens] ;
     le vert et le rose partent côte à côte (deux voies voisines), puis chacun glisse de deux voies vers sa branche */
  const EP=[],VO=[4,5,3],SE=[1,-1,1];
  for(let s=380,k=0;s<K.L-400;s+=950,k++)EP.push([s,s+70,s+350,VO[k%3],SE[k%3]]);
  const guide=function(rose){return {x:function(s){for(const e of EP)if(s>=e[0]-1&&s<=e[2]+1){
        const v=e[3]+(rose?(e[4]>0?1:0):(e[4]>0?0:1)),x0=g+(v+.5)*lw,sens=(rose?1:-1)*e[4];
        return x0+sens*2*lw*lisse((s-e[1])/150);}return 0;},
      l:function(s){for(const e of EP)if(s>=e[0]&&s<=e[2])return .15*Math.min(lisse((s-e[0])/10),lisse((e[2]-s)/24));return 0;}};};
  const gr=guide(true),gv=guide(false),nu=1+.5*(K.nuit||0); /* revue du second regard : le moteur assombrit déjà la couleur la nuit (x.6) ; atténuées en plus, elles disparaissaient en grotte : on compense */
  K.trait(gr.x,{l:gr.l,c:ROSE,op:.25*nu,per:18,on:11});
  K.trait(gv.x,{l:gv.l,c:VERT,op:.28*nu,per:18,on:11,ph:9});
}});
