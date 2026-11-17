/* CONTRÔLE ADVERSE — attaque 8 : le coût, et les pires routes (est-ce la route, ou le ramasse-miettes ?)
     node temps.cjs carte=jade|espace paliers=0,27 n=300
   Une séance de n routes (après) : les 5 plus lentes sont REJOUÉES seules dans un vm neuf avec la même graine (?pistegraine pour figer le plan est inutile :
   on rejoue la séance jusqu'à elles). Puis avant (ref) sur les mêmes graines. */
const L=require('./lib.cjs');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const carte=arg('carte','jade'),PAL=arg('paliers','0,27').split(',').map(Number),n=+arg('n','300');
const pc=(a,q)=>{const b=a.slice().sort((x,y)=>x-y);return b[Math.min(b.length-1,Math.floor((b.length-1)*q))];};
for(const p of PAL){const G=L.graines(n,0x7E3+p);
  for(const [e,ref] of [['apres',''],['avant','88a648892']]){const M=L.moteur(carte,'',ref);M.raz();for(const g of L.graines(20,0x99))M.route(g,p);
    const T=G.map(g=>{const r=M.route(g,p);return {g,ms:r.ms,rep:r.reprises};});const ms=T.map(t=>t.ms);
    const pires=T.slice().sort((a,b)=>b.ms-a.ms).slice(0,3);
    console.log(carte,e,'p'+p,'· méd '+Math.round(pc(ms,.5))+' · p95 '+Math.round(pc(ms,.95))+' · p99 '+Math.round(pc(ms,.99))+' · pire '+Math.round(Math.max(...ms))+' ms · pires : '+pires.map(t=>'g'+t.g+' '+Math.round(t.ms)+' ms (reprises '+t.rep+')').join(', '));
    if(e==='apres'){const M2=L.moteur(carte,'',ref);M2.raz();for(const t of pires){const r=M2.route(t.g,p);const r2=M2.route(t.g,p);console.log('    rejouée seule g'+t.g+' : '+Math.round(r.ms)+' ms (reprises '+r.reprises+'), puis '+Math.round(r2.ms)+' ms');}}}}
