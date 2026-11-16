(async function(){const out={};const g=+((/[?&]pistegraine=(\d+)/.exec(location.search)||[])[1]||0);
const court=function(r){if(!r||typeof r!=='object')return r;return {barres:r.barres,enseignes:r.enseignes,portiques:r.portiques,ouvrages:r.ouvrages,plafonds:r.plafonds,couloirs:r.couloirs,parSource:r.parSource,ex:r.ex.slice(0,40)};};
try{out.p0=court(dbgVillePortiques());}catch(e){out.p0=String(e);}
for(const pal of [10,20]){try{const t=dbgTrace({graine:g,palier:pal});await new Promise(function(r){setTimeout(r,2500);});out['p'+pal]=Object.assign({L:Math.round(t.L),graineOk:t.graineOk},court(dbgVillePortiques()));}catch(e){out['p'+pal]=String(e);}}
return out;})()
