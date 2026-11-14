/* LE COÛT DU TIRAGE D'UNE ROUTE D'ORBITE EN NODE (genCtrl + pisteTord), en ms : médiane et pire, par palier. Bruité par la charge de la machine : comparer en alternant avant/après.
   node outils/banc-routes/tirage-ms.cjs <racine> [paliers=0,10,20] [graines=1-12] */
const path=require('path');const RAC=path.resolve(process.argv[2]||'.');const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const PAL=(arg('paliers')||'0,10,20').split(',').map(Number),G=(arg('graines')||'1-12').split('-').map(Number);
B.piste('espace',99,0);B.piste('espace',98,0);
for(const p of PAL){const T=[];let pts=0,ess=0;for(let g=G[0];g<=G[1];g++){const t0=performance.now();const r=B.piste('espace',g,p);T.push(performance.now()-t0);pts+=r.ctrl.length;ess+=(r.info&&r.info.essai)|0;}
  T.sort(function(a,b){return a-b;});console.log('palier',p,'· tirage médiane',T[T.length>>1].toFixed(0),'ms · pire',T[T.length-1].toFixed(0),'ms · points de contrôle moy',(pts/T.length).toFixed(0),'· essais de torsion en plus (somme)',ess);}
