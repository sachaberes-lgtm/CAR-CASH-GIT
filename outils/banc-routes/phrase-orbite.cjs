/* La phrase d'une route de l'orbite : les tranches (type, position, longueur en s) et les modules posés. node phrase.cjs <racine> <palier> <graines a-b> */
const path=require('path');const RAC=process.argv[2];const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const p=+process.argv[3]||0,[g0,g1]=(process.argv[4]||'1-3').split('-').map(Number);
for(let g=g0;g<=g1;g++){const r=B.piste('espace',g,p),Q=r.ctrl,n=Q.length,vw=r.vw;const S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));
  const PH=B.ctx.window.__phrase,o=B.ctx.window.__orbe||{};
  console.log('g'+g,'p'+p,'L',Math.round(S[n-1]),'m ·',(S[n-1]/vw).toFixed(1),'s · vw',vw.toFixed(0),'· humeur',o.humeur,'· phrase L',PH?Math.round(PH.L):'?','cx',PH?Math.round(PH.cx):'?');
  if(PH)console.log('   tranches :',PH.slots.map(function(s){return s.t+'@'+(s.pos/vw).toFixed(1)+'s'+(s.L?'('+(s.L/vw).toFixed(1)+')':'');}).join(' '));
  console.log('   modules  :',(r.marks||[]).filter(function(m){return m.fig;}).map(function(m){return m.fig+'@'+(S[Math.max(0,m.i0)]/vw).toFixed(1)+'-'+(S[Math.min(n-1,m.i1)]/vw).toFixed(1)+'s';}).join(' '));}
