/* Les humeurs des routes d'orbite et le choix du directeur de rythme (meilleur-de-6) : pour chaque graine, l'humeur gardée, les notes des essais, les modules.
   node humeurs-orbite.cjs <racine> [paliers=0] [graines=1-8] */
const path=require('path');const RAC=path.resolve(process.argv[2]);const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const PAL=(arg('paliers')||'0').split(',').map(Number),G=(arg('graines')||'1-8').split('-').map(Number);
for(const p of PAL){const cpt={};
  for(let g=G[0];g<=G[1];g++){const r=B.piste('espace',g,p),o=B.ctx.window.__orbe||{},R=B.ctx.window.dbgRythme?B.ctx.window.dbgRythme():null;cpt[o.humeur]=(cpt[o.humeur]|0)+1;
    console.log('p'+p,'g'+g,String(o.humeur).padEnd(8),'essai',R?R.essai+'/'+R.n:'?','notes',R?R.notes.map(function(x){return x.toFixed(2);}).join(' '):'?','·',(r.marks0||[]).filter(function(m){return m.nom;}).map(function(m){return m.nom.replace(/^(la |le |l')/,'');}).join(', '));}
  console.log('p'+p,'humeurs gardées',JSON.stringify(cpt));}
