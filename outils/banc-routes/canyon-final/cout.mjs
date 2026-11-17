/* LE COÛT DU CANYON (2026-11-17) : compteurs DÉTERMINISTES du rendu (pas des temps), téléphone (?tel=1), mêmes vues avant/après.
   node outils/banc-routes/canyon-final/pilote.mjs outils/banc-routes/canyon-final/cout.mjs graines=3,7,11 [meteo=matin] [q=sans=…] out=fichier.json
   Par graine : 12 vues figées réparties sur la route (l'œil du joueur, dbgCanyonVoute('vueS')) → appels de dessin, triangles ; puis la mémoire du renderer
   (géométries, textures, programmes), les pièces du canyon (dbgCanyon('pieces') : triangles par pièce), les nœuds du relief, et les tâches longues relevées par
   le navigateur pendant le chargement et la pose (indicatif : dépend de la charge de la machine ; `ms` du canyon aussi). */
import fs from 'node:fs';import path from 'node:path';
export default async function(api,a){
  const tout={};
  await api.cdp('Page.addScriptToEvaluateOnNewDocument',{source:"window.__lt=[];try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){window.__lt.push(Math.round(e.duration));});}).observe({entryTypes:['longtask']});}catch(e){}"});
  for(const g of String(a.graines||'3,7,11').split(',')){
    await api.charger({graine:+g,meteo:a.meteo||'matin',q:a.q||'',attente:4});
    const r=await api.ev(`(function(){const R=dbgScene().rdr,L=dbgRoute().L,vues=[];let ap=0,tr=0,apMax=0,trMax=0;
      try{dbgCanyon('reprendre');dbgJadeAller(400);}catch(e){} /* la caisse au même endroit à chaque mesure : le décor posé autour d'elle (segments, instances) est le même d'un lancement à l'autre */
      const auto0=R.info.autoReset;R.info.autoReset=false; /* le compteur cumulé sur TOUTES les passes de l'image (ombres, scène, post-traitement) : remis à zéro à la main */
      for(let k=1;k<=12;k++){const s9=Math.round(L*k/13);dbgCanyonVoute('vueS',s9);R.info.reset();dbgCanyonVoute('vueS',s9);const i=R.info.render;vues.push([s9,i.calls,i.triangles]);ap+=i.calls;tr+=i.triangles;apMax=Math.max(apMax,i.calls);trMax=Math.max(trMax,i.triangles);}
      R.info.autoReset=auto0;const P=dbgCanyon('pieces'),D=dbgCanyon();let triDeco=0;for(const p of P.pieces)triDeco+=p[3];
      return {L:Math.round(L),appels:ap,triangles:tr,appelsMax:apMax,trianglesMax:trMax,geometries:R.info.memory.geometries,textures:R.info.memory.textures,programmes:R.info.programs?R.info.programs.length:null,
        noeuds:P.terrain.noeuds,grille:P.terrain.grille,triRelief:P.terrain.tri,pieces:P.pieces.length,triDecor:triDeco,texCanyon:P.textures,ms:D.ms,tachesLongues:(window.__lt||[]).slice(),vues:vues};})()`,120000);
    tout[g]=r;api.log('g'+g,'appels',r.appels,'(max '+r.appelsMax+')','triangles',r.triangles,'(max '+r.trianglesMax+')','géom',r.geometries,'tex',r.textures,'prog',r.programmes,'nœuds',r.noeuds,'tri décor',r.triDecor,'pose ms',r.ms&&r.ms.total,'tâches longues',JSON.stringify(r.tachesLongues));}
  if(a.out){fs.mkdirSync(path.dirname(path.resolve(a.out)),{recursive:true});fs.writeFileSync(a.out,JSON.stringify(tout,null,1));}
}
