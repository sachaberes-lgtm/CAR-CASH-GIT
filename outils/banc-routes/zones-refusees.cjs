/* LES ZONES DE MODULE REFUSÉES PAR pisteTord, EN ORBITE (TORD.info.zones : [fig, a, b, s0, s1, acceptée]) : un module refusé perd son coucher en silence (la dalle reste à plat).
   node outils/banc-routes/zones-refusees.cjs <racine> [paliers=0,5,10,15,20] [graines=1-24] */
const path=require('path');const RAC=path.resolve(process.argv[2]||'.');const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const PAL=(arg('paliers')||'0,5,10,15,20').split(',').map(Number),G=(arg('graines')||'1-24').split('-').map(Number);
for(const p of PAL){const Z={};let nR=0,contacts=0,essais=0;for(let g=G[0];g<=G[1];g++){const r=B.piste('espace',g,p);nR++;const I=r.info||{};contacts+=I.contacts|0;if(I.essai)essais++;
  for(const z of I.zones||[]){const k=z[0];const o=Z[k]||(Z[k]={n:0,ref:0,ex:[]});o.n++;if(!z[5]){o.ref++;if(o.ex.length<3)o.ex.push('g'+g+' ['+z.slice(1,5).join(',')+']');}}}
  console.log('PALIER',p,'·',nR,'routes · contacts restants',contacts,'· routes au 2e essai de torsion ou plus',essais);
  for(const k in Z)console.log('   ',k.padEnd(16),'posées',String(Z[k].n).padStart(3),'· REFUSÉES',String(Z[k].ref).padStart(3),Z[k].ex.join(' '));}
