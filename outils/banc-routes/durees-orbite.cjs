/* (v5.3) La place RÉELLE de chaque module, dans SON unité : les modules qui couchent la dalle en s de vitesse réelle (croisière × élan), les failles et le looping en s de croisière.
   La faille à l'envers : entrée + sortie (réelle) et sa faille (croisière) à part. Et la queue (s réelles) après le dernier module. node durees2.cjs <racine> [paliers] [graines] */
const path=require('path');const RAC=process.argv[2];const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const PAL=(arg('paliers')||'0,5,10,15,20').split(',').map(Number),G=(arg('graines')||'1-30').split('-').map(Number);
const REEL={torsade:1,'grande-torsade':1,surbaisse:1,bobsleigh:1,plongeant:1,'envers-entree':1,'envers-sortie':1};
const D={};const pct=function(a,p){const b=a.slice().sort(function(x,y){return x-y;});return b[Math.min(b.length-1,Math.floor(p*b.length))];};
for(const p of PAL){const el=1.8-.8*Math.min(1,p/25);const qP=[],nP=[];let sv=0,nR=0;
  for(let g=G[0];g<=G[1];g++){const r=B.piste('espace',g,p),vw=r.vw,Q0=r.ctrl0,n0=Q0.length;nR++;const S0=[0];for(let i=1;i<n0;i++)S0.push(S0[i-1]+Q0[i].distanceTo(Q0[i-1]));
    for(const m of (r.marks0||[]).filter(function(m){return m.fig;})){const l=S0[Math.min(n0-1,m.i1)]-S0[Math.max(0,m.i0)],nom=m.fig==='envers-entree'||m.fig==='envers-sortie'?'envers-es':m.fig;
      (D[nom]=D[nom]||[]).push(l/(REEL[m.fig]?vw*el:vw));}
    const Q=r.ctrl,n=Q.length,S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));const mr=(r.marks||[]).filter(function(m){return m.fig;});
    const fin=mr.length?Math.max.apply(null,mr.map(function(m){return S[Math.min(n-1,m.i1)];})):0;qP.push((S[n-1]-fin)/(vw*el));nP.push(mr.length);
    if(!mr.some(function(m){return m.fig==='faille'||m.fig==='cascade'||m.fig==='faille-envers';}))sv++;}
  console.log('palier',p,'· queue (s réelles) max',Math.max.apply(null,qP).toFixed(1),'méd',pct(qP,.5).toFixed(1),'· marques/route min',Math.min.apply(null,nP),'méd',pct(nP,.5),'· sans module de vol',sv+'/'+nR);}
console.log('places (s dans leur unité ; envers-es = entrée OU sortie) : module · n · max · p95 · méd');
for(const k of Object.keys(D).sort())console.log('  ',k.padEnd(15),String(D[k].length).padStart(4),Math.max.apply(null,D[k]).toFixed(2).padStart(7),pct(D[k],.95).toFixed(2).padStart(7),pct(D[k],.5).toFixed(2).padStart(7));
