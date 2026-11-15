/* (2026-11-14, optimiseur de Jade, banc) LES FAMILLES DESSINÉES dans l'image courante : pour chacune, son gabarit (retrouvé par son tampon d'indices, partagé
   avec le gabarit), son niveau de détail, ses bandes, verre (3 appels) ou opaque (1), ses exemplaires et ses triangles. Glissé par sonde-tel.cjs (INJECTE). */
window.dbgJadeFamVis=function(){const P=(JADE.geos&&JADE.geos.p)||[],ix=new Map();
  P.forEach(function(T9,t){if(!T9)return;(T9.geo||[]).forEach(function(g,j){if(g&&g.index)ix.set(g.index,[t,j]);});if(T9.fin&&T9.fin.index)ix.set(T9.fin.index,[t,'fin']);});
  const o=[];for(const F of JADE.fam){if(!F.im.visible||!F.im.count)continue;const k=ix.get(F.im.geometry.index)||['?','?'];o.push([k[0],k[1],F.b0+'-'+F.b1,F.im2&&F.im2.visible?3:1,F.im.count,Math.round(F.im.count*F.tri)]);}
  for(const FF of (FIN.fam||[]))if(FF&&FF.im.visible&&FF.im.count)o.push([FF.t,'fin','fin',3,FF.im.count,Math.round(FF.im.count*FF.tri)]);
  return o;};
