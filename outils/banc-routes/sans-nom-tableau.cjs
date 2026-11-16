/* lit la sortie de sans-nom-page.js (banc-maps gen … --auditfile) : node sans-nom-tableau.cjs <gen-*.json> [n=40] [filtre=texte] */
const fs=require('fs');const F=process.argv[2],n=+((process.argv.find(x=>x.startsWith('n='))||'n=40').slice(2)),fl=(process.argv.find(x=>x.startsWith('filtre='))||'').slice(7);
let j=JSON.parse(fs.readFileSync(F,'utf8'));const R=Array.isArray(j)?j:(j.res||[j]);
for(const r of R){let p=r.perso;if(typeof p==='string')p=JSON.parse(p);console.log('graine',r.graine,'objets',p.tous,'invisibles',p.invisibles);
  let T=0,S=0;for(const g of p.groupes){T+=g.tri;S+=g.som;}console.log('  total visible (80 premiers groupes) tri',T,'som',S);
  for(const g of p.groupes.filter(g=>!fl||g.sig.includes(fl)).slice(0,n))console.log('  '+g.sig.padEnd(90).slice(0,90),'n',g.n,'vis',g.vis,'tri',g.tri,'som',g.som,JSON.stringify(g.ex[0]));}
