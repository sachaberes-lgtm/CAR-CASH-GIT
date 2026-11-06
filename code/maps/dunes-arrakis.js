/* ===== ARRAKIS — LES NOUVEAUX MODÈLES (2026-11-05, Sacha : « enlève le délire Égypte… une inspiration Arrakis dans Dune : des dunes énormes, contemplatives, spectaculaires ») =====
   On enlève le pharaon, le grand sphinx et les pyramides de Gizeh de la ROUTE (dunes-4.js ne les appelle plus — leurs fichiers restent, mais morts : rien ne les invoque) et on les
   remplace par trois nouveaux modèles, dans la même boîte à outils (`dnKit`, voir dunes-3.js) : LE MONOLITHE (un rocher dressé, érodé par le vent, en strates de grès et de granit —
   remplace l'obélisque sur la route et au bord des crêtes, MÊME convention d'échelle : base 8 m, haut 64 m, pour qu'aucun appel ne change), LE ROCHER (une butte-aiguille irrégulière,
   demi-base 1, haut ~1 — remplace les pyramides tirées au hasard et la rangée de « reines », même convention que `pyrGiza`) et LA MAISON DU DÉSERT (trois variantes, un petit cube de
   pisé tassé, un auvent de tôle posé de travers, une porte sombre décentrée — « à l'arrache » : rien n'est d'équerre). Aucune glyphe, aucun or, aucun lapis : juste la pierre, le grès et
   la rouille — la palette `DN_COL`, sans ses teintes précieuses. */
function dnMaisonKit(sd,w,d,h,pr){const g=dnKit(sd),C=DN_COL,rz=pr; // pr : 1 penche vers +x, -1 vers -x (le pan de toit jamais droit)
  g.box(0,0,0,w*1.1,.22,d*1.08,C.gres2,1,1);                                                                 // la plate-forme de terre tassée
  g.box(pr*w*.03,.22,0,w,h,d,C.terre,1,1);                                                                   // les murs de pisé, un peu de biais
  g.box(0,.22,d*.5+.03,w*.26,h*.58,.07,C.noir,0);                                                            // la porte sombre, décentrée
  g.box(-pr*w*.30,.22+h*.60,-d*.5-.025,.42,.40,.06,C.os,0);                                                  // une fenêtre grossière, jamais au milieu
  const ry=.22+h,rh=h*.34;
  g.box(pr*w*.06,ry+rh*.42,0,w*1.22,rh*.16,d*1.22,C.gres,0,1);                                               // le pan de toit : de la tôle (ou des roseaux) posés de travers, jamais plat
  g.box(w*.5-.22,ry,0,.30,rh,d*.74,C.granit,0);g.box(-w*.5+.22,ry,0,.30,rh,d*.74,C.granit,0);                // deux poteaux grossiers qui le tiennent
  g.tube([pr*w*.36,ry+rh*.5,-d*.42],[pr*w*.36+pr*1.1,ry+rh*.5+.5,-d*.1],.07,.05,5,[.30,.27,.24],0);           // un bout d'antenne / de perche qui dépasse, tordu
  return g.fin();}
