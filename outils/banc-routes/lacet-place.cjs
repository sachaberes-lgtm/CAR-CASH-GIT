/* LA PLACE DU LACET (2026-11-15) : pour chaque route de l'orbite, la place qui reste avant la rentrée (ex, m), la place du lacet entier (L), l'angle de ses arcs (a, 0 = pas de lacet),
   et si la route a un module de vol (faille, cascade, faille à l'envers) — crochet window.dbgLacJournal d'orbite-modules.js.
   node outils/banc-routes/lacet-place.cjs <racine> [paliers=0] [graines=1-16]   (SEARCH='?…' pour une variante) */
const path=require('path');const RAC=path.resolve(process.argv[2]||'.');const arg=function(k,d){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):d;};
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const PAL=arg('paliers','0').split(',').map(Number),G=arg('graines','1-16').split('-').map(Number);
for(const p of PAL){let nL=0,nV=0,nSans=0,n=0;for(let g=G[0];g<=G[1];g++){B.ctx.dbgLacJournal=[];const r=B.piste('espace',g,p);n++;const J=B.ctx.dbgLacJournal.slice(-1)[0]||{};
  const figs=r.marks0.map(function(m){return m.fig;}),vol=figs.some(function(f){return f==='faille'||f==='cascade'||f==='envers-entree';}),lac=figs.indexOf('lacet')>=0;
  if(lac)nL++;if(vol)nV++;if(!lac&&!vol)nSans++;console.log('p'+p,'g'+g,JSON.stringify(J),lac?'lacet':'-',vol?'vol':'-',figs.join(' '));}
  console.log('p'+p,'lacet',nL+'/'+n,'· module de vol',nV+'/'+n,'· NI L\'UN NI L\'AUTRE',nSans+'/'+n);}
