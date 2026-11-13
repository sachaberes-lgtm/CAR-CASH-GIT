(async function(){const R=dbgRoute(),L=R.L,out=[];const dort=ms=>new Promise(r=>setTimeout(r,ms));try{dbgAuto(true);}catch(e){}
for(let k=1;k<=14;k++){const s=Math.round(L*k/15);const r=dbgJadeAller(s);await dort(450);const c=dbgChamp();out.push([s,c.appels,Math.round(c.dessines/1000),Math.round(c.dansLeChamp/1000),r]);}
const tri=out.map(o=>o[2]).sort((a,b)=>a-b),ap=out.map(o=>o[1]).sort((a,b)=>a-b);
return {triMed:tri[7],triMax:tri[13],apMed:ap[7],apMax:ap[13],pts:out.map(o=>o.slice(0,4).join('/')).join(' '),scenes:(dbgJadeA().scenes||[]).join(',')};})()