Object.assign(DN_MOD,{
  // LA MAISON DU DÉSERT (trois tailles, une porte et une fenêtre jamais au même endroit : « à l'arrache »)
  maisonDesert1:function(){return dnMaisonKit(151,5.0,4.2,2.3,1);},
  maisonDesert2:function(){return dnMaisonKit(152,6.4,4.8,2.6,-1);},
  maisonDesert3:function(){return dnMaisonKit(153,4.3,5.6,2.1,1);},
  // LE MONOLITHE (remplace l'obélisque : base 8 m, haut 64 m) — un rocher dressé, les strates tordues par le vent, le sommet cassé net
  monolithe:function(){const g=dnKit(161),C=DN_COL,b=4,h=64,
      W=[2.0,1.55,1.5,1.0,.9,.5,.30,0],D=[1.65,1.3,1.42,.80,.92,.42,.24,0],
      OX=[0,.24,-.16,.32,-.24,.18,-.10],OZ=[0,-.13,.22,-.19,.15,-.21,.11],
      COL=[C.gres,C.granit,C.terre,C.granit,C.gres2,C.terre,C.granit];
    g.box(0,0,0,4.3*b,.5*b,3.8*b,C.gres2,1,1);
    let y=.5*b;const N=W.length-1,seg=(h-.5*b)/N;
    for(let i=0;i<N;i++){const y1=y+seg;g.frus(0,y,0,W[i]*b,D[i]*b,W[i+1]*b,D[i+1]*b,seg,COL[i],2,OX[i]*b*.5,OZ[i]*b*.5,0,.07);y=y1;}
    g.box(OX[N-1]*b*.4,h-seg*.6,OZ[N-1]*b*.4,.46*b,.5*b,.38*b,C.noir,0);                                      // l'ombre de la cassure, au sommet brisé (pas de pointe : le vent a eu le dessus)
    return g.fin();},
  // LE ROCHER D'ARRAKIS (demi-base 1, haut ~1 — remplace les pyramides : une aiguille de grès à degrés irréguliers, jamais deux faces pareilles)
  rocherArrakis:function(){const g=dnKit(171),C=DN_COL,
      W=[1,.80,.84,.52,.58,.30,.14,0],H=[0,.13,.29,.41,.59,.73,.90,1],
      OX=[0,.23,-.17,.33,-.20,.14],OZ=[0,-.14,.24,-.19,.17,-.11],
      COL=[C.gres,C.terre,C.granit,C.terre,C.gres2,C.granit,C.terre];
    g.box(0,0,0,2.3,.02,2.3,C.gres2,1,1);
    for(let i=0;i<W.length-1;i++){const y0=H[i],y1=H[i+1],w0=W[i]*2,w1=W[i+1]*2,ox=i<OX.length?OX[i]*.5:0,oz=i<OZ.length?OZ[i]*.5:0;
      g.frus(0,y0,0,w0,w0*.84,w1,w1*.84,y1-y0,COL[i%COL.length],2,ox,oz,0,.06);}
    return g.fin();},
  // LE ROCHER JUMEAU (une variante plus trapue, pour qu'un couple de rochers ne se répète pas) — même convention
  rocherArrakis2:function(){const g=dnKit(173),C=DN_COL,
      W=[1,.70,.74,.62,.40,.20,0],H=[0,.18,.34,.52,.70,.87,1],
      OX=[0,-.22,.18,-.28,.16],OZ=[0,.16,-.20,.14,-.18],
      COL=[C.terre,C.gres,C.granit,C.gres2,C.terre,C.granit];
    g.box(0,0,0,2.3,.02,2.3,C.gres2,1,1);
    for(let i=0;i<W.length-1;i++){const y0=H[i],y1=H[i+1],w0=W[i]*2,w1=W[i+1]*2,ox=i<OX.length?OX[i]*.5:0,oz=i<OZ.length?OZ[i]*.5:0;
      g.frus(0,y0,0,w0,w0*.90,w1,w1*.90,y1-y0,COL[i%COL.length],2,ox,oz,0,.06);}
    return g.fin();}});
Object.assign(DN_ECH,{maisonDesert1:5,maisonDesert2:6,maisonDesert3:5,monolithe:40,rocherArrakis:30,rocherArrakis2:30});
function dnMaisonNom(i){return 'maisonDesert'+(1+(i%3));}
function dnRocherNom(i){return i&1?'rocherArrakis2':'rocherArrakis';}
function dnTeteNom(p){return Math.abs(Math.floor(p.x*.173+p.z*.291))&1?'rocherArrakis2':'rocherArrakis';} // les éclats de roche des éboulis et des ruines : un rocher érodé (le même nom que celui qui servait aux têtes de colosses avant l'inspiration Arrakis)
