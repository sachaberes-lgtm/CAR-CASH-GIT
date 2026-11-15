/* lit les sorties du recensement des cadres (banc-maps gen --auditfile=ville-cadres-paliers-page.js) : node ville-cadres-lit.cjs <gen-*.json> [detail=1] */
const fs=require('fs');const f=process.argv[2],det=process.argv.includes('detail=1');const R=JSON.parse(fs.readFileSync(f,'utf8'));
const tot={};
for(const r of R){const p=r.perso;if(!p||typeof p!=='object'){console.log('graine',r.graine,'?',String(p).slice(0,200),r.erreur||'');continue;}
  const l=[];for(const k of ['p0','p10','p20']){const c=p[k];if(!c||typeof c!=='object'){l.push(k+' ?'+String(c).slice(0,80));continue;}
    l.push(k+' barres '+c.barres+' enseignes '+(c.enseignes||0)+' portiques '+c.portiques+' ouvrages '+c.ouvrages+' plafonds '+c.plafonds+' couloirs '+c.couloirs+(c.graineOk===false?' (graine pas prise)':''));
    const t=tot[k]||(tot[k]={barres:0,portiques:0,ouvrages:0,n:0});t.barres+=c.barres;t.enseignes=(t.enseignes||0)+(c.enseignes||0);t.portiques+=c.portiques;t.ouvrages+=c.ouvrages;t.n++;
    if(det){console.log('  g'+r.graine,k,JSON.stringify(c.parSource));for(const e of c.ex)console.log('     ',JSON.stringify(e));}}
  console.log('graine',r.graine,'erreurs',(r.erreurs||[]).length,'·',l.join(' | '));}
console.log('TOTAL',JSON.stringify(tot));
