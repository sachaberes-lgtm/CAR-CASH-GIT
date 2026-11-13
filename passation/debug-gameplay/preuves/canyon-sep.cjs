/* canyon : séparation minimale (en plan) entre deux tronçons à >1200 m d'abscisse l'un de l'autre, hors même marque 'raccourci' — le contrôle `sep>560*SQ` de canyon-route.js:244 */
const fs=require('fs'),path=require('path');const dir=process.argv[2],pal=process.argv[3]||'p0';
const rows=[];
for(const f of fs.readdirSync(dir).filter(f=>f.startsWith('canyon-'+pal+'-'))){const o=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));const C=o.ctrl0,n=C.length;const acc=[0];for(let k=1;k<n;k++)acc[k]=acc[k-1]+Math.hypot(C[k][0]-C[k-1][0],C[k][2]-C[k-1][2]);
 const rac=o.marks.filter(m=>m.fig==='raccourci'||m.k==='raccourci');const inR=i=>{for(let q=0;q<o.marks.length;q++){const m=o.marks[q];if(m.i0<=i&&i<=m.i1)return q;}return -1;};
 let sep=1e9,sepAll=1e9,w=null;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){if(acc[j]-acc[i]<1200)continue;const d=Math.hypot(C[i][0]-C[j][0],C[i][2]-C[j][2]);if(d<sepAll)sepAll=d;const a=inR(i),b=inR(j);if(a>=0&&a===b&&(o.marks[a].fig==='raccourci'||o.marks[a].k==='raccourci'))continue;if(d<sep){sep=d;w=[i,j,a,b];}}
 rows.push({g:+f.match(/-g(\d+)/)[1],sep:Math.round(sep),sepAll:Math.round(sepAll),w,vP:o.vP});}
rows.sort((a,b)=>a.g-b.g);console.log(pal,'n',rows.length,'sep(hors raccourci) min/med/max',Math.min(...rows.map(r=>r.sep)),rows.map(r=>r.sep).sort((a,b)=>a-b)[rows.length>>1],Math.max(...rows.map(r=>r.sep)),'| sans exemption min/med',Math.min(...rows.map(r=>r.sepAll)),rows.map(r=>r.sepAll).sort((a,b)=>a-b)[rows.length>>1]);
console.log(rows.slice(0,4).map(r=>JSON.stringify(r)).join('\n'));
