/* (2026-11-18, rôle VOIR) choisir des graines qui couvrent les modules à regarder (vrais générateurs Node, sac figé) — glouton
   node outils/banc-espace/voir-plan.cjs  → JSON {p0:[[graine,[modules]]…], p10:…, cx:{roue:{p0:[…],p10:[…]}}} */
const {creer}=require('../banc-routes/charge.cjs');
const CIBLES=['fronde','ceinture','balancier','stengel','spirale','pique','marches','bosses','cascade','bobsleigh','plongeant','surbaisse','esse','bosse','chicane'];
const res={};
const S=r=>{const Q=r.ctrl,s=[0];for(let i=1;i<Q.length;i++)s.push(s[i-1]+Q[i].distanceTo(Q[i-1]));return s;};
const B=creer('?pistegraine=1');
for(const p of [0,10]){const par={};for(let g=1;g<=400;g++){let r;try{r=B.piste('espace',g,p);}catch(e){continue;}const s=S(r);par[g]=r.marks.map(m=>[m.fig,Math.round(s[Math.min(s.length-1,m.i0)]),Math.round(s[Math.min(s.length-1,m.i1)])]);}
  const reste=new Set(CIBLES),pris=[];
  while(reste.size){let bg=0,bn=0;for(const g in par){const n=new Set(par[g].map(x=>x[0]).filter(f=>reste.has(f))).size;if(n>bn){bn=n;bg=g;}}if(!bn)break;pris.push([+bg,par[bg].map(x=>x.join(':'))]);par[bg].forEach(x=>reste.delete(x[0]));}
  res['p'+p]=pris;res['manque'+p]=[...reste];}
res.cx={};
for(const cx of ['roue','lune','asteroide','nebuleuse','torsade','sret','failleEnvers']){const Bc=creer('?pistegraine=1&orbcx='+cx);res.cx[cx]={};
  for(const p of [0,10]){const l=[];for(let g=301;g<=306;g++){try{const r=Bc.piste('espace',g,p);const s=S(r);l.push([g,r.marks.map(m=>m.fig+':'+Math.round(s[Math.min(s.length-1,m.i0)])+'-'+Math.round(s[Math.min(s.length-1,m.i1)])).join(' ')]);}catch(e){l.push([g,'err '+e.message]);}}res.cx[cx]['p'+p]=l;}}
console.log(JSON.stringify(res,null,1));
