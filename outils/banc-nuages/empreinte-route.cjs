/* ===== L'EMPREINTE DE LA ROUTE DES NUAGES (2026-11-14) — la route est validée par Sacha (« keep as is ») : elle ne doit pas bouger d'un bit =====
   node outils/banc-nuages/empreinte-route.cjs [graines=1-20]
   Pour les paliers 0, 10 et 20 : la somme md5 des points de contrôle (toFixed(4)) de la route des nuages sur N graines, et le temps du tirage en Node (ms par route, médiane).
   À lancer AVANT et APRÈS toute retouche des nuages : les trois sommes doivent être identiques. (Charge les vrais morceaux par outils/banc-routes/charge.cjs.) */
const B=require('../banc-routes/charge.cjs'),crypto=require('crypto');
const a=process.argv.find(function(x){return x.startsWith('graines=');});const gg=(a?a.slice(8):'1-20').split('-').map(Number),g0=gg[0],g1=gg[1]||gg[0];
for(const pal of [0,10,20]){const h=crypto.createHash('md5'),ms=[];let n=0,err='';
  for(let g=g0;g<=g1;g++){try{const t0=process.hrtime.bigint(),r=B.piste('nuages',g,pal);ms.push(Number(process.hrtime.bigint()-t0)/1e6);
      for(const v of r.ctrl){h.update(v.x.toFixed(4)+','+v.y.toFixed(4)+','+v.z.toFixed(4)+';');n++;}}catch(e){err=String(e.message).slice(0,120);}}
  ms.sort(function(x,y){return x-y;});
  console.log('nuages palier '+pal+' · graines '+g0+'-'+g1+' · points '+n+' · md5 '+h.digest('hex')+' · tirage médian '+(ms.length?ms[ms.length>>1].toFixed(1):'?')+' ms (max '+(ms.length?ms[ms.length-1].toFixed(1):'?')+')'+(err?' · ERREUR '+err:''));}
