(async function(){
  /* (2026-11-14, vérificateurs) LES APPELS DE DESSIN LE LONG DE LA ROUTE : la voiture posée à 6 abscisses (dbgJadeAller), la vue du conducteur (dbgJadeVue),
     puis pour chaque image figée : appels et triangles de l'IMAGE ENTIÈRE (renderer.info, scène sans post) et ms de tirage (dbgTemps, 20 images, bruitée).
     --auditfile de outils/banc-maps/banc.cjs gen ; même fichier sur wt-avant (crochets d'origine seulement). */
  const att=function(ms){return new Promise(function(r){setTimeout(r,ms);});},o=[];
  for(const s of [600,1600,2800,4000,5400,6800]){
    try{dbgJadeAller(s);await att(2500);dbgJadeVue();await att(400);const ms=dbgTemps(20),i=dbgScene().rdr.info.render;o.push([s,i.calls,Math.round(i.triangles/1000),ms]);}catch(e){o.push([s,'err '+e.message]);}}
  return JSON.stringify(o);})()
