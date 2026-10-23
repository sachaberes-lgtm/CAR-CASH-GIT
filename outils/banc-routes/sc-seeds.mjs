/* scénario : cherche, dans le VRAI jeu, des graines d'orbite/nuages portant chaque figure — node jeu.mjs carte meteo 0 palier graine0 graine1 */
export default async function(H,[carte,meteo,_s,palier,g0,g1]){
  const out=[];for(let g=+g0;g<=+g1;g++){
    const r=await H.ev(`(function(){var t=dbgTrace({carte:'${carte}',meteo:'${meteo}',graine:${g},palier:${+palier||0}});var h=dbgHaut();return JSON.stringify({g:${g},L:t.L,ok:t.graineOk,on:h.on,zones:h.info&&h.info.zones&&h.info.zones.map(function(z){return z[0]+':'+z[1]+'-'+z[2];}),mods:t.mods.length});})()`).catch(e=>'ERR '+e.message);
    console.log(r);}
}
