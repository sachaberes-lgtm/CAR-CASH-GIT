(async function(){const dort=ms=>new Promise(r=>setTimeout(r,ms));try{dbgAuto(true,0,{nit:0});}catch(e){}
const lt=[];try{new PerformanceObserver(function(l){for(const e of l.getEntries())lt.push(Math.round(e.duration));}).observe({entryTypes:['longtask']});}catch(e){}
let der=null;for(let k=0;k<60;k++){await dort(1000);const p=dbgPrebati();der=p;if(p.etat==='pret')break;}
lt.sort((a,b)=>b-a);const a=dbgJadeA();
return {etat:der.etat,carte:der.carte,cpu:der.cpu,images:der.images,ms:der.ms,pasLongs:der.pasLongs,err:der.err,tachesLongues:lt.slice(0,8),nTaches:lt.length,genMs:a.genMs,genMax:a.genMax||null,s:Math.round(dbgRoute().s),mort:dbgState&&dbgState().gameOver};})()
