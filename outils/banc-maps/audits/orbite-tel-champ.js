(async function(){const R=dbgRoute(),L=R.L,out=[];const dort=ms=>new Promise(r=>setTimeout(r,ms));try{dbgAuto(true);}catch(e){}
const fam={};
for(let k=1;k<=14;k++){const s=Math.round(L*k/15);dbgJadeAller(s);await dort(450);const c=dbgChamp();out.push([s,c.appels,Math.round(c.dessines/1000),Math.round(c.dansLeChamp/1000)]);
  for(const q of c.fam){const n=q.k.slice(0,30);fam[n]=Math.max(fam[n]||0,Math.round(q.dr/1000));}}
const tri=out.map(o=>o[2]).sort((a,b)=>a-b),ap=out.map(o=>o[1]).sort((a,b)=>a-b);
const top=Object.keys(fam).sort((a,b)=>fam[b]-fam[a]).slice(0,9).map(k=>k+':'+fam[k]);
const gen=[];for(const g of [21,22,23]){const t0=performance.now();let r=null;try{r=dbgGenRoute('espace',g,0);}catch(e){r={erreur:String(e)};}gen.push({g:g,total:Math.round(performance.now()-t0),gen:r&&r.ms,err:r&&r.erreur?String(r.erreur).slice(0,100):undefined});}
return {L:Math.round(L),triMed:tri[7],triMax:tri[13],apMed:ap[7],apMax:ap[13],pts:out.map(o=>o.join('/')).join(' '),pointeParFamille:top,piste:dbgPiste(),gen:gen};})()
