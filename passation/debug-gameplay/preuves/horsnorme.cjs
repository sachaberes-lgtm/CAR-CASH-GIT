/* valeurs hors norme par map×palier à partir de rows.json (sortie de analyse-lots.cjs) : node horsnorme.cjs rows.json */
const R=JSON.parse(require('fs').readFileSync(process.argv[2],'utf8'));
const med=a=>{a=a.slice().sort((x,y)=>x-y);return a[a.length>>1];};
const cols=['note','ms','rMin','p95','hors','L','dou','coudes','cretes','infr','droiteS','ess','ct','vril','essTord'];
for(const c of [...new Set(R.map(r=>r.carte))])for(const p of [0,10,20]){const S=R.filter(r=>r.carte===c&&r.pal===p);if(!S.length)continue;
 const line=[];
 for(const k of ['note','ms','p95','hors','droiteS','L']){const v=S.map(r=>r[k]).filter(x=>x!=null&&isFinite(x));const m=med(v);const mad=med(v.map(x=>Math.abs(x-m)))||.01*Math.abs(m)||.01;
   const top=S.filter(r=>r[k]!=null).map(r=>[r.g,r[k],(r[k]-m)/(1.4826*mad)]).sort((a,b)=>b[2]-a[2]).slice(0,3).filter(t=>t[2]>4);
   if(top.length)line.push(k+'(med '+m.toFixed(2)+') '+top.map(t=>'g'+t[0]+'='+t[1]).join(' '));}
 const lo=S.filter(r=>isFinite(r.rMin)).sort((a,b)=>a.rMin-b.rMin).slice(0,2).map(r=>'g'+r.g+'='+r.rMin);
 const ex=['infr','coudes','cretes','dou','zig','ct'].map(k=>{const l=S.filter(r=>r[k]>0);return l.length?k+':'+l.slice(0,8).map(r=>'g'+r.g+'='+r[k]).join(','):null;}).filter(Boolean);
 console.log(c,'p'+p,'|',line.join(' | '),'| rMin bas',lo.join(' '),'|',ex.join(' ; '));}
