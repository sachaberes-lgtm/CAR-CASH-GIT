/* (2026-11-11) le climax est-il bien JOUÉ (zone de figure retenue par pisteTord) ? node climax.cjs [paliers=0,5,10,20] [graines=1-40] */
const B=require('./charge.cjs');const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const PAL=(arg('paliers')||'0,5,10,20').split(',').map(Number),[g0,g1]=(arg('graines')||'1-40').split('-').map(Number);
for(const c of ['nuages','espace'])for(const p of PAL){let n=0,joue=0,sans=0,dur=[];
  for(let g=g0;g<=g1;g++){const r=B.piste(c,g,p);n++;const z=(r.info.zones||[]).find(z=>z[0]==='surf'||z[0]==='couloir');if(!z){sans++;continue;}if(z[5])joue++;dur.push((z[2]-z[1])/r.vw);}
  console.log(c.padEnd(7),'p'+String(p).padEnd(3),'routes',n,'climax joué',joue,'à plat',n-joue-sans,'absent',sans,'durée moy (s)',(dur.reduce((a,b)=>a+b,0)/Math.max(1,dur.length)).toFixed(1));}
