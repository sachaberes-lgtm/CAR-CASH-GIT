(async function(){const dort=ms=>new Promise(r=>setTimeout(r,ms));let att=0;for(;att<60;att++){const st=dbgState();if(st.started&&!st.gameOver)break;await dort(1000);}
try{dbgSable(true);}catch(e){}try{dbgAuto(true);}catch(e){}await dort(1500);
const R=dbgRoute(),L=R.L,out=[],fam={},ret=[];
for(let k=1;k<=14;k++){const s=Math.round(L*k/15);ret.push(dbgJadeAller(s));await dort(600);const c=dbgChamp();out.push([Math.round(dbgRoute().s),c.appels,Math.round(c.dessines/1000)]);
  for(const q of c.fam){const n=q.k.slice(0,30);fam[n]=Math.max(fam[n]||0,Math.round(q.dr/1000));}}
const tri=out.map(o=>o[2]).sort((a,b)=>a-b),ap=out.map(o=>o[1]).sort((a,b)=>a-b);
const top=Object.keys(fam).sort((a,b)=>fam[b]-fam[a]).slice(0,7).map(k=>k+':'+fam[k]);const st=dbgState();
return {attente:att,L:Math.round(L),triMed:tri[7],triMax:tri[13],apMed:ap[7],apMax:ap[13],pts:out.map(o=>o.join('/')).join(' '),retours:ret.filter(x=>x==='non').length,fin:{started:st.started,gameOver:st.gameOver},pointeParFamille:top,piste:dbgPiste()};})()
