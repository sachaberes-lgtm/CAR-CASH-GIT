/* (2026-11-18, rôle VOIR) les graines où chaque module de l'espace sort, aux paliers 0 et 10 (vrais générateurs, sac figé comme ?pistegraine=)
   node outils/banc-espace/voir-graines.cjs [n=300] [search=?orbcx=roue] */
const A={};process.argv.slice(2).forEach(x=>{const [k,v]=x.split('=');A[k]=v;});
const B=require('../banc-routes/charge.cjs').creer(A.search?decodeURIComponent(A.search):'?pistegraine=1');
const N=+(A.n||300),out={};
for(const p of [0,10])for(let g=1;g<=N;g++){let r;try{r=B.piste('espace',g,p);}catch(e){continue;}
  const L=r.ctrl.length;const figs=r.marks.map(m=>m.fig||m.k||m.nom).filter(Boolean);
  for(const f of new Set(figs)){const k=f+'@'+p;(out[k]=out[k]||[]).push(g);} if(g===1&&p===0)console.error('marque exemple',JSON.stringify(r.marks[0]));}
const t={};for(const k in out)t[k]=out[k].length+' : '+out[k].slice(0,8).join(',');
console.log(JSON.stringify(t,null,1));
