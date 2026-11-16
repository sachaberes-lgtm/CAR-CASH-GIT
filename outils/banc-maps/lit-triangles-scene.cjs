const fs=require('fs'),path=require('path');
for(const d of fs.readdirSync('opt-gen').sort()){const f=fs.readdirSync(path.join('opt-gen',d)).find(x=>x.endsWith('.json'));if(!f){console.log(d,'(rien)');continue;}
const j=JSON.parse(fs.readFileSync(path.join('opt-gen',d,f),'utf8'));const a=j.map(g=>g.perso).filter(x=>x&&typeof x==='object');
const moy=k=>a.length?Math.round(a.reduce((s,x)=>s+x[k],0)/a.length):'-';
console.log(d.padEnd(20),'n',a.length,'calls',moy('calls'),'tri',moy('tri'),'geo',moy('geo'),'tex',moy('tex'),'sceneTri',moy('sceneTri'),'mesh',moy('mesh'),'constr',Math.round(j.reduce((s,g)=>s+((g.constr||[]).filter(c=>c.etape==='fin').reduce((a,c)=>a+c.ms,0)),0)/j.length),'L',Math.round(j.reduce((s,g)=>s+(g.L||0),0)/j.length),'err',j.map(g=>(g.erreurs||[]).length).join(''));}
