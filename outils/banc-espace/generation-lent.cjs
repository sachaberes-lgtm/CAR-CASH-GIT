/* compare deux séries (lent=1 / lent=8) : reprises, suites redites, qualité des routes refaites contre les autres */
const fs=require('fs');const lit=f=>fs.readFileSync(f,'utf8').trim().split('\n').map(JSON.parse);
for(const f of process.argv.slice(2)){const L=lit(f);for(const p of [20,27]){const R=L.filter(o=>o.p===p);const vus=new Map();let red=0;R.forEach((o,i)=>{const k=o.suite.join('>');if(vus.has(k))red++;vus.set(k,i);});
  const q=(X,k,fn)=>{const v=X.map(fn);return (v.reduce((a,b)=>a+b,0)/Math.max(1,v.length)).toFixed(1);};
  const ref=R.filter(o=>o.reprises>0),non=R.filter(o=>!(o.reprises>0));
  const roll=o=>Math.max(...Object.values(o.mods).map(m=>m.rollMax)),rv=o=>Math.min(...Object.values(o.mods).map(m=>m.rvMin)),t60=o=>Object.values(o.mods).reduce((a,m)=>a+m.t60,0),nm=o=>new Set(o.suite).size;
  console.log(f.split('/').pop(),'p'+p,'routes',R.length,'refaites',ref.length,'reprises moy',(R.reduce((a,o)=>a+o.reprises,0)/R.length).toFixed(1),'max',Math.max(...R.map(o=>o.reprises)),'suites redites',red,'| refaites / autres : roulis max moy',q(ref,0,roll),'/',q(non,0,roll),'· t>60°/s moy',q(ref,0,t60),'/',q(non,0,t60),'· Rv min moy',q(ref,0,rv),'/',q(non,0,rv),'· modules',q(ref,0,nm),'/',q(non,0,nm),'· ms méd',[...R.map(o=>o.ms)].sort((a,b)=>a-b)[R.length>>1]);}}
