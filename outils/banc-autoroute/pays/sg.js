/* ===== SINGAPOUR — L'EXPRESSWAY (maquette du 2026-11-15) =====
   Le vrai marquage (LTA, Standard Details of Road Elements, chap. 8 « Road Markings » ; les cotes de l'expressway n'ont pas pu être lues
   dans le PDF, elles sont donc de mémoire ou estimées) : lignes de voie BLANCHES en tirets, réservées à l'expressway (les autres routes
   ont des tirets de 2 m tous les 6 m, 10 cm) ; une ligne JAUNE CONTINUE le long de l'accotement, à côté de la voie lente ; une rive
   blanche continue le long du terre-plein (20 cm) ; on roule à GAUCHE : la voie lente et les sorties sont à GAUCHE. Aux sorties : les
   voies qui partent sont bordées d'un trait plus gras, puis un îlot de CHEVRONS blancs (pointe vers le conducteur) ; sur la bretelle,
   des BARRES JAUNES transversales pour faire ralentir (de plus en plus serrées en vrai ; ici un pas fixe de 10 m) ; et le nom de l'expressway où mène la voie, peint au sol
   (« PIE », « CTE », « AYE »…).
   La voie de bus rouge (la piste proposée) n'existe PAS sur les expressways (seulement sur les grandes artères) : écartée.
   LA SIGNATURE : la rive JAUNE à gauche, et par épisodes une sortie à deux voies à gauche : barres jaunes en travers des voies
   qui partent, chevrons de l'îlot, et les trois lettres des expressways peintes dans les voies.
   Liberté prise : l'îlot se referme après la sortie (les voies reviennent, une insertion) : la route du jeu garde sa largeur. */
arPaysDef('sg',{nom:'Singapour — expressway',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,B=0xf1efe8,J=0xeeb326,xs=g+3*lw; /* xs : la séparation entre les trois voies qui sortent et les autres */
  /* les rives : jaune à gauche (l'accotement), blanche à droite (le terre-plein) */
  K.trait(g,{l:.22,c:J,op:.88});
  K.trait(d,{l:.2,c:B,op:.86});
  /* les sorties : a = début du trait gras, b = l'îlot s'ouvre, c = ouvert jusqu'à, e = refermé ; m1, m2 : les noms peints */
  const SO=[{a:370,b:440,c:640,e:720,m1:'PIE',m2:'CTE'},{a:3250,b:3320,c:3520,e:3600,m1:'AYE',m2:'ECP'}];
  const ep=function(sv){for(const e of SO)if(sv>=e.a&&sv<=e.e)return e;return null;};
  const ouv=function(sv){const e=ep(sv);if(!e||sv<e.b)return 0;
    const t=sv<e.c?Math.min(1,(sv-e.b)/80):Math.max(0,(e.e-sv)/80);return t*t*(3-2*t)*3.4;};
  const xa=function(sv){return xs-ouv(sv)*.5;},xb=function(sv){return xs+ouv(sv)*.5;};
  /* les séparations : tirets de 4 m tous les 10 m (estimés) ; celle des voies qui sortiront devient grasse puis s'ouvre en îlot */
  for(let i=1;i<N;i++){if(i!==3)K.trait(g+i*lw,{l:.16,c:B,op:.86,per:10,on:4});}
  let s9=0;
  for(const e of SO){
    K.trait(xs,{l:.16,c:B,op:.86,per:10,on:4,s0:s9,s1:e.a});
    K.trait(xs,{l:.3,c:B,op:.88,per:9,on:6,s0:e.a,s1:e.b}); /* le trait gras des voies qui partent */
    K.trait(xa,{l:.2,c:B,op:.88,s0:e.b,s1:e.e});
    K.trait(xb,{l:.2,c:B,op:.88,s0:e.b,s1:e.e});
    s9=e.e;}
  K.trait(xs,{l:.16,c:B,op:.86,per:10,on:4,s0:s9});
  /* l'îlot de chevrons (une seule nappe pour toutes les sorties : nulle hors des épisodes) */
  K.motif(function(sv){return ouv(sv)>.9?xa(sv)+.3:xs;},function(sv){return ouv(sv)>.9?xb(sv)-.3:xs;},{type:'chevron',pas:7,ep:.5,pente:1.6,c:B,op:.72});
  /* les barres jaunes de ralentissement, dans chacune des trois voies qui partent (une nappe par voie, nulle hors des épisodes) :
     une barre tous les 10 m, de l'approche de l'îlot jusqu'à sa pleine ouverture */
  const dans=function(sv){const e=ep(sv);return !!e&&sv>=e.b-50&&sv<e.c;};
  K.motif(g+.6,function(sv){return dans(sv)?g+lw-.5:g+.6;},{type:'hachure',pas:10,ep:.3,pente:0,c:J,op:.7});
  K.motif(g+lw+.5,function(sv){return dans(sv)?g+2*lw-.5:g+lw+.5;},{type:'hachure',pas:10,ep:.3,pente:0,c:J,op:.7});
  K.motif(g+2*lw+.5,function(sv){return dans(sv)?xa(sv)-.5:g+2*lw+.5;},{type:'hachure',pas:10,ep:.3,pente:0,c:J,op:.7});
  /* les noms : dans une voie qui sort, et dans la voie qui continue juste à droite de l'îlot (hors de la file de pièces) */
  for(const e of SO){K.texte(e.m1,e.m1,{taille:64});K.texte(e.m2,e.m2,{taille:64});
    K.decal(e.b+45,g+lw*1.5,{d:e.m1,l:2,long:14,c:B,op:.82});
    K.decal(e.b+20,g+lw*3.6,{d:e.m2,l:1.7,long:14,c:B,op:.82});}
}});
