/* ===== CORÉE DU SUD — LE GYEONGBU (maquette du 2026-11-15) =====
   Le vrai marquage : lignes de voie BLANCHES en tirets de 10 m pour 10 m de vide (autoroutes coréennes), 15-20 cm ; rive droite blanche
   pleine ; rive gauche (côté terre-plein) JAUNE pleine ; la voie de gauche du Gyeongbu est la voie de BUS (버스전용차로), séparée par une
   ligne BLEUE et marquée « 버스전용 » au sol ; et la marque coréenne : les LIGNES DE GUIDAGE COLORÉES (노면색깔유도선, loi : règlement
   d'application du code de la route, annexe 6 ; manuel du ministère, 2017) : une ligne ROSE et une ligne VERTE (vert clair) peintes AU
   MILIEU des voies avant un échangeur ou une bifurcation, qui s'écartent chacune vers sa branche. Couleurs vérifiées (law.go.kr, presse) ;
   largeur des lignes de guidage et motif de la ligne bleue de mémoire (≈ 45 cm ; bleu en tirets au rythme des voies).
   LA SIGNATURE : par épisodes, deux lignes rose et verte côte à côte au milieu des voies, qui se séparent en Y ; en permanence, les longs
   tirets 10/10 et le liseré bleu de la voie de bus. */
arPaysDef('kr',{nom:'Corée du Sud — Gyeongbu',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,B=0xf1efe8,J=0xeec23c,BLEU=0x3f86e8,ROSE=0xe4639c,VERT=0x6cc184;
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  /* les rives : jaune à gauche (terre-plein), blanche à droite */
  K.trait(g,{l:.22,c:J,op:.86});
  K.trait(d,{l:.22,c:B,op:.86});
  /* les séparations : la première (la voie de bus) en bleu, les autres en blanc ; 10 m peints, 10 m de vide ; un plot au milieu du vide */
  for(let i=1;i<N;i++){const x=g+i*lw;
    K.trait(x,{l:i===1?.22:.18,c:i===1?BLEU:B,op:.86,per:20,on:10,ombre:i===1?0:1.2});
    K.plot(x,{per:20,ph:15,c:0xf4f2ea,c2:0xf4f2ea});}
  /* la voie de bus : « 버스전용 », un tous les ~650 m */
  K.texte('bus','버스전용',{police:'sans-serif',gras:true,taille:52});
  for(let s=500;s<K.L-200;s+=650)K.decal(s,g+lw*.5,{d:'bus',l:1.7,long:7.5,c:0xeef0f4,op:.8});
  /* LES LIGNES DE GUIDAGE : un épisode = [début, point où elles s'écartent, fin, voie de départ du vert, sens] ;
     le vert et le rose partent côte à côte (deux voies voisines), puis chacun glisse de deux voies vers sa branche */
  const EP=[[380,450,730,4,1],[2380,2450,2730,5,-1],[4300,4370,4650,3,1]];
  const guide=function(rose){return {x:function(s){for(const e of EP)if(s>=e[0]-1&&s<=e[2]+1){
        const v=e[3]+(rose?(e[4]>0?1:0):(e[4]>0?0:1)),x0=g+(v+.5)*lw,sens=(rose?1:-1)*e[4];
        return x0+sens*2*lw*lisse((s-e[1])/150);}return 0;},
      l:function(s){for(const e of EP)if(s>=e[0]&&s<=e[2])return .25*Math.min(lisse((s-e[0])/10),lisse((e[2]-s)/24));return 0;}};};
  const gr=guide(true),gv=guide(false);
  K.trait(gr.x,{l:gr.l,c:ROSE,op:.5});
  K.trait(gv.x,{l:gv.l,c:VERT,op:.48});
}});
