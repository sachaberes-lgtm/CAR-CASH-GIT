/* analyse des JSON de toutes.mjs : node analyse-lots.cjs DOSSIER [DOSSIER…] → résumé par map×palier + valeurs hors norme + erreurs */
const fs=require('fs'),path=require('path');
const rows=[];const err=[];
for(const dir of process.argv.slice(2))for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.json'))){
  const m=f.match(/^(\w+)-p(\d+)-g(\d+)\.json$/);if(!m)continue;let o;try{o=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));}catch(e){err.push([f,'JSON illisible']);continue;}
  if(o.erreur){err.push([f,o.erreur.split('\n').slice(0,3).join(' | ')]);continue;}
  const F=o.fiche;let nan=0;for(const k in F)if(typeof F[k]==='number'&&!isFinite(F[k]))nan++;
  for(const a of o.ctrl)for(const v of a)if(!isFinite(v))nan++;
  rows.push({carte:m[1],pal:+m[2],g:+m[3],L:F.L,s:F.s,vir:F.virKm,infr:F.infr,coudes:F.coudes,cretes:F.cretes,p95:+F.penteP95,rMin:parseFloat(F.rMinRP),dou:F.douilles,zig:F.zigzags,hors:F.horsEndroit,note:o.note,ms:o.ms,ess:o.rythme&&o.rythme.n,droiteS:F.droiteS,dF:F.droitesFPart,nan,ct:o.info&&o.info.contacts,vril:o.info&&o.info.vrilles,essTord:o.info&&o.info.essai,nctrl:o.ctrl.length,f:dir.split('/').pop()+'/'+f});
}
const q=(a,p)=>{a=a.slice().sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.floor(p*a.length))];};
console.log('routes',rows.length,'erreurs',err.length);for(const e of err.slice(0,40))console.log('ERR',e[0],e[1].slice(0,300));
const cartes=[...new Set(rows.map(r=>r.carte))];
for(const c of cartes)for(const p of [0,10,20]){const R=rows.filter(r=>r.carte===c&&r.pal===p);if(!R.length)continue;
  const col=k=>R.map(r=>r[k]).filter(x=>x!=null&&isFinite(x));const mean=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length):0;
  console.log(c.padEnd(8),'p'+p,'n',R.length,'L',Math.round(mean(col('L'))),'[',Math.min(...col('L')),Math.max(...col('L')),'] vir',mean(col('vir')).toFixed(1),'infr>0',R.filter(r=>r.infr>0).length,'coudes>0',R.filter(r=>r.coudes>0).length,'cretes>0',R.filter(r=>r.cretes>0).length,'dou>0',R.filter(r=>r.dou>0).length,'zig>0',R.filter(r=>r.zig>0).length,'hors max',Math.max(...col('hors')).toFixed(2),'note moy',mean(col('note')).toFixed(1),'p95',q(col('note'),.95).toFixed(1),'max',Math.max(...col('note')).toFixed(1),'ms moy',mean(col('ms')).toFixed(0),'p95',q(col('ms'),.95).toFixed(0),'max',Math.max(...col('ms')).toFixed(0),'rMin min',Math.min(...col('rMin')).toFixed(2),'pente p95 max',Math.max(...col('p95')).toFixed(2),'nan',R.reduce((a,r)=>a+r.nan,0),'contacts>0',R.filter(r=>r.ct>0).length);}
fs.writeFileSync(process.env.SORTIE||'/dev/null',JSON.stringify(rows));
