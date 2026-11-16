/* LA LISTE DES MODULES DE CHAQUE ROUTE DE L'ORBITE (2026-11-15) : par graine, les modules posés (fig@abscisse) et la durée réelle — pour voir où le lacet tient.
   node outils/banc-routes/modules-liste.cjs <racine> [paliers=0] [graines=1-16]   (SEARCH='?…' pour une variante) */
const path=require('path');const RAC=path.resolve(process.argv[2]||'.');const arg=function(k,d){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):d;};
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const PAL=arg('paliers','0').split(',').map(Number),G=arg('graines','1-16').split('-').map(Number);
for(const p of PAL){const cnt={};let n=0;for(let g=G[0];g<=G[1];g++){const r=B.piste('espace',g,p);n++;const figs=r.marks0.map(function(m){return m.fig;});
  for(const f of new Set(figs))cnt[f]=(cnt[f]|0)+1;console.log('p'+p,'g'+g,figs.join(' '));}
  console.log('p'+p,'routes par module :',Object.keys(cnt).sort().map(function(k){return k+' '+cnt[k]+'/'+n;}).join(' · '));}
