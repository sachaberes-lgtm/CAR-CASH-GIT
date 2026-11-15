/* L'EMPREINTE DES NORMALES (2026-11-14, l'orbite v7 touche au dévers de pisteTord) : une somme des points ET des normales de la route finale, par carte × palier — pour prouver qu'une
   retouche du dévers d'une map ne penche pas la dalle d'une autre (empreinte.cjs ne somme que les points).
   node outils/banc-routes/normales.cjs <racine> [graines=1-12]      (SEARCH='?espace=v6' pour une variante) */
const path=require('path'),crypto=require('crypto');const RAC=path.resolve(process.argv[2]||'.');
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const a=process.argv.find(function(x){return x.startsWith('graines=');});const G=(a?a.slice(8):'1-12').split('-').map(Number);
for(const c of ['nuages','espace'])for(const p of [0,10,20]){const h=crypto.createHash('md5');let n=0,err='';
  for(let g=G[0];g<=G[1];g++){try{const r=B.piste(c,g,p);for(let i=0;i<r.ctrl.length;i++){const v=r.ctrl[i],q=r.N?r.N[i]:null;h.update(v.x.toFixed(2)+','+v.y.toFixed(2)+','+v.z.toFixed(2)+(q?'|'+q.x.toFixed(4)+','+q.y.toFixed(4)+','+q.z.toFixed(4):'')+';');n++;}}catch(e){err=e.message.slice(0,80);}}
  console.log(c.padEnd(7),'p'+p,'points',n,h.digest('hex').slice(0,12),err);}
