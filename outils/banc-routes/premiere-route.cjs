/* La PREMIÈRE route d'une partie (pioche vide) pour chaque graine, au palier 0 : humeur et modules — pour choisir des liens de test. node premiere.cjs <racine> <a-b> */
const path=require('path');const RAC=process.argv[2];const [g0,g1]=(process.argv[3]||'1-12').split('-').map(Number);
for(let g=g0;g<=g1;g++){delete require.cache[require.resolve(path.join(RAC,'outils/banc-routes/charge.cjs'))];const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer('');
  const r=B.piste('espace',g,0),Q=r.ctrl,n=Q.length;const S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));
  console.log('g'+g,(B.ctx.window.__orbe||{}).humeur,'·',(r.marks||[]).filter(function(m){return m.fig;}).map(function(m){return m.fig+'@'+Math.round(S[Math.max(0,m.i0)]);}).join(' '));}
