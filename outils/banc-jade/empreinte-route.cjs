/* L'EMPREINTE DE LA ROUTE DE JADE (2026-11-14) : la route ne doit PAS bouger quand on retravaille les formes des îlots (descente Alléluia validée, juge 27/27).
   node outils/banc-jade/empreinte-route.cjs [racine] [graines=1-8] [paliers=0,10,20]
   Une ligne par palier : md5 des points de contrôle (dbgGenRoute = charge.cjs) des N graines, et une ligne par graine avec detail=1.
   À lancer sur le worktree de travail ET sur la référence (wt-avant) : les sommes doivent être les mêmes, caractère pour caractère. Node seul, déterministe. */
const path=require('path'),crypto=require('crypto');
const RAC=path.resolve(process.argv[2]&&!/=/.test(process.argv[2])?process.argv[2]:path.join(__dirname,'..','..'));
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const G=(arg('graines')||'1-8').split('-').map(Number),PAL=(arg('paliers')||'0,10,20').split(',').map(Number),detail=arg('detail')==='1';
const M=require(path.join(RAC,'outils/banc-routes/charge.cjs')),B=M.creer?M.creer(process.env.SEARCH||''):M;
for(const pal of PAL){const h=crypto.createHash('md5');let n=0,err='';const D=[];
  for(let g=G[0];g<=G[1];g++){try{const ctrl=B.piste('jade',g,pal).ctrl,h1=crypto.createHash('md5');
      for(const v of ctrl){const t=v.x.toFixed(2)+','+v.y.toFixed(2)+','+v.z.toFixed(2)+';';h.update(t);h1.update(t);n++;}D.push('g'+g+':'+ctrl.length+':'+h1.digest('hex').slice(0,8));}catch(e){err=String(e&&e.message||e).slice(0,120);}}
  console.log('jade p'+pal,'graines',G.join('-'),'points',n,h.digest('hex').slice(0,16),err);if(detail)console.log('   '+D.join(' '));}
