/* (v6, 2026-11-14) Les abscisses des photos d'une route d'orbite (la PREMIÈRE route d'une partie : pioche vide, comme `banc.cjs vue`) : l'ouverture, le module à géant
   (fronde, ceinture ; sinon le 1er module), les raccourcis (rac), la rentrée, la plongée. node vues-orbite.cjs <racine> <graines a,b,c> [palier]
   Sortie : une ligne par graine, « g<N> s=<liste> » à passer à banc.cjs vue --s=… (et les modules, pour la légende). */
const path=require('path');const RAC=path.resolve(process.argv[2]);const G=(process.argv[3]||'2').split(',').map(Number),p=+process.argv[4]||0;
for(const g of G){delete require.cache[require.resolve(path.join(RAC,'outils/banc-routes/charge.cjs'))];const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
  const r=B.piste('espace',g,p),Q=r.ctrl,n=Q.length,S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));
  const M=(r.marks||[]).filter(function(m){return m.fig;}).map(function(m){return {fig:m.fig,rac:!!m.rac,a:Math.round(S[Math.max(0,m.i0)]),b:Math.round(S[Math.min(n-1,m.i1)])};});
  const at=function(m,f){return Math.round(m.a+(m.b-m.a)*f);};
  const geant=M.find(function(m){return m.fig==='fronde'||m.fig==='ceinture';})||M[0],rac=M.filter(function(m){return m.rac;}),rt=M.find(function(m){return m.fig==='rentree';}),pl=M.find(function(m){return m.fig==='plongee';});
  const s=[350,geant?at(geant,.3):null].concat(rac.map(function(m){return at(m,.15);}),[rt?at(rt,.3):null,pl?at(pl,.3):null]).filter(function(x){return x!=null;});
  console.log('g'+g,'s='+s.join(','),'·',(B.ctx.window.__orbe||{}).humeur,'·',M.map(function(m){return m.fig+(m.rac?'(rac)':'')+'@'+m.a+'-'+m.b;}).join(' '));}
