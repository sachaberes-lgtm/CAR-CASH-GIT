/* LE PROFIL D'UN MODULE DE L'ORBITE (2026-11-15) : le long du module `fig` (le lacet par défaut), tous les ~40 m : abscisse, cap en plan (°), pente (%), angle de la dalle au haut du monde (°).
   node outils/banc-routes/lacet-profil.cjs <racine> [graine=1] [palier=0] [fig=lacet]   (SEARCH='?…' pour une variante) */
const path=require('path');const RAC=path.resolve(process.argv[2]||'.');const arg=function(k,d){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):d;};
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const g=+arg('graine',1),p=+arg('palier',0),fig=arg('fig','lacet');const r=B.piste('espace',g,p);
const P=r.ctrl,N=r.N,S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+P[i].distanceTo(P[i-1]));
const m=r.marks.find(function(x){return x.fig===fig;});if(!m){console.log('pas de',fig,'·',r.marks.map(function(x){return x.fig;}).join(' '));process.exit(0);}
const m0=r.marks0.find(function(x){return x.fig===fig;}),S0=[0];for(let i=1;i<r.ctrl0.length;i++)S0.push(S0[i-1]+r.ctrl0[i].distanceTo(r.ctrl0[i-1]));
const k=S[S.length-1]/S0[S0.length-1],a=S0[m0.i0]*k-100,b=S0[m0.i1]*k+100;let last=-1e9;
for(let i=1;i<P.length-1;i++){if(S[i]<a||S[i]>b||S[i]-last<40)continue;last=S[i];const t=P[i+1].clone().sub(P[i-1]).normalize(),n=N[Math.round(i*(N.length-1)/(P.length-1))];
  console.log(Math.round(S[i]),'cap',Math.round(Math.atan2(t.x,t.z)*57.3),'pente',(t.y*100).toFixed(0)+'%','dalle',Math.round(Math.acos(Math.max(-1,Math.min(1,n.y)))*57.3)+'°',S[i]>=a+100&&S[i]<=b-100?'*':'');}
